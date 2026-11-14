#!/usr/bin/env node
/* mic-old-takes-proof.mjs — runs the teacher console's "Delete recordings
   older than 30 days" button (teacher-mic.js, teacherMicDeleteOld, 2026-11-14)
   in headless Chrome against an in-memory stub Firestore with made-up takes
   ("Test 0"…; no real data). Run it after any change to that code.

     node tools/mic-old-takes-proof.mjs                 run every case, print counts
     node tools/mic-old-takes-proof.mjs --shots <dir>   also save 1366×657 screenshots
     node tools/mic-old-takes-proof.mjs --root <dir>    serve another checkout
     (Chrome: CHROME=… or --chrome <path>; one headless-browser run at a time.)

   Cases (each on a fresh console and a fresh stub):
     main      takes saved 45, 31, 30, 29 and 1 days ago and one with no date:
               the line says 2, the button deletes exactly the 45- and 31-day
               takes (doc and every chunk), the other 4 stay whole,
               micTakesMeta/count and everything outside micTakes are unchanged
     fail      the same takes, the 2nd delete planted to fail: "Deleted 1 of 2;
               1 failed", the failed take whole (doc and chunks), the line then
               says 1, and a second press deletes it
     failread  the chunk list of the 1st take cannot be read: nothing of it goes
     boundary  30 d, 30 d 23 h 59 min (kept) / exactly 31 d, 31 d 1 min (deleted)
     replaced  a take replaced by a newer one between drawing and the click is kept
     cancel    the confirm answered Cancel: nothing changes
     none      no take is old: "No recordings are older than 30 days", no button
   The boundary rule: a take is old when floor((now - savedAt) / 24 h) > 30. */
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
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.woff2': 'font/woff2', '.mp3': 'audio/mpeg' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
function findChrome() {
  const given = opt('--chrome') || process.env.CHROME;
  if (given) return given;
  const c = platform() === 'darwin' ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'] : ['/usr/bin/google-chrome', '/usr/bin/chromium'];
  return c.find(p => existsSync(p));
}

/* The stub, run in the page. Timestamps are stored as { __ts: ms } and come
   back with toDate(), like Firestore's. A transaction applies all its writes
   or none; window.__failTx(n, ops) may throw to plant a failure. */
const STUB = (SEED) => String.raw`(() => {
  const store = new Map(); window.__store = store;
  const DAY = 86400000, now = Date.now();
  const SEED = ${JSON.stringify(SEED)};
  store.set('config/class', { configVersion: 1, gamesEnabled: true, gameOverrides: {}, activityBoard: {}, activityBoardSeeded: true, micSampling: { on: false, max: 40 } });
  store.set('progress/stub-uid-00', { uid: 'stub-uid-00', name: 'Test 0', email: 'test0@example.test', period: '4', migrations: { swap45: true } });
  store.set('progress/stub-uid-01', { uid: 'stub-uid-01', name: 'Test 1', email: 'test1@example.test', period: '7', migrations: { swap45: true } });
  store.set('micTakesMeta/count', { n: SEED.length });
  store.set('reports/stub-1', { text: 'made up' });
  SEED.forEach((s, i) => {
    const id = 'stub-uid-' + String(i).padStart(2, '0') + '-coach';
    const d = { uid: 'stub-uid-' + String(i).padStart(2, '0'), name: 'Test ' + i, period: '4', mode: 'coach', bpm: 80, durationSec: 12, chunks: 3, expected: [] };
    if (s.ageMs != null) d.savedAt = { __ts: now - s.ageMs };
    store.set('micTakes/' + id, d);
    for (let c = 0; c < 3; c++) store.set('micTakes/' + id + '/chunks/' + c, { i: c, pcm: 'x' + c });
  });
  const clone = v => v === undefined ? v : JSON.parse(JSON.stringify(v));
  const revive = v => { if (v && typeof v === 'object') { if (typeof v.__ts === 'number') { const t = v.__ts; return { toDate: () => new Date(t), toMillis: () => t }; }
    Object.keys(v).forEach(k => { v[k] = revive(v[k]); }); } return v; };
  const snapOf = p => ({ exists: store.has(p), data: () => revive(clone(store.get(p))), id: p.split('/').pop(), ref: docRef(p) });
  window.__readFail = null;
  function docRef(p){ return { path: p, get: async () => snapOf(p),
    set: async d => { store.set(p, clone(d)); }, update: async d => store.set(p, Object.assign(clone(store.get(p) || {}), clone(d))),
    delete: async () => { store.delete(p); }, collection: n => colRef(p + '/' + n) }; }
  function colRef(p){ const q = { doc: id => docRef(p + '/' + id), orderBy: () => q, limit: () => q, where: () => q,
    get: async () => { if (window.__readFail && window.__readFail(p)) throw new Error('planted read failure');
      const docs = [...store.keys()].filter(k => k.startsWith(p + '/') && k.slice(p.length + 1).indexOf('/') < 0).map(snapOf);
      return { docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) }; } }; return q; }
  let txN = 0; window.__txLog = [];
  const fdb = { collection: n => colRef(n), runTransaction: async fn => {
    const ops = [];
    const tx = { get: r => r.get(), delete: r => { ops.push(['delete', r.path]); return tx; }, set: (r, d) => { ops.push(['set', r.path, clone(d)]); return tx; },
      update: (r, d) => { ops.push(['update', r.path, clone(d)]); return tx; } };
    const res = await fn(tx); txN++;
    window.__txLog.push(ops.map(o => o[0] + ' ' + o[1]));
    if (window.__failTx && window.__failTx(txN, ops)) throw new Error('planted failure');
    ops.forEach(o => { if (o[0] === 'delete') store.delete(o[1]); else if (o[0] === 'set') store.set(o[1], o[2]); else store.set(o[1], Object.assign(clone(store.get(o[1]) || {}), o[2])); });
    return res; } };
  window.db = fdb; try { db = fdb; } catch (e) {}
  window.ensureDb = async () => fdb; try { ensureDb = window.ensureDb; } catch (e) {}
  window.firebase = window.firebase || {};
  firebase.firestore = Object.assign(firebase.firestore || {}, { FieldValue: { serverTimestamp: () => ({ __ts: Date.now() }), delete: () => ({ __del: true }), increment: n => n } });
  window.__confirms = []; window.__confirmAnswer = true;
  window.confirm = m => { window.__confirms.push(String(m)); return window.__confirmAnswer; };
  window.alert = m => { window.__alerts = (window.__alerts || []).concat(String(m)); };
  return SEED.length;
})()`;

const D = 86400000, MIN = 60000;
const MAIN = [{ ageMs: 45 * D }, { ageMs: 31 * D }, { ageMs: 30 * D }, { ageMs: 29 * D }, { ageMs: 1 * D }, { ageMs: null }];

async function main() {
  const chrome = findChrome();
  if (!chrome) { console.error('mic-old-takes-proof: no Chrome found — set CHROME or pass --chrome'); process.exit(2); }
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (p.endsWith('/')) p += 'index.html';
    if (p === '/sw.js') { res.writeHead(404); res.end(); return; }
    const f = normalize(join(ROOT, p));
    if (!f.startsWith(ROOT) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream' }); res.end(readFileSync(f));
  });
  await new Promise(r => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port, cdp = await freePort();
  const prof = mkdtempSync(join(tmpdir(), 'gc-micold-chrome-'));
  const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
  let pass = 0, failed = 0; const fails = [];
  const check = (name, cond, detail) => { if (cond) pass++; else { failed++; fails.push(name + (detail ? ' — ' + detail : '')); } };
  try {
    for (let i = 0; i < 80; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }
    const t = await (await fetch(`http://127.0.0.1:${cdp}/json/new?about:blank`, { method: 'PUT' })).json();
    const ws = new WebSocket(t.webSocketDebuggerUrl);
    await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
    let id = 0; const pending = new Map(); const pageErrors = [];
    ws.onmessage = e => { const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
      else if (m.method === 'Runtime.exceptionThrown') pageErrors.push((m.params.exceptionDetails.exception || {}).description || m.params.exceptionDetails.text); };
    const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
    const js = async expression => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
      if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || JSON.stringify(r.exceptionDetails)); return r.result.value; };
    const shot = async name => { if (!SHOTS) return; const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(SHOTS, name + '.png'), Buffer.from(r.data, 'base64')); };
    await send('Runtime.enable'); await send('Page.enable');
    await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
    const waitFor = async (expr, ms = 15000) => { for (let i = 0; i < ms / 100; i++) { if (await js(expr).catch(() => false)) return true; await sleep(100); } return false; };

    const boot = async (seed) => {
      await send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html?teacher=true` });
      await waitFor(`typeof ensureTeacherJs === 'function' && typeof CLASS_ACTIVITIES !== 'undefined'`);
      await js(`ensureTeacherJs()`);
      await waitFor(`typeof showTeacherApp === 'function' && typeof renderTeacherMic === 'function'`);
      await js(STUB(seed));
      await js(`showTeacherApp({ uid: 'stub-teacher', email: TEACHER_EMAIL, displayName: 'Teacher' }).catch(e => { window.__showErr = e.message; })`);
      await sleep(800);
      await js(`document.querySelector('#t-side [data-view="mic"]').click()`);
      return waitFor(`!!document.getElementById('t-mic-old') || /No recordings yet/.test(document.getElementById('t-grid-container').textContent)`);
    };
    const state = () => js(String.raw`(() => { const s = window.__store; const keys = [...s.keys()];
      const takes = keys.filter(k => /^micTakes\/[^/]+$/.test(k)).sort();
      return { takes, chunks: Object.fromEntries(takes.map(k => [k.split('/')[1], keys.filter(c => c.startsWith(k + '/chunks/')).length])),
        count: JSON.stringify(s.get('micTakesMeta/count')),
        outside: JSON.stringify(keys.filter(k => !k.startsWith('micTakes/')).sort().map(k => [k, s.get(k)])),
        line: (document.getElementById('t-mic-old-line') || {}).textContent || '', btn: (document.getElementById('t-mic-old-del') || {}).textContent || null,
        note: [...document.querySelectorAll('#t-mic-old-note')].map(n => n.textContent).join(' | '),
        rows: document.querySelectorAll('#t-grid-container tbody tr').length, confirms: window.__confirms.slice() }; })()`);
    const press = async () => { await js(`document.getElementById('t-mic-old-del').click()`); await waitFor(`!teacherMicOldBusy && !!document.getElementById('t-mic-old-note') && /Deleted/.test([...document.querySelectorAll('#t-mic-old-note')].map(n => n.textContent).join(' '))`); await sleep(300); };
    const idOf = i => 'stub-uid-' + String(i).padStart(2, '0') + '-coach';

    // ── main ──
    await boot(MAIN);
    let s0 = await state();
    check('main: line says 2', /^2 recordings are older than 30 days\./.test(s0.line), s0.line);
    check('main: no-date take counted apart', /1 recording has no saved date: this button never deletes it/.test(s0.line), s0.line);
    check('main: button says 2', s0.btn === 'Delete 2 recordings older than 30 days', s0.btn);
    check('main: 6 rows', s0.rows === 6, String(s0.rows));
    await shot('mic-1-before');
    await js(`window.__confirmAnswer = true`);
    await press();
    let s1 = await state();
    check('main: confirm asked once with the count and "cannot be undone"', s1.confirms.length === 1 && /^Delete 2 recordings older than 30 days\? This cannot be undone\./.test(s1.confirms[0]), JSON.stringify(s1.confirms));
    check('main: the 45- and 31-day takes are gone', !s1.takes.includes('micTakes/' + idOf(0)) && !s1.takes.includes('micTakes/' + idOf(1)), s1.takes.join());
    check('main: their chunks are gone', s1.chunks[idOf(0)] === undefined && s1.chunks[idOf(1)] === undefined
      && !(await js(`[...__store.keys()].some(k => k.startsWith('micTakes/${idOf(0)}/') || k.startsWith('micTakes/${idOf(1)}/'))`)));
    check('main: the other 4 remain whole', [2, 3, 4, 5].every(i => s1.takes.includes('micTakes/' + idOf(i)) && s1.chunks[idOf(i)] === 3), JSON.stringify(s1.chunks));
    check('main: count doc untouched', s1.count === s0.count, s0.count + ' → ' + s1.count);
    check('main: nothing outside micTakes changed', s1.outside === s0.outside);
    check('main: note says Deleted 2 of 2', /Deleted 2 of 2\./.test(s1.note), s1.note);
    check('main: list refreshed to 4 rows, no old left', s1.rows === 4 && /^No recordings are older than 30 days\./.test(s1.line) && s1.btn === null, s1.rows + ' ' + s1.line);
    const txOps = await js(`window.__txLog`);
    check('main: each take deleted in one transaction, chunks first then the doc', txOps.length === 2 && txOps.every(o => o.length === 4 && o.slice(0, 3).every(x => /\/chunks\//.test(x)) && /^delete micTakes\/[^/]+$/.test(o[3])), JSON.stringify(txOps));
    await shot('mic-3-after');
    // the confirm, drawn on the page for the screenshot (a native dialog does not show in a headless screenshot)
    if (SHOTS) {
      await boot(MAIN);
      const msg = (await js(`(() => { window.__confirmAnswer = false; document.getElementById('t-mic-old-del').click(); return window.__confirms[0]; })()`)) || '';
      await js(`(() => { const b = document.createElement('div'); b.style.cssText = 'position:fixed;left:50%;top:18%;transform:translateX(-50%);width:460px;background:#fff;color:#111;border:1px solid #888;border-radius:10px;box-shadow:0 10px 36px rgba(0,0,0,.35);padding:18px 20px;font:14px system-ui;z-index:9999;white-space:pre-wrap';
        b.textContent = 'This page says\\n\\n' + ${JSON.stringify(msg)} + '\\n\\n[ Cancel ]   [ OK ]\\n\\n(the exact window.confirm() text; drawn here because a headless screenshot does not show the native dialog)'; document.body.appendChild(b); })()`);
      await shot('mic-2-confirm');
    }

    // ── fail: the 2nd delete fails ──
    await boot(MAIN);
    s0 = await state();
    await js(`window.__failTx = (n) => n === 2`);
    await press();
    let f1 = await state();
    const sorted = [idOf(1), idOf(0)];   // the list is newest first: the 31-day take is deleted first, the 45-day one second
    check('fail: note says Deleted 1 of 2; 1 failed', /Deleted 1 of 2; 1 failed and is still whole\./.test(f1.note), f1.note);
    check('fail: the first take is gone (doc and chunks)', !f1.takes.includes('micTakes/' + sorted[0]) && f1.chunks[sorted[0]] === undefined);
    check('fail: the failed take is whole (doc and 3 chunks)', f1.takes.includes('micTakes/' + sorted[1]) && f1.chunks[sorted[1]] === 3, JSON.stringify(f1.chunks));
    check('fail: the other 4 remain whole', [2, 3, 4, 5].every(i => f1.chunks[idOf(i)] === 3));
    check('fail: count doc untouched', f1.count === s0.count);
    check('fail: the line now says 1 and the button can be pressed again', /^1 recording is older than 30 days\./.test(f1.line) && f1.btn === 'Delete 1 recording older than 30 days', f1.line + ' / ' + f1.btn);
    await shot('mic-4-after-failure');
    await js(`window.__failTx = null`);
    await press();
    let f2 = await state();
    check('fail: the retry deletes it', !f2.takes.includes('micTakes/' + sorted[1]) && f2.chunks[sorted[1]] === undefined && /Deleted 1 of 1\./.test(f2.note), f2.note);
    check('fail: after the retry 4 takes remain whole', f2.takes.length === 4 && [2, 3, 4, 5].every(i => f2.chunks[idOf(i)] === 3));
    check('fail: confirm said 1 the second time', /^Delete 1 recording older than 30 days\?/.test(f2.confirms[1] || ''), JSON.stringify(f2.confirms));

    // ── failread: the chunk list of the first old take cannot be read ──
    await boot(MAIN);
    await js(`window.__readFail = p => p === 'micTakes/${idOf(1)}/chunks'`);
    await press();
    let r1 = await state();
    check('failread: 1 of 2, 1 failed; that take whole', /Deleted 1 of 2; 1 failed/.test(r1.note) && r1.chunks[idOf(1)] === 3 && r1.chunks[idOf(0)] === undefined, r1.note + ' ' + JSON.stringify(r1.chunks));

    // ── boundary ──
    const B = [{ ageMs: 30 * D }, { ageMs: 31 * D - MIN }, { ageMs: 31 * D }, { ageMs: 31 * D + MIN }];
    await boot(B);
    let b0 = await state();
    check('boundary: 2 old (31 d and 31 d 1 min), 30 d and 30 d 23 h 59 min kept', /^2 recordings are older than 30 days\./.test(b0.line), b0.line);
    await press();
    let b1 = await state();
    check('boundary: deleted exactly 31 d and 31 d 1 min', b1.takes.length === 2 && b1.takes.includes('micTakes/' + idOf(0)) && b1.takes.includes('micTakes/' + idOf(1)), b1.takes.join());

    // ── replaced between drawing and the click ──
    await boot(MAIN);
    await js(`(() => { const d = __store.get('micTakes/${idOf(0)}'); d.savedAt = { __ts: Date.now() }; __store.set('micTakes/${idOf(0)}', d); })()`);
    await press();
    let p1 = await state();
    check('replaced: the newer take is kept and said so', p1.chunks[idOf(0)] === 3 && p1.chunks[idOf(1)] === undefined && /Deleted 1 of 2\. 1 recording had been replaced by a newer take and was kept\./.test(p1.note), p1.note);

    // ── cancel ──
    await boot(MAIN);
    let c0 = await state();
    await js(`window.__confirmAnswer = false; document.getElementById('t-mic-old-del').click()`);
    await sleep(500);
    let c1 = await state();
    check('cancel: nothing changes', c1.takes.length === 6 && JSON.stringify(c1.chunks) === JSON.stringify(c0.chunks) && c1.count === c0.count && c1.confirms.length === 1);

    // ── none old ──
    await boot([{ ageMs: 2 * D }, { ageMs: null }]);
    let n0 = await state();
    check('none: "No recordings are older than 30 days", no button', /^No recordings are older than 30 days\./.test(n0.line) && n0.btn === null, n0.line);

    // ── every old take deleted: the result still shows ──
    await boot([{ ageMs: 40 * D }]);
    await js(`document.getElementById('t-mic-old-del').click()`);
    await waitFor(`/Deleted 1 of 1/.test(document.getElementById('t-grid-container').textContent)`);
    let a1 = await state();
    check('all gone: "No recordings yet" and the result line', a1.takes.length === 0 && /Deleted 1 of 1\./.test(a1.note), a1.note);
    check('all gone: the confirm names no "other" takes when none is kept', a1.confirms.length === 1 && !/The other/.test(a1.confirms[0]), JSON.stringify(a1.confirms));
    check('main: the confirm names the 4 kept, with the no-date one', /The other 4 recordings \(30 days old or newer, or with no saved date\) are kept\./.test(s1.confirms[0] || ''), s1.confirms[0]);

    const errs = pageErrors.filter(e => !/firebase|firestore|googleapis|gstatic|ResizeObserver/i.test(e || ''));
    check('no page errors', errs.length === 0, errs.slice(0, 3).join(' | '));
    ws.close();
  } catch (e) { failed++; fails.push('run: ' + (e && e.stack || e)); }
  finally { try { proc.kill('SIGKILL'); } catch {} srv.close(); }
  for (const f of fails) console.log('  ✗ ' + f);
  console.log(`mic-old-takes-proof: ${pass + failed} checks, ${failed} failed`);
  process.exit(failed ? 1 : 0);
}
main();
