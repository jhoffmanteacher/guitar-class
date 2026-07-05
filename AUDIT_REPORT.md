# AUDIT_REPORT.md — Session A (Website ↔ Curriculum Map V15 + S1 Rubrics V1)

> **Scope:** Modules 1–5 only (Modules 6–8 out of scope). Read-only audit — no
> files were changed. Source of truth is Section 0 of `SITE_ALIGNMENT.md` (V15
> map + proposed S1 rubric, extracted 2026-07-05).
>
> **Method:** Each `module-N.js` read in full and checked against Section 0 on
> the four Session-A axes (A·1 Songs, A·2 BPM & timing, A·3 Assessment language,
> A·4 Map-promised features). All featured-song YouTube links were oEmbed-verified
> live. Findings use the form `[MN·check] site state → map/rubric state`.
>
> **Known limitation — tuning check:** the A·1 "listen to the video to confirm
> standard tuning" step cannot be done by literally hearing audio. Links were
> confirmed *live* via oEmbed; tuning is flagged only from the known facts in
> Section 0.7 (chiefly Sweet Child O' Mine = E♭/half-step-down original). Anything
> that would need an actual listen is called out, not asserted.
>
> **How to read this:** skim the cross-module themes and the consolidated
> questions first, then each module's `### Proposed fix list` — approving those
> lists is what unlocks Sessions B–F. Nothing here is fixed yet.

---

## Cross-module themes (the patterns worth deciding once)

1. **"My Practice Routine" check-in is missing from ALL five modules.** Confirmed
   absent from `module-1.js`…`module-5.js`, `app.js`, and `index.html` (only a
   JustinGuitar video titled "…Practice Routine" appears). Section 0.5 requires a
   named, **ungraded** My Practice Routine check-in in every module, starting
   Week 1. This is the single biggest systemic gap — it recurs as an A·4 finding
   in each module below.

2. **"Happy Birthday" is labeled `type:'Core'/core:true`** in M1, M3, M4, and M5.
   In the V15 six-song thread it is **supplemental** (0.1/0.3), so the Core badge
   mislabels it everywhere it appears. (It is a legitimate U-row supplemental —
   the fix is re-tagging, not removal.)

3. **Featured core songs are missing from their own modules.** Per 0.2 each module
   should feature its non-◐ core set. Actual gaps: Sweet Child & Oye Mi Amor
   absent from M1; Seven Nation Army mislabeled `Choice` and Oye Mi Amor absent in
   M2; the Oye Mi Amor Bm5–A5 drill absent in M3; Oye Mi Amor absent in M4;
   "the cure" absent in M5.

4. **Assessment-facing BPM numbers drift from the rubric (0.4).** M1 states a
   60-BPM melody bar where the rubric sets none; M3 states the beat-1 change bar at
   70 where the rubric is 60; M4 calls a 60-BPM scale climb "your assessment piece"
   where the assessment has no fixed BPM; M5 never names 70 as the explicit rung.
   In every case the *ladders* are fine — only the assessment-bar wording is off.

5. **Sweet Child O' Mine `originalUrl` is the E♭ (half-step-down) GNR recording**
   wherever it appears (M2–M5). Class plays standard tuning. Per 0.7 this is a
   flag only — no link is swapped or removed until Jonathan supplies standard-tuning
   audio, and M2's existing half-step hint line stays until then.

6. **Every module's Choice-song list is off the map row (0.3).** These are the
   placeholder Choice songs already slated for wholesale replacement once Jonathan's
   curriculum map is done (project memory: *supplemental-songs-pending-swap*).
   Logged as a group per module, **not** polished per-song — the swap will replace
   them toward the map's actual supplementals (good 4 u, La Diabla, American Girl,
   No Se Va, Tu Boda, Beat It, Smoke on the Water).

7. **Lyric-review notes are absent on "the cure" steps** (M1, M3, M4; M5 once the
   song is added). Per 0.3 new/continuing "the cure" steps should carry a
   `<!-- lyric-review -->` note (clean edit pending; don't link the unedited
   original in a new step without flagging).

**Known gap (not a fix for this plan):** the Week-17 **Semester Written Check quiz
module** does not exist in M5. Per the plan it is logged as a known roadmap item,
not built here.

---

## Consolidated questions for Jonathan (decide before Sessions B–F)

- **M1 — the 60 BPM open-string melody:** reframe to "clean and steady, no fixed
  tempo" (match M1's no-BPM rubric), or keep 60 BPM but relabel it a practice-only
  ladder rung explicitly **not** the M1 assessment bar?
- **M1 — featured set reality:** M1 is the Week 1–2 intro. Add Sweet Child + Oye Mi
  Amor as *listening* entries in Set 1/2 to satisfy 0.2, or accept SNA + "the cure"
  as M1's realistic featured subset and let the other two first appear later?
- **M2 — Oye Mi Amor role:** 0.2 names it a featured M2 core song (Latin survivor),
  but 0.3/0.7 give it no U2 layer. Add an Oye Mi Amor entry to M2 (listening or
  bass-root step), or document its deliberate absence at this unit?
- **M3 — Bm5 shape:** the map promises an Oye Mi Amor **Bm5–A5** drill, but the
  barre-voicing rule pushes full barres to Module 7. Is a two-string Bm5 power
  chord (index+ring, no barre) OK to introduce in M3, or keep the drill on the
  A5–D5–E5 shapes already in the module?
- **M4 — backing tracks:** should the solo backing tracks be actual embedded/linked
  tracks per core song, or is "teacher-played / student-queued" the intended design
  (only "assessment draws from the six core songs" needs to hold)?
- **M5 — Oye Mi Amor chords:** the map's U5 open progression is **D–A–Bm–G** (0.7),
  but the site teaches the chorus as A–D–E–D. Retune the featured loop to D–A–Bm–G
  to match the map/assessment, or keep A–D–E as a deliberate simplified entry and
  treat D–A–Bm–G as the Set 4 full-song stretch?

---

## Module 1 — ✅ resolved (Session B, 2026-07-05)
### A·1 Songs
- [M1·songs] "Happy Birthday" labeled `type:'Core', core:true` in w1 & w2 (meta "Course song thread — you'll play this all semester") → supplemental in map (0.1/0.3); it is NOT one of the six core songs.
- [M1·songs] Featured core Seven Nation Army appears only in w2 *steps* (riff preview + Challenge 3) → absent from either set's `songs[]` list, so it never shows as a featured song card.
- [M1·songs] Featured core Sweet Child O' Mine absent from Module 1 entirely → 0.2 names it in M1's featured set.
- [M1·songs] Featured core Oye Mi Amor absent from Module 1 entirely → 0.2 names it in M1's featured set (Latin song that should always survive the cap).
- [M1·songs] All Along the Watchtower `type:'Core'` in w1 & w2 → a real core song but NOT in M1's featured four; acceptable as listen-only under the "six opening hooks" exception (0.2), no removal needed.
- [M1·songs] "the cure" `originalUrl` (B402rKl4bUg) linked in w1 songs → lyric-review flag: explicit word in verse 3, clean edit pending (0.3). `<!-- lyric-review -->`
- [M1·songs] "the cure" meta reads "(Am–C–F)" → 0.7 says capo 1, Am–C–Dm–F–G/B; simplification is fine for a listen step but chords are incomplete.
- [M1·songs] Site Choice songs absent from the U1 map row (0.3): Sailor Song, Ode to Joy, Mary Had a Little Lamb, Jingle Bells, Twinkle Twinkle, The Simpsons Theme → none are in U1's supplementals. These are the placeholder Choice songs slated for wholesale replacement (pending-swap) — flag as a group, don't polish.
- [M1·songs] No "Take It to a Song" closer in M1 → that feature lives in M6–8; N/A, no action.
- [M1·tuning] All M1 core/featured song links resolve live via oEmbed (the cure orig+tutorial, Watchtower Dylan+tutorial, Happy Birthday tutorial → all HTTP 200). Cannot verify audio by ear, but per 0.7 all are standard tuning (the cure = capo 1); no tuning problem. Sweet Child E♭ issue is N/A here (song absent).

### A·2 BPM & timing
- [M1·bpm] w2 `objective` "play a short open-string melody at **60 BPM**" → 0.4: M1 has NO BPM target.
- [M1·bpm] w2 station-c step "Try Happy Birthday… set your metronome to **60 BPM**… play it start to finish at 60 BPM without stopping" → rubric M1 has no BPM.
- [M1·bpm] skill w2-s6 "Play a short melody on the E string at **60 BPM**" (`gotItWhen` + `practice.playSeq bpm:60`) → same 60-BPM bar the M1 rubric does not set (this is the U2 target).
- [M1·bpm] Tune Challenge "all 6 strings green in under **2 minutes**" (w2 Challenge 1 / w2-s5) → ✓ matches rubric exactly.
- [M1·bpm] One Minute Perfect Notes (w2 Challenge 2) → ✓ matches rubric. (`playSeq bpm:50/60` are audio-playback tempos, not assessment bars — fine.)

### A·3 Assessment language
- [M1·assess] Rubric-row coverage in M1: Technique ✓ (w2-s2 posture, w2-s3 pick grip), Tone ✓ (One Minute Perfect Notes = clean rings), Accuracy ✓ (w2-s5 tune to green), Consistency ✓ (w2-s5 ≤2 min), Knowledge & Reading ✓ (w2-s4 string names). All five rows covered.
- [M1·assess] w1-s1/s2/s3 (describe why guitar / name a song / participated & listened) map to NO rubric row → goal-setting/participation on the Set 1 sharing day; acceptable as pre-assessment, but they carry no rubric anchor.
- [M1·assess] w2-s6 (melody at 60 BPM) has no home in the U1 rubric grid → tied to the A·2 BPM finding; only cross-row skill.
- [M1·assess] `assessment.selfCheck` present as reflective questions (not graded) ✓. `MODULE_REVIEWS[1]` holds self-assessment skills (mr1-s1…s4) → confirm these render as ungraded self-reflection, not a scored row (can't be decided from data alone).
- [M1·assess] Assessment-rehearsal: M1's assessment is tune-up + string-naming; Challenge 1 (Tune) + Challenge 2 (Perfect Notes) rehearse it directly ✓. No ▸ in-class rehearsal is promised for M1 in 0.5, so none is missing.

### A·4 Map-promised website features
- [M1·features] One Minute Perfect Notes → ✓ present (w2 Challenge 2, named exactly).
- [M1·features] Tune Challenge ≤ 2 min all green → ✓ present (w2 Challenge 1).
- [M1·features] **My Practice Routine 1/2/3 check-in ABSENT** → not found in `module-1.js` or `app.js`; 0.5 requires the check-in starting Week 1. Biggest M1 gap.
- [M1·features] "My Practice Routine framed as ungraded self-reflection" → N/A until the feature is added.

### Proposed fix list (Session B)
- Relabel "Happy Birthday" in w1 & w2 `songs[]`: `type:'Supp'`/`core:false`, and change meta from "Course song thread…" to e.g. "First real song — open-string melody" so it no longer reads as a core-thread song.
- Add Seven Nation Army as a proper `songs[]` entry (Core) in w2 (already played in the steps), with its `journeyUrl` layer-1 link, so the featured card exists.
- Per Jonathan's answer: add Sweet Child O' Mine and Oye Mi Amor as listen-only Core entries in Set 1's `songs[]` (both have Song Journey pages), to satisfy the 0.2 featured set.
- Reframe the three 60-BPM references (w2 objective, the Happy Birthday step, skill w2-s6) per Jonathan's A·2 choice.
- Add a "My Practice Routine 1/2/3" ungraded check-in to Module 1 (Week 1 start).
- Add a `<!-- lyric-review -->` note on the "the cure" original link; optionally complete its chord meta to "capo 1 · Am–C–Dm–F–G/B".
- Leave the placeholder Choice songs as-is pending the curriculum-map swap — note only.

---

## Module 2 — ✅ resolved (Session C, 2026-07-05)
### A·1 Songs
- [M2·songs] Seven Nation Army — site: `type:'Choice', core:false` in both `m2w1.songs` and `m2w2.songs` → it is one of the SIX core songs AND a featured core song for M2 (0.2); should be `type:'Core', core:true`.
- [M2·songs] "the cure" — featured core song for M2 (0.2) and used in the `m2w2` "Take It to a Song" root-line step, but has NO entry in either set's `songs[]` list → missing from the song list.
- [M2·songs] Oye Mi Amor — featured core song for M2 per 0.2, but absent entirely from Module 2 (no song entry, no step). See Questions — 0.3/0.7 give it no U2 layer, so its M2 role is undefined.
- [M2·songs] Sweet Child O' Mine — labeled Core (correct) and framed as an optional "Bonus riff," consistent with 0.2 "trimmed by cap — fine to mention, not featured." No change needed.
- [M2·songs] `m2w1` "Take It to a Song" closer = Seven Nation Army (featured core ✓); `m2w2` closers = Watchtower + Seven Nation Army + "the cure" (all featured core ✓). Closers land correctly.
- [M2·songs] No 8-song-core-thread copy found; Just Like Heaven / Tu Boda not present and not mislabeled core. Clean.
- [M2·songs] Choice songs NOT in the U2 map row (0.3): Stand By Me, Smoke on the Water, Another One Bites the Dust, Eye of the Tiger, Day Tripper, Sunshine of Your Love, Come As You Are, Crazy Train, Iron Man. These are the pending-swap Choice list — flag as a group, don't individually polish.
- [M2·songs] Beat It (Choice) IS in the U2 map row — legitimate; keep.
- [M2·tuning] Sweet Child `originalUrl` (1w7OgIMMRc4, GNR official video) — record is E♭ / half-step down (0.7). The `m2w2` bonus-riff step already carries the half-step hint line → per 0.7 that line STAYS until standard-tuning audio is provided. Logged, no edit.
- [M2·tuning] Cannot literally verify audio tuning from oEmbed; all 7 featured-song `originalUrl`/`tutorialUrl` links (SNA, Watchtower, Sweet Child, Happy Birthday) returned LIVE valid titles.
- [M2·songs] Minor: Watchtower `tutorialUrl` (Tnm1jWVLaC8) and Sweet Child `tutorialUrl` (0ASVeXINKYM) are chord-STRUM lessons, while M2 uses both as single-note bass lines — layer-mismatched tutorials (not the drills themselves). Low priority.

### A·2 BPM & timing
- [M2·bpm] No discrepancies found. Every timing target is 60 BPM (Low E Run, A String Run, Happy Birthday, Watchtower riff, Sweet Child bonus, SNA true-pitch, "the cure"), matching 0.4. Tempo ladders start AT 60 and climb +10 (levelUps to 80), so the rubric tempo is an explicit rung. No assessment-bar language names a non-60 number.
- [M2·bpm] Tune-up "under 2 minutes" (warm-up) is a Module-1 review carry-over, not an M2 target — correct.

### A·3 Assessment language
- [M2·assess] Rubric-row coverage is COMPLETE: Technique → m2w2-s2/s6 + Finger Workout; Tone → m2w2-s1; Accuracy → Watchtower "from memory, correct fingering" + "the cure" root line; Consistency → 60 BPM "no stopping"; Knowledge & Reading → m2w1-s2/s3 (name E&A 0–12) + TAB reading m2w2-s4. No row uncovered; no skill maps to zero rows.
- [M2·assess] Assessment-rehearsal step EXISTS and is labeled: `m2w2` Challenge 3 says "(your assessment piece)" and "that's the unit-end test." Suggest adding explicit "in-class" wording to match the ▸ in-class framing in 0.5 (low priority).
- [M2·assess] No graded-self-assessment framing found; `selfCheck` and MODULE_REVIEWS "I can…" items are self-reflection, not graded rows.
- [M2·assess] Minor: U2 K&R Meets names "sight-read a 2-bar TAB line" (cold); site TAB reads (Mary/Happy Birthday) are pre-practiced rather than cold sight-reading — coverage exists, wording could echo "sight-read" more explicitly.

### A·4 Map-promised website features
- [M2·features] My Practice Routine check-in — NOT present (only per-station "Station Wrap-Up" prompts). Confirmed not app-injected (see cross-module theme 1) → real gap; add ungraded.
- [M2·features] Seven Nation Army low-E riff — present (M1 + M2 steps), but the M2 SNA "Take It to a Song" laps use a "two clean laps" bar, not an explicit tempo ladder or backing-audio play-along; the +10 ladders live on the note-run and Watchtower drills. 0.5 asks for SNA riff "along to audio, tempo ladder" specifically — partially met.
- [M2·features] Watchtower E-string bassline drill — present and labeled as the assessment piece (✓, see A·3).

### Proposed fix list (Session C)
- Relabel Seven Nation Army in `m2w1.songs` and `m2w2.songs`: `type:'Choice', core:false` → `type:'Core', core:true`.
- Add a "the cure" — Olivia Rodrigo entry to `m2w2.songs` (Core; meta = bassline single-note roots) to match the featured step; carry the `<!-- lyric-review -->` note (0.3); reuse the verified M1 links (`originalUrl` B402rKl4bUg / `tutorialUrl` adW_zSkClaY) or leave link-less rather than inventing one.
- Resolve Oye Mi Amor per Jonathan's answer (add entry at chosen layer, or document its deliberate absence at U2).
- Add an ungraded My Practice Routine check-in step to Module 2.
- Optional polish: add "in-class" to the Watchtower assessment-rehearsal label; echo "sight-read" in a TAB step to match U2 K&R Meets.
- Defer the 9 off-map Choice songs — pending-swap list; swap toward map U2 supplementals if/when Jonathan runs the swap. No individual polishing now.
- No tuning edits: keep Sweet Child's half-step hint line until standard-tuning audio is supplied (0.7).

---

## Module 3 — ✅ resolved (Session D, 2026-07-05)
### A·1 Songs
- [M3·songs] "Happy Birthday" labeled `type:'Core', core:true` in BOTH sets (m3w1, m3w2) → in V15 it is a ◐ SUPPLEMENTAL in U3, not core; also appears without any optional/stretch framing.
- [M3·songs] Oye Mi Amor "Take It to a Song" (m3w2) plays A5–D5–E5–D5 → contradicts map 0.7 Oye U3 arrangement (Bm5–A5 verse → D5–A5–Bm5–G5 chorus); the map-promised **Bm5–A5 two-shape metronome drill** is absent — no Bm5 anywhere in the module.
- [M3·songs] "the cure" ◐ power-chord challenge (m3w2) carries a ◐ in its title but is a full challenge with `skills:[3,4]` and a `gotItWhen` → not clearly framed as optional/stretch; also a "the cure" step, so it needs the `<!-- lyric-review -->` note (clean edit pending, 0.3).
- [M3·tuning] Sweet Child O' Mine originalUrl `1w7OgIMMRc4` (m3w2) = official GN'R music video, recorded in E♭ (half-step down) → class plays STANDARD tuning (0.7); flag for standard-tuning audio swap. Meta progression "D5–C5–G5" matches 0.7 ✓.
- [M3·songs] No 8-song-core-thread copy, and no Just Like Heaven / Tu Boda mislabeled as core — clean on that check.
- [M3·songs] All Choice songs (Smells Like Teen Spirit, Basket Case, My Generation, Zombie, Should I Stay…, Blitzkrieg Bop, Holiday, Come as You Are, Master of Puppets, 21 Guns) are absent from the U3 map row (0.3) → covered by the pending curriculum-map Choice-song swap; do NOT polish — logging only.
- [M3·songs] All 9 featured/relevant YouTube URLs oEmbed-verified LIVE (SNA, Watchtower, Oye, Sweet Child, Happy Birthday). Cannot literally hear audio — tuning judged from 0.7 + video identity.
- [M3·songs] "Take It to a Song" closers land on featured core songs ✓ (Set 1 = Seven Nation Army; Set 2 = Watchtower + Oye Mi Amor), with "the cure" ◐ as an extra option (acceptable only if reframed optional).

### A·2 BPM & timing
- [M3·bpm] m3w2 `objective` = "change power chords on beat 1 at **70+ BPM**" → assessment-facing bar names 70; rubric 0.4 beat-1 change bar is **60 BPM** (70 is a ladder rung only).
- [M3·bpm] Skill m3w2-s1 "Change power chords on beat 1 at **70+ BPM**", gotItWhen "land exactly on beat 1… at **70 BPM**" → sets the Meets bar at 70 vs rubric 60; contradicts the U3 Consistency anchor.
- [M3·bpm] m3w2 `assessment.selfCheck` "change chords on beat 1 at **70 BPM**" → same 70-vs-60 mismatch.
- [M3·bpm] The **80 BPM held 15 seconds** rubric bar (0.4 / U3 Cons anchor) is only partially present: Challenge 2 and assessment.goal say "8 bars at 80 BPM" but never state the explicit **15-second hold** — add the duration framing.
- [M3·bpm] Ladder correctly passes through 60 (beat-1 changes: m3w1 Ch.6, m3w2 Ch.1) and reaches 80 ✓ — the issue is only that the *assessment-facing* numbers cite 70, not that the ladder is missing rungs.

### A·3 Assessment language
- [M3·assess] Skill m3w2-s6 "**Self-evaluate** timing with the metronome and adjust tempo" is a set-level graded skill (counts in skillCount) → rubric 0.6 has **no self-assessment row**; reframe as ungraded reflection or map to Consistency; maps to no rubric row as written.
- [M3·assess] Skill m3w2-s5 optional octave doubling maps to no rubric row → acceptable as an optional extension, but not a Meets-anchored skill.
- [M3·assess] The ▸ in-class **Sweet Child power-chord intro/chorus riff** rehearsal (0.5) does NOT exist as a playable step — Sweet Child appears only in the m3w2 songs list, no drill/TAB, no "in-class assessment rehearsal" label.
- [M3·assess] U3 Consistency anchor's **clap-and-count a 4-bar rhythm** and K&R's **identify whole/eighth notes** have no site coverage — no rhythm-reading/clap exercise in the module.
- [M3·assess] Accuracy anchor's "**I–IV–V** from symbols/TAB with a named strum" isn't explicitly present — named progressions are Watchtower (A5–G5–F5) and the SNA riff, neither framed as I–IV–V; the straight-eighths strum is taught but never *named* to the student as a strum pattern.
- [M3·assess] Watchtower loop IS correctly labeled the class assessment piece ("your assessment piece," "Set 1 check-off") ✓ — good rehearsal framing, just not the ▸ song the map names.

### A·4 Map-promised website features
- [M3·features] ▹ **Oye Mi Amor Bm5–A5 two-shape metronome drill + tempo ladder** (0.5) — MISSING; the only Oye step is A5–D5–E5–D5 with no Bm5 shape, no two-shape drill, no tempo ladder.
- [M3·features] ▸ **Sweet Child power-chord intro/chorus riff** (in-class rehearsal, 0.5) — MISSING as a step (see A·3).
- [M3·features] **My Practice Routine** check-in — not found in `module-3.js`; module uses "Station Wrap-Up" reflections instead. Confirmed not app-injected (cross-module theme 1) → gap; add ungraded.

### Proposed fix list (Session D)
- Relabel "Happy Birthday" to `type:'Supp'/core:false` in m3w1 and m3w2, or drop it; if kept, add ◐-optional framing in its `meta`.
- Add the map-promised **Oye Mi Amor Bm5–A5 two-shape metronome drill with a tempo ladder** (60 → 70 → 80) as a practice-station step, and correct the chorus reference toward D5–A5–Bm5–G5 (pending the Bm5 question).
- Add a ▸ **Sweet Child O' Mine power-chord intro/chorus riff** playable step (D5–C5–G5) in the m3w2 practice station, labeled the in-class assessment rehearsal; carry an E♭/standard-tuning note and swap to standard-tuning audio when provided.
- Change the assessment-facing BPM bar from **70 → 60** in m3w2 objective, skill m3w2-s1, and selfCheck; keep 70 only as a levelUp/ladder rung.
- Add the explicit **"hold 80 BPM for 15 seconds"** duration to Challenge 2 and assessment.goal.
- Reframe skill m3w2-s6 (self-evaluate timing) as ungraded reflection (remove from graded skills or restate), per "no self-assessment row."
- Reframe the "the cure" ◐ challenge as clearly optional/stretch and add the `<!-- lyric-review -->` comment.
- Add a **clap-and-count 4-bar rhythm** / whole-vs-eighth-note reading beat, and *name* the straight-eighths strum to the student, to cover the U3 K&R + Consistency anchors.
- Add an ungraded **My Practice Routine** check-in for M3.
- Leave all Choice-song lists untouched (pending curriculum-map swap).

> **Note on skillCount:** if a `skills:` entry is added or removed in `module-3.js`
> (e.g. reframing m3w2-s6, or adding a rhythm-reading skill), bump Module 3's
> `skillCount` in `config-main.js` to match — `tools/checks.mjs` will fail the push
> otherwise. Same applies to any module whose fixes change its skill list.

---

## Module 4 — ✅ resolved (Session E, 2026-07-05)
### A·1 Songs
- [M4·songs] **Oye Mi Amor is entirely ABSENT from all three sets** (song lists, TAB steps, "Take It to a Song") → per 0.2 it is a featured M4 core song that "always survives the cap," and per 0.7 it is the U4 Bm-pentatonic solo vehicle. Biggest song finding.
- [M4·songs] `m4w2` + `m4w3` song lists label `"Happy Birthday"` as `type:'Core', core:true` → it is a U4 supplemental (reharmonization), NOT one of the six core songs → should be `type:'Supp'/core:false`.
- [M4·songs] `"the cure"` is trimmed by the cap in M4 (0.2: featured set is SNA · Watchtower · Oye · Sweet Child) yet the site leans on it as a "Take It to a Song" target in `m4w2` (Solo over "the cure") and as an assessment backing track in `m4w3` Challenge 3 → closers should land in a **featured** core song; retarget the primary to Oye Mi Amor/SNA and keep "the cure" only as a second option.
- [M4·songs] New/continuing `"the cure"` steps (`m4w2` solo, `m4w3` Perform It) carry no lyric-review note → per 0.3 "the cure" clean-edit is pending; add a `<!-- lyric-review -->` note.
- [M4·tuning] `m4w1/m4w2/m4w3` Sweet Child `originalUrl=1w7OgIMMRc4` is the official GNR video → recorded in E♭ (half-step down) per 0.7; class plays STANDARD tuning → flag for standard-tuning play-along audio (do not remove in Session A).
- [M4·songs] Sweet Child `tutorialUrl=0ASVeXINKYM` and Watchtower `tutorialUrl=Tnm1jWVLaC8` are both **strumming/chord** lessons, but M4 uses these songs as **solo** vehicles → tutorial mismatch (minor); the `originalUrl` recordings are the relevant solo reference.
- [M4·songs] All featured-song URLs oEmbed-verified LIVE (SNA, Watchtower, Sweet Child).
- [M4·songs] Choice lists across all 3 sets (12-bar blues, Pride and Joy, Boom Boom, La Grange, Mannish Boy, Comfortably Numb, Still Got the Blues, The Thrill Is Gone, Sweet Home Chicago, Wish You Were Here, Purple Haze, Back in Black, Johnny B. Goode, Folsom Prison Blues, La Bamba) → **none** appear in the U4 map row (0.3); the map's actual U4 supplementals (Smoke on the Water, good 4 u, La Diabla, American Girl, Beat It, No Se Va) are absent → known pending-swap situation (defer, don't polish per-song).

### A·2 BPM & timing
- [M4·bpm] `m4w1` Challenge 1 "Pattern 1 Climb" is labeled **"your assessment piece"** at 60 BPM → M4's rubric assessment is the improvised solo held to *the backing track's pulse* with NO fixed BPM (0.4); the 60-BPM scale climb is a skills-check drill, not the graded BPM bar → reframe "assessment piece" wording so the tempo'd scale drill isn't read as the assessment.
- [M4·bpm] `m4w1-s5` gotItWhen "every note lands on a beat at 60 BPM" → acceptable as a scale-drill practice rung; the 80-BPM levelUp is a valid ladder rung. Solo challenges (Rule of 3, Call & Response, Perform It) correctly avoid a numeric BPM bar. No other BPM violations.

### A·3 Assessment language
- [M4·assess] U4 K&R Meets anchor = "names the scale AND the phrasing strategy" → `m4w3` assessment goal/performance and `MODULE_REVIEWS[4]` assessItems require naming the **scale** only ("name the scale and root") → phrasing-strategy naming (call-and-response / four-phrase) is not required at assessment → gap.
- [M4·assess] U4 Accuracy Meets anchor = "follows the NAMED phrasing strategy" → call-and-response is named in `m4w2` Challenge 2, but the unit-end `m4w3` "Perform It" assessment names no required phrasing strategy → add the phrasing-strategy requirement to the Set 3 assessment.
- [M4·assess] U4 Consistency Meets anchor = "holds the backing track's pulse, no restarts" → no solo challenge's `gotItWhen` echoes this (they focus on phrasing/landing on the root) → add "holds the backing track's pulse start to finish, no restarts" to the Perform-It gotItWhen.
- [M4·assess] Technique (≥1 hammer-on/pull-off/vibrato) and Tone rows are well covered (`m4w2-s3`, `m4w3-s3`, `m4w3` requires ≥1 technique; timbre/dynamics + the "the cure" quiet-clean challenge cover Tone). No self-assessment-as-graded framing found (Station Wrap-Ups and `selfCheck` read as ungraded reflection).

### A·4 Map-promised website features
- [M4·features] **My Practice Routine check-in is missing from Module 4** → 0.5 lists it as a required ▹ WEBSITE item, and it must appear in every module framed as ungraded → add it.
- [M4·features] Backing tracks for soloing "draw from the six core songs" (0.5) → site solo contexts cover SNA, Watchtower, Sweet Child, "the cure" but provide **no** Oye Mi Amor or Let It Be solo context, and tracks are "teacher-played Am / one you queue up" rather than provided → add an Oye Mi Amor (Bm pentatonic) solo context; note tracks are not embedded.

### Proposed fix list (Session E)
- Add **Oye Mi Amor** as a featured core song to all three set song lists (Bm pentatonic solo framing per 0.7), and add an Oye Mi Amor "Take It to a Song" solo step (Bm-pentatonic box) — verify any new URL via oEmbed.
- Change `"Happy Birthday"` to `type:'Supp'/core:false` in `m4w2` and `m4w3` song lists.
- Retarget the `m4w2` and `m4w3` "Take It to a Song"/assessment closers so the **primary** vehicle is a featured core song (Oye Mi Amor or SNA); keep "the cure" as a labeled second option, and add a `<!-- lyric-review -->` note to any "the cure" step.
- Reframe `m4w1` Challenge 1 so "assessment piece" refers to the improvised solo, not the 60-BPM scale climb (call the climb a skills-check drill).
- Add the phrasing-strategy requirement (name call-and-response / four-phrase) to the `m4w3` assessment goal, `performance`, and `MODULE_REVIEWS[4]` assessItems; add "holds the backing track's pulse start to finish, no restarts" to the Perform-It gotItWhen.
- Add a **My Practice Routine** ungraded check-in step to Module 4.
- Add a standard-tuning play-along note/audio swap for Sweet Child (E♭ flag) when Jonathan provides audio; leave links unchanged in Session A.

---

## Module 5
### A·1 Songs
- [M5·songs] "the cure" — Olivia Rodrigo is a **featured** M5 core song (0.2) but appears NOWHERE in Module 5 (no song-list entry, no step, no capo-1 loop) → missing featured core song.
- [M5·songs] "Happy Birthday" tagged `type:'Core', core:true` in all four sets (m5w1–m5w4 songs) → it is SUPPLEMENTAL in the V15 six-song thread (0.1/0.3), so the Core badge mislabels it.
- [M5·songs] m5w3 songs "Seven Nation Army" tagged `type:'Core', core:true` with no optional/stretch framing → SNA is ◐ in U5 (0.2), allowed only as a clearly-flagged stretch; it also has no practice step (list-only), so it reads as a plain core song.
- [M5·songs] m5w4 songs "Sweet Child O' Mine" tagged Core → Sweet Child is NOT in the U5 map row (0.3) and NOT a U5 assessment-from-memory option (0.6); it belongs to earlier units.
- [M5·songs] m5w3 "All Along the Watchtower" meta `Am–Em–D–A chord group 2 adaptation` → 0.7 gives U5 Watchtower as **Am–G–F**; the D–A group-2 adaptation is not in the map (Set 1/Set 2 correctly use Am–G–F).
- [M5·songs] Featured Oye Mi Amor loop is taught as **A–D–E–D** (m5w3 & m5w4 "Take It to a Song") → 0.7/0.6 give U5 open Oye Mi Amor as **D–A–Bm–G**; the m5w4 songs-meta even says `Bm (partial barre)–G`, so site is internally inconsistent too. (See Questions.)
- [M5·songs] "Take It to a Song" closers all land on featured core songs (Let It Be, Watchtower, Oye Mi Amor) — good; but none reaches "the cure," the map's promised M5 play-along.
- [M5·songs] No 8-song-core-thread copy and no Just Like Heaven / Tu Boda mislabeled as core in M5 — clean on that count.
- [M5·tuning] m5w4 "Sweet Child O' Mine" originalUrl (1w7OgIMMRc4, official GNR video) — record is E♭ (half-step down) per 0.7; class plays standard. Flag for standard-tuning audio if it ever becomes a play-along (currently listen-only).
- [M5·links] All featured-song URLs oEmbed-verified LIVE (Let It Be, Oye Mi Amor, Watchtower, SNA, Sweet Child) → no dead links.

### A·2 BPM & timing
- [M5·bpm] m5w2 Challenge 2 (C–G–Am–F Loop) — site: 60 BPM, "bump up 5 BPM," levelUp 75 → rubric bar is 70 (0.4); 70 is only an implicit rung (60→65→70→75), not named. Add 70 as the explicit assessment-matching rung.
- [M5·bpm] m5w2-s5 down-up strum — site: "60+ BPM" → rubric "folk strum in time at 70 BPM" (0.4); the folk/down-up strum never names 70.
- [M5·bpm] m5w1-s5 (4 down-strums, "at least 8 bars") — site: 60 BPM → rubric Consistency anchor "8 bars @ 70 BPM"; acceptable as the first-exposure ladder rung, but note the 70-bar 8-bar rep only lands in m5w3 assessment.performance.
- [M5·bpm] Assessment-facing 70 BPM is present and correct in m5w2 (goal/selfCheck/s6) and m5w3 (goal/selfCheck/s4/s5, "8 bars … at 70 BPM") → no assessment bar names a wrong number.

### A·3 Assessment language
- [M5·assess] m5w4 assessment.goal + MODULE_REVIEWS[5].assessItems list "Written self-reflection: My Guitar Adventure — Semester 1 Check-in" as a scored assessment item → 0.6 removed the Self-assessment row; reframe as ungraded (0.5), not part of the graded showcase.
- [M5·assess] Technique row (0.6 U5: "arched fingers, thumb behind neck, held through progression + full song") is thinly covered — hints say "curve/arch your fingers" but no gotItWhen names thumb-behind-neck or holding the shape through a full song.
- [M5·assess] Accuracy row — "one core song from memory: Let It Be (C–G–Am–F), Oye Mi Amor (D–A–Bm–G), or 'the cure' (capo 1)": Let It Be ✓ (m5w2), Oye Mi Amor taught with wrong chords (A–D–E), "the cure" absent → only one of three from-memory options faithfully covered.
- [M5·assess] Tone, Consistency, and Knowledge & Reading rows are well covered (m5w1-s3/s4 clean-tone; m5w4-s5 full song without stopping + m5w3 8-bars-@70; m5w1-s1/s6 read chart X/O/finger-number + Group naming in m5w3/m5w4) → good.
- [M5·assess] The Let It Be C–G–Am–F verse step exists (m5w2 "Take It to a Song") but is NOT labeled as the in-class assessment rehearsal the map promises (▸, 0.5).
- [M5·assess] The "the cure" capo-1 assessment-rehearsal play-along (▸, 0.5) does not exist.

### A·4 Map-promised website features
- [M5·features] "the cure" capo-1 play-along + loop with tempo ladder, shapes pre-loaded in the TAB module (0.5) → ABSENT. This is a fixable content gap (Session F), not a deferred known-gap.
- [M5·features] Let It Be C–G–Am–F full-verse rehearsal (0.5) → present as a practice challenge but unlabeled as the in-class assessment rehearsal.
- [M5·features] My Practice Routine check-in → no step literally named "My Practice Routine" in module-5.js (only per-section "Station Wrap-Up" reflections + the Set 4 Module-1-goal revisit). Confirmed not app-injected (cross-module theme 1) → add a named, ungraded My Practice Routine.
- [M5·features] Semester Written Check quiz module (Week 17) → not present. Log as KNOWN GAP (roadmap item; do not build in this plan).

### Proposed fix list (Session F)
- Add a "the cure" (capo 1, Am–C–Dm–F–G/B) capo-1 play-along + tempo-ladder step with pre-loaded TAB/chord shapes, and add "the cure" to the M5 song lists as featured core (apply the `<!-- lyric-review -->` note per 0.3; do not link the unedited original in a new step without flagging).
- Reframe the "Written self-reflection / My Guitar Adventure Semester Check-in" as ungraded in m5w4 assessment.goal and MODULE_REVIEWS[5].assessItems; ensure a named, ungraded "My Practice Routine" check-in is present.
- Re-tag "Happy Birthday" (all 4 sets) and m5w3 "Seven Nation Army" so they aren't presented as core thread: HB → supplemental framing; SNA → clearly-optional ◐ stretch (🌶️/levelUp), per 0.2.
- Re-tag m5w4 "Sweet Child O' Mine" so it isn't a U5 core song (outside the U5 map row) — keep only as an optional showcase mention if desired.
- Fix m5w3 Watchtower meta `Am–Em–D–A` → `Am–G–F` to match 0.7; reconcile Oye Mi Amor chords per Jonathan's answer.
- Label the Let It Be C–G–Am–F verse step (and the new "the cure" loop) as the in-class assessment rehearsal (▸ wording).
- Name 70 BPM as the explicit ladder rung in m5w2 Challenge 2 and the down-up/folk-strum steps (m5w2-s5).
- Add Technique-row language (arched fingers, thumb behind neck, held through the full progression/song) to a gotItWhen.
- Leave the Sweet Child originalUrl in place (listen-only, E♭) but flag it if it ever becomes a play-along.

---

## Appendix — audit method notes
- Each module was audited independently against Section 0, then normalized for
  consistent format and severity. Findings marked "No discrepancies found" are
  omitted from the per-module sections except where the auditor recorded a clean
  pass worth noting (e.g. M2 BPM).
- All external YouTube links on featured songs across M1–M5 resolved **live** via
  the oEmbed endpoint at audit time. No dead links were found. Tuning could not be
  verified by ear; the only tuning flag is Sweet Child O' Mine's E♭ original, per
  the known fact in Section 0.7.
- Nothing in this report has been changed in the codebase. Sessions B–F apply the
  per-module `### Proposed fix list`s after Jonathan reviews this report and
  answers the consolidated questions above.
