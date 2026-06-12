# WORKFLOW.md — Guitar Class Master Plan

> **This file supersedes** `SITE_IMPROVEMENTS.md`, `STATION_CONTENT_DEEP_DIVE.md`, and
> `MODULE_2_TEMPLATE.md`. Once this is in the repo, move those three to `archive/` —
> everything actionable from them is consolidated here.
>
> **Context for Claude Code:** the course has NOT started yet. The strategy is:
> perfect Module 2 as the template → propagate its patterns to all other modules →
> site-wide code work → launch checks. All CLAUDE.md rules apply to every session
> (verify YouTube links via oEmbed before writing, never from memory; vanilla JS; CSS
> variables only; test locally before push; ask Jose multiple-choice questions for
> judgment calls).
>
> **How to use:** one session = one numbered item. At the start of a session Jose will
> say e.g. "do Session 2.1 in WORKFLOW.md." Before editing, present a plan; for any
> session that changes step text, show ONE complete example for voice approval before
> writing the rest. End every session: test locally with Jose, then push with a clear
> commit message, then check the box and add a one-line note under the item
> (e.g. "✅ done 2026-06-15 — note: chose simplified F").

**Status legend:** [ ] not started · [~] in progress · [x] done

---

## PHASE 1 — Finish Module 2 (the template)

### [x] Session 1.1 — Module 2 text upgrade
✅ done 2026-06-11 — # hint, quick-check spread (5/10 vs 8/2) + buzz-diagnosis MC, self-contained gotItWhen, partner solo fallback, per-activity time chips + Timer ref, Stuck?/Level up on all 5 challenges (new `stuck:`/`levelUp:` step props), assessment-piece naming on Set 1 Ch2, exit-ticket step on all 4 stations, module review expanded + forward link. New render: `time`/`stuck`/`levelUp`/`forward` fields in `app.js`, styled in `styles.css`.
Stuck?/Level up lines on every challenge · # (sharp) explainer hint where the Happy
Birthday TAB first appears (both stations) · quick-check hygiene (no verbatim repeats;
spread fret sampling across 2/8/10/12; computer vs practice stations sample different
frets) · exit-ticket reflection as final step of all 4 stations (`short` response,
"that's your first 2 minutes next class," wording varied) · name the assessment piece
in a Set 1 challenge like Set 2's Challenge 3 does · self-contained gotItWhen for
m2w1-s3 · solo fallback for the partner quiz · time budget line per station.
**Files:** `module-2.js` only.

### [x] Session 1.2 — Vampire TAB + PR ladders
✅ done 2026-06-11 — Verified "vampire" is F major, intro F–A7–B♭–B♭m; added a simplified intro bass riff on the low E string (F·A·A#·A#, frets 1·5·6·6) as a `tab:` step in Set 2 practice, so the Core song is now playable in-app. Added PR-ladder `short` responses ("fastest CLEAN lap, +10 at a time") to Low E Run, A String Run, and the Watchtower riff.
- Core songs must be playable in-app. "Vampire" (Set 2 Core) has no `tab:`. Find the
  simplified E-string intro riff, verify the tutorial source, and draft it as a `tab:`
  step (follow the Happy Birthday/Watchtower format) for Jose's review. If it can't be
  done well, ask Jose: add TAB / demote to Choice / swap the song.
- Add personal-record tempo ladders to Low E Run, A String Run, and the Watchtower
  riff: "Win at 60 BPM, then +10 at a time to find your fastest CLEAN lap. Type your
  max BPM below — that's the number to beat next class." (`short` response so it
  persists to Firestore and the teacher dashboard.)
**Files:** `module-2.js` only.

### [x] Session 1.3 — Random-recall drills + fretboard branch decision
✅ done 2026-06-11 — Content: added "Challenge 3 — Shuffle Run" to Set 1 practice (random fret order via shuffled scraps, name + play within 3s, win = 10 in a row; Stuck? = frets 0–7 first; Level up = A string / reverse 12→0). Branch decision: reviewed `origin/feature/interactive-fretboard` (tip `aeed5c0`) — it diverged **72 commits** ago and predates `app.js` (logic was still inline in `index.html`), so it's a real port, not a clean merge. **Decision: leave parked / defer resurrection** until after template propagation (Phase 3), where it would serve Modules 2/3/4/7 at once. Not merged this session — flag for Jose.
The gotItWhen for note names demands random access ("any fret, instantly, without
counting up from E") but the drills are sequential laps. Two parts:
- Content now: add a "Shuffle Run" challenge (random fret order, name + play within
  3 seconds, win = 10 in a row) plus reverse-lap / mid-string-entry Level up variants.
- Code decision: the parked `feature/interactive-fretboard` branch (commit `aeed5c0`)
  has a clickable E+A fretboard with a random-fret quiz mode — exactly this drill.
  Review the branch, report its state to Jose (rebase effort, what works), and ask:
  resurrect now / resurrect after propagation / leave parked. If resurrected, it later
  serves Modules 3 (power-chord roots), 4 (D/G strings), and 7 (barre roots).
**Files:** `module-2.js`; possibly merge of the feature branch.

### [x] Session 1.4 — Module 2 review + freeze the template
✅ done 2026-06-11 — Expanded `MODULE_REVIEWS[2]` to 10 "I can" lines covering all 11 Module 2 skills in gotItWhen language (added point-to-named-note, hovering fingers, thumb-behind-neck; read-TAB + play-melody stay combined); forward link to Module 3 was added in 1.1. Walked Appendix A: fixed the one "(full video)" label → (0:00–4:00) with an active during-watching job. **One documented exception:** Set 2 computer station keeps 3 short timestamped videos vs the ≤2 guideline — each anchors a distinct skill (finger independence / clean tone / TAB) and has a during-watching job, and the station is balanced by 3 hands-on TAB steps; flagged for Jose to cut one if it runs long in practice. Added the ★ TEMPLATE MODULE header comment to `module-2.js`. **Module 2 is frozen as the model.**
- Expand `MODULE_REVIEWS[2]`: "I can" lines for ALL Module 2 skills in gotItWhen
  language; end with a forward link ("the E & A notes you just learned become the
  ROOTS of every power chord in Module 3").
- Walk Module 2 against the Template Checklist (Appendix A below); fix any stragglers.
- When every box passes, Module 2 is FROZEN as the model. Add a comment at the top of
  `module-2.js`: "TEMPLATE MODULE — pattern source for all others; see WORKFLOW.md
  Appendix A."
**Files:** `module-2.js`.

---

## PHASE 2 — Pre-launch code fixes (can interleave with Phase 1; small sessions)

### [ ] Session 2.1 — 🔒 Hide "Dev bypass" in production  *(do before any student sees the site)*
The bypass button is visible on the live auth wall. Gate it to localhost only: hide
the button by default in `index.html` (give it an id, `display:none`), un-hide in
`app.js` only when `['localhost','127.0.0.1'].includes(location.hostname)`, and make
`devBypass()` itself refuse to run off-localhost. Test both environments.
**Files:** `index.html`, `app.js`.

### [ ] Session 2.2 — Fix the duplicate video link bug
`module-3.js` ("Power Chords for Beginners – Marty Music") and `module-5.js` ("F Chord
Simplified – Marty Music") link the SAME YouTube ID `dJfV7DsTThc` under different
labels — one is wrong. Verify what the video actually is via oEmbed, find + verify the
correct replacement for the mislabeled one, report before editing.
**Files:** one of `module-3.js` / `module-5.js`.

### [ ] Session 2.3 — Non-blocking Translate script + favicon + meta
- Make the Google Translate `<script>` in `<head>` non-blocking (`defer`, or move to
  end of `<body>`); change protocol-relative `//translate.google.com` to `https://`.
  Verify the Español toggle still works.
- Add a guitar-themed SVG favicon (inline data-URI is fine), a meta description
  ("Sequoia High School Beginning Guitar — independent practice and skills tracker."),
  basic `og:title`/`og:description`, and a more descriptive `<title>`
  ("Guitar Class · Sequoia HS").
**Files:** `index.html`.

### [ ] Session 2.4 — Escape user values + friendly error states + stale comments
- Wrap `user.displayName`, `user.email`, `user.photoURL` in the existing
  `escHtml`/`escAttr` helpers at all three render sites in `app.js`.
- Replace the `alert()` in `signIn()` with an inline message under the button
  ("Sign-in didn't work — allow pop-ups and use your @seq.org account, then retry").
- If `window.firebase` is undefined at boot, show "The sign-in service couldn't load
  on this network" instead of a silent broken page.
- Update the comment blocks in `index.html` that still reference the old
  `config.js` structure — point to `config-main.js`, `module-N.js`, `app.js`,
  `CLAUDE.md`.
**Files:** `app.js`, `index.html`.

---

## PHASE 3 — Propagate the template to all modules

> Each session: run the target module against **Appendix A**, applying Module 2's
> patterns. Standard scope per session unless noted — video diet (≤2 per computer
> station, timestamp ranges, a during-watching job, never "full video"); one
> interactive step per computer station (`tab:`/`chords:`/`playSeq`); Stuck?/Level up
> on every challenge; exit tickets on every station; time budgets; assessment piece
> named in a challenge; quick-check hygiene; solo fallbacks; PR ladder where a tempo
> skill exists; self-contained gotItWhens; module review expanded with a forward link.
> Always show one rewritten example for voice approval before doing the rest.

### [ ] Session 3.1 — Module 5 part 1: chord diagrams
Module 5 teaches ~12 chords with ZERO inline diagrams. Study `chordDiagramSVG` +
`CHORD_SHAPES` in `app.js` and the `chords:` usage in modules 3/7. Add a diagram at
each chord's first introduction per set (S1: Am, Em · S2: C, F, Am, G · S3: D, A, Em,
Bm · S4: E, B7, F#m, C#m). List any shapes missing from `CHORD_SHAPES`. Ask Jose
(multiple choice) about voicings: F simplified xx3211 vs barre (Set 2 text teaches
simplified — diagram must match); Bm/F#m/C#m simplified vs barre. Diagrams must match
what the step text teaches. No step-text changes this session.
**Files:** `module-5.js`, possibly `app.js` (shapes only).

### [ ] Session 3.2 — Module 5 part 2: full template pass
Standard scope (above). Module 5 specifics: heaviest video load in the course (9 watch
steps) — cut hardest here; add the one-minute-changes challenge (classic chord-change
speed test) as a PR drill with the score typed into a `short` response, recurring
across sets so students beat their own record; Set 4 "showcase preparation" gets an
explicit step revisiting the Module 1 goal ("re-read what you wrote; what changed?").
**Files:** `module-5.js`.

### [ ] Session 3.3 — Module 7 (barre chords — the morale module)
Standard scope. Specifics: barre is the frustration peak — Stuck? ladders matter most
here (partial barre → add strings one at a time → full barre) plus an honest fatigue
hint (shake out the hand, short sets); give the E-shape → A-shape "same shape, new
root" insight its own ear/quiz step instead of leaving it inside a video; video diet
(9 watch steps).
**Files:** `module-7.js`.

### [ ] Session 3.4 — Module 3 (power chords)
Standard scope. Specifics: computer station is the pure 3-videos formula — replace one
video with an interactive `tab:` of E5 → G5 → A5 with `playSeq`; muting gets its own
named challenge ("Win: strum all 6 strings but only the two power-chord notes ring");
`playSeq` for root movement.
**Files:** `module-3.js`.

### [ ] Session 3.5 — Module 6 (strumming — REDESIGN, not just a pass)  *(Jose-led)*
Jose decides scope first: upgrade to advanced strumming (syncopation/16ths, accents,
percussive muting), which songs anchor each set, whether basic strumming shifts
earlier. Then apply: keep Set 1's body-first ladder (tap → muted → one chord →
changes) and extend it upward as named challenges; add a strum-pattern visual — start
with the monospace pattern line (`D   D U   U D U` over `1 + 2 + 3 + 4 +`); if Jose
wants more, build a `strumPattern:` step property rendering a small SVG arrow diagram
(new code, CSS vars); add `chords:` diagrams for the chords used (Em, Am, …); update
objective/skillFocus/gotItWhen to the new scope; standard scope on top.
**Files:** `module-6.js`, possibly `app.js` (strumPattern renderer).

### [ ] Session 3.6 — Module 8 (fingerpicking)
Standard scope. Specifics: write the p-i-m-a arpeggio patterns over Am/C as clickable
`tab:` steps (they exist only in prose); insert an intermediate "pinch" challenge
(thumb + finger together) between basic arpeggio and Travis picking in Set 3.
**Files:** `module-8.js`.

### [ ] Session 3.7 — Module 4 (pentatonic/improv)
Standard scope. Specifics: structure the improv steps with constraints ("Rule of 3 —
improvise with only 3 notes of the pattern for 4 bars, then add one"); Set 3's
compose-a-solo gets a capture step (write your 4-bar solo as TAB numbers in a `short`
response so it reaches Firestore/dashboard).
**Files:** `module-4.js`.

### [ ] Session 3.8 — Module 1 (keep its warmth)
Light-touch standard scope. Specifics: add soft Win: lines (the only module with
none); confirm the Set 2 first-melody TAB renders with `playSeq`; add a 30-second
guitar-care/handling step (sets week-1 classroom norms); add a headphones/volume norm
line at the computer station (this is where students learn the routine).
**Files:** `module-1.js`.

### [ ] Session 3.9 — Cross-module features + consistency sweep
- Answer keys: add `answer:` + a one-line explanation to FACTUAL step MCs across all
  modules (reflection MCs stay unkeyed); wire the rendering in `app.js` (gentle ✓/✗ +
  explanation, matching the skills-practice quiz pattern). Jose marks which questions
  are factual; Claude Code proposes the list first.
- Distractor pass: flag giveaway distractors module by module; propose replacements
  encoding real misconceptions for Jose's approval.
- Song difficulty dots: add ● / ●● / ●●● to every Choice song (propose ratings, Jose
  adjusts) + a "🎤 Class request — suggest a song!" slot per module; small render
  tweak in `app.js`.
- Style the Stuck?/Level up lines distinctly (e.g. 🪜 / 🌶️ prefixes) — one CSS/render
  change, applies everywhere at once.
- Voice sweep: verb-first, hints ≤2 sentences, consistent "Challenge N — Name:" format.
**Files:** all `module-N.js`, `app.js`, `styles.css`.

---

## PHASE 4 — Pre-launch hardening (the week before students arrive)

### [ ] Session 4.1 — ♿ Accessibility pass
Convert the three `.fab` tool divs to `<button>` (adjust CSS so they render
identically) · `aria-label`s on all icon-only controls (✕ closes, 🔊 note buttons,
▶ play-sequence) · site-wide `:focus-visible` style (several rules currently kill
outlines: `.bpm-slider:focus{outline:none}` etc.) · darken `--text3:#aaaaa3` where
used on text (≈`#767670` reaches 4.5:1) or reserve it for decoration · Escape-to-close
on tool popups · full keyboard-only walkthrough as the test.
**Files:** `index.html`, `app.js`, `styles.css`.

### [ ] Session 4.2 — 🔗 Full dead-link audit
Extract every YouTube ID across all 8 module files (~222 unique). Verify each via
oEmbed in parallel batches. Report ✅/❌ with file+line. Replace dead ones via
search-and-verify; anything without a good replacement gets flagged for Jose to choose
a song. Re-run each semester.
**Files:** all `module-N.js`.

### [ ] Session 4.3 — Firebase hygiene (guided, mostly console work)
Verify Firestore rules in production match the documented rules (students read/write
own doc; teacher read via jhoffman@seq.org) · restrict the web API key to the
`jhoffmanteacher.github.io` referrer in Google Cloud console · App Check optional,
skip if it adds friction.
**Files:** none (console); Claude Code guides.

### [ ] Session 4.4 — UX polish grab-bag (optional)
Persist last-selected module/set per student · flash the timer display at zero (beeps
get lost in a loud room) · verify the resource-panel resize handle works by touch on
convertible Chromebooks.
**Files:** `app.js`, `styles.css`.

---

## PHASE 5 — Ongoing / recurring (Jose-led, Claude Code assists)

- [ ] Handout audit: open all 22 Google Doc `handoutUrl`s in incognito — confirm
      students won't hit a permission wall; check content still matches each set.
- [ ] Spanish spot-check: review 2–3 sets in Español mode with a fluent speaker; keep a
      list of bad translations (if short, a manual override dictionary becomes a small
      code task).
- [ ] End-of-semester set: design the Module 1 goal-revisit / final reflection /
      performance rubric (seeded by Session 3.2's showcase step).
- [ ] "Start here" onboarding blurb for new students (sign-in, how the tracker works,
      headphone norms).
- [ ] Song refresh each semester: swap in 2–3 student-requested songs (verify links
      per CLAUDE.md); pull from the 🎤 request slot.
- [ ] Reflection prompts: add 1–2 listening/reflection responses per set in Modules
      6–8 to match Module 1–2 richness (Jose writes prompts, Claude Code wires).

---

## APPENDIX A — Module Template Checklist (frozen after Session 1.4)

Run every module against this. ★ = patterns Module 2 modeled from the start.

**Computer station:** ≤2 videos, timestamped, with a during-watching job ★ · at least
one interactive step (`tab:`/`chords:`/`playSeq`/fretboard) · one ear/listening step
tied to a real song ★ · scaffolded skill version that the practice station fades ★ ·
quick-checks sample different content than the practice station · closes with the
exit-ticket reflection.

**Practice station:** opens with the warm-up spiral ★ · named, verb-first challenges
with Win: conditions ★ · Stuck? + Level up on every challenge · at least one drill
matching the recall direction of the gotItWhen (random access if the skill demands it)
· at least one PR ladder with a recorded score · one challenge named "(your assessment
piece)" ★ · partner steps have a solo fallback · time budget at top; timer referenced
in ≥1 challenge · closes with the exit-ticket reflection.

**Content quality:** every new chord/shape/pattern gets `chords:` or `tab:` at first
use · leaked future concepts get a one-line "just-enough" preview (the F# rule) · MC
distractors are real misconceptions; factual MCs keyed, reflection MCs not · no quiz
question repeated verbatim within a set · hints ≤2 sentences; *why* in the hint,
*what* in the step ★.

**Songs & skills:** Core songs playable in-app; Choice may be link-only · Choice songs
carry ●/●●/●●● difficulty dots · every gotItWhen self-contained, observable,
time-bound where possible ★ · no orphan skill ids.

**Module review:** "I can" lines cover every skill, in gotItWhen language · ends with
a forward link ("why this matters in Module N+1") · references the Module 1 goal where
natural.
