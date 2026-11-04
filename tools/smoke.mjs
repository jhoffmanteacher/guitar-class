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
  /* The Strum only / Alternating bass switch (bassNotes, ca-35), clicked for
     real: Strum only clears every bass mark and saves 'off'; Alternating bass
     brings them all back and saves 'on' (review R1-4, 2026-10-27). */
  const bassIds = await run('chord-grid:bass-list', `CLASS_ACTIVITIES.filter(a => a.bassNotes && a.card && !a.teacherOnly).map(a => a.id)`, 10) || [];
  for (const id of bassIds) {
    const r = await run(`chord-grid:${id}:bass-switch`, `(() => { caFocusActivity('${id}'); const q = s => document.querySelector('.ca-card[open] ' + s); const count = () => document.querySelectorAll('.ca-card[open] .tab-bass').length; const saved = () => { try { return (JSON.parse(localStorage.getItem('caBassModes') || '{}') || {})['${id}']; } catch (e) { return 'unreadable'; } }; const out = { start: count() }; q('.ca-bass-switch button:nth-child(1)').click(); out.off = count(); out.savedOff = saved(); q('.ca-bass-switch button:nth-child(2)').click(); out.on = count(); out.savedOn = saved(); return out; })()`, 50);
    if (!r) { events.push({ step: `chord-grid:${id}:bass-switch`, kind: 'chord-grid-bass', text: 'the bass switch could not be clicked' }); continue; }
    if (r.off !== 0 || r.savedOff !== 'off') events.push({ step: `chord-grid:${id}:bass-switch`, kind: 'chord-grid-bass', text: `Strum only left ${r.off} bass notes and saved ${r.savedOff}` });
    if (!(r.on > 0) || r.savedOn !== 'on') events.push({ step: `chord-grid:${id}:bass-switch`, kind: 'chord-grid-bass', text: `Alternating bass drew ${r.on} bass notes and saved ${r.savedOn}` });
    stats.bassClicks = (stats.bassClicks || 0) + 1;
  }
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

/* Recording switch (recordingVersions, 2026-10-30 — the Jimi Hendrix / Neil
   Young switch on the Watchtower play-alongs). checks.mjs 1cc renders every
   recording through the real app.js; this clicks the switch for real. For each
   card with versions: it opens on the card's own recording with nothing saved,
   one press moves to the other recording (the other track, the pressed button,
   the Guitar switch only where that track has a full mix, the choice saved for
   the whole song), a second press moves back, and after a page reload the
   saved choice is still the one showing. Leaves nothing saved. Teacher-only
   cards (ca-40) are not walked: a student cannot open them; 1cc renders them. A checkout
   without recording versions (the baseline) skips it. */
async function recordingWalk(page, run, events, stats, base) {
  const cards = await run('recording:list', `typeof caRecordingSwitchHtml === 'function' ? CLASS_ACTIVITIES.filter(a => a.recordingVersions && !a.teacherOnly).map(a => ({ id: a.id, group: a.recordingGroup, label: a.recordingLabel })) : []`, 20);
  if (!cards || !cards.length) return;
  const fail = (id, text) => events.push({ step: 'recording:' + id, kind: 'recording-switch', text });
  const state = `(() => { const q = s => document.querySelector('.ca-card[open] ' + s); const sw = q('.ca-rec-switch'); if (!sw) return { missing: true };
    const L = pcLayout(pcActivity(q('.pc')));
    return { pressed: [...sw.querySelectorAll('button')].filter(b => b.getAttribute('aria-pressed') === 'true').map(b => b.textContent.trim()), track: Object.keys(SNIPPET_TRACKS).find(k => SNIPPET_TRACKS[k] === L.tr),
             secs: L.sections.length, chips: document.querySelectorAll('.ca-card[open] .pc-sec').length, guitar: !!q('.pc-guitar'), full: snippetHasFull(L.tr), saved: localStorage.getItem('caRecordingModes'),
             names: q('.chord-grid') ? q('.chord-grid').querySelectorAll('.tab-chord-btn').length : null,
             dir: q('.pc-dir') ? q('.pc-dir').textContent.trim() : '', strumDir: t('ca.cardStrumDirections') }; })()`;
  // ca-29 draws a strum on every eighth with its chord name (Jonathan, 2026-10-28 for Jimi, 10-30 for Neil): one lap of its first section shows
  // 14 names on Jimi's recording (the bar-2 rest is empty) and 16 on Neil Young's, and the directions say each strum has its name.
  const LAP_NAMES = { 'ca-29': { jimi: 14, neil: 16 } };
  const strums = (id, st, where) => {
    const pin = LAP_NAMES[id]; if (!pin || !st || st.missing) return;
    const want = pin[/-neil$/.test(st.track) ? 'neil' : 'jimi'];
    if (st.names !== want) fail(id, where + ': a lap shows ' + st.names + ' chord names on ' + st.track + ', expected ' + want);
    if (!st.dir.startsWith(st.strumDir)) fail(id, where + ': the directions read ' + JSON.stringify(st.dir.slice(0, 70)) + ', not the every-strum ones');
  };
  const press = `(() => { const b = [...document.querySelector('.ca-card[open] .ca-rec-switch').querySelectorAll('button')].find(x => x.getAttribute('aria-pressed') !== 'true'); b.click(); return 1; })()`;
  await run('recording:open', 'openClassActivitiesScreen()', 600);
  await run('recording:clear', `(localStorage.removeItem('caRecordingModes'), caRecordingModes = {}, 1)`, 10);
  for (const { id, group, label } of cards) {
    await run('recording:' + id + ':open', "caFocusActivity('" + id + "')", 500);
    const a = await run('recording:' + id + ':default', state, 10);
    if (!a || a.missing) { fail(id, 'the recording switch is not on the card'); continue; }
    if (a.pressed[0] !== label) fail(id, 'opens with ' + JSON.stringify(a.pressed) + ' pressed, not the card\'s own recording ' + JSON.stringify(label));
    if (a.chips !== a.secs) fail(id, 'shows ' + a.chips + ' section buttons for ' + a.secs + ' sections');
    strums(id, a, 'on Jimi, first open');
    if (a.pressed.length !== 1 || a.saved) fail(id, 'opens with ' + JSON.stringify(a.pressed) + ' pressed and ' + a.saved + ' saved — it should open on the card\'s own recording with nothing saved');
    await run('recording:' + id + ':press', press, 500);
    const b = await run('recording:' + id + ':other', state, 10);
    if (!b || b.missing) { fail(id, 'the switch is gone after one press'); continue; }
    if (b.track === a.track || b.pressed[0] === a.pressed[0] || b.pressed.length !== 1) fail(id, 'one press left ' + a.track + ' playing / ' + JSON.stringify(b.pressed) + ' pressed');
    if (b.chips !== b.secs) fail(id, 'after one press: ' + b.chips + ' section buttons for ' + b.secs + ' sections');
    strums(id, b, 'after one press');
    if (b.guitar !== b.full) fail(id, 'the Guitar switch is ' + (b.guitar ? 'shown' : 'missing') + ' on ' + b.track + ', which ' + (b.full ? 'has' : 'has no') + ' full mix');
    let saved = null; try { saved = JSON.parse(b.saved || '{}')[group]; } catch (e) { /* reported below */ }
    if (!saved) fail(id, 'the choice was not saved for the song (' + b.saved + ')');
    // Reload: the saved choice must still be the one showing.
    await page.send('Page.navigate', { url: base + '/index.html' });
    await sleep(3500);
    await run('recording:' + id + ':devBypass', 'devBypass()', 3500);
    // The app downgrades this benign browser warning to console.warn (app.js, near the top); a second boot trips it.
    for (let i = events.length - 1; i >= 0; i--) if (events[i].step === 'recording:' + id + ':devBypass' && /ResizeObserver loop/.test(events[i].text)) events.splice(i, 1);
    await run('recording:' + id + ':reopen', "caFocusActivity('" + id + "')", 700);
    const c = await run('recording:' + id + ':after-reload', state, 10);
    if (!c || c.missing || c.track !== b.track || c.pressed[0] !== b.pressed[0]) fail(id, 'after a reload the card shows ' + (c && c.track) + ' / ' + JSON.stringify(c && c.pressed) + ', not the saved ' + b.track);
    strums(id, c, 'after a reload');
    await run('recording:' + id + ':back', press, 500);
    const d = await run('recording:' + id + ':restored', state, 10);
    if (!d || d.track !== a.track || d.pressed[0] !== a.pressed[0]) fail(id, 'a second press did not return to ' + a.track);
    strums(id, d, 'back on Jimi');
    stats.recordingClicks = (stats.recordingClicks || 0) + 1;
    await run('recording:' + id + ':reset', `(localStorage.removeItem('caRecordingModes'), caRecordingModes = {}, 1)`, 10);
  }
  await run('recording:done', `(document.querySelectorAll('.ca-card[open]').forEach(c => { c.open = false; }), 1)`, 100);
}

/* Note Call power chords (ca-43, 2026-10-30). checks.mjs 1cd executes the mic
   rule and every string; this is the real page, in tap mode (the mic is not
   what is under test here): each of ca-43's steps, in English and Spanish,
   draws six strings with a tap area only on the low E and A strings (one per
   fret of the step's range), shows the prompt in that language, and counts a tap
   as it should: the right root fret a hit (English), a wrong string a miss
   (Spanish; for a low-E root, the 5th's fret on the A string). Level 1 is sped up in the page (it runs
   at 20 BPM: a count-in alone is 12 s) — a harness change, not the code
   under test. A checkout without ca-43 skips it. */
async function noteCallWalk(page, run, events, stats, base) {
  const drills = await run('nc:list', `(CLASS_ACTIVITIES.find(a => a.id === 'ca-43') || { steps: [] }).steps.map(s => s.drill || null)`, 10);
  if (!drills || !drills.length) return;
  const fail = (step, text) => events.push({ step: 'notecall:' + step, kind: 'notecall', text });
  /* A FRESH page, with coach.js not loaded: it is lazy-loaded and only the mic
     path loads it, so a student in tap mode (the default) deals every card
     without it. The first version of the power-chord change called a coach.js
     helper from ncDeal, and Start did nothing on exactly this page (the walk
     had loaded coach.js earlier, so nothing saw it). The first Start below runs
     here. */
  await page.send('Page.navigate', { url: base + '/index.html' });
  await sleep(3500);
  await run('nc:devBypass', 'devBypass()', 3500);
  for (let i = events.length - 1; i >= 0; i--) if (events[i].step === 'nc:devBypass' && /ResizeObserver loop/.test(events[i].text)) events.splice(i, 1);
  const lazy = await run('nc:no-coach', `typeof coachReadFrame === 'undefined' && typeof coachPowerTargets === 'function'`, 10);
  if (!lazy) fail('fresh page', 'coach.js is already loaded on a fresh page (or coachPowerTargets is not in app.js) \u2014 this walk cannot show that Note Call deals its cards without coach.js');
  await run('nc:open', 'openClassActivitiesScreen()', 600);
  await run('nc:fast', 'NC_LEVELS[0].bpm = 150; NC_LEVELS[0].beats = 2; 1', 10);
  const K = k => JSON.stringify(k);
  const state = k => `(() => { const k = ${K(k)}, s = noteCalls[k]; if (!s) return null; const p = s.seq[s.idx];
    return { idx: s.idx, phase: s.phase, res: p ? p.res : null, str: p && p.str, frets: p && p.frets, card: (document.getElementById('nc-card-' + k) || {}).textContent || '',
             want: p ? t('ncp.onString', { string: ncStrName(p.str) }) : '', fb: (document.getElementById('nc-fb-' + k) || {}).textContent || '' }; })()`;
  const waitFor = async (step, k, ok, tries = 40) => {
    for (let i = 0; i < tries; i++) { const st = await run(step, state(k), 150); if (st && ok(st)) return st; }
    return null;
  };
  for (const lang of ['en', 'es']) {
    await run('nc:' + lang, `setLang('${lang}')`, 600);
    await run('nc:focus:' + lang, "caFocusActivity('ca-43')", 700);
    for (let i = 0; i < drills.length; i++) {
      const w = lang + ' step ' + (i + 1), d = drills[i] || {};
      await run('nc:go:' + w, `caFocusGo('ca-43', ${i})`, 700);
      // Focus view keeps every step's drill in the page (the others collapsed), so the step's own drill is found by its key.
      const key = await run('nc:key:' + w, `(() => { const b = document.getElementById('ncr-ca-43-s${i}'); return b ? 'ca-43-s${i}' : null; })()`, 10);
      if (!key) { fail(w, 'the Note Call drill is not on the step'); continue; }
      await run('nc:start:' + w, `(ncSet(${K(key)}, 'answer', false), ncSet(${K(key)}, 'coach', false), ncStart(${K(key)}), 1)`, 200);
      const first = await waitFor('nc:first:' + w, key, st => st.idx >= 0 && st.phase === 'play');
      if (!first) { fail(w, 'no card came up after Start'); await run('nc:quit:' + w, `ncQuit(${K(key)})`, 100); continue; }
      const board = await run('nc:board:' + w, `(() => { const b = document.getElementById('nc-board-' + ${K(key)}); const per = {};
        [...b.querySelectorAll('.fg-hit')].forEach(e => { const m = /ncTap\\(([^)]*)\\)/.exec(e.getAttribute('onclick') || ''); const str = m ? m[1].split(',')[1].replace(/['"]/g, '') : '?'; per[str] = (per[str] || 0) + 1; });
        return { lines: [...b.querySelectorAll('line')].filter(l => l.getAttribute('y1') === l.getAttribute('y2')).length, per }; })()`, 10);
      const frets = (d.maxFret != null ? d.maxFret : 5) - (d.minFret != null ? d.minFret : 0) + 1;
      if (!board || board.lines !== 6) fail(w, 'the board draws ' + (board && board.lines) + ' strings, not six');
      else if (JSON.stringify(Object.keys(board.per).sort()) !== JSON.stringify(['A', 'lowE']) || board.per.A !== frets || board.per.lowE !== frets) fail(w, 'tap areas are ' + JSON.stringify(board.per) + ', expected only A and lowE with ' + frets + ' frets each');
      if (!first.card.includes(first.want)) fail(w, 'the card reads ' + JSON.stringify(first.card) + ', expected it to say ' + JSON.stringify(first.want));
      // One tap on the first card, decided in one eval (a 150 BPM card is 0.8 s, so nothing waits on a later one): English taps the right root fret
      // (a hit), Spanish taps the wrong string (a miss: for a low-E root the 5th's fret on the A string, for an A-string root the same fret on the low E string).
      const tapped = await run('nc:tap:' + w, `(() => { const k = ${K(key)}, s = noteCalls[k], p = s.seq[s.idx], str = p.str;
        if (${lang === 'en'}) ncTap(k, p.str, p.frets[0]); else if (p.str === 'lowE') ncTap(k, 'A', p.frets[0] + 2); else ncTap(k, 'lowE', p.frets[0]);
        return { str, res: p.res, fb: document.getElementById('nc-fb-' + k).textContent }; })()`, 10);
      if (lang === 'en' && (!tapped || tapped.res !== 'hit' || !/^\u2713/.test(tapped.fb))) fail(w, 'a tap on the right root fret gave ' + JSON.stringify(tapped) + ', expected a hit');
      if (lang === 'es' && (!tapped || tapped.res !== 'miss')) fail(w, 'a tap on the wrong string (' + (tapped && tapped.str) + ' root) gave ' + JSON.stringify(tapped) + ', expected a miss');
      await run('nc:quit:' + w, `ncQuit(${K(key)})`, 100);
      stats.noteCallSteps = (stats.noteCallSteps || 0) + 1;
    }
  }
  await run('nc:en', "setLang('en')", 600);
}

/* Power Chord Switch at the real window, 1366x657 (2026-10-30, redone
   2026-10-31). Its two 180px charts once pushed Start to 728-772px on a 657px
   screen; the setup is now two columns (settings left, the two charts and the tip
   right) and fits without scrolling, so Start's bar (.cc-startbar) does not
   stick. This opens the games screen through its route (so it is on screen, not
   only in the page), and for the default, a fixed pair and a jump pair asserts
   Start is fully on screen, the tempo row too, the games screen does NOT need
   to scroll, the two charts sit side by side at 200px or wider (a fixed pair),
   and the four pair columns share one top. Then it reloads
   and re-asserts what a new student sees: it opens on Every beat with the
   computer's pick selected and the speed and tempo above the chords. A checkout
   without the game (the baseline) skips it. */
async function powerSwitchWalk(page, run, events, stats, base) {
  const has = await run('pw:has', `typeof CC_POWER_PROGRESSIONS !== 'undefined' && typeof gamesShow === 'function'`, 10);
  if (!has) return;
  const fail = (step, text) => events.push({ step: 'power-layout:' + step, kind: 'power-layout', text });
  const size = { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false };
  const measure = `(() => { const sc = document.getElementById('games-screen'), st = document.querySelector('#cc-body .coach-start'), bpm = document.querySelector('#cc-body [onclick*="ccNudgeBpm"]');
    const s = st && st.getBoundingClientRect(), b = bpm && bpm.getBoundingClientRect();
    return { shown: sc.clientHeight > 0, innerH: window.innerHeight, scrollH: sc.scrollHeight, clientH: sc.clientHeight, start: s && { top: Math.round(s.top), bottom: Math.round(s.bottom) }, tempoBottom: b && Math.round(b.bottom), bar: !!document.querySelector('#cc-body .cc-startbar .coach-start'),
      charts: [...document.querySelectorAll('#cc-body .cc-col-pic .cc-dia svg')].map(e => { const r = e.getBoundingClientRect(); return { top: Math.round(r.top), w: Math.round(r.width) }; }),
      cols: [...document.querySelectorAll('#cc-body .cc-groups .cc-group')].map(e => Math.round(e.getBoundingClientRect().top)), songBtns: document.querySelectorAll('#cc-body .cc-songs .ts-btn:not(.cc-back)').length,
      bodyOverflow: document.getElementById('cc-body').scrollWidth > document.getElementById('cc-body').clientWidth, colOverflow: [...document.querySelectorAll('#cc-body .cc-groups .cc-group, #cc-body .cc-col-set, #cc-body .cc-col-pic')].filter(e => e.scrollWidth > e.clientWidth).length,
      colWidths: [...document.querySelectorAll('#cc-body .cc-groups .cc-group')].map(e => Math.round(e.getBoundingClientRect().width)),
      clipped: [...document.querySelectorAll('#cc-body .cc-groups .ts-btn')].filter(e => e.scrollWidth > e.clientWidth || e.scrollHeight > e.clientHeight).map(e => e.textContent.trim().slice(0, 30)),
      parts: ['.cc-speedtempo', '.cc-groups', '.cc-startbar', '.coach-foot', '.cc-col-set', '.cc-col-pic'].map(s => { const e = document.querySelector('#cc-body ' + s); return s + '=' + (e ? Math.round(e.getBoundingClientRect().height) : '-'); }).join(' '), prog: typeof cc !== 'undefined' && cc ? cc.progIdx : null,
      chartTops: [...new Set([...document.querySelectorAll('#cc-body .cc-col-pic .cc-dia')].map(e => Math.round(e.getBoundingClientRect().top)))].length }; })()`;
  const defaults = `(() => { gamesShow('power'); const rowAt = document.querySelector('#cc-body [onclick*="ccPickRate"]'), progAt = document.querySelector('#cc-body [onclick*="ccPickProg"]'), bpmAt = document.querySelector('#cc-body [onclick*="ccNudgeBpm"]');
    return { rate: CC_RATES[cc.rateIdx].id, prog: cc.progIdx, random: !!CC_POWER_PROGRESSIONS[0].random, active: [...document.querySelectorAll('#cc-body .ts-btn.active')].length,
      speedFirst: !!(rowAt && progAt && (rowAt.compareDocumentPosition(progAt) & Node.DOCUMENT_POSITION_FOLLOWING)), tempoFirst: !!(bpmAt && progAt && (bpmAt.compareDocumentPosition(progAt) & Node.DOCUMENT_POSITION_FOLLOWING)) }; })()`;
  const check = (step, m) => {
    if (!m || !m.shown) { fail(step, 'the games screen is not on screen — the measurement would be of a hidden panel'); return; }
    if (!m.start || m.start.top < 0 || m.start.bottom > m.innerH) fail(step, `Start sits at ${m.start && m.start.top}-${m.start && m.start.bottom}px on a ${m.innerH}px screen — it must be fully on screen (see .cc-startbar)`);
    if (m.tempoBottom == null || m.tempoBottom > m.innerH) fail(step, `the tempo row ends at ${m.tempoBottom}px on a ${m.innerH}px screen`);
    if (!m.bar) fail(step, 'Start is not inside .cc-startbar');
    if (m.scrollH > m.clientH) fail(step, `the setup is ${m.scrollH}px tall on a ${m.clientH}px screen — Power Chord Switch's two columns must fit without scrolling (pick ${m.prog}; ${m.parts})`);
    if (!((m.cols.length === 5 && new Set(m.cols).size === 1 && m.songBtns === 0) || (m.cols.length === 0 && m.songBtns === 16))) fail(step, `the choices are neither five columns on one row (four pair groups and Songs) nor the 16 song switches (column tops: ${m.cols.join(', ')}; ${m.songBtns} song buttons)`);
    if (m.bodyOverflow || m.colOverflow) fail(step, `something overflows sideways: #cc-body ${m.bodyOverflow}, ${m.colOverflow} column(s) wider than their box`);
    if (m.clipped.length) fail(step, `a button label is clipped: ${m.clipped.join(' | ')}`);
    /* A pair and a song switch both keep their two charts side by side at 200px or wider (the 150px floor of diagram-size:power is separate). */
    if (m.charts.length && (m.charts.length !== 2 || m.charts[0].top !== m.charts[1].top || Math.min(...m.charts.map(c => c.w)) < 200)) fail(step, `the two charts are not side by side and 200px or wider: ${JSON.stringify(m.charts)}`);
    stats.powerLayouts = (stats.powerLayouts || 0) + 1;
  };
  await page.send('Emulation.setDeviceMetricsOverride', size);
  await sleep(400);
  await run('pw:route', `ensureCoachJs().then(() => goExploreHash('games'))`, 1500);
  /* The song buttons (2026-11-02) are measured like the pairs: each one picked, English and Spanish, with and without a "Best today" score. */
  const songIdx = (await run('pw:song-idx', `CC_POWER_PROGRESSIONS.map((p, i) => p.song ? i : -1).filter(i => i >= 0)`, 10)) || [];
  /* Three of the 16 song switches are measured: the first, one with the open A5 (its label is the longest) and the last. */
  const songViews = songIdx.length === 16 ? [songIdx[0], songIdx[4], songIdx[15]] : [];
  const views = [['the default', `sessionStorage.removeItem('pwProg'); gamesShow('power')`], ['a fixed pair', `gamesShow('power'); ccPickProg(1)`], ['a jump pair', `gamesShow('power'); ccPickProg(7)`], ...songViews.map((i, n) => [`song switch ${n + 1}`, `gamesShow('power'); ccPickProg(${i})`])];
  if (songIdx.length !== 16) fail('songs', `Power Chord Switch has ${songIdx.length} song switches, expected 16`);
  for (const [name, expr] of views) {
    await run('pw:show:' + name, expr, 500);
    const m = await run('pw:measure:' + name, measure, 10);
    check(name, m);
    if (name === 'a fixed pair' && m && m.shown && m.charts.length !== 2) fail(name, `a fixed pair drew ${m.charts.length} charts — this check cannot show the charts fit`);
  }
  /* A new student's Power Chord Switch opens on 55 BPM (Jonathan, 2026-11-04: 5 slower than the old 60), and a PAIR's play screen says its
     tempo (a song switch's already names its round and BPM). Started for real, halted on a fake clock like the song walk below, measured at
     1366x657: the setup readout, the play-screen line, the play screen not scrolling, Stop and the BPM line on screen. */
  await run('pw:pair-play:start', `(() => { sessionStorage.removeItem('pwBpm'); sessionStorage.removeItem('pwProg'); setLang('en'); gamesShow('power'); ccPickProg(1); ccPickRate(2); window.__pwReadout = (document.getElementById('cc-bpm-readout') || {}).textContent; ccStart(); return 1; })()`, 900);
  const pairPhase = await run('pw:pair-play:wait', `new Promise(r => { const t0 = Date.now(); const f = () => (cc && cc.phase === 'countin') || Date.now() - t0 > 8000 ? r(cc && cc.phase) : setTimeout(f, 50); f(); })`, 50);
  if (pairPhase !== 'countin') fail('pair-play', `a pair round did not reach its count-in (phase "${pairPhase}")`);
  else {
    const pp = await run('pw:pair-play:measure', `(() => { cancelAnimationFrame(ccRaf); ccRaf = null; (cc.timeouts || []).forEach(clearTimeout); cc.phase = 'play'; ccRenderPlay();
      const sc = document.getElementById('games-screen'), stage = document.getElementById('cc-stage'), stop = document.querySelector('#cc-body .coach-stop'), r = stage && stage.getBoundingClientRect();
      return { readout: window.__pwReadout, stage: stage && stage.textContent.trim(), ladder: !!cc.ladder, bpms: cc.stageBpms, scrollH: sc.scrollHeight, clientH: sc.clientHeight, innerH: window.innerHeight,
        stopBottom: stop && Math.round(stop.getBoundingClientRect().bottom), stageBottom: r && Math.round(r.bottom), stageShown: !!(r && r.width > 0) }; })()`, 100);
    if (!pp || pp.readout !== '55 BPM') fail('pair-play', `a new student's setup reads "${pp && pp.readout}", expected "55 BPM"`);
    if (!pp || pp.ladder || !pp.stageShown || pp.stage !== '55 BPM' || JSON.stringify(pp.bpms) !== '[55]') fail('pair-play', `a pair's play screen says "${pp && pp.stage}" (ladder ${pp && pp.ladder}, tempos ${pp && JSON.stringify(pp.bpms)}), expected "55 BPM" and one tempo, 55`);
    else if (pp.scrollH > pp.clientH || pp.stopBottom > pp.innerH || pp.stageBottom > pp.innerH) fail('pair-play', `the pair play screen is ${pp.scrollH}px tall on a ${pp.clientH}px screen; Stop ends at ${pp.stopBottom}px, the BPM line at ${pp.stageBottom}px of ${pp.innerH}`);
    stats.pairPlay = 1;
  }
  await run('pw:pair-play:stop', `(() => { ccStop(); sessionStorage.removeItem('pwBpm'); return 1; })()`, 200);
  /* With a "Best today" score showing (2026-11-01). The score joins the tempo
     row, and once it made the speed and tempo rows too wide to sit side by side:
     the tempo row dropped to its own line and the setup grew to ~698px on a 657px
     screen, cutting off the privacy line under it. Same three views, English and
     Spanish, with the widest score (CC_BPM_MAX). Asserts the "Best today" label is
     really on screen (so the check cannot pass on a page that never drew it), the
     games screen does not scroll, the speed and tempo rows share one top, and the
     privacy line (the bottom of the card) is fully on screen. */
  const bestMeasure = `(() => { const sc = document.getElementById('games-screen'), g = [...document.querySelectorAll('#cc-body .cc-speedtempo > .cc-group')].map(e => Math.round(e.getBoundingClientRect().top)),
    best = document.querySelector('#cc-body .cc-best'), foot = document.querySelector('#cc-body .coach-foot'), f = foot && foot.getBoundingClientRect(), b = best && best.getBoundingClientRect();
    return { shown: sc.clientHeight > 0, innerH: window.innerHeight, scrollH: sc.scrollHeight, clientH: sc.clientHeight, groupTops: g, best: best ? best.textContent.trim() : null, bestVisible: !!(b && b.width > 0 && b.bottom <= window.innerHeight),
      foot: f && { top: Math.round(f.top), bottom: Math.round(f.bottom) }, groupsTop: Math.round(document.querySelector('#cc-body .cc-groups').getBoundingClientRect().top) }; })()`;
  for (const lang of ['en', 'es']) {
    await run('pw:lang:' + lang, `setLang(${JSON.stringify(lang)})`, 400);
    for (const [name, expr] of views) {
      const step = `${name} with a best score (${lang})`;
      await run('pw:best:show:' + step, expr, 300);
      await run('pw:best:clearscore:' + step, `(() => { Object.keys(sessionStorage).filter(k => k.indexOf('ccBest:') === 0).forEach(k => sessionStorage.removeItem(k)); ccRenderSetup(); return 1; })()`, 150);
      check(`${name} without a score (${lang})`, await run('pw:best:nostart:' + step, measure, 10));
      const pre = await run('pw:best:pre:' + step, `Math.round(document.querySelector('#cc-body .cc-groups').getBoundingClientRect().top)`, 10);
      await run('pw:best:set:' + step, `(() => { const k = ccBestKey(ccProgs()[cc.progIdx], cc.rateIdx); sessionStorage.setItem(k, String(CC_BPM_MAX)); ccRenderSetup(); return k; })()`, 300);
      check(step, await run('pw:best:start:' + step, measure, 10));
      const m = await run('pw:best:measure:' + step, bestMeasure, 10);
      if (!m || !m.shown) { fail(step, 'the games screen is not on screen \u2014 the measurement would be of a hidden panel'); continue; }
      if (!m.best || !m.bestVisible) fail(step, `the "Best today" score is not on screen (text: ${JSON.stringify(m.best)}) \u2014 this check cannot show the setup fits with one`);
      if (m.scrollH > m.clientH) fail(step, `with a best score the setup is ${m.scrollH}px tall on a ${m.clientH}px screen \u2014 it must fit without scrolling`);
      if (m.groupTops.length !== 2 || new Set(m.groupTops).size !== 1) fail(step, `with a best score the speed and tempo rows are not side by side (tops: ${m.groupTops.join(', ')})`);
      if (pre !== m.groupsTop) fail(step, `the pair columns sit at ${pre}px with no score and ${m.groupsTop}px once "Best today" shows \u2014 the buttons would jump under a student's pointer`);
      if (!m.foot || m.foot.bottom > m.innerH) fail(step, `with a best score the privacy line ends at ${m.foot && m.foot.bottom}px on a ${m.innerH}px screen \u2014 it is cut off`);
      stats.powerBestLayouts = (stats.powerBestLayouts || 0) + 1;
    }
  }
  /* The two cosmetic checks that go with it (2026-11-01), English and Spanish:
     the group title "Slide along the low E string" must not break between "low"
     and "E" ("Mi" and "grave"), and the done screen's "Pick different chords"
     button needs side padding (.tp-btn has none: the label touched the border).
     The title's line breaks depend on the window width (the four pair columns
     share the games screen), so it is measured at every width from 1366 down to
     920 in steps of 6, not only at 1366. */
  const titleProbe = `(() => {
      sessionStorage.removeItem('pwProg'); gamesShow('power');
      const title = [...document.querySelectorAll('#cc-body .cc-groups .cc-group-title')].find(e => /low[\\s\\u00a0]E|Mi[\\s\\u00a0]grave/.test(e.textContent));
      if (!title) return { found: false };
      const n = title.firstChild, txt = n.textContent, m = txt.match(/(low)[\\s\\u00a0](E)|(Mi)[\\s\\u00a0](grave)/), a = m.index, mid = a + (m[1] || m[3]).length, end = mid + 1 + (m[2] || m[4]).length;
      const top = (x, y) => { const r = document.createRange(); r.setStart(n, x); r.setEnd(n, y); return Math.round(r.getBoundingClientRect().top); };
      return { found: true, words: txt.slice(a, end).replace(/\\u00a0/g, '<nbsp>'), broken: top(a, mid) !== top(mid + 1, end) }; })()`;
  for (const lang of ['en', 'es']) {
    await run('pw:cosmetic:lang:' + lang, `setLang(${JSON.stringify(lang)})`, 400);
    let widths = 0, brokenAt = [], missing = false, words = '';
    for (let w = 1366; w >= 920; w -= 6) {
      await page.send('Emulation.setDeviceMetricsOverride', { ...size, width: w });
      await sleep(120);
      const c = await run('pw:cosmetic:title:' + lang + ':' + w, titleProbe, 10);
      if (!c || !c.found) { missing = true; break; }
      widths++; words = c.words;
      if (c.broken) brokenAt.push(w);
    }
    await page.send('Emulation.setDeviceMetricsOverride', size);
    await sleep(150);
    if (missing) fail('cosmetic (' + lang + ')', 'the "Slide along the low E string" title was not found, so its line break cannot be checked');
    else {
      if (brokenAt.length) fail('cosmetic (' + lang + ')', `the title breaks inside "${words}" at window widths ${brokenAt.join(', ')} — the two words must stay on one line`);
      if (!/<nbsp>/.test(words)) fail('cosmetic (' + lang + ')', `the title joins its two words with an ordinary space (${words}), not a no-break space`);
    }
    const c2 = await run('pw:cosmetic:button:' + lang, `(() => { gamesShow('power'); cc.changes = [{ from: 'A5', to: 'D5', result: 'miss' }]; cc.bpm = 60; ccRenderDone();
      const btn = document.querySelector('#cc-body .cc-change-loop'), cs = btn && getComputedStyle(btn);
      return { padL: cs && parseFloat(cs.paddingLeft), padR: cs && parseFloat(cs.paddingRight), text: btn && btn.textContent.trim() }; })()`, 300);
    if (!c2 || !c2.text || c2.padL < 12 || c2.padR < 12) fail('cosmetic (' + lang + ')', `the done screen's "${c2 && c2.text}" button has ${c2 && c2.padL}px / ${c2 && c2.padR}px side padding — it needs 12px or more`);
    /* Change Up's done screen carries the same button on the same class (2026-11-02). */
    const c3 = await run('pw:cosmetic:cu-button:' + lang, `(() => { gamesShow('cc'); ccPickProg(1); cc.changes = [{ from: 'C', to: 'G', result: 'miss' }]; cc.bpm = 60; ccRenderDone();
      const btn = document.querySelector('#cc-body .cc-change-loop'), cs = btn && getComputedStyle(btn);
      return { power: document.getElementById('cc-body').classList.contains('cc-power'), padL: cs && parseFloat(cs.paddingLeft), padR: cs && parseFloat(cs.paddingRight), text: btn && btn.textContent.trim() }; })()`, 300);
    if (!c3 || !c3.text || c3.power) fail('cosmetic (' + lang + ')', 'Change Up\'s done screen did not draw its "Pick different loop" button in Change Up mode, so its padding cannot be checked');
    else if (c3.padL < 12 || c3.padR < 12) fail('cosmetic (' + lang + ')', `Change Up's done-screen "${c3.text}" button has ${c3.padL}px / ${c3.padR}px side padding \u2014 it needs 12px or more`);
    stats.powerCosmetic = (stats.powerCosmetic || 0) + 1;
    stats.powerTitleWidths = (stats.powerTitleWidths || 0) + widths;
  }
  await run('pw:best:clear', `(() => { Object.keys(sessionStorage).filter(k => k.indexOf('ccBest:') === 0).forEach(k => sessionStorage.removeItem(k)); setLang('en'); return 1; })()`, 300);
  await page.send('Emulation.clearDeviceMetricsOverride');
  // Reload: a new student's first look (the remembered pick is sessionStorage, so a new session starts without it).
  await run('pw:new-session', `(sessionStorage.clear(), 1)`, 10);
  await page.send('Page.navigate', { url: base + '/index.html' });
  await sleep(3500);
  await run('pw:devBypass', 'devBypass()', 3500);
  for (let i = events.length - 1; i >= 0; i--) if (events[i].step === 'pw:devBypass' && /ResizeObserver loop/.test(events[i].text)) events.splice(i, 1);
  await page.send('Emulation.setDeviceMetricsOverride', size);
  await sleep(400);
  await run('pw:route-again', `ensureCoachJs().then(() => goExploreHash('games'))`, 1500);
  const d = await run('pw:fresh', defaults, 400);
  if (!d || d.rate !== 'beat' || d.prog !== 0 || !d.random || !d.speedFirst || !d.tempoFirst) fail('after a reload', `Power Chord Switch opened on speed "${d && d.rate}", choice ${d && d.prog} (the computer's pick first: ${d && d.random}), speed row above the choices: ${d && d.speedFirst}, tempo above them: ${d && d.tempoFirst} — it must open on Every beat with the computer's pick, speed and tempo first`);
  check('after a reload', await run('pw:measure:reload', measure, 10));
  await page.send('Emulation.clearDeviceMetricsOverride');
}

/* Change Up at the real window, 1366x657 (Friday check R1-3, Jonathan
   2026-10-31). Its 80px charts (639248b) pushed the -5/+5 row and Start down the
   scrolling games screen. Since the wide setup (2026-10-31: the three loop lists
   across the top, settings left, charts right) none of its views needs to scroll.
   For the default screen and a 2-, 3- and 4-chord loop and Random 4, assert Start
   is fully on screen and inside .cc-startbar (whose position:sticky is only a
   safety net for a shorter window; checks.mjs 1ca pins the rule), that the games
   screen does not scroll, and that the three loop lists share one row. Runs after
   powerSwitchWalk, on the same page, with coach.js already loaded. */
async function changeUpWalk(page, run, events, stats) {
  const has = await run('cu:has', `typeof CC_PROGRESSIONS !== 'undefined' && typeof gamesShow === 'function' && typeof ccPickProg === 'function'`, 10);
  if (!has) return;
  const fail = (step, text) => events.push({ step: 'changeup-layout:' + step, kind: 'changeup-layout', text });
  const size = { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false };
  const measure = `(() => { const sc = document.getElementById('games-screen'), st = document.querySelector('#cc-body .coach-start');
    const s = st && st.getBoundingClientRect();
    return { shown: sc.clientHeight > 0, innerH: window.innerHeight, scrollH: sc.scrollHeight, clientH: sc.clientHeight, start: s && { top: Math.round(s.top), bottom: Math.round(s.bottom) },
      bar: !!(st && st.parentElement && st.parentElement.classList.contains('cc-startbar')), power: document.getElementById('cc-body').classList.contains('cc-power'),
      cols: [...document.querySelectorAll('#cc-body .cc-up-groups .cc-group')].map(e => Math.round(e.getBoundingClientRect().top)) }; })()`;
  const idx = pred => `CC_PROGRESSIONS.findIndex(${pred})`;
  const views = [['the default', `gamesShow('cc')`],
    ['a 2-chord loop', `gamesShow('cc'); ccPickProg(${idx('p => !p.random && p.chords.length === 2')})`],
    ['a 3-chord loop', `gamesShow('cc'); ccPickProg(${idx('p => !p.random && p.chords.length === 3')})`],
    ['a 4-chord loop', `gamesShow('cc'); ccPickProg(${idx('p => !p.random && p.chords.length === 4')})`],
    ['Random 4', `gamesShow('cc'); ccPickProg(${idx('p => p.random')})`]];
  await page.send('Emulation.setDeviceMetricsOverride', size);
  await sleep(400);
  await run('cu:route', `ensureCoachJs().then(() => goExploreHash('games'))`, 1500);
  for (const [name, expr] of views) {
    await run('cu:show:' + name, expr, 500);
    const m = await run('cu:measure:' + name, measure, 10);
    if (!m || !m.shown) { fail(name, 'the games screen is not on screen \u2014 the measurement would be of a hidden panel'); continue; }
    if (m.power) fail(name, 'the setup is in Power Chord Switch mode, not Change Up');
    if (!m.start || m.start.top < 0 || m.start.bottom > m.innerH) fail(name, `Change Up's Start sits at ${m.start && m.start.top}-${m.start && m.start.bottom}px on a ${m.innerH}px screen \u2014 it must be fully on screen (see .cc-startbar)`);
    if (!m.bar) fail(name, "Change Up's Start is not inside .cc-startbar");
    if (m.scrollH > m.clientH) fail(name, `the setup is ${m.scrollH}px tall on a ${m.clientH}px screen \u2014 Change Up's wide setup must fit without scrolling`);
    if (m.cols.length !== 3 || new Set(m.cols).size !== 1) fail(name, `the three loop lists are not on one row (tops: ${m.cols.join(', ')})`);
    stats.changeUpLayouts = (stats.changeUpLayouts || 0) + 1;
  }
  await page.send('Emulation.clearDeviceMetricsOverride');
}

/* Chord Blitz and Fret Zap at 1366x657 (2026-10-31): the picture on the left and
   the four answers as a 2x2 grid on the right (.cb-cols), the clock across the
   top. Starts each game, and for Chord Blitz both directions (name the shape,
   spot the shape), and asserts the answers are two columns by two rows with the
   picture to their left, the screen does not scroll, and every answer button is
   fully on screen. A checkout without the two columns (the baseline) fails it. */
async function twoColumnQuizWalk(page, run, events, stats) {
  const has = await run('qz:has', `typeof gamesShow === 'function' && typeof cbPickDir === 'function'`, 10);
  if (!has) return;
  const size = { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false };
  const measure = body => `(() => { const sc = document.getElementById('games-screen'), a = [...document.querySelectorAll('#${body} .cb-answer')].map(e => e.getBoundingClientRect()),
    pic = document.querySelector('#${body} .cb-cols > :first-child'), p = pic && pic.getBoundingClientRect();
    return { scrollH: sc.scrollHeight, clientH: sc.clientHeight, innerH: window.innerHeight, n: a.length, lefts: [...new Set(a.map(r => Math.round(r.left)))].length, tops: [...new Set(a.map(r => Math.round(r.top)))].length,
      minLeft: a.length ? Math.round(Math.min(...a.map(r => r.left))) : 0, bottom: a.length ? Math.round(Math.max(...a.map(r => r.bottom))) : 0, picRight: p ? Math.round(p.right) : null }; })()`;
  await page.send('Emulation.setDeviceMetricsOverride', size);
  await sleep(400);
  await run('qz:route', `ensureCoachJs().then(() => goExploreHash('games'))`, 1500);
  for (const [name, body, expr] of [['Chord Blitz, name it', 'cb-body', `gamesShow('blitz'); cbPickDir('name')`], ['Chord Blitz, spot it', 'cb-body', `gamesShow('blitz'); cbPickDir('spot')`], ['Fret Zap', 'fz-body', `gamesShow('fretzap')`]]) {
    await run('qz:show:' + name, expr, 400);
    await run('qz:start:' + name, `document.querySelector('#${body} .coach-start').click()`, 500);
    const m = await run('qz:measure:' + name, measure(body), 10);
    const fail = text => events.push({ step: 'quiz-layout:' + name, kind: 'quiz-layout', text: `${name}: ${text}` });
    if (!m || m.n !== 4) { fail(`${m && m.n} answer buttons, expected 4`); continue; }
    if (m.lefts !== 2 || m.tops !== 2) fail(`the answers are ${m.lefts} columns by ${m.tops} rows, expected a 2x2 grid`);
    if (m.picRight == null || m.picRight > m.minLeft) fail(`the picture (right edge ${m.picRight}px) is not to the left of the answers (${m.minLeft}px)`);
    if (m.scrollH > m.clientH) fail(`the play screen is ${m.scrollH}px tall on a ${m.clientH}px screen \u2014 it must fit without scrolling`);
    if (m.bottom > m.innerH) fail(`the answers end at ${m.bottom}px on a ${m.innerH}px screen`);
    stats.quizLayouts = (stats.quizLayouts || 0) + 1;
    await run('qz:stop:' + name, `typeof cbStop === 'function' && cbStop(); typeof fzStop === 'function' && fzStop(); 1`, 100);
  }
  await page.send('Emulation.clearDeviceMetricsOverride');
}

/* Drawn strum patterns (step.strum, buildStrum — ca-46, 2026-11-03). Every
   class-activity step with a `strum`, in English and Spanish, on its own
   Focus step: one cell per eighth note (8 per bar), an arrow cell numbered
   0..N-1 for every D / U in the pattern and none for a dot, the chord name over
   the first cell of each bar, the same columns in every row, nothing sticking
   out sideways at 1366 or 390 px; then ▶ Play strum lights one arrow and Stop
   puts the button back. A checkout without strum steps skips it. */
async function strumWalk(page, run, events, stats) {
  const list = await run('strum:list', `typeof buildStrum === 'function' ? CLASS_ACTIVITIES.filter(a => !a.teacherOnly && (a.steps || []).some(s => s.strum)).map(a => ({ id: a.id, steps: a.steps.map((s, i) => s.strum ? { i, pattern: s.strum.pattern, bars: s.strum.bars } : null).filter(Boolean) })) : []`, 10);
  if (!list || !list.length) return;
  const fail = (w, text) => events.push({ step: 'strum:' + w, kind: 'strum', text });
  const metrics = (w, h) => page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  await run('strum:open', 'openClassActivitiesScreen()', 600);
  for (const lang of ['en', 'es']) {
    await run('strum:' + lang, `setLang('${lang}')`, 600);
    for (const a of list) {
      await run('strum:focus:' + a.id, `caFocusActivity('${a.id}')`, 700);
      for (const st of a.steps) {
        const w = `${a.id} step ${st.i + 1} ${lang}`;
        await run('strum:go:' + w, `caFocusGo('${a.id}', ${st.i})`, 600);
        const hits = [...String(st.pattern)].filter(c => c === 'D' || c === 'U').length * st.bars.length;
        const probe = `(() => { const li = document.querySelector('.ca-card[open] .ca-step[data-idx="${st.i}"]'); const bd = li && li.querySelector('.strum-board'); if (!bd || !bd.offsetParent) return null;
          const rows = [...bd.querySelectorAll('.strum-row')]; const cells = [...bd.querySelectorAll('.strum-cell')];
          const xs = rows.map(r => [...r.children].map(c => Math.round(c.getBoundingClientRect().left)));
          return { cells: cells.length, seqs: cells.filter(c => c.hasAttribute('data-seq')).map(c => +c.getAttribute('data-seq')),
            names: cells.map(c => c.querySelector('.strum-chord').textContent).filter(Boolean),
            aligned: xs.every(x => x.every((v, k) => v === xs[0][k])), over: bd.scrollWidth - bd.clientWidth, docOver: document.documentElement.scrollWidth - document.documentElement.clientWidth }; })()`;
        const m = await run('strum:probe:' + w, probe, 10);
        if (!m) { fail(w, 'no strum board on screen'); continue; }
        if (m.cells !== st.bars.length * 8) fail(w, `${m.cells} cells for ${st.bars.length} bars, not ${st.bars.length * 8}`);
        if (JSON.stringify(m.seqs) !== JSON.stringify([...Array(hits).keys()])) fail(w, `arrow cells numbered ${JSON.stringify(m.seqs)}, not 0..${hits - 1}`);
        if (JSON.stringify(m.names) !== JSON.stringify(st.bars)) fail(w, `chord names ${JSON.stringify(m.names)}, not ${JSON.stringify(st.bars)}`);
        if (!m.aligned) fail(w, 'the columns do not line up from row to row');
        if (m.over > 0 || m.docOver > 0) fail(w, `sticks out sideways at 1366 px (${m.over} / ${m.docOver})`);
        await metrics(390, 800); await sleep(400);
        const n = await run('strum:narrow:' + w, probe, 10);
        if (!n || n.over > 0 || n.docOver > 0 || !n.aligned) fail(w, 'at 390 px: ' + JSON.stringify(n && { over: n.over, docOver: n.docOver, aligned: n.aligned }));
        await metrics(1366, 657); await sleep(400);
        if (lang === 'en') {
          await run('strum:play:' + w, `document.querySelector('.ca-card[open] .ca-step[data-idx="${st.i}"] .tab--strum .play-seq-btn').click()`, 1300);
          const lit = await run('strum:lit:' + w, `[...document.querySelectorAll('.ca-card[open] .ca-step[data-idx="${st.i}"] .strum-cell.beat-now')].map(c => +c.getAttribute('data-seq'))`, 10);
          if (!lit || lit.length !== 1 || !(lit[0] >= 1 && lit[0] < hits)) fail(w, 'after 1.3 s of ▶ Play strum the lit arrows are ' + JSON.stringify(lit) + ', expected one, past the first');
          await run('strum:stop:' + w, `document.querySelector('.ca-card[open] .ca-step[data-idx="${st.i}"] .tab--strum .play-seq-btn').click()`, 300);
          const idle = await run('strum:idle:' + w, `(() => { const b = document.querySelector('.ca-card[open] .ca-step[data-idx="${st.i}"] .tab--strum .play-seq-btn'); return !b.classList.contains('playing') && b.textContent.includes(t('strum.play')); })()`, 10);
          if (!idle) fail(w, 'Stop did not put ▶ Play strum back');
          /* ▶ Play strum clicks on every beat the whole time (the 1 higher) and sounds a down
             strum louder than an up strum (2026-11-04). pcClick/playNote are recorded, not muted. */
          await run('strum:rec-on:' + w, `(() => { window.__sc = { clicks: [], gains: [] }; window.__pcClick0 = window.pcClick; window.__playNote0 = window.playNote;
            window.pcClick = function(at, accent, countIn, gain){ window.__sc.clicks.push(!!accent); return window.__pcClick0.apply(this, arguments); };
            window.playNote = function(m, g){ window.__sc.gains.push(+g.toFixed(4)); return window.__playNote0.apply(this, arguments); }; })()`, 10);
          await run('strum:rec-play:' + w, `document.querySelector('.ca-card[open] .ca-step[data-idx="${st.i}"] .tab--strum .play-seq-btn').click()`, 1800);
          const rec = await run('strum:rec-read:' + w, `(() => { const r = window.__sc; window.pcClick = window.__pcClick0; window.playNote = window.__playNote0; return r; })()`, 10);
          await run('strum:rec-stop:' + w, `document.querySelector('.ca-card[open] .ca-step[data-idx="${st.i}"] .tab--strum .play-seq-btn').click()`, 300);
          const gset = rec ? [...new Set(rec.gains)].sort((x, y) => y - x) : [];
          if (!rec || rec.clicks.length < 2 || rec.clicks[0] !== true || rec.clicks[1] !== false) fail(w, '▶ Play strum clicks were ' + JSON.stringify(rec && rec.clicks) + ', expected a click on 1 (higher) then on 2 in the first 1.8 s');
          else if (gset.length !== 2 || Math.abs(gset[0] / gset[1] - 1.25 / 0.8) > 0.02 || rec.gains[0] !== gset[0]) fail(w, 'down/up strum loudness was ' + JSON.stringify(rec.gains) + ', expected a louder first (down) strum and quieter up strums, ratio 1.56');
          /* ▶ Play clicks opens the site's Metronome at 60 BPM, in 4/4, running (2026-11-04). */
          await run('strum:metro-set:' + w, `(() => { const s = document.getElementById('bpm-slider'); s.value = 100; onBpmSlider('100'); if (metroRunning) stopMetro(); })()`, 100);
          await run('strum:clicks:' + w, `document.querySelector('.ca-card[open] .ca-step[data-idx="${st.i}"] .tab--strum .strum-clicks-btn').click()`, 400);
          const mt = await run('strum:metro-state:' + w, `({ open: document.getElementById('metro-popup').classList.contains('open'), bpm: +document.getElementById('bpm-slider').value, shown: document.getElementById('bpm-display').textContent, running: metroRunning, meter: getMetroMeter(), strumStopped: !document.querySelector('.tab--strum .play-seq-btn.playing') })`, 10);
          if (!mt || !mt.open || mt.bpm !== 60 || mt.shown !== '60' || !mt.running || mt.meter !== 4 || !mt.strumStopped) fail(w, '▶ Play clicks did not open a running metronome at 60 BPM in 4/4: ' + JSON.stringify(mt));
          await run('strum:metro-off:' + w, `(() => { if (metroRunning) stopMetro(); closePopup('metro'); })()`, 100);
        }
        stats.strumSteps = (stats.strumSteps || 0) + 1;
      }
    }
  }
  await run('strum:en', "setLang('en')", 600);
  await run('strum:close', `(document.querySelectorAll('.ca-card[open]').forEach(c => { c.open = false; }), 1)`, 100);
}

/* The practice-minutes strip in the main top bar (2026-11-03). The site's own host has no Firebase user under the dev
   bypass, so the engine is given a fake signed-in student and a do-nothing Firestore (what tools/pm-e2e.mjs does, smaller:
   this walk is about WHERE the strip is, not what it counts). Looks at six views in both languages at 1366x657 and at
   390 px: the strip is a button, shown, nothing sideways-scrolls, and a practice card has exactly ONE .pm-strip, none in its
   own bar. Games is a full-screen layer (z 120) over the whole header, so its own bar carries a twin (#pm-games). Clicking it opens My progress (and a second click keeps it open); after a reload it comes back. */
async function pmHeaderWalk(page, run, events, stats) {
  const fail = (w, text) => events.push({ step: 'pm-header:' + w, kind: 'pm-header', text });
  const metrics = (w, h) => page.send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 1, mobile: false });
  const FAKE = `(() => { window.__pmWho = 'smoke-pm-student'; const doc = { collection: () => ({ get: () => Promise.resolve({ forEach() {} }), where: () => ({ get: () => Promise.resolve({ forEach() {} }) }), doc: () => ({ set: () => Promise.resolve() }) }), set: () => Promise.resolve() };
    const db = { collection: () => ({ doc: () => doc }), batch: () => ({ set() {}, commit: () => Promise.resolve() }) };
    PM.setHost({ ui: true, user: () => window.__pmWho ? { uid: window.__pmWho, getIdToken: () => Promise.resolve('tok') } : null, db: () => db, period: () => '7' });
    PRACTICE_MINUTES_CONFIG.uiOn = true; PM.syncHeader(true); return true; })()`;
  if (!(await run('pm-header:present', `!!window.PM && !!document.getElementById('pm-header')`, 50))) { fail('boot', 'no PM engine or no #pm-header on the page'); return; }
  await metrics(1366, 657);
  await run('pm-header:fake-student', FAKE, 600);
  const card = await run('pm-header:card', `(() => { const a = CLASS_ACTIVITIES.find(x => x.view === 'card' && !x.teacherOnly && (caIsVisible(x) || caIsPlayAlongOnly(x))); return a ? a.id : null; })()`, 20);
  const views = [['Modules', 'returnToPractice()'], ['In class', 'toggleClassActivities()'], ['Songs', 'toggleSongsHub()'], ['Games', 'toggleGames()'], ['My progress', 'toggleMyProgress()'], ['a practice card', card ? `openClassActivitiesScreen(${JSON.stringify(card)})` : '0']];
  /* Exactly one strip is showing and on top in every view: the header's, or on Games its own bar's (#pm-games). */
  const probe = (id) => `(() => { const h = document.getElementById('${id}');
    const top = [...document.querySelectorAll('.pm-strip')].filter(e => { if (e.hidden || !e.getClientRects().length) return false; const q = e.getBoundingClientRect(), t = document.elementFromPoint(q.left + q.width / 2, q.top + q.height / 2); return t && e.contains(t); }).map(e => e.id);
    return { shown: !h.hidden && !!h.getClientRects().length, isButton: h.tagName === 'BUTTON' && /(^|\\s)pm-strip(\\s|$)/.test(h.className), text: h.innerText.replace(/\\s+/g, ' ').trim(), top, inCardBar: document.querySelectorAll('#ca-bar-open .pm-strip').length,
      over: document.documentElement.scrollWidth - document.documentElement.clientWidth, hdrH: Math.round(document.querySelector('.header').getBoundingClientRect().height), tip: h.title }; })()`;
  for (const [w, h] of [[1366, 657], [390, 844]]) {
    await metrics(w, h); await sleep(300);
    for (const lang of ['en', 'es']) {
      await run(`pm-header:${lang}`, `setLang('${lang}')`, 500);
      for (const [name, call] of views) {
        const label = `${name} ${lang} ${w}px`;
        await run(`pm-header:go:${label}`, call, 900);
        const m = await run(`pm-header:probe:${label}`, probe(name === 'Games' ? 'pm-games' : 'pm-header'), 10);
        if (!m) { fail(label, 'probe failed'); continue; }
        if (!m.shown || !m.isButton) fail(label, 'the strip is not a shown button: ' + JSON.stringify(m));
        else if (m.top.length !== 1 || m.top[0] !== (name === 'Games' ? 'pm-games' : 'pm-header')) fail(label, 'the strips showing and on top are ' + JSON.stringify(m.top) + ', expected only ' + (name === 'Games' ? 'pm-games' : 'pm-header'));
        if (m.inCardBar) fail(label, 'a strip is also drawn in the practice card\'s bar');
        if (m.over > 0) fail(label, `the page scrolls sideways by ${m.over}px`);
        if (w === 1366 && lang === 'en' && !/^\d+\/\d+ min \d+$/.test(m.text)) fail(label, 'strip text is ' + JSON.stringify(m.text));
        if (w === 1366 && m.hdrH > 56) fail(label, `the top bar is ${m.hdrH}px tall (one row is ≤ 56px)`);
        if (m.tip !== (lang === 'en' ? 'Open My progress' : 'Abrir Mi progreso')) fail(label, 'tooltip is ' + JSON.stringify(m.tip));
        stats.pmHeaderViews = (stats.pmHeaderViews || 0) + 1;
      }
    }
  }
  await metrics(1366, 657); await sleep(300);
  await run('pm-header:en', `setLang('en')`, 400);
  await run('pm-header:to-card', card ? `openClassActivitiesScreen(${JSON.stringify(card)})` : '0', 900);
  await run('pm-header:click', `document.getElementById('pm-header').click()`, 900);
  const open1 = await run('pm-header:open1', `!document.getElementById('my-progress-screen').hasAttribute('hidden')`, 10);
  if (!open1) fail('click', 'clicking the strip did not open My progress');
  await run('pm-header:click2', `document.getElementById('pm-header').click()`, 700);
  if (!(await run('pm-header:open2', `!document.getElementById('my-progress-screen').hasAttribute('hidden')`, 10))) fail('click', 'a second click closed My progress (it must only scroll to the top)');
  stats.pmHeaderClicks = 2;
  await run('pm-header:to-games', 'toggleGames()', 1200);
  await run('pm-header:games-click', `document.getElementById('pm-games').click()`, 1200);
  if (!(await run('pm-header:games-open', `document.getElementById('games-screen').hasAttribute('hidden') && !document.getElementById('my-progress-screen').hasAttribute('hidden')`, 10))) fail('games-click', 'clicking the Games bar strip did not close Games and open My progress');
  stats.pmHeaderClicks = 3;
  /* A reload: the dev bypass is gone with the page, so sign in again; the strip must come back and still open My progress. */
  const loadedAgain = new Promise(r => page.on(m => { if (m === 'Page.loadEventFired') r(); }));
  await run('pm-header:reload', `location.reload()`, 10);
  await Promise.race([loadedAgain, sleep(15000)]); await sleep(3500);
  await run('pm-header:devBypass', `devBypass()`, 3500);
  await run('pm-header:fake-student-2', FAKE, 800);
  const back = await run('pm-header:after-reload', `(() => { const h = document.getElementById('pm-header'); return !h.hidden && !!h.getClientRects().length; })()`, 10);
  if (!back) fail('reload', 'after a reload and a new sign-in the strip is not showing');
  await run('pm-header:click3', `document.getElementById('pm-header').click()`, 900);
  if (!(await run('pm-header:open3', `!document.getElementById('my-progress-screen').hasAttribute('hidden')`, 10))) fail('reload', 'after a reload, clicking the strip did not open My progress');
  stats.pmHeaderReload = true;
  /* Signed out: hidden at once and empty. */
  await run('pm-header:out', `(() => { window.__pmWho = null; PM.syncHeader(false); return true; })()`, 200);
  if (!(await run('pm-header:out-check', `(() => { const h = document.getElementById('pm-header'); return h.hidden && h.innerHTML === '' && !h.getClientRects().length; })()`, 10))) fail('signed-out', 'the strip is still showing with nobody signed in');
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
  /* The Games top bar has two exits (2026-11-01): "Main site" always, "All games"
     only inside a game. Clicked for real: hub shows one button, a game shows two,
     "All games" returns to the hub (still open), "Main site" closes the games. */
  const exits = await run('games-exits', `(() => {
    const vis = id => { const b = document.getElementById(id); return !!b && !b.hidden && b.getClientRects().length > 0; };
    openGamesScreen();
    const out = { hub: [vis('games-main-btn'), vis('games-all-btn')] };
    gamesShow('blitz'); out.game = [vis('games-main-btn'), vis('games-all-btn')];
    out.labels = [document.getElementById('games-main-btn').textContent.trim(), document.getElementById('games-all-btn').textContent.trim()];
    document.getElementById('games-all-btn').click();
    out.afterAll = { open: !document.getElementById('games-screen').hidden, hub: !!document.querySelector('#games-panel .games-card'), btns: [vis('games-main-btn'), vis('games-all-btn')] };
    gamesShow('blitz'); document.getElementById('games-main-btn').click();
    return out;
  })()`, 600);
  const gamesClosed = await run('games-main-closed', `document.getElementById('games-screen').hidden`, 400);
  /* "Main site" goes back to the page Games was opened FROM (2026-11-02), not
     all the way to the lesson: In class → Games → Main site lands on In class.
     Through the real hash router, since that is where the bug lived. */
  await run('games-from-ca-reset', `(() => { history.replaceState(null, '', location.pathname + location.search); routeExploreHash(); })()`, 600);
  await run('games-from-ca-open-ca', `goExploreHash('class-activities')`, 900);
  await run('games-from-ca-open-games', `goExploreHash('games')`, 900);
  await run('games-from-ca-main', `document.getElementById('games-main-btn').click()`, 900);
  const backTo = await run('games-from-ca-where', `({ hash: location.hash, ca: !document.getElementById('class-activities-screen').hidden, games: !document.getElementById('games-screen').hidden })`, 50);
  if (backTo && (backTo.hash !== '#class-activities' || !backTo.ca || backTo.games)) events.push({ step: 'games-exits', kind: 'games-exits', text: `In class → Games → Main site landed on ${JSON.stringify(backTo)} (want In class open, games closed)` });
  await run('games-from-ca-leave', `exitExploreHash()`, 900);
  await run('games-reopen', `openGamesScreen()`, 400);   // the steps after this one need the screen open
  if (exits) {
    const j = JSON.stringify;
    if (j(exits.hub) !== '[true,false]') events.push({ step: 'games-exits', kind: 'games-exits', text: `hub shows [Main site, All games] = ${j(exits.hub)} (want [true,false])` });
    if (j(exits.game) !== '[true,true]') events.push({ step: 'games-exits', kind: 'games-exits', text: `a game shows [Main site, All games] = ${j(exits.game)} (want [true,true])` });
    if (!exits.afterAll.open || !exits.afterAll.hub || j(exits.afterAll.btns) !== '[true,false]') events.push({ step: 'games-exits', kind: 'games-exits', text: `All games did not land on the hub: ${j(exits.afterAll)}` });
    if (gamesClosed !== true) events.push({ step: 'games-exits', kind: 'games-exits', text: 'Main site did not close the games screen' });
    const wantLabels = await run('games-exit-labels', `[t('btn.toMainSite'), t('games.common.allGames')].map(x => '\u2190 ' + x)`, 50);
    if (wantLabels && j(exits.labels.map(x => x.replace(/\s+/g, ' '))) !== j(wantLabels)) events.push({ step: 'games-exits', kind: 'games-exits', text: `exit labels ${j(exits.labels)} (want ${j(wantLabels)})` });
  }
  /* The Live quiz screen shares .games-topbar but keeps ONE bare .games-exit
     (index.html). 8a4376f dropped the rule that sized it to its text, and its
     Back pill stretched across the whole grid column (84px → 306px). */
  const lqBack = await run('lq-back-width', `(() => { const s = document.getElementById('live-quiz-screen'); const was = s.hidden; s.hidden = false; const b = s.querySelector('.games-topbar > .games-exit'); const w = b ? b.getBoundingClientRect().width : -1; s.hidden = was; return w; })()`, 50);
  if (typeof lqBack === 'number' && (lqBack < 0 || lqBack > 160)) events.push({ step: 'lq-back-width', kind: 'lq-back-width', text: `Live quiz Back button is ${Math.round(lqBack)}px wide (want it sized to its text, ≤160px)` });
  /* The quiet "optional" edge (2026-11-01): every card that shows the Optional tag
     gets it — teacher flag, optional-in-its-data, or the board's Who picker — and
     a CAS student, for whom every card is optional, gets none. Cards are rendered
     for real with the three sources of "optional", then the state is put back. */
  const edge = await run('optional-edge', `(() => {
    const all = (window.CLASS_ACTIVITIES || []).filter(a => a.kind !== 'check');
    const data = all.find(a => a.optional === true), req = all.find(a => a.optional !== true && a.id !== (data && data.id));
    if (!data || !req) return { missing: true };
    const keep = { f: optionalActivityIds, m: activityForMe, c: classActivities, p: periodOverride, s: studentPeriod };
    const read = html => { const d = document.createElement('div'); d.innerHTML = html; const c = d.firstElementChild; return { edge: c.classList.contains('ca-card--optional'), tag: !!c.querySelector('.ca-optional-tag') }; };
    /* Every renderer that can draw the Optional tag: the list card, the Today
       (hero) card, and both exit-check cards — the list card alone missed the
       Today and check cards on 2026-11-01. Each must agree with the list card. */
    const chk = (window.CLASS_ACTIVITIES || []).find(a => a.kind === 'check');
    const cls = a => { const r = read(caActivityCardHtml(a)), h = read(caHeroCardHtml(a, true));
      if (h.edge !== r.edge || h.tag !== r.tag) return { edge: 'today card ' + JSON.stringify(h), tag: 'list card ' + JSON.stringify(r) };
      if (chk) { const was = optionalActivityIds[chk.id], wasDone = classActivities[chk.id]; optionalActivityIds = Object.assign({}, optionalActivityIds, { [chk.id]: r.tag });
        if (classActivities[a.id] === true) classActivities = Object.assign({}, classActivities, { [chk.id]: true });
        const c1 = read(caCheckCardHtml(chk)), c2 = read(caHeroCheckHtml(chk, true));
        optionalActivityIds = Object.assign({}, optionalActivityIds, { [chk.id]: was }); if (was === undefined) delete optionalActivityIds[chk.id];
        classActivities = Object.assign({}, classActivities, { [chk.id]: wasDone }); if (wasDone === undefined) delete classActivities[chk.id];
        if (c1.edge !== r.edge || c2.edge !== r.edge) return { edge: 'check cards ' + JSON.stringify([c1, c2]), tag: 'list card ' + JSON.stringify(r) }; }
      return r; };
    try {
      optionalActivityIds = {}; activityForMe = {}; classActivities = {}; periodOverride = ''; studentPeriod = '';
      const out = { data: cls(data), req: cls(req) };
      optionalActivityIds = { [req.id]: true }; out.flag = cls(req);
      optionalActivityIds = { [data.id]: false }; out.switchedRequired = cls(data);
      optionalActivityIds = {}; activityForMe = { [req.id]: {} }; out.who = cls(req);
      activityForMe = {}; classActivities = { [data.id]: true }; out.done = cls(data);
      classActivities = {}; periodOverride = 'CAS'; out.cas = cls(data); out.casReq = cls(req);
      return out;
    } finally { optionalActivityIds = keep.f; activityForMe = keep.m; classActivities = keep.c; periodOverride = keep.p; studentPeriod = keep.s; }
  })()`, 100);
  if (edge && edge.missing) events.push({ step: 'optional-edge', kind: 'step-failed', text: 'no optional-in-its-data card and a required card to test' });
  else if (edge) {
    const want = { data: [true, true], req: [false, false], flag: [true, true], switchedRequired: [false, false], who: [true, true], done: [false, true], cas: [false, true], casReq: [false, true] };
    for (const [k, [e, t]] of Object.entries(want)) if (!edge[k] || edge[k].edge !== e || edge[k].tag !== t) events.push({ step: 'optional-edge', kind: 'optional-edge', text: `${k}: grey edge ${edge[k] && edge[k].edge} (want ${e}), Optional tag ${edge[k] && edge[k].tag} (want ${t})` });
  }
  const views = (await run('games-meta', `(typeof GAMES_META !== 'undefined') ? GAMES_META.map(g => g.view || g.id || g.key) : []`, 50)) || [];
  stats.games = views.length;
  for (const v of views) await run(`game:${v}`, `gamesShow(${JSON.stringify(v)})`, 300);
  /* Chord diagrams in the two games on the Change Up engine must be big enough
     to read (2026-10-30): localChordSvg strips an SVG's width and height, and
     for months nothing gave it one back, so every diagram collapsed to the
     width of its label (8-20px). No source check can see a layout. A checkout
     without the game (the baseline) skips it. */
  for (const v of ['cc', 'power'].filter(x => views.includes(x))) {
    /* Power Chord Switch opens on "the computer picks" (no chart until Start),
       on the every-beat speed, with the speed row above the chord choices — read
       that fresh state first, then pick the first fixed pair so charts are drawn. */
    if (v === 'power') {
      const fresh = await run('power:opens-on', `(() => { gamesShow('power'); const rowAt = document.querySelector('#cc-body [onclick*="ccPickRate"]'), progAt = document.querySelector('#cc-body [onclick*="ccPickProg"]');
        const bpmAt = document.querySelector('#cc-body [onclick*="ccNudgeBpm"]');
        return { rate: CC_RATES[cc.rateIdx].id, prog: cc.progIdx, random: !!CC_POWER_PROGRESSIONS[0].random, speedFirst: !!(rowAt && progAt && (rowAt.compareDocumentPosition(progAt) & Node.DOCUMENT_POSITION_FOLLOWING)),
          tempoFirst: !!(bpmAt && progAt && (bpmAt.compareDocumentPosition(progAt) & Node.DOCUMENT_POSITION_FOLLOWING)),
          /* The tempo buttons must be on a 657px screen without scrolling. */
          tempoOnScreen: !!bpmAt && bpmAt.getBoundingClientRect().bottom <= window.innerHeight }; })()`, 200);
      if (fresh && (fresh.rate !== 'beat' || fresh.prog !== 0 || !fresh.random || !fresh.speedFirst || !fresh.tempoFirst)) events.push({ step: 'power:opens-on', kind: 'power-opens-on', text: `Power Chord Switch opened on speed "${fresh.rate}", choice ${fresh.prog} (computer's pick first: ${fresh.random}), speed row above the chords: ${fresh.speedFirst}, tempo buttons above the chords: ${fresh.tempoFirst} — it must open on every beat with the computer's pick, speed and tempo first` });
      if (fresh && !fresh.tempoOnScreen) events.push({ step: 'power:opens-on', kind: 'power-tempo-visible', text: `Power Chord Switch's tempo buttons are below the fold at this window height — a student would have to scroll to change the tempo` });
    }
    const w = await run(`diagram-size:${v}`, `(() => { gamesShow(${JSON.stringify(v)}); ${v === 'power' ? 'ccPickProg(1);' : ''} return [...document.querySelectorAll('#cc-body .cc-dia svg')].map(s => Math.round(s.getBoundingClientRect().width)); })()`, 400);
    /* Power Chord Switch shows two chords, so its charts fill their half of the
       right-hand column (2026-10-31; 180px before that); Change Up keeps the shared 80. */
    const minW = v === 'power' ? 150 : 48;
    if (w && (!w.length || Math.min(...w) < minW)) events.push({ step: `diagram-size:${v}`, kind: 'diagram-size', text: `${v}: ${w.length ? `${w.length} chord diagrams, the smallest ${Math.min(...w)}px wide` : 'no chord diagrams drawn'} — too small to read, need ${minW}px (see .cc-diagrams .cc-dia svg and #cc-body.cc-power)` });
  }
  /* Power Chord Switch's loop picker, clicked for real: pick a loop, leave the
     game, come back — the same loop is still picked — and Change Up, which
     shares the engine, still opens on its own first loop (the two games keep
     separate remembered choices, ccSk). A checkout without the game skips it. */
  if (views.includes('power')) {
    const r = await run('power:pick-and-reopen', `(() => {
      const pills = () => [...document.querySelectorAll('#cc-body .cc-group .ts-btn, #cc-body .cc-songs .ts-btn')].filter(b => /ccPickProg/.test(b.getAttribute('onclick') || ''));
      const active = () => pills().filter(b => b.classList.contains('active')).map(b => b.textContent.trim());
      sessionStorage.removeItem('pwProg');
      gamesShow('power');
      const n = pills().length, want = pills()[3].textContent.trim();
      pills()[3].click();
      gamesShow('hub'); gamesShow('power');
      const again = active();
      gamesShow('cc');
      const ccFirst = pills()[0].textContent.trim(), ccActive = active();
      gamesShow('power');
      /* Power Chord Switch offers the computer's pick, 11 fixed pairs and (2026-11-03) 16 song switches: every choice but the first has two chords,
         and the speed row is clicked for real and remembered across the reopen. */
      const twoOnly = pills().length === 12 && pills().slice(1).every(b => b.textContent.split('↔').length === 2);
      const speedBtns = [...document.querySelectorAll('#cc-body [onclick*="ccPickRate"]')];
      speedBtns[1].click();
      gamesShow('hub'); gamesShow('power');
      const rate = CC_RATES[cc.rateIdx].id;
      ccPickRate(2);   // back to every beat for the steps after this one
      return { n, want, again, ccFirst, ccActive, twoOnly, speedCount: speedBtns.length, rate };
    })()`, 400);
    if (r && (r.n !== 12 || r.again.length !== 1 || r.again[0] !== r.want || r.ccActive.length !== 1 || r.ccActive[0] !== r.ccFirst)) {
      events.push({ step: 'power:pick-and-reopen', kind: 'power-loop-memory', text: `${r.n} choices on the Chord pairs view (want 12: the computer's pick, 11 pairs); picked "${r.want}", reopened on "${r.again.join('|')}"; Change Up opened on "${r.ccActive.join('|')}", its first loop is "${r.ccFirst}"` });
    }
    if (r && (!r.twoOnly || r.speedCount !== 3 || r.rate !== 'half')) {
      events.push({ step: 'power:pairs-and-speed', kind: 'power-pairs-and-speed', text: `Power Chord Switch: every fixed choice is a pair (12 in all): ${r.twoOnly}; ${r.speedCount} speed buttons (want 3); after clicking "Every 2 beats" and reopening it ran at "${r.rate}"` });
    }
  }
  /* Power Chord Switch's SONG switches (2026-11-03), clicked and run for real, all 16:
     1. each picked, the game left and reopened: the same one is still picked, and Start reads its rounds ("Start — 3 rounds");
     2. a game started on the real engine (fake mic) and driven on a fake clock: round 1's count-in and play screen say "Round 1 of 3 · 60 BPM", the play
        screen fits the 657px window (no scrolling, Stop and the BPM buttons on screen), ccBeatTick is stepped through all 8 chords (exactly one .cc-dia.cur,
        the box of that chord, "next:" never empty); then round 2 and round 3 are started the way the engine starts them (ccStageEnd): each at its own tempo,
        the BPM buttons on the play screen move only the rounds still to come (and are off in round 3);
     3. 200 draws of "Two random chords" (the real Start path) are always one of the listed pairs. */
  if (views.includes('power')) {
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
    await sleep(300);
    const songStep = (step, text) => events.push({ step: 'power:songs:' + step, kind: 'power-songs', text });
    const idxs = (await run('power:songs:idx', `CC_POWER_PROGRESSIONS.map((p, i) => p.song ? i : -1).filter(i => i >= 0)`, 10)) || [];
    if (idxs.length !== 16) songStep('count', `${idxs.length} song switches, expected 16`);
    stats.songs = 0;
    for (const i of idxs) {
      const r = await run('power:songs:reopen:' + i, `(() => { const p = CC_POWER_PROGRESSIONS[${i}];
        setLang(${idxs.indexOf(i) % 2 ? "'es'" : "'en'"}); gamesShow('power'); ccPickProg(${i}); gamesShow('hub'); gamesShow('power');
        const active = [...document.querySelectorAll('#cc-body .cc-groups .ts-btn.active')].filter(b => /ccPickProg/.test(b.getAttribute('onclick') || '')).map(b => b.textContent.trim());
        const start = document.querySelector('#cc-body .coach-start'), want = t('games.pw.ladder.start', { n: 3 });
        return { song: p.song, chords: p.chords.join('-'), idx: cc.progIdx, active, start: start && start.textContent.trim(), want }; })()`, 300);
      if (!r || r.idx !== i || r.active.length !== 1 || r.active[0].split('↔').length !== 2 || !r.start || !r.start.includes(r.want)) {
        songStep('reopen', `${r && r.song} ${r && r.chords}: picked choice ${i}, reopened on ${r && r.idx} "${r && r.active.join('|')}"; Start reads "${r && r.start}", expected "${r && r.want}"`);
      }
      /* The game itself. Speed "Every beat" (CC_RATES index 2): chord k is beat k. */
      await run('power:songs:start:' + i, `(() => { ${idxs.indexOf(i) % 3 === 0 ? "isGatePreviewer = () => false; micSampling = { on: true, max: 40 }; micTakesCount = 0; localStorage.setItem(micRecAskKey(), 'yes');" : ''} gamesShow('power'); ccPickProg(${i}); ccPickRate(2); cc.bpm = 60; ccStart(); return 1; })()`, 900);
      const phase = await run('power:songs:wait:' + i, `new Promise(r => { const t0 = Date.now(); const f = () => (cc && cc.phase === 'countin') || Date.now() - t0 > 8000 ? r(cc && cc.phase) : setTimeout(f, 50); f(); })`, 50);
      if (phase !== 'countin') { songStep('start', `the game did not reach its count-in (phase "${phase}") for choice ${i}`); await run('power:songs:stop:' + i, `ccStop(); 1`, 50); continue; }
      const walked = await run('power:songs:ticks:' + i, `(() => {
        const halt = () => { cancelAnimationFrame(ccRaf); ccRaf = null; (cc.timeouts || []).forEach(clearTimeout); };
        const bad = [], sc = document.getElementById('games-screen');
        const stageOf = () => (document.getElementById('cc-stage') || {}).textContent;
        const play = () => { halt(); cc.phase = 'play'; ccRenderPlay(); };
        const fits = (label) => {
          const stop = document.querySelector('#cc-body .coach-stop'), nb = document.querySelector('#cc-body [onclick*="ccNudgeNext"]');
          const sb = stop && stop.getBoundingClientRect().bottom, bb = nb && nb.getBoundingClientRect().bottom;
          if (sc.scrollHeight > sc.clientHeight) bad.push(label + ': the play screen is ' + sc.scrollHeight + 'px tall on a ' + sc.clientHeight + 'px screen (' + ['.cc-col-set', '.cc-col-pic', '.cc-chord', '.cc-next', '.cc-beats', '.cc-last', '.coach-strip', '.coach-live', '.cc-play-bpm', '.coach-stop', '.games-topbar'].map(s => { const e = document.querySelector('#cc-body ' + s) || document.querySelector(s); return s + '=' + (e ? Math.round(e.getBoundingClientRect().height) : '-'); }).join(' ') + ')');
          if (!stop || sb > window.innerHeight) bad.push(label + ': Stop ends at ' + Math.round(sb) + 'px of ' + window.innerHeight);
          if (!nb || bb > window.innerHeight) bad.push(label + ': the BPM buttons end at ' + Math.round(bb) + 'px of ' + window.innerHeight);
          if (document.getElementById('cc-body').scrollWidth > document.getElementById('cc-body').clientWidth) bad.push(label + ': sideways overflow');
        };
        const stageTxt = (n, b) => t('games.pw.ladder.stage', { n, total: 3, bpm: b });
        if (stageOf() !== stageTxt(1, 60)) bad.push('count-in 1 says "' + stageOf() + '"');
        play();
        if (stageOf() !== stageTxt(1, 60)) bad.push('play 1 says "' + stageOf() + '"');
        const widest = () => cc.changes.forEach((c, k) => { c.result = 'off'; ccChipRefresh(k); });   // every chip graded, with the widest symbol and the longest line
        fits('round 1 (nothing graded)');
        widest();
        fits('round 1');
        const lastOne = t('games.cc.lastOne');
        for (let k = 0; k < cc.slots; k++){
          ccBeatTick(k * cc.bpc);
          const cur = [...document.querySelectorAll('.cc-dia.cur')].map(e => e.id), next = document.getElementById('cc-next').textContent;
          if (cur.length !== 1 || cur[0] !== 'cc-dia-' + cc.seq[k]) bad.push('chord ' + k + ' lights [' + cur.join(',') + '], expected cc-dia-' + cc.seq[k]);
          if (!next.trim()) bad.push('chord ' + k + ' has an empty "next:" line');
          if ((k + 1 < cc.slots) === (next === lastOne)) bad.push('chord ' + k + ' next: "' + next + '"');
        }
        const rects = [...document.querySelectorAll('#cc-body .cc-col-pic .cc-dia')].map(e => e.getBoundingClientRect());
        if (rects.length !== 2 || Math.min(...rects.map(r => r.width)) < 100) bad.push('the charts: ' + rects.length + ' boxes, narrowest ' + Math.round(Math.min(...rects.map(r => r.width))));
        document.querySelector('#cc-body [onclick="ccNudgeNext(5)"]').click();
        if (cc.stageBpms.join() !== '60,80,95') bad.push('+5 gave rounds ' + cc.stageBpms.join('/'));
        document.querySelector('#cc-body [onclick="ccNudgeNext(-5)"]').click();
        cc.changes.forEach(c => { c.result = 'ok'; });
        ccStageEnd(); halt();
        if (cc.stage !== 1 || Math.round(cc.beatMs) !== 800 || stageOf() !== stageTxt(2, 75)) bad.push('round 2 is stage ' + cc.stage + ' at ' + Math.round(cc.beatMs) + ' ms, says "' + stageOf() + '"');
        play(); widest(); fits('round 2');
        cc.changes.forEach(c => { c.result = 'ok'; });
        ccStageEnd(); halt();
        if (cc.stage !== 2 || Math.round(cc.beatMs) !== 667 || stageOf() !== stageTxt(3, 90)) bad.push('round 3 is stage ' + cc.stage + ' at ' + Math.round(cc.beatMs) + ' ms, says "' + stageOf() + '"');
        play();
        const off = [...document.querySelectorAll('#cc-body [onclick*="ccNudgeNext"]')].map(b => b.disabled);
        if (off.length !== 2 || !off.every(Boolean)) bad.push('round 3: the BPM buttons are not both off (' + off.join(',') + ')');
        widest(); fits('round 3');
        cc.changes.forEach(c => { c.result = 'ok'; });
        ccStageEnd(); halt();
        const done = cc.phase === 'done' && cc.changes.length === 21 && document.querySelectorAll('#cc-body .cc-rounds span').length === 3;
        if (!done) bad.push('after round 3 the game is ' + cc.phase + ' with ' + cc.changes.length + ' changes and ' + document.querySelectorAll('#cc-body .cc-rounds span').length + ' round lines');
        ccStop();
        return { bad };
      })()`, 300);
      if (!walked || walked.bad.length) songStep('rounds', `choice ${i}: ${walked && walked.bad.slice(0, 5).join('; ')}`);
      else stats.songs += 3;
    }
    const draws = await run('power:songs:draws', `(() => { gamesShow('power'); const listed = new Set(CC_POWER_PROGRESSIONS.filter(p => !p.random && p.group !== 'song').map(p => [...p.chords].sort().join())), bad = [];
      for (let i = 0; i < 200; i++){ const d = ccPickChords(CC_POWER_PROGRESSIONS[0]); if (d.length !== 2 || d.includes('A5o') || !listed.has([...d].sort().join())) bad.push(d.join('>')); }
      return bad; })()`, 50);
    if (draws && draws.length) songStep('draws', `"Two random chords" drew something that is not a listed pair in ${draws.length} of 200 draws (${draws.slice(0, 3).join(', ')})`);
    stats.songDraws = 200;
    await page.send('Emulation.clearDeviceMetricsOverride');
  }
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
  // Before Note Call's walk: that one reloads a fresh page with no coach.js, and this one needs gamesShow (coach.js) to be there.
  await powerSwitchWalk(page, run, events, stats, base);
  await changeUpWalk(page, run, events, stats);
  await twoColumnQuizWalk(page, run, events, stats);
  await noteCallWalk(page, run, events, stats, base);
  await recordingWalk(page, run, events, stats, base);
  await strumWalk(page, run, events, stats);
  await pmHeaderWalk(page, run, events, stats);
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
  say(`smoke: ${now.stats.sets} sets in ${now.stats.modules} modules (EN + ES), ${now.stats.games} game views, ${now.stats.buttons} inline handlers compiled${now.stats.chordCards ? `, ${now.stats.chordCards} chord-grid cards walked (cursor, lap, layout at 1366/390/360, lyric sheet${now.stats.bassClicks ? `, bass switch clicked on ${now.stats.bassClicks}` : ''}${now.stats.recordingClicks ? `, recording switch clicked, reloaded and flipped back on ${now.stats.recordingClicks}` : ''}${now.stats.chordSkipped ? `; ${now.stats.chordSkipped.join(', ')} is teacher-only and not walked` : ''})` : ''}${now.stats.noteCallSteps ? `, ${now.stats.noteCallSteps} Note Call power-chord steps (EN + ES: six strings, taps on low E and A only, a hit and a miss)` : ''}${now.stats.powerLayouts ? `, a pair play screen says its BPM (${now.stats.pairPlay || 0} run), Power Chord Switch at 1366\u00d7657 (Start and tempo on screen: ${now.stats.powerLayouts} views, incl. after a reload${now.stats.powerBestLayouts ? `; with a "Best today" score, EN + ES, no scrolling and the privacy line on screen: ${now.stats.powerBestLayouts} views` : ''}${now.stats.songs ? `; song buttons picked and reopened, ${now.stats.songs} song-switch rounds (16 switches x 3) run on a fake clock: round tempos, the BPM buttons, the play screen fitting 657px, one lit chart per chord, the done screen with 21 changes, ${now.stats.songDraws} random draws, none a song` : ""}${now.stats.powerCosmetic ? `; "low E" title kept together at ${now.stats.powerTitleWidths} window widths and the done-screen button padded, EN + ES: ${now.stats.powerCosmetic}` : ''})` : ''}${now.stats.changeUpLayouts ? `, Change Up at 1366\u00d7657 (Start on screen, no scrolling: ${now.stats.changeUpLayouts} views)` : ''}${now.stats.quizLayouts ? `, Chord Blitz (both directions) and Fret Zap at 1366\u00d7657 (picture left, 2\u00d72 answers right, no scroll: ${now.stats.quizLayouts} views)` : ''}${now.stats.pmHeaderViews ? `, practice-minutes strip in the top bar: ${now.stats.pmHeaderViews} view checks (6 views x EN/ES x 1366 and 390 px: a shown button, exactly one strip on top, the Games bar's own on Games, no sideways scroll), ${now.stats.pmHeaderClicks} clicks open My progress, back after a reload, hidden when signed out` : ''}${now.stats.strumSteps ? `, ${now.stats.strumSteps} strum-pattern steps (EN + ES: cells, arrows, chord names, columns, 1366 and 390 px; Play strum lights an arrow, clicks every beat and sounds down strums louder; Play clicks opens the Metronome at 60 BPM; Stop resets)` : ''}`);
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
