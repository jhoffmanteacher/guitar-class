# RESEARCH_UPGRADES.md — Build the 5 High-Priority Research Recommendations

> **Source:** July 10, 2026 research of 10 guitar-tutorial platforms (JustinGuitar, Fender
> Play, Yousician, GuitarTricks, JamPlay, TrueFire, Marty Music, Andy Guitar, Paul Davids,
> Rick Beato), synthesized and cross-checked against this curriculum. Full report:
> https://claude.ai/code/artifact/f9bda5b8-cdf2-4da2-9768-5da73cd856cc
>
> **Model:** Claude (any current model). **Run sessions sequentially (A → G), one per
> sitting** — except Session G, which is three sittings (G1/G2/G3). (Sessions A–E are the
> five research recommendations; F and G are Jonathan's additions — F gives the existing
> rubric/checkbox self-assessment visual + audio feedback; G adds a mic-based "Listening
> Coach" that hears the student play and checks it, corroborated by Yousician's core loop.) Each session ends with `node tools/checks.mjs`, Live Server verification, a
> commit, and a push. All CLAUDE.md rules apply.
>
> ⚠️ **DO NOT START until Jonathan confirms the other in-flight website update has landed.**
> First action of Session A: `git pull`, confirm a clean `git status`, then re-verify every
> "Anchor check" below with grep. **Line numbers are never to be trusted** — another process
> has been editing this repo; greps and ids are the only valid anchors. If an anchor check
> fails or the structure has diverged from what a session assumes, HARD STOP and report.

---

## Assumptions made in this plan (veto any before Session A)

1. **Sessions are independent** and could run in any order, but A → E is the intended
   sequence (A is pure app-side rendering, no content risk; E touches the most module data).
2. **No new skills are added to Modules 1–8.** Semester 1 skill trees and skillCounts stay
   frozen; everything added there is station *content* only (steps, not skills).
3. **New skills ARE added to Modules 9, 10, 11** (Set 0 re-tests; blues cluster). Those
   modules launched July 2026 — it is summer break, so student progress against them should
   be zero. Session B/E must still verify: if Firestore shows real student completions on
   m9/m10/m11 skills, pause and confirm with Jonathan before changing those modules' shape.
4. **Response keys are index-based** — `${setId}-${station}-${stepIndex}` (verified in
   app.js July 2026, `respHtml` key construction). Therefore: **new steps are ALWAYS
   APPENDED at the END of a station's `steps` array** — never inserted before existing
   steps, or every later step's stored responses shift onto the wrong step. Re-verify this
   key scheme at execution time (grep app.js for `` `${w.id}-${ns}-${i}` ``); if the site
   has moved to id-keyed steps, this constraint relaxes — note it in the session report.
5. **Set order within a module is safe to change** (sets are keyed by `id`, not index), so
   Session B may place Set 0 first in module-9.js's SETS pushes.
6. **No new shell files.** Everything renders from app.js/index.html/config-main.js data so
   the service-worker cache list doesn't grow; checks.mjs auto-bumps CACHE_VERSION.

---

## Hard guardrails (every session)

- **NEVER modify any existing `id:` or `skills:` entry in Modules 1–8.** Firebase progress
  is keyed to them. Station steps in 1–8 may be appended (end of array only, per
  Assumption 4). Modules 9–12 may gain new skills per this doc, never lose or rename any.
- **`skillCount` in MODULE_MANIFEST (config-main.js) must equal the real set-level skill
  count after every session.** Session B: module 9 → 24. Session E: module 10 → 19,
  module 11 → 20. checks.mjs enforces this; fix config-main.js when flagged, don't bypass.
- **Every YouTube URL — new or reused — is oEmbed-verified live at execution time**
  (`curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json"`,
  HTTP 200, quote the title in the session report). NEVER write an ID from memory; search,
  then verify. If no verifiable video fits a slot, use the VIDEO-TODO placeholder pattern
  from MODULES_9_12.md instead.
- New skill ids follow the house scheme (`m{N}w{n}-s{m}`) and must match that module's
  `skillIdRe` in MODULE_MANIFEST (they do: `m9w0-s1`, `m10w2-s7`, `m11w3-s7` all match).
- MC `answer` fields are **0-based indexes** into `choices`, per house convention.
- `node tools/checks.mjs` must pass before every push. Test in Live Server (or
  `python3 -m http.server`): open every touched set, zero console errors, dropdown and
  progress strip render, spot-check one untouched module still loads.
- **CHANGELOG.md** gets a student-facing entry per session (all five are student-visible).
  **WORKFLOW.md** gets a technical log entry per session.
- **HARD STOP** if checks fail, an anchor check fails, a reused URL 404s, or anything
  would require renaming an existing skill id. Report and wait for Jonathan.

---

## SESSION A — "10-Minute Routine" cards + "Daily 5" bell-ringer
*(from JustinGuitar's per-module Practice Routine pages, Andy Guitar's level-capstone
routines, Marty Music's daily bootcamp, Paul Davids' printable companions)*

**Anchor checks:** `grep -n "MODULE_REVIEWS" app.js | head` (review render fn exists) ·
`grep -l "My Practice Routine" module-*.js` (weekly check-in lives in Modules 1–5 — it
STAYS, untouched) · `grep -n "playSeq" app.js | head` (playSeq player exists).

**Build 1 — routine generator (app.js).** A pure function `buildModuleRoutine(moduleNum)`
that assembles, from the module's already-loaded SETS data, an ordered ~10-minute routine:

1. *Tune up* — 1 min (fixed text, links the existing tuner).
2. *Finger Gym* — 1 min, one warm-up from the WARMUP_BANK (below), rotated by
   `moduleNum % bank.length`.
3. *Skill drill* — 3 min: the module's **last set's first playSeq step** (deterministic
   "hardest drill" heuristic — latest material). Fall back set-by-set backward if the last
   set has no playSeq.
4. *Chord / scale work* — 3 min: the first step in the module with a `chords:` spec; if
   none (Modules 2, 4, 9, 10), the module's **first** playSeq instead.
5. *Song* — 2 min: the most recent "Take It to a Song" step's text (grep steps whose text
   starts with/contains 'Take It to a Song').

Render it as a card at the TOP of each Module Review view, styled like existing cards,
with a **print stylesheet** (`@media print` — card only, black on white) so it can be
printed or screenshotted. It regenerates from live Set data, so future content edits
propagate automatically. Pilot check: Module 6 first, then click through all 12.

**Build 2 — WARMUP_BANK (config-main.js).** Three content-independent dexterity warm-ups,
verbatim (playSeq format, all at bpm 60):

- `'Spider walk — 1-2-3-4 up two strings'` — notes `[41, 42, 43, 44, 46, 47, 48, 49]`
  (low E frets 1–4, then A frets 1–4; one finger per fret).
- `'Stretch walk — 1-3-2-4 on the low E'` — notes `[41, 43, 42, 44]` (frets 1-3-2-4,
  fingers 1-3-2-4; slow, no rushing).
- `'Open-string skip picking'` — notes `[40, 50, 45, 55, 50, 59, 55, 64]` (E→D, A→G,
  D→B, G→e; alternate picking, right hand only).

These are conditioning, not speed — say so in the step text ("slow and even beats fast
and sloppy").

**Build 3 — "Daily 5" panel (app.js + index.html).** A small button near the module
dropdown opens a panel showing today's 5-minute bell-ringer for the student's current
module: tuning check (1 min) + one WARMUP_BANK item + one playSeq from the current module,
both rotated by day-of-year so the whole class sees the same drill on the same day.
Teacher projects it at Station A while circulating. Keep it read-only — no Firebase writes.

**Build 4 — Winter Break 15-Day Challenge (config-main.js data + rendered in the Daily 5
panel between semesters).** `WINTER_CHALLENGE`: 15 one-line, 5-minute items bridging
Modules 8→9, verbatim:

1. Tune by ear from the low E, then check with the tuner.
2. One-minute changes: C→G. Write down your number.
3. Fingerpick p-i-m-a over Am for two minutes straight.
4. Play the Seven Nation Army riff from memory.
5. Spider walk warm-up, then name the notes at every dot fret on the low E.
6. D-DU-UDU over G–C–D until it feels automatic.
7. One-minute changes: your two hardest chords. Beat Tuesday's number.
8. Play the Luna F–Am vamp — two downbeat strums per bar, count "1-2".
9. Pentatonic Pattern 1, ascending and descending, slow.
10. Power-chord riff day: Smoke on the Water or Seven Nation Army as power chords.
11. Fingerpick the Let It Be progression (C–G–Am–F), thumb on bass.
12. Read a 4-bar TAB you've never played (any Song Journey page, new section).
13. One-minute changes: barre F → C. Any number is a win.
14. Play along with any core-song video at 0.75× speed, full pass.
15. Perform one full song for someone at home. That's the whole day.

**Close-out:** checks.mjs → Live Server (routine card renders on ALL 12 module reviews;
Daily 5 rotates correctly when the date changes — test by stubbing the date in DevTools) →
CHANGELOG ("Every module now ends with a ready-made 10-minute practice routine…") +
WORKFLOW → commit `Session A — 10-Minute Routine cards + Daily 5 bell-ringer` → push →
report.

---

## SESSION B — Semester 2 "Catch-Up Set 0" + placement self-check
*(from Andy Guitar's no-new-material consolidation levels, JamPlay's leveled entry
triage, TrueFire's skill assessment)*

**Anchor checks:** `grep -n "id: 'm9w1'" module-9.js` · `grep -n "num: 9" config-main.js`
(manifest row, currently `skillCount: 18`) · confirm summer-zero progress per Assumption 3.

**Build 1 — Set 0 in module-9.js**, pushed FIRST so it renders before Set 1. `id: 'm9w0'`,
label/title `'Set 0'`, subtitle `'Welcome back · Prove it, don\'t re-learn it'`, objective
`'I CAN show that Semester 1\'s core skills survived the break — and see exactly which ones
need a tune-up.'`, `locked: false`, `comingSoon: false`. **Zero new material**: six re-test
skills whose `gotItWhen` criteria are **copied verbatim** from the original Semester 1
skills (grep each source module for the current text at execution time):

- `m9w0-s1` — `'RE-TEST: Switch C → G → Am → F smoothly at 60 BPM'` (source: Module 5)
- `m9w0-s2` — `'RE-TEST: Play D-DU-UDU over a G–C change at 70 BPM'` (source: Module 6)
- `m9w0-s3` — `'RE-TEST: Play pentatonic Pattern 1 up and down at 60 BPM'` (source: Module 4)
- `m9w0-s4` — `'RE-TEST: Move a two-finger power chord E5 → G5 → A5 on the beat'` (source: Module 3)
- `m9w0-s5` — `'RE-TEST: Read and play a 4-bar TAB you haven\'t seen before'` (source: Module 2)
- `m9w0-s6` — `'RE-TEST: Fingerpick p-i-m-a over Am without stopping'` (source: Module 8)

Station B for Set 0 is the **"Where do I start?" self-check**: six MC-free `short`-response
steps, one per re-test, phrased as the original gotItWhen turned into a question ("Can you
still play a clean C→G change at 60 BPM — yes, shaky, or gone?"), plus one wrap-up
("Which one re-test do you most need Station A time on?"). Station C: warm-up tuning check,
then one step per re-test pointing at the original module's drill (reuse existing playSeq
specs by copying them — e.g. Pattern 1 notes from module-4.js), each framed "clear it and
mark the skill; struggle and flag it for Station A."

Set 0's `assessment.goal`: students clear all six in one class period OR leave with a
named tune-up list. `performance`: 'Six-station speed round: demo each re-test to a
partner; teacher verifies flagged ones.' `standards`: `['Pr.4a','Pr.5a','Pr.6a']`.

**Build 2 — manifest.** `skillCount: 18` → `24` for num 9 in config-main.js.

**Build 3 — mid-year/transfer surfacing.** In the Module 1 and Module 9 review/intro area
(content-only), one line pointing transfer students and January arrivals at Set 0 as the
placement check ("New to the class, or back from break? Start with Module 9, Set 0.").
Skip any Firebase pre-flagging UI — the teacher already sees the skill tree and Module
Review 1–3 self-ratings; do not build new write paths this session.

**Close-out:** checks.mjs (manifest count!) → Live Server (Set 0 renders first in Module 9;
Sets 1–3 unchanged; skill tree shows 24 for Module 9) → CHANGELOG + WORKFLOW → commit
`Session B — Module 9 Set 0: welcome-back re-tests + placement self-check` → push → report.

---

## SESSION C — "Ear Spark" micro-drills, Modules 2–8
*(from JustinGuitar's parallel ear/theory strands, Yousician's Knowledge-from-Level-0)*

**Anchor checks:** response-key scheme (Assumption 4) — this session appends steps to
LIVE Semester 1 modules, so the append-only rule is load-bearing. Verify each target
module's Station C `steps` array ends with its wrap-up before appending after it.

**Build:** ONE text-only step (no `response` field — zero Firebase surface) **appended at
the very end of Station C's steps** in each of Modules 2–8. Two minutes, partner-based,
flagged optional. Verbatim step text (adjust only if a module's Station C phrasing style
demands it; keep each under ~3 sentences):

- **M2:** `'⚡ Ear Spark (optional, 2 min): Partner plucks one OPEN string while you look
  away — name it. Three rounds each. Thickest to thinnest is E-A-D-G-B-e; your ear learns
  them faster than you\'d think.'`
- **M3:** `'⚡ Ear Spark (optional, 2 min): Partner plays either a power chord (E5) or the
  full open E major — you say "power" or "full." Power chords are hollow — no major/minor
  color. Three rounds each.'`
- **M4:** `'⚡ Ear Spark (optional, 2 min): Partner plays ONE note on the low E, frets 0–5.
  Sing it back, hold the note, then find it on the same string. Singing first is the whole
  trick — three rounds each.'`
- **M5:** `'⚡ Ear Spark (optional, 2 min): Partner strums C or Am without showing you —
  bright or moody? That\'s major vs minor, and you can already hear it. Three rounds,
  then swap.'`
- **M6:** `'⚡ Ear Spark (optional, 2 min): Partner claps one bar of any strum rhythm from
  this set — clap it back exactly, then play it as muted strums. Rhythm echo is ear
  training too.'`
- **M7:** `'⚡ Ear Spark (optional, 2 min): Partner plays F as the mini-F or the full barre —
  same chord, different voice. Guess which. Listen for the low bass note only the barre has.'`
- **M8:** `'⚡ Ear Spark (optional, 2 min): Partner fingerpicks Am and leads with thumb on
  either the A string or the D string — say which string the bass note was. Low vs high
  bass is a fingerpicker\'s first ear skill.'`

No skills, no manifest changes, no MC answers — content-only appends. These pay off in
Modules 10–11, whose existing content is NOT touched this session.

**Close-out:** checks.mjs → Live Server (open each touched Station C; confirm existing
steps' saved responses still line up — spot-check with Dev bypass) → CHANGELOG + WORKFLOW →
commit `Session C — Ear Spark micro-drills, Modules 2–8` → push → report.

---

## SESSION D — Second-voice videos, play-along steps, performance-first ordering
*(from JamPlay's multi-instructor coverage, Fender Play's bite-size play-alongs,
TrueFire's drill-with-the-instructor sessions and performance-first Essentials)*

This is the research-heavy session: every new URL is **search-found then oEmbed-verified**
(never from memory), per CLAUDE.md. Budget most of the sitting for video vetting.

**Policy (add to CLAUDE.md, short):** in each Station B video pair, aim for video #2 from
a **different instructor** than video #1, teaching the same skill. Same-channel pairs are
allowed when the alternative is a worse video — quality beats variety.

**Retrofit slots, in priority order** (verify each set id exists before editing; replace
only video #2 of a pair unless the slot is a VIDEO-TODO, which can take any verified fit):

1. **Module 12 requinto set** — a Latin/sierreño-specialist channel for the requinto-style
   picking slot. Search terms: "requinto guitar lesson", "sierreño guitar tutorial",
   "corridos tumbados guitar lesson". Also fill any remaining VIDEO-TODO from the
   MODULES_9_12 build if a verified fit exists.
2. **Modules 8 + 12 fingerstyle** — a dedicated fingerstyle teacher (candidates to search:
   Adam Rafferty, Tommy Emmanuel lessons, GuitarZero2Hero fingerstyle) for one slot each.
3. **Module 11 theory sets** — Paul Davids: 'Understanding CHORDS' (Ep. 3) and 'What
   chords sound good together?' (Ep. 7) — both oEmbed-verified live 2026-07-10 during
   research; re-verify and pull the IDs fresh via search, do not trust this doc.
4. **Module 10 ear-training set** — a short Rick Beato (or comparable) ear-training primer
   as video #2 of the m10w3 pair.
5. **Module 6 strumming** — an Andy Guitar strum-along as the play-along pilot (below).

For each swapped pair, retarget ONE existing comprehension MC (or append one step, per the
append-only rule) at the difference between the two teachers' explanations — e.g. `MC: The
two videos teach the same pattern differently. Video 2's teacher counts it as: | ... |`.
Write these per house MC style at execution time.

**Watch-range convention:** every Station B video over ~5 minutes gets an assigned range
in its step text ('watch 0:00–4:30'), as Modules 4 and 9 already do. Sweep Modules 10–12
first, then any Semester 1 stragglers. Text-only edits.

**Play-along step type (pilot, 2 places):** append one step to Station C of Module 6's
D-DU-UDU set and Module 12's Travis set: `'Play-along: set the lesson video to 0.75×
speed and strum/pick along for the ENTIRE demo section without stopping. Got it when you
finish a full pass with the video — flubbed changes and all, don\'t stop.'` (No new skills;
appended steps only.)

**Performance-first ordering:** in Module 12's sets and Module 8 Set 3, if both video
slots are filled, order video #1 = full performance, video #2 = breakdown, and point the
"Listen for…" step at the performance. ⚠️ Reordering steps changes response indexes
(Assumption 4) — so DO NOT swap step positions; instead swap the **URLs and step texts**
in place so the step order (and indexes) stay fixed.

**Close-out:** checks.mjs WITH the full link check (no --skip-links — new URLs!) →
Live Server → CHANGELOG + WORKFLOW (list every URL with its oEmbed-verified title) →
commit `Session D — second-voice videos, play-alongs, performance-first` → push → report.

---

## SESSION E — 12-bar blues form & shuffle feel
*(the most-corroborated gap: flagged by 6 of 10 platforms)*

**Anchor checks:** `grep -n "id: 'm11w3'" module-11.js` · `grep -n "id: 'm10w2'" module-10.js`
· `grep -n "12-bar" module-4.js module-10.js` (the two existing touchpoints that assume
the form: M4's Choice-list jam item, M10's levelUp) · manifest rows for 10 and 11.

**Build 1 — Module 11, Set m11w3 (I–IV–V movable barre set): the form itself.**
Two new skills appended to the set's skills array:

- `m11w3-s7` — `'Comp a 12-bar blues in A with shuffle feel (A7–D7–E7)'` — gotItWhen:
  `'You can play all 12 bars from memory at 60 BPM with a long-short shuffle strum, without
  losing your place in the form.'`
- `m11w3-s8` — `'Explain and play the quick-change and the turnaround'` — gotItWhen:
  `'You can say what bar 2 does in a quick-change blues and land the E7 turnaround in bar
  12 without stopping.'`

Station B: **append** (end of steps array) one Watch step — search-and-verify a beginner
12-bar-blues-shuffle lesson (candidates to search: JustinGuitar "blues shuffle BC", Marty
Schwartz "12 bar blues for beginners", Andy Guitar "blues shuffle"; tier-3 VIDEO-TODO if
nothing verifies) with `skills: ['m11w3-s7']` — plus two appended MCs:

1. `MC: A standard 12-bar blues in A uses which three chords? | A7, D7, E7 / A, Bm, C# /
   A7, C7, G7 / Am, Dm, Em | answer: 0 | explain: It\'s the I, IV, and V of A — each wearing
   a bluesy 7th. You already know I–IV–V from this set; the blues just gives it a form.`
2. `MC: "Shuffle feel" means the eighth notes are played: | Perfectly even / Long-short,
   like a heartbeat / As fast as possible / Only on downbeats | answer: 1 | explain: Swing
   the pair — DAH-da DAH-da. Even eighths make it rock; long-short makes it blues.`

Station C: **append** three steps —
1. Chord specs (house format):
   `{ name: 'A7', chord: [[6,'x'],[5,0],[4,2,'2'],[3,0],[2,2,'3'],[1,0]], position: 0 }` ·
   `{ name: 'D7', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,1,'1'],[1,2,'3']], position: 0 }` ·
   `{ name: 'E7', chord: [[6,0],[5,2,'2'],[4,0],[3,1,'1'],[2,0],[1,0]], position: 0 }`.
2. The bar map step, text verbatim: `'The 12-bar map in A: A7 A7 A7 A7 | D7 D7 A7 A7 |
   E7 D7 A7 E7. Say each chord name OUT LOUD on beat 1 as you strum the bar — losing the
   form is the #1 blues mistake, and counting bars aloud is the fix. Quick-change variant:
   play D7 in bar 2.'`
3. Turnaround + apply step: comp the full form with shuffle feel at 60 BPM; partner solos
   over it with A minor pentatonic (their Module 4/10 box at fret 5) — then swap.

Add ONE assessItem to `MODULE_REVIEWS[11].assessItems` (content-only append): `'Comp a
12-bar blues in A with shuffle feel while a partner solos — then trade.'`

**Build 2 — Module 10 foreshadow, Set m10w2 (blues-scale set).** One new skill appended:

- `m10w2-s7` — `'Solo with the blues scale over a 12-bar blues loop, following the form'`
  — gotItWhen: `'You can hear the chord changes coming and land on a strong note when the
  loop returns to the I chord.'` — practice: playSeq `'A blues scale, box 1 (loop-ready)'`
  bpm 60, notes `[45, 48, 50, 51, 52, 55, 57]` (reuse the existing m10w2 blues-scale spec —
  grep and copy the current notes verbatim rather than trusting this line).

Station C of m10w2: **append** one step pointing the existing levelUp at the now-real form:
`'Jam it: loop the 12-bar form (your teacher or a partner comps A7–D7–E7 — the full map
lives in Module 11, Set 3) and solo over it with box 1. One chorus each, then swap.'`

**Build 3 — manifest.** config-main.js: module 10 `skillCount` → `19`, module 11 → `20`.

**Close-out:** checks.mjs (two manifest counts + link check for the new video) →
Live Server (m10w2 and m11w3 render, skill trees show 19/20, M4 and M10 existing text
untouched) → CHANGELOG ("You can now actually PLAY the blues — the 12-bar form your blues
scale was waiting for…") + WORKFLOW → commit `Session E — 12-bar blues form & shuffle feel`
→ push → report (oEmbed titles quoted).

---

## SESSION F — Visual + audio self-assessment feedback (rubric & checkboxes)
*(Jonathan's addition. Corroborated by Yousician's instant feedback loop and Fender
Play's completion celebrations — the one thing every app platform has that a static
site doesn't: the site reacting when you assess yourself.)*

**The idea:** the self-assessment surfaces already exist — skill checkboxes with
`gotItWhen` rubric text, the Module Review's 1–3 ratings, and the Module Assessment
checklist. Right now they're silent form controls. This session makes them *respond*:
a small synthesized sound vocabulary and micro-animations for individual checks, and a
deterministic **feedback card** that turns a student's rubric ratings into plain-English
coaching ("these two skills are your Station A list — here's the target for each").
No AI, no mic analysis — pure functions over data the student already entered.

**Anchor checks:** `grep -n "function toggleSkill" app.js` (skill checkbox handler) ·
`grep -n "function setSkillLevel" app.js` and `grep -n "function setPerformanceLevel" app.js`
(review rating handlers) · `grep -n "mr-assess-list" app.js` (assessment checklist currently
renders as a plain `<ul>`) · `grep -n "function playNote" app.js` (Karplus-Strong plucked-
string synth — the audio engine to reuse) · `grep -n "sk-helper" app.js` (hidden
"You've got it when:" rubric helper per skill).

**Build 1 — feedback sound engine (app.js).** One function `playFeedback(kind)` next to
the metronome/audio block, reusing `playNote(midi)` (the existing plucked-string synth —
it already sounds like a guitar, which beats any beep). **Synthesized only — NO audio
files**, so the service-worker cache list doesn't grow (Assumption 6 holds). Vocabulary:

- `'working'` — one soft E4 (midi 64): acknowledged, not celebratory.
- `'gotit'` — rising major third, C5→E5 (midis 72, 76, ~120ms apart): small win.
- `'rate1'` / `'rate2'` / `'rate3'` — single note that rises with the level
  (G4 / B4 / D5 — midis 67, 71, 74): the rating *sounds* like what it means.
- `'setDone'` — ascending C major arpeggio C5-E5-G5-C6 (midis 72, 76, 79, 84,
  ~120ms apart): every skill in a set checked "got it."
- `'reviewDone'` — the same arpeggio plus a held high C: module review fully rated.

Rules: fire ONLY from click handlers (browser autoplay policy — `playNote` already
resumes a suspended context, verify that survives); keep multi-note kinds under ~700ms;
add a 🔊/🔇 **mute toggle** near the module dropdown persisted in
`localStorage['fbSound']` (a device-level preference — deliberately NOT Firebase/progress;
zero new write paths from this build). Default: sound on.

**Build 2 — visual feedback layer (styles.css + app.js).**

1. **Check pulse:** a brief scale-up/glow keyframe on the `.skbox` when a skill flips to
   "got it," and on `.mr-rb` rating buttons when selected. Wrap ALL new animation in
   `@media (prefers-reduced-motion: reduce)` so it disables cleanly.
2. **Rubric tie-in:** when a student marks a skill **"Still working on it"**, auto-expand
   that skill's hidden `sk-helper` ("You've got it when: …", id `gi-${s.id}`) — the rubric
   target appears exactly when the student admits they're not there yet. Marking "got it"
   leaves the helper alone.
3. **Set completion moment:** when `toggleSkill` flips the LAST unchecked skill of a set
   to "got it," show a one-time inline banner in that set ("🎉 Set complete — every skill
   checked!") and fire `playFeedback('setDone')`. **Recompute from existing state** — do
   not store a new "celebrated" flag anywhere; showing it once per page render is fine.

**Build 3 — Module Review feedback card (app.js).** A pure function
`buildReviewFeedback(mr)` reading ONLY existing progress keys (per-skill 1–3 ratings +
performance level), rendered below the rating legend and re-rendered on every
`setSkillLevel` / `setPerformanceLevel` call. Until every skill is rated it shows a
neutral progress line ("Rated 4 of 8 — keep going"). Once complete:

- **Got it (3s):** count + one congratulating line.
- **Almost there (2s):** skill names, one encouraging line ("one focused practice away").
- **Focus list (1s):** each skill by name with its existing "↩ Review this" link, plus —
  where the source skill has `gotItWhen` (grep the module's SETS at execution time to map
  review-skill → source skill) — one line: `Target: {gotItWhen}`. This is the rubric doing
  the coaching, verbatim, no invented advice.
- **All 3s:** celebratory variant + `playFeedback('reviewDone')` — fired from the rating
  click that completed it, never on render.

Zero new Firebase keys — the card is 100% derived. Tone guide: coach, not judge ("your
Station A list," never "you failed these").

**Build 4 — Module Assessment checklist becomes checkable (app.js + styles.css).** The
`mr-assess-list` items ("check the recording against these skills") become tappable
checkbox rows styled like the skill checklist. State saves to a new progress key
`mr{N}-assess` as an array of booleans **indexed by item position**. ⚠️ This is the
session's ONE new Firebase write path — document it in WORKFLOW.md, and it creates a new
standing guardrail: **from this session on, `assessItems` arrays are append-only** (same
index-shift hazard as Assumption 4; Session E's blues assessItem lands before this, so
sequence order matters). All items checked → got-it pulse + one line: "Checklist clear —
you've verified every skill on the recording." Locked review panels stay read-only
(respect `isReviewPanelLocked`, as every other save path does).

**Explicitly out of scope** (don't gold-plate): mic-based pitch/rhythm *scoring* of the
student's playing (that's a Yousician-scale project — the tuner stays the only mic
feature), confetti libraries or any external asset, teacher-facing dashboards, and
sounds on ordinary navigation clicks. Feedback fires on self-assessment actions only.

**Close-out:** checks.mjs (`--skip-links` is fine — no URLs this session) → Live Server
with Dev bypass: sounds fire only on clicks and respect the mute toggle across reloads;
reduced-motion kills animations; feedback card is correct at zero / partial / complete /
all-3s ratings; assessment checkboxes survive a reload; locked reviews stay inert; one
untouched module spot-checked → CHANGELOG ("The site now responds when you check off a
skill — sounds, celebrations, and a personal focus list built from your own ratings…") +
WORKFLOW (note the `mr{N}-assess` key and the new assessItems append-only rule) → commit
`Session F — visual & audio self-assessment feedback` → push → report.

---

## SESSION G — "Listening Coach": the site hears you play and checks it
*(Jonathan's addition — the Yousician core loop, scoped honestly for a static site.
Three sittings: G1 engine + Note Coach, G2 Rhythm Coach, G3 Chord Coach experiment.
Run AFTER Session F — the Coach reports its results through F's feedback UI and sounds.)*

### What's honestly buildable (read before starting)

**Listening = YES, in tiers.** The site already does real-time pitch detection —
`tuner.js` captures the mic via `getUserMedia` and runs Harmonic Product Spectrum +
YIN (`detectPitchHPS` / `detectPitchYIN`, verified July 2026). Everything below builds
on that engine. Reliability tiers, best → worst:

1. **Single notes in sequence** (scales, riffs, spider walk) — solid. The tuner already
   does this for one note; the Coach just checks a *series* against a target.
2. **Rhythm/timing** (strums on the beat) — moderate. Onset detection (energy jumps) is
   simple DSP; it hears *when* you hit, not *what* you hit — muted strums work fine.
3. **Chord recognition** — genuinely hard (polyphonic). A chroma / pitch-class-profile
   match can tell apart a small open-chord vocabulary, but it's experimental: G3 ships
   behind honest confidence gating or not at all.

**Watching = NO.** Judging fretting-hand form from a webcam is research-grade computer
vision. In-browser hand tracking exists (MediaPipe), but on school Chromebook cameras,
at student desk angles, it would deliver *confidently wrong* feedback — worse than none.
Do not build camera-based judgment. The honest substitute ships in G1: extend the
existing Record Yourself widget to **video**, so the student (or Jonathan) is the vision
system, guided by Session F's rubric checklist ("watch your recording and check each
item"). That's the same watch-yourself loop Yousician can't do and teachers do best.

**Privacy is the selling point, state it in the UI:** all analysis is on-device Web
Audio. No audio or video ever uploads — same as the tuner today. (Recordings stay
in-memory per the existing Record Yourself design; keep it that way.)

**Classroom reality:** a room of 20 guitars defeats any mic. The Coach is a
practice-room / at-home / one-station tool. Every Coach UI gets one fixed line:
*"Works best somewhere quiet, guitar close to the mic."* Feedback phrasing is
Session F's coach-not-judge tone, and a low-confidence result always says
"I couldn't hear that clearly — try again closer to the mic," never a wrong verdict.

**Prerequisite:** fix the tuner jitter first (see Known issues below — smoothing,
confidence gating, hysteresis). The Coach reuses the same detection path, so that fix
is G's foundation, not a separate chore.

**Anchor checks (each sitting):** `grep -n "detectPitchYIN\|detectPitchHPS" tuner.js` ·
`grep -n "getUserMedia" tuner.js` · `grep -n "playSequenceFromGroup" app.js` (playSeq
buttons carry `data-midis` — the ready-made answer key) · `grep -n "renderRecBody" app.js`
(Record Yourself widget) · `grep -n "playFeedback" app.js` (Session F landed) ·
`grep -n "metroRunning" app.js` (metronome, G2's timing grid).

### G1 — shared engine + Note Coach + video self-review

**Build 1 — `coach.js` (new file).** ⚠️ Amends Assumption 6: a new shell file. Add it to
the sw.js cache list AND a `<script>` tag in index.html; checks.mjs auto-bumps
CACHE_VERSION. Contents: mic capture + a note-event segmenter on top of the tuner's
detection — volume gate (ignore below threshold), stable-pitch window (~100ms of
agreeing readings = one note event, the same smoothing that fixes the tuner), emits a
stream of `{midi, timeMs, confidence}`. Share one AudioContext with app.js; never run
Coach and tuner mics simultaneously (one `getUserMedia` owner at a time).

**Build 2 — Note Coach on playSeq drills.** Next to every existing "▶ Play tab /
Play all" button, a `🎤 Check me` button (the step's `data-midis` is already the answer
key — zero content changes). Flow: count-in click → student plays the sequence at their
own pace → Coach matches heard note-events to expected midis in order. Results render
per-note (green ✓ / red ✗ on a horizontal strip mirroring the playSeq layout) plus one
plain-English line: "7 of 8 — your 4th note came out F instead of F♯ (fret 2, not 1)."
**Compare pitch-class first, octave second** — HPS octave errors are the classic failure;
an octave-off correct note counts as correct, with a small note. 3-clears-in-a-row gets
Session F's `setDone` arpeggio. No Firebase writes in G1 — results are in-the-moment
coaching, not stored grades.

**Build 3 — video self-review.** Extend Record Yourself with a camera toggle
(`getUserMedia` video+audio → same in-memory MediaRecorder path, playback + Download,
nothing uploaded). Under playback, render Session F's assessment checklist with one new
intro line: "Watch yourself like a coach would — check each item you SEE and HEAR."
This is the "watching" feature, honestly built.

**Close-out G1:** checks.mjs (cache list grew — verify the bump) → Live Server: Note
Coach on Module 4's Pattern 1 and Session A's spider walk (the pilot pair); wrong-note,
missed-note, and too-quiet cases all give sane feedback; tuner still works after a Coach
session (mic handoff) → CHANGELOG + WORKFLOW → commit `Session G1 — Listening Coach:
note checking + video self-review` → push → report.

### G2 — Rhythm Coach

Onset detector in coach.js (energy-flux with a refractory window — a strum is one onset,
not six). UI on strumming-pattern steps (pilot: Module 6 D-DU-UDU set): metronome plays
4 bars at the step's bpm, student strums along (muted strums encouraged — pitch is
ignored), Coach compares onset times to the click grid. Verdict per beat (early / on it /
late, ±60ms window to start — tune against real playing) plus one summary line: "You're
rushing beat 3 — that's the D-DU turnaround. Slow the bpm and lock it." Down/up
direction is NOT detectable from audio — never claim it; count onsets only.
**Close-out G2** mirrors G1 (pilot Module 6, then Module 12 Travis set) → commit
`Session G2 — Rhythm Coach` → push → report.

### G3 — Chord Coach (experimental — may honestly fail)

Chroma-profile matcher in coach.js: FFT magnitudes folded into 12 pitch classes,
matched against templates for a fixed vocabulary — start with exactly C, G, Am, F
(the Module 5 one-minute-changes set). UI: "Play C… hold it… ✓ heard it" on chord steps.
Gate hard on confidence: below threshold → "couldn't hear that clearly," NEVER a wrong
chord name. **Go/no-go rule:** test against real guitar recordings (Jonathan plays each
chord 10×, clean and sloppy); if accuracy on clean strums is under ~90%, ship G3 as
"E vs A vs D string-set drone check" (much easier) or not at all, and say so in the
report. A feature that guesses wrong gets deleted, not shipped.
**Close-out G3** as above → commit `Session G3 — Chord Coach (or documented no-go)` →
push → report.

**Explicitly out of scope for all of G:** camera-based technique judgment (see above),
full-song scoring, stored per-attempt grades in Firebase (revisit only after the Coach
has earned trust in class), background listening (mic runs only while a Check is active,
with a visible indicator), and any external ML library — if vanilla DSP can't do it,
the tier ships smaller or not at all; a vendored-library decision goes to Jonathan.

---

## After Session G

All five high-priority research items plus the self-assessment feedback layer (F) and
the Listening Coach (G) are live. The remaining medium/low recommendations
(stored One-Minute-Changes scores, tempo-ladder playSeq, Song Journey anatomy sections,
fretboard trainer game, bends, 7th/sus chord color, songwriting capstone, Choice-song
style lanes, motivation layer) stay in the research artifact for a future round — do not
start them without Jonathan's go-ahead.

---

## Known issues (not part of Sessions A–E — needs its own pass)

- **Tuner is jumpy** (noted 2026-07-10): the needle/readout jitters instead of settling on
  a steady pitch, which makes it hard for students to trust. Likely fixes to investigate in
  `tuner.js`: smooth the detected pitch over several analysis frames (rolling median or
  average), ignore low-confidence/low-volume readings instead of displaying them, and add a
  small hysteresis so the display doesn't flicker between adjacent readings. Improving this
  matters for Session A too — the 10-Minute Routine and Daily 5 both start with a tuning
  step that leans on the tuner.
