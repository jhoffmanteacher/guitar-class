#!/usr/bin/env node
/* signin-loop.mjs — who gets into the class site, and can they SAVE: the site's real sign-in and access path on the
   real Firebase JS SDK, against the Auth and Firestore emulators loaded with the real firestore.rules (2026-11-26;
   closed-loop report 2026-11-26, step 1, rows 1-3 of its Appendix B).

   THE QUESTION. The page decides by itself whether an account is a school account (app/boot.js ACCESS_SCHOOL_RE,
   accessIsSchoolUser: such an account never gets the access screen and never asks the server); the rules decide
   whether its reads and saves are let through (firestore.rules isSchool()). If the two disagree, a student sees the
   site and every save is refused, or the other way round. And an outside account must be able to ask, be let in by
   the teacher's real console write, get in, save, and be shut out again.

   WHAT IS REAL. The site's pages (tools/emu-site.mjs: every script in index.html's order, unmodified, in a Node vm;
   the console's parts loaded by the site's own ensureTeacherJs), the Firebase JS SDK at the version index.html
   loads, the Auth emulator's made-up Google accounts, the Firestore emulator with the rules file given. The
   student's page signs in through its own Auth (signInWithCredential with a made-up Google token: Node has no
   popup); from there it is the site's own onAuthStateChanged (app/start.js): loadProgress, loadClassConfig,
   accessRefusedAtBoot, showAccessScreen or showApp. The student acts through the site's entry points
   (onCompleteChange for a tick; the access screen's own click listener for Ask and Check again). The teacher's
   page is the console (?teacher=true) signed in as the teacher's address, and its writes are teacher-accounts.js's
   own (teacherAccessLoad, teacherAccessDecide, teacherAccessSet, teacherAccessDeleteRequest).
   THE SEPARATE READER: the emulator's REST door with the owner key (rules bypassed): never the SDK, never the
   site's code. The rules' verdict on an account: a REST read of config/class with that account's ID token.

   GROUPS
     named   named made-up accounts through whole pages: a school address in two spellings, the teacher's own
             address, a subdomain, four look-alikes, an unverified school address, a school address with a space after
             it. For each: the rules' verdict (REST, its own token) is the one expected; the page shows the app
             exactly when the rules let the account in; in the app, a tick lands (the reader finds it, the page says
             "Saved"); on the access screen, a save from that page is refused (the page says the save failed) and
             nothing is stored.
     ask     an outside account: the access screen offers Ask; a save is refused; Ask stores accessRequests/{uid}
             with the token's own name and email, status asked, the server's time; Check again while still locked
             keeps the screen ("not yet"); the console's Allow writes config/access.allow[uid] = true and marks the
             request allowed; Check again reloads into the app; a tick there lands; the console's "Locked out"
             removes the entry and marks the request declined; the page still open says its next save failed and
             the tick is not stored; a new page load shows "declined"; a second Ask is refused and changes nothing.
     decline an outside account asks; the console's Decline; Check again shows "declined"; no allow entry.
     delete  an outside account asks; the console's Delete; a new page load offers Ask again; the second Ask lands.
     bulk    the client's school test against the rules' isSchool() on a generated list of addresses (spellings,
             cases, subdomains, look-alikes, look-alike letters, whitespace, odd shapes; verified and not): each
             through the Auth emulator's own Google sign-in (the address as the emulator keeps it: it lower-cases)
             AND as a token carrying the address exactly as given (a provider could send any case). The client's
             verdict is the REAL accessIsSchoolUser, run on a page; the rules' verdict is a read of config/class
             with that token, with no allow list. Zero disagreements allowed, in either direction.

   --plants: runs the groups each planted fault touches again, on an in-memory copy of the site file or of the rules
   text (never the files themselves), and prints how many cases each turned red that were green on the real code.
   Every plant must turn at least one red. --plant=<n> runs one. --only=<group,...> runs some groups.

   RUN IT BY HAND (Java 21 and the emulators, as for the other rules tests; see pm-rules-test.mjs for Java on a Mac).
   In an empty scratch folder (NOT inside the repo):
     npm init -y
     npm i --legacy-peer-deps firebase-tools@15.36.0 firebase@10.12.2
     # firebase.json: { "firestore": { "rules": "firestore.rules" }, "emulators": { "firestore": { "port": 8089, "host": "127.0.0.1" }, "auth": { "port": 9099, "host": "127.0.0.1" }, "ui": { "enabled": false } } }
     # If firebase-tools' own download of the Firestore emulator jar fails (it crashed mid-stream in a cloud session,
     # 2026-11-26), fetch it with curl from the remoteUrl in node_modules/firebase-tools/lib/emulator/
     # downloadableEmulatorInfo.json into ~/.cache/firebase/emulators/ and compare its sha256 with that file's.
     cp <repo>/firestore.rules .
     npx firebase emulators:exec --only firestore,auth --project demo-gc "node <repo>/tools/signin-loop.mjs --deps . --site <repo> --plants"
   (--deps: the folder whose node_modules holds firebase; --site: the checkout under test, default this one; --rules:
   the rules file, default <site>/firestore.rules. The emulators' addresses come from the variables emulators:exec
   sets.) GitHub runs it in rules.yml, job "emu-loops".
   Exit 0 = every case passed (and, with --plants, every plant was caught); 1 = a case failed or a plant was not
   caught; 2 = it could not run (no emulator, a project id that is not demo-, the SDK missing). The summary lines:
   "✓ firestore.rules: N passed, 0 failed" and "✓ K of K breaks caught".
   WHAT IT PRINTS AS IT GOES (2026-11-26, after GitHub run 45870814442 printed nothing for 24 minutes): one line as
   each case starts (▶) and ends (■), also in the quiet planted-fault runs; a case that does not finish within
   --case-ms (default 50 s) fails as "HUNG at <step>" and the run goes on; past --deadline (default 540 s) the run
   prints "HUNG at <case>" and exits 3. The deadline is kept by a worker thread (emu-site.mjs watchdog), so it fires
   even when this thread's event loop is blocked, and so does --stall (default 30 s with no heartbeat): it prints three
   samples of where the tool was stuck ("stuck in …", with the async callers) and exits 3. GitHub run 45885160639
   went silent for 9.5 minutes that way: the stub DOM's querySelector always answered null, so the console's split
   view drew [data-ta-detail], could not find it, and drew the split again in a promise round with no timer (fixed in
   emu-site.mjs: an element now finds what was drawn into its innerHTML). Before the first case a preflight checks
   that the SDK reaches both emulators (a sign-in, then a server read through a device relay, 15 s each) and stops
   with exit 2 if not (--no-preflight skips it: to watch every case run into its limits, as when diagnosing the tool
   itself).
   Last run: 2026-11-26, a cloud session with the emulator jar fetched by hand (firebase-tools 15.36.0, Firestore
   emulator 1.22.0): 56 passed, 0 failed, 10 of 10 breaks caught, 151 s (the bulk group of 320 addresses 8 s). */
import { readFileSync } from 'node:fs';
import { emuArgs, loadSdk, emulator, makeWorld, makeDevice, makePage, signInPage, waitScreen, until, sleep, closeAll, wall, makeRunner, step, watchdog, preflight } from './emu-site.mjs';

const ARGV = process.argv.slice(2);
const A = emuArgs(ARGV, 'signin-loop');
const T0 = Date.now();
let sdk;
try { sdk = loadSdk(A.deps, A.site); } catch (e){ console.log(`\n✗ signin-loop: ${e.message}: 0 passed, 1 failed`); process.exit(2); }
const E = emulator(A);
const RULES = readFileSync(A.rules, 'utf8');
if (!/function isSchool\(\)/.test(RULES)){ console.log(`\n✗ ${A.rules} has no isSchool() (the school-accounts gate): 0 passed, 1 failed`); process.exit(1); }
const VERBOSE = A.has('verbose');
const ONLY = (A.val('only') || '').split(',').filter(Boolean);
const CASE_MS = (Number(A.val('case-ms')) || 50) * 1000;
const DEADLINE = Number(A.val('deadline')) || 540;
const TEACHER = (/const TEACHER_EMAIL\s*=\s*'([^']+)'/.exec(readFileSync(`${A.site}/firebase-config.js`, 'utf8')) || [])[1] || 'jhoffman@seq.org';
const KEY1 = 'm1w1-b-sec0-0', KEY2 = 'm1w1-b-sec0-1';
let CUR = null;
await watchdog('signin-loop', DEADLINE, () => (CUR ? { pass: CUR.pass, fail: CUR.fail } : { pass: 0, fail: 0 }), Number(A.val('stall')) || 30);

/* ── one run of the cases ── */
async function suite(groups, plant, quiet, prefix){
  const R = makeRunner({ quiet, prefix, caseMs: CASE_MS });
  CUR = R;
  const check = R.check, say = R.out;
  await step(E.loadRules(plant && plant.rules ? plantRules(plant.rules) : RULES), 'loading the rules into the emulator');
  await step(E.clearFirestore(), 'clearing Firestore'); await step(E.clearAuth(), 'clearing Auth');
  const world = await makeWorld(A, sdk, { verbose: VERBOSE && !quiet, plants: plant ? plant.site || [] : [] });
  await step(E.ownerSet('config/class', { gamesEnabled: true }), 'seeding config/class');
  if (!quiet && !A.has('no-preflight')){
    const pf = await preflight(world);
    if (pf){ console.log(`\n✗ signin-loop: ${pf}: 0 passed, 1 failed`); await closeAll(world); process.exit(2); }
  }
  let n = 0;
  /* The Auth emulator keeps ONE account per address (a second Google account with the same address, in any case,
     is linked to the first: same uid), so every made-up account here has its own address; the teacher is one. */
  const acct = (email, verified, name) => email === TEACHER ? { sub: 'sl-teacher', email, verified: true, name: 'Teacher' } : ({ sub: `sl-${++n}-${Date.now().toString(36)}`, email, verified, name: name || `Test ${n}` });
  const pageNote = p => p ? ` [page faults: ${p.faults.slice(0, 2).join(' / ') || 'none'}; warns: ${p.warns.slice(-2).join(' / ') || 'none'}]` : '';
  const tokenOf = async p => { try { return await step(p.auth().currentUser.getIdToken(), 'reading the page\'s ID token', 10000); } catch { return null; } };
  const uidOf = p => { try { return p.auth().currentUser.uid; } catch { return null; } };
  /* A case that needs what an earlier case made, when that case did not finish. */
  const need = (...xs) => { if (xs.some(x => !x)) throw Object.assign(new Error('an earlier case did not finish'), { skipped: true }); };
  /* A page on a device, signed in, its screen decided. */
  const boot = async (dev, who, opts) => {
    const p = makePage(world, dev, opts || {});
    await signInPage(world, p, who);
    const s = opts && opts.teacher ? (await until(() => p.run('typeof teacherAccessDecide === "function" && !window.__authBootPending'), 20000) && 'console') : await waitScreen(p, 12000);
    return { p, s };
  };
  /* The page's save of one tick: 'landed' (the reader finds it and the page said Saved) | 'refused' (the page said the
     save failed and the reader finds nothing) | a description of anything else. */
  const tick = async (p, key) => {
    const uid = uidOf(p), before = p.saveMsgs.length;
    p.run(`onCompleteChange(${JSON.stringify(key)}, true)`);
    const settled = await until(() => p.saveMsgs.slice(before).some(m => m.key === 'save.failed' || m.key === 'save.notSaving') || (p.run('_dirtyKeys.size === 0 && !_flushP') && p.saveMsgs.slice(before).some(m => m.key === 'save.saved')), 12000);
    const keys = p.saveMsgs.slice(before).map(m => m.key).filter(Boolean);
    const doc = uid ? await E.ownerGet('progress/' + uid) : null;
    const stored = !!(doc && doc.completed && doc.completed[key] === true);
    if (keys.includes('save.saved') && !keys.includes('save.failed') && stored) return 'landed';
    if (keys.some(k => k === 'save.failed' || k === 'save.notSaving') && !stored) return 'refused';
    return `page said [${keys.join(' > ') || 'nothing'}]${settled ? '' : ' (still waiting after 12 s)'}, reader ${stored ? 'finds' : 'does not find'} the tick`;
  };
  const shut = async (...ps) => { for (const p of ps) if (p) await p.close('silent'); };
  /* A click on one of the access screen's buttons, only if the screen DREW that button, enabled (review R1-1,
     2026-11-26: the screen's listener answers a click on any data-access, so a button the screen forgot would
     still have been "pressed"). Otherwise the case fails, naming the state. */
  const press = (p, act) => {
    const scr = p.els['access-screen'];
    const b = scr && scr.querySelector(`[data-access="${act}"]`);
    if (!b || 'disabled' in b.attrs) throw new Error(`the access screen has no ${b ? 'enabled ' : ''}"${act}" button (state ${p.run('accessState')})`);
    return p.click('access-screen', { access: act });
  };

  /* ── named accounts ── */
  if (groups.includes('named')){
    say('== named accounts: who gets in, and can they save');
    const NAMED = [
      ['a school address', 'test0@seq.org', true, 'in'],
      ['a school address in capitals (the Auth emulator lower-cases it)', 'TEST1@SEQ.ORG', true, 'in'],
      ["the teacher's own address on the student site", TEACHER, true, 'in'],
      ['a school subdomain (test2@mail.seq.org)', 'test2@mail.seq.org', true, 'out'],
      ['a look-alike (test3@seq.org.evil.example)', 'test3@seq.org.evil.example', true, 'out'],
      ['a look-alike (test4@notseq.org)', 'test4@notseq.org', true, 'out'],
      ['a look-alike (test5+seq.org@gmail.example)', 'test5+seq.org@gmail.example', true, 'out'],
      ['a look-alike (test6@seq-org.example)', 'test6@seq-org.example', true, 'out'],
      ['an UNVERIFIED school address', 'test7@seq.org', false, 'out'],
      /* A space AFTER the address: the rules' pattern must end at "org", so it is an outside account; the page
         trimmed it until 2026-11-26 and showed the app with every save refused. (A space in front is "school" to
         both: [^@]+ takes it.) */
      ['a school address with a space after it ("test8@seq.org ": the rules refuse it, so the page must too)', 'test8@seq.org ', true, 'out'],
    ];
    for (const [label, email, verified, want] of NAMED){
      /* Every case name carries the account's address: the plant scorer tells cases apart by name. */
      const tag = JSON.stringify(email);
      let page = null;
      await R.case(`named ${tag}`, async () => {
        const dev = await makeDevice(world, 'N' + n);
        const { p, s } = await boot(dev, acct(email, verified));
        page = p;
        const tok = await tokenOf(p);
        const verdict = tok ? await E.readAs('config/class', tok) : 'no token';
        check(`${label}: the rules ${want === 'in' ? 'let it in' : 'refuse it'}`, verdict === (want === 'in' ? 'ok' : 'denied'), `rules: ${verdict}`);
        const screen = want === 'in' ? 'app' : 'access';
        check(`…${tag}: the page shows ${screen === 'app' ? 'the app' : 'the access screen'}`, s === screen, `the page shows ${s || 'nothing after 12 s'}${pageNote(p)}`);
        if (s === 'app' || s === 'access'){
          const r = await tick(p, KEY1);
          if (s === 'app') check(`…${tag}: a tick in the app saves (the reader finds it; the page says "Saved")`, r === 'landed', `${r}${r === 'refused' ? ': the app is on screen and the rules refuse every save' : ''}${pageNote(p)}`);
          else check(`…${tag}: a save from the access screen's page is refused (the page says so) and nothing is stored`, r === 'refused', r);
        }
      });
      await shut(page);
    }
  }

  /* ── an outside account: ask, allowed, in, saves, shut out ── */
  if (groups.includes('ask')){
    say('== an outside account: ask, the console allows, it gets in and saves, the console locks it out');
    const S = { who: acct('test9@gmail.example', true, 'Test 9') };
    await R.case('ask: before asking', async () => {
      S.dev = await makeDevice(world, 'ASK'); S.tdev = await makeDevice(world, 'TEACHER');
      const { p, s } = await boot(S.dev, S.who);
      S.p = p; S.uid = uidOf(p);
      check('before asking: the access screen', s === 'access', `the page shows ${s}${pageNote(p)}`);
      check('…it offers "Ask your teacher" (nothing asked yet)', await until(() => p.run('accessState') === 'none', 8000), `state ${p.run('accessState')}`);
      check('…a save from that page is refused and nothing is stored', (await tick(p, KEY1)) === 'refused');
      await shut(p); S.p = null;
    });
    await R.case('ask: a new page load', async () => {
      need(S.dev);
      const { p, s } = await boot(S.dev, S.who);
      S.p = p;
      check('a new page load: the access screen again, and this device remembers the refusal', s === 'access' && S.dev.store['gcAccessRefused:' + S.uid] === '1', `screen ${s}, remembered ${S.dev.store['gcAccessRefused:' + S.uid]}`);
      await until(() => p.run('accessState') === 'none', 8000);
    });
    await R.case('ask: Ask', async () => {
      need(S.p);
      const clicked = press(S.p, 'ask');
      const asked = await until(() => S.p.run('accessState') === 'asked', 12000);
      const req = await E.ownerGet('accessRequests/' + S.uid);
      const at = req && req.at && req.at.__ts;
      check('Ask (the screen\'s own button): the screen says "asked"', clicked && asked, `clicked ${clicked}, state ${S.p.run('accessState')}${pageNote(S.p)}`);
      check('…the reader finds accessRequests/{uid}: the token\'s name and email, status asked, the server\'s time', !!req && req.name === 'Test 9' && req.email === S.who.email && req.status === 'asked' && typeof at === 'number' && Math.abs(at - Date.now()) < 120000 && Object.keys(req).sort().join() === 'at,email,name,status', JSON.stringify(req));
    });
    await R.case('ask: Check again while locked out', async () => {
      need(S.p);
      press(S.p, 'check');
      const still = await until(() => S.p.run('!accessBusy && accessNote === "access.stillWaiting" && accessState === "asked"'), 10000);
      check('Check again while still locked out: stays, says "not yet", no reload', still && !S.p.reloadAsked, `note ${S.p.run('accessNote')}, state ${S.p.run('accessState')}, reload ${S.p.reloadAsked}`);
    });
    await R.case('ask: the console opens', async () => {
      need(S.tdev);
      const { p, s } = await boot(S.tdev, acct(TEACHER, true, 'Teacher'), { teacher: true });
      S.tp = s === 'console' ? p : null;
      check('the console (?teacher=true, the teacher\'s address) has its accounts code loaded', s === 'console', `${s}${pageNote(p)}`);
      if (!S.tp) await shut(p);
    });
    await R.case('ask: the console allows', async () => {
      need(S.tp, S.uid);
      await step(S.tp.run('teacherAccessLoad()'), 'the console reading the allow list and the requests');
      const listed = S.tp.run(`(teacherAccessReqs || []).some(r => r.uid === ${JSON.stringify(S.uid)} && r.status === 'asked')`);
      check('…the console lists the request as waiting', listed, `requests ${S.tp.run('JSON.stringify((teacherAccessReqs||[]).map(r => r.status))')}, error ${S.tp.run('teacherAccessReqErr')}`);
      await step(S.tp.run(`teacherAccessDecide(${JSON.stringify(S.uid)}, 'allowed')`), 'the console\'s Allow');
      const acc = await E.ownerGet('config/access'), req2 = await E.ownerGet('accessRequests/' + S.uid);
      check('Allow (the console\'s own writer): the reader finds config/access.allow[uid] = true and the request marked allowed', !!acc && acc.allow && acc.allow[S.uid] === true && req2 && req2.status === 'allowed', `note "${S.tp.run('teacherAccessNote')}"; config/access ${JSON.stringify(acc)}; request ${req2 && req2.status}`);
    });
    await R.case('ask: Check again once allowed', async () => {
      need(S.p);
      press(S.p, 'check');
      check('Check again once allowed: the page reloads into the site', await until(() => S.p.reloadAsked, 10000), `state ${S.p.run('accessState')}, note ${S.p.run('accessNote')}`);
      await shut(S.p); S.p = null;
      const { p, s } = await boot(S.dev, S.who);
      S.p3 = p;
      check('…the new page load shows the app, and the device forgets the refusal', s === 'app' && !S.dev.store['gcAccessRefused:' + S.uid], `screen ${s}, remembered ${S.dev.store['gcAccessRefused:' + S.uid]}${pageNote(p)}`);
      if (s === 'app') check('…a tick saves (the reader finds it; the page says "Saved")', (await tick(p, KEY1)) === 'landed');
    });
    await R.case('ask: the console locks it out', async () => {
      need(S.tp, S.uid);
      await step(S.tp.run('teacherAccessLoad()'), 'the console reading the allow list again');
      await step(S.tp.run(`teacherAccessSet([${JSON.stringify(S.uid)}], false)`), 'the console\'s Locked out');
      const acc = await E.ownerGet('config/access'), req3 = await E.ownerGet('accessRequests/' + S.uid);
      check('"Locked out" (the console\'s own writer): the entry is gone and the request marked declined', !!acc && !(acc.allow && S.uid in acc.allow) && req3 && req3.status === 'declined', `config/access ${JSON.stringify(acc)}; request ${req3 && req3.status}`);
    });
    await R.case('ask: the open page\'s next save', async () => {
      need(S.p3);
      const r = await tick(S.p3, KEY2);
      check('…the page still open: its next save is refused, the page says so (never "Saved"), the tick is not stored', r === 'refused', r);
      await shut(S.p3); S.p3 = null;
    });
    await R.case('ask: a new page load after the lock-out', async () => {
      need(S.dev);
      const { p, s } = await boot(S.dev, S.who);
      S.p4 = p;
      check('…a new page load: the access screen, saying "declined"', s === 'access' && await until(() => p.run('accessState') === 'declined', 8000), `screen ${s}, state ${p.run('accessState')}`);
      const reqBefore = JSON.stringify(await E.ownerGet('accessRequests/' + S.uid));
      await step(p.run('accessAsk()'), 'a second Ask', 15000);
      await sleep(300);
      check('…asking again is refused by the rules and changes nothing', JSON.stringify(await E.ownerGet('accessRequests/' + S.uid)) === reqBefore && p.run('accessState') === 'declined', `state ${p.run('accessState')}`);
    });
    await shut(S.p, S.p3, S.p4, S.tp);
  }

  /* ── Decline ── */
  if (groups.includes('decline')){
    say('== an outside account asks; the console declines');
    const S = { who: acct('test10@outside.example', true, 'Test 10') };
    await R.case('decline: Ask', async () => {
      S.dev = await makeDevice(world, 'DEC'); S.tdev = await makeDevice(world, 'TEACHER2');
      const { p, s } = await boot(S.dev, S.who);
      S.p = p; S.uid = uidOf(p);
      await until(() => p.run('accessState') === 'none', 8000);
      press(p, 'ask');
      check('the access screen; Ask lands', s === 'access' && await until(() => p.run('accessState') === 'asked', 12000) && (await E.ownerGet('accessRequests/' + S.uid) || {}).status === 'asked', `screen ${s}, state ${p.run('accessState')}`);
    });
    await R.case('decline: the console declines', async () => {
      need(S.tdev, S.uid);
      const { p, s } = await boot(S.tdev, acct(TEACHER, true, 'Teacher'), { teacher: true });
      S.tp = p;
      if (s === 'console'){
        await step(p.run('teacherAccessLoad()'), 'the console reading the requests');
        await step(p.run(`teacherAccessDecide(${JSON.stringify(S.uid)}, 'declined')`), 'the console\'s Decline');
      }
      const req = await E.ownerGet('accessRequests/' + S.uid), acc = await E.ownerGet('config/access');
      check('Decline (the console\'s own writer): the request is declined, no allow entry', s === 'console' && req && req.status === 'declined' && !(acc && acc.allow && S.uid in acc.allow), `console ${s}; request ${req && req.status}; config/access ${JSON.stringify(acc)}`);
    });
    await R.case('decline: Check again', async () => {
      need(S.p);
      press(S.p, 'check');
      check('…Check again: the screen says "declined", no reload', await until(() => S.p.run('!accessBusy && accessState === "declined"'), 10000) && !S.p.reloadAsked, `state ${S.p.run('accessState')}`);
    });
    await shut(S.p, S.tp);
  }

  /* ── Delete ── */
  if (groups.includes('delete')){
    say('== an outside account asks; the console deletes the request; it may ask again');
    const S = { who: acct('test11@outside.example', true, 'Test 11') };
    await R.case('delete: Ask', async () => {
      S.dev = await makeDevice(world, 'DEL'); S.tdev = await makeDevice(world, 'TEACHER3');
      const { p, s } = await boot(S.dev, S.who);
      S.p = p; S.uid = uidOf(p);
      await until(() => p.run('accessState') === 'none', 8000);
      press(p, 'ask');
      S.asked = s === 'access' && await until(() => p.run('accessState') === 'asked', 12000);
    });
    await R.case('delete: the console deletes', async () => {
      need(S.tdev, S.uid);
      const { p, s } = await boot(S.tdev, acct(TEACHER, true, 'Teacher'), { teacher: true });
      S.tp = p;
      if (s === 'console'){
        await step(p.run('teacherAccessLoad()'), 'the console reading the requests');
        await step(p.run(`teacherAccessDeleteRequest(${JSON.stringify(S.uid)})`), 'the console\'s Delete');
      }
      check('Delete (the console\'s own writer, after its confirm): the reader finds no request', S.asked && s === 'console' && (await E.ownerGet('accessRequests/' + S.uid)) === null, `asked ${S.asked}, console ${s}, note "${s === 'console' ? p.run('teacherAccessNote') : ''}"`);
    });
    await R.case('delete: ask again', async () => {
      need(S.dev, S.uid);
      await shut(S.p); S.p = null;
      const { p, s } = await boot(S.dev, S.who);
      S.p = p;
      check('…a new page load offers Ask again', s === 'access' && await until(() => p.run('accessState') === 'none', 8000), `screen ${s}, state ${p.run('accessState')}`);
      press(p, 'ask');
      check('…and the second Ask lands', await until(() => p.run('accessState') === 'asked', 12000) && (await E.ownerGet('accessRequests/' + S.uid) || {}).status === 'asked', `state ${p.run('accessState')}`);
    });
    await shut(S.p, S.tp);
  }

  /* ── the client's school test against isSchool(), address by address ── */
  if (groups.includes('bulk')){
    say('== the client\'s school test (accessIsSchoolUser) against the rules\' isSchool(), with no allow list');
    await step(E.ownerDelete('config/access'), 'removing the allow list');
    const dev = await makeDevice(world, 'BULK');
    const probe = makePage(world, dev);
    const client = (email, verified) => probe.run(`accessIsSchoolUser(${JSON.stringify({ email, emailVerified: verified })})`) === true;
    const list = bulkList();
    let i = 0;
    const out = { auth: { n: 0, dis: [], refusedByEmu: 0, same: 0 }, forged: { n: 0, dis: [] } };
    /* Through the Auth emulator: one pass per verified flag (Auth cleared before each: the emulator keeps an
       account's first flag), each address once per pass (it links a second account with the same address). */
    for (const ver of [true, false]){
      await R.case(`bulk: through the Auth emulator's sign-in, ${ver ? 'verified' : 'unverified'}`, async () => {
        await step(E.clearAuth(), 'clearing Auth');
        const seen = new Set();
        const todo = list.filter(([email, v]) => v === ver && !seen.has(email.toLowerCase()) && seen.add(email.toLowerCase()));
        out.auth.same += list.filter(([, v]) => v === ver).length - todo.length;
        const one = async ([email, verified]) => {
          const k = ++i;
          const g = await E.googleSignIn({ sub: `bulk-${k}`, email, email_verified: verified, name: `Test ${k}` });
          if (g.error || !g.idToken){ out.auth.refusedByEmu++; return; }
          out.auth.n++;
          const c = client(g.email === undefined ? '' : g.email, g.emailVerified), r = await E.readAs('config/class', g.idToken);
          if (c !== (r === 'ok')) out.auth.dis.push({ email, kept: g.email, verified: g.emailVerified, client: c, rules: r });
        };
        for (let j = 0; j < todo.length; j += 16) await Promise.all(todo.slice(j, j + 16).map(one));
      }, 180000);
    }
    /* As exact tokens: every address, as given. */
    await R.case('bulk: as exact tokens', async () => {
      const forged = async ([email, verified]) => {
        const k = ++i;
        out.forged.n++;
        const c2 = client(email, verified), r2 = await E.readAs('config/class', E.forgeToken({ sub: `bulkf-${k}`, email, email_verified: verified, name: `Test ${k}` }));
        if (c2 !== (r2 === 'ok')) out.forged.dis.push({ email, verified, client: c2, rules: r2 });
      };
      for (let j = 0; j < list.length; j += 16) await Promise.all(list.slice(j, j + 16).map(forged));
    }, 180000);
    const show = d => `${JSON.stringify(d.email)}${d.kept !== undefined && d.kept !== d.email ? ` (kept as ${JSON.stringify(d.kept)})` : ''} verified ${d.verified}: the page says ${d.client ? 'school' : 'not school'}, the rules ${d.rules === 'ok' ? 'let it in' : d.rules === 'denied' ? 'refuse it' : d.rules}`;
    say(`   ${list.length} addresses; the Auth emulator signed in ${out.auth.n} (${out.auth.same} were the same address in another case, refused ${out.auth.refusedByEmu}); ${out.forged.n} as exact tokens`);
    if (out.auth.dis.length) for (const d of out.auth.dis) check(`through sign-in: ${show(d)}`, false, 'the page and the rules disagree');
    else check(`through the Auth emulator's sign-in: the page and the rules agree on all ${out.auth.n} accounts`, out.auth.n > 0, 'no account signed in');
    if (out.forged.dis.length) for (const d of out.forged.dis) check(`as an exact token: ${show(d)}`, false, 'the page and the rules disagree');
    else check(`as exact tokens: the page and the rules agree on all ${out.forged.n} addresses`, out.forged.n > 0);
    const school = list.filter(([e, v]) => v && client(e, v)).length;
    check(`the list holds both answers (${school} school, ${list.length - school} not)`, school >= 10 && list.length - school >= 10);
    await probe.close('silent');
  }

  for (const p of world.pages) for (const f of p.faults) if (!quiet && VERBOSE) console.log('      (page fault) ' + p.id + ': ' + f);
  if (!quiet && world.faults.length) console.log(`   note: ${world.faults.length} unhandled rejection(s) from site code, first: ${world.faults[0]}`);
  await closeAll(world);
  return { pass: R.pass, fail: R.fail, red: R.red, world };
}

/* The generated addresses: [email, email_verified]. */
function bulkList(){
  const locals = ['test0', 'Test.Zero', 'a', 'a+b', 'x-y_z', 'äna', 'ÄNA', '0', 'a.b.c', 'TEST7', 'a b', 'a"b'];
  const domains = ['seq.org', 'SEQ.ORG', 'Seq.Org', 'seq.ORG', 'mail.seq.org', 'MAIL.SEQ.ORG', 'seq.org.evil.example', 'notseq.org', 'xseq.org',
    'seq-org.example', 'seqxorg', 'seq.orgx', 'seq.or', 'seq.org.', 'seq..org', 'ſeq.org', 'ѕeq.org', 'seq．org', 'gmail.example', 'outside.example'];
  const out = [];
  for (const l of locals) for (const d of domains) out.push([l + '@' + d, true]);
  for (const e of ['test0@seq.org', 'TEST1@SEQ.ORG', 'a@mail.seq.org', 'test2@gmail.example'])
    for (const w of [x => ' ' + x, x => x + ' ', x => x + '\n', x => '\t' + x]) out.push([w(e), true]);
  /* Unicode spaces (no-break, the byte-order mark, ideographic, line separator) in front and after, and local parts
     that are only space (review R1-4, 2026-11-26). */
  for (const e of ['test0@seq.org', 'TEST1@SEQ.ORG'])
    for (const u of ['\u00a0', '\ufeff', '\u3000', '\u2028']) out.push([u + e, true], [e + u, true]);
  for (const l of [' ', '\t', '\n', '\u00a0', '\ufeff', '\u3000', '\u2028', '  ']) out.push([l + '@seq.org', true]);
  for (const e of ['@seq.org', 'a@@seq.org', 'a@b@seq.org', 'seq.org', '', 'a@seq.org\u0000', 'a@seq.org/x', '@', 'a@SEQ.org.', 'a@seq.org@seq.org']) out.push([e, true]);
  for (const l of locals.slice(0, 6)) for (const d of domains.slice(0, 5)) out.push([l + '@' + d, false]);
  return out;
}

/* ── planted faults ── */
const PLANTS = [
  { name: 'the page\'s school test drops the i flag (ACCESS_SCHOOL_RE)', groups: ['bulk'], site: [{ file: 'app/boot.js', from: 'const ACCESS_SCHOOL_RE = /^[^@]+@seq\\.org$/i;', to: 'const ACCESS_SCHOOL_RE = /^[^@]+@seq\\.org$/;' }] },
  { name: 'the page\'s school test forgets email_verified', groups: ['named', 'bulk'], site: [{ file: 'app/boot.js', from: 'user.emailVerified === true && ACCESS_SCHOOL_RE.test(', to: 'ACCESS_SCHOOL_RE.test(' }] },
  { name: 'the page\'s school test is not anchored', groups: ['bulk'], site: [{ file: 'app/boot.js', from: 'const ACCESS_SCHOOL_RE = /^[^@]+@seq\\.org$/i;', to: 'const ACCESS_SCHOOL_RE = /@seq\\.org/i;' }] },
  { name: 'the rules\' isSchool() drops .lower()', groups: ['bulk'], rules: [{ from: ".get('email', '').lower().matches('^[^@]+@seq[.]org$')", to: ".get('email', '').matches('^[^@]+@seq[.]org$')" }] },
  { name: 'the rules\' isSchool() leaves the dot unescaped', groups: ['bulk'], rules: [{ from: "matches('^[^@]+@seq[.]org$')", to: "matches('^[^@]+@seq.org$')" }] },
  { name: 'the rules\' allow list is looked up by email, not uid', groups: ['ask'], rules: [{ from: ".get(request.auth.uid, false) == true));", to: ".get(request.auth.token.get('email', ''), false) == true));" }] },
  { name: 'the console writes the allow entry with a dotted key (set() keeps the dot: a field named "allow.<uid>")', groups: ['ask'], site: [{ file: 'teacher-accounts.js', from: "await db.collection('config').doc('access').set({ allow }, { merge: true });", to: "const dotted = {}; Object.keys(allow).forEach(u => { dotted['allow.' + u] = allow[u]; }); await db.collection('config').doc('access').set(dotted, { merge: true });" }] },
  { name: 'Ask sends the device\'s clock as its time', groups: ['ask', 'delete'], site: [{ file: 'app/boot.js', from: 'at: firebase.firestore.FieldValue.serverTimestamp(),', to: 'at: new Date(),' }] },
  { name: 'the access screen draws no Ask button before anything is asked (review plant P-E)', groups: ['ask'], site: [{ file: 'app/boot.js', from: "if(s === 'none' || s === 'failed') buttons = btn('access.ask', 'ask', true);", to: "if(s === 'failed') buttons = btn('access.ask', 'ask', true);" }] },
  { name: 'showApp throws once the app is on screen (review plant P-F)', groups: ['named'], site: [{ file: 'app/boot.js', from: "  document.getElementById('app').style.display='block';\n  document.getElementById('fab-group')", to: "  document.getElementById('app').style.display='block';\n  throw new Error('planted: showApp');\n  document.getElementById('fab-group')" }] },
];
function plantRules(list){
  let t = RULES;
  for (const r of list){
    const k = t.split(r.from).length - 1;
    if (k !== 1) throw Object.assign(new Error(`the rules text to change is found ${k} times (must be 1): ${r.from.slice(0, 70)}`), { plantMiss: true });
    t = t.replace(r.from, () => r.to);
  }
  return t;
}

/* ── main ── */
const ALL = ['named', 'ask', 'decline', 'delete', 'bulk'];
const groups = ONLY.length ? ALL.filter(g => ONLY.includes(g)) : ALL;
console.log(`== signin-loop: ${A.rules.split('/').pop()} on the emulators (Firestore ${A.fsHost}, Auth ${A.authHost}), project ${A.project}; Firebase JS SDK ${sdk.version} (index.html loads ${sdk.siteVersion}); site ${A.site}; a case may take ${CASE_MS / 1000} s, the run ${DEADLINE} s`);
if (sdk.version !== sdk.siteVersion) console.log(`   ✗ the SDK here (${sdk.version}) is not the version the site loads (${sdk.siteVersion}): install firebase@${sdk.siteVersion} in --deps`);
let real;
try { real = await suite(groups, null, false, ''); }
catch (e){ console.log(`\n✗ signin-loop could not run: ${e.message}${/fetch failed|ECONNREFUSED/.test(String(e.message) + (e.cause || '')) ? ` (no emulator at ${A.fsHost} / ${A.authHost}? run it inside firebase emulators:exec --only firestore,auth)` : ''}: 0 passed, 1 failed`); process.exit(2); }
const wallBad = wall.refused.length;
if (wallBad) console.log(`      the tool's fetch was asked for ${wallBad} address(es) off this machine, first ${wall.refused[0]}\n  ✗ the wall: nothing may leave 127.0.0.1`);
console.log(`   (every page asked for project ${[...new Set(real.world.siteConfigs)].join(', ') || 'none'}; each was given ${A.project})`);
const versionBad = sdk.version !== sdk.siteVersion ? 1 : 0;
console.log(`\n${real.fail || wallBad || versionBad ? '✗' : '✓'} ${A.rules.split('/').pop()}: ${real.pass} passed, ${real.fail + (wallBad ? 1 : 0) + versionBad} failed`);
console.log(`time: ${Math.round((Date.now() - T0) / 1000)} s (the cases)`);
let missed = 0;
if (A.has('plants') || A.val('plant')){
  const pick = A.val('plant') ? [PLANTS[Number(A.val('plant')) - 1]].filter(Boolean) : PLANTS;
  console.log('\n== planted faults (an in-memory copy of one site file or of the rules; each must turn a case red that is green on the real code)');
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
  await step(E.loadRules(RULES), 'putting the real rules back');
  console.log(`\n${missed ? '✗' : '✓'} ${pick.length - skipped - missed} of ${pick.length - skipped} breaks caught`);
}
console.log(`time: ${Math.round((Date.now() - T0) / 1000)} s`);
process.exit(real.fail || missed || wallBad || versionBad ? 1 : 0);
