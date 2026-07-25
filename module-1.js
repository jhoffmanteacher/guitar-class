// ============================================================
//  MODULE 1 — Introductions: You and The Guitar
//  Edit this file to change Module 1 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'w1',
    songThread: [{ name: 'All Along the Watchtower', journey: 'tabs/all-along-the-watchtower.html', layer: 1, note: 'meet the song' }],
    label: 'Set 1',
    locked: false,
    module: 'Introductions: You and The Guitar',
    moduleNum: 1,
    unit: 'Module 1 · Introductions: You and The Guitar',
    unit_es: 'Módulo 1 · Presentaciones: tú y la guitarra',
    title: 'Set 1',
    subtitle: 'My Guitar Adventure · Goal-setting · Your music',
    subtitle_es: 'Mi aventura con la guitarra · Metas · Tu música',
    objective: 'I CAN describe why I want to play guitar and explain what a song that means something to me is doing musically.',
    skillFocus: 'Setting your guitar goals · Listening closely to music you love',
    skillFocus_es: 'Definir tus metas con la guitarra · Escuchar con atención la música que amas',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Reflect',
        title_es: 'Estación de computadora — Mira · Escucha · Reflexiona',
        sections: [
          {
            title: 'Watch the lesson videos',
            title_es: 'Mira los videos de la lección',
            steps: [
          {
            label: 'Sound setup', label_es: 'Configura el sonido',
            text: 'Sound setup (every lesson-video day): get headphones if people are around you, or set a comfortable speaker volume if you\'re on your own. You\'ll switch between watching videos and playing all course long, so make it easy to hear both.',
            text_es: 'Preparación de sonido (cada día de videos de lección): consigue audífonos si hay gente cerca de ti, o pon el volumen de las bocinas a un nivel cómodo si estás solo. Vas a alternar entre ver videos y tocar durante todo el curso, así que facilita escuchar bien ambas cosas.',
            hint: 'Loud enough that you catch every detail, quiet enough that you can still hear your own guitar.',
            hint_es: 'Lo bastante fuerte para captar cada detalle, lo bastante bajo para que también puedas escuchar tu propia guitarra.'
          },
          {
            label: 'Watch: smart practice tips', label_es: 'Mira: consejos de práctica',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=4_CWBgLMPCI" target="_blank">Only Got 15 Min? No Problem! Guitar Practice Tips – Lauren Bateman (0:00–5:00)</a>. While you watch, write down the ONE practice habit she says matters most — you\'ll try it out this session.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=4_CWBgLMPCI" target="_blank">Only Got 15 Min? No Problem! Guitar Practice Tips – Lauren Bateman (0:00–5:00)</a>. Mientras miras, anota el ÚNICO hábito de práctica que ella dice que más importa — lo vas a probar en esta sesión.',
            hint: 'As you watch, think about: what is one practice habit she says makes the biggest difference? Does it match what you thought? You\'ve got it when: you can name that one habit without looking back at your notes.',
            hint_es: 'Mientras miras, piensa: ¿cuál es el hábito de práctica que ella dice que hace la mayor diferencia? ¿Coincide con lo que pensabas? Lo tienes cuando: puedes nombrar ese hábito sin volver a ver tus notas.',
            skills: [1],
            response: { type: 'short', placeholder: 'In one sentence: what practice habit did she say matters most, and did it match what you thought?',
              placeholder_es: 'En una oración: ¿qué hábito de práctica dijo que es el más importante, y coincidió con lo que pensabas?' }
          },
          {
            label: 'Watch: caring for your guitar', label_es: 'Mira: cuidado de la guitarra',
            text: 'Watch: <a href="https://youtu.be/PyWZYHy17As" target="_blank">Caring for Your Acoustic Guitar – Marty Music</a> (you only need the first ~3 minutes — cleaning, humidity, and basic care; after that it\'s a string-changing demo you won\'t need yet). While you watch, note two things that can damage a guitar and how to avoid each — good habits now keep your guitar playable for years.',
            text_es: 'Mira: <a href="https://youtu.be/PyWZYHy17As" target="_blank">Caring for Your Acoustic Guitar – Marty Music</a> (solo necesitas los primeros ~3 minutos — limpieza, humedad y cuidados básicos; después de eso es una demostración de cambio de cuerdas que todavía no necesitas). Mientras miras, anota dos cosas que pueden dañar una guitarra y cómo evitar cada una — los buenos hábitos desde ahora mantienen tu guitarra tocable por años.',
            hint: 'Notice how he handles and stores the guitar. You\'ll practice the safe set-down at the practice station next. You\'ve got it when: you can name two ways to keep a guitar safe.',
            hint_es: 'Fíjate en cómo él manipula y guarda la guitarra. Vas a practicar cómo dejarla con cuidado en la siguiente estación de práctica. Lo tienes cuando: puedes nombrar dos maneras de mantener segura una guitarra.',
            response: { type: 'mc', prompt: 'Which of these does the video call out as a real danger to an acoustic guitar?',
              prompt_es: '¿Cuál de estas opciones menciona el video como un peligro real para una guitarra acústica?',
              answer: 0,
              explain: 'Wood shrinks and can crack when the air gets too dry — that\'s why guitars are stored in cases and kept away from heaters. Wiping the strings after playing keeps sweat from damaging them. Lots of practice, picks, and standing up are all totally safe.',
              explain_es: 'La madera se encoge y se puede agrietar cuando el aire se pone muy seco — por eso las guitarras se guardan en estuches y lejos de calefactores. Limpiar las cuerdas después de tocar evita que el sudor las dañe. Practicar mucho, usar púa y tocar de pie son totalmente seguros.',
              choices: [
              'Dry air — low humidity can crack the wood',
              'Playing it too many hours a day',
              'Strumming with a pick instead of fingers',
              'Practicing while standing up'
            ],
              choices_es: [
              'Aire seco — la humedad baja puede agrietar la madera',
              'Tocarla demasiadas horas al día',
              'Rasguear con púa en vez de con los dedos',
              'Practicar de pie'
            ] }
          }
            ]
          },
          {
            title: 'Listening — find the guitar',
            title_es: 'Escuchar — encuentra la guitarra',
            steps: [
          {
            label: 'Find your song on YouTube', label_es: 'Busca tu canción en YouTube',
            text: '<ol><li>Find a YouTube clip of your song — the one that means something to you (any song you love with guitar in it works).</li><li>As you listen, follow the guitar only — ignore the singing and drums for 30 seconds and track what the guitar is doing.</li></ol>You\'ve got it when: you can describe the guitar\'s job in the song in one sentence.',
            text_es: '<ol><li>Busca en YouTube un clip de tu canción — la que significa algo para ti (sirve cualquier canción que ames que tenga guitarra).</li><li>Mientras escuchas, sigue solo la guitarra — ignora la voz y la batería durante 30 segundos y fíjate en qué está haciendo la guitarra.</li></ol>Lo tienes cuando: puedes describir en una oración el papel de la guitarra en la canción.',
            hint: 'Is it strumming chords? Playing a melody? Both? Just listen — you don\'t need to know the names yet.',
            hint_es: '¿Está rasgueando acordes? ¿Tocando una melodía? ¿Ambas cosas? Solo escucha — todavía no necesitas saber los nombres.',
            levelUp: 'Listen a second time and try to tap along with just the guitar\'s rhythm, ignoring everything else.',
            levelUp_es: 'Escucha una segunda vez e intenta llevar el ritmo solo con el de la guitarra, ignorando todo lo demás.',
            response: { type: 'mc', prompt: 'In the clip you watched, what was the guitar doing?',
              prompt_es: 'En el clip que viste, ¿qué estaba haciendo la guitarra?', choices: [
              'Strumming chords',
              'Playing a melody (single notes)',
              'Both strumming and single notes',
              'Mostly rhythm or percussive sounds'
            ],
              choices_es: [
              'Rasgueando acordes',
              'Tocando una melodía (notas individuales)',
              'Ambas cosas: rasgueo y notas individuales',
              'Sobre todo ritmo o sonidos percusivos'
            ] }
          }
            ]
          },
          {
            title: 'Ear training — acoustic vs. electric',
            title_es: 'Entrenamiento auditivo — acústica vs. eléctrica',
            steps: [
          {
            label: 'Ear training: acoustic vs. electric', label_es: 'Oído: acústica vs. eléctrica',
            text: 'Ear training — acoustic vs. electric. Two short clips play the SAME song, "All Along the Watchtower": <a href="https://www.youtube.com/watch?v=bT7Hj-ea0VE" target="_blank" data-ext="1">Clip 1 — Bob Dylan</a> and <a href="https://www.youtube.com/watch?v=TLV4_xaYynY" target="_blank" data-ext="1">Clip 2 — Jimi Hendrix</a>. As you listen, decide which clip sounds warm and woody and which sounds bright and fuzzy — that\'s the acoustic-vs-electric difference. This song grows with you through the whole course — <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 1 of 5</a>.',
            text_es: 'Entrenamiento auditivo — acústica vs. eléctrica. Dos clips cortos tocan la MISMA canción, "All Along the Watchtower": <a href="https://www.youtube.com/watch?v=bT7Hj-ea0VE" target="_blank" data-ext="1">Clip 1 — Bob Dylan</a> y <a href="https://www.youtube.com/watch?v=TLV4_xaYynY" target="_blank" data-ext="1">Clip 2 — Jimi Hendrix</a>. Mientras escuchas, decide qué clip suena cálido y "de madera" y cuál suena brillante y distorsionado — esa es la diferencia entre acústica y eléctrica. Esta canción crece contigo durante todo el curso — <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 1 de 5</a>.',
            hint: 'Acoustic guitars sound warm and woody. Electric guitars sound brighter and can be distorted or "fuzzy." Same song, very different sound. You\'ve got it when: you can point to the electric clip and say one word for why it sounds different.',
            hint_es: 'Las guitarras acústicas suenan cálidas y "de madera". Las eléctricas suenan más brillantes y pueden sonar distorsionadas. La misma canción, un sonido muy distinto. Lo tienes cuando: puedes señalar el clip eléctrico y decir en una palabra por qué suena diferente.',
            levelUp: 'Find another song you like that has both an acoustic and an electric version, and name which recording is which.',
            levelUp_es: 'Busca otra canción que te guste que tenga una versión acústica y una eléctrica, e identifica cuál es cuál.',
            response: { type: 'mc', prompt: 'Which clip is the electric guitar?',
              prompt_es: '¿Cuál clip tiene la guitarra eléctrica?',
              answer: 1,
              explain: 'Clip 2 is Jimi Hendrix\'s electric version — brighter, with distortion. Clip 1 is Bob Dylan\'s warmer, woodier acoustic.',
              explain_es: 'El Clip 2 es la versión eléctrica de Jimi Hendrix — más brillante, con distorsión. El Clip 1 es la acústica de Bob Dylan, más cálida y "de madera".',
              choices: [
              'Clip 1',
              'Clip 2',
              'They sound identical'
            ],
              choices_es: [
              'Clip 1',
              'Clip 2',
              'Suenan idénticos'
            ] }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — explore the guitar',
        title_es: 'Estación de práctica — explora la guitarra',
        sections: [
          {
            title: 'Get comfortable holding & exploring the guitar',
            title_es: 'Ponte cómodo sosteniendo y explorando la guitarra',
            steps: [
          {
            label: 'Safe handling', label_es: 'Manejo seguro',
            text: 'Safe handling (every session):<ul><li>When you\'re not playing, rest the guitar flat on its back across your lap, or lay it in the case or stand.</li><li>Never lean it against a chair or wall — it can slip and fall.</li><li>Carry it with one hand on the neck and one on the body.</li></ul>You\'ve got it when: you can set the guitar down and pick it up without it wobbling or tipping.',
            text_es: 'Manejo seguro (cada sesión):<ul><li>Cuando no estés tocando, apoya la guitarra boca arriba sobre tu regazo, o déjala en el estuche o en un soporte.</li><li>Nunca la recuestes contra una silla o pared — se puede resbalar y caer.</li><li>Cárgala con una mano en el mástil y otra en el cuerpo.</li></ul>Lo tienes cuando: puedes dejarla y levantarla sin que se tambalee o se caiga.'
          },
          {
            label: 'Your first strum', label_es: 'Tu primer rasgueo',
            text: '<ol><li>Pick up the guitar.</li><li>Hold it in a comfortable position.</li><li>Strum all 6 strings slowly with your thumb — just listen to the sound.</li></ol>You\'ve got it when: the guitar sits steady on your leg and all 6 strings ring when you strum.',
            text_es: '<ol><li>Levanta la guitarra.</li><li>Sostenla en una posición cómoda.</li><li>Rasguea las 6 cuerdas despacio con el pulgar — solo escucha el sonido.</li></ol>Lo tienes cuando: la guitarra queda firme sobre tu pierna y las 6 cuerdas suenan al rasguear.',
            hint: 'Don\'t worry about pressing any frets yet. Just get used to holding it.',
            hint_es: 'No te preocupes todavía por presionar trastes. Solo acostúmbrate a sostenerla.',
            stuck: 'If a string sounds dead, your hand or sleeve might be resting on it. Lift your fretting hand (the hand on the neck — for most players, the left) right off and strum with only your thumb — all six should ring.',
            stuck_es: 'Si una cuerda suena apagada, puede que tu mano o tu manga esté tocándola. Levanta por completo tu mano de trastear (la mano en el mástil — para la mayoría, la izquierda) y rasguea solo con el pulgar — las seis deberían sonar.',
            levelUp: 'Strum slowly from the low E to the high e and back, keeping every string ringing evenly — no string louder or quieter than the others.',
            levelUp_es: 'Rasguea despacio desde la Mi grave hasta la mi aguda y de regreso, manteniendo cada cuerda sonando parejo — ninguna cuerda más fuerte o más baja que las demás.'
          },
          {
            label: 'Find your sitting position', label_es: 'Encuentra tu posición al sentarte',
            text: '<ol><li>Try playing with your foot up on a stool.</li><li>Then try it flat on the ground.</li><li>Keep whichever one lets you sit up straight without gripping the neck to hold the guitar up.</li></ol>You\'ve got it when: you can let go with your fretting hand and the guitar stays put on your leg.<span class="step-figure"><img src="img/posture-check.jpg" alt="Side-view drawing comparing sitting with a footstool (comfortable: back upright, guitar resting steady) to sitting without one (uncomfortable: hunched forward to reach the guitar)."></span>',
            text_es: '<ol><li>Prueba tocar con el pie apoyado en un banquito.</li><li>Luego prueba con el pie plano en el suelo.</li><li>Quédate con la posición que te permita sentarte derecho sin agarrar el mástil para sostener la guitarra.</li></ol>Lo tienes cuando: puedes soltar la mano de trastear y la guitarra se queda quieta sobre tu pierna.<span class="step-figure"><img src="img/posture-check.jpg" alt="Dibujo de perfil comparando sentarse con un banquito para el pie (cómodo: espalda derecha, guitarra firme) con sentarse sin uno (incómodo: encorvado hacia adelante para alcanzar la guitarra)."></span>',
            hint: 'The guitar should balance on your leg, not hang from your hand. Your fretting hand needs to be free to move.',
            hint_es: 'La guitarra debe quedar equilibrada sobre tu pierna, no colgando de tu mano. Tu mano de trastear necesita estar libre para moverse.',
            stuck: 'Rest the narrow waist of the guitar in the dip of your leg so it sits still. If it slides, slide it toward your body until it stops.',
            stuck_es: 'Apoya la parte angosta de la guitarra en el hueco de tu pierna para que quede quieta. Si se resbala, deslízala hacia tu cuerpo hasta que se detenga.',
            levelUp: 'Hold the position with both hands off the neck for 10 seconds while you sit up tall.',
            levelUp_es: 'Mantén la posición con las dos manos lejos del mástil durante 10 segundos mientras te sientas bien derecho.'
          },
          {
            label: 'Explore the guitar\'s sounds', label_es: 'Explora los sonidos de la guitarra',
            text: 'Try:<ul><li>Tapping the body.</li><li>Plucking one string at a time.</li><li>Strumming.</li></ul>What differences do you notice? You\'ve got it when: you can make at least three different sounds and say how they differ.',
            text_es: 'Prueba:<ul><li>Golpear suavemente el cuerpo.</li><li>Pulsar una cuerda a la vez.</li><li>Rasguear.</li></ul>¿Qué diferencias notas? Lo tienes cuando: puedes hacer al menos tres sonidos distintos y decir en qué se diferencian.',
            hint: 'Curiosity is your best tool right now.',
            hint_es: 'La curiosidad es tu mejor herramienta ahora mismo.',
            stuck: 'Start with just two sounds: tap the body once, then pluck one string. Say out loud how they\'re different before you add a third.',
            stuck_es: 'Empieza con solo dos sonidos: golpea el cuerpo una vez, luego pulsa una cuerda. Di en voz alta en qué se diferencian antes de agregar un tercero.',
            levelUp: 'Find a fourth sound nobody near you has tried yet — tap near the bridge, mute a string, slide a finger up a string — and describe it.',
            levelUp_es: 'Encuentra un cuarto sonido que nadie cerca de ti haya probado todavía — golpea cerca del puente, apaga una cuerda, desliza un dedo por una cuerda — y descríbelo.'
          }
            ]
          },
          {
            title: 'Describe why I want to learn guitar',
            title_es: 'Describe por qué quiero aprender guitarra',
            steps: [
          {
            label: 'Write your guitar goal', label_es: 'Escribe tu meta con la guitarra',
            text: 'Type your guitar goal in the box below — we\'ll revisit it at the end of the course. You\'ve got it when: you wrote a goal you can explain in one sentence.',
            text_es: 'Escribe tu meta con la guitarra en el cuadro de abajo — la vamos a repasar al final del curso. Lo tienes cuando: escribiste una meta que puedes explicar en una oración.',
            hint: 'It can be a song you want to play, a skill you want to build, or just a feeling.',
            hint_es: 'Puede ser una canción que quieras tocar, una destreza que quieras desarrollar, o solo un sentimiento.',
            response: { type: 'short', placeholder: 'My guitar goal (one sentence): I want to…',
              placeholder_es: 'Mi meta con la guitarra (una oración): Quiero…' }
          }
            ]
          },
          {
            title: 'My Practice Routine — session check-in (never graded)',
            title_es: 'Mi rutina de práctica — check-in de la sesión (nunca se califica)',
            steps: [
          {
            label: 'Plan your practice routine', label_es: 'Planea tu rutina de práctica',
            text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to write your routine:<ol><li>One thing you want to get better at.</li><li>When and where you\'ll practice next.</li><li>How your last session went (skip that part this first time).</li></ol>We\'ll revisit it every module to see how your plan is working.',
            text_es: 'Planea tu práctica — esta parte es solo para ti, nunca se califica. Tómate dos minutos para escribir tu rutina:<ol><li>Una cosa en la que quieres mejorar.</li><li>Cuándo y dónde vas a practicar la próxima vez.</li><li>Cómo te fue en tu última sesión (sáltate esa parte esta primera vez).</li></ol>La vamos a repasar en cada módulo para ver cómo va tu plan.',
            hint: 'No wrong answers — even five minutes a day is better than one long rushed session. You\'re building a habit you\'ll actually keep.',
            hint_es: 'No hay respuestas incorrectas — hasta cinco minutos al día es mejor que una sola sesión larga y apurada. Estás construyendo un hábito que de verdad vas a mantener.',
            response: { type: 'short', placeholder: '1) One thing to improve   2) When & where I\'ll practice   3) How last week went',
              placeholder_es: '1) Algo que quiero mejorar   2) Cuándo y dónde voy a practicar   3) Cómo me fue la semana pasada' }
          }
            ]
          }
        ]
      }
    },

    songs: [
      { name: 'Student choice — any song that means something to you', meta: 'Listening & sharing day · No playing required', meta_es: 'Día de escuchar y compartir · No necesitas tocar', type: 'Choice', core: false, request: true },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Listen — find the guitar in a current song (Am–C–Dm–F–G/B)', meta_es: 'Escucha — encuentra la guitarra en una canción actual (Am–C–Dm–F–G/B)', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Listen and identify guitar sounds', meta_es: 'Escucha e identifica los sonidos de la guitarra', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Listen — the low-E riff (a short musical phrase that repeats) you\'ll build all course long', meta_es: 'Escucha — el riff en la Mi grave (una frase musical corta que se repite) que vas a construir durante todo el curso', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Listen — a riff-driven song we return to later', meta_es: 'Escucha — una canción basada en un riff a la que volveremos más adelante', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'Listen — our Latin core song, back all course long', meta_es: 'Escucha — nuestra canción principal en español, presente durante todo el curso', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Happy Birthday"', meta: 'First real song — melody on the low E string', meta_es: 'Tu primera canción real — melodía en la cuerda Mi grave', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' }
    ],

    assessment: {
      goal: 'Can describe why they want to learn guitar · Can name one song that matters to them · Can describe what the guitar is doing in a song they love',
      performance: 'Type your guitar goal and your song reflection into the response boxes, then say your "why guitar?" answer out loud in one or two sentences — if you can say it without hesitating, you\'ve learned it.',
      selfCheck: 'Can you name one reason you want to play? Can you name one song you\'d love to play by the end of the year?',
      standards: ['Pr.1a', 'Cn.11a']
    },

    skills: [
      { id: 'w1-s1', text: 'I can describe why I want to learn guitar',
        text_es: 'Puedo describir por qué quiero aprender guitarra',
        gotItWhen: 'you can answer "why guitar?" in one or two sentences without hesitating — and the answer is yours, not someone else\'s.',
        gotItWhen_es: 'puedes responder "¿por qué guitarra?" en una o dos oraciones sin dudar — y la respuesta es tuya, no de alguien más.',
        practice: { type: 'mc', prompt: 'Which of these makes the STRONGEST guitar goal to write down?',
          prompt_es: '¿Cuál de estas es la meta de guitarra MÁS SÓLIDA para escribir?',
          choices: ['A specific goal you care about — like playing a riff from your favorite song', '"Get good at guitar" — the broader the better', 'Whatever song your friend thinks you should learn', 'No goal — goals take the fun out of playing'],
          choices_es: ['Una meta específica que te importa — como tocar un riff de tu canción favorita', '"Volverme bueno con la guitarra" — entre más amplia, mejor', 'La canción que tu amigo cree que deberías aprender', 'Sin meta — las metas le quitan lo divertido a tocar'], answer: 0,
          explain: 'A specific goal that\'s yours tells you exactly what to practice next. Vague or borrowed goals are the ones that fade by week three.',
          explain_es: 'Una meta específica y tuya te dice exactamente qué practicar después. Las metas vagas o prestadas son las que se desvanecen a la tercera semana.' } },
      { id: 'w1-s2', text: 'I can name one song that matters to me',
        text_es: 'Puedo nombrar una canción que es importante para mí',
        gotItWhen: 'you can name the song instantly and say one thing about why it matters to you — no thinking required.',
        gotItWhen_es: 'puedes nombrar la canción al instante y decir una razón por la que te importa — sin tener que pensarlo.',
        practice: { type: 'mc', prompt: 'You\'re picking the one song that matters to you for this course. What\'s the best test that it\'s the right pick?',
          prompt_es: 'Estás eligiendo la canción que es importante para ti en este curso. ¿Cuál es la mejor prueba de que es la elección correcta?',
          choices: ['It\'s simple enough to play in your first week', 'It\'s high on the charts right now', 'You love it and can point to what the guitar is doing in it', 'Your friends would all pick the same song'],
          choices_es: ['Es lo bastante simple para tocarla en tu primera semana', 'Está alta en las listas de popularidad ahora mismo', 'La amas y puedes señalar qué está haciendo la guitarra en ella', 'Todos tus amigos elegirían la misma canción'], answer: 2,
          explain: 'The song\'s job is to keep you motivated, so it has to matter to YOU — how hard it is doesn\'t matter yet. You\'ll grow toward it all course long.',
          explain_es: 'El trabajo de la canción es mantenerte motivado, así que tiene que importarte a TI — lo difícil que sea todavía no importa. Vas a crecer hacia ella durante todo el curso.' } },
      { id: 'w1-s3', text: 'I can describe what the guitar is doing in a song I love',
        text_es: 'Puedo describir qué está haciendo la guitarra en una canción que amo',
        gotItWhen: 'you can name the song and describe the guitar\'s job in it in one sentence — strumming chords, playing a melody, or both.',
        gotItWhen_es: 'puedes nombrar la canción y describir en una oración lo que hace la guitarra — rasguear acordes, tocar una melodía, o ambas cosas.',
        practice: { type: 'mc', prompt: 'A guitarist strums the same chords under the singer for the whole song. Which job is that guitar doing?',
          prompt_es: 'Un guitarrista rasguea los mismos acordes debajo del cantante durante toda la canción. ¿Qué papel está cumpliendo esa guitarra?',
          choices: ['Lead — carrying the main melody', 'Rhythm — keeping the chords and the pulse going', 'Bass — holding down the lowest single notes', 'No real job — it\'s just filling space'],
          choices_es: ['Guitarra líder — llevando la melodía principal', 'Guitarra rítmica — manteniendo los acordes y el pulso', 'Bajo — sosteniendo las notas individuales más graves', 'Ningún papel real — solo está llenando espacio'], answer: 1,
          explain: 'Strumming chords behind the vocal is rhythm guitar — it drives the harmony and the groove. Take it away and the song collapses.',
          explain_es: 'Rasguear acordes detrás de la voz es la guitarra rítmica — impulsa la armonía y el ritmo. Quítala y la canción se derrumba.' } }
    ]
  },

  {
    id: 'w2',
    songThread: [{ name: 'Seven Nation Army', journey: 'tabs/seven-nation-army.html', layer: 1, note: 'meet the riff' }],
    label: 'Set 2',
    locked: false,
    module: 'Introductions: You and The Guitar',
    moduleNum: 1,
    unit: 'Module 1 · Introductions: You and The Guitar',
    unit_es: 'Módulo 1 · Presentaciones: tú y la guitarra',
    title: 'Set 2',
    subtitle: 'Parts of the guitar · Posture · Tuning · First melody',
    subtitle_es: 'Partes de la guitarra · Postura · Afinación · Primera melodía',
    objective: 'I CAN name 5+ parts of the guitar, tune all 6 strings, and play a short melody on the low E string with clean, even notes.',
    skillFocus: 'Guitar parts, posture, and holding a pick · Naming and tuning the strings · Playing a short melody on the low E string',
    skillFocus_es: 'Partes de la guitarra, postura y cómo sostener la púa · Nombrar y afinar las cuerdas · Tocar una melodía corta en la cuerda Mi grave',
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
            label: 'Watch: tuning with a tuner', label_es: 'Mira: afinar con afinador',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=bTvmDGDuUZ4" target="_blank">How to Tune a Guitar for Beginners with a Tuner – Lauren Bateman (0:00–4:30)</a> (this site also has a built-in tuner in the corner toolbar):<ol><li>Have your tuner ready.</li><li>Follow along on your own guitar, matching one string at a time as she goes.</li></ol>',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=bTvmDGDuUZ4" target="_blank">How to Tune a Guitar for Beginners with a Tuner – Lauren Bateman (0:00–4:30)</a> (este sitio también tiene un afinador integrado en la barra de la esquina):<ol><li>Ten tu afinador listo.</li><li>Sigue el video en tu propia guitarra, afinando una cuerda a la vez a medida que ella avanza.</li></ol>',
            hint: 'Headphones on. Notice the order of the strings and what "in tune" sounds like. You\'ve got it when: you can tell whether a note is too high or too low before the tuner shows you.',
            hint_es: 'Ponte los audífonos. Fíjate en el orden de las cuerdas y en cómo suena "afinado". Lo tienes cuando: puedes saber si una nota está muy alta o muy baja antes de que el afinador te lo muestre.',
            stuck: 'Pause after each string and tune just that one before moving on. If the tuner jumps around, pluck a little softer and let the note ring.',
            stuck_es: 'Pausa después de cada cuerda y afina solo esa antes de seguir. Si el afinador salta de un lado a otro, pulsa un poco más suave y deja que la nota suene.',
            levelUp: 'Detune one string on purpose, then bring it back to green by ear first — check the tuner only to confirm.',
            levelUp_es: 'Desafina una cuerda a propósito, y luego vuelve a ponerla en verde primero de oído — usa el afinador solo para confirmar.',
            response: { type: 'mc', prompt: 'If a string\'s pitch is too LOW, which way do you turn the tuning peg?',
              prompt_es: 'Si el tono de una cuerda está muy BAJO, ¿hacia qué lado giras la clavija?',
              answer: 0,
              explain: 'Too low means you need more tension, so tighten the string — the pitch rises up to the target. Loosening would make it even flatter.',
              explain_es: 'Muy bajo significa que necesitas más tensión, así que aprieta la cuerda — el tono sube hasta el objetivo. Aflojarla lo dejaría todavía más bajo.',
              choices: [
              'Tighten it so the pitch rises',
              'Loosen it so the pitch drops',
              'It doesn\'t matter which way',
              'Take the string off and put it back on'
            ],
              choices_es: [
              'Apriétala para que el tono suba',
              'Aflójala para que el tono baje',
              'No importa hacia qué lado',
              'Quita la cuerda y vuelve a ponerla'
            ] }
          },
          {
            label: 'Watch: parts of the guitar', label_es: 'Mira: las partes de la guitarra',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=lWnbBIs6-P4" target="_blank">Parts of Acoustic Guitar (Beginner Lesson #2) – Guitar Goddess (0:00–4:00)</a>. As she names each part, point to it on your own guitar and say the name out loud.',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=lWnbBIs6-P4" target="_blank">Parts of Acoustic Guitar (Beginner Lesson #2) – Guitar Goddess (0:00–4:00)</a>. Mientras ella nombra cada parte, señálala en tu propia guitarra y di el nombre en voz alta.',
            hint: 'Write down 5 parts you can now name from memory. You\'ve got it when: you can point to and name at least 5 parts without the video.',
            hint_es: 'Anota 5 partes que ahora puedas nombrar de memoria. Lo tienes cuando: puedes señalar y nombrar al menos 5 partes sin el video.',
            response: { type: 'mc', prompt: 'Which of these is NOT a part of the guitar?',
              prompt_es: '¿Cuál de estas NO es una parte de la guitarra?',
              answer: 0,
              explain: 'There\'s no "hinge" on a guitar. The body, neck, headstock, frets, strings, tuning pegs, nut, saddle, and bridge are all real parts.',
              explain_es: 'Una guitarra no tiene "bisagra". El cuerpo, el mástil, el clavijero, los trastes, las cuerdas, las clavijas, la cejuela, la selleta y el puente sí son partes reales.',
              choices: [
              'Hinge',
              'Headstock',
              'Saddle',
              'Nut'
            ],
              choices_es: [
              'Bisagra',
              'Clavijero',
              'Selleta',
              'Cejuela'
            ] }
          },
          {
            label: 'Watch: how to hold the guitar', label_es: 'Mira: cómo sostener la guitarra',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=eyrgiiONULE" target="_blank">How to Hold Your Guitar Comfortably – Lauren Bateman (0:00–4:00)</a>. While you watch, set up in your chair and copy her position piece by piece:<ul><li>Feet.</li><li>Guitar on leg.</li><li>Back.</li><li>Strumming arm.</li></ul>',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=eyrgiiONULE" target="_blank">How to Hold Your Guitar Comfortably – Lauren Bateman (0:00–4:00)</a>. Mientras miras, acomódate en tu silla y copia su posición paso a paso:<ul><li>Pies.</li><li>Guitarra sobre la pierna.</li><li>Espalda.</li><li>Brazo de rasgueo.</li></ul>',
            hint: 'Notice where the guitar rests and how the back stays straight. You\'ve got it when: you can look away from the screen and your guitar stays put without your fretting hand holding it up.',
            hint_es: 'Fíjate en dónde descansa la guitarra y en cómo la espalda se mantiene derecha. Lo tienes cuando: puedes dejar de mirar la pantalla y tu guitarra se queda en su lugar sin que tu mano de trastear la sostenga.',
            stuck: 'Pause at each position checkpoint and match one thing at a time: feet flat first, then guitar on the right leg, then straighten the back. Prop up your phone and film a few seconds, then compare yourself to the freeze-frame.',
            stuck_es: 'Pausa en cada punto de la postura y ajusta una cosa a la vez: primero los pies planos, luego la guitarra sobre la pierna derecha, luego endereza la espalda. Apoya tu teléfono y grábate unos segundos, luego compárate con la imagen congelada.',
            levelUp: 'Close your eyes for 10 seconds and keep the position. Or film 10 seconds of yourself playing and name one posture fix.',
            levelUp_es: 'Cierra los ojos por 10 segundos y mantén la posición. O grábate tocando por 10 segundos y nombra un ajuste de postura.',
            response: { type: 'mc', prompt: 'Where should the guitar\'s weight rest when you\'re sitting?',
              prompt_es: '¿Dónde debe descansar el peso de la guitarra cuando estás sentado?',
              answer: 0,
              explain: 'The body of the guitar rests on your leg — your fretting hand should be free to move, not holding the neck up.',
              explain_es: 'El cuerpo de la guitarra descansa sobre tu pierna — tu mano de trastear debe estar libre para moverse, no sosteniendo el mástil.',
              choices: [
              'On your leg — the fretting hand stays free',
              'Held up by your fretting hand',
              'Leaning back against your chest',
              'On the chair\'s armrest'
            ],
              choices_es: [
              'Sobre tu pierna — la mano de trastear queda libre',
              'Sostenida por tu mano de trastear',
              'Recostada contra tu pecho',
              'Sobre el brazo de la silla'
            ] }
          },
          {
            label: 'Watch: how to hold the pick', label_es: 'Mira: cómo agarrar la púa',
            text: 'Watch: <a href="https://www.youtube.com/watch?v=TKO8NLOdSwQ" target="_blank">How To Hold A Guitar Pick for Beginners: Right vs Wrong – Lauren Bateman (0:00–4:00)</a>. Grab a pick and copy her grip as you watch:<ol><li>Rest it on your bent index finger.</li><li>Then press your thumb on top.</li></ol>',
            text_es: 'Mira: <a href="https://www.youtube.com/watch?v=TKO8NLOdSwQ" target="_blank">How To Hold A Guitar Pick for Beginners: Right vs Wrong – Lauren Bateman (0:00–4:00)</a>. Toma una púa y copia su agarre mientras miras:<ol><li>Apóyala sobre tu dedo índice doblado.</li><li>Luego presiona el pulgar encima.</li></ol>',
            hint: 'Write down: what are the two most common pick-holding mistakes? You\'ve got it when: only a small tip of the pick pokes past your thumb and it doesn\'t slip when you strum.',
            hint_es: 'Anota: ¿cuáles son los dos errores más comunes al sostener la púa? Lo tienes cuando: solo asoma una puntita de la púa más allá del pulgar y no se resbala al rasguear.',
            stuck: 'Hold the pick still and just brush it down across the strings with your whole forearm. If it flips or drops, let a little less tip show and relax your grip.',
            stuck_es: 'Mantén la púa quieta y solo pásala hacia abajo por las cuerdas con todo el antebrazo. Si se voltea o se cae, deja asomar un poco menos de punta y relaja el agarre.',
            levelUp: 'Strum down-up-down-up slowly for 30 seconds without the pick sliding or twisting in your fingers.',
            levelUp_es: 'Rasguea abajo-arriba-abajo-arriba despacio durante 30 segundos sin que la púa se resbale o se gire entre tus dedos.',
            response: { type: 'mc', prompt: 'How much of the pick\'s tip should show past your thumb?',
              prompt_es: '¿Cuánta punta de la púa debe asomar más allá del pulgar?',
              answer: 0,
              explain: 'About 3–4 mm — just a small tip. Too much pick makes it flap and catch; too little makes it hard to hit the strings.',
              explain_es: 'Cerca de 3–4 mm — solo una puntita. Demasiada púa hace que se doble y se enganche; muy poca hace difícil golpear las cuerdas.',
              choices: [
              'A small tip, about 3–4 mm',
              'Just 1 mm, almost none',
              'About a centimeter',
              'The whole pick, gripped at the edge'
            ],
              choices_es: [
              'Una puntita, cerca de 3–4 mm',
              'Solo 1 mm, casi nada',
              'Cerca de un centímetro',
              'La púa completa, agarrada por el borde'
            ] }
          }
            ]
          },
          {
            title: 'String names & clean picking',
            title_es: 'Nombres de las cuerdas y pulsación limpia',
            steps: [
          {
            label: 'Name the 6 strings', label_es: 'Nombra las 6 cuerdas',
            text: 'Type the 6 string names from memory, low to high, in the box below. Mnemonic: Eddie Ate Dynamite, Good Bye Eddie. You\'ve got it when: you can type all six in order without peeking at the mnemonic.',
            text_es: 'Escribe de memoria los nombres de las 6 cuerdas, de grave a aguda, en el cuadro de abajo. Regla mnemotécnica: Eddie Ate Dynamite, Good Bye Eddie. Lo tienes cuando: puedes escribir las seis en orden sin mirar la regla mnemotécnica.',
            stuck: 'Type just the first letters — E A D G B E — using "Eddie Ate Dynamite, Good Bye Eddie." Clear it, then type them again from memory.',
            stuck_es: 'Escribe solo las primeras letras — E A D G B E — usando "Eddie Ate Dynamite, Good Bye Eddie". Bórralo, y luego escríbelas otra vez de memoria.',
            levelUp: 'Say the six string names high to low (e B G D A E) without pausing.',
            levelUp_es: 'Di los seis nombres de las cuerdas de aguda a grave (e B G D A E) sin pausar.',
            response: { type: 'short', placeholder: 'The 6 strings, low to high: …',
              placeholder_es: 'Las 6 cuerdas, de grave a aguda: …' }
          },
          {
            label: 'Watch: picking single strings', label_es: 'Mira: pulsar cuerdas sueltas',
            text: 'Watch: <a href="https://youtu.be/Z1ETtvhPqdQ" target="_blank">Picking Individual Strings (BC-166) – JustinGuitar</a>. Copy him on your own guitar — pick one open string over and over, aiming for the same clean sound every time.',
            text_es: 'Mira: <a href="https://youtu.be/Z1ETtvhPqdQ" target="_blank">Picking Individual Strings (BC-166) – JustinGuitar</a>. Cópialo en tu propia guitarra — pulsa una cuerda al aire una y otra vez, buscando el mismo sonido limpio cada vez.',
            hint: 'Watch his picking hand and how light his fretting touch is. Clean single notes are the whole goal of your first melody. You\'ve got it when: you can pick a single string five times and it rings clean every time — no buzz, no catching a neighbor string.',
            hint_es: 'Fíjate en su mano de pulsar y en lo ligero que es su toque al trastear. Las notas individuales limpias son toda la meta de tu primera melodía. Lo tienes cuando: puedes pulsar una sola cuerda cinco veces y suena limpia todas las veces — sin zumbido, sin rozar la cuerda vecina.',
            stuck: 'Rest your picking hand lightly on the guitar and pick just the low E string slowly. If you hit two strings, aim a little more and use a smaller motion.',
            stuck_es: 'Apoya tu mano de pulsar suavemente en la guitarra y pulsa solo la cuerda Mi grave despacio. Si golpeas dos cuerdas, apunta con más cuidado y usa un movimiento más pequeño.',
            levelUp: 'Pick each open string once, low to high, without accidentally brushing the string next door.',
            levelUp_es: 'Pulsa cada cuerda al aire una vez, de grave a aguda, sin rozar por accidente la cuerda de al lado.',
            skills: [6],
            response: { type: 'short', placeholder: 'Which string was easiest to pick cleanly, and which took the most tries?',
              placeholder_es: '¿Qué cuerda fue más fácil de pulsar limpio, y cuál te tomó más intentos?' }
          },
          {
            label: 'Quick try: play and name each string', label_es: 'Prueba rápida: toca y nombra cada cuerda',
            text: 'Quick try: play each open string once, low E to high e, saying the name out loud as you pluck. Just a preview — you\'ll drill these for real at the practice station. You\'ve got it when: you can name each string out loud the instant you pluck it.',
            text_es: 'Prueba rápida: toca cada cuerda al aire una vez, de Mi grave a mi aguda, diciendo el nombre en voz alta al pulsarla. Es solo un adelanto — las vas a practicar de verdad en la estación de práctica. Lo tienes cuando: puedes nombrar cada cuerda en voz alta al instante de pulsarla.',
            hint: 'Hearing + saying + playing helps you memorize it faster than just watching.',
            hint_es: 'Escuchar + decir + tocar te ayuda a memorizar más rápido que solo mirar.',
            stuck: 'Go low to high slowly, checking the mnemonic after each one: E, A, D, G, B, e. Do it twice before you speed up.',
            stuck_es: 'Ve de grave a aguda despacio, revisando la regla mnemotécnica después de cada una: E, A, D, G, B, e. Hazlo dos veces antes de ir más rápido.',
            levelUp: 'Look away, pluck a string at random, and name it from pitch and thickness alone before you peek. Got someone around? Have them pluck one out of your sight instead.',
            levelUp_es: 'Mira hacia otro lado, pulsa una cuerda al azar, y nómbrala solo por el tono y el grosor antes de mirar. ¿Tienes a alguien cerca? Pídele que pulse una sin que la veas.',
            response: { type: 'mc', prompt: 'Say the string names low to high — which comes right after G?',
              prompt_es: 'Di los nombres de las cuerdas de grave a aguda — ¿cuál viene justo después de G?',
              answer: 0,
              explain: 'Low to high it\'s E A D G B e — so B follows G. (Try "Eddie Ate Dynamite, Good Bye Eddie.")',
              explain_es: 'De grave a aguda es E A D G B e — así que B viene después de G. (Prueba con "Eddie Ate Dynamite, Good Bye Eddie".)',
              choices: [
              'B',
              'A',
              'D',
              'e'
            ],
              choices_es: [
              'B',
              'A',
              'D',
              'e'
            ] }
          }
            ]
          },
          {
            title: 'Preview the "Seven Nation Army" riff',
            title_es: 'Adelanto del riff de "Seven Nation Army"',
            steps: [
          {
            label: 'Preview the Seven Nation Army riff', label_es: 'Adelanto del riff de Seven Nation Army',
            text: 'Preview the "Seven Nation Army" riff:<ol><li>Click the note names below the TAB (the little chart below — each number is a fret to press on the low E string; 0 = open) to hear how it should sound.</li><li>Then try just the first few notes to get the feel.</li></ol>Heads up: this site teaches it as straight, even quarter notes — one per beat — to make it easy to count while you\'re learning it; the actual record swings it a bit looser than that, which you\'ll start to hear naturally once the shape feels solid. You\'ll play the whole riff at the practice station. You\'ve got it when: you can match the first three notes to what you heard. This song grows with you through the whole course — <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 1 of 5</a>.',
            text_es: 'Adelanto del riff de "Seven Nation Army":<ol><li>Haz clic en los nombres de las notas debajo del TAB (el pequeño diagrama de abajo — cada número es un traste que debes presionar en la cuerda Mi grave; 0 = al aire) para escuchar cómo debe sonar.</li><li>Luego prueba solo las primeras notas para agarrar la sensación.</li></ol>Aviso: aquí se enseña con negras rectas y parejas — una nota por pulso — para que sea fácil de contar mientras lo aprendes; la grabación original lo toca con un poco más de swing (vaivén) que eso, algo que empezarás a notar de oído en cuanto domines bien la forma. Vas a tocar el riff completo en la estación de práctica. Lo tienes cuando: puedes hacer coincidir las primeras tres notas con lo que escuchaste. Esta canción crece contigo durante todo el curso — <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Recorrido de la canción: esto es la Capa 1 de 5</a>.',
            hint: 'Listen first, then match it — one note at a time. To fret a note, set your fingertip just behind the fret and press firm; if it buzzes, move a little closer to the fret or press harder.',
            hint_es: 'Escucha primero y luego iguálalo — una nota a la vez. Para trastear una nota, coloca la punta del dedo justo detrás del traste y presiona firme; si zumba, acércate un poco más al traste o presiona más fuerte.',
            stuck: 'Just the first two notes: click a note name to hear it, then find it on the low E string. Get those solid before adding the next.',
            stuck_es: 'Solo las primeras dos notas: haz clic en el nombre de una nota para escucharla, y luego encuéntrala en la cuerda Mi grave. Deja esas bien firmes antes de agregar la siguiente.',
            levelUp: 'Play the first four notes in a row, in time, humming the riff as you go.',
            levelUp_es: 'Toca las primeras cuatro notas seguidas, a tiempo, tarareando el riff mientras tocas.',
            response: { type: 'short', placeholder: 'How did the riff sound, and which note was hardest to find?',
              placeholder_es: '¿Cómo sonó el riff, y qué nota fue la más difícil de encontrar?' },
            tab: {
              bpm: 40,
              caption: '"Seven Nation Army" — main riff · Low E string · 7 notes',
              caption_es: '"Seven Nation Army" — riff principal · cuerda Mi grave · 7 notas',
              notes: [
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 10, note: 'D',  midi: 50 },
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                { string: 'E', fret: 3,  note: 'G',  midi: 43 },
                { string: 'E', fret: 2,  note: 'F#', midi: 42 }
              ]
            }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — Challenges',
        title_es: 'Estación de práctica — Retos',
        sections: [
          {
            title: 'Tune all 6 strings with a tuner',
            title_es: 'Afina las 6 cuerdas con un afinador',
            steps: [
          {
            label: 'Challenge: tune all 6 strings', label_es: 'Reto: afina las 6 cuerdas',
            text: 'Challenge 1 — Tune Challenge: get all 6 strings to green on the tuner. Race the timer — can you do it in under 2 minutes? You\'ve got it when: all 6 strings green in under 2 minutes. Log your time so you can try for a faster time next session.',
            text_es: 'Reto 1 — Reto de afinación: pon las 6 cuerdas en verde en el afinador. Compite contra el cronómetro — ¿puedes lograrlo en menos de 2 minutos? Lo tienes cuando: las 6 cuerdas en verde en menos de 2 minutos. Anota tu tiempo para intentar superarlo en la próxima sesión.',
            hint: 'Tune low to high: E A D G B e. Going slowly works better than rushing past the note. Use the play button to hear the target pitches.',
            hint_es: 'Afina de grave a aguda: E A D G B e. Ir despacio funciona mejor que pasarte de largo de la nota. Usa el botón de reproducir para escuchar los tonos objetivo.',
            stuck: 'Tune just one string to green and leave it, then the next. Hit the play button to hear each target pitch first so your ear knows where it\'s headed.',
            stuck_es: 'Afina solo una cuerda hasta que quede en verde y déjala, luego la siguiente. Presiona el botón de reproducir primero para escuchar cada tono objetivo y que tu oído sepa hacia dónde va.',
            levelUp: 'Log this session\'s time and try to make your time 15 seconds faster next session.',
            levelUp_es: 'Anota el tiempo de esta sesión e intenta que sea 15 segundos más rápido la próxima vez.',
            skills: [5],
            playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
          }
            ]
          },
          {
            title: 'Play a melody on the open strings with clean, steady notes',
            title_es: 'Toca una melodía en las cuerdas al aire con notas limpias y constantes',
            steps: [
          {
            label: 'Challenge: one minute, perfect notes', label_es: 'Reto: un minuto, notas perfectas',
            text: 'Challenge 2 — One Minute, Perfect Notes:<ol><li>For one minute, cycle through the open strings low to high (E A D G B e), saying each name out loud as you pluck.</li><li>When the minute\'s up, play one last full pass and count how many of the 6 ring perfectly clean — no buzz, no muting.</li><li>Log your score out of 6 and try for a higher score next time.</li></ol>You\'ve got it when: all 6 ring clean on that final pass.',
            text_es: 'Reto 2 — Un minuto, notas perfectas:<ol><li>Durante un minuto, recorre las cuerdas al aire de grave a aguda (E A D G B e), diciendo cada nombre en voz alta al pulsarla.</li><li>Cuando se acabe el minuto, toca una última vuelta completa y cuenta cuántas de las 6 suenan perfectamente limpias — sin zumbido, sin apagarse.</li><li>Anota tu puntaje sobre 6 e intenta superarlo la próxima vez.</li></ol>Lo tienes cuando: las 6 suenan limpias en esa última vuelta.',
            hint: 'These are open strings — press nothing. Let each string ring fully before moving to the next.',
            hint_es: 'Estas son cuerdas al aire — no presiones nada. Deja que cada cuerda suene por completo antes de pasar a la siguiente.',
            stuck: 'Slow way down — one string every few seconds. Lift any finger that\'s touching a string and let each one ring fully before the next.',
            stuck_es: 'Ve mucho más despacio — una cuerda cada pocos segundos. Levanta cualquier dedo que esté tocando una cuerda y deja que cada una suene por completo antes de la siguiente.',
            levelUp: 'Score 6 clean out of 6 twice in a row, then try it once more with your eyes closed.',
            levelUp_es: 'Logra 6 de 6 limpias dos veces seguidas, y luego inténtalo una vez más con los ojos cerrados.',
            skills: [6]
          },
          {
            label: 'Happy Birthday on the low E', label_es: 'Happy Birthday en la Mi grave',
            text: '<ol><li>Try "Happy Birthday" on the low E string — the tutorial video in the Songs tab walks you through the note sequence, all on one string.</li><li>Practice with the Metronome (floating corner button) set to 60 BPM — beats per minute, one click a second — to keep steady.</li></ol>You\'ve got it when: you can play it start to finish with clean notes and a steady pulse.',
            text_es: '<ol><li>Prueba "Happy Birthday" en la cuerda Mi grave — el video tutorial en la pestaña de Canciones te guía por la secuencia de notas, todo en una sola cuerda.</li><li>Practica con el Metrónomo (botón flotante de la esquina) puesto en 60 BPM — pulsos por minuto, un clic por segundo — para mantenerte constante.</li></ol>Lo tienes cuando: puedes tocarla de principio a fin con notas limpias y un pulso constante.',
            hint: 'Go slow. Clean notes matter more than speed right now.',
            hint_es: 'Ve despacio. Las notas limpias importan más que la velocidad por ahora.',
            stuck: 'Learn it in two halves — get the first phrase clean before you add the second. Drop the metronome to 50 BPM until the notes are smooth.',
            stuck_es: 'Apréndela en dos mitades — deja limpia la primera frase antes de agregar la segunda. Baja el metrónomo a 50 BPM hasta que las notas salgan parejas.',
            levelUp: 'Raise the metronome to 70 BPM, keeping every note clean and in time.',
            levelUp_es: 'Sube el metrónomo a 70 BPM, manteniendo cada nota limpia y a tiempo.',
            skills: [6]
          },
          {
            label: 'Challenge: the Seven Nation Army riff', label_es: 'Reto: el riff de Seven Nation Army',
            text: 'Challenge 3 — Riff Time (try it!): play the "Seven Nation Army" riff on the low E string — slow and clean. You\'ve got it when: all 7 notes in the right order, each ringing clean — speed comes later. No score on this one, just try it. Click any note name below the TAB to hear how it should sound.',
            text_es: 'Reto 3 — Hora del riff (¡pruébalo!): toca el riff de "Seven Nation Army" en la cuerda Mi grave — despacio y limpio. Lo tienes cuando: las 7 notas en el orden correcto, cada una sonando limpia — la velocidad viene después. Este no tiene puntaje, solo pruébalo. Haz clic en cualquier nombre de nota debajo del TAB para escuchar cómo debe sonar.',
            hint: 'Slow and clean is better than fast and buzzy. One note at a time. Set your fingertip just behind the fret and press firm; if it buzzes, move a little closer to the fret or press harder.',
            hint_es: 'Despacio y limpio es mejor que rápido y con zumbido. Una nota a la vez. Coloca la punta del dedo justo detrás del traste y presiona firme; si zumba, acércate un poco más al traste o presiona más fuerte.',
            stuck: 'Break the 7 notes into two chunks and learn the first chunk cold. Click each note name to hear its pitch, then find it before you play on.',
            stuck_es: 'Divide las 7 notas en dos partes y apréndete bien la primera parte. Haz clic en cada nombre de nota para escuchar su tono, y encuéntrala antes de seguir tocando.',
            levelUp: 'Play all 7 notes in time with a slow metronome at 60 BPM, keeping each one clean.',
            levelUp_es: 'Toca las 7 notas a tiempo con el metrónomo despacio a 60 BPM, manteniendo cada una limpia.',
            tab: {
              bpm: 40,
              caption: '"Seven Nation Army" — main riff · Low E string · 7 notes',
              caption_es: '"Seven Nation Army" — riff principal · cuerda Mi grave · 7 notas',
              notes: [
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 10, note: 'D',  midi: 50 },
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                { string: 'E', fret: 3,  note: 'G',  midi: 43 },
                { string: 'E', fret: 2,  note: 'F#', midi: 42 }
              ]
            }
          }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Play the low-E riff — your first core-thread riff', meta_es: 'Toca el riff en la Mi grave — tu primer riff del hilo principal', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Happy Birthday"', meta: 'Play the melody on the low E string — first real song!', meta_es: 'Toca la melodía en la cuerda Mi grave — ¡tu primera canción real!', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Sailor Song" — Gigi Perez', meta: 'Listen — fingerpicked vs. strummed guitar', meta_es: 'Escucha — guitarra punteada con los dedos vs. rasgueada', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=1lrFsXkT_rM',
        tutorialUrl: 'https://www.youtube.com/watch?v=rpoyXduMZZw' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Listen and identify guitar sounds', meta_es: 'Escucha e identifica los sonidos de la guitarra', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Ode to Joy"', meta: 'E string only — great first melody', meta_es: 'Solo la cuerda Mi — una gran primera melodía', type: 'Choice', core: false, level: 1,
        tutorialUrl: 'https://www.youtube.com/watch?v=PRZh_Wv3IQQ' },
      { name: '"Mary Had a Little Lamb"', meta: 'E & A strings', meta_es: 'Cuerdas Mi y La', type: 'Choice', core: false, level: 1,
        tutorialUrl: 'https://www.youtube.com/watch?v=8gK9n9vrt3g' },
      { name: '"Jingle Bells"', meta: 'Open strings only', meta_es: 'Solo cuerdas al aire', type: 'Choice', core: false, level: 1,
        tutorialUrl: 'https://www.youtube.com/watch?v=qM_Yar0xqRk' },
      { name: '"Twinkle Twinkle"', meta: 'E & A strings', meta_es: 'Cuerdas Mi y La', type: 'Choice', core: false, level: 1,
        tutorialUrl: 'https://www.youtube.com/watch?v=NPS5xuRCA6w' },
      { name: '"The Simpsons Theme"', meta: 'E string only', meta_es: 'Solo la cuerda Mi', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=aPzS3QYb868',
        tutorialUrl: 'https://www.youtube.com/watch?v=lGwNWYzYuIk' }
    ],

    assessment: {
      goal: 'Names 5+ parts of the guitar · Holds guitar with correct posture · Holds pick with correct grip · Tunes all 6 strings · Plays a short melody on the E string with clean, steady notes',
      performance: 'Record yourself tuning all six strings, then playing each open string cleanly low to high while naming it. Listen back and self-check: every string green, every note clean, every name right.',
      selfCheck: 'Can you name 5 parts of the guitar? Can you tune all 6 strings with a tuner? Can you play a single note cleanly with no buzzing?',
      standards: ['Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'w2-s1', text: 'Name 5+ parts of the guitar (body, neck, headstock, frets, strings, tuning pegs, nut, saddle, bridge)',
        text_es: 'Nombrar 5 o más partes de la guitarra (cuerpo, mástil, clavijero, trastes, cuerdas, clavijas, cejuela, selleta, puente)',
        gotItWhen: 'you can point to and name each part on a real guitar without checking a diagram.',
        gotItWhen_es: 'puedes señalar y nombrar cada parte en una guitarra real sin revisar un diagrama.',
        practice: { type: 'mc', prompt: 'Which of these is NOT a part of the guitar?',
          prompt_es: '¿Cuál de estas NO es una parte de la guitarra?',
          choices: ['Nut', 'Saddle', 'Hinge', 'Fret'], choices_es: ['Cejuela', 'Selleta', 'Bisagra', 'Traste'], answer: 2 } },
      { id: 'w2-s2', text: 'Hold the guitar with correct sitting posture',
        text_es: 'Sostener la guitarra con la postura correcta al sentarte',
        gotItWhen: 'you can play for 5 minutes straight without slouching, lifting your shoulders, or letting the guitar slip off your leg.',
        gotItWhen_es: 'puedes tocar 5 minutos seguidos sin encorvarte, sin levantar los hombros, y sin que la guitarra se resbale de tu pierna.',
        practice: { type: 'mc', prompt: 'Ten minutes into practice your back aches and your shoulders are up by your ears. What\'s the most likely cause?',
          prompt_es: 'A los diez minutos de práctica te duele la espalda y tus hombros están junto a tus orejas. ¿Cuál es la causa más probable?',
          choices: ['You\'re pressing the frets too hard', 'You\'ve practiced too long without a break', 'You\'re hunching over the guitar to watch your hands', 'The guitar is resting on the wrong leg'],
          choices_es: ['Estás presionando los trastes demasiado fuerte', 'Has practicado demasiado tiempo sin descanso', 'Estás encorvándote sobre la guitarra para mirar tus manos', 'La guitarra está apoyada en la pierna equivocada'], answer: 2,
          explain: 'Curling over to see your fingers is the classic posture trap — sit tall and tilt the guitar\'s neck up slightly instead of bending down to it.',
          explain_es: 'Encorvarse para ver los dedos es la trampa clásica de postura — siéntate derecho e inclina un poco el mástil hacia arriba en vez de agacharte hacia él.' } },
      { id: 'w2-s3', text: 'Hold the pick correctly — 3–4mm of tip showing',
        text_es: 'Sostener la púa correctamente — con 3–4 mm de punta asomando',
        gotItWhen: 'your pick stays put when you strum, only a small tip pokes past your thumb, and your wrist stays relaxed.',
        gotItWhen_es: 'tu púa se mantiene en su lugar al rasguear, solo asoma una puntita más allá del pulgar, y tu muñeca se mantiene relajada.',
        practice: { type: 'mc', prompt: 'How much pick tip should show past your thumb?',
          prompt_es: '¿Cuánta punta de la púa debe asomar más allá del pulgar?',
          choices: ['Just 1 mm', '3–4 mm', 'About a centimeter', 'All of the pick'],
          choices_es: ['Solo 1 mm', '3–4 mm', 'Cerca de un centímetro', 'La púa completa'], answer: 1 } },
      { id: 'w2-s4', text: 'Name all 6 strings from memory (E A D G B e)',
        text_es: 'Nombrar las 6 cuerdas de memoria (E A D G B e)',
        gotItWhen: 'you can say E-A-D-G-B-e low to high — and high to low — without pausing or saying the mnemonic out loud.',
        gotItWhen_es: 'puedes decir E-A-D-G-B-e de grave a aguda — y de aguda a grave — sin pausar ni decir la regla mnemotécnica en voz alta.',
        practice: { type: 'mc', prompt: 'Strings low to high are E A D G B e. Which string sits between A and G?',
          prompt_es: 'Las cuerdas de grave a aguda son E A D G B e. ¿Qué cuerda está entre A y G?',
          choices: ['B', 'D', 'High e', 'Low E'], choices_es: ['B', 'D', 'mi aguda', 'Mi grave'], answer: 1 } },
      { id: 'w2-s5', text: 'Tune all 6 strings with a tuner',
        text_es: 'Afinar las 6 cuerdas con un afinador',
        gotItWhen: 'you can take an out-of-tune guitar and get all 6 strings to green on the tuner in under 2 minutes without help.',
        gotItWhen_es: 'puedes tomar una guitarra desafinada y poner las 6 cuerdas en verde en el afinador en menos de 2 minutos sin ayuda.',
        practice: { type: 'playSeq', label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50,
          notes: [40, 45, 50, 55, 59, 64] } },
      { id: 'w2-s6', text: 'Play a short melody on the E string with clean, steady notes',
        text_es: 'Tocar una melodía corta en la cuerda Mi con notas limpias y constantes',
        gotItWhen: 'you can play the melody all the way through with clean notes and a steady pulse — practice it at 60 BPM with the metronome to keep the timing steady.',
        gotItWhen_es: 'puedes tocar la melodía de principio a fin con notas limpias y un pulso constante — practícala a 60 BPM con el metrónomo para mantener el tiempo estable.',
        practice: { type: 'playSeq', label: 'E string warm-up melody', label_es: 'Melodía de calentamiento en la cuerda Mi', bpm: 60,
          notes: [40, 41, 43, 45, 43, 41, 40] } }
    ]
  }

); // end module-1.js

MODULE_REVIEWS[1] = {
  moduleNum: 1,
  module: 'Introductions: You and The Guitar',
  module_es: 'Presentaciones: tú y la guitarra',
  skills: [
    { id: 'mr1-s1', text: 'I can describe why I want to learn guitar', text_es: 'Puedo describir por qué quiero aprender guitarra', set: 'w1' },
    { id: 'mr1-s2', text: 'I can name 5+ parts of the guitar', text_es: 'Puedo nombrar 5 o más partes de la guitarra', set: 'w2' },
    { id: 'mr1-s3', text: 'I can tune all 6 strings with a tuner', text_es: 'Puedo afinar las 6 cuerdas con un afinador', set: 'w2' },
    { id: 'mr1-s4', text: 'I can play a short melody on the E string with clean, steady notes', text_es: 'Puedo tocar una melodía corta en la cuerda Mi con notas limpias y constantes', set: 'w2' },
    { id: 'mr1-s5', text: 'I can hold the guitar and pick correctly and make every open string ring clean', text_es: 'Puedo sostener la guitarra y la púa correctamente, y hacer que cada cuerda al aire suene limpia', set: 'w2' }
  ],
  assessItems: [
    'Tune all 6 strings to green in under 2 minutes, without restarting',
    'Name all 6 strings from memory — in order and at random',
    'Play each open string with correct posture and pick grip — down-strokes from the wrist, every string ringing full and clean with no accidental muting from either hand'
  ],
  assessItems_es: [
    'Afinar las 6 cuerdas en verde en menos de 2 minutos, sin reiniciar',
    'Nombrar las 6 cuerdas de memoria — en orden y al azar',
    'Tocar cada cuerda al aire con la postura y el agarre de púa correctos — golpes hacia abajo desde la muñeca, cada cuerda sonando plena y limpia sin que ninguna mano la apague sin querer'
  ],
  forward: 'You\'ve got a guitar that\'s in tune, a goal, and your first clean notes — <strong>Module 2 puts names on the frets</strong> so riffs and TAB start making sense. (Already played before, or coming back after a long break? <strong>Module 9, Set 1</strong> is a six-skill re-test that shows you exactly where to start.)',
  forward_es: 'Ya tienes una guitarra afinada, una meta, y tus primeras notas limpias — <strong>el Módulo 2 les pone nombre a los trastes</strong> para que los riffs y el TAB empiecen a tener sentido. (¿Ya tocabas antes, o vuelves después de un descanso largo? <strong>el Módulo 9, Unidad 1</strong> es una reevaluación de seis destrezas que te muestra exactamente por dónde empezar.)',
  standards: ['Pr.1a', 'Pr.4a', 'Pr.5a', 'Cn.11a']
};
