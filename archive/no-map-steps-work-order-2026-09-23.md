# WORK ORDER — Remove "map" steps and figures from In-Class Activities

**Date:** 2026-09-23
**Base commit:** `06c7e54` on `main` ("Add ca-20 "Luna" — The Bassline")
**Executor:** Claude Code, one commit, one patch + this doc
**Decision (Jonathan, 2026-09-23):** map-style steps — a fretboard figure plus a sentence, no standard — are not useful in class. Delete them outright, delete every activity figure (including the two on Practice steps), and make sure no future activity ships one. Don't move the fret/finger text anywhere; the tab on each Practice step is the picture.

## Why this is safe for student progress

- Activity completion is saved per activity **id** (`classActivities: { [id]: true }` in Firestore). Steps are not saved.
- Step ticks (`caStepDone[\`${id}:${si}\`]`) are **in-memory only** — they reset on reload. Removing steps shifts indexes but nothing persisted depends on them.
- No id changes anywhere in this order. Never renumber, never reuse.

## Scope — exactly this, nothing more

### 1. Delete these 16 steps from `class-activities.js`

Every step below is `figure` + prose, no `You've got it when:`, no tab, no video. Delete the whole step object (EN and ES together).

| id | Activity | Step | Label |
|---|---|---|---|
| ca-1 | Playing Happy Birthday — The Whole Song | 1 of 6 | Fretting-hand basics |
| ca-2 | Finger Gym 1 | 1 of 6 | The gym zone |
| ca-3 | Finger Gym 2 — Down the Ladder | 1 of 6 | The gym zone |
| ca-4 | Finger Gym 3 — Up the Neck | 1 of 6 | Landing marks |
| ca-5 | Finger Gym 4 — Fingers Down | 1 of 6 | The gym zone |
| ca-6 | Finger Gym 5 — The Skip | 1 of 6 | The gym zone |
| ca-7 | Finger Gym 6 — The Meet | 1 of 6 | The gym zone |
| ca-8 | Happy Birthday — First Notes | 1 of 5 | The low E string |
| ca-10 | Seven Nation Army — The Riff | 1 of 5 | The riff map |
| ca-11 | Notes on the Low E String | 1 of 6 | The note map |
| ca-17 | Notes on the A String, Then Happy Birthday | 1 of 7 | Read the map |
| ca-12 | Sub Day Circuit | 1 of 7 | Read the map |
| ca-13 | "the cure" — Intro and Verse on the Low E | 1 of 6 | The map — one string, three notes |
| ca-19 | "the cure" — The Verse on Two Strings | 1 of 7 | Learn — The map |
| ca-20 | "Luna" — The Bassline | 1 of 8 | Learn — The map |
| ca-18 | "the cure" — Intro, Verse and Chorus | 1 of 7 | Learn — The map |

`ca-14` and `ca-15` are `kind: 'check'` entries with no steps — untouched.

### 2. Strip the figure from these 2 Practice steps (keep the steps)

Remove only `figure`, `figureAlt`, `figureAlt_es`. Text, tab, and standard stay word for word.

- `ca-1` step 3 of 6 "Higher landing marks" — `img/ca-hb-low-e-all.svg`
- `ca-17` step 6 of 7 "Lines 3 and 4" — `img/ca-hb-fingers-a.svg`

### 3. Fix the sentences that point at a diagram that no longer exists

Exact edits, EN and the matching ES sentence in the same step. Change nothing else in these steps.

- `ca-11` step 2 "The dot notes" — standard ends "…three times through without looking at the diagram." → "…three times through, saying each name out loud."
- `ca-11` step 4 "Name the fret" — delete the sentence "Cover the diagram and put the guitar in your lap." → "Put the guitar in your lap."
- `ca-11` step 5 "Find the note" — delete the bullet/sentence "Cover the diagram above". Keep "Land on the note and pluck it."
- `ca-17` step 3 "Name the fret" — same edit as ca-11 step 4.
- `ca-17` step 4 "Find the note" — same edit as ca-11 step 5.
- `ca-12` step 2 "Name the fret" — delete the fragment "Diagram covered". Keep "Say the note out loud, then press its button".

Then grep the whole file for `diagram|map above|picture above|circled` (case-insensitive) and read every hit in context. "Circled number under each note" in ca-2 step 2 refers to the **tab's** finger circles — leave it. Anything else that only made sense with the figure: delete the sentence, don't rewrite around it. If a deletion would leave a step with no instruction at all — **STOP** and report; don't invent text.

### 4. Delete the image files and their registrations

Delete these 13 files from `img/` — nothing outside `class-activities.js` renders them (only `sw.js`, `img/RECIPES.md`, and history docs mention them):

```
ca-hb-low-e.svg  ca-hb-low-e-all.svg  ca-hb-fingers.svg  ca-hb-fingers-a.svg
ca-fg-gym-zone.svg  ca-fg-gym-zone-skip.svg  ca-fg-dots.svg  ca-sna-riff-map.svg
ca-lowe-naturals.svg  ca-a-naturals.svg  ca-cure-roots-verse.svg
ca-cure-roots-both.svg  ca-luna-roots.svg
```

- `sw.js` — remove their 13 `./img/ca-*.svg` lines from `ASSETS`. **Do not touch `CACHE_VERSION` by hand**; `checks.mjs` bumps it once.
- `img/RECIPES.md` — remove the render recipes for the `ca-*` figures (keep the module-figure recipes).
- Leave `WORKFLOW.md`, `CHANGELOG.md`, and `archive/` mentions alone — history.

### 5. Lock the door: no figure steps in future activities

- `class-activities.js` schema comment — replace the `figure` / `figureAlt` / `figureAlt_es` block with a one-paragraph rule: *Activities carry no figures (Jonathan, 2026-09-23). No "map" / orientation step of any kind — a step is a Learn step (look, listen, say) or a Practice step (one thing, one standard). The tab is the picture. checks.mjs 1d errors on any `figure` key.*
- `tools/checks.mjs` section 1d — add an **error** (not a flag): any step in `CLASS_ACTIVITIES` with a `figure`, `figureAlt`, or `figureAlt_es` key fails the gate, message: `"<id> step <n>: activities carry no figures (2026-09-23) — delete the step or the key"`. Keep the existing figure-existence check for the module files if it's shared; only the class-activity branch gets the new rule.
- Section 1v (figure sizes / renderer `<img>` audit) — leave as is. The renderers keep their `figure` code path; it simply never fires. No app.js or teacher.js edits in this order.

### 6. Gate and ship

```
node tools/checks.mjs --skip-links     # run ONCE; it bumps CACHE_VERSION
git add -A && git commit
git push
```

Commit message: `Remove map steps and all figures from In-Class Activities`.

## Hard stops

- **STOP** if any step other than the 16 listed matches "figure + no standard" — report it, don't delete it unlisted.
- **STOP** if deleting a step leaves an activity with fewer than 3 steps.
- **STOP** if `checks.mjs` reports anything besides the expected 1d/ASSETS changes.
- Do not renumber ids, resequence `number`, reorder steps, add steps, or "improve" any text beyond section 3.
- Do not run `checks.mjs` twice.

## Verify after push (Playwright, 1366×657, dev bypass, EN + ES)

- Open each of the 15 edited activities; confirm the first step is a real Learn or Practice step and no `.step-figure` renders anywhere in In-Class Activities.
- `ca-1` step 2 (was 3) and `ca-17` step 5 (was 6) still show their tab and green standard rule.
- Console: no 404s for `img/ca-*.svg`.
- Teacher console → Class activities → open one detail view; no broken image.

## Report back

- Files changed, step counts per activity before → after.
- The list of "diagram" sentences you edited under section 3, with the final wording.
- `CACHE_VERSION` old → new (once).

## Follow-ups outside this repo (Jonathan, not the executor)

- The `guitar-class-activity` skill still says "orientation steps first — figure plus one sentence." It needs the same rule; a skill update is proposed separately.
- Teacher decks may still open with a map slide. Decks are a separate decision — not in this order.
