# WORK ORDER — Rebuild ca-10 "Seven Nation Army — The Riff" to current activity rules

**Date:** 2026-09-23
**Base commit:** `2d4a95b` on `main` ("Remove duplicated band player from ca-18/ca-19 tab steps")
**Executor:** Claude Code, one commit
**Ladder:** melody / riff — first half → second half → hear the rhythm → whole riff → faster → with the band

## Why

ca-10 was built before the current rules. It has no Learn/Practice labels, uses `<ul>` lists inside steps, has no recovery move in any standard, and never names the A string now that the map step is gone. Its last step asks for three things. It also tells students to "add the feel" (long first E, long last two notes) when the whole-riff tab already plays that rhythm.

## Progress safety

- `id: 'ca-10'` stays. Completion is keyed to the id, so students who finished it stay finished.
- Step ticks are in-memory only, so changing the step count (4 → 6) affects nothing saved.
- Keep `number: 10` as is (legacy field).

## 1. Replace the ca-10 entry

Replace the whole `{ id: 'ca-10', … }` object in `class-activities.js` with the block below, exactly as written. Match on `id:    'ca-10'` and the closing `},` before `id:    'ca-11'`, not on line numbers.

Changes from the current entry:

- adds `journeyLayer: 2` (Layer 2 "Single Notes" is the riff on the A string at 60 BPM)
- rewrites the intro
- produces 6 steps
- removes the 4-bar `snippet` from the whole-riff step, so the band player appears only on the last step
- keeps the 8-bar `snippet` on the band step unchanged

```js
  {
    id:    'ca-10',
    number: 10,
    journey: 'seven-nation-army',   // the last step sends them to this Song Journey page — see JOURNEY below
    journeyLayer: 2,
    title:    'Seven Nation Army — The Riff',
    title_es: 'Seven Nation Army — El riff',
    intro:    'The Seven Nation Army riff is seven notes on the A string, the string just below the low E. It uses the Reach from Finger Gym: finger 1 stays on fret 7 while the pinky reaches fret 10.',
    intro_es: 'El riff de Seven Nation Army son siete notas en la cuerda La, la cuerda justo debajo de la Mi grave. Usa el Estiramiento del Gimnasio de Dedos: el dedo 1 se queda en el traste 7 mientras el meñique llega al traste 10.',
    steps: [
      {
        label:    'Practice — E E G E',
        label_es: 'Practica — E E G E',
        text: 'Play E E G E with the tab at 60 BPM. Finger 1 stays on fret 7 the whole time. The pinky (finger 4) reaches fret 10 for the G and comes back. You\'ve got it when: E E G E three times in a row, no buzz. Finger 1 lifts when the pinky reaches? Play just fret 7 to fret 10 five times, pressing fret 7 the whole time, then try again.',
        text_es: 'Toca E E G E con la tablatura a 60 BPM. El dedo 1 se queda en el traste 7 todo el tiempo. El meñique (dedo 4) llega al traste 10 para el G y regresa. Lo tienes cuando: E E G E tres veces seguidas, sin zumbido. ¿Se levanta el dedo 1 cuando el meñique se estira? Toca solo del traste 7 al traste 10 cinco veces, presionando el traste 7 todo el tiempo, y vuelve a intentarlo.',
        tab: {
          caption: 'E E G E · A string · frets 7 7 10 7',
          caption_es: 'E E G E · cuerda La · trastes 7 7 10 7',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52 },
            { string: 'A', fret: 7,  note: 'E', midi: 52 },
            { string: 'A', fret: 10, note: 'G', midi: 55 },
            { string: 'A', fret: 7,  note: 'E', midi: 52 }
          ]
        },
      },
      {
        label:    'Practice — E D C B',
        label_es: 'Practica — E D C B',
        text: 'Play E D C B with the tab at 60 BPM. Finger 1 plays every note: fret 7, fret 5, fret 3, then fret 2. You\'ve got it when: E D C B three times in a row, no buzz. Landing on the wrong fret? Look at the fret before you move — 7, 5 and 3 have dots, and 2 is one fret below the 3 dot.',
        text_es: 'Toca E D C B con la tablatura a 60 BPM. El dedo 1 toca todas las notas: traste 7, traste 5, traste 3 y luego traste 2. Lo tienes cuando: E D C B tres veces seguidas, sin zumbido. ¿Caes en el traste equivocado? Mira el traste antes de moverte — el 7, el 5 y el 3 tienen punto, y el 2 está un traste abajo del punto del 3.',
        tab: {
          caption: 'E D C B · A string · frets 7 5 3 2',
          caption_es: 'E D C B · cuerda La · trastes 7 5 3 2',
          notes: [
            { string: 'A', fret: 7, note: 'E', midi: 52 },
            { string: 'A', fret: 5, note: 'D', midi: 50 },
            { string: 'A', fret: 3, note: 'C', midi: 48 },
            { string: 'A', fret: 2, note: 'B', midi: 47 }
          ]
        },
      },
      {
        label:    'Learn — The rhythm',
        label_es: 'Aprende — El ritmo',
        text: 'Press Play on the tab and watch the cursor. The notes are not all the same length. The first E is long and the second is short. C and B at the end ring for two beats each.',
        text_es: 'Pulsa Play en la tablatura y mira el cursor. Las notas no duran lo mismo. El primer E es largo y el segundo es corto. C y B al final suenan dos tiempos cada una.',
        tab: {
          caption: 'The whole riff · E E G E D C B · 2 bars',
          caption_es: 'El riff completo · E E G E D C B · 2 compases',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 0.75 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.75 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 0.5 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        },
      },
      {
        label:    'Practice — The whole riff',
        label_es: 'Practica — El riff completo',
        text: 'Play the whole riff with the tab at 60 BPM, in that rhythm. Made a mistake? Keep going. You\'ve got it when: four laps in a row without stopping (a lap is once through the riff). Stopping at the D? Play just E D C B three times, then try again.',
        text_es: 'Toca el riff completo con la tablatura a 60 BPM, con ese ritmo. ¿Te equivocaste? Sigue. Lo tienes cuando: cuatro vueltas seguidas sin detenerte (una vuelta es tocar el riff una vez completo). ¿Te detienes en el D? Toca solo E D C B tres veces, y vuelve a intentarlo.',
        tab: {
          caption: 'The whole riff · E E G E D C B · 2 bars',
          caption_es: 'El riff completo · E E G E D C B · 2 compases',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 0.75 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.75 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 0.5 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        },
      },
      {
        label:    'Practice — Faster',
        label_es: 'Practica — Más rápido',
        text: 'Set the tab to 80 BPM and play the whole riff. You\'ve got it when: four laps in a row at 80 BPM without stopping. Losing the beat? Play two laps at 70 BPM, then go back to 80.',
        text_es: 'Pon la tablatura a 80 BPM y toca el riff completo. Lo tienes cuando: cuatro vueltas seguidas a 80 BPM sin detenerte. ¿Pierdes el ritmo? Toca dos vueltas a 70 BPM, y luego regresa a 80.',
        tab: {
          caption: 'The whole riff · E E G E D C B · 2 bars',
          caption_es: 'El riff completo · E E G E D C B · 2 compases',
          notes: [
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 1.5 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.5 },
            { string: 'A', fret: 10, note: 'G', midi: 55, beats: 0.75 },
            { string: 'A', fret: 7,  note: 'E', midi: 52, beats: 0.75 },
            { string: 'A', fret: 5,  note: 'D', midi: 50, beats: 0.5 },
            { string: 'A', fret: 3,  note: 'C', midi: 48, beats: 2 },
            { string: 'A', fret: 2,  note: 'B', midi: 47, beats: 2 }
          ]
        },
      },
      {
        label:    'Practice — With the band',
        label_es: 'Practica — Con la banda',
        text: 'Press Play on the band with Slow on (100 BPM) and play the riff along with it. You\'ve got it when: four laps with the band without dropping out. Dropping out? Turn on Metronome and count 1 2 3 4 out loud for one lap, then come back in. Then turn Slow off and play at record speed, or open the Song Journey page and play with the full track.',
        text_es: 'Pulsa Play en la banda con Lento activado (100 BPM) y toca el riff con ella. Lo tienes cuando: cuatro vueltas con la banda sin salirte. ¿Te sales? Activa el Metrónomo y cuenta 1 2 3 4 en voz alta durante una vuelta, y luego vuelve a entrar. Después apaga Lento y toca a la velocidad del disco, o abre la página de Recorrido de la canción y toca con la pista completa.',
        snippet: { track: 'seven-nation-army', fromBar: 1, bars: 8,
                   label:    'Four laps with the band',
                   label_es: 'Cuatro vueltas con la banda' },
      },
    ],
  },
```

## 2. Wording fix in ca-11 (from this morning's no-map order)

The earlier order's replacement text left "out loud" in the ca-11 step 2 standard twice. Fix the text, and nothing else in that step:

- EN: `E–G–A–B in order, out loud, three times through, saying each name out loud.` → `E–G–A–B in order, three times through, saying each name out loud.`
- ES: `E–G–A–B en orden, en voz alta, tres veces seguidas, diciendo cada nombre en voz alta.` → `E–G–A–B en orden, tres veces seguidas, diciendo cada nombre en voz alta.`

## 3. Gate and ship

```
node tools/checks.mjs --skip-links     # run ONCE
git add -A && git commit -m "Rebuild ca-10 Seven Nation Army to Learn/Practice ladder; ca-11 wording fix"
git push
```

`checks.mjs` should report 1d (journeyLayer 2 valid), 1ak (snippet window) and 1ay (no "N beats each" claims in this entry) green. No new assets, so the `sw.js` bump is whatever `checks.mjs` does on its own. Never hand-edit it.

## Hard stops

- **STOP** if the current ca-10 on main doesn't match the base described here (4 steps, first label "The opening call"). Someone edited it, so report back instead of overwriting.
- **STOP** if `checks.mjs` rejects `journeyLayer: 2` or the snippet window.
- Do not change the id, the `number`, the title, or any other activity except the ca-11 standard in section 2.
- Do not run `checks.mjs` twice.

## Verify after push (Playwright, 1366×657, dev bypass, EN + ES)

- ca-10 shows 6 steps with Learn/Practice labels and no bullet lists.
- Every Practice step shows the green "You've got it when" / "Lo tienes cuando" rule. The Learn step shows none.
- Steps 3–5 tabs play the dotted rhythm: long E, short E, … C and B two beats each.
- The orange band player appears once, on step 6 only.
- The Journey button opens the Seven Nation Army page at Layer 2.
- Teacher console → Class activities → ca-10 detail matches.

## Report back

- Commit SHA, `CACHE_VERSION` old → new (once), and a screenshot of steps 1 and 6 in EN.
