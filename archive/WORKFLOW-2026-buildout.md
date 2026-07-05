# WORKFLOW.md — Guitar Class Master Plan

> **This file supersedes** `SITE_IMPROVEMENTS.md`, `STATION_CONTENT_DEEP_DIVE.md`, and
> `MODULE_2_TEMPLATE.md`. Once this is in the repo, move those three to `archive/` —
> everything actionable from them is consolidated here.
>
> **Song lists:** whenever a session touches a module's song list, verify any new
> song links per CLAUDE.md (oEmbed) before writing them.
>
> **Context for Claude Code:** the course has NOT started yet. The strategy is:
> perfect Module 2 as the template → propagate its patterns to all other modules →
> site-wide code work → launch checks → feature builds. All CLAUDE.md rules apply to
> every session (verify YouTube links via oEmbed before writing, never from memory;
> vanilla JS; CSS variables only; test locally before push; ask Jonathan multiple-choice
> questions for judgment calls).
>
> **How to use:** one session = one numbered item. At the start of a session Jonathan will
> say e.g. "do Session 2.1 in WORKFLOW.md." Working rules for every session:
> 1. Before editing, present a plan.
> 2. **Before generating or overwriting any file, ask Jonathan at least one
>    multiple-choice question** about scope or approach (AskUserQuestion tool).
> 3. **For any big change** (new feature, redesign, anything touching 3+ files or
>    rewriting step text), show ONE complete example first — a rewritten step, a
>    mock-up, or a code sketch — and ask a multiple-choice question about it
>    ("on the right track?") before doing the rest.
> 4. New-chat prompts follow CLAUDE.md's topic-switch rule (suggest a fresh chat only
>    when the topic genuinely changes, not mid-feature).
> 5. End every session: test locally with Jonathan, then push with a clear commit message,
>    then check the box and add a one-line note under the item
>    (e.g. "✅ done 2026-06-15 — note: chose simplified F").

**Status legend:** [ ] not started · [~] in progress · [x] done

---

## 📍 WHAT'S LEFT — the live to-do list  *(updated 2026-06-14)*

This is the at-a-glance list; full detail is in the numbered sessions below.

**🔨 Build work (actual remaining coding):** — *none left.*
- *(3.5 Module 6 — ✅ done 2026-06-14; scope: template pass only, not a redesign.)*
- *(3.9 Cross-module sweep — ✅ done 2026-06-14.)*
- *(3.8 Module 1 — ✅ done 2026-06-14.)*
- **Phase 3 is now complete — every module has had its template pass.**

**✅ Built & signed off — no real-world sign-offs left:**
- **4.3** incognito save test — ✅ verified 2026-06-14 · **4.5** print one set — ✅ signed off
  2026-06-14 · **4.4** touch-resize — ✅ closed 2026-06-14 (N/A, non-touch Chromebooks) ·
  **4.6** offline reload — ✅ closed 2026-06-14 (manual test deferred, non-blocking).

**🔁 Deferred / recurring (Jonathan-led, by design never "done"):**
- **4.2** dead-link audit (re-run each semester) · Phase 5: handout audit · Spanish
  spot-check · end-of-semester set · song refresh · ⚠️ review Module 4 Set 1 video ·
  review 3.9 song difficulty dots · review 3.9 distractor swaps.

**Recent polish (not a numbered session):**
- **Perf: lazy-load modules** — ✅ done 2026-06-14 — module-`N`.js files are no longer
  loaded by `index.html`; each is fetched on demand the first time its module is opened
  and only that module's panels are built into the DOM (was: all 8 files parsed + all 16
  sets' DOM built + a full chord-link regex sweep on every load). Dropdown now populates
  from a new `MODULE_MANIFEST` in `config-main.js`. Teacher view still loads all modules
  (sequentially, to keep set order). SW still precaches every module for offline. Files:
  `index.html`, `config-main.js`, `app.js` (`loadModuleData`/`ensureModuleRendered`, async
  `onModuleChange`/`showTeacherApp`, `renderPanels` removed). Verified headless: cold load
  fetches 0 modules, lands on M1 fetching only `module-1.js`, M5/M7 load on demand,
  re-show doesn't refetch, teacher loads all 8 in order, zero console errors.
- **Module-review trim pass** — ✅ done 2026-06-14 — cut every module review to 5–6 core
  "I can" lines, added per-skill "↩ Review this" links back to the teaching set (new
  `set:` field on each review skill), and moved the Module Assessment into a standout
  `.mr-assess-box`. `app.js` (`buildModuleReview`, new `goToSet`), `styles.css`, all
  `module-*.js` reviews. See the **Module review** standard below for the pattern.

**⚡ Performance backlog (from the 2026-06-14 deep dive):**
- **Perf: defer the Firestore SDK** — ✅ done 2026-06-14 — `firebase-firestore-compat.js`
  (~100 KB gzip, two-thirds of the Firebase payload) is no longer loaded by `index.html`.
  It's fetched on demand by a new `ensureDb()` the first time we read/write progress (only
  after sign-in); `signIn()` pre-warms it during the Google popup. The sign-in screen now
  paints with only app+auth (~50 KB) instead of ~151 KB. Stayed on **compat** (no auth-API
  rewrite, no risk to the referrer-restricted key). Files: `index.html`, `app.js`, `sw.js`
  (v15→v16). Verified headless: Firestore absent at paint, `ensureDb` loads it on demand +
  dedupes, app renders without it, zero errors. *(⚠️ still worth a real Google sign-in test
  on the live site — automated OAuth can't be driven, but the auth flow itself was untouched.)*
- **~~Modular Firebase SDK~~ — evaluated & rejected 2026-06-14.** Measured gstatic gzip
  sizes: modular via CDN is *bigger* (app 22.5K vs 10K, auth ≈, firestore 111.6K vs 101K =
  ~174K vs ~151K). The modular "lighter" win needs a **bundler** to tree-shake, which this
  project deliberately doesn't have. Did the defer above instead. Don't revisit unless a
  build step is ever introduced.
- **Consolidate Firestore writers** — ✅ done 2026-06-14 — `saveProgress` /
  `saveResponses` / `saveCompleted` now route through one debounced writer
  (`queueSave` → `flushSave`, single `saveTimer`, a `_dirtyKeys` set). Categories
  (skills · place · responses · completed) are marked dirty and flushed together in
  ONE `.set(merge:true)`, with the payload built from live state at flush time (so it
  always sends current values; failures re-mark dirty for the next save). Was: 3
  independent 800ms timers that could fire near-simultaneous writes. `app.js` only.
  Verified headless: 3 rapid savers → 1 write carrying all categories, `merge:true`
  preserved, zero errors. Bumped CACHE_VERSION v16→v17.

**Done or dropped:** Phases 1–3 (except 3.5/3.9), 4.1, 5 onboarding + reflection
prompts, 6.2. Dropped: 6.1 looper, 6.3 Song Journey. *(The old `TODO.md` items —
tone-check removal, etc. — are all closed in `archive/TODO.archive.md`.)*

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
  step (follow the Happy Birthday/Watchtower format) for Jonathan's review. If it can't be
  done well, ask Jonathan: add TAB / demote to Choice / swap the song.
- Add personal-record tempo ladders to Low E Run, A String Run, and the Watchtower
  riff: "Win at 60 BPM, then +10 at a time to find your fastest CLEAN lap. Type your
  max BPM below — that's the number to beat next class." (`short` response so it
  persists to Firestore and the teacher dashboard.)
**Files:** `module-2.js` only.

### [x] Session 1.3 — Random-recall drills + fretboard branch decision
✅ done 2026-06-11 — Content: added "Challenge 3 — Shuffle Run" to Set 1 practice (random fret order via shuffled scraps, name + play within 3s, win = 10 in a row; Stuck? = frets 0–7 first; Level up = A string / reverse 12→0). Branch decision: reviewed `origin/feature/interactive-fretboard` (tip `aeed5c0`) — it diverged **72 commits** ago and predates `app.js` (logic was still inline in `index.html`), so it's a real port, not a clean merge. **Decision: leave parked / defer resurrection** until after template propagation (Phase 3), where it would serve Modules 2/3/4/7 at once. Not merged this session — flag for Jonathan.
The gotItWhen for note names demands random access ("any fret, instantly, without
counting up from E") but the drills are sequential laps. Two parts:
- Content now: add a "Shuffle Run" challenge (random fret order, name + play within
  3 seconds, win = 10 in a row) plus reverse-lap / mid-string-entry Level up variants.
- Code decision: the parked `feature/interactive-fretboard` branch (commit `aeed5c0`)
  has a clickable E+A fretboard with a random-fret quiz mode — exactly this drill.
  Review the branch, report its state to Jonathan (rebase effort, what works), and ask:
  resurrect now / resurrect after propagation / leave parked. If resurrected, it later
  serves Modules 3 (power-chord roots), 4 (D/G strings), and 7 (barre roots).
**Files:** `module-2.js`; possibly merge of the feature branch.

### [x] Session 1.4 — Module 2 review + freeze the template
✅ done 2026-06-11 — Expanded `MODULE_REVIEWS[2]` to 10 "I can" lines covering all 11 Module 2 skills in gotItWhen language (added point-to-named-note, hovering fingers, thumb-behind-neck; read-TAB + play-melody stay combined); forward link to Module 3 was added in 1.1. Walked Appendix A: fixed the one "(full video)" label → (0:00–4:00) with an active during-watching job. **One documented exception:** Set 2 computer station keeps 3 short timestamped videos vs the ≤2 guideline — each anchors a distinct skill (finger independence / clean tone / TAB) and has a during-watching job, and the station is balanced by 3 hands-on TAB steps; flagged for Jonathan to cut one if it runs long in practice. Added the ★ TEMPLATE MODULE header comment to `module-2.js`. **Module 2 is frozen as the model.**
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

### [x] Session 2.1 — 🔒 Hide "Dev bypass" in production  *(do before any student sees the site)*
✅ done 2026-06-11 — Button `id="dev-bypass-btn"` hidden by default (`display:none`) in `index.html`; `IS_LOCALHOST = ['localhost','127.0.0.1','[::1]']` un-hides it in `app.js`; `devBypass()` early-returns with a console warning off-localhost. Verified by inspection.
The bypass button is visible on the live auth wall. Gate it to localhost only: hide
the button by default in `index.html` (give it an id, `display:none`), un-hide in
`app.js` only when `['localhost','127.0.0.1'].includes(location.hostname)`, and make
`devBypass()` itself refuse to run off-localhost. Test both environments.
**Files:** `index.html`, `app.js`.

### [x] Session 2.2 — Fix the duplicate video link bug
✅ done 2026-06-11 — De-dup confirmed: `dJfV7DsTThc` no longer appears in module-3 or module-5 (module-3 now uses `DVveuwoVmmY`, verified = "Your Very First Guitar Power Chord Lesson – Marty Music", correct). The earlier fix had relocated `dJfV7DsTThc` into `module-4.js:38` mislabeled "Blues Scale Explained – Marty Music" — oEmbed showed it's actually "Lead Guitar Theory: Dorian Mode & Pentatonic Scale" (too advanced for Set 1). Replaced with `m_IiyJu60-c` = "Major Pentatonic Scale – Marty Music" (verified live, bridges into the following C-major-pentatonic step). **⚠️ Flagged for content review** — see Phase 5.
`module-3.js` ("Power Chords for Beginners – Marty Music") and `module-5.js` ("F Chord
Simplified – Marty Music") link the SAME YouTube ID `dJfV7DsTThc` under different
labels — one is wrong. Verify what the video actually is via oEmbed, find + verify the
correct replacement for the mislabeled one, report before editing.
**Files:** one of `module-3.js` / `module-5.js`.

### [x] Session 2.3 — Non-blocking Translate script + favicon + meta
✅ done 2026-06-11 — Translate `<script defer ... https://translate.google.com>` (non-blocking + https); inline SVG guitar favicon; meta description, `og:title`/`og:description`, and `<title>Guitar Class · Sequoia HS</title>` all present in `index.html`. Verified by inspection.
- Make the Google Translate `<script>` in `<head>` non-blocking (`defer`, or move to
  end of `<body>`); change protocol-relative `//translate.google.com` to `https://`.
  Verify the Español toggle still works.
- Add a guitar-themed SVG favicon (inline data-URI is fine), a meta description
  ("Sequoia High School Beginning Guitar — independent practice and skills tracker."),
  basic `og:title`/`og:description`, and a more descriptive `<title>`
  ("Guitar Class · Sequoia HS").
**Files:** `index.html`.

### [x] Session 2.4 — Escape user values + friendly error states + stale comments
✅ done 2026-06-11 — `escHtml`/`escAttr` wrap photoURL/displayName/email in `userHeaderHtml` (`app.js:26–29`); `signIn()` shows inline `showAuthError(...)` instead of `alert()`; `firebaseReady` guard at boot calls `showFirebaseLoadError()` when the SDK/config didn't load; `index.html` comment block updated to reference `config-main.js`/`module-N.js`/`app.js`. Verified by inspection.
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
> Song lists: verify any new song links per CLAUDE.md (oEmbed) before touching a module's songs.

### [x] Session 3.1 — Module 5 part 1: chord diagrams
✅ done 2026-06-12 — Added 14 inline `chords:` diagrams at each chord's first use per set (S1 Am/Em · S2 C/G/Am/F · S3 D/A/Em/Bm · S4 E/B7/F#m/C#m), matching each step's taught fingering; no step text changed. F = simplified xx3211. **Voicing decision (Jonathan):** partial-barre Bm (xx4432), F#m, C#m through Modules 5–6; full barre starts in Module 7. Switched the shared pop-up library (`CHORD_DIAGRAMS` in `app.js`) Bm/F#m/C#m to those partial shapes — safe because Module 7 already skips these auto-link pop-ups (`wrapChordLinksIn`, app.js:704) and renders full-barre inline. F#m/C#m are identify-only in S4 (no hands-on challenge) so their diagrams ride the Group-3 watch step, self-labeled. No shapes were missing from the library. **Forward note for Session 3.3:** Module 7's inline Bm/F#m/C#m diagrams must be full barre (already the design). **Files:** `module-5.js`, `app.js`.
Module 5 teaches ~12 chords with ZERO inline diagrams. Study `chordDiagramSVG` +
`CHORD_SHAPES` in `app.js` and the `chords:` usage in modules 3/7. Add a diagram at
each chord's first introduction per set (S1: Am, Em · S2: C, F, Am, G · S3: D, A, Em,
Bm · S4: E, B7, F#m, C#m). List any shapes missing from `CHORD_SHAPES`. Ask Jonathan
(multiple choice) about voicings: F simplified xx3211 vs barre (Set 2 text teaches
simplified — diagram must match); Bm/F#m/C#m simplified vs barre. Diagrams must match
what the step text teaches. No step-text changes this session.
**Files:** `module-5.js`, possibly `app.js` (shapes only).

### [x] Session 3.2 — Module 5 part 2: full template pass
✅ done 2026-06-12 — Video diet: cut Set 1 from 3→2 videos (dropped the Simen Otnes "Open Chord Shapes" relaxation clip, folded its tip into the Clean Am hint); all 8 remaining videos now carry timestamp ranges + during-watching jobs (0 "full video" left). Added Stuck?/Level up to every graded challenge, per-step `time:` chips (38) + a ⏱ Timer ref in each set's loop challenge, and **Station Wrap-Up** exit tickets on all 8 stations (reflective on B, next-steps on C). **One-Minute Changes** PR drill added to every set (Am↔Em · C↔G · G↔D · E↔B7), score saved to a `short` response so students beat their own record set-to-set. Set 4: added the Module-1 goal-revisit step ("re-read My Guitar Adventure — what changed?") at the computer station (Jonathan's pick) and renamed the Showcase Run as the named assessment piece (Challenge 4). Expanded `MODULE_REVIEWS[5]` from 5 generic → 8 gotItWhen "I can" lines + `assessItems` + forward link to Module 6 (strumming). **Files:** `module-5.js`.
Standard scope (above). Module 5 specifics: heaviest video load in the course (9 watch
steps) — cut hardest here; add the one-minute-changes challenge (classic chord-change
speed test) as a PR drill with the score typed into a `short` response, recurring
across sets so students beat their own record; Set 4 "showcase preparation" gets an
explicit step revisiting the Module 1 goal ("re-read what you wrote; what changed?").
**Files:** `module-5.js`.

### [x] Session 3.3 — Module 7 (barre chords — the morale module)
✅ done 2026-06-12 — Video diet: cut one video from each of the 3 computer stations (Set 1 "Complete Beginner's Guide", Set 2 "Get Good at Guitar / Simen Otnes", Set 3 "Easiest F Chord rewatch"), folding each one's tip into a hint; 9→6 watch steps, all ≤2 per station, every link now timestamped (0 "full video"). Barre focus: staged **partial→full Stuck ladders** (bar + root → add strings → full barre) + **honest fatigue hints** (cramping normal, shake out, short tries beat a long grind) on all 12 graded challenges (12 stuck / 12 levelUp). Pulled the **E-shape ↔ A-shape "two homes for every chord"** insight out of a video into its own hands-on ear/play step ("Two Homes for F", Set 3 practice, both F diagrams). Added **One-Minute Barre Changes** PR drill (F↔G) + PR ladders on the Smoke riff (BPM) and the F–C–G–D switch (BPM) — 3 recorded-score responses. Per-step time chips (27) + Timer refs; **Station Wrap-Up** on all 6 stations; named assessment pieces (F-G-A Slide, Shape Combo); expanded `MODULE_REVIEWS[7]` 3→7 gotItWhen lines + `assessItems` + Module 8 forward link. Diagrams are full-barre majors (F/G/A E-shape, B/C/D A-shape) per the [[barre-chord-voicing-rule]] — no partial shapes in M7. **Files:** `module-7.js`.
Standard scope. Specifics: barre is the frustration peak — Stuck? ladders matter most
here (partial barre → add strings one at a time → full barre) plus an honest fatigue
hint (shake out the hand, short sets); give the E-shape → A-shape "same shape, new
root" insight its own ear/quiz step instead of leaving it inside a video; video diet
(9 watch steps).
**Files:** `module-7.js`.

### [x] Session 3.4 — Module 3 (power chords)
✅ done 2026-06-13 — Set 1 computer station: replaced the Simen Otnes shape video with an interactive **E5→G5→A5** step (chord diagrams + a ▶ "hear the roots climb E·G·A" `playSeq`), folding its tip into the hint; now 2 videos + 1 interactive. Set 1 practice: split fretting and muting into their own challenges — added **Challenge 2 — Mute Check** ("strum all six strings but only the two power-chord notes ring"); renumbered to 6 challenges; added Stuck?/Level up + `time:` chips to every challenge; named the Watchtower Loop the assessment piece with a PR ladder. Set 2 computer station: **kept at 3 videos** (Jonathan's call), but added time chips, during-watching jobs, fixed the Marty "(full video)" → 0:00–3:00, added a Station Wrap-Up. Set 2 practice: Stuck?/Level up + time chips on each challenge, named the Eighth-Note Strum the assessment piece with a PR ladder toward the 80 BPM unit goal. **Station Wrap-Up** exit tickets on all 4 stations. Expanded `MODULE_REVIEWS[3]` 5→10 gotItWhen "I can" lines + `assessItems` + forward link to Module 4 (pentatonic/lead). No songs touched (Set 2 "Core Song 2 — TBD" stays Jonathan's song-swap item); no new video URLs. **Files:** `module-3.js`.
Standard scope. Specifics: computer station is the pure 3-videos formula — replace one
video with an interactive `tab:` of E5 → G5 → A5 with `playSeq`; muting gets its own
named challenge ("Win: strum all 6 strings but only the two power-chord notes ring");
`playSeq` for root movement.
**Files:** `module-3.js`.

### [x] Session 3.5 — Module 6 (strumming — REDESIGN, not just a pass)  *(Jonathan-led)*
✅ done 2026-06-14 — **Scope decision (Jonathan): template pass only** — kept the existing
down-up → D-DU-UDU → folk/rock/reggae arc; no advanced-technique redesign, no resequencing,
no SVG `strumPattern:` renderer. Applied the frozen Appendix A template to all 3 sets:
every "(full video)" → 0:00–N timestamp range + a during-watching job (0 "full video" left);
added one interactive computer-station step per set (chord diagrams at first use — Em/Am S1,
G/D S2, C S3); added warm-up spirals to Sets 2 & 3 (Set 1 already had one); Stuck?/Level up
on all 10 graded challenges; per-step `time:` chips (23) + ⏱ Timer refs; named an assessment
piece per set (Em↔Am Switch · G→D Pattern Locked · **Two Feels, One Song** — a new Set 3
challenge with a `short` capture); PR-ladder BPM `short` responses on Sets 1 & 2; solo
fallback folded into the Set 3 Trade Off. New **monospace strum-pattern line** (`D U D U…`
over `1 + 2 + 3 + 4 +`, skips shown as ·) on 5 challenges via a small `.strum-line` CSS class
— *not* the SVG renderer (the rejected option), so no new `app.js` code. Expanded
`MODULE_REVIEWS[6]` 3→6 "I can" lines (kept original `mr6-s1/-s2/-s3` ids) + `assessItems`
+ forward link to Module 7 (barre). Verified headless: strum-line renders with the count
aligned underneath, chord diagrams + warm-ups + Stuck/Level up + PR ladders all display,
0 console errors. **Files:** `module-6.js`, `styles.css`.
Jonathan decides scope first: upgrade to advanced strumming (syncopation/16ths, accents,
percussive muting), which songs anchor each set, whether basic strumming shifts
earlier. Then apply: keep Set 1's body-first ladder (tap → muted → one chord →
changes) and extend it upward as named challenges; add a strum-pattern visual — start
with the monospace pattern line (`D   D U   U D U` over `1 + 2 + 3 + 4 +`); if Jonathan
wants more, build a `strumPattern:` step property rendering a small SVG arrow diagram
(new code, CSS vars); add `chords:` diagrams for the chords used (Em, Am, …); update
objective/skillFocus/gotItWhen to the new scope; standard scope on top.
*~~Forward link: the looper (Session 6.1) will give this module its play-along backing.~~
Looper (6.1) was dropped — the "play along with the recording" steps (e.g. Set 3 Reggae
Chop over "Three Little Birds") are the permanent backing; no looper hook needed.*
**Files:** `module-6.js`, possibly `app.js` (strumPattern renderer).

### [x] Session 3.6 — Module 8 (fingerpicking)
✅ done 2026-06-13 — Added clickable arpeggio `tab:` steps as a new hands-on step on every computer station (Set 1 open-string p-i-m-a · Set 2 Em · Set 3 C; Am arpeggio rides Set 2 practice Ch2), so Am/C are both interactive. Inserted **Challenge 3 — The Pinch** (thumb + "a" finger as one sound) in Set 3 between Full Progression and Travis Thumb; renumbered Set 3 to 5 challenges. Video diet: every "(full video)" → 0:00–N range + a during-watching job (all 6 watch steps; 4 unique IDs re-verified live via oEmbed). Added Stuck?/Level up to all 11 challenges, `time:` chips + ⏱ Timer refs, **Station Wrap-Up** exit tickets on all 6 stations, PR ladders (typed max-BPM) on Set 1 Plucks / Set 2 Beat Your Tempo / Set 3 Full Progression, named assessment piece per set, solo fallback folded into the Perform It hint. Expanded `MODULE_REVIEWS[8]` 3→9 "I can" lines + `assessItems` + a lifelong-playing forward link (final module — no Module 9). Songs untouched (Core Song 2 — TBD stays Jonathan's song-swap item); no new URLs invented. **Files:** `module-8.js`.
Standard scope. Specifics: write the p-i-m-a arpeggio patterns over Am/C as clickable
`tab:` steps (they exist only in prose); insert an intermediate "pinch" challenge
(thumb + finger together) between basic arpeggio and Travis picking in Set 3.
**Files:** `module-8.js`.

### [x] Session 3.7 — Module 4 (pentatonic/improv)
✅ done 2026-06-13 — Rule-of-3 improv constraint applied (Set 1 "First Solo" → "Rule of 3": 3 notes for 4 bars, then add a 4th); Set 3 "Compose It" gained a `short` capture so the 4-bar solo (scale-degree numbers) saves to Firestore/dashboard. Backing-track phrasing on all 3 improv challenges (Set 1 Rule of 3, Set 2 Call & Response, Set 3 Perform It) — each says "over a backing track (a teacher-played Am, or one you queue up)" / "record yourself". *(Correction 2026-06-14: an earlier draft of this note claimed each carried a `// LOOPER (Session 6.1)` swap-point comment — no such comment exists in `module-4.js`, and 6.1 was dropped, so the backing-track phrasing IS the permanent design.)* Standard pass: the two `(full video)` links (Set 2 Hammer-Ons, Set 3 Vibrato) → 0:00–3:00 + during-watching jobs (no URLs swapped); one interactive per computer station (Set 1 `playSeq` C major pentatonic · Set 2 clickable D-string note `tab:` scaffold · Set 3 `playSeq` A blues scale / blue note); warm-up spiral added to Sets 2 & 3; Stuck?/Level up on all 10 challenges; `time:` chips + Timer refs everywhere; Station Wrap-Up on all 6 stations; PR ladders on Set 1 Pattern 1 Climb (BPM) + Set 2 D-string map; assessment piece named per set (Pattern 1 Climb / Call & Response / Perform It — Jonathan's pick: technical climb for Set 1); solo fallback (record yourself) folded into Set 3 Perform It. Expanded `MODULE_REVIEWS[4]` 5→10 "I can" lines + `assessItems` + forward link to Module 5 (open chords). **One deviation:** Set 3 has no tempo PR ladder (performance/composition isn't a BPM skill) — the compose `short` capture is its recorded artifact instead. Songs untouched (Core Song 2 — TBD stays a song-swap item); no new video URLs invented. **Files:** `module-4.js`.
Standard scope. Specifics: structure the improv steps with constraints ("Rule of 3 —
improvise with only 3 notes of the pattern for 4 bars, then add one"); Set 3's
compose-a-solo gets a capture step (write your 4-bar solo as TAB numbers in a `short`
response so it reaches Firestore/dashboard).
*~~Forward link: the looper (Session 6.1) will give the improv challenges a backing track.~~
Looper (6.1) was dropped — "over a backing track (a teacher-played Am, or one you queue up)"
and the record-yourself fallback are the permanent design; nothing left to swap in.*
**Files:** `module-4.js`.

### [x] Session 3.8 — Module 1 (keep its warmth)
✅ done 2026-06-14 — Added 8 concrete `Win:` lines (Module 1 had zero) across both
sets' challenges (Jonathan's pick: concrete, like Modules 2–8). **Videos** (verified via
oEmbed; Jonathan asked for Marty Music / JustinGuitar): replaced the Set 2 "Parts of the
Guitar" video — was **Guitar Center** — with JustinGuitar's *Beginner Guide To Guitar
Anatomy* (`zpRoq0jcWfQ`); added Marty Music's *Caring for Your Acoustic Guitar*
(`PyWZYHy17As`) to Set 1's computer station. Added a **headphones/volume norm** as the
first step of Set 1's computer station, and a **safe-handling** step + Win in Set 1's
"explore the guitar" section (week-1 norms at first contact). Confirmed the Set 2
Seven-Nation-Army first-melody `tab:` renders with clickable notes + `playSeq` (browser-
verified, 0 console errors). **Files:** `module-1.js`.

### [x] Session 3.9 — Cross-module features + consistency sweep
✅ done 2026-06-14 — **Answer keys:** new graded render for in-step MCs (`onStepMcSelect` +
`.step-mc-keyed`/`.step-mc-explain` in `app.js`/`styles.css`) — pick → green/amber +
✓ on the correct option + one-line explanation; stores the choice TEXT so the teacher
dashboard is unchanged. Added `answer:`+`explain:` to **39 factual MCs** across all 8
modules; left 1 unkeyed (module-1 "what was the guitar doing?" — student's own clip).
**Distractors:** fixed 3 joke giveaways → real misconceptions (m2 `H`→`G#`; m6 reggae
`No strumming`→`Fast 16th-note strumming`; m7 stacked-TAB `Skip them`/`Pick whichever`→
`Play only the lowest string`/`Roll across slowly`). **Song dots:** `level:` (1/2/3) on
**109 Choice-song entries**, rated per-module-context; rendered as ●/●●/●●● (green/amber/
red) via `diffDotsHtml` + legend; added a **🎤 Class request** slot to every module's song
list. **Stuck?/Level up styling:** already done (🪜/🌶️ + blue/green) — no change.
**Voice sweep:** challenge format already consistent (frozen-template pattern); tightened
the one genuine hint outlier (m8 Set 3 perform-it). Verified in headless Chrome (graded
MC feedback, dots, 🎤 slot, 0 console errors); 39 answer indices range-validated.
**Files:** `app.js`, `styles.css`, all `module-*.js`.
- Answer keys: add `answer:` + a one-line explanation to FACTUAL step MCs across all
  modules (reflection MCs stay unkeyed); wire the rendering in `app.js` (gentle ✓/✗ +
  explanation, matching the skills-practice quiz pattern). Jonathan marks which questions
  are factual; Claude Code proposes the list first.
- Distractor pass: flag giveaway distractors module by module; propose replacements
  encoding real misconceptions for Jonathan's approval.
- Song difficulty dots: add ● / ●● / ●●● to every Choice song (propose ratings, Jonathan
  adjusts) + a "🎤 Class request — suggest a song!" slot per module; small render
  tweak in `app.js`.
- Style the Stuck?/Level up lines distinctly (e.g. 🪜 / 🌶️ prefixes) — one CSS/render
  change, applies everywhere at once.
- Voice sweep: verb-first, hints ≤2 sentences, consistent "Challenge N — Name:" format.
**Files:** all `module-N.js`, `app.js`, `styles.css`.

---

## PHASE 4 — Pre-launch hardening (the week before students arrive)

### [x] Session 4.1 — ♿ Accessibility pass
✅ done 2026-06-13 — closed the one real gap from the draft's keyboard walkthrough: the **skill checkboxes** (Still working / Got it) and the **Station B/C cards** were clickable `<div>`s — unreachable by Tab and invisible to screen readers, so a keyboard-only/AT student literally couldn't mark a skill or open a station. Added `role="button"`, `tabindex="0"`, aria-labels (+ `aria-pressed` on the skill cells), and one shared Enter/Space keydown handler that fires any non-`<button>` `[role="button"]` (Space preventDefault'd so it doesn't scroll). No layout change, zero cost to mouse users. **Scope decision (Jonathan):** stop here — full screen-reader narration audit would be gold-plating for a 1:1 Chromebook room; the substantive gaps are fixed.
🚧 draft 2026-06-13 (one-pass; revise later) — Audit found most of this already in place: the three `.fab`s are already `<button>`s with `aria-expanded`/`aria-controls`; site-wide `:focus-visible` rule exists (styles.css:3) and the outline-killing `.bpm-slider:focus{outline:none}` already has a `:focus-visible` companion; `--text3` is already `#767670` (meets ~4.5:1); Escape-to-close on tool popups already wired (app.js); icon-only controls (✕ close, 🔊 read-aloud) already have `aria-label`s, and the note/play-seq buttons carry visible text + `title`. **New this pass:** made the resource-panel resize handle keyboard-operable — `role="separator"`, `aria-orientation`, `aria-label`, `tabindex=0`, and ←/→/Home/End width nudging (app.js, end of resize IIFE). **Still TODO when we revise:** full keyboard-only walkthrough as the acceptance test.
Convert the three `.fab` tool divs to `<button>` (adjust CSS so they render
identically) · `aria-label`s on all icon-only controls (✕ closes, 🔊 note buttons,
▶ play-sequence) · site-wide `:focus-visible` style (several rules currently kill
outlines: `.bpm-slider:focus{outline:none}` etc.) · darken `--text3:#aaaaa3` where
used on text (≈`#767670` reaches 4.5:1) or reserve it for decoration · Escape-to-close
on tool popups · full keyboard-only walkthrough as the test.
**Files:** `index.html`, `app.js`, `styles.css`.

### [x] Session 4.2 — 🔗 Full dead-link audit
✅ done 2026-06-15 — Swept all 230 unique YouTube IDs across `module-1..8.js` + `config-main.js` via a `curl`/oEmbed loop (200 = live, 404 = dead). **Result: 229/230 live, 1 dead.** The dead one — `mWJ6oRTyjnE`, the "House of the Rising Sun" tutorial reused in `module-6.js` (×1, Level-2 strum choice) and `module-8.js` (×3, Core fingerpicking) — was replaced with JustinGuitar's verified BS-610 lesson `q9dyAQLYybU` ("House Of The Rising Sun – Animals (Songs Guitar Lesson BS-610)"), which teaches the same arpeggiated fingerpicking pattern, so it fits both contexts. Bumped `CACHE_VERSION` v22→v23 + logged a CHANGELOG entry. **Files:** `module-6.js`, `module-8.js`, `sw.js`, `CHANGELOG.md`. **Still recurring:** re-run each semester (links rot over time).
⏸ *(prior)* **Deferred 2026-06-13 (do later)** — consciously punted; treat as a recurring start-of-semester task, not an open Phase 4 blocker.
Extract every YouTube ID across all 8 module files (~222 unique). Verify each via
oEmbed in parallel batches. Report ✅/❌ with file+line. Replace dead ones via
search-and-verify; anything without a good replacement gets flagged for Jonathan to choose
a song. Re-run each semester.
**Files:** all `module-N.js`.

### [x] Session 4.3 — Firebase hygiene (guided, mostly console work)
⚠️ **2026-06-13 follow-up — the API-key path restriction broke sign-in; reverted.** The tightening below to `jhoffmanteacher.github.io/guitar-class/*` (a *path* restriction) blocked all Google sign-in: browsers send only the **domain** as the referrer on Firebase's cross-site auth calls, so a path-restricted key rejects them and the app shows the generic "make sure pop-ups are allowed" error. Fix = restrict by **domain only**: `jhoffmanteacher.github.io/*` + `guitar-class-2fd21.firebaseapp.com/*` + `localhost/*`. `FIREBASE_HARDENING.md` updated with a "do NOT restrict by path" warning.
✅ done 2026-06-13 — Walked the `FIREBASE_HARDENING.md` checklist with Jonathan at the console. **(1) Firestore rules:** verified live — already locked to the documented own-doc + teacher-read block, NOT test mode. **(2) Teacher email:** confirmed `jhoffman@seq.org` works — `?teacher=true` loaded the dashboard, not the denied screen (matches `firebase-config.js:17` + `app.js:2209`). **(3) API key:** was already restricted to Websites; ~~tightened `jhoffmanteacher.github.io/*` → `jhoffmanteacher.github.io/guitar-class/*` (project-page path)~~ **[reverted — see warning above]** + added `localhost/*`, kept the `guitar-class-2fd21.firebaseapp.com/*` auth-domain referrer. **(4) App Check:** skipped per plan. Also corrected the guide's two stale facts (project ID is `guitar-class-2fd21`, deploy URL is the `/guitar-class/` project-page path). ~~**One open item:** final incognito "does it still save" test after key propagation (~5 min) — last checkbox in the guide.~~ **✅ verified 2026-06-14 — incognito Google sign-in saves and persists on the live site; the domain-only key restriction holds.** **Files:** `FIREBASE_HARDENING.md` (doc only).
🚧 *prior draft note:* Wrote `FIREBASE_HARDENING.md` (one-pass 2026-06-13) covering rules verification, API-key restriction, App Check, and a done-when checklist. No code — console work needing Jonathan's Google login.
Verify Firestore rules in production match the documented rules (students read/write
own doc; teacher read via jhoffman@seq.org) · restrict the web API key to the
`jhoffmanteacher.github.io` referrer in Google Cloud console · App Check optional,
skip if it adds friction.
**Files:** none (console); Claude Code guides.

### [x] Session 4.4 — UX polish grab-bag (optional)
🚧 draft 2026-06-13 (one-pass) — Two of three already done: the timer **flashes at zero** (`flashTimerDisplay` + `timerDoneFlash` keyframes) and the resize handle **already has touch handlers** (touchstart/move/end). **New this pass:** last module/set now also persist to `localStorage` (`saveLocalPlace`/`restoreLocalPlace`) on top of Firestore, so a returning student lands where they left off instantly — before Firestore loads, on a flaky connection, and in dev-bypass mode. **Update 2026-06-13:** louder end-of-timer cue decided + built — when the timer hits zero it now also pulses the always-visible floating **timer FAB** green (`flashTimerFab` + `fabTimerDone` keyframes, 6× ~3.6s), so students who closed the popup (most of them) still get a visual cue in a loud room. ~~**One open item left:** confirm touch-resize on a real convertible Chromebook (physical test — Jonathan).~~ **✅ closed 2026-06-14 — N/A: Jonathan's student Chromebooks aren't touch/convertible, so touch-resize isn't needed. The handle still works fine by mouse/trackpad (the touch handlers are harmless on non-touch devices).**
Persist last-selected module/set per student · flash the timer display at zero (beeps
get lost in a loud room) · verify the resource-panel resize handle works by touch on
convertible Chromebooks.
**Files:** `app.js`, `styles.css`.

### [x] Session 4.5 — 🖨 Per-set print/handout export
✅ **signed off 2026-06-14** — Jonathan printed an example set from preview (portrait letter) and approved the handout. No changes needed; the `@media print` layout below is final.
🚧 draft 2026-06-13 (one-pass) — Added a "🖨 Print this set" button to each set's tab bar (`printSet()` → `window.print()`), tagged the four tab-panels (`tp-station-b/-c/-songs/-checklist`), and wrote an `@media print` block (styles.css): hides all chrome (header, pills, fabs, resource panel, tab bar, response inputs, play/read-aloud buttons, save indicator), force-shows **both** station panels regardless of which tab is open, hides songs+checklist, expands collapsed Station-C sections + step bodies, keeps `tab:`/`chords:` SVGs and Stuck?/Level up, forces light colors with `print-color-adjust:exact`, single-column layout, page-break before Station C, and a print-only "Guitar Class — Sequoia HS" header. **Update 2026-06-13:** content decided + built — the handout now prints **stations + the skills checklist** (songs stay excluded: they're mostly clickable video links, useless on paper). The checklist prints on its own page as a clean blank tick-sheet (interactive toggles, "Practice this" expandos, the cl-intro line, and the live progress bar are all hidden; the two tick-boxes get a crisp 1px border). ~~**One open item left:** Jonathan prints one example set from preview (portrait letter) and eyeballs it for approval.~~ **✅ done 2026-06-14 — approved, no changes needed.**
For days the Chromebooks or wifi fail: any set should print as a clean one-pager.
Add an `@media print` stylesheet — hide chrome (header, module pills, fabs, response
inputs/textareas, read-aloud + play buttons, resource panel), expand BOTH station
panels regardless of which is open, render `tab:` blocks in monospace and `chords:`
diagrams as their SVGs, keep hints and Stuck?/Level up lines. Add a small
"🖨 Print this set" button near the set title that calls `window.print()` (and
temporarily opens both stations). Show Jonathan one printed example set (PDF from print
preview, portrait letter) for approval before styling the rest.
**Files:** `styles.css`, `app.js`, possibly `index.html`.

### [x] Session 4.6 — 📴 Offline resilience (light PWA)
⏸ **Manual offline test deferred 2026-06-14 (Jonathan's call) — non-blocking, not worth worrying about.** The SW is already live and helping load speed/caching; the offline-reload sign-off was only a real-device confirmation. Skipping it has near-zero downside: if offline reload ever failed, a student with dead wifi just sees the normal browser "no connection" page (same as any non-PWA site) — no broken site for online students, no data loss (saving queues + resumes). The one thing that actually matters — **bump `CACHE_VERSION` on every push** so returning students never get a stale cache — is already in the push routine (CLAUDE.md table; on v18 as of 2026-06-14). Re-run the offline test later only if it ever feels worth it.
🚧 draft 2026-06-13 (one-pass) — Added `sw.js` (stale-while-revalidate cache of the static shell: index/styles/app/config-main/firebase-config + all 8 module files + manifest + icon; cross-origin Firebase/YouTube/Translate/gstatic requests are never intercepted, so auth + saving behave unchanged; navigation falls back to cached `index.html`). Registered it in `app.js` (only on `http(s)`, so it's a harmless no-op on Live Server's `file://`-style preview). Added `manifest.json` (name, theme `#4d1964`, standalone, portrait) + `icon.svg` (guitar on the brand purple), linked both in `index.html`. **CRITICAL routine added:** `CACHE_VERSION` in `sw.js` (currently `guitar-class-v1-2026-06-13`) — and CLAUDE.md's push table now says **bump it on every code push** or returning students get a stale site. **TODO when we revise: real-device test — the SW registers on Live Server (http://localhost) and on the deployed site, but NOT if index.html is opened directly via file://. Test on localhost first, then on the live GitHub Pages site (load, go offline in DevTools, reload). Bump `CACHE_VERSION` whenever a cached file changes.**
The app already degrades gracefully when Firebase is blocked; make the static shell
load instantly on weak school wifi and survive brief outages. Add `sw.js` caching
`index.html`, `app.js`, `styles.css`, `config-main.js`, and all `module-N.js`
(stale-while-revalidate), register it in `app.js`, and add a minimal `manifest.json`
(name, theme color, icon from the SVG favicon). CRITICAL: include a version string in
`sw.js` and bump it on every push so students never get a stale site — add "bump SW
version" to the push routine (update the CLAUDE.md table in the same session). Be
honest in the UI: offline = practice content works, progress saving resumes when the
connection returns (the existing save indicator already says this). Test: load once on
Live Server won't work for SW (needs the deployed origin or `localhost` http) — test
on localhost, then on the live site: load, go offline (DevTools), reload.
**Files:** new `sw.js`, new `manifest.json`, `index.html`, `app.js`, `CLAUDE.md`.

---

## PHASE 5 — Ongoing / recurring (Jonathan-led, Claude Code assists)

- [ ] Handout audit: open all 22 Google Doc `handoutUrl`s in incognito — confirm
      students won't hit a permission wall; check content still matches each set.
- [ ] Spanish spot-check: review 2–3 sets in Español mode with a fluent speaker; keep a
      list of bad translations (if short, a manual override dictionary becomes a small
      code task).
- [ ] End-of-semester set: design the Module 1 goal-revisit / final reflection /
      performance rubric (seeded by Session 3.2's showcase step).
- [x] "Start here" onboarding blurb for new students (sign-in, how the tracker works,
      headphone norms). ✅ 2026-06-13 — built as a dismissible welcome card shown once on
      first load (localStorage `gc-welcomed`), with a "👋 Start here" link above the Module
      selector to reopen it. Closes via ✕, "Got it" button, backdrop click, or Escape;
      hidden in print. **Files:** `index.html`, `styles.css`, `app.js`.
- [ ] Song refresh each semester: swap in 2–3 student-requested songs (verify links
      per CLAUDE.md); pull from the 🎤 request slot.
- [x] Reflection prompts: add 1–2 listening/reflection responses per set in Modules
      6–8 to match Module 1–2 richness. ✅ 2026-06-13 — audit found Modules 7 & 8 already
      had per-set "take a beat to reflect" wrap-ups + listening reflections; Module 6 was
      the gap. Added a tailored reflective wrap-up step to station B of all three M6 sets
      (Claude wrote the prompts at Jonathan's request). **Files:** `module-6.js`.
- [ ] Review Session 3.9 song difficulty dots: Claude rated **109 Choice songs** ●/●●/●●●
      per module context (in `module-*.js` as `level: 1|2|3`). Skim each module's Set 2+
      song lists and adjust any that feel off — tell Claude the song + new level, or edit
      the `level:` value directly. (Ratings are first-pass; you're the final call.)
- [ ] Review Session 3.9 distractor swaps: Claude replaced 3 joke MC options with real
      misconceptions — confirm they read well, especially **m6 reggae** (`Fast, constant
      16th-note strumming throughout`) and the **m7 stacked-TAB pair** (`Play only the
      lowest-numbered string` / `Roll across them slowly, one note at a time`); the third
      is m2 `H`→`G#`. Easy to revert per-option if any miss.
- [ ] ⚠️ Review Module 4 Set 1 video (`m_IiyJu60-c` — "Major Pentatonic Scale – Marty
      Music", swapped in 2.2 on 2026-06-11): watch it through and confirm it fits the
      beginner Pattern-1 station before the course starts. Code comment flags it too.

---

## PHASE 6 — Feature builds  *(start only after Phase 3 is complete; can interleave with Phase 4)*

> These are new capabilities, not content passes. **Phase 6 is now closed: 6.2 shipped;
> 6.1 (looper) was dropped; 6.3 (Song Journey) was dropped here but later revived —
> see 6.3 below.** (Historical ordering rationale:
> 6.1 was meant to unblock the improv/strumming challenges in 3.5/3.7, but those ship fine
> with teacher-played / queued / recorded backing instead.) Every session here was a "big
> change" — per the working rules, each showed one working example (mock-up or single wired
> instance) with a multiple-choice
> question about it before building the rest.

### ~~Session 6.1 — 🔁 Backing-track looper~~ (dropped)
~~Backing-track looper~~ — built & demoed 2026-06-13 (Karplus-Strong loop engine, tool
popup + inline buttons, Am/blues/Em–Am presets), cut after listening to it; not wanted.
Do not rebuild.

### [x] Session 6.2 — 📋 Teacher dashboard: exit tickets + PR scores
✅ 2026-06-13 — Added a "Skills grid ⇄ ✍ Responses" toggle to the teacher dashboard.
Surface (Jonathan picked): a separate Responses view (cards, not an expandable grid
column). Per the selected set, each student card shows their written answers — PR
prompts ("Personal record") render as 🎯 with the BPM number extracted; other shorts
render as ✍ labeled by prompt/placeholder/"Wrap-up reflection". Students who wrote
nothing are skipped; meta line counts who responded. **No extra Firestore reads** —
extended the existing one-shot `loadAllStudents()` fetch to also read the `responses`
field. Read-only, reuses the per-set tabs + `jhoffman@seq.org` gating. Only the latest
value is stored, so PR shows the latest number (no fake trend). Verified locally
(headless Chrome, mock students): PR extraction, skip-empty, view toggle, skills-grid
regression, and non-teacher denial all pass. **Files:** `index.html`, `app.js`,
`styles.css`.

### Session 6.3 — 🎸 Song Journey view (dropped 2026-06-13, revived 2026-07 as static pages)
Cut 2026-06-13 before any work, then revived in the **"Take It to a Song" build**
(branch `station-c-songs`, merged to main 2026-07-03) in a lighter form: static
per-song pages under `tabs/` (first: `tabs/seven-nation-army.html`, 5 layers with
per-layer self-rating buttons), not an in-app view. The same build added
"Take It to a Song" sections to Modules 2–5, stacked (two-note) TAB columns in the
renderer, and rewrote Module 5 Set 3's song challenge around Oye Mi Amor with an
E-chord preview (Jonathan's call, 2026-07-03; the old Country Roads / Stand By Me
challenge is gone, though both remain as Choice songs in the songs list).
**Open follow-ups:** broader supplementary-song decisions for the site (waiting on
Jonathan's curriculum map). *Closed 2026-07-03: Firestore wiring for the rating
buttons · module links to the SNA layer anchors · M6–8 Take It to a Song sections
(see below) — all shipped.*
**Watchtower Song Journey — ✅ done 2026-07-03:** second page,
`tabs/all-along-the-watchtower.html`, same 5-layer pattern (Listen Dylan-vs-Hendrix ·
bass line 5-3-1-3 · power chords A5-G5-F5-G5 · Am pentatonic Pattern 1 solo · open
chords with small F) and the same Firestore rating save (`songRatings.all-along-the-watchtower`).
Wired like SNA: per-layer 🧵 links on the Watchtower challenges in M1–M5 (incl. both
assessment pieces) + `journeyUrl` on every Watchtower songs-list entry — M1–M5 with
layer anchors, M6/M7 to the page top (those units go beyond the page's 5 layers).
**Remaining three Song Journeys — ✅ done 2026-07-03:** `tabs/sweet-child-o-mine.html`
(5 layers: Listen "Anytime" · bass roots U2 · power chords U3 · Em pentatonic
open+12th U4 · open chords U5, with the M7 intro-riff stretch goal named in Layer 5),
`tabs/oye-mi-amor.html` (5 layers: Listen · power chords U3 w/ open E5 · open chords
U5 w/ E-preview · D-DU-UDU Latin strum U6 w/ partial Bm xx4432 · full barre Bm x24432
U7), `tabs/let-it-be.html` (4 layers: Listen · open chords U5 small F · down-up strum
U6 · p-i-m-a-m-i fingerpick U8 + the 3-times-through recovery test). Pattern change
from SNA: songs that don't start in Unit 1 get a "Listen" Layer 1 labeled **Anytime**
instead of a unit number, and layer counts vary (links say "Layer N of 4/5"
accordingly). Same Firestore rating save under `songRatings.<page-slug>`. Wired: inline
🧵 layer links on each song's challenges (SCOM M2/M4 · Oye M3/M5×2 · LIB M5 listen +
challenge) + `journeyUrl` on every songs-list entry for these songs M2–M8 (layer
anchors where the entry maps to a layer; page top for beyond-the-page entries: SCOM
M7×2, Oye M5 Set 4 showcase). All five thread songs now have journey pages.
**M6–8 Take It to a Song — ✅ done 2026-07-03:** all 9 practice stations got the
section (M2–5 pattern; placed before Station Wrap-Up in M7/M8, appended last in M6
whose wrap-ups live at the computer station; in M7 Set 3 it sits before the 🌶️
stretch-goal section). Songs used are each set's existing Core songs, thread songs
first: M6S1 Watchtower down-up + Knockin' on Heaven's Door · M6S2 I'm Yours +
Oye verse w/ small Bm (D-DU-UDU) · M6S3 Watchtower folk→rock (Dylan→Hendrix callback)
+ Three Little Birds reggae chop · M7S1 SNA real rhythm from TAB · M7S2 SCOM verse as
one sliding E-shape (D fr10 · C fr8 · G fr3, high-frets-are-easier teaching point) ·
M7S3 Oye full-barre Bm (x24432) + Watchtower all-barres (Am = E-shape minor fr5,
matches m7w3-s6's gotItWhen) · M8S1 "the cure" first p-i-m-a on Am→C · M8S2 "the cure"
verse p-i-m-a-m-i (Am·C·F) · M8S3 Let It Be fingerpicked (journey Layer 4 of 4).
Steps reference existing set skills only — **no skills added, so `MODULE_MANIFEST`
skillCounts unchanged.** Thread-song steps carry 🧵 journey links (layer anchors where
they map: Oye M6→#layer-4, M7→#layer-5, Let It Be M8→#layer-4; page top otherwise).

---

## APPENDIX A — Module Template Checklist (frozen after Session 1.4)

Run every module against this. ★ = patterns Module 2 modeled from the start.

**Computer station:** ≤2 videos, timestamped, with a during-watching job ★ · at least
one interactive step (`tab:`/`chords:`/`playSeq`/fretboard) · one ear/listening step
tied to a real song ★ · scaffolded skill version that the practice station fades ★ ·
quick-checks sample different content than the practice station · closes with the
exit-ticket reflection.

**Practice station:** opens with the warm-up spiral ★ · named, verb-first challenges
with "You've got it when:" conditions ★ · Stuck? + Level up on every challenge · at
least one drill matching the recall direction of the gotItWhen (random access if the
skill demands it) · at least one PR ladder with a recorded score · one challenge named
"(your assessment piece)" ★ · partner steps have a solo fallback · **NO time limits or
per-step time budgets — the class is self-paced** (the optional ⏱ Timer *tool* may be
referenced for "beat your record" drills, but never as a cap) · closes with the
exit-ticket reflection.

**Content quality:** every new chord/shape/pattern gets `chords:` or `tab:` at first
use · leaked future concepts get a one-line "just-enough" preview (the F# rule) · MC
distractors are real misconceptions; factual MCs keyed, reflection MCs not · no quiz
question repeated verbatim within a set · hints ≤2 sentences; *why* in the hint,
*what* in the step ★.

**Songs & skills:** Core songs playable in-app; Choice may be link-only · Choice songs
carry ●/●●/●●● difficulty dots · every gotItWhen self-contained, observable,
time-bound where possible ★ · no orphan skill ids.

**Module review:** a tight **5–6 core "I can" lines** in gotItWhen language — NOT every
micro-skill (trim redundant/minor ones; the full skill list lives in the per-set
checklists, the review is the highlight reel) · keep original `mr*-s*` ids on the
survivors so saved progress isn't lost · every line carries a `set:` id and renders a
"↩ Review this" link back to the set that teaches it · the **Module Assessment** sits in
its own standout box (`.mr-assess-box`), not a plain `ablock` · ends with a forward link
("why this matters in Module N+1") · references the Module 1 goal where natural.
