---
paths:
  - "module-*.js"
  - "class-activities.js"
  - "i18n.js"
  - "tabs/**"
---

## Content rules: wording, lists, strings, drills, videos

Moved from CLAUDE.md (2026-11-26). The why: `WORKFLOW.md` → "Rationale behind the CLAUDE.md rules".

- **Simplest direct wording:** short sentences, plain verbs, no idioms, define each music term at first use (1w;
  modules; an In-Class Activity line uses the plain word instead, see `activities.md`). Defined site terms ("two
  homes") aren't idioms. Define "root" once, in the first visible Module 2 step that uses it: the note a chord is
  named after.
- **No teacher speak:** no lesson-plan words (self-assessment, reflect, benchmark, objective,
  demonstrate/apply/identify), poster lines, praise padding, or "why this matters" sentences. "Assessment" only as
  "(assessment preparation)" in Challenge titles (1w-t).
- **Typed answers only when writing IS the task**; otherwise the student plays something with a countable "got it"
  line (1ar). 1ar's per-module budget (Modules 3–6) fails only UPWARD; it counts every `response:{type:'short'}` in
  the data, rendered or not.
- **Multi-step directions are lists (modules):** `<ol>`/`<ul>`, `_es` mirrors, for >~200 chars with 2+ actions.
  "You've got it when: …" is plain text AFTER `</ol>`, never an `<li>` or a hand-written span; then "No score —"
  notes, partner bonuses, Journey links, then `step-figure`, all last. Scope: step `text:` and practice `prompt`s.
  Leave alone single actions, hints, `gotItWhen`, placeholders. Preserve the author's words; never rewrite the voice
  (this does not cover In-Class Activity directions: `activities.md`).
- **Challenge cards** (`Challenge N — Title:`): the full title in `label` (<~70 chars); `text` opens into directions;
  the body is always a list. Defining parentheticals go in the text, identifying ones stay in the title. Existing
  lists stay byte-for-byte.
- **Presentation is render-time.**
- **Strings named, never numbered** (low E · A · D · G · B · high e; 1j). Chord shorthand like `xx4432` is notation and
  stays. The only numbers allowed are anchored to the name: Module 7's two root-naming MCs ("string 6 (the low E)") and
  the `diagram.string*` labels in `i18n.js` ("Low E (6th string)"); 1j pins the count.
- **No paper drills** (scissors, cards, pen): use `step.drill` (`shuffle` / `deck` / `ear` / `notecall`; `DECKS`,
  `EAR_POOLS`). Drop "Got someone around?" from deck cards.
- **Videos:** never invent YouTube IDs; verify with `WebSearch` + oEmbed, else drop. In a cloud session reach oEmbed
  through `WebFetch` (`curl` is blocked). Before settling on Marty Music / JustinGuitar / Andy Guitar, spend one search
  on a comparable lesson from a woman, a creator of colour or a Spanish-language channel; lesson quality still wins.
