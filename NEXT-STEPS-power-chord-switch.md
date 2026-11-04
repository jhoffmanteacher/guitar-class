# Power Chord Switch — where we stopped (2026-11-03)

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
   this take" label on every screen of a take, saved only when a game is played
   to the end, never for Change Up). One capture covers all three rounds and is
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

## Must do (Jonathan, in the Firebase console)

- **Publish `firestore.rules`** — Jonathan said he will do this from another
  machine (so: pull first, then Firebase console → Firestore → Rules → paste
  the whole `firestore.rules` file from the repo → Publish). GitHub Pages does
  not deploy it. **Not done yet as of this push.** Until it is, a Power Chord
  Switch take fails to save, quietly (the student sees nothing wrong). The
  change is the take id `(coach|nr)` → `(coach|nr|pw)`, twice. After he says
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
- **Takes over 30 s are cut.** A three-round game at 60 BPM is about 30 s with
  count-ins, so the last seconds of slow games may not be in the audio.
- **Spanish for the new strings** was written in the same edit; no review sheet
  (house rule). Look at `games.pw.ladder.*`, `games.pw.songSub`,
  `games.pw.view.pairs`, `games.cc.breakdown` in `i18n.js` if a student reports
  odd wording.
- **Review status:** see the last section.

## Review status

(filled in by the session that pushed)
