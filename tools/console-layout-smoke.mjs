#!/usr/bin/env node
/* Teacher console layout smoke test (Layout A, 2026-11-08).

   Boots the real teacher console (index.html?teacher=true + teacher.js) in
   headless Chrome against a STUB Firestore — 30 fake students ("Test Student
   01" …, two of them named with markup) over periods 4, 7 and CAS, and a
   seeded config/class board. It never
   signs in and never reads live data (work-order hard rule: no real student
   names, emails or ids anywhere — not in a log, not in a screenshot).

     node tools/console-layout-smoke.mjs                 run the walk, print counts
     node tools/console-layout-smoke.mjs --shots <dir>   also save screenshots there
     node tools/console-layout-smoke.mjs --chrome <path> Chrome binary (or CHROME=…)

   What it does, and fails on:
     - clicks every sidebar item (the 13 are pinned) and checks that view
       renders its own element with no page error, that exactly that item is
       marked current, and that no view scrolls the page sideways at 1366 px;
     - opens a practice card, a focus-view activity, a paths activity and an
       exit check from the list, and switches all three tabs on each
       (Preview is the default, the other two panes are hidden, the tab
       remembered for the next activity);
     - switches every list filter, folds a unit shut and open again, searches
       by title and by #number, and uses Arrange board and Back to list;
     - checks that clicking a row does not rebuild the list (same element,
       same scroll position), that "Unit" never reads "Module" in the
       Students and Settings panes, and that the minute refresh repaints the
       Students tab (a student marked done in the stub shows up in the tab's
       count, the roll, the done chip and the list row);
     - checks the chips (done + started + not started = the students a card
       is for; a path pick alone is not a start) and an exit check's roll,
       rows and chips against its Who picker;
     - writes through the Settings tab (Hidden, Optional, Pin; then Who,
       release date, Play Along, Move to, Archive, Delete under P4, P7 and
       CAS with the card's song playing) and checks the stub's config/class
       changed, Move to landed in the unit picked, and the Preview pane was
       NOT rebuilt;
     - a rename left open on Settings, then the Students tab: Refresh still
       refreshes (and says why it waits while the box is on screen);
     - picking a row stops the card's song; Arrange board and the sidebar
       stop a TAB playing;
     - Move to Songs re-picks a card the list holds; another console
       archiving a student shows after this console's next write;
     - opens an activity from the board's Preview (its row on screen in a
       shut unit), from a student's "Blocked by" row and from Songs, checks
       Back returns there and the list keeps its own pick;
     - two stub names are markup: every view draws them as text;
     - the units tree under Class activities (2026-11-09): open by default with Built first,
       then the units newest first, then Unsorted; each row's count equals the board's (worked
       out from the stub's board entries) and the list heading's; a click from Songs, from the
       list with a search typed, and from Arrange board shows that one unit with the search
       cleared, the Preview element not rebuilt, and the right row lit; the counts follow an
       assign, an Un-assign and a song moved to the Songs page and back; the fold survives a
       reload (both ways); the tree is hidden at 390 px;
     - measures sideways scroll at 390 px.
   Needs Node 22+ (global WebSocket) and Chrome or Chromium; serves the repo
   itself. Takes about 40 seconds. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const SHOTS = opt('--shots');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg',
  '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json' };

function findChrome() {
  const given = opt('--chrome') || process.env.CHROME;
  if (given) return given;
  const c = platform() === 'darwin'
    ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium']
    : platform() === 'win32'
      ? [process.env['ProgramFiles'] + '\\Google\\Chrome\\Application\\chrome.exe', process.env['ProgramFiles(x86)'] + '\\Google\\Chrome\\Application\\chrome.exe']
      : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return c.find(p => p && existsSync(p));
}
const freePort = () => new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
function serve(dir) {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (p.endsWith('/')) p += 'index.html';
    // No service worker here: it would cache-first the shell across runs.
    if (p === '/sw.js') { res.writeHead(404); res.end(); return; }
    const f = normalize(join(dir, p));
    if (!f.startsWith(dir) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(f));
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}
async function openPage(port) {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const handlers = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else if (m.method) handlers.forEach(h => h(m.method, m.params));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const evalJs = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  return { send, evalJs, on: h => handlers.push(h), close: async () => { try { ws.close(); await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`); } catch { /* gone */ } } };
}
// Network noise that says nothing about our code (the page tries Firebase and Google; nothing is signed in).
const NOISE = /firebase|firestore|googleapis|gstatic|google\.com|youtube|ytimg|net::ERR|Failed to fetch|ERR_|auth\/|identitytoolkit|favicon|Content Security|websocket|WebChannel|offline|Could not reach|NotAllowedError|play\(\) request|AbortError|NotSupportedError|The play\(\)|sw\.js|ServiceWorker/i;

/* The stub: an in-memory Firestore with the calls the console makes (get on a
   doc or a collection, a transaction that merges a patch with FieldValue.delete
   sentinels), plus the seed. Runs in the page. Every name is fake. */
const STUB = String.raw`(() => {
  const DEL = { __del: true };
  const store = new Map();
  window.__store = store;
  const periods = ['4', '7', 'CAS'];
  /* Two names that are markup and an inline-handler breakout: every place a
     name is drawn must show them as text (window.__xss stays unset). Still
     fake — no real student data. */
  const HOSTILE = { '03': 'Evil "><img src=x onerror="window.__xss=(window.__xss||0)+1"> Three', '14': "O'Brien'); window.__xss=14; ('x" };
  window.__hostile = HOSTILE;
  const ids = CLASS_ACTIVITIES.map(a => a.id);
  const has = id => ids.includes(id);
  const board = {};
  const place = (mod, list) => list.filter(has).forEach((id, i) => { board[id] = { module: mod, pos: i + 1 }; });
  place(1, ['ca-1', 'ca-2', 'ca-3', 'ca-4', 'ca-5', 'ca-6', 'ca-7', 'ca-8', 'ca-11', 'ca-14']);
  place(2, ['ca-10', 'ca-12', 'ca-13', 'ca-15', 'ca-17', 'ca-18', 'ca-19', 'ca-20']);
  place(3, ['ca-21', 'ca-22', 'ca-23', 'ca-24', 'ca-25', 'ca-26', 'ca-29', 'ca-30']);
  place(4, ['ca-43', 'ca-46', 'ca-48', 'ca-49']);
  place(0, ['ca-50']);
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return dayStr(d); };
  const dates = {};
  const dated = ['ca-1', 'ca-2', 'ca-3', 'ca-4', 'ca-5', 'ca-6', 'ca-7', 'ca-8', 'ca-11', 'ca-14', 'ca-10', 'ca-12', 'ca-13', 'ca-15', 'ca-17', 'ca-18', 'ca-19', 'ca-20', 'ca-21', 'ca-22', 'ca-24', 'ca-25', 'ca-26', 'ca-43'];
  dated.filter(has).forEach((id, i) => { dates[id] = day(i - dated.length - 6); });
  if (has('ca-46')) dates['ca-46'] = day(0);
  if (has('ca-48')) dates['ca-48'] = day(-1);
  if (has('ca-49')) dates['ca-49'] = day(5);
  const students = [];
  for (let i = 1; i <= 30; i++) {
    const n = String(i).padStart(2, '0');
    const period = i <= 12 ? '4' : i <= 24 ? '7' : 'CAS';
    const done = {}, steps = {};
    Object.keys(dates).forEach((id, k) => { if ((i * 7 + k * 3) % 5 < 3) done[id] = true; else if ((i + k) % 3 === 0) steps[id + ':0'] = true; });
    // A path pick alone (ca-46 is a paths activity) is not a start: the "started" chip must not count these.
    if (has('ca-46') && !done['ca-46'] && !steps['ca-46:0'] && i % 2 === 0) steps['ca-46:path:a'] = true;
    const exitChecks = {};
    ['ca-14', 'ca-15'].filter(has).forEach((cid, ci) => {
      if (i % 4 === ci) return;
      const items = (CLASS_ACTIVITIES.find(a => a.id === cid).check || {}).items || [];
      const type = (CLASS_ACTIVITIES.find(a => a.id === cid).check || {}).type;
      const picks = items.map((it, q) => ((i + q) % 4 === 0) ? 'x' : (type === 'nextNote' ? String(it.answer.fret) : it.answer));
      const score = picks.filter((p, q) => p !== 'x').length;
      exitChecks[cid] = { score, total: items.length, at: day(-3), picks };
      delete done[cid];
    });
    students.push({ uid: 'stub-uid-' + n, name: HOSTILE[n] || 'Test Student ' + n, email: 'student' + n + '@example.test', period,
      classActivities: done, caSteps: steps, exitChecks, skills: {}, responses: {}, migrations: { swap45: true } });
  }
  students.forEach(s => store.set('progress/' + s.uid, s));
  const who = {};
  if (has('ca-48')) who['ca-48'] = { 'stub-uid-01': true, 'stub-uid-02': true, 'stub-uid-13': true };
  // A Who-limited exit check: its Students tab must count only these three.
  if (has('ca-15')) who['ca-15'] = { 'stub-uid-03': true, 'stub-uid-14': true, 'stub-uid-25': true };
  store.set('config/class', { configVersion: 1, gamesEnabled: true, gameOverrides: {}, activityBoard: board, activityBoardSeeded: true,
    activityDates: dates, hiddenActivities: has('ca-22') ? { 'ca-22': true } : {}, optionalActivities: has('ca-23') ? { 'ca-23': true } : {},
    archivedActivities: has('ca-30') ? { 'ca-30': true } : {}, activityPins: ['ca-25', 'ca-46'].filter(has), activityStudents: who,
    // One archived student: off every count, the list's and the board's alike.
    archived: { 'stub-uid-05': true } });
  const clone = v => v === undefined ? v : JSON.parse(JSON.stringify(v));
  const merge = (dst, src) => { Object.keys(src).forEach(k => { const v = src[k];
    if (v && v.__del) delete dst[k];
    else if (v && typeof v === 'object' && !Array.isArray(v)) { if (!dst[k] || typeof dst[k] !== 'object' || Array.isArray(dst[k])) dst[k] = {}; merge(dst[k], v); }
    else dst[k] = clone(v); }); return dst; };
  const snapOf = p => ({ exists: store.has(p), data: () => clone(store.get(p)), id: p.split('/').pop(), ref: docRef(p) });
  function docRef(p){ return { path: p, get: async () => snapOf(p),
    set: async (d, o) => { store.set(p, o && o.merge ? merge(clone(store.get(p) || {}), d) : clone(d)); },
    update: async d => store.set(p, merge(clone(store.get(p) || {}), d)), delete: async () => store.delete(p), collection: n => colRef(p + '/' + n) }; }
  function colRef(p){ const q = { doc: id => docRef(p + '/' + id), orderBy: () => q, limit: () => q, where: () => q,
    get: async () => { const docs = [...store.keys()].filter(k => k.startsWith(p + '/') && k.slice(p.length + 1).indexOf('/') < 0).map(snapOf);
      return { docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) }; } }; return q; }
  const fdb = { collection: n => colRef(n), runTransaction: async fn => fn({ get: r => r.get(), set: (r, d, o) => r.set(d, o), update: (r, d) => r.update(d) }) };
  window.db = fdb; try { db = fdb; } catch (e) {}
  window.ensureDb = async () => fdb; try { ensureDb = window.ensureDb; } catch (e) {}
  window.firebase = window.firebase || {};
  firebase.firestore = Object.assign(firebase.firestore || {}, { FieldValue: { serverTimestamp: () => 'ts', delete: () => DEL, increment: n => n } });
  window.confirm = () => true; window.alert = m => { window.__alerts = (window.__alerts || []).concat(String(m)); };
  window.prompt = () => null;
  try { navigator.clipboard.writeText = async () => {}; } catch (e) {}
  return students.length;
})()`;

async function main() {
  const chrome = findChrome();
  if (!chrome) { console.error('console-layout-smoke: no Chrome/Chromium found — pass --chrome <path> or set CHROME'); process.exit(2); }
  if (typeof WebSocket === 'undefined') { console.error('console-layout-smoke: needs Node 22+ (global WebSocket)'); process.exit(2); }
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });
  const { srv, port } = await serve(ROOT);
  const prof = mkdtempSync(join(tmpdir(), 'gc-console-chrome-'));
  const cdp = await freePort();
  const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-gpu',
    '--autoplay-policy=no-user-gesture-required', 'about:blank'], { stdio: 'ignore' });
  const fails = [];
  const stats = { views: 0, activities: 0, tabs: 0, filters: 0, folds: 0, searches: 0, board: 0, repaint: 0, writes: 0, backs: 0, shots: [] };
  const fail = (step, msg) => fails.push(step + ': ' + msg);
  let page;
  try {
    for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }
    page = await openPage(cdp);
    const pageErrors = [];
    page.on((method, params) => {
      if (method === 'Runtime.exceptionThrown') { const d = params.exceptionDetails; pageErrors.push((d.exception && d.exception.description) || d.text); }
      if (method === 'Runtime.consoleAPICalled' && params.type === 'error') pageErrors.push(params.args.map(a => a.value || a.description || '').join(' '));
    });
    await page.send('Runtime.enable'); await page.send('Page.enable');
    const size = async (w, h) => page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    const shot = async (name) => {
      if (!SHOTS) return;
      const r = await page.send('Page.captureScreenshot', { format: 'png' });
      const f = join(SHOTS, name + '.png'); writeFileSync(f, Buffer.from(r.data, 'base64')); stats.shots.push(f);
    };
    const js = (expr) => page.evalJs(expr);
    const errsSince = (n) => pageErrors.slice(n).filter(t => !NOISE.test(t || ''));
    // The two stub names that are markup: drawn as text, they add no element and run nothing.
    const xss = async (where) => {
      const r = await js(`({ ran: window.__xss, imgs: document.querySelectorAll('img[src="x"]').length })`);
      if (r.ran !== undefined || r.imgs) fail('names:' + where, 'a student name was drawn as markup (' + JSON.stringify(r) + ')');
      stats.xss = (stats.xss || 0) + 1;
    };
    await size(1366, 768);
    // Loads the console fresh against a new stub. Run again to prove what survives a reload (the units tree's fold).
    const bootConsole = async () => {
      await page.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html?teacher=true` });
      for (let i = 0; i < 80; i++) { await sleep(150); if (await js(`typeof ensureTeacherJs === 'function' && typeof CLASS_ACTIVITIES !== 'undefined'`).catch(() => false)) break; }
      await js(`ensureTeacherJs()`);
      for (let i = 0; i < 80; i++) { await sleep(100); if (await js(`typeof showTeacherApp === 'function'`)) break; }
      const n = await js(STUB);
      await js(`showTeacherApp({ uid: 'stub-teacher', email: TEACHER_EMAIL, displayName: 'Teacher' }).catch(e => { window.__showErr = e.message; })`);
      for (let i = 0; i < 80; i++) { await sleep(100); if (await js(`!!document.querySelector('#t-grid-container [data-ta-list]')`)) break; }
      return n;
    };
    const nStu = await bootConsole();
    const boot = await js(`({ err: window.__showErr || null, view: teacherView, side: document.querySelectorAll('#t-side [data-view]').length,
      current: [...document.querySelectorAll('#t-side [aria-current="page"]')].map(b => b.dataset.view),
      list: !!document.querySelector('[data-ta-list]'), rows: document.querySelectorAll('[data-ta-pick]').length,
      picked: activityDetailId, students: allStudentsRaw.length })`);
    if (boot.err) fail('boot', 'showTeacherApp threw ' + boot.err);
    if (boot.view !== 'activities' || !boot.list) fail('boot', 'the console did not open on the Class activities list (view ' + boot.view + ')');
    if (boot.side !== 13) fail('boot', 'the sidebar has ' + boot.side + ' items, expected 13');
    if (JSON.stringify(boot.current) !== '["activities"]') fail('boot', 'the current sidebar item is ' + JSON.stringify(boot.current));
    if (boot.students !== nStu) fail('boot', 'the console read ' + boot.students + ' students, the stub has ' + nStu);
    await sleep(300);
    await shot('01-console-on-load-1366');

    // ── Every sidebar item ──
    /* Each view's own element (and, where the stub leaves a view empty, its
       own words): a view name the body has no painter for leaves the last
       view's content up, which a "rendered something" test can't tell apart. */
    const MARKERS = { activities: ['[data-ta-split]'], songs: ['.t-songs'], tsongs: ['[data-tvs]'], livequiz: ['.lq-shell'], students: ['.stu-chart'],
      skills: ['td.nc[data-open-student]'], trouble: ['.tr-meta', /least-mastered skills/], minutes: ['.pm-t-table'], responses: ['.t-loading', /written a response/],
      manage: ['[data-set-open-through]'], games: ['[data-set-games]'], mic: ['.tg-class', /Collect mic recordings/], reports: ['.t-loading', /issue reports/] };
    const views = await js(`[...document.querySelectorAll('#t-side [data-view]')].map(b => b.dataset.view)`);
    if (JSON.stringify(views.slice().sort()) !== JSON.stringify(Object.keys(MARKERS).sort())) fail('sidebar', 'the sidebar views are ' + JSON.stringify(views) + ', expected ' + JSON.stringify(Object.keys(MARKERS)));
    for (const v of views) {
      const n0 = pageErrors.length;
      await js(`document.querySelector('#t-side [data-view="${v}"]').click()`);
      await sleep(v === 'activities' ? 400 : 250);
      const r = await js(`({ view: teacherView, cur: [...document.querySelectorAll('#t-side [aria-current="page"]')].map(b => b.dataset.view),
        text: document.getElementById('t-grid-container').innerText.length, sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        legend: getComputedStyle(document.getElementById('t-legend')).display, tabs: getComputedStyle(document.getElementById('t-week-tabs')).display })`);
      if (r.view !== v) fail('view:' + v, 'teacherView is ' + r.view);
      if (JSON.stringify(r.cur) !== JSON.stringify([v])) fail('view:' + v, 'current item ' + JSON.stringify(r.cur));
      if (!r.text) fail('view:' + v, 'rendered nothing');
      const mk = MARKERS[v];
      if (!mk) fail('view:' + v, 'no such view (no marker for it)');
      else {
        const m = await js(`(() => { const box = document.getElementById('t-grid-container'); return { el: !!box.querySelector(${JSON.stringify(mk[0])}), text: box.innerText }; })()`);
        if (!m.el || (mk[1] && !mk[1].test(m.text))) fail('view:' + v, 'its own content is not on screen (' + mk[0] + (mk[1] ? ' ' + mk[1] : '') + '): ' + JSON.stringify(m.text.slice(0, 80)));
      }
      if (r.sideways > 0) fail('view:' + v, 'page scrolls sideways by ' + r.sideways + 'px at 1366');
      if ((v === 'skills') !== (r.legend !== 'none' && r.tabs !== 'none')) fail('view:' + v, 'the Skills grid legend/set tabs are ' + r.legend + '/' + r.tabs);
      const e = errsSince(n0); if (e.length) fail('view:' + v, 'page error: ' + e[0]);
      stats.views++;
      if (v === 'skills') await shot('05-skills-grid-1366');
      if (v === 'manage') await shot('06-manage-1366');
    }
    await xss('every sidebar view');
    await js(`setTeacherView('activities')`); await sleep(400);

    // ── Filters, folds, search ──
    const filters = await js(`[...document.querySelectorAll('[data-ta-filter]')].map(b => b.dataset.taFilter)`);
    if (JSON.stringify(filters) !== JSON.stringify(['units', 'week', 'pins', 'undated', 'all'])) fail('filters', 'filter buttons are ' + JSON.stringify(filters));
    const defFilter = await js(`document.querySelector('[data-ta-filter][aria-pressed="true"]')?.dataset.taFilter`);
    if (defFilter !== 'units') fail('filters', 'the default filter is ' + defFilter);
    const units = await js(`(() => { const h = [...document.querySelectorAll('[data-ta-unit]')]; return h.map(x => ({ key: x.dataset.taUnit, open: x.getAttribute('aria-expanded') === 'true', text: x.innerText.replace(/\\s+/g, ' ').trim() })); })()`);
    if (!units.length || !/^Unit 4\b/.test(units[0].text) || !units[0].open || units.slice(1).some(u => u.open)) fail('units', 'expected Unit 4 first and the only one open: ' + JSON.stringify(units.map(u => u.text + (u.open ? ' (open)' : ''))));
    if (units.some(u => /Module/.test(u.text))) fail('units', 'a unit heading says Module: ' + units.map(u => u.text).join(' | '));
    for (const f of filters) {
      const n0 = pageErrors.length;
      await js(`document.querySelector('[data-ta-filter="${f}"]').click()`); await sleep(120);
      const r = await js(`({ rows: document.querySelectorAll('[data-ta-list-body] [data-ta-pick]').length, on: document.querySelector('[data-ta-filter][aria-pressed="true"]')?.dataset.taFilter, heads: document.querySelectorAll('[data-ta-list-body] [data-ta-unit]').length })`);
      if (r.on !== f) fail('filter:' + f, 'pressed is ' + r.on);
      if (f !== 'units' && r.heads) fail('filter:' + f, 'a flat filter shows ' + r.heads + ' unit headings');
      if (f === 'pins' && r.rows !== 2) fail('filter:pins', r.rows + ' rows, the stub pins 2');
      if (f === 'all' && r.rows < 30) fail('filter:all', 'only ' + r.rows + ' rows');
      const e = errsSince(n0); if (e.length) fail('filter:' + f, 'page error: ' + e[0]);
      stats.filters++;
    }
    await js(`document.querySelector('[data-ta-filter="units"]').click()`); await sleep(120);
    for (const step of ['shut', 'open']) {
      const r = await js(`(() => { const h = document.querySelector('[data-ta-unit="1"]'); h.click(); const h2 = document.querySelector('[data-ta-unit="1"]'); return { open: h2.getAttribute('aria-expanded') === 'true', rows: h2.closest('.ta-unit').querySelectorAll('[data-ta-pick]').length }; })()`);
      // Unit 1 starts shut (only the newest is open): the first click opens it, the second shuts it.
      const wantOpen = step === 'shut';
      if (r.open !== wantOpen || (wantOpen ? r.rows === 0 : r.rows !== 0)) fail('fold', `after click ${step === 'shut' ? 1 : 2} Unit 1 is ${r.open ? 'open' : 'shut'} with ${r.rows} rows`);
      stats.folds++;
    }
    const search = async (q) => js(`(() => { const box = document.querySelector('[data-ta-search]'); box.value = ${JSON.stringify(q)}; box.dispatchEvent(new Event('input', { bubbles: true }));
      return [...document.querySelectorAll('[data-ta-list-body] [data-ta-pick]')].map(r => r.dataset.id); })()`);
    const byNum = await js(`(() => { const v = teacherBoardView(teacherClassConfig); const id = Object.keys(v.number).find(k => v.number[k] === 5); return id; })()`);
    const s1 = await search('#5');
    if (!byNum || !s1.includes(byNum)) fail('search', '"#5" found ' + JSON.stringify(s1) + ', expected ' + byNum);
    stats.searches++;
    const title18 = await js(`teacherActivityTitle(CLASS_ACTIVITIES.find(a => a.id === 'ca-18'), teacherClassConfig)`);
    const word = title18.split(/\s+/).filter(w => w.length > 4)[0] || title18;
    const s2 = await search(word);
    if (!s2.includes('ca-18')) fail('search', JSON.stringify(word) + ' did not find ca-18 (' + JSON.stringify(s2) + ')');
    stats.searches++;
    const s3 = await search('zzzz no such activity');
    if (s3.length) fail('search', 'nonsense matched ' + s3.length);
    const empty = await js(`!!document.querySelector('[data-ta-list-body] .ta-list-empty')`);
    if (!empty) fail('search', 'no "nothing matches" line for an empty search');
    stats.searches++;
    await search('');

    // ── Open four kinds of activity; switch every tab ──
    const kinds = [['card', 'ca-18'], ['focus', 'ca-21'], ['paths', 'ca-46'], ['check', 'ca-14']];
    let firstPick = true;
    for (const [kind, id] of kinds) {
      const n0 = pageErrors.length;
      await js(`document.querySelector('[data-ta-filter="all"]').click()`); await sleep(80);
      const before = await js(`(() => { const body = document.querySelector('[data-ta-list-body]'); body.scrollTop = 200; window.__listEl = body; window.__listY = body.scrollTop; return body.scrollTop; })()`);
      await js(`document.querySelector('[data-ta-pick][data-id="${id}"]').click()`); await sleep(250);
      const r = await js(`(() => { const body = document.querySelector('[data-ta-list-body]');
        const tabs = [...document.querySelectorAll('[data-ta-tab]')].map(t => ({ tab: t.dataset.taTab, sel: t.getAttribute('aria-selected') === 'true', text: t.innerText.trim() }));
        const panes = [...document.querySelectorAll('[data-ta-pane]')].map(p => ({ pane: p.dataset.taPane, hidden: p.hidden }));
        return { picked: activityDetailId, sameList: body === window.__listEl, scroll: body.scrollTop, sel: [...document.querySelectorAll('[data-ta-pick].is-sel')].map(x => x.dataset.id),
          tabs, panes, head: (document.querySelector('[data-ta-head]') || {}).innerText || '' }; })()`);
      if (r.picked !== id) fail('open:' + kind, 'picked is ' + r.picked);
      if (!r.sameList) fail('open:' + kind, 'clicking a row rebuilt the list');
      if (r.scroll !== before) fail('open:' + kind, 'the list scrolled from ' + before + ' to ' + r.scroll);
      if (JSON.stringify(r.sel) !== JSON.stringify([id])) fail('open:' + kind, 'selected rows ' + JSON.stringify(r.sel));
      if (JSON.stringify(r.tabs.map(t => t.tab)) !== '["preview","students","settings"]') fail('open:' + kind, 'tabs are ' + JSON.stringify(r.tabs));
      if (firstPick && !(r.tabs[0] && r.tabs[0].sel)) fail('open:' + kind, 'Preview is not the default tab');
      if (!/^Students \d+\/\d+$/.test((r.tabs[1] || {}).text || '')) fail('open:' + kind, 'Students tab label is ' + JSON.stringify((r.tabs[1] || {}).text));
      if (!/Unit \d|Unsorted/.test(r.head) || /Module/.test(r.head)) fail('open:' + kind, 'header says ' + JSON.stringify(r.head.slice(0, 120)));
      firstPick = false;
      for (const tab of ['preview', 'students', 'settings']) {
        await js(`document.querySelector('[data-ta-tab="${tab}"]').click()`); await sleep(120);
        const t = await js(`(() => { const p = [...document.querySelectorAll('[data-ta-pane]')]; const vis = p.filter(x => !x.hidden);
          return { vis: vis.map(x => x.dataset.taPane), sel: [...document.querySelectorAll('[data-ta-tab][aria-selected="true"]')].map(x => x.dataset.taTab), len: vis[0] ? vis[0].innerText.length : 0,
            module: vis[0] ? (/.{0,40}\\bModule\\b.{0,40}/.exec(vis[0].innerText) || [''])[0] : '',
            card: !!(vis[0] && vis[0].querySelector('.pc')), check: !!(vis[0] && vis[0].querySelector('[id^="ec-preview-body-"]')), live: vis[0] ? vis[0].querySelectorAll('[data-ta-live]').length : 0,
            sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth }; })()`);
        if (JSON.stringify(t.vis) !== JSON.stringify([tab]) || JSON.stringify(t.sel) !== JSON.stringify([tab])) fail(`tab:${kind}:${tab}`, 'visible ' + JSON.stringify(t.vis) + ', selected ' + JSON.stringify(t.sel));
        if (!t.len) fail(`tab:${kind}:${tab}`, 'the pane is empty');
        // The console says Unit; Module is the student side's word.
        if (tab !== 'preview' && t.module) fail(`tab:${kind}:${tab}`, 'the pane says Module: ' + JSON.stringify(t.module));
        if (tab === 'preview' && kind === 'card' && !t.card) fail('tab:card:preview', 'no practice card in the Preview');
        if (tab === 'preview' && kind === 'check' && !t.check) fail('tab:check:preview', 'no exit-check preview');
        if (tab === 'students' && !t.live) fail(`tab:${kind}:students`, 'no [data-ta-live] boxes in the Students pane');
        if (t.sideways > 0) fail(`tab:${kind}:${tab}`, 'page scrolls sideways by ' + t.sideways + 'px');
        stats.tabs++;
        if (SHOTS && kind === 'card') await shot(`02-units-${id}-${tab}-1366`);
      }
      // The tab is remembered: the next activity opens on Settings (the last one clicked).
      const e = errsSince(n0); if (e.length) fail('open:' + kind, 'page error: ' + e[0]);
      stats.activities++;
    }
    await xss('four activities x three tabs');
    const remembered = await js(`(() => { document.querySelector('[data-ta-pick][data-id="ca-21"]').click(); return document.querySelector('[data-ta-tab][aria-selected="true"]')?.dataset.taTab; })()`);
    if (remembered !== 'settings') fail('tab-memory', 'the next activity opened on ' + remembered + ', not the last tab used (settings)');

    // ── The minute refresh repaints the Students tab (a student finishes in the stub) ──
    {
      await js(`document.querySelector('[data-ta-pick][data-id="ca-21"]').click()`); await sleep(150);
      await js(`document.querySelector('[data-ta-tab="students"]').click()`); await sleep(80);
      const read = `(() => { const pane = document.querySelector('[data-ta-pane="students"]');
        const chips = Object.fromEntries([...pane.querySelectorAll('[data-ta-live="counts"] .ta-count')].map(c => [c.className.replace(/.*ta-count-(\\w+).*/, '$1'), Number((c.querySelector('b') || {}).innerText)]));
        return { label: document.querySelector('[data-ta-tab="students"]').innerText.trim(), done: (pane.querySelector('.ta-roll-done .ta-roll-head') || {}).innerText || '',
          row: (document.querySelector('[data-ta-pick][data-id="ca-21"] .ta-row-done') || {}).innerText || '', chips }; })()`;
      const before = await js(read);
      const uid = await js(`(() => { const s = allStudents.find(x => (x.classActivities || {})['ca-21'] !== true); if (!s) return null;
        const d = __store.get('progress/' + s.uid); d.classActivities = Object.assign({}, d.classActivities, { 'ca-21': true }); __store.set('progress/' + s.uid, d); return s.uid; })()`);
      if (!uid) fail('repaint', 'every stub student already finished ca-21');
      else {
        // The timer's own path (not teacherRepaintActivityStudents called by hand).
        const ran = await js(`(async () => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); const at = teacherStudentsAt = teacherStudentsAt - 70000; await teacherRefreshStudents(); return teacherStudentsAt !== at; })()`);
        await sleep(150);
        const after = await js(read);
        const n = t => Number((/(\d+)\//.exec(t) || [])[1]);
        const d = t => Number((/\((\d+)\)/.exec(t) || [])[1]);
        if (!ran) fail('repaint', 'the minute refresh did not run');
        if (n(after.label) !== n(before.label) + 1) fail('repaint', 'after the minute refresh the tab label went ' + before.label + ' -> ' + after.label);
        if (d(after.done) !== d(before.done) + 1) fail('repaint', 'after the minute refresh the Done column went ' + before.done + ' -> ' + after.done);
        if (n(after.row) !== n(before.row) + 1) fail('repaint', 'after the minute refresh the list row went ' + before.row + ' -> ' + after.row);
        if (after.chips.done !== before.chips.done + 1) fail('repaint', 'after the minute refresh the done chip went ' + before.chips.done + ' -> ' + after.chips.done);
        stats.repaint++;
      }
      if (!/\d+\/\d+ done/.test(before.row)) fail('repaint', 'the list row reads ' + JSON.stringify(before.row));
    }

    // ── The Students tab's chips: done + started + not started = the students it is for ──
    for (const id of ['ca-21', 'ca-46', 'ca-48']) {
      await js(`document.querySelector('[data-ta-pick][data-id="${id}"]').click()`); await sleep(120);
      const r = await js(`(() => { const a = CLASS_ACTIVITIES.find(x => x.id === ${JSON.stringify(id)}), cfg = teacherClassConfig, pre = a.id + ':';
        const forIt = allStudents.filter(s => teacherActivityForStudent(a, s.uid, cfg));
        const isDone = s => (s.classActivities || {})[a.id] === true;
        const ticked = s => Object.keys(s.caSteps || {}).filter(k => s.caSteps[k] && k.startsWith(pre));
        const want = { total: forIt.length, done: forIt.filter(isDone).length, started: forIt.filter(s => !isDone(s) && ticked(s).some(k => !k.startsWith(pre + 'path:'))).length,
          pathOnly: forIt.filter(s => !isDone(s) && ticked(s).length && ticked(s).every(k => k.startsWith(pre + 'path:'))).length };
        const pane = document.querySelector('[data-ta-pane="students"]');
        const chip = k => { const c = pane.querySelector('[data-ta-live="counts"] .ta-count-' + k + ' b'); return c ? Number(c.innerText) : null; };
        const tab = /(\\d+)\\/(\\d+)/.exec(document.querySelector('[data-ta-tab="students"]').innerText) || [];
        return { want, got: { done: chip('done'), started: chip('started'), not: chip('not'), tabDone: +tab[1], tabTotal: +tab[2] } }; })()`);
      const { want, got } = r;
      if (got.done + got.started + got.not !== want.total) fail('chips:' + id, `done ${got.done} + started ${got.started} + not started ${got.not} != ${want.total} students it is for`);
      if (got.done !== want.done || got.started !== want.started || got.not !== want.total - want.done - want.started) fail('chips:' + id, 'chips ' + JSON.stringify(got) + ', the stub says ' + JSON.stringify(want));
      if (got.tabDone !== want.done || got.tabTotal !== want.total) fail('chips:' + id, 'tab label ' + got.tabDone + '/' + got.tabTotal + ', the stub says ' + want.done + '/' + want.total);
      if (id === 'ca-46' && !want.pathOnly) fail('chips:ca-46', 'the stub has no student with only a path pick — the "a path pick is not a start" case is not tested');
      stats.chips = (stats.chips || 0) + 1;
    }

    // ── Settings writes: the stub changes, the Preview is not rebuilt ──
    {
      await js(`document.querySelector('[data-ta-pick][data-id="ca-18"]').click()`); await sleep(200);
      await js(`window.__prevEl = document.querySelector('[data-ta-pane="preview"]').firstElementChild`);
      await js(`document.querySelector('[data-ta-tab="settings"]').click()`); await sleep(60);
      const steps = [
        ['hidden', `[data-ta-pane="settings"] [data-set-activity-hidden][data-state="hide"]`, `(__store.get('config/class').hiddenActivities || {})['ca-18'] === true`],
        ['shown', `[data-ta-pane="settings"] [data-set-activity-hidden][data-state="show"]`, `!(__store.get('config/class').hiddenActivities || {})['ca-18']`],
        ['optional', `[data-ta-pane="settings"] [data-set-activity-optional][data-state="optional"]`, `(__store.get('config/class').optionalActivities || {})['ca-18'] === true`],
        ['required', `[data-ta-pane="settings"] [data-set-activity-optional][data-state="required"]`, `(__store.get('config/class').optionalActivities || {})['ca-18'] === false || !('ca-18' in (__store.get('config/class').optionalActivities || {}))`],
        ['pin', `[data-ta-head] [data-set-activity-pin][data-state="on"]`, `(__store.get('config/class').activityPins || []).includes('ca-18')`],
        ['unpin', `[data-ta-head] [data-set-activity-pin][data-state="off"]`, `!(__store.get('config/class').activityPins || []).includes('ca-18')`],
      ];
      for (const [name, sel, ok] of steps) {
        const n0 = pageErrors.length;
        const found = await js(`(() => { const b = document.querySelector(${JSON.stringify(sel)}); if (!b) return false; b.click(); return true; })()`);
        if (!found) { fail('write:' + name, 'no control ' + sel); continue; }
        await sleep(350);
        const r = await js(`({ ok: ${ok}, same: document.querySelector('[data-ta-pane="preview"]').firstElementChild === window.__prevEl, alerts: (window.__alerts || []).length,
          tab: document.querySelector('[data-ta-tab][aria-selected="true"]')?.dataset.taTab })`);
        if (!r.ok) fail('write:' + name, 'config/class in the stub did not change');
        if (!r.same) fail('write:' + name, 'the Preview pane was rebuilt (a song playing there would stop)');
        if (r.alerts) fail('write:' + name, 'an alert: ' + await js(`window.__alerts.join(' | ')`));
        if (r.tab !== 'settings') fail('write:' + name, 'the tab jumped to ' + r.tab);
        const e = errsSince(n0); if (e.length) fail('write:' + name, 'page error: ' + e[0]);
        stats.writes++;
      }
    }

    // ── The list's counts are the board's (doneSummary), under All and under P4 ──
    {
      const cmp = async () => js(`(() => { const cfg = teacherClassConfig, acts = teacherActivityListActivities(cfg), kit = teacherActivityCtlKit(cfg, acts);
        const per = { '4': 'P4', '7': 'P7', 'CAS': 'CAS', 'none': 'Unassigned', all: null }[teacherPeriodFilter];
        const bad = []; let n = 0;
        acts.filter(a => kit.view.assigned[a.id]).forEach(a => {
          const html = kit.doneSummary(a); let done = 0, total = 0;
          for (const m of html.matchAll(/<strong>([^:<]+): (\\d+) \\/ (\\d+) (?:done|turned in)/g)) if (!per || m[1] === per) { done += +m[2]; total += +m[3]; }
          const c = teacherActivityDoneCounts(a, cfg); n++;
          if (c.done !== done || c.total !== total) bad.push(a.id + ' list ' + c.done + '/' + c.total + ' board ' + done + '/' + total);
          const row = document.querySelector('[data-ta-pick][data-id="' + a.id + '"] .ta-row-done');
          if (row && !row.innerText.startsWith(c.done + '/' + c.total + ' ')) bad.push(a.id + ' row reads ' + row.innerText);
        });
        return { n, bad }; })()`);
      await js(`document.querySelector('[data-ta-filter="all"]').click()`); await sleep(100);
      const all = await cmp();
      await js(`teacherSetPeriodFilter('4')`); await sleep(300);
      const p4 = await cmp();
      await js(`teacherSetPeriodFilter('all')`); await sleep(300);
      if (!all.n || all.bad.length) fail('counts:all', all.n + ' cards, ' + all.bad.slice(0, 4).join('; '));
      if (!p4.n || p4.bad.length) fail('counts:P4', p4.n + ' cards, ' + p4.bad.slice(0, 4).join('; '));
      stats.counts = all.n + p4.n;
      // A Who-limited exit check: the tab, the chips and the note all count the same three students.
      await js(`document.querySelector('[data-ta-pick][data-id="ca-15"]').click()`); await sleep(200);
      await js(`document.querySelector('[data-ta-tab="students"]').click()`); await sleep(60);
      const chk = await js(`(() => { const pane = document.querySelector('[data-ta-pane="students"]'), grid = pane.querySelector('[data-ta-live="grid"]');
        const chip = k => { const c = pane.querySelector('[data-ta-live="counts"] .ta-count-' + k + ' b'); return c ? Number(c.innerText) : null; };
        const head = k => Number((/\\((\\d+)\\)/.exec((grid.querySelector('.ta-roll-' + k + ' .ta-roll-head') || {}).innerText || '') || [])[1]);
        return { tab: document.querySelector('[data-ta-tab="students"]').innerText.trim(), note: pane.querySelector('[data-ta-live="note"]').innerText,
          rows: [...grid.querySelectorAll('tbody tr')].filter(tr => !/^Missed by/.test(tr.innerText.trim())).length,
          names: [...grid.querySelectorAll('tbody tr td.nc')].map(td => td.innerText).filter(t => t !== 'Missed by'),
          rollDone: head('done'), rollNot: head('not'), chipIn: chip('done'), chipOut: chip('not') }; })()`);
      const tabN = (/(\d+)\/(\d+)/.exec(chk.tab) || []), noteN = (/(\d+) of (\d+) turned in/.exec(chk.note) || []);
      if (tabN[2] !== '3' || noteN[2] !== '3' || tabN[1] !== noteN[1]) fail('counts:who-check', 'ca-15 tab ' + chk.tab + ', note "' + (noteN[0] || chk.note.slice(0, 80)) + '"');
      // The roll, the result rows and the chips count the same three students the Who picker names.
      if (chk.rows !== 3) fail('counts:who-check', 'ca-15 shows ' + chk.rows + ' student rows, the Who picker names 3');
      if (chk.rollDone + chk.rollNot !== 3 || String(chk.rollDone) !== tabN[1]) fail('counts:who-check', `ca-15 roll Done (${chk.rollDone}) + Not done (${chk.rollNot}), the tab says ${chk.tab}`);
      if (chk.chipIn + chk.chipOut !== 3 || String(chk.chipIn) !== tabN[1]) fail('counts:who-check', `ca-15 chips ${chk.chipIn} turned in + ${chk.chipOut} not, the tab says ${chk.tab}`);
      const who15 = await js(`Object.keys(teacherClassConfig.activityStudents['ca-15']).map(u => allStudents.find(s => s.uid === u)).filter(Boolean).map(s => s.name).sort()`);
      if (JSON.stringify(chk.names.slice().sort()) !== JSON.stringify(who15)) fail('counts:who-check', 'ca-15 rows name ' + JSON.stringify(chk.names) + ', the Who picker ' + JSON.stringify(who15));
    }

    // ── A write and a refresh keep the list's scroll and the Preview ──
    {
      await js(`document.querySelector('[data-ta-filter="all"]').click()`); await sleep(100);
      await js(`document.querySelector('[data-ta-pick][data-id="ca-18"]').click()`); await sleep(200);
      await js(`document.querySelector('[data-ta-tab="settings"]').click()`); await sleep(60);
      const y0 = await js(`(() => { const b = document.querySelector('[data-ta-list-body]'); b.scrollTop = 600; window.__prevEl = document.querySelector('[data-ta-pane="preview"]').firstElementChild; return b.scrollTop; })()`);
      if (y0 < 300) fail('scroll', 'the list could only scroll to ' + y0 + 'px');
      await js(`document.querySelector('[data-ta-pane="settings"] [data-set-activity-hidden][data-state="hide"]').click()`); await sleep(400);
      const y1 = await js(`document.querySelector('[data-ta-list-body]').scrollTop`);
      if (y1 !== y0) fail('scroll', 'a Settings write moved the list from ' + y0 + ' to ' + y1);
      await js(`document.querySelector('[data-ta-pane="settings"] [data-set-activity-hidden][data-state="show"]').click()`); await sleep(400);
      for (const manual of [false, true]) {
        const r = await js(`(async () => { document.activeElement && document.activeElement.blur && document.activeElement.blur(); const at = teacherStudentsAt = teacherStudentsAt - 70000;
          await teacherRefreshStudents(${manual ? '{ manual: true }' : ''}); await new Promise(r => setTimeout(r, 400));
          return { ran: teacherStudentsAt !== at, same: document.querySelector('[data-ta-pane="preview"]').firstElementChild === window.__prevEl, y: document.querySelector('[data-ta-list-body]').scrollTop }; })()`);
        const what = manual ? 'the Refresh button' : 'the minute refresh';
        if (!r.ran) fail('refresh', what + ' did not run');
        if (!r.same) fail('refresh', what + ' rebuilt the Preview (a song playing there would stop)');
        if (r.y !== y0) fail('refresh', what + ' moved the list from ' + y0 + ' to ' + r.y);
        stats.refreshes = (stats.refreshes || 0) + 1;
      }
    }

    // ── A rename left open on Settings, then the Students tab: the Refresh button still refreshes ──
    {
      const label = async () => js(`document.querySelector('[data-ta-tab="students"]').innerText.trim()`);
      const n = t => Number((/(\d+)\//.exec(t) || [])[1]);
      await js(`document.querySelector('[data-ta-filter="all"]').click()`); await sleep(80);
      await js(`document.querySelector('[data-ta-pick][data-id="ca-21"]').click()`); await sleep(150);
      const ed = await js(`(async () => { const d = document.querySelector('[data-ta-head] details[data-ta-more]'); d.open = true; d.querySelector('[data-ta-rename]').click();
        await new Promise(r => setTimeout(r, 100)); return !!document.querySelector('[data-ta-pane="settings"]:not([hidden]) .t-act-title-edit'); })()`);
      if (!ed) fail('rename-refresh', 'More > Rename… did not open the editor on the Settings tab');
      // On screen, the editor holds a Refresh back, and the bar says why.
      const held = await js(`(async () => { document.querySelector('[data-refresh-students]').click(); await new Promise(r => setTimeout(r, 300)); return document.querySelector('[data-refresh-when]').innerText; })()`);
      if (!/^Not refreshed: a rename is open/.test(held)) fail('rename-refresh', 'Refresh with the rename box on screen: the bar says ' + JSON.stringify(held));
      await js(`document.querySelector('[data-ta-tab="students"]').click()`); await sleep(80);
      const lab0 = await label();
      await js(`(() => { const s = allStudents.find(x => (x.classActivities || {})['ca-21'] !== true); const d = __store.get('progress/' + s.uid); d.classActivities = Object.assign({}, d.classActivities, { 'ca-21': true }); __store.set('progress/' + s.uid, d); })()`);
      await js(`document.querySelector('[data-refresh-students]').click()`); await sleep(700);
      const lab1 = await label();
      const st = await js(`({ edit: activityEditId, bar: document.querySelector('[data-refresh-when]').innerText, editor: !!document.querySelector('.t-act-title-edit') })`);
      if (n(lab1) !== n(lab0) + 1) fail('rename-refresh', 'rename opened, then the Students tab: Refresh left the tab at ' + lab0 + ' -> ' + lab1 + ' (bar: ' + JSON.stringify(st.bar) + ')');
      if (st.edit || st.editor) fail('rename-refresh', 'leaving Settings left the rename editor open (activityEditId ' + st.edit + ')');
      stats.renameRefresh = 1;
    }

    // ── Picking a row stops the song; Arrange board and the sidebar stop a TAB playing ──
    {
      await js(`document.querySelector('[data-ta-pick][data-id="ca-18"]').click()`); await sleep(150);
      await js(`document.querySelector('[data-ta-tab="preview"]').click()`); await sleep(60);
      const r = await js(`(() => { document.querySelector('[data-ta-pane="preview"] .pc-play').click(); const on = !!pcState;
        document.querySelector('[data-ta-pick][data-id="ca-17"]').click(); return { on, after: !!pcState }; })()`);
      if (!r.on) fail('audio:pick', 'the practice card ca-18 did not start its song');
      else if (r.after) fail('audio:pick', 'picking another row left ca-18\'s song playing');
      const tabAct = await js(`(() => { for (const id of ['ca-46', ...[...document.querySelectorAll('[data-ta-pick]')].map(x => x.dataset.id)]) {
        const row = document.querySelector('[data-ta-pick][data-id="' + id + '"]'); if (!row) continue; row.click(); if (document.querySelector('[data-ta-pane="preview"] .play-seq-btn')) return id; } return null; })()`);
      if (!tabAct) fail('audio:tab', 'no activity on the stub board has a TAB player in its Preview');
      else {
        for (const [name, code] of [['Arrange board', `document.querySelector('[data-ta-board-open]').click()`], ['the sidebar (Skills grid)', `document.querySelector('#t-side [data-view="skills"]').click()`]]) {
          await js(`setTeacherView('activities')`); await sleep(400);
          await js(`(() => { document.querySelector('[data-ta-filter="all"]').click(); document.querySelector('[data-ta-pick][data-id="${tabAct}"]').click(); document.querySelector('[data-ta-tab="preview"]').click(); })()`); await sleep(100);
          await js(`document.querySelector('[data-ta-pane="preview"] .play-seq-btn').click()`); await sleep(400);
          const on = await js(`!!playSeqState`);
          await js(code); await sleep(300);
          const left = await js(`!!playSeqState`);
          if (!on) fail('audio:tab', tabAct + '\'s TAB did not start');
          else if (left) fail('audio:tab', tabAct + '\'s TAB kept playing after ' + name);
          await js(`typeof stopCardAudio === 'function' && stopCardAudio()`);
        }
        stats.audio = 3;
      }
      await js(`setTeacherView('activities')`); await sleep(400);
    }

    // ── Settings writes under P4, P7 and CAS with the song playing: the Preview is never rebuilt ──
    {
      const id = 'ca-18';
      const day = await js(`(() => { const d = new Date(); d.setDate(d.getDate() - 40); return dayStr(d); })()`);
      const S = `[data-ta-pane="settings"]`;
      const steps = [
        ['Who tick', '4', `(async () => { const d = document.querySelector('${S} details[data-board-who]'); if (!d) return false; d.open = true; await new Promise(r => setTimeout(r, 60)); const b = d.querySelector('[data-set-activity-student][data-uid="stub-uid-01"]'); b && b.click(); return !!b; })()`, `((__store.get('config/class').activityStudents || {})['${id}'] || {})['stub-uid-01'] === true`],
        ['Who untick', '7', `(async () => { const d = document.querySelector('${S} details[data-board-who]'); if (!d) return false; d.open = true; await new Promise(r => setTimeout(r, 60)); const b = d.querySelector('[data-set-activity-student][data-uid="stub-uid-01"]'); b && b.click(); return !!b; })()`, `!((__store.get('config/class').activityStudents || {})['${id}'] || {})['stub-uid-01']`],
        ['release date', 'CAS', `(() => { const b = document.querySelector('${S} [data-set-activity-date]'); if (!b) return false; b.value = '${day}'; b.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`, `(__store.get('config/class').activityDates || {})['${id}'] === '${day}'`],
        ['Play Along now', '4', `(() => { const b = document.querySelector('${S} [data-set-activity-playalong][data-state="now"]'); b && b.click(); return !!b; })()`, `(__store.get('config/class').playAlongActivities || {})['${id}'] === true`],
        ['Play Along by date', '7', `(() => { const b = document.querySelector('${S} [data-set-activity-playalong][data-state="date"]'); b && b.click(); return !!b; })()`, `!(__store.get('config/class').playAlongActivities || {})['${id}']`],
        // Picked by the label the teacher reads, so an option whose value names another unit is caught.
        ['Move to Unit 3', 'CAS', `(() => { const b = document.querySelector('${S} [data-move-activity]'); if (!b) return false; const o = [...b.options].find(x => /^Unit 3\\b/.test(x.textContent)); if (!o) return false; b.value = o.value; b.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`, `((__store.get('config/class').activityBoard || {})['${id}'] || {}).module === 3`],
        ['Move to Unit 2', '4', `(() => { const b = document.querySelector('${S} [data-move-activity]'); if (!b) return false; const o = [...b.options].find(x => /^Unit 2\\b/.test(x.textContent)); if (!o) return false; b.value = o.value; b.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`, `((__store.get('config/class').activityBoard || {})['${id}'] || {}).module === 2`],
        ['Archive', '7', `(() => { const b = document.querySelector('${S} [data-set-activity-archived][data-state="archive"]'); b && b.click(); return !!b; })()`, `(__store.get('config/class').archivedActivities || {})['${id}'] === true`],
        ['Restore', 'CAS', `(() => { const b = document.querySelector('${S} [data-set-activity-archived][data-state="restore"]'); b && b.click(); return !!b; })()`, `!(__store.get('config/class').archivedActivities || {})['${id}']`],
        ['Delete', '4', `(() => { const b = document.querySelector('${S} [data-delete-activity]'); b && b.click(); return !!b; })()`, `(__store.get('config/class').deletedActivities || {})['${id}'] === true`],
        ['Restore after Delete', '7', `(() => { const b = document.querySelector('${S} [data-set-activity-archived][data-state="restore"]'); b && b.click(); return !!b; })()`, `!(__store.get('config/class').deletedActivities || {})['${id}']`],
      ];
      for (const [name, per, act, ok] of steps) {
        const n0 = pageErrors.length;
        await js(`teacherSetPeriodFilter(${JSON.stringify(per)})`); await sleep(250);
        const there = await js(`(() => { if (activityDetailId !== '${id}') { const row = document.querySelector('[data-ta-pick][data-id="${id}"]'); if (!row) return 'no row for it in the list'; row.click(); }
          const tab = document.querySelector('[data-ta-tab="settings"]'); if (!tab) return 'no Settings tab'; tab.click(); return ''; })()`); await sleep(60);
        if (there) { fail('write:' + name, id + ': ' + there + ' (under ' + per + ', picked ' + await js(`activityDetailId`) + ', screen ' + await js(`teacherActivityScreen()`) + ')'); continue; }
        const ready = await js(`(() => { const play = document.querySelector('[data-ta-pane="preview"] .pc-play'); if (!pcState && play) play.click();
          window.__prevEl = document.querySelector('[data-ta-pane="preview"]').firstElementChild; window.__pc = pcState; return pcState ? '' : play ? 'its song did not start' : 'no Play button in its Preview (picked ' + activityDetailId + ')'; })()`);
        if (ready) { fail('write:' + name, id + ': ' + ready + ' (under ' + per + ')'); continue; }
        const found = await js(act);
        if (!found) { fail('write:' + name, 'no control under ' + per); continue; }
        await sleep(450);
        const r = await js(`({ ok: ${ok}, same: document.querySelector('[data-ta-pane="preview"]').firstElementChild === window.__prevEl, playing: !!pcState && pcState === window.__pc && pcState.root.isConnected,
          alerts: (window.__alerts || []).length, picked: activityDetailId })`);
        if (!r.ok) fail('write:' + name, 'config/class in the stub did not change (under ' + per + ')');
        if (!r.same) fail('write:' + name, 'the Preview pane was rebuilt under ' + per);
        if (!r.playing) fail('write:' + name, 'the song stopped under ' + per);
        if (r.picked !== id) fail('write:' + name, 'the pick moved to ' + r.picked);
        if (r.alerts) fail('write:' + name, 'an alert: ' + await js(`window.__alerts.join(' | ')`));
        const e = errsSince(n0); if (e.length) fail('write:' + name, 'page error: ' + e[0]);
        stats.periodWrites = (stats.periodWrites || 0) + 1;
      }
      await js(`typeof stopCardAudio === 'function' && stopCardAudio()`);
      await js(`teacherSetPeriodFilter('all')`); await sleep(300);
    }

    // ── Move to Songs from Settings: the split picks a card the list still holds ──
    {
      await js(`document.querySelector('[data-ta-filter="all"]').click()`); await sleep(80);
      await js(`(() => { document.querySelector('[data-ta-pick][data-id="ca-41"]').click(); document.querySelector('[data-ta-tab="settings"]').click(); })()`); await sleep(100);
      const moved = await js(`(() => { const b = document.querySelector('[data-ta-pane="settings"] [data-set-song-place][data-state="songs"]'); b && b.click(); return !!b; })()`);
      await sleep(500);
      const r = await js(`({ lib: (__store.get('config/class').songLibrary || {})['ca-41'], picked: activityDetailId, head: document.querySelector('[data-ta-head]')?.dataset.id,
        row: !!document.querySelector('[data-ta-pick][data-id="' + activityDetailId + '"].is-sel'), gone: !document.querySelector('[data-ta-pick][data-id="ca-41"]') })`);
      if (!moved) fail('to-songs', 'ca-41 has no Move to Songs in Settings');
      else if (r.lib !== true || !r.gone) fail('to-songs', 'Move to Songs did not take ca-41 off the list (' + JSON.stringify(r) + ')');
      else if (r.picked === 'ca-41' || !r.row || r.head !== r.picked) fail('to-songs', 'after Move to Songs the split shows ' + r.head + ', picked ' + r.picked + ', its row selected: ' + r.row);
      await js(`teacherSetSongPlace('ca-41', 'activities')`); await sleep(500);
      if (await js(`(__store.get('config/class').songLibrary || {})['ca-41'] === true`)) fail('to-songs', 'could not move ca-41 back');
    }

    // ── Another console archives a student: this console's next write shows it ──
    {
      await js(`(() => { document.querySelector('[data-ta-pick][data-id="ca-21"]').click(); document.querySelector('[data-ta-tab="settings"]').click(); })()`); await sleep(120);
      const uid = await js(`(() => { const a = CLASS_ACTIVITIES.find(x => x.id === 'ca-21'); const s = allStudents.find(x => x.uid !== 'stub-uid-05' && teacherActivityForStudent(a, x.uid, teacherClassConfig)); return s.uid; })()`);
      const t0 = await js(`document.querySelector('[data-ta-tab="students"]').innerText.trim()`);
      await js(`(() => { const c = __store.get('config/class'); c.configVersion += 1; c.archived = Object.assign({}, c.archived, { ${JSON.stringify(uid)}: true }); __store.set('config/class', c); })()`);
      const cur = await js(`(__store.get('config/class').optionalActivities || {})['ca-21'] === true ? 'required' : 'optional'`);
      await js(`document.querySelector('[data-ta-pane="settings"] [data-set-activity-optional][data-state="${cur}"]').click()`); await sleep(600);
      const r = await js(`({ tab: document.querySelector('[data-ta-tab="students"]').innerText.trim(), listed: allStudents.some(s => s.uid === ${JSON.stringify(uid)}) })`);
      const tot = t => Number((/\/(\d+)/.exec(t) || [])[1]);
      if (r.listed || tot(r.tab) !== tot(t0) - 1) fail('two-consoles', 'another console archived ' + uid + '; after this console\'s write the tab went ' + t0 + ' -> ' + r.tab + (r.listed ? ', still on the roster' : ''));
      // Put it back the same way.
      await js(`(() => { const c = __store.get('config/class'); c.configVersion += 1; const a = Object.assign({}, c.archived); delete a[${JSON.stringify(uid)}]; c.archived = a; __store.set('config/class', c); })()`);
      await js(`document.querySelector('[data-ta-pane="settings"] [data-set-activity-optional][data-state="${cur === 'optional' ? 'required' : 'optional'}"]').click()`); await sleep(600);
      if (!(await js(`allStudents.some(s => s.uid === ${JSON.stringify(uid)})`))) fail('two-consoles', uid + ' did not come back after the other console un-archived them');
    }

    // ── Arrange board and back ──
    {
      const n0 = pageErrors.length;
      await js(`document.querySelector('[data-ta-board-open]').click()`);
      for (let i = 0; i < 30; i++) { await sleep(100); if (await js(`!!document.querySelector('.t-board')`)) break; }
      const r = await js(`({ board: !!document.querySelector('.t-board'), cards: document.querySelectorAll('.t-board [data-board-card]').length, back: !!document.querySelector('[data-ta-board-back]'),
        secs: [...document.querySelectorAll('.t-board-sechead')].map(x => x.innerText.replace(/\\s+/g, ' ').trim()),
        opts: [...document.querySelectorAll('.t-board [data-move-activity] option')].slice(0, 4).map(o => o.textContent),
        sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth })`);
      if (!r.board || r.cards < 20) fail('board', 'Arrange board showed ' + r.cards + ' cards');
      if (!r.back) fail('board', 'no Back to list button');
      if (r.secs.some(t => /Module/.test(t)) || !r.secs.some(t => /^Unit \d/.test(t))) fail('board', 'section headings: ' + JSON.stringify(r.secs));
      if (r.opts.some(t => /Module/.test(t))) fail('board', 'move-to options say Module: ' + JSON.stringify(r.opts));
      if (r.sideways > 0) fail('board', 'page scrolls sideways by ' + r.sideways + 'px');
      await shot('03-arrange-board-1366');
      await js(`document.querySelector('[data-ta-board-back]').click()`); await sleep(300);
      const b = await js(`({ list: !!document.querySelector('[data-ta-list]'), picked: activityDetailId, sel: document.querySelector('[data-ta-pick].is-sel')?.dataset.id })`);
      if (!b.list || b.sel !== b.picked) fail('board', 'Back to list did not return to the list with the picked activity (' + JSON.stringify(b) + ')');
      // A card's Preview button on the board opens it in the list — with its
      // row on screen, even in a unit the list had shut (Unit 2: only the
      // newest unit starts open, and nothing has touched Unit 2's fold).
      await js(`document.querySelector('[data-ta-filter="units"]').click()`); await sleep(80);
      await js(`delete activityUnitOpen['2']`);
      await js(`document.querySelector('[data-ta-board-open]').click()`);
      for (let i = 0; i < 30; i++) { await sleep(100); if (await js(`!!document.querySelector('.t-board')`)) break; }
      await js(`document.querySelector('.t-board [data-open-activity][data-id="ca-13"]').click()`); await sleep(300);
      const c = await js(`({ list: !!document.querySelector('[data-ta-list]'), picked: activityDetailId, sel: document.querySelector('[data-ta-pick].is-sel')?.dataset.id || null })`);
      if (!c.list || c.picked !== 'ca-13') fail('board', 'Preview on the board did not open ca-13 in the list (' + JSON.stringify(c) + ')');
      if (c.sel !== 'ca-13') fail('board', 'Preview on the board opened ca-13, but its row is not on screen in the list (selected row: ' + c.sel + ')');
      const e = errsSince(n0); if (e.length) fail('board', 'page error: ' + e[0]);
      stats.board++;
    }

    // ── Opened from elsewhere: Back returns there, and the list keeps its pick ──
    {
      const n0 = pageErrors.length;
      const LIST_PICK = 'ca-19';
      const pickIs = async (where) => {
        await js(`document.querySelector('#t-side [data-view="activities"]').click()`); await sleep(400);
        const p = await js(`({ picked: activityDetailId, sel: document.querySelector('[data-ta-pick].is-sel')?.dataset.id || null })`);
        if (p.picked !== LIST_PICK || p.sel !== LIST_PICK) fail('list-pick', 'after ' + where + ' and back to Class activities the list picks ' + JSON.stringify(p) + ', not ' + LIST_PICK);
        else stats.listPicks = (stats.listPicks || 0) + 1;
      };
      await js(`setTeacherView('activities')`); await sleep(400);
      await js(`(() => { document.querySelector('[data-ta-filter="all"]').click(); document.querySelector('[data-ta-pick][data-id="${LIST_PICK}"]').click(); })()`); await sleep(150);
      await js(`document.querySelector('#t-side [data-view="songs"]').click()`); await sleep(300);
      await pickIs('the Songs tab');
      // A student named with markup: the Back label shows the name as text.
      const uid = await js(`(() => { const has = x => x && teacherBlockersFor(x, teacherClassConfig).length; const by = u => allStudents.find(x => x.uid === u);
        const s = [by('stub-uid-03'), by('stub-uid-14')].find(has) || allStudents.find(has); return s ? s.uid : null; })()`);
      if (!uid) fail('from-student', 'no stub student has a blocker');
      else {
        await js(`openStudentDetail(${JSON.stringify(uid)})`); await sleep(200);
        const opened = await js(`(() => { const r = document.querySelector('#t-grid-container [data-open-activity]'); if (!r) return null; r.click(); return r.dataset.id; })()`);
        await sleep(250);
        const r = await js(`({ screen: teacherActivityScreen(), tabs: document.querySelectorAll('[data-ta-tab]').length, back: (document.querySelector('[data-back-to-activities]') || {}).innerText || '', cur: document.querySelector('#t-side [aria-current="page"]')?.dataset.view,
          name: allStudentsRaw.find(s => s.uid === ${JSON.stringify(uid)}).name, injected: document.querySelectorAll('img[src="x"]').length })`);
        if (!opened || r.screen !== 'detail' || r.tabs !== 3) fail('from-student', 'Blocked by row opened ' + JSON.stringify(r));
        if (r.cur !== 'students') fail('from-student', 'sidebar marks ' + r.cur);
        if (!r.back.endsWith('Back to ' + r.name) || r.injected) fail('from-student', 'the Back label reads ' + JSON.stringify(r.back) + ' for the student ' + JSON.stringify(r.name) + (r.injected ? ' (' + r.injected + ' injected <img>)' : ''));
        if (!/^stub-uid-(03|14)$/.test(uid)) fail('from-student', 'neither student named with markup has a blocker — the Back label is not tested with one');
        await js(`document.querySelector('[data-back-to-activities]').click()`); await sleep(200);
        const back = await js(`({ view: teacherView, uid: studentDetailUid })`);
        if (back.view !== 'students' || back.uid !== uid) fail('from-student', 'Back went to ' + JSON.stringify(back));
        else stats.backs++;
        await pickIs('a Blocked by row and Back');
      }
      await js(`setTeacherView('songs')`);
      for (let i = 0; i < 30; i++) { await sleep(100); if (await js(`!!document.querySelector('#t-grid-container [data-open-activity]')`)) break; }
      const sid = await js(`(() => { const r = document.querySelector('#t-grid-container [data-open-activity]'); if (!r) return null; r.click(); return r.dataset.id; })()`);
      await sleep(250);
      const r = await js(`({ screen: teacherActivityScreen(), tabs: document.querySelectorAll('[data-ta-tab]').length, cur: document.querySelector('#t-side [aria-current="page"]')?.dataset.view })`);
      if (!sid || r.screen !== 'detail' || r.tabs !== 3 || r.cur !== 'songs') fail('from-songs', 'a Songs row opened ' + JSON.stringify(r));
      await js(`document.querySelector('[data-back-to-activities]').click()`); await sleep(300);
      const back = await js(`teacherView`);
      if (back !== 'songs') fail('from-songs', 'Back went to ' + back); else stats.backs++;
      await pickIs('a Songs row and Back');
      const e = errsSince(n0); if (e.length) fail('from-elsewhere', 'page error: ' + e[0]);
    }

    await xss('after the writes, the board and the Back labels');

    // ── The units tree under Class activities (2026-11-09) ──
    {
      const n0 = pageErrors.length;
      const treeState = () => js(`(() => { const t = document.getElementById('t-side-tree'), f = document.querySelector('#t-side [data-side-fold]');
        return { hidden: t.hidden, height: Math.round(t.getBoundingClientRect().height), exp: f.getAttribute('aria-expanded'), label: f.getAttribute('aria-label'),
          stored: (() => { try { return localStorage.getItem('teacherSideTree'); } catch (e) { return 'ERR'; } })(),
          rows: [...t.querySelectorAll('[data-side-unit]')].map(b => ({ key: b.dataset.sideUnit, n: Number(b.querySelector('.t-side-sub-n').textContent), on: b.classList.contains('on'),
            cur: b.getAttribute('aria-current'), text: b.innerText.replace(/\\s+/g, ' ').trim() })),
          page: [...document.querySelectorAll('#t-side [aria-current="page"]')].map(b => b.dataset.view) }; })()`);
      const listState = () => js(`(() => { const body = document.querySelector('[data-ta-list-body]'); if (!body) return null;
        const heads = [...body.querySelectorAll('[data-ta-unit]')].map(h => ({ key: h.dataset.taUnit, open: h.getAttribute('aria-expanded') === 'true', n: Number(h.querySelector('.ta-unit-count').textContent) }));
        const bt = body.getBoundingClientRect().top;
        return { view: teacherView, screen: teacherActivityScreen(), filter: activityListFilter, query: activityListQuery, input: document.querySelector('[data-ta-search]').value,
          heads, open: heads.filter(h => h.open).map(h => h.key), scrollTop: Math.round(body.scrollTop),
          offsets: Object.fromEntries(heads.map(h => [h.key, Math.round(body.querySelector('[data-ta-unit="' + h.key + '"]').getBoundingClientRect().top - bt)])),
          atEnd: body.scrollTop + body.clientHeight >= body.scrollHeight - 2, board: !!document.querySelector('.t-board') }; })()`);
      // The board's own numbers, worked out from the stub's board entries and nothing the list or the tree computes.
      const expected = await js(`(() => { const cfg = teacherClassConfig, board = cfg.activityBoard || {}, by = {}; let all = 0;
        CLASS_ACTIVITIES.filter(a => !caIsLibraryCard(a, cfg.songLibrary || {}) && !caIsTeacherSong(a, cfg.classSongs || {})).forEach(a => {
          const e = board[a.id], k = e ? String(Number(e.module) || 0) : 'built'; by[k] = (by[k] || 0) + 1; all++; });
        return { by, all }; })()`);
      const sum = t => t.rows.reduce((x, r) => x + r.n, 0);
      const countOf = (t, k) => (t.rows.find(r => r.key === k) || {}).n;
      const litKeys = t => JSON.stringify(t.rows.filter(r => r.on).map(r => r.key));
      const sameAsList = (step, t, L) => {
        for (const r of t.rows) { const h = L.heads.find(x => x.key === r.key); if (!h || h.n !== r.n) fail(step, `tree row ${r.key} says ${r.n}, the list heading says ${h ? h.n : 'nothing'}`); }
        if (L.heads.length !== t.rows.length) fail(step, `the tree has ${t.rows.length} rows, the list ${L.heads.length} headings`);
      };

      // Default: open, Built first, then the units newest first, then Unsorted; counts are the board's and the list's.
      await js(`setTeacherView('activities')`); await sleep(500);
      // Earlier blocks leave the list on another filter or a search: compare against the Units screen with nothing typed.
      await js(`(() => { const s = document.querySelector('[data-ta-search]'); s.value = ''; s.dispatchEvent(new Event('input', { bubbles: true })); document.querySelector('[data-ta-filter="units"]').click(); })()`); await sleep(200);
      let t = await treeState(), L = await listState();
      const wantKeys = ['built', ...Object.keys(expected.by).filter(k => k !== 'built' && k !== '0').sort((a, b) => Number(b) - Number(a)), ...(expected.by['0'] ? ['0'] : [])];
      if (t.hidden || t.exp !== 'true' || t.height <= 0) fail('tree:default', 'the tree is not open by default: ' + JSON.stringify({ hidden: t.hidden, exp: t.exp, height: t.height }));
      if (JSON.stringify(t.rows.map(r => r.key)) !== JSON.stringify(wantKeys)) fail('tree:default', 'rows are ' + JSON.stringify(t.rows.map(r => r.key)) + ', expected ' + JSON.stringify(wantKeys));
      for (const r of t.rows) if (r.n !== expected.by[r.key]) fail('tree:counts', `row ${r.key} says ${r.n}, the board has ${expected.by[r.key]}`);
      if (sum(t) !== expected.all) fail('tree:counts', `the rows add up to ${sum(t)}, the board holds ${expected.all} cards`);
      if (!/^Built, not assigned/.test((t.rows[0] || {}).text || '') || t.rows.some(r => /Module/.test(r.text)) || t.rows.slice(1).some(r => !/^(Unit \d|Unsorted)/.test(r.text))) fail('tree:labels', JSON.stringify(t.rows.map(r => r.text)));
      if (JSON.stringify(t.page) !== '["activities"]') fail('tree:default', 'current page items ' + JSON.stringify(t.page));
      sameAsList('tree:default', t, L);
      stats.tree = { rows: t.rows.length, cards: expected.all, clicks: 0, repaints: 0, reloads: 0 };

      // From another page: the tree is there on Songs too, and Built opens the list on Built alone, scrolled to it.
      await js(`setTeacherView('songs')`); await sleep(500);
      const tSongs = await treeState();
      if (tSongs.rows.length !== t.rows.length || tSongs.height <= 0) fail('tree:songs', 'the tree on Songs has ' + tSongs.rows.length + ' rows, height ' + tSongs.height);
      await js(`document.querySelector('#t-side-tree [data-side-unit="built"]').click()`); await sleep(500);
      L = await listState(); t = await treeState(); stats.tree.clicks++;
      if (!L || L.view !== 'activities' || L.screen !== 'split' || L.filter !== 'units') fail('tree:built', 'after the click: ' + JSON.stringify(L && { view: L.view, screen: L.screen, filter: L.filter }));
      else {
        if (L.query !== '' || L.input !== '') fail('tree:built', 'the search was not cleared: ' + JSON.stringify([L.query, L.input]));
        if (JSON.stringify(L.open) !== '["built"]') fail('tree:built', 'open units are ' + JSON.stringify(L.open) + ', expected only built');
        if (L.scrollTop <= 0 || !(L.offsets.built <= 2 || L.atEnd)) fail('tree:built', 'the list is not scrolled to Built: scrollTop ' + L.scrollTop + ', heading at ' + L.offsets.built + ', at end ' + L.atEnd);
      }
      if (litKeys(t) !== '["built"]' || t.rows.filter(r => r.cur === 'true').length !== 1) fail('tree:built', 'lit rows ' + litKeys(t));
      if (JSON.stringify(t.page) !== '["activities"]') fail('tree:built', 'current page items ' + JSON.stringify(t.page));
      await shot('15-tree-built-1366');

      // On the list with a search typed and another filter on: a unit row clears both and leaves the Preview alone.
      await js(`document.querySelector('[data-ta-filter="all"]').click()`); await sleep(100);
      await js(`(() => { const s = document.querySelector('[data-ta-search]'); s.value = 'chord'; s.dispatchEvent(new Event('input', { bubbles: true })); })()`); await sleep(150);
      const pre = await js(`({ rows: document.querySelectorAll('[data-ta-list-body] [data-ta-pick]').length, q: activityListQuery, f: activityListFilter })`);
      if (pre.f !== 'all' || pre.q !== 'chord' || !pre.rows) fail('tree:unit-2', 'the setup failed: ' + JSON.stringify(pre));
      await js(`window.__prevEl = document.querySelector('[data-ta-pane="preview"]').firstElementChild; window.__prevList = document.querySelector('[data-ta-list]'); window.__prevId = activityDetailId`);
      await js(`document.querySelector('#t-side-tree [data-side-unit="2"]').click()`); await sleep(300);
      L = await listState(); t = await treeState(); stats.tree.clicks++;
      const kept = await js(`({ preview: document.querySelector('[data-ta-pane="preview"]').firstElementChild === window.__prevEl, list: document.querySelector('[data-ta-list]') === window.__prevList, id: activityDetailId === window.__prevId })`);
      if (L.filter !== 'units' || L.query !== '' || L.input !== '' || JSON.stringify(L.open) !== '["2"]') fail('tree:unit-2', 'filter ' + L.filter + ', search ' + JSON.stringify([L.query, L.input]) + ', open ' + JSON.stringify(L.open));
      if (!kept.preview || !kept.list || !kept.id) fail('tree:unit-2', 'the click rebuilt something it should not have: ' + JSON.stringify(kept));
      if (litKeys(t) !== '["2"]') fail('tree:unit-2', 'lit rows ' + litKeys(t));

      // From Arrange board: the tree is still drawn there, and a unit row returns to the list on that unit.
      await js(`document.querySelector('[data-ta-board-open]').click()`);
      for (let i = 0; i < 30; i++) { await sleep(100); if (await js(`!!document.querySelector('.t-board')`)) break; }
      const tBoard = await treeState();
      if (JSON.stringify(tBoard.rows.map(r => [r.key, r.n])) !== JSON.stringify(t.rows.map(r => [r.key, r.n])) || litKeys(tBoard) !== '[]') fail('tree:board', 'the tree on the board: ' + JSON.stringify(tBoard.rows.map(r => r.key + ':' + r.n + (r.on ? '*' : ''))));
      await js(`document.querySelector('#t-side-tree [data-side-unit="1"]').click()`); await sleep(500);
      L = await listState(); t = await treeState(); stats.tree.clicks++;
      if (!L || L.board || L.screen !== 'split' || L.filter !== 'units' || JSON.stringify(L.open) !== '["1"]') fail('tree:board', 'after the click: ' + JSON.stringify(L && { board: L.board, screen: L.screen, filter: L.filter, open: L.open }));
      if (litKeys(t) !== '["1"]') fail('tree:board', 'lit rows ' + litKeys(t));

      // Counts follow a write: assign a Built card to Unit 4 and send it back, then move a song to the Songs page and back.
      const before = await treeState();
      const cardId = await js(`teacherActivityListModel(teacherClassConfig).groups.find(g => g.key === 'built').ids.find(i => !teacherActivityRetired(i, teacherClassConfig))`);
      if (!cardId) fail('tree:assign', 'the stub has no live Built card');
      else {
        await js(`teacherMoveActivity(${JSON.stringify(cardId)}, 4, null)`); await sleep(700);
        const mid = await treeState(); L = await listState(); stats.tree.repaints++;
        if (countOf(mid, 'built') !== countOf(before, 'built') - 1 || countOf(mid, '4') !== countOf(before, '4') + 1) fail('tree:assign', `Built ${countOf(before, 'built')} -> ${countOf(mid, 'built')}, Unit 4 ${countOf(before, '4')} -> ${countOf(mid, '4')}`);
        sameAsList('tree:assign', mid, L);
        await js(`teacherUnassignActivity(${JSON.stringify(cardId)})`); await sleep(700);
        const end = await treeState(); L = await listState(); stats.tree.repaints++;
        if (JSON.stringify(end.rows.map(r => [r.key, r.n])) !== JSON.stringify(before.rows.map(r => [r.key, r.n]))) fail('tree:unassign', 'counts after Un-assign ' + JSON.stringify(end.rows.map(r => r.key + ':' + r.n)) + ', before ' + JSON.stringify(before.rows.map(r => r.key + ':' + r.n)));
        sameAsList('tree:unassign', end, L);
      }
      const songId = await js(`(() => { const cfg = teacherClassConfig; const a = CLASS_ACTIVITIES.find(x => caIsSongCard(x) && !caIsLibraryCard(x, cfg.songLibrary || {}) && !caIsTeacherSong(x, cfg.classSongs || {})); return a ? a.id : null; })()`);
      if (!songId) fail('tree:song', 'the stub has no song card on the board');
      else {
        const s0 = await treeState();
        await js(`setTeacherView('songs')`); await sleep(500);
        await js(`teacherSetSongPlace(${JSON.stringify(songId)}, 'songs')`); await sleep(700);
        const s1 = await treeState(); stats.tree.repaints++;
        if (sum(s1) !== sum(s0) - 1) fail('tree:song', `moving a song to the Songs page left the rows adding up to ${sum(s1)}, was ${sum(s0)}`);
        await js(`teacherSetSongPlace(${JSON.stringify(songId)}, 'activities')`); await sleep(700);
        const s2 = await treeState(); stats.tree.repaints++;
        if (JSON.stringify(s2.rows.map(r => [r.key, r.n])) === JSON.stringify(s1.rows.map(r => [r.key, r.n])) || sum(s2) !== sum(s0)) fail('tree:song', `moving it back left ${sum(s2)} cards, was ${sum(s0)}`);
        await js(`setTeacherView('activities')`); await sleep(400);
      }

      // Fold: the arrow hides the tree, the choice survives a reload, and so does opening it again.
      await js(`document.querySelector('#t-side [data-side-fold]').click()`); await sleep(100);
      t = await treeState();
      if (!t.hidden || t.exp !== 'false' || t.label !== 'Show units' || t.stored !== '0' || t.height !== 0) fail('tree:fold', 'after folding: ' + JSON.stringify({ hidden: t.hidden, exp: t.exp, label: t.label, stored: t.stored, height: t.height }));
      await shot('16-tree-folded-1366');
      await bootConsole(); await sleep(400); stats.tree.reloads++;
      t = await treeState();
      if (!t.hidden || t.exp !== 'false' || t.height !== 0) fail('tree:fold-reload', 'after a reload the tree is ' + JSON.stringify({ hidden: t.hidden, exp: t.exp, height: t.height }) + ', expected still folded');
      await js(`document.querySelector('#t-side [data-side-fold]').click()`); await sleep(100);
      t = await treeState();
      if (t.hidden || t.exp !== 'true' || t.label !== 'Hide units' || t.stored !== '1' || t.height <= 0) fail('tree:unfold', 'after opening: ' + JSON.stringify({ hidden: t.hidden, exp: t.exp, label: t.label, stored: t.stored, height: t.height }));
      await bootConsole(); await sleep(400); stats.tree.reloads++;
      t = await treeState();
      if (t.hidden || t.exp !== 'true' || t.rows.length !== wantKeys.length) fail('tree:unfold-reload', 'after a reload the tree is ' + JSON.stringify({ hidden: t.hidden, exp: t.exp, rows: t.rows.length }) + ', expected open with ' + wantKeys.length + ' rows');
      const e = errsSince(n0); if (e.length) fail('tree', 'page error: ' + e[0]);
    }

    // ── 1920×1080 and 390 px ──
    await js(`setTeacherView('activities')`); await sleep(400);
    await js(`document.querySelector('[data-ta-filter="units"]').click()`); await sleep(100);
    await js(`(document.querySelector('[data-ta-pick][data-id="ca-18"]') || document.querySelector('[data-ta-pick]')).click()`); await sleep(200);
    await js(`document.querySelector('[data-ta-tab="preview"]').click()`); await sleep(100);
    await size(1920, 1080); await sleep(300);
    const wide = await js(`({ sideways: document.documentElement.scrollWidth - document.documentElement.clientWidth, list: document.querySelector('[data-ta-list]').getBoundingClientRect().width, side: document.getElementById('t-side').getBoundingClientRect().width, detail: document.querySelector('[data-ta-detail]').getBoundingClientRect().width })`);
    if (wide.sideways > 0) fail('1920', 'page scrolls sideways by ' + wide.sideways + 'px');
    await shot('07-console-1920');
    for (const tab of ['students', 'settings']) { await js(`document.querySelector('[data-ta-tab="${tab}"]').click()`); await sleep(120); await shot(`08-${tab}-1920`); }
    await js(`setTeacherView('skills')`); await sleep(200); await shot('09-skills-grid-1920');
    await js(`setTeacherView('manage')`); await sleep(300); await shot('10-manage-1920');
    await js(`setTeacherView('activities')`); await sleep(300);
    await js(`document.querySelector('[data-ta-board-open]').click()`); await sleep(500); await shot('11-arrange-board-1920');
    await js(`document.querySelector('[data-ta-board-back]').click()`); await sleep(300);
    await size(1366, 768); await sleep(200);
    const at1366 = await js(`({ list: document.querySelector('[data-ta-list]').getBoundingClientRect().width, side: document.getElementById('t-side').getBoundingClientRect().width, detail: document.querySelector('[data-ta-detail]').getBoundingClientRect().width })`);
    await size(390, 844); await sleep(300);
    const narrow = [];
    for (const v of views) {
      await js(`setTeacherView('${v}')`); await sleep(v === 'activities' ? 400 : 200);
      const sw = await js(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
      if (sw > 0) narrow.push(v + ' +' + sw + 'px');
    }
    await js(`setTeacherView('activities')`); await sleep(400);
    await shot('12-console-390');
    {
      // The sideways strip has no room for a tree: only the 13 items stay.
      const r = await js(`({ tree: getComputedStyle(document.getElementById('t-side-tree')).display, fold: getComputedStyle(document.querySelector('#t-side [data-side-fold]')).display, items: document.querySelectorAll('#t-side [data-view]').length })`);
      if (r.tree !== 'none' || r.fold !== 'none' || r.items !== 13) fail('390', 'the units tree at 390px: ' + JSON.stringify(r));
    }
    for (const tab of ['preview', 'students', 'settings']) {
      await js(`document.querySelector('[data-ta-tab="${tab}"]').click()`); await sleep(120);
      const sw = await js(`document.documentElement.scrollWidth - document.documentElement.clientWidth`);
      if (sw > 0) narrow.push('activities/' + tab + ' +' + sw + 'px');
    }
    if (narrow.length) fail('390', 'sideways scroll at 390px: ' + narrow.join(', '));
    // Dark mode: the console is drawn on the palette tokens, so it follows prefers-color-scheme like the rest of the site.
    await size(1366, 768);
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'dark' }] });
    await sleep(200);
    const dark = await js(`['[data-ta-list]', '#t-side', '#t-side-tree .t-side-sub:not(.on)', '[data-ta-pane]:not([hidden])'].map(q => { const c = getComputedStyle(document.querySelector(q)); return q + ' ' + c.backgroundColor + ' / ' + c.color; })`);
    // Light text on a dark ground: the text channel average must beat the background's (a transparent pane reads as the dark body).
    for (const line of dark) {
      const [bg, fg] = line.split(' ').slice(1).join(' ').split(' / ').map(c => (c.match(/\d+(\.\d+)?/g) || []).slice(0, 3).map(Number));
      const avg = v => v.reduce((x, y) => x + y, 0) / 3;
      const transparent = /rgba\(0, 0, 0, 0\)/.test(line);
      if ((!transparent && avg(bg) > 80) || avg(fg) < 150) fail('dark', 'not dark-mode colours: ' + line);
    }
    await shot('13-dark-1366');
    for (const tab of ['students', 'settings']) { await js(`document.querySelector('[data-ta-tab="${tab}"]').click()`); await sleep(120); await shot(`14-dark-${tab}-1366`); }
    await page.send('Emulation.setEmulatedMedia', { features: [] });
    stats.widths = { at1366, at1920: wide };
    await xss('the end of the walk');
    const late = errsSince(0); if (late.length) fail('page', late.length + ' page error(s), first: ' + late[0]);
  } finally {
    try { if (page) await page.close(); } catch { /* gone */ }
    proc.kill('SIGKILL'); srv.close();
    try { rmSync(prof, { recursive: true, force: true }); } catch { /* best effort */ }
  }
  console.log(`console-layout-smoke: ${stats.views} sidebar views, ${stats.activities} activities opened (practice card, focus, paths, exit check) x ${stats.tabs / Math.max(stats.activities, 1)} tabs = ${stats.tabs} tab switches, ${stats.filters} filters, ${stats.folds} folds, ${stats.searches} searches, ${stats.writes} Settings writes with the Preview kept, ${stats.repaint} Students repaint, ${stats.counts || 0} list counts equal to the board's (All + P4), ${stats.refreshes || 0} refreshes with the Preview and list scroll kept, ${stats.board} board round trip, ${stats.backs} Backs, `
    + `${stats.chips || 0} chip checks, ${stats.periodWrites || 0} writes under P4/P7/CAS with the song playing, ${stats.renameRefresh || 0} Refresh past a hidden rename, ${stats.audio || 0} sound stops, ${stats.listPicks || 0} list picks kept, ${stats.xss || 0} markup-name checks`);
  if (stats.tree) console.log(`  units tree: ${stats.tree.rows} rows adding up to the board's ${stats.tree.cards} cards, ${stats.tree.clicks} row clicks (Songs, list with a search, Arrange board), ${stats.tree.repaints} repaints after a write, ${stats.tree.reloads} reloads with the fold kept`);
  if (stats.widths) console.log(`  column widths at 1366: sidebar ${Math.round(stats.widths.at1366.side)}, list ${Math.round(stats.widths.at1366.list)}, detail ${Math.round(stats.widths.at1366.detail)}; at 1920: ${Math.round(stats.widths.at1920.side)}, ${Math.round(stats.widths.at1920.list)}, ${Math.round(stats.widths.at1920.detail)}`);
  if (stats.shots.length) console.log('  screenshots:\n    ' + stats.shots.join('\n    '));
  if (fails.length) { console.log(`\x1b[31m✗ ${fails.length} problem(s):\x1b[0m\n  ` + fails.join('\n  ')); process.exit(1); }
  console.log('\x1b[32m✓ console layout smoke passed\x1b[0m');
}
main().catch(e => { console.error(e); process.exit(1); });
