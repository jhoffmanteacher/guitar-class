#!/usr/bin/env node
/* sw-upgrade-proof.mjs — what a returning student's browser gets on the night app.js, coach.js and
   teacher.js are cut into part files (todo.md, "The shape of the rebuild" → "Risks with no test yet").

   Zero dependencies, Node 18+, Windows and macOS. No browser. It writes nothing outside the temp folder.

     node tools/sw-upgrade-proof.mjs --old <old site folder> --new <new site folder>
     node tools/sw-upgrade-proof.mjs            builds both itself in a temp folder (slow: about 4 minutes):
                                                old = `git archive HEAD` (without audio/), new = the same tree
                                                after `node tools/split-site.mjs --write --in-place` and then
                                                `node tools/checks.mjs --skip-links` IN THAT COPY, which writes
                                                the new CACHE_VERSION into the copy's sw.js
     --trace      print every request each scenario's pages made (who answered, with which bytes)
     --strict     a FINDING (⚠, below) also makes the exit code 1
     --keep       with no --old/--new: leave the temp folder in place and print its path
     --break <n>  the break-it proofs: run with fault n planted in a COPY of the new sw.js (or in the fake
                  server) and expect ✗ lines. `--break list` names them; `--break all` runs each one and
                  fails unless every one turns the tool red.

   Each folder holds sw.js, index.html and the scripts. The two service workers are the REAL files, each run
   in its own Node vm (the approach of tools/sw-audio-proof.mjs) against ONE shared fake Cache Storage and a
   fake network that serves a site folder: the old folder while the old cache is being filled, then ONLY the
   new folder (after a deploy the server has no app.js any more, and coach.js / teacher.js are first parts).

   A "page" here is what a real page is to the upgrade: the bytes of index.html it was given, the scripts that
   index.html names, and the two lazy lists (COACH_JS_PARTS, TEACHER_JS_PARTS) read out of the app code THAT
   PAGE received. So an old page asks for app.js and one coach.js; a new page asks for app/*.js and seven
   coach files. A page is
     OLD     every byte is the old site's, and each script put together is the old script;
     NEW     the same for the new site;
     MIXED   bytes of both, or a lazy script whose pieces put together are not that script (the whole old
             coach.js with new parts loaded on top of it, or only the first part of it);
     BROKEN  a script it needs did not load.

   What the real code does (read from sw.js, pinned by scenario 0 below):
     - the fetch handler is stale-while-revalidate for same-origin GETs: a cache hit is served from the cache
       AND refetched, and the 200 answer is stored over the cached copy; a miss goes to the network
       (cache:'no-cache') and is stored;
     - each worker reads and writes only the cache named by its own CACHE_VERSION;
     - activate deletes every cache except its own CACHE_VERSION and the two audio caches, so the old shell
       cache is DELETED, not reused; the new cache then holds only PRECACHE_CRITICAL until the page asks for
       the rest (gc-precache-rest) or uses a file;
     - install is cache.addAll(PRECACHE_CRITICAL): all or nothing.

   ✓ / ✗ are assertions. ⚠ FINDING is something the real upgrade does that is not a clean OLD or NEW page;
   the tool reports it and stays green unless --strict, so that the finding stays visible until it is fixed
   (when it stops happening the line turns into a plain ✓).

   Not modelled: the browser's HTTP cache (GitHub Pages max-age=600; the worker's own cache:'reload' /
   'no-cache' are recorded but every request reaches the fake server), timing inside one event-loop turn,
   more than one open tab, audio (tools/sw-audio-proof.mjs), and what the scripts DO when they run: "the
   whole old coach.js plus new parts" is reported from the bytes, not by executing them. */
import { readFileSync, writeFileSync, existsSync, mkdtempSync, mkdirSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const TRACE = args.includes('--trace'), STRICT = args.includes('--strict');
const BASE = 'https://class.test/guitar-class/';
const BASE_PATH = new URL(BASE).pathname;
const relOf = u => { const url = new URL(typeof u === 'string' ? u : u.url, BASE); return decodeURIComponent(url.pathname.slice(BASE_PATH.length)) + url.search; };

/* ── the two site folders ──────────────────────────────────────────────── */
let OLD = opt('--old'), NEW = opt('--new'), builtIn = null;
if (!OLD !== !NEW) { console.error('sw-upgrade-proof: give both --old and --new, or neither'); process.exit(2); }
if (!OLD) {
  builtIn = mkdtempSync(join(tmpdir(), 'gc-sw-upgrade-'));
  const run = (cmd, a, o = {}) => spawnSync(cmd, a, { encoding: 'utf8', maxBuffer: 1 << 28, ...o });
  const tarFile = join(builtIn, 'head.tar');
  const ar = run('git', ['archive', '--format=tar', '-o', tarFile, 'HEAD'], { cwd: ROOT });
  if (ar.status !== 0) { console.error('sw-upgrade-proof: ✗ git archive failed: ' + ar.stderr); process.exit(2); }
  for (const d of ['old', 'new']) {
    mkdirSync(join(builtIn, d));
    const x = run('tar', ['-xf', tarFile, '-C', join(builtIn, d), '--exclude=audio']);
    if (x.status !== 0) { console.error('sw-upgrade-proof: ✗ tar failed: ' + x.stderr); process.exit(2); }
  }
  OLD = join(builtIn, 'old'); NEW = join(builtIn, 'new');
  const cut = run(process.execPath, ['tools/split-site.mjs', '--write', '--in-place'], { cwd: NEW });
  if (cut.status !== 0) { console.error('sw-upgrade-proof: ✗ split-site failed in the copy:\n' + cut.stdout + cut.stderr); process.exit(2); }
  /* Its exit code is not read: the copy has no audio/, and all this needs from it is the new CACHE_VERSION line. */
  run(process.execPath, ['tools/checks.mjs', '--skip-links'], { cwd: NEW });
  if (args.includes('--keep')) console.log('sw-upgrade-proof: built ' + builtIn);
}
OLD = resolve(OLD); NEW = resolve(NEW);
const fileOf = (root, rel) => { const f = join(root, ...rel.split('/')); return existsSync(f) ? readFileSync(f) : null; };
for (const [n, d] of [['--old', OLD], ['--new', NEW]]) for (const f of ['sw.js', 'index.html']) if (!fileOf(d, f)) { console.error(`sw-upgrade-proof: ${n} ${d} has no ${f}`); process.exit(2); }
const swText = root => readFileSync(join(root, 'sw.js'), 'utf8').replace(/\r\n/g, '\n');

/* ── what a site folder says a page loads ──────────────────────────────── */
const scriptsOf = html => [...String(html).matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g)].map(m => m[1]).filter(s => !/^(https?:)?\/\//.test(s));
const partsIn = (code, arr) => { const m = new RegExp('^const ' + arr + ' = \\[([^\\]]*)\\];', 'm').exec(code); return m ? [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : null; };
function describe(root) {
  const html = fileOf(root, 'index.html').toString('utf8');
  const scripts = scriptsOf(html);
  const code = scripts.map(s => (fileOf(root, s) || '').toString('utf8')).join('');
  const coach = partsIn(code, 'COACH_JS_PARTS') || ['coach.js'], teacher = partsIn(code, 'TEACHER_JS_PARTS') || ['teacher.js'];
  const whole = list => Buffer.concat(list.map(f => fileOf(root, f) || Buffer.alloc(0)));
  return { root, html, scripts, coach, teacher, whole: { coach: whole(coach), teacher: whole(teacher) } };
}
const SITE = { old: describe(OLD), new: describe(NEW) };
const lines = b => b.toString('utf8').split('\n').length - 1;
/* Which site a file's bytes belong to. */
function label(rel, body) {
  const p = (rel.split('?')[0]) || 'index.html';
  const o = fileOf(OLD, p), n = fileOf(NEW, p);
  const isO = !!o && o.equals(body), isN = !!n && n.equals(body);
  return isO && isN ? 'same' : isO ? 'OLD' : isN ? 'NEW' : 'other';
}

/* ── stand-ins for the browser ─────────────────────────────────────────── */
class FakeResponse {
  constructor(body, init = {}) {
    this.body = Buffer.isBuffer(body) ? body : Buffer.from(body == null ? '' : String(body));
    this.status = init.status == null ? 200 : init.status;
    this.type = init.type || 'default';
    this.ok = this.status >= 200 && this.status < 300;
  }
  clone() { return new FakeResponse(this.body, { status: this.status, type: this.type }); }
  async text() { return this.body.toString('utf8'); }
  static error() { return new FakeResponse('', { status: 0, type: 'error' }); }
}
class FakeRequest {
  constructor(input, init = {}) {
    this.url = new URL(typeof input === 'string' ? input : input.url, BASE).href;
    this.method = init.method || 'GET';
    this.mode = init.mode || 'no-cors';
    this.cache = init.cache || 'default';
    const h = new Map(Object.entries(init.headers || {}).map(([k, v]) => [k.toLowerCase(), v]));
    this.headers = { has: k => h.has(String(k).toLowerCase()) };
  }
}
/* The server and the wire. `root` is the folder being served; `down(rel)` true = that request fails as a
   dropped connection does (fetch rejects). */
class Net {
  constructor(root) { this.root = root; this.down = () => false; this.log = []; }
  async fetch(req, init = {}, who = 'page') {
    const rel = relOf(req), cache = init.cache || (typeof req !== 'string' && req.cache) || 'default';
    await new Promise(r => setImmediate(r));
    if (this.down(rel)) { this.log.push({ who, rel, cache, status: 'FAILED' }); throw new TypeError('Failed to fetch'); }
    const body = fileOf(this.root, (rel.split('?')[0]) || 'index.html');
    this.log.push({ who, rel, cache, status: body ? 200 : 404 });
    return body ? new FakeResponse(body, { status: 200, type: 'basic' }) : new FakeResponse('Not found', { status: 404, type: 'basic' });
  }
}
const keyOf = r => new URL(typeof r === 'string' ? r : r.url, BASE).href;
class FakeCache {
  constructor(net, who) { this.m = new Map(); this.net = net; this.who = who; }
  async match(r) { const e = this.m.get(keyOf(r)); return e ? e.clone() : undefined; }
  async put(r, res) { this.m.set(keyOf(r), res.clone()); }
  async delete(r) { return this.m.delete(keyOf(r)); }
  async keys() { return [...this.m.keys()].map(u => new FakeRequest(u)); }
  /* Like the real one: fetch it, and anything but a 2xx rejects. */
  async add(r) {
    const req = typeof r === 'string' ? new FakeRequest(r) : r;
    const res = await this.net.fetch(req, { cache: req.cache }, 'install:' + this.who);
    if (!res.ok) throw new TypeError('Request failed: ' + relOf(req) + ' ' + res.status);
    this.m.set(keyOf(req), res);
  }
  /* All or nothing, like the real one: one failure stores none of them. */
  async addAll(rs) {
    const got = await Promise.all(rs.map(async r => { const req = typeof r === 'string' ? new FakeRequest(r) : r; const res = await this.net.fetch(req, { cache: req.cache }, 'install:' + this.who); if (!res.ok) throw new TypeError('Request failed: ' + relOf(req) + ' ' + res.status); return [keyOf(req), res]; }));
    for (const [k, res] of got) this.m.set(k, res);
  }
  has(r) { return this.m.has(keyOf(r)); }
}
class FakeStorage {
  constructor(net) { this.c = new Map(); this.net = net; }
  async open(name) { if (!this.c.has(name)) this.c.set(name, new FakeCache(this.net, name)); return this.c.get(name); }
  async keys() { return [...this.c.keys()]; }
  async delete(name) { return this.c.delete(name); }
}

/* ── one service worker (a real sw.js in a vm) ─────────────────────────── */
function boot(src, browser, name) {
  const handlers = {};
  const self = {
    location: new URL('sw.js', BASE), addEventListener: (t, f) => { handlers[t] = f; }, registration: browser.registration,
    skipWaiting: async () => { w.skipped = true; },
    clients: { claim: async () => { w.claimed = true; }, matchAll: async () => browser.pages.map(p => ({ postMessage: m => p.messages.push(m) })) },
  };
  const fetchStub = (req, init = {}) => browser.net.fetch(req, init, 'sw:' + name);
  const ctx = vm.createContext({ self, caches: browser.storage, fetch: fetchStub, Response: FakeResponse, Request: FakeRequest, URL, Promise, console, decodeURIComponent });
  vm.runInContext(src, ctx, { filename: name + '/sw.js' });
  const w = {
    name, skipped: false, claimed: false,
    read: expr => vm.runInContext(expr, ctx),
    async run(type, ev = {}) { const ps = []; handlers[type]({ ...ev, waitUntil: p => ps.push(p) }); await Promise.all(ps); },
    /* One request through the fetch handler. Unhandled (cross-origin, or the handler returned) = the network. */
    async get(rel, { mode = 'no-cors' } = {}) {
      const ps = []; let answered = null;
      const req = new FakeRequest(rel, { mode });
      handlers.fetch({ request: req, respondWith: p => { answered = p; }, waitUntil: p => ps.push(p) });
      let res;
      try { res = answered ? await answered : await browser.net.fetch(req, {}, 'page'); } catch { res = FakeResponse.error(); }
      await Promise.all(ps.map(p => Promise.resolve(p).catch(() => {})));
      return res;
    },
  };
  w.version = w.read('CACHE_VERSION');
  return w;
}

/* ── the browser: one registration, one cache storage, the open pages ─── */
class Browser {
  constructor(root) { this.net = new Net(root); this.storage = new FakeStorage(this.net); this.registration = {}; this.pages = []; this.controller = null; this.trace = []; }
  /* A new sw.js arrives (the update check a navigation starts, or the first register()). Returns whether it
     took over. An install that fails leaves everything as it was, as the browser does. */
  async update(src, name) {
    const w = boot(src, this, name);
    this.registration.installing = w;
    const n0 = this.net.log.length;
    let err = null;
    try { await w.run('install'); } catch (e) { err = e; }
    this.registration.installing = null;
    const requests = this.net.log.slice(n0).filter(l => l.who.startsWith('install:'));
    if (err) { this.trace.push(`  [${name} worker] install FAILED (${err.message}); the ${this.controller ? this.controller.name : 'no'} worker stays`); return { ok: false, w, requests, error: err }; }
    if (!w.skipped) { this.registration.waiting = w; return { ok: false, w, requests, waiting: true }; }
    await w.run('activate');
    this.registration.waiting = null;
    this.controller = w;
    this.trace.push(`  [${name} worker] installed (${requests.length} requests), activated, claimed; caches now: ${[...this.storage.c.keys()].join(', ')}`);
    return { ok: true, w, requests };
  }
  async get(rel, o) {
    const w = this.controller, cacheName = w ? w.version : null;
    const had = !!(w && this.storage.c.get(cacheName) && this.storage.c.get(cacheName).has(rel || './'));
    let res;
    if (w) res = await w.get(rel || './', o); else { try { res = await this.net.fetch(rel || './', {}, 'page'); } catch { res = FakeResponse.error(); } }
    const ok = res.status === 200;
    const line = { rel: rel || './', by: w ? w.name + ' worker' : 'no worker', from: w ? (had ? 'its cache' : 'network') : 'network', status: res.status, label: ok ? label(rel, res.body) : '-', lines: ok ? lines(res.body) : 0, body: res.body, ok };
    this.trace.push(`  GET ${line.rel.padEnd(26)} ← ${line.by}, ${line.from}: ${ok ? line.label + ' bytes (' + line.lines + ' lines)' : (res.status ? 'HTTP ' + res.status : 'network error')}`);
    return line;
  }
  /* Open the site: the navigation, then every script its index.html names. */
  async open({ teacher = false } = {}) {
    const page = { messages: [], got: [], lazy: {}, browser: this };
    const nav = await this.get(teacher ? '?teacher=true' : '', { mode: 'navigate' });
    page.nav = nav; page.loadedBy = this.controller;
    if (!nav.ok) { page.dead = true; return page; }
    page.scripts = scriptsOf(nav.body.toString('utf8'));
    for (const s of page.scripts) page.got.push(await this.get(s));
    const code = page.got.map(g => g.ok ? g.body.toString('utf8') : '').join('');
    page.lists = { coach: partsIn(code, 'COACH_JS_PARTS') || ['coach.js'], teacher: partsIn(code, 'TEACHER_JS_PARTS') || ['teacher.js'] };
    this.pages.push(page);
    return page;
  }
  /* loadScriptsInOrder(): one after another, and a failed file stops the chain. */
  async lazy(page, which) {
    const out = [];
    for (const f of page.lists[which]) { const g = await this.get(f); out.push(g); if (!g.ok) break; }
    page.lazy[which] = out;
    return out;
  }
  close(page) { this.pages = this.pages.filter(p => p !== page); }
  takeTrace() { const t = this.trace; this.trace = []; return t; }
}
/* OLD / NEW / MIXED / BROKEN, with the reason. */
function verdict(page) {
  if (page.dead) return { v: 'BROKEN', why: 'the navigation itself failed' };
  const all = [page.nav, ...page.got, ...Object.values(page.lazy).flat()];
  const failed = all.filter(g => !g.ok);
  const labels = new Set(all.filter(g => g.ok).map(g => g.label));
  const side = labels.has('other') ? 'other' : labels.has('OLD') && labels.has('NEW') ? 'both' : labels.has('OLD') ? 'OLD' : labels.has('NEW') ? 'NEW' : 'same';
  const why = [];
  if (failed.length) why.push('did not load: ' + failed.map(g => g.rel).join(', '));
  if (side === 'both') why.push('old bytes (' + all.filter(g => g.label === 'OLD').map(g => g.rel).join(', ') + ') with new bytes (' + all.filter(g => g.label === 'NEW').map(g => g.rel).slice(0, 4).join(', ') + '…)');
  if (side === 'other') why.push('bytes of neither site: ' + all.filter(g => g.label === 'other').map(g => g.rel).join(', '));
  for (const [which, got] of Object.entries(page.lazy)) {
    if (got.some(g => !g.ok)) continue;
    const body = Buffer.concat(got.map(g => g.body));
    if (!body.equals(SITE.old.whole[which]) && !body.equals(SITE.new.whole[which])) why.push(`${which}: ${got.map(g => `${g.rel} (${g.label}, ${g.lines} lines)`).join(' + ')} is not the ${which} script (${lines(SITE.new.whole[which])} lines): ${lines(body)} lines`);
  }
  if (failed.length) return { v: 'BROKEN', why: why.join('; ') };
  if (why.length) return { v: 'MIXED', why: why.join('; ') };
  return { v: side === 'same' ? 'NEW' : side, why: '' };
}

/* ── the report ────────────────────────────────────────────────────────── */
let scenarios = 0, assertions = 0, failures = 0, findings = 0;
const out = [];
const say = s => out.push(s);
function scenario(title) { scenarios++; say(`\n── ${title}`); }
function check(cond, what, detail = '') { assertions++; if (cond) say(`  ✓ ${what}`); else { failures++; say(`  ✗ ${what}${detail ? ' — ' + detail : ''}`); } return !!cond; }
/* Holds when `clean` is true; when it is not, it is the finding `what` describes. */
function finding(clean, cleanText, what, trace = []) { assertions++; if (clean) { say(`  ✓ ${cleanText}`); return; } findings++; say(`  ⚠ FINDING: ${what}`); for (const t of trace) say('    ' + t); }
const showTrace = (b, always = false) => { const t = b.takeTrace(); if (TRACE || always) for (const l of t) say('  ' + l); return t; };
const sameBytes = (g, root) => { const f = fileOf(root, (g.rel.split('?')[0]).replace(/^\.\/$/, '') || 'index.html'); return g.ok && !!f && f.equals(g.body); };

/* ── the planted faults (break-it proofs) ──────────────────────────────── */
const BREAKS = {
  'reuse-old-cache': { what: 'the new worker keeps the old shell cache and reads it (CACHE_VERSION not changed by the deploy)', sw: (s, oldV) => s.replace(/const CACHE_VERSION = '[^']*';/, `const CACHE_VERSION = '${oldV}';`) },
  'no-delete': { what: 'activate no longer deletes the old shell cache', sw: s => s.replace('keys.filter(k => k !== CACHE_VERSION && k !== AUDIO_CACHE && k !== AUDIO_HASH_CACHE)', 'keys.filter(k => false)') },
  'part-not-critical': { what: 'one app part is left out of PRECACHE_CRITICAL', sw: s => { const a = s.indexOf('const PRECACHE_CRITICAL = ['), b = s.indexOf('\n];', a); const part = SITE.new.scripts.find(x => x.startsWith('app/')) || SITE.new.scripts[SITE.new.scripts.length - 1]; return s.slice(0, a) + s.slice(a, b).replace(`  './${part}',\n`, '') + s.slice(b); } },
  'install-not-atomic': { what: 'the install swallows a failed download and takes over anyway', sw: s => s.replace("return cache.addAll(PRECACHE_CRITICAL.map(u => new Request(u, { cache: 'reload' })));", "return Promise.all(PRECACHE_CRITICAL.map(u => cache.add(new Request(u, { cache: 'reload' })).catch(() => {})));") },
  'server-keeps-old-coach': { what: 'the server still serves the WHOLE old coach.js under that name next to the new parts', server: true },
  'offline-fallback-gone': { what: 'the fetch handler answers a miss with an error even when the network is up (no network on a miss)', sw: s => s.replace("const network = (fresh ? fetch(req, { cache: 'no-cache' }) : fetch(req))", "const network = (fresh ? Promise.reject(new Error('x')) : fetch(req))") },
};
const BREAK = opt('--break');

async function main(breakName) {
  scenarios = 0; assertions = 0; failures = 0; findings = 0; out.length = 0;
  const oldSw = swText(OLD);
  let newSw = swText(NEW), newRoot = NEW;
  const oldV = /const CACHE_VERSION = '([^']*)';/.exec(oldSw)[1];
  const br = breakName ? BREAKS[breakName] : null;
  let tmp = null;
  if (br && br.sw) { const m = br.sw(newSw, oldV); if (m === newSw) { say(`  ✗ break "${breakName}" changed nothing in sw.js: the text it replaces has moved`); failures++; return; } newSw = m; }
  if (br && br.server) {
    /* A server that kept the old whole file: a thin overlay folder is not needed, the Net reads through this. */
    tmp = mkdtempSync(join(tmpdir(), 'gc-sw-upgrade-srv-'));
    newRoot = { overlay: { 'coach.js': fileOf(OLD, 'coach.js') } };
  }
  const serve = b => { if (newRoot === NEW) { b.net.root = NEW; return; } b.net.root = NEW; const f0 = b.net.fetch.bind(b.net); b.net.fetch = async (req, init, who) => { const rel = relOf(req).split('?')[0]; if (newRoot.overlay[rel]) { await null; b.net.log.push({ who, rel, cache: 'default', status: 200 }); return new FakeResponse(newRoot.overlay[rel], { status: 200, type: 'basic' }); } return f0(req, init, who); }; };

  /* A returning student: the old worker in control, its cache filled from the old site by real use (the
     install, a page load, the rest of ASSETS, the Games screen, and for a teacher the console). */
  async function returning({ console: withConsole = false, games = true } = {}) {
    const b = new Browser(OLD);
    const first = await b.update(oldSw, 'old');
    if (!first.ok) throw new Error('the old worker did not install against the old folder: ' + (first.error && first.error.message));
    const p = await b.open({ teacher: withConsole });
    await b.controller.run('message', { data: { type: 'gc-precache-rest' } });
    if (games) await b.lazy(p, 'coach');
    if (withConsole) await b.lazy(p, 'teacher');
    b.close(p); b.takeTrace(); b.net.log.length = 0;
    return b;
  }
  const N = SITE.new, O = SITE.old;
  const newCritical = () => boot(newSw, new Browser(NEW), 'probe').read('PRECACHE_CRITICAL').map(u => u.replace(/^\.\//, ''));

  /* 0 ─ the two trees and the code's own rules */
  scenario('0. The two folders, and what sw.js does with a cache (read from the code that runs)');
  {
    const newV = /const CACHE_VERSION = '([^']*)';/.exec(swText(NEW))[1];
    check(newV !== oldV, `the deploy changes CACHE_VERSION (${oldV} → ${newV})`, 'the new folder\'s sw.js still names the old cache: run node tools/checks.mjs in it');
    check(O.scripts.includes('app.js') && !fileOf(NEW, 'app.js') && N.scripts.filter(s => s.startsWith('app/')).length > 1, `the old index.html loads app.js; the new one loads ${N.scripts.filter(s => s.startsWith('app/')).length} app parts and the new folder has no app.js`);
    check(N.coach.length > 1 && N.teacher.length > 1 && N.coach.every(f => fileOf(NEW, f)) && N.teacher.every(f => fileOf(NEW, f)), `the new app code lists ${N.coach.length} arcade files and ${N.teacher.length} console files, all in the new folder`);
    check(N.whole.coach.equals(O.whole.coach) && N.whole.teacher.equals(O.whole.teacher), 'the new parts put together are the old coach.js and teacher.js byte for byte (a pure cut)');
    const crit = newCritical();
    const missing = N.scripts.filter(s => !crit.includes(s));
    check(missing.length === 0, `every script the new index.html names is in the new PRECACHE_CRITICAL (${N.scripts.length} of ${N.scripts.length})`, 'not in it: ' + missing.join(', '));
    /* stale-while-revalidate, proved on the old worker: a hit is served old AND overwritten from the server. */
    const b = await returning(); serve(b);
    const g = await b.get('index.html');
    const after = await (await b.storage.open(oldV)).match('index.html');
    check(g.label === 'OLD' && label('index.html', after.body) === 'NEW', 'the fetch handler is stale-while-revalidate: a cached file is served from the cache, and the copy in the cache is replaced by what the server has now', `served ${g.label}, cache now holds ${label('index.html', after.body)}`);
  }

  /* 1 ─ the upgrade */
  scenario('1. Returning student, the deploy lands, the new worker installs and takes over');
  {
    const b = await returning({ console: true }); serve(b);
    const cachedOldCoach = await (await b.storage.open(oldV)).match('coach.js');
    check(!!cachedOldCoach && lines(cachedOldCoach.body) === lines(O.whole.coach), `before the deploy the old cache holds the whole coach.js (${lines(O.whole.coach)} lines), teacher.js and app.js`);
    /* The visit that starts the update is itself answered by the OLD worker. */
    const before = await b.open(); await b.lazy(before, 'coach');
    const vb = verdict(before);
    check(vb.v === 'OLD', 'the visit that starts the update (still the old worker) is a complete OLD page: old index.html, app.js and the whole coach.js', `${vb.v}: ${vb.why}`);
    showTrace(b);
    const up = await b.update(newSw, 'new');
    const crit = up.w.read('PRECACHE_CRITICAL');
    const asked = up.requests.map(r => r.rel);
    check(up.ok && asked.length === crit.length && up.requests.every(r => r.status === 200 && r.cache === 'reload'), `the install asked the server for all ${crit.length} PRECACHE_CRITICAL files, each fresh (cache:'reload'), and all ${up.requests.filter(r => r.status === 200).length} arrived; then it took over`, up.ok ? up.requests.filter(r => r.status !== 200).map(r => r.rel + ' ' + r.status).join(', ') : 'install failed: ' + (up.error && up.error.message));
    if (up.ok) {
      const names = [...b.storage.c.keys()];
      check(!names.includes(oldV) && names.includes(up.w.version), `activate deleted the old shell cache (${oldV}); the new worker reads only its own (${up.w.version})`, 'caches: ' + names.join(', '));
      check(before.messages.some(m => m && m.type === 'gc-sw-activated'), 'the open page was told (gc-sw-activated), which is what makes it reload');
      b.close(before);
      const page = await b.open(); await b.lazy(page, 'coach'); await b.lazy(page, 'teacher');
      const every = [page.nav, ...page.got, ...page.lazy.coach, ...page.lazy.teacher];
      const want = 1 + N.scripts.length + N.coach.length + N.teacher.length;
      const wrong = every.filter(g => !sameBytes(g, NEW));
      check(every.length === want && wrong.length === 0, `after the takeover the navigation, all ${N.scripts.length} scripts of the new index.html, ${N.coach.length} arcade files and ${N.teacher.length} console files come back with the NEW folder's bytes (${every.length - wrong.length} of ${want})`, wrong.map(g => `${g.rel}: ${g.ok ? g.label + ' bytes, ' + g.lines + ' lines' : 'failed'}`).join('; '));
      const c = page.lazy.coach[0], t = page.lazy.teacher[0];
      check(c && t && c.ok && t.ok && c.body.equals(fileOf(NEW, 'coach.js')) && t.body.equals(fileOf(NEW, 'teacher.js')) && lines(c.body) < lines(O.whole.coach), `coach.js is the new first part (${c && c.lines} lines, not the old ${lines(O.whole.coach)}) and teacher.js the new first part (${t && t.lines} lines, not ${lines(O.whole.teacher)})`, `coach.js ${c && c.label} ${c && c.lines} lines; teacher.js ${t && t.label} ${t && t.lines} lines`);
      const v = verdict(page);
      check(v.v === 'NEW', 'that page is a complete NEW page (no old byte, each lazy script whole)', `${v.v}: ${v.why}`);
      /* a second load: now everything is a cache hit in the NEW cache */
      b.close(page);
      const again = await b.open(); await b.lazy(again, 'coach'); await b.lazy(again, 'teacher');
      const v2 = verdict(again);
      check(v2.v === 'NEW', 'the next load (served from the new cache) is a complete NEW page too', `${v2.v}: ${v2.why}`);
    }
    showTrace(b);
  }

  /* 2 ─ a failed install */
  scenario('2. One critical part fails to download during the install');
  {
    const b = await returning(); serve(b);
    const part = N.scripts.filter(s => s.startsWith('app/'))[3] || N.scripts[N.scripts.length - 1];
    const visit1 = await b.open(); await b.lazy(visit1, 'coach');
    b.net.down = rel => rel === part;
    const up = await b.update(newSw, 'new');
    b.net.down = () => false;
    check(!up.ok && !!up.error, `with ${part} failing, the install fails as a whole`, 'the new worker took over with a part missing');
    const newCache = b.storage.c.get(up.w.version);
    check(b.controller.name === 'old' && (!newCache || newCache.m.size === 0), 'the old worker stays in control and the new cache holds nothing', `controller ${b.controller.name}, new cache entries ${newCache ? newCache.m.size : 0}`);
    const v1 = verdict(visit1);
    check(v1.v === 'OLD', 'the page that was open during the failed install is a complete OLD page', `${v1.v}: ${v1.why}`);
    b.close(visit1); showTrace(b);
    /* What the old worker serves on the NEXT visit. Its own background refetch of index.html has by now
       replaced the old index.html in the OLD cache with the new one. */
    const snapshot = () => { const c = new Map(); for (const [n, cache] of b.storage.c) c.set(n, new Map(cache.m)); return c; };
    const restore = snap => { b.storage.c.clear(); for (const [n, m] of snap) { const fc = new FakeCache(b.net, n); fc.m = new Map(m); b.storage.c.set(n, fc); } };
    const snap = snapshot();
    b.net.down = () => true;
    const off = await b.open(); if (!off.dead) await b.lazy(off, 'coach');
    const vo = verdict(off);
    const tOff = showTrace(b);
    finding(vo.v === 'OLD', 'the next visit with no network (old worker, old cache) is still a complete OLD page',
      `after a failed install the old cache no longer holds a complete old site. Next visit with NO network: ${vo.v} (${vo.why}). The old worker's own background refetch stored the NEW index.html over the old one in the OLD cache; the new index.html asks for part files the old cache never had.`,
      tOff.filter(l => /index|\.\/ |app\/|app\.js|FAILED|network error/.test(l)).slice(0, 8));
    b.close(off); restore(snap); b.net.down = () => false;
    /* ...and with the network up, before the retried install has finished. Visit 1 above opened Games, so the
       old worker's refetch already replaced the cached coach.js with the new first part. */
    const on = await b.open(); await b.lazy(on, 'coach');
    const vn = verdict(on);
    const tOn = showTrace(b);
    finding(vn.v === 'OLD' || vn.v === 'NEW', `the next visit with the network up (still the old worker; Games was opened on the visit before) is a complete ${vn.v} page`,
      `next visit with the network up, still the old worker (the retried install has not finished): ${vn.v} (${vn.why}).`,
      tOn.filter(l => /GET (\.\/|coach)/.test(l)));
    b.close(on);
    /* The same when the student did NOT open Games on the visit of the failed install: the old cache still
       holds the WHOLE old coach.js, and the new page loads the new parts after it. */
    {
      const b2 = await returning(); serve(b2);
      const v1b = await b2.open();
      b2.net.down = rel => rel === part; const upb = await b2.update(newSw, 'new'); b2.net.down = () => false;
      b2.close(v1b); b2.takeTrace();
      const on2 = await b2.open(); await b2.lazy(on2, 'coach');
      const vb = verdict(on2);
      const tb = showTrace(b2);
      finding(!upb.ok && (vb.v === 'OLD' || vb.v === 'NEW'), `the same visit when Games was not opened before is a complete ${vb.v} page`,
        `next visit with the network up, still the old worker, Games not opened on the visit of the failed install: ${vb.v} (${vb.why}). The new page gets the WHOLE old coach.js from the old cache and then loads the 6 new parts on top of it: every part declares again what the whole file already declared.`,
        tb.filter(l => /GET (\.\/|coach)/.test(l)));
    }
    /* The retry succeeds: whatever the old cache had become, the new worker ends it. */
    const up2 = await b.update(newSw, 'new');
    const fin = await b.open(); await b.lazy(fin, 'coach');
    const vf = verdict(fin);
    check(up2.ok && vf.v === 'NEW', 'once a retried install succeeds, the next page is a complete NEW page', `${vf.v}: ${vf.why}`);
    showTrace(b);
  }

  /* 3 ─ a page from before the upgrade, lazy scripts after it */
  scenario('3. A page loaded BEFORE the upgrade asks for coach.js / teacher.js AFTER the new worker took over');
  {
    for (const which of ['coach', 'teacher']) {
      const b = await returning({ console: which === 'teacher' }); serve(b);
      const page = await b.open({ teacher: which === 'teacher' });
      const up = await b.update(newSw, 'new');
      b.takeTrace();
      const got = await b.lazy(page, which);
      const v = verdict(page);
      const t = showTrace(b);
      const whole = lines(O.whole[which]);
      check(up.ok && page.lists[which].length === 1 && page.messages.some(m => m && m.type === 'gc-sw-activated'), `[${which}] the old page knows one file (${page.lists[which].join(', ')}) and has been told to reload`);
      finding(v.v === 'OLD' || (got.length === 1 && !got[0].ok), `[${which}] the old page gets the whole old script, or a clean failure it can retry`,
        `[${which}] an old page that has not reloaded yet asks for ${page.lists[which][0]} and gets ${got[0].ok ? `the NEW first part only: ${got[0].lines} of ${whole} lines` : 'a failure'} (${v.v}: ${v.why}). Sequence: old page in memory → new worker activates, deletes the old cache → old page calls ${which === 'coach' ? 'ensureCoachJs()' : 'ensureTeacherJs()'} → miss in the new cache → network → the server's ${page.lists[which][0]} is now part 1 of ${N[which].length}; the old page never asks for the other ${N[which].length - 1}.`,
        t.filter(l => /GET/.test(l)));
    }
  }

  /* 4 ─ offline after the upgrade */
  scenario('4. Offline right after a successful upgrade');
  {
    const b = await returning(); serve(b);
    const up = await b.update(newSw, 'new');
    /* (a) at once: only the install's files are in the cache */
    b.net.down = () => true;
    const p1 = await b.open();
    const v1 = verdict(p1);
    check(up.ok && v1.v === 'NEW' && p1.got.length === N.scripts.length, `offline at once: index.html and all ${N.scripts.length} of its scripts come from the new cache (a complete NEW page)`, `${v1.v}: ${v1.why}`);
    const c1 = await b.lazy(p1, 'coach');
    /* What today's site does in the same spot: a fresh old worker, offline before the rest was fetched. */
    const today = new Browser(OLD); await today.update(oldSw, 'old'); today.net.down = () => true;
    const tp = await today.open(); const tc = await today.lazy(tp, 'coach'); const tt = await today.lazy(tp, 'teacher');
    check(c1.every(g => g.ok) === tc.every(g => g.ok), `offline at once, the Games script: ${c1.every(g => g.ok) ? 'served' : 'not in the cache yet (it is in ASSETS, fetched after the takeover)'}; the same as today's coach.js (${tc.every(g => g.ok) ? 'served' : 'not served'})`, `new: ${c1.map(g => g.rel + ' ' + g.status).join(', ')}; today: ${tc.map(g => g.rel + ' ' + g.status).join(', ')}`);
    b.close(p1); showTrace(b);
    /* (b) after the page asked for the rest (app.js sends gc-precache-rest on load) */
    b.net.down = () => false;
    await b.controller.run('message', { data: { type: 'gc-precache-rest' } });
    b.net.down = () => true;
    const p2 = await b.open(); const c2 = await b.lazy(p2, 'coach');
    const v2 = verdict(p2);
    check(v2.v === 'NEW' && c2.length === N.coach.length && c2.every(g => sameBytes(g, NEW)), `offline after the page asked for the rest: all ${N.coach.length} arcade files come from the cache with the new bytes (${c2.filter(g => sameBytes(g, NEW)).length} of ${N.coach.length})`, `${v2.v}: ${v2.why}`);
    /* the console: not precached by design */
    const t2 = await b.lazy(p2, 'teacher');
    check(t2.every(g => g.ok) === tt.every(g => g.ok) && !t2.every(g => g.ok), `offline, a console never opened since the upgrade: its script does not load (not precached by design); the same as today's teacher.js (${tt.every(g => g.ok) ? 'served' : 'not served'})`, `new: ${t2.map(g => g.rel + ' ' + g.status).join(', ')}; today: ${tt.map(g => g.rel + ' ' + g.status).join(', ')}`);
    b.close(p2);
    /* ...and once the console has been opened online after the upgrade, every part is cached by first use */
    b.net.down = () => false;
    const con = await b.open({ teacher: true }); await b.lazy(con, 'teacher'); b.close(con);
    b.net.down = () => true;
    const con2 = await b.open({ teacher: true }); const t3 = await b.lazy(con2, 'teacher');
    const v3 = verdict(con2);
    check(v3.v === 'NEW' && t3.length === N.teacher.length && t3.every(g => sameBytes(g, NEW)), `offline after one online console visit: the console page and all ${N.teacher.length} console files come from the cache (${t3.filter(g => sameBytes(g, NEW)).length} of ${N.teacher.length})`, `${v3.v}: ${v3.why}`);
    showTrace(b);
  }

  /* 5 ─ a first-ever visitor */
  scenario('5. A first-ever visitor (no worker, no cache)');
  {
    const b = new Browser(NEW); serve(b);
    const p = await b.open();
    const up = await b.update(newSw, 'new');
    await b.lazy(p, 'coach');
    const v = verdict(p);
    check(up.ok && v.v === 'NEW' && p.lazy.coach.length === N.coach.length, `the first page (from the network) and its ${N.coach.length} arcade files are a complete NEW page; the worker installs and claims it`, `${v.v}: ${v.why}`);
    await b.controller.run('message', { data: { type: 'gc-precache-rest' } });
    b.close(p);
    b.net.down = () => true;
    const p2 = await b.open(); await b.lazy(p2, 'coach');
    const v2 = verdict(p2);
    check(v2.v === 'NEW' && p2.got.every(g => sameBytes(g, NEW)), `the second visit, offline: index.html, ${N.scripts.length} scripts and ${N.coach.length} arcade files all from the cache`, `${v2.v}: ${v2.why}`);
    const names = [...b.storage.c.keys()];
    check(!names.includes(oldV), 'nothing old is involved: no old cache exists', names.join(', '));
    showTrace(b);
  }

  /* 6 ─ the visit after a deploy when the student never reaches the reload (tab closed mid-install) */
  scenario('6. The server never serves an old whole script next to new parts');
  {
    const b = new Browser(NEW); serve(b);
    const p = await b.open(); await b.lazy(p, 'coach'); await b.lazy(p, 'teacher');
    const v = verdict(p);
    check(v.v === 'NEW', 'straight from the server (no worker): the lazy lists put together are the two scripts, nothing twice', `${v.v}: ${v.why}`);
    const dup = [...N.coach, ...N.teacher, ...N.scripts].filter((f, i, a) => a.indexOf(f) !== i);
    check(dup.length === 0, `no file is named twice across the ${N.scripts.length + N.coach.length + N.teacher.length} script requests of a new page`, dup.join(', '));
    if (tmp) rmSync(tmp, { recursive: true, force: true });
  }
}

/* ── run ───────────────────────────────────────────────────────────────── */
const cleanup = () => { if (builtIn && !args.includes('--keep')) rmSync(builtIn, { recursive: true, force: true }); };
if (BREAK === 'list') { for (const [k, v] of Object.entries(BREAKS)) console.log(`${k.padEnd(24)} ${v.what}`); cleanup(); process.exit(0); }
if (BREAK === 'all') {
  let bad = 0;
  for (const k of Object.keys(BREAKS)) {
    await main(k);
    const red = out.filter(l => l.includes('✗'));
    console.log(`\nbreak-it "${k}": ${BREAKS[k].what}`);
    if (red.length) for (const l of red) console.log('  ' + l.trim()); else { bad++; console.log('  ✗ NOT CAUGHT: the tool stayed green with this fault planted'); }
  }
  console.log(bad ? `\n✗ sw-upgrade-proof --break all: ${bad} of ${Object.keys(BREAKS).length} planted faults were not caught` : `\n✓ sw-upgrade-proof --break all: ${Object.keys(BREAKS).length} of ${Object.keys(BREAKS).length} planted faults turn the tool red`);
  cleanup(); process.exit(bad ? 1 : 0);
}
if (BREAK && !BREAKS[BREAK]) { console.error(`sw-upgrade-proof: no break called "${BREAK}" (--break list)`); cleanup(); process.exit(2); }
await main(BREAK);
for (const l of out) console.log(l);
console.log('');
const red = failures || (STRICT && findings);
if (red) console.log(`✗ sw-upgrade-proof: ${failures} of ${assertions} assertions failed${findings ? `, ${findings} finding${findings > 1 ? 's' : ''} (⚠ above)` : ''} (${scenarios} scenarios)`);
else console.log(`✓ sw-upgrade-proof: ${scenarios} scenarios, ${assertions} assertions${findings ? `, ${findings} finding${findings > 1 ? 's' : ''} (⚠ above: what the real upgrade does that is not a clean old or new page)` : ''}`);
cleanup();
process.exit(red ? 1 : 0);
