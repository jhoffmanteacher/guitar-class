# REVIEW-PLAN.md — Site Review & Execution Plan

**Date:** 2026-07-13
**Produced by:** multi-agent review (4 dimension reviewers + 7 link-check crews + 4 adversarial verifiers, all findings below marked CONFIRMED were re-checked against the code by an independent skeptic agent).
**For:** a later opusplan session executing with ultracode (multi-agent orchestration). See "Orchestration notes" at the end.

**Ground rules for the executing session (from CLAUDE.md):**
- Run `node tools/checks.mjs` before any push (validates module data, bumps SW `CACHE_VERSION`).
- If any task adds/removes a `skills:` entry in a `module-N.js`, bump that module's `skillCount` in `MODULE_MANIFEST` (config-main.js).
- Never write a YouTube ID from memory — WebSearch, then verify via oEmbed before writing.
- Push only when Jonathan says "push to GitHub". Add a `CHANGELOG.md` entry for student-facing changes in the same push.
- If a second session is active, work in a git worktree.

---

## Link-check results (complete sweep, 2026-07-13)

**251 unique external URLs checked across the entire site — 0 dead links.**

| Where | Unique URLs | Dead |
|---|---|---|
| module-1.js + module-2.js | 42 | 0 |
| module-3.js + module-4.js | 46 | 0 |
| module-5.js + module-6.js | 59 | 0 |
| module-7.js + module-8.js | 49 | 0 |
| module-9.js – module-12.js | 55 | 0 |
| index.html, app.js, config-main.js, teacher.js, tuner.js | 0 content URLs (URL-builders only) | 0 |
| tabs/*.html (6 journey pages) | 0 external content URLs | 0 |

Every content link on the site is YouTube (no Google Docs links remain); all verified alive via the oEmbed endpoint. **No link-repair work is needed.** Minor label note: the "Am jam track" link (`Vq8cApzOdy8`, used in modules 4–6) actually resolves to "Slow Minor Blues 80 BPM A Minor Pentatonic" — alive and topically fine, no action required.

---

## CODE dimension

### P0

#### K-1 — REQUIRED: Retest Melody Coach end-to-end on the LIVE site
- **What:** Re-verify that the Listening Coach's **Melody mode** live pitch/melody detection works correctly end to end with a real guitar. Chord-check mode was verified on a real guitar 2026-07-12; melody mode was NOT. Melody mode uses a stricter clarity gate (0.22 vs the chord path's 0.55, `coach.js:515`) and a distinct verdict path (`coach.js:666-669`: matching note → `ok`, same pitch-class in a different octave → `oct`, anything else → `wrong`). If the single-note consensus is noisy on a laptop mic, students could be seeing false "wrong" verdicts **right now** — which is why this is P0. (CONFIRMED: code structure matches; runtime behavior is the open question.)
- **Files:** `coach.js` (COACH_PITCH_GATE, the 0.22 clarity constant, `coachFinalizeEvent` consensus, verdict logic ~665–669). Only touch constants if the retest reveals a systematic error.
- **Why:** Highest-risk unverified path in the audio code; it grades students in real time.
- **How to test:** Must be done on the **LIVE site, not localhost** — the PWA service worker caches the shell, so first confirm the deployed `CACHE_VERSION` is current and hard-refresh (or wait for the controllerchange reload) so the test runs against the latest `coach.js`. Play a melody exercise (single-note TAB) into the mic: correct notes must score `ok`, clean octave errors `oct`, wrong notes `wrong`, with no spurious verdicts. Note from project history: the chord-mode fix that worked was the YIN clarity gate, not onset/verdict knobs — start there if tuning is needed.
- **Human-in-the-loop:** an agent can prep the exercise list and watch the console, but **Jonathan must play the guitar** — schedule this as a paired step, not a pure-agent task.
- **Done when:** a melody exercise played on a real guitar into the live (PWA-cached) site produces per-note verdicts that match reality, receiving the same sign-off the chord path got on 2026-07-12.
- **Related (same session, if time allows):** Note Hunt and Change Up real-guitar retests are also still open per project history — same live-site procedure.

### P1

#### K-2 — Cap the tuner's YIN search (CONFIRMED) — ✅ Code done 2026-07-20; pending the real-guitar six-string check (pair with K-1's live session)
- **What:** `detectPitchYIN` (`tuner.js:99–129`) scans tau over half of an 8192-sample buffer → ~16.7M multiply-adds per call, ~16 fps, gated only by RMS 0.002 — heavy on the school Chromebooks this site targets. `coach.js:568` already caps its YIN at `maxTau = ceil(sampleRate/60)`; the tuner doesn't.
- **Files:** `tuner.js:99–129, 186`.
- **Why:** Can peg a core, lag the needle, and drain battery while the tuner is open; ~5× cheaper with no accuracy loss above ~60 Hz (low E is ~82 Hz).
- **Done when:** the tau loop bound derives from `sampleRate/60`, and the tuner still locks all six strings on a real guitar (needs an on-device check — pair with K-1's live session).

#### K-3 — Auto-retry failed progress saves (CONFIRMED) — ✅ Done 2026-07-20
- **What:** `flushSave` (`app.js:359–377`) re-marks keys dirty on error but never reschedules a flush; there is no backoff timer and no `pagehide`/`visibilitychange`/`beforeunload` save hook (the hooks at `app.js:1537–1538` only remember scroll). A network blip on the session's last action silently loses that progress.
- **Files:** `app.js` (flushSave catch path; add a pagehide flush).
- **Why:** Firestore is the source of truth for cross-device progress; "Save failed" with no retry is a real reliability gap for students on flaky school Wi-Fi.
- **Done when:** a simulated one-off write failure is followed by an automatic successful retry with no further user interaction, and a flush fires on `pagehide`.

### P2

#### K-4 — De-duplicate Firebase bootstrap + SDK version (8 copies) — ✅ Done 2026-07-20 (lower-risk half: `checks.mjs` now asserts the SDK version string matches across all 8 files; the six pages' auth/save JS was left untouched to avoid destabilizing the just-redesigned pages)
- **What:** Each of the six `tabs/*.html` re-implements `loadFirestoreSdk` / auth / debounced-save inline (~90 lines each), and the Firestore SDK version string `10.12.2` is hardcoded independently in app.js, sw.js, index.html, and all six tab pages. At minimum, add a `checks.mjs` assertion that the version string matches everywhere.
- **Files:** `tabs/*.html` (~lines 285–313 each), `app.js:60–71`, `sw.js`, `index.html`, `tools/checks.mjs`.
- **Done when:** the SDK version and save-debounce logic exist in exactly one place, or `checks.mjs` fails the push when they diverge.

#### K-5 — Stop per-frame typed-array allocation in the tuner — ✅ Code done 2026-07-20 (bundled with K-2; same pending device check)
- **What:** `tunerLoop` allocates fresh `Float32Array(8192)` + `Float32Array(4096)` every frame (`tuner.js:169, 179`); `coach.js` already reuses `coachFrameBuf` specifically to avoid this GC pressure. Allocate once in `startTuner`, reuse per frame.
- **Done when:** `tunerLoop` performs no per-frame typed-array allocation and the tuner still reads correctly. (Bundle with K-2 — same file, same test.)

#### K-6 — `toggleSkill` should select rows by data attribute, not regex-parse `onclick` strings — ✅ Done 2026-07-20
- **What:** `app.js:2525–2531` finds the row to update by regex-matching each cell's generated `onclick` text — fragile coupling and O(all skills) per toggle. Emit `data-sid` in `buildChecklist` and use `querySelector`.
- **Done when:** the toggled row updates via a `data-sid` selector with checkbox/aria state still correct.

#### K-7 — Fix or remove the dead `#games` deep-link helper — ✅ Done 2026-07-20 (wired into `showApp()`; also fixed a bug this introduced where it collided with the first-run welcome dialog — a `#games` deep link now takes priority instead of stacking two modals)
- **What:** `maybeShowApp_gamesHash` (`app.js:233–235`) is defined but never called; the `hashchange` listener (`coach.js:1267`) only fires on change, so loading the site with `#games` in the URL does NOT open the arcade. Wire it into `showApp()` or delete it.
- **Done when:** loading the site with `#games` opens the arcade, or the unused function is removed.

#### K-8 — Update stale "8 modules" references (comments + docs) — ✅ Done 2026-07-20
- **What:** The site now ships 12 modules (MODULE_MANIFEST and sw.js both list 12), but comments still describe the 8-module world: `config-main.js:5, 28, 131` ("modules-3-9.js", "Modules 2-8", "modules 2-8 only"), plus sw.js's header note — and **CLAUDE.md itself still says `module-1.js` through `module-8.js`** (it misled this very review's initial scoping). Confirm the `num!==1` Songs-section rule still matches intent for modules 9–12.
- **Files:** `config-main.js`, `sw.js`, `CLAUDE.md`.
- **Done when:** no comment or instruction doc states an 8-module range that contradicts the 12 modules shipped.

---

## CONTENT dimension

Overall: musically excellent. Every chord voicing, TAB fret/MIDI pair, transposition, pentatonic box, and theory claim spot-checked across all 12 modules was **correct**; all 12 `skillCount`s match; no placeholder/TODO text is student-visible; self-checks work solo. Findings are consistency/completeness, not errors.

### P1

#### C-1 — Unify "Module" vs "Unit" terminology (CONFIRMED) — ✅ Done 2026-07-20 (standardized on "Module" per Jonathan's call)
- **What:** The app says "Module 1–12" everywhere, but all six journey pages label layers "Unit 1"–"Unit 5" (~37 occurrences), badges say "appears in all 5 units", `tabs/sweet-child-o-mine.html:67` mixes both in one sentence ("grows through Units 2–5, with a Module 7 finale"), `tabs/luna.html:185` says "Module 7 upgrades the little F", and stray "Unit(s)" refs sit in module bodies (`module-8.js:568`, `module-6.js:213`, `module-7.js:148`, `module-4.js:122, 686`). Standardize on "Module" (or add a one-line "Unit N = Module N" note per page if "Unit" is kept deliberately).
- **Files:** all six `tabs/*.html`; `module-4.js`, `module-6.js`, `module-7.js`, `module-8.js`.
- **Why:** A middle-schooler navigating from "Module 5" to a page headed "Unit 5" can't tell if they're the same thing.
- **Done when:** one consistent term (or an explicit equivalence note) appears across tabs and module bodies, with no sentence mixing both for the same section.

### P2

#### C-2 — Module 8 fingerstyle links promise an arrangement the journey pages don't have (CONFIRMED) — ✅ Done 2026-07-20 (added the p-i-m-a-m-i Layer 6 to Let It Be and "the cure")
- **What:** `module-8.js:427, 568, 635, 638` link Let It Be / "the cure" journeys as "the fingerstyle/fingerpicked arrangement", but both pages end at Layer 5 (strumming) — only Luna has a bonus Layer 6. Either add an optional fingerpicking bonus layer (mirroring Luna's Layer 6, using the p-i-m-a-m-i pattern Module 8 teaches) to both pages, or soften the link labels.
- **Files:** `module-8.js`, `tabs/let-it-be.html`, `tabs/the-cure.html`.
- **Done when:** the links land on a page containing a fingerpicked arrangement, or no longer advertise one.

#### C-3 — Journey footers claim "60 BPM throughout" where the body ramps higher — ✅ Done 2026-07-20
- **What:** Luna's layers target "60, then 70, then 80" (`tabs/luna.html:76, 223`) and "the cure" Layer 5 says "60, then 65, then 70" (`tabs/the-cure.html:185, 198`), contradicting the shared footer. Change those two footers (e.g. "tempo targets build across layers") or drop the fixed-BPM claim.
- **Done when:** no journey footer states a fixed tempo its own layers exceed.

#### C-4 — "Core" tag is reused for module-required songs that aren't thread songs — ✅ Done 2026-07-20 (retagged as "Focus" per Jonathan's call)
- **What:** Modules 6–8 tag module-only required songs (Brown Eyed Girl, Wonderwall, etc. — `module-6.js:686–697`, `module-7.js:675–684`) as `type:'Core'`, blurring the settled "core = the six thread songs" concept. Retag as `Focus`/`Required`, or record that the dual meaning is intentional.
- **Done when:** a student can tell the six thread songs apart from module-required songs by badge/type, or the overlap is documented as intentional.

#### C-5 — Module 5 Set 3: give Bm a dedicated clean-fret drill — ✅ Done 2026-07-20
- **What:** D gets a "Clean D" drill but Bm — flagged in the module's own text as the trickiest chord in the group, and the student's first partial barre — has no isolated practice step before it's assessed (`module-5.js:588, 606, 694`). Add a "Clean Bm" challenge (xx4432) with a "You've got it when" check, mirroring Clean D.
- **Note:** if this adds a `skills:` entry (rather than just a step), bump Module 5's `skillCount` in `MODULE_MANIFEST`.
- **Done when:** Set 3's practice station includes a standalone Bm fret-it-clean drill before the assessment.

#### C-6 — Sweet Child journey Layer-1 labeling inconsistency — ✅ Done 2026-07-20
- **What:** `tabs/sweet-child-o-mine.html:67, 80` labels Layer 1 "Anytime" and the badge "grows through Units 2–5", while the other five pages label Layer 1 "Unit 1". Align with whatever convention C-1 lands on.
- **Done when:** Sweet Child's Layer 1 label and badge follow the same convention as the other five pages.

#### C-7 — Remove the leftover editorial note in Module 12 (and confirm the flagged video's fit)
- **What:** `module-12.js:430` embeds an HTML comment: "Session D filled this former video placeholder … Jonathan: review for fit." — a leftover TODO flagging that the La Derrota requinto video still needs a fit check for the sierreño/corridos-tumbados requinto skill. Not student-visible, but it's an unresolved flag in shipped content.
- **Human-in-the-loop:** Jonathan (or an agent watching the video) should confirm fit; if swapping, follow the search-and-verify + diverse-creators rules.
- **Done when:** the video is confirmed or replaced (oEmbed-verified) and the HTML comment is deleted.

#### C-8 — Two Station B pairs use the same instructor twice (optional) — ✅ Done 2026-07-20 (module-9.js Set 4 swapped to Lauren Bateman, oEmbed-verified; module-11.js Set 3 left as JustinGuitar+JustinGuitar — no comparable-quality alternative found, a defensible outcome per the review)
- **What:** Module 9 Set 4's TAB pair (`module-9.js:557, 566`) and Module 11 Set 3's barre pair (`module-11.js:414, 423`) are both JustinGuitar + JustinGuitar. House rule prefers two voices; same-channel is allowed when alternatives are worse — these are defensible, so this is optional. If swapping, prefer a comparable-quality lesson from a woman / creator of color / bilingual channel, verified via oEmbed.
- **Done when:** each pair has two instructors, or a note records that same-channel was a deliberate quality call.

---

## DESIGN dimension

Overall: the main app is genuinely polished — keyboard support, focus-visible outlines, reduced-motion handling, dark mode, print styles, mobile drawer nav. The gap is the six `tabs/` journey pages, which are a visually divergent mini-site, plus missing heading semantics in generated content.

### P1

#### D-1 — Bring the journey pages onto the app's theme, including dark mode (CONFIRMED) — ✅ Done 2026-07-20 (shared `tabs/journey-theme.css`)
- **What:** All six `tabs/*.html` define their own cool-blue palette (`--l2:#2f7fbf`, `--text:#1c2230`, `system-ui` font, ~line 14–22) and have **zero** `prefers-color-scheme: dark` support, while the app is plum-branded (`--brand:#514a7d`), Fraunces-headed, with 7 dark-mode blocks in `styles.css`. A dark-mode student tapping a Song-thread link gets thrown onto a blinding white, off-brand page. Extract shared tokens into a small stylesheet both include (or paste the dark block + plum/ivory palette into each page).
- **Files:** all six `tabs/*.html`, `styles.css` (source of tokens).
- **Done when:** each journey page renders with the app's plum/Fraunces theme and responds to `prefers-color-scheme: dark` with a dark surface.

#### D-2 — Fix WCAG AA contrast failures on journey helper text (CONFIRMED) — ✅ Done 2026-07-20 (inherited from D-1's app-token swap; verified 5.7–6.0:1)
- **What:** `--text3:#98a0ad` on white ≈ **2.6:1** (AA small-text minimum is 4.5:1), used at 12px on `.song-kicker`, `.rate-key`, and `#save-msg` (e.g. `tabs/let-it-be.html:17, 26, 28, 55`; same pattern all six pages). Verifier correction: `.layer-unit` uses `--text2:#5b6472` (~4.9:1) and already passes. Darken `--text3` to ~`#5b6472` or the app's `#63635d`.
- **Done when:** every text color on the white journey background measures ≥ 4.5:1 (or 3:1 for ≥18.66px bold).

#### D-3 — Add real headings to generated practice content (CONFIRMED) — ✅ Done 2026-07-20
- **What:** `app.js` emits **zero** `<h2>/<h3>` — set titles are `<div class=obj-main>` (`app.js:1623, 1633, 2159`), station/panel/Daily-5 titles are `<div>`s (`app.js:1837, 2081`). The only real headings live outside `<main id=main-content>`. Screen-reader users can't navigate the practice area by heading. Render set titles as `<h2>` and station/section/checklist titles as `<h3>`, keeping the same classes so nothing changes visually.
- **Files:** `app.js` (render functions), `index.html:172` area.
- **Done when:** a screen reader's heading list shows each set as an h2 with its stations as nested h3s, in source order.

### P2

#### D-4 — Journey "Rate this layer" buttons: group semantics + touch size — ✅ Done 2026-07-20
- **What:** The 1/2/3 rating is three plain `<button>`s whose selected state is only a visual `.on` class (~24px tall, `tabs/let-it-be.html:53, 87`). Add `role=radiogroup` + `role=radio`/`aria-checked` toggled in `rate()`, and grow to ~44px touch targets. All six pages.
- **Done when:** the selected rating is announced by a screen reader and each button is ≥ ~44px tall at phone width.

#### D-5 — Add the Spanish-translate affordance to journey pages — ✅ Done 2026-07-20
- **What:** The app has a Google Translate widget + "Español" toggle; the journey pages have neither, so Spanish-reading students lose language support mid-flow. Add the same init + toggle to all six pages.
- **Done when:** a journey page can be switched to Spanish the same way the main app can.

#### D-6 — Welcome onboarding dialog focus management — ✅ Done 2026-07-20
- **What:** The "Start here" overlay (`index.html:103`, `app.js:242`) is `role=dialog aria-modal=true` but never receives focus and has no focus trap — keyboard users can Tab into the blocked content behind it. Move focus in on open, trap Tab, restore on close.
- **Done when:** with the welcome card open, focus starts inside it and cannot reach the background until dismissed.

#### D-7 — Tuner string-selector touch targets — ✅ Done 2026-07-20
- **What:** Seven `.ts-btn` buttons in one row inside a fixed 240px popup (`styles.css:563, 577`; `index.html:234`) ≈ 30×34px each — small for a phone tool used every session. Raise to ~40–44px and/or wrap to two rows.
- **Done when:** on a ~360px viewport each string button is ≥ ~40px in its smaller dimension (verify in a real mobile browser — pair with K-1's live session).

#### D-8 — Locked set pills drop below readable contrast — ✅ Done 2026-07-20
- **What:** `.wpill.locked` applies `opacity:.5` to `--text2` text (`styles.css:88, 91`) → effective ≈ 2.3:1, yet the pill stays interactive (tap shows a hint toast). Dim with a specific muted-but-readable color instead of whole-pill opacity.
- **Done when:** a locked pill's label measures ≥ 4.5:1 while still reading as de-emphasized.

---

## IMPROVEMENTS dimension

Theme (verified against the code): the app already **computes and even persists** rich practice data, then hides or discards it. Several high-impact features are mostly plumbing.

### P0 (high impact, low effort — all three CONFIRMED against the code)

#### I-1 — Show all-time game bests on the arcade cards — ✅ Done 2026-07-20
- **What:** Finish handlers already persist cross-session bests to Firestore (`games.cb` at `coach.js:2072`, `games.fz` :2331, `games.sh` :2758, `games.sr` :3623, `games.rn.songs` :4334), but `gamesRenderHub` (`coach.js:1319–1373`) renders only sessionStorage "best today" chips — so a returning student's real accomplishments look erased. Prefer the persisted value, fall back to session.
- **Done when:** a student who earned a best, closed the tab, and returned still sees that best on the game card without replaying.

#### I-2 — Persist practice-tempo (BPM) choices across sessions — ✅ Done 2026-07-20
- **What:** BPM sliders read/write **sessionStorage** (`app.js:2692, 2714`), so a student who slowed a hard riff to 50 BPM redoes it every visit. Switch the same key scheme to localStorage (per-device UI state; keep the try/catch for private mode).
- **Done when:** a BPM chosen on a tab/step is still selected after closing and reopening the browser.

#### I-3 — Spanish voice for read-aloud when the page is translated — ❌ Obsolete 2026-07-20
- **Resolution:** The read-aloud feature was removed from the site entirely (browser voices judged too unnatural to be helpful). Students who need text-to-speech use Google Read&Write or their device's built-in reader instead, which handles the Español-translated page in Spanish automatically. No site work remains on this item.

### P1 (high impact, real effort)

#### I-4 — Persist Change Up and Note Hunt results (currently saved nowhere) — ✅ Done 2026-07-20 (`games.cc = {bestBpm, progression, at}`, `games.fret = {best, level, at}`; both surfaced on the hub via I-1)
- **What:** Change Up's best BPM and Note Hunt's rounds live only in sessionStorage (`coach.js:1801`; Note Hunt persists nothing) while the other six games save to Firestore. Mirror the existing pattern: `games.cc = {bestBpm, progression, at}` and `games.fret = {best, at}`, guarded by `currentUser && !isDevBypassUser()`; surface on the hub (ties into I-1).
- **Done when:** completed rounds of both games write to the games doc and reappear after sign-out/sign-in.

#### I-5 — Global practice streak + "Done today" on the Daily 5 — ✅ Done 2026-07-20
- **What:** Reuse the consecutive-day logic already in `rrSetDone` (`coach.js:3315`) for a site-wide streak stored in the progress doc, updated on Daily-5 completion or any skill check; show a small streak chip near the module header (`app.js:2054` buildDaily5).
- **Done when:** consecutive practice days increment a visible streak that persists across sign-in and resets after a missed day.

#### I-6 — "Keep practicing" review list from 'still working on it' marks — ✅ Done 2026-07-20
- **What:** The progress map already records every skill marked "working" across all 12 modules; nothing surfaces them. Add a read-only panel (reuse the Find-panel styling, `app.js:3238`) grouping "working" skills by module with jump links.
- **Done when:** the list shows every "working" skill with a working jump link to its set.

#### I-7 — Teacher "trouble spots" view — ✅ Done 2026-07-20
- **What:** Over the already-loaded `allStudents` (`teacher.js:49, 83, 115`), compute per-skill %-got-it class-wide and list the least-mastered skills, plus per-module completion bars. No extra Firestore reads.
- **Done when:** a new teacher tab ranks the class's least-mastered skills from existing data with no additional query.

#### I-8 — Student "My progress" all-modules overview — ✅ Done 2026-07-20
- **What:** Call the existing `moduleCompletion` (`app.js:1264`) for every MODULE_MANIFEST entry and render a 12-module progress ladder + total-skills-mastered count.
- **Done when:** one view shows done/total for all 12 modules matching the dropdown counts.

#### I-9 — Persist a compact Listening Coach result per drill — ✅ Done 2026-07-20
- **What:** The Coach computes a five-criterion report every attempt (`coach.js:705, 771–946`) and discards it. Save a small per-drill record (last levels, attempt count, date) to the progress doc; show "last time vs this time"; let the teacher view see who's used the mic.
- **Done when:** finishing a Coach check writes a compact result and a returning student sees their previous result for that drill.

### P2 (worthwhile, speculative or polish)

- **I-10 — PR-BPM history:** append `{value, date}` (capped ~8) for `isPR` response slots instead of overwriting (`teacher.js:202`, `app.js:327`); render a tiny trend. *Done when successive PR entries preserve and display earlier ones.* — ✅ Done 2026-07-20
- **I-11 — Metronome downbeat accent + count-in:** time-signature selector (2/4, 3/4, 4/4) accenting beat 1, optional one-bar count-in (`app.js:2752, 2756`; `index.html:189`). *Done when beat 1 is audibly accented for a chosen meter.* — ✅ Done 2026-07-20
- **I-12 — Offline banner:** on window `offline`, show a dismissable "You're offline — practice pages still work; videos and saving resume when you reconnect" banner reusing the safety-net styling (`app.js:7–37`; `sw.js:78`). *Done when going offline shows it and reconnecting clears it.* — ✅ Done 2026-07-20
- **I-13 — "What can I play?" chord search:** index songs by chord set in `buildSearchIndex` (`app.js:3216, 3256`) so "G C D" returns songs playable with those shapes. *Done when a chord-set query returns matching songs.* — ✅ Done 2026-07-20 (an adversarial review pass caught and fixed a dedup bug where duplicate song names across modules discarded the chord-bearing occurrence — all six core/thread songs are now correctly indexed)

---

## Orchestration notes (for the opusplan + ultracode run)

### Sequencing constraints

1. **K-1 (Melody Coach retest) needs Jonathan with a guitar on the live site.** Nothing blocks on it, but if it fails, the fix lands in `coach.js` — so schedule the retest EARLY and keep a coach.js-tuning slot open afterward. Bundle the on-device checks from K-2 (tuner still locks strings) and D-7 (phone touch targets) into the same live session to save setup.
2. **C-1 before C-6 and alongside D-1/D-2/D-4/D-5:** the terminology decision (Module vs Unit) rewrites text on all six tabs pages; do it in the same lane as the tabs restyling so the pages are only reworked once.
3. **I-1 before/with I-4:** the hub-rendering change should read the persisted values I-4 starts writing — same `coach.js` area, same agent.
4. **Everything else is independent** and can run in parallel *subject to the file-conflict rule below*.

### File-conflict lanes (agents editing the same file must be one agent or sequential; use worktrees if truly parallel)

| Lane | Items | Files |
|---|---|---|
| **tabs/** | D-1, D-2, D-4, D-5, C-1 (tabs half), C-3, C-6, C-2 (if adding Layer 6) | all six `tabs/*.html` |
| **app.js** | D-3, D-6, K-3, K-6, K-7 (app half), I-2, I-3, I-6, I-8 | `app.js`, `index.html` |
| **coach.js** | I-1, I-4, I-9, K-7 (coach half), any K-1 fallout | `coach.js` |
| **tuner.js** | K-2, K-5 | `tuner.js` |
| **modules/content** | C-1 (module half), C-4, C-5, C-7, C-8, C-2 (module-8 labels) | `module-4/5/6/7/8/9/11/12.js` — one file per agent is safely parallel |
| **config/docs/checks** | K-8, K-4 (checks.mjs assertion) | `config-main.js`, `sw.js`, `CLAUDE.md`, `tools/checks.mjs` |
| **teacher.js** | I-7, I-10 | `teacher.js` |

The five lanes plus per-module content agents can all run **in parallel** (each lane sequential internally). K-4's dedup half touches tabs + app.js + index.html + sw.js — run it **last**, after the tabs and app.js lanes settle, or it will conflict with both.

### Recommended phases

- **Phase 0 (human):** K-1 live-site retest session (+ K-2/D-7 device checks, and Note Hunt / Change Up retests if time allows). Also two small decisions for Jonathan (AskUserQuestion): C-1 Module-vs-Unit, C-4 what "Core" should mean, C-7 requinto-video fit.
- **Phase 1 (parallel fan-out):** all lanes above except K-4-dedup. P0s and P1s first within each lane; P2s only after the lane's higher items pass review.
- **Phase 2 (sequential):** K-4 dedup/assertion pass across the now-stable files.
- **Phase 3 (verify):** per-lane adversarial review agents (or `/code-review`), then a Live Server smoke test of: sign-in flow, one module render, tuner, one game, one Coach drill, one journey page in light + dark.
- **Phase 4 (gate):** run `node tools/checks.mjs` (link check + SW cache bump), fix anything flagged, update `CHANGELOG.md` for the student-facing changes (I-1..I-3, D-1..D-3 at minimum), then **wait for Jonathan's "push to GitHub."**

### Standing cautions for the executing agents

- Any video swap (C-7, C-8): WebSearch → oEmbed-verify → prefer diverse creators. Never write an ID from memory.
- Any new `skills:` entry (possible in C-5): bump `skillCount` in `MODULE_MANIFEST` or `checks.mjs` will fail the push.
- Retests happen on the **live site** — remember the PWA cache; confirm `CACHE_VERSION` is current first.
- Shell-dependent steps (running `checks.mjs`, git operations, Live Server) were **not** run during this review per its constraints — they are follow-ups for the executing session.
- If two Claude sessions are active, isolate in a git worktree before editing (see WORKFLOW.md convention).
