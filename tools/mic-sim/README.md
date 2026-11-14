# Mic-detection simulators

Tools used to tune the loud-room / Chromebook listening (2026-10-07/08).
They drive the REAL functions extracted from `coach.js` with a synthetic
mic. Nothing on the site references this folder. Keep it for the next
tuning pass — ideally on the real classroom recordings the teacher console's
"Mic recordings" view now collects (Download WAV + Download data).

**Since the 2026-11-11 cut** there is no `coach.js`, `app.js` or `teacher.js`
file: each is a set of part files (`coach-core.js` and the other `coach-*.js`,
`app/*.js`, `teacher-*.js`). In this README the three names mean the whole
script.
- **As an argument the old names still work inside the repo**:
  `node tools/mic-sim/power-wait.mjs coach.js` reads the whole script
  (`readScriptArg` in `tools/site-src.mjs` joins the parts in load order when
  the path is one of the three names in a site folder, one with an
  `index.html`). Any other path is read as the file it is.
- **An export of an OLD version**: `git show <ref>:coach.js > file` works only
  for a ref BEFORE the cut. For a ref after it: `mkdir <dir>`, then
  `git archive <ref> | tar -x -C <dir>`, and pass `<dir>/coach.js` (and
  `<dir>/app.js` where a tool takes both).

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
- `power-notecall.mjs <coach.js> <app.js> [trials] [--harm=std|mid|weak] [--only=…]
  [--per-root] [--offsets=…]` — Note Call's power-chord mode (ca-43,
  2026-10-30): one synthetic strum or wrong note in a quiet room for every
  root the whole-neck step can call (low E and A strings, frets 0–12 = 26
  roots, built the way `ncPool` builds the cards) through the real settle code
  and the accept rule read from the files under test (`ncTargets` /
  `ncAnswerAt` / `ncPowerTones` in app.js; root, octave and octave below, not
  the 5th, since 2026-10-31), so an old
  coach.js + app.js (`git show <old>:coach.js`) gives the before and the
  current pair the after. Wrong cases accepted more than 1 in 100 are marked
  STOP. `--offsets=-12,0,7,12` is a what-if: answer each root with those
  semitone offsets without editing app.js. Needs both files, not just
  coach.js. Synthetic audio, not a guitar through a Chromebook mic.
- `power-switch.mjs <coach.js> [trials] [--harm=std|mid|weak] [--clarity=…]` — Power Chord Switch (Change Up's engine on the three-finger power chords, 2026-10-30): every adjacent pair in `CC_POWER_PROGRESSIONS` through the real `coachPitchReadings` / `ccResolvePend`, as a real change, a held chord (never moved) and a chord one fret high, with `0.55` against `RNW_POWER_CLARITY`. The numbers in the `ccLoop` comment come from here. Synthetic audio only.
  Since 2026-10-30 the game's "Two random chords" draws only one of the 11 listed pairs (in either order), so
  every pair a student can get is one this tool covers; before, a pool of six chords could draw four
  jumps (F5-D5, G5-B5, A5-B5, A5-C5) it never tested.
- **`closed-loop.mjs` + `student.mjs` (2026-11-11) — the closed-loop test.** A virtual student (`student.mjs`:
  plucked-string guitar, pick / thumb / finger, wrong chords, held chords, skipped strums, loose or late rhythm, a
  room, a laptop mic) plays WHOLE Power Chord Switch games into the real site code in a vm: `ccPrepare`,
  `ccBeginStage`, `coachCountIn`, `ccLoop`, `coachReadFrame`, the pitch readings, `ccResolvePend`, a song switch's
  three rounds and `ccFinish` all run as written, on a virtual clock, with nothing stubbed between the mic and the
  verdict. The student keeps an answer key, so the table is truth against verdict: a right chord said right, a
  chord one fret high caught, a chord that never moved caught, a strum heard where there was none.
  `node tools/mic-sim/closed-loop.mjs` (options in its header; `list` names the students, rooms and mics;
  `--coach=<file>` runs another coach.js for a before / after). Unlike `power-switch.mjs` (one change, sine sums, a
  copy of ccLoop's logic) it plays every beat of every round and includes the site's 70-1500 Hz mic filters, which
  the older tools here leave out. Synthetic. One number is fitted to the classroom takes (how long a string rings, `ringS`: the reason is in
  `student.mjs`); the touches, the rooms and the mics are guesses until the takes are run against them. Not in `checks.mjs`. Power Chord Switch and Change Up (`--game=changeup`, below); `student.mjs` knows nothing
  about the site, so the next game needs only its own runner.
  **The `neverMoves` row before 2026-11-11 (late):** that student held chord 1 for the whole game, so on a two-chord
  pair every second change it marked "held" was really the right chord (`--replay` showed all 7 G5>F5 changes of an
  F5-G5 game as "held, said ok"). Every "never moved: caught" figure for `neverMoves` measured before then (WORKFLOW.md's
  first-numbers entry: "caught 28%") was measured with that flawed student. A held change now always strums the old
  chord of that change. The `beginner` student moves too, on a held change right after another held, a wrong or a
  silent one (the hand used to keep what it last strummed: on a two-chord pair that can be the new chord; after a wrong
  change, the chord one fret high); later changes of that game can then read differently, because the student's one
  random stream also makes the pluck noise. Beginner figures from before then are close but not the same; students
  who never hold (steady, wrongFret, thumb...) and the no-guitar cases are unchanged byte for byte. Virtual takes saved
  with `--takes-out` before then carry the old key in `virtual.key` for those changes; nothing in this folder reads
  `virtual.key` (replay-takes.mjs copies the field into a summary and does not use it; eval-takes.mjs ignores it), and
  the 462 of 480 / 924 of 960 figures compare the site's replay with the site's own saved verdicts, not with the key.
  **`--no-guitar`** (2026-11-11, Jonathan: "it's marking things right where there's nothing playing"): twelve cases
  in which no chord is played in the whole game (a dead mic, a quiet room, a fan, one voice, a class talking, bumps,
  typing, a partner's guitar, a class of guitars, a loud class, desk taps on every beat, strums across muted
  strings; `NO_GUITAR` in the file). A case passes only when nothing is marked right, and the run exits 1 when any
  fails. On the current rule (1.8 / 2.19) 9 of 12 fail, which is the bug it was written to show, so it is not in
  `checks.mjs`: it goes there when the game passes it.
  **The muted-strums case before 2026-11-12:** the "muted" strum plucked the RIGHT chord's strings and lifted them 4 ms
  later; they still rang when the pitch readings began, so the game heard the right chord. Every muted-strums figure
  before then, in both games, and the "9 of 12" headline, were measured with that strum. It is now a damped scratch
  with no pitch (`student.mjs`, kind `mute`). Measured after the change (60 BPM, one seed): Power Chord Switch F5-G5
  still said right 15 of 15 (before: 5 with 3+ pitch readings and 10 on timing alone; now 0 and 15), Change Up's three
  default loops 21 of 21 (before 16 and 5; now 0 and 21). A strum with under 3 pitch readings counts on timing alone,
  by design (ccLoop's comment), so a pitchless scratch on the beat is still marked right, and both runs still read
  9 of 12 FAIL. Every other case and every table student gave byte-identical `--json` before and after.
  **`--game=changeup`** (2026-11-11): the same test on CHANGE UP, the sister game on open chords (same `ccLoop`, but the
  shared, looser strum ratios `CHK_ONSET_RATIO` / `CHK_HF_RATIO`, 1.4 / 1.7, and the 0.55 chord gate). Its defaults: 40, 60,
  90, 120 BPM, a change every bar, the loops Am-Em, G-C-D, C-G-Am-F (`--pairs=all` = its 21 loops; Random 4 is left out,
  it draws with `Math.random`). The student's wrong chord is another chord of the loop (a two-chord loop: one from
  `CC_RANDOM_POOL`), and a held chord is the old chord strummed again. The chords in the student's hands are worked out
  from `CHORD_DIAGRAMS` in the tool, not by the game's own `chordMidis`; a fake-world check stops the run when the two
  disagree. `--no-guitar` works with it. `tools/grid-sim.mjs` Part 2 plays Change Up on scripted frames with no sound;
  this one plays sound. Synthetic sound, not a classroom.
  Its table splits two columns by what the game lets through BY DESIGN (worked out in the tool from the chord shapes'
  pitch classes, never by asking the game; such a change has `byDesign: true` in `--json`):
  - **other chord caught: no shared note / rule 2 / passes both (by design).** ccResolvePend grades with two rules:
    rule 1, "some tone of the NEW chord" is heard; rule 2, notes only the OLD chord has must not outnumber notes only the
    new one has. The tool applies both to the played shape, one ideal reading per string (`wrongClass`): "no shared
    note" = rule 1 catches it; "rule 2" = it shares a note with the new chord but rule 2 should still catch it (Am>Em
    playing C, Am>F playing A, Em>C playing G); "passes both" = the rules let it through by design (Em>Am playing Dm, G>C
    playing Em; the old chord matters: F>Am playing Dm is a rule-2 one).
    The first two columns measure a miss; only "passes both" is `byDesign` (`wrongClass` in `--json` says which).
    `node tools/mic-sim/closed-loop.mjs list --game=changeup` counts every wrong chord a student can be given: 181
    (loop, old, new, other), 129 different; 61 with no shared note, 120 sharing one, of which rule 2 should catch 31 and
    89 pass both. The ideal readings are what the rules intend: real readings are fewer and lean on the bass string.
  - **old chord again caught: rest / lenient pair.** The held chord (the chord the change leaves, strummed on the change;
    `neverMoves` does this on every change, one chord behind). A "lenient pair" is old and new being one of the pairs the
    same comment says it cannot tell apart ON PURPOSE (E/Em, A/Am, C/Am, G/Em).
  Measured 2026-11-12, `--game=changeup --students=beginner,wrongFret,neverMoves --rooms=quiet,class --seeds=1` (72
  games, the default loops and tempos): a wrong chord with no shared note was caught 68 of 75 times (7 said right, 3 of
  them with under 3 pitch readings, on timing alone); a "rule 2" one 33 of 46 (13 said right: changes the game's rule 2
  is written to catch, so they are misses too); one that passes both rules 41 of 75 (34 said right, by design). The
  figure before 2026-11-12, "shares a note 74 of 121 (47 said right, by design)", lumped the rule-2 ones in with the
  by-design ones and is withdrawn. The
  old chord again (none of the default loops has a lenient pair) was caught 116 of 180 (64 said right). The lenient
  pairs need loops that hold them: `--students=neverMoves --rooms=quiet --pairs=C-Am-F-G,G-Em-C-D,Am-C-G --bpm=60,90
  --seeds=1` caught the rest 17 of 28 and the lenient pairs 5 of 14. The earlier "28 of 30 / 39 of 157" split by the
  lenient pairs was the wrong split for a wrong chord and is withdrawn.
  Power Chord Switch keeps its column name "never moved: caught", which means the same thing (the old chord strummed
  again) since the d75f0ee fix.
  Three options for any game: `--root=<folder>` (load the site from another folder: a checkout or a copy with a planted
  fault), `--against=<file>` (compare with an earlier `--json` of the same command) and `--replay=<n>` (play game n
  alone and print every change; n a positive whole number, anything else exits 2). `--against` ranks each verdict that
  moved by the answer key: for a right chord, "right" beats the two wrong verdicts; for a wrong or held chord, "wrong
  chord" beats "no strum", which beats "right"; for no strum, "no strum" beats "wrong chord", which beats "right". A
  move down is WORSE (so "wrong chord" -> "right" with nothing played is worse), up is better, sideways is "between two
  wrong verdicts". A by-design Change Up mistake (a "passes both" wrong chord, a lenient-pair held one) moving between
  "wrong chord" and "right" is counted on its own; moving INTO "no strum" it is WORSE (the strum went unheard), out of
  it better. A "rule 2" wrong chord is not by design: "wrong chord" -> "right" is WORSE.
  With `--against` the exit code is about the comparison ALONE, in `--no-guitar` too: 0 = no verdict moved; 1 = one
  moved, or the site graded a different set of changes with every world setting the same (a site change such as the
  number of changes a round grades: "the SITE graded a different set of changes in ... games", those games not
  compared); 2 = not the same command (game count, game, case, student, room, mic, rate, `--lag`, fps, tempo, loop or
  seed differ; or a `--json` from another student model: every game records `model` = `STUDENT_MODEL` in
  `student.mjs`, and files from before 2026-11-12 have none, so they are refused), the same file as `--json`, or a file
  that is not a `--json` of this tool. The file is read before the run starts. Every option is one `--name=value`
  argument: an unknown or misspelt option, a space instead of `=`, an option given twice or a number that is not one
  exits 2 before anything runs, and so does any error in the run, so 1 always means the site graded differently (or,
  without `--against`, a no-guitar case failed). `--replay` is refused with `--against` or `--json`. The first line
  printed names the site folder the scripts came from.
  **To see a change to the strum rule or the miss window, name the players who sit near them.** A steady player in a
  quiet room is far from both, and a planted `CHK_ONSET_RATIO` 1.4 -> 1.7 or a miss window of 0.25 beat moved no verdict
  there. What moves:
  - the strum rule (onset ratios): the no-guitar cases with sound that is not a strum (one voice, a class talking, a
    partner, class guitars). `--game=changeup --no-guitar --bpm=60 --pairs=Am-Em --seeds=1 --against=<today's --json>`
    with the 1.7 ratio: "9 of 84 graded changes differ (5 worse by the answer key, 4 better, 0 a mistake the game may
    pass by design, 0 between two wrong verdicts) in 12 games  RED" (the 5 worse: a class talking or a loud class, no
    chord played, "wrong chord" -> "right"). Soft players in a class move only a little: `--students=softThumb,soft
    --rooms=class --bpm=120` moved 1 of 42.
  - the miss window: a student who is late ON THE CHANGE (`beginner`, `changeLateMs`), at a fast tempo. A student late on
    every beat (`late`) is not enough: the grid follows them. `--game=changeup --students=late,loose,beginner
    --rooms=quiet --bpm=120 --seeds=1` with 0.25 beat: "2 of 63 graded changes differ (2 worse by the answer key) RED",
    both in `beginner` games (a right chord and a held chord, each now "no strum"; printed before the ranking above, and
    both rank worse under it too).
- **REAL TAKES in `closed-loop.mjs` (2026-11-12; Jonathan: "we'll have to rely on recorded student takes. build that
  into the closed loop check").** Every Power Chord Switch run of `closed-loop.mjs`, the table and `--no-guitar`, ends
  with the take summaries in `tools/mic-sim/takes/` replayed through the loaded site's real `ccLoop` with the run's
  `--rule` at the site's own strum ratios: takes and changes, windows with no strum in the recording that the game
  HEARD and marked RIGHT, real strums it LOST, the "reproduced" error bar, and the ASK JONATHAN lines. It is
  `replay-takes.mjs`'s code, imported, not copied; `replay-takes.mjs` itself prints byte-identical text and `--json`
  to before. `--no-takes` leaves it out, `--takes-only` runs only it; `--root`, `--coach` and `--rule` apply to it.
  `--json` is `{ tool, games, realTakes }` (a bare list of games from before still reads as a run without takes), and
  `--against` compares the takes per take and per change, prints them FIRST, and ranks them by the recording: no strum
  moving to "heard" or "right" is WORSE, a real strum newly lost is WORSE, "right" <-> "wrong chord" on a real strum
  is not ranked (the takes do not say which chord was played). A run with the takes against a file without them (or
  the other way) is not the same command (exit 2), and so is a pair of runs that do not hold the same takes (a take in
  only one of them, or a different number of changes with a verdict): "NOT THE SAME TAKES; nothing compared". Real
  takes outrank the synthetic rooms when the two disagree: the rooms are guesses beside them. Time: 4-30 s with
  nothing cached (it depends on the machine's load), about 1 s cached (one small file per summary and site code in
  `tools/mic-sim/.replay-cache/`, gitignored; the key hashes this tool, `replay-takes.mjs`, every script the site ran
  and the summary, so any change replays again). The cache is trusted as it is: nothing checks an entry against a
  fresh replay, so delete the folder if in doubt; an entry that cannot be read is replayed and written again (through
  a temporary file). `replay-takes.mjs` alone takes 4-5 minutes because of the three `ring` rules; base alone is 5 s.
  What it can judge: the strum rule and `ccResolvePend`'s grading, on what the mic really heard. What it shows but
  cannot rank: a change to the miss window or the grid, because the truth ("a strum where the game listened") was
  worked out with the window the take was graded with; a rule that widens or moves the window and hears a real late
  strum is counted as hearing "no strum" (a planted 150 ms shift: 10 worse, 7 better, 13 not rankable). It knows only
  whether there was a strum, never which chord: a change to the pitch grading shows in "marked right" but cannot be
  ranked, and a comparison that is mostly "right <-> wrong chord" says "the takes do not decide this change". What it
  cannot judge at all: a change to `coachDetectPitch`, the mic chain, `COACH_LVL_WIN` / `COACH_LVL_HOP` or `COACH_FFT`
  (the summaries hold readings made with the old ones; `staleReasons` in `replay-takes.mjs` compares the detector
  stamp and the `measured` values, which the 21 summaries made before 2026-11-12 lack and are taken as 1024 / 512 /
  4096, the values at `2fb5035`). Such a run prints "THE REAL TAKES CANNOT JUDGE THIS SITE" above and below its numbers,
  and `--against` refuses it (exit 2). Frames are evenly spaced.
  **Noise.** Moving only each take's clock offset (-20, +20, -40, +40, -100 ms, and the 6 takes without an offset from
  strums to -70 ms) on today's rule moved "no strum heard" 35-37 of 54, "marked right" 17-26, lost 5-8 of 150 and real
  strums marked right 80-85 (`TAKE_BAR`). Read a difference between two rules as real only when it is bigger than
  about 2 (heard), 8 (marked right), 3 (lost) or 5 (real strums marked right). The earlier "3 or fewer" bar (the summary
  replay against the audio replay) holds for heard and lost, not for marked right. 4 of the 21 summaries have no judged
  change (17 carry the 210), which the section prints.
  Measured 2026-11-12 on the 21 summaries (210 judged changes; 54 with no strum in the window, 150 real strums the game
  heard), `node tools/mic-sim/closed-loop.mjs --takes-only` and `--root=<copy>` for the other ratios:
  no strum heard / marked right / real strums lost: today (1.8 / 2.19) 37 / 24 / 6; 1.5 / 1.83 50 / 32 / 1;
  1.9 / 2.31 35 / 22 / 9; 2.0 / 2.43 31 / 20 / 14; 2.1 / 2.55 30 / 19 / 16; 2.2 / 2.67 22 / 13 / 18; `half3` at
  today's ratios 37 / 19 / 6 (real strums marked right 81 -> 64). Error bar: 165 of 210 saved verdicts reproduced
  (heard or not: 200 of 210). Planted in a copy: a looser ratio (1.5 / 1.83) gave "no strum in the recording 15
  worse"; a stricter one (2.2 / 2.67) "1 worse, 18 better; real strums 14 newly LOST"; a stricter pitch rule
  (`anyNew > 0.6`) "0 worse, 11 better, 28 right <-> wrong chord on a real strum".
  **What the sweep says, read with the noise bars:** 1.9 / 2.31 is no different from today (heard -2, marked right -2,
  lost +3: all inside the bars). 2.0 / 2.43 and 2.1 / 2.55 hear 6-7 fewer empty windows (outside the bar), but
  "marked right" falls only 4-5 (inside it), and they lose 8-10 more real strums (outside it). Only 2.2 / 2.67 cuts
  "marked right" by more than the bar (-11), and it loses 12 more real strums. `half3`'s "marked right" drop (-5) is
  inside the bar; its real strums marked right fall 17 (outside), which the takes cannot rank because they do not say
  which chord was played. So no ratio change the takes support: every step that removes false rights beyond the noise
  loses real strums beyond it.
- **`candidates.mjs`** (2026-11-11): candidate Power Chord Switch grading rules (`ring`, `half`, `half3`, `both`,
  `both3`; what each does is in its header), applied to coach.js IN MEMORY. None is in coach.js. `closed-loop.mjs
  --rule=<name>` plays one; `replay-takes.mjs` replays them on real takes. Those five were written for the first-strum
  `ccLoop` and stop with a message on today's site (run them with `--root=<a checkout from before 2026-11-13>`).
  The window / pick rules (2026-11-13, `WINDOW_RULES`): which strum decides a change. Since 2026-11-13 the site's own
  rule (`base`) is the strum NEAREST the change; `first` is the rule before it (the first strum in the window), and
  every take saved before carries no `changePick` stamp, so the "reproduced" line replays those under `first`
  (`replay-takes.mjs` `ownRule`). `same` must equal `base` on every change. Fixed caps (`w250`..`w700`), `last`,
  `best` and the grid switches (`...g0`, `...gd`) were measured and NOT chosen. `change-window.mjs` prints the real-take
  table for any of them.
- **`replay-takes.mjs <folder>`** (2026-11-11): each candidate rule on the REAL takes' audio, through the real `ccLoop`
  (the recording goes back through the site's mic chain; nothing is replayed from the take's saved strums). Counts,
  per rule, the changes with no strum in the window that the rule still hears / marks right, and the real strums it
  loses, at the take's own strum ratios and at today's. Its "reproduced" line (the base rule against the take's saved
  verdicts) says how far to trust the rest: 462 of 480 on model takes (`closed-loop.mjs --takes-out=`). The
  evaluator's "strum" is any attack in the audio, so a tap counts as a real strum there. Never commit takes.
- **`takes-in.mjs` — ONE command brings new classroom takes in** (2026-11-11): `node tools/mic-sim/takes-in.mjs` (the
  newest `mic-recordings*.zip` in Downloads, or a folder or zip you name). It unzips, anonymizes, evaluates, writes one
  SUMMARY per Power Chord Switch take to `tools/mic-sim/takes/` (loudness and attack energy 94 times a second, the
  detector's pitch at each point, the game's numbers, the evaluator's truth; no audio, no names), checks the
  summaries against the audio, deletes its temporary copies and commits the summaries (it does not push). With
  summaries in the repo, `node tools/mic-sim/replay-takes.mjs` (no folder) replays any rule on the real takes from any
  session. On model takes the summary replay gave the audio replay's verdict on 924 of 960 changes (heard or not:
  950 of 960). A summary cannot test a change to `coachDetectPitch`, the mic chain or the window sizes: keep the
  audio (outside the repo) for those.
- **When to ask Jonathan for new takes:** `closed-loop.mjs` (its REAL TAKES section) and `replay-takes.mjs` print
  "ASK JONATHAN" with the reasons (no summaries; the
  detector changed; no take was graded at today's strum ratios; or, as a backup, the newest take is older than the
  last commit that changed a listening constant's own line in coach.js). Pass that on to him in
  the report; do not ask otherwise. Old takes or few takes alone print a "Note" line, which is not a reason to ask
  him (his call, 2026-11-11). The Friday check runs it every week (skill
  `friday-check`, step 5b), so he is told within a week without anyone working on listening.
- **Fitted rooms** `room7`, `room4` in `student.mjs` (Jonathan, 2026-11-11, fitted to the 21 real takes).
- **THE LISTENING BENCH (2026-11-12; Jonathan: "i would like the audio detection from power chord switch to apply
  site-wide like to listening coach, etc.").** The Power Chord Switch tools, widened to every feature that listens.
  Four files, one job each; every one loads the site UNCHANGED in `closed-loop.mjs`'s vm and reads its verdicts from
  the site itself:
  - `listen-site.mjs` (not a command): the runners. The real Listening Coach (`coachOpen` with the button the site
    renders, `coachStartCheck`, `coachLoop`, `coachFinish`, `coachRenderReport`: the level the student sees and the
    level saved for the skill), Note Runner (`nrLoop` / `nrFinalizeEvent` / `nrFinish` on a take's own notes, set up
    the way `nrStart` sets a round up) and Strum Radar (`srStart` / `srLoop` / `srFinish`). The mic opens through the
    site's own `coachAcquireMic` against a fake `getUserMedia`; a fake signed-in student whose `saveGames` is only
    counted. Sound from a recording, its summary, or a `student.mjs` room.
  - `room-onsets.mjs <takes folder>` (step 1b): every recorded take, any game, through the real `coachLoop` as an
    onset probe; the sounds the shared onset rule takes where the console evaluator finds no attack, per minute of
    room sound and per EMPTY window of each game's own width (read from the site: Strum Radar `s.win`,
    `coachMatchWinMs()`, Note Runner `goodMs`). About 1 minute.
  - `no-guitar-listen.mjs [--takes=<folder>]` (the C1 test): nothing played, into the real Coach on every
    Coach-gated chord and melody skill (its own button, its own tempo) and Strum Radar on every pattern; the level the
    report shows, the level saved and whether the check-off gate opens (the site's own test from `toggleSkill`).
    Synthetic rooms (`NO_GUITAR`) and, with `--takes`, each take's room sound (`takes-audio.mjs`: the stretches with no
    attack, a second after the last one, no count-in, spliced with 250 ms equal-power fades; the tool prints how many
    onsets sit near a join against how many would by chance). Exit 1 when anything gave credit for nothing (today: it
    does), so it is not in `checks.mjs`. About 2 minutes for chords + radar, 25 with melody and the recorded rooms.
  - `replay-listen.mjs [folder]` (step 3): the recorded Listening Coach (melody, chords) and Note Runner takes through
    the real loops, from the summaries in `takes/` (no folder) or from audio: per mode, real notes named right / half
    / unclear / wrong / missed, notes the recording clearly holds that the site did not count (by the site's own
    reason), sounds counted where nothing was played, and the "reproduced" error bar. `--noise` moves each take's
    clock offset 20 to 100 ms; `--own-day` (audio only) replays each take on the site of its own day, which is the
    replay's own error; `--against` ranks per note by the recording. About 5 s from summaries.
  `takes-in.mjs` now keeps the Coach and Note Runner takes as summaries too (`kind`, pitch at 0.22 and 0.55, the
  saved verdicts and readings, the evaluator's truth; `--games=` picks which games to write), and `closed-loop.mjs`'s
  REAL TAKES section replays them after the Power Chord Switch ones (`realListen` in `--json`; `--against` compares
  them). The Power Chord Switch summaries and their replay are unchanged (byte-identical output from the old and the
  new `takes-in.mjs` on the same folder).
  **Measured 2026-11-12/13 (34 anonymized takes: 21 Power Chord Switch, 8 Coach melody, 1 Coach chords, 4 Note Runner):**
  - Rooms: the shared onset rule took 194 sounds in 87 s of room sound with nobody playing (133 a minute; every period
    and game alike, 107-143). An EMPTY window gets a hit: Strum Radar 70-87% (by pattern), the Coach at 60 BPM 656 of 656,
    Note Runner 67%. Noisiest: T05, T12, T20, T01, T15 (Power Chord Switch), T28 (Coach).
  - Nothing played (C1): the Coach's check-off gate opened in 30 of 72 chord takes and 211 of 552 melody takes in the
    synthetic rooms, 92 of 108 and 524 of 828 in the recorded rooms (dead mic, quiet room and fan: never). Two ways in:
    every slot "unclear" (pitch scored 2 by the chord-mode dim rule, completion 3: desk taps, typing, muted strums), and
    pitch 1 with timing and completion Great ("Good" needs only two Greats, of any criteria). Strum Radar with nothing
    played: median 29% (synthetic) and 78% (recorded rooms), 70 of 72 recorded-room rounds earn a star.
  - Replay of the 13 Coach / Note Runner takes: reproduced 46 of 64 (melody), 6 of 8 (chords), 51 of 74 (Note Runner) from
    the summaries; on the site of each take's own day (`--own-day`, audio) 47, 4 and 53. Noise (`--noise`, summaries):
    melody real notes right 13-16, Note Runner 11-21.
  - Proof: planted in `--root` copies, the halved Coach match window moved 2 of 146 notes, `COACH_PITCH_GATE` x10 2 (both
    worse), the chord rule "wrong at 1 reading" 2, a flipped Note Runner grade 43 (29 worse); a changed clarity (0.22 ->
    0.15) is refused (CANNOT JUDGE, exit 2). A fake microphone that refuses stops the run (exit 2); the take's clock
    offset applied backwards drops Note Runner's reproduced 51 -> 23 (the Coach's, which follows the player, barely moves:
    46 -> 45).
  - What the takes cannot judge: Note Runner's timing window (the replay uses the window the take saved; `nrStart` is not
    run), a changed pitch-detector clarity or mic chain (needs the audio), which note a student meant, and the report's
    level (shown, never ranked: a take holds no level).
- **`listen-loop.mjs` + `note-student.mjs` (2026-11-13, the listening bench step 4): the closed loop for every game that listens to
  single notes or strums.** A virtual student plays the REAL Listening Coach (melody on the Coach-gated playSeq skills, chords on the 6
  gated chord skills, each from the button the site renders), Strum Radar (its four patterns) and Note Runner (real levels: `nrStart` builds
  the round, `Math.random` seeded) in closed-loop.mjs's vm, and keeps an answer key written before any verdict.
  `node tools/mic-sim/listen-loop.mjs --game=melody|chords|radar|runner` (options in its header; `list` names the student kinds with what
  the gate SHOULD do for each: pass / fail / either). Kinds: right, late / early (150 ms), loose (200 ms spread), quiet (-10 dB), ring,
  thumb, finger; one note a fret off, one on the wrong string, one skipped, the whole line a fret off; chords: one bar of another chord,
  two strums skipped, the first chord held all the way; Strum Radar: missed strums, extra strums, strums on the wrong eighths; Note Runner:
  every fourth note wrong or skipped, 100 ms late / early, 250 ms late; and nothing played, desk taps, muted strums. Rooms default quiet,
  room7, room4, class; `--mics=chromebook,thin` for both mics. Same options as closed-loop.mjs: `--seeds`, `--json`, `--against` (ranked by
  the key per note, plus the gate, the report's level, its "Right notes" line, Strum Radar's score and stars), `--replay=N` (one take with
  its timeline and every sound the Coach took), `--root`. Every take's key is checked against the student's own guitar track (a pitch
  written in the tool, an attack, no attack where nothing was played); `--break=key` corrupts it and the run stops (exit 2), in all four
  games. The site's tuning, the Coach's chord row and Note Runner's chart are checked against the student's too.
  **The fit (`--fit`).** The 8 real Coach melody takes' own lines, played by the `right` student, next to the real takes: attack over
  the room, fallen after 300 ms, pitch before the attack, readings 0 / 1 / 2+, the Coach's verdicts. note-student.mjs FIT (noteAmp 0.05,
  ringS 0.45) matches the loudness, the decay and the share of notes with under 2 readings in room4. It does NOT match the verdicts in
  the fitted rooms: room4 right 8% / unclear 58% / wrong 32% (192 notes), room7 25% / 34% / 41%, against real attacked notes 33% / 47% /
  20% (45) and real notes clearly in the recording 67% / 33% / 0% (27). Turning room4's voices and other guitars off (`--fit-room`) takes
  the wrong share to 0%: those rooms were fitted on strums at 0.12 per string, and their pitched sound drowns a single note. The synthetic
  `class` room lands inside the real numbers (56% / 40% / 4%; pitch before the attack 9%, real 9%). **For single notes read `class` as
  the closest room, room4 / room7 as harsher than the real rooms, quiet as kinder.** Strums use the rooms as fitted.
  **Measured 2026-11-13 (one seed; melody: the ten DEFAULT_MELODY skills; THE MODEL'S NUMBERS, the real takes outrank them):**
  - Coach melody, false fail (a right-playing kind whose gate stays shut) / false pass (whole line a fret off, nothing, taps, muted
    strums: the gate opens): quiet 0 of 80 / 30 of 40; room7 5 of 80 / 37 of 40; room4 7 of 80 / 34 of 40; class 9 of 80 / 29 of 40.
    Every false fail said "Needs work", never "couldn't hear". Every note a fret high opened the gate in 39 of 40 takes, quiet room
    included (85 of 85 notes called wrong there): pitch "Needs work", timing and completion Great, so Good.
  - Coach chords: false fail quiet 0 of 42, room7 0, room4 2, class 0; false pass 15 of 21, 20, 21, 15 (one chord held all the way: 12
    of 12; taps and muted strums: 47 of 48).
  - Strum Radar: a right strummer loses 4 of 88 strums in quiet, 12 in room7, 28 in room4, 10 in class; a thumb strummer about 30 of 88
    in every room. Nothing played: median 0% in quiet, 94% room7, 75% room4, 38% class (the recorded rooms of step 1b: 70-87% of empty
    windows hit). Desk taps on the written strums: 74-88 of 88 hit (by design: no pitch).
  - Note Runner (levels 1 and 3): a right player clears 80% in quiet 10 of 10 rounds (counting late / early / quiet / thumb), class 2 of
    10, room7 and room4 0 of 10; a wrong note is never called right (0 of 32); a note played 250 ms late (past the 180 ms window) is called right 9 of 128
    times (7 in room7: a room sound in the window, the late note's own readings) and half credit 22 times.
  - Proof: planted in `--root` copies, each RED through `--against`: the Coach's match window halved ("2 worse": a loose player's notes
    newly missed), `COACH_PITCH_GATE` x10 ("28 worse"), the chord dim rule at pitch 1 (the "Right notes" line "12 better", the gate 0
    moved: two Greats still make Good), "two Greats make Good" removed (gate "14 better, 1 worse"), Strum Radar's window doubled ("65
    worse"), a Note Runner verdict flipped ("32 of 32 worse"). Same seed twice: same text and `--json`. closed-loop.mjs, no-guitar-listen.mjs
    and replay-listen.mjs give the same output as before the step (byte-identical `--json`).
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
- Power Chord Switch takes (`mode: 'pw'`, 2026-11-04): `micEvalTakePw` in
  teacher.js. No pitch readings are saved with them, so per change it asks
  only "is there a strum in the recording where the SITE listened" — its own
  window, replayed from the strums it logged (ccLoop's gridOffset and match)
  — against the site's verdict: agree / detector-missed / false-hit /
  off-window (just outside the window, or near the beat the student heard) /
  silent-miss. Each round's own count-in (up to three rounds, each at its
  own tempo) gives the mic delay: N clicks from the take's `countInBeats`
  (2 below 60 BPM since 2026-11-09; 4 for a take without the field; a
  missing or odd entry is guessed from the tempo and gives no delay), beeps
  2-4 of a 4-click count-in and beeps 1-2 of a 2-click one, which must all
  be heard and line up within 40 ms. A 2-click round whose beep 1 is not
  heard reports beep 2 alone and gives no delay. A round without a delay has
  its windows on the site's own beat when the strums give the map, else on
  the other rounds' lag, else on the delay setting alone. Changes past the end of the audio (the
  30 s cap, Stop) are counted as `dropped`, not judged; changes with an
  impossible time, round or tempo as `ignored`. Which chord was strummed is
  not checked. **Strum what-if** (2026-11-04, measurement only): the same
  function replays the SITE's own strum rule over the audio at its ratios and
  stricter ones (`whatIf`; the numbers and the text of `ccLoop`,
  `coachReadFrame` and `coachSmooth` are read from coach.js at run time) and
  counts the false hits that would stop firing and the real strums that would
  stop with them. eval-takes.mjs prints it after the tables and `--json`
  carries it as `strumWhatIf`. A Coach / Note Runner note whose window runs
  past the end of the audio is `dropped` there too (`micEvalTake`).
- `fake-pw-take.mjs <out-folder>` — twenty-eight synthetic Power Chord Switch
  takes (two of them for the what-if, with answers measured on the audio: room
  noise and no strums, and soft real strums over a loud room; then loud, quiet, 50 and 250 ms mic delay, cut by the 30 s cap, a pair
  with a neighbour's guitar, every 2 beats and Stopped, no beeps with the
  setting right and wrong, 140 BPM every beat and every bar with strums at
  the window's edges, a site that hears nothing, three wrong-setting / late
  cases, drifting strums, and eight count-in takes below 60 BPM: a 2-click
  pair, one in a loud room, a 50 / 55 / 60 song switch heard and deaf, a muted pair, a 660 Hz
  hum that drowns beep 1, an E5 / B5 at the beep pitches out of line, and a
  take saved before `countInBeats` with 4 clicks) plus `truth.json`. Each round's count-in has
  coach.js ccCountInBeats clicks (read from coach.js); `legacyCountIn: true`
  plants the old 4-click take without the field. The site's verdicts are not planted: ccLoop's
  rule is run on the strums the site hears. checks.mjs 1cl builds the same
  takes in memory and pins the evaluator's answers to the truth.
- `yin-eq.mjs <old coach.js> <new coach.js>` — proves coachDetectPitch
  output is identical. Old file: `git show dfaeedc:coach.js > /tmp/coach-old.js`.
- `sim.mjs <old> <new>` — old vs new coachReadFrame at 13–60 fps.
- `loud.mjs`, `loud-diag2.mjs`, `sweep2.mjs <coach.js>` — beat-graded
  (Coach / Note Runner style) loud-room sweeps.
