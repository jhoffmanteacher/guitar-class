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

## Known gaps (not yet hand-translated — still Google-Translate-only)

These are lower-traffic microcopy the task didn't explicitly call out, left
for a future pass rather than guessed at: locked-set gate/toast messages
("Finish Set 2 first…"), tooltips on locked pills, the Games/Songs/Keep
practicing/My progress panel *contents* (only their nav-rail buttons are
translated), "Practice this" skill-practice toggle, and the aria-only
`aria-label` strings on the skills-checklist cells (their `title` tooltip
*is* translated — the fuller aria-label used by screen readers is not).
