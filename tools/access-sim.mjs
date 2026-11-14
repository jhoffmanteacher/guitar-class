#!/usr/bin/env node
/* access-sim.mjs — school accounts and "asking to join" (2026-11-13), proved in Node with the REAL code.

   1. The student's access screen: app/boot.js from "/* ── An account the database does not let in" up to
      "function showApp(user){" (accessCheck, showAccessScreen, accessPaint, accessReadMine, accessAsk,
      accessRecheck), with the real i18n.js for t(), a small fake DOM and a fake Firestore. Walks every
      state in both languages:
        an @seq.org account (no read at all) · an outside account the rules let in · refused + never asked
        (the Ask button) · Ask pressed (the exact document sent, from the token's claims) · refused + asked
        · Check again while still refused (stays, says "Not yet") · Check again once allowed (reloads) ·
        refused + declined (Sign out only, no Ask, no Check again) · the ask refused (says it did not send)
        · offline at sign-in (lets the boot go on) · the tab coming back (re-checks at most once per 30 s).
      Every state: the screen holds no unescaped markup from the account's name, never shows the site,
      and the only writes are the one accessRequests/{own uid} document (never progress).
   2. The console block: teacher-accounts.js with the real escHtml / escAttr (app/boot.js) and the real
      teacherStudentPeriod (teacher-core.js), a fake roster and fake Firestore:
        the counts (school / not / allowed / locked out); hostile names and emails (markup, a 5,000-character
        name, right-to-left overrides, control characters) never reach the HTML unescaped or uncut;
        every write to config/access is a MERGE of single keys under `allow` (never a whole-document set);
        Allow / Decline write the allow list and the request status; "Allow all in CAS" allows exactly the
        CAS rows not yet allowed; a refused read says the rules are not pasted, not "nobody".
   Exit 0 = every case passed. Prints "access-sim: N passed, 0 failed". */
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { siteSource } from './site-src.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BOOT = readFileSync(join(ROOT, 'app/boot.js'), 'utf8');
const SAVE = readFileSync(join(ROOT, 'app/save.js'), 'utf8');
const START = readFileSync(join(ROOT, 'app/start.js'), 'utf8');
const I18N = readFileSync(join(ROOT, 'i18n.js'), 'utf8');
const ACCOUNTS = readFileSync(join(ROOT, 'teacher-accounts.js'), 'utf8');
const TEACHER = siteSource('teacher.js', ROOT);
let pass = 0, fail = 0;
const check = (name, cond, detail) => { if (cond) pass++; else fail++; console.log((cond ? '  ✓ ' : '  ✗ ') + name + (!cond && detail ? '  (' + detail + ')' : '')); };
const slice = (src, a, b) => { const i = src.indexOf(a), j = src.indexOf(b, i); if (i < 0 || j < 0) throw new Error('marker not found: ' + (i < 0 ? a : b)); return src.slice(i, j); };
const ESC = (BOOT.match(/^const escHtml = .*$/m) || [])[0] + '\n' + (BOOT.match(/^const escAttr = .*$/m) || [])[0];
const HOSTILE = '<img src=x onerror=alert(1)>\u202Eevil\u0007\u0000' + 'x'.repeat(5000);
const RAW_BAD = /<img|\u202E|\u0007|\u0000/;   // escaped text (&lt;img … onerror=…&gt;) is fine: it cannot run

/* A tiny DOM: elements by id, innerHTML kept as a string, one click listener each. */
function fakeDom() {
  const els = {};
  const mk = id => ({ id, style: {}, dataset: {}, innerHTML: '', className: '', hidden: false, listeners: {}, children: [],
    addEventListener(k, f) { this.listeners[k] = f; }, appendChild(c) { this.children.push(c); if (c.id) els[c.id] = c; return c; },
    setAttribute() {}, removeAttribute() {}, querySelector() { return null; }, remove() { delete els[this.id]; } });
  for (const id of ['auth-wall', 'app', 'teacher-app', 'fab-group', 'search-btn', 'user-area', 't-grid-container', 't-access-block', 't-summary', 't-side']) els[id] = mk(id);
  const body = mk('body');
  els['t-summary'].parentNode = { insertBefore(n) { els[n.id] = n; } };
  const document = { getElementById: id => els[id] || null, querySelector: sel => sel === '.wrap, main, body' ? body : null,
    createElement: () => mk(''), documentElement: {}, hidden: false, addEventListener() {}, querySelectorAll: () => [] };
  return { els, document, mk };
}
/* Click a [data-access=…] button inside the access screen: the screen's own listener runs. */
function clickAccess(dom, act) {
  const el = dom.els['access-screen'];
  const target = { closest: sel => sel === '[data-access]' ? { dataset: { access: act } } : null };
  el.listeners.click({ target });
}
const tick = () => new Promise(r => setTimeout(r, 0));
const settle = async () => { for (let i = 0; i < 20; i++) await tick(); };

/* ── 1. the student's access screen ─────────────────────────────────────── */
async function studentRun(lang, scenario) {
  const dom = fakeDom();
  const writes = [], reads = [];
  const ls = Object.assign(scenario.ls || {}, { 'gc-lang': lang });   // scenario.ls: one device's storage, shared across page loads
  let reloaded = 0, signedOut = 0;
  const err = code => Object.assign(new Error(code), { code });
  const db = { collection: c => ({ doc: id => ({
    get: async (opts) => { reads.push(c + '/' + id + (opts && opts.source ? '@' + opts.source : ''));
      if (c === 'config') { const r = scenario.config(); if (r !== 'ok') throw err(r); return { exists: true, data: () => ({}) }; }
      if (c === 'progress') { const r = (scenario.progress || scenario.config)(); if (r !== 'ok') throw err(r); return { exists: false, data: () => null }; }
      if (c === 'accessRequests') { const st = scenario.request(); if (st === 'error') throw err('unavailable'); return st ? { exists: true, data: () => ({ status: st }) } : { exists: false, data: () => null }; }
      throw new Error('unexpected read ' + c); },
    set: (d, o) => { writes.push({ path: c + '/' + id, d, o });
      if (scenario.askHang) return new Promise(res => { scenario.land = () => { scenario.asked = true; res(); }; });   // offline, no cache: never settles until "landed"
      if (scenario.askFails) return Promise.reject(err(scenario.askFails === true ? 'unavailable' : scenario.askFails));
      scenario.asked = true; return Promise.resolve(); },
  }) }) };
  const ctx = {
    console: { warn() {}, log() {}, error() {} }, setTimeout, clearTimeout, Date, JSON, Promise, Object, String, Error,
    localStorage: { getItem: k => (k in ls ? ls[k] : null), setItem: (k, v) => { ls[k] = String(v); }, removeItem: k => { delete ls[k]; } },
    CustomEvent: class {}, location: { reload: () => { reloaded++; }, hostname: 'gc.example', search: '' },
    firebase: { firestore: { FieldValue: { serverTimestamp: () => '<server time>' } } },
    IS_TEACHER_MODE: false, db, currentUser: null, navigator: { onLine: scenario.online !== undefined ? scenario.online : false },
  };
  ctx.window = ctx; ctx.document = dom.document; ctx.window.dispatchEvent = () => {};
  vm.createContext(ctx);
  vm.runInContext(I18N, ctx, { filename: 'i18n.js' });
  /* The REAL boot reads: loadProgress and loadClassConfig from app/save.js (with the two refusal flags), their
     helpers stubbed; then the decision start.js makes (pinned by text below). */
  const STUBS = `var swap45Done=false, progress={}, lastModuleNum=1, lastSetId=null, responses={}, completed={}, classActivities={}, caStepDone={}, exitChecks={}, games={}, streak={}, practiceLog=[], songReady={}, songReadyAt={}, studentPeriod='', accountPaused=false, periodOverride='', moduleOpenThrough=0, micSampling={}, micTakesCount=0, gamesAccessOn=true, hiddenActivityIds={}, activityDates={}, activityTitles={}, activityNumbers={}, activityClears={}, retiredActivityIds={}, optionalActivityIds={}, activityForMe={}, playAlongActivityIds={}, songLibraryIds={}, classSongIds={}, activityPins=[], activityBoard={}, activityBoardOn=false;
function swap45OnLoad(d){ return d; } function caCleanTicks(){ return {}; } function loadLocalPracticeLog(){ return []; } function savePracticeLogLocal(){} function restoreLocalPlace(){}
function restoreClassConfigFromCache(){} function applyActivityGate(){} function refreshSongsPlayAlong(){} function repaintModuleGate(){} function appIsOnScreen(){ return false; } function applyGamesAccess(){}
function caReduceForMe(){ return {}; } function caCleanPins(){ return []; }\n`;
  const code = ESC + '\nasync function ensureDb(){}\nfunction isDevBypassUser(){ return false; }\nfunction signOut(){ __signedOut(); }\n' + STUBS
    + slice(SAVE, 'let progressLoadFailed = false;', '/* ── Module 4/5 swap') + '\n'
    + slice(SAVE, 'function resetLoadedProgress(){', '/* ── Games access') + '\n'
    + slice(SAVE, 'async function loadClassConfig(){', '/* moduleOpenThrough changed under') + '\n'
    + slice(BOOT, '/* ── An account the database does not let in', 'function showApp(user){').replace('const ACCESS_ASK_TIMEOUT_MS = 10000;', 'const ACCESS_ASK_TIMEOUT_MS = 60;')
    + '\nvar auth = { get currentUser(){ return currentUser; } };\n' + slice(BOOT, 'window.PM_HOST = {', '/* config/class.moduleOpenThrough[uid]')
    + '\nasync function __boot(){ await loadProgress(); await loadClassConfig(); if(accessRefusedAtBoot(currentUser)){ showAccessScreen(currentUser); return "refused"; } return "in"; }'
    + '\n;globalThis.__acc = { __boot, accessCheck, showAccessScreen, accessRecheck, get state(){ return accessState; }, get locked(){ return accessLocked; }, setChecked(v){ accessCheckedAt = v; }, get loadFailed(){ return progressLoadFailed; }, pmUser(){ return window.PM_HOST.user(); } };';
  ctx.__signedOut = () => { signedOut++; };
  vm.runInContext(code, ctx, { filename: 'app/boot.js (access block)' });
  const user = scenario.user;
  ctx.currentUser = Object.assign({ getIdTokenResult: async () => ({ claims: scenario.claims || { name: user.displayName, email: user.email } }) }, user);
  const A = ctx.__acc;
  const verdict = await A.__boot();
  const bootReads = reads.slice();
  if (verdict === 'refused') await settle();
  const html = () => (dom.els['access-screen'] || {}).innerHTML || '';
  return { dom, A, verdict, bootReads, writes, reads, html, reloaded: () => reloaded, signedOut: () => signedOut, settle, ctx };
}

const outsider = { uid: 'outsideO', email: 'test0@gmail.example', emailVerified: true, displayName: 'Test 0' };
for (const lang of ['en', 'es']) {
  console.log(`== the access screen (${lang})`);
  const T = key => { const m = I18N.match(new RegExp(`'${key.replace('.', '\\.')}':\\s*\\{\\s*en:\\s*'((?:[^'\\\\]|\\\\.)*)',\\s*es:\\s*'((?:[^'\\\\]|\\\\.)*)'`)); return m ? (lang === 'en' ? m[1] : m[2]).replace(/\\'/g, "'") : '??' + key; };
  const has = (h, key) => h.includes(T(key).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'));
  const allowed = { config: () => 'ok', request: () => null };
  const BOOT_READS = 'progress/%,config/class';
  /* The boot's reads before the screen's own read of the account's request (accessReadMine, after the boot). */
  const two = (r, uid) => r.bootReads.filter(x => !x.startsWith('accessRequests/')).join() === BOOT_READS.replace('%', uid);
  {
    const school = { uid: 'school1', email: 'test0@seq.org', emailVerified: true, displayName: 'Test 0' };
    const r = await studentRun(lang, { user: school, progress: () => 'permission-denied', config: () => 'permission-denied', request: () => null });
    check('a SCHOOL account whose reads are refused (a real fault, or the rules being pasted that second): today\'s path, never "Ask your teacher"', r.verdict === 'in' && r.A.loadFailed && !r.dom.els['access-screen'] && two(r, 'school1'), `${r.verdict}, reads ${r.bootReads}`);
    const r2 = await studentRun(lang, { user: { uid: 'school2', email: 'TEST0@SEQ.ORG', emailVerified: true }, config: () => 'permission-denied', request: () => null });
    check('…in any letter case (the rules lower-case it too)', r2.verdict === 'in' && !r2.dom.els['access-screen']);
    const r2b = await studentRun(lang, { user: school, progress: () => 'unavailable', config: () => 'unavailable', request: () => null });
    check('a school account offline: today\'s path (read-only, "not saving")', r2b.verdict === 'in' && r2b.A.loadFailed && !r2b.dom.els['access-screen']);
    const r3 = await studentRun(lang, { user: { uid: 'unv', email: 'test0@seq.org', emailVerified: false }, config: () => 'permission-denied', request: () => null });
    check('an UNVERIFIED @seq.org address refused by the rules is treated like an outside one (access screen)', r3.verdict === 'refused');
    const r4 = await studentRun(lang, { user: { uid: 'evil', email: 'a@seq.org.evil.example', emailVerified: true }, config: () => 'permission-denied', request: () => null });
    check('a@seq.org.evil.example refused by the rules: access screen', r4.verdict === 'refused');
  }
  {
    const r = await studentRun(lang, Object.assign({ user: outsider }, allowed));
    check('an outside account the rules let in: the boot\'s own two reads (progress, then config/class), nothing extra, then the site', r.verdict === 'in' && two(r, 'outsideO') && !r.dom.els['access-screen'], r.bootReads.join());
    const off = await studentRun(lang, { user: outsider, config: () => 'unavailable', request: () => null });
    check('an outside account OFFLINE (unavailable on both reads): not the access screen; today\'s path (read-only, "not saving")', off.verdict === 'in' && off.A.loadFailed && !off.dom.els['access-screen']);
    const strict = await studentRun(lang, { user: outsider, progress: () => 'permission-denied', config: () => 'permission-denied', request: () => null });
    check('stricter rules: progress refused, then config/class refused -> access screen, after exactly the boot\'s two reads', strict.verdict === 'refused' && two(strict, 'outsideO') && strict.A.locked);
    const readsOnly = await studentRun(lang, { user: outsider, progress: () => 'ok', config: () => 'permission-denied', request: () => null });
    check('reads-only rules: progress read fine, config/class refused -> access screen', readsOnly.verdict === 'refused' && two(readsOnly, 'outsideO'));
    const mixed = await studentRun(lang, { user: outsider, progress: () => 'unavailable', config: () => 'permission-denied', request: () => null });
    check('progress lost to the network, then config/class refused -> access screen (a refusal is definite)', mixed.verdict === 'refused');
    const onlyProg = await studentRun(lang, { user: outsider, progress: () => 'permission-denied', config: () => 'unavailable', request: () => null });
    check('progress refused, then config/class lost to the network -> access screen', onlyProg.verdict === 'refused');
  }
  {
    const pinStart = /await loadProgress\(\); caAdoptLocalTicks\(\); await loadClassConfig\(\);\n\s*clearAuthStallTimer\(\);[^\n]*\n(?:\s*\/\*[\s\S]*?\*\/\n)?\s*if\(accessRefusedAtBoot\(user\)\) showAccessScreen\(user\);\n\s*else if\(accountPaused\) showPausedScreen\(user\); else showApp\(user\);/.test(START);
    check('app/start.js: the same two reads in the same order, then accessRefusedAtBoot() decides before showApp (pinned by text)', pinStart);
    check('app/start.js makes no access read of its own during the boot (no accessCheck call)', !/accessCheck\(/.test(START.replace(/\/\*[\s\S]*?\*\//g, '')));
  }
  {
    const sc = { user: outsider, config: () => 'permission-denied', request: () => (sc.asked ? 'asked' : null) };
    const r = await studentRun(lang, sc);
    const h0 = r.html();
    check('refused, never asked: the title, the body and the Ask button', r.verdict === 'refused' && has(h0, 'access.title') && has(h0, 'access.body') && h0.includes('data-access="ask"') && has(h0, 'access.ask'));
    check('…a Sign out button, no Check again, and the site stays hidden', h0.includes('data-access="out"') && !h0.includes('data-access="check"') && r.dom.els.app.style.display === 'none' && r.A.locked);
    clickAccess(r.dom, 'ask'); await r.settle();
    const w = r.writes;
    check('Ask: ONE write, to accessRequests/{own uid}, with the token\'s name and email, the server time and status "asked"', w.length === 1 && w[0].path === 'accessRequests/outsideO' && JSON.stringify(w[0].d) === JSON.stringify({ name: 'Test 0', email: 'test0@gmail.example', at: '<server time>', status: 'asked' }) && !w[0].o, JSON.stringify(w));
    const h1 = r.html();
    check('…then "Your teacher has been asked. Check back later." with Check again, and no Ask', has(h1, 'access.asked') && h1.includes('data-access="check"') && !h1.includes('data-access="ask"'));
    clickAccess(r.dom, 'check'); await r.settle();
    check('Check again while still refused: stays, says "Not yet", no reload', r.reloaded() === 0 && has(r.html(), 'access.stillWaiting') && r.A.locked);
    sc.config = () => 'ok';
    clickAccess(r.dom, 'check'); await r.settle();
    check('Check again once the teacher allowed it: the page reloads into the site', r.reloaded() === 1);
    check('nothing in this walk wrote anything but the one request (no progress)', r.writes.every(x => x.path === 'accessRequests/outsideO') && r.writes.length === 1);
    clickAccess(r.dom, 'out');
    check('Sign out calls signOut()', r.signedOut() === 1);
  }
  {
    const sc = { user: outsider, config: () => 'permission-denied', request: () => 'asked' };
    const r = await studentRun(lang, sc);
    check('refused + already asked (a reload, another day): "asked" with Check again, no Ask', has(r.html(), 'access.asked') && !r.html().includes('data-access="ask"'));
    r.A.setChecked(Date.now());
    await r.A.accessRecheck(false); await r.settle();
    const readsAfter = r.reads.filter(x => x.startsWith('config')).length;
    check('the tab coming back within 30 s of the last check: no read', readsAfter === 1, readsAfter);
    r.A.setChecked(Date.now() - 31000); sc.config = () => 'ok';
    await r.A.accessRecheck(false); await r.settle();
    check('the tab coming back after 30 s, now allowed: one read, then a reload', r.reloaded() === 1 && r.reads.filter(x => x.startsWith('config')).length === 2);
  }
  {
    const r = await studentRun(lang, { user: outsider, config: () => 'permission-denied', request: () => 'declined' });
    const h = r.html();
    check('declined: says so plainly, Sign out only (no Ask, no Check again)', has(h, 'access.declined') && h.includes('data-access="out"') && !h.includes('data-access="ask"') && !h.includes('data-access="check"'));
  }
  {
    const r = await studentRun(lang, { user: outsider, config: () => 'permission-denied', request: () => 'allowed' });
    check('a request marked allowed but the rules still refuse (the teacher removed it later): "asked", Check again', has(r.html(), 'access.asked'));
  }
  {
    const sc = { user: outsider, config: () => 'permission-denied', request: () => null, askFails: true };
    const r = await studentRun(lang, sc);
    clickAccess(r.dom, 'ask'); await r.settle();
    check('the ask did not send (offline): says so, the Ask button stays', has(r.html(), 'access.failed') && r.html().includes('data-access="ask"'));
  }
  {
    const nasty = Object.assign({}, outsider, { displayName: HOSTILE });
    const r = await studentRun(lang, { user: nasty, config: () => 'permission-denied', request: () => null, claims: { name: HOSTILE, email: outsider.email } });
    check('a hostile account name never reaches the screen (the screen shows no name at all)', !RAW_BAD.test(r.html()) && !r.html().includes('xxxxxxxxxx'));
  }
}

/* ── 1b. Offline, and a remembered refusal (review R1-1) ───────────────── */
console.log('== offline on the access screen, and an account this device remembers as refused');
{
  /* The review's three cases (scratchpad review-p4/tip/tools/access-sim-r.mjs), now held. */
  const dev = {};
  const sc = { user: outsider, config: () => 'permission-denied', request: () => 'asked', ls: dev };
  const r = await studentRun('en', sc);
  check('refused at boot: the access screen, and this device remembers the refusal (gcAccessRefused:<uid>)', r.verdict === 'refused' && dev['gcAccessRefused:outsideO'] === '1');
  sc.config = () => 'unavailable'; sc.request = () => 'error';
  r.A.setChecked(Date.now() - 31000);
  await r.A.accessRecheck(false); await r.settle();
  check('R1-1 case 1: the tab comes back with the network DOWN: no reload, the access screen stays', r.reloaded() === 0 && r.A.locked);
  const r2 = await studentRun('en', { user: outsider, config: () => 'unavailable', request: () => 'error', ls: dev, online: false });
  check('R1-1 case 2: the next boot, still offline, of the remembered account: the access screen saying it is offline (not the site from the cache)', r2.verdict === 'refused' && r2.A.state === 'offline' && r2.html().includes('data-i18n="access.offline"') && r2.html().includes('data-access="check"') && !r2.html().includes('data-access="ask"'));
  check('…and that offline boot read no request (none can be read offline)', !r2.reads.some(x => x.startsWith('accessRequests/')));
  const r2b = await studentRun('en', { user: outsider, config: () => 'resource-exhausted', progress: () => 'resource-exhausted', request: () => 'error', ls: dev, online: true });
  check('the same boot with the device ONLINE but the reads failing (a quota error): "Could not check right now", not "You are offline" (review R2)', r2b.verdict === 'refused' && r2b.html().includes('data-i18n="access.cantCheck"') && !r2b.html().includes('data-i18n="access.offline"'));
  const sc3 = { user: outsider, config: () => 'permission-denied', request: () => 'asked', ls: {} };
  const r3 = await studentRun('en', sc3); sc3.config = () => 'unavailable';
  clickAccess(r3.dom, 'check'); await r3.settle();
  check('R1-1 case 3: Check again clicked with the network down: no reload, says "That did not send. Check your connection…"', r3.reloaded() === 0 && r3.html().includes('data-i18n="access.failed"'));
  const other = await studentRun('en', { user: { uid: 'outsideP', email: 'test1@gmail.example', emailVerified: true, displayName: 'Test 1' }, config: () => 'unavailable', request: () => 'error', ls: dev });
  check('another account on the same device, offline, never refused here: today\'s path (the flag is per account)', other.verdict === 'in' && !other.dom.els['access-screen']);
  const sc4 = { user: outsider, config: () => 'unavailable', request: () => 'error', ls: dev };
  const r4 = await studentRun('en', sc4);
  sc4.config = () => 'ok';
  clickAccess(r4.dom, 'check'); await r4.settle();
  check('from the offline screen, Check again once online and allowed: the device forgets the refusal, then reloads into the site', r4.reloaded() === 1 && !('gcAccessRefused:outsideO' in dev));
  dev['gcAccessRefused:outsideO'] = '1';
  const r5 = await studentRun('en', { user: outsider, progress: () => 'ok', config: () => 'ok', request: () => null, ls: dev });
  check('a boot whose reads succeed (allowed since): the site, and the device forgets the refusal', r5.verdict === 'in' && !('gcAccessRefused:outsideO' in dev));
  const school = await studentRun('en', { user: { uid: 'school9', email: 'test9@seq.org', emailVerified: true }, progress: () => 'unavailable', config: () => 'unavailable', request: () => null, ls: { 'gcAccessRefused:school9': '1' } });
  check('a school account is never put on the access screen, even with a stale flag and offline', school.verdict === 'in' && !school.dom.els['access-screen']);
  check('practice minutes: no user while the access screen is up (nothing counts, loads or retries; PM_HOST.user() is null)', r.A.pmUser() === null);
  check('…and the signed-in user when it is not up', r5.A.pmUser() && r5.A.pmUser().uid === 'outsideO');
  for (const lang of ['en', 'es']) {
    const m = I18N.match(/'access\.offline':\s*\{\s*en:\s*'([^']*)',\s*es:\s*'([^']*)'/);
    check(`the offline line exists in ${lang === 'en' ? 'English' : 'Spanish'}`, !!(m && m[lang === 'en' ? 1 : 2]));
  }
}

/* ── 1c. Asking with no network, and a request the rules refuse (review round 2) ── */
console.log('== Ask with the network down (a set() that never settles), and a request the rules will not take');
{
  const sc = { user: outsider, config: () => 'permission-denied', request: () => null, askHang: true, ls: {} };
  const r = await studentRun('en', sc);
  clickAccess(r.dom, 'ask'); await tick();
  const busy = r.html();
  check('R2-2: while the Ask is out, Sign out is NOT disabled (Ask is)', /data-access="out"(?![^>]*disabled)/.test(busy) && /data-access="ask"[^>]*disabled/.test(busy), busy.slice(0, 300));
  clickAccess(r.dom, 'out');
  check('R2-2: …and a click on Sign out while busy signs out', r.signedOut() === 1);
  await new Promise(res => setTimeout(res, 150)); await r.settle();
  check('R2-2: after the wait (10 s; 60 ms here) the card says it did not send and Ask works again', r.html().includes('data-i18n="access.failed"') && /data-access="ask"(?![^>]*disabled)/.test(r.html()));
  sc.land(); await r.settle();
  check('R2-2: the request lands later after all: the card then says "asked"', r.A.state === 'asked' && r.html().includes('data-i18n="access.asked"'));
  const sc2 = { user: outsider, config: () => 'permission-denied', request: () => null, askFails: 'permission-denied', ls: {} };
  const r2 = await studentRun('en', sc2);
  clickAccess(r2.dom, 'ask'); await r2.settle();
  check('R2: the rules refuse the request (an unverified address, a name too long) and there is none to read back: its own plain line, no "check your connection", no Ask', r2.html().includes('data-i18n="access.cantAsk"') && !r2.html().includes('data-i18n="access.failed"') && !r2.html().includes('data-access="ask"'));
  for (const lang of ['en', 'es']) for (const key of ['access.cantCheck', 'access.cantAsk']) {
    const m = I18N.match(new RegExp(`'${key.replace('.', '\\.')}':\\s*\\{\\s*en:\\s*'([^']*)',\\s*es:\\s*'([^']*)'`));
    check(`${key} exists in ${lang === 'en' ? 'English' : 'Spanish'}`, !!(m && m[lang === 'en' ? 1 : 2]));
  }
}

/* ── 2. the console block ───────────────────────────────────────────────── */
console.log('== the console block (teacher-accounts.js)');
{
  const dom = fakeDom();
  const sets = [], updates = [], deletes = [];
  const store = { access: { allow: { allowedA: true, strayZ: true, notTrue: 'yes' } }, reqs: [] };
  let denied = false, whereDelay = null;
  const err = code => Object.assign(new Error(code), { code });
  const reqDoc = (uid, name, email, status, ms) => ({ id: uid, data: () => ({ name, email, status, at: { toMillis: () => ms } }) });
  store.reqs = [reqDoc('askerH', HOSTILE, HOSTILE + '@x.example', 'asked', 3000), reqDoc('askerB', 'Test 2', 'test2@gmail.example', 'asked', 2000), reqDoc('askerD', 'Test 3', 'test3@gmail.example', 'declined', 1000)];
  const fv = { delete: () => '<delete>' };
  const db = { collection: c => ({
    doc: id => ({
      get: async () => { if (denied) throw err('permission-denied'); return { exists: true, data: () => store.access }; },
      set: async (d, o) => { sets.push({ path: c + '/' + id, d, o }); },
      update: async d => { updates.push({ path: c + '/' + id, d }); },
      delete: async () => { deletes.push(c + '/' + id); },
    }),
    orderBy: () => ({ limit: () => ({ get: async () => { if (denied) throw err('permission-denied'); return { forEach: f => store.reqs.forEach(f) }; } }) }),
    where: (f, op, v) => ({ limit: () => ({ get: async () => { if (denied) throw err('permission-denied'); await (whereDelay ? whereDelay() : null); const docs = store.reqs.filter(r => r.data()[f] === v); return { size: docs.length, forEach: fn => docs.forEach(fn) }; } }) }),
  }) };
  const ctx = { console: { warn() {}, log() {} }, Date, JSON, Promise, Object, String, setTimeout, confirm: () => true, document: dom.document,
    firebase: { firestore: { FieldValue: fv } }, db, teacherView: 'manage', setTeacherView() {} };
  vm.createContext(ctx);
  const periodFn = (TEACHER.match(/function teacherStudentPeriod\(stu, cfg\)\{[\s\S]*?\n\}/) || [])[0];
  vm.runInContext(ESC + '\nasync function ensureDb(){}\nvar teacherClassConfig = { periodOverrides: { rosterC2: "CAS" } };\n'
    + 'var allStudentsRaw = ' + JSON.stringify([
      { uid: 'school1', name: 'Test 0', email: 'test0@seq.org', period: '4' },
      { uid: 'school2', name: 'Test 1', email: 'TEST1@SEQ.ORG', period: '7' },
      { uid: 'allowedA', name: 'Test 4', email: 'test4@gmail.example', period: 'CAS' },
      { uid: 'rosterC1', name: HOSTILE, email: HOSTILE, period: 'CAS' },
      { uid: 'rosterC2', name: 'Test 5', email: 'test5@gmail.example', period: '7' },
      { uid: 'roster7', name: 'Test 6', email: '', period: '7' },
      { uid: 'evilDomain', name: 'Test 7', email: 'a@seq.org.evil.example', period: 'CAS' },
    ]) + ';\n' + periodFn + '\n' + ACCOUNTS
    + '\n;globalThis.__T = { teacherAccessLoad, teacherAccessPaint, teacherAccessModel, teacherAccessSet, teacherAccessDecide, teacherAccessAllowCas, teacherAccessDeleteRequest, teacherRefreshAccessBadge, get allow(){ return teacherAccessAllow; }, get reqs(){ return teacherAccessReqs; } };', ctx, { filename: 'teacher-accounts.js' });
  const T = ctx.__T;
  await T.teacherAccessLoad(); T.teacherAccessPaint();
  const html = () => dom.els['t-access-block'].innerHTML;
  const h = html();
  check('counts: 7 roster accounts, 2 @seq.org (any case), 5 not; 1 allowed, 4 locked out', h.includes('7 roster accounts: 2 @seq.org, 5 not. Of those 5: 1 allowed, 4 would be locked out'), h.slice(0, 300));
  check('a look-alike domain (a@seq.org.evil.example) counts as not @seq.org', /evilDomain/.test(h));
  check('an allow entry whose value is not true is not counted as allowed', !T.allow.notTrue && T.allow.allowedA === true);
  check('waiting requests: 2 (the declined one is under Answered requests)', h.includes('Asking to join (2)') && h.includes('Answered requests (1)'));
  check('the allowed account with no roster row and no request is listed to remove (strayZ)', h.includes('Allowed, not in the roster (1)') && h.includes('strayZ'));
  check('a hostile name and email (markup, 5,000 characters, a right-to-left override, control characters) never reach the HTML raw', !RAW_BAD.test(h) && h.includes('&lt;img src=x onerror=alert(1)&gt;'));
  check('…and are cut: no run of 400 x\'s anywhere (shown at 80, the hover title at 300 / 320)', !/x{400}/.test(h));
  check('the period shown is the teacher\'s correction when there is one (rosterC2: CAS)', /rosterC2[\s\S]{0,200}/.test(h) && T.teacherAccessModel(ctx.allStudentsRaw, ctx.teacherClassConfig, T.allow, []).rows.find(r => r.uid === 'rosterC2').period === 'CAS');
  check('"Allow all 3 in CAS" offered (rosterC1, rosterC2 by correction, evilDomain; allowedA already is)', h.includes('Allow all 3 in CAS'));
  T.teacherAccessAllowCas(); await settle();
  const casSet = sets[sets.length - 1];
  check('Allow all in CAS: ONE merge write of exactly those 3 keys under allow', sets.length === 1 && casSet.path === 'config/access' && casSet.o && casSet.o.merge === true && JSON.stringify(Object.keys(casSet.d)) === '["allow"]' && JSON.stringify(Object.keys(casSet.d.allow).sort()) === '["evilDomain","rosterC1","rosterC2"]', JSON.stringify(casSet));
  await T.teacherAccessSet(['rosterC2'], false); await settle();
  const off = sets[sets.length - 1];
  check('Locked out: a merge write deleting that one key (FieldValue.delete)', off.o && off.o.merge === true && JSON.stringify(off.d) === '{"allow":{"rosterC2":"<delete>"}}');
  await T.teacherAccessDecide('askerB', 'allowed'); await settle();
  check('Allow on a request: the key merged into allow, then the request\'s status "allowed"', JSON.stringify(sets[sets.length - 1].d) === '{"allow":{"askerB":true}}' && JSON.stringify(updates[updates.length - 1]) === JSON.stringify({ path: 'accessRequests/askerB', d: { status: 'allowed' } }));
  await T.teacherAccessDecide('askerB', 'declined'); await settle();
  check('Decline on an allowed one: the key removed, the status "declined"', JSON.stringify(sets[sets.length - 1].d) === '{"allow":{"askerB":"<delete>"}}' && JSON.stringify(updates[updates.length - 1].d) === '{"status":"declined"}');
  await T.teacherAccessDecide('askerH', 'declined'); await settle();
  check('Decline on a waiting one that was never allowed: only the status (no allow write)', updates[updates.length - 1].path === 'accessRequests/askerH' && sets.length === 4);
  check('every write to config/access in this walk was a merge (never a whole-document set)', sets.every(s => s.path === 'config/access' && s.o && s.o.merge === true), JSON.stringify(sets.map(s => s.o)));
  T.teacherAccessPaint();
  check('every waiting and answered request row has a Delete button (data-access-del)', (html().match(/data-access-del /g) || []).length === T.reqs.length, `${(html().match(/data-access-del /g) || []).length} buttons, ${T.reqs.length} requests`);
  await T.teacherAccessDecide('askerB', 'allowed'); await settle();
  const setsBefore = sets.length, allowBefore = JSON.stringify(T.allow);
  ctx.confirm = () => false;
  await T.teacherAccessDeleteRequest('askerD'); await settle();
  check('Delete, then Cancel in the confirm: nothing deleted', deletes.length === 0);
  ctx.confirm = () => true;
  await T.teacherAccessDeleteRequest('askerD'); await settle();
  check('Delete a request: ONE delete of accessRequests/{uid}; the allow list is not written or changed', JSON.stringify(deletes) === '["accessRequests/askerD"]' && sets.length === setsBefore && JSON.stringify(T.allow) === allowBefore && !T.reqs.some(r => r.uid === 'askerD'), JSON.stringify(deletes));
  await T.teacherAccessDeleteRequest('askerB'); await settle();
  check('Delete a request whose account IS allowed (askerB): the request goes, the account stays allowed', deletes[1] === 'accessRequests/askerB' && sets.length === setsBefore && T.allow.askerB === true);
  await T.teacherRefreshAccessBadge(); await settle();
  const side = dom.els['t-access-alert'];
  check('the dashboard line from the badge query\'s count (the fake answers 2): "2 accounts are asking to join." with Open Manage', !!side && side.innerHTML.includes('2 accounts are asking to join.') && side.innerHTML.includes('data-access-open'), side && side.innerHTML);
  denied = true;
  // a fresh load after the rules refuse (not pasted): the block says so, it does not say "nobody"
  ctx.__T.teacherAccessLoad && await (async () => { vm.runInContext('teacherAccessAt = 0;', ctx); await T.teacherAccessLoad(); T.teacherAccessPaint(); })();
  check('reads refused (rules not pasted): the block says the rules are not pasted, and lists nobody', html().includes('not pasted into the Firebase console') && !html().includes('Asking to join'));
}

/* ── 3. The console block: review round 1 (R1-2 … R1-8b) ─────────────── */
console.log('== the console block: review round 1');
async function consoleCtx(opts){
  const dom = fakeDom();
  const log = { sets: [], updates: [], deletes: [], accessGets: 0, roster: 0, confirms: [] };
  const store = { access: opts.access, reqs: opts.reqs || [], gate: null };
  const err = code => Object.assign(new Error(code), { code });
  const reqDoc = r => ({ id: r.uid, data: () => ({ name: r.name, email: r.email, status: r.status, at: { toMillis: () => r.at } }) });
  const db = { collection: c => ({
    doc: id => ({
      get: async () => {
        if (c === 'accessRequests') { const r = store.reqs.find(x => x.uid === id); log.reqGets = (log.reqGets || 0) + 1; return r ? Object.assign(reqDoc(r), { exists: true }) : { exists: false, id, data: () => undefined }; }
        log.accessGets++;
        const snap = store.access === undefined ? null : JSON.parse(JSON.stringify(store.access));   // the server's answer is taken NOW
        if (store.gate) { const g = store.gate; store.gate = null; await g; }                       // …and delivered later
        return snap ? { exists: true, data: () => snap } : { exists: false, data: () => undefined };
      },
      set: async (d, o) => {
        if (opts.failSet) throw err(opts.failSet);
        log.sets.push({ path: c + '/' + id, d: JSON.parse(JSON.stringify(d)), o });
        const cur = store.access ? store.access.allow : {};
        const next = Object.assign({}, cur);
        Object.keys(d.allow || {}).forEach(k => { if (d.allow[k] === '<delete>') delete next[k]; else next[k] = d.allow[k]; });
        store.access = { allow: next };
      },
      update: async d => { if (opts.failUpdate) throw err(opts.failUpdate); log.updates.push({ path: c + '/' + id, d }); const r = store.reqs.find(x => x.uid === id); if (r) Object.assign(r, d); },
      delete: async () => { log.deletes.push(c + '/' + id); },
    }),
    orderBy: () => ({ limit: n => ({ get: async () => { const docs = [...store.reqs].sort((a, b) => b.at - a.at).slice(0, n).map(reqDoc); return { forEach: f => docs.forEach(f) }; } }) }),
    where: (f, op, v) => ({ limit: n => ({ get: async () => { const docs = store.reqs.filter(r => r[f] === v).slice(0, n).map(reqDoc); return { size: docs.length, forEach: fn => docs.forEach(fn) }; } }) }),
  }) };
  const ctx = { console: { warn() {}, log() {} }, Date, JSON, Promise, Object, String, Map, setTimeout, document: dom.document,
    confirm: m => { log.confirms.push(m); return true; },
    firebase: { firestore: { FieldValue: { delete: () => '<delete>' } } }, db, teacherView: 'manage', setTeacherView() {} };
  vm.createContext(ctx);
  const periodFn = (TEACHER.match(/function teacherStudentPeriod\(stu, cfg\)\{[\s\S]*?\n\}/) || [])[0];
  vm.runInContext(ESC + '\nasync function ensureDb(){}\nvar teacherClassConfig = {};\nvar teacherStudentsAt = ' + Date.UTC(2026, 10, 13, 15, 5) + ';\n'
    + 'var allStudentsRaw = ' + JSON.stringify(opts.roster || []) + ';\nasync function teacherRefreshStudents(){ __roster(); }\n' + periodFn + '\n' + ACCOUNTS
    + '\n;globalThis.__T = { teacherAccessLoad, teacherAccessPaint, teacherAccessSet, teacherAccessDecide, teacherAccessDeleteRequest, teacherAccessRefreshAll, get allow(){ return teacherAccessAllow; }, get reqs(){ return teacherAccessReqs; }, get note(){ return teacherAccessNote; } };', ctx, { filename: 'teacher-accounts.js' });
  ctx.__roster = () => { log.roster++; };
  return { T: ctx.__T, ctx, dom, log, store, html: () => dom.els['t-access-block'].innerHTML };
}
{
  /* R1-2: a read that was out while a write ran must not put the older list back. */
  const c = await consoleCtx({ access: { allow: { a1: true } }, roster: [{ uid: 'b1', name: 'Test B', email: 'b@gmail.example', period: 'CAS' }] });
  await c.T.teacherAccessLoad();
  let release; c.store.gate = new Promise(r => { release = r; });
  const slow = c.T.teacherAccessLoad();                     // the server answers { a1 } now, delivered later
  await settle();
  await c.T.teacherAccessSet(['b1'], true);                 // the teacher allows b1 meanwhile
  release(); await slow; await settle(); await settle();
  check('R1-2: a read that started before a write and lands after it does not undo it (b1 stays allowed on screen)', c.T.allow.b1 === true && c.T.allow.a1 === true, JSON.stringify(c.T.allow));
  check('…and the lists are read again once the write is done (3 reads of config/access: first, the stale one, the re-read)', c.log.accessGets === 3, c.log.accessGets);
}
{
  /* R1-3: Locked out of an account that is not on the list (and no document yet): no write, no false "not pasted". */
  const c = await consoleCtx({ access: undefined, roster: [{ uid: 'x1', name: 'Test X', email: 'x@gmail.example', period: '7' }] });
  await c.T.teacherAccessLoad(); c.T.teacherAccessPaint();
  await c.T.teacherAccessSet(['x1'], false);
  check('R1-3: "Locked out" on an account that is not on the list: nothing is written, no message', c.log.sets.length === 0 && c.T.note === '');
  const c2 = await consoleCtx({ access: { allow: {} }, failSet: 'permission-denied', roster: [{ uid: 'x2', name: 'Test Y', email: 'y@gmail.example', period: '7' }] });
  await c2.T.teacherAccessLoad();
  await c2.T.teacherAccessSet(['x2'], true);
  check('R1-3: a refused WRITE after good reads says the database refused it, not "the rules are not pasted"', /database refused/.test(c2.T.note) && !/not pasted/.test(c2.T.note), c2.T.note);
}
{
  /* R1-7: switching an allowed asker off marks its request declined; a failed second write says what the student sees. */
  const reqs = [{ uid: 'r1', name: 'Test R', email: 'r@gmail.example', status: 'allowed', at: 5 }];
  const roster = [{ uid: 'r1', name: 'Test R', email: 'r@gmail.example', period: 'CAS' }];
  const c = await consoleCtx({ access: { allow: { r1: true } }, reqs, roster });
  await c.T.teacherAccessLoad();
  await c.T.teacherAccessSet(['r1'], false);
  check('R1-7: Locked out on an allowed asker: the key deleted AND its request marked declined (two writes)', JSON.stringify(c.log.sets.map(x => x.d)) === '[{"allow":{"r1":"<delete>"}}]' && JSON.stringify(c.log.updates) === '[{"path":"accessRequests/r1","d":{"status":"declined"}}]');
  const c2 = await consoleCtx({ access: { allow: { r1: true } }, reqs: [{ uid: 'r1', name: 'Test R', email: 'r@gmail.example', status: 'allowed', at: 5 }], roster, failUpdate: 'unavailable' });
  await c2.T.teacherAccessLoad();
  await c2.T.teacherAccessSet(['r1'], false);
  check('R1-7: the second write failing: locked out, and the note says the student\'s screen still says it is waiting', !c2.T.allow.r1 && /could not be marked declined/.test(c2.T.note) && /still says it is waiting/.test(c2.T.note), c2.T.note);
}
{
  /* R1-6: 250 newer answered requests cannot hide an older waiting one. */
  const reqs = [];
  for (let i = 0; i < 250; i++) reqs.push({ uid: 'd' + i, name: 'Test D' + i, email: 'd' + i + '@gmail.example', status: 'declined', at: 10000 + i });
  reqs.push({ uid: 'old1', name: 'Test Old', email: 'old@gmail.example', status: 'asked', at: 1 });
  const c = await consoleCtx({ access: { allow: {} }, reqs });
  await c.T.teacherAccessLoad(); c.T.teacherAccessPaint();
  check('R1-6: an old waiting request behind 250 newer answered ones is still listed as waiting', c.html().includes('Asking to join (1)') && c.html().includes('old1'));
}
{
  /* R1-5 (console): a request from an @seq.org address is marked in plain words. R1-4: Delete's confirm says what Decline is for. */
  const reqs = [{ uid: 's1', name: 'Test S', email: 'test@seq.org', status: 'asked', at: 3 }, { uid: 'g1', name: 'Test G', email: 'g@gmail.example', status: 'asked', at: 2 }];
  const c = await consoleCtx({ access: { allow: {} }, reqs });
  await c.T.teacherAccessLoad(); c.T.teacherAccessPaint();
  const rows = c.html().split('<tr>');
  check('R1-5: the @seq.org request says "a school account should never need to ask"; the other does not', rows.some(r => r.includes('s1') && /a school account should never need to ask/.test(r)) && !rows.some(r => r.includes('g1') && /never need to ask/.test(r)));
  await c.T.teacherAccessDeleteRequest('g1');
  check('R1-4: Delete\'s confirm: "It may ask again." and "To stop this account asking again, press Decline and leave the request."', /It may ask again\./.test(c.log.confirms[0]) && /To stop this account asking again, press Decline and leave the request\./.test(c.log.confirms[0]));
  check('R1-4: the header comment no longer offers Delete for spam; it says Decline silences, Delete lets it ask again', !/spam/.test(ACCOUNTS) && /Decline SILENCES an account/.test(ACCOUNTS) && /LETS IT ASK AGAIN/.test(ACCOUNTS));
}
{
  /* R1-8b: the count line says how old the roster is, and the block's Refresh reads the roster too. */
  const c = await consoleCtx({ access: { allow: {} }, roster: [{ uid: 'z1', name: 'Test Z', email: 'z@gmail.example', period: '4' }] });
  await c.T.teacherAccessLoad(); c.T.teacherAccessPaint();
  check('R1-8b: the count line says "Roster as of …"', /Roster as of /.test(c.html()));
  await c.T.teacherAccessRefreshAll(); await settle();
  check('R1-8b: the block\'s Refresh reads the roster again (teacherRefreshStudents) as well as the lists', c.log.roster === 1 && c.log.accessGets === 2);
}

{
  /* R2-3: the waiting list is exactly the badge's set; Allow on a roster row also clears that account's request, read first if this tab had not seen it. */
  const roster = [{ uid: 'q1', name: 'Test Q', email: 'q@gmail.example', period: 'CAS' }];
  const c = await consoleCtx({ access: { allow: { q1: true } }, reqs: [{ uid: 'q1', name: 'Test Q', email: 'q@gmail.example', status: 'asked', at: 9 }], roster });
  await c.T.teacherAccessLoad(); c.T.teacherAccessPaint();
  check('R2-3: an ALLOWED account whose request still says asked is listed under Asking to join (the badge counts it, so it has a row)', c.html().includes('Asking to join (1)') && /q1/.test(c.html().split('Asking to join')[1].split('<h4>')[0]));
  const c2 = await consoleCtx({ access: { allow: {} }, reqs: [], roster });
  await c2.T.teacherAccessLoad();
  c2.store.reqs.push({ uid: 'q1', name: 'Test Q', email: 'q@gmail.example', status: 'asked', at: 9 });   // it asks while the block is open
  await c2.T.teacherAccessSet(['q1'], true);
  check('R2-3: Allowed from the roster row for an account that asked after the block was read: its request is read and marked allowed in the same action', c2.log.reqGets === 1 && JSON.stringify(c2.log.updates) === '[{"path":"accessRequests/q1","d":{"status":"allowed"}}]' && c2.T.allow.q1 === true, JSON.stringify(c2.log.updates));
}

console.log(`\n${fail ? '✗' : '✓'} access-sim: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
