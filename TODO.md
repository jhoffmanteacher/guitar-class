# Module 2 — Remaining Changes

Tracking the rest of the Module 2 changes we chunked out. Chunk 1 ("You've got it when..." descriptors) is done. These are still pending:

---

## Chunk 2 — Audio utility + Interactive Fretboard Diagram

### Part A: Web Audio note player (foundation for everything else)

- Build a reusable `playNote(midiNumber)` function using the browser's Web Audio API — no external audio files.
- Use a triangle wave oscillator with a short envelope (attack 0.01s, hold ~1s, decay 0.5s).
- Frequency formula: `f = 440 * 2^((n-69)/12)`.
- Lazy-init the `AudioContext` on first user interaction (browser autoplay rules).
- MIDI numbers for Module 2 notes:
  - Low E string (frets 0–12): E2=40, F2=41, F#2=42, G2=43, G#2=44, A2=45, A#2=46, B2=47, C3=48, C#3=49, D3=50, D#3=51, E3=52
  - A string (frets 0–12): A2=45, A#2=46, B2=47, C3=48, C#3=49, D3=50, D#3=51, E3=52, F3=53, F#3=54, G3=55, G#3=56, A3=57
- Inline 🔊 button style: ~18px, `var(--blue-text)`, no border, transparent background.

### Part B: Interactive Fretboard Diagram (Module 2, Set 1)

- Add an interactive fretboard rendered inside Module 2 Set 1's computer station.
- Show low E string (bottom row) and A string (top row), **frets 0–12** (extended from the spec's 0–8 to match the rest of Module 2).
- Each natural-note position is a clickable button — click highlights the note and plays the corresponding tone.
- "Quiz me" mode: hides labels, highlights a random fret dot, asks student to identify the note. Simple correct/incorrect feedback.
- Trigger from a new property like `fretboardDiagram: true` on the Set 1 station step in `module-2.js`. Rendered inline by `buildStations()` in `index.html`.
- Use existing CSS variables (`var(--bg2)`, `var(--border)`, `var(--blue-text)`, `var(--text)`).
- Responsive on narrow mobile viewports.

### Part C: 🔊 buttons in Set 1 station text

- Add a small 🔊 button next to standalone note names in Set 1 station text (e.g., the "E · F · G · A · B · C · D · E" play-along drill).
- Do NOT add to video titles, hints, or response prompts.

---

## Chunk 3 — Inline TAB Display (Module 2, Set 2)

- Add a rendered TAB diagram inside Module 2 Set 2's computer station, between the TAB explainer video step and the practice step.
- Shows the Happy Birthday melody on E and A strings (first phrase): Low E frets 0 · 0 · 2 · 0 · 5 · 3
- Render as 6 horizontal lines labeled e, B, G, D, A, E (top to bottom). Only E and A lines have notes; other strings show dashes.
- Fret numbers appear above the line at correct horizontal positions.
- Note-name row below the TAB: E · E · F# · E · A · G — each with a 🔊 button.
- Caption: "Happy Birthday — first phrase · Low E & A strings only"
- Define as a new `tab: { ... }` property on the Set 2 station step in `module-2.js`. Render with a new `buildTab()` helper in `index.html`.
- Match site card/box styling: `var(--bg2)` background, `var(--border)` border.

---

## General notes (apply to all remaining chunks)

- Backward-compatible — no other modules should change.
- Vanilla JS, no frameworks, no hardcoded colors (use CSS variables).
- Test in Live Server on both desktop and narrow mobile widths before pushing.
- Files that will change: `index.html`, `module-2.js`. Optionally a new `audio-utils.js` if we split out the audio code.
