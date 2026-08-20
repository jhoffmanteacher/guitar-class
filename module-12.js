// ============================================================
//  MODULE 12 — Fingerstyle: Travis, Waltz & Requinto
//  Edit this file to change Module 12 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm12w1',
    label: 'Set 1',
    locked: false,
    module: 'Fingerstyle: Travis, Waltz & Requinto',
    moduleNum: 12,
    unit: 'Module 12 · Fingerstyle: Travis, Waltz & Requinto',
    unit_es: 'Módulo 12 · Fingerstyle: Travis, vals y requinto',
    title: 'Set 1',
    subtitle: 'The thumb becomes a drummer · Pinch on the downbeat · Fills between',
    subtitle_es: 'El pulgar se convierte en baterista · Pellizco en el tiempo fuerte · Rellenos entre medio',
    skillFocus: 'Thumb alternates two bass strings in quarter notes · Pinch = thumb + finger together · The thumb NEVER stops',
    skillFocus_es: 'El pulgar alterna entre dos cuerdas graves en negras · Pellizco = pulgar + dedo juntos · El pulgar NUNCA se detiene',
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
                label: 'Watch: Travis picking basics (Lauren Bateman)', label_es: 'Mira: bases del Travis picking (Lauren Bateman)',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=JvtFd7vkea0" target="_blank">How To Travis Pick on Guitar - The ULTIMATE Fingerpicking Pattern – Lauren Bateman (0:00–9:00)</a>.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=JvtFd7vkea0" target="_blank">How To Travis Pick on Guitar - The ULTIMATE Fingerpicking Pattern – Lauren Bateman (0:00–9:00)</a>.',
                hint: 'In Travis-style picking, the thumb keeps everything moving — steady quarter notes on two bass strings while the fingers decorate on top.',
                hint_es: 'En el picking estilo Travis, el pulgar mantiene todo en movimiento — negras constantes en dos cuerdas graves mientras los dedos decoran encima.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'In Travis-style picking, the thumb\'s job is to:',
                  prompt_es: 'En el picking estilo Travis, el trabajo del pulgar es:',
                  answer: 1,
                  explain: 'The thumb keeps everything moving — steady quarter notes on two bass strings while the fingers decorate on top.',
                  explain_es: 'El pulgar mantiene todo en movimiento — negras constantes en dos cuerdas graves mientras los dedos decoran encima.',
                  choices: ['Play the melody on the top strings', 'Alternate steadily between two bass strings', 'Strum full chords on every beat', 'Rest while the fingers do the work'],
                  choices_es: ['Tocar la melodía en las cuerdas agudas', 'Alternar constantemente entre dos cuerdas graves', 'Rasguear acordes completos en cada tiempo', 'Descansar mientras los dedos hacen el trabajo'] }
              },
              {
                label: 'Watch: Travis picking basics (Andy Guitar)', label_es: 'Mira: bases del Travis picking (Andy Guitar)',
                text: 'Watch: <a href="https://youtu.be/XQiaCSabQaE?t=36" target="_blank">A Total Beginners Guide To Travis Picking – Andy Guitar</a> — a second teacher on the same pattern as the first video. Notice what Andy does differently from Lauren:<ul><li>How he counts the thumb.</li><li>When he lets the pinch in.</li></ul>',
                text_es: 'Mira: <a href="https://youtu.be/XQiaCSabQaE?t=36" target="_blank">A Total Beginners Guide To Travis Picking – Andy Guitar</a> — un segundo maestro con el mismo patrón que el primer video. Fíjate en qué hace Andy diferente a Lauren:<ul><li>Cómo cuenta el pulgar.</li><li>Cuándo deja entrar el pellizco.</li></ul>',
                hint: 'A pinch is bass and treble sounding at the same instant — the accent that makes Travis picking recognizable.',
                hint_es: 'Un pellizco es el bajo y el agudo sonando en el mismo instante — el acento que hace reconocible al Travis picking.',
                skills: [2, 3],
                response: { type: 'mc', prompt: 'A "pinch" is:',
                  prompt_es: 'Un "pellizco" es:',
                  answer: 1,
                  explain: 'Bass and treble sound at the same instant — the accent that makes Travis picking recognizable.',
                  explain_es: 'El bajo y el agudo suenan en el mismo instante — el acento que hace reconocible al Travis picking.',
                  choices: ['Two fingers plucking one string at once', 'Thumb and a finger plucking together', 'Muting the strings with your palm', 'A very quiet note between beats'],
                  choices_es: ['Dos dedos pulsando una cuerda a la vez', 'El pulgar y un dedo pulsando juntos', 'Silenciar las cuerdas con la palma', 'Una nota muy suave entre los tiempos'] }
              }
            ]
          },
          {
            title: 'Listen for the alternating bass',
            title_es: 'Escucha el bajo alternante',
            steps: [
              {
                label: 'Listen: the alternating bass', label_es: 'Escucha: el bajo alternante',
                text: 'On a C chord, the alternating thumb usually bounces between two bass strings. Listen for it in a Travis-picked recording of your choice.',
                text_es: 'En un acorde de C, el pulgar alternante suele rebotar entre dos cuerdas graves. Escúchalo en una grabación tocada con Travis picking de tu elección.',
                hint: 'The root (A string, fret 3 = C) and its 5th, fretted on the low E string (fret 3 = G) — same alternating bass Module 8 taught for a C chord.',
                hint_es: 'La raíz (cuerda La, traste 3 = C) y su 5ª, trasteada en la cuerda Mi grave (traste 3 = G) — el mismo bajo alternante que enseñó el Módulo 8 para un acorde de C.',
                skills: [1, 4],
                response: { type: 'mc', prompt: 'In the Travis-picking C shape from Module 8 (5th fretted on the low E string), the alternating thumb bounces between:',
                  prompt_es: 'En la forma de C con Travis picking del Módulo 8 (con la 5ª trasteada en la cuerda Mi grave), el pulgar alternante rebota entre:',
                  answer: 0,
                  explain: 'The root (A string, fret 3 = C) and its 5th, fretted on the low E string (fret 3 = G) — the thumb reaches down to a string the open chord shape doesn\'t normally use.',
                  explain_es: 'La raíz (cuerda La, traste 3 = C) y su 5ª, trasteada en la cuerda Mi grave (traste 3 = G) — el pulgar llega hasta una cuerda que la forma abierta del acorde normalmente no usa.',
                  choices: ['The low E and A strings', 'The A and D strings', 'The B and high e strings', 'Any two strings at random'],
                  choices_es: ['Las cuerdas Mi grave y La', 'Las cuerdas La y Re', 'Las cuerdas Si y mi aguda', 'Cualquier par de cuerdas al azar'] }
              }
            ]
          },
          {
            title: 'Try the alternating thumb',
            title_es: 'Prueba el pulgar alternante',
            steps: [
              {
                label: 'Try the alternating thumb', label_es: 'Prueba el pulgar alternante',
                text: 'Now try it: alternate your thumb between the A and low E strings over a C chord — root on the A string (fret 3), 5th fretted on the low E string (fret 3 = G) — 8 bars, no finger notes yet.',
                text_es: 'Ahora pruébalo: alterna tu pulgar entre las cuerdas La y Mi grave sobre un acorde de C — raíz en la cuerda La (traste 3), 5ª trasteada en la cuerda Mi grave (traste 3 = G) — 8 compases, todavía sin notas de dedos.',
                hint: 'Rule one of Travis: the thumb never stops. Fingers can rejoin on the next beat.',
                hint_es: 'Regla número uno del Travis picking: el pulgar nunca se detiene. Los dedos pueden reincorporarse en el siguiente tiempo.',
                skills: [1, 5],
                response: { type: 'mc', prompt: 'If your fingers get lost mid-pattern, what must keep going no matter what?',
                  prompt_es: 'Si tus dedos se pierden a mitad del patrón, ¿qué debe seguir sin importar qué?',
                  answer: 1,
                  explain: 'Rule one of Travis: the thumb never stops. Fingers can rejoin on the next beat.',
                  explain_es: 'Regla número uno del Travis picking: el pulgar nunca se detiene. Los dedos pueden reincorporarse en el siguiente tiempo.',
                  choices: ['The melody', 'The thumb bass', 'The metronome app', 'Your foot'],
                  choices_es: ['La melodía', 'El bajo del pulgar', 'La app del metrónomo', 'Tu pie'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Station wrap-up', label_es: 'Cierre de la estación',
                text: 'Station Wrap-Up — pause and think: in your own words, why does the thumb count as "the drummer" in Travis picking — what breaks if it stops?',
                text_es: 'Cierre de la estación — pausa y piensa: con tus propias palabras, ¿por qué el pulgar cuenta como "el baterista" del Travis picking — qué se rompe si se detiene?',
                response: { type: 'short', placeholder: 'e.g. the bass is the beat — if the thumb stops, the whole groove collapses',
                  placeholder_es: 'p. ej. el bajo es el pulso — si el pulgar se detiene, todo el groove se derrumba' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — alternating thumb & the pinch',
        title_es: 'Estación de práctica — pulgar alternante y el pellizco',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Fingerpicking exposes every note — an out-of-tune string is easy to hear.',
                hint_es: 'El fingerpicking expone cada nota — una cuerda desafinada se escucha fácilmente.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Alternate the thumb between two bass strings',
            title_es: 'Alterna el pulgar entre dos cuerdas graves',
            steps: [
              {
                label: 'Challenge 1 — Alternating Thumb, No Fingers', label_es: 'Reto 1 — Pulgar alternante, sin dedos',
                text: '<ul><li>Alternate between the A and low E strings in quarter notes — root on the A string (fret 3), 5th fretted on the low E string (fret 3) — 60 BPM, 8 bars, zero finger notes.</li></ul>You\'ve got it when: a steady, even alternating thumb with no wobble.',
                text_es: '<ul><li>Alterna entre la cuerda La y la Mi grave en negras — raíz en la cuerda La (traste 3), 5ª trasteada en la cuerda Mi grave (traste 3) — 60 BPM, 8 compases, cero notas de dedos.</li></ul>Lo tienes cuando: un pulgar alternante constante y parejo, sin tambalearse.',
                hint: 'Compared to Module 8\'s p-i-m-a-m-i arpeggio, the thumb ALTERNATES between bass strings instead of staying put — that bounce is the whole style.',
                hint_es: 'Comparado con el arpegio p-i-m-a-m-i del Módulo 8, el pulgar ALTERNA entre cuerdas graves en lugar de quedarse quieto — ese rebote es todo el estilo.',
                stuck: 'Drop to half tempo and count "1-2-3-4" aloud, landing the thumb exactly on each number.',
                stuck_es: 'Baja a la mitad del tempo y cuenta "1-2-3-4" en voz alta, haciendo caer el pulgar exactamente en cada número.',
                levelUp: 'Add a chord change Am↔C every 4 bars without the thumb missing a beat.',
                levelUp_es: 'Agrega un cambio de acorde Am↔C cada 4 compases sin que el pulgar se pierda ni un tiempo.',
                skills: [1, 4],
                playSeq: { label: 'Thumb alternation on C — the A and low E strings', label_es: 'Alternancia del pulgar en C — las cuerdas La y Mi grave', bpm: 60, notes: [48, 43, 48, 43] }
              }
            ]
          },
          {
            title: 'Add the pinch',
            title_es: 'Agrega el pellizco',
            steps: [
              {
                label: 'Challenge 2 — The Pinch', label_es: 'Reto 2 — El pellizco',
                text: '<ul><li>Pinch (thumb on the A string + m on the B string) on beat 1, thumb alone beats 2–4.</li></ul>You\'ve got it when: both notes of the pinch sound together as one, perfectly in sync.',
                text_es: '<ul><li>Pellizca (pulgar en la cuerda La + m en la cuerda Si) en el tiempo 1, pulgar solo en los tiempos 2–4.</li></ul>Lo tienes cuando: ambas notas del pellizco suenan juntas como una sola, perfectamente sincronizadas.',
                hint: 'A pinch is the bridge between arpeggios and Travis picking — thumb and finger move toward each other and meet.',
                hint_es: 'Un pellizco es el puente entre los arpegios y el Travis picking — el pulgar y el dedo se mueven uno hacia el otro y se encuentran.',
                stuck: 'Pluck the bass and the treble separately first, slowly, then bring them closer until they land together.',
                stuck_es: 'Pulsa el bajo y el agudo por separado primero, despacio, y luego acércalos hasta que caigan juntos.',
                levelUp: 'Add a second pinch on beat 3, or hold the thumb alternation through an Am↔C change.',
                levelUp_es: 'Agrega un segundo pellizco en el tiempo 3, o mantén la alternancia del pulgar a través de un cambio Am↔C.',
                skills: [2]
              }
            ]
          },
          {
            title: 'Add finger fills',
            title_es: 'Agrega rellenos de dedos',
            steps: [
              {
                label: 'Challenge 3 — i-Finger Fill', label_es: 'Reto 3 — Relleno del dedo i',
                text: 'A fill is a short extra run of notes between the main parts.<ul><li>Keep the thumb going.</li><li>Add i on the "and" of beat 2.</li></ul>You\'ve got it when: the fill lands cleanly between two thumb strokes without slowing the thumb down.',
                text_es: 'Un relleno es una pequeña serie extra de notas entre las partes principales.<ul><li>Mantén el pulgar en marcha.</li><li>Agrega i en el "y" del tiempo 2.</li></ul>Lo tienes cuando: el relleno cae limpio entre dos golpes del pulgar sin frenarlo.',
                hint: 'Fingers decorate ON TOP of a thumb that\'s already keeping a steady groove (a groove is the steady rhythmic feel) — the thumb\'s rhythm never bends to fit the fingers.',
                hint_es: 'Los dedos decoran ENCIMA de un pulgar que ya mantiene un groove constante (un groove es la sensación rítmica estable) — el ritmo del pulgar nunca se dobla para ajustarse a los dedos.',
                stuck: 'Isolate just the thumb + one fill note, looping it until it\'s automatic before adding more.',
                stuck_es: 'Aísla solo el pulgar + una nota de relleno, repitiéndolo hasta que sea automático antes de agregar más.',
                levelUp: 'Add a second fill on the "and" of beat 4.',
                levelUp_es: 'Agrega un segundo relleno en el "y" del tiempo 4.',
                skills: [3]
              }
            ]
          },
          {
            title: 'Keep the pattern through a chord change',
            title_es: 'Mantén el patrón a través de un cambio de acorde',
            steps: [
              {
                label: 'Challenge 4 — Am↔C', label_es: 'Reto 4 — Am↔C',
                text: '<ul><li>Play the alternating thumb + pinch pattern through an Am↔C change.</li></ul>You\'ve got it when: the pattern survives the change with the thumb never stopping.',
                text_es: '<ul><li>Toca el patrón de pulgar alternante + pellizco a través de un cambio Am↔C.</li></ul>Lo tienes cuando: el patrón sobrevive el cambio sin que el pulgar se detenga nunca.',
                hint: 'Anticipate the change — start moving your fretting hand on the last note of the bar so beat 1 always lands ready.',
                hint_es: 'Anticipa el cambio — empieza a mover tu mano de trastear en la última nota del compás para que el tiempo 1 siempre caiga listo.',
                stuck: 'Strum Am then C once each to check both chords ring clean, then loop just the thumb through the change before adding the pinch back.',
                stuck_es: 'Rasguea Am y luego C una vez cada uno para revisar que ambos acordes suenen limpios, y luego repite solo el pulgar a través del cambio antes de agregar el pellizco de nuevo.',
                levelUp: 'Run Am → C → Am → C for 8 bars without a single broken beat.',
                levelUp_es: 'Corre Am → C → Am → C durante 8 compases sin un solo tiempo roto.',
                skills: [5],
                chords: [
                  { name: 'C', chord: [[6,3,'4'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "House of the Rising Sun", bass + roll in 6/8', label_es: 'Reto — "House of the Rising Sun", bajo + floreo en 6/8',
                text: '<ul><li>Play the verse with a bass note on the downbeat (the first, strongest beat of the bar).</li><li>Roll your fingers up through each chord, following the progression.</li></ul>You\'ve got it when: the verse survives every chord change with the roll staying smooth.',
                text_es: '<ul><li>Toca la estrofa con una nota grave en el tiempo fuerte (el primer tiempo, el más fuerte del compás).</li><li>Haz un floreo ascendente con tus dedos a través de cada acorde, siguiendo la progresión.</li></ul>Lo tienes cuando: la estrofa sobrevive cada cambio de acorde con el floreo manteniéndose suave.',
                hint: '"House of the Rising Sun" is in 6/8: six eighth notes in a bar, grouped into two big beats of three — count "ONE-two-three TWO-two-three". It is the waltz\'s cousin, not the same thing. A waltz (3/4, coming up in Set 2) has THREE main beats a bar; 6/8 has TWO, each one filled with three quick notes. The thumb plays the bass on the downbeat; the fingers roll up through the chord between beats.',
                hint_es: '"House of the Rising Sun" está en 6/8: seis corcheas en un compás, agrupadas en dos tiempos grandes de tres — cuenta "UNO-dos-tres DOS-dos-tres". Es primo del vals, no lo mismo. Un vals (3/4, que viene en la Unidad 2) tiene TRES tiempos principales por compás; el 6/8 tiene DOS, cada uno lleno de tres notas rápidas. El pulgar toca el bajo en el tiempo fuerte; los dedos hacen un floreo ascendente a través del acorde entre los tiempos.',
                stuck: 'Loop just the first two chords of the verse until the pattern is rock solid before adding the rest.',
                stuck_es: 'Repite solo los dos primeros acordes de la estrofa hasta que el patrón sea firme como una roca antes de agregar el resto.',
                levelUp: 'Play the whole verse from memory, no chord chart.',
                levelUp_es: 'Toca la estrofa completa de memoria, sin diagrama de acordes.',
                skills: [6]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: write your tempo target', label_es: 'Cierre: escribe tu objetivo de tempo',
                text: 'What tempo could you hold the alternating thumb today without it stumbling? Write it below — that\'s your warm-up target next time. (Don\'t stop yet — two more sections below!)',
                text_es: '¿A qué tempo pudiste mantener el pulgar alternante hoy sin que tropezara? Escríbelo abajo — ese es tu objetivo de calentamiento la próxima vez. (¡No te detengas todavía — faltan dos secciones más abajo!)',
                response: { type: 'short', placeholder: 'e.g. solid at 60 BPM; at 70 my thumb followed my fingers and fell apart',
                  placeholder_es: 'p. ej. firme a 60 BPM; a 70 mi pulgar siguió a mis dedos y se desarmó' }
              }
            ]
          },
          {
            title: 'Play-along — one full pass, no stopping',
            title_es: 'Toca junto al video — una pasada completa, sin detenerte',
            steps: [
              {
                label: 'Play-along: the Travis pattern', label_es: 'Toca junto al video: patrón Travis',
                text: 'Play-along:<ol><li>Open <a href="https://www.youtube.com/watch?v=JvtFd7vkea0" target="_blank">Station B\'s Travis pattern lesson video</a> (the Practice Playalong section, 8:59–11:16).</li><li>Set YouTube\'s speed to 0.75×.</li><li>Pick along for the ENTIRE demo section without stopping.</li></ol>You\'ve got it when: you finish a full pass with the video — dropped pinches and all, don\'t stop.',
                text_es: 'Toca junto al video:<ol><li>Abre <a href="https://www.youtube.com/watch?v=JvtFd7vkea0" target="_blank">el video de la lección del patrón Travis de la Estación B</a> (la sección Practice Playalong, 8:59–11:16).</li><li>Pon la velocidad de YouTube en 0.75×.</li><li>Toca junto a la TOTALIDAD de la sección de demostración sin detenerte.</li></ol>Lo tienes cuando: terminas una pasada completa con el video — con pellizcos fallados y todo, no te detengas.',
                hint: 'Not stopping is the skill. If the thumb stumbles, let the fills go and keep the bass walking until you\'re back in.',
                hint_es: 'No detenerte es la destreza. Si el pulgar tropieza, deja ir los rellenos y mantén el bajo caminando hasta que vuelvas a estar dentro.'
              }
            ]
          },
          {
            title: 'Reactivate p-i-m-a — the claw (from Module 8)',
            title_es: 'Reactiva p-i-m-a — la garra (del Módulo 8)',
            steps: [
              {
                label: 'Challenge — Claw Check', label_es: 'Reto — Revisión de la garra',
                text: 'Plant all four picking fingers at once:<ul><li>Thumb (p) resting on the bass strings (low E, A, D).</li><li>Index (i) on the G string.</li><li>Middle (m) on the B string.</li><li>Ring (a) on the high e.</li><li>Then pluck p–i–m–a on the open strings, twice through at 60 BPM.</li></ul>You\'ve got it when: each finger plays in order, one string each, with no two fingers grabbing the same string.',
                text_es: 'Planta los cuatro dedos de pulsar a la vez:<ul><li>Pulgar (p) apoyado en las cuerdas graves (Mi grave, La, Re).</li><li>Índice (i) en la cuerda Sol.</li><li>Medio (m) en la cuerda Si.</li><li>Anular (a) en la mi aguda.</li><li>Luego pulsa p–i–m–a en las cuerdas al aire, dos veces seguidas a 60 BPM.</li></ul>Lo tienes cuando: cada dedo toca en orden, una cuerda cada uno, sin que dos dedos agarren la misma cuerda.',
                hint: 'This is a 60-second reactivation of Module 8, not a re-teach — it\'s the picking hand you built back then, so warm it up any time it feels out of practice, including right now before your next run. p owns the three bass strings (low E, A, D); i-G, m-B, a-high-e never trade places. Set the assignment once and your hand stops hunting for strings.',
                hint_es: 'Esta es una reactivación de 60 segundos del Módulo 8, no una nueva enseñanza — es la mano de pulsar que construiste allá, así que caliéntala cuando sea que se sienta oxidada, incluso ahora mismo antes de tu próxima corrida. p es dueño de las tres cuerdas graves (Mi grave, La, Re); i-Sol, m-Si, a-mi aguda nunca intercambian lugares. Fija la asignación una vez y tu mano deja de buscar cuerdas a tientas.',
                stuck: 'Plant all four fingers silently first and feel each one touching its string, then pluck slowly — p, then i, then m, then a — before you add the metronome.',
                stuck_es: 'Planta los cuatro dedos en silencio primero y siente cada uno tocando su cuerda, y luego pulsa despacio — p, luego i, luego m, luego a — antes de agregar el metrónomo.',
                levelUp: 'Run the staircase up and back down (p-i-m-a-m-i) without looking at your picking hand.',
                levelUp_es: 'Corre la escalera subiendo y bajando (p-i-m-a-m-i) sin mirar tu mano de pulsar.',
                skills: [1, 3],
                playSeq: { label: 'p-i-m-a on open strings — A, G, B, e (twice through)', label_es: 'p-i-m-a en cuerdas al aire — La, Sol, Si, mi aguda (dos veces seguidas)', bpm: 60, notes: [45, 55, 59, 64, 45, 55, 59, 64] }
              },
              {
                label: 'Challenge — 4-Note Arpeggio, Am then C', label_es: 'Reto — Arpegio de 4 notas, Am y luego C',
                text: '<ol><li>Play a p–i–m–a arpeggio on each chord — one thumb bass, then i-m-a rolling up the top three strings.</li><li>Play 2 bars of Am, then 2 bars of C, and loop.</li><li>On Am the thumb takes the open A string; on C it slides to the 3rd-fret C on that same string.</li></ol>You\'ve got it when: every note is the same volume and the a-finger (the high e) doesn\'t rush ahead of the beat.',
                text_es: '<ol><li>Toca un arpegio p–i–m–a en cada acorde — un bajo del pulgar, y luego i-m-a en un floreo ascendente por las tres cuerdas superiores.</li><li>Toca 2 compases de Am, y luego 2 compases de C, y repite.</li><li>En Am el pulgar toma la cuerda La al aire; en C se desliza al C del traste 3 de esa misma cuerda.</li></ol>Lo tienes cuando: cada nota tiene el mismo volumen y el dedo a (la mi aguda) no se adelanta al tiempo.',
                hint: 'This is the four-even-notes drill (a drill is a short exercise you repeat to build a skill) Module 8 built the whole pattern on — the a-finger is the one most likely to play too early, so keep it as calm as the thumb.',
                hint_es: 'Este es el ejercicio de cuatro notas parejas (un ejercicio es una actividad corta que repites para desarrollar una destreza) sobre el que el Módulo 8 construyó todo el patrón — el dedo a es el que más probablemente toque demasiado temprano, así que mantenlo tan calmado como el pulgar.',
                stuck: 'Loop just Am until the four notes are dead even, then add C — the only thing that changes between the chords is where the thumb lands.',
                stuck_es: 'Repite solo Am hasta que las cuatro notas estén perfectamente parejas, y luego agrega C — lo único que cambia entre los acordes es dónde cae el pulgar.',
                levelUp: 'Fold the same p-i-m-a shape into this set\'s Travis pattern — and, when you reach Set 2, into the 3/4 waltz pattern too — keeping every note even.',
                levelUp_es: 'Incorpora la misma forma p-i-m-a en el patrón Travis de esta unidad — y, cuando llegues a la Unidad 2, también en el patrón de vals en 3/4 — manteniendo cada nota pareja.',
                skills: [1, 4],
                playSeq: { label: 'Hear one p-i-m-a lap on Am, then C — loop it 2 bars each', label_es: 'Escucha una vuelta p-i-m-a en Am, y luego en C — repítelo 2 compases cada uno', bpm: 60, notes: [45, 57, 60, 64, 48, 55, 60, 64] },
                chords: [
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'C', chord: [[6,3,'4'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 }
                ]
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Alternating thumb in steady quarters · Clean pinch on the downbeat · Pattern survives an Am↔C change',
      goal_es: 'Pulgar alternante en negras constantes · Pellizco limpio en el tiempo fuerte · El patrón sobrevive un cambio Am↔C',
      performance: 'Record yourself thumb-drumming at 60 BPM for 8 bars; listen back for your thumb stopping when the fills enter.',
      selfCheck: 'Can your thumb keep going while you talk? Does the pinch land exactly together, or does one note leak first?',
      selfCheck_es: '¿Puede tu pulgar seguir sonando mientras hablas? ¿El pellizco cae exactamente junto, o se escapa primero una nota?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm12w1-s1', text: 'Alternate the thumb between two bass strings in steady quarter notes',
        text_es: 'Alternar el pulgar entre dos cuerdas graves en negras constantes',
        gotItWhen: 'the thumb bounces evenly between the A and low E strings in steady quarter notes, with no wobble.',
        gotItWhen_es: 'el pulgar rebota parejo entre las cuerdas La y Mi grave en negras constantes, sin tambalearse.',
        practice: { type: 'playSeq', label: 'Thumb alternation on C — the A and low E strings', label_es: 'Alternancia del pulgar en C — las cuerdas La y Mi grave', bpm: 60, notes: [48, 43, 48, 43] } },
      { id: 'm12w1-s2', text: 'Play a pinch (thumb + finger together) on the downbeat',
        text_es: 'Tocar un pellizco (pulgar + dedo juntos) en el tiempo fuerte',
        gotItWhen: 'both notes of the pinch land together as one, perfectly in sync, right on the downbeat.',
        gotItWhen_es: 'ambas notas del pellizco caen juntas como una sola, perfectamente sincronizadas, justo en el tiempo fuerte.',
        practice: { type: 'mc', prompt: 'A pinch means the bass and treble notes sound:',
          prompt_es: 'Un pellizco significa que las notas graves y agudas suenan:',
          choices: ['One after the other', 'At exactly the same time', 'Only on beat 3', 'Muted'],
          choices_es: ['Una después de la otra', 'Exactamente al mismo tiempo', 'Solo en el tiempo 3', 'Silenciadas'], answer: 1,
          explain: 'A pinch is thumb and finger squeezing together, so the two notes land as one sound. If you hear them one after the other, you played a tiny arpeggio (notes one at a time) instead.',
          explain_es: 'Un pellizco es el pulgar y el dedo apretando juntos, así que las dos notas caen como un solo sonido. Si las escuchas una después de la otra, tocaste un pequeño arpegio (notas una por una) en vez de un pellizco.' } },
      { id: 'm12w1-s3', text: 'Add an i-finger fill on the "and" of beat 2 while the thumb keeps alternating',
        text_es: 'Agregar un relleno del dedo i en el "y" del tiempo 2 mientras el pulgar sigue alternando',
        gotItWhen: 'the i-finger fill lands cleanly between two thumb strokes without slowing the thumb down.',
        gotItWhen_es: 'el relleno del dedo i cae limpio entre dos golpes del pulgar sin frenarlo.',
        practice: { type: 'playSeq', label: 'Thumb on beats 1-2-3-4, i-finger fill on the "and" of 2 — C', label_es: 'Pulgar en los tiempos 1-2-3-4, relleno del dedo i en el "y" del 2 — C', bpm: 60,
          notes: [48, { midi: 43, beats: 0.5 }, { midi: 55, beats: 0.5 }, 48, 43] } },
      { id: 'm12w1-s4', text: 'Play a Travis-feel pattern over C at 60 BPM for 8 bars',
        text_es: 'Tocar un patrón con sensación Travis sobre C a 60 BPM durante 8 compases',
        gotItWhen: 'the Travis-feel pattern loops over C at 60 BPM for a full 8 bars without breaking.',
        gotItWhen_es: 'el patrón con sensación Travis se repite sobre C a 60 BPM durante 8 compases completos sin romperse.',
        practice: { type: 'pr', prompt: '<ol><li>Loop your Travis-feel pattern over C at 60 BPM.</li><li>Count the bars in a row before the pattern breaks.</li><li>Log your best streak (8 bars is the goal).</li></ol>',
          prompt_es: '<ol><li>Repite tu patrón con sensación Travis sobre C a 60 BPM.</li><li>Cuenta los compases seguidos antes de que el patrón se rompa.</li><li>Anota tu mejor racha (la meta es 8 compases).</li></ol>',
          unit: 'count', placeholder: 'e.g. 8 bars — try for a longer streak', placeholder_es: 'p. ej. 8 compases — intenta una racha más larga' } },
      { id: 'm12w1-s5', text: 'Keep the alternating pattern unbroken through an Am–C change',
        text_es: 'Mantener el patrón alternante sin interrupciones a través de un cambio Am–C',
        gotItWhen: 'the alternating pattern survives every Am–C change with the thumb never stopping.',
        gotItWhen_es: 'el patrón alternante sobrevive cada cambio Am–C sin que el pulgar se detenga nunca.',
        practice: { type: 'pr', prompt: '<ol><li>One minute: keep the alternating-thumb pattern going over Am ↔ C, switching every bar.</li><li>Count the changes where the thumb never stopped.</li><li>Log your best.</li></ol>',
          prompt_es: '<ol><li>Un minuto: mantén el patrón de pulgar alternante sobre Am ↔ C, cambiando cada compás.</li><li>Cuenta los cambios donde el pulgar nunca se detuvo.</li><li>Anota tu mejor número.</li></ol>',
          unit: 'count', placeholder: 'e.g. 8 changes — try for a higher number', placeholder_es: 'p. ej. 8 cambios — intenta superarlo' } },
      { id: 'm12w1-s6', text: 'Play a bass-note + roll verse of "House of the Rising Sun" (thumb bass, then fingers rolling up through the chord)',
        text_es: 'Tocar una estrofa de nota grave + floreo de "House of the Rising Sun" (bajo del pulgar, y luego dedos en floreo ascendente a través del acorde)',
        gotItWhen: 'the verse survives every chord change with the roll staying smooth and the thumb never stopping.',
        gotItWhen_es: 'la estrofa sobrevive cada cambio de acorde con el floreo manteniéndose suave y el pulgar sin detenerse nunca.',
        practice: { type: 'playSeq', label: 'Am bass + roll — "House of the Rising Sun" feel (6/8)', label_es: 'Bajo de Am + floreo — sensación de "House of the Rising Sun" (6/8)', bpm: 80,
          notes: [45, 52, 57, 60, 64, 60] } }
    ]
  },

  {
    id: 'm12w2',
    label: 'Set 2',
    locked: false,
    module: 'Fingerstyle: Travis, Waltz & Requinto',
    moduleNum: 12,
    unit: 'Module 12 · Fingerstyle: Travis, Waltz & Requinto',
    unit_es: 'Módulo 12 · Fingerstyle: Travis, vals y requinto',
    title: 'Set 2',
    subtitle: 'Picking in 3 · "the cure" finally at home · Your pattern, your song',
    subtitle_es: 'Punteo en 3 · "the cure" por fin en su lugar · Tu patrón, tu canción',
    skillFocus: 'The 3/4 pattern: bass–pluck–pluck · Feeling 3 vs 4 · "Native style" — why the ◐ disappears',
    skillFocus_es: 'El patrón en 3/4: bajo–pulsación–pulsación · Sentir el 3 frente al 4 · "Estilo nativo" — por qué desaparece el ◐',
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
                label: 'Watch: pinch patterns', label_es: 'Mira: patrones de pellizco',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=AFyqe-rfxTU" target="_blank">Fingerpicking for Beginners - Pluck Patterns and Walkdowns – Lauren Bateman (0:00–5:55)</a> (the pinch/pattern half — she calls the pinch "the pluck").',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=AFyqe-rfxTU" target="_blank">Fingerpicking for Beginners - Pluck Patterns and Walkdowns – Lauren Bateman (0:00–5:55)</a> (la mitad sobre el pellizco/patrón — ella llama al pellizco "the pluck").',
                hint: 'In 3/4 time, each bar has 3 beats — count ONE-two-three, ONE-two-three. Your bass note owns beat one.',
                hint_es: 'En el compás de 3/4, cada compás tiene 3 tiempos — cuenta UNO-dos-tres, UNO-dos-tres. Tu nota grave es dueña del tiempo uno.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'In 3/4 time, each bar has:',
                  prompt_es: 'En el compás de 3/4, cada compás tiene:',
                  answer: 1,
                  explain: 'Count ONE-two-three, ONE-two-three — the waltz. Your bass note owns beat one.',
                  explain_es: 'Cuenta UNO-dos-tres, UNO-dos-tres — el vals. Tu nota grave es dueña del tiempo uno.',
                  choices: ['4 beats', '3 beats', '2 beats', '6 beats'],
                  choices_es: ['4 tiempos', '3 tiempos', '2 tiempos', '6 tiempos'] }
              },
              {
                label: 'Watch: a fingerpicking pattern in 3/4', label_es: 'Mira: patrón de fingerpicking en 3/4',
                text: 'Watch: <a href="https://youtu.be/Z4ltlHtQUA0" target="_blank">Fingerpicking Pattern for 3/4 or 6/8 Time – MrPoloniaMusic</a>. Notice the bass note always lands on beat 1, with the fingers answering after.',
                text_es: 'Mira: <a href="https://youtu.be/Z4ltlHtQUA0" target="_blank">Fingerpicking Pattern for 3/4 or 6/8 Time – MrPoloniaMusic</a>. Fíjate que la nota grave siempre cae en el tiempo 1, con los dedos respondiendo después.',
                hint: 'The simplest 3/4 picking pattern: thumb states the bar on beat 1, fingers answer on 2 and 3.',
                hint_es: 'El patrón de punteo en 3/4 más simple: el pulgar anuncia el compás en el tiempo 1, los dedos responden en el 2 y el 3.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'The simplest 3/4 picking pattern is:',
                  prompt_es: 'El patrón de punteo en 3/4 más simple es:',
                  answer: 1,
                  explain: 'Thumb states the bar on beat 1; fingers answer on 2 and 3.',
                  explain_es: 'El pulgar anuncia el compás en el tiempo 1; los dedos responden en el 2 y el 3.',
                  choices: ['pluck–pluck–bass', 'bass–pluck–pluck', 'bass–bass–bass', 'pinch–pinch–pinch'],
                  choices_es: ['pulsación–pulsación–bajo', 'bajo–pulsación–pulsación', 'bajo–bajo–bajo', 'pellizco–pellizco–pellizco'] }
              }
            ]
          },
          {
            title: 'Listen for the waltz feel',
            title_es: 'Escucha la sensación de vals',
            steps: [
              {
                label: 'Listen: the waltz feel', label_es: 'Escucha: la sensación de vals',
                text: 'Happy Birthday is a waltz — count along to any recording and you\'ll feel it swing ONE-two-three, ONE-two-three. Today you\'ll pick it in 3 instead of strumming it.',
                text_es: 'Happy Birthday es un vals — cuenta junto a cualquier grabación y sentirás cómo se mece UNO-dos-tres, UNO-dos-tres. Hoy lo puntearás en 3 en lugar de rasguearlo.',
                hint: 'A waltz counts ONE-two-three, ONE-two-three — three beats per bar, with the bass note owning beat one.',
                hint_es: 'Un vals se cuenta UNO-dos-tres, UNO-dos-tres — tres tiempos por compás, con la nota grave dueña del tiempo uno.',
                skills: [2, 6],
                response: { type: 'mc', prompt: 'A waltz (3/4 time) has how many beats per bar?',
                  prompt_es: '¿Un vals (compás de 3/4) tiene cuántos tiempos por compás?',
                  answer: 1,
                  explain: 'Three — ONE-two-three, ONE-two-three. Happy Birthday is a classic waltz, and now you\'ll pick it in 3.',
                  explain_es: 'Tres — UNO-dos-tres, UNO-dos-tres. Happy Birthday es un vals clásico, y ahora lo puntearás en 3.',
                  choices: ['4 beats', '3 beats', '2 beats', '6 beats'],
                  choices_es: ['4 tiempos', '3 tiempos', '2 tiempos', '6 tiempos'] }
              }
            ]
          },
          {
            title: 'Try "the cure" fingerstyle — its native style',
            title_es: 'Prueba "the cure" con fingerstyle — su estilo nativo',
            steps: [
              {
                label: 'Try the cure fingerstyle', label_es: 'Prueba the cure con fingerstyle',
                text: 'Playing "the cure" fingerstyle removes its ◐ flag — fingerpicking IS the song\'s native style, not "against the grain" (playing a song in a style that fights its natural feel) like power-chording a gentle ballad. Try picking through Am–C–Dm–F, one bar each.',
                text_es: 'Tocar "the cure" con fingerstyle le quita su marca ◐ — el fingerpicking ES el estilo nativo de la canción, no "a contrapelo" (tocar una canción en un estilo que pelea contra su sensación natural) como tocar una balada suave con acordes de potencia. Prueba a puntear a través de Am–C–Dm–F, un compás cada uno.',
                hint: 'The ◐ flag marked renderings that fought a song\'s nature. Fingerpicked, "the cure" is finally itself.',
                hint_es: 'La marca ◐ señalaba versiones que peleaban contra la naturaleza de una canción. Con fingerpicking, "the cure" por fin es ella misma.',
                skills: [3, 5],
                response: { type: 'mc', prompt: 'Playing "the cure" fingerstyle removes its ◐ flag because:',
                  prompt_es: 'Tocar "the cure" con fingerstyle le quita su marca ◐ porque:',
                  answer: 1,
                  explain: 'Fingerpicking IS the song\'s native style — no more "against the grain."',
                  explain_es: 'El fingerpicking ES el estilo nativo de la canción — ya no está más "a contrapelo".',
                  choices: ['It\'s easier than strumming the chords', 'Fingerpicking IS the song\'s native style', 'It uses fewer chords than the strummed version', 'The flag was a mistake in the first place'],
                  choices_es: ['Es más fácil que rasguear los acordes', 'El fingerpicking ES el estilo nativo de la canción', 'Usa menos acordes que la versión rasgueada', 'La marca fue un error desde el principio'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Station wrap-up', label_es: 'Cierre de la estación',
                text: 'Station Wrap-Up — pause and think: how would you explain to a friend the difference between counting in 4 and counting in 3, without playing a note?',
                text_es: 'Cierre de la estación — pausa y piensa: ¿cómo le explicarías a un amigo la diferencia entre contar en 4 y contar en 3, sin tocar una sola nota?',
                response: { type: 'short', placeholder: 'e.g. in 3 the bass comes back one beat sooner — ONE-two-three instead of ONE-two-three-four',
                  placeholder_es: 'p. ej. en 3 el bajo regresa un tiempo antes — UN-dos-tres en lugar de UN-dos-tres-cuatro' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — the waltz pattern & native-style songs',
        title_es: 'Estación de práctica — el patrón de vals y las canciones en su estilo nativo',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Fingerpicking exposes every note — an out-of-tune string is easy to hear.',
                hint_es: 'El fingerpicking expone cada nota — una cuerda desafinada se escucha fácilmente.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Count and pick a 3/4 pattern',
            title_es: 'Cuenta y puntea un patrón en 3/4',
            steps: [
              {
                label: 'Challenge 1 — 3/4 Count-and-Pick', label_es: 'Reto 1 — Cuenta y puntea en 3/4',
                text: '<ul><li>Play the 3/4 pattern (bass–pluck–pluck) on one chord, counting aloud, 60 BPM.</li></ul>You\'ve got it when: a steady 3-count with the bass landing exactly on beat 1 every bar.',
                text_es: '<ul><li>Toca el patrón en 3/4 (bajo–pulsación–pulsación) sobre un acorde, contando en voz alta, 60 BPM.</li></ul>Lo tienes cuando: un conteo de 3 constante con el bajo cayendo exactamente en el tiempo 1 de cada compás.',
                hint: 'Beat 1 is the strongest — land the bass note exactly on it every bar, and the two plucks fall into place after.',
                hint_es: 'El tiempo 1 es el más fuerte — haz caer la nota grave exactamente ahí en cada compás, y las dos pulsaciones caen en su lugar después.',
                stuck: 'Drop the counting and just feel "long-short-short" for bass-pluck-pluck.',
                stuck_es: 'Deja el conteo y solo siente "largo-corto-corto" para bajo-pulsación-pulsación.',
                levelUp: 'Count silently in your head instead of aloud, or add a pinch on beat 1.',
                levelUp_es: 'Cuenta en silencio en tu cabeza en lugar de en voz alta, o agrega un pellizco en el tiempo 1.',
                skills: [1, 2],
                playSeq: { label: '3/4 pattern on C — bass, then G string, then C on the B string', label_es: 'Patrón en 3/4 sobre C — bajo, y luego la cuerda Sol, y luego C en la cuerda Si', bpm: 60, notes: [48, 55, 60] }
              }
            ]
          },
          {
            title: 'Fingerpick "the cure" in its native style',
            title_es: 'Toca "the cure" con fingerpicking en su estilo nativo',
            steps: [
              {
                label: 'Challenge 2 — "the cure" Native Style', label_es: 'Reto 2 — "the cure" en su estilo nativo',
                text: '<ul><li>Fingerpick Am–C–Dm–F, one bar each, pattern of your choice.</li></ul>You\'ve got it when: the ◐ is gone — this IS how the song wants to be played.',
                text_es: '<ul><li>Toca con fingerpicking Am–C–Dm–F, un compás cada uno, con el patrón que elijas.</li></ul>Lo tienes cuando: el ◐ desaparece — así ES como la canción quiere que se toque.',
                hint: 'Native style — why the ◐ disappears: fingerpicking is this song\'s home texture, not a workaround. Keep it unbroken through each change by moving your fretting hand early — on the bar\'s last note.',
                hint_es: 'Estilo nativo — por qué desaparece el ◐: el fingerpicking es la textura natural de esta canción, no una solución alternativa. Mantenlo sin interrupciones a través de cada cambio moviendo tu mano de trastear temprano — en la última nota del compás.',
                stuck: 'Loop just Am–C until the pattern survives that one change before adding Dm–F.',
                stuck_es: 'Repite solo Am–C hasta que el patrón sobreviva ese cambio antes de agregar Dm–F.',
                levelUp: 'Add a pinch on beat 1 of each chord.',
                levelUp_es: 'Agrega un pellizco en el tiempo 1 de cada acorde.',
                skills: [3]
              }
            ]
          },
          {
            title: 'Fingerpick "Let It Be" with your own pattern',
            title_es: 'Toca "Let It Be" con fingerpicking usando tu propio patrón',
            steps: [
              {
                label: 'Challenge 3 — "Let It Be"', label_es: 'Reto 3 — "Let It Be"',
                text: '<ul><li>Arpeggiate C–G–Am–F, your chosen pattern, working toward 70 BPM.</li></ul>You\'ve got it when: one full lap (a lap = one full time through) with the pattern unbroken through all four chords.',
                text_es: '<ul><li>Arpegia C–G–Am–F con el patrón que elegiste, trabajando hacia 70 BPM.</li></ul>Lo tienes cuando: una vuelta completa (una vuelta = un recorrido completo) con el patrón sin interrupciones a través de los cuatro acordes.',
                hint: 'You already fingerpicked this verse in Module 8 — now push the tempo and choice of pattern further.',
                hint_es: 'Ya tocaste esta estrofa con fingerpicking en el Módulo 8 — ahora empuja más el tempo y la elección del patrón.',
                stuck: 'Drop to 50 BPM and loop just C–G until it\'s automatic.',
                stuck_es: 'Baja a 50 BPM y repite solo C–G hasta que sea automático.',
                levelUp: 'Reach 70 BPM clean, or add a pinch on beat 1 of each chord.',
                levelUp_es: 'Alcanza 70 BPM limpio, o agrega un pellizco en el tiempo 1 de cada acorde.',
                skills: [4, 5]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — Happy Birthday in 3, fingerstyle', label_es: 'Reto — Happy Birthday en 3, con fingerstyle',
                text: '<ul><li>Play the melody\'s chords with the 3/4 bass–pluck–pluck pattern all the way through.</li></ul>You\'ve got it when: the waltz feel never breaks, start to finish.',
                text_es: '<ul><li>Toca los acordes de la melodía con el patrón en 3/4 bajo–pulsación–pulsación de principio a fin.</li></ul>Lo tienes cuando: la sensación de vals nunca se rompe, de principio a fin.',
                hint: 'Happy Birthday is a waltz — count ONE-two-three, ONE-two-three and let the bass land on beat 1 of each bar.',
                hint_es: 'Happy Birthday es un vals — cuenta UNO-dos-tres, UNO-dos-tres y deja que el bajo caiga en el tiempo 1 de cada compás.',
                stuck: 'Play just the chord changes with the pattern first, humming the melody instead of picking it out.',
                stuck_es: 'Toca solo los cambios de acorde con el patrón primero, tarareando la melodía en lugar de puntearla.',
                levelUp: 'Sing along while you pick it.',
                levelUp_es: 'Canta mientras la punteas.',
                skills: [6]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: picking in 4 vs. in 3', label_es: 'Cierre: puntear en 4 vs. en 3',
                text: 'Which felt more natural — picking in 4 or in 3? What does the waltz feel do to the song? Write it below.',
                text_es: '¿Qué se sintió más natural — puntear en 4 o en 3? ¿Qué le hace la sensación de vals a la canción? Escríbelo abajo.',
                response: { type: 'short', placeholder: 'e.g. 3 kept surprising me — but it makes Happy Birthday float instead of march',
                  placeholder_es: 'p. ej. el 3 me seguía sorprendiendo — pero hace que Happy Birthday flote en lugar de marchar' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Picks a 3/4 pattern in time · Plays "the cure" or "Let It Be" fingerstyle with the pattern unbroken · Explains "native style"',
      goal_es: 'Puntea un patrón en 3/4 en tiempo · Toca "the cure" o "Let It Be" con fingerstyle sin interrupciones en el patrón · Explica el "estilo nativo"',
      performance: 'Record yourself playing the 3/4 pattern (bass-pluck-pluck) on one chord, counting aloud at 60 BPM. Then fingerpick "the cure" (Am-C-Dm-F) or "Let It Be" (C-G-Am-F), one bar each, with the pattern unbroken through every chord change.',
      selfCheck: 'Can you count aloud while picking in 3? Does your pattern survive the F chord?',
      selfCheck_es: '¿Puedes contar en voz alta mientras punteas en 3? ¿Tu patrón sobrevive el acorde F?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Re.8a']
    },

    skills: [
      { id: 'm12w2-s1', text: 'Play a 3/4 fingerpicking pattern (bass–pluck–pluck) in time',
        text_es: 'Tocar un patrón de fingerpicking en 3/4 (bajo–pulsación–pulsación) en tiempo',
        gotItWhen: 'a steady 3-count with the bass landing exactly on beat 1 every bar.',
        gotItWhen_es: 'un conteo de 3 constante con el bajo cayendo exactamente en el tiempo 1 de cada compás.',
        practice: { type: 'playSeq', label: '3/4 pattern on C', label_es: 'Patrón en 3/4 sobre C', bpm: 60, notes: [48, 55, 60] } },
      { id: 'm12w2-s2', text: 'Count and feel the difference between 3/4 and 4/4 while picking',
        text_es: 'Contar y sentir la diferencia entre 3/4 y 4/4 mientras punteas',
        gotItWhen: 'you can switch between counting in 3 and in 4 without losing the beat — the bass lands every third pluck instead of every fourth.',
        gotItWhen_es: 'puedes alternar entre contar en 3 y en 4 sin perder el tiempo — el bajo cae cada tres pulsaciones en lugar de cada cuatro.',
        practice: { type: 'mc', prompt: 'A waltz pattern repeats every:',
          prompt_es: 'Un patrón de vals se repite cada:',
          choices: ['2 beats', '3 beats', '4 beats', '8 beats'],
          choices_es: ['2 tiempos', '3 tiempos', '4 tiempos', '8 tiempos'], answer: 1,
          explain: 'A waltz is in 3/4 — you count ONE-two-three and start over, with the bass note on every ONE. Counting 4 is the easy slip, and it puts the bass in a different place every bar.',
          explain_es: 'Un vals va en 3/4 — cuentas UN-dos-tres y vuelves a empezar, con la nota del bajo en cada UNO. Contar en 4 es el error fácil, y deja el bajo en un lugar distinto en cada compás.' } },
      { id: 'm12w2-s3', text: 'Fingerpick "the cure"\'s shapes — its native style',
        text_es: 'Tocar con fingerpicking las formas de "the cure" — su estilo nativo',
        gotItWhen: 'the ◐ is gone — this IS how "the cure" wants to be played.',
        gotItWhen_es: 'el ◐ desaparece — así ES como "the cure" quiere que se toque.',
        practice: { type: 'playSeq', label: '"the cure" thumb targets — Am · C · Dm · F bass notes', label_es: 'Objetivos del pulgar en "the cure" — notas graves de Am · C · Dm · F', bpm: 60,
          notes: [45, 48, 50, 53] } },
      { id: 'm12w2-s4', text: 'Fingerpick "Let It Be"\'s C–G–Am–F with a pattern of my choice',
        text_es: 'Tocar con fingerpicking el C–G–Am–F de "Let It Be" con un patrón de mi elección',
        gotItWhen: 'one full lap with the pattern unbroken through all four chords of "Let It Be."',
        gotItWhen_es: 'una vuelta completa con el patrón sin interrupciones a través de los cuatro acordes de "Let It Be."',
        practice: { type: 'playSeq', label: '"Let It Be" thumb targets — C · G · Am · F bass notes', label_es: 'Objetivos del pulgar en "Let It Be" — notas graves de C · G · Am · F', bpm: 60,
          notes: [48, 43, 45, 53] } },
      { id: 'm12w2-s5', text: 'Keep my pattern unbroken through a 4-chord progression at 70 BPM',
        text_es: 'Mantener mi patrón sin interrupciones a través de una progresión de 4 acordes a 70 BPM',
        gotItWhen: 'the pattern stays unbroken through all four chords at 70 BPM or faster.',
        gotItWhen_es: 'el patrón se mantiene sin interrupciones a través de los cuatro acordes a 70 BPM o más rápido.',
        practice: { type: 'pr', prompt: '<ol><li>Fingerpick your chosen pattern through a 4-chord progression.</li><li>Start at 60 BPM and raise the metronome +5 at a time.</li><li>Log the fastest BPM where the pattern never broke.</li></ol>',
          prompt_es: '<ol><li>Toca tu patrón elegido con fingerpicking a través de una progresión de 4 acordes.</li><li>Empieza a 60 BPM y sube el metrónomo de 5 en 5.</li><li>Anota el BPM más rápido donde el patrón nunca se rompió.</li></ol>',
          unit: 'BPM', placeholder: 'e.g. 70 — try for a higher number next session', placeholder_es: 'p. ej. 70 — intenta superarlo la próxima sesión' } },
      { id: 'm12w2-s6', text: 'Play Happy Birthday\'s waltz feel fingerstyle',
        text_es: 'Tocar la sensación de vals de Happy Birthday con fingerstyle',
        gotItWhen: 'the waltz feel never breaks, start to finish.',
        gotItWhen_es: 'la sensación de vals nunca se rompe, de principio a fin.',
        practice: { type: 'mc', prompt: 'Happy Birthday is in 3/4. How does your bass–pluck–pluck pattern line up with the count?',
          prompt_es: 'Happy Birthday está en 3/4. ¿Cómo se alinea tu patrón bajo–pulsación–pulsación con el conteo?',
          choices: ['Thumb bass on 1, finger plucks on 2 and 3', 'Bass on every one of the three beats', 'Plucks on beats 1 and 2, bass on beat 3', 'Same as 4/4 — just play it a bit faster'],
          choices_es: ['Bajo del pulgar en el 1, pulsaciones en el 2 y el 3', 'Bajo en cada uno de los tres tiempos', 'Pulsaciones en los tiempos 1 y 2, bajo en el 3', 'Igual que en 4/4 — solo tócalo un poco más rápido'], answer: 0,
          explain: 'The waltz\'s "ONE-two-three" lives in the thumb: bass anchors beat 1, the plucks float on 2 and 3. Treating it like fast 4/4 is what erases the waltz feel.',
          explain_es: 'El "UN-dos-tres" del vals vive en el pulgar: el bajo ancla el tiempo 1, las pulsaciones flotan en el 2 y el 3. Tratarlo como un 4/4 rápido es lo que borra la sensación de vals.' } }
    ]
  },

  {
    id: 'm12w3',
    songThread: [{ name: '"Luna"', journey: 'tabs/luna.html', layer: 6, bonus: true, note: 'the fingerpicked requinto intro' }],
    label: 'Set 3',
    locked: false,
    module: 'Fingerstyle: Travis, Waltz & Requinto',
    moduleNum: 12,
    unit: 'Module 12 · Fingerstyle: Travis, Waltz & Requinto',
    unit_es: 'Módulo 12 · Fingerstyle: Travis, vals y requinto',
    title: 'Set 3',
    subtitle: 'Melody on top, thumb below · "Luna"\'s intro for real · Choose your performance voice',
    subtitle_es: 'Melodía arriba, pulgar abajo · La intro de "Luna" de verdad · Elige tu voz de interpretación',
    skillFocus: 'The requinto role in sierreño · Melody notes ride ABOVE the thumb bass · Pick the pattern you\'ll perform with',
    skillFocus_es: 'El papel del requinto en el sierreño · Las notas de la melodía viajan ENCIMA del bajo del pulgar · Elige el patrón con el que vas a interpretar',
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
                label: 'Watch: La Derrota requinto line', label_es: 'Mira: línea de requinto de La Derrota',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=cRJb_f4-M5g" target="_blank">La Derrota (Vicente Fernández) — requinto lesson, part 1 (English) – Jorge Aguilera</a> — a real requinto line from the ranchera tradition that sierreño (a Mexican acoustic-guitar style) grew out of, taught in English. Watch how his picking hand carries the melody a singer would otherwise have, then listen for the same job in "Luna" and "Está Dañada" from this module\'s song list.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=cRJb_f4-M5g" target="_blank">La Derrota (Vicente Fernández) — requinto lesson, part 1 (English) – Jorge Aguilera</a> — una línea de requinto real de la tradición ranchera de la que surgió el sierreño (un estilo de guitarra acústica mexicano), enseñada en inglés. Observa cómo su mano de pulsar lleva la melodía que de otro modo tendría un cantante, y luego escucha ese mismo papel en "Luna" y "Está Dañada" de la lista de canciones de este módulo.',
                hint: 'Requinto sings the melodic lines you\'ve been hearing in "Luna" since the course\'s first listening drills.',
                hint_es: 'El requinto canta las líneas melódicas que has estado escuchando en "Luna" desde los primeros ejercicios de escucha del curso.',
                skills: [3],
                response: { type: 'mc', prompt: 'In a sierreño group, the requinto is:',
                  prompt_es: 'En un grupo de sierreño, el requinto es:',
                  answer: 1,
                  explain: 'Requinto sings the melodic lines you\'ve been hearing in "Luna" since the course\'s first listening drills.',
                  explain_es: 'El requinto canta las líneas melódicas que has estado escuchando en "Luna" desde los primeros ejercicios de escucha del curso.',
                  choices: ['The bass instrument of the group', 'A smaller, higher-pitched guitar', 'The lead singer out in front', 'A drum that keeps the beat'],
                  choices_es: ['El instrumento de bajo del grupo', 'Una guitarra más pequeña y más aguda', 'El cantante principal al frente', 'Un tambor que marca el pulso'] }
              },
              {
                label: 'Watch: "Luna"\'s fingerpicked intro', label_es: 'Mira: la intro fingerstyle de "Luna"',
                text: 'Watch: <a href="tabs/luna.html#layer-6" target="_blank">"Luna"\'s Song Journey — Layer 6, the fingerpicked intro</a>. This on-site lesson shows the intro rolling through the little-F shape.',
                text_es: 'Mira: <a href="tabs/luna.html#layer-6" target="_blank">Recorrido de "Luna" — Capa 6, la intro con fingerpicking</a>. Esta lección del sitio muestra la intro en un floreo a través de la forma del F pequeño.',
                hint: 'Same little-F you learned in Module 5 — the intro arpeggiates it one note at a time, and leaves the high e open rather than fretted.',
                hint_es: 'El mismo F pequeño que aprendiste en el Módulo 5 — la intro lo arpegia una nota a la vez, y deja la mi aguda al aire en vez de trastearla.',
                skills: [1],
                response: { type: 'mc', prompt: '"Luna"\'s fingerpicked intro rolls through which chord shape?',
                  prompt_es: '¿La intro de "Luna" con fingerpicking hace un floreo a través de cuál forma de acorde?',
                  answer: 1,
                  explain: 'Same little-F you learned in Module 5 — the intro arpeggiates it one note at a time (Journey Layer 6). One change: it lets the high e ring OPEN instead of fretting it, so the four notes you roll are F · A · C · open E.',
                  explain_es: 'El mismo F pequeño que aprendiste en el Módulo 5 — la intro lo arpegia una nota a la vez (Recorrido, Capa 6). Un cambio: deja sonar la mi aguda AL AIRE en vez de trastearla, así que las cuatro notas del floreo son F · A · C · E al aire.',
                  choices: ['Full barre F with all six strings fretted', 'The little F shape with the high e open (xx3210)', 'Open C, all the way down at the nut', 'Am, fingers on the middle three strings'],
                  choices_es: ['F con cejilla completa, las seis cuerdas trasteadas', 'La forma del F pequeño con la mi aguda al aire (xx3210)', 'C al aire, hasta abajo junto a la cejuela', 'Am, con los dedos en las tres cuerdas centrales'] }
              }
            ]
          },
          {
            title: 'Listen for melody riding on top of a steady thumb',
            title_es: 'Escucha la melodía viajando encima de un pulgar constante',
            steps: [
              {
                label: 'Listen: melody on top', label_es: 'Escucha: melodía arriba',
                text: '"Melody on top" in fingerstyle means the melody is played on the thin, high strings while the thumb keeps the bass going underneath — two jobs, one hand. Listen for it in "Luna" or "Está Dañada".',
                text_es: '"Melodía arriba" en fingerstyle significa que la melodía se toca en las cuerdas delgadas y agudas mientras el pulgar mantiene el bajo sonando debajo — dos trabajos, una mano. Escúchalo en "Luna" o en "Está Dañada".',
                hint: 'Two jobs, one hand — the requinto texture in short.',
                hint_es: 'Dos trabajos, una mano — la textura del requinto en pocas palabras.',
                skills: [4],
                response: { type: 'mc', prompt: '"Melody on top" in fingerstyle means:',
                  prompt_es: '"Melodía arriba" en fingerstyle significa:',
                  answer: 1,
                  explain: 'The melody is played on the thin, high strings while the thumb keeps the bass going underneath.',
                  explain_es: 'La melodía se toca en las cuerdas delgadas y agudas mientras el pulgar mantiene el bajo sonando debajo.',
                  choices: ['Play only high notes, no bass at all', 'The melody rides on the thin, high strings', 'The melody comes first, chords after', 'Sing the melody while you play chords'],
                  choices_es: ['Tocar solo notas agudas, sin nada de bajo', 'La melodía va sobre las cuerdas delgadas y agudas', 'La melodía va primero, los acordes después', 'Cantar la melodía mientras tocas los acordes'] }
              }
            ]
          },
          {
            title: 'Try melody-on-top over C',
            title_es: 'Prueba melodía arriba sobre C',
            steps: [
              {
                label: 'Try melody on top over C', label_es: 'Prueba la melodía arriba sobre C',
                text: 'Now try it: over a C chord, keep the thumb on steady quarters and pick a 3-note melody on the high e and B strings on top.',
                text_es: 'Ahora pruébalo: sobre un acorde de C, mantén el pulgar en negras constantes y puntea una melodía de 3 notas en las cuerdas mi aguda y Si encima.',
                hint: 'Fingerpicking makes our regional-Mexican songs sound MORE authentic than power chords did — sierreño is an acoustic, fingerpicked tradition, and this is its real tone.',
                hint_es: 'El fingerpicking hace que nuestras canciones de música regional mexicana suenen MÁS auténticas de lo que sonaban con acordes de potencia — el sierreño es una tradición acústica de fingerpicking, y este es su verdadero sonido.',
                skills: [4, 5],
                response: { type: 'mc', prompt: 'Why does fingerstyle make our regional-Mexican songs sound MORE authentic than power chords did?',
                  prompt_es: '¿Por qué el fingerstyle hace que nuestras canciones de música regional mexicana suenen MÁS auténticas de lo que sonaban con acordes de potencia?',
                  answer: 1,
                  explain: 'Sierreño is an acoustic, fingerpicked tradition — this is its real tone.',
                  explain_es: 'El sierreño es una tradición acústica de fingerpicking — este es su verdadero sonido.',
                  choices: ['It\'s louder than power chords ever were', 'Sierreño is an acoustic, fingerpicked tradition', 'It isn\'t — the two sound exactly the same', 'Distortion is illegal on these songs'],
                  choices_es: ['Es más fuerte de lo que fueron los acordes de potencia', 'El sierreño es una tradición acústica de fingerpicking', 'No es así — los dos suenan exactamente igual', 'La distorsión es ilegal en estas canciones'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Station wrap-up', label_es: 'Cierre de la estación',
                text: 'Station Wrap-Up — pause and think: what does the requinto add to a sierreño song that strummed chords alone can\'t?',
                text_es: 'Cierre de la estación — pausa y piensa: ¿qué le aporta el requinto a una canción de sierreño que los acordes rasgueados por sí solos no pueden?',
                response: { type: 'short', placeholder: 'e.g. the melody — it sings the line a voice would carry',
                  placeholder_es: 'p. ej. la melodía — canta la línea que llevaría una voz' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — requinto texture & your performance pattern',
        title_es: 'Estación de práctica — la textura del requinto y tu patrón de interpretación',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            title_es: 'Calentamiento — revisión de afinación (Módulo 1)',
            steps: [
              {
                label: 'Warm-up: tuning check', label_es: 'Calentamiento: afinación',
                text: 'Start every practice session the same way:<ol><li>Tune all 6 strings to green (E A D G B e).</li><li>Play each string open.</li></ol>You\'ve got it when: in tune before today\'s work.',
                text_es: 'Empieza cada sesión de práctica de la misma manera:<ol><li>Afina las 6 cuerdas hasta que estén en verde (E A D G B e).</li><li>Toca cada cuerda al aire.</li></ol>Lo tienes cuando: estás afinado antes del trabajo de hoy.',
                hint: 'Fingerpicking exposes every note — an out-of-tune string is easy to hear.',
                hint_es: 'El fingerpicking expone cada nota — una cuerda desafinada se escucha fácilmente.',
                playSeq: { label: 'Hear all 6 strings in tune', label_es: 'Escucha las 6 cuerdas afinadas', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Play "Luna"\'s fingerpicked intro',
            title_es: 'Toca la intro de "Luna" con fingerpicking',
            steps: [
              {
                label: 'Challenge 1 — "Luna" Intro', label_es: 'Reto 1 — Intro de "Luna"',
                text: '<ul><li>Play the Layer 6 rolls from <a href="tabs/luna.html#layer-6" target="_blank">"Luna"\'s Song Journey page</a>, slow then at tempo.</li></ul>You\'ve got it when: all notes ring cleanly in order at performance tempo.',
                text_es: '<ul><li>Toca los floreos de la Capa 6 en la <a href="tabs/luna.html#layer-6" target="_blank">página del Recorrido de "Luna"</a>, despacio y luego a tempo.</li></ul>Lo tienes cuando: todas las notas suenan limpias en orden al tempo de interpretación.',
                hint: 'This roll uses the little-F shape you already know from Module 5.',
                hint_es: 'Este floreo usa la forma del F pequeño que ya conoces del Módulo 5.',
                stuck: 'Fret the little F shape, strum it once to hear the target chord, then break it apart one string at a time.',
                stuck_es: 'Trastea la forma del F pequeño, rasguéala una vez para escuchar el acorde objetivo, y luego desármala una cuerda a la vez.',
                levelUp: 'Play it twice through without stopping, or add it as your performance intro.',
                levelUp_es: 'Tócala dos veces seguidas sin detenerte, o agrégala como tu intro de interpretación.',
                skills: [1]
              }
            ]
          },
          {
            title: 'Play "Está Dañada"\'s requinto intro line',
            title_es: 'Toca la línea de requinto de la intro de "Está Dañada"',
            steps: [
              {
                label: 'Challenge 2 — "Está Dañada" Requinto Line', label_es: 'Reto 2 — Línea de requinto de "Está Dañada"',
                text: '<ul><li>Play the song\'s requinto intro line fingerstyle, following the "Está Dañada" tutorial video in this module\'s Songs section at the bottom of the page.</li></ul>You\'ve got it when: the line rings clean and in time.',
                text_es: '<ul><li>Toca con fingerstyle la línea de requinto de la intro de la canción, siguiendo el video tutorial de "Está Dañada" en la sección de Canciones de este módulo, al final de la página.</li></ul>Lo tienes cuando: la línea suena limpia y en tiempo.',
                hint: 'This is the real sierreño sound — a smaller, higher-pitched guitar carrying the melody. The line slides between notes on the thin strings instead of strumming chords.',
                hint_es: 'Este es el sonido real del sierreño — una guitarra más pequeña y aguda que lleva la melodía. La línea se desliza entre notas en las cuerdas delgadas en lugar de rasguear acordes.',
                stuck: 'Slow the line down to half tempo and isolate just the first 4 notes. Get those clean before adding the slide.',
                stuck_es: 'Baja la línea a la mitad del tempo y aísla solo las primeras 4 notas. Lógralas limpias antes de agregar el deslizamiento.',
                levelUp: 'Play it at full tempo, or loop it under the recording.',
                levelUp_es: 'Tócala a tempo completo, o repítela en bucle junto con la grabación.',
                skills: [2]
              }
            ]
          },
          {
            title: 'Blend melody over a steady thumb',
            title_es: 'Combina melodía sobre un pulgar constante',
            steps: [
              {
                label: 'Challenge 3 — 3-Note Melody over C', label_es: 'Reto 3 — Melodía de 3 notas sobre C',
                text: 'Over a C chord:<ul><li>Keep the thumb going in steady quarters.</li><li>Pick a 3-note melody on the high e and B strings above it.</li></ul>You\'ve got it when: the thumb never wavers while the melody rides on top.',
                text_es: 'Sobre un acorde de C:<ul><li>Mantén el pulgar sonando en negras constantes.</li><li>Puntea una melodía de 3 notas en las cuerdas mi aguda y Si encima.</li></ul>Lo tienes cuando: el pulgar nunca vacila mientras la melodía viaja arriba.',
                hint: 'Two jobs, one hand — the requinto texture in short.',
                hint_es: 'Dos trabajos, una mano — la textura del requinto en pocas palabras.',
                stuck: 'Isolate the thumb alone first, then add just one melody note at a time.',
                stuck_es: 'Aísla solo el pulgar primero, y luego agrega una sola nota de melodía a la vez.',
                levelUp: 'Extend the melody to 6 notes without losing the thumb.',
                levelUp_es: 'Extiende la melodía a 6 notas sin perder el pulgar.',
                skills: [4]
              }
            ]
          },
          {
            title: 'Choose your performance pattern',
            title_es: 'Elige tu patrón de interpretación',
            steps: [
              {
                label: 'Challenge 4 — Choose Your Pattern', label_es: 'Reto 4 — Elige tu patrón',
                text: '<ol><li>Run ALL patterns learned this course (6-note · Travis · pinch · 3/4) over one chord.</li><li>Pick one and write it in the box below.</li></ol>You\'ve got it when: you\'ve named the pattern you\'ll perform with.',
                text_es: '<ol><li>Corre TODOS los patrones aprendidos en este curso (6 notas · Travis · pellizco · 3/4) sobre un acorde.</li><li>Elige uno y escríbelo en el cuadro de abajo.</li></ol>Lo tienes cuando: has nombrado el patrón con el que vas a interpretar.',
                hint: 'The smartest choice is the one you can keep unbroken at performance tempo TODAY — not the hardest one.',
                hint_es: 'La elección más inteligente es la que puedes mantener sin interrupciones al tempo de interpretación HOY — no la más difícil.',
                stuck: 'If none feel ready, default to the 6-note pattern from Module 8 — it\'s the most forgiving.',
                stuck_es: 'Si ninguno se siente listo, recurre por defecto al patrón de 6 notas del Módulo 8 — es el más indulgente.',
                levelUp: 'Practice your chosen pattern at 10 BPM above your current comfortable tempo.',
                levelUp_es: 'Practica tu patrón elegido a 10 BPM por encima de tu tempo cómodo actual.',
                skills: [5],
                response: { type: 'short', placeholder: 'e.g. Travis with a pinch on beat 1 — steady at 65 BPM today',
                  placeholder_es: 'p. ej. Travis con un pellizco en el tiempo 1 — firme a 65 BPM hoy' }
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — Full-Verse Rehearsal (your assessment piece)', label_es: 'Reto — Ensayo de la estrofa completa (tu pieza de evaluación)',
                text: '<ul><li>Play one complete fingerpicked verse of your performance song, no stopping, mistakes recovered.</li></ul>You\'ve got it when: you reach the last bar without stopping.',
                text_es: '<ul><li>Toca una estrofa completa con fingerpicking de tu canción de interpretación, sin detenerte, recuperándote de los errores.</li></ul>Lo tienes cuando: llegas al último compás sin detenerte.',
                hint: 'Performances reward reliability, not difficulty — pick the pattern that never breaks, then make it musical.',
                hint_es: 'Las interpretaciones premian la confiabilidad, no la dificultad — elige el patrón que nunca se rompe, y luego hazlo musical.',
                stuck: 'Slow the whole verse down until you can finish it clean, even at half speed.',
                stuck_es: 'Baja el tempo de toda la estrofa hasta que puedas terminarla limpia, aunque sea a la mitad de la velocidad.',
                levelUp: 'Record a performance take, or play it for someone at home.',
                levelUp_es: 'Graba una toma de interpretación, o tócala para alguien en casa.',
                skills: [6]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: your performance song', label_es: 'Cierre: tu canción de interpretación',
                text: 'Name your performance song and pattern — and the one spot you\'ll drill this week. Write it below.',
                text_es: 'Nombra tu canción y patrón de interpretación — y el único punto que vas a practicar esta semana. Escríbelo abajo.',
                response: { type: 'short', placeholder: 'e.g. "the cure," 6-note pattern — the Dm-to-F change still stumbles',
                  placeholder_es: 'p. ej. "the cure," patrón de 6 notas — el cambio de Dm a F todavía tropieza' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Plays the "Luna" intro rolls · Blends melody over a steady thumb · Performs one full fingerpicked verse, recovering from mistakes',
      goal_es: 'Toca los floreos de la intro de "Luna" · Combina melodía sobre un pulgar constante · Interpreta una estrofa completa con fingerpicking, recuperándose de errores',
      performance: 'Mini-performance, solo edition: record one verse, listen back, and name one strength + one target yourself — and share the recording with someone if you like.',
      selfCheck: 'Can you keep the thumb going while the melody enters? Did you finish the verse even where you slipped?',
      selfCheck_es: '¿Puedes mantener el pulgar sonando mientras entra la melodía? ¿Terminaste la estrofa incluso donde te resbalaste?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Cn.11a']
    },

    skills: [
      { id: 'm12w3-s1', text: 'Play "Luna"\'s fingerpicked intro (Journey Layer 6) with p-i-m-a rolls',
        text_es: 'Tocar la intro de "Luna" con fingerpicking (Recorrido, Capa 6) con floreos p-i-m-a',
        gotItWhen: 'all notes of the "Luna" intro ring cleanly in order at performance tempo.',
        gotItWhen_es: 'todas las notas de la intro de "Luna" suenan limpias en orden al tempo de interpretación.',
        practice: { type: 'playSeq', label: '"Luna" requinto intro — little-F roll (D3 · G2 · B1 · open e)', label_es: 'Intro de requinto de "Luna" — floreo del F pequeño (D3 · G2 · B1 · e al aire)', bpm: 60,
          notes: [53, 57, 60, 64] } },
      { id: 'm12w3-s2', text: 'Play "Está Dañada"\'s requinto intro line fingerstyle',
        text_es: 'Tocar la línea de requinto de la intro de "Está Dañada" con fingerstyle',
        gotItWhen: 'the "Está Dañada" line rings clean and in time.',
        gotItWhen_es: 'la línea de "Está Dañada" suena limpia y en tiempo.',
        practice: { type: 'pr', prompt: '<ol><li>Learn the "Está Dañada" intro line from the tutorial.</li><li>Play it top to bottom and count your clean, no-stop passes.</li><li>Log your best.</li></ol>',
          prompt_es: '<ol><li>Aprende la línea de la intro de "Está Dañada" con el tutorial.</li><li>Tócala de principio a fin y cuenta tus pasadas limpias y sin paradas.</li><li>Anota tu mejor número.</li></ol>',
          unit: 'count', placeholder: 'e.g. 3 clean passes — try for a higher number', placeholder_es: 'p. ej. 3 pasadas limpias — intenta superarlo' } },
      { id: 'm12w3-s3', text: 'Explain the requinto\'s role in sierreño / corridos tumbados (a modern Mexican regional style)',
        text_es: 'Explicar el papel del requinto en el sierreño / los corridos tumbados (un estilo regional mexicano moderno)',
        gotItWhen: 'you can explain that the requinto carries the melodic lead lines — the role you\'ve heard in "Luna."',
        gotItWhen_es: 'puedes explicar que el requinto lleva las líneas melódicas principales — el papel que has escuchado en "Luna."',
        practice: { type: 'mc', prompt: 'The requinto\'s job in the group is:',
          prompt_es: 'El trabajo del requinto en el grupo es:',
          choices: ['Strumming the rhythm chords', 'The melodic lead lines', 'Bass', 'Percussion'],
          choices_es: ['Rasguear los acordes de ritmo', 'Las melodías principales', 'El bajo', 'La percusión'], answer: 1,
          explain: 'The requinto is the small, higher-pitched guitar that sings the melody lines over the group — the part you hear in "Luna." Rhythm chords and bass are other players\' jobs.',
          explain_es: 'El requinto es la guitarra pequeña y más aguda que canta las líneas melódicas sobre el grupo — la parte que escuchas en "Luna". Los acordes de ritmo y el bajo son trabajo de otros músicos.' } },
      { id: 'm12w3-s4', text: 'Blend melody notes into a picking pattern — tune on top, thumb bass below',
        text_es: 'Combinar notas de melodía en un patrón de punteo — melodía arriba, bajo del pulgar debajo',
        gotItWhen: 'the thumb never wavers while the melody rides on top.',
        gotItWhen_es: 'el pulgar nunca vacila mientras la melodía viaja arriba.',
        practice: { type: 'mc', prompt: 'You\'re blending a tune into your picking pattern, requinto-style. Where do the melody notes go?',
          prompt_es: 'Estás combinando una melodía en tu patrón de punteo, al estilo requinto. ¿Dónde van las notas de la melodía?',
          choices: ['On the high strings, riding above the thumb\'s steady bass', 'In the bass — the thumb carries the tune', 'On whichever string has a free finger', 'You pause the bass whenever the melody plays'],
          choices_es: ['En las agudas, encima del bajo constante del pulgar', 'En el bajo — el pulgar lleva la melodía', 'En la cuerda que tenga un dedo libre', 'Pausas el bajo cada vez que suena la melodía'], answer: 0,
          explain: 'Two jobs, one hand: the thumb never stops the bass, and i-m-a sing the tune on top. Stopping the bass for the melody is the habit this skill breaks.',
          explain_es: 'Dos trabajos, una mano: el pulgar nunca detiene el bajo, e i-m-a cantan la melodía encima. Detener el bajo para la melodía es el hábito que esta destreza rompe.' } },
      { id: 'm12w3-s5', text: 'Choose and name the picking pattern I\'ll perform with',
        text_es: 'Elegir y nombrar el patrón de punteo con el que voy a interpretar',
        gotItWhen: 'you\'ve named the pattern you\'ll perform with — the one you can already hold unbroken at performance tempo.',
        gotItWhen_es: 'has nombrado el patrón con el que vas a interpretar — el que ya puedes mantener sin interrupciones al tempo de interpretación.',
        practice: { type: 'mc', prompt: 'Your performance pattern should be the one that:',
          prompt_es: 'Tu patrón de interpretación debería ser el que:',
          choices: ['Impresses the audience the most', 'Never breaks at performance tempo', 'Uses all four picking fingers', 'Is the newest one you learned'],
          choices_es: ['Impresiona más al público', 'Nunca se rompe al tempo de interpretación', 'Usa los cuatro dedos de la mano de punteo', 'Es el más nuevo que aprendiste'], answer: 1,
          explain: 'What an audience hears is steadiness, so pick the pattern you can hold at full speed without stumbling. The flashiest or newest pattern is the one most likely to break down while you perform.',
          explain_es: 'Lo que el público escucha es la constancia, así que elige el patrón que puedes mantener a toda velocidad sin tropezar. El patrón más vistoso o más nuevo es el que más probablemente se rompe mientras interpretas.' } },
      { id: 'm12w3-s6', text: 'Perform one full fingerpicked verse start to finish, recovering from any mistake',
        text_es: 'Interpretar una estrofa completa con fingerpicking de principio a fin, recuperándose de cualquier error',
        gotItWhen: 'you reach the last bar without stopping — slips allowed, stops not.',
        gotItWhen_es: 'llegas al último compás sin detenerte — se permiten resbalones, no detenerse.',
        practice: { type: 'pr', prompt: 'Perform your fingerpicked verse start to finish — slips allowed, stops not. How many complete no-stop runs did you get today?',
          prompt_es: 'Interpreta tu estrofa con fingerpicking de principio a fin — se permiten resbalones, no detenerse. ¿Cuántas pasadas completas sin paradas lograste hoy?',
          unit: 'count', placeholder: 'e.g. 2 runs — try for a higher number', placeholder_es: 'p. ej. 2 pasadas — intenta superarlo' } }
    ]
  }

); // end module-12.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[12] = [
      { name: '"the cure" — Olivia Rodrigo', meta: 'Full fingerpicked verse — its native style, so the ◐ mark (our flag for a song played against its natural style) comes off', meta_es: 'Estrofa completa con fingerpicking — su estilo nativo, así que la marca ◐ (nuestra señal para una canción tocada en contra de su estilo natural) desaparece', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Let It Be" — The Beatles', meta: 'Arpeggiated C–G–Am–F with your chosen pattern', meta_es: 'C–G–Am–F arpegiado con el patrón que elijas', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=_Kw4subj5z8' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'The fingerpicked intro — rolls through the little-F shape', meta_es: 'La intro con fingerpicking — floreos a través de la forma del F pequeño', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"House of the Rising Sun" — The Animals', meta: 'Bass note + rolling arpeggio in 6/8 — the fingerpicking classic', meta_es: 'Nota grave + arpegio en floreo en 6/8 — el clásico del fingerpicking', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=q9dyAQLYybU' },
      { name: '"Está Dañada" — Iván Cornejo', meta: 'Requinto intro line, fingerstyle — the real sierreño sound', meta_es: 'Línea de requinto de la intro, con fingerstyle — el sonido real del sierreño', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=rBLLbgD0FsM',
        tutorialUrl: 'https://www.youtube.com/watch?v=DjSzkgEeddc' },
      { name: '"Sailor Song" — Gigi Perez', meta: 'Fingerpicked verse, capo IV — pattern endurance', meta_es: 'Estrofa con fingerpicking, capo en el traste 4 — resistencia del patrón', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=1lrFsXkT_rM',
        tutorialUrl: 'https://www.youtube.com/watch?v=rpoyXduMZZw&end=551' },
      { name: '"Blackbird" — The Beatles', meta: 'The capstone challenge — pinches and moving shapes', meta_es: 'El reto final del curso — pellizcos y formas en movimiento', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=Man4Xw8Xypo',
        tutorialUrl: 'https://www.youtube.com/watch?v=Qqw15309knU' },
      { name: '"Just Like Heaven" — The Cure', meta: 'Turn the arpeggiated riff (short repeated phrase) into a picking pattern', meta_es: 'Convierte el riff arpegiado (frase corta repetida) en un patrón de punteo', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=n3nPiBai66M',
        tutorialUrl: 'https://www.youtube.com/watch?v=fEgsKS_IcQA&start=98&end=587' }
    ];

MODULE_REVIEWS[12] = {
  moduleNum: 12,
  module: 'Fingerstyle: Travis, Waltz & Requinto',
  module_es: 'Fingerstyle: Travis, vals y requinto',
  skills: [
    { id: 'mr12-s1', text: 'I can hold a steady alternating thumb-bass in quarter notes for 8 bars without it stumbling', text_es: 'Puedo mantener un bajo del pulgar alternante y constante en negras durante 8 compases sin que tropiece', set: 'm12w1' },
    { id: 'mr12-s2', text: 'I can play a clean pinch — thumb and finger landing together — right on the downbeat', text_es: 'Puedo tocar un pellizco limpio — pulgar y dedo cayendo juntos — justo en el tiempo fuerte', set: 'm12w1' },
    { id: 'mr12-s3', text: 'I can pick a 3/4 waltz pattern (bass–pluck–pluck) in time, bass always landing on beat 1', text_es: 'Puedo puntear un patrón de vals en 3/4 (bajo–pulsación–pulsación) en tiempo, con el bajo cayendo siempre en el tiempo 1', set: 'm12w2' },
    { id: 'mr12-s4', text: 'I can fingerpick "the cure" or "Let It Be" in its native style with the pattern unbroken', text_es: 'Puedo tocar "the cure" o "Let It Be" con fingerpicking en su estilo nativo con el patrón sin interrupciones', set: 'm12w2' },
    { id: 'mr12-s5', text: 'I can blend a melody on top of a steady thumb bass — the requinto texture', text_es: 'Puedo combinar una melodía encima de un bajo de pulgar constante — la textura del requinto', set: 'm12w3' },
    { id: 'mr12-s6', text: 'I can perform one full fingerpicked verse start to finish, recovering from any mistake without stopping', text_es: 'Puedo interpretar una estrofa completa con fingerpicking de principio a fin, recuperándome de cualquier error sin detenerme', set: 'm12w3' }
  ],
  assessItems: [
    'Play one full fingerpicked verse with a steady thumb bass and a clean, unbroken finger pattern — flagship options: "the cure" or "Let It Be"',
    'Show your chosen performance pattern and name it'
  ],
  assessItems_es: [
    'Toca una estrofa completa con fingerpicking con un bajo de pulgar constante y un patrón de dedos limpio y sin interrupciones — opciones destacadas: "the cure" o "Let It Be"',
    'Muestra tu patrón de interpretación elegido y nómbralo'
  ],
  forward: 'Twelve modules — the whole toolkit, twice as deep as most first-year players ever get. <strong>Module 13 teaches the one hands-on skill every guitarist eventually needs:</strong> changing a string safely, seating it at the bridge, winding it clean at the post, and tuning it so it holds pitch. After that, the next song is your call: pick one, pick your lane — strummed, fingerpicked, or riff + solo — and get it performance-ready the way you now know how, whether that ends in a recording, a room full of people, or just you playing it right. This website got you here; the stage is yours. Keep a list of the songs you want to learn, and go learn them — you know how now.',
  forward_es: 'Doce módulos — el kit de herramientas completo, el doble de profundo de lo que la mayoría de los guitarristas de primer año llegan a alcanzar. <strong>El Módulo 13 enseña la destreza práctica que todo guitarrista termina necesitando:</strong> cambiar una cuerda de forma segura, asentarla en el puente, enrollarla limpia en la clavija, y afinarla para que se mantenga en tono. Después de eso, la siguiente canción la eliges tú: escoge una, escoge tu camino — rasgueada, con fingerpicking, o riff + solo — y déjala lista para interpretar como ya sabes hacerlo, ya sea que termine en una grabación, en un cuarto lleno de gente, o simplemente en ti tocándola bien. Este sitio web te trajo hasta aquí; el escenario es tuyo. Guarda una lista de las canciones que quieres aprender, y ve a aprenderlas — ya sabes cómo.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Cn.11a']
};
