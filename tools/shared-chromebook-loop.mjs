#!/usr/bin/env node
/* shared-chromebook-loop.mjs — closed loop: two students, one Chromebook (2026-11-12).

     node tools/shared-chromebook-loop.mjs [options]

   THE QUESTION (Jonathan's two class periods share the school Chromebooks). When one student signs out of a
   Chromebook and the next signs in: does the first student's last work land in the FIRST student's record (or is
   that student told it did not save), and does the second student see nothing of the first's?

   WHEN TO RUN IT. After a change to sign-in or sign-out (app/start.js onAuthStateChanged, app/boot.js signOut /
   flushBeforeLeaving / showUnsavedNotice / devBypass / _uidKey), to the save path (app/save.js flushSave,
   queueSave, loadProgress, restoreClassConfigFromCache, the local mirrors), to anything that keeps a student's
   data in localStorage or sessionStorage (a new per-student key, a new cache), or to the unload/hide flushes
   (shell.js pagehide/online, activities-2.js flushOnHide). About 42 s for the default 120 cases (2026-11-13). Node only.

   NODE, NOT A BROWSER, and why. The leak channels on a shared Chromebook are: (1) localStorage, shared by every
   tab and every student of the device; (2) sessionStorage, per tab, which survives a reload; (3) a tab that does
   NOT reload and still holds the first student in memory; (4) Firestore writes that go out under the wrong doc
   or after the switch; (5) Firebase Auth, which is shared by every tab of the device. A Node vm world models all
   five exactly where it matters (the per-user write queue of the Firestore SDK and the cross-tab auth broadcast
   are written down as rules below and self-tested), runs a seeded schedule on a virtual clock, and can freeze a
   tab, drop the network, refuse a write or stall it at a chosen millisecond — which a real browser on a shared
   machine cannot do repeatably, and other agents hold the browser for long runs today. What a browser would add
   is real rendering; this tool reads the markup the site writes (every innerHTML / textContent) instead.

   FLAGS
     --cases=N          how many cases (default 120); family round robin, each case its own seed
     --seed=S           base seed (default 1); the same seed gives the same stdout byte for byte
     --case=I           run only case I (with --verbose: its timeline, every write, every compare)
     --family=a,b       only these families (names: --list)
     --root=DIR         a site folder to test instead of this checkout (a scratch copy with a planted fault)
     --fake-fault=NAME  break the FAKE world on purpose (names: --list); its self-test must go red
     --json=FILE        every case's result
     --stall=SEC        watchdog: no progress for SEC seconds (default 120) -> prints where it was, exit 3 (a site
                        script that never yields: a watchdog thread prints where after SEC+15 s and kills, 137)
     --verbose          the timeline of each case run
     --list             the families and the fake faults
   Exit 0 = every case held (KNOWN entries excepted, see const KNOWN); 1 = a case failed, the fake failed its
   self-test, or a full default run matched nothing for a KNOWN entry; 2 = bad arguments or the tool
   crashed; 3 = watchdog. stdout is identical for the same seed and site; the run time goes to stderr.

   WHAT IS REAL. The site's own scripts, unmodified, each page its own Node vm context, in index.html's order:
   firebase-config.js (its config goes only to the fake initializeApp; TEACHER_EMAIL is read from it),
   config-main.js, class-activities.js, i18n.js, guitar-diagrams.js, every module-N.js, every app/*.js part
   (tools/site-src.mjs siteParts), practice-minutes-config.js, practice-minutes.js, fab-tools.js, tuner.js,
   live-quiz.js. The console parts (teacher-*.js) and the arcade parts (coach-*.js) load when the site appends
   their <script> (ensureTeacherJs / ensureCoachJs), as in the browser. Sign-in is the site's own signIn() button
   handler and its onAuthStateChanged callback (app/start.js) in full: loadProgress, caAdoptLocalTicks,
   loadClassConfig, showApp (renderAll and the rest) or showTeacherApp. Sign-out is the site's signOut() (the
   header button). The student acts through the site's own entry points: onCompleteChange (tick / un-tick),
   onResponseChange (an answer; a PR tempo with onResponsePRBlur), logPracticeRep (a rep), ecStart + ecPick (an exit
   check, which submits itself), caPickPath (a path pick), caToggleComplete (a card marked complete), dkSaveBest (a
   deck best: sessionStorage + games), setLang (the language). A hidden tab fires the site's visibilitychange
   listeners (flushOnHide), a reload its pagehide listeners, a reconnect its 'online' listeners. The practice-minutes
   engine counts on its own 1 s tick from pointer events the tool dispatches to the page's own listeners.

   WHAT IS FAKE (each rule is self-tested before the cases run; --fake-fault breaks one and the run must go red).
   - A virtual clock (Date, performance.now, setTimeout/setInterval) per world; TZ America/Los_Angeles; seeded
     Math.random per page.
   - The device: ONE localStorage shared by every page of the Chromebook (D1); one sessionStorage per TAB that a
     reload keeps (D2: the HTML spec's "session storage is per browsing context and survives navigation"; a new
     tab starts empty). A reload (location.reload()) fires the page's visibilitychange (hidden) and pagehide
     listeners, then the page dies: its timers never fire, its unsent writes are lost (D3), and a write it
     starts while unloading never leaves the browser (D4: the site's own comment, app/start.js, "pagehide's flush
     is a Firestore write started during unload and is not reliably delivered": the tool takes the worst case).
     The new page loads 300 ms later and its auth callback fires once Firebase has restored the session.
   - Firebase Auth, per device (A1-A4): the signed-in user is shared by every tab (A1: browserLocalPersistence,
     the web default); a sign-in or sign-out is delivered to the tab that made it at once and to every other tab
     20-300 ms later (A2: the Firebase SDK runs the listeners of the tab that called signOut() / signInWithPopup()
     before that call's promise settles), in order — a FROZEN tab (a scenario option: a background tab the browser
     froze) runs nothing while frozen (no timer, no network answer) and receives only the LATEST state when it
     thaws (A3); onAuthStateChanged fires on registration with the
     restored user and afterwards only when the user changes (A4). signInWithPopup takes 1.5-3 s; signOut 20-80 ms.
   - Firestore (F1-F9), one server per world and one client per page:
       F1 set(…,{merge:true}) merges maps key by key; an EMPTY map replaces; FieldValue.delete() removes a key;
          increment() adds; arrays and scalars replace (Firestore's documented merge).
       F2 Writes are queued PER SIGNED-IN USER (the JS SDK's mutation queue is per user: on a credential change it
          "re-fills the write pipeline with new mutations from the LocalStore (since mutations are per-user)").
          A write is stamped with the user the client had when the site called set(); it is SENT only while that
          user is the client's current user, with that user's token. A queued write of a user who is no longer
          current waits in memory and dies with the page (no enablePersistence on this site).
       F3 One client's writes land in the order they were issued.
       F4 Offline (or stalled), set() does not fail: it waits for the connection; get() fails ("client is
          offline") at once offline, after 10 s on a stall. A REFUSED phase makes the server refuse writes and
          reads after 200-800 ms (nothing applied): set() rejects only there.
       F5 A write already sent lands even if its page then dies (the server has it); its promise is never settled
          in a dead page.
       F6 The security rules (firestore.rules, quoted): progress/{uid} "allow read, write: if isSignedIn() &&
          request.auth.uid == userId; allow read: if isTeacher()"; config/class "allow read: if isSignedIn()";
          minutes/{uid}/... owner only. A write or read the rules refuse rejects with permission-denied.
       F7 runTransaction re-reads and re-runs on a changed document (5 attempts) and fails offline.
       F8 onSnapshot (the live-quiz listener) answers once with the current doc, then on each change.
       F9 The practice-minutes keepalive fetch (a REST commit at pagehide) carries the ID token cached for the
          student it names and is delivered (keepalive is the browser's promise); the rules check that token.
   - The network, per device, as phases: up (40-400 ms a round trip), slow (2-6 s), stall (hangs until the phase
     ends), offline ('offline'/'online' events fire on every open tab at the phase ends), refused.
   - The DOM: a stub. Every getElementById gives the same element per id; querySelectorAll('.save-ind') gives one
     per page (the save indicator, whose i18n key is recorded); body.appendChild records #unsaved-notice and its
     "Sign out anyway" button; every innerHTML / textContent written is scanned for the other student's markers.
     Audio: Audio elements, a Proxy AudioContext whose nodes record start/stop/close, getUserMedia tracks that
     record stop() — so a page's sound and mic are visible to the checks.
   - People (all made up): two students, Ama Testwell and Bo Fakeley (@example.test, uids stu-ama / stu-bo, a third
     returning student stu-cy) and the teacher's account, whose email is read from the site's own TEACHER_EMAIL
     (never written in this file). Each student's doc and device keys carry MARKERS: strings only that student's
     history holds (a typed answer, a note under a key only they have, the display name, the email).

   PER-DEVICE OR PER-STUDENT (read from the code and its comments; the per-student ones are tested, the per-device
   ones are allowed to carry over from one student to the next).
     Per DEVICE on purpose (a setting of the Chromebook, not of a student):
       gc-lang (i18n.js reads it at script load, before anyone signs in: the sign-in wall is drawn in it);
       stationView (lesson.js), railCollapsed (audio-ui.js "Remembered per browser"), pcCounts (cards.js),
       caChordModes / caKeyModes / caRecordingModes / caBassModes (activities.js: "a per-viewer convenience",
       "per viewer in localStorage"), ncCoach / ncAnswer / ncSharps / pwnAnswer (drills-call.js), the BPM slider
       keys (audio-ui.js), nrMicOffset (coach-runner.js: "a per-device mic-latency offset"), micRecSaved
       (coach-core.js: take ids "Remembered on this device"), pm:wg (practice-minutes.js: "class data, not a
       student's: one key for everyone on the device"), the class-config caches caDates / caClears / caRetired /
       caHidden / caOptional / caPlayAlong / caSongLib / caClassSongs / caPins / caBoard (save.js: whole-class
       fields), the console's own preferences (gc-teacher-*, teacherSideTree, gc-lq-limits, gc-lq-autoreveal).
     Per STUDENT (must never reach the next student):
       keys named with the uid: practiceLog:<uid>, gc-lastModule:<uid>, gc-lastSet:<uid>, gc-srPicks:<uid>,
       caStepsToday:<uid> (legacy), micRecConsent:<uid> (coach-core.js: "keyed by uid so the next student on a
       shared Chromebook is asked for themselves"), pm:q:<uid>:<page>, pm:c|t|t5|b|w:<uid>, hif:v1:<uid>;
       values that carry the uid: caPeriodOverride, caOpenThrough, caForMe (save.js: "the cache carries the uid");
       every sessionStorage key (boot.js signOut: "every sessionStorage best ... Reloading clears the lot";
       live-quiz.js lq-q-opened carries the uid too).

   THE EXPECTED ANSWER (the "oracle" section). It never calls a function of the code under test: it reads the
   scenario's ledger of what each person did and when, facts of the fake world (the server's docs, every write the
   server saw with the token it carried, which pages lived when, what each page drew), and these rules:
     R1 A student's action lands in that student's doc, UNLESS the student was told it did not save: the
        #unsaved-notice appeared on that page after the action (boot.js signOut: "Say so and stay signed in"), or
        the page's save indicator said 'save.notSaving' after it (queueSave's held-back categories after a failed
        load). An action the student was told about may be in the doc or not. Effects (as save-loop.mjs words
        them): a tick sets completed[key] true, an un-tick removes it; an answer replaces responses[key]; a PR
        tempo appends {value, date} to the history (last 8); a rep adds 1 to practiceLog[skill].reps and keeps the
        larger best; an exit check files {score, total, picks, at, attempts} and marks the activity done (both or
        neither, activities-2.js "hold both or neither"); a path pick leaves exactly one `<id>:path:<key>` tick; a
        card marked complete sets classActivities[id] true; a deck best keeps the larger number in games.dk.
     R2 Nothing else changes in a student's doc: every leaf of the final doc is the seeded leaf or one an action of
        THAT student produced (name, email, migrations, lastModule and lastSet excepted: the place is saved by
        navigation the tool does not model; games.meta and games.srBonusDay excepted in the doc of a student who
        acted on the device: the XP layer's once-a-day bonus follows from that student's own reps).
     R3 No write to progress/X or minutes/X LANDED under another student's token, and no write the server saw (landed
        or refused) carried another student's marker. (So nothing of A's is ever written under B's uid.) A write the
        rules REFUSED because it went out under the wrong sign-in is counted and printed, not failed: nothing was
        written (the work it carried is judged by R1).
     R4 The first screen of a student (the moment showApp has run): the in-memory state the screens draw from is
        that student's own — completed, responses, caStepDone, classActivities, exitChecks, games, streak,
        practiceLog, songReady, studentPeriod equal what that student's doc holds (or {} / '' for no doc or a
        failed read; practiceLog falls back to THAT student's own device copy, save.js loadProgress), lastSetId is
        never the previous student's set, periodOverride / moduleOpenThrough / activityForMe / gamesAccessOn are the
        config's answer for THIS uid (or the defaults '' / 0 / none / on when the read failed and the cache belongs
        to someone else — KNOWN K1 of tools/visible-loop.mjs is the other half of that rule and is not rebuilt
        here), no top-level variable of the page and no markup it wrote holds another student's marker, the tab's
        sessionStorage holds no key the previous student's session wrote, and the page never read a localStorage
        key named with another student's uid.
     R5 Every page whose sign-in callback ran for a student is gone (reloaded) within 3 s of that student leaving the
        device's sign-in (boot.js: "Sign-out on a shared Chromebook has to be a hard reset, not a state reset"), or the
        student is still signed in with the not-saved notice on screen; so no page ever shows the next student or the
        wall with the previous student's sound playing or mic open (a page's mic tracks are also checked at every
        first screen).
     R6 Practice minutes: no seconds are added to minutes/B, and no seconds are queued under a pm:q:B key, while B
        made no input (only A gets input or sound from the tool). Every OTHER localStorage key named with a uid is
        written or removed only by a page whose own currentUser is that student (A's dying page may still tidy A's
        keys after the device signed B in). The pm:* keys follow Firebase's user by design (boot.js PM_HOST.user
        reads auth.currentUser), so for them only the seconds are judged.
     R7 Nothing the site runs throws, and no promise is left rejected with nobody to handle it.

   THE FAMILIES (--list): last-action (A's last action of 8 kinds right before Sign out, network up / slow /
   refused once / offline / stalled; the student who sees the not-saved notice either takes "Sign out anyway" or
   waits for the network and tries again), first-screen (A works a whole session, then B — returning, new, or with
   a failed progress read — and B's first screen is read; B is also asked the mic question, or not), two-tabs (A in
   two tabs signs out from the other one; the first tab may be frozen and wake to B straight over A), round-trip
   (A-B-A, A-A), teacher (the teacher's account after and before a student, on the student page: see NOT
   MODELLED for the console), playing (Sign out with a note playing and the mic open), failed-reads (B's progress and/or config
   read refused, offline, or empty right after A), mix (seeded picks of the others). A live quiz is running in
   every case, so each tab a student used holds that student's lq-q-opened session key.

   BREAK-IT RECORD (2026-11-12; scratch copies given with --root, each one red): no flush before Sign out (R1); no
   not-saved notice (R1); Sign out resets state instead of reloading (R5, mic still open); Sign out keeps
   sessionStorage (R4 lq-q-opened); the signed-out-elsewhere branch does not reload (R5); the swap branch adopts B
   without a reload (R4 + R5 + R6); _uidKey unscoped (R4 practiceLog, R1 legacy ticks); the cached period override
   restored for any uid (R4); the mic-recording answer per device (R4 mic question); practice minutes adopting any
   student's queue (R4 localStorage read); the Who-card cache read as anyone's (R4). Fake faults (--fake-fault, each
   turns the self-test red and no case runs): auth-not-shared, token-of-current-user, queue-survives-reload,
   session-cleared-on-reload, storage-per-tab, rules-open, frozen-sees-all.

   NOT MODELLED. The teacher console page (?teacher): in the stub DOM its activity list's async painter never
   settles (it queries the markup it just wrote), so the teacher is modelled on the student page only; the console's
   own data rules are tools/visible-loop.mjs's and tools/two-consoles-loop.mjs's. Real rendering and layout (markup
   strings are scanned, not drawn); the service worker and the
   update reload; enablePersistence; two devices (save-loop.mjs covers them); the Song Journey pages (tabs/*.html:
   their own save, journey.js); a live-quiz ANSWER write (the listener and its session key are covered); the exact
   minutes arithmetic (tools/pm-sim.mjs, its "student switch" sections); the per-student class-config rules
   (tools/visible-loop.mjs, including its KNOWN K1: a failed config read after another student signed in loses a
   student's own period override / Open through); the Firestore cache's latency compensation on get(); clock skew.

   Reading a FAIL line: case index, family, rule, what was found, what the rule wanted, and the replay command. */
import vm from 'node:vm';
import { Worker } from 'node:worker_threads';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteParts } from './site-src.mjs';

process.env.TZ = 'America/Los_Angeles';
const HERE = dirname(fileURLToPath(import.meta.url));

/* ─────────────────────────── arguments ─────────────────────────── */
const ARGV = process.argv.slice(2);
const opt = (k, d) => { const a = ARGV.find(x => x === '--' + k || x.startsWith('--' + k + '=')); if (!a) return d; return a.includes('=') ? a.slice(a.indexOf('=') + 1) : true; };
const argFail = msg => { console.error('shared-chromebook-loop: ' + msg + ' (see the header of tools/shared-chromebook-loop.mjs)'); process.exit(2); };
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
  if (st != null && !(/^\d+(\.\d+)?$/.test(st) && Number(st) > 0)) argFail('--stall must be a number of seconds above 0');
  if (opt('case', null) != null && Number(opt('case')) >= Number(opt('cases', 120))) argFail(`--case=${opt('case')} is not below --cases=${opt('cases', 120)}`);
  if (opt('root', null) != null && !existsSync(resolve(opt('root')))) argFail('--root: no such folder ' + JSON.stringify(opt('root')));
}
const ROOT = resolve(opt('root', join(HERE, '..')));
const VERBOSE = !!opt('verbose', false);
const FAKE_FAULT = opt('fake-fault', '') || '';
const BASE_SEED = Number(opt('seed', 1));
const STALL_S = Number(opt('stall', 120));
const STREAM = VERBOSE && opt('case', null) != null;
let CURRENT_WORLD = null;
process.on('unhandledRejection', e => {
  const msg = 'unhandled rejection: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e));
  if (CURRENT_WORLD){ CURRENT_WORLD.siteFaults.push(msg); return; }
  console.error('shared-chromebook-loop: the tool crashed (' + msg + ')'); process.exit(2);
});
process.on('uncaughtException', e => { console.error('shared-chromebook-loop: the tool crashed: ' + (e && e.stack || e)); process.exit(2); });

/* ─────────────────────────── watchdog ─────────────────────────── */
/* Two halves. The timer below exits 3 when no step has started for --stall seconds. A site script that never
   gives the event loop back (a promise chain that re-schedules itself forever) starves that timer too, so a
   worker thread watches the same heartbeat through shared memory: it prints where the run was and kills the
   process (exit code 137 then, not 3 — a thread cannot end the process any other way while the main thread spins). */
const BEAT_MEM = new Int32Array(new SharedArrayBuffer(8 + 4 * 512));
let LAST_BEAT = Date.now(), BEAT_WHERE = 'starting';
const beat = where => {
  LAST_BEAT = Date.now(); BEAT_WHERE = where;
  Atomics.store(BEAT_MEM, 0, Math.floor(LAST_BEAT / 1000) % 2147483647);
  const w = String(where).slice(0, 500);
  Atomics.store(BEAT_MEM, 1, w.length);
  for (let i = 0; i < w.length; i++) BEAT_MEM[2 + i] = w.charCodeAt(i);
};
beat('starting');
const WATCHDOG = setInterval(() => {
  if (Date.now() - LAST_BEAT > STALL_S * 1000){
    console.log(`shared-chromebook-loop: ✗ HUNG — no progress for ${STALL_S} s. Stuck at "${BEAT_WHERE}"`);
    process.exit(3);
  }
}, 1000);
WATCHDOG.unref();
{
  const w = new Worker(`
    const { workerData } = require('node:worker_threads');
    const { writeSync } = require('node:fs');
    const m = workerData.mem, limit = workerData.stall + 15;
    setInterval(() => {
      const last = Atomics.load(m, 0), now = Math.floor(Date.now() / 1000) % 2147483647;
      if (now - last <= limit) return;
      let where = ''; const n = Atomics.load(m, 1);
      for (let i = 0; i < n; i++) where += String.fromCharCode(m[2 + i]);
      writeSync(1, 'shared-chromebook-loop: \u2717 HUNG — the main thread has not come back for ' + limit + ' s (a script that never yields). Stuck at "' + where + '"\\n');
      process.kill(process.pid, 'SIGKILL');
    }, 1000);`, { eval: true, workerData: { mem: BEAT_MEM, stall: STALL_S } });
  w.unref();
}

/* ─────────────────────────── seeded random ─────────────────────────── */
function rng(seed){
  let a = seed >>> 0;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const mix = (a, b) => (Math.imul(a ^ 0x9E3779B9, 0x85EBCA6B) ^ Math.imul(b + 0x7F4A7C15, 0xC2B2AE35)) >>> 0;

/* ─────────────────────────── values and merge (F1) ─────────────────────────── */
const T0 = Date.UTC(2026, 10, 12, 17, 5, 0);
const DAY = 86400000;
class FieldDelete { toString(){ return '<delete>'; } }
class FieldIncrement { constructor(n){ this.n = Number(n) || 0; } }
class FieldServerTs {}
class FieldPathDocId {}
const DELETE = new FieldDelete();
const isMap = v => !!v && typeof v === 'object' && !Array.isArray(v) && !(v instanceof FieldDelete) && !(v instanceof FieldIncrement) && !(v instanceof FieldServerTs);
function clone(v){
  if (v instanceof FieldDelete || v instanceof FieldIncrement || v instanceof FieldServerTs) return v;
  if (Array.isArray(v)) return v.map(clone);
  if (v && typeof v === 'object'){
    if (v.__blob) return { __blob: true, n: v.n };
    const o = {}; for (const k of Object.keys(v)) o[k] = clone(v[k]); return o;
  }
  return v;
}
function validate(v, path){
  if (v === undefined) throw Object.assign(new Error(`Unsupported field value: undefined (found in field ${path})`), { code: 'invalid-argument' });
  if (typeof v === 'function') throw Object.assign(new Error(`Unsupported field value: a function (found in field ${path})`), { code: 'invalid-argument' });
  if (Array.isArray(v)) v.forEach((x, i) => validate(x, path + '.' + i));
  else if (isMap(v) && !v.__blob) for (const k of Object.keys(v)) validate(v[k], path ? path + '.' + k : k);
}
function mergeInto(target, data){
  for (const k of Object.keys(data)){
    const v = data[k];
    if (v instanceof FieldDelete){ delete target[k]; continue; }
    if (v instanceof FieldIncrement){ target[k] = (typeof target[k] === 'number' ? target[k] : 0) + v.n; continue; }
    if (v instanceof FieldServerTs){ target[k] = CURRENT_WORLD ? CURRENT_WORLD.now : 0; continue; }
    if (isMap(v) && !v.__blob){
      if (!Object.keys(v).length){ target[k] = {}; continue; }
      if (!isMap(target[k])) target[k] = {};
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
    else if (v instanceof FieldIncrement) o[last] = (typeof o[last] === 'number' ? o[last] : 0) + v.n;
    else if (v instanceof FieldServerTs) o[last] = CURRENT_WORLD ? CURRENT_WORLD.now : 0;
    else o[last] = clone(v);
  }
}
const canon = v => {
  if (v === undefined) return '∅';
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  if (v && typeof v === 'object') return '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
  return JSON.stringify(v);
};

/* ─────────────────────────── the fake world ─────────────────────────── */
const FAKE_FAULTS = {
  'auth-not-shared': 'a sign-in or sign-out reaches only the tab that made it (breaks A1/A2)',
  'token-of-current-user': 'a queued write is sent with whoever is signed in when it goes out, not its own user (breaks F2)',
  'queue-survives-reload': 'a page\'s unsent writes are still sent after it reloaded (breaks D3)',
  'session-cleared-on-reload': 'a reload empties the tab\'s sessionStorage (breaks D2)',
  'storage-per-tab': 'each tab gets its own localStorage (breaks D1)',
  'rules-open': 'the server accepts a write to progress/X from any signed-in user (breaks F6)',
  'frozen-sees-all': 'a frozen tab, when it thaws, receives every auth change it missed instead of the latest (breaks A3)'
};
class World {
  constructor(seed){
    this.now = T0; this.seq = 0; this.events = [];
    this.docs = new Map();
    this.r = rng(seed);
    this.writes = [];
    this.siteFaults = [];
    this.trace = [];
    this.stats = { issued: 0, landed: 0, refusedByRules: 0, refusedByServer: 0, lostWithPage: 0, lostUnload: 0, reads: 0, readsFailed: 0, pages: 0, reloads: 0 };
  }
  /* With --case and --verbose the timeline streams as it happens (a slow or stuck case shows where it is). */
  log(s){ if (!VERBOSE) return; const line = `${((this.now - T0) / 1000).toFixed(3).padStart(9)}s  ${s}`; if (STREAM) console.log('  ' + line); else this.trace.push(line); }
  at(t, fn, owner, kind){ const e = { at: Math.max(t, this.now), id: ++this.seq, fn, owner, kind }; this.events.push(e); return e.id; }
  cancel(id){ const i = this.events.findIndex(e => e.id === id); if (i >= 0) this.events.splice(i, 1); }
  killOwner(owner){ this.events = this.events.filter(e => !(e.owner === owner && e.kind === 'timer')); }
  async drain(){ for (let i = 0; i < 4; i++) await new Promise(r => setImmediate(r)); }
  async runUntil(T, label){
    let guard = 0;
    for (;;){
      await this.drain();
      let best = null;
      for (const e of this.events) if (e.at <= T && (!best || e.at < best.at || (e.at === best.at && e.id < best.id))) best = e;
      if (!best) break;
      this.events.splice(this.events.indexOf(best), 1);
      /* A frozen tab runs nothing — timers, network answers — until it thaws (A3's other half). */
      const fz = best.owner && best.owner.tab && best.owner.tab.frozenUntil;
      if (fz && fz > best.at){ best.at = fz; best.deferred = true; this.events.push(best); continue; }
      this.now = best.at;
      best.fn();
      if (++guard > 400000) throw new Error('more than 400000 events: something reschedules itself forever');
      if ((guard & 255) === 0) beat(label + ' at ' + rel(this.now));
    }
    this.now = Math.max(this.now, T);
    await this.drain();
  }
  sleep(ms){ return new Promise(r => this.at(this.now + ms, r, null, 'script')); }
  async waitFor(pred, maxMs, step){
    const until = this.now + maxMs;
    while (this.now < until){ if (pred()) return true; await this.sleep(step || 100); }
    return !!pred();
  }
}
const rel = t => ((t - T0) / 1000).toFixed(2) + 's';

/* D1: every page of the device gets the device's localStorage. */
function localStorageFor(tab){ return FAKE_FAULT === 'storage-per-tab' ? (tab.ownLocal || (tab.ownLocal = storage('own'))) : tab.device.localStorage; }
/* A device: the shared localStorage (D1), Firebase Auth (A1-A4), the network phases. */
function storage(name, onAccess){
  return {
    _d: {}, _name: name,
    getItem(k){ k = String(k); if (onAccess) onAccess('get', k); return Object.prototype.hasOwnProperty.call(this._d, k) ? this._d[k] : null; },
    setItem(k, v){ k = String(k); if (onAccess) onAccess('set', k, String(v)); this._d[k] = String(v); },
    removeItem(k){ k = String(k); if (onAccess) onAccess('remove', k); delete this._d[k]; },
    clear(){ if (onAccess) onAccess('clear', ''); this._d = {}; },
    key(i){ return Object.keys(this._d)[i] ?? null; },
    get length(){ return Object.keys(this._d).length; }
  };
}
function makeDevice(world, phases){
  const dev = { name: 'chromebook', phases: phases || [], tabs: [], authUser: null, pendingSignIn: null, offlineNow: false, accessLog: [] };
  /* Every access to the shared localStorage, with the page that made it and who that page had signed in. */
  /* Every access to the shared localStorage, with the page that made it, who the device has signed in, and — for a
     key named with a person's uid — whom that page's own code has signed in (its currentUser). */
  const uids = Object.values(world.people || {}).map(P => P.uid);
  dev.localStorage = storage('localStorage', (op, k, v) => {
    const p = dev.accessing;
    const named = uids.some(u => k.includes(u));
    dev.accessLog.push({ at: world.now, op, k, v, page: p ? p.id : null, siteUid: named && p && p.alive ? p.siteUid() : undefined, authUid: dev.authUser ? dev.authUser.uid : null });
  });
  dev.phaseAt = t => { for (const p of dev.phases) if (t >= p.from && t < p.until) return p; return { phase: 'up', until: Infinity }; };
  return dev;
}
/* A network window on the device, starting now. Offline fires the browser's 'offline' / 'online' events on every
   open tab at its ends. */
function netWindow(world, dev, phase, ms, lat){
  const w = { phase, from: world.now, until: world.now + ms, lat };
  dev.phases.push(w);
  world.log(`network: ${phase}${lat ? ' (' + lat + ' ms)' : ''} for ${(ms / 1000).toFixed(1)} s`);
  if (phase === 'offline'){
    const fire = type => {
      dev.offlineNow = type === 'offline';
      for (const tab of dev.tabs){ const p = tab.page; if (!p || !p.alive) continue; for (const fn of (p.winL[type] || []).slice()) callSite(p, () => fn({ type })); }
    };
    fire('offline');
    world.at(w.until, () => fire('online'), null, 'script');
  }
  return w;
}
function fbUser(person){
  if (!person) return null;
  return { uid: person.uid, displayName: person.name, email: person.email, photoURL: null, emailVerified: true,
    getIdToken(){ return Promise.resolve('tok:' + person.uid); } };
}

/* ─────────────────────────── Firestore: the server (F1, F6) ─────────────────────────── */
function ruleAllows(world, op, path, token){
  const seg = path.split('/');
  const uid = token ? token.uid : null;
  const teacher = !!(token && token.email && token.email === world.teacherEmail);
  if (!token) return false;
  if (seg[0] === 'progress'){
    if (FAKE_FAULT === 'rules-open' && op === 'write') return true;
    return seg[1] === uid || (op === 'read' && teacher);
  }
  if (seg[0] === 'config') return op === 'read' || teacher;
  if (seg[0] === 'minutes') return seg[1] === uid || (op === 'read' && teacher);
  return true;
}
function snapOf(world, path){
  const d = world.docs.get(path);
  return { exists: !!d, id: path.split('/').pop(), ref: null, data: () => (d ? clone(d.data) : undefined), get: f => (d ? clone(d.data[f]) : undefined) };
}
function applyOp(world, op){
  for (const w of op.items){
    let d = world.docs.get(w.path);
    if (w.kind === 'update'){
      if (!d) throw Object.assign(new Error('No document to update: ' + w.path), { code: 'not-found' });
      applyUpdate(d.data, w.data);
    } else if (w.kind === 'delete'){
      world.docs.delete(w.path); continue;
    } else {
      if (!d){ d = { data: {}, version: 0 }; world.docs.set(w.path, d); }
      if (!w.merge) d.data = {};
      mergeInto(d.data, w.data);
    }
    d.version++;
  }
}

/* ─────────────────────────── Firestore: one client per page (F2-F5, F7, F8) ─────────────────────────── */
function makeClient(world, page){
  const dev = page.tab.device;
  const client = { user: null, queues: new Map(), lastLandAt: 0, armed: false, listeners: [] };
  const userKey = u => (u ? u.uid : '');
  client.setUser = u => {
    client.user = u ? { uid: u.uid, email: u.email } : null;
    if (FAKE_FAULT === 'token-of-current-user'){
      for (const [k, q] of client.queues) if (k !== userKey(client.user)){ client.queues.delete(k); const mine = client.queues.get(userKey(client.user)) || []; client.queues.set(userKey(client.user), mine.concat(q)); }
    }
    pump();
  };
  const latency = ph => ph.phase === 'slow' ? (ph.lat || Math.round(2000 + 4000 * world.r())) : Math.round(40 + 360 * world.r());
  function pump(){
    if (!page.alive && FAKE_FAULT !== 'queue-survives-reload') return;
    const key = userKey(client.user);
    const q = client.queues.get(key);
    if (!q || !q.length) return;
    const ph = dev.phaseAt(world.now);
    if (ph.phase === 'offline' || ph.phase === 'stall'){
      if (!client.armed){ client.armed = true; world.at(ph.until, () => { client.armed = false; pump(); }, null, 'net'); }
      return;
    }
    while (q.length) send(q.shift(), ph);
  }
  function send(op, ph){
    const token = FAKE_FAULT === 'token-of-current-user' ? client.user : op.owner;
    op.sentAt = world.now; op.token = token;
    const rec = { at: null, page: page.id, tab: page.tab.name, issuedAt: op.issuedAt, sentAt: world.now, token: token ? token.uid : null, items: op.items.map(w => ({ path: w.path, kind: w.kind, data: clone(w.data) })), ok: null, why: '' };
    world.writes.push(rec);
    if (ph.phase === 'refused'){
      world.at(world.now + Math.round(200 + 600 * world.r()), () => {
        rec.at = world.now; rec.ok = false; rec.why = 'refused by the server'; world.stats.refusedByServer++;
        world.log(`${page.id} write REFUSED by the server: ${summarize(op)}`);
        if (page.alive) op.reject(Object.assign(new Error('The service is currently unavailable.'), { code: 'unavailable' }));
      }, null, 'net');
      return;
    }
    let at = Math.max(world.now + latency(ph), client.lastLandAt);
    client.lastLandAt = at;
    world.at(at, () => {
      rec.at = world.now;
      const denied = op.items.find(w => !ruleAllows(world, 'write', w.path, token));
      if (denied){
        rec.ok = false; rec.why = 'permission-denied'; world.stats.refusedByRules++;
        world.log(`${page.id} write DENIED by the rules (${denied.path} under ${token ? token.uid : 'nobody'})`);
        if (page.alive) op.reject(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' }));
        return;
      }
      try { applyOp(world, op); } catch (e){ rec.ok = false; rec.why = e.message; if (page.alive) op.reject(e); return; }
      rec.ok = true; world.stats.landed++;
      world.log(`${page.id} write LANDED under ${token ? token.uid : '-'}: ${summarize(op)}`);
      for (const l of world.snapListeners) if (l.page.alive && op.items.some(w => w.path === l.path)) l.fire();
      if (page.alive) op.resolve();
    }, null, 'net');
  }
  function issue(items){
    for (const w of items) if (w.kind !== 'delete') validate(w.data, '');
    world.stats.issued++;
    const op = { items: items.map(w => ({ path: w.path, kind: w.kind, merge: !!w.merge, data: clone(w.data) })), owner: client.user, issuedAt: world.now };
    const p = new Promise((res, rej) => { op.resolve = res; op.reject = rej; });
    if (page.unloading){
      world.stats.lostUnload++;
      world.log(`${page.id} write started while unloading: NOT DELIVERED (D4): ${summarize(op)}`);
      page.lostOps.push(op);
      return new Promise(() => {});
    }
    const k = userKey(op.owner);
    if (!client.queues.has(k)) client.queues.set(k, []);
    client.queues.get(k).push(op);
    world.log(`${page.id} write issued under ${op.owner ? op.owner.uid : '-'}: ${summarize(op)}`);
    pump();
    return p;
  }
  client.dropUnsent = () => {
    if (FAKE_FAULT === 'queue-survives-reload') return;
    for (const q of client.queues.values()) for (const op of q){ world.stats.lostWithPage++; page.lostOps.push(op); world.log(`${page.id} unsent write LOST with the page: ${summarize(op)}`); }
    client.queues.clear();
  };
  /* A read: offline fails at once, a stall after 10 s (or at the reconnect, if sooner), refused fails; the rules
     are checked with the client's user at the time of the call. */
  function readTrip(){
    const ph = dev.phaseAt(world.now);
    if (ph.phase === 'offline') return { ok: false, at: world.now + Math.round(200 + 600 * world.r()) };
    if (ph.phase === 'refused') return { ok: false, at: world.now + Math.round(200 + 600 * world.r()) };
    if (ph.phase === 'stall') return ph.until - world.now > 10000 ? { ok: false, at: world.now + 10000 } : { ok: true, at: ph.until + 100 };
    return { ok: true, at: world.now + latency(ph) };
  }
  const read = (path, fn) => new Promise((res, rej) => {
    const tr = readTrip(), who = client.user;
    /* A scenario can make the server refuse reads of one path for a while (a failed progress or config read). */
    if (tr.ok && (world.readFails || []).some(f => path.startsWith(f.prefix) && world.now >= f.from && world.now < f.until)) tr.ok = false;
    world.stats.reads++;
    world.at(tr.at, () => {
      if (!page.alive) return;
      (page.reads[path] = page.reads[path] || []).push({ at: world.now, ok: tr.ok && ruleAllows(world, 'read', path, who), exists: world.docs.has(path), data: world.docs.has(path) ? clone(world.docs.get(path).data) : null });
      if (!tr.ok){ world.stats.readsFailed++; world.log(`${page.id} read ${path}: FAILED (network)`); rej(Object.assign(new Error('Failed to get document because the client is offline.'), { code: 'unavailable' })); return; }
      if (!ruleAllows(world, 'read', path, who)){ world.stats.readsFailed++; world.log(`${page.id} read ${path}: DENIED`); rej(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' })); return; }
      world.log(`${page.id} read ${path}: ${world.docs.has(path) ? 'ok' : 'no doc'}`);
      res(fn());
    }, page, 'net');
  });
  const querySnap = (docs) => ({ docs, size: docs.length, empty: !docs.length, forEach(f){ docs.forEach(f); } });
  function queryRef(path, filters){
    const run = () => {
      const pre = path + '/';
      const out = [];
      for (const [p] of [...world.docs].sort((a, b) => (a[0] < b[0] ? -1 : 1))){
        if (!p.startsWith(pre) || p.slice(pre.length).includes('/')) continue;
        const s = snapOf(world, p); s.ref = docRef(p);
        const ok = filters.every(f => {
          const v = f.field instanceof FieldPathDocId ? s.id : (s.data() || {})[f.field];
          if (f.op === '==') return v === f.val;
          if (f.op === '>=') return v >= f.val;
          if (f.op === '<=') return v <= f.val;
          return true;
        });
        if (ok) out.push(s);
      }
      return querySnap(out);
    };
    return {
      where(field, op, val){ return queryRef(path, filters.concat([{ field, op, val }])); },
      orderBy(){ return this; }, limit(){ return this; },
      get(){ return read(path, run); },
      doc(id){ return docRef(path + '/' + id); },
      onSnapshot(next){ next(run()); return () => {}; }
    };
  }
  function docRef(path){
    return {
      path, id: path.split('/').pop(),
      get(){ return read(path, () => { const s = snapOf(world, path); s.ref = docRef(path); return s; }); },
      set(data, o){ return issue([{ path, kind: 'set', merge: !!(o && o.merge), data }]); },
      update(data){ return issue([{ path, kind: 'update', data }]); },
      delete(){ return issue([{ path, kind: 'delete', data: null }]); },
      collection(c){ return queryRef(path + '/' + c, []); },
      onSnapshot(next, err){
        const l = { page, path, fire: () => { if (page.alive) callSite(page, () => next(snapOf(world, path))); } };
        world.snapListeners.push(l);
        const tr = readTrip();
        world.at(tr.at, () => { if (!page.alive || l.off) return; if (tr.ok) l.fire(); else if (err) callSite(page, () => err(new Error('offline'))); }, page, 'net');
        return () => { l.off = true; world.snapListeners = world.snapListeners.filter(x => x !== l); };
      }
    };
  }
  const db = {
    collection: c => queryRef(c, []),
    doc: p => docRef(p),
    batch(){
      const items = [];
      const b = {
        set(ref, data, o){ items.push({ path: ref.path, kind: 'set', merge: !!(o && o.merge), data }); return b; },
        update(ref, data){ items.push({ path: ref.path, kind: 'update', data }); return b; },
        delete(ref){ items.push({ path: ref.path, kind: 'delete', data: null }); return b; },
        commit(){ return issue(items); }
      };
      return b;
    },
    runTransaction(fn){
      return (async () => {
        for (let attempt = 0; attempt < 5; attempt++){
          const reads = new Map(), items = [];
          const tx = {
            get: r => read(r.path, () => { const d = world.docs.get(r.path); reads.set(r.path, d ? d.version : 0); const s = snapOf(world, r.path); s.ref = r; return s; }),
            set(r, data, o){ validate(data, ''); items.push({ path: r.path, kind: 'set', merge: !!(o && o.merge), data: clone(data) }); return tx; },
            update(r, data){ validate(data, ''); items.push({ path: r.path, kind: 'update', data: clone(data) }); return tx; },
            delete(r){ items.push({ path: r.path, kind: 'delete', data: null }); return tx; }
          };
          const out = await fn(tx);
          const tr = readTrip(), who = client.user;
          const committed = await new Promise((res, rej) => world.at(tr.at, () => {
            if (!page.alive) return;
            if (!tr.ok){ rej(Object.assign(new Error('Transaction failed: the client is offline'), { code: 'unavailable' })); return; }
            const stale = [...reads].some(([p, v]) => { const d = world.docs.get(p); return (d ? d.version : 0) !== v; });
            if (stale){ res(false); return; }
            const rec = { at: world.now, page: page.id, tab: page.tab.name, issuedAt: world.now, sentAt: world.now, token: who ? who.uid : null, items: items.map(w => ({ path: w.path, kind: w.kind, data: clone(w.data) })), ok: null, why: '', tx: true };
            if (items.length) world.writes.push(rec);
            const denied = items.find(w => !ruleAllows(world, 'write', w.path, who));
            if (denied){ rec.ok = false; rec.why = 'permission-denied'; world.stats.refusedByRules++; rej(Object.assign(new Error('Missing or insufficient permissions.'), { code: 'permission-denied' })); return; }
            try { applyOp(world, { items }); } catch (e){ rec.ok = false; rej(e); return; }
            rec.ok = true;
            if (items.length) world.log(`${page.id} transaction COMMITTED under ${who ? who.uid : '-'}: ${items.map(w => w.path).join(', ')}`);
            res(true);
          }, page, 'net'));
          if (committed) return out;
        }
        throw Object.assign(new Error('Transaction failed after 5 attempts'), { code: 'aborted' });
      })();
    }
  };
  client.db = db;
  return client;
}
function summarize(op){
  const parts = [];
  for (const w of op.items){
    const flat = [];
    const walk = (v, p, depth) => {
      if (v instanceof FieldDelete){ flat.push(p + '=DEL'); return; }
      if (v instanceof FieldIncrement){ flat.push(p + '=+' + v.n); return; }
      if (isMap(v) && depth < 2 && Object.keys(v).length){ for (const k of Object.keys(v)) walk(v[k], p ? p + '.' + k : k, depth + 1); return; }
      const s = JSON.stringify(v); flat.push(p + '=' + (s && s.length > 50 ? s.slice(0, 47) + '...' : s));
    };
    if (w.data) walk(w.data, '', 0);
    parts.push(w.path + ' {' + flat.filter(x => !/^(name|email)=/.test(x)).join(' ') + '}');
  }
  return parts.join(' ; ');
}

/* ─────────────────────────── the site's scripts ─────────────────────────── */
const SCRIPT_CACHE = new Map();
function siteFiles(root){
  const mods = readdirSync(root).filter(f => /^module-\d+\.js$/.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return ['firebase-config.js', 'config-main.js', 'class-activities.js', 'i18n.js', 'guitar-diagrams.js', ...mods, ...siteParts('app.js', root),
    'practice-minutes-config.js', 'practice-minutes.js', 'fab-tools.js', 'tuner.js', 'live-quiz.js'];
}
function script(root, f){
  const key = root + '|' + f;
  if (!SCRIPT_CACHE.has(key)){
    let src;
    try { src = readFileSync(join(root, f), 'utf8'); } catch (e){ throw Object.assign(new Error(`${f}: cannot read (${e.message})`), { siteFile: f }); }
    try { SCRIPT_CACHE.set(key, new vm.Script(src, { filename: f })); }
    catch (e){ throw Object.assign(new Error(`${f} does not parse: ${e.message}`), { siteFile: f }); }
  }
  return SCRIPT_CACHE.get(key);
}
/* The names of the top-level variables of the scripts a page loads (read, not lifted: R4 reads their VALUES). */
const GLOBAL_NAMES = new Map();
function globalNames(root){
  if (GLOBAL_NAMES.has(root)) return GLOBAL_NAMES.get(root);
  const names = new Set();
  for (const f of [...siteParts('app.js', root), 'live-quiz.js', 'fab-tools.js', 'tuner.js', ...siteParts('coach.js', root)]){
    let src = ''; try { src = readFileSync(join(root, f), 'utf8'); } catch { continue; }
    for (const m of src.matchAll(/^(?:let|var|const)\s+([A-Za-z_$][\w$]*)/gm)) names.add(m[1]);
  }
  const out = [...names].sort();
  GLOBAL_NAMES.set(root, out);
  return out;
}

/* ─────────────────────────── a page: one load of index.html in a tab ─────────────────────────── */
const CB_SCRIPT = new vm.Script('__cb()');
function callSite(page, fn){
  if (!page.alive) return;
  const dev = page.tab.device;
  const prev = dev.accessing; dev.accessing = page;
  try {
    page.ctx.__cb = fn;
    const r = CB_SCRIPT.runInContext(page.ctx, { timeout: 10000 });
    if (r && typeof r.then === 'function') r.then(null, e => { if (page.alive) page.world.siteFaults.push(`${page.id}: unhandled rejection: ` + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e))); });
    return r;
  } catch (e){ page.world.siteFaults.push(`${page.id}: threw: ` + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e))); }
  finally { dev.accessing = prev; }
}
function siteRun(page, code){ return callSite(page, () => page.run(code)); }

function makePage(world, tab, opts){
  const dev = tab.device;
  const page = { id: `${tab.name}#${tab.loads + 1}`, tab, world, alive: true, unloading: false, lostOps: [], els: {}, notices: [], saveMsgs: [],
    markerHits: [], docL: {}, winL: {}, audio: { sources: 0, stopped: 0, ctxOpen: 0, ctxClosed: 0, tracks: [] }, bornAt: world.now, teacherMode: !!opts.teacher,
    scriptsLoaded: new Set(), authSeenKey: undefined, authCbs: [], authUser: null, reads: {} };
  tab.loads++;
  world.stats.pages++;
  page.siteUid = () => { try { return page.alive ? page.run('(typeof currentUser !== "undefined" && currentUser) ? currentUser.uid : null') : null; } catch { return null; } };
  /* Markup scan: a string that holds anyone's marker is checked against who the page shows at that moment. */
  const scanText = (where, s) => {
    if (typeof s !== 'string' || s.length < 4) return;
    let uid;
    for (const k of Object.keys(world.markers)){
      if (!world.onDevice.has(k)) continue;
      for (const t of world.markers[k]){
        if (!s.includes(t)) continue;
        if (uid === undefined) uid = page.siteUid();
        if (world.people[k].uid !== uid && !(page.teacherMode && uid === world.people.T.uid)) page.markerHits.push({ at: world.now, where, owner: k, text: t, shownAs: uid });
      }
    }
  };
  /* The stub DOM. */
  const mkEl = (id, tag) => {
    const e = {
      __stub: true, id: id || '', tagName: (tag || 'div').toUpperCase(), style: { setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; }, cssText: '' }, dataset: {}, children: [], _h: '', _t: '', attrs: {},
      classList: { _s: new Set(), add(...c){ c.forEach(x => this._s.add(x)); }, remove(...c){ c.forEach(x => this._s.delete(x)); }, toggle(c, f){ const on = f === undefined ? !this._s.has(c) : !!f; if (on) this._s.add(c); else this._s.delete(c); return on; }, contains(c){ return this._s.has(c); } },
      get innerHTML(){ return this._h; }, set innerHTML(v){ this._h = String(v); scanText('#' + (this.id || this.tagName) + '.innerHTML', this._h); },
      get textContent(){ return this._t; }, set textContent(v){ this._t = String(v); scanText('#' + (this.id || this.tagName) + '.textContent', this._t); },
      value: '', hidden: false, checked: false, isConnected: true, src: '', parentNode: null,
      addEventListener(){}, removeEventListener(){},
      appendChild(c){ if (c && typeof c === 'object'){ c.parentNode = e; e.children.push(c); } return c; },
      removeChild(){}, remove(){ e.removed = true; if (e.parentNode){ e.parentNode.children = e.parentNode.children.filter(x => x !== e); } }, append(...cs){ cs.forEach(c => e.appendChild(c)); }, prepend(){},
      setAttribute(k, v){ e.attrs[k] = String(v); if (k === 'data-i18n' && e.__saveInd) page.saveMsgs.push({ at: world.now, key: String(v) }); },
      getAttribute(k){ return Object.prototype.hasOwnProperty.call(e.attrs, k) ? e.attrs[k] : null; }, removeAttribute(k){ delete e.attrs[k]; }, hasAttribute(k){ return Object.prototype.hasOwnProperty.call(e.attrs, k); }, toggleAttribute(){},
      querySelector(){ return null; }, querySelectorAll(){ return []; }, closest(){ return null; }, matches(){ return false; },
      focus(){}, blur(){}, click(){}, scrollIntoView(){}, scrollTo(){}, insertAdjacentHTML(){}, insertAdjacentElement(){},
      cloneNode(){ return mkEl('', tag); }, contains(){ return false; }, play(){ return Promise.resolve(); }, pause(){}, load(){},
      getBoundingClientRect(){ return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; }
    };
    return e;
  };
  const saveInd = mkEl('save-ind'); saveInd.__saveInd = true;
  const body = mkEl('body', 'body');
  body.appendChild = c => {
    if (c && typeof c === 'object'){
      c.parentNode = body; body.children.push(c);
      if (c.id === 'unsaved-notice'){
        const go = (c.children || []).find(x => x.tagName === 'BUTTON' && x.attrs['data-i18n'] && x.attrs['data-i18n'] !== 'offline.dismiss' && !x.attrs['data-i18n-attr']);
        page.notices.push({ at: world.now, el: c, go });
        world.log(`${page.id} shows the NOT-SAVED notice ("${c.children[0] ? c.children[0]._t : ''}")`);
      }
    }
    return c;
  };
  const head = mkEl('head', 'head');
  head.appendChild = s => {
    const src = (s && s.src) || '';
    if (/firestore/.test(src)){
      world.at(world.now + 150, () => { if (!page.alive) return; ctx.firebase.firestore = firestoreFn; callSite(page, () => s.onload && s.onload()); }, page, 'timer');
    } else if (/\.js$/.test(src) && !/^https?:/.test(src)){
      const f = src.replace(/^\.\//, '');
      world.at(world.now + 60, () => {
        if (!page.alive) return;
        if (!page.scriptsLoaded.has(f)){
          page.scriptsLoaded.add(f);
          try { callSite(page, () => script(opts.root, f).runInContext(ctx, { timeout: 10000 })); }
          catch (e){ world.siteFaults.push(`${page.id}: ${f} failed to load: ${e.message}`); }
        }
        callSite(page, () => s.onload && s.onload());
      }, page, 'timer');
    }
    return s;
  };
  const client = makeClient(world, page);
  page.client = client;
  const firestoreFn = () => client.db;
  firestoreFn.FieldValue = { delete: () => DELETE, increment: n => new FieldIncrement(n), serverTimestamp: () => new FieldServerTs(), arrayUnion: (...a) => a };
  firestoreFn.FieldPath = { documentId: () => new FieldPathDocId() };
  firestoreFn.Blob = { fromUint8Array: u => ({ __blob: true, n: u.length }) };
  firestoreFn.Timestamp = { now: () => ({ toMillis: () => world.now, seconds: Math.floor(world.now / 1000), nanoseconds: 0 }) };
  /* Firebase Auth (A1-A4): this page's view of the device's shared sign-in. */
  const auth = {
    get currentUser(){ return page.authUser; },
    onAuthStateChanged(cb){
      page.authCbs.push(cb);
      world.at(world.now + Math.round(30 + 90 * world.r()), () => deliverAuth(page, dev.authUser, true), page, 'timer');
      return () => { page.authCbs = page.authCbs.filter(f => f !== cb); };
    },
    signInWithPopup(){
      return new Promise((res, rej) => {
        const who = dev.pendingSignIn;
        world.at(world.now + Math.round(1500 + 1500 * world.r()), () => {
          if (!who){ rej(Object.assign(new Error('closed'), { code: 'auth/popup-closed-by-user' })); return; }
          dev.pendingSignIn = null;
          setDeviceAuth(world, dev, fbUser(who), page);
          if (page.alive) res({ user: fbUser(who) });
        }, null, 'auth');
      });
    },
    signOut(){
      return new Promise(res => {
        world.at(world.now + Math.round(20 + 60 * world.r()), () => { setDeviceAuth(world, dev, null, page); if (page.alive) res(); }, null, 'auth');
      });
    }
  };
  const intervals = new Map();
  /* An audio node: accepts every call; start()/stop() are counted; it remembers what is set on it. */
  const param = () => ({ value: 0, setValueAtTime(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){}, setTargetAtTime(){}, cancelScheduledValues(){}, cancelAndHoldAtTime(){} });
  const audioNode = actx => {
    const store = { context: actx };
    return new Proxy(function(){}, {
      get(t, k){
        if (k in store) return store[k];
        if (k === 'start') return () => { page.audio.sources++; };
        if (k === 'stop') return () => { page.audio.stopped++; };
        if (k === 'then' || typeof k === 'symbol') return undefined;
        if (['gain', 'frequency', 'Q', 'playbackRate', 'detune', 'pan', 'offset', 'delayTime', 'threshold', 'ratio', 'knee', 'attack', 'release'].includes(k)) return (store[k] = param());
        if (k === 'connect') return () => audioNode(actx);
        if (k === 'disconnect') return () => {};
        if (/^get(Float|Byte)/.test(k)) return () => {};
        if (k === 'getChannelData') return () => new Float32Array(16);
        if (k === 'numberOfChannels') return 1;
        if (k === 'length' || k === 'duration') return 16;
        if (k === 'fftSize') return 2048;
        if (k === 'frequencyBinCount') return 1024;
        if (k === 'sampleRate') return 48000;
        if (k === 'buffer') return null;
        if (k === 'onended') return null;
        return (store[k] = audioNode(actx));
      },
      set(t, k, v){ store[k] = v; return true; },
      apply(){ return audioNode(actx); }
    });
  };
  class FakeAudioContext {
    constructor(){ page.audio.ctxOpen++; this.state = 'running'; this.sampleRate = 48000; this.destination = audioNode(this); }
    get currentTime(){ return (world.now - page.bornAt) / 1000; }
    resume(){ return Promise.resolve(); } suspend(){ return Promise.resolve(); }
    close(){ page.audio.ctxClosed++; this.state = 'closed'; return Promise.resolve(); }
    createBuffer(){ return audioNode(this); } decodeAudioData(){ return Promise.resolve(audioNode(this)); }
    createBufferSource(){ return audioNode(this); } createGain(){ return audioNode(this); } createOscillator(){ return audioNode(this); }
    createBiquadFilter(){ return audioNode(this); } createAnalyser(){ return audioNode(this); } createMediaStreamSource(){ return audioNode(this); }
    createDynamicsCompressor(){ return audioNode(this); } createStereoPanner(){ return audioNode(this); } createConvolver(){ return audioNode(this); }
    createScriptProcessor(){ return audioNode(this); } createMediaElementSource(){ return audioNode(this); } createWaveShaper(){ return audioNode(this); }
    createConstantSource(){ return audioNode(this); } createDelay(){ return audioNode(this); } createChannelMerger(){ return audioNode(this); } createChannelSplitter(){ return audioNode(this); }
  }
  const mediaDevices = {
    getUserMedia(){
      return new Promise(res => world.at(world.now + 120, () => {
        if (!page.alive) return;
        const track = { live: true, stop(){ this.live = false; } };
        page.audio.tracks.push(track);
        res({ getTracks: () => [track], getAudioTracks: () => [track] });
      }, page, 'timer'));
    }
  };
  const ctx = {
    console: { log(){}, info(){}, debug(){}, warn: (...a) => world.log(`${page.id} console.warn: ${a.map(x => x && x.message ? x.message : String(x)).join(' ').slice(0, 160)}`), error: (...a) => world.log(`${page.id} console.error: ${a.map(x => x && x.message ? x.message : String(x)).join(' ').slice(0, 160)}`) },
    document: {
      documentElement: mkEl('html', 'html'), head, body, readyState: 'complete', referrer: '', title: '',
      getElementById(id){ return page.els[id] || (page.els[id] = mkEl(id)); },
      querySelector(){ return null; },
      querySelectorAll(sel){ return sel === '.save-ind' ? [saveInd] : []; },
      createElement(tag){ return mkEl('', tag); }, createDocumentFragment(){ return mkEl('', 'fragment'); }, createTextNode(){ return mkEl('', 'text'); },
      addEventListener(type, fn){ (page.docL[type] = page.docL[type] || []).push(fn); }, removeEventListener(type, fn){ page.docL[type] = (page.docL[type] || []).filter(f => f !== fn); },
      fonts: { ready: Promise.resolve() }, activeElement: null, hasFocus(){ return !tab.hidden; },
      get hidden(){ return tab.hidden; }, get visibilityState(){ return tab.hidden ? 'hidden' : 'visible'; }
    },
    localStorage: localStorageFor(tab),
    sessionStorage: tab.session,
    location: { hostname: 'class.example.test', protocol: 'https:', host: 'class.example.test', origin: 'https://class.example.test', href: 'https://class.example.test/' + (opts.teacher ? '?teacher=true' : ''), pathname: '/', search: opts.teacher ? '?teacher=true' : '', hash: '',
      reload(){ requestReload(page); }, assign(){}, replace(){} },
    history: { scrollRestoration: 'auto', replaceState(){}, pushState(){}, back(){}, length: 1 },
    navigator: { userAgent: 'shared-chromebook-loop', language: 'en', get onLine(){ return !dev.offlineNow; }, mediaDevices, clipboard: { writeText: () => Promise.resolve() } },
    setTimeout: (fn, ms, ...args) => world.at(world.now + Math.max(0, Number(ms) || 0), () => callSite(page, () => (typeof fn === 'function' ? fn(...args) : undefined)), page, 'timer'),
    clearTimeout: id => { if (id != null) world.cancel(id); },
    setInterval: (fn, ms, ...args) => {
      const handle = 'iv' + (++world.seq);
      const every = Math.max(10, Number(ms) || 0);
      const arm = () => { intervals.set(handle, world.at(world.now + every, () => { if (!intervals.has(handle)) return; arm(); callSite(page, () => fn(...args)); }, page, 'timer')); };
      arm(); return handle;
    },
    clearInterval: h => { if (intervals.has(h)){ world.cancel(intervals.get(h)); intervals.delete(h); } },
    requestAnimationFrame: () => 0, cancelAnimationFrame(){},
    requestIdleCallback: fn => world.at(world.now + 50, () => callSite(page, () => fn({ timeRemaining: () => 10, didTimeout: false })), page, 'timer'), cancelIdleCallback(){},
    matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    fetch: (url, o) => fetchFake(world, page, url, o),
    alert(){}, confirm(){ return true; }, prompt(){ return null; }, open(){ return null; },
    CustomEvent: class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } },
    Event: class { constructor(t){ this.type = t; } },
    Image: class {}, Audio: class { constructor(){ this.paused = true; this.currentTime = 0; } play(){ this.paused = false; page.audio.sources++; return Promise.resolve(); } pause(){ if (!this.paused) page.audio.stopped++; this.paused = true; } load(){} addEventListener(){} removeEventListener(){} },
    HTMLMediaElement: class { play(){ return Promise.resolve(); } pause(){} },
    AudioContext: FakeAudioContext, webkitAudioContext: FakeAudioContext, OfflineAudioContext: FakeAudioContext,
    MediaRecorder: class { constructor(){ this.state = 'inactive'; } start(){ this.state = 'recording'; } stop(){ this.state = 'inactive'; } addEventListener(){} static isTypeSupported(){ return true; } },
    ResizeObserver: class { observe(){} unobserve(){} disconnect(){} }, IntersectionObserver: class { observe(){} unobserve(){} disconnect(){} }, MutationObserver: class { observe(){} disconnect(){} },
    performance: { now: () => world.now - page.bornAt, getEntriesByType: () => [] },
    URLSearchParams, URL, TextEncoder, TextDecoder, Blob: class {}, FileReader: class {},
    CSS: { escape: v => String(v).replace(/[^a-zA-Z0-9_-]/g, c => '\\' + c), supports: () => false },
    addEventListener(type, fn){ (page.winL[type] = page.winL[type] || []).push(fn); }, removeEventListener(type, fn){ page.winL[type] = (page.winL[type] || []).filter(f => f !== fn); }, dispatchEvent(){ return true; },
    scrollTo(){}, scrollBy(){}, innerWidth: 1366, innerHeight: 657, devicePixelRatio: 1, screen: { width: 1366, height: 768 },
    firebase: { initializeApp(){}, auth: Object.assign(() => auth, { GoogleAuthProvider: class { setCustomParameters(){} } }), firestore: undefined, apps: [] },
    __clock: () => world.now, __rand: rng(mix(opts.seed || 1, tab.loads))
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  page.ctx = ctx;
  page.run = code => vm.runInContext(code, ctx, { timeout: 10000 });
  vm.runInContext(`(function(){
    const D = Date, clock = __clock;
    function FakeDate(...a){ if (!new.target) return new D(clock()).toString(); return a.length ? new D(...a) : new D(clock()); }
    FakeDate.prototype = D.prototype; FakeDate.now = () => clock(); FakeDate.UTC = D.UTC; FakeDate.parse = D.parse;
    globalThis.Date = FakeDate;
    Math.random = __rand;
  })();`, ctx);
  const prev = dev.accessing; dev.accessing = page;
  try {
    for (const f of siteFiles(opts.root)){
      page.scriptsLoaded.add(f);
      try { script(opts.root, f).runInContext(ctx, { timeout: 10000 }); }
      catch (e){ if (e.siteFile) throw e; world.siteFaults.push(`${page.id}: ${f} threw while loading: ${e && e.message}`); }
    }
  } finally { dev.accessing = prev; }
  return page;
}
/* The practice-minutes keepalive commit at pagehide (F9): delivered, checked against the token it carries. */
function fetchFake(world, page, url, o){
  if (/documents:commit/.test(String(url)) && o && o.body){
    let body = null; try { body = JSON.parse(o.body); } catch {}
    const auth = (o.headers && (o.headers.Authorization || o.headers.authorization)) || '';
    const tokUid = /^Bearer tok:(.+)$/.exec(auth);
    const token = tokUid ? { uid: tokUid[1], email: null } : null;
    const items = [];
    for (const w of (body && body.writes) || []){
      const name = (w.update && w.update.name) || w.transform && w.transform.document || '';
      const path = name.replace(/^.*\/documents\//, '');
      const inc = (w.updateTransforms || []).find(t => t.fieldPath === 'seconds');
      const data = {};
      if (inc) data.seconds = new FieldIncrement(Number(inc.increment.integerValue));
      items.push({ path, kind: 'set', merge: true, data });
    }
    const rec = { at: world.now, page: page.id, tab: page.tab.name, issuedAt: world.now, sentAt: world.now, token: token ? token.uid : null, items: items.map(w => ({ path: w.path, kind: w.kind, data: clone(w.data) })), ok: null, why: '', keepalive: true };
    world.writes.push(rec);
    const ph = page.tab.device.phaseAt(world.now);
    if (ph.phase !== 'up' && ph.phase !== 'slow'){ rec.ok = false; rec.why = 'network'; return Promise.reject(new Error('offline')); }
    const denied = items.find(w => !ruleAllows(world, 'write', w.path, token));
    if (denied){ rec.ok = false; rec.why = 'permission-denied'; world.stats.refusedByRules++; return Promise.resolve({ ok: false, status: 403 }); }
    applyOp(world, { items }); rec.ok = true;
    world.log(`${page.id} keepalive commit LANDED under ${token ? token.uid : '-'}`);
    return Promise.resolve({ ok: true, status: 200 });
  }
  return Promise.reject(new Error('no network in shared-chromebook-loop'));
}
/* A2/A3/A4: deliver the device's sign-in to one page. */
function deliverAuth(page, user, initial){
  if (!page.alive) return;
  const key = user ? user.uid : '';
  if (page.authSeenKey === key) return;
  if (!initial && page.authSeenKey === undefined) return;
  if (page.tab.frozenUntil && page.world.now < page.tab.frozenUntil){ page.tab.missed = page.tab.missed || []; page.tab.missed.push(user); return; }
  page.authSeenKey = key;
  page.authUser = user;
  if (user){ (page.sawUids = page.sawUids || new Set()).add(user.uid); (page.authAt = page.authAt || {})[user.uid] = page.world.now; }
  (page.authLog = page.authLog || []).push({ at: page.world.now, uid: user ? user.uid : null });
  page.client.setUser(user);
  page.world.log(`${page.id} auth → ${user ? user.uid : 'signed out'}`);
  for (const cb of page.authCbs.slice()) callSite(page, () => cb(user));
}
function setDeviceAuth(world, dev, user, fromPage){
  dev.authUser = user;
  world.log(`device auth → ${user ? user.uid : 'signed out'} (from ${fromPage ? fromPage.id : '-'})`);
  world.authHistory.push({ at: world.now, uid: user ? user.uid : null });
  if (world.onAuthChange) world.onAuthChange();
  for (const tab of dev.tabs){
    const p = tab.page;
    if (!p || !p.alive) continue;
    if (FAKE_FAULT === 'auth-not-shared' && p !== fromPage) continue;
    if (p === fromPage){ deliverAuth(p, user); continue; }
    const delay = tab.authDelay != null ? tab.authDelay : Math.round(20 + 280 * world.r());
    world.at(world.now + delay, () => deliverAuth(p, user), null, 'auth');
  }
}
/* A tab that thaws gets the device's current sign-in (A3), or with the fake fault every state it missed. */
function thaw(world, tab){
  tab.frozenUntil = 0;
  /* R5's checks waited for the thaw: the page gets the same 3 s from the moment it can run again. */
  for (const f of (tab.pendingChecks || []).splice(0)) world.at(world.now + 3300, f, null, 'script');
  for (const e of world.events) if (e.deferred && e.owner && e.owner.tab === tab && e.at > world.now){ e.at = world.now; e.deferred = false; }
  const p = tab.page;
  const missed = tab.missed || []; tab.missed = [];
  if (!p || !p.alive) return;
  if (FAKE_FAULT === 'frozen-sees-all'){ for (const u of missed) deliverAuth(p, u); return; }
  deliverAuth(p, tab.device.authUser);
}

/* A reload (location.reload): unload events, the page dies (D3/D4), a new page 300 ms later. */
function requestReload(page){
  if (page.reloadAsked || !page.alive) return;
  page.reloadAsked = true;
  const world = page.world;
  world.log(`${page.id} location.reload()`);
  world.at(world.now, () => doReload(page), null, 'script');
}
function killPage(page){
  const world = page.world;
  page.unloading = true;
  const tab = page.tab;
  const wasHidden = tab.hidden;
  tab.hidden = true;
  if (!wasHidden) for (const fn of (page.docL.visibilitychange || []).slice()) callSite(page, () => fn({ type: 'visibilitychange' }));
  for (const fn of (page.winL.pagehide || []).slice()) callSite(page, () => fn({ type: 'pagehide', persisted: false }));
  tab.hidden = wasHidden;
  page.alive = false;
  page.diedAt = world.now;
  world.killOwner(page);
  page.client.dropUnsent();
  world.snapListeners = world.snapListeners.filter(l => l.page !== page);
}
function doReload(page){
  const world = page.world, tab = page.tab;
  if (!page.alive) return;
  world.stats.reloads++;
  killPage(page);
  if (FAKE_FAULT === 'session-cleared-on-reload') tab.session.clear();
  world.at(world.now + 300, () => (tab.reopen || openPage)(world, tab, tab.teacherUrl), null, 'script');
}
function openPage(world, tab, teacher){
  tab.teacherUrl = !!teacher;
  const page = makePage(world, tab, { root: ROOT, seed: world.seed, teacher: !!teacher });
  tab.page = page;
  tab.pages.push(page);
  world.log(`${page.id} loaded${teacher ? ' (?teacher)' : ''}`);
  return page;
}

/* ─────────────────────────── people, docs, data ─────────────────────────── */
const PEOPLE = {
  A: { key: 'A', uid: 'stu-ama', name: 'Ama Testwell', email: 'ama.testwell@example.test' },
  B: { key: 'B', uid: 'stu-bo', name: 'Bo Fakeley', email: 'bo.fakeley@example.test' },
  C: { key: 'C', uid: 'stu-cy', name: 'Cy Mockford', email: 'cy.mockford@example.test' }
};
const DATA = (() => {
  const out = { CHECKS: {}, CHOICES: {}, PATHS: [], CARDS: [], parseError: null, TEACHER_EMAIL: null };
  const c = { window: {} }; c.window = c; vm.createContext(c);
  try {
    vm.runInContext(readFileSync(join(ROOT, 'class-activities.js'), 'utf8'), c, { filename: 'class-activities.js' });
    vm.runInContext(readFileSync(join(ROOT, 'firebase-config.js'), 'utf8') + '\n;globalThis.__TE = (typeof TEACHER_EMAIL !== "undefined") ? TEACHER_EMAIL : null;', c, { filename: 'firebase-config.js' });
  } catch (e){ out.parseError = e.message; return out; }
  out.TEACHER_EMAIL = c.__TE;
  const all = c.CLASS_ACTIVITIES || [];
  for (const a of all) if (a.check && (a.id === 'ca-14' || a.id === 'ca-15')){
    out.CHECKS[a.id] = a.check.items.map(it => a.check.type === 'nextNote' ? String(it.answer.fret) : String(it.answer));
    out.CHOICES[a.id] = a.check.items.map(it => a.check.type === 'nextNote' ? (it.choices || []).map(ch => String(ch.fret)) : ['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  }
  const p46 = all.find(x => x.id === 'ca-46');
  out.PATHS = p46 && p46.paths ? p46.paths.map(x => x.key) : [];
  out.CARDS = all.filter(a => a.view === 'card' && a.kind !== 'check').map(a => a.id).slice(0, 6);
  return out;
})();
const oDay = t => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
/* A returning student's doc. Every student holds keys no other student holds, and MARKERS (strings only they have). */
function seedDoc(P, seed){
  const y = oDay(T0 - DAY);
  if (P.key === 'A') return {
    name: P.name, email: P.email, migrations: { swap45: true }, period: '7', lastModule: 9, lastSet: 'm9w2',
    completed: { 'm9w2-b-sec0-0': true, 'm9w2-b-sec0-1': true, 'm9w2-b-sec1-0': true },
    caSteps: { 'ca-18:0': true, 'ca-46:path:full': true },
    classActivities: { 'ca-12': true, 'ca-14': true },
    responses: { 'm9w2-b-sec0-2': 'violet harbor ' + seed + ' ama', 'zz-ama-note': 'amber lantern ' + seed, 'practice-m9w2-s1': [{ value: '72', date: new Date(T0 - 3 * DAY).toISOString() }] },
    practiceLog: { 'm9w2-s1': { reps: 41, todayCount: 1, lastDay: y, last: T0 - DAY, best: 77 } },
    exitChecks: { 'ca-14': { score: 4, total: 5, picks: ['1', '2', '3', '4', '5'], at: oDay(T0 - 2 * DAY), attempts: 1 } },
    streak: { count: 9, lastDay: y },
    games: { dk: { 'chords-m9': 6, at: y }, xp: 1234 }
  };
  if (P.key === 'B') return {
    name: P.name, email: P.email, migrations: { swap45: true }, period: '4', lastModule: 2, lastSet: 'm2w1',
    completed: { 'm2w1-b-sec0-0': true },
    caSteps: { 'ca-18:1': true },
    classActivities: { 'ca-10': true },
    responses: { 'm2w1-b-sec0-1': 'cobalt meadow ' + seed + ' bo', 'zz-bo-note': 'birch kettle ' + seed },
    practiceLog: { 'm2w1-s1': { reps: 5, todayCount: 0, lastDay: oDay(T0 - 3 * DAY), last: T0 - 3 * DAY, best: 60 } },
    exitChecks: {},
    streak: { count: 2, lastDay: oDay(T0 - 3 * DAY) },
    games: { xp: 77 }
  };
  return {
    name: P.name, email: P.email, migrations: { swap45: true }, period: 'CAS', lastModule: 5, lastSet: 'm5w3',
    completed: { 'm5w3-b-sec0-0': true }, responses: { 'zz-cy-note': 'cedar whistle ' + seed }, games: {}, streak: { count: 1, lastDay: y }
  };
}
/* The markers of a person: strings only their history holds. */
function markersOf(P, seed, docs){
  const out = [P.name, P.email];
  const d = docs[P.key];
  if (d && d.responses) for (const v of Object.values(d.responses)) if (typeof v === 'string' && v.length > 8) out.push(v);
  out.push('zz-' + (P.key === 'A' ? 'ama' : P.key === 'B' ? 'bo' : P.key === 'C' ? 'cy' : 'teacher') + '-note');
  return out;
}
function classConfig(world){
  const A = PEOPLE.A.uid;
  return {
    gamesEnabled: true, gameOverrides: { [A]: false },
    periodOverrides: { [A]: 'CAS' }, moduleOpenThrough: { [A]: 9 },
    activityStudents: DATA.CARDS[1] ? { [DATA.CARDS[1]]: { [A]: true } } : {},
    activityDates: Object.fromEntries(['ca-10', 'ca-12', 'ca-14', 'ca-15', 'ca-18', 'ca-46', ...DATA.CARDS].map(id => [id, oDay(T0 - 5 * DAY)])),
    micSampling: { on: true, max: 40 },
    activityBoardSeeded: false
  };
}

/* ─────────────────────────── the families ─────────────────────────── */
const FAMILIES = {
  'last-action': 'A\'s last action right before Sign out (8 kinds), with the network up, slow, refusing once, offline or stalled; then B signs in on the same tab',
  'first-screen': 'A works a whole session (every kind, device settings, deck best, mic consent, practice minutes), signs out; B (returning, new, or a failed read) signs in: B\'s first screen',
  'two-tabs': 'A in two tabs: A acts in one and signs out from the other (network varies, the other tab may be frozen); B signs in',
  'round-trip': 'A, then B, then A again on the same tab, or the same student out and back in',
  'teacher': 'the teacher\'s account after a student and a student after the teacher, on the student page and on the console',
  'playing': 'Sign out with a sound playing and the mic open (a listening game\'s mic, a note playing)',
  'failed-reads': 'B\'s progress or config read fails or comes back empty right after A',
  'mix': 'seeded random mixes of all of the above'
};
const ACTION_KINDS = ['tick', 'untick', 'answer', 'rep', 'check', 'path', 'pr', 'card'];
const NET_KINDS = ['up', 'slow', 'refused', 'offline', 'stall'];

/* ─────────────────────────── one case ─────────────────────────── */
function caseSeed(idx){ return mix(BASE_SEED, idx); }
function pick(r, arr){ return arr[Math.floor(r() * arr.length)]; }
function makeScenario(idx, famFilter){
  const names = Object.keys(FAMILIES).filter(f => !famFilter.length || famFilter.includes(f));
  const fam = names[idx % names.length];
  const seed = caseSeed(idx);
  const r = rng(seed);
  const sc = { idx, fam, seed, r, actionKind: pick(r, ACTION_KINDS), net: pick(r, NET_KINDS), signOutAfter: pick(r, [150, 600, 1200, 2500]),
    noticeChoice: r() < 0.4 ? 'anyway' : 'wait', bKind: pick(r, ['returning', 'returning', 'new', 'failed-read']),
    frozen: r() < 0.5, bOnOtherTab: r() < 0.5, teacherWhere: pick(r, ['student-page', 'student-page']), teacherOrder: pick(r, ['after', 'before']),
    roundKind: pick(r, ['A-B-A', 'A-A']), failKind: pick(r, ['progress-refused', 'progress-offline', 'config-refused', 'both', 'empty']),
    playKind: pick(r, ['mic', 'note', 'both']) };
  if (fam === 'mix'){
    sc.sub = pick(r, ['last-action', 'two-tabs', 'round-trip', 'failed-reads', 'first-screen']);
  }
  return sc;
}
function actionFor(sc, kind, r, P){
  const seed = sc.seed;
  switch (kind){
    case 'tick': return { kind, key: P.key === 'A' ? 'm9w2-b-sec1-1' : 'm2w1-b-sec1-0', on: true };
    case 'untick': return { kind: 'tick', key: P.key === 'A' ? 'm9w2-b-sec0-1' : 'm2w1-b-sec0-0', on: false, label: 'untick' };
    case 'answer': return { kind, key: P.key === 'A' ? 'm9w2-b-sec1-2' : 'm2w1-b-sec1-1', text: (P.key === 'A' ? 'saffron ridge ' : 'teal orchard ') + seed };
    case 'rep': return { kind, key: P.key === 'A' ? 'm9w2-s1' : 'm2w1-s1', best: 80 + Math.floor(r() * 20) };
    case 'check': { const id = 'ca-15'; const ans = DATA.CHECKS[id] || []; return { kind, key: id, picks: ans.map((x, i) => (r() < 0.7 ? x : (DATA.CHOICES[id][i] || [x])[Math.floor(r() * 7) % (DATA.CHOICES[id][i] || [x]).length])) }; }
    case 'path': return { kind, key: 'ca-46', pick: DATA.PATHS.length > 1 ? DATA.PATHS[1] : DATA.PATHS[0], keys: DATA.PATHS };
    case 'pr': return { kind, key: P.key === 'A' ? 'practice-m9w2-s1' : 'practice-m2w1-s1', value: String(100 + Math.floor(r() * 60)) };
    case 'card': return { kind, key: DATA.CARDS[0] };
  }
  throw new Error('no action ' + kind);
}
function actionCode(a){
  const j = JSON.stringify;
  switch (a.kind){
    case 'tick': return `onCompleteChange(${j(a.key)}, ${a.on})`;
    case 'answer': return `onResponseChange(${j(a.key)}, ${j(a.text)}, false)`;
    case 'rep': return `logPracticeRep(${j(a.key)}, { best: ${a.best} })`;
    case 'path': return `caPickPath(${j(a.key)}, ${j(a.pick)})`;
    case 'pr': return `onResponseChange(${j(a.key)}, ${j(a.value)}, true); onResponsePRBlur(${j(a.key)})`;
    case 'card': return `caToggleComplete(${j(a.key)})`;
    case 'dk': return `dkSaveBest(${j(a.key)}, ${a.n})`;
  }
  throw new Error('no code for ' + a.kind);
}

/* The world of one case, and the student's hands. */
function buildWorld(sc){
  const world = new World(sc.seed);
  world.seed = sc.seed;
  world.teacherEmail = DATA.TEACHER_EMAIL;
  world.snapListeners = [];
  world.authHistory = [];
  world.ledger = [];
  world.firstScreens = [];
  world.signIns = [];
  const docs = {};
  for (const k of ['A', 'B', 'C']) docs[k] = seedDoc(PEOPLE[k], sc.seed);
  world.seedDocs = docs;
  world.people = Object.assign({}, PEOPLE, { T: { key: 'T', uid: 'stu-teacher-acct', name: 'Teacher Account', email: DATA.TEACHER_EMAIL || 'teacher@example.test' } });
  docs.T = { name: world.people.T.name, email: world.people.T.email, migrations: { swap45: true }, responses: { 'zz-teacher-note': 'graphite bell ' + sc.seed }, completed: { 'm1w1-b-sec0-0': true } };
  world.markers = {};
  for (const k of ['A', 'B', 'C', 'T']) world.markers[k] = markersOf(world.people[k], sc.seed, docs);
  for (const k of ['A', 'C', 'T']) world.docs.set('progress/' + world.people[k].uid, { data: clone(docs[k]), version: 1 });
  if (!(sc.bKind === 'new')) world.docs.set('progress/' + PEOPLE.B.uid, { data: clone(docs.B), version: 1 });
  else world.seedDocs.B = null;
  world.docs.set('config/class', { data: classConfig(world), version: 1 });
  world.docs.set('micTakesMeta/count', { data: { n: 0 }, version: 1 });
  world.onDevice = new Set();
  return world;
}
function newTab(world, dev, name){
  const tab = { name, device: dev, hidden: false, page: null, pages: [], loads: 0, frozenUntil: 0, authDelay: null, sessionWrites: {} };
  /* Who wrote each sessionStorage key, and when (R4: the next person's tab must hold none of the previous one's). */
  tab.session = storage('session:' + name, (op, k) => {
    if (op === 'set') tab.sessionWrites[k] = { at: world.now, authUid: dev.authUser ? dev.authUser.uid : null, page: dev.accessing ? dev.accessing.id : null };
    if (op === 'remove') delete tab.sessionWrites[k];
    if (op === 'clear') tab.sessionWrites = {};
  });
  dev.tabs.push(tab);
  return tab;
}
/* Which uid the page shows right now (read once per world step by the hands; used to attribute marker hits). */
function refreshUid(page){ if (page && page.alive){ page.siteUidCache = page.siteUid(); } }
function appUp(page, P){
  if (!page || !page.alive) return false;
  refreshUid(page);
  if (page.siteUidCache !== P.uid) return false;
  /* Up = the sign-in callback has finished for this person (start.js clears window.__authBootPending in its finally)
     and the app or the console is showing. */
  if (page.ctx.__authBootPending) return false;
  const app = page.els['app'], t = page.els['teacher-app'];
  return !!((app && app.style.display === 'block') || (t && t.style.display && t.style.display !== 'none'));
}
function wallUp(page){
  if (!page || !page.alive) return false;
  refreshUid(page);
  const w = page.els['auth-wall'];
  return page.siteUidCache == null && !!(w && w.style.display === 'block');
}

/* The hands: what a person does, through the site's own handlers. */
function hands(world, dev, sc){
  const H = {
    async signIn(tab, P){
      beat(`${world.caseLabel}: ${P.key} signs in on ${tab.name} at ${rel(world.now)}`);
      world.onDevice.add(P.key);
      for (let attempt = 0; attempt < 3; attempt++){
        await world.waitFor(() => tab.page && tab.page.alive && (wallUp(tab.page) || appUp(tab.page, P)), 20000, 100);
        if (appUp(tab.page, P)) break;
        dev.pendingSignIn = P;
        world.log(`${P.key} clicks Sign in on ${tab.page.id}`);
        siteRun(tab.page, 'signIn()');
        if (await world.waitFor(() => tab.page && tab.page.alive && tab.page.siteUidCache !== undefined && appUp(tab.page, P), 30000, 100)) break;
      }
      const ok = appUp(tab.page, P);
      world.signIns.push({ at: world.now, who: P.key, page: tab.page ? tab.page.id : null, ok });
      if (ok){ world.log(`${P.key}'s app is on screen in ${tab.page.id}`); H.firstScreen(tab.page, P); }
      return ok;
    },
    firstScreen(page, P){ world.firstScreens.push(probe(world, page, P)); },
    async act(tab, P, a){
      const page = tab.page;
      if (!appUp(page, P)) { world.log(`${P.key} cannot act: app not up on ${page ? page.id : '-'}`); return false; }
      a.t = world.now; a.who = P.key; a.page = page.id; a.done = true;
      beat(`${world.caseLabel}: ${P.key} ${describe(a)} on ${page.id} at ${rel(world.now)}`);
      world.ledger.push(a);
      world.log(`${P.key} on ${page.id}: ${describe(a)}`);
      if (a.kind === 'check'){
        siteRun(page, `ecStart(${JSON.stringify(a.key)})`);
        for (const p of a.picks){ await world.sleep(600); if (!page.alive) return false; siteRun(page, `ecPick(${JSON.stringify(a.key)}, { dataset: { pick: ${JSON.stringify(p)} } })`); }
        a.t = world.now;
        return true;
      }
      siteRun(page, actionCode(a));
      return true;
    },
    async hide(tab){ if (tab.hidden) return; tab.hidden = true; const p = tab.page; world.log(`${tab.name} hidden`); if (p && p.alive) for (const fn of (p.docL.visibilitychange || []).slice()) callSite(p, () => fn({ type: 'visibilitychange' })); },
    async show(tab){ if (!tab.hidden) return; tab.hidden = false; const p = tab.page; world.log(`${tab.name} shown`); if (p && p.alive) for (const fn of (p.docL.visibilitychange || []).slice()) callSite(p, () => fn({ type: 'visibilitychange' })); },
    /* Sign out from the header; if the not-saved notice comes up, the student either takes "Sign out anyway" or
       waits for the network and tries again (three tries, then anyway). Resolves when the device is signed out. */
    async signOut(tab, P, choice){
      beat(`${world.caseLabel}: ${P.key} signs out on ${tab.name} at ${rel(world.now)}`);
      for (let attempt = 0; attempt < 4; attempt++){
        const page = tab.page;
        if (!page || !page.alive) break;
        const before = page.notices.length;
        world.log(`${P.key} clicks Sign out on ${page.id}`);
        page.signOutClicked = true;
        siteRun(page, 'signOut()');
        const done = await world.waitFor(() => !dev.authUser || dev.authUser.uid !== P.uid || page.notices.length > before || !page.alive, 15000, 100);
        if (!dev.authUser || dev.authUser.uid !== P.uid) break;
        if (page.notices.length > before){
          const n = page.notices[page.notices.length - 1];
          if (choice === 'anyway' || attempt >= 2){
            await world.sleep(1500);
            world.log(`${P.key} takes "Sign out anyway"`);
            if (n.go && n.go.onclick) callSite(page, () => n.go.onclick());
            await world.waitFor(() => !dev.authUser || dev.authUser.uid !== P.uid, 10000, 100);
            break;
          }
          const ph = dev.phaseAt(world.now);
          const back = ph.phase === 'up' ? 3000 : Math.min(ph.until - world.now + 2500, 60000);
          world.log(`${P.key} waits ${Math.round(back / 1000)} s and tries Sign out again`);
          if (n.el && n.el.remove) n.el.remove();
          await world.sleep(back);
          continue;
        }
        if (!done) break;
      }
      await world.waitFor(() => tab.page && tab.page.alive && tab.page !== null && (wallUp(tab.page)), 8000, 100);
    }
  };
  return H;
}
function describe(a){
  switch (a.kind){
    case 'tick': return `${a.on ? 'ticks' : 'un-ticks'} ${a.key}`;
    case 'answer': return `answers ${a.key}: "${a.text}"`;
    case 'rep': return `logs a rep on ${a.key} (best ${a.best})`;
    case 'check': return `takes exit check ${a.key}: ${a.picks.join(',')}`;
    case 'path': return `picks path ${a.pick} on ${a.key}`;
    case 'pr': return `records tempo ${a.value} on ${a.key}`;
    case 'card': return `marks card ${a.key} complete`;
    case 'dk': return `deck best ${a.n} on ${a.key}`;
    case 'adopt': return `(sign-in folds in this device's legacy ticks ${a.keys.join(', ')})`;
  }
  return a.kind;
}
/* Practice minutes: the student is "working" — pointer events to the page's own listeners every 10 s. */
function pokeInput(world, page, ms){
  const end = world.now + ms;
  const tick = () => {
    if (!page.alive || world.now > end) return;
    for (const type of ['pointerdown', 'keydown']) for (const fn of (page.docL[type] || []).slice()) callSite(page, () => fn({ type, isTrusted: true, target: page.ctx.document.body }));
    for (const type of ['pointerdown', 'keydown']) for (const fn of (page.winL[type] || []).slice()) callSite(page, () => fn({ type, isTrusted: true, target: page.ctx.document.body }));
    world.at(world.now + 10000, tick, null, 'script');
  };
  tick();
}

/* R4: what a person's first screen holds — read from the page's state, never decided by calling site logic. */
const PROBE_GLOBALS = ['completed', 'responses', 'caStepDone', 'classActivities', 'exitChecks', 'games', 'streak', 'practiceLog', 'songReady',
  'studentPeriod', 'periodOverride', 'moduleOpenThrough', 'activityForMe', 'gamesAccessOn', 'accountPaused', 'lastSetId', 'progressLoadFailed', 'lastModuleNum'];
function probe(world, page, P){
  const out = { at: world.now, who: P.key, page: page.id, tab: page.tab.name, vals: {}, taint: [], session: Object.keys(page.tab.session._d), teacherMode: page.teacherMode };
  const names = globalNames(ROOT);
  let all = {};
  try {
    all = page.run(`(function(){ const o = {}; ${names.map(n => `try { o[${JSON.stringify(n)}] = (typeof ${n} === 'undefined') ? undefined : ${n}; } catch(e){}`).join(' ')} return o; })()`);
  } catch (e){ out.taint.push({ name: '(probe failed)', owner: '?', text: e.message }); }
  for (const g of PROBE_GLOBALS) out.vals[g] = clone(plain(all[g]));
  const foreign = [];
  for (const k of Object.keys(world.markers)) if (world.people[k].uid !== P.uid && world.onDevice.has(k)) for (const t of world.markers[k]) foreign.push({ owner: k, text: t });
  for (const n of Object.keys(all)){
    const s = flatString(all[n]);
    if (!s) continue;
    for (const m of foreign) if (s.includes(m.text)) out.taint.push({ name: n, owner: m.owner, text: m.text });
  }
  /* What is on the page NOW: markup written earlier (by a page that did not reload) counts as much as new markup. */
  for (const id of Object.keys(page.els)){
    const el = page.els[id];
    const s = (el._h || '') + '\u0001' + (el._t || '');
    for (const m of foreign) if (s.includes(m.text)) out.taint.push({ name: '#' + id + ' (markup on screen)', owner: m.owner, text: m.text });
  }
  return out;
}
function plain(v, depth){
  depth = depth || 0;
  if (v == null || typeof v !== 'object') return typeof v === 'function' ? undefined : v;
  if (v.__stub || depth > 6) return undefined;
  if (Array.isArray(v)) return v.map(x => plain(x, depth + 1));
  if (v instanceof Map) return undefined;
  const o = {};
  for (const k of Object.keys(v)){ const x = plain(v[k], depth + 1); if (x !== undefined) o[k] = x; }
  return o;
}
function flatString(v){
  const seen = new Set();
  let out = '', budget = 400000;
  const walk = (x, d) => {
    if (budget <= 0 || d > 8) return;
    if (typeof x === 'string'){ out += x + '\u0001'; budget -= x.length; return; }
    if (!x || typeof x !== 'object' || seen.has(x) || x.__stub) return;
    seen.add(x);
    if (x instanceof Map){ for (const [k, y] of x){ walk(k, d + 1); walk(y, d + 1); } return; }
    if (x instanceof Set){ for (const y of x) walk(y, d + 1); return; }
    for (const k of Object.keys(x)){ out += k + '\u0001'; walk(x[k], d + 1); }
  };
  walk(v, 0);
  return out;
}

/* ─────────────────────────── the scripts of each family ─────────────────────────── */
/* The device starts with what earlier days left on it: A's own per-student keys (A used this Chromebook before),
   and per-device settings. Values carry A's markers where they can. */
function seedDevice(world, dev, sc){
  const A = PEOPLE.A.uid, ls = dev.localStorage._d;
  ls['practiceLog:' + A] = JSON.stringify({ 'm9w2-s1': { reps: 41, todayCount: 1, lastDay: oDay(T0 - DAY), last: T0 - DAY, best: 77 }, 'zz-ama-note': { reps: 3, best: 1 } });
  ls['gc-lastModule:' + A] = '9';
  ls['gc-lastSet:' + A] = 'm9w2';
  ls['gc-srPicks:' + A] = JSON.stringify({ day: oDay(T0), ids: ['m9w2-s1'] });
  ls['micRecConsent:' + A] = 'yes';
  ls['caStepsToday:' + A] = JSON.stringify({ day: oDay(T0), done: { 'ca-18:2': true } });
  world.legacy = { A: { 'ca-18:2': true } };
  ls['caPeriodOverride'] = JSON.stringify({ uid: A, v: 'CAS' });
  ls['caOpenThrough'] = JSON.stringify({ uid: A, v: 9 });
  ls['caForMe'] = JSON.stringify({ uid: A, v: DATA.CARDS[1] ? { [DATA.CARDS[1]]: true } : {} });
  ls['stationView'] = 'list';
  /* Practice seconds A left queued here yesterday on a page that is gone (practice-minutes.js: "a page takes over the
     key of a page that is gone ... as soon as the student is known"): A's to adopt, never the next student's. */
  ls['pm:q:' + A + ':p0ldpage0001'] = JSON.stringify({ days: { [oDay(T0 - DAY)]: 240 }, at: T0 - 5 * 3600000 });
  void sc;
}
async function runFamily(world, dev, sc, H){
  const A = PEOPLE.A, B = PEOPLE.B;
  const fam = sc.fam === 'mix' ? sc.sub : sc.fam;
  const tab1 = newTab(world, dev, 'T1');
  seedDevice(world, dev, sc);
  openPage(world, tab1, false);
  const settle = async () => {
    await world.sleep(4000);
    for (const t of dev.tabs) if (t.frozenUntil) thaw(world, t);
    world.log('SETTLE: every tab hidden, then 25 s');
    for (const t of dev.tabs) await H.hide(t);
    await world.sleep(25000);
  };
  const lastAction = async (tab, P) => {
    const a = actionFor(sc, sc.actionKind, sc.r, P);
    const t0 = world.now;
    if (sc.net === 'slow') netWindow(world, dev, 'slow', 30000, Math.round(2500 + 3500 * sc.r()));
    if (sc.net === 'refused') netWindow(world, dev, 'refused', sc.actionKind === 'check' ? 6000 : 1500);
    if (sc.net === 'offline') netWindow(world, dev, 'offline', Math.round(15000 + 25000 * sc.r()));
    if (sc.net === 'stall') netWindow(world, dev, 'stall', Math.round(8000 + 22000 * sc.r()));
    await H.act(tab, P, a);
    void t0;
    return a;
  };
  if (fam === 'last-action'){
    if (!await H.signIn(tab1, A)) return;
    await H.act(tab1, A, actionFor(sc, pick(sc.r, ['answer', 'tick', 'rep']), sc.r, A));
    await world.sleep(5000);
    await lastAction(tab1, A);
    await world.sleep(sc.signOutAfter);
    await H.signOut(tab1, A, sc.noticeChoice);
    await world.sleep(Math.round(3000 + 5000 * sc.r()));
    if (await H.signIn(tab1, B)){ await H.act(tab1, B, actionFor(sc, 'tick', sc.r, B)); }
    await settle();
    return;
  }
  /* A live quiz is running in class: every page that signs a student in opens the round's clock (lq-q-opened in
     the tab's sessionStorage, live-quiz.js), so every tab a student used holds a per-student session key. */
  world.docs.set('liveQuiz/current', { data: { sessionId: 'sess-' + sc.seed, state: 'question', qIndex: 0, startedAt: world.now, limitSec: 30, questions: [{ type: 'mc', prompt: 'x', choices: ['a', 'b', 'c'], answer: 0 }] }, version: 1 });
  if (fam === 'first-screen' || fam === 'failed-reads'){
    if (!await H.signIn(tab1, A)) return;
    pokeInput(world, tab1.page, 75000);
    for (const k of ACTION_KINDS){ await H.act(tab1, A, actionFor(sc, k, sc.r, A)); await world.sleep(1500); }
    const dk = { kind: 'dk', key: 'chords-m9', n: 9 };
    await H.act(tab1, A, dk);
    if (sc.r() < 0.5){ world.log('A switches the language to Spanish (a device setting)'); siteRun(tab1.page, 'setLang("es")'); }
    siteRun(tab1.page, 'ensureCoachJs()');
    await world.sleep(3000);
    /* A answers the mic-recording question on this device ("Stop recording": the answer becomes "no", never asked
       again — for A). Written by the site's own micRecRevoke(). */
    world.log('A takes back the mic-recording consent (micRecRevoke)');
    siteRun(tab1.page, 'micRecRevoke()');
    await world.sleep(67000);
    await H.signOut(tab1, A, 'wait');
    await world.sleep(4000);
    if (fam === 'failed-reads'){
      const fk = sc.failKind;
      world.readFails = [];
      const span = { from: world.now, until: world.now + 60000 };
      if (fk === 'progress-refused' || fk === 'both') world.readFails.push(Object.assign({ prefix: 'progress/' }, span));
      if (fk === 'config-refused' || fk === 'both') world.readFails.push(Object.assign({ prefix: 'config/' }, span));
      if (fk === 'progress-offline'){ world.log('network offline for B\'s sign-in'); }
      if (fk === 'empty'){ world.docs.delete('progress/' + B.uid); world.seedDocs.B = null; world.docs.delete('config/class'); world.log('B has no doc and config/class is missing'); }
      if (fk === 'progress-offline'){
        /* Offline before the click: the popup itself needs the network, so the outage starts once B is back from it. */
        dev.pendingSignIn = B; world.onDevice.add('B');
        world.log('B clicks Sign in on ' + tab1.page.id);
        siteRun(tab1.page, 'signIn()');
        await world.waitFor(() => dev.authUser && dev.authUser.uid === B.uid, 8000, 20);
        netWindow(world, dev, 'offline', 30000);
      }
    } else if (sc.bKind === 'failed-read'){
      world.readFails = [{ prefix: 'progress/' + B.uid, from: world.now, until: world.now + 60000 }];
    }
    if (!await H.signIn(tab1, B)) return;
    if (tab1.page.alive){
      siteRun(tab1.page, 'ensureCoachJs()');
      await world.sleep(1500);
      world.firstScreens[world.firstScreens.length - 1].micAsk = tab1.page.alive ? safeEval(tab1.page, 'typeof micRecShouldAsk === "function" ? micRecShouldAsk() : "no coach"') : 'dead';
    }
    await world.sleep(70000);
    await H.act(tab1, B, actionFor(sc, 'tick', sc.r, B));
    await settle();
    return;
  }
  if (fam === 'two-tabs'){
    const tab2 = newTab(world, dev, 'T2');
    tab2.hidden = true;
    openPage(world, tab2, false);
    if (!await H.signIn(tab1, A)) return;
    await world.waitFor(() => appUp(tab2.page, A), 20000, 100);
    if (appUp(tab2.page, A)) H.firstScreen(tab2.page, A);
    await H.act(tab1, A, actionFor(sc, pick(sc.r, ['answer', 'rep']), sc.r, A));
    await world.sleep(4000);
    await lastAction(tab1, A);
    await world.sleep(Math.min(sc.signOutAfter, 700));
    world.log('A switches to T2');
    await H.hide(tab1);
    if (sc.frozen){ const until = tab1.frozenUntil = world.now + Math.round(20000 + 40000 * sc.r()); world.log(`T1 frozen by the browser until ${rel(until)}`); world.at(until, () => { if (tab1.frozenUntil === until) thaw(world, tab1); }, null, 'script'); }
    await H.show(tab2);
    await world.sleep(400);
    await H.signOut(tab2, A, sc.noticeChoice);
    await world.sleep(Math.round(2000 + 4000 * sc.r()));
    /* A frozen T1 is left frozen while B signs in on T2, so it wakes to a DIFFERENT student straight over A (the
       start.js swap branch: "Firebase reports B straight over A — another tab's sign-in on a shared Chromebook"). */
    const bTab = sc.bOnOtherTab && !sc.frozen ? tab1 : tab2;
    if (bTab === tab1){ await H.hide(tab2); if (tab1.frozenUntil) thaw(world, tab1); await H.show(tab1); }
    if (await H.signIn(bTab, B)){
      await H.act(bTab, B, actionFor(sc, 'tick', sc.r, B));
      await world.sleep(2000);
      /* B clicks the other tab: a frozen one thaws, and whatever it shows now must be B's or the wall. */
      const other = bTab === tab1 ? tab2 : tab1;
      world.log(`B switches to ${other.name}`);
      await H.hide(bTab);
      if (other.frozenUntil) thaw(world, other);
      await H.show(other);
      if (await world.waitFor(() => appUp(other.page, B), 15000, 100)) H.firstScreen(other.page, B);
    }
    await settle();
    return;
  }
  if (fam === 'round-trip'){
    if (!await H.signIn(tab1, A)) return;
    await H.act(tab1, A, actionFor(sc, 'answer', sc.r, A));
    await world.sleep(1000);
    await H.act(tab1, A, actionFor(sc, sc.actionKind, sc.r, A));
    await world.sleep(sc.signOutAfter);
    await H.signOut(tab1, A, 'wait');
    await world.sleep(3000);
    if (sc.roundKind === 'A-B-A'){
      if (await H.signIn(tab1, B)){
        await H.act(tab1, B, actionFor(sc, 'answer', sc.r, B));
        await world.sleep(1200);
        await H.signOut(tab1, B, 'wait');
        await world.sleep(3000);
      }
    }
    if (await H.signIn(tab1, A)) await H.act(tab1, A, actionFor(sc, 'tick', sc.r, A));
    await settle();
    return;
  }
  if (fam === 'teacher'){
    const T = world.people.T;
    /* The console (?teacher) is not driven here: its activity list paints with box.querySelector() on the markup it
       just wrote, which the stub DOM cannot answer, and its async painter then never settles (2026-11-13). The
       teacher signs in on the STUDENT page instead (a gate previewer: the same Firebase account on the same device),
       which is the half that shares the student page's state, storage and save path. */
    const onConsole = false;
    const teacherVisit = async () => {
      if (onConsole){ killPage(tab1.page); openPage(world, tab1, true); world.log('the teacher opens the console address in this tab'); }
      if (await H.signIn(tab1, T)){
        if (onConsole){ world.onDevice.add('B'); world.onDevice.add('C'); }
        await world.sleep(6000);
        await H.signOut(tab1, T, 'wait');
        await world.sleep(2000);
      }
      if (onConsole){ killPage(tab1.page); openPage(world, tab1, false); world.log('the tab goes back to the student page'); }
    };
    if (sc.teacherOrder === 'before') await teacherVisit();
    if (!await H.signIn(tab1, A)) return;
    await H.act(tab1, A, actionFor(sc, sc.actionKind, sc.r, A));
    await world.sleep(sc.signOutAfter);
    await H.signOut(tab1, A, 'wait');
    await world.sleep(3000);
    if (sc.teacherOrder === 'after') await teacherVisit();
    else if (await H.signIn(tab1, B)) await H.act(tab1, B, actionFor(sc, 'tick', sc.r, B));
    await settle();
    return;
  }
  if (fam === 'playing'){
    if (!await H.signIn(tab1, A)) return;
    siteRun(tab1.page, 'ensureCoachJs()');
    await world.sleep(1500);
    if (sc.playKind !== 'note'){ world.log('A opens the mic (a listening game)'); siteRun(tab1.page, 'coachAcquireMic().then(ok => { window.coachMicLive = !!ok; })'); }
    if (sc.playKind !== 'mic'){ world.log('A plays a note'); siteRun(tab1.page, 'playNote(52)'); }
    await world.sleep(800);
    await H.act(tab1, A, actionFor(sc, sc.actionKind, sc.r, A));
    if (sc.net === 'offline') netWindow(world, dev, 'offline', 20000);
    await world.sleep(sc.signOutAfter);
    await H.signOut(tab1, A, sc.noticeChoice);
    await world.sleep(3000);
    if (await H.signIn(tab1, B)) await H.act(tab1, B, actionFor(sc, 'tick', sc.r, B));
    await settle();
    return;
  }
  throw new Error('no script for family ' + fam);
}
function safeEval(page, code){ try { return clone(plain(page.run(code))); } catch (e){ return 'threw: ' + e.message; } }

/* R5: a page still showing the person who just left, 3 s after the sign-out reached it. */
function watchAuth(world, dev){
  world.r5 = [];
  let last = dev.authUser ? dev.authUser.uid : null;
  const check = (gone, at) => {
    for (const tab of dev.tabs){
      const p = tab.page;
      if (!p || !p.alive) continue;
      if (tab.frozenUntil && world.now < tab.frozenUntil){ (tab.pendingChecks = tab.pendingChecks || []).push(() => check(gone, at)); continue; }
      refreshUid(p);
      /* The page showed the person who left (its auth callback ran for them) and is still alive: a state reset is
         not the hard reset boot.js signOut asks for ("Reloading clears the lot in one move"). */
      if (p.sawUids && p.sawUids.has(gone) && (!dev.authUser || dev.authUser.uid !== gone)){
        const live = p.audio.tracks.filter(t => t.live).length;
        world.r5.push({ at: world.now, page: p.id, gone, since: at, mic: live, sound: p.audio.sources - p.audio.stopped, now: p.siteUidCache });
      }
    }
  };
  world.onAuthChange = () => {
    const now = dev.authUser ? dev.authUser.uid : null;
    if (last && last !== now){ const gone = last, at = world.now; world.at(world.now + 3300, () => check(gone, at), null, 'script'); }
    last = now;
  };
}

/* ─────────────────────────── the oracle (never calls the site) ─────────────────────────── */
const CATS = ['completed', 'caSteps', 'classActivities', 'responses', 'practiceLog', 'exitChecks', 'skills', 'songReady', 'songReadyAt'];
function recordsOf(doc){
  const out = [];
  if (!doc) return out;
  for (const c of CATS) if (isMap(doc[c])) for (const k of Object.keys(doc[c])) out.push([c, k]);
  if (isMap(doc.games)) for (const k of Object.keys(doc.games)) out.push(['games', k]);
  if ('streak' in doc) out.push(['streak']);
  if ('period' in doc) out.push(['period']);
  return out;
}
const getRec = (d, r) => { let o = d; for (const k of r){ if (!isMap(o)) return undefined; o = o[k]; } return o; };
/* R1: the effects of one action on the records of the doc, in the oracle's own words. */
function effectsOf(a){
  const day = oDay(a.t);
  switch (a.kind){
    case 'tick': return [{ rec: ['completed', a.key], fn: () => (a.on ? true : undefined) }];
    case 'answer': return [{ rec: ['responses', a.key], fn: () => a.text }];
    case 'rep': return [{ rec: ['practiceLog', a.key], fn: prev => {
      const e = isMap(prev) ? clone(prev) : { reps: 0 };
      if (e.lastDay !== day){ e.lastDay = day; e.todayCount = 0; }
      e.reps = (e.reps || 0) + 1; e.todayCount = (e.todayCount || 0) + 1; e.last = a.t;
      e.best = Math.max(e.best || 0, a.best);
      return e;
    }, loose: ['last'] }];
    case 'pr': return [{ rec: ['responses', a.key], fn: prev => {
      const arr = Array.isArray(prev) ? clone(prev) : (prev != null && prev !== '' ? [{ value: prev, date: null }] : []);
      arr.push({ value: a.value, date: new Date(a.t).toISOString() });
      if (arr.length > 8) arr.shift();
      return arr;
    } }];
    case 'check': {
      const items = DATA.CHECKS[a.key];
      const score = items.reduce((n, ans, i) => n + (String(a.picks[i]) === String(ans) ? 1 : 0), 0);
      return [
        { rec: ['exitChecks', a.key], fn: prev => ({ score, total: items.length, picks: a.picks.map(String), at: day, attempts: ((prev && prev.attempts) || 0) + 1 }), group: 'check' },
        { rec: ['classActivities', a.key], fn: () => true, group: 'check' }
      ];
    }
    case 'path': return a.keys.map(k => ({ rec: ['caSteps', `${a.key}:path:${k}`], fn: () => (k === a.pick ? true : undefined), group: 'path' }));
    case 'card': return [{ rec: ['classActivities', a.key], fn: () => true }];
    case 'adopt': return a.keys.map(k => ({ rec: ['caSteps', k], fn: () => true }));
    case 'dk': return [{ rec: ['games', 'dk'], fn: prev => { const m = isMap(prev) ? clone(prev) : {}; if ((m[a.key] || 0) >= a.n) return prev; m[a.key] = a.n; m.at = day; return m; } }];
  }
  throw new Error('oracle: unknown action ' + a.kind);
}
/* Was the person told this action did not save? (R1) */
function toldAbout(world, a){
  const page = world.allPages.find(p => p.id === a.page);
  if (!page) return false;
  if (page.notices.some(n => n.at >= a.t)) return true;
  if (page.saveMsgs.some(m => m.at >= a.t && m.at <= a.t + 50 && m.key === 'save.notSaving')) return true;
  return false;
}
/* KNOWN site faults this tool found that are still open (listed with the date). A finding that matches an entry
   EXACTLY prints as "~ known" and does not fail; anything else fails. A full default run (every family, 120 cases or
   more) in which an entry matches nothing FAILS, so a fixed fault gets its entry taken out.
   K-TAB (listed 2026-11-12): a student's work still unsaved in ANOTHER tab (its write queued offline or stalled,
   refused and waiting for its retry, or not yet sent) is thrown away without a word when the student signs out from
   this tab: signOut() (boot.js) waits only for its OWN tab's writes, and the other tab, told "signed out" by Firebase,
   hard-resets at once (start.js, the null branch — or, when it was frozen, the swap branch). Matched only when the
   lost action's page never had Sign out clicked on it, died by that reload after its sign-in moved away from the
   student, and showed no not-saved notice. */
const KNOWN = [{ id: 'K-TAB', listed: '2026-11-12' }];
function knownTabLoss(world, a){
  const page = world.allPages.find(p => p.id === a.page);
  if (!page || page.signOutClicked || page.diedAt == null || page.notices.length) return false;
  const last = (page.authLog || []).filter(x => x.at <= page.diedAt).pop();
  return !!(page.reloadAsked && last && last.uid !== world.people[a.who].uid);
}
function oracle(sc, world, dev){
  const fails = [], known = [];
  const fail = (rule, msg) => fails.push({ rule, msg });
  world.allPages = dev.tabs.flatMap(t => t.pages);
  let compared = 0, actionsLanded = 0, actionsTold = 0, actionsLost = 0;
  /* The legacy day ticks a student left on this Chromebook before 2026-10-01 (caStepsToday:<uid>) are folded into
     THAT student's progress at their first sign-in whose read succeeds (activities.js: "Fold any still on this
     Chromebook into the student's progress once, then drop the local copy"). An owed action of that student. */
  const legacyLeft = {};
  for (const [k, done] of Object.entries(world.legacy || {})) legacyLeft[k] = Object.keys(done);
  const legacyAt = {};
  for (const fs of world.firstScreens.slice().sort((x, y) => x.at - y.at)){
    const page = world.allPages.find(p => p.id === fs.page);
    const P = world.people[fs.who];
    const pr = page && (page.reads['progress/' + P.uid] || []).filter(x => x.at <= fs.at).pop();
    fs.legacy = [];
    if (fs.teacherMode || !pr || !pr.ok || !(legacyLeft[fs.who] || []).length) continue;
    fs.legacy = legacyLeft[fs.who]; legacyLeft[fs.who] = [];
    legacyAt[fs.who] = true;
    world.ledger.push({ kind: 'adopt', who: fs.who, keys: fs.legacy, t: fs.at, page: fs.page, done: true });
  }
  /* R1 + R2: each person's final doc. */
  for (const k of Object.keys(world.people)){
    const P = world.people[k];
    const base = world.seedDocs[k] ? clone(world.seedDocs[k]) : null;
    const end = world.docs.get('progress/' + P.uid);
    const fin = end ? end.data : null;
    const acts = world.ledger.filter(a => a.who === k);
    const recs = new Map();
    const add = r => { const key = r.join('\u0001'); if (!recs.has(key)) recs.set(key, { rec: r, effs: [] }); return recs.get(key); };
    for (const r of recordsOf(base)) add(r);
    for (const r of recordsOf(fin)) add(r);
    for (const a of acts){
      const told = toldAbout(world, a);
      a.told = told;
      for (const e of effectsOf(a)) add(e.rec).effs.push({ a, e, told });
    }
    const acted = acts.some(a => a.kind !== 'adopt');
    for (const { rec, effs } of recs.values()){
      compared++;
      /* The XP layer's own bookkeeping (games.meta, games.srBonusDay: explore.js Daily Review's once-a-day bonus and
         the arcade XP) follows from the student's own reps; it may change in the doc of a student who acted on this
         device, never in anyone else's. Foreign VALUES in it are still caught by R3's marker scan. */
      if (!effs.length && acted && rec[0] === 'games' && (rec[1] === 'meta' || rec[1] === 'srBonusDay')) continue;
      const accept = optional => {
        const free = effs.filter(optional);
        const ok = new Set();
        for (let mask = 0; mask < (1 << Math.min(free.length, 10)); mask++){
          let v = getRec(base, rec);
          for (const x of effs){ if (optional(x) && !(mask & (1 << free.indexOf(x)))) continue; v = x.e.fn(v); }
          ok.add(canonLoose(v, effs));
        }
        return ok;
      };
      const ok = accept(x => x.told);
      const got = canonLoose(getRec(fin, rec), effs);
      if (!ok.has(got)){
        const owner = effs.length ? `after ${effs.map(x => x.a.who + ' ' + describe(x.a) + (x.told ? ' (told)' : '')).join('; ')}` : 'no action touched it';
        const msg = `progress/${P.uid} ${rec.join('.')} = ${short(got)}; wanted ${[...ok].map(short).join(' or ')} (${owner})`;
        /* KNOWN K-TAB: the value is right once the actions K-TAB explains are allowed to be missing. */
        const k = effs.some(x => !x.told && knownTabLoss(world, x.a)) && accept(x => x.told || knownTabLoss(world, x.a)).has(got);
        if (k) known.push({ id: 'K-TAB', msg });
        else fail(effs.length ? 'R1' : 'R2', msg);
      }
    }
    for (const a of acts){
      const effs = effectsOf(a);
      const landed = effs.every(e => canonLoose(getRec(fin, e.rec), [{ e }]) === canonLoose(e.fn(getRec(base, e.rec)), [{ e }]));
      if (landed) actionsLanded++; else if (a.told) actionsTold++; else actionsLost++;
    }
  }
  /* R3: every write the server saw. */
  let writesChecked = 0;
  const crossRefused = [];
  const uidOwner = Object.fromEntries(Object.entries(world.people).map(([k, P]) => [P.uid, k]));
  for (const w of world.writes){
    for (const it of w.items){
      const seg = it.path.split('/');
      if (seg[0] !== 'progress' && seg[0] !== 'minutes') continue;
      writesChecked++;
      const target = seg[1];
      if (w.token !== target){
        if (w.ok) fail('R3', `${w.page} wrote to ${it.path} under ${w.token || 'nobody'}'s sign-in and it LANDED, at ${rel(w.sentAt)}`);
        else crossRefused.push(`${w.page} → ${it.path} under ${w.token || 'nobody'} at ${rel(w.sentAt)}`);
      }
      const s = flatString(it.data);
      for (const [k, list] of Object.entries(world.markers)){
        if (world.people[k].uid === target) continue;
        for (const m of list) if (s.includes(m)) fail('R3', `${w.page} wrote ${JSON.stringify(m)} (${k}'s) into ${it.path} (${w.ok ? 'landed' : 'refused'}) at ${rel(w.sentAt)}`);
      }
    }
  }
  /* R4: every first screen. */
  let screens = 0;
  for (const fs of world.firstScreens){
    screens++;
    const P = world.people[fs.who];
    const page = world.allPages.find(p => p.id === fs.page);
    for (const t of fs.taint.slice(0, 4)) fail('R4', `${fs.who}'s first screen on ${fs.page}: variable ${t.name} holds ${t.owner}'s ${JSON.stringify(t.text)}`);
    if (fs.teacherMode) continue;
    const pr = (page.reads['progress/' + P.uid] || []).filter(x => x.at <= fs.at).pop();
    const cf = (page.reads['config/class'] || []).filter(x => x.at <= fs.at).pop();
    const doc = pr && pr.ok && pr.exists ? pr.data : null;
    const lsAt = world.lsBefore[fs.page] || world.lsLatest || {};
    let localLog = {}; try { localLog = JSON.parse(lsAt['practiceLog:' + P.uid] || 'null') || {}; } catch {}
    const want = {
      completed: (doc && doc.completed) || {}, responses: (doc && doc.responses) || {},
      caStepDone: Object.assign(Object.fromEntries(Object.entries((doc && doc.caSteps) || {}).filter(([, v]) => v === true)), Object.fromEntries((fs.legacy || []).map(k => [k, true]))),
      classActivities: (doc && doc.classActivities) || {}, exitChecks: (doc && doc.exitChecks) || {}, games: (doc && doc.games) || {},
      streak: (doc && doc.streak) || { count: 0, lastDay: null }, practiceLog: (doc && doc.practiceLog) || localLog,
      songReady: (doc && doc.songReady) || {}, studentPeriod: (doc && doc.period) || '', accountPaused: false
    };
    const cfg = cf && cf.ok && cf.exists ? cf.data : null;
    const ownOverride = cfg ? ((cfg.periodOverrides || {})[P.uid] || '') : null;
    const ownOpen = cfg ? (Number((cfg.moduleOpenThrough || {})[P.uid]) || 0) : null;
    const gamesOv = cfg ? (cfg.gameOverrides || {})[P.uid] : undefined;
    for (const g of Object.keys(want)){
      compared++;
      if (canon(fs.vals[g]) !== canon(want[g])) fail('R4', `${fs.who}'s first screen on ${fs.page}: ${g} = ${short(canon(fs.vals[g]))}; ${pr && pr.ok ? (doc ? 'the doc holds' : 'no doc, so') : 'the read failed, so'} ${short(canon(want[g]))}`);
    }
    compared += 5;
    if (ownOverride != null){ if (fs.vals.periodOverride !== ownOverride) fail('R4', `${fs.who}'s first screen: periodOverride = ${JSON.stringify(fs.vals.periodOverride)}; the config says ${JSON.stringify(ownOverride)} for this uid`); }
    else if (fs.vals.periodOverride && fs.who !== 'A') fail('R4', `${fs.who}'s first screen (config read failed): periodOverride = ${JSON.stringify(fs.vals.periodOverride)}, another student's (A's cached CAS)`);
    if (ownOpen != null){ if (fs.vals.moduleOpenThrough !== ownOpen) fail('R4', `${fs.who}'s first screen: moduleOpenThrough = ${fs.vals.moduleOpenThrough}; the config says ${ownOpen}`); }
    else if (fs.vals.moduleOpenThrough && fs.who !== 'A') fail('R4', `${fs.who}'s first screen (config read failed): moduleOpenThrough = ${fs.vals.moduleOpenThrough}, another student's`);
    const forMe = Object.keys(fs.vals.activityForMe || {}).filter(id => fs.vals.activityForMe[id] === true);
    const wantForMe = cfg ? Object.keys(cfg.activityStudents || {}).filter(id => (cfg.activityStudents[id] || {})[P.uid] === true) : (fs.who === 'A' ? null : []);
    if (wantForMe && canon(forMe.sort()) !== canon(wantForMe.sort())) fail('R4', `${fs.who}'s first screen: activities "for me" = ${JSON.stringify(forMe)}; wanted ${JSON.stringify(wantForMe)}`);
    const wantGames = gamesOv === true ? true : gamesOv === false ? false : (cfg ? cfg.gamesEnabled !== false : true);
    if (fs.vals.gamesAccessOn !== wantGames) fail('R4', `${fs.who}'s first screen: games access ${fs.vals.gamesAccessOn}; wanted ${wantGames}`);
    for (const k of Object.keys(world.people)) if (k !== fs.who){
      const ls = world.seedDocs[k] && world.seedDocs[k].lastSet;
      const own = world.seedDocs[fs.who] && world.seedDocs[fs.who].lastSet;
      if (ls && fs.vals.lastSetId === ls && ls !== own) fail('R4', `${fs.who}'s first screen: lastSetId = ${ls}, ${k}'s last set`);
    }
    /* The mic-recording question (coach-core.js): asked when the teacher's switch is on and under its quota — read
       from config/class and micTakesMeta/count, "Fail CLOSED — anything short of a successful read of both leaves
       collection off" (boot.js) — and THIS student has not answered it on this device. B never has. */
    if ('micAsk' in fs){
      const cnt = (page.reads['micTakesMeta/count'] || []).filter(x => x.at <= fs.at + 1500).pop();
      const open = !!(cfg && cfg.micSampling && cfg.micSampling.on === true && cnt && cnt.ok && cnt.exists && (cnt.data.n || 0) < (cfg.micSampling.max || 0));
      if (fs.micAsk !== open) fail('R4', `${fs.who}'s first screen: the mic-recording question would ${fs.micAsk === true ? '' : 'NOT '}be asked (${JSON.stringify(fs.micAsk)}); wanted ${open ? 'asked: this student never answered it on this device' : 'not asked: the switch or the count was not read'}`);
    }
    /* The tab's sessionStorage: nothing written before this person signed in, while someone else was. */
    const tab = page.tab;
    const signedInAt = (page.authAt && page.authAt[P.uid] != null) ? page.authAt[P.uid] : fs.signInClick != null ? fs.signInClick : fs.at;
    for (const key of fs.session){
      const w = fs.sessionWho[key];
      if (w && w.at < signedInAt && w.authUid && w.authUid !== P.uid) fail('R4', `${fs.who}'s first screen on ${fs.page}: sessionStorage still holds "${key}", written in ${uidOwner[w.authUid] || w.authUid}'s session at ${rel(w.at)}`);
    }
    void tab;
    /* localStorage keys named with another person's uid, read by this page while it showed this person. */
    const leftAt = ((page.authLog || []).find(x => x.at > signedInAt && x.uid !== P.uid) || {}).at;
    const readsUntil = Math.min(fs.at + 60000, leftAt != null ? leftAt : Infinity);
    for (const e of dev.accessLog){
      if (e.page !== fs.page || e.op !== 'get' || e.at < signedInAt || e.at >= readsUntil) continue;
      for (const [k, Q] of Object.entries(world.people)) if (Q.uid !== P.uid && e.k.includes(Q.uid)) fail('R4', `${fs.page} (showing ${fs.who}) read localStorage "${e.k}", ${k}'s key, at ${rel(e.at)}`);
    }
    /* R5's other half: no live mic on the device at this person's first screen. */
    for (const t of dev.tabs) for (const p of t.pages) if (p.alive && p !== page){
      const live = p.audio.tracks.filter(x => x.live).length;
      if (live) fail('R5', `at ${fs.who}'s first screen, ${p.id} still holds an open mic`);
    }
    if (page.audio.tracks.some(x => x.live)) fail('R5', `${fs.who}'s first screen on ${fs.page}: an open mic this student never started`);
  }
  for (const h of world.r5) fail('R5', `${h.page} showed ${uidOwner[h.gone] || h.gone} and is still alive 3 s after that student's sign-out (at ${rel(h.since)}; the page now shows ${h.now ? (uidOwner[h.now] || h.now) : 'nobody'}${h.mic ? '; its mic is still open' : ''}${h.sound > 0 ? '; ' + h.sound + ' sound source(s) never stopped' : ''})`);
  /* Marker hits in markup, per page: a page showing X drew someone else's marker. */
  for (const p of world.allPages){
    for (const h of p.markerHits.slice(0, 3)) fail('R4', `${p.id} drew ${h.owner}'s ${JSON.stringify(h.text)} into ${h.where} at ${rel(h.at)} (while showing ${uidOwner[h.shownAs] || h.shownAs || 'nobody'})`);
  }
  /* R6: practice minutes. */
  let pmSeconds = { };
  for (const w of world.writes) if (w.ok) for (const it of w.items){
    const seg = it.path.split('/');
    if (seg[0] === 'minutes' && seg[2] === 'days' && it.data && it.data.seconds instanceof FieldIncrement) pmSeconds[seg[1]] = (pmSeconds[seg[1]] || 0) + it.data.seconds.n;
  }
  for (const [uid, s] of Object.entries(pmSeconds)) if (uid !== PEOPLE.A.uid && s > 0) fail('R6', `minutes/${uid} got ${s} s of practice; that person made no input on this device`);
  for (const e of dev.accessLog){
    if (e.op !== 'set' && e.op !== 'remove') continue;
    for (const [k, Q] of Object.entries(world.people)){
      if (!e.k.includes(Q.uid)) continue;
      if (/^pm:/.test(e.k)){
        /* The practice-minutes engine follows Firebase's user, not the page's (boot.js PM_HOST.user reads
           auth.currentUser) and settles a switch itself (pm-sim covers it). What must hold: a queue named for
           someone who made no input never holds seconds. */
        if (e.op === 'set' && /^pm:q:/.test(e.k) && k !== 'A'){
          let secs = 0; try { const v = JSON.parse(e.v); for (const d of Object.values((v && v.days) || {})) secs += Number(d) || 0; } catch {}
          if (secs > 0) fail('R6', `${e.page} queued ${secs} s of practice under "${e.k}" (${k}'s queue) at ${rel(e.at)}; ${k} made no input`);
        }
        continue;
      }
      if (e.siteUid && e.siteUid !== Q.uid) fail('R6', `${e.page} ${e.op === 'set' ? 'wrote' : 'removed'} localStorage "${e.k}" (${k}'s key) while that page showed ${uidOwner[e.siteUid] || e.siteUid}, at ${rel(e.at)}`);
    }
  }
  /* R7 */
  for (const f of world.siteFaults.slice(0, 4)) fail('R7', f);
  return { fails: dedupe(fails), known: dedupe(known), compared, writesChecked, screens, actionsLanded, actionsTold, actionsLost, pmSeconds, crossRefused };
}
function dedupe(fails){ const seen = new Set(); return fails.filter(f => { const k = f.rule + f.msg; if (seen.has(k)) return false; seen.add(k); return true; }); }
/* A rep's `last` is the action's millisecond; the site stamps Date.now() when its handler runs (the same virtual
   instant, or the exit check's last pick). Compared to the second. */
function canonLoose(v, effs){
  if (effs.some(x => x.e.loose) && isMap(v) && typeof v.last === 'number') return canon(Object.assign({}, v, { last: Math.floor(v.last / 1000) }));
  return canon(v);
}
const short = s => (String(s).length > 140 ? String(s).slice(0, 137) + '...' : String(s));

/* ─────────────────────────── one case, start to end ─────────────────────────── */
async function runCase(idx, famFilter){
  const sc = makeScenario(idx, famFilter);
  const world = buildWorld(sc);
  world.caseLabel = `case ${idx} (${sc.fam})`;
  CURRENT_WORLD = world;
  const dev = makeDevice(world, []);
  world.lsBefore = {};
  watchAuth(world, dev);
  const origSet = setDeviceAuth;
  void origSet;
  const H = hands(world, dev, sc);
  /* The moment each page's person is signed in: what the device held, for R4's practiceLog fallback. */
  const firstScreenOrig = H.firstScreen;
  H.firstScreen = (page, P) => {
    firstScreenOrig(page, P);
    const fs = world.firstScreens[world.firstScreens.length - 1];
    fs.sessionWho = Object.assign({}, page.tab.sessionWrites);
  };
  const signInOrig = H.signIn;
  H.signIn = async (tab, P) => {
    world.lsLatest = Object.assign({}, dev.localStorage._d);
    if (tab.page) world.lsBefore[tab.page.id] = world.lsLatest;
    const t = world.now;
    const n0 = world.firstScreens.length;
    const ok = await signInOrig(tab, P);
    for (const fs of world.firstScreens.slice(n0)) fs.signInClick = t;
    if (tab.page && !world.lsBefore[tab.page.id]) world.lsBefore[tab.page.id] = {};
    return ok;
  };
  const done = (async () => { try { await runFamily(world, dev, sc, H); } catch (e){ world.toolError = e; } })();
  let finished = false;
  done.then(() => { finished = true; });
  const END = T0 + 30 * 60000;
  while (!finished && world.now < END){
    await world.runUntil(world.now + 5000, `case ${idx} (${sc.fam})`);
    beat(`case ${idx} (${sc.fam}) at ${rel(world.now)}`);
  }
  if (finished) await world.runUntil(world.now + 4000, `case ${idx} (${sc.fam}) closing`);
  for (const t of dev.tabs) for (const p of t.pages) p.alive = false;
  await world.drain();
  CURRENT_WORLD = null;
  if (world.toolError) throw world.toolError;
  if (!finished) world.siteFaults.push('the scenario did not finish within 30 virtual minutes');
  const res = oracle(sc, world, dev);
  return { sc, world, dev, res };
}

/* ─────────────────────────── the fake world's self-test ─────────────────────────── */
function miniPage(world, tab){
  const page = { id: `${tab.name}#${tab.loads + 1}`, tab, world, alive: true, unloading: false, lostOps: [], authCbs: [], authSeenKey: undefined, authUser: null, docL: {}, winL: {}, reads: {}, notices: [], saveMsgs: [], markerHits: [], audio: { tracks: [], sources: 0, stopped: 0 }, seen: [] };
  tab.loads++;
  page.ctx = vm.createContext({});
  page.run = code => vm.runInContext(code, page.ctx);
  page.siteUid = () => page.authSeenKey || null;
  page.client = makeClient(world, page);
  page.authCbs.push(u => page.seen.push(u ? u.uid : null));
  page.ls = localStorageFor(tab);
  tab.page = page; tab.pages.push(page);
  world.at(world.now + 50, () => deliverAuth(page, tab.device.authUser, true), page, 'timer');
  return page;
}
async function fakeSelfTest(){
  const out = [];
  const check = (name, ok, detail) => out.push({ name, ok: !!ok, detail });
  const fresh = () => {
    const world = new World(11); world.teacherEmail = 'teacher@example.test'; world.snapListeners = []; world.authHistory = []; world.siteFaults = [];
    const dev = makeDevice(world, []);
    return { world, dev };
  };
  const ama = fbUser(PEOPLE.A), bo = fbUser(PEOPLE.B);
  {
    const { world, dev } = fresh();
    const t1 = newTab(world, dev, 'S1'), t2 = newTab(world, dev, 'S2');
    const p1 = miniPage(world, t1), p2 = miniPage(world, t2);
    await world.runUntil(world.now + 500, 'self-test');
    setDeviceAuth(world, dev, ama, p1);
    await world.runUntil(world.now + 1000, 'self-test');
    p1.ls.setItem('k', 'v');
    check('A1/A2 a sign-in in one tab reaches every tab of the device', p1.seen.includes(PEOPLE.A.uid) && p2.seen.includes(PEOPLE.A.uid), `S1 ${p1.seen} S2 ${p2.seen}`);
    check('D1 the tabs of a device share one localStorage', p2.ls.getItem('k') === 'v');
  }
  {
    const { world, dev } = fresh();
    const t1 = newTab(world, dev, 'S1');
    const p1 = miniPage(world, t1);
    await world.runUntil(world.now + 500, 'self-test');
    setDeviceAuth(world, dev, ama, p1);
    await world.runUntil(world.now + 500, 'self-test');
    netWindow(world, dev, 'offline', 4000);
    p1.client.db.collection('progress').doc(PEOPLE.A.uid).set({ x: 1 }, { merge: true }).catch(() => {});
    await world.runUntil(world.now + 1000, 'self-test');
    setDeviceAuth(world, dev, bo, p1);
    await world.runUntil(world.now + 8000, 'self-test');
    const sentUnderB = world.writes.filter(w => w.token === PEOPLE.B.uid);
    check('F2 a write queued for one user is never sent under the next user\'s sign-in', sentUnderB.length === 0 && !world.docs.has('progress/' + PEOPLE.A.uid), JSON.stringify(sentUnderB.map(w => w.items[0].path)));
  }
  {
    const { world, dev } = fresh();
    const t1 = newTab(world, dev, 'S1');
    t1.reopen = (w, tab) => miniPage(w, tab);
    const p1 = miniPage(world, t1);
    await world.runUntil(world.now + 500, 'self-test');
    setDeviceAuth(world, dev, ama, p1);
    await world.runUntil(world.now + 500, 'self-test');
    t1.session.setItem('best', '7');
    netWindow(world, dev, 'offline', 3000);
    p1.client.db.collection('progress').doc(PEOPLE.A.uid).set({ y: 1 }, { merge: true }).catch(() => {});
    await world.runUntil(world.now + 500, 'self-test');
    requestReload(p1);
    await world.runUntil(world.now + 8000, 'self-test');
    check('D3 a write still unsent when its page reloads is lost', !world.docs.has('progress/' + PEOPLE.A.uid));
    check('D2 a reload keeps the tab\'s sessionStorage', t1.session.getItem('best') === '7' && t1.page !== p1 && !p1.alive);
  }
  {
    const { world, dev } = fresh();
    const t1 = newTab(world, dev, 'S1');
    const p1 = miniPage(world, t1);
    await world.runUntil(world.now + 500, 'self-test');
    setDeviceAuth(world, dev, ama, p1);
    await world.runUntil(world.now + 500, 'self-test');
    let denied = false;
    p1.client.db.collection('progress').doc(PEOPLE.B.uid).set({ z: 1 }, { merge: true }).catch(() => { denied = true; });
    await world.runUntil(world.now + 2000, 'self-test');
    check('F6 the rules refuse a write to another student\'s progress doc', denied && !world.docs.has('progress/' + PEOPLE.B.uid));
  }
  {
    const { world, dev } = fresh();
    const t1 = newTab(world, dev, 'S1'), t2 = newTab(world, dev, 'S2');
    const p1 = miniPage(world, t1), p2 = miniPage(world, t2);
    await world.runUntil(world.now + 500, 'self-test');
    setDeviceAuth(world, dev, ama, p1);
    await world.runUntil(world.now + 1000, 'self-test');
    t2.frozenUntil = world.now + 10000;
    setDeviceAuth(world, dev, null, p1);
    await world.runUntil(world.now + 1000, 'self-test');
    setDeviceAuth(world, dev, bo, p1);
    await world.runUntil(world.now + 1000, 'self-test');
    const before = p2.seen.slice();
    thaw(world, t2);
    await world.runUntil(world.now + 1000, 'self-test');
    const got = p2.seen.slice(before.length);
    check('A3 a frozen tab that thaws receives only the latest sign-in', got.length === 1 && got[0] === PEOPLE.B.uid, JSON.stringify(got));
  }
  return out;
}

/* ─────────────────────────── main ─────────────────────────── */
async function main(){
  if (opt('list', false)){
    console.log('families:'); for (const [k, v] of Object.entries(FAMILIES)) console.log(`  ${k.padEnd(14)} ${v}`);
    console.log('fake faults (--fake-fault):'); for (const [k, v] of Object.entries(FAKE_FAULTS)) console.log(`  ${k.padEnd(26)} ${v}`);
    return 0;
  }
  if (FAKE_FAULT && !FAKE_FAULTS[FAKE_FAULT]){ console.error('shared-chromebook-loop: no fake fault ' + JSON.stringify(FAKE_FAULT) + ' (--list)'); return 2; }
  const famFilter = opt('family', '') ? String(opt('family')).split(',') : [];
  for (const f of famFilter) if (!FAMILIES[f]){ console.error('shared-chromebook-loop: no family ' + JSON.stringify(f) + ' (--list)'); return 2; }
  if (!existsSync(join(ROOT, 'index.html'))){ console.error('shared-chromebook-loop: ' + ROOT + ' is not a site folder (no index.html)'); return 2; }
  if (DATA.parseError){ console.log('✗ FAIL site: ' + DATA.parseError); return 1; }
  if (!DATA.TEACHER_EMAIL || !DATA.CHECKS['ca-15'] || DATA.PATHS.length < 2 || DATA.CARDS.length < 2){ console.error('shared-chromebook-loop: the site data changed (TEACHER_EMAIL, ca-15, ca-46 paths or practice cards missing): update the tool'); return 2; }
  const t0 = Date.now();
  const self = await fakeSelfTest();
  const selfBad = self.filter(x => !x.ok);
  console.log(`shared-chromebook-loop: fake-world self-test ${self.length - selfBad.length} of ${self.length} rules hold${FAKE_FAULT ? ` (fake fault planted: ${FAKE_FAULT})` : ''}`);
  for (const x of selfBad) console.log(`  ✗ FAKE ${x.name}${x.detail ? ' — ' + x.detail : ''}`);
  if (selfBad.length){ console.log('shared-chromebook-loop: ✗ the fake no longer behaves like the browser and Firestore; no case was run'); return 1; }
  try { for (const f of siteFiles(ROOT)) script(ROOT, f); }
  catch (e){ if (!e.siteFile) throw e; console.log('✗ FAIL site: ' + e.message); return 1; }
  const single = opt('case', null);
  const N = Number(opt('cases', 120));
  const idxs = single != null ? [Number(single)] : Array.from({ length: N }, (_, i) => i);
  const fams = {};
  const tot = { compared: 0, writesChecked: 0, screens: 0, landed: 0, told: 0, lost: 0, issued: 0, landedW: 0, refusedRules: 0, refusedServer: 0, lostPage: 0, lostUnload: 0, pages: 0, reloads: 0, reads: 0, readsFailed: 0, notices: 0, ledger: 0, crossRefused: 0 };
  const json = [];
  const knownHits = {};
  let failed = 0;
  for (const idx of idxs){
    beat(`case ${idx}`);
    const { sc, world, dev, res } = await runCase(idx, famFilter);
    const famName = sc.fam === 'mix' ? 'mix/' + sc.sub : sc.fam;
    const f = fams[sc.fam] = fams[sc.fam] || { n: 0, fail: 0 };
    f.n++;
    tot.compared += res.compared; tot.writesChecked += res.writesChecked; tot.screens += res.screens;
    tot.landed += res.actionsLanded; tot.told += res.actionsTold; tot.lost += res.actionsLost; tot.ledger += world.ledger.length;
    tot.issued += world.stats.issued; tot.landedW += world.stats.landed; tot.refusedRules += world.stats.refusedByRules; tot.refusedServer += world.stats.refusedByServer;
    tot.lostPage += world.stats.lostWithPage; tot.lostUnload += world.stats.lostUnload; tot.pages += world.stats.pages; tot.reloads += world.stats.reloads;
    tot.reads += world.stats.reads; tot.readsFailed += world.stats.readsFailed; tot.notices += world.allPages.reduce((n, p) => n + p.notices.length, 0);
    const what = `${famName}, last action ${sc.actionKind}, network ${sc.net}`;
    for (const k of res.known){ knownHits[k.id] = (knownHits[k.id] || 0) + 1; console.log(`~ known ${k.id}, listed ${KNOWN.find(x => x.id === k.id).listed}: case ${idx} (seed ${BASE_SEED}, ${what}): ${k.msg}`); }
    tot.crossRefused += res.crossRefused.length;
    if (res.crossRefused.length) console.log(`~ case ${idx} (seed ${BASE_SEED}, ${what}): ${res.crossRefused.length} write${res.crossRefused.length > 1 ? 's' : ''} refused by the rules for going out under the wrong sign-in: ${res.crossRefused.slice(0, 2).join('; ')}`);
    if (res.fails.length){
      failed++; f.fail++;
      console.log(`✗ FAIL case ${idx} (seed ${BASE_SEED}, ${what}): ${res.fails.length} finding${res.fails.length > 1 ? 's' : ''}`);
      for (const x of res.fails.slice(0, 8)) console.log(`    ${x.rule} ${x.msg}`);
      if (res.fails.length > 8) console.log(`    … ${res.fails.length - 8} more`);
      console.log(`    replay: node tools/shared-chromebook-loop.mjs --seed=${BASE_SEED} --case=${idx} --verbose${famFilter.length ? ' --family=' + famFilter.join(',') : ''}${opt('cases', null) ? ' --cases=' + N : ''}${opt('root', null) ? ' --root=' + ROOT : ''}`);
    }
    if (VERBOSE){
      console.log(`\n── case ${idx} (seed ${BASE_SEED}, ${what}, notice choice ${sc.noticeChoice}, B ${sc.bKind})`);
      for (const line of world.trace) console.log('  ' + line);
      console.log('  ledger: ' + world.ledger.map(a => `${a.who}@${rel(a.t)} ${describe(a)}${a.told ? ' (told)' : ''}`).join(' | '));
      console.log(`  checks: ${res.compared} compared, ${res.writesChecked} write items checked, ${res.screens} first screens`);
    }
    if (opt('json', null)) json.push({ idx, fam: famName, actionKind: sc.actionKind, net: sc.net, fails: res.fails, stats: world.stats });
  }
  const fullRun = single == null && !famFilter.length && N >= 120;
  for (const k of KNOWN) if (fullRun && !knownHits[k.id]){ failed++; console.log(`✗ FAIL KNOWN ${k.id} matched nothing in a full default run: if the site fault is fixed, take its entry out of KNOWN`); }
  const famLine = Object.entries(fams).map(([k, v]) => `${k} ${v.n - v.fail}/${v.n}`).join(', ');
  console.log(`shared-chromebook-loop: ${idxs.length - failed} of ${idxs.length} cases held (${famLine})`);
  console.log(`  KNOWN: ${KNOWN.map(k => k.id + ' matched ' + (knownHits[k.id] || 0) + ' time(s)').join(', ')}`);
  console.log(`  ${tot.ledger} actions by the students: ${tot.landed} landed in their own doc, ${tot.told} told "not saved" and not landed, ${tot.lost} lost without a word`);
  console.log(`  ${tot.screens} first screens read (state, markup, sessionStorage, localStorage reads); ${tot.compared} records and values compared; ${tot.writesChecked} write items checked for token and markers`);
  console.log(`  ${tot.pages} page loads, ${tot.reloads} reloads; ${tot.issued} writes issued, ${tot.landedW} landed, ${tot.refusedRules} refused by the rules, ${tot.refusedServer} refused by the server (${tot.crossRefused} of the rules' refusals for the wrong sign-in), ${tot.lostPage} lost with their page, ${tot.lostUnload} started while unloading; ${tot.reads} reads (${tot.readsFailed} failed); ${tot.notices} not-saved notices shown`);
  console.error(`shared-chromebook-loop: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (opt('json', null)) writeFileSync(opt('json'), JSON.stringify(json, null, 1));
  return failed ? 1 : 0;
}
main().then(code => { clearInterval(WATCHDOG); process.exit(code); }, e => { console.error('shared-chromebook-loop: the tool crashed: ' + (e && e.stack || e)); process.exit(2); });
