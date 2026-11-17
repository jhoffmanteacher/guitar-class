#!/usr/bin/env node
/* manage-layout-smoke.mjs — the console's Manage view, one section at a time (2026-11-15; teacher-manage-layout.js),
   in headless Chrome against a STUB Firestore.

     node tools/manage-layout-smoke.mjs                 run the walk, print each check
     node tools/manage-layout-smoke.mjs --shots <dir>   also save screenshots there
     node tools/manage-layout-smoke.mjs --measure       only measure each feature's height at 1440×900 (works on a
                                                        checkout from before the sections too: --root <dir>)
     node tools/manage-layout-smoke.mjs --chrome <path> Chrome binary (or CHROME=…)

   30 made-up students ("Test 0" … "Test 29", periods 4, 7 and CAS, 6 of them not @school) and two made-up requests to
   join, in a page-side stub of Firestore (the way tools/remove-one-smoke.mjs stubs it). Never signs in, never reads
   live data. At 1440×900 it checks:
     - Manage opens on Students, one tab selected, one section shown; the Accounts tab carries the waiting count;
     - each tab shows its own section only, and switching writes nothing;
     - one real action per feature (13): Show archived, Sort by last name, Open everyone through, a period, a
       student's Open through, Pause, Archive, the "⋯" chooser (Students); Allow a request, an Allowed switch,
       Refresh (Accounts); Show song files + Refresh (Song files); Download a backup (Backup: the file is refused by
       the browser here, so nothing is saved to disk), and the 2 display-only features are on screen (Right now,
       the help note);
     - Left / Right / Home / End move between the tabs and focus;
     - the section opened last survives a reload; the dashboard's "Open Manage" lands on Accounts; the sidebar's
       Manage lands on the remembered section;
     - no sideways scroll at 1366×657, 1440×900 and 1920×1080; no page error.
   Only one headless-Chrome run at a time on this Mac. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ROOT = resolve(opt('--root') || join(dirname(fileURLToPath(import.meta.url)), '..'));
const SHOTS = opt('--shots');
const MEASURE = args.includes('--measure');
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
const NOISE = /firebase|firestore|googleapis|gstatic|google\.com|youtube|ytimg|net::ERR|Failed to fetch|ERR_|auth\/|identitytoolkit|favicon|Content Security|websocket|WebChannel|offline|Could not reach|NotAllowedError|play\(\) request|AbortError|NotSupportedError|sw\.js|ServiceWorker/i;

/* The page-side stub. Every name is made up. Students 0..29; 24 on @seq.org, 6 not (3 of them allowed). */
const STUB = String.raw`(() => {
  const DEL = { __del: true };
  const store = new Map(); window.__store = store; window.__writes = [];
  const allow = {};
  for (let i = 0; i < 30; i++){
    const u = 'test-uid-' + String(i).padStart(2, '0');
    const outside = i % 5 === 4;
    if (outside && i < 15) allow[u] = true;
    store.set('progress/' + u, { name: 'Test ' + i + ' Student', email: 'test' + i + (outside ? '@example.test' : '@seq.org'), period: ['4', '7', 'CAS'][i % 3], migrations: { swap45: true },
      completed: { 'm1w1-b-sec0-0': true }, skills: { 'm1w1-s1': 'gotit' }, classActivities: {}, games: {}, caSteps: {} });
  }
  store.set('accessRequests/test-req-1', { name: 'Test Request 1', email: 'req1@example.test', status: 'asked' });
  store.set('accessRequests/test-req-2', { name: 'Test Request 2', email: 'req2@example.test', status: 'asked' });
  store.set('config/access', { allow });
  store.set('config/class', { configVersion: 3, gamesEnabled: true, paused: { 'test-uid-02': true }, archived: { 'test-uid-29': true } });
  const clone = v => v === undefined ? v : JSON.parse(JSON.stringify(v));
  const merge = (dst, src) => { Object.keys(src).forEach(k => { const v = src[k];
    if (v && v.__del) delete dst[k];
    else if (k.includes('.')) { const [a, b] = k.split('.'); dst[a] = dst[a] || {}; if (v && v.__del) delete dst[a][b]; else dst[a][b] = clone(v); }
    else if (v && typeof v === 'object' && !Array.isArray(v)) { if (!dst[k] || typeof dst[k] !== 'object' || Array.isArray(dst[k])) dst[k] = {}; merge(dst[k], v); }
    else dst[k] = clone(v); }); return dst; };
  const snapOf = p => ({ exists: store.has(p), data: () => clone(store.get(p)), id: p.split('/').pop(), ref: docRef(p) });
  function docRef(p){ return { path: p, id: p.split('/').pop(), get: async () => snapOf(p),
    set: async (d, o) => { window.__writes.push('set ' + p); store.set(p, o && o.merge ? merge(clone(store.get(p) || {}), d) : merge({}, d)); },
    update: async d => { window.__writes.push('update ' + p); store.set(p, merge(clone(store.get(p) || {}), d)); },
    delete: async () => { window.__writes.push('delete ' + p); store.delete(p); }, collection: n => colRef(p + '/' + n) }; }
  function colRef(p, filters, after){ filters = filters || [];
    const q = { doc: id => docRef(p + '/' + id), orderBy: () => q, limit: () => q, where: (f, op, v) => colRef(p, filters.concat([[f, op, v]]), after),
      startAfter: d => colRef(p, filters, d && d.id),
      get: async () => { const docs = [...store.keys()].filter(k => k.startsWith(p + '/') && k.slice(p.length + 1).indexOf('/') < 0).sort()
        .filter(k => after == null || k.split('/').pop() > after).filter(k => filters.every(([f, op, v]) => {
        const x = f === '__name__' ? k.split('/').pop() : (store.get(k) || {})[f]; return op === '==' ? x === v : op === '>=' ? x >= v : op === '<=' ? x <= v : false; })).map(snapOf);
        return { docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) }; } }; return q; }
  const fdb = { collection: n => colRef(n),
    batch: () => { const ops = []; return { delete: r => ops.push(r), commit: async () => { for (const r of ops) await r.delete(); } }; },
    runTransaction: async fn => fn({ get: r => r.get(), set: (r, d, o) => r.set(d, o), update: (r, d) => r.update(d) }) };
  window.db = fdb; try { db = fdb; } catch (e) {}
  window.ensureDb = async () => fdb; try { ensureDb = window.ensureDb; } catch (e) {}
  window.firebase = window.firebase || {};
  firebase.firestore = Object.assign(firebase.firestore || {}, { FieldValue: { serverTimestamp: () => 'ts', delete: () => DEL, increment: n => n }, FieldPath: { documentId: () => '__name__' } });
  window.confirm = () => true; window.alert = m => { window.__alerts = (window.__alerts || []).concat(String(m)); };
  return store.size;
})()`;

async function main(){
  const chrome = findChrome();
  if (!chrome){ console.error('manage-layout-smoke: no Chrome found (pass --chrome or set CHROME)'); process.exit(2); }
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });
  const { srv, port } = await serve(ROOT);
  const prof = mkdtempSync(join(tmpdir(), 'gc-manage-layout-chrome-'));
  const cdp = await freePort();
  const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
  let pass = 0, fail = 0, actions = 0;
  const ok = (c, line) => { console.log((c ? '  ✓ ' : '  ✗ ') + line); c ? pass++ : fail++; return c; };
  const act = (c, line) => { if (c) actions++; return ok(c, line); };
  let page;
  try {
    for (let i = 0; i < 80; i++){ try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }
    page = await openPage(cdp);
    const errs = [];
    page.on((m, p) => { if (m === 'Runtime.exceptionThrown'){ const d = p.exceptionDetails; errs.push((d.exception && d.exception.description) || d.text); } if (m === 'Runtime.consoleAPICalled' && p.type === 'error') errs.push(p.args.map(a => a.value || a.description || '').join(' ')); });
    await page.send('Runtime.enable'); await page.send('Page.enable');
    // A backup's file is refused by the browser: nothing is written to disk.
    await page.send('Page.setDownloadBehavior', { behavior: 'deny' }).catch(() => {});
    const size = (width, height) => page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
    await size(1440, 900);
    const js = e => page.evalJs(e);
    const shot = async (name, full) => { if (!SHOTS) return; const r = await page.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: !!full }); writeFileSync(join(SHOTS, name + '.png'), Buffer.from(r.data, 'base64')); };
    const waitFor = async (expr, ms = 8000) => { for (let t = 0; t < ms; t += 100){ if (await js(expr).catch(() => false)) return true; await sleep(100); } return false; };
    const boot = async (clear) => {
      await page.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html?teacher=true` });
      await waitFor(`typeof ensureTeacherJs === 'function' && typeof CLASS_ACTIVITIES !== 'undefined'`, 15000);
      if (clear) await js(`(() => { try { localStorage.clear(); } catch (e) {} return true; })()`);
      await js(`ensureTeacherJs()`); await waitFor(`typeof showTeacherApp === 'function' && typeof renderTeacherManage === 'function'`);
      await js(STUB);
      await js(`showTeacherApp({ uid: 'stub-teacher', email: TEACHER_EMAIL, displayName: 'Teacher' }).catch(e => { window.__showErr = e.message; })`);
      await waitFor(`allStudentsRaw.length === 30`);
      await js(`setTeacherView('manage')`);
      return waitFor(`document.querySelectorAll('[data-set-paused]').length >= 2 * 29 && !!document.querySelector('#t-access-block [data-access-block]')`);
    };
    const shownPane = `[...document.querySelectorAll('[data-manage-pane]')].filter(p => !p.hidden).map(p => p.dataset.managePane).join()`;
    const selTab = `[...document.querySelectorAll('[data-manage-tab]')].filter(b => b.getAttribute('aria-selected') === 'true').map(b => b.dataset.manageTab).join()`;
    const noSideways = () => js(`document.documentElement.scrollWidth <= document.documentElement.clientWidth`);

    ok(await boot(true), 'the console boots on the stub; Manage draws 29 rows (1 archived hidden) and the Accounts block');
    const sectioned = await js(`!!document.querySelector('[data-manage-tabs]')`);

    /* ── heights: the inventory ── */
    const measure = async () => {
      const showAll = sectioned ? `document.querySelectorAll('[data-manage-pane]').forEach(p => p.hidden = false);` : '';
      return js(`(() => { ${showAll}
        const h = el => el ? Math.round(el.getBoundingClientRect().height) : 0;
        const between = (a, b) => (a && b) ? Math.round(b.getBoundingClientRect().bottom - a.getBoundingClientRect().top) : 0;
        const bk = document.getElementById('t-backup');
        const stuLbl = [...document.querySelectorAll('.tg-class-lbl')].find(x => /Student access/.test(x.textContent));
        const stuFirst = stuLbl && stuLbl.parentElement, table = document.querySelector('[data-tview="manage"]');
        const note = table && table.previousElementSibling;
        const r = {
          'Backup (#t-backup + its note)': between(bk, bk && bk.nextElementSibling),
          'Song files (#t-songfiles-block)': h(document.getElementById('t-songfiles-block')),
          'Accounts by sign-in domain (#t-access-block)': h(document.getElementById('t-access-block')),
          'Students: Show archived, Sort, Open everyone through, help note': between(stuFirst, note),
          'Students: roster table (29 rows) + summary line': between(table, table && table.nextElementSibling && table.nextElementSibling.classList.contains('tg-note') ? table.nextElementSibling : table),
          'whole view (#t-grid-container)': h(document.getElementById('t-grid-container')),
        };
        return r; })()`);
    };
    const heights = await measure();
    console.log('heights at 1440×900 (px), every section shown:');
    for (const [k, v] of Object.entries(heights)) console.log(`    ${String(v).padStart(5)}  ${k}`);
    if (MEASURE || !sectioned){
      await js(`window.scrollTo(0, 0); true`);
      await shot('00-before-manage-1440-full', true);
      if (!sectioned) console.log('  (no sections in this checkout: measured only)');
      return;
    }
    await boot(true);

    console.log('default and tabs');
    ok(await js(selTab) === 'students' && await js(shownPane) === 'students', `opens on Students: tab [${await js(selTab)}], section [${await js(shownPane)}]`);
    ok(await js(`[...document.querySelectorAll('[data-manage-tab]')].map(b => b.textContent.trim()).join(' | ')`).then(t => { console.log('    tabs: ' + t); return /^Students \| Accounts \(2 waiting\) \| Song files \| Backup due$/.test(t); }), 'the tabs read Students · Accounts (2 waiting) · Song files · Backup due');
    ok(await js(`document.querySelector('[data-manage-tabs]').getAttribute('role') === 'tablist' && [...document.querySelectorAll('[data-manage-tab]')].every(b => b.tagName === 'BUTTON' && b.getAttribute('role') === 'tab' && document.getElementById(b.getAttribute('aria-controls')).getAttribute('role') === 'tabpanel')`), 'a tablist of 4 real buttons, each controlling a tabpanel');
    ok(await noSideways(), 'no sideways scroll at 1440×900');
    await shot('01-students-1440');

    const writes0 = await js(`window.__writes.length`);
    for (const k of ['accounts', 'songs', 'backup', 'students']){
      await js(`document.querySelector('[data-manage-tab="${k}"]').click(); true`);
      ok(await js(shownPane) === k && await js(selTab) === k, `click ${k}: only ${k} is shown (${await js(shownPane)})`);
    }
    ok(await js(`window.__writes.length`) === writes0, `switching sections wrote nothing (${await js(`window.__writes.length`) - writes0} writes)`);

    console.log('keyboard');
    await js(`document.querySelector('[data-manage-tab="students"]').focus(); true`);
    const key = async k => { await page.send('Input.dispatchKeyEvent', { type: 'keyDown', key: k, code: k }); await page.send('Input.dispatchKeyEvent', { type: 'keyUp', key: k, code: k }); await sleep(60); return js(`[document.activeElement.dataset.manageTab, ${shownPane}].join('/')`); };
    const seq = [await key('ArrowRight'), await key('ArrowRight'), await key('End'), await key('ArrowRight'), await key('ArrowLeft'), await key('Home')];
    ok(seq.join(' ') === 'accounts/accounts songs/songs backup/backup students/students backup/backup students/students', 'Right, Right, End, Right, Left, Home: ' + seq.join(' '));
    ok(await js(`[...document.querySelectorAll('[data-manage-tab]')].map(b => b.tabIndex).join()`) === '0,-1,-1,-1', 'only the selected tab is in the Tab order');

    console.log('Students: one action per feature');
    const cfg = `JSON.parse(JSON.stringify(__store.get('config/class')))`;
    const clickWait = async (sel, cond) => { await js(`document.querySelector(${JSON.stringify(sel)}).click(); true`); return waitFor(cond); };
    act(await clickWait('[data-toggle-archived]', `/Hiding nothing/.test(document.querySelector('[data-toggle-archived]').textContent) && document.querySelectorAll('[data-set-paused]').length === 60`), 'Show archived → "Hiding nothing", 30 rows');
    await clickWait('[data-toggle-archived]', `document.querySelectorAll('[data-set-paused]').length === 58`);
    act(await clickWait('[data-manage-sort="name"][data-value="last"]', `/^Student, Test/.test(document.querySelector('[data-tview="manage"] td.tg-name').textContent)`), 'Sort: Last name → "Student, Test …"');
    await clickWait('[data-manage-sort="name"][data-value="first"]', `/^Test/.test(document.querySelector('[data-tview="manage"] td.tg-name').textContent)`);
    await js(`document.getElementById('t-open-all-select').value = '4'; true`);
    act(await clickWait('[data-open-all-through]', `Object.values((${cfg}).moduleOpenThrough || {}).filter(v => v === 4).length === 29`), 'Open everyone through Module 4 → 29 students written');
    act(await clickWait('[data-set-period][data-uid="test-uid-01"][data-value="CAS"]', `((${cfg}).periodOverrides || {})['test-uid-01'] === 'CAS'`), 'Period: Test 1 → CAS written');
    await js(`(() => { const s = document.querySelector('[data-set-open-through][data-uid="test-uid-03"]'); s.value = '6'; s.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`);
    act(await waitFor(`((${cfg}).moduleOpenThrough || {})['test-uid-03'] === 6`), "a student's Open through: Test 3 → Module 6 written");
    act(await clickWait('[data-set-paused][data-uid="test-uid-05"][data-state="paused"]', `((${cfg}).paused || {})['test-uid-05'] === true`), 'Access: Test 5 → Paused written');
    act(await clickWait('[data-set-archived][data-uid="test-uid-06"][data-state="archive"]', `((${cfg}).archived || {})['test-uid-06'] === true`), 'Roster: Test 6 → Archive written');
    act(await clickWait('[data-remove-one][data-uid="test-uid-07"]', `document.querySelectorAll('#trm-overlay .trm-menu-item').length === 2`), '"⋯" opens the chooser: ' + await js(`[...document.querySelectorAll('.trm-menu-item strong')].map(x => x.textContent).join(' · ')`));
    await shot('02-students-more-1440');
    await js(`teacherRemoveClose(); true`);
    ok(await js(`/paused/.test(document.querySelector('[data-uid="test-uid-05"]').closest('tr').querySelector('.tg-eff').textContent)`), 'Right now: Test 5 reads "paused" (display only)');
    ok(await js(`/Paused<\\/strong> students can sign in/.test(document.querySelector('[data-manage-pane="students"]').innerHTML)`), 'the help note is in Students (display only)');
    ok(await js(shownPane) === 'students', 'every repaint kept Students shown');

    console.log('Accounts');
    await js(`document.querySelector('[data-manage-tab="accounts"]').click(); true`);
    await shot('03-accounts-1440');
    act(await clickWait('[data-access-decide][data-uid="test-req-1"][data-state="allowed"]', `__store.get('accessRequests/test-req-1').status === 'allowed' && __store.get('config/access').allow['test-req-1'] === true`), 'Asking to join: Allow Test Request 1 → request allowed, allow list written');
    ok(await waitFor(`/Accounts \\(1 waiting\\)/.test(document.querySelector('[data-manage-tab="accounts"]').textContent)`), 'the tab now reads ' + await js(`document.querySelector('[data-manage-tab="accounts"]').textContent`));
    act(await clickWait('[data-access-set][data-uid="test-uid-19"][data-state="on"]', `__store.get('config/access').allow['test-uid-19'] === true`), 'Not @seq.org: Test 19 → Allowed written');
    act(await clickWait('#t-access-block [data-access-refresh]', `/Roster as of/.test(document.getElementById('t-access-block').textContent) && !document.querySelector('#t-access-block [data-access-refresh][disabled]')`), 'Refresh reads the lists again');
    ok(await js(shownPane) === 'accounts', 'the writes kept Accounts shown');

    console.log('Song files');
    await js(`document.querySelector('[data-manage-tab="songs"]').click(); true`);
    /* Open from the start since 2026-11-17 (Jonathan could not find the upload behind "Show song files"): the drop zone is there with no click; Hide then Show still work. */
    ok(await js(`!!document.querySelector('#t-songfiles-block [data-tsf-drop]') && /Hide song files/.test(document.querySelector('[data-tsf-act="toggle"]').textContent)`), 'Song files is open on arrival: the drop zone is on the page');
    ok(await clickWait('[data-tsf-act="toggle"]', `/Show song files/.test(document.querySelector('[data-tsf-act="toggle"]').textContent) && !document.querySelector('#t-songfiles-block [data-tsf-drop]')`), 'Hide song files → the list closes');
    act(await clickWait('[data-tsf-act="toggle"]', `/Hide song files/.test(document.querySelector('[data-tsf-act="toggle"]').textContent)`), 'Show song files → the list opens');
    ok(await clickWait('[data-tsf-act="refresh"]', `!!document.querySelector('[data-tsf-act="refresh"]') && !document.querySelector('[data-tsf-act="refresh"][disabled]')`), 'Refresh reads the store again');
    await shot('04-songfiles-1440');

    console.log('Backup');
    await js(`document.querySelector('[data-manage-tab="backup"]').click(); true`);
    await shot('05-backup-1440');
    act(await clickWait('#t-backup-btn', `teacherBackupState.kind === 'saved' || teacherBackupState.kind === 'failed'`) && await js(`teacherBackupState.kind`) === 'saved', 'Download a backup → ' + await js(`teacherBackupState.kind + ': ' + teacherBackupState.text`));
    ok(await js(`document.querySelector('[data-manage-tab="backup"]').textContent.trim()`) === 'Backup', 'the Backup tab drops "due" once a backup is saved');
    await shot('06-backup-done-1440');

    console.log('remembered, jumps');
    await boot(false);
    ok(await js(shownPane) === 'backup' && await js(selTab) === 'backup', `after a reload Manage opens on the section opened last (${await js(shownPane)})`);
    await js(`setTeacherView('students')`); await sleep(200);
    ok(await js(`!!document.querySelector('#t-access-alert [data-access-open]')`), 'the dashboard line "… asking to join. Open Manage" is there');
    await js(`document.querySelector('#t-access-alert [data-access-open]').click(); true`);
    ok(await waitFor(`teacherView === 'manage' && ${shownPane} === 'accounts'`), `"Open Manage" lands on Accounts (${await js(shownPane)})`);
    await js(`document.querySelector('[data-manage-tab="songs"]').click(); setTeacherView('students'); true`); await sleep(200);
    await js(`document.querySelector('#t-side [data-view="manage"]').click(); true`);
    ok(await waitFor(`teacherView === 'manage' && ${shownPane} === 'songs'`), `the sidebar's Manage lands on the remembered section (${await js(shownPane)})`);
    await js(`document.querySelector('[data-manage-tab="students"]').click(); true`);

    console.log('sizes');
    for (const [w, h] of [[1366, 657], [1920, 1080]]){
      await size(w, h); await sleep(250);
      ok(await noSideways(), `no sideways scroll at ${w}×${h}`);
      await js(`window.scrollTo(0, 0); true`);
      await shot(`07-students-${w}`);
    }
    const e = errs.filter(x => !NOISE.test(x || ''));
    ok(!e.length, 'no page error' + (e.length ? ': ' + e[0] : ''));
    ok(!(await js(`(window.__alerts || []).length`)), 'no alert' + (await js(`(window.__alerts || []).join(' | ')`)));
    console.log(`  actions: ${actions} of 13 features clicked and confirmed`);
    if (actions !== 13) ok(false, `${actions} of 13 actions`);
  } finally {
    if (page) await page.close();
    proc.kill('SIGTERM');
    srv.close();
    console.log(`manage-layout-smoke: ${pass} passed, ${fail} failed`);
  }
  process.exit(fail ? 1 : 0);
}
main().catch(e => { console.error('manage-layout-smoke: crashed: ' + (e && e.stack || e)); process.exit(2); });
