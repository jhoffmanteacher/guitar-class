# Plan for a new chat — Power Chord Switch next steps + heartbeat removal

Written 2026-11-04 for a fresh Claude Code session (any machine). Jonathan chose:
**1** check that saved takes arrive, **2** watch the big feedback line in class,
**4** a teacher-console evaluator for Power Chord Switch takes, plus the **practice-minutes
heartbeat removal**. Read `NEXT-STEPS-power-chord-switch.md` (what shipped, why) and
`CLAUDE.md` first; the heartbeat plan is the "PICK UP HERE" entry under "Practice
minutes" in `WORKFLOW.md`.

## How to start the new chat

Say one of:
- "Do the Power Chord Switch plan in `PLAN-next-chat-power-chord-switch.md`, **ultracode**"
  (the `Workflow` tool only runs when Jonathan opts in with that word, or says "use a
  workflow" / "fan out agents"; without it, use the `Agent` tool for the tracks below
  one or two at a time).
- or "Do track B only" (any single track works on its own).

Session effort: `high` (the evaluator and the heartbeat are JS + rules work); the
reviewers run at `xhigh` (`site-reviewer-deep`) where marked.

## What each track is, who does it, and what "done" means

| Track | What | Who can do it | Touches | Review |
|---|---|---|---|---|
| **A** (item 1) | Saved takes really arrive | Jonathan in the teacher console; an agent audits the save path | read-only for the agent | none (no change) unless a bug is found |
| **B** (item 2) | Big feedback line holds up in class | Jonathan with a guitar; an agent prepares screenshots and fixes found problems | `coach.js` `ccShowLast`, `styles.css` `.cc-last`, `i18n.js` | Fast, unless a fix touches `ccLoop` |
| **C** (item 4) | Evaluator for Power Chord Switch takes | Agents (sub-steps below) | `teacher.js` (`micEval*`), `tools/mic-sim/*`, `tools/checks.mjs` | **Reviewed same day**, `site-reviewer` high (new kind of check) |
| **D** (heartbeat) | Remove the practice-minutes heartbeat | Agents for step 1; **Jonathan's console paste for step 2** | `practice-minutes.js`, `practice-minutes-config.js`, `tools/pm-sim.mjs`, `tools/pm-e2e.mjs`, `tools/checks.mjs` (1cg), `firestore.rules`, `firestore.indexes.json` | **Always Reviewed**, `site-reviewer-deep` (failing scenario first) |

C and D are independent (different files, except both edit `tools/checks.mjs` in
different sections: 1ck / 1ca vs 1cg) and can run in parallel in separate git
worktrees. A and B need a person at a Chromebook and are not agent work.

### Track A — saved takes arrive (item 1)

Jonathan, in class or at home:
1. Teacher console → Mic recordings: collection **on**, "stop after" number above the
   count so far.
2. As a student (a non-teacher account, not the dev bypass: the dev bypass never
   uploads), say "Yes, save it" and play a Power Chord Switch game to the end. Then
   again, press Stop after 10+ seconds.
3. Expect two rows "Power Chord Switch · <chords>". Download WAV: you should hear the
   count-in clicks and your strums (the recording is cut at 30 s). Download data: the
   JSON has `mode: "pw"`, `expected` (21 entries, each `t`, `verdict` of
   `ok`/`off`/`miss`, `stage`, `bpm`), `events`, `complete: true|false`.
4. If nothing appears, in this order: `firestore.rules` published with `(coach|nr|pw)`
   in BOTH `micTakes` and `chunks`; collection on; the consent question was answered
   "yes" on that device; the student is not the teacher account or a gate previewer.
   Agent help, read-only: audit `micRecSaveNow` and `ccFinish` in `coach.js`.

### Track B — the big feedback line (item 2)

Jonathan with a guitar at the Chromebook (1366×657): after every graded change the line
under the beat dots should read "✓ C5 — right" (green), "✗ C5 — wrong chord" (amber) or
"– C5 — no strum heard" (red) fast enough to use. Questions to answer: readable in time
at 60 BPM every beat? colours distinguishable? wording OK in Spanish?
If something needs changing, an agent can: unify the three phrasings of "on time but the
chord sounded wrong" (`games.cc.verdict.okMessy*`, `games.cc.breakdown`,
`games.pw.last.wrong`), change size/colour in `styles.css` (`.cc-last`), then re-measure
with the real-Chrome script in "Measuring the play screen" below (it must still fit 657px).

### Track C — evaluator for Power Chord Switch takes (item 4)

**Why:** "Evaluate all recordings" (teacher console → Mic recordings) measures Listening
Coach and Note Runner takes against what the site heard (accuracy, mic delay, levels,
clicks). It now skips Power Chord Switch takes (`teacherMicEvaluate` filters
`d.mode !== 'pw'`), so there is no way to tell whether the game's grading matches the
audio. That is what Jonathan wants to improve.

**What a saved take holds** (`coach.js` `ccRecMeta`, `micRecSaveNow`): audio (24 kHz mono,
at most 30 s, starts a little before the first count-in click) and these fields:
`mode:'pw'`, `progression` (e.g. `D5-C5`), `song`, `ladder`, `bpm` (round 1),
`stageBpms` (3 tempos), `bpc` (beats per chord), `micLatencyMs`, `complete`,
`expected[]` = one per graded change `{ i, t, from, to, stage, bpm, verdict }`
(`t` = when the change was due, ms on the recording's clock after `micRecSaveNow`
makes it relative; `verdict` `ok` | `off` (on time, chord wrong) | `miss`),
`events[]` = every strum the site heard `{ t, stage }` (`t` = played time, arrival minus
`micLatencyMs`). No pitch readings are stored per event (unlike Coach takes).

**What the existing evaluator does** (`teacher.js` `micEvalTake`, line ~4431; the node copy
`tools/mic-sim/eval-takes.mjs` lifts the function out of the file, so keep it
self-contained): levels per 5 ms, strum onsets found in the AUDIO (first-difference
energy jumps), the count-in clicks (Goertzel at 660 / 990 Hz) to measure the mic delay,
site-vs-audio agreement per expected note, and `micEvalRow` / `teacherMicEvalHtml`
summarise many takes. Its click search assumes ONE count-in before `expected[0]`; a
Power Chord Switch take has THREE (one per round, each 4 clicks at that round's tempo)
and its first `expected` entry is a change due `bpc` beats AFTER the round's listen
start, not at it.

**Suggested design** (change it if the first sub-step finds a better one):
`micEvalTakePw(pcm, R, d, deps)` in `teacher.js` returning the SAME row shape as
`micEvalTake` where the HTML reads it (`notes.n`, `notes.siteRight`, `notes.replayPresent`,
`notes.detectorMissed`, `notes.silentMiss`, `latency.idealMs`, `level.clipPct`,
`device`), so `teacherMicEvalHtml` needs few changes; computed per round:
- round k's listen start = `expected[first of round k].t − bpc × beatMs_k`; its
  count-in clicks are at listen start − 4..1 beats;
- for each change, is there an audio onset within ± half a change-spacing of `t`
  ("replayPresent")? compare with the site's verdict: site `ok`/`off` + onset =
  agree; site `miss` + onset = **detector missed** a real strum; site `ok` + no onset =
  **false hit**; both absent = silent miss;
- drop changes whose `t` is past the audio's end (the 30 s cap);
- mic delay per round from clicks 2-4 vs the listen start, compared with the saved
  `micLatencyMs`.
Wire it into `teacherMicEvaluate` (remove the `pw` skip), `micEvalRow` (game label is
already `Switch <chords>`), and `tools/mic-sim/eval-takes.mjs` (remove the `pw` skip).

**Sub-steps and agents** (use `Workflow` with ultracode, or `Agent` one at a time):
1. *Read-only design agent* (`Explore`, "very thorough"): list every field
   `micEvalTake`, `micEvalRow`, `micEvalText`, `teacherMicEvalHtml` read from a row;
   report which a pw row must provide and what a pw take lacks. Output: a short spec.
2. *Fixture agent*: extend `tools/mic-sim/fake-take.mjs` (or add `fake-pw-take.mjs`) to
   synthesise Power Chord Switch takes with KNOWN truth: 3 rounds, count-in clicks, chosen
   strums (some missing, some late, a held chord), the matching `expected`/`events`, in a
   few mic conditions (loud, quiet, delayed 50-250 ms). Look at `tools/mic-sim/power-switch.mjs`
   and `fake-take.mjs` first.
3. *Implementation agent*: `micEvalTakePw` + wiring. Must not change `micEvalTake` output
   for Coach / Note Runner takes (differential: run `eval-takes.mjs` on the existing
   fixtures before and after, identical rows).
4. *Check agent*: add a section to `tools/checks.mjs` (next to 1ck) that renders the
   evaluator on the fixtures and pins the counts (e.g. "21 changes, 3 clicks found per
   round, 2 detector-missed, 1 false hit"); break it three ways in a scratch copy and
   show it red (house rule: never trust a check that was not seen failing).
5. *Reviewer*: `site-reviewer` (high), failing scenario first; give it the commit, not
   the conclusion.
Done = Evaluate-all lists Power Chord Switch rows with agree / detector-missed / false-hit
counts and a mic-delay figure, on the fixtures AND on a real take downloaded in Track A.

### Track D — remove the practice-minutes heartbeat

Follow the `WORKFLOW.md` "PICK UP HERE" entry exactly. Summary: step 1 is code only
(delete the `heartbeats/{sessionId}` writer, `pollLive()`, `S.live`, `liveMinCount`, their
tests in `tools/pm-sim.mjs` / `tools/pm-e2e.mjs`, lower `PM_SIM_PIN`, drop the 1cg
heartbeat pins); ship it and wait until it is live. Step 2 is rules + index (delete the
`heartbeats` block in `firestore.rules`, the index in `firestore.indexes.json`) and needs
Jonathan's Firebase console paste **after** step 1 is live, so no write is ever refused.
Always Reviewed by `site-reviewer-deep` the same day. Proof to bring: `pm-sim` and
`pm-e2e` pass; the 1cg pins broken in a scratch copy go red; a play session counts and
flushes the same seconds as before (differential against `origin/main`).

## Running it with several agents safely

- **Worktrees, one per code track** (rule 14 in `.claude/rules/code-hygiene.md`, skill
  `site-sweep`): the lead creates them before launching agents:
  `git worktree add ../guitar-class-evaluator -b work-evaluator origin/main` and
  `git worktree add ../guitar-class-heartbeat -b work-heartbeat origin/main`.
  Never two agents in one tree. Cherry-pick or merge to `main` one track at a time;
  `sw.js` `CACHE_VERSION` will conflict: take either side, run `node tools/checks.mjs`.
- **Memory:** the last session's full smoke run was killed for low memory. Run
  `node tools/smoke.mjs --baseline origin/main` ONE AT A TIME (the lead runs it, agents do
  not), with other programs closed. `node tools/checks.mjs --check --skip-links` is
  light and agents may run it. If a background command is reaped for memory, do not
  restart it until Jonathan says memory is free.
- **Every agent claim is checked by the lead** (read the quoted lines yourself); fixes
  made by an agent are re-derived on the real code. The reviewers get the pinned commit
  and the instruction to break it, not to confirm.
- Per-track checklist from `CLAUDE.md`: `checks.mjs` green, a `CHANGELOG.md` entry only
  if a student can see the change (Track B may; C and D are teacher/engine only), the
  Spanish twin for any new student text, break-it proof for any new check, `git fetch` and
  `git log HEAD..origin/main` right before pushing, `node tools/checks.mjs --live` after.

## Measuring the play screen (Track B)

`node <script> "<repo path>" "<output folder>"` with a real-Chrome script that opens the
site through the dev bypass at 1366×657, walks all 16 song switches in English and
Spanish with and without the red recording label, marks every chip graded, and reports
`maxH` (must be ≤ 657) and where Stop ends. The script from the 2026-11-03 review was a
scratch file and is not in the repo; `tools/smoke.mjs` does the same in its Power Chord
Switch section (it forces Spanish and the label on some switches and marks every chip
`off` before measuring). Prefer `smoke.mjs`.

## Not in this plan (still parked, in `NEXT-STEPS-power-chord-switch.md`)

A mic check on the setup screen, raising the 30-second recording cap (Jonathan's call:
more Firestore data), a mic-delay slider in Power Chord Switch.
