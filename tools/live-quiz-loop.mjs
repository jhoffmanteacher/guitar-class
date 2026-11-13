#!/usr/bin/env node
/* live-quiz-loop.mjs — closed-loop test of the Live quiz (2026-11-11).

   THE QUESTION IT ANSWERS
   With one teacher and about 30 students on a shared Firestore with lag (some arriving late, some reloading
   mid-question), does every student get exactly the answer and the points the rules promise, and does the
   projector (the stage) stay free of the answer until Reveal?

   WHEN TO RUN IT
   After any change to live-quiz.js (or to the i18n.js lq.* strings, or the answers block of firestore.rules).
   Node only, no browser, no network, about 15-35 s (about 30 s of CPU). Exit 0 = every check held; 1 = a
   check failed, a rule was never exercised in a full run (coverage), a known site fault no longer shows (fixed? remove
   it), the hand-worked points disagree, or the fake's rules no longer match firestore.rules; 2 = the TOOL itself
   crashed or was given an unknown flag; 3 = the watchdog stopped a stuck run (it prints where).

   WHICH SITE IT EXPECTS
   main as of 7c1792e (2026-11-12): live-quiz.js with the Preview button (f4fbe4e), the reload fix (lqRoundOpenedAt,
   sessionStorage key lq-q-opened) and "Reveal when time runs out" (7c1792e). It prints which of the first two the
   tree has. On that tree the default run exits 0: the two KNOWN_SITE_FAULTS are excused (narrowly; see there; the run
   exits 1 if either stops failing), and a Reveal that comes before a slow or late student's own time is up is
   ACCEPTED (Jonathan, 2026-11-12: "let's not worry about it") and only COUNTED, on its own line, so a change in the
   1.5 s grace is visible. On an older tree it is red, on purpose: without Preview the five preview-* cases fail with one line each; without the reload fix the
   reload cases fail (that is the bug the fix closes; --reload-clock=tab accepts the old reading to see the rest).

     node tools/live-quiz-loop.mjs                       the named cases + 12 random games, seed 1
       --seed=N               the seed (same seed = same output, byte for byte)
       --games=N              random games (default 12; one per quiz type in turn: mc, three fret, Find, Name)
       --students=N           class size in a random game (default 30)
       --case=<name>          run one case only (a named case, or game-K); add --verbose for its whole timeline
                              (one case skips the coverage rule)
       --list                 the named cases
       --strict               excuse nothing: the known site faults fail like any other
       --reload-clock=first   (default) a student's time to answer runs from when the question FIRST reached them on a
                              page where they can answer, in any tab: a reload restarts neither the countdown nor the
                              speed clock (R5)
       --reload-clock=tab     the reading before the reload fix: each tab's countdown starts when the question reaches
                              THAT tab (for a tree without lqRoundOpenedAt)
       --root=<folder>        test the live-quiz.js / i18n.js / guitar-diagrams.js / firestore.rules in that folder
       --fake-fault=<name>    break the fake world on purpose (rules-off | no-order | shallow-merge | no-local |
                              plain-fieldvalue); the fake-world probes must then fail (the self-test)
       --prove=<folder>       the break-it proof on the --root tree (default this checkout): a baseline run (must be
                              green), then FAULTS + FIX_FAULTS + NOV13_FAULTS + HIDE_FAULTS + PREVIEW_FAULTS + AUTO_FAULTS + R3_FAULTS + F4_FAULTS each planted in a copy of its live-quiz.js under <folder>/<fault>/ and the fake-world
                              faults, each a default run; a fault is caught when it adds a failing line (case + kind)
                              the baseline did not have;
                              --games=N per run (default 4), --jobs=N runs at a time (default 3), --only=a,b
                              those faults only (with the baseline)
       --stall=120            seconds with no progress before the watchdog exits 3
       --verbose              every event of the case(s): teacher clicks, commits, taps and what the rules said
       --quiet                the summary only

   WHAT IS REAL (unmodified, the whole file loaded, never lifted with a regex)
   live-quiz.js, i18n.js and guitar-diagrams.js, each loaded whole into a separate Node vm per browser tab: one
   teacher console tab (two in the cases where the teacher also uses another device) and one tab per student (a reload
   is a new vm for that student; the old one is dead).
   The student side runs from sign-in (lqStartListening) through lqOnSession, lqRestoreMyAnswer, lqAnnouncePresence,
   lqAnswer / lqTap / lqAnswerPcName, lqWriteAnswer, lqSecsLeft, lqSyncTick and every student HTML builder. The
   teacher side runs renderTeacherLiveQuiz, lqTeacherListen, and every button the control strip draws, clicked by
   evaluating the strip's own onclick / onchange text (Start, First/Next question, the fret note picker, the
   Name-the-power-chord chips + Random shape, Reveal, the mc "Mark the correct answer" buttons, End game, Clear the
   board, the Quiz / Scoring / Time-to-answer boxes), so lqTeacherStart / Next / OpenFret / OpenPcName / Reveal /
   RevealFret / RevealPcName / End / Close, lqScoreRound, lqWrite and lqPaintStage all run as written. Preview, Exit
   preview and the whole game inside a preview are clicked the same way, so lqTeacherPreview, lqPreviewWrite and
   lqTeacherExitPreview run as written too. Students click the .lq-choice buttons the screen draws (their onclick
   text), and only while the button is not disabled.

   WHAT IS FAKE
   - A virtual clock: performance.now, Date.now, setTimeout / setInterval in every vm run on it.
   - Firestore (FakeFS): one liveQuiz/current doc + answers/{uid}; set() with no options, {merge:true} (deep) and
     {mergeFields} (each named field replaced whole); serverTimestamp() (null in the writer's own local snapshot, a
     timestamp once committed; FieldValue is a class and serverTimestamp() an instance of it, as in the SDK: Preview
     tests `instanceof`); undefined field values throw, as the SDK does; each onSnapshot delivered after that
     tab's own seeded network delay, in commit order per listener; the writer's own listener gets a local snapshot
     at once (latency compensation); get() is a round trip; writes from one tab commit in order. No offline cache
     (the site does not enable persistence). A tab that reloads while its write is still on the way: the fake always
     lets that write land. In a real browser a write the SDK had not yet sent when the page unloaded is lost (the student
     then simply has no answer and may answer again), and one already on the wire may or may not land; the case
     reload-while-sending covers the "it lands" reading, the one that could give a second pick.
   - The answers rule is a HAND COPY of firestore.rules lines 198-221 (function live() and match /answers/{userId}),
     and the doc rule of lines 142-144 (read: signed in; write: the teacher). The tool compares that block of the
     real file with RULES_PIN below on every run and fails if it changed: update the fake (rulesAnswer) and the pin.
     isTeacher() / isSignedIn() (lines 60-68) are pinned by a sha256 (HELPERS_SHA256) and modelled as "the console
     tab" / "any tab with a uid".  (Line numbers as of main 5b2fd5b.)
   - Browser storage: localStorage per student device (kept across reloads and tabs); sessionStorage per browser TAB:
     a reload of the same tab keeps it, as a browser does; a second tab, a new tab or another device gets an empty one.
     Date.now() is the virtual clock (the same in every tab); performance.now() starts at 0 when a tab loads.
   - Timers fire late, never early: 0-40 ms, 0-400 ms on a "busy" Chromebook.
   - A minimal DOM: getElementById, the timer / board / button / select / input elements parsed out of innerHTML.
     A form box's value is always a string. escHtml and escAttr are hand copies of app/boot.js lines 452-453
     (live-quiz.js uses the app's). A second console is another device: its own localStorage and network.
   - Made-up students (invented syllable names, random uids), one older game left in the doc (ended, with a name in
     its scores) and a stale answer doc from it.

   WHAT IS NOT MODELLED
   The fret board's own drawing is NOT rendered: fgBoardSvg lives in app/drills.js, which a vm here does not load, so
   on a fret quiz the student's board is an empty <div id="lq-board"> (its attributes and its lq-board-off class ARE
   checked; its markers and hit zones are not). A student's fret tap calls lqTap('lq', string, fret), the exact
   onclick fgBoardSvg's hit zones carry. The invite modal's Join / Later on index.html are not clicked (every student
   tab there has the quiz screen open; in a preview, any new element such as the modal counts as "the student saw
   something"). A console reload, two console tabs on ONE device (they would share localStorage), Chrome's "Duplicate
   tab" (it copies sessionStorage), language switches, an offline student. Real Firestore coalescing of snapshots.
   Time spent rendering. The `at`/askedAt fields are written but nothing scores from them. The second console's own
   screen is checked like the first's, but only the first ever previews.
   MODELLED on purpose: two tabs of one student open at once (two-tabs-one-student), a new tab / second device after
   time-up (new-tab-after-timeout), a Song Journey page tab (no #live-quiz-body; its banner's Join navigates the same
   tab, keeping sessionStorage: journey-join-midq), two games in a row on the same tabs (two-games-same-tabs), and a
   classmate signing in on the same tab mid-question (shared-tab-new-student); Preview: a whole preview of an mc, a
   Fretboard-tap (ended mid-question) and a Name quiz (preview-mc / -fret / -name), a real game started from a second
   console while the first previews (preview-real-game-wins), and a Preview click on a console whose strip still offers
   it, because its teacher is typing in the Time box, while a real game is live (preview-blocked-while-live);
   Reveal when time runs out: on with a last-moment tap and a tap after the reveal (auto-reveal-on), off
   (auto-reveal-off), a slow-wifi student (auto-reveal-slow-wifi); random games untick the box 30% of the time.

   THE INDEPENDENT ANSWER (the MODEL section; it calls no function of live-quiz.js: see the grep in the report)
   A ledger of which virtual student tapped what and when, which tab showed what, and which answer docs had reached
   the teacher's screen, all taken from the fake world, and these rules (each from prose, not code). In a preview the
   "doc" is the console's own copy (lqTSession), READ as data after each event, the way a real game's doc is read from
   the fake Firestore (World.readSession); nothing in the model calls into a vm.
   R1  (2026-11-13: on a `changeAnswer` quiz, the two power chord quizzes, a tap on a DIFFERENT answer while the
       question is open and the student's time has not run out replaces the pick; the same answer again changes
       nothing; a refused change leaves the pick before it. Rule file, "The two power chord quizzes differ".)
       Every other quiz: First tap wins: a student's first accepted pick for a question is their answer; no second pick, also not
       after a reload or from a second tab (live-quiz.js, the comment above the student screen: "First tap wins — no
       changing your mind"; lqOnSession's comment: a reload "was a second pick", read the pick back first).
   R2  A tap counts only while that student's screen shows the question, and not while the tab is still reading
       back its own answer after a reload (the comment above lqRestoreMyAnswer: "taps are refused while the read is
       in flight").
   R3  The time to answer is the box's value, written as limitSec on each question (.claude/rules/live-quiz.md,
       "The teacher sets the time to answer"); 0 = no limit. No tap counts once it has run out.
   R4  Each student's clock is their own: it starts when the question reaches their screen, never from a server
       time (lqOnSession's comment: "a student on slow wifi would be scored for their neighbour's connection").
   R5  A reload does not give a student a new clock: the time to answer and the speed clock both run from the
       question's FIRST arrival on a page where the student can answer (.claude/rules/live-quiz.md, "A reload keeps
       the round's clock", 2026-11-12; lqRoundOpenedAt's comment: a Song Journey page, where nobody can answer, does
       not start it, and a classmate signing in on the same tab gets their own). Two tabs or a new tab: still the
       first arrival (the rule file lists both as open faults: KNOWN_SITE_FAULTS). --reload-clock=tab: the old reading.
   R6  (Source: the code comment above lqPoints and lqTLimitFor's comment, NOT .claude/rules/live-quiz.md,
       which does not state the curve; so R6 checks the arithmetic is applied, not that the curve is right.)
       Points: a right answer scores 1000 with flat scoring; with speed scoring 1000 for an instant answer, sliding
       linearly to 500 at the buzzer, rounded to whole points (the comment above lqPoints); "the buzzer" is limitSec, or
       20 s when there is no limit (the console's default limit, the comment above lqTLimitFor). A wrong answer or
       no answer scores 0. Scoring is chosen before Start (Every correct answer = 1000 | Faster = more points).
       Worked by hand and asserted at start-up (POINTS_BY_HAND): 10 s limit, answer at 2.5 s = 875; at 0 s = 1000;
       at 12 s = 500; no limit, at 15 s = 625; flat = 1000.
   R7  The teacher's Reveal scores the answers its screen holds at that moment; an answer that reaches the doc after
       that scores nothing and the student sees "Correct, but it arrived after the reveal" (lqCorrectVerdictHtml's
       comment); one the rules refuse (state no longer 'question') is no answer at all.
   R8  Running totals: pts, right, answered (rounds scored), last (this round's points, 0 if not scored this round),
       lastRight (true / false, null if not scored this round). A player appears in scores once scored. End with a
       question open throws that round away (lqTeacherEnd's comment). The public doc carries no name (rule file).
   R9  The right answer: an mc question is whatever the teacher marks; a note quiz is every fret 0-12 on the target
       string that sounds the note, a "Find the power chord" quiz every fret 0-12 that is the chord's root, octaves
       both count, `correct` is the lowest (live-quiz.js header); "Name the power chord" is the root at the shape's
       fret + "5" (rule file). The tally: mc = every choice (zeros kept); fret = the tapped frets; Name = all eight
       names. The notes come from this file's own chromatic table, not LQ_NATURALS. Questions open in order: 0 from
       the lobby, then one more each time.
   R10 Each student's own screen at Reveal: "Correct! +N" (N = this round's points), "Correct, but too late",
       "Not this time" or "You didn't answer this one", matching R6-R8; the end screen shows their points and place
       ("Place n of total", ties share the lower place).
   R11 The stage before Reveal shows only the question label, the prompt, the countdown and an answered count
       ("n / m": answers for this question that reached the teacher / players the teacher knows of), plus, on a
       Name question only, the chord box, which may not carry the name. No board, no fret, no tally, no name. The
       lobby shows the title, the join line, the count and the players' names sorted by name. The control strip
       during a question shows Reveal (fret / Name) or the six plain choice names (mc), End game, Full screen and
       the hint, nothing else. At Reveal the stage names the answer (a positive control so the matcher is not blind)
       and its leaderboard (top 5; top 10 at the end) is the points order, ties by name. One tag parser reads every
       attribute in all four forms (name="v", name='v', name=v, bare). Before Reveal: the stage carries no attribute
       outside STAGE_Q_ATTRS and its elements come in today's count and order (STAGE_Q_SEQ); the strip no attribute
       outside STRIP_Q_ATTRS; a student's screen, outside the answer buttons, no attribute outside STUDENT_Q_ATTRS (all
       three pinned from today's site; a new one is added on purpose, after checking it names no answer); the chord box
       (stage and student) has only today's SVG elements and attribute names, its label says only strings / frets
       (BOX_LABEL), its text only ×, finger digits and "Nfr", and no value holds the chord's name or its root note; a
       student's answer buttons differ only in label, handler argument and (mc) the bank's colour, inside as well as on
       the tag; a student's screen, unlocked or "Locked in", reads WORD FOR WORD what the model derives in that student's
       language (quiz title, question label, prompt, countdown, then the tap hint or the answer labels, or "Locked in",
       this student's OWN pick with its exact label and colour, the wait line, the save-failed line only after a refused
       write) and carries no attribute outside STUDENT_Q_ATTRS / STUDENT_LOCKED_ATTRS; every doc committed while a
       question is open has exactly the fields in DOC_Q_FIELDS, the target keys of its quiz type (TARGET_KEYS) and every
       value pinned (target as opened, limitSec as typed, correct / correctIds / tally / endedAt null, quizId /
       speedBonus / startedAt as at the lobby, scores as the last Reveal wrote them, askedAt the opening write's server
       time); no page title or body class changes; and the answer's ids and name appear nowhere else as a token (see
       SURFACES). After Clear the board the doc is 'off', every console's stage idle,
       every student screen empty.
   R12 A countdown on screen always shows the real time left right after any repaint (checks.mjs 1cb: "the
       projector flickered back to "20" on each answer"): whole seconds rounded up, tenths under 10 s, "Time!" at 0;
       a student's screen that offered something to tap before their time ran out offers nothing within one tick after
       (every .lq-choice disabled, or the fret board marked lq-board-off); R12off counts only those screens.
   R13 No uncaught error, no failed teacher write (alert), in any tab.
   P   Preview (the comment above lqTPreview, 2026-11-12: "runs the picked quiz on the stage and control strip with
       NOTHING written to Firestore … no student is invited and no score is kept … Preview opens only when no real
       game is live, and a real game going live (another tab or device) ends the preview at once"). Checked: the
       previewing console writes nothing, the doc and the answer docs stay as they were and every student screen stays
       exactly as it was (no snapshot, no invite, no repaint) while no other console writes; the stage and strip in a
       preview obey R11 like a real game (the strip may add only "Exit preview", whose handler takes no argument, and
       the fixed hint line, and only while previewing); a real game going live on that console ends the preview in the
       same snapshot (no Exit preview, the real board on the stage) and the console then runs the real game; a
       Preview click while a real game is live opens nothing; a strip painted during a real game offers no Preview;
       Exit preview writes nothing either (nor anything after it, until the teacher's next click) and puts back exactly the board and strip that were there before (the Time
       box keeps the last time typed: a device convenience, rule file). A student who signs in or reloads during the
       preview sees no game and no invite.
   A   Reveal when time runs out (7c1792e; its code comment and commit message, not yet in the rule file): on by default
       on a device that never set it; only on quizzes the app scores (fret, Name), only on a timed question, only with
       the box ticked; the console presses Reveal itself 1.5 s after time-up on ITS clock ("1.5 s grace so last-moment
       taps land"), never earlier. Its Reveal is judged like a click (R7: it scores what that console's screen holds at
       that moment; a later tap is "too late" or refused). A second Reveal of the same question (two consoles) may not
       change the scores or tally. ACCEPTED, not failed (Jonathan, 2026-11-12, "let's not worry about it"): the Reveal,
       automatic or clicked, may come before a slow-wifi or late-joining student's own time is up. Counted every run, so
       a change in the grace is visible: in-time taps (R3/R4) refused or scored "too late" because an AUTOMATIC Reveal
       came first, the same for a teacher's click, each over its in-time taps; late joiners whose own clock was cut short.
   C   (2026-11-13, rule file) At the Reveal of a `countOnly` quiz neither the stage nor a student's screen shows the
       spread of picks (no tally bars, no tap counts on the stage board); both show the count of right answers out of
       the answers the Reveal counted. Every other quiz keeps its bars.
   T   (2026-11-13, rule file) The Questions box before Start is the game's length: 10 on a device that never set it,
       blank = no set number, written as totalQ and unchanged for the whole game. Labels read "Question n of total".
       After the last question's Reveal the strip offers "Final scores" and no next question.
   H   (2026-11-13, Jonathan: a "hide names" switch for the Top 5 on the projector, OFF by default) The strip carries a
       "Hide names on the projector" box in every state, unticked on a device that never set it. Ticked on a console,
       that console's stage holds no player's name and no uid anywhere in its HTML, in every state, from the paint right
       after the click on: the lobby shows the title, the join line and the count only; a Reveal's top 5 and the final
       top 10 are rows of place and "N points" in the rules' order. Unticked, the stage is today's (every R11 check
       above). The box is the console's own (tab.hideNames is the tool's record of the clicks); the hide-names-* cases
       click it in the lobby, during a question, at a Reveal and on the final scores.
   COVERAGE: a full run (no --case) fails when any rule above was exercised 0 times; the counts print every run.

   SURFACES readable before Reveal, and how each is held (round 4, 2026-11-12). PINNED = compared whole with what the
   model derives; WHITELIST = only pinned names; TOKEN = searched for the answer's ids / name ("lowE:3", "G5"; it does
   not catch "fret 3" in free text, so every free-text surface a student sees is PINNED instead).
   - Stage (projector), each quiz type, timed or not: PINNED text, element order and count; WHITELIST attributes;
     chord box: WHITELIST elements and attributes, label PINNED to strings / frets.
   - Control strip during a question (projector): PINNED text, WHITELIST attributes (Preview's two controls only while
     previewing; the "Hide names on the projector" box always, ticked as the teacher left it). In the lobby and between questions: not checked, no question is open (the next target is picked
     only by the click that opens it).
   - A dialog on the projector (End game's confirm): TOKEN.
   - Page title and body class (console and student tabs): PINNED unchanged.
   - Student question screen, unlocked and Locked in, each quiz type, English and Spanish: PINNED text (R11, above);
     the Locked-in pick's colour PINNED; WHITELIST attributes; answer buttons alike; the countdown PINNED by R12;
     aria-live: WHITELIST attribute, its text PINNED. A fret question before its target is picked: PINNED ("no tap
     yet") but never exercised (the driver always opens with a target). The lobby / waiting screen: not checked, no
     question exists yet.
   - The fret board's drawing (fgBoardSvg, app/drills.js): NOT checked, not rendered in a vm; its container's
     attributes and lq-board-off are.
   - The invite modal, the bottom banner (index.html) and the Journey page banner: TOKEN (text, HTML, attributes of
     every element live-quiz.js creates).
   - A student's browser console (devtools): TOKEN (log / info / debug / warn).
   - liveQuiz/current while a question is open (any signed-in account): PINNED, every field and value (R11).
   - answers/{uid}: a student may get only their own; its fields are pinned by R4 and the rules copy (keys).
   - Any other Firestore path or db method: flagged at access (F4-5), so a try/catch cannot hide it.
   - A student's localStorage / sessionStorage: WHITELIST keys (gc-lang; lq-q-opened), values TOKEN, checked at each
     Reveal. The console's own storage (gc-lq-limits, gc-lq-autoreveal, gc-lq-total, gc-lq-hidenames): teacher device only, not checked.
   - A student tab's memory (lqSession): the session doc, PINNED above. Network timing: not modelled.
   The quiz bank (LIVE_QUIZZES: ids, types, choice ids and keys, strings, hints) and the i18n strings are read as
   DATA from a separate, untouched vm.
   ════════════════════════════════════════════════════════════════════ */
import vm from 'node:vm';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync, spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { siteText } from './site-src.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SELF = fileURLToPath(import.meta.url);

/* ── arguments ── */
const ARGS = {};
{
  const a = process.argv.slice(2);
  for (let i = 0; i < a.length; i++) {
    const m = /^--([\w-]+)(?:=(.*))?$/.exec(a[i]);
    if (!m) { console.error(`live-quiz-loop: unknown argument ${a[i]}`); process.exit(2); }
    let v = m[2];
    if (v === undefined) v = (a[i + 1] && !a[i + 1].startsWith('--')) ? a[++i] : true;
    ARGS[m[1]] = v;
  }
}
const FLAGS = ['seed', 'games', 'students', 'case', 'list', 'strict', 'reload-clock', 'root', 'fake-fault', 'prove', 'only', 'jobs', 'stall', 'verbose', 'quiet'];
for (const k of Object.keys(ARGS)) if (!FLAGS.includes(k)) { console.error(`live-quiz-loop: unknown flag --${k} (flags: ${FLAGS.join(', ')})`); process.exit(2); }
const SEED = Number(ARGS.seed ?? 1);
const GAMES = Number(ARGS.games ?? 12);
const NSTUD = Number(ARGS.students ?? 30);
const MODE = ARGS['reload-clock'] === 'tab' ? 'tab' : 'first';
const ROOT = ARGS.root ? resolve(String(ARGS.root)) : REPO;
const VERBOSE = !!ARGS.verbose;
const QUIET = !!ARGS.quiet;
const FAKE_FAULT = ARGS['fake-fault'] ? String(ARGS['fake-fault']) : '';
const STALL_MS = Number(ARGS.stall ?? 120) * 1000;
const EVENT_CAP = 3_000_000;
/* How late a tab's timers fire (ms): a browser runs a timer when the main thread is free, never early; a busy
   Chromebook (some students in a random game) much later. */
const MAX_LATE = 40, MAX_LATE_BUSY = 400;
const EPOCH = 1_800_000_000_000;
const out = (...x) => { if (!QUIET) console.log(...x); };

/* ── seeded randomness ── */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashStr(s) { let h = 2166136261; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
const rngFor = (...parts) => mulberry32(hashStr(parts.join('|')));
const between = (r, a, b) => Math.round(a + r() * (b - a));
const pick = (r, xs) => xs[Math.floor(r() * xs.length)];

/* ── the scripts (compiled once, run in every tab) ── */
function src(name) { return siteText(name, ROOT); }
const SCRIPTS = {};
function compileScripts() {
  for (const f of ['i18n.js', 'guitar-diagrams.js', 'live-quiz.js']) SCRIPTS[f] = new vm.Script(src(f), { filename: f });
}

/* hand copies of app/boot.js 452-453 */
const escAttr = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escHtml = s => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const ENT = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
const unesc = s => String(s).replace(/&(amp|lt|gt|quot|#39);/g, m => ENT[m]);
const stripTags = h => unesc(String(h).replace(/<[^>]*>/g, '')).trim();
const reEsc = x => x.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
/* A name or note as a token: not glued to a letter, digit, '#' or '♯' (so '#E5E5E5' and 'F♯5' never match 'E5' / 'F5'). */
const tokenRe = tok => new RegExp(`(?<![#0-9A-Za-z♯])${reEsc(tok)}(?![0-9A-Za-z♯])`);
/* One HTML tag parser for every check (R2-2): a tag name, then its attributes in any of the four forms a browser reads:
   name="v", name='v', name=v and bare name. A quoted value may hold '>'. */
const TAG_RE = /<([a-zA-Z][\w:-]*)((?:\s+[^\s=>\/"']+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>/g;
const ATTR_RE = /([^\s=>\/"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
const ANY_TAG = /<\/?[a-zA-Z](?:"[^"]*"|'[^']*'|[^'">])*>/g;
function parseTags(html) {
  const tags = [];
  for (const m of String(html).matchAll(TAG_RE)) {
    const attrs = [];
    for (const a of m[2].matchAll(ATTR_RE)) attrs.push([a[1].toLowerCase(), unesc(a[2] ?? a[3] ?? a[4] ?? '')]);
    tags.push({ name: m[1].toLowerCase(), attrs, cls: (attrs.find(a => a[0] === 'class') || [, ''])[1] });
  }
  return tags;
}
/* Every attribute on every tag, as 'tag name="value"'; and the text between tags. */
const attrsOf = html => parseTags(html).flatMap(t => t.attrs.map(([k, v]) => `${t.name} ${k}="${v}"`));
const textsOf = html => String(html).split(ANY_TAG).map(x => unesc(x).trim()).filter(Boolean);
const dropSvg = html => String(html).replace(/<svg\b[\s\S]*?<\/svg>/g, '');
const DUMP = process.env.LQL_DUMP ? new Map() : null;
const dump = (k, v) => { if (DUMP) { if (!DUMP.has(k)) DUMP.set(k, new Set()); DUMP.get(k).add(v); } };
/* R11: the attributes today's stage carries during a question, outside the chord box (pinned 2026-11-12 from a run
   over all six quizzes; a new one has to be added here on purpose, after checking it names no answer). */
const STAGE_Q_ATTRS = new Set(['div class="lq-pcbox lq-pcbox-stage"', 'div class="lq-st-cap"', 'div class="lq-st-count"', 'div class="lq-st-pcrow"', 'div class="lq-st-pcside"', 'div class="lq-st-prompt"', 'div class="lq-st-qnum"', 'div class="lq-st-timer"', 'div id="lq-st-timer"', 'span class="lq-st-big"']);
/* R11: the chord box may say only which string is muted or at which fret, and draw ×, finger digits and "Nfr". */
/* (Spanish too: a student reading in Spanish gets "Diagrama de acorde: Mi grave apagada, La traste 9, …", the i18n.js
   diagram.chordAria* strings.) */
const BOX_PART_EN = '(?:low E|A|D|G|B|high e) (?:fret \\d{1,2}|muted|open)', BOX_PART_ES = '(?:Mi grave|La|Re|Sol|Si|mi aguda) (?:traste \\d{1,2}|apagada|al aire)';
const BOX_LABEL = new RegExp(`^(?:Chord diagram: ${BOX_PART_EN}(?:, ${BOX_PART_EN})*|Diagrama de acorde: ${BOX_PART_ES}(?:, ${BOX_PART_ES})*)$`);
const BOX_GLYPH = /^(?:×|○|o|\d{1,2}|\d{1,2}fr)$/;
/* Pinned 2026-11-12 from a full run over all six quizzes (LQL_DUMP=1 prints what a run sees). A new element or attribute
   is added here on purpose, after checking it names no answer. pcname without a timer is the timed sequence minus the
   timer (no seed asked an untimed Name question). */
const SVG_ELEMS = new Set(['circle', 'line', 'svg', 'text', 'title']);
const SVG_ATTRS = new Set(['aria-label', 'cx', 'cy', 'dominant-baseline', 'fill', 'font-family', 'font-size', 'font-weight', 'height', 'lengthadjust', 'r', 'role', 'stroke', 'stroke-width', 'text-anchor', 'textlength', 'viewbox', 'width', 'x', 'x1', 'x2', 'xmlns', 'y', 'y1', 'y2']);
/* The control strip during a question (it is on the projector too). */
const STRIP_Q_ATTRS = { mc: new Set(['input checked=""', 'input id="lq-hidenames"', 'input onchange="lqTSetHideNames(this.checked)"', 'input type="checkbox"', 'label class="lq-ctl-lbl"', 'button class="lq-ctl ghost"', 'button class="lq-ctl mark"', 'button disabled=""', 'button onclick="lqTeacherEnd()"', 'button onclick="lqTeacherReveal(\'A\')"', 'button onclick="lqTeacherReveal(\'B\')"', 'button onclick="lqTeacherReveal(\'D\')"', 'button onclick="lqTeacherReveal(\'E6\')"', 'button onclick="lqTeacherReveal(\'G\')"', 'button onclick="lqTeacherReveal(\'e1\')"', 'button onclick="lqToggleFullscreen()"', 'button style="--lq-c:#0f6b64"', 'button style="--lq-c:#185fa5"', 'button style="--lq-c:#3b6d11"', 'button style="--lq-c:#5b3f96"', 'button style="--lq-c:#a2530b"', 'button style="--lq-c:#b3372a"', 'button type="button"', 'div class="lq-ctl-hint"', 'div class="lq-ctl-marks"', 'span class="lq-ctl-lbl"']), fret: new Set(['input checked=""', 'input id="lq-hidenames"', 'input onchange="lqTSetHideNames(this.checked)"', 'input type="checkbox"', 'label class="lq-ctl-lbl"', 'button class="lq-ctl ghost"', 'button class="lq-ctl go"', 'button disabled=""', 'button onclick="lqTeacherEnd()"', 'button onclick="lqTeacherRevealFret()"', 'button onclick="lqToggleFullscreen()"', 'button type="button"', 'div class="lq-ctl-hint"']), pcname: new Set(['input checked=""', 'input id="lq-hidenames"', 'input onchange="lqTSetHideNames(this.checked)"', 'input type="checkbox"', 'label class="lq-ctl-lbl"', 'button class="lq-ctl ghost"', 'button class="lq-ctl go"', 'button disabled=""', 'button onclick="lqTeacherEnd()"', 'button onclick="lqTeacherRevealPcName()"', 'button onclick="lqToggleFullscreen()"', 'button type="button"', 'div class="lq-ctl-hint"']) };
/* A student's screen before Reveal, outside the answer buttons and the chord box (data-i18n-params checked exactly first). */
const STUDENT_Q_ATTRS = { mc: new Set(['div aria-live="off"', 'div class="lq-choices"', 'div class="lq-prompt"', 'div class="lq-qnum"', 'div class="lq-quiz-title"', 'div class="lq-timer"', 'div data-i18n-params=OK', 'div data-i18n="lq.prompt.stringId"', 'div data-i18n="lq.qLabel"', 'div data-i18n="lq.qLabelOf"', 'div data-i18n="lq.title.stringId"', 'div id="lq-timer"']), fret: new Set(['div aria-live="off"', 'div class="lq-board"', 'div class="lq-prompt"', 'div class="lq-qnum"', 'div class="lq-quiz-title"', 'div class="lq-timer"', 'div data-i18n-params=OK', 'div data-i18n="lq.prompt.fretTap"', 'div data-i18n="lq.prompt.pcFind"', 'div data-i18n="lq.qLabel"', 'div data-i18n="lq.qLabelOf"', 'div data-i18n="lq.title.fretAll"', 'div data-i18n="lq.title.fretLowE"', 'div data-i18n="lq.title.fretLowEA"', 'div data-i18n="lq.title.pcFind"', 'div id="lq-board"', 'div id="lq-timer"', 'p class="lq-note"', 'p data-i18n="lq.tapHint"', 'p data-i18n="lq.tapHintChange"']), pcname: new Set(['div aria-live="off"', 'div class="lq-choices lq-pcnames"', 'div class="lq-pcbox lq-pcbox-q"', 'div class="lq-prompt"', 'div class="lq-qnum"', 'div class="lq-quiz-title"', 'div class="lq-timer"', 'div data-i18n-params=OK', 'div data-i18n="lq.prompt.pcName"', 'div data-i18n="lq.qLabel"', 'div data-i18n="lq.qLabelOf"', 'div data-i18n="lq.title.pcName"', 'div id="lq-timer"']) };
/* R3-1: the field names of liveQuiz/current while a question is open (pinned 2026-11-12 from main 7c1792e). */
/* F4-1: target's keys per quiz type (live-quiz.js header and rule file: a note quiz's target is {string, note}, a Name
   question's {string, fret}, never the name; an mc question has none). */
const STUDENT_LOCAL_KEYS = new Set(['gc-lang']), STUDENT_SESSION_KEYS = new Set(['lq-q-opened']);
const TARGET_KEYS = { mc: null, fret: 'note,string', pcname: 'fret,string' };
const DOC_Q_FIELDS = new Set(['askedAt', 'correct', 'correctIds', 'endedAt', 'limitSec', 'qIndex', 'quizId', 'scores', 'sessionId', 'speedBonus', 'startedAt', 'state', 'tally', 'target', 'totalQ']);
/* The preview's own controls on the strip (live-quiz.js lqPaintControls, 2026-11-12): an "Exit preview" button whose
   handler takes no argument, and a fixed hint line. Accepted ONLY while the console is previewing; they carry no answer
   (no argument, fixed text). */
const PREVIEW_STRIP_ATTRS = new Set(['button onclick="lqTeacherExitPreview()"']);
const PREVIEW_STRIP_BUTTONS = ['Exit preview'];
const PREVIEW_STRIP_HINT = ['Preview', ': only this screen sees it. No student is invited and nothing is saved.'];
/* H: the "Hide names on the projector" box (2026-11-13), on the strip in every state, just before Full screen. */
const HIDE_NAMES_LABEL = 'Hide names on the projector';
/* What the strip shows: its markup with the boxes' values taken from the boxes themselves (typing in a box or picking
   from a select changes what the box holds, not the markup the strip was painted with). The Time box is left out: it
   shows the last time the teacher typed, remembered on the device (rule file: "a device convenience, not game
   state"), so a time typed during a preview may stay; previewBack checks it on its own. */
const stripView = tab => tab.dom.byId.get('lq-controls').innerHTML.replace(/<option\b([^>]*?)\s*selected\b([^>]*)>/g, '<option$1$2>').replace(/(<input\b[^>]*?)\svalue="[^"]*"/g, '$1')
  + ' ' + JSON.stringify(['lq-quiz-pick', 'lq-scoring'].map(id => (tab.dom.byId.get(id) || {}).value));
/* A real game is live while its doc is in the lobby, a question or a reveal (the rule's "a real game going live"). */
const realLive = d => !!(d && (d.state === 'lobby' || d.state === 'question' || d.state === 'reveal'));
let HAS_PREVIEW = false, HAS_RELOAD_FIX = false;
/* A: "Reveal when time runs out" waits 1.5 s past 0 on the console's clock (7c1792e: "1.5 s grace so last-moment taps
   land"; the code comment: "so a tap made in a student's last moment, on that student's slightly later clock, still
   lands in the answer docs before scoring"). */
const AUTO_GRACE_MS = 1500;
/* R3-2: a student's "Locked in" screen before Reveal (their own pick set aside as #MINE#); pinned from main 7c1792e. */
const LOCKED_EXTRA = ['div class="lq-locked"', 'div class="lq-locked-lbl"', 'div class="lq-locked-pick"', 'div class="lq-locked-wait"', 'div data-i18n="lq.locked"', 'div data-i18n="lq.lockedChange"', 'div data-i18n="lq.lockedWait"', 'div style=PICK'];
/* F4-2: the Locked-in pick's colour: the bank's colour of an mc choice; one fixed colour for a Name; per string for a
   fret pick. Hand copies of live-quiz.js LQ_PC_NAME_COLOR and LQ_STRING_COLOR (pinned 2026-11-12, main cc110dc). */
const PC_NAME_COLOR = '#185fa5';
const STRING_COLOR = { lowE: '#b3372a', A: '#a2530b', D: '#3b6d11', G: '#185fa5', B: '#5b3f96', highE: '#0f6b64' };
const STUDENT_LOCKED_ATTRS = Object.fromEntries(Object.entries(STUDENT_Q_ATTRS).map(([k, set]) => [k, new Set([...[...set].filter(x => !x.startsWith('p ') && !x.includes('lq-choices')), ...LOCKED_EXTRA])]));
/* 2026-11-13: on a changeAnswer quiz the eight Name buttons stay under the student's pick (all alike, none marked),
   and a refused CHANGE leaves the pick before it on screen with the fixed save-failed line. */
STUDENT_LOCKED_ATTRS.pcname.add('div class="lq-choices lq-pcnames"');
for (const k of ['fret', 'pcname']) for (const a of ['p class="lq-note lq-note-bad"', 'p data-i18n="lq.saveFailed"']) STUDENT_LOCKED_ATTRS[k].add(a);
/* The stage's elements during a question, in order (count and order, not only which ones). */
const STAGE_Q_SEQ = {
  'fret': ['div.lq-st-qnum > div.lq-st-prompt > div.lq-st-count > span.lq-st-big > div.lq-st-cap'],
  'fret timed': ['div.lq-st-qnum > div.lq-st-prompt > div.lq-st-timer > div.lq-st-count > span.lq-st-big > div.lq-st-cap'],
  'mc': ['div.lq-st-qnum > div.lq-st-prompt > div.lq-st-count > span.lq-st-big > div.lq-st-cap'],
  'mc timed': ['div.lq-st-qnum > div.lq-st-prompt > div.lq-st-timer > div.lq-st-count > span.lq-st-big > div.lq-st-cap'],
  'pcname': ['div.lq-st-qnum > div.lq-st-prompt > div.lq-st-pcrow > div.lq-pcbox lq-pcbox-stage > div.lq-st-pcside > div.lq-st-count > span.lq-st-big > div.lq-st-cap'],
  'pcname timed': ['div.lq-st-qnum > div.lq-st-prompt > div.lq-st-pcrow > div.lq-pcbox lq-pcbox-stage > div.lq-st-pcside > div.lq-st-timer > div.lq-st-count > span.lq-st-big > div.lq-st-cap']
};
/* tokens: the chord's name and its root note (on a Name question the root IS the answer). The label attribute must be
   BOX_LABEL; every other attribute value and every text node is token-checked; elements and attribute names are
   pinned from today's 14 shapes in both languages (R2-3). */
function boxProblems(svg, tokens) {
  const bad = [];
  for (const t of parseTags(svg)) {
    dump('svg elem', t.name);
    if (!SVG_ELEMS.has(t.name)) bad.push(`<${t.name}>`);
    for (const [k, v] of t.attrs) {
      dump('svg attr', k);
      if (!SVG_ATTRS.has(k)) bad.push(`${k}="${v}"`);
      if (k === 'aria-label' || k === 'aria-description' || k === 'aria-roledescription') { if (!BOX_LABEL.test(v)) bad.push(`${k}="${v}"`); continue; }
      for (const tok of tokens) if (tok && tokenRe(tok).test(v)) { dump('svg token hit', `${k}="${v}" ~ ${tok}`); bad.push(`${k}="${v}" (holds ${tok})`); }
    }
  }
  for (const x of textsOf(svg)) if (!BOX_LABEL.test(x) && !BOX_GLYPH.test(x)) bad.push(`text "${x}"`);
  return bad;
}

/* ════════════════ the virtual clock ════════════════ */
class Loop {
  constructor() { this.now = 0; this.h = []; this.seq = 0; this.count = 0; }
  at(t, fn, owner) { const ev = { t: Math.max(Math.round(t), this.now), s: this.seq++, fn, owner, dead: false }; this.push(ev); return ev; }
  less(a, b) { return a.t < b.t || (a.t === b.t && a.s < b.s); }
  push(ev) { const h = this.h; h.push(ev); let i = h.length - 1; while (i > 0) { const p = (i - 1) >> 1; if (!this.less(h[i], h[p])) break; [h[i], h[p]] = [h[p], h[i]]; i = p; } }
  pop() {
    const h = this.h, top = h[0], last = h.pop();
    if (h.length) {
      h[0] = last; let i = 0;
      for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < h.length && this.less(h[l], h[m])) m = l; if (r < h.length && this.less(h[r], h[m])) m = r; if (m === i) break; [h[i], h[m]] = [h[m], h[i]]; i = m; }
    }
    return top;
  }
}
/* Lets the promise chains a callback started run to the end before the next event, as a browser runs microtasks
   before the next task. 64 microtask turns, not setImmediate (an event-loop turn per event doubled the run time);
   LQL_DRAIN=immediate switches back, and the two give the same output byte for byte (checked when this was set). */
const drain = process.env.LQL_DRAIN === 'immediate' ? () => new Promise(r => setImmediate(r)) : async () => { for (let i = 0; i < 64; i++) await null; };

/* ════════════════ the fake Firestore ════════════════ */
/* FieldValue is a class in the SDK (live-quiz.js's Preview tests `v instanceof firebase.firestore.FieldValue`), and
   serverTimestamp() returns an instance of it. */
class FakeFieldValue { static serverTimestamp() { return SERVER_TS; } }
const SERVER_TS = Object.freeze(Object.assign(Object.create(FakeFieldValue.prototype), { __serverTimestamp: true }));
const isMap = v => v && typeof v === 'object' && !Array.isArray(v) && !('__ts' in v) && !('__sts' in v);
function cloneIn(v, path) {
  if (v === SERVER_TS) return { __sts: true };
  if (v === undefined) throw new Error(`Function setDoc() called with invalid data. Unsupported field value: undefined (found in field ${path})`);
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map((x, i) => cloneIn(x, `${path}.${i}`));
  const o = {}; for (const k of Object.keys(v)) o[k] = cloneIn(v[k], path ? `${path}.${k}` : k); return o;
}
const cloneRaw = v => (v === null || typeof v !== 'object') ? v : Array.isArray(v) ? v.map(cloneRaw) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, cloneRaw(x)]));
function resolveTs(v, ms) {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(x => resolveTs(x, ms));
  if (v.__sts) return ms === null ? null : { __ts: ms };
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, resolveTs(x, ms)]));
}
function materialize(v) {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(materialize);
  if ('__ts' in v) { const ms = EPOCH + v.__ts; return { toMillis: () => ms, seconds: Math.floor(ms / 1000), nanoseconds: 0 }; }
  return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, materialize(x)]));
}
function deepMerge(dst, src, shallow) {
  for (const k of Object.keys(src)) {
    if (!shallow && isMap(src[k]) && isMap(dst[k])) deepMerge(dst[k], src[k], false);
    else dst[k] = cloneRaw(src[k]);
  }
  return dst;
}
function applyWrite(doc, data, opts, fault) {
  if (!opts) return cloneRaw(data);
  if (opts.mergeFields) {
    const o = doc ? cloneRaw(doc) : {};
    for (const f of opts.mergeFields) {
      if (!(f in data)) throw new Error(`Field "${f}" is specified in your field mask but missing from your input data.`);
      o[f] = cloneRaw(data[f]);
    }
    return o;
  }
  if (opts.merge) return deepMerge(doc ? cloneRaw(doc) : {}, data, fault === 'shallow-merge');
  throw new Error('unknown set options');
}
const permErr = why => Object.assign(new Error(`Missing or insufficient permissions. (${why})`), { code: 'permission-denied' });

/* firestore.rules lines 198-221, by hand. Returns null when the write is allowed, else the failing condition. */
const ANSWER_KEYS = ['uid', 'name', 'sessionId', 'qIndex', 'choice', 'ms', 'at'];
function rulesAnswer(tab, userId, d, cur) {
  if (!tab.uid) return 'isSignedIn()';
  if (tab.uid !== userId) return 'request.auth.uid == userId';
  if (d.uid !== tab.uid) return 'data.uid == request.auth.uid';
  if (Object.keys(d).some(k => !ANSWER_KEYS.includes(k))) return 'keys().hasOnly(...)';
  if (typeof d.name !== 'string') return 'name is string';
  if ([...d.name].length > 60) return 'name.size() <= 60';
  if (!Number.isInteger(d.qIndex)) return 'qIndex is int';
  if (typeof d.ms !== 'number') return 'ms is number';
  if (!(d.ms >= 0)) return 'ms >= 0';
  if (!(d.choice === null || (typeof d.choice === 'string' && [...d.choice].length <= 64))) return 'choice null or string <= 64';
  if (!cur) return 'live() exists';
  if (d.sessionId !== cur.sessionId) return 'sessionId == live().sessionId';
  if (!((cur.state === 'question' && d.qIndex === cur.qIndex) || (cur.state === 'lobby' && d.qIndex === -1))) return `state/qIndex (live state ${cur.state}, qIndex ${cur.qIndex}; write qIndex ${d.qIndex})`;
  return null;
}
const RULES_PIN = "function live() { return get(/databases/$(database)/documents/liveQuiz/current).data; } match /answers/{userId} { allow read, delete: if isTeacher(); allow get: if isSignedIn() && request.auth.uid == userId; allow create, update: if isSignedIn() && request.auth.uid == userId && request.resource.data.uid == request.auth.uid && request.resource.data.keys().hasOnly(['uid','name','sessionId','qIndex','choice','ms','at']) && request.resource.data.name is string && request.resource.data.name.size() <= 60 && request.resource.data.qIndex is int && request.resource.data.ms is number && request.resource.data.ms >= 0 && (request.resource.data.choice == null || (request.resource.data.choice is string && request.resource.data.choice.size() <= 64)) && request.resource.data.sessionId == live().sessionId && ( (live().state == 'question' && request.resource.data.qIndex == live().qIndex) || (live().state == 'lobby' && request.resource.data.qIndex == -1) ); }";
/* isTeacher() and isSignedIn() (firestore.rules 60-68), pinned by hash: the teacher check holds an address this file
   need not copy. The fake models them as "the console tab" and "any tab with a uid". */
const HELPERS_SHA256 = '9e2ecc68393581756341dd2fb8e1ccdd9d3d23f41971fd44d81088aa723f30e1';
function rulesDrift() {
  const base = existsSync(join(ROOT, 'firestore.rules')) ? ROOT : REPO;
  const t = readFileSync(join(base, 'firestore.rules'), 'utf8').replace(/\r\n/g, '\n');
  const i = t.indexOf('function live() {'), j = t.indexOf('match /answers/{userId} {');
  if (i < 0 || j < 0) return 'the answers block is gone from firestore.rules';
  const k = t.indexOf('\n      }\n', j);
  const block = (t.slice(i, t.indexOf('}', i) + 1) + ' ' + t.slice(j, k + 8)).replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ').trim();
  const docRule = /match \/liveQuiz\/current \{\s*allow read:\s+if isSignedIn\(\);\s*allow write: if isTeacher\(\);/.test(t);
  const fn = n => { const a = t.indexOf(`function ${n}() {`); return a < 0 ? '' : t.slice(a, t.indexOf('\n    }', a) + 6); };
  const helpers = (fn('isTeacher') + ' ' + fn('isSignedIn')).replace(/\s+/g, ' ').trim();
  if (createHash('sha256').update(helpers).digest('hex') !== HELPERS_SHA256) return 'isTeacher() / isSignedIn() in firestore.rules changed: check the fake (tab.isTeacher, tab.uid) and update HELPERS_SHA256';
  if (block !== RULES_PIN) return 'the answers rule in firestore.rules changed: update rulesAnswer() (the fake\'s hand copy) and RULES_PIN';
  if (!docRule) return 'the liveQuiz/current rule (read: signed in, write: teacher) changed: update the fake';
  return null;
}

class FakeFS {
  constructor(w, fault) {
    this.w = w; this.fault = fault || '';
    this.cur = null; this.ans = new Map(); this.docL = new Set(); this.ansL = new Set();
    this.stats = { writes: 0, accepted: 0, rejected: 0, gets: 0, deliveries: 0 };
  }
  firebaseFor(tab) {
    const fs = this;
    /* F4-5: live-quiz.js may touch liveQuiz/current and its answers only. Any other path, or any other method on the db,
       is flagged at ACCESS (a try/catch around it cannot hide it), then throws as an unknown path would. */
    const other = what => { fs.w.flag('R11 no answer in doc', `${tab.label}: live-quiz.js reached ${what} (it may touch liveQuiz/current and its answers only)`); throw new Error(`fake Firestore: no ${what}`); };
    const db = new Proxy({ collection(n) { if (n !== 'liveQuiz') other(`collection ${n}`); return { doc(id) { if (id !== 'current') other(`doc liveQuiz/${id}`); return fs.currentRef(tab); } }; } }, { get: (o, k) => (k in o || typeof k === 'symbol' || k === 'then' ? o[k] : other(`db.${String(k)}`)) });
    return { firestore: Object.assign(() => db, { FieldValue: FAKE_FAULT === 'plain-fieldvalue' ? { serverTimestamp: () => SERVER_TS } : FakeFieldValue }) };
  }
  currentRef(tab) {
    return {
      onSnapshot: (next, err) => this.listen(tab, 'doc', next, err),
      set: (p, o) => this.setCurrent(tab, p, o),
      collection: n => {
        if (n !== 'answers') { this.w.flag('R11 no answer in doc', `${tab.label}: live-quiz.js reached liveQuiz/current/${n} (it may touch the answers subcollection only)`); throw new Error(`fake Firestore: no subcollection ${n}`); }
        return { doc: uid => ({ get: () => this.getAnswer(tab, uid), set: (d, o) => this.setAnswer(tab, uid, d, o) }), onSnapshot: (next, err) => this.listen(tab, 'ans', next, err) };
      }
    };
  }
  down(tab) { return tab.net.down(); }
  up(tab) { return tab.net.up(); }
  deliverAt(l, t) { const at = this.fault === 'no-order' ? t : Math.max(l.last, t); l.last = Math.max(l.last, at); return at; }
  payload(kind) {
    if (kind === 'doc') { const d = this.cur ? cloneRaw(this.cur) : null; return d; }
    return [...this.ans.keys()].sort().map(id => ({ id, data: cloneRaw(this.ans.get(id)) }));
  }
  send(l, raw, at, local) {
    const t = this.deliverAt(l, at);
    this.w.loop.at(t, () => {
      if (l.dead) return;
      this.stats.deliveries++;
      if (l.kind === 'doc') {
        l.tab.docDeliveries = (l.tab.docDeliveries || 0) + 1;
        this.w.beforeDoc(l.tab, raw, local);
        const snap = { exists: !!raw, metadata: { hasPendingWrites: !!local }, data: () => (raw ? materialize(raw) : undefined) };
        this.w.callIn(l.tab, l.next, [snap]);
        this.w.afterDoc(l.tab, raw);
      } else {
        this.w.beforeAnswers(l.tab, raw);
        const snap = { docs: raw.map(d => ({ id: d.id, exists: true, data: () => materialize(d.data) })), size: raw.length, empty: !raw.length };
        this.w.callIn(l.tab, l.next, [snap]);
      }
    }, l.tab);
  }
  listen(tab, kind, next, err) {
    const l = { tab, kind, next, err, last: 0, dead: false, attached: false };
    tab.listeners.push(l);
    if (kind === 'ans' && !tab.isTeacher) {
      this.w.loop.at(this.w.loop.now + this.up(tab) + this.down(tab), () => { if (!l.dead && err) this.w.callIn(tab, err, [permErr('list answers: teacher only')]); }, tab);
      return () => { l.dead = true; };
    }
    this.w.loop.at(this.w.loop.now + this.up(tab), () => {
      if (l.dead) return;
      l.attached = true; (kind === 'doc' ? this.docL : this.ansL).add(l);
      this.send(l, this.payload(kind), this.w.loop.now + this.down(tab), false);
    }, null);
    return () => { l.dead = true; this.docL.delete(l); this.ansL.delete(l); };
  }
  commitOrder(tab) { const t = Math.max(tab.lastCommit || 0, this.w.loop.now + this.up(tab)); tab.lastCommit = t; return t; }
  setCurrent(tab, patch, opts) {
    const data = cloneIn(patch, '');
    this.stats.writes++; tab.writes = (tab.writes || 0) + 1;
    if (this.w.onWriteIssued) this.w.onWriteIssued(tab, data);
    if (this.fault !== 'no-local') {
      for (const l of tab.listeners) if (l.kind === 'doc' && !l.dead) {
        const local = resolveTs(applyWrite(tab.view ? cloneRaw(tab.view) : null, data, opts, this.fault), null);
        this.send(l, local, this.w.loop.now, true);
      }
    }
    const ct = this.commitOrder(tab);
    return new Promise((resolve, reject) => {
      this.w.loop.at(ct, () => {
        const now = this.w.loop.now;
        if (!tab.isTeacher) { this.stats.rejected++; this.w.loop.at(now + this.down(tab), () => this.w.settle(tab, () => reject(permErr('liveQuiz/current: teacher only'))), tab); return; }
        const prev = this.cur;
        this.cur = applyWrite(this.cur, resolveTs(data, now), opts, this.fault);
        this.stats.accepted++;
        this.w.onCommitCurrent(this.cur, prev, tab);
        let ackAt = now + this.down(tab);
        for (const l of this.docL) {
          if (l.dead) continue;
          const own = l.tab === tab;
          const at = own ? ackAt : now + this.down(l.tab);
          this.send(l, cloneRaw(this.cur), at, false);
          if (own) ackAt = l.last;
        }
        this.w.loop.at(ackAt, () => this.w.settle(tab, () => resolve()), tab);
      }, null);
    });
  }
  setAnswer(tab, uid, d, opts) {
    const data = cloneIn(d, '');
    if (opts) throw new Error('fake Firestore: the answers writer uses a plain set()');
    this.stats.writes++; tab.writes = (tab.writes || 0) + 1;
    tab.pending = (tab.pending || 0) + 1;
    this.w.onAnswerSent(tab, uid, data);
    const ct = this.commitOrder(tab);
    return new Promise((resolve, reject) => {
      this.w.loop.at(ct, () => {
        const now = this.w.loop.now;
        const why = this.fault === 'rules-off' ? null : rulesAnswer(tab, uid, data, this.cur);
        this.w.onAnswerCommit(tab, uid, data, why);
        if (why) { this.stats.rejected++; if (this.w.cover) this.w.cover('R7refused'); this.w.loop.at(now + this.down(tab), () => { tab.pending--; this.w.onAnswerRefusedBack(tab, uid, data); this.w.settle(tab, () => reject(permErr(why))); }, null); return; }
        this.stats.accepted++;
        this.ans.set(uid, resolveTs(data, now));
        for (const l of this.ansL) if (!l.dead) this.send(l, this.payload('ans'), now + this.down(l.tab), false);
        this.w.loop.at(now + this.down(tab), () => { tab.pending--; this.w.settle(tab, () => resolve()); }, null);
      }, null);
    });
  }
  getAnswer(tab, uid) {
    this.stats.gets++;
    tab.gets++;
    const rb = { sid: tab.shown && tab.shown.sessionId, q: tab.shown ? tab.shown.qIndex : null };
    tab.readBacks.push(rb);
    return new Promise((resolve, reject) => {
      this.w.loop.at(this.w.loop.now + this.up(tab), () => {
        const ok = tab.uid && tab.uid === uid;
        const raw = ok && this.ans.has(uid) ? cloneRaw(this.ans.get(uid)) : null;
        this.w.loop.at(this.w.loop.now + this.down(tab), () => {
          tab.gets--;
          tab.readBacks.splice(tab.readBacks.indexOf(rb), 1);
          this.w.vlog(`${tab.label} read back its own answer doc: ${ok ? (raw ? `qIndex ${raw.qIndex}, choice ${raw.choice}` : 'none') : 'refused'}`);
          if (!tab.alive) return;
          this.w.settle(tab, () => (ok ? resolve({ exists: !!raw, data: () => (raw ? materialize(raw) : undefined) }) : reject(permErr('get: own doc only'))));
        }, null);
      }, null);
    });
  }
}

/* ════════════════ the fake DOM ════════════════ */
const PARSED_IDS = new Set(['lq-timer', 'lq-st-timer', 'lq-board', 'lq-st-board']);
function makeDom(tab, w) {
  const byId = new Map(), created = [];
  function mkEl(id, tag) {
    const cls = new Set(), attrs = {};
    let html = '', text = '';
    const el = {
      id, tagName: tag || 'DIV', kids: [], buttons: [],
      classList: { list: () => [...cls], add: c => cls.add(c), remove: c => cls.delete(c), toggle: (c, on) => { if (on === undefined) on = !cls.has(c); if (on) cls.add(c); else cls.delete(c); return on; }, contains: c => cls.has(c) },
      setAttribute(k, v) { attrs[k] = String(v); }, getAttribute(k) { return k in attrs ? attrs[k] : null; }, hasAttribute(k) { return k in attrs; }, removeAttribute(k) { delete attrs[k]; },
      querySelector(sel) { return sel[0] === '#' ? (el.kids.find(k => k.id === sel.slice(1)) || null) : null; },
      querySelectorAll() { return []; },
      children: [], listeners: {},
      append(...k) { el.children.push(...k); }, appendChild(k) { el.children.push(k); return k; }, remove() { el.removed = true; if (el.id) byId.delete(el.id); },
      addEventListener(type, fn) { (el.listeners[type] = el.listeners[type] || []).push(fn); }, removeEventListener() {}, focus() {}, contains: () => false,
      requestFullscreen: () => Promise.resolve(), _attrs: attrs
    };
    let value = '';
    Object.defineProperty(el, 'value', { get: () => value, set(v) { value = String(v); } });   /* a form box's value is always a string */
    Object.defineProperty(el, 'innerHTML', { get: () => html, set(h) { html = String(h); if (id) tab.dirty.add(id); parse(el, html); } });
    Object.defineProperty(el, 'textContent', { get: () => text, set(v) { text = String(v); if (id) tab.dirty.add(id); } });
    return el;
  }
  function parse(el, html) {
    for (const k of el.kids) byId.delete(k.id);
    el.kids = []; el.buttons = [];
    for (const m of html.matchAll(/<(div|span|select|input)\b([^>]*?)\bid="([^"]+)"([^>]*)>/g)) {
      const kid = m[3];
      const attrs = m[2] + ' ' + m[4];
      if (!PARSED_IDS.has(kid) && m[1] !== 'select' && m[1] !== 'input') continue;
      const c = mkEl(kid, m[1].toUpperCase());
      const cm = /class="([^"]*)"/.exec(attrs); if (cm) for (const x of cm[1].split(/\s+/)) if (x) c.classList.add(x);
      const on = /onchange="([^"]*)"/.exec(attrs); c.onchangeText = on ? unesc(on[1]) : null;
      if (m[1] === 'div') { const end = html.indexOf('<', m.index + m[0].length); c.textContent = unesc(html.slice(m.index + m[0].length, end < 0 ? undefined : end)); }
      if (m[1] === 'input') { const v = /value="([^"]*)"/.exec(attrs); c.value = v ? unesc(v[1]) : ''; }
      if (m[1] === 'select') {
        const close = html.indexOf('</select>', m.index);
        const opts = [...html.slice(m.index, close).matchAll(/<option value="([^"]*)"([^>]*)>/g)];
        const sel = opts.find(o => /\bselected\b/.test(o[2])) || opts[0];
        c.value = sel ? unesc(sel[1]) : '';
      }
      el.kids.push(c); byId.set(kid, c);
    }
    for (const m of html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)) {
      const a = m[1];
      const oc = /onclick="([^"]*)"/.exec(a), cl = /class="([^"]*)"/.exec(a);
      el.buttons.push({ onclick: oc ? unesc(oc[1]) : '', cls: cl ? cl[1] : '', disabled: /\sdisabled(\s|$)/.test(a), label: stripTags(m[2]) });
    }
  }
  const document = {
    title: 'Guitar Class', hidden: false, documentElement: { lang: 'en' }, activeElement: null, currentScript: null, fullscreenElement: null,
    body: mkEl(null, 'BODY'),
    getElementById: id => byId.get(id) || null,
    querySelectorAll(sel) {
      const m = /^#([\w-]+) \.([\w-]+)$/.exec(sel);
      if (m) { const p = byId.get(m[1]); return p ? p.buttons.filter(b => b.cls.split(/\s+/).includes(m[2])) : []; }
      return [];
    },
    querySelector: () => null,
    createElement: tag => { const e = mkEl(null, String(tag).toUpperCase()); created.push(e); return e; },
    addEventListener() {}, removeEventListener() {}, contains: () => false, exitFullscreen() {}
  };
  const reg = id => { const e = mkEl(id); byId.set(id, e); return e; };
  const findCreated = pred => created.find(e => !e.removed && pred(e)) || null;
  const createdCount = () => created.filter(e => !e.removed).length;
  const createdList = () => created.filter(e => !e.removed);
  return { document, byId, reg, findCreated, createdCount, createdList };
}
function storage(map) { return { getItem: k => (map.has(k) ? map.get(k) : null), setItem: (k, v) => map.set(k, String(v)), removeItem: k => map.delete(k) }; }

/* ════════════════ MODEL — the independent answer ════════════════
   Nothing in this section touches a vm, calls a function of live-quiz.js or reads its state. Inputs: the quiz
   bank and i18n strings as data, what the driver did (who tapped what, when, in which tab), and what the fake
   world saw (what each tab was shown, which answer docs reached the teacher, which writes the rules refused). */
const CHROM = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
const OPEN_NOTE = { lowE: 4, A: 9, D: 2, G: 7, B: 11, highE: 4 };
const STRING_KEY = { lowE: 'fret.stringLowE', A: 'fret.stringA', D: 'fret.stringD', G: 'fret.stringG', B: 'fret.stringB', highE: 'fret.stringHighE' };
const PC_NAMES = ['E5', 'F5', 'F♯5', 'G5', 'A5', 'B5', 'C5', 'D5'];
const noteAt = (s, f) => CHROM[(OPEN_NOTE[s] + f) % 12];
function modelCorrect(quiz, target, mcAnswer) {
  if (quiz.kind === 'mc') return { correct: mcAnswer, ids: [mcAnswer] };
  if (quiz.kind === 'pcname') { const n = noteAt(target.string, Number(target.fret)) + '5'; return { correct: n, ids: [n] }; }
  const ids = [];
  for (let f = 0; f <= 12; f++) if (noteAt(target.string, f) === target.note) ids.push(`${target.string}:${f}`);
  return { correct: ids[0], ids };
}
function modelPoints(ms, speed, limit) {
  if (!speed) return 1000;
  const L = (limit || 20) * 1000;
  const m = Math.max(0, Math.min(L, ms));
  return Math.round(1000 * (1 - 0.5 * (m / L)));
}
function modelTimerText(limit, gone, lang, tIn) {
  const left = Math.max(0, limit - gone / 1000);
  if (left === 0) return tIn('lq.timeUp', lang);
  return limit < 10 ? (Math.ceil(left * 10) / 10).toFixed(1) : String(Math.ceil(left));
}
function modelRank(scores, names) {
  const rows = Object.keys(scores).map(uid => ({ uid, pts: scores[uid].pts, name: names[uid] || '' }));
  rows.sort((a, b) => b.pts - a.pts || a.name.localeCompare(b.name));
  return rows.map(r => ({ ...r, rank: 1 + rows.filter(x => x.pts > r.pts).length }));
}
class Model {
  constructor(bank, tIn, mode) { this.bank = bank; this.tIn = tIn; this.mode = mode; this.sid = null; this.names = {}; this.reset(); }
  reset() { this.lastQ = -1; this.q = {}; this.scores = {}; this.ans = new Map(); this.first = new Map(); this.tabSeen = new Map(); this.scored = {}; this.reveals = {}; }
  startGame(sid, quizId, speed, total) { this.sid = sid; this.quiz = this.bank[quizId]; this.speed = speed; this.total = total || 0; this.reset(); }
  /* The question label: "Question 3", or "Question 3 of 10" when the teacher set a number of questions before Start. */
  qLabel(lang, q) { return this.total ? this.tIn('lq.qLabelOf', lang, { n: q + 1, total: this.total }) : this.tIn('lq.qLabel', lang, { n: q + 1 }); }
  qParams(q) { return this.total ? { n: q + 1, total: this.total } : { n: q + 1 }; }
  openQuestion(q, target, limit, mcAnswer) { this.q[q] = { target, limit, mcAnswer, ...modelCorrect(this.quiz, target, mcAnswer) }; }
  isRight(q, choice) { return this.q[q].ids.includes(choice); }
  shown(uid, tabId, doc, t) {
    if (!doc || doc.sessionId !== this.sid || doc.state !== 'question') return;
    const k = `${uid}|${doc.qIndex}`, kt = `${tabId}|${doc.qIndex}`;
    if (!this.first.has(k)) this.first.set(k, t);
    if (!this.tabSeen.has(kt)) this.tabSeen.set(kt, t);
  }
  clock(uid, tabId, q) { return this.mode === 'tab' ? this.tabSeen.get(`${tabId}|${q}`) : this.first.get(`${uid}|${q}`); }
  /* The student's answer: their newest tap the rules did not refuse (R1; on a changeAnswer quiz a later tap replaces
     an earlier one, and a refused change leaves the one before it standing). */
  answerOf(uid, q) { let a = this.ans.get(`${uid}|${q}`) || null; while (a && a.state === 'rejected' && a.prev) a = a.prev; return a; }
  chain(uid, q) { const out = []; for (let a = this.ans.get(`${uid}|${q}`) || null; a; a = a.prev) out.push(a); return out; }
  eligible(uid, tabId, shownDoc, readingBack, t, choice) {
    if (!shownDoc || shownDoc.sessionId !== this.sid || shownDoc.state !== 'question') return { ok: false, why: 'no question on this screen' };
    const q = shownDoc.qIndex, Q = this.q[q];
    if (!Q) return { ok: false, why: `question ${q} never opened` };
    const a = this.answerOf(uid, q);
    const change = !!(a && a.state !== 'rejected' && this.quiz.changeAnswer && a.choice !== choice);
    if (a && a.state !== 'rejected' && !change) return { ok: false, q, why: `already answered ${a.choice} (${this.quiz.changeAnswer ? 'the same answer again changes nothing' : 'first tap wins'})` };
    if (readingBack) return { ok: false, q, why: 'this tab is still reading back its own answer after a reload' };
    const start = this.clock(uid, tabId, q);
    const ms = t - start;
    if (Q.limit > 0 && ms >= Q.limit * 1000) return { ok: false, q, ms, why: `time is up: ${ms} ms since the question first reached this student${this.mode === 'tab' ? ' in this tab' : ''}, limit ${Q.limit} s` };
    return { ok: true, q, ms, change };
  }
  tap(uid, q, choice, ms, t, rogue) { const k = `${uid}|${q}`; this.ans.set(k, { choice, ms, t, state: rogue ? 'rogue' : 'pending', prev: this.ans.get(k) || null }); }
  /* A write's fate, matched to the OLDEST tap of that choice still on its way (a student's writes commit in order). */
  outcome(uid, q, choice, ok) { const a = this.chain(uid, q).reverse().find(x => x.choice === choice && x.state === 'pending'); if (a) a.state = ok ? 'ok' : 'rejected'; }
  expectReveal(q, delivered) {
    const Q = this.q[q], rows = [], unexpected = [];
    for (const [uid, d] of delivered) {
      if (d.sessionId !== this.sid || d.qIndex !== q) continue;
      /* R7: the Reveal scores the answer the teacher's screen holds. On a changeAnswer quiz that may be an earlier pick
         than the student's last (the change had not reached the teacher yet): it counts when it IS a tap of this
         student the rules accepted, with that tap's own time. */
      const a = this.quiz.changeAnswer
        ? this.chain(uid, q).find(x => x.choice === d.choice && x.ms === d.ms && (x.state === 'ok' || x.state === 'pending')) || null
        : this.answerOf(uid, q);
      if (a && (a.state === 'ok' || a.state === 'pending')) rows.push({ uid, choice: a.choice, ms: a.ms });
      else unexpected.push(uid);
    }
    const next = {};
    for (const uid of Object.keys(this.scores)) next[uid] = { ...this.scores[uid], last: 0, lastRight: null };
    const tally = {};
    if (this.quiz.kind === 'mc') for (const c of this.quiz.choices) tally[c.id] = 0;
    if (this.quiz.kind === 'pcname') for (const n of PC_NAMES) tally[n] = 0;
    for (const r of rows) {
      tally[r.choice] = (tally[r.choice] || 0) + 1;
      const right = this.isRight(q, r.choice);
      const pts = right ? modelPoints(r.ms, this.speed, Q.limit) : 0;
      const cur = next[r.uid] || { pts: 0, right: 0, answered: 0 };
      next[r.uid] = { pts: cur.pts + pts, right: cur.right + (right ? 1 : 0), answered: cur.answered + 1, last: pts, lastRight: right };
    }
    return { correct: Q.correct, correctIds: Q.ids, tally, scores: next, scored: new Set(rows.map(r => r.uid)), unexpected };
  }
  commitReveal(q, exp) { this.scores = exp.scores; this.scored[q] = exp.scored; this.reveals[q] = exp; }
  verdict(uid, q) {
    const a = this.answerOf(uid, q);
    if (!a || a.state === 'rejected' || a.state === 'rogue') return { kind: 'none' };
    if (!this.isRight(q, a.choice)) return { kind: 'no' };
    /* scored AND scored right: on a changeAnswer quiz the Reveal may have scored an earlier, wrong pick; the right one
       the student changed to then came too late. */
    if (this.scored[q] && this.scored[q].has(uid) && this.reveals[q].scores[uid].lastRight) return { kind: 'yes', pts: this.reveals[q].scores[uid].last };
    return { kind: 'late' };
  }
  stagePrompt(target) {
    const tIn = this.tIn, quiz = this.quiz;
    if (quiz.kind === 'mc') return tIn(quiz.promptKey, 'en');
    if (!target) return tIn('lq.noTapYet', 'en');
    if (quiz.kind === 'pcname') return tIn(quiz.promptKey, 'en');
    const string = tIn(STRING_KEY[target.string], 'en');
    return tIn(quiz.promptKey, 'en', quiz.power ? { chord: target.note + '5', string } : { note: target.note, string });
  }
  stageAnswer(q) {
    const Q = this.q[q], quiz = this.quiz, tIn = this.tIn;
    if (!Q || !Q.correct) return null;
    if (quiz.kind === 'mc') { const c = quiz.choices.find(x => x.id === Q.mcAnswer); return c ? tIn(c.key, 'en') : null; }
    if (quiz.kind === 'pcname') return Q.correct;
    const frets = Q.ids.map(id => Number(id.split(':')[1]));
    const two = frets.length >= 2;
    const params = { n: frets[0], string: tIn(STRING_KEY[Q.target.string], 'en') };
    if (two) params.m = frets[1];
    if (quiz.power) params.chord = Q.target.note + '5';
    return tIn(quiz.power ? (two ? 'lq.answerPcAlso' : 'lq.answerPc') : (two ? 'lq.answerFretAlso' : 'lq.answerFret'), 'en', params);
  }
}
/* Hand-worked points (R6), asserted at start-up so the formula above is checked against arithmetic a reader can redo:
   speed, 10 s limit, answer at 2.5 s: 1000 × (1 − 0.5 × 2.5/10) = 875; at 0 s: 1000; at 12 s (past the buzzer): 500;
   speed, no limit, at 15 s: 1000 × (1 − 0.5 × 15/20) = 625; flat, any time: 1000. */
const POINTS_BY_HAND = [[2500, true, 10, 875], [0, true, 10, 1000], [12000, true, 10, 500], [15000, true, 0, 625], [5000, false, 10, 1000]];
/* ════════════════ end of MODEL ════════════════ */
/* Coverage (R1-2): in a full default run every rule must be exercised at least once; 0 fails the run. */
const COVERAGE = [
  ['R1', 'R1 second taps refused (first tap wins)'], ['R1change', 'R1 answers changed while the question was open (changeAnswer quizzes)'], ['Ccount', 'C countOnly Reveal screens (a count, no spread of picks)'], ['Tlast', 'T strips after the last of a set number of questions'], ['Tmore', 'T strips between questions with more to come'], ['R2', 'R2 taps refused during the read-back'], ['R3late', 'R3 taps refused after time-up'],
  ['R3buzzer', 'R3 taps at the buzzer refused by the screen code'], ['R4', 'R4 answer times compared'], ['R5', 'R5 taps judged in a reloaded tab'],
  ['R6speed', 'R6 speed answers scored (with a limit)'], ['R6nolimit', 'R6 speed + no-limit answers scored'], ['R6flat', 'R6 flat answers scored'],
  ['R7late', 'R7 right answers too late for the Reveal'], ['R7refused', 'R7 answers refused by the rules'], ['R8names', 'R8 doc writes scanned for names'],
  ['R8endq', 'R8 games ended with a question open'], ['R9order', 'R9 questions opened in order'], ['R9mc', 'R9 mc reveals'], ['R9fret', 'R9 fret reveals'],
  ['R9find', 'R9 Find-the-power-chord reveals'], ['R9name', 'R9 Name-the-power-chord reveals'], ['R10yes', 'R10 "Correct! +N" verdicts'], ['R10no', 'R10 "Not this time" verdicts'],
  ['R10none', 'R10 "You didn\'t answer" verdicts'], ['R10late', 'R10 "too late" verdicts'], ['R10end', 'R10 end screens'], ['R11q', 'R11 question stages'],
  ['R11lobby', 'R11 lobby stages'], ['R11strip', 'R11 control strips'], ['R11reveal', 'R11 Reveal answer lines'], ['R11lb', 'R11 leaderboards'],
  ['R11student', 'R11 student screens before Reveal'], ['R11clear', 'R11 cleared boards'], ['R12stage', 'R12 stage countdown repaints'],
  ['R12student', 'R12 student countdown repaints'], ['R12off', 'R12 buttons off after time-up'], ['R13', 'R13 tabs loaded'],
  ['Pwrites', 'P events checked during a preview (no write from that console)'], ['Pstudents', 'P student screens compared during a preview'],
  ['Pexit', 'P exits back to the real board'], ['Preal', 'P previews ended by a real game going live'],
  ['Pblocked', 'P Preview clicks while a real game was live'], ['Pnone', 'P strips painted during a real game (no Preview offered)'],
  ['R11doc', 'R11 question docs scanned for an answer'], ['R11stext', 'R11 student screens read word for word'], ['R11storage', 'R11 student storage keys checked at Reveal'], ['Aauto', 'A reveals the console made by itself at time-up'], ['Aoff', 'A timed rounds with "Reveal when time runs out" off, revealed by the teacher'],
  ['Hdefault', 'H "Hide names" boxes found unticked on a device that never set it'], ['Hlobby', 'H lobby stages with names hidden'], ['Hq', 'H question stages with names hidden'],
  ['Hreveal', 'H Reveal stages with names hidden'], ['Hend', 'H final stages with names hidden'], ['Htoggle', 'H stages checked right after the box was ticked']
];

/* ════════════════ the world: tabs, drivers, checks ════════════════ */
class Hang extends Error {}
/* The watchdog: the run happens in a child process that writes a heartbeat line to stderr about once a second
   (where it is); the parent kills it and exits 3 when none arrives for --stall seconds, so even a synchronous
   endless loop inside live-quiz.js is caught. */
let lastBeat = 0;
function beat(w, force) {
  const now = Date.now();
  if (process.env.LQL_CHILD && (force || now - lastBeat > 1000)) { lastBeat = now; process.stderr.write(`@@beat ${w.spec.name} at virtual ${(w.loop.now / 1000).toFixed(3)} s, last step "${w.where}"\n`); }
}
let CURRENT = null;
class World {
  constructor(spec, bank, tIn) {
    this.spec = spec; this.loop = new Loop(); this.fs = new FakeFS(this, FAKE_FAULT);
    this.model = new Model(bank, tIn, MODE); this.tIn = tIn; this.bank = bank;
    this.tabs = []; this.flags = []; this.lines = [];
    this.stats = { checks: 0, taps: 0, tapsAccepted: 0, tapsRefused: 0, tabs: 0, reloads: 0, timerChecks: 0, stageChecks: 0 };
    this.teacher = null; this.driver = null;
    this.intended = { limit: null, target: {}, mc: {}, speed: null, quizId: spec.quizId };
    this.students = spec.students; this.flagOnce = new Set();
    this.lastProgress = Date.now(); this.where = 'start';
    for (const s of this.students) this.model.names[s.uid] = s.name;
    this.oldNames = ['Oldie Leftover'];
    this.cov = {}; this.crashes = []; this.driverQ = -1;
    this.acc = { auto: { n: 0, refused: 0, late: 0 }, click: { n: 0, refused: 0, late: 0 }, join: { n: 0, cut: 0, auto: 0 } };
  }
  cover(k, n = 1) { this.cov[k] = (this.cov[k] || 0) + n; }
  ts() { return (this.loop.now / 1000).toFixed(3).padStart(8); }
  vlog(m) { if (VERBOSE) this.lines.push(`  [${this.ts()}s] ${m}`); }
  flag(cat, msg, data) {
    this.flags.push({ cat, msg, t: this.loop.now, data });
    if (VERBOSE) this.lines.push(`  [${this.ts()}s] ✗ ${cat}: ${msg}`);
  }
  crash(e) {
    const m = `the TOOL crashed: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' ') : e}`;
    this.crashes.push(m); this.flag('TOOL crash', m);
  }
  check(cat, ok, msg, onceKey, data) {
    this.stats.checks++;
    if (!ok && (!onceKey || this.once(onceKey))) this.flag(cat, typeof msg === 'function' ? msg() : msg, data);
    return ok;
  }
  once(key) { if (this.flagOnce.has(key)) return false; this.flagOnce.add(key); return true; }
  progress(where) { if (where) this.where = where; beat(this, !!where); }

  settle(tab, fn) { if (tab.alive) fn(); }
  callIn(tab, fn, args) {
    if (!tab.alive) return;
    try { fn.apply(null, args || []); }
    catch (e) { this.flag('R13 error', `${tab.label}: uncaught ${String(e && e.message || e)}`); }
  }
  run(tab, code, thisObj) {
    tab.ctx.__this = thisObj || null;
    try { return vm.runInContext(code, tab.ctx); }
    catch (e) { this.flag('R13 error', `${tab.label}: ${code.slice(0, 80)} threw ${String(e && e.message || e)}`); return undefined; }
  }

  makeTab(kind, student, slot, second) {
    const id = this.tabs.length;
    const tab = {
      id, kind, isTeacher: kind === 'teacher', uid: student ? student.uid : 'teacher-uid', student, alive: true, born: this.loop.now,
      label: kind === 'teacher' ? (this.tabs.some(t => t.isTeacher) ? 'second console (another device)' : 'teacher') : `${student.name} (${kind === 'journey' ? 'Journey page, ' : ''}${second ? 'second tab, ' : ''}tab ${student.tabs.length + 1})`, slot, second: !!second,
      timers: new Map(), tseq: 0, listeners: [], gets: 0, readBacks: [], pending: 0, dirty: new Set(), view: null, shown: null, lastCommit: 0,
      delivered: new Map(), clockStart: {}, writes: 0, previewing: false, pview: null, logs: [], logsSeen: 0,
      net: student ? student.net : this.spec.teacherNet
    };
    const jr = rngFor(SEED, this.spec.name, 'late', id), busy = !!(student && student.busy);
    tab.late = () => between(jr, 0, busy ? MAX_LATE_BUSY : MAX_LATE);
    const dom = makeDom(tab, this);
    tab.dom = dom;
    if (kind === 'teacher') { for (const e of ['t-grid-container', 'lq-shell', 'lq-stage', 'lq-controls']) dom.reg(e); }
    else if (kind === 'student') { dom.reg('live-quiz-body'); dom.reg('live-quiz-screen'); }
    const loop = this.loop, w = this;
    const st = kind === 'teacher' ? (this.tabs.some(t => t.isTeacher) ? { local: new Map() } : this.spec.teacherStorage) : student.storage;
    const g = {
      console: { log: (...a) => tab.logs.push(a.map(String).join(' ')), info: (...a) => tab.logs.push(a.map(String).join(' ')), debug: (...a) => tab.logs.push(a.map(String).join(' ')), warn: (...a) => { tab.logs.push(a.map(x => { try { return typeof x === 'object' ? JSON.stringify(x) : String(x); } catch (e) { return String(x); } }).join(' ')); w.vlog(`${tab.label} console.warn ${a.map(String).join(' ').slice(0, 160)}`); }, error: (...a) => w.flag('R13 error', `${tab.label} console.error ${a.map(String).join(' ').slice(0, 200)}`) },
      performance: { now: () => loop.now - tab.born },
      setTimeout: (fn, ms, ...a) => { const tid = ++tab.tseq; tab.timers.set(tid, loop.at(loop.now + Math.max(0, Math.round(Number(ms) || 0)) + tab.late(), () => { tab.timers.delete(tid); if (typeof fn === 'function') w.callIn(tab, fn, a); }, tab)); return tid; },
      clearTimeout: tid => { const ev = tab.timers.get(tid); if (ev) { ev.dead = true; tab.timers.delete(tid); } },
      setInterval: (fn, ms) => {
        const tid = ++tab.tseq, every = Math.max(1, Math.round(Number(ms) || 0));
        let due = loop.now;
        const step = () => { due += every; tab.timers.set(tid, loop.at(Math.max(loop.now, due + tab.late()), fire, tab)); };
        const fire = () => { step(); w.callIn(tab, fn, []); };
        step(); return tid;
      },
      clearInterval: tid => { const ev = tab.timers.get(tid); if (ev) { ev.dead = true; tab.timers.delete(tid); } },
      localStorage: storage(st.local), sessionStorage: storage(slot ? slot.session : new Map()),
      document: dom.document, location: { hash: '', get href() { return kind === 'journey' ? 'https://class.example.invalid/tabs/journey.html' : 'https://class.example.invalid/index.html'; }, set href(v) { w.navigate(tab, String(v)); } },
      escHtml, escAttr, alert: m => w.flag('R13 error', `${tab.label}: alert("${String(m)}") — a teacher write failed`), confirm: m => { w.checkDialog(tab, String(m)); return true; },
      firebase: this.fs.firebaseFor(tab),
      addEventListener() {}, removeEventListener() {}, dispatchEvent() {}, CustomEvent: function () {},
      __now: () => EPOCH + loop.now, __rng: rngFor(SEED, this.spec.name, 'tabrng', id)
    };
    g.window = g;
    vm.createContext(g);
    tab.ctx = g;
    try {
      vm.runInContext('Math.random = __rng; Date.now = __now;', g);
      for (const f of ['i18n.js', 'guitar-diagrams.js', 'live-quiz.js']) SCRIPTS[f].runInContext(g);
    } catch (e) { this.flag('R13 error', `${tab.label}: live-quiz.js would not load: ${String(e && e.message || e)}`); tab.alive = false; tab.broken = true; }
    this.tabs.push(tab); this.stats.tabs++;
    if (tab.alive) this.cover('R13');
    if (student) student.tabs.push(tab);
    return tab;
  }
  killTab(tab) {
    tab.alive = false;
    for (const l of tab.listeners) { l.dead = true; this.fs.docL.delete(l); this.fs.ansL.delete(l); }
    for (const ev of tab.timers.values()) ev.dead = true;
  }

  /* fake-world hooks */
  beforeDoc(tab, raw) {
    tab.view = raw ? cloneRaw(raw) : null;
    tab.shown = raw ? { sessionId: raw.sessionId, state: raw.state, qIndex: raw.qIndex, target: raw.target, limitSec: raw.limitSec } : null;
    if (tab.isTeacher) {
      if (raw && raw.state === 'question' && tab.clockStart[`${raw.sessionId}|${raw.qIndex}`] === undefined) tab.clockStart[`${raw.sessionId}|${raw.qIndex}`] = this.loop.now;
      if (tab.previewing && realLive(raw)) { tab.previewing = false; tab.pview = null; tab.previewEndedByReal = true; tab.pvFlip = true; tab.forceStage = true; this.cover('Preal'); this.vlog(`${tab.label}: a real game went live (${raw.sessionId}, ${raw.state}): the preview must end at once`); }
      return;
    }
    if (raw && raw.state === 'question' && tab.kind === 'student') {
      const fresh = !this.model.first.has(`${tab.uid}|${raw.qIndex}`) && raw.sessionId === this.model.sid;
      this.model.shown(tab.uid, tab.id, raw, this.loop.now);
      if (fresh || !tab.seenQ || tab.seenQ !== raw.qIndex) this.vlog(`${tab.label} sees question ${raw.qIndex + 1}${raw.limitSec ? ` (${raw.limitSec} s)` : ''}`);
    }
  }
  afterDoc(tab, raw) {
    if (tab.isTeacher || !raw || raw.sessionId !== this.model.sid) return;
    const s = tab.student;
    const key = `${raw.sessionId}|${raw.qIndex}`;
    if (tab.kind === 'journey') { if (raw.state === 'question' && tab.seenQ !== key) { tab.seenQ = key; this.journeySeesQuestion(s, tab, raw.qIndex); } return; }
    if (raw.state === 'question' && tab.seenQ !== key) { tab.seenQ = key; this.studentSeesQuestion(s, tab, raw.qIndex); }
    if (raw.state === 'reveal' && tab.seenReveal !== key) { tab.seenReveal = key; this.studentSeesReveal(s, tab, raw.qIndex); }
    if (raw.state === 'lobby' && tab.seenLobby !== raw.sessionId) { tab.seenLobby = raw.sessionId; if (s.lobbyReload && s.tabs.length === 1) this.loop.at(this.loop.now + s.lobbyReload, () => this.reload(s, 'in the lobby'), tab); }
  }
  beforeAnswers(tab, docs) {
    if (!tab.isTeacher) return;
    tab.delivered = new Map(docs.map(d => [d.id, d.data]));
  }
  onAnswerSent(tab, uid, data) { if (tab.capture) tab.capture.push(data); }
  onAnswerCommit(tab, uid, data, why) {
    if (data.qIndex >= 0) this.vlog(`server: ${tab.label}'s answer ${data.choice} for question ${data.qIndex + 1} ${why ? `REFUSED by the rules (${why})` : 'committed'}`);
    if (data.sessionId === this.model.sid && data.qIndex >= 0) {
      if (!why) this.model.outcome(uid, data.qIndex, data.choice, true);
      const k = `${data.sessionId}|${uid}|${data.qIndex}`;
      if (!why) {
        this.commits = this.commits || new Map();
        const n = (this.commits.get(k) || 0) + 1; this.commits.set(k, n);
        this.check('R1 one pick', n === 1 || !!this.model.quiz.changeAnswer, () => `${tab.label}: a SECOND answer doc for question ${data.qIndex + 1} reached the server (now ${data.choice}): first tap must win`);
      }
    }
  }
  onAnswerRefusedBack(tab, uid, data) {
    tab.refused = tab.refused || new Set(); tab.refused.add(`${data.sessionId}|${data.qIndex}`);
    if (data.sessionId === this.model.sid && data.qIndex >= 0) {
      this.model.outcome(uid, data.qIndex, data.choice, false);
      /* The tab goes back to the pick that still stands (changeAnswer: the one before the refused change), or to none. */
      const k = `${data.sessionId}|${data.qIndex}`, a = this.model.answerOf(uid, data.qIndex);
      if (tab.picks && tab.picks[k] === data.choice) { if (a && a.state !== 'rejected' && a.state !== 'rogue') tab.picks[k] = a.choice; else delete tab.picks[k]; }
    }
  }
  /* A: Reveal when time runs out (7c1792e). A reveal write the driver did not click is the console's own: judge it
     and take the expectation from what that console's screen holds at that moment (R7). */
  onWriteIssued(tab, data) {
    if (!tab.isTeacher || data.state !== 'reveal' || this.pendingReveal || !this.model.sid) return;
    if (!tab.shown || tab.shown.sessionId !== this.model.sid || tab.shown.state !== 'question') return;
    this.autoRevealIssued(tab, tab.shown.qIndex);
  }
  autoRevealIssued(tab, q) {
    const Q = this.model.q[q], quiz = this.model.quiz, now = this.loop.now;
    if (!Q) return;
    const on = this.intended.auto !== false;
    this.cover('Aauto');
    this.check('A auto-reveal', on && quiz.kind !== 'mc' && Q.limit > 0, () => `${tab.label} revealed question ${q + 1} by itself, but ${!on ? 'its "Reveal when time runs out" box is off' : quiz.kind === 'mc' ? 'an mc quiz is marked by the teacher' : 'the question has no time limit'}`);
    const opened = tab.clockStart[`${this.model.sid}|${q}`];
    this.vlog(`${tab.label} reveals question ${q + 1} BY ITSELF, ${((now - opened) / 1000).toFixed(3)} s after the question reached it (limit ${Q.limit} s)`);
    this.check('A auto-reveal', opened !== undefined && now >= opened + Q.limit * 1000 + AUTO_GRACE_MS, () => `${tab.label} revealed question ${q + 1} by itself ${((now - opened) / 1000).toFixed(3)} s after the question reached it: before the ${Q.limit} s limit + the ${AUTO_GRACE_MS / 1000} s grace`);
    this.pendingAuto = true;
    this.deliveredAtReveal = new Map(tab.delivered);
    this.pendingReveal = this.model.expectReveal(q, tab.delivered);
  }
  onCommitCurrent(doc, prev, writer, preview) {
    if (doc.state === 'reveal' && prev && prev.state === 'reveal' && doc.sessionId === prev.sessionId && doc.qIndex === prev.qIndex && doc.sessionId === this.model.sid) {
      this.pendingReveal = null;
      const same = JSON.stringify(doc.scores) === JSON.stringify(prev.scores) && JSON.stringify(doc.tally) === JSON.stringify(prev.tally);
      this.check('A double reveal', same, () => `question ${doc.qIndex + 1} was revealed a second time (by ${writer ? writer.label : '?'}) and the scores or tally changed: ${JSON.stringify(prev.tally)} → ${JSON.stringify(doc.tally)}`);
    }
    const text = JSON.stringify(doc);
    this.cover('R8names');
    for (const n of [...this.students.map(s => s.name), ...this.oldNames]) this.check('R8 no names', !text.includes(n), () => `liveQuiz/current (read by every signed-in account) holds the name "${n}" after the ${doc.state} write`);
    if (doc.state === 'lobby' && (!prev || prev.sessionId !== doc.sessionId)) {
      this.model.startGame(doc.sessionId, this.intended.quizId, this.intended.speed, this.intended.total);
      this.vlog(`${preview ? 'preview (the console\'s own copy)' : 'server'}: game ${doc.sessionId} started (${this.intended.quizId}, ${this.intended.speed ? 'faster = more points' : 'every correct answer = 1000'}, limit ${this.intended.limit} s)`);
      this.lobbyDoc = { quizId: doc.quizId, speedBonus: doc.speedBonus, startedAt: doc.startedAt, totalQ: doc.totalQ };
      this.scoresBefore = {};
      this.check('R6 scoring', doc.speedBonus === this.intended.speed, () => `Start wrote speedBonus ${doc.speedBonus}, the Scoring box said ${this.intended.speed ? 'speed' : 'flat'}`);
      this.check('R6 scoring', doc.quizId === this.intended.quizId && JSON.stringify(doc.scores) === '{}', () => `Start wrote quizId ${doc.quizId} / scores ${JSON.stringify(doc.scores)}`);
    }
    if (doc.state === 'question' && doc.sessionId === this.model.sid && (!prev || prev.state !== 'question' || prev.qIndex !== doc.qIndex)) {
      const q = doc.qIndex, wantQ = this.model.lastQ + 1;
      this.cover('R9order');
      this.check('R9 question order', q === wantQ && q === this.driverQ, () => `the teacher opened question ${this.driverQ + 1}, the doc wrote qIndex ${q} (want ${wantQ}: one more than the last question${wantQ ? '' : ', 0 from the lobby'})`);
      this.model.lastQ = q;
      this.model.openQuestion(q, doc.target ? cloneRaw(doc.target) : null, this.intended.limit, this.intended.mc[this.driverQ]);
      this.vlog(`server: question ${q + 1} opened${doc.target ? ` (target ${JSON.stringify(doc.target)})` : ''}, limitSec ${doc.limitSec}`);
      this.check('R3 limit', doc.limitSec === this.intended.limit, () => `question ${q + 1} wrote limitSec ${doc.limitSec}, the Time-to-answer box said ${this.intended.limit}`);
      const it = this.intended.target[q];
      if (it) this.check('R9 target', doc.target && doc.target.string === it.string && doc.target.note === it.note, () => `the teacher picked ${JSON.stringify(it)}, question ${q + 1} wrote target ${JSON.stringify(doc.target)}`);
      for (const s of this.students) if (s.lateFor === q && !s.tabs.length) this.loop.at(this.loop.now + s.lateDelay, () => this.bootStudent(s, 'arrives late'), null);
    }
    /* R3-1: every doc committed while a question is open (read by every signed-in account) carries no answer: only the
       field names a question doc has today (DOC_Q_FIELDS), and correct / correctIds / tally empty, target without a name. */
    if (doc.state === 'question' && doc.sessionId === this.model.sid) {
      /* F4-1: every field's VALUE is pinned to what the model says, on every commit while the question is open. */
      const q = doc.qIndex, Q = this.model.q[q], L = this.lobbyDoc || {}, kind = this.model.quiz.kind, bad = [];
      const keys = Object.keys(doc).sort().join(','), wantKeys = [...DOC_Q_FIELDS].sort().join(',');
      if (keys !== wantKeys) bad.push(`fields ${keys} (want ${wantKeys})`);
      const tk = doc.target ? Object.keys(doc.target).sort().join(',') : null, wantTk = TARGET_KEYS[kind];
      if (tk !== wantTk) bad.push(`target keys ${tk} (want ${wantTk})`);
      if (Q && JSON.stringify(doc.target ?? null) !== JSON.stringify(Q.target ?? null)) bad.push(`target ${JSON.stringify(doc.target)} changed since the question opened (${JSON.stringify(Q.target)})`);
      for (const k of ['correct', 'correctIds', 'tally', 'endedAt']) if (doc[k] != null) bad.push(`${k} ${JSON.stringify(doc[k])} (want null)`);
      if (doc.qIndex !== this.model.lastQ) bad.push(`qIndex ${doc.qIndex} (want ${this.model.lastQ})`);
      if (Q && doc.limitSec !== Q.limit) bad.push(`limitSec ${doc.limitSec} (want ${Q.limit})`);
      if (doc.totalQ !== (this.intended.total || 0)) bad.push(`totalQ ${JSON.stringify(doc.totalQ)} (want ${this.intended.total || 0}, the Questions box at Start)`);
      for (const k of ['quizId', 'speedBonus', 'startedAt', 'totalQ']) if (JSON.stringify(doc[k] ?? null) !== JSON.stringify(L[k] ?? null)) bad.push(`${k} ${JSON.stringify(doc[k])} changed since the lobby (${JSON.stringify(L[k])})`);
      const sc = o => JSON.stringify(Object.keys(o || {}).sort().map(u => [u, Object.keys(o[u]).sort().map(f => [f, o[u][f]])]));
      /* scores: exactly what the last Reveal (or Start) wrote; whether those were right is R6-R8's check at that Reveal */
      if (sc(doc.scores) !== sc(this.scoresBefore)) bad.push(`scores ${sc(doc.scores)} (want the scores before this round ${sc(this.scoresBefore)})`);
      const at = JSON.stringify(doc.askedAt ?? null);
      if (Q && Q.askedAt === undefined) Q.askedAt = preview ? 'null' : JSON.stringify({ __ts: this.loop.now });
      if (Q && at !== Q.askedAt) bad.push(`askedAt ${at} (want ${Q.askedAt}: ${preview ? 'null in a preview' : 'the server time of the opening write'})`);
      this.cover('R11doc');
      this.check('R11 no answer in doc', !bad.length, () => `question ${q + 1}'s doc (read by every signed-in account) is not the question doc the rules give: ${bad.join('; ')}`, `docq|${doc.sessionId}|${q}`);
    }
    if (doc.state === 'reveal' && doc.sessionId === this.model.sid && prev && prev.state === 'question') {
      const q = doc.qIndex, exp = this.pendingReveal;
      this.pendingReveal = null;
      if (!exp) { this.flag('R7 reveal', `question ${q + 1} was revealed with no Reveal click`); return; }
      this.revealHow = this.revealHow || {};
      this.revealHow[`${doc.sessionId}|${q}`] = { kind: this.pendingAuto ? 'auto' : 'click', t: this.loop.now };
      this.pendingAuto = false;
      this.revealCommitted = true;
      if (!preview) this.checkStorage(q);
      this.scoresBefore = cloneRaw(doc.scores || {});
      this.vlog(`server: question ${q + 1} revealed: ${doc.correct}`);
      this.check('R9 answer', doc.correct === exp.correct, () => `question ${q + 1}: Reveal wrote correct ${JSON.stringify(doc.correct)}, the right answer is ${JSON.stringify(exp.correct)}`);
      if (this.model.quiz.kind === 'fret') this.check('R9 answer', JSON.stringify(doc.correctIds) === JSON.stringify(exp.correctIds), () => `question ${q + 1}: Reveal wrote correctIds ${JSON.stringify(doc.correctIds)}, want ${JSON.stringify(exp.correctIds)}`);
      const sortObj = o => JSON.stringify(Object.keys(o || {}).sort().map(k => [k, o[k]]));
      const held = this.deliveredAtReveal || new Map();
      const tallyWithout = name => {
        const uid = Object.keys(this.model.names).find(u => this.model.names[u] === name);
        const have = { ...(doc.tally || {}) }, want = { ...exp.tally }, d = held.get(uid), a = this.model.answerOf(uid, q);
        if (d && d.sessionId === this.model.sid && d.qIndex === q && have[d.choice]) have[d.choice]--;
        if (a && exp.scored.has(uid) && want[a.choice]) want[a.choice]--;
        return sortObj(have) === sortObj(want);
      };
      this.check('R9 tally', sortObj(doc.tally) === sortObj(exp.tally), () => `question ${q + 1}: tally ${sortObj(doc.tally)}, want ${sortObj(exp.tally)}`, null, { equalWithout: tallyWithout });
      const uids = new Set([...Object.keys(doc.scores || {}), ...Object.keys(exp.scores)]);
      for (const uid of uids) {
        const got = (doc.scores || {})[uid], want = exp.scores[uid];
        const nm = this.model.names[uid] || uid;
        const g = got ? JSON.stringify({ pts: got.pts, right: got.right, answered: got.answered, last: got.last, lastRight: got.lastRight }) : 'none';
        const x = want ? JSON.stringify(want) : 'none';
        this.check('R6-R8 points', g === x, () => `question ${q + 1}: ${nm}'s score is ${g}, the rules give ${x}${this.why(uid, q)}`);
      }
      this.model.commitReveal(q, exp);
      const kind = this.model.quiz.kind === 'fret' ? (this.model.quiz.power ? 'R9find' : 'R9fret') : this.model.quiz.kind === 'pcname' ? 'R9name' : 'R9mc';
      this.cover(kind);
      const rights = [...exp.scored].filter(u => exp.scores[u].lastRight).length;
      this.cover(!this.model.speed ? 'R6flat' : this.model.q[q].limit ? 'R6speed' : 'R6nolimit', rights);
    }
    if (doc.state === 'ended' && prev && prev.state === 'question' && doc.sessionId === this.model.sid) this.vlog('server: game ended with a question open (that round is thrown away)');
    if (doc.state === 'ended' && doc.sessionId === this.model.sid) {
      const sortObj = o => JSON.stringify(Object.keys(o || {}).sort().map(k => [k, o[k] && { pts: o[k].pts, right: o[k].right, answered: o[k].answered }]));
      const want = Object.fromEntries(Object.entries(this.model.scores).map(([u, v]) => [u, v]));
      const endWithout = name => { const uid = Object.keys(this.model.names).find(u => this.model.names[u] === name); const a = { ...(doc.scores || {}) }, b = { ...want }; delete a[uid]; delete b[uid]; return sortObj(a) === sortObj(b); };
      this.check('R8 end', sortObj(doc.scores) === sortObj(want), () => `End wrote scores ${sortObj(doc.scores)}, want ${sortObj(want)}`, null, { equalWithout: endWithout });
    }
  }
  why(uid, q) {
    const a = this.model.answerOf(uid, q), d = this.deliveredAtReveal && this.deliveredAtReveal.get(uid);
    return ` (rules: ${a ? `answer ${a.choice} at ${a.ms} ms, ${a.state}` : 'no countable answer'}; teacher's screen held ${d && d.sessionId === this.model.sid ? `qIndex ${d.qIndex} ${d.choice} ms ${d.ms}` : 'nothing'} at Reveal)`;
  }

  /* students */
  bootStudent(s, why, slot, second) {
    if (!slot) { slot = { session: new Map() }; s.slots.push(slot); }
    const tab = this.makeTab('student', s, slot, second);
    this.vlog(`${tab.label} signs in (${why})`);
    if (!tab.alive) return;
    this.run(tab, `var currentUser = { uid: ${JSON.stringify(s.uid)}, displayName: ${JSON.stringify(s.name)}, email: '' }; lqStartListening();`);
  }
  /* A reload keeps the tab's sessionStorage (a browser keeps it for the same tab); fresh = the student closes the tab
     and opens the site in a new one (or on another device): new sessionStorage. */
  reload(s, why, fresh) {
    const old = s.tabs.filter(t => t.alive && !t.second).pop();
    if (!old) return;
    this.killTab(old); this.stats.reloads++;
    this.vlog(`${old.label} ${fresh ? 'CLOSES THE TAB and opens the site in a NEW tab' : 'RELOADS'} ${why}`);
    this.loop.at(this.loop.now + s.reloadGap, () => this.bootStudent(s, fresh ? 'in a new tab' : 'after a reload', fresh ? null : old.slot), null);
  }
  curTab(s) { const t = s.tabs.filter(x => !x.second && x.kind === 'student').pop(); return t && t.alive ? t : null; }
  liveTabs(s) { return s.tabs.filter(t => t.alive && t.kind === 'student'); }
  /* A Song Journey page (tabs/*.html): live-quiz.js without #live-quiz-body (no game UI), only the banner. Its Join
     navigates the SAME tab to the site (location.href), which keeps sessionStorage (R2-5). No currentUser there. */
  bootJourney(s) {
    const slot = { session: new Map() }; s.slots.push(slot);
    const tab = this.makeTab('journey', s, slot);
    this.vlog(`${tab.label} is on a Song Journey page`);
    if (tab.alive) this.run(tab, 'lqStartListening();');
  }
  journeySeesQuestion(s, tab, q) {
    if (s.journeyJoinAfter == null) return;
    this.loop.at(this.loop.now + s.journeyJoinAfter, () => {
      if (!tab.alive) return;
      const btn = tab.dom.findCreated(e => e.className === 'lq-banner-btn');
      this.check('R13 error', !!btn, `${tab.label}: the Journey page shows no "join" banner during question ${q + 1}`);
      if (btn) { this.vlog(`${tab.label} taps Join on the banner`); for (const fn of btn.listeners.click || []) this.callIn(tab, fn, [{}]); }
    }, tab);
  }
  navigate(tab, url) {
    if (!tab.alive) return;
    const s = tab.student;
    this.vlog(`${tab.label} goes to ${url} in the same tab`);
    this.killTab(tab);
    this.loop.at(this.loop.now + 1200, () => this.bootStudent(s, 'from the Journey page, same tab', tab.slot), null);
  }
  /* A second student signs in on the SAME browser tab mid-question (R2-6): same sessionStorage, another uid. */
  switchUser(from, to, q) {
    const tab = this.curTab(from);
    if (!tab) return;
    this.vlog(`${tab.label} signs out; ${to.name} signs in on the same tab during question ${q + 1}`);
    this.killTab(tab);
    this.loop.at(this.loop.now + 1500, () => this.bootStudent(to, 'signs in on a classmate\'s tab', tab.slot), null);
  }
  studentSeesQuestion(s, tab, q) {
    const plan = s.plans[q]; if (!plan) return;
    const at = (ms, fn) => this.loop.at(this.loop.now + ms, () => (tab.alive ? fn() : undefined), tab);
    if (tab.second) { if (plan.secondTap != null) at(plan.secondTap, () => this.tap(s, tab, q, 'other', 'taps a DIFFERENT choice in the second tab')); return; }
    const reloaded = s.tabs.filter(t => !t.second && t.kind === 'student').length > 1 && this.model.first.get(`${s.uid}|${q}`) < tab.born;
    if (plan.switchTo != null) at(plan.switchAfter, () => this.switchUser(s, this.students[plan.switchTo], q));
    if (reloaded) {
      if (plan.reload === 'afterAnswer' || plan.reload === 'sendReload') { at(40, () => this.tap(s, tab, q, 'other', 'taps again at once after the reload')); at(1500, () => this.tap(s, tab, q, 'other', 'taps again after the reload')); }
      else at(plan.retap || 1000, () => this.tap(s, tab, q, 'plan', 'taps after the reload'));
      return;
    }
    if (plan.answer) at(plan.r, () => this.tap(s, tab, q, 'plan', 'taps'));
    if (plan.answer && plan.double) at(plan.r + plan.double, () => this.tap(s, tab, q, plan.doubleRight ? 'right' : 'other', plan.doubleRight ? 'taps a second choice (a right one)' : 'taps a second choice'));
    if (['midq', 'afterAnswer', 'afterTimeout', 'sendReload', 'newTab'].includes(plan.reload)) at(plan.reloadAt, () => this.reload(s, `during question ${q + 1}`, plan.reload === 'newTab'));
  }
  studentSeesReveal(s, tab, q) {
    const plan = s.plans[q];
    if (plan && plan.reload === 'inReveal' && !plan.revealReloaded && (plan.revealReloaded = true)) this.loop.at(this.loop.now + plan.reloadAt, () => { if (tab.alive) this.reload(s, `while question ${q + 1}'s answer is up`); }, tab);
  }
  choiceFor(s, q, mode) {
    const Q = this.model.q[q], quiz = this.model.quiz, r = s.rng;
    const plan = s.plans[q];
    const right = mode === 'plan' ? plan.right : mode === 'right';
    const pool = quiz.kind === 'mc' ? quiz.choices.map(c => c.id) : quiz.kind === 'pcname' ? PC_NAMES
      : quiz.strings.flatMap(k => Array.from({ length: 13 }, (_, f) => `${k}:${f}`));
    if (mode === 'plan' && plan.choice && pool.includes(plan.choice)) return plan.choice;
    let c;
    if (right) c = pick(r, Q.ids);
    else { const prev = this.model.answerOf(s.uid, q); const wrong = pool.filter(x => !Q.ids.includes(x) && !(prev && x === prev.choice)); c = pick(r, wrong.length ? wrong : pool); }
    if (mode === 'plan') plan.choice = c;
    return c;
  }
  screenOffers(tab, q, choice) {
    const body = tab.dom.byId.get('live-quiz-body');
    const shown = tab.shown;
    if (!body || !shown || shown.state !== 'question' || shown.qIndex !== q) return null;
    const quiz = this.model.quiz;
    if (quiz.kind === 'fret') {
      if (body.innerHTML.includes('lq-locked') && !quiz.changeAnswer) return null;
      const board = tab.dom.byId.get('lq-board');
      if (!board || board.classList.contains('lq-board-off')) return null;
      const [k, f] = choice.split(':');
      return { code: `lqTap('lq',${JSON.stringify(k)},${Number(f)})`, disabled: false };
    }
    const btn = body.buttons.find(b => b.cls.split(/\s+/).includes('lq-choice') && (quiz.kind === 'pcname' ? b.label === choice : b.onclick === `lqAnswer('${choice}')`));
    if (!btn) return null;
    return { code: btn.onclick, disabled: btn.disabled };
  }
  async tap(s, tab, q, mode, what) {
    if (!tab.alive || !this.model.q[q]) return;
    if (tab.born > this.model.first.get(`${s.uid}|${q}`)) this.cover('R5');
    const choice = this.choiceFor(s, q, mode);
    const t = this.loop.now;
    const readingBack = tab.readBacks.some(rb => tab.shown && rb.sid === tab.shown.sessionId && rb.q === tab.shown.qIndex);
    const dec = this.model.eligible(s.uid, tab.id, tab.shown, readingBack, t, choice);
    const offer = this.screenOffers(tab, q, choice);
    this.stats.taps++;
    let wrote = null;
    if (offer && !offer.disabled) {
      tab.capture = [];
      this.run(tab, offer.code);
      await drain();
      wrote = tab.capture.find(d => d.qIndex === q) || null;
      tab.capture = null;
    }
    const screen = !offer ? 'nothing to tap' : offer.disabled ? 'the button is disabled' : wrote ? 'ACCEPTED' : 'nothing happened';
    this.vlog(`${tab.label} ${what}: ${choice} → ${screen}; rules: ${dec.ok ? `counts (${dec.ms} ms)` : `refuse (${dec.why})`}`);
    if (wrote) this.stats.tapsAccepted++; else this.stats.tapsRefused++;
    if (!dec.ok && !wrote) {
      if (/already answered/.test(dec.why)) this.cover('R1');
      if (/reading back/.test(dec.why)) this.cover('R2');
      if (/time is up/.test(dec.why)) { this.cover('R3late'); if (offer && !offer.disabled) this.cover('R3buzzer'); }
    }
    if (dec.ok) {
      if (!offer || offer.disabled) {
        const key = `block|${tab.id}|${q}`;
        if (dec.q === q && this.once(key)) this.check('R2/R3 can answer', false, `${tab.label}, question ${q + 1}: the screen offers no way to answer (${screen}) but the rules let this student answer (${dec.ms} ms in, limit ${this.model.q[q].limit} s)`);
      } else this.check('R2/R3 can answer', !!wrote, () => `${tab.label}, question ${q + 1}: a tap the rules allow (${dec.ms} ms in) was refused by the screen`);
      if (wrote) {
        tab.picks = tab.picks || {}; tab.picks[`${this.model.sid}|${q}`] = choice;
        if (dec.change) this.cover('R1change');
        if (tab.refused) tab.refused.delete(`${this.model.sid}|${q}`);   /* a new tap clears the save-failed line */
        this.model.tap(s.uid, q, choice, dec.ms, t, false);
        this.check('R4 the written answer', wrote.choice === choice && wrote.qIndex === q && wrote.sessionId === this.model.sid && wrote.uid === s.uid && wrote.name === s.name, () => `${tab.label}: wrote ${JSON.stringify({ choice: wrote.choice, qIndex: wrote.qIndex, uid: wrote.uid })}, tapped ${choice} on question ${q + 1}`);
        this.cover('R4');
        this.check('R4/R5 answer time', wrote.ms === dec.ms, () => `${tab.label}, question ${q + 1}: the answer doc says ms ${wrote.ms}, the student's own clock says ${dec.ms} (${this.model.mode === 'first' ? 'from the question\'s first arrival' : 'from this tab\'s arrival'})`);
      }
    } else if (wrote) {
      tab.picks = tab.picks || {}; tab.picks[`${this.model.sid}|${q}`] = choice;
      this.check('R1-R3 refused tap', false, `${tab.label}, question ${q + 1}: a tap the rules refuse was ACCEPTED and written (${choice}, ms ${wrote.ms}): ${dec.why}`);
      if (!this.model.answerOf(s.uid, q) || this.model.answerOf(s.uid, q).state === 'rejected') this.model.tap(s.uid, q, choice, wrote.ms, t, true);
    } else this.stats.checks++;
    tab.retries = tab.retries || {};
    if (!wrote && offer && !offer.disabled && (tab.retries[q] || 0) < 2 && mode !== 'other') {
      tab.retries[q] = (tab.retries[q] || 0) + 1;
      this.loop.at(this.loop.now + 1200, () => (tab.alive ? this.tap(s, tab, q, mode, 'taps again (no response)') : undefined), tab);
    }
  }

  /* checks run after every event */
  afterEvent() {
    for (const tab of this.tabs) {
      if (!tab.alive) { tab.dirty.clear(); continue; }
      if (tab.isTeacher) this.checkTeacher(tab); else if (tab.kind === 'student') this.checkStudent(tab);
      if (!tab.isTeacher) this.checkSideChannels(tab);
      tab.dirty.clear();
    }
  }
  /* P: the Preview rule (the comment above lqTPreview). The console's teacher clicks Preview: it opens only when no
     real game is live on that console's copy of the doc. While it runs, that console writes nothing, the doc and the
     answers stay as they were, and every student screen stays exactly as it was (when no other console writes). */
  previewStart(tab) {
    tab.previewing = !realLive(tab.shown);
    tab.pvFlip = true; tab.previewEndedByReal = false;
    if (!tab.previewing) { this.vlog(`${tab.label}: a real game is live (${tab.shown.sessionId}, ${tab.shown.state}): Preview must not open`); return; }
    const raw = this.readSession(tab);
    tab.pvRaw = raw; tab.pvDoc = raw ? JSON.parse(raw) : null;
    const students = new Map();
    for (const t of this.tabs) if (t.alive && t.kind === 'student') students.set(t.id, { html: t.dom.byId.get('live-quiz-body').innerHTML, created: t.dom.createdCount(), got: t.docDeliveries || 0 });
    tab.pvBase = { at: this.loop.now, writes: tab.writes, others: this.fs.stats.writes - tab.writes, cur: JSON.stringify(this.fs.cur), ans: JSON.stringify([...this.fs.ans]), stage: tab.dom.byId.get('lq-stage').innerHTML, strip: stripView(tab), students };
  }
  previewExiting(tab) { tab.previewing = false; tab.pview = null; tab.pvFlip = true; }
  previewBack(tab) {
    const b = tab.pvBase;
    if (!b) return;
    this.cover('Pexit');
    /* R3-5: the Exit click itself writes nothing either. */
    this.check('P nothing written', tab.writes === b.writes, () => `${tab.label} wrote to Firestore ${tab.writes - b.writes} time(s) during a preview or on Exit preview (nothing may be written)`, `pvwx|${tab.id}`);
    tab.pvWatch = true;   /* F4-4: and nothing until the teacher's next click */
    this.check('P preview', tab.dom.byId.get('lq-stage').innerHTML === b.stage, () => `${tab.label}: after Exit preview the stage does not show what it showed before the preview (the real board): ${stripTags(tab.dom.byId.get('lq-stage').innerHTML).slice(0, 160)}`);
    const box = tab.dom.byId.get('lq-limit'), lim = this.intended.limit ? String(this.intended.limit) : '';
    this.check('P preview', !!box && box.value === lim, () => `${tab.label}: after Exit preview the Time box shows "${box && box.value}", the teacher last set ${JSON.stringify(lim)}`);
    this.check('P preview', stripView(tab) === b.strip, () => `${tab.label}: after Exit preview the control strip is not the one it showed before the preview: ${stripView(tab).slice(0, 200)} / before: ${b.strip.slice(0, 200)}`);
  }
  /* The preview's "doc" is the console's own copy (lqTSession): read as data, the way a real game's doc is read from the
     fake Firestore, and fed to the same model hooks. Never called, only read. */
  readSession(tab) {
    try { return vm.runInContext('JSON.stringify(typeof lqTSession === "undefined" ? null : lqTSession)', tab.ctx); } catch (e) { return null; }
  }
  syncPreview(tab) {
    if (!tab.previewing) return;
    const raw = this.readSession(tab);
    if (raw === tab.pvRaw) return;
    const prev = tab.pvDoc, doc = raw ? JSON.parse(raw) : null;
    tab.pvRaw = raw; tab.pvDoc = doc;
    if (!doc) { tab.pview = null; return; }
    if (doc.state === 'question' && tab.clockStart[`${doc.sessionId}|${doc.qIndex}`] === undefined) tab.clockStart[`${doc.sessionId}|${doc.qIndex}`] = this.loop.now;
    tab.pview = { sessionId: doc.sessionId, state: doc.state, qIndex: doc.qIndex, target: doc.target, limitSec: doc.limitSec };
    if (doc.state === 'reveal' && prev && prev.state === 'question' && !this.pendingReveal) this.autoRevealIssued(tab, doc.qIndex);
    this.onCommitCurrent(doc, prev, tab, true);
  }
  checkPreview(tab) {
    const strip = tab.dom.byId.get('lq-controls');
    if (!strip) return;
    const dirty = tab.dirty.has('lq-controls');
    if (dirty || tab.pvFlip) {
      tab.pvFlip = false;
      const exit = strip.buttons.some(b => b.onclick === 'lqTeacherExitPreview()');
      const hint = textsOf(strip.innerHTML).join('\n').includes(PREVIEW_STRIP_HINT.join('\n'));
      this.check('P preview', exit === tab.previewing && hint === tab.previewing, () => `${tab.label}: the strip ${exit || hint ? 'shows' : 'does not show'} the preview controls (Exit preview${exit ? ' on' : ' off'}, the "only this screen" hint${hint ? ' on' : ' off'}), but the console ${tab.previewing ? 'is previewing' : `is not previewing${tab.previewEndedByReal ? ' (a real game went live: the preview must end at once)' : ''}`}`, `pv|${tab.id}|${tab.previewing}|${tab.shown && tab.shown.sessionId}`);
      if (dirty && !tab.previewing && realLive(tab.shown)) {
        this.cover('Pnone');
        this.check('P preview', !strip.buttons.some(b => b.onclick === 'lqTeacherPreview()'), () => `${tab.label}: the strip painted during a live real game (${tab.shown.state}) offers Preview`, `pvoffer|${tab.id}|${tab.shown.sessionId}`);
      }
    }
    if (tab.pvWatch && tab.pvBase) this.check('P nothing written', tab.writes === tab.pvBase.writes, () => `${tab.label} wrote to Firestore ${tab.writes - tab.pvBase.writes} time(s) after Exit preview, before the teacher's next click (nothing may be written)`, `pvwa|${tab.id}`);
    if (!tab.previewing || !tab.pvBase) return;
    const b = tab.pvBase;
    this.cover('Pwrites');
    this.check('P nothing written', tab.writes === b.writes, () => `${tab.label} wrote to Firestore ${tab.writes - b.writes} time(s) during a preview (nothing may be written)`, `pvw|${tab.id}`);
    if (this.fs.stats.writes - tab.writes !== b.others) return;
    this.check('P nothing written', JSON.stringify(this.fs.cur) === b.cur && JSON.stringify([...this.fs.ans]) === b.ans, () => `the session doc or an answer doc changed during a preview (no other console wrote): state ${this.fs.cur && this.fs.cur.state}, sessionId ${this.fs.cur && this.fs.cur.sessionId}`, `pvdoc|${tab.id}`);
    for (const t of this.tabs) {
      const was = b.students.get(t.id);
      if (!was && t.alive && t.kind === 'student' && t.born >= b.at) {
        /* a student who signs in or reloads during the preview: the real (old, ended) game only, no invite */
        this.cover('Pstudents');
        const html = t.dom.byId.get('live-quiz-body').innerHTML;
        this.check('P no student sees it', !/lq-choice|lq-board|lq-qnum|lq-locked|lq-lobby/.test(html) && t.dom.createdCount() === 0, () => `${t.label} (signed in during the preview) sees a game or an invite: ${stripTags(html).slice(0, 100)}`, `pvn|${t.id}`);
        continue;
      }
      if (!was || !t.alive) continue;
      this.cover('Pstudents');
      const html = t.dom.byId.get('live-quiz-body').innerHTML;
      this.check('P no student sees it', html === was.html && t.dom.createdCount() === was.created && (t.docDeliveries || 0) === was.got, () => `${t.label}: something reached this student during the teacher's preview (${(t.docDeliveries || 0) - was.got} snapshot(s), ${t.dom.createdCount() - was.created} new element(s) such as an invite; screen now: ${stripTags(html).slice(0, 100)})`, `pvs|${t.id}`);
    }
  }
  checkTeacher(tab) {
    if (tab === this.teacher) this.syncPreview(tab);
    this.checkPreview(tab);
    const d = tab.dirty, view = tab.pview || tab.shown;
    if (!view || view.sessionId !== this.model.sid || !this.model.quiz) return;
    const stage = tab.dom.byId.get('lq-stage'), strip = tab.dom.byId.get('lq-controls');
    if (d.has('lq-stage') || tab.forceStage) { tab.forceStage = false; this.checkStage(tab, stage.innerHTML, view); }
    if (d.has('lq-controls') && view.state === 'question') this.checkStrip(tab, strip.innerHTML, view);
    if ((d.has('lq-stage') || d.has('lq-st-timer')) && view.state === 'question' && view.limitSec > 0) {
      const el = tab.dom.byId.get('lq-st-timer');
      this.stats.timerChecks++;
      if (!this.check('R12 countdown', !!el, () => `the stage shows no countdown on timed question ${view.qIndex + 1}`)) return;
      const want = modelTimerText(view.limitSec, this.loop.now - tab.clockStart[`${view.sessionId}|${view.qIndex}`], 'en', this.tIn);
      this.cover('R12stage');
      this.check('R12 countdown', el.textContent === want, () => `the stage countdown reads "${el.textContent}" right after a repaint, the time left is "${want}" (question ${view.qIndex + 1}; reported once per question)`, `stimer|${view.qIndex}`);
    }
  }
  stageTexts(html) {
    let h = html.replace(/<div class="lq-st-timer"[^>]*>[^<]*<\/div>/g, '');
    const svgs = [...h.matchAll(/<svg\b[\s\S]*?<\/svg>/g)].map(m => m[0]);
    h = h.replace(/<svg\b[\s\S]*?<\/svg>/g, '');
    return { texts: h.split(/<[^>]*>/).map(x => unesc(x).trim()).filter(Boolean), svgs };
  }
  roster(tab) {
    const ids = new Set();
    for (const [uid, d] of tab.delivered) if (d.sessionId === this.model.sid && uid) ids.add(uid);
    for (const uid of Object.keys(this.model.scores)) ids.add(uid);
    return ids;
  }
  answersIn(tab, q) { let n = 0; for (const d of tab.delivered.values()) if (d.sessionId === this.model.sid && d.qIndex === q) n++; return n; }
  boxTokens(view) {
    if (this.model.quiz.kind !== 'pcname' || !view.target) return [];
    const name = modelCorrect(this.model.quiz, view.target, null).correct;
    return [name, name.slice(0, -1)];
  }
  answerTokens(view) {
    const quiz = this.model.quiz;
    if (quiz.kind === 'mc' || !view.target) return [];
    const c = modelCorrect(quiz, view.target, null);
    return quiz.kind === 'pcname' ? [c.correct] : c.ids;
  }
  checkStage(tab, html, view) {
    const tIn = this.tIn, quiz = this.model.quiz;
    this.stats.stageChecks++;
    const { texts, svgs } = this.stageTexts(html);
    const hidden = !!tab.hideNames;
    if (hidden) this.checkNoNames(tab, html, view);
    if (view.state === 'lobby') {
      const r = this.roster(tab);
      const names = hidden ? [] : [...r].map(u => this.model.names[u] || '').sort((a, b) => a.localeCompare(b)).map(n => n || '—');
      const want = [tIn(quiz.titleKey, 'en'), tIn('lq.stageJoin', 'en'), String(r.size), tIn('lq.stageInGame', 'en'), ...names];
      this.cover('R11lobby');
      this.check('R11 stage', JSON.stringify(texts) === JSON.stringify(want), () => `the lobby stage shows ${JSON.stringify(texts).slice(0, 300)}, want ${JSON.stringify(want).slice(0, 300)}`, 'lobby');
      return;
    }
    if (view.state === 'question') {
      const q = view.qIndex, n = this.answersIn(tab, q), m = this.roster(tab).size;
      const want = [this.model.qLabel('en', q), this.model.stagePrompt(view.target), m ? `${n} / ${m}` : String(n), tIn('lq.stageAnswered', 'en')];
      if (texts[2] !== tab.lastCount) { tab.lastCount = texts[2]; this.vlog(`${tab.label}'s stage: question ${q + 1}, ${texts[2]} answered`); }
      this.check('R11 stage', JSON.stringify(texts) === JSON.stringify(want), () => `${tab.label}, question ${q + 1}: the stage shows ${JSON.stringify(texts)}, want only ${JSON.stringify(want)}`, `stage|${tab.id}|${view.sessionId}|${q}`);
      const wantSvgs = quiz.kind === 'pcname' && view.target ? 1 : 0;
      this.cover('R11q');
      this.check('R11 stage', svgs.length === wantSvgs, () => `question ${q + 1}: the stage draws ${svgs.length} picture(s) before Reveal, want ${wantSvgs}${wantSvgs ? ' (the chord box)' : ' (no board)'}`, `svg|${q}`);
      const outside = dropSvg(html);
      const doc = tab.dom.document;
      this.check('R11 no answer on stage', doc.title === 'Guitar Class' && !doc.body.classList.list().length, () => `question ${q + 1}: the console page title / body class changed before Reveal: "${doc.title}" [${doc.body.classList.list().join(' ')}]`, `title|${q}`);
      const extra = attrsOf(outside).filter(a => !STAGE_Q_ATTRS.has(a));
      for (const a of attrsOf(outside)) dump('stage attr', a);
      this.check('R11 no answer on stage', !extra.length, () => `question ${q + 1}: the stage carries attributes no stage has today (an answer can hide there): ${extra.slice(0, 4).join(' | ')}`, `attr|${q}`);
      const seq = parseTags(outside).map(t => `${t.name}.${t.cls}`).join(' > ');
      dump(`stage seq ${quiz.kind}${view.limitSec > 0 ? ' timed' : ''}`, seq);
      const okSeq = (STAGE_Q_SEQ[`${quiz.kind}${view.limitSec > 0 ? ' timed' : ''}`] || []).includes(seq);
      this.check('R11 no answer on stage', okSeq, () => `question ${q + 1}: the stage's elements are not today's (count / order): ${seq}`, `seq|${q}`);
      const tokens = this.answerTokens(view);
      for (const svg of svgs) { const bad = boxProblems(svg, this.boxTokens(view)); this.check('R11 no answer on stage', !bad.length, () => `question ${q + 1}: the chord box on the stage says more than strings and frets: ${bad.slice(0, 3).join(' | ')}`, `box|${q}`); }
      for (const tok of tokens) {
        const at = html.search(tokenRe(tok));
        this.check('R11 no answer on stage', at < 0, () => `question ${q + 1}: the stage holds the answer "${tok}" before Reveal: …${html.slice(Math.max(0, at - 60), at + 30)}…`, `tok|${q}`);
      }
      if (/\bfg-(good|pick|count|bad)\b/.test(html)) this.flag('R11 no answer on stage', `question ${q + 1}: the stage marks a fret before Reveal`);
      return;
    }
    if (view.state === 'reveal' && this.model.q[view.qIndex] && this.model.reveals[view.qIndex]) {
      const ans = /<div class="lq-st-answer">([\s\S]*?)<\/div>/.exec(html);
      const want = this.model.stageAnswer(view.qIndex);
      this.cover('R11reveal');
      this.check('R11 reveal names the answer', want != null && ans && unesc(ans[1]) === want, () => `question ${view.qIndex + 1}: the Reveal stage's answer line reads ${ans ? JSON.stringify(unesc(ans[1])) : 'nothing'}, want ${JSON.stringify(want)}`);
      this.checkBoard(html, 5, `question ${view.qIndex + 1}'s Reveal stage`, hidden);
      this.checkCountOnly(html, view.qIndex, 'the stage', 'en', true);
    }
    if (view.state === 'ended') this.checkBoard(html, 10, 'the final stage', hidden);
  }
  /* H (Jonathan, 2026-11-13): with "Hide names on the projector" ticked on this console, the stage holds no player's name
     and no uid anywhere in its HTML (text or attribute; not hidden with CSS), in every state. Read from the tool's own
     record of the clicks (tab.hideNames), never from the vm. */
  checkNoNames(tab, html, view) {
    const key = view.state === 'lobby' ? 'Hlobby' : view.state === 'question' ? 'Hq' : view.state === 'reveal' ? 'Hreveal' : 'Hend';
    this.cover(key);
    if (tab.hideJustClicked) { this.cover('Htoggle'); tab.hideJustClicked = false; }
    for (const tok of [...this.students.map(s => s.name), ...this.students.map(s => s.uid), ...this.oldNames]) {
      const at = html.search(tokenRe(tok));
      this.check('H names hidden', at < 0, () => `${tab.label}, ${view.state}${view.state === 'lobby' ? '' : ` (question ${view.qIndex + 1})`}: "Hide names on the projector" is ticked but the stage holds "${tok}": …${html.slice(Math.max(0, at - 60), at + 30)}…`, `hn|${tab.id}|${view.state}|${view.qIndex}|${tok}`);
    }
  }
  checkBoard(html, k, where, hidden) {
    const ol = /<ol class="lq-lb lq-lb-stage">([\s\S]*?)<\/ol>/.exec(html);
    if (hidden) {
      /* Names hidden: each row is its place and "N points", nothing else, in the rules' points order. */
      const rows = ol ? [...ol[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map(m => textsOf(m[1]).join(' | ')) : [];
      const want = modelRank(this.model.scores, this.model.names).slice(0, k).map(r => `${r.rank} | ${this.tIn('lq.points', 'en', { n: r.pts })}`);
      this.cover('R11lb');
      this.check('H names hidden', JSON.stringify(rows) === JSON.stringify(want), () => `${where}, names hidden: leaderboard ${JSON.stringify(rows)}, want ${JSON.stringify(want)}`);
      return;
    }
    const rows = ol ? [...ol[1].matchAll(/<span class="lq-lb-rank">([^<]*)<\/span><span class="lq-lb-name">([^<]*)<\/span><span class="lq-lb-pts">([^<]*)<\/span>/g)].map(m => `${m[1]}. ${unesc(m[2])} ${m[3]}`) : [];
    const want = modelRank(this.model.scores, this.model.names).slice(0, k).map(r => `${r.rank}. ${r.name || '—'} ${r.pts}`);
    this.cover('R11lb');
    /* With a known student's points off, the board must still be in its own points order, and equal to the rules once
       that student's row is out (ranks aside). */
    const boardWithout = name => {
      const parse = r => { const m = /^(\d+)\. (.*) (\d+)$/.exec(r); return m ? { rank: +m[1], name: m[2], pts: +m[3] } : { rank: 0, name: r, pts: 0 }; };
      const h = rows.map(parse), wv = want.map(parse);
      const ordered = h.every((r, i) => !i || h[i - 1].pts > r.pts || (h[i - 1].pts === r.pts && h[i - 1].name.localeCompare(r.name) <= 0)) && h.every(r => r.rank === 1 + h.filter(x => x.pts > r.pts).length);
      const strip = xs => JSON.stringify(xs.filter(r => r.name !== name).map(r => `${r.name} ${r.pts}`));
      return ordered && strip(h) === strip(wv);
    };
    this.check('R11 leaderboard', JSON.stringify(rows) === JSON.stringify(want), () => `${where}: leaderboard ${JSON.stringify(rows)}, want ${JSON.stringify(want)}`, null, { equalWithout: boardWithout });
  }
  checkStrip(tab, html, view) {
    const quiz = this.model.quiz, tIn = this.tIn;
    const texts = textsOf(html);
    for (const a of attrsOf(html)) dump(`strip attr ${quiz.kind}`, a);
    const extra = attrsOf(html).filter(a => !(STRIP_Q_ATTRS[quiz.kind] || new Set()).has(a) && !(tab.previewing && PREVIEW_STRIP_ATTRS.has(a)));
    this.check('R11 strip', !extra.length, () => `question ${view.qIndex + 1}: the control strip (on the projector) carries attributes it does not have today (an answer can hide there): ${extra.slice(0, 4).join(' | ')}`, `stripattr|${view.qIndex}`);
    const want = quiz.kind === 'mc'
      ? ['Mark the correct answer:', ...quiz.choices.map(c => tIn(c.key, 'en')), 'End game', HIDE_NAMES_LABEL, 'Full screen', quiz.teacherHint]
      : ['Reveal', 'End game', HIDE_NAMES_LABEL, 'Full screen', quiz.teacherHint];
    if (tab.previewing) want.splice(want.indexOf('Full screen') + 1, 0, ...PREVIEW_STRIP_BUTTONS), want.push(...PREVIEW_STRIP_HINT);
    this.cover('R11strip');
    this.check('R11 strip', JSON.stringify(texts) === JSON.stringify(want), () => `question ${view.qIndex + 1}: the control strip (on the projector) shows ${JSON.stringify(texts)}, want ${JSON.stringify(want)}`, `strip|${view.qIndex}`);
    for (const tok of this.answerTokens(view)) this.check('R11 strip', !html.includes(tok), () => `question ${view.qIndex + 1}: the control strip holds the answer "${tok}" before Reveal`, `striptok|${view.qIndex}`);
    const hb = parseTags(html).find(t => t.name === 'input' && t.attrs.some(([k, v]) => k === 'id' && v === 'lq-hidenames'));
    this.check('H hide names', !!hb && hb.attrs.some(([k]) => k === 'checked') === !!tab.hideNames, () => `question ${view.qIndex + 1}: the strip's "Hide names on the projector" box is ${hb ? (hb.attrs.some(([k]) => k === 'checked') ? 'ticked' : 'not ticked') : 'missing'}, the teacher left it ${tab.hideNames ? 'ticked' : 'unticked'}`, `hbox|${tab.id}|${view.qIndex}`);
  }
  /* R1-5 / R11: a student's screen before Reveal. The answer buttons differ only in label, handler argument and (mc)
     the colour the bank gives that choice; nothing else on the screen names the answer. */
  checkStudentScreen(tab) {
    const view = tab.shown, quiz = this.model.quiz, s = tab.student, q = view.qIndex;
    const body = tab.dom.byId.get('live-quiz-body'), html = body.innerHTML;
    const locked = html.includes('lq-locked');
    const where = `${tab.label}, question ${q + 1}${locked ? ' (Locked in)' : ''}`;
    const offers = !locked || (!!quiz.changeAnswer && quiz.kind === 'pcname');
    const buttons = !offers ? [] : [...html.matchAll(/<button\b([^>]*)>([\s\S]*?)<\/button>/g)].map(m => ({ tag: parseTags(`<button${m[1]}>`)[0], inner: m[2] }))
      .filter(b => b.tag && b.tag.cls.split(/\s+/).includes('lq-choice'));
    const want = quiz.kind === 'mc' ? quiz.choices.map(c => ({ label: this.tIn(c.key, s.lang), arg: `lqAnswer('${c.id}')`, style: `--lq-c:${c.color}`, key: c.key }))
      : quiz.kind === 'pcname' ? PC_NAMES.map((n, i) => ({ label: n, arg: `lqAnswerPcName(${i})`, style: null, key: null })) : [];
    /* Each button reduced to what may not differ: its attributes with onclick / style set aside once checked, and its
       inner HTML with the label and the label's i18n key set aside once checked (R2-7). */
    const canon = buttons.map((b, i) => {
      const w = want[i] || {};
      const a = Object.fromEntries(b.tag.attrs);
      const ok = a.onclick === w.arg && (w.style == null || a.style === w.style) && stripTags(b.inner) === w.label;
      let inner = b.inner.split(escHtml(w.label || '\u0000')).join('#LABEL#');
      if (w.key) inner = inner.split(`data-i18n="${w.key}"`).join('data-i18n=#KEY#');
      return `${ok ? '' : 'WRONG '}${b.tag.attrs.filter(([k]) => k !== 'onclick' && k !== 'style').map(([k, v]) => `${k}="${v}"`).join(' ')} | ${quiz.kind === 'pcname' ? `style="${a.style}"` : ''} | ${inner}`;
    });
    if (want.length && offers) {
      this.cover('R11student');
      this.check('R11 student screen', buttons.length === want.length && canon.every(c => c === canon[0] && !c.startsWith('WRONG')), () => `${where}: the ${buttons.length} answer buttons are not ${want.length} buttons alike apart from label and handler before Reveal: ${[...new Set(canon)].slice(0, 3).join(' || ')}`, `btn|${tab.id}|${q}`);
    }
    /* F4-3: the whole text of the screen, in the student's language, in order: question label, prompt, countdown (its
       value pinned by R12), then the tap hint / the answer buttons' labels, or, locked, "Locked in", this student's OWN
       pick (F4-2: label and colour derived from the pick this tab made, or the one read back after a reload), the wait
       line and, only after a refused write, the save-failed line. */
    const key = `${view.sessionId}|${q}`, tI = (k, p) => this.tIn(k, s.lang, p);
    const pick = (tab.picks && tab.picks[key]) || ((this.model.answerOf(s.uid, q) || {}).choice) || null;
    const pickLook = c => {
      if (quiz.kind === 'mc') { const ch = quiz.choices.find(x => x.id === c); return ch ? [tI(ch.key), ch.color] : [c, '#555']; }
      if (quiz.kind === 'pcname') return [c, PC_NAME_COLOR];
      const [st, f] = String(c).split(':'), string = tI(STRING_KEY[st] || 'fret.stringLowE');
      return [Number(f) === 0 ? tI('lq.pickedOpen', { string }) : tI('lq.pickedFret', { n: Number(f), string }), STRING_COLOR[st] || '#555'];
    };
    const exp = [tI(quiz.titleKey), this.model.qLabel(s.lang, q)];
    if (quiz.kind !== 'mc' && !view.target) exp.push(tI('lq.noTapYet'));
    else {
      exp.push(quiz.kind === 'fret' ? tI(quiz.promptKey, quiz.power ? { chord: view.target.note + '5', string: tI(STRING_KEY[view.target.string]) } : { note: view.target.note, string: tI(STRING_KEY[view.target.string]) }) : tI(quiz.promptKey));
      if (view.limitSec > 0) exp.push('#COUNTDOWN#');
      if (locked) { exp.push(tI(quiz.changeAnswer ? 'lq.lockedChange' : 'lq.locked'), pick ? pickLook(pick)[0] : '(no pick of this student)', tI('lq.lockedWait')); if (tab.refused && tab.refused.has(key)) exp.push(tI('lq.saveFailed')); if (offers) exp.push(...PC_NAMES); }
      else if (quiz.kind === 'fret') exp.push(tI(quiz.changeAnswer ? 'lq.tapHintChange' : 'lq.tapHint'));
      else if (quiz.kind === 'mc') exp.push(...quiz.choices.map(c => tI(c.key)));
      else exp.push(...PC_NAMES);
    }
    const gotTexts = textsOf(dropSvg(html)), timeUp = tI('lq.timeUp');
    const same = gotTexts.length === exp.length && exp.every((x, i) => x === '#COUNTDOWN#' ? (/^\d+(\.\d)?$/.test(gotTexts[i]) || gotTexts[i] === timeUp) : gotTexts[i] === x);
    this.cover('R11stext');
    this.check('R11 student screen', same, () => `${where}: the screen reads ${JSON.stringify(gotTexts)}, want exactly ${JSON.stringify(exp)}`, `stext|${tab.id}|${q}|${locked}`);
    let pickStyle = null;
    if (locked) {
      const m = /<div class="lq-locked-pick" style="([^"]*)">/.exec(html);
      pickStyle = pick ? `background:${pickLook(pick)[1]}` : null;
      this.check('R11 student screen', !!m && m[1] === pickStyle, () => `${where}: the Locked-in pick is coloured "${m && m[1]}", want "${pickStyle}" (this student's own pick ${pick})`, `spick|${tab.id}|${q}`);
    }
    const rest = html.replace(/<button\b[^>]*>[\s\S]*?<\/button>/g, '');
    for (const svg of rest.match(/<svg\b[\s\S]*?<\/svg>/g) || []) { const bad = boxProblems(svg, this.boxTokens(view)); this.check('R11 student screen', !bad.length, () => `${where}: the chord box says more than strings and frets: ${bad.slice(0, 3).join(' | ')}`, `sbox|${tab.id}|${q}`); }
    const outside = dropSvg(rest);
    const sdoc = tab.dom.document;
    this.check('R11 student screen', sdoc.title === 'Guitar Class' && !sdoc.body.classList.list().length, () => `${where}: the page title / body class changed before Reveal: "${sdoc.title}" [${sdoc.body.classList.list().join(' ')}]`, `stitle|${tab.id}|${q}`);
    /* data-i18n-params must be exactly the question number and (fret quizzes) the prompt's note and string. */
    const params = [this.model.qParams(q)];
    if (quiz.kind === 'fret' && view.target) params.push(quiz.power ? { chord: view.target.note + '5', string: this.tIn(STRING_KEY[view.target.string], s.lang) } : { note: view.target.note, string: this.tIn(STRING_KEY[view.target.string], s.lang) });
    const okParams = new Set(params.map(p => JSON.stringify(p)));
    const attrs = attrsOf(outside).map(a => { const m = /^(\S+) data-i18n-params="(.*)"$/.exec(a); return m && okParams.has(m[2]) ? `${m[1]} data-i18n-params=OK` : (pickStyle && a === `div style="${pickStyle}"`) ? 'div style=PICK' : a; });
    for (const a of attrs) dump(`student attr ${quiz.kind}${locked ? ' locked' : ''}`, a);
    const extra = attrs.filter(a => !(locked ? STUDENT_LOCKED_ATTRS : STUDENT_Q_ATTRS)[quiz.kind].has(a));
    this.cover('R11student');
    this.check('R11 student screen', !extra.length, () => `${where}: the screen carries attributes it does not have today (an answer can hide there): ${extra.slice(0, 4).join(' | ')}`, `sattr|${tab.id}|${q}`);
    /* the student's own pick, when it IS the right answer, may name it: only that exact pinned element is taken out */
    const ownPick = locked && pick ? `<div class="lq-locked-pick" style="${pickStyle}">${escHtml(pickLook(pick)[0])}</div>` : null;
    const scan = ownPick ? outside.split(ownPick).join('') : outside;
    for (const tok of this.answerTokens(view)) { const at = scan.search(tokenRe(tok)); this.check('R11 student screen', at < 0, () => `${where}: the screen names the answer "${tok}" before Reveal: …${scan.slice(Math.max(0, at - 60), at + 30)}…`, `stok|${tab.id}|${q}`); }
  }
  /* Item 5: what else a student can read before Reveal: elements live-quiz.js creates outside the quiz screen (the
     invite, the Journey banner), and the browser console (devtools). Token-checked for the open question's answer. */
  checkSideChannels(tab) {
    const v = tab.shown, live = this.model.sid && v && v.sessionId === this.model.sid && v.state === 'question' && this.model.q[v.qIndex];
    const fresh = tab.logs.slice(tab.logsSeen); tab.logsSeen = tab.logs.length;
    if (!live) return;
    const toks = this.answerTokens(v);
    if (!toks.length) return;
    const created = tab.dom.createdList().map(e => `${e.className || ''} ${e.textContent || ''} ${e.innerHTML || ''} ${JSON.stringify(e._attrs || {})}`).join('\n');
    for (const tok of toks) {
      if (created) this.check('R11 student screen', !tokenRe(tok).test(created), () => `${tab.label}: an element live-quiz.js created (invite / banner) names the answer "${tok}" before Reveal`, `side|${tab.id}|${v.qIndex}`);
      for (const l of fresh) this.check('R11 student screen', !tokenRe(tok).test(l), () => `${tab.label}: the browser console (devtools) shows the answer "${tok}" before Reveal: ${l.slice(0, 160)}`, `log|${tab.id}|${v.qIndex}`);
    }
  }
  checkDialog(tab, m) {
    const v = tab.pview || tab.shown;
    if (!v || v.state !== 'question' || !this.model.q[v.qIndex]) return;
    for (const tok of this.answerTokens(v)) this.check('R11 no answer on stage', !tokenRe(tok).test(m), () => `${tab.label}: a dialog on the projector names the answer "${tok}" before Reveal: ${m.slice(0, 160)}`);
  }
  /* Item 5: browser storage a student can read before Reveal, checked when a Reveal commits: only the keys the quiz
     writes today (localStorage: none of its own; sessionStorage: lq-q-opened) and no answer in any value. */
  checkStorage(q) {
    const toks = this.answerTokens({ target: this.model.q[q].target });
    for (const s of this.students) {
      const maps = [['localStorage', s.storage.local, STUDENT_LOCAL_KEYS], ...s.slots.map(sl => ['sessionStorage', sl.session, STUDENT_SESSION_KEYS])];
      for (const [nm, m, ok] of maps) for (const [k, val] of m) {
        this.cover('R11storage');
        this.check('R11 no answer in storage', ok.has(k) && !toks.some(t => tokenRe(t).test(String(val))), () => `${s.name}'s ${nm} holds "${k}" = ${String(val).slice(0, 120)} before question ${q + 1}'s Reveal (keys allowed: ${[...ok].join(', ') || 'none'}; no answer in a value)`, `stor|${s.uid}|${nm}|${k}|${this.model.sid}`);
      }
    }
  }
  checkStudent(tab) {
    const view = tab.shown, s = tab.student;
    if (view && view.sessionId === this.model.sid && view.state === 'question' && tab.dirty.has('live-quiz-body') && this.model.q[view.qIndex]) this.checkStudentScreen(tab);
    if (!view || view.sessionId !== this.model.sid || view.state !== 'question' || !(view.limitSec > 0)) return;
    const q = view.qIndex, start = this.model.clock(s.uid, tab.id, q);
    if (start === undefined) return;
    const body = tab.dom.byId.get('live-quiz-body');
    if (tab.dirty.has('live-quiz-body') || tab.dirty.has('lq-timer')) {
      const el = tab.dom.byId.get('lq-timer');
      this.stats.timerChecks++;
      const want = modelTimerText(view.limitSec, this.loop.now - start, s.lang, this.tIn);
      this.cover('R12student');
      this.check('R12 countdown', !!el && el.textContent === want, () => `${tab.label}, question ${q + 1}: the countdown reads "${el ? el.textContent : '(none)'}" right after a repaint; this student's time left is "${want}" (reported once per tab and question)`, `timer|${tab.id}|${q}`);
    }
    /* R12 (R2-8): a screen that offered something to tap before time-up offers nothing once this student's time is out:
       every .lq-choice disabled, or the fret board marked lq-board-off. Judged once per tab and question, and counted
       only where there was something live to switch off. */
    const tick = view.limitSec < 10 ? 100 : 250, deadline = start + view.limitSec * 1000;
    const liveBtns = body.buttons.filter(b => b.cls.split(/\s+/).includes('lq-choice') && !b.disabled).length;
    const board = tab.dom.byId.get('lq-board'), boardLive = !!board && (!!this.model.quiz.changeAnswer || !body.innerHTML.includes('lq-locked')) && !board.classList.contains('lq-board-off');
    tab.liveBefore = tab.liveBefore || {};
    if (this.loop.now < deadline && (liveBtns || boardLive)) tab.liveBefore[q] = true;
    if ((tab.liveBefore[q] || liveBtns || boardLive) && this.loop.now >= deadline + tick + (s.busy ? MAX_LATE_BUSY : MAX_LATE) + 1 && this.once(`off|${tab.id}|${q}`)) {
      const still = liveBtns ? `${liveBtns} choice buttons are still enabled` : boardLive ? 'the fret board is still live (no lq-board-off)' : '';
      if (tab.liveBefore[q]) this.cover('R12off');
      this.check('R12 time up', !still, `${tab.label}, question ${q + 1}: ${still} ${this.loop.now - deadline} ms after this student's time ran out`);
    }
  }
  /* R3-3, accepted (Jonathan 2026-11-12, "let's not worry about it"): a Reveal that comes before a slow or late
     student's own time is up. Counted, never failed, so a change in the grace shows: in-time taps (R3/R4) refused or
     scored "too late" because the Reveal came first, by who revealed; late joiners whose own clock it cut short. */
  countCutoffs(q) {
    const how = this.revealHow && this.revealHow[`${this.model.sid}|${q}`], Q = this.model.q[q];
    if (!how || !Q) return;
    const A = this.acc[how.kind];
    for (const s of this.students) {
      const a = this.model.answerOf(s.uid, q);
      if (!a || a.state === 'rogue') continue;
      A.n++;
      if (a.state === 'rejected') A.refused++;
      else if (this.model.verdict(s.uid, q).kind === 'late') A.late++;
    }
    const open = this.driver.clockStart[`${this.model.sid}|${q}`];
    if (!(Q.limit > 0) || open === undefined) return;
    for (const s of this.students) {
      const f = this.model.first.get(`${s.uid}|${q}`), born = Math.min(...s.tabs.filter(t => t.kind === 'student').map(t => t.born));
      if (f === undefined || born <= open) continue;
      this.acc.join.n++;
      if (f + Q.limit * 1000 > how.t) { this.acc.join.cut++; if (how.kind === 'auto') this.acc.join.auto++; }
    }
  }
  /* T (Jonathan, 2026-11-13: "set the total question prior to starting game"): the Questions box at Start is the
     game's length. After the Reveal of the last one the strip offers "Final scores" (End) and no way to open another
     question; before that, or with no number set, it offers the next question as before. */
  checkTotalStrip(q) {
    const tab = this.driver, v = tab.pview || tab.shown, total = this.intended.total || 0;
    if (!v || v.state !== 'reveal' || v.qIndex !== q) return;
    const btns = this.strip(tab).buttons, opener = btns.filter(b => /^lqTeacher(Next|OpenFret|OpenPcName)\(/.test(b.onclick));
    const fin = btns.find(b => b.onclick === 'lqTeacherEnd()');
    if (total > 0 && q + 1 >= total) {
      this.cover('Tlast');
      this.check('T total', !opener.length && !!fin && fin.label === 'Final scores', () => `question ${q + 1} of ${total} was the last, but the strip reads: ${btns.map(b => b.label).join(' | ')} (want Final scores and no next question)`);
    } else {
      this.cover('Tmore');
      this.check('T total', opener.length > 0 && !!fin && fin.label === 'End game', () => `question ${q + 1} (${total ? `of ${total}` : 'no number set'}): the strip offers no next question: ${btns.map(b => b.label).join(' | ')}`);
    }
  }
  checkVerdicts(q) {
    this.countCutoffs(q);
    for (const s of this.students) {
      for (const tab of this.liveTabs(s)) {
      if (!tab.shown || tab.shown.state !== 'reveal' || tab.shown.qIndex !== q || tab.gets > 0 || s.tabs.some(t => t.pending > 0)) { this.stats.verdictsSkipped = (this.stats.verdictsSkipped || 0) + 1; continue; }
      const html = tab.dom.byId.get('live-quiz-body').innerHTML;
      const m = /class="lq-verdict lq-v-(yes|no|none)"/.exec(html);
      const got = !m ? 'missing' : m[1] === 'yes' ? (html.includes('data-i18n="lq.correctLate"') ? 'late' : `yes +${(/<span class="lq-plus">\+(\d+)<\/span>/.exec(html) || [])[1]}`) : m[1];
      const v = this.model.verdict(s.uid, q);
      const want = v.kind === 'yes' ? `yes +${v.pts}` : v.kind;
      this.cover('R10' + v.kind);
      if (v.kind === 'late') this.cover('R7late');
      this.check('R10 student verdict', got === want, () => `${tab.label}, question ${q + 1}: the student's screen says ${got}, the rules say ${want}${this.why(s.uid, q)}`);
      this.checkCountOnly(html, q, tab.label, s.lang, false);
      }
    }
  }
  /* C (Jonathan, 2026-11-13: "it shouldn't reveal who got it right/wrong, just the scores"): at the Reveal of a
     countOnly quiz (the two power chord quizzes) neither the stage nor a student's screen shows the spread of picks:
     no tally bars, no tap counts on the stage board; they show "n of m correct" from the model's own tally (m = the
     answers the Reveal counted, n = those on a right id). Every other quiz keeps its bars. */
  checkCountOnly(html, q, where, lang, stage) {
    const quiz = this.model.quiz, exp = this.model.reveals[q];
    if (!exp) return;
    const spread = /class="lq-tally"|class="lq-bar\b|\bfg-count\b/.test(html);
    if (!quiz.countOnly) { this.check('C count only', /class="lq-tally"/.test(html), () => `${where}, question ${q + 1}: the Reveal shows no answer bars (only a countOnly quiz hides them)`, `cbars|${where}|${q}`); return; }
    const total = Object.values(exp.tally).reduce((a, b) => a + b, 0), n = exp.correctIds.reduce((a, id) => a + (exp.tally[id] || 0), 0);
    const want = stage ? `${n} / ${total}` : this.tIn('lq.rightCount', lang, { n, total });
    const texts = textsOf(dropSvg(html));
    this.cover('Ccount');
    this.check('C count only', !spread, () => `${where}, question ${q + 1}: the Reveal of a countOnly quiz shows the spread of picks (tally bars or tap counts)`, `cspread|${where}|${q}`);
    this.check('C count only', texts.includes(want) && (!stage || texts.includes(this.tIn('lq.stageCorrect', 'en'))), () => `${where}, question ${q + 1}: the Reveal does not show the count "${want}": ${JSON.stringify(texts).slice(0, 200)}`, `ccount|${where}|${q}`);
  }
  checkEnd() {
    const rows = modelRank(this.model.scores, this.model.names), total = rows.length;
    for (const s of this.students) {
      for (const tab of this.liveTabs(s)) {
      if (!tab.shown || tab.shown.state !== 'ended' || tab.shown.sessionId !== this.model.sid) continue;
      const html = tab.dom.byId.get('live-quiz-body').innerHTML;
      const me = rows.find(r => r.uid === s.uid);
      const pts = /<div class="lq-final-pts"[^>]*>([^<]*)<\/div>/.exec(html), rank = /<div class="lq-final-rank"[^>]*>([^<]*)<\/div>/.exec(html);
      const got = `${rank ? unesc(rank[1]) : '-'} / ${pts ? unesc(pts[1]) : '-'}`;
      const want = me ? `${this.tIn('lq.rank', s.lang, { n: me.rank, total })} / ${this.tIn('lq.points', s.lang, { n: me.pts })}` : '- / -';
      this.cover('R10end');
      /* Another student's line holds once the known student is out when it matches the doc's own final scores and their
         own points are the rules'. */
      const screenWithout = name => {
        if (s.name === name) return true;
        const docRows = modelRank(Object.fromEntries(Object.entries((this.fs.cur && this.fs.cur.sessionId === this.model.sid && this.fs.cur.scores) || {}).map(([u, v]) => [u, { pts: v.pts }])), this.model.names);
        const d = docRows.find(r => r.uid === s.uid);
        const alt = d ? `${this.tIn('lq.rank', s.lang, { n: d.rank, total: docRows.length })} / ${this.tIn('lq.points', s.lang, { n: d.pts })}` : '- / -';
        return got === alt && (d ? d.pts : null) === (me ? me.pts : null);
      };
      this.check('R10 end screen', got === want, () => `${tab.label}: the end screen says "${got}", want "${want}"`, null, { equalWithout: screenWithout });
      }
    }
  }
  /* R1-4: after Clear the board the doc is 'off', the stage is idle and no student tab shows a game. */
  checkCleared() {
    this.cover('R11clear');
    this.check('R11 cleared', this.fs.cur && this.fs.cur.state === 'off', () => `Clear the board left the doc in state ${JSON.stringify(this.fs.cur && this.fs.cur.state)}, want "off"`);
    const want = [this.tIn('lq.stageIdleTitle', 'en'), this.tIn('lq.stageIdleSub', 'en')];
    for (const t of this.tabs) if (t.alive && t.isTeacher) {
      const { texts } = this.stageTexts(t.dom.byId.get('lq-stage').innerHTML);
      this.check('R11 cleared', JSON.stringify(texts) === JSON.stringify(want), () => `${t.label}: after Clear the board the stage shows ${JSON.stringify(texts).slice(0, 200)}, want ${JSON.stringify(want)}`);
    }
    for (const s of this.students) for (const tab of this.liveTabs(s)) {
      const html = tab.dom.byId.get('live-quiz-body').innerHTML;
      this.check('R11 cleared', html.includes('class="lq-empty"'), () => `${tab.label}: after Clear the board the student's screen still shows a game: ${stripTags(html).slice(0, 120)}`);
    }
  }

  /* the teacher */
  strip(tab) { return (tab || this.driver).dom.byId.get('lq-controls'); }
  async tClick(pred, what, tab) {
    tab = tab || this.driver;
    for (let i = 0; i < 40; i++) {
      const b = this.strip(tab).buttons.find(x => pred(x));
      if (b && !b.disabled) {
        this.vlog(`${tab.label} clicks ${what} [${b.onclick}]`);
        this.progress(`${tab.label}: ${what}`);
        tab.dom.document.activeElement = null;
        tab.pvWatch = false;
        this.run(tab, b.onclick);
        await drain(); this.afterEvent();
        return b.onclick;
      }
      await this.until(this.loop.now + 250);
    }
    this.flag('R13 error', `${tab.label}'s strip never offered ${what} (buttons: ${this.strip(tab).buttons.map(x => x.label).join(' | ')})`);
    return null;
  }
  async tChange(id, value, what, tab) {
    tab = tab || this.driver;
    const el = tab.dom.byId.get(id);
    if (!el || !el.onchangeText) { this.flag('R13 error', `${tab.label}'s strip has no ${id} box (${what})`); return; }
    el.value = value;
    this.vlog(`${tab.label} sets ${what} to ${value}`);
    this.run(tab, `(function(){ ${el.onchangeText} }).call(__this)`, el);
    await drain(); this.afterEvent();
  }
  /* H: the teacher ticks or unticks "Hide names on the projector" on `tab` (the console's own choice; another console is
     another device). The stage must repaint at once: forceStage makes the next check read it right after the click. */
  async tHideNames(on, tab) {
    tab = tab || this.driver;
    const box = parseTags(this.strip(tab).innerHTML).find(t => t.name === 'input' && t.attrs.some(([k, v]) => k === 'id' && v === 'lq-hidenames'));
    const el = tab.dom.byId.get('lq-hidenames');
    if (!box || !el || !el.onchangeText) { this.flag('R13 error', `${tab.label}'s strip has no "Hide names on the projector" box`); return; }
    if (!tab.hideSet) { this.cover('Hdefault'); this.check('H hide names', !box.attrs.some(([k]) => k === 'checked'), () => `${tab.label}: the "Hide names on the projector" box is ticked on a device that never set it (off by default)`); }
    el.checked = on;
    this.vlog(`${tab.label} ${on ? 'ticks' : 'unticks'} "Hide names on the projector"`);
    this.progress(`${tab.label}: hide names ${on ? 'on' : 'off'}`);
    tab.hideNames = on; tab.hideSet = true; tab.forceStage = true; tab.hideJustClicked = on;
    this.run(tab, `(function(){ ${el.onchangeText} }).call(__this)`, el);
    await drain(); this.afterEvent();
  }
  /* The case's hide-names plan: spec.hide[key] is true / false or a list of them, clicked in order at that point. */
  async hideHook(key) {
    const sp = this.spec.hide;
    if (!sp || !(key in sp)) return;
    for (const on of [].concat(sp[key])) { await this.tHideNames(on); await this.until(this.loop.now + 400); }
  }
  async until(t) {
    t = Math.round(t);
    const L = this.loop;
    while (L.h.length && L.h[0].t <= t) {
      const ev = L.pop();
      if (ev.dead || (ev.owner && !ev.owner.alive)) continue;
      L.now = ev.t; L.count++;
      beat(this);
      try { const p = ev.fn(); if (p && typeof p.then === 'function') await p; } catch (e) { this.crash(e); }
      await drain();
      this.afterEvent();
      if (L.count > EVENT_CAP) throw new Hang(`more than ${EVENT_CAP} events in one case`);
    }
    L.now = Math.max(L.now, t);
  }
}

/* ════════════════ the cases ════════════════ */
const QUIZ_ORDER = ['string-id', 'fret-lowE', 'fret-lowE-A', 'fret-all', 'pc-find', 'pc-name'];
const FIRST = ['Avo', 'Brix', 'Cimo', 'Dovi', 'Elka', 'Fazu', 'Gorp', 'Hilu', 'Ivra', 'Jexo', 'Kubo', 'Lumi', 'Mork', 'Nabi', 'Ozzle', 'Pexa', 'Quil', 'Rovo', 'Siba', 'Tumi', 'Ulka', 'Vami', 'Woxi', 'Yabo', 'Zenu', 'Abri', 'Bopo', 'Cazz'];
const LAST = ['Testerson', 'Mockley', 'Fakeworth', 'Sampleton', 'Dummet', 'Placeholt'];
function makeStudent(r, i, opts = {}) {
  const name = opts.name || `${FIRST[i % FIRST.length]} ${LAST[Math.floor(i / FIRST.length) % LAST.length]}`;
  const uid = 'u' + Math.floor(r() * 0xffffffff).toString(16).padStart(8, '0') + i;
  const slow = opts.slow ?? (r() < 0.15);
  const nr = rngFor(SEED, name, uid, 'net');
  const net = opts.net ? { down: () => opts.net.down, up: () => opts.net.up } : slow ? { down: () => between(nr, 1500, 4000), up: () => between(nr, 800, 2500) } : { down: () => between(nr, 40, 450), up: () => between(nr, 30, 350) };
  const local = new Map(); if (opts.lang === 'es' || (opts.lang === undefined && r() < 0.2)) local.set('gc-lang', 'es');
  const busy = opts.busy ?? (r() < 0.15);
  return { name, uid, slow, busy, net, slots: [], lang: local.get('gc-lang') === 'es' ? 'es' : 'en', storage: { local }, tabs: [], plans: [], arrive: 'arrive' in opts ? opts.arrive : between(r, 200, 4500), reloadGap: opts.reloadGap ?? between(r, 800, 2500), rng: rngFor(SEED, uid, 'choices') };
}
function randomSpec(k) {
  const r = rngFor(SEED, 'game', k);
  const quizId = QUIZ_ORDER[k % QUIZ_ORDER.length];
  const speed = r() < 0.6;
  const Q = 4 + Math.floor(r() * 3);
  const fretish = quizId !== 'string-id';
  let L = pick(r, fretish ? [2.5, 5, 10, 20] : [0, 10, 20]);
  const limits = [];
  for (let q = 0; q < Q; q++) { if (q && r() < 0.25) L = pick(r, [0, 2.5, 5, 10, 20]); limits.push(L); }
  const students = [];
  for (let i = 0; i < NSTUD; i++) students.push(makeStudent(r, i));
  const late = students.slice(-2);
  late.forEach((s, j) => { s.lateFor = Math.min(j, Q - 1); s.lateDelay = between(r, 300, 4000); s.arrive = null; });
  students.slice(0, 2).forEach(s => { s.lobbyReload = between(r, 500, 2500); });
  for (const s of students) {
    for (let q = 0; q < Q; q++) {
      const lim = limits[q];
      const p = { answer: r() < 0.93, right: r() < 0.65, r: lim ? between(r, 0.2 * lim * 1000, 1.25 * lim * 1000) : between(r, 800, 14000), double: r() < 0.08 ? between(r, 60, 250) : 0 };
      if (lim && r() < 0.08) { p.answer = true; p.r = lim * 1000 + between(r, 1, 30); }
      if (r() < 0.07) {
        const kinds = lim ? ['midq', 'afterAnswer', 'afterTimeout', 'inReveal'] : ['midq', 'afterAnswer', 'inReveal'];
        p.reload = pick(r, kinds);
        if (p.reload === 'midq') { p.reloadAt = Math.max(100, Math.round(p.r * (0.2 + 0.3 * r()))); p.retap = between(r, 400, 1500); }
        if (p.reload === 'afterAnswer') { p.answer = true; p.r = lim ? between(r, 300, 0.6 * lim * 1000) : between(r, 800, 5000); p.reloadAt = p.r + between(r, 400, 1500); }
        if (p.reload === 'afterTimeout') { p.answer = true; p.r = lim * 1000 + between(r, 200, 900); p.reloadAt = lim * 1000 + between(r, 1200, 3500); p.retap = between(r, 600, 1500); }
        if (p.reload === 'inReveal') p.reloadAt = between(r, 500, 2000);
      }
      s.plans.push(p);
    }
  }
  const teacher = [];
  for (let q = 0; q < Q; q++) {
    const lim = limits[q];
    const early = r() < 0.2;
    teacher.push({ revealAfter: lim ? (early ? between(r, 0.4 * lim * 1000, 0.95 * lim * 1000) : lim * 1000 + between(r, 800, 9000)) : (early ? between(r, 3000, 6000) : between(r, 6000, 18000)), hold: between(r, 7000, 9000), pick: r() });
  }
  return { name: `game-${k}`, quizId, speed, limits, Q, students, teacher, autoReveal: rngFor(SEED, 'game', k, 'auto')() < 0.3 ? false : undefined, endDuringQuestion: r() < 0.15, lobbyMs: between(r, 5000, 8000), teacherNet: { down: () => between(r, 30, 200), up: () => between(r, 30, 200) }, teacherStorage: { local: new Map() } };
}
/* A small class with fixed plans; `who` lists each student's plan per question. */
function namedSpec(name, quizId, speed, limits, who, teacher, extra = {}) {
  const r = rngFor(SEED, name);
  const students = who.map((w, i) => {
    const s = makeStudent(r, i, { slow: !!w.slow, busy: !!w.busy, net: w.net, lang: w.lang || 'en', arrive: 'arrive' in w ? w.arrive : 300 + 150 * i, reloadGap: w.reloadGap ?? 1500 });
    if (w.journeyAt != null) { s.journeyAt = w.journeyAt; s.journeyJoinAfter = w.journeyJoinAfter; }
    if (w.secondTabAt != null) s.secondTabAt = w.secondTabAt;
    if (w.reloadAt != null) s.reloadAtAbs = w.reloadAt;
    s.plans.forEach(p => { if (!p.secondTap && p.secondTap !== 0) delete p.secondTap; });
    s.plans = w.plans.map(p => ({ answer: true, right: true, double: 0, ...p }));
    if (w.lateFor !== undefined) { s.lateFor = w.lateFor; s.lateDelay = w.lateDelay; s.arrive = null; }
    return s;
  });
  return { name, quizId, speed, limits, Q: limits.length, games: extra.games ?? 1, second: extra.second, preview: extra.preview, autoReveal: extra.autoReveal, students, teacher, hide: extra.hide, endDuringQuestion: !!extra.endDuringQuestion, lobbyMs: 6000, teacherNet: { down: () => 60, up: () => 60 }, teacherStorage: { local: new Map() }, note: extra.note };
}
const NAMED = {
  'reload-after-timeout': () => namedSpec('reload-after-timeout', 'string-id', true, [10, 10], [
    { plans: [{ r: 1500 }, { r: 2000 }] },
    { plans: [{ r: 10400, reload: 'afterTimeout', reloadAt: 12000, retap: 1000 }, { r: 3000 }] },
    { plans: [{ r: 8000, right: false }, { r: 4000 }] },
    { plans: [{ answer: false }, { r: 5000 }] }
  ], [{ revealAfter: 18000, hold: 8000, pick: 0.1 }, { revealAfter: 12000, hold: 8000, pick: 0.6 }], { note: 'Brix lets the 10 s run out, reloads at 12 s, and taps in the new tab.' }),
  'reload-after-timeout-fret': () => namedSpec('reload-after-timeout-fret', 'fret-lowE', false, [2.5, 2.5], [
    { plans: [{ r: 1200 }, { r: 1000 }] },
    { plans: [{ r: 2700, reload: 'afterTimeout', reloadAt: 3200, retap: 800 }, { r: 1500 }] },
    { plans: [{ answer: false }, { r: 2000 }] }
  ], [{ revealAfter: 9000, hold: 8000, pick: 0.3 }, { revealAfter: 6000, hold: 8000, pick: 0.7 }], { note: 'a 2.5 s Fretboard tap, flat scoring: Brix reloads after time is up.' }),
  'reload-after-answer': () => namedSpec('reload-after-answer', 'string-id', true, [20, 20], [
    { plans: [{ r: 3000, reload: 'afterAnswer', reloadAt: 3800 }, { r: 2500 }] },
    { plans: [{ r: 2000 }, { r: 2000, reload: 'afterAnswer', reloadAt: 3000 }], slow: true },
    { plans: [{ r: 6000, right: false }, { r: 2500 }] }
  ], [{ revealAfter: 22000, hold: 8000, pick: 0.2 }, { revealAfter: 22000, hold: 8000, pick: 0.9 }]),
  'reload-before-answer': () => namedSpec('reload-before-answer', 'pc-find', true, [10, 10], [
    { plans: [{ r: 6000, reload: 'midq', reloadAt: 2000, retap: 1200 }, { r: 2000 }] },
    { plans: [{ r: 3000 }, { r: 5000, reload: 'midq', reloadAt: 1000, retap: 900 }] },
    { plans: [{ r: 4000 }, { r: 3000, right: false }] }
  ], [{ revealAfter: 13000, hold: 8000, pick: 0.4 }, { revealAfter: 13000, hold: 8000, pick: 0.1 }]),
  'reload-in-reveal': () => namedSpec('reload-in-reveal', 'pc-name', true, [10, 10], [
    { plans: [{ r: 2000, reload: 'inReveal', reloadAt: 1000 }, { r: 2500 }] },
    { plans: [{ r: 3000, right: false, reload: 'inReveal', reloadAt: 600 }, { r: 2000 }], slow: true },
    { plans: [{ answer: false, reload: 'inReveal', reloadAt: 1500 }, { r: 2000 }] }
  ], [{ revealAfter: 12000, hold: 9000, pick: 0.5 }, { revealAfter: 12000, hold: 9000, pick: 0.5 }]),
  'late-arrival': () => namedSpec('late-arrival', 'fret-lowE-A', true, [10, 10], [
    { plans: [{ r: 2000 }, { r: 2000 }] },
    { plans: [{ r: 8000 }, { r: 3000 }], lateFor: 0, lateDelay: 5000 },
    { plans: [{ r: 3000 }, { r: 4000 }], lateFor: 1, lateDelay: 8500 }
  ], [{ revealAfter: 19000, hold: 8000, pick: 0.2 }, { revealAfter: 19000, hold: 8000, pick: 0.8 }], { note: 'Brix arrives 5 s into a 10 s question and gets his own 10 s.' }),
  /* R2-9: fixed network times so it does not depend on the seed. The teacher opens question 1 at C (teacher up/down
     60 ms) and clicks Reveal at T = C + 4500. Brix (up = down = 100 ms) sees it at C + 160, taps at C + 4430 and his
     answer commits at T + 30: after the Reveal read the teacher's screen, before the Reveal write (T + 60) lands, so it is
     accepted and scores nothing ("too late", R7). Cimo's commits at T + 130, after the Reveal write: refused by the rules. */
  'answer-after-teacher-read': () => namedSpec('answer-after-teacher-read', 'string-id', true, [20, 20], [
    { plans: [{ r: 1500 }, { r: 1500 }] },
    { plans: [{ r: 4270 }, { r: 3000 }], net: { up: 100, down: 100 } },
    { plans: [{ r: 4370 }, { r: 3000 }], net: { up: 100, down: 100 } },
    { plans: [{ r: 3000, right: false }, { r: 3000 }] }
  ], [{ revealAfter: 4500, hold: 9000, pick: 0.3 }, { revealAfter: 21000, hold: 9000, pick: 0.6 }], { note: 'the teacher reveals 4.5 s in: one right answer lands between the Reveal read and the Reveal write ("too late"), one after it (refused).' }),
  'speed-no-limit': () => namedSpec('speed-no-limit', 'string-id', true, [0, 0], [
    { plans: [{ r: 5000 }, { r: 25000 }] },
    { plans: [{ r: 15000 }, { r: 5000 }] },
    { plans: [{ r: 25000 }, { r: 15000 }] }
  ], [{ revealAfter: 30000, hold: 8000, pick: 0.3 }, { revealAfter: 30000, hold: 8000, pick: 0.8 }], { note: 'speed scoring with no limit: the slide runs over 20 s (R6): 5 s = 875, 15 s = 625, 25 s = 500.' }),
  'two-tabs-one-student': () => namedSpec('two-tabs-one-student', 'string-id', true, [20, 20], [
    { plans: [{ r: 3000, secondTap: 6000 }, { r: 6000, secondTap: 2000 }], secondTabAt: 900 },
    { plans: [{ r: 4000 }, { r: 3000 }] }
  ], [{ revealAfter: 22000, hold: 8000, pick: 0.2 }, { revealAfter: 22000, hold: 8000, pick: 0.6 }], { note: 'Avo has the quiz open in two tabs at once: question 1 right in tab A, then a different pick in tab B; question 2 the other way round.' }),
  'new-tab-after-timeout': () => namedSpec('new-tab-after-timeout', 'string-id', true, [10], [
    { plans: [{ r: 1500 }] },
    { plans: [{ r: 10400, reload: 'newTab', reloadAt: 12000, retap: 1000 }] },
    { plans: [{ r: 6000, right: false }] }
  ], [{ revealAfter: 18000, hold: 8000, pick: 0.1 }], { note: 'Brix lets the 10 s run out, closes the tab and opens the site in a NEW tab (empty sessionStorage), then taps.' }),
  'reload-while-sending': () => namedSpec('reload-while-sending', 'string-id', true, [20], [
    { plans: [{ r: 2000, reload: 'sendReload', reloadAt: 2300 }], net: { up: 2500, down: 300 }, reloadGap: 900 },
    { plans: [{ r: 3000, right: false }] }
  ], [{ revealAfter: 22000, hold: 8000, pick: 0.4 }], { note: 'Avo taps on slow wifi (2.5 s to the server) and reloads 0.3 s later, before the answer has landed; the fake delivers it anyway.' }),
  'journey-join-midq': () => namedSpec('journey-join-midq', 'string-id', true, [10], [
    { plans: [{ r: 6000 }], arrive: null, journeyAt: 300, journeyJoinAfter: 4000 },
    { plans: [{ r: 3000 }] }
  ], [{ revealAfter: 16000, hold: 8000, pick: 0.3 }], { note: 'Avo is on a Song Journey page when question 1 opens; 4 s later he taps Join (same tab), and gets his full 10 s on the site.' }),
  'two-games-same-tabs': () => namedSpec('two-games-same-tabs', 'string-id', true, [10], [
    { plans: [{ r: 3000 }] },
    { plans: [{ r: 8000 }] }
  ], [{ revealAfter: 12000, hold: 8000, pick: 0.3 }], { games: 2, note: 'two games in a row, the same student tabs: question 1 of game 2 must get a fresh clock.' }),
  'shared-tab-new-student': () => namedSpec('shared-tab-new-student', 'string-id', true, [10], [
    { plans: [{ answer: false, switchTo: 1, switchAfter: 5000 }] },
    { plans: [{ r: 7000 }], arrive: null },
    { plans: [{ r: 2000 }] }
  ], [{ revealAfter: 16000, hold: 8000, pick: 0.3 }], { note: 'Avo signs out 5 s into question 1 and Brix signs in on the same tab: Brix gets his own full 10 s.' }),
  'reveal-nobody-answered': () => namedSpec('reveal-nobody-answered', 'pc-name', true, [10], [
    { plans: [{ answer: false }] },
    { plans: [{ answer: false }] }
  ], [{ revealAfter: 12000, hold: 8000, pick: 0.3 }]),
  'cancel-in-lobby': () => namedSpec('cancel-in-lobby', 'fret-all', false, [], [
    { plans: [] },
    { plans: [] }
  ], []),
  'tap-at-the-buzzer': () => namedSpec('tap-at-the-buzzer', 'fret-lowE-A', true, [5, 10], [
    { plans: [{ r: 5001 }, { r: 10002 }], busy: true },
    { plans: [{ r: 5010 }, { r: 10020 }], busy: true },
    { plans: [{ r: 5030 }, { r: 9990 }] },
    { plans: [{ r: 4995 }, { r: 10150 }], busy: true }
  ], [{ revealAfter: 9000, hold: 8000, pick: 0.2 }, { revealAfter: 14000, hold: 8000, pick: 0.7 }], { note: 'taps a few ms after the buzzer, before a late countdown tick has disabled the buttons.' }),
  'double-tap': () => namedSpec('double-tap', 'string-id', false, [0, 0], [
    { plans: [{ r: 2000, double: 120 }, { r: 2000, double: 40 }] },
    { plans: [{ r: 2500, right: false, double: 200 }, { r: 2500 }] }
  ], [{ revealAfter: 8000, hold: 8000, pick: 0.5 }, { revealAfter: 8000, hold: 8000, pick: 0.2 }]),
  /* R1 on a changeAnswer quiz (2026-11-13) + T: three questions with the Questions box typed to 3 (n % 3 = 0), so the
     third Reveal is the last. Name: wrong then right, right then wrong, a change after the student's time is up
     (refused: the first pick stands), with the console revealing question 2 by itself. */
  'change-answer-name': () => namedSpec('change-answer-name', 'pc-name', true, [10, 10, 10], [
    { plans: [{ r: 1500, right: false, double: 1500, doubleRight: true }, { r: 2000, double: 2000 }, { r: 1500 }] },
    { plans: [{ r: 2000, double: 1000 }, { r: 2000, right: false, double: 9000, doubleRight: true }, { r: 2500, right: false }] },
    { plans: [{ r: 2500 }, { r: 2500, right: false }, { r: 2000, right: false, double: 800, doubleRight: true }], lang: 'es' }
  ], [{ revealAfter: 6000, hold: 8000, pick: 0.3 }, { revealAfter: 12000, hold: 8000, pick: 0.6 }, { revealAfter: 6000, hold: 8000, pick: 0.9 }], { note: 'changes of answer on Name the power chord; question 3 of 3 is the last (Final scores).' }),
  /* Find, no time limit (a change counts until Reveal): one change reaches the teacher only after the Reveal read, so
     the Reveal scores the pick before it (R7); one right-to-wrong change; one wrong-to-right. */
  'change-answer-find': () => namedSpec('change-answer-find', 'pc-find', false, [0, 0, 0], [
    { plans: [{ r: 2000, right: false, double: 1500, doubleRight: true }, { r: 2000, double: 1500 }, { r: 2000 }] },
    { plans: [{ r: 2000, right: false, double: 2380, doubleRight: true }, { r: 3000 }, { r: 2000, double: 2420 }], net: { up: 100, down: 100 } },
    { plans: [{ r: 2500, double: 1000 }, { r: 2500, right: false }, { r: 2500 }] }
  ], [{ revealAfter: 4500, hold: 9000, pick: 0.3 }, { revealAfter: 8000, hold: 8000, pick: 0.7 }, { revealAfter: 4500, hold: 9000, pick: 0.1 }], { note: 'changes of answer on Find the power chord (six-string board), one landing around the Reveal.' }),
  /* P: Preview (the comment above lqTPreview). The students are signed in and listening the whole time. */
  'preview-mc': () => namedSpec('preview-mc', 'string-id', true, [], [
    { plans: [{ r: 1500 }, { r: 1500 }] },
    { plans: [{ r: 2500 }, { r: 2500 }], lang: 'es', reloadAt: 12000 },
    { plans: [{ r: 3000 }, { r: 3000 }] },
    { plans: [{ r: 3000 }], arrive: 9000 }
  ], [], { games: 0, preview: { quizId: 'string-id', speed: true, limits: [10, 0], teacher: [{ revealAfter: 6000, hold: 4000, pick: 0.3 }, { revealAfter: 4000, hold: 4000, pick: 0.8 }] }, note: 'the teacher previews a whole mc game (two questions, Reveal, End, Exit preview); nothing may be written and no student may see anything.' }),
  'preview-fret': () => namedSpec('preview-fret', 'fret-lowE-A', false, [], [
    { plans: [{ r: 1500 }, { r: 1500 }] },
    { plans: [{ r: 2500 }, { r: 2500 }] }
  ], [], { games: 0, preview: { quizId: 'fret-lowE-A', speed: false, limits: [5, 5], teacher: [{ revealAfter: 7000, hold: 4000, pick: 0.2 }, { revealAfter: 3000, hold: 4000, pick: 0.7 }], endDuringQuestion: true }, note: 'a Fretboard-tap preview, ended with question 2 still open (no confirm in a preview).' }),
  'preview-name': () => namedSpec('preview-name', 'pc-name', true, [], [
    { plans: [{ r: 1500 }] },
    { plans: [{ r: 2500 }], lang: 'es' }
  ], [], { games: 0, preview: { quizId: 'pc-name', speed: true, limits: [10], teacher: [{ revealAfter: 12000, hold: 4000, pick: 0.5 }] }, note: 'a Name-the-power-chord preview: the chord box is on the stage, its name is not.' }),
  'preview-real-game-wins': () => namedSpec('preview-real-game-wins', 'fret-lowE-A', true, [10, 10], [
    { plans: [{ r: 2000 }, { r: 3000 }] },
    { plans: [{ r: 4000, right: false }, { r: 2500 }], lang: 'es' },
    { plans: [{ r: 3000 }, { answer: false }] }
  ], [{ revealAfter: 12000, hold: 8000, pick: 0.3 }, { revealAfter: 12000, hold: 8000, pick: 0.7 }], { second: 'realWins', preview: { quizId: 'fret-lowE-A', speed: true, limits: [10], teacher: [{ pick: 0.4 }], stopAt: 0, holdOpen: 3000 }, note: 'the console previews question 1; the teacher starts the real game from another device: the console must leave the preview at once and run the real game.' }),
  'preview-blocked-while-live': () => namedSpec('preview-blocked-while-live', 'pc-name', false, [10, 10], [
    { plans: [{ r: 2000 }, { r: 3000 }] },
    { plans: [{ r: 3000, right: false }, { r: 2500 }] }
  ], [{ revealAfter: 12000, hold: 8000, pick: 0.3 }, { revealAfter: 12000, hold: 8000, pick: 0.6 }], { second: 'blocked', note: 'a real game is started from another device while the console\'s teacher types in its Time box (the strip is not repainted, so Preview is still on it); the teacher clicks Preview: it must not open.' }),
  /* A: Reveal when time runs out (7c1792e). */
  'auto-reveal-on': () => namedSpec('auto-reveal-on', 'fret-lowE', true, [5, 5], [
    { plans: [{ r: 1500 }, { r: 4900 }] },
    { plans: [{ r: 4900 }, { r: 2000, right: false }] },
    { plans: [{ answer: false }, { r: 7000 }] }
  ], [{ revealAfter: 15000, hold: 8000, pick: 0.3 }, { revealAfter: 15000, hold: 8000, pick: 0.7 }], { note: 'the box is on (the default): the console reveals by itself 1.5 s after time-up; Brix taps in his last 0.1 s and must still score; Cimo taps 2 s after his time and after the reveal.' }),
  'auto-reveal-off': () => namedSpec('auto-reveal-off', 'pc-name', false, [5, 5], [
    { plans: [{ r: 2000 }, { r: 4800 }] },
    { plans: [{ r: 3000, right: false }, { r: 2500 }], lang: 'es' }
  ], [{ revealAfter: 12000, hold: 8000, pick: 0.3 }, { revealAfter: 9000, hold: 8000, pick: 0.6 }], { autoReveal: false, note: 'the teacher unticks "Reveal when time runs out": nothing reveals until the teacher presses Reveal, 7 s and 4 s after time-up.' }),
  'auto-reveal-slow-wifi': () => namedSpec('auto-reveal-slow-wifi', 'fret-lowE-A', true, [5], [
    { plans: [{ r: 2000 }] },
    { plans: [{ r: 4500 }], net: { up: 1200, down: 2500 } },
    { plans: [{ r: 6500 }] }
  ], [{ revealAfter: 15000, hold: 8000, pick: 0.4 }], { note: 'Brix is on slow wifi (2.5 s down, 1.2 s up): the question reaches him 2.4 s after the console; he taps 4.5 s into his own 5 s. Does the console wait for his time to run out before it reveals by itself?' }),
  /* H: "Hide names on the projector" (2026-11-13), ticked and unticked in every state of a game, on all three Reveal
     shapes (mc, a countOnly fret quiz, Name). Ticked: no name or uid anywhere on the stage, the lobby only counts, a
     leaderboard row is its place and points. Unticked: today's stage, word for word (the R11 checks). */
  'hide-names-mc': () => namedSpec('hide-names-mc', 'string-id', true, [10, 10, 10], [
    { plans: [{ r: 1500 }, { r: 2000 }, { r: 2500 }] },
    { plans: [{ r: 2500, right: false }, { r: 1500 }, { r: 3000 }] },
    { plans: [{ r: 3000 }, { answer: false }, { r: 2000, right: false }] },
    { plans: [{ r: 1800 }, { r: 2600 }, { r: 1200 }], lang: 'es' }
  ], [{ revealAfter: 11000, hold: 6000, pick: 0.2 }, { revealAfter: 11000, hold: 6000, pick: 0.5 }, { revealAfter: 11000, hold: 6000, pick: 0.8 }],
  { hide: { setup: true, lobby: [false, true], q0: false, r0: true, r1: false, q2: true, end: [false, true] }, note: 'the teacher ticks "Hide names on the projector" before Start and clicks it in the lobby, during a question, at a Reveal and on the final scores.' }),
  'hide-names-find': () => namedSpec('hide-names-find', 'pc-find', true, [10, 10], [
    { plans: [{ r: 1500 }, { r: 2500 }] },
    { plans: [{ r: 3000, right: false }, { r: 2000 }] },
    { plans: [{ r: 2000 }, { r: 4000 }] }
  ], [{ revealAfter: 12000, hold: 6000, pick: 0.3 }, { revealAfter: 6000, hold: 6000, pick: 0.7 }], { hide: { lobby: true, r0: [false, true], q1: false, r1: true, end: false }, note: 'Find the power chord (countOnly): names hidden from the lobby, clicked at an automatic Reveal and a clicked one.' }),
  'hide-names-name': () => namedSpec('hide-names-name', 'pc-name', false, [10], [
    { plans: [{ r: 2000 }] },
    { plans: [{ r: 3000, right: false }] }
  ], [{ revealAfter: 6000, hold: 6000, pick: 0.5 }], { hide: { setup: true, end: [false, true] }, note: 'Name the power chord with names hidden from before Start to the end.' }),
  'end-during-question': () => namedSpec('end-during-question', 'string-id', true, [10, 10], [
    { plans: [{ r: 2000 }, { r: 2000 }] },
    { plans: [{ r: 3000, right: false }, { r: 2500 }] }
  ], [{ revealAfter: 12000, hold: 8000, pick: 0.5 }, { revealAfter: 6000, hold: 8000, pick: 0.5 }], { endDuringQuestion: true })
};

/* ════════════════ running one case ════════════════ */
let BANK = null, TIN = null;
function loadModelData() {
  const g = { console: { log() {}, warn() {}, error() {} }, performance: { now: () => 0 }, setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {},
    localStorage: storage(new Map()), sessionStorage: storage(new Map()), location: { href: 'x' }, escHtml, escAttr, addEventListener() {}, CustomEvent: function () {},
    document: { documentElement: {}, body: { classList: { add() {}, remove() {} } }, getElementById: () => null, querySelectorAll: () => [], addEventListener() {}, createElement: () => ({}) },
    firebase: { firestore: Object.assign(() => ({}), { FieldValue: { serverTimestamp: () => null } }) } };
  g.window = g;
  vm.createContext(g);
  SCRIPTS['i18n.js'].runInContext(g);
  SCRIPTS['live-quiz.js'].runInContext(g);
  const raw = JSON.parse(vm.runInContext('JSON.stringify(LIVE_QUIZZES)', g));
  BANK = {};
  for (const [id, q] of Object.entries(raw)) BANK[id] = { ...q, kind: q.type === 'fret' ? 'fret' : q.type === 'pcname' ? 'pcname' : 'mc', choices: q.choices || [] };
  const tInRaw = g.tIn;
  TIN = (k, l, p) => tInRaw(k, l, p);
}

/* The questions of one game (a real one or a preview), driven from w.driver. stopAt = q: open that question, hold it
   open for holdOpen ms and return (a real game is about to interrupt the preview). Returns true when the game was
   ended with a question open. */
async function playQuestions(w, quiz, limits, plans, r, opts = {}) {
  for (let q = 0; q < limits.length; q++) {
    const plan = plans[q];
    if (q && limits[q] !== limits[q - 1]) await w.tChange('lq-limit', String(limits[q]), 'Time to answer');
    w.intended.limit = limits[q];
    w.driverQ = q;
    if (quiz.kind === 'mc') {
      w.intended.mc[q] = quiz.choices[Math.floor(plan.pick * quiz.choices.length)].id;
      await w.tClick(b => b.onclick === 'lqTeacherNext()', q ? 'Next question' : 'First question');
    } else if (quiz.kind === 'fret') {
      const roots = quiz.rootStrings || quiz.strings;
      const str = roots[Math.floor(plan.pick * roots.length)];
      if (roots.length > 1) await w.tClick(b => b.onclick === `lqTFretString='${str}';lqPaintControls()`, `string ${str}`);
      if (r() < 0.25) await w.tClick(b => b.onclick === `lqTeacherOpenFret('${str}','random')`, 'Random');
      else {
        const notes = w.strip().buttons.filter(b => b.onclick.startsWith(`lqTeacherOpenFret('${str}','`) && !b.onclick.includes("'random'"));
        const b = pick(r, notes);
        if (!b) { w.flag('R13 error', `the strip offers no note button on ${str}`); return false; }
        const note = /,'([^']+)'\)$/.exec(b.onclick)[1];
        w.intended.target[q] = { string: str, note };
        await w.tClick(x => x.onclick === b.onclick, `${b.label} on ${str}`);
      }
    } else {
      const chip = pick(r, ['lowE', 'A', 'both']);
      await w.tClick(b => b.onclick === `lqTPcStrings='${chip}';lqPaintControls()`, `chip ${chip}`);
      await w.tClick(b => b.onclick === 'lqTeacherOpenPcName()', 'Random shape');
    }
    if (opts.stopAt === q) { await w.until(w.loop.now + opts.holdOpen); return false; }
    await w.hideHook(`q${q}`);
    w.revealCommitted = false;
    const auto = quiz.kind !== 'mc' && limits[q] > 0 && w.intended.auto !== false;
    const last = opts.endDuringQuestion && q === limits.length - 1;
    if (auto && !last && plan.revealAfter >= limits[q] * 1000) {
      /* the teacher waits: the console reveals by itself */
      await w.until(w.loop.now + limits[q] * 1000 + AUTO_GRACE_MS + 3000);
      w.check('A auto-reveal', w.revealCommitted, `question ${q + 1}: the "Reveal when time runs out" box is on, but the console had not revealed by itself 3 s after the ${limits[q]} s limit + grace`);
      if (w.revealCommitted) { await w.hideHook(`r${q}`); await w.until(w.loop.now + plan.hold); w.checkVerdicts(q); w.checkTotalStrip(q); continue; }
    }
    if (quiz.kind !== 'mc' && limits[q] > 0 && w.intended.auto === false && plan.revealAfter >= limits[q] * 1000 + AUTO_GRACE_MS) w.cover('Aoff');
    await w.until(w.loop.now + (last && auto ? Math.min(plan.revealAfter, limits[q] * 500) : plan.revealAfter));
    if (last) {
      await w.tClick(b => b.onclick === 'lqTeacherEnd()', 'End game (question still open)');
      w.cover('R8endq');
      return true;
    }
    w.deliveredAtReveal = new Map(w.driver.delivered);
    w.pendingReveal = w.model.q[q] ? w.model.expectReveal(q, w.driver.delivered) : null;
    if (w.pendingReveal && w.pendingReveal.unexpected.length) w.vlog(`${w.driver.label}'s screen holds answers the rules do not count: ${w.pendingReveal.unexpected.map(u => w.model.names[u]).join(', ')}`);
    if (quiz.kind === 'mc') await w.tClick(b => b.onclick === `lqTeacherReveal('${w.intended.mc[q]}')`, `Reveal: mark ${w.intended.mc[q]}`);
    else if (quiz.kind === 'fret') await w.tClick(b => b.onclick === 'lqTeacherRevealFret()', 'Reveal');
    else await w.tClick(b => b.onclick === 'lqTeacherRevealPcName()', 'Reveal');
    await w.hideHook(`r${q}`);
    await w.until(w.loop.now + plan.hold);
    w.check('R7 reveal', w.revealCommitted, `question ${q + 1}: Reveal never reached the ${w.teacher.previewing ? 'console\'s preview copy' : 'doc'}`);
    w.checkVerdicts(q);
    w.checkTotalStrip(q);
  }
  return false;
}
/* The teacher sets the three boxes on `tab` (another console's are its own: another device). */
/* T: the Questions box. By the game's length n: n % 3 = 0 -> typed n (the game ends on its last question), 1 -> emptied
   (no set number), 2 -> left alone on a device that never set it (must then read 10, the default; a game longer than
   that, or a device that already typed one, types n + 2). Returns the number the game should carry. */
async function setTotal(w, tab, n) {
  const box = tab.dom.byId.get('lq-total');
  if (!box) { w.flag('R13 error', `${tab.label}'s strip has no Questions box (lq-total)`); return 0; }
  if (!tab.totalSet) w.check('T total', box.value === '10', () => `${tab.label}: the Questions box reads "${box.value}" on a device that never set it (default 10)`);
  if (n % 3 === 2 && !tab.totalSet && n <= 10) return 10;
  const v = n % 3 === 0 ? n : n % 3 === 1 ? 0 : n + 2;
  await w.tChange('lq-total', v ? String(v) : '', 'Questions', tab);
  tab.totalSet = true;
  w.check('T total', box.value === (v ? String(v) : ''), () => `${tab.label}: the Questions box reads "${box.value}" after the teacher typed ${v || 'nothing'}`);
  return v;
}
async function setBoxes(w, tab, quizId, speed, limit, auto) {
  await w.tChange('lq-quiz-pick', quizId, 'Quiz', tab);
  await w.tChange('lq-scoring', speed ? 'speed' : 'flat', 'Scoring', tab);
  await w.tChange('lq-limit', String(limit), 'Time to answer', tab);
  if (BANK[quizId].kind === 'mc') return;
  /* A: the "Reveal when time runs out" box, ON by default (7c1792e) on a device that never set it. */
  const box = parseTags(w.strip(tab).innerHTML).find(t => t.name === 'input' && t.attrs.some(([k, v]) => k === 'id' && v === 'lq-autoreveal'));
  const checked = !!box && box.attrs.some(([k]) => k === 'checked');
  if (!tab.autoSet) w.check('A auto-reveal', checked, () => `${tab.label}: the "Reveal when time runs out" box is ${box ? 'off' : 'missing'} on a device that never set it (on by default)`);
  if (auto === false && checked) {
    const el = tab.dom.byId.get('lq-autoreveal');
    el.checked = false;
    w.vlog(`${tab.label} unticks "Reveal when time runs out"`);
    w.run(tab, `(function(){ ${el.onchangeText} }).call(__this)`, el);
    tab.autoSet = true;
    await drain(); w.afterEvent();
  }
}
/* P: a preview on the console (w.teacher). Rule (the comment above lqTPreview in live-quiz.js, 2026-11-12): the picked
   quiz runs on the stage and control strip with NOTHING written to Firestore, so no student is invited and no score is
   kept; Preview opens only when no real game is live, and a real game going live ends the preview at once. */
async function runPreview(w, spec) {
  const A = w.teacher, P = spec.preview, quiz = BANK[P.quizId];
  const r = rngFor(SEED, spec.name, 'preview');
  w.driver = A;
  await setBoxes(w, A, P.quizId, P.speed, P.limits[0] ?? 0, P.autoReveal);
  const pTotal = await setTotal(w, A, P.limits.length);
  await w.until(w.loop.now + 5000);
  w.intended = { limit: P.limits[0] ?? 0, target: {}, mc: {}, speed: P.speed, quizId: P.quizId, auto: P.autoReveal !== false, total: pTotal };
  w.driverQ = -1;
  w.previewStart(A);
  await w.tClick(b => b.onclick === 'lqTeacherPreview()', 'Preview');
  if (!A.previewing) return;
  await w.until(w.loop.now + 2500);
  const ended = await playQuestions(w, quiz, P.limits, P.teacher, r, { stopAt: P.stopAt, holdOpen: P.holdOpen, endDuringQuestion: P.endDuringQuestion });
  if (P.stopAt != null) return;
  if (!ended) await w.tClick(b => b.onclick === 'lqTeacherEnd()', 'End game (preview)');
  await w.until(w.loop.now + 3000);
  const texts = textsOf(w.strip(A).innerHTML);
  const want = [HIDE_NAMES_LABEL, 'Full screen', ...PREVIEW_STRIP_BUTTONS, ...PREVIEW_STRIP_HINT];
  w.check('P preview', JSON.stringify(texts) === JSON.stringify(want), () => `the preview's end strip shows ${JSON.stringify(texts)}, want ${JSON.stringify(want)}`);
  w.previewExiting(A);
  await w.tClick(b => b.onclick === 'lqTeacherExitPreview()', 'Exit preview');
  w.previewBack(A);
  await w.until(w.loop.now + 2000);
}
async function runCase(spec) {
  const w = new World(spec, BANK, TIN);
  CURRENT = w;
  const r = rngFor(SEED, spec.name, 'teacher');
  const fs = w.fs;
  fs.cur = { sessionId: 'lq-old0-zzzzz', quizId: 'string-id', state: 'ended', qIndex: 3, correct: null, scores: { uOld000: { pts: 700, right: 1, answered: 1, name: 'Oldie Leftover' } }, startedAt: { __ts: -4 * 3600e3 }, endedAt: { __ts: -3 * 3600e3 } };
  if (spec.students[0]) fs.ans.set(spec.students[0].uid, { uid: spec.students[0].uid, name: spec.students[0].name, sessionId: 'lq-old0-zzzzz', qIndex: 0, choice: 'A', ms: 900, at: { __ts: -3.5 * 3600e3 } });
  for (const s of spec.students) if (s.arrive != null) w.loop.at(s.arrive, () => w.bootStudent(s, 'opens the site'), null);
  for (const s of spec.students) if (s.journeyAt != null) w.loop.at(s.journeyAt, () => w.bootJourney(s), null);
  for (const s of spec.students) if (s.reloadAtAbs != null) w.loop.at(s.reloadAtAbs, () => w.reload(s, 'during the preview'), null);
  for (const s of spec.students) if (s.secondTabAt != null) w.loop.at(s.secondTabAt, () => w.bootStudent(s, 'opens the quiz in a SECOND tab, the first still open', null, true), null);
  await w.until(300);
  w.teacher = w.driver = w.makeTab('teacher', null);
  if (!w.teacher.alive) return w;
  w.run(w.teacher, 'var teacherView = "livequiz"; renderTeacherLiveQuiz();');
  let B = null;
  if (spec.second) {
    B = w.makeTab('teacher', null);
    B.net = { down: () => 90, up: () => 90 };
    if (B.alive) w.run(B, 'var teacherView = "livequiz"; renderTeacherLiveQuiz();');
  }
  await w.until(1000);
  if (spec.preview) {
    if (!HAS_PREVIEW) { w.flag('P preview', `this live-quiz.js has no Preview (no lqTeacherPreview): the tool expects main from f4fbe4e on`); return w; }
    await runPreview(w, spec);
  }
  const quiz = BANK[spec.quizId];
  for (let game = 0; game < (spec.games ?? 1); game++) {
  w.intended = { limit: spec.limits[0] ?? 0, target: {}, mc: {}, speed: spec.speed, quizId: spec.quizId, auto: spec.autoReveal !== false };
  w.driverQ = -1;
  if (game) w.vlog(`--- the teacher starts game ${game + 1} with the same student tabs ---`);
  const starter = spec.second ? B : w.teacher;
  w.driver = starter;
  await setBoxes(w, starter, spec.quizId, spec.speed, spec.limits[0] ?? 0, spec.autoReveal);
  w.intended.total = await setTotal(w, starter, spec.limits.length);
  if (!game) await w.hideHook('setup');
  if (spec.second === 'blocked') {
    /* The console's teacher is typing in its Time-to-answer box: lqPaintControls leaves the strip alone while that box
       has focus ("the next paint catches up"), so the strip still offers Preview after the real game goes live. */
    const box = w.teacher.dom.byId.get('lq-limit');
    w.teacher.dom.document.activeElement = box || null;
    w.vlog(`teacher clicks into the console's Time-to-answer box`);
  }
  await w.tClick(b => b.onclick === 'lqTeacherStart()', 'Start game');
  await w.until(w.loop.now + spec.lobbyMs);
  if (!game) await w.hideHook('lobby');
  if (spec.second === 'blocked') {
    const A = w.teacher;
    const offered = w.strip(A).buttons.some(b => b.onclick === 'lqTeacherPreview()' && !b.disabled);
    w.vlog(`teacher's console: the real game is ${A.shown && A.shown.state}; its strip ${offered ? 'still offers Preview (the box has focus)' : 'offers no Preview'}`);
    if (offered && realLive(A.shown)) {
      w.previewStart(A);
      await w.tClick(b => b.onclick === 'lqTeacherPreview()', 'Preview (a real game is live)', A);
      w.cover('Pblocked');
      await w.until(w.loop.now + 1500);
    }
  }
  if (spec.second === 'realWins') w.driver = w.teacher;
  let ended = false;
  if (spec.Q === 0) {
    await w.tClick(b => b.onclick === 'lqTeacherClose()', 'Cancel (still in the lobby)');
    await w.until(w.loop.now + 9000);
    w.checkCleared();
    continue;
  }
  ended = await playQuestions(w, quiz, spec.limits, spec.teacher, r, { endDuringQuestion: spec.endDuringQuestion });
  if (!ended) await w.tClick(b => b.onclick === 'lqTeacherEnd()', 'End game');
  await w.until(w.loop.now + 9000);
  w.checkEnd();
  if (!game) await w.hideHook('end');
  await w.tClick(b => b.onclick === 'lqTeacherClose()', 'Clear the board');
  await w.until(w.loop.now + 9000);
  w.checkCleared();
  }
  return w;
}

/* ════════════════ the fake-world probes (the self-test) ════════════════ */
async function probes() {
  const results = [];
  const w = { loop: new Loop(), vlog() {}, beforeDoc() {}, afterDoc() {}, beforeAnswers() {}, onAnswerSent() {}, onAnswerCommit() {}, onAnswerRefusedBack() {}, onCommitCurrent() {}, settle: (t, fn) => fn(), callIn: (t, fn, a) => fn(...a) };
  const fs = new FakeFS(w, FAKE_FAULT);
  w.fs = fs;
  const seq = arr => { let i = 0; return () => arr[Math.min(i++, arr.length - 1)]; };
  const mk = (uid, teacher, down, up) => ({ uid, isTeacher: !!teacher, alive: true, listeners: [], gets: 0, readBacks: [], pending: 0, net: { down: down || (() => 50), up: up || (() => 50) }, label: uid });
  const T = mk('teacher', true), S = mk('s1'), S2 = mk('s2');
  const db = tab => fs.firebaseFor(tab).firestore();
  const ref = tab => db(tab).collection('liveQuiz').doc('current');
  const run = async ms => { const end = w.loop.now + ms; while (w.loop.h.length && w.loop.h[0].t <= end) { const ev = w.loop.pop(); if (ev.dead) continue; w.loop.now = ev.t; ev.fn(); await drain(); } w.loop.now = end; };
  const settle = async p => { let r; p.then(() => { r = 'ok'; }, e => { r = 'denied:' + e.code; }); await run(5000); return r; };
  const ans = (o) => ({ uid: 's1', name: 'P One', sessionId: 'S', qIndex: 0, choice: 'A', ms: 10, at: SERVER_TS, ...o });
  const expect = (name, ok) => results.push({ name, ok });
  await settle(ref(T).set({ sessionId: 'S', state: 'reveal', qIndex: 0, scores: { a: { pts: 1, x: 2 } } }));
  expect('a student answer while the doc is in reveal is refused', (await settle(ref(S).collection('answers').doc('s1').set(ans()))) === 'denied:permission-denied');
  await settle(ref(T).set({ state: 'question', qIndex: 1 }, { merge: true }));
  expect('an answer stamped with another qIndex is refused', (await settle(ref(S).collection('answers').doc('s1').set(ans()))) === 'denied:permission-denied');
  expect('an extra field (pts) is refused', (await settle(ref(S).collection('answers').doc('s1').set(ans({ qIndex: 1, pts: 1000 })))) === 'denied:permission-denied');
  expect("another student's doc is refused", (await settle(ref(S).collection('answers').doc('s2').set(ans({ qIndex: 1 })))) === 'denied:permission-denied');
  expect('a fair answer is accepted', (await settle(ref(S).collection('answers').doc('s1').set(ans({ qIndex: 1 })))) === 'ok');
  expect('a student may not write liveQuiz/current', (await settle(ref(S).set({ state: 'off' }, { merge: true }))) === 'denied:permission-denied');
  await settle(ref(T).set({ scores: { a: { pts: 5 } } }, { merge: true }));
  expect('{merge:true} is deep (keeps scores.a.x)', fs.cur.scores.a.x === 2 && fs.cur.scores.a.pts === 5);
  await settle(ref(T).set({ scores: { b: { pts: 1 } } }, { mergeFields: ['scores'] }));
  expect('{mergeFields} replaces the named field whole', !fs.cur.scores.a && fs.cur.scores.b.pts === 1 && fs.cur.state === 'question');
  await settle(ref(T).set({ sessionId: 'S2', state: 'lobby' }));
  expect('set() with no options replaces the doc', fs.cur.sessionId === 'S2' && !('scores' in fs.cur));
  let threw = false; try { ref(T).set({ a: undefined }); } catch (e) { threw = true; }
  expect('an undefined field value throws, as the SDK does', threw);
  const got = [];
  const L = mk('listener', false, seq([10, 500, 50, 50]));
  ref(L).onSnapshot(s => got.push(s.exists ? s.data().state : null));
  await run(2000);
  ref(T).set({ state: 'question', qIndex: 0 }, { merge: true });
  ref(T).set({ state: 'reveal' }, { merge: true });
  await run(3000);
  expect('each listener gets snapshots in commit order', JSON.stringify(got) === JSON.stringify(['lobby', 'question', 'reveal']));
  const tg = [];
  ref(T).onSnapshot(s => tg.push({ t: w.loop.now, state: s.data().state, ts: s.data().askedAt }));
  await run(1000);
  const before = tg.length, t0 = w.loop.now;
  const p = ref(T).set({ state: 'question', qIndex: 1, askedAt: SERVER_TS }, { merge: true });
  await run(0);
  const local = tg[before];
  expect("the writer's own listener gets a local snapshot at once, serverTimestamp null", !!local && local.t === t0 && local.state === 'question' && local.ts === null);
  await settle(p);
  const server = tg[tg.length - 1];
  expect('the committed snapshot carries a real timestamp', !!server && server.ts && typeof server.ts.toMillis === 'function');
  let listErr = null;
  ref(S).collection('answers').onSnapshot(() => { listErr = 'listed'; }, e => { listErr = e.code; });
  await run(2000);
  expect('a student may not list the answers', listErr === 'permission-denied');
  const FV = fs.firebaseFor(T).firestore.FieldValue;
  expect('serverTimestamp() is an instance of the FieldValue class, as in the SDK', typeof FV === 'function' && FV.serverTimestamp() instanceof FV);
  expect('a student may get their own answer doc', (await settle(ref(S).collection('answers').doc('s1').get())) === 'ok');
  expect("a student may not get another's answer doc", (await settle(ref(S2).collection('answers').doc('s1').get())) === 'denied:permission-denied');
  return results;
}

/* ════════════════ the break-it proof ════════════════ */
/* Faults on the site the tool expects (main with Preview + the reload fix), left open on purpose (Jonathan's list):
   reported, excused NARROWLY in a default run, never fixed here. A known case is excused only for its own kinds of
   failing check on its own student (cats), plus a whole-class result (KNOWN_AGG: tally, end scores, leaderboard, end
   screens) only when it holds once that student's own row is taken out (a leaderboard must also be in its own points
   order); any other failing line in the case still fails the run. And the case must still show its sign (sig), else the run fails with
   "fixed? remove it". --strict excuses nothing. */
const KNOWN_SITE_FAULTS = {
  'two-tabs-one-student': { student: 'Avo Testerson', modes: ['first', 'tab'], sig: 'R1 one pick', cats: ['R1 one pick', 'R1-R3 refused tap', 'R6-R8 points', 'R10 student verdict', 'R4/R5 answer time', 'R12 countdown'], why: 'one student, two open tabs: a second pick, the last tap wins (each tab keeps its own lqMyAnswer; the rules allow update)' },
  'new-tab-after-timeout': { student: 'Brix Testerson', modes: ['first'], sig: 'R1-R3 refused tap', cats: ['R1-R3 refused tap', 'R6-R8 points', 'R10 student verdict', 'R12 countdown', 'R12 time up'], why: 'after time-up a NEW tab (empty sessionStorage) gives a fresh clock and a scored answer: not closed by the reload fix' }
};
const KNOWN_AGG = new Set(['R9 tally', 'R8 end', 'R11 leaderboard', 'R10 end screen']);
/* R3-4: a whole-class line is excused only when it holds once the known student's own row is taken out (f.data). */
const knownExcuses = (kn, f) => (kn.cats.includes(f.cat) && f.msg.includes(kn.student)) || (KNOWN_AGG.has(f.cat) && !!f.data && f.data.equalWithout(kn.student));
const FAULTS = [
  { id: 'r2-strip-attr', why: 'review R2-1: the right frets in an attribute on the Reveal button (the strip is on the projector)', from: 'head = `<button type="button" class="lq-ctl go" onclick="lqTeacherRevealFret()"${busy}>Reveal</button>`;', to: 'head = `<button type="button" class="lq-ctl go" data-f="${lqTargetIds(quiz, s.target).map(id => id.split(\':\')[1]).join(\' \')}" onclick="lqTeacherRevealFret()"${busy}>Reveal</button>`;' },
  { id: 'r2-single-quote', why: 'review R2-2: the right frets in a single-quoted attribute on the stage', from: '    + prompt + timer\n', to: "    + prompt + timer + (s.target ? \"<div class='lq-st-gap' data-f='\" + lqTargetIds(quiz, s.target).map(id => id.split(':')[1]).join(' ') + \"'></div>\" : '')\n" },
  { id: 'r2-svg-desc', why: 'review R2-3: the root in a data- attribute and a <desc> of the chord box', from: "return (cfg && typeof chordDiagramSVG === 'function') ? chordDiagramSVG(cfg) : '';", to: "const root = lqPcRootAt(string, fret); return (cfg && typeof chordDiagramSVG === 'function') ? chordDiagramSVG(cfg).replace('<svg', '<svg data-root=\"' + root + '\"').replace('</svg>', '<desc>root ' + root + '</desc></svg>') : '';" },
  { id: 'r2-student-board-attr', why: "review R2-4: the right frets in an attribute on the student's board", from: '`<div class="lq-board" id="lq-board">${typeof fgBoardSvg === \'function\' ? fgBoardSvg(\'lq\', null, lqBoardOpts(quiz, { strings: quiz.strings, clickFn:', to: '`<div class="lq-board" id="lq-board" data-f="${lqTargetIds(quiz, s.target).join(\' \')}">${typeof fgBoardSvg === \'function\' ? fgBoardSvg(\'lq\', null, lqBoardOpts(quiz, { strings: quiz.strings, clickFn:' },
  { id: 'r2-span-in-button', why: 'review R2-7: an empty <span> inside the right Name button', from: 'onclick="lqAnswerPcName(${i})">${escHtml(name)}</button>', to: 'onclick="lqAnswerPcName(${i})">${escHtml(name)}${name === lqPcNameOf(s.target) ? \'<span></span>\' : \'\'}</button>' },
  { id: 'r2-no-board-off', why: 'review R2-8: the fret board stays live after time-up', from: "document.getElementById('lq-board')?.classList.add('lq-board-off');", to: '' },
  { id: 'r1-attr-fret', why: 'review R1-1: the right frets in a data- attribute on the stage', from: '    + prompt + timer\n', to: "    + prompt + timer + (s.target ? '<div class=\"lq-st-gap\" data-f=\"' + lqTargetIds(quiz, s.target).map(id => id.split(':')[1]).join(' ') + '\"></div>' : '')\n" },
  { id: 'r1-aria-root', why: "review R1-1: the chord's root in an aria-label on the stage", from: '`<div class="lq-st-pcrow">${lqPcNameBoxHtml(', to: '`<div class="lq-st-pcrow" aria-label="root ${lqPcRootAt(s.target.string, Number(s.target.fret))}">${lqPcNameBoxHtml(' },
  { id: 'r2-nolimit-30', why: 'review R1-2: no limit slides over 30 s, not 20', from: 'const limit = (Number(s.limitSec) || 20) * 1000;', to: 'const limit = (Number(s.limitSec) || 30) * 1000;' },
  { id: 'r3-skip-question', why: 'review R1-3: Next skips a question', from: "const next = s.state === 'lobby' ? 0 : Number(s.qIndex) + 1;", to: "const next = s.state === 'lobby' ? 0 : Number(s.qIndex) + 2;" },
  { id: 'r4-close-ended', why: "review R1-4: Clear the board writes 'ended', not 'off'", from: "await lqWrite({ state: 'off', correct: null, tally: null,", to: "await lqWrite({ state: 'ended', correct: null, tally: null," },
  { id: 'r5-hint-class', why: 'review R1-5: the right Name button carries an extra class', from: 'class="lq-choice" style="--lq-c:${LQ_PC_NAME_COLOR}" onclick="lqAnswerPcName(${i})"', to: 'class="lq-choice${name === lqPcNameOf(s.target) ? \' lq-hint-on\' : \'\'}" style="--lq-c:${LQ_PC_NAME_COLOR}" onclick="lqAnswerPcName(${i})"' },
  { id: 'no-restore', why: 'live-quiz.js:480-481 — a reload was a second pick', from: '  if(live && Number(live.qIndex) >= 0 && (!prev || prev.sessionId !== live.sessionId)) lqRestoreMyAnswer(live);\n', to: '' },
  { id: 'restore-race', why: 'taps slip in while the pick is read back', from: "  if(lqRestoring === s.sessionId + ':' + s.qIndex) return;   // still reading back a pick made before a reload\n", to: '' },
  { id: 'no-first-tap', why: 'first tap wins', invisible: 'the same click redraws the screen locked (no buttons, a board with no hit zones), so a second tap cannot reach lqAnswer from the screen; the guard is a second line of defence', from: '  if(had && (!lqQuiz(s.quizId).changeAnswer || had.choice === choiceId)) return;\n  if(lqRestoring', to: '  if(lqRestoring' },
  { id: 'no-time-check', why: 'a tap after time-up counts', from: '  if(Number(s.limitSec) && lqSecsLeft(s) === 0) return;\n', to: '' },
  { id: 'clock-not-restarted', why: "the student's clock is not restarted on a new question", from: '(!prev || prev.sessionId !== live.sessionId || prev.qIndex !== live.qIndex)){\n    lqMyAnswer = null; lqSendError = false;', to: '(!prev || prev.sessionId !== live.sessionId)){\n    lqMyAnswer = null; lqSendError = false;' },
  { id: 'stage-flicker', why: 'checks.mjs:5003 — the projector flickered back to "20" on each answer', from: 'answer, and an answer landing after "Time\'s up" left it stuck on "20".\n  lqStageSyncTick();', to: 'answer, and an answer landing after "Time\'s up" left it stuck on "20".' },
  { id: 'points-curve', why: 'speed points slide to 600, not 500', from: 'return Math.round(LQ_MAX_POINTS * (1 - 0.5 * (m / limit)));', to: 'return Math.round(LQ_MAX_POINTS * (1 - 0.4 * (m / limit)));' },
  { id: 'flat-is-speed', why: 'the Scoring box is ignored', from: "  const speed = lqTScoring === 'speed';", to: '  const speed = true;' },
  { id: 'round-filter', why: "Reveal scores last round's answer docs again", from: 'return lqTAnswers.filter(a => a && a.sessionId === s.sessionId && a.qIndex === qIndex);', to: 'return lqTAnswers.filter(a => a && a.sessionId === s.sessionId);' },
  { id: 'name-in-scores', why: 'a name reaches the public doc', from: '    cur.last = pts; cur.lastRight = right;\n', to: '    cur.last = pts; cur.lastRight = right; cur.name = a.name;\n' },
  { id: 'stage-leak-fret', why: 'the right fret in an attribute on the stage', from: '    + prompt + timer\n', to: "    + prompt + timer + (s.target ? '<div class=\"lq-st-hint\" data-x=\"' + lqTargetIds(quiz, s.target).join(' ') + '\"></div>' : '')\n" },
  { id: 'stage-leak-name', why: 'the chord name on the stage before Reveal', from: "  const prompt = s.target ? lqBilingual(quiz.promptKey, 'lq-st-prompt') : lqBilingual('lq.noTapYet', 'lq-st-prompt');", to: "  const prompt = s.target ? lqBilingual(quiz.promptKey, 'lq-st-prompt') + '<span class=\"lq-sr\">' + lqPcNameOf(s.target) + '</span>' : lqBilingual('lq.noTapYet', 'lq-st-prompt');" },
  { id: 'verdict-total', why: "the student's +N shows the running total", from: '` <span class="lq-plus">+${escHtml(String(me.last))}</span></div>`', to: '` <span class="lq-plus">+${escHtml(String(me.pts))}</span></div>`' },
  { id: 'limit-not-written', why: 'a new Time-to-answer is not written into the next question', from: "    state: 'question', qIndex: next, correct: null, correctIds: null, tally: null,\n    limitSec: lqTLimitFor(s.quizId),\n", to: "    state: 'question', qIndex: next, correct: null, correctIds: null, tally: null,\n" },
  { id: 'tdz', why: 'the live-quiz.js:429 class (a temporal-dead-zone error at load), planted at lines 1178-1179', from: "let lqTLimits = {};\ntry { lqTLimits = JSON.parse(localStorage.getItem('gc-lq-limits') || '{}') || {}; } catch(e){ lqTLimits = {}; }", to: "try { lqTLimits = JSON.parse(localStorage.getItem('gc-lq-limits') || '{}') || {}; } catch(e){ lqTLimits = {}; }\nlet lqTLimits = {};" }
];
/* The reload fix (lqRoundOpenedAt, 2026-11-12). */
/* 2026-11-13: change an answer (R1 on a changeAnswer quiz), the count-only Reveal (C), the Questions box (T). */
const NOV13_FAULTS = [
  { id: 'n13-change-refused', why: 'R1: a changeAnswer quiz refuses a second, different tap', from: '  if(had && (!lqQuiz(s.quizId).changeAnswer || had.choice === choiceId)) return;', to: '  if(had) return;' },
  { id: 'n13-change-old-ms', why: 'R4: a changed answer is written with time 0, not its own tap\'s time', from: '  const ms = lqQOpenedAt ? Math.max(0, Math.round(performance.now() - lqQOpenedAt)) : 0;', to: '  const ms = had ? 0 : (lqQOpenedAt ? Math.max(0, Math.round(performance.now() - lqQOpenedAt)) : 0);' },
  { id: 'n13-student-bars', why: 'C: a student\'s Name Reveal shows the tally bars again', from: "lqPcNameBoxHtml(s.target, 'lq-pcbox-rev') + (quiz.countOnly ? lqRightCountHtml(s) : lqTallyHtml(s, quiz, mine))", to: "lqPcNameBoxHtml(s.target, 'lq-pcbox-rev') + lqTallyHtml(s, quiz, mine)" },
  { id: 'n13-stage-bars', why: 'C: the stage\'s Find Reveal shows the tally bars again', from: '${quiz.countOnly ? lqStageRightCountHtml(s) : lqTallyHtml(s, quiz, null)}', to: '${lqTallyHtml(s, quiz, null)}' },
  { id: 'n13-count-roster', why: 'C: the count is out of the scores map, not the answers counted', from: '  return { n, total };\n}\nfunction lqRightCountHtml', to: '  return { n, total: Math.max(total, Object.keys(s.scores || {}).length + 1) };\n}\nfunction lqRightCountHtml' },
  { id: 'n13-no-final', why: 'T: after the last question the strip still offers the next one', from: '  if(lqLastQuestionDone(s)){\n    el.innerHTML', to: '  if(false){\n    el.innerHTML' },
  { id: 'n13-default-8', why: 'T: the Questions box starts at 8', from: 'const LQ_TOTAL_DEFAULT = 10, ', to: 'const LQ_TOTAL_DEFAULT = 8, ' },
  { id: 'n13-total-not-written', why: 'T: Start writes no totalQ', from: 'limitSec: lqTLimitFor(quizId), totalQ: lqTTotal,', to: 'limitSec: lqTLimitFor(quizId), totalQ: 0,' },
  { id: 'n13-label-plain', why: 'T: the student label drops "of total"', from: "  const key = total ? 'lq.qLabelOf' : 'lq.qLabel', params = total ? { n, total } : { n };", to: "  const key = 'lq.qLabel', params = { n };" }
];
/* H: "Hide names on the projector" (2026-11-13). */
const HIDE_FAULTS = [
  { id: 'h-final-leaks-one', why: 'H: with names hidden, the final scores still name the third row', from: "  const board = rows.slice(0, 10).map(r => lqStageLbRowHtml(r)).join('');", to: "  const board = rows.slice(0, 10).map((r, i) => i === 2 ? lqLbRowHtml(r) : lqStageLbRowHtml(r)).join('');" },
  { id: 'h-lobby-chips', why: 'H: with names hidden, the lobby still draws the name chips', from: "const chips = lqTHideNames ? '' : here.map", to: "const chips = here.map" },
  { id: 'h-no-repaint', why: 'H: ticking the box does not repaint the stage (the names stay until the next snapshot)', from: "  try { localStorage.setItem('gc-lq-hidenames', lqTHideNames ? '1' : '0'); } catch(e){}\n  lqPaintStage();\n", to: "  try { localStorage.setItem('gc-lq-hidenames', lqTHideNames ? '1' : '0'); } catch(e){}\n" },
  { id: 'h-default-on', why: 'H: the box is ticked on a device that never set it', from: "lqTHideNames = localStorage.getItem('gc-lq-hidenames') === '1';", to: "lqTHideNames = localStorage.getItem('gc-lq-hidenames') !== '0';" },
  { id: 'h-uid-attr', why: 'H: a hidden row carries the uid in an attribute', from: "  return `<li><span class=\"lq-lb-rank\">", to: "  return `<li data-u=\"${escAttr(r.uid)}\"><span class=\"lq-lb-rank\">" },
  { id: 'h-reveal-shown', why: 'H: the mc Reveal ignores the box (names stay on the Top 5)', from: "  const board = lqRankedNamed(s).slice(0, 5).map(r => lqStageLbRowHtml(r)).join('');\n  return lqBilingualParams('lq.stageAnswerLabel'", to: "  const board = lqRankedNamed(s).slice(0, 5).map(r => lqLbRowHtml(r)).join('');\n  return lqBilingualParams('lq.stageAnswerLabel'" },
  { id: 'h-strip-box-gone', why: 'H: the strip loses the box during a question', from: "  const full = lqHideNamesInputHtml() + `", to: "  const full = (s && s.state === 'question' ? '' : lqHideNamesInputHtml()) + `" },
  { id: 'h-wrong-points', why: 'H: a hidden row shows the place twice and no points', from: "escHtml(tIn('lq.points', 'en', { n: r.pts || 0 }))", to: "escHtml(tIn('lq.points', 'en', { n: r.rank }))" }
];
const FIX_FAULTS = [
  { id: 'fix-no-canplay', why: 'review R2-5: a Journey page starts the clock (no lqCanPlayHere guard)', from: '  if(!lqCanPlayHere()) return now;\n', to: '', invisible: 'a Journey page has no currentUser global (tabs/journey.js reads firebase.auth().currentUser), so lqUid() is "" there and its clock key never matches the one index.html writes: the uid in the key already keeps the Journey clock out. The guard is a second line of defence; fix-journey-clock below removes both and is red' },
  { id: 'fix-journey-clock', why: 'review R2-5: a Journey page starts the clock (no lqCanPlayHere guard, no uid in the key)', from: "  if(!lqCanPlayHere()) return now;\n  const id = String(live.sessionId) + ':' + Number(live.qIndex) + ':' + lqUid();", to: "  const id = String(live.sessionId) + ':' + Number(live.qIndex);" },
  { id: 'fix-no-session', why: 'review R2-6: the clock key has no sessionId (game 2 reuses game 1)', from: "const id = String(live.sessionId) + ':' + Number(live.qIndex) + ':' + lqUid();", to: "const id = String(Number(live.qIndex)) + ':' + lqUid();" },
  { id: 'fix-no-uid', why: 'review R2-6: the clock key has no uid (a classmate on the same tab inherits it)', from: "const id = String(live.sessionId) + ':' + Number(live.qIndex) + ':' + lqUid();", to: "const id = String(live.sessionId) + ':' + Number(live.qIndex);" },
  { id: 'fix-reverted', why: 'the reload fix undone: a reload restarts the clock (the bug it closed)', from: 'lqQOpenedAt = lqRoundOpenedAt(live);', to: 'lqQOpenedAt = performance.now();' }
];
/* Reveal when time runs out (7c1792e). `more` = further [from, to] pairs planted in the same copy. */
const AUTO_FAULTS = [
  { id: 'ar-no-grace', why: 'the console reveals at 0, without the 1.5 s grace', from: 'limit * 1000 + LQ_AUTO_REVEAL_GRACE_MS - (performance.now() - lqTQOpenedAt)', to: 'limit * 1000 - (performance.now() - lqTQOpenedAt)' },
  { id: 'ar-default-off', why: 'the box is off by default', from: "lqTAutoReveal = localStorage.getItem('gc-lq-autoreveal') !== '0';", to: "lqTAutoReveal = localStorage.getItem('gc-lq-autoreveal') === '1';" },
  { id: 'ar-ignores-off', why: 'the console reveals by itself with the box off', from: "s.state === 'question' && limit && lqTAutoReveal && lqType(", to: "s.state === 'question' && limit && lqType(", more: [["s.state !== 'question' || !lqTAutoReveal || (", "s.state !== 'question' || ("]] }
];
/* Round 3 review (2026-11-12): the reviewer's plants. */
const R3_FAULTS = [
  { id: 'r3-p6-correct-midq', why: 'R3-1: the answer written into the public doc 400 ms into the question (correct)', from: '  lqTAutoKey = key;\n', to: "  lqTAutoKey = key;\n  setTimeout(() => { const q = lqQuiz(s.quizId); if(lqTSession && lqTSession.state === 'question') lqWrite({ correct: lqType(q) === 'pcname' ? lqPcNameOf(s.target) : lqTargetIds(q, s.target)[0] }, 'fields'); }, 400);\n" },
  { id: 'r3-p2b-new-field', why: 'R3-1: the answer in a NEW doc field (autoAnswer) during the question', from: '  lqTAutoKey = key;\n', to: "  lqTAutoKey = key;\n  setTimeout(() => { const q = lqQuiz(s.quizId); if(lqTSession && lqTSession.state === 'question') lqWrite({ autoAnswer: lqType(q) === 'pcname' ? lqPcNameOf(s.target) : lqTargetIds(q, s.target)[0] }, 'fields'); }, 400);\n" },
  { id: 'r3-p1-locked-frets', why: 'R3-2: the right frets under the student\'s "Locked in" pick', from: '<div class="lq-locked-pick" style="background:${bg}">${escHtml(lqFretPickLabel(mine))}</div>`', to: '<div class="lq-locked-pick" style="background:${bg}">${escHtml(lqFretPickLabel(mine))}</div>` + `<p class="lq-note">${escHtml(lqTargetIds(quiz, s.target).join(\' \'))}</p>`' },
  { id: 'r3-p4-board-reversed', why: 'R3-4: the mc Reveal leaderboard reversed (2 players, 20 s, question 2) inside a known case', from: "  const board = lqRankedNamed(s).slice(0, 5).map(r => lqStageLbRowHtml(r)).join('');\n  return lqBilingualParams('lq.stageAnswerLabel'", to: "  let rk = lqRankedNamed(s).slice(0, 5); if(rk.length === 2 && Number(s.limitSec) === 20 && Number(s.qIndex) === 1) rk = rk.reverse();\n  const board = rk.map(r => lqStageLbRowHtml(r)).join('');\n  return lqBilingualParams('lq.stageAnswerLabel'" },
  { id: 'r3-p3-exit-writes', why: 'R3-5: Exit preview writes to the real doc', from: '  lqTPreview = false;\n  lqTSession = lqTReal;\n', to: "  lqTPreview = false;\n  lqTSession = lqTReal;\n  lqDoc().set({ lastPreview: { quizId: lqTPickedQuizId } }, { merge: true });\n" }
];
/* Round 4 (the Fable check of 4175ee9, 2026-11-12): the reviewer's plants and the ones its brief asked for. */
const ANS = "(lqType(lqQuiz(s.quizId)) === 'pcname' ? lqPcNameOf(s.target) : lqTargetIds(lqQuiz(s.quizId), s.target)[0])";
const F4_FAULTS = [
  { id: 'f4-target-fret', why: "F4-1: the right fret added to a fret quiz's public target", from: '  await lqTeacherNext({ string, note });', to: "  await lqTeacherNext({ string, note, fret: Number(lqTargetIds(quiz, { string, note })[0].split(':')[1]) });" },
  { id: 'f4-endedAt', why: 'F4-1: the answer written into endedAt during the question', from: '  lqTAutoKey = key;\n', to: `  lqTAutoKey = key;\n  setTimeout(() => { if(lqTSession && lqTSession.state === 'question') lqWrite({ endedAt: ${ANS} }, 'fields'); }, 400);\n` },
  { id: 'f4-locked-colour', why: 'F4-2: the fret Locked-in pick green when right, red when wrong', from: "const bg = (p && LQ_STRING_COLOR[p.string]) || '#555';", to: "const bg = lqTargetIds(quiz, s.target).includes(mine) ? '#3b6d11' : '#b3372a';" },
  { id: 'f4-locked-tick', why: 'F4-2: a tick or cross (and colour) on the Name Locked-in pick', from: '<div class="lq-locked-pick" style="background:${LQ_PC_NAME_COLOR}">${escHtml(mine)}</div>', to: '<div class="lq-locked-pick" style="background:${mine === lqPcNameOf(s.target) ? \'#3b6d11\' : \'#b3372a\'}">${escHtml(mine)}${mine === lqPcNameOf(s.target) ? \' ✓\' : \' ✗\'}</div>' },
  { id: 'f4-wait-fret', why: 'F4-3: "(fret N)" inside the fret Locked-in wait line', from: "${escHtml(t('lq.lockedWait'))}</div>${err}</div>`\n      + board;", to: "${escHtml(t('lq.lockedWait'))} (fret ${lqTargetIds(quiz, s.target).map(id => id.split(':')[1]).join(' or ')})</div>${err}</div>`\n      + board;" },
  { id: 'f4-taphint', why: "F4-3: the frets inside the unlocked screen's tap hint", from: "return top + `<p class=\"lq-note\" data-i18n=\"${hint}\">${escHtml(t(hint))}</p>` + board;", to: "return top + `<p class=\"lq-note\" data-i18n=\"${hint}\">${escHtml(t(hint))} ${lqTargetIds(quiz, s.target).map(id => id.split(':')[1]).join('/')}</p>` + board;" },
  { id: 'f4-spanish-root', why: "F4-3: in Spanish only, the chord's root after the Name prompt", from: "    + `<div class=\"lq-prompt\" data-i18n=\"${escAttr(quiz.promptKey)}\">${escHtml(t(quiz.promptKey))}</div>`\n    + lqTimerHtml(s);\n  const box", to: "    + `<div class=\"lq-prompt\" data-i18n=\"${escAttr(quiz.promptKey)}\">${escHtml(t(quiz.promptKey))}${t('lq.qLabel', {n: 1}) !== 'Question 1' ? ' (' + escHtml(lqPcNameOf(s.target).slice(0, -1)) + ')' : ''}</div>`\n    + lqTimerHtml(s);\n  const box" },
  { id: 'f4-after-exit', why: 'F4-4: the real board cleared 0.3 s after Exit preview', from: "  lqPaintStage(); lqPaintControls(); lqStageSyncTick(); lqTArmAutoReveal();\n}\n// lqWrite's stand-in", to: "  lqPaintStage(); lqPaintControls(); lqStageSyncTick(); lqTArmAutoReveal();\n  setTimeout(() => { lqTeacherClose(); }, 300);\n}\n// lqWrite's stand-in" },
  { id: 'f4-config-class', why: 'F4-5: the answer written into config/class inside a try/catch', from: '  lqTAutoKey = key;\n', to: `  lqTAutoKey = key;\n  try { lqDb.collection('config').doc('class').set({ lqHint: ${ANS} }, { merge: true }); } catch(e){}\n` }
];
/* Preview (f4fbe4e): the rule in the comment above lqTPreview. */
const PREVIEW_FAULTS = [
  { id: 'pv-writes-real', why: 'a preview write ALSO goes to the real doc (students would be invited)', from: '  if(lqTPreview) return lqPreviewWrite(patch, replace);\n', to: '  if(lqTPreview) lqPreviewWrite(patch, replace);\n' },
  { id: 'pv-survives-real', why: 'a real game going live does not end the preview', from: '        lqTPreview = false;                   // a real game went live: it wins the console\n', to: '' },
  { id: 'pv-no-live-guard', why: 'Preview opens while a real game is live', from: 'if(lqTBusy || lqTPreview || lqTRealIsLive()) return;', to: 'if(lqTBusy || lqTPreview) return;' },
  { id: 'pv-exit-stays', why: 'Exit preview leaves the preview board on the console', from: '  lqTPreview = false;\n  lqTSession = lqTReal;\n', to: '  lqTPreview = false;\n' },
  { id: 'pv-offer-in-lobby', why: "the strip offers Preview during a real game's lobby", from: 'onclick="lqTeacherClose()"${busy}>Cancel</button>${full}`', to: 'onclick="lqTeacherClose()"${busy}>Cancel</button><button type="button" class="lq-ctl ghost" onclick="lqTeacherPreview()"${busy}>Preview</button>${full}`' },
  { id: 'pv-hint-names-chord', why: "the preview hint on the strip (on the projector) names the chord before Reveal", from: 'No student is invited and nothing is saved.</div>` : \'\';', to: 'No student is invited and nothing is saved.${s && s.state === \'question\' && s.target && lqType(lqQuiz(s.quizId)) === \'pcname\' ? \' \' + lqPcNameOf(s.target) : \'\'}</div>` : \'\';' }
];
function prove(dir) {
  dir = resolve(dir);
  const games = ARGS.games ?? 4, jobs = Math.max(1, Number(ARGS.jobs ?? 3));
  const base = readFileSync(join(ROOT, 'live-quiz.js'), 'utf8');
  const all = [...FAULTS.map(f => ({ ...f, set: 'site' })), ...FIX_FAULTS.map(f => ({ ...f, set: 'reload fix' })), ...NOV13_FAULTS.map(f => ({ ...f, set: '2026-11-13' })), ...HIDE_FAULTS.map(f => ({ ...f, set: 'hide names' })), ...PREVIEW_FAULTS.map(f => ({ ...f, set: 'Preview' })), ...AUTO_FAULTS.map(f => ({ ...f, set: 'auto-reveal' })), ...R3_FAULTS.map(f => ({ ...f, set: 'round 3' })), ...F4_FAULTS.map(f => ({ ...f, set: 'round 4' }))];
  const only = ARGS.only ? String(ARGS.only).split(',') : null;
  if (only) { for (const id of only) if (!all.some(f => f.id === id)) { console.log(`live-quiz-loop: ✗ --only: no fault ${id}`); return Promise.resolve(2); } all.splice(0, all.length, ...all.filter(f => only.includes(f.id))); }
  const FAKE = only ? [] : ['rules-off', 'no-order', 'shallow-merge', 'no-local', 'plain-fieldvalue'];
  console.log(`break-it proof on ${ROOT}: ${FAULTS.length} site + ${FIX_FAULTS.length} reload-fix + ${NOV13_FAULTS.length} change-answer/count/total + ${HIDE_FAULTS.length} hide-names + ${PREVIEW_FAULTS.length} Preview + ${AUTO_FAULTS.length} auto-reveal + ${R3_FAULTS.length} round-3 + ${F4_FAULTS.length} round-4 faults planted in copies of its live-quiz.js, + ${FAKE.length} fake-world faults; each run is the default run (known site faults excused narrowly), seed ${SEED}, ${games} random games, ${jobs} at a time`);
  const plans = [{ label: 'baseline: the site as it is (must be GREEN, the two known faults excused)', args: [`--root=${ROOT}`], baseline: true }];
  for (const f of all) {
    const pairs = [[f.from, f.to], ...(f.more || [])];
    const bad = pairs.find(([a]) => base.split(a).length !== 2), n = bad ? base.split(bad[0]).length - 1 : 1;
    if (n !== 1) { plans.push({ label: `${f.id} [${f.set}] — ${f.why}`, skip: `its anchor occurs ${n} times in live-quiz.js (update the fault list)` }); continue; }
    const d = join(dir, f.id);
    mkdirSync(d, { recursive: true });
    writeFileSync(join(d, 'live-quiz.js'), pairs.reduce((t, [a, b]) => t.replace(a, () => b), base));
    for (const x of ['i18n.js', 'guitar-diagrams.js', 'firestore.rules']) writeFileSync(join(d, x), readFileSync(join(ROOT, x)));
    plans.push({ label: `${f.id} [${f.set}] — ${f.why}`, args: [`--root=${d}`], invisible: f.invisible });
  }
  for (const ff of FAKE) plans.push({ label: `fake world: ${ff}`, args: [`--root=${ROOT}`, `--fake-fault=${ff}`] });
  return new Promise(done => {
    let next = 0, running = 0, printed = 0;
    const tryPrint = () => {
      while (printed < plans.length && plans[printed].code !== undefined) {
        const p = plans[printed++], b0 = plans[0];
        if (p.baseline) p.ok = p.code === 0;
        else if (p.code === 1 && b0.sigs) {
          const fresh = [...p.sigs].filter(x => !b0.sigs.has(x));
          p.caught = fresh.length > 0;
          if (!p.caught) p.red = `red only with the baseline's own failures: NOT caught`;
          else { const [c, k] = fresh[0].split('|'); p.red = (p.txtLines.find(l => /✗/.test(l) && l.includes(k) && l.includes(c)) || p.txtLines.find(l => /✗/.test(l) && l.includes(k)) || p.red) + (fresh.length > 1 ? `\n        (+ ${fresh.length - 1} more new failing kind(s): ${fresh.slice(1, 4).join(', ')})` : ''); }
        }
        console.log(`${p.baseline ? (p.ok ? 'GREEN' : 'RED  ') : p.code === 0 ? 'GREEN' : p.code === 1 ? (p.caught ? 'RED  ' : 'SAME ') : p.code === -1 ? 'SKIP ' : `EXIT${p.code}`} ${p.label}${p.s ? ` (${p.s} s)` : ''}${p.red ? `\n        ${p.red.trim().slice(0, 400)}` : ''}${p.skip ? `\n        ${p.skip}` : ''}${p.invisible ? `\n        (expected green, cannot be seen: ${p.invisible})` : ''}`);
      }
    };
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      const baselines = plans.filter(p => p.baseline), faults = plans.filter(p => !p.baseline && !p.invisible);
      const caught = faults.filter(p => p.code === 1 && p.caught).length;
      const green = baselines.every(b => b.ok);
      console.log(`\nbreak-it: baseline ${green ? 'green' : 'NOT green'}; ${caught} of ${faults.length} visible faults turned the tool red (+ ${plans.filter(p => p.invisible).length} the screen cannot reach, listed above)`);
      done(green && caught === faults.length ? 0 : 1);
    };
    const launch = () => {
      while (running < jobs && next < plans.length) {
        const p = plans[next++];
        if (p.skip) { p.code = -1; continue; }
        running++;
        const t0 = Date.now();
        const child = spawn(process.execPath, [SELF, ...p.args, '--quiet', `--seed=${SEED}`, `--games=${games}`], { stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env, LQL_SIGS: '1' } });
        let txt = '';
        child.stdout.on('data', d => { txt += d; }); child.stderr.on('data', d => { txt += d; });
        child.on('exit', code => {
          p.code = code == null ? 3 : code; p.s = ((Date.now() - t0) / 1000).toFixed(1);
          p.sigs = new Set(txt.split('\n').filter(l => l.startsWith('@@sig ')).map(l => l.slice(6)));
          p.txtLines = txt.split('\n');
          p.red = p.txtLines.find(l => /✗/.test(l)) || '';
          running--; tryPrint(); launch();
          if (!running && next >= plans.length) { tryPrint(); finish(); }
        });
      }
      tryPrint();
      if (!running && next >= plans.length) finish();
    };
    launch();
  });
}

/* ════════════════ main ════════════════ */
const SIGS = new Set();
async function main() {
  if (ARGS.list) { for (const k of Object.keys(NAMED)) console.log(k); return 0; }
  const t0 = Date.now();
  try { compileScripts(); loadModelData(); HAS_PREVIEW = /\bfunction lqTeacherPreview\s*\(/.test(src('live-quiz.js')); HAS_RELOAD_FIX = /\bfunction lqRoundOpenedAt\s*\(/.test(src('live-quiz.js')); }
  catch (e) { console.log(`  ✗ R13 error: live-quiz.js / i18n.js / guitar-diagrams.js would not load: ${String(e && e.message || e)}`); if (process.env.LQL_SIGS) console.log('@@sig load|R13 error'); return 1; }
  let fail = 0;
  for (const [ms, speed, limit, want] of POINTS_BY_HAND) {
    const got = modelPoints(ms, speed, limit);
    if (got !== want) { console.log(`  ✗ model: points for ${ms} ms (${speed ? 'speed' : 'flat'}, limit ${limit} s) come out ${got}, worked by hand ${want}`); fail++; SIGS.add('model'); }
  }
  const drift = rulesDrift();
  if (drift) { console.log(`  ✗ fake rules: ${drift}`); fail++; SIGS.add('fake rules'); }
  const pr = await probes();
  const bad = pr.filter(p => !p.ok);
  out(`fake world: ${pr.length - bad.length} of ${pr.length} probes behave like Firestore + firestore.rules${FAKE_FAULT ? ` (fake fault: ${FAKE_FAULT})` : ''}`);
  for (const b of bad) console.log(`  ✗ fake world: ${b.name} — the fake no longer behaves like the real thing`);
  fail += bad.length;
  for (const b of bad) SIGS.add(`fake world|${b.name}`);
  const allowKnown = new Set(ARGS.strict ? [] : Object.keys(KNOWN_SITE_FAULTS).filter(k => KNOWN_SITE_FAULTS[k].modes.includes(MODE)));
  out(`site: ${ROOT === REPO ? 'this checkout' : ROOT} — Preview (lqTeacherPreview): ${HAS_PREVIEW ? 'yes' : 'NO'}; reload fix (lqRoundOpenedAt): ${HAS_RELOAD_FIX ? 'yes' : 'NO'}${HAS_PREVIEW && HAS_RELOAD_FIX ? '' : '. The tool expects both (main with f4fbe4e and the reload fix): on this tree the Preview cases fail and, without the fix, so do the reload cases (that is the bug the fix closes; --reload-clock=tab shows the rest)'}`);
  const want = ARGS.case ? [String(ARGS.case)] : [...Object.keys(NAMED), ...Array.from({ length: GAMES }, (_, k) => `game-${k}`)];
  if (allowKnown.size) out(`known site faults, excused narrowly (--strict shows them): ${[...allowKnown].map(k => `${k} (${KNOWN_SITE_FAULTS[k].why})`).join('; ')}`);
  const knownCount = {};
  process.on('unhandledRejection', e => { if (CURRENT) CURRENT.flag('R13 error', `unhandled rejection: ${String(e && e.message || e)}`); });
  const tot = { cases: 0, students: 0, tabs: 0, reloads: 0, writes: 0, accepted: 0, rejected: 0, gets: 0, deliveries: 0, taps: 0, tapsAccepted: 0, tapsRefused: 0, checks: 0, timerChecks: 0, stageChecks: 0, events: 0 };
  const allFlags = [], cov = {}, crashes = [];
  const acc = { auto: { n: 0, refused: 0, late: 0 }, click: { n: 0, refused: 0, late: 0 }, join: { n: 0, cut: 0, auto: 0 } };
  for (const name of want) {
    const spec = NAMED[name] ? NAMED[name]() : (/^game-(\d+)$/.exec(name) ? randomSpec(Number(/^game-(\d+)$/.exec(name)[1])) : null);
    if (!spec) { console.log(`live-quiz-loop: no case ${name} (--list)`); return 1; }
    let w;
    try { w = await runCase(spec); }
    catch (e) {
      if (e instanceof Hang) { console.log(`live-quiz-loop: ✗ HUNG in ${name}: ${e.message}, last step "${CURRENT.where}"`); return 3; }
      console.log(`live-quiz-loop: ✗ the TOOL crashed in ${name}: ${e && e.stack || e}`); return 2;
    }
    for (const [k, n] of Object.entries(w.cov)) cov[k] = (cov[k] || 0) + n;
    crashes.push(...w.crashes.map(c => `${name}: ${c}`));
    tot.cases++; tot.students += spec.students.length; tot.tabs += w.stats.tabs; tot.reloads += w.stats.reloads;
    for (const k of ['writes', 'accepted', 'rejected', 'gets', 'deliveries']) tot[k] += w.fs.stats[k];
    for (const k of ['taps', 'tapsAccepted', 'tapsRefused', 'checks', 'timerChecks', 'stageChecks']) tot[k] += w.stats[k];
    tot.events += w.loop.count;
    for (const k of Object.keys(acc)) for (const x of Object.keys(acc[k])) acc[k][x] += w.acc[k][x];
    const cats = {};
    for (const f of w.flags) cats[f.cat] = (cats[f.cat] || 0) + 1;
    out(`${w.flags.length ? '✗' : '✓'} ${name.padEnd(28)} ${spec.quizId.padEnd(12)} ${spec.speed ? 'speed' : 'flat '} limits ${spec.limits.join('/')} s, ${spec.students.length} students, ${w.stats.reloads} reloads, ${w.stats.taps} taps, ${w.stats.checks} checks${w.flags.length ? ` — ${w.flags.length} failed: ${Object.entries(cats).map(([c, n]) => `${c} ×${n}`).join(', ')}` : ''}`);
    if (VERBOSE) { if (spec.note) out(`  (${spec.note})`); for (const l of w.lines) out(l); }
    for (const f of w.flags) {
      const kn = KNOWN_SITE_FAULTS[name];
      if (kn && allowKnown.has(name) && knownExcuses(kn, f)) { knownCount[name] = (knownCount[name] || 0) + 1; continue; }
      allFlags.push({ ...f, name });
    }
    const kn = KNOWN_SITE_FAULTS[name];
    if (kn && kn.modes.includes(MODE)) {
      const sig = w.flags.filter(f => f.cat === kn.sig && f.msg.includes(kn.student)).length;
      if (!sig) { console.log(`  ✗ known site fault ${name} no longer shows its sign (${kn.sig} for ${kn.student}): fixed? remove it from KNOWN_SITE_FAULTS (${kn.why})`); fail++; SIGS.add(`known gone|${name}`); }
      else if (allowKnown.has(name)) out(`  (known site fault ${name}: ${knownCount[name] || 0} failing checks excused, ${sig} of them its sign "${kn.sig}")`);
    }
  }
  CURRENT = null;
  const namedRun = want.filter(n => NAMED[n]).length;
  out(`\ncases run: ${tot.cases} (${namedRun} named + ${tot.cases - namedRun} random games), seed ${SEED}, reload clock: ${MODE}`);
  out(`students: ${tot.students}; browser tabs: ${tot.tabs} (${tot.reloads} reloads); events: ${tot.events}`);
  out(`Firestore: ${tot.writes} writes (${tot.accepted} committed, ${tot.rejected} refused by the rules), ${tot.gets} read-backs, ${tot.deliveries} snapshots delivered`);
  out(`taps: ${tot.taps} (${tot.tapsAccepted} took, ${tot.tapsRefused} did not)`);
  out(`checks compared: ${tot.checks} (${tot.stageChecks} stage paints, ${tot.timerChecks} countdown repaints); failed: ${allFlags.length}`);
  out(`accepted, counted (Jonathan 2026-11-12: a Reveal may come before a slow or late student's own time is up): in-time taps lost to an AUTOMATIC Reveal: ${acc.auto.refused} refused + ${acc.auto.late} "too late" of ${acc.auto.n} in-time taps in auto-revealed rounds; to a teacher's Reveal click: ${acc.click.refused} + ${acc.click.late} of ${acc.click.n}; late joiners whose own clock the Reveal cut short: ${acc.join.cut} of ${acc.join.n} (${acc.join.auto} by an automatic Reveal)`);
  out(`coverage: ${COVERAGE.map(([k]) => `${k} ${cov[k] || 0}`).join(' · ')}`);
  if (!ARGS.case) for (const [k, label] of COVERAGE) if (!cov[k]) { console.log(`  ✗ coverage: ${label}: 0 — this rule was never exercised in a full run`); fail++; SIGS.add(`coverage|${k}`); }
  if (allFlags.length) {
    const by = new Map();
    for (const f of allFlags) { if (!by.has(f.cat)) by.set(f.cat, []); by.get(f.cat).push(f); }
    console.log('\nFAILED (grouped; replay one case with --case=<name> --seed=' + SEED + ' --verbose):');
    for (const [cat, fs] of by) {
      console.log(`  ✗ ${cat} ×${fs.length} — ${fs[0].name} at ${(fs[0].t / 1000).toFixed(3)} s: ${fs[0].msg}`);
      for (const f of fs.slice(1, 3)) console.log(`      also ${f.name} at ${(f.t / 1000).toFixed(3)} s: ${f.msg}`);
    }
    const cases = [...new Set(allFlags.map(f => f.name))];
    console.log(`  failing cases (${cases.length}): ${cases.join(', ')}`);
    console.log(`  replay: node tools/live-quiz-loop.mjs --seed=${SEED} --case=${cases[0]} --verbose${MODE === 'tab' ? ' --reload-clock=tab' : ''}`);
  }
  console.error(`live-quiz-loop: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (DUMP) for (const [k, v] of DUMP) console.log(`DUMP ${k}:\n  ${[...v].sort().join('\n  ')}`);
  if (crashes.length) { console.log(`live-quiz-loop: ✗ the TOOL crashed ${crashes.length} time(s); first: ${crashes[0]}`); return 2; }
  for (const f of allFlags) SIGS.add(`${f.name}|${f.cat}`);
  if (process.env.LQL_SIGS) for (const x of [...SIGS].sort()) console.log(`@@sig ${x}`);
  return (fail || allFlags.length) ? 1 : 0;
}
function supervise() {
  return new Promise(res => {
    const child = spawn(process.execPath, [SELF, ...process.argv.slice(2)], { env: { ...process.env, LQL_CHILD: '1' }, stdio: ['ignore', 'inherit', 'pipe'] });
    let last = Date.now(), where = 'starting', buf = '';
    child.stderr.on('data', d => {
      buf += d.toString();
      let i;
      while ((i = buf.indexOf('\n')) >= 0) {
        const line = buf.slice(0, i); buf = buf.slice(i + 1);
        if (line.startsWith('@@beat ')) { last = Date.now(); where = line.slice(7); } else process.stderr.write(line + '\n');
      }
    });
    const dog = setInterval(() => {
      if (Date.now() - last > STALL_MS) {
        clearInterval(dog); child.kill('SIGKILL');
        console.log(`live-quiz-loop: ✗ HUNG — no progress for ${STALL_MS / 1000} s. Stuck in ${where}`);
        res(3);
      }
    }, 500);
    child.on('exit', code => { clearInterval(dog); res(code == null ? 3 : code); });
  });
}
(process.env.LQL_CHILD || ARGS.list || ARGS.prove ? (ARGS.prove && !process.env.LQL_CHILD ? prove(String(ARGS.prove)) : main()) : supervise()).then(code => process.exit(code), e => { console.log(`live-quiz-loop: ✗ the TOOL crashed: ${e && e.stack || e}`); process.exit(2); });
