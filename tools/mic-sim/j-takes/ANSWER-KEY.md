# Jonathan's own three strum-check takes (2026-11-14)

His own playing, recorded with the site's local recording mode on a MacBook Air built-in mic in a quiet room.
No student sound. Each take is a `.wav` (what the mic heard) and a `.json` (the settings, the expected slots and
every event the game heard). This branch is an input for the listening design run; it is never merged to main.

The activity: `ca-52` "Strum Pattern check". Pattern `D.DU.UDU` (8 slots a bar, rests on slots 1 and 4, counting
from 0), 8 bars, chords D5 D5 C5 C5 G5 G5 D5 D5. The answer keys below are Jonathan's own words.

| Take | Tempo | What he played (the answer key) | What the game said | The fault it shows |
|---|---|---|---|---|
| J01 | 85 | Every strum of the pattern, in time. D5 right on all strums. He changed to G5 one bar early: bar 4 was G5, not C5. | 5 of 48 strums "missed", mostly an up-strum right after a down-strum. Bar 4's chord called right. | Unheard up-strums. A wrong chord that shares a note passes (G5 for C5). |
| J02 | 98 | All correct, except slightly off the beat in bar 7. No Metronome. | Bars 7 and 8 marked wrong: after the loose bar 7 the grid sat about a slot off. | The grid loses its place after one loose bar. |
| J03 | 98 | Metronome flashing only, no click. "Close enough on all strums." | From bar 2 on, slots 2 and 5 "missed" and both rests "extra" in every bar. `gridOffsetMs` −182 with a 306 ms slot. | The grid slides by most of a slot and stays there. |

`answerNote` inside J01.json and J02.json says "not yet told": this table is the answer key.
