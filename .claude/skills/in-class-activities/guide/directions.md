# Directions, four steps, the Journey button

**Every direction is ONE line** (Jonathan, 2026-11-10: "students don't read
them anyway"). Step `text`/`text_power`, `intro`/`intro_power`, check `text`,
`bassDirections`, a recording version's `intro`, and each drill's direction
line before Start.
- One sentence, verb first: what to play and the finish line together. "Play
  Line 1 into Line 2 four times without stopping." One rendered line in the
  folded view at 1366×657, English and Spanish. checks.mjs **1cs** caps the
  length (`CAP_2A` for the data, `CAP_2C` for the drill lines in i18n.js) and
  bans lists, line breaks and the got-it label in those fields.
- **Keep the count.** The tap dots come from the whole line: `caStepHtml`
  passes `wholeLine` to `wrapGotItWhen`, which reads `repCountFromGotIt` from
  the line when there is no "You've got it when:" label. Write a count it can
  read (a digit or two–five / dos–cinco, then "times", "in a row", "back to
  back", "veces", "seguidas"); "8 times" makes no dots. The module call does
  NOT opt in. **1bg** holds EN = ES, renders every activity step (its dots = its line's count) and every module set (the dot-group total is pinned), and counts the opt-ins in the app script and the console script (`app/*.js`, `teacher-*.js`).
- Cut: fix-it lines, finger-by-finger lists, recaps, definitions (use the plain
  word), "then press Play tab to check". Strings named, never numbered.
  Spanish: shorten the existing `_es`, reuse its words, buttons in «».
- A step whose drill widget already says what to do AND when it is done has
  NO text (ca-23: the pass line is under Start). The "Name the fret" shuffle
  steps (ca-11, ca-12, ca-17) keep one line, "Get 7 of 10 on your first pass,
  then try for 9 of 10.", and the "Find the note" deck steps keep theirs with
  the count: neither drill shows its finish line before Start.
- Each drill shows one direction line before Start (`.sdr-intro`); the
  second paragraphs (Note Call's `descAnswer` / `howTap` / `howCoach`, Name
  the power chord's `howAnswer` / `howScored`) were removed and 1cs keeps them
  out. Note Call's scored line has a mic-on twin (`nc.introCoach` /
  `ncp.introCoach`, picked by `st.coach`): with the mic on no tap is asked
  for. The header strip, switches, scores and pass lines are not directions.
- A practice card's own directions line (`.pc-dir`: `ca.cardDirections`,
  `ca.cardChordDirections`, `ca.cardStrumDirections`,
  `ca.cardChordMixedDirections`, `ca.sheetDirections`) is one line too
  (Jonathan, 2026-11-10). The chord/strum distinction stays: a chord card says
  "where each chord name starts", an every-strum card "every strum shows its
  chord name" (1cc / 1bv pin both). With Bass on (ca-35) `bassDirections`
  follows it as a second sentence, by his choice.
- Exit checks (ca-14, ca-15) are frozen and untouched. Modules keep the list
  and got-it rules (CLAUDE.md).

**Four steps, two lines a page** (Jonathan, 2026-09-25).
- **Four steps is a SOFT rule** (Jonathan, 2026-10-01): aim for four or fewer,
  but go past it when Jonathan asks — ca-21 has six. checks.mjs **1bb** prints
  one reminder line naming every card over four and never fails the push on it.
- Every class-activity tab longer than two rendered rows pages two rows at a
  time with Previous / Next: `CA_TAB_LINES_PER_PAGE`, passed as
  `defaultLinesPerPage` by `caStepHtml()` and `renderTeacherActivityDetail()`
  (1bb pins both). Play tab and a sibling band snippet turn the page as they
  play.
- `revealDelay` is **seconds**; `wrapTabReveal()` converts to ms. It is per
  tab and drops the Play tab button, so keep it off any tab whose Play is the
  answer key (ca-21) or the one demo of a held note's length.
- A waited-out tab stays revealed across re-renders that aren't navigation
  (language switch, tab return, Done on the last step) via `caRevealedTabs`; a
  Focus step move, a new student or a new day clears it.

**The Journey button is in the LAST step only — every class activity, now
and in future** (Jonathan, 2026-09-25). `caStepHtml()` adds it to the last
step's body and nowhere else.
- **Write a new activity with the Song Journey page named in its last step
  only.** An earlier listen-along goes on a `snippet` of the same backing
  track (ca-20 step 1 is the model).
- checks.mjs **1ba** fails the push on an earlier step naming the page (EN
  "Song Journey", ES "Recorrido de la canción", text or label), on a step
  naming it in an activity with no `journey:`, and on any
  `caJourneyLinkHtml(a)` call other than the one last-step-gated one.
