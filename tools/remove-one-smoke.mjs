#!/usr/bin/env node
/* remove-one-smoke.mjs — "Start this student over…" and "Delete this student's data…" in the real teacher console,
   in headless Chrome, against a STUB Firestore (2026-11-14; teacher-remove.js).

     node tools/remove-one-smoke.mjs                 run the walk, print each check
     node tools/remove-one-smoke.mjs --shots <dir>   also save the screenshots there
     node tools/remove-one-smoke.mjs --chrome <path> Chrome binary (or CHROME=…)

   Three made-up students ("Test 0" has data of every kind, "Test 1" and "Test 2" too) in a page-side stub of
   Firestore (doc get / set {merge} / update / delete, collection get, where(field,'==',v), where(documentId,
   '>='/'<='), batch, runTransaction), the way tools/console-layout-smoke.mjs stubs it. Never signs in, never reads
   live data. It walks, at 1366×657:
     - Manage: every row has its "⋯" (More) button, last; it opens the chooser (Start over · Delete)
     - Delete for Test 0: the list and its counts; the Delete button stays disabled with nothing typed, a wrong name
       and part of the name, and turns on for the name; recordings unticked; Delete → "Done: 6 of 6"; the stub's
       store: Test 0's recordings byte-identical, everything else of Test 0's gone, Test 1's and Test 2's documents
       and every other config/class cell byte-identical
     - a fresh stub, a failure planted at the third kind (song requests): "done 2 of 7, failed at Song requests";
       "Read again and finish" + the name + Delete → done; nothing of Test 0's left; the others byte-identical
     - Start over for Test 2: one write (the marker in config/class), nothing else changed; Manage's row then says
       "Started over <date> · not applied yet …"; the dialogs' warning above the typed name
     - the student's view of the one-line notice after a start over, English and Spanish (the app shown through the
       local dev bypass; the apply itself is proven by tools/save-loop.mjs --reset)
   Only one headless-Chrome run at a time on this Mac. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const SHOTS = opt('--shots');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
function findChrome(){
  const given = opt('--chrome') || process.env.CHROME;
  if (given) return given;
  const c = platform() === 'darwin' ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium'] : ['/usr/bin/google-chrome', '/usr/bin/chromium'];
  return c.find(p => existsSync(p));
}
const freePort = () => new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
const sleep = ms => new Promise(r => setTimeout(r, ms));
function serve(dir){
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (p.endsWith('/')) p += 'index.html';
    if (p === '/sw.js'){ res.writeHead(404); res.end(); return; }
    const f = normalize(join(dir, p));
    if (!f.startsWith(dir) || !existsSync(f) || !statSync(f).isFile()){ res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(f));
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}
async function openPage(port){
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const handlers = [];
  ws.onmessage = e => { const m = JSON.parse(e.data); if (m.id && pending.has(m.id)){ const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); } else if (m.method) handlers.forEach(h => h(m.method, m.params)); };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }); if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || JSON.stringify(r.exceptionDetails)); return r.result.value; };
  return { send, evalJs, on: h => handlers.push(h), close: async () => { try { ws.close(); } catch {} } };
}
const NOISE = /firebase|firestore|googleapis|gstatic|google\.com|youtube|ytimg|net::ERR|Failed to fetch|ERR_|auth\/|identitytoolkit|favicon|Content Security|websocket|WebChannel|offline|Could not reach|NotAllowedError|play\(\) request|AbortError|NotSupportedError|sw\.js|ServiceWorker|delete stopped at/i;

/* The page-side stub. FAIL = a path prefix whose delete throws (the planted failure). Every name is fake. */
const STUB = String.raw`(() => {
  const DEL = { __del: true };
  const store = new Map(); window.__store = store; window.__fail = null; window.__writes = [];
  const U = ['test-uid-0', 'test-uid-1', 'test-uid-2'];
  U.forEach((u, i) => {
    store.set('progress/' + u, { name: 'Test ' + i, email: 'test' + i + '@example.test', period: i === 1 ? '7' : '4', migrations: { swap45: true },
      completed: { 'm1w1-b-sec0-0': true, 'm1w1-b-sec0-1': true, 'm1w1-b-sec1-0': true }, responses: { 'm1w1-b-sec0-2': 'Answer ' + i, 'm1w1-b-sec0-3': 'E' },
      skills: { 'm1w1-s1': 'gotit', 'mr1': '2' }, classActivities: { 'ca-1': true }, exitChecks: { 'ca-14': { score: 3, total: 4, at: '2026-11-10', picks: [] } },
      songReady: { 'the-cure': { 1: true } }, practiceLog: { 'm1w1-s1': { reps: 4 } }, games: {}, caSteps: {} });
    store.set('minutes/' + u + '/days/2026-11-12', { seconds: 300 + i }); store.set('minutes/' + u + '/days/2026-11-13', { seconds: 120 });
    store.set('minutes/' + u + '/weeks/2026-W45', { seconds: 900, goalSeconds: 3600, hit: false }); store.set('minutes/' + u + '/weeks/2026-W46', { seconds: 420, goalSeconds: 3600, hit: false });
    store.set('minutes/' + u + '/meta/board', { id: String(i).repeat(32) });
    store.set('micTakes/' + u + '-coach', { uid: u, mode: 'coach', chunks: 2 }); store.set('micTakes/' + u + '-coach/chunks/0', { i: 0 }); store.set('micTakes/' + u + '-coach/chunks/1', { i: 1 });
    store.set('micTakes/' + u + '-nr', { uid: u, mode: 'nr', chunks: 1 }); store.set('micTakes/' + u + '-nr/chunks/0', { i: 0 });
    store.set('songRequests/' + u + '_2026-W45', { uid: u, title: 'Song A', state: 'asked' }); store.set('songRequests/' + u + '_2026-W46', { uid: u, title: 'Song B', state: 'adding' });
    store.set('issueReports/rep-' + i, { uid: u, message: 'Broken ' + i });
    store.set('accessRequests/' + u, { name: 'Test ' + i, email: 'test' + i + '@example.test', status: 'allowed' });
    store.set('liveQuiz/current/answers/' + u, { uid: u, choice: 'A' });
  });
  store.set('liveQuiz/current', { state: 'off', scores: {} });
  store.set('config/access', { allow: { [U[0]]: true, [U[1]]: true } });
  store.set('config/class', { configVersion: 7, gamesEnabled: true, gameOverrides: { [U[0]]: false, [U[1]]: true },
    paused: { [U[0]]: true, [U[2]]: true }, periodOverrides: { [U[0]]: 'CAS', [U[1]]: '4' }, moduleOpenThrough: { [U[0]]: 5 },
    activityClears: { [U[0]]: { 'ca-1': true, 'ca-2': true }, [U[1]]: { 'ca-1': true } }, activityStudents: { 'ca-5': { [U[0]]: true, [U[1]]: true } } });
  const clone = v => v === undefined ? v : JSON.parse(JSON.stringify(v));
  const merge = (dst, src) => { Object.keys(src).forEach(k => { const v = src[k];
    if (v && v.__del) delete dst[k];
    else if (v && typeof v === 'object' && !Array.isArray(v)) { if (!dst[k] || typeof dst[k] !== 'object' || Array.isArray(dst[k])) dst[k] = {}; merge(dst[k], v); }
    else dst[k] = clone(v); }); return dst; };
  const failIf = p => { if (window.__fail && p.startsWith(window.__fail)) { const e = new Error('planted failure'); e.code = 'unavailable'; throw e; } };
  const snapOf = p => ({ exists: store.has(p), data: () => clone(store.get(p)), id: p.split('/').pop(), ref: docRef(p) });
  function docRef(p){ return { path: p, id: p.split('/').pop(), get: async () => snapOf(p),
    set: async (d, o) => { window.__writes.push('set ' + p); store.set(p, o && o.merge ? merge(clone(store.get(p) || {}), d) : merge({}, d)); },
    update: async d => { window.__writes.push('update ' + p); store.set(p, merge(clone(store.get(p) || {}), d)); },
    delete: async () => { failIf(p); window.__writes.push('delete ' + p); store.delete(p); }, collection: n => colRef(p + '/' + n) }; }
  function colRef(p, filters){ filters = filters || [];
    const q = { doc: id => docRef(p + '/' + id), orderBy: () => q, limit: () => q, where: (f, op, v) => colRef(p, filters.concat([[f, op, v]])),
      get: async () => { const docs = [...store.keys()].filter(k => k.startsWith(p + '/') && k.slice(p.length + 1).indexOf('/') < 0).sort().filter(k => filters.every(([f, op, v]) => {
        const x = f === '__name__' ? k.split('/').pop() : (store.get(k) || {})[f]; return op === '==' ? x === v : op === '>=' ? x >= v : op === '<=' ? x <= v : false; })).map(snapOf);
        return { docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) }; } }; return q; }
  const fdb = { collection: n => colRef(n),
    batch: () => { const ops = []; return { delete: r => ops.push(r), commit: async () => { ops.forEach(r => failIf(r.path)); for (const r of ops) await r.delete(); } }; },
    runTransaction: async fn => fn({ get: r => r.get(), set: (r, d, o) => r.set(d, o), update: (r, d) => r.update(d) }) };
  window.db = fdb; try { db = fdb; } catch (e) {}
  window.ensureDb = async () => fdb; try { ensureDb = window.ensureDb; } catch (e) {}
  window.firebase = window.firebase || {};
  firebase.firestore = Object.assign(firebase.firestore || {}, { FieldValue: { serverTimestamp: () => 'ts', delete: () => DEL, increment: n => n }, FieldPath: { documentId: () => '__name__' } });
  window.confirm = () => true; window.alert = m => { window.__alerts = (window.__alerts || []).concat(String(m)); };
  return store.size;
})()`;
const SNAP = `JSON.stringify([...__store].sort((a, b) => a[0] < b[0] ? -1 : 1))`;

async function main(){
  const chrome = findChrome();
  if (!chrome){ console.error('remove-one-smoke: no Chrome found (pass --chrome or set CHROME)'); process.exit(2); }
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });
  const { srv, port } = await serve(ROOT);
  const prof = mkdtempSync(join(tmpdir(), 'gc-remove-one-chrome-'));
  const cdp = await freePort();
  const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
  let pass = 0, fail = 0;
  const ok = (c, line) => { console.log((c ? '  ✓ ' : '  ✗ ') + line); c ? pass++ : fail++; return c; };
  let page;
  try {
    for (let i = 0; i < 80; i++){ try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }
    page = await openPage(cdp);
    const errs = [];
    page.on((m, p) => { if (m === 'Runtime.exceptionThrown'){ const d = p.exceptionDetails; errs.push((d.exception && d.exception.description) || d.text); } if (m === 'Runtime.consoleAPICalled' && p.type === 'error') errs.push(p.args.map(a => a.value || a.description || '').join(' ')); });
    await page.send('Runtime.enable'); await page.send('Page.enable');
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
    const js = e => page.evalJs(e);
    const shot = async name => { if (!SHOTS) return; const r = await page.send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(SHOTS, name + '.png'), Buffer.from(r.data, 'base64')); };
    const waitFor = async (expr, ms = 8000) => { for (let t = 0; t < ms; t += 100){ if (await js(expr).catch(() => false)) return true; await sleep(100); } return false; };
    const type = async text => { await js(`(() => { const i = document.getElementById('trm-typed'); i.focus(); i.select(); return true; })()`); if (text) await page.send('Input.insertText', { text }); else { for (const t of ['keyDown', 'keyUp']) await page.send('Input.dispatchKeyEvent', { type: t, key: 'Backspace', code: 'Backspace', windowsVirtualKeyCode: 8 }); } await sleep(80); };
    const goDisabled = () => js(`document.querySelector('#trm-overlay [data-trm-act="go"]').disabled`);
    const boot = async (failPrefix) => {
      await page.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html?teacher=true` });
      await waitFor(`typeof ensureTeacherJs === 'function' && typeof CLASS_ACTIVITIES !== 'undefined'`, 15000);
      await js(`ensureTeacherJs()`); await waitFor(`typeof showTeacherApp === 'function' && typeof teacherRemoveOpen === 'function'`);
      await js(STUB);
      // The planted failure is set after the page loads (a navigation clears window).
      await js(`window.__fail = ${JSON.stringify(failPrefix || null)}`);
      await js(`showTeacherApp({ uid: 'stub-teacher', email: TEACHER_EMAIL, displayName: 'Teacher' }).catch(e => { window.__showErr = e.message; })`);
      await waitFor(`allStudentsRaw.length === 3`);
      await js(`setTeacherView('manage')`);
      return waitFor(`document.querySelectorAll('[data-remove-one]').length === 3`);
    };
    const others = snap => JSON.stringify(JSON.parse(snap).filter(([k]) => !k.includes('test-uid-0') && k !== 'config/class' && k !== 'config/access'));
    const cfgOthers = (snap, uid) => { const m = new Map(JSON.parse(snap)); const c = JSON.parse(JSON.stringify(m.get('config/class'))); delete c.configVersion; delete c.progressDeleted; delete c.progressStartOver;
      ['paused', 'archived', 'periodOverrides', 'moduleOpenThrough', 'gameOverrides', 'activityClears'].forEach(f => { if (c[f]) delete c[f][uid]; }); Object.values(c.activityStudents || {}).forEach(x => delete x[uid]);
      const sort = v => v && typeof v === 'object' && !Array.isArray(v) ? Object.fromEntries(Object.keys(v).sort().map(k => [k, sort(v[k])])) : v; return JSON.stringify(sort(c)); };

    console.log('manage');
    ok(await boot(), 'the console boots on the stub; Manage draws 3 rows, each with its "⋯" (More) button');
    const lastCell = await js(`[...document.querySelectorAll('[data-tview="manage"] tbody tr:not(.tg-group)')].every(tr => tr.lastElementChild.querySelector('[data-remove-one]'))`);
    ok(lastCell, '"⋯" (More) sits in the last cell of every row, apart from the everyday buttons');
    const fit = await js(`(() => { const w = document.querySelector('[data-tview="manage"]'), b = w.querySelector('[data-remove-one]').getBoundingClientRect(), r = w.getBoundingClientRect(); return { sw: w.scrollWidth, cw: w.clientWidth, inside: b.right <= r.right + 0.5 }; })()`);
    ok(fit.sw <= fit.cw && fit.inside, `the Manage table fits at 1366 with the new column (scrollWidth ${fit.sw}, clientWidth ${fit.cw}; the ⋯ button inside: ${fit.inside})`);
    await js(`document.querySelector('[data-tview="manage"]').scrollIntoView({block:'center'}); true`); await sleep(150);
    await shot('01-manage-rows');
    await js(`document.querySelector('[data-remove-one][data-uid="test-uid-0"]').click()`);
    ok(await waitFor(`!!document.querySelector('#trm-overlay .trm-menu')`), '⋯ opens the chooser: ' + await js(`[...document.querySelectorAll('.trm-menu-item strong')].map(x => x.textContent).join(' · ')`));
    await shot('02-more-menu');

    console.log('delete, recordings unticked');
    const before = await js(SNAP);
    await js(`document.querySelector('[data-trm-act="delete"]').click()`);
    ok(await waitFor(`!!document.querySelector('[data-trm-tick]')`), 'the Delete dialog reads and lists the kinds');
    const kinds = await js(`[...document.querySelectorAll('.trm-kind')].map(l => l.textContent.replace(/\\s+/g, ' ').trim())`);
    const want = [/Practice minutes: 2 days and 2 weeks/, /Mic recordings: 2 recordings \(3 audio pieces\)/, /Song requests: 2 song requests/, /request to join and their entry on the allow list/, /current live game/, /paused, the period you set \(CAS\), open through Module 5, games off for them, 2 activity clears, picked for 1 individual card/, /3 steps done, 2 answers, 2 ratings and got-its, 1 in-class activity, 1 exit check/];
    ok(kinds.length === 7 && want.every((re, i) => re.test(kinds[i])), `the 7 kinds and their counts (${kinds.filter((k, i) => want[i] && want[i].test(k)).length} of 7)`);
    ok(await js(`[...document.querySelectorAll('[data-trm-tick]')].every(b => b.checked)`), 'every kind is ticked to start');
    ok(await goDisabled(), 'Delete is disabled before anything is typed');
    ok(await js(`(() => { const t = document.querySelector('#trm-overlay .trm-modal').innerHTML; const w = t.indexOf('Do this when the student is not using the site.'); return w > 0 && w < t.indexOf('trm-typed') && t.includes('A page they already have open keeps its old copy and saves it again; if their work comes back, press this again.'); })()`), 'the warning sits above the typed name, in the agreed words');
    await shot('03-delete-before-typing');
    await type('Test 1'); ok(await goDisabled(), 'a wrong name keeps Delete disabled');
    await type('Test'); ok(await goDisabled(), 'part of the name keeps it disabled');
    await type('test 0'); ok(!(await goDisabled()), 'the name (any case) turns Delete on');
    await js(`(() => { const b = document.querySelector('[data-trm-tick="recordings"]'); b.click(); return true; })()`);
    ok(!(await js(`document.querySelector('[data-trm-tick="recordings"]').checked`)), 'recordings unticked');
    await shot('04-delete-after-typing');
    await js(`document.querySelector('[data-trm-act="go"]').click()`);
    ok(await waitFor(`/Done: 6 of 6 kinds deleted/.test((document.querySelector('#trm-overlay .trm-ok') || {}).textContent || '')`), 'the result: ' + await js(`(document.querySelector('#trm-overlay [role="status"]') || {}).textContent`));
    await shot('05-delete-result');
    const after = await js(SNAP);
    const A = new Map(JSON.parse(after)), B = new Map(JSON.parse(before));
    const takes = [...B.keys()].filter(k => k.startsWith('micTakes/test-uid-0'));
    ok(takes.length === 5 && takes.every(k => JSON.stringify(A.get(k)) === JSON.stringify(B.get(k))), `Test 0's recordings byte-identical (${takes.filter(k => JSON.stringify(A.get(k)) === JSON.stringify(B.get(k))).length} of ${takes.length})`);
    const rest = [...A.keys()].filter(k => k.includes('test-uid-0') && !k.startsWith('micTakes/'));
    ok(!rest.length, `everything else of Test 0's is gone (${rest.length} left${rest.length ? ': ' + rest.join(', ') : ''})`);
    ok(others(before) === others(after), `Test 1's and Test 2's documents byte-identical (${JSON.parse(others(after)).length} documents)`);
    ok(cfgOthers(before, 'test-uid-0') === cfgOthers(after, 'test-uid-0'), 'config/class byte-identical apart from Test 0\'s cells, the marker and the version');
    ok(A.has('issueReports/rep-0'), 'Test 0\'s problem report kept (no delete rule for anyone)');
    await js(`teacherRemoveClose()`);

    console.log('a failure at the third kind, then a re-run');
    await boot('songRequests/');
    const before2 = await js(SNAP);
    await js(`document.querySelector('[data-remove-one][data-uid="test-uid-0"]').click()`); await waitFor(`!!document.querySelector('.trm-menu')`);
    await js(`document.querySelector('[data-trm-act="delete"]').click()`); await waitFor(`!!document.querySelector('[data-trm-tick]')`);
    await type('Test 0');
    await js(`document.querySelector('[data-trm-act="go"]').click()`);
    ok(await waitFor(`/done 2 of 7 kinds, failed at Song requests/.test((document.querySelector('#trm-overlay .trm-err') || {}).textContent || '')`), 'the result: ' + await js(`(document.querySelector('#trm-overlay [role="status"]') || {}).textContent`));
    await shot('06-delete-failed-at-third');
    const mid = new Map(JSON.parse(await js(SNAP)));
    ok(![...mid.keys()].some(k => k.startsWith('minutes/test-uid-0') || k.startsWith('micTakes/test-uid-0')) && mid.has('progress/test-uid-0') && mid.has('songRequests/test-uid-0_2026-W45') && mid.has('accessRequests/test-uid-0'), 'the two kinds before it are gone; it and the kinds after it are whole');
    await js(`window.__fail = null`);
    await js(`document.querySelector('[data-trm-act="delete"]').click()`); await waitFor(`!!document.querySelector('[data-trm-tick]')`);
    const ticked = await js(`[...document.querySelectorAll('[data-trm-tick]')].filter(b => b.checked).map(b => b.dataset.trmTick).join(',')`);
    ok(ticked === 'songRequests,join,live,settings,progress', 'the second read ticks only what is left: ' + ticked);
    await type('Test 0');
    await js(`document.querySelector('[data-trm-act="go"]').click()`);
    ok(await waitFor(`/Done: 5 of 5 kinds deleted/.test((document.querySelector('#trm-overlay .trm-ok') || {}).textContent || '')`), 'the re-run finishes: ' + await js(`(document.querySelector('#trm-overlay [role="status"]') || {}).textContent`));
    const after2 = await js(SNAP);
    ok(!JSON.parse(after2).some(([k]) => k.includes('test-uid-0')), 'nothing of Test 0\'s is left');
    ok(others(before2) === others(after2) && cfgOthers(before2, 'test-uid-0') === cfgOthers(after2, 'test-uid-0'), 'the other two students and the rest of config/class byte-identical');
    await js(`teacherRemoveClose()`);

    console.log('start over');
    await boot();
    const before3 = await js(SNAP);
    await js(`window.__writes = []; document.querySelector('[data-remove-one][data-uid="test-uid-2"]').click()`); await waitFor(`!!document.querySelector('.trm-menu')`);
    await js(`document.querySelector('[data-trm-act="over"]').click()`);
    ok(await waitFor(`/Emptied: 3 steps done, 2 answers/.test(document.querySelector('#trm-overlay').textContent)`), 'the Start over dialog lists what empties and what is kept');
    ok(await goDisabled(), 'Start over is disabled before the name is typed');
    await shot('07-start-over-before-typing');
    await type('Test 2'); ok(!(await goDisabled()), 'the name turns Start over on');
    await shot('08-start-over-after-typing');
    await js(`document.querySelector('[data-trm-act="go"]').click()`);
    ok(await waitFor(`/starts over the next time they sign in on the main site/.test((document.querySelector('#trm-overlay .trm-ok') || {}).textContent || '')`), 'the result: ' + await js(`(document.querySelector('#trm-overlay [role="status"]') || {}).textContent`));
    await shot('09-start-over-result');
    const writes = await js(`window.__writes`);
    ok(writes.length === 1 && writes[0] === 'set config/class', 'one write, to config/class: ' + writes.join(', '));
    const after3 = new Map(JSON.parse(await js(SNAP))), B3 = new Map(JSON.parse(before3));
    const moved = [...B3.keys()].filter(k => k !== 'config/class' && JSON.stringify(after3.get(k)) !== JSON.stringify(B3.get(k)));
    ok(!moved.length, `every other document byte-identical, Test 2's progress and minutes included (${B3.size - 1 - moved.length} of ${B3.size - 1})`);
    const cfg = after3.get('config/class');
    ok(cfg.progressStartOver && Object.keys(cfg.progressStartOver).join() === 'test-uid-2', 'the marker: progressStartOver holds Test 2\'s uid and a time');
    await js(`teacherRemoveClose()`);
    ok(await waitFor(`/Started over .* · not applied yet \\(it happens at their next sign-in on the main site\\)/.test(document.querySelector('[data-tview="manage"]').textContent)`), 'Manage\'s row says "Started over <date> · not applied yet (it happens at their next sign-in on the main site)"');
    const fit2 = await js(`(() => { const w = document.querySelector('[data-tview="manage"]'); return { sw: w.scrollWidth, cw: w.clientWidth }; })()`);
    ok(fit2.sw <= fit2.cw, `the table still fits with the "Started over" line (scrollWidth ${fit2.sw}, clientWidth ${fit2.cw})`);
    await js(`document.querySelector('[data-tview="manage"]').scrollIntoView({block:'center'}); true`); await sleep(150);
    await shot('10-manage-starting-over');
    const e = errs.filter(x => !NOISE.test(x || ''));
    ok(!e.length, 'no page error in the console walk' + (e.length ? ': ' + e[0] : ''));
    ok(!(await js(`(window.__alerts || []).length`)), 'no alert');

    console.log("the student's view");
    await page.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
    await waitFor(`typeof devBypass === 'function' && typeof showProgressResetNotice === 'function'`, 15000);
    await js(`try{ localStorage.setItem('gc-lang','en'); }catch(e){} devBypass(); progressResetNotice = 'over'; showProgressResetNotice(); true`);
    await sleep(600);
    const en = await js(`(document.getElementById('reset-notice') || {}).textContent || ''`);
    ok(/Your teacher started you over: your lesson steps are empty, and your In-Class Activities, game scores, streak and practice minutes are kept\./.test(en), 'English: ' + en.replace('×', '').trim());
    await shot('11-student-started-over-en');
    await js(`setLang('es'); true`); await sleep(400);
    const es = await js(`(document.getElementById('reset-notice') || {}).textContent || ''`);
    ok(/Tu maestro te hizo empezar de nuevo/.test(es), 'Spanish: ' + es.replace('×', '').trim());
    await shot('12-student-started-over-es');
    await js(`setLang('en'); true`);
  } finally {
    if (page) await page.close();
    proc.kill('SIGTERM');
    srv.close();
  }
  console.log(`remove-one-smoke: ${pass} passed, ${fail} failed`);
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('remove-one-smoke: crashed: ' + (e && e.stack || e)); process.exit(2); });
