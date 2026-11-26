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
             address, a subdomain, four look-alikes, an unverified school address, a school address with a space in
             front. For each: the rules' verdict (REST, its own token) is the one expected; the page shows the app
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
     # firebase.json: { "firestore": { "rules": "firestore.rules" }, "emulators": { "firestore": { "port": 8089 }, "auth": { "port": 9099 }, "ui": { "enabled": false } } }
     cp <repo>/firestore.rules .
     npx firebase emulators:exec --only firestore,auth --project demo-gc "node <repo>/tools/signin-loop.mjs --deps . --site <repo> --plants"
   (--deps: the folder whose node_modules holds firebase; --site: the checkout under test, default this one; --rules:
   the rules file, default <site>/firestore.rules. The emulators' addresses come from the variables emulators:exec
   sets.) GitHub runs it in rules.yml, job "emu-loops".
   Exit 0 = every case passed (and, with --plants, every plant was caught); 1 = a case failed or a plant was not
   caught; 2 = it could not run (no emulator, a project id that is not demo-, the SDK missing). The summary lines:
   "✓ firestore.rules: N passed, 0 failed" and "✓ K of K breaks caught".
   Last run: not yet (built 2026-11-26 in a cloud session whose network could not fetch the Firestore emulator). */
import { readFileSync } from 'node:fs';
import { emuArgs, loadSdk, emulator, makeWorld, makeDevice, makePage, signInPage, waitScreen, until, sleep, waitSaved, closeAll, wall } from './emu-site.mjs';

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
const TEACHER = (/const TEACHER_EMAIL\s*=\s*'([^']+)'/.exec(readFileSync(`${A.site}/firebase-config.js`, 'utf8')) || [])[1] || 'jhoffman@seq.org';
const KEY1 = 'm1w1-b-sec0-0', KEY2 = 'm1w1-b-sec0-1';

/* ── one run of the cases ── */
async function suite(groups, plant, quiet){
  let pass = 0, fail = 0; const red = [];
  const say = s => { if (!quiet) console.log(s); };
  const check = (name, ok, why) => {
    if (ok) pass++; else { fail++; red.push(name); }
    if (!quiet){ if (!ok && why) console.log('      ' + String(why).slice(0, 300)); console.log((ok ? '  ✓ ' : '  ✗ ') + name); }
    return ok;
  };
  await E.loadRules(plant && plant.rules ? plantRules(plant.rules) : RULES);
  await E.clearFirestore(); await E.clearAuth();
  const world = await makeWorld(A, sdk, { verbose: VERBOSE && !quiet, plants: plant ? plant.site || [] : [] });
  await E.ownerSet('config/class', { gamesEnabled: true });
  let n = 0;
  /* The Auth emulator keeps ONE account per address (a second Google account with the same address, in any case,
     is linked to the first: same uid), so every made-up account here has its own address; the teacher is one. */
  const acct = (email, verified, name) => email === TEACHER ? { sub: 'sl-teacher', email, verified: true, name: 'Teacher' } : ({ sub: `sl-${++n}-${Date.now().toString(36)}`, email, verified, name: name || `Test ${n}` });
  const pageNote = p => p ? ` [page faults: ${p.faults.slice(0, 2).join(' / ') || 'none'}; warns: ${p.warns.slice(-2).join(' / ') || 'none'}]` : '';
  const tokenOf = async p => { try { return await p.auth().currentUser.getIdToken(); } catch { return null; } };
  const uidOf = p => { try { return p.auth().currentUser.uid; } catch { return null; } };
  /* A page on a device, signed in, its screen decided. */
  const boot = async (dev, who, opts) => {
    const p = makePage(world, dev, opts || {});
    await signInPage(world, p, who);
    const s = opts && opts.teacher ? await until(() => p.run('typeof teacherAccessDecide === "function" && !window.__authBootPending'), 30000) && 'console' : await waitScreen(p, 20000);
    return { p, s };
  };
  /* The page's save of one tick: 'landed' (the reader finds it and the page said Saved) | 'refused' (the page said the
     save failed and the reader finds nothing) | a description of anything else. */
  const tick = async (p, key) => {
    const uid = uidOf(p), before = p.saveMsgs.length;
    p.run(`onCompleteChange(${JSON.stringify(key)}, true)`);
    const settled = await until(() => p.saveMsgs.slice(before).some(m => m.key === 'save.failed' || m.key === 'save.notSaving') || (p.run('_dirtyKeys.size === 0 && !_flushP') && p.saveMsgs.slice(before).some(m => m.key === 'save.saved')), 20000);
    const keys = p.saveMsgs.slice(before).map(m => m.key).filter(Boolean);
    const doc = uid ? await E.ownerGet('progress/' + uid) : null;
    const stored = !!(doc && doc.completed && doc.completed[key] === true);
    if (keys.includes('save.saved') && !keys.includes('save.failed') && stored) return 'landed';
    if (keys.some(k => k === 'save.failed' || k === 'save.notSaving') && !stored) return 'refused';
    return `page said [${keys.join(' > ') || 'nothing'}]${settled ? '' : ' (still waiting after 20 s)'}, reader ${stored ? 'finds' : 'does not find'} the tick`;
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
      ['a school address with a space in front (" test8@seq.org": the page trims, the rules do not)', ' test8@seq.org', true, 'out'],
    ];
    for (const [label, email, verified, want] of NAMED){
      const dev = await makeDevice(world, 'N' + n);
      const { p, s } = await boot(dev, acct(email, verified));
      const tok = await tokenOf(p);
      const verdict = tok ? await E.readAs('config/class', tok) : 'no token';
      /* Every case name carries the account's address: the plant scorer tells cases apart by name. */
      const tag = JSON.stringify(email);
      check(`${label}: the rules ${want === 'in' ? 'let it in' : 'refuse it'}`, verdict === (want === 'in' ? 'ok' : 'denied'), `rules: ${verdict}`);
      const screen = want === 'in' ? 'app' : 'access';
      check(`…${tag}: the page shows ${screen === 'app' ? 'the app' : 'the access screen'}`, s === screen, `the page shows ${s || 'nothing after 20 s'}${pageNote(p)}`);
      if (s === 'app' || s === 'access'){
        const r = await tick(p, KEY1);
        if (s === 'app') check(`…${tag}: a tick in the app saves (the reader finds it; the page says "Saved")`, r === 'landed', `${r}${r === 'refused' ? ': the app is on screen and the rules refuse every save' : ''}${pageNote(p)}`);
        else check(`…${tag}: a save from the access screen's page is refused (the page says so) and nothing is stored`, r === 'refused', r);
      }
      await p.close('silent');
    }
  }

  /* ── an outside account: ask, allowed, in, saves, shut out ── */
  if (groups.includes('ask')){
    say('== an outside account: ask, the console allows, it gets in and saves, the console locks it out');
    const who = acct('test9@gmail.example', true, 'Test 9');
    const dev = await makeDevice(world, 'ASK');
    const tdev = await makeDevice(world, 'TEACHER');
    let { p: p1, s } = await boot(dev, who);
    const uid = uidOf(p1);
    check('before asking: the access screen', s === 'access', `the page shows ${s}${pageNote(p1)}`);
    check('…it offers "Ask your teacher" (nothing asked yet)', await until(() => p1.run('accessState') === 'none', 8000), `state ${p1.run('accessState')}`);
    check('…a save from that page is refused and nothing is stored', (await tick(p1, KEY1)) === 'refused');
    await p1.close('silent');
    ({ p: p1, s } = await boot(dev, who));
    check('a new page load: the access screen again, and this device remembers the refusal', s === 'access' && dev.store['gcAccessRefused:' + uid] === '1', `screen ${s}, remembered ${dev.store['gcAccessRefused:' + uid]}`);
    await until(() => p1.run('accessState') === 'none', 8000);
    const clicked = p1.click('access-screen', { access: 'ask' });
    const asked = await until(() => p1.run('accessState') === 'asked', 12000);
    const req = await E.ownerGet('accessRequests/' + uid);
    const at = req && req.at && req.at.__ts;
    check('Ask (the screen\'s own button): the screen says "asked"', clicked && asked, `clicked ${clicked}, state ${p1.run('accessState')}${pageNote(p1)}`);
    check('…the reader finds accessRequests/{uid}: the token\'s name and email, status asked, the server\'s time', !!req && req.name === 'Test 9' && req.email === who.email && req.status === 'asked' && typeof at === 'number' && Math.abs(at - Date.now()) < 120000 && Object.keys(req).sort().join() === 'at,email,name,status', JSON.stringify(req));
    const beforeNote = p1.saveMsgs.length; void beforeNote;
    p1.click('access-screen', { access: 'check' });
    const still = await until(() => p1.run('!accessBusy && accessNote === "access.stillWaiting" && accessState === "asked"'), 10000);
    check('Check again while still locked out: stays, says "not yet", no reload', still && !p1.reloadAsked, `note ${p1.run('accessNote')}, state ${p1.run('accessState')}, reload ${p1.reloadAsked}`);
    const { p: tp, s: ts } = await boot(tdev, acct(TEACHER, true, 'Teacher'), { teacher: true });
    check('the console (?teacher=true, the teacher\'s address) has its accounts code loaded', ts === 'console', `${ts}${pageNote(tp)}`);
    if (ts === 'console'){
      await tp.run('teacherAccessLoad()');
      const listed = tp.run(`(teacherAccessReqs || []).some(r => r.uid === ${JSON.stringify(uid)} && r.status === 'asked')`);
      check('…the console lists the request as waiting', listed, `requests ${tp.run('JSON.stringify((teacherAccessReqs||[]).map(r => r.status))')}, error ${tp.run('teacherAccessReqErr')}`);
      await tp.run(`teacherAccessDecide(${JSON.stringify(uid)}, 'allowed')`);
      const acc = await E.ownerGet('config/access'), req2 = await E.ownerGet('accessRequests/' + uid);
      check('Allow (the console\'s own writer): the reader finds config/access.allow[uid] = true and the request marked allowed', !!acc && acc.allow && acc.allow[uid] === true && req2 && req2.status === 'allowed', `note "${tp.run('teacherAccessNote')}"; config/access ${JSON.stringify(acc)}; request ${req2 && req2.status}`);
    }
    p1.click('access-screen', { access: 'check' });
    check('Check again once allowed: the page reloads into the site', await until(() => p1.reloadAsked, 10000), `state ${p1.run('accessState')}, note ${p1.run('accessNote')}`);
    await p1.close('silent');
    const { p: p3, s: s3 } = await boot(dev, who);
    check('…the new page load shows the app, and the device forgets the refusal', s3 === 'app' && !dev.store['gcAccessRefused:' + uid], `screen ${s3}, remembered ${dev.store['gcAccessRefused:' + uid]}${pageNote(p3)}`);
    if (s3 === 'app') check('…a tick saves (the reader finds it; the page says "Saved")', (await tick(p3, KEY1)) === 'landed');
    if (ts === 'console'){
      await tp.run('teacherAccessLoad()');
      await tp.run(`teacherAccessSet([${JSON.stringify(uid)}], false)`);
      const acc = await E.ownerGet('config/access'), req3 = await E.ownerGet('accessRequests/' + uid);
      check('"Locked out" (the console\'s own writer): the entry is gone and the request marked declined', !!acc && !(acc.allow && uid in acc.allow) && req3 && req3.status === 'declined', `config/access ${JSON.stringify(acc)}; request ${req3 && req3.status}`);
    }
    if (s3 === 'app'){
      const r = await tick(p3, KEY2);
      check('…the page still open: its next save is refused, the page says so (never "Saved"), the tick is not stored', r === 'refused', r);
    }
    await p3.close('silent');
    const { p: p4, s: s4 } = await boot(dev, who);
    check('…a new page load: the access screen, saying "declined"', s4 === 'access' && await until(() => p4.run('accessState') === 'declined', 8000), `screen ${s4}, state ${p4.run('accessState')}`);
    const reqBefore = JSON.stringify(await E.ownerGet('accessRequests/' + uid));
    await p4.run('accessAsk()');
    await sleep(300);
    check('…asking again is refused by the rules and changes nothing', JSON.stringify(await E.ownerGet('accessRequests/' + uid)) === reqBefore && p4.run('accessState') === 'declined', `state ${p4.run('accessState')}`);
    await p4.close('silent'); await tp.close('silent');
  }

  /* ── Decline ── */
  if (groups.includes('decline')){
    say('== an outside account asks; the console declines');
    const who = acct('test10@outside.example', true, 'Test 10');
    const dev = await makeDevice(world, 'DEC'), tdev = await makeDevice(world, 'TEACHER2');
    const { p, s } = await boot(dev, who);
    const uid = uidOf(p);
    await until(() => p.run('accessState') === 'none', 8000);
    p.click('access-screen', { access: 'ask' });
    check('the access screen; Ask lands', s === 'access' && await until(() => p.run('accessState') === 'asked', 12000) && (await E.ownerGet('accessRequests/' + uid) || {}).status === 'asked', `screen ${s}, state ${p.run('accessState')}`);
    const { p: tp, s: ts } = await boot(tdev, acct(TEACHER, true, 'Teacher'), { teacher: true });
    if (ts === 'console'){ await tp.run('teacherAccessLoad()'); await tp.run(`teacherAccessDecide(${JSON.stringify(uid)}, 'declined')`); }
    const req = await E.ownerGet('accessRequests/' + uid), acc = await E.ownerGet('config/access');
    check('Decline (the console\'s own writer): the request is declined, no allow entry', ts === 'console' && req && req.status === 'declined' && !(acc && acc.allow && uid in acc.allow), `console ${ts}; request ${req && req.status}; config/access ${JSON.stringify(acc)}`);
    p.click('access-screen', { access: 'check' });
    check('…Check again: the screen says "declined", no reload', await until(() => p.run('!accessBusy && accessState === "declined"'), 10000) && !p.reloadAsked, `state ${p.run('accessState')}`);
    await p.close('silent'); await tp.close('silent');
  }

  /* ── Delete ── */
  if (groups.includes('delete')){
    say('== an outside account asks; the console deletes the request; it may ask again');
    const who = acct('test11@outside.example', true, 'Test 11');
    const dev = await makeDevice(world, 'DEL'), tdev = await makeDevice(world, 'TEACHER3');
    let { p, s } = await boot(dev, who);
    const uid = uidOf(p);
    await until(() => p.run('accessState') === 'none', 8000);
    p.click('access-screen', { access: 'ask' });
    const ok1 = s === 'access' && await until(() => p.run('accessState') === 'asked', 12000);
    const { p: tp, s: ts } = await boot(tdev, acct(TEACHER, true, 'Teacher'), { teacher: true });
    if (ts === 'console'){ await tp.run('teacherAccessLoad()'); await tp.run(`teacherAccessDeleteRequest(${JSON.stringify(uid)})`); }
    check('Delete (the console\'s own writer, after its confirm): the reader finds no request', ok1 && ts === 'console' && (await E.ownerGet('accessRequests/' + uid)) === null, `asked ${ok1}, console ${ts}, note "${ts === 'console' ? tp.run('teacherAccessNote') : ''}"`);
    await p.close('silent');
    ({ p, s } = await boot(dev, who));
    check('…a new page load offers Ask again', s === 'access' && await until(() => p.run('accessState') === 'none', 8000), `screen ${s}, state ${p.run('accessState')}`);
    p.click('access-screen', { access: 'ask' });
    check('…and the second Ask lands', await until(() => p.run('accessState') === 'asked', 12000) && (await E.ownerGet('accessRequests/' + uid) || {}).status === 'asked', `state ${p.run('accessState')}`);
    await p.close('silent'); await tp.close('silent');
  }

  /* ── the client's school test against isSchool(), address by address ── */
  if (groups.includes('bulk')){
    say('== the client\'s school test (accessIsSchoolUser) against the rules\' isSchool(), with no allow list');
    await E.ownerDelete('config/access');
    const dev = await makeDevice(world, 'BULK');
    const probe = makePage(world, dev);
    const client = (email, verified) => probe.run(`accessIsSchoolUser(${JSON.stringify({ email, emailVerified: verified })})`) === true;
    const list = bulkList();
    let i = 0;
    const out = { auth: { n: 0, dis: [], refusedByEmu: 0, same: 0 }, forged: { n: 0, dis: [] } };
    /* Through the Auth emulator: one pass per verified flag (Auth cleared before each: the emulator keeps an
       account's first flag), each address once per pass (it links a second account with the same address). */
    for (const ver of [true, false]){
      await E.clearAuth();
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
    }
    /* As exact tokens: every address, as given. */
    const forged = async ([email, verified]) => {
      const k = ++i;
      out.forged.n++;
      const c2 = client(email, verified), r2 = await E.readAs('config/class', E.forgeToken({ sub: `bulkf-${k}`, email, email_verified: verified, name: `Test ${k}` }));
      if (c2 !== (r2 === 'ok')) out.forged.dis.push({ email, verified, client: c2, rules: r2 });
    };
    for (let j = 0; j < list.length; j += 16) await Promise.all(list.slice(j, j + 16).map(forged));
    const show = d => `${JSON.stringify(d.email)}${d.kept !== undefined && d.kept !== d.email ? ` (kept as ${JSON.stringify(d.kept)})` : ''} verified ${d.verified}: the page says ${d.client ? 'school' : 'not school'}, the rules ${d.rules === 'ok' ? 'let it in' : d.rules === 'denied' ? 'refuse it' : d.rules}`;
    say(`   ${list.length} addresses; the Auth emulator signed in ${out.auth.n} (${out.auth.same} were the same address in another case, refused ${out.auth.refusedByEmu}); ${out.forged.n} as exact tokens`);
    if (out.auth.dis.length) for (const d of out.auth.dis) check(`through sign-in: ${show(d)}`, false, 'the page and the rules disagree');
    else check(`through the Auth emulator's sign-in: the page and the rules agree on all ${out.auth.n} accounts`, out.auth.n > 0, 'no account signed in');
    if (out.forged.dis.length) for (const d of out.forged.dis) check(`as an exact token: ${show(d)}`, false, 'the page and the rules disagree');
    else check(`as exact tokens: the page and the rules agree on all ${out.forged.n} addresses`, out.forged.n > 0);
    const school = list.filter(([e, v]) => v && client(e, v)).length;
    check(`the list holds both answers (${school} school, ${list.length - school} not)`, school >= 10 && list.length - school >= 10);
  }

  for (const p of world.pages) for (const f of p.faults) if (!quiet && VERBOSE) console.log('      (page fault) ' + p.id + ': ' + f);
  if (!quiet && world.faults.length) console.log(`   note: ${world.faults.length} unhandled rejection(s) from site code, first: ${world.faults[0]}`);
  await closeAll(world);
  return { pass, fail, red, world };
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
console.log(`== signin-loop: ${A.rules.split('/').pop()} on the emulators (Firestore ${A.fsHost}, Auth ${A.authHost}), project ${A.project}; Firebase JS SDK ${sdk.version} (index.html loads ${sdk.siteVersion}); site ${A.site}`);
if (sdk.version !== sdk.siteVersion) console.log(`   ✗ the SDK here (${sdk.version}) is not the version the site loads (${sdk.siteVersion}): install firebase@${sdk.siteVersion} in --deps`);
let real;
try { real = await suite(groups, null, false); }
catch (e){ console.log(`\n✗ signin-loop could not run: ${e.message}${/fetch failed|ECONNREFUSED/.test(String(e.message) + (e.cause || '')) ? ` (no emulator at ${A.fsHost} / ${A.authHost}? run it inside firebase emulators:exec --only firestore,auth)` : ''}: 0 passed, 1 failed`); process.exit(2); }
const wallBad = wall.refused.length;
if (wallBad) console.log(`      the tool's fetch was asked for ${wallBad} address(es) off this machine, first ${wall.refused[0]}\n  ✗ the wall: nothing may leave 127.0.0.1`);
console.log(`   (every page asked for project ${[...new Set(real.world.siteConfigs)].join(', ') || 'none'}; each was given ${A.project})`);
const versionBad = sdk.version !== sdk.siteVersion ? 1 : 0;
console.log(`\n${real.fail || wallBad || versionBad ? '✗' : '✓'} ${A.rules.split('/').pop()}: ${real.pass} passed, ${real.fail + (wallBad ? 1 : 0) + versionBad} failed`);
let missed = 0;
if (A.has('plants') || A.val('plant')){
  const pick = A.val('plant') ? [PLANTS[Number(A.val('plant')) - 1]].filter(Boolean) : PLANTS;
  console.log('\n== planted faults (an in-memory copy of one site file or of the rules; each must turn a case red that is green on the real code)');
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
  await E.loadRules(RULES);
  console.log(`\n${missed ? '✗' : '✓'} ${pick.length - skipped - missed} of ${pick.length - skipped} breaks caught`);
}
console.log(`time: ${Math.round((Date.now() - T0) / 1000)} s`);
process.exit(real.fail || missed || wallBad || versionBad ? 1 : 0);
