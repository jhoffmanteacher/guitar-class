// ============================================================
//  MODULE 13 — String Changing
//  A single-flow module (no Station B/C): one "learn the process"
//  tab, then the skills checklist = the graded in-class assessment.
//  Covers BOTH nylon/classical (ball-end strings — no tie knot) and
//  steel-string. Edit this file to change Module 13 content.
// ============================================================

// ── Shared step diagrams (inline SVG so the labels can be translated —
//    the _es text field carries the same drawing with Spanish labels). ──
const M13_SVG_STYLE = 'display:block;width:100%;max-width:420px;height:auto;border:1px solid #ddd;border-radius:10px;background:#fff;margin-top:10px';

function m13BallEndSVG(L){
  // Cross-section of a classical tie block with a BALL-END string seated.
  return `<span class="step-figure"><svg viewBox="0 0 420 190" style="${M13_SVG_STYLE}" role="img" aria-label="${L.aria}">
    <rect x="0" y="120" width="420" height="8" fill="#d9c9a3"/>
    <rect x="120" y="88" width="150" height="52" rx="6" fill="#8a5a33"/>
    <rect x="132" y="62" width="10" height="28" rx="2" fill="#f2ede2" stroke="#bbb"/>
    <path d="M10 40 Q 90 40 135 62" fill="none" stroke="#185fa5" stroke-width="3"/>
    <line x1="137" y1="90" x2="137" y2="108" stroke="#185fa5" stroke-width="3"/>
    <line x1="137" y1="108" x2="252" y2="108" stroke="#185fa5" stroke-width="3"/>
    <circle cx="262" cy="108" r="9" fill="#b3372a"/>
    <line x1="271" y1="99" x2="271" y2="117" stroke="#6b3d1f" stroke-width="3"/>
    <path d="M60 30 l-26 8 26 8" fill="none" stroke="#3b6d11" stroke-width="2.5"/>
    <text x="70" y="36" font-family="sans-serif" font-size="13" fill="#3b6d11">${L.toNut}</text>
    <text x="120" y="165" font-family="sans-serif" font-size="13" fill="#333">${L.block}</text>
    <text x="240" y="88" font-family="sans-serif" font-size="13" fill="#b3372a">${L.ball}</text>
    <text x="112" y="52" font-family="sans-serif" font-size="13" fill="#555">${L.saddle}</text>
  </svg></span>`;
}

function m13BridgePinSVG(L){
  // Cross-section of a steel-string bridge: pin in its hole, ball locked
  // against the bridge plate, string running up and out.
  return `<span class="step-figure"><svg viewBox="0 0 420 200" style="${M13_SVG_STYLE}" role="img" aria-label="${L.aria}">
    <rect x="90" y="70" width="240" height="26" rx="6" fill="#8a5a33"/>
    <rect x="0" y="96" width="420" height="10" fill="#d9c9a3"/>
    <rect x="60" y="106" width="300" height="10" fill="#c9b183"/>
    <path d="M196 40 L212 40 L208 96 L200 96 Z" fill="#f2ede2" stroke="#999"/>
    <circle cx="204" cy="34" r="8" fill="#f2ede2" stroke="#999"/>
    <circle cx="188" cy="112" r="8" fill="#b3372a"/>
    <path d="M192 104 Q 196 70 196 40" fill="none" stroke="#185fa5" stroke-width="3"/>
    <path d="M196 40 Q 150 20 40 24" fill="none" stroke="#185fa5" stroke-width="3"/>
    <path d="M300 30 l0 -18 m-6 8 l6 -8 6 8" fill="none" stroke="#3b6d11" stroke-width="2.5"/>
    <text x="312" y="22" font-family="sans-serif" font-size="13" fill="#3b6d11">${L.pull}</text>
    <text x="222" y="38" font-family="sans-serif" font-size="13" fill="#555">${L.pin}</text>
    <text x="120" y="145" font-family="sans-serif" font-size="13" fill="#b3372a">${L.ball}</text>
    <text x="90" y="66" font-family="sans-serif" font-size="13" fill="#333">${L.bridge}</text>
  </svg></span>`;
}

function m13WindingSVG(L){
  // One tuning post, front view: string through the hole, wraps walking
  // DOWN the post, excess to trim.
  return `<span class="step-figure"><svg viewBox="0 0 420 210" style="${M13_SVG_STYLE}" role="img" aria-label="${L.aria}">
    <rect x="180" y="30" width="34" height="130" rx="8" fill="#cfcfcf" stroke="#999"/>
    <rect x="176" y="20" width="42" height="14" rx="4" fill="#bdbdbd" stroke="#999"/>
    <ellipse cx="197" cy="52" rx="24" ry="6" fill="none" stroke="#185fa5" stroke-width="3"/>
    <ellipse cx="197" cy="66" rx="24" ry="6" fill="none" stroke="#185fa5" stroke-width="3"/>
    <ellipse cx="197" cy="80" rx="24" ry="6" fill="none" stroke="#185fa5" stroke-width="3"/>
    <line x1="197" y1="44" x2="150" y2="30" stroke="#185fa5" stroke-width="3"/>
    <line x1="221" y1="80" x2="221" y2="200" stroke="#185fa5" stroke-width="3"/>
    <path d="M258 44 a 30 18 0 1 1 -8 -28" fill="none" stroke="#3b6d11" stroke-width="2.5"/>
    <path d="M250 16 l 10 -2 -4 10" fill="#3b6d11"/>
    <path d="M120 20 l22 14 m0 -14 l-22 14" stroke="#b3372a" stroke-width="2.5"/>
    <text x="60" y="52" font-family="sans-serif" font-size="13" fill="#b3372a">${L.trim}</text>
    <text x="240" y="72" font-family="sans-serif" font-size="13" fill="#185fa5">${L.wraps}</text>
    <text x="266" y="30" font-family="sans-serif" font-size="13" fill="#3b6d11">${L.turn}</text>
    <text x="120" y="196" font-family="sans-serif" font-size="13" fill="#333">${L.toNutV}</text>
  </svg></span>`;
}

const M13_D1_EN = m13BallEndSVG({ aria:'Ball-end string seated against the back of a classical tie block', toNut:'to the saddle & nut', block:'tie block (bridge)', ball:'ball end sits flat', saddle:'saddle' });
const M13_D1_ES = m13BallEndSVG({ aria:'Cuerda con bolita asentada contra la parte trasera del bloque del puente', toNut:'hacia la selleta y la cejuela', block:'bloque del puente', ball:'la bolita queda plana', saddle:'selleta' });
const M13_D2_EN = m13BridgePinSVG({ aria:'Steel-string bridge pin holding the ball end against the bridge plate', pull:'pull up gently', pin:'bridge pin', ball:'ball locks under the plate', bridge:'bridge' });
const M13_D2_ES = m13BridgePinSVG({ aria:'Pin del puente sujetando la bolita contra la placa del puente', pull:'tira suave hacia arriba', pin:'pin del puente', ball:'la bolita se traba bajo la placa', bridge:'puente' });
const M13_D3_EN = m13WindingSVG({ aria:'Tuning post with the string through the hole and two to three wraps walking down the post', trim:'trim the extra', wraps:'2–3 wraps, each BELOW the last', turn:'wind this way', toNutV:'string down to the nut slot' });
const M13_D3_ES = m13WindingSVG({ aria:'Poste de afinación con la cuerda por el agujero y de dos a tres vueltas bajando por el poste', trim:'recorta el sobrante', wraps:'2–3 vueltas, cada una DEBAJO de la anterior', turn:'gira hacia acá', toNutV:'la cuerda baja a su ranura en la cejuela' });

SETS.push(

  {
    id: 'm13w1',
    label: 'Set 1',
    locked: false,
    module: 'String Changing',
    moduleNum: 13,
    unit: 'Module 13 · String Changing',
    unit_es: 'Módulo 13 · Cambio de cuerdas',
    title: 'Set 1',
    subtitle: 'Old string off safely · New string seated & wound · In tune and holding',
    subtitle_es: 'La cuerda vieja fuera con seguridad · La nueva asentada y enrollada · Afinada y estable',
    skillFocus: 'Old string off safely · Ball end seated at the bridge · Neat wraps at the post · Tuned, stretched, holding pitch',
    skillFocus_es: 'La cuerda vieja fuera con seguridad · La bolita asentada en el puente · Vueltas ordenadas en el poste · Afinada, estirada y estable',
    comingSoon: false,

    // Graded in-class assessment: these four rows ARE the rubric. The teacher
    // watches a full string change and grades each element (2026-07-23).
    checklistSub: 'Graded in-class assessment',
    checklistSub_es: 'Evaluación calificada en clase',

    skills: [
      { id: 'm13w1-s1',
        text: 'Remove the old string safely — fully loosened before it comes off, then coiled and thrown away',
        text_es: 'Quitar la cuerda vieja con seguridad — totalmente aflojada antes de sacarla, luego enrollada y a la basura',
        gotItWhen: 'You loosen the string until it is completely floppy before touching the bridge end, and the old string leaves the room coiled in the trash — never cut under tension, never left on the floor.',
        gotItWhen_es: 'Aflojas la cuerda hasta que queda completamente suelta antes de tocar el extremo del puente, y la cuerda vieja termina enrollada en la basura — nunca cortada con tensión, nunca tirada en el piso.',
        practice: { type: 'mc',
          prompt: 'Before removing a string from the bridge, you should first:',
          prompt_es: 'Antes de quitar una cuerda del puente, primero debes:',
          choices: ['Cut it with wire cutters', 'Loosen it until it is completely floppy', 'Pull the bridge pin', 'Tune it up a step'],
          choices_es: ['Cortarla con el cortador', 'Aflojarla hasta que quede completamente suelta', 'Sacar el pin del puente', 'Subirla un tono'],
          answer: 1,
          explain: 'A string under tension stores energy — cutting or yanking it can whip your face or scratch the guitar. Floppy first, always.',
          explain_es: 'Una cuerda con tensión guarda energía — cortarla o jalarla puede azotarte la cara o rayar la guitarra. Primero floja, siempre.' } },
      { id: 'm13w1-s2',
        text: 'Seat the new string securely at the bridge — ball end snug against the tie block (or bridge pin firm on steel)',
        text_es: 'Asentar la cuerda nueva firmemente en el puente — la bolita ajustada contra el bloque (o el pin firme en acero)',
        gotItWhen: 'After seating, a gentle tug moves nothing: the ball end sits flat against the back of the tie block (nylon) or stays locked under the bridge plate while you hold the pin (steel).',
        gotItWhen_es: 'Después de asentarla, un jalón suave no mueve nada: la bolita queda plana contra la parte trasera del bloque (nylon) o trabada bajo la placa mientras sujetas el pin (acero).',
        practice: { type: 'mc',
          prompt: 'Our nylon strings have ball ends. At the tie block that means:',
          prompt_es: 'Nuestras cuerdas de nylon tienen bolita. En el bloque del puente eso significa:',
          choices: ['Tie the traditional knot anyway', 'Thread through and let the ball seat flat against the block — no knot', 'Glue the string in place', 'Wrap it around the saddle twice'],
          choices_es: ['Hacer el nudo tradicional de todos modos', 'Pasarla por el agujero y dejar que la bolita quede plana contra el bloque — sin nudo', 'Pegar la cuerda con pegamento', 'Darle dos vueltas a la selleta'],
          answer: 1,
          explain: 'The ball does the knot\'s job. Pull the string snug until the ball sits flat against the back of the tie block — that\'s the whole trick.',
          explain_es: 'La bolita hace el trabajo del nudo. Tensa la cuerda hasta que la bolita quede plana contra la parte trasera del bloque — ese es todo el truco.' } },
      { id: 'm13w1-s3',
        text: 'Wind neatly at the post — correct direction, 2–3 wraps each below the last, excess trimmed',
        text_es: 'Enrollar ordenado en el poste — dirección correcta, 2–3 vueltas cada una debajo de la anterior, sobrante recortado',
        gotItWhen: 'Tightening the key raises the pitch, the wraps stack neatly walking down the post (no crossing, no pile-up), and the leftover tail is trimmed close.',
        gotItWhen_es: 'Al apretar la clavija el tono sube, las vueltas bajan ordenadas por el poste (sin cruzarse ni amontonarse), y el sobrante queda recortado al ras.',
        practice: { type: 'mc',
          prompt: 'Each new wrap around the tuning post should go:',
          prompt_es: 'Cada vuelta nueva alrededor del poste debe ir:',
          choices: ['On top of the previous wrap', 'Below the previous wrap, walking down the post', 'Wherever it lands', 'Around the next post over'],
          choices_es: ['Encima de la vuelta anterior', 'Debajo de la vuelta anterior, bajando por el poste', 'Donde caiga', 'Alrededor del poste de al lado'],
          answer: 1,
          explain: 'Wraps that walk down the post press the string toward the headstock, keeping it seated in the nut slot and helping it stay in tune.',
          explain_es: 'Las vueltas que bajan por el poste empujan la cuerda hacia el clavijero, la mantienen asentada en su ranura de la cejuela y ayudan a que no se desafine.' } },
      { id: 'm13w1-s4',
        text: 'Tune to pitch, stretch, and re-tune until the string holds',
        text_es: 'Afinar al tono, estirar y volver a afinar hasta que la cuerda se mantenga',
        gotItWhen: 'You bring the string to pitch with the tuner, stretch it gently, re-tune, and repeat until a stretch no longer knocks it out of tune — then it still reads in tune after you play it.',
        gotItWhen_es: 'Llevas la cuerda al tono con el afinador, la estiras con suavidad, vuelves a afinar y repites hasta que estirarla ya no la desafine — y sigue afinada después de tocarla.',
        practice: { type: 'mc',
          prompt: 'A brand-new string keeps going flat. That means:',
          prompt_es: 'Una cuerda nueva se pone baja (bemol) una y otra vez. Eso significa:',
          choices: ['The string is defective', 'It is still stretching — stretch and re-tune until it holds', 'The tuner is broken', 'You wound it too tightly'],
          choices_es: ['La cuerda está defectuosa', 'Todavía se está estirando — estira y vuelve a afinar hasta que se mantenga', 'El afinador está descompuesto', 'La enrollaste demasiado apretada'],
          answer: 1,
          explain: 'New strings stretch — nylon for days. Gently stretching and re-tuning speeds up the settling so the string starts holding pitch.',
          explain_es: 'Las cuerdas nuevas se estiran — las de nylon durante días. Estirarlas con suavidad y volver a afinar acelera el proceso para que la cuerda se mantenga.' } }
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
                text: 'Strings wear out: they sound dull, feel rough, slip out of tune, and eventually break. Changing a string is normal guitar maintenance — every guitarist learns it. You\'ve got it when: you can name two signs a string needs changing.',
                text_es: 'Las cuerdas se desgastan: suenan opacas, se sienten ásperas, se desafinan y al final se rompen. Cambiar una cuerda es mantenimiento normal — todo guitarrista lo aprende. Lo tienes cuando: puedes nombrar dos señales de que una cuerda necesita cambio.',
                skills: [1]
              },
              {
                label: 'Gather your tools', label_es: 'Reúne tus herramientas',
                text: 'Set up your workspace:<ul><li>The right new string — check the package for the string name (E, A, D, G, B, or e).</li><li>String winder (speeds up loosening and winding).</li><li>Wire cutters or scissors for trimming.</li><li>A cloth, and a soft surface or neck support so the guitar lies flat and safe.</li><li>The site\'s tuner (in the toolbar) for the final step.</li></ul>You\'ve got it when: everything is within reach before the old string comes off.',
                text_es: 'Prepara tu espacio:<ul><li>La cuerda nueva correcta — revisa el paquete por el nombre de la cuerda (Mi, La, Re, Sol, Si o mi).</li><li>Manivela para cuerdas (acelera aflojar y enrollar).</li><li>Cortador o tijeras para recortar.</li><li>Un paño, y una superficie suave o soporte para el mástil, con la guitarra plana y segura.</li><li>El afinador del sitio (en la barra de herramientas) para el paso final.</li></ul>Lo tienes cuando: todo está a tu alcance antes de quitar la cuerda vieja.',
                hint: 'No winder? Everything works by hand — it just takes longer. No neck support? A folded towel under the headstock works.',
                hint_es: '¿Sin manivela? Todo se puede a mano — solo tarda más. ¿Sin soporte? Una toalla doblada bajo el clavijero funciona.',
                skills: [1]
              },
              {
                label: 'One string at a time', label_es: 'Una cuerda a la vez',
                text: 'In class we change ONE string at a time. Leaving the other five tuned:<ul><li>Keeps tension on the neck.</li><li>Gives you five in-tune neighbors to tune against.</li></ul>You\'ve got it when: you can point to the string you\'re changing and name which peg and which bridge spot belong to it.',
                text_es: 'En clase cambiamos UNA cuerda a la vez. Dejar las otras cinco afinadas:<ul><li>Mantiene la tensión del mástil.</li><li>Te da cinco vecinas afinadas como referencia.</li></ul>Lo tienes cuando: puedes señalar la cuerda que vas a cambiar y decir cuál clavija y cuál punto del puente le corresponden.',
                hint: 'Follow your string with a finger from the bridge all the way up to its tuning peg before you loosen anything — turning the wrong peg is the #1 mistake.',
                hint_es: 'Sigue tu cuerda con un dedo desde el puente hasta su clavija antes de aflojar nada — girar la clavija equivocada es el error #1.',
                skills: [1]
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
                skills: [2, 3]
              },
              {
                label: 'Watch: nylon restring', label_es: 'Mira: cambio en guitarra de nylon',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=qfOUA-S1qgk" target="_blank">Tech Corner: How to Restring Your Nylon String Guitar – Takamine Guitars</a>. One difference from our classroom: the video ties the traditional knot at the bridge — our strings have BALL ENDS, so you\'ll skip the knot (next section shows how).',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=qfOUA-S1qgk" target="_blank">Tech Corner: How to Restring Your Nylon String Guitar – Takamine Guitars</a> (en inglés). Una diferencia con nuestro salón: el video hace el nudo tradicional en el puente — nuestras cuerdas tienen BOLITA, así que el nudo no se hace (la siguiente sección muestra cómo).',
                skills: [3]
              },
              {
                label: 'Watch: ball-end nylon strings', label_es: 'Mira: cuerdas de nylon con bolita',
                text: 'Watch: <a href="https://www.youtube.com/watch?v=2VJOpT7gjU0" target="_blank">How to restring: Classical Nylon Guitar with Ernie Ball Earthwood BALL End – LEARNINGCHORDS</a>. This is exactly our setup — nylon strings with ball ends, no knot at the tie block.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=2VJOpT7gjU0" target="_blank">How to restring: Classical Nylon Guitar with Ernie Ball Earthwood BALL End – LEARNINGCHORDS</a> (en inglés). Es exactamente nuestro caso — cuerdas de nylon con bolita, sin nudo en el bloque.',
                skills: [2]
              },
              {
                label: 'En español: a luthier changes nylon strings', label_es: 'En español: un luthier cambia cuerdas de nylon',
                text: 'In Spanish: <a href="https://www.youtube.com/watch?v=8OPL_9ZA4qk" target="_blank">Luthier Profesional enseña cómo cambiar las cuerdas de guitarra de Nylon fácil – guitarraviva</a>. A professional luthier walks the whole nylon process.',
                text_es: 'Mira: <a href="https://www.youtube.com/watch?v=8OPL_9ZA4qk" target="_blank">Luthier Profesional enseña cómo cambiar las cuerdas de guitarra de Nylon fácil – guitarraviva</a>. Un luthier profesional muestra todo el proceso en nylon.',
                skills: [2, 3]
              }
            ]
          },
          {
            title: 'Take the old string off — safely',
            title_es: 'Quita la cuerda vieja — con seguridad',
            steps: [
              {
                label: 'Loosen until floppy', label_es: 'Afloja hasta que quede suelta',
                text: 'Loosen the string safely:<ol><li>Turn the string\'s tuning key so the pitch drops — pluck as you go and hear it sink.</li><li>Keep going until the string is completely floppy against the fretboard.</li><li>NEVER cut or unhook a string that\'s still tight: the stored tension can whip it at your face or scratch the top.</li></ol>You\'ve got it when: you can wiggle the string loosely with one finger.',
                text_es: 'Afloja la cuerda con seguridad:<ol><li>Gira la clavija de esa cuerda para que el tono baje — puntea mientras giras y escucha cómo cae.</li><li>Sigue hasta que la cuerda quede completamente suelta sobre el diapasón.</li><li>NUNCA cortes ni sueltes una cuerda que sigue tensa: la tensión guardada puede azotarla contra tu cara o rayar la tapa.</li></ol>Lo tienes cuando: puedes mover la cuerda floja con un dedo.',
                stuck: 'Pitch going UP instead of down? You\'re turning the wrong way — or the wrong peg. Trace the string to its peg again and reverse the turn.',
                stuck_es: '¿El tono SUBE en vez de bajar? Estás girando al revés — o la clavija equivocada. Vuelve a seguir la cuerda hasta su clavija e invierte el giro.',
                skills: [1]
              },
              {
                label: 'Free it at both ends', label_es: 'Suéltala en los dos extremos',
                text: 'With the string floppy:<ol><li>Unwind the last wraps at the post and slide the end out of the post hole.</li><li>At the bridge — nylon ball-end: pull the string back through the tie block hole. Steel: ease the bridge pin out (a winder\'s notch is made for this) and lift the ball out.</li></ol>You\'ve got it when: the string is off with nothing forced and nothing pinging loose.',
                text_es: 'Con la cuerda suelta:<ol><li>Desenrolla las últimas vueltas del poste y saca la punta del agujero.</li><li>En el puente — nylon con bolita: regresa la cuerda por el agujero del bloque. Acero: saca el pin del puente con cuidado (la muesca de la manivela es para eso) y levanta la bolita.</li></ol>Lo tienes cuando: la cuerda salió sin forzar nada y sin que nada saltara.',
                hint: 'Bridge pin stuck? Never pry with pliers against the bridge — push the ball end down into the guitar a little first, then pull the pin straight up.',
                hint_es: '¿Pin atorado? Nunca hagas palanca con pinzas contra el puente — primero empuja la bolita un poco hacia adentro y luego jala el pin recto hacia arriba.',
                skills: [1]
              },
              {
                label: 'Coil and toss', label_es: 'Enrolla y a la basura',
                text: 'Dispose of the old string safely:<ol><li>Coil it into a loop (wrap it around your hand a few times).</li><li>Put it straight in the trash — string ends are sharp, and a loose string on the floor finds someone\'s foot.</li></ol>You\'ve got it when: the old string is coiled in the trash and your workspace is clear.',
                text_es: 'Desecha la cuerda vieja con seguridad:<ol><li>Enróllala en un aro (dale unas vueltas alrededor de tu mano).</li><li>Ponla directo en la basura — las puntas son filosas, y una cuerda suelta en el piso encuentra el pie de alguien.</li></ol>Lo tienes cuando: la cuerda vieja está enrollada en la basura y tu espacio quedó despejado.',
                skills: [1]
              }
            ]
          },
          {
            title: 'Seat the new string at the bridge',
            title_es: 'Asienta la cuerda nueva en el puente',
            steps: [
              {
                label: 'Nylon: ball end at the tie block', label_es: 'Nylon: la bolita en el bloque del puente',
                text: `Our classroom strings are ball-end nylon — no tie knot needed:<ol><li>Push the plain end of the string through the tie block hole, entering from the soundhole side.</li><li>Pull it through until the ball reaches the block.</li><li>Pull snug so the ball sits FLAT against the back of the tie block.</li></ol>You've got it when: a gentle tug doesn't shift the ball at all.${M13_D1_EN}`,
                text_es: `Nuestras cuerdas del salón son de nylon con bolita — no se necesita nudo:<ol><li>Pasa la punta lisa de la cuerda por el agujero del bloque, entrando por el lado de la boca.</li><li>Jálala hasta que la bolita llegue al bloque.</li><li>Tensa hasta que la bolita quede PLANA contra la parte trasera del bloque.</li></ol>Lo tienes cuando: un jalón suave no mueve la bolita para nada.${M13_D1_ES}`,
                hint: 'The ball should touch the wood of the block itself, not hang below it or wedge sideways. If it sits crooked, feed a little string back and re-seat it.',
                hint_es: 'La bolita debe tocar la madera del bloque, no colgar por debajo ni quedar de lado. Si queda chueca, regresa un poco de cuerda y asiéntala de nuevo.',
                skills: [2]
              },
              {
                label: 'Steel: bridge pin', label_es: 'Acero: el pin del puente',
                text: `On a steel-string acoustic the ball end lives under the bridge:<ol><li>Drop the ball end into the pin hole.</li><li>Insert the bridge pin with its groove facing the string (toward the soundhole).</li><li>Press the pin down while pulling the string gently UP — you'll feel the ball lock against the bridge plate.</li></ol>You've got it when: the pin stays put and the string doesn't pull free with a gentle tug.${M13_D2_EN}`,
                text_es: `En una acústica de cuerdas de acero la bolita vive debajo del puente:<ol><li>Deja caer la bolita en el agujero del pin.</li><li>Mete el pin con su ranura mirando hacia la cuerda (hacia la boca).</li><li>Presiona el pin hacia abajo mientras jalas la cuerda suave hacia ARRIBA — sentirás la bolita trabarse contra la placa del puente.</li></ol>Lo tienes cuando: el pin se queda en su lugar y la cuerda no se sale con un jalón suave.${M13_D2_ES}`,
                stuck: 'Pin keeps popping up as you tune? The ball is riding on the pin\'s tip instead of the plate. Take it out and re-seat: ball in first, pin after, pull up while pressing down.',
                stuck_es: '¿El pin se levanta al afinar? La bolita está montada en la punta del pin y no en la placa. Sácalo y asienta de nuevo: primero la bolita, luego el pin, jala hacia arriba mientras presionas.',
                skills: [2]
              }
            ]
          },
          {
            title: 'Wind it at the post',
            title_es: 'Enróllala en el poste',
            steps: [
              {
                label: 'Thread and leave slack', label_es: 'Ensarta y deja holgura',
                text: 'Thread the string:<ol><li>Feed the free end through the hole in the tuning post.</li><li>Don\'t pull it tight — leave a hand\'s width of slack over the fretboard (about two frets\' worth of extra string).</li></ol>That slack becomes your 2–3 wraps. You\'ve got it when: the string is through the post with visible slack left.',
                text_es: 'Ensarta la cuerda:<ol><li>Pasa la punta libre por el agujero del poste.</li><li>No la tenses — deja una holgura del ancho de una mano sobre el diapasón (como dos trastes de cuerda extra).</li></ol>Esa holgura se convierte en tus 2–3 vueltas. Lo tienes cuando: la cuerda pasó por el poste y queda holgura visible.',
                skills: [3]
              },
              {
                label: 'Wind — wraps walk DOWN', label_es: 'Enrolla — las vueltas BAJAN',
                text: `Hold light tension on the string with one hand and turn the key with the other:<ol><li>Check direction: tightening should RAISE the pitch and wrap the string so it heads straight to its nut slot.</li><li>Each new wrap goes BELOW the last one, walking down the post.</li><li>Stop at 2–3 neat wraps, string seated in its nut slot.</li></ol>You've got it when: the wraps stack cleanly with no crossing and the string sits in its nut slot.${M13_D3_EN}`,
                text_es: `Mantén una tensión ligera con una mano y gira la clavija con la otra:<ol><li>Revisa la dirección: al apretar, el tono debe SUBIR y la cuerda debe salir del poste directo a su ranura en la cejuela.</li><li>Cada vuelta nueva va DEBAJO de la anterior, bajando por el poste.</li><li>Detente en 2–3 vueltas ordenadas, con la cuerda asentada en su ranura.</li></ol>Lo tienes cuando: las vueltas quedan limpias, sin cruzarse, y la cuerda descansa en su ranura de la cejuela.${M13_D3_ES}`,
                stuck: 'Wraps piling on top of each other? Unwind, re-check your slack (a hand\'s width), and guide the string lower on the post with your free thumb as you wind.',
                stuck_es: '¿Las vueltas se amontonan? Desenrolla, revisa tu holgura (el ancho de una mano) y guía la cuerda hacia abajo en el poste con el pulgar libre mientras enrollas.',
                levelUp: 'Wind so the very first wrap crosses OVER the loose tail, locking it in place — the pro trick that keeps slippery nylon from creeping.',
                levelUp_es: 'Haz que la primera vuelta cruce POR ENCIMA de la punta suelta, dejándola atrapada — el truco pro que evita que el nylon resbaloso se corra.',
                skills: [3]
              },
              {
                label: 'Trim the excess', label_es: 'Recorta el sobrante',
                text: 'Cut the leftover tail close to the post with wire cutters or scissors (nylon cuts easily; steel needs cutters). A long tail:<ul><li>Buzzes.</li><li>Pokes fingers.</li><li>Looks unfinished.</li></ul>You\'ve got it when: nothing sticks out more than about half a centimeter.',
                text_es: 'Corta la punta sobrante al ras del poste con cortador o tijeras (el nylon se corta fácil; el acero necesita cortador). Una punta larga:<ul><li>Vibra.</li><li>Pica dedos.</li><li>Se ve descuidada.</li></ul>Lo tienes cuando: nada sobresale más de medio centímetro.',
                skills: [3]
              }
            ]
          },
          {
            title: 'Tune, stretch, re-tune',
            title_es: 'Afina, estira, vuelve a afinar',
            steps: [
              {
                label: 'Bring it to pitch', label_es: 'Llévala a su tono',
                text: 'Bring the new string to pitch:<ol><li>Open the tuner (toolbar).</li><li>Bring the string up to its note, coming up TO the pitch from below.</li><li>If you overshoot, drop below and come back up.</li></ol>You\'ve got it when: the tuner reads in tune three plucks in a row.',
                text_es: 'Lleva la cuerda nueva a su tono:<ol><li>Abre el afinador (en la barra de herramientas).</li><li>Sube la cuerda hasta su nota, llegando AL tono desde abajo.</li><li>Si te pasas, baja y vuelve a subir.</li></ol>Lo tienes cuando: el afinador marca afinada tres punteos seguidos.',
                skills: [4]
              },
              {
                label: 'Stretch and settle', label_es: 'Estira y asienta',
                text: 'New strings stretch — nylon for days. Speed up the settling:<ol><li>Gently pull the string a few centimeters away from the fretboard, along its length. Gentle — this is a stretch, not a snap.</li><li>Re-tune (it will read flat).</li><li>Repeat until a stretch barely moves the tuner.</li></ol>You\'ve got it when: after a stretch, the string still reads in tune.',
                text_es: 'Las cuerdas nuevas se estiran — las de nylon durante días. Acelera el proceso:<ol><li>Jala la cuerda con suavidad unos centímetros lejos del diapasón, a lo largo. Suave — es un estiramiento, no un tirón.</li><li>Vuelve a afinar (marcará baja).</li><li>Repite hasta que estirar casi no mueva el afinador.</li></ol>Lo tienes cuando: después de estirar, la cuerda sigue afinada.',
                hint: 'Expect to re-tune a fresh nylon string at the start of class for several days. That\'s the string settling, not a mistake.',
                hint_es: 'Cuenta con volver a afinar una cuerda de nylon nueva al inicio de la clase por varios días. Es la cuerda asentándose, no un error.',
                skills: [4]
              },
              {
                label: 'The hold test', label_es: 'La prueba final',
                text: 'Confirm the change holds:<ol><li>Play something — a riff, a chord, one lap of the Daily 5.</li><li>Check the tuner again.</li></ol>In tune? The change is complete and the guitar is ready for the next player. You\'ve got it when: the string reads in tune AFTER being played.',
                text_es: 'Confirma que el cambio se mantiene:<ol><li>Toca algo — un riff, un acorde, una vuelta del Daily 5.</li><li>Revisa el afinador otra vez.</li></ol>¿Sigue afinada? El cambio está completo y la guitarra queda lista para quien siga. Lo tienes cuando: la cuerda marca afinada DESPUÉS de tocarla.',
                skills: [4]
              }
            ]
          },
          {
            title: 'Your assessment',
            title_es: 'Tu evaluación',
            steps: [
              {
                label: 'How you\'ll be graded', label_es: 'Cómo se te calificará',
                text: 'This module ends with a graded, in-class assessment: you change one string start to finish while your teacher watches. You\'re graded on the four skills in the checklist tab:<ol><li>Old string off safely.</li><li>New string seated securely at the bridge.</li><li>Neat winding at the post.</li><li>Tuned, stretched, and holding pitch.</li></ol>Practice the process, then open the checklist to see exactly what each element looks like when it\'s done right.',
                text_es: 'Este módulo termina con una evaluación calificada en clase: cambias una cuerda de principio a fin mientras tu maestro observa. Se te califica en las cuatro habilidades de la pestaña de la lista:<ol><li>La cuerda vieja fuera con seguridad.</li><li>La nueva asentada firme en el puente.</li><li>Enrollado ordenado en el poste.</li><li>Afinada, estirada y estable.</li></ol>Practica el proceso y luego abre la lista para ver exactamente cómo se ve cada elemento bien hecho.',
                skills: [1, 2, 3, 4]
              }
            ]
          }
        ]
      }
    }
  }

);
