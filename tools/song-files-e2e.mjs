#!/usr/bin/env node
/* Song files, end to end in headless Chrome for Testing (2026-11-14). A MADE-UP private track (a sine tone ffmpeg
   writes, the length of the card's real full mix) goes through the whole Step 1 path against a STUB Firestore, never
   the real one, and nobody signs in:
     1. the console (index.html?teacher=true, the stub) — Manage → Song files: the file picked through the real
        file input (CDP DOM.setFileInputFiles), split into pieces and written to the stub; the view then lists it as
        uploaded and matching; Verify passes;
     2. the student page (dev bypass) with the same stub: one practice card's track paths switched, in the page only,
        to 'private:e2e-made-up' (nothing in the repo is switched). Play → "Loading the song… N%" (pieces slowed so
        the line can be seen) → the card plays the blob: copy; the month's count rose by the cost;
     3. reload, then the network cut (CDP offline) and the stub database emptied: Play again → it plays from the
        device copy (IndexedDB), with 0 database reads;
     4. signed out (currentUser null): Play → the plain line "Sign in to hear this song.", no player started;
     5. the monthly limit tripped (the stub's count at the limit, the device copy deleted): Play → the limit line;
     6. a Song Journey page whose box is switched (in the page only) to the private id, the loader added, signed out:
        the box shows the sign-in line and no <audio> element.
   Steps 2, 4 and 5 are screenshotted at 1366x657 in English and Spanish, the console view in English.
     node tools/song-files-e2e.mjs [--shots <dir>] [--chrome <path>]   (or CHROME=…; Chrome for Testing only)
   Exit 0: every step passed. 1: a step failed (each is printed). 2: could not run. Needs ffmpeg and Node 22+.
   One headless-Chrome run at a time on the Mac (CLAUDE.md). */
import { createServer } from 'node:http';
import { spawn, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import net from 'node:net';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const SHOTS = opt('--shots');
const CHROME = opt('--chrome') || process.env.CHROME;
const ID = 'e2e-made-up';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
/* The stub store travels between the console page and the student page through the server (POST, then GET at
   /__e2e/store), never through one big DevTools message. */
let STORE_TEXT = '';
function serve(dir){
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (p === '/__e2e/store') {
      if (req.method === 'POST') { const parts = []; req.on('data', c => parts.push(c)); req.on('end', () => { STORE_TEXT = Buffer.concat(parts).toString('utf8'); res.writeHead(200); res.end('ok'); }); return; }
      res.writeHead(200, { 'content-type': 'application/json' }); res.end(STORE_TEXT); return;
    }
    if (p.endsWith('/')) p += 'index.html';
    if (p === '/sw.js') { res.writeHead(404); res.end(); return; }     // no service worker: it would cache the shell across runs
    const f = normalize(join(dir, p));
    if (!f.startsWith(dir) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('not found'); return; }
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
  ws.onmessage = e => { const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else if (m.method) handlers.forEach(h => h(m.method, m.params)); };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  /* Every evaluation gives up after 30 s (a hang names its expression instead of stopping the run for good). */
  const evalJs = async expression => { const r = await Promise.race([send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }),
      new Promise((_, j) => setTimeout(() => j(new Error('no answer in 30 s to: ' + expression.slice(0, 120))), 30000))]);
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || JSON.stringify(r.exceptionDetails)); return r.result.value; };
  return { send, evalJs, on: h => handlers.push(h) };
}

/* The stub Firestore, in the page: doc/collection get, set (merge, FieldValue.increment and serverTimestamp
   sentinels), update, delete; Blob with fromUint8Array / toUint8Array. window.__sf counts reads and can slow the
   pieces (ms) or fail every call ('unavailable'). The store can be exported (base64) and imported, so the console's
   upload reaches the student page. Made-up data only. */
const STUB = String.raw`(() => {
  const store = new Map();
  window.__store = store;
  window.__sf = { reads: 0, pieceReads: 0, slow: 0, fail: null };
  class FBlob { constructor(u){ this._u = new Uint8Array(u); } static fromUint8Array(u){ return new FBlob(u); } toUint8Array(){ return new Uint8Array(this._u); } }
  const INC = '__inc', TS = { __ts: true };
  const clone = v => (v instanceof FBlob) ? v : (v && typeof v === 'object') ? (Array.isArray(v) ? v.map(clone) : Object.fromEntries(Object.entries(v).map(([k, x]) => [k, clone(x)]))) : v;
  const apply = (old, d) => { const out = Object.assign({}, old || {}); for (const [k, v] of Object.entries(d)) out[k] = (v && v[INC] != null) ? (Number(out[k]) || 0) + v[INC] : (v === TS ? new Date() : clone(v)); return out; };
  const gate = async (p, read) => {
    if (read){ __sf.reads++; if (/\/pieces\//.test(p)){ __sf.pieceReads++; if (__sf.slow) await new Promise(r => setTimeout(r, __sf.slow)); } }
    if (__sf.fail){ const e = new Error(__sf.fail); e.code = __sf.fail; throw e; }
  };
  const snapOf = p => ({ exists: store.has(p), id: p.split('/').pop(), data: () => clone(store.get(p)), ref: docRef(p) });
  function docRef(p){ return { path: p, id: p.split('/').pop(),
    get: async () => { await gate(p, true); return snapOf(p); },
    set: async (d, o) => { await gate(p); store.set(p, apply(o && o.merge ? store.get(p) : {}, d)); },
    update: async d => { await gate(p); store.set(p, apply(store.get(p), d)); },
    delete: async () => { await gate(p); store.delete(p); },
    collection: n => colRef(p + '/' + n) }; }
  function colRef(p){ const q = { doc: id => docRef(p + '/' + id), orderBy: () => q, limit: () => q, where: () => q,
    get: async () => { await gate(p, true); const docs = [...store.keys()].filter(k => k.startsWith(p + '/') && k.slice(p.length + 1).indexOf('/') < 0).sort().map(snapOf);
      return { docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) }; } }; return q; }
  const fdb = { collection: n => colRef(n), batch: () => { const ops = []; return { set: (r, d, o) => ops.push(() => r.set(d, o)), update: (r, d) => ops.push(() => r.update(d)), delete: r => ops.push(() => r.delete()), commit: async () => { for (const f of ops) await f(); } }; },
    runTransaction: async fn => fn({ get: r => r.get(), set: (r, d, o) => r.set(d, o), update: (r, d) => r.update(d) }) };
  window.db = fdb; try { db = fdb; } catch (e) {}
  window.ensureDb = async () => fdb; try { ensureDb = window.ensureDb; } catch (e) {}
  window.firebase = window.firebase || {};
  firebase.firestore = Object.assign(firebase.firestore || {}, { Blob: FBlob, FieldValue: { serverTimestamp: () => TS, delete: () => ({ __del: true }), increment: n => ({ [INC]: n }) } });
  const b64 = u => { let s = ''; for (let i = 0; i < u.length; i += 32768) s += String.fromCharCode.apply(null, u.subarray(i, i + 32768)); return btoa(s); };
  const unb64 = s => { const b = atob(s), u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; };
  window.__storeOut = prefix => JSON.stringify([...store].filter(([k]) => k.startsWith(prefix)).map(([k, v]) => [k, Object.fromEntries(Object.entries(v).map(([f, x]) => [f, x instanceof FBlob ? { __b64: b64(x._u) } : (x instanceof Date ? x.toISOString() : x)]))]));
  window.__storeIn = text => { for (const [k, v] of JSON.parse(text)) store.set(k, Object.fromEntries(Object.entries(v).map(([f, x]) => [f, x && x.__b64 != null ? new FBlob(unb64(x.__b64)) : x]))); };
  window.confirm = () => true; window.alert = m => { window.__alerts = (window.__alerts || []).concat(String(m)); };
  return true;
})()`;

async function main(){
  const watchdog = setTimeout(() => { console.log('song-files-e2e: ✗ HUNG (10 minutes)'); process.exit(3); }, 600000);
  watchdog.unref();
  if (!CHROME || !existsSync(CHROME)) { console.error('song-files-e2e: no Chrome for Testing: set CHROME or pass --chrome <path>'); return 2; }
  if (/\/Applications\/Google Chrome\.app\//.test(CHROME)) { console.error('song-files-e2e: refusing /Applications/Google Chrome.app (use Chrome for Testing)'); return 2; }
  if (spawnSync('ffmpeg', ['-version']).status !== 0) { console.error('song-files-e2e: needs ffmpeg'); return 2; }
  if (SHOTS) mkdirSync(SHOTS, { recursive: true });
  const work = mkdtempSync(join(tmpdir(), 'gc-songfiles-e2e-'));
  const { srv, port } = await serve(ROOT);
  const prof = join(work, 'chrome');
  const cdp = await freePort();
  const proc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-gpu',
    '--autoplay-policy=no-user-gesture-required', '--mute-audio', 'about:blank'], { stdio: 'ignore' });
  const fails = [], passes = [];
  const check = (name, cond, why) => { (cond ? passes : fails).push(name + (cond || why == null ? '' : ' — ' + why)); console.log((cond ? '  ✓ ' : '  ✗ ') + name + (cond || why == null ? '' : ' — ' + why)); };
  const shots = [];
  let page;
  try {
    for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }
    page = await openPage(cdp);
    const errs = [];
    // A leave-page dialog (the console during or after a write) is accepted, or it would hold every later call.
    page.on((m, p) => { if (m === 'Page.javascriptDialogOpening') page.send('Page.handleJavaScriptDialog', { accept: true }).catch(() => {}); });
    page.on((m, p) => { if (m === 'Runtime.exceptionThrown') errs.push((p.exceptionDetails.exception && p.exceptionDetails.exception.description) || p.exceptionDetails.text); });
    await page.send('Runtime.enable'); await page.send('Page.enable'); await page.send('DOM.enable');
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
    const js = e => page.evalJs(e);
    const waitFor = async (expr, ms = 8000) => { for (let t = 0; t < ms; t += 100) { if (await js(expr).catch(() => false)) return true; await sleep(100); } return false; };
    const shot = async name => { if (!SHOTS) return; const r = await page.send('Page.captureScreenshot', { format: 'png' }); const f = join(SHOTS, name + '.png'); writeFileSync(f, Buffer.from(r.data, 'base64')); shots.push(f); };
    const nav = async url => { console.log('   … ' + url.replace(/^http:\/\/[^/]+/, '')); await page.send('Page.navigate', { url }); await sleep(600); };

    /* ── the student page: pick the card, learn its track's length ── */
    const bootStudent = async () => {
      await nav(`http://127.0.0.1:${port}/index.html`);
      if (!(await waitFor(`typeof devBypass === 'function' && document.readyState === 'complete'`, 15000))) throw new Error('the page did not boot');
      await js(`devBypass()`); await sleep(1500);
      await js(STUB);
    };
    await bootStudent();
    const pick = await js(`(() => { const a = (window.CLASS_ACTIVITIES || []).find(x => x.view === 'card' && x.card && SNIPPET_TRACKS[x.card.track] && snippetHasFull(SNIPPET_TRACKS[x.card.track]));
      const tr = SNIPPET_TRACKS[a.card.track]; return { id: a.id, track: a.card.track, dur: tr.durationSec }; })()`);
    console.log(`== card ${pick.id}, track ${pick.track} (${pick.dur} s): its paths become private:${ID} in the page only`);
    const mp3 = join(work, ID + '.mp3');
    const ff = spawnSync('ffmpeg', ['-v', 'error', '-f', 'lavfi', '-i', `sine=frequency=220:duration=${Math.ceil(pick.dur) + 1}`, '-ac', '2', '-ar', '44100', '-b:a', '128k', '-y', mp3]);
    if (ff.status !== 0) throw new Error('ffmpeg: ' + ff.stderr);
    const bytes = readFileSync(mp3), sha = createHash('sha256').update(bytes).digest('hex');
    const entry = JSON.stringify({ file: ID + '.mp3', bytes: bytes.length, sha256: sha, durationSec: Math.ceil(pick.dur) + 1 });
    const pieces = Math.ceil(bytes.length / 900000);
    console.log(`== the made-up file: ${bytes.length} bytes, ${pieces} pieces, sha256 ${sha.slice(0, 12)}…`);

    /* ── 1. the console uploads it ── */
    await nav(`http://127.0.0.1:${port}/index.html?teacher=true`);
    await waitFor(`typeof ensureTeacherJs === 'function' && typeof CLASS_ACTIVITIES !== 'undefined'`, 15000);
    await js(`ensureTeacherJs()`);
    await waitFor(`typeof showTeacherApp === 'function' && typeof renderTeacherManage === 'function'`, 15000);
    await js(STUB);
    await js(`SONG_FILES[${JSON.stringify(ID)}] = ${entry}; true`);
    await js(`showTeacherApp({ uid: 'stub-teacher', email: TEACHER_EMAIL, displayName: 'Teacher' }).catch(e => { window.__showErr = e.message; })`);
    await sleep(800);
    await js(`setTeacherView('manage')`);
    const hasView = await waitFor(`!!document.querySelector(${JSON.stringify(CONSOLE.view)})`, 8000);
    check('the console shows Manage → Song files', hasView);
    await waitFor(`!!document.querySelector(${JSON.stringify(CONSOLE.toggle)})`, 8000);
    await js(`document.querySelector(${JSON.stringify(CONSOLE.toggle)}).click(), true`);
    await waitFor(`!!document.querySelector(${JSON.stringify(CONSOLE.input)})`, 8000);
    const inputSel = CONSOLE.input;
    const { root } = await page.send('DOM.getDocument', { depth: -1 });
    const { nodeId } = await page.send('DOM.querySelector', { nodeId: root.nodeId, selector: inputSel });
    if (!nodeId) check('the upload file input is on the page', false, inputSel);
    else {
      await page.send('DOM.setFileInputFiles', { nodeId, files: [mp3] });
      // Chrome fires change for setFileInputFiles; only if nothing started after 3 s is it dispatched by hand.
      if (!(await waitFor(`__store.has('songFiles/${ID}')`, 3000)))
        await js(`(() => { const i = document.querySelector(${JSON.stringify(inputSel)}); i.dispatchEvent(new Event('change', { bubbles: true })); return true; })()`).catch(() => {});
      const up = await waitFor(`(__store.get('songFiles/${ID}') || {}).state === 'ready'`, 30000);
      check(`the console uploaded it: the head is ready and ${pieces} pieces are in the store`, up && await js(`[...__store.keys()].filter(k => k.startsWith('songFiles/${ID}/pieces/')).length`) === pieces);
      await sleep(600);
      const listed = await js(`document.querySelector(${JSON.stringify(CONSOLE.view)}).innerText`);
      check('the console lists it as uploaded and matching', listed.includes(ID) && CONSOLE.matches.test(listed), listed.slice(0, 300));
      await shot('console-song-files-en');
      const vbtn = await js(`(() => { const b = document.querySelector(${JSON.stringify(CONSOLE.verify)}); if (b) b.click(); return !!b; })()`);
      const verified = vbtn && await waitFor(`new RegExp(${JSON.stringify(CONSOLE.verified.source)}).test(document.querySelector(${JSON.stringify(CONSOLE.view)}).innerText)`, 20000);
      check('Verify passes on the uploaded file', !!verified);
      await shot('console-song-files-verified-en');
    }
    // The files and pieces, not the console's own count.
    await js(`fetch('/__e2e/store', { method: 'POST', body: __storeOut('songFiles/') }).then(r => r.ok)`);
    if (!/pieces/.test(STORE_TEXT)) throw new Error('nothing was uploaded; the student half has nothing to load');
    const storeIn = `fetch('/__e2e/store').then(r => r.text()).then(t => { __storeIn(t); return true; })`;

    /* ── 2. the student plays it ── */
    const switchCard = `(() => { const tr = SNIPPET_TRACKS[${JSON.stringify(pick.track)}]; for (const k of ['src', 'srcSlow', 'srcFull', 'srcFullSlow']) if (tr[k]) tr[k] = 'private:${ID}';
      SONG_FILES[${JSON.stringify(ID)}] = ${entry}; openClassActivitiesScreen(${JSON.stringify(pick.id)}); return true; })()`;
    const cardRoot = `document.querySelector('.pc[data-id="${pick.id}"]')`;
    const play = `(() => { const b = ${cardRoot}.querySelector('.pc-play'); b.click(); return true; })()`;
    const line = `((${cardRoot}.querySelector('.pc-status') || {}).innerText || '')`;
    const playing = `!!(pcState && pcState.root === ${cardRoot} && /^blob:/.test(pcState.audio.src))`;
    const dropCopy = () => js(`new Promise(r => { const q = indexedDB.deleteDatabase('gc-song-files'); q.onsuccess = q.onerror = q.onblocked = () => r(true); })`);
    for (const lang of ['en', 'es']) {
      await bootStudent();
      await dropCopy();
      await bootStudent();
      await js(storeIn);
      await js(`__sf.slow = 700; setLang(${JSON.stringify(lang)}); true`);
      await js(switchCard); await sleep(1200);
      await js(play);
      const seen = await waitFor(`/\\d+%/.test(${line}) && !/ 0%/.test(${line})`, 10000);
      const txt = await js(line);
      check(`[${lang}] the card shows the loading line with a % (${JSON.stringify(txt)})`, seen && (lang === 'en' ? /^Loading the song… \d+%$/ : /^Cargando la canción… \d+%$/).test(txt), txt);
      await shot(`loading-line-${lang}`);
      check(`[${lang}] the card then plays the device copy (a blob: address)`, await waitFor(playing, 20000));
      if (lang === 'en') {
        const u = await js(`(__store.get('songFilesUsage/' + songFileMonth()) || {}).bytes`);
        check(`the month's count rose by the cost (${u} = ceil(${bytes.length} × 4/3))`, u === Math.ceil(bytes.length * 4 / 3), String(u));
      }
      await js(`pcStop(); true`);
    }

    /* ── 3. reload; the network cut; the database empty: it plays from the device copy ── */
    await bootStudent();
    await page.send('Network.enable');
    await page.send('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await js(`__sf.fail = 'unavailable'; setLang('en'); true`);
    await js(switchCard); await sleep(1200);
    const r0 = await js(`__sf.reads`);
    await js(play);
    check('offline after a reload, with the store unreachable: it plays from the device copy', await waitFor(playing, 10000));
    check('…with 0 database reads', await js(`__sf.reads`) === r0);
    await js(`pcStop(); true`);
    await page.send('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });

    /* ── 4. signed out ── 5. the limit ── */
    for (const lang of ['en', 'es']) {
      await bootStudent();
      await js(storeIn);
      await js(`setLang(${JSON.stringify(lang)}); true`);
      await js(switchCard); await sleep(1200);
      await js(`currentUser = null; true`);
      await js(play); await sleep(500);
      const so = await js(line);
      check(`[${lang}] signed out: one plain line, nothing playing (${JSON.stringify(so)})`, so === (lang === 'en' ? 'Sign in to hear this song.' : 'Inicia sesión para escuchar esta canción.') && !(await js(`!!pcState`)), so);
      await shot(`signed-out-line-${lang}`);
      await js(`currentUser = { uid: 'dev-user', displayName: 'Dev User', email: 'dev@test.local' }; true`);
      await dropCopy();
      await bootStudent();
      await js(storeIn);
      await js(`__store.set('songFilesUsage/' + songFileMonth(), { bytes: SONG_FILES_MONTH_LIMIT }); setLang(${JSON.stringify(lang)}); true`);
      await js(switchCard); await sleep(1200);
      const pr0 = await js(`__sf.pieceReads`);
      await js(play);
      await waitFor(`/month|mes/.test(${line})`, 8000);
      const lim = await js(line);
      check(`[${lang}] the limit tripped: one plain line, nothing read, nothing playing (${JSON.stringify(lim)})`, /next month|próximo mes/.test(lim) && await js(`__sf.pieceReads`) === pr0 && !(await js(`!!pcState`)), lim);
      await shot(`limit-line-${lang}`);
    }

    /* ── 6. a Song Journey page, signed out ── */
    await nav(`http://127.0.0.1:${port}/tabs/luna.html`);
    await waitFor(`document.readyState === 'complete' && typeof ensurePlayer === 'function'`, 15000);
    await js(`setLang('en'), true`);   // the app's steps above left the shared language on Spanish
    await js(`new Promise(r => { const s = document.createElement('script'); s.src = '../app/songfiles.js'; s.onload = () => r(true); s.onerror = () => r(false); document.head.appendChild(s); })`);
    await js(`(() => { const b = document.getElementById('playalong-frame'); for (const k of Object.keys(b.dataset)) if (/^audio/.test(k)) b.dataset[k] = 'private:${ID}'; return true; })()`);
    await js(`(() => { const btn = document.querySelector('[onclick*="togglePlayalong"]'); if (btn) btn.click(); else { const b = document.getElementById('playalong-frame'); b.hidden = false; ensurePlayer(); } return true; })()`);
    await sleep(500);
    const jp = await js(`(() => { const b = document.getElementById('playalong-frame'); return { line: (b.querySelector('.sf-line') || {}).textContent || '', audio: !!b.querySelector('audio') }; })()`);
    check(`a Song Journey page switched to a private file, signed out: the sign-in line and no player (${JSON.stringify(jp.line)})`, jp.line === 'Sign in to hear this song.' && !jp.audio, JSON.stringify(jp));
    await js(`(() => { const b = document.getElementById('playalong-frame'); b.scrollIntoView({ block: 'center' }); return true; })()`);
    await shot('journey-signed-out-en');

    const pageErrs = errs.filter(e => !/firebase|firestore|googleapis|gstatic|net::|Failed to fetch|NotAllowedError|play\(\)|AbortError|NotSupportedError|offline/i.test(e || ''));
    check('no page error', !pageErrs.length, pageErrs.slice(0, 3).join(' | '));
  } catch (e) {
    check('the run finished', false, e.message);
  } finally {
    try { proc.kill('SIGKILL'); } catch {}
    srv.close();
    try { rmSync(work, { recursive: true, force: true }); } catch {}
  }
  console.log(`\nsong-files-e2e: ${passes.length + fails.length} steps, ${fails.length} failed${shots.length ? `; ${shots.length} screenshots in ${SHOTS}` : ''}`);
  return fails.length ? 1 : 0;
}
/* The console's Song files view (teacher-songfiles.js): where it is, its file input, a Verify button, and the words
   that mean "uploaded and matching" / "verified". */
const CONSOLE = { view: '#t-songfiles-block', toggle: '#t-songfiles-block [data-tsf-act="toggle"]', input: '#t-songfiles-block input[type=file][data-tsf-file]', verify: '#t-songfiles-block [data-tsf-act="verify-all"]', matches: /on the list, uploaded, matches/, verified: /Verified 1 of 1 song file/ };
process.exit(await main());
