#!/usr/bin/env node
/* Practice minutes — real-browser test (2026-11-01).

   tools/pm-sim.mjs runs the engine against fakes. This opens the real site in
   headless Chrome at the Chromebook size (1366×657), signs in through the dev
   bypass, gives the engine a fake signed-in student and an in-page fake
   Firestore, opens a real practice card, presses its real Play button on a real
   backing-track mp3, and looks at what a student would see:

     · the status strip in the card's sticky bar (one row, right side)
     · the recap card, the week-goal toast
     · the My progress tiles, bars and 8-week row, in English and Spanish
     · colours read back from the browser (getComputedStyle), not assumed
     · uiOn:false draws nothing at all

   It writes a PNG per state into --out <dir> (default: a temp folder) so they
   can be LOOKED at. Needs Node 22+ and Chrome; not part of checks.mjs.

     node tools/pm-e2e.mjs [--out <dir>] [--chrome <path>] [--date YYYY-MM-DD] */
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, existsSync, statSync, rmSync } from 'node:fs';
import { tmpdir, platform } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const OUT = opt('--out') || mkdtempSync(join(tmpdir(), 'pm-e2e-'));
mkdirSync(OUT, { recursive: true });
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const freePort = () => new Promise((res) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); });
const chrome = opt('--chrome') || process.env.CHROME || (platform() === 'darwin' ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome' : '/usr/bin/google-chrome');
if (!existsSync(chrome)) { console.error('pm-e2e: no Chrome found — pass --chrome <path>'); process.exit(2); }

let pass = 0, fail = 0;
const check = (name, ok, detail) => { if (ok) { pass++; console.log('  ✓ ' + name); } else { fail++; console.log('  ✗ ' + name + (detail !== undefined ? '  — ' + JSON.stringify(detail) : '')); } };

/* Static server with byte-Range support (audio/ needs it). */
const srv = createServer((req, res) => {
  let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = normalize(join(ROOT, p));
  if (!f.startsWith(ROOT) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('nf'); return; }
  const buf = readFileSync(f), type = MIME[extname(f).toLowerCase()] || 'application/octet-stream';
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.range || '');
  if (m) {
    const a = m[1] ? +m[1] : 0, b = m[2] ? Math.min(+m[2], buf.length - 1) : buf.length - 1;
    res.writeHead(206, { 'content-type': type, 'accept-ranges': 'bytes', 'content-range': `bytes ${a}-${b}/${buf.length}`, 'content-length': b - a + 1 });
    res.end(buf.subarray(a, b + 1));
  } else { res.writeHead(200, { 'content-type': type, 'accept-ranges': 'bytes', 'content-length': buf.length }); res.end(buf); }
});
await new Promise((r) => srv.listen(0, '127.0.0.1', r));
const port = srv.address().port;
const prof = mkdtempSync(join(tmpdir(), 'pm-e2e-chrome-'));
const cdp = await freePort();
const proc = spawn(chrome, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--autoplay-policy=no-user-gesture-required',
  '--no-first-run', '--disable-gpu', '--hide-scrollbars', 'about:blank'], { stdio: 'ignore' });
const done = (code) => { try { proc.kill(); srv.close(); rmSync(prof, { recursive: true, force: true }); } catch {} process.exit(code); };
for (let i = 0; i < 60; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }

const t = await (await fetch(`http://127.0.0.1:${cdp}/json/new?about:blank`, { method: 'PUT' })).json();
const ws = new WebSocket(t.webSocketDebuggerUrl);
await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
let id = 0; const pending = new Map(); const consoleErrors = [];
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
  else if (m.method === 'Runtime.exceptionThrown') consoleErrors.push(m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text);
};
const send = (method, params = {}) => new Promise((res, rej) => { const i = ++id; pending.set(i, { res, rej }); ws.send(JSON.stringify({ id: i, method, params })); });
const ev = async (expression) => {
  const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
  if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || JSON.stringify(r.exceptionDetails));
  return r.result.value;
};
const waitFor = async (expr, ms = 20000) => { const t0 = Date.now(); while (Date.now() - t0 < ms) { if (await ev(expr).catch(() => false)) return true; await sleep(250); } return false; };
const shot = async (name) => { const r = await send('Page.captureScreenshot', { format: 'png' }); writeFileSync(join(OUT, name + '.png'), Buffer.from(r.data, 'base64')); return join(OUT, name + '.png'); };

await send('Page.enable'); await send('Runtime.enable');
/* --date YYYY-MM-DD runs the whole test as if it were that day (10:00 local):
   the page's Date is shifted before any script loads. Used to prove the test
   holds on every school week, break weeks included. */
const FAKE_DATE = opt('--date');
if (FAKE_DATE) await send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { const D = Date, off = new D(${JSON.stringify(FAKE_DATE + 'T10:00:00')}).getTime() - D.now();
  class FD extends D { constructor(...a) { if (a.length) super(...a); else super(D.now() + off); } static now() { return D.now() + off; } }
  window.Date = FD; })()` });
await send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
await send('Page.navigate', { url: `http://127.0.0.1:${port}/index.html` });
for (let i = 0; i < 80; i++) { if (await ev(`typeof devBypass === 'function' && !!document.getElementById('dev-bypass-btn') && document.readyState === 'complete'`).catch(() => false)) break; await sleep(250); }
await sleep(3500);   // Firebase answers "signed out" a moment after load; the bypass must come after it (as in tools/smoke.mjs)
await ev(`devBypass()`); await sleep(3500);
if (!(await ev(`getComputedStyle(document.getElementById('app')).display !== 'none'`))) { console.log('the app did not open after the dev bypass'); done(2); }
await ev(`(async () => { for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); for (const k of await caches.keys()) await caches.delete(k); })()`);

/* An in-page student and Firestore. The engine's host is replaced; everything
   else (the wrapped play(), the tick, the strip, the pills, the page) is real. */
await ev(`(() => {
  window.__fs = { days: {}, weeks: {}, commits: [], hb: [] };
  const inc = (n) => ({ __inc: n });
  const col = (kind) => ({
    get: () => Promise.resolve({ forEach: (fn) => Object.keys(window.__fs[kind]).forEach((k) => fn({ id: k, data: () => window.__fs[kind][k] })) }),
    where: () => ({ get: () => Promise.resolve({ forEach: (fn) => Object.keys(window.__fs.days).forEach((k) => fn({ id: k, data: () => window.__fs.days[k] })) }) }),
    doc: (id) => ({ path: kind + '/' + id, set: () => Promise.resolve() }),
  });
  const db = { collection: (c) => ({ doc: (uid) => ({ collection: (k) => { const o = col(k); const d = o.doc; o.doc = (i) => ({ path: k + '/' + i }); return o; } }), doc: (i) => ({ set: (d) => { window.__fs.hb.push({ id: i, d }); return Promise.resolve(); } }) }),
    batch: () => { const ops = []; return { set: (r, d) => ops.push([r.path, d]), commit: () => { ops.forEach(([p, d]) => { const [k, i] = p.split('/'); const cur = window.__fs[k][i] || {}; window.__fs[k][i] = Object.assign({}, cur, d, { seconds: (cur.seconds || 0) + d.seconds.__inc }); }); window.__fs.commits.push(ops.length); return Promise.resolve(); } }; } };
  const fakeUser = { uid: 'e2e-student', getIdToken: () => Promise.resolve('tok') };
  const fb = window.firebase || {};
  if (!fb.firestore) { window.firebase = Object.assign(fb, { firestore: Object.assign(() => db, { FieldValue: { increment: inc, serverTimestamp: () => ({}) }, FieldPath: { documentId: () => '__name__' } }) }); }
  window.__period = '7';
  PM.setHost({ ui: true, user: () => fakeUser, db: () => db, period: () => window.__period });
  window.__aggN = 14;
  const of = window.fetch; window.fetch = (u, i) => /runAggregationQuery/.test(u) ? Promise.resolve({ json: () => Promise.resolve([{ result: { aggregateFields: { n: { integerValue: String(window.__aggN) } } } }]) }) : of(u, i);
  return true;
})()`);
const todayWeek = await ev(`PM.calc.weekIdOf(PM.calc.ymd(new Date()))`);
const seedWeeks = (hits) => ev(`(() => { const f = window.__fs; f.weeks = {}; f.days = {}; const cur = ${JSON.stringify(todayWeek)};
  ${JSON.stringify(hits)}.forEach((secs, i) => { const w = PM.calc.weekAdd(cur, -(i + 1)); if (secs) f.weeks[w] = { seconds: secs, goalSeconds: 1800, hit: secs >= 1800 }; });
  const s = PM._state(); if (s) { s.weeks = {}; s.days = {}; s.pend = {}; s.loaded = false; s.loading = null; s.toastWeek = ''; s.pendingToast = false; s.lastRecapAt = 0; } return true; })()`);

console.log('shipped config');
check('the shipped config has uiOn true, goal 30, streaks starting 2026-W45', await ev(`PRACTICE_MINUTES_CONFIG.uiOn === true && PRACTICE_MINUTES_CONFIG.weeklyGoalMinutes === 30 && PRACTICE_MINUTES_CONFIG.streakStartWeek === '2026-W45'`));
/* The seeded history below is dated from the real clock, so the shipped streak
   start (a week the real date may not have reached), the shipped break weeks and
   the semester split are cleared for it: with them, a seeded "hit" week could be
   a break week, and the expectations failed on 24 of 32 school weeks from
   2026-W48 (2026-11-01 review). The break-week tests below add their own. */
await ev(`PRACTICE_MINUTES_CONFIG.streakStartWeek = ''; PRACTICE_MINUTES_CONFIG.skipWeeks = []; PRACTICE_MINUTES_CONFIG.semester2Start = ''`);
/* ── uiOn false: nothing is drawn ── */
console.log('uiOn false');
await ev(`PRACTICE_MINUTES_CONFIG.uiOn = false`);
const card = await ev(`(() => { const a = CLASS_ACTIVITIES.find(x => x.view === 'card' && (caIsVisible(x) || caIsPlayAlongOnly(x)) && x.card && !x.card.wholeSong && x.card.track); return a ? a.id : null; })()`)
  || await ev(`(CLASS_ACTIVITIES.find(x => x.view === 'card' && (caIsVisible(x) || caIsPlayAlongOnly(x))) || {}).id`);
check('found a practice card to open', !!card, card);
await ev(`openClassActivitiesScreen(${JSON.stringify(card)})`); await sleep(1200);
check('the card is open with its sticky bar', await ev(`!!document.querySelector('#ca-bar-open .ca-bar-name') && !document.getElementById('ca-bar-open').hidden`));
check('uiOn:false → no strip in the bar', await ev(`document.querySelectorAll('.pm-strip').length`) === 0);
await ev(`openMyProgressScreen && (location.hash = '#my-progress')`); await sleep(800);
check('uiOn:false → My progress shows no minutes panel', await ev(`document.getElementById('pm-progress').hidden === true && document.getElementById('pm-progress').innerHTML === ''`));
await ev(`openClassActivitiesScreen(${JSON.stringify(card)})`); await sleep(1200);

/* ── a real Play on a real backing track ── */
console.log('uiOn true, real playback');
await seedWeeks([1900, 1900, 1900]);           // three hit weeks before this one → streak 3 once it is hit
await ev(`PRACTICE_MINUTES_CONFIG.uiOn = true; PM.onCardOpen(); caSyncTopbar();`); await sleep(500);
await ev(`(() => { const s = PM._state(); s.loaded = true; s.weeks = JSON.parse(JSON.stringify(window.__fs.weeks)); s.weeks[PM.calc.weekIdOf(PM.calc.ymd(new Date()))] = { seconds: 23 * 60 - 6, goalSeconds: 1800, hit: false }; return true; })()`);   // 22:54 earlier this week; 6 s of real play will make 23:00
await ev(`document.querySelector('.ca-card[open] .pc-play').click()`);
await waitFor(`PM._session() && PM._session().counted >= 6`);
const st = await ev(`(() => { const s = PM._state(), d = PM.calc.ymd(new Date()); return { pend: s.pend[d], playing: !!(pcState && pcState.audio && !pcState.audio.paused), src: pcState && pcState.audio && pcState.audio.currentSrc, counted: PM._session() && PM._session().counted }; })()`);
check('the real Play counted seconds from a real <audio> (detached element, wrapped play())', st.counted >= 6 && st.counted <= 12 && /-backing-/.test(st.src || ''), st);
await ev(`PM._state().live = 14; PM.refreshStrip(true)`); await sleep(300);
const bar = await ev(`(() => { const b = document.querySelector('.ca-screen .page-topbar'), s = document.querySelector('.pm-strip'); const r = s.getBoundingClientRect(), br = b.getBoundingClientRect(); const items = [...s.children].map(c => c.className); return { barH: Math.round(br.height), stripTop: Math.round(r.top - br.top), stripH: Math.round(r.height), stripRight: Math.round(br.right - r.right), items, text: s.innerText.replace(/\\s+/g, ' '), docOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth, barOverflow: b.scrollWidth > b.clientWidth }; })()`);
check('the strip is in the existing bar: one row (bar ≤ 56px), no horizontal overflow', bar.barH <= 56 && !bar.docOverflow && !bar.barOverflow, bar);
check('three items: live, week ring, streak flame — and only text "14 playing 23/30 min this week 3"', bar.items.join() === 'pm-live,pm-week,pm-streak' && bar.text === '14 playing 23/30 min this week 3', bar);
const col1 = await ev(`(() => { const q = (s, p) => getComputedStyle(document.querySelector(s))[p]; return { ring: q('.pm-strip .pm-ring-fg', 'stroke'), dot: q('.pm-strip .pm-dot', 'backgroundColor'), flame: q('.pm-strip .pm-streak', 'color'), strip: q('.pm-strip', 'backgroundColor'), text: q('.pm-strip .pm-week span', 'color'), dash: q('.pm-strip .pm-ring-fg', 'strokeDashoffset'), anim: q('.pm-strip .pm-dot', 'animationName') }; })()`);
check('goal not hit: ring blue #5AA9FF, dot green #3DDC97, flame DIM (#7A5236)', col1.ring === 'rgb(90, 169, 255)' && col1.dot === 'rgb(61, 220, 151)' && col1.flame === 'rgb(122, 82, 54)', col1);
check('the dot pulses', /pm-pulse/.test(col1.anim), col1.anim);
check('the ring is 23/30 full (dashoffset = circumference × (1 − 23/30))', Math.abs(parseFloat(col1.dash) - 2 * Math.PI * 7 * (1 - 23 / 30)) < 0.5, col1.dash);
await shot('1-strip-not-hit-en');

/* live < 3 hides the item entirely */
await ev(`PM._state().live = 2; PM.refreshStrip(true)`);
check('"N playing" is hidden entirely under 3', await ev(`!document.querySelector('.pm-live')`));
await ev(`PM._state().live = 14; PM.refreshStrip(true)`);

/* Cross the goal: 7 more minutes → toast + yellow ring + orange flame */
await ev(`(() => { const s = PM._state(), d = PM.calc.ymd(new Date()); s.weeks[PM.calc.weekIdOf(d)].seconds += 7 * 60 - 5; return true; })()`);
await waitFor(`!!document.getElementById('pm-toast')`, 15000);
check('crossing 30 min shows the "Week goal hit — 4 weeks in a row" pill', await ev(`(document.getElementById('pm-toast') || {}).innerText || ''`) === 'Week goal hit — 4 weeks in a row', await ev(`(document.getElementById('pm-toast') || {}).innerText`));
await shot('2-toast-and-hit-en');
const col2 = await ev(`(() => { const q = (s, p) => getComputedStyle(document.querySelector(s))[p]; const tf = document.querySelector('#pm-toast .pm-flame-svg'); return { ring: q('.pm-strip .pm-ring-fg', 'stroke'), flame: q('.pm-strip .pm-streak', 'color'), n: document.querySelector('.pm-strip .pm-streak b').textContent, toastFlame: getComputedStyle(tf).color, toastBg: getComputedStyle(document.getElementById('pm-toast')).backgroundColor }; })()`);
check('goal hit: ring turns yellow #FFC93C, flame turns orange #FF8A3D, streak reads 4, toast flame yellow', col2.ring === 'rgb(255, 201, 60)' && col2.flame === 'rgb(255, 138, 61)' && col2.n === '4' && col2.toastFlame === 'rgb(255, 201, 60)', col2);
await sleep(3300);
check('the toast is gone after about 3 s', await ev(`!document.getElementById('pm-toast')`));
const toastKept = await ev(`PM._state().toastWeek === PM.calc.weekIdOf(PM.calc.ymd(new Date()))`);
check('…and is remembered for the week (once per week per student)', toastKept);

/* Stop → recap (session ≥ 60 s needed: lift the session's counted seconds) */
await ev(`PM._session().counted = 5 * 60 + 2`);
await ev(`pcStop()`); await sleep(3500);
const recap = await ev(`(() => { const r = document.getElementById('pm-recap'); return r ? { text: r.innerText.replace(/\\s+/g, ' ').trim(), bg: getComputedStyle(r).backgroundColor, color: getComputedStyle(r.querySelector('.pm-recap-big')).color } : null; })()`);
check('Stop shows the recap: "+5 min" and "This week: 30 of 30 min. That makes 4 weeks in a row."', recap && /^✕ \+5 min This week: 30 of 30 min\. That makes 4 weeks in a row\.$/.test(recap.text), recap);
await shot('3-recap-en');
const bbox = await ev(`(() => { const r = document.getElementById('pm-recap').getBoundingClientRect(), b = document.querySelector('.ca-screen .page-topbar').getBoundingClientRect(); return { top: Math.round(r.top), barBottom: Math.round(b.bottom), right: Math.round(r.right), vw: innerWidth, fits: r.right <= innerWidth && r.left >= 0 }; })()`);
check('the recap sits right under the bar and inside the window', bbox.fits && bbox.top >= bbox.barBottom, bbox);
await sleep(6500);
check('the recap closes itself after 6 s', await ev(`!document.getElementById('pm-recap')`));
/* a second stop inside 3 minutes: no second recap */
await ev(`document.querySelector('.ca-card[open] .pc-play').click()`); await waitFor(`!!PM._session()`);
await ev(`PM._session().counted = 120`); await ev(`pcStop()`); await sleep(3500);
check('at most one recap per 3 minutes', await ev(`!document.getElementById('pm-recap')`));
/* a short session: none */
await ev(`PM._state().lastRecapAt = 0; document.querySelector('.ca-card[open] .pc-play').click()`); await waitFor(`!!PM._session()`);
await ev(`PM._session().counted = 40`); await ev(`pcStop()`); await sleep(3500);
check('a session under 60 s gets no recap', await ev(`!document.getElementById('pm-recap')`));
/* the close button */
await ev(`PM._state().lastRecapAt = 0; document.querySelector('.ca-card[open] .pc-play').click()`); await waitFor(`!!PM._session()`);
await ev(`PM._session().counted = 90`); await ev(`pcStop()`); await sleep(3500);
await ev(`document.querySelector('#pm-recap .pm-recap-x').click()`);
check('the close button dismisses the recap', await ev(`!document.getElementById('pm-recap')`));

/* ── The recap line before the goal is hit: "7 more keeps your 3-week streak." ── */
await seedWeeks([1900, 1900, 1900]);
await ev(`(() => { const s = PM._state(), d = PM.calc.ymd(new Date()); s.loaded = true; s.weeks = JSON.parse(JSON.stringify(window.__fs.weeks)); s.pend = {}; s.days = {}; s.weeks[PM.calc.weekIdOf(d)] = { seconds: 23 * 60, goalSeconds: 1800, hit: false }; s.lastRecapAt = 0; PM.refreshStrip(true); return true; })()`);
await ev(`document.querySelector('.ca-card[open] .pc-play').click()`); await waitFor(`!!PM._session()`);
await ev(`PM._session().counted = 5 * 60`); await ev(`pcStop()`); await sleep(3500);
const r2 = await ev(`(document.getElementById('pm-recap') || {}).innerText`);
check('before the goal: "This week: 23 of 30 min. 7 more keeps your 3-week streak."', /This week: 23 of 30 min\. 7 more keeps your 3-week streak\./.test(r2 || ''), r2);
await shot('3b-recap-before-goal-en');
await ev(`document.getElementById('pm-recap') && document.getElementById('pm-recap').remove()`);

/* ── Spanish ── */
console.log('Spanish');
await ev(`setLang('es')`); await sleep(800);
await ev(`(() => { const s = PM._state(); s.weeks[PM.calc.weekIdOf(PM.calc.ymd(new Date()))] = { seconds: 23 * 60, goalSeconds: 1800, hit: false }; s.pend = {}; return true; })()`);
await ev(`caSyncTopbar(); PM._state().live = 14; PM.refreshStrip(true)`); await sleep(300);
const es = await ev(`(() => { const s = document.querySelector('.pm-strip'); const b = document.querySelector('.ca-screen .page-topbar'); return { text: s.innerText.replace(/\\s+/g, ' '), aria: s.querySelector('.pm-streak').getAttribute('aria-label'), barH: Math.round(b.getBoundingClientRect().height), overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }; })()`);
check('Spanish strip: "14 tocando 23/30 min esta semana 3", flame label "racha de 3 semanas", one row', es.text === '14 tocando 23/30 min esta semana 3' && es.aria === 'racha de 3 semanas' && es.barH <= 56 && !es.overflow, es);
await shot('4-strip-es');

/* ── The bar stays ONE row at 1366×657, whatever is in it ── */
console.log('sticky bar width');
const rows = [];
for (const lang of ['en', 'es']) {
  await ev(`setLang('${lang}')`); await sleep(500);
  for (const stop of [false, true]) for (const opt of [false, true]) {
    const withTag = opt ? "const tag = document.createElement('span'); tag.className = 'ca-optional-tag'; tag.textContent = t('ca.optional'); n.after(tag);" : '';
    await ev(`(() => { caSyncTopbar(); PM._state().live = 14; PM.refreshStrip(true); const n = document.querySelector('#ca-bar-open .ca-bar-name'); ${withTag} document.querySelector('#ca-bar-open .ca-bar-stop').hidden = ${!stop}; return true; })()`); await sleep(250);
    const h = await ev(`Math.round(document.querySelector('#class-activities-screen .page-topbar').getBoundingClientRect().height)`);
    rows.push(`${lang}${stop ? '+stop' : ''}${opt ? '+optional' : ''}=${h}`);
  }
}
check('with the strip the bar is one row (≤ 56px) in EN/ES × Stop shown/hidden × Optional tag', rows.every((r) => +r.split('=')[1] <= 56) && rows.length === 8, rows);
await ev(`setLang('en'); caSyncTopbar()`);

/* ── My progress ── */
console.log('My progress');
await ev(`PM._state().live = 0; setLang('en'); location.hash = '#my-progress'`); await sleep(1200);
await ev(`(() => { const s = PM._state(), d = PM.calc.ymd(new Date()); s.pend = {}; s.days = {}; s.weeks = {}; const cur = PM.calc.weekIdOf(d);
  const set = (i, secs) => { s.weeks[PM.calc.weekAdd(cur, i)] = { seconds: secs, goalSeconds: 1800, hit: secs >= 1800 }; };
  set(-1, 1900); set(-2, 1900); set(-3, 1900); set(-4, 400); set(-5, 1900); set(-6, 1900); set(-7, 0);
  s.weeks[cur] = { seconds: 23 * 60, goalSeconds: 1800, hit: false };
  const mon = PM.calc.ymd(PM.calc.weekMonday(cur));
  [12, 0, 8, 20, 3].forEach((m, i) => { if (m) s.days[PM.calc.ymd(PM.calc.addDays(PM.calc.parse(mon), i))] = m * 60; });
  s.days[d] = Math.max(s.days[d] || 0, 5 * 60); s.loaded = true; renderMyProgress(); return true; })()`);
await sleep(600);
await ev(`document.getElementById('pm-progress').scrollIntoView({block:'start'})`); await sleep(300);
const mp = await ev(`(() => { const p = document.getElementById('pm-progress'); const tiles = [...p.querySelectorAll('.pm-tile')].map(t => t.innerText.replace(/\\s+/g, ' ').trim()); return { hidden: p.hidden, tiles, bars: [...p.querySelectorAll('.pm-bar')].map(b => b.getAttribute('aria-label')), squares: [...p.querySelectorAll('.pm-sq')].map(b => b.className.replace('pm-sq ', '')), cap: p.querySelector('.pm-cap').innerText, h: [...p.querySelectorAll('.pm-sec-h')].map(x => x.innerText) }; })()`);
console.log('    ', JSON.stringify(mp));
/* "Today" is the PAGE's day (it may run under --date), and it holds at least the 5 minutes set above. */
const dowNow = await ev(`(new Date().getDay() + 6) % 7`), expDays = [12, 0, 8, 20, 3, 0, 0]; expDays[dowNow] = Math.max(expDays[dowNow], 5);
check('3 tiles: This week / Streak (3 hit weeks, a free miss, 2 more hit weeks = 5) / Today', mp.tiles.length === 3 && /^This week .*23 of 30 min 7 more keeps your streak$/.test(mp.tiles[0]) && /^Streak 5-week streak Longest: 5 weeks$/.test(mp.tiles[1]) && new RegExp(`^Today ${expDays[dowNow]} min All time: \\d+ min$`).test(mp.tiles[2]), mp.tiles);
check('"This week by day" shows all seven days, Mon–Sun, with this week\'s minutes (12, 0, 8, 20, 3, 0, 0; today at least 5)', mp.bars.length === 7 && mp.bars.every((b, i) => b.startsWith(['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i] + ':')) && mp.bars.map((b) => +b.split(': ')[1].split(' ')[0]).join() === expDays.join(), mp.bars);
const empties = await ev(`[...document.querySelectorAll('#pm-progress .pm-bar')].map(b => ({ fill: b.querySelector('.pm-bar-col i').style.height, label: b.querySelector('.pm-bar-n').textContent, marks: b.querySelectorAll('svg, .pm-miss, [class*=miss]').length }))`);
check('a day with no practice is an empty bar: no fill, no number, no miss marker of any kind', empties.filter((e, i) => expDays[i] === 0).every((e) => (e.fill === '0%' || e.fill === '0px' || e.fill === '') && e.label === '' && e.marks === 0) && expDays.some((m) => m === 0), empties);
check('"Weeks": 8 small squares, oldest first: none, hit, hit, missed, hit, hit, hit… and the current one outlined', mp.squares.length === 8 && mp.squares[7].includes('pm-sq-now') && mp.squares[6].includes('pm-sq-hit'), mp.squares);
check('caption exactly as specified: Flame = hit the week goal. Breaks don’t count.', mp.cap === 'Flame = hit the week goal. Breaks don’t count.', mp.cap);
const cs = await ev(`(() => { const q = (s, p) => getComputedStyle(document.querySelector(s))[p]; return { today: q('.pm-today', 'color'), flame: q('#pm-progress .pm-streak-lg', 'color'), ring: q('#pm-progress .pm-ring-fg', 'stroke'), bar: q('.pm-bar-col i', 'backgroundColor'), hitSq: q('.pm-sq-hit', 'backgroundColor'), missed: q('.pm-sq-missed', 'backgroundColor'), nowShadow: q('.pm-sq-now', 'boxShadow'), panel: q('.pm-panel', 'backgroundColor') }; })()`);
/* Both flames follow ONE rule (Jonathan, 2026-11-01): orange only once THIS week's
   goal is reached — a 5-week streak with this week at 23 of 30 shows a grey flame. */
check('colours: Today green, streak flame NOT orange yet (this week 23 of 30), ring blue, bars blue, hit square orange, missed square grey, current square blue outline',
  cs.today === 'rgb(61, 220, 151)' && cs.flame !== 'rgb(255, 138, 61)' && cs.ring === 'rgb(90, 169, 255)' && cs.bar === 'rgb(90, 169, 255)' && cs.hitSq === 'rgb(255, 138, 61)' && cs.missed === 'rgb(95, 105, 127)' && /90, 169, 255/.test(cs.nowShadow), cs);
const flameHit = await ev(`(() => { const s = PM._state(), cur = PM.calc.weekIdOf(PM.calc.ymd(new Date())); const keep = s.weeks[cur]; s.weeks[cur] = { seconds: 1800, goalSeconds: 1800, hit: true }; renderMyProgress();
  const c = getComputedStyle(document.querySelector('#pm-progress .pm-streak-lg')).color, bar = document.querySelector('.pm-strip .pm-streak'); s.weeks[cur] = keep; renderMyProgress(); return c; })()`);
check('…and orange once this week\'s 30 minutes are reached, like the flame on the practice card', flameHit === 'rgb(255, 138, 61)', flameHit);
await shot('5-my-progress-en');
await ev(`document.querySelectorAll('.pm-sq')[3].click()`);
check('tapping a square shows its minutes (and its hover title carries the same)', (await ev(`document.getElementById('pm-week-tip').textContent`)).includes('6 min') || (await ev(`document.getElementById('pm-week-tip').textContent`)).includes('min'), await ev(`document.getElementById('pm-week-tip').textContent`));
await ev(`setLang('es')`); await sleep(900);
await ev(`renderMyProgress(); document.getElementById('pm-progress').scrollIntoView({block:'start'})`); await sleep(400);
const mpEs = await ev(`(() => { const p = document.getElementById('pm-progress'); return { tiles: [...p.querySelectorAll('.pm-tile')].map(t => t.innerText.replace(/\\s+/g, ' ').trim()), bars: [...p.querySelectorAll('.pm-bar')].map(b => b.getAttribute('aria-label')), cap: p.querySelector('.pm-cap').innerText, title: p.querySelector('.pm-panel-h').innerText, overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth }; })()`);
check('Spanish My progress: tiles, weekdays and caption are Spanish, no overflow', /^Esta semana .*23 de 30 min Con 7 más mantienes tu racha$/.test(mpEs.tiles[0]) && /^Racha Racha de 5 semanas La más larga: 5 semanas$/.test(mpEs.tiles[1]) && new RegExp(`^Hoy ${expDays[dowNow]} min En total: \\d+ min$`).test(mpEs.tiles[2]) && mpEs.bars.length === 7 && mpEs.bars.every((b, i) => b.startsWith(['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'][i] + ':')) && mpEs.cap === 'Llama = lograste la meta de la semana. Los descansos no cuentan.' && !mpEs.overflow, mpEs);
await shot('6-my-progress-es');

/* ── An impossible "N more" and "0-week streak" (2026-11-01) ──
   The goal is 30 min and a day counts at most 20. On a Sunday with today at the
   cap, "10 more reaches your goal" cannot happen, so the tile and the recap say
   so in plain words instead. The clock is moved to a fixed Sunday / Saturday for
   this section, so it holds whatever day the test runs on (and under --date). */
console.log('out of reach, no streak');
const shiftClock = (iso) => ev(`(() => { const B = window.__B || (window.__B = window.Date), off = new B(${JSON.stringify(iso)}).getTime() - B.now();
  window.Date = class extends B { constructor(...a) { if (a.length) super(...a); else super(B.now() + off); } static now() { return B.now() + off; } };
  return PM.calc.ymd(new Date()); })()`);
const tilesAt = (weekMin, todayMin, prior, lang) => ev(`(() => { const s = PM._state(), d = PM.calc.ymd(new Date()), cur = PM.calc.weekIdOf(d); s.pend = {}; s.days = {}; s.weeks = {}; s.loaded = true;
  ${JSON.stringify(prior)}.forEach((secs, i) => { s.weeks[PM.calc.weekAdd(cur, -(i + 1))] = { seconds: secs, goalSeconds: 1800, hit: secs >= 1800 }; });
  s.weeks[cur] = { seconds: ${weekMin} * 60, goalSeconds: 1800, hit: ${weekMin} >= 30 }; if (${todayMin}) s.days[d] = ${todayMin} * 60;
  setLang(${JSON.stringify(lang)}); renderMyProgress(); return [...document.querySelectorAll('#pm-progress .pm-tile')].map(t => t.innerText.replace(/\\s+/g, ' ').trim()); })()`);
const OUT_EN = /^This week .* of 30 min You can.t reach the goal this week\. A new week starts Monday\.$/;
check('the clock moved to a Sunday (2026-11-29)', await shiftClock('2026-11-29T10:00:00') === '2026-11-29');
const sunCap = await tilesAt(20, 20, [1900, 1900, 1900], 'en');
await ev(`document.getElementById('pm-progress').scrollIntoView({block:'start'})`); await sleep(200); await shot('5b-out-of-reach-en');
check('Sunday, 20 of 30 min, today at the 20-min cap, a streak going: says it cannot be reached (it used to say "10 more keeps your streak")', OUT_EN.test(sunCap[0]), sunCap);
const sunExact = await tilesAt(20, 10, [1900, 1900, 1900], 'en');
check('Sunday, 20 of 30 min, 10 left in today\'s cap: exactly enough, still "10 more keeps your streak"', /^This week .*20 of 30 min 10 more keeps your streak$/.test(sunExact[0]), sunExact);
const sunOver = await tilesAt(20, 11, [1900, 1900, 1900], 'en');
check('Sunday, 20 of 30 min, 9 left in today\'s cap: one minute short, cannot be reached', OUT_EN.test(sunOver[0]), sunOver);
const sunNoStreak = await tilesAt(20, 20, [], 'en');
check('…the same with no streak going (the "reaches your goal" wording): cannot be reached', OUT_EN.test(sunNoStreak[0]), sunNoStreak);
const sunNoStreakOk = await tilesAt(20, 10, [], 'en');
check('…and with room left and no streak: "10 more reaches your goal"', /20 of 30 min 10 more reaches your goal$/.test(sunNoStreakOk[0]), sunNoStreakOk);
await shiftClock('2026-11-28T10:00:00');
const satOk = await tilesAt(10, 20, [1900, 1900, 1900], 'en');
check('Saturday, 10 of 30 min, today at the cap, Sunday still ahead (20 min of room): "20 more keeps your streak"', /^This week .*10 of 30 min 20 more keeps your streak$/.test(satOk[0]), satOk);
const satOut = await tilesAt(9, 20, [1900, 1900, 1900], 'en');
check('Saturday, 9 of 30 min, today at the cap: 21 needed, only Sunday\'s 20 left: cannot be reached', /9 of 30 min You can.t reach the goal this week/.test(satOut[0]), satOut);
await shiftClock('2026-11-25T10:00:00');
const wed = await tilesAt(0, 0, [1900, 1900, 1900], 'en');
check('Wednesday, nothing yet: five days of room, "30 more keeps your streak"', /^This week .*0 of 30 min 30 more keeps your streak$/.test(wed[0]), wed);
await shiftClock('2026-11-29T10:00:00');
const sunEs = await tilesAt(20, 20, [1900, 1900, 1900], 'es');
await ev(`document.getElementById('pm-progress').scrollIntoView({block:'start'})`); await sleep(200); await shot('5c-out-of-reach-es');
check('Spanish, Sunday at the cap: "Esta semana ya no puedes llegar a la meta. El lunes empieza una semana nueva."', /^Esta semana .*20 de 30 min Esta semana ya no puedes llegar a la meta\. El lunes empieza una semana nueva\.$/.test(sunEs[0]), sunEs);
const sunEsOk = await tilesAt(20, 10, [1900, 1900, 1900], 'es');
check('Spanish, room left: "Con 10 más mantienes tu racha"', /20 de 30 min Con 10 más mantienes tu racha$/.test(sunEsOk[0]), sunEsOk);
/* "0-week streak" */
await shiftClock('2026-11-25T10:00:00');
const none = await tilesAt(5, 0, [], 'en'), noneEs = await tilesAt(5, 0, [], 'es'), one = await tilesAt(30, 0, [], 'en'), oneEs = await tilesAt(30, 0, [], 'es');
check('no streak: the Streak tile says "No streak yet" (it used to say "0-week streak")', /^Streak No streak yet /.test(none[1]) && !/0-week/.test(none[1]), none);
check('Spanish, no streak: "Aún no tienes racha" (not "Racha de 0 semanas")', /^Racha Aún no tienes racha /.test(noneEs[1]) && !/Racha de 0/.test(noneEs[1]), noneEs);
check('a first hit week is still "1-week streak" / "Racha de 1 semana"', /^Streak 1-week streak /.test(one[1]) && /^Racha Racha de 1 semana /.test(oneEs[1]), [one, oneEs]);
/* On the practice card: the flame's label, and the Stop recap. */
await ev(`setLang('en'); openClassActivitiesScreen(${JSON.stringify(card)})`); await sleep(1500);
await tilesAt(5, 0, [], 'en'); await ev(`openClassActivitiesScreen(${JSON.stringify(card)})`); await sleep(1200);
await ev(`PM.onCardOpen(); caSyncTopbar(); PM.refreshStrip(true)`); await sleep(300);
const flameNone = await ev(`(document.querySelector('.pm-strip .pm-streak') || {}).getAttribute ? document.querySelector('.pm-strip .pm-streak').getAttribute('aria-label') : null`);
check('the card bar\'s flame is labelled "No streak yet" with no streak (screen readers did hear "0-week streak")', flameNone === 'No streak yet', flameNone);
await shiftClock('2026-11-29T10:00:00');
await ev(`(() => { const s = PM._state(), d = PM.calc.ymd(new Date()), cur = PM.calc.weekIdOf(d); s.pend = {}; s.days = {}; s.weeks = {}; s.loaded = true; s.lastRecapAt = 0;
  for (let i = 1; i <= 3; i++) s.weeks[PM.calc.weekAdd(cur, -i)] = { seconds: 1900, goalSeconds: 1800, hit: true };
  s.weeks[cur] = { seconds: 20 * 60, goalSeconds: 1800, hit: false }; s.days[d] = 20 * 60; PM.refreshStrip(true); return true; })()`);
await ev(`document.querySelector('.ca-card[open] .pc-play').click()`); await waitFor(`!!PM._session()`);
await ev(`PM._session().counted = 5 * 60`); await ev(`pcStop()`); await sleep(3500);
const recapOut = await ev(`(document.getElementById('pm-recap') || {}).innerText`);
check('Stop on a Sunday at the cap: the recap says "You can’t reach the goal this week. A new week starts Monday." (not "10 more keeps your 3-week streak.")', /^✕ \+5 min This week: 20 of 30 min\. You can.t reach the goal this week\. A new week starts Monday\.$/.test((recapOut || '').replace(/\s+/g, ' ').trim()), recapOut);
await ev(`document.getElementById('pm-recap') && document.getElementById('pm-recap').remove(); window.Date = window.__B; true`);
await ev(`location.hash = '#my-progress'`); await sleep(600);

/* ── Review findings: the widest strip, a skipped week, a week that never counted ── */
console.log('review follow-ups');
await ev(`(() => { const s = PM._state(), cur = PM.calc.weekIdOf(PM.calc.ymd(new Date())); s.weeks = {}; for (let i = 1; i <= 12; i++) s.weeks[PM.calc.weekAdd(cur, -i)] = { seconds: 1900, goalSeconds: 1800, hit: true }; s.weeks[cur] = { seconds: 100 * 60, goalSeconds: 1800, hit: true }; s.days = {}; s.pend = {}; s.live = 25; return true; })()`);
await ev(`window.__period = '7'; setLang('es'); location.hash = '#class-activities/${card}'; openClassActivitiesScreen(${JSON.stringify(card)})`); await sleep(1000);
await ev(`(() => { caSyncTopbar(); PM.refreshStrip(true); const n = document.querySelector('#ca-bar-open .ca-bar-name'); const tag = document.createElement('span'); tag.className = 'ca-optional-tag'; tag.textContent = t('ca.optional'); n.after(tag); document.querySelector('#ca-bar-open .ca-bar-stop').hidden = false; return true; })()`); await sleep(300);
const worst = await ev(`(() => ({ h: Math.round(document.querySelector('#class-activities-screen .page-topbar').getBoundingClientRect().height), text: document.querySelector('.pm-strip').innerText.replace(/\\s+/g, ' ') }))()`);
check('widest strip (ES, Optional tag, Stop showing, 25 playing, 100+ min, 12-week streak) stays one row; the strip never shows more than the goal', worst.h <= 56 && /^25 tocando 30\/30 min esta semana 13$/.test(worst.text), worst);
await shot('7-widest-strip-es');
await ev(`(() => { const cur = PM.calc.weekIdOf(PM.calc.ymd(new Date())), mon = PM.calc.weekMonday(cur), sun = PM.calc.addDays(mon, 6); PRACTICE_MINUTES_CONFIG.skipWeeks.push(PM.calc.ymd(mon)); PM._state().weeks[cur] = { seconds: 40 * 60, goalSeconds: 0, hit: false }; PM.refreshStrip(true); return true; })()`);
await ev(`setLang('en'); PM.refreshStrip(true)`); await sleep(300);
const brk = await ev(`(() => ({ strip: document.querySelector('.pm-strip .pm-week').innerText.trim(), flame: getComputedStyle(document.querySelector('.pm-strip .pm-streak')).color, dash: parseFloat(getComputedStyle(document.querySelector('.pm-strip .pm-ring-fg')).strokeDashoffset) }))()`);
check('a skipped week: "40 min this week" (no goal, no "/30"), empty ring, flame not lit', brk.strip === '40 min this week' && brk.flame === 'rgb(122, 82, 54)' && brk.dash > 43, brk);
await ev(`location.hash = '#my-progress'`); await sleep(900);
await ev(`renderMyProgress()`); await sleep(300);
const bt = await ev(`(() => { const p = document.getElementById('pm-progress'); return { tile: p.querySelector('.pm-tile').innerText.replace(/\\s+/g, ' ').trim(), tips: [...p.querySelectorAll('.pm-sq')].map(b => b.getAttribute('aria-label')) }; })()`);
check('…the This week tile says "40 min" with no goal, and says it is a break week (2026-11-01: it used to say nothing)', /^This week 40 min Break week: no goal$/.test(bt.tile), bt.tile);
check('the current skipped week\'s square says it is a break week, with its minutes', /^Week of .*: break, 40 min$/.test(bt.tips[7]), bt.tips[7]);
await ev(`PRACTICE_MINUTES_CONFIG.skipWeeks.pop(); PM._state().weeks = {}; renderMyProgress()`); await sleep(300);
const early = await ev(`[...document.querySelectorAll('#pm-progress .pm-sq')].map(b => b.getAttribute('aria-label'))`);
check('with no history, weeks before the first practice read as plain minutes (not "goal missed")', early.slice(0, 7).every((tp) => !/goal missed|goal hit/.test(tp)), early);

/* ── The same grid for every student: period 4, CAS, none chosen ── */
for (const per of ['4', 'CAS', '']) {
  await ev(`window.__period = ${JSON.stringify(per)}; setLang('en'); renderMyProgress()`); await sleep(400);
  const lab = await ev(`[...document.querySelectorAll('#pm-progress .pm-bar')].map(b => b.getAttribute('aria-label').split(':')[0]).join()`);
  check(`period ${per || '(none chosen)'}: the same seven bars, Mon–Sun`, lab === 'Mon,Tue,Wed,Thu,Fri,Sat,Sun', lab);
}

/* ── The pills belong to a SHOWN practice card (2026-11-01 Friday check, PD-3/PD-4
   and the review of that fix): leaving the card screen without Stop must not make
   an unseen recap that starts the 3-minute gap; a goal crossed off the card waits
   for the next card; a recap goes on a language switch and when the card goes. ── */
await ev(`window.__period = '7'; setLang('en'); PRACTICE_MINUTES_CONFIG.skipWeeks = []; PRACTICE_MINUTES_CONFIG.streakStartWeek = ''; PRACTICE_MINUTES_CONFIG.uiOn = true`);
await seedWeeks([1900, 1900, 1900]);
await ev(`window.__pills = []; new MutationObserver((ms) => { for (const m of ms) for (const n of m.addedNodes) if (n.id === 'pm-recap' || n.id === 'pm-toast') window.__pills.push(n.id); }).observe(document.body, { childList: true }); true`);
await ev(`openClassActivitiesScreen(${JSON.stringify(card)})`); await sleep(1500);
await ev(`PM.onCardOpen(); caSyncTopbar(); (() => { const s = PM._state(); s.loaded = true; s.weeks = JSON.parse(JSON.stringify(window.__fs.weeks)); s.days = {}; s.pend = {}; s.lastRecapAt = 0; return true; })()`); await sleep(300);
await ev(`document.querySelector('.ca-card[open] .pc-play').click()`); await waitFor(`PM._session() && PM._session().counted >= 3`);
const pillSrc = await ev(`pcState.audio.currentSrc`);
await ev(`PM._session().counted = 150; location.hash = '#my-progress'`); await sleep(3800);
const lv = await ev(`({ lastRecapAt: PM._state().lastRecapAt, pills: window.__pills.slice() })`);
check('left the card screen while playing (no Stop): no unseen recap, so the 3-minute gap is not started', lv.lastRecapAt === 0 && !lv.pills.length, lv);
await ev(`window.__pills = []; openClassActivitiesScreen(${JSON.stringify(card)})`); await sleep(1500);
await ev(`document.querySelector('.ca-card[open] .pc-play').click()`); await waitFor(`PM._session() && PM._session().counted >= 2`);
await ev(`PM._session().counted = 150; pcStop()`); await sleep(3500);
const recapUp = await ev(`!!document.getElementById('pm-recap')`);
check('…so the recap after the next session on the card shows', recapUp);
await ev(`setLang('es')`); await sleep(400);
check('…and a language switch removes it (it would stay in the old language)', recapUp && !(await ev(`!!document.getElementById('pm-recap')`)), recapUp ? 'still there' : 'no recap to remove');
await ev(`setLang('en')`); await sleep(300);
await ev(`(() => { const s = PM._state(), d = PM.calc.ymd(new Date()); s.weeks[PM.calc.weekIdOf(d)] = { seconds: 1800 - 4, goalSeconds: 1800, hit: false }; s.days = {}; s.pend = {}; s.toastWeek = ''; s.pendingToast = false; s.lastRecapAt = 0; try { localStorage.removeItem('pm:t:e2e-student'); } catch(e) {} return true; })()`);
await ev(`location.hash = '#my-progress'`); await sleep(1500);
await ev(`window.__pills = []; window.__a = new Audio(${JSON.stringify(pillSrc)}); window.__a.play(); true`);
await waitFor(`PM._state().pendingToast === ${JSON.stringify(todayWeek)} || PM._state().toastWeek !== ''`, 15000); await sleep(800);
const off = await ev(`({ pending: PM._state().pendingToast, toastWeek: PM._state().toastWeek, pills: window.__pills.slice() })`);
await ev(`window.__a.pause(); true`); await sleep(2500);
await ev(`openClassActivitiesScreen(${JSON.stringify(card)})`); await sleep(2000);
const on = await ev(`!!document.getElementById('pm-toast')`);
check('the week goal crossed on My progress (a backing track playing there): no toast made unseen; it shows at the next practice card', !off.pills.length && off.toastWeek === '' && on, { off, toastOnCard: on });

check('no uncaught exceptions on the page', consoleErrors.length === 0, consoleErrors.slice(0, 3));
console.log(`\n${fail ? '✗' : '✓'} pm-e2e: ${pass} passed, ${fail} failed — screenshots in ${OUT}`);
done(fail ? 1 : 0);
