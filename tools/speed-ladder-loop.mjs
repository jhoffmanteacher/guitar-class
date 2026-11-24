#!/usr/bin/env node
/* THE SPEED LADDER, MEASURED IN A REAL BROWSER (ca-54, "Sweet Child O' Mine — Speed Ladder", 2026-11-24).

   checks.mjs 1fc runs the stop logic on a fake card element; this plays the real card: headless Chrome for Testing,
   the real audio files, real mouse clicks on the three round buttons, the page sampled every 100 ms. For each round it
   prints, as the climb goes, every change of the speed control: the slider's stop, which FILE is playing (slow or fast),
   the element's playbackRate, the BPM that comes to (file BPM x rate; expected 90 / 100 / 112.5 / 125), the laps counted
   when the stop changed (pcState.laps: the laps PLAYED before this step; expected 1, 2, 3 for the three steps up from
   the bottom, 1 and 2 for Round 3), how long the stop lasted against how long one lap should take, and the status line.
   It fails on a wrong first stop, a wrong BPM, a stop that lasts more or less than one lap, a round that never reaches
   125, or a page error. About 6 minutes (the audio plays in real time: Round 1 about 2 minutes, Round 2 1, Round 3 2).

     node tools/speed-ladder-loop.mjs                    measure this checkout (CHROME=<Chrome for Testing>)
     node tools/speed-ladder-loop.mjs --shots <dir>      also save screenshots at 1366x657 (opened, each round, the three views, Spanish)
     node tools/speed-ladder-loop.mjs --fast             one round only (Round 2, the chorus: about 1.5 minutes)

   Silent: Chrome is started with --mute-audio, so nothing plays out loud; the audio clock still runs in real time.
   One browser run: count it with the smoke's. It serves the checkout it runs in. Exits 0 when every line holds. */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, existsSync, statSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const SHOTS = opt('--shots'), FAST = args.includes('--fast');
const ID = 'ca-54';
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json' };
const sleep = ms => new Promise(r => setTimeout(r, ms));
const freePort = () => new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });
function serve(dir) {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (p.endsWith('/')) p += 'index.html';
    const f = normalize(join(dir, p));
    if (!f.startsWith(dir) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('not found'); return; }
    const buf = readFileSync(f), range = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
    const type = MIME[extname(f).toLowerCase()] || 'application/octet-stream';
    if (range) {   // audio wants byte ranges
      const a = +range[1], b = range[2] ? +range[2] : buf.length - 1;
      res.writeHead(206, { 'content-type': type, 'accept-ranges': 'bytes', 'content-range': `bytes ${a}-${b}/${buf.length}`, 'content-length': b - a + 1, 'cache-control': 'no-store' });
      res.end(buf.subarray(a, b + 1)); return;
    }
    res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': buf.length, 'cache-control': 'no-store' });
    res.end(buf);
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
  const evalJs = async expression => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  return { send, evalJs, on: h => handlers.push(h) };
}

const problems = [], lines = [];
const say = s => { lines.push(s); console.log(s); };
const bad = s => { problems.push(s); console.log('  ✗ ' + s); };
const cleanup = [];
let chromeProc = null;
const done = code => { cleanup.forEach(f => { try { f(); } catch { /* gone */ } }); try { chromeProc && chromeProc.kill(); } catch { /* gone */ } process.exit(code); };

async function main() {
  const chrome = opt('--chrome') || process.env.CHROME;
  if (!chrome || !existsSync(chrome)) { console.error('speed-ladder-loop: no Chrome for Testing: set CHROME or pass --chrome <path>'); return 2; }
  if (typeof WebSocket === 'undefined') { console.error('speed-ladder-loop: needs Node 22+ (global WebSocket)'); return 2; }
  const prof = mkdtempSync(join(tmpdir(), 'gc-ladder-chrome-'));
  cleanup.push(() => rmSync(prof, { recursive: true, force: true }));
  const cdp = await freePort();
  chromeProc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1',
    '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--no-first-run', '--disable-gpu', '--window-size=1366,657', 'about:blank'], { stdio: 'ignore' });
  let up = false;
  for (let i = 0; i < 80 && !up; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); up = true; } catch { await sleep(250); } }
  if (!up) { console.error('speed-ladder-loop: Chrome did not start'); return 2; }
  const site = await serve(ROOT);
  cleanup.push(() => site.srv.close());
  const page = await openPage(cdp);
  const pageErrors = [];
  page.on((method, p) => { if (method === 'Runtime.exceptionThrown') { const d = p.exceptionDetails; pageErrors.push(String((d.exception && (d.exception.description || d.exception.value)) || d.text).split('\n')[0]); } });
  await page.send('Runtime.enable'); await page.send('Page.enable');
  const size = (w, h) => page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await size(1366, 657);
  const E = x => page.evalJs(x);
  const loaded = new Promise(r => page.on(m => { if (m === 'Page.loadEventFired') r(); }));
  await page.send('Page.navigate', { url: `http://127.0.0.1:${site.port}/index.html` });
  await Promise.race([loaded, sleep(20000)]);
  let booted = false;
  for (let i = 0; i < 40 && !booted; i++) { await sleep(250); booted = await E(`typeof devBypass === 'function' && typeof openClassActivitiesScreen === 'function' && document.readyState === 'complete'`).catch(() => false); }
  if (!booted) { console.error('speed-ladder-loop: the page did not boot'); return 2; }
  await E('devBypass()'); await sleep(2500);
  await E(`(setLang('en'), openClassActivitiesScreen(), true)`); await sleep(800);
  if (!(await E(`CLASS_ACTIVITIES.some(a => a.id === '${ID}')`))) { console.error(`speed-ladder-loop: ${ID} is not in this checkout`); return 2; }
  await E(`caFocusActivity('${ID}')`); await sleep(1200);
  const shot = async name => {
    if (!SHOTS) return;
    mkdirSync(SHOTS, { recursive: true });
    const r = await page.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(join(SHOTS, name + '.png'), Buffer.from(r.data, 'base64'));
  };
  const click = async sel => {
    const at = await E(`(() => { const b = document.querySelector(${JSON.stringify('.ca-card[open][data-id="' + ID + '"] ' + sel)}); if (!b) return null; b.scrollIntoView({ block: 'center' }); const q = b.getBoundingClientRect(); return { x: q.left + q.width / 2, y: q.top + q.height / 2 }; })()`);
    if (!at) return false;
    await page.send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: at.x, y: at.y });
    await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: at.x, y: at.y, button: 'left', buttons: 1, clickCount: 1 });
    await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: at.x, y: at.y, button: 'left', buttons: 0, clickCount: 1 });
    await sleep(200);
    return true;
  };
  // What the page says right now.
  const SAMPLE = `(() => { const root = document.querySelector('.ca-card[open][data-id="${ID}"] .pc'); if (!root) return null;
    const tr = SNIPPET_TRACKS['sweet-child-o-mine'], st = pcState && pcState.root === root ? pcState : null, r = root.querySelector('.pc-speed-range');
    const a = st && st.audio, slowUrl = new URL(snippetSrc(tr, true, root.dataset.guitar === '1'), location.href).href, slow = a ? a.src === slowUrl : root.dataset.slow === '1';
    return { stop: r ? +r.value : -1, slowFlag: root.dataset.slow, rate: root.dataset.rate, playing: !!st, counting: !!(st && st.counting), laps: st ? st.laps : -1, build: root.dataset.build || '',
      file: a ? (slow ? 'slow' : 'fast') : '-', pr: a ? a.playbackRate : 0, t: a ? a.currentTime : 0,
      bpm: a ? (slow ? tr.trackBpmSlow : tr.trackBpm) * a.playbackRate : 0, status: (root.querySelector('.pc-status') || {}).textContent || '',
      round: root.dataset.round || '', sw: ['loop', 'build', 'hold'].map(n => { const b = root.querySelector('.pc-loop-sw[data-loop-sw="' + n + '"]'); return b ? (b.hidden ? 'h' : 's') : '-'; }).join('') }; })()`;
  // 1. Opened.
  const s0 = await E(SAMPLE);
  say(`opened: slider stop ${s0.stop}, data-slow "${s0.slowFlag}", data-rate ${s0.rate}, switches (loop build hold) ${s0.sw}, status "${s0.status}"`);
  if (s0.stop !== 0 || s0.slowFlag !== '1' || +s0.rate !== 0.9) bad(`the card should open on stop 0 (slow file, rate 0.9): ${JSON.stringify(s0)}`);
  if (s0.sw !== 'hhh') bad(`Loop, Build and Stay should be hidden when the card opens: ${s0.sw}`);
  const ticks = await E(`[...document.querySelectorAll('.ca-card[open][data-id="${ID}"] .pc-speed-x')].map(x => x.textContent).join(' ')`);
  say(`the slider reads: ${ticks}`);
  const rb = await E(`[...document.querySelectorAll('.ca-card[open][data-id="${ID}"] .pc-round')].map(b => b.textContent.trim()).join(' | ')`);
  say(`round buttons: ${rb}`);
  await shot('01-opened');

  // 2. The three rounds, played for real.
  const tr = await E(`(() => { const t = SNIPPET_TRACKS['sweet-child-o-mine']; return { bpm: t.trackBpm, slow: t.trackBpmSlow, bpb: t.beatsPerBar }; })()`);
  const BARS = { 0: 16, 1: 8, 2: 24 };   // one lap of each round, in bars
  const WANT = { 0: [[0, 90], [1, 100], [2, 112.5], [3, 125]], 1: [[0, 90], [1, 100], [2, 112.5], [3, 125]], 2: [[1, 100], [2, 112.5], [3, 125]] };
  const rounds = FAST ? [1] : [0, 1, 2];
  for (const ri of rounds) {
    say(`── Round ${ri + 1} ──`);
    await E('pcStop()'); await sleep(400);
    if (!(await click(`.pc-round[data-round="${ri}"]`))) { bad(`no round button ${ri + 1}`); continue; }
    const seen = [];   // each distinct stop, in order: { stop, file, pr, bpm, laps, since, firstStatus }
    const t0 = Date.now();
    let last = null, atTop = 0, shotAfter = false;
    const limit = (ri === 0 ? 200 : ri === 1 ? 110 : 190) * 1000;
    while (Date.now() - t0 < limit) {
      await sleep(100);
      const s = await E(SAMPLE);
      if (!s) { bad('the card is gone'); break; }
      if (s.counting || !s.playing) { if (!seen.length && Date.now() - t0 > 8000) { bad(`Round ${ri + 1} never started playing: ${JSON.stringify(s)}`); break; } continue; }
      if (!last || s.stop !== last.stop) {
        const now = Date.now();
        if (seen.length) seen[seen.length - 1].held = (now - seen[seen.length - 1].at) / 1000;
        seen.push({ stop: s.stop, file: s.file, pr: s.pr, bpm: s.bpm, laps: s.laps, at: now, status: s.status, sw: s.sw });
        if (seen.length === 1) { await shot(`02-round${ri + 1}-first-stop`); }
        if (seen.length === 2 && !shotAfter) { shotAfter = true; await shot(`03-round${ri + 1}-after-first-step`); }
      }
      last = s;
      if (s.stop === 3) { atTop++; if (atTop === 1) { seen[seen.length - 1].held = null; } if (atTop >= 40) break; } else atTop = 0;   // 4 s at the top stop
    }
    const want = WANT[ri];
    seen.forEach(x => say(`  stop ${x.stop}: ${x.file} file at x${x.pr.toFixed ? x.pr.toFixed(4) : x.pr} = ${x.bpm.toFixed(1)} BPM · laps played so far ${x.laps}${x.held != null ? ` · held ${x.held.toFixed(1)} s` : ' · (top: keeps looping)'} · status "${x.status}" · switches ${x.sw}`));
    if (seen.map(x => x.stop).join() !== want.map(w => w[0]).join()) bad(`Round ${ri + 1}: the stops it went through were ${seen.map(x => x.stop).join(' ')}, want ${want.map(w => w[0]).join(' ')}`);
    seen.forEach((x, i) => {
      const w = want[i];
      if (w && Math.abs(x.bpm - w[1]) > 0.6) bad(`Round ${ri + 1} stop ${x.stop}: plays ${x.bpm.toFixed(2)} BPM, want ${w[1]}`);
      // laps played when the stop changed: one per stop climbed (Round 3 starts on the second stop, lap count from 0).
      if (i > 0 && x.laps !== i) bad(`Round ${ri + 1} stop ${x.stop}: ${x.laps} laps counted when it began, want ${i} (one lap at every stop before it)`);
      if (x.held != null) {
        const barSec = tr.bpb * 60 / w[1], expect = BARS[ri] * barSec;
        if (Math.abs(x.held - expect) > 1.5) bad(`Round ${ri + 1} stop ${x.stop}: held ${x.held.toFixed(1)} s, one lap is ${expect.toFixed(1)} s (${BARS[ri]} bars at ${w[1]} BPM)`);
      }
    });
    if (!seen.length || seen[seen.length - 1].stop !== 3) bad(`Round ${ri + 1} never reached the top stop (125)`);
    if (seen.length && seen[0].status && !/BPM/.test(seen[0].status)) bad(`Round ${ri + 1}: the status line is "${seen[0].status}" — it should name the round and the BPM`);
    await E('pcStop()'); await sleep(300);
  }

  if (SHOTS) {
    // The other views and Spanish, stopped, on the first stop; the cut sheet alone.
    await E('pcStop()');
    await E(`caSetCardView('${ID}', 'chords', document.querySelector('.ca-card[open][data-id="${ID}"] .ca-view-switch [data-view="chords"]'))`); await sleep(800);
    await shot('04-chords-view');
    await E(`caSetCardView('${ID}', 'tab', document.querySelector('.ca-card[open][data-id="${ID}"] .ca-view-switch [data-view="tab"]'))`); await sleep(800);
    await shot('05-tab-view');
    await E(`caSetCardView('${ID}', 'lyrics', document.querySelector('.ca-card[open][data-id="${ID}"] .ca-view-switch [data-view="lyrics"]'))`); await sleep(2500);
    await shot('06-lyrics-view');
    await E(`(setLang('es'), renderClassActivities(), caFocusActivity('${ID}'), true)`); await sleep(2800);
    await shot('07-spanish');
    await E(`(setLang('en'), renderClassActivities(), caFocusActivity('${ID}'), true)`); await sleep(1500);
  }
  if (pageErrors.length) bad(`page errors: ${[...new Set(pageErrors)].slice(0, 4).join(' | ')}`);
  say(problems.length ? `speed-ladder-loop: ✗ ${problems.length} problem(s)` : `speed-ladder-loop: ✓ ${rounds.length} round(s) played for real: first stop 90, every stop its BPM, one lap a stop, the top reached`);
  return problems.length ? 1 : 0;
}
const watchdog = setTimeout(() => { console.error('speed-ladder-loop: ✗ HUNG (13 minutes)'); done(3); }, 13 * 60 * 1000);
watchdog.unref();
main().then(done, e => { console.error('speed-ladder-loop: ✗ ' + (e && e.stack || e)); done(2); });
