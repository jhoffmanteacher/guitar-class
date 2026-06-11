# Module 2 — Upgrading the Model (and the Template Checklist to Emulate)

> Generated 2026-06-11 after a complete read of `module-2.js` (both sets, all stations,
> songs, assessment, skills, module review). Module 2 is the best module in the course —
> this doc is about the gaps that remain *in the model itself*, so that fixing them once
> here gives you a stronger pattern to copy into every other module.
>
> Part 1 = specific Module 2 changes. Part 2 = the distilled template checklist.
> **[J]** = Jose writes/decides · **[CC]** = Claude Code implements · **[J+CC]** = both.

---

# PART 1 — Specific Module 2 improvements

## 1.1 Fix the recall-direction gap (the biggest pedagogical hole) — [J+CC]
Set 1's skill `m2w1-s2` demands: *"someone calls out any fret 0–12 and you can say the
note name instantly, **without counting up from E**."* But every solo drill in the set is
**sequential** — Low E Run, A String Run, playSeq ladders all go up and back down in
order. Sequential laps teach counting-up; only the partner quiz practices random access,
and only if a partner is available.

Fixes, in increasing order of power:
- **Shuffle drill (content only):** *"Challenge — Shuffle Run: write frets 1–12 on the
  corners of your handout (or scraps of paper), point to them in a random order, and name
  + play each within 3 seconds. Win: 10 in a row, no counting up."* The 3-second limit
  mirrors the gotItWhen exactly.
- **Reverse + entry-point drills:** name notes going *down* the string; start laps from
  fret 5 or 7 instead of 0. Cheap variations that break the memorized sequence.
- **Resurrect the parked interactive fretboard — [CC].** Your repo already has this
  built: the `feature/interactive-fretboard` branch (commit `aeed5c0`, per TODO.md) has a
  clickable E+A fretboard with a **Quiz-me mode that highlights a random fret and asks
  the student to identify it** — which is precisely the random-recall drill the set is
  missing. It was parked for lack of "a real classroom need"; this is the need. Bonus:
  once merged, the same component generalizes — D/G strings for Module 4, power-chord
  roots for Module 3, barre roots for Module 7. One revival, four modules deepened.

## 1.2 Add personal-record (PR) ladders to the challenges — [J+CC]
Everything in Module 2 lives at 60 BPM. Depth without new skills = the same drill on a
tempo ladder with a recorded score:
> *"Win at 60 BPM, then raise the metronome 10 at a time until you find your fastest
> CLEAN lap. Type your max BPM below — that's the number to beat next class."*
The number goes in a `short` response box, so it persists in Firestore, survives between
classes, and shows up on your teacher dashboard as a growth record. Apply to: Low E Run,
A String Run, the Watchtower riff. (This is the same "beat your record" mechanic as the
one-minute-changes drill proposed for Module 5 — establish it here in the model first.)

## 1.3 Apply "Stuck? / Level up" to the model first — [J]
Module 2 has exactly one informal level-up ("Name That Riff — give it a go!") and zero
regressions. If the template is going to carry these branches (per the deep-dive doc,
§2.3), the model needs to demonstrate them. Concrete examples to write:
- Challenge 1 (Low E Run) — *Stuck? Master frets 0–5 only, chart-free, then add 7–12.*
  *Level up: one lap at 80 BPM, or a lap starting from fret 12 going down.*
- Finger Workout (Set 2) — *Stuck? Frets 1–3 with three fingers first.* *Level up: same
  drill starting at fret 5, where the stretches are smaller — notice the difference.*
- Watchtower riff — *Level up: play it with your eyes closed (that's the real test of
  "from memory").*

## 1.4 Explain the # symbol the moment it appears — [J]
The Happy Birthday TAB is full of **F#, G#, C#** — and Module 2 teaches *natural notes
only*. A student clicks a note, sees "F#," and has never been told what # means. Silence
here reads as "you missed something." One hint line fixes it:
> *"Seeing a # (sharp)? It just means one fret higher than the plain note — F# is one
> fret above F. We'll dig into sharps and flats later; for now, trust the fret numbers."*
**Template principle this establishes:** when a set unavoidably touches a future
concept, add a one-line "just-enough" preview instead of ignoring it.

## 1.5 Every Core song playable in-app — [J+CC]
Set 2's three Core songs: Happy Birthday has full in-app TAB ✓, Watchtower has full
in-app TAB ✓, **"Vampire" has nothing** — its meta says "play simplified intro riff on E
string" but there's no `tab:` and the tutorial is an external link. Either add the
simplified riff as in-app TAB (it's a handful of E-string notes — Claude Code can draft
it for your review) or demote it to a Choice song. **Template rule:** Core = playable
from inside the app; Choice = tutorial link is enough.

## 1.6 Quick-check hygiene — [J]
- The fingertip-placement MC appears **verbatim twice** in Set 2 (computer station step
  ~line 253 and practice station "Quick check" ~line 330) — same choices, same order.
  The second sighting is dead weight; vary it (e.g., flip it to "What happens if you
  press in the middle of the fret space?" or a buzz-diagnosis scenario).
- Set 1's note checks sample only frets 5, 3, and 7. A student can clear every check
  knowing three notes. Spread the sampling (2, 8, 10, 12) and make the practice-station
  checks hit *different* frets than the computer-station ones.
- Factual MCs like these should get `answer:` keys + a one-line explanation once that
  feature lands (deep-dive §2.5). Reflection MCs stay unkeyed.

## 1.7 End every station with an exit ticket — [J+CC]
There's no closing reflection, so each class session ends cold and the next one starts
from scratch. Add a standard final step to both stations:
> *"Before you rotate: which note or fret tripped you up most today? Type it below —
> that's your first 2 minutes of practice next class."* (`short` response)
This creates session-to-session continuity for the student and gives you a live feed of
who's stuck where on the teacher dashboard. **This is the single most template-able
addition** — same step, every station, every module, different wording per topic.

## 1.8 Name the assessment piece in Set 1, like Set 2 does — [J]
Set 2's Challenge 3 does something quietly brilliant: *"Watchtower Bass Riff **(your
assessment piece)**… that is the unit-end test."* Students know exactly what counts.
Set 1 never connects its drills to its assessment (the partner point-and-name quiz).
Add the same framing: *"Challenge 2 — A String Run… this is exactly what the Set 1
check-off looks like."* **Template rule:** every set names its exit test inside a
challenge, not just in the assessment block at the bottom.

## 1.9 Small polish — [J]
- `m2w1-s3`'s gotItWhen says *"same as above, but for the A string"* — skills can render
  outside their list order (checklist, dashboard tooltips), so "above" may not exist.
  Make every gotItWhen self-contained.
- Partner steps need a solo fallback (odd class sizes, absences): *"No partner? Use the
  Shuffle Run cards instead."*
- Add time budgets to both stations ("Computer station ≈ 12 min") and reference the
  built-in timer inside at least one challenge ("set the practice timer to 2:00").
- Module review (`MODULE_REVIEWS[2]`) covers 4 of the 11 skills and ends flat. Add the
  missing "I can" lines (musical alphabet, chart reading, finger-per-fret) and close
  with a forward link: *"Why this matters: the E & A notes you just learned become the
  ROOTS of every power chord in Module 3."* Motivation + coherence in one line.

---

# PART 2 — The Module Template Checklist

Run any module (new or existing) against this list. Items marked ★ are the ones Module 2
already models well today; the rest come from Part 1 fixes.

## Computer station
- [ ] ≤ 2 videos, each with a timestamp range (never "full video") and a *during-watching*
      job ("pause and find it before he names it") ★
- [ ] At least one interactive step: `tab:`, `chords:`, `playSeq`, or fretboard widget
- [ ] One ear/listening step tied to a real song ★
- [ ] Scaffolded version of the skill ("lean on the chart here") that the practice
      station will fade ★
- [ ] Quick-checks sample different content than the practice station's
- [ ] Closes with the exit-ticket reflection step

## Practice station
- [ ] Opens with the warm-up spiral (tune + prior-module skill retrieval) ★
- [ ] Named challenges, verb-first, each with a "Win:" condition ★
- [ ] Every challenge has **Stuck?** and **Level up** lines
- [ ] At least one drill matches the *recall direction* of the gotItWhen (random access
      if the skill demands random access — not just sequential laps)
- [ ] At least one PR ladder ("find your max clean BPM, record it")
- [ ] One challenge explicitly named "(your assessment piece)" ★ (Set 2 only — extend)
- [ ] Partner steps have a solo fallback
- [ ] Time budget at the top; timer referenced in at least one challenge
- [ ] Closes with the exit-ticket reflection step

## Content quality
- [ ] Every new chord/shape/pattern appears as `chords:` diagram or `tab:` at first use
- [ ] Future concepts that leak in get a one-line "just-enough" preview (the F# rule)
- [ ] MC distractors are real misconceptions, not giveaways; factual MCs get answer keys,
      reflection MCs don't
- [ ] No quiz question repeated verbatim within a set
- [ ] Hints ≤ 2 sentences; the *why* lives in the hint, the *what* in the step ★

## Songs & skills
- [ ] Core songs playable in-app (`tab:` or equivalent); Choice songs may be link-only
- [ ] Choice songs carry difficulty dots (● / ●● / ●●●)
- [ ] Every gotItWhen is self-contained, observable, and time-bound where possible ★
- [ ] Drills exist for every skill id referenced (no orphan skills)

## Module review
- [ ] "I can" lines cover every skill in the module, in gotItWhen language
- [ ] Ends with a forward link: "Why this matters in Module N+1…"
- [ ] References the Module 1 goal where natural (especially the final module)

---

# Suggested order for the Module 2 upgrade itself

| Step | Work | Why first |
|---|---|---|
| 1 | 1.4 # symbol hint · 1.6 quick-check fixes · 1.9 polish | 20 minutes, pure text edits |
| 2 | 1.3 Stuck?/Level up + 1.8 assessment naming + 1.7 exit tickets | Defines the template voice |
| 3 | 1.2 PR ladders · 1.5 Vampire TAB | Small CC wiring + your review |
| 4 | 1.1 Shuffle drill now; resurrect the fretboard branch when ready | The deep fix |

Once steps 1–3 are in, Module 2 *is* the template — copy its patterns outward using the
Part 2 checklist, starting with Module 5 (per the deep-dive doc).
