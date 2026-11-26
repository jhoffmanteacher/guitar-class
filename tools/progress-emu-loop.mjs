#!/usr/bin/env node
/* progress-emu-loop.mjs — the student's progress save on the REAL Firebase JS SDK, against the Auth and Firestore
   emulators loaded with the real firestore.rules (2026-11-26; closed-loop report 2026-11-26, step 2: rows 5, 7, 9,
   10, 18 and 52 of its Appendix B).

   THE QUESTION. tools/save-loop.mjs proves the save path on a FAKE Firestore whose rules (F1-F15) are written from
   Firestore's documentation. Does the real SDK do what that fake says, and does the site's save path, run on the
   real SDK, store what the student did: across a reload (a fresh SDK), a second device, a sign-out and the next
   student, the Wi-Fi dropping and coming back, the Module 4/5 move, the teacher's Start over, and a write the
   database refuses?

   WHAT IS REAL. As tools/signin-loop.mjs (tools/emu-site.mjs): the site's pages, the SDK at the version index.html
   loads, the Auth emulator's made-up Google accounts, the Firestore emulator with the rules file given, the site's
   own sign-in callback. The student acts through the site's entry points (onCompleteChange, onCaStepChange,
   onResponseChange, logPracticeRep, bumpPracticeStreak, ecStart + ecPick, which submits through ecSubmit, signOut);
   the teacher's Start over is the console's own trmWriteMarker (teacher-remove.js, through teacherWriteConfig).
   OFFLINE is a cut line: each device reaches the emulator through a TCP relay the tool cuts (open connections die,
   new ones are refused) and mends; the page hears 'offline' / 'online' and its SDK restarts its network on each,
   as the browser SDK's connectivity monitor does.
   THE LEDGER is what the tool made the student do, written down by the tool (not read from the page). THE SEPARATE
   READER is the emulator's REST door with the owner key: never the SDK, never the site's code.

   PART A — save-loop's fake, checked against the real SDK (the SDK alone, a signed-in school account, the real
   rules): F1 merge key by key at every depth · F2 an empty map in a merge replaces the stored map · F3 an array is
   replaced whole · F4 delete() nested in a merged set removes that key; nested in update() or in a set without
   merge it is refused · F5 update() by field path replaces that field whole; on a missing doc it is refused · F6 a
   set without merge replaces the doc · F7 undefined is refused · F8 the data is read when set() is called · F9 one
   client's writes land in the order issued · F10 a transaction runs again when its document changed under it ·
   F11 a write made offline waits and lands on reconnect; in an app deleted first (a closed tab) it is lost · F12
   offline, set() does not settle, a server read fails at once, a transaction fails (save-loop's fake says "at
   once": the time the real one took is printed) · F13 offline, a plain get() answers from the tab's own queued
   write: a PARTIAL doc, pending, from the cache · F15 a rules refusal is permission-denied · a server timestamp
   lands as the server's time · a write past 1 MiB is refused.
   PART B — the site's save path on the real SDK (whole pages):
     new     a new student's ticks, activity step, answer, rep and streak land, the doc born marked (migrations.swap45)
     reload  a fresh SDK on the same device loads exactly the ledger
     device2 a second device loads it, both devices add ticks, every tick lands (merge keeps what the other added)
     untick  an un-tick lands as a removal
     check   an exit check (ecStart, five ecPick taps) files the result the page shows, and marks the activity done
     swap45  an unmarked Module 4 doc is moved once at sign-in (a real transaction), then saved on top
     race45  two devices sign in at once on an unmarked doc: moved exactly once
     startover  the console's Start over (its own writer) is applied once by the student's next sign-in, keeping
             activities; a second device does not apply it again
     signout the site's Sign out flushes the last tick first; the next student on the device sees none of it
     offline a tick made offline waits ("Saving…", never "Saved") and lands when the Wi-Fi comes back
     offline-signout  Sign out offline says "not saved yet" and stays signed in; the write lands on reconnect
     offline-close    a tick made offline in a tab closed before the reconnect is lost (no offline persistence)
     toolarge a 1.1 MB answer: the whole save is refused, the page says so, nothing lands; once the answer is
             short again the next save lands the tick that waited
   --plants: the same cases on in-memory copies of a site file with one fault planted (never the file itself); every
   plant must turn a case red that is green on the real code. --plant=<n>, --only=<a,b,...> (part A is "sdk").

   RUN IT BY HAND: exactly as tools/signin-loop.mjs (its header), with this file's name. GitHub runs it in rules.yml,
   job "emu-loops". Exit 0 = every case passed (with --plants: every plant caught); 1 = not; 2 = could not run.
   Summary lines: "✓ firestore.rules: N passed, 0 failed" and "✓ K of K breaks caught".
   WHAT IT PRINTS AS IT GOES: as tools/signin-loop.mjs (its header): a line as each case starts (▶) and ends (■), a
   case past --case-ms (default 50 s; the offline cases have their own) fails as "HUNG at <step>", --deadline
   (default 540 s) ends the run with "HUNG at <case>" and exit 3, so does --stall (default 30 s with the event loop
   blocked; both kept by a worker thread, which prints where the tool was stuck), and a preflight stops it at once
   (exit 2) when the SDK cannot reach both emulators (--no-preflight skips it).
   Last run: 2026-11-26, a cloud session with the emulator jar fetched by hand (firebase-tools 15.36.0, Firestore
   emulator 1.22.0): 45 passed, 0 failed, 6 of 6 breaks caught, 92 s. GitHub run 45885160639: the same counts, 83 s. */
import { readFileSync } from 'node:fs';
import { emuArgs, loadSdk, emulator, makeWorld, makeDevice, makePage, rawClient, signInPage, waitScreen, until, sleep, waitSaved, closeAll, setOnline, wall, makeRunner, step, watchdog, preflight } from './emu-site.mjs';

const ARGV = process.argv.slice(2);
const A = emuArgs(ARGV, 'progress-emu-loop');
const T0 = Date.now();
let sdk;
try { sdk = loadSdk(A.deps, A.site); } catch (e){ console.log(`\n✗ progress-emu-loop: ${e.message}: 0 passed, 1 failed`); process.exit(2); }
const E = emulator(A);
const RULES = readFileSync(A.rules, 'utf8');
const VERBOSE = A.has('verbose');
const CASE_MS = (Number(A.val('case-ms')) || 50) * 1000;
const DEADLINE = Number(A.val('deadline')) || 540;
const ONLY = (A.val('only') || '').split(',').filter(Boolean);
const TEACHER = (/const TEACHER_EMAIL\s*=\s*'([^']+)'/.exec(readFileSync(`${A.site}/firebase-config.js`, 'utf8')) || [])[1] || 'jhoffman@seq.org';
const K1 = 'm1w1-b-sec0-0', K2 = 'm1w1-b-sec0-1', K3 = 'm1w1-b-sec0-2', Q1 = 'm1w1-b-sec1-0', STEP = 'ca-18:0', SKILL = 'm1w1-s1', CHECK = 'ca-14';
const pad = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
/* Deep equality on plain data, key order ignored. */
const canon = v => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}' : JSON.stringify(v);
const same = (a, b) => canon(a) === canon(b);
const short = v => { const s = canon(v); return s && s.length > 220 ? s.slice(0, 220) + '…' : s; };

let CUR = null;
await watchdog('progress-emu-loop', DEADLINE, () => (CUR ? { pass: CUR.pass, fail: CUR.fail } : { pass: 0, fail: 0 }), Number(A.val('stall')) || 30);

async function suite(groups, plant, quiet, prefix){
  const R = makeRunner({ quiet, prefix, caseMs: CASE_MS });
  CUR = R;
  const check = R.check, say = R.out, note = R.note;
  await step(E.loadRules(RULES), 'loading the rules into the emulator');
  await step(E.clearFirestore(), 'clearing Firestore'); await step(E.clearAuth(), 'clearing Auth');
  const world = await makeWorld(A, sdk, { verbose: VERBOSE && !quiet, plants: plant ? plant.site : [] });
  await step(E.ownerSet('config/class', { gamesEnabled: true }), 'seeding config/class');
  if (!quiet && !A.has('no-preflight')){
    const pf = await preflight(world);
    if (pf){ console.log(`\n✗ progress-emu-loop: ${pf}: 0 passed, 1 failed`); await closeAll(world); process.exit(2); }
  }
  let n = 0;
  const stamp = Date.now().toString(36);
  const acct = name => ({ sub: `pe-${++n}-${stamp}`, email: `test${n}.${stamp}@seq.org`, verified: true, name: name || `Test ${n}` });
  const pageNote = p => p ? ` [page faults: ${p.faults.slice(0, 2).join(' / ') || 'none'}; warns: ${p.warns.slice(-2).join(' / ') || 'none'}]` : '';
  const doc = uid => E.ownerGet('progress/' + uid);
  const need = (...xs) => { if (xs.some(x => !x)) throw Object.assign(new Error('an earlier case did not finish'), { skipped: true }); };
  /* A page on `dev`, signed in as `who`, on the app. */
  const open = async (dev, who, opts) => {
    const p = makePage(world, dev, opts || {});
    await signInPage(world, p, who);
    const s = opts && opts.teacher ? (await until(() => p.run('typeof trmWriteMarker === "function" && !window.__authBootPending'), 20000) && 'console') : await waitScreen(p, 12000);
    return { p, s, uid: p.auth().currentUser && p.auth().currentUser.uid };
  };
  const state = (p, expr) => JSON.parse(p.run(`JSON.stringify(${expr})`));
  /* The uid an account gets, before any page signs in (the emulator keeps one account per address). */
  const uidFor = async who => (await E.googleSignIn({ sub: who.sub, email: who.email, email_verified: true, name: who.name })).uid;
  const shut = async (...ps) => { for (const p of ps) if (p) await p.close('silent'); };
  const saved = (p, what, ms = 15000) => waitSaved(p, ms);

  /* ── PART A: the SDK itself ── */
  if (groups.includes('sdk')){
    say('== part A: save-loop\'s fake Firestore (F1-F15) against the real SDK');
    const S = {};
    const err = async p => { try { await step(p, 'an SDK call', 15000); return 'ok'; } catch (e){ if (e && e.hung) throw e; return (e && e.code) || 'threw'; } };
    const errSync = async f => { try { await step(Promise.resolve().then(f), 'an SDK call', 15000); return 'ok'; } catch (e){ if (e && e.hung) throw e; return (e && e.code) || 'threw'; } };
    const seed = d => E.ownerSet(S.path, d);
    await R.case('sdk: sign in', async () => {
      S.dev = await makeDevice(world, 'SDK'); S.who = acct();
      S.c = await rawClient(world, S.dev, S.who);
      S.path = 'progress/' + S.c.uid; S.ref = S.c.db.doc(S.path); S.FV = S.c.FV;
    });
    const A_ = (name, fn, ms) => R.case('sdk: ' + name, async () => { need(S.c); await fn(S.ref, S.FV, S.c); }, ms);
    await A_('F1', async (ref) => {
      await seed({ completed: { a: true, b: true }, games: { dk: { x: { best: 3 } }, coach: { n: 1 } } });
      await step(ref.set({ completed: { c: true }, games: { dk: { y: { best: 1 } } } }, { merge: true }), 'a merged set');
      const d = await doc(S.c.uid);
      check('F1 a merged set merges maps key by key at every depth; fields it does not name are kept', same(d, { completed: { a: true, b: true, c: true }, games: { dk: { x: { best: 3 }, y: { best: 1 } }, coach: { n: 1 } } }), short(d));
    });
    await A_('F2', async (ref) => {
      await seed({ completed: { a: true }, skills: { s: 'gotit' } });
      await step(ref.set({ completed: {} }, { merge: true }), 'a merged set of an empty map');
      const d = await doc(S.c.uid);
      check('F2 an EMPTY map in a merged set replaces the stored map with {} (the site\'s LOAD_FAILED_EMPTY_MAPS rests on this)', same(d, { completed: {}, skills: { s: 'gotit' } }), short(d));
    });
    await A_('F3', async (ref) => {
      await seed({ responses: { pr: [{ value: '60' }, { value: '70' }], q: 'x' } });
      await step(ref.set({ responses: { pr: [{ value: '80' }] } }, { merge: true }), 'a merged set of an array');
      const d = await doc(S.c.uid);
      check('F3 an array is replaced whole, never merged element by element', same(d, { responses: { pr: [{ value: '80' }], q: 'x' } }), short(d));
    });
    await A_('F4', async (ref, FV) => {
      await seed({ completed: { a: true, b: true } });
      await step(ref.set({ completed: { b: FV.delete() } }, { merge: true }), 'a merged set with a nested delete');
      let d = await doc(S.c.uid);
      check('F4 delete() nested in a merged set removes that one key (the site\'s un-tick)', same(d, { completed: { a: true } }), short(d));
      const f4b = await errSync(() => ref.update({ completed: { a: FV.delete() } }));
      const f4c = await errSync(() => ref.set({ completed: { a: FV.delete() } }));
      d = await doc(S.c.uid);
      check('F4 delete() nested in update(), or in a set without merge, is refused and changes nothing', f4b !== 'ok' && f4c !== 'ok' && same(d, { completed: { a: true } }), `update ${f4b}, set ${f4c}, stored ${short(d)}`);
    });
    await A_('F5', async (ref) => {
      await seed({ games: { dk: { x: 1 }, coach: { n: 1 } }, other: 1 });
      await step(ref.update({ 'games.dk': { y: 2 } }), 'an update by field path');
      const d = await doc(S.c.uid);
      await E.ownerDelete(S.path);
      const f5b = await err(ref.update({ a: 1 }));
      check('F5 update() by field path ("games.dk") replaces that field whole and keeps its siblings; on a missing doc it is refused (not-found)', same(d, { games: { dk: { y: 2 }, coach: { n: 1 } }, other: 1 }) && f5b === 'not-found', `stored ${short(d)}; on a missing doc ${f5b}`);
    });
    await A_('F6 F7 F8', async (ref) => {
      await seed({ a: 1, b: 2 });
      await step(ref.set({ c: 3 }), 'a set without merge');
      let d = await doc(S.c.uid);
      check('F6 a set without merge replaces the whole doc', same(d, { c: 3 }), short(d));
      const f7 = await errSync(() => ref.set({ x: undefined }, { merge: true }));
      check('F7 undefined is not a value: the write is refused (invalid-argument)', f7 === 'invalid-argument', f7);
      await E.ownerDelete(S.path);
      const obj = { completed: { a: true } };
      const pw = ref.set(obj, { merge: true }); obj.completed.z = true; await step(pw, 'a merged set');
      d = await doc(S.c.uid);
      check('F8 the data is read when set() is called: changing the object afterwards changes nothing', same(d, { completed: { a: true } }), short(d));
    });
    await A_('F9', async (ref) => {
      const ws = []; for (let i = 0; i < 12; i++) ws.push(ref.set({ n: i, ['k' + i]: true }, { merge: true }));
      await step(Promise.all(ws), '12 writes in a row');
      const d = await doc(S.c.uid);
      check('F9 one client\'s writes land in the order issued (12 in a row: the last one\'s value stands)', d && d.n === 11 && Object.keys(d).filter(k => /^k\d+$/.test(k)).length === 12, short(d));
    });
    await A_('F10', async (ref, FV, c) => {
      await seed({ n: 0 });
      let attempts = 0;
      await step(c.db.runTransaction(async tx => {
        attempts++;
        const s = await tx.get(ref);
        if (attempts === 1) await E.ownerSet(S.path, { n: 100 });
        tx.update(ref, { n: (s.data().n || 0) + 1 });
      }), 'a transaction', 30000);
      const d = await doc(S.c.uid);
      check('F10 a transaction whose document changed before its commit runs again on the new value', attempts >= 2 && d && d.n === 101, `${attempts} attempt(s), stored ${short(d)}`);
    });
    await A_('offline: F12 F13 F11', async (ref, FV, c) => {
      await E.ownerDelete(S.path);
      await setOnline(S.dev, false);
      try {
        let landed = false; const off = ref.set({ off: 1 }, { merge: true }).then(() => { landed = true; }); void off;
        await sleep(1500);
        const midway = await doc(S.c.uid);
        const tSrv = Date.now(); const srv = await err(ref.get({ source: 'server' })); const srvMs = Date.now() - tSrv;
        const local = await step(ref.get().then(s => ({ exists: s.exists, pending: s.metadata.hasPendingWrites, cache: s.metadata.fromCache, data: s.data() }), e => ({ err: e.code })), 'a plain get() offline');
        const tTx = Date.now(); const tx = await Promise.race([c.db.runTransaction(async t => { await t.get(ref); }).then(() => 'ok', e => (e && e.code) || 'threw'), sleep(30000).then(() => 'still pending after 30 s')]); const txMs = Date.now() - tTx;
        check('F12 offline: set() does not settle and nothing reaches the server', !landed && midway === null, `landed ${landed}, stored ${short(midway)}`);
        check('F12 offline: a server read fails at once (unavailable)', srv === 'unavailable' && srvMs < 3000, `${srv} after ${srvMs} ms`);
        check('F12 offline: a transaction fails (it does not hang)', tx !== 'ok' && !/pending/.test(tx), tx);
        note(`F12: the transaction failed after ${txMs} ms (${tx}); save-loop's fake fails it "at once": a flushSave that must first move a doc (swap45Commit) waits this long offline`);
        check('F13 offline: a plain get() answers from the tab\'s own queued write: a PARTIAL doc, pending, from the cache', local.exists === true && local.pending === true && local.cache === true && same(local.data, { off: 1 }), short(local));
        await setOnline(S.dev, true);
        await until(() => landed, 20000);
        const d = await doc(S.c.uid);
        check('F11 the write made offline lands on reconnect', landed && d && d.off === 1, `landed ${landed}, stored ${short(d)}`);
      } finally { if (!S.dev.online) await setOnline(S.dev, true); }
    }, 90000);
    await A_('F11 a closed tab', async () => {
      await setOnline(S.dev, false);
      try {
        const c2 = await rawClient(world, S.dev, S.who);
        c2.db.doc(S.path).set({ lost: 1 }, { merge: true }).catch(() => {});
        await sleep(300);
        await c2.close();
      } finally { await setOnline(S.dev, true); }
      await sleep(1500);
      const d = await doc(S.c.uid);
      check('F11 a write still queued when its app is deleted (a closed tab) is lost: no offline persistence', d && !('lost' in d), short(d));
    });
    await A_('F15, server time, 1 MiB', async (ref, FV, c) => {
      const other = await uidFor(acct());
      const f15 = await err(c.db.doc('progress/' + other).get());
      check('F15 a read the rules refuse fails with permission-denied (what loadProgress records as progressLoadDenied)', f15 === 'permission-denied', f15);
      await step(ref.set({ at: FV.serverTimestamp() }, { merge: true }), 'a server timestamp');
      let d = await doc(S.c.uid);
      check('a server timestamp lands as the server\'s time', d && d.at && typeof d.at.__ts === 'number' && Math.abs(d.at.__ts - Date.now()) < 60000, short(d && d.at));
      const big = await err(ref.set({ big: 'x'.repeat(1100000) }, { merge: true }));
      d = await doc(S.c.uid);
      if (big === 'ok') note('a write past 1 MiB was ACCEPTED by this emulator: the size limit is not tested here (case "toolarge" says the same)');
      else check('a write that would make the doc larger than 1 MiB is refused and changes nothing', d && !('big' in d), `${big}, stored keys ${d && Object.keys(d).join(',')}`);
    });
    if (S.c) await S.c.close();
  }

  /* ── PART B: the site's save path ── */
  const B = g => groups.includes(g);
  if (['new', 'reload', 'device2', 'untick', 'check'].some(B)){
    say('== part B: a new student, a reload, a second device, an un-tick, an exit check');
    const S = { who: acct() };
    await R.case('new student', async () => {
      S.d1 = await makeDevice(world, 'D1');
      const { p, s, uid } = await open(S.d1, S.who);
      S.p = p; S.uid = uid;
      check('new student: the app', s === 'app', `${s}${pageNote(p)}`);
      p.run(`onCompleteChange(${JSON.stringify(K1)}, true); onCaStepChange(${JSON.stringify(STEP)}, true); onResponseChange(${JSON.stringify(Q1)}, 'Test answer'); logPracticeRep(${JSON.stringify(SKILL)}); bumpPracticeStreak();`);
      const ok = await saved(p);
      const d = await doc(uid);
      const pl = d && d.practiceLog && d.practiceLog[SKILL];
      check('…everything lands: the tick, the activity step, the answer, the rep, the streak, name and email, the doc born marked', ok && d && same(d.completed, { [K1]: true }) && same(d.caSteps, { [STEP]: true }) && same(d.responses, { [Q1]: 'Test answer' })
        && pl && pl.reps === 1 && pl.todayCount === 1 && pl.lastDay === today() && same(d.streak, { count: 1, lastDay: today() }) && d.email === S.who.email && d.migrations && d.migrations.swap45 === true, short(d));
      check('…the page says "Saved"', p.saveKey() === 'save.saved' || p.saveMsgs.some(m => m.key === 'save.saved'), p.saveMsgs.map(m => m.key).join(' > '));
      await p.close(); S.p = null;
    });
    if (B('reload') || B('device2') || B('untick') || B('check')){
      await R.case('reload', async () => {
        need(S.d1, S.uid);
        const { p, s } = await open(S.d1, S.who);
        S.p2 = p;
        const st = state(p, '{ completed, caStepDone, responses, rep: practiceLog[' + JSON.stringify(SKILL) + '], streak, failed: progressLoadFailed }');
        check('reload (a fresh SDK on the same device): the page loads exactly the ledger', s === 'app' && !st.failed && same(st.completed, { [K1]: true }) && same(st.caStepDone, { [STEP]: true }) && same(st.responses, { [Q1]: 'Test answer' }) && st.rep && st.rep.reps === 1 && same(st.streak, { count: 1, lastDay: today() }), `${s} ${short(st)}`);
      });
    }
    if (B('device2') || B('untick') || B('check')){
      await R.case('second device', async () => {
        need(S.p2);
        S.d2 = await makeDevice(world, 'D2');
        const { p: q, s: sq } = await open(S.d2, S.who);
        S.q = q;
        check('a second device loads the same work', sq === 'app' && same(state(q, 'completed'), { [K1]: true }), `${sq} ${short(state(q, 'completed'))}`);
        q.run(`onCompleteChange(${JSON.stringify(K2)}, true)`); await saved(q);
        S.p2.run(`onCompleteChange(${JSON.stringify(K3)}, true)`); await saved(S.p2);
        const d = await doc(S.uid);
        check('…each device adds a tick (the first never saw the second\'s): all three land', d && same(d.completed, { [K1]: true, [K2]: true, [K3]: true }), short(d && d.completed));
      });
    }
    if (B('untick') || B('check')){
      await R.case('un-tick', async () => {
        need(S.q);
        S.q.run(`onCompleteChange(${JSON.stringify(K1)}, false)`); await saved(S.q);
        const d = await doc(S.uid);
        check('an un-tick lands as a removal (delete() nested in the merged set)', d && same(d.completed, { [K2]: true, [K3]: true }), short(d && d.completed));
      });
    }
    if (B('check')){
      await R.case('exit check', async () => {
        need(S.q);
        const q = S.q;
        q.run(`ecStart(${JSON.stringify(CHECK)})`);
        const total = q.run(`ecItems(ecActivity(${JSON.stringify(CHECK)})).length`);
        for (let i = 0; i < total; i++){ await sleep(450); q.run(`ecPick(${JSON.stringify(CHECK)}, { dataset: { pick: 'zz' } })`); }
        await saved(q);
        const shown = state(q, `exitChecks[${JSON.stringify(CHECK)}] || null`);
        const d = await doc(S.uid);
        const want = { score: 0, total, picks: Array(total).fill('zz'), at: today(), attempts: 1 };
        check(`an exit check (${total} taps): the result the page shows is the one stored, and the activity is marked done`, total > 0 && same(shown, want) && d && same(d.exitChecks && d.exitChecks[CHECK], want) && d.classActivities && d.classActivities[CHECK] === true, `page ${short(shown)}; stored ${short(d && d.exitChecks)}; activities ${short(d && d.classActivities)}${pageNote(q)}`);
      });
    }
    await shut(S.p, S.p2, S.q);
  }

  if (B('swap45')){
    say('== part B: the Module 4/5 move at sign-in (a real transaction)');
    await R.case('Module 4/5 move', async () => {
      const who = acct();
      const uid = await uidFor(who);
      await E.ownerSet('progress/' + uid, { name: who.name, email: who.email, completed: { 'm4w1-b-sec0-0': true, [K1]: true }, skills: { 'm4w1-s1': 'gotit' }, lastModule: 4, lastSet: 'm4w1', games: { dk: { 'chords-m5': { best: 7 } }, coach: { x: 1 } } });
      const dev = await makeDevice(world, 'S45');
      const { p, s } = await open(dev, who);
      try {
        await until(() => p.run('swap45Done'), 15000);
        let d = await doc(uid);
        check('an unmarked doc is moved once: the ids swapped, the marker set, nothing else touched', s === 'app' && d && same(d.completed, { 'm5w1-b-sec0-0': true, [K1]: true }) && same(d.skills, { 'm5w1-s1': 'gotit' }) && d.lastModule === 5 && d.lastSet === 'm5w1'
          && same(d.games, { dk: { 'chords-m4': { best: 7 } }, coach: { x: 1 } }) && d.migrations && d.migrations.swap45 === true, `${s} ${short(d)}${pageNote(p)}`);
        p.run(`onCompleteChange('m5w1-b-sec0-1', true)`); await saved(p);
        d = await doc(uid);
        check('…a tick saved after it lands on the moved doc, no old-numbered key comes back', d && same(d.completed, { 'm5w1-b-sec0-0': true, 'm5w1-b-sec0-1': true, [K1]: true }), short(d && d.completed));
      } finally { await shut(p); }
    });
  }

  if (B('race45')){
    say('== part B: two devices sign in at once on an unmarked doc');
    await R.case('Module 4/5 move, two devices at once', async () => {
      const who = acct();
      const uid = await uidFor(who);
      await E.ownerSet('progress/' + uid, { name: who.name, email: who.email, completed: { 'm4w1-b-sec0-0': true }, lastModule: 4 });
      const da = await makeDevice(world, 'RA'), db2 = await makeDevice(world, 'RB');
      const [ra, rb] = await Promise.all([open(da, who), open(db2, who)]);
      try {
        await until(() => ra.p.run('swap45Done') && rb.p.run('swap45Done'), 20000);
        const d = await doc(uid);
        check('…moved exactly once (a second move would swap it back), both pages marked', d && same(d.completed, { 'm5w1-b-sec0-0': true }) && d.lastModule === 5 && d.migrations && d.migrations.swap45 === true && ra.p.run('swap45Done') && rb.p.run('swap45Done'), short(d));
      } finally { await shut(ra.p, rb.p); }
    });
  }

  if (B('startover')){
    say('== part B: the teacher\'s Start over (the console\'s own writer), applied by the student\'s next sign-in');
    const S = { who: acct() };
    await R.case('Start over: the console writes the marker', async () => {
      S.uid = await uidFor(S.who);
      await E.ownerSet('progress/' + S.uid, { name: S.who.name, email: S.who.email, completed: { [K1]: true }, responses: { [Q1]: 'old answer' }, skills: { 'm1w1-s1': 'gotit' }, lastModule: 2, lastSet: 'm2w1',
        practiceLog: { [SKILL]: { reps: 3 } }, classActivities: { 'ca-18': true }, caSteps: { [STEP]: true }, migrations: { swap45: true } });
      const td = await makeDevice(world, 'TSO');
      const { p: tp, s: ts } = await open(td, { sub: 'pe-teacher', email: TEACHER, verified: true, name: 'Teacher' }, { teacher: true });
      let why = '';
      try {
        if (ts === 'console'){ try { S.at = await step(tp.run(`trmWriteMarker('progressStartOver', ${JSON.stringify(S.uid)})`), 'the console\'s Start over (trmWriteMarker)'); } catch (e){ if (e && e.hung) throw e; why = e.message; } }
        const cfg = await E.ownerGet('config/class');
        check('the console\'s Start over writes progressStartOver[uid] (a time) through its own config writer', typeof S.at === 'number' && cfg && cfg.progressStartOver && cfg.progressStartOver[S.uid] === S.at, `console ${ts}; ${why}; returned ${S.at}; stored ${short(cfg && cfg.progressStartOver)}${pageNote(tp)}`);
      } finally { await shut(tp); }
    });
    await R.case('Start over: the student\'s next sign-in', async () => {
      need(S.at);
      const dev = await makeDevice(world, 'SO1');
      const { p, s } = await open(dev, S.who);
      try {
        const d = await doc(S.uid);
        const st = s === 'app' ? state(p, '{ completed, responses, practiceLog, caStepDone }') : null;
        check('…the student\'s next sign-in empties the lesson work and keeps the activities, once (startOverApplied = that time)', s === 'app' && d && !('completed' in d) && !('responses' in d) && !('skills' in d) && !('lastModule' in d) && !('practiceLog' in d)
          && same(d.classActivities, { 'ca-18': true }) && same(d.caSteps, { [STEP]: true }) && d.startOverApplied === S.at, `${s} ${short(d)}${pageNote(p)}`);
        check('…the page starts from the emptied doc and says so once', st && same(st.completed, {}) && same(st.responses, {}) && same(st.practiceLog, {}) && same(st.caStepDone, { [STEP]: true }) && p.notices.some(x => x.id === 'reset-notice'), `${short(st)}; notices ${p.notices.map(x => x.id).join(',')}`);
      } finally { await shut(p); }
    });
    await R.case('Start over: another device later', async () => {
      need(S.at);
      const dev2 = await makeDevice(world, 'SO2');
      const { p: q } = await open(dev2, S.who);
      try {
        q.run(`onCompleteChange(${JSON.stringify(K2)}, true)`); await saved(q);
        const d = await doc(S.uid);
        check('…another device signs in later: not applied again; its tick lands', d && same(d.completed, { [K2]: true }) && d.startOverApplied === S.at && !q.notices.some(x => x.id === 'reset-notice'), short(d));
      } finally { await shut(q); }
    });
  }

  if (B('signout')){
    say('== part B: Sign out, then the next student on the same Chromebook');
    const S = { a1: acct('Test A'), b1: acct('Test B') };
    await R.case('Sign out', async () => {
      S.dev = await makeDevice(world, 'SHARED');
      const { p, uid } = await open(S.dev, S.a1);
      S.ua = uid;
      try {
        p.run(`onCompleteChange(${JSON.stringify(K1)}, true)`);
        p.run('signOut()');
        const out = await until(() => p.reloadAsked, 10000);
        const d = await doc(uid);
        check('Sign out right after a tick: the tick lands first, then the page reloads signed out', out && d && same(d.completed, { [K1]: true }), `reloaded ${out}; stored ${short(d && d.completed)}; notices ${p.notices.map(x => x.id).join(',')}`);
      } finally { await shut(p); }
    });
    await R.case('the next student', async () => {
      need(S.dev, S.ua);
      const { p: q, s: sq, uid: ub } = await open(S.dev, S.b1);
      try {
        const st = state(q, '{ completed, responses, cu: currentUser.uid }');
        check('…the next student signs in on the same device: none of the first one\'s work on the page', sq === 'app' && same(st.completed, {}) && same(st.responses, {}) && st.cu === ub, `${sq} ${short(st)}`);
        q.run(`onCompleteChange(${JSON.stringify(K2)}, true)`); await saved(q);
        const da = await doc(S.ua), dbb = await doc(ub);
        check('…their tick lands in their own record only', dbb && same(dbb.completed, { [K2]: true }) && da && same(da.completed, { [K1]: true }), `first ${short(da && da.completed)}; second ${short(dbb && dbb.completed)}`);
      } finally { await shut(q); }
    });
  }

  if (B('offline')){
    say('== part B: the Wi-Fi drops and comes back');
    await R.case('offline, then online', async () => {
      const who = acct();
      const dev = await makeDevice(world, 'OFF');
      const { p, uid } = await open(dev, who);
      try {
        p.run(`onCompleteChange(${JSON.stringify(K1)}, true)`); await saved(p);
        await setOnline(dev, false);
        const before = p.saveMsgs.length;
        p.run(`onCompleteChange(${JSON.stringify(K2)}, true)`);
        await sleep(2500);
        let d = await doc(uid);
        const keys = p.saveMsgs.slice(before).map(m => m.key);
        check('a tick made offline: not on the server yet, and the page never says "Saved"', d && same(d.completed, { [K1]: true }) && !keys.includes('save.saved'), `stored ${short(d && d.completed)}; page ${keys.join(' > ')}`);
        await setOnline(dev, true);
        await saved(p, 'the reconnect', 20000);
        d = await doc(uid);
        check('…the Wi-Fi comes back: it lands, and the page says "Saved"', d && same(d.completed, { [K1]: true, [K2]: true }) && p.saveMsgs.slice(before).some(m => m.key === 'save.saved'), `stored ${short(d && d.completed)}; page ${p.saveMsgs.slice(before).map(m => m.key).join(' > ')}`);
      } finally { if (!dev.online) await setOnline(dev, true); await shut(p); }
    }, 70000);
  }

  if (B('offline-signout')){
    say('== part B: Sign out with the Wi-Fi down');
    await R.case('Sign out offline', async () => {
      const who = acct();
      const dev = await makeDevice(world, 'OSO');
      const { p, uid } = await open(dev, who);
      try {
        p.run(`onCompleteChange(${JSON.stringify(K1)}, true)`); await saved(p);
        await setOnline(dev, false);
        p.run(`onCompleteChange(${JSON.stringify(K2)}, true)`);
        p.run('signOut()');
        const told = await until(() => p.notices.some(x => x.id === 'unsaved-notice'), 9000);
        check('Sign out offline with a tick unsaved: the page says "not saved yet", stays signed in, no reload', told && !p.reloadAsked && p.run('!!currentUser'), `notice ${told}; reload ${p.reloadAsked}`);
        await setOnline(dev, true);
        const landed = await until(async () => { const d = await doc(uid); return d && d.completed && d.completed[K2] === true; }, 20000);
        check('…the Wi-Fi comes back: the queued tick lands', landed);
      } finally { if (!dev.online) await setOnline(dev, true); await shut(p); }
    }, 70000);
  }

  if (B('offline-close')){
    say('== part B: a tab closed while offline');
    await R.case('a tab closed offline', async () => {
      const who = acct();
      const dev = await makeDevice(world, 'OCL');
      const { p, uid } = await open(dev, who);
      try {
        p.run(`onCompleteChange(${JSON.stringify(K1)}, true)`); await saved(p);
        await setOnline(dev, false);
        p.run(`onCompleteChange(${JSON.stringify(K2)}, true)`);
        await sleep(200);
        await p.close('close');
      } finally { await setOnline(dev, true); }
      await sleep(2000);
      const d = await doc(uid);
      check('a tick made offline in a tab closed before the reconnect is lost (no offline persistence), the earlier tick kept', d && same(d.completed, { [K1]: true }), short(d && d.completed));
    });
  }

  if (B('toolarge')){
    say('== part B: a save the database refuses (a document past 1 MiB)');
    await R.case('a save past 1 MiB', async () => {
      const who = acct();
      const dev = await makeDevice(world, 'BIG');
      const { p, uid } = await open(dev, who);
      try {
        p.run(`onCompleteChange(${JSON.stringify(K1)}, true)`); await saved(p);
        const before = p.saveMsgs.length;
        p.run(`onCompleteChange(${JSON.stringify(K2)}, true); onResponseChange(${JSON.stringify(Q1)}, 'x'.repeat(1100000))`);
        await until(() => p.saveMsgs.slice(before).some(m => m.key === 'save.failed' || m.key === 'save.saved'), 15000);
        let d = await doc(uid);
        const keys = p.saveMsgs.slice(before).map(m => m.key);
        if (keys.includes('save.saved') && d && d.responses && d.responses[Q1]) note('this emulator ACCEPTED a document past 1 MiB: case "toolarge" proves nothing here');
        else {
          check('a 1.1 MB answer: the whole save is refused, the page says the save failed (never "Saved"), nothing of it lands', keys.includes('save.failed') && !keys.includes('save.saved') && d && same(d.completed, { [K1]: true }) && !(d.responses && Q1 in d.responses), `page ${keys.join(' > ')}; stored ${short(d && d.completed)}`);
          p.run(`onResponseChange(${JSON.stringify(Q1)}, 'short answer')`);
          await saved(p, 'the short answer', 20000);
          d = await doc(uid);
          check('…the answer made short again: the next save lands it and the tick that waited', d && same(d.completed, { [K1]: true, [K2]: true }) && d.responses && d.responses[Q1] === 'short answer', short(d && { completed: d.completed, q: d.responses && d.responses[Q1] }));
        }
      } finally { await shut(p); }
    }, 70000);
  }

  if (!quiet && world.faults.length) console.log(`   note: ${world.faults.length} unhandled rejection(s) from site code, first: ${world.faults[0]}`);
  if (!quiet && VERBOSE) for (const p of world.pages) for (const f of p.faults) console.log('      (page fault) ' + p.id + ': ' + f);
  await closeAll(world);
  return { pass: R.pass, fail: R.fail, red: R.red, world };
}

const PLANTS = [
  { name: 'flushSave writes without {merge:true} (the whole doc replaced)', groups: ['new', 'reload', 'device2'], site: [{ file: 'app/save.js', from: 'await db.collection(\'progress\').doc(currentUser.uid).set(payload,{merge:true});', to: 'await db.collection(\'progress\').doc(currentUser.uid).set(payload);' }] },
  { name: 'flushSave drops the un-tick sentinels (an un-tick only leaves the local map)', groups: ['new', 'reload', 'device2', 'untick'], site: [{ file: 'app/save.js', from: 'sentDeletes.forEach(([k])=>{ payload.completed[k] = firebase.firestore.FieldValue.delete(); });', to: 'sentDeletes.forEach(([k])=>{ delete payload.completed[k]; });' }] },
  { name: 'flushSave writes to progress/<email> (the rules refuse it)', groups: ['new'], site: [{ file: 'app/save.js', from: 'await db.collection(\'progress\').doc(currentUser.uid).set(payload,{merge:true});', to: 'await db.collection(\'progress\').doc(currentUser.email).set(payload,{merge:true});' }] },
  { name: 'the Module 4/5 move merges instead of replacing (old keys come back)', groups: ['swap45'], site: [{ file: 'app/save.js', from: "tx.update(ref, Object.assign(swap45Patch(d) || {}, { 'migrations.swap45': true }));", to: 'tx.set(ref, Object.assign(swap45Remap(d), { migrations: { swap45: true } }), { merge: true });' }] },
  { name: 'the student\'s page reads the Start over marker under the wrong name', groups: ['startover'], site: [{ file: 'app/save.js', from: 'over: num(((d && d.progressStartOver) || {})[uid])', to: 'over: num(((d && d.progressStartover) || {})[uid])' }] },
  { name: 'Sign out does not wait for the last save', groups: ['signout'], site: [{ file: 'app/boot.js', from: 'await withTimeout((async()=>{ if(_flushP) await _flushP; await flushSave(); })(), ms);', to: 'await withTimeout(Promise.resolve(), ms);' }] },
];

const ALL = ['sdk', 'new', 'reload', 'device2', 'untick', 'check', 'swap45', 'race45', 'startover', 'signout', 'offline', 'offline-signout', 'offline-close', 'toolarge'];
const groups = ONLY.length ? ALL.filter(g => ONLY.includes(g)) : ALL;
console.log(`== progress-emu-loop: ${A.rules.split('/').pop()} on the emulators (Firestore ${A.fsHost}, Auth ${A.authHost}), project ${A.project}; Firebase JS SDK ${sdk.version} (index.html loads ${sdk.siteVersion}); site ${A.site}; a case may take ${CASE_MS / 1000} s, the run ${DEADLINE} s`);
const versionBad = sdk.version !== sdk.siteVersion ? 1 : 0;
if (versionBad) console.log(`   ✗ the SDK here (${sdk.version}) is not the version the site loads (${sdk.siteVersion}): install firebase@${sdk.siteVersion} in --deps`);
let real;
try { real = await suite(groups, null, false, ''); }
catch (e){ console.log(`\n✗ progress-emu-loop could not run: ${e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}${/fetch failed|ECONNREFUSED/.test(String(e.message) + (e.cause || '')) ? ` (no emulator at ${A.fsHost} / ${A.authHost}? run it inside firebase emulators:exec --only firestore,auth)` : ''}: 0 passed, 1 failed`); process.exit(2); }
const wallBad = wall.refused.length;
if (wallBad) console.log(`      the tool's fetch was asked for ${wallBad} address(es) off this machine, first ${wall.refused[0]}\n  ✗ the wall: nothing may leave 127.0.0.1`);
console.log(`   (every page asked for project ${[...new Set(real.world.siteConfigs)].join(', ') || 'none'}; each was given ${A.project})`);
console.log(`\n${real.fail || wallBad || versionBad ? '✗' : '✓'} ${A.rules.split('/').pop()}: ${real.pass} passed, ${real.fail + (wallBad ? 1 : 0) + versionBad} failed`);
console.log(`time: ${Math.round((Date.now() - T0) / 1000)} s (the cases)`);
let missed = 0;
if (A.has('plants') || A.val('plant')){
  const pick = A.val('plant') ? [PLANTS[Number(A.val('plant')) - 1]].filter(Boolean) : PLANTS;
  console.log('\n== planted faults (an in-memory copy of one site file; each must turn a case red that is green on the real code)');
  let skipped = 0;
  for (const [k, pl] of pick.entries()){
    const gs = pl.groups.filter(g => groups.includes(g));
    if (!gs.length){ console.log(`  - skipped: ${pl.name} (its groups, ${pl.groups.join(', ')}, are not in --only)`); skipped++; continue; }
    let r;
    try { r = await suite(gs, pl, true, `plant ${k + 1}: `); }
    catch (e){ console.log(`  ✗ ${pl.name}: ${e.plantMiss ? e.message : 'the run failed: ' + e.message}`); missed++; continue; }
    const fresh = r.red.filter(x => !real.red.includes(x));
    if (fresh.length) console.log(`  ✓ caught: ${pl.name} — ${fresh.length} red: ${fresh.slice(0, 2).join(' | ').slice(0, 260)}${fresh.length > 2 ? ' | …' : ''}`);
    else { console.log(`  ✗ NOT caught: ${pl.name}`); missed++; }
  }
  console.log(`\n${missed ? '✗' : '✓'} ${pick.length - skipped - missed} of ${pick.length - skipped} breaks caught`);
}
console.log(`time: ${Math.round((Date.now() - T0) / 1000)} s`);
process.exit(real.fail || missed || wallBad || versionBad ? 1 : 0);
