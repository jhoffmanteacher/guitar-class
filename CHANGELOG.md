# Changelog

Notable changes to the Guitar Class site. Newest first.

For the full session-by-session history (and the reasoning behind each change),
see `WORKFLOW.md` and the git commit log.

## 2026-06-15 — No more time limits on activities

### Changed
- **All modules:** the little "⏱ X min" time tags on every step are gone. They
  read like time limits, and the class is meant to be self-paced — everyone
  moves through the activities at their own speed. (The optional Timer tool is
  still there for "beat your record" practice drills if you want it.)

## 2026-06-15 — Clearer challenge labels

### Changed
- **All modules:** every practice challenge's success line is now labeled
  **"You've got it when:"** instead of **"Win:"** — clearer about what it means
  (how you know you've nailed it) and friendlier in tone.

### Fixed
- A couple more spots where a sentence-leading "A" (like "A note still buzzes…")
  could pop up an A-chord diagram by mistake — reworded so they read as plain
  English.

## 2026-06-15 — Easier-to-read instructions

A readability pass across the whole site to make directions clearer.

### Changed
- **All modules:** long, complex sentences in the instructions and hints were
  broken into shorter, more direct ones. Same friendly tone and the same
  information — just easier to follow at a glance.
- **Modules 1 & 4:** the two listening clips are now labeled **Clip 1** and
  **Clip 2** (instead of "Clip A" / "Clip B"), so the labels can't be mistaken
  for chord names.

### Fixed
- A grammatical "A" at the start of a sentence (like "A guitar that falls…") no
  longer pops up an A-chord diagram by mistake. Real chord references (A, A
  major, etc.) still link as before.

## 2026-06-14 — Modules 1–3 proofread fixes

A pass over the first three modules caught a couple of things that could trip you up.

### Fixed
- **Module 2:** the "Play A string" listen button was sounding a wrong note (a
  B-flat where it should have been a B). It now plays the correct pitch, so the
  notes you hear match the notes you're learning.
- **Module 3:** the F5 power-chord diagram was drawn in the wrong spot on the
  neck — it now shows in the right position.

### Changed
- **Module 3:** the Watchtower loop chord is now labeled **A5** instead of
  "Am5." A power chord has no major or minor — it's just A5 — with a quick note
  that the original song's chord is Am. The "Smells Like Teen Spirit" chord list
  was also corrected.
- **Module 1:** clearer wording — "a short melody on the E string" (the old
  phrasing called it an "open-string" melody even though it uses fretted notes).

## 2026-06-14 — Module 6 (Strumming) brought up to the course template

Module 6 now teaches with the same structure and supports as every other module.

### Added
- **Chord diagrams** at each chord's first use (Em/Am, G/D, C) on the computer
  stations, so students can see the shape, not just read its name.
- **Strum-pattern visuals** — a monospace down/up line aligned over the
  "1 + 2 + 3 + 4 +" count on the down-up, D-DU-UDU, folk, rock, and reggae
  challenges, so the rhythm is something you can *see*.
- **"Stuck?" and "Level up" tips** on every graded challenge, **time budgets**
  on each step, **Timer** references, and a **warm-up spiral** at the top of
  every set.
- **Personal-record ladders** (type your fastest clean BPM and beat it next
  class) and a **named assessment piece** per set — including a new
  "Two Feels, One Song" challenge that practices switching strum styles mid-song.
- A fuller **Module 6 review** (six "I can" lines, an assessment box, and a
  forward link into the barre-chord module).

### Changed
- Every lesson video now points at a specific timestamp range with a clear
  "job while you watch," instead of linking the whole video.

### Behind the scenes
- Finished the pre-launch checklist (live sign-in save test, printable handouts,
  accessibility) and tidied the repo so internal planning docs are no longer
  served on the public site.

## 2026-06-14 — Performance pass

A deep-dive optimization pass focused on first load on slow school Wi-Fi /
Chromebooks. No student-facing behavior changed — sign-in, progress saving, and
all content work exactly as before, just faster to load.

### Changed
- **Lazy-load module content.** The eight `module-N.js` data files are no longer
  loaded on every visit. Each is fetched on demand the first time its module is
  opened, and only that module's panels are built into the page (previously all
  modules were parsed and every set's panels were built up front on each load).
  The Module dropdown now populates from a lightweight manifest. The service
  worker still precaches every module, so offline use is unaffected.
- **Defer the Firestore SDK.** The ~100 KB Firestore library (two-thirds of the
  Firebase payload) is no longer loaded up front. It's fetched on demand the
  first time progress is read or written — i.e. only after sign-in — and
  pre-warmed during the Google sign-in popup. The sign-in screen now loads with
  only ~50 KB of Firebase instead of ~151 KB.
- **Consolidated progress saving.** Skill, last-place, response, and completion
  saves now batch into a single debounced Firestore write instead of up to three
  near-simultaneous writes, reducing write volume and simplifying the code.

### Evaluated, not adopted
- **Modular Firebase SDK swap.** Measured the actual CDN sizes: without a build
  step (which this project deliberately avoids), the modular SDK is ~23 KB
  *larger* than the current compat build. Skipped in favor of the Firestore
  defer above, which achieves the same goal at lower risk.
