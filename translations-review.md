# Shell translations — EN → ES review sheet

This is every hand-written Spanish string used in the app shell (header, nav
rail, tool popups, skills checklist, buttons/footer). It's generated from the
single source of truth in `i18n.js` — if you want to change any wording, edit
`i18n.js`, not this file (this file is for a bilingual human to spot-check
against, not for editing).

Jonathan doesn't speak Spanish, so this is currently *unreviewed* — hand it to
a bilingual colleague or student aide if you'd like a native-speaker check.

## Glossary — one fixed term per recurring concept

| English | Spanish |
|---|---|
| module | módulo |
| set (a practice set) | unidad |
| station | estación |
| skill | destreza |
| chord | acorde |
| strum (noun/verb) | rasgueo / rasguear |
| fret | traste |
| pick (plectrum) | púa |
| lap (one full pass) | vuelta |
| "Level up" | "Sube de nivel" |
| "You've got it when" | "Lo tienes cuando" |
| "I've got it!" | "¡Ya lo tengo!" |
| BPM / Auto | kept as-is |
| riff (short repeated musical phrase) | riff (kept — common loanword) |
| drill | ejercicio |
| Song Journey | Recorrido de la canción |
| layer (of a Song Journey song) | capa |
| body (of the guitar) | cuerpo |
| neck | mástil |
| headstock | clavijero |
| tuning peg | clavija |
| nut (top of the neck, not a capo) | cejuela |
| saddle | selleta |
| bridge | puente |
| fretting hand | mano de trastear |
| picking hand | mano de pulsar |
| sight-read / sight-reading | leer a primera vista / lectura a primera vista |
| root (of a chord) | raíz |
| home note (of a key, i.e. tonic) | nota base |
| vamp (short repeated chord pattern) | vamp (kept — no clean one-word Spanish equivalent, same treatment as "riff") |
| chug (short muted punchy strum) | chug (kept, same reasoning) |
| boom-chick (split-strum counting mnemonic) | boom-chick (kept as-is, it's onomatopoeia, not a word) |
| beat | tiempo |
| bar / measure | compás |
| barre (guitar technique) | cejilla |
| resolve / resolution (dominant→tonic pull) | resolver / resolución |
| backbeat / offbeat ("+", or accenting beats 2&4) | contratiempo |
| chop (muted punchy reggae upstroke) | picoteo (noun) / picar (verb) |
| groove (steady rhythmic feel) | groove (kept — same loanword treatment as riff/vamp/chug) |

## Header

| English | Spanish |
|---|---|
| Sequoia High School – Beginning Guitar | Sequoia High School – Guitarra para principiantes |
| Independent Practice and Skills Tracker | Práctica independiente y seguimiento de destrezas |
| Find | Buscar |
| Sign in with Google | Iniciar sesión con Google |
| Sign out | Cerrar sesión |

## Auth wall

| English | Spanish |
|---|---|
| Welcome to Guitar Class | Bienvenido a la clase de guitarra |
| Sign in with your school Google account to access your weekly materials and track your progress across any device. | Inicia sesión con tu cuenta de Google de la escuela para acceder a tus materiales semanales y llevar el registro de tu progreso en cualquier dispositivo. |
| Can't reach the sign-in service | No se pudo conectar con el servicio de inicio de sesión |
| The sign-in service couldn't load on this network — a Wi-Fi or content filter may be blocking it. Try again or switch to a different network. | El servicio de inicio de sesión no se pudo cargar en esta red — un filtro de Wi-Fi o de contenido podría estar bloqueándolo. Intenta de nuevo o cambia de red. |
| Try again | Intentar de nuevo |
| Sign-in didn't work — make sure pop-ups are allowed and you're using your school Google account, then try again. | El inicio de sesión no funcionó — asegúrate de permitir ventanas emergentes y de usar tu cuenta de Google de la escuela, luego intenta de nuevo. |

## Nav rail

| English | Spanish |
|---|---|
| Module | Módulo |
| This set | Esta unidad |
| Explore | Explorar |
| Practice | Practicar |
| Games | Juegos |
| Songs | Canciones |
| Keep practicing | Sigue practicando |
| My progress | Mi progreso |
| Module review | Repaso del módulo |
| Set {n} | Unidad {n} |
| Station B | Estación B |
| Watch · Listen · Practice | Mira · Escucha · Practica |
| Station C | Estación C |
| Independent drill | Ejercicio independiente |
| My skills checklist | Mi lista de destrezas |
| Track what you can do | Lleva el registro de lo que ya sabes hacer |
| **Preview mode** — set locks are off for you. Students still see them. | **Modo de vista previa** — los bloqueos de unidades están desactivados para ti. Los estudiantes todavía los ven. |

## Skill status / checklist

| English | Spanish |
|---|---|
| Still working on it | Todavía lo estoy practicando |
| I've got it! | ¡Ya lo tengo! |
| Still learning | Todavía aprendiendo |
| Getting it | Ya le voy agarrando |
| Got it | Ya lo tengo |
| Check each skill as you practice. Use "Still working on it" while you're learning, then mark "I've got it!" once you can do it consistently. | Marca cada destreza mientras practicas. Usa "Todavía lo estoy practicando" mientras la estás aprendiendo, y marca "¡Ya lo tengo!" cuando ya puedas hacerla de forma constante. |
| Skill | Destreza |
| Still<br>working on it | Todavía<br>lo practico |
| I've<br>got it! | Ya<br>lo tengo |
| What does this look like? | ¿Cómo se ve esto? |
| You've got it when: | Lo tienes cuando: |
| Show me where | Muéstrame dónde |

## Progress strings (parameterized)

| English | Spanish |
|---|---|
| {done} of {total} steps done | {done} de {total} pasos completados |
| {done} of {total} skills mastered across all {modules} modules. | {done} de {total} destrezas dominadas en los {modules} módulos. |

## Tools — Metronome / Timer / Tuner

| English | Spanish |
|---|---|
| Metronome | Metrónomo |
| BPM | BPM |
| Count-in (one bar before it starts) | Cuenta regresiva (un compás antes de empezar) |
| Start | Iniciar |
| Stop | Detener |
| Pause | Pausa |
| Reset | Reiniciar |
| Practice Timer | Temporizador de práctica |
| Timer | Temporizador |
| Tuner | Afinador |
| Auto | Auto |
| flat | bemol |
| in tune | afinado |
| sharp | sostenido |
| Play a string… | Toca una cuerda… |
| Listening… | Escuchando… |
| Mic access denied — check browser permissions | Acceso al micrófono denegado — revisa los permisos del navegador |
| In tune ✓ | Afinado ✓ |
| Too high — tune down (sharp) | Muy alta — afina hacia abajo (sostenido) |
| Too low — tune up (flat) | Muy baja — afina hacia arriba (bemol) |
| Noisy room? Pick your string above and play close to the computer. | ¿Sala ruidosa? Elige tu cuerda arriba y toca cerca de la computadora. |

## Buttons & footer

| English | Spanish |
|---|---|
| Mark done | Marcar como hecho |
| Done (with ✓) | Hecho |
| Print this set | Imprimir esta unidad |
| Next: Station C — practice it | Siguiente: Estación C — a practicar |
| Next: My skills checklist | Siguiente: Mi lista de destrezas |
| Next: | Siguiente: |
| Next: Module Review | Siguiente: Repaso del módulo |
| the next set | la siguiente unidad |
| Back to practice | Volver a practicar |
| Back to top | Volver arriba |
| Top | Arriba |
| Report a problem | Reportar un problema |

## Step folds & responses

| English | Spanish |
|---|---|
| Hint | Pista |
| Stuck? | ¿Atascado? |
| Level up | Sube de nivel |
| Your response | Tu respuesta |
| Type your answer here… | Escribe tu respuesta aquí… |
| Play all | Reproducir todo |
| Practice this | Practica esto |
| Correct! | ¡Correcto! |
| Not quite — try again. | Casi — inténtalo de nuevo. |

## Assessment block

| English | Spanish |
|---|---|
| Assessment goal | Objetivo de la evaluación |
| Self-check | Autoevaluación |
| NAfME standards | Estándares NAfME |

## Songs list

| English | Spanish |
|---|---|
| Core — everyone | Básica — para todos |
| Choice menu — pick 1 | Menú a elección — elige 1 |
| easier → harder | más fácil → más difícil |
| Difficulty | Dificultad |
| Beginner | Principiante |
| Intermediate | Intermedio |
| Advanced | Avanzado |
| Original | Original |
| Tutorial | Tutorial |
| Backing track | Pista de acompañamiento |
| Song Journey | Recorrido de la canción |
| Your pick — bring your own song! | Tu elección — ¡trae tu propia canción! |
| Got a song you want to learn? Search YouTube for a beginner tutorial and use this module's skills on it. | ¿Tienes una canción que quieres aprender? Busca en YouTube un tutorial para principiantes y aplica las destrezas de este módulo. |
| Opens in YouTube | Se abre en YouTube |
| Jam track — backing music to play along with; make up your own melody (solo) over it | Pista de acompañamiento — música de fondo para tocar junto con ella; improvisa tu propia melodía (solo) encima. |
| One song, five layers | Una canción, cinco capas |

## Module review (self-assessment)

| English | Spanish |
|---|---|
| Module {n} self-assessment | Autoevaluación del módulo {n} |
| Rate yourself on the module's key skills, then reflect. | Califícate en las destrezas clave del módulo y luego reflexiona. |
| What suddenly made sense this module? | ¿Qué de repente tuvo sentido este módulo? |
| e.g. TAB finally made sense when I slowed it down… | por ejemplo: el TAB por fin tuvo sentido cuando fui más despacio… |
| What's still hard? | ¿Qué sigue siendo difícil? |
| e.g. My ring finger keeps slipping off the fret… | por ejemplo: mi dedo anular se me resbala del traste… |
| Play it & Record it! | ¡Tócala y grábate! |
| Perform a core song from this module — or a song of your choice that uses these skills. Then listen back to your recording and reflect on what could be improved. | Toca una canción principal de este módulo, o una canción de tu elección que use estas destrezas. Luego escucha tu grabación y reflexiona sobre qué podrías mejorar. |
| Song I played | Canción que toqué |
| How did it go? | ¿Cómo te fue? |
| When you're ready, record yourself doing the module assessment, then check the recording against these skills: | Cuando estés listo, grábate haciendo la evaluación del módulo y luego revisa la grabación contra estas destrezas: |
| When you're ready, record yourself performing the skills above and self-check the recording. | Cuando estés listo, grábate haciendo las destrezas de arriba y autoevalúa la grabación. |
| Module {n} Assessment | Evaluación del módulo {n} |
| Why this matters | Por qué esto importa |
| Preview only. | Solo vista previa. |
| Mark every skill on every set as "I've got it!" to unlock this self-assessment. | Marca cada destreza de cada unidad como "¡Ya lo tengo!" para desbloquear esta autoevaluación. |
| Review this | Repasar esto |

## 10-minute practice routine card

| English | Spanish |
|---|---|
| Your 10-minute practice routine | Tu rutina de práctica de 10 minutos |
| Print | Imprimir |
| Built from this module's sets — short on time? Do steps 1–3 — that's still good. | Armada con las unidades de este módulo — ¿poco tiempo? Haz los pasos 1–3 — ya es una buena práctica. |
| Tune up | Afina |
| — open the Tuner (corner button) and tune all six strings until the tuner turns green. | — abre el Afinador (botón de la esquina) y afina las seis cuerdas hasta que el afinador se ponga verde. |
| Finger Gym | Gimnasia de dedos |
| Skill drill | Ejercicio de destreza |
| Chord / scale work | Trabajo de acordes / escalas |
| Song | Canción |
| Open this set | Abrir esta unidad |
| Play it | Tócalo |

## TAB blocks

| English | Spanish |
|---|---|
| Tab | Tab |
| Play tab | Tocar el tab |
| Show TAB: | Mostrar TAB: |

## Song-thread lede (Set header)

| English | Spanish |
|---|---|
| This set adds a bonus layer for: | Esta unidad agrega una capa extra para: |
| This set builds Layer {n} of 5 for: | Esta unidad construye la Capa {n} de 5 para: |
| This set grows: | Esta unidad hace crecer: |

## Other module-content chrome

| English | Spanish |
|---|---|
| First time on this set? Do {Station B} first — watch the lessons, then come back here and drill. Back on another day just to practice? Perfect — practicing on different days helps you remember. | ¿Primera vez en esta unidad? Primero haz {Estación B} — mira las lecciones y luego vuelve aquí a practicar. ¿Volviste otro día solo a practicar? Perfecto — practicar en días distintos te ayuda a recordar mejor. |
| No skills listed for this set yet. | Todavía no hay destrezas para esta unidad. |
| Tune and warm up first: today's Daily 5 has tuning, a finger warm-up, and one drill (a short exercise you repeat to build a skill) from this module — five minutes and your hands are ready. | Primero afina y calienta: el Daily 5 de hoy tiene afinación, un calentamiento de dedos, y un ejercicio de este módulo — cinco minutos y tus manos estarán listas. |
| Open today's Daily 5 | Abrir el Daily 5 de hoy |

## Known gaps (not yet hand-translated — still Google-Translate-only)

These are lower-traffic microcopy the task didn't explicitly call out, left
for a future pass rather than guessed at: locked-set gate/toast messages
("Finish Set 2 first…"), tooltips on locked pills, the Games/Songs Hub/Keep
practicing/My progress panel *contents* (only their nav-rail buttons are
translated — these panels sit outside `.week-panel` so they're still fully
Google-Translate-covered, same as before phase 2), the Daily 5 modal, the
"Report a problem" email body, the module-review recording widget ("Record",
"Up to 90 seconds. Browser will ask for microphone permission.") in
`renderRecBody()`, and the aria-only `aria-label` strings on the
skills-checklist cells (their `title` tooltip *is* translated — the fuller
aria-label used by screen readers is not).

---

# Module content — EN → ES review sheet (phase 2)

Hand-written Spanish for the twelve modules' actual lesson content (set
titles, step text, hints, skills, songs, assessments — the `_es` fields on
each module's data, picked up by `tf()` in `app.js`; see CLAUDE.md's
"module/lesson content" i18n section for the full architecture). Translated
one or two modules per session; each module gets its own section below,
added in the same session its `module-N.js` is marked `i18nComplete`.

Jonathan doesn't speak Spanish, so — same as the shell table above — this is
currently *unreviewed*. Hand it to a bilingual colleague or student aide if
you'd like a native-speaker check.

## Module 1 — Introductions: You and The Guitar

### Set 1

| English | Spanish |
|---|---|
| unit: Module 1 · Introductions: You and The Guitar | Módulo 1 · Presentaciones: tú y la guitarra |
| subtitle: My Guitar Adventure · Goal-setting · Your music | Mi aventura con la guitarra · Metas · Tu música |
| skillFocus: Setting your guitar goals · Listening closely to music you love | Definir tus metas con la guitarra · Escuchar con atención la música que amas |
| Station B title: Computer station — Watch · Listen · Reflect | Estación de computadora — Mira · Escucha · Reflexiona |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listening — find the guitar | Escuchar — encuentra la guitarra |
| Section title: Ear training — acoustic vs. electric | Entrenamiento auditivo — acústica vs. eléctrica |
| Station C title: Practice station — explore the guitar | Estación de práctica — explora la guitarra |
| Section title: Get comfortable holding & exploring the guitar | Ponte cómodo sosteniendo y explorando la guitarra |
| Section title: Describe why I want to learn guitar | Describe por qué quiero aprender guitarra |
| Section title: My Practice Routine — session check-in (never graded) | Mi rutina de práctica — check-in de la sesión (nunca se califica) |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Sound setup (every lesson-video day): get headphones if people are around you, or set a comfortable speaker volume if you're on your own. You'll switch between watching videos and playing all course long, so make it easy to hear both. | Preparación de sonido (cada día de videos de lección): consigue audífonos si hay gente cerca de ti, o pon el volumen de las bocinas a un nivel cómodo si estás solo. Vas a alternar entre ver videos y tocar durante todo el curso, así que facilita escuchar bien ambas cosas. |
| hint: Loud enough that you catch every detail, quiet enough that you can still hear your own guitar. | Lo bastante fuerte para captar cada detalle, lo bastante bajo para que también puedas escuchar tu propia guitarra. |
| text: Watch: "Only Got 15 Min? No Problem! Guitar Practice Tips – Lauren Bateman (0:00–5:00)". While you watch, write down the ONE practice habit she says matters most — you'll try it out this session. | Mira: "Only Got 15 Min? No Problem! Guitar Practice Tips – Lauren Bateman (0:00–5:00)". Mientras miras, anota el ÚNICO hábito de práctica que ella dice que más importa — lo vas a probar en esta sesión. |
| hint: As you watch, think about: what is one practice habit she says makes the biggest difference? Does it match what you thought? You've got it when: you can name that one habit without looking back at your notes. | Mientras miras, piensa: ¿cuál es el hábito de práctica que ella dice que hace la mayor diferencia? ¿Coincide con lo que pensabas? Lo tienes cuando: puedes nombrar ese hábito sin volver a ver tus notas. |
| response placeholder: In one sentence: what practice habit did she say matters most, and did it match what you thought? | En una oración: ¿qué hábito de práctica dijo que es el más importante, y coincidió con lo que pensabas? |
| text: Watch: "Caring for Your Acoustic Guitar – Marty Music" (you only need the first ~3 minutes — cleaning, humidity, and basic care; after that it's a string-changing demo you won't need yet). While you watch, note two things that can damage a guitar and how to avoid each — good habits now keep your guitar playable for years. | Mira: "Caring for Your Acoustic Guitar – Marty Music" (solo necesitas los primeros ~3 minutos — limpieza, humedad y cuidados básicos; después de eso es una demostración de cambio de cuerdas que todavía no necesitas). Mientras miras, anota dos cosas que pueden dañar una guitarra y cómo evitar cada una — los buenos hábitos desde ahora mantienen tu guitarra tocable por años. |
| hint: Notice how he handles and stores the guitar. You'll practice the safe set-down at the practice station next. You've got it when: you can name two ways to keep a guitar safe. | Fíjate en cómo él manipula y guarda la guitarra. Vas a practicar cómo dejarla con cuidado en la siguiente estación de práctica. Lo tienes cuando: puedes nombrar dos maneras de mantener segura una guitarra. |
| response prompt: Which of these does the video call out as a real danger to an acoustic guitar? | ¿Cuál de estas opciones menciona el video como un peligro real para una guitarra acústica? |
| response explain: Wood shrinks and can crack when the air gets too dry — that's why guitars are stored in cases and kept away from heaters. Wiping the strings after playing keeps sweat from damaging them. Lots of practice, picks, and standing up are all totally safe. | La madera se encoge y se puede agrietar cuando el aire se pone muy seco — por eso las guitarras se guardan en estuches y lejos de calefactores. Limpiar las cuerdas después de tocar evita que el sudor las dañe. Practicar mucho, usar púa y tocar de pie son totalmente seguros. |
| response choices: Dry air — low humidity can crack the wood / Playing it too many hours a day / Strumming with a pick instead of fingers / Practicing while standing up | Aire seco — la humedad baja puede agrietar la madera / Tocarla demasiadas horas al día / Rasguear con púa en vez de con los dedos / Practicar de pie |

**Station B — Listening — find the guitar**

| English | Spanish |
|---|---|
| text: Find a YouTube clip of your song — the one that means something to you (any song you love with guitar in it works). As you listen, follow the guitar only — ignore the singing and drums for 30 seconds and track what the guitar is doing. You've got it when: you can describe the guitar's job in the song in one sentence. | Busca en YouTube un clip de tu canción — la que significa algo para ti (sirve cualquier canción que ames que tenga guitarra). Mientras escuchas, sigue solo la guitarra — ignora la voz y la batería durante 30 segundos y fíjate en qué está haciendo la guitarra. Lo tienes cuando: puedes describir en una oración el papel de la guitarra en la canción. |
| hint: Is it strumming chords? Playing a melody? Both? Just listen — you don't need to know the names yet. | ¿Está rasgueando acordes? ¿Tocando una melodía? ¿Ambas cosas? Solo escucha — todavía no necesitas saber los nombres. |
| levelUp: Listen a second time and try to tap along with just the guitar's rhythm, ignoring everything else. | Escucha una segunda vez e intenta llevar el ritmo solo con el de la guitarra, ignorando todo lo demás. |
| response prompt: In the clip you watched, what was the guitar doing? | En el clip que viste, ¿qué estaba haciendo la guitarra? |
| response choices: Strumming chords / Playing a melody (single notes) / Both strumming and single notes / Mostly rhythm or percussive sounds | Rasgueando acordes / Tocando una melodía (notas individuales) / Ambas cosas: rasgueo y notas individuales / Sobre todo ritmo o sonidos percusivos |

**Station B — Ear training — acoustic vs. electric**

| English | Spanish |
|---|---|
| text: Ear training — acoustic vs. electric. Two short clips play the SAME song, "All Along the Watchtower": Clip 1 — Bob Dylan and Clip 2 — Jimi Hendrix. As you listen, decide which clip sounds warm and woody and which sounds bright and fuzzy — that's the acoustic-vs-electric difference. This song grows with you through the whole course — Song Journey: this is Layer 1 of 5. | Entrenamiento auditivo — acústica vs. eléctrica. Dos clips cortos tocan la MISMA canción, "All Along the Watchtower": Clip 1 — Bob Dylan y Clip 2 — Jimi Hendrix. Mientras escuchas, decide qué clip suena cálido y "de madera" y cuál suena brillante y distorsionado — esa es la diferencia entre acústica y eléctrica. Esta canción crece contigo durante todo el curso — Recorrido de la canción: esto es la Capa 1 de 5. |
| hint: Acoustic guitars sound warm and woody. Electric guitars sound brighter and can be distorted or "fuzzy." Same song, very different sound. You've got it when: you can point to the electric clip and say one word for why it sounds different. | Las guitarras acústicas suenan cálidas y "de madera". Las eléctricas suenan más brillantes y pueden sonar distorsionadas. La misma canción, un sonido muy distinto. Lo tienes cuando: puedes señalar el clip eléctrico y decir en una palabra por qué suena diferente. |
| levelUp: Find another song you like that has both an acoustic and an electric version, and name which recording is which. | Busca otra canción que te guste que tenga una versión acústica y una eléctrica, e identifica cuál es cuál. |
| response prompt: Which clip is the electric guitar? | ¿Cuál clip tiene la guitarra eléctrica? |
| response explain: Clip 2 is Jimi Hendrix's electric version — brighter, with distortion. Clip 1 is Bob Dylan's warmer, woodier acoustic. | El Clip 2 es la versión eléctrica de Jimi Hendrix — más brillante, con distorsión. El Clip 1 es la acústica de Bob Dylan, más cálida y "de madera". |
| response choices: Clip 1 / Clip 2 / They sound identical | Clip 1 / Clip 2 / Suenan idénticos |

**Station C — Get comfortable holding & exploring the guitar**

| English | Spanish |
|---|---|
| text: Safe handling (every session): when you're not playing, rest the guitar flat on its back across your lap, or lay it in the case or stand. Never lean it against a chair or wall — it can slip and fall. Carry it with one hand on the neck and one on the body. You've got it when: you can set the guitar down and pick it up without it wobbling or tipping. | Manejo seguro (cada sesión): cuando no estés tocando, apoya la guitarra boca arriba sobre tu regazo, o déjala en el estuche o en un soporte. Nunca la recuestes contra una silla o pared — se puede resbalar y caer. Cárgala con una mano en el mástil y otra en el cuerpo. Lo tienes cuando: puedes dejarla y levantarla sin que se tambalee o se caiga. |
| hint: A guitar that falls can crack its neck. A little care keeps your guitar playable for years. | Una guitarra que se cae puede agrietar el mástil. Un poco de cuidado la mantiene tocable por años. |
| stuck: Practice just the set-down first: two hands, lower it slowly onto its back, let go. Then just the pick-up. Watch the guitar as you release it — if it wobbles, slow the set-down way down. | Practica primero solo el dejarla: con las dos manos, bájala despacio boca arriba y suéltala. Luego practica solo el levantarla. Obsérvala mientras la sueltas — si se tambalea, hazlo mucho más despacio. |
| levelUp: Set it down and pick it up three times in a row, smooth and quiet each time — no clunks against the chair. | Déjala y levántala tres veces seguidas, suave y en silencio cada vez — sin golpes contra la silla. |
| text: Pick up the guitar. Hold it in a comfortable position. Strum all 6 strings slowly with your thumb — just listen to the sound. You've got it when: the guitar sits steady on your leg and all 6 strings ring when you strum. | Levanta la guitarra. Sostenla en una posición cómoda. Rasguea las 6 cuerdas despacio con el pulgar — solo escucha el sonido. Lo tienes cuando: la guitarra queda firme sobre tu pierna y las 6 cuerdas suenan al rasguear. |
| hint: Don't worry about pressing any frets yet. Just get used to holding it. | No te preocupes todavía por presionar trastes. Solo acostúmbrate a sostenerla. |
| stuck: If a string sounds dead, your hand or sleeve might be resting on it. Lift your fretting hand (the hand on the neck — for most players, the left) right off and strum with only your thumb — all six should ring. | Si una cuerda suena apagada, puede que tu mano o tu manga esté tocándola. Levanta por completo tu mano de trastear (la mano en el mástil — para la mayoría, la izquierda) y rasguea solo con el pulgar — las seis deberían sonar. |
| levelUp: Strum slowly from the low E to the high e and back, keeping every string ringing evenly — no string louder or quieter than the others. | Rasguea despacio desde la Mi grave hasta la mi aguda y de regreso, manteniendo cada cuerda sonando parejo — ninguna cuerda más fuerte o más baja que las demás. |
| text: Try playing with your foot up on a stool, then flat on the ground. Keep whichever one lets you sit up straight without gripping the neck to hold the guitar up. You've got it when: you can let go with your fretting hand and the guitar stays put on your leg. | Prueba tocar con el pie apoyado en un banquito, y luego con el pie plano en el suelo. Quédate con la posición que te permita sentarte derecho sin agarrar el mástil para sostener la guitarra. Lo tienes cuando: puedes soltar la mano de trastear y la guitarra se queda quieta sobre tu pierna. |
| image alt: Side-view drawing comparing sitting with a footstool (comfortable: back upright, guitar resting steady) to sitting without one (uncomfortable: hunched forward to reach the guitar). | Dibujo de perfil comparando sentarse con un banquito para el pie (cómodo: espalda derecha, guitarra firme) con sentarse sin uno (incómodo: encorvado hacia adelante para alcanzar la guitarra). |
| hint: The guitar should balance on your leg, not hang from your hand. Your fretting hand needs to be free to move. | La guitarra debe quedar equilibrada sobre tu pierna, no colgando de tu mano. Tu mano de trastear necesita estar libre para moverse. |
| stuck: Rest the narrow waist of the guitar in the dip of your leg so it sits still. If it slides, slide it toward your body until it stops. | Apoya la parte angosta de la guitarra en el hueco de tu pierna para que quede quieta. Si se resbala, deslízala hacia tu cuerpo hasta que se detenga. |
| levelUp: Hold the position with both hands off the neck for 10 seconds while you sit up tall. | Mantén la posición con las dos manos lejos del mástil durante 10 segundos mientras te sientas bien derecho. |
| text: Try tapping the body, plucking one string at a time, and strumming. What differences do you notice? You've got it when: you can make at least three different sounds and say how they differ. | Prueba golpear suavemente el cuerpo, pulsar una cuerda a la vez, y rasguear. ¿Qué diferencias notas? Lo tienes cuando: puedes hacer al menos tres sonidos distintos y decir en qué se diferencian. |
| hint: Curiosity is your best tool right now. | La curiosidad es tu mejor herramienta ahora mismo. |
| stuck: Start with just two sounds: tap the body once, then pluck one string. Say out loud how they're different before you add a third. | Empieza con solo dos sonidos: golpea el cuerpo una vez, luego pulsa una cuerda. Di en voz alta en qué se diferencian antes de agregar un tercero. |
| levelUp: Find a fourth sound nobody near you has tried yet — tap near the bridge, mute a string, slide a finger up a string — and describe it. | Encuentra un cuarto sonido que nadie cerca de ti haya probado todavía — golpea cerca del puente, apaga una cuerda, desliza un dedo por una cuerda — y descríbelo. |

**Station C — Describe why I want to learn guitar**

| English | Spanish |
|---|---|
| text: Type your guitar goal in the box below — we'll revisit it at the end of the course. You've got it when: you wrote a goal you can explain in one sentence. | Escribe tu meta con la guitarra en el cuadro de abajo — la vamos a repasar al final del curso. Lo tienes cuando: escribiste una meta que puedes explicar en una oración. |
| hint: It can be a song you want to play, a skill you want to build, or just a feeling. | Puede ser una canción que quieras tocar, una destreza que quieras desarrollar, o solo un sentimiento. |
| response placeholder: My guitar goal (one sentence): I want to… | Mi meta con la guitarra (una oración): Quiero… |

**Station C — My Practice Routine — session check-in (never graded)**

| English | Spanish |
|---|---|
| text: Plan your practice — this one's just for you, never graded. Take two minutes to write your routine: (1) one thing you want to get better at, (2) when and where you'll practice next, (3) how your last session went (skip that part this first time). We'll revisit it every module to see how your plan is working. | Planea tu práctica — esta parte es solo para ti, nunca se califica. Tómate dos minutos para escribir tu rutina: (1) una cosa en la que quieres mejorar, (2) cuándo y dónde vas a practicar la próxima vez, (3) cómo te fue en tu última sesión (sáltate esa parte esta primera vez). La vamos a repasar en cada módulo para ver cómo va tu plan. |
| hint: No wrong answers — even five minutes a day is better than one long rushed session. You're building a habit you'll actually keep. | No hay respuestas incorrectas — hasta cinco minutos al día es mejor que una sola sesión larga y apurada. Estás construyendo un hábito que de verdad vas a mantener. |
| response placeholder: 1) One thing to improve   2) When & where I'll practice   3) How last week went | 1) Algo que quiero mejorar   2) Cuándo y dónde voy a practicar   3) Cómo me fue la semana pasada |

**Set 1 — Songs**

| English | Spanish |
|---|---|
| Student choice — any song that means something to them — meta: Listening & sharing day · No playing required | Día de escuchar y compartir · No necesitas tocar |
| "the cure" — Olivia Rodrigo — meta: Listen — find the guitar in a current song (Am–C–Dm–F–G/B) | Escucha — encuentra la guitarra en una canción actual (Am–C–Dm–F–G/B) |
| "All Along the Watchtower" — Dylan / Hendrix — meta: Listen and identify guitar sounds | Escucha e identifica los sonidos de la guitarra |
| "Seven Nation Army" — The White Stripes — meta: Listen — the low-E riff (a short musical phrase that repeats) you'll build all course long | Escucha — el riff en la Mi grave (una frase musical corta que se repite) que vas a construir durante todo el curso |
| "Sweet Child O' Mine" — Guns N' Roses — meta: Listen — a riff-driven song we return to later | Escucha — una canción basada en un riff a la que volveremos más adelante |
| "Luna" — Peso Pluma, Junior H — meta: Listen — our Latin core song, back all course long | Escucha — nuestra canción principal en español, presente durante todo el curso |
| "Happy Birthday" — meta: First real song — melody on the low E string | Tu primera canción real — melodía en la cuerda Mi grave |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| w1-s1 text: I can describe why I want to learn guitar | Puedo describir por qué quiero aprender guitarra |
| w1-s1 gotItWhen: you can answer "why guitar?" in one or two sentences without hesitating — and the answer is yours, not someone else's. | puedes responder "¿por qué guitarra?" en una o dos oraciones sin dudar — y la respuesta es tuya, no de alguien más. |
| w1-s2 text: I can name one song that matters to me | Puedo nombrar una canción que es importante para mí |
| w1-s2 gotItWhen: you can name the song instantly and say one thing about why it matters to you — no thinking required. | puedes nombrar la canción al instante y decir una razón por la que te importa — sin tener que pensarlo. |
| w1-s3 text: I can describe what the guitar is doing in a song I love | Puedo describir qué está haciendo la guitarra en una canción que amo |
| w1-s3 gotItWhen: you can name the song and describe the guitar's job in it in one sentence — strumming chords, playing a melody, or both. | puedes nombrar la canción y describir en una oración lo que hace la guitarra — rasguear acordes, tocar una melodía, o ambas cosas. |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 1 · Introductions: You and The Guitar | Módulo 1 · Presentaciones: tú y la guitarra |
| subtitle: Parts of the guitar · Posture · Tuning · First melody | Partes de la guitarra · Postura · Afinación · Primera melodía |
| skillFocus: Guitar parts, posture, and holding a pick · Naming and tuning the strings · Playing a short melody on the low E string | Partes de la guitarra, postura y cómo sostener la púa · Nombrar y afinar las cuerdas · Tocar una melodía corta en la cuerda Mi grave |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: String names & clean picking | Nombres de las cuerdas y pulsación limpia |
| Section title: Preview the "Seven Nation Army" riff | Adelanto del riff de "Seven Nation Army" |
| Station C title: Practice station — Challenges | Estación de práctica — Retos |
| Section title: Tune all 6 strings with a tuner | Afina las 6 cuerdas con un afinador |
| Section title: Play a melody on the open strings with clean, steady notes | Toca una melodía en las cuerdas al aire con notas limpias y constantes |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: "How to Tune a Guitar for Beginners with a Tuner – Lauren Bateman (0:00–4:30)" (this site also has a built-in tuner in the corner toolbar). Have your tuner ready and follow along on your own guitar — match one string at a time as she goes. | Mira: "How to Tune a Guitar for Beginners with a Tuner – Lauren Bateman (0:00–4:30)" (este sitio también tiene un afinador integrado en la barra de la esquina). Ten tu afinador listo y sigue el video en tu propia guitarra — afina una cuerda a la vez a medida que ella avanza. |
| hint: Headphones on. Notice the order of the strings and what "in tune" sounds like. You've got it when: you can tell whether a note is too high or too low before the tuner shows you. | Ponte los audífonos. Fíjate en el orden de las cuerdas y en cómo suena "afinado". Lo tienes cuando: puedes saber si una nota está muy alta o muy baja antes de que el afinador te lo muestre. |
| stuck: Pause after each string and tune just that one before moving on. If the tuner jumps around, pluck a little softer and let the note ring. | Pausa después de cada cuerda y afina solo esa antes de seguir. Si el afinador salta de un lado a otro, pulsa un poco más suave y deja que la nota suene. |
| levelUp: Detune one string on purpose, then bring it back to green by ear first — check the tuner only to confirm. | Desafina una cuerda a propósito, y luego vuelve a ponerla en verde primero de oído — usa el afinador solo para confirmar. |
| response prompt: If a string's pitch is too LOW, which way do you turn the tuning peg? | Si el tono de una cuerda está muy BAJO, ¿hacia qué lado giras la clavija? |
| response explain: Too low means you need more tension, so tighten the string — the pitch rises up to the target. Loosening would make it even flatter. | Muy bajo significa que necesitas más tensión, así que aprieta la cuerda — el tono sube hasta el objetivo. Aflojarla lo dejaría todavía más bajo. |
| response choices: Tighten it so the pitch rises / Loosen it so the pitch drops / It doesn't matter which way / Take the string off and put it back on | Apriétala para que el tono suba / Aflójala para que el tono baje / No importa hacia qué lado / Quita la cuerda y vuelve a ponerla |
| text: Watch: "Parts of Acoustic Guitar (Beginner Lesson #2) – Guitar Goddess (0:00–4:00)". As she names each part, point to it on your own guitar and say the name out loud. | Mira: "Parts of Acoustic Guitar (Beginner Lesson #2) – Guitar Goddess (0:00–4:00)". Mientras ella nombra cada parte, señálala en tu propia guitarra y di el nombre en voz alta. |
| hint: Write down 5 parts you can now name from memory. You've got it when: you can point to and name at least 5 parts without the video. | Anota 5 partes que ahora puedas nombrar de memoria. Lo tienes cuando: puedes señalar y nombrar al menos 5 partes sin el video. |
| response prompt: Which of these is NOT a part of the guitar? | ¿Cuál de estas NO es una parte de la guitarra? |
| response explain: There's no "hinge" on a guitar. The body, neck, headstock, frets, strings, tuning pegs, nut, saddle, and bridge are all real parts. | Una guitarra no tiene "bisagra". El cuerpo, el mástil, el clavijero, los trastes, las cuerdas, las clavijas, la cejuela, la selleta y el puente sí son partes reales. |
| response choices: Hinge / Headstock / Saddle / Nut | Bisagra / Clavijero / Selleta / Cejuela |
| text: Watch: "How to Hold Your Guitar Comfortably – Lauren Bateman (0:00–4:00)". While you watch, set up in your chair and copy her position piece by piece — feet, guitar on leg, back, strumming arm. | Mira: "How to Hold Your Guitar Comfortably – Lauren Bateman (0:00–4:00)". Mientras miras, acomódate en tu silla y copia su posición paso a paso — pies, guitarra sobre la pierna, espalda, brazo de rasgueo. |
| hint: Notice where the guitar rests and how the back stays straight. You've got it when: you can look away from the screen and your guitar stays put without your fretting hand holding it up. | Fíjate en dónde descansa la guitarra y en cómo la espalda se mantiene derecha. Lo tienes cuando: puedes dejar de mirar la pantalla y tu guitarra se queda en su lugar sin que tu mano de trastear la sostenga. |
| stuck: Pause at each position checkpoint and match one thing at a time: feet flat first, then guitar on the right leg, then straighten the back. Prop up your phone and film a few seconds, then compare yourself to the freeze-frame. | Pausa en cada punto de la postura y ajusta una cosa a la vez: primero los pies planos, luego la guitarra sobre la pierna derecha, luego endereza la espalda. Apoya tu teléfono y grábate unos segundos, luego compárate con la imagen congelada. |
| levelUp: Close your eyes for 10 seconds and keep the position. Or film 10 seconds of yourself playing and name one posture fix. | Cierra los ojos por 10 segundos y mantén la posición. O grábate tocando por 10 segundos y nombra un ajuste de postura. |
| response prompt: Where should the guitar's weight rest when you're sitting? | ¿Dónde debe descansar el peso de la guitarra cuando estás sentado? |
| response explain: The body of the guitar rests on your leg — your fretting hand should be free to move, not holding the neck up. | El cuerpo de la guitarra descansa sobre tu pierna — tu mano de trastear debe estar libre para moverse, no sosteniendo el mástil. |
| response choices: On your leg — the fretting hand stays free / Held up by your fretting hand / Leaning back against your chest / On the chair's armrest | Sobre tu pierna — la mano de trastear queda libre / Sostenida por tu mano de trastear / Recostada contra tu pecho / Sobre el brazo de la silla |
| text: Watch: "How To Hold A Guitar Pick for Beginners: Right vs Wrong – Lauren Bateman (0:00–4:00)". Grab a pick and copy her grip as you watch — rest it on your bent index finger, then press your thumb on top. | Mira: "How To Hold A Guitar Pick for Beginners: Right vs Wrong – Lauren Bateman (0:00–4:00)". Toma una púa y copia su agarre mientras miras — apóyala sobre tu dedo índice doblado, y luego presiona el pulgar encima. |
| hint: Write down: what are the two most common pick-holding mistakes? You've got it when: only a small tip of the pick pokes past your thumb and it doesn't slip when you strum. | Anota: ¿cuáles son los dos errores más comunes al sostener la púa? Lo tienes cuando: solo asoma una puntita de la púa más allá del pulgar y no se resbala al rasguear. |
| stuck: Hold the pick still and just brush it down across the strings with your whole forearm. If it flips or drops, let a little less tip show and relax your grip. | Mantén la púa quieta y solo pásala hacia abajo por las cuerdas con todo el antebrazo. Si se voltea o se cae, deja asomar un poco menos de punta y relaja el agarre. |
| levelUp: Strum down-up-down-up slowly for 30 seconds without the pick sliding or twisting in your fingers. | Rasguea abajo-arriba-abajo-arriba despacio durante 30 segundos sin que la púa se resbale o se gire entre tus dedos. |
| response prompt: How much of the pick's tip should show past your thumb? | ¿Cuánta punta de la púa debe asomar más allá del pulgar? |
| response explain: About 3–4 mm — just a small tip. Too much pick makes it flap and catch; too little makes it hard to hit the strings. | Cerca de 3–4 mm — solo una puntita. Demasiada púa hace que se doble y se enganche; muy poca hace difícil golpear las cuerdas. |
| response choices: A small tip, about 3–4 mm / Just 1 mm, almost none / About a centimeter / The whole pick, gripped at the edge | Una puntita, cerca de 3–4 mm / Solo 1 mm, casi nada / Cerca de un centímetro / La púa completa, agarrada por el borde |

**Station B — String names & clean picking**

| English | Spanish |
|---|---|
| text: Type the 6 string names from memory, low to high, in the box below. Mnemonic: Eddie Ate Dynamite, Good Bye Eddie. You've got it when: you can type all six in order without peeking at the mnemonic. | Escribe de memoria los nombres de las 6 cuerdas, de grave a aguda, en el cuadro de abajo. Regla mnemotécnica: Eddie Ate Dynamite, Good Bye Eddie. Lo tienes cuando: puedes escribir las seis en orden sin mirar la regla mnemotécnica. |
| stuck: Type just the first letters — E A D G B E — using "Eddie Ate Dynamite, Good Bye Eddie." Clear it, then type them again from memory. | Escribe solo las primeras letras — E A D G B E — usando "Eddie Ate Dynamite, Good Bye Eddie". Bórralo, y luego escríbelas otra vez de memoria. |
| levelUp: Say the six string names high to low (e B G D A E) without pausing. | Di los seis nombres de las cuerdas de aguda a grave (e B G D A E) sin pausar. |
| response placeholder: The 6 strings, low to high: … | Las 6 cuerdas, de grave a aguda: … |
| text: Watch: "Picking Individual Strings (BC-166) – JustinGuitar". Copy him on your own guitar — pick one open string over and over, aiming for the same clean sound every time. | Mira: "Picking Individual Strings (BC-166) – JustinGuitar". Cópialo en tu propia guitarra — pulsa una cuerda al aire una y otra vez, buscando el mismo sonido limpio cada vez. |
| hint: Watch his picking hand and how light his fretting touch is. Clean single notes are the whole goal of your first melody. You've got it when: you can pick a single string five times and it rings clean every time — no buzz, no catching a neighbor string. | Fíjate en su mano de pulsar y en lo ligero que es su toque al trastear. Las notas individuales limpias son toda la meta de tu primera melodía. Lo tienes cuando: puedes pulsar una sola cuerda cinco veces y suena limpia todas las veces — sin zumbido, sin rozar la cuerda vecina. |
| stuck: Rest your picking hand lightly on the guitar and pick just the low E string slowly. If you hit two strings, aim a little more and use a smaller motion. | Apoya tu mano de pulsar suavemente en la guitarra y pulsa solo la cuerda Mi grave despacio. Si golpeas dos cuerdas, apunta con más cuidado y usa un movimiento más pequeño. |
| levelUp: Pick each open string once, low to high, without accidentally brushing the string next door. | Pulsa cada cuerda al aire una vez, de grave a aguda, sin rozar por accidente la cuerda de al lado. |
| response placeholder: Which string was easiest to pick cleanly, and which took the most tries? | ¿Qué cuerda fue más fácil de pulsar limpio, y cuál te tomó más intentos? |
| text: Quick try: play each open string once, low E to high e, saying the name out loud as you pluck. Just a preview — you'll drill these for real at the practice station. You've got it when: you can name each string out loud the instant you pluck it. | Prueba rápida: toca cada cuerda al aire una vez, de Mi grave a mi aguda, diciendo el nombre en voz alta al pulsarla. Es solo un adelanto — las vas a practicar de verdad en la estación de práctica. Lo tienes cuando: puedes nombrar cada cuerda en voz alta al instante de pulsarla. |
| hint: Hearing + saying + playing helps you memorize it faster than just watching. | Escuchar + decir + tocar te ayuda a memorizar más rápido que solo mirar. |
| stuck: Go low to high slowly, checking the mnemonic after each one: E, A, D, G, B, e. Do it twice before you speed up. | Ve de grave a aguda despacio, revisando la regla mnemotécnica después de cada una: E, A, D, G, B, e. Hazlo dos veces antes de ir más rápido. |
| levelUp: Look away, pluck a string at random, and name it from pitch and thickness alone before you peek. Got someone around? Have them pluck one out of your sight instead. | Mira hacia otro lado, pulsa una cuerda al azar, y nómbrala solo por el tono y el grosor antes de mirar. ¿Tienes a alguien cerca? Pídele que pulse una sin que la veas. |
| response prompt: Say the string names low to high — which comes right after G? | Di los nombres de las cuerdas de grave a aguda — ¿cuál viene justo después de G? |
| response explain: Low to high it's E A D G B e — so B follows G. (Try "Eddie Ate Dynamite, Good Bye Eddie.") | De grave a aguda es E A D G B e — así que B viene después de G. (Prueba con "Eddie Ate Dynamite, Good Bye Eddie".) |
| response choices: B / A / D / e | B / A / D / e |

**Station B — Preview the "Seven Nation Army" riff**

| English | Spanish |
|---|---|
| text: Preview the "Seven Nation Army" riff: click the note names below the TAB (the little chart below — each number is a fret to press on the low E string; 0 = open) to hear how it should sound, then try just the first few notes to get the feel. Heads up: this site teaches it as straight, even quarter notes — one per beat — to make it easy to count while you're learning it; the actual record swings it a bit looser than that, which you'll start to hear naturally once the shape feels solid. You'll play the whole riff at the practice station. You've got it when: you can match the first three notes to what you heard. This song grows with you through the whole course — Song Journey: this is Layer 1 of 5. | Adelanto del riff de "Seven Nation Army": haz clic en los nombres de las notas debajo del TAB (el pequeño diagrama de abajo — cada número es un traste que debes presionar en la cuerda Mi grave; 0 = al aire) para escuchar cómo debe sonar, y luego prueba solo las primeras notas para agarrar la sensación. Aviso: aquí se enseña con negras rectas y parejas — una nota por pulso — para que sea fácil de contar mientras lo aprendes; la grabación original lo toca con un poco más de swing (vaivén) que eso, algo que empezarás a notar de oído en cuanto domines bien la forma. Vas a tocar el riff completo en la estación de práctica. Lo tienes cuando: puedes hacer coincidir las primeras tres notas con lo que escuchaste. Esta canción crece contigo durante todo el curso — Recorrido de la canción: esto es la Capa 1 de 5. |
| hint: Listen first, then match it — one note at a time. To fret a note, set your fingertip just behind the fret and press firm; if it buzzes, move a little closer to the fret or press harder. | Escucha primero y luego iguálalo — una nota a la vez. Para trastear una nota, coloca la punta del dedo justo detrás del traste y presiona firme; si zumba, acércate un poco más al traste o presiona más fuerte. |
| stuck: Just the first two notes: click a note name to hear it, then find it on the low E string. Get those solid before adding the next. | Solo las primeras dos notas: haz clic en el nombre de una nota para escucharla, y luego encuéntrala en la cuerda Mi grave. Deja esas bien firmes antes de agregar la siguiente. |
| levelUp: Play the first four notes in a row, in time, humming the riff as you go. | Toca las primeras cuatro notas seguidas, a tiempo, tarareando el riff mientras tocas. |
| response placeholder: How did the riff sound, and which note was hardest to find? | ¿Cómo sonó el riff, y qué nota fue la más difícil de encontrar? |
| tab caption: "Seven Nation Army" — main riff · Low E string · 7 notes | "Seven Nation Army" — riff principal · cuerda Mi grave · 7 notas |

**Station C — Tune all 6 strings with a tuner**

| English | Spanish |
|---|---|
| text: Challenge 1 — Tune Challenge: get all 6 strings to green on the tuner. Race the timer — can you do it in under 2 minutes? You've got it when: all 6 strings green in under 2 minutes. Log your time so you can try for a faster time next session. | Reto 1 — Reto de afinación: pon las 6 cuerdas en verde en el afinador. Compite contra el cronómetro — ¿puedes lograrlo en menos de 2 minutos? Lo tienes cuando: las 6 cuerdas en verde en menos de 2 minutos. Anota tu tiempo para intentar superarlo en la próxima sesión. |
| hint: Tune low to high: E A D G B e. Going slowly works better than rushing past the note. Use the play button to hear the target pitches. | Afina de grave a aguda: E A D G B e. Ir despacio funciona mejor que pasarte de largo de la nota. Usa el botón de reproducir para escuchar los tonos objetivo. |
| stuck: Tune just one string to green and leave it, then the next. Hit the play button to hear each target pitch first so your ear knows where it's headed. | Afina solo una cuerda hasta que quede en verde y déjala, luego la siguiente. Presiona el botón de reproducir primero para escuchar cada tono objetivo y que tu oído sepa hacia dónde va. |
| levelUp: Log this session's time and try to make your time 15 seconds faster next session. | Anota el tiempo de esta sesión e intenta que sea 15 segundos más rápido la próxima vez. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Play a melody on the open strings with clean, steady notes**

| English | Spanish |
|---|---|
| text: Challenge 2 — One Minute, Perfect Notes: for one minute, cycle through the open strings low to high (E A D G B e), saying each name out loud as you pluck. When the minute's up, play one last full pass and count how many of the 6 ring perfectly clean — no buzz, no muting. You've got it when: all 6 ring clean on that final pass. Log your score out of 6 and try for a higher score next time. | Reto 2 — Un minuto, notas perfectas: durante un minuto, recorre las cuerdas al aire de grave a aguda (E A D G B e), diciendo cada nombre en voz alta al pulsarla. Cuando se acabe el minuto, toca una última vuelta completa y cuenta cuántas de las 6 suenan perfectamente limpias — sin zumbido, sin apagarse. Lo tienes cuando: las 6 suenan limpias en esa última vuelta. Anota tu puntaje sobre 6 e intenta superarlo la próxima vez. |
| hint: These are open strings — press nothing. Let each string ring fully before moving to the next. | Estas son cuerdas al aire — no presiones nada. Deja que cada cuerda suene por completo antes de pasar a la siguiente. |
| stuck: Slow way down — one string every few seconds. Lift any finger that's touching a string and let each one ring fully before the next. | Ve mucho más despacio — una cuerda cada pocos segundos. Levanta cualquier dedo que esté tocando una cuerda y deja que cada una suene por completo antes de la siguiente. |
| levelUp: Score 6 clean out of 6 twice in a row, then try it once more with your eyes closed. | Logra 6 de 6 limpias dos veces seguidas, y luego inténtalo una vez más con los ojos cerrados. |
| text: Try "Happy Birthday" on the low E string — the tutorial video in the Songs tab walks you through the note sequence, all on one string. Practice with the Metronome (floating corner button) set to 60 BPM — beats per minute, one click a second — to keep steady. You've got it when: you can play it start to finish with clean notes and a steady pulse. | Prueba "Happy Birthday" en la cuerda Mi grave — el video tutorial en la pestaña de Canciones te guía por la secuencia de notas, todo en una sola cuerda. Practica con el Metrónomo (botón flotante de la esquina) puesto en 60 BPM — pulsos por minuto, un clic por segundo — para mantenerte constante. Lo tienes cuando: puedes tocarla de principio a fin con notas limpias y un pulso constante. |
| hint: Go slow. Clean notes matter more than speed right now. | Ve despacio. Las notas limpias importan más que la velocidad por ahora. |
| stuck: Learn it in two halves — get the first phrase clean before you add the second. Drop the metronome to 50 BPM until the notes are smooth. | Apréndela en dos mitades — deja limpia la primera frase antes de agregar la segunda. Baja el metrónomo a 50 BPM hasta que las notas salgan parejas. |
| levelUp: Raise the metronome to 70 BPM, keeping every note clean and in time. | Sube el metrónomo a 70 BPM, manteniendo cada nota limpia y a tiempo. |
| text: Challenge 3 — Riff Time (try it!): play the "Seven Nation Army" riff on the low E string — slow and clean. You've got it when: all 7 notes in the right order, each ringing clean — speed comes later. No score on this one, just try it. Click any note name below the TAB to hear how it should sound. | Reto 3 — Hora del riff (¡pruébalo!): toca el riff de "Seven Nation Army" en la cuerda Mi grave — despacio y limpio. Lo tienes cuando: las 7 notas en el orden correcto, cada una sonando limpia — la velocidad viene después. Este no tiene puntaje, solo pruébalo. Haz clic en cualquier nombre de nota debajo del TAB para escuchar cómo debe sonar. |
| hint: Slow and clean is better than fast and buzzy. One note at a time. Set your fingertip just behind the fret and press firm; if it buzzes, move a little closer to the fret or press harder. | Despacio y limpio es mejor que rápido y con zumbido. Una nota a la vez. Coloca la punta del dedo justo detrás del traste y presiona firme; si zumba, acércate un poco más al traste o presiona más fuerte. |
| stuck: Break the 7 notes into two chunks and learn the first chunk cold. Click each note name to hear its pitch, then find it before you play on. | Divide las 7 notas en dos partes y apréndete bien la primera parte. Haz clic en cada nombre de nota para escuchar su tono, y encuéntrala antes de seguir tocando. |
| levelUp: Play all 7 notes in time with a slow metronome at 60 BPM, keeping each one clean. | Toca las 7 notas a tiempo con el metrónomo despacio a 60 BPM, manteniendo cada una limpia. |
| tab caption: "Seven Nation Army" — main riff · Low E string · 7 notes | "Seven Nation Army" — riff principal · cuerda Mi grave · 7 notas |

**Set 2 — Songs**

| English | Spanish |
|---|---|
| "Seven Nation Army" — The White Stripes — meta: Play the low-E riff — your first core-thread riff | Toca el riff en la Mi grave — tu primer riff del hilo principal |
| "Happy Birthday" — meta: Play the melody on the low E string — first real song! | Toca la melodía en la cuerda Mi grave — ¡tu primera canción real! |
| "Sailor Song" — Gigi Perez — meta: Listen — fingerpicked vs. strummed guitar | Escucha — guitarra punteada con los dedos vs. rasgueada |
| "All Along the Watchtower" — Dylan / Hendrix — meta: Listen and identify guitar sounds | Escucha e identifica los sonidos de la guitarra |
| "Ode to Joy" — meta: E string only — great first melody | Solo la cuerda Mi — una gran primera melodía |
| "Mary Had a Little Lamb" — meta: E & A strings | Cuerdas Mi y La |
| "Jingle Bells" — meta: Open strings only | Solo cuerdas al aire |
| "Twinkle Twinkle" — meta: E & A strings | Cuerdas Mi y La |
| "The Simpsons Theme" — meta: E string only | Solo la cuerda Mi |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| w2-s1 text: Name 5+ parts of the guitar (body, neck, headstock, frets, strings, tuning pegs, nut, saddle, bridge) | Nombrar 5 o más partes de la guitarra (cuerpo, mástil, clavijero, trastes, cuerdas, clavijas, cejuela, selleta, puente) |
| w2-s1 gotItWhen: you can point to and name each part on a real guitar without checking a diagram. | puedes señalar y nombrar cada parte en una guitarra real sin revisar un diagrama. |
| w2-s1 practice prompt: Which of these is NOT a part of the guitar? | ¿Cuál de estas NO es una parte de la guitarra? |
| w2-s1 practice choices: Nut / Saddle / Hinge / Fret | Cejuela / Selleta / Bisagra / Traste |
| w2-s2 text: Hold the guitar with correct sitting posture | Sostener la guitarra con la postura correcta al sentarte |
| w2-s2 gotItWhen: you can play for 5 minutes straight without slouching, lifting your shoulders, or letting the guitar slip off your leg. | puedes tocar 5 minutos seguidos sin encorvarte, sin levantar los hombros, y sin que la guitarra se resbale de tu pierna. |
| w2-s3 text: Hold the pick correctly — 3–4mm of tip showing | Sostener la púa correctamente — con 3–4 mm de punta asomando |
| w2-s3 gotItWhen: your pick stays put when you strum, only a small tip pokes past your thumb, and your wrist stays relaxed. | tu púa se mantiene en su lugar al rasguear, solo asoma una puntita más allá del pulgar, y tu muñeca se mantiene relajada. |
| w2-s3 practice prompt: How much pick tip should show past your thumb? | ¿Cuánta punta de la púa debe asomar más allá del pulgar? |
| w2-s3 practice choices: Just 1 mm / 3–4 mm / About a centimeter / All of the pick | Solo 1 mm / 3–4 mm / Cerca de un centímetro / La púa completa |
| w2-s4 text: Name all 6 strings from memory (E A D G B e) | Nombrar las 6 cuerdas de memoria (E A D G B e) |
| w2-s4 gotItWhen: you can say E-A-D-G-B-e low to high — and high to low — without pausing or saying the mnemonic out loud. | puedes decir E-A-D-G-B-e de grave a aguda — y de aguda a grave — sin pausar ni decir la regla mnemotécnica en voz alta. |
| w2-s4 practice prompt: Strings low to high are E A D G B e. Which string sits between A and G? | Las cuerdas de grave a aguda son E A D G B e. ¿Qué cuerda está entre A y G? |
| w2-s4 practice choices: B / D / High e / Low E | B / D / mi aguda / Mi grave |
| w2-s5 text: Tune all 6 strings with a tuner | Afinar las 6 cuerdas con un afinador |
| w2-s5 gotItWhen: you can take an out-of-tune guitar and get all 6 strings to green on the tuner in under 2 minutes without help. | puedes tomar una guitarra desafinada y poner las 6 cuerdas en verde en el afinador en menos de 2 minutos sin ayuda. |
| w2-s5 practice label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |
| w2-s6 text: Play a short melody on the E string with clean, steady notes | Tocar una melodía corta en la cuerda Mi con notas limpias y constantes |
| w2-s6 gotItWhen: you can play the melody all the way through with clean notes and a steady pulse — practice it at 60 BPM with the metronome to keep the timing steady. | puedes tocar la melodía de principio a fin con notas limpias y un pulso constante — practícala a 60 BPM con el metrónomo para mantener el tiempo estable. |
| w2-s6 practice label: E string warm-up melody | Melodía de calentamiento en la cuerda Mi |

### Module Review

| English | Spanish |
|---|---|
| module: Introductions: You and The Guitar | Presentaciones: tú y la guitarra |
| skill mr1-s1: I can describe why I want to learn guitar | Puedo describir por qué quiero aprender guitarra |
| skill mr1-s2: I can name 5+ parts of the guitar | Puedo nombrar 5 o más partes de la guitarra |
| skill mr1-s3: I can tune all 6 strings with a tuner | Puedo afinar las 6 cuerdas con un afinador |
| skill mr1-s4: I can play a short melody on the E string with clean, steady notes | Puedo tocar una melodía corta en la cuerda Mi con notas limpias y constantes |
| skill mr1-s5: I can hold the guitar and pick correctly and make every open string ring clean | Puedo sostener la guitarra y la púa correctamente, y hacer que cada cuerda al aire suene limpia |
| assessItem: Tune all 6 strings to green in under 2 minutes, without restarting | Afinar las 6 cuerdas en verde en menos de 2 minutos, sin reiniciar |
| assessItem: Name all 6 strings from memory — in order and at random | Nombrar las 6 cuerdas de memoria — en orden y al azar |
| assessItem: Play each open string with correct posture and pick grip — down-strokes from the wrist, every string ringing full and clean with no accidental muting from either hand | Tocar cada cuerda al aire con la postura y el agarre de púa correctos — golpes hacia abajo desde la muñeca, cada cuerda sonando plena y limpia sin que ninguna mano la apague sin querer |
| forward: You've got a guitar that's in tune, a goal, and your first clean notes — Module 2 puts names on the frets so riffs and TAB start making sense. (Already played before, or coming back after a long break? Module 9, Set 1 is a six-skill re-test that shows you exactly where to start.) | Ya tienes una guitarra afinada, una meta, y tus primeras notas limpias — el Módulo 2 les pone nombre a los trastes para que los riffs y el TAB empiecen a tener sentido. (¿Ya tocabas antes, o vuelves después de un descanso largo? el Módulo 9, Unidad 1 es una reevaluación de seis destrezas que te muestra exactamente por dónde empezar.) |

## Module 2 — Notes on the E & A Strings

### Set 1

| English | Spanish |
|---|---|
| unit: Module 2 · Notes on the E & A Strings | Módulo 2 · Notas en las cuerdas Mi y La |
| subtitle: Musical alphabet · Note names on E & A · Fretboard reading | Alfabeto musical · Nombres de notas en Mi y La · Lectura del diapasón |
| skillFocus: Natural notes on the E and A strings · Reading notes on a fretboard chart | Notas naturales en las cuerdas Mi y La · Lectura de notas en un diagrama del diapasón |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen and find notes by ear | Escucha y encuentra notas de oído |
| Section title: Play along with your note chart | Toca junto con tu tabla de notas |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — fretboard drill | Estación de práctica — ejercicio de diapasón |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Name every note on the low E string (frets 0–12) | Nombra cada nota en la cuerda Mi grave (trastes 0–12) |
| Section title: Name every note on the A string (frets 0–12) | Nombra cada nota en la cuerda La (trastes 0–12) |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: My Practice Routine — weekly check-in (never graded) | Mi rutina de práctica — check-in semanal (nunca se califica) |
| Section title: ⚡ Ear Spark — optional ear bonus | ⚡ Chispa de oído — bono opcional |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: Open Notes On The Guitar – JustinGuitar. | Mira: Open Notes On The Guitar – JustinGuitar. |
| hint: Play along on your guitar as he goes through each note on both strings. Pause and find each note before he names it. | Toca junto con él en tu guitarra mientras recorre cada nota en las dos cuerdas. Pausa y encuentra cada nota antes de que él la nombre. |
| response prompt: On the low E string, which note is at fret 5? | En la cuerda Mi grave, ¿qué nota está en el traste 5? |
| response explain: Fret 5 of the low E is A — the same pitch as the open A string right next to it. | El traste 5 de la Mi grave es A — el mismo tono que la cuerda La al aire, justo al lado. |
| response choices: A / D / G / F | A / D / G / F |
| text: Watch: Learn Every Note on the Fretboard – Marty Music (0:00–4:00). | Mira: Learn Every Note on the Fretboard – Marty Music (0:00–4:00). |
| hint: Focus on the E and A strings only for now. What patterns does he point out? | Concéntrate solo en las cuerdas Mi y La por ahora. ¿Qué patrones señala él? |
| response placeholder: Describe one pattern he points out for finding notes on the E or A string. | Describe un patrón que él señala para encontrar notas en la cuerda Mi o La. |

**Station B — Listen and find notes by ear**

| English | Spanish |
|---|---|
| text: Listen to the opening of "Happy Birthday" — press ▶ to hear it, then hum along and see if you can identify which notes of the melody live on the E or A string. | Escucha el inicio de "Happy Birthday" — presiona ▶ para escucharlo, luego tararea y trata de identificar qué notas de la melodía viven en la cuerda Mi o La. |
| hint: Don't worry about playing it yet — just train your ear to connect sounds to strings. | No te preocupes todavía por tocarla — solo entrena tu oído para conectar sonidos con cuerdas. |
| playSeq label: Hear the opening | Escucha el inicio |
| response placeholder: Which note(s) did you find first? Where on the fretboard? | ¿Qué nota(s) encontraste primero? ¿Dónde en el diapasón? |

**Station B — Play along with your note chart**

| English | Spanish |
|---|---|
| text: Play-along preview: keep your note-name chart open and play up the low E string slowly with the audio, frets 0–12 — E · F · G · A · B · C · D · E — saying each name aloud. Lean on the chart here; you'll do it from memory at the practice station. | Adelanto para tocar junto: mantén abierta tu tabla de nombres de notas y toca despacio hacia arriba en la cuerda Mi grave junto con el audio, trastes 0–12 — E · F · G · A · B · C · D · E — diciendo cada nombre en voz alta. Apóyate en la tabla aquí; lo harás de memoria en la estación de práctica. |
| hint: Slow is fine. Right now the goal is connecting each name to its spot — use the chart freely. | Ir despacio está bien. Ahora mismo la meta es conectar cada nombre con su lugar — usa la tabla libremente. |
| playSeq label: Play all | Tocar todo |
| response prompt: On the low E string, what note is at fret 10? | En la cuerda Mi grave, ¿qué nota está en el traste 10? |
| response explain: Counting the naturals up the low E (E F G A B C D), fret 10 lands on D — fret 12 is E again, the octave. | Contando las notas naturales hacia arriba en la Mi grave (E F G A B C D), el traste 10 cae en D — el traste 12 es E otra vez, la octava. |
| response choices: C / D / E / B | C / D / E / B |
| text: Same idea on the A string, still with your chart: A · B · C · D · E · F · G · A (frets 0–12), up then back down, names aloud. | La misma idea en la cuerda La, todavía con tu tabla: A · B · C · D · E · F · G · A (trastes 0–12), hacia arriba y de regreso, nombres en voz alta. |
| hint: Notice fret 5 of the A string is the same note as the open D string — that connection helps later. | Fíjate que el traste 5 de la cuerda La es la misma nota que la cuerda Re al aire — esa conexión ayuda más adelante. |
| playSeq label: Play all | Tocar todo |
| response placeholder: What did you notice about any of the notes? Did any two notes feel or sound similar? | ¿Qué notaste sobre alguna de las notas? ¿Alguna se sintió o sonó parecida a otra? |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: which note or fret felt fuzziest today, and what (if anything) started to make sense? | Cierre de la estación — pausa y piensa: ¿qué nota o traste se sintió más confuso hoy, y qué (si acaso) empezó a tener sentido? |
| response placeholder: e.g. fret 8 on the low E — kept mixing up B and C | ej. el traste 8 en la Mi grave — seguía confundiendo B y C |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Before today's notes: tune all 6 strings to green, low to high — E A D G B e — and say each string name as you go. Try for a faster time than last session. Click "Hear all 6 strings" for the target pitches. | Antes de las notas de hoy: afina las 6 cuerdas en verde, de grave a aguda — E A D G B e — y di cada nombre de cuerda a medida que avanzas. Intenta lograr un tiempo más rápido que la sesión pasada. Haz clic en "Escucha las 6 cuerdas" para escuchar los tonos objetivo. |
| hint: Tuning and the string names are Module 1 skills you keep forever — do this every practice session before you play. Going slowly works better than rushing past the note. | Afinar y nombrar las cuerdas son destrezas del Módulo 1 que conservas para siempre — hazlo en cada sesión de práctica antes de tocar. Ir despacio funciona mejor que pasarte de largo de la nota. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Name every note on the low E string (frets 0–12)**

| English | Spanish |
|---|---|
| text: Challenge 1 — Low E Run: play every natural note up the low E string and back down — E · F · G · A · B · C · D · E — saying each name aloud. You've got it when: one clean lap (a lap = one full time through) without looking at the chart, with no mistakes. | Reto 1 — Recorrido de la Mi grave: toca cada nota natural hacia arriba en la cuerda Mi grave y de regreso — E · F · G · A · B · C · D · E — diciendo cada nombre en voz alta. Lo tienes cuando: una vuelta limpia (una vuelta = una pasada completa) sin mirar la tabla, sin errores. |
| hint: Hearing + saying + playing helps you memorize it. Peek at the chart only if you're truly stuck. Set the ⏱ Timer (bottom of the screen) to 2 min and count how many clean laps you fit before it beeps — try for a higher number next session. | Escuchar + decir + tocar te ayuda a memorizarlo. Mira la tabla solo si de verdad estás atascado. Pon el ⏱ Temporizador (abajo en la pantalla) en 2 min y cuenta cuántas vueltas limpias logras antes de que suene — intenta superar el número la próxima sesión. |
| stuck: Master frets 0–5 only (E–A) without looking at the chart first, then add 7–12 once those are automatic. | Domina solo los trastes 0–5 (E–A) sin mirar la tabla primero, y luego agrega 7–12 una vez que esos sean automáticos. |
| levelUp: One clean lap at 80 BPM, or start at fret 12 and name your way down. | Una vuelta limpia a 80 BPM, o empieza en el traste 12 y nombra tu camino hacia abajo. |
| playSeq label: Play all | Tocar todo |
| response prompt: Personal record: play it cleanly at 60, then raise the metronome +10 at a time. What's your fastest CLEAN lap today (BPM)? | Récord personal: tócalo limpio a 60, y luego sube el metrónomo de 10 en 10. ¿Cuál es tu vuelta LIMPIA más rápida hoy (BPM)? |
| response placeholder: e.g. 90 — try for a higher number next session | ej. 90 — intenta superarlo la próxima sesión |
| text: Quick check — name the note before you play it: | Revisión rápida — nombra la nota antes de tocarla: |
| response prompt: Low E string — what note is at fret 8? | Cuerda Mi grave — ¿qué nota está en el traste 8? |
| response explain: Fret 7 is B, and C is just one fret up at 8 — there's no sharp between B and C. | El traste 7 es B, y C está justo un traste más arriba en el 8 — no hay sostenido entre B y C. |
| response choices: A / C / D / B | A / C / D / B |
| text: Name That Riff (try it!): pick out the "Seven Nation Army" or "Smoke on the Water" main riff (a riff = a short musical phrase that repeats) by ear on the low E string. No score — just try it. | Adivina el riff (¡pruébalo!): saca de oído el riff principal de "Seven Nation Army" o "Smoke on the Water" (un riff = una frase musical corta que se repite) en la cuerda Mi grave. Sin puntaje — solo pruébalo. |
| hint: Use the note-name chart. Don't worry about getting it perfect — the attempt trains your ear. | Usa la tabla de nombres de notas. No te preocupes por hacerlo perfecto — el intento entrena tu oído. |

**Station C — Name every note on the A string (frets 0–12)**

| English | Spanish |
|---|---|
| text: Challenge 2 — A String Run (your Set 1 check-off): same on the A string, without looking at the chart — A · B · C · D · E · F · G · A, up to fret 12 and back, one note per beat. You've got it when: a clean lap with the metronome and no stalls. The Set 1 check-off tests exactly this: draw any fret at random — shuffled paper slips 0–12 work great — and name the note within 3 seconds. | Reto 2 — Recorrido de la cuerda La (tu evaluación de la Unidad 1): lo mismo en la cuerda La, sin mirar la tabla — A · B · C · D · E · F · G · A, hasta el traste 12 y de regreso, una nota por pulso. Lo tienes cuando: una vuelta limpia con el metrónomo y sin trabarte. La evaluación de la Unidad 1 pone a prueba exactamente esto: saca un traste al azar — unos papelitos revueltos del 0–12 funcionan genial — y nombra la nota en 3 segundos. |
| hint: Keep the metronome at 60 BPM. If you stall on a note, that's the one to drill. | Mantén el metrónomo a 60 BPM. Si te trabas en una nota, esa es la que debes practicar. |
| stuck: Drop to 50 BPM and play it cleanly there first, or cover frets 0–5 (A–D) before adding the rest. | Baja a 50 BPM y tócalo limpio ahí primero, o cubre los trastes 0–5 (A–D) antes de agregar el resto. |
| levelUp: Lap it at 80 BPM, or draw shuffled fret slips and name each on the spot. Got someone around? Have them call out random frets instead. | Haz la vuelta a 80 BPM, o saca papelitos revueltos de trastes y nombra cada uno al instante. ¿Tienes a alguien cerca? Pídele que diga trastes al azar en su lugar. |
| playSeq label: Play all | Tocar todo |
| response prompt: Personal record: play it cleanly at 60, then raise the metronome +10 at a time. Your fastest CLEAN A-string lap today (BPM)? | Récord personal: tócalo limpio a 60, y luego sube el metrónomo de 10 en 10. ¿Cuál es tu vuelta LIMPIA más rápida en la cuerda La hoy (BPM)? |
| response placeholder: e.g. 80 — try for a higher number next session | ej. 80 — intenta superarlo la próxima sesión |
| text: Quick check — name the note before you play it: | Revisión rápida — nombra la nota antes de tocarla: |
| response prompt: A string — what note is at fret 2? | Cuerda La — ¿qué nota está en el traste 2? |
| response explain: From open A, one fret up is A#, and two frets up is B. So fret 2 on the A string is B. | Desde la A al aire, un traste arriba es A#, y dos trastes arriba es B. Así que el traste 2 en la cuerda La es B. |
| response choices: A / B / C / D | A / B / C / D |
| text: Shuffle self-quiz: write frets 0–12 on small scraps of paper and shuffle them. Flip one at a time and say the A-string note within 3 seconds. Go 10 rounds. Got someone around? Have them call out random frets instead — same 3-second limit. | Autoevaluación con papelitos: escribe los trastes 0–12 en pequeños papelitos y revuélvelos. Voltea uno a la vez y di la nota de la cuerda La en 3 segundos. Haz 10 rondas. ¿Tienes a alguien cerca? Pídele que diga trastes al azar en su lugar — con el mismo límite de 3 segundos. |
| hint: No chart. If you stall on a note, loop just that part of the string until it's automatic. | Sin tabla. Si te trabas en una nota, repite solo esa parte de la cuerda hasta que sea automática. |
| text: Challenge 3 — Shuffle Run: write frets 0–12 on scraps of paper (or reuse your slips from the self-quiz above), shuffle them, then draw one at a time and — on the low E string — name it AND play it within 3 seconds. You've got it when: 10 in a row with no counting up from E. | Reto 3 — Recorrido con papelitos: escribe los trastes 0–12 en papelitos (o reutiliza los de la autoevaluación anterior), revuélvelos, y luego saca uno a la vez y — en la cuerda Mi grave — nómbralo Y tócalo en 3 segundos. Lo tienes cuando: 10 seguidas sin contar desde E. |
| hint: The 3-second limit is the real test. You're jumping to random frets, not running a memorized lap — that's what "name any fret instantly" really means. | El límite de 3 segundos es la verdadera prueba. Estás saltando a trastes al azar, no haciendo una vuelta memorizada — eso es lo que de verdad significa "nombrar cualquier traste al instante". |
| stuck: Put only frets 0–7 in the pile first; add 8–12 once you hit 10 in a row. | Pon solo los trastes 0–7 en el montón primero; agrega 8–12 una vez que logres 10 seguidas. |
| levelUp: Run the Shuffle on the A string too, or name a full lap going down the string (12 → 0) without counting. | Haz el ejercicio de papelitos en la cuerda La también, o nombra una vuelta completa bajando por la cuerda (12 → 0) sin contar. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Seven Nation Army, without looking at the chart: play the riff on the low E string and say each note name out loud as you play it — B · B · D · B · A · G · F#. You've got it when: one clean lap, no chart, every note named correctly. &#x1F9F5; Song Journey: this is Layer 2 of 5. | Reto — Seven Nation Army, sin mirar la tabla: toca el riff en la cuerda Mi grave y di cada nombre de nota en voz alta mientras lo tocas — B · B · D · B · A · G · F#. Lo tienes cuando: una vuelta limpia, sin tabla, cada nota nombrada correctamente. &#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5. |
| hint: You played this riff in Module 1 with the TAB in front of you. Today the goal is knowing WHERE you are — name it, then play it. | Tocaste este riff en el Módulo 1 con el TAB delante de ti. Hoy la meta es saber DÓNDE estás — nómbralo, luego tócalo. |
| stuck: Do it in two halves: name-and-play B B D B, then A G F#. Join them once each half is automatic. | Hazlo en dos mitades: nombra y toca B B D B, luego A G F#. Únelas una vez que cada mitad sea automática. |
| levelUp: Close your eyes for a lap, or play it one octave-position up starting at fret 7 of the A string. | Cierra los ojos para una vuelta, o tócalo una octava más arriba empezando en el traste 7 de la cuerda La. |
| tab caption: "Seven Nation Army" — riff · Low E string · say each note name | "Seven Nation Army" — riff · cuerda Mi grave · di cada nombre de nota |
| response prompt: A lap without looking at the chart — clean or not yet? What note still needs a look at the chart? | Una vuelta sin mirar la tabla — ¿limpia o todavía no? ¿Qué nota todavía necesita una miradita a la tabla? |
| response placeholder: e.g. clean! / still peeking at the G | ej. ¡limpia! / todavía miro la G |

**Station C — My Practice Routine — weekly check-in (never graded)**

| English | Spanish |
|---|---|
| text: Plan your practice — this one's just for you, never graded. Take two minutes to update your routine: (1) one thing you want to get better at, (2) when and where you'll practice this week, (3) how last week's plan went. Same check-in as Module 1 — we keep it going for the whole course. | Planea tu práctica — esta parte es solo para ti, nunca se califica. Tómate dos minutos para actualizar tu rutina: (1) una cosa en la que quieres mejorar, (2) cuándo y dónde vas a practicar esta semana, (3) cómo te fue con el plan de la semana pasada. El mismo check-in del Módulo 1 — lo mantenemos durante todo el curso. |
| hint: No wrong answers — even five minutes a day is better than one long rushed session. You're building a habit you'll actually keep. | No hay respuestas incorrectas — hasta cinco minutos al día es mejor que una sola sesión larga y apurada. Estás construyendo un hábito que de verdad vas a mantener. |
| response placeholder: 1) One thing to improve   2) When & where I'll practice   3) How last week went | 1) Algo que quiero mejorar   2) Cuándo y dónde voy a practicar   3) Cómo me fue la semana pasada |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Which fret made you stop and count today? Write it below — that's your first thing to drill next time you practice. | ¿Qué traste te hizo detenerte y contar hoy? Escríbelo abajo — eso es lo primero que debes practicar la próxima vez. |
| response placeholder: e.g. A string fret 7 — I keep guessing D vs E | ej. traste 7 de la cuerda La — sigo adivinando entre D y E |

**Station C — ⚡ Ear Spark — optional ear bonus**

| English | Spanish |
|---|---|
| text: ⚡ Ear Spark (optional, 2 min): shuffle six paper slips labeled E A D G B e, draw five, and record yourself plucking the open strings in that order. A few minutes later, play it back and name each string by ear before checking your slips — thickest to thinnest is E-A-D-G-B-e, and your ear learns them faster than you'd think. Got someone around? Have them pluck while you look away instead. | ⚡ Chispa de oído (opcional, 2 min): revuelve seis papelitos con las letras E A D G B e, saca cinco, y grábate pulsando las cuerdas al aire en ese orden. Unos minutos después, escucha la grabación y nombra cada cuerda de oído antes de revisar tus papelitos — de más gruesa a más delgada es E-A-D-G-B-e, y tu oído las aprende más rápido de lo que crees. ¿Tienes a alguien cerca? Pídele que pulse mientras tú miras hacia otro lado. |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| m2w1-s1 text: Recite the musical alphabet (A B C D E F G) from memory | Recitar el alfabeto musical (A B C D E F G) de memoria |
| m2w1-s1 gotItWhen: you can say A B C D E F G — and what comes after G — without pausing or looking at anything. | puedes decir A B C D E F G — y lo que viene después de G — sin pausar ni mirar nada. |
| m2w1-s1 practice prompt: What note comes after G? | ¿Qué nota viene después de G? |
| m2w1-s1 practice choices: G# / A / A# / It starts over at C | G# / A / A# / Vuelve a empezar en C |
| m2w1-s2 text: Name all natural notes on the E string (frets 0–12) | Nombrar todas las notas naturales en la cuerda Mi (trastes 0–12) |
| m2w1-s2 gotItWhen: you can draw any fret 0–12 at random — shuffled slip, or someone calling it out — and say the low-E note name instantly, without counting up from E. | puedes sacar cualquier traste del 0 al 12 al azar — un papelito revuelto, o alguien que lo diga — y decir el nombre de la nota en la Mi grave al instante, sin contar desde E. |
| m2w1-s2 practice label: Play E string 0–12 | Toca la cuerda Mi 0–12 |
| m2w1-s3 text: Name all natural notes on the A string (frets 0–12) | Nombrar todas las notas naturales en la cuerda La (trastes 0–12) |
| m2w1-s3 gotItWhen: you can draw any fret 0–12 at random — shuffled slip, or someone calling it out — and say the A-string note name instantly, without counting up from A. | puedes sacar cualquier traste del 0 al 12 al azar — un papelito revuelto, o alguien que lo diga — y decir el nombre de la nota en la cuerda La al instante, sin contar desde A. |
| m2w1-s3 practice label: Play A string 0–12 | Toca la cuerda La 0–12 |
| m2w1-s4 text: Point to any named note on E or A string when called out | Señalar cualquier nota nombrada en la cuerda Mi o La cuando se diga en voz alta |
| m2w1-s4 gotItWhen: you draw a note name from your shuffled slips (or someone calls one out) and you can put your finger on it within 3 seconds without looking at a chart. | sacas un nombre de nota de tus papelitos revueltos (o alguien lo dice) y puedes poner tu dedo ahí en 3 segundos sin mirar una tabla. |
| m2w1-s5 text: Read a basic fretboard note-name chart | Leer una tabla básica de nombres de notas del diapasón |
| m2w1-s5 gotItWhen: you can use the chart to look up a note you don't know yet — you understand what the rows and columns mean. | puedes usar la tabla para buscar una nota que todavía no sabes — entiendes lo que significan las filas y columnas. |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 2 · Notes on the E & A Strings | Módulo 2 · Notas en las cuerdas Mi y La |
| subtitle: Finger placement · Clean tone · TAB reading · 4-bar melodies | Colocación de los dedos · Tono limpio · Lectura de TAB · Melodías de 4 compases |
| skillFocus: Fretting notes cleanly · Reading basic TAB · Playing a melody in time | Trastear notas limpias · Leer TAB básico · Tocar una melodía a tiempo |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Practice TAB reading and clean notes | Practica la lectura de TAB y notas limpias |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — melodies & TAB | Estación de práctica — melodías y TAB |
| Section title: Press notes cleanly with no fret buzz | Presiona notas limpias sin zumbido |
| Section title: Read TAB & play a 4-bar melody in time at 60 BPM | Lee TAB y toca una melodía de 4 compases a tiempo a 60 BPM |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Station Wrap-Up | Cierre de la estación |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: Spider Exercises: Finger Dexterity #1 – Lauren Bateman (0:00–4:00). | Mira: Spider Exercises: Finger Dexterity #1 – Lauren Bateman (0:00–4:00). |
| hint: Try each exercise slowly on your guitar as she demonstrates. Slow and clean is better than fast and buzzy, every time. | Prueba cada ejercicio despacio en tu guitarra mientras ella lo demuestra. Despacio y limpio es siempre mejor que rápido y con zumbido. |
| response placeholder: Which exercise felt hardest, and what do you think makes it hard? | ¿Qué ejercicio se sintió más difícil, y por qué crees que es difícil? |
| text: Watch: Finger Placement to Avoid Fret Buzz (BC-106) – JustinGuitar (0:00–4:00). | Mira: Finger Placement to Avoid Fret Buzz (BC-106) – JustinGuitar (0:00–4:00). |
| hint: As he lists each cause, pause and test it on your own guitar — find your buzz before he names the fix. | Mientras él enumera cada causa, pausa y pruébala en tu propia guitarra — encuentra tu zumbido antes de que él nombre la solución. |
| response prompt: Which is the MOST common cause of fret buzz for beginners? | ¿Cuál es la causa MÁS común de zumbido para principiantes? |
| response explain: Light or too-far-from-the-fret pressure can't fully close the string — the #1 beginner cause. A wrong pick, bad tuning, or low volume won't make a note buzz. | Una presión ligera o muy alejada del traste no puede cerrar bien la cuerda — la causa número uno en principiantes. Una púa equivocada, una mala afinación o un volumen bajo no hacen que una nota zumbe. |
| response choices: Pressing the string too lightly, or too far from the fret / Using the wrong pick / The guitar being out of tune / Strumming too quietly | Presionar la cuerda demasiado suave, o muy lejos del traste / Usar la púa equivocada / Que la guitarra esté desafinada / Rasguear demasiado suave |
| text: Watch: How to Read Guitar TAB – Lauren Bateman (0:00–4:00). | Mira: How to Read Guitar TAB – Lauren Bateman (0:00–4:00). |
| hint: Pause when she shows a TAB example. Find those notes on your guitar before hitting play. | Pausa cuando ella muestre un ejemplo de TAB. Encuentra esas notas en tu guitarra antes de presionar reproducir. |
| response prompt: On a TAB diagram, the TOP line represents which string? | En un diagrama de TAB, ¿qué cuerda representa la línea de ARRIBA? |
| response explain: TAB lines mirror the strings by pitch: the TOP line is the thinnest, highest string (high e); the BOTTOM line is the low E. | Las líneas del TAB reflejan las cuerdas por su tono: la línea de ARRIBA es la cuerda más delgada y aguda (mi aguda); la línea de ABAJO es la Mi grave. |
| response choices: The high E (thinnest) string / The low E (thickest) string / The A string / It depends on the song | La cuerda mi aguda (la más delgada) / La cuerda Mi grave (la más gruesa) / La cuerda La / Depende de la canción |

**Station B — Practice TAB reading and clean notes**

| English | Spanish |
|---|---|
| text: Read this TAB: the opening of "Happy Birthday" written out on the low E string. Look at the fret numbers on the bottom line and try to play it. Click any note name below the TAB to hear how it should sound. | Lee este TAB: el inicio de "Happy Birthday" escrito en la cuerda Mi grave. Mira los números de traste en la línea de abajo e intenta tocarlo. Haz clic en cualquier nombre de nota debajo del TAB para escuchar cómo debe sonar. |
| hint: Read left-to-right, one note per beat. The numbers tell you which fret to press on the low E string. See a # (sharp)? It just means one fret higher than the plain note — F# is one fret above F. We'll cover sharps and flats later. For now, just trust the fret numbers. | Lee de izquierda a derecha, una nota por pulso. Los números te dicen qué traste presionar en la cuerda Mi grave. ¿Ves un # (sostenido)? Solo significa un traste más arriba que la nota simple — F# es un traste arriba de F. Veremos sostenidos y bemoles más adelante. Por ahora, solo confía en los números de traste. |
| tab caption: "Happy Birthday" — first two phrases · Low E string | "Happy Birthday" — primeras dos frases · cuerda Mi grave |
| text: Fret buzz self-check: play frets 1–4 on the low E string, one at a time. Press lightly until you hear buzz, then press just enough to stop it. That is the minimum pressure needed. | Autorrevisión de zumbido: toca los trastes 1–4 en la cuerda Mi grave, uno a la vez. Presiona suave hasta que escuches zumbido, y luego presiona justo lo necesario para que pare. Esa es la presión mínima necesaria. |
| hint: Most beginners press too hard. Finding the minimum pressure is a real technique. | La mayoría de los principiantes presiona demasiado fuerte. Encontrar la presión mínima es una técnica real. |
| response prompt: Where should your fingertip press to get the cleanest tone? | ¿Dónde debe presionar la punta de tu dedo para lograr el tono más limpio? |
| response explain: Press just behind the fret (toward the nut) with your fingertip — close to the wire without sitting on it gives the cleanest, buzz-free note. | Presiona justo detrás del traste (hacia la cejuela) con la punta del dedo — cerca del metal sin apoyarte encima da la nota más limpia y sin zumbido. |
| response choices: Just behind the fret (toward the nut) / On top of the fret wire / In the middle of the fret space / As close to the nut as possible | Justo detrás del traste (hacia la cejuela) / Encima del metal del traste / En medio del espacio del traste / Lo más cerca posible de la cejuela |
| text: Try reading the TAB for "Ode to Joy" or "Mary Had a Little Lamb". Play it through at least once — slow and clean. Click a song below to open its TAB. | Intenta leer el TAB de "Ode to Joy" o "Mary Had a Little Lamb". Tócalo completo al menos una vez — despacio y limpio. Haz clic en una canción abajo para abrir su TAB. |
| hint: If you get stuck on a note, use your note-name chart to find it. TAB numbers = fret numbers. | Si te atascas en una nota, usa tu tabla de nombres de notas para encontrarla. Los números del TAB = números de traste. |
| tab title: "Ode to Joy" — opening phrase | "Ode to Joy" — frase inicial |
| tab caption: A string · frets 3–10 · go slow | Cuerda La · trastes 3–10 · ve despacio |
| tab title: "Mary Had a Little Lamb" — opening phrase | "Mary Had a Little Lamb" — frase inicial |
| tab caption: A string · frets 3–7 · 7 notes | Cuerda La · trastes 3–7 · 7 notas |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: what tripped you up most today — reading the TAB, or getting a clean note with no buzz? What felt easier than you expected? | Cierre de la estación — pausa y piensa: ¿qué te costó más hoy — leer el TAB, o lograr una nota limpia sin zumbido? ¿Qué se sintió más fácil de lo que esperabas? |
| response placeholder: e.g. reading TAB was fine, but fret 1 kept buzzing | ej. leer el TAB estuvo bien, pero el traste 1 seguía zumbando |

**Station C — Press notes cleanly with no fret buzz**

| English | Spanish |
|---|---|
| text: Challenge 1 — Finger Workout: play frets 1–5 on the low E string, one finger per fret, then do the same on the A string. Keep your thumb behind the neck. You've got it when: every note rings clean with no buzz. | Reto 1 — Ejercicio de dedos: toca los trastes 1–5 en la cuerda Mi grave, un dedo por traste, y luego lo mismo en la cuerda La. Mantén el pulgar detrás del mástil. Lo tienes cuando: cada nota suena limpia sin zumbido. |
| hint: Go as slow as you need. Every note should ring cleanly with no buzz. | Ve tan despacio como necesites. Cada nota debe sonar limpia sin zumbido. |
| stuck: Use just frets 1–3 with three fingers first, then add the pinky on frets 4–5. | Usa solo los trastes 1–3 con tres dedos primero, y luego agrega el meñique en los trastes 4–5. |
| levelUp: Run the same 1-2-3-4 pattern starting at fret 5, where the stretches are smaller — notice the difference. | Haz el mismo patrón 1-2-3-4 empezando en el traste 5, donde los estiramientos son más pequeños — nota la diferencia. |
| text: Minimum-pressure drill: play frets 1–4 on the low E string one at a time. Press lightly until it buzzes, then add just enough to make it ring clean. That is your target pressure. | Ejercicio de presión mínima: toca los trastes 1–4 en la cuerda Mi grave uno a la vez. Presiona suave hasta que zumbe, y luego agrega justo lo necesario para que suene limpio. Esa es tu presión objetivo. |
| hint: Press just behind the fret, on your fingertip, thumb behind the neck. Most beginners press far too hard. | Presiona justo detrás del traste, con la punta del dedo, pulgar detrás del mástil. La mayoría de los principiantes presiona demasiado fuerte. |
| text: One-finger-per-fret check: index=1, middle=2, ring=3, pinky=4 up the low E string. Every note rings — nothing buzzes or mutes. Click to hear the clean target tone. | Revisión de un dedo por traste: índice=1, medio=2, anular=3, meñique=4 subiendo la cuerda Mi grave. Cada nota suena — nada zumba ni se apaga. Haz clic para escuchar el tono objetivo limpio. |
| hint: Keep unused fingers hovering close, ready to drop down. | Mantén los dedos que no usas flotando cerca, listos para bajar. |
| playSeq label: Target tone (frets 1–4) | Tono objetivo (trastes 1–4) |
| text: Quick check: | Revisión rápida: |
| response prompt: The note still buzzes even though you're pressing just behind the fret. What's the most likely cause? | La nota sigue zumbando aunque estás presionando justo detrás del traste. ¿Cuál es la causa más probable? |
| response explain: With good placement, buzz usually means too little pressure or a fingertip leaning over and deadening the string. Pressing harder isn't the fix — a vertical fingertip is. | Con buena colocación, el zumbido usualmente significa muy poca presión o una punta del dedo inclinada que apaga la cuerda. Presionar más fuerte no es la solución — un dedo vertical sí lo es. |
| response choices: Too little pressure, or a fingertip leaning over and muting the string / Pressing too hard on the string / The string is too new / Holding the pick too tightly | Muy poca presión, o una punta del dedo inclinada que apaga la cuerda / Presionar demasiado fuerte la cuerda / La cuerda es demasiado nueva / Sostener la púa demasiado apretada |

**Station C — Read TAB & play a 4-bar melody in time at 60 BPM**

| English | Spanish |
|---|---|
| text: Warm-up read — play this melody straight from the TAB at 60 BPM, one note per beat. Click any note name to hear how it should sound. | Lectura de calentamiento — toca esta melodía directo del TAB a 60 BPM, una nota por pulso. Haz clic en cualquier nombre de nota para escuchar cómo debe sonar. |
| hint: Read left-to-right. The numbers are fret numbers on the A string. If you buzz, fix the finger before moving on. | Lee de izquierda a derecha. Los números son números de traste en la cuerda La. Si zumbas, arregla el dedo antes de seguir. |
| tab caption: "Mary Had a Little Lamb" — A string · frets 3–7 · 60 BPM | "Mary Had a Little Lamb" — cuerda La · trastes 3–7 · 60 BPM |
| text: Challenge 2 — Play the Tune: using the TAB, play "Happy Birthday" on the E & A strings at 60 BPM, one note per beat. You've got it when: the whole melody start to finish, in time, no buzz. Click any note name to hear how it should sound. | Reto 2 — Toca la melodía: usando el TAB, toca "Happy Birthday" en las cuerdas Mi y La a 60 BPM, una nota por pulso. Lo tienes cuando: la melodía completa de principio a fin, a tiempo, sin zumbido. Haz clic en cualquier nombre de nota para escuchar cómo debe sonar. |
| hint: If you buzz on a note, stop, fix your finger position, then continue. Don't just play through the buzz. | Si zumbas en una nota, párate, arregla la posición del dedo, y luego continúa. No sigas tocando con el zumbido. |
| stuck: Play just the first phrase ("Hap-py birth-day to you") until it's smooth, then add the second. | Toca solo la primera frase ("Hap-py birth-day to you") hasta que salga suave, y luego agrega la segunda. |
| levelUp: Play it through with no note names showing, or bump the metronome to 80 BPM. | Tócala completa sin mostrar los nombres de las notas, o sube el metrónomo a 80 BPM. |
| tab caption: "Happy Birthday" — full melody · E & A strings · 60 BPM | "Happy Birthday" — melodía completa · cuerdas Mi y La · 60 BPM |
| text: Challenge 3 — Watchtower Bass Riff (your module assessment piece): using the TAB, play the "All Along the Watchtower" bass line on the low E string only — A · G · F · G, looping — one note per beat at 60 BPM. You've got it when: the riff start to finish from memory, in time, with clean tone and correct fingering. Click any note name to hear how it should sound. &#x1F9F5; Song Journey: this is Layer 2 of 5. | Reto 3 — Riff de bajo de Watchtower (tu pieza de evaluación del módulo): usando el TAB, toca la línea de bajo de "All Along the Watchtower" solo en la cuerda Mi grave — A · G · F · G, en bucle — una nota por pulso a 60 BPM. Lo tienes cuando: el riff de principio a fin de memoria, a tiempo, con tono limpio y digitación correcta. Haz clic en cualquier nombre de nota para escuchar cómo debe sonar. &#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5. |
| hint: Fingering: index on fret 1 (F), ring on fret 3 (G), pinky on fret 5 (A). Keep your thumb behind the neck. Let each note ring fully before the next. Drill it until you can run it with your eyes closed — then record yourself playing it: that's your module-end assessment piece. | Digitación: índice en el traste 1 (F), anular en el traste 3 (G), meñique en el traste 5 (A). Mantén el pulgar detrás del mástil. Deja que cada nota suene por completo antes de la siguiente. Practícalo hasta que puedas tocarlo con los ojos cerrados — luego grábate tocándolo: esa es tu pieza de evaluación de fin de módulo. |
| stuck: Loop just F–G (frets 1–3) until the finger change is clean, then add the A on fret 5. | Repite solo F–G (trastes 1–3) hasta que el cambio de dedo salga limpio, y luego agrega el A en el traste 5. |
| levelUp: Run the whole riff with your eyes closed — that's the real "from memory" test. | Toca el riff completo con los ojos cerrados — esa es la verdadera prueba "de memoria". |
| tab caption: "All Along the Watchtower" — bass-note riff · Low E string · loops · 60 BPM | "All Along the Watchtower" — riff de bajo · cuerda Mi grave · en bucle · 60 BPM |
| response prompt: Personal record: once it loops clean at 60, raise the metronome +10 at a time. Your fastest CLEAN loop today (BPM)? | Récord personal: una vez que el bucle salga limpio a 60, sube el metrónomo de 10 en 10. ¿Cuál es tu bucle LIMPIO más rápido hoy (BPM)? |
| response placeholder: e.g. 100 — try for a higher number next session | ej. 100 — intenta superarlo la próxima sesión |
| text: Bonus riff — "Sweet Child O' Mine" (Guns N' Roses) bass roots on the E & A strings: play the root note under each verse chord — D · C · G · D — one per bar at 60 BPM. Click any note name to hear how it should sound. &#x1F9F5; Song Journey: this is Layer 2 of 5. | Riff extra — raíces de bajo de "Sweet Child O' Mine" (Guns N' Roses) en las cuerdas Mi y La: toca la nota raíz bajo cada acorde de la estrofa — D · C · G · D — una por compás a 60 BPM. Haz clic en cualquier nombre de nota para escuchar cómo debe sonar. &#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5. |
| hint: These are the roots of the D–C–G verse loop. Note: the original recording is tuned a half-step lower, so your notes will sound slightly higher than the recording — that's normal, not a mistake. The famous intro riff comes later in the course (an optional harder challenge in Module 7!). | Estas son las raíces del bucle D–C–G de la estrofa. Nota: la grabación original está afinada medio tono más abajo, así que tus notas sonarán un poco más agudas que la grabación — eso es normal, no un error. El famoso riff de intro llega más adelante en el curso (¡un reto opcional más difícil en el Módulo 7!). |
| tab caption: "Sweet Child O' Mine" — verse bass roots · E & A strings · 60 BPM | "Sweet Child O' Mine" — raíces de bajo de la estrofa · cuerdas Mi y La · 60 BPM |
| text: Quick check on reading TAB: | Revisión rápida sobre la lectura de TAB: |
| response prompt: In TAB the bottom line is the low E string and the line above it is the A string. A "3" on the A-string line is which note? | En el TAB la línea de abajo es la cuerda Mi grave y la línea de arriba es la cuerda La. Si ves un "3" en la línea de la cuerda La, ¿qué nota es? |
| response explain: From open A: A(0)–A#(1)–B(2)–C(3). A "3" on the A-string line is C. | Desde la A al aire: A(0)–A#(1)–B(2)–C(3). Un "3" en la línea de la cuerda La es C. |
| response choices: B / C / D / G | B / C / D / G |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Watchtower bass line: play the "All Along the Watchtower" bass loop on the low E string — A · G · F · G — one note per beat at 60 BPM, four laps without stopping. You've got it when: four laps, every note landing on the click. &#x1F9F5; Song Journey: this is Layer 2 of 5. | Reto — Línea de bajo de Watchtower: toca el bucle de bajo de "All Along the Watchtower" en la cuerda Mi grave — A · G · F · G — una nota por pulso a 60 BPM, cuatro vueltas sin parar. Lo tienes cuando: cuatro vueltas, cada nota cayendo con el clic. &#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5. |
| hint: Three notes carry this whole song. Keep your eyes one note ahead of your pick. | Tres notas sostienen toda esta canción. Mantén tus ojos una nota por delante de tu púa. |
| stuck: Loop just A → G until the shift is smooth, then add the F. | Repite solo A → G hasta que el cambio sea suave, y luego agrega el F. |
| levelUp: Say each note name out loud while playing, or double the loop to eight laps without a stumble. | Di cada nombre de nota en voz alta mientras tocas, o duplica el bucle a ocho vueltas sin tropezar. |
| tab caption: "All Along the Watchtower" — bass loop · Low E string · 60 BPM | "All Along the Watchtower" — bucle de bajo · cuerda Mi grave · 60 BPM |
| response prompt: How many clean laps in a row did you get at 60 BPM? | ¿Cuántas vueltas limpias seguidas lograste a 60 BPM? |
| response placeholder: e.g. 4 — try for a higher number next session | ej. 4 — intenta superarlo la próxima sesión |
| text: Challenge — Seven Nation Army, true pitch: play the riff where the record actually lives — on the A string — E · E · G · E · D · C · B at 60 BPM. You've got it when: two clean laps, and you can say which string version sounds like the recording. &#x1F9F5; Song Journey: this is Layer 2 of 5. | Reto — Seven Nation Army, tono real: toca el riff donde realmente vive en la grabación — en la cuerda La — E · E · G · E · D · C · B a 60 BPM. Lo tienes cuando: dos vueltas limpias, y puedes decir qué versión de cuerda suena como la grabación. &#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5. |
| hint: Same riff, new string, new note names. Notice how the shape of the moves feels the same even though every name changed. | El mismo riff, una nueva cuerda, nuevos nombres de notas. Fíjate en cómo la forma de los movimientos se siente igual aunque cada nombre cambió. |
| stuck: Go back to your low-E version for one lap to remind your hand of the moves, then bring it up to the A string. | Regresa a tu versión de la Mi grave por una vuelta para recordarle a tu mano los movimientos, y luego llévalo a la cuerda La. |
| levelUp: Alternate laps: one on low E, one on the A string, without stopping between. | Alterna vueltas: una en la Mi grave, una en la cuerda La, sin parar entre ellas. |
| tab caption: "Seven Nation Army" — riff at true pitch · A string · 60 BPM | "Seven Nation Army" — riff en tono real · cuerda La · 60 BPM |
| response prompt: Which version do you like playing more — low E or A string — and why? | ¿Qué versión te gusta más tocar — Mi grave o cuerda La — y por qué? |
| response placeholder: e.g. A string, it sounds like the song | ej. cuerda La, suena como la canción |
| text: Challenge — "the cure," root line: play the roots of Olivia Rodrigo's "the cure" across both strings — A · C · D · F · G — two beats per note at 60 BPM. You've got it when: two clean laps crossing between the A and E strings without looking down. | Reto — "the cure," línea de raíces: toca las raíces de "the cure" de Olivia Rodrigo cruzando ambas cuerdas — A · C · D · F · G — dos pulsos por nota a 60 BPM. Lo tienes cuando: dos vueltas limpias cruzando entre las cuerdas La y Mi sin mirar hacia abajo. |
| hint: This is the simplest outline of the song — next module these exact roots become power chords. Learn where they live now and Module 3 is half done. | Este es el esquema más simple de la canción — en el próximo módulo estas mismas raíces se convierten en acordes de potencia. Aprende dónde viven ahora y el Módulo 3 estará medio hecho. |
| stuck: Split it by string: A · C · D on the A string first, then F · G on the low E, then join them. | Divídelo por cuerda: A · C · D en la cuerda La primero, luego F · G en la Mi grave, y luego únelas. |
| levelUp: Play the lap with the play button keeping the beat, or say each note name as you land it. Got someone around? Have them clap the beat instead. | Toca la vuelta con el botón de reproducir marcando el pulso, o di cada nombre de nota al aterrizarla. ¿Tienes a alguien cerca? Pídele que marque el pulso con palmas en su lugar. |
| tab caption: "the cure" — root line (teaching arrangement) · 60 BPM | "the cure" — línea de raíces (arreglo didáctico) · 60 BPM |
| response prompt: Which move was harder — crossing strings from D down to F, or walking up the same string from F to G? | ¿Qué movimiento fue más difícil — cruzar de cuerda de D a F, o subir por la misma cuerda de F a G? |
| response placeholder: e.g. D to F — big jump | ej. D a F — un salto grande |
| text: Challenge — Luna, bass roots: Luna rides two chords — F and Am — so its bassline is two notes. Play F (low E string, fret 1) and A (open A string) as single notes, two big beats each: the song is in 6/8, so feel the pulse in 2 and land each note on a downbeat. You've got it when: four laps of F → A, both notes clean with no buzz, locked to the downbeats at 60 BPM. &#x1F9F5; Song Journey: this is Layer 2 of 5. | Reto — Luna, raíces de bajo: Luna se apoya en dos acordes — F y Am — así que su línea de bajo son dos notas. Toca F (cuerda Mi grave, traste 1) y A (cuerda La al aire) como notas individuales, dos pulsos grandes cada una: la canción está en 6/8, así que siente el pulso en 2 y aterriza cada nota en un tiempo fuerte. Lo tienes cuando: cuatro vueltas de F → A, ambas notas limpias sin zumbido, ajustadas a los tiempos fuertes a 60 BPM. &#x1F9F5; Recorrido de la canción: esto es la Capa 2 de 5. |
| hint: Fret 1 is the tightest squeeze on the neck — press right behind the fret wire with the tip of your index and the F will ring clean. | El traste 1 es el aprieto más fuerte del mástil — presiona justo detrás del metal del traste con la punta de tu índice y el F sonará limpio. |
| stuck: Park on just the F: pluck, listen, adjust, until five ring in a row. Then add the open A — that one's free. | Quédate solo en el F: pulsa, escucha, ajusta, hasta que salgan cinco seguidas. Luego agrega la A al aire — esa es gratis. |
| levelUp: Trade the open A for fret 5 on the low E — same note, new position. Want the simplified requinto intro line (a requinto is a small, higher-pitched guitar that plays the lead melody)? It's the bonus Layer 6 on the Luna Song Journey. | Cambia la A al aire por el traste 5 de la Mi grave — la misma nota, una posición nueva. ¿Quieres la línea de intro simplificada de requinto (un requinto es una guitarra pequeña y de tono más agudo que toca la melodía principal)? Es la Capa 6 extra en el Recorrido de la canción de Luna. |
| text: Challenge — Let It Be, bass line: play the roots of "Let It Be" (Beatles) on the low E & A strings — C · G · A · F, two beats each at 60 BPM. These four notes are the simple bass outline of the whole song — you'll play "Let It Be" as a core song starting in Module 5, so learn where its roots live now. You've got it when: two clean laps of C–G–A–F, every note ringing, each landing on the beat. | Reto — Let It Be, línea de bajo: toca las raíces de "Let It Be" (Beatles) en las cuerdas Mi y La — C · G · A · F, dos pulsos cada una a 60 BPM. Estas cuatro notas son el esquema simple de bajo de toda la canción — vas a tocar "Let It Be" como canción principal a partir del Módulo 5, así que aprende dónde viven sus raíces desde ahora. Lo tienes cuando: dos vueltas limpias de C–G–A–F, cada nota sonando, cada una cayendo en el pulso. |
| hint: C is A-string fret 3 (ring finger), G is low-E fret 3 (ring finger), A is the open A string, F is low-E fret 1 (index). Watch the crossings between the two strings and keep your thumb behind the neck. Click any note name to hear how it should sound. | C es el traste 3 de la cuerda La (dedo anular), G es el traste 3 de la Mi grave (dedo anular), A es la cuerda La al aire, F es el traste 1 de la Mi grave (índice). Fíjate en los cruces entre las dos cuerdas y mantén el pulgar detrás del mástil. Haz clic en cualquier nombre de nota para escuchar cómo debe sonar. |
| stuck: Split it by string: play C then A (both on the A string), then G then F (both on the low E), then join all four in order. | Divídelo por cuerda: toca C y luego A (ambas en la cuerda La), luego G y luego F (ambas en la Mi grave), y luego une las cuatro en orden. |
| levelUp: Say each root name out loud as you land it, or run four laps in a row without stopping. | Di cada nombre de raíz en voz alta al aterrizarla, o haz cuatro vueltas seguidas sin parar. |
| tab caption: "Let It Be" — bass roots · E & A strings · two beats each · 60 BPM | "Let It Be" — raíces de bajo · cuerdas Mi y La · dos pulsos cada una · 60 BPM |
| response prompt: Which string crossing was trickiest — C down to G, or A down to F? | ¿Qué cruce de cuerda fue más complicado — C bajando a G, o A bajando a F? |
| response placeholder: e.g. A to F — the jump across strings | ej. A a F — el salto entre cuerdas |
| text: Challenge — Mystery TAB (sight-read it cold): here's a 2-bar melody you've never heard. Do NOT press ▶ Play tab first. Read it straight off the page — work out each string and fret and play all the way through, one note per beat at 60 BPM — THEN press ▶ Play tab to check yourself. You've got it when: you play it correctly on the first cold read, before ever hearing it. That's real sight-reading, and it's exactly what your module assessment asks for. | Reto — TAB misterioso (léelo a primera vista, en frío): aquí hay una melodía de 2 compases que nunca has escuchado. NO presiones ▶ Tocar el tab primero. Léela directo de la página — descifra cada cuerda y traste y tócala completa, una nota por pulso a 60 BPM — LUEGO presiona ▶ Tocar el tab para revisarte. Lo tienes cuando: la tocas correctamente en la primera lectura en frío, antes de escucharla siquiera. Eso es lectura a primera vista real, y es exactamente lo que pide tu evaluación del módulo. |
| hint: This is the whole point of sight-reading: playing music you don't already know by ear. Bottom line = low E, the line above it = A, the next one up = D. Every fret here is 0–3 on the A and D strings. Say each note name before you pluck it, then use ▶ Play tab as your answer key — only after you've played it yourself. | Este es todo el punto de la lectura a primera vista: tocar música que todavía no conoces de oído. Línea de abajo = Mi grave, la línea de arriba = La, la siguiente hacia arriba = Re. Cada traste aquí es 0–3 en las cuerdas La y Re. Di cada nombre de nota antes de pulsarla, y luego usa ▶ Tocar el tab como tu clave de respuestas — solo después de haberla tocado tú. |
| stuck: Break it into two 1-bar halves: read and play the first four notes clean, then the last four, then join them. Peeking at your note-name chart to find a fret is fine — hitting Play tab to hear the tune first is not (hearing it cold is the part you're testing). | Divídela en dos mitades de 1 compás: lee y toca limpias las primeras cuatro notas, luego las últimas cuatro, y luego únelas. Ver tu tabla de nombres de notas para encontrar un traste está bien — presionar Tocar el tab para escuchar la melodía primero no lo está (escucharla en frío es lo que estás poniendo a prueba). |
| levelUp: Cover the note names and read from the fret numbers alone, or play it once, look away, and try to play it back from memory. | Cubre los nombres de las notas y lee solo con los números de traste, o tócala una vez, mira hacia otro lado, e intenta tocarla de nuevo de memoria. |
| tab caption: Mystery melody — sight-read cold · A & D strings · frets 0–3 · 60 BPM | Melodía misteriosa — lectura en frío · cuerdas La y Re · trastes 0–3 · 60 BPM |
| response prompt: First cold read — did your played version match the ▶ Play tab check? Which note (if any) did you misread? | Primera lectura en frío — ¿tu versión tocada coincidió con la revisión de ▶ Tocar el tab? ¿Qué nota (si acaso) leíste mal? |
| response placeholder: e.g. matched! / misread the D-string fret 2 | ej. ¡coincidió! / leí mal el traste 2 de la cuerda Re |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Which part of your Watchtower assessment riff still needs work? Write it below — that's your warm-up target next time you practice. | ¿Qué parte de tu riff de evaluación de Watchtower todavía necesita trabajo? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez que practiques. |
| response placeholder: e.g. the F-to-G change on frets 1 and 3 is shaky | ej. el cambio de F a G en los trastes 1 y 3 sale inestable |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| m2w2-s1 text: Press notes cleanly — no buzzing — by pressing just behind the fret | Presionar notas limpias — sin zumbido — presionando justo detrás del traste |
| m2w2-s1 gotItWhen: you play frets 1–5 on the E string and every note sustains cleanly — no buzzing, no muffling. | tocas los trastes 1–5 en la cuerda Mi y cada nota suena limpia y sostenida — sin zumbido, sin apagarse. |
| m2w2-s2 text: Use correct finger per fret (index=1, middle=2, ring=3, pinky=4) | Usar el dedo correcto por traste (índice=1, medio=2, anular=3, meñique=4) |
| m2w2-s2 gotItWhen: your index finger always plays fret 1, middle plays fret 2, ring plays fret 3, pinky plays fret 4 — without having to think about it. | tu dedo índice siempre toca el traste 1, el medio toca el 2, el anular toca el 3, el meñique toca el 4 — sin tener que pensarlo. |
| m2w2-s3 text: Keep unused fingers hovering close to the strings | Mantener los dedos que no usas flotando cerca de las cuerdas |
| m2w2-s3 gotItWhen: your fingers that aren't pressing a note stay within about a centimeter of the strings, ready to drop down. | los dedos que no están presionando una nota se quedan a un centímetro más o menos de las cuerdas, listos para bajar. |
| m2w2-s4 text: Sight-read a basic 2-bar TAB line (strings, fret numbers, left-to-right order) | Leer a primera vista una línea básica de TAB de 2 compases (cuerdas, números de traste, orden de izquierda a derecha) |
| m2w2-s4 gotItWhen: you can look at a short TAB line you haven't drilled, identify which string and fret each number refers to, and play it — that's sight-reading. | puedes ver una línea corta de TAB que no has practicado, identificar a qué cuerda y traste se refiere cada número, y tocarla — eso es lectura a primera vista. |
| m2w2-s4 practice prompt: In TAB, the bottom line is the low E string and the line above it is the A string. If you see a "3" on the A-string line, which note do you play? | En el TAB, la línea de abajo es la cuerda Mi grave y la línea de arriba es la cuerda La. Si ves un "3" en la línea de la cuerda La, ¿qué nota tocas? |
| m2w2-s4 practice choices: B / C / D / G | B / C / D / G |
| m2w2-s5 text: Play a 4-bar melody in time at 60 BPM | Tocar una melodía de 4 compases a tiempo a 60 BPM |
| m2w2-s5 gotItWhen: you can play the Happy Birthday phrase all the way through at 60 BPM without stopping to find a note. | puedes tocar la frase de Happy Birthday completa a 60 BPM sin detenerte a buscar una nota. |
| m2w2-s6 text: Keep thumb behind the neck throughout | Mantener el pulgar detrás del mástil todo el tiempo |
| m2w2-s6 gotItWhen: your thumb stays roughly behind your middle finger on the back of the neck — not hooked over the top. | tu pulgar se queda más o menos detrás de tu dedo medio en la parte de atrás del mástil — no enganchado por encima. |

### Module-level Songs

| English | Spanish |
|---|---|
| "All Along the Watchtower" — Dylan / Hendrix — meta: Play bass-note riff on low E string from memory | Toca de memoria el riff de notas graves en la cuerda Mi grave |
| "Seven Nation Army" — The White Stripes — meta: E string TAB — great first riff | TAB en la cuerda Mi — un gran primer riff |
| "Luna" — Peso Pluma, Junior H — meta: Listen ahead — our Latin core song; you play its bass roots this module | Escucha con anticipación — nuestra canción principal en español; tocas sus notas graves este módulo |
| "Sweet Child O' Mine" — Guns N' Roses — meta: Play verse bass roots on E & A strings · intro riff = optional harder challenge in Module 7 | Toca las notas graves del verso en las cuerdas Mi y La · el riff de la intro es un reto opcional más difícil en el Módulo 7 |
| "the cure" — Olivia Rodrigo — meta: Play the bassline as single-note roots (A C D F G) | Toca la línea de bajo como notas individuales (A C D F G) |
| "Happy Birthday" — meta: Play full melody on E & A strings from TAB | Toca la melodía completa en las cuerdas Mi y La usando el TAB |
| "Smoke on the Water" — Deep Purple — meta: E string TAB — iconic beginner riff | TAB en la cuerda Mi — un riff icónico para principiantes |
| "La Bamba" — Ritchie Valens — meta: Iconic single-note intro riff · C–F–G roots | Riff de intro icónico con notas individuales · notas graves C–F–G |
| "Come As You Are" — Nirvana — meta: Partial riff on A string | Riff parcial en la cuerda La |
| "Crazy Train" — Ozzy Osbourne — meta: Intro notes on E string | Notas de la intro en la cuerda Mi |
| "Beat It" — Michael Jackson — meta: Intro riff on E string | Riff de la intro en la cuerda Mi |

### Module Review

| English | Spanish |
|---|---|
| module: Notes on the E & A Strings | Notas en las cuerdas Mi y La |
| skill mr2-s1: I can recite the musical alphabet (A–G) from memory, including what comes after G | Puedo recitar el alfabeto musical (A–G) de memoria, incluyendo lo que viene después de G |
| skill mr2-s2: I can name all natural notes on the E string (frets 0–12) | Puedo nombrar todas las notas naturales en la cuerda Mi (trastes 0–12) |
| skill mr2-s3: I can name all natural notes on the A string (frets 0–12) | Puedo nombrar todas las notas naturales en la cuerda La (trastes 0–12) |
| skill mr2-s4: I can press notes cleanly with no fret buzz | Puedo presionar notas limpias sin zumbido |
| skill mr2-s6: I can use one finger per fret (index=1, middle=2, ring=3, pinky=4) | Puedo usar un dedo por traste (índice=1, medio=2, anular=3, meñique=4) |
| skill mr2-s5: I can read a basic TAB and play a 4-bar melody in time at 60 BPM | Puedo leer un TAB básico y tocar una melodía de 4 compases a tiempo a 60 BPM |
| assessItem: Name the notes on the E and A strings from memory through fret 12 | Nombrar las notas en las cuerdas Mi y La de memoria hasta el traste 12 |
| assessItem: Play "All Along the Watchtower" bass-note line using only the E string — or the single-note root line from "the cure" — from memory, to the metronome at 60 BPM without stopping, with clean tone and correct fingering (one finger per fret, thumb behind the neck) | Tocar la línea de bajo de "All Along the Watchtower" usando solo la cuerda Mi grave — o la línea alterna de raíces de una sola nota de "the cure" — de memoria, con el metrónomo a 60 BPM sin detenerse, con tono limpio y digitación correcta (un dedo por traste, pulgar detrás del mástil) |
| assessItem: Sight-read a short 2-bar bass line from TAB and play it | Leer a primera vista una línea corta de bajo de 2 compases desde el TAB y tocarla |
| forward: The E & A notes you just learned become the roots of every power chord in Module 3 — when you play an A5 or G5, you're landing on the exact frets you just memorized. Knowing the fretboard is what lets you move chords around freely. | Las notas de Mi y La que acabas de aprender se convierten en las raíces de todos los acordes de potencia del Módulo 3 — cuando tocas un A5 o un G5, estás cayendo exactamente en los trastes que acabas de memorizar. Conocer el diapasón es lo que te permite mover los acordes con libertad. |

## Module 3 — Two-Finger Power Chords

### Set 1

| English | Spanish |
|---|---|
| unit: Module 3 · Two-Finger Power Chords | Módulo 3 · Acordes de potencia con dos dedos |
| subtitle: Power chord shape · Moving on E & A strings · Muting | Forma del acorde de potencia · Moverse por las cuerdas Mi y La · Silenciar cuerdas |
| skillFocus: Fretting a clean power chord · Moving the shape along the E and A strings · Reading power-chord TAB | Trastear un acorde de potencia limpio · Mover la forma por las cuerdas Mi y La · Leer TAB de acordes de potencia |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: See the power chord shape move | Mira moverse la forma del acorde de potencia |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — power chord drill | Estación de práctica — ejercicio de acordes de potencia |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Fret a clean power chord & mute unused strings | Trastea un acorde de potencia limpio y silencia las cuerdas que no uses |
| Section title: Move the power chord shape along the E & A strings | Mueve la forma del acorde de potencia por las cuerdas Mi y La |
| Section title: Name the root as you climb the neck (E & A strings) | Nombra la raíz mientras subes por el mástil (cuerdas Mi y La) |
| Section title: Play a power chord progression in time | Toca una progresión de acordes de potencia a tiempo |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: My Practice Routine — weekly check-in (never graded) | Mi rutina de práctica — check-in semanal (nunca se califica) |
| Section title: ⚡ Ear Spark — optional ear bonus | ⚡ Chispa auditiva — bono opcional de oído |

**Station B — See the power chord shape move**

| English | Spanish |
|---|---|
| text: Power chord shape — see it move: here are E5, G5, and A5. It's the SAME two-finger shape (index on the root, ring finger two frets up on the next string — for E5 the root is the open low E, so no index finger is needed, just the ring) just slid to a new fret. Press ▶ to hear the root climb E → G → A, then build each shape on your guitar. | Forma del acorde de potencia — míralo moverse: aquí están E5, G5 y A5. Es la MISMA forma con dos dedos (el índice en la raíz, el anular dos trastes más arriba en la siguiente cuerda — para E5 la raíz es la Mi grave al aire, así que no hace falta el índice, solo el anular) simplemente deslizada a un traste nuevo. Presiona ▶ para escuchar la raíz subir E → G → A, y luego arma cada forma en tu guitarra. |
| hint: Your index finger names the chord — it sits on the root. The ring finger always lands two frets higher, on the next string. Pause and match each diagram before moving on. | Tu dedo índice le da el nombre al acorde — se coloca en la raíz. El anular siempre cae dos trastes más arriba, en la siguiente cuerda. Pausa e iguala cada diagrama antes de seguir. |
| playSeq label: Hear the roots climb (E · G · A) | Escucha subir las raíces (E · G · A) |
| response prompt: E5, G5, and A5 are played with… | E5, G5 y A5 se tocan con… |
| response explain: A power chord is one movable shape — slide the same two-finger grip to a new fret and the root note (and the chord name) changes. | Un acorde de potencia es una sola forma movible — desliza el mismo agarre de dos dedos a un traste nuevo y la nota raíz (y el nombre del acorde) cambia. |
| response choices: Three completely different shapes / The same shape moved to different frets / All your fingers on different strings / Only open strings | Tres formas completamente distintas / La misma forma movida a distintos trastes / Todos tus dedos en cuerdas diferentes / Solo cuerdas al aire |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: What Is A Power Chord? Easy Rock Guitar Chords – Lauren Bateman (0:00–4:00). | Mira: What Is A Power Chord? Easy Rock Guitar Chords – Lauren Bateman (0:00–4:00). |
| hint: Focus on the two-finger shape — which fingers go where, and how the note under your index finger names the chord. Try the shape on your guitar as she shows it. | Fíjate en la forma con dos dedos — qué dedo va dónde, y cómo la nota bajo tu dedo índice le da nombre al acorde. Prueba la forma en tu guitarra mientras ella la muestra. |
| response placeholder: Describe the power chord shape in your own words — which fingers go where, and what names the chord? | Describe con tus propias palabras la forma del acorde de potencia — qué dedo va dónde, y qué le da el nombre al acorde? |
| text: Watch: Power Chords for Beginners – Marty Music (0:00–3:00). | Mira: Power Chords for Beginners – Marty Music (0:00–3:00). |
| hint: Notice how he moves the same shape to different positions. As he does, slide your own shape along to A5 and G5 with him. | Fíjate en cómo él mueve la misma forma a distintas posiciones. Mientras lo hace, desliza tu propia forma hasta A5 y G5 junto con él. |
| response prompt: If you play the same power chord shape with your index finger on the 5th fret of the low E string, what chord is it? | Si tocas la misma forma de acorde de potencia con tu dedo índice en el traste 5 de la cuerda Mi grave, ¿qué acorde es? |
| response explain: The root sets the name. Fret 5 of the low E is A, so the power chord rooted there is A5. | La raíz determina el nombre. El traste 5 de la Mi grave es A, así que el acorde de potencia con esa raíz es A5. |
| response choices: A5 / G5 / C5 / E5 | A5 / G5 / C5 / E5 |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: which felt harder today — getting both notes to ring clean, or stopping the other strings from sounding? What started to help? | Cierre de la estación — pausa y piensa: ¿qué se sintió más difícil hoy — lograr que las dos notas suenen limpias, o evitar que sonaran las otras cuerdas? ¿Qué empezó a ayudarte? |
| response placeholder: e.g. muting — my strumming hand kept letting the high strings ring | p. ej. silenciar — mi mano de rasgueo seguía dejando sonar las cuerdas agudas |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Tuning (Module 1) is a skill you keep forever. 60 seconds here makes everything today sound better. | Afinar (Módulo 1) es una destreza que conservas para siempre. 60 segundos aquí hacen que todo suene mejor hoy. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Fret a clean power chord & mute unused strings**

| English | Spanish |
|---|---|
| text: Challenge 1 — Clean E5: fret an E5 power chord (low E open root + 2nd fret A string) and strum just those two strings — no others. You've got it when: a clean, buzz-free E5 with nothing else ringing. | Reto 1 — E5 limpio: trastea un acorde de potencia E5 (raíz Mi grave al aire + traste 2 de la cuerda La) y rasguea solo esas dos cuerdas — ninguna otra. Lo tienes cuando: un E5 limpio, sin zumbido, y nada más sonando. |
| hint: For E5 the root is the OPEN low E — no index finger needed. Just place your ring finger on the A string, 2nd fret (that note is the chord's fifth). Keep your pinky close. Palm-mute the strings below with the edge of your picking hand. | Para E5 la raíz es la Mi grave AL AIRE — no hace falta el dedo índice. Solo coloca tu dedo anular en la cuerda La, traste 2 (esa nota es la quinta del acorde). Mantén tu meñique cerca. Silencia con la palma las cuerdas de abajo usando el borde de tu mano de pulsar. |
| stuck: Pluck the two notes one at a time first — make sure each rings alone — then strum them together. | Pulsa las dos notas una a la vez primero — asegúrate de que cada una suene sola — y luego rasguéalas juntas. |
| levelUp: Lift right off and re-fret the chord 5 times in a row, clean every single time. | Levanta la mano por completo y vuelve a trastear el acorde 5 veces seguidas, limpio cada vez. |
| text: Challenge 2 — Mute Check: fret your E5 and strum hard across ALL six strings. You've got it when: strum all six strings but only the two power-chord notes ring — the other four stay silent. | Reto 2 — Revisión de silenciado: trastea tu E5 y rasguea fuerte las SEIS cuerdas. Lo tienes cuando: rasgueas las seis cuerdas pero solo suenan las dos notas del acorde de potencia — las otras cuatro quedan en silencio. |
| hint: Let your fretting ring finger lean to deaden the strings above, and rest the side of your strumming hand lightly on the strings below the chord. A hard strum should still sound like just two notes. | Deja que tu dedo anular al trastear se incline para apagar las cuerdas de arriba, y apoya el borde de tu mano de rasgueo suavemente sobre las cuerdas debajo del acorde. Un rasgueo fuerte debe seguir sonando como solo dos notas. |
| stuck: Mute with the fretting hand first — let a finger lightly touch the strings you're not playing — then add the side of your strumming hand. | Silencia primero con la mano de trastear — deja que un dedo toque suavemente las cuerdas que no estás tocando — y luego agrega el borde de tu mano de rasgueo. |
| levelUp: Do the same on G5 and A5, where your hand has to shift up the neck and re-find the mute. | Haz lo mismo con G5 y A5, donde tu mano tiene que desplazarse por el mástil y volver a encontrar el silenciado. |

**Station C — Move the power chord shape along the E & A strings**

| English | Spanish |
|---|---|
| text: Challenge 3 — Shape Shifter: slide the same shape to A5 (5th fret E), G5 (3rd fret E), D5 (5th fret A), and C5 (3rd fret A), saying each name aloud. You've got it when: hit all four cleanly without losing the shape. | Reto 3 — Cambiaformas: desliza la misma forma a A5 (traste 5 de Mi), G5 (traste 3 de Mi), D5 (traste 5 de La), y C5 (traste 3 de La), diciendo cada nombre en voz alta. Lo tienes cuando: tocas las cuatro limpias sin perder la forma. |
| hint: Keep the same finger shape and just move it along the neck. The gap between your two fingers never changes. | Mantén la misma forma de dedos y solo muévela por el mástil. La distancia entre tus dos dedos nunca cambia. |
| stuck: Park on just G5 and A5 (both E-string) and switch between them until it's smooth, then add the A-string chords. | Quédate solo con G5 y A5 (ambos en la cuerda Mi) y alterna entre ellos hasta que salga fluido, y luego agrega los acordes de la cuerda La. |
| levelUp: Make quick flashcards (E5, A5, C5, D5…), shuffle them, and find each chord within 3 seconds of flipping a card — no counting frets. Got someone around? Have them call out chords instead. | Haz tarjetas rápidas (E5, A5, C5, D5…), mézclalas, y encuentra cada acorde en menos de 3 segundos al voltear una tarjeta — sin contar trastes. ¿Tienes a alguien cerca? Pídele que diga los acordes en voz alta en tu lugar. |

**Station C — Name the root as you climb the neck (E & A strings)**

| English | Spanish |
|---|---|
| text: Challenge 4 — Name & Climb (E string): walk the power chord UP the low E string and say each root aloud as you land it — E5 (open), F5 (1), G5 (3), A5 (5), B5 (7), C5 (8), D5 (10), E5 (12). You've got it when: name every root correctly, without looking at the chart, all the way to the 12th fret. | Reto 4 — Nombra y sube (cuerda Mi): camina el acorde de potencia SUBIENDO por la cuerda Mi grave y di cada raíz en voz alta al llegar a ella — E5 (al aire), F5 (1), G5 (3), A5 (5), B5 (7), C5 (8), D5 (10), E5 (12). Lo tienes cuando: nombras cada raíz correctamente, sin mirar el diagrama, hasta el traste 12. |
| hint: You learned every note on the low E string in Module 2 — this is that same map. The root is wherever your index finger sits. Hit the natural notes; skip the sharps for now. | Aprendiste todas las notas de la cuerda Mi grave en el Módulo 2 — es el mismo mapa. La raíz es donde sea que esté tu dedo índice. Toca las notas naturales; sáltate los sostenidos por ahora. |
| stuck: Do frets 0–7 only first (E5–B5), then add 8–12 once those are automatic. | Haz solo los trastes 0–7 primero (E5–B5), y luego agrega el 8–12 una vez que esos sean automáticos. |
| levelUp: Name your way back DOWN the string (12 → 0) without counting, or do the lap (a lap = one full time through) at 80 BPM. | Nombra tu camino de regreso BAJANDO por la cuerda (12 → 0) sin contar, o haz la vuelta (una vuelta = un recorrido completo) a 80 BPM. |
| text: Challenge 5 — Name & Climb (A string): now do the same up the A string — A5 (open), B5 (2), C5 (3), D5 (5), E5 (7), F5 (8), G5 (10), A5 (12). You've got it when: name every root correctly, and notice the same note names land in different spots than they did on the E string. | Reto 5 — Nombra y sube (cuerda La): ahora haz lo mismo subiendo por la cuerda La — A5 (al aire), B5 (2), C5 (3), D5 (5), E5 (7), F5 (8), G5 (10), A5 (12). Lo tienes cuando: nombras cada raíz correctamente, y notas que los mismos nombres de nota caen en lugares distintos a los de la cuerda Mi. |
| hint: These are the A-string notes from Module 2. Keep the low E muted so only the power chord rings. Same note, new home — that's how the fretboard works. | Estas son las notas de la cuerda La del Módulo 2. Mantén la Mi grave silenciada para que solo suene el acorde de potencia. La misma nota, un nuevo hogar — así funciona el diapasón. |
| stuck: Cover frets 0–5 (A5–D5) without looking at the chart first, then add the rest. | Cubre los trastes 0–5 (A5–D5) sin mirar el diagrama primero, y luego agrega el resto. |
| levelUp: Write random frets (0–12) for either string on flashcards, shuffle, and name each root on the spot as you flip. Got someone around? Have them call out frets instead. | Escribe trastes al azar (0–12) de cualquiera de las dos cuerdas en tarjetas, mézclalas, y nombra cada raíz al instante al voltearlas. ¿Tienes a alguien cerca? Pídele que diga los trastes en voz alta en tu lugar. |

**Station C — Play a power chord progression in time**

| English | Spanish |
|---|---|
| text: Challenge 6 — Watchtower Loop (your assessment piece): play A5–G5–F5–G5, one bar (4 beats) per chord, one strum per beat at 60 BPM. You've got it when: four times through, changing on beat 1 every time, with no stops. Song Journey: this is Layer 3 of 5. | Reto 6 — Vuelta de Watchtower (tu pieza de evaluación): toca A5–G5–F5–G5, un compás (4 tiempos) por acorde, un rasgueo por tiempo a 60 BPM. Lo tienes cuando: cuatro veces seguidas, cambiando en el tiempo 1 cada vez, sin detenerte. Recorrido de la canción: esto es la Capa 3 de 5. |
| hint: A5 = 5th fret E string, G5 = 3rd fret E string, F5 = 1st fret E string. Shift smoothly — aim to land exactly on beat 1. (The original song uses an Am chord, but as a power chord it's just A5 — no major or minor.) This is your Set 1 check-off loop — record a lap and listen back. | A5 = traste 5 de la cuerda Mi, G5 = traste 3 de la cuerda Mi, F5 = traste 1 de la cuerda Mi. Cambia con suavidad — apunta a caer exactamente en el tiempo 1. (La canción original usa un acorde de Am, pero como acorde de potencia es solo A5 — sin mayor ni menor.) Esta es tu vuelta de verificación de la Unidad 1 — graba una vuelta y escúchala después. |
| stuck: Loop just A5–G5 (frets 5 and 3) until that change is clean, then add F5. | Repite solo A5–G5 (trastes 5 y 3) hasta que ese cambio salga limpio, y luego agrega F5. |
| levelUp: Play it with an eighth-note strum (down on each number, up on each "+": "1 + 2 + 3 + 4 +"), or push past 70 BPM. | Tócalo con un rasgueo de corcheas (abajo en cada número, arriba en cada "+": "1 + 2 + 3 + 4 +"), o sube de 70 BPM. |
| response prompt: Personal record: play it cleanly at 60, then raise the metronome +10 at a time. Your fastest CLEAN loop today (BPM)? | Récord personal: tócala limpia a 60, y luego sube el metrónomo de 10 en 10. ¿Tu vuelta LIMPIA más rápida hoy (BPM)? |
| response placeholder: e.g. 80 — try for a higher number next session | p. ej. 80 — intenta superarlo la próxima sesión |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Seven Nation Army, verse riff: play the riff (a short musical phrase that repeats) as two-string power chords sliding along the A string, one chord per riff note at 60 BPM. You've got it when: two clean laps in a row, both strings of every chord ringing. Song Journey: this is Layer 3 of 5. | Reto — Seven Nation Army, riff de la estrofa: toca el riff (una frase musical corta que se repite) como acordes de potencia de dos cuerdas deslizándose por la cuerda La, un acorde por nota del riff a 60 BPM. Lo tienes cuando: dos vueltas limpias seguidas, con ambas cuerdas de cada acorde sonando. Recorrido de la canción: esto es la Capa 3 de 5. |
| hint: It's one shape sliding — keep your grip and let your arm do the moving. | Es una sola forma deslizándose — mantén el agarre y deja que tu brazo haga el movimiento. |
| stuck: Play roots-only (your Module 2 line), then add the second string back one chord at a time. | Toca solo las raíces (tu línea del Módulo 2), y luego agrega de vuelta la segunda cuerda un acorde a la vez. |
| levelUp: Palm-mute the whole lap for the verse sound, then open up for a chorus lap. | Silencia con la palma toda la vuelta para el sonido de la estrofa, y luego abre el sonido para una vuelta de coro. |
| tab caption: "Seven Nation Army" — verse riff as power chords · 60 BPM | "Seven Nation Army" — riff de la estrofa como acordes de potencia · 60 BPM |
| response prompt: Which slide was hardest to land clean, and what fixed it? | ¿Qué deslizamiento fue el más difícil de hacer limpio, y qué lo arregló? |
| response placeholder: e.g. E5 up to G5 — smaller jumps helped | p. ej. de E5 a G5 — saltos más pequeños ayudaron |

**Station C — My Practice Routine — weekly check-in (never graded)**

| English | Spanish |
|---|---|
| text: Plan your practice — this one's just for you, never graded. Take two minutes to update your routine: (1) one thing you want to get better at, (2) when and where you'll practice this week, (3) how last week's plan went. Same check-in as Modules 1 and 2 — you'll keep it going through the whole course. | Planea tu práctica — esta parte es solo para ti, nunca se califica. Tómate dos minutos para actualizar tu rutina: (1) una cosa en la que quieres mejorar, (2) cuándo y dónde vas a practicar esta semana, (3) cómo te fue con el plan de la semana pasada. El mismo check-in de los Módulos 1 y 2 — lo vas a mantener durante todo el curso. |
| hint: No wrong answers — even five minutes a day is better than one long rushed session. You're building a habit you'll actually keep. | No hay respuestas incorrectas — hasta cinco minutos al día es mejor que una sola sesión larga y apurada. Estás construyendo un hábito que de verdad vas a mantener. |
| response placeholder: 1) One thing to improve   2) When & where I'll practice   3) How last week went | 1) Algo que quiero mejorar   2) Cuándo y dónde voy a practicar   3) Cómo me fue la semana pasada |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Which power chord change or muting move still feels shaky? Write it below — that's your warm-up target next time you practice. | ¿Qué cambio de acorde de potencia o movimiento de silenciado todavía se siente inestable? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez que practiques. |
| response placeholder: e.g. the G5-to-F5 change drops a beat; high strings still ring sometimes | p. ej. el cambio de G5 a F5 pierde un tiempo; las cuerdas agudas a veces todavía suenan |

**Station C — ⚡ Ear Spark — optional ear bonus**

| English | Spanish |
|---|---|
| text: ⚡ Ear Spark (optional, 2 min): first, build a full open E major — it's your E5 (open low E + A string, 2nd fret) with two notes added: G string, 1st fret and D string, 2nd fret, letting the open B and high e ring too. Now write "power" on a few paper slips and "full" on a few others, shuffle them face-down, and draw one at a time: play E5 for a "power" slip or the full E major for a "full" slip, a few reps. On playback, call each one "power" or "full" before flipping the slip to check — power chords are hollow, with no major/minor color. Got someone around? Have them play while you look away. | ⚡ Chispa auditiva (opcional, 2 min): primero, arma un Mi mayor al aire completo — es tu E5 (Mi grave al aire + cuerda La, traste 2) con dos notas agregadas: cuerda Sol, traste 1 y cuerda Re, traste 2, dejando sonar también la B y la mi aguda al aire. Ahora escribe "potencia" en algunos papelitos y "completo" en otros, mézclalos boca abajo, y saca uno a la vez: toca E5 para un papelito de "potencia" o el Mi mayor completo para uno de "completo", varias repeticiones. Al escuchar, di "potencia" o "completo" antes de voltear el papelito para comprobar — los acordes de potencia suenan huecos, sin color mayor o menor. ¿Tienes a alguien cerca? Que toque mientras miras hacia otro lado. |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| m3w1-s1 text: Fret a clean 2-finger power chord (root + 5th) with no buzzing | Trastear un acorde de potencia limpio con dos dedos (raíz + quinta) sin zumbido |
| m3w1-s1 gotItWhen: both notes ring clearly when you strum, with no buzz and no muffled strings — and it sounds the same every time you play it. | las dos notas suenan claramente al rasguear, sin zumbido y sin cuerdas apagadas — y suena igual cada vez que lo tocas. |
| m3w1-s1 practice prompt: A power chord is built from which two scale degrees (a scale degree = a note's number in the scale, counting up from the root)? | ¿Un acorde de potencia se construye con cuáles dos grados de la escala (un grado de la escala = el número de una nota en la escala, contando desde la raíz)? |
| m3w1-s1 practice choices: Root + 3rd / Root + 5th / Root + 7th / Root + octave | Raíz + 3ª / Raíz + 5ª / Raíz + 7ª / Raíz + octava |
| m3w1-s2 text: Move the power chord shape along the E string (E5, G5, A5, B5) | Mover la forma del acorde de potencia por la cuerda Mi (E5, G5, A5, B5) |
| m3w1-s2 gotItWhen: you can move the same shape to any of those positions on call and name the chord without counting frets. | puedes mover la misma forma a cualquiera de esas posiciones a pedido y nombrar el acorde sin contar trastes. |
| m3w1-s2 practice prompt: Your index finger is on the low E string at fret 5. Which power chord are you playing? | Tu dedo índice está en la cuerda Mi grave, traste 5. ¿Qué acorde de potencia estás tocando? |
| m3w1-s2 practice choices: G5 / A5 / B5 / D5 | G5 / A5 / B5 / D5 |
| m3w1-s3 text: Mute unused strings with palm and fretting hand | Silenciar las cuerdas que no usas con la palma y la mano de trastear |
| m3w1-s3 gotItWhen: you can strum hard across all 6 strings and only the two intentional notes ring — the other 4 stay silent. | puedes rasguear fuerte las 6 cuerdas y solo suenan las dos notas intencionadas — las otras 4 quedan en silencio. |
| m3w1-s4 text: Move the power chord shape along the A string (A5, C5, D5) | Mover la forma del acorde de potencia por la cuerda La (A5, C5, D5) |
| m3w1-s4 gotItWhen: you can shift the shape to the A-string root without your palm mute breaking — and the low E string stays silent. | puedes desplazar la forma a la raíz de la cuerda La sin que se rompa tu silenciado con la palma — y la cuerda Mi grave se queda en silencio. |
| m3w1-s4 practice prompt: Your index finger is on the A string at fret 3. Which power chord are you playing? | Tu dedo índice está en la cuerda La, traste 3. ¿Qué acorde de potencia estás tocando? |
| m3w1-s4 practice choices: B5 / C5 / D5 / A5 | B5 / C5 / D5 / A5 |
| m3w1-s5 text: Play a power chord on the beat with a single down-strum | Tocar un acorde de potencia a tiempo con un solo rasgueo hacia abajo |
| m3w1-s5 gotItWhen: your strum lands on beat 1 with the metronome and the chord rings cleanly — no early or late attacks. | tu rasgueo cae en el tiempo 1 con el metrónomo y el acorde suena limpio — sin ataques adelantados ni atrasados. |
| m3w1-s6 text: Read a basic power chord TAB or chord symbol (e.g. A5, G5) | Leer un TAB básico de acordes de potencia o un símbolo de acorde (p. ej. A5, G5) |
| m3w1-s6 gotItWhen: you can see "A5" or "G5" on a chart and instantly know which fret your index finger goes on, on which string. | puedes ver "A5" o "G5" en un diagrama y saber al instante en qué traste y qué cuerda va tu dedo índice. |
| m3w1-s6 practice prompt: You see "A5" written above a bar. What does it mean? | Ves "A5" escrito sobre un compás. ¿Qué significa? |
| m3w1-s6 practice choices: Play just the A note / A power chord rooted on A / A major chord / Play the 5th fret on A string | Tocar solo la nota A / Un acorde de potencia con raíz en A / Un acorde mayor / Tocar el traste 5 de la cuerda La |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 3 · Two-Finger Power Chords | Módulo 3 · Acordes de potencia con dos dedos |
| subtitle: Power chords with metronome · Chord changes · Strumming patterns | Acordes de potencia con metrónomo · Cambios de acorde · Patrones de rasgueo |
| skillFocus: Changing power chords in time · Building speed with a metronome · Playing a song progression | Cambiar acordes de potencia a tiempo · Ganar velocidad con un metrónomo · Tocar la progresión de una canción |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — metronome & chord changes | Estación de práctica — metrónomo y cambios de acorde |
| Section title: Change power chords on beat 1 at 60 BPM | Cambia acordes de potencia en el tiempo 1 a 60 BPM |
| Section title: Speed changes — every two beats, then every beat | Cambios más rápidos — cada dos tiempos, y luego cada tiempo |
| Section title: Read and clap the rhythm | Lee y aplaude el ritmo |
| Section title: Play an 8-bar progression with a steady strum | Toca una progresión de 8 compases con un rasgueo constante |
| Section title: Optional: add octave doubling | Opcional: agrega duplicación de octava |
| Section title: Luna: F5–A5 two-shape metronome drill | Luna: ejercicio de metrónomo con dos formas F5–A5 |
| Section title: Sweet Child O' Mine — assessment rehearsal | Sweet Child O' Mine — ensayo de evaluación |
| Section title: Take It to a Song | Llévalo a una canción |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: How & Why to Use a Metronome – JustinGuitar (0:00–4:00). | Mira: How & Why to Use a Metronome – JustinGuitar (0:00–4:00). |
| hint: His tip about setting the metronome 10 BPM slower than you think you need is key. As he explains it, set your own metronome and tap along. Slow is smooth, smooth is fast — practice slowly and cleanly, and speed comes on its own. | Su consejo de poner el metrónomo 10 BPM más lento de lo que crees que necesitas es clave. Mientras lo explica, pon tu propio metrónomo y sigue el ritmo con la mano. Despacio es suave, suave es rápido — practica despacio y limpio, y la velocidad llega sola. |
| response prompt: According to the video, where should you set the metronome when learning something new? | Según el video, ¿dónde deberías poner el metrónomo cuando estás aprendiendo algo nuevo? |
| response explain: Start a touch slower than feels comfortable — clean and in time first, then speed up. Practicing fast and sloppy just makes the mistakes permanent. | Empieza un poco más despacio de lo que se siente cómodo — limpio y a tiempo primero, y luego acelera. Practicar rápido y descuidado solo hace permanentes los errores. |
| response choices: About 10 BPM slower than you think you need / As fast as you can possibly play / It doesn't matter — pick any tempo / Always 120 BPM | Cerca de 10 BPM más lento de lo que crees que necesitas / Lo más rápido que puedas tocar / No importa — elige cualquier tempo / Siempre 120 BPM |
| text: Watch: Easy Power-Chord Songs Everyone Should Know – Marty Music (0:00–3:00). | Mira: Easy Power-Chord Songs Everyone Should Know – Marty Music (0:00–3:00). |
| hint: Pick one song you recognize and try to play along as it plays. Match the strum timing to what you hear. | Elige una canción que reconozcas e intenta tocarla junto con el video. Iguala el momento del rasgueo con lo que escuchas. |
| response placeholder: Which song did you try to play along with? What was hardest about it? | ¿Con qué canción intentaste tocar junto? ¿Qué fue lo más difícil de eso? |
| text: Watch: 3 Tips to NAIL Alternate Picking (build speed) – JustinGuitar (0:00–3:00). Alternate picking means strict down-up-down-up — every downstroke is followed by an upstroke, so the pick never travels the same way twice in a row. Watch his tempo-step method for building speed. | Mira: 3 Tips to NAIL Alternate Picking (build speed) – JustinGuitar (0:00–3:00). Púa alterna significa abajo-arriba-abajo-arriba estricto — cada golpe hacia abajo va seguido de uno hacia arriba, así que la púa nunca viaja en la misma dirección dos veces seguidas. Mira su método de pasos de tempo para ganar velocidad. |
| hint: Notice his method for building tempo gradually. As he describes it, try it: play your "Watchtower" loop at 60 BPM, then bump to 65, then 70. | Fíjate en su método para subir el tempo gradualmente. Mientras lo describe, pruébalo: toca tu vuelta de "Watchtower" a 60 BPM, y luego sube a 65 y a 70. |
| response placeholder: In one sentence, describe his method for building up tempo gradually. | En una oración, describe su método para subir el tempo gradualmente. |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: at what tempo does your loop start to fall apart, and which part breaks down first — the change, the strum, or the muting? | Cierre de la estación — pausa y piensa: ¿a qué tempo tu vuelta empieza a desarmarse, y qué parte falla primero — el cambio, el rasgueo, o el silenciado? |
| response placeholder: e.g. around 75 BPM the F5 change gets late | p. ej. cerca de 75 BPM el cambio a F5 se atrasa |

**Station C — Change power chords on beat 1 at 60 BPM**

| English | Spanish |
|---|---|
| text: Challenge 1 — Loop in Time: play the "Watchtower" loop (A5–G5–F5–G5) at 60 BPM, each chord one bar (4 beats), four times through. You've got it when: every chord change lands on beat 1, with no stops. | Reto 1 — Vuelta a tiempo: toca la vuelta de "Watchtower" (A5–G5–F5–G5) a 60 BPM, cada acorde un compás (4 tiempos), cuatro veces seguidas. Lo tienes cuando: cada cambio de acorde cae en el tiempo 1, sin detenerte. |
| hint: If you miss beat 1, keep going — don't stop. Staying in time matters more than the perfect change right now. | Si te pierdes el tiempo 1, sigue tocando — no te detengas. Mantenerte a tiempo importa más que el cambio perfecto por ahora. |
| stuck: Drop to 50 BPM and get it clean there first; play through a missed change instead of stopping to fix it. | Baja a 50 BPM y déjalo limpio ahí primero; sigue tocando aunque falles un cambio en vez de detenerte a corregirlo. |
| levelUp: Bump to 70 BPM, or change chords every two beats instead of every bar so the moves come twice as fast. | Sube a 70 BPM, o cambia de acorde cada dos tiempos en vez de cada compás para que los cambios lleguen el doble de rápido. |

**Station C — Speed changes — every two beats, then every beat**

| English | Spanish |
|---|---|
| text: Challenge — Half-Bar Power Switches (2 chords): real riffs change faster than once a bar. Keep A5 and D5, but switch every TWO beats — two down-strums on A5, two on D5, and repeat, at 60 BPM. That's a change every half-bar, twice as often as the loops so far. You've got it when: four laps where every switch lands right on the beat, no stops. Press ▶ to hear the target. | Reto — Cambios de potencia por medio compás (2 acordes): los riffs reales cambian más rápido que una vez por compás. Mantén A5 y D5, pero cambia cada DOS tiempos — dos rasgueos hacia abajo en A5, dos en D5, y repite, a 60 BPM. Eso es un cambio cada medio compás, el doble de seguido que las vueltas de antes. Lo tienes cuando: cuatro vueltas donde cada cambio cae justo en el tiempo, sin detenerte. Presiona ▶ para escuchar el objetivo. |
| hint: A5 and D5 are the same shape one string apart — A5 roots on the low E (fret 5), D5 on the A string (fret 5). Shift the whole shape across and keep your two fingers glued together. | A5 y D5 son la misma forma a una cuerda de distancia — A5 tiene su raíz en la Mi grave (traste 5), D5 en la cuerda La (traste 5). Desplaza toda la forma y mantén tus dos dedos pegados. |
| stuck: Drop to 50 BPM. Start moving your fingers to the next chord on the "and" after beat 2, so the shape is ready before the switch. | Baja a 50 BPM. Empieza a mover tus dedos hacia el siguiente acorde en el "y" después del tiempo 2, para que la forma esté lista antes del cambio. |
| levelUp: Climb to 70, then 80 BPM, or jump ahead to the every-beat drill below. | Sube a 70, y luego a 80 BPM, o salta al ejercicio de cada tiempo de abajo. |
| playSeq label: Hear it — A5·A5 · D5·D5 (change every 2 beats) | Escúchalo — A5·A5 · D5·D5 (cambio cada 2 tiempos) |
| text: Challenge — Three-Chord Half-Bar (3 chords): now three shapes, still two beats each — G5 · C5 · D5, then back to G5, looping at 60 BPM. That's a I–IV–V in the key of G, the backbone of thousands of songs, moving at chorus speed. You've got it when: two clean laps, every change on the beat. | Reto — Medio compás con tres acordes (3 acordes): ahora tres formas, todavía dos tiempos cada una — G5 · C5 · D5, y de vuelta a G5, repitiendo a 60 BPM. Eso es un I–IV–V en la tonalidad de G, la columna vertebral de miles de canciones, moviéndose a velocidad de coro. Lo tienes cuando: dos vueltas limpias, cada cambio a tiempo. |
| hint: C5 and D5 are both A-string roots two frets apart (frets 3 and 5); G5 drops to the low E string (fret 3). Group the two A-string shapes in your mind, then the hop down to G5. | C5 y D5 son ambas raíces de la cuerda La a dos trastes de distancia (trastes 3 y 5); G5 baja a la cuerda Mi grave (traste 3). Agrupa mentalmente las dos formas de la cuerda La, y luego el salto a G5. |
| stuck: Loop just C5 → D5 (the same-string, two-fret slide) until it's automatic, then add the G5 hop. | Repite solo C5 → D5 (el deslizamiento de dos trastes en la misma cuerda) hasta que sea automático, y luego agrega el salto a G5. |
| levelUp: Speed up to 75 BPM, or reorder as G5 · D5 · C5 and keep every change on the beat. | Acelera a 75 BPM, o reordénalo como G5 · D5 · C5 y mantén cada cambio a tiempo. |
| playSeq label: Hear it — G5·G5 · C5·C5 · D5·D5 (I–IV–V, every 2 beats) | Escúchalo — G5·G5 · C5·C5 · D5·D5 (I–IV–V, cada 2 tiempos) |
| text: Challenge — Four-Chord Half-Bar (Watchtower): the full "All Along the Watchtower" loop as low-E power chords — A5 · G5 · F5 · G5 — two beats each at 60 BPM, looping. Four chord slots inside every bar-and-a-half — this is exactly how the record cycles. You've got it when: four clean laps, every change landing on the beat. | Reto — Medio compás con cuatro acordes (Watchtower): la vuelta completa de "All Along the Watchtower" como acordes de potencia en la cuerda Mi — A5 · G5 · F5 · G5 — dos tiempos cada uno a 60 BPM, repitiendo. Cuatro espacios de acorde dentro de cada compás y medio — así es exactamente como cicla la grabación. Lo tienes cuando: cuatro vueltas limpias, cada cambio cayendo a tiempo. |
| hint: All three roots sit on the low E string — A5 (fret 5), G5 (fret 3), F5 (fret 1). It's one shape walking down the neck and back up. | Las tres raíces están en la cuerda Mi grave — A5 (traste 5), G5 (traste 3), F5 (traste 1). Es una sola forma caminando hacia abajo por el mástil y de regreso. |
| stuck: Play just the roots (skip the second string) for one lap to lock the walk, then add the fifth back in. | Toca solo las raíces (sáltate la segunda cuerda) por una vuelta para fijar el recorrido, y luego agrega de vuelta la quinta. |
| levelUp: Palm-mute for a tighter chug, or move on to the every-beat version below. | Silencia con la palma para un chug más ajustado, o pasa a la versión de cada tiempo de abajo. |
| playSeq label: Hear it — A5·G5·F5·G5 (every 2 beats) | Escúchalo — A5·G5·F5·G5 (cada 2 tiempos) |
| text: Challenge — One Chord Per Beat (Watchtower, fast): the top of the ladder — a new chord on every single beat. Same A5 · G5 · F5 · G5 loop, but one down-strum per beat at 60 BPM, no repeats. This is what a driving riff feels like: no time to think, the next shape has to be ready before you arrive. You've got it when: four laps clean at 60, then climb 65 → 70. | Reto — Un acorde por tiempo (Watchtower, rápido): el escalón más alto — un acorde nuevo en cada tiempo. La misma vuelta A5 · G5 · F5 · G5, pero un rasgueo hacia abajo por tiempo a 60 BPM, sin repetir. Así se siente un riff a toda marcha: sin tiempo para pensar, la siguiente forma tiene que estar lista antes de llegar. Lo tienes cuando: cuatro vueltas limpias a 60, y luego sube 65 → 70. |
| hint: Because the walk is A5→G5→F5→G5, your hand moves two frets, two frets, then back two — a steady rocking slide. Feel the pattern in your arm, not your eyes. | Como el recorrido es A5→G5→F5→G5, tu mano se mueve dos trastes, dos trastes, y luego dos hacia atrás — un vaivén constante. Siente el patrón en tu brazo, no con los ojos. |
| stuck: Cut it in half: loop just A5 · G5, one per beat, until it's smooth, then add F5. | Divide a la mitad: repite solo A5 · G5, uno por tiempo, hasta que sea fluido, y luego agrega F5. |
| levelUp: Hold it clean at 80 BPM, or make all four different — E5 · G5 · A5 · C5, one per beat. | Mantenlo limpio a 80 BPM, o haz los cuatro distintos — E5 · G5 · A5 · C5, uno por tiempo. |
| playSeq label: Hear it — A5·G5·F5·G5 (one chord per beat) | Escúchalo — A5·G5·F5·G5 (un acorde por tiempo) |
| response prompt: Your fastest CLEAN one-chord-per-beat Watchtower today (BPM)? | ¿Tu Watchtower a un-acorde-por-tiempo LIMPIO más rápido hoy (BPM)? |
| response placeholder: e.g. 70 — 80 next session | p. ej. 70 — 80 la próxima sesión |

**Station C — Read and clap the rhythm**

| English | Spanish |
|---|---|
| text: Challenge — Clap & Count: before you play, read this 4-bar rhythm line. Bar 1 = one whole note (clap once, hold all 4 beats). Bar 2 = two half notes (clap on beats 1 and 3, each held 2 beats). Bar 3 = four quarter notes (one clap per beat: 1, 2, 3, 4). Bar 4 = eight straight eighths (two claps per beat: "1 + 2 + 3 + 4 +"). Clap and count all 4 bars out loud. You've got it when: you can clap all 4 bars in time with the metronome at 70 BPM and name which notes are whole, half, quarter, and eighth. | Reto — Aplaude y cuenta: antes de tocar, lee esta línea rítmica de 4 compases. Compás 1 = una redonda (aplaude una vez, sostén los 4 tiempos). Compás 2 = dos blancas (aplaude en los tiempos 1 y 3, cada una sostenida 2 tiempos). Compás 3 = cuatro negras (un aplauso por tiempo: 1, 2, 3, 4). Compás 4 = ocho corcheas rectas (dos aplausos por tiempo: "1 + 2 + 3 + 4 +"). Aplaude y cuenta los 4 compases en voz alta. Lo tienes cuando: puedes aplaudir los 4 compases a tiempo con el metrónomo a 70 BPM y nombrar cuáles notas son redondas, blancas, negras y corcheas. |
| hint: Whole note = one clap held for a full bar. Half note = one clap held for two beats. Eighth notes = two even claps per beat. The straight-eighths strum you play (down on each number, up on each "+") is just eighth notes — same rhythm, on the guitar. | Redonda = un aplauso sostenido por todo el compás. Blanca = un aplauso sostenido por dos tiempos. Corcheas = dos aplausos parejos por tiempo. El rasgueo de corcheas rectas que tocas (abajo en cada número, arriba en cada "+") son solo corcheas — el mismo ritmo, en la guitarra. |
| stuck: Clap quarter notes on every beat first (1 2 3 4), then split one beat into eighths ("1 +") and feel the difference. | Aplaude negras en cada tiempo primero (1 2 3 4), y luego divide un tiempo en corcheas ("1 +") y siente la diferencia. |
| levelUp: Clap one bar of eighths, one bar of quarters, alternating, without losing the count. | Aplaude un compás de corcheas, un compás de negras, alternando, sin perder la cuenta. |

**Station C — Play an 8-bar progression with a steady strum**

| English | Spanish |
|---|---|
| text: Challenge — Name Your Progression: I–IV–V ("one–four–five"): musicians number chords by counting up the musical alphabet from the key's home note (the note the music rests on and sounds finished). In the key of A: A is I, count up to D for IV, and E for V — so A5–D5–E5 is a I–IV–V. Play A5–D5–E5, two bars each, one strum per beat at 60 BPM. You've got it when: you can play the loop reading only the chord symbols AND say which chord is the I, the IV, and the V. At the module self-check you'll read a three-chord (I–IV–V) progression from chord symbols with your named strum — this is that skill. | Reto — Nombra tu progresión: I–IV–V ("uno-cuatro-cinco"): los músicos numeran los acordes contando hacia arriba en el alfabeto musical desde la nota base de la tonalidad (la nota en la que descansa la música y que suena resuelta). En la tonalidad de A: A es I, cuenta hacia arriba hasta D para el IV, y E para el V — así que A5–D5–E5 es un I–IV–V. Toca A5–D5–E5, dos compases cada uno, un rasgueo por tiempo a 60 BPM. Lo tienes cuando: puedes tocar la vuelta leyendo solo los símbolos de acorde Y decir cuál acorde es el I, el IV y el V. En el autochequeo del módulo vas a leer una progresión de tres acordes (I–IV–V) a partir de símbolos de acorde con tu rasgueo nombrado — esa es esta destreza. |
| hint: All three use the same two-finger shape: A5 root on the E string (fret 5), D5 root on the A string (fret 5) — same fret, string hop! — and E5 root on the A string (fret 7). | Los tres usan la misma forma de dos dedos: A5 con raíz en la cuerda Mi (traste 5), D5 con raíz en la cuerda La (traste 5) — ¡mismo traste, salto de cuerda! — y E5 con raíz en la cuerda La (traste 7). |
| stuck: Loop just A5→D5 (the same-fret hop) until it's clean, then add E5. | Repite solo A5→D5 (el salto del mismo traste) hasta que salga limpio, y luego agrega E5. |
| levelUp: Transpose it — build a I–IV–V starting from G5 (G–C–D) and name each chord's number. | Transpórtala — arma un I–IV–V empezando desde G5 (G–C–D) y nombra el número de cada acorde. |
| text: Challenge 2 — Eighth-Note Strum (one of your assessment pieces): play the A5–D5–E5 loop (two bars each) with straight eighths (down on each number, up on each "+"), counting "1 + 2 + 3 + 4 +". You've got it when: eight bars clean and steady at 60, then speed up in steps (65 → 70 → 75) and hold 80 BPM for at least 15 seconds — that's the module bar. | Reto 2 — Rasgueo de corcheas (una de tus piezas de evaluación): toca la vuelta A5–D5–E5 (dos compases cada uno) con corcheas rectas (abajo en cada número, arriba en cada "+"), contando "1 + 2 + 3 + 4 +". Lo tienes cuando: ocho compases limpios y constantes a 60, y luego acelera en pasos (65 → 70 → 75) y sostén 80 BPM por al menos 15 segundos — esa es la meta del módulo. |
| hint: Start at 60 BPM. If it feels easy, bump up 5 BPM. The module-end self-check is an 8-bar progression changing on beat 1 at 60, then holding 80 BPM for 15 seconds with clean muting — this is that piece. | Empieza a 60 BPM. Si se siente fácil, sube 5 BPM. El autochequeo de fin de módulo es una progresión de 8 compases que cambia en el tiempo 1 a 60, y luego sostiene 80 BPM por 15 segundos con silenciado limpio — esta es esa pieza. |
| stuck: Strum down-only on each beat first ("1 2 3 4"), then add the up-strums one at a time. | Rasguea solo hacia abajo en cada tiempo primero ("1 2 3 4"), y luego agrega los rasgueos hacia arriba de uno en uno. |
| levelUp: Hold it clean at 80 BPM, or play it straight through a full song excerpt from the songs list. | Mantenlo limpio a 80 BPM, o tócalo de corrido en un fragmento completo de canción de la lista. |
| response prompt: Personal record: once it's clean at 60, raise the metronome +5 at a time. Your fastest CLEAN tempo today (BPM)? | Récord personal: una vez que esté limpio a 60, sube el metrónomo de 5 en 5. ¿Tu tempo LIMPIO más rápido hoy (BPM)? |
| response placeholder: e.g. 75 — try for a higher number next session | p. ej. 75 — intenta superarlo la próxima sesión |
| text: Challenge 3 — Split Strum ("boom-chick"): the other named strum for this progression. Split each pair of beats in two jobs — beat 1: pick ONLY the root (your 1st-finger bass note), beat 2: strum the whole shape. Count "boom-chick, boom-chick": 1 = boom (root alone), 2 = chick (full chord), 3 = boom, 4 = chick. Play the A5–D5–E5 loop this way, two bars each at 60 BPM. Click "Hear the split strum" to hear one bar of A5 then one of D5. You've got it when: eight bars where every boom is JUST the root string and every chick is the full shape — no accidental extra strings on the boom. | Reto 3 — Rasgueo dividido ("boom-chick"): el otro rasgueo nombrado para esta progresión. Divide cada par de tiempos en dos trabajos — tiempo 1: pulsa SOLO la raíz (tu nota grave del dedo 1), tiempo 2: rasguea toda la forma. Cuenta "boom-chick, boom-chick": 1 = boom (solo la raíz), 2 = chick (acorde completo), 3 = boom, 4 = chick. Toca la vuelta A5–D5–E5 así, dos compases cada uno a 60 BPM. Haz clic en "Escucha el rasgueo dividido" para oír un compás de A5 y luego uno de D5. Lo tienes cuando: ocho compases donde cada boom es SOLO la cuerda de la raíz y cada chick es la forma completa — sin cuerdas extra por accidente en el boom. |
| hint: The pick does two different jobs an inch apart: a small, aimed pick stroke on just the root string, then a relaxed strum through the shape. Keep your eyes on the root string for the boom — that's the precision half. | La púa hace dos trabajos distintos a poca distancia: un golpe pequeño y apuntado solo en la cuerda de la raíz, y luego un rasgueo relajado por toda la forma. Mantén la vista en la cuerda de la raíz para el boom — esa es la mitad de precisión. |
| stuck: Mute the strings with your fretting hand and drill just the motion: pick-strum, pick-strum, until the aim is automatic. Then fret A5 and add one chord at a time. | Silencia las cuerdas con tu mano de trastear y ejercita solo el movimiento: pulsa-rasguea, pulsa-rasguea, hasta que la puntería sea automática. Luego trastea A5 y agrega un acorde a la vez. |
| levelUp: Split strum the whole I–IV–V from chord symbols only, or mix it: two bars split strum, two bars straight eighths — feel how the same chords groove two different ways (a groove = the steady rhythmic feel). | Haz el rasgueo dividido de todo el I–IV–V solo a partir de los símbolos de acorde, o combínalo: dos compases de rasgueo dividido, dos compases de corcheas rectas — siente cómo los mismos acordes groovean de dos formas distintas (un groove = la sensación rítmica constante). |
| playSeq label: Hear the split strum | Escucha el rasgueo dividido |

**Station C — Optional: add octave doubling**

| English | Spanish |
|---|---|
| text: Challenge 4 — Octave Add-On (try it!): add your pinky on the next string, at the same fret as your ring finger, to make a 3-note power chord. No score — just try it and notice how the sound changes. | Reto 4 — Octava extra (¡pruébalo!): agrega tu meñique en la siguiente cuerda, en el mismo traste que tu anular, para hacer un acorde de potencia de 3 notas. Sin puntaje — solo pruébalo y nota cómo cambia el sonido. |
| hint: This is optional. If your power chord sounds clean as is, keep it. Only add the 3rd finger if you can do it without buzzing. | Esto es opcional. Si tu acorde de potencia ya suena limpio, déjalo así. Agrega el tercer dedo solo si puedes hacerlo sin zumbido. |

**Station C — Luna: F5–A5 two-shape metronome drill**

| English | Spanish |
|---|---|
| text: Challenge — F5 ↔ A5 Two-Shape Drill: Luna's whole vamp (a vamp = a short chord pattern repeated over and over) is two power chords — F5 (root F, low E string, fret 1) and A5 (root A, fret 5) — the same two-finger shape sliding four frets. One strum per big beat: Luna is in 6/8, so strum just the downbeats, two per bar, nothing syncopated (syncopated = accents landing off the main beat). You've got it when: you can switch F5 ↔ A5 landing every downbeat clean, speeding up in steps: 60 → 70 → 80 BPM. Song Journey: this is Layer 3 of 5. | Reto — Ejercicio de dos formas F5 ↔ A5: todo el vamp de Luna (un vamp = un patrón de acordes corto que se repite una y otra vez) son dos acordes de potencia — F5 (raíz F, cuerda Mi grave, traste 1) y A5 (raíz A, traste 5) — la misma forma de dos dedos deslizándose cuatro trastes. Un rasgueo por tiempo fuerte: Luna está en 6/8, así que rasguea solo los tiempos fuertes, dos por compás, nada sincopado (sincopado = acentos que caen fuera del tiempo principal). Lo tienes cuando: puedes cambiar F5 ↔ A5 cayendo limpio en cada tiempo fuerte, acelerando en pasos: 60 → 70 → 80 BPM. Recorrido de la canción: esto es la Capa 3 de 5. |
| hint: A power chord has no major or minor — just root + 5th. Keep the two-finger shape locked and let your whole arm make the four-fret slide. | Un acorde de potencia no tiene mayor ni menor — solo raíz + quinta. Mantén la forma de dos dedos fija y deja que todo tu brazo haga el deslizamiento de cuatro trastes. |
| stuck: Park on the slide: fret 1, fret 5, fret 1, fret 5 with no rhythm until the jump is automatic — then add the metronome at 60. | Quédate en el deslizamiento: traste 1, traste 5, traste 1, traste 5 sin ritmo hasta que el salto sea automático — y luego agrega el metrónomo a 60. |
| levelUp: Palm-mute for a tight sierreño chug (sierreño = a Mexican acoustic-guitar style; a chug = a short, muted, punchy strum) — then let it ring and hear why distortion isn't this song's home. That's what the ◐ means. | Silencia con la palma para un chug de sierreño ajustado (sierreño = un estilo de guitarra acústica mexicana; un chug = un rasgueo corto, silenciado y contundente) — y luego deja que suene abierto y escucha por qué la distorsión no es el hogar de esta canción. Eso es lo que significa el ◐. |
| playSeq label: Hear F5 → A5 (roots F · A) | Escucha F5 → A5 (raíces F · A) |
| response prompt: Your fastest CLEAN F5↔A5 today (BPM)? | ¿Tu F5↔A5 LIMPIO más rápido hoy (BPM)? |
| response placeholder: e.g. 70 — 80 next session | p. ej. 70 — 80 la próxima sesión |

**Station C — Sweet Child O' Mine — assessment rehearsal**

| English | Spanish |
|---|---|
| text: Challenge — Sweet Child Verse (assessment rehearsal): play the Guns N' Roses verse as power chords — D5 · C5 · G5, two beats per chord at 60 BPM. This is one of the songs you can use for the module self-assessment. You've got it when: four clean laps, every change on beat 1, muting tight. Song Journey: this is Layer 3 of 5. | Reto — Estrofa de Sweet Child (ensayo de evaluación): toca la estrofa de Guns N' Roses como acordes de potencia — D5 · C5 · G5, dos tiempos por acorde a 60 BPM. Esta es una de las canciones que puedes usar para la autoevaluación del módulo. Lo tienes cuando: cuatro vueltas limpias, cada cambio en el tiempo 1, silenciado ajustado. Recorrido de la canción: esto es la Capa 3 de 5. |
| hint: On this site we play Sweet Child in standard tuning. (The famous recording is tuned a half-step down, so your D5–C5–G5 sound one fret higher than the recording — that's expected; don't retune.) D5 and C5 are A-string roots; G5 drops to the low E string. | En este sitio tocamos Sweet Child en afinación estándar. (La grabación famosa está afinada medio tono más abajo, así que tu D5–C5–G5 suena un traste más alto que la grabación — eso es esperado; no reafines.) D5 y C5 son raíces de la cuerda La; G5 baja a la cuerda Mi grave. |
| stuck: Loop D5 → C5 (both A-string, 2 frets apart) until smooth, then add the jump to G5 on the low E string. | Repite D5 → C5 (ambas en la cuerda La, a 2 trastes de distancia) hasta que salga fluido, y luego agrega el salto a G5 en la cuerda Mi grave. |
| levelUp: Speed up in steps to 70, then 80 BPM, or add a straight-eighths strum. | Acelera en pasos a 70, y luego a 80 BPM, o agrega un rasgueo de corcheas rectas. |
| response prompt: Clean laps of D5–C5–G5 at 60 BPM? | ¿Vueltas limpias de D5–C5–G5 a 60 BPM? |
| response placeholder: e.g. 3 — the G5 jump lags | p. ej. 3 — el salto a G5 se atrasa |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Watchtower, verse: play the "All Along the Watchtower" loop as power chords rooted on the low E string — A5 · G5 · F5 · G5 — two beats per chord at 60 BPM. You've got it when: four clean laps, every change landing on the beat. Song Journey: this is Layer 3 of 5. | Reto — Watchtower, estrofa: toca la vuelta de "All Along the Watchtower" como acordes de potencia con raíz en la cuerda Mi grave — A5 · G5 · F5 · G5 — dos tiempos por acorde a 60 BPM. Lo tienes cuando: cuatro vueltas limpias, cada cambio cayendo a tiempo. Recorrido de la canción: esto es la Capa 3 de 5. |
| hint: Same three roots you played in Module 2 — now each root note also sounds its fifth. | Las mismas tres raíces que tocaste en el Módulo 2 — ahora cada nota raíz también suena su quinta. |
| stuck: Drop to roots-only for a lap, then add the second string back on just the A5. | Baja a solo raíces por una vuelta, y luego agrega de vuelta la segunda cuerda solo en el A5. |
| levelUp: One beat per chord instead of two — same 60 BPM, twice the changes. | Un tiempo por acorde en vez de dos — el mismo 60 BPM, el doble de cambios. |
| tab caption: "All Along the Watchtower" — verse loop as power chords · 60 BPM | "All Along the Watchtower" — vuelta de la estrofa como acordes de potencia · 60 BPM |
| response prompt: Clean laps in a row at 60 BPM — your count? | Vueltas limpias seguidas a 60 BPM — ¿tu cuenta? |
| response placeholder: e.g. 3 — F5 keeps buzzing | p. ej. 3 — F5 sigue zumbando |
| text: Challenge — "the cure" as power chords (◐ optional harder challenge — try it, no score!): this gentle acoustic song isn't usually played this way — that's the point. Play its progression as power chords — A5 · C5 · D5 · F5 — two beats per chord at 60 BPM, quietly. You've got it when: two laps clean AND soft — power chords don't have to be loud. Song Journey: this is Layer 3 of 5. | Reto — "the cure" como acordes de potencia (◐ reto opcional más difícil — pruébalo, ¡sin puntaje!): esta canción acústica y suave normalmente no se toca así — ese es el punto. Toca su progresión como acordes de potencia — A5 · C5 · D5 · F5 — dos tiempos por acorde a 60 BPM, suavemente. Lo tienes cuando: dos vueltas limpias Y suaves — los acordes de potencia no tienen que ser fuertes. Recorrido de la canción: esto es la Capa 3 de 5. |
| hint: You already know these roots from Module 2. The challenge here is touch: light pick, both strings ringing, no harsh sound. | Ya conoces estas raíces del Módulo 2. El reto aquí es el toque: púa ligera, ambas cuerdas sonando, sin sonido áspero. |
| stuck: Roots-only at a whisper first — get the dynamics, then add the fifths. | Solo raíces en un susurro primero — consigue la dinámica, y luego agrega las quintas. |
| levelUp: Add G5 before looping back to A5, or play one lap loud and one lap soft and hear the difference. | Agrega G5 antes de volver a A5, o toca una vuelta fuerte y una vuelta suave y escucha la diferencia. |
| tab caption: "the cure" — progression as power chords (teaching arrangement) · 60 BPM | "the cure" — progresión como acordes de potencia (arreglo didáctico) · 60 BPM |
| response prompt: Loud vs. soft power chords — which was harder to keep clean? | Acordes de potencia fuertes vs. suaves — ¿cuál fue más difícil de mantener limpio? |
| response placeholder: e.g. soft — I kept muting the D string | p. ej. suave — seguía silenciando la cuerda Re |
| text: Challenge — Luna, full vamp: the whole song rides F5 ↔ A5. Play along with the teaching arrangement — two downbeat strums per bar, changing where the record changes. You've got it when: a full verse and chorus without losing a downbeat, F5 ringing as clean as A5. Song Journey: this is Layer 3 of 5. | Reto — Luna, vamp completo: toda la canción se apoya en F5 ↔ A5. Toca junto con el arreglo didáctico — dos rasgueos en el tiempo fuerte por compás, cambiando donde cambia la grabación. Lo tienes cuando: una estrofa y un coro completos sin perder un tiempo fuerte, con F5 sonando tan limpio como A5. Recorrido de la canción: esto es la Capa 3 de 5. |
| hint: This is the same F5↔A5 slide from the drill above — the only change is following where the record changes instead of a fixed count. | Es el mismo deslizamiento F5↔A5 del ejercicio de arriba — el único cambio es seguir donde cambia la grabación en vez de una cuenta fija. |
| stuck: Loop the F5↔A5 slide with no song for a few rounds first, then drop in following the record. | Repite el deslizamiento F5↔A5 sin la canción por unas cuantas rondas primero, y luego entra siguiendo la grabación. |
| levelUp: Add a light palm mute for the verse, then let it ring open for the chorus — instant dynamics. | Agrega un silenciado ligero con la palma para la estrofa, y luego déjalo sonar abierto para el coro — dinámica instantánea. |
| tab caption: "Luna" — the vamp as power chords (teaching arrangement) · 60 BPM | "Luna" — el vamp como acordes de potencia (arreglo didáctico) · 60 BPM |
| response prompt: Which song did you land power chords in today, and at what BPM? | ¿En qué canción lograste los acordes de potencia hoy, y a qué BPM? |
| response placeholder: e.g. Luna at 60 — clean | p. ej. Luna a 60 — limpio |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: What's your current top clean tempo on the loop, and what's the one thing holding you back from going faster — a specific change, the strum, or muting? Name it below. | ¿Cuál es tu tempo limpio más alto en la vuelta ahora mismo, y cuál es la única cosa que te frena para ir más rápido — un cambio específico, el rasgueo, o el silenciado? Nómbralo abajo. |
| response placeholder: e.g. 75 BPM — the eighth-note up-strums get sloppy | p. ej. 75 BPM — los rasgueos hacia arriba de las corcheas se descuidan |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| m3w2-s1 text: Change power chords on beat 1 at 60 BPM | Cambiar acordes de potencia en el tiempo 1 a 60 BPM |
| m3w2-s1 gotItWhen: your chord changes land exactly on beat 1 with the metronome at 60 BPM and you don't need to pause or restart (70+ BPM is an optional harder challenge). | tus cambios de acorde caen exactamente en el tiempo 1 con el metrónomo a 60 BPM y no necesitas pausar ni reiniciar (70+ BPM es un reto opcional más difícil). |
| m3w2-s2 text: Play a full 8-bar power chord progression in time | Tocar una progresión completa de 8 compases de acordes de potencia a tiempo |
| m3w2-s2 gotItWhen: you can play through 8 bars without stopping, even if a chord change is rough — you keep going to the next downbeat. | puedes tocar los 8 compases sin detenerte, aunque un cambio de acorde salga imperfecto — sigues hasta el siguiente tiempo fuerte. |
| m3w2-s2 practice label: Watchtower roots (A · G · F · G) — two beats each | Raíces de Watchtower (A · G · F · G) — dos tiempos cada una |
| m3w2-s3 text: Play a straight-eighths strumming pattern with power chords | Tocar un patrón de rasgueo de corcheas rectas con acordes de potencia |
| m3w2-s3 gotItWhen: you can strum down on each number and up on each "+" across a bar and count "1 + 2 + 3 + 4 +" aloud without losing the strum. | puedes rasguear hacia abajo en cada número y hacia arriba en cada "+" a lo largo de un compás y contar "1 + 2 + 3 + 4 +" en voz alta sin perder el rasgueo. |
| m3w2-s4 text: Apply power chords on both E and A string roots in the same song | Aplicar acordes de potencia con raíces tanto en la cuerda Mi como en la La dentro de la misma canción |
| m3w2-s4 gotItWhen: you can switch between an E-root and an A-root power chord mid-song without your palm mute breaking or the wrong strings ringing. | puedes cambiar entre un acorde de potencia con raíz en Mi y uno con raíz en La a mitad de la canción sin que se rompa tu silenciado con la palma o suenen las cuerdas equivocadas. |
| m3w2-s4 practice prompt: A song calls for G5 then C5. Where does your index finger go for each? | Una canción pide G5 y luego C5. ¿Dónde va tu dedo índice para cada uno? |
| m3w2-s4 practice choices: Both on E string / Both on A string / G5 on E (fret 3), C5 on A (fret 3) / G5 on A, C5 on E | Ambos en la cuerda Mi / Ambos en la cuerda La / G5 en Mi (traste 3), C5 en La (traste 3) / G5 en La, C5 en Mi |
| m3w2-s5 text: Optional: add 3rd finger octave doubling to the power chord shape | Opcional: agregar duplicación de octava con el tercer dedo a la forma del acorde de potencia |
| m3w2-s5 gotItWhen: your pinky lands on the next string at the same fret as your ring finger and all three notes ring cleanly — no buzz, no muffled string. | tu meñique cae en la siguiente cuerda en el mismo traste que tu anular y las tres notas suenan limpias — sin zumbido, sin cuerdas apagadas. |
| m3w2-s5 practice prompt: You add your pinky on the next string, at the same fret as your ring finger. What interval (an interval = the distance between two notes) did you just add to the chord? | Agregas tu meñique en la siguiente cuerda, en el mismo traste que tu anular. ¿Qué intervalo (un intervalo = la distancia entre dos notas) acabas de agregar al acorde? |
| m3w2-s5 practice choices: A 3rd / A 5th / An octave (same note, higher) / A 7th | Una 3ª / Una 5ª / Una octava (la misma nota, más aguda) / Una 7ª |
| m3w2-s6 text: Clap and count a 4-bar rhythm, and name whole, half, quarter, and eighth notes | Aplaudir y contar un ritmo de 4 compases, y nombrar redondas, blancas, negras y corcheas |
| m3w2-s6 gotItWhen: you can clap a 4-bar line in time with the metronome and say which notes are whole, half, quarter, or eighth — and name your strum as "straight eighths". | puedes aplaudir una línea de 4 compases a tiempo con el metrónomo y decir cuáles notas son redondas, blancas, negras o corcheas — y nombrar tu rasgueo como "corcheas rectas". |
| m3w2-s6 practice prompt: A straight-eighths strum — down on each number, up on each "+", counted "1 + 2 + 3 + 4 +" — is made of which note value? | Un rasgueo de corcheas rectas — abajo en cada número, arriba en cada "+", contado "1 + 2 + 3 + 4 +" — está hecho de qué figura rítmica? |
| m3w2-s6 practice choices: Whole notes / Quarter notes / Eighth notes / Half notes | Redondas / Negras / Corcheas / Blancas |

### Module-level Songs

MODULE_SONGS[3] meta fields (song title shown for reference, not itself translated on the site).

| English | Spanish |
|---|---|
| "All Along the Watchtower" — meta: Full power chord loop · change on beat 1 at 60, hold 80 BPM | Vuelta completa de acordes de potencia · cambia en el tiempo 1 a 60, mantén 80 BPM |
| "Seven Nation Army" — meta: Full riff with power chords | Riff completo con acordes de potencia |
| "Luna" — meta: ◐ Sierreño vamp → power-chord version (on purpose, in a different style than the original) | ◐ Vamp de sierreño → versión con acordes de potencia (a propósito, en un estilo distinto al original) |
| "Sweet Child O' Mine" — meta: Verse: D5–C5–G5 power chord loop | Verso: vuelta de acordes de potencia D5–C5–G5 |
| "Happy Birthday" — meta: Full power chord arrangement (optional) | Arreglo completo con acordes de potencia (opcional) |
| "Smells Like Teen Spirit" — meta: F Bb Ab Db power chord progression | Progresión de acordes de potencia F Bb Ab Db |
| "Zombie" — meta: Em C G D power chord version | Versión con acordes de potencia Em C G D |
| "Master of Puppets" — meta: Simplified intro power chord riff | Riff de intro simplificado con acordes de potencia |
| "Blitzkrieg Bop" — meta: A5 D5 E5 — fast and fun | A5 D5 E5 — rápido y divertido |
| "De Música Ligera" — meta: Bm–G–D–A riff, played as B5–G5–D5–A5 power chords | Riff Bm–G–D–A, tocado como acordes de potencia B5–G5–D5–A5 |

### Module Review

| English | Spanish |
|---|---|
| module: Two-Finger Power Chords | Acordes de potencia con dos dedos |
| skill mr3-s1: I can fret a clean 2-finger power chord (root + 5th) with both notes ringing and no buzz | Puedo trastear un acorde de potencia limpio con dos dedos (raíz + quinta) con las dos notas sonando y sin zumbido |
| skill mr3-s2: I can move the same shape along the low E string and name each chord without counting frets | Puedo mover la misma forma por la cuerda Mi grave y nombrar cada acorde sin contar trastes |
| skill mr3-s3: I can move the shape along the A string and keep the low E string silent | Puedo mover la forma por la cuerda La y mantener silenciada la cuerda Mi grave |
| skill mr3-s5: I can read a power chord symbol like "A5" and instantly know which fret and string my index finger goes to | Puedo leer un símbolo de acorde de potencia como "A5" y saber al instante en qué traste y cuerda va mi dedo índice |
| skill mr3-s7: I can change power chords on beat 1 at 60 BPM without stopping | Puedo cambiar acordes de potencia en el tiempo 1 a 60 BPM sin detenerme |
| skill mr3-s8: I can play an 8-bar progression with a straight-eighths strum, counting "1 + 2 + 3 + 4 +" | Puedo tocar una progresión de 8 compases con un rasgueo de corcheas rectas, contando "1 + 2 + 3 + 4 +" |
| assessItem: Play a core-song excerpt (Seven Nation Army, All Along the Watchtower's A5–G5–F5, or Sweet Child's D5–C5–G5) with changes on beat 1 at 60 BPM — including a clean switch between two power chords with roots on the same fret of the E and A strings, with unused strings muted the whole way — then hold 80 BPM for 15 seconds | Toca un fragmento de canción principal (Seven Nation Army, el A5–G5–F5 de All Along the Watchtower, o el D5–C5–G5 de Sweet Child) con cambios en el tiempo 1 a 60 BPM — incluyendo un cambio limpio entre dos acordes de potencia con raíces en el mismo traste de las cuerdas Mi y La, con las cuerdas que no usas silenciadas todo el tiempo — y luego sostén 80 BPM por 15 segundos |
| assessItem: Read a three-chord (I–IV–V) progression from chord symbols / TAB with a named strumming pattern (straight eighths or the split strum), and name power chords from a chord chart | Lee una progresión de tres acordes (I–IV–V) a partir de símbolos de acorde / TAB con un patrón de rasgueo nombrado (corcheas rectas o el rasgueo dividido), y nombra acordes de potencia a partir de un diagrama de acordes |
| assessItem: Clap and count a 4-bar rhythm using whole, half, quarter, and eighth notes | Aplaude y cuenta un ritmo de 4 compases usando redondas, blancas, negras y corcheas |
| forward: The two-finger shape and the muting you just locked in are the backbone of rhythm guitar. The E & A string roots you slide between also become your starting point for the pentatonic patterns in Module 4 — that's where you'll play lead lines and solos over these very same power chords. | La forma de dos dedos y el silenciado que acabas de dominar son la columna vertebral de la guitarra rítmica. Las raíces de las cuerdas Mi & La entre las que te deslizas también se convierten en tu punto de partida para los patrones pentatónicos del Módulo 4 — ahí es donde vas a tocar líneas melódicas y solos sobre estos mismos acordes de potencia. |

## Module 4 — Major / Minor / Blues Pentatonic Scales

### Set 1

| English | Spanish |
|---|---|
| unit: Module 4 · Major / Minor / Blues Pentatonic Scales | Módulo 4 · Escalas pentatónicas mayor, menor y de blues |
| subtitle: Pentatonic Pattern 1 · Major & minor positioning · Improvising on E & A strings | Patrón pentatónico 1 · Posicionamiento mayor y menor · Improvisar en las cuerdas Mi y La |
| skillFocus: Playing Pentatonic Pattern 1 · Positioning it for major and minor keys · Improvising with the scale | Tocar el Patrón pentatónico 1 · Posicionarlo para tonalidades mayores y menores · Improvisar con la escala |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Position the pattern yourself | Posiciona el patrón tú mismo |
| Section title: Listen — major vs minor moods | Escucha — estados de ánimo mayor vs menor |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — pattern drill & first improvisation | Estación de práctica — ejercicio del patrón y primera improvisación |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Play Pattern 1 with alternate picking | Toca el Patrón 1 con púa alterna |
| Section title: Position Pattern 1 for major & minor | Posiciona el Patrón 1 para mayor y menor |
| Section title: Improvise your first solo | Improvisa tu primer solo |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: My Practice Routine — weekly check-in (never graded) | Mi rutina de práctica — check-in semanal (nunca se califica) |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: The Minor Pentatonic Scale on Guitar Explained – Lauren Bateman (0:00–5:00). As you watch, follow along on your guitar — pause and find each note BEFORE she names it. | Mira: The Minor Pentatonic Scale on Guitar Explained – Lauren Bateman (0:00–5:00). Mientras miras, sigue el ritmo en tu guitarra — pausa y encuentra cada nota ANTES de que ella la nombre. |
| hint: Follow along on your guitar as she shows the pattern. Pause and find each note before she names it. | Sigue el ritmo en tu guitarra mientras ella muestra el patrón. Pausa y encuentra cada nota antes de que ella la nombre. |
| response prompt: For A minor pentatonic Pattern 1, where does your 1st finger sit on the low E string? | Para el Patrón pentatónico 1 de A menor, ¿dónde se coloca tu dedo índice en la cuerda Mi grave? |
| response explain: The root A is at fret 5 on the low E, and in minor pentatonic Pattern 1 your 1st finger plays the root — so 5th fret. | La raíz A está en el traste 5 de la Mi grave, y en el Patrón pentatónico 1 menor tu dedo índice toca la raíz — así que el traste 5. |
| response choices: 5th fret / 3rd fret / The open string / 7th fret | Traste 5 / Traste 3 / La cuerda al aire / Traste 7 |
| text: Watch: Major Pentatonic Scale – Marty Music (the link jumps to 1:45, where the lesson starts — watch to about 4:00). As you watch, find the root note on your own neck and play the shape up once before answering below. | Mira: Major Pentatonic Scale – Marty Music (el enlace salta a 1:45, donde empieza la lección — mira hasta cerca de 4:00). Mientras miras, encuentra la nota raíz en tu propio mástil y toca la forma una vez antes de responder abajo. |
| hint: Focus on the Pattern 1 shape — how does it sit on the neck? Notice where the root note is. | Concéntrate en la forma del Patrón 1 — ¿cómo se ubica en el mástil? Fíjate en dónde está la nota raíz. |
| response placeholder: Describe the Pattern 1 shape. Where is the root note? | Describe la forma del Patrón 1. ¿Dónde está la nota raíz? |

**Station B — Position the pattern yourself**

| English | Spanish |
|---|---|
| text: Try positioning Pattern 1 as C major pentatonic: place your 4th finger on the 8th fret of string 6 (the note C). Play the pattern up and down slowly. Click "Hear C major pentatonic" below to check your ear against it. | Intenta posicionar el Patrón 1 como C mayor pentatónica: coloca tu dedo anular (4º) en el traste 8 de la cuerda 6 (la nota C). Toca el patrón hacia arriba y hacia abajo despacio. Presiona "Escucha C mayor pentatónica" abajo para comprobarlo con tu oído. |
| hint: Major pentatonic: 4th finger on root. Minor pentatonic: 1st finger on root. Same pattern — different finger on the starting note. | Pentatónica mayor: dedo 4º (meñique) en la raíz. Pentatónica menor: dedo 1º (índice) en la raíz. Mismo patrón — dedo distinto en la nota inicial. |
| playSeq label: Hear C major pentatonic | Escucha C mayor pentatónica |
| response prompt: For MAJOR pentatonic in Pattern 1, which finger plays the root note? | Para la pentatónica MAYOR en el Patrón 1, ¿qué dedo toca la nota raíz? |
| response explain: Same shape, different root: in MAJOR pentatonic your 4th finger (pinky) sits on the root; in minor it's the 1st finger. | Misma forma, raíz distinta: en la pentatónica MAYOR tu dedo 4º (meñique) se coloca en la raíz; en la menor es el dedo 1º (índice). |
| response choices: 4th finger (pinky) / 1st finger (index) / 2nd finger (middle) / It does not matter which finger | Dedo 4º (meñique) / Dedo 1º (índice) / Dedo 2º (medio) / No importa qué dedo |

**Station B — Listen — major vs minor moods**

| English | Spanish |
|---|---|
| text: Match the mood — scale choice changes the feel. Listen to two short solos: Clip 1 — "La Bamba" (major pentatonic) then Clip 2 — "The Thrill Is Gone" (minor / blues). Notice how the major-pentatonic solo sounds brighter and happier, while the minor / blues solo sounds darker and moodier. | Iguala el estado de ánimo — la elección de escala cambia la sensación. Escucha dos solos cortos: Clip 1 — "La Bamba" (pentatónica mayor) y luego Clip 2 — "The Thrill Is Gone" (menor / blues). Fíjate en cómo el solo con pentatónica mayor suena más brillante y alegre, mientras que el solo menor / blues suena más oscuro y melancólico. |
| hint: Major pentatonic = brighter, sunnier. Minor / blues = darker, sadder, more "bluesy." Same instrument — the scale choice sets the mood. | Pentatónica mayor = más brillante, más soleada. Menor / blues = más oscura, más triste, más "bluesera." Mismo instrumento — la escala elegida define el ánimo. |
| response prompt: Which solo sounds darker / more "blues"? | ¿Qué solo suena más oscuro / más "blues"? |
| response explain: Clip 2 ("The Thrill Is Gone") uses the minor / blues scale — darker and moodier. Clip 1 ("La Bamba") is major pentatonic — brighter and sunnier. | El Clip 2 ("The Thrill Is Gone") usa la escala menor / blues — más oscura y melancólica. El Clip 1 ("La Bamba") es pentatónica mayor — más brillante y alegre. |
| response choices: Clip 1 (major pentatonic) / Clip 2 (minor / blues) / No difference | Clip 1 (pentatónica mayor) / Clip 2 (menor / blues) / Sin diferencia |
| text: In one word each, name the mood you heard in the two clips above. | En una palabra cada uno, nombra el estado de ánimo que escuchaste en los dos clips de arriba. |
| hint: There's no wrong answer — trust your ear. Words like "bright," "happy," "dark," "sad," or "moody" all work. | No hay respuesta incorrecta — confía en tu oído. Palabras como "brillante," "alegre," "oscuro," "triste," o "melancólico" funcionan todas. |
| response prompt: In one word, describe the mood of each clip. | En una palabra, describe el estado de ánimo de cada clip. |
| response placeholder: Clip 1: ____   ·   Clip 2: ____ | Clip 1: ____   ·   Clip 2: ____ |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: when you positioned Pattern 1 today, what told you whether you were set up for MAJOR or MINOR — the finger on the root, or the sound? Which felt more reliable? | Cierre de la estación — pausa y piensa: cuando posicionaste el Patrón 1 hoy, ¿qué te decía si estabas listo para MAYOR o para MENOR — el dedo en la raíz, o el sonido? ¿Cuál se sintió más confiable? |
| response placeholder: e.g. I trusted the finger (4th = major, 1st = minor) more than my ear so far | p. ej. confié más en el dedo (4º = mayor, 1º = menor) que en mi oído hasta ahora |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Tuning (Module 1) is a skill you keep forever. As you climb the pentatonic pattern today, keep naming the notes too — that's your Module 2 fretboard map in action. | Afinar (Módulo 1) es una destreza que conservas para siempre. Mientras subes por el patrón pentatónico hoy, sigue nombrando las notas también — es tu mapa del diapasón del Módulo 2 en acción. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Play Pattern 1 with alternate picking**

| English | Spanish |
|---|---|
| text: Challenge 1 — Pattern 1 Climb (skills-check warm-up): play Pentatonic Pattern 1 ascending at 60 BPM, one note per beat, alternate picking (down-up-down-up). You've got it when: every note rings clean with no missed picks. This is a warm-up drill — the module assessment is your own 4-bar solo (you'll compose it in Set 3), held to the backing track's pulse — but this is the benchmark lap (a lap = one full time through) for your Set 1 check-off. Click "Play all" to hear it. | Reto 1 — Subida del Patrón 1 (calentamiento de revisión de destrezas): toca el Patrón pentatónico 1 subiendo a 60 BPM, una nota por tiempo, con púa alterna (abajo-arriba-abajo-arriba). Lo tienes cuando: cada nota suena limpia sin púas falladas. Este es un ejercicio de calentamiento — la evaluación del módulo es tu propio solo de 4 compases (lo compondrás en la Unidad 3), sostenido al pulso de la pista de acompañamiento — pero esta es la vuelta de referencia (una vuelta = un recorrido completo) para tu verificación de la Unidad 1. Presiona "Tocar todo" para escucharlo. |
| hint: Go as slow as you need. Every note should ring cleanly. Say each note aloud as you play it to connect your ear to your fingers. Set the ⏱ Timer for 2 minutes and loop it. | Ve tan despacio como necesites. Cada nota debe sonar limpia. Di cada nota en voz alta mientras la tocas para conectar tu oído con tus dedos. Pon el ⏱ Temporizador en 2 minutos y repítelo. |
| stuck: Drop to the lowest two strings only (E and A) and climb just those until they're clean, then add the rest one string at a time. | Baja a solo las dos cuerdas más graves (Mi y La) y sube solo esas hasta que estén limpias, y luego agrega el resto una cuerda a la vez. |
| levelUp: Play it descending too (top to bottom), or raise the metronome to 80 BPM and keep the picking strictly down-up. | Tócalo también bajando (de arriba a abajo), o sube el metrónomo a 80 BPM y mantén la púa estrictamente abajo-arriba. |
| playSeq label: Play all | Tocar todo |
| response prompt: Personal record: play it cleanly at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN climb today (BPM)? | Récord personal: tócalo limpio a 60 BPM, y luego sube el metrónomo de 10 en 10. ¿Tu subida LIMPIA más rápida hoy (BPM)? |
| response placeholder: e.g. 80 — try for a higher number next session | p. ej. 80 — intenta superarlo la próxima sesión |

**Station C — Position Pattern 1 for major & minor**

| English | Spanish |
|---|---|
| text: Challenge 2 — Move the Box (a box = the block of frets where a scale pattern sits): play Pattern 1 as A minor pentatonic (1st finger, 5th fret, string 6) up and down using the TAB map, then shift it to E minor pentatonic (open-string root). You've got it when: both positions clean — same shape, two spots on the neck. | Reto 2 — Mueve la caja (una caja = el bloque de trastes donde se ubica un patrón de escala): toca el Patrón 1 como A menor pentatónica (dedo índice, traste 5, cuerda 6) subiendo y bajando usando el mapa de TAB, y luego cámbialo a E menor pentatónica (raíz en cuerda al aire). Lo tienes cuando: ambas posiciones limpias — misma forma, dos lugares en el mástil. |
| hint: A minor: your hand sits around frets 5–8. E minor: the open strings do your 1st finger's job, and your other fingers play frets 2 and 3. | A menor: tu mano se ubica alrededor de los trastes 5–8. E menor: las cuerdas al aire hacen el trabajo de tu dedo índice, y tus otros dedos tocan los trastes 2 y 3. |
| stuck: Stay on A minor only until the shape is automatic, then slide the whole hand down to find E minor — it's the exact same finger pattern, just moved. | Quédate solo con A menor hasta que la forma sea automática, y luego desliza toda la mano hacia abajo para encontrar E menor — es exactamente el mismo patrón de dedos, solo movido. |
| levelUp: Position it a third place — G minor (3rd fret root) — or call out the root note name before you start each box. | Posiciónalo en un tercer lugar — G menor (raíz en traste 3) — o di en voz alta el nombre de la nota raíz antes de empezar cada caja. |
| tab caption: A minor pentatonic Pattern 1 · ascending across all 6 strings | Patrón pentatónico 1 de A menor · subiendo por las 6 cuerdas |

**Station C — Improvise your first solo**

| English | Spanish |
|---|---|
| text: Challenge 3 — Rule of 3 (try it!): improvise using ONLY 3 notes of Pattern 1 for 4 bars over the Am backing track — ▶ 🎵 Am jam track. Once those 3 feel comfortable, add a 4th note and play 4 more bars. No score — aim for short, intentional ideas with space between them. | Reto 3 — Regla de 3 (¡pruébalo!): improvisa usando SOLO 3 notas del Patrón 1 durante 4 compases sobre la pista de acompañamiento de Am — ▶ 🎵 pista de jam en Am. Una vez que esas 3 se sientan cómodas, agrega una 4ª nota y toca 4 compases más. Sin puntaje — apunta a ideas cortas e intencionadas con espacio entre ellas. |
| hint: Limiting yourself to 3 notes forces you to make music with phrasing and rhythm, not note-count. A short, clear idea with silence around it is better than a stream of notes. | Limitarte a 3 notas te obliga a hacer música con frases y ritmo, no con cantidad de notas. Una idea corta y clara con silencio alrededor es mejor que un torrente de notas. |
| stuck: Pick just 2 notes on one string and trade them back and forth, changing only the rhythm — that's already improvising. | Elige solo 2 notas en una cuerda e intercámbialas, cambiando solo el ritmo — eso ya es improvisar. |
| levelUp: Add a 4th and 5th note, or end every phrase on the root (A) so each idea "arrives home" (home = the note the music rests on and sounds finished). | Agrega una 4ª y 5ª nota, o termina cada frase en la raíz (A) para que cada idea "llegue a la nota base" (nota base = la nota donde descansa la música y suena terminada). |
| text: Challenge 4 — The Four-Phrase Plan: use the SAME 3 notes from Rule of 3, but now shape a whole solo with four short phrases — about one bar each, silence between them (the space IS part of the plan). Give each phrase a job: Phrase 1 — say it (a tiny idea, 2–4 notes). Phrase 2 — repeat it (play that same idea again, maybe with one note changed). Phrase 3 — stretch it (take the idea higher, or keep the notes and change the rhythm). Phrase 4 — come home (end on the root, A, so the solo lands). Play it over the Am backing track — ▶ 🎵 Am jam track. You've got it when: four distinct phrases with space between them, and the last one lands on the root (A). | Reto 4 — El plan de las cuatro frases: usa las MISMAS 3 notas de la Regla de 3, pero ahora dale forma a un solo entero con cuatro frases cortas — más o menos un compás cada una, con silencio entre ellas (el espacio SÍ es parte del plan). Dale un trabajo a cada frase: Frase 1 — dila (una idea pequeña, 2–4 notas). Frase 2 — repítela (toca esa misma idea otra vez, tal vez con una nota cambiada). Frase 3 — estírala (lleva la idea más arriba, o mantén las notas y cambia el ritmo). Frase 4 — llega a la nota base (termina en la raíz, A, para que el solo aterrice). Tócalo sobre la pista de acompañamiento de Am — ▶ 🎵 pista de jam en Am. Lo tienes cuando: cuatro frases distintas con espacio entre ellas, y la última aterriza en la raíz (A). |
| hint: This is Rule of 3 with a road map. Say-it / repeat-it / stretch-it / come-home turns three notes into a story with a beginning, middle, and ending — instead of a random string of notes. | Esto es la Regla de 3 con un mapa de ruta. Decirla / repetirla / estirarla / llegar a la nota base convierte tres notas en una historia con principio, desarrollo y final — en vez de una serie aleatoria de notas. |
| stuck: Make Phrases 1 and 2 EXACTLY the same — note for note. Repeating an idea isn't cheating, it's how nearly every melody you know works. Your ear is waiting to hear it come back. | Haz que las Frases 1 y 2 sean EXACTAMENTE iguales — nota por nota. Repetir una idea no es hacer trampa, así funciona casi toda melodía que conoces. Tu oído está esperando escucharla regresar. |
| levelUp: Name the four jobs out loud — "say it… repeat it… stretch it… come home" — before you play each phrase, or run the whole plan over the Am backing track and hold the track's pulse start to finish. | Nombra los cuatro trabajos en voz alta — "dila… repítela… estírala… llega a la nota base" — antes de tocar cada frase, o corre el plan completo sobre la pista de acompañamiento de Am y sostén el pulso de la pista de principio a fin. |
| response prompt: Describe your Phrase 1 "say it" idea in words — which notes, and its rhythm? | Describe con palabras tu idea de la Frase 1 "dila" — ¿qué notas, y qué ritmo? |
| response placeholder: e.g. A then C, two quick notes | p. ej. A y luego C, dos notas rápidas |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Solo over Seven Nation Army: loop the SNA riff (a riff = a short musical phrase that repeats) in your head (or record yourself playing the riff and jam over the playback) and improvise using ONLY these three notes — low E, G, and open A — for four bars. Rule of 3: short ideas, space between them. You've got it when: four bars of intentional phrases — not a stream of notes — that land back on E. 🧵 Song Journey: this is Layer 4 of 5. | Reto — Solo sobre Seven Nation Army: repite el riff de SNA (un riff = una frase musical corta que se repite) en tu cabeza (o grábate tocando el riff y toca sobre la grabación) e improvisa usando SOLO estas tres notas — Mi grave, G, y La al aire — durante cuatro compases. Regla de 3: ideas cortas, espacio entre ellas. Lo tienes cuando: cuatro compases de frases intencionadas — no un torrente de notas — que aterricen de vuelta en E. 🧵 Recorrido de la canción: esto es la Capa 4 de 5. |
| hint: E is the note this song centers on. End every phrase on it and you'll always sound like you meant it. | E es la nota en la que se centra esta canción. Termina cada frase en ella y siempre sonará como si lo hubieras hecho a propósito. |
| stuck: Play just E and G, trading two-beat phrases with silence: play two beats, rest two beats. | Toca solo E y G, intercambiando frases de dos tiempos con silencio: toca dos tiempos, descansa dos tiempos. |
| levelUp: Add the open D string as a fourth note, or record the riff on a loop and trade fours with your recording (trade fours = play 4 bars, then let the recording play 4) — or with anyone at home who'll play it. | Agrega la cuerda Re al aire como una cuarta nota, o graba el riff en un loop e intercambia de a cuatro con tu grabación (intercambiar de a cuatro = toca 4 compases, y luego deja que la grabación toque 4) — o con quien esté en casa y quiera tocarlo. |
| tab caption: Your three allowed notes — E minor pentatonic, open position | Tus tres notas permitidas — E menor pentatónica, posición abierta |
| response prompt: Describe your best phrase in words — what made it feel finished? | Describe tu mejor frase con palabras — ¿qué la hizo sentir terminada? |
| response placeholder: e.g. two quick notes then a long E | p. ej. dos notas rápidas y luego una E larga |
| text: Challenge — Solo over Watchtower: the song's loop is Am · G · F · G — and A minor pentatonic Pattern 1 (the box you just learned) fits every bar of it. Improvise four bars using only the three notes marked below, then four more adding a fourth note of your choice from Pattern 1. You've got it when: eight bars where every phrase starts or ends on A. 🧵 Song Journey: this is Layer 4 of 5. | Reto — Solo sobre Watchtower: la vuelta de la canción es Am · G · F · G — y el Patrón pentatónico 1 de A menor (la caja que acabas de aprender) encaja en cada compás. Improvisa cuatro compases usando solo las tres notas marcadas abajo, y luego cuatro más agregando una cuarta nota de tu elección del Patrón 1. Lo tienes cuando: ocho compases donde cada frase empieza o termina en A. 🧵 Recorrido de la canción: esto es la Capa 4 de 5. |
| hint: This is the same box from your Pattern 1 drill — you're not learning anything new, you're USING it. That's the whole point of today. | Esta es la misma caja de tu ejercicio del Patrón 1 — no estás aprendiendo nada nuevo, la estás USANDO. Ese es todo el punto de hoy. |
| stuck: Freeze the rhythm: only quarter notes, only the three marked notes, until an idea shows up on its own. | Congela el ritmo: solo negras, solo las tres notas marcadas, hasta que una idea aparezca por sí sola. |
| levelUp: Start a phrase during the F bar and resolve it on the Am bar — that's real tension and release. | Empieza una frase durante el compás de F y resuélvela en el compás de Am — eso es tensión y resolución de verdad. |
| tab caption: Your three starting notes — Am pentatonic Pattern 1 · 5th position | Tus tres notas iniciales — Patrón pentatónico 1 de Am · 5ª posición |
| response prompt: Which chord in the loop was easiest to solo over, and which fought you? | ¿Qué acorde de la vuelta fue el más fácil para improvisar, y cuál se te resistió? |
| response placeholder: e.g. Am easy, F felt weird | p. ej. Am fácil, F se sintió raro |
| text: Challenge — Solo over Luna: Luna lives in F major, and F's relative minor is D — so D minor pentatonic Pattern 1 (root D, low E fret 10) is your box: the exact shape you've been drilling, parked at the course's highest position. Improvise four bars using only the three notes marked below, then four more adding a fourth note from the box. Jam over ▶ 🎵 Luna's Dm backing track. You've got it when: eight bars where every phrase starts or ends on D. 🧵 Song Journey: this is Layer 4 of 5. | Reto — Solo sobre Luna: Luna vive en F mayor, y la relativa menor de F es D — así que el Patrón pentatónico 1 de D menor (raíz D, cuerda Mi grave traste 10) es tu caja: la misma forma que has estado ejercitando, ubicada en la posición más alta del curso. Improvisa cuatro compases usando solo las tres notas marcadas abajo, y luego cuatro más agregando una cuarta nota de la caja. Toca sobre ▶ 🎵 la pista de acompañamiento de Dm de Luna. Lo tienes cuando: ocho compases donde cada frase empieza o termina en D. 🧵 Recorrido de la canción: esto es la Capa 4 de 5. |
| hint: Same Pattern 1 shape — just at fret 10. This high up, the frets sit closer together, so the stretch is easier than it looks. | La misma forma del Patrón 1 — solo que en el traste 10. Tan arriba, los trastes están más juntos, así que el estiramiento es más fácil de lo que parece. |
| stuck: Trade just D and F (frets 10 and 13 on the low E) back and forth, changing only the rhythm, until an idea appears. | Intercambia solo D y F (trastes 10 y 13 en la Mi grave), cambiando solo el ritmo, hasta que aparezca una idea. |
| levelUp: End every phrase on D so each idea arrives home — or hold the F (fret 13) a little longer for a sadder, longing feel. | Termina cada frase en D para que cada idea llegue a la nota base — o sostén el F (traste 13) un poco más para una sensación más triste y anhelante. |
| tab caption: Your three starting notes — D minor pentatonic Pattern 1 · 10th position | Tus tres notas iniciales — Patrón pentatónico 1 de D menor · 10ª posición |
| response prompt: Which note felt like "home" over the Dm track, and did your phrases land there? | ¿Qué nota se sintió como "nota base" sobre la pista de Dm, y tus frases aterrizaron ahí? |
| response placeholder: e.g. D at fret 10 — landed there most times | p. ej. D en el traste 10 — aterricé ahí la mayoría de las veces |

**Station C — My Practice Routine — weekly check-in (never graded)**

| English | Spanish |
|---|---|
| text: Plan your practice — this one's just for you, never graded. Take two minutes to update your routine: (1) one thing you want to get better at, (2) when and where you'll practice this week, (3) how last week's plan went. Same check-in you've kept since Module 1 — we keep it going through the whole course. | Planea tu práctica — esta parte es solo para ti, nunca se califica. Tómate dos minutos para actualizar tu rutina: (1) una cosa en la que quieres mejorar, (2) cuándo y dónde vas a practicar esta semana, (3) cómo te fue con el plan de la semana pasada. El mismo check-in que has mantenido desde el Módulo 1 — lo seguimos manteniendo durante todo el curso. |
| hint: No wrong answers — even five minutes a day is better than one long rushed session. You're building a habit you'll actually keep. | No hay respuestas incorrectas — hasta cinco minutos al día es mejor que una sola sesión larga y apurada. Estás construyendo un hábito que de verdad vas a mantener. |
| response placeholder: 1) One thing to improve   2) When & where I'll practice   3) How last week went | 1) Algo que quiero mejorar   2) Cuándo y dónde voy a practicar   3) Cómo me fue la semana pasada |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Which felt harder today — playing the pattern cleanly, or making music with only 3 notes? Write it below — that's your warm-up target next time. | ¿Qué se sintió más difícil hoy — tocar el patrón limpio, o hacer música con solo 3 notas? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez. |
| response placeholder: e.g. the pattern is clean; making 3 notes sound intentional is the hard part | p. ej. el patrón sale limpio; hacer que 3 notas suenen intencionadas es la parte difícil |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| m4w1-s1 text: Play Pentatonic Pattern 1 ascending and descending from memory | Tocar el Patrón pentatónico 1 subiendo y bajando de memoria |
| m4w1-s1 gotItWhen: you can play the full pattern up and back down without looking at a diagram, with no missed notes or hesitations. | puedes tocar el patrón completo subiendo y volviendo a bajar sin mirar un diagrama, sin notas falladas ni dudas. |
| m4w1-s1 practice label: Am pentatonic Pattern 1 (ascending) | Patrón pentatónico 1 de Am (subiendo) |
| m4w1-s2 text: Use alternate picking (down-up) consistently through the pattern | Usar púa alterna (abajo-arriba) de forma constante a lo largo del patrón |
| m4w1-s2 gotItWhen: your pick alternates down-up-down-up automatically — you don't have to think about which direction comes next. | tu púa alterna abajo-arriba-abajo-arriba automáticamente — no tienes que pensar en qué dirección sigue. |
| m4w1-s3 text: Position Pattern 1 as a minor pentatonic scale (1st finger on root) | Posicionar el Patrón 1 como escala pentatónica menor (dedo índice en la raíz) |
| m4w1-s3 gotItWhen: you can pick any minor key (Am, Em, Gm…), place your 1st finger on the right fret of the low E, and play the pattern from there. | puedes elegir cualquier tonalidad menor (Am, Em, Gm…), colocar tu dedo índice en el traste correcto de la Mi grave, y tocar el patrón desde ahí. |
| m4w1-s3 practice prompt: Your 1st finger is on the low E string at fret 8. Which minor pentatonic scale are you set up to play? | Tu dedo índice está en la cuerda Mi grave, traste 8. ¿Qué escala pentatónica menor estás listo para tocar? |
| m4w1-s3 practice choices: A minor / C minor / E minor / G minor | A menor / C menor / E menor / G menor |
| m4w1-s4 text: Position Pattern 1 as a major pentatonic scale (4th finger on root) | Posicionar el Patrón 1 como escala pentatónica mayor (dedo meñique en la raíz) |
| m4w1-s4 gotItWhen: you can pick any major key (C, G, D…), place your 4th finger on the right fret of the low E, and play the pattern from there. | puedes elegir cualquier tonalidad mayor (C, G, D…), colocar tu dedo meñique en el traste correcto de la Mi grave, y tocar el patrón desde ahí. |
| m4w1-s4 practice prompt: When you treat Pattern 1 as a MAJOR pentatonic, which finger sits on the root? | Cuando tratas el Patrón 1 como pentatónica MAYOR, ¿qué dedo se coloca en la raíz? |
| m4w1-s4 practice choices: 1st (index) / 2nd (middle) / 3rd (ring) / 4th (pinky) | 1º (índice) / 2º (medio) / 3º (anular) / 4º (meñique) |
| m4w1-s5 text: Play the pattern in time at 60 BPM with a metronome | Tocar el patrón a tiempo a 60 BPM con un metrónomo |
| m4w1-s5 gotItWhen: every note lands on a beat at 60 BPM and you can play the whole pattern without stopping or losing the click. | cada nota cae en un tiempo a 60 BPM y puedes tocar todo el patrón sin detenerte ni perder el clic. |
| m4w1-s6 text: Improvise a short 2-bar musical idea using 2–3 notes from the pattern | Improvisar una idea musical corta de 2 compases usando 2–3 notas del patrón |
| m4w1-s6 gotItWhen: you can play a 2-bar phrase that feels intentional — not random — using just 2 or 3 notes from the pattern. | puedes tocar una frase de 2 compases que se sienta intencionada — no aleatoria — usando solo 2 o 3 notas del patrón. |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 4 · Major / Minor / Blues Pentatonic Scales | Módulo 4 · Escalas pentatónicas mayor, menor y de blues |
| subtitle: Tone parameters · Phrasing strategies · Notes on D & G strings | Parámetros de tono · Estrategias de fraseo · Notas en las cuerdas Re y Sol |
| skillFocus: Playing expressively with dynamics and tone · Phrasing a solo with call-and-response · Notes on the D and G strings | Tocar con expresividad usando dinámica y tono · Frasear un solo con llamada y respuesta · Notas en las cuerdas Re y Sol |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Experiment with timbre | Experimenta con el timbre |
| Section title: Name the D-string notes | Nombra las notas de la cuerda Re |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — phrasing & D/G strings | Estación de práctica — fraseo y cuerdas Re/Sol |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Play an expressive one-note solo | Toca un solo expresivo de una sola nota |
| Section title: Improvise a call-and-response phrase | Improvisa una frase de llamada y respuesta |
| Section title: Name the notes on the D & G strings | Nombra las notas en las cuerdas Re y Sol |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Station Wrap-Up | Cierre de la estación |
| Section title: ⚡ Ear Spark — optional ear bonus | ⚡ Chispa auditiva — bono opcional de oído |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: How to USE the Minor Pentatonic Scale – Lauren Bateman (0:00–4:00) to refresh the shape. Then YOU add the expression the video doesn't: pick one note from the pattern and play it loud, then soft — that difference in volume is dynamics. | Mira: How to USE the Minor Pentatonic Scale – Lauren Bateman (0:00–4:00) para repasar la forma. Luego TÚ agregas la expresión que el video no muestra: elige una nota del patrón y tócala fuerte, y luego suave — esa diferencia de volumen es la dinámica. |
| hint: The video shows the notes; the dynamics are on you. Play one note loud, then whisper-soft, and listen for how much the FEEL changes even though the note doesn't. | El video muestra las notas; la dinámica depende de ti. Toca una nota fuerte, y luego en un susurro suave, y escucha cuánto cambia la SENSACIÓN aunque la nota no cambie. |
| response placeholder: Describe your own loud-then-soft experiment: which note, and what changed in the sound? | Describe tu propio experimento fuerte-luego-suave: qué nota, y qué cambió en el sonido? |
| text: Watch: Hammer-Ons & Pull-Offs Explained – JustinGuitar (0:00–3:00). As you watch, try one hammer-on on your own guitar — pick the open D string, then hammer your finger onto the 2nd fret without picking again. | Mira: Hammer-Ons & Pull-Offs Explained – JustinGuitar (0:00–3:00). Mientras miras, prueba un hammer-on en tu propia guitarra — pulsa la cuerda Re al aire, y luego martilla tu dedo sobre el traste 2 sin pulsar de nuevo. |
| hint: These are your first "expressive" techniques. A hammer-on connects two notes with one pick stroke — it changes the shape (envelope) of the notes. | Estas son tus primeras técnicas "expresivas." Un hammer-on conecta dos notas con un solo golpe de púa — cambia la forma (envolvente) de las notas. |
| response prompt: A hammer-on connects two notes using how many pick strokes? | Un hammer-on conecta dos notas usando cuántos golpes de púa? |
| response explain: You pick the first note once, then "hammer" a finger onto the higher fret to sound the second note — one pick stroke for both. | Pulsas la primera nota una vez, y luego "martillas" un dedo sobre el traste más alto para sonar la segunda nota — un golpe de púa para las dos. |
| response choices: One pick stroke / Two pick strokes / Zero pick strokes / Depends on the speed | Un golpe de púa / Dos golpes de púa / Cero golpes de púa / Depende de la velocidad |

**Station B — Experiment with timbre**

| English | Spanish |
|---|---|
| text: Experiment with timbre: play a note close to the bridge, then the same note near the neck. Hear the difference? Bright vs warm. Try to match the mood of a song you know. | Experimenta con el timbre: toca una nota cerca del puente, y luego la misma nota cerca del mástil. ¿Escuchas la diferencia? Brillante vs cálido. Intenta igualar el estado de ánimo de una canción que conozcas. |
| hint: There's no wrong answer here. Your picking hand position is a real-time tone control. Move it consciously. | No hay respuesta incorrecta aquí. La posición de tu mano de pulsar es un control de tono en tiempo real. Muévela con intención. |
| response prompt: Which picking position sounds BRIGHTER? | ¿Qué posición de pulsado suena más BRILLANTE? |
| response explain: Picking close to the bridge gives a brighter, sharper tone; picking near the neck sounds warmer and rounder. Your picking hand is a live tone control. | Pulsar cerca del puente da un tono más brillante y agudo; pulsar cerca del mástil suena más cálido y redondo. Tu mano de pulsar es un control de tono en vivo. |
| response choices: Close to the bridge / Close to the neck / Right over the soundhole / They sound exactly the same | Cerca del puente / Cerca del mástil / Justo sobre la boca de la guitarra / Suenan exactamente igual |

**Station B — Name the D-string notes**

| English | Spanish |
|---|---|
| text: Now try it: the natural notes on the D string. Click any note below the TAB to hear it, then play and NAME each one up the string — D · E · F · G · A · B · C. You'll drill this without looking at the chart at the practice station. | Ahora pruébalo: las notas naturales de la cuerda Re. Presiona cualquier nota debajo del TAB para escucharla, y luego toca y NOMBRA cada una subiendo por la cuerda — D · E · F · G · A · B · C. Vas a ejercitar esto sin mirar el diagrama en la estación de práctica. |
| hint: It's the same musical alphabet you know from the E and A strings. The gap between E–F and B–C is one fret (a half step). Every other gap is two frets (a whole step). | Es el mismo alfabeto musical que conoces de las cuerdas Mi y La. La distancia entre E–F y B–C es un traste (un semitono). Cualquier otra distancia es de dos trastes (un tono). |
| tab caption: D string natural notes · D E F G A B C (frets 0–10) | Notas naturales de la cuerda Re · D E F G A B C (trastes 0–10) |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: which expressive tool felt most natural today — dynamics (loud/soft), timbre (bright/warm), or the hammer-on? Which one will you lean on in your solos? | Cierre de la estación — pausa y piensa: ¿qué herramienta expresiva se sintió más natural hoy — la dinámica (fuerte/suave), el timbre (brillante/cálido), o el hammer-on? ¿En cuál te vas a apoyar en tus solos? |
| response placeholder: e.g. dynamics came easily; hammer-ons still feel unreliable | p. ej. la dinámica salió fácil; los hammer-ons todavía se sienten poco confiables |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Tuning (Module 1) is a skill you keep forever. Today you're adding expression on top of clean notes — so the notes have to be clean first. | Afinar (Módulo 1) es una destreza que conservas para siempre. Hoy agregas expresión sobre notas limpias — así que las notas tienen que estar limpias primero. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Play an expressive one-note solo**

| English | Spanish |
|---|---|
| text: Challenge 1 — The One-Note Solo: choose one note in the Am pentatonic pattern and play only that note for 8 bars, varying rhythm, dynamics, and tone. You've got it when: make one note stay interesting for all 8 bars — record it and listen back. | Reto 1 — El solo de una nota: elige una nota del patrón pentatónico de Am y toca solo esa nota durante 8 compases, variando el ritmo, la dinámica y el tono. Lo tienes cuando: logras que una nota se mantenga interesante durante los 8 compases — grábalo y escúchalo después. |
| hint: This sounds easy but isn't. Can you make one note interesting for 8 whole bars? The way you play it matters more than how many notes you play. | Esto suena fácil pero no lo es. ¿Puedes hacer que una nota sea interesante durante 8 compases completos? La forma en que la tocas importa más que cuántas notas toques. |
| stuck: Just change ONE thing per bar — louder, then softer, then short, then long. That's already a one-note solo. | Cambia SOLO una cosa por compás — más fuerte, y luego más suave, y luego corta, y luego larga. Eso ya es un solo de una nota. |
| levelUp: Add a hammer-on or a slide into the note, or move your picking hand bridge-to-neck mid-phrase to change the tone live. | Agrega un hammer-on o un deslizamiento hacia la nota, o mueve tu mano de pulsar de puente a mástil a mitad de la frase para cambiar el tono en vivo. |

**Station C — Improvise a call-and-response phrase**

| English | Spanish |
|---|---|
| text: Challenge 2 — Call & Response (your assessment piece): over the Am backing track (▶ 🎵 Am jam track), play a 2-bar idea (call), pause 1 bar, then answer with a 2-bar idea (response). You've got it when: the call ends on a non-root note (unresolved) and the response lands on the root (arrives home). This — call-and-response — is one of the two phrasing strategies you'll name at your Set 3 assessment. | Reto 2 — Llamada y respuesta (tu pieza de evaluación): sobre la pista de acompañamiento de Am (▶ 🎵 pista de jam en Am), toca una idea de 2 compases (llamada), pausa 1 compás, y luego responde con una idea de 2 compases (respuesta). Lo tienes cuando: la llamada termina en una nota que no es la raíz (sin resolver) y la respuesta aterriza en la raíz (llega a la nota base). Esto — llamada y respuesta — es una de las dos estrategias de fraseo que vas a nombrar en tu evaluación de la Unidad 3. |
| hint: Think of it like a musical question and answer. The call feels unresolved; the response feels like it arrives somewhere. | Piénsalo como una pregunta y respuesta musical. La llamada se siente sin resolver; la respuesta se siente como si llegara a algún lugar. |
| stuck: Use just 2–3 notes for both call and response — end the response on A (the root) every time so the "answer" always lands home. | Usa solo 2–3 notas tanto para la llamada como para la respuesta — termina la respuesta en A (la raíz) cada vez para que la "respuesta" siempre llegue a la nota base. |
| levelUp: Record a 2-bar call and answer it live over the playback, or make the call longer than the response so the answer feels like a punchline. (Someone around? Trade: you call, they answer.) | Graba una llamada de 2 compases y respóndela en vivo sobre la grabación, o haz que la llamada sea más larga que la respuesta para que la respuesta se sienta como un remate. (¿Tienes a alguien cerca? Intercambien: tú llamas, ellos responden.) |

**Station C — Name the notes on the D & G strings**

| English | Spanish |
|---|---|
| text: Challenge 3 — D String Map: play the natural notes on the D string — D · E · F · G · A · B · C (frets 0–10) — slowly, saying each name aloud. You've got it when: a clean lap up and back, without looking at the chart. Click "Play all" to hear it at 60 BPM. | Reto 3 — Mapa de la cuerda Re: toca las notas naturales de la cuerda Re — D · E · F · G · A · B · C (trastes 0–10) — despacio, diciendo cada nombre en voz alta. Lo tienes cuando: una vuelta limpia subiendo y bajando, sin mirar el diagrama. Presiona "Tocar todo" para escucharlo a 60 BPM. |
| hint: Same musical alphabet pattern you know from E and A strings. Find the pattern — it repeats! Set the ⏱ Timer for 2 minutes and see how many laps you get without looking at the chart. | Es el mismo patrón de alfabeto musical que conoces de las cuerdas Mi y La. Encuentra el patrón — ¡se repite! Pon el ⏱ Temporizador en 2 minutos y ve cuántas vueltas logras sin mirar el diagrama. |
| stuck: Cover the chart and name just the first five notes (frets 0, 2, 3, 5, 7 — D, E, F, G, A) — find E–F and B–C, the two one-fret jumps, and the rest falls into place. | Cubre el diagrama y nombra solo las primeras cinco notas (trastes 0, 2, 3, 5, 7 — D, E, F, G, A) — encuentra E–F y B–C, los dos saltos de un traste, y el resto encaja solo. |
| levelUp: Point to a random fret 0–10 without counting up and name the note in under 3 seconds, or run the string top-to-bottom (C back down to D). | Señala un traste al azar entre 0–10 sin contar desde el inicio y nombra la nota en menos de 3 segundos, o recorre la cuerda de arriba hacia abajo (de C de vuelta a D). |
| playSeq label: Play all | Tocar todo |
| response prompt: Personal record: play it cleanly at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN lap naming + playing the D string, without looking at the chart (BPM)? | Récord personal: tócalo limpio a 60 BPM, y luego sube el metrónomo de 10 en 10. ¿Tu vuelta LIMPIA más rápida nombrando y tocando la cuerda Re, sin mirar el diagrama (BPM)? |
| response placeholder: e.g. 80 — try for a higher number next session | p. ej. 80 — intenta superarlo la próxima sesión |
| text: Challenge 4 — G String Map: same on the G string — G · A · B · C · D · E · F (frets 0–10), slowly, names aloud. You've got it when: a clean lap up and back, without looking at the chart. | Reto 4 — Mapa de la cuerda Sol: lo mismo en la cuerda Sol — G · A · B · C · D · E · F (trastes 0–10), despacio, nombres en voz alta. Lo tienes cuando: una vuelta limpia subiendo y bajando, sin mirar el diagrama. |
| hint: Notice the same pattern of whole and half steps — the musical alphabet behaves the same way on every string. | Fíjate en el mismo patrón de tonos y semitonos — el alfabeto musical se comporta igual en cada cuerda. |
| stuck: Find the two half steps first — B–C (frets 4–5) and E–F (frets 9–10) — then fill in the whole-step gaps between them. | Encuentra primero los dos semitonos — B–C (trastes 4–5) y E–F (trastes 9–10) — y luego llena los tonos completos entre ellos. |
| levelUp: Jump between strings: play D on the D string, then D on the G string, and name both — or quiz yourself on random frets against the clock. | Salta entre cuerdas: toca D en la cuerda Re, y luego D en la cuerda Sol, y nombra ambas — o ponte a prueba con trastes al azar contra el reloj. |
| playSeq label: Play all | Tocar todo |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Sweet Child O' Mine, solo-section feel: the famous outro solo lives in E minor pentatonic. Improvise four bars in the open position, then move the same shape up to the 12th fret and play four more — same pattern, one octave up, instant "solo voice." You've got it when: both registers (register = how high or low the notes are), phrases with space, landing on E in each. 🧵 Song Journey: this is Layer 4 of 5. | Reto — Sweet Child O' Mine, sensación de sección de solo: el famoso solo del outro vive en E menor pentatónica. Improvisa cuatro compases en posición abierta, y luego mueve la misma forma hasta el traste 12 y toca cuatro más — mismo patrón, una octava más arriba, sonido de "solo" instantáneo. Lo tienes cuando: ambos registros (registro = qué tan agudas o graves son las notas), frases con espacio, aterrizando en E en cada uno. 🧵 Recorrido de la canción: esto es la Capa 4 de 5. |
| hint: High on the neck IS the solo sound. Nothing about your ideas has to change — the register does the drama for you. | Arriba en el mástil ES el sonido de solo. Nada de tus ideas tiene que cambiar — el registro hace el drama por ti. |
| stuck: Stay open-position and just VISIT the 12th fret for your last note of each phrase. | Quédate en posición abierta y solo VISITA el traste 12 para la última nota de cada frase. |
| levelUp: Slide between the two positions mid-phrase, or hold your longest note an extra bar and let it ring out. | Desliza entre las dos posiciones a mitad de frase, o sostén tu nota más larga un compás extra y déjala sonar. |
| tab caption: Same shape, two homes — E at fret 0 and fret 12 | Misma forma, dos hogares — E en el traste 0 y el traste 12 |
| response prompt: Open position vs. 12th fret — which felt more like "your" sound? | Posición abierta vs. traste 12 — ¿cuál se sintió más como "tu" sonido? |
| response placeholder: e.g. 12th fret — felt like a real solo | p. ej. traste 12 — se sintió como un solo de verdad |
| text: Challenge — Solo over "the cure": Olivia's song is soft — so your solo has to be too. Improvise eight bars in Am pentatonic Pattern 1 at a whisper: light pick, slow phrases, lots of space. You've got it when: eight bars where the quietest note is as clean as your loudest. | Reto — Solo sobre "the cure": la canción de Olivia es suave — así que tu solo también tiene que serlo. Improvisa ocho compases en el Patrón pentatónico 1 de Am en un susurro: púa ligera, frases lentas, mucho espacio. Lo tienes cuando: ocho compases donde la nota más suave está tan limpia como la más fuerte. |
| hint: Playing quietly is a skill, not a limitation. Every buzz and mistake hides at loud volume and shows at soft — this is an honesty check. | Tocar suave es una destreza, no una limitación. Cada zumbido y error se esconde a volumen fuerte y se nota a volumen suave — esto es una prueba de honestidad. |
| stuck: Rule of 3 at half speed: three notes, whisper volume, one phrase per two bars. | Regla de 3 a media velocidad: tres notas, volumen susurrado, una frase cada dos compases. |
| levelUp: Build one long crescendo across all eight bars — start at a whisper, end singing, never harsh. | Construye un solo crescendo largo a lo largo de los ocho compases — empieza en un susurro, termina cantando, nunca áspero. |
| response prompt: Rate your quiet control 1–3, and name one note that buzzed when soft. | Califica tu control del volumen suave del 1 al 3, y nombra una nota que zumbó cuando tocaste suave. |
| response placeholder: e.g. 2 — the G on the D string buzzes | p. ej. 2 — el G en la cuerda Re zumba |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Which is more solid right now — your expressive phrasing (call-and-response, dynamics) or your note names on D and G? Write the weaker one below — that's your warm-up target next time. | ¿Qué está más sólido ahora mismo — tu fraseo expresivo (llamada y respuesta, dinámica) o tus nombres de nota en Re y Sol? Escribe el más débil abajo — ese es tu objetivo de calentamiento la próxima vez. |
| response placeholder: e.g. phrasing is coming along; G string note names still need counting | p. ej. el fraseo va mejorando; los nombres de nota de la cuerda Sol todavía necesitan que cuente |

**Station C — ⚡ Ear Spark — optional ear bonus**

| English | Spanish |
|---|---|
| text: ⚡ Ear Spark (optional, 2 min): draw three fret slips (0–5), record those notes on the low E, and turn the slips face-down. On playback, sing each note back, hold it, then find it on the string — singing first is the whole trick. Check the slips last. Got someone around? Have them play the notes instead. | ⚡ Chispa auditiva (opcional, 2 min): saca tres papelitos de trastes (0–5), graba esas notas en la Mi grave, y voltea los papelitos boca abajo. Al escuchar la grabación, canta cada nota de vuelta, sostenla, y luego encuéntrala en la cuerda — cantar primero es todo el truco. Revisa los papelitos al final. ¿Tienes a alguien cerca? Que toque las notas en tu lugar. |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| m4w2-s1 text: Vary dynamics consciously: play the same note at p, mf, and f (the letters musicians use for volume: p = piano, quiet · mf = mezzo-forte, medium · f = forte, loud) | Variar la dinámica de forma consciente: tocar la misma nota en p, mf y f (las letras que usan los músicos para el volumen: p = piano, suave · mf = mezzo-forte, medio · f = forte, fuerte) |
| m4w2-s1 gotItWhen: you play the same note three times in a row and can clearly hear on a recording that you got louder each time. | tocas la misma nota tres veces seguidas y puedes escuchar claramente en una grabación que subiste el volumen cada vez. |
| m4w2-s1 practice prompt: Which order goes from QUIETEST to LOUDEST? | ¿Qué orden va de MÁS SUAVE a MÁS FUERTE? |
| m4w2-s1 practice choices: p, mf, f / f, mf, p / mf, p, f / mf, f, p | p, mf, f / f, mf, p / mf, p, f / mf, f, p |
| m4w2-s2 text: Change timbre by moving picking hand between bridge and neck | Cambiar el timbre moviendo la mano de pulsar entre el puente y el mástil |
| m4w2-s2 gotItWhen: the difference between your "bright" (near the bridge) and "warm" (near the neck) tones is obvious on a recording without you announcing which is which. | la diferencia entre tu tono "brillante" (cerca del puente) y "cálido" (cerca del mástil) es obvia en una grabación sin que anuncies cuál es cuál. |
| m4w2-s3 text: Perform a hammer-on and a pull-off | Ejecutar un hammer-on y un pull-off |
| m4w2-s3 gotItWhen: you can produce the second note with no pick stroke — and it rings as clearly as a picked note. | puedes producir la segunda nota sin ningún golpe de púa — y suena tan claro como una nota pulsada. |
| m4w2-s3 practice prompt: On a pull-off, your finger starts on the higher fret. How do you make the SECOND note sound? | En un pull-off, tu dedo empieza en el traste más alto. ¿Cómo haces sonar la SEGUNDA nota? |
| m4w2-s3 practice choices: Pluck it with your picking hand / Snap your finger off the string sideways / Hammer down on a lower fret / Bend the string up | Pulsándola con tu mano de pulsar / Deslizando tu dedo fuera de la cuerda hacia el costado / Martillando sobre un traste más bajo / Doblando la cuerda hacia arriba |
| m4w2-s4 text: Use "envelope": vary attack (attack = how hard and suddenly a note starts) and note length intentionally | Usar la "envolvente": variar el ataque (ataque = qué tan fuerte y repentino empieza una nota) y la duración de la nota de forma intencionada |
| m4w2-s4 gotItWhen: you can play a short, sharp note and a long, sustained note on demand, and the difference is obvious on playback. | puedes tocar una nota corta y aguda y una nota larga y sostenida a pedido, y la diferencia es obvia al escuchar la grabación. |
| m4w2-s5 text: Play a one-note solo that uses dynamics and rhythm for expression | Tocar un solo de una sola nota que use dinámica y ritmo para la expresión |
| m4w2-s5 gotItWhen: you can play one note for 8 bars and a recording still holds your attention on listen-back — because you change something each time. | puedes tocar una nota durante 8 compases y una grabación todavía mantiene tu atención al escucharla — porque cambias algo cada vez. |
| m4w2-s6 text: Improvise a call-and-response phrase (call ends off root; response lands on root) | Improvisar una frase de llamada y respuesta (la llamada termina fuera de la raíz; la respuesta aterriza en la raíz) |
| m4w2-s6 gotItWhen: on playback you can hear the question (call) and the answer (response) — the call feels unresolved, the response feels like it arrives. | al escuchar la grabación puedes oír la pregunta (llamada) y la respuesta — la llamada se siente sin resolver, la respuesta se siente como si llegara. |
| m4w2-s6 practice prompt: In a call-and-response phrase, where should the RESPONSE end? | En una frase de llamada y respuesta, ¿dónde debe terminar la RESPUESTA? |
| m4w2-s6 practice choices: On any random note / On the root / On a non-root note / On the highest note in the scale | En cualquier nota al azar / En la raíz / En una nota que no es la raíz / En la nota más aguda de la escala |
| m4w2-s7 text: Name all natural notes on the D string (frets 0–10) and G string (frets 0–10) | Nombrar todas las notas naturales de la cuerda Re (trastes 0–10) y la cuerda Sol (trastes 0–10) |
| m4w2-s7 gotItWhen: you can point to any fret 0–10 on D or G and name the note instantly without counting up from the open string. | puedes señalar cualquier traste 0–10 en Re o Sol y nombrar la nota al instante sin contar desde la cuerda al aire. |
| m4w2-s7 practice prompt: On the G string, what note is at fret 5? | En la cuerda Sol, ¿qué nota está en el traste 5? |
| m4w2-s7 practice choices: B / C / D / A | B / C / D / A |

### Set 3

| English | Spanish |
|---|---|
| unit: Module 4 · Major / Minor / Blues Pentatonic Scales | Módulo 4 · Escalas pentatónicas mayor, menor y de blues |
| subtitle: Scale theory · Blues scale · Compose an original solo | Teoría de escalas · Escala de blues · Compón un solo original |
| skillFocus: How pentatonic and blues scales are built · Transposing to new keys · Composing and performing your own solo | Cómo se construyen las escalas pentatónica y de blues · Transponer a nuevas tonalidades · Componer y tocar tu propio solo |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Hear the blues note | Escucha la nota de blues |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — theory in action & original solo | Estación de práctica — teoría en acción y solo original |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Understand relative major & minor scales | Comprende las escalas relativas mayor y menor |
| Section title: Compose a 4-bar solo | Compón un solo de 4 compases |
| Section title: Read a lick cold | Lee un lick a primera vista |
| Section title: Perform your original solo | Toca tu solo original |
| Section title: Station Wrap-Up | Cierre de la estación |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Re-watch the same video from Set 1 — Major Pentatonic Scale – Marty Music (the link skips the intro) — this time listening for the major/minor connection. Then prove it on your own neck: play Pattern 1 and call the low E root "home" for major, then treat a different note as "home" and hear the same shape turn minor. Your hand stays parked in one place — only which note you call "home" changes. | Vuelve a mirar el mismo video de la Unidad 1 — Major Pentatonic Scale – Marty Music (el enlace se salta la intro) — esta vez escuchando la conexión mayor/menor. Luego compruébalo en tu propio mástil: toca el Patrón 1 y llama "nota base" a la raíz de la Mi grave para mayor, y luego trata una nota distinta como "nota base" y escucha cómo la misma forma se vuelve menor. Tu mano se queda quieta en un lugar — solo cambia qué nota llamas "nota base." |
| hint: Same five notes, two names: whichever note you treat as "home" (the root) decides whether it sounds major or minor. Watch for that connection, then prove it on your own neck. | Las mismas cinco notas, dos nombres: la nota que trates como "nota base" (la raíz) decide si suena mayor o menor. Fíjate en esa conexión, y luego compruébala en tu propio mástil. |
| response placeholder: Explain the relative major/minor connection in your own words. | Explica con tus propias palabras la conexión entre relativa mayor y menor. |
| text: Watch: Vibrato Technique (Hand Movement, TE-103) – JustinGuitar (0:00–3:00). As you watch, try it yourself on the 5th fret of string 1 — rock the finger back and forth gently and listen for the pitch to wobble. | Mira: Vibrato Technique (Hand Movement, TE-103) – JustinGuitar (0:00–3:00). Mientras miras, pruébalo tú mismo en el traste 5 de la cuerda 1 — mece el dedo hacia adelante y atrás suavemente y escucha cómo la nota oscila. |
| hint: Vibrato is a small, controlled pitch wobble on a sustained note. Try it on the 5th fret, string 1. Rock your finger back and forth gently. It takes weeks to develop — just start! | El vibrato es una pequeña oscilación controlada de la altura de una nota sostenida. Pruébalo en el traste 5, cuerda 1. Mece tu dedo hacia adelante y atrás suavemente. Toma semanas desarrollarlo — ¡solo empieza! |
| response prompt: Vibrato is best described as: | El vibrato se describe mejor como: |
| response explain: Vibrato is a small, controlled, repeating pitch wobble on a held note — it adds life and sustain. A one-time push up to a new pitch is a bend, not vibrato. | El vibrato es una pequeña oscilación controlada y repetida de la altura en una nota sostenida — le agrega vida y sostenimiento. Un empujón único hacia una nueva altura es un bend, no vibrato. |
| response choices: A small, controlled pitch wobble on a sustained note / Playing two notes at the same time / Bending the string up a whole step / Sliding between two frets quickly | Una pequeña oscilación controlada de la altura en una nota sostenida / Tocar dos notas al mismo tiempo / Doblar la cuerda hacia arriba un tono completo / Deslizarse rápido entre dos trastes |

**Station B — Hear the blues note**

| English | Spanish |
|---|---|
| text: Theory check: the blues scale adds one note to the minor pentatonic — the ♭5 (flat 5). In A minor, that's the note Eb. Click "Hear the A blues scale" below and listen for the extra note that wasn't in the plain minor pentatonic — that's the blue note. | Revisión de teoría: la escala de blues agrega una nota a la pentatónica menor — la ♭5 (quinta bemol). En A menor, esa nota es Eb. Presiona "Escucha la escala de blues de A" abajo y escucha la nota extra que no estaba en la pentatónica menor simple — esa es la nota de blues. |
| hint: In Pattern 1 for A minor, the ♭5 sits between the 4 and 5 on the A string — fret 6, right between the 4 at fret 5 and the 5 at fret 7. It's a "passing tone" — it creates tension that wants to resolve. | En el Patrón 1 de A menor, la ♭5 se ubica entre el 4 y el 5 en la cuerda La — traste 6, justo entre el 4 en el traste 5 y el 5 en el traste 7. Es una "nota de paso" — crea tensión que quiere resolverse. |
| playSeq label: Hear the A blues scale (listen for the blue note) | Escucha la escala de blues de A (escucha la nota de blues) |
| response prompt: What is the "blue note" added to the minor pentatonic to make a blues scale? | ¿Cuál es la "nota de blues" que se agrega a la pentatónica menor para hacer una escala de blues? |
| response explain: The blues scale = minor pentatonic + the ♭5 (flat 5) passing tone. In A minor that's Eb — the note that gives blues its tension. | La escala de blues = pentatónica menor + la nota de paso ♭5 (quinta bemol). En A menor esa es Eb — la nota que le da al blues su tensión. |
| response choices: The ♭5 (flat 5) / The major 3rd / The ♭7 (flat 7) / The 2nd | La ♭5 (quinta bemol) / La 3ª mayor / La ♭7 (séptima bemol) / La 2ª |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: you can now explain how the pentatonic is built, add the blues note, and use vibrato. Which piece of theory finally made sense today, and which still feels fuzzy? | Cierre de la estación — pausa y piensa: ahora puedes explicar cómo se construye la pentatónica, agregar la nota de blues, y usar vibrato. ¿Qué parte de la teoría finalmente tuvo sentido hoy, y cuál todavía se siente confusa? |
| response placeholder: e.g. relative major/minor made sense; the ♭5 blue note still feels random to me | p. ej. la relativa mayor/menor tuvo sentido; la nota de blues ♭5 todavía se siente aleatoria para mí |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Tuning (Module 1) is a skill you keep forever. Today you compose and perform — a clean, in-tune guitar is what makes a simple solo sound finished. | Afinar (Módulo 1) es una destreza que conservas para siempre. Hoy compones y tocas — una guitarra limpia y afinada es lo que hace que un solo simple suene terminado. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Understand relative major & minor scales**

| English | Spanish |
|---|---|
| text: Challenge 1 — Relative Scales: type out C major pentatonic (1 C, 2 D, 3 E, 5 G, 6 A), then A minor pentatonic (1 A, ♭3 C, 4 D, 5 E, ♭7 G) into the box below. You've got it when: you spot that they share the same five notes — only which note is "home" changes. | Reto 1 — Escalas relativas: escribe C mayor pentatónica (1 C, 2 D, 3 E, 5 G, 6 A), y luego A menor pentatónica (1 A, ♭3 C, 4 D, 5 E, ♭7 G) en el cuadro de abajo. Lo tienes cuando: notas que comparten las mismas cinco notas — solo cambia cuál nota es "nota base." |
| hint: C major pentatonic and A minor pentatonic share exactly the same five notes. Your hand position is the same — only which note you treat as "home" (the root) changes. | C mayor pentatónica y A menor pentatónica comparten exactamente las mismas cinco notas. La posición de tu mano es la misma — solo cambia qué nota tratas como "nota base" (la raíz). |
| stuck: List the five notes once (A C D E G). Now circle A in your head and call it minor; circle C and call it major. Same notes, different home. | Anota las cinco notas una vez (A C D E G). Ahora encierra A en tu mente y llámala menor; encierra C y llámala mayor. Mismas notas, nota base distinta. |
| levelUp: Find another relative pair from memory — G major and its relative minor (E minor) — and prove they share five notes. | Encuentra otro par relativo de memoria — G mayor y su relativa menor (E menor) — y comprueba que comparten cinco notas. |
| response placeholder: C major pent: C D E G A · A minor pent: A C D E G — what do you notice? | C mayor pent: C D E G A · A menor pent: A C D E G — ¿qué notas? |

**Station C — Compose a 4-bar solo**

| English | Spanish |
|---|---|
| text: Challenge 2 — Compose It: write a 4-bar solo as scale-degree numbers (e.g. 1 3 5 3 | 6 5 3 1 | …), then play exactly what you wrote, varying the rhythms. You've got it when: a deliberate 4-bar line you can play back the same way twice. Type your 4 bars into the box below so you have them next session. | Reto 2 — Compónlo: escribe un solo de 4 compases como números de grado de escala (p. ej. 1 3 5 3 | 6 5 3 1 | …), y luego toca exactamente lo que escribiste, variando los ritmos. Lo tienes cuando: una línea deliberada de 4 compases que puedes volver a tocar de la misma manera dos veces. Escribe tus 4 compases en el cuadro de abajo para tenerlos la próxima sesión. |
| hint: Write first, then play! It's okay if it sounds simple. The goal is to make a deliberate musical decision, not to improvise randomly. | ¡Escribe primero, y luego toca! Está bien si suena simple. El objetivo es tomar una decisión musical deliberada, no improvisar al azar. |
| stuck: Start with just bar 1 — pick 4 scale degrees you like, play them, and only move on once that bar sounds good. Repeat it for bar 3 if you're stuck for ideas. | Empieza solo con el compás 1 — elige 4 grados de escala que te gusten, tócalos, y avanza solo cuando ese compás suene bien. Repítelo para el compás 3 si te faltan ideas. |
| levelUp: Make bar 4 answer bar 2 (end on the root, 1), or add a hammer-on or the ♭5 blue note as a passing tone somewhere. | Haz que el compás 4 responda al compás 2 (termina en la raíz, 1), o agrega un hammer-on o la nota de blues ♭5 como nota de paso en algún lugar. |
| response prompt: Write your 4-bar solo as scale-degree numbers (use | between bars): | Escribe tu solo de 4 compases como números de grado de escala (usa | entre compases): |
| response placeholder: e.g. 1 3 5 3 | 6 5 3 1 | 5 4 ♭3 1 | 1 — — — | p. ej. 1 3 5 3 | 6 5 3 1 | 5 4 ♭3 1 | 1 — — — |

**Station C — Read a lick cold**

| English | Spanish |
|---|---|
| text: Challenge — Cold Read (Knowledge & Reading): here's a 1-bar lick (a lick = a short solo phrase) in the A minor pentatonic box you haven't drilled. DECODE it from the TAB first — name each string and fret, left to right — then play it. You've got it when: you can read a short 1-bar pentatonic lick straight from TAB and play it accurately, without anyone demonstrating it first. At the module self-assessment you'll read a NEW 1-bar lick cold — this is Task 2. | Reto — Lectura a primera vista (Conocimiento y lectura): aquí tienes un lick de 1 compás (un lick = una frase corta de solo) en la caja de A menor pentatónica que no has ejercitado. DECODIFÍCALO del TAB primero — nombra cada cuerda y traste, de izquierda a derecha — y luego tócalo. Lo tienes cuando: puedes leer un lick pentatónico corto de 1 compás directamente del TAB y tocarlo con precisión, sin que nadie te lo demuestre primero. En la autoevaluación del módulo vas a leer un lick de 1 compás NUEVO a primera vista — esta es la Tarea 2. |
| hint: Read before you press Play. Bottom TAB line = low E, top line = high e; the number is the fret. Say it out loud — "G string, fret 5, that's C" — as you go, then hit Play all to check yourself. | Lee antes de presionar Tocar. La línea inferior del TAB = Mi grave, la línea superior = mi aguda; el número es el traste. Dilo en voz alta — "cuerda Sol, traste 5, eso es C" — mientras avanzas, y luego presiona Tocar todo para comprobarte. |
| stuck: Take it two notes at a time. Find the first note on the neck and play it, then the next — speed comes after the map is clear. | Tómalo de a dos notas. Encuentra la primera nota en el mástil y tócala, y luego la siguiente — la velocidad llega después de que el mapa esté claro. |
| levelUp: Read it backwards (right to left), or move the same shape to the E minor box (open-string root) and read it there. | Léelo al revés (de derecha a izquierda), o mueve la misma forma a la caja de E menor (raíz en cuerda al aire) y léelo ahí. |
| tab caption: Cold-read lick · A minor pentatonic box · one bar | Lick a primera vista · caja de A menor pentatónica · un compás |

**Station C — Perform your original solo**

| English | Spanish |
|---|---|
| text: Challenge 3 — Perform It (your assessment piece — try it!): play your 4-bar solo over a core-song backing track — start with ▶ 🎵 the Am jam track, or pick any core song's ▶ 🎵 Backing track in the 🎵 Songs list at the bottom of this module — working in at least one hammer-on, pull-off, or vibrato. Record your take, say your phrasing strategy (call-and-response or four-phrase) out loud on the recording, and listen back. You've got it when: you hold the backing track's pulse start to finish with no restarts, and you can name your phrasing strategy. Play musical ideas — don't just run up and down the scale. | Reto 3 — Tócalo (tu pieza de evaluación — ¡pruébala!): toca tu solo de 4 compases sobre la pista de acompañamiento de una canción principal — empieza con ▶ 🎵 la pista de jam en Am, o elige la ▶ 🎵 Pista de acompañamiento de cualquier canción principal en la lista de 🎵 Canciones al final de este módulo — incorporando al menos un hammer-on, pull-off, o vibrato. Graba tu toma, di en voz alta tu estrategia de fraseo (llamada y respuesta o cuatro frases) en la grabación, y escúchala después. Lo tienes cuando: sostienes el pulso de la pista de principio a fin sin reiniciar, y puedes nombrar tu estrategia de fraseo. Toca ideas musicales — no solo subas y bajes la escala. |
| hint: Include at least one technique (hammer-on, pull-off, or vibrato) in your solo. Don't just run up and down the scale — play musical ideas! Playing for the camera counts as performing, and the playback shows you exactly where to tighten up. | Incluye al menos una técnica (hammer-on, pull-off, o vibrato) en tu solo. ¡No solo subas y bajes la escala — toca ideas musicales! Tocar para la cámara cuenta como tocar en vivo, y la grabación te muestra exactamente dónde ajustar. |
| stuck: Drop the backing track and play your written 4 bars alone, slowly, until they're solid — then add the track back and just one technique. | Quita la pista de acompañamiento y toca tus 4 compases escritos solo, despacio, hasta que estén sólidos — y luego vuelve a agregar la pista y solo una técnica. |
| levelUp: Perform it standing, record a performance take, or play it for someone at home — or transpose your solo to E minor and play it from the open-string box. | Tócalo de pie, graba una toma de presentación, o tócalo para alguien en casa — o transpón tu solo a E menor y tócalo desde la caja con raíz en cuerda al aire. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: You composed and performed an original solo — what are you proudest of, and what would make the next one better? Write it below; this is the kind of reflection your end-of-module recorded performance builds on. | Compusiste y tocaste un solo original — ¿de qué estás más orgulloso, y qué haría mejor el siguiente? Escríbelo abajo; este es el tipo de reflexión sobre el que se construye tu presentación grabada de fin de módulo. |
| response placeholder: e.g. proud it resolved on the root; next time I'll leave more space between phrases | p. ej. orgulloso de que resolvió en la raíz; la próxima vez voy a dejar más espacio entre frases |

**Set 3 — Skills**

| English | Spanish |
|---|---|
| m4w3-s1 text: Explain what a major pentatonic scale is (degrees 1 2 3 5 6) | Explicar qué es una escala pentatónica mayor (grados 1 2 3 5 6) |
| m4w3-s1 gotItWhen: you can list the scale degrees from memory and name the 5 notes in any major key you pick. | puedes enumerar los grados de la escala de memoria y nombrar las 5 notas en cualquier tonalidad mayor que elijas. |
| m4w3-s1 practice prompt: Which scale degrees make up a MAJOR pentatonic scale? | ¿Qué grados de escala forman una escala pentatónica MAYOR? |
| m4w3-s1 practice choices: 1 2 3 4 5 / 1 2 3 5 6 / 1 ♭3 4 5 ♭7 / 1 3 5 7 9 | 1 2 3 4 5 / 1 2 3 5 6 / 1 ♭3 4 5 ♭7 / 1 3 5 7 9 |
| m4w3-s2 text: Explain what a minor pentatonic scale is (degrees 1 ♭3 4 5 ♭7) | Explicar qué es una escala pentatónica menor (grados 1 ♭3 4 5 ♭7) |
| m4w3-s2 gotItWhen: you can list the minor pentatonic degrees from memory and explain why two of them are flatted compared to the major scale. | puedes enumerar los grados de la pentatónica menor de memoria y explicar por qué dos de ellos están bemolizados en comparación con la escala mayor. |
| m4w3-s2 practice prompt: Which scale degrees make up a MINOR pentatonic scale? | ¿Qué grados de escala forman una escala pentatónica MENOR? |
| m4w3-s2 practice choices: 1 2 3 5 6 / 1 ♭3 4 5 ♭7 / 1 ♭3 4 ♭5 ♭7 / 1 ♭2 ♭3 5 ♭7 | 1 2 3 5 6 / 1 ♭3 4 5 ♭7 / 1 ♭3 4 ♭5 ♭7 / 1 ♭2 ♭3 5 ♭7 |
| m4w3-s3 text: Add vibrato on at least one sustained note | Agregar vibrato en al menos una nota sostenida |
| m4w3-s3 gotItWhen: your finger rocks back and forth on a sustained note and the pitch wobbles intentionally — not from shaking nerves. | tu dedo se mece hacia adelante y atrás en una nota sostenida y la altura oscila intencionalmente — no por nervios que hacen temblar la mano. |
| m4w3-s4 text: Identify and play the ♭5 blues note within Pattern 1 | Identificar y tocar la nota de blues ♭5 dentro del Patrón 1 |
| m4w3-s4 gotItWhen: you can find the ♭5 anywhere in Pattern 1 and use it as a passing tone — not a landing point. | puedes encontrar la ♭5 en cualquier parte del Patrón 1 y usarla como nota de paso — no como punto de aterrizaje. |
| m4w3-s4 practice prompt: In A minor pentatonic, what is the ♭5 "blues note"? | En A menor pentatónica, ¿cuál es la "nota de blues" ♭5? |
| m4w3-s4 practice choices: D♭ / D / E♭ / E | D♭ / D / E♭ / E |
| m4w3-s5 text: Explain how C major pentatonic and A minor pentatonic are relative scales | Explicar cómo C mayor pentatónica y A menor pentatónica son escalas relativas |
| m4w3-s5 gotItWhen: you can explain that they share the same 5 notes — only the root changes — and prove it on the fretboard. | puedes explicar que comparten las mismas 5 notas — solo cambia la raíz — y comprobarlo en el diapasón. |
| m4w3-s5 practice prompt: C major pentatonic and A minor pentatonic contain the exact same 5 notes. What's different between them? | C mayor pentatónica y A menor pentatónica contienen exactamente las mismas 5 notas. ¿Qué es diferente entre ellas? |
| m4w3-s5 practice choices: Which note feels like "home" (the root) / They use different hand shapes / A minor has 6 notes, C major has 5 / They're played on different strings | Qué nota se siente como "nota base" (la raíz) / Usan formas de mano diferentes / A menor tiene 6 notas, C mayor tiene 5 / Se tocan en cuerdas diferentes |
| m4w3-s6 text: Compose and write out a 4-bar original solo using scale degrees | Componer y escribir un solo original de 4 compases usando grados de escala |
| m4w3-s6 gotItWhen: you have 4 bars written down in scale-degree numbers and you can play exactly what you wrote — not improvise something different. | tienes 4 compases escritos en números de grado de escala y puedes tocar exactamente lo que escribiste — no improvisar algo distinto. |
| m4w3-s7 text: Perform the original solo over a course song backing track from memory, holding the track's pulse | Tocar el solo original sobre la pista de acompañamiento de una canción del curso de memoria, sosteniendo el pulso de la pista |
| m4w3-s7 gotItWhen: you can play your 4-bar solo all the way through with the backing track — holding its pulse with no restarts — and name your phrasing strategy (call-and-response or four-phrase). | puedes tocar tu solo de 4 compases de principio a fin con la pista de acompañamiento — sosteniendo su pulso sin reiniciar — y nombrar tu estrategia de fraseo (llamada y respuesta o cuatro frases). |
| m4w3-s8 text: Sight-read a short 1-bar pentatonic lick from TAB and play it | Leer a primera vista un lick pentatónico corto de 1 compás del TAB y tocarlo |
| m4w3-s8 gotItWhen: you can decode a 1-bar pentatonic lick straight from the TAB — one you haven't drilled — and play it accurately without anyone demonstrating it first. | puedes decodificar un lick pentatónico de 1 compás directamente del TAB — uno que no has ejercitado — y tocarlo con precisión sin que nadie te lo demuestre primero. |

### Module-level Songs

MODULE_SONGS[4] meta fields (song title shown for reference, not itself translated on the site).

| English | Spanish |
|---|---|
| "All Along the Watchtower" — meta: Full solo using Am pentatonic across 4 strings | Solo completo usando Am pentatónica en 4 cuerdas |
| "the cure" — meta: Full solo · A minor pentatonic | Solo completo · A menor pentatónica |
| "Sweet Child O' Mine" — meta: Full solo over D–C–G · G major / E minor pentatonic | Solo completo sobre D–C–G · G mayor / E menor pentatónica |
| "Seven Nation Army" — meta: E minor pentatonic solo | Solo en E menor pentatónica |
| "Luna" — meta: Full solo using Dm pentatonic (root D, low E fret 10) | Solo completo usando Dm pentatónica (raíz D, Mi grave traste 10) |
| "Happy Birthday" — meta: Full melodic reharmonization using pentatonic (optional) | Rearmonización melódica completa usando pentatónica (opcional) |
| "12-bar blues in E" — meta: E minor pentatonic — classic improv context | E menor pentatónica — contexto clásico de improvisación |
| "La Bamba" — meta: C major pentatonic — bright and fun | C mayor pentatónica — brillante y divertida |
| "Back in Black" — meta: Simplified solo intro — A minor pentatonic | Intro de solo simplificada — A menor pentatónica |
| "Boom Boom" — meta: E blues pentatonic — call and response phrasing | E blues pentatónica — fraseo de llamada y respuesta |
| "Purple Haze" — meta: E pentatonic box — full pattern | Caja de E pentatónica — patrón completo |

### Module Review

| English | Spanish |
|---|---|
| module: Major / Minor / Blues Pentatonic Scales | Escalas pentatónicas mayor, menor y de blues |
| skill mr4-s1: I can play Pentatonic Pattern 1 ascending AND descending from memory — no diagram, no missed notes or hesitations | Puedo tocar el Patrón pentatónico 1 subiendo Y bajando de memoria — sin diagrama, sin notas falladas ni dudas |
| skill mr4-s2: I can use alternate picking (down-up) automatically at 60 BPM, every note on a beat, without losing the click | Puedo usar púa alterna (abajo-arriba) automáticamente a 60 BPM, cada nota en un tiempo, sin perder el clic |
| skill mr4-s3: I can position Pattern 1 as a MINOR scale (1st finger on root) or a MAJOR scale (4th finger on root) on demand from any named key | Puedo posicionar el Patrón 1 como escala MENOR (dedo índice en la raíz) o escala MAYOR (dedo meñique en la raíz) a pedido desde cualquier tonalidad nombrada |
| skill mr4-s6: I can perform a hammer-on and a pull-off, and add an intentional vibrato on a sustained note | Puedo ejecutar un hammer-on y un pull-off, y agregar un vibrato intencional en una nota sostenida |
| skill mr4-s8: I can explain how major (1 2 3 5 6) and minor (1 ♭3 4 5 ♭7) pentatonic are built, that they're relative (same 5 notes), and where the ♭5 blue note goes | Puedo explicar cómo se construyen la pentatónica mayor (1 2 3 5 6) y menor (1 ♭3 4 5 ♭7), que son relativas (mismas 5 notas), y dónde va la nota de blues ♭5 |
| skill mr4-s10: I can perform my original 4-bar solo over a backing track from memory — holding its pulse with no restarts, working in at least one hammer-on, pull-off, or vibrato, and naming my phrasing strategy | Puedo tocar mi solo original de 4 compases sobre una pista de acompañamiento de memoria — sosteniendo su pulso sin reiniciar, incorporando al menos un hammer-on, pull-off, o vibrato, y nombrando mi estrategia de fraseo |
| skill mr4-s11: I can read a short 1-bar pentatonic lick from TAB that I haven't practiced and play it accurately | Puedo leer un lick pentatónico corto de 1 compás del TAB que no he practicado y tocarlo con precisión |
| assessItem: Position Pattern 1 for any named major or minor key and play it ascending and descending in time, with alternate picking | Posiciona el Patrón 1 para cualquier tonalidad mayor o menor nombrada y tócalo subiendo y bajando a tiempo, con púa alterna |
| assessItem: Perform an original 4-bar solo over a course-song backing track, holding its pulse with no restarts, using the minor pentatonic box and at least one hammer-on, pull-off, or vibrato, with clean notes throughout (no buzz or dead notes — high strings included), following a named phrasing strategy (call-and-response or four-phrase) | Toca un solo original de 4 compases sobre la pista de acompañamiento de una canción del curso, sosteniendo su pulso sin reiniciar, usando la caja de pentatónica menor y al menos un hammer-on, pull-off, o vibrato, con notas limpias en todo momento (sin zumbido ni notas apagadas — cuerdas agudas incluidas), siguiendo una estrategia de fraseo nombrada (llamada y respuesta o cuatro frases) |
| assessItem: Read a short 1-bar pentatonic lick from TAB and play it accurately | Lee un lick pentatónico corto de 1 compás del TAB y tócalo con precisión |
| forward: Those single pentatonic notes you've been soloing with don't disappear in Module 5 — you stack them. The open chords you'll build there (Am, C, G, D…) are made of these same notes. And the clean fretting and finger independence you sharpened here are exactly what makes a chord ring without buzzing. You'll go from playing one note at a time to playing five at once. | Esas notas pentatónicas individuales con las que has estado improvisando no desaparecen en el Módulo 5 — las apilas. Los acordes abiertos que vas a construir ahí (Am, C, G, D…) están hechos de estas mismas notas. Y el trasteo limpio y la independencia de dedos que perfeccionaste aquí son exactamente lo que hace que un acorde suene sin zumbido. Vas a pasar de tocar una nota a la vez a tocar cinco a la vez. |

## Module 5 — Open Chords

### Set 1

| English | Spanish |
|---|---|
| unit: Module 5 · Open Chords | Módulo 5 · Acordes al aire |
| subtitle: Reading chord diagrams · Am and Em · First strumming | Leer diagramas de acordes · Am y Em · Primer rasgueo |
| skillFocus: Reading chord diagrams · Fretting the Am and Em chords · Playing a simple down-strum | Leer diagramas de acordes · Trastear los acordes Am y Em · Tocar un rasgueo simple hacia abajo |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — chord shapes & first strums | Estación de práctica — formas de acordes y primeros rasgueos |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Fret Am cleanly | Trastea Am limpio |
| Section title: Fret Em cleanly | Trastea Em limpio |
| Section title: Switch Am ↔ Em on beat 1 | Cambia Am ↔ Em en el tiempo 1 |
| Section title: One-Minute Changes — try for a higher number | Cambios de un minuto — intenta superar tu número |
| Section title: My Practice Routine — weekly check-in (never graded) | Mi rutina de práctica — check-in semanal (nunca se califica) |
| Section title: Station Wrap-Up | Cierre de la estación |
| Section title: Mystery Chart — name the shape with no label | Diagrama misterioso — nombra la forma sin etiqueta |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: How to Read TAB & Chord Boxes – JustinGuitar (0:00–4:00). | Mira: How to Read TAB & Chord Boxes – JustinGuitar (0:00–4:00). |
| hint: Pause when he shows a diagram and look at it yourself. What does the X mean? What does the O mean? What do the numbers in the dots tell you? | Pausa cuando muestra un diagrama y míralo tú mismo. ¿Qué significa la X? ¿Qué significa la O? ¿Qué te dicen los números dentro de los puntos? |
| response prompt: On a chord diagram, an X above a string means: | En un diagrama de acorde, una X sobre una cuerda significa: |
| response explain: An X means don't play that string at all — skip it or mute it so it stays silent. An O (not X) means play it open. | Una X significa que no toques esa cuerda para nada — sáltatela o silénciala para que quede en silencio. Una O (no X) significa tocarla al aire. |
| response choices: Do not play that string / Play that string with your thumb / Play it muted (palm-mute — rest the side of your strumming hand on the strings) / It is optional | No toques esa cuerda / Toca esa cuerda con tu pulgar / Tócala silenciada (silenciado con la palma — apoya el borde de tu mano de rasgueo sobre las cuerdas) / Es opcional |
| text: Watch: Your Very First Chords: Em & Asus2 – Marty Music (0:00–5:00). | Mira: Your Very First Chords: Em & Asus2 – Marty Music (0:00–5:00). |
| hint: Try placing your fingers as he shows Em, then strum it before watching more. Does every string ring? If not, check which finger is accidentally muting a string. Keep your fretting hand relaxed — a tense hand makes the notes sound bad. | Prueba colocar tus dedos como él muestra para Em, y luego rasguéalo antes de seguir viendo. ¿Suenan todas las cuerdas? Si no, revisa qué dedo está silenciando una cuerda por accidente. Mantén tu mano de trastear relajada — una mano tensa hace que las notas suenen mal. |
| response placeholder: When you strummed Em, did every string ring clean? If not, which one was muted and why? | Cuando rasgueaste Em, ¿sonaron limpias todas las cuerdas? Si no, ¿cuál estaba silenciada y por qué? |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: of everything on a chord diagram (X, O, dots, finger numbers), which part still feels least automatic when you sit down to read one? | Cierre de la estación — pausa y piensa: de todo lo que hay en un diagrama de acorde (X, O, puntos, números de dedo), ¿qué parte todavía se siente menos automática cuando te sientas a leer uno? |
| response placeholder: e.g. I still pause on which number means which finger | p. ej. todavía me detengo en pensar qué número es qué dedo |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Tuning (Module 1) is a skill you keep forever. Clean open strings are exactly what makes a chord ring. | Afinar (Módulo 1) es una destreza que conservas para siempre. Las cuerdas al aire limpias son exactamente lo que hace que un acorde suene bien. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Fret Am cleanly**

| English | Spanish |
|---|---|
| text: Challenge 1 — Clean Am: fret Am (index finger on string 2, fret 1 · middle finger on string 4, fret 2 · ring finger on string 3, fret 2) and strum strings 1–5 (not the low E). You've got it when: every string rings cleanly — check each one by plucking it. | Reto 1 — Am limpio: trastea Am (dedo índice en la cuerda 2, traste 1 · dedo medio en la cuerda 4, traste 2 · dedo anular en la cuerda 3, traste 2) y rasguea las cuerdas 1–5 (no la Mi grave). Lo tienes cuando: cada cuerda suena limpia — revisa cada una pulsándola. |
| hint: Press just behind the frets, not on them. Curve your fingers so they don't accidentally touch neighboring strings, and keep your hand relaxed — a tense hand makes the notes sound bad. Check each string individually by plucking it. | Presiona justo detrás de los trastes, no sobre ellos. Curva tus dedos para que no toquen por accidente las cuerdas vecinas, y mantén tu mano relajada — una mano tensa hace que las notas suenen mal. Revisa cada cuerda individualmente pulsándola. |
| stuck: Get strings 2 and 3 ringing first (index + ring), then add the middle finger. Most buzz comes from a finger lying too flat — sit up on the very tip. | Haz sonar primero las cuerdas 2 y 3 (índice + anular), y luego agrega el dedo medio. La mayoría del zumbido viene de un dedo demasiado plano — apóyate justo en la punta. |
| levelUp: Lift all three fingers, then drop the whole shape at once and strum — aim for a clean chord on the first try. | Levanta los tres dedos, y luego suelta toda la forma de una vez y rasguea — apunta a un acorde limpio en el primer intento. |

**Station C — Fret Em cleanly**

| English | Spanish |
|---|---|
| text: Challenge 2 — Clean Em: fret Em (middle finger on string 5, fret 2 · ring finger on string 4, fret 2) and strum all 6 strings. You've got it when: a full, open, buzz-free Em — this is your warm-up chord. | Reto 2 — Em limpio: trastea Em (dedo medio en la cuerda 5, traste 2 · dedo anular en la cuerda 4, traste 2) y rasguea las 6 cuerdas. Lo tienes cuando: un Em completo, abierto, sin zumbido — este es tu acorde de calentamiento. |
| hint: Em is the easiest chord on guitar. Use it to warm up before harder chords. It should sound full and open. | Em es el acorde más fácil de la guitarra. Úsalo para calentar antes de acordes más difíciles. Debe sonar completo y abierto. |
| stuck: If a string buzzes, check that both fingers are arched up on their tips and not leaning on the open strings next door. | Si una cuerda zumba, revisa que ambos dedos estén arqueados sobre sus puntas y no apoyados en las cuerdas al aire de al lado. |
| levelUp: Switch Em→Am→Em without looking at your fingers — feel the shape instead of watching it. | Cambia Em→Am→Em sin mirar tus dedos — siente la forma en vez de mirarla. |

**Station C — Switch Am ↔ Em on beat 1**

| English | Spanish |
|---|---|
| text: Challenge 3 — Am ↔ Em Switch: at 60 BPM, 4 down-strums per bar, play 2 bars of Am then 2 bars of Em and repeat. You've got it when: change chords right on beat 1 every time — keep strumming through any fumble. | Reto 3 — Cambio Am ↔ Em: a 60 BPM, 4 rasgueos hacia abajo por compás, toca 2 compases de Am y luego 2 compases de Em, y repite. Lo tienes cuando: cambias de acorde justo en el tiempo 1 cada vez — sigue rasgueando aunque falles. |
| hint: Even if the chord isn't perfect, keep strumming in time. Stopping to fix a note is the #1 habit to avoid. Fix it between bars, not mid-bar. Set the ⏱ Timer for 2 minutes and loop the switch until it beeps. | Aunque el acorde no salga perfecto, sigue rasgueando a tiempo. Detenerte a corregir una nota es el hábito número uno que debes evitar. Corrígelo entre compases, no a mitad de uno. Pon el ⏱ Temporizador en 2 minutos y repite el cambio hasta que suene. |
| stuck: Your index finger barely moves between Am and Em — anchor it: keep that finger pressed down and still while the others move. Drop to 50 BPM if 60 feels rushed. | Tu dedo índice casi no se mueve entre Am y Em — ánclalo: mantenlo presionado y quieto mientras los otros se mueven. Baja a 50 BPM si 60 se siente apurado. |
| levelUp: Speed up to 70 BPM, or play a down-up strum on each bar instead of straight downs. | Acelera a 70 BPM, o toca un rasgueo abajo-arriba en cada compás en vez de solo rasgueos hacia abajo. |

**Station C — One-Minute Changes — try for a higher number**

| English | Spanish |
|---|---|
| text: Challenge 4 — One-Minute Changes (Am ↔ Em): set the ⏱ Timer for 60 seconds and switch Am→Em→Am→Em as many times as you can. Every CLEAN change counts; a buzzy or missed one doesn't. You've got it when: count your clean changes and type the number below — try for a higher number next time. (Over 20 is a good result for your first day on chords.) | Reto 4 — Cambios de un minuto (Am ↔ Em): pon el ⏱ Temporizador en 60 segundos y cambia Am→Em→Am→Em tantas veces como puedas. Cada cambio LIMPIO cuenta; uno con zumbido o fallado no. Lo tienes cuando: cuentas tus cambios limpios y escribes el número abajo — intenta superarlo la próxima vez. (Más de 20 es un buen resultado para tu primer día con acordes.) |
| hint: This is the classic chord-change speed test. Quality first: a clean change you can count is better than a blurry one you can't. | Esta es la prueba clásica de velocidad de cambio de acorde. Calidad primero: un cambio limpio que puedas contar es mejor que uno confuso que no puedas. |
| stuck: Keep your index finger planted (it barely moves between Am and Em) and move only the other fingers. Slow down until every change rings. | Mantén tu dedo índice plantado (casi no se mueve entre Am y Em) y mueve solo los otros dedos. Baja la velocidad hasta que cada cambio suene limpio. |
| levelUp: Add one strum on each chord before you switch, or swap in Am→C instead. | Agrega un rasgueo en cada acorde antes de cambiar, o cambia a Am→C en su lugar. |
| response prompt: Personal record — clean Am↔Em changes in 60 seconds. Your count today? | Récord personal — cambios limpios Am↔Em en 60 segundos. ¿Tu cuenta hoy? |
| response placeholder: e.g. 22 — try for a higher number next time | p. ej. 22 — intenta superarlo la próxima vez |

**Station C — My Practice Routine — weekly check-in (never graded)**

| English | Spanish |
|---|---|
| text: Plan your practice — this one's just for you, never graded. Take two minutes to update your routine: (1) one thing you want to get better at, (2) when and where you'll practice this week, (3) how last week's plan went. Same check-in you've kept since Module 1 — we keep it going through the whole course. | Planea tu práctica — esta parte es solo para ti, nunca se califica. Tómate dos minutos para actualizar tu rutina: (1) una cosa en la que quieres mejorar, (2) cuándo y dónde vas a practicar esta semana, (3) cómo te fue con el plan de la semana pasada. El mismo check-in que has mantenido desde el Módulo 1 — lo seguimos manteniendo durante todo el curso. |
| hint: No wrong answers — even five minutes a day is better than one long rushed session. You're building a habit you'll actually keep. | No hay respuestas incorrectas — hasta cinco minutos al día es mejor que una sola sesión larga y apurada. Estás construyendo un hábito que de verdad vas a mantener. |
| response placeholder: 1) One thing to improve   2) When & where I'll practice   3) How last week went | 1) Algo que quiero mejorar   2) Cuándo y dónde voy a practicar   3) Cómo me fue la semana pasada |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Which was harder today — getting each chord to ring clean, or switching between them in time? Type the one thing you'll drill (practice over and over) first next session. | ¿Qué fue más difícil hoy — lograr que cada acorde sonara limpio, o cambiar entre ellos a tiempo? Escribe la primera cosa que vas a ejercitar (practicar una y otra vez) la próxima sesión. |
| response placeholder: e.g. Am keeps buzzing on string 3 — I'll start there | p. ej. Am sigue zumbando en la cuerda 3 — empezaré por ahí |

**Station C — Mystery Chart — name the shape with no label**

| English | Spanish |
|---|---|
| text: Challenge — Mystery Chart: the two diagrams below have NO names. This is exactly the assessment task — naming chords on an unlabelled chart. Look at the FIRST (left) one only: which string is muted, which are open, and where do the fretted fingers sit? Read it, then answer which chord it is. | Reto — Diagrama misterioso: los dos diagramas de abajo NO tienen nombre. Esta es exactamente la tarea de evaluación — nombrar acordes en un diagrama sin etiquetar. Mira solo el PRIMERO (izquierda): ¿qué cuerda está silenciada, cuáles están al aire, y dónde se colocan los dedos trasteados? Léelo, y luego responde qué acorde es. |
| hint: Read it the way Set 1 taught: check string 6 first (X or open?), then find the fretted dots. The first shape mutes the low E (X on string 6), leaves string 5 open, and frets strings 4 & 3 at fret 2 with a finger on string 2, fret 1. The second shape plays all six strings, with just two fingers at fret 2 on strings 5 & 4. | Léelo como te enseñó la Unidad 1: revisa primero la cuerda 6 (¿X o al aire?), y luego busca los puntos trasteados. La primera forma silencia la Mi grave (X en la cuerda 6), deja la cuerda 5 al aire, y trastea las cuerdas 4 y 3 en el traste 2 con un dedo en la cuerda 2, traste 1. La segunda forma toca las seis cuerdas, con solo dos dedos en el traste 2 en las cuerdas 5 y 4. |
| stuck: Compare the two lowest strings. One diagram has an X on string 6 — don't play it; the other plays string 6 open. That single difference tells these two shapes apart. | Compara las dos cuerdas más graves. Un diagrama tiene una X en la cuerda 6 — no la toques; el otro toca la cuerda 6 al aire. Esa única diferencia distingue estas dos formas. |
| response prompt: The FIRST (left) unlabelled diagram is which chord? | El PRIMER diagrama (izquierda), sin etiquetar, ¿qué acorde es? |
| response explain: It's Am. The giveaways: string 6 is muted (X), string 5 is open (that open A is the root the chord is named after), and the fingers sit on strings 4 & 3 at fret 2 plus string 2 at fret 1. The second diagram is Em — it plays all six strings with its two fingers on strings 5 & 4. | Es Am. Las pistas: la cuerda 6 está silenciada (X), la cuerda 5 está al aire (esa A al aire es la raíz que le da nombre al acorde), y los dedos van en las cuerdas 4 y 3 en el traste 2 más la cuerda 2 en el traste 1. El segundo diagrama es Em — toca las seis cuerdas con sus dos dedos en las cuerdas 5 y 4. |
| response choices: Am / Em / C major / G major | Am / Em / C mayor / G mayor |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| m5w1-s1 text: Read a chord diagram: identify X (mute), O (open), dots (finger placement), and numbers (which finger) | Leer un diagrama de acorde: identificar X (silenciar), O (al aire), puntos (colocación de dedos), y números (qué dedo) |
| m5w1-s1 gotItWhen: you can open a chord diagram you've never seen and put your fingers on the right strings, frets, and finger numbers without looking anything up. | puedes abrir un diagrama de acorde que nunca has visto y colocar tus dedos en las cuerdas, trastes y números de dedo correctos sin buscar nada. |
| m5w1-s1 practice prompt: On a chord diagram, what does an "X" above a string mean? | En un diagrama de acorde, ¿qué significa una "X" sobre una cuerda? |
| m5w1-s1 practice choices: Play that string open / Mute it — don't play that string / That's where finger 1 goes / Play that string twice | Toca esa cuerda al aire / Silénciala — no toques esa cuerda / Ahí va el dedo 1 / Toca esa cuerda dos veces |
| m5w1-s2 text: Explain the difference between a chord chart, TAB, and standard notation | Explicar la diferencia entre un diagrama de acorde, TAB y la notación estándar |
| m5w1-s2 gotItWhen: you can look at all three and say which is which — and explain in one sentence what each one tells you. | puedes ver los tres y decir cuál es cuál — y explicar en una oración qué te dice cada uno. |
| m5w1-s2 practice prompt: Which one shows finger positions for a chord shape, but NOT a sequence of notes to play? | ¿Cuál muestra las posiciones de los dedos para la forma de un acorde, pero NO una secuencia de notas para tocar? |
| m5w1-s2 practice choices: A chord diagram / TAB / Standard notation / All three show note sequences | Un diagrama de acorde / TAB / Notación estándar / Los tres muestran secuencias de notas |
| m5w1-s3 text: Fret Am cleanly — every string rings with no buzzing | Trastear Am limpio — cada cuerda suena sin zumbido |
| m5w1-s3 gotItWhen: you pluck each of the 5 strings in Am individually and every one rings clear — no buzz, no muffled string. | pulsas cada una de las 5 cuerdas de Am individualmente y todas suenan claras — sin zumbido, sin cuerdas apagadas. |
| m5w1-s3 practice label: Hear Am chord (arpeggiated) | Escucha el acorde Am (arpegiado) |
| m5w1-s4 text: Fret Em cleanly — all 6 strings ring open and full | Trastear Em limpio — las 6 cuerdas suenan abiertas y completas |
| m5w1-s4 gotItWhen: you strum all 6 strings and the chord sounds full and open — no string is accidentally muted by a neighboring finger. | rasgueas las 6 cuerdas y el acorde suena completo y abierto — ninguna cuerda queda silenciada por accidente por un dedo vecino. |
| m5w1-s4 practice label: Hear Em chord (arpeggiated) | Escucha el acorde Em (arpegiado) |
| m5w1-s5 text: Strum 4 down-strums per bar in time at 60 BPM | Rasguear 4 golpes hacia abajo por compás a tiempo a 60 BPM |
| m5w1-s5 gotItWhen: your strums land on beats 1, 2, 3, 4 with the metronome at 60 BPM and you can keep it going for at least 8 bars without drifting. | tus rasgueos caen en los tiempos 1, 2, 3, 4 con el metrónomo a 60 BPM y puedes mantenerlo por al menos 8 compases sin desviarte. |
| m5w1-s6 text: Identify and fret any chord shown on a chord chart | Identificar y trastear cualquier acorde mostrado en un diagrama de acordes |
| m5w1-s6 gotItWhen: you can read any chord diagram in the songbook and play it without having to look up the chord name. | puedes leer cualquier diagrama de acorde del cancionero y tocarlo sin tener que buscar el nombre del acorde. |
| m5w1-s6 practice prompt: You see a "3" written inside one of the dots on a chord diagram. What does it tell you? | Ves un "3" escrito dentro de uno de los puntos de un diagrama de acorde. ¿Qué te indica? |
| m5w1-s6 practice choices: Play it on the 3rd fret / Use your 3rd finger (ring) / Hold the chord for 3 beats / It's a 3-finger chord | Tócalo en el traste 3 / Usa tu dedo 3 (anular) / Sostén el acorde por 3 tiempos / Es un acorde de 3 dedos |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 5 · Open Chords | Módulo 5 · Acordes al aire |
| subtitle: Chord Group 1: C, F, Am, G · Down-up strumming · Smooth transitions | Grupo de acordes 1: C, F, Am, G · Rasgueo abajo-arriba · Transiciones suaves |
| skillFocus: Fretting the C, F, and G chords · Switching chords smoothly · Playing down-up strum patterns | Trastear los acordes C, F y G · Cambiar de acorde suavemente · Tocar patrones de rasgueo abajo-arriba |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for the chord changes | Escucha los cambios de acorde |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — chord transitions & strumming | Estación de práctica — transiciones de acorde y rasgueo |
| Section title: Name the root note of each chord before you strum | Nombra la nota raíz de cada acorde antes de rasguear |
| Section title: Use a common-finger pivot (Am ↔ C) | Usa un dedo pivote común (Am ↔ C) |
| Section title: Play the C–G–Am–F loop in time | Toca la vuelta C–G–Am–F a tiempo |
| Section title: Play a down-up strum pattern | Toca un patrón de rasgueo abajo-arriba |
| Section title: One-Minute Changes — try for a higher number | Cambios de un minuto — intenta superar tu número |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Speed changes — every two beats, then every beat | Cambios más rápidos — cada dos tiempos, y luego cada tiempo |
| Section title: Station Wrap-Up | Cierre de la estación |
| Section title: ⚡ Ear Spark — optional ear bonus | ⚡ Chispa auditiva — bono opcional de oído |
| Section title: The folk strum (D–D–U–U–D–U) | El rasgueo folk (D–D–U–U–D–U) |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: The C Chord (BC-132) – JustinGuitar (0:00–4:00). | Mira: The C Chord (BC-132) – JustinGuitar (0:00–4:00). |
| hint: He shows the "perfect" chord change technique. Watch how he prepares the next chord shape before strumming it. Anticipation is the secret. | Él muestra la técnica del cambio de acorde "perfecto". Fíjate cómo prepara la siguiente forma de acorde antes de rasguearla. La anticipación es el secreto. |
| response prompt: What is the "secret" to clean chord changes, according to the video? | Según el video, ¿cuál es el "secreto" para cambios de acorde limpios? |
| response explain: Anticipate the next shape — start moving your fingers toward it before you finish strumming the current chord. Speed comes from preparation, not from rushing. | Anticipa la siguiente forma — empieza a mover tus dedos hacia ella antes de terminar de rasguear el acorde actual. La velocidad viene de la preparación, no de apurarte. |
| response choices: Prepare (anticipate) the next chord shape before you strum it / Strum harder so any missed notes are hidden / Use only your index finger / Memorize each chord with your eyes closed | Prepara (anticipa) la siguiente forma de acorde antes de rasguearla / Rasguea más fuerte para que se escondan las notas falladas / Usa solo tu dedo índice / Memoriza cada acorde con los ojos cerrados |
| text: Watch: Pain Free F Chord for Beginners – Lauren Bateman (0:00–4:00). | Mira: Pain Free F Chord for Beginners – Lauren Bateman (0:00–4:00). |
| hint: The F chord is the hardest thing for beginners. The simplified version (xx3211) avoids the full barre (pressing one finger flat across several strings). Use this until it's clean, then worry about the barre version. | El acorde F es lo más difícil para los principiantes. La versión simplificada (xx3211) evita la cejilla completa (presionar un dedo plano a lo largo de varias cuerdas). Usa esta hasta que salga limpia, y luego preocúpate por la versión con cejilla. |
| response placeholder: Which version of the F chord are you starting with (full barre or simplified)? Why? | ¿Con qué versión del acorde F estás empezando (cejilla completa o simplificada)? ¿Por qué? |

**Station B — Listen for the chord changes**

| English | Spanish |
|---|---|
| text: Listen to "Let It Be" by The Beatles. Can you hear the C–G–Am–F chord pattern in the verse? Count the bars — how many strums per chord? 🧵 Song Journey: this is Layer 5 of 5 — Open Chords. | Escucha "Let It Be" de The Beatles. ¿Puedes oír el patrón de acordes C–G–Am–F en la estrofa? Cuenta los compases — ¿cuántos rasgueos por acorde? 🧵 Recorrido de la canción: esto es la Capa 5 de 5 — Acordes al aire. |
| hint: You don't need to play along yet. Just listen and map out when the chords change. This trains your ear to recognize the I–V–vi–IV progression (a lowercase numeral like vi means that chord is minor). | Todavía no necesitas tocar junto con la canción. Solo escucha y ubica cuándo cambian los acordes. Esto entrena tu oído para reconocer la progresión I–V–vi–IV (un número romano en minúscula como vi significa que ese acorde es menor). |
| response placeholder: About how many strums (or beats) does each chord get before it changes? | ¿Aproximadamente cuántos rasgueos (o tiempos) dura cada acorde antes de cambiar? |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: which of these four chords (C, G, Am, F) is fighting you most right now, and is it the shape itself or getting to it in time? | Cierre de la estación — pausa y piensa: ¿cuál de estos cuatro acordes (C, G, Am, F) te está costando más ahora mismo, y es la forma en sí o el llegar a ella a tiempo? |
| response placeholder: e.g. F — the shape is fine but I'm slow getting into it | p. ej. F — la forma está bien pero soy lento para llegar a ella |

**Station C — Name the root note of each chord before you strum**

| English | Spanish |
|---|---|
| text: Challenge — Name the Root: before you strum each chord, find and say its ROOT — the note the chord is named after, on the lowest string you strum. C = C (A string, 3rd fret) · G = G (low E, 3rd fret) · Am = A (A string, open) · F = F (D string, 3rd fret). You've got it when: name all four roots correctly, then play the chord. | Reto — Nombra la raíz: antes de rasguear cada acorde, encuentra y di su RAÍZ — la nota que le da nombre al acorde, en la cuerda más grave que rasgueas. C = C (cuerda La, traste 3) · G = G (Mi grave, traste 3) · Am = A (cuerda La, al aire) · F = F (cuerda Re, traste 3). Lo tienes cuando: nombras correctamente las cuatro raíces, y luego tocas el acorde. |
| hint: Knowing where a chord's root lives on the neck is the same Module 2 note-name skill — and it is exactly what makes barre chords easy in Module 7. The root tells you the chord's name. | Saber dónde vive la raíz de un acorde en el mástil es la misma destreza de nombrar notas del Módulo 2 — y es exactamente lo que hace fáciles los acordes con cejilla en el Módulo 7. La raíz te dice el nombre del acorde. |
| stuck: Use the Module 2 note map — the root is the lowest string you actually strum. Find that one note first, then build the shape around it. | Usa el mapa de notas del Módulo 2 — la raíz es la cuerda más grave que realmente rasgueas. Encuentra esa nota primero, y luego arma la forma alrededor de ella. |
| levelUp: Name the roots of D, A, and Em too — you'll meet those chords next set. | Nombra también las raíces de D, A y Em — vas a conocer esos acordes en la próxima unidad. |

**Station C — Use a common-finger pivot (Am ↔ C)**

| English | Spanish |
|---|---|
| text: Challenge 1 — Pivot Finger: switch Am ↔ C keeping your index finger planted on string 2, fret 1, moving only the other fingers. You've got it when: clean changes both ways without ever lifting the pivot finger. | Reto 1 — Dedo pivote: cambia Am ↔ C manteniendo tu dedo índice plantado en la cuerda 2, traste 1, moviendo solo los otros dedos. Lo tienes cuando: cambios limpios en ambas direcciones sin levantar nunca el dedo pivote. |
| hint: Common-finger pivots cut your transition time in half. Look for other chords in this group that share a finger position. | Los pivotes de dedo común reducen tu tiempo de transición a la mitad. Busca otros acordes de este grupo que compartan una posición de dedo. |
| stuck: Rest your index lightly on string 2 / fret 1 and refuse to lift it — move only the middle and ring fingers. | Apoya tu índice suavemente en la cuerda 2 / traste 1 y niégate a levantarlo — mueve solo los dedos medio y anular. |
| levelUp: Find the shared finger between C and G and pivot on that too. | Encuentra el dedo compartido entre C y G y pivotea con ese también. |

**Station C — Play the C–G–Am–F loop in time**

| English | Spanish |
|---|---|
| text: Challenge 2 — C–G–Am–F Loop: at 60 BPM, play 2 bars each of C, G, Am, F and repeat. You've got it when: change on beat 1 every time — then speed up in steps — 60 → 65 → 70 — and hold 70 BPM clean (that's the assessment tempo). | Reto 2 — Vuelta C–G–Am–F: a 60 BPM, toca 2 compases de cada uno de C, G, Am, F y repite. Lo tienes cuando: cambias en el tiempo 1 cada vez — y luego acelera en pasos — 60 → 65 → 70 — y sostén 70 BPM limpio (ese es el tempo de la evaluación). |
| hint: If you miss a change, keep going. You can slow to 50 BPM if needed. Gradually increase by 5 BPM each time through, aiming for a clean 70. Set the ⏱ Timer for 3 minutes and see how clean the loop gets before it beeps. | Si te pierdes un cambio, sigue tocando. Puedes bajar a 50 BPM si lo necesitas. Sube gradualmente 5 BPM cada vez, apuntando a un 70 limpio. Pon el ⏱ Temporizador en 3 minutos y mira qué tan limpia sale la vuelta antes de que suene. |
| stuck: Loop just the two chords that give you trouble (often G→Am or Am→F) on their own before running the whole circle. | Repite solo los dos acordes que te cuestan (a menudo G→Am o Am→F) antes de correr todo el circuito. |
| levelUp: Push toward 75 BPM, or strum down-up on each bar instead of straight downs. | Empuja hacia 75 BPM, o rasguea abajo-arriba en cada compás en vez de solo hacia abajo. |

**Station C — Play a down-up strum pattern**

| English | Spanish |
|---|---|
| text: Challenge 3 — Down-Up Strum: play the loop strumming down on 1 2 3 4 and up on each "+", counting "1 + 2 + 3 + 4 +" aloud, building to 70 BPM. You've got it when: a steady, relaxed pendulum at 70 BPM with lighter upstrokes and no stumbles. | Reto 3 — Rasgueo abajo-arriba: toca la vuelta rasgueando hacia abajo en 1 2 3 4 y hacia arriba en cada "+", contando "1 + 2 + 3 + 4 +" en voz alta, subiendo hasta 70 BPM. Lo tienes cuando: un péndulo constante y relajado a 70 BPM con rasgueos hacia arriba más ligeros y sin tropiezos. |
| hint: Start slower than you think you need to, then climb to 70. The upstroke should be lighter than the downstroke. Your wrist should move like a relaxed pendulum. | Empieza más despacio de lo que crees que necesitas, y luego sube a 70. El rasgueo hacia arriba debe ser más ligero que el de abajo. Tu muñeca debe moverse como un péndulo relajado. |
| stuck: Keep your strumming hand moving down-up-down-up nonstop — just miss the strings on the beats you don't want. The motion never stops. | Mantén tu mano de rasgueo moviéndose abajo-arriba-abajo-arriba sin parar — solo falla las cuerdas en los tiempos que no quieres. El movimiento nunca se detiene. |
| levelUp: Drop the first upstroke (D · D U · U D U) for a more song-like feel. | Quita el primer rasgueo hacia arriba (D · D U · U D U) para una sensación más parecida a una canción. |

**Station C — One-Minute Changes — try for a higher number**

| English | Spanish |
|---|---|
| text: Challenge 4 — One-Minute Changes (C ↔ G): set the ⏱ Timer for 60 seconds and switch C→G→C→G as many times as you can — only CLEAN changes count. You've got it when: type your count below and aim for a higher count than your Set 1 number. | Reto 4 — Cambios de un minuto (C ↔ G): pon el ⏱ Temporizador en 60 segundos y cambia C→G→C→G tantas veces como puedas — solo cuentan los cambios LIMPIOS. Lo tienes cuando: escribes tu cuenta abajo y apuntas a superar el número de la Unidad 1. |
| hint: C and G share no easy anchor finger, so pre-shape the next chord in the air before you land it. Quality first — slow down until each one rings. | C y G no comparten un dedo ancla fácil, así que preforma el siguiente acorde en el aire antes de aterrizarlo. Calidad primero — baja la velocidad hasta que cada uno suene. |
| stuck: Break it down: park your hand over G, then practice just dropping into C and back. Speed comes after the path is clean. | Divídelo: deja tu mano posicionada sobre G, y luego practica solo caer en C y volver. La velocidad llega después de que el camino esté limpio. |
| levelUp: Run Am↔F instead — the hardest pair in this group. | Prueba Am↔F en su lugar — el par más difícil de este grupo. |
| response prompt: Personal record — clean C↔G changes in 60 seconds. Your count today? | Récord personal — cambios limpios C↔G en 60 segundos. ¿Tu cuenta hoy? |
| response placeholder: e.g. 18 — try for a higher number next time | p. ej. 18 — intenta superarlo la próxima vez |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Let It Be, verse (assessment rehearsal): play C · G · Am · F with a down-strum, four beats per chord, building from 60 to 70 BPM. This C–G–Am–F verse is the song you play from memory for the module assessment — record a run and check it against the chart. You've got it when: one full verse loop at 70 BPM, every change landing on beat 1. 🧵 Song Journey: this is Layer 5 of 5 — Open Chords. | Reto — Let It Be, estrofa (ensayo de evaluación): toca C · G · Am · F con un rasgueo hacia abajo, cuatro tiempos por acorde, subiendo de 60 a 70 BPM. Esta estrofa C–G–Am–F es la canción que tocas de memoria para la evaluación del módulo — graba una toma y compárala con el diagrama. Lo tienes cuando: una vuelta completa de la estrofa a 70 BPM, cada cambio cayendo en el tiempo 1. 🧵 Recorrido de la canción: esto es la Capa 5 de 5 — Acordes al aire. |
| hint: Look ahead — start forming the next chord on beat 4 of the current one. Keep your fingers arched and your thumb behind the neck so every string rings. The strum keeps moving even while fingers travel. | Mira hacia adelante — empieza a formar el siguiente acorde en el tiempo 4 del actual. Mantén tus dedos arqueados y tu pulgar detrás del mástil para que cada cuerda suene. El rasgueo sigue moviéndose aunque los dedos viajen. |
| stuck: Isolate the roughest pair (probably C → F) and loop just those two, four beats each. | Aísla el par más difícil (probablemente C → F) y repite solo esos dos, cuatro tiempos cada uno. |
| levelUp: Add the chorus turnaround (a short chord move that leads back to the start) — Am · G · F · C — or drop to two beats per chord at the same 60 BPM. | Agrega el giro del coro (un movimiento corto de acordes que regresa al inicio) — Am · G · F · C — o baja a dos tiempos por acorde al mismo 60 BPM. |
| response prompt: Which chord change still fights you in Let It Be? | ¿Qué cambio de acorde todavía te cuesta en Let It Be? |
| response placeholder: e.g. C to F — fingers arrive late | p. ej. de C a F — los dedos llegan tarde |
| text: Challenge — Watchtower, open-chord version: the same loop you've played as bass notes and power chords, now as full open chords — Am · G · F · G — two beats per chord at 60 BPM. You've got it when: four loops, and you can hear that it's the SAME song you played in Modules 2 and 3. 🧵 Song Journey: this is Layer 5 of 5. | Reto — Watchtower, versión con acordes al aire: la misma vuelta que ya tocaste como notas de bajo y como acordes de potencia, ahora como acordes al aire completos — Am · G · F · G — dos tiempos por acorde a 60 BPM. Lo tienes cuando: cuatro vueltas, y puedes escuchar que es la MISMA canción que tocaste en los Módulos 2 y 3. 🧵 Recorrido de la canción: esto es la Capa 5 de 5. |
| hint: This is the third time this song has met you — bass line, power chords, now open chords. Notice the roots are identical every time. | Esta es la tercera vez que esta canción se cruza contigo — línea de bajo, acordes de potencia, ahora acordes al aire. Nota que las raíces son idénticas cada vez. |
| stuck: Strum only beat 1 of each chord and use beats 2–4 to travel to the next shape. | Rasguea solo el tiempo 1 de cada acorde y usa los tiempos 2–4 para viajar a la siguiente forma. |
| levelUp: One beat per chord, or alternate: one loop open chords, one loop power chords, without stopping. | Un tiempo por acorde, o alterna: una vuelta con acordes al aire, una vuelta con acordes de potencia, sin detenerte. |
| response prompt: Bass line, power chords, or open chords — which Watchtower is your favorite so far? | Línea de bajo, acordes de potencia, o acordes al aire — ¿cuál Watchtower es tu favorito hasta ahora? |
| response placeholder: e.g. open chords — it finally sounds full | p. ej. acordes al aire — por fin suena completo |
| text: Challenge — "the cure" play-along: loop Olivia's chords with a down-strum — Am · C · Dm · F, four beats each, then G to turn it around — speeding up in steps: 60 → 65 → 70 BPM. Open chords, no capo. Shapes are pre-loaded below. You've got it when: two clean loops at 70 BPM, every change on beat 1, every string ringing clear. | Reto — "the cure" tocando junto: repite los acordes de Olivia con un rasgueo hacia abajo — Am · C · Dm · F, cuatro tiempos cada uno, y luego G para dar la vuelta — acelerando en pasos: 60 → 65 → 70 BPM. Acordes al aire, sin capo. Las formas están precargadas abajo. Lo tienes cuando: dos vueltas limpias a 70 BPM, cada cambio en el tiempo 1, cada cuerda sonando clara. |
| hint: Dm is the new one: a small triangle on the top three strings. Keep your fingers arched and your thumb behind the neck. | Dm es el nuevo: un pequeño triángulo en las tres cuerdas agudas. Mantén tus dedos arqueados y tu pulgar detrás del mástil. |
| stuck: Get Am · C · Dm · F clean in open position first, then add the G turnaround. | Deja Am · C · Dm · F limpios en posición abierta primero, y luego agrega el giro de G. |
| levelUp: Add the G/B bass turnaround — G/B is a G chord with a B note in the bass (play the G shape, but catch the B on the A string) — or switch to a down-up strum. | Agrega el giro de bajo G/B — G/B es un acorde de G con una nota B en el bajo (toca la forma de G, pero captura la B en la cuerda La) — o cambia a un rasgueo abajo-arriba. |
| response prompt: Your cleanest tempo on the "the cure" loop today (BPM)? | ¿Tu tempo más limpio hoy en la vuelta de "the cure" (BPM)? |
| response placeholder: e.g. 65 — 70 next session | p. ej. 65 — 70 la próxima sesión |

**Station C — Speed changes — every two beats, then every beat**

| English | Spanish |
|---|---|
| text: Challenge — Half-Bar Changes (2 chords): so far you've changed once a bar. Real songs move faster. Switch Am ↔ C every TWO beats — two down-strums on Am, two on C, and repeat, at 60 BPM. That's twice as many changes as the loop you just played. You've got it when: four laps where every switch lands right on beat 1 and 3, no stops. Press ▶ to hear the target. | Reto — Cambios de medio compás (2 acordes): hasta ahora has cambiado una vez por compás. Las canciones reales se mueven más rápido. Cambia Am ↔ C cada DOS tiempos — dos rasgueos hacia abajo en Am, dos en C, y repite, a 60 BPM. Eso es el doble de cambios que la vuelta que acabas de tocar. Lo tienes cuando: cuatro vueltas donde cada cambio cae justo en el tiempo 1 y 3, sin detenerte. Presiona ▶ para escuchar el objetivo. |
| hint: Am and C share an anchor: your 1st finger stays on the B string (fret 1) and your 2nd finger stays on the D string (fret 2). Only your 3rd finger jumps (to the A string for C). Pivot on the two fingers that don't move. | Am y C comparten un ancla: tu dedo 1 se queda en la cuerda B (traste 1) y tu dedo 2 se queda en la cuerda Re (traste 2). Solo tu dedo 3 salta (a la cuerda La para C). Pivotea con los dos dedos que no se mueven. |
| stuck: Drop to 50 BPM. Start moving your 3rd finger on the "and" after beat 2, so C is ready before you strum it. | Baja a 50 BPM. Empieza a mover tu dedo 3 en el "y" después del tiempo 2, para que C esté listo antes de rasguearlo. |
| levelUp: Climb to 70 BPM, or try Am ↔ F (the hardest pair) at the same half-bar speed. | Sube a 70 BPM, o prueba Am ↔ F (el par más difícil) a la misma velocidad de medio compás. |
| playSeq label: Hear it — Am·Am · C·C (change every 2 beats) | Escúchalo — Am·Am · C·C (cambio cada 2 tiempos) |
| text: Challenge — Three-Chord Half-Bar (3 chords): now three shapes, still two beats each — G · C · Am, then back to G, looping at 60 BPM. Three chords this fast is chorus speed for a lot of songs. You've got it when: two clean laps, every change on the beat. | Reto — Medio compás con tres acordes (3 acordes): ahora tres formas, todavía dos tiempos cada una — G · C · Am, y de vuelta a G, repitiendo a 60 BPM. Tres acordes a esta velocidad es la velocidad de coro para muchas canciones. Lo tienes cuando: dos vueltas limpias, cada cambio a tiempo. |
| hint: G → C keeps your 2nd finger near the same spot; C → Am keeps the 1st finger planted on the B string. Look for the finger that can stay put in each move. | G → C mantiene tu dedo 2 cerca del mismo lugar; C → Am mantiene el dedo 1 plantado en la cuerda B. Busca el dedo que puede quedarse quieto en cada movimiento. |
| stuck: Loop just the change that trips you (usually G → C, where every finger travels) on its own before running all three. | Repite solo el cambio que te hace tropezar (usualmente G → C, donde cada dedo viaja) antes de correr los tres. |
| levelUp: Speed up to 70 BPM, or reorder as C · G · Am and keep every change on the beat. | Acelera a 70 BPM, o reordénalo como C · G · Am y mantén cada cambio a tiempo. |
| playSeq label: Hear it — G·G · C·C · Am·Am (every 2 beats) | Escúchalo — G·G · C·C · Am·Am (cada 2 tiempos) |
| text: Challenge — Four-Chord Half-Bar (Let It Be, fast): the whole C · G · Am · F loop from your song, but two beats each at 60 BPM instead of a full bar. Same chords, twice the changes — the verse now moves at a real, brisk pace. You've got it when: two clean laps, every change landing on the beat. | Reto — Medio compás con cuatro acordes (Let It Be, rápido): toda la vuelta C · G · Am · F de tu canción, pero dos tiempos cada uno a 60 BPM en vez de un compás completo. Los mismos acordes, el doble de cambios — la estrofa ahora se mueve a un ritmo real y ágil. Lo tienes cuando: dos vueltas limpias, cada cambio cayendo a tiempo. |
| hint: You already know this loop slow. The only new demand is your hands resetting faster — pre-shape each chord in the air while the last one is still ringing. | Ya conoces esta vuelta despacio. La única exigencia nueva es que tus manos se reajusten más rápido — preforma cada acorde en el aire mientras el anterior sigue sonando. |
| stuck: Isolate the pair that lags (often G → Am or Am → F) and loop just those two at half-bar speed before running the circle. | Aísla el par que se atrasa (a menudo G → Am o Am → F) y repite solo esos dos a velocidad de medio compás antes de correr el circuito. |
| levelUp: Push to 70 BPM, or move on to the every-beat version below. | Empuja a 70 BPM, o pasa a la versión de cada tiempo de abajo. |
| playSeq label: Hear it — C·G·Am·F (every 2 beats) | Escúchalo — C·G·Am·F (cada 2 tiempos) |
| text: Challenge — One Chord Per Beat (Let It Be, fastest): the top of the ladder — a new chord on every single beat. Play C · G · Am · F, one down-strum per beat at 60 BPM, looping. This is the real test of clean, fast switching: the next shape has to be ready before you get to it. You've got it when: four laps clean at 60 — then, if you can, climb to 65. | Reto — Un acorde por tiempo (Let It Be, lo más rápido): el escalón más alto — un acorde nuevo en cada tiempo. Toca C · G · Am · F, un rasgueo hacia abajo por tiempo a 60 BPM, repitiendo. Esta es la prueba real de cambio limpio y rápido: la siguiente forma tiene que estar lista antes de llegar a ella. Lo tienes cuando: cuatro vueltas limpias a 60 — y luego, si puedes, sube a 65. |
| hint: At this speed you can't watch your hands. Trust the shapes and keep the strum steady — a change that's slightly buzzy but in time beats a clean one that's late. | A esta velocidad no puedes mirar tus manos. Confía en las formas y mantén el rasgueo constante — un cambio con un poco de zumbido pero a tiempo es mejor que uno limpio pero tarde. |
| stuck: Cut it in half: loop just C · G, one per beat, until it's smooth, then add Am and F back one at a time. | Divide a la mitad: repite solo C · G, uno por tiempo, hasta que sea fluido, y luego agrega de vuelta Am y F de uno en uno. |
| levelUp: Hold it clean at 70 BPM, or try G · D · Em · C one per beat once you've met D and Em elsewhere. | Mantenlo limpio a 70 BPM, o prueba G · D · Em · C uno por tiempo una vez que hayas conocido D y Em en otra parte. |
| playSeq label: Hear it — C·G·Am·F (one chord per beat) | Escúchalo — C·G·Am·F (un acorde por tiempo) |
| response prompt: Your fastest CLEAN one-chord-per-beat C–G–Am–F today (BPM)? | ¿Tu C–G–Am–F a un-acorde-por-tiempo LIMPIO más rápido hoy (BPM)? |
| response placeholder: e.g. 60 — 65 next session | p. ej. 60 — 65 la próxima sesión |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Of C, G, Am, and F, which transition cost you the most clean changes in the minute drill? Name the two chords — that's your first loop next session. | De C, G, Am y F, ¿qué transición te costó más cambios limpios en el ejercicio de un minuto? Nombra los dos acordes — esa es tu primera vuelta la próxima sesión. |
| response placeholder: e.g. Am→F — the F never lands in time | p. ej. Am→F — el F nunca llega a tiempo |

**Station C — ⚡ Ear Spark — optional ear bonus**

| English | Spanish |
|---|---|
| text: ⚡ Ear Spark (optional, 2 min): record yourself strumming C or Am, playing them a few times in a mixed-up order. On playback, say whether each one sounds bright or sad before checking — that's major vs minor, and you can already hear it. Got someone around? Have them strum behind your back and you name it live. | ⚡ Chispa auditiva (opcional, 2 min): grábate rasgueando C o Am, tocándolos varias veces en un orden mezclado. Al escuchar la grabación, di si cada uno suena alegre o triste antes de comprobarlo — eso es mayor vs. menor, y ya puedes oírlo. ¿Tienes a alguien cerca? Que rasguee detrás de ti y tú lo nombres en vivo. |

**Station C — The folk strum (D–D–U–U–D–U)**

| English | Spanish |
|---|---|
| text: Challenge — The Folk Strum: this is the classic singalong strum the down-up strum skill is really testing. Over one bar, strum down, down-up, up-down-up — written D · D U · U D U. Count it out loud "1, 2-and, (3)-and, 4-and" — beat 3 in parentheses is the down you skip: you strum on 1, on 2 and its "and," then catch just the "and" of 3, then 4 and its "and." That skipped beat-3 down is the whole secret of the groove (the steady rhythmic feel). Start on one chord (G is a great one). You've got it when: it loops smoothly 4 times in a row on one chord without stopping. | Reto — El rasgueo folk: este es el clásico rasgueo para cantar en grupo que la destreza de rasgueo abajo-arriba realmente está probando. En un compás, rasguea abajo, abajo-arriba, arriba-abajo-arriba — escrito D · D U · U D U. Cuéntalo en voz alta "1, 2-y, (3)-y, 4-y" — el tiempo 3 entre paréntesis es el "abajo" que te saltas: rasgueas en 1, en 2 y su "y", y luego solo capturas el "y" del 3, y luego el 4 y su "y". Ese "abajo" saltado del tiempo 3 es todo el secreto del groove (la sensación rítmica constante). Empieza con un solo acorde (G es excelente). Lo tienes cuando: se repite suavemente 4 veces seguidas en un solo acorde sin detenerte. |
| hint: Say the full count "1 2 and 3 and 4 and" while your hand swings nonstop. The six strums land on 1, 2, &(2), &(3), 4, &(4) — and beat 3's downstrum is the one you leave out. Upstrokes stay lighter than downstrokes. | Di la cuenta completa "1 2 y 3 y 4 y" mientras tu mano se balancea sin parar. Los seis rasgueos caen en 1, 2, y(2), y(3), 4, y(4) — y el rasgueo hacia abajo del tiempo 3 es el que te saltas. Los rasgueos hacia arriba se mantienen más ligeros que los de abajo. |
| stuck: Keep your strumming hand moving down-up-down-up the entire bar — never stop the swing. On the beats you don't want (that missed beat-3 down), just let the hand pass and MISS the strings. The motion is constant; only the contact changes. | Mantén tu mano de rasgueo moviéndose abajo-arriba-abajo-arriba todo el compás — nunca detengas el balanceo. En los tiempos que no quieres (ese "abajo" saltado del tiempo 3), deja que la mano pase y FALLE las cuerdas. El movimiento es constante; solo cambia el contacto. |
| levelUp: Now take it to a chord change: play the folk strum for one full bar on G, then one full bar on C, and loop G → C → G → C keeping the strum unbroken right through the switch. | Ahora llévalo a un cambio de acorde: toca el rasgueo folk por un compás completo en G, luego un compás completo en C, y repite G → C → G → C manteniendo el rasgueo sin interrupción a través del cambio. |
| playSeq label: Hear G then C — the change to loop | Escucha G y luego C — el cambio para repetir |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| m5w2-s1 text: Fret C major with clean tone on the B string | Trastear C mayor con tono limpio en la cuerda B |
| m5w2-s1 gotItWhen: you strum C and the B string (fret 1) rings clearly — your index finger doesn't mute the high E or buzz against the fret. | rasgueas C y la cuerda B (traste 1) suena clara — tu dedo índice no silencia la mi aguda ni zumba contra el traste. |
| m5w2-s1 practice label: Hear C major (arpeggiated) | Escucha C mayor (arpegiado) |
| m5w2-s2 text: Fret F major (simplified xx3211) with no buzzing | Trastear F mayor (simplificado xx3211) sin zumbido |
| m5w2-s2 gotItWhen: all four notes in the simplified F ring cleanly when you strum strings 4–1 — and your index finger doesn't collapse on the barre. | las cuatro notas del F simplificado suenan limpias cuando rasgueas las cuerdas 4–1 — y tu dedo índice no se colapsa en la cejilla. |
| m5w2-s2 practice prompt: For the simplified F chord (xx3211), which strings should you actually strum? | Para el acorde F simplificado (xx3211), ¿qué cuerdas deberías rasguear en realidad? |
| m5w2-s2 practice choices: All 6 strings / Strings 1–4 only (the top 4) / Strings 5–1 / Strings 6 and 5 only | Las 6 cuerdas / Solo las cuerdas 1–4 (las 4 agudas) / Las cuerdas 5–1 / Solo las cuerdas 6 y 5 |
| m5w2-s3 text: Fret G major (3 or 4 finger version) cleanly | Trastear G mayor (versión de 3 o 4 dedos) limpio |
| m5w2-s3 gotItWhen: every string rings in your G chord — including the open D and G in the middle, which beginners tend to accidentally mute. | cada cuerda suena en tu acorde G — incluyendo las cuerdas Re y Sol al aire en el medio, que los principiantes tienden a silenciar por accidente. |
| m5w2-s3 practice label: Hear G major (arpeggiated) | Escucha G mayor (arpegiado) |
| m5w2-s4 text: Use the common-finger pivot between Am and C | Usar el pivote de dedo común entre Am y C |
| m5w2-s4 gotItWhen: when you switch Am ↔ C your index finger stays planted on string 2 fret 1 — you don't lift it and put it back down. | cuando cambias Am ↔ C tu dedo índice se queda plantado en la cuerda 2, traste 1 — no lo levantas para volver a ponerlo. |
| m5w2-s4 practice prompt: When pivoting between Am and C, which finger STAYS planted on string 2 fret 1? | Al pivotear entre Am y C, ¿qué dedo SE QUEDA plantado en la cuerda 2, traste 1? |
| m5w2-s4 practice choices: Index (1) / Middle (2) / Ring (3) / Pinky (4) | Índice (1) / Medio (2) / Anular (3) / Meñique (4) |
| m5w2-s5 text: Play a down-up strum (D U D U) in time, building to 70 BPM | Tocar un rasgueo abajo-arriba (D U D U) a tiempo, subiendo hasta 70 BPM |
| m5w2-s5 gotItWhen: your wrist swings like a pendulum — downstrokes on the numbers, upstrokes on the "and" — and you can hold it steady at 70 BPM without thinking about which way is next. | tu muñeca se balancea como un péndulo — rasgueos hacia abajo en los números, hacia arriba en el "y" — y puedes mantenerlo constante a 70 BPM sin pensar cuál dirección sigue. |
| m5w2-s5 practice prompt: In a down-up strum pattern, when do the UPSTROKES happen? | En un patrón de rasgueo abajo-arriba, ¿cuándo ocurren los rasgueos HACIA ARRIBA? |
| m5w2-s5 practice choices: On the numbers (1, 2, 3, 4) / On the "+" (and) between beats / Only on beat 4 / Randomly | En los números (1, 2, 3, 4) / En el "+" (y) entre tiempos / Solo en el tiempo 4 / Al azar |
| m5w2-s6 text: Switch between any two chords in Group 1 on beat 1 at 70 BPM | Cambiar entre dos acordes cualesquiera del Grupo 1 en el tiempo 1 a 70 BPM |
| m5w2-s6 gotItWhen: you pick any two chords from C, G, Am, F at random (shuffle homemade flashcards or point blind at the chart) and can switch between them on beat 1 at 70 BPM without breaking the strum. | eliges dos acordes cualesquiera de C, G, Am, F al azar (mezcla tarjetas caseras o apunta a ciegas al diagrama) y puedes cambiar entre ellos en el tiempo 1 a 70 BPM sin romper el rasgueo. |
| m5w2-s6 practice label: C–G–Am–F progression (root notes) | Progresión C–G–Am–F (notas raíz) |

### Set 3

| English | Spanish |
|---|---|
| unit: Module 5 · Open Chords | Módulo 5 · Acordes al aire |
| subtitle: Chord Group 2: D, A, Em, Bm · Connecting chord groups | Grupo de acordes 2: D, A, Em, Bm · Conectando grupos de acordes |
| skillFocus: Fretting the D, A, and Bm chords · Connecting chord groups in a song | Trastear los acordes D, A y Bm · Conectar grupos de acordes en una canción |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for the chord changes | Escucha los cambios de acorde |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — Group 2 chords & cross-group connections | Estación de práctica — acordes del Grupo 2 y conexiones entre grupos |
| Section title: Fret D major cleanly | Trastea D mayor limpio |
| Section title: Fret Bm cleanly | Trastea Bm limpio |
| Section title: Connect Group 1 & Group 2 chords | Conecta acordes del Grupo 1 y del Grupo 2 |
| Section title: One-Minute Changes — try for a higher number | Cambios de un minuto — intenta superar tu número |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Station Wrap-Up | Cierre de la estación |
| Section title: The waltz strum (3/4 time) — count in 3 | El rasgueo de vals (compás 3/4) — cuenta en 3 |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: How to Play a D Major Chord – Lauren Bateman (0:00–4:00). | Mira: How to Play a D Major Chord – Lauren Bateman (0:00–4:00). |
| hint: D major has a triangular finger shape — notice how her three fingers are stacked in a triangle on strings 1, 2, and 3. Try to copy that exact shape. | D mayor tiene una forma triangular de dedos — fíjate cómo sus tres dedos se apilan en un triángulo en las cuerdas 1, 2 y 3. Intenta copiar esa forma exacta. |
| response prompt: The D major chord uses which finger shape on strings 1, 2, and 3? | ¿Qué forma de dedos usa el acorde D mayor en las cuerdas 1, 2 y 3? |
| response explain: The three fretting fingers form a little triangle on the top three strings — that's the visual cue for D major. | Los tres dedos que trastean forman un pequeño triángulo en las tres cuerdas agudas — esa es la pista visual de D mayor. |
| response choices: A triangle shape / A straight line across one fret / A square shape / All open strings | Una forma triangular / Una línea recta a lo largo de un traste / Una forma cuadrada / Todas cuerdas al aire |
| text: Watch: B minor (Bm) Chord, 2 Ways (start easy, then barre) – Guitar Goddess (0:00–4:00). | Mira: B minor (Bm) Chord, 2 Ways (start easy, then barre) – Guitar Goddess (0:00–4:00). |
| hint: Bm is the trickiest chord in this group. The partial barre version (xx4432) is the most accessible. Don't try the full barre version yet — focus on getting a clean sound first. | Bm es el acorde más complicado de este grupo. La versión con cejilla parcial (xx4432) es la más accesible. No intentes la versión con cejilla completa todavía — concéntrate primero en lograr un sonido limpio. |
| response placeholder: Which Bm version are you starting with (partial barre or full)? What's the hardest part for you? | ¿Con qué versión de Bm estás empezando (cejilla parcial o completa)? ¿Cuál es la parte más difícil para ti? |

**Station B — Listen for the chord changes**

| English | Spanish |
|---|---|
| text: Listen to "Luna" by Peso Pluma & Junior H — the whole song uses just two chords, F and Am, with Dm making a brief passing appearance near the end of the verse and again in the closing bridge (some charts voice it as Dm9). The pulse is in 2: tap just the big downbeats and feel the chord changes land right on them. | Escucha "Luna" de Peso Pluma y Junior H — toda la canción usa solo dos acordes, F y Am, con Dm apareciendo brevemente de paso cerca del final de la estrofa y otra vez en el puente final (algunos diagramas lo interpretan como Dm9). El pulso está en 2: marca solo los tiempos fuertes y siente los cambios de acorde caer justo en ellos. |
| hint: F and Am are chords you already know from Group 1 — Dm passes through briefly near the end of the verse and in the closing bridge. Your ear already knows the sound — you're just learning to place the changes. | F y Am son acordes que ya conoces del Grupo 1 — Dm pasa brevemente cerca del final de la estrofa y en el puente final. Tu oído ya conoce el sonido — solo estás aprendiendo a ubicar los cambios. |
| response placeholder: Describe one moment where you clearly heard a chord change. | Describe un momento donde escuchaste claramente un cambio de acorde. |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: you now know two whole chord groups. Which Group 2 chord (D, A, Em, Bm) feels furthest from automatic, and what specifically trips it up? | Cierre de la estación — pausa y piensa: ahora conoces dos grupos completos de acordes. ¿Qué acorde del Grupo 2 (D, A, Em, Bm) se siente más lejos de ser automático, y qué específicamente lo hace tropezar? |
| response placeholder: e.g. D — string 1 keeps getting muted by my ring finger | p. ej. D — mi dedo anular sigue silenciando la cuerda 1 |

**Station C — Fret D major cleanly**

| English | Spanish |
|---|---|
| text: Challenge 1 — Clean D: fret D major (triangle: string 1, fret 2 · string 2, fret 3 · string 3, fret 2) and strum strings 1–4 only. You've got it when: all four ring — especially string 1 (high E), which loves to get muted. | Reto 1 — D limpio: trastea D mayor (triángulo: cuerda 1, traste 2 · cuerda 2, traste 3 · cuerda 3, traste 2) y rasguea solo las cuerdas 1–4. Lo tienes cuando: las cuatro suenan — especialmente la cuerda 1 (mi aguda), que ama silenciarse. |
| hint: The D chord is tricky because string 1 is easy to accidentally mute. Curve your fingers and make sure your fingertips arch away from that string. | El acorde D es complicado porque es fácil silenciar la cuerda 1 por accidente. Curva tus dedos y asegúrate de que las puntas se arqueen lejos de esa cuerda. |
| stuck: Get strings 1 and 2 ringing first, then add string 3. Arch the ring finger up high so it clears the high E. | Haz sonar primero las cuerdas 1 y 2, y luego agrega la cuerda 3. Arquea bien alto el dedo anular para que despeje la mi aguda. |
| levelUp: Switch D→A→D without looking — both shapes live around the 2nd fret. | Cambia D→A→D sin mirar — ambas formas viven cerca del traste 2. |

**Station C — Fret Bm cleanly**

| English | Spanish |
|---|---|
| text: Challenge 2 — Clean Bm: fret the partial-barre Bm shape (xx4432 — index on string 1, fret 2 · middle on string 2, fret 3 · ring on string 3, fret 4 · pinky on string 4, fret 4) and strum strings 4–1 only. You've got it when: all four fretted strings ring clearly — the pinky on string 4 is the one most likely to go quiet. | Reto 2 — Bm limpio: trastea la forma de cejilla parcial de Bm (xx4432 — índice en la cuerda 1, traste 2 · medio en la cuerda 2, traste 3 · anular en la cuerda 3, traste 4 · meñique en la cuerda 4, traste 4) y rasguea solo las cuerdas 4–1. Lo tienes cuando: las cuatro cuerdas trasteadas suenan claras — el meñique en la cuerda 4 es el que más se apaga. |
| hint: This is your first partial barre — fingers 1 through 4 climb like stairs across strings 1 through 4. Curl each one so it presses straight down on its own string, not brushing the neighbor. | Esta es tu primera cejilla parcial — los dedos 1 al 4 suben como escalera por las cuerdas 1 a 4. Curva cada uno para que presione derecho hacia abajo en su propia cuerda, sin rozar al vecino. |
| stuck: Build it one finger at a time: index on string 1, then middle, then ring, then pinky last — check each string rings before adding the next finger. | Constrúyelo un dedo a la vez: índice en la cuerda 1, luego medio, luego anular, y meñique al final — revisa que cada cuerda suene antes de agregar el siguiente dedo. |
| levelUp: Switch Em→Bm→Em without looking — the index finger barely has to move between them. | Cambia Em→Bm→Em sin mirar — el dedo índice casi no tiene que moverse entre ellos. |

**Station C — Connect Group 1 & Group 2 chords**

| English | Spanish |
|---|---|
| text: Challenge 3 — Cross-Group Changes: at 60 BPM, switch G→D, Am→Em, and C→A, 2 bars each — then drill the two within-group pairs your assessment checks, D→A and Em→Bm, 2 bars each. You've got it when: each change lands on beat 1, using fingers that stay close as you switch. | Reto 3 — Cambios entre grupos: a 60 BPM, cambia G→D, Am→Em, y C→A, 2 compases cada uno — y luego ejercita los dos pares dentro del mismo grupo que revisa tu evaluación, D→A y Em→Bm, 2 compases cada uno. Lo tienes cuando: cada cambio cae en el tiempo 1, usando dedos que se quedan cerca al cambiar. |
| hint: Look for fingers that stay close or in the same area as you switch. Planning your hand movement before you lift your fingers saves time. Set the ⏱ Timer for 3 minutes and run the pairs until it beeps. | Busca dedos que se queden cerca o en la misma área al cambiar. Planear el movimiento de tu mano antes de levantar los dedos ahorra tiempo. Pon el ⏱ Temporizador en 3 minutos y corre los pares hasta que suene. |
| stuck: Take one pair at a time. For G→D, notice all your fingers shift toward the high strings together — move them as one unit, not finger by finger. | Toma un par a la vez. Para G→D, nota que todos tus dedos se desplazan juntos hacia las cuerdas agudas — muévelos como una unidad, no dedo por dedo. |
| levelUp: Run all the pairs back-to-back without stopping — including D↔A and Em↔Bm — or push every pair to 70 BPM. | Corre todos los pares uno tras otro sin detenerte — incluyendo D↔A y Em↔Bm — o empuja cada par a 70 BPM. |

**Station C — One-Minute Changes — try for a higher number**

| English | Spanish |
|---|---|
| text: Challenge 4 — One-Minute Changes (G ↔ D): set the ⏱ Timer for 60 seconds and switch G→D→G→D as many times as you can — only CLEAN changes count. This is a cross-group jump, so it's a real test. You've got it when: type your count below and aim for a higher count than your Set 2 number. | Reto 4 — Cambios de un minuto (G ↔ D): pon el ⏱ Temporizador en 60 segundos y cambia G→D→G→D tantas veces como puedas — solo cuentan los cambios LIMPIOS. Este es un salto entre grupos, así que es una prueba real. Lo tienes cuando: escribes tu cuenta abajo y apuntas a superar el número de la Unidad 2. |
| hint: G and D both sit up near the high strings — let your whole hand travel as one shape rather than placing finger by finger. | G y D están cerca de las cuerdas agudas — deja que toda tu mano viaje como una sola forma en vez de colocar dedo por dedo. |
| stuck: Park your hand over G, then practice just dropping into D and back. Slow until each one rings, then let speed come. | Deja tu mano posicionada sobre G, y luego practica solo caer en D y volver. Despacio hasta que cada uno suene, y luego deja que la velocidad llegue. |
| levelUp: Run Em↔A instead, or add a down-up strum on each chord. | Prueba Em↔A en su lugar, o agrega un rasgueo abajo-arriba en cada acorde. |
| response prompt: Personal record — clean G↔D changes in 60 seconds. Your count today? | Récord personal — cambios limpios G↔D en 60 segundos. ¿Tu cuenta hoy? |
| response placeholder: e.g. 20 — try for a higher number next time | p. ej. 20 — intenta superarlo la próxima vez |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Luna, the vamp (a short chord pattern repeated over and over): F · Am — two shapes, both from Group 1 and chords you already know well, with the simplified F (xx3211). The song is in 6/8, so play two downbeat strums per bar — nothing syncopated — changing every bar at 60 BPM. You've got it when: four laps (a lap = one full time through the loop) with every change landing on the downbeat and the little F ringing clean. 🧵 Song Journey: this is Layer 5 of 5. | Reto — Luna, el vamp (un patrón de acordes corto que se repite una y otra vez): F · Am — dos formas, ambas del Grupo 1 y acordes que ya conoces bien, con el F simplificado (xx3211). La canción está en 6/8, así que toca dos rasgueos en el tiempo fuerte por compás — nada sincopado — cambiando cada compás a 60 BPM. Lo tienes cuando: cuatro vueltas (una vuelta = un recorrido completo del loop) con cada cambio cayendo en el tiempo fuerte y el pequeño F sonando limpio. 🧵 Recorrido de la canción: esto es la Capa 5 de 5. |
| hint: F and Am are already in your hands from Group 1 — the only new part is the simplified F shape (xx3211) and locking the change to the 6/8 pulse. | F y Am ya están en tus manos desde el Grupo 1 — lo único nuevo es la forma simplificada de F (xx3211) y ajustar el cambio al pulso de 6/8. |
| stuck: Loop just F → Am until the shape change is automatic, then add the metronome at 60 BPM. | Repite solo F → Am hasta que el cambio de forma sea automático, y luego agrega el metrónomo a 60 BPM. |
| levelUp: Drop in the passing Dm near the end of the verse (some charts voice it as Dm9), or push the tempo to 70 BPM. | Agrega el Dm de paso cerca del final de la estrofa (algunos diagramas lo interpretan como Dm9), o empuja el tempo a 70 BPM. |
| response prompt: Which change was toughest — into F, or out of it? | ¿Qué cambio fue el más difícil — entrar a F, o salir de él? |
| response placeholder: e.g. into F — the top-string barre lands late | p. ej. entrar a F — la cejilla en la cuerda aguda llega tarde |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Crossing between Group 1 and Group 2, which single change still feels like reaching across the neck? Name it — that's your warm-up next session. | Al cruzar entre el Grupo 1 y el Grupo 2, ¿qué cambio todavía se siente como estirarse por todo el mástil? Nómbralo — ese es tu calentamiento la próxima sesión. |
| response placeholder: e.g. C→A still feels like a big jump | p. ej. C→A todavía se siente como un salto grande |

**Station C — The waltz strum (3/4 time) — count in 3**

| English | Spanish |
|---|---|
| text: Challenge — Waltz Strum: not every song is in 4. A waltz counts in THREE — "ONE-two-three, ONE-two-three." Play a firm downstrum on beat 1 (strum harder into the low strings so the bass rings), then lighter downs on beats 2 and 3 (D · D · D). Comfortable? Sneak an up after beat 3: D · D · D-U. Beat 1 is the strongest: it should clearly stand out from the other two. This "in-3" feel is the same strong-ONE pulse you hear driving songs like "The House of the Rising Sun." Use Em so the low strings ring full. You've got it when: you keep it steady for 8 bars and beat 1 is unmistakably the strongest pulse in every bar. | Reto — Rasgueo de vals: no todas las canciones están en 4. Un vals cuenta en TRES — "UNO-dos-tres, UNO-dos-tres." Toca un rasgueo firme hacia abajo en el tiempo 1 (rasguea más fuerte hacia las cuerdas graves para que suene el bajo), y luego rasgueos más ligeros hacia abajo en los tiempos 2 y 3 (D · D · D). ¿Cómodo? Agrega un rasgueo hacia arriba después del tiempo 3: D · D · D-U. El tiempo 1 es el más fuerte: debe destacar claramente de los otros dos. Esta sensación "en 3" es el mismo pulso fuerte-UNO que escuchas impulsando canciones como "The House of the Rising Sun." Usa Em para que las cuerdas graves suenen completas. Lo tienes cuando: lo mantienes constante por 8 compases y el tiempo 1 es inconfundiblemente el pulso más fuerte en cada compás. | 
| hint: Say "ONE-two-three" out loud with the ONE loudest. Let the pick fall a little heavier and more toward the bass strings on beat 1, then lift to lighter strums for 2 and 3. Three beats per bar, then straight back to a strong ONE — no beat 4 to wait for. | Di "UNO-dos-tres" en voz alta con el UNO más fuerte. Deja que la púa caiga un poco más pesada y más hacia las cuerdas graves en el tiempo 1, y luego sube a rasgueos más ligeros para el 2 y el 3. Tres tiempos por compás, y luego directo de vuelta a un UNO fuerte — sin tiempo 4 que esperar. |
| stuck: Drop the strum entirely and just tap: one loud tap on 1, two soft taps on 2 and 3, over and over. Once that "ONE-two-three" pulse is in your foot, add the strums back on top of it. | Deja el rasgueo por completo y solo golpea con el pie: un golpe fuerte en el 1, dos golpes suaves en el 2 y el 3, una y otra vez. Una vez que ese pulso "UNO-dos-tres" esté en tu pie, agrega de vuelta los rasgueos encima. |
| levelUp: Change chords every bar on beat 1 — one bar of Em, then Am, then G — keeping the strong-beat-1 waltz pulse unbroken through each change. | Cambia de acorde cada compás en el tiempo 1 — un compás de Em, luego Am, luego G — manteniendo el pulso de vals con el tiempo 1 fuerte sin romperse en cada cambio. |
| playSeq label: Hear Em — the waltz chord | Escucha Em — el acorde del vals |

**Set 3 — Skills**

| English | Spanish |
|---|---|
| m5w3-s1 text: Fret D major cleanly — triangular shape, strings 1–4 | Trastear D mayor limpio — forma triangular, cuerdas 1–4 |
| m5w3-s1 gotItWhen: all four strings in D ring clearly — especially the high E (string 1), which is the one beginners most often mute accidentally. | las cuatro cuerdas de D suenan claras — especialmente la mi aguda (cuerda 1), que es la que los principiantes más silencian por accidente. |
| m5w3-s1 practice prompt: When you strum the D major open chord, which strings should you play? | Cuando rasgueas el acorde D mayor al aire, ¿qué cuerdas deberías tocar? |
| m5w3-s1 practice choices: All 6 strings / Strings 4–1 (the top 4) / Strings 6–3 / Just strings 1 and 2 | Las 6 cuerdas / Las cuerdas 4–1 (las 4 agudas) / Las cuerdas 6–3 / Solo las cuerdas 1 y 2 |
| m5w3-s2 text: Fret A major cleanly — 3 fingers on 2nd fret | Trastear A mayor limpio — 3 dedos en el traste 2 |
| m5w3-s2 gotItWhen: your three fingers all fit on the 2nd fret without colliding, and strings 1–5 ring cleanly when you strum. | tus tres dedos caben en el traste 2 sin chocar, y las cuerdas 1–5 suenan limpias cuando rasgueas. |
| m5w3-s2 practice prompt: In the open A major chord, all three fretting fingers go on which fret? | En el acorde A mayor al aire, ¿en qué traste van los tres dedos que trastean? |
| m5w3-s2 practice choices: 1st fret / 2nd fret / 3rd fret / Different frets each | Traste 1 / Traste 2 / Traste 3 / Cada uno en un traste distinto |
| m5w3-s3 text: Fret Bm with partial barre shape (xx4432) | Trastear Bm con la forma de cejilla parcial (xx4432) |
| m5w3-s3 gotItWhen: you can play the small four-finger Bm (xx4432) and all four notes ring — each finger arched so strings 1–4 are buzz-free. | puedes tocar el pequeño Bm de cuatro dedos (xx4432) y las cuatro notas suenan — cada dedo arqueado para que las cuerdas 1–4 no zumben. |
| m5w3-s3 practice prompt: The Bm chord is written "xx4432". What do the two "x"s at the start mean? | El acorde Bm se escribe "xx4432". ¿Qué significan las dos "x" al principio? |
| m5w3-s3 practice choices: Strum extra hard / Mute strings 6 and 5 — don't play them / Use 2 fingers on string 1 / Cross your fingers | Rasguea extra fuerte / Silencia las cuerdas 6 y 5 — no las toques / Usa 2 dedos en la cuerda 1 / Cruza los dedos |
| m5w3-s4 text: Switch D to A in time at 70 BPM | Cambiar de D a A a tiempo a 70 BPM |
| m5w3-s4 gotItWhen: you can switch D ↔ A on beat 1 at 70 BPM without breaking your strum or pausing to position fingers. | puedes cambiar D ↔ A en el tiempo 1 a 70 BPM sin romper tu rasgueo ni pausar para posicionar los dedos. |
| m5w3-s4 practice label: D ↔ A switch (roots, 4 bars) | Cambio D ↔ A (raíces, 4 compases) |
| m5w3-s5 text: Connect Group 1 and Group 2 chords in a song (e.g., G to D, Am to Em) | Conectar acordes del Grupo 1 y del Grupo 2 en una canción (p. ej., G a D, Am a Em) |
| m5w3-s5 gotItWhen: you can play through a real song that mixes Group 1 and Group 2 chords without slowing down at the cross-group changes. | puedes tocar una canción real que mezcla acordes del Grupo 1 y del Grupo 2 sin bajar la velocidad en los cambios entre grupos. |
| m5w3-s5 practice label: Cross-group progression (G · Em · C · D roots) | Progresión entre grupos (raíces G · Em · C · D) |
| m5w3-s6 text: Play the "Luna" vamp (F–Am, plus a passing Dm) using Group 1 chords with a strum pattern | Tocar el vamp de "Luna" (F–Am, con un Dm de paso) usando acordes del Grupo 1 con un patrón de rasgueo |
| m5w3-s6 gotItWhen: you can loop the "Luna" vamp (F · Am) with steady downbeat strums at 60 BPM, every change landing on the downbeat and the simplified F (xx3211) ringing clean. | puedes repetir el vamp de "Luna" (F · Am) con rasgueos constantes en el tiempo fuerte a 60 BPM, cada cambio cayendo en el tiempo fuerte y el F simplificado (xx3211) sonando limpio. |

### Set 4

| English | Spanish |
|---|---|
| unit: Module 5 · Open Chords | Módulo 5 · Acordes al aire |
| subtitle: Chord Group 3: E, B7, F#m, C#m · Course showcase preparation | Grupo de acordes 3: E, B7, F#m, C#m · Preparación para la muestra del curso |
| skillFocus: Fretting the E and B7 chords · Recognizing the F#m and C#m shapes · Performing a song with several chords | Trastear los acordes E y B7 · Reconocer las formas F#m y C#m · Interpretar una canción con varios acordes |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Plan your showcase practice | Planea tu práctica para la muestra |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — Group 3 chords & showcase prep | Estación de práctica — acordes del Grupo 3 y preparación para la muestra |
| Section title: Fret E major cleanly | Trastea E mayor limpio |
| Section title: Fret B7 cleanly | Trastea B7 limpio |
| Section title: One-Minute Changes — try for a higher number | Cambios de un minuto — intenta superar tu número |
| Section title: Perform your showcase song | Interpreta tu canción de la muestra |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Call & Response over a backing track | Llamada y respuesta sobre una pista de acompañamiento |
| Section title: Station Wrap-Up | Cierre de la estación |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: The E Chord (BC-113) – JustinGuitar (0:00–4:00). | Mira: The E Chord (BC-113) – JustinGuitar (0:00–4:00). |
| hint: E major uses three fingers — it's a full, rich chord. (B7, later in this set, is the one that uses all four.) Play it as he shows and take it slow, checking every string rings. The two diagrams below are F#m and C#m: Group 3 barre shapes you only need to RECOGNIZE on a chart for now, not play cleanly yet. | E mayor usa tres dedos — es un acorde completo y rico. (B7, más adelante en esta unidad, es el que usa los cuatro.) Tócalo como él muestra y ve despacio, revisando que cada cuerda suene. Los dos diagramas de abajo son F#m y C#m: formas de cejilla del Grupo 3 que por ahora solo necesitas RECONOCER en un diagrama, no tocarlas limpias todavía. |
| response placeholder: Describe the sound of the E major chord — full and rich, or is a string buzzing? | Describe el sonido del acorde E mayor — ¿completo y rico, o hay una cuerda zumbando? |
| text: Watch: How to Practice Effectively – JustinGuitar (0:00–4:00). | Mira: How to Practice Effectively – JustinGuitar (0:00–4:00). |
| hint: Key idea: practice doesn't make perfect — practice makes permanent: whatever you repeat becomes the habit, good or bad. Are you practicing your mistakes or your solutions? This matters most before a performance. | Idea clave: la práctica no hace la perfección — la práctica hace permanente: lo que sea que repitas se convierte en el hábito, bueno o malo. ¿Estás practicando tus errores o tus soluciones? Esto importa más antes de una presentación. |
| response prompt: What is the KEY idea from this video about practice? | ¿Cuál es la idea CLAVE de este video sobre la práctica? |
| response explain: Practice makes PERMANENT — repeating a mistake just locks it in. Slow down and repeat the correct version so that's what becomes automatic. | La práctica hace PERMANENTE — repetir un error solo lo fija. Baja la velocidad y repite la versión correcta para que eso sea lo que se vuelva automático. |
| response choices: Practice makes permanent — so practice the solution, not the mistake / Practice makes perfect — repetition is all that matters / You only need to practice the day before a performance / Speed matters more than accuracy | La práctica hace permanente — así que practica la solución, no el error / La práctica hace la perfección — solo la repetición importa / Solo necesitas practicar el día antes de una presentación / La velocidad importa más que la precisión |

**Station B — Plan your showcase practice**

| English | Spanish |
|---|---|
| text: Look up a chord chart for your showcase song (or one you've been working on). Map out which chord groups you'll use. Are there any chords you need to review? | Busca un diagrama de acordes para tu canción de la muestra (o una en la que has estado trabajando). Ubica qué grupos de acordes vas a usar. ¿Hay algún acorde que necesites repasar? |
| hint: Being intentional about your practice is a skill. Know exactly which transitions are rough and spend most of your time there — not on the parts you already know. | Ser intencional con tu práctica es una destreza. Sabe exactamente qué transiciones están ásperas y pasa la mayor parte de tu tiempo ahí — no en las partes que ya sabes. |
| response placeholder: Which song are you working on? Which chord transition feels the roughest right now? | ¿En qué canción estás trabajando? ¿Qué transición de acorde se siente más difícil ahora mismo? |
| text: Re-read what you wrote back in Module 1 — your "My Guitar Adventure" goal. You set it before you could play a single chord. What has changed? Name one thing you can do now that felt impossible then, and the one thing you still want by the showcase. | Vuelve a leer lo que escribiste en el Módulo 1 — tu meta de "Mi aventura con la guitarra". La escribiste antes de poder tocar un solo acorde. ¿Qué ha cambiado? Nombra una cosa que puedes hacer ahora que se sentía imposible entonces, y lo único que todavía quieres lograr para la muestra. |
| hint: This is the same goal you'll reflect on in your course self-check. Be specific — "I can switch C to G without stopping" is better than "I got better." | Esta es la misma meta sobre la que vas a reflexionar en tu autochequeo del curso. Sé específico — "puedo cambiar de C a G sin detenerme" es mejor que "mejoré". |
| response placeholder: One thing you can do now that you couldn't in Module 1 — and one goal for the showcase. | Una cosa que puedes hacer ahora que no podías en el Módulo 1 — y una meta para la muestra. |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: with the showcase ahead, what will eat most of your practice time between now and then — a specific chord, a transition, or keeping the strum steady? | Cierre de la estación — pausa y piensa: con la muestra por delante, ¿qué se va a llevar la mayor parte de tu tiempo de práctica de aquí a entonces — un acorde específico, una transición, o mantener el rasgueo constante? |
| response placeholder: e.g. the B7→E change, and not rushing the strum | p. ej. el cambio B7→E, y no apurar el rasgueo |

**Station C — Fret E major cleanly**

| English | Spanish |
|---|---|
| text: Challenge 1 — Clean E: fret E major (index finger on string 3, fret 1 · middle finger on string 5, fret 2 · ring finger on string 4, fret 2) and strum all 6 strings. You've got it when: a full, rich chord with every string ringing — watch your index on string 2. | Reto 1 — E limpio: trastea E mayor (dedo índice en la cuerda 3, traste 1 · dedo medio en la cuerda 5, traste 2 · dedo anular en la cuerda 4, traste 2) y rasguea las 6 cuerdas. Lo tienes cuando: un acorde completo y rico con cada cuerda sonando — cuidado con tu índice en la cuerda 2. |
| hint: E major is one of the most satisfying open chords to play. If any string buzzes, check your index finger — it tends to accidentally mute string 2. | E mayor es uno de los acordes al aire más satisfactorios de tocar. Si alguna cuerda zumba, revisa tu dedo índice — tiende a silenciar por accidente la cuerda 2. |
| stuck: E is the Em shape plus one finger — play a clean Em first, then add the index on string 3, fret 1. | E es la forma de Em más un dedo — toca un Em limpio primero, y luego agrega el índice en la cuerda 3, traste 1. |
| levelUp: Switch E→Am→E (similar finger feel), or loop E→B7→E. | Cambia E→Am→E (sensación de dedos similar), o repite E→B7→E. |

**Station C — Fret B7 cleanly**

| English | Spanish |
|---|---|
| text: Challenge 2 — Four-Finger B7: fret B7 (index finger on string 4, fret 1 · middle finger on string 5, fret 2 · ring finger on string 3, fret 2 · pinky on string 1, fret 2) and strum strings 1–5. You've got it when: all four fingers down and every played string clean — then play E→B7→E and listen: the B7 sounds unfinished and "wants" to move back to E — that pull is called resolving. | Reto 2 — B7 con cuatro dedos: trastea B7 (dedo índice en la cuerda 4, traste 1 · dedo medio en la cuerda 5, traste 2 · dedo anular en la cuerda 3, traste 2 · meñique en la cuerda 1, traste 2) y rasguea las cuerdas 1–5. Lo tienes cuando: los cuatro dedos abajo y cada cuerda tocada suena limpia — y luego toca E→B7→E y escucha: el B7 suena inconcluso y "quiere" volver a E — ese tirón se llama resolución. |
| hint: B7 is a dominant 7th chord — it has a slightly tense sound that wants to resolve to E. Play E then B7 then E again and hear how it pulls back. | B7 es un acorde de séptima dominante — tiene un sonido ligeramente tenso que quiere resolver hacia E. Toca E, luego B7 y luego E otra vez, y escucha cómo tira de vuelta. |
| stuck: Place the fingers one at a time in order — index, middle, ring, then pinky — and check that the open string 2 still rings between them. | Coloca los dedos uno a la vez en orden — índice, medio, anular, y meñique al final — y revisa que la cuerda 2 al aire siga sonando entre ellos. |
| levelUp: Loop E→B7→E in time at 60 BPM and feel that pull back to E on every cycle. | Repite E→B7→E a tiempo a 60 BPM y siente ese tirón de vuelta a E en cada ciclo. |

**Station C — One-Minute Changes — try for a higher number**

| English | Spanish |
|---|---|
| text: Challenge 3 — One-Minute Changes (E ↔ B7): set the ⏱ Timer for 60 seconds and switch E→B7→E→B7 as many times as you can — only CLEAN changes count (all four B7 fingers down, strings 1–5 ringing). You've got it when: type your count below and aim for a higher count than your Set 3 number. | Reto 3 — Cambios de un minuto (E ↔ B7): pon el ⏱ Temporizador en 60 segundos y cambia E→B7→E→B7 tantas veces como puedas — solo cuentan los cambios LIMPIOS (los cuatro dedos de B7 abajo, cuerdas 1–5 sonando). Lo tienes cuando: escribes tu cuenta abajo y apuntas a superar el número de la Unidad 3. |
| hint: These two share no fingers, so this is the hardest pair yet. Pre-shape B7 in the air before you land it, and keep string 2 open. | Estos dos no comparten ningún dedo, así que este es el par más difícil hasta ahora. Preforma B7 en el aire antes de aterrizarlo, y mantén la cuerda 2 al aire. |
| stuck: Drill just dropping into B7 from E and back, slowly, until all four fingers land together. Speed comes after the landing is clean. | Ejercita solo caer en B7 desde E y volver, despacio, hasta que los cuatro dedos aterricen juntos. La velocidad llega después de que el aterrizaje sea limpio. |
| levelUp: Add a strum on each chord before switching, or run E→Am→B7. | Agrega un rasgueo en cada acorde antes de cambiar, o prueba E→Am→B7. |
| response prompt: Personal record — clean E↔B7 changes in 60 seconds. Your count today? | Récord personal — cambios limpios E↔B7 en 60 segundos. ¿Tu cuenta hoy? |
| response placeholder: e.g. 14 — try for a higher number next time | p. ej. 14 — intenta superarlo la próxima vez |

**Station C — Perform your showcase song**

| English | Spanish |
|---|---|
| text: Challenge 4 — Showcase Run (your assessment piece): play your course showcase song — the one you're building toward performing for someone (family, a friend, or a recording) — start to finish 3 times without stopping, even through mistakes, and time yourself. No score — this trains your recovery, not perfection. | Reto 4 — Ensayo de la muestra (tu pieza de evaluación): toca tu canción de la muestra del curso — la que estás construyendo para interpretar frente a alguien (familia, un amigo, o una grabación) — de principio a fin 3 veces sin detenerte, incluso con errores, y cronométrate. Sin puntaje — esto entrena tu recuperación, no la perfección. |
| hint: Don't stop when you make a mistake in performance practice. The goal is to keep going. You can fix mistakes in slow practice — performance practice trains your recovery. | No te detengas cuando cometas un error en la práctica de interpretación. El objetivo es seguir tocando. Puedes corregir errores en la práctica lenta — la práctica de interpretación entrena tu recuperación. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Luna, strummed (showcase version): the full song is F · Am, with Dm making a brief passing appearance near the end of the verse and in the closing bridge — two downbeat strums per bar at 60 BPM, building toward 70, singing or humming "Luna, dile tú" — it's tricky! You've got it when: a full verse and chorus with every change on the downbeat and the F ringing clean. 🧵 Song Journey: this is Layer 5 of 5. | Reto — Luna, rasgueada (versión para la muestra): la canción completa es F · Am, con Dm apareciendo brevemente de paso cerca del final de la estrofa y en el puente final — dos rasgueos en el tiempo fuerte por compás a 60 BPM, subiendo hacia 70, cantando o tarareando "Luna, dile tú" — ¡es complicado! Lo tienes cuando: una estrofa y un coro completos con cada cambio en el tiempo fuerte y el F sonando limpio. 🧵 Recorrido de la canción: esto es la Capa 5 de 5. |
| hint: You met this vamp in Set 3 — now make it showcase-clean. F is the trickiest shape; keep your fingers arched and thumb behind the neck so all four strings you strum ring. | Conociste este vamp en la Unidad 3 — ahora déjalo limpio para la muestra. F es la forma más complicada; mantén tus dedos arqueados y el pulgar detrás del mástil para que las cuatro cuerdas que rasgueas suenen. |
| stuck: F is the tough one — loop Am → F on its own until the shape lands clean, then run the full F–Am (with the passing Dm near the verse's end and in the closing bridge). | F es el difícil — repite solo Am → F hasta que la forma caiga limpia, y luego corre el F–Am completo (con el Dm de paso cerca del final de la estrofa y en el puente final). |
| levelUp: Try the down-down-up split strum on each chord, or push to 70 BPM. | Prueba el rasgueo dividido abajo-abajo-arriba en cada acorde, o empuja a 70 BPM. |
| response prompt: Which core song do you most want to play start-to-finish at the showcase? | ¿Qué canción principal más quieres tocar de principio a fin en la muestra? |
| response placeholder: e.g. Luna, all of it | p. ej. Luna, completa |

**Station C — Call & Response over a backing track**

| English | Spanish |
|---|---|
| text: Challenge — Call & Response (your course-wrap check piece): jam (play along freely and make up your own part) over ▶ 🎵 the Am jam track (or any core-song ▶ 🎵 Backing track — recorded music you play along with — in Module 4's 🎵 Songs list) and improvise a call-and-response solo — play a 2-bar "question" phrase, leave a little space, then answer it with a 2-bar "response." Stay in the minor pentatonic box from Module 4. You've got it when: you hold the track's pulse start to finish with no restarts, and your response phrase clearly answers your question phrase. This is scored the same way as your Module 4 solo (Accuracy + Consistency). | Reto — Llamada y respuesta (tu pieza de revisión de fin de curso): improvisa (toca libremente junto con la pista y crea tu propia parte) sobre ▶ 🎵 la pista de jam en Am (o cualquier ▶ 🎵 pista de acompañamiento — música grabada con la que tocas junto — de canción principal en la lista de 🎵 Canciones del Módulo 4) e improvisa un solo de llamada y respuesta — toca una frase "pregunta" de 2 compases, deja un poco de espacio, y luego respóndela con una "respuesta" de 2 compases. Quédate en la caja pentatónica menor del Módulo 4. Lo tienes cuando: mantienes el pulso de la pista de principio a fin sin reiniciar, y tu frase de respuesta claramente responde a tu frase de pregunta. Esto se califica de la misma manera que tu solo del Módulo 4 (Precisión + Consistencia). |
| hint: Every skill here is a Module 4 skill — this is an easy, fun review of what you already know. The 🎵 Songs list at the bottom of Module 4 has a ▶ 🎵 Backing track for every core song. If the pentatonic box feels rusty, run the Module 4 scale-climb warm-up first, then come back. | Cada destreza aquí es una destreza del Módulo 4 — este es un repaso fácil y divertido de lo que ya sabes. La lista de 🎵 Canciones al final del Módulo 4 tiene una ▶ 🎵 pista de acompañamiento para cada canción principal. Si la caja pentatónica se siente oxidada, corre primero el calentamiento de escalada de escala del Módulo 4, y luego regresa. |
| stuck: Play a 2-bar question, then answer with the SAME rhythm on different notes — copying the rhythm is the easiest way to make two phrases talk to each other. | Toca una pregunta de 2 compases, y luego responde con el MISMO ritmo en notas distintas — copiar el ritmo es la forma más fácil de hacer que dos frases se hablen entre sí. |
| levelUp: Record your 2-bar call, play the recording back over the track, and improvise the response to it live — or trade call and response with a friend if one's around. | Graba tu llamada de 2 compases, reproduce la grabación sobre la pista, e improvisa la respuesta en vivo — o intercambia llamada y respuesta con un amigo si hay alguno cerca. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: After today, what's the one part of your showcase song most likely to fall apart under pressure (recording light on, someone listening)? Type it below — that's exactly where your next practice starts. | Después de hoy, ¿cuál es la única parte de tu canción de la muestra que más probablemente se desarme bajo presión (con la luz de grabación encendida, alguien escuchando)? Escríbelo abajo — ahí es exactamente donde empieza tu próxima práctica. |
| response placeholder: e.g. the B7 in the chorus — it never lands in time | p. ej. el B7 en el coro — nunca cae a tiempo |

**Set 4 — Skills**

| English | Spanish |
|---|---|
| m5w4-s1 text: Fret E major open chord cleanly — all 6 strings ring | Trastear el acorde E mayor al aire limpio — las 6 cuerdas suenan |
| m5w4-s1 gotItWhen: you strum all 6 strings and the chord rings full and rich — string 2 (the one your index finger sits next to) doesn't buzz or mute. | rasgueas las 6 cuerdas y el acorde suena completo y rico — la cuerda 2 (junto a la que se sienta tu dedo índice) no zumba ni se silencia. |
| m5w4-s1 practice label: Hear E major (arpeggiated) | Escucha E mayor (arpegiado) |
| m5w4-s2 text: Fret B7 open chord cleanly — 4 fingers, strings 1–5 | Trastear el acorde B7 al aire limpio — 4 dedos, cuerdas 1–5 |
| m5w4-s2 gotItWhen: all four fingers land at once and strings 1–5 ring clearly — the low E stays silent (no extra ring underneath). | los cuatro dedos aterrizan a la vez y las cuerdas 1–5 suenan claras — la Mi grave se queda en silencio (sin sonido extra debajo). |
| m5w4-s2 practice prompt: B7 is called a "dominant 7th" chord. What does the "7" tell you it adds to the chord? | B7 se llama un acorde de "séptima dominante". ¿Qué te dice el "7" que agrega al acorde? |
| m5w4-s2 practice choices: Seven fingers / A 7th interval — gives it a slightly tense, jazzy/bluesy sound / Play on the 7th fret / Strum it seven times | Siete dedos / Un intervalo de 7ª — le da un sonido ligeramente tenso, jazzero/bluesero / Tócalo en el traste 7 / Rasguéalo siete veces |
| m5w4-s3 text: Identify F#m and C#m shapes on a chord diagram | Identificar las formas F#m y C#m en un diagrama de acorde |
| m5w4-s3 gotItWhen: you can see an F#m or C#m diagram and explain which version (partial barre or full barre) and which finger goes where, even if you can't play it cleanly yet. | puedes ver un diagrama de F#m o C#m y explicar qué versión es (cejilla parcial o completa) y qué dedo va dónde, incluso si todavía no puedes tocarlo limpio. |
| m5w4-s3 practice prompt: F#m and C#m use a "barre" shape. What is a barre? | F#m y C#m usan una forma de "cejilla". ¿Qué es una cejilla? |
| m5w4-s3 practice choices: One finger pressing across multiple strings at the same fret / A type of pick / A string-bending technique / Strumming with the thumb | Un dedo presionando a través de varias cuerdas en el mismo traste / Un tipo de púa / Una técnica de doblar cuerdas / Rasguear con el pulgar |
| m5w4-s4 text: Demonstrate 3+ chord types from across the course | Demostrar 3+ tipos de acorde de todo el curso |
| m5w4-s4 gotItWhen: you can play at least one chord from each of Groups 1, 2, and 3 cleanly on demand — and name the group each belongs to. | puedes tocar al menos un acorde de cada uno de los Grupos 1, 2 y 3 limpio a pedido — y nombrar el grupo al que pertenece cada uno. |
| m5w4-s4 practice prompt: Which of these chords is from Group 2 (D, A, Em, Bm)? | ¿Cuál de estos acordes es del Grupo 2 (D, A, Em, Bm)? |
| m5w4-s4 practice choices: C major / G major / D major / F major | C mayor / G mayor / D mayor / F mayor |
| m5w4-s5 text: Perform a chosen song all the way through without stopping | Interpretar una canción elegida de principio a fin sin detenerse |
| m5w4-s5 gotItWhen: you can play your showcase song start to finish — fingers arched, thumb behind the neck, the shapes held through the whole song — and even with mistakes you keep going and stay in time. | puedes tocar tu canción de la muestra de principio a fin — dedos arqueados, pulgar detrás del mástil, las formas sostenidas durante toda la canción — y aunque haya errores sigues tocando y te mantienes a tiempo. |
| m5w4-s6 text: Maintain a steady strum pattern throughout a full song | Mantener un patrón de rasgueo constante durante una canción completa |
| m5w4-s6 gotItWhen: your strum pattern stays consistent across the whole song — it doesn't fall apart during the hard chord changes. | tu patrón de rasgueo se mantiene constante durante toda la canción — no se desarma durante los cambios de acorde difíciles. |

### Module-level Songs

| English | Spanish |
|---|---|
| "Let It Be" — The Beatles — meta: Verse & chorus full chord strum · C–G–Am–F (I–V–vi–IV) | Rasgueo completo de estrofa y coro · C–G–Am–F (I–V–vi–IV) |
| "All Along the Watchtower" — Dylan / Hendrix — meta: Full performance with open chords | Interpretación completa con acordes al aire |
| "the cure" — Olivia Rodrigo — meta: Open-chord play-along · Am–C–Dm–F–G/B | Toca junto con acordes al aire · Am–C–Dm–F–G/B |
| "Luna" — Peso Pluma, Junior H — meta: Full-song showcase · F–Am–Dm | Muestra de la canción completa · F–Am–Dm |
| "Happy Birthday" — meta: Full chord arrangement — all groups reviewed (optional) | Arreglo completo de acordes — repasa todos los grupos (opcional) |
| "Seven Nation Army" — The White Stripes — meta: ◐ optional harder challenge · D–A–Em strummed adaptation | ◐ reto opcional más difícil · adaptación rasgueada D–A–Em |
| "Sweet Child O' Mine" — Guns N' Roses — meta: Optional showcase · D–C–G power chords (from Module 3) | Muestra opcional · acordes de potencia D–C–G (del Módulo 3) |
| "Riptide" — Vance Joy — meta: Am–G–C — three-chord wonder | Am–G–C — maravilla de tres acordes |
| "No Woman No Cry" — Bob Marley — meta: C–G–Am–F — beautiful and rhythmic | C–G–Am–F — hermosa y rítmica |
| "Ella Baila Sola" — Eslabon Armado × Peso Pluma — meta: Capo 1 · Em–D–C–B7 vamp — current sierreño hit | Capo 1 · vamp Em–D–C–B7 — éxito actual de sierreño |
| "Hallelujah" — Leonard Cohen — meta: C–Am–F–G — beautiful showcase song | C–Am–F–G — hermosa canción para la muestra |
| "Shallow" — Lady Gaga — meta: Em–D–G–C–Am–D — challenge song | Em–D–G–C–Am–D — canción de reto |

### Module Review

| English | Spanish |
|---|---|
| module: Open Chords | Acordes al aire |
| skill mr5-s1: I can read any chord diagram and place my fingers on the right strings, frets, and finger numbers without looking anything up | Puedo leer cualquier diagrama de acorde y colocar mis dedos en las cuerdas, trastes y números de dedo correctos sin buscar nada |
| skill mr5-s2: I can fret Am and Em cleanly — every string in each rings with no buzz | Puedo trastear Am y Em limpios — cada cuerda de ambos suena sin zumbido |
| skill mr5-s3: I can fret Group 1 chords (C, G, Am, and the simplified F) with clean tone | Puedo trastear los acordes del Grupo 1 (C, G, Am, y el F simplificado) con tono limpio |
| skill mr5-s6: I can keep a steady 4-beat down-strum, and a down-up (1 + 2 + 3 + 4 +) pattern, through a chord change | Puedo mantener un rasgueo constante de 4 tiempos hacia abajo, y un patrón abajo-arriba (1 + 2 + 3 + 4 +), a través de un cambio de acorde |
| skill mr5-s4: I can fret Group 2 chords (D, A, Em, and a partial-barre Bm) with clean tone | Puedo trastear los acordes del Grupo 2 (D, A, Em, y un Bm con cejilla parcial) con tono limpio |
| skill mr5-s8: I can perform a chosen song start to finish using 4+ chords from across the course for the showcase | Puedo interpretar una canción elegida de principio a fin usando 4+ acordes de todo el curso para la muestra |
| assessItem: Draw three chords at random (shuffle flashcards or point blind at a chart) and play them in an 8-bar progression at 70 BPM with clean changes in time | Elige tres acordes al azar (mezcla tarjetas o apunta a ciegas en un diagrama) y tócalos en una progresión de 8 compases a 70 BPM con cambios limpios a tiempo |
| assessItem: Record (or perform for someone) one core song from memory — Let It Be, Luna, or "the cure" — plus one song of your choice using at least 4 chords from the course, with clean tone and smooth transitions, then listen back and check both | Graba (o interpreta para alguien) una canción principal de memoria — Let It Be, Luna, o "the cure" — más una canción de tu elección usando al menos 4 acordes del curso, con tono limpio y transiciones suaves, y luego escucha y revisa ambas |
| assessItem: Identify and name the chords on an unlabelled chord chart | Identifica y nombra los acordes en un diagrama de acordes sin etiquetar |
| assessItem: Ungraded reflection (not scored): your written "My Guitar Adventure — Course Check-in" — what changed since the Module 1 goal | Reflexión sin calificar (no cuenta para la nota): tu reflexión escrita "Mi aventura con la guitarra — Check-in del curso" — qué cambió desde la meta del Módulo 1 |
| forward: Every chord you can now fret is a word — Module 6 is where you learn to speak in rhythm. The down-up pattern you started here grows into full strumming patterns, accents, and syncopation that turn these shapes into real songs. | Cada acorde que ahora puedes trastear es una palabra — el Módulo 6 es donde aprendes a hablar en ritmo. El patrón abajo-arriba que empezaste aquí crece hasta convertirse en patrones de rasgueo completos, acentos y síncopa que transforman estas formas en canciones reales. |

## Module 6 — Strumming Patterns with Chords

### Set 1

| English | Spanish |
|---|---|
| unit: Module 6 · Strumming Patterns with Chords | Módulo 6 · Patrones de rasgueo con acordes |
| subtitle: The down-up foundation · 8th-note pulse · Counting "1 + 2 + 3 + 4 +" | La base abajo-arriba · Pulso de corcheas · Contar "1 + 2 + 3 + 4 +" |
| skillFocus: Keeping a steady down-up strum · Counting 8th notes · Strumming through chord changes | Mantener un rasgueo abajo-arriba constante · Contar corcheas · Rasguear a través de cambios de acorde |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Feel the pulse in a real song | Siente el pulso en una canción real |
| Section title: Form today's chords | Forma los acordes de hoy |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — strumming hand drill (a short exercise you repeat) | Estación de práctica — ejercicio para la mano de rasgueo (un ejercicio corto que repites) |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Build the down-up pendulum motion | Construye el movimiento de péndulo abajo-arriba |
| Section title: Hold a steady down-up strum | Mantén un rasgueo abajo-arriba constante |
| Section title: Keep time through a chord change | Mantén el tiempo a través de un cambio de acorde |
| Section title: Speed changes — faster switches, strum never stops | Cambios más rápidos — la mano de rasgueo nunca se detiene |
| Section title: Take It to a Song | Llévalo a una canción |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: Strumming Patterns for Absolute Beginners – Lauren Bateman (0:00–4:00). Your task while you watch: keep your eyes on her strumming wrist and count how many times it changes direction in one bar. | Mira: Strumming Patterns for Absolute Beginners – Lauren Bateman (0:00–4:00). Tu tarea mientras miras: mantén los ojos en su muñeca de rasgueo y cuenta cuántas veces cambia de dirección en un compás. |
| hint: Pay close attention to her wrist — it never stops moving, even when she isn't hitting the strings. The pendulum motion is the secret. | Presta mucha atención a su muñeca — nunca deja de moverse, incluso cuando no está tocando las cuerdas. El movimiento de péndulo es el secreto. |
| response prompt: What is the SINGLE most important habit for good strumming? | ¿Cuál es el ÚNICO hábito más importante para un buen rasgueo? |
| response explain: Keep the wrist swinging like a pendulum the whole time — even on skipped strums it keeps moving. That constant motion is what makes strumming steady and relaxed. | Mantén la muñeca balanceándose como un péndulo todo el tiempo — incluso en los rasgueos que te saltas, sigue moviéndose. Ese movimiento constante es lo que hace que el rasgueo sea estable y relajado. |
| response choices: Keep the wrist moving like a pendulum, even between strums / Strum as loudly as possible / Use a very thick pick / Look at your strumming hand the whole time | Mantener la muñeca moviéndose como un péndulo, incluso entre rasgueos / Rasguear lo más fuerte posible / Usar una púa muy gruesa / Mirar tu mano de rasgueo todo el tiempo |
| text: Watch: Beginner Guitar Strumming Patterns You MUST Know! – Marty Music (0:00–3:00). Your task while you watch: count "1 + 2 + 3 + 4 +" out loud with him for the first pattern and notice which counts get a down and which get an up. | Mira: Beginner Guitar Strumming Patterns You MUST Know! – Marty Music (0:00–3:00). Tu tarea mientras miras: cuenta "1 + 2 + 3 + 4 +" en voz alta con él para el primer patrón y fíjate qué tiempos llevan un golpe hacia abajo y cuáles hacia arriba. |
| hint: Count out loud with him: "1 + 2 + 3 + 4 +". Saying the count is the fastest way to internalize the pulse. | Cuenta en voz alta con él: "1 + 2 + 3 + 4 +". Decir el conteo en voz alta es la forma más rápida de interiorizar el pulso. |
| response placeholder: When you count "1 + 2 + 3 + 4 +", which counts are the downstrokes? Which are the upstrokes? | Cuando cuentas "1 + 2 + 3 + 4 +", ¿cuáles tiempos son los golpes hacia abajo? ¿Cuáles son los golpes hacia arriba? |

**Station B — Feel the pulse in a real song**

| English | Spanish |
|---|---|
| text: Listen to "Brown Eyed Girl" by Van Morrison. Tap along on your leg — down with your hand on the numbers, up on the "ands". Can you feel the 8th-note pulse? | Escucha "Brown Eyed Girl" de Van Morrison. Sigue el ritmo con la mano en tu pierna — hacia abajo en los números, hacia arriba en los "y". ¿Puedes sentir el pulso de corcheas? |
| hint: You don't need a guitar yet. Just train your body to feel the steady pulse before you add the strings. | Todavía no necesitas una guitarra. Solo entrena tu cuerpo para sentir el pulso constante antes de agregar las cuerdas. |
| response prompt: In a down-up 8th-note pattern, how many total strums (down + up) happen in one bar of 4 beats? | En un patrón de corcheas abajo-arriba, ¿cuántos rasgueos en total (abajo + arriba) ocurren en un compás de 4 tiempos? |
| response explain: Each of the 4 beats gets a down AND an up (the "+"), so 4 × 2 = 8 strums — that's "1 + 2 + 3 + 4 +". | Cada uno de los 4 tiempos recibe un golpe hacia abajo Y uno hacia arriba (el "+"), así que 4 × 2 = 8 rasgueos — eso es "1 + 2 + 3 + 4 +". |
| response choices: 4 / 6 / 8 / 16 | 4 / 6 / 8 / 16 |

**Station B — Form today's chords**

| English | Spanish |
|---|---|
| text: Meet your two chords for today: <strong>Em</strong> and <strong>Am</strong> (from Module 5). Form each shape from the diagram and strum once to make sure every string rings — you'll switch between these two for the rest of this set. | Conoce tus dos acordes de hoy: <strong>Em</strong> y <strong>Am</strong> (del Módulo 5). Forma cada forma a partir del diagrama y rasguea una vez para asegurarte de que suenen todas las cuerdas — vas a alternar entre estos dos durante el resto de esta unidad. |
| hint: Em uses two fingers; Am adds a third. The diagrams show exactly where each finger goes. Clean chords now make the strumming sound good later. | Em usa dos dedos; Am agrega un tercero. Los diagramas muestran exactamente dónde va cada dedo. Acordes limpios ahora hacen que el rasgueo suene mejor después. |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: which was harder to keep steady today — your strum hand swinging non-stop like a pendulum, or counting "1 + 2 + 3 + 4 +" out loud the whole time? What started to feel easier? | Cierre de la estación — pausa y piensa: ¿qué se sintió más difícil mantener estable hoy — tu mano de rasgueo balanceándose sin parar como un péndulo, o contar "1 + 2 + 3 + 4 +" en voz alta todo el tiempo? ¿Qué empezó a sentirse más fácil? |
| response placeholder: e.g. my hand kept freezing on the chord change — slowing to 50 BPM helped it keep swinging | p. ej. mi mano se congelaba en el cambio de acorde — bajar a 50 BPM ayudó a que siguiera balanceándose |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Tuning (Module 1) is a skill you keep forever. 60 seconds here makes everything today sound better. | Afinar (Módulo 1) es una destreza que conservas para siempre. 60 segundos aquí hacen que todo suene mejor hoy. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Build the down-up pendulum motion**

| English | Spanish |
|---|---|
| text: Challenge 1 — Pendulum Motion: mute the strings with your fretting hand and, at 60 BPM, strum just the down-up motion — down on each beat, up on each "+", counting aloud. You've got it when: a free, even swing with no forearm tension — pure rhythm, no notes.<div class="strum-line">D   U   D   U   D   U   D   U<span class="su-count">1   +   2   +   3   +   4   +</span></div> | Reto 1 — Movimiento de péndulo: silencia las cuerdas con tu mano de trastear y, a 60 BPM, rasguea solo el movimiento abajo-arriba — abajo en cada tiempo, arriba en cada "+", contando en voz alta. Lo tienes cuando: un balanceo libre y parejo sin tensión en el antebrazo — puro ritmo, sin notas.<div class="strum-line">D   U   D   U   D   U   D   U<span class="su-count">1   +   2   +   3   +   4   +</span></div> |
| hint: No chord, no notes — just the rhythm. Your wrist should swing freely like a pendulum. If your forearm is tense, slow down. | Sin acorde, sin notas — solo el ritmo. Tu muñeca debe balancearse libremente como un péndulo. Si tu antebrazo está tenso, ve más despacio. |
| stuck: Drop to 50 BPM and let your hand bounce loose, like shaking water off your fingers — the down-up should feel automatic before you add any pressure. | Baja a 50 BPM y deja que tu mano rebote suelta, como si sacudieras agua de los dedos — el abajo-arriba debe sentirse automático antes de agregar cualquier presión. |
| levelUp: Push to 80 BPM, or keep the swing perfectly even with your eyes closed for 8 bars. | Sube a 80 BPM, o mantén el balanceo perfectamente parejo con los ojos cerrados durante 8 compases. |

**Station C — Hold a steady down-up strum**

| English | Spanish |
|---|---|
| text: Challenge 2 — Even Eighths on Em: fret Em and strum down-up at 60 BPM for 8 bars. You've got it when: every strum even — same volume, same timing — with upstrokes brushing only the top 3–4 strings. | Reto 2 — Corcheas parejas en Em: trastea Em y rasguea abajo-arriba a 60 BPM durante 8 compases. Lo tienes cuando: cada rasgueo parejo — mismo volumen, mismo tiempo — con los golpes hacia arriba rozando solo las 3–4 cuerdas más agudas. |
| hint: It's normal for upstrokes to feel weaker at first. They should brush only the top 3–4 strings, not the whole chord. | Es normal que los golpes hacia arriba se sientan más débiles al principio. Deben rozar solo las 3–4 cuerdas más agudas, no todo el acorde. |
| stuck: Lighten the pick on the way up so it grazes just the thin strings. If the chord buzzes, recheck your Em fingers before worrying about the strum. | Aligera la púa en el camino hacia arriba para que roce solo las cuerdas delgadas. Si el acorde zumba, revisa tus dedos de Em antes de preocuparte por el rasgueo. |
| levelUp: Speed up to 75 BPM, or hold the 8 bars without letting your eyes drop to your strumming hand. | Acelera a 75 BPM, o sostén los 8 compases sin dejar que tus ojos bajen hacia tu mano de rasgueo. |
| playSeq label: Hear the 8th-note pulse | Escucha el pulso de corcheas |

**Station C — Keep time through a chord change**

| English | Spanish |
|---|---|
| text: Challenge 3 — Em ↔ Am Switch (your assessment piece): switch Em ↔ Am every 2 bars while the down-up strum never stops. Set the ⏱ Timer for 3 minutes and loop it. You've got it when: the strum hand keeps swinging right through every chord change — let the chord catch up. | Reto 3 — Cambio Em ↔ Am (tu pieza de evaluación): cambia entre Em ↔ Am cada 2 compases mientras el rasgueo abajo-arriba nunca se detiene. Pon el ⏱ Temporizador en 3 minutos y repítelo. Lo tienes cuando: la mano de rasgueo sigue balanceándose durante cada cambio de acorde — deja que el acorde te alcance. |
| hint: The #1 beginner mistake is stopping the strum to fix the chord. Keep the wrist moving — let the chord catch up. | El error #1 de los principiantes es detener el rasgueo para arreglar el acorde. Mantén la muñeca en movimiento — deja que el acorde te alcance. |
| stuck: Park on a finger Em and Am share and pivot around it — don't lift every finger at once. Drop to 50 BPM so the change has room. | Quédate en un dedo que Em y Am comparten y pivota alrededor de él — no levantes todos los dedos a la vez. Baja a 50 BPM para que el cambio tenga espacio. |
| levelUp: Switch every bar instead of every 2 bars, or climb to 75 BPM with the strum still unbroken. | Cambia cada compás en lugar de cada 2, o sube a 75 BPM con el rasgueo aún sin interrupciones. |
| response prompt: Personal record — strum unbroken through Em↔Am: play it cleanly at 60 BPM, then go +10 at a time. Your fastest CLEAN switch today (BPM)? | Récord personal — rasgueo sin interrupciones a través de Em↔Am: tócalo limpio a 60 BPM, y luego sube de 10 en 10. ¿Tu cambio LIMPIO más rápido hoy (BPM)? |
| response placeholder: e.g. 80 — try for a higher number next time | p. ej. 80 — intenta superarlo la próxima vez |
| playSeq label: Em → Am roots (2 bars each) | Raíces Em → Am (2 compases cada una) |

**Station C — Speed changes — faster switches, strum never stops**

| English | Spanish |
|---|---|
| text: Challenge — Half-Bar Switch, Non-Stop (2 chords): you just switched Em ↔ Am every two bars. Now do it every TWO BEATS — down-up strumming the whole time, changing on beats 1 and 3, at 60 BPM. The strum hand never pauses; the chord changes between strums. You've got it when: four laps where the pendulum never stops and every change lands on the beat. Press ▶ to hear the target. | Reto — Cambio de medio compás, sin parar (2 acordes): acabas de cambiar entre Em ↔ Am cada dos compases. Ahora hazlo cada DOS TIEMPOS — rasgueando abajo-arriba todo el tiempo, cambiando en los tiempos 1 y 3, a 60 BPM. La mano de rasgueo nunca pausa; el acorde cambia entre rasgueos. Lo tienes cuando: cuatro vueltas donde el péndulo nunca se detiene y cada cambio cae en el tiempo. Presiona ▶ para escuchar el objetivo. |
| hint: Keep the wrist swinging down-up-down-up without a hitch — the fingers change underneath a moving hand. The moment you freeze to place the chord, you've stopped the strum. | Mantén la muñeca balanceándose abajo-arriba-abajo-arriba sin tropiezos — los dedos cambian debajo de una mano en movimiento. En el momento que te congelas para colocar el acorde, has detenido el rasgueo. |
| stuck: Drop to 50 BPM. Say "change" on the "and" after beats 2 and 4 to remind your fingers to move early. | Baja a 50 BPM. Di "cambio" en el "y" después de los tiempos 2 y 4 para recordarle a tus dedos que se muevan temprano. |
| levelUp: Climb to 70 BPM, or jump ahead to the every-beat drill below. | Sube a 70 BPM, o pasa directamente al ejercicio de cada tiempo de abajo. |
| playSeq label: Em·Em · Am·Am roots (change every 2 beats) | Raíces Em·Em · Am·Am (cambia cada 2 tiempos) |
| text: Challenge — Three-Chord Half-Bar (3 chords): add G (from Module 5). Loop Em · Am · G, two beats each, the strum never stopping, at 60 BPM. You've got it when: two clean laps with the pendulum unbroken through all three changes. | Reto — Medio compás con tres acordes (3 acordes): agrega G (del Módulo 5). Repite Em · Am · G, dos tiempos cada uno, el rasgueo sin detenerse, a 60 BPM. Lo tienes cuando: dos vueltas limpias con el péndulo sin interrupciones a través de los tres cambios. |
| hint: Am → G moves every finger, so pre-shape G in the air while Am is still ringing. Em → Am shares your two fretting fingers — barely a move. | Am → G mueve cada dedo, así que preforma G en el aire mientras Am todavía suena. Em → Am comparte tus dos dedos de trastear — apenas un movimiento. |
| stuck: Loop just Am → G until the strum survives that change, then drop Em back in front. | Repite solo Am → G hasta que el rasgueo sobreviva ese cambio, y luego vuelve a poner Em al frente. |
| levelUp: Speed up to 70 BPM, or count "1 + 2 + 3 + 4 +" aloud the whole time. | Acelera a 70 BPM, o cuenta "1 + 2 + 3 + 4 +" en voz alta todo el tiempo. |
| playSeq label: Em·Em · Am·Am · G·G roots (every 2 beats) | Raíces Em·Em · Am·Am · G·G (cada 2 tiempos) |
| text: Challenge — Four-Chord Half-Bar (Let It Be, strummed): the C · G · Am · F loop from Module 5, down-up strumming, two beats per chord at 60 BPM. Four chords at half-bar speed with the strum hand driving — this is real rhythm-guitar playing. You've got it when: two clean laps, strum unbroken, every change on the beat. | Reto — Medio compás con cuatro acordes (Let It Be, rasgueado): el loop C · G · Am · F del Módulo 5, rasgueando abajo-arriba, dos tiempos por acorde a 60 BPM. Cuatro acordes a velocidad de medio compás con la mano de rasgueo al mando — esto es tocar guitarra rítmica de verdad. Lo tienes cuando: dos vueltas limpias, rasgueo sin interrupciones, cada cambio a tiempo. |
| hint: The right hand is the drummer and never stops; the left hand catches up between strokes. Keep upstrokes light — brush only the top few strings. | La mano derecha es el baterista y nunca se detiene; la mano izquierda se pone al día entre golpes. Mantén los golpes hacia arriba ligeros — roza solo las cuerdas más agudas. |
| stuck: Isolate the pair that lags (often G → Am or Am → F) and loop just those two with the strum before running the circle. | Aísla el par que se atrasa (a menudo G → Am o Am → F) y repite solo esos dos con el rasgueo antes de correr el círculo completo. |
| levelUp: Push to 70 BPM, or move on to the every-beat drill below. | Sube a 70 BPM, o pasa al ejercicio de cada tiempo de abajo. |
| playSeq label: C·C · G·G · Am·Am · F·F roots (every 2 beats) | Raíces C·C · G·G · Am·Am · F·F (cada 2 tiempos) |
| text: Challenge — One Chord Per Beat (fastest): the top of the ladder. Switch Em ↔ Am on every single beat — one down-strum per beat, a new chord each time, at 60 BPM, the strum still non-stop. You've got it when: four laps clean at 60 where the change happens the instant your hand lifts for the next strum. | Reto — Un acorde por tiempo (el más rápido): la cima de la escalera. Cambia entre Em ↔ Am en cada tiempo — un golpe hacia abajo por tiempo, un acorde nuevo cada vez, a 60 BPM, el rasgueo sigue sin detenerse. Lo tienes cuando: cuatro vueltas limpias a 60 donde el cambio ocurre en el instante en que tu mano se levanta para el siguiente rasgueo. |
| hint: Em and Am share two fingers, so this is the easiest pair to change every beat — perfect for training raw speed. Trust the shared fingers and move only what has to move. | Em y Am comparten dos dedos, así que es el par más fácil para cambiar en cada tiempo — perfecto para entrenar velocidad pura. Confía en los dedos compartidos y mueve solo lo que tiene que moverse. |
| stuck: Slow to 50 BPM and let some changes be a little buzzy — here the goal is the timing of the switch, not perfect tone. Clean it up as the speed settles. | Baja a 50 BPM y deja que algunos cambios suenen un poco con zumbido — aquí el objetivo es el tiempo del cambio, no un tono perfecto. Límpialo a medida que se asiente la velocidad. |
| levelUp: Hold it clean at 70 BPM, or try Am · G one per beat (every finger moves — much harder). | Mantenlo limpio a 70 BPM, o prueba Am · G uno por tiempo (cada dedo se mueve — mucho más difícil). |
| playSeq label: Em·Am roots (one chord per beat) | Raíces Em·Am (un acorde por tiempo) |
| response prompt: Your fastest CLEAN one-chord-per-beat Em↔Am today (BPM)? | ¿Tu Em↔Am más rápido y LIMPIO hoy, un acorde por tiempo (BPM)? |
| response placeholder: e.g. 60 — 65 next session | p. ej. 60 — 65 la próxima sesión |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Watchtower, strummed for real: play Am · G · F (small F), four beats of down-up strumming per chord at 60 BPM, the pendulum swinging through both changes. You've got it when: two full laps (a lap = one full time through the loop) where the strum hand never stops — not even when the F lands late. 🧵 Song Journey: this song has grown with you since Module 1. | Reto — Watchtower, rasgueado de verdad: toca Am · G · F (F pequeño), cuatro tiempos de rasgueo abajo-arriba por acorde a 60 BPM, el péndulo balanceándose a través de ambos cambios. Lo tienes cuando: dos vueltas completas (una vuelta = un recorrido completo del loop) donde la mano de rasgueo nunca se detiene — ni siquiera cuando el F llega tarde. 🧵 Recorrido de la canción: esta canción ha crecido contigo desde el Módulo 1. |
| hint: Same loop you strummed in Module 5 — the new skill is that your right hand is now the drummer. The chord change happens BETWEEN strums. | El mismo loop que rasgueaste en el Módulo 5 — la nueva destreza es que tu mano derecha ahora es el baterista. El cambio de acorde ocurre ENTRE rasgueos. |
| stuck: Drop to just Am ↔ G until the strum survives that change, then add the F back. | Baja a solo Am ↔ G hasta que el rasgueo sobreviva ese cambio, y luego agrega de vuelta el F. |
| levelUp: Switch every 2 beats instead of 4, or count "1 + 2 + 3 + 4 +" out loud the whole time. | Cambia cada 2 tiempos en lugar de 4, o cuenta "1 + 2 + 3 + 4 +" en voz alta todo el tiempo. |
| text: Challenge — Knockin' on Heaven's Door: play G · D · Am · C, four beats of down-up each at 60 BPM — the record is slow too, so this song never rushes you. You've got it when: one full lap with even volume on downs and ups and every change landing on beat 1. | Reto — Knockin' on Heaven's Door: toca G · D · Am · C, cuatro tiempos de abajo-arriba cada uno a 60 BPM — la grabación también es lenta, así que esta canción nunca te apura. Lo tienes cuando: una vuelta completa con volumen parejo en los golpes hacia abajo y hacia arriba, y cada cambio cayendo en el tiempo 1. |
| hint: Dylan built this song to support a voice — soft, even 8ths are the whole job. If an upstroke catches the strings, let the pick graze just the top 3–4 strings. | Dylan construyó esta canción para apoyar una voz — corcheas suaves y parejas son todo el trabajo. Si un golpe hacia arriba engancha las cuerdas, deja que la púa roce solo las 3–4 cuerdas más agudas. |
| stuck: Loop the G → D change alone — it's the only move where every finger travels. | Repite solo el cambio G → D — es el único movimiento donde cada dedo viaja. |
| levelUp: Sing or hum a line over your own strumming, or speed up to 70 BPM with the 8ths still even. | Canta o tararea una línea sobre tu propio rasgueo, o acelera a 70 BPM manteniendo las corcheas parejas. |
| response prompt: Personal record — full laps in a row with the strum hand never stopping. Your count today? | Récord personal — vueltas completas seguidas con la mano de rasgueo sin detenerse nunca. ¿Tu cuenta de hoy? |
| response placeholder: e.g. 3 — try for a higher number next time | p. ej. 3 — intenta superarlo la próxima vez |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| m6w1-s1 text: Move my strumming wrist like a pendulum — continuous motion, even between strums | Mover mi muñeca de rasgueo como un péndulo — movimiento continuo, incluso entre rasgueos |
| m6w1-s1 gotItWhen: you can watch your strum hand in a mirror or on a quick phone video and see that it never fully stops — the wrist is always traveling down or up, even when you skip a strum. | puedes mirar tu mano de rasgueo en un espejo o en un video rápido del teléfono y ver que nunca se detiene por completo — la muñeca siempre viaja hacia abajo o hacia arriba, incluso cuando te saltas un rasgueo. |
| m6w1-s1 practice prompt: When the wrist "stops" between strums, what usually goes wrong? | Cuando la muñeca "se detiene" entre rasgueos, ¿qué suele salir mal? |
| m6w1-s1 practice choices: Nothing — it should stop / You lose the pulse and the timing falls apart / The pick gets dropped / The chord sounds louder | Nada — debería detenerse / Pierdes el pulso y el tiempo se desmorona / Se te cae la púa / El acorde suena más fuerte |
| m6w1-s2 text: Play a steady down-up 8th-note pattern at 60 BPM for 8 bars | Tocar un patrón de corcheas abajo-arriba constante a 60 BPM durante 8 compases |
| m6w1-s2 gotItWhen: you can strum down-up at 60 BPM for 8 bars and every strum lands evenly with the metronome — no drift, no skipped strums. | puedes rasguear abajo-arriba a 60 BPM durante 8 compases y cada rasgueo cae parejo con el metrónomo — sin desviarte, sin saltarte rasgueos. |
| m6w1-s2 practice label: Hear the 8th-note pulse (8 evens) | Escucha el pulso de corcheas (8 parejas) |
| m6w1-s3 text: Count "1 + 2 + 3 + 4 +" out loud while strumming | Contar "1 + 2 + 3 + 4 +" en voz alta mientras rasgueas |
| m6w1-s3 gotItWhen: you can count aloud with the strum and the numbers always land on downstrokes, the "and"s always land on upstrokes — no thinking required. | puedes contar en voz alta con el rasgueo y los números siempre caen en los golpes hacia abajo, los "y" siempre caen en los golpes hacia arriba — sin necesidad de pensarlo. |
| m6w1-s3 practice prompt: In "1 + 2 + 3 + 4 +", which counts are the DOWNSTROKES? | En "1 + 2 + 3 + 4 +", ¿cuáles tiempos son los GOLPES HACIA ABAJO? |
| m6w1-s3 practice choices: The "+" (and) counts / The numbers (1, 2, 3, 4) / All of them / Only beat 1 | Los "+" (y) / Los números (1, 2, 3, 4) / Todos / Solo el tiempo 1 |
| m6w1-s4 text: Strum with even volume — downstrokes and upstrokes feel equally controlled | Rasguear con volumen parejo — los golpes hacia abajo y hacia arriba se sienten igual de controlados |
| m6w1-s4 gotItWhen: your downstrokes and upstrokes sound roughly the same volume — neither overpowers the other, and your pick doesn't catch the strings on the way up. | tus golpes hacia abajo y hacia arriba suenan más o menos con el mismo volumen — ninguno domina al otro, y tu púa no engancha las cuerdas en el camino hacia arriba. |
| m6w1-s5 text: Keep the strum hand moving through a chord change | Mantener la mano de rasgueo en movimiento a través de un cambio de acorde |
| m6w1-s5 gotItWhen: when you switch from Em to Am (or any two chords), your strum hand never pauses — the chord change happens BETWEEN strums, not by stopping the rhythm. | cuando cambias de Em a Am (o cualquier par de acordes), tu mano de rasgueo nunca pausa — el cambio de acorde ocurre ENTRE rasgueos, no deteniendo el ritmo. |
| m6w1-s5 practice prompt: During a chord change, what should your STRUM hand do? | Durante un cambio de acorde, ¿qué debería hacer tu mano de RASGUEO? |
| m6w1-s5 practice choices: Stop and wait for the chord / Keep moving in the down-up pendulum / Strum extra hard to cover the change / Lift off the strings | Detenerse y esperar al acorde / Seguir moviéndose en el péndulo abajo-arriba / Rasguear extra fuerte para cubrir el cambio / Levantarse de las cuerdas |
| m6w1-s6 text: Play 4 bars of Em then 4 bars of Am with a continuous down-up strum | Tocar 4 compases de Em y luego 4 compases de Am con un rasgueo abajo-arriba continuo |
| m6w1-s6 gotItWhen: you can loop Em-Em-Em-Em-Am-Am-Am-Am with down-up strumming at 60 BPM and never break the rhythm — even when the chord change is imperfect. | puedes repetir Em-Em-Em-Em-Am-Am-Am-Am con rasgueo abajo-arriba a 60 BPM sin romper nunca el ritmo — incluso cuando el cambio de acorde no es perfecto. |
| m6w1-s6 practice label: Em → Am roots (4 bars each) | Raíces Em → Am (4 compases cada una) |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 6 · Strumming Patterns with Chords | Módulo 6 · Patrones de rasgueo con acordes |
| subtitle: The "D-DU-UDU" pattern · Rests and accents · Adding groove (the steady rhythmic feel) | El patrón "D-DU-UDU" · Silencios y acentos · Agregar groove (la sensación rítmica constante) |
| skillFocus: Playing the D-DU-UDU strum pattern · Adding accents and rests · Reading strum-pattern notation | Tocar el patrón de rasgueo D-DU-UDU · Agregar acentos y silencios · Leer la notación de patrones de rasgueo |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Tap the pattern with a real song | Marca el patrón con una canción real |
| Section title: Form today's chords | Forma los acordes de hoy |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — D-DU-UDU pattern drill | Estación de práctica — ejercicio del patrón D-DU-UDU |
| Section title: Warm-up — tune + recall the down-up (Modules 1 & 6) | Calentamiento — afina y recuerda el abajo-arriba (Módulos 1 y 6) |
| Section title: Learn the D-DU-UDU pattern | Aprende el patrón D-DU-UDU |
| Section title: Play the pattern with backbeat accents | Toca el patrón con acentos de contratiempo |
| Section title: Hold the pattern through a chord change | Mantén el patrón a través de un cambio de acorde |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: ⚡ Ear Spark — optional ear bonus | ⚡ Chispa auditiva — bono opcional de oído |
| Section title: Play-along — one full pass, no stopping | Toca junto — un pase completo, sin detenerte |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: The Most Common Strumming Pattern of All Time! – JustinGuitar (0:00–4:00). Your task while you watch: air-strum along and find the two moments the pick misses — the wrist keeps swinging, but on purpose it skips one upstroke and one downstroke. | Mira: The Most Common Strumming Pattern of All Time! – JustinGuitar (0:00–4:00). Tu tarea mientras miras: rasguea en el aire junto con él y encuentra los dos momentos en que la púa falla a propósito — la muñeca sigue balanceándose, pero se salta un golpe hacia arriba y uno hacia abajo a propósito. |
| hint: Justin calls it the pattern you can always rely on — D-DU-UDU. Listen for which strums he skips: the wrist still moves, but the pick doesn't hit the strings on those beats. | Justin lo llama el patrón en el que siempre puedes confiar — D-DU-UDU. Escucha cuáles rasgueos se salta: la muñeca sigue moviéndose, pero la púa no toca las cuerdas en esos tiempos. |
| response prompt: In the D-DU-UDU pattern, which UPSTROKE is skipped (the wrist swings up but the pick misses)? | En el patrón D-DU-UDU, ¿cuál GOLPE HACIA ARRIBA se salta (la muñeca sube pero la púa falla)? |
| response explain: Reading "D - DU - UDU" over "1 + 2 + 3 + 4 +", the skipped upstroke is the "+" of beat 1 — the wrist swings up but the pick misses on purpose. (Beat 3, a downstroke, is the other skip.) | Leyendo "D - DU - UDU" sobre "1 + 2 + 3 + 4 +", el golpe hacia arriba que se salta es el "+" del tiempo 1 — la muñeca sube pero la púa falla a propósito. (El tiempo 3, un golpe hacia abajo, es el otro que se salta.) |
| response choices: The "+" of beat 1 / Beat 2 (the third strum) / The "+" of beat 4 / Beat 1 | El "+" del tiempo 1 / El tiempo 2 (el tercer rasgueo) / El "+" del tiempo 4 / El tiempo 1 |
| text: Watch: Step-by-Step Easy Strumming Patterns – Marty Music (0:00–3:00). Your task while you watch: clap a little louder on beats 2 and 4 along with him, and feel how that "backbeat" makes the pattern groove. | Mira: Step-by-Step Easy Strumming Patterns – Marty Music (0:00–3:00). Tu tarea mientras miras: aplaude un poco más fuerte en los tiempos 2 y 4 junto con él, y siente cómo ese "contratiempo" le da groove al patrón. |
| hint: Marty stacks patterns from easiest to harder, accenting beats 2 and 4 as he goes. The accents give the strum a "backbeat" feel, like a drummer's snare. | Marty apila patrones de más fácil a más difícil, acentuando los tiempos 2 y 4 a medida que avanza. Los acentos le dan al rasgueo una sensación de "contratiempo", como el tambor de un baterista. |
| response placeholder: Why might emphasizing beats 2 and 4 (instead of 1 and 3) make a strum pattern sound more "groovy"? | ¿Por qué acentuar los tiempos 2 y 4 (en lugar de 1 y 3) podría hacer que un patrón de rasgueo suene con más "groove"? |

**Station B — Tap the pattern with a real song**

| English | Spanish |
|---|---|
| text: Listen to "I'm Yours" by Jason Mraz. Tap the D-DU-UDU pattern on your leg along with the song. Where does the pattern repeat? | Escucha "I'm Yours" de Jason Mraz. Marca el patrón D-DU-UDU en tu pierna junto con la canción. ¿Dónde se repite el patrón? |
| hint: The pattern is one bar long and repeats throughout the whole song. Once you have it, you have most of his song. | El patrón dura un compás y se repite durante toda la canción. Una vez que lo dominas, tienes la mayor parte de la canción. |
| response prompt: A one-bar strum pattern in 4/4 time covers how many BEATS? | Un patrón de rasgueo de un compás en tiempo 4/4 cubre cuántos TIEMPOS? |
| response explain: The top number of 4/4 means 4 beats (counts) per bar — "1, 2, 3, 4." Add the "+" upbeats and you get 8 eighth-note slots, but the bar is 4 counts. | El número de arriba en 4/4 significa 4 tiempos (conteos) por compás — "1, 2, 3, 4". Agrega los contratiempos "+" y obtienes 8 espacios de corchea, pero el compás son 4 conteos. |
| response choices: 2 / 4 / 8 / 16 | 2 / 4 / 8 / 16 |

**Station B — Form today's chords**

| English | Spanish |
|---|---|
| text: Today's pattern lands on <strong>G</strong> and <strong>D</strong>. Form each shape from the diagram and strum once cleanly before you add the D-DU-UDU rhythm. | El patrón de hoy cae sobre <strong>G</strong> y <strong>D</strong>. Forma cada forma a partir del diagrama y rasguea una vez de forma limpia antes de agregar el ritmo D-DU-UDU. |
| hint: G is a full six-string chord; D skips the two lowest strings (the X marks). Get them ringing clean first — the rhythm is easier when the chord isn't fighting you. | G es un acorde completo de seis cuerdas; D se salta las dos cuerdas más graves (las marcas X). Primero logra que suenen limpios — el ritmo es más fácil cuando el acorde no está peleando contigo. |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: in the D-DU-UDU pattern, what trips you up more right now — skipping a strum while the wrist keeps moving, or landing the accents on beats 2 and 4? What helped today? | Cierre de la estación — pausa y piensa: en el patrón D-DU-UDU, ¿qué te confunde más ahora mismo — saltarte un rasgueo mientras la muñeca sigue en movimiento, o hacer caer los acentos en los tiempos 2 y 4? ¿Qué te ayudó hoy? |
| response placeholder: e.g. I keep actually hitting the strings on the skip — pulling the pick back just slightly fixed it | p. ej. sigo tocando las cuerdas en el rasgueo que debo saltarme — alejar la púa un poco lo arregló |

**Station C — Warm-up — tune + recall the down-up (Modules 1 & 6)**

| English | Spanish |
|---|---|
| text: Tune all 6 strings to green, then warm the strum hand: 4 bars of steady down-up on Em at 60 BPM (Set 1). You've got it when: in tune and the pendulum already swinging before you add the new pattern. | Afina las 6 cuerdas hasta que estén en verde, y luego calienta la mano de rasgueo: 4 compases de abajo-arriba constante en Em a 60 BPM (Unidad 1). Lo tienes cuando: estás afinado y el péndulo ya está balanceándose antes de agregar el nuevo patrón. |
| hint: Look back: D-DU-UDU is just the down-up you already own with two strums left out. Get the even swing going first. | Recuerda: D-DU-UDU es solo el abajo-arriba que ya dominas con dos rasgueos omitidos. Primero logra que el balanceo parejo funcione. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Learn the D-DU-UDU pattern**

| English | Spanish |
|---|---|
| text: Challenge 1 — Learn the Groove: mute the strings and, at 60 BPM, strum the pattern "Down, Down-Up, Up-Down-Up" (D-DU-UDU). You've got it when: the wrist keeps moving on the skipped downstroke — the pick just misses on purpose.<div class="strum-line">D   ·   D   U   ·   U   D   U<span class="su-count">1   +   2   +   3   +   4   +</span></div> | Reto 1 — Aprende el groove: silencia las cuerdas y, a 60 BPM, rasguea el patrón "Abajo, Abajo-Arriba, Arriba-Abajo-Arriba" (D-DU-UDU). Lo tienes cuando: la muñeca sigue en movimiento en el golpe hacia abajo que te saltas — la púa solo falla a propósito.<div class="strum-line">D   ·   D   U   ·   U   D   U<span class="su-count">1   +   2   +   3   +   4   +</span></div> |
| hint: The trickiest part is keeping the wrist moving on the skipped downstroke. The wrist still goes down — the pick just misses the strings on purpose. | La parte más difícil es mantener la muñeca en movimiento en el golpe hacia abajo que te saltas. La muñeca sigue bajando — la púa solo falla las cuerdas a propósito. |
| stuck: Say it out loud — "down, down-up, up-down-up" — and air-strum with no pick first. The · dots above are the beats your hand passes but doesn't hit. | Dilo en voz alta — "abajo, abajo-arriba, arriba-abajo-arriba" — y rasguea en el aire sin púa primero. Los puntos · de arriba son los tiempos que tu mano pasa pero no toca. |
| levelUp: Run it at 75 BPM, or accent the very first down of each bar so the pattern has a clear "top". | Tócalo a 75 BPM, o acentúa el primer golpe hacia abajo de cada compás para que el patrón tenga un "inicio" claro. |

**Station C — Play the pattern with backbeat accents**

| English | Spanish |
|---|---|
| text: Challenge 2 — Pattern on Em: fret Em and play D-DU-UDU at 60 BPM for 8 bars, counting aloud and accenting beats 2 and 4. You've got it when: 8 clean bars with a clear "snare hit" feel on 2 and 4. | Reto 2 — Patrón en Em: trastea Em y toca D-DU-UDU a 60 BPM durante 8 compases, contando en voz alta y acentuando los tiempos 2 y 4. Lo tienes cuando: 8 compases limpios con una sensación clara de "golpe de tarola" en el 2 y el 4. |
| hint: Add accents on beats 2 and 4 — those downstrokes should be a little louder. Feel the "snare hit" on those beats. | Agrega acentos en los tiempos 2 y 4 — esos golpes hacia abajo deben ser un poco más fuertes. Siente el "golpe de tarola" en esos tiempos. |
| stuck: Drop the accents for now and just get the D-DU-UDU shape clean for 8 bars; add the louder 2-and-4 hits once the pattern runs on autopilot. | Deja los acentos por ahora y solo logra que la forma D-DU-UDU salga limpia durante 8 compases; agrega los golpes más fuertes en 2 y 4 una vez que el patrón salga en piloto automático. |
| levelUp: Move it to G or D, or push to 75 BPM with the backbeat still landing. | Muévelo a G o D, o sube a 75 BPM manteniendo el contratiempo cayendo bien. |
| playSeq label: Hear Em with accent on 2 and 4 | Escucha Em con acento en el 2 y el 4 |

**Station C — Hold the pattern through a chord change**

| English | Spanish |
|---|---|
| text: Challenge 3 — G → D, Pattern Locked (your assessment piece): loop G → D every 2 bars playing D-DU-UDU, and set the ⏱ Timer for 3 minutes to keep going. You've got it when: the pattern stays identical through the change — only the chord moves (drop to 50 BPM if it falls apart). | Reto 3 — G → D, patrón asegurado (tu pieza de evaluación): repite G → D cada 2 compases tocando D-DU-UDU, y pon el ⏱ Temporizador en 3 minutos para seguir. Lo tienes cuando: el patrón se mantiene idéntico a través del cambio — solo el acorde se mueve (baja a 50 BPM si se desarma). |
| hint: If the pattern falls apart during the chord change, slow to 50 BPM. The pattern is the GROOVE — losing it is worse than missing a note in the chord. | Si el patrón se desarma durante el cambio de acorde, baja a 50 BPM. El patrón ES el groove — perderlo es peor que fallar una nota en el acorde. |
| stuck: Change the chord on the LAST upstroke of the bar, while your hand is already moving up — that's the free moment to jump from G to D. Loop just 2 bars until the join between the two bars (the seam) is smooth. | Cambia el acorde en el ÚLTIMO golpe hacia arriba del compás, mientras tu mano ya está subiendo — ese es el momento libre para saltar de G a D. Repite solo 2 compases hasta que la unión entre ambos (la costura) salga fluida. |
| levelUp: Add a third chord (G → D → Em), or run it at 75 BPM with no break at the change. | Agrega un tercer acorde (G → D → Em), o tócalo a 75 BPM sin interrupción en el cambio. |
| response prompt: Personal record — D-DU-UDU through the G→D change: play it cleanly at 60 BPM, then go +10 at a time. Your fastest CLEAN loop today (BPM)? | Récord personal — D-DU-UDU a través del cambio G→D: tócalo limpio a 60 BPM, y luego sube de 10 en 10. ¿Tu vuelta LIMPIA más rápida hoy (BPM)? |
| response placeholder: e.g. 80 — try for a higher number next time | p. ej. 80 — intenta superarlo la próxima vez |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — I'm Yours, verse: play G · D · Em · C with D-DU-UDU, one bar per chord at 60 BPM. This is THE song this pattern is famous for. You've got it when: the verse loop start to finish with the pattern identical on every chord — even when a chord lands imperfect, the groove holds. | Reto — I'm Yours, estrofa: toca G · D · Em · C con D-DU-UDU, un compás por acorde a 60 BPM. Esta es LA canción por la que este patrón es famoso. Lo tienes cuando: el loop de la estrofa de principio a fin con el patrón idéntico en cada acorde — incluso cuando un acorde no sale perfecto, el groove se mantiene. |
| hint: The pattern IS the song here. If it breaks at a change, the fix is Challenge 3's trick: jump chords on the last upstroke of the bar. | El patrón ES la canción aquí. Si se rompe en un cambio, el arreglo es el truco del Reto 3: salta de acorde en el último golpe hacia arriba del compás. |
| stuck: Play the loop with one strum per bar until the changes are clean, then layer the pattern back on. | Toca el loop con un rasgueo por compás hasta que los cambios salgan limpios, y luego vuelve a agregar el patrón. |
| levelUp: Accent beats 2 and 4 to match the recording's bouncy feel, or push to 75 BPM. | Acentúa los tiempos 2 y 4 para igualar la sensación rebotante de la grabación, o sube a 75 BPM. |
| playSeq label: "I'm Yours" verse roots (G · D · Em · C) | Raíces de la estrofa de "I'm Yours" (G · D · Em · C) |
| text: Challenge — Oye Mi Amor, verse: the verse uses just two chords, Bm · G — use the small Bm (top four strings, no barre) and play one bar of each with D-DU-UDU at 60 BPM. You've got it when: four laps with the pattern unbroken and beats 2 and 4 accented so it pushes like the record. | Reto — Oye Mi Amor, estrofa: la estrofa usa solo dos acordes, Bm · G — usa el Bm pequeño (cuatro cuerdas más agudas, sin cejilla) y toca un compás de cada uno con D-DU-UDU a 60 BPM. Lo tienes cuando: cuatro vueltas con el patrón sin interrupciones y los tiempos 2 y 4 acentuados para que empuje como la grabación. |
| hint: The small Bm is the easier beginner version — the full-barre Bm (one finger pressed flat across several strings) arrives in Module 7. For now the pattern matters more than the shape. | El Bm pequeño es la versión más fácil para principiantes — el Bm con cejilla completa (un dedo presionado plano sobre varias cuerdas) llega en el Módulo 7. Por ahora el patrón importa más que la forma. |
| stuck: Loop just the G → Bm change with one strum per bar until the landing is clean, then add the pattern. | Repite solo el cambio G → Bm con un rasgueo por compás hasta que la llegada salga limpia, y luego agrega el patrón. |
| levelUp: Lean into the up-strums a little — that extra offbeat push is the Latin feel. | Inclínate un poco más hacia los golpes hacia arriba — ese empuje extra de contratiempo es la sensación latina. |
| response prompt: Which fought you more — the small Bm shape, or keeping the pattern through the change? | ¿Qué te costó más — la forma pequeña de Bm, o mantener el patrón a través del cambio? |
| response placeholder: e.g. the Bm — my pinky keeps missing fret 4 | p. ej. el Bm — mi meñique sigue fallando el traste 4 |

**Station C — ⚡ Ear Spark — optional ear bonus**

| English | Spanish |
|---|---|
| text: ⚡ Ear Spark (optional, 2 min): play any lesson video from this set and pause right after one bar of strumming — clap the rhythm back exactly, then play it as muted strums. Rhythm echo is ear training too. Got someone around? Have them clap a bar of any pattern from this set for you to echo. | ⚡ Chispa auditiva (opcional, 2 min): reproduce cualquier video de lección de esta unidad y pausa justo después de un compás de rasgueo — aplaude el ritmo exactamente igual, y luego tócalo como rasgueos silenciados. El eco rítmico también es entrenamiento auditivo. ¿Tienes a alguien cerca? Pídele que aplauda un compás de cualquier patrón de esta unidad para que lo repitas. |

**Station C — Play-along — one full pass, no stopping**

| English | Spanish |
|---|---|
| text: Play-along: open Station B's D-DU-UDU lesson video, set YouTube's speed to 0.75×, and strum along for the ENTIRE demo section without stopping. You've got it when: you finish a full pass with the video — flubbed changes and all, don't stop. | Toca junto: abre el video de la lección D-DU-UDU de la Estación B, pon la velocidad de YouTube en 0.75×, y rasguea junto con él durante TODA la sección de demostración sin detenerte. Lo tienes cuando: terminas un pase completo con el video — con cambios fallidos y todo, no te detengas. |
| hint: Not stopping is the skill. Real songs don't wait for you, and neither does the video — keeping going after a mistake is better than starting over. | No detenerte es la destreza. Las canciones reales no te esperan, y el video tampoco — seguir adelante después de un error es mejor que volver a empezar. |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| m6w2-s1 text: Play the D-DU-UDU pattern cleanly at 60 BPM | Tocar el patrón D-DU-UDU de forma limpia a 60 BPM |
| m6w2-s1 gotItWhen: you can play D-DU-UDU on a single chord at 60 BPM for 4 bars in a row without breaking the pattern or stopping the wrist. | puedes tocar D-DU-UDU en un solo acorde a 60 BPM durante 4 compases seguidos sin romper el patrón ni detener la muñeca. |
| m6w2-s1 practice prompt: How would you read D-DU-UDU out loud as a count? (one of these matches) | ¿Cómo leerías D-DU-UDU en voz alta como conteo? (una de estas coincide) |
| m6w2-s1 practice choices: 1, 2-+, +-4-+ / 1, 2-+, +-3-+ / Just count "1, 2, 3, 4" / 1-2-3-4-5-6 | 1, 2-+, +-4-+ / 1, 2-+, +-3-+ / Solo contar "1, 2, 3, 4" / 1-2-3-4-5-6 |
| m6w2-s2 text: Skip a downstroke while keeping the wrist in motion | Saltarse un golpe hacia abajo manteniendo la muñeca en movimiento |
| m6w2-s2 gotItWhen: on the "skipped" strum in the pattern, your wrist still travels down — only the pick doesn't touch the strings. A quick phone video (or a mirror) shows the motion clearly. | en el rasgueo "saltado" del patrón, tu muñeca sigue bajando — solo la púa no toca las cuerdas. Un video rápido del teléfono (o un espejo) muestra el movimiento claramente. |
| m6w2-s2 practice prompt: When you "skip" a strum in the D-DU-UDU pattern, what does your wrist do? | Cuando te "saltas" un rasgueo en el patrón D-DU-UDU, ¿qué hace tu muñeca? |
| m6w2-s2 practice choices: Stops completely / Keeps moving in the pendulum — the pick just misses the strings / Lifts up away from the guitar / Locks for a beat | Se detiene por completo / Sigue moviéndose en el péndulo — la púa solo falla las cuerdas / Se levanta lejos de la guitarra / Se bloquea por un tiempo |
| m6w2-s3 text: Accent beats 2 and 4 (the "backbeat") | Acentuar los tiempos 2 y 4 (el "contratiempo") |
| m6w2-s3 gotItWhen: when you strum the pattern, beats 2 and 4 are noticeably louder than 1 and 3 — and the song starts to feel like it has a built-in drumbeat. | cuando rasgueas el patrón, los tiempos 2 y 4 suenan notablemente más fuertes que el 1 y el 3 — y la canción empieza a sentirse como si tuviera un ritmo de batería incorporado. |
| m6w2-s3 practice label: Hear the backbeat — louder hits on 2 and 4 | Escucha el contratiempo — golpes más fuertes en el 2 y el 4 |
| m6w2-s4 text: Keep the D-DU-UDU pattern going through a chord change | Mantener el patrón D-DU-UDU a través de un cambio de acorde |
| m6w2-s4 gotItWhen: when you switch from G to D (or any two chords) the pattern doesn't change at all — only the chord underneath does. | cuando cambias de G a D (o cualquier par de acordes) el patrón no cambia en absoluto — solo cambia el acorde debajo. |
| m6w2-s5 text: Apply the D-DU-UDU pattern to a verse of a real song | Aplicar el patrón D-DU-UDU a la estrofa de una canción real |
| m6w2-s5 gotItWhen: you can play the verse of "I'm Yours" or "Oye Mi Amor" with the D-DU-UDU pattern from start to finish — even if a chord is imperfect, the pattern holds. | puedes tocar la estrofa de "I'm Yours" u "Oye Mi Amor" con el patrón D-DU-UDU de principio a fin — incluso si un acorde no sale perfecto, el patrón se mantiene. |
| m6w2-s5 practice label: "I'm Yours" verse roots (G · D · Em · C) | Raíces de la estrofa de "I'm Yours" (G · D · Em · C) |
| m6w2-s6 text: Read a strum-pattern chart (D/U arrows or symbols) | Leer un diagrama de patrón de rasgueo (flechas o símbolos D/U) |
| m6w2-s6 gotItWhen: you can look at a written-out strum pattern (e.g., "↓ ↓↑ ↑↓↑") and play it correctly the first time, without someone demonstrating it. | puedes mirar un patrón de rasgueo escrito (p. ej., "↓ ↓↑ ↑↓↑") y tocarlo correctamente la primera vez, sin que alguien lo demuestre. |
| m6w2-s6 practice prompt: In strum notation, what does the symbol "↑" mean? | En la notación de rasgueo, ¿qué significa el símbolo "↑"? |
| m6w2-s6 practice choices: Strum up (toward the ceiling, away from the floor) / Strum down / Mute the strings / Hold the chord | Rasguear hacia arriba (hacia el techo, lejos del suelo) / Rasguear hacia abajo / Silenciar las cuerdas / Sostener el acorde |

### Set 3

| English | Spanish |
|---|---|
| unit: Module 6 · Strumming Patterns with Chords | Módulo 6 · Patrones de rasgueo con acordes |
| subtitle: Multiple strum patterns · Folk, rock, reggae styles · Choosing the right groove | Varios patrones de rasgueo · Estilos folk, rock, reggae · Elegir el groove correcto |
| skillFocus: Playing different strum styles · Matching a pattern to the song · Switching patterns mid-song | Tocar distintos estilos de rasgueo · Ajustar un patrón a la canción · Cambiar de patrón a mitad de la canción |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Compare reggae and rock feels | Compara las sensaciones de reggae y rock |
| Section title: Refresh the C chord | Repasa el acorde C |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — try three styles | Estación de práctica — prueba tres estilos |
| Section title: Warm-up — tune + a quick pass through all three feels (recall) | Calentamiento — afina y repasa rápido las tres sensaciones (repaso) |
| Section title: Play a folk strum | Toca un rasgueo folk |
| Section title: Play a rock strum | Toca un rasgueo rock |
| Section title: Play a reggae strum | Toca un rasgueo reggae |
| Section title: Switch the feel mid-song (your assessment piece) | Cambia la sensación a mitad de la canción (tu pieza de evaluación) |
| Section title: Solo over the groove with Pentatonic Pattern 1 | Improvisa sobre el groove con el Patrón Pentatónico 1 |
| Section title: Take It to a Song | Llévalo a una canción |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: Learn ANY Strumming Pattern with this Exercise – JustinGuitar (0:00–4:00). Your task while you watch: pick ONE pattern he shows and tap it on your leg until you can keep it going without looking. | Mira: Learn ANY Strumming Pattern with this Exercise – JustinGuitar (0:00–4:00). Tu tarea mientras miras: elige UN patrón de los que muestra y márcalo en tu pierna hasta que puedas mantenerlo sin mirar. |
| hint: Notice how each pattern Justin demonstrates has a different feel — folk feels gentle, rock feels driving, reggae feels bouncy. The pattern is the GENRE in many cases. | Fíjate en cómo cada patrón que Justin demuestra tiene una sensación distinta — el folk se siente suave, el rock se siente impulsor, el reggae se siente rebotante. El patrón ES el género en muchos casos. |
| response prompt: Which strum-pattern feature most defines REGGAE rhythm? | ¿Qué característica del patrón de rasgueo define más al ritmo de REGGAE? |
| response explain: Reggae lives on the offbeat — crisp upstrokes on the "+" of each beat while the downbeats stay empty. That offbeat chop — reggae players call it the "skank" — is what makes reggae sound like reggae. | El reggae vive en el contratiempo — golpes hacia arriba nítidos en el "+" de cada tiempo mientras los tiempos fuertes quedan vacíos. Ese "picoteo" en el contratiempo — los músicos de reggae lo llaman "skank" — es lo que hace que el reggae suene a reggae. |
| response choices: Loud downstrokes on beat 1 / Upstrokes on the "+" (and) of each beat, with the downstrokes skipped / Strumming only on beat 4 / Fast, constant 16th-note strumming throughout | Golpes fuertes hacia abajo en el tiempo 1 / Golpes hacia arriba en el "+" (y) de cada tiempo, saltándose los golpes hacia abajo / Rasguear solo en el tiempo 4 / Rasgueo rápido y constante de semicorcheas todo el tiempo |
| text: Watch: Best Strumming Exercise For Beginners and Improvers – Andy Guitar — a different teacher's method for building ANY pattern. Strum along with his exercise in real time, and notice how his approach differs from Justin's in the first video. | Mira: Best Strumming Exercise For Beginners and Improvers – Andy Guitar — el método de un maestro distinto para construir CUALQUIER patrón. Rasguea junto con su ejercicio en tiempo real, y fíjate en cómo su enfoque difiere del de Justin en el primer video. |
| hint: There is no single "correct" pattern for a song — listen to the original recording and feel which fits. Andy's exercise builds the control to play whichever one you choose. | No hay un único patrón "correcto" para una canción — escucha la grabación original y siente cuál encaja. El ejercicio de Andy construye el control para tocar el que elijas. |
| response placeholder: Pick a song you like. Describe the strum pattern in your own words — is it gentle, driving, choppy? What gives it that feel? | Elige una canción que te guste. Describe el patrón de rasgueo con tus propias palabras — ¿es suave, impulsor, entrecortado? ¿Qué le da esa sensación? |

**Station B — Compare reggae and rock feels**

| English | Spanish |
|---|---|
| text: Compare two recordings: "Three Little Birds" (Bob Marley — reggae) and "Bad Moon Rising" (CCR — rock). Same speed-ish, very different feel. What makes the difference? | Compara dos grabaciones: "Three Little Birds" (Bob Marley — reggae) y "Bad Moon Rising" (CCR — rock). Velocidad parecida, sensación muy distinta. ¿Qué hace la diferencia? |
| hint: It's almost entirely the strum pattern. Reggae emphasizes the offbeats (the "+"); rock emphasizes the downbeats (the numbers). | Es casi por completo el patrón de rasgueo. El reggae enfatiza los contratiempos (el "+"); el rock enfatiza los tiempos fuertes (los números). |
| response placeholder: In one sentence: what is the biggest difference between the reggae strum and the rock strum? | En una oración: ¿cuál es la mayor diferencia entre el rasgueo de reggae y el de rock? |

**Station B — Refresh the C chord**

| English | Spanish |
|---|---|
| text: The progressions today lean on <strong>C</strong> — your shape from Module 5, back again. Form it from the diagram and strum the top five strings (the low E is muted) until it rings clean. | Las progresiones de hoy se apoyan en <strong>C</strong> — tu forma del Módulo 5, de vuelta. Fórmala a partir del diagrama y rasguea las cinco cuerdas más agudas (la Mi grave está silenciada) hasta que suene limpio. |
| hint: C skips the lowest string (the X on string 6). Your ring finger reaches to the 3rd fret of the A string — a big stretch at first. | C se salta la cuerda más grave (la X en la cuerda 6). Tu dedo anular se estira hasta el traste 3 de la cuerda La — un gran estiramiento al principio. |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: of the three feels you tried — folk, rock, reggae — which was hardest to make sound convincing on your guitar, and what gave it away as "not quite right"? | Cierre de la estación — pausa y piensa: de las tres sensaciones que probaste — folk, rock, reggae — ¿cuál fue la más difícil de hacer sonar convincente en tu guitarra, y qué la delataba como "no del todo correcta"? |
| response placeholder: e.g. reggae — my offbeat upstrokes were too heavy, so it sounded like rock with gaps | p. ej. reggae — mis golpes hacia arriba en el contratiempo eran demasiado pesados, así que sonaba como rock con huecos |

**Station C — Warm-up — tune + a quick pass through all three feels (recall)**

| English | Spanish |
|---|---|
| text: Tune to green, then on a G chord play 2 bars each of: steady down-up (folk), heavy down-up (rock), and up-only on the "+" (reggae). You've got it when: in tune and your hand remembers all three feels before you refine them. | Afina hasta que esté en verde, y luego con un acorde G toca 2 compases de cada uno: abajo-arriba constante (folk), abajo-arriba pesado (rock), y solo arriba en el "+" (reggae). Lo tienes cuando: estás afinado y tu mano recuerda las tres sensaciones antes de refinarlas. |
| hint: A quick 60-second pass through all three styles wakes up the patterns you'll polish this set. | Un repaso rápido de 60 segundos por los tres estilos despierta los patrones que vas a pulir en esta unidad. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Play a folk strum**

| English | Spanish |
|---|---|
| text: Challenge 1 — Folk Feel: hold G and strum all downstrokes, one per beat, at 70 BPM — quiet and steady, singalong style. You've got it when: even, soft, supportive strumming with no accents sticking out.<div class="strum-line">D       D       D       D<span class="su-count">1   +   2   +   3   +   4   +</span></div> | Reto 1 — Sensación folk: sostén G y rasguea todo hacia abajo, uno por tiempo, a 70 BPM — tranquilo y constante, estilo para cantar junto. Lo tienes cuando: un rasgueo parejo, suave, que acompaña, sin acentos que sobresalgan.<div class="strum-line">D       D       D       D<span class="su-count">1   +   2   +   3   +   4   +</span></div> |
| hint: Folk is about supporting the singer, not standing out. Soft attack, even volume, no accents. | El folk se trata de acompañar al cantante, no de sobresalir. Ataque suave, volumen parejo, sin acentos. |
| stuck: Strum from the wrist only and let the pick barely graze the strings — imagine someone is singing and you must not cover them up. | Rasguea solo desde la muñeca y deja que la púa apenas roce las cuerdas — imagina que alguien está cantando y no debes taparlo. |
| levelUp: Add a gentle up-strum on the "+" of beats 2 and 4 for a fuller singalong feel. | Agrega un golpe suave hacia arriba en el "+" de los tiempos 2 y 4 para una sensación más completa de canto en grupo. |

**Station C — Play a rock strum**

| English | Spanish |
|---|---|
| text: Challenge 2 — Rock Feel: same G at the same tempo, but strum harder into the strings — heavy down-up-down-up accenting every down. You've got it when: a thick, driving sound using arm weight, not just wrist.<div class="strum-line">D   U   D   U   D   U   D   U<span class="su-count">1   +   2   +   3   +   4   +</span></div> | Reto 2 — Sensación rock: el mismo G al mismo tempo, pero rasguea más fuerte hacia las cuerdas — abajo-arriba-abajo-arriba pesado acentuando cada golpe hacia abajo. Lo tienes cuando: un sonido grueso e impulsor usando el peso del brazo, no solo la muñeca.<div class="strum-line">D   U   D   U   D   U   D   U<span class="su-count">1   +   2   +   3   +   4   +</span></div> |
| hint: Rock strumming uses arm weight more than wrist. Let the pick go deeper into the strings. Aim for a thick, heavy sound. | El rasgueo de rock usa el peso del brazo más que la muñeca. Deja que la púa se hunda más en las cuerdas. Apunta a un sonido grueso y pesado. |
| stuck: Strum from the elbow, not just the wrist — rock needs weight. Keep the accents on the downs and let the ups stay light. | Rasguea desde el codo, no solo desde la muñeca — el rock necesita peso. Mantén los acentos en los golpes hacia abajo y deja los golpes hacia arriba ligeros. |
| levelUp: Push to 90 BPM, or palm-mute the low strings — rest the side of your strumming hand on them — for a tighter chug (a short, muted, punchy strum). | Sube a 90 BPM, o silencia con la palma las cuerdas graves — apoya el borde de tu mano de rasgueo sobre ellas — para un chug (un rasgueo corto, silenciado y contundente) más ajustado. |

**Station C — Play a reggae strum**

| English | Spanish |
|---|---|
| text: Challenge 3 — Reggae Chop, a short, quick, muted upstroke (try it!): hold G, skip every downbeat, and strum UP only on each "+" — rest-up-rest-up. No score — play along with "Three Little Birds" to lock in the offbeat feel.<div class="strum-line">·   U   ·   U   ·   U   ·   U<span class="su-count">1   +   2   +   3   +   4   +</span></div> | Reto 3 — Picoteo reggae, un golpe hacia arriba corto, rápido y silenciado (¡pruébalo!): sostén G, sáltate cada tiempo fuerte, y rasguea hacia ARRIBA solo en cada "+" — silencio-arriba-silencio-arriba. Sin puntaje — toca junto con "Three Little Birds" para afianzar la sensación de contratiempo.<div class="strum-line">·   U   ·   U   ·   U   ·   U<span class="su-count">1   +   2   +   3   +   4   +</span></div> |
| hint: Counter-intuitive at first — your hand goes down on the beats but doesn't hit the strings. Listen to "Three Little Birds" while you do this to lock in the feel. | Contraintuitivo al principio — tu mano baja en los tiempos pero no toca las cuerdas. Escucha "Three Little Birds" mientras haces esto para afianzar la sensación. |
| stuck: Keep your hand swinging down on every number, but lift the pick away so it only catches the strings on the way back up. Count "rest-UP-rest-UP" out loud. | Mantén tu mano bajando en cada número, pero levanta la púa para que solo enganche las cuerdas en el camino de vuelta hacia arriba. Cuenta "silencio-ARRIBA-silencio-ARRIBA" en voz alta. |
| levelUp: Mute with your fretting hand right after each up-strum for the crisp, clipped "chk" of a real reggae chop. | Silencia con tu mano de trastear justo después de cada golpe hacia arriba para lograr el "chk" nítido y cortado de un verdadero picoteo reggae. |
| playSeq label: Hear the backing root — chop your offbeat over it | Escucha la raíz de fondo — pica tu contratiempo sobre ella |

**Station C — Switch the feel mid-song (your assessment piece)**

| English | Spanish |
|---|---|
| text: Challenge 4 — Two Feels, One Song (your assessment piece): take G–D–Em–C and play 8 bars folk, then switch to rock for 8 bars — same chords, two clearly different feels, no break at the switch. Set the ⏱ Timer for 3 minutes and loop it. | Reto 4 — Dos sensaciones, una canción (tu pieza de evaluación): toma G–D–Em–C y toca 8 compases estilo folk, y luego cambia a rock durante 8 compases — mismos acordes, dos sensaciones claramente distintas, sin interrupción en el cambio. Pon el ⏱ Temporizador en 3 minutos y repítelo. |
| hint: The switch is the skill. Change the feel on the downbeat of a new bar so the transition lands cleanly. | El cambio es la destreza. Cambia la sensación en el tiempo fuerte de un compás nuevo para que la transición caiga limpia. |
| stuck: Keep the chords and tempo identical — change ONLY your strum hand. Drill just the 2-bar seam where folk becomes rock until it's smooth. | Mantén los acordes y el tempo idénticos — cambia SOLO tu mano de rasgueo. Practica solo la costura de 2 compases donde el folk se vuelve rock hasta que salga fluido. |
| levelUp: Add reggae as a third 8-bar section, or switch feels every 4 bars instead of every 8. | Agrega el reggae como una tercera sección de 8 compases, o cambia de sensación cada 4 compases en lugar de cada 8. |
| response prompt: Which two feels did you switch between, and on which song would you use them? | ¿Entre qué dos sensaciones cambiaste, y en qué canción las usarías? |
| response placeholder: e.g. folk verse → rock chorus on "Bad Moon Rising" | p. ej. estrofa folk → coro rock en "Bad Moon Rising" |
| playSeq label: G · D · Em · C progression (try each feel) | Progresión G · D · Em · C (prueba cada sensación) |

**Station C — Solo over the groove with Pentatonic Pattern 1**

| English | Spanish |
|---|---|
| text: Challenge 5 — Trade Off (try it!): loop the backing roots below — or record yourself strumming 8 bars of a progression (try Am–G–C or G–D–Em–C) with any pattern from this module — then solo over it using Pentatonic Pattern 1 from Module 4. Take turns with yourself every 8 bars: strum one pass, then solo over the next. Got another guitarist around? One strums, one solos, swap after 8 bars. No score — aim for one clear musical idea, not a flurry of notes. | Reto 5 — Intercambio (¡pruébalo!): repite las raíces de fondo de abajo — o grábate rasgueando 8 compases de una progresión (prueba Am–G–C o G–D–Em–C) con cualquier patrón de este módulo — y luego improvisa sobre ella usando el Patrón Pentatónico 1 del Módulo 4. Túrnate contigo mismo cada 8 compases: rasguea un pase, y luego improvisa en el siguiente. ¿Tienes a otro guitarrista cerca? Uno rasguea, uno improvisa, cambien después de 8 compases. Sin puntaje — apunta a una idea musical clara, no a una ráfaga de notas. |
| hint: Am–G–C fits A minor pentatonic; a major-key progression fits major pentatonic. This is the reward: the scale you learned in Module 4 lives on top of the chords you strum here. Leave space — silence is part of a solo. | Am–G–C encaja con la pentatónica menor de A; una progresión en tono mayor encaja con la pentatónica mayor. Esta es la recompensa: la escala que aprendiste en el Módulo 4 vive encima de los acordes que rasgueas aquí. Deja espacio — el silencio es parte de un solo. |
| playSeq label: Backing roots — Am · G · C | Raíces de fondo — Am · G · C |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Watchtower, two ways: play Am · G · F with a soft folk strum for 8 bars, then the same loop rock-style — strum harder, accent the downs — for 8 bars, no break at the switch. You've got it when: on a quick recording of yourself you can hear the exact bar the feel changed — Dylan's version becoming Hendrix's, live from your chair. 🧵 Song Journey: five layers deep and still growing. | Reto — Watchtower, de dos formas: toca Am · G · F con un rasgueo folk suave durante 8 compases, y luego el mismo loop estilo rock — rasguea más fuerte, acentúa los golpes hacia abajo — durante 8 compases, sin interrupción en el cambio. Lo tienes cuando: en una grabación rápida de ti mismo puedes escuchar el compás exacto donde cambió la sensación — la versión de Dylan volviéndose la de Hendrix, en vivo desde tu silla. 🧵 Recorrido de la canción: cinco capas de profundidad y sigue creciendo. |
| hint: You heard exactly this in Module 1 — acoustic Dylan vs. electric Hendrix. Same chords, same tempo; ONLY your strum hand changes. | Escuchaste exactamente esto en el Módulo 1 — Dylan acústico vs. Hendrix eléctrico. Mismos acordes, mismo tempo; SOLO tu mano de rasgueo cambia. |
| stuck: Make the switch on beat 1 of a new bar and drill just the 2-bar seam where folk becomes rock. | Haz el cambio en el tiempo 1 de un compás nuevo y practica solo la costura de 2 compases donde el folk se vuelve rock. |
| levelUp: Add the reggae chop as a third 8-bar section — three eras of the same song. | Agrega el picoteo reggae como una tercera sección de 8 compases — tres épocas de la misma canción. |
| response prompt: Which feel suited Watchtower better to your ear — folk or rock — and why? | ¿Qué sensación le quedó mejor a Watchtower para tu oído — folk o rock — y por qué? |
| response placeholder: e.g. rock — the accents make the loop feel dangerous | p. ej. rock — los acentos hacen que el loop se sienta peligroso |
| text: Challenge — Three Little Birds, reggae chop: play A · D · E with up-strums only on the "+", one bar each at 70 BPM. You've got it when: two laps where every hit is an offbeat — then play along with the record and disappear into it. | Reto — Three Little Birds, picoteo reggae: toca A · D · E con golpes hacia arriba solo en el "+", un compás cada uno a 70 BPM. Lo tienes cuando: dos vueltas donde cada golpe es un contratiempo — y luego toca junto con la grabación y piérdete en ella. |
| hint: Your hand still travels down on every number — the pick just misses on purpose. The record is your metronome here; Marley's band never rushes. | Tu mano sigue bajando en cada número — la púa solo falla a propósito. La grabación es tu metrónomo aquí; la banda de Marley nunca se apura. |
| stuck: Mute the strings and chop the offbeat rhythm alone until it feels natural, then add the chords. | Silencia las cuerdas y pica el ritmo del contratiempo solo hasta que se sienta natural, y luego agrega los acordes. |
| levelUp: Clip each up-strum short with a quick fretting-hand mute — the crisp "chk" of a real reggae chop. | Corta cada golpe hacia arriba con un silenciado rápido de la mano de trastear — el "chk" nítido de un verdadero picoteo reggae. |

**Set 3 — Skills**

| English | Spanish |
|---|---|
| m6w3-s1 text: Play a folk strum (gentle, even all-downstrokes or simple down-up) | Tocar un rasgueo folk (suave, parejo, todo hacia abajo o abajo-arriba simple) |
| m6w3-s1 gotItWhen: you can play a chord progression with even, soft downstrokes that supports a singer — no accents, no aggressive attack. | puedes tocar una progresión de acordes con golpes hacia abajo parejos y suaves que acompañan a un cantante — sin acentos, sin ataque agresivo. |
| m6w3-s2 text: Play a rock strum (heavy downstrokes with accent and weight) | Tocar un rasgueo rock (golpes hacia abajo pesados con acento y peso) |
| m6w3-s2 gotItWhen: your rock strum has clear weight and drive — play back a quick recording and you can hear that you mean it. | tu rasgueo de rock tiene peso e impulso claros — reproduce una grabación rápida y puedes escuchar que lo dices en serio. |
| m6w3-s3 text: Play a reggae strum (upstrokes on the "+", downstrokes skipped) | Tocar un rasgueo reggae (golpes hacia arriba en el "+", golpes hacia abajo omitidos) |
| m6w3-s3 gotItWhen: you can play a reggae chop where ONLY the upstrokes hit the strings — your hand still moves on the beats, but the pick misses on purpose. | puedes tocar un picoteo reggae donde SOLO los golpes hacia arriba tocan las cuerdas — tu mano sigue moviéndose en los tiempos, pero la púa falla a propósito. |
| m6w3-s3 practice prompt: In a reggae offbeat strum, the strings are hit on which counts? | En un rasgueo de contratiempo reggae, ¿en cuáles tiempos se tocan las cuerdas? |
| m6w3-s3 practice choices: 1, 2, 3, 4 (the numbers) / The "+" of each beat (between numbers) / Only beat 1 / Continuously | 1, 2, 3, 4 (los números) / El "+" de cada tiempo (entre números) / Solo el tiempo 1 / Continuamente |
| m6w3-s4 text: Choose a strum pattern that matches a song's style | Elegir un patrón de rasgueo que se ajuste al estilo de una canción |
| m6w3-s4 gotItWhen: you can put on any new song, listen for 15 seconds, and pick a strum pattern that fits — without a tutorial telling you what to play. | puedes poner cualquier canción nueva, escuchar 15 segundos, y elegir un patrón de rasgueo que encaje — sin que un tutorial te diga qué tocar. |
| m6w3-s4 practice prompt: You hear a song with a slow, gentle, acoustic feel and a singer-songwriter vibe. Which strum suits it best? | Escuchas una canción con una sensación lenta, suave, acústica y un aire de cantautor. ¿Qué rasgueo le queda mejor? |
| m6w3-s4 practice choices: Heavy rock chops on every downstroke / Reggae offbeat upstrokes / Gentle folk strum (soft down-up) / No strum at all | Golpes pesados de rock en cada golpe hacia abajo / Golpes hacia arriba de contratiempo reggae / Rasgueo folk suave (abajo-arriba suave) / Sin rasgueo alguno |
| m6w3-s5 text: Switch strum patterns mid-song (e.g., verse vs. chorus) | Cambiar de patrón de rasgueo a mitad de la canción (p. ej., estrofa vs. coro) |
| m6w3-s5 gotItWhen: you can play 8 bars of one pattern, then switch cleanly to a different pattern for the next 8 bars — without losing the beat at the transition. | puedes tocar 8 compases de un patrón, y luego cambiar limpiamente a un patrón distinto durante los siguientes 8 compases — sin perder el tiempo en la transición. |
| m6w3-s6 text: Play 2+ different patterns over the same chord progression | Tocar 2 o más patrones distintos sobre la misma progresión de acordes |
| m6w3-s6 gotItWhen: you can take G–D–Em–C and play it two different ways (e.g., folk then rock) and the two versions actually sound like different songs. | puedes tomar G–D–Em–C y tocarlo de dos formas distintas (p. ej., folk y luego rock) y las dos versiones en verdad suenan como canciones diferentes. |
| m6w3-s6 practice label: G · D · Em · C progression (try with each style) | Progresión G · D · Em · C (prueba con cada estilo) |

### Module-level Songs

MODULE_SONGS[6] meta fields (song title shown for reference, not itself translated on the site).

| English | Spanish |
|---|---|
| "Brown Eyed Girl" — Van Morrison — meta: G–C–G–D · classic 8th-note down-up strum | G–C–G–D · rasgueo clásico de corcheas abajo-arriba |
| "All Along the Watchtower" — Dylan / Hendrix — meta: Am–G–F–G · steady down-up over chord changes | Am–G–F–G · abajo-arriba constante a través de cambios de acorde |
| "Knockin' on Heaven's Door" — Dylan — meta: G–D–Am–C · slow tempo, perfect for first strum patterns | G–D–Am–C · tempo lento, perfecto para los primeros patrones de rasgueo |
| "Happy Birthday" — meta: Apply D-DU-UDU to C–G–Am–F arrangement | Aplica D-DU-UDU al arreglo C–G–Am–F |
| "I'm Yours" — Jason Mraz — meta: G–D–Em–C · iconic D-DU-UDU strum | G–D–Em–C · rasgueo icónico D-DU-UDU |
| "Three Little Birds" — Bob Marley — meta: A–D–E · classic reggae offbeat strum | A–D–E · rasgueo clásico de contratiempo reggae |
| "Bad Moon Rising" — CCR — meta: D–A–G · driving rock-style strum | D–A–G · rasgueo impulsor estilo rock |
| "Let It Be" — The Beatles — meta: C–G–Am–F · slow, even pattern | C–G–Am–F · patrón lento y parejo |
| "Oye Mi Amor" — Maná — meta: Syncopated Latin strum on the verse · Bm (partial barre)–G | Rasgueo latino sincopado en la estrofa · Bm (cejilla parcial)–G |
| "Tu Boda" — Oscar Maydon × Fuerza Regida — meta: Corrido / sierreño strum · current Spanish-language style | Rasgueo de corrido / sierreño · estilo actual en español |
| "Wonderwall" — Oasis — meta: Em7–G–D–C · classic strum pattern with accents | Em7–G–D–C · patrón de rasgueo clásico con acentos |
| "Wagon Wheel" — Old Crow Medicine Show — meta: G–D–Em–C · folk strum classic | G–D–Em–C · clásico rasgueo folk |
| "Buffalo Soldier" — Bob Marley — meta: Bm–G–D–A · reggae offbeat practice | Bm–G–D–A · práctica de contratiempo reggae |

### Module Review

| English | Spanish |
|---|---|
| module: Strumming Patterns with Chords | Patrones de rasgueo con acordes |
| skill mr6-s1: I can hold a steady down-up strum pattern (play it cleanly at 60 BPM, then try 70) | Puedo mantener un patrón de rasgueo abajo-arriba constante (tocarlo limpio a 60 BPM, y luego intentar 70) |
| skill mr6-s3: I can keep my strum hand moving right through a chord change | Puedo mantener mi mano de rasgueo en movimiento a través de un cambio de acorde |
| skill mr6-s4: I can play the D-DU-UDU pattern and accent beats 2 and 4 | Puedo tocar el patrón D-DU-UDU y acentuar los tiempos 2 y 4 |
| skill mr6-s5: I can read a written strum pattern (D/U over "1 + 2 + 3 + 4 +") and play it | Puedo leer un patrón de rasgueo escrito (D/U sobre "1 + 2 + 3 + 4 +") y tocarlo |
| skill mr6-s2: I can play 2+ different strum patterns over the same chord progression | Puedo tocar 2 o más patrones de rasgueo distintos sobre la misma progresión de acordes |
| skill mr6-s6: I can switch strum styles mid-song without dropping the beat | Puedo cambiar de estilo de rasgueo a mitad de la canción sin perder el tiempo |
| assessItem: Play Em for 4 bars, then Am for 4 bars, with a non-stop down-up strum at 60 BPM | Toca Em durante 4 compases, y luego Am durante 4 compases, con un rasgueo abajo-arriba sin interrupciones a 60 BPM |
| assessItem: Take G–D–Em–C and play it two ways — folk, then rock — switching feel with no break at the seam | Toma G–D–Em–C y tócalo de dos formas — folk, y luego rock — cambiando la sensación sin interrupción en la costura |
| forward: Module 7 is the <strong>barre-chord</strong> module — and every steady strum hand you just built is what carries you through it. The rhythm keeps going even while your fretting hand fights the hardest shapes in the course. The groove you own now is what makes a clamped, buzzy first barre still sound like music. | El Módulo 7 es el módulo de <strong>acordes con cejilla</strong> — y cada mano de rasgueo estable que acabas de construir es lo que te lleva a través de él. El ritmo sigue adelante incluso mientras tu mano de trastear lucha con las formas más difíciles del curso. El groove que ahora dominas es lo que hace que una primera cejilla apretada y con zumbido siga sonando a música. |
