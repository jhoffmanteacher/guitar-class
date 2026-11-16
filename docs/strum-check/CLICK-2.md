# The Metronome's click through a laptop speaker, second try (measure only; 2026-11-14)

> **Copied into the repo 2026-11-16** from the Mac's untracked `Claude outputs/strum-coach/CLICK-2.md`, unchanged below this
> note, for the Windows session. See `DETAILS.md` beside it.

Jonathan: "take another try at subtracting metronome from recording". The question was whether the strum-pattern check (ca-52,
D.DU.UDU) can hear the click through the speaker and still grade the strums. No site file changed. One tool was added on branch
`measure/click-cancel`: `tools/mic-sim/click-probe.mjs`, which measures a real take. The harness lives in the session scratchpad
`click2/` (`lib.mjs`, `bench.mjs`, `takes.mjs`, `plans.json`, `table.mjs`, every raw `.json`). The full tables are at the end of this
file.

## Verdict

**Not all five goals, but close, with one candidate: E, the click subtracted in the detector's energy domain, using TODAY's 660 Hz
click (k = 3, J = 4 ms, no template refresh).** With nothing played it hears 0 beat slots in every condition but one: the frame
timing ±10 ms row. In the combined worst case it heard 0 of 384 on the beats, and 0 to 9 of 768 off the beats, whenever the frame
timing was within ±3 ms. Its costs:
- 2 of 144 strums at 85 BPM at the default level (on-beat strums 66 of 72 against 68 with no click), and 6 of 144 at a click level
  of 0.35;
- 3 to 6 false extras in 192 rests at click levels of 0.2 to 0.35 at the mic (0 with no click);
- 1 of 138 strums on Jonathan's own three takes.

Three things break it:
1. **How precisely the page knows when each window of sound reached the mic.** At ±10 ms per frame it hears 7 to 18 of 96 beat
   slots with nothing played. At ±3 ms it hears 0. A page build would have to time E from the audio clock, not from
   `performance.now()`. Nobody has measured how large that error really is.
2. **A strum during the count-in.** It spoils the template a little: 0 to 9 off-beat slots heard of 768.
3. **A loud click (0.2 to 0.35).** Its leftovers make the few false extras.

Everything else failed outright:
- **A' (a designed click plus a notch or band-stop):** the filters cost 4% of strums in the bench, and the click alone is still
  heard with a non-linear speaker or at 0.35.
- **C' (waveform subtraction that tolerates timing):** it fails on click-to-click variation (75 of 96 heard) and on a strum during
  the count-in (96 of 96). On the real takes it changed the grade itself: J03 went from 13 extras to 0.
- **B (ring confirmation):** it still heard 89 of 96 beat slots with nothing played, missed 1 or 2 of the 3 extras on "3", and lost
  9 to 19 of 72 on-beat strums.

**Headphones-only stays the right default until real speaker takes exist.** E is the one worth building, as a guarded experiment.

## New real evidence: J01-J03's count-in clicks (`click-probe.mjs`, 9 clicks at 660 Hz, MacBook Air speaker into its own mic, Chrome)

These are the only real clicks through a real speaker that exist. Every count-in click is in Jonathan's three takes.

| | J01 (85) | J02 (98) | J03 (98) |
|---|---|---|---|
| arrival jitter about the schedule, rms / largest (µs) | 1.8 / 2.5 | 3.0 / 4.1 | 1.2 / 1.6 |
| clock-rate difference (ppm) | 2.7 | 5.7 | 1.9 |
| delay from the saved schedule to the click (ms) | 173 | 188 | 186 |
| click peak at the mic (raw), click to click | 0.078-0.088 | 0.026-0.029 | 0.327-0.349 |
| level test on a click alone (× the room; the check fires at 1.2) | 14-23 | 6-12 | 38-124 |
| 2nd / 3rd harmonic (dB under the fundamental) | -27..-31 / -29..-34 | -15..-21 / -20..-22 | -20..-30 / -21..-37 |
| C: waveform left after perfect alignment and gain, first 80 ms (dB) | -16, -20, (at the room) | -20, -14, (at the room) | -23, -25, -22 |
| E: margin k needed to silence each click (window ends -5..+120 ms) | 0.9 / 1.9 / >50* | 1.0 / 0.9 / ∞* | 1.1 / 1.0 / 2.7 |
(*: in those two windows there was another sound in the room that the other clicks did not have. The "tail" column of the probe
shows it as -13 and -6 dB.)

What this changes from section 21:
1. **Timing is not the problem for clicks queued together.** The real spread is 1 to 4 µs, about 25 to 100 times smaller than the
   ±0.1 ms that killed C. The probe's own test on made-up takes recovered planted jitter of 0, 2.8, 112 and 1124 µs as 0.3, 2.8,
   111 and 1109 µs. It also recovered a planted offset of 1.5 and 3 ms between the round's clicks and the count-in's as 1500 and
   3019 µs.
2. **What is not repeatable is the click itself.** Even perfectly aligned and scaled, one real click matches the others only to
   about -20 dB. A quiet room needs about -30 dB, because a click alone reads 6 to 124 times the room level and the check fires at
   1.2 times. So subtracting the waveform alone cannot work on these real clicks. An energy template with a margin of 2 to 3 covers
   that variation.
3. **The round's clicks are queued by a different call.** `scScheduleClicks` reads the two clocks again, so expect a constant offset
   from the count-in's grid. The bench used 4.3 ms. Queuing the round on the count-in's own audio-clock grid would remove it; that
   is a site change. Take 1 below measures the real offset.

## The candidates (as built in the bench; every verdict is the real check's: coach-strumcheck.js in the vm)

- **E, energy-domain template** (`lib.mjs` E_VM: a copy of `coachReadFrame` with two hooks; with no hooks it is the site's own).
  - Learning: during the count-in, every 1-ms window position in each analyser buffer is read: the level and HF power of a
    1024-sample window, -40 ms to min(560 ms, beat - 45 ms) from each count-in click's scheduled time, minus its own room level. The
    template is the median over the clicks of the round's voice (today's: count-in clicks 1-3, because the 4th is 990 Hz), widened
    ±J ms and multiplied by k.
  - In the round: for every window near a beat, the template's power is subtracted from the window's level² and HF², floored at the
    smoothed level, before the ratio tests.
  - Refresh (`r`): it re-learned from slot-4 clicks when nothing was heard. Measured, it was harmful (48 of 128 heard in "realish"),
    so it is dropped.
- **A', a click made to be removed:** a tone burst with raised-cosine fades in and out (`b3520r5`: 3520 Hz, 5 ms fades, 25 ms hold,
  35 ms in all; also 10 ms fades, 2640 Hz and 4400 Hz), the same voice in the count-in, plus a stop filter on what the check
  measures: `n2` (a notch, Q 2), `bs` (three notches at 0.9, 1 and 1.1 f, Q 4) or `lp2` (an extra 2 kHz low-pass).
  - **Is it still a usable click?** A 35 ms high beep with a 5 ms rise is a short, high "pip", not a "tick". 3-4 kHz is where the
    ear is most sensitive, so it can be played quieter. Only Jonathan's ears can judge it.
- **C', waveform subtraction that tolerates timing** (offline on the processed stream, as an AudioWorklet with look-ahead would do
  it; that would add about 40 ms of delay before the check).
  - Learning: the per-sample median of the count-in clicks, each aligned to the others to a fraction of a sample, twice.
  - Each round click: aligned again within ±3 ms (cross-correlation, then a parabola), its gain set by least squares (0 to 1.5),
    then subtracted over 0.5 s, which covers the room echo. The offset is tracked from the last 5 clicks, and an NLMS update runs
    on quiet slot-4 clicks.
  - The count-in clicks are also subtracted, each against the mean of the others, so E learns on what is left.
- **Combinations:** AE (A' + E), CpE (C' + E), CpAE.
- **References:** B 1.3 (section 21's ring confirmation), k660 (today's click, nothing done) and no click.

## The bench's models (all stated; none fitted to a real speaker except "vary")

- **Students:** strum-check-loop.mjs's virtual student, in three kinds:
  - nothing played;
  - the right player (pick, 25 ms spread);
  - an extra down-strum on "3" in bar 2 (slot 4, a rest that sits on a click).
- **Mic:** Chromebook model, 60 fps (one row at 20 fps). The site's chain: 70 Hz high-pass, 1500 Hz low-pass.
- **Click level:** the peak of the DIRECT click at the mic: 0.03, 0.1 (default), 0.2, and 0.35 (J03's real level).
- **Speaker:**
  - `hp`: a 2nd-order 300 Hz high-pass;
  - `nl`: tanh soft clipping, drive 3 (2 in "realish");
  - `flat`: no high-pass.
- **Room echo:** reflections at 2.9 / 6.1 / 11.3 / 17.8 / 26 ms (gains 0.45, -0.3, 0.25, -0.18, 0.12), plus a diffuse tail with
  RT60 0.3 s, direct-to-reverberant +6 dB.
- **vary** (fitted to the probe's real clicks): a per-click gain spread of 4% sd, plus a varying comb at -20 dB with a random
  0.5-3 ms delay. It reproduces the real -20 dB limit on waveform subtraction.
- **Timing:**
  - `jit`: each click arrives with uniform jitter of ±0.1 / ±0.5 / ±2 ms.
  - `delay`: an unknown constant delay of 160 ms instead of 70, plus the round's clicks 4.3 ms off the count-in's grid.
  - `map`: the page's estimate of when each window of sound reached the mic, wrong by up to ±3 / ±10 ms per frame (uniform).
- **Rooms:** quiet, class, room7.
  - room7 makes the check hear 84 of 96 beat slots with NO click (talk and other guitars at ratio 1.2), so it says nothing about
    clicks.
  - class makes it hear 33 of 96 with no click.
  - Goal (i) is scored against the same room with no click.
- **Other stresses:** a real strum during the count-in (`ci`: a D5 down-strum on count-in "2"), and tempos of 60, 85 and 100.
- **Combined conditions:**
  - `hardQ20` / `hardC20`: quiet / class room, level 0.2, hp + nl 3 + echo + vary, delay 160, offset 4.3 ms, jitter ±2 ms, the
    count-in strum, map ±10 ms, at 60, 85 and 100;
  - `m3`: the same with map ±3 ms; `m3n`: the same without the count-in strum; `hardQ35m3`: level 0.35;
  - `realish`: the best guess at a real MacBook (quiet room, 0.1 or 0.35, hp + nl 2 + echo + vary, delay 180, offset 4.3 ms,
    jitter ±5 µs, map ±3 ms).
- **Seeds:** 3 per one-factor cell (96 beat slots, 144 strums, 3 extras on "3"); 4 per combined cell and tempo.

## The deciding rows

Each cell: the candidate's count, with the no-click number in brackets. (i) = beat slots heard with nothing played; (ii) = strums
heard by the right player · false extras in his rests; (iv) = strums on a click heard; (iii) = extra on "3" caught.

| candidate | condition | (i) nothing played | (ii) right: strums · false extras | (iv) on-click strums | (iii) extra on "3" |
|---|---|---|---|---|---|
| today's click, nothing done | realish | 128/128 (0) | 178/192 (175) · 29/64 (0) | 94/96 (91) | 4/4 (4) |
| **E 660, k3 J4** | base (0.1, quiet, 85) | **0/96** (0) | 129/144 (131) · 0/48 (0) | 66/72 (68) | 3/3 (3) |
| **E 660, k3 J4** | realish | **0/128** (0) | 176/192 (175) · 1/64 (0) | 91/96 (91) | 4/4 (4) |
| **E 660, k3 J4** | realish35 | **0/128** (0) | 177/192 (175) · 2/64 (0) | 91/96 (91) | 4/4 (4) |
| **E 660, k3 J4** | hardQ20m3 | **0/384** (0), off-beat 8/768 | 545/576 (546) · 3/192 (0) | 275/288 (277) | 11/12 (11) |
| **E 660, k3 J4** | hardQ20m3n | **0/384** (0), off-beat 1/768 | 540/576 (538) · 3/192 (0) | 269/288 (269) | 12/12 (12) |
| **E 660, k3 J4** | hardQ35m3 | **0/384** (0), off-beat 9/768 | 546/576 (546) · 6/192 (0) | 275/288 (277) | 11/12 (11) |
| **E 660, k3 J4** | hardC20m3 (class) | 139/384 (137) | 535/575 (535) · 0/192 (0) | 272/287 (271) | 10/12 (10) |
| E 660, k3 J4 | map ±10 ms alone | 7/96 (0) | 127/144 (131) · 0/48 (0) | 64/72 (68) | 3/3 (3) |
| E 660, k3 J4 | hardQ20 (map ±10) | 41/384 (0) | 545/576 (546) · 6/192 (0) | 275/288 (277) | 11/12 (11) |
| E on b3520r5, k3 | hardQ20m3 | 4/384 (0) | 546/576 (546) · 4/192 (0) | 277/288 (277) | 11/12 (11) |
| E on b3520r5, k3 | realish35 | 0/128 (0) | 176/192 (175) · 0/64 (0) | 91/96 (91) | 4/4 (4) |
| A' b3520r5 + bs | lvl 0.35 / nl | 96/96 (0) | 125/144 (131) · 0/48 | 64/72 (68) | 3/3 |
| A' + E (bs, k3) | hardQ20m3 | 0/384 (0) | 527/576 (546) · 0/192 (0) | 271/288 (277) | 10/12 (11) |
| C' 660 | vary alone / ci alone | 75/96 / 96/96 (0) | 130/144 (131) / 138/144 (139) | 67/72 / 70/72 | 3/3 / 2/3 |
| C' 660 | realish | 104/128 (0) | 176/192 (175) · 0/64 (0) | 91/96 (91) | 4/4 (4) |
| C' + E 660 | realish35 | 38/128 (0) | 176/192 (175) · 0/64 (0) | 91/96 (91) | 4/4 (4) |
| B 1.3 | base | 89/96 (0) | 122/144 (131) · 2/48 (0) | 59/72 (68) | 2/3 (3) |

E on today's click, one factor at a time (85 BPM, 3 seeds; k3 J4; full rows below):
- **Nothing played:** 0 of 96 beat slots heard in every one-factor row: level 0.03, 0.1, 0.2 and 0.35; jitter ±0.1, ±0.5 and ±2 ms;
  delay plus offset; echo; non-linear; flat; vary; count-in strum; 60 and 100 BPM; 20 fps; map ±3. The one exception is map ±10
  (7 of 96).
- **Right player:** 125 to 132 strums heard of 144, against 131 with no click (the worst row is 0.35). 0 false extras in every row.
- **Extra on "3":** caught 3 of 3 (or 2 of 3, the same as with no click) in every row.

## Jonathan's three real takes (`takes.mjs`; scored at each take's kept clock and ±20 ms)

The replay reproduces section 20: as today, the takes hear 101 of 138 strums, 16 of 46 extras, 5 bars right, 17 of 23 chords.

| | strums heard of 138 | on-beat of 69 | false extras of 46 | bars right of 23 | chords of 23 |
|---|---|---|---|---|---|
| as today (no click) | 101 | 52 | 16 | 5 | 17 |
| (a) as if a click sounded, E 660 k3 J4 (template from the takes' real count-in clicks) | 100 | 52 | 17 | 5 | 17 |
| (a) the bs stop filter alone | 101 | 52 | 16 | 5 | 17 |
| (b) real-click replay (a copy of the take's own count-in click on every beat), nothing done | 111 (clicks heard as strums) | 64 | 17 | 5 | 21 |
| (b) real-click replay, **E 660 k3 J4** | **100** | 52 | 17 | 5 | 18 |
| (b) real-click replay, the same with the round 4.3 ms off the count-in grid | 101 | 52 | 17 | 5 | 18 |
| (b) real-click replay, C' | 117 (J03: 13 extras -> 0; it changes the grade) | 64 | 3 | 8 | 21 |
| (b) real-click replay, B 1.3 | 105 | 59 | 17 | 5 | 20 |
| (b) b3520r5 through "realish" 0.1, nothing done | 115 | 69 | 34 | 0 | 21 |
| (b) the same, E k2 (no stop filter) | 101 | 52 | 17 | 5 | 18 |
| (b) the same, A' + E (bs) | 101 | 52 | 19 | 5 | 17 |
| (b) b3520r5 "hard" 0.2 (±2 ms, nl 3), E k3 | 92 (J02 only: 23 of 42, but 33 and 32 at ±20 ms) | 46 | 25 | 4 | 16 |

What it costs real playing: about 1 strum and 1 extra in 138 for E on today's click. On these takes the J02 grid is a whole slot off
in 9 of 17 clocks (section 20), so one row's single-clock loss there is the grid's, not the click's. The real-click replay has a flaw:
each beat's click is one of the 3 real count-in clicks the template was learned from, so it flatters C' and E a little.

## What could not be modelled

- How far off a frame's timing really is: what the page believes about when each analyser buffer reached the mic, against when it
  really did (Chrome's input chunks and render bursts). E depends on it: ±3 ms passes, ±10 ms fails. The probe cannot read it from a
  take, because the take does not save per-frame timing.
- Real round clicks: the offset between the two schedulers, whether a real round click varies like the count-in ones, and
  speaker DSP. MacBook speakers have a limiter and EQ that may change with what played just before; J01's first count-in click was
  softer in a first look.
- Sympathetic string ringing: the 660 Hz click is about the open high e string's 2nd harmonic. A Chromebook speaker and mic.
- How the 3520 Hz burst really sounds, and how loud it comes out of a laptop speaker.
- A student who turns the volume up or down mid-round, or headphones really worn with the box ticked. E's template would come out
  near 0 and do nothing, which is safe; that is take 6.

## The takes to record

All on the local copy in local recording mode (DETAILS.md section 18), with this setup: the MacBook's own speaker at the level he
would really use, NO headphones but the "I'm wearing headphones" box TICKED (so the page plays the click on every beat through the
speaker), the Metronome ON, the Strum Pattern check (ca-52). Save both files of every take. Put each answer in its own folder, then
run `node tools/mic-sim/local-takes-in.mjs <folder> --note="..."`.

1. **Nothing played, 85 BPM.** Mute the strings with the left hand or put the guitar down, for the whole round. Note: "click
   through speaker, nothing played, 85". This one matters most: 36 clicks alone.
2. **Nothing played, 85 BPM, speaker at its loudest comfortable level.** Note: "... loud".
3. **The eight bars right, 85 BPM.** Note: "click through speaker, played right, 85".
4. **The eight bars right with ONE extra down-strum on "3" in bar 2.** Note: "extra strum on 3, bar 2, 85".
5. **Takes 1 and 3 at 60 and at 100 BPM** (four takes).
6. **Take 1 with real headphones on** (box ticked, headphones plugged in). The mic should hear no click at all; this shows what the
   page learns when the click does not reach the mic.
7. **Takes 1, 3 and 4 on a classroom Chromebook**, using its speaker and mic, in the classroom. One MacBook cannot stand in for it.

Then run `node tools/mic-sim/click-probe.mjs "Claude outputs/takes-anon/J0N.json"` on each. It prints:
- the per-click jitter and the round's offset from the count-in's grid;
- the level, harmonics and echo at the mic;
- what the onset test sees of a click alone;
- the margin E needs, and how far waveform subtraction gets.

Takes 3-5 also go through `tools/mic-sim/strum-check-replay.mjs`. If the round clicks come back as steady as the count-in's, and
E's needed margin stays at 3 or under, build E. Time it from the audio clock (`coachCtx.currentTime`), queue the round's clicks on
the count-in's grid, and let it learn only from the count-in. It is a change to how the check listens, so it gets a deep review.

## Full tables

(The goal flags are i ii iii iv. Tolerances: (i) no more than with no click, plus 1% of slots; (ii) strums within 1%, bars within
1 of 16, false extras within 1, chords within 1 of 32; (iii) caught as with no click; (iv) within 1%.)

```
### main.json (one factor at a time; 3 seeds; 85 BPM unless named)
candidate | condition | (i) nothing played: beat slots heard / all slots heard | (ii) right: strums heard (no click) · bars right (no click) · false extras in rests (no click) · chords ok (no click) | (iv) strums on a click heard (no click) | (iii) extra on "3" caught (no click) | goals i ii iii iv
k660 | class 85 | 96/96 (33) · 124/192 (62) | 138/144 (138) · 10/24 (19) · 10/48 (0) · 22/24 (22) | 72/72 (71) | 3/3 (3) | nnYY
E660k2 | class 85 | 39/96 (33) · 65/192 (62) | 137/144 (138) · 18/24 (19) · 0/48 (0) · 22/24 (22) | 71/72 (71) | 3/3 (3) | nYYY
E660k3 | class 85 | 35/96 (33) · 61/192 (62) | 137/144 (138) · 18/24 (19) · 0/48 (0) · 22/24 (22) | 71/72 (71) | 3/3 (3) | nYYY
AE | class 85 | 30/96 (33) · 57/192 (62) | 135/144 (138) · 16/24 (19) · 0/48 (0) · 22/24 (22) | 70/72 (71) | 3/3 (3) | YnYY
AEk3 | class 85 | 30/96 (33) · 57/192 (62) | 135/144 (138) · 16/24 (19) · 0/48 (0) · 22/24 (22) | 70/72 (71) | 3/3 (3) | YnYY
Cp660 | class 85 | 64/96 (33) · 99/192 (62) | 137/144 (138) · 18/24 (19) · 0/48 (0) · 22/24 (22) | 71/72 (71) | 3/3 (3) | nYYY
CpE660 | class 85 | 40/96 (33) · 64/192 (62) | 137/144 (138) · 18/24 (19) · 0/48 (0) · 22/24 (22) | 71/72 (71) | 3/3 (3) | nYYY
Ab5bs | class 85 | 33/96 (33) · 60/192 (62) | 135/144 (138) · 16/24 (19) · 0/48 (0) · 22/24 (22) | 70/72 (71) | 3/3 (3) | YnYY
B660 | class 85 | 31/96 (33) · 56/192 (62) | 130/144 (138) · 11/24 (19) · 3/48 (0) · 19/24 (22) | 64/72 (71) | 3/3 (3) | YnYn
E660k2 | bpm100 100 | 0/96 (0) · 0/192 (0) | 126/144 (128) · 10/24 (11) · 0/48 (0) · 16/24 (17) | 61/72 (63) | 3/3 (3) | YnYn
E660k3 | bpm100 100 | 0/96 (0) · 0/192 (0) | 126/144 (128) · 10/24 (11) · 0/48 (0) · 16/24 (17) | 61/72 (63) | 3/3 (3) | YnYn
AE | bpm100 100 | 0/96 (0) · 0/192 (0) | 121/144 (128) · 4/24 (11) · 0/48 (0) · 15/24 (17) | 59/72 (63) | 3/3 (3) | YnYn
AEk3 | bpm100 100 | 0/96 (0) · 0/192 (0) | 121/144 (128) · 4/24 (11) · 0/48 (0) · 15/24 (17) | 59/72 (63) | 3/3 (3) | YnYn
Cp660 | bpm100 100 | 0/96 (0) · 0/192 (0) | 128/144 (128) · 10/24 (11) · 1/48 (0) · 17/24 (17) | 63/72 (63) | 3/3 (3) | YYYY
CpE660 | bpm100 100 | 0/96 (0) · 0/192 (0) | 128/144 (128) · 10/24 (11) · 1/48 (0) · 17/24 (17) | 63/72 (63) | 3/3 (3) | YYYY
Ab5bs | bpm100 100 | 0/96 (0) · 0/192 (0) | 121/144 (128) · 4/24 (11) · 0/48 (0) · 15/24 (17) | 59/72 (63) | 3/3 (3) | YnYn
E660k2 | bpm60 60 | 0/96 (0) · 0/192 (0) | 144/144 (144) · 24/24 (24) · 0/48 (0) · 23/24 (23) | 72/72 (72) | 3/3 (3) | YYYY
E660k3 | bpm60 60 | 0/96 (0) · 0/192 (0) | 144/144 (144) · 24/24 (24) · 0/48 (0) · 23/24 (23) | 72/72 (72) | 3/3 (3) | YYYY
AE | bpm60 60 | 0/96 (0) · 0/192 (0) | 141/144 (144) · 21/24 (24) · 0/48 (0) · 23/24 (23) | 71/72 (72) | 3/3 (3) | YnYY
AEk3 | bpm60 60 | 0/96 (0) · 0/192 (0) | 141/144 (144) · 21/24 (24) · 0/48 (0) · 23/24 (23) | 71/72 (72) | 3/3 (3) | YnYY
Cp660 | bpm60 60 | 0/96 (0) · 0/192 (0) | 143/144 (144) · 23/24 (24) · 0/48 (0) · 23/24 (23) | 72/72 (72) | 3/3 (3) | YYYY
CpE660 | bpm60 60 | 0/96 (0) · 0/192 (0) | 143/144 (144) · 23/24 (24) · 0/48 (0) · 23/24 (23) | 72/72 (72) | 3/3 (3) | YYYY
Ab5bs | bpm60 60 | 0/96 (0) · 0/192 (0) | 141/144 (144) · 21/24 (24) · 0/48 (0) · 23/24 (23) | 71/72 (72) | 3/3 (3) | YnYY
k660 | base 85 | 96/96 (0) · 96/192 (0) | 132/144 (131) · 10/24 (13) · 7/48 (0) · 23/24 (22) | 69/72 (68) | 3/3 (3) | nnYY
k660 | lvl03 85 | 96/96 (0) · 96/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | nYYY
k660 | lvl35 85 | 96/96 (0) · 96/192 (0) | 135/144 (131) · 0/24 (13) · 24/48 (0) · 23/24 (22) | 72/72 (68) | 3/3 (3) | nnYY
E660k2 | base 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k2 | lvl03 85 | 0/96 (0) · 0/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
E660k2 | lvl20 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 12/24 (13) · 0/48 (0) · 20/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
E660k2 | lvl35 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 11/24 (13) · 0/48 (0) · 19/24 (22) | 62/72 (68) | 3/3 (3) | YnYn
E660k2 | jit01 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k2 | jit05 85 | 0/96 (0) · 0/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
E660k2 | jit2 85 | 0/96 (0) · 0/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
E660k2 | delay 85 | 0/96 (0) · 0/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
E660k2 | echo 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k2 | nl 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k2 | flat 85 | 0/96 (0) · 0/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
E660k2 | vary 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k2 | fps20 85 | 0/96 (0) · 0/192 (0) | 125/144 (127) · 11/24 (12) · 0/48 (0) · 21/24 (21) | 63/72 (65) | 3/3 (3) | YnYn
E660k2 | map3 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k2 | map10 85 | 18/96 (0) · 18/192 (0) | 128/144 (131) · 12/24 (13) · 0/48 (0) · 20/24 (22) | 65/72 (68) | 3/3 (3) | nnYn
E660k3 | base 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k3 | lvl03 85 | 0/96 (0) · 0/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
E660k3 | lvl20 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 11/24 (13) · 0/48 (0) · 20/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
E660k3 | lvl35 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 11/24 (13) · 0/48 (0) · 19/24 (22) | 62/72 (68) | 3/3 (3) | YnYn
E660k3 | jit01 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k3 | jit05 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k3 | jit2 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k3 | delay 85 | 0/96 (0) · 0/192 (0) | 132/144 (131) · 14/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
E660k3 | echo 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k3 | nl 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k3 | flat 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k3 | vary 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k3 | fps20 85 | 0/96 (0) · 0/192 (0) | 123/144 (127) · 11/24 (12) · 0/48 (0) · 20/24 (21) | 61/72 (65) | 3/3 (3) | YnYn
E660k3 | map3 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
E660k3 | map10 85 | 7/96 (0) · 7/192 (0) | 127/144 (131) · 11/24 (13) · 0/48 (0) · 20/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
AE | base 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | lvl03 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | lvl20 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | lvl35 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | jit01 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | jit05 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | jit2 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | delay 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | echo 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | nl 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | flat 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | vary 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | fps20 85 | 0/96 (0) · 0/192 (0) | 119/144 (127) · 8/24 (12) · 0/48 (0) · 19/24 (21) | 59/72 (65) | 3/3 (3) | YnYn
AE | map3 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AE | map10 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | base 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | lvl03 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | lvl20 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | lvl35 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | jit01 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | jit05 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | jit2 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | delay 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | echo 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | nl 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | flat 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | vary 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | fps20 85 | 0/96 (0) · 0/192 (0) | 119/144 (127) · 8/24 (12) · 0/48 (0) · 19/24 (21) | 59/72 (65) | 3/3 (3) | YnYn
AEk3 | map3 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEk3 | map10 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Cp660 | base 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
Cp660 | lvl03 85 | 0/96 (0) · 0/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
Cp660 | lvl20 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
Cp660 | lvl35 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
Cp660 | jit01 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
Cp660 | jit05 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
Cp660 | jit2 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
Cp660 | delay 85 | 3/96 (0) · 3/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | nYYY
Cp660 | echo 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
Cp660 | nl 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
Cp660 | flat 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
Cp660 | vary 85 | 75/96 (0) · 75/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | nYYY
Cp660 | fps20 85 | 0/96 (0) · 0/192 (0) | 127/144 (127) · 12/24 (12) · 0/48 (0) · 21/24 (21) | 65/72 (65) | 3/3 (3) | YYYY
CpE660 | base 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
CpE660 | lvl03 85 | 0/96 (0) · 0/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
CpE660 | lvl20 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
CpE660 | lvl35 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
CpE660 | jit01 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
CpE660 | jit05 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
CpE660 | jit2 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
CpE660 | delay 85 | 3/96 (0) · 3/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | nYYY
CpE660 | echo 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
CpE660 | nl 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
CpE660 | flat 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
CpE660 | vary 85 | 7/96 (0) · 7/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | nYYY
CpE660 | fps20 85 | 0/96 (0) · 0/192 (0) | 127/144 (127) · 12/24 (12) · 0/48 (0) · 21/24 (21) | 65/72 (65) | 3/3 (3) | YYYY
CpE660 | map3 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
CpE660 | map10 85 | 0/96 (0) · 0/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | YYYY
Ab5bs | base 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | lvl03 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | lvl20 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | lvl35 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
Ab5bs | jit01 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | jit05 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | jit2 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | delay 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | echo 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | nl 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
Ab5bs | flat 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | vary 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | fps20 85 | 0/96 (0) · 0/192 (0) | 119/144 (127) · 8/24 (12) · 0/48 (0) · 19/24 (21) | 59/72 (65) | 3/3 (3) | YnYn
E660k3r | base 85 | 0/96 (0) · 0/192 (0) | 132/144 (131) · 14/24 (13) · 0/48 (0) · 23/24 (22) | 69/72 (68) | 3/3 (3) | YYYY
E660k3r | vary 85 | 0/96 (0) · 0/192 (0) | 132/144 (131) · 14/24 (13) · 0/48 (0) · 23/24 (22) | 69/72 (68) | 3/3 (3) | YYYY
E660k3r | lvl35 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 13/24 (13) · 0/48 (0) · 20/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
B660 | base 85 | 89/96 (0) · 89/192 (0) | 122/144 (131) · 9/24 (13) · 2/48 (0) · 17/24 (22) | 59/72 (68) | 2/3 (3) | nnnn
B660 | lvl35 85 | 96/96 (0) · 96/192 (0) | 112/144 (131) · 5/24 (13) · 0/48 (0) · 13/24 (22) | 49/72 (68) | 1/3 (3) | nnnn
B660 | delay 85 | 96/96 (0) · 96/192 (0) | 132/144 (131) · 6/24 (13) · 13/48 (0) · 22/24 (22) | 69/72 (68) | 3/3 (3) | nnYY
B660 | jit2 85 | 87/96 (0) · 87/192 (0) | 120/144 (131) · 7/24 (13) · 3/48 (0) · 16/24 (22) | 57/72 (68) | 3/3 (3) | nnYn
E660k2 | ci 85 | 0/96 (0) · 0/192 (0) | 137/144 (139) · 19/24 (20) · 0/48 (0) · 21/24 (22) | 68/72 (70) | 2/3 (2) | YnYn
E660k3 | ci 85 | 0/96 (0) · 0/192 (0) | 136/144 (139) · 18/24 (20) · 0/48 (0) · 21/24 (22) | 67/72 (70) | 2/3 (2) | YnYn
AE | ci 85 | 0/96 (0) · 0/192 (0) | 130/144 (139) · 15/24 (20) · 0/48 (0) · 21/24 (22) | 68/72 (70) | 2/3 (2) | YnYn
AEk3 | ci 85 | 0/96 (0) · 0/192 (0) | 130/144 (139) · 15/24 (20) · 0/48 (0) · 21/24 (22) | 68/72 (70) | 2/3 (2) | YnYn
Cp660 | ci 85 | 96/96 (0) · 96/192 (0) | 138/144 (139) · 19/24 (20) · 0/48 (0) · 22/24 (22) | 70/72 (70) | 2/3 (2) | nYYY
CpE660 | ci 85 | 95/96 (0) · 145/192 (0) | 136/144 (139) · 18/24 (20) · 0/48 (0) · 21/24 (22) | 68/72 (70) | 2/3 (2) | nnYn
Ab5bs | ci 85 | 0/96 (0) · 0/192 (0) | 130/144 (139) · 15/24 (20) · 0/48 (0) · 21/24 (22) | 68/72 (70) | 2/3 (2) | YnYn
E660k3r | ci 85 | 0/96 (0) · 0/192 (0) | 137/144 (139) · 18/24 (20) · 0/48 (0) · 22/24 (22) | 70/72 (70) | 2/3 (2) | YnYY
E660k2 | room7 85 | 77/96 (84) · 156/192 (167) | 124/144 (131) · 2/24 (8) · 20/48 (21) · 14/24 (17) | 58/72 (63) | 3/3 (3) | YnYn
E660k3 | room7 85 | 72/96 (84) · 153/192 (167) | 111/144 (131) · 1/24 (8) · 18/48 (21) · 11/24 (17) | 47/72 (63) | 3/3 (3) | YnYn
AE | room7 85 | 76/96 (84) · 154/192 (167) | 123/144 (131) · 2/24 (8) · 23/48 (21) · 15/24 (17) | 56/72 (63) | 3/3 (3) | YnYn
AEk3 | room7 85 | 71/96 (84) · 152/192 (167) | 116/144 (131) · 2/24 (8) · 20/48 (21) · 14/24 (17) | 50/72 (63) | 3/3 (3) | YnYn
Cp660 | room7 85 | 91/96 (84) · 173/192 (167) | 132/144 (131) · 7/24 (8) · 24/48 (21) · 19/24 (17) | 65/72 (63) | 3/3 (3) | nnYY
CpE660 | room7 85 | 77/96 (84) · 157/192 (167) | 123/144 (131) · 2/24 (8) · 19/48 (21) · 13/24 (17) | 57/72 (63) | 3/3 (3) | YnYn
Ab5bs | room7 85 | 85/96 (84) · 168/192 (167) | 129/144 (131) · 7/24 (8) · 21/48 (21) · 17/24 (17) | 63/72 (63) | 3/3 (3) | nnYY

### adesign.json (designed clicks and stop filters)
candidate | condition | (i) nothing played: beat slots heard / all slots heard | (ii) right: strums heard (no click) · bars right (no click) · false extras in rests (no click) · chords ok (no click) | (iv) strums on a click heard (no click) | (iii) extra on "3" caught (no click) | goals i ii iii iv
A | class 85 | 51/96 (33) · 81/192 (62) | 135/144 (138) · 16/24 (19) · 0/48 (0) · 22/24 (22) | 70/72 (71) | 3/3 (3) | nnYY
Ab5n2 | class 85 | 33/96 (33) · 60/192 (62) | 135/144 (138) · 16/24 (19) · 0/48 (0) · 22/24 (22) | 70/72 (71) | 3/3 (3) | YnYY
Ab5bs | class 85 | 33/96 (33) · 60/192 (62) | 135/144 (138) · 16/24 (19) · 0/48 (0) · 22/24 (22) | 70/72 (71) | 3/3 (3) | YnYY
Ab10bs | class 85 | 33/96 (33) · 60/192 (62) | 135/144 (138) · 16/24 (19) · 0/48 (0) · 22/24 (22) | 70/72 (71) | 3/3 (3) | YnYY
Ab5lp2 | class 85 | 92/96 (33) · 118/192 (62) | 132/144 (138) · 14/24 (19) · 0/48 (0) · 22/24 (22) | 69/72 (71) | 3/3 (3) | nnYn
A2640bs | class 85 | 30/96 (33) · 60/192 (62) | 136/144 (138) · 17/24 (19) · 0/48 (0) · 22/24 (22) | 71/72 (71) | 3/3 (3) | YnYY
A4400bs | class 85 | 33/96 (33) · 60/192 (62) | 135/144 (138) · 16/24 (19) · 0/48 (0) · 22/24 (22) | 70/72 (71) | 3/3 (3) | YnYY
AEn2 | class 85 | 30/96 (33) · 58/192 (62) | 135/144 (138) · 16/24 (19) · 0/48 (0) · 22/24 (22) | 70/72 (71) | 3/3 (3) | YnYY
kb3520 | class 85 | 96/96 (33) · 123/192 (62) | 138/144 (138) · 18/24 (19) · 0/48 (0) · 22/24 (22) | 72/72 (71) | 3/3 (3) | nYYY
A | base 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
A | lvl20 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
A | lvl35 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
A | nl 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
A | echo 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
Ab5n2 | base 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5n2 | lvl20 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5n2 | lvl35 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
Ab5n2 | nl 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
Ab5n2 | echo 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | base 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | lvl20 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5bs | lvl35 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
Ab5bs | nl 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
Ab5bs | echo 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab10bs | base 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab10bs | lvl20 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab10bs | lvl35 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab10bs | nl 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | nnYn
Ab10bs | echo 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Ab5lp2 | base 85 | 96/96 (0) · 96/192 (0) | 119/144 (131) · 6/24 (13) · 0/48 (0) · 19/24 (22) | 60/72 (68) | 3/3 (3) | nnYn
Ab5lp2 | lvl20 85 | 96/96 (0) · 96/192 (0) | 120/144 (131) · 6/24 (13) · 0/48 (0) · 20/24 (22) | 61/72 (68) | 3/3 (3) | nnYn
Ab5lp2 | lvl35 85 | 96/96 (0) · 96/192 (0) | 125/144 (131) · 6/24 (13) · 6/48 (0) · 22/24 (22) | 66/72 (68) | 2/3 (3) | nnnn
Ab5lp2 | nl 85 | 96/96 (0) · 96/192 (0) | 120/144 (131) · 6/24 (13) · 0/48 (0) · 20/24 (22) | 61/72 (68) | 3/3 (3) | nnYn
Ab5lp2 | echo 85 | 96/96 (0) · 96/192 (0) | 120/144 (131) · 6/24 (13) · 0/48 (0) · 20/24 (22) | 61/72 (68) | 3/3 (3) | nnYn
A2640bs | base 85 | 0/96 (0) · 0/192 (0) | 122/144 (131) · 7/24 (13) · 0/48 (0) · 19/24 (22) | 62/72 (68) | 3/3 (3) | YnYn
A2640bs | lvl20 85 | 96/96 (0) · 96/192 (0) | 122/144 (131) · 7/24 (13) · 0/48 (0) · 19/24 (22) | 62/72 (68) | 3/3 (3) | nnYn
A2640bs | lvl35 85 | 96/96 (0) · 96/192 (0) | 122/144 (131) · 7/24 (13) · 0/48 (0) · 19/24 (22) | 62/72 (68) | 3/3 (3) | nnYn
A2640bs | nl 85 | 96/96 (0) · 96/192 (0) | 122/144 (131) · 7/24 (13) · 0/48 (0) · 19/24 (22) | 62/72 (68) | 3/3 (3) | nnYn
A2640bs | echo 85 | 0/96 (0) · 0/192 (0) | 122/144 (131) · 7/24 (13) · 0/48 (0) · 19/24 (22) | 62/72 (68) | 3/3 (3) | YnYn
A4400bs | base 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 10/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
A4400bs | lvl20 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 10/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
A4400bs | lvl35 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 10/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
A4400bs | nl 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 10/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
A4400bs | echo 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 10/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
AEn2 | base 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEn2 | lvl20 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEn2 | lvl35 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEn2 | nl 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
AEn2 | echo 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 8/24 (13) · 0/48 (0) · 21/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
kb3520 | base 85 | 96/96 (0) · 96/192 (0) | 133/144 (131) · 15/24 (13) · 0/48 (0) · 23/24 (22) | 70/72 (68) | 3/3 (3) | nYYY
kb3520 | lvl20 85 | 96/96 (0) · 96/192 (0) | 135/144 (131) · 0/24 (13) · 24/48 (0) · 23/24 (22) | 72/72 (68) | 3/3 (3) | nnYY
kb3520 | lvl35 85 | 96/96 (0) · 96/192 (0) | 135/144 (131) · 0/24 (13) · 24/48 (0) · 23/24 (22) | 72/72 (68) | 3/3 (3) | nnYY
kb3520 | nl 85 | 96/96 (0) · 96/192 (0) | 133/144 (131) · 15/24 (13) · 0/48 (0) · 23/24 (22) | 70/72 (68) | 3/3 (3) | nYYY
kb3520 | echo 85 | 96/96 (0) · 96/192 (0) | 133/144 (131) · 8/24 (13) · 9/48 (0) · 23/24 (22) | 70/72 (68) | 3/3 (3) | nnYY

### hard.json (everything at once; 4 seeds x 60/85/100)
candidate | condition | (i) nothing played: beat slots heard / all slots heard | (ii) right: strums heard (no click) · bars right (no click) · false extras in rests (no click) · chords ok (no click) | (iv) strums on a click heard (no click) | (iii) extra on "3" caught (no click) | goals i ii iii iv
k660 | hardC10 100/60/85 | 384/384 (137) · 510/768 (268) | 548/575 (535) · 6/96 (63) · 86/192 (0) · 88/96 (83) | 284/287 (271) | 12/12 (10) | nnYY
k660 | hardC20 100/60/85 | 384/384 (137) · 501/768 (268) | 548/575 (535) · 0/96 (63) · 96/192 (0) · 89/96 (83) | 287/287 (271) | 12/12 (10) | nnYY
E660k2 | hardC10 100/60/85 | 167/384 (137) · 312/768 (268) | 534/575 (535) · 60/96 (63) · 2/192 (0) · 82/96 (83) | 272/287 (271) | 10/12 (10) | nnYY
E660k2 | hardC20 100/60/85 | 166/384 (137) · 300/768 (268) | 536/575 (535) · 57/96 (63) · 8/192 (0) · 82/96 (83) | 272/287 (271) | 10/12 (10) | nnYY
E660k3 | hardC10 100/60/85 | 158/384 (137) · 275/768 (268) | 533/575 (535) · 60/96 (63) · 1/192 (0) · 82/96 (83) | 272/287 (271) | 10/12 (10) | nYYY
E660k3 | hardC20 100/60/85 | 149/384 (137) · 264/768 (268) | 536/575 (535) · 61/96 (63) · 2/192 (0) · 82/96 (83) | 271/287 (271) | 10/12 (10) | nnYY
E660k3r | hardC10 100/60/85 | 189/384 (137) · 336/768 (268) | 524/575 (535) · 54/96 (63) · 5/192 (0) · 82/96 (83) | 272/287 (271) | 10/12 (10) | nnYY
E660k3r | hardC20 100/60/85 | 181/384 (137) · 336/768 (268) | 526/575 (535) · 37/96 (63) · 31/192 (0) · 82/96 (83) | 273/287 (271) | 10/12 (10) | nnYY
AE | hardC10 100/60/85 | 135/384 (137) · 277/768 (268) | 513/575 (535) · 52/96 (63) · 0/192 (0) · 77/96 (83) | 261/287 (271) | 7/12 (10) | Ynnn
AE | hardC20 100/60/85 | 155/384 (137) · 306/768 (268) | 513/575 (535) · 52/96 (63) · 0/192 (0) · 77/96 (83) | 261/287 (271) | 7/12 (10) | nnnn
AEk3 | hardC10 100/60/85 | 131/384 (137) · 266/768 (268) | 513/575 (535) · 52/96 (63) · 0/192 (0) · 77/96 (83) | 261/287 (271) | 7/12 (10) | Ynnn
AEk3 | hardC20 100/60/85 | 135/384 (137) · 274/768 (268) | 513/575 (535) · 52/96 (63) · 0/192 (0) · 77/96 (83) | 261/287 (271) | 7/12 (10) | Ynnn
AEr | hardC10 100/60/85 | 135/384 (137) · 278/768 (268) | 516/575 (535) · 53/96 (63) · 0/192 (0) · 77/96 (83) | 261/287 (271) | 7/12 (10) | Ynnn
AEr | hardC20 100/60/85 | 160/384 (137) · 307/768 (268) | 516/575 (535) · 53/96 (63) · 0/192 (0) · 77/96 (83) | 261/287 (271) | 7/12 (10) | nnnn
Cp660 | hardC10 100/60/85 | 384/384 (137) · 506/768 (268) | 547/575 (535) · 24/96 (63) · 67/192 (0) · 85/96 (83) | 280/287 (271) | 12/12 (10) | nnYY
Cp660 | hardC20 100/60/85 | 384/384 (137) · 468/768 (268) | 544/575 (535) · 32/96 (63) · 53/192 (0) · 90/96 (83) | 281/287 (271) | 11/12 (10) | nnYY
CpE660 | hardC10 100/60/85 | 201/384 (137) · 330/768 (268) | 535/575 (535) · 57/96 (63) · 10/192 (0) · 82/96 (83) | 271/287 (271) | 10/12 (10) | nnYY
CpE660 | hardC20 100/60/85 | 215/384 (137) · 385/768 (268) | 530/575 (535) · 59/96 (63) · 2/192 (0) · 82/96 (83) | 269/287 (271) | 11/12 (10) | nnYY
CpAE | hardC10 100/60/85 | 130/384 (137) · 265/768 (268) | 513/575 (535) · 51/96 (63) · 0/192 (0) · 77/96 (83) | 261/287 (271) | 7/12 (10) | Ynnn
CpAE | hardC20 100/60/85 | 139/384 (137) · 284/768 (268) | 513/575 (535) · 51/96 (63) · 0/192 (0) · 77/96 (83) | 261/287 (271) | 7/12 (10) | Ynnn
Ab5bs | hardC10 100/60/85 | 148/384 (137) · 283/768 (268) | 520/575 (535) · 54/96 (63) · 0/192 (0) · 77/96 (83) | 261/287 (271) | 7/12 (10) | nnnn
Ab5bs | hardC20 100/60/85 | 234/384 (137) · 374/768 (268) | 520/575 (535) · 54/96 (63) · 0/192 (0) · 77/96 (83) | 261/287 (271) | 7/12 (10) | nnnn
B660 | hardC10 100/60/85 | 384/384 (137) · 510/768 (268) | 545/575 (535) · 6/96 (63) · 86/192 (0) · 89/96 (83) | 281/287 (271) | 10/12 (10) | nnYY
B660 | hardC20 100/60/85 | 384/384 (137) · 504/768 (268) | 548/575 (535) · 0/96 (63) · 96/192 (0) · 90/96 (83) | 287/287 (271) | 12/12 (10) | nnYY
k660 | hardQ20 100/60/85 | 384/384 (0) · 384/768 (0) | 551/576 (546) · 0/96 (71) · 96/192 (0) · 92/96 (87) | 288/288 (277) | 12/12 (11) | nnYY
E660k2 | hardQ20 100/60/85 | 72/384 (0) · 128/768 (0) | 545/576 (546) · 64/96 (71) · 9/192 (0) · 88/96 (87) | 276/288 (277) | 11/12 (11) | nnYY
E660k3 | hardQ20 100/60/85 | 41/384 (0) · 66/768 (0) | 545/576 (546) · 65/96 (71) · 6/192 (0) · 87/96 (87) | 275/288 (277) | 11/12 (11) | nnYY
E660k3r | hardQ20 100/60/85 | 164/384 (0) · 197/768 (0) | 542/576 (546) · 42/96 (71) · 32/192 (0) · 88/96 (87) | 277/288 (277) | 11/12 (11) | nnYY
AE | hardQ20 100/60/85 | 131/384 (0) · 142/768 (0) | 527/576 (546) · 59/96 (71) · 0/192 (0) · 85/96 (87) | 271/288 (277) | 10/12 (11) | nnnn
AEk3 | hardQ20 100/60/85 | 37/384 (0) · 42/768 (0) | 527/576 (546) · 59/96 (71) · 0/192 (0) · 85/96 (87) | 271/288 (277) | 10/12 (11) | nnnn
AEr | hardQ20 100/60/85 | 171/384 (0) · 182/768 (0) | 527/576 (546) · 59/96 (71) · 0/192 (0) · 85/96 (87) | 271/288 (277) | 10/12 (11) | nnnn
Cp660 | hardQ20 100/60/85 | 384/384 (0) · 384/768 (0) | 547/576 (546) · 42/96 (71) · 35/192 (0) · 91/96 (87) | 282/288 (277) | 11/12 (11) | nnYY
CpE660 | hardQ20 100/60/85 | 140/384 (0) · 439/768 (0) | 537/576 (546) · 67/96 (71) · 3/192 (0) · 86/96 (87) | 271/288 (277) | 11/12 (11) | nnYn
CpAE | hardQ20 100/60/85 | 121/384 (0) · 133/768 (0) | 528/576 (546) · 60/96 (71) · 0/192 (0) · 85/96 (87) | 272/288 (277) | 10/12 (11) | nnnn
Ab5bs | hardQ20 100/60/85 | 383/384 (0) · 383/768 (0) | 527/576 (546) · 59/96 (71) · 0/192 (0) · 85/96 (87) | 271/288 (277) | 10/12 (11) | nnnn
B660 | hardQ20 100/60/85 | 384/384 (0) · 384/768 (0) | 551/576 (546) · 0/96 (71) · 96/192 (0) · 92/96 (87) | 288/288 (277) | 12/12 (11) | nnYY
k660 | realish 85 | 128/128 (0) · 128/256 (0) | 178/192 (175) · 1/32 (18) · 29/64 (0) · 29/32 (29) | 94/96 (91) | 4/4 (4) | nnYY
k660 | realish35 85 | 128/128 (0) · 128/256 (0) | 176/192 (175) · 0/32 (18) · 32/64 (0) · 31/32 (29) | 96/96 (91) | 4/4 (4) | nnYY
E660k2 | realish 85 | 1/128 (0) · 5/256 (0) | 176/192 (175) · 19/32 (18) · 1/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | YYYY
E660k2 | realish35 85 | 1/128 (0) · 20/256 (0) | 176/192 (175) · 16/32 (18) · 5/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | YnYY
E660k3 | realish 85 | 0/128 (0) · 0/256 (0) | 176/192 (175) · 18/32 (18) · 1/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | YYYY
E660k3 | realish35 85 | 0/128 (0) · 0/256 (0) | 177/192 (175) · 17/32 (18) · 2/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | YnYY
E660k3r | realish 85 | 48/128 (0) · 48/256 (0) | 176/192 (175) · 18/32 (18) · 1/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | nYYY
E660k3r | realish35 85 | 48/128 (0) · 48/256 (0) | 177/192 (175) · 10/32 (18) · 14/64 (0) · 30/32 (29) | 93/96 (91) | 4/4 (4) | nnYY
AE | realish 85 | 0/128 (0) · 0/256 (0) | 168/192 (175) · 12/32 (18) · 0/64 (0) · 28/32 (29) | 87/96 (91) | 4/4 (4) | YnYn
AE | realish35 85 | 0/128 (0) · 0/256 (0) | 168/192 (175) · 12/32 (18) · 0/64 (0) · 28/32 (29) | 87/96 (91) | 4/4 (4) | YnYn
AEk3 | realish 85 | 0/128 (0) · 0/256 (0) | 168/192 (175) · 12/32 (18) · 0/64 (0) · 28/32 (29) | 87/96 (91) | 4/4 (4) | YnYn
AEk3 | realish35 85 | 0/128 (0) · 0/256 (0) | 168/192 (175) · 12/32 (18) · 0/64 (0) · 28/32 (29) | 87/96 (91) | 4/4 (4) | YnYn
AEr | realish 85 | 7/128 (0) · 7/256 (0) | 168/192 (175) · 12/32 (18) · 0/64 (0) · 28/32 (29) | 87/96 (91) | 4/4 (4) | nnYn
AEr | realish35 85 | 48/128 (0) · 48/256 (0) | 168/192 (175) · 12/32 (18) · 0/64 (0) · 28/32 (29) | 87/96 (91) | 4/4 (4) | nnYn
Cp660 | realish 85 | 104/128 (0) · 104/256 (0) | 176/192 (175) · 19/32 (18) · 0/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | nYYY
Cp660 | realish35 85 | 128/128 (0) · 128/256 (0) | 176/192 (175) · 19/32 (18) · 0/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | nYYY
CpE660 | realish 85 | 22/128 (0) · 22/256 (0) | 176/192 (175) · 19/32 (18) · 0/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | nYYY
CpE660 | realish35 85 | 38/128 (0) · 38/256 (0) | 176/192 (175) · 19/32 (18) · 0/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | nYYY
CpAE | realish 85 | 0/128 (0) · 0/256 (0) | 168/192 (175) · 12/32 (18) · 0/64 (0) · 28/32 (29) | 87/96 (91) | 4/4 (4) | YnYn
CpAE | realish35 85 | 0/128 (0) · 0/256 (0) | 168/192 (175) · 12/32 (18) · 0/64 (0) · 28/32 (29) | 87/96 (91) | 4/4 (4) | YnYn
Ab5bs | realish 85 | 13/128 (0) · 13/256 (0) | 168/192 (175) · 12/32 (18) · 0/64 (0) · 28/32 (29) | 87/96 (91) | 4/4 (4) | nnYn
Ab5bs | realish35 85 | 128/128 (0) · 128/256 (0) | 168/192 (175) · 12/32 (18) · 0/64 (0) · 28/32 (29) | 87/96 (91) | 4/4 (4) | nnYn
B660 | realish 85 | 128/128 (0) · 128/256 (0) | 175/192 (175) · 0/32 (18) · 29/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | nnYY
B660 | realish35 85 | 128/128 (0) · 128/256 (0) | 176/192 (175) · 0/32 (18) · 32/64 (0) · 31/32 (29) | 96/96 (91) | 4/4 (4) | nnYY
k660 | hard20 100/60/85 | 383/384 (324) · 704/768 (648) | 548/575 (533) · 0/96 (16) · 141/192 (92) · 91/96 (85) | 288/288 (267) | 12/12 (12) | nnYY
E660k2 | hard20 100/60/85 | 259/384 (324) · 562/768 (648) | 520/575 (533) · 16/96 (16) · 81/192 (92) · 83/96 (85) | 249/288 (267) | 12/12 (12) | YnYn
E660k3 | hard20 100/60/85 | 251/384 (324) · 537/768 (648) | 512/575 (533) · 17/96 (16) · 85/192 (92) · 76/96 (85) | 239/288 (267) | 12/12 (12) | YnYn
E660k3r | hard20 100/60/85 | 291/384 (324) · 560/768 (648) | 517/575 (533) · 20/96 (16) · 84/192 (92) · 81/96 (85) | 266/288 (267) | 12/12 (12) | YnYY
AE | hard20 100/60/85 | 259/384 (324) · 573/768 (648) | 493/575 (533) · 11/96 (16) · 81/192 (92) · 79/96 (85) | 235/288 (267) | 11/12 (12) | Ynnn
AEk3 | hard20 100/60/85 | 244/384 (324) · 550/768 (648) | 491/575 (533) · 13/96 (16) · 81/192 (92) · 77/96 (85) | 230/288 (267) | 10/12 (12) | Ynnn
AEr | hard20 100/60/85 | 273/384 (324) · 587/768 (648) | 507/575 (533) · 10/96 (16) · 84/192 (92) · 81/96 (85) | 250/288 (267) | 12/12 (12) | YnYn
Cp660 | hard20 100/60/85 | 378/384 (324) · 702/768 (648) | 549/575 (533) · 1/96 (16) · 138/192 (92) · 93/96 (85) | 286/288 (267) | 12/12 (12) | nnYY
CpE660 | hard20 100/60/85 | 258/384 (324) · 557/768 (648) | 515/575 (533) · 15/96 (16) · 79/192 (92) · 83/96 (85) | 250/288 (267) | 12/12 (12) | YnYn
CpAE | hard20 100/60/85 | 262/384 (324) · 575/768 (648) | 495/575 (533) · 10/96 (16) · 82/192 (92) · 78/96 (85) | 236/288 (267) | 10/12 (12) | Ynnn
Ab5bs | hard20 100/60/85 | 328/384 (324) · 653/768 (648) | 517/575 (533) · 10/96 (16) · 93/192 (92) · 84/96 (85) | 259/288 (267) | 12/12 (12) | nnYn
B660 | hard20 100/60/85 | 383/384 (324) · 703/768 (648) | 547/575 (533) · 0/96 (16) · 142/192 (92) · 90/96 (85) | 288/288 (267) | 12/12 (12) | nnYY

### extra.json (E on a designed click, one factor at a time)
candidate | condition | (i) nothing played: beat slots heard / all slots heard | (ii) right: strums heard (no click) · bars right (no click) · false extras in rests (no click) · chords ok (no click) | (iv) strums on a click heard (no click) | (iii) extra on "3" caught (no click) | goals i ii iii iv
Eb5k2 | class 85 | 30/96 (33) · 56/192 (62) | 138/144 (138) · 19/24 (19) · 0/48 (0) · 22/24 (22) | 71/72 (71) | 3/3 (3) | YYYY
Eb5k3 | class 85 | 30/96 (33) · 55/192 (62) | 138/144 (138) · 19/24 (19) · 0/48 (0) · 22/24 (22) | 71/72 (71) | 3/3 (3) | YYYY
Eb4400k2 | class 85 | 31/96 (33) · 58/192 (62) | 138/144 (138) · 19/24 (19) · 0/48 (0) · 22/24 (22) | 71/72 (71) | 3/3 (3) | YYYY
Eb5k2 | bpm100 100 | 0/96 (0) · 0/192 (0) | 126/144 (128) · 10/24 (11) · 0/48 (0) · 15/24 (17) | 61/72 (63) | 3/3 (3) | YnYn
Eb5k3 | bpm100 100 | 0/96 (0) · 0/192 (0) | 125/144 (128) · 10/24 (11) · 0/48 (0) · 14/24 (17) | 60/72 (63) | 3/3 (3) | YnYn
Eb4400k2 | bpm100 100 | 0/96 (0) · 0/192 (0) | 126/144 (128) · 10/24 (11) · 0/48 (0) · 15/24 (17) | 61/72 (63) | 3/3 (3) | YnYn
Eb5k2 | bpm60 60 | 0/96 (0) · 0/192 (0) | 144/144 (144) · 24/24 (24) · 0/48 (0) · 23/24 (23) | 72/72 (72) | 2/3 (3) | YYnY
Eb5k3 | bpm60 60 | 0/96 (0) · 0/192 (0) | 144/144 (144) · 24/24 (24) · 0/48 (0) · 23/24 (23) | 72/72 (72) | 2/3 (3) | YYnY
Eb4400k2 | bpm60 60 | 0/96 (0) · 0/192 (0) | 144/144 (144) · 24/24 (24) · 0/48 (0) · 23/24 (23) | 72/72 (72) | 2/3 (3) | YYnY
Eb5k2 | base 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k2 | lvl03 85 | 0/96 (0) · 0/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
Eb5k2 | lvl20 85 | 0/96 (0) · 0/192 (0) | 126/144 (131) · 11/24 (13) · 0/48 (0) · 20/24 (22) | 63/72 (68) | 3/3 (3) | YnYn
Eb5k2 | lvl35 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 12/24 (13) · 0/48 (0) · 20/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Eb5k2 | jit01 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k2 | jit05 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k2 | jit2 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k2 | delay 85 | 0/96 (0) · 0/192 (0) | 132/144 (131) · 14/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
Eb5k2 | echo 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 11/24 (13) · 0/48 (0) · 20/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Eb5k2 | nl 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k2 | flat 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k2 | vary 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k2 | fps20 85 | 0/96 (0) · 0/192 (0) | 122/144 (127) · 9/24 (12) · 0/48 (0) · 18/24 (21) | 59/72 (65) | 3/3 (3) | YnYn
Eb5k2 | map3 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k2 | map10 85 | 30/96 (0) · 30/192 (0) | 130/144 (131) · 13/24 (13) · 0/48 (0) · 21/24 (22) | 67/72 (68) | 3/3 (3) | nYYY
Eb5k3 | base 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 12/24 (13) · 0/48 (0) · 20/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k3 | lvl03 85 | 0/96 (0) · 0/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
Eb5k3 | lvl20 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 12/24 (13) · 0/48 (0) · 20/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Eb5k3 | lvl35 85 | 0/96 (0) · 0/192 (0) | 126/144 (131) · 11/24 (13) · 0/48 (0) · 20/24 (22) | 63/72 (68) | 3/3 (3) | YnYn
Eb5k3 | jit01 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 12/24 (13) · 0/48 (0) · 20/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k3 | jit05 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 11/24 (13) · 0/48 (0) · 20/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Eb5k3 | jit2 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 11/24 (13) · 0/48 (0) · 20/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Eb5k3 | delay 85 | 0/96 (0) · 0/192 (0) | 132/144 (131) · 14/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
Eb5k3 | echo 85 | 0/96 (0) · 0/192 (0) | 125/144 (131) · 10/24 (13) · 0/48 (0) · 20/24 (22) | 62/72 (68) | 3/3 (3) | YnYn
Eb5k3 | nl 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 11/24 (13) · 0/48 (0) · 20/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Eb5k3 | flat 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 12/24 (13) · 0/48 (0) · 20/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k3 | vary 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 11/24 (13) · 0/48 (0) · 20/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Eb5k3 | fps20 85 | 0/96 (0) · 0/192 (0) | 125/144 (127) · 9/24 (12) · 0/48 (0) · 19/24 (21) | 61/72 (65) | 3/3 (3) | YnYn
Eb5k3 | map3 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 12/24 (13) · 0/48 (0) · 20/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb5k3 | map10 85 | 19/96 (0) · 19/192 (0) | 128/144 (131) · 12/24 (13) · 0/48 (0) · 20/24 (22) | 65/72 (68) | 3/3 (3) | nnYn
Eb4400k2 | base 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb4400k2 | lvl03 85 | 0/96 (0) · 0/192 (0) | 131/144 (131) · 13/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
Eb4400k2 | lvl20 85 | 0/96 (0) · 0/192 (0) | 129/144 (131) · 12/24 (13) · 0/48 (0) · 21/24 (22) | 66/72 (68) | 3/3 (3) | YnYn
Eb4400k2 | lvl35 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 12/24 (13) · 0/48 (0) · 20/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Eb4400k2 | jit01 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb4400k2 | jit05 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb4400k2 | jit2 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb4400k2 | delay 85 | 0/96 (0) · 0/192 (0) | 132/144 (131) · 14/24 (13) · 0/48 (0) · 22/24 (22) | 68/72 (68) | 3/3 (3) | YYYY
Eb4400k2 | echo 85 | 0/96 (0) · 0/192 (0) | 127/144 (131) · 11/24 (13) · 0/48 (0) · 20/24 (22) | 64/72 (68) | 3/3 (3) | YnYn
Eb4400k2 | nl 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb4400k2 | flat 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb4400k2 | vary 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb4400k2 | fps20 85 | 0/96 (0) · 0/192 (0) | 124/144 (127) · 10/24 (12) · 0/48 (0) · 19/24 (21) | 61/72 (65) | 3/3 (3) | YnYn
Eb4400k2 | map3 85 | 0/96 (0) · 0/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | YnYn
Eb4400k2 | map10 85 | 30/96 (0) · 30/192 (0) | 128/144 (131) · 11/24 (13) · 0/48 (0) · 21/24 (22) | 65/72 (68) | 3/3 (3) | nnYn
E660k3r | base 85 | 0/96 (0) · 0/192 (0) | 132/144 (131) · 14/24 (13) · 0/48 (0) · 23/24 (22) | 69/72 (68) | 3/3 (3) | YYYY
E660k3r | map10 85 | 9/96 (0) · 9/192 (0) | 132/144 (131) · 14/24 (13) · 0/48 (0) · 23/24 (22) | 69/72 (68) | 3/3 (3) | nYYY
Eb5k2 | ci 85 | 0/96 (0) · 0/192 (0) | 139/144 (139) · 20/24 (20) · 0/48 (0) · 22/24 (22) | 70/72 (70) | 3/3 (2) | YYYY
Eb5k3 | ci 85 | 0/96 (0) · 0/192 (0) | 137/144 (139) · 19/24 (20) · 0/48 (0) · 21/24 (22) | 68/72 (70) | 2/3 (2) | YnYn
Eb4400k2 | ci 85 | 0/96 (0) · 0/192 (0) | 139/144 (139) · 20/24 (20) · 0/48 (0) · 22/24 (22) | 70/72 (70) | 2/3 (2) | YYYY
E660k3r | ci 85 | 0/96 (0) · 0/192 (0) | 137/144 (139) · 18/24 (20) · 0/48 (0) · 22/24 (22) | 70/72 (70) | 2/3 (2) | YnYY
Eb5k2 | room7 85 | 76/96 (84) · 154/192 (167) | 126/144 (131) · 4/24 (8) · 21/48 (21) · 15/24 (17) | 58/72 (63) | 3/3 (3) | YnYn
Eb5k3 | room7 85 | 72/96 (84) · 151/192 (167) | 120/144 (131) · 2/24 (8) · 19/48 (21) · 14/24 (17) | 52/72 (63) | 3/3 (3) | YnYn
Eb4400k2 | room7 85 | 76/96 (84) · 154/192 (167) | 127/144 (131) · 4/24 (8) · 21/48 (21) · 15/24 (17) | 59/72 (63) | 3/3 (3) | YnYn

### extrahard.json + extrahard2.json (the hard rows again, frame timing +-3 ms)
candidate | condition | (i) nothing played: beat slots heard / all slots heard | (ii) right: strums heard (no click) · bars right (no click) · false extras in rests (no click) · chords ok (no click) | (iv) strums on a click heard (no click) | (iii) extra on "3" caught (no click) | goals i ii iii iv
Eb5k2 | hardC10 100/60/85 | 157/384 (137) · 329/768 (268) | 532/575 (535) · 62/96 (63) · 0/192 (0) · 85/96 (83) | 271/287 (271) | 10/12 (10) | nYYY
Eb5k2 | hardC20 100/60/85 | 157/384 (137) · 338/768 (268) | 533/575 (535) · 59/96 (63) · 5/192 (0) · 84/96 (83) | 271/287 (271) | 10/12 (10) | nnYY
Eb5k2 | hardC20m3 100/60/85 | 140/384 (137) · 315/768 (268) | 533/575 (535) · 61/96 (63) · 2/192 (0) · 84/96 (83) | 271/287 (271) | 10/12 (10) | YnYY
Eb5k3 | hardC10 100/60/85 | 150/384 (137) · 295/768 (268) | 531/575 (535) · 61/96 (63) · 0/192 (0) · 85/96 (83) | 271/287 (271) | 10/12 (10) | nYYY
Eb5k3 | hardC20 100/60/85 | 144/384 (137) · 287/768 (268) | 532/575 (535) · 61/96 (63) · 0/192 (0) · 84/96 (83) | 271/287 (271) | 10/12 (10) | nYYY
Eb5k3 | hardC20m3 100/60/85 | 137/384 (137) · 282/768 (268) | 533/575 (535) · 62/96 (63) · 0/192 (0) · 84/96 (83) | 271/287 (271) | 10/12 (10) | YYYY
Eb5k2 | hardQ20m3n 100/60/85 | 28/384 (0) · 42/768 (0) | 537/576 (538) · 62/96 (65) · 4/192 (0) · 84/96 (84) | 269/288 (269) | 12/12 (12) | nnYY
Eb5k3 | hardQ20m3n 100/60/85 | 0/384 (0) · 3/768 (0) | 540/576 (538) · 65/96 (65) · 3/192 (0) · 84/96 (84) | 269/288 (269) | 12/12 (12) | YnYY
Eb5k2 | hardQ20 100/60/85 | 67/384 (0) · 246/768 (0) | 546/576 (546) · 65/96 (71) · 6/192 (0) · 86/96 (87) | 277/288 (277) | 12/12 (11) | nnYY
Eb5k2 | hardQ20m3 100/60/85 | 82/384 (0) · 204/768 (0) | 546/576 (546) · 67/96 (71) · 4/192 (0) · 86/96 (87) | 277/288 (277) | 11/12 (11) | nnYY
Eb5k2 | hardQ35m3 100/60/85 | 50/384 (0) · 193/768 (0) | 547/576 (546) · 63/96 (71) · 9/192 (0) · 88/96 (87) | 278/288 (277) | 12/12 (11) | nnYY
Eb5k3 | hardQ20 100/60/85 | 26/384 (0) · 79/768 (0) | 546/576 (546) · 69/96 (71) · 3/192 (0) · 86/96 (87) | 277/288 (277) | 11/12 (11) | nnYY
Eb5k3 | hardQ20m3 100/60/85 | 4/384 (0) · 29/768 (0) | 546/576 (546) · 68/96 (71) · 4/192 (0) · 86/96 (87) | 277/288 (277) | 11/12 (11) | nnYY
Eb5k3 | hardQ35m3 100/60/85 | 6/384 (0) · 26/768 (0) | 545/576 (546) · 68/96 (71) · 4/192 (0) · 86/96 (87) | 276/288 (277) | 11/12 (11) | nnYY
Eb5k2 | realish 85 | 0/128 (0) · 2/256 (0) | 176/192 (175) · 19/32 (18) · 0/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | YYYY
Eb5k2 | realish35 85 | 0/128 (0) · 3/256 (0) | 176/192 (175) · 19/32 (18) · 0/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | YYYY
Eb5k3 | realish 85 | 0/128 (0) · 0/256 (0) | 176/192 (175) · 19/32 (18) · 0/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | YYYY
Eb5k3 | realish35 85 | 0/128 (0) · 0/256 (0) | 176/192 (175) · 19/32 (18) · 0/64 (0) · 29/32 (29) | 91/96 (91) | 4/4 (4) | YYYY
E660k2 | hardC20m3 100/60/85 | 148/384 (137) · 273/768 (268) | 534/575 (535) · 63/96 (63) · 0/192 (0) · 82/96 (83) | 271/287 (271) | 10/12 (10) | nYYY
E660k3 | hardC20m3 100/60/85 | 139/384 (137) · 254/768 (268) | 535/575 (535) · 62/96 (63) · 0/192 (0) · 83/96 (83) | 272/287 (271) | 10/12 (10) | YYYY
AEk3 | hardC20m3 100/60/85 | 133/384 (137) · 266/768 (268) | 513/575 (535) · 52/96 (63) · 0/192 (0) · 77/96 (83) | 261/287 (271) | 7/12 (10) | Ynnn
k660 | hardC20m3 100/60/85 | 384/384 (137) · 501/768 (268) | 548/575 (535) · 0/96 (63) · 96/192 (0) · 89/96 (83) | 287/287 (271) | 12/12 (10) | nnYY
E660k2 | hardQ20m3n 100/60/85 | 9/384 (0) · 25/768 (0) | 540/576 (538) · 65/96 (65) · 2/192 (0) · 84/96 (84) | 269/288 (269) | 12/12 (12) | nnYY
E660k3 | hardQ20m3n 100/60/85 | 0/384 (0) · 1/768 (0) | 540/576 (538) · 65/96 (65) · 3/192 (0) · 84/96 (84) | 269/288 (269) | 12/12 (12) | YnYY
AEk3 | hardQ20m3n 100/60/85 | 0/384 (0) · 0/768 (0) | 521/576 (538) · 49/96 (65) · 0/192 (0) · 81/96 (84) | 260/288 (269) | 12/12 (12) | YnYn
k660 | hardQ20m3n 100/60/85 | 384/384 (0) · 384/768 (0) | 551/576 (538) · 0/96 (65) · 96/192 (0) · 91/96 (84) | 288/288 (269) | 12/12 (12) | nnYY
E660k2 | hardQ20m3 100/60/85 | 16/384 (0) · 47/768 (0) | 547/576 (546) · 69/96 (71) · 3/192 (0) · 89/96 (87) | 277/288 (277) | 11/12 (11) | nnYY
E660k2 | hardQ35m3 100/60/85 | 17/384 (0) · 56/768 (0) | 546/576 (546) · 68/96 (71) · 4/192 (0) · 88/96 (87) | 276/288 (277) | 11/12 (11) | nnYY
E660k3 | hardQ20m3 100/60/85 | 0/384 (0) · 8/768 (0) | 545/576 (546) · 68/96 (71) · 3/192 (0) · 87/96 (87) | 275/288 (277) | 11/12 (11) | YnYY
E660k3 | hardQ35m3 100/60/85 | 0/384 (0) · 9/768 (0) | 546/576 (546) · 68/96 (71) · 6/192 (0) · 87/96 (87) | 275/288 (277) | 11/12 (11) | YnYY
AEk3 | hardQ20m3 100/60/85 | 0/384 (0) · 0/768 (0) | 527/576 (546) · 59/96 (71) · 0/192 (0) · 85/96 (87) | 271/288 (277) | 10/12 (11) | Ynnn
AEk3 | hardQ35m3 100/60/85 | 1/384 (0) · 9/768 (0) | 527/576 (546) · 59/96 (71) · 0/192 (0) · 85/96 (87) | 271/288 (277) | 10/12 (11) | Ynnn
k660 | hardQ20m3 100/60/85 | 384/384 (0) · 384/768 (0) | 551/576 (546) · 0/96 (71) · 96/192 (0) · 92/96 (87) | 288/288 (277) | 12/12 (11) | nnYY
k660 | hardQ35m3 100/60/85 | 384/384 (0) · 384/768 (0) | 544/576 (546) · 0/96 (71) · 96/192 (0) · 92/96 (87) | 288/288 (277) | 12/12 (11) | nnYY

### takes.txt (J01-J03)
 0 as today (no click, nothing on)
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 42, 29]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 16/46, bars 5, chords 17/23, wrong caught 0/1
 1 (a) E k2 J3, template from the real count-in
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 41, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 17/46, bars 5, chords 17/23, wrong caught 0/1
 2 (a) E k3 J4
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 26/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 41, 28]
    3 takes at the kept clock: strums 100/138 (worst clock 99), on-beat 52/69, extras 17/46, bars 5, chords 17/23, wrong caught 0/1
 3 (a) stop filter bs at 3520 only
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 42, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 16/46, bars 5, chords 17/23, wrong caught 0/1
 4 (a) A'+E: b3520r5 count-in (realish 0.1), bs, E k2
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 16/16 · bars 0 · ch 4/8 [±20: 42, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 19/46, bars 5, chords 17/23, wrong caught 0/1
 5 (a) B 1.3 at every beat
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 30/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 27, 27]
    J03: 26/48 on-beat 11/24 · x 12/16 · bars 0 · ch 3/8 [±20: 26, 26]
    3 takes at the kept clock: strums 99/138 (worst clock 95), on-beat 51/69, extras 15/46, bars 5, chords 16/23, wrong caught 0/1
 6 (a) C' 660 (no round click to remove)
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 29, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 16/46, bars 5, chords 17/23, wrong caught 0/1
 7 (b) real-click replay, nothing done
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 7/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 37/48 on-beat 24/24 · x 14/16 · bars 0 · ch 7/8 [±20: 36, 38]
    3 takes at the kept clock: strums 111/138 (worst clock 109), on-beat 64/69, extras 17/46, bars 5, chords 21/23, wrong caught 0/1
 8 (b) real-click replay, E k2 J3
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 7/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 41, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 17/46, bars 5, chords 18/23, wrong caught 0/1
 9 (b) real-click replay, E k3 J4
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 7/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 26/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 41, 28]
    3 takes at the kept clock: strums 100/138 (worst clock 99), on-beat 52/69, extras 17/46, bars 5, chords 18/23, wrong caught 0/1
10 (b) real-click replay +4.3 ms round offset, E k3 J4
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 7/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 41, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 17/46, bars 5, chords 18/23, wrong caught 0/1
11 (b) real-click replay, C'
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 43/48 on-beat 24/24 · x 0/16 · bars 3 · ch 8/8 [±20: 42, 28]
    3 takes at the kept clock: strums 117/138 (worst clock 101), on-beat 64/69, extras 3/46, bars 8, chords 21/23, wrong caught 0/1
12 (b) real-click replay, C'+E k2
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 16/16 · bars 0 · ch 4/8 [±20: 28, 29]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 20/46, bars 5, chords 17/23, wrong caught 0/1
13 (b) real-click replay, B 1.3
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 7/7 w0/1 [±20: 42, 42]
    J02: 30/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 27, 27]
    J03: 32/48 on-beat 19/24 · x 14/16 · bars 0 · ch 6/8 [±20: 25, 36]
    3 takes at the kept clock: strums 105/138 (worst clock 94), on-beat 59/69, extras 17/46, bars 5, chords 20/23, wrong caught 0/1
14 (b) b3520r5 realish 0.1, nothing done
    J01: 44/48 on-beat 24/24 · x 8/16 · bars 0 · ch 7/7 w0/1 [±20: 44, 44]
    J02: 34/42 on-beat 21/21 · x 11/14 · bars 0 · ch 7/8 [±20: 33, 32]
    J03: 37/48 on-beat 24/24 · x 15/16 · bars 0 · ch 7/8 [±20: 37, 38]
    3 takes at the kept clock: strums 115/138 (worst clock 113), on-beat 69/69, extras 34/46, bars 0, chords 21/23, wrong caught 0/1
15 (b) b3520r5 realish 0.1, A' bs
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 42, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 16/46, bars 5, chords 17/23, wrong caught 0/1
16 (b) b3520r5 realish 0.1, A'+E k2
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 16/16 · bars 0 · ch 4/8 [±20: 42, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 19/46, bars 5, chords 17/23, wrong caught 0/1
17 (b) b3520r5 realish 0.2, A'+E k2
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 16/16 · bars 0 · ch 4/8 [±20: 42, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 19/46, bars 5, chords 17/23, wrong caught 0/1
18 (b) b3520r5 hard 0.2 (jit 2 ms, nl 3), A'+E k2
    J01: 43/48 on-beat 23/24 · x 1/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 16/16 · bars 0 · ch 4/8 [±20: 42, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 19/46, bars 5, chords 17/23, wrong caught 0/1
19 (b) b3520r5 hard 0.2, A'+E k3
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 16/16 · bars 0 · ch 4/8 [±20: 42, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 20/46, bars 5, chords 17/23, wrong caught 0/1
20 (a) E k3 J4 + refresh on slot 4
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 26/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 41, 28]
    3 takes at the kept clock: strums 100/138 (worst clock 99), on-beat 52/69, extras 17/46, bars 5, chords 17/23, wrong caught 0/1
21 (b) real-click replay, E k3 J4 + refresh
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 7/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 41, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 17/46, bars 5, chords 18/23, wrong caught 0/1
22 (a) E k2 on a b3520r5 count-in (realish 0.1), no stop filter
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 6/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 42, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 17/46, bars 5, chords 17/23, wrong caught 0/1
23 (b) b3520r5 realish 0.1, E k2, no stop filter
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 7/7 w0/1 [±20: 42, 42]
    J02: 31/42 on-beat 17/21 · x 2/14 · bars 1 · ch 7/8 [±20: 32, 32]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 42, 28]
    3 takes at the kept clock: strums 101/138 (worst clock 100), on-beat 52/69, extras 17/46, bars 5, chords 18/23, wrong caught 0/1
24 (b) b3520r5 realish 0.2, E k2, no stop filter
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 7/7 w0/1 [±20: 42, 42]
    J02: 32/42 on-beat 18/21 · x 2/14 · bars 1 · ch 6/8 [±20: 33, 31]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 27, 27]
    3 takes at the kept clock: strums 102/138 (worst clock 100), on-beat 53/69, extras 17/46, bars 5, chords 17/23, wrong caught 0/1
25 (b) b3520r5 hard 0.2, E k2, no stop filter
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 7/7 w0/1 [±20: 42, 42]
    J02: 32/42 on-beat 18/21 · x 2/14 · bars 1 · ch 6/8 [±20: 33, 31]
    J03: 27/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 27, 27]
    3 takes at the kept clock: strums 102/138 (worst clock 100), on-beat 53/69, extras 17/46, bars 5, chords 17/23, wrong caught 0/1
26 (b) b3520r5 hard 0.2, E k3, no stop filter
    J01: 43/48 on-beat 23/24 · x 2/16 · bars 4 · ch 7/7 w0/1 [±20: 42, 42]
    J02: 23/42 on-beat 11/21 · x 10/14 · bars 0 · ch 5/8 [±20: 33, 32]
    J03: 26/48 on-beat 12/24 · x 13/16 · bars 0 · ch 4/8 [±20: 42, 28]
    3 takes at the kept clock: strums 92/138 (worst clock 91), on-beat 46/69, extras 25/46, bars 4, chords 16/23, wrong caught 0/1

### click-probe on J01-J03

J01: 85 BPM, 24000 Hz recording (the page's mic ran at 44100 Hz), round clicks not in it (1 of 32 beats had a 660 Hz click; --clicks=auto); delay from the saved schedule to the first click: 173.0 ms
  click        f  found  arrival jitter(us) [line]  side  peak(raw)  room    SNR(dB)  det.ratio lvl/HF  h2(dB) h3(dB) >1.5k(dB) tail(dB)  E left at arrival / at schedule   C left dB at arrival / at schedule
  count-in 1    660  yes        -1.3 [    0.6]   0.66    0.078  0.002    31.2    13.99 / 35.65    -31.3  -33.8    -27.2   -115.4   1.02/1.02 k>0.92  1.02/1.02   -135.6 / -135.6 (first 80 ms -135.7, gain 0.94)
  count-in 2    660  yes        -1.2 [   -1.2]   0.68    0.088  0.001    35.3    23.28 / 22.66    -30.8  -33.7    -25.5    -12.9   4.91/2.08 k>56.76  4.91/2.08   -11.7 / -11.7 (first 80 ms -16.4, gain 0.98)
  count-in 3    660  yes         2.5 [    0.6]   0.67    0.083  0.001    36.3    23.47 / 51.17    -27.1  -28.7    -26.2   -115.9   6.47/15.88 k>1.86  6.47/15.88   -17.3 / -17.3 (first 80 ms -20.4, gain 1.02)
  count-in 4    990  yes         0.0 [ -970.7]      -    0.111  0.001    42.0    50.24 / 141.66   -36.4  -23.9    -31.1   -119.5   -  -   - / - (first 80 ms -, gain -)
  summary: 660 Hz clicks clean 3; jitter rms 1.8 us, largest 2.5 us (against the schedule's own spacing; clock-rate difference of the free line 2.7 ppm); E margin k needed to silence: median 1.86, largest 56.76; clicks a strum test would hear alone (over 1.2 / 1.46): 4 of 4; E (J 3 ms) silences 1 of 3 at the measured arrival, 1 of 3 at the schedule's; C leaves median -17.3 dB at the measured arrival (first 80 ms: -20.4 dB), -17.3 dB at the schedule's

J02: 98 BPM, 24000 Hz recording (the page's mic ran at 44100 Hz), round clicks not in it (1 of 32 beats had a 660 Hz click; --clicks=auto); delay from the saved schedule to the first click: 188.0 ms
  click        f  found  arrival jitter(us) [line]  side  peak(raw)  room    SNR(dB)  det.ratio lvl/HF  h2(dB) h3(dB) >1.5k(dB) tail(dB)  E left at arrival / at schedule   C left dB at arrival / at schedule
  count-in 1    660  yes        -2.9 [    0.6]   0.61    0.026  0.001    24.4     7.93 / 10.21    -20.7  -21.3    -10.8   -106.8   1.25/1.05 k>1.00  1.25/1.05   -17.2 / -17.2 (first 80 ms -19.8, gain 0.89)
  count-in 2    660  yes        -1.2 [   -1.2]   0.62    0.027  0.001    23.8     6.33 / 7.60     -14.7  -19.6    -14.3   -106.5   1.03/1.04 k>0.92  1.03/1.04   -126.5 / -126.5 (first 80 ms -126.9, gain 0.87)
  count-in 3    660  yes         4.1 [    0.6]   0.64    0.029  0.001    28.6    11.57 / 14.18    -15.7  -22.2    -14.3     -5.9   4.86/6.15 k>-  4.86/6.15   -5.9 / -5.9 (first 80 ms -13.6, gain 0.98)
  count-in 4    990  yes         0.0 [-1997.8]      -    0.031  0.001    25.9     5.82 / 16.19    -20.5  -25.2    -10.8    -12.8   -  -   - / - (first 80 ms -, gain -)
  summary: 660 Hz clicks clean 3; jitter rms 3.0 us, largest 4.1 us (against the schedule's own spacing; clock-rate difference of the free line 5.7 ppm); E margin k needed to silence: median 1.00, largest -; clicks a strum test would hear alone (over 1.2 / 1.46): 4 of 4; E (J 3 ms) silences 1 of 3 at the measured arrival, 1 of 3 at the schedule's; C leaves median -17.2 dB at the measured arrival (first 80 ms: -19.8 dB), -17.2 dB at the schedule's

J03: 98 BPM, 24000 Hz recording (the page's mic ran at 44100 Hz), round clicks not in it (1 of 32 beats had a 660 Hz click; --clicks=auto); delay from the saved schedule to the first click: 186.0 ms
  click        f  found  arrival jitter(us) [line]  side  peak(raw)  room    SNR(dB)  det.ratio lvl/HF  h2(dB) h3(dB) >1.5k(dB) tail(dB)  E left at arrival / at schedule   C left dB at arrival / at schedule
  count-in 1    660  yes        -0.7 [    0.5]   0.70    0.349  0.002    43.0    38.30 / 56.18    -29.8  -36.5    -28.9    -23.8   10.37/14.30 k>1.08  10.37/14.30   -20.9 / -20.9 (first 80 ms -23.3, gain 1.04)
  count-in 2    660  yes        -1.0 [   -1.0]   0.70    0.328  0.001    49.2   124.18 / 167.34   -30.1  -34.9    -29.1    -29.9   8.82/13.62 k>1.01  8.82/13.62   -23.0 / -23.0 (first 80 ms -24.7, gain 1.00)
  count-in 3    660  yes         1.6 [    0.5]   0.70    0.327  0.001    45.7    59.06 / 138.86   -19.6  -20.7    -15.5    -27.5   2.63/6.05 k>2.67  2.63/6.05   -20.6 / -20.6 (first 80 ms -21.8, gain 0.96)
  count-in 4    990  yes         0.0 [ -994.7]      -    0.547  0.001    55.2   188.56 / 419.55   -31.3  -27.8    -29.1    -33.8   -  -   - / - (first 80 ms -, gain -)
  summary: 660 Hz clicks clean 3; jitter rms 1.2 us, largest 1.6 us (against the schedule's own spacing; clock-rate difference of the free line 1.9 ppm); E margin k needed to silence: median 1.08, largest 2.67; clicks a strum test would hear alone (over 1.2 / 1.46): 4 of 4; E (J 3 ms) silences 0 of 3 at the measured arrival, 0 of 3 at the schedule's; C leaves median -20.9 dB at the measured arrival (first 80 ms: -23.3 dB), -20.9 dB at the schedule's
```
