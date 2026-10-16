# Mic-detection simulators

Tools used to tune the loud-room / Chromebook listening (2026-10-07/08).
They drive the REAL functions extracted from `coach.js` with a synthetic
mic. Nothing on the site references this folder. Keep it for the next
tuning pass — ideally on the real classroom recordings the teacher console's
"Mic recordings" view now collects (Download WAV + Download data).

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
- `yin-eq.mjs <old coach.js> <new coach.js>` — proves coachDetectPitch
  output is identical. Old file: `git show dfaeedc:coach.js > /tmp/coach-old.js`.
- `sim.mjs <old> <new>` — old vs new coachReadFrame at 13–60 fps.
- `loud.mjs`, `loud-diag2.mjs`, `sweep2.mjs <coach.js>` — beat-graded
  (Coach / Note Runner style) loud-room sweeps.
