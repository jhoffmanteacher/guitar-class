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

### [x] Module 1 · Set 1 — remove Hint/Stuck/Level up from the "Safe handling" step (done 2026-07-23)
In `module-1.js`, practice station `c`, the "Safe handling (every session)" step should drop
its `hint`/`stuck`/`levelUp` fields (+ `_es` twins) and show just the instruction text (EN + ES).
(Was briefly applied then reverted on 2026-07-23 — clean to-do now.)

### [x] Hint / Stuck? / Level up disclosures reflow the pill row when expanded (done 2026-07-23)
- **Symptom:** clicking Stuck?/Level up drops the panel *between* the pills and shoves the
  others onto a new line.
- **Cause:** the three pills are native `<details>` inside `.step-folds{display:flex;flex-wrap:wrap}`
  (`app.js` ~1823-1828, `styles.css` ~1111). Pill + panel share one `<details>`, so an open
  panel widens the flex item (~70ch) and forces siblings to wrap.
- **Approved fix (Jonathan signed off on a mockup, 2026-07-23):** separate pills from panels —
  keep the three pills in a fixed row; open the panel full-width **below** the row.
- **DECIDED (Jonathan, 2026-07-23):** one panel open at a time (tab-style); tapping the open
  pill closes it.
- Verified before building: not fixed in the repo as of implementation (checked latest commits).

### [x] Expanding a section scrolls it so the top hides under the header (done 2026-07-23)
- **Symptom:** expanding a section sometimes makes the page "jump up" so the first part of the
  expanded content sits above the top of the screen / under the sticky header.
- **Likely cause:** a `scrollIntoView`/focus call on expand aligns the element top to viewport
  top (0) without offsetting for the sticky header. Check `focusPanel`, the Song-Journey
  "open at the top" logic (commit `23ef957`), and `.step-fold`/section expand handlers.
- **Fix approach:** add a header-height scroll offset (or `scroll-margin-top`); verify it
  doesn't regress the "open at the top" behavior.

---

## Features / redesigns

### [x] "Keep practicing" — open as its own page, not a top-of-module panel (done 2026-07-23)
- **Where:** `#keep-practicing-btn` (index.html), `toggleKeepPracticing` (app.js), `kp.*` (i18n.js), styles.css.
- **Decision (2026-07-23):** keep the feature but open it as its **own full-screen page** — model
  on the `games-screen` pattern (own URL hash, browser Back exits).
- **Built:** generic `.page-screen` pattern (site-normal look) with `#keep-practicing` hash;
  **Jonathan also opted to convert "My progress" in the same round** (`#my-progress` hash) —
  the "revisit" note is resolved for My progress. "My skills checklist" (per-set tab) unchanged.
- No new i18n strings — topbars reuse `btn.backToPractice` + the `nav.*` titles.

### [x] Song list is overwhelming — organize into categories (done 2026-07-23)
- **Where:** Songs hub — `#songs-hub-btn` → `toggleSongsHub` → `#songs-hub-panel` (app.js ~3918).
- **Decision (2026-07-23):** **two-tier grouping** — Core (the 6 thread songs) first, then a
  Choice menu broken into **sub-groups**.
- **DECIDED (Jonathan, mockup review 2026-07-23): sub-group axis = difficulty/skill layer** —
  First riffs & single notes (start M1–4) / Chord & strumming songs (M5–8) / Advanced (M9–12),
  grouped by the module where each song first appears; groups collapsible, first open by default;
  module Focus songs sit inside groups with their tag; student-request row renders last.
- Category labels added EN + ES in `i18n.js` (+ `translations-review.md`).
- Also (Jonathan, 2026-07-23): student-choice row renamed "…means something to **you**".

### [x] New module: Changing guitar strings (in-class assessment) (done 2026-07-23)
- A **dedicated module** on changing strings, a **graded in-class assessment**.
- **Scope (2026-07-23):** covers **both nylon/classical AND steel-string**; nylon teaches the
  **ball-end** method (no classical tie-knot — the string type being purchased).
- **DECIDED (Jonathan, 2026-07-23):** named **"String Changing"** as **Module 13**; **no B/C
  stations** — a single-flow set (new pattern, see WORKFLOW.md): one "Learn the process" tab into
  the checklist. **Assessment = the 4 checklist skills** (safe removal · bridge seating · post
  winding · tune-stretch-hold), each with a gotItWhen bar + mc practice drill. **Custom inline
  SVG diagrams** (EN/ES label variants). Videos oEmbed-verified: Lauren Bateman (steel), Takamine
  (nylon), LEARNINGCHORDS (ball-end nylon), guitarraviva (en español).

---

## Sequencing note (2026-07-23)
A separate session was doing **translation work** (touches `i18n.js`, `translations-review.md`,
module `_es` fields). Let that finish and land before implementing anything here that touches
those files — especially Keep Practicing, song grouping, and the string module (all add EN+ES
strings). Lowest-conflict to do first: the **disclosure fix** and the **scroll-jump bug** (both
`app.js`/`styles.css` rendering, no Spanish strings).
