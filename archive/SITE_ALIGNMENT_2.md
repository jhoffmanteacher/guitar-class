# SITE_ALIGNMENT_2.md — Re-audit Modules 2–5 against the LOCKED S1 Assessments

> **Purpose:** The S1 assessment wording for Units 1–5 is now **LOCKED** (July
> 2026). The first alignment pass (`archive/SITE_ALIGNMENT.md`, Sessions A–G,
> completed 2026-07-05) aligned the site to the *proposed* wording. This plan
> re-runs all four audit checks on **Modules 2–5** against the *locked* wording
> and fixes any drift. Module 1 (locked earlier, already aligned) and Modules
> 6–8 are OUT OF SCOPE.
>
> **How to use:** one session = one lettered item. Jonathan starts a session
> with "do Session A in SITE_ALIGNMENT_2.md." All CLAUDE.md rules apply:
> - Present a plan before editing.
> - Ask at least one multiple-choice question (AskUserQuestion) before
>   generating or overwriting any file.
> - For any bulk step-text change, show ONE complete rewritten example first
>   and ask "on the right track?" before doing the rest.
> - **Never write a YouTube ID from memory** — search-and-verify via oEmbed.
> - Run `node tools/checks.mjs` before every push.
> - If you add or remove a `skills:` entry in any `module-N.js`, bump that
>   module's `skillCount` in `MODULE_MANIFEST` (`config-main.js`) to match.
> - End every session: Live Server test with Jonathan → push → check the box
>   here and add a one-line ✅ note.
>
> **Source of truth:** Section 0 below contains the LOCKED assessment wording,
> extracted from the live Google Doc (V15 map body) on 2026-07-07 and confirmed
> by Jonathan. Claude Code has no Drive access — treat Section 0 as
> authoritative. Song facts, BPM targets, featured-core-song sets, and
> supplemental-song lists are **unchanged** from the first pass — reuse
> `archive/SITE_ALIGNMENT.md` Sections 0.1–0.5 and 0.7 for those. Only the
> assessment wording (old Section 0.6) is superseded by this file.
>
> **Important resolution note:** the Google Doc's rubric-tab "e.g." cells for
> Units 4–5 are STALE (they predate locking: they still say "names the scale
> and the phrasing strategy" and "two teacher-named chords"). Jonathan has
> confirmed the **map body text below is the locked wording** — align the site
> to it. Updating the rubric tab is Jonathan's manual Doc task, not yours; if
> he pastes updated rubric text into this repo later, don't re-litigate.

**Status legend:** [ ] not started · [~] in progress · [x] done

---

## SECTION 0 — LOCKED assessment wording (authoritative)

Rubric structure is unchanged: five rows scored 0–4, 20 pts/unit —
**Technique (Pr.4) · Tone (Pr.5) · Accuracy (Pr.6) · Consistency (Pr.6) ·
Knowledge & Reading (Pr.4)**. No Self-assessment row (the website's My
Practice Routine check-ins handle reflection, ungraded).

### 0.1 · UNIT 2 — Notes on the E & A Strings (unchanged from proposal)

**Task 1:** Play the All Along the Watchtower bass-note line on the low E
string, from memory, with the metronome at 60 BPM — or the alternate
single-note root line from "the cure."
**Task 2:** Name notes on the E and A strings through fret 12, and sight-read
a short 2-bar bass line from TAB.

**Requirements:**
- **Technique (Task 1)** — One finger per fret and thumb behind the neck, held
  throughout the line.
- **Tone (Task 1)** — Every note pressed cleanly — no buzz or dead notes.
- **Accuracy (Task 1)** — Correct notes and correct fingering from memory, all
  the way through.
- **Consistency (Task 1)** — The full line played to the metronome at 60 BPM
  without stopping.
- **Knowledge & Reading (Task 2)** — All E & A note names correct through
  fret 12; the 2-bar TAB decoded independently, no prompting.

### 0.2 · UNIT 3 — Two-Finger Power Chords (unchanged from proposal)

**Task 1:** Play a core-song excerpt to the metronome — e.g., the Seven Nation
Army riff, Oye Mi Amor's Bm5–A5, or Sweet Child's D5–C5–G5. At 60 BPM, switch
cleanly between two power chords with roots on the same fret of the E and A
strings, then hold 80 BPM for 15 seconds.
**Task 2:** Play a three-chord (I–IV–V) progression by reading from chord
symbols / TAB, using a named strumming pattern — straight-eighths or split
strum — and identify power-chord names from a chord chart.
**Task 3:** Clap and count a 4-bar rhythm using whole, half, quarter, and
eighth notes.

**Requirements:**
- **Technique (Tasks 1–2)** — Two-finger shape with index + ring; unused
  strings muted by the fretting hand throughout.
- **Tone (Tasks 1–2)** — Both chord notes ring clean — no buzz; muted strings
  stay silent.
- **Accuracy (Tasks 1–2)** — Correct roots and shapes on every change; the
  I–IV–V progression correct with the named strumming pattern applied.
- **Consistency (Tasks 1, 3)** — Changes land on beat 1 at 60 BPM; 80 BPM held
  for the full 15 seconds; the 4-bar rhythm clapped and counted accurately.
- **Knowledge & Reading (Tasks 2–3)** — Power-chord names correct from the
  chart; the progression read from chord symbols / TAB; the strumming pattern
  named; whole, half, quarter, and eighth notes identified.

### 0.3 · UNIT 4 — Pentatonic Solo (CHANGED from proposal — read carefully)

**Task 1:** Perform an original 4-bar solo over a teacher-chosen course-song
backing track (drawn from the six core songs) using the full minor pentatonic
box, including at least one hammer-on, pull-off, or vibrato.
**Task 2:** Read a short 1-bar pentatonic lick from TAB and play it.

**Requirements:**
- **Technique (Task 1)** — At least one hammer-on, pull-off, or vibrato
  executed cleanly and audibly inside the solo.
- **Tone (Task 1)** — Notes ring clean, including the high strings — no buzz
  or dead notes.
- **Accuracy (Task 1)** — The solo stays inside the minor pentatonic box,
  keeps its 4-bar form, and follows the named phrasing strategy
  (call-and-response or four-phrase).
- **Consistency (Task 1)** — The solo stays at the backing track's tempo — no
  restarts.
- **Knowledge & Reading (Task 2)** — The pentatonic lick is played accurately.

**What changed vs. the proposal the site was aligned to:**
1. **Task 2 is new** — a 1-bar pentatonic lick sight-read from TAB. It IS the
   Knowledge & Reading row now.
2. Strategy-naming moved: it lives inside **Accuracy** ("follows the named
   phrasing strategy"), not K&R. Students still name their strategy, but
   "name the scale / root" is no longer an assessed component.

### 0.4 · UNIT 5 — Open Chords (CHANGED from proposal — read carefully)

**Task 1:** Play open chords at 70 BPM with clean changes — teacher names the
**three** chords.
**Task 2:** Perform one core open-chord song from memory — Let It Be
(C–G–Am–F), Oye Mi Amor (D–A–Bm–G), or "the cure" (capo 1, Am–C–Dm–F–G/B) —
plus one student-choice song.
**Task 3:** Identify chords from an unlabelled chord chart.

**Requirements:**
- **Technique (Tasks 1–2)** — Arched fingers and thumb behind the neck, held
  through the 8-bar progression and the full song.
- **Tone (Tasks 1–2)** — All intended strings ring on every chord — no buzz or
  unintentional muting on the new shapes.
- **Accuracy (Tasks 1–2)** — Correct shapes for the **three** teacher-named
  chords; both songs played from memory with correct chords throughout.
- **Consistency (Tasks 1–2)** — The 8-bar progression at 70 BPM with changes
  in time; the full song performed without stopping.
- **Knowledge & Reading (Task 3)** — Chords are named correctly.

**What changed vs. the proposal the site was aligned to:**
1. Teacher names **three** chords, not two (Tasks 1 + Accuracy).
2. K&R simplified to "chords named correctly from an unlabelled chart" (the
   X/O/finger-number decoding language moved out of the assessment wording —
   it remains a taught skill, so existing Set 1 chart-reading steps stay; just
   don't present X/O/finger-number ID as *the assessed bar*).

### 0.5 · Pre-identified findings (from the chat-side diff, 2026-07-07)

Confirm these during Session A rather than rediscovering them; also verify
nothing else drifted. If the live file text differs from what's predicted
here, **flag it — don't silently fix**.

| # | File | Location (approx.) | Issue | Expected fix |
|---|---|---|---|---|
| 1 | `module-4.js` | Unit-assessment description near line 804: "…and name the scale, root, and your phrasing strategy (call-and-response or four-phrase)" | Doesn't match locked wording — omits Task 2 (TAB lick), over-states the naming requirement | Rewrite to match Section 0.3: solo (Task 1, strategy followed/named within it) + 1-bar pentatonic lick read from TAB (Task 2) |
| 2 | `module-4.js` | Whole module | **No prep step anywhere for the Task 2 TAB-lick sight-read** | Add a short sight-read prep step/challenge (Station C-style: a couple of 1-bar pentatonic licks in TAB, read cold, then play). Placement: the set that carries the assessment rehearsal. If this adds a `skills:` entry, bump Module 4's `skillCount` in `config-main.js` |
| 3 | `module-4.js` | Line ~439: "…one of the two phrasing strategies you'll name at your Set 3 assessment" | Still TRUE under locked wording (strategy is named inside Accuracy) | Verify only — likely no change |
| 4 | `module-5.js` | Performance line near 650: "teacher picks two chords and student plays them in sequence at 70 BPM" | Locked wording: teacher names **three** chords | Change two → three; keep 8 bars @ 70 BPM |
| 5 | `module-5.js` | Skill `m5w2-s6` (~line 463): "teacher names any two chords from C, G, Am, F…" | This is a *switching* skill (changes happen between two chords at a time), not the assessment description | Verify only — likely no change; flag if the surrounding copy presents it as the unit assessment |

**Out of scope (do not do in this plan):**
- Week 17 Semester Written Check quiz module — stays on the WORKFLOW.md
  loose-ends list as its own future task. (Session A should still log whether
  Module 5 *mentions* the Written Check accurately, per the archived plan's
  A·4 check.)
- Module 1 and Modules 6–8.
- Google Doc rubric-tab cleanup (Jonathan's manual task).
- Supplemental/Choice song list polish.

---

## SESSION A — Re-audit (NO file edits)

**Output:** `AUDIT_REPORT_2.md` at repo root. One `## Module N` section per
module (2–5), findings grouped under the four checks below, one line each:
`file · location · what's wrong · proposed fix`. End with a summary table.
Use `archive/AUDIT_REPORT.md` as the format model.

Re-run all four checks from the archived plan, against the LOCKED wording:

### A·1 Songs
Featured core songs per module match `archive/SITE_ALIGNMENT.md` §0.2; ◐ songs
appear only as clearly-optional stretch; song facts match §0.7 (chords, keys,
tunings — Sweet Child stays standard tuning; Oye Mi Amor D–A–G–A turnaround is
a settled simplification, do NOT flag it).

### A·2 BPM & timing targets
Assessment-facing numbers and "you've got it when" bars match §0.4 of the
archived plan (M2: 60 BPM · M3: 60 / hold 80 for 15 s · M4: no invented BPM,
"holds the backing track's pulse" · M5: 70 BPM); each tempo ladder passes
through the rubric tempo as an explicit rung.

### A·3 Assessment language ← the check most likely to find drift
Every place a module describes, rehearses, or references the unit-end
assessment must match Section 0 of THIS file (locked wording). Grep targets:
`assessment`, `rubric`, `teacher`, `from memory`, `phrasing strategy`,
`gotItWhen`, "You've got it when", set/module review text, and each module's
unit-assessment description block. Echo the substance, not necessarily
verbatim — but numbers (BPM, chord counts, fret ranges, bar counts) and task
structure must be exact.

### A·4 Map-promised website features
▹ WEBSITE items per §0.5 of the archived plan are present and correctly
labeled; ▸ IN-CLASS rehearsal drills labeled as such; every module's My
Practice Routine check-in present and described as ungraded self-reflection.

- [x] **Session A** — run the re-audit, write `AUDIT_REPORT_2.md`, push
      (doc-only), Jonathan reviews before Session B.
      ✅ 2026-07-07: four parallel per-module auditors re-ran all four checks
      against the locked wording; wrote `AUDIT_REPORT_2.md` (13 in-scope FIX
      findings, 2 verify-only, 2 logged-only, 1 known gap). Beyond the
      pre-identified list it caught 5 extra M4 "name-the-scale" over-statements,
      4 M2 assessment-summary misses, and M3 half-notes coverage. Scope
      confirmed with Jonathan (M3 half notes IN; M3 I–IV–V + M5 Watchtower
      turnaround LOG-ONLY).

---

## SESSION B — Fix pass (Modules 2–5)

The expected fix list is small (Section 0.5), so one session should cover all
four modules unless the audit surfaces more. Order: M4 → M5 → M2/M3 (verify).

Rules for the fix pass:
- Work from `AUDIT_REPORT_2.md`, not from memory.
- The new M4 TAB-lick prep step: show the complete drafted step to Jonathan
  (AskUserQuestion: "on the right track?") before inserting it. Reuse the
  module's existing inline-TAB step pattern; no new audio/video links needed —
  if you do add a video, search-and-verify via oEmbed, never from memory.
- If a `skills:` entry is added/removed, update `MODULE_MANIFEST` in
  `config-main.js` in the same commit (`checks.mjs` enforces this).
- `node tools/checks.mjs` before push; changelog entry only if the change is
  student-visible (the new M4 sight-read step qualifies).

- [x] **Session B** — apply fixes, Live Server test with Jonathan, push.
      ✅ 2026-07-07: applied all 13 in-scope fixes — M4 (6 "name-the-scale"
      over-statements removed + new "Cold Read" 1-bar-lick TAB step, skill
      `m4w3-s8`, review item `mr4-s11`, `skillCount` 20→21); M5 two→three
      chords; M2 assessment summary + `assessItems` realigned (60 BPM, "the
      cure" alternate, 2-bar TAB sight-read); M3 half notes added to
      clap-and-count. New M4 step is inline TAB (no video). `checks.mjs` passed.

---

## SESSION C — Verification pass

- [x] **Session C** — re-run the four A-checks against the fixed modules;
      append a `## Verification` section to `AUDIT_REPORT_2.md` confirming
      each finding closed (or listing anything still open); push. Then update
      `WORKFLOW.md`: mark the "Full website review" item's
      assessment-alignment portion done and move this file to `archive/` when
      Jonathan says the plan is complete.
      ✅ 2026-07-07: verification table appended to `AUDIT_REPORT_2.md` — all 13
      in-scope findings closed, no regressions, `checks.mjs` green. WORKFLOW.md
      updated (assessment-alignment sub-item done; 2 logged-only deferrals added
      to loose ends). **Ready to move to `archive/` on Jonathan's word.**
