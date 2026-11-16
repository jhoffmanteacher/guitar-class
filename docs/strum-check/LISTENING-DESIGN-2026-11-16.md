# The listening design job: plans only, nothing ships (2026-11-16)

For Jonathan. Written by one Opus agent on the Windows computer, read at `17f5df2`; no site code changed. The lead
shortened the agent's prose and kept every table and number. The lead re-opened these quoted lines and they match:
`scHearStrum` (`coach-strumcheck.js:568-571`), the ratios and margins (`:89`, `:90`, `:140`, `:141`), the 1500 Hz
low-pass (`coach-core.js:697`) and the three `coach-core.js` banners at 1328, 1761 and 2469. Everything else is the
agent's claim until someone re-runs it.

**How to read the numbers.**
- "**Bench**" = the virtual student (`tools/mic-sim/strum-check-loop.mjs`): a made-up guitar, rooms and mic played
  into the real site code. A model's numbers.
- "**Real**" = recorded takes: Jonathan's three MacBook takes (J01 to J03; audio on the Mac only, results in
  `DETAILS.md`), and the 46 anonymized take summaries in `tools/mic-sim/takes/` (33 Power Chord Switch, 8 Listening
  Coach melody, 1 Listening Coach chords, 2 Note Runner, 2 Finger Gym). **None is a Strum Pattern check take**, and
  there are no Chromebook or classroom strum-check takes yet.
- Real takes outrank the bench whenever they disagree. "Reasoning" means reasoning, not a measurement.

---

## 1. Up-strums the Strum Pattern check does not hear

### How it hears a strum today
A frame is a strum when either test jumps above its smoothed level, more than 140 ms after the last strum
(`COACH_ONSET_REFRACT`, `coach-core.js:72`):
- **Loudness:** `rms` at least 1.15 times its smoothed level (`SC_ONSET_RATIO`), above the floor 0.003.
- **Attack:** `hf` (how fast the wave changes; a pick's click shows here) at least 1.3 times its smoothed level
  (`SC_HF_RATIO`), above the floor 0.0008.

The smoothed level closes 18% of the gap every 16.7 ms (`coach-core.js:804`, `:860-863`); by arithmetic it has
caught up about 97% after 300 ms. The mic chain cuts everything above 1500 Hz before any of this is measured.

### Why an up-strum goes unheard
In `D.DU.UDU` an up-strum usually comes one eighth after a down-strum (353 ms at 85 BPM, 300 ms at 100). By then the
smoothed level has caught up with the ringing strings, so the up-strum must add 15% (or 30% of attack) on top. It
hits fewer, thinner strings, more lightly. Part of its pick click is above 1500 Hz (reasoning: never measured).

**Real** (`DETAILS.md` section 20, at the older ratios 1.2 / 1.46): J01 missed 5 strums, 4 of them up-strums right
after a down-strum, each only 1.10 to 1.16 times the smoothed level. J02 missed 11 (7 up), J03 21 (9 up), many from
the grid sitting a slot off, since fixed. None was blocked by the 140 ms rule. With today's code the three takes are
heard 127 of 138 strums (section 24); the notes do not say how many of the 11 misses are up-strums.

**Bench today** (216 takes; 9 students; rooms quiet, class, room7, room4; 60 / 85 / 100 BPM; 2 seeds):

| strum | missed |
|---|---|
| right after another strum (slots 0, 3, 6, 7) | 451 of 6,903 (6.5%) |
| right after a rest (slots 2, 5) | 108 of 3,451 (3.1%) |
| down-strums | 272 of 5,178 |
| up-strums | 287 of 5,176 |

Quiet room only: 57 of 1,726 missed after a strum, 0 of 863 after a rest; by tempo 1 of 576 at 60 BPM, 16 of 575 at
85, 40 of 575 at 100. Worst slot: slot 6, a down-strum right after an up, 145 of 1,728.

The bench shows the cause is "right after a ringing strum", not the direction. But its up-strum is the same three
strings at the same strength in reverse order (`strum-check-loop.mjs:14`, `:103`), so it cannot show the thinner,
lighter up-strum at all. That effect is only in the real takes.

### Tried before; not re-proposed
- Lower ratios for every frame, 1.1 / 1.2: stopped (sections 22, 23 step B: talking alone passed 3 of 40 bars).
- A shorter "one sound, one strum" time (80 ms): measured, not built (section 20).
- Seven grid rules (section 20): the pattern-shape grid won and is built.
- "Ring confirmation" (`CLICK-2.md`, "B"): lost 4 to 7 of about 95 strums on the beat.

### Three candidate rules
**1A. A lower bar only where a strum is due.** Inside the window of a slot the pattern expects and has not heard
yet, the ratios drop (pilot: 1.08 / 1.15); in rests they stay 1.15 / 1.3. Unlike the stopped 1.1 / 1.2 it never
lowers the bar in a rest. Bench pilot in a scratch copy (not real guitars):

| right players (3 students, 4 rooms, 85 + 100 BPM, 2 seeds) | missed strums | bars right, rounds the gate let through |
|---|---|---|
| today | 202 of 2,300 | right 32 of 40, thumb 25 of 48, quiet 32 of 40 |
| 1A | 74 of 2,300 | right 40 of 40, thumb 40 of 48, quiet 39 of 40 |

Students who should not pass (6 rooms, 85 BPM, 1 seed): nothing played, 0 of 24 bars passed, same as today.
Beats-only (must fail): through the gate 1 of 16 today, 0 with 1A; all rounds 4 of 48 today, 7 with 1A.
**The false-pass risk is real:** the beats-only student's SKIPPED up-strum slots were heard 8 of 24 times in a quiet
room (today 3) and 18 of 24 in chatter (today 10): his own ringing down-strum is credited as the up-strum. Nothing
played in the class room: empty strum slots heard 25 of 48 (today 19).
Measure before building: (1) the bench's deciding rows of sections 22 / 23 at 85 and 98 BPM, 4 seeds, with
`--root=<copy>`; (2) **on the Mac**, the three real takes through `strum-check-replay.mjs --sweep` (the tool needs
one new field, "lower ratios inside due windows"); (3) real takes decide.

**1B. Hear the attack before the 1500 Hz cut.** A second, unfiltered tap used only for this check's attack test.
Gain (reasoning): the pick click above 1500 Hz. Risk: desk taps, the count-in click and consonants are bright too.
Only audio replays can judge it (**on the Mac**); the bench has no bright pick-click model; measure frame time on a
Chromebook. Not the same as `CLICK-2.md`'s "A" (a notch at the click's own pitch).

**1C. A rise in several frequency bands ("spectral flux").** A new kind of detector: the biggest build, danger
zone, same measurement path as 1B. Risk: speech and other guitars also change the bands.

**Before any of these:** Step 0, **on the Mac**: `strum-check-replay.mjs --diag` on J01 to J03 at today's code (each
missed strum's slot, the slot before, direction, best ratios). Step 0b, here: give the bench's student a true
up-strum (2 of 3 strings, softer), fitted against the real takes.

### Jonathan's decision: up-strums
| option | what it costs a student |
|---|---|
| **A. Leave it until Chromebook takes exist** (the agent's recommendation) | A right player sees some red up-strum arrows (real: 11 of 138 strums missed; bench, quiet, 85 BPM: 16 of 575 after another strum). |
| **B. Build 1A after the measurements** | Fewer false red arrows (bench: 202 down to 74 of 2,300), but a student who skips an up-strum is sometimes told it was heard (bench: 8 of 24, today 3). |
| **C. A missed strum shows grey ("not heard") instead of a red ✗** | No listening change. A student who really skips strums is no longer told so. |
| **D. Build 1B or 1C** | Weeks of work and two deep reviews; the gain is unknown until real audio is measured. |

---

## 2. The shared-note chord: G5 played for C5 passes

### What the vote reads today
The chord on each bar's "1" is read from the strum on slot 0: readings from 70 ms after it until 60 ms before slot 2
is due (`scOnset`, `coach-strumcheck.js:553-561`), gate 0.55. Chords: D5 = midi 50, 57, 62; C5 = 48, 55, 60; G5 =
43, 50, 55 (`class-activities.js:7450-7452`). Each reading votes for every chord that has that note or that note an
octave higher (`scChordVotes`, `:619-623`). "Ok" needs a lead of 1 vote, "wrong" another chord ahead by 2; a tie or
fewer than 3 readings goes to rule c, which passes any chord sharing a note with the bar's chord.

### Why a shared note defeats it
Known: `DETAILS.md` section 23 "Most likely to break" item 5 and section 24 R1-5. A reading of 43 is G5's root and
also C5's G an octave down, so it votes for both.

**New evidence: what real power chords read as.** From the 33 real Power Chord Switch summaries: 138 changes graded
right with 3 or more readings, 661 readings (taken at gates 0.22 / 0.45, not 0.55, over the first 340 ms only).

| chord played | changes | readings | what the readings were |
|---|---|---|---|
| C5 | 37 | 180 | C two octaves down (36) 26%, **G2 (43) 22%**, G3 8%, C3 3%, other 38% |
| D5 | 38 | 172 | D2 (38) 24%, A2 (45) 21%, A3 11%, D3 5%, other 37% |
| G5 | 46 | 225 | **G2 50%**, G3 5%, D2 5%, D3 3%, other 36% |

A real G5 almost never shows its D (8%), so almost nothing says "G5, not C5". A real C5 shows G2 in 22% of readings.
The bench's C5 reads C3 33%, C4 22%, G3 19% and the low C only 4%: **the bench alone cannot judge a chord rule.**

### Already rejected, and how these differ
`ring`, `half`, `half3` (2026-11-11) and "no readable pitch, no tick" (2026-11-07) changed whether a strum counted.
None of the candidates below touches how a strum is heard.

### Candidates, with a what-if on the real readings
Each real change's readings judged by the check's vote as if a bar of the check; "played for" judges the same
readings against another chord of the step (a stand-in, not a real wrong-chord take). Fallback in "today" is rule a.

| | today | 2A: octave down counts only for the chord's root | 2B: a pass needs 2+ readings of a note only this chord has |
|---|---|---|---|
| right C5 (of 37): right / wrong / ? | 35 / 1 / 1 | 28 / **7** / 2 | 13 / 3 / 21 |
| right D5 (of 38) | 38 / 0 / 0 | 36 / 1 / 1 | 15 / 0 / 23 |
| right G5 (of 46) | 43 / 3 / 0 | 40 / 6 / 0 | **0** / 5 / 41 |
| **G5 played for C5** (of 46): passed / caught / ? | **39** / 7 / 0 | 10 / 36 / 0 | 1 / 9 / 36 |
| C5 played for G5 (of 37) | 20 / 16 / 1 | **23** / 13 / 1 | 0 / 16 / 21 |
| D5 played for G5 (of 38) | 21 / 16 / 1 | 13 / 25 / 0 | 0 / 16 / 22 |

- **2A:** catches G5-for-C5 (39 down to 10 of 46) but calls 7 of 37 real right C5s wrong. On the bench it looked like
  a pure win (11 down to 3 of 24 passed; right bars 1,361 up to 1,385 of 1,584), the opposite of the real readings.
  **Not recommended.**
- **2B:** a right G5 would show "?" in 41 of 46 (G5 has no note of its own against C5 and D5). Too costly here.
- **2C, read more of the bar only to break a tie:** when the vote on the "1" ties, the readings after the bar's
  other strums decide. Keeps "check chord on the first down strum only" for every bar the "1" decides. Cannot be
  measured yet: the bench and the takes keep readings from the "1" only; the tool must first save the whole bar.
- **2D, a second partial:** look at the spectrum at each chord's own notes and overtones. A new detector.
- **Already on the table:** the "ok" margin back to 1 (section 24 R1-5): catches G5-for-C5 at ±20 ms, costs J02
  bar 1 (a right chord called wrong, 9 votes to 8).

### Measurement plan (real takes first)
1. **On the Mac:** the three takes through `strum-check-replay.mjs` with each candidate (23 right bars, 1 wrong
   bar), at the best clock and ±20 ms.
2. **Owed takes:** Chromebook strum-check takes with wrong chords played on purpose (G5 for C5 in bar 3, D5 for G5
   in bar 5) and a `--key` file. The only real test of a wrong chord.
3. Here: the bench through a planted copy, for 2C after the tool saves the whole bar; read after the real takes.
4. Repeat the what-if on the Power Chord Switch summaries when new ones come in (Node, seconds).

### Jonathan's decision: G5 for C5
| option | what it costs a student |
|---|---|
| **A. Leave it** (the agent's recommendation for now) | A student who plays G5 where C5 is due usually gets a ✓ (what-if: 39 of 46). No score rides on it; nobody's right chord gets a new ✗. |
| **B. Margin back to 1** | Catches it at ±20 ms too. About 1 right chord in 24 more is marked ✗. |
| **C. Build 2C after the measurements** | Some bars wait for the rest of the bar to show their chord mark; cost to right chords unknown until measured. |

---

## 3. One shared detector

### The inventory (a read-only sub-agent; the design agent re-opened the onset lines of four games)
| game | its loop | how it hears a note start | pitch | grading |
|---|---|---|---|---|
| Listening Coach | `coachLoop` core:1330 | inline copy core:1363-1365; 1.4 / 1.7 | `coachPitchReadings`, gate 0.55 chords / 0.22 melody; 70 to 340 ms after the start | match window min(1 beat, max(0.9 beat, 320 ms)); chords: 20%+ of readings on chord notes = ok, 10% or less with 3+ readings = wrong |
| Note Hunt | `fretLoop` hub:113 | `coachOnsetTick` core:1009-1011, 1.4 / 1.7 | `coachSettlePitch`, 0.22 | the exact note |
| Pentatonic Simon (guitar) | `psgLoop` ear:594 | `coachOnsetTick` | `coachSettlePitch`, 0.22 | the exact note, or the octave above unless that is another pad |
| Riff Runner Wait Mode | `rnwLoop` runner:933 | `coachOnsetTick` | `coachSettlePitch`; power chords at [0.22, 0.45] | root, 5th or octave for a power chord |
| Note Call | `ncListen` drills-call:676 | `coachOnsetTick` | `coachSettlePitch`; power at [0.22, 0.45] | root and its octaves, not the 5th |
| Change Up | `ccLoop` chords:983 | inline copy chords:1006-1012, 1.4 / 1.7 | 0.55 | `ccToneOk` (chords:918); nearest strum wins |
| Power Chord Switch | `ccLoop` | the same copy, **1.8 / 2.19** | [0.22, 0.45] | `ccToneOk`; the whole-span rule `ccSpanRule` |
| Strum Radar | `srLoop` → `srHearStrum` strum:1256 | inline copy strum:1257-1262, 1.4 / 1.7 | none | timing only; window max(90 ms, min(0.28 beat, 0.45 of the gap)) |
| Note Runner, Finger Gym | `nrLoop` noterunner:625 | inline copy noterunner:650-652, 1.4 / 1.7 | 0.55 / 0.22 | `nrFinalizeEvent`; window min(180 ms, 0.45 of the gap) |
| Strum Pattern check | `scLoop` → `scHearStrum` strumcheck:568 | inline copy, **1.15 / 1.3** | 0.55, on the "1" only | the octave vote, then rule c |
| Tuner | `tunerLoop` tuner:211 | none | its **own** detector `detectPitchYIN` (tuner:113) | n/a |

All share `coachReadFrame`, `coachSmooth`, `coachDetectPitch`, the floors 0.003 / 0.0008 and the 140 ms rule.

**Copies with different numbers:**
1. The start-of-note rule exists **6 times** (`coachLoop`, `coachOnsetTick`, `nrLoop`, `ccLoop`, `srHearStrum`,
   `scHearStrum`): one test with two ratios. The console also reads `ccLoop`'s condition as TEXT
   (`teacher-mic.js:1003`, `micEvalStrumRule`) for its strum what-if.
2. The "readings agree" rule: `coachFinalizeEvent` core:1536-1541 and `nrFinalizeEvent` noterunner:962-967, identical.
3. The loud-room melody vote: `coachMelodyVote` core:1565 and noterunner:989, the same rule.
4. The chord-tone share: the Coach's (core:1679-1684) and the check's rule a (strumcheck:204-207), the same 20% /
   10% / 3 readings; Note Runner's chord rule (noterunner:982-985) is a cousin (2 readings, no 10% band).
5. `ccToneOk` (chords:918) and `scChordB` (strumcheck:219-220): the same idea, different "wrong" rules.
6. The 0.6-semitone tolerance is a bare number in 5 more places beside `COACH_VOTE_TOL`.

**Stale comments found:** `coach-strum.js:1238-1240` said `srHearStrum` is shared with the strum-pattern check (the
check has its own `scHearStrum` since 2026-11-14), and `coach-hub.js:144` and `coach-runner.js:951` said "No onset
detector in this loop" though `coachSettlePitch` runs one: all three fixed in `d6c3e16` (2026-11-16). Still stale:
`tools/checks.mjs` (1eh's header, "run through the real srHearStrum") and the header of
`tools/mic-sim/strum-check-replay.mjs` (line 8), which still name `srHearStrum` for the check.

### What can be shared, what stays per game
Can become one function with per-game settings: the start-of-note test, "readings agree", the melody vote, the
chord-tone share; later one settings table per game that the console and tools read instead of parsing code text.
Must stay per game: the grids (each a product rule), the windows and verdict rules (2026-11-14 decision), the ratio
values (each measured on its own game's takes), the settle model against the event model, the pauses after a note,
and the tuner's own detector (separately pinned).

### Order of work, smallest safe step first
No step changes a verdict; each ships alone and is Always Reviewed (deep).
- **S0.** A Node sameness proof: all 6 copies and the new shared function on 100,000 random frames for all 4 ratio
  pairs, the same answer every time. Save today's `--json` from every bench as the reference.
- **S1.** The shared start-of-note test in `coach-core.js`; switch `coachOnsetTick`, `coachLoop`, `nrLoop`,
  `srHearStrum`, `scHearStrum`.
- **S2.** `ccLoop` and the console's text reader together (the console must be free: the Mac's area this week).
- **S3.** One "readings agree" and one melody vote. **S4.** One chord-tone share with settings (leave `ccToneOk`
  and `scChordB` apart). **S5.** The settings table.
- Only then: any behaviour change from topics 1 and 2, as a setting on for one game.

Proof for every step (all Node): `tone-test.mjs` as pinned; `closed-loop.mjs` (Power Chord Switch and
`--game=changeup`) with REAL TAKES, `--against` the reference "0 moved"; `listen-loop.mjs --game=melody|chords|
radar|runner --against` 0 moved; `replay-listen.mjs --against` 0 moved; `no-guitar-listen.mjs` the same output;
`strum-check-loop.mjs` the same `--json`; `checks.mjs` 1ck, 1cl, 1cx, 1eh; `plant-a-fault.mjs` still catches every
planted listening fault; after S2 also `eval-takes.mjs` and `fake-pw-take.mjs`.

### Jonathan's decision: one shared detector
| option | what it costs a student |
|---|---|
| **A. Do S0 to S2 at a quiet moment** (the agent's recommendation) | Nothing if the proofs say "0 moved". One place to fix the next listening bug instead of six. |
| **B. Leave the copies** | Nothing now. Every listening fix has to be made in 6 places; the stale comments show drift has begun. |

---

## 4. Splitting `coach-core.js` (2,529 lines; warning 2,000, limit 2,600: 71 lines of room)

| lines | section | lines in it | what is in it |
|---|---|---|---|
| 1-201 | header, settings, timing rules, globals | 201 | every listening setting; `let coach`, `window.coachMicLive` |
| 202-428 | Opening a card | 227 | `coachOpen`, chord slots, tab |
| 429-1327 | Card phases | 899 | Ready / Start; the mic question; the shared tools `coachReadFrame`, `coachSmooth`, `coachPitchReadings`, `coachOnsetTick`, `coachSettlePitch` (740-1101); count-in, listening screen, strip |
| 1328-1715 | Detection loop | 388 | `coachLoop`, `coachDetectPitch` (pinned), `coachFinalizeEvent`, `coachMatchEvent` |
| 1716-1760 | Finish & score | 45 | `coachFinish`, `coachRecMeta`, `coachMicOff` |
| 1761-2468 | Consented mic recordings | 708 | `micRec*` (1761-2099); under the same banner the report card (2100-2247) and the five scores (2248-2468) |
| 2469-2529 | Teardown | 61 | `coachClose`, `coachInterrupt`, the hidden-tab listener (2502), `gamesHideStop` |

**Recommended: move the end of the file, lines 1761-2529, unchanged, into `coach-report.js` loaded right after.**
Sizes 1,760 and 769. The joined arcade script stays the same text in the same order (a one-line proof); no listening
code moves, including the pinned `coachDetectPitch`. Load order: the moving `MICREC_*`, `micRec`, `micRecLocalTakes`,
`MICREC_SETTING_KEYS`, `micRecSaving` are used by no other file as it loads (searched `app/*.js`, `coach-*.js`,
`teacher-*.js`, `fab-tools.js`, `tuner.js`, `live-quiz.js`); `coachReadFrame` reads `micRec` (core:845) only while a
game runs. The hidden-tab listener is set a few milliseconds later; no game can run before then.
To update: `COACH_JS_PARTS` (`app/boot.js:778`), the `sw.js` list, `tools/plant-a-fault.mjs:138` and two entries of
`tools/plant-a-fault-known.json`, CLAUDE.md's table, and comments in `tools/golden.mjs:170`,
`tools/shared-chromebook-loop.mjs:120,128,1986`, `tools/mic-sim/local-takes-in.mjs:1`, `mic-check.html:138`,
`teacher-mic.js:394` (the Mac's this week).
Proof: the joined source identical; the full `checks.mjs`; `slow-load.mjs`; `kill-switch/proof.mjs`;
`update-reload-loop.mjs`; a golden snapshot before and after; `tone-test.mjs` and the Node listening tools (0
moved); `shared-chromebook-loop.mjs`; the change smoke for `games` and `activities`.

**Alternative: move lines 1328-2529 into `coach-listen.js`** (1,327 and 1,202). It splits the listening code across
two files, about 20 `plant-a-fault` targets move, and the new part is already 1,202 lines. It fits only with topic 3.

### Jonathan's decision: the `coach-core.js` split
| option | what it costs a student |
|---|---|
| **A. The recommended split, at a quiet moment** (the agent's recommendation) | Nothing if the proofs pass. A load-order mistake would stop every game until fixed; `slow-load.mjs` and the smoke catch that first. |
| **B. The alternative split** | The same risk, more files to re-point. |
| **C. No split now** | Nothing now. 71 lines of room; a listening fix that needs more would be blocked until decided. |

---

## What was run for this document (all Node, no browser)
On today's code, `strum-check-loop.mjs`: 36 takes (right / thumb / quiet; 4 rooms; 3 tempos; 1 seed); 216 takes (9
students; 4 rooms; 3 tempos; 2 seeds); 42 takes of students who should not pass (7 students; 6 rooms; 85 BPM); 48
takes of right players (4 rooms; 85 + 100 BPM; 2 seeds). On a scratch copy with 1A planted: the same 48 and 42.
What-ifs (scratch scripts): per-slot miss tallies; the chord rules on the bench's saved readings (they reproduce the
site's vote on 1,709 of 1,728 bars); the chord rules on the 33 real Power Chord Switch summaries (readings only).
**Not run:** any real strum-check take (Mac only) and any headless-Chrome tool.
