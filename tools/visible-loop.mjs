#!/usr/bin/env node
/* visible-loop.mjs — closed loop: which In-Class Activities a student sees and which ones block (2026-11-11).

   The question it answers. For a class config, a day, a student and a run of config reads that succeed, fail or
   come back empty: do the student app, the teacher console and the Song Journey pages AGREE on which activities a
   student sees and which ones block, and is that the answer the written rules give? And after a console change
   (a date, Hide, Who, Optional, Move to Songs, Archive / Delete, Play Along now, Clear, Clear all, a period
   override / CAS, Open through, class games, a board move), what does a student page show: one loaded BEFORE the
   change (before and after its tab comes back) and a fresh load?

     node tools/visible-loop.mjs                       120 cases, seed 1
     node tools/visible-loop.mjs --cases 400 --seed 7
     node tools/visible-loop.mjs --case 12 --verbose   replay one case alone, with a trace
     node tools/visible-loop.mjs --root <site folder>  run the code of another checkout (break-it copies)
     node tools/visible-loop.mjs --break-fake merge    self-test: the fake Firestore replaces maps instead of merging
     node tools/visible-loop.mjs --break-fake clock    self-test: the pages get the REAL clock, not the virtual day
   Exit 0 = every comparison held; 1 = a contradiction (each prints its seed, case and step); 3 = the watchdog
   (nothing moved for 120 s; it prints the step it was on). The time taken goes to stderr, so the same seed prints
   the same stdout byte for byte. About 20-40 s for 150 cases. Node only: no browser, no network, no Firebase.

   When to run it: after a change to any of the visibility / blocker / optional rules (caIsVisible, caIsOptional,
   caBlockers, caReduceForMe, caBoardOrder in app/activities-2.js; teacherActivityVisible, teacherBlockersFor,
   teacherActivityOptional, teacherBoardView in teacher-config.js / teacher-activities.js; journeyIsVisible,
   journeyOptional, journeyBlockers in tabs/journey.js), to loadClassConfig / restoreClassConfigFromCache /
   classConfigSignature (app/save.js, app/activities-2.js), or to a console writer of config/class. It is not part
   of tools/checks.mjs (check 1ah compares the three copies by source text only; this runs them).

   ── What is REAL (loaded whole and unmodified into Node vm contexts) ──
   * Student page: config-main.js, class-activities.js, i18n.js, guitar-diagrams.js, then the whole app script
     (siteSource('app.js'): every app/*.js part in index.html order). Boot = the real loadProgress() then
     loadClassConfig() (what start.js's sign-in callback runs), then the two calls showApp() makes about this
     (applyGamesAccess, applyActivityGate) with #app shown. A tab return fires the real visibilitychange listener.
     Probed: caIsVisible, caIsOptional, caBlockers, caIsPlayAlongOnly, caNumber, periodOverride,
     moduleOpenThrough, gamesAccessOn, the Games button's display, body.ca-gated, classConfigSignature().
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
     process runs in America/Los_Angeles (TZ), so daylight saving is real.
   * localStorage: one object per Chromebook, shared by every page loaded on it (uid B after uid A). A sign-out or
     another student's sign-in reloads the page (app/start.js), so each sign-in is a fresh page here.
   * The DOM: a stub. #class-activities-screen and #songs-screen are hidden (the page renders nothing); timers
     never fire; alert() is recorded (any alert in this single-console world is a failure).
   * Names: three made-up students (stu-alpha / -bravo / -charlie, "Test Student A/B/C", @example.test), a
     teacher account teacher@example.test, and two special users: 'dev-user' (dev bypass) and a student signed in
     with the teacher's email (a gate previewer).

   ── NOT modelled ──
   The two-console write race (tools/two-consoles-loop.mjs); screens and renders (only predicates and the
   values they read); the Journey "sentHere" exemption (page-level, and unreachable while JOURNEY_GATE_LOCKS is
   false); Today's activities (check 1cq); pins; renames; the legacy activityNumbers overrides (generated empty);
   Pause; the Firestore listener-free console reading another console's writes; a failed read by the console
   (its views refuse to draw); the dev bypass's boot path beyond "no reads at boot".

   ── The independent answer: the RULES the model is written from (it never calls the code under test) ──
   R1  Visible, in this order (skill in-class-activities, "Activity order, numbering and the board"; comments on
       caIsVisible, app/activities-2.js): archived or deleted -> no; not on the board -> no; Hidden -> no; given
       to other students only (Who) -> no; dev bypass -> yes; else the release date has arrived (local calendar
       day, 'YYYY-MM-DD' <= today). No date -> no.
   R2  "On the board": a seeded board (activityBoardSeeded true) assigns exactly the cards with a board entry; an
       UNSEEDED board assigns every card (caIsVisible's comment: "never lock on a guess"). A card on the Songs
       page (songLibrary true / its own `library: true`, the console's map winning) or a teacher-only card not
       moved to Class activities (classSongs) is never assigned, whatever row it left (skill, Songs table;
       teacher-console.md "Visibility must match the students'"). A song card = a non-check card with a `library`
       field that is not tied to a Journey page, a whole-song card or a lyric sheet (caIsSongCard's comment).
   R3  Who: a card whose activityStudents entry ticks anyone (true) is only for the ticked uids; none ticked =
       whole class (caReduceForMe's comment).
   R4  Optional: CAS (effective period = periodOverrides[uid] || the student's own answer) -> every card; else the
       console flag true/false wins; else Optional by default when the data says `optional: true` or the card has
       a Who list (caOptionalByDefault's comment, 2026-10-14). The console and the Journey pages fold CAS into
       their blocker rule instead (skill "CAS students").
   R5  Blocks = visible, not optional, not done (classActivities[id] === true), not cleared for this uid
       (activityClears[uid][id]). Never for a gate previewer (dev bypass, the teacher's email) and never after a
       failed progress load ("never lock on a guess").
   R6  The LOCK is off (Jonathan 2026-10-07, CA_GATE_LOCKS / JOURNEY_GATE_LOCKS): body.ca-gated is never set.
       Blocks still decide who LANDS on In-Class Activities at sign-in (counted, not judged).
   R7  Play Along now (skill): a practice card (view 'card') with the flag, assigned, not Hidden, not retired, and
       not already visible is reachable from Songs only; a Songs-page song is reachable when not Hidden and not
       retired and not visible. The flag never makes a card visible or blocking.
   R8  #N (caBoardOrder's comment; skill): Unsorted (module 0) first, then MODULE_MANIFEST order, then unknown
       modules in numeric order; inside a module by pos, then the shipped `number`, then the id's number; 1..N over
       the non-check, non-retired cards with no gaps. Unseeded: one Unsorted run in the shipped order.
   R9  A failed or empty config read (save.js comments on every cached field; "A student who has NEVER loaded
       config sees no activities"): the whole-class fields (dates, board, hidden, retired, clears, optional, Play
       Along, songs, classSongs) come from the last successful read ON THIS CHROMEBOOK; the per-uid fields
       (period override, Open through, the Who cards) carry the uid: the same uid gets its cached value, another
       uid does not inherit it (save.js:258-259), and gets every cached Who card read as someone else's
       (save.js:331-337). Games: a failed read at sign-in leaves games ON (save.js:225-226).
   R10 Games: a per-student override wins, else the class switch, else ON (save.js:220-226). Open through: only a
       whole number 2..12 counts (save.js:262-263). Period: the override, else none.
   R11 A console writer changes exactly the cells it names (each writer's comment; skill "Archive / Delete",
       "Per-student clears", "Optional activities", "Play Along now", Songs table), bumps configVersion by one, and
       its in-memory copy then equals the doc. Board moves re-pack pos 1..N in the module left and the module
       joined, archived rows keeping their slot (skill: "re-packs pos 1..N in both"); Delete also takes the board
       entry, date, rename, clears, pin, Optional and Play Along flags off; Archive keeps all but the pin; Clear
       all clears exactly the student's current blockers ("Recomputed at click time").
   R12 WHEN a change reaches a student (truth table, printed at the end): loadClassConfig "reruns on every
       tab-visibility return" (save.js:228-231), "A teacher's console clear (or a new activity going live) has to
       reach a student tab that's just sitting open" (activities-2.js:1208-1212), games on tab return
       (save.js:367-370), Open through repaints the rail (skill). So: an open page does not change before its tab
       comes back; after a successful tab-return read it shows the new answer (and its classConfigSignature moves
       whenever that answer moved, or the open screen is not repainted); after a FAILED tab-return read it keeps
       the old answer; a fresh load shows the new answer. During the read the page keeps showing the last known
       answer (save.js:228-238, the blank window found 2026-09-26).
   Cells the prose does not settle are reported as NOT STATED with what the code does, never judged:
   NS-slot  a uid whose own earlier successful read was overwritten in the Chromebook's per-uid cache by another
            uid, then a failed read (R9's "must not fail open to ''" vs "must not inherit the last one's").
   NS-games a failed tab-return read after games were turned off ("leave games ON" vs keep the last value).
   NS-pao   Play Along now on a card given to other students only (R7 names no Who rule).
   NS-del   whether Delete also clears Hidden, Who and the legacy number (the prose lists the others).
   NS-jny   when an already-open Journey page picks up a change (no prose; measured: it decides once per load).
   And one wording conflict, measured: teacher-config.js tells the teacher games change "the next time a student
   loads the site", save.js applies them on tab return.

   ── Break-it record (each a scratch copy run with --root; see the commit message for the red lines) ── */
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
const CASES = Number(argVal('--cases', '120'));
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
function mPlayAlongOnly(a, S, paoWho) {
  const d = S.doc;
  const hidden = mMap(d, 'hiddenActivities')[a.id] === true;
  if (mIsSongCard(a) && mOnSongs(a, d)) return !mRetired(a, d) && !hidden && !mVisible(a, S);
  if (a.view !== 'card' || mMap(d, 'playAlongActivities')[a.id] !== true) return false;
  if (mRetired(a, d) || hidden) return false;
  if (paoWho && !mForMe(a, S)) return false;
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
/* What the student page should answer, from S. paoWho: R7 with or without a Who rule (NS-pao). */
function mStudentAnswers(S, paoWho) {
  return {
    vis: ACTS.filter(a => mVisible(a, S)).map(a => a.id),
    opt: ACTS.filter(a => mStudentOptional(a, S)).map(a => a.id),
    blk: mStudentBlockers(S),
    pao: ACTS.filter(a => mPlayAlongOnly(a, S, paoWho)).map(a => a.id),
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
/* A student page's state after a load or a tab return. mode: 'ok' | 'fail' | 'empty'; prev: the page's state
   before (null for a fresh page). Returns { S, variants } — variants lists the readings the prose leaves open. */
function mPageState(device, d, uid, mode, prev, base) {
  const S = Object.assign({}, base, { uid });
  if (mode === 'ok') {
    mDeviceRead(device, d, uid);
    Object.assign(S, { doc: clone(d), who: { mode: 'live' }, override: mMap(d, 'periodOverrides')[uid] || '', openThrough: mOpenThrough(d, uid), games: mGames(d, uid) });
    return { S, open: {} };
  }
  const open = {};
  S.doc = device.wc ? clone(device.wc) : (prev ? prev.doc : {});
  const slot = device.slot;
  if (slot && slot.uid === uid) {
    S.override = slot.override; S.openThrough = slot.openThrough; S.who = { mode: 'mine', map: clone(slot.who) };
  } else {
    S.override = prev ? prev.override : '';
    S.openThrough = prev ? prev.openThrough : 0;
    S.who = slot ? { mode: 'other', map: clone(slot.who) } : (prev ? prev.who : { mode: 'live' });
    const own = device.own[uid];
    if (!prev && own && (own.override !== S.override || own.openThrough !== S.openThrough)) open.slot = { override: own.override, openThrough: own.openThrough };
  }
  if (!prev) S.games = true;
  else { S.games = prev.games; if (prev.games === false) open.games = true; }
  return { S, open };
}
/* Every reading of the open cells; the code must match at least one, and is judged only when they all agree. */
function mReadings(S, open) {
  const out = [];
  for (const slotOwn of open.slot ? [false, true] : [false]) {
    for (const gamesOn of open.games ? [false, true] : [false]) {
      for (const paoWho of [true, false]) {
        const s = Object.assign({}, S);
        if (slotOwn) { s.override = open.slot.override; s.openThrough = open.slot.openThrough; }
        if (gamesOn) s.games = true;
        out.push({ tags: [open.slot ? (slotOwn ? 'NS-slot:own last read' : 'NS-slot:default') : '', open.games ? (gamesOn ? 'NS-games:on' : 'NS-games:keep last') : '', paoWho ? 'NS-pao:Who applies' : 'NS-pao:Who ignored'].filter(Boolean), ans: mStudentAnswers(s, paoWho) });
      }
    }
  }
  return out;
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
      ['archivedActivities', 'optionalActivities', 'playAlongActivities', 'activityDates', 'activityTitles'].forEach(k => { delete m(k)[ch.id]; });
      ['hiddenActivities.', 'activityStudents.', 'activityNumbers.'].forEach(p => dontCare.push(p + ch.id));
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
function makePage(kind, storage, client) {
  const els = {};
  const getEl = id => els[id] || (els[id] = makeEl(id));
  getEl('class-activities-screen').hidden = true;
  getEl('songs-screen').hidden = true;
  getEl('games-screen').setAttribute('hidden', '');
  getEl('search-panel').setAttribute('hidden', '');
  const docListeners = {};
  const alerts = [];
  const head = makeEl('head');
  head.appendChild = s => { if (s && s.onload) queueMicrotask(() => s.onload()); return s; };
  const document = {
    documentElement: makeEl('html'), head, body: makeEl('body'), readyState: 'complete', referrer: '',
    getElementById: getEl, querySelector: () => null, querySelectorAll: () => [], createElement: () => makeEl(''),
    createDocumentFragment: () => makeEl(''), createTextNode: () => makeEl(''),
    addEventListener: (ev, fn) => { (docListeners[ev] = docListeners[ev] || []).push(fn); }, removeEventListener() {},
    hidden: false, visibilityState: 'visible', fonts: { ready: Promise.resolve() },
  };
  const firestore = Object.assign(() => client, { FieldValue: { delete: () => DELETE } });
  const ctx = {
    console: { log: (...a) => LOG.push(['log', kind, a.join(' ')]), warn: (...a) => LOG.push(['warn', kind, a.join(' ')]), error: (...a) => LOG.push(['error', kind, a.join(' ')]), info() {}, debug() {} },
    document, localStorage: storage, sessionStorage: makeStorage(),
    location: { protocol: 'https:', hostname: 'example.test', origin: 'https://example.test', href: 'https://example.test/' + (kind === 'console' ? '?teacher=true' : ''), pathname: '/', search: kind === 'console' ? '?teacher=true' : '', hash: '', reload() {}, replace() {} },
    history: { scrollRestoration: 'auto', replaceState() {}, pushState() {}, length: 1 },
    navigator: { userAgent: 'node', platform: 'node', language: 'en', onLine: true },
    setTimeout: () => 0, clearTimeout() {}, setInterval: () => 0, clearInterval() {}, requestAnimationFrame: () => 0, cancelAnimationFrame() {},
    queueMicrotask, matchMedia: () => ({ matches: false, addEventListener() {}, addListener() {} }), getComputedStyle: () => ({ getPropertyValue: () => '', paddingLeft: '0', paddingRight: '0' }),
    fetch: () => Promise.reject(new Error('no network')), CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o || {}); } },
    Image: class {}, Audio: class { play() { return Promise.resolve(); } pause() {} }, ResizeObserver: class { observe() {} disconnect() {} },
    performance: { now: () => VNOW }, URLSearchParams, URL, TextEncoder, TextDecoder,
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
];
const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
const chance = (rng, p) => rng() < p;
function genWorld(rng, today) {
  const d = {};
  if (chance(rng, 0.88)) d.activityBoardSeeded = true;
  const inPlay = IDS.filter(() => chance(rng, 0.45));
  ['ca-14', 'ca-34', 'ca-41', 'ca-40', 'ca-24'].forEach(id => { if (ACT[id] && chance(rng, 0.6) && !inPlay.includes(id)) inPlay.push(id); });
  const modules = [0, ...DATA.manifest.slice(0, 6)];
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
const C = { cases: 0, pages: 0, comparisons: 0, changes: 0, writes: 0, threeWay: 0, tabReturns: 0, midRead: 0, freshLoads: 0, landings: 0, gatedSeen: 0, notStated: {} };
const FAILS = [];
const TRUTH = {};
const tally = (kind, col, ok) => { const r = (TRUTH[kind] = TRUTH[kind] || {}); const c = (r[col] = r[col] || [0, 0]); c[1]++; if (ok) c[0]++; };
const noteNS = (cell, what) => { const r = (C.notStated[cell] = C.notStated[cell] || {}); r[what] = (r[what] || 0) + 1; };
let CUR = { seed: SEED, idx: 0, label: '' };
function fail(where, msg) { FAILS.push(`seed ${CUR.seed} case ${CUR.idx} [${CUR.label}] ${where}: ${msg}`); }
function diffList(exp, got) {
  const e = sortU(exp), g = sortU(got);
  const missing = e.filter(x => !g.includes(x)), extra = g.filter(x => !e.includes(x));
  return (missing.length || extra.length) ? `expected but missing [${missing.join(' ')}]; extra [${extra.join(' ')}]` : '';
}
const FIELDS = ['vis', 'opt', 'blk', 'pao', 'num', 'period', 'openThrough', 'games', 'gamesBtn', 'gated'];
function answerDiff(exp, got, fields = FIELDS) {
  const out = [];
  for (const f of fields) {
    if (!(f in exp)) continue;
    if (Array.isArray(exp[f])) { const d = diffList(exp[f], got[f] || []); if (d) out.push(`${f}: ${d}`); }
    else if (canon(exp[f]) !== canon(got[f])) out.push(`${f}: expected ${canon(exp[f])}, got ${canon(got[f])}`);
  }
  return out;
}
/* Compare a student page with every reading of the model; judged only where the readings agree. */
function judgeStudent(where, got, S, open) {
  const readings = mReadings(S, open);
  const distinct = new Map();
  readings.forEach(r => { const k = canon(r.ans); if (!distinct.has(k)) distinct.set(k, r); });
  C.comparisons += FIELDS.length;
  if (distinct.size === 1) {
    const d = answerDiff(readings[0].ans, got);
    if (d.length) fail(where, d.join(' | '));
    return !d.length;
  }
  const matched = readings.filter(r => !answerDiff(r.ans, got).length);
  if (!matched.length) {
    const d = answerDiff(readings[0].ans, got);
    fail(where, `matches no reading of the rules (open cells ${[...new Set(readings.flatMap(r => r.tags))].join(', ')}); against the first: ${d.join(' | ')}`);
    return false;
  }
  const cells = [...new Set(readings.flatMap(r => r.tags.map(t => t.split(':')[0])))];
  cells.forEach(cell => {
    const vals = rs => new Set(rs.flatMap(r => r.tags.filter(t => t.startsWith(cell + ':')).map(t => t.slice(cell.length + 1))));
    const all = vals(readings), got = vals(matched);
    if (got.size < all.size) noteNS(cell, 'code = ' + [...got].join(' / '));
  });
  return true;
}

/* ════════════════════════════════════════════════════════════════════════════
   THE CASE
   ════════════════════════════════════════════════════════════════════════════ */
async function bootStudent(device, store, uid, cfgMode, progMode, special) {
  const client = makeClient(store);
  if (special !== 'dev') { client.plan.config.push(cfgMode); client.plan.progress.push(progMode); }
  const page = makePage('student', device.storage, client);
  C.pages++;
  const email = special === 'teacher-email' ? TEACHER_EMAIL : `${uid}@example.test`;
  page.ctx.__user = { uid, email, displayName: 'Fake User' };
  if (special === 'dev') {
    await page.run(`(async function(){ currentUser = __user; })()`);
  } else {
    await page.run(`(async function(){ currentUser = __user; await loadProgress(); try { caAdoptLocalTicks(); } catch(e) {} await loadClassConfig(); })()`);
  }
  await flush();
  page.run(`document.getElementById('app').style.display = 'block'; applyGamesAccess(); applyActivityGate();`);
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
let JOURNEY = null;
function journeyPage() { if (!JOURNEY) { JOURNEY = makePage('journey', makeStorage(), makeClient(new Store())); C.pages++; } return JOURNEY; }

/* A student's model state base (what the page knows apart from the config). */
function studentBase(uid, prog, progOk, special, today) {
  return {
    uid, today, dev: special === 'dev', previewer: special === 'dev' || special === 'teacher-email',
    progressOk: special === 'dev' ? true : progOk, ownPeriod: (progOk && special !== 'dev') ? (prog.period || '') : '',
    done: (progOk && special !== 'dev') ? (prog.classActivities || {}) : {},
  };
}
/* The three-way comparison: student page (fresh, successful reads), console, Journey, model. */
function threeWay(where, studentGot, consolePage, uid, d, prog, today) {
  const exp = mDocAnswers(d, prog, uid, today);
  const con = probeConsole(consolePage, uid);
  const jny = probeJourney(journeyPage(), clone(d), clone(prog), uid);
  C.threeWay++;
  C.comparisons += 3 * 4;
  const cas = (mMap(d, 'periodOverrides')[uid] || prog.period || '') === 'CAS';
  [['console', con, ['vis', 'opt', 'blk', 'num']], ['journey', jny, ['vis', 'opt', 'blk']], ['student', studentGot, cas ? ['vis', 'blk', 'num'] : ['vis', 'opt', 'blk', 'num']]]
    .forEach(([who, got, fields]) => { const dd = answerDiff(exp, got, fields); if (dd.length) fail(`${where} — ${who} vs the rules`, dd.join(' | ')); });
  const agree = ['vis', 'blk'].every(f => diffList(con[f], jny[f]) === '' && diffList(con[f], studentGot[f]) === '');
  if (!agree) fail(`${where} — three-way`, `student / console / Journey disagree: vis ${diffList(studentGot.vis, con.vis) || '='} (student vs console), ${diffList(jny.vis, con.vis) || '='} (Journey vs console); blk ${diffList(studentGot.blk, con.blk) || '='} / ${diffList(jny.blk, con.blk) || '='}`);
}
const CHANGE_KINDS = ['date', 'hide', 'who', 'wholeClass', 'optional', 'songPlace', 'classSong', 'archive', 'delete', 'playAlong', 'clear', 'clearAll', 'period', 'openThrough', 'classGames', 'studentGames', 'move', 'unassign'];
function pickChange(rng, d, today, progs) {
  const board = mMap(d, 'activityBoard');
  const seeded = d.activityBoardSeeded === true;
  for (let tries = 0; tries < 40; tries++) {
    const kind = pick(rng, CHANGE_KINDS);
    const anyId = () => pick(rng, IDS);
    const busy = () => { const ids = IDS.filter(id => board[id] || mMap(d, 'activityDates')[id]); return ids.length ? pick(rng, ids) : anyId(); };
    const uid = pick(rng, UIDS);
    switch (kind) {
      case 'date': return { kind, id: busy(), value: pick(rng, [today, modelAddDays(today, -1), modelAddDays(today, 1), modelAddDays(today, -9), '']) };
      case 'hide': { const id = busy(); return { kind, id, on: mMap(d, 'hiddenActivities')[id] !== true }; }
      case 'who': { const id = busy(); const w = mMap(d, 'activityStudents')[id] || {}; return { kind, id, uid, on: w[uid] !== true }; }
      case 'wholeClass': { const ids = IDS.filter(id => mMap(d, 'activityStudents')[id]); if (!ids.length) continue; return { kind, id: pick(rng, ids) }; }
      case 'optional': { const id = busy(); return { kind, id, on: !mOptionalFlag(ACT[id], d, !!mTicked(d, id)) }; }
      case 'songPlace': { const ids = IDS.filter(id => mIsSongCard(ACT[id])); if (!ids.length) continue; const id = pick(rng, ids); return { kind, id, toSongs: !mOnSongs(ACT[id], d) }; }
      case 'classSong': { const ids = IDS.filter(id => ACT[id].teacherOnly === true); if (!ids.length) continue; const id = pick(rng, ids); return { kind, id, on: mMap(d, 'classSongs')[id] !== true }; }
      case 'archive': { const id = busy(); return { kind, id, on: !mRetired(ACT[id], d) }; }
      case 'delete': { const id = busy(); if (mMap(d, 'deletedActivities')[id]) continue; return { kind, id }; }
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
        const module = pick(rng, [0, ...DATA.manifest.slice(0, 6)]);
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
/* A path like 'activityStudents.ca-3' in a normalized doc. */
function dropPath(d, path) {
  const parts = path.split('.');
  let cur = d;
  for (let i = 0; i < parts.length - 1; i++) { if (!cur || typeof cur !== 'object') return; cur = cur[parts[i]]; }
  if (cur && typeof cur === 'object') delete cur[parts[parts.length - 1]];
}
const getPath = (d, path) => path.split('.').reduce((c, k) => (c && typeof c === 'object' ? c[k] : undefined), d);

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
  store.put('config/class', doc);
  UIDS.forEach(u => store.put('progress/' + u, progs[u]));
  const device = { storage: makeStorage(), wc: null, slot: null, own: {} };
  const readMode = () => { const r = rng(); return r < 0.66 ? 'ok' : r < 0.84 ? 'fail' : 'empty'; };
  const progMode = () => (chance(rng, 0.9) ? 'ok' : 'fail');

  let con = await bootConsole(store);
  step(`case ${idx}: console booted`);
  /* A fresh sign-in on this Chromebook, judged against the model; three-way when both reads succeeded. */
  const fresh = async (uid, cMode, pMode, special, label) => {
    const page = await bootStudent(device, store, uid, cMode, pMode, special);
    C.freshLoads++;
    const d = store.read('config/class');
    let st;
    if (special === 'dev') st = { S: Object.assign(studentBase(uid, progs[uid] || {}, true, 'dev', today), { doc: {}, who: { mode: 'live' }, override: '', openThrough: 0, games: true }), open: {} };
    else st = mPageState(device, d || {}, uid, cMode === 'ok' && d ? 'ok' : (cMode === 'ok' ? 'empty' : cMode), null, studentBase(uid, progs[uid] || {}, pMode === 'ok', special, today));
    const got = probeStudent(page);
    step(`${label}: fresh ${uid}${special ? ' (' + special + ')' : ''}, config ${cMode}, progress ${pMode}`);
    const ok = judgeStudent(`${label}: fresh sign-in ${uid}${special ? ' (' + special + ')' : ''} (config read ${cMode}, progress ${pMode})`, got, st.S, st.open);
    if (got.gated) C.gatedSeen++;
    if (got.blk.length) C.landings++;
    if (cMode === 'ok' && pMode === 'ok' && !special) threeWay(`${label}: ${uid}`, got, con, uid, d, progs[uid], today);
    return { page, st, got, ok };
  };

  /* Phase A — every student signs in once on the same Chromebook. */
  for (const u of UIDS) await fresh(u, chance(rng, 0.8) ? 'ok' : readMode(), progMode(), null, 'A');
  if (chance(rng, 0.25)) await fresh('stu-teacher', 'ok', 'ok', 'teacher-email', 'A');

  /* Phase B/C — console changes, an open page before and after its tab comes back, then fresh sign-ins. */
  const rounds = 3;
  for (let r = 0; r < rounds; r++) {
    const special = chance(rng, 0.12) ? 'dev' : null;
    const openUid = special === 'dev' ? 'dev-user' : pick(rng, UIDS);
    const opened = await fresh(openUid, special === 'dev' ? 'none' : (chance(rng, 0.85) ? 'ok' : readMode()), 'ok', special, `R${r}`);
    let prevS = opened.st.S;
    const before = store.read('config/class');
    const ch = pickChange(rng, before, today, progs);
    const label = `R${r} ${chLabel(ch)}`;
    C.changes++;
    step(`${label}: console writes`);
    const writesBefore = store.counts.writes;
    try { await con.run(`(async function(){ await ${writerCall(ch)}; })()`); }
    catch (e) { fail(`${label}: console writer`, 'threw ' + (e && e.message)); }
    await flush();
    C.writes += store.counts.writes - writesBefore;
    if (con.alerts.length) { fail(`${label}: console`, `alert: ${con.alerts.join(' / ').slice(0, 200)}`); con.alerts.length = 0; }
    const after = store.read('config/class');
    /* R11: the doc, the version and the console's own copy. */
    const exp = mExpectChange(before, ch, progs, today);
    const nExp = normDoc(exp.doc), nGot = normDoc(after);
    exp.dontCare.forEach(p => {
      const was = getPath(normDoc(before), p), now = getPath(nGot, p);
      if (p.startsWith('hiddenActivities.') || p.startsWith('activityStudents.') || p.startsWith('activityNumbers.')) {
        if (was !== undefined) noteNS('NS-del', `${p.split('.')[0]}: ${now === undefined ? 'cleared by Delete' : 'kept by Delete'}`);
      }
      dropPath(nExp, p); dropPath(nGot, p);
    });
    C.comparisons++;
    if (canon(nExp) !== canon(nGot)) {
      const keys = sortU([...Object.keys(nExp), ...Object.keys(nGot)]).filter(k => canon(nExp[k]) !== canon(nGot[k]));
      fail(`${label}: config/class after the write`, keys.map(k => `${k}: expected ${canon(nExp[k]).slice(0, 160)}, got ${canon(nGot[k]).slice(0, 160)}`).join(' | '));
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
      const e = mDocAnswers(after, progs[u], u, today), g = probeConsole(con, u);
      C.comparisons += 2;
      const dd = answerDiff(e, g, ['vis', 'blk']);
      if (dd.length) fail(`${label}: console after the write, ${u}`, dd.join(' | '));
    });

    /* R12: the open page before its tab comes back. */
    const page = opened.page;
    let got = probeStudent(page);
    const okBefore = judgeStudent(`${label}: page open since before the change, tab not back yet`, got, prevS, opened.st.open);
    tally(ch.kind, 'open page, tab not back: old answer', okBefore);
    /* Tab return: hold the read, look during it, release. */
    const tMode = special === 'dev' ? 'ok' : readMode();
    page.client.plan.config.push({ mode: tMode, hold: true });
    const sigBefore = got.sig;
    page.ctx.document.hidden = false;
    (page.docListeners.visibilitychange || []).forEach(fn => fn({}));
    await flush();
    C.tabReturns++;
    if (page.client.held.length) {
      C.midRead++;
      const mid = probeStudent(page);
      const okMid = judgeStudent(`${label}: during the tab-return read`, mid, prevS, opened.st.open);
      tally(ch.kind, 'during the tab-return read: old answer', okMid);
      page.client.release();
      await flush();
    } else fail(`${label}: tab return`, 'the page did not read config/class when its tab came back');
    got = probeStudent(page);
    const st2 = mPageState(device, after, openUid, tMode, prevS, studentBase(openUid, progs[openUid] || {}, true, special, today));
    if (special === 'dev') st2.S.who = tMode === 'ok' ? { mode: 'live' } : prevS.who;
    const okAfter = judgeStudent(`${label}: page open since before the change, tab back (read ${tMode})`, got, st2.S, st2.open);
    tally(ch.kind, tMode === 'ok' ? 'tab back, read ok: new answer' : 'tab back, read failed: old answer', okAfter);
    if (tMode === 'ok') {
      const oldAns = mStudentAnswers(prevS, true), newAns = mStudentAnswers(st2.S, true);
      const moved = answerDiff(oldAns, newAns, ['vis', 'opt', 'blk', 'pao', 'num', 'games']).length > 0;
      C.comparisons++;
      if (moved && got.sig === sigBefore) fail(`${label}: tab back`, 'the student\'s answer changed but classConfigSignature() did not, so the open In-Class Activities screen is not repainted');
      if (ch.kind === 'classGames' || ch.kind === 'studentGames') noteNS('games-wording', `games applied on tab return: ${got.gamesBtn === (st2.S.games ? '' : 'none') ? 'yes' : 'no'}`);
    }
    prevS = st2.S;

    /* The open page closes (another sign-in on this Chromebook reloads it); fresh sign-ins follow. */
    const n = 1 + Math.floor(rng() * 3);
    const order = UIDS.slice().sort(() => rng() - 0.5).slice(0, n);
    for (const u of order) {
      const res = await fresh(u, readMode(), progMode(), null, `${label} → fresh`);
      tally(ch.kind, 'fresh sign-in: rules for its read', res.ok);
    }
    if (chance(rng, 0.3)) { con = await bootConsole(store); step(`${label}: console re-read`); }
  }
}

/* ── Run ── */
process.on('unhandledRejection', e => { fail('unhandled rejection', String(e && e.stack || e).split('\n').slice(0, 3).join(' / ')); });
const indices = ONE_CASE !== null ? [ONE_CASE] : Array.from({ length: CASES }, (_, i) => i);
for (const i of indices) {
  const f0 = FAILS.length;
  try { await runCase(i); }
  catch (e) { fail('harness', String(e && e.stack || e).split('\n').slice(0, 4).join(' / ')); }
  if (VERBOSE && LOG.length) LOG.filter(l => l[0] !== 'log').slice(0, 20).forEach(l => console.log(`    [${l[1]} ${l[0]}] ${l[2].slice(0, 200)}`));
  LOG = [];
  if (FAILS.length > f0 && FAILS.length - f0 > 40) FAILS.splice(f0 + 40);
}
clearInterval(watchdog);

const out = [];
out.push(`visible-loop: root ${ROOT === resolve(join(HERE, '..')) ? '(this checkout)' : ROOT}, seed ${SEED}, ${indices.length === 1 ? 'case ' + indices[0] : indices.length + ' cases'}${BREAK_FAKE ? ', FAKE BROKEN: ' + BREAK_FAKE : ''}`);
out.push(`  ${C.cases} cases over ${DAYS.length} kinds of day · ${C.pages} pages booted · ${C.freshLoads} fresh sign-ins · ${C.threeWay} three-way student/console/Journey comparisons`);
out.push(`  ${C.changes} console changes through the real writers (${C.writes} writes) · ${C.tabReturns} tab returns (${C.midRead} looked at mid-read)`);
out.push(`  config/progress reads served: ${READS.ok} ok, ${READS.fail} failed, ${READS.empty} empty · ${C.comparisons} comparisons`);
out.push(`  the lock (R6): body.ca-gated seen on ${C.gatedSeen} of ${C.freshLoads} sign-ins; ${C.landings} of ${C.freshLoads} sign-ins had a blocker, i.e. landed on In-Class Activities`);
out.push('  WHEN a console change reaches a student (R12) — passed / run, by change and moment:');
const COLS = ['open page, tab not back: old answer', 'during the tab-return read: old answer', 'tab back, read ok: new answer', 'tab back, read failed: old answer', 'fresh sign-in: rules for its read'];
out.push('    ' + 'change'.padEnd(13) + ['open, not back', 'mid-read', 'back, ok read', 'back, failed', 'fresh'].map(s => s.padStart(15)).join(''));
CHANGE_KINDS.forEach(k => {
  const r = TRUTH[k]; if (!r) return;
  out.push('    ' + k.padEnd(13) + COLS.map(c => (r[c] ? `${r[c][0]}/${r[c][1]}` : '-').padStart(15)).join(''));
});
out.push('    prose: every cell above is stated (R12) except: games — teacher-config.js:420 says "the next time a student loads the site", save.js:367-370 applies them on tab return; an open Journey page — not stated (NS-jny).');
noteNS('NS-jny', 'tabs/journey.js listens for visibilitychange (a re-read on tab return): ' + (/addEventListener\(\s*['"]visibilitychange['"]/.test(readFileSync(join(ROOT, 'tabs/journey.js'), 'utf8')) ? 'yes' : 'no — it decides once per page load'));
const nsKeys = Object.keys(C.notStated).sort();
if (nsKeys.length) {
  out.push('  NOT STATED by the prose — what the code does (counts):');
  nsKeys.forEach(k => out.push(`    ${k}: ` + Object.entries(C.notStated[k]).sort().map(([w, n]) => `${w} ×${n}`).join('; ')));
}
if (FAILS.length) {
  out.push(`  ✗ ${FAILS.length} contradiction${FAILS.length === 1 ? '' : 's'}${FAILS.length > 25 ? ' (first 25)' : ''}:`);
  FAILS.slice(0, 25).forEach(f => out.push('    ' + f.slice(0, 600)));
  out.push(`  replay one: node tools/visible-loop.mjs --seed ${SEED} --case <n> --verbose${ROOT === resolve(join(HERE, '..')) ? '' : ' --root ' + ROOT}`);
  out.push('visible-loop: ✗ FAIL');
} else out.push('visible-loop: ✓ every comparison held');
console.log(out.join('\n'));
console.error(`visible-loop: ${((Date.now() - T_START) / 1000).toFixed(1)} s`);
process.exit(FAILS.length ? 1 : 0);
