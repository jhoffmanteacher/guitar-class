# SITE_ALIGNMENT.md — Website ↔ Curriculum Map V15 + S1 Rubrics (V1)

> **Purpose:** Bring the website's Modules 1–5 into alignment with the Semester 1
> curriculum map (V15) and the proposed S1 Assessment Rubrics (V1). Audit first,
> fix second. Modules 6–8 are OUT OF SCOPE for this plan.
>
> **How to use:** one session = one lettered item. Jonathan starts a session with
> "do Session A in SITE_ALIGNMENT.md." All CLAUDE.md rules apply to every session:
> - Present a plan before editing.
> - Ask at least one multiple-choice question (AskUserQuestion) before generating
>   or overwriting any file.
> - For any bulk step-text change, show ONE complete rewritten example first and
>   ask "on the right track?" before doing the rest.
> - **Never write a YouTube ID from memory** — search-and-verify via oEmbed.
> - Run `node tools/checks.mjs` before every push.
> - End every session: Live Server test with Jonathan → push → check the box and
>   add a one-line ✅ note.
>
> **Source of truth:** Section 0 below is extracted verbatim-in-substance from the
> live Google Doc (V15 map + "Sem 1 Assessments/Rubric" tab) on 2026-07-05.
> Claude Code has no Drive access — treat Section 0 as authoritative. If Jonathan
> says the map or rubric has changed since, stop and ask him for the update.
>
> **Rubric wording status:** the assessment wording in Section 0.6 is the
> PROPOSED revision (Units 1–5), not yet locked. Jonathan has approved aligning
> the site to it now. If he later locks different wording, re-run only the
> language checks (A-items #3) — the song/BPM work will not change.

**Status legend:** [ ] not started · [~] in progress · [x] done

---

## SECTION 0 — Reference data (authoritative for this plan)

### 0.1 · Core song thread — SIX songs (V15)

The core thread is **six** songs. *Just Like Heaven* and *Tu Boda* are now
**supplemental**, not core. If the site's copy, headers, or song labels anywhere
imply an 8-song core thread or label Just Like Heaven / Tu Boda as core, that is
a discrepancy.

1. Seven Nation Army — The White Stripes
2. All Along the Watchtower — Dylan / Hendrix
3. Sweet Child O' Mine (STANDARD tuning in class) — Guns N' Roses
4. Oye Mi Amor — Maná
5. Let It Be — The Beatles
6. "the cure" — Olivia Rodrigo (capo 1; lyric note: explicit word in verse 3 —
   clean edit pending; do not link the unedited original in new steps without
   flagging this to Jonathan)

### 0.2 · Featured core songs per module (the "most appropriate" sets)

Rule (approved by Jonathan): each module features the **non-◐ core songs** for
its unit, capped at **3–4** via this deterministic tiebreak: (1) songs named in
the unit's assessment or ▸/▹ Skills Check items, (2) Latin representation
(Oye Mi Amor always survives the cap), (3) recurrence across the unit's weeks.
No approval step needed — these sets are final:

| Module / Unit | Featured core songs (max 4) | Core songs ◐ in this unit (may appear only as clearly-optional stretch, flagged) | Core songs trimmed by the cap (fine to mention, not featured) |
|---|---|---|---|
| M1 · U1 Intro | Seven Nation Army · Sweet Child O' Mine · Oye Mi Amor · "the cure" | — | Watchtower, Let It Be (exception: the Listen & Connect "six opening hooks" listening step may reference all six — that's map-mandated) |
| M2 · U2 Notes on E & A | Seven Nation Army · All Along the Watchtower · "the cure" · Oye Mi Amor | — | Sweet Child, Let It Be |
| M3 · U3 Power Chords | Seven Nation Army · All Along the Watchtower · Sweet Child O' Mine · Oye Mi Amor | ◐ "the cure" · ◐ Let It Be | — (non-◐ set is exactly 4) |
| M4 · U4 Pentatonic | Seven Nation Army · All Along the Watchtower · Oye Mi Amor · Sweet Child O' Mine | — | Let It Be, "the cure" |
| M5 · U5 Open Chords | Let It Be · Oye Mi Amor · "the cure" · All Along the Watchtower | ◐ Seven Nation Army (Week 16 strummed adaptation) | — (non-◐ set is exactly 4) |

### 0.3 · Supplemental songs per unit (map V15)

Supplementals do NOT all need to appear on the site. Audit rule: any song ON the
site must exist in the map's row for that unit (core or supplemental), at the
right layer, with ◐ status respected. Songs on the site but absent from the
unit's map row = discrepancy.

- **U1:** Happy Birthday (open-string melody — first real song), plus
  listening-only: Tu Boda, good 4 u, La Diabla, American Girl, Beat It, No Se Va.
- **U2:** Happy Birthday (full melody on E & A), Tu Boda (requinto intro +
  bass roots F#–A#–B), ◐ Just Like Heaven, good 4 u (bassline roots A–E–F#–D),
  ◐ La Diabla, American Girl (bass roots D–E–G–A @ 60 BPM), Beat It (main riff
  on low E), No Se Va (bass roots G–C–D).
- **U3:** Smoke on the Water, good 4 u (native — home unit), American Girl
  (D5–E5–G5–A5 straight-eighths vehicle), Beat It (E5–D5), ◐ Happy Birthday,
  ◐ Tu Boda, ◐ La Diabla, ◐ No Se Va.
- **U4:** Smoke on the Water (Em blues), Happy Birthday (reharmonization),
  good 4 u (F#m pentatonic), La Diabla (requinto phrasing), American Girl
  (D-major pentatonic; outro jam stretch), Beat It (Em pentatonic solo — home
  unit), No Se Va (G-major phrasing), ◐ Tu Boda, ◐ Just Like Heaven.
- **U5:** Happy Birthday (chord-strum C–G–Am / C–G–Am–F), Smoke on the Water
  (Em strummed), La Diabla (Bm–D–A–G — Bm is Week 16's new chord), No Se Va
  (G–C–D cumbia strum — home unit), good 4 u (F#m open-chord adaptation, Wk 17),
  American Girl (open D–E–G–A, Wk 17), ◐ Beat It, student-choice songs.
- **Lyric review flags:** good 4 u (use radio edit), La Diabla (listen-through
  pending), "the cure" (clean edit pending). New steps linking these should
  carry a `<!-- lyric-review -->` comment or note in the report.

### 0.4 · BPM targets (from the proposed rubrics — the numbers the site must match)

| Module | Target(s) |
|---|---|
| M1 | No BPM. Tune-up in **≤ 2 minutes**; One Minute Perfect Notes. |
| M2 | Bassline/melody at **60 BPM**, no stops. |
| M3 | Changes on beat 1 at **60 BPM**; **hold 80 BPM for 15 seconds**; skills-check stretch "70+ BPM" is fine as a ladder rung, not the assessment bar. |
| M4 | No fixed BPM — "holds the backing track's pulse start to finish." Tempo ladders fine as practice, but assessment language shouldn't invent a BPM. |
| M5 | 8-bar Group 1/2 progression at **70 BPM**; folk strum in time at 70 BPM. |

Tempo-ladder rungs on the site may go above these targets (that's the point of
a ladder) — the audit checks that the *assessment-facing* numbers and the
"you've got it when" bars match the rubric, and that each ladder passes through
the rubric tempo as an explicit rung.

### 0.5 · ▹ WEBSITE items the map promises (the site MUST have these)

- **M1:** One Minute Perfect Notes (name each open string, log clean rings);
  Tune Challenge ≤ 2 min all green; **My Practice Routine 1/2/3 check-in starts
  Week 1**.
- **M2:** Seven Nation Army — low-E riff along to audio, **tempo ladder**;
  (▸ in-class: Watchtower E-string bassline — site can host the drill but must
  label it as the in-class assessment rehearsal); My Practice Routine.
- **M3:** Oye Mi Amor — **Bm5–A5 two-shape metronome drill + tempo ladder**;
  (▸ in-class: Sweet Child power-chord intro/chorus riff); My Practice Routine.
- **M4:** My Practice Routine. Backing tracks for soloing over core songs
  (assessment draws from the six core songs).
- **M5:** "the cure" — **capo-1 play-along + loop with tempo ladder, shapes
  pre-loaded in the TAB module**; (▸ in-class: Let It Be C–G–Am–F full verse);
  **Semester Written Check quiz module (Week 17)** — if absent, log as a known
  gap (it's already on the roadmap as the Week 17 question bank); My Practice
  Routine.

Every module's My Practice Routine check-in must be present and described as
**ungraded self-reflection** (it replaced the rubric's Self-assessment row).

### 0.6 · Rubric rows + per-unit "Meets" anchors (PROPOSED wording)

Five rows, scored 0–4, 20 pts/unit: **Technique (Pr.4) · Tone (Pr.5) ·
Accuracy (Pr.6) · Consistency (Pr.6) · Knowledge & Reading (Pr.4)**.
There is NO Self-assessment row. The per-unit Meets anchors the site's
`gotItWhen:` / challenge language should echo (echo the substance, not
necessarily verbatim):

- **U1** — Tech: posture, pick grip, wrist down-strokes. Tone: every open string
  rings full, no accidental muting. Acc: all 6 strings tuned to green, tuner used
  correctly. Cons: full tune-up ≤ 2 min without restarting. K&R: name E A D G B e
  from memory, in order and at random.
- **U2** — Tech: one finger per fret, thumb behind neck, held throughout. Tone:
  every note clean, no buzz/dead notes. Acc: Watchtower low-E line from memory
  (or "the cure" root line), correct notes + fingering. Cons: full line at
  60 BPM, no stops. K&R: E & A note names through fret 12; sight-read a 2-bar
  TAB line.
- **U3** — Tech: index+ring shape, unused strings muted by fretting hand. Tone:
  both notes ring clean, muted strings silent. Acc: clean switch between two
  same-fret E/A-root power chords; I–IV–V from symbols/TAB with a named strum
  (straight-eighths or split strum). Cons: beat-1 changes @ 60; 80 BPM held
  15 s; clap-and-count a 4-bar rhythm. K&R: power-chord names from a chart;
  read from symbols/TAB; name the strum pattern; identify whole–eighth notes.
- **U4** — Tech: ≥1 clean hammer-on / pull-off / vibrato in the solo. Tone:
  clean across the full box. Acc: solo stays in the minor-pentatonic box, 4-bar
  form intact, follows the named phrasing strategy (call-and-response or
  four-phrase). Cons: holds the backing track's pulse, no restarts. K&R: names
  the scale AND the phrasing strategy.
- **U5** — Tech: arched fingers, thumb behind neck, held through progression +
  full song. Tone: all intended strings ring on every chord. Acc: correct shapes
  for two teacher-named Group 1/2 chords; one core song from memory — Let It Be
  (C–G–Am–F), Oye Mi Amor (D–A–Bm–G), or "the cure" (capo 1, Am–C–Dm–F–G/B) —
  plus one choice song. Cons: 8 bars @ 70 BPM in time; full song without
  stopping. K&R: read a chord chart (X, O, finger numbers); name chords and
  their group.
- **Scored OUTSIDE the rubric:** Semester Written Check (point-scored quiz);
  the live call-and-response duet is scored on the U4 grid (Accuracy +
  Consistency rows).

### 0.7 · Song facts to verify wherever they appear on the site

- Oye Mi Amor: Bm5–A5 verse → D5–A5–Bm5–G5 chorus (U3); D–A–Bm–G open (U5);
  Bm pentatonic solo (U4).
- "the cure": capo 1, Am–C–Dm–F–G/B; U2 = bassline as single-note roots.
- Sweet Child: class plays in STANDARD tuning; verse bass D–C–G; power chords
  D5–C5–G5. Known: the original recording is E♭ (half-step down) — flag it in
  the tuning check; Jonathan will provide standard-tuning audio if a
  play-along step needs it. Never suggest retuning school guitars. The
  existing half-step hint line in Module 2 stays until its audio is actually
  replaced.
- Watchtower: Am5–G5–F5 (U3); Am–G–F open (U5); Am pentatonic (U4).
- Let It Be: C–G–Am–F.
- Seven Nation Army: low-E riff (U2); Em pentatonic (U4); ◐ D–A–Em strummed (U5).

---

## SESSION A — Audit & report (NO file edits)

**Output:** a new `AUDIT_REPORT.md` at repo root. One `## Module N` section per
module, findings grouped under the four checks below. Every finding is one line
in the form `[M3·songs] good 4 u labeled CORE on site → SUPP in map` or
`[M2·bpm] Set 3 Challenge 2 — site: 70 BPM → rubric: 60 BPM`. End each module
section with a `### Proposed fix list` — the concrete edits Session B–F will
make, so Jonathan approves fixes by reading the report once.

**Song-link rule** (was in the retired SONG_SWAP.md, now lives in
WORKFLOW.md's header): whenever a session touches a module's song list,
oEmbed-verify any new link per CLAUDE.md. Section 0 of this file is the
authoritative song reference — V15's six-song core thread supersedes any
stale core/supp labels in older repo docs or code comments.

**Repo note:** modules are lazy-loaded — `index.html` no longer loads the
`module-N.js` files up front; each is fetched on demand when its module is
opened. For the audit, just read the `module-N.js` files directly from disk;
for Live Server testing in Sessions B–F, open each module in the browser to
trigger its load.

For each of `module-1.js` … `module-5.js`, run these four checks against
Section 0:

### A·1 Songs
- Site's featured core songs vs the module's featured set (0.2). Flag: featured
  songs missing; songs presented as core that aren't; ◐ songs presented without
  a clear optional/stretch framing (🌶️ levelUp or equivalent); any site song
  absent from the unit's map row entirely (0.3); wrong layer (e.g. a U2 step
  strumming chords).
- Any copy implying an 8-song core thread, or labeling Just Like Heaven /
  Tu Boda as core.
- "Take It to a Song" closers: confirm each lands in a **featured** core song
  for that module (supplementals acceptable only as a second option).
- Tuning check: for every `originalUrl` / `tutorialUrl` on a featured song,
  verify the recording or lesson is in standard tuning — skim/listen to the
  video itself, don't trust titles. Log any non-standard-tuning recording as
  `[M2·tuning] Sweet Child originalUrl — record is E♭ (half-step down)`.
  Jonathan will upload standard-tuning audio to replace flagged play-along
  tracks as needed; do not swap or remove links in Session A.

### A·2 BPM & timing targets
- Every BPM, timer, and rep target vs table 0.4. Ladders must include the
  rubric tempo as a rung. Flag assessment-bar language that names a different
  number than the rubric.

### A·3 Assessment language (proposed rubric)
- Map each Set's named challenges + `gotItWhen:` lines to the five rubric rows.
  Report (a) skills/challenges mapping to NO row, (b) rubric rows with no
  site coverage in that module, (c) language contradicting a Meets anchor
  (0.6) — e.g. a `gotItWhen:` that sets a lower bar than Meets for the same
  skill, (d) any surviving self-assessment-as-graded framing.
- Check the assessment-rehearsal steps exist and are labeled: the site step
  that rehearses the unit assessment should say so (M2 Watchtower, M3
  Sweet Child/Oye Mi Amor, M5 Let It Be + "the cure").

### A·4 Map-promised website features (0.5)
- Confirm each ▹ WEBSITE item exists in the module. My Practice Routine
  check-in present in every module and framed as ungraded. Missing Week 17
  quiz module = log as known gap, not a fix for this plan.

**Session A rules:** read-only; no MC questions needed except at genuine
ambiguity; if a check can't be decided from Section 0, log it under
`### Questions for Jonathan` rather than guessing.

- [x] **Session A** — run the audit, write `AUDIT_REPORT.md`, push (doc-only,
  `--skip-links` fine), and give Jonathan a 5-line summary of the biggest
  findings per module.
  ✅ 2026-07-05 — `AUDIT_REPORT.md` written & pushed (ec88a4d). Audited M1–5;
  systemic "My Practice Routine" gap (absent from all 5, confirmed not
  app-injected), Happy Birthday mislabeled Core, Oye Mi Amor missing from M2/M4,
  "the cure" missing from M5, BPM assessment-bar drift (M1/M3/M5). 6 open
  questions logged at the top of the report for Jonathan before Sessions B–F.

---

## SESSIONS B–F — Fix passes (one module per session, after Jonathan reviews the report)

Same procedure each session. Do NOT start these until Jonathan has read
`AUDIT_REPORT.md` and said go.

**Procedure per session:**
1. Open the module's `### Proposed fix list` in `AUDIT_REPORT.md`; present the
   plan.
2. Ask one MC question on any judgment call the report left open.
3. For step-text rewrites: show ONE complete rewritten step first
   (match the frozen-template voice — verb-first, hints ≤ 2 sentences,
   "Challenge N — Name:" format) → MC "on the right track?" → then the rest.
4. Make the edits. Song removals: delete the step or retarget it to a featured
   song — whichever the fix list says. New song links: oEmbed-verify, never
   from memory. New "the cure" / good 4 u / La Diabla links: apply the
   lyric-review note (0.3). Flagged non-standard-tuning recordings: swap in
   the standard-tuning audio Jonathan provides (or a verified standard-tuning
   video), and remove the old half-step hint line from any step whose audio
   is replaced.
5. `node tools/checks.mjs` → Live Server test with Jonathan → push → check the
   box here AND mark the module's section in `AUDIT_REPORT.md` as `✅ resolved`.

- [x] **Session B** — Module 1 fixes
  ✅ 2026-07-05 — Happy Birthday re-tagged Core→Supp; Set 1 now lists the full
  featured core set (the cure, Watchtower, SNA, Sweet Child, Oye Mi Amor) as
  listen-only cards + SNA card in Set 2; 60 BPM kept as practice-only (off the
  assessment bar); "the cure" full chords + lyric-review note; **My Practice
  Routine** ungraded check-in added (Week 1). checks.mjs green, pushed.
- [x] **Session C** — Module 2 fixes
  ✅ 2026-07-05 — SNA re-tagged Choice→Core in both sets; "the cure" bassline
  card added to Set 2; Oye Mi Amor added as a listen-only Core card in Set 1
  (Latin representation, no invented U2 bassline); Happy Birthday Core→Supp
  (consistency); **My Practice Routine** check-in added; Watchtower rehearsal
  labeled in-class + s4 reworded to "sight-read a 2-bar TAB line". checks.mjs
  green, pushed.
- [ ] **Session D** — Module 3 fixes
- [ ] **Session E** — Module 4 fixes
- [ ] **Session F** — Module 5 fixes

---

## SESSION G — Verification pass

- [ ] **Session G** — Re-run the four A-checks against the fixed modules
  (quick pass). Confirm `AUDIT_REPORT.md` shows every finding resolved or
  consciously deferred (each deferral needs a one-line reason). Run the full
  `node tools/checks.mjs` including the link check. Push. Report done to
  Jonathan with a short "what changed" summary he can skim.

---

## Out of scope (do not do in this plan)
- Modules 6–8 (S2 alignment waits for the S2 map to firm up).
- Building the Week 17 quiz question bank (separate roadmap item — Session A
  only logs whether the module shell exists).
- The "the cure" clean-edit audio itself (Jonathan's task; site steps just
  carry the note).
- Any S2 rubric work.
