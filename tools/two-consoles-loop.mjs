#!/usr/bin/env node
/* two-consoles-loop.mjs — two teacher consoles at once, on a fake Firestore and a virtual clock (2026-11-11).

   Jonathan, 2026-11-11: "Two virtual consoles would write config/class from stale reads, and the board must end
   up with both changes. The rules for this exist in prose, but nothing plays the race." This plays it.

     node tools/two-consoles-loop.mjs                          1,000 schedules, seed 1 (70–175 s on 4 worker threads, 2026-11-12: the low end on a quiet machine)
     node tools/two-consoles-loop.mjs --seed S --schedules N   another seed / count
     node tools/two-consoles-loop.mjs --seed S --schedule K --verbose
                                                               replay ONE schedule alone: every click, read, transaction attempt,
                                                               commit, refusal and alert, in virtual-time order
     --family F       only that scenario family (names below)          --json FILE   every schedule's numbers and problems
     --console FILE   another console script (the whole teacher-*.js text in one file) — a before/after, or a break-it copy
     --root DIR       another site folder (index.html, the app parts, class-activities.js …)
     --workers N      worker threads (default min(4, cores/2)); the table is the same whatever N is
     --stall S        the watchdog's limit, seconds (default 120)
     --server-fault no-retry | no-conflict-check   break the FAKE SERVER on purpose (its self-test must catch it)
   Exit 0: every schedule passed. 1: a failure (below), or the fake server failed its self-test. 2: the tool itself broke.
   3: the watchdog — no step for 120 s; it prints the step it was stuck on.
   Run it when the console's write path changes, before and after (CLAUDE.md): not in checks.mjs, not in the Friday check.

   WHAT IS REAL. Each console is its own vm context holding the site's scripts unchanged, in index.html's order:
   config-main.js, class-activities.js, i18n.js, guitar-diagrams.js, the app parts (site-src.mjs), practice-minutes,
   then the whole console script (siteSource('teacher.js')), the module files when showTeacherApp asks for them, and
   index.html's <body> as its DOM (a small DOM in this file: innerHTML is parsed into a tree, so querySelector, closest,
   dataset and textContent answer as a browser's would; no layout). Each console boots with its own showTeacherApp,
   and holds its own teacherClassConfig, teacherConfigVersion, timers and alerts. The real teacherWriteConfig,
   loadTeacherClassConfig, teacherConfigSaveFailed, the real writers and the real repaints run; a click calls the same
   writer the console's click listener calls (teacherMoveActivity, teacherSetActivityHidden …). Nothing in the console
   is edited. Stubbed: Firestore (`db`); the browser's confirm() answers OK (Delete, Open everyone through), alert() is
   recorded, prompt() answers nothing; no network, no audio.
   WHAT IS MODELLED: Firestore (the fake server, section 5) and the clock. Made-up: the class (12 students named
   "Test Student 01" …, ids fake-uid-01 …, e-mails at example.test, a made-up teacher address) and its board.
   NOT MODELLED by the fake server: offline queueing and the SDK's local cache, onSnapshot listeners (the console has
   none), security rules, batched writes, server timestamps, document size limits. The latency (8–78 ms, 15% of calls
   120–600 ms, on every read, transaction read, commit request and reply) and the retry backoff (0, ~1 s, ~1.5 s, ~2.25 s
   with jitter, 5 attempts) are this tool's guesses, not measurements. The tool never signs in and never reaches the
   network: fetch rejects, and the Firebase SDK is not loaded.

   SCHEDULES. Each schedule boots its consoles on one seeded doc, then clicks at virtual times; a click's target is
   picked when it fires, from what that console's own copy shows (as a teacher picks it). Families (Build step 4):
     solo             ONE console, 5–12 random clicks and view switches (the rule file's one-console figure)
     random           two consoles, 3–8 random clicks each, with view switches, Arrange board, list picks and Refresh
     diff-switch      each console flips a switch on a DIFFERENT activity (Hidden, Optional, Play Along, a date, Who,
                      Archive, a rename); 0 refusals is the pass (pins excluded: the pin row is one cell for all cards)
     same-cell        both change the same cell (the same switch on the same card, or both pin it)
     same-unit-moves  both move cards in the same unit
     move-vs-switch   one moves a card while the other flips a switch
     delete-vs-edit   one deletes or archives a card the other renames, hides, dates, ticks, moves or pins
     burst            three writes in a burst from one console while the other writes once
     map-cells        one console ticks two students on a card in reverse order, then switches its Optional, while the
                      other writes elsewhere (the "Comparing cells" bullet: map keys come back sorted)
     optional-vs-who  one console sets a card Optional, 4 s later Required; the other ticks a student on that card within
                      ±150 ms of one of them (the Optional write's guard on the card's Who list)
     songs-and-back   three slow clicks on ONE console: a song to the Songs page, another card moved into its unit, the
                      song back (the kept board row; see "a song came back" below)
     pin-pair         ONE console: Hide a card, pin X 15–60 ms later, pin Y 350–600 ms later
     student-cells    one console Clears a card for a student and un-clears it; then both archive the SAME student
     view-mid-write   A flips a switch while B flips another card's (A's write lands diverged and reloads); A opens
                      Manage, Games, Songs or Teacher songs 30–900 ms after its click, half the time then Refresh;
                      3 slots in 29 (about 103 of 1,000): the null-read mutant fails 12 of 300 of these (4%), so a
                      default run catches it with about 98.5% from this family alone
   A quarter of solo / random schedules run on a flaky network (12% of commit requests are lost: the write fails,
   nothing is written), and in 30% of them a console starts clicking from 100 ms, while it is still booting (a click
   on a control that is not drawn yet is skipped; view switches are not).
   The writes: move a card (to a unit and position, or into a unit from Built), un-assign, delete, archive / restore,
   Hidden / Visible, Optional / Required, pin / unpin, set and clear a release date, Who for one student and Back to
   whole class, rename, Play Along, move a song to Songs and back, a student's Open through, period, games and paused,
   the class games switch, Hide all / Show all, a gate Clear, Clear all, Open everyone through N, archive a student,
   a teacher-only song to Class activities. That is 24 of the 27 `await teacherWriteConfig(` call sites; the run counts
   them off the async stack and fails (on 200+ schedules, no --family) if a covered one was never called. Not driven: the one-time
   board migration (teacherMigrateActivityBoard), mic sampling (teacherSetMicSampling), the practice-minutes goal
   (teacherSetPmWeekGoal). Out of scope (work order): the roster and progress reads, practice minutes, the live quiz.

   CHECKS, after each schedule has gone quiet (a failure in any one exits 1):
     corruption        two cards on a unit's board share a position; a malformed board row; a key the console never
                       writes; a pin list that is not ≤ 4 distinct ids — after EVERY commit, not just at the end.
                       A gap in a unit's positions is counted, not failed (see corruption()). A duplicate made ONLY
                       by a song's kept row (it came back from the Songs page onto a position another card took
                       meanwhile, or a move was made while this console's own click sending it there or back had not
                       landed), with the board exactly the expected answer, is counted on its own line, not failed:
                       Jonathan to decide (the round-1 review's "fault 2").
     silent loss       an accepted write's change is not in the doc, and no later accepted write changed that cell; or a
                       write clicked BEFORE another click on the same console landed AFTER it and wrote one of that
                       later click's cells back (the later click is undone and its console still shows it)
     landed on a moved cell   an accepted write whose screen (the copy it was clicked on, plus this console's own
                       earlier clicks that had not landed yet) differs from the doc it landed on in a cell it is worked
                       out from (DEPS, section 10: its own cell; Optional also the card's Who list; a pin the whole pin
                       list; Archive whether the card is pinned; Hide all every card it covers; a strict writer the whole
                       doc), where a commit of the OTHER console with a configVersion above the one this console
                       held at the click, before this write landed, set that cell to a value the screen does not show:
                       it should have been refused, whatever this console's own later clicks did meanwhile
     landed with the opposite effect   an Optional / Required write after which the card is not what was clicked
     false save        something a refused or failed write intended is in the doc although nothing accepted put it there
     doc differs       the doc is not the expected answer (below) for any other reason
     untold refusal    a refused write did not reach "Nothing was saved" in ITS console exactly once. "Refused" is
                       judged by the server, not by the console's error (2026-11-14, plant-a-fault 23e08d8999 and
                       25c60b00cd): the update function threw on a read whose configVersion is not the one the
                       console held, whatever flag the error carries
     a failed write not told / shown as stale   a write that failed for another reason (the connection dropped,
                       five conflicts) must show its own message once, not "Nothing was saved"
     "Nothing was saved" for a saved write   the alert on a write that was committed, or outside any write
     refused over an unchanged cell          a cell-checked refusal naming only cells that had not moved
     copy left stale   a write that landed on top of the other console's change returned without that change in its
                       copy (the "Versions" bullet: it reloads before it returns, so the repaint is the merged truth)
     dead view         a view left on a "Loading…" line with nothing left to run, before or after the final read
     console differs from the server after its next read   each console's own next read (its view's painter) must
                       leave its copy and its configVersion equal to the server's
     switches on different activities did not both land   diff-switch only: a refusal, a failure or a dropped click
     a click that wrote nothing   a click with no transaction and no alert whose effect (the model's rule, applied to
                       the copy it was clicked on) changes something there: the screen shows it, the server never
                       hears of it. A no-op on its own screen (a pin already there, nothing blocking, everyone already
                       open, a card dropped where it already was) passes and is counted. Judged on the screen, not the
                       doc: a teacher dropping a card where a STALE screen shows it is a no-op (measured before the
                       view-mid-write reweight, seed 1, 500 schedules: 2 of 31 legitimate no-writes would change the doc
                       at the click, both such drops; the run prints today's count)
     page error, server rule, a write no click made, a click never finished, never went quiet, fake server not Firestore
   A write worked out on a screen that showed the console's own earlier click, which was then refused or failed, is
   counted, not failed (that click was told).
   NUMBERS (Build step 6, reported, not failed): per family; the one-console false "Nothing was saved" rate (any such
   alert with one console is false); the two-console rate of refusals the other console did not cause (no write of
   its between the version this console held and the one the refusal read); the share of board moves refused when the
   other console wrote in the gap.

   THE EXPECTED ANSWER (Build step 5) is worked out from the rules in prose, never by calling the console: the seeded
   doc, then — in the server's commit order — the INTENT of every accepted write, and nothing from a refused one.
   It reads the activity DATA (class-activities.js in a bare context), the students' own seeded docs (they do not change
   during a run), the doc as it stands at each commit, and — for the DECISIONS in M5–M8, M11, M21, M23 and M24 — the
   console's copy the write was worked out from (its "screen": the copy at the click for a switch, at its turn for a
   board writer, read when its transaction starts): whether a song is on the Songs page (M5–M7: so not one of a unit's cards;
   rows and positions still come from the doc), which cards Hide all covers, which cards block a student, who is below
   N, the card's default, whether the card was pinned. The effect
   is applied to the doc at the commit. Why the screen: one console's own clicks can land out of click order (seed 2,
   1,000 schedules, at commit 13936f3: 6 schedules — #3, #241, #445, #696, #852 and the old #822 kind — where the doc
   was what the teacher clicked, in click order, and a doc-at-commit model said otherwise; they replay only at 13936f3).
   PLAINLY: the screen is the console's OWN copy (teacherClassConfig) at the click, not a screen this tool keeps for
   itself. The decision rules are this tool's, but their input is the console's copy, so a copy the console itself got
   wrong (a reload applied badly, a rollback missed after a failed save) feeds the model the same wrong input and is
   NOT seen through these five decisions; it is seen only where it shows elsewhere (copy left stale, console differs
   from the server, a later write landing on a moved cell). What a stale screen leaves open is the dependency check
   ("landed on a moved cell"), from this tool's own list: it turns the round-1 review's mutant red (the Optional write
   without its Who guard). Its rules, numbered as in section 9:
     M1  a song card: data library true/false, not an exit check, not a Song Journey card, not a whole-song card or sheet
     M2  on the Songs page: songLibrary[id] when it is true/false, else the data's library === true
     M3  a teacher-only card is off the board until classSongs[id] is true
     M4  a unit's cards: every card with a board row in it, archived and deleted included, Songs-page songs and
         teacher-only cards excluded (by the doc); order: pos, shipped number, the number in the id
     M5  move X to unit U position P: U's cards without X, X inserted at P (clamped; none = the end), numbered 1..N;
         the unit X left numbered 1..N again without it
     M6  un-assign: the row goes, its unit numbered 1..N again
     M7  delete: deletedActivities[X] = true; X leaves archived, hidden, optional, Play Along, Who, dates, names, legacy
         numbers, every gate clear, the pins and the board; its unit numbered 1..N again
     M8  archive: archivedActivities[X] = true, deletedActivities[X] removed, X unpinned when it was pinned on the
         screen; restore: both flags removed, no pin back
     M9  a song to Songs / back: songLibrary[X] = where it goes, removed when that is its data's place; the row stays
     M10 Hidden: hiddenActivities[X] = true; Visible removes it
     M11 Optional / Required: stored only when it differs from the default (data optional, or the card's Who list on
         the screen ticking anyone); else removed
     M12 pin: X added at the end of activityPins (at most 4); unpin: X taken out, the rest in order
     M13 a release date set / cleared
     M14 Who: activityStudents[X][uid] = true or that key removed (the map stays, even empty); whole class removes X's map
     M15 rename: activityTitles[X] = {en: trimmed name (≤120), base: shipped title}; empty or the shipped title removes it
     M16 Play Along now: playAlongActivities[X] = true; by date removes it
     M17 Open through: moduleOpenThrough[uid] = N; Auto removes it
     M18 class games: gamesEnabled; a student's games: gameOverrides[uid] true/false, Default removes it
     M19 period: periodOverrides[uid]; Auto removes it; paused[uid] = true, Active removes it
     M20 every accepted write moves configVersion on by exactly one
     M21 Hide all / Show all on unit U: every live card the screen showed in U (M4) Hidden / Visible
     M22 a gate Clear: activityClears[uid][X] = true; un-clear removes that key
     M23 Clear all: every card blocking the student on the screen (M27) gets activityClears[uid][X] = true
     M24 Open everyone through N: every student not archived on the screen whose Open through there is below N gets N;
         none lowered
     M25 archive a student: archived[uid] = true; restore removes it
     M26 a teacher-only card to Class activities: classSongs[X] = true; back removes it
     M27 what blocks a student: on the board (M4), not archived / deleted / Hidden, given to them (empty Who = all),
         dated on or before today, Required (the flag, else the M11 default), not done on their own doc, not cleared;
         a CAS student (override, else their own period) is blocked by nothing
   Removing an entry from a map that is not there creates nothing. Independence: section 9 calls no console function
   (grep it: no ctx, no peek, no teacher…(), no ca…()); the one console state it reads is the screen above, as data,
   through screenOf / placementOf, and only for those decisions. The checks OUTSIDE the model also read console state:
   its copy (copy left stale; the screen, for "landed on a moved cell" and a refusal over an unchanged cell), its
   alerts, its configVersion and its DOM (dead view).

   THE FAKE SERVER CHECKS ITSELF first (section 12): two racing transactions (the loser re-runs and commits on top),
   an always-conflicting one (5 attempts, then "aborted"), a throwing update function (ends at once, writes nothing),
   merge semantics, sorted keys on read. If it fails, no schedule runs. While running, a commit that went through on
   a read that was no longer current fails the run ("fake server not Firestore").

   COVERAGE LIMITS: one seed doc, with every map present (as {} when empty), so a doc missing a map is never tried;
   activityBoardSeeded is true, so the board migration never runs and two consoles opening an unseeded doc at once
   (the first-open race) is not tested; mic sampling and the practice-minutes goal are not driven (out of scope).

   Does NOT see: anything a browser adds (focus, layout, real event dispatch: clicks call the writers directly), the
   real network's behaviour beyond the latencies above and lost commit requests (a reply lost AFTER a commit is not
   modelled), the Firebase SDK's own cache, more than two consoles, students writing their own docs while the console
   runs. */
import vm from 'node:vm';
import { AsyncLocalStorage } from 'node:async_hooks';
import { spawn } from 'node:child_process';
import { Worker, isMainThread, parentPort, workerData } from 'node:worker_threads';
import { availableParallelism } from 'node:os';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteSource } from './site-src.mjs';

const TOOL = fileURLToPath(import.meta.url);
const REPO = join(dirname(TOOL), '..');
const ARGV = process.argv.slice(2);
const flag = n => ARGV.includes(n);
const opt = (n, d) => { const i = ARGV.indexOf(n); return i >= 0 && i + 1 < ARGV.length ? ARGV[i + 1] : d; };

/* ════════════════════════════════════════════════════════════════════════
   0. The watchdog. The run itself happens in a child process; this parent
   only passes its output through and listens for a heartbeat ("the step the
   run is on"). No heartbeat for --stall seconds (default 120) → print the
   step, kill the child, exit 3. A child is the only way to catch a run
   stuck in a synchronous loop inside the console code.
   ════════════════════════════════════════════════════════════════════════ */
if (!process.env.TWO_CONSOLES_CHILD) {
  const stall = Number(opt('--stall', 120)) * 1000;
  const child = spawn(process.execPath, [TOOL, ...ARGV], { stdio: ['ignore', 'inherit', 'inherit', 'ipc'], env: { ...process.env, TWO_CONSOLES_CHILD: '1' } });
  let beat = Date.now(), step = 'starting';
  child.on('message', m => { beat = Date.now(); if (m && m.step) step = m.step; });
  const iv = setInterval(() => {
    if (Date.now() - beat > stall) {
      clearInterval(iv);
      process.stderr.write(`two-consoles-loop: ✗ HUNG — no step for ${Math.round(stall / 1000)} s. Stuck at "${step}"\n`);
      try { child.kill('SIGKILL'); } catch { /* gone */ }
      process.exit(3);
    }
  }, 1000);
  child.on('exit', (code, sig) => { clearInterval(iv); process.exit(code === null ? (sig ? 1 : 0) : code); });
} else {
  // After the whole module has been evaluated (main uses bindings declared further down).
  setImmediate(() => main().catch(e => { console.error('two-consoles-loop: tool error —', e && e.stack || e); process.exit(2); }));
}
let lastBeatSent = 0;
function heartbeat(step, force) {
  const now = Date.now();
  if (!force && now - lastBeatSent < 250) return;
  lastBeatSent = now;
  if (!isMainThread) parentPort.postMessage({ type: 'beat', step });
  else if (process.send) process.send({ step });
}

/* ════════════════════════════════════════════════════════════════════════
   1. A small DOM. Enough of one for the console's own painters to run
   unchanged: innerHTML is parsed into a real tree, so querySelector,
   closest, dataset, isConnected and textContent answer what a browser
   would. No layout (every box is 0×0), no events are dispatched.
   ════════════════════════════════════════════════════════════════════════ */
const VOID_TAGS = new Set('area base br col embed hr img input link meta source track wbr'.split(' '));
const RAW_TAGS = new Set(['script', 'style', 'textarea', 'title']);
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', mdash: '—', ndash: '–', hellip: '…',
  rarr: '→', larr: '←', uarr: '↑', darr: '↓', times: '×', copy: '©', bull: '•', check: '✓', laquo: '«', raquo: '»',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', deg: '°', minus: '−', le: '≤', ge: '≥', sharp: '♯', flat: '♭', thinsp: ' ', ensp: ' ', emsp: ' ' };
const decodeEnt = s => s.indexOf('&') < 0 ? s : s.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, e) =>
  e[0] === '#' ? String.fromCodePoint((e[1] === 'x' || e[1] === 'X') ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENT[e] !== undefined ? ENT[e] : m));
const escText = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttrV = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const kebab = k => k.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
const camel = k => k.replace(/-([a-z])/g, (m, c) => c.toUpperCase());

class MNode {
  constructor(doc) { this.ownerDocument = doc; this.parentNode = null; this.childNodes = []; }
  get parentElement() { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null; }
  get firstChild() { return this.childNodes[0] || null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; }
  get nextSibling() { const p = this.parentNode; return p ? p.childNodes[p.childNodes.indexOf(this) + 1] || null : null; }
  get previousSibling() { const p = this.parentNode; return p ? p.childNodes[p.childNodes.indexOf(this) - 1] || null : null; }
  get isConnected() { let n = this; while (n) { if (n.nodeType === 9) return true; n = n.parentNode; } return false; }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  contains(n) { while (n) { if (n === this) return true; n = n.parentNode; } return false; }
  addEventListener() {} removeEventListener() {} dispatchEvent() { return true; }
}
class MText extends MNode {
  constructor(doc, data) { super(doc); this.nodeType = 3; this.nodeName = '#text'; this.data = String(data); }
  get textContent() { return this.data; } set textContent(v) { this.data = String(v); }
  get nodeValue() { return this.data; }
  cloneNode() { return new MText(this.ownerDocument, this.data); }
}
function makeStyle() {
  const st = { cssText: '', setProperty(k, v) { st[camel(k)] = v; }, removeProperty(k) { delete st[camel(k)]; }, getPropertyValue(k) { return st[camel(k)] || ''; } };
  return st;
}
class MElement extends MNode {
  constructor(doc, tag) {
    super(doc); this.nodeType = 1; this.localName = tag.toLowerCase(); this.tagName = this.localName.toUpperCase(); this.nodeName = this.tagName;
    this.attrs = new Map(); this._style = null; this._value = undefined; this._checked = undefined; this.scrollTop = 0; this.scrollLeft = 0;
  }
  getAttribute(n) { n = String(n).toLowerCase(); return this.attrs.has(n) ? this.attrs.get(n) : null; }
  setAttribute(n, v) { this.attrs.set(String(n).toLowerCase(), String(v)); }
  removeAttribute(n) { this.attrs.delete(String(n).toLowerCase()); }
  hasAttribute(n) { return this.attrs.has(String(n).toLowerCase()); }
  toggleAttribute(n, f) { const has = this.hasAttribute(n), want = f === undefined ? !has : !!f; if (want) this.setAttribute(n, ''); else this.removeAttribute(n); return want; }
  get attributes() { return [...this.attrs].map(([name, value]) => ({ name, value })); }
  get id() { return this.getAttribute('id') || ''; } set id(v) { this.setAttribute('id', v); }
  get className() { return this.getAttribute('class') || ''; } set className(v) { this.setAttribute('class', v); }
  get title() { return this.getAttribute('title') || ''; } set title(v) { this.setAttribute('title', v); }
  get type() { return this.getAttribute('type') || ''; } set type(v) { this.setAttribute('type', v); }
  get name() { return this.getAttribute('name') || ''; } set name(v) { this.setAttribute('name', v); }
  get href() { return this.getAttribute('href') || ''; } set href(v) { this.setAttribute('href', v); }
  get src() { return this.getAttribute('src') || ''; } set src(v) { this.setAttribute('src', v); }
  get hidden() { return this.hasAttribute('hidden'); } set hidden(v) { this.toggleAttribute('hidden', !!v); }
  get open() { return this.hasAttribute('open'); } set open(v) { this.toggleAttribute('open', !!v); }
  get disabled() { return this.hasAttribute('disabled'); } set disabled(v) { this.toggleAttribute('disabled', !!v); }
  get selected() { return this.hasAttribute('selected'); } set selected(v) { this.toggleAttribute('selected', !!v); }
  get checked() { return this._checked !== undefined ? this._checked : this.hasAttribute('checked'); } set checked(v) { this._checked = !!v; }
  get value() {
    if (this._value !== undefined) return this._value;
    if (this.localName === 'select') { const o = this.querySelectorAll('option'); const s = o.find(x => x.hasAttribute('selected')) || o[0]; return s ? s.value : ''; }
    if (this.localName === 'textarea') return this.textContent;
    if (this.localName === 'option') return this.hasAttribute('value') ? this.getAttribute('value') : this.textContent;
    return this.getAttribute('value') ?? '';
  }
  set value(v) { this._value = String(v); }
  get defaultValue() { return this.getAttribute('value') ?? ''; }
  get validity() { return { badInput: false, valid: true }; }
  get classList() {
    const el = this, list = () => el.className.split(/\s+/).filter(Boolean);
    const api = {
      add(...c) { const l = list(); c.forEach(x => { if (!l.includes(x)) l.push(x); }); el.className = l.join(' '); },
      remove(...c) { el.className = list().filter(x => !c.includes(x)).join(' '); },
      toggle(c, f) { const has = list().includes(c), want = f === undefined ? !has : !!f; if (want && !has) api.add(c); else if (!want && has) api.remove(c); return want; },
      contains(c) { return list().includes(c); },
      replace(a, b) { if (!list().includes(a)) return false; api.remove(a); api.add(b); return true; },
      get length() { return list().length; }
    };
    return api;
  }
  get dataset() {
    const el = this, key = k => 'data-' + kebab(String(k));
    return new Proxy({}, {
      get(_, k) { if (typeof k !== 'string') return undefined; const a = key(k); return el.attrs.has(a) ? el.attrs.get(a) : undefined; },
      set(_, k, v) { el.attrs.set(key(k), String(v)); return true; },
      deleteProperty(_, k) { el.attrs.delete(key(k)); return true; },
      has(_, k) { return el.attrs.has(key(k)); },
      ownKeys() { return [...el.attrs.keys()].filter(a => a.startsWith('data-')).map(a => camel(a.slice(5))); },
      getOwnPropertyDescriptor(_, k) { const a = key(k); return el.attrs.has(a) ? { value: el.attrs.get(a), enumerable: true, configurable: true, writable: true } : undefined; }
    });
  }
  get style() { if (!this._style) this._style = makeStyle(); return this._style; }
  set style(v) { this._style = makeStyle(); this._style.cssText = String(v); }
  get children() { return this.childNodes.filter(n => n.nodeType === 1); }
  get childElementCount() { return this.children.length; }
  get firstElementChild() { return this.children[0] || null; }
  get lastElementChild() { const c = this.children; return c[c.length - 1] || null; }
  get nextElementSibling() { const p = this.parentNode; if (!p) return null; const c = p.childNodes; for (let i = c.indexOf(this) + 1; i < c.length; i++) if (c[i].nodeType === 1) return c[i]; return null; }
  get previousElementSibling() { const p = this.parentNode; if (!p) return null; const c = p.childNodes; for (let i = c.indexOf(this) - 1; i >= 0; i--) if (c[i].nodeType === 1) return c[i]; return null; }
  _adopt(n) { if (n.parentNode) n.parentNode.removeChild(n); n.parentNode = this; }
  appendChild(n) {
    if (n.nodeType === 11) { [...n.childNodes].forEach(c => this.appendChild(c)); return n; }
    this._adopt(n); this.childNodes.push(n); this.ownerDocument._inserted(n); return n;
  }
  insertBefore(n, ref) {
    if (!ref) return this.appendChild(n);
    if (n.nodeType === 11) { [...n.childNodes].forEach(c => this.insertBefore(c, ref)); return n; }
    this._adopt(n); const i = this.childNodes.indexOf(ref); this.childNodes.splice(i < 0 ? this.childNodes.length : i, 0, n); this.ownerDocument._inserted(n); return n;
  }
  removeChild(n) { const i = this.childNodes.indexOf(n); if (i >= 0) { this.childNodes.splice(i, 1); n.parentNode = null; } return n; }
  replaceChild(n, old) { this.insertBefore(n, old); this.removeChild(old); return old; }
  _clear() { this.childNodes.forEach(c => { c.parentNode = null; }); this.childNodes = []; }
  replaceChildren(...ns) { this._clear(); this.append(...ns); }
  append(...ns) { ns.forEach(n => this.appendChild(typeof n === 'string' ? new MText(this.ownerDocument, n) : n)); }
  prepend(...ns) { const f = this.firstChild; ns.forEach(n => this.insertBefore(typeof n === 'string' ? new MText(this.ownerDocument, n) : n, f)); }
  before(...ns) { const p = this.parentNode; if (p) ns.forEach(n => p.insertBefore(typeof n === 'string' ? new MText(this.ownerDocument, n) : n, this)); }
  after(...ns) { const p = this.parentNode; if (!p) return; let ref = this.nextSibling; ns.forEach(n => p.insertBefore(typeof n === 'string' ? new MText(this.ownerDocument, n) : n, ref)); }
  replaceWith(...ns) { this.before(...ns); this.remove(); }
  get textContent() { let s = ''; const walk = n => { for (const c of n.childNodes) { if (c.nodeType === 3) s += c.data; else if (c.nodeType === 1) walk(c); } }; walk(this); return s; }
  set textContent(v) { this._clear(); v = v === null || v === undefined ? '' : String(v); if (v !== '') { const t = new MText(this.ownerDocument, v); t.parentNode = this; this.childNodes.push(t); } }
  get innerText() { return this.textContent; } set innerText(v) { this.textContent = v; }
  get innerHTML() { return this.childNodes.map(serialize).join(''); }
  set innerHTML(h) { this._clear(); parseInto(this, String(h)); this.ownerDocument._htmlSet(this); }
  get outerHTML() { return serialize(this); }
  insertAdjacentHTML(pos, html) { const f = this.ownerDocument.createDocumentFragment(); parseInto(f, String(html)); this._adjacent(pos, f); }
  insertAdjacentElement(pos, el) { this._adjacent(pos, el); return el; }
  insertAdjacentText(pos, t) { this._adjacent(pos, new MText(this.ownerDocument, t)); }
  _adjacent(pos, node) {
    const p = String(pos).toLowerCase();
    if (p === 'beforebegin') { if (this.parentNode) this.parentNode.insertBefore(node, this); }
    else if (p === 'afterbegin') this.insertBefore(node, this.firstChild);
    else if (p === 'beforeend') this.appendChild(node);
    else if (p === 'afterend') { if (this.parentNode) this.parentNode.insertBefore(node, this.nextSibling); }
  }
  querySelector(sel) { return qsa(this, sel, true)[0] || null; }
  querySelectorAll(sel) { return qsa(this, sel, false); }
  getElementsByTagName(t) { return qsa(this, t, false); }
  getElementsByClassName(c) { return qsa(this, String(c).split(/\s+/).filter(Boolean).map(x => '.' + x).join(''), false); }
  closest(sel) { const s = parseSelector(sel, this.ownerDocument); let n = this; while (n && n.nodeType === 1) { if (matchesAny(n, s)) return n; n = n.parentNode; } return null; }
  matches(sel) { return matchesAny(this, parseSelector(sel, this.ownerDocument)); }
  focus() { this.ownerDocument.activeElement = this; }
  blur() { if (this.ownerDocument.activeElement === this) this.ownerDocument.activeElement = this.ownerDocument.body; }
  select() {} click() {} scrollIntoView() {} scrollTo() {} scrollBy() {} play() { return Promise.resolve(); } pause() {} load() {} getContext() { return null; }
  showModal() { this.open = true; } show() { this.open = true; } close() { this.open = false; }
  animate() { return { finished: Promise.resolve(), cancel() {}, finish() {}, onfinish: null }; }
  getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 }; }
  getClientRects() { return this.isConnected ? [this.getBoundingClientRect()] : []; }
  get offsetWidth() { return 0; } get offsetHeight() { return 0; } get offsetTop() { return 0; } get offsetLeft() { return 0; }
  get clientWidth() { return 0; } get clientHeight() { return 0; } get scrollHeight() { return 0; } get scrollWidth() { return 0; }
  cloneNode(deep) { const c = new MElement(this.ownerDocument, this.localName); this.attrs.forEach((v, k) => c.attrs.set(k, v)); if (deep) this.childNodes.forEach(ch => { const k = ch.cloneNode(true); k.parentNode = c; c.childNodes.push(k); }); return c; }
}
class MDocument extends MNode {
  constructor() {
    super(null); this.ownerDocument = this; this.nodeType = 9; this.nodeName = '#document';
    this.documentElement = new MElement(this, 'html'); this.documentElement.parentNode = this; this.childNodes = [this.documentElement];
    this.head = new MElement(this, 'head'); this.body = new MElement(this, 'body');
    this.documentElement.appendChild(this.head); this.documentElement.appendChild(this.body);
    this.activeElement = this.body; this.hidden = false; this.visibilityState = 'visible'; this.readyState = 'complete'; this.cookie = ''; this.title = '';
    this.fonts = { ready: Promise.resolve(), load: () => Promise.resolve([]) };
    this.onScript = null; this.onHtml = null; this.selectorProblems = [];
  }
  _inserted(n) { if (this.onScript && n.nodeType === 1 && n.localName === 'script' && n.getAttribute('src') && n.isConnected) this.onScript(n); }
  _htmlSet(el) { if (this.onHtml) this.onHtml(el); }
  createElement(t) { return new MElement(this, String(t)); }
  createElementNS(ns, t) { return new MElement(this, String(t)); }
  createTextNode(d) { return new MText(this, d); }
  createComment() { return new MText(this, ''); }
  createDocumentFragment() { const f = new MElement(this, '#fragment'); f.nodeType = 11; return f; }
  getElementById(id) {
    // A remembered answer is used only while it is still in this document under that id.
    const hit = this._ids && this._ids.get(id);
    if (hit && hit.attrs.get('id') === id && hit.isConnected) return hit;
    const found = this._findId(id);
    if (found) (this._ids = this._ids || new Map()).set(id, found);
    return found;
  }
  _findId(id) {
    const stack = [this.documentElement];
    while (stack.length) { const n = stack.pop(); if (n.attrs.get('id') === id) return n; for (let i = n.childNodes.length - 1; i >= 0; i--) if (n.childNodes[i].nodeType === 1) stack.push(n.childNodes[i]); }
    return null;
  }
  querySelector(s) { return qsa(this.documentElement, s, true, true)[0] || null; }
  querySelectorAll(s) { return qsa(this.documentElement, s, false, true); }
  getElementsByTagName(t) { return this.querySelectorAll(t); }
  get scrollingElement() { return this.documentElement; }
  execCommand() { return false; }
  hasFocus() { return true; }
}
function parseInto(parent, html) {
  const doc = parent.ownerDocument, stack = [parent];
  const re = /<!--[\s\S]*?-->|<![^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
  let last = 0, m;
  const text = s => { if (!s) return; const t = new MText(doc, decodeEnt(s)); const top = stack[stack.length - 1]; t.parentNode = top; top.childNodes.push(t); };
  while ((m = re.exec(html))) {
    if (m.index > last) text(html.slice(last, m.index));
    last = re.lastIndex;
    if (m[0][1] === '!') continue;
    if (m[1]) { const t = m[1].toLowerCase(); for (let i = stack.length - 1; i > 0; i--) if (stack[i].localName === t) { stack.length = i; break; } continue; }
    const t = m[2].toLowerCase(), el = new MElement(doc, t);
    const ar = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g; let a;
    while ((a = ar.exec(m[3]))) el.attrs.set(a[1].toLowerCase(), decodeEnt(a[2] !== undefined ? a[2] : a[3] !== undefined ? a[3] : a[4] !== undefined ? a[4] : ''));
    const top = stack[stack.length - 1]; el.parentNode = top; top.childNodes.push(el);
    if (RAW_TAGS.has(t)) {
      const end = html.toLowerCase().indexOf('</' + t, last), raw = end < 0 ? html.slice(last) : html.slice(last, end);
      if (raw) { const tn = new MText(doc, t === 'textarea' || t === 'title' ? decodeEnt(raw) : raw); tn.parentNode = el; el.childNodes.push(tn); }
      last = end < 0 ? html.length : html.indexOf('>', end) + 1; re.lastIndex = last; continue;
    }
    if (!VOID_TAGS.has(t) && !m[4]) stack.push(el);
  }
  if (last < html.length) text(html.slice(last));
}
function serialize(n) {
  if (n.nodeType === 3) return n.parentNode && RAW_TAGS.has(n.parentNode.localName) && n.parentNode.localName !== 'textarea' ? n.data : escText(n.data);
  if (n.nodeType !== 1) return '';
  let s = '<' + n.localName; n.attrs.forEach((v, k) => { s += ' ' + k + (v === '' ? '' : '="' + escAttrV(v) + '"'); }); s += '>';
  if (VOID_TAGS.has(n.localName)) return s;
  return s + n.childNodes.map(serialize).join('') + '</' + n.localName + '>';
}
/* Selectors: comma lists, descendant / child / sibling combinators, tag, #id,
   .class, [attr], [attr=v] (and ^= $= *= ~=), :not(...), :checked,
   :first-child, :last-child. Anything else is recorded as a harness
   problem (the run fails) rather than silently matching nothing. */
const selCache = new Map();
function parseSelector(sel, doc) {
  sel = String(sel);
  if (selCache.has(sel)) return selCache.get(sel);
  let i = 0; const n = sel.length;
  const ident = () => { let s = ''; while (i < n) { const c = sel[i]; if (c === '\\') { s += sel[i + 1]; i += 2; } else if (/[\w -￿-]/.test(c)) { s += c; i++; } else break; } return s; };
  const groups = []; let parts = [], comb = null;
  const compound = () => {
    const c = { tag: null, id: null, cls: [], attrs: [], nots: [], pseudo: [] }; let any = false;
    while (i < n) {
      const ch = sel[i];
      if (ch === '#' || ch === '.') { i++; const v = ident(); if (ch === '#') c.id = v; else c.cls.push(v); any = true; }
      else if (ch === '[') {
        i++; let depthQ = null, inner = '';
        while (i < n) { const x = sel[i]; if (depthQ) { if (x === '\\') { inner += x + sel[i + 1]; i += 2; continue; } if (x === depthQ) depthQ = null; inner += x; i++; continue; } if (x === '"' || x === "'") { depthQ = x; inner += x; i++; continue; } if (x === ']') { i++; break; } inner += x; i++; }
        const mm = /^\s*([\w-]+)\s*(?:([~^$*|]?=)\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^\s\]]+)))?\s*$/.exec(inner);
        if (!mm) throw new Error('selector: cannot read [' + inner + ']');
        const raw = mm[3] !== undefined ? mm[3] : mm[4] !== undefined ? mm[4] : mm[5];
        c.attrs.push({ name: mm[1].toLowerCase(), op: mm[2] || null, val: raw === undefined ? null : raw.replace(/\\(.)/g, '$1') });
        any = true;
      } else if (ch === ':') {
        i++; if (sel[i] === ':') i++; const name = ident(); let arg = null;
        if (sel[i] === '(') { let d = 0, s = ''; i++; while (i < n) { const x = sel[i]; if (x === '(') d++; if (x === ')') { if (d === 0) { i++; break; } d--; } s += x; i++; } arg = s; }
        if (name === 'not') c.nots.push(parseSelector(arg, doc)); else c.pseudo.push(name);
        any = true;
      } else if (ch === '*') { i++; any = true; }
      else if (/[\w-]/.test(ch)) { c.tag = ident().toLowerCase(); any = true; }
      else break;
    }
    return any ? c : null;
  };
  while (i < n) {
    const ch = sel[i];
    if (/\s/.test(ch)) { i++; if (parts.length && comb === null) comb = ' '; continue; }
    if (ch === ',') { i++; if (parts.length) groups.push(parts); parts = []; comb = null; continue; }
    if (ch === '>' || ch === '+' || ch === '~') { i++; comb = ch; continue; }
    const c = compound();
    if (!c) throw new Error('selector: cannot read "' + sel + '" at ' + i);
    parts.push({ comb: parts.length ? (comb || ' ') : null, c }); comb = null;
  }
  if (parts.length) groups.push(parts);
  selCache.set(sel, groups);
  return groups;
}
const KNOWN_PSEUDO = new Set(['checked', 'first-child', 'last-child', 'focus', 'scope']);
function matchCompound(el, c) {
  if (c.tag && el.localName !== c.tag) return false;
  if (c.id !== null && el.attrs.get('id') !== c.id) return false;
  if (c.cls.length) { const have = (el.attrs.get('class') || '').split(/\s+/); for (const k of c.cls) if (!have.includes(k)) return false; }
  for (const a of c.attrs) {
    if (!el.attrs.has(a.name)) return false;
    if (a.op === null) continue;
    const v = el.attrs.get(a.name);
    if (a.op === '=' && v !== a.val) return false;
    if (a.op === '^=' && !v.startsWith(a.val)) return false;
    if (a.op === '$=' && !v.endsWith(a.val)) return false;
    if (a.op === '*=' && !v.includes(a.val)) return false;
    if (a.op === '~=' && !v.split(/\s+/).includes(a.val)) return false;
    if (a.op === '|=' && !(v === a.val || v.startsWith(a.val + '-'))) return false;
  }
  for (const p of c.pseudo) {
    if (!KNOWN_PSEUDO.has(p)) { el.ownerDocument.selectorProblems.push(':' + p); return false; }
    if (p === 'checked' && !el.checked) return false;
    if (p === 'focus' && el.ownerDocument.activeElement !== el) return false;
    if (p === 'first-child' && el.parentNode && el.parentNode.childNodes.find(x => x.nodeType === 1) !== el) return false;
    if (p === 'last-child' && el.parentNode && el.parentNode.lastElementChild !== el) return false;
  }
  for (const g of c.nots) if (matchesAny(el, g)) return false;
  return true;
}
function matchParts(el, parts, k) {
  if (!matchCompound(el, parts[k].c)) return false;
  if (k === 0) return true;
  const comb = parts[k].comb;
  if (comb === '>') { const p = el.parentNode; return !!(p && p.nodeType === 1 && matchParts(p, parts, k - 1)); }
  if (comb === '+') { const p = el.previousElementSibling; return !!(p && matchParts(p, parts, k - 1)); }
  if (comb === '~') { let p = el.previousElementSibling; while (p) { if (matchParts(p, parts, k - 1)) return true; p = p.previousElementSibling; } return false; }
  let p = el.parentNode; while (p && p.nodeType === 1) { if (matchParts(p, parts, k - 1)) return true; p = p.parentNode; } return false;
}
function matchesAny(el, groups) { for (const g of groups) if (matchParts(el, g, g.length - 1)) return true; return false; }
function qsa(root, sel, first, includeRoot) {
  let groups;
  try { groups = parseSelector(sel, root.ownerDocument); } catch (e) { root.ownerDocument.selectorProblems.push(String(sel)); return []; }
  const out = [], stack = includeRoot ? [root] : [...root.childNodes].reverse();
  while (stack.length) {
    const nd = stack.pop();
    if (nd.nodeType !== 1) continue;
    if (matchesAny(nd, groups)) { out.push(nd); if (first) return out; }
    for (let i = nd.childNodes.length - 1; i >= 0; i--) stack.push(nd.childNodes[i]);
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
   2. The virtual clock. One per schedule, shared by both consoles and the
   fake server. Timers fire in (time, creation order); after each one every
   promise reaction runs before the next timer, as in a browser.
   ════════════════════════════════════════════════════════════════════════ */
const ALS = new AsyncLocalStorage();
class VClock {
  constructor() { this.now = 0; this.seq = 0; this.q = []; this.cancelled = new Set(); }
  add(delay, fn, meta) {
    const id = ++this.seq, at = this.now + Math.max(0, Number(delay) || 0);
    const t = { id, at, fn, meta: meta || {}, run: AsyncLocalStorage.snapshot() };
    let lo = 0, hi = this.q.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; const x = this.q[mid]; if (x.at < at || (x.at === at && x.id < id)) lo = mid + 1; else hi = mid; }
    this.q.splice(lo, 0, t);
    return id;
  }
  cancel(id) { const i = this.q.findIndex(t => t.id === id); if (i >= 0) this.q.splice(i, 1); }
  sleep(ms, meta) { return new Promise(r => this.add(ms, r, meta)); }
  pending(filter) { return this.q.filter(filter || (() => true)); }
}
const flushMicrotasks = () => new Promise(r => setImmediate(r));
Error.stackTraceLimit = 50;
// The console line that awaited teacherWriteConfig for this transaction (V8's async stack names the awaiting caller).
function callSiteOf(stack) {
  for (const l of String(stack).split('\n')) {
    if (!l.includes(SITE.consoleName)) continue;
    const m = /:(\d+):\d+\)?\s*$/.exec(l); if (!m) continue;
    const n = Number(m[1]), hit = SITE.sites.find(x => x.line === n);
    if (hit) return String(hit.line);
  }
  return 'unknown';
}
// The three writers this tool does not drive (named in the header): the one-time board migration, mic sampling, the practice-minutes goal.
const OUT_OF_SCOPE_WRITERS = ['teacherMigrateActivityBoard', 'teacherSetMicSampling', 'teacherSetPmWeekGoal'];

/* ════════════════════════════════════════════════════════════════════════
   3. Seeded randomness (mulberry32). Each schedule has its own stream,
   worked out from (--seed, schedule index), so one schedule replays alone.
   ════════════════════════════════════════════════════════════════════════ */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashSeed(seed, k, salt) { let h = 2166136261 ^ salt; for (const c of String(seed) + ':' + k) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function makeRng(seed, k, salt) {
  const r = mulberry32(hashSeed(seed, k, salt || 0));
  const rng = () => r();
  rng.int = (a, b) => a + Math.floor(r() * (b - a + 1));
  rng.pick = arr => arr[Math.floor(r() * arr.length)];
  rng.chance = p => r() < p;
  rng.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  return rng;
}

/* ════════════════════════════════════════════════════════════════════════
   4. Plain data helpers shared by the server, the model and the checks.
   ════════════════════════════════════════════════════════════════════════ */
const isMap = v => v !== null && typeof v === 'object' && !Array.isArray(v) && !(v && v.__fieldValue);
function canon(v) {
  if (v === undefined) return 'undefined';
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  return '{' + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
}
// A deep copy with every map's keys in sorted order — what Firestore hands back.
function sortedClone(v) {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(sortedClone);
  const o = {}; Object.keys(v).sort().forEach(k => { o[k] = sortedClone(v[k]); }); return o;
}
function getPath(obj, path) {
  let cur = obj;
  for (const p of path.split('.')) { if (cur === null || typeof cur !== 'object' || !Object.prototype.hasOwnProperty.call(cur, p)) return undefined; cur = cur[p]; }
  return cur;
}
// Every leaf of a doc (a map is walked; an array, a scalar or an EMPTY map is a leaf).
function leaves(obj, prefix, out) {
  out = out || new Map();
  Object.keys(obj || {}).forEach(k => {
    const p = prefix ? prefix + '.' + k : k, v = obj[k];
    if (isMap(v) && Object.keys(v).length) leaves(v, p, out); else out.set(p, v);
  });
  return out;
}
function docDiff(a, b) {
  const la = leaves(a), lb = leaves(b), out = [];
  new Set([...la.keys(), ...lb.keys()]).forEach(p => { if (canon(la.get(p)) !== canon(lb.get(p))) out.push(p); });
  return out.sort();
}

/* ════════════════════════════════════════════════════════════════════════
   5. The fake server: one in-memory Firestore shared by both consoles.
   Modelled: doc reads; collection reads; transactions (the update function
   may run more than once; a commit whose read docs changed since they were
   read is refused and the whole function re-run after a backoff, up to 5
   attempts, then the transaction fails with `aborted`, as the Firestore web
   SDK does; a function that throws ends the transaction with that error and
   is not re-run); set with {merge:true} (nested maps merge, arrays and
   empty maps replace, FieldValue.delete() removes); a seeded latency on
   every read, every transaction read, every commit request and every reply;
   a commit log in server order. NOT modelled: offline queueing and the
   SDK's local cache, onSnapshot listeners, security rules, batched writes,
   server timestamps, document size limits.
   ════════════════════════════════════════════════════════════════════════ */
const DELETE = Object.freeze({ __fieldValue: 'delete' });
const BACKOFF = [0, 1000, 1500, 2250, 3375];
class FakeServer {
  constructor({ clock, rng, fault, docs }) {
    this.clock = clock; this.rng = rng; this.fault = fault || null;
    this.docs = new Map(); this.ver = new Map();
    Object.keys(docs).forEach(p => { this.docs.set(p, JSON.parse(JSON.stringify(docs[p]))); this.ver.set(p, 1); });
    this.commits = []; this.events = []; this.seq = 0; this.txSeq = 0; this.violations = [];
    this.history = [{ i: 0, doc: sortedClone(this.docs.get('config/class')) }];
    this.onCommit = null; this.onTxEnd = null;
  }
  latency() { const r = this.rng(); return r < 0.85 ? 8 + Math.floor(this.rng() * 70) : 120 + Math.floor(this.rng() * 480); }
  log(who, text) { this.events.push({ t: this.clock.now, n: ++this.seq, who, text }); }
  snap(path) { const ex = this.docs.has(path); const data = ex ? sortedClone(this.docs.get(path)) : undefined; return { exists: ex, data, ver: this.ver.get(path) || 0 }; }
  version(path) { return this.ver.get(path) || 0; }
  async read(path, who) {
    await this.clock.sleep(this.latency(), { kind: 'server' });
    const s = this.snap(path);
    this.log(who, `read ${path}` + (path === 'config/class' && s.exists ? ` (configVersion ${s.data.configVersion})` : ''));
    await this.clock.sleep(this.latency(), { kind: 'server' });
    return s;
  }
  async query(prefix, who) {
    await this.clock.sleep(this.latency(), { kind: 'server' });
    const out = [...this.docs.keys()].filter(k => k.startsWith(prefix + '/') && k.slice(prefix.length + 1).indexOf('/') < 0).sort().map(p => ({ path: p, ...this.snap(p) }));
    this.log(who, `read ${prefix}/* (${out.length} docs)`);
    await this.clock.sleep(this.latency(), { kind: 'server' });
    return out;
  }
  forbidden(who, what) { this.violations.push({ t: this.clock.now, who: who.console, action: who.action, what }); this.log(who, 'REFUSED (not allowed in this tool): ' + what); return Promise.reject(Object.assign(new Error('fake server: ' + what), { code: 'permission-denied' })); }
  /* set(…, {merge:true}): a nested map merges key by key; an array, a scalar or an EMPTY map replaces;
     FieldValue.delete() removes the key. A map that holds only deletes does not create its parent
     (Firestore deletes nothing and adds nothing there). */
  merge(dst, src) {
    const setsSomething = v => isMap(v) && Object.keys(v).length ? Object.keys(v).some(k => setsSomething(v[k])) : v !== DELETE;
    Object.keys(src).forEach(k => {
      const v = src[k];
      if (v === DELETE) delete dst[k];
      else if (isMap(v) && Object.keys(v).length) { if (!isMap(dst[k])) { if (!setsSomething(v)) return; dst[k] = {}; } this.merge(dst[k], v); }
      else dst[k] = v && v.__fieldValue ? null : JSON.parse(JSON.stringify(v === undefined ? null : v));
    });
    return dst;
  }
  async transaction(fn, who) {
    const tx = ++this.txSeq;
    if (this.onTxStart) this.onTxStart(who);
    for (let attempt = 1; attempt <= 5; attempt++) {
      if (attempt > 1) await this.clock.sleep(Math.round(BACKOFF[attempt - 1] * (0.5 + this.rng())), { kind: 'server' });
      const reads = new Map(), writes = [];
      let readCV = null;
      const t = {
        get: async ref => { const s = await this.read(ref.path, who); reads.set(ref.path, s.ver); if (ref.path === 'config/class') readCV = s.exists ? Number(s.data.configVersion) || 0 : 0; return makeSnap(ref, s); },
        set: (ref, data, o) => { writes.push({ path: ref.path, data, merge: !!(o && o.merge) }); return t; },
        update: (ref, data) => { writes.push({ path: ref.path, data, merge: true }); return t; },
        delete: ref => { writes.push({ path: ref.path, del: true }); return t; }
      };
      this.log(who, `transaction #${tx} attempt ${attempt}: runs the update function`);
      let result;
      try { result = await fn(t); }
      catch (e) {
        this.log(who, `transaction #${tx}: the update function threw — ${e && e.message}`);
        /* A refusal is judged by what the server saw, not by the flag the console puts on its error: the update
           function threw on a read whose configVersion is not the one this console held (the version guard's only
           way to throw). Such a write must reach "Nothing was saved" (untold refusal otherwise), whatever the error
           says (plant-a-fault 23e08d8999: e.staleConfig false gave the connection wording; 25c60b00cd: a strict
           writer's guard threw a TypeError). */
        const vC = who.peekVersion ? who.peekVersion() : null;
        const guard = readCV != null && vC != null && Number(vC) !== readCV;
        if (this.onTxEnd) this.onTxEnd(who, { tx, outcome: (e && e.staleConfig) || guard ? 'refused' : 'threw', error: e, readCV, vConsole: vC });
        throw e;
      }
      const vConsole = who.peekVersion ? who.peekVersion() : null;
      if (this.dropRate && this.rng() < this.dropRate) {
        // The connection drops: the commit request never reaches the server, nothing is written, the client hears of it after a while.
        await this.clock.sleep(this.latency() + 400, { kind: 'server' });
        this.log(who, `transaction #${tx}: the CONNECTION DROPPED before the commit reached the server — nothing written`);
        if (this.onTxEnd) this.onTxEnd(who, { tx, outcome: 'dropped', readCV, vConsole });
        throw Object.assign(new Error('fake server: the connection dropped'), { code: 'unavailable' });
      }
      await this.clock.sleep(this.latency(), { kind: 'server' });
      // At the server: Firestore commits only if every doc the transaction read is unchanged since.
      const stale = [...reads].filter(([p, v]) => this.version(p) !== v);
      if (stale.length && this.fault !== 'no-conflict-check') {
        this.log(who, `transaction #${tx} attempt ${attempt}: commit REFUSED by the server — ${stale.map(([p]) => p).join(', ')} changed since it was read`);
        await this.clock.sleep(this.latency(), { kind: 'server' });
        if (this.fault === 'no-retry') {
          if (this.onTxEnd) this.onTxEnd(who, { tx, outcome: 'aborted', readCV });
          throw Object.assign(new Error('fake server: transaction conflicted (no retry)'), { code: 'aborted' });
        }
        continue;
      }
      const readVer = reads.get('config/class');
      for (const w of writes) {
        if (w.path !== 'config/class') { this.violations.push({ t: this.clock.now, who: who.console, action: who.action, what: 'a transaction wrote ' + w.path }); continue; }
        const cur = this.docs.get(w.path) || {};
        const next = w.del ? null : w.merge ? this.merge(JSON.parse(JSON.stringify(cur)), w.data) : this.merge({}, w.data);
        if (next === null) this.docs.delete(w.path); else this.docs.set(w.path, next);
        this.ver.set(w.path, this.version(w.path) + 1);
      }
      if (writes.some(w => w.path === 'config/class')) {
        const doc = this.docs.get('config/class') || {};
        const c = { i: this.commits.length + 1, t: this.clock.now, console: who.console, action: who.action, tx, attempt,
          readVersion: readVer === undefined ? null : readVer, readConfigVersion: readCV, configVersion: doc.configVersion, vConsole,
          staleRead: stale.length > 0, patch: writes.filter(w => w.path === 'config/class').map(w => w.data) };
        this.commits.push(c);
        this.history.push({ i: c.i, doc: sortedClone(doc) });
        this.log(who, `transaction #${tx}: COMMITTED, configVersion now ${doc.configVersion}${stale.length ? ' (ON A STALE READ)' : ''}`);
        if (this.onCommit) this.onCommit(who, c);
      }
      await this.clock.sleep(this.latency(), { kind: 'server' });
      if (this.onTxEnd) this.onTxEnd(who, { tx, outcome: 'committed', readCV, vConsole });
      return result;
    }
    this.log(who, `transaction #${tx}: FAILED after 5 attempts`);
    if (this.onTxEnd) this.onTxEnd(who, { tx, outcome: 'aborted', readCV: null });
    throw Object.assign(new Error('fake server: transaction failed after 5 attempts'), { code: 'aborted' });
  }
}
function makeSnap(ref, s) {
  return { exists: s.exists, id: ref.path.split('/').pop(), ref, data: () => s.exists ? s.data : undefined, get: k => s.exists ? getPath(s.data, k) : undefined };
}
// The `db` one console sees: every call is tagged with the console and the action that made it.
function makeDb(server, label, peekVersion) {
  const who = () => ({ console: label, action: ALS.getStore() || null, peekVersion });
  const docRef = path => ({
    path, id: path.split('/').pop(),
    get: () => { const w = who(); return server.read(path, w).then(s => makeSnap(docRef(path), s)); },
    set: () => server.forbidden(who(), 'a bare .set() on ' + path),
    update: () => server.forbidden(who(), 'an .update() on ' + path),
    delete: () => server.forbidden(who(), 'a .delete() on ' + path),
    collection: n => colRef(path + '/' + n),
    onSnapshot: () => { server.violations.push({ t: server.clock.now, who: label, what: 'onSnapshot on ' + path + ' (not modelled)' }); return () => {}; }
  });
  const colRef = path => {
    const q = {
      path, doc: id => docRef(path + '/' + id), where: () => q, orderBy: () => q, limit: () => q, startAfter: () => q,
      get: () => { const w = who(); return server.query(path, w).then(list => { const docs = list.map(d => makeSnap(docRef(d.path), d)); return { docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) }; }); },
      add: () => server.forbidden(who(), 'an .add() to ' + path)
    };
    return q;
  };
  return { collection: n => colRef(n), doc: p => docRef(p), runTransaction: fn => server.transaction(fn, who()), batch: () => { throw new Error('fake server: batch writes are not modelled'); } };
}

/* ════════════════════════════════════════════════════════════════════════
   6. One console = one vm context holding the site's own scripts, in
   index.html's order (the app parts, then the console parts, read whole
   through site-src.mjs), its own DOM (index.html's <body>), its own storage,
   its own copy of every console variable (teacherClassConfig,
   teacherConfigVersion …). Nothing in the site's code is changed; stubbed are
   Firestore itself (`db`) and the browser around the page (confirm() answers
   OK, alert() is recorded, prompt() answers nothing).
   The Firebase SDK and firebase-config.js are not loaded: TEACHER_EMAIL is
   a made-up address, and `db` is the fake server (section 5).
   ════════════════════════════════════════════════════════════════════════ */
let SITE = null;
function compileSite(root, consoleFile) {
  const S = (file, text) => new vm.Script(text, { filename: file });
  const read = f => readFileSync(join(root, f), 'utf8');
  const scripts = [S('(made-up firebase-config)', "var TEACHER_EMAIL = 'teacher@example.test';")];
  for (const f of ['config-main.js', 'class-activities.js', 'i18n.js', 'guitar-diagrams.js']) scripts.push(S(f, read(f)));
  scripts.push(S('app (all parts)', siteSource('app.js', root)));
  for (const f of ['practice-minutes-config.js', 'practice-minutes.js']) if (existsSync(join(root, f))) scripts.push(S(f, read(f)));
  const consoleText = consoleFile ? readFileSync(consoleFile, 'utf8') : siteSource('teacher.js', root);
  const consoleName = consoleFile ? 'console (' + consoleFile + ')' : 'console (all teacher-*.js parts)';
  scripts.push(S(consoleName, consoleText));
  // Every `await teacherWriteConfig(` call site in the console script, with the function it sits in (checks.mjs 1ai pins 27).
  const sites = [], lines = consoleText.split('\n'); let fn = '?';
  lines.forEach((l, i) => { const m = /^\s*(?:async\s+)?function\s+([\w$]+)/.exec(l); if (m) fn = m[1]; if (l.includes('await teacherWriteConfig(')) sites.push({ line: i + 1, fn }); });
  const modules = {};
  readdirSync(root).filter(f => /^module-\d+\.js$/.test(f)).forEach(f => { modules[/\d+/.exec(f)[0]] = S(f, read(f)); });
  const html = read('index.html');
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  if (!body) throw new Error('index.html has no <body>');
  const bodyHtml = body[1].replace(/<script\b[\s\S]*?<\/script>/gi, '');
  return { root, scripts, modules, bodyHtml, consoleText, consoleName, sites };
}
// The activity data alone, in a bare context: the model and the schedule generator read it, never the console.
function loadActivityData(root) {
  const c = { window: {} }; c.window = c; vm.createContext(c);
  vm.runInContext(readFileSync(join(root, 'class-activities.js'), 'utf8'), c);
  return JSON.parse(JSON.stringify(c.CLASS_ACTIVITIES.map(a => ({ id: a.id, title: a.title, title_power: a.title_power, kind: a.kind || null, library: a.library,
    teacherOnly: a.teacherOnly === true, optional: a.optional === true, number: a.number, journey: !!a.journey, wholeOrSheet: !!(a.card && (a.card.wholeSong || a.card.sheet)) }))));
}

function makeConsole(W, label) {
  const clock = W.clock, doc = new MDocument();
  parseInto(doc.body, SITE.bodyHtml);
  const C = { label, doc, alerts: [], warns: [], errors: [], paints: 0, reloads: 0 };
  const tag = () => ALS.getStore() || null;
  doc.onHtml = el => { if (el.attrs.get('id') === 't-grid-container') C.paints++; };
  const store = () => { const d = new Map(); return { getItem: k => d.has(String(k)) ? d.get(String(k)) : null, setItem: (k, v) => { d.set(String(k), String(v)); }, removeItem: k => { d.delete(String(k)); }, clear: () => d.clear(), key: i => [...d.keys()][i] ?? null, get length() { return d.size; } }; };
  const meta = { kind: 'console', console: label };
  const intervals = new Map(); let ivSeq = 0;
  const rnd = makeRng(W.seed, W.k, label.charCodeAt(0));
  const BASE = W.baseTime;
  // The page's clock is the virtual one. Formatting with explicit fields reuses one Intl formatter per (locale, fields): same text, a fraction of the time.
  const fmts = new Map();
  const fmt = (loc, o, d) => { const key = JSON.stringify([loc, o]); let f = fmts.get(key); if (!f) fmts.set(key, f = new Intl.DateTimeFormat(loc, o)); return f.format(d); };
  const hasDate = o => o && ['year', 'month', 'day', 'weekday', 'dateStyle'].some(k => k in o), hasTime = o => o && ['hour', 'minute', 'second', 'timeStyle'].some(k => k in o);
  class VDate extends Date {
    constructor(...a) { if (a.length === 0) super(BASE + clock.now); else super(...a); }
    static now() { return BASE + clock.now; }
    toLocaleDateString(loc, o) { return hasDate(o) && !hasTime(o) ? fmt(loc, o, this) : super.toLocaleDateString(loc, o); }
    toLocaleTimeString(loc, o) { return hasTime(o) && !hasDate(o) ? fmt(loc, o, this) : super.toLocaleTimeString(loc, o); }
  }
  const pageError = (what, e) => C.errors.push({ t: clock.now, action: tag(), msg: what + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e)) });
  const ctx = {
    console: { log() {}, info() {}, debug() {}, warn: (...a) => C.warns.push({ t: clock.now, action: tag(), msg: a.map(String).join(' ') }), error: (...a) => pageError('console.error', a.map(x => x && x.stack ? x.stack : String(x)).join(' ')) },
    document: doc, localStorage: store(), sessionStorage: store(),
    location: { search: '?teacher=true', hostname: 'localhost', host: 'localhost', origin: 'http://localhost', protocol: 'http:', pathname: '/index.html', hash: '', href: 'http://localhost/index.html?teacher=true',
      reload() { C.reloads++; }, replace() { C.reloads++; }, assign() { C.reloads++; } },
    history: { scrollRestoration: 'auto', state: null, length: 1, replaceState() {}, pushState() {}, back() {} },
    navigator: { userAgent: 'two-consoles-loop', platform: 'node', language: 'en', languages: ['en'], onLine: true, maxTouchPoints: 0, clipboard: { writeText: () => Promise.resolve() } },
    setTimeout: (fn, ms, ...args) => clock.add(ms, () => { if (typeof fn === 'function') fn(...args); }, meta),
    clearTimeout: id => { if (typeof id === 'number') clock.cancel(id); },
    setInterval: (fn, ms) => { const iv = ++ivSeq; const arm = () => intervals.set(iv, clock.add(Math.max(Number(ms) || 0, 1), () => { arm(); fn(); }, { kind: 'interval', console: label })); arm(); return 'iv' + iv; },
    clearInterval: x => { const k = Number(String(x || '').slice(2)); if (intervals.has(k)) { clock.cancel(intervals.get(k)); intervals.delete(k); } },
    requestAnimationFrame: fn => clock.add(16, () => fn(clock.now), meta), cancelAnimationFrame: id => clock.cancel(id),
    requestIdleCallback: fn => clock.add(1, () => fn({ timeRemaining: () => 10, didTimeout: false }), meta), cancelIdleCallback: id => clock.cancel(id),
    queueMicrotask, structuredClone,
    alert: m => { C.alerts.push({ t: clock.now, action: tag(), msg: String(m) }); },
    confirm: () => true, prompt: () => null, open: () => null, print() {}, focus() {}, blur() {},
    matchMedia: () => ({ matches: false, media: '', addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
    getComputedStyle: el => ({ getPropertyValue: () => '', display: (el && el._style && el._style.display) || '' }),
    getSelection: () => ({ isCollapsed: true, rangeCount: 0, anchorNode: null, removeAllRanges() {}, toString: () => '' }),
    CSS: { escape: s => String(s).replace(/[^\w-]/g, c => '\\' + c), supports: () => false },
    fetch: () => Promise.reject(new Error('no network')),
    Image: class { constructor() { this.onload = null; } }, Audio: class { play() { return Promise.resolve(); } pause() {} load() {} addEventListener() {} removeEventListener() {} },
    AudioContext: undefined, webkitAudioContext: undefined,
    MutationObserver: class { observe() {} disconnect() {} takeRecords() { return []; } }, ResizeObserver: class { observe() {} unobserve() {} disconnect() {} }, IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    Event: class { constructor(t, o) { this.type = t; Object.assign(this, o || {}); } preventDefault() {} stopPropagation() {} },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o || {}); } preventDefault() {} stopPropagation() {} },
    KeyboardEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o || {}); } }, MouseEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o || {}); } },
    HTMLElement: MElement, Element: MElement, Node: MNode, HTMLInputElement: MElement, HTMLSelectElement: MElement, HTMLTextAreaElement: MElement, HTMLDetailsElement: MElement,
    Blob: class { constructor(p) { this.parts = p; } }, URL, URLSearchParams, TextEncoder, TextDecoder, Date: VDate,
    performance: { now: () => clock.now, mark() {}, measure() {} },
    crypto: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(rnd() * 256); return a; }, randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, () => Math.floor(rnd() * 16).toString(16)) },
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    scrollTo() {}, scroll() {}, scrollBy() {}, scrollX: 0, scrollY: 0, pageXOffset: 0, pageYOffset: 0, innerWidth: 1366, innerHeight: 657, outerWidth: 1366, outerHeight: 657, devicePixelRatio: 1,
    screen: { width: 1366, height: 768 }, name: '', isSecureContext: true
  };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx; ctx.top = ctx; ctx.parent = ctx;
  vm.createContext(ctx);
  vm.runInContext('Math.random = __r; delete globalThis.__r;', Object.assign(ctx, { __r: () => rnd() }));
  doc.onScript = el => {
    const m = /^module-(\d+)\.js$/.exec(el.getAttribute('src') || '');
    clock.add(1, () => {
      if (m && SITE.modules[m[1]]) { try { SITE.modules[m[1]].runInContext(ctx); } catch (e) { pageError('loading ' + el.getAttribute('src'), e); } if (typeof el.onload === 'function') el.onload(); }
      else if (typeof el.onerror === 'function') el.onerror(new Error('no network'));
    }, meta);
  };
  for (const s of SITE.scripts) { try { s.runInContext(ctx); } catch (e) { pageError('loading the site', e); } }
  ctx.firebase = { firestore: Object.assign(() => ctx.__db, {
    FieldValue: { delete: () => DELETE, serverTimestamp: () => ({ __fieldValue: 'serverTimestamp' }), increment: n => ({ __fieldValue: 'increment', n }) },
    Timestamp: class { constructor(s, n) { this.seconds = s; this.nanoseconds = n; } toMillis() { return this.seconds * 1000; } static now() { return new this(Math.floor((BASE + clock.now) / 1000), 0); } }
  }) };
  vm.runInContext(`
    globalThis.__peek = () => ({ cfg: teacherClassConfig, v: teacherConfigVersion, view: teacherView, open: teacherConfigWritesOpen,
      board: activityBoardMode, loaded: teacherClassConfigLoaded, screen: (typeof teacherActivityScreen === 'function' && teacherView === 'activities') ? teacherActivityScreen() : '' });
  `, ctx);
  ctx.__db = makeDb(W.server, label, () => { try { return ctx.__peek().v; } catch { return null; } });
  vm.runInContext('db = __db;', ctx);
  C.ctx = ctx; C.peek = () => ctx.__peek(); C.pageError = pageError;
  return C;
}

/* ════════════════════════════════════════════════════════════════════════
   7. The made-up class. Twelve students with made-up names, ids and
   e-mails, and a seeded config/class whose board holds four units.
   ════════════════════════════════════════════════════════════════════════ */
const STUDENTS = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return { uid: 'fake-uid-' + n, name: 'Test Student ' + n, email: 'student' + n + '@example.test', period: i < 5 ? '4' : i < 10 ? '7' : 'CAS' };
});
const UNITS = { 1: ['ca-8', 'ca-1', 'ca-2', 'ca-3'], 2: ['ca-10', 'ca-12', 'ca-13', 'ca-14', 'ca-41'], 3: ['ca-21', 'ca-22', 'ca-23', 'ca-11'], 0: ['ca-43'] };
// The students' own docs never change during a schedule (students do not write here); Clear all reads them.
let PROGRESS = null;
const TODAY = () => { const d = new Date(Date.UTC(2026, 10, 11, 18, 0, 0)); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
function seedDocs() {
  const board = {};
  Object.keys(UNITS).forEach(mn => UNITS[mn].forEach((id, i) => { board[id] = { module: Number(mn), pos: i + 1 }; }));
  const dates = { 'ca-8': '2026-11-02', 'ca-1': '2026-11-03', 'ca-2': '2026-11-04', 'ca-3': '2026-11-05', 'ca-10': '2026-11-06', 'ca-12': '2026-11-09', 'ca-13': '2026-11-10', 'ca-21': '2026-11-11', 'ca-11': '2026-11-13' };
  const docs = {
    'config/class': { configVersion: 1, gamesEnabled: true, gameOverrides: {}, activityBoardSeeded: true, activityBoard: board, activityDates: dates,
      hiddenActivities: { 'ca-22': true }, optionalActivities: {}, archivedActivities: { 'ca-23': true }, deletedActivities: {},
      activityPins: ['ca-21', 'ca-10'], activityStudents: { 'ca-12': { 'fake-uid-03': true, 'fake-uid-07': true } },
      archived: { 'fake-uid-12': true }, paused: {}, periodOverrides: {}, moduleOpenThrough: {}, activityTitles: {}, playAlongActivities: {}, songLibrary: {}, classSongs: {} }
  };
  STUDENTS.forEach((s, i) => {
    const done = {}; Object.keys(dates).forEach((id, k) => { if ((i * 7 + k * 3) % 5 < 3) done[id] = true; });
    docs['progress/' + s.uid] = { name: s.name, email: s.email, period: s.period, classActivities: done, caSteps: {}, exitChecks: {}, skills: {}, responses: {}, migrations: { swap45: true } };
  });
  PROGRESS = {}; STUDENTS.forEach(st => { PROGRESS[st.uid] = docs['progress/' + st.uid]; });
  return docs;
}

/* ════════════════════════════════════════════════════════════════════════
   8. Running a world: both consoles and the server on one clock.
   ════════════════════════════════════════════════════════════════════════ */
let CURRENT_WORLD = null;
process.on('unhandledRejection', e => {
  const W = CURRENT_WORLD; const msg = 'unhandled rejection: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e));
  if (W) W.looseErrors.push({ t: W.clock.now, msg }); else console.error('two-consoles-loop:', msg);
});
function makeWorld(seed, k, fault) {
  const clock = new VClock();
  const W = { seed, k, clock, baseTime: Date.UTC(2026, 10, 11, 18, 0, 0), looseErrors: [], consoles: {}, step: '' };
  W.server = new FakeServer({ clock, rng: makeRng(seed, k, 2), fault, docs: seedDocs() });
  CURRENT_WORLD = W;
  return W;
}
// Fire timers until nothing but the consoles' minute timers is left, or the clock passes `capMs`.
async function runUntilQuiet(W, capMs) {
  for (;;) {
    await flushMicrotasks();
    const next = W.clock.q.find(t => t.meta.kind !== 'interval');
    if (!next) return true;
    if (next.at > capMs) return false;
    const t = W.clock.q.shift();
    W.clock.now = Math.max(W.clock.now, t.at);
    try { t.run(t.fn); }
    catch (e) { const C = t.meta.console && W.consoles[t.meta.console]; if (C) C.pageError('a timer threw', e); else W.looseErrors.push({ t: W.clock.now, msg: 'a timer threw: ' + (e && e.stack || e) }); }
    heartbeat(`schedule ${W.k}: ${W.step} @${W.clock.now}ms`);
  }
}
const gridText = C => { const g = C.doc.getElementById('t-grid-container'); return g ? g.textContent.replace(/\s+/g, ' ').trim() : '(no #t-grid-container)'; };
// A view left on a loading line: any .t-loading box whose text starts with "Loading".
const loadingLeft = C => { const g = C.doc.getElementById('t-grid-container'); return g ? g.querySelectorAll('.t-loading').map(x => x.textContent.trim()).filter(s => /^Loading/.test(s)) : []; };
function bootConsole(W, label) {
  const C = makeConsole(W, label);
  W.consoles[label] = C;
  C.booted = false;
  ALS.run('boot:' + label, () => {
    Promise.resolve().then(() => C.ctx.showTeacherApp({ uid: 'fake-teacher-uid', email: 'teacher@example.test', displayName: 'Teacher' }))
      .then(() => { C.booted = true; }, e => { C.pageError('showTeacherApp', e); C.booted = true; });
  });
  return C;
}

async function probe() {
  const t0 = Date.now();
  SITE = compileSite(resolve(opt('--root', REPO)), opt('--console', null));
  const t1 = Date.now();
  const W = makeWorld(1, 0, null);
  const A = bootConsole(W, 'A');
  const t2 = Date.now();
  W.step = 'boot';
  const quiet = await runUntilQuiet(W, 600000);
  const t3 = Date.now();
  console.log({ compileMs: t1 - t0, contextMs: t2 - t1, bootMs: t3 - t2, quiet, now: W.clock.now, booted: A.booted, paints: A.paints, view: A.peek().view, screen: A.peek().screen, v: A.peek().v });
  console.log('alerts', A.alerts, 'errors', A.errors, 'loose', W.looseErrors, 'selector problems', A.doc.selectorProblems);
  console.log('pending', W.clock.q.map(t => t.meta));
  console.log('grid:', gridText(A).slice(0, 400));
  console.log('loading left:', loadingLeft(A));
  console.log('server events:', W.server.events.length);
}

/* ════════════════════════════════════════════════════════════════════════
   9. THE EXPECTED ANSWER — written from the rules in prose
   (.claude/rules/teacher-console.md, the comments in the teacher-*.js
   writers), never by calling the console. It reads the activity DATA
   (class-activities.js, loaded in a bare context), the doc, and the console's
   own copy at the click / at its turn (screenOf / placementOf) for the
   decisions listed in the header. Every rule
   is listed in this file's header (M1–M27); the numbers match.
   ════════════════════════════════════════════════════════════════════════ */
let DATA = null, DATA_BY_ID = null;
const M = {
  // M1: a "song card" can move between Class activities and the Songs page: its data carries library true/false, it is not an exit check, not tied to a Song Journey page, not a whole-song card or lyric sheet.
  isSongCard: a => !!a && (a.library === true || a.library === false) && a.kind !== 'check' && !a.journey && !a.wholeOrSheet,
  // M2: it is on the Songs page when config/class.songLibrary says so (a true/false there wins), else when its data says library: true.
  onSongsPage: (a, doc) => M.isSongCard(a) && (typeof ((doc.songLibrary || {})[a.id]) === 'boolean' ? doc.songLibrary[a.id] : a.library === true),
  // M3: a teacher-only card stays off the board until classSongs[id] is true.
  offBoardTeacherOnly: (a, doc) => a.teacherOnly === true && (doc.classSongs || {})[a.id] !== true,
  // M4: the cards IN a unit: every card with a board row in that unit, archived and deleted ones included (they keep their slot), Songs-page songs and teacher-only cards excluded;
  //     in order of pos, then the shipped `number`, then the number in the id.
  unitIds(doc, unit) {
    const b = doc.activityBoard || {}, num = a => Number.isFinite(Number(a.number)) ? Number(a.number) : Infinity, idn = a => { const m = /^ca-(\d+)$/.exec(a.id); return m ? Number(m[1]) : Infinity; };
    const pos = a => { const n = Number((b[a.id] || {}).pos); return Number.isFinite(n) ? n : Infinity; };
    return DATA.filter(a => b[a.id] && (Number(b[a.id].module) || 0) === unit && !M.onSongsPage(a, doc) && !M.offBoardTeacherOnly(a, doc))
      .sort((x, y) => (pos(x) - pos(y)) || (num(x) - num(y)) || (idn(x) - idn(y))).map(a => a.id);
  },
  // The doc with the Songs-page placement (songLibrary, classSongs) as the screen had it: M5–M7's notion of a unit's cards.
  placedAsOnScreen: (doc, screen) => ({ ...doc, songLibrary: screen.songLibrary, classSongs: screen.classSongs }),
  retired: (doc, id) => ((doc.archivedActivities || {})[id] === true) || ((doc.deletedActivities || {})[id] === true),
  optionalByDefault(doc, id) { const d = DATA_BY_ID[id], who = ((doc.activityStudents || {})[id]) || {}; return !!(d && d.optional === true) || (isMap(who) && Object.keys(who).some(u => who[u] === true)); },
  /* M27: what blocks a student today: a card that is on the board (M4), not archived or deleted, not Hidden, given to that student (an empty or absent Who
     list is the whole class), dated on or before today, Required (optionalActivities[X] true = Optional, false = Required, else the default, M11), not done
     on the student's own doc, and not cleared for them. A CAS student (periodOverrides[uid], else their own period) is blocked by nothing. */
  blockers(doc, uid) {
    const st = STUDENTS.find(x => x.uid === uid); if (!st) return [];
    if (((doc.periodOverrides || {})[uid] || st.period) === 'CAS') return [];
    const done = (PROGRESS[uid] || {}).classActivities || {}, cleared = ((doc.activityClears || {})[uid]) || {}, today = TODAY();
    const onBoard = new Set(Object.keys(doc.activityBoard || {}).flatMap(id => M.unitIds(doc, Number(doc.activityBoard[id].module) || 0)));
    return DATA.filter(x => {
      if (!onBoard.has(x.id) || M.retired(doc, x.id) || (doc.hiddenActivities || {})[x.id] === true) return false;
      const who = ((doc.activityStudents || {})[x.id]) || {}; if (Object.keys(who).some(u => who[u] === true) && who[uid] !== true) return false;
      const date = (doc.activityDates || {})[x.id]; if (!date || date > today) return false;
      const f = (doc.optionalActivities || {})[x.id]; if (f === true || (f !== false && M.optionalByDefault(doc, x.id))) return false;
      return done[x.id] !== true && cleared[x.id] !== true;
    }).map(x => x.id);
  },
  repack(doc, unit, ids) { doc.activityBoard = doc.activityBoard || {}; ids.forEach((id, i) => { doc.activityBoard[id] = { module: unit, pos: i + 1 }; }); },
  setIn(doc, map, key, val) { if (!isMap(doc[map])) doc[map] = {}; doc[map][key] = val; },
  // Removing an entry from a map that is not there leaves no map behind.
  delIn(doc, map, key) { if (isMap(doc[map])) delete doc[map][key]; },
  /* `screen` is the copy the write was worked out from (screenOf, placementOf): the model reads it for ONE thing, the DECISION the
     teacher made looking at it (which cards Hide all / Clear all / Open everyone cover, the card's default under
     Optional / Required, whether an archived card was pinned). The EFFECT of that decision is applied to the doc as it
     stands at the commit. Whether the screen was still true when the write landed is the dependency check (DEPS, in
     section 11), from this tool's own list, not the console's base. */
  apply(doc, act) {
    const a = act.args, d = DATA_BY_ID[a.id] || null, screen = screenOf(act);
    switch (act.kind) {
      // M5: move X to unit U, position P: X leaves wherever it was; U's cards (without X) get X inserted at P (1-based, clamped; none = at the end) and are numbered 1..N;
      //     the unit X left (if another) is numbered 1..N again without it. Nothing else changes.
      //     Whether a song is on the Songs page (M2/M3: so not one of the unit's cards) is read on the screen: this console's own
      //     Songs-page click may land after the move it made first. Rows and positions come from the doc.
      case 'move': {
        const b = doc.activityBoard || {}, from = b[a.id] ? (Number(b[a.id].module) || 0) : null, U = Number(a.module) || 0, md = M.placedAsOnScreen(doc, placementOf(act));
        const list = M.unitIds(md, U).filter(x => x !== a.id);
        const at = (a.pos === null || a.pos === undefined) ? list.length : Math.max(0, Math.min(list.length, Math.round(a.pos) - 1));
        const left = from !== null && from !== U ? M.unitIds(md, from).filter(x => x !== a.id) : null;
        list.splice(at, 0, a.id); M.repack(doc, U, list);
        if (left) M.repack(doc, from, left);
        break;
      }
      // M6: un-assign X: its board row goes, and its unit is numbered 1..N again. Its date, name, Hidden … stay.
      case 'unassign': { const b = doc.activityBoard || {}; if (!b[a.id]) break; const from = Number(b[a.id].module) || 0; const rest = M.unitIds(M.placedAsOnScreen(doc, placementOf(act)), from).filter(x => x !== a.id); delete b[a.id]; M.repack(doc, from, rest); break; }
      // M7: delete X: deletedActivities[X] = true; X leaves archived, hidden, optional, Play Along, Who, dates, names, legacy numbers, every student's gate clears, the pins and the board;
      //     the unit it left is numbered 1..N again.
      case 'delete': {
        const b = doc.activityBoard || {};
        if (b[a.id]) { const from = Number(b[a.id].module) || 0; const rest = M.unitIds(M.placedAsOnScreen(doc, placementOf(act)), from).filter(x => x !== a.id); delete b[a.id]; M.repack(doc, from, rest); }
        M.setIn(doc, 'deletedActivities', a.id, true);
        ['archivedActivities', 'hiddenActivities', 'optionalActivities', 'playAlongActivities', 'activityStudents', 'activityDates', 'activityTitles', 'activityNumbers'].forEach(m => M.delIn(doc, m, a.id));
        if (isMap(doc.activityClears)) Object.keys(doc.activityClears).forEach(u => { if (isMap(doc.activityClears[u])) delete doc.activityClears[u][a.id]; });
        if (Array.isArray(doc.activityPins) && doc.activityPins.includes(a.id)) doc.activityPins = doc.activityPins.filter(x => x !== a.id);
        break;
      }
      // M8: archive X: archivedActivities[X] = true, deletedActivities[X] removed, X unpinned. Restore: both flags removed; the pin does not come back.
      //     The unpin is decided on the screen (was X pinned there?) and applied to the doc's list.
      case 'archive':
        if (a.state === 'archive') M.setIn(doc, 'archivedActivities', a.id, true); else M.delIn(doc, 'archivedActivities', a.id);
        M.delIn(doc, 'deletedActivities', a.id);
        if (a.state === 'archive' && Array.isArray(screen.activityPins) && screen.activityPins.includes(a.id) && Array.isArray(doc.activityPins)) doc.activityPins = doc.activityPins.filter(x => x !== a.id);
        break;
      // M9: move a song to the Songs page / back: songLibrary[X] = where it goes, or removed when that is where its data puts it. The board row stays.
      case 'songPlace': { const toSongs = a.where === 'songs'; if (toSongs === (d && d.library === true)) M.delIn(doc, 'songLibrary', a.id); else M.setIn(doc, 'songLibrary', a.id, toSongs); break; }
      // M10: Hidden: hiddenActivities[X] = true; Visible removes it.
      case 'hidden': if (a.state === 'hide') M.setIn(doc, 'hiddenActivities', a.id, true); else M.delIn(doc, 'hiddenActivities', a.id); break;
      // M11: Optional / Required: stored only when it differs from the card's default (Optional by default when its data says optional: true or its Who list
      //      ticks anyone, as the teacher saw it); optionalActivities[X] = the choice, or removed when the choice IS that default.
      case 'optional': {
        const want = a.state === 'optional';
        const def = M.optionalByDefault(screen, a.id);
        if (want === def) M.delIn(doc, 'optionalActivities', a.id); else M.setIn(doc, 'optionalActivities', a.id, want);
        break;
      }
      // M12: pin: X added at the END of activityPins (at most 4; already there = no change). Unpin: X taken out, the rest keep their order.
      case 'pin': {
        const cur = Array.isArray(doc.activityPins) ? doc.activityPins.slice() : [];
        if (a.state === 'on') { if (!cur.includes(a.id) && cur.length < 4) doc.activityPins = cur.concat(a.id); }
        else if (cur.includes(a.id)) doc.activityPins = cur.filter(x => x !== a.id);
        break;
      }
      // M13: release date: activityDates[X] = the date; clearing it removes the entry.
      case 'date': if (a.value) M.setIn(doc, 'activityDates', a.id, a.value); else M.delIn(doc, 'activityDates', a.id); break;
      // M14: Who, one student: activityStudents[X][uid] = true, or that one key removed (the card's map stays, even empty). Whole class: activityStudents[X] removed.
      case 'who':
        if (a.on) { if (!isMap(doc.activityStudents)) doc.activityStudents = {}; if (!isMap(doc.activityStudents[a.id])) doc.activityStudents[a.id] = {}; doc.activityStudents[a.id][a.uid] = true; }
        else if (isMap(doc.activityStudents) && isMap(doc.activityStudents[a.id])) delete doc.activityStudents[a.id][a.uid];
        break;
      case 'wholeClass': M.delIn(doc, 'activityStudents', a.id); break;
      // M15: rename: activityTitles[X] = { en: the name (trimmed, 120 characters at most), base: the shipped title }; an empty name or the shipped title itself removes the entry.
      case 'rename': {
        const name = String(a.value || '').trim().slice(0, 120);
        if (!name || (d && (name === d.title || name === d.title_power))) M.delIn(doc, 'activityTitles', a.id); else M.setIn(doc, 'activityTitles', a.id, { en: name, base: d.title });
        break;
      }
      // M16: Play Along now: playAlongActivities[X] = true; "by date" removes it.
      case 'playAlong': if (a.state === 'now') M.setIn(doc, 'playAlongActivities', a.id, true); else M.delIn(doc, 'playAlongActivities', a.id); break;
      // M17: a student's Open through: moduleOpenThrough[uid] = the module number; Auto removes it.
      case 'openThrough': if (a.value === 'auto') M.delIn(doc, 'moduleOpenThrough', a.uid); else M.setIn(doc, 'moduleOpenThrough', a.uid, Number(a.value)); break;
      // M18: class games: gamesEnabled = on/off. A student's games: gameOverrides[uid] = true/false; Default removes it.
      case 'classGames': doc.gamesEnabled = !!a.on; break;
      case 'studentGames': if (a.state === 'default') M.delIn(doc, 'gameOverrides', a.uid); else M.setIn(doc, 'gameOverrides', a.uid, a.state === 'on'); break;
      // M19: a student's period: periodOverrides[uid] = 4 / 7 / CAS; Auto removes it. Paused: paused[uid] = true; Active removes it.
      case 'period': if (a.value === 'auto') M.delIn(doc, 'periodOverrides', a.uid); else M.setIn(doc, 'periodOverrides', a.uid, a.value); break;
      case 'paused': if (a.state === 'paused') M.setIn(doc, 'paused', a.uid, true); else M.delIn(doc, 'paused', a.uid); break;
      // M21: Hide all / Show all on unit U: every live (not archived, not deleted) card the teacher saw in U (M4) Hidden, or Visible.
      case 'moduleHidden': M.unitIds(screen, a.module).filter(x => !M.retired(screen, x)).forEach(x => { if (a.state === 'hide') M.setIn(doc, 'hiddenActivities', x, true); else M.delIn(doc, 'hiddenActivities', x); }); break;
      // M22: a gate Clear: activityClears[uid][X] = true; un-clear removes that key.
      case 'clear':
        if (a.state === 'clear') { if (!isMap(doc.activityClears)) doc.activityClears = {}; if (!isMap(doc.activityClears[a.uid])) doc.activityClears[a.uid] = {}; doc.activityClears[a.uid][a.id] = true; }
        else if (isMap(doc.activityClears) && isMap(doc.activityClears[a.uid])) delete doc.activityClears[a.uid][a.id];
        break;
      // M23: Clear all for a student: every card blocking that student on the teacher's screen (M27) gets activityClears[uid][X] = true.
      case 'clearAll': M.blockers(screen, a.uid).forEach(x => { if (!isMap(doc.activityClears)) doc.activityClears = {}; if (!isMap(doc.activityClears[a.uid])) doc.activityClears[a.uid] = {}; doc.activityClears[a.uid][x] = true; }); break;
      // M24: Open everyone through N: every student not archived whose own Open through (a whole number 2..12, else none) is below N gets N. Nobody is lowered.
      case 'openAll': STUDENTS.forEach(st => { if ((screen.archived || {})[st.uid] === true) return; const v = Number((screen.moduleOpenThrough || {})[st.uid]); const cur = Number.isInteger(v) && v >= 2 && v <= 12 ? v : 0; if (cur < a.n) M.setIn(doc, 'moduleOpenThrough', st.uid, a.n); }); break;
      // M25: archive a student: archived[uid] = true; restore removes it.
      case 'studentArchived': if (a.state === 'archive') M.setIn(doc, 'archived', a.uid, true); else M.delIn(doc, 'archived', a.uid); break;
      // M26: a teacher-only card to Class activities: classSongs[X] = true; back to Teacher only removes it.
      case 'classSong': if (a.on) M.setIn(doc, 'classSongs', a.id, true); else M.delIn(doc, 'classSongs', a.id); break;
      default: throw new Error('model: no rule for ' + act.kind);
    }
    // M20: every accepted write moves configVersion on by exactly one.
    doc.configVersion = (Number(doc.configVersion) || 0) + 1;
    return doc;
  }
};
/* What the doc must always look like, whatever happened (Build step 5, "no corruption"):
   no two cards on a unit's board (M4) share a position; every board row is
   { module: a whole number ≥ 0, pos: a whole number ≥ 1 } and nothing else; the doc holds only the
   keys the console writes; activityPins is a list of at most 4 different ids.
   A GAP in a unit's positions is counted and reported, not failed: a Songs-page song keeps its slot on
   purpose, and a gap changes neither the order nor any #N students see (#N is counted along the order). */
const DOC_KEYS = new Set(['configVersion', 'gamesEnabled', 'gameOverrides', 'activityBoard', 'activityBoardSeeded', 'activityDates', 'hiddenActivities', 'optionalActivities',
  'archivedActivities', 'deletedActivities', 'activityPins', 'activityStudents', 'activityTitles', 'playAlongActivities', 'activityNumbers', 'activityClears', 'songLibrary',
  'classSongs', 'archived', 'paused', 'periodOverrides', 'moduleOpenThrough', 'pmWeekGoals', 'micSampling']);
function corruption(doc, gaps, dups) {
  const out = [];
  Object.keys(doc).forEach(k => { if (!DOC_KEYS.has(k)) out.push(`a key the console never writes: ${k}`); });
  const b = doc.activityBoard || {};
  Object.keys(b).forEach(id => {
    const r = b[id];
    if (!isMap(r) || Object.keys(r).sort().join() !== 'module,pos' || !Number.isInteger(r.module) || r.module < 0 || !Number.isInteger(r.pos) || r.pos < 1) out.push(`board row ${id} is malformed: ${canon(r)}`);
  });
  /* A Songs-page song (or a teacher-only card) keeps its board row on purpose, so it comes back where it was;
     the slot it holds is not a hole. Any other gap, and any two cards on the board sharing a position, is. */
  const units = new Set(Object.keys(b).map(id => Number((b[id] || {}).module) || 0));
  units.forEach(u => {
    const ids = M.unitIds(doc, u), ps = ids.map(id => Number(b[id].pos)).sort((x, y) => x - y);
    const held = new Set(Object.keys(b).filter(id => (Number(b[id].module) || 0) === u && !ids.includes(id)).map(id => Number(b[id].pos)));
    const dup = [...new Set(ps.filter((p, i) => ps.indexOf(p) !== i))];
    const top = ps.length ? ps[ps.length - 1] : 0, missing = [];
    for (let p = 1; p <= top; p++) if (!ps.includes(p) && !held.has(p)) missing.push(p);
    if (dup.length && dups) dup.forEach(pp => dups.push({ unit: u, pos: pp, ids: ids.filter(id => Number(b[id].pos) === pp) }));
    if (dup.length || (ps.length && ps[0] < 1)) out.push(`unit ${u}: positions ${ps.join(',')} for ${ids.length} cards` + (dup.length ? ` — duplicate ${dup.join(',')}` : '') + (missing.length ? ` — missing ${missing.join(',')}` : ''));
    else if (missing.length && gaps) gaps.push(`unit ${u}: positions ${ps.join(',')} for ${ids.length} cards — missing ${missing.join(',')}`);
  });
  if (doc.activityPins !== undefined) {
    const p = doc.activityPins;
    if (!Array.isArray(p) || p.length > 4 || new Set(p).size !== p.length || p.some(x => typeof x !== 'string')) out.push('activityPins is not a list of at most 4 different ids: ' + canon(p));
  }
  return out;
}

/* ════════════════════════════════════════════════════════════════════════
   10. Schedules. Each one is drawn from its own seeded stream: who clicks
   what, when. A click's target is picked when it fires, from what that
   console's screen shows then (its own copy), the way a teacher picks it.
   ════════════════════════════════════════════════════════════════════════ */
const SEED_LIVE = ['ca-8', 'ca-1', 'ca-2', 'ca-3', 'ca-10', 'ca-12', 'ca-13', 'ca-14', 'ca-41', 'ca-21', 'ca-22', 'ca-11', 'ca-43'];
const ACT_IDS = [...SEED_LIVE, 'ca-23', 'ca-46', 'ca-48', 'ca-34'];
const SONG_IDS = ['ca-41', 'ca-34'];
const SWITCH_KINDS = ['hidden', 'optional', 'playAlong', 'date', 'who', 'archive', 'rename'];
const ACTIVITY_WRITES = ['move', 'move', 'move', 'unassign', 'delete', 'archive', 'hidden', 'optional', 'pin', 'date', 'who', 'wholeClass', 'rename', 'playAlong', 'songPlace',
  'moduleHidden', 'clear'];
const MANAGE_WRITES = ['period', 'openThrough', 'paused', 'openAll', 'studentArchived'];
const GAMES_WRITES = ['classGames', 'studentGames'];
const OTHER_WRITES = { clearAll: 'students', classSong: 'tsongs' };
const TEACHER_ONLY_ID = 'ca-40';
const BOARD_WRITES = new Set(['move', 'unassign', 'delete']);
const WRITERS = {
  move: (c, a) => c.teacherMoveActivity(a.id, a.module, a.pos),
  unassign: (c, a) => c.teacherUnassignActivity(a.id),
  delete: (c, a) => c.teacherDeleteActivity(a.id),
  archive: (c, a) => c.teacherSetActivityArchived(a.id, a.state),
  songPlace: (c, a) => c.teacherSetSongPlace(a.id, a.where),
  hidden: (c, a) => c.teacherSetActivityHidden(a.id, a.state),
  optional: (c, a) => c.teacherSetActivityOptional(a.id, a.state),
  pin: (c, a) => c.teacherSetActivityPin(a.id, a.state),
  date: (c, a) => c.teacherSetActivityDate(a.id, a.value),
  who: (c, a) => c.teacherSetActivityStudent(a.id, a.uid, a.on),
  wholeClass: (c, a) => c.teacherSetActivityWholeClass(a.id),
  rename: (c, a) => c.teacherSetActivityTitle(a.id, a.value),
  playAlong: (c, a) => c.teacherSetActivityPlayAlong(a.id, a.state),
  openThrough: (c, a) => c.teacherSetStudentOpenThrough(a.uid, a.value),
  classGames: (c, a) => c.teacherSetClassGames(a.on),
  period: (c, a) => c.teacherSetStudentPeriod(a.uid, a.value),
  studentGames: (c, a) => c.teacherSetStudentGames(a.uid, a.state),
  paused: (c, a) => c.teacherSetStudentPaused(a.uid, a.state),
  moduleHidden: (c, a) => c.teacherSetModuleHidden(a.module, a.state),
  clear: (c, a) => c.teacherSetActivityClear(a.uid, a.id, a.state),
  clearAll: (c, a) => c.teacherClearAllBlockers(a.uid),
  openAll: c => c.teacherOpenAllThrough(),
  studentArchived: (c, a) => c.teacherSetStudentArchived(a.uid, a.state),
  classSong: (c, a) => c.teacherSetClassSong(a.id, a.on)
};
const VIEWERS = {
  view: (c, a) => c.setTeacherView(a.v),
  board: c => c.teacherOpenArrangeBoard(),
  boardBack: c => c.teacherCloseArrangeBoard(),
  pick: (c, a) => c.teacherPickActivity(a.id),
  refresh: c => c.teacherRefreshStudents({ manual: true })
};
const FAMILIES = ['solo', 'random', 'diff-switch', 'same-cell', 'same-unit-moves', 'move-vs-switch', 'delete-vs-edit', 'burst', 'map-cells', 'optional-vs-who', 'songs-and-back', 'pin-pair', 'student-cells', 'view-mid-write'];
const FAMILY_CYCLE = ['solo', 'solo', 'solo', 'random', 'random', 'random', 'random', 'random', 'random', 'diff-switch', 'diff-switch', 'same-cell', 'same-cell',
  'same-unit-moves', 'same-unit-moves', 'move-vs-switch', 'move-vs-switch', 'delete-vs-edit', 'delete-vs-edit', 'burst', 'map-cells', 'optional-vs-who', 'optional-vs-who',
  'songs-and-back', 'pin-pair', 'student-cells', 'view-mid-write', 'view-mid-write', 'view-mid-write'];
const uidOf = n => 'fake-uid-' + String(n).padStart(2, '0');

function genSchedule(seed, k, famOverride) {
  const rng = makeRng(seed, k, 3);
  const family = famOverride || FAMILY_CYCLE[k % FAMILY_CYCLE.length];
  const S = { k, family, consoles: family === 'solo' ? ['A'] : ['A', 'B'], bootAt: { A: 0, B: rng.int(0, 60) }, steps: [] };
  const T0 = 2500 + rng.int(0, 300);
  // A flaky network in some solo / random schedules: a commit request is lost on the way (the write fails, nothing is written).
  S.dropRate = (family === 'solo' || family === 'random') && rng() < 0.25 ? 0.12 : 0;
  let order = 0;
  const add = (c, at, kind, fixed) => S.steps.push({ console: c, at: Math.max(0, Math.round(at)), kind, fixed: fixed || {}, r: [rng(), rng(), rng(), rng()], order: order++ });
  if (family === 'solo' || family === 'random') {
    for (const c of S.consoles) {
      // Some consoles start clicking while they are still booting, from 100 ms (a first read superseded by a view switch).
      let screen = 'act', t = rng() < 0.3 ? rng.int(100, 1500) : T0 + rng.int(0, 400);
      const n = family === 'solo' ? rng.int(5, 12) : rng.int(3, 8);
      for (let i = 0; i < n; i++) {
        if (rng() < 0.25) {
          const vk = rng.pick(['view', 'view', 'board', 'refresh', 'pick']);
          if (vk === 'view') { const v = rng.pick(['activities', 'manage', 'games', 'songs', 'students', 'tsongs']); add(c, t, 'view', { v }); screen = v === 'activities' ? 'act' : v; }
          else { add(c, t, vk); if (vk === 'board') screen = 'act'; }
        } else {
          const roll = rng();
          const kind = roll < 0.7 ? rng.pick(ACTIVITY_WRITES) : roll < 0.85 ? rng.pick(MANAGE_WRITES) : roll < 0.93 ? rng.pick(GAMES_WRITES) : rng.pick(Object.keys(OTHER_WRITES));
          const need = MANAGE_WRITES.includes(kind) ? 'manage' : GAMES_WRITES.includes(kind) ? 'games' : OTHER_WRITES[kind] || 'act';
          if (screen !== need) { add(c, t, 'view', { v: need === 'act' ? 'activities' : need }); screen = need; t += rng.int(300, 1200); }
          add(c, t, kind);
        }
        t += rng() < 0.35 ? rng.int(0, 80) : rng.int(100, 1200);
      }
    }
  } else {
    for (const c of S.consoles) if (rng() < 0.35) add(c, T0 - 1500, 'board');
    const dA = T0, dB = T0 + rng.int(-250, 250);
    if (family === 'diff-switch') { const [x, y] = rng.shuffle(SEED_LIVE).slice(0, 2); add('A', dA, rng.pick(SWITCH_KINDS), { id: x }); add('B', dB, rng.pick(SWITCH_KINDS), { id: y }); }
    else if (family === 'same-cell') { const x = rng.pick(SEED_LIVE), kind = rng.pick([...SWITCH_KINDS, 'pin']), f = { id: x }; if (kind === 'who') f.uid = rng.pick(STUDENTS).uid; add('A', dA, kind, f); add('B', dB, kind, { ...f }); }
    else if (family === 'same-unit-moves') { const u = rng.pick([1, 2, 3]); add('A', dA, 'move', { unit: u, sameUnit: true }); add('B', dB, 'move', { unit: u, sameUnit: true }); }
    else if (family === 'move-vs-switch') { add('A', dA, 'move'); add('B', dB, rng.pick([...SWITCH_KINDS, 'pin'])); }
    else if (family === 'delete-vs-edit') { const x = rng.pick(SEED_LIVE); add('A', dA, rng.pick(['delete', 'archive']), { id: x }); add('B', dB, rng.pick(['rename', 'hidden', 'date', 'who', 'move', 'optional', 'pin']), { id: x }); }
    else if (family === 'burst') { let t = dA; for (let i = 0; i < 3; i++) { add('A', t, rng.pick(ACTIVITY_WRITES)); t += rng.int(0, 100); } add('B', dA + rng.int(-50, 250), rng.pick(ACTIVITY_WRITES)); }
    else if (family === 'map-cells') {
      const x = rng.pick(SEED_LIVE.filter(i => i !== 'ca-12')), y = rng.pick(SEED_LIVE.filter(i => i !== x)), lo = rng.int(1, 5), hi = rng.int(6, 11);
      add('A', dA, 'who', { id: x, uid: uidOf(hi), on: true }); add('A', dA + rng.int(5, 40), 'who', { id: x, uid: uidOf(lo), on: true });
      add('A', dA + rng.int(60, 140), 'optional', { id: x }); add('B', dA + rng.int(-60, 50), 'hidden', { id: y });
    } else if (family === 'optional-vs-who') {
      // A sets a card Optional, 4 s later Required; B ticks a student on that card within ±150 ms of one of the two.
      const x = rng.pick(SEED_LIVE.filter(i => i !== 'ca-12' && !(DATA_BY_ID[i] && DATA_BY_ID[i].optional))), near = rng() < 0.5 ? dA : dA + 4000;
      add('A', dA, 'optional', { id: x, state: 'optional' }); add('A', dA + 4000, 'optional', { id: x, state: 'required' });
      add('B', near + rng.int(-150, 150), 'who', { id: x, uid: rng.pick(STUDENTS).uid, on: true });
    } else if (family === 'songs-and-back') {
      // Three slow clicks on ONE console: a song to the Songs page, another card moved into that song's unit, the song back.
      add('A', dA, 'songPlace', { id: 'ca-41', where: 'songs' });
      add('A', dA + 3000, 'move', { id: rng.pick(['ca-21', 'ca-22', 'ca-11', 'ca-8', 'ca-1', 'ca-43']), unit: 2, pos: rng.pick([null, 1, 2, 3]) });
      add('A', dA + 6000, 'songPlace', { id: 'ca-41', where: 'activities' });
      if (rng() < 0.5) add('B', dA + rng.int(0, 6000), rng.pick(['hidden', 'date', 'rename']));
    } else if (family === 'pin-pair') {
      // Hide a card, pin X 15-60 ms later, pin Y 350-600 ms later, all on ONE console.
      const [h, x, y] = rng.shuffle(SEED_LIVE.filter(i => i !== 'ca-21' && i !== 'ca-10')).slice(0, 3);
      add('A', dA, 'hidden', { id: h }); add('A', dA + rng.int(15, 60), 'pin', { id: x, state: 'on' }); add('A', dA + rng.int(350, 600), 'pin', { id: y, state: 'on' });
    } else if (family === 'student-cells') {
      // A gate Clear and its un-clear on one console; then both consoles archive / restore the SAME student (one cell).
      const u = rng.pick(STUDENTS.filter(x => x.uid !== 'fake-uid-12')).uid, x = rng.pick(SEED_LIVE);
      add('A', dA, 'clear', { id: x, uid: u, state: 'clear' }); add('A', dA + rng.int(800, 2000), 'clear', { id: x, uid: u, state: 'unclear' });
      add('A', dA + 3000, 'view', { v: 'manage' }); add('B', dA + 3000, 'view', { v: 'manage' });
      add('A', dA + 4500, 'studentArchived', { uid: u }); add('B', dA + 4500 + rng.int(-200, 200), 'studentArchived', { uid: u });
    } else if (family === 'view-mid-write') {
      // A writes a switch while B writes another card's (so A's write lands diverged and reloads); A opens a view with no
      // auto-refresh while that write and its reload are in flight, sometimes then Refresh (the "Reads" bullet: a read
      // that loses to a newer one must hand back the newest, never leave "Loading…").
      const [x, y] = rng.shuffle(SEED_LIVE).slice(0, 2);
      add('A', dA, rng.pick(['hidden', 'date', 'rename', 'playAlong', 'pin']), { id: x });
      add('B', dA + rng.int(-120, 120), rng.pick(['hidden', 'date', 'rename', 'playAlong']), { id: y });
      add('A', dA + rng.int(30, 900), 'view', { v: rng.pick(['manage', 'games', 'songs', 'tsongs']) });
      if (rng() < 0.5) add('A', dA + rng.int(900, 2500), 'refresh');
    } else throw new Error('unknown family ' + family);
  }
  S.steps.sort((a, b) => a.at - b.at || a.order - b.order);
  return S;
}
// What the click is, worked out from what this console's screen shows right now (its copy, `cfg`).
function resolveClick(step, cfg, label, n) {
  const r = step.r, f = step.fixed, pick = (list, x) => list.length ? list[Math.min(list.length - 1, Math.floor(x * list.length))] : undefined;
  const map = name => isMap(cfg[name]) ? cfg[name] : {};
  const retired = id => map('archivedActivities')[id] === true || map('deletedActivities')[id] === true;
  const placeable = id => { const d = DATA_BY_ID[id]; return !!d && !M.onSongsPage(d, cfg) && !M.offBoardTeacherOnly(d, cfg) && !retired(id); };
  const live = ACT_IDS.filter(id => placeable(id) && map('activityBoard')[id]);
  const built = ACT_IDS.filter(id => placeable(id) && !map('activityBoard')[id]);
  const toggle = (on, x) => x < 0.85 ? !on : on;
  const id = f.id || pick(live, r[0]);
  const uid = f.uid || pick(STUDENTS, r[1]).uid;
  const W = (kind, args) => ({ kind, args });
  switch (step.kind) {
    case 'move': {
      let card, unit;
      if (f.sameUnit) { unit = f.unit; card = pick(M.unitIds(cfg, unit).filter(x => !retired(x)), r[0]); }
      else { card = f.id || pick(live.concat(built), r[0]); unit = f.unit !== undefined ? f.unit : pick([0, 1, 2, 3, 4], r[1]); }
      if (!card) return W('skip', { why: 'no card to move' });
      const len = M.unitIds(cfg, unit).filter(x => x !== card).length;
      return W('move', { id: card, module: unit, pos: f.pos !== undefined ? f.pos : (!f.sameUnit && r[2] < 0.25) ? null : 1 + Math.floor(r[3] * (len + 1)) });
    }
    case 'unassign': return id && map('activityBoard')[id] ? W('unassign', { id }) : W('skip', { why: 'nothing assigned' });
    case 'delete': { const x = f.id || pick(ACT_IDS.filter(i => map('deletedActivities')[i] !== true && !M.onSongsPage(DATA_BY_ID[i], cfg)), r[0]); return x ? W('delete', { id: x }) : W('skip', {}); }
    case 'archive': { const x = f.id || pick(ACT_IDS.filter(i => !M.onSongsPage(DATA_BY_ID[i], cfg)), r[0]); return W('archive', { id: x, state: retired(x) ? 'restore' : 'archive' }); }
    case 'hidden': return id ? W('hidden', { id, state: toggle(map('hiddenActivities')[id] === true, r[1]) ? 'hide' : 'show' }) : W('skip', {});
    case 'optional': {
      if (!id) return W('skip', {});
      const who = map('activityStudents')[id] || {}, d = DATA_BY_ID[id];
      const on = map('optionalActivities')[id] === true || (map('optionalActivities')[id] !== false && (!!(d && d.optional) || Object.keys(who).some(u => who[u] === true)));
      return W('optional', { id, state: f.state || (toggle(on, r[1]) ? 'optional' : 'required') });
    }
    case 'pin': return id ? W('pin', { id, state: f.state || ((Array.isArray(cfg.activityPins) ? cfg.activityPins : []).includes(id) ? 'off' : 'on') }) : W('skip', {});
    case 'date': { const x = f.id || pick(live.concat(built), r[0]); return x ? W('date', { id: x, value: r[2] < 0.3 ? '' : '2026-11-' + String(1 + Math.floor(r[3] * 28)).padStart(2, '0') }) : W('skip', {}); }
    case 'who': return id ? W('who', { id, uid, on: f.on !== undefined ? f.on : !((map('activityStudents')[id] || {})[uid] === true) }) : W('skip', {});
    case 'wholeClass': { const x = f.id || pick(ACT_IDS.filter(i => isMap(map('activityStudents')[i])), r[0]); return x ? W('wholeClass', { id: x }) : W('skip', { why: 'no card has a Who list' }); }
    case 'rename': return id ? W('rename', { id, value: r[1] < 0.25 ? '' : 'Renamed by ' + label + ' ' + n }) : W('skip', {});
    case 'playAlong': return id ? W('playAlong', { id, state: toggle(map('playAlongActivities')[id] === true, r[1]) ? 'now' : 'date' }) : W('skip', {});
    case 'songPlace': { const x = f.id || pick(SONG_IDS, r[0]); return W('songPlace', { id: x, where: f.where || (M.onSongsPage(DATA_BY_ID[x], cfg) ? 'activities' : 'songs') }); }
    case 'moduleHidden': {
      const units = [0, 1, 2, 3, 4].filter(u => M.unitIds(cfg, u).some(x => !retired(x)));
      const u = pick(units, r[0]); if (u === undefined) return W('skip', { why: 'no unit holds a card' });
      const ids = M.unitIds(cfg, u).filter(x => !retired(x));
      return W('moduleHidden', { module: u, state: ids.every(x => map('hiddenActivities')[x] === true) ? 'show' : 'hide' });
    }
    case 'clear': { const x = f.id || pick(live, r[0]); if (!x) return W('skip', {}); return W('clear', { uid, id: x, state: f.state || (((map('activityClears')[uid] || {})[x] === true) ? 'unclear' : 'clear') }); }
    case 'clearAll': return W('clearAll', { uid });
    case 'openAll': return W('openAll', { n: 2 + Math.floor(r[2] * 11) });
    case 'studentArchived': return W('studentArchived', { uid, state: map('archived')[uid] === true ? 'restore' : 'archive' });
    case 'classSong': return W('classSong', { id: TEACHER_ONLY_ID, on: map('classSongs')[TEACHER_ONLY_ID] !== true });
    case 'openThrough': return W('openThrough', { uid, value: r[2] < 0.3 ? 'auto' : String(2 + Math.floor(r[3] * 11)) });
    case 'classGames': return W('classGames', { on: cfg.gamesEnabled === false });
    case 'period': return W('period', { uid, value: pick(['4', '7', 'CAS', 'auto'], r[2]) });
    case 'studentGames': return W('studentGames', { uid, state: pick(['default', 'on', 'off'], r[2]) });
    case 'paused': return W('paused', { uid, state: map('paused')[uid] === true ? 'active' : 'paused' });
    default: throw new Error('no click for ' + step.kind);
  }
}
/* What each write is WORKED OUT FROM (Build step 5's "nobody misled", the write rule in prose: "Cell-checked: base =
   the values the write was worked out from … a cell that moved underneath us refuses"; "Strict: any concurrent write at
   all refuses. For anything derived from more of the doc than its patch names"). Written from the rule file and the
   writers' comments, not read from the console's base: a single-cell switch depends on its own cell; Optional also on
   the card's Who list (its default, M11); a pin on the whole pin list (the new list is worked out from it); Archive on
   its two flags and on whether the card is pinned (it unpins: "a pin or unpin from another console refuses"); Hide all
   on the Hidden flag of every card it covers ("a card someone else re-hid or un-hid in the meantime refuses the whole
   write"). The board writers, Delete, Clear all, Open everyone through and Back to whole class are strict: they depend
   on the whole doc. */
/* The copy a write was worked out from: the copy at the click. A board writer (move, un-assign, delete) waits for its
   turn and plans then, so where a SONG is (Songs page or not) is read from its copy when its transaction started
   (copyAtTx: by then that copy also holds the move itself, which songLibrary / classSongs do not depend on). */
const screenOf = act => act.copyAtClick || {};
const placementOf = act => (BOARD_WRITES.has(act.kind) && act.copyAtTx) || screenOf(act);
const STRICT_KINDS = new Set(['move', 'unassign', 'delete', 'clearAll', 'openAll', 'wholeClass']);
function depsOf(act) {
  const a = act.args, P = path => ({ label: path, get: d => getPath(d, path) });
  switch (act.kind) {
    case 'hidden': return [P('hiddenActivities.' + a.id)];
    case 'optional': return [P('optionalActivities.' + a.id), P('activityStudents.' + a.id)];
    case 'pin': return [P('activityPins')];
    case 'archive': return [P('archivedActivities.' + a.id), P('deletedActivities.' + a.id),
      { label: 'whether ' + a.id + ' is pinned', get: d => Array.isArray(d.activityPins) && d.activityPins.includes(a.id) }];
    case 'date': return [P('activityDates.' + a.id)];
    case 'who': return [P('activityStudents.' + a.id + '.' + a.uid)];
    case 'rename': return [P('activityTitles.' + a.id)];
    case 'playAlong': return [P('playAlongActivities.' + a.id)];
    case 'songPlace': return [P('songLibrary.' + a.id)];
    case 'classSong': return [P('classSongs.' + a.id)];
    case 'moduleHidden': { const sc = screenOf(act); return M.unitIds(sc, a.module).filter(x => !M.retired(sc, x)).map(x => P('hiddenActivities.' + x)); }
    case 'clear': return [P('activityClears.' + a.uid + '.' + a.id)];
    case 'studentArchived': return [P('archived.' + a.uid)];
    case 'openThrough': return [P('moduleOpenThrough.' + a.uid)];
    case 'period': return [P('periodOverrides.' + a.uid)];
    case 'paused': return [P('paused.' + a.uid)];
    case 'studentGames': return [P('gameOverrides.' + a.uid)];
    case 'classGames': return [P('gamesEnabled')];
    default: return null;
  }
}
const describe = a => a.kind + ' ' + Object.keys(a.args || {}).map(k => k + '=' + JSON.stringify(a.args[k])).join(' ');

/* ════════════════════════════════════════════════════════════════════════
   11. One schedule, start to finish, and every check on it.
   ════════════════════════════════════════════════════════════════════════ */
function fire(W, step) {
  const C = W.consoles[step.console]; if (!C) return;
  const p = C.peek(), n = ++W.clickSeq;
  let click;
  if (VIEWERS[step.kind] || step.kind === 'view') {
    if (step.kind === 'board') click = p.view !== 'activities' ? { kind: 'view', args: { v: 'activities' } } : p.screen === 'board' ? { kind: 'boardBack', args: {} } : { kind: 'board', args: {} };
    else if (step.kind === 'pick') { const ids = ACT_IDS.filter(id => DATA_BY_ID[id] && !M.onSongsPage(DATA_BY_ID[id], p.cfg) && !M.offBoardTeacherOnly(DATA_BY_ID[id], p.cfg)); click = p.view === 'activities' && p.screen === 'split' ? { kind: 'pick', args: { id: ids[Math.floor(step.r[0] * ids.length)] } } : { kind: 'skip', args: { why: 'no list on screen' } }; }
    else click = { kind: step.kind, args: { ...step.fixed } };
  } else if (!p.loaded) click = { kind: 'skip', args: { why: step.kind + ': nothing on screen to click yet (still booting)' } };
  else click = resolveClick(step, p.cfg || {}, step.console, n);
  // Open everyone through N reads its module from the Manage view's own select: set it as the teacher would, or there is nothing to click.
  if (click.kind === 'openAll') { const sel = C.doc.getElementById('t-open-all-select'); if (sel) sel.value = String(click.args.n); else click = { kind: 'skip', args: { why: 'openAll: the Manage view is not drawn' } }; }
  const act = { id: step.console + n, n, console: step.console, kind: click.kind, args: click.args, write: !!WRITERS[click.kind], at: W.clock.now, txs: [], commits: [], done: false,
    vClick: p.v, copyAtClick: sortedClone(p.cfg || {}), viewAtClick: p.view + (p.screen ? '/' + p.screen : '') };
  W.actions.push(act); W.byId[act.id] = act;
  W.server.log({ console: act.console, action: act.id }, `CLICK ${describe(act)} (on ${act.viewAtClick}, holding configVersion ${p.v})`);
  if (click.kind === 'skip') { act.done = true; return; }
  const fn = WRITERS[click.kind] || VIEWERS[click.kind];
  ALS.run(act.id, () => {
    let ret;
    try { ret = fn(C.ctx, act.args); } catch (e) { C.pageError('the click threw', e); }
    Promise.resolve(ret).then(() => finish(W, act), e => { C.pageError('the click rejected', e); finish(W, act); });
  });
}
function docAtVersion(W, v) { const h = W.server.history.find(x => Number(x.doc.configVersion) === Number(v)); return h ? h.doc : null; }
function finish(W, act) {
  act.done = true; act.doneAt = W.clock.now;
  W.server.log({ console: act.console, action: act.id }, `DONE ${act.kind}`);
  if (!act.write || !act.commits.length) return;
  /* Versions bullet: a write that landed on top of another console's change must return with that
     change in this console's copy (it reloads before it returns), so the repaint is the merged truth. */
  const c = act.commits[0];
  if (c.vConsole === null || c.vConsole === undefined) return;
  const others = W.server.commits.filter(x => x.console !== act.console && x.configVersion > c.vConsole && x.configVersion <= c.readConfigVersion);
  if (!others.length) return;
  act.diverged = true;
  if (W.actions.some(x => x !== act && x.console === act.console && x.write && !x.done)) { act.copyCheckSkipped = true; return; }
  const copy = W.consoles[act.console].peek().cfg || {};
  const later = W.server.history.filter(h => h.i >= c.i).map(h => h.doc);
  for (const o of others) for (const [p] of leaves(o.patch[0] || {})) {
    if (p === 'configVersion') continue;
    const have = canon(getPath(copy, p)), ok = later.some(d => canon(getPath(d, p)) === have);
    if (!ok) { (W.liveProblems = W.liveProblems || []).push({ cat: 'copy left stale', msg: `${act.id} ${describe(act)} landed on top of ${o.action || o.console}'s write (configVersion ${o.configVersion}) but returned with ${p} = ${have} in its copy; the server had ${canon(getPath(later[0], p))}` }); return; }
  }
}

async function runSchedule(k, o) {
  // Proves the watchdog: TWO_CONSOLES_HANG_TEST=K stops schedule K in a synchronous loop, as a hung console would.
  if (process.env.TWO_CONSOLES_HANG_TEST === String(k)) { heartbeat(`schedule ${k}: the hang test`, true); for (;;) { /* hang on purpose */ } }
  const S = genSchedule(o.seed, k, o.family);
  const W = makeWorld(o.seed, k, o.fault);
  W.server.dropRate = S.dropRate;
  W.actions = []; W.byId = {}; W.clickSeq = 0; W.liveProblems = [];
  W.server.onTxEnd = (who, info) => { const a = W.byId[who.action]; if (a) a.txs.push(info); };
  W.server.onCommit = (who, c) => { const a = W.byId[who.action]; if (a) a.commits.push(c); };
  // Which of the console's `await teacherWriteConfig(` call sites made this transaction: read off the async stack.
  W.sitesHit = {};
  W.server.onTxStart = who => { const a = W.byId[who && who.action]; if (a && !a.copyAtTx && W.consoles[a.console]) a.copyAtTx = sortedClone(W.consoles[a.console].peek().cfg || {}); const line = callSiteOf(new Error().stack); W.sitesHit[line] = (W.sitesHit[line] || 0) + 1; };
  W.step = 'boot';
  for (const c of S.consoles) W.clock.add(S.bootAt[c], () => { const C = bootConsole(W, c); C.alertLog = true; }, { kind: 'harness' });
  for (const st of S.steps) W.clock.add(st.at, () => { W.step = `click ${st.console} ${st.kind}`; fire(W, st); }, { kind: 'harness' });
  const lastAt = S.steps.length ? S.steps[S.steps.length - 1].at : 0;
  const quiet = await runUntilQuiet(W, lastAt + 600000);
  const problems = [...W.liveProblems];
  const P = (cat, msg) => problems.push({ cat, msg });
  if (!quiet) P('never went quiet', 'timers still pending 10 minutes (virtual) after the last click: ' + W.clock.q.slice(0, 3).map(t => JSON.stringify(t.meta)).join(' '));
  W.actions.filter(a => !a.done).forEach(a => P('a click never finished', `${a.id} ${describe(a)}`));
  const labels = S.consoles;
  labels.forEach(l => { const C = W.consoles[l]; if (C && !C.booted) P('a click never finished', `console ${l} never finished booting`); });
  // No dead view, before anything else reads.
  labels.forEach(l => { const left = loadingLeft(W.consoles[l]); if (left.length) P('dead view', `console ${l} left on "${left[0]}" (view ${W.consoles[l].peek().view}) with nothing left to run`); });
  // Each console's own next read.
  W.step = 'the final read';
  labels.forEach(l => { const C = W.consoles[l]; ALS.run('final:' + l, () => { try { if (C.peek().view === 'students') C.ctx.loadTeacherClassConfig(); else C.ctx.renderTeacherBody(); } catch (e) { C.pageError('the final read', e); } }); });
  if (!await runUntilQuiet(W, W.clock.now + 600000)) P('never went quiet', 'after the final read');
  const doc = sortedClone(W.server.docs.get('config/class'));
  labels.forEach(l => {
    const C = W.consoles[l], p = C.peek();
    const left = loadingLeft(C); if (left.length) P('dead view', `console ${l} still on "${left[0]}" after its own next read`);
    const d = docDiff(sortedClone(p.cfg || {}), doc);
    if (d.length) P('console differs from the server after its next read', `console ${l}: ${d.slice(0, 3).map(x => `${x}: console ${canon(getPath(p.cfg, x))}, server ${canon(getPath(doc, x))}`).join('; ')}${d.length > 3 ? ` (+${d.length - 3} more)` : ''}`);
    if (Number(p.v) !== Number(doc.configVersion)) P('console differs from the server after its next read', `console ${l} holds configVersion ${p.v}, the server ${doc.configVersion}`);
    C.errors.forEach(e => P('page error', `console ${l}: ${e.msg}`));
    if (C.doc.selectorProblems.length) P('page error', `console ${l}: a selector this DOM cannot read: ${[...new Set(C.doc.selectorProblems)].join(', ')}`);
    if (C.reloads) P('page error', `console ${l} asked the page to reload ${C.reloads} time(s)`);
  });
  W.looseErrors.forEach(e => P('page error', e.msg));
  W.server.violations.forEach(v => P('server rule', `${v.who}${v.action ? ' ' + v.action : ''}: ${v.what}`));
  W.server.commits.filter(c => c.staleRead).forEach(c => P('fake server not Firestore', `commit ${c.i} (${c.action}) went through on a read that was no longer current`));

  // Outcomes, and whether each console was told.
  const writes = W.actions.filter(a => a.write);
  for (const a of writes) {
    const C = W.consoles[a.console], last = a.txs[a.txs.length - 1];
    a.outcome = !a.txs.length ? (a.commits.length ? 'accepted' : 'no-write') : last.outcome === 'committed' ? 'accepted' : last.outcome === 'refused' ? 'refused' : 'failed';
    const al = C.alerts.filter(x => x.action === a.id), stale = al.filter(x => x.msg.startsWith('Nothing was saved.'));
    a.told = stale.length;
    if (a.outcome === 'refused') {
      a.error = last.error && last.error.message;
      if (!stale.length) P('untold refusal', `${a.id} ${describe(a)}: refused (${a.error}); the console showed ${al.length ? '"' + al[0].msg.split('\n')[0] + '"' : 'nothing'}`);
      else if (stale.length > 1) P('told twice', `${a.id} ${describe(a)}: "Nothing was saved" ${stale.length} times`);
      // Self-inflicted: no other console wrote between the version this console held and the one the refusal read.
      const others = W.server.commits.filter(x => x.console !== a.console && x.configVersion > Number(last.vConsole) && x.configVersion <= Number(last.readCV));
      a.selfInflicted = !others.length;
      // A cell-checked refusal must name a cell that really moved.
      const m = /, at: (.*)$/.exec(a.error || '');
      if (m) {
        const at = docAtVersion(W, last.readCV) || {};
        const paths = m[1].split(', ');
        if (paths.every(p => canon(getPath(a.copyAtClick, p)) === canon(getPath(at, p)))) P('refused over an unchanged cell', `${a.id} ${describe(a)}: refused at ${paths.join(', ')}, which held ${paths.map(p => canon(getPath(at, p))).join(', ')} both on this console's screen and on the server`);
      }
    } else if (a.outcome === 'failed') {
      // A write that failed for any other reason (the connection dropped, five conflicts in a row) must say so once, in the writer's own words.
      if (stale.length) P('a failed write shown as stale', `${a.id} ${describe(a)}: ${last.outcome} — the console said "Nothing was saved … another tab" instead of a connection problem`);
      else if (al.length !== 1) P('a failed write not told', `${a.id} ${describe(a)}: ${last.outcome}; the console showed ${al.length} alert(s)`);
    } else if (stale.length) P('"Nothing was saved" for a saved write', `${a.id} ${describe(a)}: ${a.outcome === 'accepted' ? 'committed as configVersion ' + a.commits[0].configVersion : 'it never wrote'}, yet the console said "Nothing was saved"`);
    if (BOARD_WRITES.has(a.kind) && a.txs.length) {
      const first = a.txs[0];
      a.gap = W.server.commits.some(x => x.console !== a.console && x.configVersion > Number(a.vClick) && x.configVersion <= Number(first.readCV));
    }
  }
  /* A click that wrote nothing (no transaction at all) must be one that changes nothing the teacher sees: the model's
     effect, applied to the copy the click was made on, leaves it as it was (a pin already there, nothing blocking,
     everyone already open …), or the console said why in an alert (the 4-pin limit). Otherwise the click was dropped
     silently: the screen shows it, the server never hears of it. */
  /* Only the console's two own "nothing to do" alerts excuse a click that wrote nothing (the 4-pin limit, everyone already
     open). Any other alert beside a dropped click is no excuse: a writer that says "Saved." and writes nothing must fail. */
  const NOOP_ALERTS = [/^Keep practicing holds /, /^Everyone is already open through Module /];
  let noWriteNoop = 0, noWriteAlert = 0, noWriteDocChange = 0;
  for (const a of writes.filter(x => x.outcome === 'no-write')) {
    const sc = sortedClone(screenOf(a)), ghost = sortedClone(sc);
    try { M.apply(ghost, a); } catch { continue; }
    const changed = docDiff(sc, ghost).filter(p => p !== 'configVersion');
    const hd = [...W.server.history].reverse().find(h => h.i === 0 || W.server.commits[h.i - 1].t <= a.at), dg = sortedClone(hd.doc);
    try { M.apply(dg, a); if (docDiff(hd.doc, dg).some(p => p !== 'configVersion')) noWriteDocChange++; } catch { /* counted only */ }
    if (!changed.length) { noWriteNoop++; continue; }
    if (W.consoles[a.console].alerts.some(x => x.action === a.id && NOOP_ALERTS.some(r => r.test(x.msg)))) { noWriteAlert++; continue; }
    P('a click that wrote nothing', `${a.id} ${describe(a)}: no transaction and no alert, yet on the screen it was clicked on it changes ${changed.slice(0, 3).map(p => p + ' ' + canon(getPath(sc, p)) + ' → ' + canon(getPath(ghost, p))).join(', ')}`);
  }
  labels.forEach(l => W.consoles[l].alerts.filter(x => x.msg.startsWith('Nothing was saved.') && !(W.byId[x.action] && W.byId[x.action].write))
    .forEach(x => P('"Nothing was saved" for a saved write', `console ${l}: "Nothing was saved" outside any write (${x.action || 'no click'})`)));
  if (S.family === 'diff-switch') writes.filter(a => a.outcome !== 'accepted').forEach(a => P('switches on different activities did not both land', `${a.id} ${describe(a)}: ${a.outcome}${a.error ? ' (' + a.error + ')' : ''}`));

  /* Did each accepted write land on what its screen showed? For every accepted write W:
     - its screen (the copy the click was made on) is compared with the doc just before W's commit, with this console's
       OWN earlier clicks that had not landed yet put on top (the screen shows them at once: the Repaint bullet);
     - a cell W depends on (depsOf) that differs, and that ANOTHER console's commit changed, is a write that should have
       been refused: "landed on a moved cell" (a lost update, or a decision taken on a stale screen);
     - a cell W writes that this console's own LATER click had already changed (that click landed first) is written over:
       "silent loss" (the newer click is undone and nobody is told — the root of the known pin-list fault).
     Every accepted write is compared, also when an own later click landed before it (those are counted). */
  const Hd = W.server.history, oc = W.server.commits;
  let depChecked = 0, depLater = 0, onOwnRefused = 0;
  for (const w of writes.filter(x => x.outcome === 'accepted' && x.commits.length)) {
    const c = w.commits[0], before = Hd[c.i - 1].doc, after = Hd[c.i].doc;
    const mine = W.actions.filter(x => x.console === w.console && x.write && x !== w);
    const landedAt = x => x.commits.length ? x.commits[0].i : Infinity;
    const pending = mine.filter(x => x.n < w.n && landedAt(x) > c.i && x.outcome !== 'no-write' && !((x.outcome === 'refused' || x.outcome === 'failed') && x.doneAt <= w.at));
    const later = mine.filter(x => x.n > w.n && landedAt(x) < c.i);
    if (pending.some(x => x.outcome === 'refused' || x.outcome === 'failed')) onOwnRefused++;
    /* Own later clicks that landed first and whose change this write undoes: a leaf the later click set (or removed)
       still holds that value just before this write, and this write changes it. An empty map is not a change of its
       own (it is what is left when the last key goes, and the removal is counted on the key). */
    const changesOf = (b, a2) => {
      const out = [];
      a2.forEach((v, q) => { if (q !== 'configVersion' && !(isMap(v) && !Object.keys(v).length) && canon(b.get(q)) !== canon(v)) out.push({ q, v }); });
      b.forEach((v, q) => { if (!a2.has(q) && ![...a2.keys()].some(k => k.startsWith(q + '.')) && !(isMap(v) && !Object.keys(v).length)) out.push({ q, v: undefined }); });
      return out;
    };
    for (const x of later) {
      const xc = x.commits[0];
      const undone = changesOf(leaves(Hd[xc.i - 1].doc), leaves(Hd[xc.i].doc)).find(({ q, v }) => canon(getPath(before, q)) === canon(v) && canon(getPath(after, q)) !== canon(v));
      if (undone) P('silent loss', `${w.id} ${describe(w)} was clicked BEFORE ${x.id} ${describe(x)} but landed after it (commit ${c.i} after ${xc.i}), and wrote ${undone.q} back from ${canon(undone.v)} to ${canon(getPath(after, undone.q))}: the later click is undone, and this console's screen still shows it`);
    }
    if (later.length) depLater++;
    const view = sortedClone(before);
    pending.forEach(x => { try { M.apply(view, x); } catch { /* a rule the model lacks shows up elsewhere */ } });
    const screen = screenOf(w), vScreen = Number(w.vClick) || 0;
    /* The OTHER console's commit that moved this cell after the version the screen was clicked on (vClick: this tab's
       configVersion at the click), before this write landed, to a value the screen does not show. Such a write should
       always have been refused, whatever this console's own later clicks did meanwhile. */
    const movedBy = get => { let o = null; for (const x of oc) { if (x.i >= c.i) break; if (x.console !== w.console && Number(x.configVersion) > vScreen && canon(get(Hd[x.i].doc)) !== canon(get(Hd[x.i - 1].doc)) && canon(get(Hd[x.i].doc)) !== canon(get(screen))) o = x; } return o; };
    depChecked++;
    if (STRICT_KINDS.has(w.kind)) {
      for (const p of docDiff(sortedClone(screen), view)) {
        if (p === 'configVersion') continue;
        const o = movedBy(d => getPath(d, p));
        if (o) { P('landed on a moved cell', `${w.id} ${describe(w)} is strict (worked out from the whole doc) and landed (commit ${c.i}) although ${p} had moved since its screen: the screen showed ${canon(getPath(screen, p))}, the doc held ${canon(getPath(view, p))} after ${o.action} (commit ${o.i}) — it should have been refused`); break; }
      }
    } else for (const dp of depsOf(w) || []) {
      if (canon(dp.get(screen)) === canon(dp.get(view))) continue;
      const o = movedBy(dp.get);
      if (o) { P('landed on a moved cell', `${w.id} ${describe(w)} landed (commit ${c.i}) although ${dp.label}, which it is worked out from, had moved underneath it: the screen showed ${canon(dp.get(screen))}, the doc held ${canon(dp.get(view))} after ${o.action} ${W.byId[o.action] ? describe(W.byId[o.action]) : ''} (commit ${o.i}) — it should have been refused`); break; }
    }
    // M11 in effect: right after an Optional / Required write lands, the card is what the teacher clicked.
    if (w.kind === 'optional') {
      const f = (after.optionalActivities || {})[w.args.id], eff = f === true || (f !== false && M.optionalByDefault(after, w.args.id));
      if (eff !== (w.args.state === 'optional')) P('landed with the opposite effect', `${w.id} ${describe(w)} landed (commit ${c.i}) but the card is ${eff ? 'Optional' : 'Required'} on the doc it made (flag ${canon(f)}, Who ${canon((after.activityStudents || {})[w.args.id])})`);
    }
  }

  // The expected answer: the seeded doc, then the INTENT of every accepted write in server order.
  const model = sortedClone(seedDocs()['config/class']);
  const applied = [], gapsSeen = [], songsBack = new Set(), songBackDups = [];
  /* A duplicate position is corruption, with one exception that is COUNTED, not failed, for Jonathan to rule on:
     a song that came back from the Songs page onto a position another card took while it was away (the row is kept
     on purpose and every re-pack skips Songs-page rows), when the board is exactly the expected answer (no race). */
  const checkBoard = (d, where, mdl) => {
    const dups = [], bad = corruption(d, gapsSeen, dups);
    const songDup = m => /duplicate/.test(m) && dups.filter(x => m.startsWith(`unit ${x.unit}:`)).every(x => x.ids.some(id => songsBack.has(id)))
      && canon(d.activityBoard) === canon(mdl.activityBoard);
    bad.forEach(m => { if (songDup(m)) songBackDups.push(where + ': ' + m); else if (!problems.some(x => x.cat === 'corruption' && x.msg.startsWith(where))) P('corruption', `${where}: ${m}`); });
  };
  for (const c of W.server.commits) {
    const a = W.byId[c.action];
    if (!a || !a.write) { P('a write no click made', `commit ${c.i} came from ${c.action || 'no click'} on console ${c.console}`); continue; }
    const before = leaves(model); M.apply(model, a); const after = leaves(model);
    // What this write changed: every leaf it added or altered, and every leaf it removed (not one that only grew children).
    const set = new Map();
    after.forEach((v, p) => { if (p !== 'configVersion' && canon(before.get(p)) !== canon(v)) set.set(p, v); });
    before.forEach((v, p) => { if (!after.has(p) && ![...after.keys()].some(q => q.startsWith(p + '.'))) set.set(p, undefined); });
    applied.push({ c, a, set });
    if (a.kind === 'songPlace' && a.args.where === 'activities') songsBack.add(a.args.id);
    // A board write made while this console's own Songs-page click for a song had not landed (the screen and the doc disagree on where it is).
    if (BOARD_WRITES.has(a.kind)) SONG_IDS.forEach(id => { const dd = DATA_BY_ID[id]; if (dd && M.onSongsPage(dd, placementOf(a)) !== M.onSongsPage(dd, W.server.history[c.i].doc)) songsBack.add(id); });
    checkBoard(W.server.history[c.i].doc, `after commit ${c.i} (${a.id} ${describe(a)})`, model);
  }
  checkBoard(doc, 'final doc', model);
  /* Silent loss: a change an accepted write made (by its intent) is not in the doc, and no later accepted write
     changed that cell. The message names the change that was lost and the commit that wrote over it. */
  const overlaps = (p, q) => p === q || p.startsWith(q + '.') || q.startsWith(p + '.');
  const H = W.server.history;
  const lastWriter = (p, after) => { for (let j = H.length - 1; j > after; j--) if (canon(getPath(H[j].doc, p)) !== canon(getPath(H[j - 1].doc, p))) return W.server.commits[j - 1]; return null; };
  const nameOf = c => c ? `commit ${c.i} (${c.action}${W.byId[c.action] ? ' ' + describe(W.byId[c.action]) : ''})` : 'no commit';
  applied.forEach((x, j) => x.set.forEach((v, p) => {
    if (applied.slice(j + 1).some(y => [...y.set.keys()].some(q => overlaps(p, q)))) return;
    const have = getPath(doc, p);
    if (canon(have) === canon(v)) return;
    const over = lastWriter(p, x.c.i - 1) || x.c;
    if (Array.isArray(v) && Array.isArray(have) && v.some(e => !have.includes(e))) {
      v.filter(e => !have.includes(e)).forEach(e => {
        const by = applied.find(y => Array.isArray(y.set.get(p)) && y.set.get(p).includes(e)) || x;
        P('silent loss', `${p} lost ${JSON.stringify(e)}, put there by ${by.a.id} ${describe(by.a)} (commit ${by.c.i}, accepted): ${nameOf(over)} wrote ${canon(getPath(H[over.i].doc, p))} over it; the doc ends ${canon(have)}`);
      });
    } else if (Array.isArray(v) && Array.isArray(have)) {
      /* The list holds everything this write meant and MORE. That is either an id carried in from a refused click (the
         false-save check reports it) or a removal that came back ("doc differs" reports it, and the own-later-click check
         calls it silent loss when this console's own earlier write did it). Not reported a second time here. */
    } else P('silent loss', `${x.a.id} ${describe(x.a)} (commit ${x.c.i}, accepted) set ${p} = ${canon(v)}; ${over === x.c ? 'that commit itself wrote ' + canon(getPath(H[x.c.i].doc, p)) : nameOf(over) + ' wrote ' + canon(getPath(H[over.i].doc, p)) + ' over it'}; the doc ends ${canon(have)}`);
  }));
  for (const a of writes.filter(w => w.outcome === 'refused' || w.outcome === 'failed')) {
    const ghost = sortedClone(model); try { M.apply(ghost, a); } catch { continue; }
    const g = leaves(ghost), mm = leaves(model);
    g.forEach((v, p) => {
      if (p === 'configVersion' || canon(v) === canon(mm.get(p))) return;
      if (canon(getPath(doc, p)) === canon(v)) { P('false save', `${a.id} ${describe(a)} was ${a.outcome}, yet ${p} = ${canon(v)} is in the doc`); return; }
      // A list (the pins): an id the refused write would have added is in the doc although the expected answer has none.
      const mv = mm.get(p), dv = getPath(doc, p);
      if (Array.isArray(v) && Array.isArray(dv)) v.filter(e => !(Array.isArray(mv) && mv.includes(e)) && dv.includes(e)).forEach(e => {
        const by = W.server.commits.find(c2 => Array.isArray(getPath(W.server.history[c2.i].doc, p)) && getPath(W.server.history[c2.i].doc, p).includes(e) && !(Array.isArray(getPath(W.server.history[c2.i - 1].doc, p)) && getPath(W.server.history[c2.i - 1].doc, p).includes(e)));
        P('false save', `${a.id} ${describe(a)} was ${a.outcome} (its console was told so), yet ${JSON.stringify(e)} is in ${p}: ${by ? 'commit ' + by.i + ' (' + by.action + (W.byId[by.action] ? ' ' + describe(W.byId[by.action]) : '') + ') wrote it' : 'no commit added it'}`);
      });
    });
  }
  const diff = docDiff(doc, model);
  if (diff.length && !problems.some(x => /silent loss|false save|corruption/.test(x.cat))) P('doc differs from the expected answer', diff.slice(0, 4).map(p => `${p}: doc ${canon(getPath(doc, p))}, expected ${canon(getPath(model, p))}`).join('; ') + (diff.length > 4 ? ` (+${diff.length - 4} more)` : ''));

  const R = { k, family: S.family, consoles: labels.length, problems, writes: writes.length,
    accepted: writes.filter(a => a.outcome === 'accepted').length, refused: writes.filter(a => a.outcome === 'refused').length,
    refusedTold: writes.filter(a => a.outcome === 'refused' && a.told === 1).length, failed: writes.filter(a => a.outcome === 'failed').length,
    noWrite: writes.filter(a => a.outcome === 'no-write').length, staleAlerts: labels.reduce((n, l) => n + W.consoles[l].alerts.filter(x => x.msg.startsWith('Nothing was saved.')).length, 0),
    selfInflicted: writes.filter(a => a.selfInflicted).length, diverged: writes.filter(a => a.diverged).length,
    board: writes.filter(a => a.gap !== undefined).map(a => ({ gap: a.gap, refused: a.outcome === 'refused' })),
    paints: labels.map(l => W.consoles[l].paints), commits: W.server.commits.length, endT: W.clock.now, gaps: gapsSeen.length ? 1 : 0, gapFirst: gapsSeen[0] || null,
    songBack: songBackDups.length ? 1 : 0, songBackFirst: songBackDups[0] || null, sites: W.sitesHit, depChecked, depLater, onOwnRefused, noWriteNoop, noWriteAlert, noWriteDocChange };
  if (o.verbose) R.timeline = W.server.events.concat(labels.flatMap(l => W.consoles[l].alerts.map(x => ({ t: x.t, n: 1e9, who: { console: l, action: x.action }, text: 'ALERT "' + x.msg.split('\n').join(' / ') + '"' }))))
    .sort((a, b) => a.t - b.t || a.n - b.n).map(e => `${String(e.t).padStart(7)}ms  ${(e.who && e.who.console) || '-'} ${((e.who && e.who.action) || '').padEnd(10)} ${e.text}`);
  CURRENT_WORLD = null;
  return R;
}

/* ════════════════════════════════════════════════════════════════════════
   12. The fake server's self-test (break-it 9 shows it is needed): run at
   the start of every run, before any schedule. If the server stops behaving
   like Firestore where this tool leans on it, nothing else is trusted.
   ════════════════════════════════════════════════════════════════════════ */
async function serverSelfTest(fault) {
  const fails = [];
  const clock = new VClock();
  const fixed = ms => () => ms;
  const S = new FakeServer({ clock, rng: makeRng('self-test', 0, 9), fault, docs: { 'config/class': { configVersion: 1, a: { x: 1, y: 2 }, list: [3, 1] } } });
  // 1. Two transactions race on one doc: the one that commits second must have its function re-run, see the first one's write, and commit on top of it.
  S.latency = fixed(10);
  let runsB = 0, seenB = null;
  const ref = { path: 'config/class' };
  const pA = S.transaction(async t => { const d = (await t.get(ref)).data(); t.set(ref, { configVersion: d.configVersion + 1, a: { x: 10 } }, { merge: true }); }, { console: 'self-test', action: 'A' }); pA.catch(() => {});
  const pB = S.transaction(async t => { runsB++; const d = (await t.get(ref)).data(); seenB = d.configVersion; await clock.sleep(30); t.set(ref, { configVersion: d.configVersion + 1, a: { z: 5 } }, { merge: true }); }, { console: 'self-test', action: 'B' }); pB.catch(() => {});
  const settle = async ps => { for (let i = 0; i < 10000; i++) { await flushMicrotasks(); const t = clock.q.shift(); if (!t) break; clock.now = Math.max(clock.now, t.at); t.run(t.fn); } return Promise.allSettled(ps); };
  const [ra, rb] = await settle([pA, pB]);
  const doc = S.docs.get('config/class');
  if (ra.status !== 'fulfilled' || rb.status !== 'fulfilled') fails.push('two racing transactions: one failed (' + [ra, rb].filter(r => r.status !== 'fulfilled').map(r => r.reason && r.reason.message).join('; ') + ') — Firestore re-runs the loser');
  if (runsB < 2) fails.push(`two racing transactions: the loser's update function ran ${runsB} time(s); Firestore re-runs it after a conflict`);
  if (seenB !== 2) fails.push(`two racing transactions: the loser's last run read configVersion ${seenB}, not the winner's 2`);
  if (doc.configVersion !== 3 || canon(doc.a) !== canon({ x: 10, y: 2, z: 5 })) fails.push('two racing transactions: the doc ended as ' + canon(doc) + ', expected both writes merged with configVersion 3');
  // 2. A transaction that always conflicts gives up after exactly 5 attempts, with code "aborted".
  let runsC = 0;
  const pC = S.transaction(async t => { runsC++; await t.get(ref); S.ver.set('config/class', S.version('config/class') + 1); t.set(ref, { b: 1 }, { merge: true }); }, { console: 'self-test', action: 'C' }); pC.catch(() => {});
  const [rc] = await settle([pC]);
  if (rc.status !== 'rejected' || runsC !== 5 || (rc.reason && rc.reason.code) !== 'aborted') fails.push(`an always-conflicting transaction: ran ${runsC} time(s) and ${rc.status === 'rejected' ? 'failed with ' + (rc.reason && rc.reason.code) : 'committed'}; Firestore tries 5 times, then fails with "aborted"`);
  // 3. A function that throws ends the transaction with that error, once, and writes nothing.
  let runsD = 0; const before = canon(S.docs.get('config/class'));
  const pD = S.transaction(async t => { runsD++; await t.get(ref); const e = new Error('stale'); e.staleConfig = true; throw e; }, { console: 'self-test', action: 'D' }); pD.catch(() => {});
  const [rd] = await settle([pD]);
  if (rd.status !== 'rejected' || !rd.reason.staleConfig || runsD !== 1 || canon(S.docs.get('config/class')) !== before) fails.push('a throwing update function: not ended at once with its own error, or something was written');
  // 4. Merge semantics, and reads handing keys back sorted.
  const m = S.merge({ a: { x: 1, y: 2 }, list: [1, 2], e: { q: 1 } }, { a: { y: DELETE, w: 3 }, list: [9], e: {}, gone: { k: DELETE }, n: { k: 1 } });
  if (canon(m) !== canon({ a: { x: 1, w: 3 }, list: [9], e: {}, n: { k: 1 } }) || 'gone' in m) fails.push('merge: nested maps must merge, arrays and empty maps replace, delete removes, a delete-only map adds nothing: got ' + canon(m));
  S.docs.set('config/class', { configVersion: 9, z: { b: 1, a: 2 } });
  const rs = S.snap('config/class');
  if (Object.keys(rs.data.z).join() !== 'a,b') fails.push('a read must hand map keys back sorted, as Firestore does');
  return fails;
}

/* ════════════════════════════════════════════════════════════════════════
   13. The run: options, every schedule, the table.
   ════════════════════════════════════════════════════════════════════════ */
const pct = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '—';
async function workerMain() {
  const o = workerData;
  SITE = compileSite(o.root, o.consoleFile);
  DATA = loadActivityData(o.root); DATA_BY_ID = {}; DATA.forEach(a => { DATA_BY_ID[a.id] = a; });
  for (const k of o.ks) { heartbeat(`schedule ${k}: starting`, true); parentPort.postMessage({ type: 'result', R: await runSchedule(k, o) }); }
  parentPort.postMessage({ type: 'end' });
}
// Schedules are independent, so they are shared out over worker threads; the table is built from the results in schedule order.
function runInWorkers(ks, o, nW) {
  return new Promise((res, rej) => {
    const out = [], parts = Array.from({ length: nW }, (_, i) => ks.filter((_, j) => j % nW === i));
    let ended = 0;
    parts.forEach(part => {
      const w = new Worker(TOOL, { workerData: { ...o, ks: part } });
      w.on('message', m => { if (m.type === 'beat') heartbeat(m.step); else if (m.type === 'result') out.push(m.R); else if (m.type === 'end' && ++ended === nW) res(out.sort((a, b) => a.k - b.k)); });
      w.on('error', rej);
      w.on('exit', c => { if (c !== 0) rej(new Error('a worker exited with code ' + c)); });
    });
  });
}
async function main() {
  if (!isMainThread) return workerMain();
  if (flag('--probe')) return probe();
  const o = {
    seed: opt('--seed', '1'), n: Number(opt('--schedules', 1000)), only: opt('--schedule', null), verbose: flag('--verbose'),
    family: opt('--family', null), fault: opt('--server-fault', null), json: opt('--json', null)
  };
  if (o.family && !FAMILIES.includes(o.family)) { console.error('two-consoles-loop: --family is one of ' + FAMILIES.join(', ')); process.exit(2); }
  const t0 = Date.now();
  heartbeat('the fake server self-test', true);
  const selfFails = await serverSelfTest(o.fault);
  if (selfFails.length) {
    console.log('two-consoles-loop: ✗ the fake server failed its self-test — it does not behave like Firestore, so no schedule was run:');
    selfFails.forEach(f => console.log('  ✗ ' + f));
    process.exit(1);
  }
  const root = resolve(opt('--root', REPO));
  SITE = compileSite(root, opt('--console', null));
  DATA = loadActivityData(root); DATA_BY_ID = {}; DATA.forEach(a => { DATA_BY_ID[a.id] = a; });
  const ks = o.only !== null ? [Number(o.only)] : Array.from({ length: o.n }, (_, i) => i);
  const nW = Math.max(1, Math.min(ks.length, Number(opt('--workers', Math.min(4, Math.max(1, availableParallelism() >> 1))))));
  let results = [];
  if (nW > 1 && !o.verbose) results = await runInWorkers(ks, { ...o, root, consoleFile: opt('--console', null) }, nW);
  else for (const k of ks) {
    heartbeat(`schedule ${k}: starting`, true);
    const R = await runSchedule(k, o);
    results.push(R);
    if (o.verbose) { console.log(`── schedule ${k} (${R.family}), seed ${o.seed}: every read, attempt, commit, refusal and alert in virtual-time order ──`); R.timeline.forEach(l => console.log(l)); console.log(''); }
  }
  // The table.
  const fam = {};
  for (const R of results) {
    const f = fam[R.family] = fam[R.family] || { schedules: 0, writes: 0, accepted: 0, refusedTold: 0, refused: 0, failed: 0, noWrite: 0, allLanded: 0, someRefusedAllTold: 0, failing: 0 };
    f.schedules++; f.writes += R.writes; f.accepted += R.accepted; f.refused += R.refused; f.refusedTold += R.refusedTold; f.failed += R.failed; f.noWrite += R.noWrite;
    // "All landed": every click either landed or was a no-op on its own screen (a pin already there …), none refused, failed or dropped.
    if (R.writes && R.accepted + (R.noWriteNoop || 0) === R.writes && !R.refused && !R.failed) f.allLanded++;
    if (R.refused && R.refused === R.refusedTold && !R.problems.some(p => /untold|told twice/.test(p.cat))) f.someRefusedAllTold++;
    if (R.problems.length) f.failing++;
  }
  const lines = [];
  const L = s => lines.push(s);
  L(`two-consoles-loop — seed ${o.seed}, ${results.length} schedule${results.length === 1 ? '' : 's'}${o.family ? ', family ' + o.family : ''}${o.fault ? ', SERVER FAULT ' + o.fault : ''}`);
  L('');
  L('family            schedules  writes  accepted  refused+told  refused  failed  no write | all landed  some refused, all told | failing');
  const row = (name, f) => L(`${name.padEnd(17)} ${String(f.schedules).padStart(9)} ${String(f.writes).padStart(7)} ${String(f.accepted).padStart(9)} ${String(f.refusedTold).padStart(13)} ${String(f.refused).padStart(8)} ${String(f.failed).padStart(7)} ${String(f.noWrite).padStart(9)} | ${(f.allLanded + ' of ' + f.schedules).padStart(10)}  ${(f.someRefusedAllTold + ' of ' + f.schedules).padStart(22)} | ${String(f.failing).padStart(7)}`);
  const tot = { schedules: 0, writes: 0, accepted: 0, refusedTold: 0, refused: 0, failed: 0, noWrite: 0, allLanded: 0, someRefusedAllTold: 0, failing: 0 };
  FAMILIES.filter(f => fam[f]).forEach(f => { row(f, fam[f]); Object.keys(tot).forEach(x => { tot[x] += fam[f][x]; }); });
  row('all', tot);
  L('');
  const solo = results.filter(R => R.consoles === 1), two = results.filter(R => R.consoles === 2), rand = results.filter(R => R.family === 'random');
  const withAlert = rs => rs.filter(R => R.staleAlerts > 0).length, withSelf = rs => rs.filter(R => R.selfInflicted > 0).length;
  L(`one console:  ${withAlert(solo)} of ${solo.length} schedules (${pct(withAlert(solo), solo.length)}) showed a false "Nothing was saved" (no other console exists; the rule file says about 7% — this tool's latency and backoff are guesses, so the two are not like for like)`);
  L(`two consoles: ${withSelf(two)} of ${two.length} schedules (${pct(withSelf(two), two.length)}) showed a "Nothing was saved" that the other console did not cause (random family alone: ${withSelf(rand)} of ${rand.length}, ${pct(withSelf(rand), rand.length)})`);
  const bm = results.flatMap(R => R.board), bg = bm.filter(b => b.gap), bn = bm.filter(b => !b.gap);
  L(`board moves (move, un-assign, delete) refused when the other console wrote in the gap: ${bg.filter(b => b.refused).length} of ${bg.length} (${pct(bg.filter(b => b.refused).length, bg.length)}); with no write from it in the gap: ${bn.filter(b => b.refused).length} of ${bn.length}`);
  const writesAll = results.reduce((n, R) => n + R.writes, 0), selfAll = results.reduce((n, R) => n + R.selfInflicted, 0), divAll = results.reduce((n, R) => n + R.diverged, 0);
  L(`writes: ${writesAll} attempted, ${tot.accepted} accepted (${divAll} of them on top of the other console's change), ${tot.refusedTold} refused and told, ${tot.refused - tot.refusedTold} refused and not told exactly once, ${tot.failed} failed, ${tot.noWrite} clicks wrote nothing; ${selfAll} refusals were self-inflicted`);
  const hits = {}; results.forEach(R => Object.keys(R.sites || {}).forEach(k => { hits[k] = (hits[k] || 0) + R.sites[k]; }));
  const covered = SITE.sites.filter(x => !OUT_OF_SCOPE_WRITERS.includes(x.fn)), hitSites = SITE.sites.filter(x => hits[String(x.line)]);
  const missed = covered.filter(x => !hits[String(x.line)]);
  L(`teacherWriteConfig call sites exercised: ${hitSites.length} of ${SITE.sites.length} (out of scope: ${SITE.sites.filter(x => OUT_OF_SCOPE_WRITERS.includes(x.fn)).map(x => x.fn).join(', ')})` + (missed.length ? `; NEVER CALLED: ${missed.map(x => x.fn + ' (line ' + x.line + ')').join(', ')}` : '') + (hits.unknown ? `; ${hits.unknown} transactions from no known call site` : ''));
  const sumR = k2 => results.reduce((n, R) => n + (R[k2] || 0), 0);
  L(`accepted writes checked against the screen they were clicked on: ${sumR('depChecked')} of ${tot.accepted} (${sumR('depLater')} of them after an own later click had landed first); clicks that wrote nothing: ${sumR('noWriteNoop')} changed nothing on their screen (pin already there, nothing blocking …), ${sumR('noWriteAlert')} said why in one of the console's two "nothing to do" alerts, ${sumR('noWriteDocChange')} of all of them would have changed the doc as it stood at the click (a stale screen); ${sumR('onOwnRefused')} accepted writes were worked out on a screen that showed this console's own earlier click, which was then refused or failed (counted, not failed: that click was told)`);
  L(`a song's kept board row shares a position with another card (the song came back from the Songs page, or a move was made while its own Songs-page click had not landed): ${results.filter(R => R.songBack).length} schedules (counted, not failed: the row is kept on purpose; Jonathan to decide)`);
  L(`commits: ${results.reduce((n, R) => n + R.commits, 0)}; board repaints: ${results.reduce((n, R) => n + R.paints.reduce((a, b) => a + b, 0), 0)}; schedules where a unit's positions had a gap at some commit (order unaffected, not a failure): ${results.filter(R => R.gaps).length}`);
  L('');
  // A covered call site that no schedule reached is a hole in the run itself (only judged on a run of 200 schedules or more).
  const nSched = results.length;
  if (missed.length && results.length >= 200 && !o.family) results.push({ k: 'run', family: '-', problems: [{ cat: 'a covered write never called', msg: missed.map(x => x.fn + ' (line ' + x.line + ')').join(', ') }] });
  const failing = results.filter(R => R.problems.length);
  const cats = {}; failing.forEach(R => R.problems.forEach(p => { cats[p.cat] = (cats[p.cat] || 0) + 1; }));
  if (failing.length) {
    L(`✗ ${failing.filter(R => R.k !== 'run').length} of ${nSched} schedules failed${failing.some(R => R.k === 'run') ? ', and the run itself failed' : ''}: ` + Object.keys(cats).sort().map(c => `${c} ×${cats[c]}`).join(', '));
    failing.slice(0, 25).forEach(R => { L(`  ✗ schedule ${R.k} (${R.family}) — ${R.problems[0].cat}: ${R.problems[0].msg}${R.problems.length > 1 ? ` (+${R.problems.length - 1} more)` : ''}`); L(`      replay: node tools/two-consoles-loop.mjs --seed ${o.seed}${o.family ? ' --family ' + o.family : ''} --schedule ${R.k} --verbose`); });
    if (failing.length > 25) L(`  … and ${failing.length - 25} more (--json for all)`);
  } else L(`✓ no corruption, no lost or false save, every refusal told exactly once, no dead view, every console matched the server after its next read — ${results.length} of ${results.length} schedules`);
  console.log(lines.join('\n'));
  if (o.json) writeFileSync(o.json, JSON.stringify({ seed: o.seed, fault: o.fault, families: fam, results: results.map(R => { const { timeline, ...rest } = R; return rest; }) }, null, 1));
  console.log(`time: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  process.exit(failing.length ? 1 : 0);
}
