# Warm-up "tune & tone check" — remove or revise the tone check 🔲 TODO

Raised by Jonathan 2026-06-13. The practice-station warm-up that opens every Station C
currently reads "tune all 6 strings to green … then play each string open and at the
1st–3rd fret, listening for buzz." The **tone check** half (the buzz-listening) needs to
be removed or revised.

- Decide scope first (ask Jonathan multiple-choice per CLAUDE.md): remove the tone-check
  sentence entirely vs. revise it (e.g. shorten it, or replace with a different readiness
  cue).
- It's a copy-paste warm-up repeated across many sets/modules — find every instance and
  change them consistently (the text "listening for buzz" / "every note clean before
  today's work" is the marker). Confirm the exact wording with Jonathan before a
  site-wide find-and-replace.
- Files: `module-1.js` … `module-8.js` (the warm-up step appears in each module's
  Station C; Module 4 Sets 1–3 were just added in Session 3.7).

---

## Station C — "run the progression multiple times" tracking 🔲 TODO

Idea (Jose): students should loop each Station C practice progression several times so
they reach all the level-ups (the `levelUp:` 🌶️ lines, tempo/PR ladders, and "give it
a go" stretch challenges) and practice each a couple of times — "reps over speed,"
matching the curriculum-map philosophy.

Open design questions (confirm before building — ask Jose multiple-choice per CLAUDE.md):
- Tracking mechanism: (a) level-up checklist — each challenge's `levelUp:` becomes
  checkable with a ×2 "did it twice" target; (b) simple lap counter per Station C;
  (c) both.
- Rollout: pilot one module (e.g. Module 3) / all Station Cs at once / build one, Jose
  reviews, then propagate.

Build notes:
- Extend the existing `progress` object + Firestore sync (`saveProgress` / `completed`
  in app.js) rather than adding new storage — stays backward-compatible.
- There's already a per-step "Mark done" toggle (`toggleStepDone` / `completed{}`) and
  a 1/2/3 self-rating in the module review (`setSkillLevel`). A ×2 level-up tracker is a
  close cousin of these — reuse the pattern, don't reinvent.
- Needs a visible "where am I" display so reps don't read as busywork — show which
  level-ups are cleared and the ×2 progress.
- Surface in the teacher dashboard alongside the existing skill grid (note: exit-ticket
  + PR-score surfacing is already a separate TODO — WORKFLOW.md Session 6.2; this could
  ride along with it).
- This is a "big change" per WORKFLOW.md working-rule 3 → show ONE wired example +
  ask a multiple-choice question before building the rest.

---

# Site health pass — Chromebook performance, accessibility, dead-link audit 🔲 TODO

Scoped 2026-06-05. Students access the site on **Chromebooks** (not phones), so optimize for that. Three pieces:

## 1. Loading speed
- The heavy content (YouTube videos) is already click-to-load — iframes are injected into `#rp-iframe-wrap` only when a student clicks a video button (`loadPanel('youtube', …)` in `index.html`). So videos are NOT the bottleneck.
- What loads up front and blocks first paint: the Google Translate script in `<head>` (`index.html:25`), then ~245KB of synchronous JS at the top of `<body>` — `config-main.js`, `module-1.js`…`module-8.js`, plus the 3 Firebase SDK scripts (`index.html:557–569`). On a weak Chromebook CPU these parse before the header even renders.
- Plan: make these non-blocking. Add `async` to the Google Translate script. For the local + Firebase scripts, add `defer` — but the inline bootstrap `<script>` at `index.html:732` runs `firebase.initializeApp(...)` immediately and depends on Firebase being loaded first, so deferring the SDK would break it. Safe fix: extract that inline script (lines 732–3092) into an external `app.js` and load it with `defer` after `module-8.js`; deferred external scripts keep global scope (so the `onclick="…"` handlers in the HTML still work) and run in order after parse. Verify in Live Server before pushing.

## 2. Accessibility suggestions (audit, then apply the easy wins)
- Check color contrast (the purple header `#4d1964` on white, and the muted `--text2`/`--text3` grays).
- Add text alternatives / `aria-label`s to icon-only buttons (the FAB tuner/timer/metronome, the ✕ close buttons, the play-triangle video buttons).
- Keyboard navigation: confirm every clickable `<div>` (e.g. the `.fab` buttons use `onclick` on a div) is reachable by Tab and operable by Enter/Space — convert to `<button>` or add `role`/`tabindex` where needed.
- Confirm a visible focus outline exists for keyboard users.

## 3. Dead YouTube link audit
- ~222 unique YouTube IDs across `module-1.js`…`module-8.js`. Verify each via the oEmbed endpoint (`https://www.youtube.com/oembed?url=…&format=json` → JSON for valid, 404 for dead), batched in parallel `WebFetch` calls per the CLAUDE.md rule. Replace or drop any dead ones (search-and-verify; never invent IDs).

---

# Module 2 — Remaining Changes ✅ COMPLETE

All planned work is shipped. Only the interactive fretboard remains parked on a branch (see below).

**Done:**
- Chunk 1 — "You've got it when..." descriptors
- Chunk 2 Part A — Web Audio `playNote()` (shipped via the TAB work, not the archived branch)
- Chunk 2 Part C — "Play all" buttons on Module 2 Set 1 note-name drills (both stations, E + A strings)
- Chunk 3 — Inline TAB display (Module 2 Set 2 Computer + Practice stations, with clickable 🔊 note names)
- Module-2 form/function applied to Modules 1, 3, 4, 5
- Modules 6–8 YouTube URLs verified (spot-checked 8 across all three files via oEmbed; all valid and matched intended songs)

**Still pending:** nothing.

---

## Module-2 form/function applied across all modules — DONE

Brought modules 1, 3, 4, 5 in line with Module 2's structure:

- `gotItWhen:` descriptors on every skill (~65 skills total across the 4 modules).
- Module 1 Set 2: `playSeq` on the E-string note drill (open E · F · G · A), inline `tab:` for the Seven Nation Army riff.
- Module 4 Set 1: `playSeq` for A minor pentatonic Pattern 1 ascending, inline `tab:` showing the full Pattern 1 across all 6 strings.
- Module 4 Set 2: D-string note drill split into D-string + G-string steps, each with its own `playSeq`.
- Modules 3 & 5: descriptors only — chord-based content, no single-note drills to wire up.

---

## Chunk 2 — Audio utility + Interactive Fretboard Diagram

### Part A: Web Audio note player — DONE

Shipped as part of the Chunk 3 TAB work. `playNote(midi)` lives in `index.html` (~line 1758). The `feature/interactive-fretboard` branch is no longer needed for this.

### Part B: Interactive Fretboard Diagram (Module 2, Set 1) — ARCHIVED

**Status:** Built but parked. Lives on the `feature/interactive-fretboard` branch (commit `aeed5c0`). Not merged into main. Decided we don't need it right now; revisit if a real classroom need shows up.

To resurrect: ask Claude to "bring back the interactive fretboard branch" and it'll merge or cherry-pick the work.

Original spec (for reference if rebuilding):

- Add an interactive fretboard rendered inside Module 2 Set 1's computer station.
- Show low E string (bottom row) and A string (top row), **frets 0–12** (extended from the spec's 0–8 to match the rest of Module 2).
- Each natural-note position is a clickable button — click highlights the note and plays the corresponding tone.
- "Quiz me" mode: hides labels, highlights a random fret dot, asks student to identify the note. Simple correct/incorrect feedback.
- Trigger from a new property like `fretboardDiagram: true` on the Set 1 station step in `module-2.js`. Rendered inline by `buildStations()` in `index.html`.
- Use existing CSS variables (`var(--bg2)`, `var(--border)`, `var(--blue-text)`, `var(--text)`).
- Responsive on narrow mobile viewports.

### Part C: 🔊 buttons in Set 1 station text — DONE

Shipped as "Play all" buttons on the four note-name drills in Module 2 Set 1 (Computer + Practice stations, E + A strings). Uses a new `playSeq: { label, bpm, notes }` step property + `playSequence()` helper in `index.html`.

---

## Chunk 3 — Inline TAB Display — DONE

Shipped. Lives in `module-2.js` (Set 2 stations b + c) with the `buildTab()` helper in `index.html`. Clickable note names play via `playNote()`.

---

## Module 6 — Upgrade to Advanced Strumming

Module 6 currently covers basic strumming, but it's placed late in the semester — students are ready for more by then. Goal is to replace or supplement the basic strumming content with more advanced strumming techniques (patterns, dynamics, muting, syncopation, etc.). Exact scope TBD.

---

## General notes (apply to all remaining chunks)

- Backward-compatible — no other modules should change.
- Vanilla JS, no frameworks, no hardcoded colors (use CSS variables).
- Test in Live Server on both desktop and narrow mobile widths before pushing.
- Files that will change: `index.html`, `module-2.js`. Optionally a new `audio-utils.js` if we split out the audio code.
