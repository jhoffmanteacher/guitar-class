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
- `yin-eq.mjs <old coach.js> <new coach.js>` — proves coachDetectPitch
  output is identical. Old file: `git show dfaeedc:coach.js > /tmp/coach-old.js`.
- `sim.mjs <old> <new>` — old vs new coachReadFrame at 13–60 fps.
- `loud.mjs`, `loud-diag2.mjs`, `sweep2.mjs <coach.js>` — beat-graded
  (Coach / Note Runner style) loud-room sweeps.
