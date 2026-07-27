// ============================================================
//  MODULE 13 — String Changing
//  A single-flow module (no Station B/C): one "learn the process"
//  tab, then the skills checklist = the graded in-class assessment.
//  Covers BOTH nylon/classical (ball-end strings — no tie knot) and
//  steel-string. Edit this file to change Module 13 content.
// ============================================================

// ── Step photos (2026-07-27). Seven hand-sketched panels of the full
//    process, one figure per step. Art only — the captions live in the step
//    text so they translate with everything else. ──
const m13Photo = (file, alt) =>
  `<span class="step-figure"><img src="img/${file}" alt="${alt}"></span>`;

const M13_P1_EN = m13Photo('m13-step-1-loosen.png', 'Sketch of a hand turning a tuning key at a classical headstock, arrows showing the string going slack.');
const M13_P1_ES = m13Photo('m13-step-1-loosen.png', 'Dibujo de una mano girando una clavija en un clavijero clásico, con flechas que muestran la cuerda aflojándose.');
const M13_P2_EN = m13Photo('m13-step-2-unwind-and-pull.png', 'Sketch of a hand pulling the loose end of a string out of the tuning post.');
const M13_P2_ES = m13Photo('m13-step-2-unwind-and-pull.png', 'Dibujo de una mano sacando la punta suelta de la cuerda del poste de afinación.');
const M13_P3_EN = m13Photo('m13-step-3-remove-at-bridge.png', 'Sketch of a hand drawing the loose ball end of a string back out of a classical tie block.');
const M13_P3_ES = m13Photo('m13-step-3-remove-at-bridge.png', 'Dibujo de una mano sacando la bolita suelta de la cuerda del bloque del puente.');
const M13_P4_EN = m13Photo('m13-step-4-seat-ball-end.png', 'Sketch of a hand feeding a new ball-end string into a classical tie block.');
const M13_P4_ES = m13Photo('m13-step-4-seat-ball-end.png', 'Dibujo de una mano metiendo una cuerda nueva con bolita en el bloque del puente.');
const M13_P5_EN = m13Photo('m13-step-5-thread-the-post.png', 'Sketch of a string guided over the nut and threaded through the hole in the tuning post, with slack left over the fretboard.');
const M13_P5_ES = m13Photo('m13-step-5-thread-the-post.png', 'Dibujo de una cuerda guiada por la cejuela y pasada por el agujero del poste, dejando holgura sobre el diapasón.');
const M13_P6_EN = m13Photo('m13-step-6-lock-and-wind.png', 'Sketch of two hands winding a tuning key while guiding the string down the post, arrows showing the wraps walking downward.');
const M13_P6_ES = m13Photo('m13-step-6-lock-and-wind.png', 'Dibujo de dos manos girando la clavija mientras guían la cuerda hacia abajo por el poste, con flechas que muestran las vueltas bajando.');
const M13_P7_EN = m13Photo('m13-step-7-tune-and-stretch.png', 'Sketch of a clip-on tuner on a classical headstock while a string is brought up to pitch.');
const M13_P7_ES = m13Photo('m13-step-7-tune-and-stretch.png', 'Dibujo de un afinador de pinza en un clavijero clásico mientras se sube una cuerda a su tono.');

SETS.push(

  {
    id: 'm13w1',
    label: 'Set 1',
    locked: false,
    module: 'Changing Your Strings',
    moduleNum: 13,
    unit: 'Module 13 · Changing Your Strings',
    unit_es: 'Módulo 13 · Cambio de cuerdas',
    title: 'Set 1',
    subtitle: 'All six anchored & wound · Stretched and in tune · Done and cleared in 40 minutes',
    subtitle_es: 'Las seis ancladas y enrolladas · Estiradas y afinadas · Listo y recogido en 40 minutos',
    skillFocus: 'Every string anchored · Every post wound neatly · Stretched and in tune · Finished and cleared in 40 minutes',
    skillFocus_es: 'Cada cuerda anclada · Cada poste enrollado ordenado · Estiradas y afinadas · Terminado y recogido en 40 minutos',
    comingSoon: false,

    // Graded in-class assessment: these four rows ARE the rubric, and they
    // match the Unit 2b grid in the Semester 1 Map one-for-one — Anchored,
    // Wound, In tune, Finished in time. The assessment is a FULL six-string
    // restring on a 40-minute clock (revised 2026-07-27; it was a single
    // string before). Safety is taught and enforced throughout but is not
    // scored on its own row.
    checklistSub: 'Graded in-class assessment · full restring',
    checklistSub_es: 'Evaluación calificada en clase · cambio completo',

    skills: [
      { id: 'm13w1-s1',
        text: 'Anchored — every string secured at both ends, ball end flat at the tie block and each string on its own post',
        text_es: 'Anclada — cada cuerda sujeta en ambos extremos, la bolita plana en el bloque del puente y cada cuerda en su propio poste',
        gotItWhen: 'Every string you installed sits flat against the back of the tie block and runs to its own post in the right order, thickest to thinnest — and a gentle tug moves nothing.',
        gotItWhen_es: 'Cada cuerda que instalaste queda plana contra la parte trasera del bloque del puente y llega a su propio poste en el orden correcto, de la más gruesa a la más delgada — y un jalón suave no mueve nada.',
        practice: { type: 'mc',
          prompt: 'Our nylon strings have ball ends. At the tie block that means:',
          prompt_es: 'Nuestras cuerdas de nylon tienen bolita. En el bloque del puente eso significa:',
          choices: ['Tie the traditional knot anyway', 'Thread through and let the ball seat flat against the block — no knot', 'Glue the string in place', 'Wrap it around the saddle twice'],
          choices_es: ['Hacer el nudo tradicional de todos modos', 'Pasarla por el agujero y dejar que la bolita quede plana contra el bloque — sin nudo', 'Pegar la cuerda con pegamento', 'Darle dos vueltas a la selleta'],
          answer: 1,
          explain: 'The ball does the knot\'s job. Pull the string snug until the ball sits flat against the back of the tie block — that\'s the whole trick.',
          explain_es: 'La bolita hace el trabajo del nudo. Tensa la cuerda hasta que la bolita quede plana contra la parte trasera del bloque — ese es todo el truco.' } },
      { id: 'm13w1-s2',
        text: 'Wound — every post has 2–3 neat wraps walking down, no crossovers, excess trimmed',
        text_es: 'Enrollada — cada poste con 2–3 vueltas ordenadas que bajan, sin cruces y con el sobrante recortado',
        gotItWhen: 'Every post you wound has two to three wraps walking down the post, each one below the last, with nothing crossing over and the leftover tail trimmed close.',
        gotItWhen_es: 'Cada poste que enrollaste tiene dos o tres vueltas que bajan por el poste, cada una debajo de la anterior, sin nada cruzado y con la punta sobrante recortada al ras.',
        practice: { type: 'mc',
          prompt: 'Each new wrap around the tuning post should go:',
          prompt_es: 'Cada vuelta nueva alrededor del poste debe ir:',
          choices: ['On top of the previous wrap', 'Below the previous wrap, walking down the post', 'Wherever it lands', 'Around the next post over'],
          choices_es: ['Encima de la vuelta anterior', 'Debajo de la vuelta anterior, bajando por el poste', 'Donde caiga', 'Alrededor del poste de al lado'],
          answer: 1,
          explain: 'Wraps that walk down the post press the string toward the headstock, keeping it seated in the nut slot and helping it stay in tune.',
          explain_es: 'Las vueltas que bajan por el poste empujan la cuerda hacia el clavijero, la mantienen asentada en su ranura de la cejuela y ayudan a que no se desafine.' } },
      { id: 'm13w1-s3',
        text: 'In tune — every string stretched and re-tuned at least twice, reading in tune at the final check',
        text_es: 'Afinada — cada cuerda estirada y reafinada al menos dos veces, marcando afinada en la revisión final',
        gotItWhen: 'You have stretched and re-tuned every string you installed at least twice, and on the final check the tuner reads in tune on all of them.',
        gotItWhen_es: 'Has estirado y vuelto a afinar al menos dos veces cada cuerda que instalaste, y en la revisión final el afinador las marca todas afinadas.',
        practice: { type: 'mc',
          prompt: 'A brand-new nylon string keeps going flat. That means:',
          prompt_es: 'Una cuerda de nylon nueva se pone baja (bemol) una y otra vez. Eso significa:',
          choices: ['The string is defective', 'It is still stretching — stretch and re-tune until it holds', 'The tuner is broken', 'You wound it too tightly'],
          choices_es: ['La cuerda está defectuosa', 'Todavía se está estirando — estira y vuelve a afinar hasta que se mantenga', 'El afinador está descompuesto', 'La enrollaste demasiado apretada'],
          answer: 1,
          explain: 'New strings stretch — nylon for days. Gently stretching and re-tuning speeds up the settling. A fresh set will still drift after class; that is the material, not your mistake.',
          explain_es: 'Las cuerdas nuevas se estiran — las de nylon durante días. Estirarlas con suavidad y volver a afinar acelera el proceso. Un juego nuevo se seguirá moviendo después de clase; eso es el material, no un error tuyo.' } },
      { id: 'm13w1-s4',
        text: 'Finished in time — all six strings done and your station clear inside 40 minutes',
        text_es: 'Terminado a tiempo — las seis cuerdas listas y tu lugar recogido en menos de 40 minutos',
        gotItWhen: 'At the 40-minute call your six strings are on and your station is clear: old strings coiled in the trash, tools back where they belong, nothing left on the floor, the stand, or the chair.',
        gotItWhen_es: 'Cuando se marcan los 40 minutos tus seis cuerdas están puestas y tu lugar está recogido: las cuerdas viejas enrolladas en la basura, las herramientas en su lugar, y nada en el piso, el atril ni la silla.',
        practice: { type: 'mc',
          prompt: 'Your six strings are on and in tune at 38 minutes. Before you raise your hand you should:',
          prompt_es: 'Tus seis cuerdas están puestas y afinadas a los 38 minutos. Antes de levantar la mano debes:',
          choices: ['Raise your hand right away — the strings are what count', 'Coil the old strings into the trash and put the tools back', 'Start loosening them again to double-check', 'Leave the old strings for whoever cleans up'],
          choices_es: ['Levantar la mano de inmediato — lo que cuenta son las cuerdas', 'Enrollar las cuerdas viejas, echarlas a la basura y guardar las herramientas', 'Empezar a aflojarlas otra vez para revisar', 'Dejar las cuerdas viejas para quien limpie'],
          answer: 1,
          explain: 'The clock does not stop until the station is clear. Old string ends are sharp, and a loose string on the floor finds someone\'s foot — clearing up is part of finishing the job.',
          explain_es: 'El reloj no se detiene hasta que el lugar está recogido. Las puntas de las cuerdas viejas son filosas, y una cuerda suelta en el piso encuentra el pie de alguien — recoger es parte de terminar el trabajo.' } }
    ],

    stations: {
      b: {
        title: 'The string-changing process',
        title_es: 'El proceso de cambio de cuerdas',
        tabTitle: 'Learn the process',
        tabTitle_es: 'Aprende el proceso',
        tabSub: 'Watch · Read · Try it',
        tabSub_es: 'Mira · Lee · Inténtalo',
        sections: [
          {
            title: 'Before you start',
            title_es: 'Antes de empezar',
            steps: [
              {
                label: 'Why strings get changed', label_es: 'Por qué se cambian las cuerdas',
                text: 'Strings wear out: they sound dull, feel rough, slip out of tune, and eventually break. Restringing a guitar is normal maintenance — every guitarist learns it, and by the end of this module you\'ll be the person in the room who can do it. You\'ve got it when: you can name two signs a set of strings needs changing.',
                text_es: 'Las cuerdas se desgastan: suenan opacas, se sienten ásperas, se desafinan y al final se rompen. Cambiar las cuerdas es mantenimiento normal — todo guitarrista lo aprende, y al final de este módulo tú serás quien sepa hacerlo. Lo tienes cuando: puedes nombrar dos señales de que un juego de cuerdas necesita cambio.',
                skills: [4]
              },
              {
                label: 'Gather your tools', label_es: 'Reúne tus herramientas',
                text: 'Set up your workspace before you touch a peg:<ul><li>A full set of strings — check the package so you know which is which (E, A, D, G, B, e).</li><li>String winder (speeds up loosening and winding — it is the single biggest time-saver).</li><li>Wire cutters or scissors for trimming.</li><li>A cloth, and a soft surface or neck support so the guitar lies flat and safe.</li><li>The site\'s tuner (in the toolbar) for the tuning steps.</li><li>A trash can within reach.</li></ul>You\'ve got it when: everything is within reach before the first string comes off.',
                text_es: 'Prepara tu espacio antes de tocar una clavija:<ul><li>Un juego completo de cuerdas — revisa el paquete para saber cuál es cuál (Mi grave, La, Re, Sol, Si, mi aguda).</li><li>Manivela para cuerdas (acelera aflojar y enrollar — es lo que más tiempo ahorra).</li><li>Cortador o tijeras para recortar.</li><li>Un paño, y una superficie suave o soporte para el mástil, con la guitarra plana y segura.</li><li>El afinador del sitio (en la barra de herramientas) para los pasos de afinación.</li><li>Un bote de basura a la mano.</li></ul>Lo tienes cuando: todo está a tu alcance antes de quitar la primera cuerda.',
                hint: 'No winder? Everything works by hand — it just takes longer, and on a full restring that difference is most of your 40 minutes. No neck support? A folded towel under the headstock works.',
                hint_es: '¿Sin manivela? Todo se puede a mano — solo tarda más, y en un cambio completo esa diferencia se lleva casi todos tus 40 minutos. ¿Sin soporte? Una toalla doblada bajo el clavijero funciona.',
                skills: [4]
              },
              {
                label: 'Six strings — but one at a time', label_es: 'Seis cuerdas — pero una a la vez',
                text: 'You are changing the whole set, and the safe way to do that is one string at a time:<ul><li>Take one off, put its replacement on, then move to the next.</li><li>Never strip all six at once — the neck loses its tension all at the same time.</li><li>The five strings still on give you neighbours to tune against.</li></ul>Work in a fixed order (low E across to high e) so you never lose your place. You\'ve got it when: you can trace any string from its bridge hole to its own tuning post before you turn anything.',
                text_es: 'Vas a cambiar el juego completo, y la forma segura de hacerlo es una cuerda a la vez:<ul><li>Quita una, pon su reemplazo, y pasa a la siguiente.</li><li>Nunca quites las seis de golpe — el mástil pierde toda su tensión al mismo tiempo.</li><li>Las cinco cuerdas que siguen puestas te sirven de referencia para afinar.</li></ul>Trabaja en un orden fijo (de la cuerda Mi grave hacia la cuerda mi aguda) para no perder el hilo. Lo tienes cuando: puedes seguir cualquier cuerda desde su agujero en el puente hasta su propio poste antes de girar nada.',
                hint: 'Follow each string with a finger from the bridge all the way up to its tuning peg before you loosen anything — turning the wrong peg is the #1 mistake, and on a full restring you get six chances to make it.',
                hint_es: 'Sigue cada cuerda con un dedo desde el puente hasta su clavija antes de aflojar nada — girar la clavija equivocada es el error #1, y en un cambio completo tienes seis oportunidades de cometerlo.',
                skills: [1]
              },
              {
                label: 'The 40-minute target', label_es: 'La meta de 40 minutos',
                text: 'The graded restring runs on a 40-minute clock:<ul><li>The clock starts when your teacher says begin.</li><li>It stops when you raise your hand AND your station is clear.</li><li>Practice runs are untimed — the clock only applies to the graded attempt.</li></ul>Forty minutes is enough time to work carefully and not enough to redo a string three times, so the pace comes from getting each one right the first time. You\'ve got it when: you know what has to be true before you raise your hand.',
                text_es: 'El cambio calificado corre con un reloj de 40 minutos:<ul><li>El reloj empieza cuando tu maestro dice comienza.</li><li>Se detiene cuando levantas la mano Y tu lugar está recogido.</li><li>Las prácticas no se cronometran — el reloj solo aplica al intento calificado.</li></ul>Cuarenta minutos alcanzan para trabajar con cuidado, pero no para rehacer una cuerda tres veces, así que el ritmo sale de hacer bien cada una a la primera. Lo tienes cuando: sabes qué debe estar listo antes de levantar la mano.',
                skills: [4]
              }
            ]
          },
          {
            title: 'Watch the full process',
            title_es: 'Mira el proceso completo',
            steps: [
              {
                label: 'Watch: steel-string change', label_es: 'Mira: cambio en cuerdas de acero',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=F3kyhAQMefg" target="_blank">How To Change Acoustic Guitar Strings - Pro Tips for Beginners – Lauren Bateman</a>. Watch for the bridge-pin trick and the wraps walking down the post.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=F3kyhAQMefg" target="_blank">How To Change Acoustic Guitar Strings - Pro Tips for Beginners – Lauren Bateman</a> (en inglés). Fíjate en el truco del pin del puente y en las vueltas que bajan por el poste.',
                skills: [1, 2]
              },
              {
                label: 'Watch: nylon restring', label_es: 'Mira: cambio en guitarra de nylon',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=qfOUA-S1qgk" target="_blank">Tech Corner: How to Restring Your Nylon String Guitar – Takamine Guitars</a>. One difference from our classroom: the video ties the traditional knot at the bridge — our strings have BALL ENDS, so you\'ll skip the knot (next section shows how).',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=qfOUA-S1qgk" target="_blank">Tech Corner: How to Restring Your Nylon String Guitar – Takamine Guitars</a> (en inglés). Una diferencia con nuestro salón: el video hace el nudo tradicional en el puente — nuestras cuerdas tienen BOLITA, así que el nudo no se hace (la siguiente sección muestra cómo).',
                skills: [1]
              },
              {
                label: 'Watch: ball-end nylon strings', label_es: 'Mira: cuerdas de nylon con bolita',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=2VJOpT7gjU0" target="_blank">How to restring: Classical Nylon Guitar with Ernie Ball Earthwood BALL End – LEARNINGCHORDS</a>. This is exactly our setup — nylon strings with ball ends, no knot at the tie block.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=2VJOpT7gjU0" target="_blank">How to restring: Classical Nylon Guitar with Ernie Ball Earthwood BALL End – LEARNINGCHORDS</a> (en inglés). Es exactamente nuestro caso — cuerdas de nylon con bolita, sin nudo en el bloque.',
                skills: [1]
              },
              {
                label: 'En español: a luthier changes nylon strings', label_es: 'En español: un luthier cambia cuerdas de nylon',
                text: 'In Spanish: <a href="https://www.youtube.com/watch?v=8OPL_9ZA4qk" target="_blank">Luthier Profesional enseña cómo cambiar las cuerdas de guitarra de Nylon fácil – guitarraviva</a>. A professional luthier walks the whole nylon process.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=8OPL_9ZA4qk" target="_blank">Luthier Profesional enseña cómo cambiar las cuerdas de guitarra de Nylon fácil – guitarraviva</a>. Un luthier profesional muestra todo el proceso en nylon.',
                skills: [1, 2]
              }
            ]
          },
          {
            title: 'Take the old string off — safely',
            title_es: 'Quita la cuerda vieja — con seguridad',
            steps: [
              {
                label: 'Loosen until floppy', label_es: 'Afloja hasta que quede suelta',
                text: `Loosen the string safely:<ol><li>Turn that string's tuning key so the pitch drops — pluck as you go and hear it sink.</li><li>Keep going until the string is completely floppy against the fretboard.</li><li>NEVER cut or unhook a string that's still tight: the stored tension can whip it at your face or scratch the top.</li></ol>This rule is not graded — it is simply the rule, every string, every time. You've got it when: you can wiggle the string loosely with one finger.${M13_P1_EN}`,
                text_es: `Afloja la cuerda con seguridad:<ol><li>Gira la clavija de esa cuerda para que el tono baje — puntea mientras giras y escucha cómo cae.</li><li>Sigue hasta que la cuerda quede completamente suelta sobre el diapasón.</li><li>NUNCA cortes ni sueltes una cuerda que sigue tensa: la tensión guardada puede azotarla contra tu cara o rayar la tapa.</li></ol>Esta regla no se califica — simplemente es la regla, en cada cuerda, siempre. Lo tienes cuando: puedes mover la cuerda floja con un dedo.${M13_P1_ES}`,
                stuck: 'Pitch going UP instead of down? You\'re turning the wrong way — or the wrong peg. Trace the string to its peg again and reverse the turn.',
                stuck_es: '¿El tono SUBE en vez de bajar? Estás girando al revés — o la clavija equivocada. Vuelve a seguir la cuerda hasta su clavija e invierte el giro.',
                skills: [4]
              },
              {
                label: 'Free it at the post', label_es: 'Suéltala en el poste',
                text: `With the string floppy, unwind the last wraps at the post and slide the end out of the post hole. Nothing should need forcing — if it does, the string is not loose enough yet. You've got it when: the end comes free without pinging or snagging.${M13_P2_EN}`,
                text_es: `Con la cuerda suelta, desenrolla las últimas vueltas del poste y saca la punta del agujero. Nada debería costar trabajo — si cuesta, la cuerda todavía no está lo bastante floja. Lo tienes cuando: la punta sale sin saltar ni atorarse.${M13_P2_ES}`,
                skills: [4]
              },
              {
                label: 'Free it at the bridge', label_es: 'Suéltala en el puente',
                text: `At the bridge:<ul><li>Nylon ball-end (our guitars): draw the string back out through the tie block hole.</li><li>Steel: ease the bridge pin out — a winder's notch is made for this — and lift the ball out.</li></ul>You've got it when: the string is off with nothing forced and nothing pinging loose.${M13_P3_EN}`,
                text_es: `En el puente:<ul><li>Nylon con bolita (nuestras guitarras): regresa la cuerda por el agujero del bloque del puente.</li><li>Acero: saca el pin del puente con cuidado — la muesca de la manivela es para eso — y levanta la bolita.</li></ul>Lo tienes cuando: la cuerda salió sin forzar nada y sin que nada saltara.${M13_P3_ES}`,
                hint: 'Bridge pin stuck? Never pry with pliers against the bridge — push the ball end down into the guitar a little first, then pull the pin straight up.',
                hint_es: '¿Pin atorado? Nunca hagas palanca con pinzas contra el puente — primero empuja la bolita un poco hacia adentro y luego jala el pin recto hacia arriba.',
                skills: [4]
              },
              {
                label: 'Coil and toss', label_es: 'Enrolla y a la basura',
                text: 'Deal with the old string the moment it comes off:<ol><li>Coil it into a loop (wrap it around your hand a few times).</li><li>Put it straight in the trash — string ends are sharp, and a loose string on the floor finds someone\'s foot.</li></ol>Do this each time rather than saving six for the end; a pile of old strings is how a station ends up not clear at 40 minutes. You\'ve got it when: no old string ever touches the floor.',
                text_es: 'Ocúpate de la cuerda vieja en cuanto sale:<ol><li>Enróllala en un aro (dale unas vueltas alrededor de tu mano).</li><li>Ponla directo en la basura — las puntas son filosas, y una cuerda suelta en el piso encuentra el pie de alguien.</li></ol>Hazlo cada vez en lugar de juntar seis para el final; un montón de cuerdas viejas es justo lo que deja un lugar sin recoger a los 40 minutos. Lo tienes cuando: ninguna cuerda vieja toca el piso.',
                skills: [4]
              }
            ]
          },
          {
            title: 'Seat the new string at the bridge',
            title_es: 'Asienta la cuerda nueva en el puente',
            steps: [
              {
                label: 'Nylon: ball end at the tie block', label_es: 'Nylon: la bolita en el bloque del puente',
                text: `Our classroom strings are ball-end nylon — no tie knot needed:<ol><li>Check the package and pick the right string for the slot you just emptied.</li><li>Push the plain end through the tie block hole, entering from the soundhole side.</li><li>Pull it through until the ball reaches the block.</li><li>Pull snug so the ball sits FLAT against the back of the tie block.</li></ol>You've got it when: a gentle tug doesn't shift the ball at all.${M13_P4_EN}`,
                text_es: `Nuestras cuerdas del salón son de nylon con bolita — no se necesita nudo:<ol><li>Revisa el paquete y elige la cuerda correcta para el lugar que acabas de dejar libre.</li><li>Pasa la punta lisa por el agujero del bloque, entrando por el lado de la boca.</li><li>Jálala hasta que la bolita llegue al bloque.</li><li>Tensa hasta que la bolita quede PLANA contra la parte trasera del bloque.</li></ol>Lo tienes cuando: un jalón suave no mueve la bolita para nada.${M13_P4_ES}`,
                hint: 'The ball should touch the wood of the block itself, not hang below it or wedge sideways. If it sits crooked, feed a little string back and re-seat it.',
                hint_es: 'La bolita debe tocar la madera del bloque, no colgar por debajo ni quedar de lado. Si queda chueca, regresa un poco de cuerda y asiéntala de nuevo.',
                skills: [1]
              },
              {
                label: 'Steel: bridge pin', label_es: 'Acero: el pin del puente',
                text: `On a steel-string acoustic the ball end lives under the bridge:<ol><li>Drop the ball end into the pin hole.</li><li>Insert the bridge pin with its groove facing the string (toward the soundhole).</li><li>Press the pin down while pulling the string gently UP — you'll feel the ball lock against the bridge plate.</li></ol>You've got it when: the pin stays put and the string doesn't pull free with a gentle tug.`,
                text_es: `En una acústica de cuerdas de acero la bolita vive debajo del puente:<ol><li>Deja caer la bolita en el agujero del pin.</li><li>Mete el pin con su ranura mirando hacia la cuerda (hacia la boca).</li><li>Presiona el pin hacia abajo mientras jalas la cuerda suave hacia ARRIBA — sentirás la bolita trabarse contra la placa del puente.</li></ol>Lo tienes cuando: el pin se queda en su lugar y la cuerda no se sale con un jalón suave.`,
                stuck: 'Pin keeps popping up as you tune? The ball is riding on the pin\'s tip instead of the plate. Take it out and re-seat: ball in first, pin after, pull up while pressing down.',
                stuck_es: '¿El pin se levanta al afinar? La bolita está montada en la punta del pin y no en la placa. Sácalo y asienta de nuevo: primero la bolita, luego el pin, jala hacia arriba mientras presionas.',
                skills: [1]
              }
            ]
          },
          {
            title: 'Wind it at the post',
            title_es: 'Enróllala en el poste',
            steps: [
              {
                label: 'Thread and leave slack', label_es: 'Ensarta y deja holgura',
                text: `Thread the string:<ol><li>Guide it over its own slot in the nut.</li><li>Feed the free end through the hole in the tuning post.</li><li>Don't pull it tight — leave a hand's width of slack over the fretboard (about two frets' worth of extra string).</li></ol>That slack becomes your 2–3 wraps. You've got it when: the string is through the post with visible slack left.${M13_P5_EN}`,
                text_es: `Ensarta la cuerda:<ol><li>Guíala por su propia ranura en la cejuela.</li><li>Pasa la punta libre por el agujero del poste.</li><li>No la tenses — deja una holgura del ancho de una mano sobre el diapasón (como dos trastes de cuerda extra).</li></ol>Esa holgura se convierte en tus 2–3 vueltas. Lo tienes cuando: la cuerda pasó por el poste y queda holgura visible.${M13_P5_ES}`,
                skills: [2]
              },
              {
                label: 'Wind — wraps walk DOWN', label_es: 'Enrolla — las vueltas BAJAN',
                text: `Hold light tension on the string with one hand and turn the key with the other:<ol><li>Check direction: tightening should RAISE the pitch and wrap the string so it heads straight to its nut slot.</li><li>Each new wrap goes BELOW the last one, walking down the post.</li><li>Stop at 2–3 neat wraps, string seated in its nut slot.</li></ol>You've got it when: the wraps stack cleanly with no crossing and the string sits in its nut slot.${M13_P6_EN}`,
                text_es: `Mantén una tensión ligera con una mano y gira la clavija con la otra:<ol><li>Revisa la dirección: al apretar, el tono debe SUBIR y la cuerda debe salir del poste directo a su ranura en la cejuela.</li><li>Cada vuelta nueva va DEBAJO de la anterior, bajando por el poste.</li><li>Detente en 2–3 vueltas ordenadas, con la cuerda asentada en su ranura.</li></ol>Lo tienes cuando: las vueltas quedan limpias, sin cruzarse, y la cuerda descansa en su ranura de la cejuela.${M13_P6_ES}`,
                stuck: 'Wraps piling on top of each other? Unwind, re-check your slack (a hand\'s width), and guide the string lower on the post with your free thumb as you wind.',
                stuck_es: '¿Las vueltas se amontonan? Desenrolla, revisa tu holgura (el ancho de una mano) y guía la cuerda hacia abajo en el poste con el pulgar libre mientras enrollas.',
                levelUp: 'Wind so the very first wrap crosses OVER the loose tail, locking it in place — the pro trick that keeps slippery nylon from creeping.',
                levelUp_es: 'Haz que la primera vuelta cruce POR ENCIMA de la punta suelta, dejándola atrapada — el truco pro que evita que el nylon resbaloso se corra.',
                skills: [2]
              },
              {
                label: 'Trim the excess', label_es: 'Recorta el sobrante',
                text: 'Cut the leftover tail close to the post with wire cutters or scissors (nylon cuts easily; steel needs cutters). A long tail:<ul><li>Buzzes.</li><li>Pokes fingers.</li><li>Looks unfinished.</li></ul>Trim as you go — six untrimmed tails at the end is both a mess and a graded miss. You\'ve got it when: nothing sticks out more than about half a centimeter.',
                text_es: 'Corta la punta sobrante al ras del poste con cortador o tijeras (el nylon se corta fácil; el acero necesita cortador). Una punta larga:<ul><li>Vibra.</li><li>Pica dedos.</li><li>Se ve descuidada.</li></ul>Recorta sobre la marcha — seis puntas sin recortar al final son un desorden y también un punto perdido. Lo tienes cuando: nada sobresale más de medio centímetro.',
                skills: [2]
              }
            ]
          },
          {
            title: 'Tune, stretch, re-tune',
            title_es: 'Afina, estira, vuelve a afinar',
            steps: [
              {
                label: 'Bring it to pitch', label_es: 'Llévala a su tono',
                text: `Bring the new string to pitch:<ol><li>Open the tuner (toolbar).</li><li>Bring the string up to its note, coming up TO the pitch from below.</li><li>If you overshoot, drop below and come back up.</li></ol>You've got it when: the tuner reads in tune three plucks in a row.${M13_P7_EN}`,
                text_es: `Lleva la cuerda nueva a su tono:<ol><li>Abre el afinador (en la barra de herramientas).</li><li>Sube la cuerda hasta su nota, llegando AL tono desde abajo.</li><li>Si te pasas, baja y vuelve a subir.</li></ol>Lo tienes cuando: el afinador marca afinada tres punteos seguidos.${M13_P7_ES}`,
                skills: [3]
              },
              {
                label: 'Stretch and re-tune — twice', label_es: 'Estira y reafina — dos veces',
                text: 'New strings stretch, and a whole new set pulls each other flat. Speed up the settling:<ol><li>Gently pull the string a few centimeters away from the fretboard, along its length. Gentle — this is a stretch, not a snap.</li><li>Re-tune (it will read flat).</li><li>Do this at least twice on every string.</li></ol>Once all six are on, go back around the whole guitar again — tuning the high strings pulls the low ones out. You\'ve got it when: every string has had at least two stretch-and-re-tune passes.',
                text_es: 'Las cuerdas nuevas se estiran, y un juego entero se jala entre sí hacia abajo. Acelera el proceso:<ol><li>Jala la cuerda con suavidad unos centímetros lejos del diapasón, a lo largo. Suave — es un estiramiento, no un tirón.</li><li>Vuelve a afinar (marcará baja).</li><li>Haz esto al menos dos veces en cada cuerda.</li></ol>Cuando ya estén las seis, da otra vuelta completa a la guitarra — afinar las agudas desafina las graves. Lo tienes cuando: cada cuerda tuvo al menos dos pasadas de estirar y reafinar.',
                hint: 'A brand-new nylon set will keep drifting for days no matter how well you work. That is why you are graded on the two stretch passes and the final check, not on the guitar still being in tune tomorrow.',
                hint_es: 'Un juego de nylon nuevo se seguirá moviendo durante días por bien que trabajes. Por eso se te califican las dos pasadas de estiramiento y la revisión final, no que la guitarra siga afinada mañana.',
                skills: [3]
              },
              {
                label: 'The hold test', label_es: 'La prueba final',
                text: 'A last check before you raise your hand:<ol><li>Play something — a riff, a chord, one lap of the Daily 5.</li><li>Check the tuner again and touch up anything that drifted.</li></ol>This is a habit worth having, not a graded step — a fresh set will still move after class. You\'ve got it when: you have played the guitar and re-checked every string once more.',
                text_es: 'Una última revisión antes de levantar la mano:<ol><li>Toca algo — un riff, un acorde, una vuelta del Daily 5.</li><li>Revisa el afinador otra vez y corrige lo que se haya movido.</li></ol>Esto es un buen hábito, no un paso calificado — un juego nuevo seguirá moviéndose después de clase. Lo tienes cuando: ya tocaste la guitarra y revisaste otra vez cada cuerda.',
                skills: [3]
              }
            ]
          },
          {
            title: 'Your assessment',
            title_es: 'Tu evaluación',
            steps: [
              {
                label: 'How you\'ll be graded', label_es: 'Cómo se te calificará',
                text: 'This module ends with a graded, in-class restring: you change all six strings while your teacher checks your work. You\'re graded on the four skills in the checklist tab:<ol><li><b>Anchored</b> — every string secured at both ends, on its own post.</li><li><b>Wound</b> — 2–3 neat wraps per post, walking down, excess trimmed.</li><li><b>In tune</b> — stretched and re-tuned at least twice, in tune at the final check.</li><li><b>Finished in time</b> — all six done and your station clear inside 40 minutes.</li></ol>The first three are judged on the strings you actually installed, so an unfinished string only costs you once. Open the checklist to see exactly what each element looks like when it\'s done right.',
                text_es: 'Este módulo termina con un cambio de cuerdas calificado en clase: cambias las seis cuerdas mientras tu maestro revisa tu trabajo. Se te califica en las cuatro habilidades de la pestaña de la lista:<ol><li><b>Anclada</b> — cada cuerda sujeta en ambos extremos, en su propio poste.</li><li><b>Enrollada</b> — 2–3 vueltas ordenadas por poste, bajando, con el sobrante recortado.</li><li><b>Afinada</b> — estirada y reafinada al menos dos veces, afinada en la revisión final.</li><li><b>Terminado a tiempo</b> — las seis listas y tu lugar recogido en menos de 40 minutos.</li></ol>Las primeras tres se califican sobre las cuerdas que de verdad instalaste, así que una cuerda sin terminar solo te cuesta una vez. Abre la lista para ver exactamente cómo se ve cada elemento bien hecho.',
                skills: [1, 2, 3, 4]
              },
              {
                label: 'What "station clear" means', label_es: 'Qué significa "lugar recogido"',
                text: 'The clock does not stop when the last string is in tune — it stops when the station is clear:<ul><li>All six old strings coiled and in the trash.</li><li>Winder, cutters, and cloth back where they belong.</li><li>Nothing left on the floor, the stand, or the chair.</li></ul>Then raise your hand. You\'ve got it when: someone could sit down at your station and start playing without moving anything first.',
                text_es: 'El reloj no se detiene cuando la última cuerda queda afinada — se detiene cuando el lugar está recogido:<ul><li>Las seis cuerdas viejas enrolladas y en la basura.</li><li>La manivela, el cortador y el paño de vuelta en su lugar.</li><li>Nada en el piso, el atril ni la silla.</li></ul>Entonces levanta la mano. Lo tienes cuando: alguien podría sentarse en tu lugar y empezar a tocar sin mover nada antes.',
                skills: [4]
              }
            ]
          }
        ]
      }
    }
  }

);
