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
   Last run: not yet (built 2026-11-26 in a cloud session whose network could not fetch the Firestore emulator). */
import { readFileSync } from 'node:fs';
import { emuArgs, loadSdk, emulator, makeWorld, makeDevice, makePage, rawClient, signInPage, waitScreen, until, sleep, waitSaved, closeAll, setOnline, wall } from './emu-site.mjs';

const ARGV = process.argv.slice(2);
const A = emuArgs(ARGV, 'progress-emu-loop');
const T0 = Date.now();
let sdk;
try { sdk = loadSdk(A.deps, A.site); } catch (e){ console.log(`\n✗ progress-emu-loop: ${e.message}: 0 passed, 1 failed`); process.exit(2); }
const E = emulator(A);
const RULES = readFileSync(A.rules, 'utf8');
const VERBOSE = A.has('verbose');
const ONLY = (A.val('only') || '').split(',').filter(Boolean);
const TEACHER = (/const TEACHER_EMAIL\s*=\s*'([^']+)'/.exec(readFileSync(`${A.site}/firebase-config.js`, 'utf8')) || [])[1] || 'jhoffman@seq.org';
const K1 = 'm1w1-b-sec0-0', K2 = 'm1w1-b-sec0-1', K3 = 'm1w1-b-sec0-2', Q1 = 'm1w1-b-sec1-0', STEP = 'ca-18:0', SKILL = 'm1w1-s1', CHECK = 'ca-14';
const pad = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
/* Deep equality on plain data, key order ignored. */
const canon = v => Array.isArray(v) ? '[' + v.map(canon).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}' : JSON.stringify(v);
const same = (a, b) => canon(a) === canon(b);
const short = v => { const s = canon(v); return s && s.length > 220 ? s.slice(0, 220) + '…' : s; };

async function suite(groups, plant, quiet){
  let pass = 0, fail = 0; const red = [];
  const say = s => { if (!quiet) console.log(s); };
  const check = (name, ok, why) => {
    if (ok) pass++; else { fail++; red.push(name); }
    if (!quiet){ if (!ok && why) console.log('      ' + String(why).slice(0, 320)); console.log((ok ? '  ✓ ' : '  ✗ ') + name); }
    return ok;
  };
  const note = s => { if (!quiet) console.log('  ~ ' + s); };
  await E.loadRules(RULES);
  await E.clearFirestore(); await E.clearAuth();
  const world = await makeWorld(A, sdk, { verbose: VERBOSE && !quiet, plants: plant ? plant.site : [] });
  await E.ownerSet('config/class', { gamesEnabled: true });
  let n = 0;
  const stamp = Date.now().toString(36);
  const acct = name => ({ sub: `pe-${++n}-${stamp}`, email: `test${n}.${stamp}@seq.org`, verified: true, name: name || `Test ${n}` });
  const pageNote = p => p ? ` [page faults: ${p.faults.slice(0, 2).join(' / ') || 'none'}; warns: ${p.warns.slice(-2).join(' / ') || 'none'}]` : '';
  const doc = uid => E.ownerGet('progress/' + uid);
  /* A page on `dev`, signed in as `who`, on the app. */
  const open = async (dev, who, opts) => {
    const p = makePage(world, dev, opts || {});
    await signInPage(world, p, who);
    const s = opts && opts.teacher ? (await until(() => p.run('typeof trmWriteMarker === "function" && !window.__authBootPending'), 30000) && 'console') : await waitScreen(p, 20000);
    return { p, s, uid: p.auth().currentUser && p.auth().currentUser.uid };
  };
  const state = (p, expr) => JSON.parse(p.run(`JSON.stringify(${expr})`));
  /* The uid an account gets, before any page signs in (the emulator keeps one account per address). */
  const uidFor = async who => (await E.googleSignIn({ sub: who.sub, email: who.email, email_verified: true, name: who.name })).uid;

  /* ── PART A: the SDK itself ── */
  if (groups.includes('sdk')){
    say('== part A: save-loop\'s fake Firestore (F1-F15) against the real SDK');
    const dev = await makeDevice(world, 'SDK');
    const who = acct();
    const c = await rawClient(world, dev, who);
    const path = 'progress/' + c.uid, ref = c.db.doc(path), FV = c.FV;
    const seed = async d => { await E.ownerSet(path, d); };
    const err = async p => { try { await p; return 'ok'; } catch (e){ return (e && e.code) || 'threw'; } };
    const errSync = async f => { try { await f(); return 'ok'; } catch (e){ return (e && e.code) || 'threw'; } };
    await seed({ completed: { a: true, b: true }, games: { dk: { x: { best: 3 } }, coach: { n: 1 } } });
    await ref.set({ completed: { c: true }, games: { dk: { y: { best: 1 } } } }, { merge: true });
    let d = await doc(c.uid);
    check('F1 a merged set merges maps key by key at every depth; fields it does not name are kept', same(d, { completed: { a: true, b: true, c: true }, games: { dk: { x: { best: 3 }, y: { best: 1 } }, coach: { n: 1 } } }), short(d));
    await seed({ completed: { a: true }, skills: { s: 'gotit' } });
    await ref.set({ completed: {} }, { merge: true });
    d = await doc(c.uid);
    check('F2 an EMPTY map in a merged set replaces the stored map with {} (the site\'s LOAD_FAILED_EMPTY_MAPS rests on this)', same(d, { completed: {}, skills: { s: 'gotit' } }), short(d));
    await seed({ responses: { pr: [{ value: '60' }, { value: '70' }], q: 'x' } });
    await ref.set({ responses: { pr: [{ value: '80' }] } }, { merge: true });
    d = await doc(c.uid);
    check('F3 an array is replaced whole, never merged element by element', same(d, { responses: { pr: [{ value: '80' }], q: 'x' } }), short(d));
    await seed({ completed: { a: true, b: true } });
    await ref.set({ completed: { b: FV.delete() } }, { merge: true });
    d = await doc(c.uid);
    check('F4 delete() nested in a merged set removes that one key (the site\'s un-tick)', same(d, { completed: { a: true } }), short(d));
    const f4b = await errSync(() => ref.update({ completed: { a: FV.delete() } }));
    const f4c = await errSync(() => ref.set({ completed: { a: FV.delete() } }));
    d = await doc(c.uid);
    check('F4 delete() nested in update(), or in a set without merge, is refused and changes nothing', f4b !== 'ok' && f4c !== 'ok' && same(d, { completed: { a: true } }), `update ${f4b}, set ${f4c}, stored ${short(d)}`);
    await seed({ games: { dk: { x: 1 }, coach: { n: 1 } }, other: 1 });
    await ref.update({ 'games.dk': { y: 2 } });
    d = await doc(c.uid);
    await E.ownerDelete(path);
    const f5b = await err(ref.update({ a: 1 }));
    check('F5 update() by field path ("games.dk") replaces that field whole and keeps its siblings; on a missing doc it is refused (not-found)', same(d, { games: { dk: { y: 2 }, coach: { n: 1 } }, other: 1 }) && f5b === 'not-found', `stored ${short(d)}; on a missing doc ${f5b}`);
    await seed({ a: 1, b: 2 });
    await ref.set({ c: 3 });
    d = await doc(c.uid);
    check('F6 a set without merge replaces the whole doc', same(d, { c: 3 }), short(d));
    const f7 = await errSync(() => ref.set({ x: undefined }, { merge: true }));
    check('F7 undefined is not a value: the write is refused (invalid-argument)', f7 === 'invalid-argument', f7);
    await E.ownerDelete(path);
    const obj = { completed: { a: true } };
    const pw = ref.set(obj, { merge: true }); obj.completed.z = true; await pw;
    d = await doc(c.uid);
    check('F8 the data is read when set() is called: changing the object afterwards changes nothing', same(d, { completed: { a: true } }), short(d));
    const ws = []; for (let i = 0; i < 12; i++) ws.push(ref.set({ n: i, ['k' + i]: true }, { merge: true }));
    await Promise.all(ws);
    d = await doc(c.uid);
    check('F9 one client\'s writes land in the order issued (12 in a row: the last one\'s value stands)', d && d.n === 11 && Object.keys(d).filter(k => /^k\d+$/.test(k)).length === 12, short(d));
    await seed({ n: 0 });
    let attempts = 0;
    await c.db.runTransaction(async tx => {
      attempts++;
      const s = await tx.get(ref);
      if (attempts === 1) await E.ownerSet(path, { n: 100 });
      tx.update(ref, { n: (s.data().n || 0) + 1 });
    });
    d = await doc(c.uid);
    check('F10 a transaction whose document changed before its commit runs again on the new value', attempts >= 2 && d && d.n === 101, `${attempts} attempt(s), stored ${short(d)}`);
    await E.ownerDelete(path);
    await setOnline(dev, false);
    let landed = false; const off = ref.set({ off: 1 }, { merge: true }).then(() => { landed = true; });
    await sleep(1500);
    const midway = await doc(c.uid);
    const tSrv = Date.now(); const srv = await err(ref.get({ source: 'server' })); const srvMs = Date.now() - tSrv;
    const local = await ref.get().then(s => ({ exists: s.exists, pending: s.metadata.hasPendingWrites, cache: s.metadata.fromCache, data: s.data() }), e => ({ err: e.code }));
    const tTx = Date.now(); const tx = await Promise.race([err(c.db.runTransaction(async t => { await t.get(ref); })), sleep(30000).then(() => 'still pending after 30 s')]); const txMs = Date.now() - tTx;
    check('F12 offline: set() does not settle and nothing reaches the server', !landed && midway === null, `landed ${landed}, stored ${short(midway)}`);
    check('F12 offline: a server read fails at once (unavailable)', srv === 'unavailable' && srvMs < 3000, `${srv} after ${srvMs} ms`);
    check('F12 offline: a transaction fails (it does not hang)', tx !== 'ok' && !/pending/.test(tx), tx);
    note(`F12: the transaction failed after ${txMs} ms (${tx}); save-loop's fake fails it "at once": a flushSave that must first move a doc (swap45Commit) waits this long offline`);
    check('F13 offline: a plain get() answers from the tab\'s own queued write: a PARTIAL doc, pending, from the cache', local.exists === true && local.pending === true && local.cache === true && same(local.data, { off: 1 }), short(local));
    await setOnline(dev, true);
    await until(() => landed, 20000);
    d = await doc(c.uid);
    check('F11 the write made offline lands on reconnect', landed && d && d.off === 1, `landed ${landed}, stored ${short(d)}`);
    await setOnline(dev, false);
    const c2 = await rawClient(world, dev, who);
    c2.db.doc(path).set({ lost: 1 }, { merge: true }).catch(() => {});
    await sleep(300);
    await c2.close();
    await setOnline(dev, true);
    await sleep(1500);
    d = await doc(c.uid);
    check('F11 a write still queued when its app is deleted (a closed tab) is lost: no offline persistence', d && !('lost' in d), short(d));
    const other = await uidFor(acct());
    const f15 = await err(c.db.doc('progress/' + other).get());
    check('F15 a read the rules refuse fails with permission-denied (what loadProgress records as progressLoadDenied)', f15 === 'permission-denied', f15);
    await ref.set({ at: FV.serverTimestamp() }, { merge: true });
    d = await doc(c.uid);
    check('a server timestamp lands as the server\'s time', d && d.at && typeof d.at.__ts === 'number' && Math.abs(d.at.__ts - Date.now()) < 60000, short(d && d.at));
    const big = await err(ref.set({ big: 'x'.repeat(1100000) }, { merge: true }));
    d = await doc(c.uid);
    if (big === 'ok') note('a write past 1 MiB was ACCEPTED by this emulator: the size limit is not tested here (case "toolarge" says the same)');
    else check('a write that would make the doc larger than 1 MiB is refused and changes nothing', d && !('big' in d), `${big}, stored keys ${d && Object.keys(d).join(',')}`);
    await c.close();
  }

  /* ── PART B: the site's save path ── */
  const B = g => groups.includes(g);
  if (['new', 'reload', 'device2', 'untick', 'check'].some(B)){
    say('== part B: a new student, a reload, a second device, an un-tick, an exit check');
    const who = acct();
    const d1 = await makeDevice(world, 'D1');
    const { p, s, uid } = await open(d1, who);
    check('new student: the app', s === 'app', `${s}${pageNote(p)}`);
    p.run(`onCompleteChange(${JSON.stringify(K1)}, true); onCaStepChange(${JSON.stringify(STEP)}, true); onResponseChange(${JSON.stringify(Q1)}, 'Test answer'); logPracticeRep(${JSON.stringify(SKILL)}); bumpPracticeStreak();`);
    const ok = await waitSaved(p);
    let d = await doc(uid);
    const pl = d && d.practiceLog && d.practiceLog[SKILL];
    check('…everything lands: the tick, the activity step, the answer, the rep, the streak, name and email, the doc born marked', ok && d && same(d.completed, { [K1]: true }) && same(d.caSteps, { [STEP]: true }) && same(d.responses, { [Q1]: 'Test answer' })
      && pl && pl.reps === 1 && pl.todayCount === 1 && pl.lastDay === today() && same(d.streak, { count: 1, lastDay: today() }) && d.email === who.email && d.migrations && d.migrations.swap45 === true, short(d));
    check('…the page says "Saved"', p.saveKey() === 'save.saved' || p.saveMsgs.some(m => m.key === 'save.saved'), p.saveMsgs.map(m => m.key).join(' > '));
    if (B('reload') || B('device2') || B('untick') || B('check')){
      await p.close();
      const { p: p2, s: s2 } = await open(d1, who);
      const st = state(p2, '{ completed, caStepDone, responses, rep: practiceLog[' + JSON.stringify(SKILL) + '], streak, failed: progressLoadFailed }');
      check('reload (a fresh SDK on the same device): the page loads exactly the ledger', s2 === 'app' && !st.failed && same(st.completed, { [K1]: true }) && same(st.caStepDone, { [STEP]: true }) && same(st.responses, { [Q1]: 'Test answer' }) && st.rep && st.rep.reps === 1 && same(st.streak, { count: 1, lastDay: today() }), `${s2} ${short(st)}`);
      if (B('device2') || B('untick') || B('check')){
        const d2 = await makeDevice(world, 'D2');
        const { p: q, s: sq } = await open(d2, who);
        check('a second device loads the same work', sq === 'app' && same(state(q, 'completed'), { [K1]: true }), `${sq} ${short(state(q, 'completed'))}`);
        q.run(`onCompleteChange(${JSON.stringify(K2)}, true)`); await waitSaved(q);
        p2.run(`onCompleteChange(${JSON.stringify(K3)}, true)`); await waitSaved(p2);
        d = await doc(uid);
        check('…each device adds a tick (the first never saw the second\'s): all three land', d && same(d.completed, { [K1]: true, [K2]: true, [K3]: true }), short(d && d.completed));
        if (B('untick') || B('check')){
          q.run(`onCompleteChange(${JSON.stringify(K1)}, false)`); await waitSaved(q);
          d = await doc(uid);
          check('an un-tick lands as a removal (delete() nested in the merged set)', d && same(d.completed, { [K2]: true, [K3]: true }), short(d && d.completed));
        }
        if (B('check')){
          q.run(`ecStart(${JSON.stringify(CHECK)})`);
          const total = q.run(`ecItems(ecActivity(${JSON.stringify(CHECK)})).length`);
          for (let i = 0; i < total; i++){ await sleep(450); q.run(`ecPick(${JSON.stringify(CHECK)}, { dataset: { pick: 'zz' } })`); }
          await waitSaved(q);
          const shown = state(q, `exitChecks[${JSON.stringify(CHECK)}] || null`);
          d = await doc(uid);
          const want = { score: 0, total, picks: Array(total).fill('zz'), at: today(), attempts: 1 };
          check(`an exit check (${total} taps): the result the page shows is the one stored, and the activity is marked done`, total > 0 && same(shown, want) && d && same(d.exitChecks && d.exitChecks[CHECK], want) && d.classActivities && d.classActivities[CHECK] === true, `page ${short(shown)}; stored ${short(d && d.exitChecks)}; activities ${short(d && d.classActivities)}${pageNote(q)}`);
        }
        await q.close();
      }
      await p2.close();
    } else await p.close();
  }

  if (B('swap45')){
    say('== part B: the Module 4/5 move at sign-in (a real transaction)');
    const who = acct();
    const uid = await uidFor(who);
    await E.ownerSet('progress/' + uid, { name: who.name, email: who.email, completed: { 'm4w1-b-sec0-0': true, [K1]: true }, skills: { 'm4w1-s1': 'gotit' }, lastModule: 4, lastSet: 'm4w1', games: { dk: { 'chords-m5': { best: 7 } }, coach: { x: 1 } } });
    const dev = await makeDevice(world, 'S45');
    const { p, s } = await open(dev, who);
    await until(() => p.run('swap45Done'), 15000);
    let d = await doc(uid);
    check('an unmarked doc is moved once: the ids swapped, the marker set, nothing else touched', s === 'app' && d && same(d.completed, { 'm5w1-b-sec0-0': true, [K1]: true }) && same(d.skills, { 'm5w1-s1': 'gotit' }) && d.lastModule === 5 && d.lastSet === 'm5w1'
      && same(d.games, { dk: { 'chords-m4': { best: 7 } }, coach: { x: 1 } }) && d.migrations && d.migrations.swap45 === true, `${s} ${short(d)}${pageNote(p)}`);
    p.run(`onCompleteChange('m5w1-b-sec0-1', true)`); await waitSaved(p);
    d = await doc(uid);
    check('…a tick saved after it lands on the moved doc, no old-numbered key comes back', d && same(d.completed, { 'm5w1-b-sec0-0': true, 'm5w1-b-sec0-1': true, [K1]: true }), short(d && d.completed));
    await p.close();
  }

  if (B('race45')){
    say('== part B: two devices sign in at once on an unmarked doc');
    const who = acct();
    const uid = await uidFor(who);
    await E.ownerSet('progress/' + uid, { name: who.name, email: who.email, completed: { 'm4w1-b-sec0-0': true }, lastModule: 4 });
    const da = await makeDevice(world, 'RA'), db2 = await makeDevice(world, 'RB');
    const [ra, rb] = await Promise.all([open(da, who), open(db2, who)]);
    await until(() => ra.p.run('swap45Done') && rb.p.run('swap45Done'), 20000);
    const d = await doc(uid);
    check('…moved exactly once (a second move would swap it back), both pages marked', d && same(d.completed, { 'm5w1-b-sec0-0': true }) && d.lastModule === 5 && d.migrations && d.migrations.swap45 === true && ra.p.run('swap45Done') && rb.p.run('swap45Done'), short(d));
    await ra.p.close(); await rb.p.close();
  }

  if (B('startover')){
    say('== part B: the teacher\'s Start over (the console\'s own writer), applied by the student\'s next sign-in');
    const who = acct();
    const uid = await uidFor(who);
    await E.ownerSet('progress/' + uid, { name: who.name, email: who.email, completed: { [K1]: true }, responses: { [Q1]: 'old answer' }, skills: { 'm1w1-s1': 'gotit' }, lastModule: 2, lastSet: 'm2w1',
      practiceLog: { [SKILL]: { reps: 3 } }, classActivities: { 'ca-18': true }, caSteps: { [STEP]: true }, migrations: { swap45: true } });
    const td = await makeDevice(world, 'TSO');
    const { p: tp, s: ts } = await open(td, { sub: 'pe-teacher', email: TEACHER, verified: true, name: 'Teacher' }, { teacher: true });
    let at = null, why = '';
    if (ts === 'console'){ try { at = await tp.run(`trmWriteMarker('progressStartOver', ${JSON.stringify(uid)})`); } catch (e){ why = e.message; } }
    const cfg = await E.ownerGet('config/class');
    check('the console\'s Start over writes progressStartOver[uid] (a time) through its own config writer', typeof at === 'number' && cfg && cfg.progressStartOver && cfg.progressStartOver[uid] === at, `console ${ts}; ${why}; returned ${at}; stored ${short(cfg && cfg.progressStartOver)}${pageNote(tp)}`);
    await tp.close();
    const dev = await makeDevice(world, 'SO1');
    const { p, s } = await open(dev, who);
    let d = await doc(uid);
    const st = s === 'app' ? state(p, '{ completed, responses, practiceLog, caStepDone }') : null;
    check('…the student\'s next sign-in empties the lesson work and keeps the activities, once (startOverApplied = that time)', s === 'app' && d && !('completed' in d) && !('responses' in d) && !('skills' in d) && !('lastModule' in d) && !('practiceLog' in d)
      && same(d.classActivities, { 'ca-18': true }) && same(d.caSteps, { [STEP]: true }) && d.startOverApplied === at, `${s} ${short(d)}${pageNote(p)}`);
    check('…the page starts from the emptied doc and says so once', st && same(st.completed, {}) && same(st.responses, {}) && same(st.practiceLog, {}) && same(st.caStepDone, { [STEP]: true }) && p.notices.some(x => x.id === 'reset-notice'), `${short(st)}; notices ${p.notices.map(x => x.id).join(',')}`);
    await p.close();
    const dev2 = await makeDevice(world, 'SO2');
    const { p: q } = await open(dev2, who);
    q.run(`onCompleteChange(${JSON.stringify(K2)}, true)`); await waitSaved(q);
    d = await doc(uid);
    check('…another device signs in later: not applied again; its tick lands', d && same(d.completed, { [K2]: true }) && d.startOverApplied === at && !q.notices.some(x => x.id === 'reset-notice'), short(d));
    await q.close();
  }

  if (B('signout')){
    say('== part B: Sign out, then the next student on the same Chromebook');
    const a1 = acct('Test A'), b1 = acct('Test B');
    const dev = await makeDevice(world, 'SHARED');
    const { p, uid } = await open(dev, a1);
    p.run(`onCompleteChange(${JSON.stringify(K1)}, true)`);
    p.run('signOut()');
    const out = await until(() => p.reloadAsked, 10000);
    let d = await doc(uid);
    check('Sign out right after a tick: the tick lands first, then the page reloads signed out', out && d && same(d.completed, { [K1]: true }), `reloaded ${out}; stored ${short(d && d.completed)}; notices ${p.notices.map(x => x.id).join(',')}`);
    await p.close('silent');
    const { p: q, s: sq, uid: ub } = await open(dev, b1);
    const st = state(q, '{ completed, responses, cu: currentUser.uid }');
    check('…the next student signs in on the same device: none of the first one\'s work on the page', sq === 'app' && same(st.completed, {}) && same(st.responses, {}) && st.cu === ub, `${sq} ${short(st)}`);
    q.run(`onCompleteChange(${JSON.stringify(K2)}, true)`); await waitSaved(q);
    const da = await doc(uid), dbb = await doc(ub);
    check('…their tick lands in their own record only', dbb && same(dbb.completed, { [K2]: true }) && da && same(da.completed, { [K1]: true }), `first ${short(da && da.completed)}; second ${short(dbb && dbb.completed)}`);
    await q.close();
  }

  if (B('offline')){
    say('== part B: the Wi-Fi drops and comes back');
    const who = acct();
    const dev = await makeDevice(world, 'OFF');
    const { p, uid } = await open(dev, who);
    p.run(`onCompleteChange(${JSON.stringify(K1)}, true)`); await waitSaved(p);
    await setOnline(dev, false);
    const before = p.saveMsgs.length;
    p.run(`onCompleteChange(${JSON.stringify(K2)}, true)`);
    await sleep(2500);
    let d = await doc(uid);
    const keys = p.saveMsgs.slice(before).map(m => m.key);
    check('a tick made offline: not on the server yet, and the page never says "Saved"', d && same(d.completed, { [K1]: true }) && !keys.includes('save.saved'), `stored ${short(d && d.completed)}; page ${keys.join(' > ')}`);
    await setOnline(dev, true);
    await waitSaved(p, 20000);
    d = await doc(uid);
    check('…the Wi-Fi comes back: it lands, and the page says "Saved"', d && same(d.completed, { [K1]: true, [K2]: true }) && p.saveMsgs.slice(before).some(m => m.key === 'save.saved'), `stored ${short(d && d.completed)}; page ${p.saveMsgs.slice(before).map(m => m.key).join(' > ')}`);
    await p.close();
  }

  if (B('offline-signout')){
    say('== part B: Sign out with the Wi-Fi down');
    const who = acct();
    const dev = await makeDevice(world, 'OSO');
    const { p, uid } = await open(dev, who);
    p.run(`onCompleteChange(${JSON.stringify(K1)}, true)`); await waitSaved(p);
    await setOnline(dev, false);
    p.run(`onCompleteChange(${JSON.stringify(K2)}, true)`);
    p.run('signOut()');
    const told = await until(() => p.notices.some(x => x.id === 'unsaved-notice'), 9000);
    check('Sign out offline with a tick unsaved: the page says "not saved yet", stays signed in, no reload', told && !p.reloadAsked && p.run('!!currentUser'), `notice ${told}; reload ${p.reloadAsked}`);
    await setOnline(dev, true);
    const landed = await until(async () => { const d = await doc(uid); return d && d.completed && d.completed[K2] === true; }, 20000);
    check('…the Wi-Fi comes back: the queued tick lands', landed);
    await p.close();
  }

  if (B('offline-close')){
    say('== part B: a tab closed while offline');
    const who = acct();
    const dev = await makeDevice(world, 'OCL');
    const { p, uid } = await open(dev, who);
    p.run(`onCompleteChange(${JSON.stringify(K1)}, true)`); await waitSaved(p);
    await setOnline(dev, false);
    p.run(`onCompleteChange(${JSON.stringify(K2)}, true)`);
    await sleep(200);
    await p.close('close');
    await setOnline(dev, true);
    await sleep(2000);
    const d = await doc(uid);
    check('a tick made offline in a tab closed before the reconnect is lost (no offline persistence), the earlier tick kept', d && same(d.completed, { [K1]: true }), short(d && d.completed));
  }

  if (B('toolarge')){
    say('== part B: a save the database refuses (a document past 1 MiB)');
    const who = acct();
    const dev = await makeDevice(world, 'BIG');
    const { p, uid } = await open(dev, who);
    p.run(`onCompleteChange(${JSON.stringify(K1)}, true)`); await waitSaved(p);
    const before = p.saveMsgs.length;
    p.run(`onCompleteChange(${JSON.stringify(K2)}, true); onResponseChange(${JSON.stringify(Q1)}, 'x'.repeat(1100000))`);
    await until(() => p.saveMsgs.slice(before).some(m => m.key === 'save.failed' || m.key === 'save.saved'), 15000);
    let d = await doc(uid);
    const keys = p.saveMsgs.slice(before).map(m => m.key);
    if (keys.includes('save.saved') && d && d.responses && d.responses[Q1]) note('this emulator ACCEPTED a document past 1 MiB: case "toolarge" proves nothing here');
    else {
      check('a 1.1 MB answer: the whole save is refused, the page says the save failed (never "Saved"), nothing of it lands', keys.includes('save.failed') && !keys.includes('save.saved') && d && same(d.completed, { [K1]: true }) && !(d.responses && Q1 in d.responses), `page ${keys.join(' > ')}; stored ${short(d && d.completed)}`);
      p.run(`onResponseChange(${JSON.stringify(Q1)}, 'short answer')`);
      await waitSaved(p, 20000);
      d = await doc(uid);
      check('…the answer made short again: the next save lands it and the tick that waited', d && same(d.completed, { [K1]: true, [K2]: true }) && d.responses && d.responses[Q1] === 'short answer', short(d && { completed: d.completed, q: d.responses && d.responses[Q1] }));
    }
    await p.close('silent');
  }

  if (!quiet && world.faults.length) console.log(`   note: ${world.faults.length} unhandled rejection(s) from site code, first: ${world.faults[0]}`);
  if (!quiet && VERBOSE) for (const p of world.pages) for (const f of p.faults) console.log('      (page fault) ' + p.id + ': ' + f);
  await closeAll(world);
  return { pass, fail, red, world };
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
console.log(`== progress-emu-loop: ${A.rules.split('/').pop()} on the emulators (Firestore ${A.fsHost}, Auth ${A.authHost}), project ${A.project}; Firebase JS SDK ${sdk.version} (index.html loads ${sdk.siteVersion}); site ${A.site}`);
const versionBad = sdk.version !== sdk.siteVersion ? 1 : 0;
if (versionBad) console.log(`   ✗ the SDK here (${sdk.version}) is not the version the site loads (${sdk.siteVersion}): install firebase@${sdk.siteVersion} in --deps`);
let real;
try { real = await suite(groups, null, false); }
catch (e){ console.log(`\n✗ progress-emu-loop could not run: ${e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : e}${/fetch failed|ECONNREFUSED/.test(String(e.message) + (e.cause || '')) ? ` (no emulator at ${A.fsHost} / ${A.authHost}? run it inside firebase emulators:exec --only firestore,auth)` : ''}: 0 passed, 1 failed`); process.exit(2); }
const wallBad = wall.refused.length;
if (wallBad) console.log(`      the tool's fetch was asked for ${wallBad} address(es) off this machine, first ${wall.refused[0]}\n  ✗ the wall: nothing may leave 127.0.0.1`);
console.log(`   (every page asked for project ${[...new Set(real.world.siteConfigs)].join(', ') || 'none'}; each was given ${A.project})`);
console.log(`\n${real.fail || wallBad || versionBad ? '✗' : '✓'} ${A.rules.split('/').pop()}: ${real.pass} passed, ${real.fail + (wallBad ? 1 : 0) + versionBad} failed`);
let missed = 0;
if (A.has('plants') || A.val('plant')){
  const pick = A.val('plant') ? [PLANTS[Number(A.val('plant')) - 1]].filter(Boolean) : PLANTS;
  console.log('\n== planted faults (an in-memory copy of one site file; each must turn a case red that is green on the real code)');
  let skipped = 0;
  for (const pl of pick){
    const gs = pl.groups.filter(g => groups.includes(g));
    if (!gs.length){ console.log(`  - skipped: ${pl.name} (its groups, ${pl.groups.join(', ')}, are not in --only)`); skipped++; continue; }
    let r;
    try { r = await suite(gs, pl, true); }
    catch (e){ console.log(`  ✗ ${pl.name}: ${e.plantMiss ? e.message : 'the run failed: ' + e.message}`); missed++; continue; }
    const fresh = r.red.filter(x => !real.red.includes(x));
    if (fresh.length) console.log(`  ✓ caught: ${pl.name} — ${fresh.length} red: ${fresh.slice(0, 2).join(' | ').slice(0, 260)}${fresh.length > 2 ? ' | …' : ''}`);
    else { console.log(`  ✗ NOT caught: ${pl.name}`); missed++; }
  }
  console.log(`\n${missed ? '✗' : '✓'} ${pick.length - skipped - missed} of ${pick.length - skipped} breaks caught`);
}
console.log(`time: ${Math.round((Date.now() - T0) / 1000)} s`);
process.exit(real.fail || missed || wallBad || versionBad ? 1 : 0);
