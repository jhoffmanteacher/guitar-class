# PLAN — Unit 2 assessment on the site: Watchtower + SNA, or "the cure" verse + chorus on both strings

**Paste into Claude Code:** `Read PLAN-unit-2-assessment-site-v2-2026-09-15.md and carry it out in the order given. Match on quoted fragments, not line numbers. Write the Spanish twin of every edited string in the same edit, per claude_spanish-terminology.md. Stop only if a fragment is not found exactly once or the diagram CLI cannot draw the figure in §5.`

**Supersedes:** `WORK-ORDER-unit-2-assessment-both-strings-2026-09-15.md` (not applied — discard it).
**Base commit:** `6e89a03` (main, 2026-09-15) — `git fetch` and confirm.
**Requested by:** Jonathan, 2026-09-15. Calendar doc and Canvas rubric are his — no doc/deck/Canvas work here.
**Files:** `tabs/the-cure.html` (Layer 2 only), `class-activities.js` (`ca-13`, in place), `module-2.js`, one new `img/` figure, `sw.js`, `CHANGELOG.md`.

## What the assessment now says (Calendar doc, Jonathan's wording)

> **Task 1:** Play the All Along the Watchtower bass-note line on the low E string, from memory, with the metronome at song tempo & SNA on the A string from memory, with the metronome at song tempo — or the verse and chorus from "the cure" on both the E and A strings.
> **Task 2:** Name notes on the E and A strings through fret 12, and sight-read a short 2-bar bass line from TAB.

So there are two ways to pass Task 1: **(a)** Watchtower (low E) + SNA (A string), or **(b)** "the cure" verse + chorus root line, which crosses between the two strings on its own.

---

## 0. Decisions already made (do not re-ask)

| Question | Answer |
|---|---|
| "the cure" root line | **Verse + chorus, both strings, all inside frets 1–5.** Verse: A · C · A · C, then F · C · F · C. Chorus: D · F · D · F, then C · G · C · G. Frets: **A = low E 5, C = A 3, F = low E 1, D = A 5, G = low E 3.** One hand position — index fret 1, ring fret 3, pinky fret 5 — no slides, no jumps. These are exactly the Layer 3 power-chord roots, so Layer 3 needs no change. |
| Beats | Four beats per note (one bar each), one strike per beat — same count as today's verse line and as Layers 3 and 5. |
| Tempo | **Assessment is at song tempo with the backing track. The practice target on the site is 100 BPM** (Jonathan is teaching it slower than the record; 60 was too slow). Cards: start at 60, pass line 100, then the track. `assessItems` say "at song tempo with the backing track." The Journey page's "All layers are teaching arrangements at 60 BPM" note is left alone (it's a page-wide statement). |
| Old low-E verse line (A 5 · C 8 / F 1 · C 8) | Becomes the **Level up** on the cure's Layer 2, the Module 2 card, and `ca-13`'s last rung: "the verse on the low E only — a slide up to fret 8 and a jump back to fret 1." Students who learned it keep a use for it. |
| Watchtower and SNA cards | Titles say which string's assessment piece they are; tempo lines move from "60 BPM" to the 60 → 100 → track ladder. Their Journey pages are **not** touched. |
| `ca-13` | Edit in place, `id: 'ca-13'`, `number: 12` unchanged. New title: `"the cure" — Verse and Chorus Roots`. |
| Figures | One new figure `img/ca-cure-roots-both.svg` (both strings, F · G · A on the low E at 1 · 3 · 5 and C · D on the A string at 3 · 5). `img/ca-cure-roots-verse.svg` stays in `img/` and `sw.js` (archive rule). |
| Voice | Plain, concrete, no "Now …" openers, no banned phrases (checks 1m / 1w). Every drill rung ends in `You've got it when:` with one recovery move. |

---

## 1. The line (single source for every TAB below)

```
     A         C          A         C            F         C          F         C
A |------------3--3--3--3-|-----------3--3--3--3-|------------3--3--3--3-|-----------3--3--3--3-|
E |--5--5--5--5-----------|--5--5--5--5----------|--1--1--1--1-----------|--1--1--1--1----------|

     D         F          D         F            C         G          C         G
A |--5--5--5--5-----------|--5--5--5--5----------|--3--3--3--3-----------|--3--3--3--3----------|
E |------------1--1--1--1-|-----------1--1--1--1-|------------3--3--3--3-|-----------3--3--3--3-|
```

`tab.notes` data (midi = 40 + fret on E, 45 + fret on A):
verse `E5 A45 ×4, A3 C48 ×4, E5 A45 ×4, A3 C48 ×4, E1 F41 ×4, A3 C48 ×4, E1 F41 ×4, A3 C48 ×4`;
chorus `A5 D50 ×4, E1 F41 ×4, A5 D50 ×4, E1 F41 ×4, A3 C48 ×4, E3 G43 ×4, A3 C48 ×4, E3 G43 ×4`.
Where a card is showing the shape rather than the count (rungs 2–4 of `ca-13`), one note per root is fine — the caption says "4 beats each."

Fingering, stated once and reused: **index fret 1 (F), ring fret 3 (G on the low E, C on the A string), pinky fret 5 (A on the low E, D on the A string).** The only thing that moves is which string the finger lands on.

---

## 2. `tabs/the-cure.html` — Layer 2 (inside `<section class="layer l2 closed" id="layer-2">`)

| Part | New content (EN; write ES twin in `data-es`) |
|---|---|
| Intro `<p>` | Every chord has a root note, and the roots make a bassline you can play right now. Verse: **A · C**, then **F · C**. Chorus: **D · F**, then **C · G**. Five notes, two strings, and they all sit inside the first five frets — the hand never has to move up the neck. |
| Tab title | `Verse and chorus root line — teaching arrangement · low E and A strings · 4 beats per note (one bar each)` |
| `<pre class="tab-ascii">` | Both systems from §1, six-line TAB as the page already uses (e B G D lines empty). |
| Play it | **Play it:** four beats per note — strike each root once per beat, a full bar before you move. Fingering: index at fret 1 (F), ring at fret 3 (C on the A string, G on the low E), pinky at fret 5 (A on the low E, D on the A string). Say the note names out loud. Start at **60 BPM**, pass line **100 BPM**, then play it with the backing track. You've got it when: verse and chorus twice through at 100 BPM without stopping and without looking down. |
| Stuck? | Two halves. Verse first — A and C are a pinky-then-ring move across the two strings; F and C are index-then-ring. Then chorus — D and F, then C and G. Join the halves when each one runs twice clean. |
| Level up | Play the verse on the low E only: A at fret 5, C at fret 8, F at fret 1 — the hand slides up for the C and jumps back down for the F. Same notes, a different kind of hard. |
| `ready-row` | `Check it when: verse and chorus from memory at 100 BPM, no stops.` |

Layers 1, 3, 4, 5 unchanged. The Layer 3 Level up line that reads "the way Layer 2 does" still makes sense (it names its own frets) — leave it.

---

## 3. `class-activities.js` — `ca-13` replaced in place

Ladder: map → verse → chorus → the string crosses → whole song → keep going. Rung 1 is the Watchtower hand, so every student can start.

| # | `label` | `text` (EN; ES twin required) | `tab` / `figure` |
|---|---|---|---|
| 1 | The map — two strings | All five roots inside frets 1–5. Low E: **F** at fret 1, **G** at fret 3, **A** at fret 5 — the Watchtower hand. A string: **C** at fret 3, **D** at fret 5. Same three frets, one string over. | `figure: 'img/ca-cure-roots-both.svg'` |
| 2 | The verse — A · C, F · C | Four beats per note.<ol><li>Pinky, low E fret 5: "A"</li><li>Ring, A string fret 3: "C"</li><li>Back to A, then C again</li><li>Index, low E fret 1: "F"</li><li>Ring, A string fret 3: "C"</li><li>F, then C again</li></ol>Say every name. You've got it when: two clean verses in a row at 60 BPM. Ring finger catching the low E on the way to C? Arch it and land on the fingertip. | caption `Verse · low E and A string · 4 beats each`; verse notes |
| 3 | The chorus — D · F, C · G | New string for the pinky.<ol><li>Pinky, A string fret 5: "D"</li><li>Index, low E fret 1: "F"</li><li>D, then F again</li><li>Ring, A string fret 3: "C"</li><li>Ring, low E fret 3: "G"</li><li>C, then G again</li></ol>You've got it when: two clean choruses in a row at 60 BPM. Losing the C-to-G move? It's the same finger, same fret — only the string changes. | caption `Chorus · A string and low E · 4 beats each`; chorus notes |
| 4 | The string crosses | Four places where the pick changes string. Play each pair, stop, repeat.<ul><li>A → C (low E to A string)</li><li>C → F (A string to low E)</li><li>D → F (A string to low E)</li><li>C → G (A string to low E, same finger)</li></ul>You've got it when: eight clean crosses in a row without looking at the pick. Hitting both strings? Smaller pick motion — aim for one string and stop. | `phrases` — four two-note phrases |
| 5 | The whole song | Verse twice, chorus twice, four beats per note, no stops. You've got it when: verse and chorus through twice at 60 BPM, then once at 100 BPM. Falling apart at a cross? Back to rung 4 for one minute, then try again. | caption `Verse and chorus · 4 beats per note`; two `phrases` (Verse / Chorus) with the full §1 data |
| 6 | Keep going | Three ways to push it, any order:<ul><li>Climb the tempo: +10 BPM every two clean laps, up to 100</li><li>Play it with the backing track on the Song Journey page — Layer 2 of 5</li><li>Level up: the verse on the low E only — A at fret 5, C at fret 8, F at fret 1 — a slide up and a jump back</li></ul>You've got it when: the whole song with the track for a full verse and chorus without dropping out. | — |

`intro`: The Watchtower line lives on one string. This one uses two — and still never leaves the first five frets. Every chord in "the cure" has a root note; play the roots and you're playing the song's bassline.

---

## 4. `module-2.js`

**4a. "the cure" challenge** (label `'Challenge — "the cure," root line'`): new `label` `'Challenge — "the cure," verse and chorus roots (your assessment option)'`; `text` = §2 Play it in list form (directions first, `You've got it when:` verse and chorus twice at 100 BPM, no stops; keep the `Song Journey: this is Layer 2 of 5` link); `hint`: "One hand position covers every note: index fret 1, ring fret 3, pinky fret 5. The roots become power chords in Module 3 on exactly these frets."; `stuck` and `levelUp` from §2; `tab.caption` `'"the cure" — verse and chorus root line · low E and A strings · 4 beats per note'`, `tab.phrases` Verse / Chorus from §1; `response.prompt`: "Which string cross was hardest — A to C, C to F, D to F, or C to G?" (placeholder `e.g. C to G — same finger, new string`). `skills` unchanged.

**4b. Watchtower card** (label `'Challenge 3 — "Watchtower" Bass Riff (your module assessment piece)'`): label → `'Challenge 3 — "Watchtower" Bass Riff (your low-E assessment piece)'`; in `text`, `at 60 BPM` → `— start at 60 BPM, pass line 100 BPM, then the Am backing track`; `You've got it when:` → `the riff from memory at 100 BPM, in time, clean tone, correct fingering`.

**4c. SNA card** (label `'Challenge — "Seven Nation Army" at 60 BPM'`): label → `'Challenge — "Seven Nation Army" (your A-string assessment piece)'`; `text`: `with the metronome at 60 BPM` → `with the metronome — start at 60 BPM, pass line 100 BPM, then the track`; `You've got it when: two clean laps in a row at 100 BPM, every note named.`; `tab.caption` `· 60 BPM` → `· 60 → 100 BPM`. Do not touch the four-lap `'Challenge — "Watchtower" bass line'` card in Take It to a Song.

**4d. `assessItems` / `_es`** — replace item 2 only:
`'Play from memory at song tempo with the backing track: the "All Along the Watchtower" line on the low E and the "Seven Nation Army" riff on the A string — or the verse and chorus root line from "the cure" on both strings — without stopping, with clean tone and correct fingering (fingertips just behind the fret, thumb behind the neck)'`

**4e. `mr2-s7`** `text`: `'I can play the "Watchtower" bass line on the low E and the "Seven Nation Army" riff on the A string — or the "the cure" verse and chorus roots on both strings — from memory at 100 BPM with clean tone and correct fingering'`.

**4f. Song thread + song list:** Set 2 `songThread` notes → Watchtower `'the bass-note line — your low-E assessment piece'`, SNA `'the riff — your A-string assessment piece'`; `MODULE_SONGS[2]` metas → Watchtower `'Your low-E assessment piece — the bass-note riff from memory'`, SNA `'Your A-string assessment piece — the riff in time with the metronome'`, the cure (find its entry by name) `'Verse and chorus roots on both strings — the other way to pass Unit 2'`.

---

## 5. Figure + `sw.js`

Check `node tools/guitar-diagrams-cli.mjs --help` for the two-string `notes` syntax (the earlier single-string call was `notes lowE "1:F,3:G,5:A" --theme web`). Render `img/ca-cure-roots-both.svg` with F · G · A circled on the low E at 1 · 3 · 5 and C · D on the A string at 3 · 5, frets 0–5 or 0–12 as the CLI allows. If the CLI cannot mark two strings in one figure, **stop and say so** — do not hand-draw the SVG. Add `'./img/ca-cure-roots-both.svg',` to `ASSETS` in `sw.js` next to the other `ca-cure-roots-*` lines.

---

## 6. `CHANGELOG.md` (top)

```
## 2026-09-15 — "the cure" root line is now verse + chorus on both strings; Unit 2 assessment text updated

### Changed
- **"the cure" root line = verse and chorus, low E and A strings, frets 1–5 only** — A(E5) C(A3) F(E1); D(A5) F(E1) C(A3) G(E3). One hand position, no slides. Journey Layer 2, the Module 2 challenge, and class activity #12 all teach this version; the old low-E-only verse (5 · 8 / 1 · 8) is the Level up.
- **Unit 2 assessment text** (Assessments page, Module Review pop, mr2-s7): Watchtower on the low E + SNA on the A string, or "the cure" verse and chorus on both strings — at song tempo with the backing track. Practice cards now ladder 60 → 100 BPM → track.
- Watchtower and SNA challenge titles name their string. New figure `img/ca-cure-roots-both.svg`. Spanish matched on every edited line.
```

---

## 7. Checks, commit, push

1. `node tools/checks.mjs` — full run. 1d green (`ca-13` id/number unchanged, `_es` twins, figure exists), 1m and 1w green, `CACHE_VERSION` auto-bumped.
2. `grep -n "low E string only\|solo la cuerda Mi grave\|your module assessment piece\|at 60 BPM" tabs/the-cure.html class-activities.js module-2.js` → the only hits are the Level up lines and the "start at 60 BPM" ladder wording. Anything in an intro, Play it, or rung standard is a miss.
3. Every note in the new TABs: `string: 'E'` → midi = 40 + fret; `string: 'A'` → midi = 45 + fret. Play buttons: verse should sound A C A C F C F C; chorus D F D F C G C G.
4. Live Server: the cure Journey page Layer 2 (both systems visible, Play it / Stuck / Level up read as §2); Module 2 → the cure card, Watchtower card, SNA card; `#assessments` → Module 2 shows the new item 2; class activity #12 with dev bypass — six rungs, figure renders, every tab plays. Español on each.
5. Commit: `"the cure" root line: verse + chorus on both strings (Journey L2, Module 2, ca-13); Unit 2 assessment text + assessment-piece labels`
6. `git fetch` → `git log --oneline HEAD..origin/main` empty → push → `node tools/checks.mjs --live`.

## 8. After this lands (Jonathan / next session)

- Regenerate the "the cure" **paper packet** from the new Layer 2 (per `song-journey-paper-packets`), since Layer 2 changed.
- Day 16+ slides that show the cure verse TAB on the low E (Day 13 slide 9, Day 16 "Whole Verse Line") now show the Level up version — swap in a both-strings TAB slide when the deck comes up.
- Calendar: Day 12 cell to 100 BPM (Jonathan doing this).
