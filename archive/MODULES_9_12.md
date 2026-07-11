# MODULES_9_12.md — Build the Semester 2 Modules (9–12)

> **Model:** Claude Opus. **Run sessions sequentially (A → B → C → D), one session per sitting.**
> Each session builds ONE module, runs `node tools/checks.mjs`, and commits before the next begins.
> All CLAUDE.md rules apply. This doc is decision-complete: every skill, every quiz question,
> and every structural choice is specified below. Where judgment remains, it is narrow
> (step prose, hint wording) and must follow the Module 8 house style.

---

## Assumptions made in this plan (veto any of these before Session A)

1. **Four new modules, no Unit-10 module.** Module 9 = The Full Fretboard & Writing TAB
   (Unit 6) · Module 10 = Scales, Keys & Ear Training (Unit 7) · Module 11 = Chords, Keys &
   Harmony (Unit 8) · Module 12 = Fingerstyle: Travis, Waltz & Requinto (Unit 9). Unit 10
   (Semester Showcase) is a live, in-class unit — the site's role ends with Module 12's
   send-off, which points students toward the showcase.
2. **Module 8 is not restructured.** Module 12 builds *past* it (alternating thumb
   consolidated, pinch, 3/4 pattern, requinto picking). The ONLY Module 8 edit is a rewrite
   of `MODULE_REVIEWS[8].forward` (Session A) — its current text says "everything from here
   is just songs," which is no longer true.
3. **3 sets × 6 skills per module = 18 skills each** — matching Modules 6–8's shape.
4. **The one-Spanish-Choice-song-per-module rule extends to Modules 9–12.**
5. **Choice-song lists may overlap Module 8's** (Module 12 especially — deliberate: same
   songs, deeper layer, different `meta` text).
6. **Luna's corrected chords are used throughout:** F and Am the whole way, Dm as a brief
   passing chord — never "Dm–C chorus." In Module 11, Luna is analyzed as **I–iii in F major**
   (with the passing Dm as vi) — the class's proof that not everything is I–V–vi–IV.
7. **Video sourcing follows the 3-tier protocol** (below). Some sets will launch with a
   VIDEO-TODO placeholder — that is acceptable; "up even if not perfect."

---

## Hard guardrails (every session)

- **NEVER modify any existing `id:` or `skills:` field** in modules 1–8. Firebase progress
  is keyed to them. The one permitted Module 8 edit is the `forward` text (content only).
- New skill IDs follow the house scheme exactly: sets `m{N}w{n}`, skills `m{N}w{n}-s{m}`,
  review skills `mr{N}-s{k}`. Regexes in MODULE_MANIFEST are given verbatim below.
- **`skillCount` in MODULE_MANIFEST must equal the real set-level skill count** (18 per new
  module). `checks.mjs` verifies this and fails the push if it drifts.
- **Every YouTube URL used — including reused ones — must be oEmbed-verified live at
  execution time** (`curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json"`,
  HTTP 200 + quote the title in the session report). Flag dead links; NEVER substitute a
  guessed ID.
- **Song URLs are copy-only.** MODULE_SONGS entries for Modules 9–12 must be copied verbatim
  (both `originalUrl` and `tutorialUrl`) from the module file where the song already lives
  (the source file is named per entry below). If a listed Choice song cannot be found in the
  repo by grep, DROP it from the list and note it in the session report — never invent a URL.
- `node tools/checks.mjs` must pass before every push. Test in Live Server: open every new
  set, confirm zero console errors, confirm the Module dropdown and progress strip render.
- **HARD STOP** if checks fail, if an oEmbed check fails on a URL this doc says to reuse, or
  if anything requires touching an existing module's skills. Report and wait for Jonathan.

---

## Global build spec (applies to all four modules)

**File pattern.** Each module is a new `module-N.js` copied structurally from `module-8.js`:
header comment, `SETS.push( {...}, {...}, {...} );`, then `MODULE_SONGS[N] = [...]` and
`MODULE_REVIEWS[N] = {...}`. Every set has: `id`, `label` ('Set n'), `locked: false`,
`module`, `moduleNum`, `unit` ('Module N · <Name>'), `title` ('Set n'), `subtitle`,
`objective` ('I CAN …'), `skillFocus`, `comingSoon: false`, `stations` (b and c),
`assessment` ({goal, performance, selfCheck, standards}), `skills` (6 entries with `id`,
`text`, `gotItWhen`, and `practice` where specified).

**Station B shape** (copy Module 8's): sections in order — "Watch the lesson videos"
(2 steps, each with a video link, a `hint`, `skills: [..]`, and an MC `response`), "Listen
for …" (1 step + MC), "Try …" (1–2 steps + MC), "Station Wrap-Up" (1 step, `short` response
with an `e.g.` placeholder). **All MC questions are given verbatim below** in the form:
`MC: prompt | choices (in order) | answer: 0-based index | explain`. `answer` is the INDEX,
matching the house convention (see m8w1: choices [...,'Thumb',...], answer: 2).

**Station C shape**: warm-up (tuning check per Module 1 house pattern), 2–3 practice steps
(playSeq / chords specs given below where they apply), a "Take It to a Song" step, and a
Station Wrap-Up (`short` response). MIDI note numbers for playSeq are given verbatim.

**Loader/wiring.** `loadModuleData()` in app.js fetches `module-${num}.js` generically and
the dropdown + progress strip iterate MODULE_MANIFEST — so wiring a new module = ONE
manifest row + the new file. Do NOT add `<script>` tags to index.html (modules load on
demand). DO update the stale file-inventory comments at the top of index.html
("module-1.js … module-8.js" → "… module-12.js").

**MODULE_MANIFEST additions** (append after num 8, verbatim):
```js
  { num: 9,  name: 'The Full Fretboard & Writing TAB',        skillCount: 18, skillIdRe: '^m9w\\d+-s\\d+$' },
  { num: 10, name: 'Scales, Keys & Ear Training',             skillCount: 18, skillIdRe: '^m10w\\d+-s\\d+$' },
  { num: 11, name: 'Chords, Keys & Harmony',                  skillCount: 18, skillIdRe: '^m11w\\d+-s\\d+$' },
  { num: 12, name: 'Fingerstyle: Travis, Waltz & Requinto',   skillCount: 18, skillIdRe: '^m12w\\d+-s\\d+$' }
```
⚠️ Confirm `skillIdRe` for 9–12 doesn't collide with modules 1–8 (checks.mjs verifies;
note `^m1w` vs `^m10w`-style collisions are prevented by the `\\d+-s` anchor — verify anyway).

**Progress strip**: it's currently commented as "8-segment." With 12 manifest rows it renders
12 segments automatically. Visually verify on a narrow (~380px) viewport; if segments crowd,
flag in the session report — do NOT redesign the strip without approval.

**Video sourcing — 3-tier protocol** (per video slot, in order):
1. **REUSE** — a repo-verified URL named below. oEmbed-verify it anyway; quote the title.
2. **EXTRACT** — a JustinGuitar lesson page URL named below: `curl` the page, extract the
   embedded YouTube ID, oEmbed-verify it, quote the title. If extraction fails → tier 3.
3. **VIDEO-TODO placeholder** — the Watch step becomes:
   `text: 'Video coming soon — your teacher will demo this at Station A. <!-- VIDEO-TODO: <description of the needed lesson> -->'`
   with no link, keeping its `skills` and MC `response` intact. List every VIDEO-TODO in the
   session report so Jonathan can drop links in later.

**CHANGELOG.md**: one student-facing entry per session ("Module N — <name> is live…").
**WORKFLOW.md**: log each session under Open work per house style.

---
## SESSION A — Module 9 · The Full Fretboard & Writing TAB  (+ wiring + M8 forward patch)

**Session A extras (before building the module):**
1. Add all four MODULE_MANIFEST rows (above) in one edit — later sessions then only add files.
   Modules 10–12 don't exist yet, so ALSO add `comingSoon` handling: create stub files
   `module-10.js`, `module-11.js`, `module-12.js` each containing ONE placeholder set
   (`id: 'm10w1'` etc., `comingSoon: true`, no skills array … **STOP — check first**: grep how
   Module content behaved pre-build in git history / how `comingSoon: true` renders. If a
   manifest row with `skillCount: 18` but no matching skills fails checks.mjs, then instead
   add manifest rows ONE PER SESSION as each module file lands. Choose whichever approach
   passes checks.mjs; note the choice in the session report.)
2. Rewrite `MODULE_REVIEWS[8].forward` (content-only edit, keep the HTML style):
   > 'You\'ve got the full first-year toolkit — notes, chords, power chords, lead, barre,
   > strumming, and fingerpicking. <strong>Semester 2 goes deeper:</strong> Module 9 finishes
   > the fretboard (all six strings) and teaches you to write your own TAB — the first step
   > toward learning any song on your own.'
3. Update index.html's stale header comments (file inventory + "ADDING CONTENT" box).

### MODULE_SONGS[9]
Core (3): Sweet Child O' Mine — meta 'Map the intro up the neck — D & G strings' (copy URLs
from its Journey/module entries) · Luna — meta 'Punteo line crossing three strings' · Seven
Nation Army — meta 'Write the riff out as TAB yourself'.
Choice (5, copy-only; source file in parens; Spanish slot = La Diabla):
Beat It (module-3.js or module-4.js) — meta 'Riff notes across E, A & D — map them' ·
Just Like Heaven (module-8.js) — meta 'Arpeggiated riff — read it up the neck' ·
La Diabla (module-4.js or module-5.js) — meta 'Requinto line — find its notes on G & B' ·
Smoke on the Water (module-3.js or module-4.js) — meta 'Write its riff as TAB — level 2' ·
American Girl (module-3.js or module-5.js) — meta 'Bass roots on four strings'.
Levels: keep each song's existing `level` value from its source entry.

### m9w1 — Set 1 · Notes on the D & G Strings
- subtitle: 'Notes on D & G · The octave shortcut · Sharps & flats'
- objective: 'I CAN name the natural notes on the D and G strings through fret 12 and find any named note on them.'
- skillFocus: 'Natural notes on D (0–12) · Natural notes on G (0–12) · The two-string octave shape'
- Videos: [REUSE] Marty Music 'Learn Every Note on the Fretboard' — https://youtu.be/WQ8DSYD2kvw (assign 0:00–6:00) · [REUSE] JustinGuitar 'Open Notes On The Guitar' — https://youtu.be/Abrd0c92xRE (refresher).
- Station B MCs (verbatim):
  1. MC: The D string at fret 2 is which note? | D# / E / F / C | answer: 1 | explain: D to E is a whole step — two frets — with D# sitting at fret 1 between them.
  2. MC: On the G string, C sits at which fret? | 3 / 4 / 5 / 7 | answer: 2 | explain: G(0) → A(2) → B(4) → C(5). B to C is a half step, so C is only one fret above B.
  3. MC: You know A is at fret 5 on the low E string. Using the octave shape — two strings down, two frets up — where's the next A? | D string, fret 7 / G string, fret 5 / D string, fret 5 / A string, fret 7 | answer: 0 | explain: From the low E or A string, the octave lives two strings toward the floor and two frets toward the body.
  4. MC: Which two natural notes have NO sharp or flat between them? | A and B / B and C / C and D / F and G | answer: 1 | explain: B–C and E–F are the two natural half steps — one fret apart, nothing in between.
  5. MC: The D string at fret 12 is which note? | C / D / E / D# | answer: 1 | explain: Fret 12 is always the octave — the same note as the open string, one octave higher.
- Station B Wrap-Up (short): 'Which string's notes stuck faster today — D or G — and what trick helped?' placeholder: 'e.g. G was easier — only 3 naturals to fret 5; the octave shape helped me check myself'
- Station C: warm-up tuning check · playSeq 'Say-then-play — D-string naturals' bpm 60, notes [50, 52, 53, 55, 57, 59, 60, 62] · playSeq 'Say-then-play — G-string naturals' bpm 60, notes [55, 57, 59, 60, 62, 64, 65, 67] · partner flash-drill step (one names a note, the other finds it on D or G in 5 seconds) · Take It to a Song: play the Sweet Child O' Mine intro fragment on D & G, reading the TAB from its Song Journey page (tabs/sweet-child.html — reuse that TAB, do not retranscribe) · Wrap-Up (short).
- assessment: goal 'Names naturals on D & G through fret 12 · Finds a named note within 5 seconds · Uses the octave shape as a shortcut' · performance 'Teacher calls out four notes; students find each on the D or G string within 5 seconds while a partner checks.' · selfCheck 'Can you find C on the G string without counting up from open? Can you name the note two strings down and two frets up from any E-string note you know?' · standards ['Pr.4a','Pr.6a']
- skills (verbatim):
  s1 'Name the natural notes on the D string, frets 0–12, in order' — gotItWhen: naming them takes under 15 seconds with no chart — practice: playSeq 'D-string naturals, low to high' bpm 60, notes [50, 52, 53, 55, 57, 59, 60, 62]
  s2 'Name the natural notes on the G string, frets 0–12, in order' — practice: playSeq 'G-string naturals, low to high' bpm 60, notes [55, 57, 59, 60, 62, 64, 65, 67]
  s3 'Find a teacher-named note on the D or G string within 5 seconds' — practice: MC: On the D string, G is at which fret? | 3 / 5 / 7 / 9 | answer: 1 | (D→E→F→G lands at fret 5)
  s4 'Use the octave shape to find a D- or G-string note from an E- or A-string note I already know' — practice: MC: The octave shape from the low E and A strings moves you: | Two strings down, two frets up / Two strings down, same fret / One string down, two frets up / Two strings down, three frets up | answer: 0
  s5 'Play the Sweet Child O\' Mine intro fragment on the D and G strings from TAB'
  s6 'Say which two natural notes any sharp or flat on D or G sits between' — practice: MC: F# on the D string sits at which fret? | 3 / 4 / 5 / 2 | answer: 1 | (F is at fret 3, G at fret 5 — F# splits them at fret 4)

### m9w2 — Set 2 · Notes on the B & High-e Strings — Fretboard Complete
- subtitle: 'Notes on B & e · The B-string bump · The whole neck'
- objective: 'I CAN name the natural notes on all six strings and locate any named note anywhere on the neck.'
- skillFocus: 'Naturals on B (0–12) · Naturals on high e (they mirror low E) · The 3-fret octave shift onto B & e'
- Videos: [REUSE] Marty 'Learn Every Note on the Fretboard' — https://youtu.be/WQ8DSYD2kvw (6:00–end) · [TODO tier 3 if no repo fit] a lesson on octave shapes across the B string — VIDEO-TODO description: 'octave shapes crossing onto the B string (the 3-fret shift)'.
- Station B MCs:
  1. MC: The high e string's notes are the same as which other string? | The B string / The low E string / The G string / No other string | answer: 1 | explain: Both E strings are tuned to E — same note names at every fret, two octaves apart.
  2. MC: On the B string, C sits at which fret? | 1 / 2 / 3 / 5 | answer: 0 | explain: B to C is a natural half step — one fret.
  3. MC: The octave shape coming FROM the D or G string onto the B or e string moves: | Two strings down, two frets up / Two strings down, three frets up / Two strings down, same fret / One string down, three frets up | answer: 1 | explain: The B string is tuned a step "early," so every shape crossing onto B (or e) stretches one extra fret — the B-string bump.
  4. MC: The B string at fret 5 is the same pitch as which open string? | G / D / High e / A | answer: 2 | explain: B(0)→C(1)→D(3)→E(5). B at fret 5 = E, the open high-e — that's exactly how you tune by ear.
  5. MC: At the dot on fret 7, the low E string plays: | A / B / C / G | answer: 1 | explain: E→F(1)→G(3)→A(5)→B(7). Dot frets (3-5-7-9-12) are your landmarks.
- Wrap-Up (short): 'Where on the neck are you still slowest? Name the string and fret zone.' placeholder: 'e.g. B string frets 6–10 — I still count up from fret 5'
- Station C: warm-up tuning check · playSeq 'B-string naturals' bpm 60, notes [59, 60, 62, 64, 65, 67, 69, 71] · playSeq 'high-e naturals' bpm 60, notes [64, 65, 67, 69, 71, 72, 74, 76] · six-string landmark drill (name every string at the fret-5 dot, then fret 7) · Take It to a Song: play the Luna punteo/intro fragment crossing three strings, reading Layer 6 TAB from tabs/luna.html (reuse, do not retranscribe) · Wrap-Up.
- assessment: goal 'Names naturals on all six strings · Locates any named note on the neck · Plays a melody crossing 3+ strings cleanly' · performance 'Teacher names one note (e.g., "find every C below fret 12") — students mark them across all six strings, partner-checked.' · selfCheck 'Can you name all six strings at the 5th-fret dot? Can you find B on three different strings?' · standards ['Pr.4a','Pr.6a']
- skills:
  s1 'Name the natural notes on the B string, frets 0–12, in order' — practice: playSeq 'B-string naturals' bpm 60, notes [59, 60, 62, 64, 65, 67, 69, 71]
  s2 'Name the natural notes on the high e string and explain why they match the low E' — practice: MC: Why do the two E strings share the same note names? | They\'re the two thickest strings / They\'re both tuned to E, two octaves apart / It\'s a coincidence / They don\'t — they\'re different | answer: 1
  s3 'Locate any teacher-named natural note on any of the six strings'
  s4 'Use the 3-fret octave shift when crossing onto the B or high-e string' — practice: MC: You know G at D-string fret 5. Its octave on the B string is at fret: | 5 / 7 / 8 / 10 | answer: 2 | (normally +2 frets, but crossing onto B adds one more: fret 8)
  s5 'Play a melody that crosses three or more strings cleanly (Luna intro fragment)'
  s6 'Name the note at any dot fret (3, 5, 7, 9, 12) on all six strings' — practice: MC: At fret 3, the A string plays: | B / C / C# / D | answer: 1

### m9w3 — Set 3 · TAB Up the Neck & Write Your Own
- subtitle: 'Higher-position TAB · Write your own 4 bars · Slash chords & partial shapes'
- objective: 'I CAN read TAB in higher positions and write an accurate 4-bar TAB of a riff I already play.'
- skillFocus: 'Reading TAB above fret 5 · Writing TAB others can play · Slash chords (G/B) & partial-shape charts'
- Videos: [REUSE] JustinGuitar 'How to Read Guitar TAB' — https://youtu.be/FofCWizp43Y (refresher, 0:00–4:00) · [TODO tier 3] VIDEO-TODO description: 'a lesson on writing your own guitar TAB / transcribing a riff to TAB'.
- Station B MCs:
  1. MC: In TAB, the TOP line represents: | The low E string (thickest) / The high e string (thinnest) / Whichever string you like / The B string | answer: 1 | explain: TAB mirrors the guitar as you look down at it — thinnest string on top. It's the #1 rookie reading mistake.
  2. MC: Two numbers stacked in the same column of TAB mean: | Play them one after another / Play them at the same time / Choose one to play / Play the top one twice | answer: 1 | explain: A vertical stack is a chord — everything in the column sounds together.
  3. MC: A "12" written on the thinnest TAB line tells you to play: | Fret 12 on the low E / Fret 12 on the high e / String 12 / The 12th chord | answer: 1 | explain: Numbers are FRETS, lines are STRINGS — fret 12, high-e string.
  4. MC: The chord G/B (say "G over B") means: | Play G, then B / A G chord with B as its lowest note / A B chord with G on top / Either G or B | answer: 1 | explain: Slash chords name the chord, then the bass note — you met G/B inside "the cure"'s progression.
  5. MC: When you write your own TAB, the most important thing to keep readable is: | Fancy handwriting / Even spacing that shows the rhythm / Using pen, not pencil / Writing the song title | answer: 1 | explain: Spacing IS the rhythm in TAB — cramped numbers make your riff unplayable for anyone else.
- Wrap-Up (short): 'What was hardest about writing TAB — finding the frets, or spacing the rhythm?' placeholder: 'e.g. I knew the frets but my spacing squished bar 3'
- Station C: warm-up tuning check · read-and-play step: a higher-position phrase (use the Luna Layer 6 intro TAB from tabs/luna.html — it lives around the little-F shape) · WRITE step: transcribe the Seven Nation Army riff to blank TAB on paper (the riff is in Module 2 / the SNA Journey page — students write it WITHOUT looking, then check) · partner swap step: trade papers, play each other's TAB exactly as written · chords spec for the slash-chord step: { name: 'G/B', chord: [[6,'x'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 } alongside the standard G for comparison · Wrap-Up.
- assessment: goal 'Reads TAB above fret 5 · Writes a playable 4-bar TAB · Reads a slash chord from a chart' · performance 'TAB swap: each student plays a partner\'s hand-written TAB cold. If the partner can play it, the TAB passes.' · selfCheck 'Could a stranger play your TAB without hearing the song first? Can you explain what G/B means in one sentence?' · standards ['Pr.4a','Pr.6a','Cn.10a']
- skills:
  s1 'Read and play a TAB phrase written above fret 5' 
  s2 'Write an accurate 4-bar TAB of a riff I can already play' — gotItWhen: a partner plays your TAB back correctly without ever hearing you play it first.
  s3 'Space my TAB so the rhythm is readable' — practice: MC: In hand-written TAB, rhythm is shown mainly by: | Note-head shapes / The spacing between numbers / Color coding / It can\'t be shown | answer: 1
  s4 'Read a slash chord (like G/B) from a chart and play it' — practice: MC: In C/G, the lowest note you play is: | C / E / G / B | answer: 2
  s5 'Read a partial chord shape (X marks and small grids) from a chart' — practice: MC: An X above a string on a chord chart means: | Play it open / Don\'t play that string / Bend that string / Play it twice | answer: 1
  s6 'Play a partner\'s hand-written TAB back correctly'

### MODULE_REVIEWS[9]
skills (id mr9-s1…s6, one line each, set-tagged): naming D & G naturals (m9w1) · octave shape (m9w1) · all-six-strings location (m9w2) · dot-fret landmarks (m9w2) · higher-position TAB reading (m9w3) · writing a playable 4-bar TAB (m9w3).
assessItems: ['Name natural notes on all six strings through fret 12 — teacher picks the spots', 'Play a thread-song melody from TAB in a higher position', 'Hand in a 4-bar TAB you wrote yourself that a partner can play back']
forward: 'The whole neck is yours now — and you can write down anything you figure out. <strong>Module 10 turns notes into keys:</strong> you\'ll learn the recipe that builds every scale, find the key of any song, and start trusting your ear.'
standards: ['Pr.4a','Pr.6a','Cn.10a']

**Session A close-out:** run `node tools/checks.mjs` (fix flags) → Live Server: open all
Module 9 sets + spot-check Modules 1 & 8 still load → CHANGELOG + WORKFLOW entries → commit
'Module 9 — The Full Fretboard & Writing TAB' → push → session report (oEmbed titles quoted,
VIDEO-TODOs listed, any dropped Choice songs listed).

---
## SESSION B — Module 10 · Scales, Keys & Ear Training

### MODULE_SONGS[10]
Core (4): Seven Nation Army — meta 'Name its key and scale (E minor)' · All Along the
Watchtower — meta 'Am — find the relative major' · Luna — meta 'F major — why the solo uses
D minor pentatonic' · "the cure" — meta 'Transpose the progression\'s shapes to a new key'.
Choice (5, copy-only; Spanish slot = Ella Baila Sola):
Smoke on the Water (module-3.js or module-4.js) — meta 'Blues scale in its natural habitat' ·
Beat It (module-4.js) — meta 'The Em pentatonic solo — name the key by ear' ·
Ella Baila Sola (module-5.js) — meta 'Hear major vs minor in the progression' ·
House of the Rising Sun (module-8.js) — meta 'A minor — the classic minor-key sound' ·
good 4 u (grep all modules) — meta 'F# minor — transpose your box to its key'.
(If any is absent from its source file, grep all module files before dropping.)

### m10w1 — Set 1 · How the Major Scale Is Built
- subtitle: 'The W-W-H recipe · Build a scale on one string · Where pentatonics come from'
- objective: 'I CAN build a major scale on one string using the whole/half-step recipe and spell C and G major out loud.'
- skillFocus: 'W-W-H-W-W-W-H · Whole step = 2 frets, half step = 1 · Major pentatonic = major scale minus 2 notes'
- Videos: [EXTRACT] JustinGuitar 'The Major Scale: Why and How (SC-202)' — extract the video from https://www.justinguitar.com/guitar-lessons/the-major-scale-why-and-how-sc-202 · [REUSE] Marty 'Major & Minor Pentatonic Connection' — https://youtu.be/m_IiyJu60-c.
- Station B MCs:
  1. MC: The step recipe that builds EVERY major scale is: | W-H-W-W-H-W-W / W-W-H-W-W-W-H / H-W-W-H-W-W-W / W-W-W-H-W-W-H | answer: 1 | explain: Whole-whole-half, whole-whole-whole-half. Same recipe from any starting note — that's what makes it a formula.
  2. MC: On guitar, a whole step equals how many frets? | 1 / 2 / 3 / 4 | answer: 1 | explain: One fret = half step, two frets = whole step. The recipe becomes fret distances: 2-2-1-2-2-2-1.
  3. MC: C major is special among scales because: | It has one sharp / It has no sharps or flats / It\'s the hardest scale / It only works on piano | answer: 1 | explain: C is the recipe\'s "clean" starting point — all seven natural notes, C D E F G A B.
  4. MC: Follow the recipe from G and one note comes out sharp. Which? | C# / G# / F# / A# | answer: 2 | explain: G A B C D E F#. The last whole step forces F up to F# — G major\'s single sharp.
  5. MC: Major pentatonic is the major scale with which two notes removed? | 1st and 5th / 2nd and 6th / 4th and 7th / 3rd and 5th | answer: 2 | explain: Drop the 4th and 7th — the two "tension" notes — and the friendly five-note pentatonic you already solo with is what\'s left.
- Wrap-Up (short): 'In your own words: what does it mean when someone says a song is "in the key of G"?' placeholder: 'e.g. its notes and chords come from the G major scale — G feels like home base'
- Station C: warm-up tuning check · playSeq 'C major on the A string (recipe walk)' bpm 60, notes [48, 50, 52, 53, 55, 57, 59, 60] · playSeq 'G major on the low E string' bpm 60, notes [43, 45, 47, 48, 50, 52, 54, 55] · say-the-recipe-while-you-play step · Take It to a Song: hum the Let It Be melody over the C-major walk — hear that its notes live inside the scale · Wrap-Up.
- assessment: goal 'Says the recipe from memory · Builds C and G major on one string · Explains where the pentatonic comes from' · performance 'Class builds D major on one string together using only the recipe — no chart.' · selfCheck 'Can you spell G major out loud, including its sharp? Can you say which two scale notes pentatonic drops?' · standards ['Pr.4a','Cn.10a']
- skills:
  s1 'Say the major-scale recipe (W-W-H-W-W-W-H) from memory' — practice: MC: In fret distances, the recipe is: | 2-2-1-2-2-2-1 / 1-2-2-1-2-2-2 / 2-1-2-2-1-2-2 / 3-3-1-3-3-3-1 | answer: 0
  s2 'Build a C major scale on one string using the recipe' — practice: playSeq 'C major on the A string' bpm 60, notes [48, 50, 52, 53, 55, 57, 59, 60]
  s3 'Build a G major scale on one string and find the F#' — practice: playSeq 'G major on the low E string' bpm 60, notes [43, 45, 47, 48, 50, 52, 54, 55]
  s4 'Explain what a key is — the scale a song\'s notes and chords come from' — practice: MC: "This song is in A" most nearly means: | It starts loud / Its notes & chords come from the A major scale and A feels like home / It uses only the A string / It\'s at 100 BPM | answer: 1
  s5 'Explain how major pentatonic relates to the major scale' — practice: MC: The pentatonic has how many different notes? | 4 / 5 / 6 / 7 | answer: 1
  s6 'Spell C major and G major note-by-note out loud'

### m10w2 — Set 2 · Relative Minor, Parallel Minor & the Blues Scale
- subtitle: 'Every major key\'s minor twin · Relative vs parallel · Add the b5 = blues'
- objective: 'I CAN find the relative minor of any major key and build the blues scale from minor pentatonic box 1.'
- skillFocus: 'Relative minor = 3 frets down (the 6th degree) · Relative shares NOTES, parallel shares ROOT · Blues scale = minor pentatonic + b5'
- Videos: [REUSE] JustinGuitar 'Minor Pentatonic Pattern 1 (BC-176)' — https://youtu.be/G-X1RemAzks (refresher) · [VERIFY-THEN-USE] Marty Schwartz blues-scale lesson candidate — https://www.youtube.com/watch?v=qwI_-x-QE1c ('Ultimate E Blues Scale Run') — oEmbed-verify AND sanity-check the level; if it plays too advanced for a first blues-scale look, drop to VIDEO-TODO: 'a beginner lesson introducing the blues scale as minor pentatonic + b5'.
- Station B MCs:
  1. MC: The relative minor of C major is: | C minor / A minor / E minor / G minor | answer: 1 | explain: Same seven notes, different home base — count to the 6th note of C major (or slide 3 frets DOWN from C) and you land on A.
  2. MC: Relative minor vs parallel minor — the difference is: | Relative shares the same NOTES; parallel shares the same ROOT / They\'re two names for one thing / Parallel shares the notes; relative shares the root / Neither involves minor | answer: 0 | explain: A minor is C major\'s relative (same notes). C minor is C major\'s parallel (same root, different notes).
  3. MC: All Along the Watchtower lives in A minor. Its relative major is: | A major / F major / C major / G major | answer: 2 | explain: 3 frets UP from A lands on C — Am and C major share every note.
  4. MC: The blues scale is the minor pentatonic plus which extra note? | The 2nd / The b5 / The major 7th / The 4th | answer: 1 | explain: One sour-sweet note — the flat five — turns the pentatonic blue.
  5. MC: Luna is in F major, which is exactly why its solo uses: | F minor pentatonic / D minor pentatonic / A major pentatonic / C blues | answer: 1 | explain: D minor is F major\'s relative minor — same notes. That\'s why the Module 4 solo box sits at fret 10: its root is D.
- Wrap-Up (short): 'Explain relative minor to a friend in one sentence.' placeholder: 'e.g. it\'s the minor key hiding inside every major key — same notes, sadder home'
- Station C: warm-up tuning check · playSeq 'A minor pentatonic box 1 + the b5 (blues), ascending' bpm 60, notes [45, 48, 50, 51, 52, 55, 57] · relative-pairs drill: teacher/partner names a major key, student answers its relative minor (C→Am, G→Em, F→Dm, D→Bm, A→F#m) · Take It to a Song: play the blues scale over the Smoke on the Water riff feel · Wrap-Up.
- assessment: goal 'Finds any key\'s relative minor · Explains relative vs parallel · Builds and plays the blues scale at 60 BPM' · performance 'Lightning round: teacher names five major keys; class answers the relative minors in rhythm.' · selfCheck 'What\'s the relative minor of F (Luna\'s key)? Which single note makes a pentatonic a blues scale?' · standards ['Pr.4a','Pr.6a','Cn.10a']
- skills:
  s1 'Find the relative minor of any major key (6th degree / 3 frets down)' — practice: MC: The relative minor of G major is: | G minor / B minor / E minor / D minor | answer: 2
  s2 'Explain the difference between relative and parallel minor' — practice: MC: C major\'s PARALLEL minor is: | A minor / C minor / E minor / F minor | answer: 1
  s3 'Name Watchtower\'s key (Am) and its relative major (C)'
  s4 'Build the blues scale by adding the b5 to minor pentatonic box 1' — practice: MC: In A minor pentatonic at fret 5, the added blues note (b5, an Eb) sits on the A string at fret: | 5 / 6 / 7 / 8 | answer: 1
  s5 'Play the blues scale ascending and descending at 60 BPM' — practice: playSeq 'A blues scale, box 1' bpm 60, notes [45, 48, 50, 51, 52, 55, 57]
  s6 'Name relative pairs for our core songs\' keys (SNA Em↔G · Watchtower Am↔C · Sweet Child D↔Bm · Luna F↔Dm · Let It Be C↔Am)'

### m10w3 — Set 3 · Transposing & Training Your Ear
- subtitle: 'Move any pattern to any key · Sing it, then play it · Major vs minor by ear'
- objective: 'I CAN transpose a pentatonic pattern to a teacher-named key and echo short patterns back by ear.'
- skillFocus: 'Transposing = moving the root · Sing-then-play · Hearing major (bright) vs minor (dark)'
- Videos: [REUSE] JustinGuitar 'Minor Pentatonic Pattern 1' — https://youtu.be/G-X1RemAzks (as the movable-pattern anchor) · [TODO tier 3] VIDEO-TODO description: 'a beginner ear-training lesson — sing a note/pattern, then find it on the guitar'.
- Station B MCs:
  1. MC: Transposing a riff means: | Playing it faster / Moving it to a different key, keeping its shape / Playing it backwards / Adding more notes | answer: 1 | explain: The pattern is a movable shape — slide the whole thing so its ROOT lands on the new key\'s note.
  2. MC: Minor pentatonic box 1 with its root at fret 5 is A minor. Slide it to fret 7 and it becomes: | B minor / C minor / G minor / A major | answer: 0 | explain: The root fret names the key: fret 7 on the low E is B.
  3. MC: To move a pattern UP two half steps, you move it: | 2 strings up / 2 frets toward the body / 2 frets toward the headstock / You can\'t | answer: 1 | explain: Half steps are frets — two half steps = two frets up the neck.
  4. MC: To most ears, major sounds ___ and minor sounds ___: | dark, then bright / bright, then dark / loud, then quiet / fast, then slow | answer: 1 | explain: Bright-happy vs dark-moody is the first ear-training distinction — you\'ve been hearing it since Module 4.
  5. MC: The best FIRST step to playing a melody by ear is: | Guess randomly / Sing it, then hunt for your sung notes on one string / Look up the TAB / Play every fret until something works | answer: 1 | explain: If you can sing it, you know it — your hands just have to find what your voice already solved.
- Wrap-Up (short): 'Which was harder — moving the pattern to a new key, or echoing by ear? Why?' placeholder: 'e.g. echoing — I could sing it but took a while to find the starting fret'
- Station C: warm-up tuning check · transpose drill: play minor pentatonic box 1 at fret 5 (Am), then move it to teacher-named keys — fret 3 (Gm), fret 7 (Bm), fret 10 (Dm — Luna\'s solo box!) · sing-then-play: partner plays 3 notes on the low E (frets 0–5); you sing them back, then find them · echo drill: playSeq 'Echo pattern — E · G · A' bpm 60, notes [40, 43, 45] (listen once, sing, play) · Take It to a Song: over the "the cure" progression, decide by ear which chords feel bright vs dark · Wrap-Up.
- assessment: goal 'Transposes box 1 to a named key · Sings then plays a 3-note pattern · Tells major from minor by ear' · performance 'Teacher names a key; class slides box 1 to it and plays it together. Then three echo rounds by ear.' · selfCheck 'Where does box 1 sit for D minor? Can you sing a phrase from a core song and find its first note?' · standards ['Pr.4a','Pr.6a','Re.7b']
- skills:
  s1 'Transpose minor pentatonic box 1 to a teacher-named key' — practice: MC: For D minor, box 1\'s root sits at low-E fret: | 5 / 7 / 10 / 12 | answer: 2
  s2 'Move a riff up or down the neck to a new key and play it'
  s3 'Sing a short pattern, then find and play it on one string'
  s4 'Tell major from minor by ear' — practice: MC: A progression feels moody and dark. Its home chord is most likely: | Major / Minor / A power chord / A slash chord | answer: 1
  s5 'Echo back a 3-note pattern by ear on the E or A string' — practice: playSeq 'Echo pattern — E · G · A' bpm 60, notes [40, 43, 45]
  s6 'Identify whether a core-song chord sounds major or minor (Luna\'s F = bright, Am = dark)'

### MODULE_REVIEWS[10]
skills (mr10-s1…s6): recipe from memory (m10w1) · spell C & G major (m10w1) · relative minor of any key (m10w2) · blues scale built & played (m10w2) · transpose box 1 to a named key (m10w3) · major vs minor by ear (m10w3).
assessItems: ['Transpose a pentatonic pattern to a teacher-named key and play it', 'Name the relative minor of a given major key', 'Identify major vs minor — and echo a short pattern — by ear']
forward: 'You can build scales, name keys, and trust your ear. <strong>Module 11 does the same for chords:</strong> you\'ll see why Let It Be\'s four chords work, number any progression like a pro, and unlock twelve chords from one barre shape.'
standards: ['Pr.4a','Pr.6a','Cn.10a']

**Session B close-out:** checks.mjs → Live Server (Module 10 + regression spot-check) →
CHANGELOG + WORKFLOW → commit 'Module 10 — Scales, Keys & Ear Training' → push → report.

---
## SESSION C — Module 11 · Chords, Keys & Harmony

### MODULE_SONGS[11]
Core (4): Let It Be — meta 'C–G–Am–F = I–V–vi–IV, the famous four' · Luna — meta 'F–Am = I–iii
in F — proof it\'s not always the famous four' · "the cure" — meta 'Number the capo-1
progression in C' · All Along the Watchtower — meta 'Find the key from Am–G–F'.
Choice (5, copy-only; Spanish slot = Oye Mi Amor):
No Se Va (module-5.js or module-6.js) — meta 'G–C–D — a pure I–IV–V in G' ·
Oye Mi Amor (module-6.js or module-7.js) — meta 'Bm and barre practice with numerals' ·
House of the Rising Sun (module-8.js) — meta 'Number an A-minor-family progression' ·
American Girl (module-3.js or module-5.js) — meta 'D–E–G–A — find the key' ·
good 4 u (grep all modules) — meta 'Number the pop-punk loop'.

### m11w1 — Set 1 · Triads & Roman Numerals
- subtitle: 'Stack every other note · I ii iii IV V vi · The chord family of a key'
- objective: 'I CAN build triads from a scale and label a progression with Roman numerals.'
- skillFocus: 'Triad = root + 3rd + 5th · UPPERCASE major (I IV V), lowercase minor (ii iii vi) · The diatonic family'
- Videos: [EXTRACT] JustinGuitar 'How to Find Guitar Chords in a Key?' — find the lesson page on justinguitar.com (it exists in his scales/theory series), extract + oEmbed-verify; if not found → VIDEO-TODO: 'a beginner lesson on building the chords of a key / Roman numerals' · second slot: VIDEO-TODO: 'a beginner triads lesson — root, 3rd, 5th'.
- Station B MCs:
  1. MC: A triad is built by stacking: | Any three notes / Every other note of a scale: root, 3rd, 5th / Three notes on one string / The same note in three octaves | answer: 1 | explain: Skip-a-note, skip-a-note: C-E-G makes the C chord. Every chord you\'ve strummed is one of these plus doubled notes.
  2. MC: In any major key, chords I, IV, and V are major. Chords ii, iii, and vi are: | Also major / Minor / Power chords / Silent | answer: 1 | explain: The scale\'s spacing makes it automatic — uppercase numerals = major, lowercase = minor.
  3. MC: Let It Be\'s C–G–Am–F in the key of C is: | I–IV–V–I / I–V–vi–IV / ii–V–I–IV / vi–IV–I–V | answer: 1 | explain: C=I, G=V, Am=vi, F=IV — the most-used progression in pop history, and now you can name it.
  4. MC: The chord family of C major is: | C · Dm · Em · F · G · Am / C · D · E · F · G · A / Cm · Dm · Em · Fm · Gm · Am / C · Dm · E · F · Gm · Am | answer: 0 | explain: Build a triad on each scale note: major-minor-minor-major-major-minor, in every major key.
  5. MC: Luna vamps between F and Am in the key of F. In numerals that\'s: | I–vi / I–IV / I–iii / V–I | answer: 2 | explain: F=I and Am is built on F major\'s THIRD note — I–iii, a dreamier color than the famous four. Not every hit uses I–V–vi–IV.
- Wrap-Up (short): 'Pick any core song — which numeral is its home chord, and is it major or minor?' placeholder: 'e.g. Watchtower\'s home is Am — the vi of C, or "i" if you call the key A minor'
- Station C: warm-up tuning check · build-the-family drill: write out the chord families of C and G on paper, then play each family as open chords in order · numeral flashcards with a partner (name a numeral in C, partner plays the chord) · Take It to a Song: strum Let It Be while a partner calls the numerals instead of chord names · Wrap-Up.
- assessment: goal 'Builds triads from a scale · Labels a progression with numerals · Lists a key\'s chord family' · performance 'Teacher writes a 4-chord progression in C on the board; class labels it in numerals, then plays it.' · selfCheck 'What\'s the vi chord of G major? Can you explain why Am is lowercase?' · standards ['Pr.4a','Cn.10a','Re.9a']
- skills:
  s1 'Build a triad from a scale (root–3rd–5th)' — practice: MC: The notes of the C major triad are: | C-D-E / C-E-G / C-F-G / C-E-A | answer: 1
  s2 'Say which chords in a major key are major (I, IV, V) and which are minor (ii, iii, vi)' — practice: MC: In the key of G, the vi chord is: | E major / E minor / B minor / C major | answer: 1
  s3 'Label Let It Be\'s C–G–Am–F as I–V–vi–IV'
  s4 'List the chord family of C major (C Dm Em F G Am)' — practice: MC: Which chord is NOT in the key of C? | Am / F / E major / Dm | answer: 2
  s5 'List the chord family of G major (G Am Bm C D Em)' — practice: MC: In the key of G, the IV and V chords are: | C and D / A and B / F and G / D and E | answer: 0
  s6 'Label Luna\'s F–Am vamp as I–iii in F major (with the passing Dm as vi)'

### m11w2 — Set 2 · Find the Key from the Chords
- subtitle: 'The chord inventory trick · I–IV–V vs the famous four · Slash chords decoded'
- objective: 'I CAN figure out what key a song is in from the chords it uses.'
- skillFocus: 'Match the inventory to a family · The home chord feels like rest · G/B = G chord, B bass'
- Videos: [REUSE or EXTRACT] same key-finding lesson as m11w1 if it covered this; otherwise VIDEO-TODO: 'finding the key of a song from its chords' · second slot optional: reuse a core-song play-through for the analysis step.
- Station B MCs:
  1. MC: A song uses G, C, D, and Em. Its key is almost certainly: | C major / G major / D major / F major | answer: 1 | explain: All four live in G major\'s family, and G/D/C are its I, V, IV. (Em, the relative minor, shares those notes too — your ear decides between G and Em by which chord feels like home.)
  2. MC: I–IV–V in the key of A is: | A–D–E / A–C–D / A–E–F#m / A–B–C | answer: 0 | explain: Count up the A major scale: A(I), D(IV), E(V) — the backbone of blues, rock, and cumbia alike.
  3. MC: Watchtower loops Am–G–F. Which chord feels like home? | G / F / Am / None | answer: 2 | explain: The loop keeps landing back on Am — home base. Call the song A minor (C major\'s relative family).
  4. MC: "the cure" (capo 1 shapes) uses Am–C–Dm–F–G/B. In the key of C, Am–C–Dm–F is: | vi–I–ii–IV / I–V–vi–IV / ii–IV–vi–I / vi–IV–I–V | answer: 0 | explain: Am=vi, C=I, Dm=ii, F=IV — and the G/B is the V chord wearing a B in the bass to walk smoothly back to C.
  5. MC: The fastest first move to find a song\'s key from a chord chart is: | Count the chords / See which single family contains ALL the chords / Find the loudest chord / Check the tempo | answer: 1 | explain: Inventory → family → then let your ear pick the home chord (major key or its relative minor).
- Wrap-Up (short): 'Describe the "home chord" feeling in your own words.' placeholder: 'e.g. like the last word of a sentence — the loop can finally stop there'
- Station C: warm-up tuning check · inventory drill: four mystery chord sets on cards (G-C-D-Em → G · C-F-G-Am → C · D-G-A-Bm → D · Am-F-G-C → C/Am), name each key · play-and-feel: strum Am–G–F, stop on each chord in turn, vote where "home" is · slash-chord step (reuse the G/B chords spec from m9w3) walking C → G/B → Am · Take It to a Song: No Se Va\'s G–C–D as a pure I–IV–V · Wrap-Up.
- assessment: goal 'Finds a key from a chord inventory · Recognizes I–IV–V and I–V–vi–IV · Decodes a slash chord' · performance 'Key detective: teacher reveals a real song\'s chord list; class deduces the key and defends it.' · selfCheck 'A song uses D, G, A, and Bm — what key? What does the B in G/B do?' · standards ['Pr.4a','Cn.10a','Re.9a']
- skills:
  s1 'Identify a song\'s key from its chord inventory' — practice: MC: A song uses C, F, G, and Am. Its key: | F major / C major / A major / G major | answer: 1
  s2 'Recognize I–IV–V and I–V–vi–IV progressions by their numerals' — practice: MC: I–V–vi–IV in the key of G is: | G–D–Em–C / G–C–D–Em / G–Am–B–C / G–Em–C–D | answer: 0
  s3 'Number "the cure"\'s capo-1 progression in the key of C'
  s4 'Find Watchtower\'s key from Am–G–F and say why Am is home'
  s5 'Explain what a slash chord tells you (chord / bass note)' — practice: MC: In Am/E, your lowest sounding note should be: | A / C / E / G | answer: 2
  s6 'Given any three chords, name their key and each chord\'s numeral'

### m11w3 — Set 3 · Movable Barre Chords as Harmony Tools
- subtitle: 'One shape, twelve chords · Root names the chord · Play I–IV–V anywhere'
- objective: 'I CAN move the E-shape and A-shape barre chords to named roots and play a I–IV–V in any key.'
- skillFocus: 'E-shape root on the low E · A-shape root on the A string · Your Module 9 fretboard knowledge names every barre'
- Videos: [REUSE] JustinGuitar 'Basic Barre Chords #1 — the E shape (CH-006)' — https://youtu.be/MpMhueVEz2g · [REUSE] JustinGuitar 'A Shape Major Barre Chords' — https://youtu.be/C7k0CWgI-xI.
- Station B MCs:
  1. MC: The E-shape barre chord takes its NAME from: | The fret your pinky is on / The note under your barre on the low E string / The key of the song / The A string | answer: 1 | explain: The low-E root names it — barre fret 3 and the low E says G, so it\'s G major. Module 9 pays off.
  2. MC: An E-shape barre at fret 5 is: | G major / A major / C major / B major | answer: 1 | explain: Low E, fret 5 = A.
  3. MC: An A-shape barre at fret 5 is: | A major / C major / D major / E major | answer: 2 | explain: A-shape roots live on the A STRING — fret 5 there is D.
  4. MC: To play B major with the A shape, barre at fret: | 1 / 2 / 4 / 7 | answer: 1 | explain: A string, fret 2 = B.
  5. MC: One movable shape gives you twelve different chords because: | You can barre at each of the 12 frets before the octave repeats / Guitars have 12 strings / You use 12 fingers / It doesn\'t — each shape is one chord | answer: 0 | explain: Slide the shape, and the root fret renames it — one grip, the whole chromatic set.
- Wrap-Up (short): 'Open shapes or barre shapes — which would you pick for Let It Be, and why?' placeholder: 'e.g. open — it rings better; but barre F beats the mini-F once my hand is warm'
- Station C: warm-up tuning check + Finger Gym stretch (reuse https://youtu.be/XDt_4ha9Xjs reference if a warm-up link is wanted) · root-naming drill: teacher names a chord, student finds BOTH barre locations (E-shape fret + A-shape fret) · I–IV–V builder: play I–IV–V in G (G open or fret 3 barre · C · D), then in A, then teacher\'s choice · chords specs: { name: 'F (E-shape barre)', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 1 } and { name: 'Bm (A-shape barre)', chord: [[6,'x'],[5,2,'1'],[4,4,'3'],[3,4,'4'],[2,3,'2'],[1,2,'1']], position: 2 } · Take It to a Song: Oye Mi Amor\'s Bm — full barre, Module 7\'s payoff · Wrap-Up.
- assessment: goal 'Names any barre chord from its root fret · Moves one shape to three named roots · Plays I–IV–V in a named key' · performance 'Teacher names a key; students play its I–IV–V using at least one barre shape, changes in time at 60 BPM.' · selfCheck 'Where are the two places to play C major as a barre? Which shape is friendlier to your hand today?' · standards ['Pr.4a','Pr.5a','Pr.6a']
- skills:
  s1 'Play the E-shape major barre and name its root from the low-E fret' — practice: MC: E-shape barre, fret 8: | C major / G major / A major / B major | answer: 0
  s2 'Play the A-shape major barre and name its root from the A-string fret' — practice: MC: A-shape barre, fret 7: | D major / E major / F major / G major | answer: 1
  s3 'Play a I–IV–V in a teacher-named key using barre and/or open shapes'
  s4 'Move one barre shape to three different named roots' 
  s5 'Explain why one movable shape equals twelve chords' — practice: MC: To turn an E-shape G (fret 3) into an E-shape A, move: | Up 2 frets / Down 2 frets / Up 1 string / Nowhere — re-finger it | answer: 0
  s6 'Choose open vs barre voicing for a progression and say why'

### MODULE_REVIEWS[11]
skills (mr11-s1…s6): triad building (m11w1) · numeral labeling incl. Luna I–iii (m11w1) · key-from-inventory (m11w2) · slash chords (m11w2) · barre roots on both strings (m11w3) · I–IV–V in a named key (m11w3).
assessItems: ['Analyze a thread song\'s progression in Roman numerals and name its key', 'Play a I–IV–V progression in a teacher-named key — open or barre shapes']
forward: 'You can name what every chord is DOING now, and one barre grip just became twelve chords. <strong>Module 12 is the victory lap:</strong> fingerstyle goes deep — alternating thumb, waltz patterns, and the requinto sound — everything you need to pick your showcase song.'
standards: ['Pr.4a','Pr.6a','Cn.10a','Re.9a']

**Session C close-out:** checks.mjs → Live Server → CHANGELOG + WORKFLOW → commit
'Module 11 — Chords, Keys & Harmony' → push → report.

---
## SESSION D — Module 12 · Fingerstyle: Travis, Waltz & Requinto  (+ final cross-check)

> Module 12 assumes Module 8 is done: p-i-m-a assignments, the 6-note arpeggio, and a first
> taste of Travis. Every skill here is NEW ground past m8w3 — do not re-teach Module 8.

### MODULE_SONGS[12]
Core (3): "the cure" — meta 'Full fingerpicked verse — its native style, the ◐ comes off'
(copy URLs from module-8.js) · Let It Be — meta 'Arpeggiated C–G–Am–F with your chosen
pattern' (module-8.js) · Luna — meta 'The fingerpicked intro — rolls through the little-F
shape' (copy Core URLs from any Luna entry; Journey: tabs/luna.html).
Choice (5, copy-only from module-8.js; Spanish slot = Tu Boda):
House of the Rising Sun — meta 'Bass-note + pinch — the alternating-thumb classic' ·
Tu Boda — meta 'Requinto intro line, fingerstyle — the real sierreño sound' ·
Sailor Song — meta 'Fingerpicked verse, capo IV — pattern endurance' ·
Blackbird — meta 'The capstone challenge — pinches and moving shapes' ·
Just Like Heaven — meta 'Turn the arpeggiated riff into a picking pattern'.

### m12w1 — Set 1 · Alternating Thumb & the Pinch
- subtitle: 'The thumb becomes a drummer · Pinch on the downbeat · Fills between'
- objective: 'I CAN keep an alternating thumb-bass going and add pinches and finger fills over it.'
- skillFocus: 'Thumb alternates two bass strings in quarter notes · Pinch = thumb + finger together · The thumb NEVER stops'
- Videos: [REUSE] JustinGuitar 'Folk Fingerstyle Patterns #1 — Travis Picking (FO-101)' — https://youtu.be/rGt-lMXYzZc · [REUSE] JustinGuitar 'Basic Fingerstyle — Travis Finger Picking (FO-108)' — https://youtu.be/K2Z3RZc5t-A (this was Module 8\'s teaser — now it\'s the main event; assign the full pattern section).
- Station B MCs:
  1. MC: In Travis-style picking, the thumb\'s job is to: | Play melody / Alternate steadily between two bass strings like a drummer / Strum / Rest | answer: 1 | explain: The thumb is the engine — steady quarter notes on two bass strings while the fingers decorate on top.
  2. MC: A "pinch" is: | Two fingers on one string / Thumb and a finger plucking together on the beat / Muting the strings / A very quiet note | answer: 1 | explain: Bass and treble sound at the same instant — the signature Travis accent.
  3. MC: On a C chord, the alternating thumb usually bounces between: | Strings 6 and 5 / Strings 5 and 4 (or 5 and 3) / Strings 2 and 1 / Any two strings at random | answer: 1 | explain: The root (A string) and a neighbor — the C chord\'s bass lives on string 5, so the thumb anchors there.
  4. MC: If your fingers get lost mid-pattern, what must keep going no matter what? | The melody / The thumb bass / The metronome app / Your foot | answer: 1 | explain: Rule one of Travis: the thumb never stops. Fingers can rejoin on the next beat.
  5. MC: Compared to Module 8\'s p-i-m-a-m-i arpeggio, the Travis feel differs because: | It\'s faster / The thumb ALTERNATES between bass strings instead of staying put / It uses a pick / It only works on electric | answer: 1 | explain: Module 8 parked the thumb per chord; now it walks — that bounce is the whole style.
- Wrap-Up (short): 'What tempo could you hold the alternating thumb today without it stumbling?' placeholder: 'e.g. solid at 60 BPM; at 70 my thumb followed my fingers and fell apart'
- Station C: warm-up tuning check · thumb-only step: alternate strings 5↔4 in quarter notes, 60 BPM, 8 bars, zero finger notes · add-the-pinch step: pinch (thumb string 5 + m on string 2) on beat 1, thumb alone beats 2–4 · fills step: thumb keeps going, add i on the "and" of 2 · chords: { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 } and { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 } for the Am↔C change with the pattern unbroken · Take It to a Song: House of the Rising Sun, bass-note + pinch verse · Wrap-Up.
- assessment: goal 'Alternating thumb in steady quarters · Clean pinch on the downbeat · Pattern survives an Am↔C change' · performance 'Class thumb-drums together at 60 BPM for 16 bars; teacher listens for anyone\'s thumb stopping when fills enter.' · selfCheck 'Can your thumb keep going while you talk? Does the pinch land exactly together, or does one note leak first?' · standards ['Pr.4a','Pr.5a','Pr.6a']
- skills:
  s1 'Alternate the thumb between two bass strings in steady quarter notes' — practice: playSeq 'Thumb alternation on C — strings 5 & 4' bpm 60, notes [48, 52, 48, 52]
  s2 'Play a pinch (thumb + finger together) on the downbeat' — practice: MC: A pinch means the bass and treble notes sound: | One after the other / At exactly the same time / Only on beat 3 / Muted | answer: 1
  s3 'Add i-m finger fills while the thumb keeps alternating'
  s4 'Play a Travis-feel pattern over C at 60 BPM for 8 bars'
  s5 'Keep the alternating pattern unbroken through an Am–C change'
  s6 'Play a bass-note + pinch verse of House of the Rising Sun' — gotItWhen: the verse survives every chord change with the thumb never stopping.

### m12w2 — Set 2 · The Waltz Pattern & Songs in Their Native Style
- subtitle: 'Picking in 3 · "the cure" finally at home · Your pattern, your song'
- objective: 'I CAN fingerpick in 3/4 time and play "the cure" and Let It Be in their native fingerstyle.'
- skillFocus: 'The 3/4 pattern: bass–pluck–pluck · Feeling 3 vs 4 · "Native style" — why the ◐ disappears'
- Videos: [REUSE] Marty 'Beginner Fingerpicking Made Easy: Pinch, Pluck, & Play!' — https://youtu.be/YZkkUjDDamA (the pinch/pattern half) · [TODO tier 3] VIDEO-TODO description: 'a beginner 3/4 (waltz) fingerpicking pattern lesson — bass on 1, plucks on 2 and 3'.
- Station B MCs:
  1. MC: In 3/4 time, each bar has: | 4 beats / 3 beats / 2 beats / 6 beats | answer: 1 | explain: Count ONE-two-three, ONE-two-three — the waltz. Your bass note owns beat one.
  2. MC: The simplest 3/4 picking pattern is: | pluck–pluck–bass / bass–pluck–pluck / bass–bass–bass / pinch–pinch–pinch | answer: 1 | explain: Thumb states the bar on beat 1; fingers answer on 2 and 3.
  3. MC: Which class song has been our 3/4 (waltz) vehicle since Semester 1? | Seven Nation Army / Happy Birthday / Beat It / Let It Be | answer: 1 | explain: Happy Birthday is a waltz — you strummed it "in 3" in Module 6-era work; now you pick it in 3.
  4. MC: Playing "the cure" fingerstyle removes its ◐ flag because: | It\'s easier / Fingerpicking IS the song\'s native style — no more "against the grain" / The capo comes off / The flag was a mistake | answer: 1 | explain: The ◐ marked renderings that fought a song\'s nature (like power-chording a gentle ballad). Fingerpicked, "the cure" is finally itself.
  5. MC: Keeping a pattern "unbroken" through a chord change mostly depends on: | Faster fingers / Moving the fretting hand early, on the bar\'s last note / Louder plucking / Skipping the bass note | answer: 1 | explain: The m8w3 trick, now at pattern speed — the fretting hand travels while the picking hand finishes the bar.
- Wrap-Up (short): 'Which felt more natural — picking in 4 or in 3? What does the waltz feel do to the song?' placeholder: 'e.g. 3 kept surprising me — but it makes Happy Birthday float instead of march'
- Station C: warm-up tuning check · count-and-pick step: 3/4 pattern on one chord, counting aloud, 60 BPM · playSeq '3/4 pattern on C — bass, then G string, then C on the B string' bpm 60, notes [48, 55, 60] · native-style step: "the cure" capo 1, fingerpick Am–C–Dm–F one bar each, pattern of choice · Let It Be step: arpeggiate C–G–Am–F, chosen pattern, 70 BPM target · Take It to a Song: Happy Birthday in 3, fingerstyle · Wrap-Up.
- assessment: goal 'Picks a 3/4 pattern in time · Plays "the cure" or Let It Be fingerstyle with the pattern unbroken · Explains "native style"' · performance 'Half the room picks in 4, half in 3, then swap — teacher checks that beat 1 always carries the bass.' · selfCheck 'Can you count aloud while picking in 3? Does your pattern survive the F chord?' · standards ['Pr.4a','Pr.5a','Pr.6a','Re.8a']
- skills:
  s1 'Play a 3/4 fingerpicking pattern (bass–pluck–pluck) in time' — practice: playSeq '3/4 pattern on C' bpm 60, notes [48, 55, 60]
  s2 'Count and feel the difference between 3/4 and 4/4 while picking' — practice: MC: A waltz pattern repeats every: | 2 beats / 3 beats / 4 beats / 8 beats | answer: 1
  s3 'Fingerpick "the cure"\'s capo-1 shapes — its native style'
  s4 'Fingerpick Let It Be\'s C–G–Am–F with a pattern of my choice'
  s5 'Keep my pattern unbroken through a 4-chord progression at 70 BPM'
  s6 'Play Happy Birthday\'s waltz feel fingerstyle'

### m12w3 — Set 3 · Requinto-Style Picking & Your Showcase Pattern
- subtitle: 'Melody on top, thumb below · Luna\'s intro for real · Choose your showcase voice'
- objective: 'I CAN blend melody into a picking pattern requinto-style and perform one full fingerpicked verse.'
- skillFocus: 'The requinto role in sierreño · Melody notes ride ABOVE the thumb bass · Pick the pattern you\'ll perform with'
- Videos: [TODO tier 3] VIDEO-TODO description: 'requinto / sierreño-style guitar picking introduction — Spanish-lane content; Jonathan reviews before it goes live' · [REUSE] Luna\'s Song Journey Layer 6 (tabs/luna.html) serves as the on-site "lesson" for the intro — link the Journey page in the Watch step\'s text.
- Station B MCs:
  1. MC: In a sierreño group, the requinto is: | The bass / A smaller, higher-pitched guitar that carries the melody / The singer / A drum | answer: 1 | explain: Requinto sings the melodic lines you\'ve been hearing in Luna, Tu Boda, and La Diabla since Week 1\'s tone-ID days.
  2. MC: Luna\'s fingerpicked intro rolls through which chord shape? | Full barre F / The little F (xx3211) / Open C / Am | answer: 1 | explain: Same little-F you learned in Module 5 — the intro arpeggiates it one note at a time (Journey Layer 6).
  3. MC: "Melody on top" in fingerstyle means: | Play only high notes / The tune rides the treble strings while the thumb keeps the bass going underneath / The melody comes first, chords after / Sing while playing | answer: 1 | explain: Two jobs, one hand — the requinto texture in a nutshell.
  4. MC: Why does fingerstyle make our regional-Mexican songs sound MORE authentic than power chords did? | It\'s louder / Sierreño is an acoustic, fingerpicked tradition — this is its real timbre / It isn\'t / Distortion is illegal | answer: 1 | explain: Module 3 flagged those renderings ◐ — against the grain. This set is the grain.
  5. MC: The smartest way to choose your showcase pattern is: | The hardest one / The one you can keep unbroken at performance tempo TODAY / A random one / Whatever your neighbor picks | answer: 1 | explain: Performances reward reliability, not difficulty — pick the pattern that never breaks, then make it musical.
- Wrap-Up (short): 'Name your showcase song and pattern — and the one spot you\'ll drill this week.' placeholder: 'e.g. "the cure," 6-note pattern — the Dm-to-F change still hiccups'
- Station C: warm-up tuning check · Luna intro step: Layer 6 rolls from tabs/luna.html, slow then at tempo · Tu Boda step: requinto intro line fingerstyle (its TAB references live with the song\'s Module 6–8 material — reuse, don\'t retranscribe) · melody-on-top step: over C, keep thumb quarters and pick a 3-note melody on strings 1–2 · choose-your-pattern step: run ALL patterns learned (6-note · Travis · pinch · 3/4) over one chord, pick one, write it down · full-verse rehearsal: one complete fingerpicked verse, no stopping, mistakes recovered · Wrap-Up.
- assessment: goal 'Plays the Luna intro rolls · Blends melody over a steady thumb · Performs one full fingerpicked verse, recovering from mistakes' · performance 'Mini-showcase: each student plays one verse for their station group; the group names one strength + one target.' · selfCheck 'Can you keep the thumb going while the melody enters? Did you finish the verse even where you slipped?' · standards ['Pr.4a','Pr.5a','Pr.6a','Cn.11a']
- skills:
  s1 'Play Luna\'s fingerpicked intro (Journey Layer 6) with p-i-m rolls'
  s2 'Play Tu Boda\'s requinto intro line fingerstyle'
  s3 'Explain the requinto\'s role in sierreño / corridos tumbados' — practice: MC: The requinto\'s job in the group is: | Rhythm chords / The melodic lead lines / Bass / Percussion | answer: 1
  s4 'Blend melody notes into a picking pattern — tune on top, thumb bass below'
  s5 'Choose and name the picking pattern I\'ll perform with' — practice: MC: Your showcase pattern should be the one that: | Impresses the most / Never breaks at performance tempo / Uses all four fingers / Is newest | answer: 1
  s6 'Perform one full fingerpicked verse start to finish, recovering from any mistake' — gotItWhen: you reach the last bar without stopping — slips allowed, stops not.

### MODULE_REVIEWS[12]
skills (mr12-s1…s6): alternating thumb 8 bars (m12w1) · pinch on the downbeat (m12w1) · 3/4 pattern in time (m12w2) · "the cure"/Let It Be native-style verse (m12w2) · melody-over-thumb requinto texture (m12w3) · full-verse performance with recovery (m12w3).
assessItems: ['Play one full fingerpicked verse with a steady thumb bass and a clean, unbroken finger pattern — flagship options: "the cure" (capo 1) or Let It Be', 'Show your chosen showcase pattern and name it']
forward: 'Twelve modules — the whole toolkit, twice as deep as most first-year players ever get. <strong>Now comes the Semester Showcase:</strong> pick your song, pick your lane — strummed, fingerpicked, or riff + solo — and get it performance-ready. This website got you here; the stage is yours. And after the showcase? Keep the list of songs you want to learn, and go learn them — you know how now.'
standards: ['Pr.4a','Pr.5a','Pr.6a','Cn.11a']

**Session D close-out (final):**
1. checks.mjs → Live Server FULL pass: open every set of all 12 modules, zero console errors;
   dropdown shows 12; progress strip renders 12 segments (check a ~380px viewport — flag
   crowding, don\'t redesign).
2. Verify MODULE_MANIFEST ↔ skills sync for 9–12 one last time (checks.mjs does this — read
   its output, don\'t assume).
3. Confirm the "X of 12 modules" label reads correctly (it derives from MODULE_MANIFEST.length).
4. CHANGELOG entry + WORKFLOW log + commit 'Module 12 — Fingerstyle: Travis, Waltz & Requinto
   — all Semester 2 modules live' → push.
5. Final report: every oEmbed title quoted · all VIDEO-TODOs across all sessions in one list ·
   any dropped Choice songs · the strip-width verdict · anything that needs Jonathan\'s eyes.

---

## What is explicitly OUT of scope (do not do, even if it seems helpful)

- No changes to modules 1–7, and none to Module 8 beyond the Session A `forward` rewrite.
- No new Song Journey pages, no edits to existing Journey TABs.
- No Unit-10 / showcase module, no recording features, no DAW anything.
- No semester-map or rubric edits (the S2 map has known stale Luna text — Jonathan handles
  the map separately).
- No renaming of existing manifest entries, no strip redesign, no styles.css changes.
