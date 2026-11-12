# Mic-detection simulators

Tools used to tune the loud-room / Chromebook listening (2026-10-07/08).
They drive the REAL functions extracted from `coach.js` with a synthetic
mic. Nothing on the site references this folder. Keep it for the next
tuning pass — ideally on the real classroom recordings the teacher console's
"Mic recordings" view now collects (Download WAV + Download data).

**Since the 2026-11-11 cut** there is no `coach.js`, `app.js` or `teacher.js`
file: each is a set of part files (`coach-core.js` and the other `coach-*.js`,
`app/*.js`, `teacher-*.js`). In this README the three names mean the whole
script.
- **As an argument the old names still work inside the repo**:
  `node tools/mic-sim/power-wait.mjs coach.js` reads the whole script
  (`readScriptArg` in `tools/site-src.mjs` joins the parts in load order when
  the path is one of the three names in a site folder, one with an
  `index.html`). Any other path is read as the file it is.
- **An export of an OLD version**: `git show <ref>:coach.js > file` works only
  for a ref BEFORE the cut. For a ref after it: `mkdir <dir>`, then
  `git archive <ref> | tar -x -C <dir>`, and pass `<dir>/coach.js` (and
  `<dir>/app.js` where a tool takes both).

- `tune.mjs <coach.js> '<json {cell: {CONST: value}}>' [prompts] [fps]` — the
  one-note games (Note Hunt, PSG Hero, Wait Mode, Note Call) through the real
  `coachReadFrame` / `coachSettlePitch` inside a copy of `fretLoop`'s
  listening logic. Three rooms (quiet; one loud neighbour; a classroom of
  6–10 quieter ones over a din), five students (right, wrong, mixed,
  soft-after-loud, soft). Runs on 4 worker threads. The numbers in
  `coachSettlePitch`'s comments come from here.
- `power-wait.mjs <coach.js> [trials] [--harm=std|mid|weak] [--only=…]
  [--clarity=…]` — Riff Runner Wait Mode on Watchtower's power-chord tokens
  (A5/G5/F5): one synthetic strum or wrong note in a quiet room through the
  real settle code and the file's own accept rule (`rnwTargets`), so an old
  coach.js gives the before and the current one the after. The numbers in
  the `rnwTargets` comment come from here. The loud-room figures there come
  from a scratch copy of `tune.mjs` (not kept) that does three things
  differently: prompts 41/43/45 only, the student's pluck is the chord
  shape, and the settle call is given `[t, t+7, t+12]` and
  `RNW_POWER_CLARITY`.
- `power-notecall.mjs <coach.js> <app.js> [trials] [--harm=std|mid|weak] [--only=…]
  [--per-root] [--offsets=…]` — Note Call's power-chord mode (ca-43,
  2026-10-30): one synthetic strum or wrong note in a quiet room for every
  root the whole-neck step can call (low E and A strings, frets 0–12 = 26
  roots, built the way `ncPool` builds the cards) through the real settle code
  and the accept rule read from the files under test (`ncTargets` /
  `ncAnswerAt` / `ncPowerTones` in app.js; root, octave and octave below, not
  the 5th, since 2026-10-31), so an old
  coach.js + app.js (`git show <old>:coach.js`) gives the before and the
  current pair the after. Wrong cases accepted more than 1 in 100 are marked
  STOP. `--offsets=-12,0,7,12` is a what-if: answer each root with those
  semitone offsets without editing app.js. Needs both files, not just
  coach.js. Synthetic audio, not a guitar through a Chromebook mic.
- `power-switch.mjs <coach.js> [trials] [--harm=std|mid|weak] [--clarity=…]` — Power Chord Switch (Change Up's engine on the three-finger power chords, 2026-10-30): every adjacent pair in `CC_POWER_PROGRESSIONS` through the real `coachPitchReadings` / `ccResolvePend`, as a real change, a held chord (never moved) and a chord one fret high, with `0.55` against `RNW_POWER_CLARITY`. The numbers in the `ccLoop` comment come from here. Synthetic audio only.
  Since 2026-10-30 the game's "Two random chords" draws only one of the 11 listed pairs (in either order), so
  every pair a student can get is one this tool covers; before, a pool of six chords could draw four
  jumps (F5-D5, G5-B5, A5-B5, A5-C5) it never tested.
- **`closed-loop.mjs` + `student.mjs` (2026-11-11) — the closed-loop test.** A virtual student (`student.mjs`:
  plucked-string guitar, pick / thumb / finger, wrong chords, held chords, skipped strums, loose or late rhythm, a
  room, a laptop mic) plays WHOLE Power Chord Switch games into the real site code in a vm: `ccPrepare`,
  `ccBeginStage`, `coachCountIn`, `ccLoop`, `coachReadFrame`, the pitch readings, `ccResolvePend`, a song switch's
  three rounds and `ccFinish` all run as written, on a virtual clock, with nothing stubbed between the mic and the
  verdict. The student keeps an answer key, so the table is truth against verdict: a right chord said right, a
  chord one fret high caught, a chord that never moved caught, a strum heard where there was none.
  `node tools/mic-sim/closed-loop.mjs` (options in its header; `list` names the students, rooms and mics;
  `--coach=<file>` runs another coach.js for a before / after). Unlike `power-switch.mjs` (one change, sine sums, a
  copy of ccLoop's logic) it plays every beat of every round and includes the site's 70-1500 Hz mic filters, which
  the older tools here leave out. Synthetic. One number is fitted to the classroom takes (how long a string rings, `ringS`: the reason is in
  `student.mjs`); the touches, the rooms and the mics are guesses until the takes are run against them. Not in `checks.mjs`. Power Chord Switch only so far; `student.mjs` knows nothing about the site, so
  the next game needs only its own runner.
  **`--no-guitar`** (2026-11-11, Jonathan: "it's marking things right where there's nothing playing"): twelve cases
  in which no chord is played in the whole game (a dead mic, a quiet room, a fan, one voice, a class talking, bumps,
  typing, a partner's guitar, a class of guitars, a loud class, desk taps on every beat, strums across muted
  strings; `NO_GUITAR` in the file). A case passes only when nothing is marked right, and the run exits 1 when any
  fails. On the current rule (1.8 / 2.19) 9 of 12 fail, which is the bug it was written to show, so it is not in
  `checks.mjs`: it goes there when the game passes it.
- **`candidates.mjs`** (2026-11-11): candidate Power Chord Switch grading rules (`ring`, `half`, `half3`, `both`,
  `both3`; what each does is in its header), applied to coach.js IN MEMORY. None is in coach.js. `closed-loop.mjs
  --rule=<name>` plays one; `replay-takes.mjs` replays them on real takes.
- **`replay-takes.mjs <folder>`** (2026-11-11): each candidate rule on the REAL takes' audio, through the real `ccLoop`
  (the recording goes back through the site's mic chain; nothing is replayed from the take's saved strums). Counts,
  per rule, the changes with no strum in the window that the rule still hears / marks right, and the real strums it
  loses, at the take's own strum ratios and at today's. Its "reproduced" line (the base rule against the take's saved
  verdicts) says how far to trust the rest: 462 of 480 on model takes (`closed-loop.mjs --takes-out=`). The
  evaluator's "strum" is any attack in the audio, so a tap counts as a real strum there. Never commit takes.
- **`takes-in.mjs` — ONE command brings new classroom takes in** (2026-11-11): `node tools/mic-sim/takes-in.mjs` (the
  newest `mic-recordings*.zip` in Downloads, or a folder or zip you name). It unzips, anonymizes, evaluates, writes one
  SUMMARY per Power Chord Switch take to `tools/mic-sim/takes/` (loudness and attack energy 94 times a second, the
  detector's pitch at each point, the game's numbers, the evaluator's truth; no audio, no names), checks the
  summaries against the audio, deletes its temporary copies and commits the summaries (it does not push). With
  summaries in the repo, `node tools/mic-sim/replay-takes.mjs` (no folder) replays any rule on the real takes from any
  session. On model takes the summary replay gave the audio replay's verdict on 924 of 960 changes (heard or not:
  950 of 960). A summary cannot test a change to `coachDetectPitch`, the mic chain or the window sizes: keep the
  audio (outside the repo) for those.
- **When to ask Jonathan for new takes:** `replay-takes.mjs` prints "ASK JONATHAN" with the reasons (no summaries; the
  detector changed; no take was graded at today's strum ratios; or, as a backup, the newest take is older than the
  last commit that changed a listening constant's own line in coach.js). Pass that on to him in
  the report; do not ask otherwise. Old takes or few takes alone print a "Note" line, which is not a reason to ask
  him (his call, 2026-11-11). The Friday check runs it every week (skill
  `friday-check`, step 5b), so he is told within a week without anyone working on listening.
- **Fitted rooms** `room7`, `room4` in `student.mjs` (Jonathan, 2026-11-11, fitted to the 21 real takes).
- `smoke.mjs <url>` — headless Chromium through the Dev bypass with the
  in-page harness: Coach, Note Runner, Note Hunt, Note Call, Change Up, PSG
  Hero, the consent prompt and the recording path. Start a static server on
  the repo first (`npx http-server -p 8123 -s -c-1`), then
  `NODE_PATH=$(npm root -g) node tools/mic-sim/smoke.mjs http://localhost:8123/`.
- `smoke-console.mjs <url>` — the teacher console's Mic recordings view
  against a stub Firestore (renders, WAV/JSON download, On/Off, Delete,
  Reset counter).
- `page-harness.js` — eval in the real page (localhost, dev bypass,
  `await ensureCoachJs()` first): virtual clock + fake mic; `__runCoach(btn,
  opts)`, `__tally`, `__runNr(level, opts)`, `__tallyNr`, `__fretRun(room,
  gapMs, wrongBy)`. Chrome throttles timers in background tabs — never
  `await` a real setTimeout in the harness calls.
- **The real recordings: teacher console → Mic recordings → "Evaluate all
  recordings"** (teacher.js `micEvalTake` and friends). Per take: raw mic
  level and clipping, where the count-in beeps landed (the true mic +
  speaker delay per device, and the `micLatencyMs` that would have scored
  an on-the-click note on the beat), and each expected note replayed
  through the site's own gain, filters, gate and `coachDetectPitch` — so a
  note the site missed splits into "clearly in the audio" (detector) vs "no
  pick attack there" (not played). "Download results" saves the numbers
  only (no audio, no names) — that file is what to hand Claude.
- `eval-takes.mjs <folder of WAV+JSON pairs> [--json out.json]` — the same
  functions, pulled out of teacher.js, on the console's Download WAV /
  Download data files.
- `anon-takes.mjs <raw-folder> <out-folder>` — **run this first, on the
  teacher's machine.** The console's downloads are named after the student
  and the JSON carries name/uid; this copies each pair to T01.wav/.json…
  (newest first), strips every identifying field, refuses to write if a
  removed value appears anywhere else, and prints counts only. Claude
  works on the output folder, never the raw one.
- Per-note reason (`micEvalWhy` in teacher.js, 2026-10-16): eval-takes
  prints, for every note the site did not count, why it had too few
  readings — `no-onset`, `onset-elsewhere`, `readings-cut`, `vote-failed`
  — with the replay's own readings in the same window (`winN`) and after
  it (`lateN`, `lateHit`).
- The second look that coach.js got from this (COACH_LOOK_TAIL /
  COACH_LOOK_MIN, Coach melody + Note Runner melody) is the `look min3
  tail 600` row below; a recording saved after it marks each note it
  counted (`secondLook` on the expected note, `look` readings on the
  event), and the console's Evaluate line counts them.
- `whatif-tail.mjs <eval-takes --json output> [--flips]` — re-applies the
  site's verdict rules with a longer reading tail (all events / starved
  events only / a target-only "look"), on the real takes. Its first line
  re-derives the site's own verdicts from the site's readings and must say
  0 differ.
- `fake-take.mjs <out> [lag] [map] [coach|nr] [quiet|class] [clicks]` — a
  synthetic take with planted answers (the header lists them) to prove the
  evaluator.
- Power Chord Switch takes (`mode: 'pw'`, 2026-11-04): `micEvalTakePw` in
  teacher.js. No pitch readings are saved with them, so per change it asks
  only "is there a strum in the recording where the SITE listened" — its own
  window, replayed from the strums it logged (ccLoop's gridOffset and match)
  — against the site's verdict: agree / detector-missed / false-hit /
  off-window (just outside the window, or near the beat the student heard) /
  silent-miss. Each round's own count-in (up to three rounds, each at its
  own tempo) gives the mic delay: N clicks from the take's `countInBeats`
  (2 below 60 BPM since 2026-11-09; 4 for a take without the field; a
  missing or odd entry is guessed from the tempo and gives no delay), beeps
  2-4 of a 4-click count-in and beeps 1-2 of a 2-click one, which must all
  be heard and line up within 40 ms. A 2-click round whose beep 1 is not
  heard reports beep 2 alone and gives no delay. A round without a delay has
  its windows on the site's own beat when the strums give the map, else on
  the other rounds' lag, else on the delay setting alone. Changes past the end of the audio (the
  30 s cap, Stop) are counted as `dropped`, not judged; changes with an
  impossible time, round or tempo as `ignored`. Which chord was strummed is
  not checked. **Strum what-if** (2026-11-04, measurement only): the same
  function replays the SITE's own strum rule over the audio at its ratios and
  stricter ones (`whatIf`; the numbers and the text of `ccLoop`,
  `coachReadFrame` and `coachSmooth` are read from coach.js at run time) and
  counts the false hits that would stop firing and the real strums that would
  stop with them. eval-takes.mjs prints it after the tables and `--json`
  carries it as `strumWhatIf`. A Coach / Note Runner note whose window runs
  past the end of the audio is `dropped` there too (`micEvalTake`).
- `fake-pw-take.mjs <out-folder>` — twenty-eight synthetic Power Chord Switch
  takes (two of them for the what-if, with answers measured on the audio: room
  noise and no strums, and soft real strums over a loud room; then loud, quiet, 50 and 250 ms mic delay, cut by the 30 s cap, a pair
  with a neighbour's guitar, every 2 beats and Stopped, no beeps with the
  setting right and wrong, 140 BPM every beat and every bar with strums at
  the window's edges, a site that hears nothing, three wrong-setting / late
  cases, drifting strums, and eight count-in takes below 60 BPM: a 2-click
  pair, one in a loud room, a 50 / 55 / 60 song switch heard and deaf, a muted pair, a 660 Hz
  hum that drowns beep 1, an E5 / B5 at the beep pitches out of line, and a
  take saved before `countInBeats` with 4 clicks) plus `truth.json`. Each round's count-in has
  coach.js ccCountInBeats clicks (read from coach.js); `legacyCountIn: true`
  plants the old 4-click take without the field. The site's verdicts are not planted: ccLoop's
  rule is run on the strums the site hears. checks.mjs 1cl builds the same
  takes in memory and pins the evaluator's answers to the truth.
- `yin-eq.mjs <old coach.js> <new coach.js>` — proves coachDetectPitch
  output is identical. Old file: `git show dfaeedc:coach.js > /tmp/coach-old.js`.
- `sim.mjs <old> <new>` — old vs new coachReadFrame at 13–60 fps.
- `loud.mjs`, `loud-diag2.mjs`, `sweep2.mjs <coach.js>` — beat-graded
  (Coach / Note Runner style) loud-room sweeps.
