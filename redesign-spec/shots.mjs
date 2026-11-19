#!/usr/bin/env node
/* Redesign mock-up screenshots (2026-11-19). Serves the repo read-only, signs in through the dev bypass,
   layers an override stylesheet (served from the redesign folder at /__look/) on the real site, and takes
   1366x657 screenshots of three screens in EN and ES. Also measures text contrast and fit.
   node shots.mjs --looks today,a,b --langs en,es [--probe] */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, existsSync, statSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { join, normalize, extname } from 'node:path';
import { tmpdir } from 'node:os';
import net from 'node:net';

const ROOT = '/Users/jhoffman/Documents/GitHub/guitar-class';
const OUT = join(ROOT, 'Claude outputs/redesign-2026-11');
const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const LOOKS = opt('--looks', 'today,a,b').split(',');
const LANGS = opt('--langs', 'en,es').split(',');
const SHOTS = opt('--shots', 'lesson,activity,songs').split(',');
const ACT = opt('--act', '');
const PROBE = args.includes('--probe');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.webmanifest': 'application/manifest+json' };
function serve() {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    let base = ROOT;
    if (p.startsWith('/__look/')) { base = OUT; p = p.slice(7); }
    if (p.endsWith('/')) p += 'index.html';
    const f = normalize(join(base, p));
    if (!f.startsWith(base) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('nf'); return; }
    res.writeHead(200, { 'content-type': MIME[extname(f).toLowerCase()] || 'application/octet-stream', 'cache-control': 'no-store' });
    res.end(readFileSync(f));
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}
const freePort = () => new Promise(res => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
async function openPage(port) {
  const t = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const handlers = [];
  ws.onmessage = e => { const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else if (m.method) handlers.forEach(h => h(m.method, m.params)); };
  const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
  const ev = async (expression) => { const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || JSON.stringify(r.exceptionDetails)); return r.result.value; };
  return { send, ev, on: h => handlers.push(h) };
}

/* In-page measuring: every visible text node's colour against the background actually behind it
   (ancestor backgrounds composed, alpha included), plus fit: sideways scroll, clipped text, wrapped controls. */
const MEASURE = `(() => {
  const parse = c => { const m = c.match(/rgba?\\(([^)]+)\\)/); if (!m) return null; const p = m[1].split(/[ ,\\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p.length > 3 ? p[3] : 1]; };
  const over = (top, bot) => { const a = top[3] + bot[3] * (1 - top[3]); if (!a) return [0,0,0,0]; return [0,1,2].map(i => (top[i] * top[3] + bot[i] * bot[3] * (1 - top[3])) / a).concat(a); };
  const lum = c => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]); };
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05); };
  const bgOf = el => { const stack = []; let unknown = false; for (let e = el; e && e.nodeType === 1; e = e.parentElement) { const cs = getComputedStyle(e);
      if (cs.backgroundImage && cs.backgroundImage !== 'none' && !/url\\(/.test(cs.backgroundImage)) unknown = unknown || /gradient/.test(cs.backgroundImage);
      const c = parse(cs.backgroundColor); if (c && c[3] > 0) { stack.push(c); if (c[3] >= 1) break; } }
    let col = [255,255,255,1]; for (let i = stack.length - 1; i >= 0; i--) col = over(stack[i], col); return { col, unknown }; };
  const vis = r => r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < innerHeight && r.left < innerWidth;
  const pairs = {}; const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n; (n = tw.nextNode());) { if (!n.textContent.trim()) continue; const el = n.parentElement; if (!el) continue;
    const range = document.createRange(); range.selectNodeContents(n); const r = range.getBoundingClientRect(); if (!vis(r)) continue;
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue;
    let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity;
    const fg0 = parse(cs.color); if (!fg0) continue; const { col: bg, unknown } = bgOf(el); const fg = over([fg0[0], fg0[1], fg0[2], fg0[3] * op], bg);
    const px = parseFloat(cs.fontSize), w = +cs.fontWeight; const large = px >= 24 || (px >= 18.66 && w >= 700);
    const disabled = !!el.closest('[disabled],[aria-disabled="true"],.locked');
    const key = fg.slice(0,3).map(Math.round).join(',') + '|' + bg.slice(0,3).map(Math.round).join(',') + '|' + (large ? 'L' : 'N');
    const rt = ratio(fg, bg);
    if (!pairs[key]) pairs[key] = { fg: 'rgb(' + fg.slice(0,3).map(Math.round) + ')', bg: 'rgb(' + bg.slice(0,3).map(Math.round) + ')', large, ratio: +rt.toFixed(2), need: large ? 3 : 4.5, unknown, disabled, sample: n.textContent.trim().slice(0, 40), cls: (el.className && el.className.baseVal === undefined ? el.className : '').toString().slice(0, 50) };
  }
  const clipped = []; document.querySelectorAll('body *').forEach(e => { const r = e.getBoundingClientRect(); if (!vis(r)) return; const cs = getComputedStyle(e);
    if ((cs.overflowX === 'hidden' || cs.textOverflow === 'ellipsis') && e.scrollWidth > e.clientWidth + 1 && e.textContent.trim() && e.children.length < 3) clipped.push((e.className || e.tagName).toString().slice(0, 40) + ': ' + e.textContent.trim().slice(0, 30)); });
  const wrapped = []; document.querySelectorAll('button, .btn, a[role=button], [class*=pill], [class*=chip], .nav-btn, .ca-focus-dot, h1, h2, h3, .sh-tile-title, .header-title').forEach(e => { const r = e.getBoundingClientRect(); if (!vis(r)) return; const cs = getComputedStyle(e);
    if (cs.whiteSpace === 'nowrap' || cs.visibility === 'hidden') return; const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2; const inner = r.height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom) - parseFloat(cs.borderTopWidth) - parseFloat(cs.borderBottomWidth);
    if (e.textContent.trim() && inner > lh * 1.6 && e.querySelectorAll('svg,img').length < 2 && e.children.length < 4) wrapped.push((e.className || e.tagName).toString().slice(0, 40) + ': ' + e.textContent.trim().replace(/\\s+/g,' ').slice(0, 30)); });
  const ctrls = []; document.querySelectorAll('button, select, input[type=range], textarea, summary, a[role=button]').forEach(e => { const r = e.getBoundingClientRect(); if (!vis(r)) return; const cs = getComputedStyle(e); if (cs.visibility === 'hidden') return;
    const outer = bgOf(e.parentElement).col; const own = parse(cs.backgroundColor); const fill = own && own[3] > 0 ? over(own, outer) : null; const bw = parseFloat(cs.borderTopWidth); const bc = parse(cs.borderTopColor);
    const edge = bw > 0 && bc && bc[3] > 0 ? over(bc, fill || outer) : null; const best = Math.max(fill ? ratio(fill, outer) : 1, edge ? ratio(edge, outer) : 1);
    const dis = e.disabled || e.getAttribute('aria-disabled') === 'true';
    ctrls.push({ cls: (typeof e.className === 'string' ? e.className : e.tagName).slice(0, 40), txt: (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 24), r: +best.toFixed(2), dis, hasText: !!(e.textContent || '').trim() }); });
  const boxes = {}; ['.header', '.set-eyebrow', '.dp.focus li.step.cur .st-text', '.dp.focus li.step.cur .step-2col-media', '.ca-bar-open', '.ca-step-row', '.ca-step-dir', '.sh-core-grid', '.page-topbar', '.sh-tile-name'].forEach(sel => { const e = [...document.querySelectorAll(sel)].find(x => x.getClientRects().length && getComputedStyle(x).visibility !== 'hidden'); if (e) { const cs = getComputedStyle(e); boxes[sel] = { h: Math.round(e.getBoundingClientRect().height), lines: Math.round((e.getBoundingClientRect().height - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom)) / (parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2)) }; } });
  return { ctrls, boxes, pairs: Object.values(pairs), side: document.documentElement.scrollWidth - document.documentElement.clientWidth, clipped, wrapped };
})()`;

const chrome = process.env.CHROME;
const prof = mkdtempSync(join(tmpdir(), 'gc-redesign-chrome-'));
const cdp = await freePort();
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }
const { srv, port } = await serve();
const report = {};
try {
  const page = await openPage(cdp);
  const errs = [];
  page.on((m, p) => { if (m === 'Runtime.exceptionThrown') errs.push(p.exceptionDetails.exception?.description?.slice(0, 200)); });
  await page.send('Runtime.enable'); await page.send('Page.enable'); await page.send('Network.enable');
  await page.send('Network.setBypassServiceWorker', { bypass: true });
  await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
  await page.send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
  for (let i = 0; i < 100; i++) { await sleep(200); try { if (await page.ev(`document.readyState==='complete' && typeof devBypass==='function'`)) break; } catch {} }
  await sleep(1500);
  await page.ev(`(localStorage.removeItem('railCollapsed'), devBypass(), 1)`); await sleep(3500);
  if (PROBE) {
    const c = await page.ev(`CLASS_ACTIVITIES.filter(x => x.view === 'focus' && !x.teacherOnly && caIsVisible(x)).map(x => ({ id: x.id, t: x.title, n: x.steps.length, paths: !!(x.paths && x.paths.length), kinds: x.steps.map(s => Object.keys(s).filter(k => !/^(label|text|_es|text_es|label_es|id)$/.test(k)).join('+')).join(' | ') }))`);
    console.log(JSON.stringify(c, null, 1)); process.exitCode = 0;
  } else {
    const setLook = async (look) => { await page.ev(`(() => { document.querySelectorAll('#gc-look').forEach(e => e.remove()); ${look === 'today' ? '' : `const l = document.createElement('link'); l.id = 'gc-look'; l.rel = 'stylesheet'; l.href = '/__look/look-${look}.css?' + Date.now(); document.head.appendChild(l); return new Promise(r => { l.onload = r; l.onerror = r; });`} })()`); await page.ev(`document.fonts.ready.then(() => 1)`); await sleep(400); };
    const [actId, actStep] = (ACT || '').split(':');
    const go = {
      lesson: `(async () => { caCloseOpen && caCloseOpen(); setStationView(true); returnToPractice(); onModuleChange(3); await new Promise(r => setTimeout(r, 600)); activateSet('m3w1'); await new Promise(r => setTimeout(r, 1200));
        const dp = [...document.querySelectorAll('.dp')].find(d => d.getClientRects().length && d.querySelector('li.step .step-2col')); const li = dp.querySelector('li.step .step-2col').closest('li.step');
        dp.querySelectorAll('li.step').forEach(x => x.classList.toggle('collapsed', x !== li)); syncStationFocus(dp); document.querySelector('.app-layout .main').scrollTop = 0; return 1; })()`,
      activity: `(async () => { openClassActivitiesScreen(); await new Promise(r => setTimeout(r, 500)); caFocusActivity('${actId}'); await new Promise(r => setTimeout(r, 500)); caFocusGo('${actId}', ${actStep || 0}); await new Promise(r => setTimeout(r, 800)); return 1; })()`,
      songs: `(async () => { caCloseOpen(); goExploreHash('songs'); await new Promise(r => setTimeout(r, 1500)); document.querySelector('.app-layout .main').scrollTop = 0; return 1; })()`,
    };
    for (const look of LOOKS) {
      await setLook(look);
      for (const lang of LANGS) {
        await page.ev(`(setLang('${lang}'), 1)`); await sleep(700);
        for (const s of SHOTS) {
          await page.ev(go[s]); await sleep(900);
          await setLook(look);   // re-assert last in <head> in case something was appended
          if (args.includes('--dump')) { console.log('=== ' + s + ' ' + lang); console.log(await page.ev(`(() => { const out = []; const vis = r => r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.left < innerWidth; const walk = (e, d) => { if (d > 22) return; const r = e.getBoundingClientRect(); if (!vis(r) || getComputedStyle(e).visibility === 'hidden') return; const own = [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').slice(0, 40); const cls = typeof e.className === 'string' ? e.className : ''; if (cls || own) out.push(' '.repeat(d) + e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') + (cls ? '.' + cls.trim().split(/\\s+/).join('.') : '') + (own ? ' «' + own + '»' : '') + ' [' + Math.round(r.left) + ',' + Math.round(r.top) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + ']'); [...e.children].forEach(c => walk(c, d + 1)); }; walk(document.body, 0); return out.join('\\n'); })()`)); continue; }
          const shot = await page.send('Page.captureScreenshot', { format: 'png' });
          const name = `${s}-${look}-${lang}.png`;
          writeFileSync(join(OUT, name), Buffer.from(shot.data, 'base64'));
          report[`${s}|${look}|${lang}`] = await page.ev(MEASURE);
          console.log('shot', name);
        }
      }
      if (look !== 'today') await setLook('today');
    }
    await page.ev(`(caCloseOpen && caCloseOpen(), 1)`);
    writeFileSync(join(OUT, 'measure.json'), JSON.stringify(report, null, 1));
    if (errs.length) console.log('page exceptions:', errs.length, errs.slice(0, 5));
  }
} finally {
  proc.kill('SIGTERM'); await sleep(800); try { rmSync(prof, { recursive: true, force: true }); } catch {} srv.close();
}
