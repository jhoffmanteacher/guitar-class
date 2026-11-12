---
paths:
  - "live-quiz.js"
---

## Live quiz — the whole-class game

`live-quiz.js` holds the quiz bank, the student overlay and the teacher's
projected stage (`?teacher=true` → **Live quiz**). One game runs at a time, in
`liveQuiz/current` (+ an `answers/{uid}` subcollection).

- **The teacher is the only judge — for `mc` quizzes.** The bank has no answer
  key for those; Jonathan marks the correct choice at reveal. Deliberate: the
  stage is on the classroom projector.
- **The app scores every `type:'fret'` quiz itself**, because the answer is a
  fact of the fretboard: the three Fretboard tap quizzes and "Find the power
  chord" (2026-11-10, Jonathan). Only `mc` quizzes are judged by the teacher.
  The teacher picks a target from the strip; the app scores the round when
  Reveal is pressed, from `LQ_NATURALS` (a note quiz) or `lqPcRootAt()` (a
  `power:true` quiz).
  - "Find the power chord" (`pc-find`, `power:true`): the target is a chord's
    root (`target.note`, ♯ spelling, e.g. `'F♯'`), the strip offers
    E5 F5 F♯5 G5 A5 B5 C5 D5 on the low E and A strings, and every fret in
    `LQ_PC_FIND_FRETS` (0–12, an unconfirmed default) that is the root
    counts. F♯ is NOT in `LQ_NATURALS`: adding it there would put an F♯
    button into the three note quizzes. The stage reveal also draws the
    chord's chart box (`lqPcShape()`), after Reveal only.
  - "Name the power chord" (`pc-name`, `type:'pcname'`, 2026-11-11) is the
    app's too: the question is a chord box (`lqPcShape()`), the student taps
    one of eight fixed names E5 … D5 (`lqPcNames()`), the answer id is the
    name, scored at Reveal from `lqPcNameOf(target)`. The pool is 14 shapes,
    roots on frets `LQ_PC_NAME_FRETS` (1–10, an unconfirmed default) on low E
    and A. `target` is `{string, fret}` and NEVER the name: the doc first holds
    the name at Reveal (`correct`). The strip has Low E / A / Both chips and
    one Random shape button, never a name or shape button.
  - **The stage shows the chord box as the prompt on a Name question.** It is
    the one diagram on the stage before Reveal, and it is safe only because
    it carries no name: no `label` to `chordDiagramSVG`, and
    `gdChordAriaLabel` names strings and frets only. `checks.mjs` 1cu renders
    the stage and strip for all 14 shapes (lobby, question, every student
    answered) and fails on the name as a token. Don't add a caption, title or
    aria-label with the chord in it.
  - A new question type needs a sibling in every `lqType()` branch: student
    question + reveal, stage question + reveal, `lqTallyRows`,
    `lqPaintControls` (lobby / question / reveal), its Reveal writer,
    `lqTeacherEnd`'s wording, and checks 1f, 1cb and 1cm (re-pin both).
  - The stage never shows the board with a marker (stage rule below); the
    strip shows one Reveal button, never the fret.
  - Answer ids are `'<string>:<fret>'`; octaves both count (`correctIds`).
  - The board is the app's `fgBoardSvg(sid, kind, opts)` (`app/drills.js`) behind a `typeof`
    guard. The fret UI only ever renders on `index.html`, never on a Journey
    page.
- **The public session doc carries NO player name** (2026-11-05, Jonathan: no
  per-period minutes tied to a name, readable by anyone).
  `liveQuiz/current.scores` is `{uid: {pts, right, answered, last, lastRight}}`,
  read by every signed-in account.
  - Names live only in the teacher-only `answers/{uid}` docs. The wall builds
    its leaderboard from them (`lqNames()` / `lqRankedNamed()`). A student's own
    end screen shows other players as "Student".
  - Never copy `a.name` into `scores`. `scores` entries are a WHITELIST copy
    (`lqPublicScore`).
  - The writers use `lqWrite(patch, 'fields')` (`mergeFields`: each named field
    is replaced whole; a plain merge is deep and keeps old keys inside
    `scores`).
  - The wall's lobby chips are sorted by name, never in answer-doc (uid) order.
  - `checks.mjs` 1cm runs the real writers (Reveal mc + fret, End, Close,
    Start) against a doc that merges like Firestore, starting from an older
    game full of names, and fails the push if a name gets back in.
  - Open: names with points on the wall can be lined up in the room with the
    public uid -> points.
- **A `firestore.rules` change for the quiz ships with a console paste.** Until
  Jonathan pastes it, the answer writes are rejected and the game looks broken,
  with no error a student sees.
- **Nothing on the stage may reveal the answer before the reveal.** During a
  question the projector shows the prompt and an answered-count, nothing else.
- **New quiz = a new entry in `LIVE_QUIZZES`**, with its student-facing text
  as `i18n.js` KEYS (`titleKey` / `promptKey` / `choices[].key`), not strings.
  `checks.mjs` 1f fails the push on a key that doesn't exist.
- **Students are invited, not teleported.** `lqSyncInvite()` puts up a modal
  with a Join button and is re-checked on `visibilitychange`. Any new "get
  their attention" path needs that same visibility re-check.
- **`speedBonus` stays off** for any quiz where the teacher makes the sound
  after the question opens.
- **The teacher sets the time to answer**: a "Time to answer … sec" box in the
  control strip, before Start and between questions (half-second steps,
  blank/0 = no limit).
  - Each question writes the box's value into `limitSec`.
  - Remembered per quiz in `localStorage` (`gc-lq-limits`): a device
    convenience, not game state.
  - Under 10 s the countdown shows tenths and ticks every 100 ms. `lqSecsLeft`
    returns exact seconds, not a ceiling.
- **`live-quiz.js` also ships on the six `tabs/*.html` Journey pages**, where
  it shows the "a game is running" banner and nothing else (`lqCanPlayHere()`
  gates the rest). Those pages do not load the app script (`app/*.js`), so nothing in that file may
  come to depend on one: Firestore through `lqEnsureDb()`, the uid through
  `lqUid()`, and an app-only helper only behind a guard or a fallback.
  The banner's CSS is mirrored in `tabs/journey-theme.css` (those pages don't
  load `styles.css`) — restyle both or neither.
- **A reload keeps the round's clock** (2026-11-12): `lqRoundOpenedAt()` keeps the moment the tab first saw a
  question in sessionStorage (`lq-q-opened`), so the countdown and the speed points carry on after a reload.
  Not closed, on Jonathan's list: a NEW tab or another device starts a fresh clock, and two tabs open at once
  can each answer (the last tap wins). After any change to `live-quiz.js`: `node tools/live-quiz-loop.mjs`
  once that tool is on main.
