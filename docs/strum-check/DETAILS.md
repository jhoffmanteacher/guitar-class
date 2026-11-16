# Strum-pattern check on ca-46: details (2026-11-14)

> **Copied into the repo 2026-11-16** from the Mac's untracked `Claude outputs/strum-coach/DETAILS.md`, unchanged below
> this note, so a session on the Windows computer can read it (Jonathan cannot paste between his computers). It is a
> record of what was measured, not a rule file. Where it says `Claude outputs/strum-coach/`, the screenshots stayed on
> the Mac; `CLICK-2.md` is beside this file. The three real takes it replays (section 20) are Jonathan's own
> MacBook-mic takes and exist only on the Mac: on Windows the bench numbers can be made again with
> `node tools/mic-sim/strum-check-loop.mjs`, the real-take numbers cannot.

Branch `feat/strum-coach` in `.claude/worktrees/strum-coach`, on `cc9fcfb`. Nothing pushed.
EVERY NUMBER BELOW IS THE VIRTUAL STUDENT'S (tools/mic-sim/strum-check-loop.mjs). There are 0 real strum-pattern takes and 1 real
Listening Coach chord take; none of the numbers here was checked against a real guitar.

## 1. What was built

- **Where it appears:** ca-46 "Strum Pattern — Down, Down-Up, Up-Down-Up", the shared step "Practice — D5, C5, G5" (flat index 6,
  both paths end there), the eight bars D5 D5 C5 C5 G5 G5 D5 D5. The data flag is `listen: true` on that step's `strum` spec
  (`class-activities.js`). `buildStrum` (app/tab.js) draws the site's green "Listening Coach — click here to get feedback" button inside
  the step's BPM group (`strumCheckBtnHtml`), opening through `coachOpenLazy` like every Coach button. The console preview draws no
  button (IS_TEACHER_MODE), the paths chooser's silent preview draws none (no keyPrefix), no other strum step draws one.
- **The card** (`coach-strumcheck.js`, new part, loaded last in `COACH_JS_PARTS` and listed in `sw.js` after `coach-more.js`):
  ready screen (one-line target, -5/+5 BPM from the step's slider, 40-125, two tips, the set-up line, Start) -> the mic through
  `coachAcquireMic({ el, records: true })` (the "Turn on the microphone" panel) -> 4-click count-in (`coachCountIn`) -> listening:
  the page's OWN strum board is marked live (the slot the beat is on; a strum heard in its slot goes green at once; a missed strum or a
  strum where the hand should miss turns red when the bar is over; the chord's ✓ / ✗ / ? beside its name on the 1) and one status
  line gives the last bar's sentence -> the end: one summary line plus a line for each bar that was not all right, and Try again.
- **Judging:** slot by slot, never by direction. Strum Radar's detector, moved unchanged into `srHearStrum` (coach-strum.js) and called
  by both: the shared `CHK_ONSET_RATIO` 1.4 / `CHK_HF_RATIO` 1.7, the 140 ms refractory, the grid that eases 20% toward each strum
  within 0.45 of an eighth, the per-machine mic delay (`nrOffset`). A strum counts for a slot only inside `SC_WIN_FRAC` = 0.35 of an
  eighth (175 ms at 60 BPM, 131 at 80, 105 at 100, 84 at 125) — the same window for a slot where the hand misses: a strum there is a
  fault ("a strum on “3”, where the hand should miss"). A strum slot with nothing inside its window is missed. A second sound inside a
  slot already hit, or a sound between windows, is logged and never judged.
- **The chord:** read only on the strum that hits slot 0 (`scOnset` opens the reading for slot 0 alone): YIN readings at the Coach's
  chord gate 0.55 from 70 ms after that strum to 60 ms before slot 2 is due (free: slot 1 is a slot where the hand misses). Three rules
  are computed on every bar and saved; `SC_CHORD_RULE` = 'c' is shown (section 4).
- **Saves nothing to progress:** no saveGames, no games.*, no step tick; the step's own count dots and Next stay the finish
  (checks.mjs 1eh runs a whole finish with a counting saveGames: 0 calls, 0 games keys). `tools/save-loop.mjs` and `app/save.js` untouched.
- **Exits** (rule 4 of code-hygiene): `coachClose` calls `scClose` (another card, Strum Radar or any game, Note Call, navigation in
  shell.js / explore.js), `coachInterrupt` calls `scInterrupt` (the tuner, a recorder, a hidden tab: back to the ready screen with the
  reason), the card leaving the page (a language switch or a Focus step move) stops the loop at its next frame, `coachReleaseMicIfIdle`
  counts the check (`scMicActive`), the ✕. Each one cancels the frame loop and the count-in timers, turns the mic off (which also drops
  an unfinished recording) and takes the board's marks off.

## 2. Files touched (line counts after)

| file | what | lines |
|---|---|---|
| coach-strumcheck.js | new part | 499 |
| coach-strum.js | srHearStrum (the strum detector, moved whole; two named constants for its 0.2 / 0.45) | 1448 |
| coach-core.js | 5 hooks; `micRecStart(mode, maxSec)` (default unchanged); two comments | 2468 (over 2,000 already: 2,457 before) |
| app/tab.js | strumCheckBtnHtml + one call | 703 |
| app/boot.js | COACH_JS_PARTS + 'coach-strumcheck.js' | 1713 |
| teacher-mic.js | the row label "Strum pattern check · 8 bars"; a comment (60 s, 5 chunks) | 1795 |
| i18n.js | 18 `sc.*` keys, EN + ES | |
| styles.css | 9 rules (.sc-*) | |
| class-activities.js | `listen: true` on ca-46's eight-bar strum spec | |
| sw.js | the list (+ './coach-strumcheck.js'); version lines NOT touched (the full checks.mjs rewrites them) | |
| tools/checks.mjs | 1eh (new); 1cy `callersWithAsk` 8 -> 9 (scStart passes the panel's place: a new caller, re-pinned on purpose) | |
| tools/smoke.mjs | strumWalk: the check opened, the mic refused through the panel, closed, the step still usable | |
| tools/mic-sim/strum-check-loop.mjs | new: the closed loop | |
| tools/mic-sim/takes-in.mjs | leaves `game: 'strumcheck'` takes out of the summaries (and says how many) | |
| CLAUDE.md | the arcade row of "Where the code lives" names the new part | |

Not touched: coach-chords.js, check 1du, teacher-mic.js `matchRound`, candidates.mjs / replay-takes.mjs / change-window.mjs (the other
agent's), firestore.rules, CHANGELOG.md, the sw.js version lines, tone-test pins (1cx).

## 3. The virtual student (tools/mic-sim/strum-check-loop.mjs)

A sibling of listen-loop.mjs: the real site in closed-loop.mjs's vm (benchSite), the button the site renders for ca-46 read back from
`buildStrum`'s own HTML, `coachOpen` -> `scStart` -> `coachCountIn` -> `scLoop` -> `scFinish` on a virtual clock, every verdict the
site's. The student (note-student.mjs's NotePlayer: its guitar, hands, rooms, desk tap and muted scratch) plays D.DU.UDU as power chords
from the activity's own frets (checked against the button's notes), an up strum high to low, the fretting hand leaving the old chord
40 ms before a change. The key per slot (played / absent / near; quiet / extra / near: a quarter vs half an eighth) is written from the
student's own sound list before any verdict and checked against the student's guitar track; `--break=key` flips one entry and the run
stops (exit 2: "fake-world check failed: bar 1 slot 0 says no strum near 5170 ms, and the student's guitar has an attack there").
Every take also asserts the check wrote nothing to `games` and never called saveGames (0 in all 978 takes run below).
Runs (JSONs and text in the session scratchpad `strumcheck/`): A = right, foot tap -12/-6 dB, hand graze -20/-14 dB, quiet, 40-125 BPM,
13 seeds (325 takes, 2,600 bars); B = every kind, quiet, 60/80/100, 2 seeds (258 takes); C = 15 kinds in class / room7 / room4, 60/80/100
(135 takes); D = held / wrong / fret-off chords, quiet, 60/80, 10 seeds (180 takes); what-ifs at lower ratios (4 x 64 takes).

### 3N. NOW (round 2, the lead's decisions): the check's OWN ratios 1.2 / 1.46 and the tempo limit 80 BPM
`SC_ONSET_RATIO` 1.2 / `SC_HF_RATIO` 1.46 live in coach-strumcheck.js; scStart puts them on the check's state and srHearStrum reads
`s.onsetRatio || CHK_ONSET_RATIO` (Strum Radar's state has none, so it reads 1.4 / 1.7 as before). Quiet room, 13 seeds = 104 bars a cell:
| tempo (BPM) | 40 | 60 | 70 | 80 | 82 | 84 | 85 | 90 | 95 | 100 | 125 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| right: strums missed of 624 | 0 | 2 (0.3%) | 12 (1.9%) | 22 (3.5%) | 31 (5.0%) | 30 (4.8%) | 42 (6.7%) | 55 (8.8%) | 60 (9.6%) | 82 of 622 (13.2%) | 139 of 616 (22.6%) |
| right: bars all ✓ of 104 | 104 | 102 | 93 | 82 | 74 | 76 | 70 | 55 | 54 | 44 | 11 |
| right: wrong extras per 100 bars | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 2.9 |
**The limit: 80 BPM** (`STRUM_CHECK_MAX_BPM`, app/tab.js): the highest tempo clearly inside "at most 5% missed and at most 1 wrong
extra per 100 bars". 82 and 84 sit on the 5% edge (5.0%, 4.8%: inside the seed noise), 85 is out (6.7%). Above 80 the button is disabled
with "Slow to 80 BPM or less to use the check." / "Baja a 80 BPM o menos para usar el chequeo." under it (follows the slider live;
the card's -5 / +5 stop at 80). Screenshots 9-disabled-over-limit-en / -es.
| other students, quiet, 104 bars | 40 | 60 | 80 | 100 | 125 |
|---|---|---|---|---|---|
| foot tap -12 dB: missed of 624 / wrong extras per 100 bars | 0 / 0 | 0 / 0 | 27 / 0 | 82 / 0 | 135 / 2.9 |
| foot tap -6 dB | 0 / 0 | 1 / 0 | 33 / 0 | 74 / 0 | 135 / 3.8 |
| hand graze -14 dB | 0 / 0 | 2 / 0 | 20 / 0 | 80 / 1.0 | 124 / 1.0 |
| hand graze -20 dB | 0 / 0 | 1 / 0 | 24 / 0 | 86 / 0 | 136 / 2.9 |
| thumb (13 seeds) | - | 33 of 624 (5.3%), bars 75 / 104, extras 0 | 116 of 624 (18.6%), bars 22 / 104, extras 0 | - | - |
Up to the 80 BPM limit: wrong extras 0 in every quiet cell (right, both foot taps, both grazes, thumb: 0 in 104 bars each).
**Class room (information only; Jonathan: assume quiet), 4 seeds = 32 bars:** right at 60: 1 of 192 missed, 31 / 32 bars, 0 wrong extras;
at 80: 12 of 192, 20 / 32 bars, 0 extras. Nothing played at 60: 68 of 192 strum slots "heard" and 26 wrong extras in 32 bars (81 per
100); at 80: 46 of 192 and 19 (59 per 100); the chord on the 1 with nothing played was called right 6 of 16 times (rule c) — the
neighbours' guitars. The loud rooms stay out of scope.
**The 60 BPM table again on the new ratios** (2 seeds = 16 bars a kind): right 95 of 96 heard, 15 / 16 bars; one strum missing on slot
0 / 2 / 3 / 5 / 6 / 7 caught 2 of 2 each (the mistake bar ✓ 0 of 2 each); an extra on slot 1 / 4 caught 2 of 2 each (0 wrong extras
elsewhere); one strum 100 ms late: 2 of 2 bars still ✓; 150 ms late: 1 of 2 (the window's edge: 175 ms less the student's 20 ms); nothing
played: 0 of 96 heard, 0 / 16 bars. Chord on the 1 (right chord, heard 1s, 60 BPM): rule a 165 / 5 / 4, rule c 171 / 3 / 0 of 174.

### BEFORE (round 1, the shared ratios 1.4 / 1.7) — kept for the record; 3a-3c and the chord tables in 4 were measured here
### 3a. False extras where the hand should miss (constraint 3), quiet room, per 100 bars
| student | 40 | 60 | 80 | 100 | 125 BPM |
|---|---|---|---|---|---|
| plays it right (ringing chord, hand leaving it at changes) | 0 / 104 bars | 0 / 104 | 0 / 104 | 0 / 104 | 0 / 104 |
| + foot tap on every beat, -12 dB under a strum (a guess) | 0 | 0 | 0 | 0 | 0 |
| + foot tap, -6 dB | 0 | 0 | 0 | 0 | 1 in 104 (1.0) |
| + the swinging hand grazes the strings on each miss, -20 dB | 0 | 0 | 0 | 0 | 0 |
| + graze, -14 dB | 0 | 0 | 0 | 0 | 0 |
Target "< 1 per 100 bars": met everywhere but foot -6 dB at 125 BPM (exactly 1.0). For information: class room 0 per 100 (right, thumb,
foot -12 dB); room7 13-63 and room4 100-150 per 100 bars (other guitars and voices land in the misses) — the loud rooms were not designed for.

### 3b. THE FINDING: real strums missed, quiet room (CHK_ONSET_RATIO 1.4 / CHK_HF_RATIO 1.7, the shared ratios)
| student | 40 | 60 | 80 | 100 | 125 BPM |
|---|---|---|---|---|---|
| right (pick): strums missed | 0 / 624 | 20 / 624 | 137 / 624 | 231 / 622 | 308 / 616 |
| right: bars all ✓ | 104 / 104 | 85 / 104 | 24 / 104 | 4 / 104 | 0 / 104 |
| thumb: strums missed (4 seeds) | - | 68 / 192 | 100 / 192 | 117 / 192 | 156 / 192 |
A re-strum of the same chord an eighth after the last one does not raise the level 1.4x (RMS) or the attack channel 1.7x (HF) over
strings still ringing: at 80 BPM the strings have rung only 375 ms. It is the same detector Strum Radar uses (Radar's listen-loop
figure "a right strummer loses 4 of 88 in quiet" is at its 70 BPM default; this is the same curve). The model's ring (1.0 s) and pick
click are fitted on Power Chord Switch strums / guessed, so real guitars may do better or worse: only real takes can say.
What a per-mode ratio would cost (what-if, NOT shipped; a scratch copy where only this check passes lower ratios to srHearStrum; quiet,
4 seeds = 192 strums and 32 bars per cell; missed real strums / false extras where the hand misses):
| ratios (RMS / HF) | right 60 | 80 | 100 | 125 | thumb 60 | 80 | 100 | 125 |
|---|---|---|---|---|---|---|---|---|
| 1.4 / 1.7 (today, shared) | 20/624 *, 0 | 137/624 *, 0 | 231/622 *, 0 | 308/616 *, 0 | 68, 0 | 100, 0 | 117, 0 | 156, 0 |
| 1.3 / 1.58 | 1, 0 | 28, 0 | 55, 0 | 70, 0 | 31, 0 | 64, 0 | 90, 0 | 120, 0 |
| 1.2 / 1.46 | 1, 0 | 8, 0 | 33, 0 | 43, 1 | 12, 0 | 33, 0 | 52, 1 | 69, 4 |
| 1.1 / 1.34 | 0, 0 | 1, 0 | 11, 0 | 22, 2 | 1, 0 | 4, 0 | 24, 1 | 33, 4 |
(* run A, 13 seeds.) With a foot tap at -6 dB or a graze at -14 dB the false extras at 1.2 are 1 in 32 bars at 100-125 BPM, at 1.1 two.
Nothing here measured the lower ratios in a classroom room (other guitars and voices in the misses would rise); that is the next run
if Jonathan wants a per-mode ratio.

### 3c. The table (run B: quiet, 2 seeds = 16 bars a cell; run C rooms in the scratchpad `runC.txt`)
Strum slots: played heard / missed; absent heard / missed. Misses: quiet / FALSE extra; extra caught / missed. Bars ✓; the mistake bar ✓.
| student (quiet) | 60 BPM | 80 BPM | 100 BPM |
|---|---|---|---|
| right | 93/3 · bars 13/16 | 69/27 · 1/16 | 54/41 · 0/16 |
| one strum missing, slot 0 / 2 / 3 / 5 / 6 / 7 (bar 2) | absent caught 2/2 on every slot; mistake bar ✓ 0/2 each | caught 2/2 each | caught 2/2 each |
| extra strum on slot 1 / 4 (bar 2) | caught 2/2 / 2/2; bar ✓ 0/2 | 1/2 / 2/2 | 0/2 / 1/2 (the extra itself unheard, see 3b) |
| one strum ("2 and") 50 / 100 / 150 / 200 ms LATE | mistake bar ✓ 2/2, 2/2, **0/2**, 0/2 | (3b swamps it) | |
| one strum 50 / 100 / 150 / 200 ms EARLY | 1/2, 2/2, 1/2, 1/2 | | |
| every strum shifted 50-200 ms late or early (whole round) | bars ✓ 10-15 of 16: the grid follows a steady offset after the first strums | 0-4 of 16 | 0-1 of 16 |
| wrong / held chord kinds | pattern as right (11-14 of 16) | | |
| plays nothing | 96 absent, 0 heard; bars 0/16 | same | same |
| desk taps on the six strum slots | pattern 16/16 ✓ (BY DESIGN: no pitch in the pattern); chord never ✓ (48/48 "could not hear it") | 16/16, 48/48 | 16/16, 48/48 |
| muted strums on the six strum slots | pattern 16/16; chord never ✓ (48/48 "could not hear it") | same | same |
| foot tap -12 / -6 dB, graze -20 / -14 dB | as right (12-14 of 16), 0 false extras | | |
Where "medium" flips (one strum, 60 BPM, the student also 20 ms behind the site's mic-delay setting): 100 ms late still in, 150 ms
late out (window 175 ms - 20 ms); early: 100 ms in, 150-200 ms in once of twice (the edge).
Rooms (run C, 1 seed, information only): class: right 4/8 bars at 60 (4 of 48 strums missed), silent: 12 of 48 strum slots "heard";
room7 / room4: false extras 5-12 per 8 bars and silent takes heard 23-32 of 48 strum slots: the check is not for loud rooms.

## 4. The chord on the 1: rules a, b and the one shipped (c)

Quiet room, 60 BPM, change bars where the site heard the strum on the 1 (runs A + B for the right chord; run D, 10 seeds, for held / wrong).
"ok / wrong / could not hear it".
| change | right chord: a | b | c | OLD chord held: a | b | c |
|---|---|---|---|---|---|---|
| D5 -> C5 (no shared note) | 127/1/2 | 128/2/0 | 128/2/0 | 0/10/0 | 0/10/0 | 0/10/0 |
| C5 -> G5 (share G) | 124/4/4 | 48/2/82 | 126/5/1 | **4**/5/0 | 0/6/3 | 3/6/0 |
| G5 -> D5 (share D) | 123/2/1 | 59/5/62 | 121/5/0 | **4**/4/2 | 0/9/1 | 1/9/0 |
| all three | 374/7/7 of 388 | 235/9/144 | 375/12/1 | 8 of 29 passed | 0 of 29 | 4 of 29 |
At 80 BPM (same runs): right a 310/6/12 of 328 — b 202/14/112 — c 313/14/1; held passed a 4 / b 0 / c 2 of 21.
Wrong chord (half another chord of the song, half one fret high; run D, 60 BPM, 59 changes): called wrong a 43, b 41, c 43; passed
a 15, b 16, c 16. By kind over 60 + 80 BPM (run D): another chord of the song that SHARES a note passes under every rule (G5 played
for C5: a 17 / b 16 of 20 passed; D5 for G5: a 13 / b 16 of 19); C5 played for D5 (no shared note) is caught 18 of 18 (a) / 17 + 1
unheard (b); one fret high is caught 55 of 55 by a and 56 of 57 by b and c (1 passed).
Nothing on the 1 (silent, desk taps, muted strums): never ok under any rule (48 of 48 each, "could not hear it").
Why b says "could not hear it" so often: the detector mostly reads a power chord's ROOT (or its octave below); on C5 -> G5 the root of G5
is G, which C5 also has, so the D that would prove the change rarely shows.
**Recommendation: c** (shipped, `SC_CHORD_RULE = 'c'`, pinned in 1eh): b where b has evidence either way, a where b can only say "could
not hear it". It keeps a's right-called-right (375 vs 374 of 388) and halves a's held-passed (4 vs 8 of 29); it costs 5 more
right-called-WRONG than a (12 vs 7 of 388, 3.1% vs 1.8%: a ringing old-chord tone read on the new bar). b alone would pass no held chord
but say "could not hear it" on 37% of right changes. This is a choice for Jonathan (the brief asked for a or b; c is b with a's fallback):
every take saves a, b and c, so it can be re-decided on real takes.

## 5. The round and the recording

- The round: the 8 bars ONCE, at the step's slider tempo (default 60; 40-125; the card's -5/+5 stay inside). No click while listening
  (the mic would hear it); the tip says keep the beat in your head, NOT with the foot (Strum Radar's tip asks for a foot tap, and beat 3
  is a slot where the hand misses).
- The take (when the teacher has collection on and the student said yes): saved through the existing `micRecStart` / `micRecSave` path
  under `<uid>-coach` — the only id the published rules allow that fits (coach = a Listening Coach check; nr / pw are other games). It
  overwrites that student's last Listening Coach take, as any Coach take does. `game: 'strumcheck'` marks it; `mode` stays 'coach'.
- The cap: the brief's choice "raise this mode's cap if the storage rules allow it". `micRecStart(mode, maxSec)` takes an optional cap;
  only this check passes one: the whole round, ceil(count-in lead 0.4 s + 4 count-in beats + 32 beats + 1 beat) + 1 s, at most
  `SC_REC_MAX_SEC` 60. At 60 BPM: 37.4 s -> a 39 s cap, so **the take holds the whole 8-bar round** (count-in included), 1.87 MB = 4
  chunks; at 40 BPM a 57 s cap, 5 chunks; at 125 BPM 20 s. The rules (`micTakes`, not changed) bound each chunk (<= 750,000 bytes; the site
  writes 600,000) and not their number; the console reads at most 16 chunks (`TEACHER_MIC_MAX_CHUNKS`). Every other caller keeps 30 s
  (MICREC_MAX_SEC unchanged; the 1cy and 1ck runs of micRecStart passed).
- What the take carries for a replay (`scRecMeta`): rule 'strumcheck-1', chordRule 'c', winFrac 0.35 and winMs, bpm / beatMs / slotMs,
  the pattern and bars, latMs, the grid as used (gridEase 0.2 within 0.45 of an eighth, gridStepCapMs null = no cap, the final
  gridOffsetMs, and each strum's and each sound's grid at the moment it was judged), the onset ratios and refractory, the chord gate
  0.55, attack skip 70 / rule-a tail 340 / tail gap 60 / miss grace 60 ms, recCapSec and roundSec, complete (or Stopped), barsDone;
  `expected` = the 48 written strums (bar, slot, D/U, verdict ok / miss, devMs, gridMs; slot 0 with its chord and notes); `events` =
  every sound heard (time, eighth, dev, strum / extra / again / between / outside); `rests` = the 16 slots where the hand misses (quiet /
  extra, devMs); `chords` = per bar: chord, previous, the verdicts a / b / c and the one shown, when the strum was, and every reading
  (ms after the strum, midi). No new name or uid field (micRecSaveNow adds the same ones as every take).
- The console: the Mic recordings table labels the row "Strum pattern check · 8 bars"; "Counted right" = strums heard / 48 (verdict
  'ok', the column's own test). "Evaluate all recordings" runs its generic Coach evaluator on it (label "Coach strum"): it does not break
  (the click search uses the take's beatMs and its first expected strum, as for a Coach take), but it judges each strum with a half-beat
  window, so its per-note lines are not meaningful for this check. `takes-in.mjs` leaves these takes out of the summaries and says how
  many. NOT done, for the other agent's files: `replay-takes.mjs` loadAudio (line ~221) would read such a take as a Coach melody take if
  it were ever fed one; takes-in drops them from its list right after loadAudio, so no summary is written for them.

## 6. Proofs

- **Strum Radar, Strum Hero, Listening Coach unchanged** (constraint 2): `listen-loop.mjs --game=radar|chords|melody` on a `git archive`
  of cc9fcfb (`--root`) as the before, then on the branch with `--against`: radar "0 of 3520 graded strums differ ... in 160 takes ...
  same"; chords "0 of 4480 graded notes differ ... in 300 takes; gate moved in 0 takes; the report's level moved in 0 takes ... same";
  melody "0 of 5100 graded notes differ ... in 600 takes; gate moved in 0 ... same". The `takes` arrays of the three before/after
  `--json` files are byte-identical (1,060 of 1,060 takes). Strum Hero has no mic and no line of it changed (srHearStrum is called only
  by srLoop and scLoop).
- `node tools/tone-test.mjs`: ✓ (369/369 tones as their note; 1cx not re-pinned).
- `node tools/checks.mjs --check --skip-links`: one ✗, "shell cache stale" (the expected one: the full checks.mjs rewrites sw.js's
  version lines; not run here, no hand edit); 1eh ✓; warnings: 1bb (ca-46 has six steps, as before), 1cv (coach-core.js 2,468 lines,
  over 2,000 before this change at 2,457; coach-runner, coach-chords and teacher-activities are the other three).
- `node tools/lint.mjs` (run with a scratch npm cache: the shared one refused writes in this sandbox): no new finding; the same lines as
  cc9fcfb's run; counts +1 script, +7 inline handlers.
- `node --check` on every touched .js / .mjs: clean.
- **1eh break-it (13 mutations, each in the real file, restored after; a harness that runs only 1ca's sandbox and 1eh), all RED:**
  `listen` removed -> "0 strum steps carry listen"; SC_WIN_FRAC 0.45 and 0.25 -> "SC_WIN_FRAC is 0.45/0.25, want 0.35"; SC_CHORD_RULE 'a'
  -> "want c"; chord read on every strum -> "a strum on slot 2 opened a chord reading"; a strum in a miss not counted -> "a strum on slot 1
  ... was pending, want extra"; slot 4 read as a strum -> "reads the slots where the hand misses as [1], want [1,4]"; `games.sc = ...` in
  scFinish -> "names games."; saveGames called through a computed name (the text scan cannot see it) -> "a finished check called
  saveGames 1 times"; the console guard removed -> "draws the button in the teacher console"; the listen guard removed -> "drew the
  strum-check button on a step without listen: ca-46 step 1 ... 6"; the 1-bar end line in its all-right branch made plural -> RED only
  after 1eh was widened to test that branch too (the first run stayed green: fixed, second commit); rule c without its fallback ->
  "rules a / b / c ok / unheard / unheard, want ok / unheard / ok". Control (no mutation): ✓.
- 1cy re-pinned `callersWithAsk` 8 -> 9: scStart is a new coachAcquireMic caller that passes its panel's place (the rule 1cy keeps).
- `tools/slow-load.mjs`: see section 7.
- `tools/smoke.mjs` was NOT run (the brief forbids it); its new strumWalk part is syntax-checked only. GitHub's browser job will walk it.
- Screenshots (1366x657, EN and ES, `Claude outputs/strum-coach/`): 1-step, 2-ready, 3-mic-panel, 4-mid-round, 5-bar-right,
  6-bar-rest-fault, 7-bar-wrong-chord, 8-end. Headless Chrome for Testing with a fake mic device; states 5-8 were driven through the
  check's own scOnset / scCloseChord / scSweep / scFinish after the real Start reached "listening" (a fake device cannot strum). No
  sideways scroll, 0 page errors, card 207-330 px tall. The card sits in the tab's control row like the melody Coach card (about 540 px
  wide). One ES tip wrapped to two lines there and was shortened ("El micrófono no oye si vas abajo o arriba: solo dónde cae cada
  rasgueo."); the shots were taken before that edit.

## 7. slow-load

`node tools/slow-load.mjs` (a new part in COACH_JS_PARTS and the sw.js list): "✓ slow-load: 20 loads, 0 errors" (every script held back
0-1500 ms; its own steps include `ensureCoachJs()` then the Games screen, so the new last part loads in every run). Run under the shared
Chrome lock (taken as "strum-coach"; when released the lock directory was already gone — another session's cleanup, as an earlier
owner note in it said had happened before).

## 8. For Jonathan (the lead takes these)

1. **The tempo finding (3b)** — decided by the lead (round 2): the check's own ratios 1.2 / 1.46 and a tempo limit of 80 BPM (3N).
   Still for Jonathan: the thumb loses 5.3% at 60 and 18.6% at 80 even so (model), and 80 BPM is a model number until real takes.
2. **The chord rule**: c (shipped) vs a vs b — section 4.
3. **"You've got it" line** (none shipped; no gate). A proposal: "You've got it when the check says Pattern 7 of 8 and Chords 7 of 8
   at 60 BPM." The model's right player at 60 in a quiet room gets that in 8 of 15 rounds (Pattern 8 + Chords 8: 3 of 15; Pattern 6+ and
   Chords 7+: 11 of 15); one slip (a missed strum or an extra) still reaches 6-7 of 8 patterns; desk taps and muted strums get Pattern 8,
   Chords 0. Better decided on real takes: if real strums are heard better than the model's, 8 of 8 becomes reachable.
4. The earlier steps (muted strings, D5 alone, the chunk steps): the same code would judge their pattern (`listen: true` on their strum
   spec; slots marked '.' become misses), but each needs its own pins, the muted step must not judge a chord, and nothing was measured
   for them. Left as a follow-up.

## 9. What only real takes can settle, and the takes to ask for

Only real takes can say: how many real re-strums the shared ratios miss at 60 and 80 BPM (3b is the model's ring and pick click);
whether a real foot tap, hand graze or fretting-hand noise lands in the misses; what YIN reads on a real power chord on the 1 (root only,
or the 5th too), which decides between rules a, b and c; the real mic delay (the grid follows a steady offset, but beat 1 of bar 1 is
judged before it has followed).
With recordings on for Jonathan's own account (the check saves under the Coach's take id; each new take replaces the last, so download
each one before the next), at 60 BPM unless named, guitar about an arm's length in front of the Chromebook's keyboard, facing it, the
Chromebook on a desk, a quiet room, pick:
1. The eight bars played right.
2. Played right with a deliberate WRONG chord on bar 5 (D5 instead of G5) — and a second take holding C5 through bar 5 (late change).
3. Played right with one extra strum on "3" in bar 2.
4. Played right at 80 BPM (the limit).
5. Played right with the thumb (no pick).
6. Nothing played for the whole round (the room alone), and one with the foot tapping the beat.
Then `node tools/mic-sim/takes-in.mjs` will NOT summarize them yet (it says how many it left out): a replay tool for this check's takes
is the next piece of work (the take already carries everything it needs: section 5).

## 10. Interpretations made (code-hygiene rule 13)

- "Medium" = 0.35 of an eighth for strum slots AND for slots where the hand misses (an extra counts only inside that window; one between
  windows is logged, not judged).
- The grid follows the player (Strum Radar's 20% ease) — reused as asked; so a student steadily late or early by up to 200 ms at 60 BPM
  still passes most bars once the first strums have pulled the grid (table 3c). Only one strum off within a bar is judged by the window.
- "A ✗ only when the slot or bar is over": a missed strum and an extra turn red when the bar is over; a heard strum turns green at once;
  the chord mark shows when its reading ends (before slot 2).
- The take keeps the whole round (cap raised for this check only) rather than the first 30 s.
- A bar the student never reached (Stop) is left out of the counts; "Pattern: p of n bars" counts finished bars only.
- Desk taps / muted strums: the pattern passes by design (no pitch); the chord says "could not hear it", which counts as not ✓.

## 11. Round 2 proofs (tip bbf32cc)

- Commits: d0b567e (own ratios 1.2 / 1.46, the 80 BPM limit, its line EN + ES, the slider hook, smoke, 1eh), bbf32cc (1eh fix: a
  template slip had left the limit pins unrun, caught by the break-it control; the slider hook is now checked by running
  onBpmSliderChange with a counting strumCheckSync).
- Identity after the change (ONE run, constraint 2): radar 0 of 3520 strums differ in 160 takes, chords 0 of 4480 notes in 300, melody
  0 of 5100 notes in 600; the three `takes` arrays byte-identical to the cc9fcfb run: 1,060 of 1,060. tone-test ✓ (369/369), no re-pin.
- `checks.mjs --check --skip-links`: only "shell cache stale" fails; 1eh ✓; 1cv warns as before (coach-core.js 2,468).
- 1eh break-it: **21 of 21 mutations red**, control green (the 13 of round 1 plus: limit 90; the button not disabled over the limit;
  the slider hook removed; the card's tempo not capped (125); the check's ratio 1.4; srHearStrum ignoring the check's ratios; the
  shared CHK_ONSET_RATIO moved to 1.2; scStart dropping its ratios).
- Lines after: coach-strumcheck.js 512, coach-strum.js 1,451, app/tab.js 721, app/audio-ui.js 1,505.
- Screenshots 9-disabled-over-limit-en / -es (1366x657, slider at 81): the button greyed and disabled, "Slow to 80 BPM or less to use
  the check." / "Baja a 80 BPM o menos para usar el chequeo." on one line under it (20 px), no sideways scroll, 0 page errors. In Spanish
  the long button label sits on its own row under the slider, as before.
- tools/smoke.mjs (not run, per the brief): strumWalk now drags the slider one BPM past the limit (button disabled, line shown with the
  number) and back (both gone), then restores the slider.

## 12. Deep review round 1 (ee0a950, rebased by the lead onto 5ebdc8a): 0 BLOCKER, 0 MAJOR, 6 MINOR — fixes

- R1-1 (fixed): 1eh now runs the real scSweep / scBarOver / scFinish (end screen) on real slot states, EN and ES: bar 1 leaves the up
  strum on "2 and" unplayed and strums on "3", bar 2's chord is wrong; it pins the swept slot states, both bars' lines, the end screen's
  lines and "Pattern: 1 of 2 bars. Chords: 1 of 2."; the whole-finish test now compares its body too ("Pattern: 2 of 2 bars. Chords: 2 of
  2." and the all-right line). Red with the reviewer's two faults: a missed strum swept as 'quiet' -> "en: the sweep left the slots
  ok,quiet,ok,quiet,extra,... want ok,quiet,ok,miss,extra,..."; every bar a pattern pass -> "en: the end screen does not say "Pattern: 1
  of 2 bars. Chords: 1 of 2."". Control green.
- R1-3 (fixed): the console's delete confirmation says "Strum pattern check recording" for such a row.
- R1-4 (fixed in code): coach-core.js's two comments name the check (records; its own cap). **Open:** firestore.rules:43-44 still says
  "Listening Coach / Note Runner / Power Chord Switch"; a rules-file edit needs Jonathan's console paste and a RULES_FILE_SHA256 re-pin,
  so it waits for the next real rules change.
- R1-5 (fixed): takes-in.mjs counts strum checks as their own kind in its summary line.
- R1-6 (fixed): coach-strumcheck.js no longer reads STRUM_CHECK_MAX_BPM at load; scOpen reads it (scBpmMax, falling back to the 40 BPM
  floor on a page without app/tab.js). 1eh pins scBpmMax() = 80 and refuses a load-time read (both red when planted).
- **R1-2 (OPEN, Jonathan's call):** a strum-check take is saved under `<uid>-coach` and replaces that student's last Listening Coach take
  (and a student with no Coach take uses one of the teacher's `max` slots). Keeping both needs the rules to allow `(coach|nr|pw|sc)` (a
  console paste), `micRecStart('sc', …)` and the console's labels on mode 'sc'.

## 13. The window, after Jonathan's first real round ("slightly more permissive to start"), 2026-11-14

Virtual student, quiet room, the check's own ratios 1.2 / 1.46, 2 seeds a cell (scratch copies with only SC_WIN_FRAC changed; JSONs win-0.35/0.40/0.45.json in the session scratchpad `strumcheck/`). One strum late / missing / extra are in bar 2.

| window | BPM | right: strums marked wrong | right: bars all-right | one strum 100 / 150 / 200 ms late: bar passes | missing strum caught (slots 0 2 3 5 6 7) | extra caught (slots 1 4) | half an eighth early on "2" (bar 2) | nothing played: strums heard |
|---|---|---|---|---|---|---|---|---|
| 0.35 | 60 | 1 of 96 | 15 of 16 | 2/2 · 1/2 · 0/2 | 2/2 2/2 2/2 2/2 2/2 2/2 | 2/2 2/2 | slot1 quiet, slot2 miss; slot1 quiet, slot2 miss | 0 of 96 |
| 0.35 | 85 | 6 of 96 | 11 of 16 | 1/2 · 0/2 · 0/2 | 2/2 2/2 2/2 2/2 2/2 2/2 | 2/2 1/2 | slot1 quiet, slot2 miss; slot1 quiet, slot2 miss | 0 of 96 |
| 0.35 | 100 | 17 of 96 | 5 of 16 | 1/2 · 0/2 · 0/2 | 2/2 2/2 2/2 2/2 2/2 2/2 | 1/2 2/2 | slot1 quiet, slot2 miss; slot1 extra, slot2 miss | 0 of 96 |
| 0.40 | 60 | 1 of 96 | 15 of 16 | 2/2 · 2/2 · 0/2 | 2/2 2/2 2/2 2/2 2/2 2/2 | 2/2 2/2 | slot1 quiet, slot2 miss; slot1 quiet, slot2 miss | 0 of 96 |
| 0.40 | 85 | 6 of 96 | 11 of 16 | 1/2 · 0/2 · 0/2 | 2/2 2/2 2/2 2/2 2/2 2/2 | 2/2 1/2 | slot1 quiet, slot2 miss; slot1 quiet, slot2 miss | 0 of 96 |
| 0.40 | 100 | 17 of 96 | 5 of 16 | 1/2 · 0/2 · 0/2 | 2/2 2/2 2/2 2/2 2/2 2/2 | 1/2 2/2 | slot1 quiet, slot2 miss; slot1 extra, slot2 miss | 0 of 96 |
| 0.45 | 60 | 1 of 96 | 15 of 16 | 2/2 · 2/2 · 1/2 | 2/2 2/2 2/2 2/2 2/2 2/2 | 2/2 2/2 | slot1 quiet, slot2 miss; slot1 quiet, slot2 ok | 0 of 96 |
| 0.45 | 85 | 6 of 96 | 11 of 16 | 1/2 · 0/2 · 0/2 | 2/2 2/2 2/2 2/2 2/2 2/2 | 2/2 1/2 | slot1 quiet, slot2 miss; slot1 quiet, slot2 miss | 0 of 96 |
| 0.45 | 100 | 17 of 96 | 5 of 16 | 1/2 · 0/2 · 0/2 | 2/2 2/2 2/2 2/2 2/2 2/2 | 1/2 2/2 | slot1 quiet, slot2 miss; slot1 extra, slot2 miss | 0 of 96 |

**Shipped: 0.45.** The rule was "the widest that still catches a missing strum and an extra in a rest 2 of 2 on every slot at 60 and 85
BPM". Read literally, none of the three passes: at 85 BPM one extra strum on "3" is caught 1 of 2 at every width. That one is not a window
question: replayed, the extra strum (seed 2) left no onset at all (events near it: slot 11 at +2.7 ms and slot 13 at +29.6 ms, nothing
at slot 12), identical at 0.35 and 0.45. Every catch is the same at all three widths, so the widest, 0.45, is shipped. It is Strum
Radar's own width; the strum and miss windows still do not touch (0.45 + 0.45 < 1).
What changes: one strum 150 ms late at 60 BPM passes 2 of 2 (0.35: 1 of 2), 200 ms late 1 of 2 (0.35: 0 of 2); a strum half an eighth
early on "2" was taken by slot 2 once of twice at 60 BPM (0.35: never; a rest never took it at 60 or 85). What does not change: the right
player's red arrows (1, 6, 17 of 96 at 60, 85, 100 BPM) are strums the detector did not hear, the same at every width; nothing played
still hears 0 of 96.
1eh re-pinned: SC_WIN_FRAC 0.45; scOnset takes 0.44 of an eighth and not 0.46; a strum 0.47 from a miss is not an extra; the saved take's
winFrac / winMs follow the constant. Break-it: back to 0.35 red, 0.5 red, a take saving another width red ("the saved take says window
{"frac":0.35,...}"); control green.

**Suggestion, not built (it needs a new look):** an arrow goes red today for two reasons that look the same: no strum was heard near it,
or a strum was heard but outside every window ("between", logged in the take's events, not drawn). The bar line already words a missed
strum and a strum in a miss differently, but a mistimed strum reads as "missed". A third mark (say an amber arrow for "heard, off the
beat") would tell them apart; it needs a new CSS mark and, for the bar line, a new string in both languages, so it is left for Jonathan.

## 14. Tempo: "Start 85, no limit" (Jonathan, 2026-11-14, after a real guitar; replaces the lead's 80 BPM limit)

- The check opens at SC_START_BPM 85 whatever the step's slider says (the step's own default stays 60). Its −5 / 85 BPM / +5 row is on
  the check's panel above Start (one row, 44 px, EN and ES; screenshots 10-step-start85-en/-es and 11-ready-start85-en/-es: readout
  "85 BPM" with the step's slider at 60). The buttons move it across the step slider's own range, 40 to 125.
- No limit: the button is never disabled; STRUM_CHECK_MAX_BPM, strumCheckSync, the slider hook, the .sc-limit line and its CSS and the
  sc.slowTo strings (EN + ES) are gone. 1eh: the button is never drawn disabled; scOpen (run) opens at 85 with the slider at 60 and at
  125; scNudgeBpm reaches 125 and 40; none of the removed names remains. Break-it: start at 60 red ("with the step's slider at 60 the
  check opens at 60 BPM, want 85"); a stop at 80 red ("the check's +5 stops at 80 BPM, want the step's own top, 125"); opening at the
  slider's tempo red; a disabled button red. smoke.mjs now expects 85 BPM on opening, clicks +5 / −5 (85 -> 90 -> 85) and drags the
  step's slider to its top with the button still live (not run).
- The virtual student at 85 BPM (own ratios, window 0.45): the right player loses 6 of 96 strums (2 seeds) and gets 11 of 16 bars
  all-right; at 100, 17 of 96 and 5 of 16 (section 13).
- Commit order on feat/strum-tempo: the tempo work (0a1e85e), then the save-fault commit, then the window commit (reordering them
  conflicted in tools/checks.mjs, so they stay in the order built; each is its own commit).

## 15. The live take that did not arrive; one tempo; the Metronome during a round (2026-11-14)

**The missing take.** Measured, not guessed: scRecMeta's document, run through the REAL micRecSaveNow into a stub whose set() refuses
what the Firestore SDK refuses (undefined, functions, non-finite numbers, non-plain objects, an array inside an array), saved with
nothing refused in 3 of 3 rounds (every bar right, nothing played, Stopped after 3 bars); the Listening Coach melody and chords, Note
Runner and Power Chord Switch metas: 0 refused values in 4 of 4. So the document is not the cause. What fits what Jonathan saw, from the
code: (1) the red line while the check listens is the mic chip ("● Listening — <mic>", red text #c0392b), always shown; the recording
label is a different pill, "Recording this take for your teacher". If he played signed in with the teacher's own account
(TEACHER_EMAIL), micRecOpen() is false by design (isGatePreviewer) and nothing records; (2) if he played on an account that already had
a Listening Coach take, the check's take replaced that row (same id `<uid>-coach`, R1-2): the count does not rise and the row keeps its
place, now labelled "Strum pattern check"; (3) the Mic recordings view does not refresh by itself. Question for Jonathan: which account,
and which words were on the red label. Hardened anyway (own commit): every take field set on purpose; a belt nulls anything the SDK
would refuse and tells the error log; any game's failed take save now sends one anonymous error-log entry (game, error code, field;
never the error text, which holds the uid). 1eh and strum-check-loop.mjs save every take through the strict stub.

**One tempo** (Jonathan: "even when i set the metronome to 85 prior it started at 60"; reproduced from the code: the check read the
step's slider once, when it opened; the slider moved after opening changed nothing on the check). Now: the check opens at the tempo last
set on the step's slider (85 if never set) and puts it on the slider; before a round the slider and the check's −5 / +5 move each other;
from Start to the end of the round the step's slider and Play clicks and the Metronome tool's Start/Stop and tempo are disabled
(greyed); every exit gives them back. The floating Metronome tool's own tempo is not taken (a separate tool; he did not use it).
Screenshots 12-round-locked-en/-es.

**The Metronome during a round: measured, NOT shipped (no existing method fits).** The count-in's click on every beat through the round
(scratch build kept at the session scratchpad, `strumcheck/with-clicks-coach-strumcheck.js`), at the bench's speaker level for the
site's own beeps (0.03 raw at the mic, listen-site.mjs; a strum is 0.12 a string), quiet room, own ratios, 4 seeds = 32 bars a cell:
| | 60 BPM | 85 BPM | 100 BPM |
|---|---|---|---|
| nothing played, Metronome on: strum slots "heard" | 96 of 192 (every beat slot: 96 of 96) | 96 of 192 | 96 of 192 |
| nothing played, Metronome on: wrong extras on "3" per 100 bars | 100 | 100 | 100 |
| nothing played, Metronome off | 0 of 192, 0 | 0 of 192, 0 | 0 of 192, 0 |
| right player, Metronome on: strums wrong / bars all-right | 1 of 192 / 31 of 32 | 12 of 192 / 22 of 32 | 33 of 192 / 11 of 32 |
| right player, Metronome off | 1 of 192 / 31 of 32 | 12 of 192 / 22 of 32 | 33 of 192 / 11 of 32 |
Every click is heard where nothing else rings. The other listening games all keep the speaker silent while the mic listens (Strum
Radar: "the click goes silent after the count-in (the mic would hear the speaker)"; Power Chord Switch, Change Up, the Coach, Note
Runner; the Metronome tool itself goes silent while the mic is on); none gates or masks its own click. Options for Jonathan: (a) keep it
silent, as today (the board's moving cell shows the beat); (b) a known-time mask for the check alone (a new detector rule: ignore onsets
within a few ms of each scheduled click; a real strum on the "3" landing on a click would then also be ignored, so an extra on "3" would
no longer be caught: it needs measuring and a reviewer); (c) clicks only with headphones (the site cannot tell whether headphones are on).

## 16. The activity: "Strum Pattern check" (ca-52), branch feat/strum-activity from 753790a (2026-11-14)

Commits: c9cba31 (ca-52), d539b10 (review R1-1 / R1-2 on 753790a), 9cfdc04 (headphones), 0034b5e (local recording mode), then the
cache-version commit. The tip is what ships.

**What it is.** A new In-Class Activity, ca-52 "Strum Pattern check" / "Chequeo del patrón de rasgueo": one step, "The Listening Coach
— D5, C5, G5", text "Play the eight bars for the Listening Coach, two full rounds." (ES "Toca los ocho compases para el Entrenador de
Escucha, dos rondas completas."), the same eight bars and pattern as ca-46's verse step (copied spec, `listen: true`), `listenRounds: 2`.
Required, like ca-50 (no `optional`). ca-46 no longer has the button: its loaded data is byte-identical to cc9fcfb (before the check).

**How the two rounds are stored.** Through the existing step writer, `onCaStepChange(key, true)` (app/save.js), the same function Mark
done calls; nothing new is written to `progress/{uid}` beyond step keys. A round counts only when it ran to the end of bar 8 (Stop, or
leaving early, counts nothing). Round 1 writes the key `ca-52:0:r1`; round 2 writes the step's own key `ca-52:0`, which is the tick (the
gate, the board and the console read that key as before). `scCountRound` (coach-strumcheck.js) does it in scFinish; the step row
(`caListenRoundsRowHtml`, app/activities.js) draws "Rounds: n of 2" and then a ✓, and has no Mark done button. The console's step
preview says "Ticks itself after 2 full rounds with the Listening Coach check (no Mark done button for students)."
**My view on "nothing played counts":** a round that ran to its end counts even if the student played nothing; the check cannot tell
silence from a mic problem, and it is feedback only. The board shows the verdicts, so a teacher looking sees it. If Jonathan wants a
floor (e.g. at least 4 bars heard), that is one line in scCountRound; not done without his word.

**What a student sees before Jonathan places it: nothing.** An activity not placed on the console's board is invisible to students
(caIsVisible). The console lists ca-52 under "Pushed to the site, not placed in the course yet. Students see none of these." Once he
places it and it is released, it appears like any other.

**Proofs.** Loaded activities: 48 → 49, every activity but ca-46 and ca-52 identical; ca-46 identical to cc9fcfb. `visible-loop.mjs`:
every comparison held (39.9 s). checks.mjs 1eh now renders ca-52 and pins: two full rounds tick the step (round 1 `ca-52:0:r1`, round 2
the step), Stopped / short rounds and other steps write nothing, no Mark done button. Break-it, each red with the control green: Mark
done drawn on ca-52; one round ticking the step; a Stopped round counting; the button back on ca-46 (4 of 4). Screenshots 13-16, EN + ES:
before, one round, two rounds ticked, ca-46 without the button.

**Review R1-1 / R1-2 (d539b10).** R1-1: the Metronome tool's −5 / −1 / +1 / +5 are locked during a round too (1eh probe: 11111111 during,
00000000 after; break-it gave 11110000). R1-2: a failure after the take saved (the counter) is logged as "take saved, counter failed",
not "save failed" (1eh counterFails case, 4 saves; break-it logged "save failed").

## 17. Headphones (9cfdc04)

The ready screen shows "I'm wearing headphones" / "Llevo audífonos" only when the Metronome tool is running; remembered per browser
(`gc-sc-headphones`, the only storage key the check uses; 1eh's storage scan allows exactly it). Metronome on + headphones: the
count-in's click (660 Hz, 80 ms, the same voice) on every beat of the round, queued on the audio clock, every exit clears the rest.
Metronome on, no headphones: no sound after the count-in; a beat dot twice the Metronome tool's size (56 px, 70×70 px with its border at
1366×657) flashes on each beat. Metronome off: neither, as before. Break-it, each red with the control green (5 of 5): another storage
key; clicks without headphones (table 1100); clicks not cleared by Stop (32 left); the dot with the Metronome off (32 flashes); the
switch with the Metronome off. Screenshots 17 (the switch) and 18 (the dot mid-round), EN + ES. `sc.tipCount` now reads "4 clicks to
start. Keep the beat in your head, not with your foot."

## 18. Local recording mode: how to record your own takes (0034b5e)

The site served from your own computer, signed in with the Dev bypass button, records every listening round (no question, no class
switch, nothing sent to Firestore) and offers each take as two files. It is off everywhere else: the real site, and any real account
even on your computer (1eh pins both; break-it: on any host, for any account, and the uid kept in the file, each red).

1. In VS Code, open the guitar-class folder, right-click `index.html` → "Open with Live Server". The address must start with
   `http://127.0.0.1:` or `http://localhost:` (Live Server's usual is `http://127.0.0.1:5500/`). Not the computer's network address
   (192.168…): the site treats that as another computer.
2. On the sign-in screen click **Dev bypass**.
3. In class → **Strum Pattern check**. Read from the code, not tried in a browser: the Dev bypass cannot read the class settings
   (the rules want a school sign-in), so with no saved copy the board counts as never set up and every activity shows, ca-52 too;
   if a copy saved by an earlier real sign-in on this address hides it, a private window has none.
   Click the Listening Coach button, allow the mic, Start, play the round. The red recording label shows while it listens.
4. After each round a box at the bottom left lists the take: click **Save this take (sound)** and **Save this take (details)**. Both
   go to Downloads (`take-strumcheck-20261114-101500.wav` / `.json`). The box keeps the last 6 takes of this page; a reload empties
   it, so save first.
5. Put the pairs that share one answer in one folder (for example `~/Desktop/takes-right-85`), then in Terminal, in the guitar-class
   folder: `node tools/mic-sim/local-takes-in.mjs ~/Desktop/takes-right-85 --note="played right, 85 BPM"`. Use a new folder (and a new
   note) for takes with a deliberate mistake, e.g. `--note="bar 5: D5 instead of G5"`.
6. It prints counts only. The takes land in `Claude outputs/takes-anon/` as J01, J02… (J = yours; students' are T01…), each JSON
   marked `teacherOwn: true` with your note. A pair already copied is skipped. It refuses (exit 2, nothing copied) a file that is not
   from local recording mode or that holds a uid, name or email. Tested on made-up files: 3 copied, 3 skipped on a rerun, 0 copied
   when one file in the folder carried a name.

## 19. The metronome tone through a speaker: measured only, no site code changed (2026-11-14)

Bench: the real check (ca-52, own ratios 1.2 / 1.46, window 0.45) with the Metronome on and headphones ticked, so the site queues a
click on every beat; the bench plays each round click through the "speaker" into the mic in place of the site's own tone (the 4
count-in clicks unchanged). Quiet room, Chromebook mic, the student 70 ms behind the click, 4 seeds = 32 bars a cell, 888 takes;
every take had exactly 36 clicks with the Metronome on and 4 with it off (0 mismatches). Peak level at the mic: 0.03 raw (the bench's
level for the site's beeps; a strum is 0.12 a string) and 0.1 (louder). The bench has no speaker model, so each tone is also run
through a 300 Hz high-pass (a small laptop speaker). Harness: session scratchpad `strumcheck/tone-run.mjs` + `tonegen.py` (temporary
copies of listen-site.mjs and strum-check-loop.mjs with the tone swapped; removed after the run); raw rows `tone-grid.json`.

| click | level | speaker | nothing played: beat slots heard as strums (of 128), 60 / 85 / 100 BPM | right player: wrong extras on "3" per 100 bars | right player: bars all right (of 32) |
|---|---|---|---|---|---|
| none (Metronome off) | - | - | 0 / 0 / 0 | 0 / 0 / 0 | 31 / 25 / 14 |
| 660 Hz, 80 ms (the round click shipped with headphones) | 0.03 | flat / HP | 128 / 128 / 128 | 0 / 0 / 0 | 31 / 26 / 12-13 |
| | 0.1 | flat / HP | 128 / 128 / 128 | 63 / 50 / 34 · 56 / 28 / 34 | 11-14 / 14-19 / 12-13 |
| 880 Hz, 60 ms (the Metronome tool today) | 0.03 | flat / HP | 128 / 128 / 128 | 0 / 0 / 0 | 31 / 26 / 14 |
| | 0.1 | flat / HP | 128 / 128 / 128 | 31 / 25 / 19 · 28 / 19 / 22 | 21-22 / 19-21 / 15-16 |
| 2x: 1760 Hz, 60 ms | 0.03 | flat / HP | 128 / 128 / 128 | 0 / 0 / 0 | 31 / 25-26 / 14 |
| | 0.1 | flat / HP | 128 / 128 / 128 | 13 / 0 / 0 | 27 / 25-26 / 15 |
| 4x: 3520 Hz, 60 ms | 0.03 | flat / HP | 128 / 128 / 128 | 0 / 0 / 0 | 31 / 26 / 13 |
| | 0.1 | flat / HP | 128 / 128 / 128 | **0 / 0 / 0** | 31 / 26 / 14-15 |
| soft low: 250 Hz sine, 36 ms raised cosine (18 ms in, 18 out) | 0.03 | flat / HP | 128 / 128 / 128 | 0 / 0 / 0 | 31 / 25 / 14 |
| | 0.1 | flat · HP | 128 / 128 / 128 | 97 / 84 / 91 · 25 / 6 / 6 | 1-4 · 16-24 |
| soft mid: 550 Hz sine, 36 ms raised cosine | 0.03 | flat / HP | 128 / 128 / 128 | 0 / 0 / 0 | 31 / 26 / 14 |
| | 0.1 | flat / HP | 128 / 128 / 128 | 100 / 88 / 94 · 100 / 84 / 81 | 0-5 |
| 880 Hz + 5 ms fade-in | 0.1 | flat / HP | 128 / 128 / 128 | 3 / 3 / 0 | 30 / 25 / 15-16 |
| 1760 Hz + 5 ms fade-in | 0.1 | flat / HP | 128 / 128 / 128 | 3 / 0 / 0 | 30 / 26 / 15 |
| 3520 Hz + 5 ms fade-in | 0.1 | flat / HP | 128 / 128 / 128 | 0 / 0 / 0 | 31 / 25-26 / 13 |
(The fade-in rows at 0.03 match their 0.03 rows without a fade: 128 heard, 0 extras. Full per-cell table: `strumcheck/tone-table.txt`.)

Best candidate, 4x 3520 Hz at 0.1, flat (`strumcheck/tone-best.txt`): right player, bars all right 31 / 26 / 15 of 32 with it on,
31 / 25 / 14 off; an extra strum on "3" (bar 2) still caught 4 of 4 at each tempo, on and off; 0 wrong extras on "3" either way.

**One sentence:** no tone is safe through a speaker — every one of the 9 tones, at both levels and both speaker shapes, was heard as
a strum on 128 of 128 beat slots whenever nothing else rang (a student who pauses gets "strums" from the click), so headphones-only
stays right; the high 3520 Hz click is the only one that never added a wrong extra under real playing, even loud, and kept an extra
on "3" caught, so if a speaker click is ever wanted it is the one to try with a real guitar and a mask for the silences (audibility,
and whether 3520 Hz is pleasant, is Jonathan's ear, not the bench's).

## 19b. The redesign: no box, one button under the board, the board on screen, the frame on the beat (554203b, 2026-11-14)

Jonathan, after playing ca-52 on the local copy: "the listening coach box is also huge. there should just be a button that says
'Click here and play it to get feedback' and it should be underneath. the tempo scroll at the top is sufficient to set the tempo. get
rid of the coach box that opens"; "i don't think they should get that. they won't read it" (the per-bar list); "it doesn't scroll
down to reveal what's next"; "what if the frame around it flashed at tempo?"; "it also seemed to be default 60".

**What changed** (listening, grading, the take and the two-round tick did not):
- The step: its tempo slider (the only tempo control), the board, and ONE row under the board: the button, "Click here and play it
  to get feedback" / "Haz clic aquí y tócalo para recibir comentarios" (one key, `sc.play`), and a one-line strip beside it. The click
  starts the round in place; the button reads Stop during it. The strip: the mic chip ("Listening — <mic>", the device name cut at
  140 px) and the recording label, the count-in number, the beat dot, "bar n/8"; after a round one summary line ("Pattern: 7 of 8
  bars. Chords: 8 of 8."), the headphones switch (Metronome on only), local mode's two links. No per-bar sentences: 13 strings gone in
  both languages (sc.target, tipDir, tipCount, listening, barN, patternOk, missedDown, missedUp, extra, countAnd, chordOk, chordWrong,
  chordUnheard); 1dp's floor still holds (1,660 i18n twins, floor 1,550). The step's count line now reads "Rounds done: n of 2".
- One exception to one line: the two once-per-device questions (the mic's "Turn on the microphone" panel; the recording question
  when the teacher collects takes) take a second line of the row, their button first and their words in two small lines beside it
  (48 px, EN and ES). Cutting a privacy line to fit one row seemed wrong; say if he wants it one line anyway.
- The beat: one clock (`scBeatAt`, the click grid the count-in set) for the click (headphones), the dot and the frame. The frame
  around the board pulses each beat (outline + soft shadow, never the border, nothing moves), stronger on each bar's 1, only with the
  Metronome on; with prefers-reduced-motion it holds a steady outline for the round and only the dot changes; every exit clears it.
  The dot went back to the Metronome tool's own size (22 px; its 1.25x grow dropped, the row clips it): the frame now carries the
  beat. At most one pulse a beat (125 BPM: 2.1 a second). The board's moving cell stays on the eased grid (unchanged).
- "default 60", reproduced on the old tip at 1366x657, nothing clicked: the step's slider read 60 and the Metronome tool 60 (buildStrum
  draws `readStoredBpm(key, spec.bpm || 60)`; ca-52's strum had no bpm); opening the old box moved the slider to 85, the Metronome
  stayed at 60. Now ca-52's strum spec has `bpm: 85`: a fresh open shows 85 on the slider, and the step's Play clicks opens the
  Metronome at 85. The rail's own Metronome keeps its own setting (a separate tool); the round always runs at the step's tempo.
- ca-52's line: "Play the eight bars, two full rounds, with the button under them." ("two full times" drew tap dots a student could
  tick the step with: 1eh caught it.)

**The boxes, measured** (1366x657, viewport px, the real page, headless Chrome, a real round with the fake mic):
| | board | button | row | the bar being played |
|---|---|---|---|---|
| old tip, nothing open | 232-419 (then) | 197-225, above the board | - | - |
| old tip, box open | 577-765 (bars 5-8 below 657) | 197-225 | box 236-567 (332 px) | bar 5 and 8: 640-727, outside |
| new, before / during / after rounds, EN + ES | 232-419 | 430-457, under the board | 427-459 (32 px) | bars 1, 4: 233-319; 5, 6, 8: 331-418, inside |
| new, the one-time mic panel | 232-419 | 438-465 | 427-475 (48 px) | - |
The row never passed 32 px during a round (sampled every frame-ish, both languages); the rounds line sits at 485-502.

**Pins and proofs.** 1eh: the button in a row under the board and not in the BPM group; one wording key; the slider drawn at 85; no
tempo control in the strip; no `<div>` in the part; the per-bar strings gone; the frame 32 pulses and 8 "1"s a round with the
Metronome on, 0 off, cleared on finish / interrupt / close; click and visible beat both on scBeatAt. Break-it, each red, control
green (10 of 10): the button above the board; back in the BPM group; a box in the strip; a per-bar string back; no bpm on ca-52; the
frame not cleared; pulsing with the Metronome off; the 1 not marked; the beat on the eased grid; a tempo control in the strip.
smoke.mjs's step rewritten (the button under the board; the refused-mic path in the row; then one real round with the fake mic at the
slider's top, the board first scrolled half above the window: board, button and the bar being played inside the window at bars 1, 4,
5, 8; the row at most 36 px; Stop during it; one summary line and no per-bar line after it). Not run as smoke.mjs (the brief's
limit): its block run verbatim in a headless page, 0 fails in 23 s; break-it 4 of 4 red (no scroll at the start, the button above the
board, a second line in the row during the round, per-bar lines after it). Full checks passed on the commit. Screenshots 20-23, EN
+ ES: before a round, the mic panel, mid-round on a "1" (frame strong) and on beat 3 of bar 6 (frame light), after round 1, after
round 2 (step ticked).

## 20. Jonathan's three real takes, replayed (measure only; 2026-11-14)

J01: 85 BPM, his own key: every strum played, nothing in the rests, the chords right except bar 4 (G5 played where C5 is due: "i
switched to G5 one measure early"). J02: 98 BPM, no Metronome, all right except his timing in bar 7 (left out of the strum counts).
J03: 98 BPM, the Metronome's flashing dot only, "close enough on all strums". All three on a MacBook Air's built-in mic, window 0.45,
ratios 1.2 / 1.46. NOT a Chromebook: everything below is one laptop, one player, one room. Tool: `tools/mic-sim/strum-check-replay.mjs`
(committed with this section); raw output in the session scratchpad `strumcheck/replay/`.

**Reproduced.** The take's saved times are about one ScriptProcessor buffer off its audio: every replayed onset came 93-103 ms after
the live one (4096 samples at 44.1 kHz is 93 ms; micRecStartPerf's estimate of the recording's first sample). With the clock fitted
on the onsets (45 of 45, 41 of 43 and 44 of 44 live onsets paired, 90% within 15-21 ms) and then scanned +-40 ms for the best match:
slots 64 / 63 / 63 of 64, chords 7 / 8 / 7 of 8 (the one chord each that differs is a rule b "unheard" vs "ok" with one reading
more or less). The scan is a finding of its own: across 17 clocks 5 ms apart, J02 lands a whole slot off in 9 and J03 in 4. On these
takes the check's result depends on 20 ms of timing.

**Job one: the grid a slot off (J03, then J02).** On the click grid (ms each onset sits off its click-grid slot):
- J03 bar 1: the "1" at +54 ms, then +118, then his up-strum at +167 (more than half an eighth, 153 ms, late): he dragged about 10%
  inside bar 1 (eighths of 338 ms against the click's 306), then held the tempo about 0.8-0.95 of an eighth late (+240..+290 ms).
- The grid eases 0.2 of each onset's deviation, and only for deviations under 0.45 of an eighth. It followed him to +87 ms. Then his
  onsets were nearer the NEXT slot, `Math.round` matched them there with negative deviations (-64..-110 ms), and the easing pulled the
  grid back toward the click: +87, 65, 44, 24, 6, -8 ms by bar 3. A slide, not a snap. From bar 3 every strum sits in the slot after
  its own: his {0,2,3,5,6,7} heard as {1,3,4,6,7,0}, exactly the live picture (both rests "extra", slots 2 and 5 "missed").
- J02: the grid followed him almost a whole slot (to +287 ms by bar 5: the easing works for a slow drift). In bar 7, his "off" bar,
  he slipped about one more eighth; in bar 8 his strums sit 9-74 ms before the next slot, so the small negative deviations held the
  grid on the wrong slot (bar 8's "1" landed in slot 1's window: "extra", and its chord was never read: 0 readings).
- **The beat dot** (the code before the redesign): it flashed 0-21 ms after the EASED grid's beat (median 6-9 ms, one frame), so it
  moved with the grid: up to 303 ms after the click's beat on J02, from +102 to -150 ms on J03. A student exactly on the flash is
  graded about a frame plus the dot's 50 ms transition late (inside the window): not a bug by itself. The loop is: the dot followed
  the grid, the grid followed the student, so a student who follows the dot chases his own lag. Since 554203b the dot, the frame and
  the click are on the click grid: measured on the same three takes, 0-17 ms after the click's beat whatever the grid does.
- **Without a Metronome the student is the tempo.** The check should anchor to the student's own strums where they fit the pattern
  (the shape of D.DU.UDU is not the same shifted by an eighth: 4 of 6 strum places overlap), not to a click he never heard and not to
  a grid that eases one onset at a time. With an audible click (headphones), the click is the tempo; none of these takes had one.

**The missed strums.** J01: 5 missed (4 up-strums, slots 3 and 7 after a down): each a weak attack, the loudest frame 1.10-1.16x the
smoothed level and 1.10-1.33x the smoothed HF, under 1.2 / 1.46; none blocked by the 140 ms refractory. J02: 11 missed (7 up): 7
weak attacks, 3 nothing at that instant (the strum was a slot away), 1 refractory. J03: 21 missed (9 up): 7 weak attacks, 13 a slot
away, 1 refractory. So it is the ratios (an up-strum right after a down-strum lands on ringing strings) and the grid, not the
refractory time. J01's bar-6 "extra" on "3" (dev -24 ms): a real attack, 1.83x level and 1.81x HF, stronger than any of his missed
up-strums; a late ring does not rise. Most likely the hand touched the strings on its swing through the rest; unconfirmed.

**The chord on the 1** (every bar's saved readings, `strumcheck/chords.mjs`):
- J01 bar 4 (G5 played, C5 due; bar 3 was C5 too, so it is not a change and rule b IS rule a over all readings). Live: 7 readings,
  54.17 54.79 38.02 38.05 50.33 50.41 50.26 (3 within 340 ms). Rule a (first 340 ms): pitch classes F#, G, D: one G of 3 = 0.33,
  C5's G counts, so "ok". Rule b (all 7): one G of 7 = 0.14, between 0.10 and 0.20: "unheard"; "wrong" needs 0.10 or less, so it
  was ONE reading short (the single G at 54.79; with it gone, 0 of 6 = wrong). Rule c = b, and b's "unheard" falls back to a: "ok".
  G5 for C5 passes because G is in both, and pitch classes drop the octave. The evidence that separates them on this audio: D (38.0
  and 50.3, G5's fifth and its octave below; 5 of the 7 readings), which C5 does not have; and no C anywhere (C5's 48 / 60, or the
  detector's 36 an octave under, as bar 3 shows: 36.1 x3 and 48.1). An octave-aware vote (a reading within 0.6 of a chord's exact
  note or an octave under it; shared exact notes vote for both) says G5: wrong caught.
- J02 bar 5 (G5 after C5): 10 readings all 43.1 (G2, G5's root on the low E). Rule b wants a D and sees none: "unheard"; c = a: ok.
  By octave 43 belongs to G5 only (C5's G is 55).
- J01 bar 7 (D5): readings slide 56.3 -> 59.3 inside 600 ms (then 38, 44, 60.3): D5's A (57) read 0.7 flat at the attack and sharp
  after; rounded to pitch classes most are G# or A#, so "unheard" live (the replay, one reading different, "wrong"). Bars 1, 2 and 8
  read the same A 56.0-58.0. A +-0.75 semitone tolerance would take them; whether his A string is flat or this is the detector on a
  power chord, only more takes can say.
- Bars with 0 readings (J02 bar 8; J03 bars 2, 3, 7, 8): the "1" was not heard (the grid a slot off), so no chord was read at all.
  These come back with the grid fix, not with a chord rule.
Totals on the 24 bars (23 right chords, 1 wrong): today's c 18 of 23 right called right (5 "unheard"), wrong caught 0 of 1; octave
vote first, then c: 19 of 23, 4 "unheard", wrong caught 1 of 1, no right chord called wrong. Rule a alone 17, b 16, a +-0.75: 19 / 0 of 1.

**The sweep** (each take at its kept clock and +-20 ms; cells: strums heard of N (worst of the three clocks) · false extras in rests ·
bars right at the three clocks; the bench: tools/mic-sim/strum-check-loop.mjs, quiet room, Chromebook mic model). Full tables below.
Read together:
| setting | 3 takes: strums heard / false extras / bars right | chords right / wrong caught | bench: nothing played, slots heard | bench right player 85: strums / bars | bars passed (want 0): straight eighths 85/98 · beats only 85/98 |
|---|---|---|---|---|---|
| today: 1.2 / 1.46, grid eases 0.2 | 101/138 · 16/46 · 5/24 | 17/23 · 0/1 | 0 | 181/192 · 22/32 | 0/0 · 0/0 |
| ratios 1.1 / 1.2 | 112/138 · 20/46 · 9/24 | 21/23 · 0/1 | 0 | 192/192 · 32/32 | 0/0 · 0/0 |
| refractory 80 ms | 121/138 (worst clocks 96) · 3/46 · 10/24 | 21/23 · 0/1 | 0 | 181/192 · 22/32 | 0/0 · 0/0 |
| (a) the grid capped at +-0.25 / 0.5 slot | 94/138 · 24 and 22/46 · 4/24 | | 0 | | 0/0 · 0/0 |
| (b) easing only from down-strums on beats | 90/138 · 23/46 · 4/24 | | 0 | | 0/0 · 0/0 |
| (c) no easing (the click is the tempo) | 82/138 · 25/46 · 0/24 | | 0 | | 0/0 · 0/0 |
| (d) pattern shape, +-half a slot of the click grid | 107/138 · 6/46 · 4/24 | | 0 | | 3/0 · 0/0 |
| (d') pattern shape, +-1 slot of the grid of the moment | 120/138 · 1/46 · 8/24 | | 0 | | 2/2 · 0/0 |
| **(d') + ratios 1.1 / 1.2** | **130/138 (worst clocks 125) · 1/46 · 16/24** | | **0** | 16/16 bars (85, 2 seeds) | **3/1 · 0/0** |
| (d') + ratios 1.1 / 1.2 + refractory 80 | 132/138 · 1/46 · 16/24 | | 0 | | 4/4 · 2/0 |
(Also measured: slower easing 0.1, easing only on strum slots, "anchor on the 1", "no easing inside a bar": none beat today's on
these takes; full rows below.)

**Recommendation, one sentence each.**
- Try next: the pattern-shape anchor (d': over the last bar's onsets, the offset within +-1 eighth of the grid that best fits
  D.DU.UDU, +1 a strum place, -1.5 a rest) with ratios 1.1 / 1.2; on these three takes it hears 130 of 138 strums instead of 101,
  false extras 1 of 46 instead of 16, bars right 16 of 24 instead of 5, nothing played still 0, beats-only still fails every bar,
  and it costs a few straight-eighth bars passing (3 of 16 at 85 BPM, 1 at 98) and a new grid rule in the detector (deep review).
- Then, the chord: the octave-aware vote before rule c (19 of 23 right called right instead of 18; the G5-for-C5 bar caught).
- Takes to confirm, on the same local copy: take 4, the eight bars right at 85 with nothing on the screen but the board (no dot), to
  see the anchor hold a steady player; take 5, the same at 98 BPM, deliberately drifting later through bars 1-4 and back, to see the
  anchor follow without sliding a slot; take 6, straight eighths for all eight bars (every slot strummed), which must fail every bar;
  then, the one that matters most, any of these on a classroom CHROMEBOOK: one MacBook mic cannot stand in for it.

**Recommended site change, not shipped (measure-only job): three fields on the take.** The take does not say whether the
Metronome was on, whether "I'm wearing headphones" was ticked or whether clicks were scheduled, so a replay cannot tell a click from
a strum or know what the student was following. In scRecMeta: `metroOn: !!s.metro, headphones: !!s.hp, clicks: scClicksWanted(s.metro,
s.hp)`. And one more, found here: micRecStartPerf's start sits about one buffer late (93-103 ms on all three takes); the replay tool
fits it, but the saved times should be right at the source (shared by every game's takes: deep review).

**Full sweep tables** (each take's cell: strums heard / N (worst of the three clocks) · false extras / rests · bars right at the kept clock / -20 / +20 ms; the grid table's bench cells: bars right of 16 at 85 and 98 BPM):
RATIOS AND REFRACTORY (grid as the site)
| setting | J01 strums heard (worst of 3 clocks) / extras / bars right | J02 | J03 | 3 takes: strums / extras / bars | chords right of 7+8+8, wrong caught of 1 | bench 85: nothing played, slots heard of 192 | bench 85: right player, strums heard / false extras / bars |
| 1/1.2 | 48/48 (48) · 9/16 · 2/2/1 | 34/42 (30) · 11/14 · 1/0/3 | 36/48 (33) · 16/16 · 0/0/0 | 118/138 · 36/46 · 3/24 | 20/23 · 0/1 | 0 | 192/192 · 0 · 32/32 |
| 1/1.33 | 48/48 (48) · 9/16 · 2/2/1 | 34/42 (30) · 11/14 · 1/0/1 | 36/48 (33) · 16/16 · 0/0/0 | 118/138 · 36/46 · 3/24 | 20/23 · 0/1 | 0 | 191/192 · 0 · 31/32 |
| 1/1.46 | 48/48 (48) · 9/16 · 2/2/1 | 34/42 (30) · 11/14 · 1/0/1 | 36/48 (33) · 16/16 · 0/0/0 | 118/138 · 36/46 · 3/24 | 20/23 · 0/1 | 0 | 189/192 · 0 · 29/32 |
| 1/1.6 | 48/48 (48) · 9/16 · 2/2/1 | 34/42 (30) · 11/14 · 1/0/1 | 36/48 (33) · 16/16 · 0/0/0 | 118/138 · 36/46 · 3/24 | 21/23 · 0/1 | 0 | 189/192 · 0 · 29/32 |
| 1/1.7 | 48/48 (48) · 9/16 · 2/2/1 | 34/42 (30) · 11/14 · 1/0/1 | 36/48 (33) · 16/16 · 0/0/0 | 118/138 · 36/46 · 3/24 | 21/23 · 0/1 | 0 | 189/192 · 0 · 29/32 |
| 1.1/1.2 | 46/48 (45) · 1/16 · 5/4/4 | 36/42 (36) · 3/14 · 4/4/4 | 30/48 (30) · 16/16 · 0/5/0 | 112/138 · 20/46 · 9/24 | 21/23 · 0/1 | 0 | 192/192 · 0 · 32/32 |
| 1.1/1.33 | 46/48 (45) · 1/16 · 5/4/4 | 35/42 (35) · 3/14 · 4/4/4 | 31/48 (30) · 16/16 · 0/0/0 | 112/138 · 20/46 · 9/24 | 20/23 · 0/1 | 0 | 188/192 · 0 · 28/32 |
| 1.1/1.46 | 46/48 (45) · 1/16 · 5/4/4 | 35/42 (35) · 3/14 · 4/4/5 | 31/48 (30) · 16/16 · 0/0/0 | 112/138 · 20/46 · 9/24 | 20/23 · 0/1 | 0 | 184/192 · 0 · 25/32 |
| 1.1/1.6 | 46/48 (45) · 1/16 · 5/4/4 | 35/42 (35) · 3/14 · 4/4/5 | 31/48 (30) · 16/16 · 0/0/0 | 112/138 · 20/46 · 9/24 | 21/23 · 0/1 | 0 | 184/192 · 0 · 25/32 |
| 1.1/1.7 | 46/48 (45) · 1/16 · 5/4/4 | 35/42 (35) · 3/14 · 4/4/5 | 31/48 (30) · 16/16 · 0/0/0 | 112/138 · 20/46 · 9/24 | 21/23 · 0/1 | 0 | 184/192 · 0 · 25/32 |
| 1.2/1.2 | 46/48 (44) · 1/16 · 5/4/4 | 34/42 (33) · 2/14 · 2/2/2 | 28/48 (28) · 15/16 · 0/0/0 | 108/138 · 18/46 · 7/24 | 19/23 · 0/1 | 0 | 192/192 · 0 · 32/32 |
| 1.2/1.33 | 43/48 (43) · 1/16 · 4/4/4 | 31/42 (31) · 2/14 · 1/2/1 | 28/48 (28) · 13/16 · 0/3/0 | 102/138 · 16/46 · 5/24 | 18/23 · 0/1 | 0 | 185/192 · 0 · 25/32 |
| 1.2/1.46 | 43/48 (42) · 1/16 · 4/3/4 | 31/42 (31) · 2/14 · 1/3/1 | 27/48 (27) · 13/16 · 0/3/0 | 101/138 · 16/46 · 5/24 | 17/23 · 0/1 | 0 | 181/192 · 0 · 22/32 |
| 1.2/1.6 | 43/48 (42) · 1/16 · 4/3/4 | 31/42 (31) · 2/14 · 1/3/1 | 28/48 (27) · 14/16 · 0/3/0 | 102/138 · 17/46 · 5/24 | 18/23 · 0/1 | 0 | 175/192 · 0 · 17/32 |
| 1.2/1.7 | 43/48 (42) · 1/16 · 4/3/4 | 31/42 (31) · 2/14 · 1/3/1 | 28/48 (27) · 14/16 · 0/3/0 | 102/138 · 17/46 · 5/24 | 18/23 · 0/1 | 0 | 170/192 · 0 · 14/32 |
| 1.3/1.2 | 45/48 (44) · 1/16 · 5/4/4 | 34/42 (33) · 2/14 · 1/1/1 | 27/48 (27) · 15/16 · 0/0/0 | 106/138 · 18/46 · 6/24 | 18/23 · 0/1 | 0 | 192/192 · 0 · 32/32 |
| 1.3/1.33 | 41/48 (41) · 1/16 · 4/4/4 | 31/42 (30) · 2/14 · 1/1/1 | 27/48 (27) · 13/16 · 0/3/0 | 99/138 · 16/46 · 5/24 | 17/23 · 0/1 | 0 | 185/192 · 0 · 25/32 |
| 1.3/1.46 | 40/48 (40) · 1/16 · 3/3/3 | 30/42 (21) · 2/14 · 1/1/0 | 26/48 (26) · 11/16 · 0/3/0 | 96/138 · 14/46 · 4/24 | 16/23 · 0/1 | 0 | 177/192 · 0 · 19/32 |
| 1.3/1.6 | 40/48 (40) · 1/16 · 3/3/3 | 15/42 (15) · 5/14 · 0/0/0 | 27/48 (27) · 12/16 · 0/3/0 | 82/138 · 18/46 · 3/24 | 15/23 · 0/1 | 0 | 166/192 · 0 · 11/32 |
| 1.3/1.7 | 40/48 (39) · 1/16 · 3/2/2 | 15/42 (15) · 5/14 · 0/0/0 | 26/48 (26) · 12/16 · 0/0/0 | 81/138 · 18/46 · 3/24 | 15/23 · 0/1 | 0 | 155/192 · 0 · 7/32 |
| 1.4/1.2 | 45/48 (44) · 1/16 · 5/4/4 | 33/42 (32) · 2/14 · 1/1/1 | 26/48 (26) · 15/16 · 0/0/0 | 104/138 · 18/46 · 6/24 | 17/23 · 0/1 | 0 | 192/192 · 0 · 32/32 |
| 1.4/1.33 | 40/48 (40) · 1/16 · 4/4/4 | 18/42 (18) · 5/14 · 0/0/1 | 26/48 (24) · 13/16 · 0/0/0 | 84/138 · 19/46 · 4/24 | 12/23 · 0/1 | 0 | 185/192 · 0 · 25/32 |
| 1.4/1.46 | 37/48 (37) · 1/16 · 2/2/2 | 18/42 (18) · 7/14 · 0/0/0 | 23/48 (23) · 12/16 · 0/0/0 | 78/138 · 20/46 · 2/24 | 11/23 · 0/1 | 0 | 174/192 · 0 · 17/32 |
| 1.4/1.6 | 37/48 (37) · 1/16 · 2/2/2 | 18/42 (18) · 7/14 · 0/0/0 | 24/48 (21) · 11/16 · 0/0/0 | 79/138 · 19/46 · 2/24 | 11/23 · 0/1 | 0 | 158/192 · 0 · 7/32 |
| 1.4/1.7 | 36/48 (36) · 1/16 · 1/1/1 | 18/42 (18) · 7/14 · 0/0/0 | 23/48 (21) · 11/16 · 0/0/0 | 77/138 · 19/46 · 1/24 | 10/23 · 0/1 | 0 | 141/192 · 0 · 3/32 |
| 1.2/1.46 refr 80 | 43/48 (42) · 1/16 · 4/3/4 | 35/42 (25) · 2/14 · 3/3/0 | 43/48 (29) · 0/16 · 3/3/0 | 121/138 · 3/46 · 10/24 | 21/23 · 0/1 | 0 | 181/192 · 0 · 22/32 |
| 1.2/1.46 refr 100 | 43/48 (42) · 1/16 · 4/3/4 | 25/42 (25) · 8/14 · 0/0/1 | 29/48 (28) · 14/16 · 0/3/0 | 97/138 · 23/46 · 4/24 | 15/23 · 0/1 | 0 | 181/192 · 0 · 22/32 |
| 1.2/1.46 refr 120 | 43/48 (42) · 1/16 · 4/3/4 | 31/42 (31) · 2/14 · 1/3/1 | 28/48 (28) · 15/16 · 0/3/0 | 102/138 · 18/46 · 5/24 | 17/23 · 0/1 | 0 | 181/192 · 0 · 22/32 |

GRID RULES (ratios 1.2 / 1.46)
| grid rule | J01 strums / extras / bars (3 clocks) | J02 | J03 | 3 takes: strums / extras / bars | bench 85 + 98: right, late 100, early 100, drag 2/4, rush 2/4: bars right | straight eighths / beats only: bars right (want 0) | nothing played: slots heard |
| 1.2/1.46 | 43/48 (42) · 1/16 · 4/3/4 | 31/42 (31) · 2/14 · 1/3/1 | 27/48 (27) · 13/16 · 0/3/0 | 101/138 · 16/46 · 5/24 | 10/16 5/16 · 8/16 8/16 · 9/16 9/16 · 10/16 6/16 · 8/16 4/16 · 11/16 6/16 · 6/16 4/16 | 0/0 · 0/0 | 0/0 |
| 1.2/1.46 grid base 0.1 | 43/48 (42) · 1/16 · 4/3/4 | 24/42 (24) · 10/14 · 0/0/0 | 28/48 (28) · 14/16 · 0/0/0 | 95/138 · 25/46 · 4/24 | 10/16 5/16 · 8/16 8/16 · 9/16 9/16 · 9/16 6/16 · 2/16 1/16 · 10/16 6/16 · 1/16 2/16 | 0/0 · 0/0 | 0/0 |
| 1.2/1.46 grid strumOnly 0.2 | 43/48 (42) · 1/16 · 4/3/4 | 31/42 (31) · 2/14 · 1/3/1 | 27/48 (27) · 13/16 · 0/3/0 | 101/138 · 16/46 · 5/24 | 10/16 5/16 · 8/16 8/16 · 9/16 9/16 · 10/16 6/16 · 8/16 4/16 · 11/16 6/16 · 6/16 4/16 | 0/0 · 0/0 | 0/0 |
| 1.2/1.46 grid cap 0.2 cap 0.25 | 43/48 (42) · 1/16 · 4/3/4 | 25/42 (25) · 10/14 · 0/0/0 | 26/48 (26) · 13/16 · 0/0/0 | 94/138 · 24/46 · 4/24 | 10/16 5/16 · 8/16 8/16 · 9/16 9/16 · 5/16 2/16 · 2/16 1/16 · 8/16 3/16 · 2/16 2/16 | 0/0 · 0/0 | 0/0 |
| 1.2/1.46 grid cap 0.2 cap 0.5 | 43/48 (42) · 1/16 · 4/3/4 | 24/42 (24) · 8/14 · 0/0/0 | 27/48 (27) · 13/16 · 0/2/0 | 94/138 · 22/46 · 4/24 | 10/16 5/16 · 8/16 8/16 · 9/16 9/16 · 6/16 3/16 · 3/16 2/16 · 9/16 4/16 · 2/16 3/16 | 0/0 · 0/0 | 0/0 |
| 1.2/1.46 grid beatsDown 0.2 | 43/48 (42) · 1/16 · 4/3/4 | 22/42 (22) · 9/14 · 0/0/0 | 25/48 (25) · 13/16 · 0/0/0 | 90/138 · 23/46 · 4/24 | 10/16 5/16 · 8/16 8/16 · 9/16 9/16 · 9/16 6/16 · 2/16 1/16 · 10/16 6/16 · 1/16 2/16 | 0/0 · 0/0 | 0/0 |
| 1.2/1.46 grid none | 32/48 (25) · 3/16 · 0/1/0 | 23/42 (20) · 11/14 · 0/0/0 | 27/48 (27) · 11/16 · 0/0/0 | 82/138 · 25/46 · 0/24 | 10/16 5/16 · 1/16 0/16 · 9/16 9/16 · 1/16 2/16 · 0/16 0/16 · 6/16 2/16 · 0/16 2/16 | 0/0 · 0/0 | 0/0 |
| 1.2/1.46 grid shape 1 | 43/48 (41) · 1/16 · 4/3/4 | 28/42 (25) · 5/14 · 0/0/0 | 36/48 (32) · 0/16 · 0/2/0 | 107/138 · 6/46 · 4/24 | 10/16 6/16 · 9/16 7/16 · 9/16 9/16 · 5/16 3/16 · 2/16 2/16 · 7/16 4/16 · 2/16 2/16 | 3/0 · 0/0 | 0/0 |
| 1.2/1.46 grid shapeFree 1 | 43/48 (42) · 1/16 · 4/3/4 | 34/42 (34) · 0/14 · 1/3/2 | 43/48 (42) · 0/16 · 3/3/3 | 120/138 · 1/46 · 8/24 | 10/16 6/16 · 9/16 7/16 · 9/16 9/16 · 8/16 6/16 · 6/16 4/16 · 10/16 6/16 · 6/16 4/16 | 2/2 · 0/0 | 0/0 |
| 1.2/1.46 grid shapeFree 0.5 | 43/48 (41) · 1/16 · 4/3/3 | 30/42 (26) · 3/14 · 1/2/1 | 34/48 (33) · 0/16 · 1/1/1 | 107/138 · 4/46 · 6/24 | 10/16 6/16 · 7/16 5/16 · 9/16 9/16 · 3/16 2/16 · 1/16 1/16 · 4/16 3/16 · 0/16 2/16 | 0/0 · 0/0 | 0/0 |
| 1.2/1.46 grid barEnd 0.5 | 43/48 (42) · 1/16 · 4/3/4 | 23/42 (23) · 9/14 · 0/0/0 | 27/48 (27) · 13/16 · 0/0/0 | 93/138 · 23/46 · 4/24 | 10/16 5/16 · 8/16 7/16 · 9/16 9/16 · 6/16 6/16 · 0/16 0/16 · 10/16 4/16 · 1/16 2/16 | 0/0 · 0/0 | 0/0 |

Combinations:
| 1.1/1.2 | 46/48 (45) · 1/16 · 5/4/4 | 36/42 (36) · 3/14 · 4/4/4 | 30/48 (30) · 16/16 · 0/5/0 | 112/138 · 20/46 · 9/24 | 16/16 14/16 · 14/16 14/16 · 15/16 15/16 · 15/16 15/16 · 11/16 12/16 · 16/16 11/16 · 14/16 11/16 | 0/0 · 0/0 | 0/0 |
| 1.2/1.46 refr 80 | 43/48 (42) · 1/16 · 4/3/4 | 35/42 (25) · 2/14 · 3/3/0 | 43/48 (29) · 0/16 · 3/3/0 | 121/138 · 3/46 · 10/24 | 10/16 6/16 · 9/16 8/16 · 9/16 9/16 · 10/16 6/16 · 8/16 5/16 · 11/16 6/16 · 8/16 4/16 | 0/0 · 0/0 | 0/0 |
| 1.1/1.2 grid shapeFree 1 | 46/48 (45) · 1/16 · 5/4/4 | 39/42 (35) · 0/14 · 5/5/1 | 45/48 (45) · 0/16 · 6/6/6 | 130/138 · 1/46 · 16/24 | 16/16 15/16 · 16/16 16/16 · 15/16 15/16 · 13/16 13/16 · 5/16 10/16 · 15/16 11/16 · 9/16 11/16 | 3/1 · 0/0 | 0/0 |
| 1.2/1.46 refr 80 grid shapeFree 1 | 43/48 (42) · 1/16 · 4/3/4 | 38/42 (37) · 0/14 · 3/3/4 | 43/48 (41) · 0/16 · 3/3/3 | 124/138 · 1/46 · 10/24 | 10/16 7/16 · 10/16 8/16 · 9/16 9/16 · 12/16 7/16 · 10/16 7/16 · 10/16 6/16 · 7/16 4/16 | 4/2 · 2/0 | 0/0 |
| 1.1/1.2 refr 80 grid shapeFree 1 | 46/48 (45) · 1/16 · 5/4/4 | 40/42 (40) · 0/14 · 5/6/5 | 46/48 (45) · 0/16 · 6/6/6 | 132/138 · 1/46 · 16/24 | 16/16 15/16 · 16/16 16/16 · 15/16 15/16 · 16/16 16/16 · 16/16 15/16 · 15/16 12/16 · 12/16 13/16 | 4/4 · 2/0 | 0/0 |

**Every missed strum, by cause** (`strumcheck/misses.mjs`):
```
J01: 5 strums missed (4 of them up-strums): onset heard but put in another slot or between 0; refractory 0; a weak attack under the ratio tests 5; nothing at that instant (the strum landed a slot away) 0 — best level/HF ratio in the window: 1.3: 1.15/1.22, 1.7: 1.10/1.10, 2.7: 1.16/1.23, 7.3: 1.11/1.33, 7.6: 1.16/1.19
J02: 11 strums missed (7 of them up-strums): onset heard but put in another slot or between 0; refractory 1; a weak attack under the ratio tests 7; nothing at that instant (the strum landed a slot away) 3 — best level/HF ratio in the window: 1.6: 1.12/1.14, 1.7: 1.18/1.20, 2.3: 1.12/1.28, 3.3: 1.13/1.13, 4.7: 1.16/1.04, 6.3: 1.08/1.02, 8.0: 1.08/1.22
J03: 21 strums missed (9 of them up-strums): onset heard but put in another slot or between 0; refractory 1; a weak attack under the ratio tests 7; nothing at that instant (the strum landed a slot away) 13 — best level/HF ratio in the window: 1.6: 1.12/1.09, 1.7: 1.13/1.06, 2.0: 1.14/1.03, 3.0: 1.11/1.45, 7.2: 1.06/1.18, 8.0: 1.19/1.03, 8.2: 1.05/1.08
```

## 21. "Can't you do some fancy math to cancel that out?" The click through a laptop speaker (measure only; 2026-11-14)

Goal: with the Metronome's click sounding through the speaker, (i) nothing played -> 0 strums heard, (ii) a right player scores as
with no click, (iii) a real extra strum on "3" still caught, (iv) real strums that land on a click (slots 0, 2, 6) still heard.
Bench: the real check (ca-52) with the Metronome on and headphones ticked, so the page queues a click per beat, rendered into the room
at the speaker level (0.03 raw at the mic, and 0.1), flat and through a 300 Hz high-pass (a small speaker); quiet room; nothing played
/ the right player / an extra strum on "3" in bar 2; 60, 85, 100 BPM; 4 rounds a cell (128 beat slots). 36 clicks every round, 0
mismatches. Then Jonathan's three takes (no click in them) replayed with A and B on, to show what each costs real playing. Harness:
session scratchpad `strumcheck/click-run.mjs` + `clickgen.py` (temporary copies of listen-site.mjs / strum-check-loop.mjs, removed).

| candidate | level · speaker | (i) nothing played: beat slots heard, 60 · 85 · 100 | (ii) right player at 85: strums / bars right | (iv) strums on a click heard, 60 / 85 / 100 | (iii) extra on "3" caught, of 4 each |
|---|---|---|---|---|---|
| no click | - | 0 · 0 · 0 of 128 | 178/192 · 19/32 | 96/96 / 93/96 / 85/95 | 4 / 4 / 3 |
| today's 660 Hz click, nothing done | any | 128 · 128 · 128 | 177-178/192 · 11-19/32 | 96 / 92-93 / 83-89 | 3-4 each |
| 3520 Hz click, nothing done | any | 128 · 128 · 128 | 178/192 · 19/32 | 96 / 93 / 85 | 4 / 4 / 3 |
| A: 3520 Hz + notch (Q 2) on what the check measures | 0.03 | 0 · 0 · 0 | 174-175/192 · 15-16/32 | 95 / 90-91 / 83 | 4 / 4 / 3 |
| A | 0.1 | 128 · 128 · 128 | 174-175/192 | 95 / 90-91 / 83 | 4 / 4 / 3 |
| B: ring confirmation, ratio 1.3 | any | 0 · 1 · 0 | 174/192 · 16/32 | 92 / 89 / 78 | **2 / 3 / 3** |
| B, ratio 1.1 | any | 31-50 of 128 | 177/192 · 18/32 | 94 / 92 / 82 | 4 / 4 / 3 |
| C: 3520 Hz, subtract the fitted click (ideal timing) | 0.03 / 0.1 | 0 · 0 · 0 (click left: -7.7 / -17 dB) | 178/192 · 19/32 | 96 / 93 / 85 | 4 / 4 / 3 |
| C, 3520 Hz, the speaker's timing off by +-0.1 ms | 0.1 | 128 (85 BPM; click left: +0.3 dB) | 178/192 | 93 | - |
| C, 3520 Hz, a strum during the count-in | 0.1 | 74 of 128 (85) | 178/192 | 93 | - |
| C: 660 Hz, subtract (ideal) | 0.03 flat / HP; 0.1 | 32-96 / 0-2 of 128; 128 (click left -20..-25 dB) | 178/192 | 96 / 93 / 85 | 4 / 4 / 3 |
| A+B (the lead's guess) | 0.03 / 0.1 | 0 · 0 · 0 / 1 · 1 · 0 | 171/192 · 14/32 | 92 / 87 / 75 | **2 / 3 / 3** |
Real takes, no click, A and B on (B gating every beat as if a click sounded): A changes nothing (J01 43, J02 31, J03 27 of 48 / 42 /
48 at the kept clock, as today); B 1.3 costs 1 strum each on J02 and J03 at the kept clock and 5 on J02 at +-20 ms (27 instead of 32),
16 on J03 at -20 ms; chords one fewer on J03. Full rows: `strumcheck/click-table.txt`.

What each does:
- **A** (the click out of the guitar's band, the check's measures notched at the click's pitch; pitch untouched, it reads under 1.5
  kHz): the HF ratio then sees the strum's own brightness minus a narrow band around 3.5 kHz, which costs a bright up-strum little
  (right player 174 instead of 178). It only works while the click is quiet: the click's instant attack is broadband, and at the
  louder level enough of it passes the notch to read as a strum on every beat. A 5 ms fade-in on the click (section 19's table: the
  fade-in alone did not stop silence-hearing) with the notch is untried.
- **B** (an onset within 40 ms of a click's arrival counts only if the level 60-120 ms later is still 1.3x the level before it):
  silence solved at both levels, but it costs exactly where a click and a strum meet: a strum on a beat over strings still ringing
  from the eighth before does not rise 1.3x, so 4-7 of ~95 on-beat strums are lost, and an extra strum on "3" (a beat) is caught 2-3
  of 4 instead of 4. At 1.1 the clicks come back (31-50 of 128). Its real cost is on the beats, where the chord is read.
- **C** (the speaker-to-mic path fitted by least squares, 64 taps after a delay search, on the 4 count-in clicks; the predicted click
  subtracted during the round): perfect in the bench, because the bench's speaker is a pure delay. It fails the moment the timing
  moves: +-0.1 ms of speaker timing leaves a 3520 Hz click whole (+0.3 dB: a 3.5 kHz wave turns over every 0.28 ms) and a 660 Hz one
  -11 dB, still heard on every beat at the louder level. A strum during the count-in spoils the fit (74 of 128 heard). A real room's
  echo, the browser's output buffering and a speaker that is not linear are all worse than +-0.1 ms. It would also need an AudioWorklet
  in front of the analyser (the check reads the analyser after the site's filters). Not worth building on this evidence.
- **D** (the browser's echo cancellation): the site asks for echoCancellation, noiseSuppression and autoGainControl all OFF
  (coach-core.js:672, tuner.js:388; Jonathan's three takes recorded all three false and voiceIsolation false). Echo cancellation
  subtracts what the speaker plays but also ducks and gates the near end when both sound at once and treats a sustained guitar note as
  echo or noise to suppress, smearing the attacks the onset test needs and the steady pitch the chord test needs; the ones in Chrome
  are tuned for speech. No evidence here that it is safe: leave it off.

**Recommendation.** None of the four meets all four goals; headphones-only stays the right default. If a speaker click is wanted
anyway, the one to try is B at 1.3 with the 3520 Hz click (silence: 0-1 of 128 at both levels; cost: 2-4% of the right player's
strums, 4-8% of on-beat strums, one in four extras on "3" missed). It is a detector rule limited to this check (a wrapper on its use of
srHearStrum around scheduled click times), so a deep review, and real takes first. **What Jonathan can record** on the local copy,
MacBook speaker at his normal level, NO headphones but the "I'm wearing headphones" box ticked (so the page plays the click through
the speaker), Metronome on, 85 BPM: (1) a full round playing nothing; (2) the eight bars right; (3) the eight bars right with one
extra down-strum on "3" in bar 2 and a note saying so; ideally (4) the same three on a classroom Chromebook. Today's click is 660 Hz;
B does not depend on the tone, so these takes test B as they are; the 3520 Hz tone would need a local-only change first.


## 22. The candidate in the noisy rooms: STOPPED, nothing built (2026-11-14)

The lead's step 1: today (1.2 / 1.46, easing 0.2) and the pattern-shape anchor d' with ratios 1.1 / 1.2, 1.15 / 1.3 and 1.2 / 1.33,
on the bench (tools/mic-sim/strum-check-replay.mjs `--sweep --cands` with the new "noisy" bench: each student in quiet, class
(neighbours' guitars), room7 and room4 (fitted to real period-7 and period-4 takes: talking, neighbours, bangs), nothing played also
in talk and chatter (talking, no guitar), 85 and 98 BPM, 2 rounds each = 32 bars a room) and on Jonathan's three takes.

**The deciding rows** (bars passed, 85 + 98 BPM; the limits: nothing played and talking only 0 in every room, beats only 0, straight
eighths at most 4 of 16 in any cell):
| | nothing played: quiet / class / room7 / room4 / talk / chatter | beats only: room7 / room4 | straight eighths, worst cell | right player, bars right: class / room7 / room4 | 3 takes: strums / extras / bars |
|---|---|---|---|---|---|
| (i) today | 0 / 0 / 0 / **1** / 0 / 0 | 0 / 0 | 1 of 16 | 14 / 9 / 0 of 32 | 101/138 · 16/46 · 5/24 |
| (ii) d' + 1.1 / 1.2 | 0 / 0 / **6** / **3** / **2** / **6** | **3** / **5** | **5** of 16 | 31 / 9 / 6 | 130/138 · 1/46 · 16/24 |
| (iii) d' + 1.15 / 1.3 | 0 / 0 / **4** / **3** / **1** / **4** | **5** / **7** | **5** of 16 | 29 / 14 / 5 | 125/138 · 1/46 · 12/24 |
| (iv) d' + 1.2 / 1.33 | 0 / **1** / **6** / **3** / **1** / **4** | **4** / **5** | 4 of 16 | 22 / 14 / 5 | 121/138 · 1/46 · 9/24 |

**The pick: none.** No candidate meets the rule (nor does today's: room4 nothing played passes 1 bar). Per the lead's step 2 I
stopped: no site change. Why the anchor fails it: with nothing played, a noisy room still gives the detector a sound in 140-200 of
every 256 slots (today's too: 197-204 in room7 / room4 / chatter); an anchor that is free to put the grid where the onsets fit the
pattern best finds bars where room noise fits D.DU.UDU. The anchor is what helps a real player most, and also what lets noise pass.

**For Jonathan, plainly:** in the two rooms fitted to real classrooms the check fails a RIGHT player on most bars under every setting,
today's included: room4 0-6 of 32 bars right, room7 9-14 of 32; room4 hears false extras in 21-46 of 64 rests. The check was built for
a quiet room (the brief said so) and these rooms are where it would be used during class. Loosening further would not fix this.
What would: students using it where it is quieter (a corner, the hallway, headphones do not help the mic), or a noise gate that needs
its own measuring. That is his call.

**What is ready if he wants it:**
- The anchor + octave vote + take fields, written and then taken back out: `Claude outputs/strum-coach/unbuilt-anchor-octave.patch`
  (172 lines, coach-strumcheck.js only, ratios left as placeholders `__RATIO__` / `__HF__`).
- The octave chord vote (b) and the three take fields (c) do not depend on the room. They could ship alone if the lead wants:
  on the three takes the vote calls 19 of 23 right chords right (18 today) and catches the G5-for-C5 bar. Not built: the step-2 stop
  covered step 3 as a whole.

The full room table (every student, every room):
```
### (i) today 1.2 / 1.46, easing 0.2 (reference)
nothing played, bars passed (85+98, 32 bars a room): quiet 0 · class 0 · room7 0 · room4 1 · talk 0 · chatter 0; slots heard: quiet 0 · class 76 · room7 202 · room4 197 · talk 145 · chatter 204
beats only, bars passed (of 32): quiet 0 · class 0 · room7 0 · room4 0 · straight eighths, bars passed per cell 85/98 (of 16): quiet 0/0 · class 0/1 · room7 0/0 · room4 1/0
right player (85+98): quiet strums 172/192, extras 1/64, bars 15/32 · class strums 167/191, extras 0/64, bars 14/32 · room7 strums 175/191, extras 22/64, bars 9/32 · room4 strums 154/192, extras 46/64, bars 0/32
bars right, rooms quiet class room7 room4 (85+98): late100 16/32 14/32 0/32 0/32 · early100 18/32 18/32 4/32 3/32 · drag2 16/32 18/32 8/32 1/32 · drag4 12/32 17/32 4/32 2/32 · rush2 17/32 18/32 3/32 0/32 · rush4 10/32 10/32 1/32 2/32
3 real takes (kept clock): strums 101/138 (worst clocks 100) · extras 16/46 · bars 5/24 · chords right 17/23
RULE: limits NOT met; right-player bars, class + room7: 23

### d' + 1.1 / 1.2
nothing played, bars passed (85+98, 32 bars a room): quiet 0 · class 0 · room7 6 · room4 3 · talk 2 · chatter 6; slots heard: quiet 0 · class 92 · room7 189 · room4 193 · talk 148 · chatter 199
beats only, bars passed (of 32): quiet 0 · class 0 · room7 3 · room4 5 · straight eighths, bars passed per cell 85/98 (of 16): quiet 3/1 · class 2/3 · room7 4/4 · room4 5/2
right player (85+98): quiet strums 191/192, extras 0/64, bars 31/32 · class strums 189/190, extras 0/64, bars 31/32 · room7 strums 180/190, extras 23/64, bars 9/32 · room4 strums 170/190, extras 25/64, bars 6/32
bars right, rooms quiet class room7 room4 (85+98): late100 32/32 26/32 10/32 4/32 · early100 30/32 30/32 8/32 7/32 · drag2 26/32 24/32 10/32 2/32 · drag4 15/32 12/32 7/32 9/32 · rush2 26/32 26/32 11/32 8/32 · rush4 20/32 19/32 6/32 6/32
3 real takes (kept clock): strums 130/138 (worst clocks 125) · extras 1/46 · bars 16/24 · chords right 22/23
RULE: limits NOT met; right-player bars, class + room7: 40

### d' + 1.15 / 1.3
nothing played, bars passed (85+98, 32 bars a room): quiet 0 · class 0 · room7 4 · room4 3 · talk 1 · chatter 4; slots heard: quiet 0 · class 77 · room7 174 · room4 183 · talk 144 · chatter 190
beats only, bars passed (of 32): quiet 0 · class 0 · room7 5 · room4 7 · straight eighths, bars passed per cell 85/98 (of 16): quiet 5/1 · class 2/2 · room7 2/4 · room4 2/5
right player (85+98): quiet strums 185/191, extras 0/64, bars 27/32 · class strums 187/190, extras 0/64, bars 29/32 · room7 strums 177/190, extras 14/64, bars 14/32 · room4 strums 163/191, extras 26/64, bars 5/32
bars right, rooms quiet class room7 room4 (85+98): late100 27/32 23/32 10/32 4/32 · early100 27/32 25/32 11/32 7/32 · drag2 23/32 20/32 12/32 5/32 · drag4 14/32 10/32 7/32 9/32 · rush2 23/32 24/32 10/32 8/32 · rush4 19/32 15/32 10/32 6/32
3 real takes (kept clock): strums 125/138 (worst clocks 123) · extras 1/46 · bars 12/24 · chords right 22/23
RULE: limits NOT met; right-player bars, class + room7: 43

### d' + 1.2 / 1.33
nothing played, bars passed (85+98, 32 bars a room): quiet 0 · class 1 · room7 6 · room4 3 · talk 1 · chatter 4; slots heard: quiet 0 · class 74 · room7 184 · room4 169 · talk 140 · chatter 195
beats only, bars passed (of 32): quiet 0 · class 0 · room7 4 · room4 5 · straight eighths, bars passed per cell 85/98 (of 16): quiet 3/0 · class 2/3 · room7 2/2 · room4 4/2
right player (85+98): quiet strums 182/192, extras 0/64, bars 24/32 · class strums 180/190, extras 0/64, bars 22/32 · room7 strums 173/190, extras 7/64, bars 14/32 · room4 strums 160/191, extras 21/64, bars 5/32
bars right, rooms quiet class room7 room4 (85+98): late100 22/32 22/32 13/32 9/32 · early100 26/32 22/32 12/32 5/32 · drag2 18/32 18/32 9/32 10/32 · drag4 13/32 9/32 11/32 9/32 · rush2 21/32 22/32 12/32 5/32 · rush4 17/32 13/32 9/32 3/32
3 real takes (kept clock): strums 121/138 (worst clocks 119) · extras 1/46 · bars 9/24 · chords right 22/23
RULE: limits NOT met; right-player bars, class + room7: 36

PICK: NONE meets the limits
  (i) today 1.2 / 1.46, easing 0.2: limits NOT met, class + room7 bars 23
  d' + 1.1 / 1.2: limits NOT met, class + room7 bars 40
  d' + 1.15 / 1.3: limits NOT met, class + room7 bars 43
  d' + 1.2 / 1.33: limits NOT met, class + room7 bars 36
```


## 23. Built: the pattern-shape grid, ratios 1.15 / 1.3, "too noisy to check", the octave chord vote (b206fa7) — for the reviewer

**Why the rule changed** (the lead): ca-52 is done after two FULL rounds whatever the score, so a false green bar earns nothing and a
false red on a right player is what Jonathan complained about; and he asked for "a too loud to grade warning ... instead of saying
it's wrong". So: where the room is too loud, say so and colour nothing; where it can grade (quiet, class), favour the right player.

### In plain words
- **The grid** (`scHearStrum` / `scAnchor`, coach-strumcheck.js:511-536). Every strum the detector hears (Strum Radar's onset test,
  the check's own ratios) moves the grid to wherever the last bar's sounds best fit D.DU.UDU: offsets 5 ms apart within one eighth of
  the grid it has, +1 for a sound in a strum place's window, -1.5 in a rest's, ties go to the nearest. A player who drifts keeps his
  own slots; a whole-eighth slide scores worse (shifted, the pattern fits 4 of its 6 strum places). Same with a headphone click (the
  half-eighth click-grid variant was measured and dropped: same for steady players, drag 4% 5-6 of 32 bars against 11-17).
- **The gate** (`scGateFrame` / `scGateDecide`, :445-458; called :617 and :620). During the count-in the student is not playing:
  the median frame level from 300 ms after the first click until bar 1's first window opens, leaving out each count-in click (20 ms
  before its time to 150 ms after), is the room. At 0.012 or more: "Too noisy to check right now. Keep playing: this round still
  counts." The round runs to bar 8 and counts toward the two rounds; no green, no red, no chord mark (:495, :579, :599); verdicts are
  still computed and saved with the take.
- **The chord** (`scChordO`, :538; used :576). Each reading within 0.6 semitone of one of a chord's own notes, or that note an octave
  down, votes for every chord of the step that has it; with 3+ readings the chord with the most votes alone wins ('ok' if it is the
  bar's chord, else 'wrong'); a tie or too few readings leaves it to rule c as before.

### Constants (coach-strumcheck.js)
| constant | value | line | | constant | value | line |
|---|---|---|---|---|---|---|
| SC_ONSET_RATIO | 1.15 (was 1.2) | 89 | | SC_GATE_LEVEL | 0.012 | 117 |
| SC_HF_RATIO | 1.3 (was 1.46) | 90 | | SC_GATE_SKIP / CLICK_PRE / CLICK_POST | 300 / 20 / 150 ms | 118 |
| SC_ANCHOR_RANGE | 1 eighth | 101 | | SC_OCT_TOL | 0.6 semitone | 109 |
| SC_ANCHOR_STEP | 5 ms | 102 | | SC_CHORD_RULE | 'oc' (was 'c') | 119 |
| SC_ANCHOR_SPAN | 8 eighths | 103 | | SC_RULE | 'strumcheck-2' | 70 |
| SC_ANCHOR_REST | -1.5 | 104 | | SC_WIN_FRAC (unchanged) | 0.45 | 79 |
Unchanged shared values it reads: CHK_ONSET_FLOOR / CHK_HF_FLOOR, COACH_ONSET_REFRACT 140 ms (coach-core.js). No other game's
listening changed (srHearStrum and CHK_ONSET_RATIO / CHK_HF_RATIO 1.4 / 1.7 untouched; 1eh pins both).

### How it was chosen
Step A, the gate (`strum-check-replay.mjs --gate`, 12 rounds a room and student, 85 + 98 BPM): the count-in's onset COUNT separates
the rooms but sits one onset from firing on a real quiet take (J02: 4 small sounds, his hands); the count-in LEVEL separates by about
3x either side, so the gate uses the level. At any threshold 0.006-0.02 it fires on 12 of 12 rounds in room7, room4 and chatter, 0 of
24 quiet rounds and 0 of 3 of Jonathan's takes (their count-in levels 0.0019-0.0033); class 5-11 of 12 and talk 5 of 12 depending on
the threshold. 0.012 sits well under chatter's quietest round (0.022). Step B (round by round, gate in front, 4 rounds a cell): at
0.012, (ii) 1.1 / 1.2 met every limit but let talk pass 3 of 40 bars (2.4 per 32: over the 2 allowed), so (iii) 1.15 / 1.3: quiet
nothing 0 / 64, beats 0 / 64, right 51 / 64; class (rounds let through) nothing 0 / 32, beats 0 / 24, right 22 / 24 (29.3 per 32);
talk 2 / 40. At 0.015, (iii) fails (class right 43 / 48 = 28.7 per 32). Tables: `strumcheck/replay/gated-table.txt`.

### The built code, measured
- **Jonathan's three takes**, at the same clocks as the candidate run: strums 125 / 138 (45, 36, 44), false extras 1 / 46, bars right
  12 / 24, chords 23 / 23 right called right and the G5-for-C5 bar caught; the candidate (iii) gave 125 / 1 / 12 and 22 / 23 under
  rule c: equal on strums, extras and bars; the chord gain is the vote. The page's copy of the detector is IDENTICAL to the built one
  (slots, chords, onsets) on all three. At +-20 ms: strums 123-125, extras 1, bars 10, chords 22 / 23 (the vote calls 1 right chord
  wrong at each, as rule c does at one of them); at the clock 50 ms off: chords 20 / 23, the same 3 wrong under both rules.
  Section 20's today row for comparison: strums 101, extras 16, bars 5, chords 17 / 23.
- **The bench** (strum-check-loop.mjs, built code, 8 rounds a cell, 85 + 98 BPM):
```
quiet right        gated 0/8 rounds (count-in level 0.0015..0.0015) · through: bars passed 55/64 · strums 375/384 · extras 0/128
class right        gated 7/8 rounds (count-in level 0.0115..0.0220) · through: bars passed 8/8 · strums 48/48 · extras 0/16
room7 right        gated 8/8 rounds (count-in level 0.0318..0.1371) · through: bars passed 0/0 · strums 0/0 · extras 0/0
room4 right        gated 8/8 rounds (count-in level 0.1213..0.2518) · through: bars passed 0/0 · strums 0/0 · extras 0/0
quiet silent       gated 0/8 rounds (count-in level 0.0015..0.0015) · through: bars passed 0/64
class silent       gated 2/8 rounds (count-in level 0.0047..0.0345) · through: bars passed 0/48
room7 silent       gated 8/8 rounds (count-in level 0.0389..0.1015) · through: bars passed 0/0
room4 silent       gated 8/8 rounds (count-in level 0.0806..0.2601) · through: bars passed 0/0
quiet beats        gated 0/8 rounds (count-in level 0.0015..0.0015) · through: bars passed 0/64
class beats        gated 8/8 rounds (count-in level 0.0123..0.0266) · through: bars passed 0/0
room7 beats        gated 8/8 rounds (count-in level 0.0515..0.1173) · through: bars passed 0/0
room4 beats        gated 8/8 rounds (count-in level 0.0875..0.2261) · through: bars passed 0/0
quiet straight8    gated 0/8 rounds (count-in level 0.0014..0.0015) · through: bars passed 6/64
class straight8    gated 6/8 rounds (count-in level 0.0046..0.0410) · through: bars passed 1/16
room7 straight8    gated 8/8 rounds (count-in level 0.0495..0.1309) · through: bars passed 0/0
room4 straight8    gated 8/8 rounds (count-in level 0.0667..0.2333) · through: bars passed 0/0
quiet late100      gated 0/8 rounds (count-in level 0.0015..0.0015) · through: bars passed 51/64 · strums 88/94 · extras 0/128
class late100      gated 7/8 rounds (count-in level 0.0045..0.0352) · through: bars passed 7/8 · strums 6/6 · extras 0/15
room7 late100      gated 8/8 rounds (count-in level 0.0214..0.1355) · through: bars passed 0/0 · strums 0/0 · extras 0/0
room4 late100      gated 8/8 rounds (count-in level 0.1068..0.2300) · through: bars passed 0/0 · strums 0/0 · extras 0/0
quiet drag4        gated 0/8 rounds (count-in level 0.0015..0.0015) · through: bars passed 21/64 · strums 328/384 · extras 0/128
class drag4        gated 5/8 rounds (count-in level 0.0045..0.0353) · through: bars passed 10/24 · strums 126/144 · extras 0/48
room7 drag4        gated 8/8 rounds (count-in level 0.0350..0.1394) · through: bars passed 0/0 · strums 0/0 · extras 0/0
room4 drag4        gated 8/8 rounds (count-in level 0.1363..0.2688) · through: bars passed 0/0 · strums 0/0 · extras 0/0
quiet rush4        gated 0/8 rounds (count-in level 0.0015..0.0015) · through: bars passed 36/64 · strums 349/383 · extras 0/128
class rush4        gated 6/8 rounds (count-in level 0.0106..0.0247) · through: bars passed 5/16 · strums 82/95 · extras 0/32
room7 rush4        gated 8/8 rounds (count-in level 0.0361..0.1182) · through: bars passed 0/0 · strums 0/0 · extras 0/0
room4 rush4        gated 8/8 rounds (count-in level 0.1396..0.2307) · through: bars passed 0/0 · strums 0/0 · extras 0/0
talk silent        gated 2/8 rounds (count-in level 0.0023..0.1171) · through: bars passed 2/48
chatter silent     gated 8/8 rounds (count-in level 0.0308..0.0577) · through: bars passed 0/0
```
  Quiet: right 55 / 64 bars (today 36 / 64 in the step-B run), nothing played 0, beats 0, straight eighths 6 / 64. **Class: the
  gate stops most rounds** (right 7 of 8, beats 8 of 8): in a room with the neighbours' guitars a student will mostly see "too
  noisy". Room7 / room4 / chatter: every round stopped. Talk: 2 of 8 stopped, 2 / 48 bars passed in the rest.
- **Screenshots** 24-25 (EN + ES, 1366x657): a graded round mid-way and at its end (arrows coloured, the summary), and a too-noisy
  one (the page's mic fed band noise: count-in level 0.75-0.88; 0 cells coloured, the one line, "Rounds done: 1 of 2"). The row
  stays 32 px in all.
- **Pins**: 1eh (ratios through scHearStrum and Strum Radar's control; the loop on scHearStrum; a player 0.8 of an eighth late kept on
  his own 18 slots, with and without the click; the anchor's four constants; the gate's constants, which frames it keeps, quiet with
  loud clicks / noisy / a loud first 250 ms / just under the line; a gated round colours nothing, ends on the one line, still counts;
  the take's fields; 11 chord cases, two from the takes). Break-it, each red, control green:
```
ratios back to 1.2 / 1.46 -> RED: [31m✗[0m 1eh (strum-pattern check): the check's ratios are 1.2 / 1.3, want 1.15 / 1.3
the loop back on Strum Radar's detector -> RED: [31m✗[0m 1eh (strum-pattern check): scLoop no longer listens through the check's own scHearStrum
the anchor never moves the grid -> RED: [31m✗[0m 1eh (strum-pattern check): a player 0.8 of an eighth late, no click: 18 of 18 strums judged in another slot, 2 of bar 3's in rests (grid 0 ms; want 0 and 0: the grid follows his pattern)
a rest scores like a strum place -> RED: [31m✗[0m 1eh (strum-pattern check): a player 0.8 of an eighth late, no click: 18 of 18 strums judged in another slot, 2 of bar 3's in rests (grid 36 ms; want 0 and 0: the grid follows his pattern)
the anchor step changed -> RED: [31m✗[0m 1eh (strum-pattern check): SC_ANCHOR_STEP is 10, want 5
the gate keeps the count-in clicks -> GREEN exit 0
the gate keeps the first frames -> GREEN exit 0
a too-noisy round still colours -> RED: [31m✗[0m 1eh (strum-pattern check): a too-noisy round coloured 1 of 64 cells (want none: no green, no red, no chord mark)
a too-noisy round does not count -> RED: [31m✗[0m 1eh (strum-pattern check): a too-noisy full round did not count toward the step's two rounds (writes: none)
the gate level changed -> RED: [31m✗[0m 1eh (strum-pattern check): SC_GATE_LEVEL is 0.02, want 0.012
the octave vote not shown (rule c) -> RED: [31m✗[0m 1eh (strum-pattern check): C5 -> C5: the verdict shown is "unheard", want "wrong" (rule oc: the octave vote when it decides, else rule c)
the vote without the octave under -> RED: [31m✗[0m 1eh (strum-pattern check): C5 -> G5 with readings [43,55,43,55]: rules a / b / c / octave ok / unheard / ok / ok, want ok / unheard / ok / unheard
the take without its beat fields -> RED: [31m✗[0m 1eh (strum-pattern check): the take's beat / gate fields are metroOn=missing,headphones=missing,clicks=missing,tooLoud=boolean,gateLevel=object,gateThreshold=number,anchorRange=number,octTo
control -> ['PROBLEMS 0']
```
  (plus: the gate keeping its first frames, red once the test frame moved past the first click's window.) smoke.mjs: after its real
  round the gate's verdict and the board agree (run verbatim in a headless page: 0 fails, 20 s). Full checks passed.

### Most likely to break
1. **The gate on a real Chromebook.** The threshold rests on bench rooms fitted to real Chromebook classroom takes and on three
   MacBook takes in a quiet room. A Chromebook whose own mic hiss is louder, or a fan, could sit near 0.012 in a quiet corner and say
   "too noisy" all the time. First real Chromebook takes: read `gateLevel` in them.
2. **A student who strums during the count-in** raises the count-in level and gets "too noisy" (the round still counts; nothing is
   coloured). Not measured.
3. **The anchor in noise the gate lets through** (class rounds just under 0.012, talk): it can fit room sounds to the pattern
   (section 22: nothing played passed bars in noisy rooms without the gate; with it, talk 2 / 48).
4. **The anchor on a steady player who starts a whole eighth late** (from bar 1): his pattern is followed and passes; with a
   headphone click he is then off the click and still passes. A product call, stated not hidden.
5. **The octave vote's sub-octave rule**: C5's G an octave down is 43, G5's root, so G5 read only as its root ties with C5 and rule c
   decides (take 2 bar 5). A detector that reads more sub-octaves would tie more often; one that reads a fifth as a root would vote
   wrong. On the takes it called 1 right chord wrong at +-20 ms clocks, about rule c's rate.
6. **Clicks through a speaker** (no headphones): the count-in clicks are left out of the gate's level, but if the speaker-to-mic
   delay passes 150 ms the clicks fall outside their windows and raise the level (Jonathan's MacBook: 52-121 ms).

### The gate measurement (count-in onsets and levels per room, both ratio pairs)
```
COUNT-IN GATE at 1.1 / 1.2: onsets heard in the count-in per round (min / median / max), rounds with >= 1, 2, 3, 4 onsets, median frame level
  quiet silent           12 rounds · onsets 0 / 0 / 0 · >=1 0 >=2 0 >=3 0 >=4 0 · level median 0.0015 (0.0015..0.0015) · frames 111
  quiet right            12 rounds · onsets 0 / 0 / 0 · >=1 0 >=2 0 >=3 0 >=4 0 · level median 0.0015 (0.0015..0.0015) · frames 111
  class silent           12 rounds · onsets 0 / 3 / 5 · >=1 11 >=2 11 >=3 7 >=4 4 · level median 0.0173 (0.0051..0.0373) · frames 111
  class right            12 rounds · onsets 2 / 4 / 6 · >=1 12 >=2 12 >=3 8 >=4 6 · level median 0.0174 (0.0051..0.0252) · frames 111
  room7 silent           12 rounds · onsets 5 / 8 / 9 · >=1 12 >=2 12 >=3 12 >=4 12 · level median 0.1046 (0.0609..0.1232) · frames 111
  room7 right            12 rounds · onsets 6 / 8 / 10 · >=1 12 >=2 12 >=3 12 >=4 12 · level median 0.0825 (0.0455..0.1170) · frames 111
  room4 silent           12 rounds · onsets 5 / 7 / 9 · >=1 12 >=2 12 >=3 12 >=4 12 · level median 0.1924 (0.1169..0.2790) · frames 111
  room4 right            12 rounds · onsets 5 / 8 / 10 · >=1 12 >=2 12 >=3 12 >=4 12 · level median 0.1796 (0.0941..0.3050) · frames 111
  talk silent            12 rounds · onsets 3 / 6 / 9 · >=1 12 >=2 12 >=3 12 >=4 11 · level median 0.0026 (0.0024..0.0776) · frames 111
  chatter silent         12 rounds · onsets 5 / 8 / 11 · >=1 12 >=2 12 >=3 12 >=4 12 · level median 0.0463 (0.0221..0.0629) · frames 111
  take J01 right          1 rounds · onsets 1 / 1 / 1 · >=1 1 >=2 0 >=3 0 >=4 0 · level median 0.0019 (0.0019..0.0019) · frames 109
  take J02 right          1 rounds · onsets 4 / 4 / 4 · >=1 1 >=2 1 >=3 1 >=4 1 · level median 0.0033 (0.0033..0.0033) · frames 88
  take J03 right          1 rounds · onsets 1 / 1 / 1 · >=1 1 >=2 0 >=3 0 >=4 0 · level median 0.0031 (0.0031..0.0031) · frames 88

COUNT-IN GATE at 1.2 / 1.46: onsets heard in the count-in per round (min / median / max), rounds with >= 1, 2, 3, 4 onsets, median frame level
  quiet silent           12 rounds · onsets 0 / 0 / 0 · >=1 0 >=2 0 >=3 0 >=4 0 · level median 0.0015 (0.0015..0.0015) · frames 111
  quiet right            12 rounds · onsets 0 / 0 / 0 · >=1 0 >=2 0 >=3 0 >=4 0 · level median 0.0015 (0.0015..0.0015) · frames 111
  class silent           12 rounds · onsets 0 / 3 / 4 · >=1 11 >=2 9 >=3 6 >=4 2 · level median 0.0173 (0.0051..0.0373) · frames 111
  class right            12 rounds · onsets 1 / 3 / 4 · >=1 12 >=2 9 >=3 7 >=4 4 · level median 0.0174 (0.0051..0.0252) · frames 111
  room7 silent           12 rounds · onsets 4 / 7 / 8 · >=1 12 >=2 12 >=3 12 >=4 12 · level median 0.1046 (0.0609..0.1232) · frames 111
  room7 right            12 rounds · onsets 5 / 7 / 9 · >=1 12 >=2 12 >=3 12 >=4 12 · level median 0.0825 (0.0455..0.1170) · frames 111
  room4 silent           12 rounds · onsets 3 / 6 / 8 · >=1 12 >=2 12 >=3 12 >=4 11 · level median 0.1924 (0.1169..0.2790) · frames 111
  room4 right            12 rounds · onsets 3 / 6 / 9 · >=1 12 >=2 12 >=3 12 >=4 11 · level median 0.1796 (0.0941..0.3050) · frames 111
  talk silent            12 rounds · onsets 3 / 6 / 9 · >=1 12 >=2 12 >=3 12 >=4 10 · level median 0.0026 (0.0024..0.0776) · frames 111
  chatter silent         12 rounds · onsets 4 / 7 / 11 · >=1 12 >=2 12 >=3 12 >=4 12 · level median 0.0463 (0.0221..0.0629) · frames 111
  take J01 right          1 rounds · onsets 1 / 1 / 1 · >=1 1 >=2 0 >=3 0 >=4 0 · level median 0.0019 (0.0019..0.0019) · frames 109
  take J02 right          1 rounds · onsets 4 / 4 / 4 · >=1 1 >=2 1 >=3 1 >=4 1 · level median 0.0033 (0.0033..0.0033) · frames 88
  take J03 right          1 rounds · onsets 1 / 1 / 1 · >=1 1 >=2 0 >=3 0 >=4 0 · level median 0.0031 (0.0031..0.0031) · frames 88
```


## 24. Review round 1 of 5fbd3a5 (3 MAJOR, 6 MINOR): fixes, 2a8ff59

Each item re-derived on the real code (the reviewer's file: scratchpad `rev-strum-5fbd3a5/REVIEW.md`; its harness `exp/anchor.mjs` is
used for the late-start table, run on the pinned copy for "before" and on the worktree for "after").

| item | fixed | one number |
|---|---|---|
| R1-1 MAJOR late start / re-entry | yes | +1.05..+3 eighths late: 63-69 of 80 bars (were 1-56); early -1: 65-67 (37-38); re-entry 51-58 of 70 (30-56) |
| R1-2 MAJOR beat aids lost in round 2 | yes | the choice sticks on the open check (sc.metroSticky); the switch stays shown |
| R1-3 MAJOR gate fires on a strummed count-in | yes | J01 strummed on counts 3-4: not gated (was); room7 / room4 / chatter 12 of 12 gated (as before) |
| R1-4 "still counts" after a Stop | yes | two end lines, counted / stopped, EN + ES |
| R1-5 vote margin | yes | margin 2; J02 bar 1 now rule c's ok; G5-for-C5 caught at the kept clock, not at +-20 ms (below) |
| R1-6 creep | yes | a perfect player's grid ends 0.0 ms off (98.8 / -53.9 ms at 85 / 98 BPM before) |
| R1-7 drifter at the window edge | NOT cured | drag 4%, 25 ms jitter: 25 of 80 at 85 and 98, as before |
| headphones per page | yes | in memory, unticked each load; no storage key left (1eh scans for any) |
| CHANGELOG | yes | the shipped entry restored byte for byte; this change in its own top entry |
| scStart twice | yes | a double start runs once (1eh) |
| chord name under the highlight | yes | screenshots 26-chord-names-readable-en / -es |

### R1-1, the late-start table (reviewer's harness; no jitter: bars of 8; 25 ms jitter x 10 seeds: bars of 80)
Before (5fbd3a5):
```
85 BPM | on time: 8/8, jitter 80/80 | +0.5: 8/8, jitter 77/80 | +1.0: 7/8, jitter 70/80 | +1.05: 0/8, jitter 56/80 | +1.5: 0/8, jitter 1/80 | +2 (one beat late): 0/8, jitter 1/80 | +3: 0/8, jitter 1/80 | -1.0 (early): 0/8, jitter 37/80 | re-entry +1.1: 56/70 | re-entry +1.5: 32/70 | re-entry +2: 30/70 | perfect player's grid ends 98.8 ms off | drag 4% jitter 25: 26/80
98 BPM | on time: 8/8, jitter 80/80 | +0.5: 8/8, jitter 75/80 | +1.0: 7/8, jitter 69/80 | +1.05: 0/8, jitter 55/80 | +1.5: 0/8, jitter 1/80 | +2 (one beat late): 0/8, jitter 1/80 | +3: 0/8, jitter 1/80 | -1.0 (early): 0/8, jitter 38/80 | re-entry +1.1: 37/70 | re-entry +1.5: 34/70 | re-entry +2: 30/70 | perfect player's grid ends -53.9 ms off | drag 4% jitter 25: 25/80
```
After (2a8ff59):
```
85 BPM | on time: 8/8, jitter 80/80 | +0.5: 8/8, jitter 77/80 | +1.0: 7/8, jitter 70/80 | +1.05: 6/8, jitter 69/80 | +1.5: 6/8, jitter 65/80 | +2 (one beat late): 6/8, jitter 65/80 | +3: 6/8, jitter 63/80 | -1.0 (early): 7/8, jitter 67/80 | re-entry +1.1: 58/70 | re-entry +1.5: 53/70 | re-entry +2: 53/70 | perfect player's grid ends 0.0 ms off | drag 4% jitter 25: 25/80
98 BPM | on time: 8/8, jitter 80/80 | +0.5: 8/8, jitter 76/80 | +1.0: 7/8, jitter 69/80 | +1.05: 6/8, jitter 69/80 | +1.5: 6/8, jitter 65/80 | +2 (one beat late): 6/8, jitter 65/80 | +3: 6/8, jitter 64/80 | -1.0 (early): 7/8, jitter 65/80 | re-entry +1.1: 55/70 | re-entry +1.5: 54/70 | re-entry +2: 47/70 | perfect player's grid ends 0.0 ms off | drag 4% jitter 25: 25/80
```
(After was re-run on the final code: identical lines.) How: when a full bar (6 onsets: D.DU.UDU shifted by 1 to 7 eighths never puts all
six on strum places, so six fit one grid only; five can fit two, and did: a one-beat-late player was locked a bar early) scores under
its count less 1.5, a second search over 4 eighths. Its result is kept only on a near-perfect, regular fit: score >= count - 1 and
the strums on average within 0.15 of an eighth of their windows' middles (talking that lands in six windows is irregular). Ties in
the wide search go to the more centred grid; no grid is ever more than 4 eighths from the click grid. The chord on each 1 follows
the same grid (scOnset reads the slot from it). Trades measured on the way: without the regularity rule, talk passed 3 bars of 64
(1 with the wide search off); a perfect-fit-only rule did not help (3); the regularity rule: 1.

### The hard condition: noisy rooms (strum-check-loop.mjs, 4 seeds, 85 + 98 BPM; "raw" = every round's bars, "through" = rounds the gate lets through)
```
quiet right       before: 55/64 raw, gated 0/8, through 55/64 | final: 55/64 raw, gated 0/8, through 55/64
class right       before: 55/64 raw, gated 7/8, through 8/8 | final: 54/64 raw, gated 7/8, through 7/8
room7 right       before: 21/64 raw, gated 8/8, through 0/0 | final: 20/64 raw, gated 8/8, through 0/0
room4 right       before: 9/64 raw, gated 8/8, through 0/0 | final: 8/64 raw, gated 8/8, through 0/0
quiet silent      before: 0/64 raw, gated 0/8, through 0/64 | final: 0/64 raw, gated 0/8, through 0/64
class silent      before: 0/64 raw, gated 2/8, through 0/48 | final: 0/64 raw, gated 2/8, through 0/48
room7 silent      before: 5/64 raw, gated 8/8, through 0/0 | final: 5/64 raw, gated 8/8, through 0/0
room4 silent      before: 10/64 raw, gated 8/8, through 0/0 | final: 8/64 raw, gated 8/8, through 0/0
quiet beats       before: 0/64 raw, gated 0/8, through 0/64 | final: 0/64 raw, gated 0/8, through 0/64
class beats       before: 0/64 raw, gated 8/8, through 0/0 | final: 0/64 raw, gated 8/8, through 0/0
room7 beats       before: 7/64 raw, gated 8/8, through 0/0 | final: 6/64 raw, gated 8/8, through 0/0
room4 beats       before: 5/64 raw, gated 8/8, through 0/0 | final: 8/64 raw, gated 8/8, through 0/0
quiet straight8   before: 6/64 raw, gated 0/8, through 6/64 | final: 7/64 raw, gated 0/8, through 7/64
class straight8   before: 7/64 raw, gated 6/8, through 1/16 | final: 9/64 raw, gated 6/8, through 0/16
room7 straight8   before: 15/64 raw, gated 8/8, through 0/0 | final: 13/64 raw, gated 8/8, through 0/0
room4 straight8   before: 11/64 raw, gated 8/8, through 0/0 | final: 11/64 raw, gated 8/8, through 0/0
talk silent       before: 2/64 raw, gated 2/8, through 2/48 | final: 1/64 raw, gated 1/8, through 1/56
chatter silent    before: 7/64 raw, gated 8/8, through 0/0 | final: 7/64 raw, gated 8/8, through 0/0
```
Nothing played / talk-only, room7 5 -> 5, room4 10 -> 8, talk 2 -> 1, chatter 7 -> 7; straight eighths room7 15 -> 13, room4 11 -> 11:
none more. Quiet: right 55 / 64 both, nothing 0, beats 0, straight eighths 6 -> 7 (one bar more, quiet room, not in the condition).

### R1-3, the gate (strum-check-replay --gate; 12 rounds a room and student; Jonathan's takes and J01 with its own strum pasted into the count-in, the reviewer's variants)
```
quiet silent         gated before (median) 0/12 · now (median and floor) 0/12
quiet right          gated before (median) 0/12 · now (median and floor) 0/12
class silent         gated before (median) 9/12 · now (median and floor) 9/12
class right          gated before (median) 7/12 · now (median and floor) 7/12
room7 silent         gated before (median) 12/12 · now (median and floor) 12/12
room7 right          gated before (median) 12/12 · now (median and floor) 12/12
room4 silent         gated before (median) 12/12 · now (median and floor) 12/12
room4 right          gated before (median) 12/12 · now (median and floor) 12/12
talk silent          gated before (median) 5/12 · now (median and floor) 0/12
chatter silent       gated before (median) 12/12 · now (median and floor) 12/12
take J01 right       gated before (median) 0/1 · now (median and floor) 0/1
take J02 right       gated before (median) 0/1 · now (median and floor) 0/1
take J03 right       gated before (median) 0/1 · now (median and floor) 0/1
take J01c1 right     gated before (median) 0/1 · now (median and floor) 0/1
take J01c3 right     gated before (median) 0/1 · now (median and floor) 0/1
take J01c34 right    gated before (median) 1/1 · now (median and floor) 0/1
take J01c1234 right  gated before (median) 1/1 · now (median and floor) 1/1
```
The 20th percentile ALONE failed the "loud rooms as before" rule (talking is bursty: chatter 6 of 12 gated at 0.012, room7 8-11 of
12), and so did the quietest beat's median (chatter 6, room7 10). The rule built: median >= 0.012 (as before) AND 20th percentile
>= 0.003 (the count-in's quiet part is loud too). Talk is no longer gated (its quiet part is quiet: 0.0022-0.0024); its rounds are
graded, and the anchor's regularity rule keeps talk-only at 1 of 64 bars. A count-in strummed on all four counts is still gated
(nothing quiet is left to measure). Measures side by side: `r1/gate-measures.txt`.

### Jonathan's three takes, final code (the copy of the detector IDENTICAL to the real one on all 3, at all 3 clocks)
```
identical copies: 3
J01:-119.9,J02:-75.1,J03:-102.9 strums 127/138 extras 1/46 bars 13/24 right chords called right 22/23 G5-for-C5 caught 1/1
identical copies: 3
J01:-139.9,J02:-95.1,J03:-122.9 strums 125/138 extras 1/46 bars 10/24 right chords called right 22/23 G5-for-C5 caught 0/1
identical copies: 3
J01:-99.9,J02:-55.1,J03:-82.9 strums 123/138 extras 1/46 bars 9/24 right chords called right 23/23 G5-for-C5 caught 0/1
```
At the kept clock: strums 127 / 138 (5fbd3a5: 125), extras 1 / 46 (1), bars 13 / 24 (12), right chords 22 / 23 (23), G5-for-C5 caught.
The margin's cost: J01 bar 7 (a right D5 whose A reads 56.3 rising to 59.3; rule c says wrong) was saved by the vote before and is
rule c's now; and the G5-for-C5 bar is caught at the kept clock only (at -20 / +20 ms its readings give G5 a margin of 1). J02 bar 1
(the vote's false wrong, 9 to 8) is rule c's ok now. A product call for Jonathan if he wants the vote back to margin 1.

### Break-its (1eh, each red, control green)
```
item 1: no wide search -> RED: ✗ 1eh (strum-pattern check): a steady player one beat late: 6 of his 6 last-bar strums judged in another slot, 1 in rests (grid -195 ms; want 0 and 0: the wide search follows his beat)
item 1: the wide search without the half-bar limit -> RED: ✗ 1eh (strum-pattern check): a full bar one beat late, the grid at -3 eighths: the wide search picked -6 eighths, want within 4 of the click grid (-6 fits too, and would put every chord a bar
item 1: the wide result kept on any fit -> RED: ✗ 1eh (strum-pattern check): an irregular bar (its strums 0.3 of an eighth off-centre) moved the grid 2.31 eighths, want within 1 (the wide search keeps only a regular fit)
item 2: the Metronome not kept on the open check -> RED: ✗ 1eh (strum-pattern check): scStart no longer takes the round's beat from scMetroWanted() and keeps it on the open check
item 3: the gate without its quiet-part floor -> RED: ✗ 1eh (strum-pattern check): a quiet room with the student strumming from count 3 of the count-in: too noisy (level 0.3); want not: the room must also be loud in the count-in's quiet part (it
item 4: a Stopped too-noisy round says it counted -> RED: ✗ 1eh (strum-pattern check): a too-noisy round Stopped in bar 3 does not say only "Too noisy to check." (it does not count):  Too noisy to check. This round counted.   
item 5: the vote without its margin -> RED: ✗ 1eh (strum-pattern check): SC_OCT_MARGIN is 1, want 2
item 9: no start guard -> RED: ✗ 1eh (strum-pattern check): two clicks on the button while the first start waits: the round started 2 times, want 1
control -> ['PROBLEMS 0']
```
### Final runs
strum-check-loop (default): 150 takes, 1,200 bars, every key checked, nothing written to progress. tone-test: pass (369 / 369 coach
tones, as pinned). checks --check --skip-links: only "shell cache stale" (sw.js not rewritten: the lead's full run does it).
coach-core.js untouched (2,529 lines); coach-strumcheck.js 856.

## 25. Review round 2 of 65c30c4 (1 MAJOR, 6 MINOR): words, comments, two pins, 7706c96

No listening change (scGateDecide, scAnchor, the chord vote untouched; the coach-strumcheck.js diff is comments only). R2-2 and R2-4 not fixed, by decision.

**R2-1 (accepted behaviour, words made true).** The brief's wording did not fit. Measured in the real strip at 1366x657 (px left between the line's end and the strip's right edge; second number = with the headphones switch drawn, i.e. the Metronome was on):

| wording | room | with switch |
|---|---|---|
| EN "Too noisy to check. Don't play during the 4 clicks. This round counted." | 54 | -123 |
| ES "Hay demasiado ruido para revisar. No toques durante los 4 clics. Esta ronda contó." | **-85 (cut after "Esta")** | -209 |
| ES "Demasiado ruido para revisar. No toques en los 4 clics. Esta ronda contó." | -20 | -144 |
| EN **"Too noisy. Don't play on the 4 clicks. This round counted."** (shipped) | 147 | -29 |
| ES **"Demasiado ruido. No toques en los 4 clics. Esta ronda contó."** (shipped) | 62 | -62 |
| EN **"Too noisy. Don't play on the 4 clicks."** (stopped, shipped) | 286 | 109 |
| ES **"Demasiado ruido. No toques en los 4 clics."** (stopped, shipped) | 184 | 60 |
| shortest 3-fact ES tried, "Mucho ruido. No toques en los 4 clics. Ronda contada." | 105 | -19 |

- "to check" dropped from the end lines to fit; the live line during the round still says "Too noisy to check right now."
- Open for the lead: with the Metronome on, the completed line pushes the headphones switch past the strip's right edge (overflow hidden, so the switch is cut off, in both languages). No three-fact Spanish wording I tried fits beside it (best -19 px). Wording alone cannot fix it; the stopped lines fit beside it.
- Screenshots of the real too-noisy completed round end (in-page noise, gate fired, 0 cells coloured, "Rounds done: 1 of 2"): `r2-too-noisy-round-end-en.png`, `r2-too-noisy-round-end-es.png` in this folder. Both read on one line. The "Save this take" link beside them is localhost + dev sign-in only (micRecLocal), never seen by students.
- CHANGELOG: quotes the new end line; the false sentence replaced by "If you play during the four clicks, it may not be able to check that round either; the round still counts." (the shipped entry from origin/main untouched).
- Comment above scGateDecide: all four clicks 0.2475 / 0.2298, one strum on count 1 left ringing 0.1513 / 0.1026 (median / p20), accepted, the end line says so; counts 3+4, 2-4, count 3 ringing do not fire it.

**R2-3.** Half-bar-limit comment now says: up to half a bar late or early stays on the right bars; more than half a bar late (4.5 to 7 eighths, 10 of 10 seeds at 60/85/120) is judged one bar on, every chord compared with the next bar's; exactly 2 beats early lands a bar off the other way in 4-5 of 10.

**R2-5 and R2-6, two new 1eh pins (pins 12 -> 13 counted; the double-start block was extended, the beat block is new).**
- R2-5: after the first start's promise resolves, one more scStart must start a round (count 1 -> 2).
  Planted `await scStartRun();` without the try/finally:
  `✗ 1eh (strum-pattern check): after the first start was over, a new click started 0 rounds, want 1 (the start guard was never let go: round 2 could never start)`
- R2-6: the REAL scStartRun with metroRunning true (stubs: mic, count-in, loop, recorder; stopAllDemoAudio stub turns the tool off as the real one does), then the real scFinish(true), metroRunning false: scMetroWanted() true and `id="sc-hp"` drawn in #coach-body. A guard rejects a vacuous run (round 1 must start in 'countin' with sc.metro true).
  Planted `s.metroSticky = false;` in scFinish:
  `✗ 1eh (strum-pattern check): after a full round with the Metronome on (the tool stopped by the start): the check wants the beat false, draws the headphones switch false (want both: round 2 keeps the beat)`
- Control (no plant): 1eh PROBLEMS 0.

**Wording pins.** 1eh and the smoke read the end lines through t('sc.tooLoudCounted') / t('sc.tooLoudStopped'), no literal; nothing to re-pin. 1dp: no English-only change (both twins changed).

**strum-check-loop: skipped,** judged unnecessary: only strings and comments changed; no listening code.

**checks.** One `node tools/checks.mjs --check --skip-links` on the tree: 1 problem = "shell cache stale" (expected, sw.js left for the full run), 1 warning (1bb soft rule, pre-existing); 1eh green, 1dp green, 1dw 15 commits all Fast. 1cv soft: coach-core.js 2529 (untouched).

## 26. The headphones switch is never cut off (layout, on 7706c96)

styles.css only, scoped to the strum check's strip: `.sc-strip .sc-body:has(> .sc-hp){flex-wrap:wrap;row-gap:4px}` and `.sc-strip .sc-body > .sc-hp{white-space:nowrap}`; the strip's header comment names the exception. The body wraps only while it holds the switch (never during a round), so every other state, and every other game's strip, is unchanged. No new vh/vw.

Shots (`r3-headphones/` in this folder, `measure.log` beside them): headless Chrome for Testing, 1366x657, the Metronome tool really running (startMetro), the dev-only "Save this take" links switched off so the shots show the student's view. Each shot: the switch's box against the strip's, then a real click at the checkbox's middle (elementFromPoint hits the box, the choice toggles, put back).

| shot | EN right margin (px) | ES right margin (px) | switch on its own line | row (top-bottom) |
|---|---|---|---|---|
| ready (mic refused: the reason + switch) | 364 | 356 | yes | 427-473 |
| graded round end | 118 | 63 | no (fits beside) | 427-459 (as before) |
| too noisy, stopped | 109 | 60 | no (fits beside) | 427-459 (as before) |
| too noisy, completed | 364 | 356 | yes | 427-473 |

- All 8: switch whole inside the strip (bottom margin 0-1 px), click toggles it, board and button in view, page not scrolled; Mark complete still on screen (its bottom about 584 of 657).
- 2560x1300 (completed too-noisy, EN): switch on its own line, right margin 368, whole, clicks.
- The extra line costs 14 px of row height, only in the states where the switch wraps.
- Before this change the ready state with a reason kept the switch beside a shorter, more cut reason; now the reason gets the whole first line.

## 27. Review round 3 of 45165b2 (4 MINOR fixed; R3-1 wording left for Jonathan)

sc.tooLoud* strings and the CHANGELOG quote untouched (R3-1 is with Jonathan).

**R3-2, no code fix needed.** The real code never clears `sc.metroSticky`: it is written once, at Start (`sc.metroSticky = sc.metro`, and `sc.metro = scMetroWanted()` includes the flag), and scButton's Stop and scInterrupt do not touch it. The pin now runs the real scStartRun three ways (round 1 played to the end, Stop through the real scButton during the count-in, a hidden tab through the real scInterrupt), with the tool off afterwards, and checks scMetroWanted(), the drawn `id="sc-hp"` and that round 2 starts with `sc.metro` true. Green on the real code. Reviewer's plants (plant.mjs):
- stickyResetOnStop: `✗ 1eh (strum-pattern check): after a round stopped during the count-in with the Metronome on (the tool stopped by the start): the check wants the beat false, draws the headphones switch false, round 2 starts with the beat false (want all three: every later round keeps the beat)`
- stickyResetIncomplete: the same line (stopped during the count-in).
- stickyResetInterrupt: `✗ 1eh (strum-pattern check): after a round cut short by a hidden tab with the Metronome on (...): the check wants the beat false, draws the headphones switch false, round 2 starts with the beat false (...)`
- stickyResetFinish (older): red on "a full round" and "stopped" (2 lines).

**R3-3.** The start-guard pin adds a stub scStartRun that throws, then one more scStart:
- guardOnlyOnSuccess: `✗ 1eh (strum-pattern check): after a start that threw, a new click started 0 rounds, want 1 (the start guard is let go only on success: one error leaves the button dead)`
- guardNever (older): red twice (never let go; after a throw).

**R3-4.** :122 now "up to half a bar late, and less than half a bar early, on the right bars"; :506 "and a round played to the end still counts".

**R3-5.** styles.css: `.sc-summary` and `.sc-note` in the strip now wrap (`flex:0 1 auto; min-width:0; white-space:normal`) instead of being cut; `.sc-local` (dev only) keeps its ellipsis; `.sc-summary` line-height 1.3; the strip's header comment updated. One wording change: the Spanish `tools.micDenied` (shared by every mic feature) took 3 rows and is now "Acceso al micrófono denegado. Haz clic en el candado a la izquierda de la barra de direcciones, pon Micrófono en Permitir y recarga." (2 rows; same steps; dropped "ícono de", "el", "luego ... la página"). English unchanged.

Measured in the real page at 1366x657, the lines drawn with the code's own templates (scRenderReport's line, scRenderReady, scRenderListening): 14 lines (all good, some bars, one bar, no bars, nothing heard, too noisy counted / stopped, mic denied / ask again / failed / unavailable, backgrounded, tuner took, the live too-noisy line) x EN/ES x Metronome on/off = 56 cases (`r4-lines/measure.log`).
- 0 of 56 cut, 0 take 3 rows, the switch whole in every case where it is drawn, board and button in view and the page unscrolled in 56 of 56.
- Tallest strip 63 px (2-row reason + switch: EN mic denied / unavailable / backgrounded, ES mic denied / unavailable / backgrounded / tuner took); Mark complete's bottom at most 602 of 657.
- Before the Spanish change: ES mic denied took 3 rows, strip 81 px (Mark complete 619).
- Two worst shots looked at: `r4-lines/es-micDenied-metro.png`, `r4-lines/es-allGood-metro.png` (the all-good line now wraps "acorde ✓." to row 2 instead of losing it).

## 28. Jonathan's words: "Too noisy for feedback" (2026-11-15)

Strings (i18n.js; "comentarios" is the Start button's own word, sc.play):
- sc.tooLoudCounted: EN "Too noisy for feedback. This round counted." / ES "Demasiado ruido para recibir comentarios. Esta ronda contó."
- sc.tooLoudStopped: EN "Too noisy for feedback." / ES "Demasiado ruido para recibir comentarios."
- sc.tooLoud (during the round): EN "Too noisy for feedback right now. Keep playing: this round still counts." / ES "Demasiado ruido para recibir comentarios ahora. Sigue tocando: esta ronda cuenta igual."

"Don't play on the 4 clicks" removed everywhere: the strings, the CHANGELOG entry (quotes the new end line; keeps "If you play during the four clicks, it may not give feedback on that round either; the round still counts."), the comment above scGateDecide (now: the end line says "Too noisy for feedback", Jonathan's words), and the "TOO NOISY TO CHECK" / "too noisy to check" names in coach-strumcheck.js (6) and the 1eh comment (1). No pin quotes the text (1eh and the smoke read it through t()).

Stale-hit grep ("4 clicks", "4 clics", "to check", "para revisar", "don't play", "no toques en"), case-insensitive: coach-strumcheck.js 0, sc.* strings 0, the 1eh block 0, the CHANGELOG entry 0, the smoke's strum lines 0. The one other hit, in tools/mic-sim/strum-check-loop.mjs:284 ("the count-in's 4 clicks"), describes the count-in and is not the old wording.

Measured (12 cases: the three lines x EN/ES x Metronome on/off, 1366x657, `r5-feedback/measure.log`): 0 cut, the switch whole in all 6 where drawn, board and button on screen, Mark complete bottom at most 581. Rows: the end lines take 1 row (ES completed wraps the switch under it, strip 42 px); the live line takes 2 rows in ES (and in EN beside the beat dot), strip 39 px. Shot looked at: `r5-feedback/es-xCounted-metro.png`.
