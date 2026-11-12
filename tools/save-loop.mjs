/* save-loop.mjs — closed-loop test of the student's progress save (2026-11-11).

     node tools/save-loop.mjs [options]

   THE QUESTION. After a student's actions across two tabs or two devices, with dropped, stalled and slow writes,
   un-ticks and re-ticks, and a tab hidden or closed mid-save: does the stored progress/{uid} document hold what the
   student last did?

   WHEN TO RUN IT. After any change to app/save.js (queueSave, flushSave, the delete queues, loadProgress, the
   Module 4/5 move), to logPracticeRep (app/drills.js), ecSubmit or flushOnHide (app/activities-2.js), or to
   anything else that writes progress/{uid}. About 35 s for the default 180 cases. Node only: no browser, no network.

   FLAGS
     --cases=N          how many cases (default 180); each case is one scenario family (round robin) with its own seed
     --seed=S           base seed (default 1); the same seed gives the same output byte for byte
     --case=I           run only case I (with --verbose: its whole timeline, every write, the stored doc, every compare)
     --family=a,b       only these families (names: --list)
     --root=DIR         a site folder to test instead of this checkout (a scratch copy with a planted fault)
     --fake-fault=NAME  break the FAKE Firestore on purpose (names: --list); the self-test at start must go red
     --json=FILE        every case's result
     --stall=SEC        watchdog: no case finished for SEC seconds (default 120) -> prints where it was, exit 3
     --list             the families and the fake faults
   stdout is identical for the same seed and site; the run time is printed on stderr.
   Exit 0 = every case passed (KNOWN faults below excepted); 1 = a case failed, the fake failed its self-test, or a full
   default run matched nothing for a KNOWN entry; 2 = bad arguments or the tool itself crashed; 3 = watchdog.

   KNOWN. Site faults this tool found that are still open, listed at the bottom of the file (const KNOWN) with the date
   they were listed. A wrong value that matches an entry EXACTLY is printed as "~ known, listed <date>" and does not fail;
   anything else fails; a full default run (every family, 180 cases or more) in which an entry matches nothing fails, so
   a fixed fault gets its entry taken out. Listed 2026-11-12: an exit check marked done with no score after a failed
   sign-in read; a PR history replaced by a one-entry history after a failed sign-in read.

   WHAT IS REAL. The site's own scripts, unmodified, each run as its own script in a Node vm context, one context per
   browser tab: i18n.js, guitar-diagrams.js, class-activities.js, config-main.js, every module-N.js and every app part
   in index.html's load order (tools/site-src.mjs siteParts). Nothing is lifted out with a regex and nothing in them is
   replaced. The student acts through the site's own entry points: onCompleteChange, onCaStepChange,
   onClassActivityChange, onResponseChange (answers, and PR entries with onResponsePRBlur), logPracticeRep, dkSaveBest,
   bumpPracticeStreak, caPickPath, toggleSkill (the checklist), setSkillLevel (Module Review ratings), periodPick,
   ecStart + ecPick (which calls ecSubmit). Hiding or closing the tab fires the site's own visibilitychange listeners (which
   call flushOnHide) and pagehide listener (shell.js), and the browser's 'online' event its own re-save listener
   (shell.js). queueSave's debounce, flushSave's retries, withTimeout, ensureDb's on-demand SDK load,
   swap45Commit's transaction and loadProgress all run as written, on the virtual clock.
   Sign-in: the tool sets currentUser and runs loadProgress() then caAdoptLocalTicks(), the first two steps of the
   site's own onAuthStateChanged callback (app/start.js); showApp() and loadClassConfig() are not run at sign-in
   (loadClassConfig runs when a hidden tab is shown again, through the site's own listener).

   WHAT IS FAKE.
   - A virtual clock (Date, Date.now, performance.now, setTimeout/setInterval) that this tool moves; time zone
     America/Los_Angeles. Math.random in each tab is a seeded generator.
   - A stub DOM (the shape of tools/mic-sim/closed-loop.mjs's): elements that accept every call and find nothing.
     document.hidden and the visibilitychange listeners are real enough to hide, show and close a tab.
   - The Firestore SDK (`firebase.firestore`), which "loads" when the site appends its <script> (or fails, while the
     scenario blocks the CDN), and one fake Firestore server shared by every tab. Its rules, from Firestore's
     DOCUMENTED behaviour (firebase.google.com/docs/firestore/manage-data/add-data and the JS SDK reference):
       F1 set(data, {merge:true}) merges map fields key by key at every depth; fields not named are kept.
       F2 In a merge, a map value that is EMPTY is itself a field in the update mask, so it REPLACES the stored map
          with {} (the SDK's field mask names the empty map's own path).
       F3 Arrays and scalars are replaced whole, never merged element by element.
       F4 FieldValue.delete() removes the field; it is allowed only in update() (as a top-level value: nested in a map
          it is refused) and in set() with {merge:true}.
       F5 update(patch): each key is a field PATH ("games.dk"); its value replaces that field whole; the document
          must exist (else NOT_FOUND).
       F6 set() without merge replaces the whole document.
       F7 undefined is not a valid field value: set()/update() throw (invalid-argument).
       F8 The data is read when set() is called: changing the object afterwards changes nothing.
       F9 One client's writes reach the server in the order they were issued (one write stream): a fast write never
          lands before a slow one issued earlier.
       F10 runTransaction re-reads and re-runs its function when a document it read changed before the commit
           (optimistic concurrency, up to 5 attempts), and fails offline.
       F11 A write the SDK could not send stays queued in that tab's memory and is sent on reconnect; it is lost if
           the tab closes first (no enablePersistence on this site). A write already sent lands even if the tab
           then closes.
       F12 Offline, set() does not fail: it waits for the reconnect (F11); get() and transactions fail at once ("the
           client is offline").
     The network, per device, is a list of phases:
       up       40-400 ms per round trip;
       slow     2-6 s per round trip;
       stall    the connection hangs: writes wait for the end of the phase (F11); a read or a transaction fails after
                10 s, or goes through at the reconnect if that comes sooner;
       offline  the browser knows it is offline: 'offline' / 'online' events fire on that device's open tabs at the
                phase's ends; writes wait (F12); reads, transactions and the Firestore SDK's <script> fail at once;
       refused  the server REFUSES the write or read after 200-800 ms (permission-denied, quota): nothing is applied.
                This is the only phase in which set() rejects.
     A self-test of these rules runs before the cases; --fake-fault breaks one rule and the self-test must fail.
   - A scripted student (made-up uid and name), generated per case from the seed: ticks and un-ticks lesson steps,
     activity steps and activities, answers questions, logs reps (with a best), saves a deck best, bumps the
     streak, picks a path, takes an exit check; tabs open, hide and show at chosen moments; a second tab on the same
     device (shared localStorage and network) or a second device (its own).
     It acts only once the app is on screen (the sign-in read has settled) and only where the screen offers an action:
     the tool keeps its own model of each tab's view (what it loaded, then its own actions) and skips an action that
     would change nothing there (un-ticking what is not ticked, re-picking the path already picked, a deck score under
     the best, the same answer again, a one-try exit check that view already holds a result for).
     A tab ends in one of three ways: CLOSE (visibilitychange, then pagehide), LID (the lid shuts: visibilitychange
     only, and the tab never runs again) or DIE (the battery dies: no event at all). Each kills the tab after its
     pending microtasks run: its timers never fire, its queued writes are lost (F11), writes already sent still land
     — except that in half the CLOSE scenarios a write started while the page unloads never leaves the browser
     (app/start.js: pagehide's flush "is a Firestore write started during unload and is not reliably delivered"; K3).
     A phase can be marked offline: the browser's 'offline' and 'online' events fire on that device's open tabs.

   NOT MODELLED. One clock is shared by every tab and device (no clock skew, the same day boundary everywhere); onSnapshot (the site does not listen to progress/{uid}); offline persistence (enablePersistence);
   the security rules (tools/pm-rules-test.mjs covers rules); the local cache's latency compensation on get(); a
   tab still running a build from before the Module 4/5 move; songReady (tabs/journey.js has its own check, checks.mjs
   1bw); Module Review beyond its ratings (reflection, performance, the mrN-complete key); place (lastModule/lastSet):
   compared as untouched only when no checklist tick or rating happened, because a tick also saves the place the
   student is on and this tool does not navigate between sets; showApp() and rendering;
   rAF callbacks (never run). Every call into site code carries a 10 s vm timeout, so an endless loop there is a fault
   (R12), not a hang; the watchdog covers a run that stops making progress anywhere else.

   THE EXPECTED ANSWER is computed by this file alone (the "oracle" section), from a ledger of every student action
   with its virtual time and the rules below. It never calls a function of the code under test. Besides the ledger it
   reads only facts of the fake world: the network schedule, when each tab's SDK loaded, what each tab's sign-in read
   returned (or that it failed), when each tab's writes were on the wire (R10's 'online' rule), and the writes that
   landed (only to classify a mismatch as K1, below).
     R1 A tick/un-tick of a step, an activity step or an activity is the student's last word on that key: true when
        ticked, gone when un-ticked (save.js:721-726: "un-marked ... cleared only after that write lands").
     R2 An answer replaces the stored answer for that key.
     R3 A logged rep: reps +1; todayCount +1, reset when lastDay is not today; lastDay = today; last = the time;
        best = the larger of the old best and the new one (drills.js header, "Practice log").
     R4 A deck best keeps the larger number, and games.dk.at is the day of the last improvement.
     R5 The streak: +1 when the last day was yesterday, unchanged when it is today, else 1 (save.js bumpPracticeStreak
        comment: "the same day-string / yesterday-comparison pattern").
     R6 A path pick leaves exactly one `<id>:path:<key>` tick, the one picked (activities.js, "The pick is saved with
        the step ticks").
     R7 An exit check files {score, total, picks, at, attempts}: score = picks equal to the item answers (the fret for
        nextNote), attempts = the previous attempts + 1, at = today; and marks the activity done. The two go together:
        "hold both or neither" (activities-2.js:276-287).
     R8 After a FAILED load, streak, games, practiceLog and exitChecks (and an exit check's done mark, R7) are held back
        for the session (save.js:562-577); they may be missing, never a zero-based value written over the real one.
     R9 A Module 4/5 doc with no migrations.swap45 is moved once: ids m4w*<->m5w* (also with a practice- prefix),
        mr4<->mr5, chords-m4<->chords-m5 in skills, responses, completed, practiceLog and games.coachSkill /
        drillSkill / dk; lastModule 4<->5; lastSet; songReady layers 4<->5; nothing else. The stored doc must end
        marked, holding the moved data plus the session's work, and no key in the old numbering (save.js:11-58).
     R10 When a save is OWED. The site sends pending work after a 800 ms pause, on the next action, or when the tab is
         hidden (save.js queueSave, activities-2.js flushOnHide: "sends now what the debounce would have sent"). So an
         action is owed when, at or after it, its tab reaches a CLEAN POINT: an action or a hide with the network up
         from 2 s before to 6 s after it and the tab open all that time and the CDN not blocked; or a close with the
         network up from 2 s before to 1.5 s after, the SDK loaded, and a doc that was already marked (R9) when the tab
         loaded (a DIE is never a clean point); or an 'online' event with the network up for the 6 s after it, the tab
         open, and none of its writes or transactions on the wire at that moment (shell.js: "Back online ... Re-arm
         the ordinary debounced save"). Every scenario ends with a SETTLE: the network up everywhere, then every open
         tab hidden, a clean point for every tab still open. An owed action must be in the stored doc; an action that is not owed may or
         may not be (every subset is accepted), but nothing else may.
     R11 Known exposures, counted and not failed:
         K1 "a key both tabs hold" (save.js:608-616): a tab sends a whole category, so its older copy of a key another
            tab changed can overwrite the newer value. Counted only when a write from tab X, carrying exactly the stored
            value, landed after the last owed change to that key by a DIFFERENT tab Y, a write from Y carrying Y's new
            value landed before X's, and the value is one the oracle's own model of tab X held (what X loaded, then X's
            own actions).
         K2 two devices can save different path picks (WORKFLOW.md, 2026-11-09 product calls: "rare, nothing lost").
         K3 a write started while the page unloads was not delivered (the CLOSE scenarios that say so): the value is
            what the doc would hold had that close not been a clean point.
     R12 Nothing the site runs may throw or leave a rejected promise unhandled (the global "Something went wrong"
         banner; save.js:644-650). A rejection nobody handles while a case runs is filed against that case.
     R13 name and email are the signed-in user's; fields this tool does not model are left as they were.
     R14 A checklist cell or a Module Review rating sets the value that tab shows next: "I've got it" on a skill not got
         gives 'gotit' (and counts the day for the streak, R5), on one got gives 'working'; "working on it" cycles
         gotit -> working, working -> none, else working; a rating gives that level, or 'none' when it was that level.
     R15 The period picked replaces the stored one.
     R16 A PR entry appends {value, date} to that key's history (an old bare value becomes its first entry with no
         date) and keeps the last 8 (save.js:487-490: "a short history instead of a single overwritten value").

   Reading a FAIL line: case index, family, the stored value, the values the oracle accepts, and the replay command. */
import vm from 'node:vm';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteParts } from './site-src.mjs';

process.env.TZ = 'America/Los_Angeles';
const HERE = dirname(fileURLToPath(import.meta.url));

/* ─────────────────────────── arguments ─────────────────────────── */
const ARGV = process.argv.slice(2);
const opt = (k, d) => { const a = ARGV.find(x => x === '--' + k || x.startsWith('--' + k + '=')); if (!a) return d; return a.includes('=') ? a.slice(a.indexOf('=') + 1) : true; };
/* Bad arguments exit 2 before anything runs. */
const argFail = msg => { console.error('save-loop: ' + msg + ' (see the header of tools/save-loop.mjs)'); process.exit(2); };
{
  const VALUED = ['cases', 'seed', 'case', 'family', 'root', 'fake-fault', 'json', 'stall'], BARE = ['verbose', 'list'];
  for (const a of ARGV){
    const m = /^--([a-z-]+)(=(.*))?$/.exec(a);
    if (!m) argFail('not an option: ' + JSON.stringify(a));
    if (BARE.includes(m[1])){ if (m[2]) argFail('--' + m[1] + ' takes no value'); continue; }
    if (!VALUED.includes(m[1])) argFail('unknown option --' + m[1]);
    if (!m[2] || m[3] === '') argFail('--' + m[1] + ' needs a value (--' + m[1] + '=…)');
  }
  const int = (k, min) => { const v = opt(k, null); if (v == null) return; if (!/^\d+$/.test(v) || Number(v) < min) argFail(`--${k} must be a whole number of at least ${min}, not ${JSON.stringify(v)}`); };
  int('cases', 1); int('seed', 0); int('case', 0);
  const st = opt('stall', null);
  if (st != null && !(/^\d+(\.\d+)?$/.test(st) && Number(st) > 0)) argFail('--stall must be a number of seconds above 0, not ' + JSON.stringify(st));
  if (opt('case', null) != null && Number(opt('case')) >= Number(opt('cases', 180))) argFail(`--case=${opt('case')} is not below --cases=${opt('cases', 180)}`);
  if (opt('root', null) != null && !existsSync(resolve(opt('root')))) argFail('--root: no such folder ' + JSON.stringify(opt('root')));
}
const ROOT = resolve(opt('root', join(HERE, '..')));
const VERBOSE = !!opt('verbose', false);
const FAKE_FAULT = opt('fake-fault', '') || '';
const BASE_SEED = Number(opt('seed', 1));
const STALL_S = Number(opt('stall', 120));
/* The world of the case running now: a rejected promise nobody handles, raised while it runs, is that case's fault (R12). */
let CURRENT_WORLD = null;

/* ─────────────────────────── seeded random ─────────────────────────── */
function rng(seed){
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const mix = (a, b) => (Math.imul(a ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul(b + 0x7F4A7C15, 0xC2B2AE35)) >>> 0;

/* ─────────────────────────── the fake Firestore ─────────────────────────── */
const T0 = Date.UTC(2026, 10, 11, 16, 0, 0);
class FieldDelete { toString(){ return '<FieldValue.delete>'; } }
const DELETE = new FieldDelete();
const isMap = v => !!v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof FieldDelete);
const FAKE_FAULTS = {
  'shallow-merge': 'set(merge) replaces a whole map field instead of merging into it (breaks F1)',
  'empty-map-merges': 'an empty map in set(merge) leaves the stored map alone (breaks F2)',
  'delete-ignored': 'FieldValue.delete() in set(merge) leaves the field (breaks F4)',
  'update-merges': 'update() merges a map value into the stored one instead of replacing it (breaks F5)',
  'late-copy': 'set() reads its data when the write lands, not when it is called (breaks F8)',
  'no-fifo': 'a client\'s writes land in latency order, not issue order (breaks F9)',
  'no-tx-retry': 'a transaction commits over a document that changed after it read it (breaks F10)',
  'stall-survives-close': 'a write still queued in a closed tab lands anyway (breaks F11)',
  'update-nested-delete': 'update() accepts a FieldValue.delete() nested inside a map value (breaks F4)',
  'offline-rejects-writes': 'an offline set() is rejected instead of waiting for the reconnect (breaks F11)'
};
function clone(v){
  if (v instanceof FieldDelete) return v;
  if (Array.isArray(v)) return v.map(clone);
  if (v && typeof v === 'object'){ const o = {}; for (const k of Object.keys(v)) o[k] = clone(v[k]); return o; }
  return v;
}
function validate(v, path, allowDelete){
  if (v === undefined) throw Object.assign(new Error(`Function setDoc() called with invalid data. Unsupported field value: undefined (found in field ${path})`), { code: 'invalid-argument' });
  if (typeof v === 'function') throw Object.assign(new Error(`Unsupported field value: a function (found in field ${path})`), { code: 'invalid-argument' });
  if (v instanceof FieldDelete){ if (!allowDelete) throw Object.assign(new Error(`FieldValue.delete() cannot be used with set() unless you pass {merge:true} (field ${path})`), { code: 'invalid-argument' }); return; }
  if (Array.isArray(v)) v.forEach((x, i) => { if (x instanceof FieldDelete) throw Object.assign(new Error('FieldValue.delete() inside an array'), { code: 'invalid-argument' }); validate(x, path + '.' + i, false); });
  else if (v && typeof v === 'object') for (const k of Object.keys(v)) validate(v[k], path ? path + '.' + k : k, allowDelete);
}
/* update(): a delete may only be a top-level value (a field path); nested in a map it is refused. */
function validateUpdate(data){
  for (const k of Object.keys(data)){
    const v = data[k];
    if (v instanceof FieldDelete) continue;
    if (FAKE_FAULT === 'update-nested-delete') validate(v, k, true);
    else {
      validate(v, k, true);
      const nested = x => isMap(x) && Object.values(x).some(y => y instanceof FieldDelete || nested(y));
      if (nested(v)) throw Object.assign(new Error(`Function updateDoc() called with invalid data. FieldValue.delete() can only appear at the top level of your update data (found in field ${k})`), { code: 'invalid-argument' });
    }
  }
}
/* Does a merge map name any field that is not a delete? (a map holding only deletes creates nothing.) */
const hasSetLeaf = v => isMap(v) ? (Object.keys(v).length === 0 || Object.values(v).some(hasSetLeaf)) : !(v instanceof FieldDelete);
function mergeInto(target, data){
  for (const k of Object.keys(data)){
    const v = data[k];
    if (v instanceof FieldDelete){ if (FAKE_FAULT !== 'delete-ignored') delete target[k]; continue; }
    if (isMap(v)){
      if (!Object.keys(v).length){ if (FAKE_FAULT !== 'empty-map-merges') target[k] = {}; continue; }
      if (FAKE_FAULT === 'shallow-merge'){ const o = {}; for (const kk of Object.keys(v)) if (!(v[kk] instanceof FieldDelete)) o[kk] = clone(v[kk]); target[k] = o; continue; }
      if (!isMap(target[k])){ if (!hasSetLeaf(v)) continue; target[k] = {}; }
      mergeInto(target[k], v);
      continue;
    }
    target[k] = clone(v);
  }
}
function applyUpdate(doc, patch){
  for (const p of Object.keys(patch)){
    const parts = p.split('.'), v = patch[p];
    let o = doc;
    for (let i = 0; i < parts.length - 1; i++){ if (!isMap(o[parts[i]])) o[parts[i]] = {}; o = o[parts[i]]; }
    const last = parts[parts.length - 1];
    if (v instanceof FieldDelete) delete o[last];
    else if (FAKE_FAULT === 'update-merges' && isMap(v) && isMap(o[last])) mergeInto(o[last], v);
    else o[last] = clone(v);
  }
}

class World {
  constructor(seed){
    this.now = T0; this.seq = 0; this.events = [];
    this.docs = new Map();
    this.r = rng(seed);
    this.landed = []; this.issued = 0; this.rejected = 0; this.lostOnClose = 0; this.lostUnload = 0; this.txCommits = 0; this.txRetries = 0;
    this.gets = []; this.trace = [];
  }
  log(s){ if (VERBOSE) this.trace.push(`${((this.now - T0) / 1000).toFixed(3).padStart(9)}s  ${s}`); }
  at(t, fn, owner, kind){ const e = { at: Math.max(t, this.now), id: ++this.seq, fn, owner, kind }; this.events.push(e); return e.id; }
  cancel(id){ const i = this.events.findIndex(e => e.id === id); if (i >= 0) this.events.splice(i, 1); }
  killTimers(owner){ this.events = this.events.filter(e => !(e.owner === owner && e.kind === 'timer')); }
  async drain(){ for (let i = 0; i < 3; i++) await new Promise(r => setImmediate(r)); }
  async runUntil(T, beat){
    let guard = 0;
    for (;;){
      await this.drain();
      let best = null;
      for (const e of this.events) if (e.at <= T && (!best || e.at < best.at || (e.at === best.at && e.id < best.id))) best = e;
      if (!best) break;
      this.events.splice(this.events.indexOf(best), 1);
      this.now = best.at;
      best.fn();
      if (++guard > 200000) throw new Error('save-loop: more than 200000 events before t=' + (T - T0) + ' ms: something reschedules itself forever');
      if (beat && (guard & 255) === 0) beat();
    }
    this.now = Math.max(this.now, T);
    await this.drain();
  }
  doc(path){ const d = this.docs.get(path); return d ? d : null; }
  snap(path){ const d = this.docs.get(path); return { exists: !!d, data: () => (d ? clone(d.data) : undefined), id: path.split('/').pop() }; }
  applyOp(path, op){
    let d = this.docs.get(path);
    if (op.kind === 'update'){
      if (!d) throw Object.assign(new Error('No document to update: ' + path), { code: 'not-found' });
      applyUpdate(d.data, op.data);
    } else if (op.merge){
      if (!d){ d = { data: {}, version: 0 }; this.docs.set(path, d); }
      mergeInto(d.data, op.data);
    } else {
      if (!d){ d = { data: {}, version: 0 }; this.docs.set(path, d); }
      d.data = {}; mergeInto(d.data, op.data);
    }
    d.version++;
  }
  /* A WRITE's round trip on a device's network, starting now. Returns { ok, at }: ok:null = queued in the SDK until the
     phase ends (stall, offline: F11), ok:false = refused by the server. */
  trip(dev){
    const ph = dev.phaseAt(this.now);
    const lat = (lo, hi) => Math.round(lo + (hi - lo) * this.r());
    if (ph.phase === 'up') return { ok: true, at: this.now + lat(40, 400) };
    if (ph.phase === 'slow') return { ok: true, at: this.now + (ph.lat || lat(2000, 6000)) };
    if (ph.phase === 'refused') return { ok: false, at: this.now + lat(200, 800) };
    if (ph.phase === 'offline' && FAKE_FAULT === 'offline-rejects-writes') return { ok: false, at: this.now + lat(200, 800) };
    return { ok: null, at: ph.until + lat(40, 400) };
  }
  /* A READ or a transaction round trip: offline fails it at once ("the client is offline"); a stall fails it after 10 s,
     or it goes through at the reconnect if that is sooner; refused fails it. */
  readTrip(dev){
    const ph = dev.phaseAt(this.now);
    if (ph.phase === 'offline') return { ok: false, at: this.now + Math.round(200 + 600 * this.r()) };
    const tr = this.trip(dev);
    if (tr.ok !== null) return tr;
    return tr.at - this.now > 10000 ? { ok: false, at: this.now + 10000 } : { ok: true, at: tr.at };
  }
}

/* A tab's Firestore client: its own write stream (F9) on its device's network. */
function makeClient(world, tab){
  const dev = tab.device;
  const issue = (path, op) => {
    if (op.kind === 'update') validateUpdate(op.data); else validate(op.data, '', op.merge);
    const sent = FAKE_FAULT === 'late-copy' ? op.data : clone(op.data);
    world.issued++;
    const tr = world.trip(dev);
    const rec = { from: world.now, to: Infinity };
    tab.net.push(rec);
    /* A write started while the page unloads (pagehide) is not reliably delivered (app/start.js's own comment): in a
       scenario that says so, it never leaves the browser. */
    if (tab.unloading && tab.dropUnload){
      world.lostUnload++;
      world.log(`${tab.name} write #${world.issued} started during unload: NOT DELIVERED: ${summarize(op.data)}`);
      return new Promise(() => {});
    }
    world.log(`${tab.name} write #${world.issued} issued (${tr.ok === false ? 'will be REFUSED' : tr.ok === null ? 'QUEUED until reconnect' : 'lands ~' + ((tr.at - world.now) / 1000).toFixed(2) + ' s'}): ${summarize(op.data)}`);
    return new Promise((res, rej) => {
      if (tr.ok === false){ world.at(tr.at, () => { rec.to = world.now; world.rejected++; world.log(`${tab.name} write REFUSED by the server`); rej(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' })); }, tab, 'net'); return; }
      const behindStall = tr.ok === null || tab.stallQueued > 0;
      let at = tr.at;
      if (FAKE_FAULT !== 'no-fifo') at = Math.max(at, tab.lastLandAt);
      tab.lastLandAt = Math.max(tab.lastLandAt, at);
      if (behindStall) tab.stallQueued++;
      world.at(at, () => {
        rec.to = world.now;
        if (behindStall) tab.stallQueued--;
        if (behindStall && !tab.alive && FAKE_FAULT !== 'stall-survives-close'){ world.lostOnClose++; world.log(`${tab.name} queued write LOST (tab closed before reconnect)`); return; }
        try { world.applyOp(path, op.kind === 'update' ? { kind: 'update', data: sent } : { kind: 'set', merge: op.merge, data: sent }); }
        catch (e){ rej(e); return; }
        world.landed.push({ tab: tab.name, at: world.now, path, kind: op.kind, data: clone(sent) });
        world.log(`${tab.name} write LANDED: ${summarize(sent)}`);
        res();
      }, tab, 'net');
    });
  };
  const read = path => new Promise((res, rej) => {
    const tr = world.readTrip(dev);
    const settle = () => {
      if (tr.ok === true){ const s = world.snap(path); world.gets.push({ tab: tab.name, at: world.now, path, ok: true, data: s.exists ? s.data() : null }); world.log(`${tab.name} read ${path}: ${s.exists ? 'ok' : 'no doc'}`); res(s); }
      else { world.gets.push({ tab: tab.name, at: world.now, path, ok: false }); world.log(`${tab.name} read ${path}: FAILED`); rej(Object.assign(new Error('Failed to get document because the client is offline.'), { code: 'unavailable' })); }
    };
    world.at(tr.at, settle, tab, 'net');
  });
  const ref = path => ({
    path, id: path.split('/').pop(),
    get: () => read(path),
    set: (data, o) => issue(path, { kind: 'set', merge: !!(o && o.merge), data }),
    update: data => issue(path, { kind: 'update', data })
  });
  const db = {
    collection: c => ({ doc: id => ref(c + '/' + id) }),
    runTransaction: fn => { const rec = { from: world.now, to: Infinity }; tab.net.push(rec); return (async () => {
      for (let attempt = 0; attempt < 5; attempt++){
        const reads = new Map(), writes = [];
        const tx = {
          get: r => new Promise((res, rej) => {
            const tr = world.readTrip(dev);
            world.at(tr.at, () => {
              if (tr.ok !== true){ rej(Object.assign(new Error('Transaction failed: the client is offline'), { code: 'unavailable' })); return; }
              const d = world.doc(r.path); reads.set(r.path, d ? d.version : 0);
              res(world.snap(r.path));
            }, tab, 'net');
          }),
          set(r, data, o){ validate(data, '', !!(o && o.merge)); writes.push([r.path, { kind: 'set', merge: !!(o && o.merge), data: clone(data) }]); return tx; },
          update(r, data){ validateUpdate(data); writes.push([r.path, { kind: 'update', data: clone(data) }]); return tx; }
        };
        const out = await fn(tx);
        const tr = world.readTrip(dev);
        const committed = await new Promise((res, rej) => world.at(tr.at, () => {
          if (tr.ok !== true){ rej(Object.assign(new Error('Transaction commit failed: unavailable'), { code: 'unavailable' })); return; }
          const stale = FAKE_FAULT !== 'no-tx-retry' && [...reads].some(([p, v]) => { const d = world.doc(p); return (d ? d.version : 0) !== v; });
          if (stale){ world.txRetries++; world.log(`${tab.name} transaction: a document changed since it was read, re-running`); res(false); return; }
          try { for (const [p, op] of writes) world.applyOp(p, op); } catch (e){ rej(e); return; }
          for (const [p, op] of writes) world.landed.push({ tab: tab.name, at: world.now, path: p, kind: op.kind, data: clone(op.data), tx: true });
          if (writes.length){ world.txCommits++; world.log(`${tab.name} transaction COMMITTED: ${writes.map(w => summarize(w[1].data)).join(' ; ')}`); }
          res(true);
        }, tab, 'net'));
        if (committed) return out;
      }
      throw Object.assign(new Error('Transaction failed after 5 attempts'), { code: 'aborted' });
    })().finally(() => { rec.to = world.now; }); }
  };
  return db;
}
function summarize(d){
  const parts = [];
  const walk = (v, p, depth) => {
    if (v instanceof FieldDelete){ parts.push(p + '=DELETE'); return; }
    if (isMap(v) && depth < 2 && Object.keys(v).length){ for (const k of Object.keys(v)) walk(v[k], p ? p + '.' + k : k, depth + 1); return; }
    if (isMap(v) && !Object.keys(v).length){ parts.push(p + '={}'); return; }
    const s = JSON.stringify(v); parts.push(p + '=' + (s && s.length > 60 ? s.slice(0, 57) + '...' : s));
  };
  walk(d, '', 0);
  return parts.filter(x => !/^(name|email)=/.test(x)).join(' ') || '(name/email only)';
}

/* ─────────────────────────── the fake's self-test (F1-F11) ─────────────────────────── */
async function fakeSelfTest(){
  const out = [];
  const dev = { phases: [], phaseAt(t){ for (const p of this.phases) if (t < p.until) return p; return { phase: 'up', until: Infinity }; } };
  const mk = () => { const w = new World(7); const tab = { name: 'T', device: dev, alive: true, lastLandAt: 0, stallQueued: 0, net: [] }; return { w, tab, db: makeClient(w, tab) }; };
  const check = (name, ok, detail) => out.push({ name, ok: !!ok, detail });
  const P = 'progress/u';
  {
    const { w, db } = mk();
    w.docs.set(P, { data: { a: { x: 1, y: { z: 2, q: 3 } }, arr: [1, 2, 3], keep: 'k', m: { k1: 1 } }, version: 1 });
    db.collection('progress').doc('u').set({ a: { y: { z: 9 } }, arr: [7], m: {} }, { merge: true });
    await w.runUntil(w.now + 1000);
    const d = w.docs.get(P).data;
    check('F1 merge keeps fields it does not name, at every depth', d.a.x === 1 && d.a.y.q === 3 && d.a.y.z === 9 && d.keep === 'k', JSON.stringify(d));
    check('F2 an empty map in a merge replaces the stored map', JSON.stringify(d.m) === '{}', JSON.stringify(d.m));
    check('F3 arrays are replaced whole', JSON.stringify(d.arr) === '[7]', JSON.stringify(d.arr));
  }
  {
    const { w, db } = mk();
    w.docs.set(P, { data: { c: { k1: true, k2: true } }, version: 1 });
    db.collection('progress').doc('u').set({ c: { k1: DELETE }, n: { only: DELETE } }, { merge: true });
    let threw = false; try { db.collection('progress').doc('u').set({ c: { k2: DELETE } }); } catch { threw = true; }
    await w.runUntil(w.now + 1000);
    const d = w.docs.get(P).data;
    check('F4 FieldValue.delete() removes the field in a merge, creates nothing, and is refused without merge', !('k1' in d.c) && d.c.k2 === true && !('n' in d) && threw, JSON.stringify(d));
  }
  {
    const { w, db } = mk();
    w.docs.set(P, { data: { games: { dk: { a: 1, b: 2 }, sd: 1 } }, version: 1 });
    db.collection('progress').doc('u').update({ 'games.dk': { c: 3 } });
    let rejected = false; db.collection('progress').doc('missing').update({ x: 1 }).catch(() => { rejected = true; });
    await w.runUntil(w.now + 1000);
    const d = w.docs.get(P).data;
    check('F5 update() replaces the field at a path whole, leaves its siblings, refuses a missing doc', JSON.stringify(d.games.dk) === '{"c":3}' && d.games.sd === 1 && rejected, JSON.stringify(d));
  }
  {
    const { w, db } = mk();
    w.docs.set(P, { data: { a: 1, b: 2 }, version: 1 });
    db.collection('progress').doc('u').set({ c: 3 });
    await w.runUntil(w.now + 1000);
    check('F6 set() without merge replaces the document', JSON.stringify(w.docs.get(P).data) === '{"c":3}', JSON.stringify(w.docs.get(P).data));
  }
  {
    const { db } = mk();
    let threw = false; try { db.collection('progress').doc('u').set({ a: { b: undefined } }, { merge: true }); } catch { threw = true; }
    check('F7 undefined is refused', threw);
  }
  {
    const { w, db } = mk();
    const data = { r: { k: 'first' } };
    db.collection('progress').doc('u').set(data, { merge: true });
    data.r.k = 'changed later';
    await w.runUntil(w.now + 1000);
    check('F8 set() reads its data when called', w.docs.get(P).data.r.k === 'first', JSON.stringify(w.docs.get(P).data));
  }
  {
    const { w, db } = mk();
    dev.phases = [{ phase: 'slow', until: T0 + 100, lat: 3000 }];
    db.collection('progress').doc('u').set({ v: 'slow first' }, { merge: true });
    w.now = T0 + 200;
    db.collection('progress').doc('u').set({ v: 'fast second' }, { merge: true });
    await w.runUntil(w.now + 10000);
    dev.phases = [];
    check('F9 one client\'s writes land in the order issued', w.docs.get(P).data.v === 'fast second', JSON.stringify(w.docs.get(P).data));
  }
  {
    const { w, db, tab } = mk();
    const tab2 = { name: 'T2', device: dev, alive: true, lastLandAt: 0, stallQueued: 0, net: [] };
    const db2 = makeClient(w, tab2);
    w.docs.set(P, { data: { n: 0, list: {} }, version: 1 });
    const ref = db.collection('progress').doc('u'), ref2 = db2.collection('progress').doc('u');
    let runs = 0;
    const bump = (d, tag) => d.runTransaction(async tx => { runs++; const s = await tx.get(ref); const v = s.data(); tx.update(ref, { n: v.n + 1, list: Object.assign({}, v.list, { [tag]: true }) }); });
    const p1 = bump(db, 'a'), p2 = bump(db2, 'b');
    let failed = null;
    await w.runUntil(w.now + 10000);
    await Promise.all([p1, p2]).catch(e => { failed = e; });
    const d = w.docs.get(P).data;
    check('F10 a transaction re-runs when its document changed before the commit', d.n === 2 && d.list.a && d.list.b && runs >= 3 && !failed, JSON.stringify(d) + ' runs=' + runs);
    void tab; void ref2;
  }
  {
    const { w, db, tab } = mk();
    dev.phases = [{ phase: 'stall', until: T0 + 5000 }];
    db.collection('progress').doc('u').set({ lost: true }, { merge: true });
    w.now = T0 + 1000; tab.alive = false; w.killTimers(tab);
    await w.runUntil(T0 + 8000);
    const lost = !w.docs.get(P);
    const s2 = mk();
    s2.db.collection('progress').doc('u').set({ kept: true }, { merge: true });
    await s2.w.runUntil(T0 + 8000);
    dev.phases = [];
    check('F11 a write queued behind a stall is lost when the tab closes, and lands on reconnect when it stays open', lost && s2.w.docs.get(P) && s2.w.docs.get(P).data.kept === true);
  }
  {
    const { db } = mk();
    let threw = false; try { db.collection('progress').doc('u').update({ games: { dk: DELETE } }); } catch { threw = true; }
    check('F4b update() refuses a FieldValue.delete() nested inside a map value', threw);
  }
  {
    const { w, db } = mk();
    dev.phases = [{ phase: 'offline', until: T0 + 4000 }];
    let refused = false, readFailed = false;
    db.collection('progress').doc('u').set({ queued: true }, { merge: true }).catch(() => { refused = true; });
    db.collection('progress').doc('u').get().catch(() => { readFailed = true; });
    await w.runUntil(T0 + 3000);
    const before = !!w.docs.get(P);
    await w.runUntil(T0 + 8000);
    dev.phases = [];
    check('F12 offline: a set() waits for the reconnect and then lands; a read fails at once', !before && !refused && readFailed && w.docs.get(P) && w.docs.get(P).data.queued === true);
  }
  return out;
}

/* ─────────────────────────── a browser tab running the real site ─────────────────────────── */
const SCRIPT_CACHE = new Map();
function siteScripts(root){
  if (SCRIPT_CACHE.has(root)) return SCRIPT_CACHE.get(root);
  const mods = readdirSync(root).filter(f => /^module-\d+\.js$/.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const files = ['i18n.js', 'guitar-diagrams.js', 'class-activities.js', 'config-main.js', ...mods, ...siteParts('app.js', root)];
  const list = files.map(f => ({ f, s: new vm.Script(readFileSync(join(root, f), 'utf8'), { filename: f }) }));
  SCRIPT_CACHE.set(root, list);
  return list;
}
const USER = { uid: 'uid-test-a1', displayName: 'Test Student A', email: 'student.a@example.test', photoURL: null };

function makeTab(world, name, device, opts){
  const tab = { name, device, alive: true, hidden: false, docL: {}, winL: {}, lastLandAt: 0, stallQueued: 0, faults: [], net: [], onlines: [],
    sdkBlockedUntil: opts.sdkBlockedUntil || 0, sdkMs: opts.sdkMs || 150, sdkLoadedAt: null, sdkAttempts: 0 };
  const els = {};
  const mkEl = id => {
    const e = {
      id, style: { setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; } }, dataset: {}, children: [], _h: '',
      classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
      get innerHTML(){ return this._h; }, set innerHTML(v){ this._h = v; },
      textContent: '', value: '', hidden: false, checked: false, isConnected: true, src: '',
      addEventListener(){}, removeEventListener(){}, appendChild(c){ return c; }, removeChild(){}, remove(){}, append(){}, prepend(){},
      setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){}, hasAttribute(){ return false; }, toggleAttribute(){},
      querySelector(){ return null; }, querySelectorAll(){ return []; }, closest(){ return null; }, matches(){ return false; },
      focus(){}, blur(){}, click(){}, scrollIntoView(){}, scrollTo(){}, insertAdjacentHTML(){}, insertAdjacentElement(){},
      cloneNode(){ return mkEl(''); }, contains(){ return false; },
      getBoundingClientRect(){ return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; }
    };
    return e;
  };
  const head = mkEl('head');
  /* The Firestore SDK is a <script> the site appends (boot.js loadFirestoreSdk): it loads after sdkMs, or errors while the CDN is blocked. */
  head.appendChild = s => {
    if (s && /firestore/.test(s.src || '')){
      tab.sdkAttempts++;
      if (world.now < tab.sdkBlockedUntil || device.phaseAt(world.now).phase === 'offline') world.at(world.now + 400, () => { world.log(`${name} Firestore SDK blocked (onerror)`); callSite(tab, () => s.onerror && s.onerror()); }, tab, 'timer');
      else world.at(world.now + tab.sdkMs, () => {
        if (!ctx.firebase.firestore){ ctx.firebase.firestore = firestoreFn; }
        if (tab.sdkLoadedAt == null) tab.sdkLoadedAt = world.now;
        world.log(`${name} Firestore SDK loaded`);
        callSite(tab, () => s.onload && s.onload());
      }, tab, 'timer');
    }
    return s;
  };
  const storage = () => ({ _d: {}, getItem(k){ return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; }, setItem(k, v){ this._d[k] = String(v); }, removeItem(k){ delete this._d[k]; }, clear(){ this._d = {}; }, key(i){ return Object.keys(this._d)[i] ?? null; }, get length(){ return Object.keys(this._d).length; } });
  const db = makeClient(world, tab);
  const firestoreFn = () => db;
  firestoreFn.FieldValue = { delete: () => DELETE };
  const auth = { currentUser: null, onAuthStateChanged(cb){ tab.authCb = cb; return () => {}; }, signOut(){ return Promise.resolve(); } };
  const intervals = new Map();
  const ctx = {
    console: { log(){}, info(){}, debug(){}, warn: (...a) => { world.log(`${name} console.warn: ${a.map(x => x && x.message ? x.message : String(x)).join(' ').slice(0, 160)}`); }, error: (...a) => { world.log(`${name} console.error: ${a.map(String).join(' ').slice(0, 160)}`); } },
    document: {
      documentElement: mkEl('html'), head, body: mkEl('body'), readyState: 'complete',
      getElementById(id){ return els[id] || (els[id] = mkEl(id)); },
      querySelector(){ return null; }, querySelectorAll(){ return []; }, createElement(){ return mkEl(''); }, createDocumentFragment(){ return mkEl(''); }, createTextNode(){ return mkEl(''); },
      addEventListener(type, fn){ (tab.docL[type] = tab.docL[type] || []).push(fn); }, removeEventListener(type, fn){ tab.docL[type] = (tab.docL[type] || []).filter(f => f !== fn); },
      fonts: { ready: Promise.resolve() },
      get hidden(){ return tab.hidden; }, get visibilityState(){ return tab.hidden ? 'hidden' : 'visible'; }
    },
    localStorage: device.localStorage, sessionStorage: storage(),
    location: { hostname: 'class.example.test', protocol: 'https:', href: 'https://class.example.test/', pathname: '/', search: '', hash: '', reload(){ tab.reloaded = true; } },
    history: { scrollRestoration: 'auto', replaceState(){}, pushState(){}, length: 1 },
    navigator: { userAgent: 'save-loop', language: 'en', get onLine(){ return !device.offlineNow; } },
    setTimeout: (fn, ms, ...args) => world.at(world.now + Math.max(0, Number(ms) || 0), () => callSite(tab, () => fn(...args)), tab, 'timer'),
    clearTimeout: id => { if (id != null) world.cancel(id); },
    setInterval: (fn, ms, ...args) => {
      const key = {};
      const every = Math.max(10, Number(ms) || 0);
      const arm = () => { const id = world.at(world.now + every, () => { arm(); callSite(tab, () => fn(...args)); }, tab, 'timer'); intervals.set(key, id); };
      arm(); const handle = 'iv' + (++world.seq); intervals.set(handle, key); return handle;
    },
    clearInterval: h => { const key = intervals.get(h); if (key){ world.cancel(intervals.get(key)); intervals.delete(key); intervals.delete(h); } },
    requestAnimationFrame: () => 0, cancelAnimationFrame(){},
    matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    fetch: () => Promise.reject(new Error('no network in save-loop')),
    CustomEvent: class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } },
    Image: class {}, Audio: class { play(){ return Promise.resolve(); } pause(){} load(){} },
    performance: { now: () => world.now - T0 + 1000 },
    URLSearchParams, URL, TextEncoder, TextDecoder,
    CSS: { escape: v => String(v).replace(/[^a-zA-Z0-9_-]/g, c => '\\' + c), supports: () => false },
    addEventListener(type, fn){ (tab.winL[type] = tab.winL[type] || []).push(fn); }, removeEventListener(){}, dispatchEvent(){}, scrollTo(){}, scrollBy(){},
    innerWidth: 1366, innerHeight: 657, devicePixelRatio: 1,
    firebase: { initializeApp(){}, auth: Object.assign(() => auth, { GoogleAuthProvider: class {} }) },
    firebaseConfig: {},
    __clock: () => world.now, __rand: rng(opts.seed || 1), __user: USER
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  tab.ctx = ctx;
  vm.runInContext(`(function(){
    const D = Date, clock = __clock;
    function FakeDate(...a){ if (!new.target) return new D(clock()).toString(); return a.length ? new D(...a) : new D(clock()); }
    FakeDate.prototype = D.prototype; FakeDate.now = () => clock(); FakeDate.UTC = D.UTC; FakeDate.parse = D.parse;
    globalThis.Date = FakeDate;
    Math.random = __rand;
  })();`, ctx);
  for (const { f, s } of siteScripts(opts.root)){
    try { s.runInContext(ctx, { timeout: 10000 }); }
    catch (e){ throw new Error(`save-loop: ${f} did not load in the tab (${e.message}). The stub DOM may need extending.`); }
  }
  tab.ctx = ctx;
  tab.run = code => vm.runInContext(code, ctx, { timeout: 10000 });
  return tab;
}
/* Run site code from a timer or an event; a throw or a rejected promise is a fault (R12). It runs through the vm with a
   10 s timeout, so a synchronous endless loop is a fault too instead of a hang the watchdog cannot interrupt. */
const CB_SCRIPT = new vm.Script('__cb()');
function callSite(tab, fn){
  if (!tab.alive) return;
  try {
    tab.ctx.__cb = fn;
    const r = tab.ctx.firebase ? CB_SCRIPT.runInContext(tab.ctx, { timeout: 10000 }) : fn();
    if (r && typeof r.then === 'function') r.then(null, e => tab.faults.push('unhandled rejection: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e))));
  } catch (e){ tab.faults.push('threw: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e))); }
}
function siteCall(tab, code){
  return callSite(tab, () => tab.run(code));
}

/* ─────────────────────────── the oracle (never calls the site) ─────────────────────────── */
const ABSENT = undefined;
const canon = v => {
  if (v === ABSENT) return '∅';
  if (v instanceof FieldDelete) return '∅';
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return JSON.stringify(v);
};
const pad2 = n => String(n).padStart(2, '0');
function oDay(ms){ const d = new Date(ms); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function oYesterday(ms){ const d = new Date(ms); d.setDate(d.getDate() - 1); return oDay(d.getTime()); }
const MODELLED = ['completed', 'caSteps', 'classActivities', 'responses', 'practiceLog', 'exitChecks', 'streak', 'skills', 'period'];
const HELD_ON_FAILED_LOAD = new Set(['streak', 'games', 'practiceLog', 'exitChecks']);
/* A record: the unit an action changes. Keyed maps: [field, key]; the streak and the deck bests are one record each. */
function recordsOfDoc(d){
  const out = [];
  if (!d) return out;
  for (const f of ['completed', 'caSteps', 'classActivities', 'responses', 'practiceLog', 'exitChecks', 'skills']) if (isMap(d[f])) for (const k of Object.keys(d[f])) out.push([f, k]);
  if ('streak' in d) out.push(['streak']);
  if ('period' in d) out.push(['period']);
  if (isMap(d.games) && 'dk' in d.games) out.push(['games', 'dk']);
  return out;
}
const rkey = r => r.join('\u0001');
function getRec(d, r){ let o = d; for (const p of r){ if (!o || typeof o !== 'object') return ABSENT; o = o[p]; } return clone(o); }
/* R9: the Module 4/5 move, written from save.js's header prose. */
function oMapId(id){
  if (typeof id !== 'string') return id;
  let m = /^(practice-)?m([45])(w\d.*)$/.exec(id);
  if (m) return (m[1] || '') + 'm' + (m[2] === '4' ? '5' : '4') + m[3];
  m = /^mr([45])(-.*)?$/.exec(id);
  if (m) return 'mr' + (m[1] === '4' ? '5' : '4') + (m[2] || '');
  m = /^chords-m([45])$/.exec(id);
  if (m) return 'chords-m' + (m[1] === '4' ? '5' : '4');
  return id;
}
function oRemap(d){
  const o = clone(d);
  const keys = map => { const n = {}; for (const k of Object.keys(map)) n[oMapId(k)] = map[k]; return n; };
  for (const f of ['skills', 'responses', 'completed', 'practiceLog']) if (isMap(o[f])) o[f] = keys(o[f]);
  if (isMap(o.games)) for (const f of ['coachSkill', 'drillSkill', 'dk']) if (isMap(o.games[f])) o.games[f] = keys(o.games[f]);
  if (o.lastModule === 4 || o.lastModule === 5) o.lastModule = 9 - o.lastModule;
  if (o.lastModule === '4' || o.lastModule === '5') o.lastModule = String(9 - Number(o.lastModule));
  if ('lastSet' in o) o.lastSet = oMapId(o.lastSet);
  if (isMap(o.songReady)) for (const s of Object.keys(o.songReady)) if (isMap(o.songReady[s])){ const n = {}; for (const k of Object.keys(o.songReady[s])) n[k === '4' ? '5' : k === '5' ? '4' : k] = o.songReady[s][k]; o.songReady[s] = n; }
  return o;
}
const isMarked = d => !!(d && d.migrations && d.migrations.swap45 === true);
/* R5: the streak bump at time t. */
const STREAK = t => prev => {
  const day = oDay(t);
  const s = isMap(prev) ? clone(prev) : { count: 0, lastDay: null };
  if (s.lastDay === day) return prev;
  s.count = s.lastDay === oYesterday(t) ? (s.count || 0) + 1 : 1; s.lastDay = day; return s;
};
/* A tab's own view of the doc, as the oracle models it: what it loaded (nothing after a failed read), then its own
   actions. Used to keep the scripted student to what the screen offers (an action that changes nothing on that tab's
   screen is not done) and for the K1/K2 rules. */
function setRec(d, r, v){
  let o = d;
  for (let i = 0; i < r.length - 1; i++){ if (!isMap(o[r[i]])) o[r[i]] = {}; o = o[r[i]]; }
  if (v === ABSENT) delete o[r[r.length - 1]]; else o[r[r.length - 1]] = clone(v);
}
/* The effects of one action: [{ rec, fn(prev) -> next }], in the oracle's own words (R1-R7, R14-R16). */
function effectsOf(a, CHECKS){
  const day = oDay(a.t);
  switch (a.kind){
    case 'step': return [{ rec: ['completed', a.key], fn: () => a.on ? true : ABSENT }];
    case 'caStep': return [{ rec: ['caSteps', a.key], fn: () => a.on ? true : ABSENT }];
    case 'activity': return [{ rec: ['classActivities', a.key], fn: () => a.on ? true : ABSENT }];
    case 'answer': return [{ rec: ['responses', a.key], fn: () => a.text }];
    case 'rep': return [{ rec: ['practiceLog', a.key], fn: prev => {
      const e = isMap(prev) ? clone(prev) : { reps: 0 };
      if (e.lastDay !== day){ e.lastDay = day; e.todayCount = 0; }
      e.reps = (e.reps || 0) + 1; e.todayCount = (e.todayCount || 0) + 1; e.last = a.t;
      if (typeof a.best === 'number') e.best = Math.max(e.best || 0, a.best);
      return e;
    } }];
    case 'dk': return [{ rec: ['games', 'dk'], fn: prev => {
      const m = isMap(prev) ? clone(prev) : {};
      if ((m[a.key] || 0) >= a.n) return prev;
      m[a.key] = a.n; m.at = day; return m;
    } }];
    case 'streak': return [{ rec: ['streak'], fn: STREAK(a.t) }];
    case 'path': return a.keys.map(k => ({ rec: ['caSteps', `${a.key}:path:${k}`], fn: () => k === a.pick ? true : ABSENT, path: true }));
    /* R14: the checklist cell and a Module Review rating set the value the student sees next (a.result, worked out from
       that tab's own view when the student acts); a fresh "I've got it" also counts the day for the streak (R5). */
    case 'skill': case 'rate': {
      const out = [{ rec: ['skills', a.key], fn: () => a.result }];
      if (a.bump) out.push({ rec: ['streak'], fn: STREAK(a.t) });
      return out;
    }
    /* R15: the period picked replaces the stored one. */
    case 'period': return [{ rec: ['period'], fn: () => a.value }];
    /* R16: a PR entry appends {value, date} to that key's history (an old bare value becomes its first entry, with no
       date), keeping the last 8 (save.js:487-490, "a short history instead of a single overwritten value"). */
    case 'pr': return [{ rec: ['responses', a.key], fn: prev => {
      const arr = Array.isArray(prev) ? clone(prev) : (prev != null && prev !== '' ? [{ value: prev, date: null }] : []);
      arr.push({ value: a.value, date: new Date(a.t).toISOString() });
      if (arr.length > 8) arr.shift();
      return arr;
    } }];
    case 'check': {
      const items = CHECKS[a.key];
      const score = items.reduce((n, ans, i) => n + (String(a.picks[i]) === String(ans) ? 1 : 0), 0);
      return [
        { rec: ['exitChecks', a.key], fn: prev => ({ score, total: items.length, picks: a.picks.map(String), at: day, attempts: ((prev && prev.attempts) || 0) + 1 }) },
        { rec: ['classActivities', a.key], fn: () => true, checkMark: true }
      ];
    }
  }
  throw new Error('oracle: unknown action ' + a.kind);
}
function flatten(v, prefix, out){
  if (isMap(v) && Object.keys(v).length){ for (const k of Object.keys(v)) flatten(v[k], prefix.concat(k), out); }
  else out.set(prefix.join('.'), canon(v));
  return out;
}
/* R10: is there a clean point for this tab at or after t? */
function cleanAfter(tab, t, upOver, loose){
  const B = tab.sdkBlockedUntil;
  if (!tab.pokes) return false;
  const alive = s => tab.closeAt == null || tab.closeAt > s;
  for (const s of tab.pokes) if (s >= t && s >= B && alive(s + 6000) && upOver(s - 2000, s + 6000)) return true;
  /* Back online: the site re-arms the save (shell.js 'online' listener), provided none of this tab's writes is still on the wire. */
  for (const s of tab.onlines) if (s >= t && s >= B && alive(s + 6000) && upOver(s, s + 6000) && !tab.net.some(n => n.from < s && n.to > s)) return true;
  if (tab.closeAt != null && tab.killKind !== 'die' && !(loose && tab.killKind === 'close' && tab.dropUnload) && tab.closeAt >= t && tab.closeAt >= B && tab.sdkLoadedAt != null && tab.sdkLoadedAt <= tab.closeAt && !tab.unmarkedAtLoad && upOver(tab.closeAt - 2000, tab.closeAt + 1500)) return true;
  return false;
}
function oracle(sc, world, tabs){
  const fails = [], known = [];
  const end = world.docs.get('progress/' + USER.uid);
  const stored = end ? end.data : null;
  const initialMarked = isMarked(sc.initial);
  const base = sc.initial ? (initialMarked ? clone(sc.initial) : oRemap(sc.initial)) : null;
  const tabBy = Object.fromEntries(tabs.map(t => [t.name, t]));
  for (const t of tabs) loadFacts(world, t);
  /* The ledger, with owed flags (R8, R10). `owed` counts a close as a clean point; `owedLoose` does not when that
     scenario's unload writes are not delivered (K3). */
  const acts = sc.actions.filter(a => a.done).slice().sort((x, y) => x.t - y.t || x.i - y.i);
  const recs = new Map();
  const addRec = r => { if (!recs.has(rkey(r))) recs.set(rkey(r), { rec: r, effs: [] }); return recs.get(rkey(r)); };
  for (const r of recordsOfDoc(base)) addRec(r);
  for (const r of recordsOfDoc(stored)) addRec(r);
  let owedN = 0, notOwedN = 0;
  for (const a of acts){
    const tab = tabBy[a.tab];
    const up = (x, y) => tab.device.upOver(x, y);
    const clean = cleanAfter(tab, a.t, up, false), cleanLoose = cleanAfter(tab, a.t, up, true);
    for (const e of effectsOf(a, sc.CHECKS)){
      const held = !tab.loadOk && (HELD_ON_FAILED_LOAD.has(e.rec[0]) || e.checkMark);
      const owed = clean && !held;
      if (owed) owedN++; else notOwedN++;
      addRec(e.rec).effs.push({ a, e, owed, owedLoose: cleanLoose && !held });
    }
  }
  /* Every value a record may hold: owed effects always applied, each not-owed one applied or not. */
  const acceptOf = (rec, effs, flag) => {
    const free = effs.filter(x => !x[flag]);
    if (free.length > 12) throw new Error('oracle: more than 12 not-owed actions on one record; shorten the scenario');
    const okVals = new Map();
    for (let mask = 0; mask < (1 << free.length); mask++){
      let v = getRec(base, rec);
      for (const x of effs){ if (!x[flag] && !(mask & (1 << free.indexOf(x)))) continue; v = x.e.fn(v); }
      okVals.set(canon(v), v);
    }
    const accept = new Map();
    for (const v of okVals.values()) flatten(v, rec, new Map()).forEach((c, k) => { if (!accept.has(k)) accept.set(k, new Set()); accept.get(k).add(c); });
    const allLeafKeys = new Set(accept.keys());
    for (const v of okVals.values()){ const f = flatten(v, rec, new Map()); for (const k of allLeafKeys) if (!f.has(k)) accept.get(k).add('∅'); }
    return accept;
  };
  let leaves = 0;
  for (const { rec, effs } of recs.values()){
    /* Which effects changed what their own tab showed (R11 K1 looks only at those). */
    for (const x of effs){ const v = viewBefore(tabBy[x.a.tab], rec, effs, x); x.changed = canon(x.e.fn(v)) !== canon(v); }
    const accept = acceptOf(rec, effs, 'owed');
    const loose = acceptOf(rec, effs, 'owedLoose');
    const got = flatten(getRec(stored, rec), rec, new Map());
    for (const k of got.keys()) if (!accept.has(k)) accept.set(k, new Set(['∅']));
    for (const [k, set] of accept){
      leaves++;
      const g = got.has(k) ? got.get(k) : '∅';
      if (set.has(g)) continue;
      /* R11 K3: the write sent while the tab unloaded never arrived. */
      if (loose.has(k) && loose.get(k).has(g)){ known.push({ kind: 'K3 unload write lost', leaf: k, stored: g, accept: [...set] }); continue; }
      /* R11 K2: path picks. */
      const lastOwed = effs.filter(x => x.owed).pop();
      if (lastOwed && lastOwed.e.path && g === 'true'){
        const y = lastOwed.a.tab;
        const yView = viewBefore(tabBy[y], rec, effs, lastOwed);
        /* ...and the pick that stands came from another tab that did hold it. */
        const other = tabs.find(t => t.name !== y && viewsOf(t, rec, effs).has('true'));
        if (canon(yView) === '∅' && other){ known.push({ kind: 'K2 path picks', leaf: k, stored: g, accept: [...set], by: other.name }); continue; }
      }
      /* R11 K1: a key both tabs hold. */
      const leafPath = k.split('.');
      const k1 = world.landed.find(w => {
        if (w.path !== 'progress/' + USER.uid || w.tx || sentLeaf(w.data, leafPath) !== g) return false;
        const lastOther = effs.filter(x => x.owed && x.changed && x.a.tab !== w.tab).pop();
        if (!lastOther || w.at < lastOther.a.t || !viewsOf(tabBy[w.tab], rec, effs).has(g)) return false;
        /* ...and the other tab's newer value did reach the server before it was overwritten (otherwise nothing of the
           other tab's was lost to this one: its own write went missing, which is a failure). */
        const after = flatten(lastOther.e.fn(viewBefore(tabBy[lastOther.a.tab], rec, effs, lastOther)), rec, new Map()).get(k) || '∅';
        return world.landed.some(w2 => w2.tab === lastOther.a.tab && !w2.tx && w2.path === w.path && w2.at >= lastOther.a.t && w2.at <= w.at && sentLeaf(w2.data, leafPath) === after);
      });
      if (k1){ known.push({ kind: 'K1 a key both tabs hold', leaf: k, stored: g, accept: [...set], by: k1.tab }); continue; }
      /* The facts the second KNOWN entry is matched on: a PR history replaced by the one a tab whose read failed built
         from nothing. */
      const wipedByFailedTab = rec[0] === 'responses' && g.startsWith('[') && effs.some(x => x.a.kind === 'pr') && tabs.some(t => !t.loadOk && viewsOf(t, rec, effs).has(g));
      fails.push({ msg: `${k}: stored ${g}, expected ${[...set].join(' or ')}` + (lastOwed ? ` (last owed: ${lastOwed.a.tab} ${describe(lastOwed.a)} at ${rel(lastOwed.a.t)})` : ' (no owed action: the value it started with)'), rule: wipedByFailedTab ? 'R16-wiped' : null });
    }
  }
  /* R7 invariant: an exit check marked done has a score behind it. */
  for (const id of Object.keys(sc.CHECKS)){
    if (stored && stored.classActivities && stored.classActivities[id] === true && !(stored.exitChecks && stored.exitChecks[id] && typeof stored.exitChecks[id].score === 'number')){
      /* The facts KNOWN entries are matched on: a tab whose read failed took this check, and the stored score record is
         exactly what the doc started with. */
      const byFailed = acts.some(a => a.kind === 'check' && a.key === id && !tabBy[a.tab].loadOk);
      const scoreAsStarted = canon(getRec(stored, ['exitChecks', id])) === canon(getRec(base, ['exitChecks', id]));
      fails.push({ msg: `classActivities.${id}: the exit check is filed as done with no score behind it (R7, activities-2.js:276-287)`, rule: 'R7-mark', card: id, byFailed, scoreAsStarted });
    }
  }
  /* R9: the doc ends marked. R13: name, email, and the fields not modelled. */
  if (stored){
    if (!isMarked(stored) && (acts.length || !initialMarked)) fails.push({ msg: 'migrations.swap45: the stored doc is not marked (R9)' });
    if (stored.name !== USER.displayName || stored.email !== USER.email) fails.push({ msg: `name/email: stored ${JSON.stringify(stored.name)} / ${JSON.stringify(stored.email)}` });
    const other = new Set(Object.keys(stored).concat(Object.keys(base || {})).filter(f => !MODELLED.includes(f) && !['name', 'email', 'migrations', 'games'].includes(f)));
    if (isMap(stored.games) || (base && isMap(base.games))) for (const g of new Set(Object.keys((stored.games || {})).concat(Object.keys((base && base.games) || {})))) if (g !== 'dk'){ leaves++; if (canon(getRec(stored, ['games', g])) !== canon(getRec(base, ['games', g]))) fails.push({ msg: `games.${g}: stored ${canon(getRec(stored, ['games', g]))}, expected ${canon(getRec(base, ['games', g]))} (not touched by the student)` }); }
    /* A checklist tick or a rating also saves the place the student is on (saveProgress: skills + place). This tool
       does not navigate between sets, so after one of those the place is not compared (not modelled). */
    if (acts.some(a => a.kind === 'skill' || a.kind === 'rate')){ other.delete('lastModule'); other.delete('lastSet'); }
    for (const f of other){ leaves++; if (canon(stored[f]) !== canon(base ? base[f] : ABSENT)) fails.push({ msg: `${f}: stored ${canon(stored[f])}, expected ${canon(base ? base[f] : ABSENT)} (not touched by the student)` }); }
  } else if (acts.length) fails.push({ msg: 'progress doc: never written' });
  for (const t of tabs) for (const f of t.faults) fails.push({ msg: `${t.name}: site code ${f} (R12)` });
  for (const f of world.faults || []) fails.push({ msg: `site code: ${f} (R12)` });
  return { fails, known, leaves, owedN, notOwedN };
}
/* What a merge write SAID about a leaf: its value, '∅' for a FieldValue.delete(), or null when it did not name the leaf
   (an absent key in a merge leaves the stored value alone, so it carries nothing). */
function sentLeaf(data, path){
  let o = data;
  for (const p of path){ if (!o || typeof o !== 'object' || o instanceof FieldDelete || !(p in o)) return null; o = o[p]; }
  return canon(o);
}
/* What a tab loaded (a fact of the fake world), and whether the load failed. */
function loadFacts(world, t){
  const g = world.gets.find(x => x.tab === t.name && x.path === 'progress/' + USER.uid);
  t.loadOk = !!(g && g.ok);
  t.loadSnap = t.loadOk ? (g.data && !isMarked(g.data) ? oRemap(g.data) : g.data) : null;
  t.unmarkedAtLoad = t.loadOk && g.data ? !isMarked(g.data) : false;
}
function viewBefore(tab, rec, effs, upto){
  let v = tab.loadOk ? getRec(tab.loadSnap, rec) : ABSENT;
  for (const x of effs){ if (x === upto) break; if (x.a.tab === tab.name) v = x.e.fn(v); }
  return v;
}
/* Every value the oracle's model of a tab held for a record: what it loaded, then its own actions (R11 K1). */
function viewsOf(tab, rec, effs){
  const out = new Set();
  let v = tab.loadOk ? getRec(tab.loadSnap, rec) : ABSENT;
  const add = val => flatten(val, rec, new Map()).forEach(c => out.add(c));
  add(v); out.add(canon(v));
  for (const x of effs) if (x.a.tab === tab.name){ v = x.e.fn(v); add(v); out.add(canon(v)); }
  return out;
}
const rel = t => ((t - T0) / 1000).toFixed(2) + ' s';
function describe(a){
  switch (a.kind){
    case 'step': case 'caStep': case 'activity': return `${a.on ? 'tick' : 'untick'} ${a.kind} ${a.key}`;
    case 'answer': return `answer ${a.key}=${JSON.stringify(a.text)}`;
    case 'rep': return `rep ${a.key}${typeof a.best === 'number' ? ' best ' + a.best : ''}`;
    case 'dk': return `deck best ${a.key}=${a.n}`;
    case 'streak': return 'streak bump';
    case 'path': return `path ${a.key}=${a.pick}`;
    case 'check': return `exit check ${a.key} picks ${a.picks.join(',')}`;
    case 'skill': return `checklist ${a.which === 'gotit' ? "\"I've got it\"" : '"working on it"'} ${a.key} -> ${a.result}${a.bump ? ' (+streak)' : ''}`;
    case 'rate': return `Module Review rating ${a.key} ${a.level} -> ${a.result}`;
    case 'period': return `period ${a.value}`;
    case 'pr': return `PR entry ${a.key}=${a.value}`;
  }
  return a.kind;
}

/* ─────────────────────────── the scripted student ─────────────────────────── */
const DAY = 86400000;
/* The exit checks' answers, choices and retake rule, and ca-46's paths, read from the class-activities.js DATA of the
   site under test (data, not code). */
const DATA = (() => {
  const c = { window: {} }; c.window = c; vm.createContext(c);
  vm.runInContext(readFileSync(join(ROOT, 'class-activities.js'), 'utf8'), c);
  const all = c.CLASS_ACTIVITIES || [];
  const out = { CHECKS: {}, CHOICES: {}, RETAKE: {}, PATHS: [] };
  for (const id of ['ca-14', 'ca-15']){
    const a = all.find(x => x.id === id);
    if (!a || !a.check) throw new Error('save-loop: ' + id + ' is no longer an exit check in class-activities.js');
    out.CHECKS[id] = a.check.items.map(it => a.check.type === 'nextNote' ? String(it.answer.fret) : String(it.answer));
    /* nextNote items carry their choices (frets); a noteName row is the seven letters. */
    out.CHOICES[id] = a.check.items.map(it => a.check.type === 'nextNote' ? (it.choices || []).map(ch => String(ch.fret)) : ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
    out.RETAKE[id] = !!a.check.retake;
  }
  const p46 = all.find(x => x.id === 'ca-46');
  out.PATHS = p46 && p46.paths ? p46.paths.map(x => x.key) : [];
  if (!out.PATHS.length) throw new Error('save-loop: ca-46 has no paths any more in class-activities.js');
  return out;
})();
function device(name, phases){
  return { name, localStorage: null, phases,
    phaseAt(t){ for (const p of this.phases) if (t < p.until) return p; return { phase: 'up', until: Infinity }; },
    upOver(a, b){ let s = a; for (const p of this.phases){ if (p.until <= s) continue; if (p.phase !== 'up') return false; if (p.until > b) return true; s = p.until; } return true; } };
}
/* The doc a returning student starts with. Every map the save path can hold back or overwrite holds a NON-default
   value, so a write that starts from zero (a streak of 1, an exit check with attempts 1, a history of one entry, an
   empty map) can never look like the right answer. */
function initialDoc(r, kind){
  const yesterday = oDay(T0 - DAY);
  const ca14 = DATA.CHECKS['ca-14'];
  const d = {
    name: USER.displayName, email: USER.email, migrations: { swap45: true },
    completed: { 'm6w1-b-sec0-0': true, 'm6w1-b-sec0-1': true, 'm7w1-b-sec1-0': true },
    caSteps: { 'ca-18:0': true, 'ca-18:1': true },
    classActivities: { 'ca-12': true, 'ca-14': true },
    responses: { 'm6w1-b-sec0-2': 'first finger on fret two', 'm6w2-b-sec0-0': 'G',
      'practice-m6w1-s2': [{ value: '72', date: new Date(T0 - 3 * DAY).toISOString() }, { value: '80', date: new Date(T0 - 2 * DAY).toISOString() }] },
    practiceLog: { 'm6w1-s1': { reps: 47, todayCount: 2, lastDay: yesterday, last: T0 - DAY + 3600000, best: 80 } },
    exitChecks: { 'ca-14': { score: ca14.length - 1, total: ca14.length, picks: ca14.map((x, i) => i === 0 ? 'x' : x), at: oDay(T0 - 2 * DAY), attempts: 1 } },
    streak: { count: 15, lastDay: yesterday },
    games: { dk: { 'chords-m6': 10, at: oDay(T0 - 2 * DAY) }, sd: { 'low-E:naturals': 7, at: yesterday }, drillSkill: { 'm6w1-s3': { best: 9, at: yesterday } } },
    skills: { 'm6w1-s1': 'gotit', 'm6w1-s2': 'working', 'm7w1-s1': 'gotit', 'mr6-s1': '2', 'mr6-s3': '3' },
    lastModule: 6, lastSet: 'm6w1', period: '4'
  };
  if (kind === 'unmarked'){
    delete d.migrations;
    Object.assign(d.completed, { 'm4w1-b-sec0-0': true, 'm5w2-b-sec1-0': true });
    Object.assign(d.responses, { 'm5w1-b-sec0-1': 'the box shape', 'mr4-s1': '3' });
    d.practiceLog['m4w2-s1'] = { reps: 12, todayCount: 1, lastDay: yesterday, last: T0 - DAY, best: 70 };
    d.practiceLog['practice-m5w1-s2'] = { reps: 3, todayCount: 3, lastDay: yesterday, last: T0 - DAY };
    d.games.dk['chords-m5'] = 6;
    d.lastModule = 5; d.lastSet = 'm5w2';
    d.songReady = { 'the-cure': { 4: true, 5: false } };
  }
  if (kind === 'none') return null;
  void r;
  return d;
}
const POOL = {
  step: ['m6w1-b-sec0-0', 'm6w1-b-sec0-1', 'm6w1-b-sec0-3', 'm7w1-b-sec1-0', 'm7w2-c-sec0-1'],
  stepSwap: ['m5w1-b-sec0-0', 'm4w2-b-sec1-0', 'm4w1-b-sec0-2', 'm5w3-b-sec0-1'],
  caStep: ['ca-18:0', 'ca-18:1', 'ca-18:2', 'ca-20:c1', 'ca-20:c2'],
  activity: ['ca-12', 'ca-18', 'ca-20'],
  answer: ['m6w1-b-sec0-2', 'm6w2-b-sec0-0', 'm7w1-b-sec1-2'],
  answerSwap: ['m4w1-b-sec0-1', 'mr5-s1'],
  words: ['the box shape', 'G', 'first finger', 'A minor', 'slow then fast', 'the low E', 'D', 'it buzzed'],
  rep: ['m6w1-s1', 'm6w2-s3', 'm7w1-s1'],
  /* Checklist skills with no Coach or drill gate (a gated one opens a gate instead of saving). */
  skill: [['m6w1-s1', 'm6w1'], ['m6w1-s2', 'm6w1'], ['m6w1-s4', 'm6w1'], ['m7w1-s1', 'm7w1'], ['m7w1-s2', 'm7w1']],
  rate: ['mr6-s1', 'mr6-s3', 'mr6-s4'],
  pr: ['practice-m6w1-s2', 'practice-m7w1-s3'],
  repSwap: ['m5w2-s1', 'practice-m4w1-s2'],
  dk: ['chords-m6', 'power-m7'],
  dkSwap: ['chords-m4']
};
const FAMILIES = {
  'untick-retick': 'un-tick, re-tick, un-tick again while the first delete is still on a slow wire (save.js:727-731)',
  'sdk-blocked': 'the Firestore SDK blocked at sign-in, a tick and an un-tick before it loads (save.js:644-650)',
  'failed-load': 'the progress read fails at sign-in; streak, reps, deck best, exit check, tick/untick over a slow commit (save.js:562-583, activities-2.js:276-287)',
  'dropped': 'writes rejected, stalled and slow, longer than the retry budget, with hides',
  'hide-close': 'the tab hidden or closed inside the 800 ms debounce, then a second session the next day',
  'two-tabs': 'two tabs on one Chromebook, shared network and localStorage, interleaved on the same keys',
  'two-devices': 'two devices on their own networks, one picks a path the other never saw (WORKFLOW.md 2026-11-09)',
  'swap45': 'an unmarked Module 4/5 doc, a failed move commit, a second tab (save.js:11-58)',
  'mixed': 'everything at random'
};
function genScenario(seed, idx, famFilter){
  const names = famFilter.length ? famFilter : Object.keys(FAMILIES);
  const fam = names[idx % names.length];
  const r = rng(mix(seed, idx + 1));
  const ri = (a, b) => a + Math.floor(r() * (b - a + 1));
  const pick = arr => arr[Math.floor(r() * arr.length)];
  const S = 1000;
  const sc = { fam, seed, idx, actions: [], tabs: [], devices: [], initial: initialDoc(r, fam === 'swap45' ? 'unmarked' : fam === 'mixed' && r() < 0.15 ? 'none' : 'marked') };
  const devA = device('dev1', []);
  sc.devices.push(devA);
  let ai = 0;
  const act = (tab, t, kind, x) => { sc.actions.push(Object.assign({ i: ai++, tab, t: T0 + t, kind }, x)); };
  const tabSpec = (name, dev, openAt, x) => { const s = Object.assign({ name, dev, openAt: T0 + openAt, events: [], sdkMs: ri(80, 300), sdkBlockedUntil: 0 }, x || {}); sc.tabs.push(s); return s; };
  const ev = (tab, t, what) => tab.events.push({ t: T0 + t, what });
  const randomAct = (tab, t, swap) => {
    const k = ri(0, 13);
    if (k === 10){ const [sid, wid] = pick(POOL.skill); act(tab, t, 'skill', { key: sid, wid, which: r() < 0.7 ? 'gotit' : 'working' }); return; }
    if (k === 11){ act(tab, t, 'rate', { key: pick(POOL.rate), level: pick(['1', '2', '3']) }); return; }
    if (k === 12){ act(tab, t, 'pr', { key: pick(POOL.pr), value: String(ri(60, 140)) }); return; }
    if (k === 13){ act(tab, t, 'period', { value: pick(['4', '7', 'CAS']) }); return; }
    if (k <= 2){ const key = pick(swap && r() < 0.5 ? POOL.stepSwap : POOL.step); act(tab, t, 'step', { key, on: r() < 0.55 }); }
    else if (k === 3) act(tab, t, 'caStep', { key: pick(POOL.caStep), on: r() < 0.6 });
    else if (k === 4) act(tab, t, 'activity', { key: pick(POOL.activity), on: r() < 0.6 });
    else if (k === 5) act(tab, t, 'answer', { key: pick(swap && r() < 0.5 ? POOL.answerSwap : POOL.answer), text: pick(POOL.words) });
    else if (k === 6) act(tab, t, 'rep', Object.assign({ key: pick(swap && r() < 0.5 ? POOL.repSwap : POOL.rep) }, r() < 0.4 ? { best: ri(60, 120) } : {}));
    else if (k === 7) act(tab, t, 'dk', { key: pick(swap && r() < 0.5 ? POOL.dkSwap : POOL.dk), n: ri(3, 14) });
    else if (k === 8) act(tab, t, 'streak', {});
    else act(tab, t, 'path', { key: 'ca-46', pick: pick(['full', 'chunks']) });
  };
  /* An action that always changes something (a random one is often a no-op: un-ticking what is not ticked). */
  const realChange = (tab, t) => {
    const k = ri(0, 2);
    if (k === 0) act(tab, t, 'answer', { key: pick(POOL.answer), text: 'new answer ' + ri(1, 999) });
    else if (k === 1) act(tab, t, 'rep', { key: pick(POOL.rep) });
    else act(tab, t, 'step', { key: pick(POOL.step.filter(x => !(sc.initial && sc.initial.completed[x]))), on: true });
  };
  let settle;
  if (fam === 'untick-retick'){
    const L = ri(1500, 4500);
    const t1 = ri(4, 8) * S;
    const tA = tabSpec('A', devA, 0);
    const kind = pick(['step', 'caStep', 'activity']);
    const key = kind === 'step' ? pick(['m6w1-b-sec0-0', 'm6w1-b-sec0-1', 'm7w1-b-sec1-0']) : kind === 'caStep' ? pick(['ca-18:0', 'ca-18:1']) : 'ca-12';
    const tuned = r() < 0.6;
    const d2 = tuned ? L + ri(100, 700) : ri(1000, 7000);
    const d1 = tuned ? ri(900, Math.max(900, d2 - 900)) : ri(200, d2 - 100);
    devA.phases = [{ phase: 'up', until: T0 + t1 - 500 }, { phase: 'slow', until: T0 + t1 + 12 * S, lat: L }];
    act('A', t1, kind, { key, on: false }); act('A', t1 + d1, kind, { key, on: true }); act('A', t1 + d2, kind, { key, on: false });
    if (r() < 0.5) act('A', t1 + d2 + ri(100, 3000), kind, { key, on: r() < 0.5 });
    for (let n = ri(0, 3); n > 0; n--) randomAct('A', ri(3, 25) * S);
    if (r() < 0.3) ev(tA, t1 + d2 + ri(200, 2000), 'hide'), ev(tA, t1 + d2 + ri(3000, 5000), 'show');
    settle = 30 * S;
  } else if (fam === 'sdk-blocked'){
    const B = ri(6, 14) * S;
    tabSpec('A', devA, 0, { sdkBlockedUntil: T0 + B });
    const key = pick(POOL.step), t1 = ri(2, 4) * S;
    act('A', t1, 'step', { key, on: true });
    act('A', t1 + ri(100, 2500), 'step', { key, on: false });
    if (r() < 0.5) act('A', t1 + ri(2600, 5000), 'caStep', { key: pick(POOL.caStep), on: false });
    for (let n = ri(1, 3); n > 0; n--) randomAct('A', ri(2, 20) * S);
    settle = 25 * S;
  } else if (fam === 'failed-load'){
    const mode = pick(['refused', 'offline', 'stall']);
    /* A stalled read fails after 10 s, so a stall has to outlast that for the load to fail. */
    const failUntil = mode === 'stall' ? ri(11, 13) * S : ri(2, 4) * S;
    const slowLat = ri(1500, 3500);
    devA.phases = [{ phase: mode, until: T0 + failUntil }, { phase: 'slow', until: T0 + failUntil + 10 * S, lat: slowLat }];
    const tA = tabSpec('A', devA, 0);
    const t1 = failUntil + ri(500, 2500);
    const key = pick(POOL.step.filter(k => !sc.initial.completed[k]));
    act('A', t1, 'step', { key, on: true }); act('A', t1 + ri(100, 600), 'step', { key, on: false });
    act('A', t1 + 800 + ri(500, slowLat), 'step', { key, on: true });
    act('A', t1 + ri(4, 7) * S, 'streak', {});
    act('A', t1 + ri(4, 9) * S, 'rep', { key: 'm6w1-s1', best: ri(30, 70) });
    act('A', t1 + ri(4, 9) * S, 'dk', { key: 'chords-m6', n: ri(2, 9) });
    if (r() < 0.7){
      const tc = t1 + ri(10, 14) * S;
      act('A', tc, 'check', { key: pick(['ca-14', 'ca-15']), picks: null });
      /* Another activity marked done (or not) later in the same session. */
      if (r() < 0.5) act('A', tc + ri(1, 4) * S, 'activity', { key: pick(['ca-18', 'ca-20']), on: r() < 0.7 });
    }
    for (let n = ri(0, 3); n > 0; n--) randomAct('A', t1 + ri(1, 15) * S);
    if (r() < 0.3) ev(tA, t1 + ri(16, 18) * S, 'close');
    settle = t1 + 22 * S;
  } else if (fam === 'dropped'){
    const segs = []; let t = 0;
    while (t < 40 * S){ const len = ri(2, 12) * S; segs.push({ phase: pick(['up', 'refused', 'offline', 'stall', 'slow']), until: T0 + t + len }); t += len; }
    devA.phases = segs.filter(p => p.until > T0 + 2500);
    devA.phases.unshift({ phase: 'up', until: T0 + 2500 });
    const tA = tabSpec('A', devA, 0);
    for (let n = ri(4, 10); n > 0; n--) randomAct('A', ri(3, 38) * S + ri(0, 999));
    for (let n = ri(0, 2); n > 0; n--){ const h = ri(5, 35) * S; ev(tA, h, 'hide'); ev(tA, h + ri(1, 4) * S, 'show'); }
    settle = 45 * S;
    /* One case in three: the tab opens with the Wi-Fi down, so the Firestore SDK cannot load (and the read fails); the
       student works; every save fails on the SDK until the retry budget (5 tries, 3 s apart) is spent; the Wi-Fi comes
       back, and the battery dies 8-12 s later with no other action, hide or close in between. */
    if (r() < 0.34){
      const off = ri(22, 26) * S, back = ri(8, 12) * S;
      devA.phases = [{ phase: 'offline', until: T0 + off }, { phase: 'up', until: Infinity }];
      sc.actions = sc.actions.filter(a => a.tab !== 'A');
      tA.events.length = 0;
      for (let n = ri(1, 3); n > 0; n--) realChange('A', ri(2, 4) * S + ri(0, 800));
      ev(tA, off + back, 'die');
      settle = off + back + 5 * S;
    }
  } else if (fam === 'hide-close'){
    const tA = tabSpec('A', devA, 0);
    const t1 = ri(3, 6) * S;
    for (let n = ri(0, 3); n > 0; n--) randomAct('A', t1 + ri(0, 3000));
    /* The last thing before the tab goes is always a real change. */
    realChange('A', t1 + 3100);
    const last = Math.max(...sc.actions.map(a => a.t - T0));
    const mode = pick(['close', 'lid', 'lid', 'hide']);
    if (r() < 0.3) devA.phases = [{ phase: 'up', until: T0 + last + 100 }, { phase: pick(['refused', 'offline', 'stall', 'slow']), until: T0 + last + ri(2, 8) * S }];
    ev(tA, last + ri(50, 750), mode);
    if (mode === 'hide') ev(tA, last + ri(2, 6) * S, 'show');
    const day2 = r() < 0.6;
    if (day2){
      const o = DAY + ri(0, 3600) * S;
      tabSpec('B', devA, o);
      for (let n = ri(1, 4); n > 0; n--) randomAct('B', o + ri(3, 10) * S);
      act('B', o + 11 * S, 'streak', {});
      settle = o + 20 * S;
    } else settle = last + 20 * S;
  } else if (fam === 'two-tabs' || fam === 'two-devices'){
    const devB = fam === 'two-devices' ? device('dev2', []) : devA;
    if (devB !== devA) sc.devices.push(devB);
    const oB = ri(0, 8) * S;
    tabSpec('A', devA, 0); tabSpec('B', devB, oB);
    const shared = { step: pick(POOL.step), ca: pick(POOL.caStep), ans: pick(POOL.answer), rep: pick(POOL.rep) };
    for (let n = ri(3, 8); n > 0; n--){
      const who = r() < 0.5 ? 'A' : 'B', t = (who === 'B' ? oB : 0) + ri(3, 30) * S + ri(0, 999);
      const k = ri(0, 5);
      if (k === 0) act(who, t, 'step', { key: shared.step, on: r() < 0.5 });
      else if (k === 1) act(who, t, 'caStep', { key: shared.ca, on: r() < 0.5 });
      else if (k === 2) act(who, t, 'answer', { key: shared.ans, text: pick(POOL.words) });
      else if (k === 3) act(who, t, 'rep', { key: shared.rep });
      else randomAct(who, t);
    }
    if (fam === 'two-devices'){ act('A', ri(3, 6) * S, 'path', { key: 'ca-46', pick: 'full' }); act('B', oB + ri(7, 12) * S, 'path', { key: 'ca-46', pick: 'chunks' }); }
    if (r() < 0.5) devA.phases = [{ phase: 'up', until: T0 + ri(5, 15) * S }, { phase: pick(['slow', 'refused', 'offline', 'stall']), until: T0 + ri(16, 26) * S }];
    if (devB !== devA && r() < 0.5) devB.phases = [{ phase: 'up', until: T0 + ri(5, 15) * S }, { phase: pick(['slow', 'refused', 'offline', 'stall']), until: T0 + ri(16, 26) * S }];
    settle = 45 * S;
  } else if (fam === 'swap45'){
    /* One case in three: a second tab on the same Chromebook opens with the first, so both move commits race (F10). */
    const race = r() < 0.34;
    const failCommit = !race && r() < 0.6;
    const sdkA = ri(60, 200);
    /* The read is issued when the SDK loads and takes at most 400 ms; the move commit after it meets the failure. */
    const failEnd = ri(3, 9) * S;
    if (failCommit) devA.phases = [{ phase: 'up', until: T0 + sdkA + 401 }, { phase: pick(['refused', 'offline', 'stall']), until: T0 + failEnd }];
    tabSpec('A', devA, 0, { sdkMs: sdkA });
    /* Work saved soon after the failed move: it must not land on the doc while it is still in the old numbering. */
    if (failCommit) act('A', failEnd + ri(100, 2000), 'step', { key: pick(POOL.stepSwap), on: r() < 0.6 });
    for (let n = ri(3, 7); n > 0; n--) randomAct('A', ri(2, 20) * S + ri(0, 999), true);
    act('A', ri(2, 6) * S, 'step', { key: 'm5w1-b-sec0-0', on: false });
    if (race || r() < 0.6){
      const devB = race || r() < 0.5 ? devA : device('dev2', []);
      if (devB !== devA) sc.devices.push(devB);
      const oB = race ? ri(0, 300) : ri(1, 6) * S;
      tabSpec('B', devB, oB);
      for (let n = ri(1, 4); n > 0; n--) randomAct('B', oB + ri(2, 15) * S, true);
    }
    settle = 35 * S;
  } else {
    const nTabs = r() < 0.5 ? 1 : 2;
    const segs = []; let t = 0;
    while (t < 50 * S){ const len = ri(2, 10) * S; segs.push({ phase: pick(['up', 'up', 'slow', 'refused', 'offline', 'stall']), until: T0 + t + len }); t += len; }
    devA.phases = segs;
    const tA = tabSpec('A', devA, 0, r() < 0.2 ? { sdkBlockedUntil: T0 + ri(2, 8) * S } : {});
    for (let n = ri(3, 9); n > 0; n--) randomAct('A', ri(3, 45) * S + ri(0, 999));
    if (r() < 0.2) act('A', ri(5, 40) * S, 'check', { key: pick(['ca-14', 'ca-15']), picks: null });
    if (r() < 0.4){ const h = ri(10, 40) * S; ev(tA, h, pick(['close', 'lid', 'die', 'hide', 'hide'])); if (tA.events[tA.events.length - 1].what === 'hide') ev(tA, h + ri(1, 5) * S, 'show'); }
    if (nTabs === 2){
      const devB = r() < 0.5 ? devA : device('dev2', segs.map(p => Object.assign({}, p, { phase: r() < 0.5 ? 'up' : p.phase })));
      if (devB !== devA) sc.devices.push(devB);
      const oB = ri(1, 20) * S;
      tabSpec('B', devB, oB);
      for (let n = ri(2, 6); n > 0; n--) randomAct('B', oB + ri(3, 25) * S + ri(0, 999));
    }
    settle = 55 * S;
  }
  /* Actions only while their tab is open and showing (the generator's own rule): drop the rest. */
  for (const s of sc.tabs){
    const kill = s.events.find(e => e.what === 'close' || e.what === 'lid' || e.what === 'die') || {};
    const closeAt = kill.t;
    s.closeAt = closeAt; s.killKind = kill.what;
    /* Half the closes: the writes started while the page unloads never leave the browser (K3). */
    if (kill.what === 'close') s.dropUnload = r() < 0.5;
    const hiddenSpans = [];
    let h = null;
    for (const e of s.events.slice().sort((a, b) => a.t - b.t)){ if (e.what === 'hide' || e.what === 'lid') h = e.t; else if (e.what === 'show' && h != null){ hiddenSpans.push([h, e.t]); h = null; } }
    if (h != null) hiddenSpans.push([h, Infinity]);
    sc.actions = sc.actions.filter(a => a.tab !== s.name || (a.t >= s.openAt + 1500 && (closeAt == null || a.t < closeAt - 20) && !hiddenSpans.some(([x, y]) => a.t >= x - 20 && a.t <= y + 20)));
  }
  sc.settleAt = T0 + settle;
  /* The settle (R10): the network up everywhere from settleAt, then every open tab hidden 2 s later. */
  for (const d of sc.devices) d.phases = d.phases.map(p => Object.assign({}, p, { until: Math.min(p.until, sc.settleAt) })).concat([{ phase: 'up', until: Infinity }]);
  sc.endAt = sc.settleAt + 25 * S;
  return sc;
}

/* ─────────────────────────── one case ─────────────────────────── */
let BEAT = { at: Date.now(), where: 'starting' };
const beat = where => { BEAT = { at: Date.now(), where }; };
async function runCase(seed, idx, famFilter){
  const sc = genScenario(seed, idx, famFilter);
  const world = new World(mix(seed, idx + 99));
  if (sc.initial) world.docs.set('progress/' + USER.uid, { data: clone(sc.initial), version: 1 });
  const shared = new Map();
  const mkStorage = () => ({ _d: {}, getItem(k){ return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; }, setItem(k, v){ this._d[k] = String(v); }, removeItem(k){ delete this._d[k]; }, clear(){ this._d = {}; }, key(i){ return Object.keys(this._d)[i] ?? null; }, get length(){ return Object.keys(this._d).length; } });
  for (const d of sc.devices) if (!shared.has(d)){ d.localStorage = mkStorage(); shared.set(d, true); }
  const tabs = [];
  CURRENT_WORLD = world;
  world.faults = [];
  sc.CHECKS = DATA.CHECKS;
  const pr = rng(mix(seed, idx + 7));
  for (const a of sc.actions){
    if (a.kind === 'check') a.picks = DATA.CHOICES[a.key].map((ch, i) => pr() < 0.7 ? DATA.CHECKS[a.key][i] : ch[Math.floor(pr() * ch.length)]);
    if (a.kind === 'path') a.keys = DATA.PATHS;
  }
  /* Schedule the tabs, their events and the student. */
  for (const s of sc.tabs){
    world.at(s.openAt, () => {
      const tab = makeTab(world, s.name, s.dev, { root: ROOT, seed: mix(seed, s.name.charCodeAt(0)), sdkMs: s.sdkMs, sdkBlockedUntil: s.sdkBlockedUntil });
      tab.openAt = s.openAt; tab.closeAt = s.closeAt; tab.killKind = s.killKind; tab.pokes = [];
      tabs.push(tab); s.tab = tab;
      world.log(`${s.name} opens on ${s.dev.name}; signs in`);
      tab.dropUnload = !!s.dropUnload;
      tab.ctx.__booted = () => {
        tab.booted = true;
        loadFacts(world, tab);
        tab.view = tab.loadOk && tab.loadSnap ? clone(tab.loadSnap) : {};
        world.log(`${s.name} signed in, load ${tab.loadOk ? 'ok' : 'FAILED'} (the app would now be on screen)`);
      };
      siteCall(tab, 'currentUser = __user; (async () => { await loadProgress(); caAdoptLocalTicks(); })().finally(() => __booted())');
    }, null, 'script');
    for (const e of s.events){
      world.at(e.t, () => {
        const tab = s.tab;
        if (!tab || !tab.alive) return;
        world.log(`${s.name} ${e.what.toUpperCase()}`);
        /* close: the tab is closed (visibilitychange, then pagehide). lid: the lid shuts and the tab never runs again
           (visibilitychange only). die: the battery dies (no event). Each kills the tab once its microtasks have run. */
        const gone = () => world.at(world.now, () => { tab.alive = false; world.killTimers(tab); world.log(`${s.name} is gone`); }, null, 'script');
        if (e.what === 'die'){ gone(); return; }
        if (e.what === 'hide' || e.what === 'close' || e.what === 'lid'){
          tab.hidden = true;
          if (e.what === 'close') tab.unloading = true;
          if (e.what === 'hide') tab.pokes.push(world.now);
          for (const fn of (tab.docL.visibilitychange || []).slice()) callSite(tab, () => fn({ type: 'visibilitychange' }));
          if (e.what === 'close') for (const fn of (tab.winL.pagehide || []).slice()) callSite(tab, () => fn({ type: 'pagehide' }));
          if (e.what !== 'hide') gone();
        } else {
          tab.hidden = false;
          for (const fn of (tab.docL.visibilitychange || []).slice()) callSite(tab, () => fn({ type: 'visibilitychange' }));
        }
      }, null, 'script');
    }
  }
  /* A phase marked offline: the browser fires 'offline' when it starts and 'online' when it ends, on every open tab of that device. */
  for (const d of sc.devices){
    let from = T0;
    for (const p of d.phases){
      if (p.phase === 'offline'){
        const fire = (type, on) => world.at(on, () => {
          d.offlineNow = type === 'offline';
          for (const t of tabs) if (t.device === d && t.alive){
            if (type === 'online') t.onlines.push(world.now);
            world.log(`${t.name} '${type}' event`);
            for (const fn of (t.winL[type] || []).slice()) callSite(t, () => fn({ type }));
          }
        }, null, 'script');
        fire('offline', from); fire('online', p.until);
      }
      from = p.until;
    }
  }
  /* The student can act only once the app is on screen (after the sign-in read settles) and while the tab shows:
     an action due earlier waits for it, 250 ms at a time; one due on a hidden or closed tab is not done. */
  const whenUp = (s, fn) => {
    const go = () => {
      if (!s.tab || !s.tab.alive || s.tab.hidden) return;
      if (!s.tab.booted){ world.at(world.now + 250, go, null, 'script'); return; }
      fn();
    };
    go();
  };
  /* The screen offers only what changes something on it: un-ticking what is not ticked, re-picking the path already
     picked, a deck score under the best, the same answer again, are not actions (R1-5). The check is made on the oracle's
     model of that tab's view; a one-try exit check that view already holds a result for offers no Start button. */
  const offered = (tab, a) => {
    a.t = world.now;
    if (a.kind === 'skill' || a.kind === 'rate'){
      const cur = getRec(tab.view, ['skills', a.key]) || 'none';
      if (a.kind === 'rate') a.result = cur === a.level ? 'none' : a.level;
      else if (a.which === 'working') a.result = cur === 'gotit' ? 'working' : cur === 'working' ? 'none' : 'working';
      else a.result = cur === 'gotit' ? 'working' : 'gotit';
      a.bump = a.kind === 'skill' && a.result === 'gotit';
    }
    if (a.kind === 'check') return !(DATA.RETAKE[a.key] === false && getRec(tab.view, ['exitChecks', a.key]));
    return effectsOf(a, DATA.CHECKS).some(e => { const v = getRec(tab.view, e.rec); return canon(e.fn(v)) !== canon(v); });
  };
  const applyView = (tab, a) => { for (const e of effectsOf(a, DATA.CHECKS)) setRec(tab.view, e.rec, e.fn(getRec(tab.view, e.rec))); };
  for (const a of sc.actions){
    const s = sc.tabs.find(x => x.name === a.tab);
    if (a.kind === 'check'){
      const t0 = a.t - 500 * (a.picks.length + 1);
      world.at(t0, () => whenUp(s, () => {
        if (!offered(s.tab, a)){ world.log(`${a.tab} (exit check ${a.key} already taken on this screen: no Start button)`); return; }
        world.log(`${a.tab} starts exit check ${a.key}`);
        siteCall(s.tab, `ecStart(${JSON.stringify(a.key)})`);
        a.picks.forEach((p, i) => world.at(world.now + 500 * (i + 1), () => { if (s.tab.alive) siteCall(s.tab, `ecPick(${JSON.stringify(a.key)}, { dataset: { pick: ${JSON.stringify(p)} } })`); }, null, 'script'));
        world.at(world.now + 500 * (a.picks.length + 1), () => { if (s.tab.alive){ a.t = world.now; a.done = true; applyView(s.tab, a); s.tab.pokes.push(world.now); world.log(`${a.tab} ${describe(a)} (submitted)`); } }, null, 'script');
      }), null, 'script');
      continue;
    }
    world.at(a.t, () => whenUp(s, () => {
      if (!offered(s.tab, a)){ world.log(`${a.tab} (${describe(a)}: changes nothing on this screen, not done)`); return; }
      a.done = true; applyView(s.tab, a); s.tab.pokes.push(world.now);
      world.log(`${a.tab} ${describe(a)}`);
      siteCall(s.tab, actionCode(a));
    }), null, 'script');
  }
  /* The settle: every open tab hidden at settleAt + 2 s (a clean point, R10). */
  world.at(sc.settleAt + 2000, () => {
    world.log('SETTLE: network up everywhere; every open tab hidden');
    for (const t of tabs) if (t.alive && !t.hidden){
      t.hidden = true; t.pokes.push(world.now);
      for (const fn of (t.docL.visibilitychange || []).slice()) callSite(t, () => fn({ type: 'visibilitychange' }));
    }
  }, null, 'script');
  await world.runUntil(sc.endAt, () => beat(`case ${idx} (${sc.fam}) at ${rel(world.now)}`));
  for (const t of tabs){ t.alive = false; }
  await world.drain();
  CURRENT_WORLD = null;
  const res = oracle(sc, world, tabs);
  return { sc, world, tabs, res };
}
function actionCode(a){
  const j = JSON.stringify;
  switch (a.kind){
    case 'step': return `onCompleteChange(${j(a.key)}, ${a.on})`;
    case 'caStep': return `onCaStepChange(${j(a.key)}, ${a.on})`;
    case 'activity': return `onClassActivityChange(${j(a.key)}, ${a.on})`;
    case 'answer': return `onResponseChange(${j(a.key)}, ${j(a.text)}, false)`;
    case 'rep': return typeof a.best === 'number' ? `logPracticeRep(${j(a.key)}, { best: ${a.best} })` : `logPracticeRep(${j(a.key)})`;
    case 'dk': return `dkSaveBest(${j(a.key)}, ${a.n})`;
    case 'streak': return 'bumpPracticeStreak()';
    case 'path': return `caPickPath(${j(a.key)}, ${j(a.pick)})`;
    case 'skill': return `toggleSkill(${j(a.key)}, ${j(a.wid)}, ${j(a.which)})`;
    case 'rate': return `setSkillLevel(${j(a.key)}, 'mr6', ${j(a.level)})`;
    case 'period': return `periodPick(${j(a.value)})`;
    case 'pr': return `onResponseChange(${j(a.key)}, ${j(a.value)}, true); onResponsePRBlur(${j(a.key)})`;
  }
  throw new Error('no code for ' + a.kind);
}

/* ─────────────────────────── main ─────────────────────────── */
async function main(){
  if (opt('list', false)){
    console.log('families:'); for (const [k, v] of Object.entries(FAMILIES)) console.log(`  ${k.padEnd(14)} ${v}`);
    console.log('fake faults (--fake-fault):'); for (const [k, v] of Object.entries(FAKE_FAULTS)) console.log(`  ${k.padEnd(22)} ${v}`);
    return 0;
  }
  if (FAKE_FAULT && !FAKE_FAULTS[FAKE_FAULT]){ console.error('save-loop: no fake fault ' + JSON.stringify(FAKE_FAULT) + ' (--list)'); return 2; }
  const famFilter = opt('family', '') ? String(opt('family')).split(',') : [];
  for (const f of famFilter) if (!FAMILIES[f]){ console.error('save-loop: no family ' + JSON.stringify(f) + ' (--list)'); return 2; }
  if (!existsSync(join(ROOT, 'index.html'))){ console.error('save-loop: ' + ROOT + ' is not a site folder (no index.html)'); return 2; }
  const t0 = Date.now();
  const self = await fakeSelfTest();
  const selfBad = self.filter(x => !x.ok);
  console.log(`save-loop: fake Firestore self-test ${self.length - selfBad.length} of ${self.length} rules hold${FAKE_FAULT ? ` (fake fault planted: ${FAKE_FAULT})` : ''}`);
  for (const x of selfBad) console.log(`  ✗ FAKE ${x.name}${x.detail ? ' — ' + x.detail : ''}`);
  if (selfBad.length){ console.log('save-loop: ✗ the fake no longer behaves like Firestore; no case was run'); return 1; }
  const single = opt('case', null);
  const N = Number(opt('cases', 180));
  const idxs = single != null ? [Number(single)] : Array.from({ length: N }, (_, i) => i);
  /* A full default run: every family, the default number of cases or more. */
  const fullRun = single == null && !famFilter.length && N >= 180;
  const knownHits = Object.fromEntries(KNOWN.map(k => [k.id, []]));
  const fams = {};
  let failed = 0, leaves = 0, tabsN = 0, actsN = 0, owed = 0, notOwed = 0, issued = 0, landed = 0, rejected = 0, lost = 0, tx = 0, txRetry = 0, knownN = 0, knownCases = 0;
  const knownKinds = {};
  const json = [];
  for (const idx of idxs){
    beat(`case ${idx}`);
    const { sc, world, tabs, res } = await runCase(BASE_SEED, idx, famFilter);
    const f = fams[sc.fam] = fams[sc.fam] || { n: 0, fail: 0 };
    f.n++;
    tabsN += tabs.length; actsN += sc.actions.filter(a => a.done).length; owed += res.owedN; notOwed += res.notOwedN; leaves += res.leaves;
    issued += world.issued; landed += world.landed.filter(w => !w.tx).length; rejected += world.rejected; lost += world.lostOnClose; tx += world.txCommits; txRetry += world.txRetries;
    if (res.known.length){ knownCases++; knownN += res.known.length; for (const k of res.known) knownKinds[k.kind] = (knownKinds[k.kind] || 0) + 1; }
    lost += world.lostUnload;
    /* KNOWN site faults (still open): a wrong value that matches an entry exactly is reported, not failed. */
    const open = [];
    for (const x of res.fails){
      const k = KNOWN.find(e => e.match(x));
      if (k){ knownHits[k.id].push(idx); console.log(`~ known, listed ${k.listed}: case ${idx} (seed ${BASE_SEED}, ${sc.fam}): ${x.msg} [${k.id}]`); }
      else open.push(x);
    }
    res.fails = open;
    if (res.fails.length){
      failed++; f.fail++;
      console.log(`✗ FAIL case ${idx} (seed ${BASE_SEED}, ${sc.fam}): ${res.fails.length} wrong value${res.fails.length > 1 ? 's' : ''}`);
      for (const x of res.fails.slice(0, 6)) console.log('    ' + x.msg);
      if (res.fails.length > 6) console.log(`    … ${res.fails.length - 6} more`);
      console.log(`    replay: node tools/save-loop.mjs --seed=${BASE_SEED} --case=${idx} --verbose${famFilter.length ? ' --family=' + famFilter.join(',') : ''}${opt('root', null) ? ' --root=' + ROOT : ''}`);
    }
    if (VERBOSE){
      console.log(`\n── case ${idx} (seed ${BASE_SEED}, family ${sc.fam}: ${FAMILIES[sc.fam]})`);
      for (const d of sc.devices) console.log(`  network ${d.name}: ` + d.phases.map(p => `${p.phase}${p.lat ? '(' + p.lat + ' ms)' : ''} until ${p.until === Infinity ? 'end' : rel(p.until)}`).join(', '));
      for (const s of sc.tabs) console.log(`  tab ${s.name} on ${s.dev.name}: opens ${rel(s.openAt)}, SDK ${s.sdkBlockedUntil ? 'blocked until ' + rel(s.sdkBlockedUntil) : 'loads in ' + s.sdkMs + ' ms'}${s.closeAt ? ', closes ' + rel(s.closeAt) : ''}`);
      console.log('  timeline:'); for (const l of world.trace) console.log('    ' + l);
      const d = world.docs.get('progress/' + USER.uid);
      console.log('  stored doc: ' + JSON.stringify(d ? d.data : null));
      for (const t of tabs) console.log(`  tab ${t.name}: load ${t.loadOk ? 'ok' : 'FAILED'}${t.unmarkedAtLoad ? ' (unmarked doc)' : ''}`);
      for (const a of sc.actions.filter(a => a.done).sort((x, y) => x.t - y.t)) console.log(`  ledger ${rel(a.t)} ${a.tab} ${describe(a)}`);
      for (const k of res.known) console.log(`  known ${k.kind}: ${k.leaf} stored ${k.stored}, expected ${k.accept.join(' or ')}${k.by ? ' (carried by tab ' + k.by + ')' : ''}`);
      console.log(`  ${res.leaves} stored values compared; ${res.owedN} owed effects, ${res.notOwedN} not owed; ${res.fails.length} wrong`);
    }
    json.push({ idx, fam: sc.fam, fails: res.fails.map(x => x.msg), known: res.known, leaves: res.leaves });
  }
  let staleKnown = 0;
  for (const k of KNOWN){
    const hits = knownHits[k.id];
    console.log(`  KNOWN ${k.id} (listed ${k.listed}): ${k.what} — matched in ${hits.length} case${hits.length === 1 ? '' : 's'}${hits.length ? ' (' + hits.slice(0, 12).join(', ') + (hits.length > 12 ? ', …' : '') + ')' : ''}`);
    if (fullRun && !hits.length){ staleKnown++; console.log(`✗ FAIL KNOWN ${k.id} matched nothing in a full run: the fault is fixed or the tool stopped reaching it; take the entry out of KNOWN`); }
  }
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  console.log(`save-loop: ${idxs.length} cases (seed ${BASE_SEED}) · ${tabsN} tabs · ${actsN} student actions (${owed} owed effects, ${notOwed} not owed) · ${issued} writes issued, ${landed} landed, ${rejected} rejected, ${lost} lost with a closed or unloading tab · ${tx} move commits (${txRetry} transaction re-runs) · ${leaves} stored values compared`);
  console.log('  by family: ' + Object.entries(fams).map(([k, v]) => `${k} ${v.n - v.fail}/${v.n}`).join(' · '));
  console.log(`  known exposures, not failed: ${knownN} values in ${knownCases} cases` + (knownN ? ' (' + Object.entries(knownKinds).map(([k, v]) => `${k}: ${v}`).join(', ') + ')' : ''));
  console.log(failed || staleKnown ? `save-loop: ✗ ${failed} of ${idxs.length} cases FAIL${staleKnown ? `, ${staleKnown} KNOWN entr${staleKnown === 1 ? 'y' : 'ies'} matched nothing` : ''}` : `save-loop: ✓ ${idxs.length} of ${idxs.length} cases pass`);
  if (opt('json', null)) writeFileSync(String(opt('json')), JSON.stringify(json, null, 1));
  /* The run time goes to stderr, so stdout is the same byte for byte for the same seed. */
  console.error(`save-loop: ${secs} s`);
  return failed || staleKnown ? 1 : 0;
}
/* KNOWN: site faults found by this tool and still open. Each matches one kind of wrong value EXACTLY; anything else
   fails, and a full default run in which an entry matches nothing fails too (so a fixed fault gets its entry removed). */
const KNOWN = [
  { id: 'K-exitcheck-mark-2026-11-12', listed: '2026-11-12',
    what: 'after a failed sign-in read, an exit check\'s done mark rides out with the next classActivities save while its score stays held back (activities-2.js:276-287 + save.js flushSave)',
    match: x => x.rule === 'R7-mark' && x.byFailed && x.scoreAsStarted },
  { id: 'K-pr-history-2026-11-12', listed: '2026-11-12',
    what: 'after a failed sign-in read, a new PR entry saves a one-entry history over the stored one (responses is not held back, and the array is replaced whole)',
    match: x => x.rule === 'R16-wiped' }
];
const watchdog = setInterval(() => {
  if (Date.now() - BEAT.at > STALL_S * 1000){ console.log(`save-loop: ✗ HUNG — no progress for ${STALL_S} s. Stuck at "${BEAT.where}"`); process.exit(3); }
}, Math.max(20, Math.min(2000, STALL_S * 500)));
watchdog.unref();
/* R12: a rejection nobody handles while a case runs is that case's fault. Anything else thrown is the TOOL crashing: exit 2. */
process.on('unhandledRejection', e => {
  const msg = 'unhandled rejection: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e));
  if (CURRENT_WORLD){ CURRENT_WORLD.faults.push(msg); return; }
  console.error('save-loop: the tool crashed (' + msg + ')'); process.exit(2);
});
process.on('uncaughtException', e => { console.error('save-loop: the tool crashed: ' + (e && e.stack || e)); process.exit(2); });
main().then(code => process.exit(code), e => { console.error('save-loop: the tool crashed: ' + (e && e.stack || e)); process.exit(2); });
