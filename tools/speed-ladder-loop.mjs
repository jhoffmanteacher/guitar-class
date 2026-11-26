#!/usr/bin/env node
/* THE SPEED LADDER, MEASURED IN A REAL BROWSER (ca-54, "Sweet Child O' Mine — Speed Ladder", 2026-11-24).

   checks.mjs 1fc runs the stop logic on a fake card element; this plays the real card: headless Chrome for Testing,
   the real audio files, real mouse clicks on Play and then on the prompt's buttons, the page sampled every 100 ms.
   The card has ONE round (verse + chorus, 24 bars) and no round buttons (2026-11-24). Play starts it on the bottom stop;
   after ONE time through the song stops and asks "Got it" or "Practice again" (pcLadderAsk). The run: 90, Practice
   again (90 once more), Got it -> 100, Got it -> 112.5, Got it -> 125, then "Got it" closes the prompt. For each time
   through it prints the slider's stop, which FILE plays (slow or fast), the playbackRate, the BPM that comes to
   (file BPM x rate; expected 90 / 100 / 112.5 / 125), how long it played against one time through, the status line
   and the prompt's text. It fails on a wrong stop, a wrong BPM, a pass that lasts more or less than 24 bars, a
   prompt that does not show, shows while the song plays or names the wrong tempo, or a page error. About 6 minutes
   (the audio plays in real time).

     node tools/speed-ladder-loop.mjs                    measure this checkout (CHROME=<Chrome for Testing>)
     node tools/speed-ladder-loop.mjs --shots <dir>      also save screenshots at 1366x657 (opened, playing, the prompt, the three views, Spanish)
     node tools/speed-ladder-loop.mjs --fast             90, Practice again, Got it to 100: two and a half minutes

   Silent: Chrome is started with --mute-audio, so nothing plays out loud; the audio clock still runs in real time.
   One browser run: count it with the smoke's. It serves the checkout it runs in. Exits 0 when every line holds.
   GitHub runs it after a push that changes the files playalong-loop guards, or this file (.github/workflows/browser.yml,
   job speed-ladder, 2026-11-26). */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, existsSync, statSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';
import { WALL_FLAGS, wallWatch, browserSlot } from './chrome-wall.mjs';

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
/* The wall (tools/chrome-wall.mjs): set once Chrome is up; every tab is watched before its first navigation. */
let wall = null;
async function openPage(port) {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  if (wall) await wall.page(t.id);
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
  await browserSlot('speed-ladder-loop');
  armWatchdog();
  const prof = mkdtempSync(join(tmpdir(), 'gc-ladder-chrome-'));
  cleanup.push(() => rmSync(prof, { recursive: true, force: true }));
  const cdp = await freePort();
  chromeProc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, ...WALL_FLAGS,
    '--autoplay-policy=no-user-gesture-required', '--mute-audio', '--no-first-run', '--disable-gpu', '--window-size=1366,657', 'about:blank'], { stdio: 'ignore' });
  let up = false;
  for (let i = 0; i < 80 && !up; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); up = true; } catch { await sleep(250); } }
  if (!up) { console.error('speed-ladder-loop: Chrome did not start'); return 2; }
  wall = await wallWatch(cdp, 'speed-ladder-loop');
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
      ask: (() => { const q = root.querySelector('.pc-ask'); return q && !q.hidden ? q.textContent.replace(/\\s+/g, ' ').trim() : ''; })(),
      round: root.dataset.round || '', sw: ['loop', 'build', 'hold'].map(n => { const b = root.querySelector('.pc-loop-sw[data-loop-sw="' + n + '"]'); return b ? (b.hidden ? 'h' : 's') : '-'; }).join('') }; })()`;
  // 1. Opened.
  const s0 = await E(SAMPLE);
  say(`opened: slider stop ${s0.stop}, data-slow "${s0.slowFlag}", data-rate ${s0.rate}, switches (loop build hold) ${s0.sw}, status "${s0.status}"`);
  if (s0.stop !== 0 || s0.slowFlag !== '1' || +s0.rate !== 0.9) bad(`the card should open on stop 0 (slow file, rate 0.9): ${JSON.stringify(s0)}`);
  if (s0.sw !== '---') bad(`a one-round card draws no Loop / Build / Stay switch: ${s0.sw}`);
  if (s0.ask) bad(`the prompt should be hidden when the card opens: "${s0.ask}"`);
  const ticks = await E(`[...document.querySelectorAll('.ca-card[open][data-id="${ID}"] .pc-speed-x')].map(x => x.textContent).join(' ')`);
  say(`the slider reads: ${ticks}`);
  const rb = await E(`document.querySelectorAll('.ca-card[open][data-id="${ID}"] .pc-round, .ca-card[open][data-id="${ID}"] .pc-sec').length`);
  say(`round / section buttons: ${rb}`);
  if (rb !== 0) bad(`the card should have no round or section buttons (Play starts the ladder): ${rb}`);
  await shot('01-opened');

  // 2. The ladder, played for real: Play, one time through at 90, the prompt; Practice again (90 once more); Got it up to 100, 112, 125.
  const tr = await E(`(() => { const t = SNIPPET_TRACKS['sweet-child-o-mine']; return { bpm: t.trackBpm, slow: t.trackBpmSlow, bpb: t.beatsPerBar }; })()`);
  const BARS = 24;   // one time through: the verse and the chorus
  const BPMS = [90, 100, 112.5, 125];
  // The plan: each entry is the stop that plays, then what the student presses when the prompt shows.
  const plan = FAST ? [[0, 'again'], [0, 'got']] : [[0, 'again'], [0, 'got'], [1, 'got'], [2, 'got'], [3, 'got']];
  await E('pcStop()'); await sleep(400);
  if (!(await click('.pc-play'))) bad('no Play button');
  for (let k = 0; k < plan.length; k++) {
    const [stop, press] = plan[k];
    say(`── time ${k + 1}: stop ${stop} (${BPMS[stop]} BPM), then "${press === 'got' ? 'Got it' : 'Practice again'}" ──`);
    const t0 = Date.now();
    let first = null, t1 = null, asked = null, tPlay = 0;
    const limit = (BARS * tr.bpb * 60 / BPMS[stop] + 40) * 1000;
    while (Date.now() - t0 < limit) {
      await sleep(100);
      const s = await E(SAMPLE);
      if (!s) { bad('the card is gone'); break; }
      if (s.playing && !s.counting) { if (!first) { first = s; tPlay = Date.now(); } if (s.ask) bad(`the prompt shows while the song plays: "${s.ask}"`); }
      if (first && !s.playing && s.ask) { asked = s; t1 = Date.now(); break; }
    }
    if (!first) { bad(`time ${k + 1}: never started playing`); break; }
    say(`  played ${first.file} file at x${first.pr.toFixed ? first.pr.toFixed(4) : first.pr} = ${first.bpm.toFixed(1)} BPM on slider stop ${first.stop}, status "${first.status}"`);
    if (first.stop !== stop) bad(`time ${k + 1}: the slider is on stop ${first.stop}, want ${stop}`);
    if (Math.abs(first.bpm - BPMS[stop]) > 0.6) bad(`time ${k + 1}: plays ${first.bpm.toFixed(2)} BPM, want ${BPMS[stop]}`);
    if (!/BPM/.test(first.status)) bad(`time ${k + 1}: the status line is "${first.status}" — it should name the BPM`);
    if (k === 0) await shot('02-playing-first-stop');
    if (!asked) { bad(`time ${k + 1}: the song never stopped and asked after one time through (${(limit / 1000).toFixed(0)} s)`); break; }
    const held = (t1 - tPlay) / 1000, expect = BARS * tr.bpb * 60 / BPMS[stop];
    say(`  stopped after ${held.toFixed(1)} s (one time through is ${expect.toFixed(1)} s); the prompt reads: "${asked.ask}"`);
    if (Math.abs(held - expect) > 2) bad(`time ${k + 1}: it played ${held.toFixed(1)} s, one time through is ${expect.toFixed(1)} s (${BARS} bars at ${BPMS[stop]} BPM)`);
    const bpmWord = Math.floor(BPMS[stop] + 1e-6) + ' BPM';
    if (!asked.ask.includes(bpmWord) || !/Got it/.test(asked.ask) || !/Practice again/.test(asked.ask)) bad(`time ${k + 1}: the prompt should name ${bpmWord}, "Got it" and "Practice again": "${asked.ask}"`);
    if (stop < 3 && !/faster/.test(asked.ask)) bad(`time ${k + 1}: below the top the prompt should say "faster": "${asked.ask}"`);
    if (stop === 3 && !/finish/.test(asked.ask)) bad(`the top stop's prompt should say "finish": "${asked.ask}"`);
    if (k === 0) await shot('03-prompt-after-first-time');
    if (press === 'got' && stop === 3) {
      if (!(await click('.pc-ask-got'))) bad('no Got it button');
      const e = await E(SAMPLE);
      if (e.ask || e.playing) bad(`Got it at the top should close the prompt and stay stopped: ${JSON.stringify(e)}`);
      break;
    }
    if (!(await click(press === 'got' ? '.pc-ask-got' : '.pc-ask-again'))) { bad(`no ${press} button`); break; }
    const n = await E(SAMPLE), want = press === 'got' ? stop + 1 : stop;
    if (n.ask) bad(`the prompt should close when a button is pressed: "${n.ask}"`);
    if (n.stop !== want) bad(`after "${press}" the slider is on stop ${n.stop}, want ${want}`);
  }
  await E('pcStop()'); await sleep(300);

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
  say(problems.length ? `speed-ladder-loop: ✗ ${problems.length} problem(s)` : `speed-ladder-loop: ✓ ${plan.length} times through played for real: first stop 90, every stop its BPM, one time through each, the prompt after each`);
  return problems.length ? 1 : 0;
}
/* The 13 minutes start again once the browser slot is held (armWatchdog in main): a queued run waits for its turn, not
   into its watchdog (review R1-1). */
let watchdog = null;
const armWatchdog = () => { clearTimeout(watchdog); watchdog = setTimeout(() => { console.error('speed-ladder-loop: ✗ HUNG (13 minutes)'); done(3); }, 13 * 60 * 1000); watchdog.unref(); };
armWatchdog();
const finish = async code => done(wall ? await wall.finish(code) : code);
main().then(finish, e => { console.error('speed-ladder-loop: ✗ ' + (e && e.stack || e)); return finish(2); });
