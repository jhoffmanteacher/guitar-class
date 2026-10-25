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
  await run('tuner-open', `(typeof toggleTuner === 'function') ? (toggleTuner(), 1) : 0`, 700);
  await run('tuner-close', `(typeof toggleTuner === 'function') ? (toggleTuner(), 1) : 0`, 500);
  await run('click-away', `document.body.click()`, 300);
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
  say(`smoke: ${now.stats.sets} sets in ${now.stats.modules} modules (EN + ES), ${now.stats.games} game views, ${now.stats.buttons} inline handlers compiled`);
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
