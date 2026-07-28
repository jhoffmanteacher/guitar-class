# Work order — module review ↔ map alignment (Jonathan's calls, 2026-07-28)

Ready-to-run for a local Claude Code session on the guitar-class repo.
Resolves open-decisions items **19, 20, 21** (decisions made by Jonathan
2026-07-28). Written against `main` @ `fbd5bc5`. All line numbers are from that
commit — re-grep if the file has moved.

House rules that apply to every edit below (see `CLAUDE.md` /
`site-conventions.md`): every EN string edit gets its hand-written ES twin
(Modules 1–6 are hand-translated — no machine ES); **never reuse or renumber a
skill id** — new checklist rows get fresh ids; run `node tools/checks.mjs`
before pushing and ship `CACHE_VERSION` pre-bumped; add a `CHANGELOG.md` entry
(draft at the bottom).

---

## 1 · Module 4 — assess box must match the edited map (item 19)

Jonathan edited the map's Unit 4 assessment. It now reads:

> **Task 1:** Perform an original 4-bar solo over a teacher-chosen course-song
> backing track (drawn from the six core songs) using the full minor pentatonic
> box, including at least one hammer-on, pull-off, or vibrato.
> **Task 2:** Read a short **4-bar** pentatonic lick from TAB and play it
> (Requirements unchanged: phrasing strategy named, no restarts, clean tone
> incl. high strings — **no** dynamics-contrast requirement, **no** D/G
> note-naming task.)

Site keeps its student-paced framing — do **not** write "teacher-chosen"
anywhere on the site (standing rule; the student picks the course-song track).

All edits in `module-4.js`:

**1a. Drop the dynamics-contrast clause** from `MODULE_REVIEWS[4].assessItems[0]`
(~line 1254) and its ES twin (~1259). Delete exactly:
`, and with at least one deliberate loud/soft contrast you can point to on the recording`
(EN) / `, y con al menos un contraste deliberado de fuerte/suave que puedas
señalar en la grabación` (ES). The item ends after
`...(call-and-response or four-phrase)` / `...(llamada y respuesta o cuatro frases)`.
Keep the phrasing-strategy clause — the map's Accuracy requirement still names it.

**1b. Delete the D & G note-naming assessItem** — assessItems[1]
`'Name the natural notes on the D and G strings from memory through fret 10'`
(~1255) and its ES twin (~1260). It's not in the map's Unit 4 assessment.
**Keep** checklist row `mr4-s7` and all the D/G teaching — still taught,
just not graded here.

**1c. Lick: 1 bar → 4 bars**, everywhere in `module-4.js`:

- `assessItems[2]` + ES (~1256/1261): `1-bar` → `4-bar` / `1 compás` → `4 compases`.
- `mr4-s11` text + text_es (~1250–1251): same swap.
- Set-level skill `m4w3-s8` (~1162–1165): text, text_es, gotItWhen,
  gotItWhen_es: same swap.
- m4w3 `assessment.goal` / `goal_es` / `performance` (~1090–1092): same swap.
- The "Read a lick cold" drill (~1023–1050): text/text_es ("Here's a 1-bar
  lick…" → "Here's a 4-bar lick…"), hint/hint_es ("a NEW 1-bar lick" → "a NEW
  4-bar lick"), caption/caption_es ("one bar" → "four bars" / "un compás" →
  "cuatro compases").
- **Extend the drill's TAB to 4 bars** (16 quarter notes at 60 BPM — same
  one-note-per-beat convention as the rest of the module, all inside the Am
  box 1, frets 5–8, ends on the root so it lands home). Replace `tab.notes`
  with:

  ```js
  notes: [
    // Bar 1 — climb from the low root
    { string: 'E', fret: 5, note: 'A', midi: 45 },
    { string: 'E', fret: 8, note: 'C', midi: 48 },
    { string: 'A', fret: 5, note: 'D', midi: 50 },
    { string: 'A', fret: 7, note: 'E', midi: 52 },
    // Bar 2 — through the middle strings
    { string: 'D', fret: 5, note: 'G', midi: 55 },
    { string: 'D', fret: 7, note: 'A', midi: 57 },
    { string: 'G', fret: 5, note: 'C', midi: 60 },
    { string: 'G', fret: 7, note: 'D', midi: 62 },
    // Bar 3 — peak and turn
    { string: 'B', fret: 5, note: 'E', midi: 64 },
    { string: 'B', fret: 8, note: 'G', midi: 67 },
    { string: 'e', fret: 5, note: 'A', midi: 69 },
    { string: 'B', fret: 8, note: 'G', midi: 67 },
    // Bar 4 — come home to the root
    { string: 'B', fret: 5, note: 'E', midi: 64 },
    { string: 'G', fret: 7, note: 'D', midi: 62 },
    { string: 'G', fret: 5, note: 'C', midi: 60 },
    { string: 'D', fret: 7, note: 'A', midi: 57 }
  ]
  ```

  (Match the file's existing string-name spelling for the two E strings —
  check how other module-4 tabs distinguish low E vs high e before copying
  verbatim.)

After 1a–1c, `grep -n "1-bar\|1 compás" module-4.js` must come back clean
(the only prior hits were the lick references above; "un compás" also appears
legitimately at ~248/719/781 — leave those, they're not the lick).

## 2 · Module 5 / Unit 5 — no site action (item 20)

Jonathan fixed the map (Unit 5 Requirements now say "song played from
memory", singular — matching the site's one-core-song assessment). **Do
nothing to `module-5.js` or `i18n.js`.** Item 9 (the shared `review.playPrompt`
"or a song of your choice" line) remains open — do not touch it in this pass.

## 3 · Add missing self-rating checklist rows (item 21)

These are graded in `assessItems` but have no `MODULE_REVIEWS[n].skills` row,
so students can't 1/2/3 them. Add one row each, fresh ids only. Suggested
text below — match surrounding voice; ES must be hand-written, not machine.

**Module 1** (`module-1.js`, after `mr1-s5`) — id **`mr1-s6`**, `set: 'w2'`:
- EN: `I can name all 6 strings from memory (E A D G B e) — in order and at random`
- ES: `Puedo nombrar las 6 cuerdas de memoria (E A D G B e) — en orden y al azar`

**Module 2** (`module-2.js`, after `mr2-s5`) — id **`mr2-s7`**, `set: 'm2w2'`:
- EN: `I can play the "Watchtower" bass line — or "the cure" root line — from memory at 60 BPM with clean tone and correct fingering`
- ES: `Puedo tocar la línea de bajo de "Watchtower" — o la línea de raíces de "the cure" — de memoria a 60 BPM con tono limpio y digitación correcta`

**Module 3** (`module-3.js`, after `mr3-s8`; existing ids skip s4/s6 — do NOT
reuse them; next fresh ids are s9–s11), all `set: 'm3w2'`:
- **`mr3-s9`** EN: `I can hold a power-chord progression at 80 BPM for 15 seconds with clean muting`
  ES: `Puedo sostener una progresión de acordes de potencia a 80 BPM por 15 segundos con silenciado limpio`
- **`mr3-s10`** EN: `I can play the split strum ("boom-chick") — just the root on beat 1, the full shape on beat 2`
  ES: `Puedo tocar el rasgueo dividido ("boom-chick") — solo la raíz en el tiempo 1, la forma completa en el tiempo 2`
- **`mr3-s11`** EN: `I can clap and count a 4-bar rhythm and name which notes are whole, half, quarter, and eighth notes`
  ES: `Puedo aplaudir y contar un ritmo de 4 compases y nombrar cuáles notas son redondas, blancas, negras y corcheas`

**Module 5** (`module-5.js`, insert after `mr5-s4` so it sits with the m5w3
rows, before `mr5-s8`; existing ids skip s5/s7 — do NOT reuse them) —
id **`mr5-s9`**, `set: 'm5w3'`:
- EN: `I can draw three chords at random from the deck and play them in an 8-bar progression at 70 BPM with clean changes`
- ES: `Puedo sacar tres acordes al azar de la baraja y tocarlos en una progresión de 8 compases a 70 BPM con cambios limpios`

Note: `MODULE_MANIFEST.skillCount` counts **set-level** skills, not
MODULE_REVIEWS rows — but verify `tools/checks.mjs` passes; if it validates
review-row counts anywhere, update the expectation, not the ids.

## 4 · Ship it

1. `node tools/checks.mjs` — full run, green.
2. Bump `CACHE_VERSION` (`sw.js`).
3. `CHANGELOG.md` — draft entry:

   > ## 2026-07-XX — Module reviews aligned with the curriculum map (Units 1–5)
   > ### Changed
   > - **Module 4's assessment now matches the curriculum map exactly:** the
   >   sight-reading task is a 4-bar pentatonic lick (was 1 bar — the cold-read
   >   drill grew to match), and two extras that the map never graded — naming
   >   the D & G string notes, and a deliberate loud/soft contrast in the solo —
   >   are no longer part of the graded list. Both are still taught and still
   >   on the practice checklist.
   > ### Added
   > - **Six new self-rating rows on the module review checklists**, so every
   >   graded skill can be self-rated 1/2/3: string names (Module 1), the
   >   memorized bass line (Module 2), the 80 BPM hold, split strum, and
   >   clap-and-count (Module 3), and the three-random-chords progression
   >   (Module 5).

4. Commit and push per the normal local workflow in `CLAUDE.md`.

## 5 · Doc-side leftovers for Jonathan (Google Doc — not for Claude Code)

The map's **assessment table** is fixed, but the **rubric tab** still has the
old wording in three spots:
- Unit 4 "Skill assessed" line: still says "**1-bar** pentatonic lick from TAB".
- Unit 4 rubric, Pr.4 Knowledge & Reading "3" descriptor e.g.: "Decodes the
  **1-bar** pentatonic lick…".
- Unit 5 "Skill assessed" line still says "one core song **+ one choice
  song** from memory", and the Pr.6 Accuracy "3" descriptor e.g. still says
  "**both songs** played from memory".
