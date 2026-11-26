---
paths:
  - "coach-*.js"
  - "tuner.js"
  - "tools/mic-sim/**"
  - "tools/tone-test.mjs"
---

## How the games listen

Moved from CLAUDE.md (2026-11-26). Coach detection in ANY `coach-*.js` part is a danger zone (CLAUDE.md "Triggers"):
the onset and pitch detectors and the grading rules (ratios, gates, windows), each game's own loop and judge; not a
game's screens, wording, tempo controls or count-in. Full guide: `tools/mic-sim/README.md` (the closed-loop entries).

- **Before proposing a listening rule:** `node tools/mic-sim/closed-loop.mjs --rooms=room7,room4`, then the same with
  `--no-guitar`. Each run ends with the REAL TAKES section (recorded student takes replayed through the real game
  code; it covers every game with recorded takes: Power Chord Switch, Listening Coach, Note Runner). Real takes outrank
  the synthetic rooms when they disagree: report both, real takes first. `--against=<json>` compares a changed rule
  with today's, real takes first.
- **A Listening Coach, Note Runner or Strum Radar rule:** also `node tools/mic-sim/no-guitar-listen.mjs` (what a round
  earns with nothing played) and `node tools/mic-sim/replay-listen.mjs --noise`.
- **Against an answer key:** `node tools/mic-sim/listen-loop.mjs --game=melody|chords|radar|runner --json=<f>` before,
  then `--root=<copy> --against=<f>` after (false fails and false passes by room). For single notes read the `class`
  room; room4 / room7 are harsher than the real rooms.
- When a tool prints "ASK JONATHAN", tell him it is a good time to download takes and run `node
  tools/mic-sim/takes-in.mjs` (the only way recordings come in: CLAUDE.md "Student data").
- The `ring` and `half` rules were rejected on real takes (2026-11-11): do not rebuild them.
- **The pitch detectors are pinned** (`checks.mjs` 1cx runs `tools/tone-test.mjs`: made-up tones through the real
  `coachDetectPitch` and the tuner's detector). A deliberate detector change: the mic-sim closed loop first, then
  re-pin with `node tools/tone-test.mjs --measure` in the same commit, with the reason.
- **Power Chord Switch** (game in `coach-chords.js`, listening in `coach-core.js` and `coach-score.js`): read
  `WORKFLOW.md` "Power Chord Switch: where we stopped" first. Live and binding there: rule A (a strum with no pitch
  never counts, in four games), the whole-span rule, the strum ratio 1.8 / 2.19 for Power Chord Switch only; each
  one's roll-back; what was rejected on measurement. Full record: `docs/workflow-history-to-2026-11-18.md`, section 5.
- **`coach-strumcheck.js`** (the strum-pattern check on ca-46) saves nothing to progress; after any change: `node
  tools/mic-sim/strum-check-loop.mjs`.
- `coach-core.js` (the listening code) is split into parts only with Jonathan.
