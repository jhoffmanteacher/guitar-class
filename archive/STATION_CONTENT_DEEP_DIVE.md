# Guitar Class — Station Content Deep Dive

> Generated 2026-06-11 after reading all eight module files end-to-end.
> Goal: keep the locked module/skill sequence, but make every set deeper and more
> student-friendly. Companion to `SITE_IMPROVEMENTS.md` (which covers code).
>
> Shorthand used below: **[J]** = decision/writing for Jonathan · **[CC]** = Claude Code can
> implement once content is decided · **[J+CC]** = Jonathan decides, Claude Code wires it in.

---

## 1. What's already working — protect these patterns

Your best sets share a recognizable DNA. Before adding anything, it's worth naming it,
because the fastest way to deepen the weaker sets is to apply this DNA everywhere:

1. **Named challenges with win conditions.** "Challenge 2 — Even Eighths on Em: …
   Win: every strum even…" (Module 6). The "Win:" framing turns a chore into a game and
   tells a student working alone exactly when they're done. Modules 2–8 use it; counts
   range from 5 to 12 per file.
2. **The warm-up spiral.** Every practice station from Module 2 on opens with the
   tune-up/tone-check retrieval of Modules 1–2 skills. This is genuinely great
   pedagogy (spaced retrieval) and students will internalize "every class starts the
   same way."
3. **Scaffold → fade.** Module 2 Set 1 is the model: computer station says "lean on the
   chart here," practice station says "Win: one lap, chart-free." The same skill,
   deliberately re-practiced with the support removed.
4. **Audio everywhere it counts.** `playSeq` target pitches ("Hear all 6 strings in
   tune") give a student instant self-checking without the teacher.
5. **Ear-before-fingers steps.** "Tap along on your leg… you don't need a guitar yet"
   (Module 6) and the acoustic-vs-electric listening in Module 1 are exactly the right
   kind of low-stakes entry points.

**The core recommendation of this whole document:** Module 2 Set 1 + Module 6 Set 1 are
your gold standard. Most improvements below are "make the other sets look like these."

---

## 2. The big levers (apply across all modules)

### 2.1 Break the "watch three videos" formula at the computer station — [J+CC]
Several computer stations are three steps of "Watch: [video] (full video)" + a quiz
question (Module 3 Set 1, Module 5 Sets 2–4, Module 7). That's 10–15 minutes of passive
watching at a station that has a guitar in hand. Module 5 and Module 7 each have **9
watch-video steps** — the most of any module.

A stronger default recipe for every computer station, in order:
1. **One anchor video, watched with a job.** Not "watch, then answer" but a task *during*
   watching: "Pause at each chord and form it before he plays it." You already do this
   in Module 2 ("Pause and find each note before he names it") — make it universal.
2. **One play-along or interactive step** using the tools the site already has:
   `playSeq`, inline `tab:`, or `chords:` diagrams (see 2.2 — these are badly underused).
3. **One listening/ear step** tied to a real song ("count the strums per chord in
   'Let It Be'" — Module 5 Set 2 already nails this).
4. *(Optional)* a second, shorter video only if it earns its time.

Rule of thumb: **max 2 videos per computer station, and always with a timestamp range,
never "(full video)."** A 12-minute JustinGuitar video is a station-killer; "(2:26–5:00)"
respects the rotation clock. Currently many steps say "full video."

### 2.2 Use your own interactive features — they're concentrated in 2 modules — [J+CC]
The app can render inline chord diagrams (`chords:`), clickable TAB (`tab:`), TAB
choice groups (`tabs:`), and play-along audio (`playSeq`). Current usage:

| Feature | Where it's used | Where it's missing and shouldn't be |
|---|---|---|
| `chords:` diagrams | Modules 3, 7 only | **Module 5 — the open-chords module — has ZERO inline chord diagrams.** Every new chord (Am, Em, C, F, G, D, A, Bm, E, B7, F#m, C#m) should appear as a diagram right in the step where it's introduced. This is the single highest-value content fix in the repo. Module 6 (strumming *with chords*) also has none. |
| `tab:` inline TAB | Modules 2, 7 | Module 8 fingerpicking patterns (p-i-m-a arpeggios) are *made* for TAB — currently described only in prose. Module 4 pentatonic licks likewise. |
| `playSeq` | Mostly warm-ups + Modules 2/4 | Module 3 power-chord root movement, Module 5 chord-tone arpeggios ("hear what a clean C should sound like"), Module 7 barre-chord roots. |

### 2.3 Add "Stuck?" and "Level up" branches to every challenge — [J+CC]
The sets currently assume one pace. In a mixed-level class working independently, every
named challenge should carry two optional lines:
- **Stuck?** — a regression. *"Stuck? Do the same drill on only frets 0–5,"* or
  *"drop to 50 BPM and win there first."*
- **Level up** — an extension for fast finishers. *"Level up: same lap at 80 BPM,"* or
  *"do it with your eyes closed,"* or *"teach it to a partner."*

This is the cheapest way to make every set deeper without touching the skill sequence:
depth comes from the same skill at more levels, not from new skills. Module 2's
"Name That Riff (give it a go!)" is already a perfect Level-up — formalize the pattern.
Rendering-wise this is just two more hint-style lines per step (tiny CC task to style
them distinctly, e.g. 🪜 and 🌶️ prefixes).

### 2.4 Put time on every station — [J+CC]
Steps don't say how long they should take, and the site *has a built-in practice timer*.
Connect them: start each station with a time budget line ("Computer station ≈ 12 min")
and reference the timer inside challenges: *"Set the practice timer to 2:00 and hold the
down-up strum until it beeps."* A student alone at a station manages themselves much
better with a clock. (Optional CC upgrade later: a step property like
`timer: 120` that renders a "⏱ Start 2:00" button which opens the timer pre-set.)

### 2.5 Give factual quiz questions an answer key — [J+CC]
Step-level multiple-choice responses currently save the student's pick but never say if
it's right (only the skills-checklist `practice` quizzes have `answer:` keys). For
*reflection* MCs that's correct behavior — but factual ones ("Which note is at fret 5?")
leave students unsure. Decide per question: reflection (no key) vs. factual (add
`answer:` + show a gentle ✓/✗ with a one-line explanation). The explanation line is the
real teaching moment: *"✗ Not quite — count up from E: F is fret 1, G is fret 3…"*
(CC wires the rendering; you mark which questions get keys and write the explanations.)

### 2.6 Make distractors do diagnostic work — [J]
Your best MC distractors encode real misconceptions ("Pressing the string too lightly,
or too far from the fret" for fret buzz — chef's kiss). Some others are giveaway-easy
("Strum as loudly as possible," "The pick gets dropped"). A quick pass per module: each
distractor should be something a real beginner actually believes. Easy test: if no
student would ever pick it, replace it with a tempting-but-wrong answer.

### 2.7 Standardize the challenge voice — [J]
Small consistency pass so every set *feels* like the same friendly coach:
- Verb-first instructions ("Fret Em and strum…" not "You should try fretting…").
- One sentence of *what*, then "Win:" — keep the *why* in the hint.
- Consistent naming: "Challenge 1 — [Catchy Name]:" everywhere (Module 1 has none yet).
- Read-aloud check: hints occasionally run 3+ sentences; cap at 2 where possible.

### 2.8 Tag song difficulty in the choice lists — [J+CC]
The song menus are a real strength (current picks like "Vampire" next to classics).
Two upgrades: (a) add a difficulty marker to each Choice song (● easy / ●● medium /
●●● stretch) so students self-select wisely; (b) reserve one visible slot per module
for "🎤 Class request — suggest a song!" feeding your once-a-semester refresh list.

---

## 3. Module-by-module punch list

### Module 1 — Introductions *(your most personal module — keep its warmth)*
- The only module with **no named challenges and no "Win:" lines** — even soft ones help:
  *"Win: you can strum all 6 strings slowly and name each one as it rings."*
- Set 2's "first melody" is the place for this module's first inline `tab:` + `playSeq`
  (Seven Nation Army riff is referenced in TODO as done for Set 2 — confirm it renders).
- Add a 30-second "guitar care" step (how to hand off / rest the guitar) — sets classroom
  norms in week 1 and costs nothing.

### Module 2 — Notes on E & A *(gold standard — minor polish only)*
- Set 1's "Happy Birthday hum-and-find" step is conceptually lovely but vague for a
  beginner working alone; give it a starter ("the first two notes are the same — try
  open A") or move it to Level-up status.
- Set 2: consider one `chords:`-style fretting-hand photo/diagram for "press just behind
  the fret" — the one skill in this module that's hard to convey in text.

### Module 3 — Power Chords
- Computer station is the pure 3-videos formula — restructure per 2.1. The shape is so
  simple that step 2 could be an interactive one: a `tab:` of E5 → G5 → A5 with playSeq.
- **Link bug:** `module-3.js:44` and `module-5.js:191` point at the *same* YouTube ID
  (`dJfV7DsTThc`) with different labels ("Power Chords for Beginners – Marty Music" vs
  "F Chord Simplified – Marty Music"). One label is wrong — verify which and fix. [CC]
- Muting deserves its own mini-challenge with a win condition ("Win: strum all 6 strings
  but only the two power-chord notes ring").

### Module 4 — Pentatonic / Improv
- Strong already (good playSeq + full-pattern TAB). Main gap: improv steps say "improvise
  freely," which freezes beginners. Add structure: *"Rule of 3 — improvise using only 3
  notes of the pattern for 4 bars, then add one more."* Constraints are kindness.
- Set 3's "compose an original solo" wants a capture mechanism — even just "write your
  4-bar solo as TAB numbers in the response box" (a `short` response with a TAB-ish
  placeholder) so it lands in Firestore and the teacher dashboard.

### Module 5 — Open Chords *(biggest upgrade opportunity in the repo)*
- **Add `chords:` diagrams for every chord at the step where it's introduced** (see 2.2).
  This module teaches ~12 chords across 4 sets with no inline diagrams; students are
  bouncing to YouTube for something the site can render natively.
- 9 watch-video steps is the joint-most of any module — apply the 2-video cap; replace
  cut videos with chord-diagram + playSeq steps ("hear each string of a clean C, then
  match it").
- The one-minute-changes drill (the classic chord-change speed test) fits perfectly
  here as a named challenge with a score the student writes into a `short` response —
  beats-your-own-record across sets = built-in depth without new skills.
- Set 4 mentions "Semester showcase preparation" — this is the natural home of the
  goal-revisit promised in Module 1 ("we'll revisit this at the end of the semester").
  Add an explicit step: re-read your Module 1 goal, write what changed.

### Module 6 — Strumming *(pending your advanced-strumming redesign)*
- Set 1 is excellent. As you rescope to advanced strumming, keep the body-first ladder
  (tap on leg → muted strings → one chord → changes) and extend it upward: accents →
  16th-note subdivision → percussive mute → syncopation, each as a named challenge.
- A strum-pattern needs a visual: D-DU-UDU in prose is hard to read. Options, lowest to
  highest effort: a monospace pattern line (`D   D U   U D U` over `1 + 2 + 3 + 4 +`),
  a tiny SVG arrow diagram (CC builds a `strumPattern:` step property, you supply
  patterns), or short looping audio via `playSeq` accent notes.
- Like Module 5, this module plays *with chords* but shows no chord diagrams — add the
  2–3 it uses (Em, Am, etc.) at first use.

### Module 7 — TAB & Barre Chords
- Good `chords:`/`tab:` usage already. 9 watch steps though — same 2-video cap.
- Barre chords are the pain-and-frustration peak of the course. This module needs the
  "Stuck?" branches of 2.3 most of all (partial barre → add strings one at a time →
  full barre), plus an honest hint about hand fatigue and when to shake it out. A
  student-friendly module here is mostly about managing morale.
- The E-shape → A-shape "same shape, new root" insight is the course's biggest aha;
  give it its own ear/quiz step rather than burying it in a video.

### Module 8 — Fingerpicking
- Practice station is strong (hand-shape hold, p-i-m-a, moving bass). The missing piece
  is **TAB for the patterns** — a p-i-m-a arpeggio over Am/C written as `tab:` steps with
  clickable notes would let students *see and hear* the pattern, not just read prose.
- Travis picking (Set 3) is a large leap; add an intermediate "pinch" challenge (thumb +
  finger together) between basic arpeggio and Travis.
- Performance-song step should reference the difficulty dots from 2.8 — fingerstyle
  choice songs range wildly (Sound of Silence ● vs Stairway ●●●).

---

## 4. Reusable step template (paste into future writing)

```
Challenge N — [Catchy Name]: [verb-first instruction, one or two sentences].
Win: [observable, self-checkable success condition].
Hint: [the one most likely failure point + fix, ≤2 sentences].
Stuck?: [easier version of the same task].
Level up: [harder version / partner version / eyes-closed / faster BPM].
⏱ [time budget or timer preset]   🔊 [playSeq if a target sound exists]
[chords:/tab: if a shape or pattern is involved]
```

Not every step needs every line — but every *challenge* step should have Win + Stuck? +
Level up, and any step that introduces a chord/pattern should have the diagram or TAB.

---

## 5. Suggested sequence

| Phase | Work | Type |
|---|---|---|
| 1 | Module 5 chord diagrams + video diet (biggest payoff) | [J+CC] |
| 2 | Fix the mod-3/mod-5 duplicate link · 2-video cap + timestamps everywhere | [CC] / [J] |
| 3 | "Stuck? / Level up" pass, one module per week starting with Module 7 | [J+CC] |
| 4 | Module 8 fingerpicking TAB · Module 6 redesign (with strum-pattern visual) | [J+CC] |
| 5 | Answer keys + distractor pass · difficulty dots on songs · challenge-voice polish | [J] then [CC] |
