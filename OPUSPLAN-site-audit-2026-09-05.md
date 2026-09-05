# OPUSPLAN — Site audit fixes (2026-09-05)

Work order for a Claude Code session to execute. Generated from a full audit
of the repo at `521ebbb` (branch `claude/website-errors-improvements-ikrjah`):
`tools/checks.mjs` (all offline checks pass), a headless-Chromium walk of every
set in both languages plus all 16 games, an adversarial read of the app JS,
an HTML/CSS/contrast/PWA pass, and scripted EN↔ES and music-theory checks over
the module data.

**How to run this plan**

- Work top to bottom. Phase 1 is bugs; do it first and push it on its own.
  Later phases can each be their own push.
- **Line numbers are from `521ebbb` — grep for the symbol, don't trust the
  number.** Every item names a function or selector for that reason.
- Before every push: `node tools/checks.mjs` (full, with links — the cloud
  proxy 403s YouTube, so the link check only proves anything from a local
  machine). Student-facing changes get a `CHANGELOG.md` entry, same push.
- CLAUDE.md's "settled facts" were honoured — nothing below re-flags them.
  Three things the theory check *did* flag were checked and are **not**
  defects: the `Bm` / `C#m` diagrams (`xx4432`-style) have the 5th on the
  bottom, the Module 12 Travis `C` has G in the bass, and the unlabelled
  chord diagrams in `m3w1` / `m5w1` have no `name` on purpose (the student
  names them). Leave all three alone.
- Where an item says **ratchet**, add the detector to `tools/checks.mjs` in
  the same edit (CLAUDE.md rule: 3+ instances of a mechanical class → a
  permanent check). Number them from `1r` onward.
- Phase 2.1 needs Jonathan's call — use `AskUserQuestion` when you reach it.

**Not verified here, must be done locally:** the YouTube/Docs link check
(all 180 returned HTTP 403 through the sandbox proxy), `checks.mjs --live`
after the push, and anything that needs a real guitar or a real phone.

---

## Phase 1 — Bugs — ✅ DONE 2026-09-05

All ten items are fixed, verified in headless Chromium, and pushed. What was
verified, and how:

- **1.1** un-marking a step in dev bypass raises no error banner (was
  reproducible); the same ordering bug also hit any student whose Firestore
  SDK hadn't loaded, which is why the sentinels now build inside the `try`.
- **1.2** with `teacher.js` blocked at the network layer the app still boots,
  `IS_TEACHER_MODE` is defined, zero page errors.
- **1.3** the `kind:'tuning-warmup'` tag is on all 27 sections; ratchet **1r**
  was proved to fail both ways (tag without the title, title without the tag).
- **1.4** with a drill mid-round a `controllerchange` no longer reloads; the
  reload fires once the round ends. Queued saves are flushed first.
- **1.5** both rewrites are byte-identical to the originals across 3,897
  shipped strings (2 note-sequence matches, 226 multi-bullet hints); a
  lookbehind ratchet was added to check 0 and proved to fail on a relapse.
- **1.6** the dashboard threshold now follows a drill's own `rounds`: forcing
  `rounds:6` moved it to 6-of-6 (it was permanently 9); today's numbers are
  unchanged at 9-of-10.
- **1.7/1.8/1.9** at 375px, `m5w2`, `m12w1` and `mr1` have zero overflowing
  elements; the tempo slider and Coach button are on screen; the About panel
  is 349px wide inside 375. Desktop is visually unchanged.
- **1.10** the declaration is hoisted to the session-state block.

⚠️ **Lesson for the next phase.** Moving `IS_TEACHER_MODE` into `app.js` added
a load-time `URLSearchParams` call, and the render smoke test (0b) quietly
degraded to a *warning* — "renderer NOT smoke-tested" — while every other
check stayed green. The stub now gets `URLSearchParams`/`URL`/`TextEncoder`,
and all 36 sets render again. Watch for that warning after any change to
app.js's top level; consider promoting it from `warn` to `problem` so the
safety net can't be lost silently (added to Phase 6).


### 1.1 Dev bypass: un-marking a step crashes the save loop ✅ confirmed live
**Where:** `app.js` `flushSave()` — the two lines that build
`firebase.firestore.FieldValue.delete()` sentinels for removed keys sit
*above* the function's `try`.
**What happens:** in dev bypass `loadProgress()` never runs, so the Firestore
SDK is never loaded. Un-mark any step → the debounced flush fires →
`ReferenceError: firebase is not defined` → unhandled rejection → the global
"Something went wrong — refresh" banner. The headless walk hit it just by
toggling steps. Real students aren't affected (SDK loaded), but every
local UI test session is.
**Fix:** build the delete-sentinel payload *after* `await ensureDb()` inside
the `try`, or early-return from `flushSave()` when `IS_DEV_BYPASS` (whatever
the existing mock-user flag is called) — the comment on `devBypass()`
already promises "progress won't save" in that mode.

### 1.2 Student sign-in hard-depends on `teacher.js`
**Where:** `app.js`, the auth-state callback (`if(IS_TEACHER_MODE){ showTeacherApp(user) … }`).
`IS_TEACHER_MODE` is a `const` in `teacher.js`; every *other* reference in
app.js / live-quiz.js guards it with `typeof`.
**What happens:** if `teacher.js` fails to arrive on a first uncached visit
(flaky school Wi-Fi, one 502), the callback throws for *every* student and
they sit on "Signed in — loading…" until the stall prompt, whose reload
repeats it.
**Fix:** `typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE` there,
or move the const into `app.js` (loaded first) and delete it from teacher.js.

### 1.3 Progress keys depend on one exact English section title
**Where:** `app.js` `isTuningWarmupSection()` — matches
`sec.title === 'Warm-up — tuning check (Module 1)'`; `buildLesson()` then
`.filter(…)`s that section out *before* numbering sections
(`${w.id}-b-sec${gi}`). `teacher.js` has the same filter in its response
reader.
**Why it matters:** 27 sets outside Module 1 carry that section at index 0,
so every stored key in those sets is the *post-filter* index. A copy edit to
that one title in any module file silently shifts every later section's
namespace by one: done-marks, MC picks and written responses land on the
wrong steps, and the teacher's response reader mislabels them. Nothing in
checks.mjs pins the string.
**Fix (either):** (a) give the warm-up section a data flag
(`kind: 'tuning-warmup'`) in every module file and match on that; or (b)
keep the literal but **ratchet**: checks.mjs fails when any section title
starts with `Warm-up — tuning check` and isn't byte-identical to the
constant, and when the constant in app.js and teacher.js differ. Do (b) at
minimum; (a) is cleaner.

### 1.4 Post-deploy auto-reload can discard in-flight student work
**Where:** `app.js`, the `controllerchange` listener near the SW
registration; its `reload()` waits only for `window.coachMicLive` and
`window.__authPopupPending`.
**What happens:** Jonathan pushes during class → every open tab reloads
within seconds. A student who ticked "Mark done" half a second earlier (still
inside the 800 ms debounce or the retry loop), or is 60 s into a Recorder
take (in-memory `MediaRecorder` blob), or mid-round in a Shuffle/Deck/Ear
drill, loses it. The `pagehide` `flushSave()` is a fire-and-forget Firestore
write during unload and is not reliable.
**Fix:** in `reload()` also defer (`setTimeout(reload, 1500)`) while
`_dirtyKeys.size || saveTimer`, while any `recState[k].recording`, and while a
drill is mid-round (`shuffleDrills` / deck / ear state — see what `sdStop`
checks). Better still: `await flushSave()` first, then reload. Consider
deferring to the next `visibilitychange` → hidden instead of an immediate
reload; the SW already has `skipWaiting` + `clients.claim`, so the new shell
is live either way.

### 1.5 Regex lookbehinds break the whole app on Safari < 16.4
**Where:** `app.js` — `NOTE_SEQ_RE` (`(?<![A-Za-z0-9])…`) and the hint
sentence-splitter `split(/(?<=\.(?=\s))…/)`.
**What happens:** these are regex *literals*, so on iOS ≤ 16.3 `app.js`
fails to parse — nothing runs, not even the error banner. Chromebooks are
fine; older family iPhones/iPads are not.
**Fix:** capture the preceding character instead (the pattern `CHORD_RE`
already uses), and split hints with a callback that checks the previous
char. Grep all shipped JS for `(?<` and `(?<!` afterwards — should be zero.
**Ratchet:** checks.mjs step 0 fails on `(?<=` / `(?<!` in any shipped file.

### 1.6 Teacher dashboard drill-gate threshold has drifted from the app
**Where:** `teacher.js` `TEACHER_DRILL_GATE_MIN = 9 // keep in sync with app.js DRILL_GATE_MIN`.
No such constant exists; app.js uses `DRILL_GATE_PCT = 0.9` scaled by
`drill.rounds` in `drillGateThreshold()`.
**What happens:** any drill with `rounds ≠ 10` verifies on the student side
but shows as unverified (or vice versa) on the dashboard.
**Fix:** `tckSpanHtml()` calls `drillGateThreshold(sid)` (a global in app.js,
which loads first) and the teacher constant is deleted.

### 1.7 Play-sequence control row is cut off on phones ✅ confirmed at 375 px
**Where:** `styles.css` `.play-seq-btn{… white-space:nowrap …}` plus
`.bpm-control-group{display:inline-flex; flex-wrap:wrap}`.
**What happens:** the ▶ button's label is a full sentence ("▶ Hear one
p-i-m-a lap on Am, then C — loop it 2 bars each"), so the button is 446 px
wide inside a 240 px step body; `.main` is `overflow-x:clip`, so the BPM
slider and the Coach button to its right are simply unreachable. Seen in
`m5w2`, `m12w1` and the Module 1 Review routine card (`.routine-body`);
any step with a long `playSeq.label` does it.
**Fix:** `.play-seq-btn{white-space:normal; text-align:left; max-width:100%; min-width:0}`
(keep `line-height` sane — it's `1` today, bump to `1.2` for wrapped text) and
`.bpm-control-group{max-width:100%}`. Re-check `.tab-controls` (same group
inside TAB cards) and the routine card. Verify at 375 px with Dev bypass.

### 1.8 "About this set" dropdown overflows every phone
**Where:** `styles.css` `.set-eyebrow .set-about[open] .set-about-panel{min-width:560px; max-width:720px}`.
**Fix:** `min-width:min(560px, calc(100vw - 32px))`, or `left:0; right:0` under
`@media (max-width:760px)`.

### 1.9 Rail drawer is `100vh` on iOS Safari
**Where:** `styles.css` `.rail{height:calc(100vh - var(--hdr))}` in the
≤ 760 px drawer rule; `#app` already uses `100dvh`.
**What happens:** with Safari's bottom bar visible the drawer is taller than
the viewport, so the Tuner/Timer/Metronome dock pinned to its bottom sits
under the browser chrome.
**Fix:** `100dvh` with a `100vh` fallback line before it.

### 1.10 Minor: TDZ hazard in `live-quiz.js`
`lqStopListening()` references `lqInviteAnsweredId` above its `let`. Fine at
runtime today (called after the script finishes), but move the declaration
up so a synchronous call at load can't throw.

---

## Phase 2 — Security & rules — ✅ DONE 2026-09-05 (2.1 closed by decision)

### 2.1 Any Google account can sign in — ❌ NOT DOING (Jonathan, 2026-09-05: "It's okay for anyone to log in")
**Where:** `app.js` `signIn()` builds `new firebase.auth.GoogleAuthProvider()`
with no `hd`; `firestore.rules` `isSignedIn()` is `request.auth != null`.
**What happens:** any Gmail account can sign in, create a `progress/{uid}`
doc (it then appears in the teacher roster, skills grid and Students view),
read `config/class` (uid → paused/archived maps, activity titles/dates), read
`liveQuiz/current` (leaderboard with every player's display name) and file
`issueReports`. Escaping on every render path was verified, so this is
integrity/privacy, not XSS.
**Decision needed (AskUserQuestion):** restrict to the school domain? Options:
(a) `provider.setCustomParameters({ hd: 'seq.org' })` for the picker **and**
a rules check (`request.auth.token.email.matches('.*@seq[.]org$')`, or the
`hd` claim) inside `isSignedIn()`; (b) picker hint only, rules unchanged
(cosmetic); (c) leave open. Jonathan may test from a personal Gmail — ask
before locking. If (a): remember `firestore.rules` does nothing until pasted
into the Firebase console (CLAUDE.md), and say so in the report.

### 2.2 Live-quiz answer docs are shape-checked but not type-checked
**Where:** `firestore.rules`, the `liveQuiz/current/answers/{uid}` write rule
(`hasOnly([...])`); writer in `live-quiz.js` (`ms`, `choice`, `name`); the
teacher's `lqPoints(a.ms, s)` and `cur.name = a.name`.
**What happens:** in `speedBonus` mode a student can write `ms: 0` from
DevTools for max points every round; `name` is capped at 60 chars only
client-side and is copied into `liveQuiz/current.scores`, which every
student reads.
**Fix:** `request.resource.data.ms is int && ms >= 0`,
`name is string && name.size() <= 60`, `choice is string || choice == null`.
Optionally derive `ms` teacher-side from `askedAt`. Paste rules into Firebase
after pushing.

### 2.3 Hygiene: internals are published on Pages
`_config.yml` excludes `*.md`, `archive/` and the reference docs, but
`tools/`, `.githooks/`, `firebase.json` and `firestore.rules` (which names
the teacher email) are served. Add them to `exclude:`; add a `robots.txt`.
No `og:image`/`og:url` either — low.

---

## Phase 3 — Accessibility & dark mode — ✅ DONE 2026-09-05

### 3.1 Modal overlays claim `aria-modal` but don't manage focus
**Where:** `app.js` — `openDaily5Here`, `openMrAssess`, `openCoachGate`,
`openDrillGate`, `openCaReminder` (and their `close*` twins). Only
`openIssueModal` moves focus in; none of the six closers restore it; nothing
sets `inert` on `#app` while one is up.
**What happens:** a keyboard/screen-reader student who triggers the check-off
gate keeps focus on the step behind the dimmed overlay, Tabs through the
whole page underneath, and lands on `<body>` after closing.
**Fix:** copy the pattern `openGamesScreen()` (coach.js) and the resource
viewer already use — remember `document.activeElement`, focus the first
control, `document.getElementById('app').inert = true` while open, restore
on close. One shared `openOverlay(el)` / `closeOverlay(el)` helper beats six
copies. Escape already closes every one.

### 3.2 Dark mode: white text on tokens that lighten in dark mode — **ratchet**
Measured on the dark palette in `styles.css`:

| Ratio | Rule(s) | Pair |
|---|---|---|
| 1.84 | `.tab-note-btn.beat-now`, `.has-finger.beat-now`, `.play-seq-btn.playing` | `#fff` on `--blue-text` |
| 2.08 | `.ca-mark-btn` ("Mark done" on every In-Class Activity) | `#fff` on `--ca-accent` |
| 2.49 | `.header-search-btn` | `--text2` on hard-coded `rgba(255,255,255,.92)` |
| 3.14 | `.step.cur .step-status`, `.sdr-pill.active`, `.sdr-start`, `.resume-go`, `.lq-ctl.go` | `#fff` on `--purple-accent` |

**Fix:** `color:var(--bg)` on those rules (exactly what `.coach-start`,
`.ps-pad.lit`, `.cd-play-btn` already do — they pass at 9.5:1); give
`.header-search-btn` an explicit dark text colour.
**Ratchet (1r):** checks.mjs scans `styles.css` for `color:#fff` /
`color:white` in a rule whose `background` is `var(--*-text)` or
`var(--*-accent)` and fails. Six rules today.

### 3.3 No `color-scheme`, so native controls stay light in dark mode
Nothing sets it (grep: 0 hits). The module `<select>` popup, `.ready-box`
checkboxes, range sliders, `<audio controls>` on Journey pages, `<details>`
markers and scrollbars all render light on `#1e1e1c`.
**Fix:** `:root{color-scheme:light dark}` in `styles.css` and
`tabs/journey-theme.css`, plus `<meta name="color-scheme" content="light dark">`
in every HTML page.

### 3.4 Journey theme has drifted from the app — **ratchet**
- Tokens: `journey-theme.css` `--text2:#6b6b65` / `--text3:#63635d` vs
  `styles.css` `#5e5e58` / `#585852`; dark `--text2:#888880` vs `#9a9a91`.
  Dark-mode `.grain` is 3.65:1, `.chord-card small` 4.19, `.story-sub` 4.42.
  Copy the app's values (the file's own comment claims the tokens match).
- `.tab` card rules (CLAUDE.md: "restyle both or neither"): `.tab` margin
  `8px 0 4px` vs `8px 0 12px`; `.tab-head .tab-icon{display:inline-flex}` only
  in journey; `.tab-body` ≤ 480 px padding override only in journey;
  `.lq-banner{font-family:inherit}` only in journey. Reconcile to one side.
- `tabs/fab-tools.css` vs `styles.css`: `.tp-title` lost
  `display:inline-flex; align-items:center; gap:6px`; `.bpm-slider` height
  18 vs 28.
**Ratchet (1s):** checks.mjs parses both stylesheets and diffs the bodies of
every `.tab*`, `.lq-banner*`, `.lq-invite*` rule, allowing only the
documented `--tab-head-bg` difference. A 25-line rule parser is enough.

### 3.5 Tap targets under 44 px not on the existing halo list
The `::after` halo block in `styles.css` covers a list; add: `.resume-close`,
`.review-go-btn`, `.rep-log-btn`, `.fg-start-btn`, `.set-about summary`,
`.lq-invite-later`, `.rr-skip`, `.sdr-pill`, `.dkr-btn`, `.tab-note-btn`
(≈ 24×22 at 8 columns — pad vertically, not horizontally, so 1o still holds).
On Journey pages `.crumb a` ("← Back to class site") and
`.songmap-more summary` have no size rule at all.

### 3.6 Hover-only affordance on tappable TAB note names
`.tab-note-btn .tab-spkr{opacity:0; max-width:0}` reveals the speaker only on
`:hover`/`:focus-visible`. On touch nothing says the blue note names play.
**Fix:** under `@media (hover:none)` keep the glyph at low opacity (or
underline the note).

### 3.7 Smooth scrolls ignore reduced-motion
10 unconditional `scrollIntoView({behavior:'smooth'})` calls (app.js ×8,
coach.js ×1, journey.js ×1). `celebrateModuleComplete()` and the Riff Runner
already check `matchMedia('(prefers-reduced-motion: reduce)')`.
**Fix:** one `scrollBehavior()` helper returning `'auto'` or `'smooth'`; use it
everywhere. (Put it in `i18n.js` or a tiny shared file so `journey.js` can
reach it — Journey pages have no `app.js`.)

### 3.8 Low, batch together
- `--red-text-bright` on `--red-bg-bright` is 4.37 light / 4.15 dark
  (`.set-peek-banner`, `.mr-locked-banner`); `.ca-chip` 4.45. Nudge the tokens.
- Journey `.layer-num` badges (white on `--l2/--l3/--l4/--l6/--l7`) 3.3–4.3:1;
  `.rung-num` `--l4` on white 3.73. Darken those five accents ~15 %.
- `.dkr-card` is a `<div onclick>` with no role/tabindex (the `.sdr-start`
  button covers keyboard, so AT users aren't blocked). Add
  `role="button" tabindex="0"` — the Enter/Space delegate already handles it.
- Undefined tokens: `.t-act-title-edit{border:1px solid var(--accent)}` and
  `.search-count{color:var(--muted)}` — neither exists. Use `--purple-accent`
  / `--text3`.
- Dead CSS: `.lq-st-title-es`, `.lq-st-prompt-es`, `.lq-st-answer-es` — the
  projector stage never renders a Spanish twin. Delete (or wire, if that was
  the intent — ask).
- Colour-only state: `.fret-dot.hit/.miss` (Note Hunt) and `.rep-dot.filled`.
  Add a glyph or `aria-label`.

---

## Phase 4 — Offline, PWA, performance — ✅ DONE 2026-09-05 (4.4's themed art deferred)

### 4.1 Every deploy re-downloads 6.7 MB, and one failed fetch blocks the update
**Where:** `sw.js` `ASSETS` (93 entries, 6,736,493 bytes measured) installed
with a single `cache.addAll(…, {cache:'reload'})`.
- `img/m13-step-6-lock-and-wind.png` is **1.9 MB** (1200×896 RGBA); its seven
  siblings are ~50–65 KB 720×540 palette PNGs. Re-export to match — this alone
  is 28 % of the precache. (Content fingerprint will bump `CACHE_VERSION`.)
- `addAll` is all-or-nothing: one dropped request on school Wi-Fi and the new
  SW never installs, silently, with no retry. Precache the *shell* with
  `addAll`; precache module files / images / `coach.js` / `teacher.js` in a
  second pass with `Promise.allSettled` over individual `cache.add` calls
  (the fetch handler already runtime-caches them on miss). Keep
  `checkSwAssets` / `checkPrecacheCoverage` green — they walk `ASSETS`, so
  keep one list and split it by a marker, or two arrays both walked.
- Offline navigation miss for `tabs/*.html` falls back to `index.html`
  (wrong page rather than an error). Serve the cached Journey page if it's in
  the cache; otherwise a small offline notice.

### 4.2 Teacher-only and games code is on every student's first paint
`index.html` loads 11 first-party scripts (1,288,155 bytes raw) before the
auth wall can act. `teacher.js` (99 KB) is meaningful only with `?teacher`;
`coach.js` (375 KB) is the arcade + Listening Coach, first needed on a click.
**Fix:** load `teacher.js` only when `location.search` has `teacher` (a tiny
inline check, or `document.write`-free dynamic `<script>` before app.js runs
its auth callback — see 1.2, which must land first). Lazy-load `coach.js` the
way `loadModuleData()` lazy-loads modules: on first `openGamesScreen()` /
`coachOpen()` / Coach-gate. Every `coach*` global used from app.js must go
behind `typeof` guards or a `loadCoach().then(…)`. Also `ensureAllModuleData()`
runs on every login just to draw lock icons (1.4 MB on a first visit); adding
review-skill ids/counts to `MODULE_MANIFEST` lets `isModuleGateLocked` run
without the data files. Measure before/after with DevTools "Disable cache".

### 4.3 Manifest / head tags
- `manifest.json` `"orientation":"portrait-primary"` blocks landscape for the
  8-column TAB grids and the runner games on an installed PWA. Drop the key.
- `theme-color` has no dark variant (`#514a7d` vs dark `--brand #494370`);
  `background_color` is white → white splash on a dark install. Add
  `<meta name="theme-color" media="(prefers-color-scheme:dark)" content="#494370">`.
- `index.html`'s favicon is a data-URI SVG — Safari doesn't render it. Add a
  `<link rel="icon" type="image/png" href="icon-192.png">` fallback.
- `tabs/*.html`, `404.html`, `mood-chart.html` have no favicon, manifest,
  theme-color or apple-touch-icon (each tab 404s `/favicon.ico` — seen in the
  headless run). Add the same head block to all eight.

### 4.4 Step figures: no intrinsic size, no dark variant
47 `<img>` tags in module data (all have `alt`, none have `width`/`height`) →
layout shift on every step with a figure; `.step-figure img{background:#fff}`
because every `img/*.svg` is hard-coded light → bright white slabs on a dark
card.
**Fix:** add `width`/`height` (or `aspect-ratio`) to the 47 tags — a script
over the files with the actual SVG viewBox / PNG dimensions, not by hand.
For dark mode, regenerate the SVGs from `img/RECIPES.md` with CSS-variable
colours (the live `guitar-diagrams.js` diagrams already do this) and drop the
white background, or ship `-dark` twins via `<picture>`. Do the EN/ES pairs
together.

### 4.5 Pages that ignore language or theme
- `mood-chart.html` is English-only and light-only (no `data-es`, no
  `prefers-color-scheme`). Copy `404.html`'s `gc-lang` + `data-es` pattern and
  its dark block. Every new string in both languages.
- `document.title` never changes language on `index.html` or the Journey
  pages (`404.html` is the only page that does it). Add a `title` i18n key and
  set it in `setLang()` / `journey.js`.

---

## Phase 5 — Content — ✅ DONE 2026-09-05 (both optional items approved and done)

- `module-1.js` w2 / lesson / sec0 / step4 `text_es`: the EN has three
  `<em>` (*tiny*, *toward*, *away*); the ES has two — "Si se alejó" lost its
  emphasis. Cosmetic; fix while there.
- **Optional — MC "shortest answer" tells.** checks.mjs 1h only catches the
  keyed answer being the *longest*. Four cards have it as the giveaway
  *shortest*: `m2w1-s1` practice ("A"), `m4w2-s6` practice ("On the root"),
  `m8w1` lesson sec0 step0 ("Thumb"), `m11w2-s3` practice ("vi–I–ii–IV").
  Rewrite distractors to similar length if Jonathan wants; if 2+ get
  rewritten, extend 1h to flag shortest-by-margin too.
- **Optional — long prose cards.** Five cards over ~240 chars with two or
  more imperatives and no list: `m3w2` lesson sec0 step2, `m6w3` lesson sec0
  step1, `m8w2` lesson sec0 step1, `m11w1` lesson sec0 step0 (all "Watch:"
  cards — arguably a single action, so leave unless Jonathan disagrees) and
  `class-activities.js` `ca-7` step 2 (a real two-action card — convert to
  `<ol>`, EN and ES).
- Checked and fine, don't touch: EN/ES number and URL parity across all 13
  modules (the only diffs are "+10 at a time" ↔ "de 10 en 10" and "8th
  note" ↔ "corchea"); `Set` ↔ `Unidad` is the site's i18n term; the
  "check-in" loanword in ES; the answer-less MC in `w1` (a poll, and the
  renderer handles `answer` being absent); every `DECKS` / `EAR_POOLS` card;
  the 48 `STRING_NATURALS` entries; the 18 `CHORD_DIAGRAMS`.

---

## Phase 6 — Cleanups — ✅ DONE 2026-09-05

- `app.js`: `renderChordBoxes()` is a no-op called 6×; `maybeShowApp_gamesHash`
  is a pass-through wrapper; `printSet(wid)` ignores its argument; `beep()`
  is used only by coach.js (move it or leave a comment). Delete or fold.
- `teacher.js` `renderTeacherActivities()` re-reads `config/class` on every
  sort click / rename / toggle repaint — cache the doc for the view's
  lifetime and refresh on the existing snapshot listener.
- `flushSave()` sends the whole `skills` / `responses` / `completed` maps with
  `merge:true`, so two open tabs for one student overwrite each other's keys
  on the next flush (last tab wins). Low; send only `_dirtyKeys` if it's
  cheap, otherwise note it in WORKFLOW.md and move on.
- `journey-theme.css` `.fab-track{display:inline-flex}` beats the `hidden`
  attribute `journey.js` sets when a page has no audio. Latent (every page
  has audio today) — add `.fab-track[hidden]{display:none}`.
- **`checks.mjs` 0b degrades silently.** When the render harness can't load it
  calls `warn()`, so the push still passes with the renderer untested — which
  is exactly the failure 0b exists to catch (see the Phase 1 note). Promote it
  to `problem`, or make the "harness could not load" path fail unless an
  explicit flag is passed.
- The renderer-parity check (`caStepHtml` vs `renderTeacherActivityDetail`)
  found no drift: both handle `figure`, `video`, `tab`, `drill`, `label`.
  Nothing to do; recorded so the next audit can skip it.

---

## Verification checklist (per push)

1. `node tools/checks.mjs` — full, from a local machine so the link check is
   real. New ratchets (1r contrast, 1s Journey drift, the lookbehind and
   warm-up-title guards) must be exercised once by breaking the thing they
   guard and watching them fail, as the 2026-09-02 precache ratchet was.
2. Live Server → Dev bypass → open `m12w1`, expand the fingerpicking steps at
   375 px wide: the ▶ button wraps, the BPM slider and Coach button are
   reachable (1.7). Un-mark a step: no red banner (1.1).
3. Dark mode: In-Class Activity "Mark done" button, a playing TAB's `beat-now`
   note, the current step number — all readable (3.2). Module `<select>`
   popup is dark (3.3).
4. Keyboard only: trigger a check-off gate, Tab — focus stays inside the
   dialog, Escape returns it to the step (3.1).
5. `?teacher=true` → Class activities preview still renders every activity
   (4.2 must not break `teacher.js` loading in teacher mode).
6. After pushing to `main`: `node tools/checks.mjs --live` a minute later;
   if `firestore.rules` changed, paste it into the Firebase console and
   Publish, then run one live-quiz round with a student account.
7. `CHANGELOG.md` entry for the student-facing set (phone layout, dark-mode
   buttons, focus in dialogs, faster updates), plain English, dated.


---

## What was left undone, and why

Everything else in this plan is implemented and pushed. These are the
deliberate exceptions:

- **2.1 sign-in restriction** — Jonathan's call: any Google account may sign
  in. Not a pending item.
- **4.4, themed figure art** — the 40-odd SVGs in `img/` are drawn dark-on-
  light with the background baked in. Properly theming them means
  regenerating each from `img/RECIPES.md` with CSS-variable colours (and
  keeping the EN/ES pairs in step) — a content job of its own. Interim: they
  are dimmed in dark mode so they don't glare. The CLS half (intrinsic
  width/height on all 47 figures) is done.
- **4.5, the Mood chart in Spanish** — its `DATA` block is 280 strings
  including a definition for every mood word. That is a module-sized
  translation and deserves its own session; a half-translated page would be
  the same defect the 2026-09-02 push fixed on `404.html`. Dark mode for that
  page IS done.
- **`.fret-dot.hit` / `.miss` (3.8)** — looked at and left. They differ in
  fill weight, not only hue (solid green vs pale amber), the round score is
  written out beside them, and reshaping them blind risked making the Note
  Hunt row worse. Worth Jonathan's eye in the running game.
- **`flushSave` sends whole maps (6)** — two tabs open for one student still
  last-write-wins on the next flush. Sending only the dirty keys is a real
  change to the save path and wasn't worth bundling into a cleanup commit.
- **`renderTeacherActivities` re-reads `config/class` per repaint (6)** — a
  teacher-side perf nit; the refactor needs the console open to verify.
- **The SW's offline navigation fallback** — a miss still serves
  `index.html`. Left alone: all six Journey pages are precached, so the case
  only arises for a URL that was never valid.
