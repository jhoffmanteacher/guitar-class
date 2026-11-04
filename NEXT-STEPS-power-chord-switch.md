# Power Chord Switch — where we stopped (2026-11-03)

> **STATUS (2026-11-04): shipped.** The branch `pcs-pending-smoke` was merged into
> `main` on 2026-11-03 (merge commit ca932f2): smoke on the merged tree was clean
> against the origin/main baseline, the full checks passed, and Jonathan
> published `firestore.rules` (take id `(coach|nr|pw)`). The same day a second
> change landed (e5e0bef): a Stopped game with at least 10 s of audio is saved
> too, with `complete:false` in the take (a shorter Stop, or leaving the screen,
> still drops it). Only the "Next steps (not done)" list below is still open.
> The branch `pcs-pending-smoke` can be deleted on GitHub.

Read this when Jonathan asks "what are the next steps for the Power Chord
Switch activity". It is the hand-off from the session that built the changes
below. Delete or rewrite it when the list is done.

## What shipped in this push

1. **Song switches replace the whole-song buttons** (`coach.js`
   `CC_POWER_PROGRESSIONS`, group `song`). One activity per distinct switch in
   the song's card: Sweet Child O' Mine 10 (ca-33), "the cure" 6 (ca-30).
   Each is a **ladder**: 3 rounds of 4 back-and-forths (8 chords), 15 BPM faster
   each round (60 / 75 / 90 from the base tempo), a 4-click count-in before each
   round. Jonathan's words: "practice the actual chord switches in the songs by
   going back and forth between each change 4 times at slower to faster tempos."
2. **BPM buttons on the play screen** (−5 / +5, under the beat dots): they move
   the rounds still to come, not the round being played; off in round 3.
3. **Choices layout:** the pairs view keeps five columns (the fifth, Songs, has
   one button per song). A song button opens the **songs view** (all that
   song's switches, a "Chord pairs" back button). All 16 next to the pairs was
   881px tall on a 657px screen.
4. **Saved student audio** (`micRecStart('pw')`): same consent flow as the
   Listening Coach and Note Runner (one question per device, the red "Recording
   this take" label on every screen of a take, saved when a game is played to
   the end, and also when it is Stopped after at least 10 s of audio
   (`MICREC_MIN_STOPPED_SEC`, 2026-11-04; the take says `complete: false`;
   a shorter Stop is dropped so a stub never overwrites a full take; leaving
   the screen still drops it); never for Change Up). One capture covers all three rounds and is
   cut at the existing 30-second cap. Jonathan said **no on/off button**: none
   was added. The label still carries the existing small "Stop saving my takes"
   link (the consent opt-out the other two games have). Remove it from the
   Power Chord Switch screens only if Jonathan says so.
5. **Clearer feedback, on the done screen and while playing.** Done screen:
   every chip has a symbol (✓ right, ✗ on time but the chord sounded wrong, –
   no strum heard) and a line counts them. Play screen: a big line under the
   beat dots after every graded change ("✓ C5 — right" green, "✗ C5 — wrong
   chord" amber, "– C5 — no strum heard" red; `ccShowLast`, `.cc-last`; the row
   is always drawn so nothing jumps). Jonathan: "I didn't see the power chord
   switch giving clear feedback about misses and correct notes" and "make the
   in game feedback bigger".

Checks: `tools/checks.mjs` section **1ck** was rewritten (every switch against
its card, the three rounds run, the BPM buttons, recorded takes, the feedback
line); `tools/smoke.mjs` walks all 16 switches in a real browser.

## Done in the Firebase console

- `firestore.rules` with the `-pw` take id was published by Jonathan (per the
  merge commit message, 2026-11-03). Still worth one look: teacher console →
  Mic recordings should list a Power Chord Switch take once a student who said
  yes has played a game to the end (or stopped one after 10 s). Mic collection
  has to be switched on there for any take to be asked for or saved.

## Next steps (Jonathan chose these on 2026-11-04: saved takes arrive, the evaluator, and the heartbeat removal)

**A step-by-step plan for a fresh chat, with agent and worktree guidance, is in
`PLAN-next-chat-power-chord-switch.md`** (Jonathan may start it with the word
"ultracode" to allow a multi-agent workflow). The list below is the short version.

1. **Check that saved takes really arrive.** Teacher console → Mic recordings
   (collection must be switched on there). After a student who said yes has
   finished a Power Chord Switch game, or stopped one after at least 10 s, a
   row "Power Chord Switch · <chords>" should appear, with Download WAV / Download
   data working. Nobody has seen a real take arrive yet. If none appear: the
   rules paste first (`micTakes` and `chunks` must say `(coach|nr|pw)`), then
   mic collection on, then the student's consent answer (asked once per device).
   Also open one take's data and check `expected` has 21 entries, each with a
   time, a verdict (`ok` / `off` / `miss`), a round and a BPM, and that
   `complete` is `true` or `false`.
2. **Build the teacher-console evaluator for Power Chord Switch takes.** "Evaluate all recordings" skips these takes today. Goal: for
   each saved take, compare what the site graded (`expected`, `events`) with what is
   really in the audio, per round: strums the game missed, "right" changes with no
   strum, and the mic delay from the three count-ins. Design, sub-steps and checks
   are in the plan file (Track C).

## Not Power Chord Switch, but waiting: remove the practice-minutes heartbeat

Jonathan asked for this note here so it is not lost. **Step 1 is DONE on branch
`work-heartbeat`, NOT yet live** (2026-11-04: two commits, "Practice minutes:
remove the heartbeat writer…" and its review fixes; `pm-sim` 152/152, `pm-e2e`
84/84). Step 2 waits until step 1 is live. The full plan is the "PICK UP HERE" entry under "Practice
minutes" in `WORKFLOW.md` (written 2026-11-04); read it before touching anything.
In short: "N playing" is gone from the screen, but the engine in
`practice-minutes.js` on `main` still writes a `heartbeats/{sessionId}` record
(`{ period, lastSeen }`) about every 30 s while audio plays, and nothing reads
it. The records pile up (the TTL policy was never set) and any signed-in user
can list them.
- **Step 1 (code, no console paste; DONE on `work-heartbeat`, not live):** delete the heartbeat writer, `pollLive()`,
  `S.live` / `S.liveAt` and `liveMinCount`; remove the heartbeat tests in
  `tools/pm-sim.mjs`, lower `PM_SIM_PIN` in `tools/checks.mjs`, drop the 1cg
  heartbeat-rules pin and the `liveMinCount` check, drop the aggregation fake
  in `tools/pm-e2e.mjs`. Counting, `flush()`, the queue and the keepalive do not change.
- **Step 2 (only after step 1 is live; needs Jonathan's Firebase console
  paste):** delete the `heartbeats/{sessionId}` block from `firestore.rules` and
  the `heartbeats` index from `firestore.indexes.json`, and the `== heartbeats`
  section of `tools/pm-rules-test.mjs` (about lines 85-110, plus its header
  line). checks.mjs 1cg accepts the block only whole or gone. Old `heartbeats`
  documents can then be deleted in the console.
- **Always Reviewed the same day** (`site-reviewer-deep`; it edits the counting
  half, `pm-sim` and `firestore.rules`). Proof: `pm-sim` and `pm-e2e` pass, the
  1cg pins broken in a scratch copy go red, a play session counts and flushes
  the same seconds as before.

## Later (not chosen yet)

- **Skipped on purpose (Jonathan, 2026-11-04): watching the big feedback line in a
  real class.** It is measured to fit the 1366×657 screen in English and Spanish, but
  nobody has used it with a guitar. If students ever say they cannot read it in
  time, the wording for "on time but the chord sounded wrong" also has three
  variants (verdict "messy", count line "chord sounded wrong", big line "wrong
  chord") that could be unified (`games.cc.verdict.okMessy*`, `games.cc.breakdown`,
  `games.pw.last.wrong`).

- **A real mic check is not built.** Neither Note Runner nor Power Chord Switch
  has one; Note Runner has only a mic-delay slider (`nrOffset`). Power Chord
  Switch already uses that saved delay but shows no slider.
- **Takes are cut at 30 s, earlier than you'd think.** Measured with the real
  recorder: at the default (every beat, 60 BPM) the audio ends about 6 s into
  round 3; at 40 BPM in round 2; "every 2 beats" in round 2; "every bar" in
  round 1. The red label goes away when the audio stops. The saved `expected`
  list still has all 21 changes (times past `durationSec` are not in the audio).
  Raising the cap for Power Chord Switch is Jonathan's call (Firestore size);
  or only keep `expected` entries inside the audio.
- **Spanish for the new strings** was written in the same edit; no review sheet
  (house rule). Look at `games.pw.ladder.*`, `games.pw.songSub`,
  `games.pw.view.pairs`, `games.cc.breakdown` in `i18n.js` if a student reports
  odd wording.

## Review status

Reviewed the same day by `site-reviewer-deep` (always-reviewed: `firestore.rules`
and the mic game loop). No `Review: Fast` trailer on the commits. The reviewer
re-ran grading old-vs-new through the real `ccLoop` on a fake clock (pairs
792/792 identical, ladder rounds 2304/2304), 221 random Stop moments, 200 random
leave-the-screen moments, 2283 BPM-button presses: no break. What it found, and
what was done in the same push:

- Play screen did not fit 657px in Spanish or with the red label showing (Stop
  fell off the screen; chips widened mid-round). **Fixed:** the big line and the
  BPM buttons moved under the charts, chips keep a fixed symbol box, charts a
  little smaller; measured on all 16 switches in EN + ES, with and without the
  label, every chip graded (max 657px, Stop on screen); `tools/smoke.mjs` now
  walks Spanish, the label and the widest chips.
- The 1ck check could not see the recording behaviour (10 mutations stayed
  green). **Fixed:** stand-ins that track the capture, the label on every
  screen, a clean grid each round, ladder tempos, the consent footer, the
  anchored rules pattern, the strum log; all 12 mutations (the reviewer's 10
  + 2) now turn it red.
- Ladder from a base of 115 BPM or more was not "each round faster". **Fixed:**
  round 1 starts at most at 110 (110 / 125 / 140).
- `tools/mic-sim/eval-takes.mjs` now skips Power Chord Switch takes; comments
  and the changelog that over-claimed were corrected; asking for consent from
  the done screen no longer forgets a replay.
- Left as is: the three wordings for "on time but the chord sounded wrong"
  (verdict says "messy", the count line "chord sounded wrong", the big line
  "wrong chord"); a missed chip is faded grey while its big line is red;
  a remembered pick of the old "the cure" walk now opens Sweet Child's first
  switch (session only).
