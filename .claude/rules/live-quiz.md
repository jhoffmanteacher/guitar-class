---
paths:
  - "live-quiz.js"
---

## Live quiz — the whole-class game

All of it is in `live-quiz.js`: the quiz bank, the student overlay, and the
teacher's projected stage (`?teacher=true` → **Live quiz**). One game runs at
a time, in `liveQuiz/current` (+ an `answers/{uid}` subcollection).

- **The teacher is the only judge — for `mc` quizzes.** There is no answer
  key in the bank for those; Jonathan marks the correct choice at reveal.
  That's deliberate: the dashboard is on the classroom projector, so anything
  the app knew in advance would either spoil the round or need hiding from
  the room.
- **`type:'fret'` quizzes are the one exception.** The teacher picks a
  target note from the strip; the app scores the round from `LQ_NATURALS`
  when Reveal is pressed. Allowed because the answer is a fact of the
  fretboard, not something only the teacher knows — and the projector
  rule still holds: during a fret question the stage shows the prompt and
  the answered count, never the board with a marker, and the strip shows
  one Reveal button, never the fret. Answer ids are `'<string>:<fret>'`;
  octaves both count (`correctIds`). The board is `app.js`'s
  `fgBoardSvg(sid, kind, opts)` behind a `typeof` guard — the fret UI
  only ever renders on `index.html`, never on a Journey page.
- **The public session doc carries NO player name** (2026-11-05, Jonathan: no per-period minutes tied to a name, readable by anyone). `liveQuiz/current.scores` is
  `{uid: {pts, right, answered, last, lastRight}}`, read by every signed-in account, so a name next to a uid there would tie every uid-keyed doc on the site to a person.
  Names live only in the teacher-only `answers/{uid}` docs; the wall builds its leaderboard from them (`lqNames()` / `lqRankedNamed()`); a student's own end screen shows other
  players as "Student". `checks.mjs` 1cm runs the real writers (Reveal mc + fret, End, Close, Start) against a doc that merges like Firestore, starting from an older game full of names, and fails the push if a name gets back in. Never copy `a.name` into `scores`; `scores` entries are a WHITELIST copy (`lqPublicScore`), and the writers use `lqWrite(patch, 'fields')` (`mergeFields`: each named field is replaced whole, because a plain merge is deep and keeps old keys inside `scores`). The wall's lobby chips are sorted by name, never in answer-doc (uid) order. Open: names with points on the wall can be lined up in the room with the public uid -> points.
- **Nothing on the stage may reveal the answer before the reveal.** During a
  question the projector shows the prompt and an answered-count, nothing else.
  Any new stage content gets checked against that.
- **New quiz = a new entry in `LIVE_QUIZZES`**, with its student-facing text
  as `i18n.js` KEYS (`titleKey` / `promptKey` / `choices[].key`), not strings.
  `checks.mjs` 1f walks the bank and fails the push on a key that doesn't
  exist, the same way it does for `DECKS` and `EAR_POOLS`.
- **Students are invited, not teleported.** `lqSyncInvite()` puts up a modal
  with a Join button; it is re-checked on `visibilitychange`, because the
  first version silently auto-opened the screen, bailed on `document.hidden`
  and never retried — so a backgrounded tab (the common case: nobody is
  staring at the site when the teacher says "we're playing") got nothing.
  Any new "get their attention" path needs that same visibility re-check.
- **`speedBonus` stays off** for any quiz where the teacher makes the sound
  after the question opens — scoring by reaction time there just punishes
  whoever waited to hear it properly.
- **The teacher sets the time to answer** (2026-09-29): a "Time to answer
  … sec" box in the control strip, before Start and again between
  questions (half-second steps, blank/0 = no limit). Each question writes
  the box's value into `limitSec`, so it can change mid-game. Remembered
  per quiz in `localStorage` (`gc-lq-limits`) — a device convenience, not
  game state. Under 10 s the countdown shows tenths (2.5, 2.4 …) and ticks
  every 100 ms; `lqSecsLeft` returns exact seconds, not a ceiling, so a
  2.5 s limit really closes at 2.5 s.
- **`live-quiz.js` also ships on the six `tabs/*.html` Journey pages**, where
  it shows the "a game is running" banner and nothing else (`lqCanPlayHere()`
  gates the rest). Those pages have no `app.js`, so nothing in that file may
  come to depend on one — Firestore through `lqEnsureDb()`, the uid through
  `lqUid()`, and an app.js-only helper only behind a guard or a fallback.
  `journey.js` starts the listener once its own Firebase boot has landed.
  The banner's CSS is mirrored in `tabs/journey-theme.css` (those pages don't
  load `styles.css`) — restyle both or neither.
