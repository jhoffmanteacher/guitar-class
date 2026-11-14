# Gap tests: closing what plant-a-fault let through (2026-11-14)

Branch `tools/gap-tests` (worktree `.claude/worktrees/gap-tests`), rebased onto `origin/main` ddc0b9c, not pushed.
Tools only: no site file changed; `sw.js`, `CHANGELOG.md`, `tools/plant-a-fault.mjs` and its known file untouched.
Seven commits, one per tool, no review label (the lead adds it).

## Result: 12 of the 24 closed, 1 found harmless, 11 skipped (browser-only)

Proof on the branch, one run, `--jobs 1`, under the load gate:
`node tools/plant-a-fault.mjs --ids <the 12> --jobs 1 --max-load 16` →
`plant-a-fault: 12 planted, 12 caught, 0 new got through, 0 known got through, 0 stale · seed 2026-W46`, exit 0.
On 5a92ab1 each of these 12 GOT THROUGH (DETAILS.md, "Every survivor, by region"); not re-run.

| id | the planted mistake (effect) | test added | caught by (plant line) |
|---|---|---|---|
| 35b9beeca7 | flushSave never clears `_flushP`: every Sign out says "Not saved yet" | shared-chromebook-loop R8 (a): a notice with every progress write landed and every action carried fails | shared-chromebook (99.2 s) |
| a378a132d1 | signOut leaves `_signOutBusy` set: "Sign out anyway" does nothing | shared-chromebook-loop R8 (b): the device must be signed out within 5 s of the click | shared-chromebook (168.8 s) |
| 635dbb41db | a failed config/class read counts as read: the console draws from {} | visible-loop directed block: Games view after a failed / good / failed read; failed must say "Could not read the class settings" and draw no table | visible-loop (77.8 s) |
| 23e08d8999 | stale refusal without `staleConfig`: "connection problem" instead of "Nothing was saved" | two-consoles-loop: a refusal is judged by the server (the update function threw on a read whose configVersion is not the console's), so it must reach "Nothing was saved" | two-consoles (373.5 s) |
| 25c60b00cd | `!base || …` → `&&`: a strict writer's guard throws a TypeError (and an empty base is let through) | same rule: the TypeError refusal showed the generic alert | two-consoles (135.7 s) |
| 9431d464d9 | coachOnsetTick never reports a pluck | tone-test section 7: Note Hunt's REAL fretLoop + fretJudge + coach-core listeners, made-up plucks while the last note rings; every prompt answered at its first pluck (PIN_LISTEN 40/40) | tone-test (9.9 s) |
| 298563a085 | `detect !== false` → `!== true`: the idle tick deaf after the floor | same | tone-test (10.1 s) |
| f9bf7c0f92 | the Coach's "Next:" cue never updates | listen-site coachOut reports the cue; listen-loop: a take whose pulse reached the last slot must end on its cue ("last note"/"last chord"), else exit 1 | listen-chords (132.2 s) |
| ac3028fcd0 | lastSet never saved | save-loop directed D1: open set m7w1 (Module 7) and hide: stored lastSet/lastModule must be it | save-loop (21.4 s) |
| 29266b76eb | swap45Done never set: a transaction on every save | save-loop directed D2: new student, two saves online, one offline: 1 transaction in all, no "save.failed"/"save.notSaving" while offline, all ticks land | save-loop (25.4 s) |
| 33147bfb56 | IndexedDB `blocked` not answered: "Loading… 0%" until the 5 s limit | song-files-sim: blocked open (wait limit 1.5 s in the case): song plays from Firestore in under 750 ms | song-files-sim (7.7 s) |
| 6eb5c43dc5 | loading line loses `role="status"` | song-files-sim: the line a snippet card gets carries role="status" | song-files-sim (5.4 s) |

Fault-copy outputs seen while building (replay copies, `--root`):
- save-loop D1: `D1 the place: the student opened m7w1 (Module 7) and hid the tab; stored lastSet null, lastModule 7`.
- save-loop D2: `a tick made offline showed "save.failed" at 13.54 s`; `7 transactions ran for three saves; wanted 1`.
- visible-loop: `console Games view after a failed read: the view drew the games table …; wanted "Could not read the class settings" and no table` (twice: first read and after a good one).
- tone-test prototype, 4 runs (seeds 1-2 × 20/60 fps): clean 40 plucks for 40 prompts; 9431d464d9 52 plucks; 298563a085 55.
  Clean was 10/10 first-pluck on all 32 combinations of seeds 1-8 × 15/20/30/60 fps (slowest answer 321 ms; the pin is 400).
- listen-loop melody quiet right: `the "Next" cue: 0 of 10 takes … ended on its cue` with `reads "" at the last slot; wanted "last note — let it ring"`.
- song-files-sim `--breaks`: `✓ 48 of 48 breaks caught`, including the two new ones named after the plant ids.

## Found harmless (for the known file; the lead adds it, I did not)
- **6bfae6ba49** coach-core.js:883 coachPitchReadings `sr > 60000 ? 4096` → `8192`: an equivalent mutant. The buffer is
  always `coachFrameBuf = new Float32Array(COACH_FFT)` (coach-core.js:696, the only assignment) with `COACH_FFT = 4096`,
  so `Math.min(L, 4096)` and `Math.min(L, 8192)` are both 4,096. DETAILS.md's reading (halved readings at 44.1/48 kHz) is
  wrong: the 2,048 branch is untouched. Suggested known entry: harmless, "L is always COACH_FFT = 4096".

## Skipped (11): browser-only or need a new harness
- 74abd846e1 ecSubmit `caOpenId = id` removed: the exit-check card closes after Submit; display only, a rendered list (smoke `activities`).
- a5fbe32e51 start.js `__authBootPending = true` removed: an update reload landing mid sign-in; needs the service worker (update-reload-loop).
- 13c1e43118 start.js `hadController` (navTiming compare): needs start.js's service-worker block run against a stub
  `navigator.serviceWorker`; no Node tool in the cache region's list loads start.js (update-reload-loop is the guard).
- 664bdb8856, 48bf19e696, 6e7fdc87c3, f514254138, 638dbaface, abe0fae2ca, 4350eaa127, 1d1c31e436 (swResume*): the update
  reload's note and restore; a Node round trip (save on a stub DOM, apply on a fresh page) would be a new harness, not a few
  lines, and none of the cache region's tools (kill-switch, sw-audio, checks) could host it without editing the plant
  tool's table. Guard today: update-reload-loop (not in the weekly run).
- Not in the 24, not done: the rules boundary gaps c61237d65c, ae437535db, e97ec1c20e (need the Firestore emulator).

## No real site bug found
Every one of the 12 is a test gap only: today's site passes each new assertion (clean runs below).

## Stability and time
(See below; filled in from the gated series.)
