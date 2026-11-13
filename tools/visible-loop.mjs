#!/usr/bin/env node
/* visible-loop.mjs — closed loop: which In-Class Activities a student sees and which ones block (2026-11-11).

   The question it answers. For a class config, a day, a student and a run of config reads that succeed, fail or
   come back empty: do the student app, the teacher console and the Song Journey pages AGREE on which activities a
   student sees and which ones block, and is that the answer the written rules give? And after a console change
   (a date, Hide, Who, Optional, Move to Songs, Archive / Delete, Play Along now, Clear, Clear all, a period
   override / CAS, Open through, class games, a board move), what does a student page show: one loaded BEFORE the
   change (before and after its tab comes back) and a fresh load?

     node tools/visible-loop.mjs                       60 cases, seed 1
     node tools/visible-loop.mjs --cases 400 --seed 7
     node tools/visible-loop.mjs --case 12 --verbose   replay one case alone, with a trace
     node tools/visible-loop.mjs --root <site folder>  run the code of another checkout (break-it copies)
     node tools/visible-loop.mjs --break-fake merge    self-test: the fake Firestore replaces maps instead of merging
     node tools/visible-loop.mjs --break-fake clock    self-test: the pages get the REAL clock, not the virtual day
   Exit 0 = every comparison held; 1 = a contradiction (each prints its seed, case and step); 3 = the watchdog
   (nothing moved for 120 s; it prints the step it was on). The time taken goes to stderr, so the same seed prints
   the same stdout byte for byte. The default 60 cases: 16 s alone, about 70 s beside two other runs (2026-11-12). Node only:
   no browser, no network, no Firebase.

   When to run it: after a change to any of the visibility / blocker / optional rules (caIsVisible, caIsOptional,
   caBlockers, caReduceForMe, caBoardOrder in app/activities-2.js; teacherActivityVisible, teacherBlockersFor,
   teacherActivityOptional, teacherBoardView in teacher-config.js / teacher-activities.js; journeyIsVisible,
   journeyOptional, journeyBlockers in tabs/journey.js), to loadClassConfig / restoreClassConfigFromCache /
   classConfigSignature (app/save.js, app/activities-2.js), or to a console writer of config/class. It is not part
   of tools/checks.mjs (check 1ah compares the three copies by source text only; this runs them).

   ── What is REAL (loaded whole and unmodified into Node vm contexts) ──
   * Student page: config-main.js, class-activities.js, i18n.js, guitar-diagrams.js, then the whole app script
     (siteSource('app.js'): every app/*.js part in index.html order). Boot = the real loadProgress() then
     loadClassConfig() (what start.js's sign-in callback runs), then the real showApp() from a start address
     (bare, #songs, #my-progress, a lesson, #class-activities/ca-N, #live-quiz; sometimes from a Song Journey page,
     sometimes the update reload's note), with renderAll and swResumeApply stubbed (they need a rendered lesson).
     It routes through the real routeExploreHash / goExploreHash on a history stub that moves location.hash.
     A tab return fires the real visibilitychange listener.
     Probed: caIsVisible, caIsOptional, caBlockers, caIsPlayAlongOnly, caNumber, periodOverride,
     moduleOpenThrough, gamesAccessOn, the Games button's display, body.ca-gated, classConfigSignature(); at each
     sign-in also location.hash after showApp (the landing), caStartHereId after the real renderClassActivities
     (the first card), whether maybeShowPeriodPicker asked, and, for a student with an unfinished required
     activity, the address after goExploreHash to another page (the router does not lock).
     Student events through the real code: marking a card complete (onClassActivityChange, the data half of
     caToggleComplete, then the real flushSave() that a tab hide runs) and picking CAS (periodPick('CAS')); the
     progress doc they write is checked, and the console re-reads the roster (teacherFetchStudents) after each.
   * Console: the same base scripts with ?teacher=true, then the whole console (siteSource('teacher.js')).
     Boot = the real teacherFetchStudents() + loadTeacherClassConfig() + teacherApplyRosterFilter(). Changes go
     through the real writers: teacherSetActivityDate, teacherSetActivityHidden, teacherSetActivityStudent,
     teacherSetActivityWholeClass, teacherSetActivityOptional, teacherSetSongPlace, teacherSetClassSong,
     teacherSetActivityArchived, teacherDeleteActivity, teacherSetActivityPlayAlong, teacherSetActivityClear,
     teacherClearAllBlockers, teacherSetStudentPeriod, teacherSetStudentOpenThrough, teacherSetClassGames,
     teacherSetStudentGames, teacherMoveActivity, teacherUnassignActivity — all through the real
     teacherWriteConfig(). Probed: teacherActivityVisible, teacherActivityOptional, teacherBlockersFor,
     teacherBoardView(cfg).number.
   * Journey page: class-activities.js + tabs/journey.js. Probed: journeyIsVisible, journeyOptional,
     journeyBlockers, given the config and progress docs the page would read.

   ── What is FAKE ──
   * Firestore: config/class and progress/{uid} in memory. A read succeeds (a copy of the doc at that moment),
     fails (rejects), or comes back empty (doc missing), per a plan the case draws; a read can be HELD so the tool
     can look at the page while it is out. Transactions are single-client: get, then set with merge. Merge
     semantics (Firestore's documented set-with-merge): nested maps merge key by key, FieldValue.delete() removes a
     key, arrays and scalars replace, an empty map in a merge replaces (as checks.mjs 1bw / 1bo encode it).
   * The clock: every page's Date is a subclass whose `new Date()` / `Date.now()` is the virtual instant. The
     process runs in America/Los_Angeles (TZ) and the day list holds PST and PDT instants on both sides of
     midnight (and the two daylight-saving changes), so a fixed-offset day is caught in either half of the year.
   * localStorage: one object per Chromebook, shared by every page loaded on it (uid B after uid A). A sign-out or
     another student's sign-in reloads the page (app/start.js), so each sign-in is a fresh page here.
   * The DOM: a stub. #class-activities-screen and #songs-screen are hidden (the page renders nothing); timers
     never fire; alert() is recorded (any alert in this single-console world is a failure).
   * Names: three made-up students (stu-alpha / -bravo / -charlie, "Test Student A/B/C", @example.test), a new
     student with no progress doc yet (stu-delta), a teacher account teacher@example.test, and two special users:
     'dev-user' (dev bypass) and a student signed in with the teacher's email (a gate previewer).
   * Rounds: one to three console changes land before the open page's tab comes back. Change kinds rotate so each
     runs at least 15 times in a full run (a floor that fails); three quarters of Archive / Delete aim at a card that
     holds Hidden or Who, a rename or a pin, or Optional or Play Along (floors: at least 5 each on a Hidden or Who card
     and 5 each on a renamed or pinned card).

   ── NOT modelled ──
   The rail repaint after an Open-through change (repaintModuleGate needs a rendered rail; only the value is
   compared);
   the two-console write race (tools/two-consoles-loop.mjs); screens and renders (only predicates and the
   values they read: no probe reads rendered markup, so how the activity list is laid out — module folds, counts,
   carets — cannot change a result here; only a render that throws would); the Journey "sentHere" exemption
   (page-level, and unreachable while JOURNEY_GATE_LOCKS is false); Today's activities (check 1cq); pins; renames; the legacy activityNumbers overrides (generated empty);
   the real update reload's restore (swResumeApply, stubbed); Pause; the Firestore listener-free console reading another console's writes; a failed read by the console
   (its views refuse to draw); the dev bypass's boot path beyond "no reads at boot".

   ── The independent answer: the RULES the model is written from (it never calls the code under test) ──
   Each rule names its source. "Taken from the code, no prose" marks the few details no comment or skill states;
   those are the model's weakest points, and a change there needs a word from Jonathan, not just a green run.
   R1  Visible, in this order (skill in-class-activities, "Activity order, numbering and the board": "Not
       archived/deleted + assigned + not Hidden + given to this student + dated-and-arrived is the full rule, in
       that order; the dev bypass skips only the date"; caIsVisible's comment): archived or deleted -> no; not on
       the board -> no; Hidden -> no; given to other students only (Who) -> no; dev bypass -> yes; else the release
       date has arrived ('YYYY-MM-DD' <= today, "local calendar day", caIsVisible's comment). No date -> no.
   R2  "On the board": a seeded board (activityBoardSeeded true) assigns exactly the cards with a board entry; an
       UNSEEDED board assigns every card (caIsVisible's comment: "never lock on a guess"). A Songs-page card and a
       teacher-only card not moved to Class activities are never assigned, whatever row they left (skill, Songs
       table: "Off the board"; teacher-console.md "a card moved to Songs or Teacher view songs keeps its board
       slot"). Which cards are songs (skill, Songs table): "any non-check card with a `library` field ... is a
       song"; the console's songLibrary map "wins over the field"; never a card tied to a Song Journey page, a
       whole-song card or a lyric sheet (the comment above caIsSongCard: "anything tied to a Song Journey page, a
       whole-song card or a lyric sheet is out").
   R3  Who (the comment above caReduceForMe; skill "Individual activities" via the board's Who picker): a card
       whose activityStudents entry ticks anyone (true) is only for the ticked uids; none ticked = whole class.
   R4  Optional (skill "Optional activities" and "CAS students"; caOptionalByDefault's comment, 2026-10-14): a CAS
       student (effective period = the teacher's override || the student's own answer) -> every card; else the
       console flag true/false wins; else Optional by default when the data says `optional: true` or the card has
       a Who list. The console and the Journey pages fold CAS into their blocker rule instead.
   R5  Blocks = visible, not optional, not done (classActivities[id] === true), not cleared for this uid (skill
       "The gate, as it runs when switched on"). Never for a gate previewer (dev bypass, the teacher's email) and
       never after a failed progress load ("never lock on a guess"). A card the student marks complete stops
       blocking at once, and picking CAS lifts every blocker (skill: "Picking CAS re-runs applyActivityGate()").
       A student with no progress doc yet is gated like anyone else (skill: "A student who hasn't picked a period
       yet is gated like anyone else"; save.js: "A brand-new student (no doc) and a failed read start from the
       same empty state" — the empty STATE, not the failed-load flag).
   R6  The LOCK is off (Jonathan 2026-10-07, CA_GATE_LOCKS / JOURNEY_GATE_LOCKS; 2026-11-12: "the class
       activities aren't meant to block anyone anymore"): body.ca-gated is never set, JOURNEY_GATE_LOCKS reads
       false on the Journey page, and a student with an unfinished required activity who asks the router for
       another page gets it.
   R13 The landing (showApp's comment; Jonathan 2026-11-12: "they are meant to show up on first login", and, asked,
       keep today's rule): every signed-in page load ends on In-Class Activities when the address is bare (it is the
       home page) or when the student has an unfinished required activity (R5), EXCEPT the site's own update reload
       (the note's address is kept), arriving from a Song Journey page, and a #class-activities or #live-quiz
       address. Compared by page (a deep link's tail is the router's to resolve).
   R14 The first card, caStartHereId (Jonathan 2026-11-12, "required and unfinished first"): a card this student
       sees, not finished and not cleared for them; a required one whenever any such required card exists, the
       newest-dated of them; else the newest-dated optional one; null when none is left. (Which of several cards
       with the same newest date: not judged.)
   R15 The period question at sign-in (maybeShowPeriodPicker's comments): asked when the student has no answer of
       their own and no teacher override; never for the dev bypass or the teacher's email, never after a failed
       progress load ("never ask a question we can't save the answer to").
   R7  Play Along now (skill; caIsPlayAlongOnly's comment: "The switch stands in for the RELEASE DATE and nothing
       else"): a practice card (view 'card') with the flag that would be visible but for its date — assigned, not
       Hidden, not retired, given to this student — and is not already visible is reachable from Songs only. A
       Songs-page song is reachable when not Hidden, not retired and not visible ("Who does not hide it"). The
       flag never makes a card visible or blocking.
   R8  #N (caBoardOrder's comment; skill "Activity order, numbering and the board"): Unsorted (module 0) first,
       then MODULE_MANIFEST order, then modules the manifest does not know in numeric order ("lands after the known
       modules, in numeric order"); inside a module by pos, then the legacy number, then the id's number (the
       comment in teacherBoardModuleIds: "pos, then the legacy number, then the id"); 1..N over the non-check,
       non-retired cards with no gaps. Unseeded: everything in one Unsorted run "in the order students are reading
       today" — the shipped `number`, then the id (that tie-break: taken from the code, no prose).
   R9  A failed or empty config read (save.js comments on each cached field; restoreClassConfigFromCache's
       comment: "A student who has NEVER loaded config sees no activities"):
       * the whole-class fields (dates, board, hidden, retired, clears, optional, Play Along, songs, classSongs)
         come from the last successful read on this Chromebook ("falls back to the last successfully loaded copy
         in localStorage");
       * the period override and Open through are the student's OWN last successful read: a CAS override "must
         not fail open to ''" (save.js:254-259), Open through "fails open from cache ... never reset to 0 on a
         failed read" (skill), and "on a shared Chromebook the next student must not inherit the last one's"
         (save.js:258-259). A student with no read of their own gets none / 0;
       * the Who cards: "the cache carries the uid ... the next student gets every individual card read as someone
         else's" (save.js:331-337). For the student whose own read the cache holds, its cached answers (that exact
         shape: taken from the code, no prose);
       * games: a failed read at SIGN-IN leaves games on (the declared default); a failed tab-return read keeps the
         last value (settled 2026-11-12: intended; the save.js:225 docstring "leave games ON" is stale).
   R10 Games: a per-student override wins, else the class switch, else ON (save.js:220-226). Open through: only a
       whole number 2..12 counts (save.js:262-263; skill "N = 2..12"). Period: the override, else none.
   R11 A console writer changes exactly the cells it names (each writer's comment; skill "Archive / Delete",
       "Per-student clears", "Optional activities", "Play Along now", Songs table), bumps configVersion by one, and
       its in-memory copy then equals the doc. Board moves re-pack pos 1..N in the module left and the module
       joined, archived rows keeping their slot (skill: "re-packs pos 1..N in both"; "An archived card keeps its
       slot"); a card moved to position k lands at min(k, N) and Songs-page / teacher-only rows are left as they
       are (both taken from the code, no prose). Delete takes off the board entry, date, rename, clears, pin,
       Optional and Play Along flags, Hidden, Who and the legacy number (skill: "Delete wipes all of that"; the
       confirm text: "it comes back blank"; settled 2026-11-12). Archive keeps all but the pin. Clear all clears
       exactly the student's current blockers ("Recomputed at click time").
   R12 WHEN a change reaches a student (truth table, printed at the end): loadClassConfig "reruns on every
       tab-visibility return" (save.js:228-231); "A teacher's console clear (or a new activity going live) has to
       reach a student tab that's just sitting open" (activities-2.js:1208-1212); games on tab return
       (save.js:367-370). So: an open page does not change before its tab comes back; after a successful
       tab-return read it shows the answer for the doc as it is then, however many changes landed meanwhile (and
       its classConfigSignature moves whenever that answer moved, or the open screen is not repainted); after a
       FAILED tab-return read it keeps the old answer; a fresh load shows the new answer. During the read the page
       keeps showing the last known answer (save.js:228-238, the blank window found 2026-09-26).
   Not exercised (round-2 review R2-6): board ties on a seeded board (the writers always re-pack 1..N, so R8's
   "pos, then the legacy number, then the id" runs only on the unseeded board); a student un-marking a card.
   Still not stated, measured only: when an already-open Journey page picks up a change (journey.js has no
   tab-return re-read; it decides once per load, and the lock is off).
   Stale text, reported in one line each, not judged: the save.js:225 games docstring (R9) and the console's
   games note, teacher-config.js:420, "the next time a student loads the site" (the code applies games on tab
   return; settled 2026-11-12: the console text is stale).

   ── KNOWN: faults this tool found, listed for Jonathan, not fixed ──
   A contradiction that matches a KNOWN entry exactly — the same rule, the same shape of sequence, and the code's
   answer equal to the one the entry describes, field for field — prints as "known, listed <date>" and does not
   fail. Anything else fails. A full run (no --case, 60 cases or more) in which an entry matched nothing FAILS,
   so a fixed fault cannot leave its entry behind: delete the entry in the same change as the fix.
   K1 (listed 2026-11-12) R9 own last read. Shape: a fresh sign-in whose config read fails or comes back empty,
      on a Chromebook whose per-uid cache now holds ANOTHER student, by a student who read OK on it earlier with
      a different period override or Open through. The code gives no override and Open through 0 (the cache
      keeps one student; restoreClassConfigFromCache restores only a matching uid). What the student sees: a
      teacher-set CAS student loses the exemption (cards lose the Optional tag, lands on In-Class Activities); a
      student corrected away from CAS becomes exempt; modules opened by Open through lock again; a student whose
      period only the teacher set is asked the period question, which covers the whole app (R15, measured: the K1
      state includes it); a 4th / 7th override is lost, so that session's practice minutes count under the
      student's own answered period (app/boot.js PM_HOST.period; not probed). Ends at the next good read.

   --root wants a folder holding index.html, app/, the teacher-*.js parts, class-activities.js, config-main.js,
   i18n.js, guitar-diagrams.js and tabs/journey.js (a full checkout works).

   ── Break-it record (re-run 2026-11-12 on a9836dc's site; each a scratch COPY run with --root, 60 cases, all exit 1;
      count = contradictions) ──
   B1  journeyIsVisible forgets "not on the board" (the 2026-09-16 bug)          882
   B2  teacherActivityVisible forgets "not on the board" (2026-09-16)           1974
   B3  teacherActivityVisible reads the raw board row (063508e)                  1454
   B4  journeyIsVisible ignores Move to Songs / Teacher view songs (063508e)      804
   B5  loadClassConfig blanks its globals before the read (2026-09-26 window)     161
   B6  restoreClassConfigFromCache: the next student inherits the CAS override     18
   B7  the Who cache ignores its uid (save.js:331)                                  45
   B8  games not applied on tab return (save.js:369)                                11
   B9  Hidden fails open to {} on a failed read                                    157
   B10 journeyBlockers ignores the teacher's period override                        94
   B11 caIsVisible: release date one day late (< for <=)                          2004
   B12 teacherBlockersFor counts on the UTC day                                    293
   B13 hiddenActivityIds left out of classConfigSignature                            1  (thin: one hide in 60 cases)
   B14 teacherActivityOptionalByDefault forgets Who                                665
   B15 Delete does not re-pack the module it leaves                                 30
   B16 Clear all also clears Optional cards                                         17
   Round-1 review (2026-11-12):
   N1  dayStr and journeyDayStr on a fixed UTC-8 offset (wrong on PDT evenings)    317
   N2  loadClassConfig ignores a read whose configVersion jumped by more than 1    131
   N3  K1 stays narrow: the Who cache ignores its uid                               45
   N4  K1 fixed (per-uid cache keys) but its entry left behind: "matched nothing"     1
   N12 K1 stays narrow: the override is never restored, even for its own student    18
   N13 K1 stays narrow: Open through from cache read as 0 for its own student       21
   N5  caIsPlayAlongOnly forgets Who                                                97
   N6  Delete keeps Who and Hidden (patch and copy alike)                            7
   N7  caBoardOrder sorts modules >= 7 by id number                               1367
   N8  the per-kind floor raised to 30 (tool copy): "date ran 24 times"             18
   N8b the Hidden-or-Who floor raised to 40 (tool copy)                              2
   N9  marking complete does not set classActivities                               427
   N10 picking CAS is not saved                                                     84
   N11 a missing progress doc reads as a failed load                               353
   M2  caIsVisible lets the teacher's email skip the date                           10
   M3  Delete keeps Who in the console's copy only                                  24
   M5  caOptionalByDefault: a Who card given to me blocks                          702
   M6  clears restored only for the period-override slot's student                  23
   M7  Open through 12 rejected (< 12)                                              34
   Fake-world self-tests: --break-fake merge (maps replaced, not merged) 1547 and --break-fake clock (pages on the
   real clock) 1949, both exit 1. */
process.env.TZ = 'America/Los_Angeles';
import vm from 'node:vm';
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteText, siteSource } from './site-src.mjs';

const T_START = Date.now();
const HERE = dirname(fileURLToPath(import.meta.url));
const ARGV = process.argv.slice(2);
const argVal = (name, dflt) => { const i = ARGV.indexOf(name); return i >= 0 && i + 1 < ARGV.length ? ARGV[i + 1] : dflt; };
const ROOT = resolve(argVal('--root', join(HERE, '..')));
const SEED = Number(argVal('--seed', '1'));
const CASES = Number(argVal('--cases', '60'));
const ONE_CASE = ARGV.includes('--case') ? Number(argVal('--case', '0')) : null;
const VERBOSE = ARGV.includes('--verbose');
const BREAK_FAKE = argVal('--break-fake', '');
const STALL_MS = 120000;
if (!existsSync(join(ROOT, 'index.html'))) { console.error(`visible-loop: no index.html in ${ROOT}`); process.exit(1); }
if (BREAK_FAKE && !['merge', 'clock'].includes(BREAK_FAKE)) { console.error('visible-loop: --break-fake takes merge or clock'); process.exit(1); }

/* ── Watchdog: exit 3 when no step has started for STALL_MS ── */
let lastStep = 'start', lastTick = Date.now();
const step = s => { lastStep = s; lastTick = Date.now(); if (VERBOSE) console.log('  · ' + s); };
const watchdog = setInterval(() => {
  if (Date.now() - lastTick > STALL_MS) {
    console.log(`visible-loop: ✗ HUNG — nothing moved for ${STALL_MS / 1000} s. Stuck at "${lastStep}"`);
    process.exit(3);
  }
}, 5000);

/* ── Sources, compiled once ── */
const SCRIPTS = {
  base: ['config-main.js', 'class-activities.js', 'i18n.js', 'guitar-diagrams.js'].map(f => new vm.Script(siteText(f, ROOT), { filename: f })),
  app: new vm.Script(siteSource('app.js', ROOT), { filename: 'app.js (all parts)' }),
  teacher: new vm.Script(siteSource('teacher.js', ROOT), { filename: 'teacher.js (all parts)' }),
  ca: new vm.Script(siteText('class-activities.js', ROOT), { filename: 'class-activities.js' }),
  journey: new vm.Script(readFileSync(join(ROOT, 'tabs/journey.js'), 'utf8'), { filename: 'tabs/journey.js' }),
};
const PRELUDE = new vm.Script(`(function(){
  var RealDate = Date;
  class FakeDate extends RealDate {
    constructor(...a){ if(a.length === 0) super(__vnow()); else super(...a); }
    static now(){ return __vnow(); }
  }
  globalThis.Date = FakeDate;
})();`);

/* ── The DATA the model reads (data files only — no code under test) ── */
const DATA = (() => {
  const c = { console: { log() {}, warn() {} } };
  c.window = c;
  vm.createContext(c);
  vm.runInContext(siteText('config-main.js', ROOT) + '\n;globalThis.__MANIFEST = MODULE_MANIFEST;', c, { filename: 'config-main.js' });
  vm.runInContext(siteText('class-activities.js', ROOT), c, { filename: 'class-activities.js' });
  return { acts: JSON.parse(JSON.stringify(c.window.CLASS_ACTIVITIES)), manifest: c.__MANIFEST.map(m => m.num) };
})();
const ACTS = DATA.acts;
const ACT = Object.fromEntries(ACTS.map(a => [a.id, a]));
const IDS = ACTS.map(a => a.id);

/* ── Helpers ── */
const clone = x => (x === undefined ? undefined : JSON.parse(JSON.stringify(x)));
function mulberry32(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const caseSeed = (seed, idx) => (Math.imul(seed + 1, 2654435761) ^ Math.imul(idx + 1, 40503)) >>> 0;
const flush = async (n = 6) => { for (let i = 0; i < n; i++) await new Promise(r => setImmediate(r)); };
const sortU = a => [...new Set(a)].sort();
const canon = v => {
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  return '{' + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
};
/* Empty maps and configVersion carry no meaning for a student: an absent map and {} read the same everywhere. */
function normDoc(d) {
  const strip = v => {
    if (!v || typeof v !== 'object' || Array.isArray(v)) return v;
    const o = {};
    for (const k of Object.keys(v)) { const s = strip(v[k]); if (s && typeof s === 'object' && !Array.isArray(s) && !Object.keys(s).length) continue; if (s !== undefined) o[k] = s; }
    return o;
  };
  const o = strip(clone(d) || {});
  delete o.configVersion;
  return o;
}

/* ════════════════════════════════════════════════════════════════════════════
   THE MODEL — written from the rules R1..R12 in the header. It reads the config doc, the progress doc and the
   activity DATA; it calls nothing from the site's scripts. (Independence grep: the block between the two
   MODEL markers names no function of the code under test (no ca..., teacher..., journey... name, loadClassConfig, restoreClassConfigFromCache or dayStr).
   ════════════════════════════════════════════════════════════════════════════ */
/* MODEL-BEGIN */
const TZ_FMT = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', year: 'numeric', month: '2-digit', day: '2-digit' });
function modelToday(ms) { return TZ_FMT.format(new Date(ms)); }
function modelAddDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.getUTCFullYear() + '-' + String(t.getUTCMonth() + 1).padStart(2, '0') + '-' + String(t.getUTCDate()).padStart(2, '0');
}
const mMap = (d, k) => (d && d[k] && typeof d[k] === 'object') ? d[k] : {};
function mIsSongCard(a) {
  return (a.library === true || a.library === false) && a.kind !== 'check' && !a.journey && !(a.card && (a.card.wholeSong || a.card.sheet));
}
function mOnSongs(a, d) {
  if (!mIsSongCard(a)) return false;
  const v = mMap(d, 'songLibrary')[a.id];
  return typeof v === 'boolean' ? v : a.library === true;
}
function mTeacherOnly(a, d) { return a.teacherOnly === true && mMap(d, 'classSongs')[a.id] !== true; }
function mRetired(a, d) { return mMap(d, 'archivedActivities')[a.id] === true || mMap(d, 'deletedActivities')[a.id] === true; }
function mAssigned(a, d) {
  if (mOnSongs(a, d) || mTeacherOnly(a, d)) return false;
  if (d.activityBoardSeeded !== true) return true;
  return !!mMap(d, 'activityBoard')[a.id];
}
function mTicked(d, id) {
  const who = mMap(d, 'activityStudents')[id];
  if (!who || typeof who !== 'object') return null;
  const t = Object.keys(who).filter(u => who[u] === true);
  return t.length ? t : null;
}
/* S: a student page's state. S.doc = the whole-class fields it holds; S.who = how it knows the Who lists:
   {mode:'live'} reads S.doc.activityStudents; {mode:'mine', map} / {mode:'other', map} a cached reduced map. */
function mForMe(a, S) {
  if (S.who.mode === 'live') { const t = mTicked(S.doc, a.id); return !t || t.includes(S.uid); }
  if (!(a.id in S.who.map)) return true;
  return S.who.mode === 'mine' ? S.who.map[a.id] === true : false;
}
function mHasWho(a, S) {
  if (S.who.mode === 'live') return !!mTicked(S.doc, a.id);
  return a.id in S.who.map;
}
function mVisible(a, S) {
  const d = S.doc;
  if (mRetired(a, d)) return false;
  if (!mAssigned(a, d)) return false;
  if (mMap(d, 'hiddenActivities')[a.id] === true) return false;
  if (!mForMe(a, S)) return false;
  if (S.dev) return true;
  const date = mMap(d, 'activityDates')[a.id];
  return !!date && date <= S.today;
}
function mOptionalFlag(a, d, hasWho) {
  const f = mMap(d, 'optionalActivities')[a.id];
  if (f === true) return true;
  if (f === false) return false;
  return a.optional === true || hasWho;
}
function mStudentOptional(a, S) {
  if ((S.override || S.ownPeriod) === 'CAS') return true;
  return mOptionalFlag(a, S.doc, mHasWho(a, S));
}
function mStudentBlockers(S) {
  if (S.previewer || !S.progressOk) return [];
  const clears = mMap(mMap(S.doc, 'activityClears'), S.uid);
  return ACTS.filter(a => mVisible(a, S) && !mStudentOptional(a, S) && S.done[a.id] !== true && clears[a.id] !== true).map(a => a.id);
}
function mPlayAlongOnly(a, S) {
  const d = S.doc;
  const hidden = mMap(d, 'hiddenActivities')[a.id] === true;
  if (mIsSongCard(a) && mOnSongs(a, d)) return !mRetired(a, d) && !hidden && !mVisible(a, S);
  if (a.view !== 'card' || mMap(d, 'playAlongActivities')[a.id] !== true) return false;
  if (mRetired(a, d) || hidden) return false;
  if (!mForMe(a, S)) return false;
  if (!mAssigned(a, d)) return false;
  return !mVisible(a, S);
}
function mNumbers(d) {
  const shipped = a => { const n = Number(a.number); return Number.isFinite(n) ? n : Infinity; };
  const idNum = a => { const m = /^ca-(\d+)$/.exec(a.id); return m ? Number(m[1]) : Infinity; };
  const board = mMap(d, 'activityBoard');
  const seeded = d.activityBoardSeeded === true;
  const list = ACTS.filter(a => !mOnSongs(a, d) && !mTeacherOnly(a, d));
  const mods = new Map();
  list.forEach(a => {
    let mn;
    if (seeded) { const e = board[a.id]; if (!e) return; mn = Number(e.module) || 0; } else mn = 0;
    if (!mods.has(mn)) mods.set(mn, []);
    mods.get(mn).push(a);
  });
  const posOf = a => { const e = board[a.id]; const n = e && Number(e.pos); return seeded && Number.isFinite(n) ? n : Infinity; };
  const order = [0, ...DATA.manifest, ...[...mods.keys()].filter(m => m !== 0 && !DATA.manifest.includes(m)).sort((x, y) => x - y)];
  const out = {};
  let n = 0;
  order.forEach(mn => {
    (mods.get(mn) || []).slice().sort((x, y) => (posOf(x) - posOf(y)) || (shipped(x) - shipped(y)) || (idNum(x) - idNum(y)))
      .forEach(a => { if (a.kind !== 'check' && !mRetired(a, d)) out[a.id] = ++n; });
  });
  return out;
}
function mGames(d, uid) {
  const ov = mMap(d, 'gameOverrides')[uid];
  if (ov === true) return true;
  if (ov === false) return false;
  return d.gamesEnabled !== false;
}
function mOpenThrough(d, uid) { const n = Number(mMap(d, 'moduleOpenThrough')[uid]); return (Number.isInteger(n) && n >= 2 && n <= 12) ? n : 0; }
function mReduceWho(d, uid) {
  const out = {};
  IDS.forEach(id => { const t = mTicked(d, id); if (t) out[id] = t.includes(uid); });
  return out;
}
/* What the student page should answer, from S. */
function mStudentAnswers(S) {
  return {
    vis: ACTS.filter(a => mVisible(a, S)).map(a => a.id),
    opt: ACTS.filter(a => mStudentOptional(a, S)).map(a => a.id),
    blk: mStudentBlockers(S),
    pao: ACTS.filter(a => mPlayAlongOnly(a, S)).map(a => a.id),
    num: mNumbers(S.doc),
    period: S.override, openThrough: S.openThrough, games: S.games,
    gamesBtn: S.games ? '' : 'none', gated: false,
  };
}
/* The console's and the Journey page's answer for one student, from the live doc and that student's progress doc. */
function mDocAnswers(d, prog, uid, today) {
  const S = { doc: d, who: { mode: 'live' }, uid, today, dev: false };
  const cas = (mMap(d, 'periodOverrides')[uid] || prog.period || '') === 'CAS';
  const clears = mMap(mMap(d, 'activityClears'), uid);
  const done = prog.classActivities || {};
  const vis = ACTS.filter(a => mVisible(a, S)).map(a => a.id);
  const opt = ACTS.filter(a => mOptionalFlag(a, d, !!mTicked(d, a.id))).map(a => a.id);
  const blk = cas ? [] : vis.filter(id => !opt.includes(id) && done[id] !== true && clears[id] !== true);
  return { vis, opt, blk, num: mNumbers(d) };
}
/* The Chromebook's caches after a successful read by uid (R9). */
function mDeviceRead(device, d, uid) {
  device.wc = clone(d);
  device.slot = { uid, override: mMap(d, 'periodOverrides')[uid] || '', openThrough: mOpenThrough(d, uid), who: mReduceWho(d, uid) };
  device.own[uid] = { override: device.slot.override, openThrough: device.slot.openThrough };
}
/* A student page's state after a load or a tab return (R9). mode: 'ok' | 'fail' | 'empty'; prev: the page's
   state before (null for a fresh page). Returns { S, known } — known: the KNOWN entries whose shape this state
   has, each with the state the entry says the code produces instead. */
function mPageState(device, d, uid, mode, prev, base) {
  const S = Object.assign({}, base, { uid });
  if (mode === 'ok') {
    mDeviceRead(device, d, uid);
    Object.assign(S, { doc: clone(d), who: { mode: 'live' }, override: mMap(d, 'periodOverrides')[uid] || '', openThrough: mOpenThrough(d, uid), games: mGames(d, uid) });
    return { S, known: [] };
  }
  const known = [];
  S.doc = device.wc ? clone(device.wc) : (prev ? prev.doc : {});
  const own = device.own[uid];
  S.override = own ? own.override : (prev ? prev.override : '');
  S.openThrough = own ? own.openThrough : (prev ? prev.openThrough : 0);
  const slot = device.slot;
  if (slot && slot.uid === uid) S.who = { mode: 'mine', map: clone(slot.who) };
  else S.who = slot ? { mode: 'other', map: clone(slot.who) } : (prev ? prev.who : { mode: 'live' });
  S.games = prev ? prev.games : true;
  if (!prev && own && slot && slot.uid !== uid && (own.override !== '' || own.openThrough !== 0)) {
    known.push({ id: 'K1', S: Object.assign({}, S, { override: '', openThrough: 0 }) });
  }
  return { S, known };
}
/* The doc a console change should leave (R11). Returns { doc, dontCare: [paths], effect(d) -> problem|null }. */
function mModuleRun(d, module, board) {
  const shipped = a => { const n = Number(a.number); return Number.isFinite(n) ? n : Infinity; };
  const idNum = a => { const m = /^ca-(\d+)$/.exec(a.id); return m ? Number(m[1]) : Infinity; };
  const posOf = a => { const e = board[a.id]; const n = e && Number(e.pos); return Number.isFinite(n) ? n : Infinity; };
  return ACTS.filter(a => board[a.id] && (Number(board[a.id].module) || 0) === module && !mOnSongs(a, d) && !mTeacherOnly(a, d))
    .sort((x, y) => (posOf(x) - posOf(y)) || (shipped(x) - shipped(y)) || (idNum(x) - idNum(y))).map(a => a.id);
}
function mExpectChange(d0, ch, progs, today) {
  const d = clone(d0);
  const m = k => (d[k] && typeof d[k] === 'object' && !Array.isArray(d[k])) ? d[k] : (d[k] = {});
  const dontCare = [];
  let effect = null, wrote = true;
  const a = ACT[ch.id];
  switch (ch.kind) {
    case 'date': if (ch.value) m('activityDates')[ch.id] = ch.value; else delete m('activityDates')[ch.id]; break;
    case 'hide': if (ch.on) m('hiddenActivities')[ch.id] = true; else delete m('hiddenActivities')[ch.id]; break;
    case 'who': { const w = m('activityStudents'); if (!w[ch.id] || typeof w[ch.id] !== 'object') w[ch.id] = {}; if (ch.on) w[ch.id][ch.uid] = true; else delete w[ch.id][ch.uid]; break; }
    case 'wholeClass': if (!(mMap(d0, 'activityStudents')[ch.id])) wrote = false; else delete m('activityStudents')[ch.id]; break;
    case 'optional':
      dontCare.push('optionalActivities.' + ch.id);
      effect = d1 => (mOptionalFlag(a, d1, !!mTicked(d1, a.id)) === ch.on) ? null : `${ch.id} is ${ch.on ? 'still Required' : 'still Optional'} after the switch`;
      break;
    case 'songPlace':
      dontCare.push('songLibrary.' + ch.id);
      effect = d1 => (mOnSongs(a, d1) === ch.toSongs) ? null : `${ch.id} is ${ch.toSongs ? 'not on' : 'still on'} the Songs page after the move`;
      break;
    case 'classSong': if (ch.on) m('classSongs')[ch.id] = true; else delete m('classSongs')[ch.id]; if ((mMap(d0, 'classSongs')[ch.id] === true) === ch.on) wrote = false; break;
    case 'archive': {
      if (ch.on) m('archivedActivities')[ch.id] = true; else delete m('archivedActivities')[ch.id];
      delete m('deletedActivities')[ch.id];
      if (ch.on && Array.isArray(d.activityPins) && d.activityPins.includes(ch.id)) d.activityPins = d.activityPins.filter(x => x !== ch.id);
      break;
    }
    case 'delete': {
      m('deletedActivities')[ch.id] = true;
      ['archivedActivities', 'optionalActivities', 'playAlongActivities', 'activityDates', 'activityTitles', 'hiddenActivities', 'activityStudents', 'activityNumbers'].forEach(k => { delete m(k)[ch.id]; });
      const board = m('activityBoard');
      if (board[ch.id]) {
        const from = Number(board[ch.id].module) || 0;
        const run = mModuleRun(d0, from, mMap(d0, 'activityBoard')).filter(x => x !== ch.id);
        delete board[ch.id];
        run.forEach((x, i) => { board[x] = { module: from, pos: i + 1 }; });
      }
      Object.keys(mMap(d, 'activityClears')).forEach(u => { if (d.activityClears[u] && typeof d.activityClears[u] === 'object') delete d.activityClears[u][ch.id]; });
      if (Array.isArray(d.activityPins)) d.activityPins = d.activityPins.filter(x => x !== ch.id);
      break;
    }
    case 'playAlong': if (ch.on) m('playAlongActivities')[ch.id] = true; else delete m('playAlongActivities')[ch.id]; break;
    case 'clear': { const c = m('activityClears'); if (!c[ch.uid] || typeof c[ch.uid] !== 'object') c[ch.uid] = {}; if (ch.on) c[ch.uid][ch.id] = true; else delete c[ch.uid][ch.id]; break; }
    case 'clearAll': {
      const blk = mDocAnswers(d0, progs[ch.uid], ch.uid, today).blk;
      if (!blk.length) { wrote = false; break; }
      const c = m('activityClears'); if (!c[ch.uid] || typeof c[ch.uid] !== 'object') c[ch.uid] = {};
      blk.forEach(id => { c[ch.uid][id] = true; });
      break;
    }
    case 'period': if (ch.value === 'auto') delete m('periodOverrides')[ch.uid]; else m('periodOverrides')[ch.uid] = ch.value; break;
    case 'openThrough': if (ch.value === 'auto') delete m('moduleOpenThrough')[ch.uid]; else m('moduleOpenThrough')[ch.uid] = ch.value; break;
    case 'classGames': d.gamesEnabled = ch.on; break;
    case 'studentGames': if (ch.state === 'default') delete m('gameOverrides')[ch.uid]; else m('gameOverrides')[ch.uid] = ch.state === 'on'; break;
    case 'move': {
      const b0 = mMap(d0, 'activityBoard');
      const board = m('activityBoard');
      const from = b0[ch.id] ? (Number(b0[ch.id].module) || 0) : null;
      const run = mModuleRun(d0, ch.module, b0).filter(x => x !== ch.id);
      const at = Math.max(0, Math.min(run.length, ch.pos - 1));
      run.splice(at, 0, ch.id);
      run.forEach((x, i) => { board[x] = { module: ch.module, pos: i + 1 }; });
      if (from !== null && from !== ch.module) mModuleRun(d0, from, b0).filter(x => x !== ch.id).forEach((x, i) => { board[x] = { module: from, pos: i + 1 }; });
      if (canon(normDoc(d)) === canon(normDoc(d0))) wrote = false;
      break;
    }
    case 'unassign': {
      const b0 = mMap(d0, 'activityBoard');
      const board = m('activityBoard');
      const from = Number(b0[ch.id].module) || 0;
      delete board[ch.id];
      mModuleRun(d0, from, b0).filter(x => x !== ch.id).forEach((x, i) => { board[x] = { module: from, pos: i + 1 }; });
      break;
    }
    default: throw new Error('model: unknown change ' + ch.kind);
  }
  if (!wrote) return { doc: d0, dontCare, effect, wrote };
  return { doc: d, dontCare, effect, wrote };
}
/* R13 the landing at sign-in. nav: { hash, fromJourney, resume }. Returns the address the page should end on. */
function mLanding(S, nav) {
  if (nav.resume) return nav.hash;
  const base = nav.hash.includes('/') ? nav.hash.slice(0, nav.hash.indexOf('/')) : nav.hash;
  const lands = nav.hash === '' || (mStudentBlockers(S).length > 0 && !nav.fromJourney && base !== '#class-activities' && base !== '#live-quiz');
  return lands ? '#class-activities' : nav.hash;
}
/* R14 the first card (caStartHereId). Returns a problem, or null. */
function mFirstProblem(S, got) {
  const clears = mMap(mMap(S.doc, 'activityClears'), S.uid);
  const dateOf = a => mMap(S.doc, 'activityDates')[a.id] || '';
  const cands = ACTS.filter(a => mVisible(a, S) && S.done[a.id] !== true && clears[a.id] !== true);
  const req = cands.filter(a => !mStudentOptional(a, S));
  if (!cands.length) return got === null ? null : `${got} is first, but nothing unfinished and not cleared is left`;
  const pool = req.length ? req : cands;
  const g = pool.find(a => a.id === got);
  if (!g) {
    const why = !ACT[got] ? 'no card' : clears[got] === true ? 'a card cleared for this student' : S.done[got] === true ? 'a finished card'
      : !mVisible(ACT[got], S) ? 'a card this student does not see' : req.length ? 'an optional card while a required one is unfinished' : 'not a candidate';
    return `${got === null ? 'nothing' : got} is first: ${why} (expected one of [${pool.map(a => a.id).join(' ')}])`;
  }
  const newest = pool.reduce((m, a) => (dateOf(a) > m ? dateOf(a) : m), '');
  if (dateOf(g) !== newest) return `${got} (dated ${dateOf(g) || 'none'}) is first, but a newer ${req.length ? 'required' : 'optional'} card is dated ${newest}`;
  return null;
}
/* R15 the period question at sign-in. */
function mPeriodAsked(S) { return !S.previewer && S.progressOk && !(S.ownPeriod || S.override); }
/* MODEL-END */

/* ════════════════════════════════════════════════════════════════════════════
   THE FAKE WORLD
   ════════════════════════════════════════════════════════════════════════════ */
const DELETE = Object.freeze({ fakeFieldValue: 'delete' });
function mergeInto(target, patch) {
  for (const k of Object.keys(patch)) {
    const v = patch[k];
    if (v === DELETE) { delete target[k]; continue; }
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      if (BREAK_FAKE === 'merge') { target[k] = stripDeletes(v); continue; }
      if (!Object.keys(v).length) { target[k] = {}; continue; }
      if (!target[k] || typeof target[k] !== 'object' || Array.isArray(target[k])) target[k] = {};
      mergeInto(target[k], v);
    } else target[k] = clone(v);
  }
}
function stripDeletes(v) {
  if (!v || typeof v !== 'object' || Array.isArray(v)) return clone(v);
  const o = {};
  for (const k of Object.keys(v)) if (v[k] !== DELETE) o[k] = stripDeletes(v[k]);
  return o;
}
const READS = { ok: 0, fail: 0, empty: 0, writes: 0 };
class Store {
  constructor() { this.docs = new Map(); this.counts = READS; }
  read(path) { return this.docs.has(path) ? clone(this.docs.get(path)) : undefined; }
  put(path, data) { this.docs.set(path, clone(data)); }
  write(path, data, opts) {
    this.counts.writes++;
    if (opts && opts.merge) { const cur = this.docs.get(path) || {}; mergeInto(cur, data); this.docs.set(path, cur); }
    else this.docs.set(path, stripDeletes(data));
  }
}
/* One Firestore client per page. plan.config / plan.progress: the outcomes of that page's next reads, in order
   ('ok' | 'fail' | 'empty' | {mode, hold}). A held read waits for client.release(). */
function makeClient(store) {
  const client = { plan: { config: [], progress: [] }, held: [] };
  const snap = (id, data) => ({ id, exists: data !== undefined, data: () => clone(data) });
  const ref = (coll, id) => {
    const path = coll + '/' + id;
    return {
      path,
      get() {
        const q = client.plan[coll] || [];
        let p = q.length ? q.shift() : 'ok';
        const hold = typeof p === 'object' && p.hold;
        const mode = typeof p === 'object' ? p.mode : p;
        const settle = () => {
          if (mode === 'fail') { store.counts.fail++; return Promise.reject(new Error('fake Firestore: read failed (offline)')); }
          if (mode === 'empty') { store.counts.empty++; return Promise.resolve(snap(id, undefined)); }
          store.counts.ok++;
          return Promise.resolve(snap(id, store.read(path)));
        };
        if (!hold) return Promise.resolve().then(settle);
        return new Promise(res => { client.held.push(() => res(settle())); });
      },
      /* A student's own save (flushSave, swap45Commit): set with merge, as Firestore documents it. */
      set(data, opts) { return Promise.resolve().then(() => store.write(path, data, opts)); },
    };
  };
  client.collection = coll => ({
    doc: id => ref(coll, id),
    get: () => Promise.resolve().then(() => {
      const docs = [...store.docs.keys()].filter(p => p.startsWith(coll + '/')).sort().map(p => snap(p.slice(coll.length + 1), store.read(p)));
      return { size: docs.length, docs, forEach: fn => docs.forEach(fn), empty: !docs.length };
    }),
  });
  client.runTransaction = async fn => {
    const staged = [];
    const t = { get: async r => snap(r.path.split('/')[1], store.read(r.path)), set: (r, data, opts) => { staged.push([r.path, data, opts]); } };
    const out = await fn(t);
    staged.forEach(([p, data, opts]) => store.write(p, data, opts));
    return out;
  };
  client.release = () => { const h = client.held.splice(0); h.forEach(f => f()); };
  return client;
}
function makeEl(id) {
  const attrs = {}, cls = new Set();
  const el = {
    id, attrs, style: { display: '', setProperty() {}, removeProperty() {}, getPropertyValue() { return ''; } },
    dataset: {}, children: [], hidden: false, innerHTML: '', textContent: '', value: '', checked: false, isConnected: true,
    classList: {
      add: (...c) => c.forEach(x => cls.add(x)), remove: (...c) => c.forEach(x => cls.delete(x)),
      toggle: (c, on) => { const v = on === undefined ? !cls.has(c) : !!on; if (v) cls.add(c); else cls.delete(c); return v; },
      contains: c => cls.has(c),
    },
    setAttribute(k, v) { attrs[k] = String(v); }, getAttribute(k) { return k in attrs ? attrs[k] : null; },
    removeAttribute(k) { delete attrs[k]; }, hasAttribute(k) { return k in attrs; },
    addEventListener() {}, removeEventListener() {}, appendChild(c) { if (c && c.tagIsScript && c.onload) queueMicrotask(() => c.onload()); return c; },
    removeChild() {}, remove() {}, insertBefore(c) { return c; }, querySelector() { return null; }, querySelectorAll() { return []; },
    closest() { return null; }, matches() { return false; }, focus() {}, blur() {}, click() {}, scrollIntoView() {},
    insertAdjacentHTML() {}, insertAdjacentElement() {}, cloneNode() { return makeEl(''); }, contains() { return false; },
    getBoundingClientRect() { return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; },
  };
  Object.defineProperty(el, 'firstChild', { get: () => makeEl('') });
  return el;
}
function makeStorage() {
  const d = {};
  return { _d: d, getItem: k => (k in d ? d[k] : null), setItem: (k, v) => { d[k] = String(v); }, removeItem: k => { delete d[k]; }, clear: () => { for (const k of Object.keys(d)) delete d[k]; }, key: i => Object.keys(d)[i] ?? null, get length() { return Object.keys(d).length; } };
}
const TEACHER_EMAIL = 'teacher@example.test';
let VNOW = 0;
let LOG = [];
/* A page: a fresh vm context with the stub DOM, the device's localStorage and its own Firestore client. */
function makePage(kind, storage, client, nav = {}) {
  const els = {};
  /* Ids the page creates itself and tests for first (the period question's overlay): absent until created. */
  const NULL_IDS = new Set(['period-overlay']);
  const getEl = id => (NULL_IDS.has(id) ? (els[id] || null) : (els[id] || (els[id] = makeEl(id))));
  getEl('class-activities-screen').hidden = true;
  getEl('songs-screen').hidden = true;
  getEl('games-screen').setAttribute('hidden', '');
  getEl('search-panel').setAttribute('hidden', '');
  const docListeners = {};
  const alerts = [];
  const head = makeEl('head');
  head.appendChild = s => { if (s && s.onload) queueMicrotask(() => s.onload()); return s; };
  const document = {
    documentElement: makeEl('html'), head, body: makeEl('body'), readyState: 'complete', referrer: nav.referrer || '',
    getElementById: getEl, querySelector: () => null, querySelectorAll: () => [], createElement: () => makeEl(''),
    createDocumentFragment: () => makeEl(''), createTextNode: () => makeEl(''),
    addEventListener: (ev, fn) => { (docListeners[ev] = docListeners[ev] || []).push(fn); }, removeEventListener() {},
    hidden: false, visibilityState: 'visible', fonts: { ready: Promise.resolve() },
  };
  document.body.appendChild = c => { if (c && c.id) els[c.id] = c; return c; };
  const firestore = Object.assign(() => client, { FieldValue: { delete: () => DELETE } });
  const ctx = {
    console: { log: (...a) => LOG.push(['log', kind, a.join(' ')]), warn: (...a) => LOG.push(['warn', kind, a.join(' ')]), error: (...a) => LOG.push(['error', kind, a.join(' ')]), info() {}, debug() {} },
    document, localStorage: storage, sessionStorage: makeStorage(),
    location: { protocol: 'https:', hostname: 'example.test', origin: 'https://example.test', href: 'https://example.test/' + (kind === 'console' ? '?teacher=true' : ''), pathname: '/', search: kind === 'console' ? '?teacher=true' : '', hash: nav.hash || '', reload() {}, replace() {} },
    /* pushState / replaceState move location.hash as a browser does (the router reads it back at once). */
    history: { scrollRestoration: 'auto', state: null, length: 1, back() {},
      replaceState(st, _t, url) { this.state = st; ctx.location.hash = String(url || '').includes('#') ? String(url).slice(String(url).indexOf('#')) : ''; },
      pushState(st, _t, url) { this.state = st; ctx.location.hash = String(url || '').includes('#') ? String(url).slice(String(url).indexOf('#')) : ''; } },
    navigator: { userAgent: 'node', platform: 'node', language: 'en', onLine: true },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    queueMicrotask, matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }), getComputedStyle: () => ({ getPropertyValue: () => '', paddingLeft: '0', paddingRight: '0' }),
    fetch: () => Promise.reject(new Error('no network')), CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o || {}); } },
    Image: class {}, Audio: class { play() { return Promise.resolve(); } pause() {} }, ResizeObserver: class { observe() {} disconnect() {} },
    performance: { now: () => VNOW }, CSS: { escape: x => String(x).replace(/[^A-Za-z0-9_-]/g, c => '\\' + c) }, URLSearchParams, URL, TextEncoder, TextDecoder,
    addEventListener() {}, removeEventListener() {}, dispatchEvent() {}, scrollTo() {}, innerWidth: 1366, innerHeight: 657, devicePixelRatio: 1,
    alert: m => alerts.push(String(m)), confirm: () => true, prompt: () => null,
    firebase: { initializeApp() {}, auth: () => ({ onAuthStateChanged() {}, currentUser: null, signOut: () => Promise.resolve() }), firestore },
    firebaseConfig: {}, TEACHER_EMAIL, __vnow: () => VNOW,
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  if (BREAK_FAKE !== 'clock') PRELUDE.runInContext(ctx);
  if (kind === 'journey') {
    Object.assign(ctx, { t: k => k, getLang: () => 'en', setLang() {}, applyI18n() {}, SONG_ID: 'the-cure' });
    SCRIPTS.ca.runInContext(ctx);
    SCRIPTS.journey.runInContext(ctx);
  } else {
    SCRIPTS.base.forEach(s => s.runInContext(ctx));
    SCRIPTS.app.runInContext(ctx);
    if (kind === 'console') SCRIPTS.teacher.runInContext(ctx);
  }
  const run = code => vm.runInContext(code, ctx);
  return { ctx, run, els, alerts, docListeners, client, kind };
}

/* ── Probes: read the real predicates (the only place the site's functions are called) ── */
const STUDENT_PROBE = `(function(){
  var A = window.CLASS_ACTIVITIES || [], out = { vis: [], opt: [], blk: [], pao: [], num: {} };
  A.forEach(function(a){
    if (caIsVisible(a)) out.vis.push(a.id);
    if (caIsOptional(a)) out.opt.push(a.id);
    if (caIsPlayAlongOnly(a)) out.pao.push(a.id);
    var n = caNumber(a); if (n) out.num[a.id] = n;
  });
  out.blk = caBlockers().map(function(a){ return a.id; });
  out.period = periodOverride; out.openThrough = moduleOpenThrough; out.games = gamesAccessOn;
  out.gamesBtn = document.getElementById('games-btn').style.display;
  out.gated = document.body.classList.contains('ca-gated');
  out.sig = classConfigSignature();
  return JSON.stringify(out);
})()`;
function probeStudent(page) { return JSON.parse(page.run(STUDENT_PROBE)); }
function probeConsole(page, uid) {
  page.ctx.__uid = uid;
  return JSON.parse(page.run(`(function(uid){
    var A = window.CLASS_ACTIVITIES || [], cfg = teacherClassConfig, today = dayStr(new Date()), view = teacherBoardView(cfg);
    var stu = allStudentsRaw.find(function(s){ return s.uid === uid; });
    return JSON.stringify({
      vis: A.filter(function(a){ return teacherActivityVisible(a, cfg, today, uid, view); }).map(function(a){ return a.id; }),
      opt: A.filter(function(a){ return teacherActivityOptional(a.id, cfg); }).map(function(a){ return a.id; }),
      blk: teacherBlockersFor(stu, cfg).map(function(a){ return a.id; }),
      num: teacherBoardView(cfg).number,
    });
  })(__uid)`));
}
function probeJourney(page, cfg, prog, uid) {
  page.ctx.__in = JSON.stringify({ cfg, prog, uid });
  return JSON.parse(page.run(`(function(){
    var i = JSON.parse(__in), A = window.CLASS_ACTIVITIES || [];
    return JSON.stringify({
      locks: typeof JOURNEY_GATE_LOCKS === 'undefined' ? 'absent' : JOURNEY_GATE_LOCKS,
      vis: A.filter(function(a){ return journeyIsVisible(a, i.cfg, i.uid); }).map(function(a){ return a.id; }),
      opt: A.filter(function(a){ return journeyOptional(a, i.cfg); }).map(function(a){ return a.id; }),
      blk: journeyBlockers(i.cfg, (i.prog && i.prog.classActivities) || {}, i.uid, i.prog && i.prog.period).map(function(a){ return a.id; }),
    });
  })()`));
}

/* ════════════════════════════════════════════════════════════════════════════
   THE WORLD GENERATOR
   ════════════════════════════════════════════════════════════════════════════ */
const UIDS = ['stu-alpha', 'stu-bravo', 'stu-charlie'];
/* A student who has never saved anything: no progress doc until their first save. */
const NEW_UID = 'stu-delta';
const NAMES = { 'stu-alpha': 'Test Student A', 'stu-bravo': 'Test Student B', 'stu-charlie': 'Test Student C' };
const LA = (y, mo, d, h, mi, s, offH) => Date.UTC(y, mo - 1, d, h + offH, mi, s);
const DAYS = [
  ['ordinary weekday 10:00', LA(2026, 11, 11, 10, 0, 0, 8)],
  ['one minute before midnight', LA(2026, 11, 11, 23, 59, 0, 8)],
  ['just after midnight', LA(2026, 11, 12, 0, 0, 5, 8)],
  ['evening (UTC is already tomorrow)', LA(2026, 11, 12, 18, 30, 0, 8)],
  ['month end 23:59', LA(2026, 11, 30, 23, 59, 30, 8)],
  ['month start 00:01', LA(2026, 12, 1, 0, 1, 0, 8)],
  ['DST ends: 01:30 PDT', LA(2026, 11, 1, 1, 30, 0, 7)],
  ['DST ends: 01:30 PST', LA(2026, 11, 1, 1, 30, 0, 8)],
  ['DST starts: 03:30 PDT', LA(2026, 3, 8, 3, 30, 0, 7)],
  ['DST eve 23:59 PST', LA(2026, 3, 7, 23, 59, 0, 8)],
  ['new year 00:00:01', LA(2027, 1, 1, 0, 0, 1, 8)],
  ['PDT just after midnight 00:15', LA(2026, 5, 10, 0, 15, 0, 7)],
  ['PDT late evening 23:30', LA(2026, 9, 15, 23, 30, 0, 7)],
  ['PDT first night 00:10', LA(2026, 3, 9, 0, 10, 0, 7)],
  ['PDT month end 23:59', LA(2026, 6, 30, 23, 59, 0, 7)],
];
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const chance = (rng, p) => rng() < p;
function genWorld(rng, today) {
  const d = {};
  if (chance(rng, 0.92)) d.activityBoardSeeded = true;
  const inPlay = IDS.filter(() => chance(rng, 0.45));
  ['ca-14', 'ca-34', 'ca-41', 'ca-40', 'ca-24'].forEach(id => { if (ACT[id] && chance(rng, 0.6) && !inPlay.includes(id)) inPlay.push(id); });
  const modules = [0, ...DATA.manifest];
  const board = {};
  const perMod = {};
  inPlay.forEach(id => { if (chance(rng, 0.85)) { const mn = chance(rng, 0.03) ? 99 : pick(rng, modules); (perMod[mn] = perMod[mn] || []).push(id); } });
  Object.entries(perMod).forEach(([mn, ids]) => {
    const pos = ids.map((_, i) => i + 1).sort(() => rng() - 0.5);
    ids.forEach((id, i) => { board[id] = { module: Number(mn), pos: pos[i] }; });
  });
  /* The console writes the board and the seeded flag together (teacherMigrateActivityBoard), so an unseeded
     doc holds no board. */
  if (d.activityBoardSeeded) d.activityBoard = board;
  const dateOf = () => {
    const r = rng();
    if (r < 0.25) return today;
    if (r < 0.4) return modelAddDays(today, -1);
    if (r < 0.52) return modelAddDays(today, 1);
    if (r < 0.8) return modelAddDays(today, -2 - Math.floor(rng() * 40));
    if (r < 0.95) return modelAddDays(today, 2 + Math.floor(rng() * 20));
    return '';
  };
  const dates = {};
  inPlay.forEach(id => { if (chance(rng, 0.8)) dates[id] = dateOf(); });
  IDS.filter(id => !inPlay.includes(id)).forEach(id => { if (chance(rng, 0.06)) dates[id] = dateOf(); });
  d.activityDates = dates;
  const flagMap = (p, v) => { const o = {}; inPlay.forEach(id => { if (chance(rng, p)) o[id] = typeof v === 'function' ? v() : v; }); return o; };
  d.hiddenActivities = flagMap(0.1, true);
  d.archivedActivities = flagMap(0.07, true);
  d.deletedActivities = {};
  inPlay.forEach(id => { if (!d.archivedActivities[id] && chance(rng, 0.04)) { d.deletedActivities[id] = true; delete board[id]; delete dates[id]; } });
  const who = {};
  inPlay.forEach(id => {
    if (!chance(rng, 0.14)) return;
    const w = {};
    UIDS.forEach(u => { if (chance(rng, 0.45)) w[u] = true; });
    if (chance(rng, 0.2)) w['stu-elsewhere'] = true;
    if (chance(rng, 0.15)) w[pick(rng, UIDS)] = false;
    who[id] = w;
  });
  d.activityStudents = who;
  d.optionalActivities = {};
  inPlay.forEach(id => { const r = rng(); if (r < 0.13) d.optionalActivities[id] = true; else if (r < 0.22) d.optionalActivities[id] = false; });
  d.activityClears = {};
  UIDS.forEach(u => { const c = {}; inPlay.forEach(id => { if (chance(rng, 0.1)) c[id] = true; }); if (Object.keys(c).length) d.activityClears[u] = c; });
  d.periodOverrides = {};
  UIDS.forEach(u => { if (chance(rng, 0.25)) d.periodOverrides[u] = pick(rng, ['4', '7', 'CAS', 'CAS']); });
  d.moduleOpenThrough = {};
  UIDS.forEach(u => { if (chance(rng, 0.2)) d.moduleOpenThrough[u] = pick(rng, [2, 3, 5, 8, 12, 1, 13, 4.5, '6']); });
  const g = rng();
  if (g < 0.15) d.gamesEnabled = false; else if (g < 0.3) d.gamesEnabled = true;
  d.gameOverrides = {};
  UIDS.forEach(u => { if (chance(rng, 0.2)) d.gameOverrides[u] = chance(rng, 0.5); });
  d.songLibrary = {};
  IDS.filter(id => mIsSongCard(ACT[id])).forEach(id => { if (chance(rng, 0.3)) d.songLibrary[id] = chance(rng, 0.5); });
  d.classSongs = {};
  IDS.filter(id => ACT[id].teacherOnly === true).forEach(id => { if (chance(rng, 0.35)) d.classSongs[id] = true; });
  d.playAlongActivities = {};
  IDS.filter(id => ACT[id].view === 'card').forEach(id => { if (chance(rng, 0.12)) d.playAlongActivities[id] = true; });
  /* Renames on about 10% of the cards in play, and 0-3 pins (R11: Delete wipes both, Archive drops the pin). */
  d.activityTitles = {};
  inPlay.forEach(id => { if (chance(rng, 0.1)) d.activityTitles[id] = { en: 'Renamed ' + id }; });
  const nPins = Math.floor(rng() * 4);
  if (nPins) d.activityPins = inPlay.filter(id => !d.deletedActivities[id]).sort(() => rng() - 0.5).slice(0, nPins);
  d.configVersion = Math.floor(rng() * 40);
  const progs = {};
  UIDS.forEach((u, i) => {
    const done = {};
    IDS.forEach(id => { if (chance(rng, 0.3)) done[id] = true; });
    progs[u] = { name: NAMES[u], email: `stu${i + 1}@example.test`, period: pick(rng, ['4', '7', 'CAS', '', '4', '7']), classActivities: done, migrations: { swap45: true } };
  });
  return { doc: d, progs };
}

/* ════════════════════════════════════════════════════════════════════════════
   THE CHECKS
   ════════════════════════════════════════════════════════════════════════════ */
const C = { cases: 0, pages: 0, comparisons: 0, sigSteps: 0, withBlocker: 0, landed: 0, landingChecks: 0, asked: 0, firstChecks: 0, routerChecks: 0, journeyLocks: 0, changes: 0, writes: 0, threeWay: 0, tabReturns: 0, midRead: 0, freshLoads: 0, landings: 0, gatedSeen: 0, several: 0,
  marked: 0, cas: 0, newStudent: 0, richRetire: { archive: 0, delete: 0 }, namedRetire: { archive: 0, delete: 0 }, gamesTabReturn: [0, 0], gamesKeepLast: 0 };
const FAILS = [];
const TRUTH = {};
const KIND_COUNT = {};
const KIND_FLOOR = 15;
/* Archive must keep, and Delete must wipe, a card's Hidden and Who cells (R11): only a change on a card holding
   them can show it, so a full run needs a few of each. */
const RICH_FLOOR = 5;
const KNOWN_HITS = { K1: 0 };
const KNOWN_FIRST = {};
const KNOWN_LISTED = { K1: '2026-11-12' };
const tally = (kind, col, ok) => { const r = (TRUTH[kind] = TRUTH[kind] || {}); const c = (r[col] = r[col] || [0, 0]); c[1]++; if (ok) c[0]++; };
let CUR = { seed: SEED, idx: 0, label: '' };
function fail(where, msg) { FAILS.push(`seed ${CUR.seed} case ${CUR.idx} [${CUR.label}] ${where}: ${msg}`); }
function diffList(exp, got) {
  const e = sortU(exp), g = sortU(got);
  const missing = e.filter(x => !g.includes(x)), extra = g.filter(x => !e.includes(x));
  return (missing.length || extra.length) ? `expected but missing [${missing.join(' ')}]; extra [${extra.join(' ')}]` : '';
}
const FIELDS = ['vis', 'opt', 'blk', 'pao', 'num', 'period', 'openThrough', 'games', 'gamesBtn', 'gated'];
/* Every field compared counts once in C.comparisons (count = false for a what-if that judges nothing). */
function answerDiff(exp, got, fields = FIELDS, count = true) {
  const out = [];
  for (const f of fields) {
    if (!(f in exp)) continue;
    if (count) C.comparisons++;
    if (Array.isArray(exp[f])) { const d = diffList(exp[f], got[f] || []); if (d) out.push(`${f}: ${d}`); }
    else if (canon(exp[f]) !== canon(got[f])) out.push(`${f}: expected ${canon(exp[f])}, got ${canon(got[f])}`);
  }
  return out;
}
/* Judge a student page against the rule. A contradiction that equals a KNOWN entry's answer for a state of that
   entry's shape is counted as known; anything else fails. Returns 'ok' | 'known' | 'fail'. */
function judgeStudent(where, got, S, known) {
  const d = answerDiff(mStudentAnswers(S), got);
  if (!d.length) return 'ok';
  for (const k of known || []) {
    if (!answerDiff(mStudentAnswers(k.S), got, FIELDS, false).length) {
      KNOWN_HITS[k.id]++;
      if (!KNOWN_FIRST[k.id]) KNOWN_FIRST[k.id] = `case ${CUR.idx}, ${where}: ${d.join(' | ').slice(0, 220)}`;
      if (VERBOSE) console.log(`    known ${k.id} at ${where}: ${d.join(' | ').slice(0, 300)}`);
      return 'known';
    }
  }
  fail(where, d.join(' | '));
  return 'fail';
}

/* ════════════════════════════════════════════════════════════════════════════
   THE CASE
   ════════════════════════════════════════════════════════════════════════════ */
async function bootStudent(device, store, uid, cfgMode, progMode, special, nav = { hash: '' }) {
  const client = makeClient(store);
  if (special !== 'dev') { client.plan.config.push(cfgMode); client.plan.progress.push(progMode); }
  const page = makePage('student', device.storage, client, { hash: nav.hash, referrer: nav.fromJourney ? 'https://example.test/tabs/the-cure.html' : '' });
  C.pages++;
  const email = special === 'teacher-email' ? TEACHER_EMAIL : `${uid}@example.test`;
  page.ctx.__user = { uid, email, displayName: 'Fake User' };
  if (special === 'dev') {
    await page.run(`(async function(){ currentUser = __user; })()`);
  } else {
    await page.run(`(async function(){ currentUser = __user; await loadProgress(); try { caAdoptLocalTicks(); } catch(e) {} await loadClassConfig(); })()`);
  }
  await flush();
  /* The real showApp() (what start.js's sign-in callback calls next). Stubbed, because they need a rendered lesson
     or a module file this world does not load: renderAll (draws the sets) and swResumeApply (restores scroll and open
     panels after an update reload; it routes nothing once a set is on screen). The period question is wrapped, not
     stubbed, so the tool sees whether it was asked. An update reload is the real note swResumeTake reads. */
  page.ctx.__resume = nav.resume ? { uid, s: { hash: nav.hash } } : null;
  page.run(`renderAll = function(){}; swResumeApply = function(){};
    var __pp = maybeShowPeriodPicker; window.__asked = false;
    maybeShowPeriodPicker = function(){ var r = __pp(); if (r !== false) window.__asked = true; return r; };
    if (__resume) swResumeNote = __resume;
    showApp(__user);`);
  await flush();
  page.landed = page.ctx.location.hash;
  page.asked = page.ctx.__asked === true;
  return page;
}
async function bootConsole(store) {
  const client = makeClient(store);
  const page = makePage('console', makeStorage(), client);
  C.pages++;
  page.ctx.__user = { uid: 'teacher-uid', email: TEACHER_EMAIL };
  await page.run(`(async function(){
    currentUser = __user; teacherView = 'livequiz';
    allStudentsRaw = await teacherFetchStudents();
    await loadTeacherClassConfig();
    teacherApplyRosterFilter();
  })()`);
  await flush();
  return page;
}
/* The console's roster refresh after a student saved (the real fetch; the minute timer never fires here). */
async function consoleRefetch(con) {
  await con.run(`(async function(){ allStudentsRaw = await teacherFetchStudents(); teacherApplyRosterFilter(); })()`);
  await flush();
}
let JOURNEY = null;
function journeyPage() { if (!JOURNEY) { JOURNEY = makePage('journey', makeStorage(), makeClient(new Store())); C.pages++; } return JOURNEY; }

/* A student's model state base (what the page knows apart from the config). prog null = no progress doc. */
function studentBase(uid, prog, progOk, special, today) {
  const p = prog || {};
  return {
    uid, today, dev: special === 'dev', previewer: special === 'dev' || special === 'teacher-email',
    progressOk: special === 'dev' ? true : progOk, ownPeriod: (progOk && special !== 'dev') ? (p.period || '') : '',
    done: (progOk && special !== 'dev') ? clone(p.classActivities || {}) : {},
  };
}
/* The three-way comparison: student page (fresh, successful reads), console, Journey, model. A student with no
   progress doc is not on the console's roster: student, Journey and the rules only. */
function threeWay(where, studentGot, consolePage, uid, d, prog, today) {
  const p = prog || {};
  const exp = mDocAnswers(d, p, uid, today);
  const onRoster = !!prog;
  const con = onRoster ? probeConsole(consolePage, uid) : null;
  const jny = probeJourney(journeyPage(), clone(d), prog ? clone(prog) : null, uid);
  C.threeWay++;
  C.comparisons++;
  if (jny.locks !== false) fail(`${where} — journey`, `JOURNEY_GATE_LOCKS is ${canon(jny.locks)}: a Journey page would lock (R6)`); else C.journeyLocks++;
  const cas = (mMap(d, 'periodOverrides')[uid] || p.period || '') === 'CAS';
  const sides = [['journey', jny, ['vis', 'opt', 'blk']], ['student', studentGot, cas ? ['vis', 'blk', 'num'] : ['vis', 'opt', 'blk', 'num']]];
  if (con) sides.unshift(['console', con, ['vis', 'opt', 'blk', 'num']]);
  sides.forEach(([who, got, fields]) => { const dd = answerDiff(exp, got, fields); if (dd.length) fail(`${where} — ${who} vs the rules`, dd.join(' | ')); });
  const ref = con || jny;
  const agree = ['vis', 'blk'].every(f => diffList(ref[f], jny[f]) === '' && diffList(ref[f], studentGot[f]) === '');
  C.comparisons += 2;
  if (!agree) fail(`${where} — three-way`, `student / console / Journey disagree: vis ${diffList(studentGot.vis, ref.vis) || '='} (student vs ${con ? 'console' : 'Journey'}), blk ${diffList(studentGot.blk, ref.blk) || '='}; Journey vs console vis ${diffList(jny.vis, ref.vis) || '='}`);
}
const CHANGE_KINDS = ['date', 'hide', 'who', 'wholeClass', 'optional', 'songPlace', 'classSong', 'archive', 'delete', 'playAlong', 'clear', 'clearAll', 'period', 'openThrough', 'classGames', 'studentGames', 'move', 'unassign'];
/* Which kind of change: a rotation over CHANGE_KINDS (slot = this case's start + the change's ordinal), so every
   kind runs about as often as every other; a kind that does not apply to this doc passes to the next one. Most
   changes aim at the student whose page is open (a card that student sees, that student's uid). */
function pickChange(rng, d, today, progs, openUid, slot) {
  const real = UIDS.includes(openUid);
  const seen = real ? mDocAnswers(d, progs[openUid], openUid, today).vis : [];
  const board = mMap(d, 'activityBoard');
  const seeded = d.activityBoardSeeded === true;
  for (let tries = 0; tries < CHANGE_KINDS.length; tries++) {
    const kind = CHANGE_KINDS[(slot + tries) % CHANGE_KINDS.length];
    const anyId = () => pick(rng, IDS);
    const busy = () => {
      if (seen.length && chance(rng, 0.7)) return pick(rng, seen);
      const ids = IDS.filter(id => board[id] || mMap(d, 'activityDates')[id]);
      return ids.length ? pick(rng, ids) : anyId();
    };
    /* A card that holds the cells Archive must keep and Delete must wipe: a busy() card is mostly one the open
       student SEES, so it is rarely Hidden or someone else's (R11). Tiers, first one that has a card: Hidden or Who
       (60%), a rename or a pin (25%), Optional or Play Along. */
    const rich = () => {
      const live = IDS.filter(id => !mMap(d, 'deletedActivities')[id]);
      const pins = Array.isArray(d.activityPins) ? d.activityPins : [];
      const tiers = [
        live.filter(id => mMap(d, 'hiddenActivities')[id] === true || mMap(d, 'activityStudents')[id]),
        live.filter(id => id in mMap(d, 'activityTitles') || pins.includes(id)),
        live.filter(id => id in mMap(d, 'optionalActivities') || mMap(d, 'playAlongActivities')[id] === true),
      ];
      const r = rng();
      const order = r < 0.6 ? [0, 1, 2] : r < 0.85 ? [1, 0, 2] : [2, 0, 1];
      for (const t of order) if (tiers[t].length) return pick(rng, tiers[t]);
      return null;
    };
    const uid = real && chance(rng, 0.7) ? openUid : pick(rng, UIDS);
    switch (kind) {
      case 'date': return { kind, id: busy(), value: pick(rng, [today, modelAddDays(today, -1), modelAddDays(today, 1), modelAddDays(today, -9), '']) };
      case 'hide': { const id = busy(); return { kind, id, on: mMap(d, 'hiddenActivities')[id] !== true }; }
      case 'who': { const id = busy(); const w = mMap(d, 'activityStudents')[id] || {}; return { kind, id, uid, on: w[uid] !== true }; }
      case 'wholeClass': { const ids = IDS.filter(id => mMap(d, 'activityStudents')[id]); if (!ids.length) continue; return { kind, id: pick(rng, ids) }; }
      case 'optional': { const id = busy(); return { kind, id, on: !mOptionalFlag(ACT[id], d, !!mTicked(d, id)) }; }
      case 'songPlace': { const ids = IDS.filter(id => mIsSongCard(ACT[id])); if (!ids.length) continue; const id = pick(rng, ids); return { kind, id, toSongs: !mOnSongs(ACT[id], d) }; }
      case 'classSong': { const ids = IDS.filter(id => ACT[id].teacherOnly === true); if (!ids.length) continue; const id = pick(rng, ids); return { kind, id, on: mMap(d, 'classSongs')[id] !== true }; }
      case 'archive': { const id = chance(rng, 0.75) ? (rich() || busy()) : busy(); return { kind, id, on: !mRetired(ACT[id], d) }; }
      case 'delete': { const id = chance(rng, 0.75) ? (rich() || busy()) : busy(); if (mMap(d, 'deletedActivities')[id]) continue; return { kind, id }; }
      case 'playAlong': { const ids = IDS.filter(id => ACT[id].view === 'card'); const id = pick(rng, ids); return { kind, id, on: mMap(d, 'playAlongActivities')[id] !== true }; }
      case 'clear': {
        const blk = mDocAnswers(d, progs[uid], uid, today).blk;
        const id = blk.length && chance(rng, 0.7) ? pick(rng, blk) : busy();
        return { kind, id, uid, on: mMap(mMap(d, 'activityClears'), uid)[id] !== true };
      }
      case 'clearAll': return { kind, uid };
      case 'period': return { kind, uid, value: pick(rng, ['CAS', '4', '7', 'auto']) };
      case 'openThrough': return { kind, uid, value: pick(rng, [2, 4, 7, 12, 'auto']) };
      case 'classGames': return { kind, on: d.gamesEnabled === false };
      case 'studentGames': return { kind, uid, state: pick(rng, ['on', 'off', 'default']) };
      case 'move': {
        if (!seeded) continue;
        const ids = IDS.filter(id => !mOnSongs(ACT[id], d) && !mTeacherOnly(ACT[id], d) && !mRetired(ACT[id], d));
        const id = pick(rng, ids);
        const module = pick(rng, [0, ...DATA.manifest]);
        return { kind, id, module, pos: 1 + Math.floor(rng() * 6) };
      }
      case 'unassign': {
        if (!seeded) continue;
        const ids = IDS.filter(id => board[id] && !mOnSongs(ACT[id], d) && !mTeacherOnly(ACT[id], d) && !mRetired(ACT[id], d));
        if (!ids.length) continue;
        return { kind, id: pick(rng, ids) };
      }
    }
  }
  return { kind: 'hide', id: IDS[0], on: true };
}
const J = JSON.stringify;
function writerCall(ch) {
  switch (ch.kind) {
    case 'date': return `teacherSetActivityDate(${J(ch.id)}, ${J(ch.value)})`;
    case 'hide': return `teacherSetActivityHidden(${J(ch.id)}, ${J(ch.on ? 'hide' : 'show')})`;
    case 'who': return `teacherSetActivityStudent(${J(ch.id)}, ${J(ch.uid)}, ${ch.on})`;
    case 'wholeClass': return `teacherSetActivityWholeClass(${J(ch.id)})`;
    case 'optional': return `teacherSetActivityOptional(${J(ch.id)}, ${J(ch.on ? 'optional' : 'required')})`;
    case 'songPlace': return `teacherSetSongPlace(${J(ch.id)}, ${J(ch.toSongs ? 'songs' : 'activities')})`;
    case 'classSong': return `teacherSetClassSong(${J(ch.id)}, ${ch.on})`;
    case 'archive': return `teacherSetActivityArchived(${J(ch.id)}, ${J(ch.on ? 'archive' : 'restore')})`;
    case 'delete': return `teacherDeleteActivity(${J(ch.id)})`;
    case 'playAlong': return `teacherSetActivityPlayAlong(${J(ch.id)}, ${J(ch.on ? 'now' : 'date')})`;
    case 'clear': return `teacherSetActivityClear(${J(ch.uid)}, ${J(ch.id)}, ${J(ch.on ? 'clear' : 'unclear')})`;
    case 'clearAll': return `teacherClearAllBlockers(${J(ch.uid)})`;
    case 'period': return `teacherSetStudentPeriod(${J(ch.uid)}, ${J(ch.value)})`;
    case 'openThrough': return `teacherSetStudentOpenThrough(${J(ch.uid)}, ${J(ch.value === 'auto' ? 'auto' : String(ch.value))})`;
    case 'classGames': return `teacherSetClassGames(${ch.on})`;
    case 'studentGames': return `teacherSetStudentGames(${J(ch.uid)}, ${J(ch.state)})`;
    case 'move': return `teacherMoveActivity(${J(ch.id)}, ${ch.module}, ${ch.pos})`;
    case 'unassign': return `teacherUnassignActivity(${J(ch.id)})`;
  }
  throw new Error('no writer for ' + ch.kind);
}
const chLabel = ch => [ch.kind, ch.id, ch.uid, ch.value, ch.on === undefined ? undefined : (ch.on ? 'on' : 'off'), ch.state, ch.toSongs === undefined ? undefined : (ch.toSongs ? 'to Songs' : 'to Class'), ch.module === undefined ? undefined : `module ${ch.module} #${ch.pos}`].filter(x => x !== undefined && x !== '').join(' ');
const getPath = (d, path) => path.split('.').reduce((c, k) => (c && typeof c === 'object' ? c[k] : undefined), d);
function dropPath(d, path) {
  const parts = path.split('.');
  let cur = d;
  for (let i = 0; i < parts.length - 1; i++) { if (!cur || typeof cur !== 'object') return; cur = cur[parts[i]]; }
  if (cur && typeof cur === 'object') delete cur[parts[parts.length - 1]];
}

/* One console change through the real writer, then R11: the doc, the version, the console's copy, its answers. */
async function consoleChange(con, store, ch, label, progs, today) {
  const before = store.read('config/class');
  C.changes++;
  KIND_COUNT[ch.kind] = (KIND_COUNT[ch.kind] || 0) + 1;
  if ((ch.kind === 'delete' || ch.kind === 'archive') && (mMap(before, 'hiddenActivities')[ch.id] === true || mMap(before, 'activityStudents')[ch.id])) C.richRetire[ch.kind]++;
  if ((ch.kind === 'delete' || ch.kind === 'archive') && (ch.id in mMap(before, 'activityTitles') || (Array.isArray(before.activityPins) && before.activityPins.includes(ch.id)))) C.namedRetire[ch.kind]++;
  step(`${label}: console writes`);
  const writesBefore = store.counts.writes;
  try { await con.run(`(async function(){ await ${writerCall(ch)}; })()`); }
  catch (e) { fail(`${label}: console writer`, 'threw ' + (e && e.message)); }
  await flush();
  C.writes += store.counts.writes - writesBefore;
  if (con.alerts.length) { fail(`${label}: console`, `alert: ${con.alerts.join(' / ').slice(0, 200)}`); con.alerts.length = 0; }
  const after = store.read('config/class');
  const exp = mExpectChange(before, ch, progs, today);
  let nExp = normDoc(exp.doc), nGot = normDoc(after);
  exp.dontCare.forEach(p => { dropPath(nExp, p); dropPath(nGot, p); });
  nExp = normDoc(nExp); nGot = normDoc(nGot);
  C.comparisons++;
  if (canon(nExp) !== canon(nGot)) {
    const keys = sortU([...Object.keys(nExp), ...Object.keys(nGot)]).filter(k => canon(nExp[k]) !== canon(nGot[k]));
    const cell = k => {
      const e = nExp[k], g = nGot[k];
      const show = v => (v === undefined ? 'absent' : canon(v).slice(0, 160));
      if (!e || !g || typeof e !== 'object' || typeof g !== 'object' || Array.isArray(e) || Array.isArray(g)) return `${k}: expected ${show(e)}, got ${show(g)}`;
      const sub = sortU([...Object.keys(e), ...Object.keys(g)]).filter(x => canon(e[x]) !== canon(g[x]));
      return `${k}: ` + sub.map(x => `${x} expected ${show(e[x])}, got ${show(g[x])}`).join('; ');
    };
    fail(`${label}: config/class after the write`, keys.map(cell).join(' | '));
  }
  if (exp.effect) { const p = exp.effect(after); C.comparisons++; if (p) fail(`${label}: effect`, p); }
  const vExp = (Number(before.configVersion) || 0) + (exp.wrote ? 1 : 0);
  C.comparisons++;
  if ((Number(after.configVersion) || 0) !== vExp) fail(`${label}: configVersion`, `expected ${vExp}, got ${after.configVersion}`);
  const copy = JSON.parse(con.run('JSON.stringify(teacherClassConfig)'));
  C.comparisons++;
  if (canon(normDoc(copy)) !== canon(normDoc(after))) {
    const a = normDoc(copy), b = normDoc(after);
    const keys = sortU([...Object.keys(a), ...Object.keys(b)]).filter(k => canon(a[k]) !== canon(b[k]));
    fail(`${label}: the console's copy`, `differs from config/class at ${keys.join(', ')}`);
  }
  UIDS.forEach(u => {
    const dd = answerDiff(mDocAnswers(after, progs[u], u, today), probeConsole(con, u), ['vis', 'blk']);
    if (dd.length) fail(`${label}: console after the write, ${u}`, dd.join(' | '));
  });
  return after;
}

async function runCase(idx) {
  const rng = mulberry32(caseSeed(SEED, idx));
  const [dayLabel, nowMs] = DAYS[idx % DAYS.length];
  VNOW = nowMs + Math.floor(rng() * 1000);
  const today = modelToday(VNOW);
  CUR = { seed: SEED, idx, label: `${dayLabel}, today ${today}` };
  C.cases++;
  step(`case ${idx}: ${CUR.label}`);
  const store = new Store();
  const { doc, progs } = genWorld(rng, today);
  progs[NEW_UID] = null;
  store.put('config/class', doc);
  UIDS.forEach(u => store.put('progress/' + u, progs[u]));
  const device = { storage: makeStorage(), wc: null, slot: null, own: {} };
  const readMode = () => { const r = rng(); return r < 0.66 ? 'ok' : r < 0.84 ? 'fail' : 'empty'; };
  const progMode = () => (chance(rng, 0.9) ? 'ok' : 'fail');
  let slot = idx * 5;

  let con = await bootConsole(store);
  step(`case ${idx}: console booted`);
  /* A fresh sign-in on this Chromebook, judged against the model; three-way when both reads succeeded. */
  const fresh = async (uid, cMode, pMode, special, label) => {
    /* Where the sign-in starts (R13): a bare address, a page, a lesson, an activity's deep link, the live quiz;
       sometimes back from a Song Journey page, sometimes the site's own update reload. */
    const hash = pick(rng, ['', '', '#songs', '#my-progress', '#m4w2', `#class-activities/${pick(rng, IDS)}`, '#live-quiz']);
    const nav = { hash, fromJourney: chance(rng, 0.2), resume: chance(rng, 0.1) };
    const navLabel = `start ${hash || '(bare)'}${nav.fromJourney ? ', from a Journey page' : ''}${nav.resume ? ', update reload' : ''}`;
    step(`${label}: signing in ${uid}${special ? ' (' + special + ')' : ''}, config ${cMode}, progress ${pMode}, ${navLabel}`);
    const page = await bootStudent(device, store, uid, cMode, pMode, special, nav);
    C.freshLoads++;
    if (uid === NEW_UID && !progs[uid]) C.newStudent++;
    const d = store.read('config/class');
    let st;
    if (special === 'dev') st = { S: Object.assign(studentBase(uid, null, true, 'dev', today), { doc: {}, who: { mode: 'live' }, override: '', openThrough: 0, games: true }), known: [] };
    else st = mPageState(device, d || {}, uid, cMode === 'ok' && d ? 'ok' : (cMode === 'ok' ? 'empty' : cMode), null, studentBase(uid, progs[uid], pMode === 'ok', special, today));
    const got = probeStudent(page);
    const verdict = judgeStudent(`${label}: fresh sign-in ${uid}${special ? ' (' + special + ')' : ''} (config read ${cMode}, progress ${pMode})`, got, st.S, st.known);
    if (got.gated) C.gatedSeen++;
    if (got.blk.length) C.withBlocker++;
    if (cMode === 'ok' && pMode === 'ok' && !special) threeWay(`${label}: ${uid}`, got, con, uid, d, progs[uid], today);
    const kS = verdict === 'known' ? st.known[0].S : null;
    const SJ = kS || st.S;
    const where = `${label}: fresh sign-in ${uid}${special ? ' (' + special + ')' : ''} (config read ${cMode}, progress ${pMode}, ${navLabel})`;
    /* R13 the landing. */
    const expHash = mLanding(SJ, nav);
    C.landingChecks++; C.comparisons++;
    if (page.landed === '#class-activities' && expHash === '#class-activities') C.landed++;
    /* Compared by page: a deep link's tail is the router's to resolve (a card this student cannot open falls back
       to the bare page with "link missing"). */
    const pageOf = h => (h.includes('/') ? h.slice(0, h.indexOf('/')) : h);
    if (pageOf(page.landed) !== pageOf(expHash)) fail(`${where}: landing`, `ended on ${page.landed || '(bare)'}, expected ${expHash || '(bare)'} (${mStudentBlockers(SJ).length} unfinished required activities)`);
    /* R15 the period question. */
    C.comparisons++;
    if (page.asked) C.asked++;
    if (page.asked !== mPeriodAsked(SJ)) fail(`${where}: period question`, page.asked ? 'asked, but the rules say this student is not asked' : 'not asked, but the rules say it is');
    /* R14 the first card. */
    let first;
    try { first = page.run(`(function(){ renderClassActivities(); return caStartHereId; })()`); } catch (e) { fail(`${where}: first card`, 'renderClassActivities threw ' + (e && e.message)); }
    if (first !== undefined) {
      C.firstChecks++; C.comparisons++;
      const prob = mFirstProblem(SJ, first);
      if (prob) fail(`${where}: first card`, prob);
    }
    /* R6 no lock: a student with an unfinished required activity still opens another page. */
    if (mStudentBlockers(SJ).length && !SJ.previewer) {
      const to = page.ctx.location.hash === '#songs' ? 'my-progress' : 'songs';
      page.ctx.__to = to;
      try { page.run('goExploreHash(__to)'); } catch (e) { fail(`${where}: router`, 'goExploreHash threw ' + (e && e.message)); }
      C.routerChecks++; C.comparisons++;
      if (page.ctx.location.hash !== '#' + to) fail(`${where}: router`, `a student with a blocker asked for #${to} and was sent to ${page.ctx.location.hash || '(bare)'}`);
    }
    return { page, S: st.S, kS, got, ok: verdict !== 'fail' };
  };
  /* Student events on an open page (R5): mark a blocker complete, or pick CAS. The real save path writes the
     progress doc; it is checked, the model's progress follows it, and the console re-reads its roster. */
  const studentEvent = async (opened, uid, label) => {
    const S = opened.S;
    if (!S.progressOk || S.previewer || S.dev) return;
    const blk = mStudentAnswers(S).blk;
    const r = rng();
    if (blk.length && r < 0.35) {
      const id = pick(rng, blk);
      step(`${label}: ${uid} marks ${id} complete`);
      opened.page.ctx.__id = id;
      await opened.page.run(`(async function(){ onClassActivityChange(__id, true); await flushSave(); })()`);
      await flush();
      C.marked++;
      const saved = store.read('progress/' + uid);
      C.comparisons++;
      if (!saved || !saved.classActivities || saved.classActivities[id] !== true) fail(`${label}: ${uid} marked ${id} complete`, `progress/${uid}.classActivities.${id} is ${saved && saved.classActivities ? saved.classActivities[id] : 'absent'}, not true`);
      const p = progs[uid] || (progs[uid] = { name: 'Fake User', email: `${uid}@example.test`, classActivities: {}, migrations: { swap45: true } });
      p.classActivities = Object.assign({}, p.classActivities, { [id]: true });
      S.done = Object.assign({}, S.done, { [id]: true });
      if (opened.kS) opened.kS.done = S.done;
      judgeStudent(`${label}: ${uid} marked ${id} complete — the same page at once`, probeStudent(opened.page), S, opened.kS ? [{ id: 'K1', S: opened.kS }] : []);
      await consoleRefetch(con);
    } else if (r < 0.5 && (S.override || S.ownPeriod) !== 'CAS') {
      step(`${label}: ${uid} picks CAS`);
      /* The answer comes from the period question's buttons (periodPick reads its overlay): open it first. */
      await opened.page.run(`(async function(){
        if (!document.getElementById('period-overlay')) { var o = document.createElement('div'); o.id = 'period-overlay'; document.body.appendChild(o); }
        await periodPick('CAS'); })()`);
      await flush();
      C.cas++;
      const saved = store.read('progress/' + uid);
      C.comparisons++;
      if (!saved || saved.period !== 'CAS') fail(`${label}: ${uid} picked CAS`, `progress/${uid}.period is ${saved ? JSON.stringify(saved.period) : 'absent'}, not "CAS"`);
      const p = progs[uid] || (progs[uid] = { name: 'Fake User', email: `${uid}@example.test`, classActivities: {}, migrations: { swap45: true } });
      p.period = 'CAS';
      S.ownPeriod = 'CAS';
      if (opened.kS) opened.kS.ownPeriod = 'CAS';
      judgeStudent(`${label}: ${uid} picked CAS — the same page at once`, probeStudent(opened.page), S, opened.kS ? [{ id: 'K1', S: opened.kS }] : []);
      await consoleRefetch(con);
    }
  };

  /* Phase A — every student signs in once on the same Chromebook; sometimes the new student too. */
  for (const u of UIDS) await fresh(u, chance(rng, 0.8) ? 'ok' : readMode(), progMode(), null, 'A');
  if (chance(rng, 0.4)) await fresh(NEW_UID, chance(rng, 0.8) ? 'ok' : readMode(), 'ok', null, 'A');
  if (chance(rng, 0.25)) await fresh('stu-teacher', 'ok', 'ok', 'teacher-email', 'A');

  /* Phase B/C — one to three console changes, an open page before and after its tab comes back, then fresh
     sign-ins. */
  const rounds = 3;
  for (let r = 0; r < rounds; r++) {
    const special = chance(rng, 0.12) ? 'dev' : null;
    const openUid = special === 'dev' ? 'dev-user' : (chance(rng, 0.15) ? NEW_UID : pick(rng, UIDS));
    const opened = await fresh(openUid, special === 'dev' ? 'none' : (chance(rng, 0.85) ? 'ok' : readMode()), 'ok', special, `R${r}`);
    await studentEvent(opened, openUid, `R${r}`);
    const prevS = opened.S;
    const nCh = (() => { const x = rng(); return x < 0.25 ? 1 : x < 0.55 ? 2 : 3; })();
    const labels = [];
    let after = store.read('config/class');
    for (let k = 0; k < nCh; k++) {
      const ch = pickChange(rng, after, today, progs, openUid, slot++);
      const lab = `R${r}.${k} ${chLabel(ch)}`;
      labels.push(ch.kind);
      after = await consoleChange(con, store, ch, lab, progs, today);
    }
    const row = nCh === 1 ? labels[0] : 'several (2-3)';
    if (nCh > 1) C.several++;
    const label = `R${r} ${nCh === 1 ? labels[0] : nCh + ' changes: ' + labels.join(', ')}`;
    const knownOpen = opened.kS ? [{ id: 'K1', S: opened.kS }] : [];

    /* R12: the open page before its tab comes back. */
    const page = opened.page;
    let got = probeStudent(page);
    tally(row, 'open page, tab not back: old answer', judgeStudent(`${label}: page open since before the change, tab not back yet`, got, prevS, knownOpen) !== 'fail');
    /* Tab return: hold the read, look during it, release. */
    const tMode = special === 'dev' ? 'ok' : readMode();
    page.client.plan.config.push({ mode: tMode, hold: true });
    const sigBefore = got.sig;
    step(`${label}: tab comes back (read ${tMode})`);
    page.ctx.document.hidden = false;
    (page.docListeners.visibilitychange || []).forEach(fn => fn({}));
    await flush();
    C.tabReturns++;
    if (page.client.held.length) {
      C.midRead++;
      tally(row, 'during the tab-return read: old answer', judgeStudent(`${label}: during the tab-return read`, probeStudent(page), prevS, knownOpen) !== 'fail');
      page.client.release();
      await flush();
    } else fail(`${label}: tab return`, 'the page did not read config/class when its tab came back');
    got = probeStudent(page);
    const st2 = mPageState(device, after, openUid, tMode, prevS, Object.assign(studentBase(openUid, progs[openUid], true, special, today), { done: prevS.done, ownPeriod: prevS.ownPeriod }));
    if (special === 'dev') st2.S.who = tMode === 'ok' ? { mode: 'live' } : prevS.who;
    if (tMode !== 'ok' && opened.kS) st2.known.push({ id: 'K1', S: Object.assign({}, st2.S, { override: opened.kS.override, openThrough: opened.kS.openThrough }) });
    tally(row, tMode === 'ok' ? 'tab back, read ok: new answer' : 'tab back, read failed: old answer', judgeStudent(`${label}: page open since before the change, tab back (read ${tMode})`, got, st2.S, st2.known) !== 'fail');
    if (tMode === 'ok') {
      const moved = answerDiff(mStudentAnswers(prevS), mStudentAnswers(st2.S), ['vis', 'opt', 'blk', 'pao', 'num', 'games'], false).length > 0;
      C.comparisons++;
      if (moved && got.sig === sigBefore) fail(`${label}: tab back`, 'the student\'s answer changed but classConfigSignature() did not, so the open In-Class Activities screen is not repainted');
      if (prevS.games !== st2.S.games) { C.gamesTabReturn[1]++; if (got.gamesBtn === (st2.S.games ? '' : 'none')) C.gamesTabReturn[0]++; }
    } else if (prevS.games === false) C.gamesKeepLast++;

    /* The open page closes (another sign-in on this Chromebook reloads it); fresh sign-ins follow. */
    const n = 1 + Math.floor(rng() * 3);
    const order = [...UIDS, NEW_UID].sort(() => rng() - 0.5).slice(0, n);
    for (const u of order) {
      const res = await fresh(u, readMode(), progMode(), null, `${label} → fresh`);
      tally(row, 'fresh sign-in: rules for its read', res.ok);
    }
    if (chance(rng, 0.3)) { con = await bootConsole(store); step(`${label}: console re-read`); }
  }
}

/* R12 + the signature, directed (round-2 review R2-5): one change per input of classConfigSignature that the
   student's answer reads, each aimed so that it ALONE moves stu-alpha's answer, then a tab return with a good read.
   The answer must move (the model) and the signature must move with it, or an open In-Class Activities screen is
   not repainted. Fixed, not seeded: the same 13 steps every run. */
async function directedSignature() {
  const uid = 'stu-alpha';
  const nowMs = DAYS[0][1];
  VNOW = nowMs;
  const today = modelToday(VNOW), tomorrow = modelAddDays(today, 1);
  CUR = { seed: SEED, idx: 'sig', label: `directed signature block, today ${today}` };
  step('directed signature block');
  const plain = ACTS.filter(a => !mIsSongCard(a) && a.teacherOnly !== true && a.optional !== true && a.kind !== 'check' && a.view !== 'card');
  const P = ACTS.find(a => a.view === 'card' && !mIsSongCard(a) && a.teacherOnly !== true);
  const G = ACTS.find(a => mIsSongCard(a));
  const T = ACTS.find(a => a.teacherOnly === true && !mIsSongCard(a));
  if (plain.length < 7 || !P || !G || !T) { fail('setup', `needs 7 plain cards, a practice card, a song card and a teacher-only card; found ${plain.length}, ${!!P}, ${!!G}, ${!!T}`); return; }
  const c = plain.slice(0, 7).map(a => a.id);
  const d = { activityBoardSeeded: true, activityBoard: {}, activityDates: {}, songLibrary: { [G.id]: false }, configVersion: 1 };
  [...c, P.id, G.id, T.id].forEach((id, i) => { d.activityBoard[id] = { module: 1, pos: i + 1 }; d.activityDates[id] = today; });
  d.activityDates[P.id] = tomorrow;
  const progs = { [uid]: { name: NAMES[uid], email: 'stu1@example.test', period: '4', classActivities: {}, migrations: { swap45: true } } };
  UIDS.filter(u => u !== uid).forEach((u, i) => { progs[u] = { name: NAMES[u], email: `stu${i + 2}@example.test`, period: '7', classActivities: {}, migrations: { swap45: true } }; });
  const store = new Store();
  store.put('config/class', d);
  UIDS.forEach(u => store.put('progress/' + u, progs[u]));
  const device = { storage: makeStorage(), wc: null, slot: null, own: {} };
  const con = await bootConsole(store);
  const page = await bootStudent(device, store, uid, 'ok', 'ok', null, { hash: '#class-activities' });
  let prevS = mPageState(device, store.read('config/class'), uid, 'ok', null, studentBase(uid, progs[uid], true, null, today)).S;
  const steps = [
    ['dates', { kind: 'date', id: c[0], value: tomorrow }],
    ['board', { kind: 'unassign', id: c[1] }],
    ['hidden', { kind: 'hide', id: c[2], on: true }],
    ['Who (activityForMe)', { kind: 'who', id: c[3], uid: 'stu-bravo', on: true }],
    ['retired', { kind: 'archive', id: c[4], on: true }],
    ['clears', { kind: 'clear', uid, id: c[5], on: true }],
    ['optional', { kind: 'optional', id: c[6], on: true }],
    ['Play Along now', { kind: 'playAlong', id: P.id, on: true }],
    ['songLibrary', { kind: 'songPlace', id: G.id, toSongs: true }],
    ['classSongs', { kind: 'classSong', id: T.id, on: true }],
    ['period override', { kind: 'period', uid, value: 'CAS' }],
    ['Open through', { kind: 'openThrough', uid, value: 5 }],
    ['games', { kind: 'classGames', on: false }],
  ];
  for (const [input, ch] of steps) {
    const label = `sig ${input}`;
    const sigBefore = probeStudent(page).sig;
    const after = await consoleChange(con, store, ch, `${label}: ${chLabel(ch)}`, progs, today);
    page.client.plan.config.push('ok');
    (page.docListeners.visibilitychange || []).forEach(fn => fn({}));
    await flush();
    const got = probeStudent(page);
    const S = mPageState(device, after, uid, 'ok', prevS, Object.assign(studentBase(uid, progs[uid], true, null, today), { done: prevS.done, ownPeriod: prevS.ownPeriod })).S;
    judgeStudent(`${label}: tab back (read ok)`, got, S, []);
    C.sigSteps++; C.comparisons += 2;
    if (!answerDiff(mStudentAnswers(prevS), mStudentAnswers(S), ['vis', 'opt', 'blk', 'pao', 'num', 'period', 'openThrough', 'games'], false).length) fail(`${label}`, 'the aimed change did not move the student\'s answer (the block is mis-aimed)');
    if (got.sig === sigBefore) fail(`${label}: tab back`, `only ${input} changed and the student's answer moved, but classConfigSignature() did not, so the open In-Class Activities screen is not repainted`);
    prevS = S;
  }
}

/* ── Run ── */
process.on('unhandledRejection', e => { fail('unhandled rejection', String(e && e.stack || e).split('\n').slice(0, 3).join(' / ')); });
const indices = ONE_CASE !== null ? [ONE_CASE] : Array.from({ length: CASES }, (_, i) => i);
const FULL_RUN = ONE_CASE === null && CASES >= 60;
for (const i of indices) {
  const f0 = FAILS.length;
  try { await runCase(i); }
  catch (e) { fail('harness', String(e && e.stack || e).split('\n').slice(0, 4).join(' / ')); }
  if (VERBOSE && LOG.length) LOG.filter(l => l[0] !== 'log').slice(0, 20).forEach(l => console.log(`    [${l[1]} ${l[0]}] ${l[2].slice(0, 200)}`));
  LOG = [];
  if (FAILS.length > f0 && FAILS.length - f0 > 40) FAILS.splice(f0 + 40);
}
if (ONE_CASE === null) {
  try { await directedSignature(); } catch (e) { fail('harness (signature block)', String(e && e.stack || e).split('\n').slice(0, 4).join(' / ')); }
}
clearInterval(watchdog);
if (FULL_RUN) {
  CHANGE_KINDS.forEach(k => { if ((KIND_COUNT[k] || 0) < KIND_FLOOR) { CUR = { seed: SEED, idx: '-', label: 'whole run' }; fail('sampling', `${k} ran ${KIND_COUNT[k] || 0} times, under the floor of ${KIND_FLOOR}`); } });
  ['archive', 'delete'].forEach(k => { if (C.namedRetire[k] < RICH_FLOOR) { CUR = { seed: SEED, idx: '-', label: 'whole run' }; fail('sampling', `${k} hit a renamed or pinned card ${C.namedRetire[k]} times, under the floor of ${RICH_FLOOR}`); } });
  ['archive', 'delete'].forEach(k => { if (C.richRetire[k] < RICH_FLOOR) { CUR = { seed: SEED, idx: '-', label: 'whole run' }; fail('sampling', `${k} hit a Hidden or Who card ${C.richRetire[k]} times, under the floor of ${RICH_FLOOR}`); } });
  Object.keys(KNOWN_HITS).forEach(k => { if (!KNOWN_HITS[k]) { CUR = { seed: SEED, idx: '-', label: 'whole run' }; fail(`KNOWN ${k}`, `matched nothing in a full run — if the fault is fixed, delete its entry (header and KNOWN_HITS) in the same change`); } });
}

const out = [];
out.push(`visible-loop: root ${ROOT === resolve(join(HERE, '..')) ? '(this checkout)' : ROOT}, seed ${SEED}, ${indices.length === 1 ? 'case ' + indices[0] : indices.length + ' cases'}${BREAK_FAKE ? ', FAKE BROKEN: ' + BREAK_FAKE : ''}`);
out.push(`  ${C.cases} cases over ${DAYS.length} kinds of day · ${C.pages} pages booted · ${C.freshLoads} fresh sign-ins (${C.newStudent} with no progress doc) · ${C.threeWay} three-way student/console/Journey comparisons`);
out.push(`  ${C.changes} console changes through the real writers (${C.writes} writes; ${C.several} tab returns came after 2-3 changes) · ${C.tabReturns} tab returns (${C.midRead} looked at mid-read)`);
out.push(`  student events through the real save path: ${C.marked} cards marked complete, ${C.cas} CAS picks`);
out.push(`  config/progress reads served: ${READS.ok} ok, ${READS.fail} failed, ${READS.empty} empty · ${C.comparisons} fields compared`);
out.push(`  the lock (R6): body.ca-gated seen on ${C.gatedSeen} of ${C.freshLoads} sign-ins (and after every tab return); JOURNEY_GATE_LOCKS read false on ${C.journeyLocks} Journey probes; ${C.routerChecks} students with an unfinished required activity asked the router for another page`);
out.push(`  the landing (R13, the real showApp): ${C.landingChecks} sign-ins from a bare address, a page, a lesson, a deep link, the live quiz, a Journey page or an update reload; ${C.landed} ended on In-Class Activities (${C.withBlocker} had an unfinished required activity)`);
out.push(`  the signature, directed: ${C.sigSteps} of 13 inputs changed alone, each followed by a tab return with a good read`);
out.push(`  the first card (R14, caStartHereId after the real renderClassActivities): ${C.firstChecks} sign-ins checked · the period question (R15) asked at ${C.asked} sign-ins`);
out.push(`  changes by kind (floor ${KIND_FLOOR}${FULL_RUN ? '' : ', checked on a full run only'}): ` + CHANGE_KINDS.map(k => `${k} ${KIND_COUNT[k] || 0}`).join(' · ') + ` (of them on a Hidden or Who card: archive ${C.richRetire.archive}, delete ${C.richRetire.delete}; on a renamed or pinned card: archive ${C.namedRetire.archive}, delete ${C.namedRetire.delete})`);
out.push('  WHEN a console change reaches a student (R12) — passed / run, by change and moment:');
const COLS = ['open page, tab not back: old answer', 'during the tab-return read: old answer', 'tab back, read ok: new answer', 'tab back, read failed: old answer', 'fresh sign-in: rules for its read'];
out.push('    ' + 'change'.padEnd(14) + ['open, not back', 'mid-read', 'back, ok read', 'back, failed', 'fresh'].map(x => x.padStart(15)).join(''));
[...CHANGE_KINDS, 'several (2-3)'].forEach(k => {
  const r = TRUTH[k]; if (!r) return;
  out.push('    ' + k.padEnd(14) + COLS.map(c => (r[c] ? `${r[c][0]}/${r[c][1]}` : '-').padStart(15)).join(''));
});
out.push('  measured, not judged:');
out.push(`    an open Journey page: tabs/journey.js ${/addEventListener\(\s*['"]visibilitychange['"]/.test(readFileSync(join(ROOT, 'tabs/journey.js'), 'utf8')) ? 'listens for visibilitychange' : 'has no tab-return re-read — it decides once per page load'} (no prose says when)`);
out.push(`    stale console text: teacher-config.js:420 says games change "the next time a student loads the site"; the Games button followed a games change on tab return ${C.gamesTabReturn[0]} of ${C.gamesTabReturn[1]} times`);
out.push(`    stale comment: save.js:225 "Reads that fail ... leave games ON"; a failed tab-return read kept games off (intended) ${C.gamesKeepLast} times`);
const knownLines = Object.keys(KNOWN_HITS).map(k => `    ${k}: known, listed ${KNOWN_LISTED[k]} — matched ${KNOWN_HITS[k]} times${KNOWN_FIRST[k] ? '; first: ' + KNOWN_FIRST[k] : ''}`);
out.push('  KNOWN faults (listed for Jonathan, not fixed; header "KNOWN"):');
knownLines.forEach(l => out.push(l.slice(0, 420)));
if (FAILS.length) {
  out.push(`  ✗ ${FAILS.length} contradiction${FAILS.length === 1 ? '' : 's'}${FAILS.length > 25 ? ' (first 25)' : ''}:`);
  FAILS.slice(0, 25).forEach(f => out.push('    ' + f.slice(0, 600)));
  out.push(`  replay one: node tools/visible-loop.mjs --seed ${SEED} --case <n> --verbose${ROOT === resolve(join(HERE, '..')) ? '' : ' --root ' + ROOT}`);
  out.push('visible-loop: ✗ FAIL');
} else out.push('visible-loop: ✓ every comparison held');
console.log(out.join('\n'));
console.error(`visible-loop: ${((Date.now() - T_START) / 1000).toFixed(1)} s`);
process.exit(FAILS.length ? 1 : 0);
