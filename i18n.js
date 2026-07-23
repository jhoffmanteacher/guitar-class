/* ══════════════════════════════════════════════════════════════
   i18n — hand-written Spanish for the APP SHELL (chrome that's on
   screen every session: header, nav rail, tool popups, the skills
   checklist, buttons/footer). Long-form module/lesson CONTENT is
   NOT covered here — that still goes through Google Translate (see
   toggleTranslate() in app.js / journey.js), which is an acceptable
   stopgap for hundreds of lesson steps but not for words a student
   reads 100 times a week.

   Self-contained, no dependency on app.js — loaded before app.js,
   fab-tools.js, and tuner.js on every page that uses it (index.html
   and every tabs/*.html Song Journey page, for the shared tool
   popups). Exposes: t(key, params), setLang(lang), getLang(),
   tSetLabel(label), applyI18n(root).

   ── HOW TO ADD A NEW SHELL STRING (read this before adding one) ──
   1. Add the key to I18N below, in BOTH en and es, in the same edit.
      Never leave a string English-only "to translate later" — that's
      exactly how the two languages drift out of sync.
   2. Reuse a GLOSSARY term if the string uses one of the recurring
      pedagogy words (module/set/station/skill/etc.) — don't invent a
      second Spanish word for a concept that already has one.
   3. Static HTML: add data-i18n="your.key" to the element (or a child
      <span> if the element has other non-text children, e.g. an
      icon, so applyI18n's textContent swap can't clobber them). For
      an attribute (aria-label/title/placeholder), use
      data-i18n-attr="attr:key;attr2:key2" on the same element. For a
      value containing markup (e.g. an inline <strong>), use
      data-i18n-html="your.key" instead of data-i18n.
   4. Dynamic strings built in app.js/fab-tools.js/tuner.js: call
      t('your.key', {param: value}) and wrap the result the same way
      (data-i18n + optionally data-i18n-params='{"param":value}' as a
      JSON attribute) so a later language switch can recompute it in
      place — most shell HTML is built once and never rebuilt, so
      without this tagging a switch to Spanish would leave it stuck
      in whatever language it was first drawn in.
   5. translate="no" is added AUTOMATICALLY by applyI18n to anything
      it touches — you never need to write it by hand. This stops
      Google Translate from re-translating our already-Spanish text
      when both layers are active at once.
   6. See translations-review.md (repo root) for the full EN/ES table
      in one place — hand it to a bilingual reviewer if you want a
      human spot-check (Jonathan doesn't speak Spanish, so this file
      IS the final Spanish until someone checks it).
   ══════════════════════════════════════════════════════════════ */
(function(){

  /* ── GLOSSARY — one fixed Spanish term per recurring pedagogy word.
     If a new string uses one of these concepts, reuse the term here
     rather than picking a fresh synonym.
       module              → módulo
       set (a practice set) → unidad
       station              → estación
       skill                → destreza
       chord                → acorde
       strum (noun/verb)    → rasgueo / rasguear
       fret                 → traste
       pick (plectrum)      → púa
       lap (one full pass)  → vuelta
       "Level up"           → "Sube de nivel"
       "You've got it when" → "Lo tienes cuando"
       "I've got it!"       → "¡Ya lo tengo!"
       BPM / Auto           → kept as-is (already the common usage)
       riff (short repeated musical phrase) → riff (kept — common loanword
                                               in Spanish guitar teaching)
       drill (a short exercise you repeat)  → ejercicio
       Song Journey (the tabs/*.html pages) → Recorrido de la canción
       layer (of a Song Journey song)       → capa
       Stuck?  (hint fold)                  → "¿Atascado?"
       body (of the guitar)                 → cuerpo
       neck                                 → mástil
       headstock                            → clavijero
       tuning peg                           → clavija
       nut (top of the neck, not a capo)    → cejuela
       saddle                               → selleta
       bridge                               → puente
       fretting hand                        → mano de trastear
       picking hand                         → mano de pulsar
       sight-read / sight-reading           → leer a primera vista / lectura
                                               a primera vista
       root (of a chord)                    → raíz
       home note (of a key, i.e. tonic)     → nota base
       vamp (short repeated chord pattern)  → vamp (kept — no clean one-word
                                               Spanish equivalent, same
                                               treatment as "riff")
       chug (short muted punchy strum)      → chug (kept, same reasoning)
       boom-chick (split-strum counting mnemonic) → boom-chick (kept as-is,
                                               it's onomatopoeia, not a word)
       beat                                 → tiempo
       bar / measure                        → compás
       barre (guitar technique)             → cejilla
       resolve / resolution (dominant→tonic pull) → resolver / resolución
       backbeat / offbeat ("+", or accenting beats 2&4) → contratiempo
       chop (muted punchy reggae upstroke)  → picoteo (noun) / picar (verb)
       groove (steady rhythmic feel)        → groove (kept — same loanword
                                               treatment as riff/vamp/chug)
       double-stop (two notes played together) → doble nota / dobles notas
       sub-barre (ring-finger mini-barre inside a → sub-cejilla
         full barre shape, e.g. strings 4-3-2)
       fingerpicking / fingerstyle          → fingerpicking / fingerstyle
                                               (kept — same loanword
                                               treatment as riff/vamp/chug)
       Travis picking (named technique)     → Travis picking (kept as-is)
       pinch (thumb+finger plucked together) → pellizco / pellizcar
       alternating bass                     → bajo alternante
       rest stroke / free stroke (classical → apoyando (toque de apoyo) /
         plucking technique)                  tirando (toque libre) — the
                                               authentic Spanish-origin terms
       capo (the physical device)           → capo (kept — distinct from
                                               "cejilla", the barre TECHNIQUE)
       octave shape (fretboard-mapping shortcut) → forma de octava
       B-string bump (the half-step tuning offset when → el desfase de la
         an octave shape crosses onto the B/high-e string) cuerda B
       whole step / half step               → tono / semitono
       transpose / transposing              → transponer / transposición
       relative minor / relative major (relative key) → relativa menor /
                                               relativa mayor (la relativa)
       parallel minor                       → la paralela menor
       lick (short solo phrase)             → lick (kept — same loanword
                                               treatment as riff/vamp/chug)
       key (musical key, e.g. "key of C")   → tonalidad
       triad                                → tríada
       slash chord                          → acorde con bajo alterno
       home chord (the tonic chord, e.g. the I) → acorde base (pairs with
                                               "home note" → "nota base")
       E-shape / A-shape (barre chord)      → forma de E / forma de A
       quick change (12-bar blues variant)  → cambio rápido
       comp / comping (backing chords while another solos) → acompañar /
                                               acompañamiento
       chorus (blues: one full 12-bar cycle) → ronda
       shuffle (rhythmic feel)              → shuffle (kept — same loanword
                                               treatment as groove/chug/vamp)
       chord family                         → familia de acordes
       diatonic                             → diatónico/a
       waltz (named 3/4 style/feel)         → vals
       downbeat (first/strongest beat of a bar) → tiempo fuerte
       fill (short extra run between main parts) → relleno
       roll (fingerpicked ascending run through a chord) → floreo
  */
  const I18N = {
    // ── Header ──
    'header.title':    { en: 'Sequoia High School – Beginning Guitar', es: 'Sequoia High School – Guitarra para principiantes' },
    'header.subtitle': { en: 'Independent Practice and Skills Tracker', es: 'Práctica independiente y seguimiento de destrezas' },
    'header.find':     { en: 'Find', es: 'Buscar' },
    'header.signIn':   { en: 'Sign in with Google', es: 'Iniciar sesión con Google' },
    'header.signOut':  { en: 'Sign out', es: 'Cerrar sesión' },

    // ── Auth wall ──
    'auth.title':         { en: 'Welcome to Guitar Class', es: 'Bienvenido a la clase de guitarra' },
    'auth.body':          { en: 'Sign in with your school Google account to access your weekly materials and track your progress across any device.',
                             es: 'Inicia sesión con tu cuenta de Google de la escuela para acceder a tus materiales semanales y llevar el registro de tu progreso en cualquier dispositivo.' },
    'auth.fallbackTitle': { en: "Can't reach the sign-in service", es: 'No se pudo conectar con el servicio de inicio de sesión' },
    'auth.fallbackBody':  { en: "The sign-in service couldn't load on this network — a Wi-Fi or content filter may be blocking it. Try again or switch to a different network.",
                             es: 'El servicio de inicio de sesión no se pudo cargar en esta red — un filtro de Wi-Fi o de contenido podría estar bloqueándolo. Intenta de nuevo o cambia de red.' },
    'auth.tryAgain':      { en: 'Try again', es: 'Intentar de nuevo' },
    'auth.signInFailed':  { en: "Sign-in didn't work — make sure pop-ups are allowed and you're using your school Google account, then try again.",
                             es: 'El inicio de sesión no funcionó — asegúrate de permitir ventanas emergentes y de usar tu cuenta de Google de la escuela, luego intenta de nuevo.' },

    // ── Nav rail ──
    'nav.module':         { en: 'Module', es: 'Módulo' },
    'nav.thisSet':        { en: 'This set', es: 'Esta unidad' },
    'nav.explore':        { en: 'Explore', es: 'Explorar' },
    'nav.practice':       { en: 'Practice', es: 'Practicar' },
    'nav.games':          { en: 'Games', es: 'Juegos' },
    'nav.songs':          { en: 'Songs', es: 'Canciones' },
    'nav.keepPracticing': { en: 'Keep practicing', es: 'Sigue practicando' },
    'nav.myProgress':     { en: 'My progress', es: 'Mi progreso' },
    'nav.moduleReview':   { en: 'Module review', es: 'Repaso del módulo' },
    'nav.setN':           { en: 'Set {n}', es: 'Unidad {n}' },
    'nav.stationBTitle':  { en: 'Station B', es: 'Estación B' },
    'nav.stationBSub':    { en: 'Watch · Listen · Practice', es: 'Mira · Escucha · Practica' },
    'nav.stationCTitle':  { en: 'Station C', es: 'Estación C' },
    'nav.stationCSub':    { en: 'Independent drill', es: 'Ejercicio independiente' },
    'nav.checklistTitle': { en: 'My skills checklist', es: 'Mi lista de destrezas' },
    'nav.checklistSub':   { en: 'Track what you can do', es: 'Lleva el registro de lo que ya sabes hacer' },
    'nav.previewNoteHtml':{ en: '<strong>Preview mode</strong> — set locks are off for you. Students still see them.',
                             es: '<strong>Modo de vista previa</strong> — los bloqueos de unidades están desactivados para ti. Los estudiantes todavía los ven.' },

    // ── Skill status / checklist ──
    'skill.stillWorking':      { en: 'Still working on it', es: 'Todavía lo estoy practicando' },
    'skill.gotIt':             { en: "I've got it!", es: '¡Ya lo tengo!' },
    'skill.stillLearning':     { en: 'Still learning', es: 'Todavía aprendiendo' },
    'skill.gettingIt':         { en: 'Getting it', es: 'Ya le voy agarrando' },
    'skill.gotItShort':        { en: 'Got it', es: 'Ya lo tengo' },
    'skill.checklistIntro':    { en: 'Check each skill as you practice. Use "Still working on it" while you\'re learning, then mark "I\'ve got it!" once you can do it consistently.',
                                 es: 'Marca cada destreza mientras practicas. Usa "Todavía lo estoy practicando" mientras la estás aprendiendo, y marca "¡Ya lo tengo!" cuando ya puedas hacerla de forma constante.' },
    'skill.clHeaderSkill':      { en: 'Skill', es: 'Destreza' },
    'skill.clHeaderWorkingHtml':{ en: 'Still<br>working on it', es: 'Todavía<br>lo practico' },
    'skill.clHeaderGotItHtml':  { en: "I've<br>got it!", es: 'Ya<br>lo tengo' },
    'skill.whatDoesThisLookLike':{ en: 'What does this look like?', es: '¿Cómo se ve esto?' },
    'skill.youveGotItWhen':     { en: "You've got it when:", es: 'Lo tienes cuando:' },
    'skill.showMeWhere':        { en: 'Show me where', es: 'Muéstrame dónde' },

    // ── Progress strings (parameterized — never concatenate numbers by hand) ──
    'progress.stepsDone':      { en: '{done} of {total} steps done', es: '{done} de {total} pasos completados' },
    'progress.skillsMastered': { en: '{done} of {total} skills mastered across all {modules} modules.',
                                 es: '{done} de {total} destrezas dominadas en los {modules} módulos.' },

    // ── Tools: Metronome / Timer / Tuner ──
    'tools.metronome':     { en: 'Metronome', es: 'Metrónomo' },
    'tools.bpm':           { en: 'BPM', es: 'BPM' },
    'tools.countIn':       { en: 'Count-in (one bar before it starts)', es: 'Cuenta regresiva (un compás antes de empezar)' },
    'tools.start':         { en: 'Start', es: 'Iniciar' },
    'tools.stop':          { en: 'Stop', es: 'Detener' },
    'tools.pause':         { en: 'Pause', es: 'Pausa' },
    'tools.reset':         { en: 'Reset', es: 'Reiniciar' },
    'tools.timerTitle':    { en: 'Practice Timer', es: 'Temporizador de práctica' },
    'tools.timer':         { en: 'Timer', es: 'Temporizador' },
    'tools.tuner':         { en: 'Tuner', es: 'Afinador' },
    'tools.auto':          { en: 'Auto', es: 'Auto' },
    'tools.flat':          { en: 'flat', es: 'bemol' },
    'tools.inTune':        { en: 'in tune', es: 'afinado' },
    'tools.sharp':         { en: 'sharp', es: 'sostenido' },
    'tools.playAString':   { en: 'Play a string…', es: 'Toca una cuerda…' },
    'tools.listening':     { en: 'Listening…', es: 'Escuchando…' },
    'tools.micDenied':     { en: 'Mic access denied — check browser permissions', es: 'Acceso al micrófono denegado — revisa los permisos del navegador' },
    'tools.inTuneStatus':  { en: 'In tune ✓', es: 'Afinado ✓' },
    'tools.tooHighSharp':  { en: 'Too high — tune down (sharp)', es: 'Muy alta — afina hacia abajo (sostenido)' },
    'tools.tooLowFlat':    { en: 'Too low — tune up (flat)', es: 'Muy baja — afina hacia arriba (bemol)' },
    'tools.tunerTip':      { en: 'Noisy room? Pick your string above and play close to the computer.',
                             es: '¿Sala ruidosa? Elige tu cuerda arriba y toca cerca de la computadora.' },

    // ── Buttons & footer ──
    'btn.markDone':          { en: 'Mark done', es: 'Marcar como hecho' },
    'btn.doneWord':          { en: 'Done', es: 'Hecho' },
    'btn.printSet':          { en: 'Print this set', es: 'Imprimir esta unidad' },
    'btn.nextStationC':      { en: 'Next: Station C — practice it', es: 'Siguiente: Estación C — a practicar' },
    'btn.nextChecklist':     { en: 'Next: My skills checklist', es: 'Siguiente: Mi lista de destrezas' },
    'btn.next':              { en: 'Next:', es: 'Siguiente:' },
    'btn.nextModuleReview':  { en: 'Next: Module Review', es: 'Siguiente: Repaso del módulo' },
    'btn.theNextSet':        { en: 'the next set', es: 'la siguiente unidad' },
    'btn.backToPractice':    { en: 'Back to practice', es: 'Volver a practicar' },
    'btn.backToTop':         { en: 'Back to top', es: 'Volver arriba' },
    'btn.top':               { en: 'Top', es: 'Arriba' },
    'btn.reportProblem':     { en: 'Report a problem', es: 'Reportar un problema' },

    // ── Step folds & responses (module content phase 2 — chrome around
    // per-step data, not the step data itself, see CLAUDE.md's module-
    // content i18n section) ──
    'step.hint':             { en: 'Hint', es: 'Pista' },
    'step.stuck':            { en: 'Stuck?', es: '¿Atascado?' },
    'step.levelUp':          { en: 'Level up', es: 'Sube de nivel' },
    'step.yourResponse':     { en: 'Your response', es: 'Tu respuesta' },
    'step.answerPlaceholder':{ en: 'Type your answer here…', es: 'Escribe tu respuesta aquí…' },
    'step.playAll':          { en: 'Play all', es: 'Reproducir todo' },
    'step.practiceThis':     { en: 'Practice this', es: 'Practica esto' },
    'step.correct':          { en: 'Correct!', es: '¡Correcto!' },
    'step.notQuite':         { en: 'Not quite — try again.', es: 'Casi — inténtalo de nuevo.' },

    // ── Assessment block (goal / self-check / standards labels) ──
    'assess.goal':           { en: 'Assessment goal', es: 'Objetivo de la evaluación' },
    'assess.selfCheck':      { en: 'Self-check', es: 'Autoevaluación' },
    'assess.standards':      { en: 'NAfME standards', es: 'Estándares NAfME' },

    // ── Songs list (per-set and per-module "🎵 Songs") ──
    'songs.core':            { en: 'Core — everyone', es: 'Básica — para todos' },
    'songs.choice':          { en: 'Choice menu — pick 1', es: 'Menú a elección — elige 1' },
    'songs.diffLegend':      { en: 'easier → harder', es: 'más fácil → más difícil' },
    'songs.difficulty':      { en: 'Difficulty', es: 'Dificultad' },
    'songs.diff1':           { en: 'Beginner', es: 'Principiante' },
    'songs.diff2':           { en: 'Intermediate', es: 'Intermedio' },
    'songs.diff3':           { en: 'Advanced', es: 'Avanzado' },
    'songs.original':        { en: 'Original', es: 'Original' },
    'songs.tutorial':        { en: 'Tutorial', es: 'Tutorial' },
    'songs.backingTrack':    { en: 'Backing track', es: 'Pista de acompañamiento' },
    'songs.songJourney':     { en: 'Song Journey', es: 'Recorrido de la canción' },
    'songs.yourPick':        { en: 'Your pick — bring your own song!', es: 'Tu elección — ¡trae tu propia canción!' },
    'songs.yourPickBody':    { en: "Got a song you want to learn? Search YouTube for a beginner tutorial and use this module's skills on it.",
                                es: '¿Tienes una canción que quieres aprender? Busca en YouTube un tutorial para principiantes y aplica las destrezas de este módulo.' },
    'songs.opensYoutube':    { en: 'Opens in YouTube', es: 'Se abre en YouTube' },
    'songs.jamTrackTitle':   { en: 'Jam track — backing music to play along with; make up your own melody (solo) over it',
                                es: 'Pista de acompañamiento — música de fondo para tocar junto con ella; improvisa tu propia melodía (solo) encima.' },
    'songs.oneSongLayers':   { en: 'One song, five layers', es: 'Una canción, cinco capas' },

    // ── Module review (self-assessment panel) ──
    'review.tag':            { en: 'Module {n} self-assessment', es: 'Autoevaluación del módulo {n}' },
    'review.rateReflect':    { en: "Rate yourself on the module's key skills, then reflect.",
                                es: 'Califícate en las destrezas clave del módulo y luego reflexiona.' },
    'review.whatClicked':    { en: 'What suddenly made sense this module?', es: '¿Qué de repente tuvo sentido este módulo?' },
    'review.whatClickedPh':  { en: 'e.g. TAB finally made sense when I slowed it down…',
                                es: 'por ejemplo: el TAB por fin tuvo sentido cuando fui más despacio…' },
    'review.whatsHard':      { en: "What's still hard?", es: '¿Qué sigue siendo difícil?' },
    'review.whatsHardPh':    { en: 'e.g. My ring finger keeps slipping off the fret…',
                                es: 'por ejemplo: mi dedo anular se me resbala del traste…' },
    'review.playRecord':     { en: 'Play it & Record it!', es: '¡Tócala y grábate!' },
    'review.playPrompt':     { en: 'Perform a core song from this module — or a song of your choice that uses these skills. Then listen back to your recording and reflect on what could be improved.',
                                es: 'Toca una canción principal de este módulo, o una canción de tu elección que use estas destrezas. Luego escucha tu grabación y reflexiona sobre qué podrías mejorar.' },
    'review.songIPlayed':    { en: 'Song I played', es: 'Canción que toqué' },
    'review.howDidItGo':     { en: 'How did it go?', es: '¿Cómo te fue?' },
    'review.assessBodyItems':{ en: "When you're ready, record yourself doing the module assessment, then check the recording against these skills:",
                                es: 'Cuando estés listo, grábate haciendo la evaluación del módulo y luego revisa la grabación contra estas destrezas:' },
    'review.assessBodyDflt': { en: "When you're ready, record yourself performing the skills above and self-check the recording.",
                                es: 'Cuando estés listo, grábate haciendo las destrezas de arriba y autoevalúa la grabación.' },
    'review.assessHead':     { en: 'Module {n} Assessment', es: 'Evaluación del módulo {n}' },
    'review.whyMatters':     { en: 'Why this matters', es: 'Por qué esto importa' },
    'review.previewOnly':    { en: 'Preview only.', es: 'Solo vista previa.' },
    'review.previewBodyHtml':{ en: 'Mark every skill on every set as &ldquo;I&rsquo;ve got it!&rdquo; to unlock this self-assessment.',
                                es: 'Marca cada destreza de cada unidad como &ldquo;¡Ya lo tengo!&rdquo; para desbloquear esta autoevaluación.' },
    'review.reviewThis':     { en: 'Review this', es: 'Repasar esto' },

    // ── 10-minute practice routine card (module review) ──
    'routine.title':         { en: 'Your 10-minute practice routine', es: 'Tu rutina de práctica de 10 minutos' },
    'routine.print':         { en: 'Print', es: 'Imprimir' },
    'routine.foot':          { en: "Built from this module's sets — short on time? Do steps 1–3 — that's still good.",
                                es: 'Armada con las unidades de este módulo — ¿poco tiempo? Haz los pasos 1–3 — ya es una buena práctica.' },
    'routine.tuneUp':        { en: 'Tune up', es: 'Afina' },
    'routine.tuneUpBody':    { en: '— open the Tuner (corner button) and tune all six strings until the tuner turns green.',
                                es: '— abre el Afinador (botón de la esquina) y afina las seis cuerdas hasta que el afinador se ponga verde.' },
    'routine.fingerGym':     { en: 'Finger Gym', es: 'Gimnasia de dedos' },
    'routine.skillDrill':    { en: 'Skill drill', es: 'Ejercicio de destreza' },
    'routine.chordScaleWork':{ en: 'Chord / scale work', es: 'Trabajo de acordes / escalas' },
    'routine.song':          { en: 'Song', es: 'Canción' },
    'routine.openThisSet':   { en: 'Open this set', es: 'Abrir esta unidad' },
    'routine.playIt':        { en: 'Play it', es: 'Tócalo' },

    // ── TAB blocks ──
    'tab.label':             { en: 'Tab', es: 'Tab' },
    'tab.playTab':           { en: 'Play tab', es: 'Tocar el tab' },
    'tab.defaultTitle':      { en: 'Tab', es: 'Tab' },
    'tab.showTabLabel':      { en: 'Show TAB:', es: 'Mostrar TAB:' },

    // ── Song-thread lede (Set header — which Song Journey layer this set builds) ──
    'thread.bonusLayer':     { en: 'This set adds a bonus layer for:', es: 'Esta unidad agrega una capa extra para:' },
    'thread.buildsLayer':    { en: 'This set builds Layer {n} of 5 for:', es: 'Esta unidad construye la Capa {n} de 5 para:' },
    'thread.grows':          { en: 'This set grows:', es: 'Esta unidad hace crecer:' },

    // ── "First time on this set?" flex-practice note ──
    'note.firstTimeHtml':    { en: '&#x1F9ED; <strong>First time on this set?</strong> Do {btn} first — watch the lessons, then come back here and drill. Back on another day just to practice? Perfect — practicing on different days helps you remember.',
                                es: '&#x1F9ED; <strong>¿Primera vez en esta unidad?</strong> Primero haz {btn} — mira las lecciones y luego vuelve aquí a practicar. ¿Volviste otro día solo a practicar? Perfecto — practicar en días distintos te ayuda a recordar mejor.' },
    'daily5.tuneWarmupHtml': { en: '&#x26A1; <strong>Tune and warm up first:</strong> today’s Daily 5 has tuning, a finger warm-up, and one drill (a short exercise you repeat to build a skill) from this module — five minutes and your hands are ready. {btn}',
                                es: '&#x26A1; <strong>Primero afina y calienta:</strong> el Daily 5 de hoy tiene afinación, un calentamiento de dedos, y un ejercicio de este módulo — cinco minutos y tus manos estarán listas. {btn}' },
    'daily5.openToday':      { en: 'Open today’s Daily 5', es: 'Abrir el Daily 5 de hoy' },
    'skill.noneListed':      { en: 'No skills listed for this set yet.', es: 'Todavía no hay destrezas para esta unidad.' },

    // ── Practice reps (per-skill rep tracking strip) ──
    'rep.today':             { en: 'Reps today: {n} of {goal}', es: 'Repeticiones hoy: {n} de {goal}' },
    'rep.total':             { en: 'Total reps: {n}', es: 'Repeticiones en total: {n}' },
    'rep.lastToday':         { en: 'Last practiced today', es: 'Última práctica: hoy' },
    'rep.lastYesterday':     { en: 'Last practiced yesterday', es: 'Última práctica: ayer' },
    'rep.lastDays':          { en: 'Last practiced {n} days ago', es: 'Última práctica: hace {n} días' },
    'rep.lastNever':         { en: 'Not practiced yet', es: 'Aún sin practicar' },
    'rep.logClean':          { en: 'Log a clean rep', es: 'Registrar una repetición limpia' },
    'rep.goalMet':           { en: 'Daily goal met — nice work!', es: 'Meta del día cumplida — ¡buen trabajo!' },

    // ── Find-the-Note fretboard game ──
    'fret.introHtml':        { en: 'A round is {total} notes. Click the fret where each note lives — take your time.',
                               es: 'Una ronda son {total} notas. Haz clic en el traste donde vive cada nota — tómate tu tiempo.' },
    'fret.startRound':       { en: 'Start a round', es: 'Empezar una ronda' },
    'fret.playAgain':        { en: 'Play again', es: 'Jugar de nuevo' },
    'fret.findPromptHtml':   { en: 'Find <strong>{note}</strong> on the {string} string', es: 'Encuentra <strong>{note}</strong> en la cuerda {string}' },
    'fret.promptCount':      { en: 'Note {i} of {total}', es: 'Nota {i} de {total}' },
    'fret.notThatOne':       { en: 'Not that one — try again.', es: 'Esa no es — inténtalo de nuevo.' },
    'fret.gotIt':            { en: 'That’s it!', es: '¡Eso es!' },
    'fret.roundScore':       { en: 'Round done: {score}/{total}', es: 'Ronda terminada: {score}/{total}' },
    'fret.praiseHigh':       { en: 'nice!', es: '¡muy bien!' },
    'fret.praiseMid':        { en: 'getting there!', es: '¡vas bien!' },
    'fret.praiseLow':        { en: 'reps make it stick — go again when you’re ready.', es: 'las repeticiones lo fijan — repite cuando estés listo.' },
    'fret.best':             { en: 'Best: {n}/{total}', es: 'Mejor: {n}/{total}' },
    'fret.stringLowE':       { en: 'low E', es: 'Mi grave' },
    'fret.stringA':          { en: 'A', es: 'La' },

    // ── PR ladder practice panel (personal-record history) ──
    'pr.latest':             { en: 'Latest: {v}', es: 'Último: {v}' },
    'pr.best':               { en: 'Best: {v}', es: 'Mejor: {v}' },
    'pr.noneYet':            { en: 'No personal record yet — set your first!', es: 'Aún no hay récord personal — ¡marca el primero!' },
    'pr.historyTitle':       { en: 'Your recent attempts, oldest first', es: 'Tus intentos recientes, del más antiguo al más nuevo' },
    'pr.unitBpm':            { en: 'BPM', es: 'BPM' },
    'pr.unitCount':          { en: 'times', es: 'veces' },
    'pr.inputAria':          { en: 'Enter your new personal record', es: 'Escribe tu nuevo récord personal' },

    // ── "Keep it sharp" spaced-review card ──
    'review.title':          { en: 'Keep it sharp', es: 'Mantenlo fresco' },
    'review.explainer':      { en: 'Skills fade without reps — a quick review keeps them automatic.',
                               es: 'Las destrezas se olvidan sin repeticiones — un repaso rápido las mantiene automáticas.' },
    'review.practiceAgain':  { en: 'Practice again', es: 'Practicar de nuevo' },

    // ── Find-the-Note: remaining string names (glossary: solfège names,
    //    matching fret.stringLowE 'Mi grave' / fret.stringA 'La') ──
    'fret.stringD':          { en: 'D', es: 'Re' },
    'fret.stringG':          { en: 'G', es: 'Sol' },
    'fret.stringB':          { en: 'B', es: 'Si' },
    'fret.stringHighE':      { en: 'high E', es: 'Mi agudo' },

    // ── Sequential-gate messages + locked-pill tooltips/aria ──
    'gate.lockedUntilAria':  { en: '{set} — locked until {prev} is finished', es: '{set} — bloqueada hasta terminar {prev}' },
    'gate.lockedTitle':      { en: 'Locked — mark every skill in {prev} as "I\'ve got it!" to unlock {set}.',
                               es: 'Bloqueada — marca cada destreza de {prev} como "¡Ya lo tengo!" para desbloquear {set}.' },
    'gate.finishFirstLong':  { en: 'Finish {prev} first — mark all its skills "I\'ve got it!" to unlock {set}.',
                               es: 'Primero termina {prev} — marca todas sus destrezas con "¡Ya lo tengo!" para desbloquear {set}.' },
    'gate.finishFirstShort': { en: 'Finish {prev} first to unlock {set}.', es: 'Primero termina {prev} para desbloquear {set}.' },
    'gate.unlocksAfter':     { en: '{set} unlocks after you finish {prev}.', es: '{set} se desbloquea cuando termines {prev}.' },
    'gate.reviewPreviewTitle': { en: 'Preview only — finish marking every skill on every set as "I\'ve got it!" to unlock this self-assessment.',
                               es: 'Solo vista previa — termina de marcar cada destreza de cada unidad con "¡Ya lo tengo!" para desbloquear esta autoevaluación.' },
    'gate.pillAllComplete':  { en: '{set} — all {total} skills complete', es: '{set} — las {total} destrezas completas' },
    'gate.pillProgress':     { en: '{set} — {done} of {total} skills done', es: '{set} — {done} de {total} destrezas listas' },

    // ── Skills-checklist cell aria-labels (fuller than the title tooltips) ──
    'skill.ariaStillWorking': { en: 'Still working on it: {skill}', es: 'Todavía lo estoy practicando: {skill}' },
    'skill.ariaGotIt':        { en: "I've got it: {skill}", es: 'Ya lo tengo: {skill}' },

    // ── ♪ Songs hub panel ──
    'hub.allSongs':          { en: 'All the songs', es: 'Todas las canciones' },
    'hub.loading':           { en: 'Loading the song list…', es: 'Cargando la lista de canciones…' },
    'hub.closeAria':         { en: 'Close songs', es: 'Cerrar canciones' },
    'hub.taughtIn':          { en: 'Taught in:', es: 'Se enseña en:' },
    'hub.openModuleTitle':   { en: 'Open Module {n}', es: 'Abrir el Módulo {n}' },
    'hub.legendCore':        { en: 'Core — everyone learns these', es: 'Básicas — todos las aprenden' },
    'hub.legendChoice':      { en: 'Choice menu', es: 'Menú a elección' },
    'hub.backing':           { en: 'Backing', es: 'Pista' },
    'hub.tagCore':           { en: 'Core', es: 'Básica' },
    'hub.tagChoice':         { en: 'Choice', es: 'A elección' },

    // ── 🔁 Keep practicing panel ──
    'kp.closeAria':          { en: 'Close keep practicing', es: 'Cerrar seguir practicando' },
    'kp.loading':            { en: 'Loading…', es: 'Cargando…' },
    'kp.emptyHtml':          { en: 'Nothing marked &ldquo;still working on it&rdquo; right now — mark a skill that way on any checklist and it\'ll show up here.',
                               es: 'No hay nada marcado como &ldquo;todavía lo estoy practicando&rdquo; — marca así una destreza en cualquier lista y aparecerá aquí.' },

    // ── 📊 My progress panel ──
    'mp.closeAria':          { en: 'Close my progress', es: 'Cerrar mi progreso' },

    // ── ⚡ Daily 5 modal ──
    'daily5.title':          { en: 'Daily 5 — today’s warm-up', es: 'Daily 5 — el calentamiento de hoy' },
    'daily5.closeAria':      { en: 'Close Daily 5', es: 'Cerrar el Daily 5' },
    'daily5.tuneUpBody':     { en: '— tune all six strings until the tuner turns green (use the corner Tuner).',
                               es: '— afina las seis cuerdas hasta que el afinador se ponga verde (usa el Afinador de la esquina).' },
    'daily5.warmUp':         { en: 'Warm-up', es: 'Calentamiento' },
    'daily5.todaysDrill':    { en: 'Today’s drill', es: 'El ejercicio de hoy' },
    'daily5.fromModule':     { en: 'from Module {num}, {set}:', es: 'del Módulo {num}, {set}:' },
    'daily5.streak':         { en: '{n}-day streak', es: 'racha de {n} días' },

    // ── Song Journey pages (tabs/journey.js dynamic strings — the page
    //    content itself is hand-translated per-page via data-es) ──
    'journey.progPill':      { en: '{rated} of {n} layers rated', es: '{rated} de {n} capas evaluadas' },
    'journey.saving':        { en: 'Saving…', es: 'Guardando…' },
    'journey.saved':         { en: 'Saved ✓', es: 'Guardado ✓' },
    'journey.saveFailed':    { en: 'Save failed — check connection', es: 'No se pudo guardar — revisa tu conexión' },
    'journey.signin':        { en: 'Sign in on the class site to save your ratings',
                               es: 'Inicia sesión en el sitio de la clase para guardar tus evaluaciones' },
    'journey.slow':          { en: 'Slow ({bpm} BPM)', es: 'Lento ({bpm} BPM)' },
    'journey.rateAria':      { en: 'Rate this layer', es: 'Evalúa esta capa' },
    'journey.playalongTitle':{ en: 'Play-along backing track', es: 'Pista de acompañamiento para tocar encima' },

    // ── Footer "Report a problem" mailto ──
    'report.subject':        { en: 'Guitar site — problem report', es: 'Sitio de guitarra — reporte de problema' },

    // ── Module-review recording widget (renderRecBody) ──
    'rec.record':            { en: 'Record', es: 'Grabar' },
    'rec.help':              { en: 'Up to {s} seconds. Browser will ask for microphone permission.',
                               es: 'Hasta {s} segundos. El navegador pedirá permiso para usar el micrófono.' },
    'rec.stop':              { en: 'Stop', es: 'Detener' },
    'rec.max':               { en: 'max {s}s', es: 'máx {s}s' },
    'rec.download':          { en: 'Download', es: 'Descargar' },
    'rec.rerecord':          { en: 'Re-record', es: 'Volver a grabar' },
    'rec.listenBack':        { en: 'Listen back as often as you like. Download to keep a copy.',
                               es: 'Escúchala cuantas veces quieras. Descárgala para guardar una copia.' },
    'rec.noSupport':         { en: 'This browser does not support audio recording. Try Chrome, Edge, or Firefox on a desktop.',
                               es: 'Este navegador no permite grabar audio. Prueba Chrome, Edge o Firefox en una computadora.' },
    'rec.micFail':           { en: 'Could not start microphone: {err}', es: 'No se pudo iniciar el micrófono: {err}' }
  };

  let lang = 'en';
  try { lang = localStorage.getItem('gc-lang') === 'es' ? 'es' : 'en'; } catch(e){}

  function t(key, params){
    const entry = I18N[key];
    let str = entry ? (entry[lang] || entry.en) : key;
    if(params){
      Object.keys(params).forEach(k=>{
        str = str.replace(new RegExp('\\{'+k+'\\}','g'), params[k]);
      });
    }
    return str;
  }

  // "Set 1" / "Set 2" … are literal strings baked into each module-N.js
  // data file (curriculum content), not chrome — parsed + re-rendered
  // here instead of hand-editing 35 set definitions across 12 files.
  // Anything that doesn't match the pattern (e.g. a custom label) passes
  // through unchanged.
  function tSetLabel(label){
    const m = /^Set (\d+)$/.exec(label || '');
    return m ? t('nav.setN', {n: m[1]}) : label;
  }

  function markTranslated(el){
    el.setAttribute('translate','no');
    el.classList.add('notranslate');
  }

  function applyI18n(root){
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(el=>{
      const params = el.getAttribute('data-i18n-params');
      el.textContent = t(el.getAttribute('data-i18n'), params ? JSON.parse(params) : null);
      markTranslated(el);
    });
    root.querySelectorAll('[data-i18n-html]').forEach(el=>{
      const params = el.getAttribute('data-i18n-params');
      el.innerHTML = t(el.getAttribute('data-i18n-html'), params ? JSON.parse(params) : null);
      markTranslated(el);
    });
    root.querySelectorAll('[data-i18n-attr]').forEach(el=>{
      el.getAttribute('data-i18n-attr').split(';').forEach(pair=>{
        const parts = pair.split(':');
        const attr = parts[0] && parts[0].trim();
        const key  = parts[1] && parts[1].trim();
        if(attr && key) el.setAttribute(attr, t(key));
      });
      markTranslated(el);
    });
    // Holds a raw curriculum label like "Set 3" (module-N.js data, not chrome)
    // — re-derived through tSetLabel() rather than a plain key lookup.
    root.querySelectorAll('[data-i18n-setlabel]').forEach(el=>{
      el.textContent = tSetLabel(el.getAttribute('data-i18n-setlabel'));
      markTranslated(el);
    });
  }

  function setLang(l){
    lang = (l === 'es') ? 'es' : 'en';
    try{ localStorage.setItem('gc-lang', lang); }catch(e){}
    document.documentElement.lang = lang;
    applyI18n(document);
    window.dispatchEvent(new CustomEvent('gc-langchange', { detail: { lang } }));
  }

  function getLang(){ return lang; }

  window.t = t;
  window.tSetLabel = tSetLabel;
  window.setLang = setLang;
  window.getLang = getLang;
  window.applyI18n = applyI18n;

  // Script is `defer`d, so the DOM is already parsed — apply immediately,
  // whether the persisted language is 'en' (no-op-ish) or 'es' (a returning
  // student who chose Spanish shouldn't see a flash of English first).
  applyI18n(document);
})();
