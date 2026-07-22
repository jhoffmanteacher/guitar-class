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
| double-stop (two notes played together) | doble nota / dobles notas |
| sub-barre (ring-finger mini-barre inside a full barre shape) | sub-cejilla |
| fingerpicking / fingerstyle | fingerpicking / fingerstyle (kept — same loanword treatment as riff/vamp/chug) |
| Travis picking (named technique) | Travis picking (kept as-is) |
| pinch (thumb+finger plucked together) | pellizco / pellizcar |
| alternating bass | bajo alternante |
| rest stroke / free stroke (classical plucking technique) | apoyando (toque de apoyo) / tirando (toque libre) — the authentic Spanish-origin terms |
| capo (the physical device) | capo (kept — distinct from "cejilla", the barre technique) |
| octave shape (fretboard-mapping shortcut) | forma de octava |
| B-string bump (half-step tuning offset when an octave shape crosses onto the B/high-e string) | el desfase de la cuerda B |
| whole step / half step | tono / semitono |
| transpose / transposing | transponer / transposición |
| relative minor / relative major (relative key) | relativa menor / relativa mayor (la relativa) |
| parallel minor | la paralela menor |
| lick (short solo phrase) | lick (kept — same loanword treatment as riff/vamp/chug) |
| key (musical key, e.g. "key of C") | tonalidad |
| triad | tríada |
| slash chord | acorde con bajo alterno |
| home chord (the tonic chord, e.g. the I) | acorde base (pairs with "home note" → "nota base") |
| E-shape / A-shape (barre chord) | forma de E / forma de A |
| quick change (12-bar blues variant) | cambio rápido |
| comp / comping (backing chords while another solos) | acompañar / acompañamiento |
| chorus (blues: one full 12-bar cycle) | ronda |
| shuffle (rhythmic feel) | shuffle (kept — same loanword treatment as groove/chug/vamp) |
| chord family | familia de acordes |
| diatonic | diatónico/a |
| waltz (named 3/4 style/feel) | vals |
| downbeat (first/strongest beat of a bar) | tiempo fuerte |
| fill (short extra run between main parts) | relleno |
| roll (fingerpicked ascending run through a chord) | floreo |

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

## Module 7 — TAB Notation and Barre Chords

### Set 1

| English | Spanish |
|---|---|
| unit: Module 7 · TAB Notation and Barre Chords | Módulo 7 · Notación TAB y acordes con cejilla |
| subtitle: Multi-line TAB · Rhythm in TAB · Riffs that mix notes and chords | TAB de varias líneas · Ritmo en el TAB · Riffs que combinan notas y acordes |
| skillFocus: Reading multi-line TAB and rhythm symbols · Playing slides, hammer-ons, and pull-offs · Playing a riff of notes and chords | Leer TAB de varias líneas y símbolos de ritmo · Tocar deslizamientos, hammer-ons y pull-offs · Tocar un riff de notas y acordes |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch: reading TAB and your riff | Mira: leer TAB y tu riff |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — riffs from TAB | Estación de práctica — riffs desde el TAB |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Read a riff with stacked TAB (double-stops) | Lee un riff con TAB apilado (dobles notas) |
| Section title: Read rhythm in TAB | Lee el ritmo en el TAB |
| Section title: Find & read a TAB on your own | Encuentra y lee un TAB por tu cuenta |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Station Wrap-Up | Cierre de la estación |
| Section title: Play hammer-ons, pull-offs & slides (h / p / /) | Toca hammer-ons, pull-offs y deslizamientos (h / p / /) |

**Station B — Watch: reading TAB and your riff**

| English | Spanish |
|---|---|
| text: Watch: How To Read TAB and Chord Boxes (BC-108) – JustinGuitar (0:00–4:00). | Mira: How To Read TAB and Chord Boxes (BC-108) – JustinGuitar (0:00–4:00). |
| hint: You've read single-note TAB since Module 1. Watch for two new things now. First: numbers STACKED vertically mean play them together (a chord). Second: the symbols above the numbers tell you how long each note lasts — plain stems are quarter notes, flags and beams are 8th notes, and a hollow (open) note head with a stem is a half note, held for two beats. | Has leído TAB de una sola nota desde el Módulo 1. Ahora fíjate en dos cosas nuevas. Primero: los números APILADOS verticalmente significan que se tocan juntos (un acorde). Segundo: los símbolos arriba de los números indican cuánto dura cada nota — las plicas simples son negras (un tiempo), las banderas y barras son corcheas, y una cabeza de nota hueca (abierta) con plica es una blanca, sostenida por dos tiempos. |
| response prompt: When two or more numbers in a TAB line up VERTICALLY on top of each other, you should: | Cuando dos o más números en un TAB se alinean VERTICALMENTE uno encima del otro, debes: |
| response explain: Stacked numbers are a chord — strike those strings together in one motion. Numbers spread left-to-right are played one after another. | Los números apilados son un acorde — golpea esas cuerdas juntas en un solo movimiento. Los números repartidos de izquierda a derecha se tocan uno tras otro. |
| response choices: Play them at the same time (as a chord) / Play them one after another, lowest first / Play only the lowest-numbered string / Roll across them slowly, one note at a time | Tocarlos al mismo tiempo (como un acorde) / Tocarlos uno tras otro, empezando por el número más bajo / Tocar solo la cuerda con el número más bajo / Recorrerlos lentamente, una nota a la vez |
| text: Watch: Smoke On The Water Guitar Lesson – Marty Music (0:00–4:00). This is the riff you'll learn in the Practice station. | Mira: Smoke On The Water Guitar Lesson – Marty Music (0:00–4:00). Este es el riff que vas a aprender en la estación de práctica. |
| hint: Notice that the riff uses 2-note "power chord" intervals played together — perfect example of stacked TAB numbers. | Fíjate que el riff usa intervalos de "acorde de potencia" de 2 notas tocadas juntas — un ejemplo perfecto de números apilados en el TAB. |
| response prompt: The "Smoke on the Water" main riff uses which two strings most? | ¿Cuáles dos cuerdas usa más el riff principal de "Smoke on the Water"? |
| response explain: You'll play it as a two-note double-stop (two notes played at the same time) on the A and D strings (strings 5 and 4) — index and ring locked together as one unit. | Lo vas a tocar como una doble nota de dos notas (dos notas tocadas al mismo tiempo) en las cuerdas La y Re (cuerdas 5 y 4) — el índice y el anular trabados juntos como una sola unidad. |
| response choices: Strings 1 and 2 (high e and B) / Strings 6 and 5 (low E and A) / Strings 5 and 4 (A and D) / Strings 3 and 2 (G and B) | Cuerdas 1 y 2 (mi aguda y Si) / Cuerdas 6 y 5 (Mi grave y La) / Cuerdas 5 y 4 (La y Re) / Cuerdas 3 y 2 (Sol y Si) |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: TAB packs a lot into one line (which string, which fret, chord-or-melody, how long the note lasts). Which part still slows you down most when you sight-read a new riff? | Cierre de la estación — pausa y piensa: el TAB mete mucha información en una sola línea (qué cuerda, qué traste, acorde o melodía, cuánto dura la nota). ¿Qué parte todavía te frena más cuando lees a primera vista un riff nuevo? |
| response placeholder: e.g. the rhythm symbols — I can find the notes but not the timing | p. ej. los símbolos de ritmo — encuentro las notas pero no el tiempo |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Tuning (Module 1) is a skill you keep forever. Reading TAB today is faster when you also name the notes you land on — that's your Module 2 fretboard map. | Afinar (Módulo 1) es una destreza que conservas para siempre. Leer TAB hoy es más rápido cuando también nombras las notas donde caes — ese es tu mapa del diapasón del Módulo 2. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Read a riff with stacked TAB (double-stops)**

| English | Spanish |
|---|---|
| text: Challenge 1 — Smoke on the Water: play the main riff with index + ring locked as a unit on the A + D strings — 0/0 — 3/3 — 5/5 — 0/0 — 3/3 — 6/6 — 5/5. You've got it when: both notes ring at the same volume, clean through the whole riff. Use the TAB below. | Reto 1 — Smoke on the Water: toca el riff principal con el índice + el anular trabados como una unidad en las cuerdas La + Re — 0/0 — 3/3 — 5/5 — 0/0 — 3/3 — 6/6 — 5/5. Lo tienes cuando: ambas notas suenan al mismo volumen, limpias durante todo el riff. Usa el TAB de abajo. |
| hint: Use your index and ring finger together — keep them locked in shape and slide as a unit. Both notes should ring at the same volume. | Usa tu dedo índice y tu dedo anular juntos — mantenlos trabados en forma y deslízalos como una unidad. Ambas notas deben sonar al mismo volumen. |
| stuck: Lock the two fingers into one shape and move them as a block — don't re-place them each time. Get the 0/0 → 3/3 slide clean before adding the rest. | Traba los dos dedos en una sola forma y muévelos como un bloque — no los vuelvas a colocar cada vez. Logra que el deslizamiento 0/0 → 3/3 salga limpio antes de agregar el resto. |
| levelUp: Play it at 90 BPM, or add the higher part that answers the riff and closes the full version. | Tócalo a 90 BPM, o agrega la parte más aguda que responde al riff y cierra la versión completa. |
| response prompt: Personal record — play it cleanly at 70 BPM, then go +10 at a time. Your fastest CLEAN "Smoke" lap (one full time through the riff) today (BPM)? | Récord personal — tócalo limpio a 70 BPM, y luego sube de 10 en 10. ¿Tu vuelta LIMPIA más rápida de "Smoke" (una vuelta = un recorrido completo del riff) hoy (BPM)? |
| response placeholder: e.g. 100 — try for a higher number next time | p. ej. 100 — intenta superarlo la próxima vez |
| tab caption: "Smoke on the Water" — main riff · A + D strings together | "Smoke on the Water" — riff principal · cuerdas La + Re juntas |

**Station C — Read rhythm in TAB**

| English | Spanish |
|---|---|
| text: Challenge 2 — Alternate-picking workout: play this riff on the low E and A strings with strict alternate picking — one stroke per note, alternating down-up. You've got it when: clean and even at 60 BPM before you speed it up. | Reto 2 — Ejercicio de púa alternada: toca este riff en las cuerdas Mi grave y La con púa alternada estricta — un golpe de púa por nota, alternando abajo-arriba. Lo tienes cuando: sale limpio y parejo a 60 BPM antes de acelerarlo. |
| hint: Use alternate picking (down-up-down-up). The riff is fast — start at 60 BPM and only speed up when it's clean. Set the ⏱ Timer for 2 minutes and loop it. | Usa púa alternada (abajo-arriba-abajo-arriba). El riff es rápido — empieza a 60 BPM y solo acelera cuando salga limpio. Pon el ⏱ Temporizador en 2 minutos y repítelo. |
| stuck: Drop to 50 BPM and keep strict down-up-down-up picking — even and slow is better than fast and sloppy. Loop just the first 4 notes until they're automatic. | Baja a 50 BPM y mantén la púa estricta abajo-arriba-abajo-arriba — parejo y lento es mejor que rápido y descuidado. Repite solo las primeras 4 notas hasta que salgan automáticas. |
| levelUp: Push to 80 BPM, or play it twice through with no stumble. | Sube a 80 BPM, o tócalo dos veces seguidas sin tropiezos. |
| tab caption: Alternate-picking workout riff · low E and A strings | Riff de ejercicio de púa alternada · cuerdas Mi grave y La |

**Station C — Find & read a TAB on your own**

| English | Spanish |
|---|---|
| text: Challenge 3 — Find a Riff (try it!): pick "Iron Man" or "Sunshine of Your Love", find a TAB online, and play through it once. No score — see which rhythm symbols you can spot above the numbers. | Reto 3 — Encuentra un riff (¡pruébalo!): elige "Iron Man" o "Sunshine of Your Love", encuentra un TAB en línea, y tócalo una vez de principio a fin. Sin puntaje — fíjate en qué símbolos de ritmo puedes reconocer arriba de los números. |
| hint: Most beginner TAB sites (Songsterr, Ultimate Guitar) show the rhythm. Look for the stem marks above each number. | La mayoría de los sitios de TAB para principiantes (Songsterr, Ultimate Guitar) muestran el ritmo. Busca las marcas de plica arriba de cada número. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Seven Nation Army, the real rhythm: you've played this riff since Module 1 — but always one even note per beat. Listen to the recording, find the riff's TAB with rhythm stems (Songsterr shows them clearly), and play it the way the record actually goes — long notes held, quick notes tucked between beats. You've got it when: you can play along with the record and stay locked with it. 🧵 Song Journey: the riff that started it all. | Reto — Seven Nation Army, el ritmo real: has tocado este riff desde el Módulo 1 — pero siempre con una nota pareja por tiempo. Escucha la grabación, encuentra el TAB del riff con plicas de ritmo (Songsterr las muestra con claridad), y tócalo como suena de verdad en la grabación — notas largas sostenidas, notas rápidas metidas entre los tiempos. Lo tienes cuando: puedes tocar junto con la grabación y mantenerte sincronizado con ella. 🧵 Recorrido de la canción: el riff que lo empezó todo. |
| hint: The frets haven't changed since Module 1 — only the rhythm reading is new. That's the whole point of this set: same notes, real music. | Los trastes no han cambiado desde el Módulo 1 — solo la lectura del ritmo es nueva. Ese es todo el punto de esta unidad: mismas notas, música real. |
| stuck: Clap the record's rhythm first, no guitar. Add the frets back only once your hands know the shape of the timing. | Aplaude el ritmo de la grabación primero, sin guitarra. Vuelve a agregar los trastes solo una vez que tus manos conozcan la forma del tiempo. |
| levelUp: Play it palm-muted (rest the side of your strumming hand on the strings for a muffled sound) for the verse and open for the chorus — rhythm AND dynamics (how loud or soft you play) from the same TAB. | Tócalo silenciado con la palma (apoya el borde de tu mano de rasgueo sobre las cuerdas para un sonido apagado) en la estrofa y abierto en el coro — ritmo Y dinámica (qué tan fuerte o suave tocas) desde el mismo TAB. |
| response prompt: What did the rhythm stems tell you that your ear had missed? | ¿Qué te dijeron las plicas de ritmo que tu oído se había perdido? |
| response placeholder: e.g. the last three notes are quicker than I'd been playing them | p. ej. las últimas tres notas son más rápidas de lo que las estaba tocando |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Which riff move tripped your fingers most today — a stretch, a string change, or the picking hand? Name it; that's your first loop next session. (Don't stop yet — one more section below!) | ¿Qué movimiento del riff te trabó más los dedos hoy — un estiramiento, un cambio de cuerda, o la mano de pulsar? Nómbralo; ese es tu primer loop la próxima sesión. (¡No te detengas todavía — falta una sección más abajo!) |
| response placeholder: e.g. the string jump from A to E in the workout riff | p. ej. el salto de cuerda de La a Mi en el riff de ejercicio |

**Station C — Play hammer-ons, pull-offs & slides (h / p / /)**

| English | Spanish |
|---|---|
| text: Challenge — Slur It Together: play this 2-bar lick (a short solo phrase) on the G string. Pick ONLY where the TAB shows a plain fret number — everywhere you see an h, p, or / , your fretting hand makes the note with no new pick (these are slurs: notes joined smoothly without picking each one). You've got it when: the hammered, pulled, and slid notes ring out just as loud as the ones you actually pick. | Reto — Únelo todo: toca este lick de 2 compases (una frase corta de solo) en la cuerda Sol. Pulsa SOLO donde el TAB muestre un número de traste normal — en todos los lugares donde veas una h, una p, o una /, tu mano de trastear hace la nota sin pulsar de nuevo (estas son ligaduras: notas unidas suavemente sin pulsar cada una). Lo tienes cuando: las notas de hammer-on, pull-off y deslizamiento suenan tan fuerte como las que sí pulsas. |
| hint: Hammer-on (h7): pick the 5, then slam your ring finger down onto the 7 — the string keeps ringing, no pick. Pull-off (p5): from the 7, flick that same finger off sideways so the already-fretted 5 sounds. Slide (/9): pick the 7 and slide the finger up to the 9 without lifting off. Tap ▶ on the TAB to hear the target. | Hammer-on (h7): pulsa el 5, y luego golpea tu dedo anular sobre el 7 — la cuerda sigue sonando, sin pulsar. Pull-off (p5): desde el 7, saca ese mismo dedo hacia el costado de un tirón para que suene el 5 que ya estaba trasteado. Deslizamiento (/9): pulsa el 7 y desliza el dedo hasta el 9 sin levantarlo. Toca ▶ en el TAB para escuchar el objetivo. |
| stuck: Drill (practice over and over) one move at a time. Hammer 5→7 twenty times until the hammered note is as loud as the picked one — that's finger strength and it comes fast. Then the pull-off, then the slide. | Ejercita (practica una y otra vez) un movimiento a la vez. Haz el hammer-on 5→7 veinte veces hasta que la nota martillada suene tan fuerte como la pulsada — eso es fuerza de dedo y llega rápido. Luego el pull-off, y luego el deslizamiento. |
| levelUp: Run the whole lick as one smooth phrase in a single breath, or move it up to the B string and read the new frets. | Toca todo el lick como una sola frase fluida de un solo aliento, o muévelo a la cuerda Si y lee los nuevos trastes. |
| response prompt: Which of the three — hammer, pull, or slide — needs the most work? Name it for next session. | ¿Cuál de los tres — hammer-on, pull-off o deslizamiento — necesita más trabajo? Nómbralo para la próxima sesión. |
| response placeholder: e.g. the pull-off — my note comes out too quiet | p. ej. el pull-off — mi nota sale demasiado suave |
| tab caption: 2-bar articulation lick · G string · h = hammer-on, p = pull-off, / = slide up | Lick de articulación de 2 compases · cuerda Sol · h = hammer-on, p = pull-off, / = deslizamiento hacia arriba |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| m7w1-s1 text: Read stacked TAB numbers as a chord (play simultaneously) | Leer números apilados en el TAB como un acorde (tocarlos al mismo tiempo) |
| m7w1-s1 gotItWhen: when you see two or more TAB numbers stacked vertically, you instantly play them together — no thinking about "which one first". | cuando ves dos o más números de TAB apilados verticalmente, los tocas al instante juntos — sin pensar en "cuál va primero". |
| m7w1-s1 practice prompt: TAB shows "3" on the A string and "3" on the D string, stacked vertically. How should you play it? | El TAB muestra "3" en la cuerda La y "3" en la cuerda Re, apilados verticalmente. ¿Cómo deberías tocarlo? |
| m7w1-s1 practice choices: A string first, then D string / D string first, then A string / Both at the same time / Just pick one | La cuerda La primero, y luego la Re / La cuerda Re primero, y luego la La / Ambas al mismo tiempo / Solo pulsar una |
| m7w1-s2 text: Identify quarter notes, 8th notes, and half notes in TAB rhythm symbols | Identificar negras, corcheas y blancas en los símbolos de ritmo del TAB |
| m7w1-s2 gotItWhen: you can look at the stems and flags above a TAB and call out the rhythm before you play — without having to listen to the original recording. | puedes mirar las plicas y banderas arriba de un TAB y decir el ritmo en voz alta antes de tocar — sin tener que escuchar la grabación original. |
| m7w1-s2 practice prompt: Two TAB notes with their stems JOINED by a single beam (like ♫) are what kind of notes? | ¿Qué tipo de notas son dos notas de TAB con sus plicas UNIDAS por una sola barra (como ♫)? |
| m7w1-s2 practice choices: Whole notes / Half notes / Quarter notes / 8th notes | Redondas / Blancas / Negras / Corcheas |
| m7w1-s3 text: Recognize hammer-on (h), pull-off (p), and slide (/ or \) markings | Reconocer las marcas de hammer-on (h), pull-off (p) y deslizamiento (/ o \) |
| m7w1-s3 gotItWhen: you can see "5h7" or "7p5" or "5/7" in TAB and know exactly what your fretting hand should do — without looking it up. | puedes ver "5h7" o "7p5" o "5/7" en un TAB y saber exactamente qué debe hacer tu mano de trastear — sin tener que buscarlo. |
| m7w1-s3 practice prompt: In TAB, "5h7" tells you to: | En el TAB, "5h7" te dice que: |
| m7w1-s3 practice choices: Pick the 5th fret note, then HAMMER your finger onto the 7th fret without re-picking / Pick both notes hard / Hold the 5th fret for 7 beats / Skip to the 7th fret | Pulses la nota del traste 5, y luego hagas un HAMMER-ON hacia el traste 7 sin volver a pulsar / Pulses ambas notas fuerte / Sostengas el traste 5 durante 7 tiempos / Saltes directo al traste 7 |
| m7w1-s4 text: Play the "Smoke on the Water" main riff in time | Tocar el riff principal de "Smoke on the Water" a tiempo |
| m7w1-s4 gotItWhen: you can play the full riff at 70 BPM with both notes ringing together cleanly — no buzzing, no missed double-stops. (This is a straight-quarter-note teaching count — the record's actual rhythm has more punch and space than that.) | puedes tocar el riff completo a 70 BPM con ambas notas sonando limpias juntas — sin zumbido, sin dobles notas falladas. (Este es un conteo de enseñanza en negras parejas — el ritmo real de la grabación tiene más contundencia y espacio que eso.) |
| m7w1-s4 practice label: "Smoke on the Water" — D string melody only | "Smoke on the Water" — solo la melodía en la cuerda Re |
| m7w1-s5 text: Play a riff that mixes single notes and double-stops from TAB | Tocar un riff que combina notas sueltas y dobles notas desde el TAB |
| m7w1-s5 gotItWhen: you can sight-read a beginner riff that combines single notes and 2-note chord stabs and play it cleanly the first time through at half speed. | puedes leer a primera vista un riff de principiante que combina notas sueltas y golpes de acorde de 2 notas y tocarlo limpio la primera vez, a media velocidad. |
| m7w1-s6 text: Find a TAB online for a new song and play through it | Encontrar un TAB en línea para una canción nueva y tocarlo de principio a fin |
| m7w1-s6 gotItWhen: you can pick a song you like, find a beginner TAB (Ultimate Guitar, Songsterr), and get through at least one section without asking for help. | puedes elegir una canción que te guste, encontrar un TAB para principiantes (Ultimate Guitar, Songsterr), y tocar al menos una sección sin pedir ayuda. |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 7 · TAB Notation and Barre Chords | Módulo 7 · Notación TAB y acordes con cejilla |
| subtitle: E-shape barre chords · F, G, A barre · Moving the shape up the neck | Acordes con cejilla en forma de E · Cejilla de F, G, A · Mover la forma por el mástil |
| skillFocus: Forming a clean E-shape barre chord · Moving the barre up the neck · Naming barre chords by their root | Formar una cejilla limpia en forma de E · Mover la cejilla por el mástil · Nombrar acordes con cejilla por su raíz |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch: the E-shape barre chord | Mira: el acorde con cejilla en forma de E |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — building the barre | Estación de práctica — construye la cejilla |
| Section title: Bar all 6 strings with your index finger | Haz cejilla en las 6 cuerdas con tu dedo índice |
| Section title: Form the E-shape barre | Forma la cejilla en forma de E |
| Section title: Find the power chord hiding inside your F barre | Encuentra el acorde de potencia escondido dentro de tu cejilla de F |
| Section title: Slide the E-shape: F, G, A | Desliza la forma de E: F, G, A |
| Section title: One-Minute Barre Changes — try for a higher number | Cambios de cejilla en un minuto — intenta superar tu marca |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Station Wrap-Up | Cierre de la estación |
| Section title: ⚡ Ear Spark — optional ear bonus | ⚡ Chispa auditiva — bono opcional de oído |

**Station B — Watch: the E-shape barre chord**

| English | Spanish |
|---|---|
| text: Watch: Pain Free F Chord for Beginners – Lauren Bateman (0:00–5:03). | Mira: Pain Free F Chord for Beginners – Lauren Bateman (0:00–5:03). |
| hint: The F barre — one finger pressed flat across several strings — is famously hard. It's the lowest barre, where the strings are tightest, so it's the toughest spot — G and A higher up are easier. Watch her THUMB: keep it on the BACK of the neck, behind your index. That's where the squeezing power comes from. | La cejilla de F — un dedo presionado plano sobre varias cuerdas — es famosa por ser difícil. Es la cejilla más baja, donde las cuerdas están más tensas, así que es el punto más duro — G y A más arriba son más fáciles. Fíjate en su PULGAR: mantenlo en la PARTE TRASERA del mástil, detrás de tu índice. Ahí es de donde viene la fuerza de apriete. |
| response prompt: For the cleanest E-shape barre, where should your THUMB go? | Para la cejilla en forma de E más limpia, ¿dónde debería ir tu PULGAR? |
| response explain: Plant the thumb on the BACK of the neck, roughly behind your index finger. That gives the squeezing leverage a barre needs — wrapping it over the top kills your strength. | Planta el pulgar en la PARTE TRASERA del mástil, más o menos detrás de tu dedo índice. Eso da la palanca de apriete que una cejilla necesita — envolverlo por encima del mástil te quita fuerza. |
| response choices: Wrapped over the top of the neck / On the BACK of the neck, roughly behind your index finger / Pointing toward the ceiling / It doesn't matter where the thumb goes | Envuelto por encima del mástil / En la PARTE TRASERA del mástil, más o menos detrás de tu dedo índice / Apuntando hacia el techo / No importa dónde vaya el pulgar |
| text: Watch: Basic Barre Chords #1 — the E shape (CH-006) – JustinGuitar (0:00–4:00). | Mira: Basic Barre Chords #1 — the E shape (CH-006) – JustinGuitar (0:00–4:00). |
| hint: The "E shape" is literally the E major open chord, but you slide your fingers up the neck and use your INDEX finger to "be the nut" (the thin strip at the top of the neck that the strings cross) — your finger becomes the bar. | La "forma de E" es literalmente el acorde abierto de E mayor, pero deslizas tus dedos por el mástil y usas tu dedo ÍNDICE para "ser la cejuela" (la tira delgada en la parte superior del mástil por donde cruzan las cuerdas) — tu dedo se convierte en la cejilla. |
| response placeholder: Why is it called an "E-shape" barre chord? What does the shape have in common with the open E major chord? | ¿Por qué se llama acorde con cejilla "en forma de E"? ¿Qué tiene en común la forma con el acorde abierto de E mayor? |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — barre chords are a strength skill that takes weeks, not minutes. What is one small thing that improved today, even if the whole chord isn't ringing yet? | Cierre de la estación — los acordes con cejilla son una destreza de fuerza que toma semanas, no minutos. ¿Qué pequeña cosa mejoró hoy, aunque el acorde completo todavía no suene? |
| response placeholder: e.g. the low strings ring now — just the B string left to fix | p. ej. las cuerdas graves ya suenan — solo falta arreglar la cuerda Si |

**Station C — Bar all 6 strings with your index finger**

| English | Spanish |
|---|---|
| text: Challenge 1 — Just the Bar: lay your index finger flat across all 6 strings at the 5th fret — bar only, no other fingers — and strum. You've got it when: all 6 strings ring, rolling the index slightly onto its bonier edge. | Reto 1 — Solo la cejilla: coloca tu dedo índice plano sobre las 6 cuerdas en el traste 5 — solo la cejilla, sin otros dedos — y rasguea. Lo tienes cuando: las 6 cuerdas suenan, rodando el índice ligeramente hacia su borde más óseo. |
| hint: Roll your index finger slightly toward its outer edge — that side is bonier and gives a cleaner bar. The power comes from the thumb on the back of the neck, not from squeezing the whole hand. | Rueda tu dedo índice ligeramente hacia su borde exterior — ese lado es más óseo y da una cejilla más limpia. La fuerza viene del pulgar en la parte trasera del mástil, no de apretar toda la mano. |
| stuck: Line the bar up right behind the fret. If the B string buzzes, it's usually sitting in a knuckle crease — shift the finger a hair up or down. Get just the top 3 strings ringing first, then chase the rest. | Alinea la cejilla justo detrás del traste. Si la cuerda Si zumba, suele estar cayendo en un pliegue del nudillo — mueve el dedo un poquito hacia arriba o hacia abajo. Logra que suenen solo las 3 cuerdas más agudas primero, y luego persigue el resto. |
| levelUp: Bar at the 1st fret (the hardest spot) and get all 6 ringing, or bar and slide cleanly up to the 7th fret and back. | Haz la cejilla en el traste 1 (el punto más difícil) y logra que suenen las 6, o haz la cejilla y deslízala limpiamente hasta el traste 7 y de vuelta. |

**Station C — Form the E-shape barre**

| English | Spanish |
|---|---|
| text: Challenge 2 — E-Shape Barre: add the E-shape on top of the bar at the 5th fret for A major (ring finger on string 5, fret 7 · pinky on string 4, fret 7 · middle finger on string 3, fret 6) and strum all 6. You've got it when: a full, clean A major barre — master it here before tackling F. | Reto 2 — Cejilla en forma de E: agrega la forma de E encima de la cejilla en el traste 5 para A mayor (dedo anular en la cuerda 5, traste 7 · meñique en la cuerda 4, traste 7 · dedo medio en la cuerda 3, traste 6) y rasguea las 6 cuerdas. Lo tienes cuando: una cejilla de A mayor completa y limpia — domínala aquí antes de atacar F. |
| hint: It's the open E major shape moved up — index finger replaces the "nut". Practice this at the 5th fret BEFORE attempting F at fret 1. If your hand cramps, that's normal — shake your hand loose and come back. | Es la forma abierta de E mayor movida hacia arriba — el dedo índice reemplaza a la "cejuela". Practica esto en el traste 5 ANTES de intentar F en el traste 1. Si tu mano se acalambra, eso es normal — sacúdela para relajarla y vuelve a intentarlo. |
| stuck: Stage it: (1) get the bar across fret 5 clean, (2) add ring + pinky on strings 5–4, (3) add the middle on string 3 last — pluck each string to find the muffled one before moving on. Short tries are better than one long tiring session. | Hazlo por etapas: (1) logra que la cejilla en el traste 5 suene limpia, (2) agrega el anular + el meñique en las cuerdas 5–4, (3) agrega el medio en la cuerda 3 al final — puntea cada cuerda para encontrar la que suena apagada antes de seguir. Intentos cortos son mejores que una sola sesión larga y agotadora. |
| levelUp: Slide the whole shape up to the 7th fret (B major) and keep every string ringing. | Desliza toda la forma hasta el traste 7 (B mayor) y mantén todas las cuerdas sonando. |

**Station C — Find the power chord hiding inside your F barre**

| English | Spanish |
|---|---|
| text: Challenge — Spot the Power Chord: form your F major barre, then look at just strings 6 and 5 — low E (fret 1) + A (fret 3). That is exactly the F5 power chord you learned in Module 3. The barre just stacks the rest of the chord on top. You've got it when: play F5 alone, then add the barre fingers to make full F — and hear the power chord living inside it. | Reto — Encuentra el acorde de potencia: forma tu cejilla de F mayor, y luego mira solo las cuerdas 6 y 5 — Mi grave (traste 1) + La (traste 3). Eso es exactamente el acorde de potencia F5 que aprendiste en el Módulo 3. La cejilla solo apila el resto del acorde encima. Lo tienes cuando: toca F5 solo, y luego agrega los dedos de la cejilla para formar el F completo — y escucha el acorde de potencia viviendo dentro de él. |
| hint: Barre chords feel less scary once you see them as a power chord you already know, plus a few extra notes. And just like a power chord, you name the barre by its root on string 6 — that's your Module 2 + Module 3 skills combining. | Los acordes con cejilla dan menos miedo una vez que los ves como un acorde de potencia que ya conoces, más algunas notas extra. Y al igual que un acorde de potencia, nombras la cejilla por su raíz en la cuerda 6 — eso es tus destrezas del Módulo 2 y el Módulo 3 combinándose. |
| stuck: If full F won't ring yet, fall back to just the F5 power chord (strings 6–5) and add one string at a time upward — the full bar comes last. | Si el F completo todavía no suena, vuelve solo al acorde de potencia F5 (cuerdas 6–5) y agrega una cuerda a la vez hacia arriba — la cejilla completa llega al final. |
| levelUp: Do the same reveal at G (fret 3): play G5, then stack the full G barre on top and hear the power chord inside it. | Haz la misma revelación en G (traste 3): toca G5, y luego apila la cejilla completa de G encima y escucha el acorde de potencia dentro de ella. |

**Station C — Slide the E-shape: F, G, A**

| English | Spanish |
|---|---|
| text: Challenge 3 — F, G, A Slide (your assessment piece): slide the same shape to fret 1 (F), fret 3 (G), and fret 5 (A) — same shape, three chords. You've got it when: G and A ringing clean, then F — the hardest — without buzzing. | Reto 3 — Deslizamiento F, G, A (tu pieza de evaluación): desliza la misma forma al traste 1 (F), traste 3 (G), y traste 5 (A) — misma forma, tres acordes. Lo tienes cuando: G y A suenan limpio, y luego F — el más difícil — sin zumbido. |
| hint: F is the hardest position — don't panic if it buzzes. Barre chords are a hand-strength skill. If your hand cramps, shake your hand loose and rest. Short, frequent tries are better than one long, tiring session, and the strength comes within a couple of weeks. | F es la posición más difícil — no te asustes si zumba. Los acordes con cejilla son una destreza de fuerza de mano. Si tu mano se acalambra, sacúdela para relajarla y descansa. Intentos cortos y frecuentes son mejores que una sola sesión larga y agotadora, y la fuerza llega en un par de semanas. |
| stuck: Build the barre in stages: (1) bar + just the low-E root, (2) add strings 5–4, (3) add the B and high E last — get each stage clean before stacking the next. Start at G or A (frets 3–5) where the strings are looser, then bring the shape down to F. | Construye la cejilla por etapas: (1) cejilla + solo la raíz en Mi grave, (2) agrega las cuerdas 5–4, (3) agrega la Si y la mi aguda al final — logra que cada etapa suene limpia antes de apilar la siguiente. Empieza en G o A (trastes 3–5) donde las cuerdas están más sueltas, y luego baja la forma a F. |
| levelUp: Add B at the 7th fret as a 4th chord, or switch F→G→A in time at 70 BPM. | Agrega B en el traste 7 como un 4to acorde, o cambia F→G→A a tiempo a 70 BPM. |

**Station C — One-Minute Barre Changes — try for a higher number**

| English | Spanish |
|---|---|
| text: Challenge 4 — One-Minute Barre Changes (F ↔ G): set the ⏱ Timer for 60 seconds and slide your E-shape barre between F (fret 1) and G (fret 3) as many times as you can — only changes where all 6 strings ring count. You've got it when: type your count below and try for a higher number next time. (Even 6–8 clean ones is a real success for barres.) | Reto 4 — Cambios de cejilla en un minuto (F ↔ G): pon el ⏱ Temporizador en 60 segundos y desliza tu cejilla en forma de E entre F (traste 1) y G (traste 3) tantas veces como puedas — solo cuentan los cambios donde suenan las 6 cuerdas. Lo tienes cuando: escribe tu cuenta abajo e intenta superarla la próxima vez. (Incluso 6–8 limpios es un verdadero éxito para las cejillas.) |
| hint: It's the same shape sliding two frets — keep the bar pressed and glide, don't lift and re-place. Quality over speed. | Es la misma forma deslizándose dos trastes — mantén la cejilla presionada y deslízala, no la levantes y la vuelvas a colocar. Calidad sobre velocidad. |
| stuck: Keep the bar lightly down the whole time so you never fully reset the shape — just shift two frets. Slow down until both chords ring. | Mantén la cejilla ligeramente abajo todo el tiempo para que nunca reinicies del todo la forma — solo cambia dos trastes. Baja la velocidad hasta que ambos acordes suenen. |
| levelUp: Add A (fret 5) and cycle F→G→A, or run it with a down-up strum. | Agrega A (traste 5) y cicla F→G→A, o tócalo con un rasgueo abajo-arriba. |
| response prompt: Personal record — clean F↔G barre changes in 60 seconds. Your count today? | Récord personal — cambios de cejilla F↔G limpios en 60 segundos. ¿Tu cuenta de hoy? |
| response placeholder: e.g. 8 — try for a higher number next time | p. ej. 8 — intenta superarlo la próxima vez |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Sweet Child O' Mine, one-shape verse: the verse is D · C · G — and with the E-shape barre that's ONE shape sliding: D at fret 10, C at fret 8, G at fret 3. Play one clean strum per chord, then two bars each at 60 BPM. You've got it when: all three ring clean — and the high frets prove the point: barres get EASIER up the neck. 🧵 Song Journey: this is the Module 7 finale. | Reto — Sweet Child O' Mine, estrofa de una sola forma: la estrofa es D · C · G — y con la cejilla en forma de E eso es UNA forma deslizándose: D en el traste 10, C en el traste 8, G en el traste 3. Toca un rasgueo limpio por acorde, y luego dos compases cada uno a 60 BPM. Lo tienes cuando: los tres suenan limpios — y los trastes altos prueban el punto: las cejillas se vuelven MÁS FÁCILES conforme subes por el mástil. 🧵 Recorrido de la canción: este es el final del Módulo 7. |
| hint: Start at the top — get D clean at fret 10 where the strings are loosest, then walk the same shape down. Name each chord by its string-6 root: fret 10 = D, fret 8 = C, fret 3 = G. | Empieza por arriba — logra que D suene limpio en el traste 10 donde las cuerdas están más sueltas, y luego camina la misma forma hacia abajo. Nombra cada acorde por su raíz en la cuerda 6: traste 10 = D, traste 8 = C, traste 3 = G. |
| stuck: Play just the roots on string 6 first (10 → 8 → 3) so the slide distances live in your arm, then add the barre on top. | Toca solo las raíces en la cuerda 6 primero (10 → 8 → 3) para que las distancias del deslizamiento vivan en tu brazo, y luego agrega la cejilla encima. |
| levelUp: Run the loop with a down-up strum, or hum the verse melody over your own chords. | Toca el loop con un rasgueo abajo-arriba, o tararea la melodía de la estrofa sobre tus propios acordes. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Which string in your barre is most likely to buzz right now — the B string, the high E, or the G? Name it; isolating that one string is your first job next session. | ¿Qué cuerda de tu cejilla es más probable que zumbe ahora mismo — la Si, la mi aguda, o la Sol? Nómbrala; aislar esa cuerda es tu primer trabajo la próxima sesión. |
| response placeholder: e.g. the B string — it sits in my finger crease | p. ej. la cuerda Si — cae en un pliegue de mi dedo |

**Station C — ⚡ Ear Spark — optional ear bonus**

| English | Spanish |
|---|---|
| text: ⚡ Ear Spark (optional, 2 min): record F both ways — the little F (xx3211) and the full barre — a few reps in a random order you don't write down. Same chord, different voice: on playback, guess which is which by listening for the low bass note only the barre has. Got someone around? Have them play and you call it. | ⚡ Chispa auditiva (opcional, 2 min): grábate tocando F de las dos formas — el F pequeño (xx3211) y la cejilla completa — unas cuantas veces en un orden aleatorio que no anotes. Mismo acorde, voz distinta: al reproducirlo, adivina cuál es cuál escuchando la nota grave que solo tiene la cejilla. ¿Tienes a alguien cerca? Que toque y tú adivinas. |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| m7w2-s1 text: Bar all 6 strings cleanly with my index finger | Hacer cejilla limpia en las 6 cuerdas con mi dedo índice |
| m7w2-s1 gotItWhen: with only your index finger flat across the 5th fret, you can strum and every one of the 6 strings rings — no muffled strings, no buzz. | con solo tu dedo índice plano sobre el traste 5, puedes rasguear y cada una de las 6 cuerdas suena — sin cuerdas apagadas, sin zumbido. |
| m7w2-s1 practice prompt: Which side of your index finger is best for a clean barre? | ¿Qué lado de tu dedo índice es mejor para una cejilla limpia? |
| m7w2-s1 practice choices: The fleshy front pad / The bony outer edge (rolled slightly) / Either works equally well / The fingernail side | La almohadilla carnosa de enfrente / El borde óseo exterior (ligeramente rodado) / Cualquiera de los dos funciona igual / El lado de la uña |
| m7w2-s2 text: Position my thumb correctly behind the neck for barre chords | Colocar mi pulgar correctamente detrás del mástil para los acordes con cejilla |
| m7w2-s2 gotItWhen: your thumb sits on the BACK of the neck — roughly behind your index finger — and you can feel a pinching motion between thumb and index when you squeeze. | tu pulgar se apoya en la PARTE TRASERA del mástil — más o menos detrás de tu dedo índice — y puedes sentir un movimiento de pinza entre el pulgar y el índice cuando aprietas. |
| m7w2-s2 practice prompt: For maximum squeezing power on a barre chord, your thumb should be: | Para la máxima fuerza de apriete en un acorde con cejilla, tu pulgar debería estar: |
| m7w2-s2 practice choices: Wrapped over the top of the neck (folk style) / On the BACK of the neck, behind the index finger / Floating in the air, not touching the neck / Pressing the strings | Envuelto por encima del mástil (estilo folk) / En la PARTE TRASERA del mástil, detrás del dedo índice / Flotando en el aire, sin tocar el mástil / Presionando las cuerdas |
| m7w2-s3 text: Form an E-shape barre chord at the 5th fret (A major) cleanly | Formar un acorde con cejilla en forma de E en el traste 5 (A mayor) de forma limpia |
| m7w2-s3 gotItWhen: you can pluck each of the 6 strings individually in your A barre and every one rings — no muffled string from a cramped finger. | puedes puntear cada una de las 6 cuerdas por separado en tu cejilla de A y todas suenan — sin ninguna cuerda apagada por un dedo acalambrado. |
| m7w2-s4 text: Play F major barre at the 1st fret | Tocar la cejilla de F mayor en el traste 1 |
| m7w2-s4 gotItWhen: your F barre at the 1st fret rings cleanly on at least 5 of 6 strings — including the B string, which is the trickiest for the bar. | tu cejilla de F en el traste 1 suena limpia en al menos 5 de las 6 cuerdas — incluyendo la cuerda Si, que es la más difícil para la cejilla. |
| m7w2-s4 practice label: Hear F major (E-shape barre, arpeggiated) | Escucha F mayor (cejilla en forma de E, arpegiada) |
| m7w2-s5 text: Name an E-shape barre chord by its root note on string 6 | Nombrar un acorde con cejilla en forma de E por su nota raíz en la cuerda 6 |
| m7w2-s5 gotItWhen: you can slide your E-shape barre to any random fret and name the chord instantly — because you know the notes on the low E string from Module 2. | puedes deslizar tu cejilla en forma de E a cualquier traste al azar y nombrar el acorde al instante — porque conoces las notas de la cuerda Mi grave desde el Módulo 2. |
| m7w2-s5 practice prompt: If you play an E-shape barre chord with your index finger on the 7th fret of string 6, what chord is it? | Si tocas un acorde con cejilla en forma de E con tu dedo índice en el traste 7 de la cuerda 6, ¿qué acorde es? |
| m7w2-s5 practice choices: G major / A major / B major / C major | G mayor / A mayor / B mayor / C mayor |
| m7w2-s6 text: Switch between F, G, and A barre chords in time at 60 BPM | Cambiar entre los acordes con cejilla F, G, y A a tiempo a 60 BPM |
| m7w2-s6 gotItWhen: you can play 2 bars of F, 2 bars of G, 2 bars of A, looping, at 60 BPM — same shape, just sliding up and down the neck. | puedes tocar 2 compases de F, 2 compases de G, 2 compases de A, en loop, a 60 BPM — misma forma, solo deslizándose arriba y abajo del mástil. |
| m7w2-s6 practice label: F · G · A roots (low E string) | Raíces F · G · A (cuerda Mi grave) |

### Set 3

| English | Spanish |
|---|---|
| unit: Module 7 · TAB Notation and Barre Chords | Módulo 7 · Notación TAB y acordes con cejilla |
| subtitle: A-shape barre chords · Bb, B, C barre · Combining E-shape and A-shape | Acordes con cejilla en forma de A · Cejilla de Bb, B, C · Combinar forma de E y forma de A |
| skillFocus: Forming a clean A-shape barre chord · Naming A-shape chords by their root · Combining E-shape and A-shape chords in a song | Formar una cejilla limpia en forma de A · Nombrar acordes en forma de A por su raíz · Combinar acordes en forma de E y de A en una canción |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch: the A-shape barre chord | Mira: el acorde con cejilla en forma de A |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — A-shape and combining | Estación de práctica — forma de A y combinaciones |
| Section title: Form the A-shape barre | Forma la cejilla en forma de A |
| Section title: Slide the A-shape: C, D, E | Desliza la forma de A: C, D, E |
| Section title: Every chord has two homes (E-shape ↔ A-shape) | Cada acorde tiene dos hogares (forma de E ↔ forma de A) |
| Section title: Combine E-shape & A-shape barres | Combina las cejillas en forma de E y de A |
| Section title: Strum the barre chords with a D-DU-UDU pattern | Rasguea los acordes con cejilla con un patrón D-DU-UDU |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: 🌶️ Level-up — the Sweet Child O' Mine intro riff (optional harder goal) | 🌶️ Sube de nivel — el riff de intro de Sweet Child O' Mine (meta opcional más difícil) |
| Section title: Station Wrap-Up | Cierre de la estación |
| Section title: The last two barres — F# and Bb | Las últimas dos cejillas — F# y Bb |

**Station B — Watch: the A-shape barre chord**

| English | Spanish |
|---|---|
| text: Watch: A Shape Major Barre Chords on Guitar – JustinGuitar (0:00–4:00). | Mira: A Shape Major Barre Chords on Guitar – JustinGuitar (0:00–4:00). |
| hint: The A-shape uses the open A major chord, moved up the neck. Some players bar strings 2, 3, 4 with their RING finger only — it's a different technique from the E-shape. | La forma de A usa el acorde abierto de A mayor, movido por el mástil. Algunos guitarristas hacen cejilla en las cuerdas 2, 3, 4 solo con el dedo ANULAR — es una técnica distinta a la de la forma de E. |
| response prompt: The A-shape barre chord places its ROOT note on which string? | ¿En cuál cuerda coloca su nota RAÍZ el acorde con cejilla en forma de A? |
| response explain: The A-shape is rooted on string 5 (the A string) — so the fret your barre sits on, on the A string, names the chord. (The E-shape is rooted on string 6.) | La forma de A tiene su raíz en la cuerda 5 (la cuerda La) — así que el traste donde cae tu cejilla, en la cuerda La, nombra el acorde. (La forma de E tiene su raíz en la cuerda 6.) |
| response choices: String 6 (low E) / String 5 (A) / String 4 (D) / String 1 (high e) | Cuerda 6 (Mi grave) / Cuerda 5 (La) / Cuerda 4 (Re) / Cuerda 1 (mi aguda) |
| text: Watch: Basic Barre Chords (CH-006) – JustinGuitar (0:00–4:00 — rewatch with A-shape focus). | Mira: Basic Barre Chords (CH-006) – JustinGuitar (0:00–4:00 — vuelve a verlo enfocándote en la forma de A). |
| hint: B major is a great A-shape practice chord — it lives at the 2nd fret with the root on string 5. You may hear a muted high E (string 1) in some videos — many players let the ring finger mute it, and that's a real technique. In this module, though, we arch the fingers so string 1 rings. | B mayor es un gran acorde de práctica para la forma de A — vive en el traste 2 con la raíz en la cuerda 5. Puede que escuches una mi aguda (cuerda 1) silenciada en algunos videos — muchos guitarristas dejan que el dedo anular la silencie, y esa es una técnica real. En este módulo, sin embargo, arqueamos los dedos para que la cuerda 1 suene. |
| response placeholder: In this module, should string 1 (the high e) ring or stay muted in your A-shape barre? What do you do with your fingers to make it ring? | En este módulo, ¿la cuerda 1 (la mi aguda) debe sonar o quedarse silenciada en tu cejilla en forma de A? ¿Qué haces con tus dedos para que suene? |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — you now know both barre shapes. Which feels harder right now — the E-shape (root on string 6) or the A-shape (root on string 5) — and what makes it tougher for your hand? | Cierre de la estación — ahora conoces las dos formas de cejilla. ¿Cuál se siente más difícil ahora mismo — la forma de E (raíz en la cuerda 6) o la forma de A (raíz en la cuerda 5) — y qué la hace más dura para tu mano? |
| response placeholder: e.g. the A-shape — barring 4-3-2 with my ring finger is awkward | p. ej. la forma de A — hacer cejilla en 4-3-2 con mi anular se siente incómodo |

**Station C — Form the A-shape barre**

| English | Spanish |
|---|---|
| text: Challenge 1 — A-Shape B Major: index bars all 6 strings at fret 2, fingers on strings 4/3/2 at fret 4, strum strings 5–1 (let the index mute string 6). You've got it when: a clean B major with the string-5 bass ringing and no low E. | Reto 1 — B mayor en forma de A: el índice hace cejilla en las 6 cuerdas en el traste 2, los dedos en las cuerdas 4/3/2 en el traste 4, rasguea las cuerdas 5–1 (deja que el índice silencie la cuerda 6). Lo tienes cuando: un B mayor limpio con el bajo de la cuerda 5 sonando y sin Mi grave. |
| hint: Avoid the low E string (string 6) — your index finger mutes it for you. Aim your strum from string 5 downward. | Evita la cuerda Mi grave (cuerda 6) — tu dedo índice la silencia por ti. Apunta tu rasgueo desde la cuerda 5 hacia abajo. |
| stuck: Stage it: (1) bar fret 2 and get strings 5 and 1 ringing, (2) add the ring-finger sub-barre on strings 4-3-2 at fret 4 last. The ring finger is the tricky part — arch it so the high E still rings. Cramping is normal; shake your hand loose. | Hazlo por etapas: (1) haz la cejilla en el traste 2 y logra que suenen las cuerdas 5 y 1, (2) agrega al final la sub-cejilla del dedo anular en las cuerdas 4-3-2 en el traste 4. El dedo anular es la parte difícil — arquéalo para que la mi aguda siga sonando. Acalambrarse es normal; sacude tu mano para relajarla. |
| levelUp: Slide the whole A-shape up to C (3rd fret) and keep it clean. | Desliza toda la forma de A hasta C (traste 3) y mantenla limpia. |

**Station C — Slide the A-shape: C, D, E**

| English | Spanish |
|---|---|
| text: Challenge 2 — A-Shape Slide: slide the A-shape to C (3rd fret), D (5th fret), and E (7th fret), strumming strings 5–1 only. You've got it when: name each by its string-5 root and play all three clean. | Reto 2 — Deslizamiento en forma de A: desliza la forma de A a C (traste 3), D (traste 5), y E (traste 7), rasgueando solo las cuerdas 5–1. Lo tienes cuando: nombras cada uno por su raíz en la cuerda 5 y tocas los tres limpios. |
| hint: The A-shape is named by the root note on string 5. Apply your Module 2 A-string note knowledge: fret 3 of A = C, fret 5 of A = D, fret 7 of A = E. | La forma de A se nombra por la nota raíz en la cuerda 5. Aplica tu conocimiento de las notas de la cuerda La del Módulo 2: traste 3 de La = C, traste 5 de La = D, traste 7 de La = E. |
| stuck: Higher frets (D, E) are easier — the strings are looser, so get those clean first, then bring the shape down to C. Keep the bar pressed and slide rather than lifting between chords. | Los trastes más altos (D, E) son más fáciles — las cuerdas están más sueltas, así que logra que esos suenen limpio primero, y luego baja la forma a C. Mantén la cejilla presionada y deslízala en lugar de levantarla entre acordes. |
| levelUp: Run C→D→E in time at 70 BPM, or add F at the 8th fret. | Toca C→D→E a tiempo a 70 BPM, o agrega F en el traste 8. |

**Station C — Every chord has two homes (E-shape ↔ A-shape)**

| English | Spanish |
|---|---|
| text: Challenge 3 — Two Homes for F: play F as an E-shape barre (index on string 6, fret 1), then play the SAME chord as an A-shape barre (index on string 5, fret 8). Same note name, two places on the neck. Pluck both and listen — same chord, slightly different colour. You've got it when: find and play both Fs, and say WHY they are both F (read the root: low E + 1 fret = F; A string + 8 frets = F). | Reto 3 — Dos hogares para F: toca F como cejilla en forma de E (índice en la cuerda 6, traste 1), y luego toca el MISMO acorde como cejilla en forma de A (índice en la cuerda 5, traste 8). Mismo nombre de nota, dos lugares en el mástil. Puntea ambos y escucha — mismo acorde, un color ligeramente distinto. Lo tienes cuando: encuentras y tocas ambos F, y dices POR QUÉ los dos son F (lee la raíz: Mi grave + traste 1 = F; cuerda La + traste 8 = F). |
| hint: This is your Module 2 fretboard map paying off: the root note names the chord, so wherever an F lives on string 6 or string 5, an F barre lives there too. Knowing both homes means you are never far from any chord. | Este es tu mapa del diapasón del Módulo 2 dando frutos: la nota raíz nombra el acorde, así que donde sea que un F viva en la cuerda 6 o la cuerda 5, una cejilla de F también vive ahí. Conocer ambos hogares significa que nunca estás lejos de ningún acorde. |
| stuck: Find the root note first, then build the shape around it. Low E + 1 fret = F (E-shape home); A string + 8 frets = F (A-shape home). The shape follows the root. | Encuentra la nota raíz primero, y luego construye la forma alrededor de ella. Mi grave + traste 1 = F (hogar de la forma de E); cuerda La + traste 8 = F (hogar de la forma de A). La forma sigue a la raíz. |
| levelUp: Find both homes for G (E-shape fret 3, A-shape fret 10) and for C (A-shape fret 3, E-shape fret 8). | Encuentra ambos hogares para G (forma de E traste 3, forma de A traste 10) y para C (forma de A traste 3, forma de E traste 8). |

**Station C — Combine E-shape & A-shape barres**

| English | Spanish |
|---|---|
| text: Challenge 4 — Shape Combo (your assessment piece): alternate E-shape and A-shape — F (E, 1st), C (A, 3rd), G (E, 3rd), D (A, 5th), 2 bars each at 60 BPM. You've got it when: smooth switches between the two shapes, landing each change on beat 1. | Reto 4 — Combo de formas (tu pieza de evaluación): alterna forma de E y forma de A — F (E, traste 1), C (A, traste 3), G (E, traste 3), D (A, traste 5), 2 compases cada uno a 60 BPM. Lo tienes cuando: cambios fluidos entre las dos formas, cayendo cada cambio en el tiempo 1. |
| hint: You're alternating between E-shape and A-shape with each chord change. This is what real songs ask for. Notice that some chord changes are tiny hand moves — barely shift positions. | Estás alternando entre la forma de E y la forma de A con cada cambio de acorde. Esto es lo que las canciones reales piden. Fíjate que algunos cambios de acorde son movimientos pequeños de mano — apenas cambian de posición. |
| stuck: Drill one pair at a time — F→C, then G→D — before running all four. Some moves are tiny (G E-shape fret 3 → D A-shape fret 5 is a short hop). Drop to 50 BPM if the changes fall apart. | Ejercita un par a la vez — F→C, y luego G→D — antes de correr los cuatro. Algunos movimientos son pequeños (G en forma de E traste 3 → D en forma de A traste 5 es un salto corto). Baja a 50 BPM si los cambios se desarman. |
| levelUp: Run it with the D-DU-UDU strum, or push to 75 BPM. | Tócalo con el rasgueo D-DU-UDU, o sube a 75 BPM. |
| response prompt: Personal record — play the F–C–G–D switch cleanly at 60 BPM, then go +5 at a time. Your fastest CLEAN loop today (BPM)? | Récord personal — toca el cambio F–C–G–D limpio a 60 BPM, y luego sube de 5 en 5. ¿Tu vuelta LIMPIA más rápida hoy (BPM)? |
| response placeholder: e.g. 70 — try for a higher number next time | p. ej. 70 — intenta superarlo la próxima vez |

**Station C — Strum the barre chords with a D-DU-UDU pattern**

| English | Spanish |
|---|---|
| text: Challenge — Groove the Barres: take a barre progression (F–C–G–D, or Am–G–F as barres) and play it with the D-DU-UDU pattern from Module 6 instead of one strum per bar. You've got it when: the strum pattern stays steady and even while you switch barre shapes — the groove (the steady rhythmic feel) doesn't break at the chord change. | Reto — Dale groove a las cejillas: toma una progresión con cejillas (F–C–G–D, o Am–G–F como cejillas) y tócala con el patrón D-DU-UDU del Módulo 6 en lugar de un rasgueo por compás. Lo tienes cuando: el patrón de rasgueo se mantiene estable y parejo mientras cambias de forma de cejilla — el groove (la sensación rítmica constante) no se rompe en el cambio de acorde. |
| hint: You spent Module 6 making that strum automatic — now layer it onto the harder barre chords. If the pattern falls apart at a change, slow the metronome until barre + strum hold together. | Pasaste el Módulo 6 haciendo que ese rasgueo fuera automático — ahora superpónlo sobre los acordes con cejilla, más difíciles. Si el patrón se desarma en un cambio, baja el metrónomo hasta que la cejilla y el rasgueo se mantengan juntos. |
| stuck: Strip it back: play the progression as one strum per bar until the changes are clean, THEN layer the D-DU-UDU pattern on top. Add the rhythm only once the chords land. | Simplifícalo: toca la progresión con un rasgueo por compás hasta que los cambios salgan limpios, y LUEGO superpón el patrón D-DU-UDU encima. Agrega el ritmo solo una vez que los acordes caigan bien. |
| levelUp: Push the tempo, or accent beats 2 and 4 for a backbeat feel. | Sube el tempo, o acentúa los tiempos 2 y 4 para una sensación de contratiempo. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Oye Mi Amor, full barre Bm: the verse's small Bm graduates today. Index bars fret 2 (strings 5–1), and you play Bm · G one bar each with your D-DU-UDU strum at 60 BPM. You've got it when: four laps where the full Bm rings as clean as the G — the song's last beginner shortcut is gone. | Reto — Oye Mi Amor, cejilla completa de Bm: el Bm pequeño de la estrofa se gradúa hoy. El índice hace cejilla en el traste 2 (cuerdas 5–1), y tocas Bm · G un compás cada uno con tu rasgueo D-DU-UDU a 60 BPM. Lo tienes cuando: cuatro vueltas donde el Bm completo suena tan limpio como el G — el último atajo de principiante de la canción se acabó. |
| hint: It's built on the same fret-2 bar as your B major — the minor version just re-stacks the fingers on top. The index tip mutes string 6 for you. | Se construye sobre la misma cejilla del traste 2 que tu B mayor — la versión menor solo reacomoda los dedos encima. La punta del índice silencia la cuerda 6 por ti. |
| stuck: Whenever the barre buzzes, fall back to the small Bm for a lap, then trade back — alternate small and full until full wins. | Cada vez que la cejilla zumbe, vuelve al Bm pequeño por una vuelta, y luego cambia de vuelta — alterna el pequeño y el completo hasta que gane el completo. |
| levelUp: Play the chorus (A · D · E · D) as barres too — the whole song with no open chords. | Toca también el coro (A · D · E · D) como cejillas — la canción entera sin acordes abiertos. |
| text: Challenge — Watchtower, no open chords: play Am · G · F entirely as barres — Am is the E-shape minor at fret 5 (the bar plus your open-Em fingers), G and F are your E-shape majors at frets 3 and 1. Two beats per chord at 60 BPM. You've got it when: four laps using ONLY barre chords — proof you no longer need the open shapes. 🧵 Song Journey: from Layer 1 to every chord a barre. | Reto — Watchtower, sin acordes abiertos: toca Am · G · F por completo como cejillas — Am es la forma menor de E en el traste 5 (la cejilla más tus dedos de Em abierto), G y F son tus formas mayores de E en los trastes 3 y 1. Dos tiempos por acorde a 60 BPM. Lo tienes cuando: cuatro vueltas usando SOLO acordes con cejilla — prueba de que ya no necesitas las formas abiertas. 🧵 Recorrido de la canción: de la Capa 1 a cada acorde como cejilla. |
| hint: Minor E-shape = the major shape minus the middle finger; the bar covers the note it left behind. Read the roots on string 6: fret 5 = A, fret 3 = G, fret 1 = F. | Forma menor de E = la forma mayor menos el dedo medio; la cejilla cubre la nota que dejó atrás. Lee las raíces en la cuerda 6: traste 5 = A, traste 3 = G, traste 1 = F. |
| stuck: Get each chord clean on its own (pluck all 6 strings), then pair Am → G, and add the F last — it's the tightest squeeze. | Logra que cada acorde suene limpio por separado (puntea las 6 cuerdas), y luego junta Am → G, y agrega el F al final — es el apriete más ajustado. |
| levelUp: Run it with D-DU-UDU, or alternate one lap of open chords with one lap of barres and hear the difference. | Tócalo con D-DU-UDU, o alterna una vuelta de acordes abiertos con una vuelta de cejillas y escucha la diferencia. |
| response prompt: Personal record — clean all-barre Watchtower laps in a row. Your count today? | Récord personal — vueltas seguidas de Watchtower solo con cejillas y limpias. ¿Tu cuenta de hoy? |
| response placeholder: e.g. 2 — the F still buzzes | p. ej. 2 — el F todavía zumba |
| text: Challenge — Luna, full barre F: the little F (xx3211) graduates today. Index bars fret 1 across all six strings — the toughest fret on the neck to barre — and you play F ↔ Am with two downbeat strums per bar at 60 BPM. You've got it when: four laps where all six strings of the F ring as clean as the Am — Luna's last beginner shortcut is gone. 🧵 Song Journey: beyond Layer 5 — the barre upgrade. | Reto — Luna, cejilla completa de F: el F pequeño (xx3211) se gradúa hoy. El índice hace cejilla en el traste 1 a lo largo de las seis cuerdas — el traste más difícil del mástil para hacer cejilla — y tocas F ↔ Am con dos rasgueos en el tiempo fuerte por compás a 60 BPM. Lo tienes cuando: cuatro vueltas donde las seis cuerdas del F suenan tan limpias como el Am — el último atajo de principiante de Luna se acabó. 🧵 Recorrido de la canción: más allá de la Capa 5 — la mejora de la cejilla. |
| hint: Roll the index onto its bony edge and add a gentle pull-back from the whole arm so the thumb doesn't do all the work — fret 1 needs that extra leverage on top of your thumb squeeze. | Rueda el índice hacia su borde óseo y agrega un ligero tirón hacia atrás desde todo el brazo para que el pulgar no haga todo el trabajo — el traste 1 necesita esa palanca extra además del apriete de tu pulgar. |
| stuck: Barre just the top two strings at fret 1 and add one string per day. The six-string F takes weeks, not one day — go slow. | Haz cejilla solo en las dos cuerdas más agudas en el traste 1 y agrega una cuerda por día. El F de seis cuerdas toma semanas, no un día — ve despacio. |
| levelUp: Slide the same barre shape to fret 5 — that's A major, and suddenly you can play every major chord on the neck. | Desliza la misma forma de cejilla al traste 5 — eso es A mayor, y de repente puedes tocar todos los acordes mayores del mástil. |

**Station C — 🌶️ Level-up — the Sweet Child O' Mine intro riff (optional harder goal)**

| English | Spanish |
|---|---|
| text: 🌶️ Try it: learn the most famous riff in the course. The "Sweet Child O' Mine" intro lives up high on the D, G, and B strings around the 12th–15th frets, picked one note at a time. Watch Sweet Child O' Mine Intro in Standard Tuning – Jbf Music & Guitar (played slow and full speed, with the TAB on screen), learn just the first bar, and play it slowly. No score, no rush — this is a late-course optional challenge you can keep practicing a little at a time. | 🌶️ Pruébalo: aprende el riff más famoso del curso. La intro de "Sweet Child O' Mine" vive arriba en las cuerdas Re, Sol y Si, alrededor de los trastes 12–15, pulsada una nota a la vez. Mira Sweet Child O' Mine Intro in Standard Tuning – Jbf Music & Guitar (tocado lento y a velocidad completa, con el TAB en pantalla), aprende solo el primer compás, y tócalo despacio. Sin puntaje, sin apuro — este es un reto opcional de fin de curso que puedes seguir practicando poco a poco. |
| hint: The lesson is in standard tuning — the same tuning your guitar is already in — so you can play along directly. (The original record is tuned a half-step lower, so you'll sound slightly higher than the album; that's normal.) Loop just the first bar until it's clean before adding more. | La lección está en afinación estándar — la misma afinación en la que ya está tu guitarra — así que puedes tocar junto directamente. (La grabación original está afinada medio tono más abajo, así que vas a sonar ligeramente más agudo que el álbum; eso es normal.) Repite solo el primer compás hasta que salga limpio antes de agregar más. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: You've reached the hardest hands-on skill in the course — give yourself credit for that. Which barre (E-shape or A-shape, and at which chord) most needs another week of short daily tries? Type it below; that's your standing warm-up from here. (Don't stop yet — one more section below!) | Has llegado a la destreza práctica más difícil del curso — date crédito por eso. ¿Qué cejilla (forma de E o forma de A, y en qué acorde) necesita más otra semana de intentos cortos diarios? Escríbelo abajo; ese es tu calentamiento fijo de ahora en adelante. (¡No te detengas todavía — falta una sección más abajo!) |
| response placeholder: e.g. the F barre at fret 1 — a few clean tries every day | p. ej. la cejilla de F en el traste 1 — algunos intentos limpios cada día |

**Station C — The last two barres — F# and Bb**

| English | Spanish |
|---|---|
| text: Challenge — F# and Bb, the last two: you've slid both barre shapes all over the neck — now get the two lowest ones clean — the last two shapes left in this module. F# major is your E-shape barre at fret 2 (root F# on string 6). Bb major is your A-shape barre at fret 1 (root Bb on string 5, low E muted). Play each one cleanly, then trade F# ↔ Bb, one strum apiece. You've got it when: both ring clean at these tight low frets and you can name each by its root. | Reto — F# y Bb, las últimas dos: has deslizado ambas formas de cejilla por todo el mástil — ahora logra que las dos más bajas suenen limpias — las últimas dos formas que quedan en este módulo. F# mayor es tu cejilla en forma de E en el traste 2 (raíz F# en la cuerda 6). Bb mayor es tu cejilla en forma de A en el traste 1 (raíz Bb en la cuerda 5, Mi grave silenciada). Toca cada una de forma limpia, y luego alterna F# ↔ Bb, un rasgueo cada una. Lo tienes cuando: ambas suenan limpias en estos trastes bajos y apretados y puedes nombrar cada una por su raíz. |
| hint: Same two shapes you already own, just parked down low where the strings fight hardest. F#: the E-shape bar on fret 2 — one fret above the open E chord. Bb: the A-shape bar on fret 1 — index bars the strings, your ring finger sub-barres strings 4-3-2 at fret 3 (the same sub-barre you drilled on B, C and D), and your index mutes the low E — one fret above the open A chord. Read the roots: string 6 fret 2 = F#, string 5 fret 1 = Bb. Tap ▶ to hear each chord. | Las mismas dos formas que ya dominas, solo que ubicadas abajo donde las cuerdas pelean más. F#: la cejilla en forma de E en el traste 2 — un traste arriba del acorde abierto de E. Bb: la cejilla en forma de A en el traste 1 — el índice hace la cejilla en las cuerdas, tu dedo anular hace la sub-cejilla en las cuerdas 4-3-2 en el traste 3 (la misma sub-cejilla que ejercitaste en B, C y D), y tu índice silencia la Mi grave — un traste arriba del acorde abierto de A. Lee las raíces: cuerda 6 traste 2 = F#, cuerda 5 traste 1 = Bb. Toca ▶ para escuchar cada acorde. |
| stuck: These sit at the tightest end of the neck, so build each in stages — and if fret 1 or 2 buzzes, prove the shape higher up first, then walk it down. For Bb, get the string-5 bass and the ring-finger sub-barre ringing before you add the high E. Cramping is normal; shake your hand loose. | Estos caen en el extremo más apretado del mástil, así que construye cada uno por etapas — y si el traste 1 o 2 zumba, prueba la forma más arriba primero, y luego bájala. Para Bb, logra que suenen el bajo de la cuerda 5 y la sub-cejilla del anular antes de agregar la mi aguda. Acalambrarse es normal; sacude tu mano para relajarla. |
| levelUp: Hear them in real music: F# is all over "Hotel California"; Bb is the fourth chord of the key (the IV chord) in "Hey Jude." Or slide each shape up one fret and name the new chord (G, and B). | Escúchalas en música real: F# está por toda "Hotel California"; Bb es el cuarto acorde de la tonalidad (el acorde IV) en "Hey Jude". O desliza cada forma un traste hacia arriba y nombra el acorde nuevo (G, y B). |
| playSeq label: Hear F# major, then Bb major | Escucha F# mayor, y luego Bb mayor |
| response prompt: Which of the two low barres — F# or Bb — rings less cleanly right now? Name it for your next warm-up. | ¿Cuál de las dos cejillas bajas — F# o Bb — suena menos limpia ahora mismo? Nómbrala para tu próximo calentamiento. |
| response placeholder: e.g. Bb — my ring-finger sub-barre deadens the high E | p. ej. Bb — mi sub-cejilla del anular apaga la mi aguda |

**Set 3 — Skills**

| English | Spanish |
|---|---|
| m7w3-s1 text: Form an A-shape barre chord cleanly at the 2nd fret (B major) | Formar un acorde con cejilla en forma de A de manera limpia en el traste 2 (B mayor) |
| m7w3-s1 gotItWhen: your B barre rings cleanly on strings 5 to 1 — and string 6 (low E) is muted by your index finger so it doesn't accidentally sound. | tu cejilla de B suena limpia en las cuerdas 5 a 1 — y la cuerda 6 (Mi grave) está silenciada por tu dedo índice para que no suene por accidente. |
| m7w3-s1 practice label: Hear B major (A-shape barre, arpeggiated) | Escucha B mayor (cejilla en forma de A, arpegiada) |
| m7w3-s2 text: Mute string 6 (low E) when playing an A-shape barre | Silenciar la cuerda 6 (Mi grave) al tocar una cejilla en forma de A |
| m7w3-s2 gotItWhen: your index finger lightly mutes string 6 so you don't have to think about avoiding it when strumming — even a slightly wide strum sounds fine. | tu dedo índice silencia ligeramente la cuerda 6 para que no tengas que pensar en evitarla al rasguear — incluso un rasgueo un poco amplio suena bien. |
| m7w3-s2 practice prompt: In an A-shape barre chord, what happens to the low E string (string 6)? | En un acorde con cejilla en forma de A, ¿qué pasa con la cuerda Mi grave (cuerda 6)? |
| m7w3-s2 practice choices: It rings as part of the chord / It is muted by the side of your index finger / You skip your strum carefully / You tune it to a different note | Suena como parte del acorde / Está silenciada por el costado de tu dedo índice / Te saltas esa cuerda con cuidado al rasguear / La afinas a una nota distinta |
| m7w3-s3 text: Name an A-shape barre chord by its root note on string 5 | Nombrar un acorde con cejilla en forma de A por su nota raíz en la cuerda 5 |
| m7w3-s3 gotItWhen: you can slide your A-shape barre to any random fret and name the chord by reading the note on string 5 (using your Module 2 knowledge). | puedes deslizar tu cejilla en forma de A a cualquier traste al azar y nombrar el acorde leyendo la nota en la cuerda 5 (usando tu conocimiento del Módulo 2). |
| m7w3-s3 practice prompt: If you play an A-shape barre chord with your index finger on the 5th fret of string 5, what chord is it? | Si tocas un acorde con cejilla en forma de A con tu dedo índice en el traste 5 de la cuerda 5, ¿qué acorde es? |
| m7w3-s3 practice choices: C major / D major / E major / A major | C mayor / D mayor / E mayor / A mayor |
| m7w3-s4 text: Play Bb, C, and D as A-shape barre chords | Tocar Bb, C, y D como acordes con cejilla en forma de A |
| m7w3-s4 gotItWhen: you can slide the A-shape between Bb (1st fret), C (3rd fret), and D (5th fret) and each chord rings cleanly with no muffled strings. | puedes deslizar la forma de A entre Bb (traste 1), C (traste 3), y D (traste 5) y cada acorde suena limpio sin cuerdas apagadas. |
| m7w3-s4 practice label: Bb · C · D roots (A string) | Raíces Bb · C · D (cuerda La) |
| m7w3-s5 text: Switch between an E-shape barre and an A-shape barre in time | Cambiar entre una cejilla en forma de E y una cejilla en forma de A a tiempo |
| m7w3-s5 gotItWhen: you can go from F (E-shape, 1st fret) to C (A-shape, 3rd fret) on beat 1 of a new bar at 60 BPM without buzzing or pausing. | puedes ir de F (forma de E, traste 1) a C (forma de A, traste 3) en el tiempo 1 de un compás nuevo a 60 BPM sin zumbido ni pausas. |
| m7w3-s6 text: Play a full song using only barre chords (no open chords) | Tocar una canción completa usando solo acordes con cejilla (sin acordes abiertos) |
| m7w3-s6 gotItWhen: you can play "All Along the Watchtower" or another 3-chord song from start to finish using ONLY barre chords — proving you no longer need the open shapes. | puedes tocar "All Along the Watchtower" u otra canción de 3 acordes de principio a fin usando SOLO acordes con cejilla — probando que ya no necesitas las formas abiertas. |
| m7w3-s6 practice label: F · C · G · D barre progression (roots) | Progresión de cejillas F · C · G · D (raíces) |

### Module-level Songs

MODULE_SONGS[7] meta fields (song title shown for reference, not itself translated on the site).

| English | Spanish |
|---|---|
| "Smoke on the Water" — Deep Purple — meta: Iconic 2-note TAB riff · A + D strings | Riff icónico de TAB de 2 notas · cuerdas La + Re |
| "Crazy Train" — Ozzy Osbourne — meta: Fast intro riff · alternate picking practice | Riff de intro rápido · práctica de púa alternada |
| "Seven Nation Army" — The White Stripes — meta: Single-note riff with rhythm variations | Riff de una sola nota con variaciones rítmicas |
| "Hey Jude" — The Beatles — meta: F major in the chorus · perfect E-shape barre application | F mayor en el coro · aplicación perfecta de la cejilla en forma de E |
| "Luna" — Peso Pluma, Junior H — meta: Full barre F in the vamp (instead of the little F) | Cejilla completa de F en el vamp (en lugar del F pequeño) |
| "Wonderwall" — Oasis — meta: Easier with barre chords once you have them down | Más fácil con acordes con cejilla una vez que los dominas |
| "Sweet Child O' Mine" — Guns N' Roses — meta: Barre the D–C–G verse · intro riff = optional harder challenge | Toca la estrofa D–C–G con cejillas · riff de intro = reto opcional más difícil |
| "All Along the Watchtower" — Dylan / Hendrix — meta: Am–G–F–G · use barre shapes for all three | Am–G–F–G · usa formas de cejilla para los tres |
| "Happy Birthday" — meta: Play it entirely with barre chords | Tócala por completo con acordes con cejilla |
| "Oye Mi Amor" — Maná — meta: Full barre-chord progression · Bm–G | Progresión completa de acordes con cejilla · Bm–G |
| "Tu Boda" — Oscar Maydon × Fuerza Regida — meta: Barre-chord sierreño progression | Progresión sierreña con acordes con cejilla |
| "Hotel California" — Eagles — meta: Bm–F#–A–E·G–D–Em–F# · lots of barre practice | Bm–F#–A–E·G–D–Em–F# · mucha práctica de cejilla |
| "Zombie" — The Cranberries — meta: Em–C–G–D · mix open and barre | Em–C–G–D · mezcla acordes abiertos y cejillas |
| "Mad World" — Gary Jules / Tears for Fears — meta: Em–G–D–A · barre chord workout | Em–G–D–A · ejercicio de acordes con cejilla |

### Module Review

| English | Spanish |
|---|---|
| module: TAB Notation and Barre Chords | Notación TAB y acordes con cejilla |
| skill mr7-s1: I can read multi-line TAB — stacked numbers as chords, plus the rhythm symbols (quarter, 8th, half) above the notes | Puedo leer TAB de varias líneas — números apilados como acordes, además de los símbolos de ritmo (negra, corchea, blanca) arriba de las notas |
| skill mr7-s2: I can recognise hammer-on (h), pull-off (p), and slide (/ \) markings in TAB and play them | Puedo reconocer las marcas de hammer-on (h), pull-off (p), y deslizamiento (/ \) en el TAB y tocarlas |
| skill mr7-s3: I can bar all 6 strings with my index finger so every string rings | Puedo hacer cejilla en las 6 cuerdas con mi dedo índice para que todas suenen |
| skill mr7-s4: I can form an E-shape barre and play F, G, and A cleanly, naming each by its root on string 6 | Puedo formar una cejilla en forma de E y tocar F, G, y A de forma limpia, nombrando cada uno por su raíz en la cuerda 6 |
| skill mr7-s5: I can form an A-shape barre and play B, C, and D cleanly, naming each by its root on string 5 | Puedo formar una cejilla en forma de A y tocar B, C, y D de forma limpia, nombrando cada uno por su raíz en la cuerda 5 |
| skill mr7-s6: I can find both "homes" for a chord — its E-shape (string-6 root) and A-shape (string-5 root) — and switch between the two shapes in a progression | Puedo encontrar los dos "hogares" de un acorde — su forma de E (raíz en la cuerda 6) y su forma de A (raíz en la cuerda 5) — y cambiar entre las dos formas en una progresión |
| assessItem: Play F barre → slide to G → slide to A, one clean strum each (E-shape, root on string 6) | Toca la cejilla de F → deslízala a G → deslízala a A, un rasgueo limpio cada una (forma de E, raíz en la cuerda 6) |
| assessItem: Play a 4-chord progression mixing E-shape and A-shape barres (e.g. F–C–G–D), 2 bars each, at 60 BPM | Toca una progresión de 4 acordes mezclando cejillas en forma de E y de A (p. ej. F–C–G–D), 2 compases cada uno, a 60 BPM |
| forward: Module 8 hands the spotlight to your <strong>picking hand</strong>. Every barre and open shape you can now hold becomes a chord frame that fingerpicking decorates one string at a time — the fretting work you just did is exactly what makes those patterns sound full. | El Módulo 8 le da el protagonismo a tu <strong>mano de pulsar</strong>. Cada cejilla y forma abierta que ahora puedes sostener se convierte en un marco de acorde que el fingerpicking decora una cuerda a la vez — el trabajo de trastear que acabas de hacer es exactamente lo que hace que esos patrones suenen completos. |

## Module 8 — Finger Picking

### Set 1

| English | Spanish |
|---|---|
| unit: Module 8 · Finger Picking | Módulo 8 · Fingerpicking |
| subtitle: Hand position · p-i-m-a · Thumb on bass · Fingers on treble | Posición de la mano · p-i-m-a · Pulgar en el bajo · Dedos en las agudas |
| skillFocus: A relaxed fingerpicking hand position · Thumb on the bass strings, fingers on the treble · Rest stroke vs. free stroke | Una posición relajada de la mano de fingerpicking · Pulgar en las cuerdas graves, dedos en las agudas · Apoyando (toque de apoyo) vs. tirando (toque libre) |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for the thumb and fingers | Escucha el pulgar y los dedos |
| Section title: Try p-i-m-a on open strings | Prueba p-i-m-a en cuerdas al aire |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — finger assignments | Estación de práctica — asignación de dedos |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Set up a relaxed fingerpicking hand | Prepara una mano de fingerpicking relajada |
| Section title: Pluck p-i-m-a — thumb bass, i-m-a treble | Pulsa p-i-m-a — pulgar en el bajo, i-m-a en las agudas |
| Section title: Move the thumb between bass strings | Mueve el pulgar entre las cuerdas graves |
| Section title: Take It to a Song | Llévalo a una canción |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: Beginner Fingerpicking Made Easy: Pinch, Pluck, & Play! – Marty Music (0:00–5:00). As you watch, copy his RIGHT-HAND shape on your own guitar — thumb resting on the low E, fingers curved over the treble strings. | Mira: Beginner Fingerpicking Made Easy: Pinch, Pluck, & Play! – Marty Music (0:00–5:00). Mientras miras, copia su forma de la MANO DERECHA en tu propia guitarra — pulgar apoyado en la Mi grave, dedos curvados sobre las cuerdas agudas. |
| hint: Watch the right hand: wrist arched, fingers curved like he's holding a small ball. The thumb sits FORWARD of the fingers, not tucked under them. | Observa la mano derecha: muñeca arqueada, dedos curvados como si sostuviera una pelotita. El pulgar se ubica ADELANTE de los dedos, no metido debajo de ellos. |
| response prompt: In classical fingerpicking notation, which finger is "p"? | En la notación clásica de fingerpicking, ¿cuál dedo es "p"? |
| response explain: "p" is the thumb (from Spanish "pulgar"). The rest: i = index, m = middle, a = ring. | "p" es el pulgar (del español "pulgar"). El resto: i = índice, m = medio, a = anular. |
| response choices: Index finger / Middle finger / Thumb / Ring finger | Dedo índice / Dedo medio / Pulgar / Dedo anular |
| text: Watch: Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar (0:00–4:00). Pause when he assigns the fingers and place yours the same way: p on the bass, i-m-a on G-B-e. | Mira: Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar (0:00–4:00). Pausa cuando asigna los dedos y coloca los tuyos de la misma manera: p en el bajo, i-m-a en G-B-e. |
| hint: Justin's assignment: thumb handles strings 6, 5, 4 (the bass) and i-m-a handle strings 3, 2, 1 (treble). One finger per string is the goal. | La asignación de Justin: el pulgar se encarga de las cuerdas 6, 5, 4 (el bajo) y i-m-a se encargan de las cuerdas 3, 2, 1 (las agudas). Un dedo por cuerda es la meta. |
| response prompt: Which finger normally plucks the B string (string 2)? | ¿Cuál dedo pulsa normalmente la cuerda B (cuerda 2)? |
| response explain: Each finger gets a "home" string: i on G (3), m on B (2), a on high e (1). So the B string is m (middle). | Cada dedo tiene una cuerda "de base": i en G (3), m en B (2), a en mi aguda (1). Así que la cuerda B es m (medio). |
| response choices: p (thumb) / i (index) / m (middle) / a (ring) | p (pulgar) / i (índice) / m (medio) / a (anular) |

**Station B — Listen for the thumb and fingers**

| English | Spanish |
|---|---|
| text: Listen to "Dust in the Wind" by Kansas. Pay attention to the picking pattern — you can clearly hear the alternating bass (thumb) underneath the melody (fingers). | Escucha "Dust in the Wind" de Kansas. Pon atención al patrón de punteo — puedes escuchar claramente el bajo alternante (pulgar) debajo de la melodía (dedos). |
| hint: This song is the classic example of fingerpicking. The bass moves on every beat, the fingers play between the beats. | Esta canción es el ejemplo clásico de fingerpicking. El bajo se mueve en cada tiempo, los dedos tocan entre los tiempos. |
| response placeholder: In "Dust in the Wind", describe what you hear the THUMB doing vs. what the FINGERS are doing. | En "Dust in the Wind", describe qué escuchas haciendo al PULGAR frente a lo que hacen los DEDOS. |

**Station B — Try p-i-m-a on open strings**

| English | Spanish |
|---|---|
| text: Now try it: pluck p-i-m-a on open strings — low E (p), G (i), B (m), high e (a). Click any note below the TAB to hear it, then play the staircase on your own guitar, one finger per string. | Ahora pruébalo: pulsa p-i-m-a en cuerdas al aire — Mi grave (p), G (i), B (m), mi aguda (a). Haz clic en cualquier nota debajo del TAB para escucharla, y luego toca la escalera en tu propia guitarra, un dedo por cuerda. |
| hint: No pick, no chord yet — just the right hand. Each pluck lands on its own string, reading left to right. Aim for the same volume from every finger. | Sin púa, sin acorde todavía — solo la mano derecha. Cada pulsación cae en su propia cuerda, leyendo de izquierda a derecha. Apunta al mismo volumen en cada dedo. |
| tab caption: p-i-m-a on open strings · low E · G · B · high e | p-i-m-a en cuerdas al aire · Mi grave · G · B · mi aguda |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: which finger felt the most awkward today, and what helped it land more evenly? | Cierre de la estación — pausa y piensa: ¿cuál dedo se sintió más incómodo hoy, y qué ayudó a que cayera más parejo? |
| response placeholder: e.g. the ring (a) finger was weakest — slowing down and watching it helped | p. ej. el dedo anular (a) era el más débil — ir más despacio y observarlo ayudó |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Tuning (Module 1) matters even more in fingerpicking — every note is exposed, so an out-of-tune string is easy to hear. | Afinar (Módulo 1) importa todavía más en el fingerpicking — cada nota queda expuesta, así que una cuerda desafinada se escucha fácilmente. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Set up a relaxed fingerpicking hand**

| English | Spanish |
|---|---|
| text: Challenge 1 — Hand Shape: put the pick down, rest your thumb on the low E and i-m-a on the G, B, and high e strings, and hold for 30 seconds. You've got it when: a relaxed, arched wrist with curved fingers — like holding an apple. | Reto 1 — Forma de la mano: deja la púa a un lado, apoya tu pulgar en la Mi grave e i-m-a en las cuerdas G, B y mi aguda, y sostén la posición por 30 segundos. Lo tienes cuando: una muñeca relajada y arqueada con dedos curvados — como si sostuvieras una manzana. |
| hint: Your wrist should be arched (curved) — not flat against the guitar body. Fingers curved as if you're holding an apple. Relax. | Tu muñeca debe estar arqueada (curvada) — no plana contra el cuerpo de la guitarra. Dedos curvados como si sostuvieras una manzana. Relájate. |
| stuck: Drop your hand to your side and shake it loose, then place it back on the strings without tensing up — relaxed first, accurate second. | Deja caer tu mano a un lado y sacúdela para soltarla, y luego colócala de nuevo en las cuerdas sin tensarte — relajada primero, precisa después. |
| levelUp: Hold the shape, look away, then pluck each string in turn by feel alone — no peeking. | Sostén la forma, mira hacia otro lado, y luego pulsa cada cuerda por turno solo por sensación — sin mirar. |

**Station C — Pluck p-i-m-a — thumb bass, i-m-a treble**

| English | Spanish |
|---|---|
| text: Challenge 2 — p-i-m-a Plucks (your assessment piece): pluck once with each finger in order — p (low E), i (G), m (B), a (high e) — saying each letter aloud, 8 times at 60 BPM. You've got it when: the same volume from every finger, even the weaker ring (a). This open-string check is the Set 1 check-off. | Reto 2 — Pulsaciones p-i-m-a (tu pieza de evaluación): pulsa una vez con cada dedo en orden — p (Mi grave), i (G), m (B), a (mi aguda) — diciendo cada letra en voz alta, 8 veces a 60 BPM. Lo tienes cuando: el mismo volumen en cada dedo, incluso en el anular (a), que es más débil. Esta revisión con cuerdas al aire es el chequeo de la Unidad 1. |
| hint: No strumming, no pick. Each finger gets ONE string. Aim for the same volume from each finger — the ring finger (a) is usually the weakest at first. Set the ⏱ Timer for 2 minutes and loop it. | Sin rasgueo, sin púa. Cada dedo tiene UNA cuerda. Apunta al mismo volumen en cada dedo — el dedo anular (a) suele ser el más débil al principio. Pon el ⏱ Temporizador en 2 minutos y repítelo. |
| stuck: Pluck just p then i, over and over, until those two are even — then add m, then a. | Pulsa solo p y luego i, una y otra vez, hasta que esos dos salgan parejos — y luego agrega m, y luego a. |
| levelUp: Run it backwards (a-m-i-p), or close your eyes and keep every finger on its string. | Tócalo al revés (a-m-i-p), o cierra los ojos y mantén cada dedo en su cuerda. |
| playSeq label: Hear p-i-m-a on open strings | Escucha p-i-m-a en cuerdas al aire |
| response prompt: Personal record: play it cleanly at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN, even p-i-m-a lap (one full time through the pattern) today (BPM)? | Récord personal: tócalo limpio a 60 BPM, y luego sube el metrónomo de 10 en 10. ¿Tu vuelta p-i-m-a más rápida, LIMPIA y pareja (una vuelta = un recorrido completo del patrón) hoy (BPM)? |
| response placeholder: e.g. 80 — try for a higher number next time | p. ej. 80 — intenta superarlo la próxima vez |

**Station C — Move the thumb between bass strings**

| English | Spanish |
|---|---|
| text: Challenge 3 — Moving Bass: pluck the low E string with p then G-B-e with i-m-a, then the A string, then the D string with p — fingers staying put. You've got it when: only the thumb moves to find each bass note — the i-m-a fingers stay anchored. | Reto 3 — Bajo en movimiento: pulsa la cuerda Mi grave con p y luego G-B-e con i-m-a, luego la cuerda La, y luego la cuerda Re con p — los dedos se quedan quietos. Lo tienes cuando: solo el pulgar se mueve para encontrar cada nota grave — los dedos i-m-a se quedan anclados. |
| hint: This is how you change chords later — the thumb finds the bass note of the chord (root) while the fingers stay anchored on the treble strings. | Así es como cambiarás de acorde más adelante — el pulgar encuentra la nota grave del acorde (la raíz) mientras los dedos se quedan anclados en las cuerdas agudas. |
| stuck: Move just the thumb E → A → D with the fingers resting (not plucking) on G-B-e, until the thumb finds each bass without looking. | Mueve solo el pulgar E → A → D con los dedos apoyados (sin pulsar) en G-B-e, hasta que el pulgar encuentre cada nota grave sin mirar. |
| levelUp: Call out the bass string a beat before you play it, or shift E → A → D → A → E in a continuous loop without stopping. | Anuncia la cuerda grave un tiempo antes de tocarla, o cambia E → A → D → A → E en un loop continuo sin detenerte. |
| playSeq label: Thumb shifts: E · A · D bass with i-m-a above | Cambios del pulgar: bajo E · A · D con i-m-a arriba |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — "the cure", first touch: fret Am and pluck p (A string) · i · m · a, one note per beat at 60 BPM — that soft broken-chord sound IS the verse feel of "the cure". Then change to C: your thumb stays on the same bass STRING — C's root lives on the A string too, just at the 3rd fret, where your ring finger now supplies the new bass note. You've got it when: four clean p-i-m-a laps on Am and four on C, every note even. | Reto — "the cure", primer contacto: trastea Am y pulsa p (cuerda La) · i · m · a, una nota por tiempo a 60 BPM — ese sonido suave de acorde desglosado ES la sensación de la estrofa de "the cure". Luego cambia a C: tu pulgar se queda en la misma CUERDA grave — la raíz de C también vive en la cuerda La, solo que en el traste 3, donde tu dedo anular ahora aporta la nueva nota grave. Lo tienes cuando: cuatro vueltas limpias de p-i-m-a en Am y cuatro en C, cada nota pareja. |
| hint: Olivia's verse is fingerpicked for exactly this reason — soft and close. Wrist stays arched; only the fingers move. | La estrofa de Olivia está tocada con fingerpicking exactamente por esta razón — suave y cercana. La muñeca se mantiene arqueada; solo se mueven los dedos. |
| stuck: Run p-i-m-a on open strings first (no chord at all), then add the Am under it. | Toca p-i-m-a en cuerdas al aire primero (sin acorde alguno), y luego agrega el Am debajo. |
| levelUp: Add Dm and F: the thumb travels to the D string for both — and now you have the song's whole verse loop (Am · C · Dm · F). | Agrega Dm y F: el pulgar viaja a la cuerda Re para ambos — y ahora tienes todo el loop de la estrofa de la canción (Am · C · Dm · F). |
| playSeq label: "the cure" feel — p-i-m-a on Am | Sensación de "the cure" — p-i-m-a en Am |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| m8w1-s1 text: Hold a relaxed fingerpicking hand position — wrist arched, fingers curved | Mantener una posición relajada de la mano de fingerpicking — muñeca arqueada, dedos curvados |
| m8w1-s1 gotItWhen: you can hold the position for 30 seconds without your wrist collapsing flat, and your fingers stay curved (not flat) over the treble strings. | puedes mantener la posición durante 30 segundos sin que tu muñeca se aplane, y tus dedos se quedan curvados (no planos) sobre las cuerdas agudas. |
| m8w1-s1 practice prompt: In a correct fingerpicking hand position, your wrist should be: | En una posición correcta de la mano de fingerpicking, tu muñeca debería estar: |
| m8w1-s1 practice choices: Flat against the guitar body / Arched (curved away from the guitar) / Locked stiff / Pointing toward the floor | Plana contra el cuerpo de la guitarra / Arqueada (curvada lejos de la guitarra) / Bloqueada y rígida / Apuntando hacia el suelo |
| m8w1-s2 text: Identify p, i, m, a finger letters and their string assignments | Identificar las letras de dedos p, i, m, a y sus cuerdas asignadas |
| m8w1-s2 gotItWhen: you can say "p = thumb / bass strings, i = index / G, m = middle / B, a = ring / high e" without hesitating — and assign a finger to any string on demand. | puedes decir "p = pulgar / cuerdas graves, i = índice / G, m = medio / B, a = anular / mi aguda" sin dudar — y asignar un dedo a cualquier cuerda cuando se te pida. |
| m8w1-s2 practice prompt: In p-i-m-a notation, which finger handles the G string (string 3)? | En la notación p-i-m-a, ¿cuál dedo se encarga de la cuerda G (cuerda 3)? |
| m8w1-s2 practice choices: p (thumb) / i (index) / m (middle) / a (ring) | p (pulgar) / i (índice) / m (medio) / a (anular) |
| m8w1-s3 text: Pluck the low E string cleanly with my thumb (p) | Pulsar la cuerda Mi grave de forma limpia con mi pulgar (p) |
| m8w1-s3 gotItWhen: your thumb pulls down and slightly inward (toward the body) and the low E rings clearly with a warm, full tone — no clicking. | tu pulgar tira hacia abajo y ligeramente hacia adentro (hacia el cuerpo de la guitarra) y la Mi grave suena clara con un tono cálido y lleno — sin chasquidos. |
| m8w1-s3 practice label: Thumb only — low E · A · D bass strings | Solo el pulgar — cuerdas graves Mi · La · Re |
| m8w1-s4 text: Pluck the G, B, and high e strings with i, m, a fingers respectively | Pulsar las cuerdas G, B y mi aguda con los dedos i, m, a respectivamente |
| m8w1-s4 gotItWhen: each finger goes to its assigned string without you having to look — and all three sound roughly equal in volume. | cada dedo va a su cuerda asignada sin que tengas que mirar — y los tres suenan más o menos con el mismo volumen. |
| m8w1-s4 practice label: i · m · a on G · B · e | i · m · a en G · B · e |
| m8w1-s5 text: Pluck p-i-m-a in order on open strings at 60 BPM | Pulsar p-i-m-a en orden en cuerdas al aire a 60 BPM |
| m8w1-s5 gotItWhen: you can pluck low E (p), G (i), B (m), high e (a) in order, four times in a row at 60 BPM, all four notes equal in volume. | puedes pulsar Mi grave (p), G (i), B (m), mi aguda (a) en orden, cuatro veces seguidas a 60 BPM, con las cuatro notas iguales en volumen. |
| m8w1-s5 practice label: p-i-m-a (low E · G · B · e) at 60 BPM | p-i-m-a (Mi grave · G · B · e) a 60 BPM |
| m8w1-s6 text: Move the thumb to a different bass string while i-m-a stay on G, B, e | Mover el pulgar a una cuerda grave distinta mientras i-m-a se quedan en G, B, e |
| m8w1-s6 gotItWhen: when the chord changes from Em to Am, your thumb shifts from the low E string to the A string (finding the new root) while your i-m-a fingers stay anchored on G-B-e the whole time. | cuando el acorde cambia de Em a Am, tu pulgar se mueve de la cuerda Mi grave a la cuerda La (encontrando la nueva raíz) mientras tus dedos i-m-a se quedan anclados en G-B-e todo el tiempo. |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 8 · Finger Picking | Módulo 8 · Fingerpicking |
| subtitle: Basic PIMA pattern · The classic arpeggio (the notes of a chord played one at a time) · Over a single chord | Patrón básico PIMA · El arpegio clásico (las notas de un acorde tocadas una a la vez) · Sobre un solo acorde |
| skillFocus: Playing a PIMA arpeggio pattern · Keeping even timing and volume · Picking through a held chord | Tocar un patrón de arpegio PIMA · Mantener el tiempo y el volumen parejos · Puntear a través de un acorde sostenido |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for the 6-note pulse | Escucha el pulso de 6 notas |
| Section title: Try the pattern on Em | Prueba el patrón en Em |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — the 6-note pattern | Estación de práctica — el patrón de 6 notas |
| Section title: Play the p-i-m-a-m-i pattern on Em | Toca el patrón p-i-m-a-m-i en Em |
| Section title: Play the pattern on Am (move the thumb) | Toca el patrón en Am (mueve el pulgar) |
| Section title: Build up your tempo (70+ BPM) | Aumenta tu tempo (70+ BPM) |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: ⚡ Ear Spark — optional ear bonus | ⚡ Chispa auditiva — bono opcional de oído |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar (revisit 0:00–4:00). This time, watch one full pattern cycle and count the notes out loud with him. | Mira: Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar (revisita 0:00–4:00). Esta vez, mira un ciclo completo del patrón y cuenta las notas en voz alta con él. |
| hint: The "p-i-m-a-m-i" cycle (6 notes per bar) is one of the most-used patterns in folk and pop. It creates a flowing, arpeggiated feel under a chord. | El ciclo "p-i-m-a-m-i" (6 notas por compás) es uno de los patrones más usados en folk y pop. Crea una sensación fluida y arpegiada debajo de un acorde. |
| response prompt: In the 6-note pattern "p-i-m-a-m-i", how many times does each finger play in one cycle? | En el patrón de 6 notas "p-i-m-a-m-i", ¿cuántas veces toca cada dedo en un ciclo? |
| response explain: Count the letters: p(1) i(2) m(2) a(1) — i and m each play twice as the pattern climbs up and back down, while p and a play once. | Cuenta las letras: p(1) i(2) m(2) a(1) — i y m tocan cada uno dos veces mientras el patrón sube y vuelve a bajar, mientras que p y a tocan una vez. |
| response choices: p once, i twice, m twice, a once / Each finger plays exactly once / p three times, others once each / p twice, i once, m once, a twice | p una vez, i dos veces, m dos veces, a una vez / Cada dedo toca exactamente una vez / p tres veces, los demás una vez cada uno / p dos veces, i una vez, m una vez, a dos veces |
| text: Watch: Fingerpicking for Beginners — Pluck Patterns and Walkdowns – Lauren Bateman — a fingerpicking specialist's take on the same skill as Set 1's videos. Mute the strings with your fretting hand and tap the FINGER ORDER on the guitar top as she plays. | Mira: Fingerpicking for Beginners — Pluck Patterns and Walkdowns – Lauren Bateman — el enfoque de una especialista en fingerpicking sobre la misma destreza de los videos de la Unidad 1. Silencia las cuerdas con tu mano de trastear y marca el ORDEN DE LOS DEDOS en la tapa de la guitarra mientras ella toca. |
| hint: Second teacher, same rule: focus on the FINGER ORDER — once it's automatic, your speed will follow. | Segunda maestra, misma regla: concéntrate en el ORDEN DE LOS DEDOS — una vez que sea automático, la velocidad vendrá sola. |
| response placeholder: When the chord changes, does the picking pattern change too? And what did Lauren show that Set 1's videos didn't? | Cuando el acorde cambia, ¿el patrón de punteo también cambia? ¿Y qué mostró Lauren que los videos de la Unidad 1 no mostraron? |

**Station B — Listen for the 6-note pulse**

| English | Spanish |
|---|---|
| text: Listen to "Nothing Else Matters" by Metallica. The intro is entirely fingerpicked open chords. Tap along — can you feel the 6-note pulse? | Escucha "Nothing Else Matters" de Metallica. El intro son acordes al aire tocados enteramente con fingerpicking. Sigue el ritmo — ¿puedes sentir el pulso de 6 notas? |
| hint: James Hetfield famously taught himself this with no plan. He uses thumb-finger-thumb-finger patterns. Notice the constant thumb motion. | James Hetfield famosamente se enseñó esto a sí mismo sin ningún plan. Usa patrones de pulgar-dedo-pulgar-dedo. Fíjate en el movimiento constante del pulgar. |
| response prompt: In a typical fingerpicked arpeggio, what role does the THUMB usually play? | En un arpegio típico de fingerpicking, ¿qué papel suele cumplir el PULGAR? |
| response explain: The thumb is the anchor — it stays on a bass string and lays down the foundation while i, m, and a handle the higher, faster notes. | El pulgar es el ancla — se queda en una cuerda grave y sienta la base mientras i, m y a se encargan de las notas más agudas y rápidas. |
| response choices: It moves least — it stays on a bass string and provides the foundation / It moves fastest, switching strings every beat / It doesn't play at all in arpeggios / It plays the highest notes | Es el que menos se mueve — se queda en una cuerda grave y da la base / Es el que más rápido se mueve, cambiando de cuerda en cada tiempo / No toca para nada en los arpegios / Toca las notas más agudas |

**Station B — Try the pattern on Em**

| English | Spanish |
|---|---|
| text: Now try it: fret Em and play the 6-note p-i-m-a-m-i arpeggio. Click any note below the TAB to hear it, then play the staircase yourself — thumb on the low E (Em's root), i-m-a on G-B-e, then back down m-i. | Ahora pruébalo: trastea Em y toca el arpegio de 6 notas p-i-m-a-m-i. Haz clic en cualquier nota debajo del TAB para escucharla, y luego toca la escalera tú mismo — pulgar en la Mi grave (la raíz de Em), i-m-a en G-B-e, y luego de vuelta hacia abajo m-i. |
| hint: Em is all open strings on the treble side, so you can focus entirely on the picking hand. Read the TAB left to right — the bass note starts it, then the fingers climb and come back. | Em son todas cuerdas al aire del lado agudo, así que puedes concentrarte por completo en la mano de pulsar. Lee el TAB de izquierda a derecha — la nota grave lo empieza, y luego los dedos suben y vuelven. |
| tab caption: Em arpeggio · p-i-m-a-m-i · thumb on the low E | Arpegio de Em · p-i-m-a-m-i · pulgar en la Mi grave |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: did the pattern start to feel automatic, or were you still thinking through each finger? What would make it smoother? | Cierre de la estación — pausa y piensa: ¿el patrón empezó a sentirse automático, o todavía estabas pensando en cada dedo? ¿Qué lo haría más fluido? |
| response placeholder: e.g. still counting each finger — slowing the metronome down helped it flow | p. ej. todavía cuento cada dedo — bajar el metrónomo ayudó a que fluyera |

**Station C — Play the p-i-m-a-m-i pattern on Em**

| English | Spanish |
|---|---|
| text: Challenge 1 — Em Pattern: fret Em and play the 6-note pattern p-i-m-a-m-i at 60 BPM, one note per click, for 8 bars. You've got it when: a steady, even pulse with every note ringing clean. | Reto 1 — Patrón en Em: trastea Em y toca el patrón de 6 notas p-i-m-a-m-i a 60 BPM, una nota por clic, durante 8 compases. Lo tienes cuando: un pulso constante y parejo con cada nota sonando limpia. |
| hint: Count "1-2-3-4-5-6" — one number per pluck, one pluck per click — and let the six notes make one lap. Don't worry about exact rhythm yet; just keep the pulse steady. | Cuenta "1-2-3-4-5-6" — un número por pulsación, una pulsación por clic — y deja que las seis notas formen una vuelta. No te preocupes todavía por el ritmo exacto; solo mantén el pulso constante. |
| stuck: Drop the metronome and play the pattern as slowly as you need to — get the finger order automatic first, speed comes after. | Deja el metrónomo y toca el patrón tan despacio como necesites — logra que el orden de los dedos sea automático primero, la velocidad viene después. |
| levelUp: Play 8 bars without a single uneven note, or close your eyes and keep the pulse rock-steady. | Toca 8 compases sin una sola nota despareja, o cierra los ojos y mantén el pulso firme como una roca. |
| playSeq label: Em p-i-m-a-m-i pattern at 60 BPM | Patrón p-i-m-a-m-i en Em a 60 BPM |

**Station C — Play the pattern on Am (move the thumb)**

| English | Spanish |
|---|---|
| text: Challenge 2 — Am Pattern: fret Am and play the 6-note pattern over it — thumb on the A string (Am's root), i-m-a still on G-B-e — 8 times. You've got it when: only the thumb moves to the new bass; the fingers stay anchored. Click any note below the TAB to hear it. | Reto 2 — Patrón en Am: trastea Am y toca el patrón de 6 notas sobre él — pulgar en la cuerda La (la raíz de Am), i-m-a siguen en G-B-e — 8 veces. Lo tienes cuando: solo el pulgar se mueve hacia el nuevo bajo; los dedos se quedan anclados. Haz clic en cualquier nota debajo del TAB para escucharla. |
| hint: The only change from Em is which bass string the thumb plays. Fingers stay parked on G, B, high e. | El único cambio respecto a Em es en cuál cuerda grave toca el pulgar. Los dedos se quedan estacionados en G, B, mi aguda. |
| stuck: Drop the pattern — just pluck the Am bass (p) and let it ring, then add i-m-a one finger at a time. | Deja el patrón — solo pulsa el bajo de Am (p) y deja que suene, y luego agrega i-m-a un dedo a la vez. |
| levelUp: Switch Em → Am every 2 bars without breaking the pulse — only the thumb relocates. | Cambia Em → Am cada 2 compases sin romper el pulso — solo el pulgar se reubica. |
| tab caption: Am arpeggio · p-i-m-a-m-i · thumb on the A string | Arpegio de Am · p-i-m-a-m-i · pulgar en la cuerda La |

**Station C — Build up your tempo (70+ BPM)**

| English | Spanish |
|---|---|
| text: Challenge 3 — Raise Your Tempo (your assessment piece): play the Em pattern at 70 BPM, then try 80. You've got it when: clean at 70+ with the "a" finger landing right on its beat — drop back to 60 if it falls apart. This steady-pattern check is the Set 2 check-off. | Reto 3 — Sube tu tempo (tu pieza de evaluación): toca el patrón de Em a 70 BPM, y luego intenta 80. Lo tienes cuando: limpio a 70+ con el dedo "a" cayendo justo en su tiempo — baja a 60 si se desarma. Esta revisión de patrón constante es el chequeo de la Unidad 2. |
| hint: The most common mistake: the ring finger (a) comes in late. Pay extra attention to your ring finger — it needs to land exactly on its beat, no later. Set the ⏱ Timer for 2 minutes and loop it. | El error más común: el dedo anular (a) llega tarde. Presta atención extra a tu dedo anular — necesita caer exactamente en su tiempo, no después. Pon el ⏱ Temporizador en 2 minutos y repítelo. |
| stuck: Go back to 60 BPM and stay there until it's effortless — a clean 60 is better than a sloppy 80 every time. | Regresa a 60 BPM y quédate ahí hasta que salga sin esfuerzo — un 60 limpio siempre es mejor que un 80 desordenado. |
| levelUp: Push past 80 BPM, or play the pattern over Am at the same tempo with the thumb relocating. | Supera los 80 BPM, o toca el patrón sobre Am al mismo tempo con el pulgar reubicándose. |
| response prompt: Personal record: play it cleanly at 70 BPM, then raise the metronome +10 at a time. Your fastest CLEAN, even pattern today (BPM)? | Récord personal: tócalo limpio a 70 BPM, y luego sube el metrónomo de 10 en 10. ¿Tu patrón más rápido, LIMPIO y parejo hoy (BPM)? |
| response placeholder: e.g. 90 — try for a higher number next time | p. ej. 90 — intenta superarlo la próxima vez |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — "the cure", verse: play the 6-note p-i-m-a-m-i pattern over the verse loop — Am · C · Dm · F, one bar each at 60 BPM. Thumb: A string for Am and C, D string for Dm and F; i-m-a never leave G-B-e. You've got it when: one full lap with the pattern unbroken at every change. | Reto — "the cure", estrofa: toca el patrón de 6 notas p-i-m-a-m-i sobre el loop de la estrofa — Am · C · Dm · F, un compás cada uno a 60 BPM. Pulgar: cuerda La para Am y C, cuerda Re para Dm y F; i-m-a nunca dejan G-B-e. Lo tienes cuando: una vuelta completa con el patrón sin interrupciones en cada cambio. |
| hint: The four bass notes pair up: Am and C both live on the A string, Dm and F both live on the D string — the thumb travels only once, at C→Dm, then stays. The fingers never move at all. | Las cuatro notas graves se emparejan: Am y C viven en la cuerda La, Dm y F viven en la cuerda Re — el pulgar viaja solo una vez, en C→Dm, y luego se queda. Los dedos nunca se mueven. |
| stuck: Loop Am → C until your fretting hand lands on fret 3 without looking — the thumb just keeps plucking the A string — then add Dm and F as their own pair. | Repite Am → C hasta que tu mano de trastear caiga en el traste 3 sin mirar — el pulgar sigue pulsando la cuerda La — y luego agrega Dm y F como su propio par. |
| levelUp: Hum the melody over your own picking — this is the actual sound of the record. | Tararea la melodía sobre tu propio punteo — este es el sonido real de la grabación. |
| tab caption: "the cure" — fingerstyle bass roots · Am · C · Dm · F · one bar each · 60 BPM | "the cure" — raíces graves de fingerstyle · Am · C · Dm · F · un compás cada uno · 60 BPM |
| response prompt: Which change broke the pattern more — Am→C or C→Dm? | ¿Qué cambio rompió más el patrón — Am→C o C→Dm? |
| response placeholder: e.g. C→Dm — the thumb overshoots the D string | p. ej. C→Dm — el pulgar se pasa de la cuerda Re |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: What's your honest top clean tempo right now, and which finger gives out first when you push it? Write it below — that's your warm-up target next time. | ¿Cuál es honestamente tu mejor tempo limpio ahora mismo, y cuál dedo cede primero cuando lo aceleras? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez. |
| response placeholder: e.g. clean to 80, then the ring finger starts dragging behind the beat | p. ej. limpio hasta 80, y luego el dedo anular empieza a atrasarse del tiempo |

**Station C — ⚡ Ear Spark — optional ear bonus**

| English | Spanish |
|---|---|
| text: ⚡ Ear Spark (optional, 2 min): fingerpick Am leading with the thumb on either the A string or the D string — a few times in a mixed-up order, recorded. On playback, name which string the bass note was each time — low vs high bass is a fingerpicker's first ear skill. Got someone around? Have them pick while you listen. | ⚡ Chispa auditiva (opcional, 2 min): toca Am con fingerpicking empezando con el pulgar en la cuerda La o en la cuerda Re — varias veces en un orden mezclado, grabado. Al escuchar la grabación, nombra en cuál cuerda estaba la nota grave cada vez — grave vs. agudo en el bajo es la primera destreza auditiva de un fingerpicker. ¿Tienes a alguien cerca? Pídele que toque mientras tú escuchas. |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| m8w2-s1 text: Play the 6-note p-i-m-a-m-i pattern in order from memory | Tocar el patrón de 6 notas p-i-m-a-m-i en orden de memoria |
| m8w2-s1 gotItWhen: you can play the sequence p-i-m-a-m-i on open strings (or one chord) at 60 BPM without having to think about which finger comes next. | puedes tocar la secuencia p-i-m-a-m-i en cuerdas al aire (o un acorde) a 60 BPM sin tener que pensar cuál dedo sigue. |
| m8w2-s1 practice prompt: In the "p-i-m-a-m-i" pattern, which two fingers each play TWICE per bar? | En el patrón "p-i-m-a-m-i", ¿cuáles dos dedos tocan DOS VECES cada uno por compás? |
| m8w2-s1 practice choices: p and a / i and m / p and i / m and a | p y a / i y m / p e i / m y a |
| m8w2-s2 text: Pluck with even volume across all four fingers | Pulsar con volumen parejo en los cuatro dedos |
| m8w2-s2 gotItWhen: when you listen back to your picking, no single finger is noticeably louder or quieter than the others — including the ring finger (a), which is hardest. | cuando escuchas tu punteo grabado, ningún dedo suena notablemente más fuerte o más suave que los demás — incluyendo el dedo anular (a), que es el más difícil. |
| m8w2-s2 practice prompt: Which finger is usually the WEAKEST at first and needs extra practice? | ¿Cuál dedo suele ser el MÁS DÉBIL al principio y necesita práctica extra? |
| m8w2-s2 practice choices: p (thumb) / i (index) / m (middle) / a (ring) | p (pulgar) / i (índice) / m (medio) / a (anular) |
| m8w2-s3 text: Hold an Em chord while picking through it cleanly | Mantener un acorde Em mientras lo punteas de forma limpia |
| m8w2-s3 gotItWhen: your fretting hand stays planted on Em the entire bar while your picking hand cycles through the pattern — and every note rings clearly. | tu mano de trastear se queda plantada en Em durante todo el compás mientras tu mano de pulsar recorre el patrón — y cada nota suena con claridad. |
| m8w2-s3 practice label: Em arpeggio p-i-m-a-m-i | Arpegio de Em p-i-m-a-m-i |
| m8w2-s4 text: Play the pattern over Am (thumb on A string) | Tocar el patrón sobre Am (pulgar en la cuerda La) |
| m8w2-s4 gotItWhen: you can switch your THUMB from low E to A string when the chord changes Em → Am, while i-m-a stay on G-B-e the whole time. | puedes cambiar tu PULGAR de la Mi grave a la cuerda La cuando el acorde cambia de Em → Am, mientras i-m-a se quedan en G-B-e todo el tiempo. |
| m8w2-s4 practice label: Am arpeggio p-i-m-a-m-i | Arpegio de Am p-i-m-a-m-i |
| m8w2-s5 text: Keep the pattern steady at 70 BPM for 4+ bars | Mantener el patrón estable a 70 BPM durante 4 o más compases |
| m8w2-s5 gotItWhen: you can play the pattern for at least 4 bars at 70 BPM without your tempo slowing down or speeding up — the metronome and you agree the whole time. | puedes tocar el patrón durante al menos 4 compases a 70 BPM sin que tu tempo se atrase ni se acelere — el metrónomo y tú están de acuerdo todo el tiempo. |
| m8w2-s6 text: Switch the thumb to a new bass string at a chord change | Cambiar el pulgar a una nueva cuerda grave en un cambio de acorde |
| m8w2-s6 gotItWhen: at a chord change, only your thumb moves to find the new root note — i-m-a stay parked on G, B, high e. The pattern continues uninterrupted. | en un cambio de acorde, solo tu pulgar se mueve para encontrar la nueva nota raíz — i-m-a se quedan estacionados en G, B, mi aguda. El patrón continúa sin interrupciones. |

### Set 3

| English | Spanish |
|---|---|
| unit: Module 8 · Finger Picking | Módulo 8 · Fingerpicking |
| subtitle: Fingerpick a full progression · Travis picking intro · Performance song | Fingerpicking sobre una progresión completa · Introducción al Travis picking · Canción de interpretación |
| skillFocus: Fingerpicking through a chord progression · An intro to Travis picking · Performing a fingerpicked song | Tocar con fingerpicking a través de una progresión de acordes · Una introducción al Travis picking · Interpretar una canción con fingerpicking |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen through a full verse | Escucha una estrofa completa |
| Section title: Try the arpeggio on C | Prueba el arpegio en C |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — full progressions & performance | Estación de práctica — progresiones completas e interpretación |
| Section title: Fret each chord clean before you fingerpick it | Trastea cada acorde limpio antes de tocarlo con fingerpicking |
| Section title: Fingerpick a full chord progression | Toca con fingerpicking una progresión de acordes completa |
| Section title: Pinch the thumb and a finger together | Pellizca el pulgar y un dedo juntos |
| Section title: Try Travis picking | Prueba el Travis picking |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Perform a fingerpicked song | Interpreta una canción con fingerpicking |
| Section title: Station Wrap-Up | Cierre de la estación |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: How To Travis Pick on Guitar – Lauren Bateman (0:00–5:00). As you watch, tap the alternating thumb on your knee — bass on 1, the other bass on 3 — before you ever add the fingers. | Mira: How To Travis Pick on Guitar – Lauren Bateman (0:00–5:00). Mientras miras, marca el pulgar alternante en tu rodilla — bajo en el 1, el otro bajo en el 3 — antes de siquiera agregar los dedos. |
| hint: Travis picking uses an ALTERNATING thumb: bass note on beat 1, a different bass note on beat 3. The fingers fill in between. It's the foundation of country, folk, and a lot of pop. | El Travis picking usa un pulgar ALTERNANTE: nota grave en el tiempo 1, una nota grave distinta en el tiempo 3. Los dedos rellenan en el medio. Es la base del country, el folk y mucho pop. |
| response prompt: In Travis picking, what does the THUMB do? | En el Travis picking, ¿qué hace el PULGAR? |
| response explain: The Travis "engine" is the thumb alternating between two bass strings (usually the root and the 5th) in steady time, while the fingers add melody on top. | El "motor" del Travis picking es el pulgar alternando entre dos cuerdas graves (normalmente la raíz y la quinta) en tiempo constante, mientras los dedos agregan melodía encima. |
| response choices: Plays the same bass note over and over / Alternates between two bass notes — usually the root and the 5th / Doesn't play at all / Plays the melody | Toca la misma nota grave una y otra vez / Alterna entre dos notas graves — normalmente la raíz y la quinta / No toca en absoluto / Toca la melodía |
| text: Watch: Nothing Else Matters Guitar Lesson Part 1 – Marty Music (0:00–4:00). Watch one chord change closely — notice when his fretting hand starts moving toward the next shape. | Mira: Nothing Else Matters Guitar Lesson Part 1 – Marty Music (0:00–4:00). Observa de cerca un cambio de acorde — fíjate cuándo su mano de trastear empieza a moverse hacia la siguiente forma. |
| hint: The hardest part: keeping the picking pattern PERFECTLY STEADY through a chord change. Anticipate the next chord — start moving your fretting hand on the LAST note of the current bar. | La parte más difícil: mantener el patrón de punteo PERFECTAMENTE CONSTANTE a través de un cambio de acorde. Anticipa el siguiente acorde — empieza a mover tu mano de trastear en la ÚLTIMA nota del compás actual. |
| response placeholder: When you fingerpick from Am to C, when (which note in the bar) does your fretting hand start preparing for the next chord? | Cuando tocas con fingerpicking de Am a C, ¿cuándo (en cuál nota del compás) empieza tu mano de trastear a prepararse para el siguiente acorde? |

**Station B — Listen through a full verse**

| English | Spanish |
|---|---|
| text: Listen to one of: "House of the Rising Sun", "Dust in the Wind", or "Hallelujah". Listen to a full verse. Can you hear when the chord changes? Does the pattern ever break? | Escucha una de estas: "House of the Rising Sun", "Dust in the Wind", o "Hallelujah". Escucha una estrofa completa. ¿Puedes escuchar cuándo cambia el acorde? ¿El patrón se rompe en algún momento? |
| hint: In professional recordings the pattern almost never breaks at a chord change — that's your standard. It's a high bar but worth aiming for. | En las grabaciones profesionales el patrón casi nunca se rompe en un cambio de acorde — ese es tu estándar. Es una meta alta pero vale la pena perseguirla. |
| response placeholder: Which song did you listen to? Did the picking pattern stay completely steady through every chord change? | ¿Cuál canción escuchaste? ¿El patrón de punteo se mantuvo completamente estable en cada cambio de acorde? |

**Station B — Try the arpeggio on C**

| English | Spanish |
|---|---|
| text: Now try it: fret C and play the 6-note arpeggio over it. Click any note below the TAB to hear it, then play the staircase — thumb on the A string's 3rd fret (C's root), i-m-a on G-B-e, then back down m-i. | Ahora pruébalo: trastea C y toca el arpegio de 6 notas sobre él. Haz clic en cualquier nota debajo del TAB para escucharla, y luego toca la escalera — pulgar en el traste 3 de la cuerda La (la raíz de C), i-m-a en G-B-e, y luego de vuelta hacia abajo m-i. |
| hint: C uses the same picking pattern as Em and Am — only the thumb's bass note changes. Read the TAB left to right and match each pluck. | C usa el mismo patrón de punteo que Em y Am — solo cambia la nota grave del pulgar. Lee el TAB de izquierda a derecha y haz coincidir cada pulsación. |
| tab caption: C arpeggio · p-i-m-a-m-i · thumb on the A string (3rd fret) | Arpegio de C · p-i-m-a-m-i · pulgar en la cuerda La (traste 3) |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: across the whole module, which is harder for you — keeping the picking pattern steady, or changing chords cleanly underneath it? What's your plan for the harder one? | Cierre de la estación — pausa y piensa: a lo largo de todo el módulo, ¿qué se te hace más difícil — mantener el patrón de punteo estable, o cambiar de acorde limpiamente debajo de él? ¿Cuál es tu plan para lo más difícil? |
| response placeholder: e.g. chord changes break my pattern — I'll practice moving the fretting hand a beat early | p. ej. los cambios de acorde rompen mi patrón — voy a practicar mover la mano de trastear un tiempo antes |

**Station C — Fret each chord clean before you fingerpick it**

| English | Spanish |
|---|---|
| text: Challenge 1 — Clean Shapes First: before you fingerpick the progression, strum each chord once (Am, C, D, F) and check every string rings — these are the exact open chords you learned in Module 5. You've got it when: all four shapes clean on a strum before you pick a single note through them. | Reto 1 — Formas limpias primero: antes de tocar la progresión con fingerpicking, rasguea cada acorde una vez (Am, C, D, F) y revisa que suenen todas las cuerdas — estos son exactamente los acordes al aire que aprendiste en el Módulo 5. Lo tienes cuando: las cuatro formas suenan limpias con un rasgueo antes de puntear una sola nota a través de ellas. |
| hint: Fingerpicking exposes every note, so a chord that was "good enough" for strumming in Module 5 needs to be truly clean here. Fix the fretting hand first; then the picking hand has something solid to work over. | El fingerpicking expone cada nota, así que un acorde que era "suficientemente bueno" para rasguear en el Módulo 5 necesita estar de verdad limpio aquí. Arregla primero la mano de trastear; luego la mano de pulsar tiene algo sólido con qué trabajar. |
| stuck: Whichever shape buzzes, fix just that one — adjust your finger angle so the fingertip (not the pad) presses just behind the fret. | La forma que zumbe, arregla solo esa — ajusta el ángulo de tu dedo para que la punta (no la yema plana) presione justo detrás del traste. |
| levelUp: Fret each shape, lift off, and re-fret it cleanly 5 times in a row before moving to the next chord. | Trastea cada forma, levanta los dedos, y vuelve a trastearla limpia 5 veces seguidas antes de pasar al siguiente acorde. |

**Station C — Fingerpick a full chord progression**

| English | Spanish |
|---|---|
| text: Challenge 2 — Full Progression: play the 6-note arpeggio over a 4-chord progression — Am–C–D–F or C–Am–F–G — 1 bar each at 60 BPM. You've got it when: the thumb finds each chord's root bass while the fingers stay on G-B-e. | Reto 2 — Progresión completa: toca el arpegio de 6 notas sobre una progresión de 4 acordes — Am–C–D–F o C–Am–F–G — 1 compás cada uno a 60 BPM. Lo tienes cuando: el pulgar encuentra el bajo raíz de cada acorde mientras los dedos se quedan en G-B-e. |
| hint: For each chord, the thumb plays the ROOT bass note (Am = A string, C = A string, D = D string, F = D string). Fingers always on G-B-e. | Para cada acorde, el pulgar toca la nota grave RAÍZ (Am = cuerda La, C = cuerda La, D = cuerda Re, F = cuerda Re). Los dedos siempre en G-B-e. |
| stuck: Drop to two chords (Am–C) and loop just that change until the pattern doesn't break, then add D and F. | Baja a dos acordes (Am–C) y repite solo ese cambio hasta que el patrón no se rompa, y luego agrega D y F. |
| levelUp: Run the full four-chord loop without a single broken pattern, or nudge the metronome to 70 BPM. | Corre el loop completo de cuatro acordes sin un solo patrón roto, o empuja el metrónomo a 70 BPM. |
| playSeq label: Am · C · D · F bass roots | Raíces graves Am · C · D · F |
| response prompt: Personal record: play it cleanly at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN lap of the progression today (BPM)? | Récord personal: tócalo limpio a 60 BPM, y luego sube el metrónomo de 10 en 10. ¿Tu vuelta más rápida y LIMPIA de la progresión hoy (BPM)? |
| response placeholder: e.g. 75 — try for a higher number next time | p. ej. 75 — intenta superarlo la próxima vez |

**Station C — Pinch the thumb and a finger together**

| English | Spanish |
|---|---|
| text: Challenge 3 — The Pinch: fret C and "pinch" two strings at once — thumb on the A string (root) and your "a" finger on the high e, plucked at the SAME instant, on each beat for 8 beats. You've got it when: both notes sound together as one, perfectly in sync — not one slightly before the other. | Reto 3 — El pellizco: trastea C y "pellizca" dos cuerdas a la vez — pulgar en la cuerda La (raíz) y tu dedo "a" en la mi aguda, pulsadas en el MISMO instante, en cada tiempo durante 8 tiempos. Lo tienes cuando: ambas notas suenan juntas como una sola, perfectamente sincronizadas — no una ligeramente antes que la otra. |
| hint: A pinch is the bridge between arpeggios and Travis picking — thumb and finger move toward each other and meet. Listen for ONE sound, not a flam (two close hits). | Un pellizco es el puente entre los arpegios y el Travis picking — el pulgar y el dedo se mueven uno hacia el otro y se encuentran. Escucha UN solo sonido, no un "flam" (dos golpes muy cercanos). |
| stuck: Pluck the bass and the treble separately first, slowly, then bring them closer until they land together. | Pulsa el bajo y la aguda por separado primero, despacio, y luego acércalos hasta que caigan juntos. |
| levelUp: Pinch on beats 1 & 3 and fill beats 2 & 4 with a single i-pluck on the B string — that's the Travis groove (its steady rhythmic feel) starting to form. | Pellizca en los tiempos 1 y 3 y rellena los tiempos 2 y 4 con una sola pulsación de i en la cuerda B — así empieza a formarse el groove del Travis picking (su sensación rítmica constante). |

**Station C — Try Travis picking**

| English | Spanish |
|---|---|
| text: Challenge 4 — Travis Thumb: warm up Travis picking on C — thumb alternating the A string (beats 1 & 3) and G string (beats 2 & 4), thumb-only at 60 BPM. Notice Travis reassigns your fingers on purpose: the thumb now claims the G string too, and the i finger takes the B — a deliberate break from Set 1's one-finger-per-string rule. You've got it when: a steady, even alternating thumb — then add an i-pluck on the B string on each "+". | Reto 4 — Pulgar Travis: calienta el Travis picking en C — pulgar alternando entre la cuerda La (tiempos 1 y 3) y la cuerda G (tiempos 2 y 4), solo el pulgar a 60 BPM. Fíjate que Travis reasigna tus dedos a propósito: el pulgar ahora también reclama la cuerda G, y el dedo i toma la B — una ruptura deliberada de la regla de un-dedo-por-cuerda de la Unidad 1. Lo tienes cuando: un pulgar alternante constante y parejo — y luego agrega una pulsación de i en la cuerda B en cada "+". |
| hint: Just the thumb! Once that's steady, add an i-pluck on the B string on the "+" of each beat. Travis picking adds fingers ON TOP of an already-grooving thumb. | ¡Solo el pulgar! Una vez que esté estable, agrega una pulsación de i en la cuerda B en el "+" de cada tiempo. El Travis picking agrega dedos ENCIMA de un pulgar que ya tiene groove. |
| stuck: Thumb only, no fingers, as slow as you need — get the alternating bass rock-steady before adding anything on top. | Solo el pulgar, sin dedos, tan despacio como necesites — logra que el bajo alternante sea firme como una roca antes de agregar algo encima. |
| levelUp: Add the i-pluck on every "+", or carry the alternating thumb through a C → Am change without it stumbling. | Agrega la pulsación de i en cada "+", o lleva el pulgar alternante a través de un cambio C → Am sin que tropiece. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Let It Be, fingerpicked: play the four-chord verse — C · G · Am · F — with the 6-note pattern over each chord, one bar each at 60 BPM. Thumb roots: C and Am on the A string, G on the low E, F on the D string. You've got it when: a full verse with the pattern unbroken — the same song you strummed in Modules 5 and 6, now a lullaby. Song Journey: the fingerstyle arrangement. | Reto — Let It Be, con fingerpicking: toca la estrofa de cuatro acordes — C · G · Am · F — con el patrón de 6 notas sobre cada acorde, un compás cada uno a 60 BPM. Raíces del pulgar: C y Am en la cuerda La, G en la Mi grave, F en la cuerda Re. Lo tienes cuando: una estrofa completa con el patrón sin interrupciones — la misma canción que rasgueaste en los Módulos 5 y 6, ahora una canción de cuna. Recorrido de la canción: el arreglo fingerstyle. |
| hint: Anticipate like the second lesson video showed you: the fretting hand starts moving on the pattern's 6th note, so beat 1 always lands ready. | Anticipa como te mostró el segundo video de la lección: la mano de trastear empieza a moverse en la 6ª nota del patrón, así que el tiempo 1 siempre cae listo. |
| stuck: Strum each chord once to check it rings, then loop just C → G — the only change where the thumb crosses to the low E. | Rasguea cada acorde una vez para revisar que suene, y luego repite solo C → G — el único cambio donde el pulgar cruza hacia la Mi grave. |
| levelUp: Add a pinch (p + a together) on beat 1 of each chord and hear the verse bloom, or sing it over your own picking. | Agrega un pellizco (p + a juntos) en el tiempo 1 de cada acorde y escucha cómo florece la estrofa, o cántala sobre tu propio punteo. |
| tab caption: "Let It Be" — fingerstyle bass roots · C · G · Am · F · one bar each · 60 BPM | "Let It Be" — raíces graves de fingerstyle · C · G · Am · F · un compás cada uno · 60 BPM |

**Station C — Perform a fingerpicked song**

| English | Spanish |
|---|---|
| text: Challenge 5 — Perform It (your assessment piece — try it!): pick one song — "the cure", "Hallelujah" (from Module 5's song list), "Let It Be" (verse), or a choice-list song — and play it through 3 times without stopping, even with mistakes. No score — practice the recovery; keep going no matter what. | Reto 5 — Interprétala (tu pieza de evaluación — ¡pruébalo!): elige una canción — "the cure", "Hallelujah" (de la lista de canciones del Módulo 5), "Let It Be" (estrofa), o una canción de la lista de elección — y tócala completa 3 veces sin detenerte, incluso con errores. Sin puntaje — practica la recuperación; sigue adelante pase lo que pase. |
| hint: Mistakes are normal — stopping is what makes them sound bad, so keep going and practice the recovery. No one to play for? Record yourself on your phone or device and watch it back — the playback shows you exactly where the pattern broke. | Los errores son normales — detenerte es lo que los hace sonar mal, así que sigue adelante y practica la recuperación. ¿No tienes a nadie para quien tocar? Grábate en tu teléfono o dispositivo y vuelve a verlo — la grabación te muestra exactamente dónde se rompió el patrón. |
| stuck: Pick the shortest, slowest song you know (Hallelujah is forgiving) and play just the verse — finishing matters more than difficulty. | Elige la canción más corta y lenta que conozcas (Hallelujah es indulgente) y toca solo la estrofa — terminar importa más que la dificultad. |
| levelUp: Perform standing up, or play it for family or a friend and keep going through any mistake. | Interprétala de pie, o tócala para tu familia o un amigo y sigue adelante a través de cualquier error. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: You've reached the end of the first half of the course — what fingerpicking skill are you proudest of, and what's the one song you want to keep working on after this module? Write it below. | Has llegado al final de la primera mitad del curso — ¿de cuál destreza de fingerpicking estás más orgulloso, y cuál es la única canción que quieres seguir trabajando después de este módulo? Escríbelo abajo. |
| response placeholder: e.g. proud of clean arpeggios; want to keep working on Blackbird | p. ej. orgulloso de mis arpegios limpios; quiero seguir trabajando en Blackbird |

**Set 3 — Skills**

| English | Spanish |
|---|---|
| m8w3-s1 text: Fingerpick a 4-chord progression with the pattern unbroken | Tocar con fingerpicking una progresión de 4 acordes con el patrón sin interrupciones |
| m8w3-s1 gotItWhen: you can play Am–C–D–F (or another 4-chord progression) with the 6-note arpeggio over each chord, and the pattern never breaks at a chord change. | puedes tocar Am–C–D–F (u otra progresión de 4 acordes) con el arpegio de 6 notas sobre cada acorde, y el patrón nunca se rompe en un cambio de acorde. |
| m8w3-s1 practice label: Am · C · D · F bass roots | Raíces graves Am · C · D · F |
| m8w3-s2 text: Demonstrate Travis picking — thumb alternates between two bass strings | Demostrar el Travis picking — el pulgar alterna entre dos cuerdas graves |
| m8w3-s2 gotItWhen: your thumb plays the root of the chord on beats 1 and 3, and a different bass string on beats 2 and 4 — steadily, for at least 4 bars. | tu pulgar toca la raíz del acorde en los tiempos 1 y 3, y una cuerda grave distinta en los tiempos 2 y 4 — de forma constante, durante al menos 4 compases. |
| m8w3-s2 practice prompt: In Travis picking on a C major chord, your thumb might alternate between which two strings? | En el Travis picking sobre un acorde de C mayor, ¿tu pulgar podría alternar entre cuáles dos cuerdas? |
| m8w3-s2 practice choices: B string and high e / A string (root C) and G string / High e and G string / Low E and high e | La cuerda B y la mi aguda / La cuerda La (raíz de C) y la cuerda G / La mi aguda y la cuerda G / La Mi grave y la mi aguda |
| m8w3-s3 text: Keep the picking pattern steady through a chord change | Mantener el patrón de punteo estable a través de un cambio de acorde |
| m8w3-s3 gotItWhen: when the chord changes mid-song, you don't miss a single note in the picking pattern — the fretting hand catches up, but the picking pattern stays exact. | cuando el acorde cambia a mitad de la canción, no te pierdes ni una sola nota del patrón de punteo — la mano de trastear se pone al día, pero el patrón de punteo se mantiene exacto. |
| m8w3-s4 text: Anticipate the next chord by moving the fretting hand on the last note of the bar | Anticipar el siguiente acorde moviendo la mano de trastear en la última nota del compás |
| m8w3-s4 gotItWhen: your fretting hand starts repositioning for the next chord BEFORE the current bar ends — by the time the new bar starts, you're ready. | tu mano de trastear empieza a reposicionarse para el siguiente acorde ANTES de que termine el compás actual — para cuando empieza el nuevo compás, ya estás listo. |
| m8w3-s4 practice prompt: When should your FRETTING hand start moving toward the next chord? | ¿Cuándo debería tu mano de TRASTEAR empezar a moverse hacia el siguiente acorde? |
| m8w3-s4 practice choices: On the first beat of the new bar / On the LAST note of the current bar — anticipate / Halfway through the current bar / Never — wait for the change | En el primer tiempo del nuevo compás / En la ÚLTIMA nota del compás actual — anticipa / A la mitad del compás actual / Nunca — espera al cambio |
| m8w3-s5 text: Play a full verse of a fingerpicked song from start to finish | Tocar una estrofa completa de una canción con fingerpicking de principio a fin |
| m8w3-s5 gotItWhen: you can fingerpick through a complete verse of "House of the Rising Sun" or "Hallelujah" (from Module 5's song list) without stopping — mistakes ok, but you keep going. | puedes tocar con fingerpicking una estrofa completa de "House of the Rising Sun" o "Hallelujah" (de la lista de canciones del Módulo 5) sin detenerte — los errores están bien, pero sigues adelante. |
| m8w3-s6 text: Perform a fingerpicked song for an audience (family, a friend, or a recording you share) | Interpretar una canción con fingerpicking para una audiencia (familia, un amigo, o una grabación que compartas) |
| m8w3-s6 gotItWhen: you can perform your chosen song for someone — in person or on a recording you share — all the way through, with fingerpicking, and recover from any mistakes without breaking down. | puedes interpretar tu canción elegida para alguien — en persona o en una grabación que compartas — de principio a fin, con fingerpicking, y recuperarte de cualquier error sin desmoronarte. |

### Module-level Songs

MODULE_SONGS[8] meta fields (song title shown for reference, not itself translated on the site).

| English | Spanish |
|---|---|
| "the cure" — Olivia Rodrigo — meta: Fingerpick the verse for a soft feel · Am–C–Dm–F | Toca la estrofa con fingerpicking para una sensación suave · Am–C–Dm–F |
| "Let It Be" — The Beatles — meta: Fingerpick the verse · C–G–Am–F | Toca la estrofa con fingerpicking · C–G–Am–F |
| "House of the Rising Sun" — The Animals — meta: Am–C–D–F–Am–C–E–E · the classic fingerpicked song | Am–C–D–F–Am–C–E–E · la canción clásica de fingerpicking |
| "Sailor Song" — Gigi Perez — meta: Fingerpicked verse · capo IV (G-shapes) | Estrofa con fingerpicking · capo en el traste 4 (formas de G) |
| "Blackbird" — The Beatles — meta: Advanced fingerpicking · course capstone challenge | Fingerpicking avanzado · reto final del curso |
| "Tu Boda" — Oscar Maydon × Fuerza Regida — meta: Sierreño-style fingerpicking | Fingerpicking estilo sierreño |
| "Just Like Heaven" — The Cure — meta: Iconic arpeggiated intro riff — dreamy chord-picking | Riff de intro arpegiado e icónico — punteo de acordes soñador |

### Module Review

| English | Spanish |
|---|---|
| module: Finger Picking | Fingerpicking |
| skill mr8-s1: I can hold a relaxed fingerpicking hand — wrist arched, fingers curved — for 30 seconds without it collapsing flat | Puedo mantener una mano de fingerpicking relajada — muñeca arqueada, dedos curvados — durante 30 segundos sin que se aplane |
| skill mr8-s2: I can assign p to the bass strings and i-m-a to G-B-e, and put any finger on its string without looking | Puedo asignar p a las cuerdas graves e i-m-a a G-B-e, y poner cualquier dedo en su cuerda sin mirar |
| skill mr8-s3: I can pluck p-i-m-a in order on open strings at 60 BPM with even volume on every finger, including the ring (a) | Puedo pulsar p-i-m-a en orden en cuerdas al aire a 60 BPM con volumen parejo en cada dedo, incluyendo el anular (a) |
| skill mr8-s4: I can play the 6-note p-i-m-a-m-i arpeggio from memory while holding a chord, every note ringing clean | Puedo tocar el arpegio de 6 notas p-i-m-a-m-i de memoria mientras sostengo un acorde, con cada nota sonando limpia |
| skill mr8-s7: I can fingerpick a full 4-chord progression without the pattern breaking at any chord change | Puedo tocar con fingerpicking una progresión completa de 4 acordes sin que el patrón se rompa en ningún cambio de acorde |
| skill mr8-s9: I can perform a full fingerpicked song start to finish, recovering from any mistake without stopping | Puedo interpretar una canción completa con fingerpicking de principio a fin, recuperándome de cualquier error sin detenerme |
| assessItem: Fingerpick a 4-chord progression with the 6-note arpeggio, keeping the pattern unbroken through every chord change | Toca con fingerpicking una progresión de 4 acordes con el arpegio de 6 notas, manteniendo el patrón sin interrupciones en cada cambio de acorde |
| assessItem: Perform one full fingerpicked song from the song list start to finish, recovering from any mistakes without stopping | Interpreta una canción completa con fingerpicking de la lista de canciones de principio a fin, recuperándote de cualquier error sin detenerte |
| forward: You've got the full first-half toolkit — notes, chords, power chords, lead, barre, strumming, and fingerpicking. <strong>The second half of the course goes deeper:</strong> Module 9 finishes the fretboard (all six strings) and teaches you to write your own TAB — the first step toward learning any song on your own. | Ya tienes el kit de herramientas completo de la primera mitad — notas, acordes, power chords, solos, cejilla, rasgueo y fingerpicking. <strong>La segunda mitad del curso profundiza más:</strong> el Módulo 9 termina el mástil (las seis cuerdas) y te enseña a escribir tu propio TAB — el primer paso hacia aprender cualquier canción por tu cuenta. |

## Module 9 — The Full Fretboard & Writing TAB

### Set 1

| English | Spanish |
|---|---|
| unit: Module 9 · The Full Fretboard & Writing TAB | Módulo 9 · El mástil completo y cómo escribir TAB |
| subtitle: Welcome back · Prove it, don't re-learn it | Bienvenido de vuelta · Demuéstralo, no lo vuelvas a aprender |
| skillFocus: Six quick re-tests: open chords · strumming · pentatonic · power chords · TAB reading · fingerpicking | Seis repasos rápidos: acordes abiertos · rasgueo · pentatónica · acordes de potencia · lectura de TAB · fingerpicking |
| Station B title: Computer station — Where do I start? | Estación de computadora — ¿Por dónde empiezo? |
| Section title: The six re-tests — rate yourself honestly | Los seis repasos — evalúate con honestidad |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — clear it or flag it | Estación de práctica — apruébalo o márcalo |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: The six re-tests — mark each one as you go | Los seis repasos — márcalos a medida que avanzas |

**Station B — The six re-tests — rate yourself honestly**

| English | Spanish |
|---|---|
| text: This set has zero new material. It's a checkpoint: six things you could already do before the break. Play each one RIGHT NOW as you read it, then answer honestly — solid, shaky, or gone. Nothing here is graded; a "gone" just tells you where to spend your first practice session. | Esta unidad no tiene material nuevo. Es un chequeo: seis cosas que ya podías hacer antes del receso. Toca cada una AHORA MISMO mientras la lees, y luego responde con honestidad — sólida, insegura, o perdida. Nada de esto se califica; un "perdida" solo te dice dónde pasar tu primera sesión de práctica. |
| hint: Everyone loses a little over a break. Finding out exactly what you lost is the fastest way to get it back — usually it returns in a day or two, not weeks. | Todos pierden algo durante un receso. Descubrir exactamente qué perdiste es la forma más rápida de recuperarlo — normalmente vuelve en un día o dos, no en semanas. |
| text: Re-test 1 — Open chords (Module 5): loop C → G → Am → F, two bars each at 60 BPM. Can you still land every change on beat 1 without breaking the strum? | Repaso 1 — Acordes abiertos (Módulo 5): repite C → G → Am → F, dos compases cada uno a 60 BPM. ¿Todavía puedes caer en cada cambio justo en el tiempo 1 sin romper el rasgueo? |
| hint: If one change drags, name it — that exact change is your first One-Minute Changes drill (a drill is a short exercise you repeat to build a skill). | Si un cambio se atrasa, identifícalo — ese cambio exacto es tu primer ejercicio de Cambios de Un Minuto (un ejercicio es una actividad corta que repites para desarrollar una destreza). |
| response placeholder: Solid / shaky / gone — which change gives you trouble? | Sólida / insegura / perdida — ¿cuál cambio te cuesta trabajo? |
| text: Re-test 2 — Strumming (Module 6): D-DU-UDU over a G → C change at 70 BPM. Does the pattern keep running while the chord moves, or does it break at the change? | Repaso 2 — Rasgueo (Módulo 6): D-DU-UDU sobre un cambio de G → C a 70 BPM. ¿El patrón sigue corriendo mientras cambia el acorde, o se rompe en el cambio? |
| hint: Watch your strum hand, not your fret hand — the pattern should not care which chord is underneath. | Observa tu mano de rasgueo, no tu mano de trastear — al patrón no le debería importar cuál acorde hay debajo. |
| response placeholder: Solid / shaky / gone — does the pattern break at the change? | Sólida / insegura / perdida — ¿el patrón se rompe en el cambio? |
| text: Re-test 3 — Pentatonic (Module 4): Pattern 1, up and back down, from memory. No diagram, every note on a 60 BPM click? | Repaso 3 — Pentatónica (Módulo 4): Patrón 1, hacia arriba y de vuelta hacia abajo, de memoria. ¿Sin diagrama, cada nota en el clic a 60 BPM? |
| hint: Hesitations count as "shaky" — you should know the pattern by feel, not by reading it. | Las dudas cuentan como "insegura" — deberías saber el patrón por sensación, no por leerlo. |
| response placeholder: Solid / shaky / gone — where do you hesitate? | Sólida / insegura / perdida — ¿dónde dudas? |
| text: Re-test 4 — Power chords (Module 3): move the two-finger shape E5 → G5 → A5, one change per bar, landing on the beat and naming each chord as you land it. | Repaso 4 — Acordes de potencia (Módulo 3): mueve la forma de dos dedos E5 → G5 → A5, un cambio por compás, cayendo en el tiempo y nombrando cada acorde al caer en él. |
| hint: Frets 0 → 3 → 5 on the low E root. If you're counting frets to find G5, that's a "shaky." | Trastes 0 → 3 → 5 con raíz en la Mi grave. Si estás contando trastes para encontrar G5, eso es "insegura." |
| response placeholder: Solid / shaky / gone — can you still name them quickly while playing? | Sólida / insegura / perdida — ¿todavía puedes nombrarlos rápido mientras tocas? |
| text: Re-test 5 — TAB reading (Module 2): open any Song Journey page and find a section you've never played. Can you read 4 bars cold (cold = playing it the very first time you see it, no practice) — right strings, right frets, left to right? | Repaso 5 — Lectura de TAB (Módulo 2): abre cualquier página de Recorrido de la canción y busca una sección que nunca hayas tocado. ¿Puedes leer 4 compases a primera vista (a primera vista = tocarlo la primera vez que lo ves, sin práctica) — cuerdas correctas, trastes correctos, de izquierda a derecha? |
| hint: It must be TAB you haven't drilled — reading from memory isn't reading. | Debe ser TAB que no hayas practicado — leer de memoria no es leer. |
| response placeholder: Solid / shaky / gone — what did you read, and how did it go? | Sólida / insegura / perdida — ¿qué leíste, y cómo te fue? |
| text: Re-test 6 — Fingerpicking (Module 8): p-i-m-a over Am, thumb on the A string, without stopping. Then change Em → Am and let the thumb switch bass strings while i-m-a stay put. | Repaso 6 — Fingerpicking (Módulo 8): p-i-m-a sobre Am, pulgar en la cuerda La, sin detenerte. Luego cambia Em → Am y deja que el pulgar cambie de cuerda grave mientras i-m-a se quedan quietos. |
| hint: The fingers keep their strings for the whole test — only the thumb travels. | Los dedos mantienen sus cuerdas durante toda la prueba — solo el pulgar viaja. |
| response placeholder: Solid / shaky / gone — did the thumb switch make you mess up? | Sólida / insegura / perdida — ¿el cambio del pulgar te hizo equivocarte? |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Look at your six answers. Which ONE re-test most needs more practice before you go deeper into Module 9? That's the first thing you practice next session — the original module's sets are all still there when you need them. | Mira tus seis respuestas. ¿Cuál ÚNICO repaso necesita más práctica antes de profundizar en el Módulo 9? Eso es lo primero que practicas la próxima sesión — las unidades del módulo original siguen ahí cuando las necesites. |
| hint: One focused session on your weakest re-test is better than a vague "practice everything." | Una sesión enfocada en tu repaso más débil vale más que un vago "practicar todo." |
| response placeholder: e.g. Re-test 3 — Pattern 1 is half-gone; starting next session with Module 4, Set 1 | p. ej. Repaso 3 — el Patrón 1 está a medio olvidar; empiezo la próxima sesión con el Módulo 4, Unidad 1 |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: A break detunes guitars as reliably as it makes your fingers out of practice — check first. | Un receso desafina las guitarras tan seguro como desentrena tus dedos — revisa primero. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — The six re-tests — mark each one as you go**

| English | Spanish |
|---|---|
| text: How this works: play each re-test below, then mark its skill on the checklist. Clear it → "I've got it!". Struggle → "Still working on it" — that's not a failure, it's your practice list, and the pointer next to each re-test tells you exactly which module rebuilds it. | Cómo funciona: toca cada repaso de abajo, y luego marca su destreza en la lista de verificación. Lo apruebas → "¡Ya lo tengo!". Te cuesta → "Todavía en proceso" — eso no es un fracaso, es tu lista de práctica, y el enlace junto a cada repaso te dice exactamente cuál módulo lo reconstruye. |
| hint: Be strict. A generous self-check here just hides work that will come back in Module 10. | Sé estricto. Una autoevaluación generosa aquí solo esconde trabajo que reaparecerá en el Módulo 10. |
| text: Re-test 1 — Open chords: 2 bars each of C, G, Am, F at 60 BPM, looped twice, every change on beat 1. Where to practice it: Module 5, Set 2 (the C–G–Am–F Loop and One-Minute Changes). | Repaso 1 — Acordes abiertos: 2 compases cada uno de C, G, Am, F a 60 BPM, repetido dos veces, cada cambio en el tiempo 1. Dónde practicarlo: Módulo 5, Unidad 2 (el Loop C–G–Am–F y Cambios de Un Minuto). |
| hint: Quality bar: no dead strings, no pause at the change. | Nivel de calidad: sin cuerdas apagadas, sin pausa en el cambio. |
| text: Re-test 2 — Strumming: D-DU-UDU for 4 bars of G, then 4 bars of C at 70 BPM, the pattern never stopping where the two chords meet. Where to practice it: Module 6, Set 2. | Repaso 2 — Rasgueo: D-DU-UDU durante 4 compases de G, y luego 4 compases de C a 70 BPM, el patrón nunca se detiene donde se encuentran los dos acordes. Dónde practicarlo: Módulo 6, Unidad 2. |
| hint: If it breaks, drop to 60 BPM and rebuild — speed comes back last. | Si se rompe, baja a 60 BPM y reconstrúyelo — la velocidad vuelve al final. |
| text: Re-test 3 — Pentatonic Pattern 1: up and back down from memory at 60 BPM, every note on the click. Use the play button to hear the target. Where to practice it: Module 4, Set 1. | Repaso 3 — Patrón pentatónico 1: hacia arriba y de vuelta hacia abajo de memoria a 60 BPM, cada nota en el clic. Usa el botón de reproducir para escuchar el objetivo. Dónde practicarlo: Módulo 4, Unidad 1. |
| hint: Fingers first, speed later — a clean 50 BPM pass is better than a sloppy 60. | Primero los dedos, luego la velocidad — una pasada limpia a 50 BPM vale más que una desordenada a 60. |
| playSeq label: Am pentatonic Pattern 1 (ascending) | Patrón pentatónico 1 de Am (ascendente) |
| text: Re-test 4 — Power chords: E5 → G5 → A5 (low-E root, frets 0 → 3 → 5), one bar each on the beat, saying each name as you land it. Where to practice it: Module 3, Set 1. | Repaso 4 — Acordes de potencia: E5 → G5 → A5 (raíz en la Mi grave, trastes 0 → 3 → 5), un compás cada uno en el tiempo, diciendo cada nombre al caer en él. Dónde practicarlo: Módulo 3, Unidad 1. |
| hint: Two fingers, unused strings muted — the mute is part of the skill. | Dos dedos, las cuerdas que no usas silenciadas — el silenciado es parte de la destreza. |
| text: Re-test 5 — TAB cold read: 4 bars of TAB you've never played, from any Song Journey page, right strings and frets in order. Where to practice it: Module 2, Set 2. | Repaso 5 — Lectura a primera vista de TAB: 4 compases de TAB que nunca hayas tocado, de cualquier página de Recorrido de la canción, cuerdas y trastes correctos en orden. Dónde practicarlo: Módulo 2, Unidad 2. |
| hint: Slow is fine — sight-reading is decoding, not speed. | Ir despacio está bien — la lectura a primera vista es descifrar, no velocidad. |
| text: Re-test 6 — Fingerpicking: p-i-m-a over Am (thumb on A) for 4 bars without stopping, then Em → Am with the thumb switching bass strings while you keep playing. Where to practice it: Module 8, Sets 1–2. | Repaso 6 — Fingerpicking: p-i-m-a sobre Am (pulgar en La) durante 4 compases sin detenerte, y luego Em → Am con el pulgar cambiando de cuerda grave mientras sigues tocando. Dónde practicarlo: Módulo 8, Unidades 1–2. |
| hint: Even volume across all four fingers — listen for the weak one. | Volumen parejo en los cuatro dedos — escucha cuál es el más débil. |
| text: The fast round: record yourself playing all six re-tests back to back, then listen with the checklist open and settle any you weren't sure about. Cleared all six? Module 9 proper starts at Set 2. Flagged some? Spend a session with the practice spots listed above first — they come back fast. | La ronda rápida: grábate tocando los seis repasos seguidos, y luego escucha con la lista de verificación abierta y resuelve cualquiera del que no estuvieras seguro. ¿Aprobaste los seis? El Módulo 9 propiamente empieza en la Unidad 2. ¿Marcaste algunos? Dedica una sesión a los puntos de práctica listados arriba primero — vuelven rápido. |
| hint: The recording shows exactly how you really sounded — that's exactly why it's useful. | La grabación muestra exactamente cómo sonaste de verdad — por eso es tan útil. |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| m9w0-s1 text: RE-TEST: Switch C → G → Am → F smoothly at 60 BPM | REPASO: Cambiar C → G → Am → F sin problemas a 60 BPM |
| m9w0-s1 gotItWhen: you loop C → G → Am → F, two bars each at 60 BPM, landing every change on beat 1 without breaking the strum. Level up: pick any two of those four at random (shuffle homemade flashcards, or close your eyes and point at the chart) and switch between them on beat 1 at 70 BPM. | repites C → G → Am → F, dos compases cada uno a 60 BPM, cayendo en cada cambio en el tiempo 1 sin romper el rasgueo. Sube de nivel: elige dos de esos cuatro al azar (baraja tarjetas caseras, o cierra los ojos y señala el diagrama) y cambia entre ellos en el tiempo 1 a 70 BPM. |
| m9w0-s2 text: RE-TEST: Play D-DU-UDU over a G–C change at 70 BPM | REPASO: Tocar D-DU-UDU sobre un cambio de G–C a 70 BPM |
| m9w0-s2 gotItWhen: you switch from G to C (or any two chords) and the pattern doesn't change at all — only the chord underneath does. | cambias de G a C (o cualquier par de acordes) y el patrón no cambia para nada — solo cambia el acorde debajo. |
| m9w0-s3 text: RE-TEST: Play pentatonic Pattern 1 up and down at 60 BPM | REPASO: Tocar el Patrón pentatónico 1 hacia arriba y hacia abajo a 60 BPM |
| m9w0-s3 gotItWhen: you can play the full pattern up and back down without looking at a diagram, with no missed notes or hesitations. | puedes tocar el patrón completo hacia arriba y de vuelta hacia abajo sin mirar un diagrama, sin notas perdidas ni dudas. |
| m9w0-s3 practice label: Am pentatonic Pattern 1 (ascending) | Patrón pentatónico 1 de Am (ascendente) |
| m9w0-s4 text: RE-TEST: Move a two-finger power chord E5 → G5 → A5 on the beat | REPASO: Mover un acorde de potencia de dos dedos E5 → G5 → A5 en el tiempo |
| m9w0-s4 gotItWhen: you can move the same shape to any of those positions whenever you want and name the chord without counting frets. | puedes mover la misma forma a cualquiera de esas posiciones cuando quieras y nombrar el acorde sin contar trastes. |
| m9w0-s5 text: RE-TEST: Read and play a 4-bar TAB you haven't seen before | REPASO: Leer y tocar un TAB de 4 compases que no hayas visto antes |
| m9w0-s5 gotItWhen: you can look at a short TAB line you haven't drilled, identify which string and fret each number refers to, and play it — that's sight-reading. | puedes mirar una línea corta de TAB que no hayas practicado, identificar a cuál cuerda y traste se refiere cada número, y tocarla — eso es lectura a primera vista. |
| m9w0-s6 text: RE-TEST: Fingerpick p-i-m-a over Am without stopping | REPASO: Tocar con fingerpicking p-i-m-a sobre Am sin detenerte |
| m9w0-s6 gotItWhen: you can switch your THUMB from low E to A string when the chord changes Em → Am, while i-m-a stay on G-B-e the whole time. | puedes cambiar tu PULGAR de la Mi grave a la cuerda La cuando el acorde cambia Em → Am, mientras i-m-a se quedan en G-B-e todo el tiempo. |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 9 · The Full Fretboard & Writing TAB | Módulo 9 · El mástil completo y cómo escribir TAB |
| subtitle: Notes on D & G · The octave shortcut · Sharps & flats | Notas en D y G · El atajo de la octava · Sostenidos y bemoles |
| skillFocus: Natural notes on D (0–12) · Natural notes on G (0–12) · The two-string octave shape | Notas naturales en D (0–12) · Notas naturales en G (0–12) · La forma de octava de dos cuerdas |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for the note names | Escucha los nombres de las notas |
| Section title: Try naming from anywhere on the neck | Prueba nombrar desde cualquier parte del mástil |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — the D and G strings | Estación de práctica — las cuerdas D y G |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Say-then-play the D and G strings | Di y luego toca las cuerdas D y G |
| Section title: Flashcard flash-drill | Ejercicio relámpago de tarjetas |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Station Wrap-Up | Cierre de la estación |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: Learn Every Note on the Fretboard (Start With This Simple System) – Marty Music (0:00–6:00). Follow along on your own guitar as he walks the D and G strings. | Mira: Learn Every Note on the Fretboard (Start With This Simple System) – Marty Music (0:00–6:00). Sigue el ritmo en tu propia guitarra mientras él recorre las cuerdas D y G. |
| hint: Marty builds the fretboard the same way you already know the E and A strings from Module 2 — natural notes, then the sharps and flats that sit between them. | Marty construye el mástil de la misma manera que ya conoces las cuerdas E y A del Módulo 2 — notas naturales, y luego los sostenidos y bemoles que están entre ellas. |
| response prompt: The D string at fret 2 is which note? | ¿Cuál nota es la cuerda D en el traste 2? |
| response explain: D to E is a whole step — two frets — with D# sitting at fret 1 between them. | De D a E hay un tono entero — dos trastes — con D# ubicado en el traste 1 entre ambas. |
| response choices: D# / E / F / C | D# / E / F / C |
| text: Watch: Open Notes On The Guitar | Practical Beginner Lesson – JustinGuitar as a refresher on the open strings, then apply the same idea moving up the D and G strings fret by fret. | Mira: Open Notes On The Guitar | Practical Beginner Lesson – JustinGuitar como repaso de las cuerdas al aire, y luego aplica la misma idea subiendo por las cuerdas D y G traste por traste. |
| hint: Refresh how each open string got its name in Module 1 — the exact same logic just keeps climbing the neck one fret at a time. | Refresca cómo cada cuerda al aire recibió su nombre en el Módulo 1 — es exactamente la misma lógica, solo que sigue subiendo por el mástil un traste a la vez. |
| response prompt: On the G string, C sits at which fret? | En la cuerda G, ¿en cuál traste está C? |
| response explain: G(0) → A(2) → B(4) → C(5). B to C is a half step, so C is only one fret above B. | G(0) → A(2) → B(4) → C(5). De B a C hay un semitono, así que C está solo un traste arriba de B. |
| response choices: 3 / 4 / 5 / 7 | 3 / 4 / 5 / 7 |

**Station B — Listen for the note names**

| English | Spanish |
|---|---|
| text: Listen for it: play up the D string one fret at a time, saying each note name OUT LOUD before you check a chart. Then do the same up the G string. Notice where you hesitate — that's tonight's target. | Escucha esto: toca hacia arriba por la cuerda D un traste a la vez, diciendo cada nombre de nota EN VOZ ALTA antes de revisar un diagrama. Luego haz lo mismo en la cuerda G. Fíjate dónde dudas — ese es tu objetivo de esta noche. |
| hint: Naming a note before you check it (not after) is what actually builds the recall — reading a chart at the same time you say the name just trains you to read the chart. | Nombrar una nota antes de revisarla (no después) es lo que realmente construye la memoria — leer un diagrama al mismo tiempo que dices el nombre solo te entrena a leer el diagrama. |
| response prompt: You know A is at fret 5 on the low E string. Using the octave shape — two strings down, two frets up — where's the next A? | Sabes que A está en el traste 5 de la cuerda Mi grave. Usando la forma de octava — dos cuerdas hacia abajo, dos trastes hacia arriba — ¿dónde está la siguiente A? |
| response explain: From the low E or A string, the octave lives two strings toward the floor and two frets toward the body. | Desde la cuerda Mi grave o La, la octava vive dos cuerdas hacia el piso y dos trastes hacia el cuerpo de la guitarra. |
| response choices: D string, fret 7 / G string, fret 5 / D string, fret 5 / A string, fret 7 | Cuerda D, traste 7 / Cuerda G, traste 5 / Cuerda D, traste 5 / Cuerda A, traste 7 |

**Station B — Try naming from anywhere on the neck**

| English | Spanish |
|---|---|
| text: Now try it: starting from any note you already know on the low E or A string, use the octave shape (two strings down, two frets up) to find its twin on the D or G string. Try it from three different starting notes. | Ahora pruébalo: empezando desde cualquier nota que ya conozcas en la cuerda Mi grave o La, usa la forma de octava (dos cuerdas hacia abajo, dos trastes hacia arriba) para encontrar su gemela en la cuerda D o G. Pruébalo desde tres notas de partida distintas. |
| hint: This is the whole point of the octave shape — it turns one memorized note into a second one for free, anywhere on the neck. | Este es todo el sentido de la forma de octava — convierte una nota memorizada en una segunda gratis, en cualquier parte del mástil. |
| response prompt: Which two natural notes have NO sharp or flat between them? | ¿Cuáles dos notas naturales NO tienen sostenido ni bemol entre ellas? |
| response explain: B–C and E–F are the two natural half steps — one fret apart, nothing in between. | B–C y E–F son los dos semitonos naturales — un traste de separación, nada en medio. |
| response choices: A and B / B and C / C and D / F and G | A y B / B y C / C y D / F y G |
| text: Try the top of the neck: play fret 12 on the D string, then fret 12 on the G string. Say what you notice about fret 12 compared to the open string. | Prueba la parte alta del mástil: toca el traste 12 en la cuerda D, y luego el traste 12 en la cuerda G. Di qué notas sobre el traste 12 comparado con la cuerda al aire. |
| hint: Fret 12 is the octave marker on every string — look for the double-dot inlay as your landmark. | El traste 12 es el marcador de octava en cada cuerda — busca el incrustado de doble punto como tu referencia. |
| response prompt: The D string at fret 12 is which note? | ¿Cuál nota es la cuerda D en el traste 12? |
| response explain: Fret 12 is always the octave — the same note as the open string, one octave higher. | El traste 12 siempre es la octava — la misma nota que la cuerda al aire, una octava más aguda. |
| response choices: C / D / E / D# | C / D / E / D# |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — which string's notes stuck faster today, D or G, and what trick helped? | Cierre de la estación — ¿las notas de cuál cuerda se te quedaron más rápido hoy, D o G, y qué truco ayudó? |
| response placeholder: e.g. G was easier — its B–C half step gave me a landmark at fret 4; the octave shape helped me check myself | p. ej. G fue más fácil — su semitono B–C me dio una referencia en el traste 4; la forma de octava me ayudó a comprobarme |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Every note-naming drill today depends on your strings actually being in tune — check first. | Cada ejercicio de nombrar notas de hoy depende de que tus cuerdas realmente estén afinadas — revisa primero. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Say-then-play the D and G strings**

| English | Spanish |
|---|---|
| text: Challenge 1 — D-String Naturals: say-then-play every natural note on the D string, low to high, 0 through 12. You've got it when: naming them takes under 15 seconds with no chart. | Reto 1 — Notas naturales de la cuerda D: di y luego toca cada nota natural de la cuerda D, de grave a aguda, del traste 0 al 12. Lo tienes cuando: nombrarlas te toma menos de 15 segundos sin diagrama. |
| hint: Say the note name first, THEN play it — that order is what builds the recall. | Di el nombre de la nota primero, y LUEGO tócala — ese orden es lo que construye la memoria. |
| stuck: Cover frets 0–5 (D–A) first, get those solid, then add 7–12. | Cubre primero los trastes 0–5 (D–A), domínalos, y luego agrega 7–12. |
| levelUp: Say-then-play backwards, high to low. | Di y luego toca al revés, de aguda a grave. |
| playSeq label: D-string naturals, low to high | Notas naturales de la cuerda D, de grave a aguda |
| text: Challenge 2 — G-String Naturals: same drill on the G string, low to high, 0 through 12. | Reto 2 — Notas naturales de la cuerda G: el mismo ejercicio en la cuerda G, de grave a aguda, del traste 0 al 12. |
| hint: Each string has TWO natural half steps (notes one fret apart) between frets 0 and 12. The first one you meet going up: on D it's E–F (F at fret 3), on G it's B–C (B at fret 4, C at fret 5). The other pair sits at frets 9–10 on both strings — B–C on the D string, E–F on the G string. | Cada cuerda tiene DOS semitonos naturales (notas separadas por un traste) entre los trastes 0 y 12. El primero que encuentras subiendo: en D es E–F (F en el traste 3), en G es B–C (B en el traste 4, C en el traste 5). El otro par está en los trastes 9–10 en ambas cuerdas — B–C en la cuerda D, E–F en la cuerda G. |
| stuck: Cover frets 0–5 (G–C) first, then add 5–12. | Cubre primero los trastes 0–5 (G–C), y luego agrega 5–12. |
| levelUp: Time yourself — name a random fret correctly three times in a row, then try to beat your time. Got someone around? Race them instead. | Cronométrate — nombra un traste al azar correctamente tres veces seguidas, y luego intenta superar tu tiempo. ¿Tienes a alguien cerca? Compite contra esa persona. |
| playSeq label: G-string naturals, low to high | Notas naturales de la cuerda G, de grave a aguda |

**Station C — Flashcard flash-drill**

| English | Spanish |
|---|---|
| text: Challenge 3 — Flash Drill (your assessment piece): make flashcards — write each natural note name (A through G) on its own slip of paper, shuffle them face-down, and draw one at a time. Find each drawn note on the D or G string within 5 seconds, switching strings every 5 draws. You've got it when: 8 out of 10 correct within 5 seconds each, on both strings. Got someone around? Have them call the notes instead of drawing cards. | Reto 3 — Ejercicio relámpago (tu pieza de evaluación): haz tarjetas — escribe cada nombre de nota natural (de A a G) en su propia tira de papel, barájalas boca abajo, y saca una a la vez. Encuentra cada nota sacada en la cuerda D o G en menos de 5 segundos, cambiando de cuerda cada 5 tarjetas. Lo tienes cuando: 8 de 10 correctas en menos de 5 segundos cada una, en ambas cuerdas. ¿Tienes a alguien cerca? Que te diga las notas en vez de sacar tarjetas. |
| hint: If you're stuck, use the octave shape from a string you already know instead of counting up one fret at a time. | Si te atoras, usa la forma de octava desde una cuerda que ya conozcas en vez de contar traste por traste. |
| stuck: Allow 10 seconds instead of 5 until it's automatic, then lower the time limit again. | Permite 10 segundos en vez de 5 hasta que sea automático, y luego baja el límite de tiempo de nuevo. |
| levelUp: Add sharp and flat cards too (F#, Bb), or drop to a 3-second limit. | Agrega también tarjetas de sostenidos y bemoles (F#, Bb), o baja el límite a 3 segundos. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Sweet Child O' Mine, name it as you play it: watch the intro-riff clip — a riff is a short musical phrase that repeats — that you first saw in Module 7 (Sweet Child O' Mine Intro in Standard Tuning – Jbf Music & Guitar) and learn just its first two notes, up on the D and G strings around fret 12–15. Say each note's NAME as you play it, using today's D/G-string knowledge to figure it out instead of just copying frets. 🧵 Song Journey: this song's Journey page. | Reto — Sweet Child O' Mine, nómbralo mientras lo tocas: mira el clip del riff de intro — un riff es una frase musical corta que se repite — que viste por primera vez en el Módulo 7 (Sweet Child O' Mine Intro in Standard Tuning – Jbf Music & Guitar) y aprende solo sus primeras dos notas, arriba en las cuerdas D y G alrededor del traste 12–15. Di el NOMBRE de cada nota mientras la tocas, usando lo que sabes hoy de las cuerdas D/G para descifrarla en vez de solo copiar los trastes. 🧵 Recorrido de la canción: la página de Recorrido de esta canción. |
| hint: This riff lives up the neck on strings you've never named notes on before today — that's exactly why it's the reward for this set. | Este riff vive arriba en el mástil, en cuerdas donde nunca antes habías nombrado notas — por eso es exactamente la recompensa de esta unidad. |
| stuck: Pause the video on the very first note and just name that one string/fret before moving on. | Pausa el video en la primerísima nota y solo nombra esa cuerda/traste antes de continuar. |
| levelUp: Name all four notes of the opening phrase before you play them, then check yourself against the video. | Nombra las cuatro notas de la frase de apertura antes de tocarlas, y luego compruébate con el video. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Which fret on D or G still makes you pause and count? Write it below — that's your warm-up target next time. | ¿Cuál traste en D o G todavía te hace pausar y contar? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez. |
| response placeholder: e.g. fret 9 on the G string — I still count up from the fret-7 dot | p. ej. traste 9 en la cuerda G — todavía cuento desde el punto del traste 7 |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| m9w1-s1 text: Name the natural notes on the D string, frets 0–12, in order | Nombrar las notas naturales de la cuerda D, trastes 0–12, en orden |
| m9w1-s1 gotItWhen: naming them takes under 15 seconds with no chart | nombrarlas te toma menos de 15 segundos sin diagrama |
| m9w1-s1 practice label: D-string naturals, low to high | Notas naturales de la cuerda D, de grave a aguda |
| m9w1-s2 text: Name the natural notes on the G string, frets 0–12, in order | Nombrar las notas naturales de la cuerda G, trastes 0–12, en orden |
| m9w1-s2 practice label: G-string naturals, low to high | Notas naturales de la cuerda G, de grave a aguda |
| m9w1-s3 text: Find any named note (drawn from a shuffled flashcard) on the D or G string within 5 seconds | Encontrar cualquier nota nombrada (sacada de una tarjeta barajada) en la cuerda D o G en menos de 5 segundos |
| m9w1-s3 practice prompt: On the D string, G is at which fret? | En la cuerda D, ¿en cuál traste está G? |
| m9w1-s3 practice choices: 3 / 5 / 7 / 9 | 3 / 5 / 7 / 9 |
| m9w1-s4 text: Use the octave shape to find a D- or G-string note from an E- or A-string note I already know | Usar la forma de octava para encontrar una nota en D o G a partir de una nota en E o A que ya conozco |
| m9w1-s4 practice prompt: The octave shape from the low E and A strings moves you: | La forma de octava desde las cuerdas Mi grave y La te mueve: |
| m9w1-s4 practice choices: Two strings down, two frets up / Two strings down, same fret / One string down, two frets up / Two strings down, three frets up | Dos cuerdas hacia abajo, dos trastes hacia arriba / Dos cuerdas hacia abajo, el mismo traste / Una cuerda hacia abajo, dos trastes hacia arriba / Dos cuerdas hacia abajo, tres trastes hacia arriba |
| m9w1-s5 text: Play the Sweet Child O' Mine intro fragment on the D and G strings from TAB | Tocar el fragmento de intro de Sweet Child O' Mine en las cuerdas D y G a partir del TAB |
| m9w1-s6 text: Say which two natural notes any sharp or flat on D or G sits between | Decir entre cuáles dos notas naturales se ubica cualquier sostenido o bemol en D o G |
| m9w1-s6 practice prompt: F# on the D string sits at which fret? | ¿En cuál traste está F# en la cuerda D? |
| m9w1-s6 practice choices: 3 / 4 / 5 / 2 | 3 / 4 / 5 / 2 |

### Set 3

| English | Spanish |
|---|---|
| unit: Module 9 · The Full Fretboard & Writing TAB | Módulo 9 · El mástil completo y cómo escribir TAB |
| subtitle: Notes on B & e · The B-string bump · The whole neck | Notas en B y e · El desfase de la cuerda B · Todo el mástil |
| skillFocus: Naturals on B (0–12) · Naturals on high e (they mirror low E) · The 3-fret octave shift onto B & e | Notas naturales en B (0–12) · Notas naturales en mi aguda (reflejan la Mi grave) · El desplazamiento de octava de 3 trastes hacia B y e |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for the six-string landmarks | Escucha las referencias de las seis cuerdas |
| Section title: Try the whole fretboard | Prueba con todo el mástil |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — the whole fretboard | Estación de práctica — todo el mástil |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Say-then-play the B and high-e strings | Di y luego toca las cuerdas B y mi aguda |
| Section title: Six-string landmark drill | Ejercicio de referencias de las seis cuerdas |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Station Wrap-Up | Cierre de la estación |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: Learn Every Note on the Fretboard (Start With This Simple System) – Marty Music (6:00–end), finishing the fretboard on the B and high-e strings. | Mira: Learn Every Note on the Fretboard (Start With This Simple System) – Marty Music (6:00–final), terminando el mástil en las cuerdas B y mi aguda. |
| hint: Notice the B string breaks the pattern you learned last set — it's tuned a half-step "early," which shifts every shape crossing onto it. | Fíjate que la cuerda B rompe el patrón que aprendiste la unidad pasada — está afinada un semitono "antes," lo cual desplaza cualquier forma que cruce hacia ella. |
| response prompt: The high e string's notes are the same as which other string? | ¿Las notas de la cuerda mi aguda son las mismas que las de cuál otra cuerda? |
| response explain: Both E strings are tuned to E — same note names at every fret, two octaves apart. | Ambas cuerdas E están afinadas en E — los mismos nombres de nota en cada traste, separadas por dos octavas. |
| response choices: The B string / The low E string / The G string / No other string | La cuerda B / La cuerda Mi grave / La cuerda G / Ninguna otra cuerda |
| text: Watch: Finding Notes On The Guitar Neck Using Octaves – JustinGuitar. Pay close attention to what changes when the shape crosses onto the B string — that's today's 3-fret bump. | Mira: Finding Notes On The Guitar Neck Using Octaves – JustinGuitar. Presta mucha atención a qué cambia cuando la forma cruza hacia la cuerda B — ese es el desfase de 3 trastes de hoy. |
| hint: Every octave shape you've used so far has been "two strings down, two frets up." Crossing onto B (or e) adds one extra fret — watch for it in the video. | Toda forma de octava que has usado hasta ahora ha sido "dos cuerdas hacia abajo, dos trastes hacia arriba." Cruzar hacia B (o e) agrega un traste extra — obsérvalo en el video. |
| response prompt: The octave shape coming FROM the D or G string onto the B or e string moves: | La forma de octava que va DESDE la cuerda D o G hacia la cuerda B o e se mueve: |
| response explain: The B string is tuned a step "early," so every shape crossing onto B (or e) stretches one extra fret — the B-string bump. | La cuerda B está afinada un paso "antes," así que toda forma que cruce hacia B (o e) se estira un traste extra — el desfase de la cuerda B. |
| response choices: Two strings down, two frets up / Two strings down, three frets up / Two strings down, same fret / One string down, three frets up | Dos cuerdas hacia abajo, dos trastes hacia arriba / Dos cuerdas hacia abajo, tres trastes hacia arriba / Dos cuerdas hacia abajo, el mismo traste / Una cuerda hacia abajo, tres trastes hacia arriba |

**Station B — Listen for the six-string landmarks**

| English | Spanish |
|---|---|
| text: Listen for it: play the dot-fret landmarks (3, 5, 7, 9, 12) across all six strings and say each note out loud before checking a chart. These five frets are your fastest shortcuts anywhere on the neck. | Escucha esto: toca las referencias de los trastes con punto (3, 5, 7, 9, 12) en las seis cuerdas y di cada nota en voz alta antes de revisar un diagrama. Estos cinco trastes son tus atajos más rápidos en cualquier parte del mástil. |
| hint: You already know these dots as fretting landmarks — today you're also learning what they're called on every string. | Ya conoces estos puntos como referencias de trasteo — hoy también aprendes cómo se llaman en cada cuerda. |
| response prompt: On the B string, C sits at which fret? | En la cuerda B, ¿en cuál traste está C? |
| response explain: B to C is a natural half step — one fret. | De B a C hay un semitono natural — un traste. |
| response choices: 1 / 2 / 3 / 5 | 1 / 2 / 3 / 5 |
| text: Try the dot at fret 7 on every string — name each note before checking. Dot frets are the fastest landmarks on the whole neck. | Prueba el punto en el traste 7 en cada cuerda — nombra cada nota antes de revisar. Los trastes con punto son las referencias más rápidas de todo el mástil. |
| hint: You already used fret 7 to tune by ear (5th-fret/7th-fret method) — now you're naming what's there. | Ya usaste el traste 7 para afinar de oído (método del traste 5/traste 7) — ahora estás nombrando lo que hay ahí. |
| response prompt: At the dot on fret 7, the low E string plays: | En el punto del traste 7, la cuerda Mi grave toca: |
| response explain: E→F(1)→G(3)→A(5)→B(7). Dot frets (3-5-7-9-12) are your landmarks. | E→F(1)→G(3)→A(5)→B(7). Los trastes con punto (3-5-7-9-12) son tus referencias. |
| response choices: A / B / C / G | A / B / C / G |

**Station B — Try the whole fretboard**

| English | Spanish |
|---|---|
| text: Now try it: pick any note name and find it on all six strings, one string at a time, using the octave shape (remembering the B-string bump) rather than counting from open every time. | Ahora pruébalo: elige el nombre de cualquier nota y encuéntrala en las seis cuerdas, una cuerda a la vez, usando la forma de octava (recordando el desfase de la cuerda B) en vez de contar desde el aire cada vez. |
| hint: This is the moment the whole fretboard suddenly makes sense — one note, six places to find it. | Este es el momento en que todo el mástil de repente tiene sentido — una nota, seis lugares para encontrarla. |
| response prompt: The B string at fret 5 is the same pitch as which open string? | ¿La cuerda B en el traste 5 es la misma nota que cuál cuerda al aire? |
| response explain: B(0)→C(1)→D(3)→E(5). B at fret 5 = E, the open high-e — that's exactly how you tune by ear. | B(0)→C(1)→D(3)→E(5). B en el traste 5 = E, la mi aguda al aire — así es exactamente como afinas de oído. |
| response choices: G / D / High e / A | G / D / Mi aguda / A |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — where on the neck are you still slowest? Name the string and fret zone. | Cierre de la estación — ¿dónde en el mástil todavía eres más lento? Nombra la cuerda y la zona de trastes. |
| response placeholder: e.g. B string frets 6–10 — I still count up from fret 5 | p. ej. cuerda B, trastes 6–10 — todavía cuento desde el traste 5 |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Say-then-play the B and high-e strings**

| English | Spanish |
|---|---|
| text: Challenge 1 — B-String Naturals: say-then-play every natural note on the B string, low to high, 0 through 12. | Reto 1 — Notas naturales de la cuerda B: di y luego toca cada nota natural de la cuerda B, de grave a aguda, del traste 0 al 12. |
| hint: Remember: B to C is only ONE fret, not two — the exception to the pattern you learned on D and G. | Recuerda: de B a C hay solo UN traste, no dos — la excepción al patrón que aprendiste en D y G. |
| stuck: Cover frets 0–5 (B–E) first, then add 5–12. | Cubre primero los trastes 0–5 (B–E), y luego agrega 5–12. |
| levelUp: Say-then-play backwards, high to low, without slowing down. | Di y luego toca al revés, de aguda a grave, sin ir más despacio. |
| playSeq label: B-string naturals | Notas naturales de la cuerda B |
| text: Challenge 2 — High-e Naturals: same drill on the high e string, low to high, 0 through 12 — and notice these are the exact same note names as the low E string. | Reto 2 — Notas naturales de la mi aguda: el mismo ejercicio en la cuerda mi aguda, de grave a aguda, del traste 0 al 12 — y fíjate que son exactamente los mismos nombres de nota que la Mi grave. |
| hint: If you know the low E string from Module 2, you already know this string — just two octaves higher. | Si conoces la cuerda Mi grave del Módulo 2, ya conoces esta cuerda — solo que dos octavas más aguda. |
| stuck: Say the low-E note names first, then transfer them to the high e string fret by fret. | Di los nombres de nota de la Mi grave primero, y luego transfiérelos a la mi aguda traste por traste. |
| levelUp: Time yourself naming random frets on the high e string — time three in a row, then try to make it faster. Got a partner handy? Race them. | Cronométrate nombrando trastes al azar en la mi aguda — cronometra tres seguidos, y luego intenta hacerlo más rápido. ¿Tienes a alguien a la mano? Compite contra esa persona. |
| playSeq label: High-e naturals | Notas naturales de la mi aguda |

**Station C — Six-string landmark drill**

| English | Spanish |
|---|---|
| text: Challenge 3 — Landmark Drill (your assessment piece): name every string at the fret-5 dot, then every string at the fret-7 dot. You've got it when: all six strings named correctly at both dots, no chart, within 5 seconds each. | Reto 3 — Ejercicio de referencias (tu pieza de evaluación): nombra cada cuerda en el punto del traste 5, y luego cada cuerda en el punto del traste 7. Lo tienes cuando: las seis cuerdas nombradas correctamente en ambos puntos, sin diagrama, en menos de 5 segundos cada una. |
| hint: Dots are the fastest way to orient yourself anywhere on the neck — this drill is worth over-practicing. | Los puntos son la forma más rápida de orientarte en cualquier parte del mástil — vale la pena sobre-practicar este ejercicio. |
| stuck: Do the fret-5 dot on all six strings first until it's solid, then add fret 7. | Haz primero el punto del traste 5 en las seis cuerdas hasta que salga sólido, y luego agrega el traste 7. |
| levelUp: Add the fret-9 and fret-12 dots, or write the dot frets on slips of paper and draw them at random to name across all six strings — or have someone call them out if a helper's around. | Agrega los puntos de los trastes 9 y 12, o escribe los trastes con punto en tiras de papel y sácalos al azar para nombrarlos en las seis cuerdas — o pide que alguien te los diga si tienes ayuda cerca. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Luna, the punteo line (punteo = the picked melody line, a Spanish guitar term): play the fingerpicked intro fragment — one note each on D, G, B and open e, four strings — reading Layer 6 TAB from Luna's Song Journey page (the bonus requinto-intro layer — a requinto is a small, higher-pitched guitar that plays the lead melody). You've got it when: all four notes ring cleanly in order, and you can name each one as you play it. | Reto — Luna, la línea de punteo (punteo = la línea melódica punteada, un término de guitarra en español): toca el fragmento de intro con fingerpicking — una nota en cada una de D, G, B y e al aire, cuatro cuerdas — leyendo el TAB de la Capa 6 de la página de Recorrido de la canción de Luna (la capa bonus de intro con requinto — un requinto es una guitarra pequeña y más aguda que toca la melodía principal). Lo tienes cuando: las cuatro notas suenan limpias en orden, y puedes nombrar cada una mientras la tocas. |
| hint: This roll uses the little-F shape you already know from Module 5 — today's new skill is being able to name every note in it. | Este roll usa la forma de F pequeña que ya conoces del Módulo 5 — la destreza nueva de hoy es poder nombrar cada nota dentro de ella. |
| stuck: Fret the little F shape first, strum it once to hear the target chord, then break it apart one string at a time. | Trastea primero la forma de F pequeña, ráscala una vez para escuchar el acorde objetivo, y luego desármala una cuerda a la vez. |
| levelUp: Name each note out loud as you roll through it, or drop it in front of the Layer 5 vamp (a vamp is a short chord pattern repeated over and over) as a real intro. | Nombra cada nota en voz alta mientras la tocas, o colócala antes del vamp de la Capa 5 (un vamp es un patrón de acordes corto que se repite una y otra vez) como una intro de verdad. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Six strings, fully named — what's your fastest way to find a note now: counting up, or the octave shape? Write it below. | Seis cuerdas, completamente nombradas — ¿cuál es tu forma más rápida de encontrar una nota ahora: contar hacia arriba, o la forma de octava? Escríbelo abajo. |
| response placeholder: e.g. octave shape, every time — counting up from open is too slow now | p. ej. la forma de octava, siempre — contar desde el aire ya es demasiado lento |

**Set 3 — Skills**

| English | Spanish |
|---|---|
| m9w2-s1 text: Name the natural notes on the B string, frets 0–12, in order | Nombrar las notas naturales de la cuerda B, trastes 0–12, en orden |
| m9w2-s1 practice label: B-string naturals | Notas naturales de la cuerda B |
| m9w2-s2 text: Name the natural notes on the high e string and explain why they match the low E | Nombrar las notas naturales de la mi aguda y explicar por qué coinciden con la Mi grave |
| m9w2-s2 practice prompt: Why do the two E strings share the same note names? | ¿Por qué las dos cuerdas E comparten los mismos nombres de nota? |
| m9w2-s2 practice choices: They're the two thickest strings / They're both tuned to E, two octaves apart / It's a coincidence / They don't — they're different | Son las dos cuerdas más gruesas / Ambas están afinadas en E, separadas por dos octavas / Es una coincidencia / No coinciden — son distintas |
| m9w2-s3 text: Locate any named natural note (drawn from a shuffled card) on any of the six strings | Ubicar cualquier nota natural nombrada (sacada de una tarjeta barajada) en cualquiera de las seis cuerdas |
| m9w2-s4 text: Use the 3-fret octave shift when crossing onto the B or high-e string | Usar el desplazamiento de octava de 3 trastes al cruzar hacia la cuerda B o mi aguda |
| m9w2-s4 practice prompt: You know G at D-string fret 5. Its octave on the B string is at fret: | Sabes que G está en el traste 5 de la cuerda D. Su octava en la cuerda B está en el traste: |
| m9w2-s4 practice choices: 5 / 7 / 8 / 10 | 5 / 7 / 8 / 10 |
| m9w2-s5 text: Play a melody that crosses three or more strings cleanly (Luna intro fragment) | Tocar una melodía que cruce tres o más cuerdas de forma limpia (fragmento de intro de Luna) |
| m9w2-s6 text: Name the note at any dot fret (3, 5, 7, 9, 12) on all six strings | Nombrar la nota en cualquier traste con punto (3, 5, 7, 9, 12) en las seis cuerdas |
| m9w2-s6 practice prompt: At fret 3, the A string plays: | En el traste 3, la cuerda A toca: |
| m9w2-s6 practice choices: B / C / C# / D | B / C / C# / D |

### Set 4

| English | Spanish |
|---|---|
| unit: Module 9 · The Full Fretboard & Writing TAB | Módulo 9 · El mástil completo y cómo escribir TAB |
| subtitle: Higher-position TAB · Write your own 4 bars · Slash chords & partial shapes | TAB en posiciones altas · Escribe tus propios 4 compases · Acordes con barra diagonal y formas parciales |
| skillFocus: Reading TAB above fret 5 · Writing TAB others can play · Slash chords (G/B) & partial-shape charts | Leer TAB arriba del traste 5 · Escribir TAB que otros puedan tocar · Acordes con barra diagonal (G/B) y diagramas de forma parcial |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for chords hiding in the TAB | Escucha los acordes escondidos en el TAB |
| Section title: Try reading a slash chord | Prueba leer un acorde con barra diagonal |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — reading, writing, and cold-reading TAB | Estación de práctica — leer, escribir y leer TAB a primera vista |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Read a higher-position TAB | Lee un TAB en posición alta |
| Section title: Write your own TAB from memory | Escribe tu propio TAB de memoria |
| Section title: Read a slash chord and a partial shape | Lee un acorde con barra diagonal y una forma parcial |
| Section title: The TAB cold-read test | La prueba de lectura a primera vista de TAB |
| Section title: Station Wrap-Up | Cierre de la estación |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: How to Read Guitar TAB - A Better Way To Read Music – Lauren Bateman as a refresher, paying attention to how string order and chord stacks are shown. | Mira: How to Read Guitar TAB - A Better Way To Read Music – Lauren Bateman como repaso, prestando atención a cómo se muestran el orden de las cuerdas y las pilas de acordes. |
| hint: You met TAB reading back in Module 2 — today's new ground is reading it confidently ABOVE fret 5, and writing your own. | Conociste la lectura de TAB en el Módulo 2 — el terreno nuevo de hoy es leerlo con confianza ARRIBA del traste 5, y escribir el tuyo propio. |
| response prompt: In TAB, the TOP line represents: | En el TAB, la línea SUPERIOR representa: |
| response explain: TAB mirrors the guitar as you look down at it — thinnest string on top. It's the most common beginner reading mistake. | El TAB refleja la guitarra tal como la ves desde arriba — la cuerda más delgada arriba. Es el error de lectura más común entre principiantes. |
| response choices: The low E string (thickest) / The high e string (thinnest) / Whichever string you like / The B string | La cuerda Mi grave (la más gruesa) / La cuerda mi aguda (la más delgada) / La que tú prefieras / La cuerda B |
| text: Watch: Writing TABs – JustinGuitar. This is the reverse skill of reading TAB — watch how he turns a riff he can already play into TAB someone else could read. | Mira: Writing TABs – JustinGuitar. Esta es la destreza inversa de leer TAB — observa cómo convierte un riff que ya puede tocar en un TAB que otra persona podría leer. |
| hint: Writing TAB is the reverse skill of reading it — the video models the process before you try it yourself at the practice station. | Escribir TAB es la destreza inversa de leerlo — el video modela el proceso antes de que lo intentes tú mismo en la estación de práctica. |
| response prompt: Two numbers stacked in the same column of TAB mean: | Dos números apilados en la misma columna del TAB significan: |
| response explain: A vertical stack is a chord — everything in the column sounds together. | Una pila vertical es un acorde — todo lo que está en la columna suena junto. |
| response choices: Play them one after another / Play them at the same time / Choose one to play / Play the top one twice | Tocarlos uno después del otro / Tocarlos al mismo tiempo / Elegir uno para tocar / Tocar el de arriba dos veces |

**Station B — Listen for chords hiding in the TAB**

| English | Spanish |
|---|---|
| text: Listen for it: as you read through a TAB'd riff, notice where single notes stack into a chord (a vertical column) versus where they stay a single melodic line. | Escucha esto: mientras lees un riff en TAB, fíjate dónde las notas sueltas se apilan en un acorde (una columna vertical) frente a dónde se quedan como una sola línea melódica. |
| hint: Spotting the difference between a melody line and a stacked chord in TAB is what lets you read faster. | Distinguir entre una línea melódica y un acorde apilado en el TAB es lo que te permite leer más rápido. |
| response prompt: A "12" written on the thinnest TAB line tells you to play: | Un "12" escrito en la línea más delgada del TAB te dice que toques: |
| response explain: Numbers are FRETS, lines are STRINGS — fret 12, high-e string. | Los números son TRASTES, las líneas son CUERDAS — traste 12, cuerda mi aguda. |
| response choices: Fret 12 on the low E / Fret 12 on the high e / String 12 / The 12th chord | El traste 12 en la Mi grave / El traste 12 en la mi aguda / La cuerda 12 / El acorde número 12 |

**Station B — Try reading a slash chord**

| English | Spanish |
|---|---|
| text: Now try it: look up a chord chart for G/B and figure out, before checking, which note has to be the LOWEST one you strum. | Ahora pruébalo: busca un diagrama de acorde para G/B y descubre, antes de revisar, cuál nota tiene que ser la MÁS GRAVE que rasgueas. |
| hint: Read the slash like a fraction: chord name first, bass note second. | Lee la barra diagonal como una fracción: primero el nombre del acorde, luego la nota grave. |
| response prompt: The chord G/B (say "G over B") means: | El acorde G/B (di "G sobre B") significa: |
| response explain: Slash chords name the chord, then the bass note — you met G/B inside "the cure"'s progression. | Los acordes con barra diagonal nombran el acorde y luego la nota grave — conociste G/B dentro de la progresión de "the cure". |
| response choices: Play G, then B / A G chord with B as its lowest note / A B chord with G on top / Either G or B | Tocar G, y luego B / Un acorde de G con B como su nota más grave / Un acorde de B con G arriba / G o B, cualquiera de los dos |
| text: Try spacing a few numbers on paper the way you would in written TAB, then check: could someone else tell the rhythm from your spacing alone? | Prueba espaciar unos números en papel de la manera que lo harías en un TAB escrito, y luego revisa: ¿podría alguien más deducir el ritmo solo por tu espaciado? |
| hint: Cramped numbers are the single most common reason a hand-written TAB is unplayable for anyone but the person who wrote it. | Los números amontonados son la razón más común por la que un TAB escrito a mano resulta imposible de tocar para cualquiera que no sea quien lo escribió. |
| response prompt: When you write your own TAB, the most important thing to keep readable is: | Cuando escribes tu propio TAB, lo más importante que debes mantener legible es: |
| response explain: Spacing IS the rhythm in TAB — cramped numbers make your riff unplayable for anyone else. | El espaciado ES el ritmo en el TAB — los números amontonados hacen que tu riff sea imposible de tocar para cualquier otra persona. |
| response choices: Fancy handwriting / Even spacing that shows the rhythm / Using pen, not pencil / Writing the song title | Una letra elegante / Un espaciado parejo que muestre el ritmo / Usar pluma en vez de lápiz / Escribir el título de la canción |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — what was hardest about writing TAB: finding the frets, or spacing the rhythm? | Cierre de la estación — ¿qué fue lo más difícil de escribir TAB: encontrar los trastes, o espaciar el ritmo? |
| response placeholder: e.g. I knew the frets but my spacing squished bar 3 | p. ej. sabía los trastes pero mi espaciado apretó el compás 3 |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Read a higher-position TAB**

| English | Spanish |
|---|---|
| text: Challenge 1 — Warm-Up Read (down low first): read and play the little-F Layer 6 intro TAB from Luna's Song Journey page — it lives around the little-F shape (D3, G2, B1, open e), down at frets 0–3. You've got it when: you can read it straight through, no one walking you through it first. | Reto 1 — Lectura de calentamiento (primero abajo): lee y toca el TAB de intro de la Capa 6 de F pequeña de la página de Recorrido de la canción de Luna — vive alrededor de la forma de F pequeña (D3, G2, B1, e al aire), abajo en los trastes 0–3. Lo tienes cuando: puedes leerlo de corrido, sin que nadie te lo explique primero. |
| hint: Reading TAB up the neck feels harder mostly because the numbers are less familiar, not because it's actually different from reading it low. | Leer TAB arriba del mástil se siente más difícil sobre todo porque los números son menos familiares, no porque sea realmente distinto a leerlo abajo. |
| stuck: Fret the little F shape and strum it once to hear the target chord before reading the roll note by note. | Trastea la forma de F pequeña y ráscala una vez para escuchar el acorde objetivo antes de leer el roll nota por nota. |
| levelUp: Read a second higher-position TAB you haven't seen before today, cold. | Lee a primera vista un segundo TAB en posición alta que no hayas visto antes de hoy. |
| text: Challenge — Higher Still (the real up-high read): the Luna read above was your warm-up, down at frets 0–3 — now for the up-high part. Cold-read the 8-note line below — it lives entirely at frets 5–10, up around 7th position, crossing the D, G, and B strings. No one walks you through it first; trust the numbers. You've got it when: you play all eight notes in order, in tune, reading only the TAB. | Reto — Todavía más alto (la verdadera lectura arriba): la lectura de Luna de arriba fue tu calentamiento, abajo en los trastes 0–3 — ahora la parte de arriba. Lee a primera vista la línea de 8 notas de abajo — vive completamente en los trastes 5–10, arriba alrededor de la 7ª posición, cruzando las cuerdas D, G y B. Nadie te lo explica primero; confía en los números. Lo tienes cuando: tocas las ocho notas en orden, afinado, leyendo solo el TAB. |
| hint: The shapes feel unfamiliar this high up, but the rule never changes: top line = thinnest string, numbers = frets. Find fret 5 (two frets past the fret-3 dot) and anchor your hand there. | Las formas se sienten poco familiares tan arriba, pero la regla nunca cambia: línea superior = cuerda más delgada, números = trastes. Encuentra el traste 5 (dos trastes después del punto del traste 3) y ancla tu mano ahí. |
| stuck: Play it one note at a time and say each fret out loud before you fret it — decode first, speed later. | Tócala una nota a la vez y di cada traste en voz alta antes de trastearlo — primero descifra, la velocidad viene después. |
| levelUp: Play the line backwards, from the last note to the first, still reading only the page. | Toca la línea al revés, de la última nota a la primera, todavía leyendo solo la página. |
| tab caption: Cold-read: a 7th-position line across the D, G & B strings (frets 5–10) | Lectura a primera vista: una línea en 7ª posición a través de las cuerdas D, G y B (trastes 5–10) |
| playSeq label: Hear the 7th-position line (check yourself only AFTER you've read it cold) | Escucha la línea en 7ª posición (compruébate solo DESPUÉS de haberla leído a primera vista) |

**Station C — Write your own TAB from memory**

| English | Spanish |
|---|---|
| text: Challenge 2 — Write It (your assessment piece): without looking anything up, write the "Seven Nation Army" riff to blank TAB on paper from memory — you played it without looking at the chart back in Module 2. Then check yourself. You've got it when: you play back EXACTLY what's on your page and it matches the riff note for note — every fret on the right string, in order. (The day-later, no-memory test is Challenge 4. Someone around to trade with? Even better — see Challenge 4.) | Reto 2 — Escríbelo (tu pieza de evaluación): sin buscar nada, escribe de memoria el riff de "Seven Nation Army" en TAB en blanco sobre papel — lo tocaste sin mirar el diagrama allá en el Módulo 2. Luego compruébate. Lo tienes cuando: tocas EXACTAMENTE lo que está en tu página y coincide con el riff nota por nota — cada traste en la cuerda correcta, en orden. (La prueba de un día después, sin memoria, es el Reto 4. ¿Tienes a alguien cerca con quien intercambiar? Todavía mejor — ve el Reto 4.) |
| hint: Say each note name in your head as you write its fret — that's the same habit that made you fast at naming notes all module. | Di el nombre de cada nota en tu mente mientras escribes su traste — es el mismo hábito que te hizo rápido nombrando notas todo el módulo. |
| stuck: Play the riff on your guitar first, one note at a time, writing down each fret as you go — then copy it clean. | Toca el riff en tu guitarra primero, una nota a la vez, escribiendo cada traste mientras avanzas — y luego cópialo limpio. |
| levelUp: Write a second 4-bar riff of your choice from memory, or write the riff transposed to a different starting fret. | Escribe un segundo riff de 4 compases de tu elección de memoria, o escribe el riff transportado a un traste de partida distinto. |

**Station C — Read a slash chord and a partial shape**

| English | Spanish |
|---|---|
| text: Challenge 3 — Slash Chord: fret and play G/B, then compare it against a standard open G. Notice what changes and what stays the same. | Reto 3 — Acorde con barra diagonal: trastea y toca G/B, y luego compáralo con un G abierto estándar. Fíjate qué cambia y qué se mantiene igual. |
| hint: The chord shape barely changes — it's the LOWEST note you strum that makes it a slash chord. | La forma del acorde casi no cambia — es la nota MÁS GRAVE que rasgueas lo que lo convierte en un acorde con barra diagonal. |
| stuck: Play the open G first, then just move your lowest-string finger to find the B. | Toca el G abierto primero, y luego solo mueve tu dedo de la cuerda más grave para encontrar la B. |
| levelUp: Walk C → G/B → Am as a smooth bass-line move, the way "the cure" does it. | Camina C → G/B → Am como un movimiento suave de línea de bajo, tal como lo hace "the cure". |
| text: Challenge — Read a Partial Shape: the chart below shows dots on only three strings — the rest are marked X. That's a partial shape: just the top slice of a chord, the way slash-chord and lead-sheet charts often print it so you can grab it fast. Fret the three dots and play. You've got it when: only the three fretted strings sound, and the X'd strings stay silent under your strum. | Reto — Lee una forma parcial: el diagrama de abajo muestra puntos en solo tres cuerdas — el resto están marcadas con X. Eso es una forma parcial: solo la rebanada superior de un acorde, tal como los diagramas de acordes con barra diagonal y de lead sheet suelen imprimirlos para que los agarres rápido. Trastea los tres puntos y toca. Lo tienes cuando: solo suenan las tres cuerdas trasteadas, y las marcadas con X se quedan silenciosas bajo tu rasgueo. |
| hint: An X over a string means "don't let this ring." Here the three X'd strings are the lowest ones — brush only the top three, or lean a fretting finger against the low strings to mute them. | Una X sobre una cuerda significa "no dejes que suene." Aquí las tres cuerdas con X son las más graves — rasguea solo las tres de arriba, o apoya un dedo de trastear contra las cuerdas graves para silenciarlas. |
| stuck: Pick the three fretted strings one at a time first, so you can hear that each one rings clean, then brush them together. | Pulsa las tres cuerdas trasteadas una a la vez primero, para que puedas escuchar que cada una suena limpia, y luego rasguéalas juntas. |
| levelUp: Slide the same three-string shape up two frets and name the new chord it spells. | Desliza la misma forma de tres cuerdas dos trastes hacia arriba y nombra el nuevo acorde que forma. |
| response prompt: On this partial-shape chart, which strings actually ring when you play it? | En este diagrama de forma parcial, ¿cuáles cuerdas realmente suenan cuando lo tocas? |
| response explain: An X above a string means don't play it. Strings 6, 5, and 4 are X'd, so only the top three — G, B, and high e — ring out. A partial shape is just a full chord's top slice. | Una X sobre una cuerda significa que no la toques. Las cuerdas 6, 5 y 4 tienen X, así que solo suenan las tres de arriba — G, B y mi aguda. Una forma parcial es solo la rebanada superior de un acorde completo. |
| response choices: All six strings / Only the three fretted strings — G, B, and high e / Only the strings marked X / The three lowest strings | Las seis cuerdas / Solo las tres cuerdas trasteadas — G, B y mi aguda / Solo las cuerdas marcadas con X / Las tres cuerdas más graves |

**Station C — The TAB cold-read test**

| English | Spanish |
|---|---|
| text: Challenge 4 — Cold-Read It: at least a day after writing your Challenge 2 TAB, take it back out and play it exactly as written — trust only the page, no memory allowed. You've got it when: the riff comes out right on the first try, purely from what's on the paper. Got someone around who plays? Swap TABs and play each other's exactly as written, no explanation allowed — the ultimate readability test. | Reto 4 — Léelo a primera vista: al menos un día después de escribir tu TAB del Reto 2, sácalo de nuevo y tócalo exactamente como está escrito — confía solo en la página, no se permite memoria. Lo tienes cuando: el riff sale bien al primer intento, únicamente a partir de lo que hay en el papel. ¿Tienes a alguien cerca que toque? Intercambien sus TABs y toquen el del otro exactamente como está escrito, sin explicaciones permitidas — la prueba definitiva de legibilidad. |
| hint: This is the real test of whether your spacing and fret numbers were actually readable — not just correct to you. | Esta es la verdadera prueba de si tu espaciado y tus números de traste realmente eran legibles — no solo correctos para ti. |
| stuck: If your written TAB stumps you, say the fret numbers out loud in rhythm while following the page, then add the guitar. | Si tu TAB escrito te confunde, di los números de traste en voz alta con el ritmo mientras sigues la página, y luego agrega la guitarra. |
| levelUp: Write and cold-read a second riff, or swap with a partner for a fresh TAB cold. | Escribe y lee a primera vista un segundo riff, o intercambia con un compañero para un TAB nuevo a primera vista. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Could a stranger play your TAB without hearing the song first? Write below what you'd change about your spacing next time. | ¿Podría un desconocido tocar tu TAB sin haber escuchado la canción primero? Escribe abajo qué cambiarías de tu espaciado la próxima vez. |
| response placeholder: e.g. yes — but I'd leave more room around the chord stack in bar 2 | p. ej. sí — pero dejaría más espacio alrededor de la pila de acordes en el compás 2 |

**Set 4 — Skills**

| English | Spanish |
|---|---|
| m9w3-s1 text: Read and play a TAB phrase written above fret 5 | Leer y tocar una frase de TAB escrita arriba del traste 5 |
| m9w3-s2 text: Write an accurate 4-bar TAB of a riff I can already play | Escribir un TAB preciso de 4 compases de un riff que ya sé tocar |
| m9w3-s2 gotItWhen: you play it back correctly a day later, reading only what's on the page — or a partner can, without ever hearing you play it first. | lo tocas correctamente un día después, leyendo solo lo que hay en la página — o un compañero puede hacerlo, sin haberte escuchado tocarlo antes. |
| m9w3-s3 text: Space my TAB so the rhythm is readable | Espaciar mi TAB para que el ritmo sea legible |
| m9w3-s3 practice prompt: In hand-written TAB, rhythm is shown mainly by: | En el TAB escrito a mano, el ritmo se muestra principalmente por: |
| m9w3-s3 practice choices: Note-head shapes / The spacing between numbers / Color coding / It can't be shown | Las formas de las cabezas de nota / El espaciado entre los números / Un código de colores / No se puede mostrar |
| m9w3-s4 text: Read a slash chord (like G/B) from a chart and play it | Leer un acorde con barra diagonal (como G/B) de un diagrama y tocarlo |
| m9w3-s4 practice prompt: In C/G, the lowest note you play is: | En C/G, la nota más grave que tocas es: |
| m9w3-s4 practice choices: C / E / G / B | C / E / G / B |
| m9w3-s5 text: Read a partial chord shape (X marks and small grids) from a chart | Leer una forma de acorde parcial (marcas de X y diagramas pequeños) de un diagrama |
| m9w3-s5 practice prompt: An X above a string on a chord chart means: | Una X sobre una cuerda en un diagrama de acorde significa: |
| m9w3-s5 practice choices: Play it open / Don't play that string / Bend that string / Play it twice | Tócala al aire / No toques esa cuerda / Hazle un bend a esa cuerda / Tócala dos veces |
| m9w3-s6 text: Play an unfamiliar hand-written TAB correctly on the first try — one I wrote days ago, or a partner's | Tocar correctamente al primer intento un TAB escrito a mano que no me sea familiar — uno que escribí hace días, o el de un compañero |

### Module-level Songs

MODULE_SONGS[9] meta fields (song title shown for reference, not itself translated on the site).

| English | Spanish |
|---|---|
| "Sweet Child O' Mine" — Guns N' Roses — meta: Map the intro up the neck — D & G strings | Ubica la intro arriba del mástil — cuerdas D y G |
| "Luna" — Peso Pluma, Junior H — meta: Punteo line crossing three strings | Línea de punteo que cruza tres cuerdas |
| "Seven Nation Army" — The White Stripes — meta: Write the riff out as TAB yourself | Escribe el riff como TAB tú mismo |
| "Beat It" — Michael Jackson — meta: Riff notes across E, A & D — map them | Notas del riff a través de E, A y D — ubícalas |
| "Just Like Heaven" — The Cure — meta: Arpeggiated riff — read it up the neck | Riff arpegiado — léelo arriba del mástil |
| "Smoke on the Water" — Deep Purple — meta: Write its riff as TAB — the classic starter riff | Escribe su riff como TAB — el clásico riff para principiantes |

### Module Review

| English | Spanish |
|---|---|
| module: The Full Fretboard & Writing TAB | El mástil completo y cómo escribir TAB |
| skill mr9-s1: I can name every natural note on the D and G strings through fret 12 | Puedo nombrar cada nota natural de las cuerdas D y G hasta el traste 12 |
| skill mr9-s2: I can use the octave shape to find a note on a new string from one I already know | Puedo usar la forma de octava para encontrar una nota en una cuerda nueva a partir de una que ya conozco |
| skill mr9-s3: I can locate any named note anywhere on the neck, on any of the six strings | Puedo ubicar cualquier nota nombrada en cualquier parte del mástil, en cualquiera de las seis cuerdas |
| skill mr9-s4: I can name the note at any dot-fret landmark (3, 5, 7, 9, 12) on all six strings | Puedo nombrar la nota en cualquier traste con punto (3, 5, 7, 9, 12) en las seis cuerdas |
| skill mr9-s5: I can read a TAB phrase written above fret 5 without help | Puedo leer una frase de TAB escrita arriba del traste 5 sin ayuda |
| skill mr9-s6: I can write an accurate 4-bar TAB of a riff I already play, that reproduces the riff from the page alone | Puedo escribir un TAB preciso de 4 compases de un riff que ya toco, que reproduce el riff únicamente a partir de la página |
| assessItem: Name natural notes on all six strings through fret 12 — draw shuffled flashcards to pick the spots | Nombra notas naturales en las seis cuerdas hasta el traste 12 — saca tarjetas barajadas para elegir los puntos |
| assessItem: Play a thread-song melody from TAB in a higher position | Toca una melodía de canción hilo a partir de TAB en una posición alta |
| assessItem: Finish a 4-bar TAB you wrote yourself that passes the cold-read test — a day later, the page alone reproduces the riff (or a partner plays it back correctly) | Termina un TAB de 4 compases que escribiste tú mismo y que pasa la prueba de lectura a primera vista — un día después, la página sola reproduce el riff (o un compañero lo toca correctamente) |
| assessItem: Play a melody that crosses three or more strings cleanly, every note ringing in order | Toca una melodía que cruce tres o más cuerdas de forma limpia, cada nota sonando en orden |
| assessItem: Read a partial-shape or slash chord chart and name which strings actually ring | Lee un diagrama de forma parcial o de acorde con barra diagonal y nombra cuáles cuerdas realmente suenan |
| forward: The whole neck is yours now — and you can write down anything you figure out. <strong>Module 10 turns notes into keys:</strong> you'll learn the recipe that builds every scale, find the key of any song, and start trusting your ear. (And any time you come back from a long break, <strong>Set 1</strong> at the top of this module re-checks the six core skills in one sitting.) | Ahora todo el mástil es tuyo — y puedes escribir cualquier cosa que descifres. <strong>El Módulo 10 convierte notas en tonalidades:</strong> aprenderás la receta que construye cada escala, encontrarás la tonalidad de cualquier canción, y empezarás a confiar en tu oído. (Y cada vez que vuelvas de un receso largo, la <strong>Unidad 1</strong> al inicio de este módulo repasa las seis destrezas principales en una sola sesión.) |

## Module 10 — Scales, Keys & Ear Training

### Set 1

| English | Spanish |
|---|---|
| unit: Module 10 · Scales, Keys & Ear Training | Módulo 10 · Escalas, Tonalidades y Entrenamiento Auditivo |
| subtitle: The W-W-H recipe · Build a scale on one string · Where pentatonics come from | La receta de tonos y semitonos · Construye una escala en una sola cuerda · De dónde vienen las pentatónicas |
| skillFocus: W-W-H-W-W-W-H · Whole step = 2 frets, half step = 1 · Major pentatonic = major scale minus 2 notes | T-T-S-T-T-T-S · Un tono = 2 trastes, un semitono = 1 · La pentatónica mayor = la escala mayor menos 2 notas |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for the recipe as you play it | Escucha la receta mientras la tocas |
| Section title: Try building a scale from a new starting note | Prueba a construir una escala desde una nota inicial nueva |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — building the major scale | Estación de práctica — construir la escala mayor |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Build C major and G major on one string | Construye C mayor y G mayor en una sola cuerda |
| Section title: Say the recipe while you play | Di la receta mientras tocas |
| Section title: Take It to a Song | Llévalo a una canción |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: What is a Major Scale Guitar Lesson - Music Theory For Guitar – Lauren Bateman (0:00–5:12). Follow along as she lays out the whole/half-step recipe — the exact formula you'll use to build C and G major yourself. | Mira: What is a Major Scale Guitar Lesson - Music Theory For Guitar – Lauren Bateman (0:00–5:12). Sigue el video mientras ella explica la receta de tonos y semitonos — la fórmula exacta que usarás para construir C mayor y G mayor tú mismo. |
| hint: The recipe is a formula — the exact same seven-step pattern of whole and half steps, starting from any note, builds that note's major scale. | La receta es una fórmula — el mismo patrón de siete pasos de tonos y semitonos, empezando desde cualquier nota, construye la escala mayor de esa nota. |
| response prompt: The step recipe that builds EVERY major scale is: | La receta de pasos que construye TODAS las escalas mayores es: |
| response explain: Whole-whole-half, whole-whole-whole-half. Same recipe from any starting note — that's what makes it a formula. | Tono-tono-semitono, tono-tono-tono-semitono. La misma receta desde cualquier nota inicial — eso es lo que la hace una fórmula. |
| response choices: W-H-W-W-H-W-W / W-W-H-W-W-W-H / H-W-W-H-W-W-W / W-W-W-H-W-W-H | T-S-T-T-S-T-T / T-T-S-T-T-T-S / S-T-T-S-T-T-T / T-T-T-S-T-T-S |
| text: Watch: How to Play the Major Pentatonic Scale: Your Guide to Beautiful Solos – Marty Music. This is where the pentatonic sound you've been soloing with since Module 4 actually comes from. | Mira: How to Play the Major Pentatonic Scale: Your Guide to Beautiful Solos – Marty Music. Aquí es de donde realmente viene el sonido pentatónico con el que has estado improvisando desde el Módulo 4. |
| hint: Major pentatonic isn't a separate scale to memorize — it's the major scale with two notes lifted out. | La pentatónica mayor no es una escala separada para memorizar — es la escala mayor con dos notas quitadas. |
| response prompt: Major pentatonic is the major scale with which two notes removed? | ¿La pentatónica mayor es la escala mayor menos cuáles dos notas? |
| response explain: Drop the 4th and 7th — the two "tension" notes, the ones that sound unsettled and want to move — and the friendly five-note pentatonic you already solo with is what's left. | Quita el 4º y el 7º — las dos notas de "tensión", las que suenan inestables y quieren resolver — y lo que queda es la amigable escala pentatónica de cinco notas con la que ya improvisas. |
| response choices: 1st and 5th / 2nd and 6th / 4th and 7th / 3rd and 5th | 1º y 5º / 2º y 6º / 4º y 7º / 3º y 5º |

**Station B — Listen for the recipe as you play it**

| English | Spanish |
|---|---|
| text: Listen for it: play up the C major scale on one string, saying "whole, whole, half, whole, whole, whole, half" out loud on every step. The distances should match the frets you're moving. | Escucha esto: toca la escala de C mayor subiendo en una sola cuerda, diciendo "tono, tono, semitono, tono, tono, tono, semitono" en voz alta en cada paso. Las distancias deben coincidir con los trastes que te mueves. |
| hint: On guitar, a whole step and a half step are just fret distances — say the word, then check it's 2 frets (whole) or 1 fret (half). | En la guitarra, un tono y un semitono son solo distancias de trastes — di la palabra, y luego comprueba que sean 2 trastes (tono) o 1 traste (semitono). |
| response prompt: On guitar, a whole step equals how many frets? | En la guitarra, ¿cuántos trastes equivale un tono? |
| response explain: One fret = half step, two frets = whole step. The recipe becomes fret distances: 2-2-1-2-2-2-1. | Un traste = semitono, dos trastes = tono. La receta se convierte en distancias de trastes: 2-2-1-2-2-2-1. |
| response choices: 1 / 2 / 3 / 4 | 1 / 2 / 3 / 4 |

**Station B — Try building a scale from a new starting note**

| English | Spanish |
|---|---|
| text: Now try it: run the same W-W-H-W-W-W-H recipe starting from C first — your baseline — and notice you never need a sharp or flat. That clean run is what makes the odd note stand out when you try G next. | Ahora pruébalo: corre la misma receta T-T-S-T-T-T-S empezando primero desde C — tu punto de referencia — y fíjate que nunca necesitas un sostenido ni un bemol. Ese recorrido limpio es lo que hace que la nota rara resalte cuando pruebes G a continuación. |
| hint: C major is the recipe's starting-point example — every other major key is the same shape, just starting somewhere else. | C mayor es el ejemplo de punto de partida de la receta — cada otra tonalidad mayor es la misma forma, solo que empieza en otro lugar. |
| response prompt: C major is special among scales because: | C mayor es especial entre las escalas porque: |
| response explain: C is the recipe's "clean" starting point — all seven natural notes, C D E F G A B. | C es el punto de partida "limpio" de la receta — las siete notas naturales, C D E F G A B. |
| response choices: It has one sharp / It has no sharps or flats / It's the hardest scale / It only works on piano | Tiene un sostenido / No tiene sostenidos ni bemoles / Es la escala más difícil / Solo funciona en el piano |
| text: Try it again starting from G, on one string — follow the recipe exactly and see what note comes out different from the rest. | Pruébalo otra vez empezando desde G, en una sola cuerda — sigue la receta exactamente y observa qué nota sale distinta de las demás. |
| hint: Follow W-W-H-W-W-W-H from G one step at a time; the recipe itself will tell you which note needs raising. | Sigue T-T-S-T-T-T-S desde G un paso a la vez; la receta misma te dirá cuál nota necesita subirse. |
| response prompt: Follow the recipe from G and one note comes out sharp. Which? | Sigue la receta desde G y una nota sale sostenida. ¿Cuál? |
| response explain: G A B C D E F#. The last whole step forces F up to F# — G major's single sharp. | G A B C D E F#. El último tono obliga a F a subir a F# — el único sostenido de G mayor. |
| response choices: C# / G# / F# / A# | C# / G# / F# / A# |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — in your own words: what does it mean when someone says a song is "in the key of G"? | Cierre de la estación — con tus propias palabras: ¿qué significa cuando alguien dice que una canción está "en la tonalidad de G"? |
| response placeholder: e.g. its notes and chords come from the G major scale — G feels like home | p. ej. sus notas y acordes vienen de la escala de G mayor — G se siente como el hogar |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Build C major and G major on one string**

| English | Spanish |
|---|---|
| text: Challenge 1 — C Major Walk: play the C major scale on the A string using the recipe, saying "whole, whole, half…" out loud as you go. | Reto 1 — Caminata de C Mayor: toca la escala de C mayor en la cuerda La usando la receta, diciendo "tono, tono, semitono…" en voz alta mientras avanzas. |
| hint: Start on C (A string, fret 3) and let the recipe — not a chart — tell you where each next note lands. | Empieza en C (cuerda La, traste 3) y deja que la receta — no un diagrama — te diga dónde cae cada siguiente nota. |
| stuck: Play just the first three notes (C-D-E) until the whole-whole-half feel is automatic, then keep climbing. | Toca solo las primeras tres notas (C-D-E) hasta que la sensación de tono-tono-semitono sea automática, y luego sigue subiendo. |
| levelUp: Play it descending too, saying the recipe backwards (half, whole, whole, whole, half, whole, whole). | Tócala también descendiendo, diciendo la receta al revés (semitono, tono, tono, tono, semitono, tono, tono). |
| playSeq label: C major on the A string (recipe walk) | C mayor en la cuerda La (caminata de la receta) |
| text: Challenge 2 — G Major Walk: play the G major scale on the low E string using the same recipe, and catch the one note that needs to be sharp. | Reto 2 — Caminata de G Mayor: toca la escala de G mayor en la cuerda Mi grave usando la misma receta, y detecta la única nota que necesita ser sostenida. |
| hint: Everything is identical to the C major walk except one note — the recipe itself will tell you which. | Todo es idéntico a la caminata de C mayor excepto una nota — la receta misma te dirá cuál. |
| stuck: Play up to the 6th note first (G-A-B-C-D-E), stop, and only then figure out what the 7th note needs to be. | Toca hasta la 6ª nota primero (G-A-B-C-D-E), detente, y solo entonces averigua qué necesita ser la 7ª nota. |
| levelUp: Play both C major and G major back to back without stopping, on their two different strings. | Toca C mayor y G mayor una después de la otra sin detenerte, en sus dos cuerdas distintas. |
| playSeq label: G major on the low E string | G mayor en la cuerda Mi grave |

**Station C — Say the recipe while you play**

| English | Spanish |
|---|---|
| text: Challenge 3 — Recipe by Heart (your assessment piece): play the C major scale while saying "whole, whole, half, whole, whole, whole, half" out loud, no chart, no hesitating. You've got it when: you can say the whole recipe from memory before you even touch the guitar. | Reto 3 — La Receta de Memoria (tu pieza de evaluación): toca la escala de C mayor mientras dices "tono, tono, semitono, tono, tono, tono, semitono" en voz alta, sin diagrama, sin dudar. Lo tienes cuando: puedes decir toda la receta de memoria antes incluso de tocar la guitarra. |
| hint: If you can say the recipe from memory, you can build ANY major scale on the spot — that's the whole point of memorizing it as words, not just frets. | Si puedes decir la receta de memoria, puedes construir CUALQUIER escala mayor al instante — ese es el punto de memorizarla como palabras, no solo como trastes. |
| stuck: Say the recipe alone, away from the guitar, until it's automatic — then add the fretting hand back in. | Di la receta sola, lejos de la guitarra, hasta que sea automática — y luego agrega de nuevo la mano de trastear. |
| levelUp: Say the recipe starting from a key you haven't tried yet (D, or A) and build it on the spot. | Di la receta empezando desde una tonalidad que no hayas probado todavía (D, o A) y constrúyela al instante. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Let It Be, in the scale: hum the Let It Be melody while playing the C major walk underneath it, and notice every note of the tune lives inside the scale you just built. | Reto — Let It Be, dentro de la escala: tararea la melodía de Let It Be mientras tocas la caminata de C mayor debajo, y fíjate cómo cada nota de la melodía vive dentro de la escala que acabas de construir. |
| hint: This is the payoff of today's whole set — a song's melody isn't random, it's built from the same key's scale. | Esta es la recompensa de toda la unidad de hoy — la melodía de una canción no es aleatoria, está construida a partir de la escala de su misma tonalidad. |
| stuck: Just hum the first line of the melody on its own first, then play the C major walk separately, then try them together. | Primero tararea sola la primera línea de la melodía, luego toca la caminata de C mayor por separado, y después intenta ambas juntas. |
| levelUp: Find where in the walk the melody's highest note lives, and name it. | Encuentra dónde en la caminata vive la nota más aguda de la melodía, y nómbrala. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Can you say the major-scale recipe from memory right now, no guitar in hand? Write below how confident you feel. | ¿Puedes decir la receta de la escala mayor de memoria ahora mismo, sin guitarra en la mano? Escribe abajo qué tan seguro te sientes. |
| response placeholder: e.g. solid on W-W-H-W-W-W-H now — just need more tries building from a new note | p. ej. ya domino T-T-S-T-T-T-S — solo necesito más intentos construyendo desde una nota nueva |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| m10w1-s1 text: Say the major-scale recipe (W-W-H-W-W-W-H) from memory | Decir la receta de la escala mayor (T-T-S-T-T-T-S) de memoria |
| m10w1-s1 practice prompt: In fret distances, the recipe is: | En distancias de trastes, la receta es: |
| m10w1-s1 practice choices: 2-2-1-2-2-2-1 / 1-2-2-1-2-2-2 / 2-1-2-2-1-2-2 / 3-3-1-3-3-3-1 | 2-2-1-2-2-2-1 / 1-2-2-1-2-2-2 / 2-1-2-2-1-2-2 / 3-3-1-3-3-3-1 |
| m10w1-s2 text: Build a C major scale on one string using the recipe | Construir una escala de C mayor en una sola cuerda usando la receta |
| m10w1-s2 practice label: C major on the A string | C mayor en la cuerda La |
| m10w1-s3 text: Build a G major scale on one string and find the F# | Construir una escala de G mayor en una sola cuerda y encontrar el F# |
| m10w1-s3 practice label: G major on the low E string | G mayor en la cuerda Mi grave |
| m10w1-s4 text: Explain what a key is — the scale a song's notes and chords come from | Explicar qué es una tonalidad — la escala de la que vienen las notas y acordes de una canción |
| m10w1-s4 practice prompt: "This song is in A" most nearly means: | "Esta canción está en A" quiere decir principalmente que: |
| m10w1-s4 practice choices: It starts loud / Its notes & chords come from the A major scale and A feels like home / It uses only the A string / It's at 100 BPM | Empieza fuerte / Sus notas y acordes vienen de la escala de A mayor y A se siente como el hogar / Usa solo la cuerda La / Está a 100 BPM |
| m10w1-s5 text: Explain how major pentatonic relates to the major scale | Explicar cómo se relaciona la pentatónica mayor con la escala mayor |
| m10w1-s5 practice prompt: The pentatonic has how many different notes? | ¿Cuántas notas distintas tiene la pentatónica? |
| m10w1-s5 practice choices: 4 / 5 / 6 / 7 | 4 / 5 / 6 / 7 |
| m10w1-s6 text: Spell C major and G major note-by-note out loud | Deletrear C mayor y G mayor nota por nota en voz alta |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 10 · Scales, Keys & Ear Training | Módulo 10 · Escalas, Tonalidades y Entrenamiento Auditivo |
| subtitle: Every major key's minor twin · Relative vs parallel · Add the b5 = blues | La gemela menor de cada tonalidad mayor · Relativa vs. paralela · Agrega la b5 = blues |
| skillFocus: Relative minor = 3 frets down (the 6th degree) · Relative shares NOTES, parallel shares ROOT · Blues scale = minor pentatonic + b5 | La relativa menor = 3 trastes abajo (el 6º grado) · La relativa comparte NOTAS, la paralela comparte RAÍZ · La escala de blues = pentatónica menor + b5 |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for relative vs parallel | Escucha la relativa frente a la paralela |
| Section title: Try finding a core song's relative key | Prueba a encontrar la tonalidad relativa de una canción principal |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — relative keys and the blues scale | Estación de práctica — tonalidades relativas y la escala de blues |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Find relative and parallel minors | Encuentra relativas y paralelas menores |
| Section title: Build and play the blues scale | Construye y toca la escala de blues |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Station Wrap-Up | Cierre de la estación |
| Section title: Jam it — the blues scale over a real form | Tócalo de improviso — la escala de blues sobre una forma real |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: The MINOR PENTATONIC scale on Guitar Explained – Lauren Bateman (0:00–5:30) as a refresher on the box-1 shape you'll build the blues scale from today. | Mira: The MINOR PENTATONIC scale on Guitar Explained – Lauren Bateman (0:00–5:30) como repaso de la forma de la caja 1 sobre la que vas a construir la escala de blues hoy. |
| hint: Everything today builds on top of the minor pentatonic box you already know from Module 4 — nothing new to fret, just one note added. | Todo lo de hoy se construye encima de la caja de pentatónica menor que ya conoces del Módulo 4 — nada nuevo que trastear, solo se agrega una nota. |
| response prompt: Minor pentatonic box 1 with its root at low-E fret 5 is which key? | ¿La caja 1 de la pentatónica menor con su raíz en el traste 5 de la Mi grave es qué tonalidad? |
| response explain: The root fret names the key — fret 5 on the low E is A, so box 1 there is A minor: the shape you'll add the blues note to today. | El traste de la raíz nombra la tonalidad — el traste 5 en la Mi grave es A, así que la caja 1 ahí es A menor: la forma a la que le agregarás la nota de blues hoy. |
| response choices: C minor / A minor / E minor / G minor | C menor / A menor / E menor / G menor |
| text: Watch: The First Scale Beginners Should Learn for BLUES GUITAR – JustinGuitar. Listen for the one extra note added to the minor pentatonic box you already know — that's the b5. | Mira: The First Scale Beginners Should Learn for BLUES GUITAR – JustinGuitar. Escucha la única nota extra que se agrega a la caja de pentatónica menor que ya conoces — esa es la b5. |
| hint: The blues scale is just minor pentatonic plus one extra note — listen for where it gets added in the video. | La escala de blues es simplemente la pentatónica menor más una nota extra — escucha dónde se agrega en el video. |
| response prompt: The blues scale is the minor pentatonic plus which extra note? | ¿La escala de blues es la pentatónica menor más cuál nota extra? |
| response explain: One sour-sweet note — the flat five — turns the pentatonic blue. | Una nota agridulce — la quinta bemol — convierte la pentatónica en blues. |
| response choices: The 2nd / The b5 / The major 7th / The 4th | El 2º / La b5 / La 7ª mayor / El 4º |

**Station B — Listen for relative vs parallel**

| English | Spanish |
|---|---|
| text: Listen for it: play a C major chord, then an A minor chord, then a C minor chord (Cm = your full Bm barre shape from Module 7, slid up one fret to fret 3). C-to-Am shares every note (relative); C-to-Cm shares only the root (parallel). Notice how different Am and Cm sound from each other, even though both are "C's minor." | Escucha esto: toca un acorde de C mayor, luego un acorde de A menor, y luego un acorde de C menor (Cm = tu forma completa de cejilla de Bm del Módulo 7, deslizada un traste hacia arriba, al traste 3). C a Am comparte cada nota (relativa); C a Cm comparte solo la raíz (paralela). Fíjate qué tan diferentes suenan Am y Cm entre sí, aunque ambos sean "el menor de C." |
| hint: These two ideas get mixed up constantly — the exercise is hearing that "C's relative minor" and "C's parallel minor" are two completely different chords. | Estas dos ideas se confunden constantemente — el ejercicio es escuchar que "la relativa menor de C" y "la paralela menor de C" son dos acordes completamente distintos. |
| response prompt: Relative minor vs parallel minor — the difference is: | La relativa menor frente a la paralela menor — la diferencia es: |
| response explain: A minor is C major's relative (same notes). C minor is C major's parallel (same root, different notes). | A menor es la relativa de C mayor (mismas notas). C menor es la paralela de C mayor (misma raíz, notas distintas). |
| response choices: Relative shares the same NOTES; parallel shares the same ROOT / They're two names for one thing / Parallel shares the notes; relative shares the root / Neither involves minor | La relativa comparte las mismas NOTAS; la paralela comparte la misma RAÍZ / Son dos nombres para la misma cosa / La paralela comparte las notas; la relativa comparte la raíz / Ninguna de las dos involucra menor |

**Station B — Try finding a core song's relative key**

| English | Spanish |
|---|---|
| text: Now try it: All Along the Watchtower loops in A minor. Find its relative major by sliding 3 frets up from A — check your answer before moving on. | Ahora pruébalo: All Along the Watchtower gira en A menor. Encuentra su relativa mayor deslizando 3 trastes hacia arriba desde A — comprueba tu respuesta antes de seguir. |
| hint: Relative major is always 3 frets UP from a minor root — the mirror image of sliding 3 frets down to find a relative minor. | La relativa mayor siempre está 3 trastes ARRIBA de una raíz menor — la imagen espejo de deslizar 3 trastes abajo para encontrar una relativa menor. |
| response prompt: All Along the Watchtower lives in A minor. Its relative major is: | All Along the Watchtower vive en A menor. Su relativa mayor es: |
| response explain: 3 frets UP from A lands on C — Am and C major share every note. | 3 trastes ARRIBA de A cae en C — Am y C mayor comparten cada nota. |
| response choices: A major / F major / C major / G major | A mayor / F mayor / C mayor / G mayor |
| text: Try it on Luna: its solo lives in D minor pentatonic even though the song is in F major. Work out why using what you just learned about relative keys. | Pruébalo con Luna: su solo vive en la pentatónica menor de D aunque la canción esté en F mayor. Descubre por qué usando lo que acabas de aprender sobre tonalidades relativas. |
| hint: D minor is exactly 3 frets down from F — the same relative relationship you just used on Watchtower. | D menor está exactamente 3 trastes abajo de F — la misma relación relativa que acabas de usar en Watchtower. |
| response prompt: Luna is in F major, which is exactly why its solo uses: | Luna está en F mayor, y por eso mismo su solo usa: |
| response explain: D minor is F major's relative minor — same notes. That's why the Module 4 solo box sits at fret 10: its root is D. | D menor es la relativa menor de F mayor — mismas notas. Por eso la caja del solo del Módulo 4 está en el traste 10: su raíz es D. |
| response choices: F minor pentatonic / D minor pentatonic / A major pentatonic / C blues | Pentatónica menor de F / Pentatónica menor de D / Pentatónica mayor de A / Blues de C |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — explain relative minor in one sentence, as if to a friend. | Cierre de la estación — explica la relativa menor en una oración, como si fuera para un amigo. |
| response placeholder: e.g. it's the minor key hiding inside every major key — same notes, sadder home | p. ej. es la tonalidad menor escondida dentro de cada tonalidad mayor — mismas notas, un hogar más triste |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Find relative and parallel minors**

| English | Spanish |
|---|---|
| text: Challenge 1 — Relative Pairs Drill (a drill is a short exercise you repeat to build a skill): make five quick flashcards — major key on the front, relative minor on the back — C→Am, G→Em, F→Dm, D→Bm, A→F#m. Shuffle, flip one at a time, and answer out loud before checking the back. Then explain out loud how a PARALLEL minor would be different for the same key. (Got someone nearby? Have them quiz you with the cards.) | Reto 1 — Ejercicio de Pares Relativos (un ejercicio es una actividad corta que repites para desarrollar una destreza): haz cinco tarjetas rápidas — tonalidad mayor al frente, relativa menor atrás — C→Am, G→Em, F→Dm, D→Bm, A→F#m. Mézclalas, voltea una a la vez, y responde en voz alta antes de revisar el reverso. Luego explica en voz alta cómo sería distinta una paralela menor para esa misma tonalidad. (¿Tienes a alguien cerca? Pídele que te haga preguntas con las tarjetas.) |
| hint: The shortcut: relative minor is always 3 frets down from the major root, or the major scale's 6th note. | El atajo: la relativa menor siempre está 3 trastes abajo de la raíz mayor, o es la 6ª nota de la escala mayor. |
| stuck: Drill just C→Am and G→Em until those two are automatic, then add the rest. | Practica solo C→Am y G→Em hasta que esos dos sean automáticos, y luego agrega el resto. |
| levelUp: Add two more keys of your own (E, Bb) and find their relative minors on the spot. | Agrega dos tonalidades más por tu cuenta (E, Bb) y encuentra sus relativas menores al instante. |

**Station C — Build and play the blues scale**

| English | Spanish |
|---|---|
| text: Challenge 2 — Blues Scale (your assessment piece): add the b5 to A minor pentatonic box 1 and play it ascending and descending at 60 BPM. The play button checks the ascending run — match it, then play the descent on your own after. You've got it when: the added note matches what you hear from the play button, every time. | Reto 2 — Escala de Blues (tu pieza de evaluación): agrega la b5 a la caja 1 de la pentatónica menor de A y tócala subiendo y bajando a 60 BPM. El botón de reproducir comprueba el recorrido ascendente — iguálalo, y luego toca el descenso por tu cuenta después. Lo tienes cuando: la nota agregada coincide con lo que escuchas del botón de reproducir, cada vez. |
| hint: The b5 sits between two notes you already know in the box — it's one extra finger placement, not a new shape to learn from scratch. | La b5 se ubica entre dos notas que ya conoces en la caja — es una colocación de dedo extra, no una forma nueva que aprender desde cero. |
| stuck: Play the plain minor pentatonic box first, then just add the one extra note once the rest is solid. | Toca primero la caja simple de pentatónica menor, y luego agrega solo la nota extra una vez que el resto esté sólido. |
| levelUp: Play the blues scale over a 12-bar blues feel, or build it starting from a different root. | Toca la escala de blues sobre la sensación de un blues de 12 compases, o constrúyela empezando desde otra raíz. |
| playSeq label: A blues scale, box 1 | Escala de blues de A, caja 1 |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Smoke on the Water, bluesy: play the A blues scale over the feel of the riff (a riff is a short musical phrase that repeats) — this is where this scale is normally used, the sound it was built for. | Reto — Smoke on the Water, con sabor a blues: toca la escala de blues de A sobre la sensación del riff (un riff es una frase musical corta que se repite) — aquí es donde normalmente se usa esta escala, el sonido para el que fue creada. |
| hint: Deep Purple's whole riff lives in exactly this bluesy, gritty pentatonic-plus-b5 sound world. | Todo el riff de Deep Purple vive exactamente en este mundo sonoro bluesero y áspero de pentatónica más b5. |
| stuck: Play the riff itself first to get the feel steady, then freely play the blues scale over the same groove (a groove is the steady rhythmic feel). | Toca primero el riff mismo para asentar la sensación, y luego toca libremente la escala de blues sobre el mismo groove (un groove es la sensación rítmica constante). |
| levelUp: Try soloing over the riff using only the blues scale, no other notes. | Intenta improvisar un solo sobre el riff usando solo la escala de blues, sin otras notas. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: What's the relative minor of F (Luna's key)? Which single note makes a pentatonic a blues scale? Write both below. (One more below: Jam it — the blues scale over a real form.) | ¿Cuál es la relativa menor de F (la tonalidad de Luna)? ¿Cuál nota única convierte una pentatónica en una escala de blues? Escribe ambas abajo. (Una más abajo: Tócalo de improviso — la escala de blues sobre una forma real.) |
| response placeholder: e.g. Dm is F's relative minor; the b5 is what makes it blues | p. ej. Dm es la relativa menor de F; la b5 es lo que la hace blues |

**Station C — Jam it — the blues scale over a real form**

| English | Spanish |
|---|---|
| text: Jam it (to jam = play along freely and make up your own part): record yourself strumming the 12-bar blues form in A — the bars run A A A A \| D D A A \| E D A E (plain A, D, E or power chords work fine for now) — then loop the recording and solo over it with your blues scale, box 1 at fret 5. One chorus of comping, one chorus of soloing — one chorus = one full trip through the 12 bars, and comping = playing the backing chords while someone else solos. (The full story behind that bar map is in Module 11, Set 3.) Playing with someone? One comps while the other solos, then swap. | Tócalo de improviso (tocar de improviso = tocar libremente e inventar tu propia parte): grábate rasgueando la forma de blues de 12 compases en A — los compases van A A A A \| D D A A \| E D A E (por ahora funcionan bien A, D, E simples o como acordes de potencia) — y luego repite la grabación en loop y haz un solo sobre ella con tu escala de blues, caja 1 en el traste 5. Una vuelta de acompañamiento, una vuelta de solo — una vuelta = un recorrido completo por los 12 compases, y acompañar = tocar los acordes de base mientras otra persona hace el solo. (La historia completa detrás de ese mapa de compases está en el Módulo 11, Unidad 3.) ¿Tocando con alguien? Uno acompaña mientras el otro hace el solo, y luego cambian. |
| hint: Follow the form, not just the scale — when the loop returns to A, land on an A and let it ring. That arrival is what "playing the changes" means. | Sigue la forma, no solo la escala — cuando el loop regresa a A, cae en una A y déjala sonar. Esa llegada es lo que significa "tocar los cambios." |
| playSeq label: A blues scale, box 1 (loop-ready) | Escala de blues de A, caja 1 (lista para loop) |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| m10w2-s1 text: Find the relative minor of any major key (6th degree / 3 frets down) | Encontrar la relativa menor de cualquier tonalidad mayor (6º grado / 3 trastes abajo) |
| m10w2-s1 practice prompt: The relative minor of G major is: | La relativa menor de G mayor es: |
| m10w2-s1 practice choices: G minor / B minor / E minor / D minor | G menor / B menor / E menor / D menor |
| m10w2-s2 text: Explain the difference between relative and parallel minor | Explicar la diferencia entre la relativa y la paralela menor |
| m10w2-s2 practice prompt: C major's PARALLEL minor is: | La PARALELA menor de C mayor es: |
| m10w2-s2 practice choices: A minor / C minor / E minor / F minor | A menor / C menor / E menor / F menor |
| m10w2-s3 text: Name Watchtower's key (Am) and its relative major (C) | Nombrar la tonalidad de Watchtower (Am) y su relativa mayor (C) |
| m10w2-s4 text: Build the blues scale by adding the b5 to minor pentatonic box 1 | Construir la escala de blues agregando la b5 a la caja 1 de pentatónica menor |
| m10w2-s4 practice prompt: In A minor pentatonic at fret 5, the added blues note (b5, an Eb) sits on the A string at fret: | En la pentatónica menor de A en el traste 5, la nota de blues agregada (b5, una Eb) se ubica en la cuerda La en el traste: |
| m10w2-s4 practice choices: 5 / 6 / 7 / 8 | 5 / 6 / 7 / 8 |
| m10w2-s5 text: Play the blues scale ascending and descending at 60 BPM | Tocar la escala de blues subiendo y bajando a 60 BPM |
| m10w2-s5 practice label: A blues scale, box 1 | Escala de blues de A, caja 1 |
| m10w2-s6 text: Name relative pairs for our core songs' keys (SNA Em↔G · Watchtower Am↔C · Sweet Child D↔Bm · Luna F↔Dm · Let It Be C↔Am) | Nombrar los pares relativos de las tonalidades de nuestras canciones principales (SNA Em↔G · Watchtower Am↔C · Sweet Child D↔Bm · Luna F↔Dm · Let It Be C↔Am) |
| m10w2-s7 text: Solo with the blues scale over a 12-bar blues loop, following the form | Improvisar un solo con la escala de blues sobre un loop de blues de 12 compases, siguiendo la forma |
| m10w2-s7 gotItWhen: you can hear the chord changes coming and land on a strong note when the loop returns to the I chord. | puedes escuchar los cambios de acorde venir y caer en una nota fuerte cuando el loop regresa al acorde I. |
| m10w2-s7 practice label: A blues scale, box 1 (loop-ready) | Escala de blues de A, caja 1 (lista para loop) |

### Set 3

| English | Spanish |
|---|---|
| unit: Module 10 · Scales, Keys & Ear Training | Módulo 10 · Escalas, Tonalidades y Entrenamiento Auditivo |
| subtitle: Move any pattern to any key · Sing it, then play it · Major vs minor by ear | Mueve cualquier patrón a cualquier tonalidad · Cántalo, y luego tócalo · Mayor vs. menor de oído |
| skillFocus: Transposing = moving the root · Sing-then-play · Hearing major (bright) vs minor (dark) | Transponer = mover la raíz · Canta y luego toca · Escuchar mayor (brillante) vs. menor (oscuro) |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for bright vs dark | Escucha brillante vs. oscuro |
| Section title: Try transposing a pattern | Prueba a transponer un patrón |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — transposing and ear training | Estación de práctica — transponer y entrenamiento auditivo |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Transpose box 1 to a named key | Transpon la caja 1 a una tonalidad nombrada |
| Section title: Sing it, then play it | Cántalo, y luego tócalo |
| Section title: Echo a pattern by ear | Repite un patrón de oído |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Station Wrap-Up | Cierre de la estación |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: HOW TO USE The Minor Pentatonic Scale on the Guitar – Lauren Bateman (0:00–5:00), watching the shape as a MOVABLE pattern rather than a fixed one. | Mira: HOW TO USE The Minor Pentatonic Scale on the Guitar – Lauren Bateman (0:00–5:00), observando la forma como un patrón MÓVIL en lugar de uno fijo. |
| hint: Nothing about the shape changes when you slide it — only the fret you start on, which renames the key. | Nada de la forma cambia cuando la deslizas — solo el traste en el que empiezas, que renombra la tonalidad. |
| response prompt: Minor pentatonic box 1 with its root at fret 5 is A minor. Slide it to fret 7 and it becomes: | La caja 1 de pentatónica menor con su raíz en el traste 5 es A menor. Deslízala al traste 7 y se convierte en: |
| response explain: The root fret names the key: fret 7 on the low E is B. | El traste de la raíz nombra la tonalidad: el traste 7 en la Mi grave es B. |
| response choices: B minor / C minor / G minor / A major | B menor / C menor / G menor / A mayor |
| text: Watch: 5' Guitar Exercise: Find Melodies You Know – JustinGuitar. This is the exact sing-it-then-find-it habit today's Station C drill is built around. | Mira: 5' Guitar Exercise: Find Melodies You Know – JustinGuitar. Este es exactamente el hábito de cantarlo-y-luego-encontrarlo alrededor del cual está construido el ejercicio de la Estación C de hoy. |
| hint: This is the single most useful guitar habit you can build: sing what you hear first, then let your hands catch up. | Este es el hábito más útil que puedes construir en la guitarra: canta primero lo que escuchas, y luego deja que tus manos te alcancen. |
| response prompt: The best FIRST step to playing a melody by ear is: | El mejor PRIMER paso para tocar una melodía de oído es: |
| response explain: If you can sing it, you know it — your hands just have to find what your voice already solved. | Si puedes cantarla, la conoces — tus manos solo tienen que encontrar lo que tu voz ya resolvió. |
| response choices: Guess randomly / Sing it, then hunt for your sung notes on one string / Look up the TAB / Play every fret until something works | Adivinar al azar / Cantarla, y luego buscar las notas cantadas en una sola cuerda / Buscar el TAB / Tocar cada traste hasta que algo funcione |
| text: Optional bonus watch: How To Develop The World's Greatest Ear – Rick Beato — a producer's view of the exact skill this set trains. You don't need the advanced parts: the opening idea (ears are built by a little practice every day, not talent) is the main point — then go do the Station C echo drills. | Video extra opcional: How To Develop The World's Greatest Ear – Rick Beato — la visión de un productor sobre exactamente la destreza que entrena esta unidad. No necesitas las partes avanzadas: la idea inicial (el oído se construye con un poco de práctica cada día, no con talento) es el punto principal — y luego ve a hacer los ejercicios de eco de la Estación C. |
| response placeholder: One idea from this video worth borrowing for your own practice: … | Una idea de este video que vale la pena tomar prestada para tu propia práctica: … |

**Station B — Listen for bright vs dark**

| English | Spanish |
|---|---|
| text: Listen for it: play a major chord, then its parallel minor, back and forth. Notice which one sounds "bright" and which sounds "dark" — this is the ear-training foundation for everything else today. | Escucha esto: toca un acorde mayor, luego su paralela menor, alternando. Fíjate cuál suena "brillante" y cuál suena "oscuro" — esta es la base de entrenamiento auditivo para todo lo demás de hoy. |
| hint: You've been hearing this distinction since Module 4 — today you're naming it and using it deliberately. | Has estado escuchando esta distinción desde el Módulo 4 — hoy la estás nombrando y usando a propósito. |
| response prompt: To most ears, major sounds ___ and minor sounds ___: | Para la mayoría de los oídos, el mayor suena ___ y el menor suena ___: |
| response explain: Bright-happy vs dark-moody is the first ear-training distinction — you've been hearing it since Module 4. | Brillante-alegre vs. oscuro-melancólico es la primera distinción del entrenamiento auditivo — la has estado escuchando desde el Módulo 4. |
| response choices: dark, then bright / bright, then dark / loud, then quiet / fast, then slow | oscuro, y luego brillante / brillante, y luego oscuro / fuerte, y luego suave / rápido, y luego lento |

**Station B — Try transposing a pattern**

| English | Spanish |
|---|---|
| text: Now try it: take minor pentatonic box 1 and move it up two frets from wherever you're starting. Say out loud what key it's in now before you check. | Ahora pruébalo: toma la caja 1 de pentatónica menor y muévela dos trastes hacia arriba desde donde estés empezando. Di en voz alta en qué tonalidad está ahora antes de comprobarlo. |
| hint: The pattern itself never changes shape — only the fret you start it on, which is what "transposing" means. | El patrón en sí nunca cambia de forma — solo el traste en el que lo empiezas, que es lo que significa "transponer." |
| response prompt: Transposing a riff means: | Transponer un riff significa: |
| response explain: The pattern is a movable shape — slide the whole thing so its ROOT lands on the new key's note. | El patrón es una forma móvil — desliza todo el conjunto para que su RAÍZ caiga en la nota de la nueva tonalidad. |
| response choices: Playing it faster / Moving it to a different key, keeping its shape / Playing it backwards / Adding more notes | Tocarlo más rápido / Moverlo a una tonalidad distinta, manteniendo su forma / Tocarlo al revés / Agregar más notas |
| text: Try moving a pattern UP two half steps and predict the new fret before you slide there. | Prueba a mover un patrón dos semitonos HACIA ARRIBA y predice el nuevo traste antes de deslizarte hasta ahí. |
| hint: Half steps are just frets — count two frets toward the body from wherever you started. | Los semitonos son solo trastes — cuenta dos trastes hacia el cuerpo desde donde empezaste. |
| response prompt: To move a pattern UP two half steps, you move it: | Para mover un patrón dos semitonos HACIA ARRIBA, lo mueves: |
| response explain: Half steps are frets — two half steps = two frets up the neck. | Los semitonos son trastes — dos semitonos = dos trastes hacia arriba del mástil. |
| response choices: 2 strings up / 2 frets toward the body / 2 frets toward the headstock / You can't | 2 cuerdas hacia arriba / 2 trastes hacia el cuerpo / 2 trastes hacia el clavijero / No puedes |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — which was harder today, moving the pattern to a new key, or echoing by ear? Why? | Cierre de la estación — ¿qué fue más difícil hoy, mover el patrón a una nueva tonalidad, o repetir de oído? ¿Por qué? |
| response placeholder: e.g. echoing — I could sing it but took a while to find the starting fret | p. ej. repetir de oído — podía cantarlo pero me tomó tiempo encontrar el traste inicial |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Transpose box 1 to a named key**

| English | Spanish |
|---|---|
| text: Challenge 1 — Transpose Drill: write Am, Gm, Bm, and Dm on four slips, shuffle, and draw one at a time — play minor pentatonic box 1 at that key's fret: fret 5 (Am), fret 3 (Gm), fret 7 (Bm), fret 10 (Dm — Luna's solo box!). You've got it when: you can find any of these four positions within 5 seconds of drawing the key name. | Reto 1 — Ejercicio de Transposición: escribe Am, Gm, Bm y Dm en cuatro papelitos, mézclalos, y saca uno a la vez — toca la caja 1 de pentatónica menor en el traste de esa tonalidad: traste 5 (Am), traste 3 (Gm), traste 7 (Bm), traste 10 (Dm — ¡la caja del solo de Luna!). Lo tienes cuando: puedes encontrar cualquiera de estas cuatro posiciones dentro de los 5 segundos de sacar el nombre de la tonalidad. |
| hint: Fret 10 should feel familiar — it's the exact box you've been using for Luna's solo since Module 4, now with a name attached. | El traste 10 debería sentirse familiar — es exactamente la caja que has estado usando para el solo de Luna desde el Módulo 4, ahora con un nombre asignado. |
| stuck: Drill just Am (fret 5) and Dm (fret 10) — the two you already know from real songs — before adding Gm and Bm. | Practica solo Am (traste 5) y Dm (traste 10) — los dos que ya conoces de canciones reales — antes de agregar Gm y Bm. |
| levelUp: Move through all four positions without stopping, or have someone call out keys for you to find blind. | Recorre las cuatro posiciones sin detenerte, o pídele a alguien que diga tonalidades para que las encuentres a ciegas. |

**Station C — Sing it, then play it**

| English | Spanish |
|---|---|
| text: Challenge 2 — Sing-Then-Play: record yourself playing 3 random notes on the low E string (frets 0–5) without watching your hand — or use the Echo Drill play button below as your note source. Wait a moment, play the recording back, sing the notes, then find and play them. (Got someone nearby? They can play the 3 notes for you instead.) | Reto 2 — Canta y Luego Toca: grábate tocando 3 notas al azar en la cuerda Mi grave (trastes 0–5) sin mirar tu mano — o usa el botón de reproducir del Ejercicio de Eco de abajo como tu fuente de notas. Espera un momento, reproduce la grabación, canta las notas, y luego encuéntralas y tócalas. (¿Tienes a alguien cerca? Puede tocarte las 3 notas en tu lugar.) |
| hint: Sing FIRST, before you touch the guitar — that order is the whole skill. | Canta PRIMERO, antes de tocar la guitarra — ese orden es toda la destreza. |
| stuck: Start with just one note instead of three, and build up once that's reliable. | Empieza con solo una nota en lugar de tres, y aumenta una vez que eso sea confiable. |
| levelUp: Extend to 5 notes, or record notes spread across two strings. | Extiéndelo a 5 notas, o graba notas repartidas en dos cuerdas. |

**Station C — Echo a pattern by ear**

| English | Spanish |
|---|---|
| text: Challenge 3 — Echo Drill (your assessment piece): for round 1, listen to the 3-note pattern once using the play button below, sing it back, then play it on the E or A string. For rounds 2–4, record yourself playing 3 random notes (eyes off your hand) and echo those back the same way. You've got it when: 3 out of 4 patterns matched correctly, by ear alone. | Reto 3 — Ejercicio de Eco (tu pieza de evaluación): para la ronda 1, escucha el patrón de 3 notas una vez usando el botón de reproducir de abajo, cántalo de vuelta, y luego tócalo en la cuerda Mi o La. Para las rondas 2–4, grábate tocando 3 notas al azar (sin mirar tu mano) y repítelas de la misma manera. Lo tienes cuando: 3 de 4 patrones coincidan correctamente, solo de oído. |
| hint: Resist the urge to search fret by fret at random before you've sung the pattern — singing first fixes the pitch in your ear, and that's what your hands need to find. | Resiste el impulso de buscar traste por traste al azar antes de haber cantado el patrón — cantar primero fija el tono en tu oído, y eso es lo que tus manos necesitan encontrar. |
| stuck: Slow the pattern down and repeat just the first two notes until they're solid, then add the third. | Baja la velocidad del patrón y repite solo las primeras dos notas hasta que estén sólidas, y luego agrega la tercera. |
| levelUp: Extend the echo to 4 or 5 notes, or echo a short lick (a lick is a short solo phrase) from a tutorial video you haven't learned yet — a pattern you've truly never heard. (A partner playing surprise patterns works too.) | Extiende el eco a 4 o 5 notas, o repite un lick corto (un lick es una frase corta de solo) de un video tutorial que no hayas aprendido todavía — un patrón que de verdad nunca hayas escuchado. (Un compañero tocando patrones sorpresa también funciona.) |
| playSeq label: Echo pattern — E · G · A | Patrón de eco — E · G · A |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — "the cure", by ear: strum through the progression and, without looking anything up, decide by ear which chords feel bright and which feel dark. | Reto — "the cure", de oído: rasguea la progresión y, sin buscar nada, decide de oído cuáles acordes se sienten brillantes y cuáles se sienten oscuros. |
| hint: You already know the chord names from Module 9 — today's challenge is trusting your ear to sort them into bright vs dark before you check. | Ya conoces los nombres de los acordes desde el Módulo 9 — el reto de hoy es confiar en tu oído para clasificarlos en brillante vs. oscuro antes de comprobarlo. |
| stuck: Isolate just two chords at a time and compare them directly, back and forth. | Aísla solo dos acordes a la vez y compáralos directamente, alternando. |
| levelUp: Guess which chord is the "home" chord using only your ear, then confirm it. | Adivina cuál acorde es el acorde "base" usando solo tu oído, y luego confírmalo. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Where does box 1 sit for D minor? Can you sing a phrase from a core song and find its first note? Write both below. | ¿Dónde se ubica la caja 1 para D menor? ¿Puedes cantar una frase de una canción principal y encontrar su primera nota? Escribe ambas abajo. |
| response placeholder: e.g. D minor box 1 is fret 10; I found "the cure"'s first note on the A string | p. ej. la caja 1 de D menor está en el traste 10; encontré la primera nota de "the cure" en la cuerda La |

**Set 3 — Skills**

| English | Spanish |
|---|---|
| m10w3-s1 text: Transpose minor pentatonic box 1 to any named key | Transponer la caja 1 de pentatónica menor a cualquier tonalidad nombrada |
| m10w3-s1 practice prompt: For D minor, box 1's root sits at low-E fret: | Para D menor, la raíz de la caja 1 se ubica en el traste de la Mi grave: |
| m10w3-s1 practice choices: 5 / 7 / 10 / 12 | 5 / 7 / 10 / 12 |
| m10w3-s2 text: Move a riff up or down the neck to a new key and play it | Mover un riff hacia arriba o abajo del mástil a una nueva tonalidad y tocarlo |
| m10w3-s3 text: Sing a short pattern, then find and play it on one string | Cantar un patrón corto, y luego encontrarlo y tocarlo en una sola cuerda |
| m10w3-s4 text: Tell major from minor by ear | Distinguir mayor de menor de oído |
| m10w3-s4 practice prompt: A progression feels moody and dark. Its home chord is most likely: | Una progresión se siente melancólica y oscura. Su acorde base es más probablemente: |
| m10w3-s4 practice choices: Major / Minor / A power chord / A slash chord | Mayor / Menor / Un acorde de potencia / Un acorde slash (con un bajo distinto) |
| m10w3-s5 text: Echo back a 3-note pattern by ear on the E or A string | Repetir de oído un patrón de 3 notas en la cuerda Mi o La |
| m10w3-s5 practice label: Echo pattern — E · G · A | Patrón de eco — E · G · A |
| m10w3-s6 text: Identify whether a core-song chord sounds major or minor (Luna's F = bright, Am = dark) | Identificar si un acorde de una canción principal suena mayor o menor (la F de Luna = brillante, Am = oscuro) |

### Module-level Songs

MODULE_SONGS[10] meta fields (song title shown for reference, not itself translated on the site).

| English | Spanish |
|---|---|
| "Seven Nation Army" — The White Stripes — meta: Name its key and scale (E minor) | Nombra su tonalidad y escala (E menor) |
| "All Along the Watchtower" — Dylan / Hendrix — meta: Am — find the relative major | Am — encuentra la relativa mayor |
| "Luna" — Peso Pluma, Junior H — meta: F major — why the solo uses D minor pentatonic | F mayor — por qué el solo usa la pentatónica menor de D |
| "the cure" — Olivia Rodrigo — meta: Transpose the progression's shapes to a new key | Transpon las formas de la progresión a una nueva tonalidad |
| "Smoke on the Water" — Deep Purple — meta: Blues scale where it's normally used | La escala de blues donde normalmente se usa |
| "Beat It" — Michael Jackson — meta: The Em pentatonic solo — name the key by ear | El solo de pentatónica de Em — nombra la tonalidad de oído |
| "Ella Baila Sola" — Eslabon Armado × Peso Pluma — meta: Hear major vs minor in the progression | Escucha mayor vs. menor en la progresión |
| "House of the Rising Sun" — The Animals — meta: A minor — the classic minor-key sound | A menor — el sonido clásico de tonalidad menor |

### Module Review

| English | Spanish |
|---|---|
| module: Scales, Keys & Ear Training | Escalas, Tonalidades y Entrenamiento Auditivo |
| skill mr10-s1: I can say the major-scale recipe (W-W-H-W-W-W-H) from memory | Puedo decir la receta de la escala mayor (T-T-S-T-T-T-S) de memoria |
| skill mr10-s2: I can spell C major and G major note-by-note out loud | Puedo deletrear C mayor y G mayor nota por nota en voz alta |
| skill mr10-s3: I can find the relative minor of any major key | Puedo encontrar la relativa menor de cualquier tonalidad mayor |
| skill mr10-s4: I can build and play the blues scale from minor pentatonic box 1 | Puedo construir y tocar la escala de blues a partir de la caja 1 de pentatónica menor |
| skill mr10-s5: I can transpose minor pentatonic box 1 to any named key | Puedo transponer la caja 1 de pentatónica menor a cualquier tonalidad nombrada |
| skill mr10-s6: I can tell major from minor by ear | Puedo distinguir mayor de menor de oído |
| assessItem: Transpose a pentatonic pattern to a randomly drawn key and play it | Transponer un patrón pentatónico a una tonalidad sacada al azar y tocarlo |
| assessItem: Name the relative minor of a given major key | Nombrar la relativa menor de una tonalidad mayor dada |
| assessItem: Identify major vs minor — and echo a short pattern — by ear | Identificar mayor vs. menor — y repetir un patrón corto — de oído |
| forward: You can build scales, name keys, and trust your ear. <strong>Module 11 does the same for chords:</strong> you'll see why Let It Be's four chords work, number any progression like a pro, and unlock twelve chords from one barre shape. | Puedes construir escalas, nombrar tonalidades, y confiar en tu oído. <strong>El Módulo 11 hace lo mismo con los acordes:</strong> verás por qué funcionan los cuatro acordes de Let It Be, numerarás cualquier progresión como un profesional, y desbloquearás doce acordes a partir de una sola forma de cejilla. |

## Module 11 — Chords, Keys & Harmony

### Set 1

| English | Spanish |
|---|---|
| unit: Module 11 · Chords, Keys & Harmony | Módulo 11 · Acordes, Tonalidades y Armonía |
| subtitle: Stack every other note · I ii iii IV V vi · The chord family of a key | Apila cada otra nota · I ii iii IV V vi · La familia de acordes de una tonalidad |
| skillFocus: Triad = root + 3rd + 5th · UPPERCASE major (I IV V), lowercase minor (ii iii vi) · The diatonic family (chords built only from the key's own seven notes) | Tríada = raíz + 3ª + 5ª · Mayor en MAYÚSCULAS (I IV V), menor en minúsculas (ii iii vi) · La familia diatónica (acordes construidos solo con las siete notas propias de la tonalidad) |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for the numerals in a familiar song | Escucha los números romanos en una canción conocida |
| Section title: Try building a chord family | Prueba a construir una familia de acordes |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — triads and numerals | Estación de práctica — tríadas y números romanos |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Build and play a chord family | Construye y toca una familia de acordes |
| Section title: Numeral flashcards | Tarjetas de números romanos |
| Section title: Take It to a Song | Llévalo a una canción |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: Encontrar los acordes en cualquier tonalidad – Maru Martinez (0:00–7:27) (in Spanish — turn on English captions if you need them; the on-screen diagrams carry the lesson). Watch how she builds a chord on every note of the scale — that's the "chord family" you'll be naming with Roman numerals today. | Mira: Encontrar los acordes en cualquier tonalidad – Maru Martinez (0:00–7:27) (en español — activa los subtítulos en inglés si los necesitas; los diagramas en pantalla llevan la lección). Mira cómo ella construye un acorde en cada nota de la escala — esa es la "familia de acordes" que vas a nombrar con números romanos hoy. |
| hint: Every chord you've ever strummed is built from a scale — today you learn the recipe that turns one scale into a whole family of chords. | Cada acorde que has rasgueado alguna vez se construye a partir de una escala — hoy aprendes la receta que convierte una escala en toda una familia de acordes. |
| response prompt: A triad is built by stacking: | Una tríada se construye apilando: |
| response explain: Skip-a-note, skip-a-note: C-E-G makes the C chord. Every chord you've strummed is one of these plus doubled notes. | Salta una nota, salta una nota: C-E-G arma el acorde de C. Cada acorde que has rasgueado es uno de estos más notas duplicadas. |
| response choices: Any three notes / Every other note of a scale: root, 3rd, 5th / Three notes on one string / The same note in three octaves | Cualquier tres notas / Cada otra nota de una escala: raíz, 3ª, 5ª / Tres notas en una sola cuerda / La misma nota en tres octavas |
| text: Watch: Understanding CHORDS (Ep. 3 Music Theory) – Paul Davids. Every chord you've ever strummed is built from the same three notes — root, 3rd, 5th — and Paul shows where they come from. A different teacher than the first video on purpose: notice which explanation makes the most sense to you. | Mira: Understanding CHORDS (Ep. 3 Music Theory) – Paul Davids. Cada acorde que has rasgueado alguna vez se construye con las mismas tres notas — raíz, 3ª, 5ª — y Paul muestra de dónde vienen. Un maestro distinto al del primer video a propósito: fíjate cuál explicación tiene más sentido para ti. |
| hint: Notice the pattern: three of the seven chords in a key come out major, and three come out minor — no exceptions, in any key. | Fíjate en el patrón: tres de los siete acordes de una tonalidad salen mayores, y tres salen menores — sin excepciones, en cualquier tonalidad. |
| response prompt: In any major key, chords I, IV, and V are major. Chords ii, iii, and vi are: | En cualquier tonalidad mayor, los acordes I, IV y V son mayores. Los acordes ii, iii y vi son: |
| response explain: The scale's spacing makes it automatic — uppercase numerals = major, lowercase = minor. | El espaciado de la escala lo hace automático — números romanos en mayúscula = mayor, en minúscula = menor. |
| response choices: Also major / Minor / Power chords / Silent | También mayores / Menores / Acordes de potencia / Silenciosos |

**Station B — Listen for the numerals in a familiar song**

| English | Spanish |
|---|---|
| text: Listen for it: play through Let It Be's C–G–Am–F loop and, before checking, guess which numeral each chord is in the key of C. | Escucha con atención: toca el loop C–G–Am–F de Let It Be y, antes de revisar, adivina qué número romano es cada acorde en la tonalidad de C. |
| hint: C is home (I), so everything else numbers off of it — G is a fifth up, Am shares C's notes, F is a fourth up. | C es la base (I), así que todo lo demás se numera a partir de ella — G es una quinta arriba, Am comparte las notas de C, F es una cuarta arriba. |
| response prompt: Let It Be's C–G–Am–F in the key of C is: | El C–G–Am–F de Let It Be en la tonalidad de C es: |
| response explain: C=I, G=V, Am=vi, F=IV — the most-used progression in pop history, and now you can name it. | C=I, G=V, Am=vi, F=IV — la progresión más usada en la historia del pop, y ahora puedes nombrarla. |
| response choices: I–IV–V–I / I–V–vi–IV / ii–V–I–IV / vi–IV–I–V | I–IV–V–I / I–V–vi–IV / ii–V–I–IV / vi–IV–I–V |

**Station B — Try building a chord family**

| English | Spanish |
|---|---|
| text: Now try it: build a triad on every note of the C major scale (C-D-E-F-G-A-B) and see which come out major and which come out minor. | Ahora pruébalo: construye una tríada en cada nota de la escala de C mayor (C-D-E-F-G-A-B) y observa cuáles salen mayores y cuáles salen menores. |
| hint: You'll get major-minor-minor-major-major-minor-diminished — the same pattern in every major key. | Obtendrás mayor-menor-menor-mayor-mayor-menor-disminuido — el mismo patrón en cualquier tonalidad mayor. |
| response prompt: The chord family of C major is: | La familia de acordes de C mayor es: |
| response explain: Build a triad on each scale note: major-minor-minor-major-major-minor, in every major key. | Construye una tríada en cada nota de la escala: mayor-menor-menor-mayor-mayor-menor, en cualquier tonalidad mayor. |
| response choices: C · Dm · Em · F · G · Am / C · D · E · F · G · A / Cm · Dm · Em · Fm · Gm · Am / C · Dm · E · F · Gm · Am | C · Dm · Em · F · G · Am / C · D · E · F · G · A / Cm · Dm · Em · Fm · Gm · Am / C · Dm · E · F · Gm · Am |
| text: Try it on Luna: F and Am aren't I–IV or I–V — figure out which scale degree Am is built on in the key of F before checking. | Pruébalo con Luna: F y Am no son I–IV ni I–V — averigua sobre cuál grado de la escala está construido Am en la tonalidad de F antes de revisar. |
| hint: Count up the F major scale: F(I) G(ii) A(iii) — Am is built on the THIRD note. | Cuenta hacia arriba en la escala de F mayor: F(I) G(ii) A(iii) — Am está construido sobre la TERCERA nota. |
| response prompt: Luna vamps between F and Am — a vamp is a short chord pattern repeated over and over — in the key of F. In numerals that's: | Luna hace un vamp entre F y Am — un vamp es un patrón corto de acordes repetido una y otra vez — en la tonalidad de F. En números romanos eso es: |
| response explain: F=I and Am is built on F major's THIRD note — I–iii, a dreamier color than the famous four. Not every hit uses I–V–vi–IV. | F=I y Am está construido sobre la TERCERA nota de F mayor — I–iii, un color más soñador que los famosos cuatro. No todo éxito usa I–V–vi–IV. |
| response choices: I–vi / I–IV / I–iii / V–I | I–vi / I–IV / I–iii / V–I |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pick any core song: which numeral is its home chord, and is it major or minor? | Cierre de la estación — elige cualquier canción principal: ¿qué número romano es su acorde base, y es mayor o menor? |
| response placeholder: e.g. Watchtower's home is Am — the vi of C, or "i" if you call the key A minor | p. ej. la base de Watchtower es Am — el vi de C, o "i" si llamas a la tonalidad A menor |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Build and play a chord family**

| English | Spanish |
|---|---|
| text: Challenge 1 — Build the Family: write out the chord families of C major and G major (six chords each) — type them below — then play each family as open chords in order. | Reto 1 — Construye la familia: escribe las familias de acordes de C mayor y G mayor (seis acordes cada una) — anótalas abajo — y luego toca cada familia como acordes abiertos en orden. |
| hint: C family: C · Dm · Em · F · G · Am. G family: G · Am · Bm · C · D · Em. Notice how much they overlap — that's no accident. | Familia de C: C · Dm · Em · F · G · Am. Familia de G: G · Am · Bm · C · D · Em. Fíjate cuánto se superponen — eso no es casualidad. |
| stuck: Just play the C family first and get it solid before adding G. | Toca primero solo la familia de C y déjala firme antes de agregar G. |
| levelUp: Play both families back to back without looking at what you wrote. | Toca ambas familias una tras otra sin mirar lo que escribiste. |
| response placeholder: C: C Dm Em F G Am · G: … | C: C Dm Em F G Am · G: … |

**Station C — Numeral flashcards**

| English | Spanish |
|---|---|
| text: Challenge 2 — Numeral Flashcards: make six flashcards, one numeral each (I ii iii IV V vi), shuffle the deck, flip the top card, and play that chord in the key of C — no hesitating. Run the deck twice. (Got a partner handy? Have them call the numerals instead.) | Reto 2 — Tarjetas de números romanos: haz seis tarjetas, un número romano en cada una (I ii iii IV V vi), mezcla el mazo, voltea la tarjeta de arriba, y toca ese acorde en la tonalidad de C — sin dudar. Repite el mazo dos veces. (¿Tienes a alguien cerca? Pídele que diga los números romanos en tu lugar.) |
| hint: If you know the family in order (C Dm Em F G Am), the numeral just tells you which slot to reach for. | Si conoces la familia en orden (C Dm Em F G Am), el número romano solo te dice cuál lugar buscar. |
| stuck: Write the family out in numeral order on paper and keep it in view while you drill. | Escribe la familia en orden de números romanos en papel y mantenla a la vista mientras practicas. |
| levelUp: Switch to the key of G, or time yourself through the deck and try to beat your best time. Ready for all seven? Look up Bdim — the vii° of C — and add a seventh card. | Cambia a la tonalidad de G, o cronométrate a través del mazo e intenta superar tu mejor tiempo. ¿Listo para los siete? Busca Bdim — el vii° de C — y agrega una séptima tarjeta. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Let It Be, numbered: write I, V, vi, and IV on four slips, then strum the verse drawing a slip each bar (or call the numerals aloud in a random order you set beforehand) — you have to know which chord each numeral means, not just the C–G–Am–F letters. You've got it when: one full loop with every numeral landing on the right chord. (A partner calling numerals works too.) | Reto — Let It Be, numerado: escribe I, V, vi y IV en cuatro papelitos, y luego rasguea la estrofa sacando un papelito en cada compás (o di los números romanos en voz alta en un orden aleatorio que definas de antemano) — tienes que saber qué acorde significa cada número romano, no solo las letras C–G–Am–F. Lo tienes cuando: una vuelta completa con cada número romano cayendo en el acorde correcto. (Tener a alguien que diga los números romanos también funciona.) |
| hint: This is the same verse you've strummed since Module 5 — today the only new part is thinking in numerals instead of letters. | Esta es la misma estrofa que has rasgueado desde el Módulo 5 — hoy lo único nuevo es pensar en números romanos en lugar de letras. |
| stuck: Say each chord's NAME out loud first, then its numeral, until the pairing sticks. | Di primero el NOMBRE de cada acorde en voz alta, y luego su número romano, hasta que la relación se fije. |
| levelUp: Shuffle the slips into a new order each loop, and always land back on I to finish. | Mezcla los papelitos en un nuevo orden cada vuelta, y siempre termina cayendo en I. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: What's the vi chord of G major, and can you explain in one sentence why Am is lowercase but C is uppercase? | ¿Cuál es el acorde vi de G mayor, y puedes explicar en una oración por qué Am va en minúscula pero C va en mayúscula? |
| response placeholder: e.g. Em is the vi of G; Am is lowercase because it comes out minor when you stack the scale in thirds | p. ej. Em es el vi de G; Am va en minúscula porque sale menor al apilar la escala en terceras |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| m11w1-s1 text: Build a triad from a scale (root–3rd–5th) | Construir una tríada a partir de una escala (raíz–3ª–5ª) |
| m11w1-s1 practice prompt: The notes of the C major triad are: | Las notas de la tríada de C mayor son: |
| m11w1-s1 practice choices: C-D-E / C-E-G / C-F-G / C-E-A | C-D-E / C-E-G / C-F-G / C-E-A |
| m11w1-s2 text: Say which chords in a major key are major (I, IV, V) and which are minor (ii, iii, vi) | Decir cuáles acordes de una tonalidad mayor son mayores (I, IV, V) y cuáles son menores (ii, iii, vi) |
| m11w1-s2 practice prompt: In the key of G, the vi chord is: | En la tonalidad de G, el acorde vi es: |
| m11w1-s2 practice choices: E major / E minor / B minor / C major | E mayor / E menor / B menor / C mayor |
| m11w1-s3 text: Label Let It Be's C–G–Am–F as I–V–vi–IV | Etiquetar el C–G–Am–F de Let It Be como I–V–vi–IV |
| m11w1-s4 text: List the chord family of C major (C Dm Em F G Am) | Enumerar la familia de acordes de C mayor (C Dm Em F G Am) |
| m11w1-s4 practice prompt: Which chord is NOT in the key of C? | ¿Cuál acorde NO está en la tonalidad de C? |
| m11w1-s4 practice choices: Am / F / E major / Dm | Am / F / E mayor / Dm |
| m11w1-s5 text: List the chord family of G major (G Am Bm C D Em) | Enumerar la familia de acordes de G mayor (G Am Bm C D Em) |
| m11w1-s5 practice prompt: In the key of G, the IV and V chords are: | En la tonalidad de G, los acordes IV y V son: |
| m11w1-s5 practice choices: C and D / A and B / F and G / D and E | C y D / A y B / F y G / D y E |
| m11w1-s6 text: Label Luna's F–Am vamp as I–iii in F major (with the passing Dm as vi) | Etiquetar el vamp F–Am de Luna como I–iii en F mayor (con el Dm de paso como vi) |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 11 · Chords, Keys & Harmony | Módulo 11 · Acordes, Tonalidades y Armonía |
| subtitle: The chord inventory trick · I–IV–V vs the famous four · Slash chords decoded | El truco del inventario de acordes · I–IV–V vs. los famosos cuatro · Acordes con bajo alterno descifrados |
| skillFocus: Match the inventory to a family · The home chord feels like rest · G/B = G chord, B bass | Compara el inventario con una familia · El acorde base se siente como reposo · G/B = acorde de G, bajo en B |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for I–IV–V | Escucha el I–IV–V |
| Section title: Try numbering a real progression | Prueba a numerar una progresión real |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — finding the key | Estación de práctica — encontrar la tonalidad |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Chord-inventory detective drill | Ejercicio detective de inventario de acordes |
| Section title: Play and feel for home | Toca y siente la base |
| Section title: Decode a slash chord | Descifra un acorde con bajo alterno |
| Section title: Take It to a Song | Llévalo a una canción |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: What chords sound good together? \| Music theory ep. 7 – Paul Davids — a second voice on the chord families you built in Set 1. Paul shows why a key's chords belong together; your job is to run it backwards: given a song's chords, name the key. | Mira: What chords sound good together? \| Music theory ep. 7 – Paul Davids — una segunda voz sobre las familias de acordes que construiste en la Unidad 1. Paul muestra por qué los acordes de una tonalidad pertenecen juntos; tu trabajo es hacerlo al revés: dados los acordes de una canción, nombrar la tonalidad. |
| hint: You already know each key's chord family from Set 1 — this is just running that lookup backwards. | Ya conoces la familia de acordes de cada tonalidad desde la Unidad 1 — esto es solo hacer esa búsqueda al revés. |
| response prompt: A song uses G, C, D, and Em. Its key is almost certainly: | Una canción usa G, C, D y Em. Su tonalidad casi seguro es: |
| response explain: All four live in G major's family, and G/D/C are its I, V, IV. (Em, the relative minor, shares those notes too — your ear decides between G and Em by which chord feels like home.) | Los cuatro viven en la familia de G mayor, y G/D/C son su I, V, IV. (Em, la relativa menor, también comparte esas notas — tu oído decide entre G y Em según cuál acorde se sienta como base.) |
| response choices: C major / G major / D major / F major | C mayor / G mayor / D mayor / F mayor |
| text: Watch: All Along the Watchtower – Bob Dylan (Official Audio). Listen to the Am–G–F loop and, without looking anything up, decide by ear which chord feels like "home." | Mira: All Along the Watchtower – Bob Dylan (Official Audio). Escucha el loop Am–G–F y, sin buscar nada, decide de oído cuál acorde se siente como "base." |
| hint: Home is the chord the loop keeps landing back on — the one that makes the progression feel finished, not left unfinished. | La base es el acorde donde el loop siempre vuelve a caer — el que hace que la progresión se sienta terminada, no inconclusa. |
| response prompt: Watchtower loops Am–G–F. Which chord feels like home? | Watchtower repite Am–G–F. ¿Cuál acorde se siente como base? |
| response explain: The loop keeps landing back on Am — its home. Call the song A minor (C major's relative family). | El loop siempre vuelve a caer en Am — su base. Llama a la canción A menor (la familia relativa de C mayor). |
| response choices: G / F / Am / None | G / F / Am / Ninguno |

**Station B — Listen for I–IV–V**

| English | Spanish |
|---|---|
| text: Listen for it: count up the A major scale to find its I, IV, and V chords before checking your answer. | Escucha con atención: cuenta hacia arriba en la escala de A mayor para encontrar sus acordes I, IV y V antes de revisar tu respuesta. |
| hint: I–IV–V is the foundation progression behind blues, rock, and a lot of cumbia — worth having on instant recall in any key. | I–IV–V es la progresión fundamental detrás del blues, el rock y buena parte de la cumbia — vale la pena tenerla lista al instante en cualquier tonalidad. |
| response prompt: I–IV–V in the key of A is: | El I–IV–V en la tonalidad de A es: |
| response explain: Count up the A major scale: A(I), D(IV), E(V) — the foundation of blues, rock, and cumbia alike. | Cuenta hacia arriba en la escala de A mayor: A(I), D(IV), E(V) — la base tanto del blues como del rock y la cumbia. |
| response choices: A–D–E / A–C–D / A–E–F#m / A–B–C | A–D–E / A–C–D / A–E–F#m / A–B–C |

**Station B — Try numbering a real progression**

| English | Spanish |
|---|---|
| text: Now try it: number "the cure"'s chords — Am–C–Dm–F–G/B — in the key of C before checking. | Ahora pruébalo: numera los acordes de "the cure" — Am–C–Dm–F–G/B — en la tonalidad de C antes de revisar. |
| hint: Ignore the slash for a moment and number the chord names first — the bass note is a separate question. | Ignora la barra diagonal por un momento y numera primero los nombres de los acordes — la nota de bajo es una pregunta aparte. |
| response prompt: "the cure" uses Am–C–Dm–F–G/B. In the key of C, Am–C–Dm–F is: | "the cure" usa Am–C–Dm–F–G/B. En la tonalidad de C, Am–C–Dm–F es: |
| response explain: Am=vi, C=I, Dm=ii, F=IV — and the G/B is the V chord with a B as its lowest note, so the bass walks smoothly back to C. | Am=vi, C=I, Dm=ii, F=IV — y el G/B es el acorde V con una B como su nota más grave, así que el bajo camina suavemente de vuelta a C. |
| response choices: vi–I–ii–IV / I–V–vi–IV / ii–IV–vi–I / vi–IV–I–V | vi–I–ii–IV / I–V–vi–IV / ii–IV–vi–I / vi–IV–I–V |
| text: Try it fast: given only a chord list (no song name), find the single family that contains every chord before you do anything else. | Pruébalo rápido: dada solo una lista de acordes (sin nombre de canción), encuentra la única familia que contiene todos los acordes antes de hacer cualquier otra cosa. |
| hint: Inventory first, family second, home-chord-by-ear last — in that order, every time. | Primero el inventario, después la familia, y al final el acorde base por oído — en ese orden, siempre. |
| response prompt: The fastest first move to find a song's key from a chord chart is: | El primer paso más rápido para encontrar la tonalidad de una canción a partir de una tabla de acordes es: |
| response explain: Inventory → family → then let your ear pick the home chord (major key or its relative minor). | Inventario → familia → y luego deja que tu oído elija el acorde base (la tonalidad mayor o su relativa menor). |
| response choices: Count the chords / See which single family contains ALL the chords / Find the loudest chord / Check the tempo | Contar los acordes / Ver cuál única familia contiene TODOS los acordes / Encontrar el acorde más fuerte / Revisar el tempo |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — describe the "home chord" feeling in your own words. | Cierre de la estación — describe con tus propias palabras la sensación del "acorde base." |
| response placeholder: e.g. like the last word of a sentence — the loop can finally stop there | p. ej. como la última palabra de una oración — el loop finalmente puede detenerse ahí |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Chord-inventory detective drill**

| English | Spanish |
|---|---|
| text: Challenge 1 — Inventory Drill (a drill is a short exercise you repeat to build a skill): four mystery chord sets on cards — G-C-D-Em, C-F-G-Am, D-G-A-Bm, Am-F-G-C — name each key before flipping the card. (Answers: G, C, D, C/Am.) | Reto 1 — Ejercicio de inventario (un ejercicio es una práctica corta que repites para desarrollar una destreza): cuatro conjuntos misteriosos de acordes en tarjetas — G-C-D-Em, C-F-G-Am, D-G-A-Bm, Am-F-G-C — nombra cada tonalidad antes de voltear la tarjeta. (Respuestas: G, C, D, C/Am.) |
| hint: Find the single family that contains ALL the chords on the card — that's the key, before your ear even weighs in. | Encuentra la única familia que contiene TODOS los acordes de la tarjeta — esa es la tonalidad, incluso antes de que tu oído opine. |
| stuck: Cross off keys one at a time — if even one chord doesn't belong to a family, that key is out. | Descarta tonalidades una a la vez — si aunque sea un acorde no pertenece a una familia, esa tonalidad queda descartada. |
| levelUp: Time yourself — how fast can you call all four keys correctly in a row? | Cronométrate — ¿qué tan rápido puedes decir las cuatro tonalidades correctamente seguidas? |

**Station C — Play and feel for home**

| English | Spanish |
|---|---|
| text: Challenge 2 — Play and Feel: strum Am–G–F, stopping and holding each chord in turn, then say (or type below) which one feels most like "home." | Reto 2 — Toca y siente: rasguea Am–G–F, deteniéndote y sosteniendo cada acorde por turno, y luego di (o escribe abajo) cuál se siente más como "base." |
| hint: Play the loop a few times through first — home only reveals itself once you can hear the whole shape of the progression. | Toca el loop unas cuantas veces primero — la base solo se revela una vez que puedes escuchar la forma completa de la progresión. |
| stuck: Play just Am, then G, then F in isolation and rate each one 1-10 for "does this feel finished." | Toca solo Am, luego G, luego F por separado y califica cada uno del 1 al 10 según "¿se siente terminado?" |
| levelUp: Try the same drill on a progression you haven't analyzed yet. | Prueba el mismo ejercicio con una progresión que no hayas analizado todavía. |
| response placeholder: e.g. Am — the loop only feels finished when it lands there | p. ej. Am — el loop solo se siente terminado cuando cae ahí |

**Station C — Decode a slash chord**

| English | Spanish |
|---|---|
| text: Challenge 3 — Slash Chord Walk: play C → G/B → Am as a smooth bass-line move — notice the bass note walks down one step at a time (C, B, A) while the chords change around it. | Reto 3 — Caminata de acorde con bajo alterno: toca C → G/B → Am como un movimiento suave de línea de bajo — fíjate cómo la nota de bajo baja un paso a la vez (C, B, A) mientras los acordes cambian alrededor. |
| hint: This is exactly what "the cure" does to glide from the G chord back home to C — the slash chord is the piece that links the two chords smoothly. | Esto es exactamente lo que hace "the cure" para deslizarse del acorde de G de vuelta a la base en C — el acorde con bajo alterno es la pieza que conecta los dos acordes suavemente. |
| stuck: Play C and Am first without the G/B in between, then add it back and listen for how much smoother the move feels. | Toca C y Am primero sin el G/B en medio, y luego agrégalo de vuelta y escucha cuánto más suave se siente el movimiento. |
| levelUp: Try the reverse walk, Am → G/B → C, or find another slash chord to decode. | Prueba la caminata al revés, Am → G/B → C, o encuentra otro acorde con bajo alterno para descifrar. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Watchtower, fully numbered: play the Am–G–F loop and label every chord's numeral in the key of C — vi–V–IV — before landing back on Am as the true minor-key home. You've got it when: one clean loop, numerals called correctly on every chord. | Reto — Watchtower, completamente numerado: toca el loop Am–G–F y etiqueta el número romano de cada acorde en la tonalidad de C — vi–V–IV — antes de aterrizar de vuelta en Am como la verdadera base en tonalidad menor. Lo tienes cuando: un loop limpio, con los números romanos dichos correctamente en cada acorde. |
| hint: Watchtower is C major's relative-minor family in action — same three chords you've played since Module 2, now fully numbered. | Watchtower es la familia relativa menor de C mayor en acción — los mismos tres acordes que has tocado desde el Módulo 2, ahora completamente numerados. |
| stuck: Number just Am and G first (vi and V), then add F (IV). | Numera primero solo Am y G (vi y V), y luego agrega F (IV). |
| levelUp: Explain out loud why Watchtower can be called "in C" or "in A minor" and both are correct. | Explica en voz alta por qué a Watchtower se le puede llamar "en C" o "en A menor" y ambas son correctas. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: A song uses D, G, A, and Bm — what key? And what does the B in G/B tell you to do with your bass note? | Una canción usa D, G, A y Bm — ¿qué tonalidad? ¿Y qué te dice la B en G/B que hagas con tu nota de bajo? |
| response placeholder: e.g. key of D; the B means B is the lowest note you play, even though it's still a G chord shape | p. ej. tonalidad de D; la B significa que B es la nota más grave que tocas, aunque siga siendo la forma del acorde de G |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| m11w2-s1 text: Identify a song's key from its chord inventory | Identificar la tonalidad de una canción a partir de su inventario de acordes |
| m11w2-s1 practice prompt: A song uses C, F, G, and Am. Its key: | Una canción usa C, F, G y Am. Su tonalidad: |
| m11w2-s1 practice choices: F major / C major / A major / G major | F mayor / C mayor / A mayor / G mayor |
| m11w2-s2 text: Recognize I–IV–V and I–V–vi–IV progressions by their numerals | Reconocer las progresiones I–IV–V y I–V–vi–IV por sus números romanos |
| m11w2-s2 practice prompt: I–V–vi–IV in the key of G is: | I–V–vi–IV en la tonalidad de G es: |
| m11w2-s2 practice choices: G–D–Em–C / G–C–D–Em / G–Am–B–C / G–Em–C–D | G–D–Em–C / G–C–D–Em / G–Am–B–C / G–Em–C–D |
| m11w2-s3 text: Number "the cure"'s progression in the key of C | Numerar la progresión de "the cure" en la tonalidad de C |
| m11w2-s4 text: Find Watchtower's key from Am–G–F and say why Am is home | Encontrar la tonalidad de Watchtower a partir de Am–G–F y decir por qué Am es la base |
| m11w2-s5 text: Explain what a slash chord tells you (chord / bass note) | Explicar qué te dice un acorde con bajo alterno (acorde / nota de bajo) |
| m11w2-s5 practice prompt: In Am/E, your lowest sounding note should be: | En Am/E, tu nota más grave debería ser: |
| m11w2-s5 practice choices: A / C / E / G | A / C / E / G |
| m11w2-s6 text: Given any three chords, name their key and each chord's numeral | Dados tres acordes cualesquiera, nombrar su tonalidad y el número romano de cada acorde |

### Set 3

| English | Spanish |
|---|---|
| unit: Module 11 · Chords, Keys & Harmony | Módulo 11 · Acordes, Tonalidades y Armonía |
| subtitle: One shape, twelve chords · Root names the chord · Play I–IV–V anywhere | Una forma, doce acordes · La raíz nombra el acorde · Toca I–IV–V en cualquier lugar |
| skillFocus: E-shape root on the low E · A-shape root on the A string · Your Module 9 fretboard knowledge names every barre | Raíz de la forma de E en la Mi grave · Raíz de la forma de A en la cuerda La · Tu conocimiento del diapasón del Módulo 9 nombra cada cejilla |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for the A-shape root | Escucha la raíz de la forma de A |
| Section title: Try naming a barre from its root | Prueba a nombrar una cejilla a partir de su raíz |
| Section title: Station Wrap-Up | Cierre de la estación |
| Section title: The 12-bar blues — the form your I–IV–V was waiting for | El blues de 12 compases — la forma que tu I–IV–V estaba esperando |
| Station C title: Practice station — barre chords as harmony tools | Estación de práctica — acordes con cejilla como herramientas de armonía |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Root-naming drill | Ejercicio de nombrar raíces |
| Section title: Build I–IV–V in a named key | Construye I–IV–V en una tonalidad nombrada |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Play the 12-bar blues | Toca el blues de 12 compases |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: Basic Barré Chords #1 — the E shape (CH-006) – JustinGuitar. As you watch, find the low-E-string fret for each root he names. | Mira: Basic Barré Chords #1 — the E shape (CH-006) – JustinGuitar. Mientras miras, encuentra el traste en la cuerda Mi grave para cada raíz que él nombra. |
| hint: The low-E root names an E-shape barre chord — Module 9's fretboard knowledge pays off here. | La raíz en la Mi grave nombra un acorde con cejilla en forma de E — el conocimiento del diapasón del Módulo 9 rinde frutos aquí. |
| response prompt: The E-shape barre chord takes its NAME from: | El acorde con cejilla en forma de E toma su NOMBRE de: |
| response explain: The low-E root names it — barre fret 3 and the low E says G, so it's G major. Module 9 pays off. | La raíz en la Mi grave lo nombra — cejilla en el traste 3 y la Mi grave da G, así que es G mayor. El Módulo 9 rinde frutos. |
| response choices: The fret your pinky is on / The note under your barre on the low E string / The key of the song / The A string | El traste donde está tu meñique / La nota debajo de tu cejilla en la cuerda Mi grave / La tonalidad de la canción / La cuerda La |
| text: Watch: A Shape Major Barre Chords on Guitar (my best tricks and exercises) – JustinGuitar. Notice the root now lives on the A string, not the low E. | Mira: A Shape Major Barre Chords on Guitar (my best tricks and exercises) – JustinGuitar. Fíjate que ahora la raíz vive en la cuerda La, no en la Mi grave. |
| hint: Same idea as the E-shape, different string — the A-shape root is always on the A string. | Misma idea que la forma de E, distinta cuerda — la raíz de la forma de A siempre está en la cuerda La. |
| response prompt: The A-shape barre chord takes its NAME from: | El acorde con cejilla en forma de A toma su NOMBRE de: |
| response explain: The note under your barre on the A string names it — same trick as the E shape, just one string over. | La nota debajo de tu cejilla en la cuerda La lo nombra — el mismo truco que la forma de E, solo una cuerda más allá. |
| response choices: The note under your barre on the A string / The note under your barre on the low E string / The fret your pinky is on / The key of the song | La nota debajo de tu cejilla en la cuerda La / La nota debajo de tu cejilla en la cuerda Mi grave / El traste donde está tu meñique / La tonalidad de la canción |

**Station B — Listen for the A-shape root**

| English | Spanish |
|---|---|
| text: Listen for it: play an A-shape barre at fret 5 and name its root before checking — remember the root lives on the A string this time, not the low E. | Escucha con atención: toca una cejilla en forma de A en el traste 5 y nombra su raíz antes de revisar — recuerda que esta vez la raíz vive en la cuerda La, no en la Mi grave. |
| hint: Count up the A string from open: A-A#-B-C-C#-D. Fret 5 lands on D. | Cuenta hacia arriba en la cuerda La desde el aire: A-A#-B-C-C#-D. El traste 5 cae en D. |
| response prompt: An A-shape barre at fret 5 is: | Una cejilla en forma de A en el traste 5 es: |
| response explain: A-shape roots live on the A STRING — fret 5 there is D. | Las raíces de la forma de A viven en la CUERDA LA — el traste 5 ahí es D. |
| response choices: A major / C major / D major / E major | A mayor / C mayor / D mayor / E mayor |

**Station B — Try naming a barre from its root**

| English | Spanish |
|---|---|
| text: Now try it: find B major using the A-shape barre — count up the A string until you hit B before you fret anything. | Ahora pruébalo: encuentra B mayor usando la cejilla en forma de A — cuenta hacia arriba en la cuerda La hasta llegar a B antes de trastear nada. |
| hint: A string: A(0)-A#(1)-B(2). B is only two frets up. | Cuerda La: A(0)-A#(1)-B(2). B está a solo dos trastes de distancia. |
| response prompt: To play B major with the A shape, barre at fret: | Para tocar B mayor con la forma de A, pon la cejilla en el traste: |
| response explain: A string, fret 2 = B. | Cuerda La, traste 2 = B. |
| response choices: 1 / 2 / 4 / 7 | 1 / 2 / 4 / 7 |
| text: Try it on paper: list all 12 chromatic notes and, for each, name the fret where an E-shape barre would land on that root. | Pruébalo en papel: enumera las 12 notas cromáticas y, para cada una, nombra el traste donde caería una cejilla en forma de E sobre esa raíz. |
| hint: One shape, twelve chords — the ONLY thing that changes is which fret you barre. | Una forma, doce acordes — lo ÚNICO que cambia es en cuál traste pones la cejilla. |
| response prompt: One movable shape gives you twelve different chords because: | Una forma movible te da doce acordes distintos porque: |
| response explain: Slide the shape, and the root fret renames it — one grip, the whole chromatic set. | Desliza la forma, y el traste de la raíz la renombra — un solo agarre, todo el conjunto cromático. |
| response choices: You can barre at each of the 12 frets before the octave repeats / Guitars have 12 strings / You use 12 fingers / It doesn't — each shape is one chord | Puedes poner la cejilla en cada uno de los 12 trastes antes de que se repita la octava / Las guitarras tienen 12 cuerdas / Usas 12 dedos / No lo hace — cada forma es un solo acorde |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — open shapes or barre shapes: which would you pick for Let It Be, and why? (Don't stop — the 12-bar blues section is below!) | Cierre de la estación — formas abiertas o formas con cejilla: ¿cuál elegirías para Let It Be, y por qué? (¡No pares — la sección de blues de 12 compases está abajo!) |
| response placeholder: e.g. open — it rings better; but the barre F is better than the mini-F once my hand is warm | p. ej. abierta — suena mejor; pero la F con cejilla es mejor que la mini-F una vez que mi mano está caliente |

**Station B — The 12-bar blues — the form your I–IV–V was waiting for**

| English | Spanish |
|---|---|
| text: Watch: How To Play Old School 12 Bar Blues Guitar No.1 EASY Beginners - Chords Key E – EricBlackmonGuitar (0:00–4:41). The 12-bar blues is I–IV–V — the exact chords you've been building this set — used to build the most-played song form in American music. Watch for two things: the ORDER the chords arrive in, and the long-short "shuffle" bounce in the strumming hand. | Mira: How To Play Old School 12 Bar Blues Guitar No.1 EASY Beginners - Chords Key E – EricBlackmonGuitar (0:00–4:41). El blues de 12 compases es I–IV–V — los mismos acordes que has estado construyendo en esta unidad — usado para armar la forma de canción más tocada en la música estadounidense. Fíjate en dos cosas: el ORDEN en que llegan los acordes, y el rebote largo-corto de "shuffle" en la mano que rasguea. |
| hint: Thousands of songs are this one form. Learn it once and you can jam (play along freely and make up your own part) with people you've just met for the rest of your life. | Miles de canciones usan esta única forma. Apréndela una vez y podrás improvisar (jam: tocar libremente junto con otros e inventar tu propia parte) con gente que acabas de conocer por el resto de tu vida. |
| text: Check yourself on the form's ingredients before you play it at the practice station. | Ponte a prueba con los ingredientes de la forma antes de tocarla en la estación de práctica. |
| response prompt: A standard 12-bar blues in A uses which three chords? | Un blues de 12 compases estándar en A usa cuáles tres acordes: |
| response explain: It's the I, IV, and V of A — each with a bluesy 7th added. You already know I–IV–V from this set; the blues just gives it a form. | Es el I, IV y V de A — cada uno con una 7ª bluesera agregada. Ya conoces el I–IV–V de esta unidad; el blues solo le da una forma. |
| response choices: A7, D7, E7 / A, Bm, C# / A7, C7, G7 / Am, Dm, Em | A7, D7, E7 / A, Bm, C# / A7, C7, G7 / Am, Dm, Em |
| text: One more — the feel is half the style. | Una más — la sensación es la mitad del estilo. |
| response prompt: "Shuffle feel" means the eighth notes are played: | La "sensación de shuffle" significa que las corcheas se tocan: |
| response explain: Swing the pair — DAH-da DAH-da. Even eighths make it rock; long-short makes it blues. | Balancea el par — DAH-da DAH-da. Las corcheas parejas lo hacen sonar a rock; largo-corto lo hace sonar a blues. |
| response choices: Perfectly even / Long-short, like a heartbeat / As fast as possible / Only on downbeats | Perfectamente parejas / Largo-corto, como un latido / Lo más rápido posible / Solo en los tiempos fuertes |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Root-naming drill**

| English | Spanish |
|---|---|
| text: First, warm the hand up — run a quick Finger Gym stretch (The Finger Gym – JustinGuitar) before today's barre-heavy work. Then, Challenge 1 — Root-Naming Drill: write a handful of chord names on slips, draw one, and find BOTH barre locations for it — the E-shape fret on the low E string AND the A-shape fret on the A string. | Primero, calienta la mano — haz un estiramiento rápido de Gimnasio de Dedos (The Finger Gym – JustinGuitar) antes del trabajo intenso de cejillas de hoy. Luego, Reto 1 — Ejercicio de nombrar raíces: escribe un puñado de nombres de acordes en papelitos, saca uno, y encuentra AMBAS ubicaciones de cejilla para ese acorde — el traste de la forma de E en la cuerda Mi grave Y el traste de la forma de A en la cuerda La. |
| hint: Every chord has (at least) two barre homes — one for each shape. Module 9's fretboard naming is the whole trick here. | Cada acorde tiene (al menos) dos hogares de cejilla — uno por cada forma. El nombrado del diapasón del Módulo 9 es todo el truco aquí. |
| stuck: Find the E-shape location first, get comfortable, then add the A-shape hunt. | Encuentra primero la ubicación de la forma de E, ponte cómodo, y luego agrega la búsqueda de la forma de A. |
| levelUp: Time yourself finding both locations and try to beat your best time (race a partner if one's around), or add a third barre location further up the neck. | Cronométrate encontrando ambas ubicaciones e intenta superar tu mejor tiempo (compite con alguien si hay alguien cerca), o agrega una tercera ubicación de cejilla más arriba en el mástil. |

**Station C — Build I–IV–V in a named key**

| English | Spanish |
|---|---|
| text: Challenge 2 — I–IV–V Builder: play I–IV–V in G (G open or fret-3 barre · C · D), then in A, then a key you draw at random from your chord slips. You've got it when: clean changes in time at 60 BPM, using at least one barre shape. | Reto 2 — Constructor de I–IV–V: toca I–IV–V en G (G abierto o cejilla en el traste 3 · C · D), luego en A, y luego una tonalidad que saques al azar de tus papelitos de acordes. Lo tienes cuando: cambios limpios y a tiempo a 60 BPM, usando al menos una forma con cejilla. |
| hint: Once you know I–IV–V's shape in one key, moving the whole progression to a new key is just sliding your hands. | Una vez que conoces la forma del I–IV–V en una tonalidad, mover toda la progresión a una tonalidad nueva es solo deslizar tus manos. |
| stuck: Stay in G until the changes are automatic, then move the whole progression up together. | Quédate en G hasta que los cambios sean automáticos, y luego mueve toda la progresión hacia arriba junta. |
| levelUp: Play I–IV–V in a key using barre shapes only — no open chords at all. | Toca I–IV–V en una tonalidad usando solo formas con cejilla — sin ningún acorde abierto. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Oye Mi Amor, full barre: play the verse's Bm–G with a full A-shape barre Bm — the song's last beginner shortcut, gone for good. You've got it when: four laps (a lap = one full time through) where the full Bm rings as clean as the G. | Reto — Oye Mi Amor, cejilla completa: toca el Bm–G de la estrofa con una cejilla completa en forma de A para Bm — el último atajo de principiante de la canción, desaparecido para siempre. Lo tienes cuando: cuatro vueltas (una vuelta = un recorrido completo) donde el Bm completo suena tan limpio como el G. |
| hint: This is Module 7's payoff, finally put to use as a harmony tool instead of just a shape to survive. | Esta es la recompensa del Módulo 7, finalmente usada como herramienta de armonía en lugar de solo una forma para sobrevivir. |
| stuck: Warm up the A-shape Bm alone for a minute before adding the G change. | Calienta el Bm en forma de A solo durante un minuto antes de agregar el cambio a G. |
| levelUp: Explain out loud why Bm is the vi chord of D major — check the inventory: both Bm and G live in D's family — using what you learned in Set 1. | Explica en voz alta por qué Bm es el acorde vi de D mayor — revisa el inventario: tanto Bm como G viven en la familia de D — usando lo que aprendiste en la Unidad 1. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Where are the two places to play C major as a barre — and which shape is friendlier to your hand today? (Don't stop — the 12-bar blues section is below!) | ¿Cuáles son los dos lugares para tocar C mayor como cejilla — y cuál forma es más amigable para tu mano hoy? (¡No pares — la sección de blues de 12 compases está abajo!) |
| response placeholder: e.g. E-shape fret 8 or A-shape fret 3 — the A-shape one is easier for me right now | p. ej. forma de E en el traste 8 o forma de A en el traste 3 — la de forma de A es más fácil para mí ahora mismo |

**Station C — Play the 12-bar blues**

| English | Spanish |
|---|---|
| text: Meet the three chords: A7, D7, E7 — your I, IV, and V in A, each with the bluesy 7th built in. Fret each one clean, then strum each for a bar with a long-short shuffle feel at 60 BPM. | Conoce los tres acordes: A7, D7, E7 — tu I, IV y V en A, cada uno con la 7ª bluesera incorporada. Trastea cada uno limpio, y luego rasguea cada uno durante un compás con una sensación de shuffle largo-corto a 60 BPM. |
| hint: All three are open-position shapes — no barre needed. The shuffle lives in your strumming wrist: DAH-da DAH-da. | Los tres son formas en posición abierta — no se necesita cejilla. El shuffle vive en tu muñeca que rasguea: DAH-da DAH-da. |
| text: The 12-bar map in A: A7 A7 A7 A7 \| D7 D7 A7 A7 \| E7 D7 A7 E7. Say each chord name OUT LOUD on beat 1 as you strum the bar — losing the form is the most common blues mistake, and counting bars aloud is the fix. Quick-change variant: swap D7 into bar 2 instead of staying on A7 — the "quick change" hands your ear the IV chord early, and it's the version you'll hear in most modern blues. | El mapa de 12 compases en A: A7 A7 A7 A7 \| D7 D7 A7 A7 \| E7 D7 A7 E7. Di el nombre de cada acorde EN VOZ ALTA en el tiempo 1 mientras rasgueas el compás — perder la forma es el error más común del blues, y contar los compases en voz alta es la solución. Variante de cambio rápido: cambia a D7 en el compás 2 en lugar de quedarte en A7 — el "cambio rápido" le entrega a tu oído el acorde IV antes de tiempo, y es la versión que escucharás en la mayoría del blues moderno. |
| hint: That last E7 in bar 12 is the "turnaround" — it pulls the music back to bar 1 so the form can loop forever. | Ese último E7 en el compás 12 es el "giro" — jala la música de vuelta al compás 1 para que la forma pueda repetirse para siempre. |
| text: Put it together: comp the full 12 bars from memory — comping = playing the backing chords while someone else solos — with shuffle feel at 60 BPM, then record a pass, loop your recording, and solo over your own comping with A minor pentatonic (your Module 4 box at fret 5). You've got it when: a full chorus of each job (one chorus = one full trip through the 12 bars) — comping without losing the form, soloing without losing the changes. Playing with someone? One comps while the other solos, then swap. | Júntalo todo: acompaña los 12 compases completos de memoria — acompañar = tocar los acordes de base mientras alguien más hace un solo — con sensación de shuffle a 60 BPM, y luego graba una pasada, repite tu grabación en loop, y haz un solo sobre tu propio acompañamiento con la pentatónica menor de A (tu caja del Módulo 4 en el traste 5). Lo tienes cuando: una ronda completa de cada trabajo (una ronda = un recorrido completo por los 12 compases) — acompañar sin perder la forma, hacer un solo sin perder los cambios. ¿Tocando con alguien? Uno acompaña mientras el otro hace el solo, y luego cambian. |
| hint: When the loop comes back to A7, land on an A — hearing that "home" arrival is the most important thing. | Cuando el loop vuelve a A7, aterriza en una A — escuchar esa llegada a "casa" es lo más importante. |

**Set 3 — Skills**

| English | Spanish |
|---|---|
| m11w3-s1 text: Play the E-shape major barre and name its root from the low-E fret | Tocar la cejilla mayor en forma de E y nombrar su raíz a partir del traste en la Mi grave |
| m11w3-s1 practice prompt: E-shape barre, fret 8: | Cejilla en forma de E, traste 8: |
| m11w3-s1 practice choices: C major / G major / A major / B major | C mayor / G mayor / A mayor / B mayor |
| m11w3-s2 text: Play the A-shape major barre and name its root from the A-string fret | Tocar la cejilla mayor en forma de A y nombrar su raíz a partir del traste en la cuerda La |
| m11w3-s2 practice prompt: A-shape barre, fret 7: | Cejilla en forma de A, traste 7: |
| m11w3-s2 practice choices: D major / E major / F major / G major | D mayor / E mayor / F mayor / G mayor |
| m11w3-s3 text: Play a I–IV–V in a randomly drawn key using barre and/or open shapes | Tocar un I–IV–V en una tonalidad sacada al azar usando formas con cejilla y/o abiertas |
| m11w3-s4 text: Move one barre shape to three different named roots | Mover una forma con cejilla a tres raíces distintas nombradas |
| m11w3-s5 text: Explain why one movable shape equals twelve chords | Explicar por qué una forma movible equivale a doce acordes |
| m11w3-s5 practice prompt: To turn an E-shape G (fret 3) into an E-shape A, move: | Para convertir un G en forma de E (traste 3) en un A en forma de E, mueve: |
| m11w3-s5 practice choices: Up 2 frets / Down 2 frets / Up 1 string / Nowhere — re-finger it | 2 trastes hacia arriba / 2 trastes hacia abajo / 1 cuerda hacia arriba / A ningún lado — cambia los dedos |
| m11w3-s6 text: Choose open vs barre voicing for a progression and say why | Elegir un acorde abierto o uno con cejilla para una progresión y explicar por qué |
| m11w3-s7 text: Comp a 12-bar blues in A with shuffle feel (A7–D7–E7) | Acompañar un blues de 12 compases en A con sensación de shuffle (A7–D7–E7) |
| m11w3-s7 gotItWhen: you can play all 12 bars from memory at 60 BPM with a long-short shuffle strum, without losing your place in the form. | puedes tocar los 12 compases completos de memoria a 60 BPM con un rasgueo shuffle largo-corto, sin perder tu lugar en la forma. |
| m11w3-s8 text: Explain and play the quick-change and the turnaround | Explicar y tocar el cambio rápido y el giro |
| m11w3-s8 gotItWhen: you can say what bar 2 does in a quick-change blues and land the E7 turnaround in bar 12 without stopping. | puedes decir qué hace el compás 2 en un blues de cambio rápido y aterrizar el giro de E7 en el compás 12 sin detenerte. |

### Module-level Songs

MODULE_SONGS[11] meta fields (song title shown for reference, not itself translated on the site).

| English | Spanish |
|---|---|
| "Let It Be" — The Beatles — meta: C–G–Am–F = I–V–vi–IV, the famous four | C–G–Am–F = I–V–vi–IV, los famosos cuatro |
| "Luna" — Peso Pluma, Junior H — meta: F–Am = I–iii in F — proof it's not always the famous four | F–Am = I–iii en F — prueba de que no siempre son los famosos cuatro |
| "the cure" — Olivia Rodrigo — meta: Number the progression in C | Numera la progresión en C |
| "All Along the Watchtower" — Dylan / Hendrix — meta: Find the key from Am–G–F | Encuentra la tonalidad a partir de Am–G–F |
| "Oye Mi Amor" — Maná — meta: Bm and barre practice with numerals | Práctica de Bm y cejilla con números romanos |
| "House of the Rising Sun" — The Animals — meta: Number an A-minor-family progression | Numera una progresión de la familia de A menor |

### Module Review

| English | Spanish |
|---|---|
| module: Chords, Keys & Harmony | Acordes, Tonalidades y Armonía |
| skill mr11-s1: I can build a triad (root–3rd–5th) from any major scale | Puedo construir una tríada (raíz–3ª–5ª) a partir de cualquier escala mayor |
| skill mr11-s2: I can label a chord progression with Roman numerals, including Luna's F–Am vamp as I–iii | Puedo etiquetar una progresión de acordes con números romanos, incluyendo el vamp F–Am de Luna como I–iii |
| skill mr11-s3: I can figure out a song's key from the chords it uses | Puedo averiguar la tonalidad de una canción a partir de los acordes que usa |
| skill mr11-s4: I can read a slash chord (like G/B) and know which note goes on the bottom | Puedo leer un acorde con bajo alterno (como G/B) y saber qué nota va abajo |
| skill mr11-s5: I can name a barre chord's root from either the E-shape or A-shape fret | Puedo nombrar la raíz de un acorde con cejilla a partir del traste en forma de E o de A |
| skill mr11-s6: I can play a I–IV–V progression in a randomly drawn key using open or barre shapes | Puedo tocar una progresión I–IV–V en una tonalidad sacada al azar usando formas abiertas o con cejilla |
| assessItem: Analyze a thread song's progression in Roman numerals and name its key | Analiza la progresión de una canción principal en números romanos y nombra su tonalidad |
| assessItem: Play a I–IV–V progression in a key you draw at random — open or barre shapes | Toca una progresión I–IV–V en una tonalidad que saques al azar — formas abiertas o con cejilla |
| assessItem: Comp a 12-bar blues in A with shuffle feel, then solo over a recording of your own comping — with another player, comp while they solo and trade | Acompaña un blues de 12 compases en A con sensación de shuffle, y luego haz un solo sobre una grabación de tu propio acompañamiento — con otro músico, acompaña mientras el otro hace el solo y luego cambien |
| forward: You can name what every chord is DOING now, and one barre grip just became twelve chords. <strong>Module 12 is the fun final stretch — you'll use everything you've learned:</strong> we study fingerstyle in detail — alternating thumb, waltz patterns, and the requinto sound — everything you need to pick your showcase song. | Ahora puedes nombrar qué está HACIENDO cada acorde, y un solo agarre de cejilla se acaba de convertir en doce acordes. <strong>El Módulo 12 es el divertido tramo final — vas a usar todo lo que has aprendido:</strong> estudiamos el fingerstyle a fondo — pulgar alternante, patrones de vals y el sonido de requinto — todo lo que necesitas para elegir tu canción para la muestra. |

## Module 12 — Fingerstyle: Travis, Waltz & Requinto

### Set 1

| English | Spanish |
|---|---|
| unit: Module 12 · Fingerstyle: Travis, Waltz & Requinto | Módulo 12 · Fingerstyle: Travis, Vals y Requinto |
| subtitle: The thumb becomes a drummer · Pinch on the downbeat · Fills between | El pulgar se convierte en baterista · Pellizco en el tiempo fuerte · Rellenos entre medio |
| skillFocus: Thumb alternates two bass strings in quarter notes · Pinch = thumb + finger together · The thumb NEVER stops | El pulgar alterna entre dos cuerdas graves en negras · Pellizco = pulgar + dedo juntos · El pulgar NUNCA se detiene |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for the alternating bass | Escucha el bajo alternante |
| Section title: Try the alternating thumb | Prueba el pulgar alternante |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — alternating thumb & the pinch | Estación de práctica — pulgar alternante y el pellizco |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Alternate the thumb between two bass strings | Alterna el pulgar entre dos cuerdas graves |
| Section title: Add the pinch | Agrega el pellizco |
| Section title: Add finger fills | Agrega rellenos de dedos |
| Section title: Keep the pattern through a chord change | Mantén el patrón a través de un cambio de acorde |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Play-along — one full pass, no stopping | Toca junto al video — una pasada completa, sin detenerte |
| Section title: Reactivate p-i-m-a — the claw (from Module 8) | Reactiva p-i-m-a — la garra (del Módulo 8) |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: How To Travis Pick on Guitar - The ULTIMATE Fingerpicking Pattern – Lauren Bateman (0:00–9:00). | Mira: How To Travis Pick on Guitar - The ULTIMATE Fingerpicking Pattern – Lauren Bateman (0:00–9:00). |
| hint: In Travis-style picking, the thumb keeps everything moving — steady quarter notes on two bass strings while the fingers decorate on top. | En el picking estilo Travis, el pulgar mantiene todo en movimiento — negras constantes en dos cuerdas graves mientras los dedos decoran encima. |
| response prompt: In Travis-style picking, the thumb's job is to: | En el picking estilo Travis, el trabajo del pulgar es: |
| response explain: The thumb keeps everything moving — steady quarter notes on two bass strings while the fingers decorate on top. | El pulgar mantiene todo en movimiento — negras constantes en dos cuerdas graves mientras los dedos decoran encima. |
| response choices: Play melody / Alternate steadily between two bass strings like a drummer / Strum / Rest | Tocar la melodía / Alternar constantemente entre dos cuerdas graves como un baterista / Rasguear / Descansar |
| text: Watch: A Total Beginners Guide To Travis Picking – Andy Guitar — a second teacher on the same pattern as the first video. Notice what Andy does differently from Justin: how he counts the thumb, and when he lets the pinch in. | Mira: A Total Beginners Guide To Travis Picking – Andy Guitar — un segundo maestro con el mismo patrón que el primer video. Fíjate en qué hace Andy diferente a Justin: cómo cuenta el pulgar, y cuándo deja entrar el pellizco. |
| hint: A pinch is bass and treble sounding at the same instant — the accent that makes Travis picking recognizable. | Un pellizco es el bajo y el agudo sonando en el mismo instante — el acento que hace reconocible al Travis picking. |
| response prompt: A "pinch" is: | Un "pellizco" es: |
| response explain: Bass and treble sound at the same instant — the accent that makes Travis picking recognizable. | El bajo y el agudo suenan en el mismo instante — el acento que hace reconocible al Travis picking. |
| response choices: Two fingers on one string / Thumb and a finger plucking together on the beat / Muting the strings / A very quiet note | Dos dedos en una cuerda / El pulgar y un dedo pulsando juntos en el tiempo / Silenciar las cuerdas / Una nota muy suave |

**Station B — Listen for the alternating bass**

| English | Spanish |
|---|---|
| text: On a C chord, the alternating thumb usually bounces between two bass strings. Listen for it in a Travis-picked recording of your choice. | En un acorde de C, el pulgar alternante suele rebotar entre dos cuerdas graves. Escúchalo en una grabación tocada con Travis picking de tu elección. |
| hint: The root (A string) and a neighbor — the C chord's bass lives on string 5, so the thumb anchors there. | La raíz (cuerda La) y una vecina — el bajo del acorde C vive en la cuerda 5, así que el pulgar se ancla ahí. |
| response prompt: On a C chord, the alternating thumb usually bounces between: | En un acorde de C, el pulgar alternante suele rebotar entre: |
| response explain: The root (A string) and a neighbor — the C chord's bass lives on string 5, so the thumb anchors there. | La raíz (cuerda La) y una vecina — el bajo del acorde C vive en la cuerda 5, así que el pulgar se ancla ahí. |
| response choices: Strings 6 and 5 / Strings 5 and 4 (or 5 and 3) / Strings 2 and 1 / Any two strings at random | Las cuerdas 6 y 5 / Las cuerdas 5 y 4 (o 5 y 3) / Las cuerdas 2 y 1 / Cualquier par de cuerdas al azar |

**Station B — Try the alternating thumb**

| English | Spanish |
|---|---|
| text: Now try it: alternate your thumb between strings 5 and 4 over a C chord, 8 bars, no finger notes yet. | Ahora pruébalo: alterna tu pulgar entre las cuerdas 5 y 4 sobre un acorde de C, 8 compases, todavía sin notas de dedos. |
| hint: Rule one of Travis: the thumb never stops. Fingers can rejoin on the next beat. | Regla número uno del Travis picking: el pulgar nunca se detiene. Los dedos pueden reincorporarse en el siguiente tiempo. |
| response prompt: If your fingers get lost mid-pattern, what must keep going no matter what? | Si tus dedos se pierden a mitad del patrón, ¿qué debe seguir sin importar qué? |
| response explain: Rule one of Travis: the thumb never stops. Fingers can rejoin on the next beat. | Regla número uno del Travis picking: el pulgar nunca se detiene. Los dedos pueden reincorporarse en el siguiente tiempo. |
| response choices: The melody / The thumb bass / The metronome app / Your foot | La melodía / El bajo del pulgar / La app del metrónomo / Tu pie |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: what tempo could you hold the alternating thumb today without it stumbling? | Cierre de la estación — pausa y piensa: ¿a qué tempo pudiste mantener el pulgar alternante hoy sin que tropezara? |
| response placeholder: e.g. solid at 60 BPM; at 70 my thumb followed my fingers and fell apart | p. ej. firme a 60 BPM; a 70 mi pulgar siguió a mis dedos y se desarmó |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Fingerpicking exposes every note — an out-of-tune string is easy to hear. | El fingerpicking expone cada nota — una cuerda desafinada se escucha fácilmente. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Alternate the thumb between two bass strings**

| English | Spanish |
|---|---|
| text: Challenge 1 — Thumb Only: alternate strings 5↔4 in quarter notes, 60 BPM, 8 bars, zero finger notes. You've got it when: a steady, even alternating thumb with no wobble. | Reto 1 — Solo el pulgar: alterna las cuerdas 5↔4 en negras, 60 BPM, 8 compases, cero notas de dedos. Lo tienes cuando: un pulgar alternante constante y parejo, sin tambalearse. |
| hint: Compared to Module 8's p-i-m-a-m-i arpeggio, the thumb ALTERNATES between bass strings instead of staying put — that bounce is the whole style. | Comparado con el arpegio p-i-m-a-m-i del Módulo 8, el pulgar ALTERNA entre cuerdas graves en lugar de quedarse quieto — ese rebote es todo el estilo. |
| stuck: Drop to half tempo and count "1-2-3-4" aloud, landing the thumb exactly on each number. | Baja a la mitad del tempo y cuenta "1-2-3-4" en voz alta, haciendo caer el pulgar exactamente en cada número. |
| levelUp: Add a chord change Am↔C every 4 bars without the thumb missing a beat. | Agrega un cambio de acorde Am↔C cada 4 compases sin que el pulgar se pierda ni un tiempo. |
| playSeq label: Thumb alternation on C — strings 5 & 4 | Alternancia del pulgar en C — cuerdas 5 y 4 |

**Station C — Add the pinch**

| English | Spanish |
|---|---|
| text: Challenge 2 — The Pinch: pinch (thumb string 5 + m on string 2) on beat 1, thumb alone beats 2–4. You've got it when: both notes of the pinch sound together as one, perfectly in sync. | Reto 2 — El pellizco: pellizca (pulgar en la cuerda 5 + m en la cuerda 2) en el tiempo 1, pulgar solo en los tiempos 2–4. Lo tienes cuando: ambas notas del pellizco suenan juntas como una sola, perfectamente sincronizadas. |
| hint: A pinch is the bridge between arpeggios and Travis picking — thumb and finger move toward each other and meet. | Un pellizco es el puente entre los arpegios y el Travis picking — el pulgar y el dedo se mueven uno hacia el otro y se encuentran. |
| stuck: Pluck the bass and the treble separately first, slowly, then bring them closer until they land together. | Pulsa el bajo y el agudo por separado primero, despacio, y luego acércalos hasta que caigan juntos. |
| levelUp: Add a second pinch on beat 3, or hold the thumb alternation through an Am↔C change. | Agrega un segundo pellizco en el tiempo 3, o mantén la alternancia del pulgar a través de un cambio Am↔C. |

**Station C — Add finger fills**

| English | Spanish |
|---|---|
| text: Challenge 3 — Fills (a fill is a short extra run of notes between the main parts): keep the thumb going, add i on the "and" of beat 2. You've got it when: the fill lands cleanly between two thumb strokes without slowing the thumb down. | Reto 3 — Rellenos (un relleno es una pequeña serie extra de notas entre las partes principales): mantén el pulgar en marcha, agrega i en el "y" del tiempo 2. Lo tienes cuando: el relleno cae limpio entre dos golpes del pulgar sin frenarlo. |
| hint: Fingers decorate ON TOP of a thumb that's already keeping a steady groove (a groove is the steady rhythmic feel) — the thumb's rhythm never bends to fit the fingers. | Los dedos decoran ENCIMA de un pulgar que ya mantiene un groove constante (un groove es la sensación rítmica estable) — el ritmo del pulgar nunca se dobla para ajustarse a los dedos. |
| stuck: Isolate just the thumb + one fill note, looping it until it's automatic before adding more. | Aísla solo el pulgar + una nota de relleno, repitiéndolo hasta que sea automático antes de agregar más. |
| levelUp: Add a second fill on the "and" of beat 4. | Agrega un segundo relleno en el "y" del tiempo 4. |

**Station C — Keep the pattern through a chord change**

| English | Spanish |
|---|---|
| text: Challenge 4 — Am↔C: play the alternating thumb + pinch pattern through an Am↔C change. You've got it when: the pattern survives the change with the thumb never stopping. | Reto 4 — Am↔C: toca el patrón de pulgar alternante + pellizco a través de un cambio Am↔C. Lo tienes cuando: el patrón sobrevive el cambio sin que el pulgar se detenga nunca. |
| hint: Anticipate the change — start moving your fretting hand on the last note of the bar so beat 1 always lands ready. | Anticipa el cambio — empieza a mover tu mano de trastear en la última nota del compás para que el tiempo 1 siempre caiga listo. |
| stuck: Strum Am then C once each to check both chords ring clean, then loop just the thumb through the change before adding the pinch back. | Rasguea Am y luego C una vez cada uno para revisar que ambos acordes suenen limpios, y luego repite solo el pulgar a través del cambio antes de agregar el pellizco de nuevo. |
| levelUp: Run Am → C → Am → C for 8 bars without a single broken beat. | Corre Am → C → Am → C durante 8 compases sin un solo tiempo roto. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — House of the Rising Sun, bass + roll in 6/8: play the verse with a bass note on the downbeat (the first, strongest beat of the bar) and your fingers rolling up through each chord, following the progression. You've got it when: the verse survives every chord change with the roll staying smooth. | Reto — House of the Rising Sun, bajo + floreo en 6/8: toca la estrofa con una nota grave en el tiempo fuerte (el primer tiempo, el más fuerte del compás) y tus dedos haciendo un floreo ascendente a través de cada acorde, siguiendo la progresión. Lo tienes cuando: la estrofa sobrevive cada cambio de acorde con el floreo manteniéndose suave. |
| hint: House of the Rising Sun is in 6/8 — felt in two (you tap two main beats per bar), the same waltz-family feel you met in Module 5. The thumb plays the bass on the downbeat; the fingers roll up through the chord between beats. | House of the Rising Sun está en 6/8 — se siente en dos (marcas dos tiempos principales por compás), la misma sensación de la familia del vals que conociste en el Módulo 5. El pulgar toca el bajo en el tiempo fuerte; los dedos hacen un floreo ascendente a través del acorde entre los tiempos. |
| stuck: Loop just the first two chords of the verse until the pattern is rock solid before adding the rest. | Repite solo los dos primeros acordes de la estrofa hasta que el patrón sea firme como una roca antes de agregar el resto. |
| levelUp: Play the whole verse from memory, no chord chart. | Toca la estrofa completa de memoria, sin diagrama de acordes. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: What tempo could you hold the alternating thumb today without it stumbling? Write it below — that's your warm-up target next time. | ¿A qué tempo pudiste mantener el pulgar alternante hoy sin que tropezara? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez. |
| response placeholder: e.g. solid at 60 BPM; at 70 my thumb followed my fingers and fell apart | p. ej. firme a 60 BPM; a 70 mi pulgar siguió a mis dedos y se desarmó |

**Station C — Play-along — one full pass, no stopping**

| English | Spanish |
|---|---|
| text: Play-along: open Station B's Travis pattern lesson video (the Practice Playalong section, 8:59–11:16), set YouTube's speed to 0.75×, and pick along for the ENTIRE demo section without stopping. You've got it when: you finish a full pass with the video — dropped pinches and all, don't stop. | Toca junto al video: abre Station B's Travis pattern lesson video (la sección Practice Playalong, 8:59–11:16), pon la velocidad de YouTube en 0.75×, y toca junto a la TOTALIDAD de la sección de demostración sin detenerte. Lo tienes cuando: terminas una pasada completa con el video — con pellizcos fallados y todo, no te detengas. |
| hint: Not stopping is the skill. If the thumb stumbles, let the fills go and keep the bass walking until you're back in. | No detenerte es la destreza. Si el pulgar tropieza, deja ir los rellenos y mantén el bajo caminando hasta que vuelvas a estar dentro. |

**Station C — Reactivate p-i-m-a — the claw (from Module 8)**

| English | Spanish |
|---|---|
| text: Challenge — Claw Check (a 60-second reactivation of Module 8, not a re-teach): plant all four picking fingers at once — thumb (p) resting on the bass strings 6/5/4, index (i) on the G string, middle (m) on the B string, ring (a) on the high e. Then pluck p–i–m–a on the open strings, twice through at 60 BPM. You've got it when: each finger plays in order, one string each, with no two fingers grabbing the same string. This is the picking hand you built back in Module 8 — warm it up any time it feels out of practice, including right now before your next run. | Reto — Revisión de la garra (una reactivación de 60 segundos del Módulo 8, no una nueva enseñanza): planta los cuatro dedos de pulsar a la vez — pulgar (p) apoyado en las cuerdas graves 6/5/4, índice (i) en la cuerda G, medio (m) en la cuerda B, anular (a) en la mi aguda. Luego pulsa p–i–m–a en las cuerdas al aire, dos veces seguidas a 60 BPM. Lo tienes cuando: cada dedo toca en orden, una cuerda cada uno, sin que dos dedos agarren la misma cuerda. Esta es la mano de pulsar que construiste allá en el Módulo 8 — caliéntala cuando sea que se sienta oxidada, incluso ahora mismo antes de tu próxima corrida. |
| hint: p owns the three bass strings (6/5/4); i-G, m-B, a-high-e never trade places. Set the assignment once and your hand stops hunting for strings. | p es dueño de las tres cuerdas graves (6/5/4); i-G, m-B, a-mi aguda nunca intercambian lugares. Fija la asignación una vez y tu mano deja de buscar cuerdas a tientas. |
| stuck: Plant all four fingers silently first and feel each one touching its string, then pluck slowly — p, then i, then m, then a — before you add the metronome. | Planta los cuatro dedos en silencio primero y siente cada uno tocando su cuerda, y luego pulsa despacio — p, luego i, luego m, luego a — antes de agregar el metrónomo. |
| levelUp: Run the staircase up and back down (p-i-m-a-m-i) without looking at your picking hand. | Corre la escalera subiendo y bajando (p-i-m-a-m-i) sin mirar tu mano de pulsar. |
| playSeq label: p-i-m-a on open strings — A, G, B, e (twice through) | p-i-m-a en cuerdas al aire — La, G, B, e (dos veces seguidas) |
| text: Challenge — 4-Note Arpeggio, Am then C: play a p–i–m–a arpeggio on each chord — one thumb bass, then i-m-a rolling up the top three strings — 2 bars of Am, then 2 bars of C, and loop. On Am the thumb takes the open A string; on C it slides to the 3rd-fret C on that same string. You've got it when: every note is the same volume and the a-finger (the high e) doesn't rush ahead of the beat. | Reto — Arpegio de 4 notas, Am y luego C: toca un arpegio p–i–m–a en cada acorde — un bajo del pulgar, y luego i-m-a en un floreo ascendente por las tres cuerdas superiores — 2 compases de Am, y luego 2 compases de C, y repite. En Am el pulgar toma la cuerda La al aire; en C se desliza al C del traste 3 de esa misma cuerda. Lo tienes cuando: cada nota tiene el mismo volumen y el dedo a (la mi aguda) no se adelanta al tiempo. |
| hint: This is the four-even-notes drill (a drill is a short exercise you repeat to build a skill) Module 8 built the whole pattern on — the a-finger is the one most likely to play too early, so keep it as calm as the thumb. | Este es el ejercicio de cuatro notas parejas (un ejercicio es una rutina corta que repites para desarrollar una destreza) sobre el que el Módulo 8 construyó todo el patrón — el dedo a es el que más probablemente toque demasiado temprano, así que mantenlo tan calmado como el pulgar. |
| stuck: Loop just Am until the four notes are dead even, then add C — the only thing that changes between the chords is where the thumb lands. | Repite solo Am hasta que las cuatro notas estén perfectamente parejas, y luego agrega C — lo único que cambia entre los acordes es dónde cae el pulgar. |
| levelUp: Fold the same p-i-m-a shape into this set's Travis pattern — and, when you reach Set 2, into the 3/4 waltz pattern too — keeping every note even. | Incorpora la misma forma p-i-m-a en el patrón Travis de esta unidad — y, cuando llegues a la Unidad 2, también en el patrón de vals en 3/4 — manteniendo cada nota pareja. |
| playSeq label: Hear one p-i-m-a lap on Am, then C — loop it 2 bars each | Escucha una vuelta p-i-m-a en Am, y luego en C — repítelo 2 compases cada uno |

**Set 1 — Skills**

| English | Spanish |
|---|---|
| m12w1-s1 text: Alternate the thumb between two bass strings in steady quarter notes | Alternar el pulgar entre dos cuerdas graves en negras constantes |
| m12w1-s1 practice label: Thumb alternation on C — strings 5 & 4 | Alternancia del pulgar en C — cuerdas 5 y 4 |
| m12w1-s2 text: Play a pinch (thumb + finger together) on the downbeat | Tocar un pellizco (pulgar + dedo juntos) en el tiempo fuerte |
| m12w1-s2 practice prompt: A pinch means the bass and treble notes sound: | Un pellizco significa que las notas graves y agudas suenan: |
| m12w1-s2 practice choices: One after the other / At exactly the same time / Only on beat 3 / Muted | Una después de la otra / Exactamente al mismo tiempo / Solo en el tiempo 3 / Silenciadas |
| m12w1-s3 text: Add i-m finger fills while the thumb keeps alternating | Agregar rellenos de i-m mientras el pulgar sigue alternando |
| m12w1-s4 text: Play a Travis-feel pattern over C at 60 BPM for 8 bars | Tocar un patrón con sensación Travis sobre C a 60 BPM durante 8 compases |
| m12w1-s5 text: Keep the alternating pattern unbroken through an Am–C change | Mantener el patrón alternante sin interrupciones a través de un cambio Am–C |
| m12w1-s6 text: Play a bass-note + roll verse of House of the Rising Sun (thumb bass, then fingers rolling up through the chord) | Tocar una estrofa de nota grave + floreo de House of the Rising Sun (bajo del pulgar, y luego dedos en floreo ascendente a través del acorde) |
| m12w1-s6 gotItWhen: the verse survives every chord change with the roll staying smooth and the thumb never stopping. | la estrofa sobrevive cada cambio de acorde con el floreo manteniéndose suave y el pulgar sin detenerse nunca. |

### Set 2

| English | Spanish |
|---|---|
| unit: Module 12 · Fingerstyle: Travis, Waltz & Requinto | Módulo 12 · Fingerstyle: Travis, Vals y Requinto |
| subtitle: Picking in 3 · "the cure" finally at home · Your pattern, your song | Punteo en 3 · "the cure" por fin en su lugar · Tu patrón, tu canción |
| skillFocus: The 3/4 pattern: bass–pluck–pluck · Feeling 3 vs 4 · "Native style" — why the ◐ disappears | El patrón en 3/4: bajo–pulsación–pulsación · Sentir el 3 frente al 4 · "Estilo nativo" — por qué desaparece el ◐ |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for the waltz feel | Escucha la sensación de vals |
| Section title: Try "the cure" fingerstyle — its native style | Prueba "the cure" con fingerstyle — su estilo nativo |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — the waltz pattern & native-style songs | Estación de práctica — el patrón de vals y las canciones en su estilo nativo |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Count and pick a 3/4 pattern | Cuenta y puntea un patrón en 3/4 |
| Section title: Fingerpick "the cure" in its native style | Toca "the cure" con fingerpicking en su estilo nativo |
| Section title: Fingerpick Let It Be with your own pattern | Toca Let It Be con fingerpicking usando tu propio patrón |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Station Wrap-Up | Cierre de la estación |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: Fingerpicking for Beginners - Pluck Patterns and Walkdowns – Lauren Bateman (0:00–5:55) (the pinch/pattern half — she calls the pinch "the pluck"). | Mira: Fingerpicking for Beginners - Pluck Patterns and Walkdowns – Lauren Bateman (0:00–5:55) (la mitad sobre el pellizco/patrón — ella llama al pellizco "the pluck"). |
| hint: In 3/4 time, each bar has 3 beats — count ONE-two-three, ONE-two-three. Your bass note owns beat one. | En el compás de 3/4, cada compás tiene 3 tiempos — cuenta UNO-dos-tres, UNO-dos-tres. Tu nota grave es dueña del tiempo uno. |
| response prompt: In 3/4 time, each bar has: | En el compás de 3/4, cada compás tiene: |
| response explain: Count ONE-two-three, ONE-two-three — the waltz. Your bass note owns beat one. | Cuenta UNO-dos-tres, UNO-dos-tres — el vals. Tu nota grave es dueña del tiempo uno. |
| response choices: 4 beats / 3 beats / 2 beats / 6 beats | 4 tiempos / 3 tiempos / 2 tiempos / 6 tiempos |
| text: Watch: Fingerpicking Pattern for 3/4 or 6/8 Time – MrPoloniaMusic. Notice the bass note always lands on beat 1, with the fingers answering after. | Mira: Fingerpicking Pattern for 3/4 or 6/8 Time – MrPoloniaMusic. Fíjate que la nota grave siempre cae en el tiempo 1, con los dedos respondiendo después. |
| hint: The simplest 3/4 picking pattern: thumb states the bar on beat 1, fingers answer on 2 and 3. | El patrón de punteo en 3/4 más simple: el pulgar anuncia el compás en el tiempo 1, los dedos responden en el 2 y el 3. |
| response prompt: The simplest 3/4 picking pattern is: | El patrón de punteo en 3/4 más simple es: |
| response explain: Thumb states the bar on beat 1; fingers answer on 2 and 3. | El pulgar anuncia el compás en el tiempo 1; los dedos responden en el 2 y el 3. |
| response choices: pluck–pluck–bass / bass–pluck–pluck / bass–bass–bass / pinch–pinch–pinch | pulsación–pulsación–bajo / bajo–pulsación–pulsación / bajo–bajo–bajo / pellizco–pellizco–pellizco |

**Station B — Listen for the waltz feel**

| English | Spanish |
|---|---|
| text: Happy Birthday is a waltz — count along to any recording and you'll feel it swing ONE-two-three, ONE-two-three. Today you'll pick it in 3 instead of strumming it. | Happy Birthday es un vals — cuenta junto a cualquier grabación y sentirás cómo se mece UNO-dos-tres, UNO-dos-tres. Hoy lo puntearás en 3 en lugar de rasguearlo. |
| hint: A waltz counts ONE-two-three, ONE-two-three — three beats per bar, with the bass note owning beat one. | Un vals se cuenta UNO-dos-tres, UNO-dos-tres — tres tiempos por compás, con la nota grave dueña del tiempo uno. |
| response prompt: A waltz (3/4 time) has how many beats per bar? | ¿Un vals (compás de 3/4) tiene cuántos tiempos por compás? |
| response explain: Three — ONE-two-three, ONE-two-three. Happy Birthday is a classic waltz, and now you'll pick it in 3. | Tres — UNO-dos-tres, UNO-dos-tres. Happy Birthday es un vals clásico, y ahora lo puntearás en 3. |
| response choices: 4 beats / 3 beats / 2 beats / 6 beats | 4 tiempos / 3 tiempos / 2 tiempos / 6 tiempos |

**Station B — Try "the cure" fingerstyle — its native style**

| English | Spanish |
|---|---|
| text: Playing "the cure" fingerstyle removes its ◐ flag — fingerpicking IS the song's native style, not "against the grain" (playing a song in a style that fights its natural feel) like power-chording a gentle ballad. Try picking through Am–C–Dm–F, one bar each. | Tocar "the cure" con fingerstyle le quita su marca ◐ — el fingerpicking ES el estilo nativo de la canción, no "a contrapelo" (tocar una canción en un estilo que pelea contra su sensación natural) como tocar una balada suave con acordes de potencia. Prueba a puntear a través de Am–C–Dm–F, un compás cada uno. |
| hint: The ◐ flag marked renderings that fought a song's nature. Fingerpicked, "the cure" is finally itself. | La marca ◐ señalaba versiones que peleaban contra la naturaleza de una canción. Con fingerpicking, "the cure" por fin es ella misma. |
| response prompt: Playing "the cure" fingerstyle removes its ◐ flag because: | Tocar "the cure" con fingerstyle le quita su marca ◐ porque: |
| response explain: Fingerpicking IS the song's native style — no more "against the grain." | El fingerpicking ES el estilo nativo de la canción — ya no está más "a contrapelo". |
| response choices: It's easier / Fingerpicking IS the song's native style — no more "against the grain" / It uses fewer chords / The flag was a mistake | Es más fácil / El fingerpicking ES el estilo nativo de la canción — ya no está "a contrapelo" / Usa menos acordes / La marca fue un error |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: which felt more natural — picking in 4 or in 3? What does the waltz feel do to the song? | Cierre de la estación — pausa y piensa: ¿qué se sintió más natural — puntear en 4 o en 3? ¿Qué le hace la sensación de vals a la canción? |
| response placeholder: e.g. 3 kept surprising me — but it makes Happy Birthday float instead of march | p. ej. el 3 me seguía sorprendiendo — pero hace que Happy Birthday flote en lugar de marchar |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Fingerpicking exposes every note — an out-of-tune string is easy to hear. | El fingerpicking expone cada nota — una cuerda desafinada se escucha fácilmente. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Count and pick a 3/4 pattern**

| English | Spanish |
|---|---|
| text: Challenge 1 — Count-and-Pick: play the 3/4 pattern (bass–pluck–pluck) on one chord, counting aloud, 60 BPM. You've got it when: a steady 3-count with the bass landing exactly on beat 1 every bar. | Reto 1 — Cuenta y puntea: toca el patrón en 3/4 (bajo–pulsación–pulsación) sobre un acorde, contando en voz alta, 60 BPM. Lo tienes cuando: un conteo de 3 constante con el bajo cayendo exactamente en el tiempo 1 de cada compás. |
| hint: Beat 1 is the strongest — land the bass note exactly on it every bar, and the two plucks fall into place after. | El tiempo 1 es el más fuerte — haz caer la nota grave exactamente ahí en cada compás, y las dos pulsaciones caen en su lugar después. |
| stuck: Drop the counting and just feel "long-short-short" for bass-pluck-pluck. | Deja el conteo y solo siente "largo-corto-corto" para bajo-pulsación-pulsación. |
| levelUp: Count silently in your head instead of aloud, or add a pinch on beat 1. | Cuenta en silencio en tu cabeza en lugar de en voz alta, o agrega un pellizco en el tiempo 1. |
| playSeq label: 3/4 pattern on C — bass, then G string, then C on the B string | Patrón en 3/4 sobre C — bajo, y luego la cuerda G, y luego C en la cuerda B |

**Station C — Fingerpick "the cure" in its native style**

| English | Spanish |
|---|---|
| text: Challenge 2 — "the cure" Native Style: fingerpick Am–C–Dm–F, one bar each, pattern of your choice. You've got it when: the ◐ is gone — this IS how the song wants to be played. | Reto 2 — "the cure" en su estilo nativo: toca con fingerpicking Am–C–Dm–F, un compás cada uno, con el patrón que elijas. Lo tienes cuando: el ◐ desaparece — así ES como la canción quiere que se toque. |
| hint: Native style — why the ◐ disappears: fingerpicking is this song's home texture, not a workaround. Keep it unbroken through each change by moving your fretting hand early — on the bar's last note. | Estilo nativo — por qué desaparece el ◐: el fingerpicking es la textura natural de esta canción, no una solución alternativa. Mantenlo sin interrupciones a través de cada cambio moviendo tu mano de trastear temprano — en la última nota del compás. |
| stuck: Loop just Am–C until the pattern survives that one change before adding Dm–F. | Repite solo Am–C hasta que el patrón sobreviva ese cambio antes de agregar Dm–F. |
| levelUp: Add a pinch on beat 1 of each chord. | Agrega un pellizco en el tiempo 1 de cada acorde. |

**Station C — Fingerpick Let It Be with your own pattern**

| English | Spanish |
|---|---|
| text: Challenge 3 — Let It Be: arpeggiate C–G–Am–F, your chosen pattern, working toward 70 BPM. You've got it when: one full lap (a lap = one full time through) with the pattern unbroken through all four chords. | Reto 3 — Let It Be: arpegia C–G–Am–F con el patrón que elegiste, trabajando hacia 70 BPM. Lo tienes cuando: una vuelta completa (una vuelta = un recorrido completo) con el patrón sin interrupciones a través de los cuatro acordes. |
| hint: You already fingerpicked this verse in Module 8 — now push the tempo and choice of pattern further. | Ya tocaste esta estrofa con fingerpicking en el Módulo 8 — ahora empuja más el tempo y la elección del patrón. |
| stuck: Drop to 50 BPM and loop just C–G until it's automatic. | Baja a 50 BPM y repite solo C–G hasta que sea automático. |
| levelUp: Reach 70 BPM clean, or add a pinch on beat 1 of each chord. | Alcanza 70 BPM limpio, o agrega un pellizco en el tiempo 1 de cada acorde. |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Happy Birthday in 3, fingerstyle: play the melody's chords with the 3/4 bass–pluck–pluck pattern all the way through. You've got it when: the waltz feel never breaks, start to finish. | Reto — Happy Birthday en 3, con fingerstyle: toca los acordes de la melodía con el patrón en 3/4 bajo–pulsación–pulsación de principio a fin. Lo tienes cuando: la sensación de vals nunca se rompe, de principio a fin. |
| hint: Happy Birthday is a waltz — count ONE-two-three, ONE-two-three and let the bass land on beat 1 of each bar. | Happy Birthday es un vals — cuenta UNO-dos-tres, UNO-dos-tres y deja que el bajo caiga en el tiempo 1 de cada compás. |
| stuck: Play just the chord changes with the pattern first, humming the melody instead of picking it out. | Toca solo los cambios de acorde con el patrón primero, tarareando la melodía en lugar de puntearla. |
| levelUp: Sing along while you pick it. | Canta mientras la punteas. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Which felt more natural — picking in 4 or in 3? What does the waltz feel do to the song? Write it below. | ¿Qué se sintió más natural — puntear en 4 o en 3? ¿Qué le hace la sensación de vals a la canción? Escríbelo abajo. |
| response placeholder: e.g. 3 kept surprising me — but it makes Happy Birthday float instead of march | p. ej. el 3 me seguía sorprendiendo — pero hace que Happy Birthday flote en lugar de marchar |

**Set 2 — Skills**

| English | Spanish |
|---|---|
| m12w2-s1 text: Play a 3/4 fingerpicking pattern (bass–pluck–pluck) in time | Tocar un patrón de fingerpicking en 3/4 (bajo–pulsación–pulsación) en tiempo |
| m12w2-s1 practice label: 3/4 pattern on C | Patrón en 3/4 sobre C |
| m12w2-s2 text: Count and feel the difference between 3/4 and 4/4 while picking | Contar y sentir la diferencia entre 3/4 y 4/4 mientras punteas |
| m12w2-s2 practice prompt: A waltz pattern repeats every: | Un patrón de vals se repite cada: |
| m12w2-s2 practice choices: 2 beats / 3 beats / 4 beats / 8 beats | 2 tiempos / 3 tiempos / 4 tiempos / 8 tiempos |
| m12w2-s3 text: Fingerpick "the cure"'s shapes — its native style | Tocar con fingerpicking las formas de "the cure" — su estilo nativo |
| m12w2-s4 text: Fingerpick Let It Be's C–G–Am–F with a pattern of my choice | Tocar con fingerpicking el C–G–Am–F de Let It Be con un patrón de mi elección |
| m12w2-s5 text: Keep my pattern unbroken through a 4-chord progression at 70 BPM | Mantener mi patrón sin interrupciones a través de una progresión de 4 acordes a 70 BPM |
| m12w2-s6 text: Play Happy Birthday's waltz feel fingerstyle | Tocar la sensación de vals de Happy Birthday con fingerstyle |

### Set 3

| English | Spanish |
|---|---|
| unit: Module 12 · Fingerstyle: Travis, Waltz & Requinto | Módulo 12 · Fingerstyle: Travis, Vals y Requinto |
| subtitle: Melody on top, thumb below · Luna's intro for real · Choose your showcase voice | Melodía arriba, pulgar abajo · La intro de Luna de verdad · Elige tu voz de presentación |
| skillFocus: The requinto role in sierreño · Melody notes ride ABOVE the thumb bass · Pick the pattern you'll perform with | El papel del requinto en el sierreño · Las notas de la melodía viajan ENCIMA del bajo del pulgar · Elige el patrón con el que vas a interpretar |
| Station B title: Computer station — Watch · Listen · Practice | Estación de computadora — Mira · Escucha · Practica |
| Section title: Watch the lesson videos | Mira los videos de la lección |
| Section title: Listen for melody riding on top of a steady thumb | Escucha la melodía viajando encima de un pulgar constante |
| Section title: Try melody-on-top over C | Prueba melodía arriba sobre C |
| Section title: Station Wrap-Up | Cierre de la estación |
| Station C title: Practice station — requinto texture & your showcase pattern | Estación de práctica — la textura del requinto y tu patrón de presentación |
| Section title: Warm-up — tuning check (Module 1) | Calentamiento — revisión de afinación (Módulo 1) |
| Section title: Play Luna's fingerpicked intro | Toca la intro de Luna con fingerpicking |
| Section title: Play Tu Boda's requinto intro line | Toca la línea de requinto de la intro de Tu Boda |
| Section title: Blend melody over a steady thumb | Combina melodía sobre un pulgar constante |
| Section title: Choose your showcase pattern | Elige tu patrón de presentación |
| Section title: Take It to a Song | Llévalo a una canción |
| Section title: Station Wrap-Up | Cierre de la estación |

**Station B — Watch the lesson videos**

| English | Spanish |
|---|---|
| text: Watch: La Derrota (Vicente Fernández) — requinto lesson, part 1 (English) – Jorge Aguilera — a real requinto line from the ranchera tradition that sierreño (a Mexican acoustic-guitar style) grew out of, taught in English. Watch how his picking hand carries the melody a singer would otherwise have, then listen for the same job in Luna and Tu Boda from this module's song list. | Mira: La Derrota (Vicente Fernández) — requinto lesson, part 1 (English) – Jorge Aguilera — una línea de requinto real de la tradición ranchera de la que surgió el sierreño (un estilo de guitarra acústica mexicano), enseñada en inglés. Observa cómo su mano de pulsar lleva la melodía que de otro modo tendría un cantante, y luego escucha ese mismo papel en Luna y Tu Boda de la lista de canciones de este módulo. |
| hint: Requinto sings the melodic lines you've been hearing in Luna and Tu Boda since the course's first listening drills. | El requinto canta las líneas melódicas que has estado escuchando en Luna y Tu Boda desde los primeros ejercicios de escucha del curso. |
| response prompt: In a sierreño group, the requinto is: | En un grupo de sierreño, el requinto es: |
| response explain: Requinto sings the melodic lines you've been hearing in Luna and Tu Boda since the course's first listening drills. | El requinto canta las líneas melódicas que has estado escuchando en Luna y Tu Boda desde los primeros ejercicios de escucha del curso. |
| response choices: The bass / A smaller, higher-pitched guitar that carries the melody / The singer / A drum | El bajo / Una guitarra más pequeña y más aguda que lleva la melodía / El cantante / Un tambor |
| text: Watch: Luna's Song Journey — Layer 6, the fingerpicked intro. This on-site lesson shows the intro rolling through the little-F shape. | Mira: Luna's Song Journey — Layer 6, the fingerpicked intro. Esta lección del sitio muestra la intro en un floreo a través de la forma del little-F. |
| hint: Same little-F you learned in Module 5 — the intro arpeggiates it one note at a time. | El mismo little-F que aprendiste en el Módulo 5 — la intro lo arpegia una nota a la vez. |
| response prompt: Luna's fingerpicked intro rolls through which chord shape? | ¿La intro de Luna con fingerpicking hace un floreo a través de cuál forma de acorde? |
| response explain: Same little-F you learned in Module 5 — the intro arpeggiates it one note at a time (Journey Layer 6). | El mismo little-F que aprendiste en el Módulo 5 — la intro lo arpegia una nota a la vez (Journey, Layer 6). |
| response choices: Full barre F / The little F (xx3211) / Open C / Am | F con cejilla completa / El little F (xx3211) / C al aire / Am |

**Station B — Listen for melody riding on top of a steady thumb**

| English | Spanish |
|---|---|
| text: "Melody on top" in fingerstyle means the melody is played on the thin, high strings while the thumb keeps the bass going underneath — two jobs, one hand. Listen for it in Luna or Tu Boda. | "Melodía arriba" en fingerstyle significa que la melodía se toca en las cuerdas delgadas y agudas mientras el pulgar mantiene el bajo sonando debajo — dos trabajos, una mano. Escúchalo en Luna o en Tu Boda. |
| hint: Two jobs, one hand — the requinto texture in short. | Dos trabajos, una mano — la textura del requinto en pocas palabras. |
| response prompt: "Melody on top" in fingerstyle means: | "Melodía arriba" en fingerstyle significa: |
| response explain: The melody is played on the thin, high strings while the thumb keeps the bass going underneath. | La melodía se toca en las cuerdas delgadas y agudas mientras el pulgar mantiene el bajo sonando debajo. |
| response choices: Play only high notes / The melody is played on the thin, high strings while the thumb keeps the bass going underneath / The melody comes first, chords after / Sing while playing | Tocar solo notas agudas / La melodía se toca en las cuerdas delgadas y agudas mientras el pulgar mantiene el bajo sonando debajo / La melodía va primero, los acordes después / Cantar mientras tocas |

**Station B — Try melody-on-top over C**

| English | Spanish |
|---|---|
| text: Now try it: over a C chord, keep the thumb on steady quarters and pick a 3-note melody on strings 1–2 on top. | Ahora pruébalo: sobre un acorde de C, mantén el pulgar en negras constantes y puntea una melodía de 3 notas en las cuerdas 1–2 encima. |
| hint: Fingerpicking makes our regional-Mexican songs sound MORE authentic than power chords did — sierreño is an acoustic, fingerpicked tradition, and this is its real tone. | El fingerpicking hace que nuestras canciones de música regional mexicana suenen MÁS auténticas de lo que sonaban con acordes de potencia — el sierreño es una tradición acústica de fingerpicking, y este es su verdadero sonido. |
| response prompt: Why does fingerstyle make our regional-Mexican songs sound MORE authentic than power chords did? | ¿Por qué el fingerstyle hace que nuestras canciones de música regional mexicana suenen MÁS auténticas de lo que sonaban con acordes de potencia? |
| response explain: Sierreño is an acoustic, fingerpicked tradition — this is its real tone. | El sierreño es una tradición acústica de fingerpicking — este es su verdadero sonido. |
| response choices: It's louder / Sierreño is an acoustic, fingerpicked tradition — this is its real tone / It isn't / Distortion is illegal | Es más fuerte / El sierreño es una tradición acústica de fingerpicking — este es su verdadero sonido / No es así / La distorsión es ilegal |

**Station B — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Station Wrap-Up — pause and think: name your showcase song and pattern — and the one spot you'll drill this week. | Cierre de la estación — pausa y piensa: nombra tu canción y patrón de presentación — y el único punto que vas a practicar esta semana. |
| response placeholder: e.g. "the cure," 6-note pattern — the Dm-to-F change still stumbles | p. ej. "the cure," patrón de 6 notas — el cambio de Dm a F todavía tropieza |

**Station C — Warm-up — tuning check (Module 1)**

| English | Spanish |
|---|---|
| text: Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You've got it when: in tune before today's work. | Empieza cada sesión de práctica de la misma manera: afina las 6 cuerdas hasta que estén en verde (E A D G B e), y luego toca cada cuerda al aire. Lo tienes cuando: estás afinado antes del trabajo de hoy. |
| hint: Fingerpicking exposes every note — an out-of-tune string is easy to hear. | El fingerpicking expone cada nota — una cuerda desafinada se escucha fácilmente. |
| playSeq label: Hear all 6 strings in tune | Escucha las 6 cuerdas afinadas |

**Station C — Play Luna's fingerpicked intro**

| English | Spanish |
|---|---|
| text: Challenge 1 — Luna Intro: play the Layer 6 rolls from Luna's Song Journey page, slow then at tempo. You've got it when: all notes ring cleanly in order at performance tempo. | Reto 1 — Intro de Luna: toca los floreos de Layer 6 de Luna's Song Journey page, despacio y luego a tempo. Lo tienes cuando: todas las notas suenan limpias en orden al tempo de interpretación. |
| hint: This roll uses the little-F shape you already know from Module 5. | Este floreo usa la forma del little-F que ya conoces del Módulo 5. |
| stuck: Fret the little F shape, strum it once to hear the target chord, then break it apart one string at a time. | Trastea la forma del little F, rasguéala una vez para escuchar el acorde objetivo, y luego desármala una cuerda a la vez. |
| levelUp: Play it twice through without stopping, or add it as your showcase intro. | Tócala dos veces seguidas sin detenerte, o agrégala como tu intro de presentación. |

**Station C — Play Tu Boda's requinto intro line**

| English | Spanish |
|---|---|
| text: Challenge 2 — Tu Boda Requinto Line: play the song's requinto intro line fingerstyle, following the Tu Boda tutorial video in this module's Songs section at the bottom of the page. You've got it when: the line rings clean and in time. | Reto 2 — Línea de requinto de Tu Boda: toca con fingerstyle la línea de requinto de la intro de la canción, siguiendo el video tutorial de Tu Boda en la sección de Canciones de este módulo, al final de la página. Lo tienes cuando: la línea suena limpia y en tiempo. |
| hint: This is the real sierreño sound — a smaller, higher-pitched guitar carrying the melody. | Este es el sonido real del sierreño — una guitarra más pequeña y más aguda llevando la melodía. |
| stuck: Slow the line down to half tempo and isolate just the first 4 notes. | Baja la línea a la mitad del tempo y aísla solo las primeras 4 notas. |
| levelUp: Play it at full performance tempo. | Tócala al tempo completo de interpretación. |

**Station C — Blend melody over a steady thumb**

| English | Spanish |
|---|---|
| text: Challenge 3 — Melody on Top: over a C chord, keep the thumb going in steady quarters and pick a 3-note melody on strings 1–2 above it. You've got it when: the thumb never wavers while the melody rides on top. | Reto 3 — Melodía arriba: sobre un acorde de C, mantén el pulgar sonando en negras constantes y puntea una melodía de 3 notas en las cuerdas 1–2 encima. Lo tienes cuando: el pulgar nunca vacila mientras la melodía viaja arriba. |
| hint: Two jobs, one hand — the requinto texture in short. | Dos trabajos, una mano — la textura del requinto en pocas palabras. |
| stuck: Isolate the thumb alone first, then add just one melody note at a time. | Aísla solo el pulgar primero, y luego agrega una sola nota de melodía a la vez. |
| levelUp: Extend the melody to 6 notes without losing the thumb. | Extiende la melodía a 6 notas sin perder el pulgar. |

**Station C — Choose your showcase pattern**

| English | Spanish |
|---|---|
| text: Challenge 4 — Choose Your Pattern: run ALL patterns learned this course (6-note · Travis · pinch · 3/4) over one chord, then pick one and write it in the box below. You've got it when: you've named the pattern you'll perform with. | Reto 4 — Elige tu patrón: corre TODOS los patrones aprendidos en este curso (6 notas · Travis · pellizco · 3/4) sobre un acorde, y luego elige uno y escríbelo en el cuadro de abajo. Lo tienes cuando: has nombrado el patrón con el que vas a interpretar. |
| hint: The smartest choice is the one you can keep unbroken at performance tempo TODAY — not the hardest one. | La elección más inteligente es la que puedes mantener sin interrupciones al tempo de interpretación HOY — no la más difícil. |
| stuck: If none feel ready, default to the 6-note pattern from Module 8 — it's the most forgiving. | Si ninguno se siente listo, recurre por defecto al patrón de 6 notas del Módulo 8 — es el más indulgente. |
| levelUp: Practice your chosen pattern at 10 BPM above your current comfortable tempo. | Practica tu patrón elegido a 10 BPM por encima de tu tempo cómodo actual. |
| response placeholder: e.g. Travis with a pinch on beat 1 — steady at 65 BPM today | p. ej. Travis con un pellizco en el tiempo 1 — firme a 65 BPM hoy |

**Station C — Take It to a Song**

| English | Spanish |
|---|---|
| text: Challenge — Full-Verse Rehearsal (your assessment piece): play one complete fingerpicked verse of your showcase song, no stopping, mistakes recovered. You've got it when: you reach the last bar without stopping. | Reto — Ensayo de la estrofa completa (tu pieza de evaluación): toca una estrofa completa con fingerpicking de tu canción de presentación, sin detenerte, recuperándote de los errores. Lo tienes cuando: llegas al último compás sin detenerte. |
| hint: Performances reward reliability, not difficulty — pick the pattern that never breaks, then make it musical. | Las interpretaciones premian la confiabilidad, no la dificultad — elige el patrón que nunca se rompe, y luego hazlo musical. |
| stuck: Slow the whole verse down until you can finish it clean, even at half speed. | Baja el tempo de toda la estrofa hasta que puedas terminarla limpia, aunque sea a la mitad de la velocidad. |
| levelUp: Record a performance take, or play it for someone at home. | Graba una toma de interpretación, o tócala para alguien en casa. |

**Station C — Station Wrap-Up**

| English | Spanish |
|---|---|
| text: Name your showcase song and pattern — and the one spot you'll drill this week. Write it below. | Nombra tu canción y patrón de presentación — y el único punto que vas a practicar esta semana. Escríbelo abajo. |
| response placeholder: e.g. "the cure," 6-note pattern — the Dm-to-F change still stumbles | p. ej. "the cure," patrón de 6 notas — el cambio de Dm a F todavía tropieza |

**Set 3 — Skills**

| English | Spanish |
|---|---|
| m12w3-s1 text: Play Luna's fingerpicked intro (Journey Layer 6) with p-i-m-a rolls | Tocar la intro de Luna con fingerpicking (Journey, Layer 6) con floreos p-i-m-a |
| m12w3-s2 text: Play Tu Boda's requinto intro line fingerstyle | Tocar la línea de requinto de la intro de Tu Boda con fingerstyle |
| m12w3-s3 text: Explain the requinto's role in sierreño / corridos tumbados (a modern Mexican regional style) | Explicar el papel del requinto en el sierreño / los corridos tumbados (un estilo regional mexicano moderno) |
| m12w3-s3 practice prompt: The requinto's job in the group is: | El trabajo del requinto en el grupo es: |
| m12w3-s3 practice choices: Rhythm chords / The melodic lead lines / Bass / Percussion | Acordes de ritmo / Las líneas melódicas principales / El bajo / La percusión |
| m12w3-s4 text: Blend melody notes into a picking pattern — tune on top, thumb bass below | Combinar notas de melodía en un patrón de punteo — melodía arriba, bajo del pulgar debajo |
| m12w3-s5 text: Choose and name the picking pattern I'll perform with | Elegir y nombrar el patrón de punteo con el que voy a interpretar |
| m12w3-s5 practice prompt: Your showcase pattern should be the one that: | Tu patrón de presentación debería ser el que: |
| m12w3-s5 practice choices: Impresses the most / Never breaks at performance tempo / Uses all four fingers / Is newest | Impresiona más / Nunca se rompe al tempo de interpretación / Usa los cuatro dedos / Es el más nuevo |
| m12w3-s6 text: Perform one full fingerpicked verse start to finish, recovering from any mistake | Interpretar una estrofa completa con fingerpicking de principio a fin, recuperándose de cualquier error |
| m12w3-s6 gotItWhen: you reach the last bar without stopping — slips allowed, stops not. | llegas al último compás sin detenerte — se permiten resbalones, no detenerse. |

### Module-level Songs

MODULE_SONGS[12] meta fields (song title shown for reference, not itself translated on the site).

| English | Spanish |
|---|---|
| "the cure" — Olivia Rodrigo — meta: Full fingerpicked verse — its native style, so the ◐ mark (our flag for a song played against its natural style) comes off | Estrofa completa con fingerpicking — su estilo nativo, así que la marca ◐ (nuestra señal para una canción tocada en contra de su estilo natural) desaparece |
| "Let It Be" — The Beatles — meta: Arpeggiated C–G–Am–F with your chosen pattern | C–G–Am–F arpegiado con el patrón que elijas |
| "Luna" — Peso Pluma, Junior H — meta: The fingerpicked intro — rolls through the little-F shape | La intro con fingerpicking — floreos a través de la forma del little-F |
| "House of the Rising Sun" — The Animals — meta: Bass note + rolling arpeggio in 6/8 — the fingerpicking classic | Nota grave + arpegio en floreo en 6/8 — el clásico del fingerpicking |
| "Tu Boda" — Oscar Maydon × Fuerza Regida — meta: Requinto intro line, fingerstyle — the real sierreño sound | Línea de requinto de la intro, con fingerstyle — el sonido real del sierreño |
| "Sailor Song" — Gigi Perez — meta: Fingerpicked verse, capo IV — pattern endurance | Estrofa con fingerpicking, capo en el traste 4 — resistencia del patrón |
| "Blackbird" — The Beatles — meta: The capstone challenge — pinches and moving shapes | El reto final del curso — pellizcos y formas en movimiento |
| "Just Like Heaven" — The Cure — meta: Turn the arpeggiated riff (short repeated phrase) into a picking pattern | Convierte el riff arpegiado (frase corta repetida) en un patrón de punteo |

### Module Review

| English | Spanish |
|---|---|
| module: Fingerstyle: Travis, Waltz & Requinto | Fingerstyle: Travis, Vals y Requinto |
| skill mr12-s1: I can hold a steady alternating thumb-bass in quarter notes for 8 bars without it stumbling | Puedo mantener un bajo del pulgar alternante y constante en negras durante 8 compases sin que tropiece |
| skill mr12-s2: I can play a clean pinch — thumb and finger landing together — right on the downbeat | Puedo tocar un pellizco limpio — pulgar y dedo cayendo juntos — justo en el tiempo fuerte |
| skill mr12-s3: I can pick a 3/4 waltz pattern (bass–pluck–pluck) in time, bass always landing on beat 1 | Puedo puntear un patrón de vals en 3/4 (bajo–pulsación–pulsación) en tiempo, con el bajo cayendo siempre en el tiempo 1 |
| skill mr12-s4: I can fingerpick "the cure" or Let It Be in its native style with the pattern unbroken | Puedo tocar "the cure" o Let It Be con fingerpicking en su estilo nativo con el patrón sin interrupciones |
| skill mr12-s5: I can blend a melody on top of a steady thumb bass — the requinto texture | Puedo combinar una melodía encima de un bajo de pulgar constante — la textura del requinto |
| skill mr12-s6: I can perform one full fingerpicked verse start to finish, recovering from any mistake without stopping | Puedo interpretar una estrofa completa con fingerpicking de principio a fin, recuperándome de cualquier error sin detenerme |
| assessItem: Play one full fingerpicked verse with a steady thumb bass and a clean, unbroken finger pattern — flagship options: "the cure" or Let It Be | Toca una estrofa completa con fingerpicking con un bajo de pulgar constante y un patrón de dedos limpio y sin interrupciones — opciones destacadas: "the cure" o Let It Be |
| assessItem: Show your chosen showcase pattern and name it | Muestra tu patrón de presentación elegido y nómbralo |
| forward: Twelve modules — the whole toolkit, twice as deep as most first-year players ever get. <strong>Now comes your capstone performance:</strong> pick your song, pick your lane — strummed, fingerpicked, or riff + solo — get it performance-ready, then record a full take or play it live for people you choose. This website got you here; the stage is yours. And after your capstone? Keep the list of songs you want to learn, and go learn them — you know how now. | Doce módulos — el kit de herramientas completo, el doble de profundo de lo que la mayoría de los guitarristas de primer año llegan a alcanzar. <strong>Ahora llega tu interpretación final:</strong> elige tu canción, elige tu camino — rasgueada, con fingerpicking, o riff + solo — déjala lista para interpretar, y luego graba una toma completa o tócala en vivo para las personas que elijas. Este sitio web te trajo hasta aquí; el escenario es tuyo. ¿Y después de tu interpretación final? Guarda la lista de canciones que quieres aprender, y ve a aprenderlas — ya sabes cómo. |
