# AUDIT_REPORT_2.md — Re-audit Modules 2–5 vs LOCKED S1 Assessments

> **Scope:** Modules 2–5 only. Module 1 (locked earlier, already aligned) and
> Modules 6–8 are OUT OF SCOPE. Read-only audit — no module files were changed.
> **Source of truth:** Section 0 of `SITE_ALIGNMENT_2.md` (the LOCKED Unit 2–5
> assessment wording, July 2026) for assessment language; `archive/SITE_ALIGNMENT.md`
> §0.1–0.7 for song facts, featured-core sets, BPM targets, and map-promised
> website items (those are unchanged from the first pass).
>
> **Method:** each `module-N.js` read in full by an independent auditor and
> checked on the four Session-A axes — A·1 Songs, A·2 BPM & timing, A·3 Assessment
> language, A·4 Map-promised features. Findings use the form
> `file · location · what's wrong · proposed fix`, tagged **[FIX]** (real drift
> needing an edit), **[VERIFY-OK]** (checked, matches locked wording), or
> **[LOG-ONLY]** (real but consciously deferred — not a Session-B fix).
>
> **What changed in the locked wording (vs. the proposal the site was aligned to):**
> - **Unit 4:** a NEW Task 2 (read a 1-bar pentatonic lick from TAB) is the
>   Knowledge & Reading row; naming the *scale/root* is no longer assessed
>   (phrasing-strategy naming moved into the Accuracy row).
> - **Unit 5:** teacher names **three** chords (was two); K&R simplified to
>   "name chords from an unlabelled chart" (X/O/finger-number decoding stays as a
>   taught skill, not the assessed bar).
> - **Units 2 & 3:** wording UNCHANGED — findings there are first-pass misses,
>   not new drift.
>
> **Scope decision (Jonathan, 2026-07-07):** of the three findings that are
> teaching-*coverage* gaps rather than changed-wording drift, only **M3 half
> notes** is in scope for Session B. **M3 I–IV–V naming** and **M5 Watchtower
> `Am–G–F–G` vs `Am–G–F`** are logged-only (deferred). All assessment-wording
> drift (M2 ×4, M4 ×7, M5 two→three) is in scope.

**Bottom line: 12 in-scope FIX findings across M2–M5 + 1 new M4 TAB-lick step;
2 verify-only confirmations; 1 known gap (Week-17 quiz); 2 logged-only items.**

---

## Module 2 — Notes on the E & A Strings

Unit 2 wording is unchanged from the proposal, so these four are first-pass
misses, all concentrated in the unit-end assessment *summary* blocks. The
underlying skills exist and are worded correctly (`m2w2-s4` carries the 2-bar
TAB sight-read; the rehearsal steps state 60 BPM) — only the `assessment.goal`
summary and the `MODULE_REVIEWS` list fail to mirror the locked Task 1/Task 2.

### A·1 Songs
- [VERIFY-OK] All four featured core songs present & correctly `type:'Core'`:
  Watchtower (L238/670), Seven Nation Army (L241/673 — the Session-C relabel
  from Choice held), Oye Mi Amor (L244 listen-ahead), Sweet Child (L667),
  "the cure" (L676, capo 1 Am–C–Dm–F–G/B, single-note roots ✓). Sweet Child
  half-step hint (L569) correctly stays.

### A·2 BPM & timing
- [VERIFY-OK] Every timing target is 60 BPM and ladders start at 60 as an
  explicit rung; closer (L595) states the Consistency bar ("four laps without
  stopping … every note on the click") at 60. Only the assessment *summary*
  omits the number — see A·3.

### A·3 Assessment language
- [FIX] `module-2.js` · L698 (`m2w2.assessment.goal`, Task 2) · Written as *"Name
  any 5 notes called out by the teacher on the fretboard."* Locked Task 2 is
  "Name notes on the E and A strings **through fret 12**, **and sight-read a
  short 2-bar bass line from TAB**." The 2-bar TAB sight-read is absent and the
  note-naming is looser than the locked bar. **Fix:** reword to "Name notes on
  the E and A strings through fret 12, and sight-read a short 2-bar bass line
  from TAB."
- [FIX] `module-2.js` · L698 (`assessment.goal`, Task 1) · No tempo stated.
  Locked Task 1 / Consistency require "with the metronome at **60 BPM**."
  **Fix:** add "to the metronome at 60 BPM."
- [FIX] `module-2.js` · L698 (`assessment.goal`, Task 1) · Names only Watchtower;
  the locked **"or the alternate single-note root line from 'the cure'"** option
  is missing. The cure root line exists (L632–648) but framed as a "Take It to a
  Song" challenge, not an assessment alternate. **Fix:** add the alternate to the
  goal and/or label the L632 step as the assessment alternate.
- [FIX] `module-2.js` · L736–739 (`MODULE_REVIEWS[2].assessItems`) · Lists only
  the note-naming and Watchtower-from-memory items; the **2-bar TAB sight-read**
  half of Task 2 is not surfaced (skill `m2w2-s4` L711 already defines it).
  **Fix:** add a third assessItem for sight-reading a short 2-bar bass line from TAB.

### A·4 Map-promised features
- [VERIFY-OK] Watchtower E-string bassline labeled the in-class assessment
  rehearsal (L547–548); My Practice Routine check-in present & ungraded (L210,
  L213); SNA low-E riff play-along present (L188–206, L612–629). Minor
  (unchanged, low priority): the explicit +10 tempo ladder lives on the note-run
  drills, not on the SNA steps themselves — partial, not a regression.

---

## Module 3 — Two-Finger Power Chords

Unit 3 wording is unchanged; assessment BPM/timing, songs, drills, and the
ungraded routine all check out. Two coverage gaps surfaced.

### A·1 Songs
- [VERIFY-OK] All four featured core songs present & `type:'Core'`: Watchtower
  (L247/519), SNA (L252/530), Sweet Child (L525, D5–C5–G5 standard tuning,
  half-step hint not flagged), Oye Mi Amor (L522). "Happy Birthday" now
  `type:'Supp'` "(optional)" (L250/528); "the cure" & Let It Be only as ◐
  optional-stretch (L471).

### A·2 BPM & timing
- [VERIFY-OK] Assessment piece states the full locked bar: "eight bars clean at
  60, then … **hold 80 BPM for at least 15 seconds** — that's the unit bar"
  (L394); 80/15s echoed at L395 & `assessment.goal` L551. Prior "70+ BPM"
  assessment-bar drift is fixed (L312/553/558–559); ladders route through 60.

### A·3 Assessment language
- [FIX] `module-3.js` · L382 (Clap & Count challenge) + L574–575 (skill
  `m3w2-s6`) · **Half notes omitted.** Locked Task 3 and the K&R row require
  "whole, **half**, quarter, and eighth notes." L382 names only whole/quarter/
  eighth; s6 text/gotItWhen say "whole vs. eighth" / "whole, quarter, or eighth."
  **Fix (IN SCOPE per Jonathan):** add half notes (2 beats each) to the challenge
  text, the s6 skill text/gotItWhen, and ideally the s6 practice MC so all four
  note values appear.
- [LOG-ONLY] `module-3.js` · whole module · Locked Task 2 = "three-chord
  **(I–IV–V)** progression." The module teaches three-chord progressions
  (Watchtower A5–G5–F5, Sweet Child D5–C5–G5) and reading symbols/naming chords,
  but the label "I–IV–V" appears nowhere. **Deferred** (not a Session-B fix) —
  logged for a future pass if Jonathan wants the Roman-numeral framing taught.
- [VERIFY-OK] Named strumming pattern met ("straight-eighths" named to the
  student, L383/394/564/575). The locked "or split strum" alternative is never
  offered — acceptable, since one named pattern satisfies the rubric.

### A·4 Map-promised features
- [VERIFY-OK] Oye Mi Amor **Bm5↔A5 two-shape metronome drill + ladder present**
  (L413–428, "60 → 70 → 80 BPM"); Sweet Child in-class rehearsal present &
  labeled (L431–446); My Practice Routine present & ungraded (L223–231).

---

## Module 4 — Pentatonic Solo (CHANGED wording — most drift here)

One systemic problem across every assessment-describing block: (a) naming the
**scale** (and sometimes **root**) is still treated as assessed — the locked
wording removed that — and (b) the NEW Task 2 (read a 1-bar pentatonic lick from
TAB) appears **nowhere** as an assessed K&R component or a rehearsal step.

### A·1 Songs
- [VERIFY-OK] All four featured core songs present & `type:'Core'` with correct
  pentatonic facts: Watchtower Am pent (L250), Sweet Child (L259), SNA E-minor
  pent (L263), Oye Mi Amor Bm pent Pattern 1 (L267). "Happy Birthday" correctly
  `type:'Supp'` (L514/733). Backing tracks present for all (L253–270).

### A·2 BPM & timing
- [VERIFY-OK] No invented assessment BPM. The 60-BPM Pattern-1 climb is
  explicitly "a warm-up drill — the unit assessment is your improvised solo,
  held to the backing track's pulse" (L122); assessment language says "hold the
  backing track's pulse start to finish" (L694/757/785). Correct.

### A·3 Assessment language
- [FIX] `module-4.js` · L804 (`MODULE_REVIEWS` assessItems[1]) · **Pre-identified
  #1 — CONFIRMED.** *"…and name the scale, root, and your phrasing strategy
  (call-and-response or four-phrase)."* Over-states naming (scale + root no
  longer assessed) and omits Task 2. **Fix:** describe Task 1 (solo, strategy
  named/followed within it) + Task 2 (read a 1-bar pentatonic lick from TAB);
  drop "name the scale, root."
- [FIX] `module-4.js` · L757 (`m4w3.assessment.goal`) · *"…name both the scale
  AND your phrasing strategy…"* Over-states scale naming; omits Task 2. **Fix:**
  keep solo + phrasing-strategy naming, drop "name the scale," add the TAB-lick read.
- [FIX] `module-4.js` · L758 (`m4w3.assessment.performance`) · *"State which
  scale, root, AND phrasing strategy … before playing."* Over-states scale+root;
  omits Task 2. **Fix:** reduce naming to phrasing strategy; add TAB-lick read as K&R.
- [FIX] `module-4.js` · L694 (m4w3 Challenge 3 "Perform It" — the assessment
  rehearsal step) · *"…name your scale and your phrasing strategy…"* Over-states
  scale naming, and the rehearsal step does not rehearse Task 2's TAB lick.
  **Fix:** name only the phrasing strategy; add a cold-read TAB-lick rehearsal
  here (see finding below).
- [FIX] `module-4.js` · L785 (skill `m4w3-s7` gotItWhen) · *"…name your scale and
  phrasing strategy…"* Over-states scale naming. **Fix:** name only the phrasing
  strategy.
- [FIX] `module-4.js` · L800 (`MODULE_REVIEWS` mr4-s10 self-review item) ·
  *"…naming my scale and phrasing strategy."* Over-states scale naming; no
  Task-2 reading item in the self-review list. **Fix:** name only the phrasing
  strategy; consider adding a K&R reading self-check line.
- [FIX / NEW STEP] `module-4.js` · whole module · **Pre-identified #2 —
  CONFIRMED absent.** No cold TAB-lick sight-read step exists; every `tab:` block
  (L141/182/198/214/384/478) is a pre-drilled scale/box map, not a cold 1-bar
  lick. **Fix:** add a new "Cold Read" step to **Set 3 (m4w3)**, just before
  "Perform It" (L694) — two or three short 1-bar pentatonic licks in a `tab:`
  block, read cold then played. **skillCount impact:** if the step carries a
  `skills:` array (recommended, to give Task 2 a graded anchor), bump Module 4's
  `skillCount` in `config-main.js` **20 → 21** (`tools/checks.mjs` enforces this).
- [VERIFY-OK] `module-4.js` · L439 (m4w2 Challenge 2) · **Pre-identified #3 —
  CONFIRMED, no change.** *"…one of the two phrasing strategies you'll name at
  your Set 3 assessment."* Still true under locked wording (strategy named inside
  Accuracy); does not claim naming is the K&R bar.

### A·4 Map-promised features
- [VERIFY-OK] Backing tracks for soloing over core songs present; My Practice
  Routine check-in present & ungraded (L227–233); in-class drills labeled.

---

## Module 5 — Open Chords (CHANGED wording)

### A·1 Songs
- [VERIFY-OK] All four featured core songs present & `type:'Core'`: Let It Be
  (C–G–Am–F ✓), Oye Mi Amor (D–A–Bm–G ✓, old A–D–E problem resolved),
  "the cure" (capo 1 Am–C–Dm–F–G/B ✓), Watchtower. SNA correctly demoted to
  `type:'Supp'` "◐ optional stretch · D–A–Em strummed (Week 16)" (L619). Happy
  Birthday & Sweet Child now `type:'Supp'`.
- [LOG-ONLY] `module-5.js` · L159 & L362 · Open-chord Watchtower reads
  **`Am–G–F–G`** while L616 and the reference fact say **Am–G–F**. Internal
  inconsistency, but `Am–G–F–G` is the real turnaround (may be an intentional
  simplification like Oye's D–A–G–A). **Deferred** per Jonathan — logged for a
  decision, not a Session-B fix.

### A·2 BPM & timing
- [VERIFY-OK] Assessment 70 BPM explicit: "hold 70 BPM clean (that's the
  assessment tempo)" (L313); folk strum "steady at 70 BPM" (L458–459, prior
  "60+" gap fixed); m5w3 performance "8 bars … at 70 BPM" (L650). Ladders route
  through 70.

### A·3 Assessment language
- [FIX] `module-5.js` · L650 (`m5w3.assessment.performance`) · **Pre-identified
  #4 — CONFIRMED.** *"…teacher picks **two** chords and student plays them in
  sequence at 70 BPM."* Locked Task 1 = teacher names **three** chords. **Fix:**
  two → three; keep "8 bars … at 70 BPM."
- [VERIFY-OK] `module-5.js` · L462–463 (skill `m5w2-s6`) · **Pre-identified
  #5 — CONFIRMED no-change.** *"Switch between any two chords in Group 1…"* — a
  Set-2 *switching* drill (pairwise changes), not the assessment description. No
  edit needed. (The only other "two teacher-named chords" mention in the file;
  everything else using "two chords" is generic.)
- [VERIFY-OK] X/O/finger-number decoding is presented only as taught-skill /
  Set-1 formative context (L55/180/188/910), never as THE assessed K&R bar;
  `MODULE_REVIEWS[5].assessItems` (L917–920) has no X/O decoding item. Matches
  the locked "keep as taught skill, don't make it the assessed bar" instruction.

### A·4 Map-promised features
- [VERIFY-OK] "the cure" capo-1 play-along + tempo ladder present with pre-loaded
  shapes (L375, L380–386); Let It Be in-class rehearsal labeled (L350); My
  Practice Routine present & ungraded (L131/134).
- [KNOWN GAP — out of scope] **Semester Written Check quiz module (Week 17):
  ABSENT.** No "Written Check" / "Week 17" mention anywhere; the L874/L919
  "written My Guitar Adventure reflection" is a separate ungraded self-reflection,
  not the Week-17 quiz — so there is **no inaccurate mention to correct.** Stays
  on the WORKFLOW.md roadmap as its own future task; do not fix here.

---

## Summary table

| # | Module | Check | Tag | Location | Issue → fix |
|---|---|---|---|---|---|
| 1 | M2 | A·3 | FIX | L698 goal, Task 2 | "name any 5 notes" → "E & A through fret 12 + sight-read 2-bar TAB" |
| 2 | M2 | A·3 | FIX | L698 goal, Task 1 | add "to the metronome at 60 BPM" |
| 3 | M2 | A·3 | FIX | L698 goal, Task 1 | add "the cure" single-note-root alternate |
| 4 | M2 | A·3 | FIX | L736–739 assessItems | add 2-bar TAB sight-read item |
| 5 | M3 | A·3 | FIX | L382 + L574–575 | add **half notes** to clap-and-count (whole/half/quarter/eighth) |
| 6 | M4 | A·3 | FIX | L804 assessItems | drop "name scale/root"; add Task 2 TAB lick |
| 7 | M4 | A·3 | FIX | L757 goal | drop "name the scale"; add Task 2 TAB lick |
| 8 | M4 | A·3 | FIX | L758 performance | reduce naming to phrasing strategy; add TAB lick as K&R |
| 9 | M4 | A·3 | FIX | L694 Perform It | name only phrasing strategy; add cold-read TAB rehearsal |
| 10 | M4 | A·3 | FIX | L785 m4w3-s7 | name only phrasing strategy |
| 11 | M4 | A·3 | FIX | L800 mr4-s10 | name only phrasing strategy; add K&R reading self-check |
| 12 | M4 | A·4 | FIX (new step) | Set 3 (m4w3) | add cold 1-bar-lick TAB step before "Perform It"; skillCount 20→21 if it carries `skills:` |
| 13 | M5 | A·3 | FIX | L650 performance | teacher names **two → three** chords |
| — | M3 | A·3 | LOG-ONLY | whole module | "I–IV–V" never named (deferred) |
| — | M5 | A·1 | LOG-ONLY | L159/L362 | Watchtower `Am–G–F–G` vs `Am–G–F` (deferred) |
| — | M4 | A·3 | VERIFY-OK | L439 | strategy-naming line still correct — no change |
| — | M5 | A·3 | VERIFY-OK | L462–463 | `m5w2-s6` switching drill — no change |
| — | M5 | A·4 | KNOWN GAP | — | Week-17 Written Check absent (separate roadmap item) |

**Totals:** 13 in-scope FIX findings (one of which, #12, adds a new step and a
`skillCount` bump), 2 verify-only confirmations, 2 logged-only deferrals, 1 known
gap. Session B applies findings 1–13 in order M4 → M5 → M2/M3.

---

## Verification (Session C — 2026-07-07)

Re-ran the four A-checks against the fixed `module-2.js`…`module-5.js` and
`config-main.js`. `node tools/checks.mjs` passes (22 sets valid, 253 links
reachable, SW cache version auto-bumped). Every in-scope finding is closed; the
two logged-only items and the known gap remain open as intended.

| # | Module | Finding | Status |
|---|---|---|---|
| 1 | M2 | Task 2 goal reworded to "E & A through fret 12 + sight-read 2-bar TAB" | ✅ closed (L698) |
| 2 | M2 | 60 BPM metronome added to Task 1 goal | ✅ closed (L698) |
| 3 | M2 | "the cure" single-note-root alternate added to goal | ✅ closed (L698) |
| 4 | M2 | 2-bar TAB sight-read added to `assessItems` (+ 60 BPM on the memory item; `performance` realigned) | ✅ closed (L738–739, L699) |
| 5 | M3 | Half notes added to clap-and-count (challenge text, hint, skill `m3w2-s6` text + gotItWhen; MC already listed all four values) | ✅ closed (L382–383, L574–575) |
| 6 | M4 | `assessItems[1]` drops "name the scale, root"; new `assessItems[2]` = read a 1-bar TAB lick | ✅ closed (L832–833) |
| 7 | M4 | `assessment.goal` reworded to two tasks; scale-naming dropped | ✅ closed (L782) |
| 8 | M4 | `assessment.performance` names only phrasing strategy + adds TAB-lick read | ✅ closed (L783) |
| 9 | M4 | Challenge 3 "Perform It" drops scale-naming | ✅ closed (L719 area) |
| 10 | M4 | skill `m4w3-s7` gotItWhen names only phrasing strategy | ✅ closed |
| 11 | M4 | `mr4-s10` names only phrasing strategy; new `mr4-s11` = read a TAB lick | ✅ closed (L827–828) |
| 12 | M4 | NEW cold-read TAB-lick step added to Set 3 before "Perform It"; skill `m4w3-s8` added; `skillCount` 20→21 | ✅ closed (m4w3 "Read a lick cold", L691+; `config-main.js` L35) |
| 13 | M5 | `assessment.performance` "teacher picks two chords" → "names three chords" | ✅ closed (L650) |
| — | M3 | "I–IV–V" progression never named | ⏳ LOG-ONLY (deferred, not fixed) |
| — | M5 | Watchtower `Am–G–F–G` vs `Am–G–F` inconsistency | ⏳ LOG-ONLY (deferred, not fixed) |
| — | M4 | L439 strategy-naming line | ✅ verify-only — unchanged, still correct |
| — | M5 | `m5w2-s6` switching drill | ✅ verify-only — unchanged, still correct |
| — | M5 | Week-17 Semester Written Check quiz module absent | 🔒 KNOWN GAP — separate roadmap item, no inaccurate mention to correct |

**Result: all 13 in-scope findings closed, no regressions, checks green.** Remaining
open items (2 logged-only, 1 known gap) are consciously deferred per the plan and
Jonathan's 2026-07-07 scope decision.
