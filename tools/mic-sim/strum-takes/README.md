# The three real Strum Pattern check takes (J01 to J03)

Jonathan's own playing, recorded 2026-11-14 on the MacBook Air's built-in microphone with the site's local
recording mode (ca-52, the Strum Pattern check). No student is in them: a student's recording never goes in this
repo. He asked for them here (2026-11-16) so a session on either computer can replay them.

| Take | Tempo | What he says he played (`key.json`) |
|---|---|---|
| J01 | 85 BPM | Every strum played, nothing in the rests, the chords right except bar 4 (G5 where C5 is due). |
| J02 | 98 BPM | No Metronome. All right except his timing in bar 7 (left out of the strum counts). |
| J03 | 98 BPM | The Metronome's flashing dot only (no click); "close enough on all strums". |

Each take is a `.wav` (24 kHz, what the site's microphone chain heard) and a `.json` (the round's settings, the
times the check heard things at, its verdicts). No name, email or id of anyone is in them; the `.json` names the
microphone and the browser. The `answerNote` inside J01.json and J02.json still says "not yet told": it was written
before he said. `key.json` was written again on 2026-11-16 from his words in `docs/strum-check/DETAILS.md` section
20 (the file used on 2026-11-14 was not kept).

The command (headless Chrome, about a minute; `--diag`, `--sweep` and the rest are in the tool's header):

    node tools/mic-sim/strum-check-replay.mjs tools/mic-sim/strum-takes/J01.json tools/mic-sim/strum-takes/J02.json tools/mic-sim/strum-takes/J03.json --key=tools/mic-sim/strum-takes/key.json

What it printed on the Mac, 2026-11-16, on `5c5370d`'s `coach-strumcheck.js` (a Windows run should match these):

    J01  REPRODUCED (the real check, the fitted clock): slots 63 of 64 · chords 7 of 8 (rules a and b both: 6 of 8)
         against the key: strums heard 44 of 48 · false extras 1 of 16 · right chords called right 7 of 7 · wrong chords caught 0 of 1
    J02  REPRODUCED (the real check, the fitted clock): slots 50 of 64 · chords 7 of 8 (rules a and b both: 7 of 8)
         against the key: strums heard 37 of 42 · false extras 0 of 14 · right chords called right 8 of 8 · wrong chords caught 0 of 0
    J03  REPRODUCED (the real check, the fitted clock): slots 30 of 64 · chords 4 of 8 (rules a and b both: 3 of 8)
         against the key: strums heard 45 of 48 · false extras 0 of 16 · right chords called right 6 of 8 · wrong chords caught 0 of 0

Kept clocks: J01 -117.5 ms, J02 -70.8 ms, J03 -75.2 ms. The copies in the Mac's `Claude outputs/takes-anon/` are
the same files, byte for byte.
