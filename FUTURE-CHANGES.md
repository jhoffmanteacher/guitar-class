# Guitar Class Website — Future Changes

A planning/work list of changes to make to the site. Maintained collaboratively;
implemented by the local Claude Code ("opusplan") in VS Code.

**Started:** 2026-07-23

## For the implementer (opusplan)
- Work items **top to bottom** unless Jonathan says otherwise. Do one item at a time.
- Follow the standard workflow in `CLAUDE.md`: for any code push, run `node tools/checks.mjs`
  first, fix anything it flags, and only push when Jonathan says "push to GitHub."
- **Respect the "Open question" / "Not yet decided" notes** — if an item still has an open
  decision, ask Jonathan (multiple-choice, per CLAUDE.md) before implementing that part.
- Any new student-facing shell string must be added to `i18n.js` in **both `en` and `es`**
  in the same edit (see CLAUDE.md i18n rules).
- Mark an item done here (`[x]` + date) as part of the same change that ships it.

## Status key
`[ ]` not started · `[~]` in progress · `[?]` possibly done — verify · `[x]` done (shipped)

---

## Bugs / fixes

### [ ] Module 1 · Set 1 — remove Hint/Stuck/Level up from the "Safe handling" step
In `module-1.js`, practice station `c`, the "Safe handling (every session)" step should drop
its `hint`/`stuck`/`levelUp` fields (+ `_es` twins) and show just the instruction text (EN + ES).
(Was briefly applied then reverted on 2026-07-23 — clean to-do now.)

### [~] Hint / Stuck? / Level up disclosures reflow the pill row when expanded — FIX APPROVED
- **Symptom:** clicking Stuck?/Level up drops the panel *between* the pills and shoves the
  others onto a new line.
- **Cause:** the three pills are native `<details>` inside `.step-folds{display:flex;flex-wrap:wrap}`
  (`app.js` ~1823-1828, `styles.css` ~1111). Pill + panel share one `<details>`, so an open
  panel widens the flex item (~70ch) and forces siblings to wrap.
- **Approved fix (Jonathan signed off on a mockup, 2026-07-23):** separate pills from panels —
  keep the three pills in a fixed row; open the panel full-width **below** the row.
- **OPEN DECISION:** one panel open at a time (tab-style) vs. independent toggles (panels stack
  below). Ask Jonathan before building.
- **VERIFY FIRST:** a parallel Cowork session may have already fixed this. As of 2026-07-23 it
  was NOT fixed in the repo (no relevant commit in last 40). Check latest before implementing to
  avoid duplicate/conflicting work.

### [ ] Expanding a section scrolls it so the top hides under the header
- **Symptom:** expanding a section sometimes makes the page "jump up" so the first part of the
  expanded content sits above the top of the screen / under the sticky header.
- **Likely cause:** a `scrollIntoView`/focus call on expand aligns the element top to viewport
  top (0) without offsetting for the sticky header. Check `focusPanel`, the Song-Journey
  "open at the top" logic (commit `23ef957`), and `.step-fold`/section expand handlers.
- **Fix approach:** add a header-height scroll offset (or `scroll-margin-top`); verify it
  doesn't regress the "open at the top" behavior.

---

## Features / redesigns

### [ ] "Keep practicing" — open as its own page, not a top-of-module panel
- **Where:** `#keep-practicing-btn` (index.html), `toggleKeepPracticing` (app.js), `kp.*` (i18n.js), styles.css.
- **Today:** left-rail button opens a *top panel* dropping over the current module.
- **Decision (2026-07-23):** keep the feature but open it as its **own full-screen page** — model
  on the `games-screen` pattern (own URL hash, browser Back exits).
- **Revisit:** consider giving "My progress" / "My skills checklist" the same full-page treatment.

### [ ] Song list is overwhelming — organize into categories
- **Where:** Songs hub — `#songs-hub-btn` → `toggleSongsHub` → `#songs-hub-panel` (app.js ~3918).
  Today it's one flat card of all songs (core-first, then alphabetical).
- **Decision (2026-07-23):** **two-tier grouping** — Core (the 6 thread songs) first, then a
  Choice menu broken into **sub-groups**.
- **OPEN DECISION:** sub-group axis — by **language** (English vs Spanish/regional Mexican) or by
  **difficulty/skill layer**. Show Jonathan a mockup, then implement.
- New category labels need EN + ES in `i18n.js`.

### [ ] New module: Changing guitar strings (in-class assessment)
- A **dedicated module** on changing strings, to be a **graded in-class assessment**.
- **Scope (2026-07-23):** cover **both nylon/classical AND steel-string**. For nylon, teach the
  **ball-end** method (buttoned strings, no classical tie-knot — the string type being purchased).
- **Must include:** step **visuals** (diagrams/photos) and **videos** (found via WebSearch +
  oEmbed-verified, diverse creators, aim for a Spanish/bilingual option — per CLAUDE.md rules).
- **OPEN SCOPE:** new Module 13 vs. slot into existing? Full Station A/B/C + skills-checklist
  structure (it's an assessment)? Extend `MODULE_MANIFEST`/progress strip? Source vs. custom visuals?

---

## Sequencing note (2026-07-23)
A separate session was doing **translation work** (touches `i18n.js`, `translations-review.md`,
module `_es` fields). Let that finish and land before implementing anything here that touches
those files — especially Keep Practicing, song grouping, and the string module (all add EN+ES
strings). Lowest-conflict to do first: the **disclosure fix** and the **scroll-jump bug** (both
`app.js`/`styles.css` rendering, no Spanish strings).
