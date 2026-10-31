#!/usr/bin/env node
/* trainer-e2e.mjs — real-browser test of the "Hear It First" trainer.

     node tools/trainer-e2e.mjs                    the whole walk (about 5 minutes)
     node tools/trainer-e2e.mjs --quick            skip the long placement/session walk
     node tools/trainer-e2e.mjs --shots=<dir>      where the screenshots go
     node tools/trainer-e2e.mjs --chrome <path>    Chrome binary (or CHROME=…)

   Serves this checkout, starts headless Chrome, signs in through the dev bypass
   (localhost only) and opens  index.html?hif=1&hifdebug=1 . No Firebase, no
   student data: the dev-bypass user cannot write to Firestore, and the store
   is localStorage here. Needs Node 22+ and Chrome.

   THE FAKE GUITAR. getUserMedia is replaced (before any site script runs) by a
   MediaStream that this script plays synthesized plucks into at exact pitches
   (the Simon Guitar Hero precedent in tools/mic-sim, in a real page). The
   site's own coach.js then reads that stream: its analyser, its onset
   detector, its YIN pitch reader. Only the guitar is fake. The scripted
   "learner" reads the trainer's current item and plays what that item asks
   for, so a pass means: prompt → sound → detection → grading → feedback →
   saved profile all worked together.

   What it checks (the work order's Playwright list, on Chrome's DevTools
   protocol instead, as tools/smoke.mjs does — Playwright is not installed):
     · the direct link opens the trainer; a normal visit loads none of it and
       the Games hub has no trainer card
     · the input picker lists devices; the meter moves; open low E reads E
     · the tuning check passes in-tune strings and catches a detuned one
     · placement and a session of right answers, all six tasks
     · Hunt: wrong, wrong, right counts both wrong notes; One shot says
       "N fret(s) too high — you played a X, target was Y"; 30 cents off still
       reads; 48 cents off is "didn't catch that"
     · a repeated mistake brings its lesson card; the skill map draws
     · the profile saves, and a reload restores it
     · desktop 1440×900 and 1920×1080, light and dark: screenshots
   Exit code 0 when every check passes. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const flag = (n) => args.includes('--' + n);
const opt = (n, d) => { const a = args.find((x) => x.startsWith('--' + n + '=')); if (a) return a.slice(n.length + 3); const i = args.indexOf('--' + n); return i >= 0 && args[i + 1] ? args[i + 1] : d; };
const QUICK = flag('quick');
const ONLY = opt('only', '') ? opt('only', '').split(',') : null;
const want = (k) => !ONLY || ONLY.includes(k);
const SHOTS = opt('shots', join(tmpdir(), 'hif-e2e-shots'));
mkdirSync(SHOTS, { recursive: true });

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.pdf': 'application/pdf' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
function findChrome() {
  const given = opt('chrome', '') || process.env.CHROME; if (given) return given;
  const c = platform() === 'darwin' ? ['/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', '/Applications/Chromium.app/Contents/MacOS/Chromium']
    : platform() === 'win32' ? [process.env['ProgramFiles'] + '\\Google\\Chrome\\Application\\chrome.exe', process.env['ProgramFiles(x86)'] + '\\Google\\Chrome\\Application\\chrome.exe']
      : ['/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'];
  return c.find((p) => p && existsSync(p));
}
function serve(dir) {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = normalize(join(dir, p));
    if (!f.startsWith(dir) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(f));
  });
  return new Promise((r) => srv.listen(0, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}
async function openPage(port) {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const handlers = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else if (m.method) handlers.forEach((h) => h(m.method, m.params));
  };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expression) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  return { send, ev, on: (h) => handlers.push(h), close: async () => { try { ws.close(); await fetch(`http://127.0.0.1:${port}/json/close/${t.id}`); } catch { /* gone */ } } };
}

/* The fake guitar, installed before any site script runs. */
const FAKE = `(() => {
  if (/[?&]nofake=1/.test(location.href)) return;
  const md = navigator.mediaDevices; if (!md) return;
  let ctx = null, dest = null;
  function init() {
    if (ctx) return;
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    dest = ctx.createMediaStreamDestination();
  }
  window.__gum = [];
  window.__pluck = (midi, o) => {
    init(); o = o || {};
    const sr = ctx.sampleRate, f = 440 * Math.pow(2, (midi - 69) / 12), len = Math.floor(sr * (o.dur || 1.6));
    const buf = ctx.createBuffer(1, len, sr), d = buf.getChannelData(0), amp = o.amp || 0.22;
    const lfo = o.vib ? o.vib : 0;
    let ph = 0;
    for (let i = 0; i < len; i++) {
      const t = i / sr; let v = 0;
      /* phase is accumulated, so a vibrato of +-lfo cents really is +-lfo cents */
      const ff = f * (lfo ? Math.pow(2, (lfo * Math.sin(2 * Math.PI * 5.5 * t)) / 1200) : 1);
      ph += 2 * Math.PI * ff / sr;
      for (let k = 1; k <= 5; k++) v += Math.sin(k * ph) * Math.exp(-t * (2.2 + k * 1.1)) / k;
      if (t < 0.012) v += (Math.random() * 2 - 1) * 0.5 * (1 - t / 0.012);
      d[i] = v * amp * Math.min(1, t / 0.004);
    }
    const src = ctx.createBufferSource(); src.buffer = buf; src.connect(dest); src.start();
    return true;
  };
  window.__quiet = () => true;
  md.getUserMedia = async (c) => { init(); if (ctx.state !== 'running') { try { await ctx.resume(); } catch (e) {} } window.__gum.push(JSON.stringify(c)); return dest.stream; };
  md.enumerateDevices = async () => [
    { kind: 'audioinput', deviceId: 'fake-interface', label: 'Fake interface (test)', groupId: 'a' },
    { kind: 'audioinput', deviceId: 'fake-mic', label: 'Fake mic by the amp (test)', groupId: 'b' },
    { kind: 'audiooutput', deviceId: 'out', label: 'Speakers', groupId: 'c' }
  ];
})();`;

const results = [];
function check(name, ok, detail) { results.push({ name, ok: !!ok, detail: detail || '' }); console.log(`  ${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? '  [' + detail + ']' : ''}`); }

const chrome = findChrome();
if (!chrome) { console.error('trainer-e2e: no Chrome found — pass --chrome <path> or set CHROME'); process.exit(2); }
if (typeof WebSocket === 'undefined') { console.error('trainer-e2e: needs Node 22+'); process.exit(2); }

const cleanup = []; let exitCode = 0;
try {
  const prof = mkdtempSync(join(tmpdir(), 'hif-chrome-'));
  const cdp = await freePort();
  const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream',
    '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
  cleanup.push(() => proc.kill(), () => rmSync(prof, { recursive: true, force: true }));
  for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }
  const here = await serve(ROOT); cleanup.push(() => here.srv.close());
  const base = `http://127.0.0.1:${here.port}`;
  console.log(`trainer-e2e: serving ${base}, screenshots in ${SHOTS}`);

  async function newPage(url, { w = 1440, h = 900, dark = false, fake = true, stub = null } = {}) {
    const page = await openPage(cdp);
    const errors = [];
    page.on((m, p) => {
      if (m === 'Runtime.exceptionThrown') errors.push('exception: ' + ((p.exceptionDetails.exception && p.exceptionDetails.exception.description) || p.exceptionDetails.text));
      if (m === 'Runtime.consoleAPICalled' && p.type === 'warning' && /Hear It First/.test(p.args.map((a) => a.value || '').join(' '))) errors.push('warn: ' + p.args.map((a) => a.value || a.description || '').join(' '));
      if (m === 'Runtime.consoleAPICalled' && p.type === 'error') errors.push('console.error: ' + p.args.map((a) => a.value || a.description || '').join(' '));
    });
    await page.send('Runtime.enable'); await page.send('Page.enable'); await page.send('Network.enable');
    const requested = []; page.on((m, p) => { if (m === 'Network.requestWillBeSent') requested.push(p.request.url); });
    if (fake) await page.send('Page.addScriptToEvaluateOnNewDocument', { source: FAKE });
    /* a stubbed-database page must not see the profile an earlier page saved in this browser */
    if (stub) await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `try { localStorage.removeItem('hif:v1:dev-user'); } catch (e) {}` });
    await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] });
    await page.send('Page.navigate', { url });
    for (let i = 0; i < 80; i++) { if (await page.ev(`typeof devBypass === 'function' && document.readyState !== 'loading'`).catch(() => false)) break; await sleep(250); }
    await sleep(800);
    if (stub) {
      /* the dev bypass never writes to Firestore; pretend this is a real signed-in student with a stub database */
      await page.ev(`(() => { window.__stub = { sets: [], docs: ${JSON.stringify(stub.docs || {})} };
        window.__stubDb = { collection: (c) => ({ doc: (id) => ({
          get: async () => ({ exists: !!window.__stub.docs[c + '/' + id], data: () => window.__stub.docs[c + '/' + id] }),
          set: async (d, o) => { window.__stub.sets.push({ c, id, d: JSON.parse(JSON.stringify(d)), o }); window.__stub.docs[c + '/' + id] = Object.assign({}, window.__stub.docs[c + '/' + id], d); } }) }) };
        window.isDevBypassUser = () => false; window.ensureDb = async () => window.__stubDb;
        /* a real Firebase user exists: tell anyone watching sign-in state so */
        auth = { onAuthStateChanged: (cb) => { setTimeout(() => cb({ uid: 'dev-user' }), 0); return () => {}; } }; })()`);
    }
    await page.ev('devBypass()');
    page.errors = errors; page.requested = requested;
    page.until = async (expr, ms = 20000, step = 150) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { try { if (await page.ev(expr)) return true; } catch (e) { /* page busy */ } await sleep(step); } return false; };
    page.shot = async (name) => { const r = await page.send('Page.captureScreenshot', { format: 'png' }); const f = join(SHOTS, name + '.png'); writeFileSync(f, Buffer.from(r.data, 'base64')); return f; };
    page.click = (sel) => page.ev(`(() => { const b = document.querySelector(${JSON.stringify(sel)}); if (!b) return false; b.click(); return true; })()`);
    page.pluck = (m, o) => page.ev(`window.__pluck(${m}, ${JSON.stringify(o || {})})`);
    page.text = (sel) => page.ev(`(() => { const n = document.querySelector(${JSON.stringify(sel)}); return n ? n.textContent : null; })()`);
    page.item = async () => JSON.parse(await page.ev(`JSON.stringify(window.__hif.trainer.debug.state().cur)`));
    return page;
  }
  const NOISE = /firebase|firestore|googleapis|gstatic|google\.com|youtube|ytimg|net::ERR|Failed to fetch|ERR_|auth\/|identitytoolkit|favicon|Content Security|websocket|WebChannel|Missing or insufficient|offline|Could not reach|NotAllowedError|play\(\) request|AbortError|NotSupportedError|The play\(\)/i;
  const realErrors = (p) => p.errors.filter((e) => !NOISE.test(e));

  /* A pluck that repeats until the thing it should cause has happened (the trainer is deaf while it plays its own tones). */
  async function pluckUntil(page, midi, cond, { every = 1500, max = 40000, opts } = {}) {
    const t0 = Date.now();
    while (Date.now() - t0 < max) {
      if (await page.ev(cond).catch(() => false)) return true;
      await page.pluck(midi, opts); await sleep(every);
    }
    return await page.ev(cond).catch(() => false);
  }
  const NEXT = `!!document.querySelector('#hif-nav [data-act=next]')`;

  /* ───── 1. a normal visit loads none of the trainer ───── */
  console.log('\n1. Hidden from students');
  if (want('1')) {
    const p = await newPage(`${base}/index.html`, { w: 1366, h: 657 });
    await sleep(1500);
    const hasRoot = await p.ev(`!!document.getElementById('hif-root')`);
    const hasGlobals = await p.ev(`typeof window.HIF_CORE !== 'undefined' || typeof window.HIF_UI !== 'undefined'`);
    const fetched = p.requested.filter((u) => /trainer-(core|audio|ui)\\.js/.test(u));
    check('a normal visit has no trainer overlay and loads no trainer-core/audio/ui', !hasRoot && !hasGlobals && fetched.length === 0, `adapter fetched: ${p.requested.some((u) => /trainer-site-adapter/.test(u))}`);
    await p.ev(`toggleGames()`);
    await p.until(`document.getElementById('games-panel') && document.getElementById('games-panel').textContent.length > 200`, 15000);
    await sleep(500);
    const hub = await p.ev(`document.getElementById('games-panel').textContent`);
    check('the Games hub (a student view) has no trainer card', !/Hear It First|trainer/i.test(hub), `${hub.length} chars of hub text`);
    await p.shot('student-games-hub-1366x657');
    check('no script errors on a normal visit', realErrors(p).length === 0, realErrors(p).slice(0, 2).join(' | '));
    await p.close();
  }

  /* ───── 2. the direct link, setup, input picker, tuning ───── */
  if (want('main')) {
  console.log('\n2. Direct link, input picker, tuning check');
  const page = await newPage(`${base}/index.html?hif=1&hifdebug=1`, { w: 1440, h: 900 });
  const opened = await page.until(`!!document.getElementById('hif-root') && /Input/.test(document.getElementById('hif-root').textContent) && !!window.__hif`, 25000);
  check('the direct link opens the trainer (first run shows Setup)', opened);
  if (!opened) {
    const diag = await page.ev(`JSON.stringify({ user: typeof currentUser !== 'undefined' && !!currentUser, onScreen: typeof appIsOnScreen === 'function' && appIsOnScreen(), core: typeof HIF_CORE, ui: typeof HIF_UI, audio: typeof HIF_AUDIO, root: !!document.getElementById('hif-root'), rootText: (document.getElementById('hif-root')||{}).textContent, href: location.href })`);
    console.log('  diagnostics:', diag, '\n  page errors:', JSON.stringify(page.errors.slice(0, 5)));
    throw new Error('the trainer did not open');
  }
  await page.shot('01-setup-light-1440x900');
  await sleep(600);
  const devs = await page.ev(`[...document.querySelectorAll('#hif-dev option')].map(o => o.textContent)`);
  check('the input picker lists the interface and the mic', devs.some((d) => /Fake interface/.test(d)) && devs.some((d) => /Fake mic/.test(d)), devs.join(' | '));
  await page.ev(`(() => { const s = document.getElementById('hif-dev'); s.value = 'fake-mic'; })()`);
  await page.click('[data-act=setup-use]');
  check('"Use this input" opens it and asks the browser for that device', await page.until(`/Input is on/.test(document.getElementById('hif-msg').textContent)`, 15000)
    && (await page.ev(`window.__gum.some(g => g.includes('fake-mic'))`)), 'getUserMedia asked for deviceId fake-mic');
  await page.pluck(40);
  check('open low E reads as E (live note)', await page.until(`/^E2/.test(document.getElementById('hif-live').textContent)`, 6000), await page.text('#hif-live'));
  const lvl = await page.ev(`document.getElementById('hif-lvl').style.width`);
  check('the level meter moves', parseInt(lvl, 10) > 0 || (await page.until(`parseInt(document.getElementById('hif-lvl').style.width,10) > 0`, 3000)), `width ${lvl}`);
  await page.shot('02-setup-input-on-light');
  // tuning check: five in tune, the A string 30 cents sharp
  await page.click('#hif-tbtn');
  const open = [40, 45, 50, 55, 59, 64];
  for (let i = 0; i < 6; i++) {
    const want = 'Play your open';
    await page.until(`document.getElementById('hif-tmsg').textContent.startsWith('${want}') && document.getElementById('hif-t${i}').classList.contains('cur')`, 8000);
    await pluckUntil(page, open[i] + (i === 1 ? 0.3 : 0.02), `document.getElementById('hif-t${i}').classList.contains('good') || document.getElementById('hif-t${i}').classList.contains('offc')`, { every: 1400, max: 15000 });
  }
  await page.until(`document.getElementById('hif-tmsg').classList.contains('bad') || document.getElementById('hif-tmsg').classList.contains('ok')`, 8000);
  const tmsg = await page.text('#hif-tmsg');
  const cls = await page.ev(`[0,1,2,3,4,5].map(i => document.getElementById('hif-t'+i).className)`);
  check('the tuning check passes in-tune strings and catches the A string 30 cents sharp', cls[1].includes('offc') && [0, 2, 3, 4, 5].every((i) => cls[i].includes('good')) && /A is 30 cents sharp/.test(tmsg), tmsg.replace(/\s+/g, ' '));
  check('a detuned string offers the site tuner', await page.ev(`!document.getElementById('hif-tuner').hidden`));
  await page.shot('03-setup-tuning-offtune-light');

  /* ───── 3. placement ───── */
  console.log('\n3. Placement and a short session (all six tasks)');
  const seenTasks = new Set(); let itemsAnswered = 0;

  async function answer(item) {
    seenTasks.add(item.task);
    const T = item.target ? item.target.midi : null;
    if (item.task === 'match') {
      return pluckUntil(page, T, NEXT, { every: 1600, max: 45000 });
    }
    if (item.task === 'call') {
      await page.click(`[data-act=pick][data-i="${item.answerIndex}"]`); await sleep(300);
      await page.click('#hif-lock'); await sleep(500);
      return pluckUntil(page, T, NEXT, { every: 1600, max: 30000 });
    }
    if (item.task === 'hear') {
      await sleep(1800);
      await page.click(`[data-act=choose][data-v="${item.answerName}"]`);
      return page.until(NEXT, 8000);
    }
    if (item.task === 'phrase') {
      for (let i = 0; i < item.notes.length; i++) {
        const before = await page.ev(`document.querySelectorAll('.hif-dots i.ok, .hif-dots i.bad').length`);
        await pluckUntil(page, item.notes[i].midi, `document.querySelectorAll('.hif-dots i.ok, .hif-dots i.bad').length > ${before} || ${NEXT}`, { every: 1500, max: 30000 });
      }
      return page.until(NEXT, 8000);
    }
    return pluckUntil(page, T, NEXT, { every: 1600, max: 40000 });
  }
  await page.click('[data-act=setup-done]');
  check('Setup → Placement intro', await page.until(`/About 20 items/.test(document.body.innerText)`, 8000));
  await page.shot('04-placement-intro-light');
  let shotsTaken = new Set();
  if (QUICK) {
    await page.ev(`window.__hif.trainer.debug.engine().setPlacement('Z3','T2',2,[])`);
    await page.click('[data-act=home]'); await sleep(400);
  } else {
    await page.click('[data-act=go]');
    const t0 = Date.now();
    // screenshots of each drill kind as they come
    const origAnswer = answer;
    const out = await (async () => {
      for (let guard = 0; guard < 200; guard++) {
        const kind = await page.ev(`document.querySelector('.hif-drill') ? 'drill' : document.querySelector('[data-act=go]') ? 'go' : /Placed/.test(document.body.innerText) ? 'placed' : 'other'`);
        if (kind === 'placed') return 'placed';
        if (kind === 'go') { await page.click('[data-act=go]'); await sleep(400); continue; }
        if (kind !== 'drill') { await sleep(400); continue; }
        if (await page.ev(NEXT)) { await page.click('#hif-nav [data-act=next]'); await sleep(300); continue; }
        const item = await page.item();
        await sleep(2600);
        if (!shotsTaken.has(item.task)) { shotsTaken.add(item.task); await page.shot('05-drill-' + item.task + '-light'); }
        const ok = await origAnswer(item);
        itemsAnswered++;
        if (!ok) { check('placement item answered: ' + item.task + ' ' + item.cell, false, 'timed out'); return 'timeout'; }
      }
      return 'guard';
    })();
    check('placement finishes and shows where the learner landed', out === 'placed', `${itemsAnswered} items in ${Math.round((Date.now() - t0) / 1000)} s`);
    const placed = await page.ev(`document.body.innerText.replace(/\\s+/g, ' ')`);
    check('the placement result names a zone, a tier, strengths and work-on', /Placed: Zone Z\d/.test(placed) && /Tier T\d/.test(placed) && /Strong:/.test(placed) && /Work on next:/.test(placed), (placed.match(/Placed:[^.]*\.?/) || [''])[0].slice(0, 120));
    await page.shot('06-placement-result-light');
    const saved = await page.ev(`JSON.parse(localStorage.getItem('hif:v1:dev-user') || 'null')`);
    check('the profile saved after placement (zone, tier, cells under its own key)', saved && saved.placementDone && Object.keys(saved.cells).length > 5, saved ? `${Object.keys(saved.cells).length} cells, zone ${saved.zone}, tier ${saved.tier}` : 'nothing saved');
    check('placement used the interval and phrase and note tasks too', ['hear', 'phrase', 'note', 'match', 'call'].every((k) => seenTasks.has(k)), [...seenTasks].join(', '));
  }

  /* ───── 4. each task, on its own ───── */
  console.log('\n4. Each task, one at a time (Practice one task)');
  async function goHome() { await page.ev(`(() => { const b = document.querySelector('[data-act=home]') || document.querySelector('[data-act=stop]'); if (b) b.click(); })()`); await sleep(500); }
  async function startTask(k) {
    for (let i = 0; i < 4; i++) { if (await page.ev(`!!document.querySelector('[data-act=practice]')`)) break; await goHome(); }
    await page.click('[data-act=practice]'); await sleep(300);
    await page.click(`[data-act=task][data-v=${k}]`);
    return page.until(`!!document.querySelector('.hif-drill') || !!document.querySelector('[data-act=go]')`, 12000);
  }
  async function nextDrill() {
    for (let i = 0; i < 20; i++) {
      if (await page.ev(`!!document.querySelector('[data-act=go]') && !document.querySelector('.hif-drill')`)) { await page.click('[data-act=go]'); await sleep(300); }
      // a fresh drill frame has an empty nav row; the previous result screen still shows Next
      if (await page.ev(`!!document.querySelector('.hif-drill') && !document.querySelector('#hif-nav [data-act=next]')`)) return page.item();
      await sleep(300);
    }
    return null;
  }

  // Hunt: wrong, wrong, right
  await startTask('match');
  let it = await nextDrill(), tries = 0;
  while (it && it.mode !== 'hunt' && tries++ < 12) { await answer(it); await page.click('#hif-nav [data-act=next]'); await sleep(300); it = await nextDrill(); }
  check('a Hunt item came up (new cells start on Hunt)', it && it.mode === 'hunt', it ? `${it.cell} rung ${it.rung}` : 'none');
  if (it && it.mode === 'hunt') {
    const T = it.target.midi;
    await sleep(2500);
    await pluckUntil(page, T + 2, `document.querySelectorAll('#hif-tries div').length >= 1`, { every: 1500, max: 20000 });
    await pluckUntil(page, T - 1, `document.querySelectorAll('#hif-tries div').length >= 2`, { every: 1500, max: 20000 });
    const trLines = await page.ev(`[...document.querySelectorAll('#hif-tries div')].map(d => d.textContent)`);
    await pluckUntil(page, T, NEXT, { every: 1500, max: 20000 });
    const fb = await page.text('#hif-fb');
    check('Hunt counts the two wrong notes before the match', /Found it — 3 tries/.test(fb) && trLines.length === 2, `${trLines.join(' ; ')} → ${fb}`);
    check('each wrong Hunt note says direction + distance', trLines.every((l) => /too (high|low)|Wrong way|octave/.test(l)), trLines.join(' ; '));
    await page.shot('07-hunt-found-light');
  }
  await goHome();

  // One shot: set every match cell to rung 3 and answer one fret off on purpose
  await page.ev(`(() => { const e = window.__hif.trainer.debug.engine(), p = e.getProfile(); const cat = HIF_CORE.catalog().match; Object.keys(cat).forEach(k => { if (cat[k].move !== 'free') p.cells[k] = { m: 0.8, n: 10, r: 3, last: null, streak: 0, err: {}, hist: '' }; }); })()`);
  async function nextOneShot() {
    let x = await nextDrill();
    for (let g = 0; x && !(x.mode === 'oneshot' && x.showString) && g < 12; g++) {
      await answer(x); await page.click('#hif-nav [data-act=next]'); await sleep(300); x = await nextDrill();
    }
    return x;
  }
  await startTask('match');
  it = await nextOneShot();
  check('a One-shot item came up with the target string shown', it && it.mode === 'oneshot' && it.showString, it ? `${it.cell} rung ${it.rung}` : 'none');
  if (it) {
    await sleep(2800);
    await pluckUntil(page, it.target.midi + 1, NEXT, { every: 1500, max: 25000 });
    const fb = await page.text('#hif-fb');
    check('One shot says "1 fret too high — you played a X, target was Y."', /^1 fret too high — you played a \S+, target was \S+\.$/.test(fb) || /Wrong way/.test(fb) || /octave/.test(fb), fb);
    await page.shot('08-oneshot-miss-light');
    await page.click('#hif-nav [data-act=next]'); await sleep(400);
  }
  it = await nextOneShot();
  if (it) {
    await sleep(2800);
    await pluckUntil(page, it.target.midi + 0.3, NEXT, { every: 1500, max: 25000, opts: { vib: 18 } });
    const fb2 = await page.text('#hif-fb');
    check('30 cents sharp with light vibrato still reads as the right note', /^✓/.test(fb2), fb2);
    await page.click('#hif-nav [data-act=next]'); await sleep(400);
    it = await nextOneShot();
  }
  if (it) {
    await sleep(2800);
    await page.pluck(it.target.midi + 0.48); await sleep(3500);
    const fbU = await page.text('#hif-fb');
    check('48 cents off is "didn’t catch that", not a wrong answer', /Didn’t catch that/.test(fbU), fbU);
    await page.pluck(it.target.midi); await sleep(500);
    await pluckUntil(page, it.target.midi, NEXT, { every: 1500, max: 20000 });
  }
  await goHome();

  // Call it: right pick, wrong fret
  await startTask('call'); it = await nextDrill();
  if (it) {
    await sleep(1200);
    await page.click(`[data-act=pick][data-i="${it.answerIndex}"]`); await sleep(200); await page.click('#hif-lock'); await sleep(600);
    const wrong = it.target.midi + 1;
    await pluckUntil(page, wrong, NEXT, { every: 1500, max: 25000 });
    const fb = await page.text('#hif-fb');
    check('Call it: a right pick with a wrong played note says "Right sound, wrong fret."', /Right sound, wrong fret/.test(fb), fb);
    await page.shot('09-call-posError-light');
    await page.click('#hif-nav [data-act=next]'); await sleep(300);
  }
  await goHome();
  // Hear: a wrong choice, then a right one
  await startTask('hear'); it = await nextDrill();
  if (it) {
    await sleep(2200);
    const wrongName = it.choices.find((c) => c.err !== null).name;
    await page.click(`[data-act=choose][data-v="${wrongName}"]`);
    await page.until(NEXT, 6000);
    const fb = await page.text('#hif-fb');
    check('Hear the interval: a wrong choice names both', new RegExp(`It was ${it.answerName.replace('+', '\\+')}, not ${wrongName.replace('+', '\\+')}`).test(fb), fb);
    await page.shot('10-hear-miss-light');
    await page.click('#hif-nav [data-act=next]'); await sleep(300);
  }
  await goHome();
  // Play the interval, Find the note, Phrase: one perfect item each
  for (const k of ['play', 'note', 'phrase']) {
    if (!(await startTask(k))) { check('Practice ' + k + ' starts', false); continue; }
    it = await nextDrill();
    if (it) {
      await sleep(it.task === 'phrase' ? 4200 : 2600);
      const ok = await answer(it);
      const fb = await page.text('#hif-fb');
      check(`${k}: a right answer is graded right`, ok && /^✓|of \d+ —/.test(fb) && (it.task !== 'phrase' || new RegExp(`${it.notes.length} of ${it.notes.length}`).test(fb)), fb);
      await page.shot('11-' + k + '-result-light');
      await page.click('#hif-nav [data-act=next]'); await sleep(300);
    }
    await goHome();
  }

  /* ───── 5. a repeated mistake brings its lesson ───── */
  console.log('\n5. Lesson card');
  await startTask('match');
  let lesson = false;
  for (let i = 0; i < 8 && !lesson; i++) {
    it = await nextDrill();
    if (!it) break;
    if (await page.ev(`!!document.querySelector('.hif-card') && !document.querySelector('.hif-drill')`)) { lesson = true; break; }
    await sleep(2800);
    await pluckUntil(page, it.target.midi + 1, NEXT, { every: 1500, max: 25000 });
    await page.click('#hif-nav [data-act=next]'); await sleep(500);
    if (await page.ev(`!!document.querySelector('.hif-card') && !document.querySelector('.hif-drill')`)) lesson = true;
  }
  const lessonText = lesson ? await page.ev(`document.querySelector('.hif-line').textContent`) : '';
  check('two misses of the same kind bring a one-line lesson card with a figure and a Hear-it button', lesson && Object.values(await page.ev(`HIF_UI.STR.lessons`)).includes(lessonText) && (await page.ev(`!!document.querySelector('.hif-board svg') && !!document.querySelector('[data-act=hear-lesson]')`)), lessonText);
  if (lesson) {
    await page.shot('12-lesson-light'); await page.click('[data-act=go]'); await sleep(400);
    const sc = await nextDrill();
    check('after a lesson, two easier items follow with "Hear the slide" on', sc && sc.scaffold && sc.scaffold.hearSlide === true, sc ? JSON.stringify(sc.scaffold) : 'no item');
  }
  await goHome();

  /* contrast drill: a confusion pair seen three times */
  console.log('\n5b. Contrast drill, lost input, tuner handoff');
  await page.ev(`(() => { const e = window.__hif.trainer.debug.engine(), p = e.getProfile();
    ['m3','M3','P4','P5','M2','P8','m2','M6','m7'].forEach(n => { p.cells['hear|' + n + '|up'] = { m: 0.5, n: 3, r: 2, last: null, streak: 0, err: {}, hist: '' }; });
    p.conf = { 'm3>M3': 2, 'M3>m3': 2, 'P4>P5': 2, 'P5>P4': 2 }; p.drilled = {}; })()`);
  const PARTNER = { m3: 'M3', M3: 'm3', P4: 'P5', P5: 'P4' };
  await startTask('hear');
  let contrast = false;
  for (let i = 0; i < 24 && !contrast; i++) {
    const got = await page.until(`!!document.querySelector('[data-act=hear-contrast]') || (!!document.querySelector('.hif-drill') && !document.querySelector('#hif-nav [data-act=next]'))`, 15000);
    if (!got) break;
    if (await page.ev(`!!document.querySelector('[data-act=hear-contrast]')`)) { contrast = true; break; }
    const hi = await page.item(); await sleep(1800);
    const partner = PARTNER[hi.answerName];
    const pick = partner && hi.choices.some((c) => c.name === partner) ? partner : hi.answerName;
    await page.click(`[data-act=choose][data-v="${pick}"]`);
    await page.until(NEXT, 6000);
    await page.click('#hif-nav [data-act=next]'); await sleep(500);
    if (await page.ev(`!!document.querySelector('[data-act=hear-contrast]')`)) contrast = true;
  }
  const cTitle = contrast ? await page.ev(`document.querySelector('.hif-line').textContent`) : '';
  check('a confusion pair seen 3 times brings a contrast drill (both intervals named, back to back)', contrast && /^(m3|M3|P4|P5) vs (m3|M3|P4|P5)$/.test(cTitle), cTitle);
  if (contrast) {
    await page.shot('15-contrast-light'); await page.click('[data-act=go]'); await sleep(500);
    const ci = await nextDrill();
    check('four quick Hear items follow, alternating the pair', ci && ci.scaffold && ci.scaffold.contrast === true && ci.scaffold.pair.includes(ci.answerName), ci ? ci.answerName + ' of ' + (ci.scaffold ? ci.scaffold.pair : '') : 'none');
  }
  await goHome();

  /* the input drops out (a hidden tab, another tool takes the mic) */
  await startTask('match'); await nextDrill();
  await page.ev(`coachMicOff()`);
  const lostOk = await page.until(`!!document.getElementById('hif-dev') && /The input stopped/.test(document.getElementById('hif-msg').textContent)`, 8000);
  check('when the input is taken away the trainer says so and offers to reopen it', lostOk);
  await page.click('[data-act=setup-use]');
  check('"Use this input" brings it back', await page.until(`/Input is on/.test(document.getElementById('hif-msg').textContent)`, 10000));

  /* the tuner handoff */
  await page.ev(`(() => { const b = document.getElementById('hif-tuner'); b.hidden = false; b.click(); })()`);
  await sleep(1100);
  const away = await page.ev(`(() => ({ rootHidden: document.getElementById('hif-root').style.display === 'none', pill: [...document.querySelectorAll('body > button')].some(b => /Back to Hear It First/.test(b.textContent) && b.style.display !== 'none'), tuner: document.getElementById('tuner-popup').classList.contains('open') }))()`);
  check('the tuner button steps the overlay aside, opens the site tuner and leaves a way back', away.rootHidden && away.pill && away.tuner, JSON.stringify(away));
  await page.shot('16-tuner-handoff');
  await page.ev(`[...document.querySelectorAll('body > button')].find(b => /Back to Hear It First/.test(b.textContent)).click()`);
  const back = await page.until(`document.getElementById('hif-root').style.display !== 'none' && !!document.querySelector('[data-act=start]') && !document.getElementById('tuner-popup').classList.contains('open')`, 12000);
  check('the pill brings the trainer back (tuner closed, input reopened, Home)', back);

  /* ───── 6. skill map, save, reload ───── */
  console.log('\n6. Skill map, save, reload');
  await page.click('[data-act=map]'); await sleep(500);
  const cells = await page.ev(`document.querySelectorAll('.hif-cell').length`);
  check('the skill map draws its three panels', cells > 200 && (await page.ev(`document.querySelectorAll('.hif-panel').length`)) === 3, `${cells} cells`);
  await page.shot('13-skillmap-light');
  const before = await page.ev(`(() => { const p = JSON.parse(localStorage.getItem('hif:v1:dev-user')); return p.zone + '/' + p.tier; })()`);
  await goHome();
  await page.shot('14-home-light');
  await page.send('Page.navigate', { url: `${base}/index.html?hif=1&hifdebug=1` });
  for (let i = 0; i < 60; i++) { if (await page.ev(`typeof devBypass === 'function'`).catch(() => false)) break; await sleep(250); }
  await sleep(800); await page.ev('devBypass()');
  const homeOk = await page.until(`!!document.querySelector('[data-act=start]') && /Zone Z\\d/.test(document.body.innerText)`, 20000);
  const status = (await page.text('.hif-status')) || '';
  check('after a reload the trainer comes back to Home with the saved zone and tier', homeOk && status.includes('Zone ' + before.split('/')[0]) && status.includes('Tier ' + before.split('/')[1]), status);

  /* ───── 7. sizes and dark mode ───── */
  console.log('\n7. Desktop sizes and dark mode');
  for (const [w, h, dark] of [[1920, 1080, false], [1440, 900, true], [1920, 1080, true]]) {
    await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: dark ? 'dark' : 'light' }] });
    await sleep(500);
    const tag = `${w}x${h}-${dark ? 'dark' : 'light'}`;
    await page.shot('20-home-' + tag);
    await page.click('[data-act=map]'); await sleep(400); await page.shot('21-map-' + tag);
    const overflow = await page.ev(`document.getElementById('hif-root').scrollWidth > document.getElementById('hif-root').clientWidth + 1`);
    check(`no sideways scroll at ${tag}`, !overflow);
    await goHome();
  }
  // a drill in dark mode at 1440
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });
  await startTask('call'); it = await nextDrill(); await sleep(1500); await page.shot('22-call-1440x900-dark');
  await page.send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: 'light' }] });
  await page.click('[data-act=stop]'); await sleep(300);
  check('no script errors during the whole walk', realErrors(page).length === 0, realErrors(page).slice(0, 3).join(' | '));
  await page.close();

  } // end of the main walk

  /* ───── 7b. the cloud store, against a stub database ───── */
  if (want('cloud')) {
    console.log('\n7b. Saving to progress/{uid}.trainer (stub database)');
    const p3 = await newPage(`${base}/index.html?hif=1&hifdebug=1`, { stub: { docs: {} } });
    const up3 = await p3.until(`!!document.getElementById('hif-dev')`, 25000);
    if (!up3) console.log('  diagnostics (no Setup screen):', await p3.ev(`JSON.stringify({ root: !!document.getElementById('hif-root'), rootText: ((document.getElementById('hif-root')||{}).textContent||'').slice(0,160), loaded: [typeof HIF_CORE, typeof HIF_UI], user: typeof currentUser !== 'undefined' && !!currentUser, onScreen: typeof appIsOnScreen === 'function' && appIsOnScreen(), body: document.body.innerText.slice(0,160) })`), JSON.stringify(p3.errors.slice(0, 4)));
    await sleep(500);
    await p3.click('[data-act=setup-use]');
    const saved3 = await p3.until(`window.__stub.sets.length > 0`, 12000);
    if (!saved3) console.log('  diagnostics:', await p3.ev(`JSON.stringify({ msg: (document.getElementById('hif-msg')||{}).textContent, stubOn: typeof isDevBypassUser === 'function' && !isDevBypassUser(), sets: window.__stub.sets.length, errors: 0 })`), JSON.stringify(p3.errors.slice(0, 4)));
    const set = saved3 ? await p3.ev(`JSON.stringify(window.__stub.sets[0])`).then(JSON.parse) : { c: '', id: '', d: { trainer: {} }, o: {} };
    check('the save writes ONE field, trainer, with mergeFields so the rest of the document is untouched', set.c === 'progress' && set.id === 'dev-user' && Object.keys(set.d).join() === 'trainer' && JSON.stringify(set.o) === JSON.stringify({ mergeFields: ['trainer'] }), JSON.stringify({ doc: set.c + '/' + set.id, fields: Object.keys(set.d), options: set.o }));
    check('the saved profile is small and versioned', set.d.trainer.v === 1 && JSON.stringify(set.d.trainer).length < 30000, JSON.stringify(set.d.trainer).length + ' bytes');
    await p3.close();
    const seed = { v: 1, zone: 'Z4', tier: 'T3', unlockedZones: ['Z1', 'Z2', 'Z3', 'Z4'], unlockedTiers: ['T1', 'T2', 'T3'], placementDone: '2026-10-30', sessions: 7, lastSession: '2026-10-30', cells: {}, conf: {} };
    const p4 = await newPage(`${base}/index.html?hif=1&hifdebug=1`, { stub: { docs: { 'progress/dev-user': { name: 'x', trainer: seed } } } });
    check('a saved cloud profile loads (Home shows its zone and tier)', await p4.until(`!!document.querySelector('[data-act=start]') && /Zone Z4/.test(document.body.innerText) && /Tier T3/.test(document.body.innerText)`, 25000));
    await p4.close();
  }

  /* ───── 8. Chrome's own fake device (no override) ───── */
  if (want('8')) {
  console.log('\n8. A real (Chrome fake) input device');
  {
    const p2 = await newPage(`${base}/index.html?hif=1&hifdebug=1&nofake=1`, { fake: false });
    await p2.until(`!!document.querySelector('#hif-root [data-act=input], #hif-root #hif-dev')`, 25000);
    await p2.ev(`(() => { const b = document.querySelector('#hif-root [data-act=input]'); if (b) b.click(); })()`);
    await p2.until(`!!document.getElementById('hif-dev')`, 8000);
    await sleep(600);
    await p2.click('[data-act=setup-use]');
    const on = await p2.until(`/Input is on/.test(document.getElementById('hif-msg').textContent)`, 15000);
    const moved = await p2.until(`parseInt(document.getElementById('hif-lvl').style.width,10) > 0`, 9000, 100);
    const opts = await p2.ev(`[...document.querySelectorAll('#hif-dev option')].length`);
    check("Chrome's own fake input device opens and its level moves the meter", on && moved, `${opts} device option(s)`);
    await p2.close();
  }
  }
} catch (e) { console.error('trainer-e2e: could not finish —', e && e.stack || e); exitCode = 2; }
finally { for (const f of cleanup.reverse()) { try { f(); } catch { /* best effort */ } } }

const bad = results.filter((r) => !r.ok);
console.log(`\ntrainer-e2e: ${results.length - bad.length}/${results.length} checks passed${bad.length ? ' — FAILED: ' + bad.map((b) => b.name).join('; ') : ''}`);
process.exit(exitCode || (bad.length ? 1 : 0));
