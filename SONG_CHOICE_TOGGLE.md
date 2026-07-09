# SONG_CHOICE_TOGGLE.md — "Take It to a Song" alternate-song toggle

**Repo:** `jhoffmanteacher/guitar-class` · **Model:** Sonnet
**Queue position:** run AFTER `SITE_FIXIT_JULY_2.md`, `SITE_FIXIT_JULY_3.md`, and
`LOOPER_REMOVAL.md` are complete, and ideally after the song-list review session
(pairings depend on the final song list). Do not run in parallel with anything —
this touches `app.js`, `styles.css`, multiple `module-*.js`, `sw.js`, `CHANGELOG.md`.

---

## Goal

Some "Take It to a Song" challenges should let a student choose between two core
songs at the same skill layer. A step may carry an optional `alt:` object; the
renderer shows two pill buttons (e.g. `🎵 Watchtower | 🎵 Let It Be`) and swaps the
challenge content. One step, one checkbox, one skills array, one Firestore key —
regardless of which song the student picks.

## Documented assumptions (Jonathan can veto)

1. **Purely additive.** No existing step is removed, merged, split, or reordered.
   `alt:` is only added to a step whose alternate song does NOT already have its
   own step in that same set's Take It to a Song section.
2. Alternate songs come from the **core six only**: Seven Nation Army, All Along
   the Watchtower, Sweet Child O' Mine, Luna, Let It Be, "the cure."
3. The alt variant sits at the **same layer** as the parent step (Unit 2 alt =
   single-note roots, Unit 3 alt = power chords, etc.).

## Hard rules (non-negotiable)

- **Never modify `id:` or `skills:` fields** anywhere. `skillCount` in
  `MODULE_MANIFEST` must not change (no skills are added).
- `alt:` never carries its own `skills:`, `id:`, or checkbox — those live on the
  parent step only.
- **Settled song facts** (do not "fix" these):
  - Watchtower loop = Am–G–F–G everywhere (bass roots A·G·F·G).
  - Sweet Child O' Mine = standard tuning on the site.
  - Luna: F–Am vamp plus Dm–C; 6/8 felt in 2 (teach two downbeat strums per
    bar, nothing syncopated); no capo — simplified F (xx3211) until Module 7's
    full barre; solos use D minor pentatonic Pattern 1 at fret 10; ◐ in Module
    3 (sierreño as power chords).
  - "the cure": capo 1, shapes Am–C–Dm–F–G/B; Unit 2 = single-note roots.
- **No new YouTube content.** Alt variants are text/tab/playSeq only. If a step's
  alt would genuinely need a video, skip that pairing and note it in the report.
- No `#layer-N` anchors on Song Journey links (they were stripped in
  SITE_FIXIT_JULY_2) — alt links point at the page top, e.g.
  `tabs/let-it-be.html`.
- Verify every `tab:`/`playSeq` MIDI number against pitch (E2=40, F2=41, G2=43,
  A2=45, C3=48, D3=50, etc.). No guessed frets.
- No time limits / time caps in alt text (self-paced class).
- `node tools/checks.mjs` before every push.

## Data contract

```js
{
  text: '…existing challenge, untouched…',
  hint: '…', stuck: '…', levelUp: '…',
  skills: [1, 2, 4, 5, 6],            // parent only — untouched
  tab: { /* existing */ },
  response: { /* existing — see response rule below */ },
  alt: {
    label: 'Let It Be',               // pill button text
    text: 'Challenge — …same voice: verb-first, "You\'ve got it when:" win line, 🧵 Song Journey link…',
    hint: '…≤2 sentences…',
    stuck: '…',
    levelUp: '…',
    tab: { caption: '…', notes: [ { string, fret, note, midi } ] },   // optional
    playSeq: { … },                                                    // optional
    responsePrompt: '…',              // optional — overrides prompt text only
    responsePlaceholder: '…'          // optional
  }
}
```

**Response rule:** the Firestore key and response `type` never change. If the
parent's `short` prompt is song-specific, the alt may override only
`prompt`/`placeholder` text via `responsePrompt`/`responsePlaceholder`. Never add
`alt:` to a step whose response is a keyed MC (`answer:`/`explain:`) unless the
question is song-neutral; if it isn't, skip the pairing.

**Content voice:** alt challenges follow the frozen template — named challenge,
verb-first, one sentence of *what*, "You've got it when:" win condition, *why*
in the hint, Stuck?/Level up present, 🧵 Song Journey link.

## Renderer spec (`app.js` + `styles.css`)

- When a step has `alt:`, render a pill pair above the challenge:
  parent song (derive label from a new optional `label:` on the parent, or
  default `'Original'` — prefer adding `label:` to the parent when adding `alt:`,
  e.g. `label: 'Watchtower'`).
- Clicking a pill swaps `text`, `hint`, `stuck`, `levelUp`, `tab`, `playSeq`, and
  response prompt/placeholder in place. Default view = parent song.
- The pill choice is UI state only — do NOT write it to Firestore, and do not
  reset the done-checkbox on toggle.
- Interactive tab/playSeq in the alt must be fully functional (clickable notes,
  audio) — reuse the existing render path, no forked code.
- Style: match existing pill/button language in `styles.css`; both variants
  readable on Chromebooks; no layout shift taller than the swapped content.
- `sw.js`: bump cache version.

## Sessions (run sequentially, checkpoint between each)

### Session 1 — Renderer + one pilot pairing — DONE (2026-07-09)
1. Implement the renderer per spec.
2. Pilot: **Module 2 → Take It to a Song → "Watchtower bass line"** step.
   Add `label: 'Watchtower'` and an `alt:` for **Let It Be** — bass roots of
   C–G–Am–F on the E & A strings at 60 BPM
   (C = A-str fret 3 midi 48 · G = E-str fret 3 midi 43 · A = E-str fret 5
   midi 45 · F = E-str fret 1 midi 41), with caption, win line, Stuck?/Level up,
   and 🧵 link to `tabs/let-it-be.html`.
   *(First verify Let It Be does not already have its own step in that set — if
   it does, use the nearest core song that doesn't.)*
3. Verify in headless Chrome: toggle works, checkbox persists across toggles,
   tab notes clickable in both variants, 0 console errors. Screenshot both
   states.
4. Push. **STOP — Jonathan reviews the pilot before Session 2.**

Shipped as `5336eed`. Actual Let It Be tab used the site's own canonical Layer 2
bass roots (C on A-str fret 3, G on E-str fret 3, A on open A-str fret 0, F on
E-str fret 1 — matching `tabs/let-it-be.html`'s Layer 2 diagram exactly) rather
than the fret-5-A placement sketched above. Also found and fixed a real bug:
the two variants render independent response inputs sharing one Firestore key,
so a `data-resp-key` sync was added to `onResponseChange`/`onStepMcSelect` in
`app.js` to keep an answer typed in either variant in sync across the toggle —
carry this forward, it's now part of the renderer, not optional.

### Session 2 — Pairing survey (no content written)
1. Sweep every Take It to a Song section, modules 1–8. For each step, list:
   module/set, parent song, layer, candidate alt song (core six, same layer,
   not already a step in that set), and whether the response is safely
   overridable.
2. Output a markdown table with a ✅/❌ recommendation and one-line rationale
   per row. Flag any pairing that would require a video or a keyed MC change
   as ❌.
3. **STOP — Jonathan approves/edits the pairing list before Session 3.**

### Session 3 — Build approved pairings
1. Add `alt:` (+ parent `label:`) for each approved row only.
2. Verify each in headless Chrome (toggle, audio, 0 console errors).
3. `node tools/checks.mjs` → push.
4. `CHANGELOG.md` student-facing entry ("Some song challenges now let you pick
   between two songs").
5. `CLAUDE.md` settled-facts entry: the `alt:` contract (additive-only, no
   skills/id changes, UI-state-only toggle, core-six pool).

## Out of scope
- Module 4 backing-track cards / `backingKey` (looper-removal territory) — no
  alt toggles there in this pass.
- Choice/supplemental songs (Tu Boda, Oye Mi Amor) as alt variants.
- Persisting the student's song pick to Firestore.
