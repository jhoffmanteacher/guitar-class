// ============================================================
//  MODULE 11 — Chords, Keys & Harmony
//  Edit this file to change Module 11 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm11w1',
    label: 'Set 1',
    locked: false,
    module: 'Chords, Keys & Harmony',
    moduleNum: 11,
    unit: 'Module 11 · Chords, Keys & Harmony',
    unit_es: 'Módulo 11 · Acordes, tonalidades y armonía',
    title: 'Set 1',
    subtitle: 'Stack every other note · I ii iii IV V vi · The chord family of a key',
    subtitle_es: 'Apila cada otra nota · I ii iii IV V vi · La familia de acordes de una tonalidad',
    skillFocus: 'Triad = root + 3rd + 5th · UPPERCASE major (I IV V), lowercase minor (ii iii vi) · The diatonic family (chords built only from the key\'s own seven notes)',
    skillFocus_es: 'Tríada = raíz + 3ª + 5ª · Mayor en MAYÚSCULAS (I IV V), menor en minúsculas (ii iii vi) · La familia diatónica (acordes construidos solo con las siete notas propias de la tonalidad)',
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
                label: 'Watch: chords in any key', label_es: 'Mira: acordes en cualquier tonalidad',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=jGh2Erg-o8E" target="_blank">Encontrar los acordes en cualquier tonalidad – Maru Martinez (0:00–7:27)</a> (in Spanish — turn on English captions if you need them; the on-screen diagrams carry the lesson). Watch how she builds a chord on every note of the scale — that\'s the "chord family" you\'ll be naming with Roman numerals today.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=jGh2Erg-o8E" target="_blank">Encontrar los acordes en cualquier tonalidad – Maru Martinez (0:00–7:27)</a> (en español — activa los subtítulos en inglés si los necesitas; los diagramas en pantalla llevan la lección). Mira cómo ella construye un acorde en cada nota de la escala — esa es la "familia de acordes" que vas a nombrar con números romanos hoy.',
                hint: 'Every chord you\'ve ever strummed is built from a scale — today you learn the recipe that turns one scale into a whole family of chords.',
                hint_es: 'Cada acorde que has rasgueado alguna vez se construye a partir de una escala — hoy aprendes la receta que convierte una escala en toda una familia de acordes.',
                skills: [1],
                response: { type: 'mc', prompt: 'A triad is built by stacking:',
                  prompt_es: 'Una tríada se construye apilando:',
                  answer: 1,
                  explain: 'Skip-a-note, skip-a-note: C-E-G makes the C chord. Every chord you\'ve strummed is one of these plus doubled notes.',
                  explain_es: 'Salta una nota, salta una nota: C-E-G arma el acorde de C. Cada acorde que has rasgueado es uno de estos más notas duplicadas.',
                  choices: ['Any three notes', 'Every other note of a scale: root, 3rd, 5th', 'Three notes on one string', 'The same note in three octaves'],
                  choices_es: ['Cualquier tres notas', 'Cada otra nota de una escala: raíz, 3ª, 5ª', 'Tres notas en una sola cuerda', 'La misma nota en tres octavas'] }
              },
              {
                label: 'Watch: how chords are built', label_es: 'Mira: cómo se construyen los acordes',
                text: 'Watch: <a href="https://youtu.be/BIWEcDGB5lA" target="_blank">Understanding CHORDS (Ep. 3 Music Theory) – Paul Davids</a>. Every chord you\'ve ever strummed is built from the same three notes — root, 3rd, 5th — and Paul shows where they come from. A different teacher than the first video on purpose: notice which explanation makes the most sense to you.',
                text_es: 'Mira: <a href="https://youtu.be/BIWEcDGB5lA" target="_blank">Understanding CHORDS (Ep. 3 Music Theory) – Paul Davids</a>. Cada acorde que has rasgueado alguna vez se construye con las mismas tres notas — raíz, 3ª, 5ª — y Paul muestra de dónde vienen. Un maestro distinto al del primer video a propósito: fíjate cuál explicación tiene más sentido para ti.',
                hint: 'Notice the pattern: three of the seven chords in a key come out major, and three come out minor — no exceptions, in any key.',
                hint_es: 'Fíjate en el patrón: tres de los siete acordes de una tonalidad salen mayores, y tres salen menores — sin excepciones, en cualquier tonalidad.',
                skills: [2],
                response: { type: 'mc', prompt: 'In any major key, chords I, IV, and V are major. Chords ii, iii, and vi are:',
                  prompt_es: 'En cualquier tonalidad mayor, los acordes I, IV y V son mayores. Los acordes ii, iii y vi son:',
                  answer: 1,
                  explain: 'The scale\'s spacing makes it automatic — uppercase numerals = major, lowercase = minor.',
                  explain_es: 'El espaciado de la escala lo hace automático — números romanos en mayúscula = mayor, en minúscula = menor.',
                  choices: ['Also major', 'Minor', 'Power chords', 'Silent'],
                  choices_es: ['También mayores', 'Menores', 'Acordes de potencia', 'Silenciosos'] }
              }
            ]
          },
          {
            title: 'Listen for the numerals in a familiar song',
            title_es: 'Escucha los números romanos en una canción conocida',
            steps: [
              {
                label: 'Numerals in "Let It Be"', label_es: 'Números romanos en "Let It Be"',
                text: 'Listen for it: play through "Let It Be"\'s C–G–Am–F loop and, before checking, guess which numeral each chord is in the key of C.',
                text_es: 'Escucha con atención: toca el loop C–G–Am–F de "Let It Be" y, antes de revisar, adivina qué número romano es cada acorde en la tonalidad de C.',
                hint: 'C is home (I), so everything else numbers off of it — G is a fifth up, Am shares C\'s notes, F is a fourth up.',
                hint_es: 'C es la base (I), así que todo lo demás se numera a partir de ella — G es una quinta arriba, Am comparte las notas de C, F es una cuarta arriba.',
                skills: [3],
                response: { type: 'mc', prompt: '"Let It Be"\'s C–G–Am–F in the key of C is:',
                  prompt_es: 'El C–G–Am–F de "Let It Be" en la tonalidad de C es:',
                  answer: 1,
                  explain: 'C=I, G=V, Am=vi, F=IV — the most-used progression in pop history, and now you can name it.',
                  explain_es: 'C=I, G=V, Am=vi, F=IV — la progresión más usada en la historia del pop, y ahora puedes nombrarla.',
                  choices: ['I–IV–V–I', 'I–V–vi–IV', 'ii–V–I–IV', 'vi–IV–I–V'],
                  choices_es: ['I–IV–V–I', 'I–V–vi–IV', 'ii–V–I–IV', 'vi–IV–I–V'] }
              }
            ]
          },
          {
            title: 'Try building a chord family',
            title_es: 'Prueba a construir una familia de acordes',
            steps: [
              {
                label: 'Build triads up the C scale', label_es: 'Construye tríadas en la escala de C',
                text: 'Now try it: build a triad on every note of the C major scale (C-D-E-F-G-A-B) and see which come out major and which come out minor.',
                text_es: 'Ahora pruébalo: construye una tríada en cada nota de la escala de C mayor (C-D-E-F-G-A-B) y observa cuáles salen mayores y cuáles salen menores.',
                hint: 'You\'ll get major-minor-minor-major-major-minor-diminished — the same pattern in every major key.',
                hint_es: 'Obtendrás mayor-menor-menor-mayor-mayor-menor-disminuido — el mismo patrón en cualquier tonalidad mayor.',
                skills: [4, 5],
                response: { type: 'mc', prompt: 'The chord family of C major is:',
                  prompt_es: 'La familia de acordes de C mayor es:',
                  answer: 0,
                  explain: 'Build a triad on each scale note: major-minor-minor-major-major-minor, in every major key.',
                  explain_es: 'Construye una tríada en cada nota de la escala: mayor-menor-menor-mayor-mayor-menor, en cualquier tonalidad mayor.',
                  choices: ['C · Dm · Em · F · G · Am', 'C · D · E · F · G · A', 'Cm · Dm · Em · Fm · Gm · Am', 'C · Dm · E · F · Gm · Am'],
                  choices_es: ['C · Dm · Em · F · G · Am', 'C · D · E · F · G · A', 'Cm · Dm · Em · Fm · Gm · Am', 'C · Dm · E · F · Gm · Am'] }
              },
              {
                label: '"Luna": place Am in the key of F', label_es: '"Luna": ubica Am en la tonalidad de F',
                text: 'Try it on "Luna": F and Am aren\'t I–IV or I–V — figure out which scale degree Am is built on in the key of F before checking.',
                text_es: 'Pruébalo con "Luna": F y Am no son I–IV ni I–V — averigua sobre cuál grado de la escala está construido Am en la tonalidad de F antes de revisar.',
                hint: 'Count up the F major scale: F(I) G(ii) A(iii) — Am is built on the THIRD note.',
                hint_es: 'Cuenta hacia arriba en la escala de F mayor: F(I) G(ii) A(iii) — Am está construido sobre la TERCERA nota.',
                skills: [6],
                response: { type: 'mc', prompt: '"Luna" vamps between F and Am — a vamp is a short chord pattern repeated over and over — in the key of F. In numerals that\'s:',
                  prompt_es: '"Luna" hace un vamp entre F y Am — un vamp es un patrón corto de acordes repetido una y otra vez — en la tonalidad de F. En números romanos eso es:',
                  answer: 2,
                  explain: 'F=I and Am is built on F major\'s THIRD note — I–iii, a dreamier color than the famous four. Not every hit uses I–V–vi–IV.',
                  explain_es: 'F=I y Am está construido sobre la TERCERA nota de F mayor — I–iii, un color más soñador que los famosos cuatro. No todo éxito usa I–V–vi–IV.',
                  choices: ['I–vi', 'I–IV', 'I–iii', 'V–I'],
                  choices_es: ['I–vi', 'I–IV', 'I–iii', 'V–I'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: your song\'s home chord', label_es: 'Cierre: el acorde base de tu canción',
                text: 'Station Wrap-Up — pick any core song: which numeral is its home chord, and is it major or minor?',
                text_es: 'Cierre de la estación — elige cualquier canción principal: ¿qué número romano es su acorde base, y es mayor o menor?',
                response: { type: 'short', placeholder: 'e.g. "Watchtower"\'s home is Am — the vi of C, or "i" if you call the key A minor',
                  placeholder_es: 'p. ej. la base de "Watchtower" es Am — el vi de C, o "i" si llamas a la tonalidad A menor' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — triads and numerals',
        title_es: 'Estación de práctica — tríadas y números romanos',
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
            title: 'Build and play a chord family',
            title_es: 'Construye y toca una familia de acordes',
            steps: [
              {
                label: 'Challenge 1 — Build the Family', label_es: 'Reto 1 — Construye la familia',
                text: '<ol><li>Write out the chord families of C major and G major (six chords each) — type them below.</li><li>Play each family as open chords in order.</li></ol>',
                text_es: '<ol><li>Escribe las familias de acordes de C mayor y G mayor (seis acordes cada una) — anótalas abajo.</li><li>Toca cada familia como acordes abiertos en orden.</li></ol>',
                hint: 'C family: C · Dm · Em · F · G · Am. G family: G · Am · Bm · C · D · Em. Notice how much they overlap — that\'s no accident.',
                hint_es: 'Familia de C: C · Dm · Em · F · G · Am. Familia de G: G · Am · Bm · C · D · Em. Fíjate cuánto se superponen — eso no es casualidad.',
                stuck: 'Just play the C family first and get it solid before adding G.',
                stuck_es: 'Toca primero solo la familia de C y déjala firme antes de agregar G.',
                levelUp: 'Play both families back to back without looking at what you wrote.',
                levelUp_es: 'Toca ambas familias una tras otra sin mirar lo que escribiste.',
                skills: [4, 5],
                response: { type: 'short', placeholder: 'C: C Dm Em F G Am · G: …', placeholder_es: 'C: C Dm Em F G Am · G: …' },
                chords: [
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'Dm', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,3,'3'],[1,1,'1']], position: 0 },
                  { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'D', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 },
                  { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Numeral flashcards',
            title_es: 'Tarjetas de números romanos',
            steps: [
              {
                label: 'Challenge 2 — Numeral Flashcards', label_es: 'Reto 2 — Tarjetas de números romanos',
                text: '<ol><li>Run the numeral deck below and play each chord it deals you in the key of C — no hesitating.</li><li>Run the deck twice.</li></ol>',
                text_es: '<ol><li>Corre la baraja de números romanos de abajo y toca cada acorde que te reparta en la tonalidad de C — sin dudar.</li><li>Repite la baraja dos veces.</li></ol>',
                drill: { type: 'deck', deck: 'numerals-C' },
                hint: 'If you know the family in order (C Dm Em F G Am), the numeral just tells you which slot to reach for.',
                hint_es: 'Si conoces la familia en orden (C Dm Em F G Am), el número romano solo te dice cuál lugar buscar.',
                stuck: 'Keep the family in numeral order in view while you drill — C Dm Em F G Am.',
                stuck_es: 'Mantén la familia en orden de números romanos a la vista mientras practicas — C Dm Em F G Am.',
                levelUp: 'Switch to the key of G, or time yourself through the deck and try to beat your best time. Ready for all seven? Look up Bdim — the vii° of C — and name it at the end of every lap.',
                levelUp_es: 'Cambia a la tonalidad de G, o cronométrate con la baraja e intenta superar tu mejor tiempo. ¿Listo para los siete? Busca Bdim — el vii° de C — y nómbralo al final de cada vuelta.',
                skills: [1, 2]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Let It Be", numbered', label_es: 'Reto — "Let It Be", numerado',
                text: '<ol><li>Strum the verse, playing whatever numeral the deck below deals you each bar — you have to know which chord each numeral means, not just the C–G–Am–F letters.</li></ol>You\'ve got it when: one full loop with every numeral landing on the right chord.',
                text_es: '<ol><li>Rasguea la estrofa, tocando el número romano que la baraja de abajo te reparta en cada compás — tienes que saber qué acorde significa cada número romano, no solo las letras C–G–Am–F.</li></ol>Lo tienes cuando: una vuelta completa con cada número romano cayendo en el acorde correcto.',
                drill: { type: 'deck', deck: 'numerals-letitbe', skill: 'm11w1-s3' },
                hint: 'This is the same verse you\'ve strummed since Module 5 — today the only new part is thinking in numerals instead of letters.',
                hint_es: 'Esta es la misma estrofa que has rasgueado desde el Módulo 5 — hoy lo único nuevo es pensar en números romanos en lugar de letras.',
                stuck: 'Say each chord\'s NAME out loud first, then its numeral, until the pairing sticks.',
                stuck_es: 'Di primero el NOMBRE de cada acorde en voz alta, y luego su número romano, hasta que la relación se fije.',
                levelUp: 'Deal a fresh order each loop, and always land back on I to finish.',
                levelUp_es: 'Reparte un orden nuevo cada vuelta, y siempre termina cayendo en I.',
                skills: [3],
                chords: [
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: why is Am lowercase?', label_es: 'Cierre: ¿por qué Am va en minúscula?',
                text: 'What\'s the vi chord of G major, and can you explain in one sentence why Am is lowercase but C is uppercase?',
                text_es: '¿Cuál es el acorde vi de G mayor, y puedes explicar en una oración por qué Am va en minúscula pero C va en mayúscula?',
                response: { type: 'short', placeholder: 'e.g. Em is the vi of G; Am is lowercase because it comes out minor when you stack the scale in thirds',
                  placeholder_es: 'p. ej. Em es el vi de G; Am va en minúscula porque sale menor al apilar la escala en terceras' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Builds triads from a scale · Labels a progression with numerals · Lists a key\'s chord family',
      goal_es: 'Construye tríadas a partir de una escala · Etiqueta una progresión con números romanos · Enumera la familia de acordes de una tonalidad',
      performance: 'Write yourself a 4-chord progression in C (any four family chords), label it in numerals, then play it.',
      selfCheck: 'What\'s the vi chord of G major? Can you explain why Am is lowercase?',
      selfCheck_es: '¿Cuál es el acorde vi de G mayor? ¿Puedes explicar por qué Am va en minúscula?',
      standards: ['Pr.4a', 'Cn.10a', 'Re.9a']
    },

    skills: [
      { id: 'm11w1-s1', text: 'Build a triad from a scale (root–3rd–5th)',
        text_es: 'Construir una tríada a partir de una escala (raíz–3ª–5ª)',
        gotItWhen: 'you can stack root-3rd-5th on any scale note and name the three notes — C major\'s triad is C-E-G.',
        gotItWhen_es: 'puedes apilar raíz-3ª-5ª sobre cualquier nota de una escala y nombrar las tres notas — la tríada de C mayor es C-E-G.',
        practice: { type: 'mc', prompt: 'The notes of the C major triad are:', prompt_es: 'Las notas de la tríada de C mayor son:', choices: ['C-D-E', 'C-E-G', 'C-F-G', 'C-E-A'], choices_es: ['C-D-E', 'C-E-G', 'C-F-G', 'C-E-A'], answer: 1,
          explain: 'Start on C and skip a note each time — C, skip D, E, skip F, G. C-D-E is tempting because the letters run in order, but notes that sit right next to each other are a run of the scale, not a chord.',
          explain_es: 'Empieza en C y salta una nota cada vez — C, saltas D, E, saltas F, G. C-D-E tienta porque las letras van seguidas, pero las notas vecinas, una junto a la otra, son un tramo de la escala, no un acorde.' } },
      { id: 'm11w1-s2', text: 'Say which chords in a major key are major (I, IV, V) and which are minor (ii, iii, vi)',
        text_es: 'Decir cuáles acordes de una tonalidad mayor son mayores (I, IV, V) y cuáles son menores (ii, iii, vi)',
        gotItWhen: 'you can say without hesitating that I, IV, and V come out major and ii, iii, and vi come out minor, in any major key.',
        gotItWhen_es: 'puedes decir sin dudar que I, IV y V salen mayores y ii, iii y vi salen menores, en cualquier tonalidad mayor.',
        practice: { type: 'mc', prompt: 'In the key of G, the vi chord is:', prompt_es: 'En la tonalidad de G, el acorde vi es:', choices: ['E major', 'E minor', 'B minor', 'C major'], choices_es: ['E mayor', 'E menor', 'B menor', 'C mayor'], answer: 1,
          explain: 'The 6th note of the G scale is E, and vi is written lowercase, which always means minor — so Em. E major is the same letter with the wrong quality (major instead of minor).',
          explain_es: 'La 6ª nota de la escala de G es E, y vi se escribe en minúscula, lo que siempre significa menor — así que Em. E mayor es la misma letra pero mayor en vez de menor.' } },
      { id: 'm11w1-s3', text: 'Label "Let It Be"\'s C–G–Am–F as I–V–vi–IV',
        text_es: 'Etiquetar el C–G–Am–F de "Let It Be" como I–V–vi–IV',
        gotItWhen: 'you can call out I–V–vi–IV while strumming "Let It Be"\'s C–G–Am–F loop, without stopping to work it out.',
        gotItWhen_es: 'puedes decir I–V–vi–IV mientras rasgueas el loop C–G–Am–F de "Let It Be", sin detenerte a calcularlo.',
        practice: { type: 'mc', prompt: '"Let It Be" runs C–G–Am–F in the key of C. Which numerals — and why is the "vi" lowercase?',
          prompt_es: '"Let It Be" va C–G–Am–F en la tonalidad de C. ¿Cuáles números romanos — y por qué el "vi" va en minúscula?',
          choices: ['I–V–vi–IV — lowercase because Am is a minor chord', 'I–V–VI–IV — Roman numerals are always uppercase', 'I–IV–V–vi — count the chords in play order 1, 4, 5, 6', 'vi–V–I–IV — Am is the key, so it gets I'],
          choices_es: ['I–V–vi–IV — minúscula porque Am es un acorde menor', 'I–V–VI–IV — los números romanos siempre van en mayúscula', 'I–IV–V–vi — cuenta los acordes en orden de aparición 1, 4, 5, 6', 'vi–V–I–IV — Am es la tonalidad, así que recibe el I'], answer: 0,
          explain: 'Numerals come from each chord\'s position in the KEY\'s scale, not from play order — and case shows quality: uppercase major, lowercase minor.',
          explain_es: 'Los números vienen de la posición de cada acorde en la escala de la TONALIDAD, no del orden en que se tocan — y la caja muestra la calidad: mayúscula mayor, minúscula menor.' } },
      { id: 'm11w1-s4', text: 'List the chord family of C major (C Dm Em F G Am)',
        text_es: 'Enumerar la familia de acordes de C mayor (C Dm Em F G Am)',
        gotItWhen: 'you can rattle off C · Dm · Em · F · G · Am in order from memory, no scale-building required.',
        gotItWhen_es: 'puedes decir de memoria C · Dm · Em · F · G · Am en orden, sin necesidad de construir la escala.',
        practice: { type: 'mc', prompt: 'Which chord is NOT in the key of C?', prompt_es: '¿Cuál acorde NO está en la tonalidad de C?', choices: ['Am', 'F', 'E major', 'Dm'], choices_es: ['Am', 'F', 'E mayor', 'Dm'], answer: 2,
          explain: 'C\'s family is C · Dm · Em · F · G · Am, so Am, F and Dm all belong. The chord built on E in this key comes out minor, which makes E MAJOR the outsider.',
          explain_es: 'La familia de C es C · Dm · Em · F · G · Am, así que Am, F y Dm sí pertenecen. El acorde construido sobre E en esta tonalidad sale menor, y por eso E MAYOR es el intruso.' } },
      { id: 'm11w1-s5', text: 'List the chord family of G major (G Am Bm C D Em)',
        text_es: 'Enumerar la familia de acordes de G mayor (G Am Bm C D Em)',
        gotItWhen: 'you can rattle off G · Am · Bm · C · D · Em in order from memory, no scale-building required.',
        gotItWhen_es: 'puedes decir de memoria G · Am · Bm · C · D · Em en orden, sin necesidad de construir la escala.',
        practice: { type: 'mc', prompt: 'In the key of G, the IV and V chords are:', prompt_es: 'En la tonalidad de G, los acordes IV y V son:', choices: ['C and D', 'A and B', 'F and G', 'D and E'], choices_es: ['C y D', 'A y B', 'F y G', 'D y E'], answer: 0,
          explain: 'Count up the G scale — G(I) A(ii) B(iii) C(IV) D(V) — so IV is C and V is D. Those two plus G are the three major chords of the key, and most songs in G live on them.',
          explain_es: 'Cuenta la escala de G — G(I) A(ii) B(iii) C(IV) D(V) — así que el IV es C y el V es D. Esos dos más G son los tres acordes mayores de la tonalidad, y en ellos viven casi todas las canciones en G.' } },
      { id: 'm11w1-s6', text: 'Label "Luna"\'s F–Am vamp as I–iii in F major (with the passing Dm as vi)',
        text_es: 'Etiquetar el vamp F–Am de "Luna" como I–iii en F mayor (con el Dm de paso como vi)',
        gotItWhen: 'you can explain that Am is F major\'s iii chord (built on the 3rd scale note) and name the passing Dm as vi.',
        gotItWhen_es: 'puedes explicar que Am es el acorde iii de F mayor (construido sobre la 3ª nota de la escala) y nombrar el Dm de paso como vi.',
        practice: { type: 'mc', prompt: '"Luna" vamps F → Am in the key of F major. What numeral does Am get?',
          prompt_es: '"Luna" alterna F → Am en la tonalidad de F mayor. ¿Qué número romano recibe Am?',
          choices: ['iii — A is the 3rd note of the F scale, and the chord is minor', 'vi — minor chords are always vi', 'III — uppercase, it\'s the 3rd chord', 'ii — it comes second in the vamp'],
          choices_es: ['iii — A es la 3ª nota de la escala de F, y el acorde es menor', 'vi — los acordes menores siempre son vi', 'III — mayúscula, es el 3er acorde', 'ii — viene en segundo lugar en el vamp'], answer: 0,
          explain: 'Count up the F major scale — F(1) G(2) A(3) — so Am is the 3rd chord, written lowercase iii because it\'s minor. (The passing Dm is vi.)',
          explain_es: 'Cuenta la escala de F mayor — F(1) G(2) A(3) — así que Am es el 3er acorde, escrito iii en minúscula porque es menor. (El Dm de paso es vi.)' } }
    ]
  },

  {
    id: 'm11w2',
    label: 'Set 2',
    locked: false,
    module: 'Chords, Keys & Harmony',
    moduleNum: 11,
    unit: 'Module 11 · Chords, Keys & Harmony',
    unit_es: 'Módulo 11 · Acordes, tonalidades y armonía',
    title: 'Set 2',
    subtitle: 'The chord inventory trick · I–IV–V vs the famous four · Slash chords decoded',
    subtitle_es: 'El truco del inventario de acordes · I–IV–V vs. los famosos cuatro · Acordes con barra diagonal descifrados',
    skillFocus: 'Match the inventory to a family · The home chord feels like rest · G/B = G chord, B bass',
    skillFocus_es: 'Compara el inventario con una familia · El acorde base se siente como reposo · G/B = acorde de G, bajo en B',
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
                label: 'Watch: chords that sound good together', label_es: 'Mira: acordes que suenan bien juntos',
                text: 'Watch: <a href="https://youtu.be/6U8-Y7DEzOE" target="_blank">What chords sound good together? | Music theory ep. 7 – Paul Davids</a> — a second voice on the chord families you built in Set 1. Paul shows why a key\'s chords belong together; your job is to run it backwards: given a song\'s chords, name the key.',
                text_es: 'Mira: <a href="https://youtu.be/6U8-Y7DEzOE" target="_blank">What chords sound good together? | Music theory ep. 7 – Paul Davids</a> — una segunda voz sobre las familias de acordes que construiste en la Unidad 1. Paul muestra por qué los acordes de una tonalidad pertenecen juntos; tu trabajo es hacerlo al revés: dados los acordes de una canción, nombrar la tonalidad.',
                hint: 'You already know each key\'s chord family from Set 1 — this is just running that lookup backwards.',
                hint_es: 'Ya conoces la familia de acordes de cada tonalidad desde la Unidad 1 — esto es solo hacer esa búsqueda al revés.',
                skills: [1],
                response: { type: 'mc', prompt: 'A song uses G, C, D, and Em. Its key is almost certainly:',
                  prompt_es: 'Una canción usa G, C, D y Em. Su tonalidad casi seguro es:',
                  answer: 1,
                  explain: 'All four live in G major\'s family, and G/D/C are its I, V, IV. (Em, the relative minor, shares those notes too — your ear decides between G and Em by which chord feels like home.)',
                  explain_es: 'Los cuatro viven en la familia de G mayor, y G/D/C son su I, V, IV. (Em, la relativa menor, también comparte esas notas — tu oído decide entre G y Em según cuál acorde se sienta como base.)',
                  choices: ['C major', 'G major', 'D major', 'F major'],
                  choices_es: ['C mayor', 'G mayor', 'D mayor', 'F mayor'] }
              },
              {
                label: 'Watch: "All Along the Watchtower"', label_es: 'Mira: "All Along the Watchtower"',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=bT7Hj-ea0VE" target="_blank">All Along the Watchtower – Bob Dylan (Official Audio)</a>. Listen to the Am–G–F loop and, without looking anything up, decide by ear which chord feels like "home."',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=bT7Hj-ea0VE" target="_blank">All Along the Watchtower – Bob Dylan (Official Audio)</a>. Escucha el loop Am–G–F y, sin buscar nada, decide de oído cuál acorde se siente como "base."',
                hint: 'Home is the chord the loop keeps landing back on — the one that makes the progression feel finished, not left unfinished.',
                hint_es: 'La base es el acorde donde el loop siempre vuelve a caer — el que hace que la progresión se sienta terminada, no inconclusa.',
                skills: [4],
                response: { type: 'mc', prompt: '"Watchtower" loops Am–G–F. Which chord feels like home?',
                  prompt_es: '"Watchtower" repite Am–G–F. ¿Cuál acorde se siente como base?',
                  answer: 2,
                  explain: 'The loop keeps landing back on Am — its home. Call the song A minor (C major\'s relative family).',
                  explain_es: 'El loop siempre vuelve a caer en Am — su base. Llama a la canción A menor (la familia relativa de C mayor).',
                  choices: ['G', 'F', 'Am', 'None'],
                  choices_es: ['G', 'F', 'Am', 'Ninguno'] }
              }
            ]
          },
          {
            title: 'Listen for I–IV–V',
            title_es: 'Escucha el I–IV–V',
            steps: [
              {
                label: 'Find I–IV–V in A', label_es: 'Encuentra I–IV–V en A',
                text: 'Listen for it: count up the A major scale to find its I, IV, and V chords before checking your answer.',
                text_es: 'Escucha con atención: cuenta hacia arriba en la escala de A mayor para encontrar sus acordes I, IV y V antes de revisar tu respuesta.',
                hint: 'I–IV–V is the foundation progression behind blues, rock, and a lot of cumbia — worth having on instant recall in any key.',
                hint_es: 'I–IV–V es la progresión fundamental detrás del blues, el rock y buena parte de la cumbia — vale la pena tenerla lista al instante en cualquier tonalidad.',
                skills: [2],
                response: { type: 'mc', prompt: 'I–IV–V in the key of A is:',
                  prompt_es: 'El I–IV–V en la tonalidad de A es:',
                  answer: 0,
                  explain: 'Count up the A major scale: A(I), D(IV), E(V) — the foundation of blues, rock, and cumbia alike.',
                  explain_es: 'Cuenta hacia arriba en la escala de A mayor: A(I), D(IV), E(V) — la base tanto del blues como del rock y la cumbia.',
                  choices: ['A–D–E', 'A–C–D', 'A–E–F#m', 'A–B–C'],
                  choices_es: ['A–D–E', 'A–C–D', 'A–E–F#m', 'A–B–C'] }
              }
            ]
          },
          {
            title: 'Try numbering a real progression',
            title_es: 'Prueba a numerar una progresión real',
            steps: [
              {
                label: 'Number "the cure"\'s chords', label_es: 'Numera los acordes de "the cure"',
                text: 'Now try it: number "the cure"\'s chords — Am–C–Dm–F–G/B — in the key of C before checking.',
                text_es: 'Ahora pruébalo: numera los acordes de "the cure" — Am–C–Dm–F–G/B — en la tonalidad de C antes de revisar.',
                hint: 'Ignore the slash for a moment and number the chord names first — the bass note is a separate question.',
                hint_es: 'Ignora la barra diagonal por un momento y numera primero los nombres de los acordes — la nota de bajo es una pregunta aparte.',
                skills: [3],
                response: { type: 'mc', prompt: '"the cure" uses Am–C–Dm–F–G/B. In the key of C, Am–C–Dm–F is:',
                  prompt_es: '"the cure" usa Am–C–Dm–F–G/B. En la tonalidad de C, Am–C–Dm–F es:',
                  answer: 0,
                  explain: 'Am=vi, C=I, Dm=ii, F=IV — and the G/B is the V chord with a B as its lowest note, so the bass walks smoothly back down to Am, closing the loop.',
                  explain_es: 'Am=vi, C=I, Dm=ii, F=IV — y el G/B es el acorde V con una B como su nota más grave, así que el bajo camina suavemente de vuelta hacia abajo hasta Am, cerrando el ciclo.',
                  choices: ['vi–I–ii–IV', 'I–V–vi–IV', 'ii–IV–vi–I', 'vi–IV–I–V'],
                  choices_es: ['vi–I–ii–IV', 'I–V–vi–IV', 'ii–IV–vi–I', 'vi–IV–I–V'] }
              },
              {
                label: 'Find the family fast', label_es: 'Encuentra la familia rápido',
                text: 'Try it fast: given only a chord list (no song name), find the single family that contains every chord before you do anything else.',
                text_es: 'Pruébalo rápido: dada solo una lista de acordes (sin nombre de canción), encuentra la única familia que contiene todos los acordes antes de hacer cualquier otra cosa.',
                hint: 'Inventory first, family second, home-chord-by-ear last — in that order, every time.',
                hint_es: 'Primero el inventario, después la familia, y al final el acorde base por oído — en ese orden, siempre.',
                skills: [6],
                response: { type: 'mc', prompt: 'The fastest first move to find a song\'s key from a chord chart is:',
                  prompt_es: 'El primer paso más rápido para encontrar la tonalidad de una canción a partir de una tabla de acordes es:',
                  answer: 1,
                  explain: 'Inventory → family → then let your ear pick the home chord (major key or its relative minor).',
                  explain_es: 'Inventario → familia → y luego deja que tu oído elija el acorde base (la tonalidad mayor o su relativa menor).',
                  choices: ['Count the chords', 'See which single family contains ALL the chords', 'Find the loudest chord', 'Check the tempo'],
                  choices_es: ['Contar los acordes', 'Ver cuál única familia contiene TODOS los acordes', 'Encontrar el acorde más fuerte', 'Revisar el tempo'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: the home-chord feeling', label_es: 'Cierre: la sensación del acorde base',
                text: 'Station Wrap-Up — describe the "home chord" feeling in your own words.',
                text_es: 'Cierre de la estación — describe con tus propias palabras la sensación del "acorde base."',
                response: { type: 'short', placeholder: 'e.g. like the last word of a sentence — the loop can finally stop there',
                  placeholder_es: 'p. ej. como la última palabra de una oración — el loop finalmente puede detenerse ahí' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — finding the key',
        title_es: 'Estación de práctica — encontrar la tonalidad',
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
            title: 'Chord-inventory detective drill',
            title_es: 'Ejercicio detective de inventario de acordes',
            steps: [
              {
                label: 'Challenge 1 — Inventory Drill', label_es: 'Reto 1 — Ejercicio de inventario',
                text: 'A drill is a short exercise you repeat to build a skill.<ol><li>Run the key-detective deck below — for each mystery chord set, find the single family that contains every chord in it and say the key OUT LOUD before you flip the card.</li></ol>',
                text_es: 'Un ejercicio es una práctica corta que repites para desarrollar una destreza.<ol><li>Corre la baraja detective de tonos de abajo — para cada conjunto misterioso de acordes, encuentra la única familia que contiene todos los acordes y di el tono EN VOZ ALTA antes de voltear la tarjeta.</li></ol>',
                drill: { type: 'deck', deck: 'key-inventory', skill: 'm11w2-s1' },
                hint: 'Find the single family that contains ALL the chords on the card — that\'s the key, before your ear even weighs in.',
                hint_es: 'Encuentra la única familia que contiene TODOS los acordes de la tarjeta — esa es la tonalidad, incluso antes de que tu oído opine.',
                stuck: 'Cross off keys one at a time — if even one chord doesn\'t belong to a family, that key is out.',
                stuck_es: 'Descarta tonalidades una a la vez — si aunque sea un acorde no pertenece a una familia, esa tonalidad queda descartada.',
                levelUp: 'Time yourself — how fast can you call all four keys correctly in a row?',
                levelUp_es: 'Cronométrate — ¿qué tan rápido puedes decir las cuatro tonalidades correctamente seguidas?',
                skills: [1, 6]
              }
            ]
          },
          {
            title: 'Play and feel for home',
            title_es: 'Toca y siente la base',
            steps: [
              {
                label: 'Challenge 2 — Play and Feel', label_es: 'Reto 2 — Toca y siente',
                text: '<ol><li>Strum Am–G–F, stopping and holding each chord in turn.</li><li>Say (or type below) which one feels most like "home."</li></ol>',
                text_es: '<ol><li>Rasguea Am–G–F, deteniéndote y sosteniendo cada acorde por turno.</li><li>Di (o escribe abajo) cuál se siente más como "base."</li></ol>',
                hint: 'Play the loop a few times through first — home only reveals itself once you can hear the whole shape of the progression.',
                hint_es: 'Toca el loop unas cuantas veces primero — la base solo se revela una vez que puedes escuchar la forma completa de la progresión.',
                stuck: 'Play just Am, then G, then F in isolation and rate each one 1-10 for "does this feel finished."',
                stuck_es: 'Toca solo Am, luego G, luego F por separado y califica cada uno del 1 al 10 según "¿se siente terminado?"',
                levelUp: 'Try the same drill on a progression you haven\'t analyzed yet.',
                levelUp_es: 'Prueba el mismo ejercicio con una progresión que no hayas analizado todavía.',
                skills: [4],
                response: { type: 'short', placeholder: 'e.g. Am — the loop only feels finished when it lands there',
                  placeholder_es: 'p. ej. Am — el loop solo se siente terminado cuando cae ahí' },
                chords: [
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Decode a slash chord',
            title_es: 'Descifra un acorde con barra diagonal',
            steps: [
              {
                label: 'Challenge 3 — Slash Chord Walk', label_es: 'Reto 3 — Caminata de acorde con barra diagonal',
                text: '<ul><li>Play C → G/B → Am as a smooth bass-line move — notice the bass note walks down one step at a time (C, B, A) while the chords change around it.</li></ul>',
                text_es: '<ul><li>Toca C → G/B → Am como un movimiento suave de línea de bajo — fíjate cómo la nota de bajo baja un paso a la vez (C, B, A) mientras los acordes cambian alrededor.</li></ul>',
                hint: 'This is exactly what "the cure" does to glide from the G chord back home to Am, closing the loop — the slash chord is the piece that links the two chords smoothly.',
                hint_es: 'Esto es exactamente lo que hace "the cure" para deslizarse del acorde de G de vuelta a la base en Am, cerrando el ciclo — el acorde con barra diagonal es la pieza que conecta los dos acordes suavemente.',
                stuck: 'Play C and Am first without the G/B in between, then add it back and listen for how much smoother the move feels.',
                stuck_es: 'Toca C y Am primero sin el G/B en medio, y luego agrégalo de vuelta y escucha cuánto más suave se siente el movimiento.',
                levelUp: 'Try the reverse walk, Am → G/B → C, or find another slash chord to decode.',
                levelUp_es: 'Prueba la caminata al revés, Am → G/B → C, o encuentra otro acorde con barra diagonal para descifrar.',
                skills: [5],
                chords: [
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'G/B', chord: [[6,'x'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
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
                label: 'Challenge — "Watchtower", fully numbered', label_es: 'Reto — "Watchtower", completamente numerado',
                text: '<ol><li>Play the Am–G–F loop and label every chord\'s numeral in the key of C — vi–V–IV.</li><li>Land back on Am as the true minor-key home.</li></ol>You\'ve got it when: one clean loop, numerals called correctly on every chord.',
                text_es: '<ol><li>Toca el loop Am–G–F y etiqueta el número romano de cada acorde en la tonalidad de C — vi–V–IV.</li><li>Aterriza de vuelta en Am como la verdadera base en tonalidad menor.</li></ol>Lo tienes cuando: un loop limpio, con los números romanos dichos correctamente en cada acorde.',
                hint: '"Watchtower" is C major\'s relative-minor family in action — same three chords you\'ve played since Module 2, now fully numbered.',
                hint_es: '"Watchtower" es la familia relativa menor de C mayor en acción — los mismos tres acordes que has tocado desde el Módulo 2, ahora completamente numerados.',
                stuck: 'Number just Am and G first (vi and V), then add F (IV).',
                stuck_es: 'Numera primero solo Am y G (vi y V), y luego agrega F (IV).',
                levelUp: 'Explain out loud why "Watchtower" can be called "in C" or "in A minor" and both are correct.',
                levelUp_es: 'Explica en voz alta por qué a "Watchtower" se le puede llamar "en C" o "en A menor" y ambas son correctas.',
                skills: [4, 6],
                chords: [
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: mystery key and G/B', label_es: 'Cierre: tonalidad misteriosa y G/B',
                text: 'A song uses D, G, A, and Bm — what key? And what does the B in G/B tell you to do with your bass note?',
                text_es: 'Una canción usa D, G, A y Bm — ¿qué tonalidad? ¿Y qué te dice la B en G/B que hagas con tu nota de bajo?',
                response: { type: 'short', placeholder: 'e.g. key of D; the B means B is the lowest note you play, even though it\'s still a G chord shape',
                  placeholder_es: 'p. ej. tonalidad de D; la B significa que B es la nota más grave que tocas, aunque siga siendo la forma del acorde de G' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Finds a key from a chord inventory · Recognizes I–IV–V and I–V–vi–IV · Decodes a slash chord',
      goal_es: 'Encuentra una tonalidad a partir de un inventario de acordes · Reconoce I–IV–V y I–V–vi–IV · Descifra un acorde con barra diagonal',
      performance: 'Key detective: pull up the chord list of a real song you haven\'t analyzed yet; deduce the key and defend your answer.',
      selfCheck: 'A song uses D, G, A, and Bm — what key? What does the B in G/B do?',
      selfCheck_es: 'Una canción usa D, G, A y Bm — ¿qué tonalidad? ¿Qué hace la B en G/B?',
      standards: ['Pr.4a', 'Cn.10a', 'Re.9a']
    },

    skills: [
      { id: 'm11w2-s1', text: 'Identify a song\'s key from its chord inventory',
        text_es: 'Identificar la tonalidad de una canción a partir de su inventario de acordes',
        gotItWhen: 'you can look at an unfamiliar chord list (like G, C, D, Em) and name the one family that contains all of them before checking.',
        gotItWhen_es: 'puedes ver una lista de acordes desconocida (como G, C, D, Em) y nombrar la única familia que los contiene a todos antes de revisar.',
        practice: { type: 'mc', prompt: 'A song uses C, F, G, and Am. Its key:', prompt_es: 'Una canción usa C, F, G y Am. Su tonalidad:', choices: ['F major', 'C major', 'A major', 'G major'], choices_es: ['F mayor', 'C mayor', 'A mayor', 'G mayor'], answer: 1,
          explain: 'All four chords fit inside C major\'s family (C · Dm · Em · F · G · Am). G major is the tempting one, but the G scale has F#, not F — so the key of G can\'t contain an F chord.',
          explain_es: 'Los cuatro acordes caben dentro de la familia de C mayor (C · Dm · Em · F · G · Am). G mayor es la opción que tienta, pero la escala de G tiene F#, no F — así que la tonalidad de G no puede contener un acorde de F.' } },
      { id: 'm11w2-s2', text: 'Recognize I–IV–V and I–V–vi–IV progressions by their numerals',
        text_es: 'Reconocer las progresiones I–IV–V y I–V–vi–IV por sus números romanos',
        gotItWhen: 'you can spot I–IV–V or I–V–vi–IV in a progression on sight, and build either one in a key like A (A–D–E for I–IV–V).',
        gotItWhen_es: 'puedes reconocer a simple vista un I–IV–V o un I–V–vi–IV en una progresión, y construir cualquiera de los dos en una tonalidad como A (A–D–E para el I–IV–V).',
        practice: { type: 'mc', prompt: 'I–V–vi–IV in the key of G is:', prompt_es: 'I–V–vi–IV en la tonalidad de G es:', choices: ['G–D–Em–C', 'G–C–D–Em', 'G–Am–B–C', 'G–Em–C–D'], choices_es: ['G–D–Em–C', 'G–C–D–Em', 'G–Am–B–C', 'G–Em–C–D'], answer: 0,
          explain: 'In G: I=G, V=D, vi=Em, IV=C, and the numerals give you the order. G–Em–C–D is built from the same four chords but a different order, so it\'s a different progression (I–vi–IV–V).',
          explain_es: 'En G: I=G, V=D, vi=Em, IV=C, y los números romanos te dan el orden. G–Em–C–D usa los mismos cuatro acordes pero en otro orden, así que es otra progresión (I–vi–IV–V).' } },
      { id: 'm11w2-s3', text: 'Number "the cure"\'s progression in the key of C',
        text_es: 'Numerar la progresión de "the cure" en la tonalidad de C',
        gotItWhen: 'you can call out vi–I–ii–IV while playing "the cure"\'s Am–C–Dm–F, before checking.',
        gotItWhen_es: 'puedes decir vi–I–ii–IV mientras tocas el Am–C–Dm–F de "the cure", antes de revisar.',
        practice: { type: 'mc', prompt: '"the cure" moves Am–C–Dm–F in the key of C. Which numeral string is right?',
          prompt_es: '"the cure" va Am–C–Dm–F en la tonalidad de C. ¿Cuál cadena de números romanos es la correcta?',
          choices: ['vi–I–ii–IV', 'I–III–IV–VI — number them in the order they appear', 'vi–I–iv–IV — Dm is minor, so it\'s iv', 'i–III–iv–VI — the song starts on Am, so Am is i'],
          choices_es: ['vi–I–ii–IV', 'I–III–IV–VI — se numeran en el orden en que aparecen', 'vi–I–iv–IV — Dm es menor, así que es iv', 'i–III–iv–VI — la canción empieza en Am, así que Am es i'], answer: 0,
          explain: 'In C: Am=vi, C=I, Dm=ii, F=IV. Dm is lowercase ii (2nd scale degree, minor chord) — "iv" would mean a minor chord built on F.',
          explain_es: 'En C: Am=vi, C=I, Dm=ii, F=IV. Dm es ii en minúscula (2º grado de la escala, acorde menor) — "iv" significaría un acorde menor construido sobre F.' } },
      { id: 'm11w2-s4', text: 'Find "Watchtower"\'s key from Am–G–F and say why Am is home',
        text_es: 'Encontrar la tonalidad de "Watchtower" a partir de Am–G–F y decir por qué Am es la base',
        gotItWhen: 'you can name Am as the home chord of "Watchtower"\'s Am–G–F loop by ear, and explain that home is where the loop feels finished, not just the first chord played.',
        gotItWhen_es: 'puedes nombrar Am como el acorde base del loop Am–G–F de "Watchtower" de oído, y explicar que la base es donde el loop se siente terminado, no solo el primer acorde que se toca.',
        practice: { type: 'mc', prompt: '"Watchtower" loops Am–G–F. What actually tells you the key is A minor?',
          prompt_es: '"Watchtower" repite Am–G–F. ¿Qué te dice en realidad que la tonalidad es A menor?',
          choices: ['Every phrase pulls back to Am and rests there — home is where the music resolves', 'The first chord of a song is always its key', 'It has more minor chords than major ones', 'F comes last alphabetically'],
          choices_es: ['Cada frase regresa a Am y descansa ahí — la base es donde la música se resuelve', 'El primer acorde de una canción siempre es su tonalidad', 'Tiene más acordes menores que mayores', 'F va al final alfabéticamente'], answer: 0,
          explain: 'Key = the resting place your ear hears, not the first chord (plenty of songs start away from home). Hum along and notice where the loop feels finished — that\'s Am.',
          explain_es: 'La tonalidad = el punto de descanso que escucha tu oído, no el primer acorde (muchas canciones empiezan lejos de la base). Tararea y nota dónde la vuelta se siente terminada — eso es Am.' } },
      { id: 'm11w2-s5', text: 'Explain what a slash chord tells you (chord / bass note)',
        text_es: 'Explicar qué te dice un acorde con barra diagonal (acorde / nota de bajo)',
        gotItWhen: 'you can say that in a chord like G/B, G is the shape you finger and B is the lowest note you make sure sounds — and play C to G/B to Am with the bass walking smoothly down.',
        gotItWhen_es: 'puedes decir que en un acorde como G/B, G es la forma que digitas y B es la nota más grave que aseguras que suene — y tocar C a G/B a Am con el bajo bajando suavemente.',
        practice: { type: 'mc', prompt: 'In Am/E, your lowest sounding note should be:', prompt_es: 'En Am/E, tu nota más grave debería ser:', choices: ['A', 'C', 'E', 'G'], choices_es: ['A', 'C', 'E', 'G'], answer: 2,
          explain: 'In a slash chord the letter after the slash is the bass note — the lowest note you let ring. You still finger a normal Am; you just make sure E, not A, is on the bottom.',
          explain_es: 'En un acorde con barra diagonal, la letra después de la barra es la nota del bajo — la nota más grave que dejas sonar. Sigues digitando un Am normal; solo te aseguras de que abajo quede E y no A.' } },
      { id: 'm11w2-s6', text: 'Given any three chords, name their key and each chord\'s numeral',
        text_es: 'Dados tres acordes cualesquiera, nombrar su tonalidad y el número romano de cada acorde',
        gotItWhen: 'you can take three chords you haven\'t seen together before, name the one key that fits all three, and label each one\'s numeral.',
        gotItWhen_es: 'puedes tomar tres acordes que no has visto juntos antes, nombrar la única tonalidad que encaja con los tres, y etiquetar el número romano de cada uno.',
        practice: { type: 'mc', prompt: 'A song uses G, C, and D — all major. Name the key and the numerals.',
          prompt_es: 'Una canción usa G, C y D — todos mayores. Nombra la tonalidad y los números romanos.',
          choices: ['G major — I, IV, V', 'C major — V, I, II', 'D major — IV, VII, I', 'Can\'t tell from chords alone'],
          choices_es: ['G mayor — I, IV, V', 'C mayor — V, I, II', 'D mayor — IV, VII, I', 'No se puede saber solo con los acordes'], answer: 0,
          explain: 'Only G major contains G, C, AND D as majors — in C the "D" chord would be Dm (ii). Three majors a whole step apart are almost always I, IV, V.',
          explain_es: 'Solo G mayor contiene G, C Y D como mayores — en C el acorde de "D" sería Dm (ii). Tres mayores separados así casi siempre son I, IV, V.' } }
    ]
  },

  {
    id: 'm11w3',
    label: 'Set 3',
    locked: false,
    module: 'Chords, Keys & Harmony',
    moduleNum: 11,
    unit: 'Module 11 · Chords, Keys & Harmony',
    unit_es: 'Módulo 11 · Acordes, tonalidades y armonía',
    title: 'Set 3',
    subtitle: 'One shape, twelve chords · Root names the chord · Play I–IV–V anywhere',
    subtitle_es: 'Una forma, doce acordes · La raíz nombra el acorde · Toca I–IV–V en cualquier lugar',
    skillFocus: 'E-shape root on the low E · A-shape root on the A string · Your Module 9 fretboard knowledge names every barre',
    skillFocus_es: 'Raíz de la forma de E en la Mi grave · Raíz de la forma de A en la cuerda La · Tu conocimiento del diapasón del Módulo 9 nombra cada cejilla',
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
                label: 'Watch: E-shape barre chords', label_es: 'Mira: cejillas en forma de E',
                text: 'Watch: <a href="https://youtu.be/MpMhueVEz2g" target="_blank">Basic Barré Chords #1 — the E shape (CH-006) – JustinGuitar</a>. As you watch, find the low-E-string fret for each root he names.',
                text_es: 'Mira: <a href="https://youtu.be/MpMhueVEz2g" target="_blank">Basic Barré Chords #1 — the E shape (CH-006) – JustinGuitar</a>. Mientras miras, encuentra el traste en la cuerda Mi grave para cada raíz que él nombra.',
                hint: 'The low-E root names an E-shape barre chord — Module 9\'s fretboard knowledge pays off here.',
                hint_es: 'La raíz en la Mi grave nombra un acorde con cejilla en forma de E — el conocimiento del diapasón del Módulo 9 rinde frutos aquí.',
                skills: [1],
                response: { type: 'mc', prompt: 'The E-shape barre chord takes its NAME from:',
                  prompt_es: 'El acorde con cejilla en forma de E toma su NOMBRE de:',
                  answer: 1,
                  explain: 'The low-E root names it — barre fret 3 and the low E says G, so it\'s G major. Module 9 pays off.',
                  explain_es: 'La raíz en la Mi grave lo nombra — cejilla en el traste 3 y la Mi grave da G, así que es G mayor. El Módulo 9 rinde frutos.',
                  choices: ['The fret your pinky is on', 'The note under your barre on the low E string', 'The key of the song', 'The A string'],
                  choices_es: ['El traste donde está tu meñique', 'La nota debajo de tu cejilla en la cuerda Mi grave', 'La tonalidad de la canción', 'La cuerda La'] }
              },
              {
                label: 'Watch: A-shape barre chords', label_es: 'Mira: cejillas en forma de A',
                text: 'Watch: <a href="https://youtu.be/C7k0CWgI-xI" target="_blank">A Shape Major Barre Chords on Guitar (my best tricks and exercises) – JustinGuitar</a>. Notice the root now lives on the A string, not the low E.',
                text_es: 'Mira: <a href="https://youtu.be/C7k0CWgI-xI" target="_blank">A Shape Major Barre Chords on Guitar (my best tricks and exercises) – JustinGuitar</a>. Fíjate que ahora la raíz vive en la cuerda La, no en la Mi grave.',
                hint: 'Same idea as the E-shape, different string — the A-shape root is always on the A string.',
                hint_es: 'Misma idea que la forma de E, distinta cuerda — la raíz de la forma de A siempre está en la cuerda La.',
                skills: [1],
                response: { type: 'mc', prompt: 'The A-shape barre chord takes its NAME from:',
                  prompt_es: 'El acorde con cejilla en forma de A toma su NOMBRE de:',
                  answer: 0,
                  explain: 'The note under your barre on the A string names it — same trick as the E shape, just one string over.',
                  explain_es: 'La nota debajo de tu cejilla en la cuerda La lo nombra — el mismo truco que la forma de E, solo una cuerda más allá.',
                  choices: ['The note under your barre on the A string', 'The note under your barre on the low E string', 'The fret your pinky is on', 'The key of the song'],
                  choices_es: ['La nota debajo de tu cejilla en la cuerda La', 'La nota debajo de tu cejilla en la cuerda Mi grave', 'El traste donde está tu meñique', 'La tonalidad de la canción'] }
              }
            ]
          },
          {
            title: 'Listen for the A-shape root',
            title_es: 'Escucha la raíz de la forma de A',
            steps: [
              {
                label: 'Find the A-shape root', label_es: 'Encuentra la raíz de la forma de A',
                text: 'Listen for it: play an A-shape barre at fret 5 and name its root before checking — remember the root lives on the A string this time, not the low E.',
                text_es: 'Escucha con atención: toca una cejilla en forma de A en el traste 5 y nombra su raíz antes de revisar — recuerda que esta vez la raíz vive en la cuerda La, no en la Mi grave.',
                hint: 'Count up the A string from open: A-A#-B-C-C#-D. Fret 5 lands on D.',
                hint_es: 'Cuenta hacia arriba en la cuerda La desde el aire: A-A#-B-C-C#-D. El traste 5 cae en D.',
                skills: [2],
                response: { type: 'mc', prompt: 'An A-shape barre at fret 5 is:',
                  prompt_es: 'Una cejilla en forma de A en el traste 5 es:',
                  answer: 2,
                  explain: 'A-shape roots live on the A STRING — fret 5 there is D.',
                  explain_es: 'Las raíces de la forma de A viven en la CUERDA LA — el traste 5 ahí es D.',
                  choices: ['A major', 'C major', 'D major', 'E major'],
                  choices_es: ['A mayor', 'C mayor', 'D mayor', 'E mayor'] }
              }
            ]
          },
          {
            title: 'Try naming a barre from its root',
            title_es: 'Prueba a nombrar una cejilla a partir de su raíz',
            steps: [
              {
                label: 'Find B major as a barre', label_es: 'Encuentra B mayor con cejilla',
                text: 'Now try it: find B major using the A-shape barre — count up the A string until you hit B before you fret anything.',
                text_es: 'Ahora pruébalo: encuentra B mayor usando la cejilla en forma de A — cuenta hacia arriba en la cuerda La hasta llegar a B antes de trastear nada.',
                hint: 'A string: A(0)-A#(1)-B(2). B is only two frets up.',
                hint_es: 'Cuerda La: A(0)-A#(1)-B(2). B está a solo dos trastes de distancia.',
                skills: [2],
                response: { type: 'mc', prompt: 'To play B major with the A shape, barre at fret:',
                  prompt_es: 'Para tocar B mayor con la forma de A, pon la cejilla en el traste:',
                  answer: 1,
                  explain: 'A string, fret 2 = B.',
                  explain_es: 'Cuerda La, traste 2 = B.',
                  choices: ['1', '2', '4', '7'],
                  choices_es: ['1', '2', '4', '7'] }
              },
              {
                label: 'Name all 12 roots', label_es: 'Nombra las 12 raíces',
                text: 'Try it: run through all 12 chromatic notes out loud and, for each, name the fret where an E-shape barre would land on that root — you\'ll drill this same idea for both shapes at the practice station.',
                text_es: 'Pruébalo: recorre en voz alta las 12 notas cromáticas y, para cada una, nombra el traste donde caería una cejilla en forma de E sobre esa raíz — vas a practicar esta misma idea con ambas formas en la estación de práctica.',
                hint: 'One shape, twelve chords — the ONLY thing that changes is which fret you barre.',
                hint_es: 'Una forma, doce acordes — lo ÚNICO que cambia es en cuál traste pones la cejilla.',
                skills: [5],
                response: { type: 'mc', prompt: 'One movable shape gives you twelve different chords because:',
                  prompt_es: 'Una forma movible te da doce acordes distintos porque:',
                  answer: 0,
                  explain: 'Slide the shape, and the root fret renames it — one grip, the whole chromatic set.',
                  explain_es: 'Desliza la forma, y el traste de la raíz la renombra — un solo agarre, todo el conjunto cromático.',
                  choices: ['You can barre at each of the 12 frets before the octave repeats', 'Guitars have 12 strings', 'You use 12 fingers', 'It doesn\'t — each shape is one chord'],
                  choices_es: ['Puedes poner la cejilla en cada uno de los 12 trastes antes de que se repita la octava', 'Las guitarras tienen 12 cuerdas', 'Usas 12 dedos', 'No lo hace — cada forma es un solo acorde'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: open shapes or barres?', label_es: 'Cierre: ¿formas abiertas o cejillas?',
                text: 'Station Wrap-Up — open shapes or barre shapes: which would you pick for "Let It Be", and why? (Don\'t stop — the 12-bar blues section is below!)',
                text_es: 'Cierre de la estación — formas abiertas o formas con cejilla: ¿cuál elegirías para "Let It Be", y por qué? (¡No pares — la sección de blues de 12 compases está abajo!)',
                response: { type: 'short', placeholder: 'e.g. open — it rings better; but the barre F is better than the mini-F once my hand is warm',
                  placeholder_es: 'p. ej. abierta — suena mejor; pero la F con cejilla es mejor que la mini-F una vez que mi mano está caliente' }
              }
            ]
          },
          {
            title: 'The 12-bar blues — the form your I–IV–V was waiting for',
            title_es: 'El blues de 12 compases — la forma que tu I–IV–V estaba esperando',
            steps: [
              {
                label: 'Watch: 12-bar blues in E', label_es: 'Mira: blues de 12 compases en E',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=kurgOIcTCIE" target="_blank">How To Play Old School 12 Bar Blues Guitar No.1 EASY Beginners - Chords Key E – EricBlackmonGuitar (0:00–4:41)</a>. The 12-bar blues is I–IV–V — the exact chords you\'ve been building this set — used to build the most-played song form in American music. Watch for two things:<ul><li>The ORDER the chords arrive in.</li><li>The long-short "shuffle" bounce in the strumming hand.</li></ul>',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=kurgOIcTCIE" target="_blank">How To Play Old School 12 Bar Blues Guitar No.1 EASY Beginners - Chords Key E – EricBlackmonGuitar (0:00–4:41)</a>. El blues de 12 compases es I–IV–V — los mismos acordes que has estado construyendo en esta unidad — usado para armar la forma de canción más tocada en la música estadounidense. Fíjate en dos cosas:<ul><li>El ORDEN en que llegan los acordes.</li><li>El rebote largo-corto de "shuffle" en la mano que rasguea.</li></ul>',
                hint: 'Thousands of songs are this one form. Learn it once and you can jam (play along freely and make up your own part) with people you\'ve just met for the rest of your life.',
                hint_es: 'Miles de canciones usan esta única forma. Apréndela una vez y podrás improvisar (jam: tocar libremente junto con otros e inventar tu propia parte) con gente que acabas de conocer por el resto de tu vida.',
                skills: [7]
              },
              {
                label: 'Quick check: the blues chords', label_es: 'Revisión rápida: los acordes del blues',
                text: 'Check yourself on the form\'s ingredients before you play it at the practice station.',
                text_es: 'Ponte a prueba con los ingredientes de la forma antes de tocarla en la estación de práctica.',
                response: { type: 'mc', prompt: 'A standard 12-bar blues in A uses which three chords?',
                  prompt_es: 'Un blues de 12 compases estándar en A usa cuáles tres acordes:',
                  answer: 0,
                  explain: 'It\'s the I, IV, and V of A — each with a bluesy 7th added. You already know I–IV–V from this set; the blues just gives it a form.',
                  explain_es: 'Es el I, IV y V de A — cada uno con una 7ª bluesera agregada. Ya conoces el I–IV–V de esta unidad; el blues solo le da una forma.',
                  choices: ['A7, D7, E7', 'A, Bm, C#', 'A7, C7, G7', 'Am, Dm, Em'],
                  choices_es: ['A7, D7, E7', 'A, Bm, C#', 'A7, C7, G7', 'Am, Dm, Em'] }
              },
              {
                label: 'Quick check: shuffle feel', label_es: 'Revisión rápida: la sensación de shuffle',
                text: 'One more — the feel is half the style.',
                text_es: 'Una más — la sensación es la mitad del estilo.',
                response: { type: 'mc', prompt: '"Shuffle feel" means the eighth notes are played:',
                  prompt_es: 'La "sensación de shuffle" significa que las corcheas se tocan:',
                  answer: 1,
                  explain: 'Swing the pair — DAH-da DAH-da. Even eighths make it rock; long-short makes it blues.',
                  explain_es: 'Balancea el par — DAH-da DAH-da. Las corcheas parejas lo hacen sonar a rock; largo-corto lo hace sonar a blues.',
                  choices: ['Perfectly even', 'Long-short, like a heartbeat', 'As fast as possible', 'Only on downbeats'],
                  choices_es: ['Perfectamente parejas', 'Largo-corto, como un latido', 'Lo más rápido posible', 'Solo en los tiempos fuertes'] }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — barre chords as harmony tools',
        title_es: 'Estación de práctica — acordes con cejilla como herramientas de armonía',
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
            title: 'Root-naming drill',
            title_es: 'Ejercicio de nombrar raíces',
            steps: [
              {
                label: 'Challenge 1 — Root-Naming Drill', label_es: 'Reto 1 — Ejercicio de nombrar raíces',
                text: 'First, warm the hand up — then the drill:<ol><li>Run a quick Finger Gym stretch (<a href="https://youtu.be/XDt_4ha9Xjs" target="_blank">The Finger Gym – JustinGuitar</a>) before today\'s barre-heavy work.</li><li>Call out a handful of chord names from memory (any of the 12) and, for each one, find BOTH barre locations — the E-shape fret on the low E string AND the A-shape fret on the A string.</li></ol>',
                text_es: 'Primero, calienta la mano — luego el ejercicio:<ol><li>Haz un estiramiento rápido de Gimnasio de Dedos (<a href="https://youtu.be/XDt_4ha9Xjs" target="_blank">The Finger Gym – JustinGuitar</a>) antes del trabajo intenso de cejillas de hoy.</li><li>Nombra de memoria un puñado de acordes (cualquiera de los 12) y, para cada uno, encuentra AMBAS ubicaciones de cejilla — el traste de la forma de E en la cuerda Mi grave Y el traste de la forma de A en la cuerda La.</li></ol>',
                hint: 'Every chord has (at least) two barre homes — one for each shape. Module 9\'s fretboard naming is the whole trick here.',
                hint_es: 'Cada acorde tiene (al menos) dos hogares de cejilla — uno por cada forma. El nombrado del diapasón del Módulo 9 es todo el truco aquí.',
                stuck: 'Find the E-shape location first, get comfortable, then add the A-shape hunt.',
                stuck_es: 'Encuentra primero la ubicación de la forma de E, ponte cómodo, y luego agrega la búsqueda de la forma de A.',
                levelUp: 'Time yourself finding both locations and try to beat your best time, or add a third barre location further up the neck.',
                levelUp_es: 'Cronométrate encontrando ambas ubicaciones e intenta superar tu mejor tiempo, o agrega una tercera ubicación de cejilla más arriba en el mástil.',
                skills: [1, 2]
              }
            ]
          },
          {
            title: 'Build I–IV–V in a named key',
            title_es: 'Construye I–IV–V en una tonalidad nombrada',
            steps: [
              {
                label: 'Challenge 2 — I–IV–V Builder', label_es: 'Reto 2 — Constructor de I–IV–V',
                text: '<ol><li>Play I–IV–V in G (G open or fret-3 barre · C · D).</li><li>Then in A.</li><li>Then in whatever key the deck below deals you.</li></ol>You\'ve got it when: clean changes in time at 60 BPM, using at least one barre shape.',
                text_es: '<ol><li>Toca I–IV–V en G (G abierto o cejilla en el traste 3 · C · D).</li><li>Luego en A.</li><li>Luego en la tonalidad que te reparta la baraja de abajo.</li></ol>Lo tienes cuando: cambios limpios y a tiempo a 60 BPM, usando al menos una forma con cejilla.',
                drill: { type: 'deck', deck: 'keys-IIVV' },
                hint: 'Once you know I–IV–V\'s shape in one key, moving the whole progression to a new key is just sliding your hands.',
                hint_es: 'Una vez que conoces la forma del I–IV–V en una tonalidad, mover toda la progresión a una tonalidad nueva es solo deslizar tus manos.',
                stuck: 'Stay in G until the changes are automatic, then move the whole progression up together.',
                stuck_es: 'Quédate en G hasta que los cambios sean automáticos, y luego mueve toda la progresión hacia arriba junta.',
                levelUp: 'Play I–IV–V in a key using barre shapes only — no open chords at all.',
                levelUp_es: 'Toca I–IV–V en una tonalidad usando solo formas con cejilla — sin ningún acorde abierto.',
                skills: [3, 4]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            title_es: 'Llévalo a una canción',
            steps: [
              {
                label: 'Challenge — "Oye Mi Amor", full barre', label_es: 'Reto — "Oye Mi Amor", cejilla completa',
                text: '<ul><li>Play the verse\'s Bm–G with a full A-shape barre Bm — the song\'s last beginner shortcut, gone for good.</li></ul>You\'ve got it when: four laps (a lap = one full time through) where the full Bm rings as clean as the G.',
                text_es: '<ul><li>Toca el Bm–G de la estrofa con una cejilla completa en forma de A para Bm — el último atajo de principiante de la canción, desaparecido para siempre.</li></ul>Lo tienes cuando: cuatro vueltas (una vuelta = un recorrido completo) donde el Bm completo suena tan limpio como el G.',
                hint: 'This is Module 7\'s payoff, finally put to use as a harmony tool instead of just a shape to survive.',
                hint_es: 'Esta es la recompensa del Módulo 7, finalmente usada como herramienta de armonía en lugar de solo una forma para sobrevivir.',
                stuck: 'Warm up the A-shape Bm alone for a minute before adding the G change.',
                stuck_es: 'Calienta el Bm en forma de A solo durante un minuto antes de agregar el cambio a G.',
                levelUp: 'Explain out loud why Bm is the vi chord of D major — check the inventory: both Bm and G live in D\'s family — using what you learned in Set 1.',
                levelUp_es: 'Explica en voz alta por qué Bm es el acorde vi de D mayor — revisa el inventario: tanto Bm como G viven en la familia de D — usando lo que aprendiste en la Unidad 1.',
                skills: [6],
                chords: [
                  { name: 'Bm (A-shape barre)', chord: [[6,'x'],[5,2,'1'],[4,4,'3'],[3,4,'4'],[2,3,'2'],[1,2,'1']], position: 2 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            title_es: 'Cierre de la estación',
            steps: [
              {
                label: 'Wrap-up: two homes for C major', label_es: 'Cierre: dos lugares para C mayor',
                text: 'Where are the two places to play C major as a barre — and which shape is friendlier to your hand today? (Don\'t stop — the 12-bar blues section is below!)',
                text_es: '¿Cuáles son los dos lugares para tocar C mayor como cejilla — y cuál forma es más amigable para tu mano hoy? (¡No pares — la sección de blues de 12 compases está abajo!)',
                response: { type: 'short', placeholder: 'e.g. E-shape fret 8 or A-shape fret 3 — the A-shape one is easier for me right now',
                  placeholder_es: 'p. ej. forma de E en el traste 8 o forma de A en el traste 3 — la de forma de A es más fácil para mí ahora mismo' }
              }
            ]
          },
          {
            title: 'Play the 12-bar blues',
            title_es: 'Toca el blues de 12 compases',
            steps: [
              {
                label: 'Meet A7, D7, and E7', label_es: 'Conoce A7, D7 y E7',
                text: 'Meet the three chords: A7, D7, E7 — your I, IV, and V in A, each with the bluesy 7th built in:<ol><li>Fret each one clean.</li><li>Then strum each for a bar with a long-short shuffle feel at 60 BPM.</li></ol>',
                text_es: 'Conoce los tres acordes: A7, D7, E7 — tu I, IV y V en A, cada uno con la 7ª bluesera incorporada:<ol><li>Trastea cada uno limpio.</li><li>Luego rasguea cada uno durante un compás con una sensación de shuffle largo-corto a 60 BPM.</li></ol>',
                hint: 'All three are open-position shapes — no barre needed. The shuffle lives in your strumming wrist: DAH-da DAH-da.',
                hint_es: 'Los tres son formas en posición abierta — no se necesita cejilla. El shuffle vive en tu muñeca que rasguea: DAH-da DAH-da.',
                skills: [7],
                chords: [
                  { name: 'A7', chord: [[6,'x'],[5,0],[4,2,'2'],[3,0],[2,2,'3'],[1,0]], position: 0 },
                  { name: 'D7', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,1,'1'],[1,2,'3']], position: 0 },
                  { name: 'E7', chord: [[6,0],[5,2,'2'],[4,0],[3,1,'1'],[2,0],[1,0]], position: 0 }
                ]
              },
              {
                label: 'Play the 12-bar map', label_es: 'Toca el mapa de 12 compases',
                text: 'The 12-bar map in A: A7 A7 A7 A7 | D7 D7 A7 A7 | E7 D7 A7 E7.<ol><li>Say each chord name OUT LOUD on beat 1 as you strum the bar — losing the form is the most common blues mistake, and counting bars aloud is the fix.</li><li>Try the quick-change variant: swap D7 into bar 2 instead of staying on A7 — the "quick change" hands your ear the IV chord early, and it\'s the version you\'ll hear in most modern blues.</li></ol>',
                text_es: 'El mapa de 12 compases en A: A7 A7 A7 A7 | D7 D7 A7 A7 | E7 D7 A7 E7.<ol><li>Di el nombre de cada acorde EN VOZ ALTA en el tiempo 1 mientras rasgueas el compás — perder la forma es el error más común del blues, y contar los compases en voz alta es la solución.</li><li>Prueba la variante de cambio rápido: cambia a D7 en el compás 2 en lugar de quedarte en A7 — el "cambio rápido" le entrega a tu oído el acorde IV antes de tiempo, y es la versión que escucharás en la mayoría del blues moderno.</li></ol>',
                hint: 'That last E7 in bar 12 is the "turnaround" — it pulls the music back to bar 1 so the form can loop forever.',
                hint_es: 'Ese último E7 en el compás 12 es el "giro" — jala la música de vuelta al compás 1 para que la forma pueda repetirse para siempre.',
                skills: [7, 8]
              },
              {
                label: 'Comp the full 12 bars', label_es: 'Acompaña los 12 compases completos',
                text: 'Put it together:<ol><li>Comp the full 12 bars from memory with shuffle feel at 60 BPM.</li><li>Record a pass and loop your recording.</li><li>Solo over your own comping with A minor pentatonic (your Module 4 box at fret 5).</li></ol>You\'ve got it when: a full chorus of each job (one chorus = one full trip through the 12 bars) — comping without losing the form, soloing without losing the changes.',
                text_es: 'Júntalo todo:<ol><li>Acompaña los 12 compases completos de memoria con sensación de shuffle a 60 BPM.</li><li>Graba una pasada y repite tu grabación en loop.</li><li>Haz un solo sobre tu propio acompañamiento con la pentatónica menor de A (tu caja del Módulo 4 en el traste 5).</li></ol>Lo tienes cuando: una ronda completa de cada trabajo (una ronda = un recorrido completo por los 12 compases) — acompañar sin perder la forma, hacer un solo sin perder los cambios.',
                hint: 'Comping = playing the backing chords while someone else solos. When the loop comes back to A7, land on an A — hearing that "home" arrival is the most important thing. Playing with someone? One comps while the other solos, then swap.',
                hint_es: 'Acompañar = tocar los acordes de base mientras alguien más hace un solo. Cuando el loop vuelve a A7, aterriza en una A — escuchar esa llegada a "casa" es lo más importante. ¿Tocando con alguien? Uno acompaña mientras el otro hace el solo, y luego cambian.',
                skills: [7, 8]
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Names any barre chord from its root fret · Moves one shape to three named roots · Plays I–IV–V in a named key · Comps a 12-bar blues in A with shuffle feel, including the quick-change and turnaround',
      goal_es: 'Nombra cualquier acorde con cejilla a partir del traste de su raíz · Mueve una forma a tres raíces nombradas · Toca I–IV–V en una tonalidad nombrada · Acompaña un blues de 12 compases en A con sensación de shuffle, incluyendo el cambio rápido y el giro',
      performance: 'Draw a key at random; play its I–IV–V using at least one barre shape, changes in time at 60 BPM. Then play the 12-bar blues in A (A7–D7–E7) from memory at 60 BPM with a shuffle strum, landing the turnaround in bar 12 without stopping.',
      selfCheck: 'Where are the two places to play C major as a barre? Which shape is friendlier to your hand today? What does the quick-change do in bar 2 of a 12-bar blues?',
      selfCheck_es: '¿Cuáles son los dos lugares para tocar C mayor como cejilla? ¿Cuál forma es más amigable para tu mano hoy? ¿Qué hace el cambio rápido en el compás 2 de un blues de 12 compases?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm11w3-s1', text: 'Play the E-shape major barre and name its root from the low-E fret',
        text_es: 'Tocar la cejilla mayor en forma de E y nombrar su raíz a partir del traste en la Mi grave',
        gotItWhen: 'you can play an E-shape barre at any fret and instantly name it from the note under your finger on the low E string — fret 8 is C.',
        gotItWhen_es: 'puedes tocar una cejilla en forma de E en cualquier traste y nombrarla al instante a partir de la nota debajo de tu dedo en la cuerda Mi grave — el traste 8 es C.',
        practice: { type: 'mc', prompt: 'E-shape barre, fret 8:', prompt_es: 'Cejilla en forma de E, traste 8:', choices: ['C major', 'G major', 'A major', 'B major'], choices_es: ['C mayor', 'G mayor', 'A mayor', 'B mayor'], answer: 0,
          explain: 'The E shape gets its name from the note under your barre finger on the low E string, and that string at fret 8 is C. The same shape at fret 3 would be G — only the fret changes the name.',
          explain_es: 'La forma de E toma su nombre de la nota debajo del dedo de la cejilla en la cuerda Mi grave, y esa cuerda en el traste 8 da C. La misma forma en el traste 3 sería G — solo el traste cambia el nombre.' } },
      { id: 'm11w3-s2', text: 'Play the A-shape major barre and name its root from the A-string fret',
        text_es: 'Tocar la cejilla mayor en forma de A y nombrar su raíz a partir del traste en la cuerda La',
        gotItWhen: 'you can play an A-shape barre at any fret and instantly name it from the note under your finger on the A string — fret 5 is D.',
        gotItWhen_es: 'puedes tocar una cejilla en forma de A en cualquier traste y nombrarla al instante a partir de la nota debajo de tu dedo en la cuerda La — el traste 5 es D.',
        practice: { type: 'mc', prompt: 'A-shape barre, fret 7:', prompt_es: 'Cejilla en forma de A, traste 7:', choices: ['D major', 'E major', 'F major', 'G major'], choices_es: ['D mayor', 'E mayor', 'F mayor', 'G mayor'], answer: 1,
          explain: 'The A shape reads its root off the A string, and the A string at fret 7 is E. Fret 5 there would be D — one grip, a new name at every fret.',
          explain_es: 'La forma de A lee su raíz en la cuerda La, y la cuerda La en el traste 7 da E. El traste 5 ahí sería D — un solo agarre, un nombre nuevo en cada traste.' } },
      { id: 'm11w3-s3', text: 'Play a I–IV–V in a randomly drawn key using barre and/or open shapes',
        text_es: 'Tocar un I–IV–V en una tonalidad sacada al azar usando formas con cejilla y/o abiertas',
        gotItWhen: 'you can play a clean I–IV–V in whatever key the deck deals you, changes in time at 60 BPM, using at least one barre shape.',
        gotItWhen_es: 'puedes tocar un I–IV–V limpio en la tonalidad que te reparta la baraja, con cambios a tiempo a 60 BPM, usando al menos una forma con cejilla.',
        practice: { type: 'mc', prompt: 'Your I chord is an E-shape barre at fret 3 (G). Where do IV and V live?',
          prompt_es: 'Tu acorde I es una cejilla en forma de E en el traste 3 (G). ¿Dónde viven el IV y el V?',
          choices: ['A-shape at the SAME fret (C), then A-shape 2 frets up (D)', 'E-shape at frets 4 and 5', 'A-shape at frets 1 and 2', 'Only the open C and D shapes work'],
          choices_es: ['Forma de A en el MISMO traste (C), y luego forma de A 2 trastes arriba (D)', 'Forma de E en los trastes 4 y 5', 'Forma de A en los trastes 1 y 2', 'Solo funcionan las formas abiertas de C y D'], answer: 0,
          explain: 'The movable I–IV–V grip: IV sits on the A-shape at the I chord\'s fret, and V is 2 frets above it. Learn it once and it works in every key.',
          explain_es: 'El agarre movible de I–IV–V: el IV se ubica en la forma de A en el traste del acorde I, y el V está 2 trastes arriba. Apréndelo una vez y funciona en todas las tonalidades.' } },
      { id: 'm11w3-s4', text: 'Move one barre shape to three different named roots',
        text_es: 'Mover una forma con cejilla a tres raíces distintas nombradas',
        gotItWhen: 'you can slide one E-shape barre to F, G, and A without re-fingering it, naming each root as you land on it.',
        gotItWhen_es: 'puedes deslizar una cejilla en forma de E hasta F, G y A sin cambiar los dedos, nombrando cada raíz al llegar a ella.',
        practice: { type: 'chord', label: 'One E-shape, three roots — F · G · A', label_es: 'Una forma de E, tres raíces — F · G · A',
          chords: [
            { name: 'F major', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
            { name: 'G major', chord: [[6,3,'1'],[5,5,'3'],[4,5,'4'],[3,4,'2'],[2,3,'1'],[1,3,'1']], position: 3 },
            { name: 'A major', chord: [[6,5,'1'],[5,7,'3'],[4,7,'4'],[3,6,'2'],[2,5,'1'],[1,5,'1']], position: 5 }
          ] } },
      { id: 'm11w3-s5', text: 'Explain why one movable shape equals twelve chords',
        text_es: 'Explicar por qué una forma movible equivale a doce acordes',
        gotItWhen: 'you can explain that sliding one barre shape up or down renames the chord — the fret under the root note is the only thing that changes.',
        gotItWhen_es: 'puedes explicar que deslizar una forma de cejilla hacia arriba o abajo renombra el acorde — el traste debajo de la nota raíz es lo único que cambia.',
        practice: { type: 'mc', prompt: 'To turn an E-shape G (fret 3) into an E-shape A, move:', prompt_es: 'Para convertir un G en forma de E (traste 3) en un A en forma de E, mueve:', choices: ['Up 2 frets', 'Down 2 frets', 'Up 1 string', 'Nowhere — re-finger it'], choices_es: ['2 trastes hacia arriba', '2 trastes hacia abajo', '1 cuerda hacia arriba', 'A ningún lado — cambia los dedos'], answer: 0,
          explain: 'One fret is one half step (the smallest distance in music), and G up to A is two of them. Your fingers never change — sliding the root to a new fret is what renames the chord.',
          explain_es: 'Un traste es un semitono (la distancia más pequeña en la música), y de G a A hay dos. Tus dedos no cambian en nada — deslizar la raíz a un traste nuevo es lo que le cambia el nombre al acorde.' } },
      { id: 'm11w3-s6', text: 'Choose open vs barre voicing for a progression and say why',
        text_es: 'Elegir un acorde abierto o uno con cejilla para una progresión y explicar por qué',
        gotItWhen: 'you can say when you\'d reach for a barre (roots with no open shape, like Bb or F#) versus an open chord (a bigger ringing sound), instead of picking one out of habit.',
        gotItWhen_es: 'puedes decir cuándo elegirías una cejilla (raíces sin forma abierta, como Bb o F#) frente a un acorde abierto (un sonido más grande y resonante), en lugar de elegir uno por costumbre.',
        practice: { type: 'mc', prompt: 'When is a BARRE voicing the better pick for a progression?',
          prompt_es: '¿Cuándo es el acorde con cejilla la mejor opción para una progresión?',
          choices: ['When the roots have no open shape (Bb, F#…) — one movable grip covers them all', 'Always — barre chords are more advanced, so they\'re better', 'When you want ringing open strings in the sound', 'Never — open shapes cover every song'],
          choices_es: ['Cuando las raíces no tienen forma abierta (Bb, F#…) — un solo agarre movible las cubre todas', 'Siempre — los acordes con cejilla son más avanzados, así que son mejores', 'Cuando quieres cuerdas al aire sonando en el sonido', 'Nunca — las formas abiertas cubren todas las canciones'], answer: 0,
          explain: 'It\'s a sound-and-logistics choice, not a skill ranking: barres reach any root and mute cleanly; open shapes ring bigger. Pick per progression, not by difficulty.',
          explain_es: 'Es una decisión de sonido y logística, no un ranking de destreza: las cejillas alcanzan cualquier raíz y se silencian limpio; las formas abiertas suenan más grandes. Elige según la progresión, no por dificultad.' } },
      { id: 'm11w3-s7', text: 'Comp a 12-bar blues in A with shuffle feel (A7–D7–E7)',
        text_es: 'Acompañar un blues de 12 compases en A con sensación de shuffle (A7–D7–E7)',
        gotItWhen: 'you can play all 12 bars from memory at 60 BPM with a long-short shuffle strum, without losing your place in the form.',
        gotItWhen_es: 'puedes tocar los 12 compases completos de memoria a 60 BPM con un rasgueo shuffle largo-corto, sin perder tu lugar en la forma.',
        practice: { type: 'playSeq', label: 'The 12-bar form — one root per bar (A·A·A·A · D·D·A·A · E·D·A·E)', label_es: 'La forma de 12 compases — una raíz por compás (A·A·A·A · D·D·A·A · E·D·A·E)', bpm: 60,
          notes: [45, 45, 45, 45, 50, 50, 45, 45, 52, 50, 45, 52] } },
      { id: 'm11w3-s8', text: 'Explain and play the quick-change and the turnaround',
        text_es: 'Explicar y tocar el cambio rápido y el giro',
        gotItWhen: 'you can say what bar 2 does in a quick-change blues and land the E7 turnaround in bar 12 without stopping.',
        gotItWhen_es: 'puedes decir qué hace el compás 2 en un blues de cambio rápido y aterrizar el giro de E7 en el compás 12 sin detenerte.',
        practice: { type: 'mc', prompt: 'In a 12-bar blues in A, what does the "quick change" do?',
          prompt_es: 'En un blues de 12 compases en A, ¿qué hace el "cambio rápido"?',
          choices: ['Jumps to the IV chord (D7) in bar 2 instead of staying on A7', 'Doubles the tempo for one bar', 'Skips the turnaround entirely', 'Changes key halfway through'],
          choices_es: ['Salta al acorde IV (D7) en el compás 2 en vez de quedarse en A7', 'Duplica el tempo por un compás', 'Se salta el giro por completo', 'Cambia de tonalidad a la mitad'], answer: 0,
          explain: 'Quick change = an early visit to IV in bar 2, back to I in bar 3. The turnaround is the other bookend: V (E7) in bar 12 pulling you back to the top.',
          explain_es: 'Cambio rápido = una visita temprana al IV en el compás 2, de vuelta al I en el compás 3. El giro es el otro extremo: el V (E7) en el compás 12 jalándote de regreso al inicio.' } }
    ]
  }

); // end module-11.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[11] = [
      { name: '"Let It Be" — The Beatles', meta: 'C–G–Am–F = I–V–vi–IV, the famous four', meta_es: 'C–G–Am–F = I–V–vi–IV, los famosos cuatro', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=_Kw4subj5z8' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'F–Am = I–iii in F — proof it\'s not always the famous four', meta_es: 'F–Am = I–iii en F — prueba de que no siempre son los famosos cuatro', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Number the progression in C', meta_es: 'Numera la progresión en C', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Find the key from Am–G–F', meta_es: 'Encuentra la tonalidad a partir de Am–G–F', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Bm and barre practice with numerals', meta_es: 'Práctica de Bm y cejilla con números romanos', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=UlkG3DmZJEI',
        tutorialUrl: 'https://www.youtube.com/watch?v=F4BbTdP2v70' },
      { name: '"House of the Rising Sun" — The Animals', meta: 'Number an A-minor-family progression', meta_es: 'Numera una progresión de la familia de A menor', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=q9dyAQLYybU' }
    ];

MODULE_REVIEWS[11] = {
  moduleNum: 11,
  module: 'Chords, Keys & Harmony',
  module_es: 'Acordes, Tonalidades y Armonía',
  skills: [
    { id: 'mr11-s1', text: 'I can build a triad (root–3rd–5th) from any major scale', text_es: 'Puedo construir una tríada (raíz–3ª–5ª) a partir de cualquier escala mayor', set: 'm11w1' },
    { id: 'mr11-s2', text: 'I can label a chord progression with Roman numerals, including "Luna"\'s F–Am vamp as I–iii', text_es: 'Puedo etiquetar una progresión de acordes con números romanos, incluyendo el vamp F–Am de "Luna" como I–iii', set: 'm11w1' },
    { id: 'mr11-s3', text: 'I can figure out a song\'s key from the chords it uses', text_es: 'Puedo averiguar la tonalidad de una canción a partir de los acordes que usa', set: 'm11w2' },
    { id: 'mr11-s4', text: 'I can read a slash chord (like G/B) and know which note goes on the bottom', text_es: 'Puedo leer un acorde con barra diagonal (como G/B) y saber qué nota va abajo', set: 'm11w2' },
    { id: 'mr11-s5', text: 'I can name a barre chord\'s root from either the E-shape or A-shape fret', text_es: 'Puedo nombrar la raíz de un acorde con cejilla a partir del traste en forma de E o de A', set: 'm11w3' },
    { id: 'mr11-s6', text: 'I can play a I–IV–V progression in a randomly drawn key using open or barre shapes', text_es: 'Puedo tocar una progresión I–IV–V en una tonalidad sacada al azar usando formas abiertas o con cejilla', set: 'm11w3' },
    { id: 'mr11-s7', text: 'I can comp a 12-bar blues in A with shuffle feel, including the quick-change and turnaround', text_es: 'Puedo acompañar un blues de 12 compases en A con sensación de shuffle, incluyendo el cambio rápido y el giro', set: 'm11w3' }
  ],
  assessItems: [
    'Analyze a thread song\'s progression in Roman numerals and name its key',
    'Play a I–IV–V progression in a key you draw at random — open or barre shapes',
    'Comp a 12-bar blues in A with shuffle feel, then solo over a recording of your own comping — with another player, comp while they solo and trade'
  ],
  assessItems_es: [
    'Analiza la progresión de una canción principal en números romanos y nombra su tonalidad',
    'Toca una progresión I–IV–V en una tonalidad que saques al azar — formas abiertas o con cejilla',
    'Acompaña un blues de 12 compases en A con sensación de shuffle, y luego haz un solo sobre una grabación de tu propio acompañamiento — con otro músico, acompaña mientras el otro hace el solo y luego cambien'
  ],
  forward: 'You can name what every chord is DOING now, and one barre grip just became twelve chords. <strong>Module 12 is the fun final stretch — you\'ll use everything you\'ve learned:</strong> we study fingerstyle in detail — alternating thumb, waltz patterns, and the requinto sound — everything you need to pick your showcase song.',
  forward_es: 'Ahora puedes nombrar qué está HACIENDO cada acorde, y un solo agarre de cejilla se acaba de convertir en doce acordes. <strong>El Módulo 12 es el divertido tramo final — vas a usar todo lo que has aprendido:</strong> estudiamos el fingerstyle a fondo — pulgar alternante, patrones de vals y el sonido de requinto — todo lo que necesitas para elegir tu canción para la muestra.',
  standards: ['Pr.4a', 'Pr.6a', 'Cn.10a', 'Re.9a']
};
