# OPUSPLAN — Follow-ups from the 2026-09-07 review of the audit work

Work order for a Claude Code session to execute. Source: a review of every
commit on `main` from `d0e3dfa` (2026-09-04, Journey tab-card restyle) through
`e93d299` (2026-09-08, Games-button fix) — the 15 commits that implemented
`OPUSPLAN-site-audit-2026-09-05.md`. The review re-read every diff, ran the
full checks locally (link check included), walked the site in a real Chrome
at 375 px and in dark mode, drove the live teacher console, and put three
adversarial agents on the CSS, the content/Spanish, and the new checks.mjs
ratchets. Every item below was then confirmed by hand against the repo at
`e93d299` — nothing here is an unverified agent claim.

**How to run this plan**

- Work top to bottom. Phase 1 is student-facing; push it on its own. Phases
  2–5 can each be their own push.
- **Line numbers are from `e93d299` — grep for the symbol, don't trust the
  number.**
- Before every push: `node tools/checks.mjs` (full, with links). Student-
  facing changes get a `CHANGELOG.md` entry, same push.
- Where an item says **ratchet**, add or extend the detector in
  `tools/checks.mjs` in the same edit. The checks.mjs work is Phase 4;
  Phase 1's ratchets may land with Phase 4 if that is cleaner, but Phase 1's
  pixels must not wait on them.
- **Verify every nav control from a COLD load** (a fresh profile, no
  `coach.js` / `teacher.js` in memory), by *clicking the button*, not by
  setting the hash. The Games button shipped broken on 2026-09-05 and the
  headless walk missed it because it navigated through `#games`, which goes
  through the lazy loader. `checks.mjs` 1u now guards inline handlers in
  `index.html`, but nothing guards a template literal in `app.js`.
- Phase 3 and two items in Phase 2 need Jonathan's call — use
  `AskUserQuestion` when you reach them.

**Already verified, do not redo:** the full link check (180 reachable, titles
match); `--live` (deploy `64fef330a3` confirmed); all 47 module figure
`width`/`height` values against the real files; all 27 `kind:'tuning-warmup'`
tags; every reworded MC's `answer` index still correct in EN and ES; the five
overlays' focus-in / Tab-trap / focus-return / `inert`; un-marking a step in
dev bypass raises no banner; 375 px overflow is zero in m1, m5, m12 and the
Luna Journey page; every `color:var(--bg)` swap is byte-identical in light
mode; the Journey `<title>` swaps language; the Mood chart follows `gc-lang`
and is fully translated (136/136 words, 94/94 definitions); the live teacher
console lazy-loads `teacher.js`, renders 40 students, sorts the Class
activities table both ways from memory with no "Loading…" flash, and opens /
cancels a rename without a re-read.

---

## Phase 1 — Student-facing defects

### 1.1 Mood chart: two things are invisible in dark mode — **ratchet**
**Where:** `mood-chart.html` — the dark block (`@media(prefers-color-scheme:dark){ :root{…} }`,
line ~35) redefines the four `--*-tint` backgrounds but **not** the four
`--*-dark` text tokens (`--dyn-dark:#32433d`, `--tempo-dark:#4a3b36`,
`--rhythm-dark:#493a3f`, `--texture-dark:#4b3c23`, defined at lines 21–24).
**What happens (measured in Chrome, dark):**
- `.pop .hear` (line ~121, `color:var(--rhythm-dark)`) — the "Hear it /
  Escúchalo" YouTube link in all 24 Rhythm popovers — is **1.40:1** on
  `--card:#272724`. That link is the popover's whole point.
- `.cell.dyn .cat` / `.tempo` / `.rhythm` / `.texture` (lines ~138–141, inside
  `@media (max-width:900px)`) — the column labels every phone shows — are
  **1.25–1.26:1** on the dark tints.
Both are new: the page had no dark block before 2026-09-05.
**Fix:** in the dark `:root`, redefine the four `--*-dark` tokens as light
tints of each column colour (e.g. the light-mode `--dyn:#a8decb` family works
as text on `--dyn-tint:#26332e`; check each ≥ 4.5:1). While there, the three
`rgba(0,0,0,…)` hairlines (`.crumb a` box-shadow line ~60, `.pop` line ~110,
`.moodgroup` line ~133) vanish on dark — swap for a `--hairline` token that
flips.
**Ratchet:** 1s reads only `styles.css` (`checks.mjs` ~634). Extend it to
`tabs/journey-theme.css` and to the inline `<style>` of `mood-chart.html` and
`404.html`, each against its own `:root` + dark block. The Journey sweep will
also surface `.btn-translate.active` (`journey-theme.css:81`) at **4.15:1**
dark (`--brand #8f85e8` on `--bg3 #313130`) — fix that too. Details of what
1s must also learn are in 4.1.

### 1.2 A class activity points at a figure that has never existed — **ratchet**
**Where:** `class-activities.js:145` `figure: 'img/ca-0915-powerchords.svg'`.
`ls img/ca-0915*` is empty and `git log -- img/ca-0915-powerchords.svg` is
empty — it dates to the original In-Class Activities commit. Every other
`figure:` on the site resolves. Pre-existing, not from the audit, but it is a
broken image in a student-facing card.
**Fix:** open that activity, decide whether the card needs a figure at all;
if yes, draw it from `img/RECIPES.md` (EN/ES pair if it carries text); if
no, delete the `figure:` line. Both renderers (`caStepHtml` in `app.js`,
`renderTeacherActivityDetail` in `teacher.js`) read it — nothing to patch if
the path just changes.
**Ratchet:** every `figure:` value and every `<img src="img/…">` in shipped
JS/HTML must exist on disk. `checkPrecacheCoverage` already walks "every
referenced img/ file" (42 checked) and missed this one — find out why
(probably it only walks module files and HTML, not `class-activities.js`)
and close the gap rather than adding a parallel walker.

### 1.3 Journey pages: "More about this song" lost its open/close triangle
**Where:** `tabs/journey-theme.css:95` `.crumb a,.songmap-more summary{position:relative;display:inline-block}`
(the 3.5 tap-target halo). A `<summary>` draws its native disclosure marker
only at `display:list-item`; the rule turned it into bare text with no
affordance (verified on `tabs/luna.html`: computed `display:inline-block`,
no marker box). `.fold summary` (line ~153) avoids this by setting
`list-style:none` and drawing its own `+`/`−`.
**Fix:** drop `display:inline-block` from that rule — `position:relative`
is enough for the `::after` halo, and `.crumb a` is a flex item whose
display is blockified anyway (the declaration is dead there). Or give
`.songmap-more summary` the same `+`/`−` treatment as `.fold summary`.

### 1.4 Touch underline lands on the finger circles
**Where:** `styles.css:1091–1093` `@media (hover:none){ .tab-note-btn{text-decoration:underline dotted;…} }`.
`.tab-note-btn.has-finger` (line ~1099) is the 30 px Finger Gym circle
showing a fretting-finger numeral, not a note name — it now gets a dotted
underline under the digit on every phone.
**Fix:** `.tab-note-btn:not(.has-finger)` in that rule.

### 1.5 The live-quiz "Later" button's tap halo is app-only
**Where:** `styles.css:2126` adds `.lq-invite-later` to the 44 px halo group
(`position:relative` + the `::after` at 2131); `tabs/journey-theme.css:279`
carries its own `.lq-invite-later` and got nothing. CLAUDE.md: the invite
modal's CSS is mirrored on the Journey pages — **restyle both or neither**.
1t is green because of the two holes described in 4.2.
**Fix:** mirror the halo into `journey-theme.css`.

### 1.6 `.tab-body` still drifts at ≤ 480 px
**Where:** `tabs/journey-theme.css:194` `@media (max-width:480px){ … .tab-body{padding:8px 10px 10px} … }`
has no counterpart in `styles.css` (one `.tab-body` rule, line 1020, no
media override). Plan 3.4 listed this as drift to reconcile; the new comment
at `journey-theme.css:127–132` says "only two" deliberate differences.
**Fix:** either add the same override to `styles.css` (the app's TAB cards
are just as cramped on a phone) or delete it from journey. Then 4.2 makes 1t
see one-sided media rules.

---

## Phase 2 — Content

### 2.1 m4w2-s6: the keyed answer is still the shortest choice
**Where:** `module-4.js:826` practice MC — `'On the root of the key'` (22 chars)
vs next-shortest 28; ES `'En la raíz de la tonalidad'` (26) vs 30. It escapes
1h on the floor (ratio 1.27 / diff 6). This is the one of the five 2026-09-05
rewrites where the stated goal was not met.
**Fix:** even the lengths, EN and ES. Keep `answer: 1` pointing at the root.

### 2.2 m2w1-s1: the rewrite dropped the only misconception distractor
**Where:** `module-2.js:366` — `'It starts over at C'` became a bare `'C'`.
The old option named the actual student error (thinking the alphabet wraps
after G#); a bare `C` is dismissible on sight, and the `explain` still
discusses only `G#`. The length tell is gone; the question got easier.
**Fix (Jonathan's call — AskUserQuestion):** (a) keep the four plain letters
and extend `explain` (EN+ES) with one sentence on why C is wrong — the
alphabet only starts over after G; or (b) restore a misconception option and
pad the others to similar length. Recommend (a).

### 2.3 m11w2-s3: `explain` names an option by position in a shuffled MC
**Where:** `module-11.js:571–572` "Fair warning on the last option: i–III–iv–VI…" /
"sobre la última opción". `mcSeed()` hashes the choice text, so the
2026-09-05 rewording re-rolled the display order: the option was shown
*third* before and is shown *fourth* now — the sentence is right by luck,
and any future word change re-rolls it again.
**Fix:** name it by content — "the i–III–iv–VI option" / "la opción
i–III–iv–VI".

### 2.4 Mood chart Spanish — six small things
All in `mood-chart.html`'s ES tables (lines ~200–460). No native speaker has
read this page; these were found by an adversarial Spanish pass.
- line ~428 `"Jagged"`: `…con jabs y giros repentinos` — `jabs` is English.
  → `con golpes secos y giros repentinos`.
- line ~429 `"Chopped"`: `como rasgueos con la palma apagando` is off-glossary
  and awkward; the site's settled term (10× in the modules) is
  `silenciado con la palma`. → `como rasgueos silenciados con la palma`.
- line ~418 `"Off-beat"`: EN says "the reggae upstroke 'and'"; ES lost both
  the upstroke and the counting syllable. → `— el rasgueo hacia arriba del
  reggae, en el "y" de la cuenta`.
- Title/intro (`"El ánimo y cómo se construye"`, `"Elige un ánimo…"`) vs the
  button that opens the page, `i18n.js:219` `'nav.moodChart'` →
  `'Tabla de estados de ánimo'`. Bare *ánimo* also reads first as
  encouragement. → `El estado de ánimo y cómo se construye` / `Elige un
  estado de ánimo`, and the `<title>` twin.
- `"Gentle": "Suave"` (Peaceful specifics) and `"Soft": "Suave"` (Dynamics)
  both render in the Peaceful row, where English shows two words. Give
  Gentle a different word (`Delicado`, `Apacible` is taken).
- **Jonathan's call:** Texture adjectives are feminine (*Abierta, Fluida,
  Densa* — agreeing with *la textura*) but Dynamics adjectives are masculine
  (*Parejo, Lleno, Ligero*) though *la dinámica* is also feminine. Defensible
  if the implied noun is *el sonido*; inconsistent between adjacent columns.
  One decision, then apply it to the whole column.

### 2.5 Record, don't fix: the m8w1 graded-MC rewrite orphaned nothing
`module-8.js:47–56` changed the choice strings of a **graded** `response:`
MC (`'Index finger'`→`'Index'` etc.). Graded MCs persist the English choice
**text**, so any stored pick with the old string would render as "answered,
nothing selected". Checked on the live roster 2026-09-07: **zero** students
have any `m8*` response key (the furthest anyone has reached is Module 1,
Set 2), so no migration is needed. Add one line to CLAUDE.md's "Quiz answers"
rule: rewording a graded MC's choices after students reach it orphans their
stored picks — reword before they get there, or map old→new in the renderer.

---

## Phase 3 — Dark-mode figures: the split is on the wrong axis (Jonathan's call)

**Where:** `styles.css:398–399`
```
.step-figure img{filter:brightness(0.86) contrast(1.04)}
.step-figure img[src$=".svg"]{filter:invert(1) hue-rotate(180deg) brightness(1.06)}
```
The comment says the `.jpg` hand shots and the m13 PNGs are photographs that
"must NOT be inverted — inverted skin is ghastly". **There are no photographs
in `img/`.** All 12 raster files were opened: `m2-*.jpg`, `m6-*.jpg`,
`m7-barre-hand-front.jpg` are Jonathan's pencil sketches on white paper
(MEMORY records the m7 one); `posture-check.jpg` is black line art; the eight
`m13-step-*.png` are ink line drawings on cream. Under the current rule each
renders as a large near-white slab (`#fff × 0.86 ≈ #dbdbdb`) on the `#1e1e1c`
card — exactly the glare the block claims to remove.

**Ask (AskUserQuestion):** (a) invert everything — line art and pencil both
read as chalk-on-slate, which is usually fine; (b) invert the ink/line-art
(`posture-check.jpg`, `m13-*.png`) and keep the pencil sketches dimmed;
(c) leave as is. Recommend trying (a) with Dev bypass in dark mode and
looking at `m2w1` (pencil), `m13` (ink) and `m1w2` (SVG) before deciding.

Whichever way: `styles.css:378` gives every figure `background:#fff` and a
`var(--border2)` border, and `filter` inverts those too — the inverted SVGs
sit as pure-black slabs with an invisible border, which is not what the
comment ("let the border carry the edge") says. In the dark block set the
inverted figures' `background` to something that inverts back to the card
colour, or drop the background there.

Also, the CLS pass stopped at module data: `caStepHtml()` (`app.js`) and
`renderTeacherActivityDetail()` (`teacher.js`) both emit
`<img src="${escAttr(step.figure)}" alt="">` with no dimensions for the ten
`img/ca-*.svg` class-activity figures. Add `width`/`height` from the SVG
viewBox in **both** renderers (two-renderer rule). **Ratchet:** an `<img` in
module data or `class-activities.js` without `width`/`height` fails.

---

## Phase 4 — checks.mjs: the new ratchets have holes

Each was proved by breaking the guarded thing in a scratch worktree and
watching the check stay green. Fix, then re-prove the same way.

### 4.1 1s (contrast) — `checkContrast`, ~line 630
- **Dark block regex is fragile and its failure is unreachable.** Line ~641
  demands `@media(prefers-color-scheme:dark){` with zero spaces; `styles.css`
  happens to write it that way at line 50, but line 950 already uses the
  spaced form, and because `dark` is spread from `light` the "no dark
  palette" guard can never trip. Reformatting line 50 silently turns 1s into
  a light-only check. Tolerate whitespace; **fail** if no dark `:root` block
  is found.
- **Comments are not stripped** before the rule regex, so a preceding
  `/* … */` becomes part of the selector — `CONTRAST_ALLOW` can't match it
  and the error text prints the comment. `cssRuleMap` (line ~709) already
  strips; reuse it.
- **Blind to `@media` context**, both ways: a dark-only rule is checked
  against the light palette (false positive — `journey-theme.css:189`
  `.fab-track` is that shape), and a dark override that fixes a base rule is
  never seen (false negative). At minimum: evaluate rules inside a
  `prefers-color-scheme:dark` block only against the dark palette.
- **Three silent false negatives:** `color:#fff!important` (parses to null),
  `background:var(--x, #fallback)` (split on whitespace before `resolve()`),
  and `rgb()` / `hsl()` values (only `#hex`, `white`, `black` parse). Also
  colour and background declared in separate rules for the same selector are
  never paired.
- **Scope:** only `styles.css`. Extend to `tabs/journey-theme.css` and the
  inline `<style>` in `mood-chart.html` and `404.html` (see 1.1).

### 4.2 1t (Journey drift) — `cssRuleMap` / `JOURNEY_ALLOWED_DIFFS`, ~line 700
- `JOURNEY_ALLOWED_DIFFS = new Set(['.tab', '.tab-head'])` exempts those two
  rules **in full**; the documented exceptions are one property each
  (`margin-bottom` on `.tab`, `--tab-head-bg` on `.tab-head`). Changing
  `.tab-head`'s `padding` in journey stays green. Exempt per property.
- `cssRuleMap` is last-write-wins per selector (`out.set(sel, body)`), so a
  selector that appears in two rules (the tap-target add-on at
  `styles.css:2126` and the full rule at 2588) keeps only the last body —
  which is why 1.5 is invisible. Merge declarations per selector.
- `bare()` (line ~742) strips a media prefix non-greedily to the first `)`,
  so a compound query (`… and (max-width:…)`) leaves junk and the rule is
  skipped silently. Strip greedily to the last `)` before the selector.
- One-sided media rules (a selector present only inside a media block on one
  side — 1.6) are skipped; flag them.

### 4.3 0b (render smoke test) — `renderCheck`, ~line 1940
- The promotion to `problem` covers "harness could not load" but the second
  path — harness loaded, `!sets.length || !buildSet` — is still `warn()`.
  Renaming `buildSet` leaves the push green. Promote it.
- The load-failure path does `err(); problems++; … warnings++` — double
  counted ("2 problems found, 1 warning" for one failure). And the block
  comment above still says the harness "reports … as a WARNING rather than
  failing the push". Fix both.

### 4.4 Lookbehind / syntax check — step 0, ~line 1905
- Only `SHELL_FILES` ending in `.js` are scanned, so the inline `<script>`
  blocks in the six `tabs/*.html`, `404.html` and `mood-chart.html` are
  neither `node --check`ed nor lookbehind-scanned — and a shared Journey link
  is exactly where an older iPhone lands. Extract inline scripts and run both
  checks over them.
- The comment-skip (`/^\s*(\/\/|\*|\/\*)/`) is line-shape based: a trailing
  `// (?<=` comment on a code line false-positives; a lookbehind inside a
  block-comment line that doesn't start with `*` too. Strip comments
  properly (a small tokenizer, or reuse whatever the i18n scan uses).

### 4.5 1q (Journey tab cards) — ~line 772
`/<div class="tab">([\s\S]*?)<\/pre><\/div>/` is an exact match on the opening
tag, so a card with any extra attribute becomes invisible and the total drops
from 63 to 62 with no failure. Match `<div class="tab"[^>]*>`, and **pin the
per-page card counts** (or the 63 total) so a card can't vanish silently.

### 4.6 1r (tuning warm-up) — `checkTuningWarmupTag`, ~line 269
Changing the title *and* removing the tag in one edit passes both branches —
which is precisely the state where `isTuningWarmupSection()` stops filtering
and every later progress key in that set shifts. Pin the expected count (27
today) so the total can't drop without a deliberate edit to the check.

### 4.7 sw.js precache checks — ~lines 1682 / 1701
The `ASSETS` regex (`'\.\/([^']+)'`) never captures `'./'` while the
`PRECACHE_CRITICAL` one does and special-cases it, so `'./'` in the critical
list is never verified against `ASSETS`. Use one regex. Also the two `ok()`
lines share the `bad` counter with earlier loops, so an unrelated failure
suppresses a true "criticals fine". Separate counters.

### 4.8 1h margin note
Current tree passes with 0 cards firing, but `m12w3-s4` EN sits at 57 vs 44
chars, ratio **1.2954** against a 1.30 threshold — one character from failing
the next push that touches it. Even it up now (EN+ES) so a future copy edit
doesn't fail a push for an unrelated reason.

---

## Phase 5 — Low / cosmetic, batch together

- `404.html:23–24` — the two new icon `<link>`s are document-relative and
  bypass the page's own base-fixing script (`#nf-css` / `#nf-home`, line
  ~29), so a nested 404 (`/guitar-class/tabs/typo.html`) requests
  `tabs/icon-192.png`. Give them ids and rewrite them the same way.
- No `<link rel="manifest">` on any of the eight standalone pages. Plan 4.3
  asked for it; the other four head tags landed. Either add
  `<link rel="manifest" href="../manifest.json">` (scope `./` resolves to the
  root fine) or drop "manifest" from the intent — low either way.
- `tabs/journey-theme.css:183` comment says journey.js "sets `.hidden`" (reads
  as a class); `journey.js:321` sets the attribute. The CSS is right; fix the
  comment.
- `tabs/journey-theme.css:95` `display:inline-block` on `.crumb a` is dead
  (flex item) — goes away with 1.3.

---

## Verification checklist (per push)

1. `node tools/checks.mjs` — full, local. Every ratchet touched in Phase 4
   gets re-proved by breaking the guarded thing in a scratch worktree.
2. **Cold-load click test** (fresh Chrome profile, DevTools → Application →
   unregister SW, clear storage): Dev bypass, then *click* Games, Songs,
   Class activities, Mood chart, a Listening Coach ▶, a Shuffle deck start,
   the Daily 5 bolt — no console error, no "Something went wrong".
3. Dark mode: Mood chart on a phone width (column labels readable, "Hear it"
   link visible in a Rhythm popover); Luna Journey page ("More about this
   song" has a triangle; Español button in its active state readable); a
   figure in `m2w1`, `m13` and `m1w2` after Phase 3.
4. Touch (DevTools device mode): a Finger Gym TAB — note names underlined,
   finger circles not.
5. `?teacher=true` → Class activities → an activity with a figure: the
   figure has intrinsic size (no layout jump) in both the console preview and
   the student card.
6. After pushing to `main`: `node tools/checks.mjs --live` a minute later.
7. `CHANGELOG.md` for Phase 1 (Mood chart in dark mode, the missing figure,
   the Journey triangle) and Phase 3 if the figures change.

---

## Still open from `CHECK-BEFORE-YOU-TRUST-IT-2026-09-05.md`, for Jonathan

These need a person, not a session; they were not closed by this review:

- **One live-quiz round with a student account** now that the rules are
  published. The rules as pasted were not compared byte-for-byte to the
  repo's `firestore.rules` by this review — the CodeMirror-hash recipe in
  MEMORY does that.
- A **thumb on a real phone** for the wrapped ▶ buttons, the drawer dock
  under Safari's bar, and the dotted note-name underline.
- A **Spanish speaker's skim** of the Mood chart (2.4 fixes the six things a
  machine found; tone and word choice still need an ear).
