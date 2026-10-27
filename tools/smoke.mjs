#!/usr/bin/env node
/* Real-browser smoke test (2026-10-25).

   checks.mjs reads source text; it cannot click anything. A lesson's ▶ video
   buttons shipped dead for weeks (a label with quote marks ended the onclick
   attribute early) because the file parsed and every check stayed green. This
   boots the site in headless Chrome, signs in through the dev bypass, walks
   every module and set in English and Spanish, opens the Songs / Class
   activities / My progress / Games screens, visits every game view and the
   tuner, and fails on any uncaught exception, console error, step that threw,
   or inline handler that does not compile.

     node tools/smoke.mjs                      walk this checkout
     node tools/smoke.mjs --baseline <ref>     also walk git <ref> and report only
                                               what this checkout ADDS (use it for
                                               a big change: a pre-existing bug is
                                               then not blamed on you)
     node tools/smoke.mjs --chrome <path>      Chrome/Chromium binary (or CHROME=…)
     node tools/smoke.mjs --quiet              print only the verdict

   It is a tool, not part of checks.mjs: it needs a browser, takes about a
   minute, and is for big changes (renderers, escaping, many files at once), not
   every commit. Needs Node 22+ (global WebSocket) and Chrome or Chromium; it
   serves the repo itself, so Python and a separate server are not needed.
   Network noise (Firebase, Google, YouTube) is ignored — it is offline-safe.

   Proved to be able to fail: against 194696b it reports 60+ dead video-button
   handlers; against the fixed tree it reports none. */
import { createServer } from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, existsSync, statSync, symlinkSync, rmSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const QUIET = args.includes('--quiet');
const BASELINE = opt('--baseline');
const say = (...a) => { if (!QUIET) console.log(...a); };

const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json' };

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
    const f = normalize(join(dir, p));
    if (!f.startsWith(dir) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('not found'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream' });
    res.end(readFileSync(f));
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}

/* A copy of git <ref> to compare against. audio/ is linked from this checkout
   (it is hundreds of MB and never decides a JavaScript error). */
function extractRef(ref) {
  const dir = mkdtempSync(join(tmpdir(), 'gc-smoke-base-'));
  const tar = execFileSync('git', ['-C', ROOT, 'archive', ref], { maxBuffer: 1 << 30 });
  execFileSync('tar', ['-x', '-C', dir, '--exclude=audio'], { input: tar });
  try { symlinkSync(join(ROOT, 'audio'), join(dir, 'audio')); } catch { /* best effort */ }
  return dir;
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

// Network and browser-policy noise that says nothing about our code.
const NOISE = /firebase|firestore|googleapis|gstatic|google\.com|youtube|ytimg|net::ERR|Failed to fetch|ERR_|auth\/|identitytoolkit|favicon|Content Security|websocket|WebChannel|Missing or insufficient|offline|Could not reach|NotAllowedError|play\(\) request|AbortError|NotSupportedError|The play\(\)/i;

/* Chord-grid practice cards (card.chordGrid, 2026-10-26). checks.mjs 1bv renders
   them and executes pcLocate; this runs the real pcFrame / pcPaint /
   pcSheetStrip against a fake clock in a real browser, because the cursor is
   the thing a student sees and no source check can see it. A checkout without
   chord grids (the baseline) skips it. For every opted-in card: step the clock
   through its first sections and fail if the cursor ever lights a cell with no
   data-beat (a "+" column), lights the wrong beat, lights the count row's "+"
   cell, or sits on a page that is not the visible one; then measure every grid
   page at 1366 and 390px wide for sideways overflow and for beat columns that
   drift out of line between rows (the 2026-10-26 phone-width bug: 32 columns
   with a count in each pushed the board 78px past a 390px screen), and for a
   row that opens on no visible label at column 0 (a chord, the rest word, or a
   held "(Chord)" — 1bv works out which). ca-38's
   "This bar" strip must light beat cells only and its dot must fill once per
   beat, never on a "+". */
async function chordGridWalk(page, run, events, stats) {
  const ids = await run('chord-grid:list', `typeof pcChordGrid === 'function' ? CLASS_ACTIVITIES.filter(a => a.card && a.card.chordGrid).map(a => a.id) : []`, 50);
  if (!ids || !ids.length) return;
  stats.chordCards = ids.length;
  await run('chord-grid:open', `openClassActivitiesScreen()`, 600);
  await run('chord-grid:sim-def', `window.__cgSim = function(id, si, maxSec, dt, lap){
    caFocusActivity(id);
    const root = document.querySelector('.ca-card[open] .pc');
    const a = pcActivity(root), L = pcLayout(a);
    const fake = { currentTime: 0, paused: false, ended: false, playbackRate: 1, src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=', play(){ return Promise.resolve(); }, pause(){} };
    const st = { root, L, audio: fake, win: pcWindow(L, root.dataset.slow === '1'), loopFrom: si, fromRep: 0, wholeSong: !!a.card.wholeSong, sheet: false, raf: 0, timers: [], lastBeat: -1, counting: false, si: -1, seq: -1, rep: -1, beat: -1, key: '', row: null };
    pcState = st;
    const raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0;
    pcShowSection(root, L, si);
    fake.currentTime = snipTimeAtBars(st.win, L.sections[si].fromBar - L.firstBar);
    // A lap test starts a few seconds before the end of the window, so one short walk crosses the loop point.
    if (lap) fake.currentTime = Math.max(fake.currentTime, st.win.end - 6);
    const issues = []; const seen = new Set(), after = new Set(); let frames = 0, paints = 0, last = '', early = 0, rowChanges = 0, prevRow = null, prevT = fake.currentTime, lapped = false;
    const rowOf = (s2, b) => { const c = root.querySelector('.pc-tab .pc-page[data-page="' + s2 + '"] [data-beat="' + b + '"]'); return c && c.closest('.tab-grid'); };
    const t0 = fake.currentTime;
    try {
      while (fake.currentTime - t0 < maxSec && frames < 6000) {
        pcFrame(); frames++;
        if (pcState !== st) break;
        const t = fake.currentTime;
        if (t < prevT - 0.5) { lapped = true; after.clear(); }
        prevT = t;
        const here = pcLocate(L, snipBarsAt(st.win, t)), ahead = pcLocate(L, snipBarsAt(st.win, t + 0.15));
        if (here && L.sections[here.si].grid) { const r = rowOf(here.si, here.beat); if (r !== prevRow) { if (prevRow) rowChanges++; prevRow = r; } }
        const lit = [...root.querySelectorAll('.pc-tab .beat-now')];
        const sig = lit.map(e => (e.closest('.pc-page').dataset.page) + ':' + (e.dataset.beat ?? '-') + ':' + (e.dataset.seq ?? '-')).join(',');
        // The look-ahead (PC_ROW_LEAD) may already show the first note of a note-by-note section that follows.
        const handover = here && ahead && !L.sections[ahead.si].grid && ahead.si !== here.si && lit.length && lit.every(e => +e.dataset.seq === ahead.seq);
        if (here && L.sections[here.si].grid && !handover) {
          if (!lit.length) issues.push('nothing lit at ' + t.toFixed(2));
          else {
            if (lit.some(e => e.dataset.beat == null)) issues.push('a cell with no data-beat (a "+" column?) lit at ' + t.toFixed(2) + ' ' + sig);
            if (lit.some(e => e.classList.contains('tab-count-held'))) issues.push('a "+" count cell lit at ' + t.toFixed(2));
            const beats = [...new Set(lit.map(e => +e.dataset.beat))], pg = [...new Set(lit.map(e => +e.closest('.pc-page').dataset.page))];
            if (beats.length !== 1 || pg.length !== 1) issues.push('lit more than one beat or page: ' + sig + ' at ' + t.toFixed(2));
            else if (pg[0] === here.si && beats[0] === here.beat) { seen.add(pg[0] + ':' + beats[0]); if (lapped) after.add(pg[0] + ':' + beats[0]); }
            else if (ahead && pg[0] === ahead.si && beats[0] === ahead.beat && (ahead.si !== here.si || rowOf(ahead.si, ahead.beat) !== rowOf(here.si, here.beat))) { early++; seen.add(pg[0] + ':' + beats[0]); }
            else issues.push('wrong or early beat ' + pg[0] + ':' + beats[0] + ' (clock says ' + here.si + ':' + here.beat + ', and the next row is not the one being entered) at ' + t.toFixed(2));
            if (lit.length !== 7) issues.push(lit.length + ' cells lit, expected 7 (six string cells and the count cell) at ' + t.toFixed(2));
            const cnt = lit.find(e => e.classList.contains('tab-count'));
            if (cnt) { const cs = getComputedStyle(cnt); if (cs.color === cs.backgroundColor) issues.push('the lit count cell has its text colour equal to its background at ' + t.toFixed(2)); }
            const vis = root.querySelector('.pc-tab .pc-page:not([hidden])');
            if (vis && pg.length === 1 && +vis.dataset.page !== pg[0]) issues.push('lit page ' + pg[0] + ' is not the visible page ' + vis.dataset.page);
          }
        }
        if (sig !== last) { paints++; last = sig; }
        fake.currentTime += dt;
      }
    } finally { window.requestAnimationFrame = raf; pcState = null; root.querySelectorAll('.beat-now').forEach(e => e.classList.remove('beat-now')); }
    if (rowChanges > 0 && early === 0) issues.push('the cursor crossed ' + rowChanges + ' row changes and never lit the next row early (PC_ROW_LEAD look-ahead is not working)');
    if (lap && !lapped) issues.push('the walk never reached the end of the loop');
    if (lap && lapped && !after.has(si + ':0')) issues.push('after the lap the cursor never came back to beat 0 of section ' + si);
    return { frames, paints, beats: seen.size, issues: issues.slice(0, 6), n: issues.length };
  }; 1`, 50);
  let walked = 0;
  for (const id of ids) {
    const info = await run(`chord-grid:${id}:info`, `(() => { caFocusActivity('${id}'); const L = pcLayout(pcActivity(document.querySelector('.ca-card[open] .pc'))); const a = pcActivity(document.querySelector('.ca-card[open] .pc')); return { opened: document.querySelector('.ca-card[open] .pc').dataset.id === '${id}', whole: !!a.card.wholeSong, grid: L.sections.map(S => S.grid), beats: L.sections.map(S => S.bars * L.tr.beatsPerBar) }; })()`, 200);
    if (!info) continue;
    // A teacher-only card (ca-40) is not on the student page: it cannot be opened here and is not counted as walked.
    if (info.opened !== true) { (stats.chordSkipped = stats.chordSkipped || []).push(id); continue; }
    walked++;
    // A looping card's LAST grid section, run past the end of its window: the lap must come back to beat 0 (wholeSong cards stop instead).
    if (!info.whole) {
      const lastGrid = info.grid.lastIndexOf(true);
      if (lastGrid === info.grid.length - 1) {
      const lr = await run(`chord-grid:${id}:lap`, `window.__cgSim('${id}', ${lastGrid}, 40, 0.05, true)`, 50);
      if (lr && lr.n) events.push({ step: `chord-grid:${id}:lap`, kind: 'chord-grid-cursor', text: lr.issues.join(' | ') });
      }
    }
    // The first two grid sections, ~40 s of card time each, 50 ms frames.
    const todo = info.grid.map((g, i) => g ? i : -1).filter(i => i >= 0).slice(0, 2);
    for (const si of todo) {
      const r = await run(`chord-grid:${id}:cursor-${si}`, `window.__cgSim('${id}', ${si}, 40, 0.05)`, 50);
      if (!r) continue;
      if (r.n) events.push({ step: `chord-grid:${id}:cursor-${si}`, kind: 'chord-grid-cursor', text: r.issues.join(' | ') + (r.n > r.issues.length ? ` … (+${r.n - r.issues.length})` : '') });
      else if (r.paints < 4) events.push({ step: `chord-grid:${id}:cursor-${si}`, kind: 'chord-grid-cursor', text: `the cursor painted only ${r.paints} times in ${r.frames} frames — it is not moving` });
    }
  }
  stats.chordCards = walked;
  // Layout: every grid page, wide and phone-sized.
  for (const [w, h] of [[1366, 657], [390, 844], [360, 740]]) {
    await run(`chord-grid:width-${w}`, `(window.__cgW = ${w}, 1)`, 10);
    await page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
    await sleep(500);
    for (const id of ids) {
      const r = await run(`chord-grid:${id}:layout-${w}`, `(() => { caFocusActivity('${id}'); const root = document.querySelector('.ca-card[open] .pc'); const L = pcLayout(pcActivity(root)); const bad = []; let pages = 0; L.sections.forEach((S, si) => { if (!S.grid) return; pcShowSection(root, L, si); pages++; const pg = root.querySelector('.pc-page:not([hidden])'), board = pg.querySelector('.tab-board'); if (board.scrollWidth > board.clientWidth + 1) bad.push(S.s.label + ': board ' + board.scrollWidth + ' > ' + board.clientWidth); const rows = [...pg.querySelectorAll('.tab-grid')].map(g => [...g.querySelectorAll('.tab-count[data-beat]')].map(c => c.getBoundingClientRect().left - g.getBoundingClientRect().left)); const n = Math.min(...rows.map(r => r.length)); let worst = 0; for (let i = 0; i < n; i++) { const col = rows.map(r => r[i]); worst = Math.max(worst, Math.max(...col) - Math.min(...col)); } if (worst > 1) bad.push(S.s.label + ': beat columns drift ' + worst.toFixed(1) + 'px between rows'); const cnt = pg.querySelector('.tab-count[data-beat]'); if (!cnt || !cnt.offsetHeight) bad.push(S.s.label + ': the count row is not showing'); const bl = pg.querySelector('.tab-bar-line'); if (bl && (!bl.offsetHeight || getComputedStyle(bl).borderLeftWidth === '0px')) bad.push(S.s.label + ': the bar lines are not visible'); const rw = pg.querySelector('.tab-rest-lab'); if (rw && (!rw.offsetWidth || !rw.offsetHeight)) bad.push(S.s.label + ': the rest word is not visible'); [...pg.querySelectorAll('.tab-grid.chord-grid')].forEach((g, ri) => { const lab = [...g.children].find(c => c.style.gridRowStart === '7' && c.style.gridColumnStart === '2' && (c.classList.contains('tab-chord-btn') || c.classList.contains('tab-rest-lab'))); if (!lab || !lab.offsetWidth || !lab.textContent.trim()) bad.push(S.s.label + ' row ' + (ri + 1) + ': opens with no chord name, rest word or (Chord) at column 0'); }); }); return { pages, bad }; })()`, 30);
      if (r && r.bad.length) events.push({ step: `chord-grid:${id}:layout-${w}`, kind: 'chord-grid-layout', text: r.bad.slice(0, 4).join(' | ') });
    }
  }
  await page.send('Emulation.clearDeviceMetricsOverride');
  // The lyric sheet (ca-38): "This bar" lights beat cells only; the dot fills once per beat.
  const sheet = await run('chord-grid:sheet', `(() => { const a = CLASS_ACTIVITIES.find(x => x.card && x.card.sheet); if (!a) return null; caFocusActivity(a.id); const root = document.querySelector('.ca-card[open] .pc'); const L = pcLayout(pcActivity(root)); const bpb = L.tr.beatsPerBar; const fake = { currentTime: 0, paused: false, ended: false, playbackRate: 1, src: 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA=', play(){ return Promise.resolve(); }, pause(){} }; const st = { root, L, audio: fake, win: pcWindow(L, false), loopFrom: 0, fromRep: 0, wholeSong: true, sheet: true, raf: 0, timers: [], lastBeat: -1, counting: false, si: -1, seq: -1, rep: -1, beat: -1, key: '', row: null, sheetLine: null, stripKey: null };
      const paper = root.querySelector('.pc-sheet-paper'); const map = pcSheetMap(L); const tk = { x0: 0, x1: 10, y0: 0, y1: 10, name: 'x' };
      paper._sheet = { ok: true, map, model: { crop: { x: 0, y: 0 }, toks: Array.from({ length: map.count + 1 }, () => tk) }, scale: 1 };
      const hits = [], oMark = window.pcSheetMark; window.pcSheetMark = function(pp, idx, hit){ hits.push(!!hit); return null; };
      const oFollow = window.pcFollow; window.pcFollow = function(){};
      pcState = st; const raf = window.requestAnimationFrame; window.requestAnimationFrame = () => 0;
      const lit = new Set(), wrong = []; let frames = 0; const t0 = snipTimeAtBars(st.win, 0); fake.currentTime = t0;
      try { while (fake.currentTime - t0 < 12 && frames < 2000) {
        pcFrame(); frames++;
        const cells = [...root.querySelectorAll('.pc-strip-cell')]; const on = cells.map((c, i) => c.classList.contains('now') ? i : -1).filter(i => i >= 0);
        on.forEach(i => lit.add(i));
        // The strip must be on the beat's own cell and carry each chord name on the cell where it starts.
        const loc = pcLocate(L, snipBarsAt(st.win, fake.currentTime + PC_SHEET_LEAD));
        if (loc && frames > 3 && !(frames > 3 && st.stripKey == null)) {
          const exp = 2 * (loc.beat % bpb);
          if (on.length !== 1 || on[0] !== exp) { if (wrong.length < 3) wrong.push('strip lit [' + on + '] expected ' + exp + ' at beat ' + loc.beat); }
          const want = []; pcChordGrid(L.sections[loc.si].notes, bpb).forEach(ev => { if (!ev.rest && ev.bar === loc.bar) want[Math.round((ev.start - loc.bar * bpb) * 2)] = ev.name; });
          const got = cells.map(c => c.querySelector('.pc-strip-ch').textContent);
          if (want.some((n, i) => (n || '') !== got[i]) || got.some((n, i) => n && !want[i])) { if (wrong.length < 3) wrong.push('strip names [' + got.join('|') + '] expected [' + Array.from({ length: got.length }, (_, i) => want[i] || '').join('|') + '] in bar ' + loc.bar); }
        }
        fake.currentTime += 0.02; } }
      finally { window.requestAnimationFrame = raf; window.pcSheetMark = oMark; window.pcFollow = oFollow; pcState = null; }
      const secPerBeat = st.win.bar / bpb;
      return { lit: [...lit].sort(), fills: hits.filter(Boolean).length, expect: Math.floor(12 / secPerBeat), calls: hits.length, wrong }; })()`, 100);
  if (sheet) {
    if (sheet.wrong && sheet.wrong.length) events.push({ step: 'chord-grid:sheet', kind: 'chord-grid-sheet', text: sheet.wrong.join(' | ') });
    if (sheet.lit.some(i => i % 2)) events.push({ step: 'chord-grid:sheet', kind: 'chord-grid-sheet', text: `"This bar" lit a "+" cell: ${sheet.lit.join(',')}` });
    if (Math.abs(sheet.fills - sheet.expect) > 2) events.push({ step: 'chord-grid:sheet', kind: 'chord-grid-sheet', text: `the dot filled ${sheet.fills} times in 12 s; one per beat is about ${sheet.expect}` });
  }
  await run('chord-grid:done', `(typeof caFocusActivity === 'function') ? (document.querySelectorAll('.ca-card[open]').forEach(c => { c.open = false; }), 1) : 0`, 100);
}

async function walk(base, chromePort, label) {
  const page = await openPage(chromePort);
  let step = 'boot'; const events = []; const stats = { sets: 0, modules: 0, games: 0, buttons: 0 };
  page.on((method, p) => {
    if (method === 'Runtime.exceptionThrown') { const d = p.exceptionDetails; events.push({ step, kind: 'exception', text: (d.exception && (d.exception.description || d.exception.value)) || d.text }); }
    else if (method === 'Runtime.consoleAPICalled' && (p.type === 'error' || p.type === 'warning')) events.push({ step, kind: 'console.' + p.type, text: p.args.map(a => a.value ?? a.description ?? '').join(' ').slice(0, 300) });
    else if (method === 'Log.entryAdded' && p.entry.level === 'error') events.push({ step, kind: 'log.error', text: (p.entry.text + ' ' + (p.entry.url || '')).slice(0, 300) });
  });
  await page.send('Runtime.enable'); await page.send('Log.enable'); await page.send('Page.enable');
  const run = async (name, expr, wait = 250) => {
    step = name;
    try { const v = await page.evalJs(expr); await sleep(wait); return v; }
    catch (e) { events.push({ step: name, kind: 'step-failed', text: String(e.message).split('\n')[0].slice(0, 300) }); return null; }
  };
  const loaded = new Promise(r => page.on(m => { if (m === 'Page.loadEventFired') r(); }));
  await page.send('Page.navigate', { url: `${base}/index.html` });
  await Promise.race([loaded, sleep(15000)]);
  await sleep(3000);
  if (!(await run('dev-bypass-present', `!!document.getElementById('dev-bypass-btn')`))) events.push({ step: 'boot', kind: 'step-failed', text: 'no dev bypass button — the page did not boot' });
  await run('devBypass', `devBypass()`, 3500);
  if (!(await run('app-visible', `getComputedStyle(document.getElementById('app')).display !== 'none'`))) events.push({ step: 'boot', kind: 'step-failed', text: 'the app did not open after the dev bypass' });

  const sets = (await run('list-sets', `SETS.map(s => ({ id: s.id, m: s.moduleNum || s.module || null }))`, 50)) || [];
  const modules = [...new Set(sets.map(s => s.m).filter(Boolean))].sort((a, b) => a - b);
  stats.sets = sets.length; stats.modules = modules.length;
  for (const lang of ['en', 'es']) {
    await run(`${lang}:lang`, `setLang('${lang}')`, 600);
    for (const m of modules) {
      await run(`${lang}:module-${m}`, `onModuleChange(${m})`, 350);
      for (const s of sets.filter(x => x.m === m)) {
        await run(`${lang}:set-${s.id}`, `activateSet(${JSON.stringify(s.id)})`, 120);
        // Every lesson ▶ button's handler must compile (the bug that shipped dead for weeks).
        // Panels from earlier sets stay on the page, so count each distinct handler once.
        const r = await run(`${lang}:buttons-${s.id}`, `(() => { const seen = (window.__gcSeen = window.__gcSeen || new Set()); let n = 0, bad = 0; document.querySelectorAll('#week-panels [onclick]').forEach(b => { const h = b.getAttribute('onclick'); if (seen.has(h)) return; seen.add(h); n++; try { new Function(h); } catch (e) { bad++; } }); return { n, bad }; })()`, 10);
        if (r) { stats.buttons += r.n; if (r.bad) events.push({ step: `${lang}:buttons-${s.id}`, kind: 'bad-handler', text: String(r.bad) }); }
      }
    }
  }
  await run('lang-en', `setLang('en')`, 600);
  await run('load-coach', `ensureCoachJs()`, 1500);   // coach.js (the games) is lazy-loaded
  for (const [name, expr] of [['songs', `openSongsScreen()`], ['class-activities', `openClassActivitiesScreen()`], ['my-progress', `openMyProgressScreen()`], ['games-hub', `openGamesScreen()`]]) await run(name, expr, 900);
  const views = (await run('games-meta', `(typeof GAMES_META !== 'undefined') ? GAMES_META.map(g => g.view || g.id || g.key) : []`, 50)) || [];
  stats.games = views.length;
  for (const v of views) await run(`game:${v}`, `gamesShow(${JSON.stringify(v)})`, 300);
  await run('games-hub-again', `openGamesScreen()`, 600);
  await run('lang-es-games', `setLang('es')`, 600);
  await run('lang-en-final', `setLang('en')`, 600);
  // The tuner, opened the way its rail button does (fab-tools.js togglePopup). This
  // used to call a toggleTuner() that does not exist, so the step silently did nothing.
  // Chrome runs with a fake mic, so the tuner must open, start listening, and stop on close.
  // A step that throws is already recorded by run(), so only a clean "no" is added here.
  const tunerFail = (step, text) => events.push({ step, kind: 'step-failed', text });
  const tunerOpen = await run('tuner-open', `(() => { togglePopup('tuner'); return document.getElementById('tuner-popup').classList.contains('open'); })()`, 1200);
  if (tunerOpen === false) tunerFail('tuner-open', 'togglePopup(\'tuner\') did not open the tuner popup');
  const tunerOn = await run('tuner-listening', `typeof tunerRunning !== 'undefined' && tunerRunning === true`, 10);
  if (tunerOn === false) tunerFail('tuner-listening', 'the tuner opened but did not start listening to the (fake) mic');
  const tunerShut = await run('tuner-close', `(() => { togglePopup('tuner'); return !document.getElementById('tuner-popup').classList.contains('open') && tunerRunning === false; })()`, 500);
  if (tunerShut === false) tunerFail('tuner-close', 'a second togglePopup(\'tuner\') did not close the popup and stop the mic');
  await run('click-away', `document.body.click()`, 300);
  await chordGridWalk(page, run, events, stats);
  await page.close();
  return { label, stats, errors: events.filter(e => !NOISE.test(e.text || '')) };
}

const chrome = findChrome();
if (!chrome) { console.error('smoke: no Chrome/Chromium found — pass --chrome <path> or set CHROME'); process.exit(2); }
if (typeof WebSocket === 'undefined') { console.error('smoke: needs Node 22+ (global WebSocket)'); process.exit(2); }

const cleanup = [];
let exitCode = 0;
try {
  const prof = mkdtempSync(join(tmpdir(), 'gc-smoke-chrome-'));
  const cdp = await freePort();
  const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--use-fake-ui-for-media-stream',
    '--use-fake-device-for-media-stream', '--autoplay-policy=no-user-gesture-required', '--no-first-run', '--disable-gpu', 'about:blank'], { stdio: 'ignore' });
  cleanup.push(() => proc.kill(), () => rmSync(prof, { recursive: true, force: true }));
  for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }

  const here = await serve(ROOT); cleanup.push(() => here.srv.close());
  say(`smoke: walking this checkout on http://127.0.0.1:${here.port} …`);
  const now = await walk(`http://127.0.0.1:${here.port}`, cdp, 'this checkout');
  let base = null;
  if (BASELINE) {
    const dir = extractRef(BASELINE); cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
    const bs = await serve(dir); cleanup.push(() => bs.srv.close());
    say(`smoke: walking ${BASELINE} for comparison …`);
    base = await walk(`http://127.0.0.1:${bs.port}`, cdp, BASELINE);
  }

  // A baseline error is "the same" when kind + step-without-language + text match; a bad-handler count that grew is new.
  const norm = e => `${e.kind}|${e.step.replace(/^(en|es):/, '')}|${e.kind === 'bad-handler' ? '' : e.text}`;
  const baseCount = new Map(); (base ? base.errors : []).forEach(e => baseCount.set(norm(e), Math.max(baseCount.get(norm(e)) || 0, e.kind === 'bad-handler' ? +e.text : 1)));
  const report = base ? now.errors.filter(e => (e.kind === 'bad-handler' ? +e.text : 1) > (baseCount.get(norm(e)) || 0)) : now.errors;
  say(`smoke: ${now.stats.sets} sets in ${now.stats.modules} modules (EN + ES), ${now.stats.games} game views, ${now.stats.buttons} inline handlers compiled${now.stats.chordCards ? `, ${now.stats.chordCards} chord-grid cards walked (cursor, lap, layout at 1366/390/360, lyric sheet${now.stats.chordSkipped ? `; ${now.stats.chordSkipped.join(', ')} is teacher-only and not walked` : ''})` : ''}`);
  if (base) say(`smoke: ${BASELINE} had ${base.errors.length} error event(s); this checkout has ${now.errors.length}`);
  if (report.length) {
    exitCode = 1;
    console.error(`smoke: ✗ ${report.length} error event(s)${base ? ' that the baseline did not have' : ''}:`);
    for (const e of report.slice(0, 40)) console.error(`  - [${e.step}] ${e.kind}: ${(e.text || '').replace(/\s+/g, ' ').slice(0, 220)}`);
    if (report.length > 40) console.error(`  … and ${report.length - 40} more`);
  } else console.log(`smoke: ✓ no JavaScript errors${base ? ' beyond the baseline' : ''}`);
} catch (e) { console.error('smoke: could not run —', e && e.message); exitCode = 2; }
finally { for (const f of cleanup.reverse()) { try { f(); } catch { /* best effort */ } } }
process.exit(exitCode);
