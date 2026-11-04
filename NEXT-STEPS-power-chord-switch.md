# Power Chord Switch — where we stopped (2026-11-03)

> **STATUS: this work is on the branch `pcs-pending-smoke`, NOT on `main`.**
> Jonathan's rule for this push was "push when the smoke tests are done". The
> last full smoke run on the final code was killed by the computer running out
> of memory, so it never finished. Nothing here is deployed yet. First step on
> any machine with enough memory (see "Finish the push" below).

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

## Finish the push (first thing)

1. `git fetch`, then `git checkout pcs-pending-smoke` (or `git merge` it into a
   fresh `main`; `git log HEAD..origin/main` first to see whether other
   sessions pushed meanwhile; `sw.js`'s `CACHE_VERSION` line may then conflict:
   take either side and run `node tools/checks.mjs`, which rewrites it).
2. `node tools/checks.mjs --skip-links` (expect "all checks passed"), then
   `node tools/smoke.mjs --baseline origin/main` (a real browser, about 4
   minutes, needs a few GB free: close other programs). Expect
   "no JavaScript errors beyond the baseline". The older smoke runs on this
   branch's earlier states: the last complete one (before the review fixes)
   was clean against the baseline; after the review fixes only the real-Chrome
   measurement of all 16 switches (EN + ES, with and without the recording
   label, every chip graded: tallest 657px, Stop on screen) and the offline
   checks (12 mutations red) were done.
3. If smoke is clean: fast-forward `main` to the branch, push, run
   `node tools/checks.mjs --live` (after `git pull origin main`). Delete the
   `pcs-pending-smoke` branch (local and `origin`) and this STATUS block.
4. If smoke shows a Power Chord Switch height or layout error, the likely spots
   are `.cc-last` / `.cc-play-bpm` under the charts and `--cc-chart-h` in
   `styles.css` (`.cc-cols-play`).

## Must do (Jonathan, in the Firebase console)

- **Publish `firestore.rules`** — Jonathan said he will do this from another
  machine (so: pull first, then Firebase console → Firestore → Rules → paste
  the whole `firestore.rules` file from the repo → Publish). GitHub Pages does
  not deploy it. **Not done yet as of this push.** Until it is, a Power Chord
  Switch take fails to save, quietly: the student sees nothing wrong, and the
  footer still says "each take is saved". **If mic collection is already on
  (teacher console → Mic recordings), every consenting student's Power Chord
  Switch game uploads up to 600 KB of audio that the server rejects until the
  rules are pasted. Paste the rules soon, or switch collection off until then.**
  The change is the take id `(coach|nr)` → `(coach|nr|pw)`, twice. After he says
  it is published: delete this item, and check the teacher console → Mic
  recordings shows a Power Chord Switch take once a student with consent has
  played a game to the end.
- Collection must be switched on (teacher console → Mic recordings) for any
  Power Chord Switch take to be asked for or saved.

## Next steps (not done)

- **Teacher console cannot measure Power Chord Switch takes.** "Evaluate all
  recordings" skips them (it only knows Coach and Note Runner notes). The list
  shows them, and WAV / data download work. Writing a Power Chord Switch
  evaluator (strum onsets vs. the change times in `expected`) is the next
  accuracy step; the data is saved for it (`expected` = each change's due time,
  verdict, round and BPM; `events` = every strum heard).
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
- **Review status:** see the last section.

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
