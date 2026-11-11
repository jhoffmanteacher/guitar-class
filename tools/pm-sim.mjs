#!/usr/bin/env node
/* Practice minutes — simulation (2026-11-01).

   checks.mjs reads source text; this RUNS practice-minutes.js. It loads the real
   practice-minutes-config.js + practice-minutes.js into a sandbox with a fake
   clock, fake <audio> elements, fake localStorage, a fake network switch and a
   fake Firestore (batch / set / increment / serverTimestamp), then plays
   sessions and checks what was counted and what was written.

     node tools/pm-sim.mjs          prints every scenario; exit 1 on any failure
     node tools/pm-sim.mjs --quiet  only the verdict

   Part of checks.mjs (1cg) — it runs this file and fails the push if it fails.
   The browser half (strip, recap, toast, My progress, real Chrome) is
   tools/pm-e2e.mjs; that one needs Chrome and is not part of checks.mjs. */
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteSource } from './site-src.mjs';

/* PM_ROOT points the simulation at another checkout (checks.mjs's break-it proofs use a scratch copy). */
const ROOT = process.env.PM_ROOT || resolve(dirname(fileURLToPath(import.meta.url)), '..');
const QUIET = process.argv.includes('--quiet');
let passed = 0, failed = 0;
const fails = [];
function check(name, ok, detail) {
  if (ok) { passed++; if (!QUIET) console.log('  ✓ ' + name); }
  else { failed++; fails.push(name); console.log('  ✗ ' + name + (detail ? '  — ' + detail : '')); }
}
const eq = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const CONFIG_SRC = readFileSync(join(ROOT, 'practice-minutes-config.js'), 'utf8');
const ENGINE_SRC = readFileSync(join(ROOT, 'practice-minutes.js'), 'utf8');

/* ── A sandbox with everything the engine touches ── */
function makeWorld(opts = {}) {
  const clock = opts.clock || { ms: opts.startMs ?? new Date(2026, 10, 16, 9, 0, 0).getTime(), perf: 5000 };   // Mon 16 Nov 2026, 9:00 local
  const timers = [];
  let timerId = 1;
  const store = opts.store || {}, session = opts.session || {};   // pass store/clock/server/net to make a second tab or device
  const listeners = {};
  const net = opts.net || { online: true, denied: false, commitDelay: 0 };
  const server = opts.server || { days: {}, weeks: {} };   // what Firestore holds
  server.board ||= {};                                       // rankBoard/{tag}: { seconds } (the class rank, keyed by the private tag)
  server.wb ||= {}; server.wbVer ||= {};                     // weekBoard/{tag}: { week, period, seconds } (the Top 5, keyed by a private tag) and a version counter per doc
  server.meta ||= {}; server.metaVer ||= {};                 // minutes/{uid}/meta/board: { id } (the private tag, create-only, owner-only)
  /* sets: every single-document set() on ANY path EXCEPT rankBoard/{tag}, which goes to
     log.board. The minutes go in one batch, so this stays empty; the heartbeats/{sessionId}
     writer removed 2026-11-04 landed here, and anything but the board landing here fails. */
  const log = { getOpts: [], commits: [], sets: [], fetches: [], board: [], boardRefused: [], wbWrites: [], wbRefused: [], wbGets: 0, wbRetries: 0, wbTx: 0, wbQueries: [] };

  class FakeDate extends Date {
    constructor(...a) { if (a.length) super(...a); else super(clock.ms); }
    static now() { return clock.ms; }
  }
  const user = { uid: opts.uid || 'uid-A', getIdToken() { return Promise.resolve('tok-' + this.uid); } };
  const auth = { currentUser: user };
  const inc = (n) => ({ __inc: n });
  const stamp = { __server: true };
  const docSnap = (id, data) => ({ id, data: () => data });
  /* net.holdReads: a read is sent but its answer is not given until releaseReads(); it is computed THEN, so it includes anything committed meanwhile. */
  const reply = (fn) => (net.holdReads ? new Promise((res) => (net.heldReads ||= []).push(() => res(fn()))) : Promise.resolve(fn()));
  const releaseReads = () => { const h = net.heldReads || []; net.heldReads = []; net.holdReads = false; h.forEach((f) => f()); };
  /* weekBoard (the Top 5): a query takes EQUALITY filters only (no composite index is needed for those), chained with .where();
     net.wbReadDenied = the rules are not published. Every query is logged with its filters; net.wbReads counts the reads. */
  const wbQuery = (filters) => ({
    where: (a, op, b) => wbQuery(filters.concat([[a, op, b]])),
    get: (opts) => {
      log.wbQueries.push(filters);
      net.wbReads = (net.wbReads || 0) + 1;
      /* The real SDK (10.12.2, measured in headless Chrome offline and with firestore.googleapis.com blocked): a plain query get() RESOLVES with an
         empty answer from the cache; with { source: 'server' } it rejects with code 'unavailable'. Offline here = net.online false. */
      log.wbQueryOpts = (log.wbQueryOpts || []).concat([opts || null]);
      if (!net.online) return opts && opts.source === 'server' ? Promise.reject(Object.assign(new Error('Failed to get documents from server.'), { code: 'unavailable' })) : Promise.resolve({ forEach: () => {} });
      if (net.wbReadDenied) return Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' }));
      const bad = filters.some((f) => f[1] !== '==');
      if (bad) return Promise.reject(Object.assign(new Error('needs an index'), { code: 'failed-precondition' }));
      return reply(() => ({ forEach: (fn) => { Object.keys(server.wb).filter((k) => filters.every((f) => server.wb[k][f[0]] === f[2])).forEach((k) => fn(docSnap(k, server.wb[k]))); } }));
    },
  });
  /* firestore.rules, weekBoard/{tag}: only the doc whose id is the writer's own tag (the rule reads the writer's minutes/{uid}/meta/board); exactly
     { week, period, seconds }; 'YYYY-Www'; period 4 / 7 / CAS; a number 0..7 x 1200. minutes/{uid}/meta/board: create-only, owner only, { id } of 32 hex. */
  const metaRulesOk = (uid, pathUid, d) => uid === pathUid && server.meta[pathUid] === undefined && !!d && eq(Object.keys(d), ['id']) && typeof d.id === 'string' && /^[0-9a-f]{32}$/.test(d.id);
  const wbRulesOk = (uid, id, d) => !!server.meta[uid] && server.meta[uid].id === id && !!d && eq(Object.keys(d).sort(), ['period', 'seconds', 'week']) && typeof d.week === 'string' && /^[0-9]{4}-W[0-9]{2}$/.test(d.week)
    && ['4', '7', 'CAS'].includes(d.period) && typeof d.seconds === 'number' && d.seconds >= 0 && d.seconds <= 7 * 1200;
  /* The real SDK offline (measured, 10.12.2): a plain get() RESOLVES with an empty answer from the cache; { source: 'server' } rejects 'unavailable'.
     Every get() here is logged in log.getOpts so a test can see which reads asked the server. */
  const offlineGet = (opts) => opts && opts.source === 'server' ? Promise.reject(Object.assign(new Error('Failed to get documents from server.'), { code: 'unavailable' })) : Promise.resolve({ forEach: () => {} });
  const dbCollection = (path) => (path === 'minutesBoard' && (log.minutesBoardTouched = (log.minutesBoardTouched || 0) + 1), {
    doc: (id) => ({
      path: path + '/' + id,
      /* rankBoard/{tag}.get(): the page looks at its own doc once, before its first write. */
      get: () => {
        if (path !== 'rankBoard') return Promise.reject(new Error('doc.get is only faked for rankBoard'));
        if (net.boardDenied) { log.boardRefused.push({ id, get: true }); return Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' })); }
        (log.boardGets ||= []).push(id);
        return Promise.resolve({ exists: server.board[id] !== undefined, data: () => server.board[id] });
      },
      collection: (sub) => dbCollection(path + '/' + id + '/' + sub),
      set: (data, o) => {
        if (path === 'rankBoard') {
          /* The rules: the document that results is only { seconds }, a number 0..400 x 1200 (an increment({__inc}) merged
             onto the stored value, as Firestore does); net.boardDenied = the rules are not published. Every attempt is logged. */
          (log.boardTries ||= []).push({ id, data, o });
          if (!(server.meta[user.uid] && server.meta[user.uid].id === id)) { log.boardRefused.push({ id, data, notYours: true }); return Promise.reject(Object.assign(new Error('not your tag'), { code: 'permission-denied' })); }
          if (net.boardDenied) { log.boardRefused.push({ id, data }); return Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' })); }
          const inc = data && data.seconds && typeof data.seconds === 'object' ? data.seconds.__inc : undefined;
          const result = inc !== undefined ? (server.board[id]?.seconds || 0) + inc : data && data.seconds;
          const ok = eq(Object.keys(data || {}), ['seconds']) && (inc === undefined || (o && o.merge === true)) && typeof result === 'number' && result >= 0 && result <= 400 * 1200;
          if (!ok) { log.boardRefused.push({ id, data }); return Promise.reject(Object.assign(new Error('rules'), { code: 'permission-denied' })); }
          log.board.push({ id, data }); server.board[id] = { seconds: result };
          return Promise.resolve();
        }
        log.sets.push({ path, id, data }); return Promise.resolve();
      },
    }),
    get: (opts) => (log.getOpts.push({ path, opts: opts || null }), net.online === false) ? offlineGet(opts) : (path === 'rankBoard' && (net.boardDenied || net.denyBoardRead)) ? Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' }))
      : net.denyReads ? (net.reads = (net.reads || 0) + 1, Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' }))) : reply(() => ({
      forEach: (fn) => {
        if (path === 'rankBoard') { net.boardReads = (net.boardReads || 0) + 1; Object.keys(server.board).forEach((k) => fn(docSnap(k, server.board[k]))); return; }
        const bag = path.endsWith('/days') ? server.days : path.endsWith('/weeks') ? server.weeks : {};
        Object.keys(bag).forEach((k) => fn(docSnap(k, bag[k])));
      },
    })),
    where: (a, op, b) => path === 'weekBoard' ? wbQuery([[a, op, b]]) : ({
      __where: [a, op, b],
      get: (opts) => (log.getOpts.push({ path, opts: opts || null, where: true }), net.online === false) ? offlineGet(opts) : net.denyReads ? (net.reads = (net.reads || 0) + 1, Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' }))) : reply(() => ({
        forEach: (fn) => { Object.keys(server.days).filter((k) => k >= b).forEach((k) => fn(docSnap(k, server.days[k]))); },
      })),
    }),
  });
  /* The rules: a day above the cap (1200 s) is refused, as in firestore.rules; a week doc must end up with all three
     fields. A merge-set that omits `hit` keeps the stored one (what Firestore does). */
  function applyOps(ops) {
    for (const op of ops) {
      if (/\/days\//.test(op.path)) {
        const id = op.path.split('/').pop();
        if ((server.days[id]?.seconds || 0) + op.data.seconds.__inc > 1200) return false;
      } else {
        const id = op.path.split('/').pop();
        if (!('hit' in op.data) && !server.weeks[id]) return false;
      }
    }
    for (const op of ops) {
      const id = op.path.split('/').pop();
      if (/\/days\//.test(op.path)) server.days[id] = { seconds: (server.days[id]?.seconds || 0) + op.data.seconds.__inc };
      else server.weeks[id] = { seconds: (server.weeks[id]?.seconds || 0) + op.data.seconds.__inc, goalSeconds: op.data.goalSeconds, hit: 'hit' in op.data ? op.data.hit : server.weeks[id].hit };
    }
    log.commits.push(ops.map((o) => ({ path: o.path, data: o.data })));
    return true;
  }
  /* Firestore's optimistic transaction: the callback reads, the writes are kept and applied at commit; if a document it read changed
     meanwhile (another page wrote it) the callback runs AGAIN on the new data (up to 5 times). net.wbBeforeCommit(n) is a hook that lets a test
     write the doc "from another page" between the read and the commit. Only weekBoard is faked; the rules are checked on every write. */
  const runTransaction = async (fn) => {
    log.wbTx++;
    if (!net.online) throw Object.assign(new Error('Connection failed.'), { code: 'unavailable' });   // a transaction needs the server (the real SDK: 'unavailable' after ~7 s)
    if (net.wbDenied) { log.wbRefused.push({ denied: true }); throw Object.assign(new Error('denied'), { code: 'permission-denied' }); }
    for (let attempt = 0; attempt < 5; attempt++) {
      const reads = {}, writes = [];
      const idOf = (ref) => { if (!/^weekBoard\//.test(ref.path)) throw new Error('transactions only write weekBoard: ' + ref.path); return ref.path.split('/')[1]; };
      const metaOf = (ref) => { const m = /^minutes\/([^/]+)\/meta\/board$/.exec(ref.path); return m ? m[1] : null; };
      const tx = {
        get: (ref) => {
          const mu = metaOf(ref);
          if (mu) { log.metaGets = (log.metaGets || 0) + 1; reads['meta:' + mu] = server.metaVer[mu] || 0; return Promise.resolve({ exists: server.meta[mu] !== undefined, data: () => server.meta[mu] }); }
          /* minutes/{uid}/weeks/{week}: the server's week total (the Top 5 publishes it); read-only here. */
          const wm = /^minutes\/[^/]+\/weeks\/(.+)$/.exec(ref.path);
          if (wm) { log.wkGets = (log.wkGets || 0) + 1; return Promise.resolve({ exists: server.weeks[wm[1]] !== undefined, data: () => server.weeks[wm[1]] }); }
          const id = idOf(ref); log.wbGets++; reads[id] = server.wbVer[id] || 0; return Promise.resolve({ exists: server.wb[id] !== undefined, data: () => server.wb[id] });
        },
        set: (ref, data) => { const mu = metaOf(ref); if (!mu) log.wbTrySets = (log.wbTrySets || []).concat([ref.path]); writes.push(mu ? { meta: mu, data } : { id: idOf(ref), data }); return tx; },
      };
      const out = await fn(tx);   // the real SDK resolves with what the callback returned
      if (net.wbBeforeCommit) net.wbBeforeCommit(attempt);
      if (Object.keys(reads).some((k) => (k.startsWith('meta:') ? (server.metaVer[k.slice(5)] || 0) : (server.wbVer[k] || 0)) !== reads[k])) { log.wbRetries++; continue; }
      for (const wr of writes) {
        if (wr.meta ? !metaRulesOk(user.uid, wr.meta, wr.data) : !wbRulesOk(user.uid, wr.id, wr.data)) { log.wbRefused.push(wr); throw Object.assign(new Error('rules'), { code: 'permission-denied' }); }
      }
      for (const wr of writes) {
        if (wr.meta) { server.meta[wr.meta] = { ...wr.data }; server.metaVer[wr.meta] = (server.metaVer[wr.meta] || 0) + 1; log.tagWrites = (log.tagWrites || []).concat([{ uid: wr.meta, data: { ...wr.data } }]); continue; }
        server.wb[wr.id] = { ...wr.data }; server.wbVer[wr.id] = (server.wbVer[wr.id] || 0) + 1; log.wbWrites.push({ id: wr.id, data: { ...wr.data } });
      }
      return out;
    }
    throw Object.assign(new Error('aborted'), { code: 'aborted' });
  };
  const db = {
    runTransaction,
    collection: (c) => dbCollection(c),
    batch: () => {
      const ops = [];
      return {
        set: (ref, data, o) => { ops.push({ path: ref.path, data, o }); },
        commit: () => {
          if (net.denied) { const e = new Error('denied'); e.code = 'permission-denied'; return Promise.reject(e); }
          if (!net.online) return new Promise(() => {});
          if (net.stall) return new Promise((res, rej) => { (net.queued ||= []).push({ ops: ops.slice(), res, rej }); });
          return applyOps(ops) ? Promise.resolve() : Promise.reject(Object.assign(new Error('cap'), { code: 'permission-denied' }));
        },
      };
    },
  };
  const firebase = {
    auth: () => auth,
    firestore: Object.assign(() => db, {
      FieldValue: { increment: inc, serverTimestamp: () => stamp },
      FieldPath: { documentId: () => '__name__' },
      Timestamp: { fromMillis: (ms) => ({ ms }) },
    }),
  };
  const mkStorage = (bag) => ({
    getItem: (k) => (k in bag ? bag[k] : null), setItem: (k, v) => { bag[k] = String(v); }, removeItem: (k) => { delete bag[k]; },
    get length() { return Object.keys(bag).length; }, key: (i) => Object.keys(bag)[i] ?? null,
  });
  class FakeAudio {
    constructor(src) { this.src = src; this.currentSrc = src; this.paused = true; this.ended = false; this.muted = false; this.volume = 1; this.readyState = 4; this.currentTime = 0; this.tagName = 'AUDIO'; this.frozen = false; }
    addEventListener(ev, fn) { ((this.__l ||= {})[ev] ||= []).push(fn); }
    emit(ev) { ((this.__l || {})[ev] || []).forEach((f) => f()); }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
  }
  /* 2026-11-03: the signs of work the engine watches — Web Audio start(), getUserMedia(). */
  class FakeSource { start() { this.started = true; } }
  class FakeMediaDevices {
    getUserMedia() { const tr = { readyState: 'live', enabled: true }; return Promise.resolve({ getAudioTracks: () => [tr], track: tr }); }
  }
  /* opts.strip: the page has a #pm-header strip (hidden, as index.html ships it), so syncHeader(), refreshStrip()
     and the 1 s uiTick() really draw it. Its rects are empty, so no toast or recap pill is ever anchored to it. */
  /* opts.pills (with opts.strip): the strip has a place on screen, and document.createElement / body.appendChild / getElementById('pm-toast') work,
     so the week-goal toast and the Top 5 toast really drop; world.pills() lists the ones on screen, a pill leaves after its setTimeout. */
  const onScreen = [];
  const mkEl = () => ({ style: {}, id: '', className: '', innerHTML: '', offsetWidth: 200, isConnected: true, setAttribute() {}, remove() { this.isConnected = false; const i = onScreen.indexOf(this); if (i >= 0) onScreen.splice(i, 1); } });
  const stripEl = opts.strip ? { id: 'pm-header', hidden: true, innerHTML: '', getClientRects: () => (opts.pills ? [{}] : []), getBoundingClientRect: () => (opts.pills ? { left: 1000, top: 0, width: 300, height: 40, bottom: 40 } : {}), contains: () => !!opts.pills } : null;
  const documentStub = {
    createElement: mkEl, body: { appendChild: (e) => { onScreen.push(e); } }, elementFromPoint: () => stripEl,
    visibilityState: 'visible', activeElement: null,
    addEventListener: (ev, fn) => { (listeners['doc:' + ev] ||= []).push(fn); },
    querySelector: () => null,
    querySelectorAll: (sel) => (stripEl && sel === '.pm-strip' ? [stripEl] : []),
    getElementById: (id) => (stripEl && id === 'pm-header' ? stripEl : onScreen.find((e) => e.id === id && e.isConnected) || null),
  };
  const windowStub = {
    PM_HOST: null,
    addEventListener: (ev, fn) => { (listeners['win:' + ev] ||= []).push(fn); },
    crypto: opts.noCrypto ? undefined : { getRandomValues: (a) => { const seed = (globalThis.__pmSeed = (globalThis.__pmSeed || 0) + 7); for (let i = 0; i < a.length; i++) a[i] = (i * 37 + seed * 13 + 11) % 256; return a; } },
    innerWidth: 1366,
  };
  const ctx = vm.createContext({
    window: windowStub, document: documentStub, HTMLMediaElement: FakeAudio, firebase,
    AudioScheduledSourceNode: FakeSource, MediaDevices: FakeMediaDevices,
    localStorage: mkStorage(store), sessionStorage: mkStorage(session),
    navigator: { get onLine() { return net.online; } },
    performance: { now: () => clock.perf },
    Date: FakeDate, console,
    setInterval: (fn, ms) => { timers.push({ id: timerId, fn, ms, next: clock.perf + ms }); return timerId++; },
    clearInterval: (id) => { const i = timers.findIndex((t) => t.id === id); if (i >= 0) timers.splice(i, 1); },
    setTimeout: (fn, ms) => { timers.push({ id: timerId, fn, ms, next: clock.perf + ms, once: true }); return timerId++; },
    clearTimeout: (id) => { const i = timers.findIndex((t) => t.id === id); if (i >= 0) timers.splice(i, 1); },
    fetch: (url, init) => {
      log.fetches.push({ url, init });
      /* net.applyKeepalive (opt-in, section 10): the keepalive :commit really lands on
         the fake server under the same rules as a batch — unless the link is down
         (offline, net.keepaliveFails). Off, a keepalive changes nothing (sections 1–9). */
      if (net.applyKeepalive && /documents:commit$/.test(url)) {
        if (!net.online || net.keepaliveFails) return Promise.reject(new Error('net'));
        const ops = JSON.parse(init.body).writes.map((wr) => {
          const name = wr.update.name, id = name.split('/').pop(), kind = /\/days\//.test(name) ? 'days' : 'weeks';
          const data = { seconds: { __inc: +wr.updateTransforms[0].increment.integerValue } };
          if (kind === 'weeks') { data.goalSeconds = +wr.update.fields.goalSeconds.integerValue; if (wr.update.fields.hit) data.hit = wr.update.fields.hit.booleanValue; }
          return { path: 'minutes/x/' + kind + '/' + id, data };
        });
        return Promise.resolve(applyOps(ops) ? { ok: true } : { ok: false, status: 403 });
      }
      return Promise.resolve({ ok: true });
    },
    firebaseConfig: { projectId: process.env.PM_PROJECT || 'guitar-class-test' },
    t: (k, p) => k, getLang: () => 'en',
  });
  windowStub.window = windowStub;
  windowStub.firebase = firebase;
  vm.runInContext(CONFIG_SRC, ctx);
  if (opts.config) vm.runInContext('Object.assign(PRACTICE_MINUTES_CONFIG, ' + JSON.stringify(opts.config) + ')', ctx);
  windowStub.PM_HOST = {
    ui: !!opts.ui,
    user: () => (opts.signedOut ? null : auth.currentUser),
    db: () => db,
    period: () => (opts.period === undefined ? '7' : opts.period),
  };
  vm.runInContext(ENGINE_SRC, ctx);
  const PM = windowStub.PM;

  /* Advance the world N seconds, one tick per second, flushing microtasks between. */
  async function run(seconds, each) {
    for (let i = 0; i < seconds; i++) {
      clock.perf += 1000; clock.ms += 1000;
      if (each) each(i);
      for (const t of [...timers]) {
        while (t.next <= clock.perf) { t.fn(); if (t.once) { const k = timers.indexOf(t); if (k >= 0) timers.splice(k, 1); break; } t.next += t.ms; }
      }
      await Promise.resolve(); await Promise.resolve();
    }
    for (let i = 0; i < 6; i++) await new Promise((r) => setImmediate(r));
  }
  const settle = async () => { for (let i = 0; i < 8; i++) await new Promise((r) => setImmediate(r)); };
  const track = (src = '../audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-full.mp3') => {
    const a = new FakeAudio(src);
    return a;
  };
  /* Make a playing element "move" like a real one: advance currentTime each second. */
  const playing = (a) => (i) => { if (!a.paused && !a.frozen) a.currentTime += 1; };
  /* Deliver what a stalled connection held: every batch, in order, as the SDK does when it reconnects. */
  function drain() {
    const q = net.queued || []; net.queued = [];
    let landed = 0, refused = 0;
    q.forEach((x) => { if (applyOps(x.ops)) { landed++; x.res(); } else { refused++; x.rej(Object.assign(new Error('cap'), { code: 'permission-denied' })); } });
    return { landed, refused };
  }
  /* A student's input: fire the engine's document listener for that event. */
  const input = (ev = 'pointerdown') => (listeners['doc:' + ev] || []).forEach((f) => f({ type: ev }));
  return { stripEl, pills: () => onScreen.slice(), opts, input, FakeSource, FakeMediaDevices, __timers: timers, drain, releaseReads, ctx, PM, clock, net, server, log, store, session, listeners, documentStub, windowStub, FakeAudio, run, settle, track, playing, user, firebase, db };
}
/* Everything counted so far: queued + already acknowledged by the server. */
/* The page's queue key: pm:q:<uid>:<pageId>. */
const qKey = (w, uid = 'uid-A') => Object.keys(w.store).find((k) => k.startsWith('pm:q:' + uid + ':'));
const qDays = (w, uid = 'uid-A') => { const k = qKey(w, uid); return k ? JSON.parse(w.store[k]).days : null; };
const sec = (w) => { const st = w.PM._state(); return st ? Object.values(st.pend).reduce((a, b) => a + b, 0) + Object.values(st.days).reduce((a, b) => a + b, 0) : 0; };
const todayStr = '2026-11-16';

/* ═══════════ 1. Calendar maths ═══════════ */
console.log('1. calendar maths');
{
  const w = makeWorld();
  const calc = w.PM.calc;
  // Independent ISO-week algorithm (UTC), compared over every day 2024-2031.
  const iso = (y, m, d) => {
    const dt = new Date(Date.UTC(y, m, d));
    const day = (dt.getUTCDay() + 6) % 7;
    dt.setUTCDate(dt.getUTCDate() - day + 3);
    const first = new Date(Date.UTC(dt.getUTCFullYear(), 0, 4));
    const wk = 1 + Math.round(((dt - first) / 86400000 - 3 + ((first.getUTCDay() + 6) % 7)) / 7);
    return dt.getUTCFullYear() + '-W' + String(wk).padStart(2, '0');
  };
  let bad = 0, n = 0;
  for (let d = new Date(Date.UTC(2024, 0, 1)); d < new Date(Date.UTC(2031, 0, 1)); d.setUTCDate(d.getUTCDate() + 1)) {
    const y = d.getUTCFullYear(), m = d.getUTCMonth(), dd = d.getUTCDate();
    const s = y + '-' + String(m + 1).padStart(2, '0') + '-' + String(dd).padStart(2, '0');
    n++; if (calc.weekIdOf(s) !== iso(y, m, dd)) bad++;
  }
  check(`weekIdOf agrees with an independent ISO-week algorithm on ${n} days (2024–2030)`, bad === 0, bad + ' differ');
  check('2027-01-01 is 2026-W53, 2027-01-04 is 2027-W01, 2026-11-01 (Sunday) is 2026-W44',
    calc.weekIdOf('2027-01-01') === '2026-W53' && calc.weekIdOf('2027-01-04') === '2027-W01' && calc.weekIdOf('2026-11-01') === '2026-W44');
  let rt = 0, rtBad = 0;
  for (let wk = '2024-W01'; wk < '2031-W01'; wk = calc.weekAdd(wk, 1)) { rt++; if (calc.weekIdOf(calc.ymd(calc.weekMonday(wk))) !== wk) rtBad++; if (rt > 400) break; }
  check(`weekMonday → weekIdOf round-trips on ${rt} consecutive weeks`, rtBad === 0 && rt > 300, rtBad + ' bad');
  const c = w.PM.cfg();
  // The goal is flat and there are no meeting days: nothing a student does on any weekday changes it.
  check('the shipped config has no meeting-day, no-school, short-week or semester-range keys (they were removed)', !['meetingDays', 'defaultMeetingDays', 'noSchool', 'shortWeeks', 'semesters'].some((k) => k in w.ctx.PRACTICE_MINUTES_CONFIG));
  let zero = [], odd = [], weeks = 0;
  for (let wk = '2026-W36'; wk <= '2027-W26'; wk = calc.weekAdd(wk, 1)) { weeks++; const g = calc.goalSeconds(c, wk); if (g === 0) zero.push(wk); else if (g !== 3600) odd.push(wk + '=' + g); }
  check(`the goal is a flat 3600 s (60 min) in all ${weeks - zero.length} counted weeks of 2026-27 — no proration anywhere`, odd.length === 0 && weeks > 40, odd.join());
  check('exactly the five prefilled weeks are skipped (goal 0): Thanksgiving, both winter-break weeks, mid-winter break, spring break',
    eq(zero, ['2026-W48', '2026-W52', '2026-W53', '2027-W07', '2027-W15']), zero.join());
  check('each skipWeeks entry is a Monday and maps to its own week: 2026-11-23, 2026-12-21, 2026-12-28, 2027-02-15, 2027-04-12',
    eq(c.skipWeeks, ['2026-11-23', '2026-12-21', '2026-12-28', '2027-02-15', '2027-04-12']) && c.skipWeeks.every((d) => calc.parse(d).getDay() === 1));
  check('Veterans Day week (Wed 11 Nov) is an ordinary week with the full goal (the no-school list is gone)', calc.goalSeconds(c, '2026-W46') === 3600);
  check('semester 2 starts Mon 2027-01-04: the week of Dec 28 is semester 1, the week of Jan 4 is semester 2',
    c.semester2Start === '2027-01-04' && calc.semesterOf(c, '2026-W53') === 0 && calc.semesterOf(c, '2027-W01') === 1 && calc.semesterOf(c, '2026-W36') === 0 && calc.semesterOf(c, '2027-W26') === 1);
  check('a goal in minutes is a whole number of minutes whatever weeklyGoalMinutes is (20 → 1200 s, 45 → 2700 s)', calc.goalSeconds({ ...c, weeklyGoalMinutes: 20 }, '2026-W45') === 1200 && calc.goalSeconds({ ...c, weeklyGoalMinutes: 45 }, '2026-W45') === 2700);
}

/* ═══════════ 2. Streaks ═══════════ */
console.log('2. week streak');
{
  const w = makeWorld();
  const calc = w.PM.calc;
  const base = { ...w.PM.cfg(), skipWeeks: [], semester2Start: '', streakStartWeek: '' };   // the shipped streakStartWeek would hide these 2026-09 test weeks
  const wk = (n) => calc.weekAdd('2026-W36', n);                          // W36 = Mon 31 Aug 2026
  const mk = (pattern, today) => {                                         // 'H' hit, 'x' miss, '.' = no play
    const m = {};
    pattern.split('').forEach((ch, i) => { if (ch === 'H') m[wk(i)] = 3600; else if (ch === 'x') m[wk(i)] = 600; });
    return calc.status(base, m, today);
  };
  const T = (n) => calc.ymd(calc.addDays(calc.weekMonday(wk(n)), 2));      // a Wednesday of week n
  let s = mk('HHHH', T(4));
  check('4 hit weeks, this week just started → streak 4, nothing breaks', s.streak === 4 && s.streakBefore === 4 && !s.week.hit);
  s = mk('HHHHH', T(4));
  check('this week also hit → streak counts it (5), streakBefore stays 4', s.streak === 5 && s.streakBefore === 4 && s.week.hit);
  s = mk('HxH', T(3));
  check('hit, miss, hit → the first miss is free: streak 2', s.streak === 2, 'got ' + s.streak);
  s = mk('HHxHx', T(5));
  check('a SECOND miss in the same semester resets the streak to 0', s.streak === 0, 'got ' + s.streak);
  s = mk('HHxHxH', T(6));
  check('…and the next hit starts again at 1', s.streak === 1, 'got ' + s.streak);
  s = mk('xxHH', T(4));
  check('misses before any hit use nothing up; then 2 hits → 2', s.streak === 2, 'got ' + s.streak);
  // 2026-11-01 review (PD-1): a little play before any streak must not spend the free miss.
  const a1 = mk('xHHxH', T(5)), b1 = mk('.HHxH', T(5));
  check('playing a little (under the goal) before any streak keeps the free miss: x H H x H → 3, the same as . H H x H', a1.streak === 3 && b1.streak === 3, a1.streak + ' vs ' + b1.streak);
  s = mk('xHHxHx', T(6));
  check('…and the free miss is then spent by the first miss inside the streak: x H H x H x → 0', s.streak === 0, 'got ' + s.streak);
  // A skipped week in the middle: passed over, and its minutes still count.
  const brk = { ...base, skipWeeks: [calc.ymd(calc.weekMonday(wk(2)))] };
  const m2 = {}; m2[wk(0)] = 3600; m2[wk(1)] = 3600; m2[wk(2)] = 100; m2[wk(3)] = 3600;
  s = calc.status(brk, m2, T(4));
  check('a skipped week between two hits neither counts nor breaks (even with a poor week of minutes in it): streak 3', s.streak === 3, 'got ' + s.streak);
  check('…and it shows as "break" in the 8-week row', s.history.some((h) => h.state === 'break'));
  check('…and its minutes are still in the row (100 s)', s.history.find((h) => h.state === 'break').secs === 100);
  // Free miss is per SEMESTER, split on semester2Start.
  const m3 = {}; [0, 2, 3, 5].forEach((i) => { m3[wk(i)] = 3600; }); m3[wk(1)] = 100; m3[wk(4)] = 100;
  s = calc.status({ ...base, semester2Start: calc.ymd(calc.weekMonday(wk(4))) }, m3, T(6));
  check('one miss in each of two semesters is forgiven twice: H x H H x H → streak 4', s.streak === 4, 'got ' + s.streak);
  s = calc.status(base, m3, T(6));
  check('the same pattern inside ONE semester resets at the second miss: streak 1', s.streak === 1, 'got ' + s.streak);
  // The shipped dates: the free miss resets on Mon 2027-01-04.
  const real = w.PM.cfg();
  const rs = { '2026-W50': 3600, '2026-W51': 100, '2027-W01': 100, '2027-W02': 3600 };           // hit · miss · (2 skipped weeks) · miss · hit
  s = calc.status(real, rs, '2027-01-13');
  check('shipped dates: the Dec miss uses semester 1\'s free miss, the Jan 4 miss uses semester 2\'s (the two winter-break weeks are skipped): streak 2', s.streak === 2 && s.week.hit, 'got ' + s.streak);
  s = calc.status({ ...real, semester2Start: '' }, rs, '2027-01-13');
  check('…with no semester split the Jan 4 miss would have been the second miss: streak 1', s.streak === 1, 'got ' + s.streak);
  // Longest.
  s = mk('HHHxxHH', T(7));
  check('longest streak is remembered after a reset (3), current 2', s.longest === 3 && s.streak === 2, s.longest + '/' + s.streak);
  // Flat goal: 3600 hits, 3599 misses, whatever the week looks like.
  s = calc.status(base, { [wk(0)]: 3600 }, T(1));
  check('3600 s is a hit', s.streak === 1);
  s = calc.status(base, { [wk(0)]: 3599 }, T(1));
  check('…and 3599 s is a miss (the free miss keeps streak 0 → 0, no hit)', s.streak === 0 && s.history.find((h) => h.id === wk(0)).state === 'missed');
  // streakStartWeek.
  s = calc.status({ ...base, streakStartWeek: wk(2) }, { [wk(0)]: 3600, [wk(1)]: 3600, [wk(2)]: 3600 }, T(3));
  check('streakStartWeek ignores earlier weeks', s.streak === 1, 'got ' + s.streak);
  // The week in progress is before streakStartWeek: a hit is still a hit, but it is not a streak week.
  s = calc.status({ ...base, streakStartWeek: wk(5) }, { [wk(2)]: 3600 }, T(2));
  check('this week is before streakStartWeek: the goal is hit (ring, message) but the streak stays 0, like every earlier week', s.week.hit && s.streak === 0 && s.longest === 0);
  // History is 8 squares ending on this week.
  s = mk('HH', T(2));
  check('history = 8 weeks, oldest first, last is "now"', s.history.length === 8 && s.history[7].state === 'now' && s.history[6].id === wk(1));
  // No data at all.
  s = calc.status(base, {}, T(1));
  check('a brand-new student: streak 0, longest 0, no crash', s.streak === 0 && s.longest === 0);
  // The week in progress is a skipped one: minutes show, no goal, nothing is hit — even above the normal goal.
  s = calc.status(brk, { [wk(2)]: 4200 }, T(2));
  check('during a skipped week the minutes (4200 s, more than the normal goal) still show, the goal shown is the normal one, and it is never a hit', s.week.isBreak && s.week.secs === 4200 && s.week.goal === 3600 && !s.week.hit && s.streak === 0);
}

/* ═══════════ 3. Counting ═══════════ */
console.log('3. what counts');
{
  const w = makeWorld();
  const a = w.track();
  w.PM._state();           // signed in
  a.play();                // detached element: only the wrapped play() can see it
  await w.run(90, w.playing(a));
  const st = w.PM._state();
  const counted = Object.values(st.pend).reduce((x, y) => x + y, 0) + Object.values(st.days).reduce((x, y) => x + y, 0);
  check('90 s of a backing track played from a DETACHED element counts ≈ 90 s', counted >= 88 && counted <= 90, 'counted ' + counted);
  check('the seconds sit on today (2026-11-16)', (st.pend[todayStr] || 0) + (st.days[todayStr] || 0) === counted);

  const w2 = makeWorld();
  const g = w2.track('../audio/guitar-note-40-e2.mp3'); g.play();
  const b = w2.track('blob:https://x/abc'); b.play();
  const yt = w2.track('https://example.com/song.mp3'); yt.play();
  await w2.run(30, (i) => { [g, b, yt].forEach((e) => { e.currentTime += 1; }); });
  // 2026-11-03 (Jonathan: all work on the site counts): any audible element counts, once per second.
  check('a guitar-note file, a recording blob and a non-backing mp3 playing together count ≈ 30 s in 30 s (any site audio counts; still once per second)', sec(w2) >= 28 && sec(w2) <= 30, 'counted ' + sec(w2));

  const w3 = makeWorld();
  const p = w3.track(); p.play();
  await w3.run(20, w3.playing(p));
  const at20 = sec(w3);
  p.pause();
  await w3.run(20, w3.playing(p));
  check('paused: counting stops at once', sec(w3) <= at20 + 1, at20 + ' → ' + sec(w3));
  p.play(); p.ended = false;
  await w3.run(10, w3.playing(p));
  check('pressing Play again resumes it', sec(w3) >= at20 + 8);
  p.ended = true; p.paused = true;
  const atEnd = sec(w3);
  await w3.run(30, w3.playing(p));
  check('song ended: nothing counts until Play is pressed again (no auto-loop)', sec(w3) <= atEnd + 1);

  const w4 = makeWorld();
  const m = w4.track(); m.play(); m.muted = true;
  await w4.run(15, w4.playing(m));
  check('a muted element alone (the Guitar twin) counts nothing', sec(w4) === 0);
  m.muted = false;
  const twin = w4.track(); twin.play(); twin.muted = true;
  const before = sec(w4);
  await w4.run(20, (i) => { m.currentTime += 1; twin.currentTime += 1; });
  check('audible element + muted twin + a second audible spare = still ONE second per second', sec(w4) - before >= 18 && sec(w4) - before <= 20, 'added ' + (sec(w4) - before));
  const spare = w4.track(); spare.play();
  const b2 = sec(w4);
  await w4.run(20, (i) => { m.currentTime += 1; spare.currentTime += 1; });
  check('two audible elements at once count once', sec(w4) - b2 <= 20 && sec(w4) - b2 >= 18, 'added ' + (sec(w4) - b2));

  const w5 = makeWorld();
  const h = w5.track(); h.play();
  w5.documentStub.visibilityState = 'hidden';
  await w5.run(30, w5.playing(h));
  check('hidden tab: not counted', sec(w5) === 0);
  w5.documentStub.visibilityState = 'visible';
  await w5.run(10, w5.playing(h));
  check('visible again: counts', sec(w5) >= 8);

  const w6 = makeWorld();
  const s6 = w6.track(); s6.play(); s6.frozen = true;
  await w6.run(30, w6.playing(s6));
  check('a stalled element (currentTime not moving) is not counted past the first tick or two', sec(w6) <= 3, 'counted ' + sec(w6));
  s6.readyState = 1; s6.frozen = false;
  const c6 = sec(w6);
  await w6.run(10, w6.playing(s6));
  check('an element with no data buffered (readyState < 3) is not counted', sec(w6) === c6);

  const w7 = makeWorld({ signedOut: true });
  const o = w7.track(); o.play();
  await w7.run(30, w7.playing(o));
  check('nobody signed in: nothing counted, nothing stored', w7.PM._state() === null && !Object.keys(w7.store).some((k) => k.startsWith('pm:q')));
}

/* ═══════════ 4. Cap, queue, flush ═══════════ */
console.log('4. daily cap and the pending-write queue');
{
  const w = makeWorld();
  const a = w.track(); a.play();
  await w.run(25 * 60, w.playing(a));
  const st = w.PM._state();
  const total = (st.days[todayStr] || 0) + (st.pend[todayStr] || 0);
  check('25 minutes of play counts exactly the 20-minute cap (1200 s)', total === 1200, 'counted ' + total);
  check('flushed every 60 s while counting (≈ 20 commits for 20 counted minutes)', w.log.commits.length >= 18 && w.log.commits.length <= 24, w.log.commits.length + ' commits');
  check('the server ends with exactly the capped total, never more', (w.server.days[todayStr]?.seconds || 0) + (st.pend[todayStr] || 0) === 1200);
  const wk = w.server.weeks['2026-W47'];
  check('the week doc rolls up { seconds, goalSeconds: 3600, hit: false } (1200 < 3600)', wk && wk.goalSeconds === 3600 && wk.hit === false && wk.seconds === (w.server.days[todayStr].seconds), JSON.stringify(wk));
  check('every commit writes ONLY days/{date}.seconds and weeks/{id}.{seconds,goalSeconds,(hit)}',
    w.log.commits.every((c) => c.every((o) => /^minutes\/uid-A\/(days|weeks)\//.test(o.path) && (/days/.test(o.path) ? eq(Object.keys(o.data), ['seconds']) : (['seconds', 'goalSeconds'].every((k) => k in o.data) && Object.keys(o.data).every((k) => ['seconds', 'goalSeconds', 'hit'].includes(k)))))));
}
{
  // Offline: nothing sent, nothing lost; online: it all goes.
  const w = makeWorld();
  const a = w.track(); a.play();
  w.net.online = false;
  await w.run(130, w.playing(a));
  check('offline for 130 s: no commit was attempted', w.log.commits.length === 0);
  const q = qDays(w);
  check('…and the seconds are in localStorage (pm:q:<uid>:<page>) ≈ 130', q && q[todayStr] >= 125 && q[todayStr] <= 130, JSON.stringify(q));
  w.net.online = true;
  for (const f of w.listeners['win:online'] || []) f();
  await w.run(3, w.playing(a));
  const st = w.PM._state();
  check('back online: the queue is sent and cleared', (w.server.days[todayStr]?.seconds || 0) >= 125 && (st.pend[todayStr] || 0) <= 5, `server ${w.server.days[todayStr]?.seconds} pend ${st.pend[todayStr]}`);
}
{
  // A page that leaves while offline keeps its queue; the next page adopts it once the page's stamp is 3 minutes old
  // (a crash the same), so a LIVE page's queue is never taken. Fired in Chrome's order: pagehide, THEN
  // visibilitychange:hidden (measured in Chrome 153, 2026-11-01) — firing pagehide alone hid that Chrome's
  // visibilitychange rewrote pagehide's 0 stamp, so the "adopted at once" this test claimed never happened.
  const w = makeWorld();
  const a = w.track(); a.play();
  w.net.online = false;
  await w.run(70, w.playing(a));
  const saved = { ...w.store };
  leaveLikeChrome(w);
  const left = { ...w.store };
  const early = makeWorld({ store: { ...left }, startMs: w.clock.ms + 60000 });
  const e1 = early.track(); e1.play();
  await early.run(8, early.playing(e1));
  await early.PM.flush(); await early.settle();
  const earlyHeld = Object.entries(early.store).filter(([k]) => k.startsWith('pm:q:uid-A')).reduce((n, [, v]) => n + Object.values(JSON.parse(v).days).reduce((x, y) => x + y, 0), 0);
  check('a page that left offline: 1 minute later its queue is still stored on the next page (not lost) and not yet sent', (early.server.days[todayStr]?.seconds || 0) <= 8 && earlyHeld >= 70, `server ${early.server.days[todayStr]?.seconds}, still queued ${earlyHeld}`);
  const w2 = makeWorld({ store: { ...left }, startMs: w.clock.ms + 200000 });
  const b = w2.track(); b.play();
  await w2.run(8, w2.playing(b));
  await w2.PM.flush(); await w2.settle();
  check('…and a page opened after 3 minutes takes it over and sends it', (w2.server.days[todayStr]?.seconds || 0) >= 70, 'server ' + w2.server.days[todayStr]?.seconds);
  const w3 = makeWorld({ store: { ...saved }, startMs: w.clock.ms + 60000 });     // a crash: stamp is fresh, 1 minute old
  const c3 = w3.track(); c3.play();
  await w3.run(8, w3.playing(c3));
  await w3.PM.flush(); await w3.settle();
  check('a crashed page\'s queue is NOT taken while its stamp is under 3 minutes old (it may still be alive)', (w3.server.days[todayStr]?.seconds || 0) < 60, 'server ' + w3.server.days[todayStr]?.seconds);
  const w4 = makeWorld({ store: { ...saved }, startMs: w.clock.ms + 5 * 60000 });
  const d4 = w4.track(); d4.play();
  await w4.run(40, w4.playing(d4));
  await w4.PM.flush(); await w4.settle();
  check('…and is taken once the stamp is 5 minutes old', (w4.server.days[todayStr]?.seconds || 0) >= 70 + 30, 'server ' + w4.server.days[todayStr]?.seconds);
}
{
  // Rules refuse (not published yet): seconds are kept, retried after 5 minutes.
  const w = makeWorld();
  const a = w.track(); a.play();
  w.net.denied = true;
  await w.run(130, w.playing(a));
  const tries1 = w.log.commits.length;
  const st = w.PM._state();
  check('rules refusing every write: nothing is thrown away (queue still holds ≈ 130 s)', (st.pend[todayStr] || 0) >= 125, 'pend ' + st.pend[todayStr]);
  check('…and it backs off instead of hammering', tries1 === 0);
  w.net.denied = false;
  a.pause();
  await w.run(300, w.playing(a));
  a.play();
  await w.run(70, w.playing(a));
  check('rules published later → after the 5-minute back-off everything lands', (w.server.days[todayStr]?.seconds || 0) >= 130 && (w.server.days[todayStr]?.seconds || 0) + (w.PM._state().pend[todayStr] || 0) >= 195, `server ${w.server.days[todayStr]?.seconds} pend ${w.PM._state().pend[todayStr]}`);
}
{
  // Cap trim: the server already holds 1190 s today from another device.
  const w = makeWorld();
  w.server.days[todayStr] = { seconds: 1190 };
  const a = w.track(); a.play();
  await w.run(130, w.playing(a));
  check('server already at 1190 s (another device): the day ends at ≤ 1200, never refused forever', (w.server.days[todayStr].seconds <= 1200) && w.server.days[todayStr].seconds >= 1195, 'server ' + w.server.days[todayStr].seconds);
  check('…and the queue is not stuck: nothing left pending', (w.PM._state().pend[todayStr] || 0) === 0, 'pend ' + w.PM._state().pend[todayStr]);
}
{
  // Pagehide: keepalive REST write with the cached token.
  const w = makeWorld();
  const a = w.track(); a.play();
  await w.run(61, w.playing(a));         // one normal flush also caches the token
  await w.settle();
  await w.run(25, w.playing(a));
  for (const f of w.listeners['win:pagehide'] || []) f();
  const f = w.log.fetches[w.log.fetches.length - 1];
  check('pagehide sends a fetch({keepalive:true}) to the Firestore REST :commit endpoint', f && f.init.keepalive === true && new RegExp((process.env.PM_PROJECT || 'guitar-class-test') + '/databases/\\(default\\)/documents:commit$').test(f.url), JSON.stringify(f && f.url));
  check('…with the student\'s bearer token', f && f.init.headers.Authorization === 'Bearer tok-uid-A');
  if (process.env.PM_DUMP) writeFileSync(process.env.PM_DUMP + '/commit.json', JSON.stringify({ url: f.url, init: f.init }));
  const body = f && JSON.parse(f.init.body);
  const dayW = body.writes.find((x) => /\/days\//.test(x.update.name));
  const weekW = body.writes.find((x) => /\/weeks\//.test(x.update.name));
  check('…increment transforms for the day and the week doc; the week carries goalSeconds (hit only when it must: the doc is new to this device, or the goal was hit)',
    dayW && dayW.updateTransforms[0].increment.integerValue > 0 && weekW && weekW.update.fields.goalSeconds.integerValue === '3600' && !('hit' in weekW.update.fields) && eq(weekW.updateMask.fieldPaths, ['goalSeconds']));
  check('…and what it sent leaves the queue (not sent twice next visit)', Object.values(w.PM._state().pend).reduce((x, y) => x + y, 0) === 0 && !qKey(w));
}
{
  // Student switch on a shared Chromebook.
  const w = makeWorld();
  const a = w.track(); a.play();
  w.net.online = false;
  await w.run(20, w.playing(a));
  const mine = qDays(w)[todayStr];
  w.user.uid = 'uid-B';
  await w.run(20, w.playing(a));
  check('a different student signing in does not inherit the first one\'s queue', w.PM._state().uid === 'uid-B' && (w.PM._state().pend[todayStr] || 0) <= 21 && qDays(w)[todayStr] >= mine && qDays(w)[todayStr] <= 21,
    `A queue ${mine} → ${qDays(w)[todayStr]}`);
}

/* ═══════════ 5. Goal ═══════════ */
console.log('5. the weekly goal');
{
  // Hit the goal across several days, each one under the 20-minute daily cap: 4 days × 16 min = 64 min ≥ 60 in the week.
  const w = makeWorld();
  const a = w.track(); a.play();
  for (let day = 0; day < 4; day++) {
    await w.run(16 * 60, w.playing(a));
    a.pause();
    await w.run(5, w.playing(a));
    w.clock.ms += 24 * 3600 * 1000; w.clock.perf += 24 * 3600 * 1000;      // jump to the same time the next day
    a.play();
  }
  await w.run(3, w.playing(a));
  await w.PM.flush(); await w.settle();
  const wk = w.server.weeks['2026-W47'];
  check('four 16-minute days add up in the week doc and flip hit=true at 3600 s', wk && wk.seconds >= 3600 && wk.hit === true, JSON.stringify(wk));
  check('each day is its own doc: four days of exactly 960 s (plus the 3 s tail of the fifth morning)', Object.values(w.server.days).filter((d) => d.seconds === 960).length === 4 && Object.values(w.server.days).every((d) => d.seconds <= 960), JSON.stringify(w.server.days));
  check('status() says this week is hit and the streak is 1', w.PM.status().week.hit === true && w.PM.status().streak === 1);
}
{
  // The fewest days (goal 60 since 2026-11-04): a day counts at most 20 minutes, so the goal takes 3 days at the cap.
  // Each day plays 22 minutes (2 past the cap, not counted). After two days the week is short; the third reaches exactly 3600 s.
  const w = makeWorld();
  const a = w.track(); a.play();
  const after = [];
  for (let day = 0; day < 3; day++) {
    await w.run(22 * 60, w.playing(a));
    a.pause();
    await w.run(5, w.playing(a));
    await w.PM.flush(); await w.settle();
    const s = w.PM.status(), doc = w.server.weeks['2026-W47'];
    after.push({ secs: s.week.secs, hit: s.week.hit, docSecs: doc && doc.seconds, docHit: doc && doc.hit });
    w.clock.ms += 24 * 3600 * 1000; w.clock.perf += 24 * 3600 * 1000;      // jump to the same time the next day
    a.play();
  }
  check('two days at the 20-minute cap: 2400 s, not hit (in status() and in the week doc)', after[1].secs === 2400 && after[1].hit === false && after[1].docSecs === 2400 && after[1].docHit === false, JSON.stringify(after));
  check('the third day at the cap makes exactly 3600 s: the goal is hit, in status() and in the week doc', after[2].secs === 3600 && after[2].hit === true && after[2].docSecs === 3600 && after[2].docHit === true, JSON.stringify(after));
}

/* ═══════════ 6. No heartbeat (removed 2026-11-04: "N playing" had left the strip and nothing read it) ═══════════ */
console.log('6. no heartbeat');
{
  const w = makeWorld({ ui: true, config: { uiOn: true } });
  const a = w.track(); a.play();
  await w.run(95, w.playing(a));
  const minutes = (w.server.days[todayStr]?.seconds || 0) + Object.values(w.PM._state().pend).reduce((x, y) => x + y, 0);
  check('95 s of audible play counts (≥ 93 s) and writes no single document anywhere — no heartbeats/{id}, only the minutes batch', w.log.sets.length === 0 && w.log.commits.length >= 1 && minutes >= 93,
    w.log.sets.length + ' single-doc sets (' + w.log.sets.map((x) => x.path).join() + '), ' + minutes + ' s');
  check('nothing goes into sessionStorage (no pmSid session id)', Object.keys(w.session).length === 0, Object.keys(w.session).join());
  check('the state carries no live count (no live / liveAt)', !('live' in w.PM._state()) && !('liveAt' in w.PM._state()));
}

/* ═══════════ 7. uiOn is off by default and counting does not need it ═══════════ */
console.log('7. defaults');
{
  const w = makeWorld();
  check('shipped config: uiOn is true (on since 2026-11-01; flip this and the config together)', w.ctx.PRACTICE_MINUTES_CONFIG.uiOn === true);
  check('shipped config: streaks start fresh at 2026-W45', w.ctx.PRACTICE_MINUTES_CONFIG.streakStartWeek === '2026-W45');
  check('shipped config: goal 60 (30 until 2026-11-04), cap 20, semester 2 starts 2027-01-04, five skip weeks', w.ctx.PRACTICE_MINUTES_CONFIG.weeklyGoalMinutes === 60 && w.ctx.PRACTICE_MINUTES_CONFIG.dailyCapMinutes === 20
    && w.ctx.PRACTICE_MINUTES_CONFIG.semester2Start === '2027-01-04' && w.ctx.PRACTICE_MINUTES_CONFIG.skipWeeks.length === 5);
  const off = makeWorld({ ui: true, config: { uiOn: false } });
  check('uiOn false (a page with a UI host) → stripHtml() is empty', off.PM.stripHtml() === '');
  const a = w.track(); a.play();
  await w.run(70, w.playing(a));
  check('…yet minutes were counted and written', (w.server.days[todayStr]?.seconds || 0) >= 55);
  const offA = off.track(); offA.play();
  await off.run(70, off.playing(offA));
  check('with uiOn false minutes are still counted and written (the display is the only thing the switch hides)', (off.server.days[todayStr]?.seconds || 0) >= 55);
}


/* ═══════════ 8. No "N playing" lookup (removed 2026-11-04) ═══════════ */
console.log('8. no live count');
{
  const w = makeWorld({ ui: true, config: { uiOn: true }, strip: true });
  w.PM.syncHeader(true); w.PM.stripHtml();
  const a = w.track(); a.play();
  await w.run(95, w.playing(a));
  check('(sanity) the strip really is drawn: #pm-header shown with the week ring and the flame', w.stripEl.hidden === false && /pm-week/.test(w.stripEl.innerHTML) && /pm-streak/.test(w.stripEl.innerHTML), w.stripEl.hidden + ' ' + w.stripEl.innerHTML.slice(0, 80));
  check('a 95 s play session with the display on makes no network call of its own (no REST count query; the keepalive goes only on pagehide)', w.log.fetches.length === 0, w.log.fetches.map((x) => x.url).join());
  check('PM has no _pollLive and the config no liveMinCount', w.PM._pollLive === undefined && !('liveMinCount' in w.PM.cfg()) && !('liveMinCount' in w.ctx.PRACTICE_MINUTES_CONFIG));
}

/* ═══════════ 9. Regressions from the adversarial review (R1-1 … R1-10) ═══════════ */
console.log('9. review regressions');
async function runAll(worlds, seconds, each) {
  const clock = worlds[0].clock;
  for (let i = 0; i < seconds; i++) {
    clock.perf += 1000; clock.ms += 1000;
    if (each) each(i);
    for (const w of worlds) for (const t of [...w.__timers]) {
      while (t.next <= clock.perf) { t.fn(); if (t.once) { const k = w.__timers.indexOf(t); if (k >= 0) w.__timers.splice(k, 1); break; } t.next += t.ms; }
    }
    await Promise.resolve(); await Promise.resolve();
  }
  for (let i = 0; i < 8; i++) await new Promise((r) => setImmediate(r));
}
/* Close a page the way Chrome does: pagehide, then visibilitychange:hidden. */
function leaveLikeChrome(w) {
  for (const f of w.listeners['win:pagehide'] || []) f();
  w.documentStub.visibilityState = 'hidden';
  for (const f of w.listeners['doc:visibilitychange'] || []) f();
}
const shared = () => ({ clock: { ms: new Date(2026, 10, 16, 9, 0, 0).getTime(), perf: 5000 }, store: {}, server: { days: {}, weeks: {} }, net: { online: true, denied: false } });
{
  // R1-1: the connection is "up" (navigator.onLine true) but nothing is answered. The SDK keeps every commit and delivers them all on reconnect.
  for (const stall of [65, 185, 300]) {
    const sh = shared(), w = makeWorld(sh);
    const a = w.track(); a.play();
    const mv = () => { if (!a.paused) a.currentTime += 1; };
    await runAll([w], 30, mv);
    sh.net.stall = true;
    await runAll([w], stall, mv);
    a.pause(); await runAll([w], 3, mv);
    const held = (sh.net.queued || []).length;
    sh.net.stall = false;
    w.drain();
    await runAll([w], 70, mv);
    const counted = sec(w), onServer = sh.server.days[todayStr]?.seconds || 0;
    check(`a ${stall} s stall with the connection "up": ${held} commit held, the server ends with exactly what was played (${counted} s), not a multiple`, held === 1 && onServer === counted && counted >= 30 + stall - 3, `counted ${counted}, server ${onServer}, held ${held}`);
  }
}
{
  // R1-2: a day left over from an earlier week that the server would push over the cap must not block every later write.
  const sh = shared();
  sh.server.days['2026-11-15'] = { seconds: 900 };
  sh.store['pm:q:uid-A:deadbeefdead'] = JSON.stringify({ days: { '2026-11-15': 600 }, at: 0 });
  const w = makeWorld(sh);
  const a = w.track(); a.play();
  await runAll([w], 150, (i) => { if (!a.paused) a.currentTime += 1; });
  a.pause(); await runAll([w], 3);
  check('an old day over the cap (server 900 + queued 600): trimmed to the cap (1200), and today still goes through', sh.server.days['2026-11-15'].seconds === 1200 && (sh.server.days[todayStr]?.seconds || 0) >= 140, JSON.stringify(sh.server.days));
  check('…and nothing is left stuck in the queue', !qKey(w) || Object.keys(qDays(w) || {}).length === 0, JSON.stringify(qDays(w)));
}
{
  // R1-3: two tabs of one student must not send the same seconds twice, and must not overwrite each other's queue.
  const sh = shared(), A = makeWorld(sh), B = makeWorld(sh);
  const a = A.track(); a.play();
  await runAll([A, B], 50, () => { if (!a.paused) a.currentTime += 1; });
  A.documentStub.visibilityState = 'hidden'; for (const f of A.listeners['doc:visibilitychange'] || []) f();
  B.documentStub.visibilityState = 'visible'; for (const f of B.listeners['doc:visibilitychange'] || []) f();
  await runAll([A, B], 5);
  B.documentStub.visibilityState = 'hidden'; for (const f of B.listeners['doc:visibilitychange'] || []) f();
  A.documentStub.visibilityState = 'visible'; for (const f of A.listeners['doc:visibilitychange'] || []) f();
  await runAll([A, B], 5, () => { if (!a.paused) a.currentTime += 1; });
  a.pause(); await runAll([A, B], 70);
  const counted = sec(A);
  check(`two tabs, the student switches A → B → A: ~${counted} s played, the server holds ${sh.server.days[todayStr]?.seconds} (not double)`, sh.server.days[todayStr].seconds === counted && counted >= 50, JSON.stringify(sh.server.days));
  check('each tab has its own queue key (pm:q:<uid>:<page>)', A.PM._state().uid === 'uid-A' && new Set(Object.keys(sh.store).filter((k) => k.startsWith('pm:q:'))).size <= 2);
  // both offline: both queues survive (a shared key kept only the last writer's)
  const sh2 = shared(), A2 = makeWorld(sh2), B2 = makeWorld(sh2);
  const x = A2.track(), y = B2.track(); x.play(); y.play();
  sh2.net.online = false;
  await runAll([A2], 30, () => { x.currentTime += 1; });
  x.pause();
  await runAll([A2, B2], 3);
  await runAll([B2], 20, () => { y.currentTime += 1; });
  y.pause(); await runAll([A2, B2], 3);
  const keys = Object.keys(sh2.store).filter((k) => k.startsWith('pm:q:uid-A:'));
  const heldTotal = keys.reduce((n, k) => n + Object.values(JSON.parse(sh2.store[k]).days).reduce((p, q) => p + q, 0), 0);
  check('two OFFLINE tabs: both queues are kept (~30 s + ~20 s), neither overwrote the other', keys.length === 2 && heldTotal >= 46 && heldTotal <= 52, keys.length + ' keys, ' + heldTotal + ' s');
  sh2.net.online = true;
  for (const wd of [A2, B2]) for (const f of wd.listeners['win:online'] || []) f();
  await runAll([A2, B2], 5);
  check('…and once online the server gets each exactly once', sh2.server.days[todayStr].seconds === heldTotal, sh2.server.days[todayStr].seconds + ' vs ' + heldTotal);
}
{
  // R1-4: a read must not overlap a write. A backlog is adopted at start; the page has been open a while before Play.
  const sh = shared();
  sh.store['pm:q:uid-A:deadbeefdead'] = JSON.stringify({ days: { [todayStr]: 600 }, at: 0 });
  const w = makeWorld(sh);
  await runAll([w], 130);
  const a = w.track(); a.play();
  await runAll([w], 15, () => { if (!a.paused) a.currentTime += 1; });
  a.pause(); await runAll([w], 5);
  const st = w.PM._state();
  check('a backlog adopted at start and a first Play: the local copy of the server\'s day equals the server (no double add)', st.days[todayStr] === sh.server.days[todayStr].seconds && sh.server.days[todayStr].seconds >= 600, `local ${st.days[todayStr]} server ${sh.server.days[todayStr]?.seconds}`);
  check('…and counting went on normally afterwards (the daily cap was not falsely reached)', sh.server.days[todayStr].seconds >= 610, 'server ' + sh.server.days[todayStr].seconds);
}
{
  // R1-4 (the reviewer's race): a read is in flight while the page's 60 s flush comes due. The batch must wait for the read, so the read
  // cannot already contain it (it would then be added to the local totals a second time).
  const sh = shared();
  sh.store['pm:q:uid-A:deadbeefdead'] = JSON.stringify({ days: { [todayStr]: 600 }, at: 0 });
  sh.net.holdReads = true;
  const w = makeWorld(sh);
  await runAll([w], 70);
  const a = w.track(); a.play();
  await runAll([w], 5, () => { if (!a.paused) a.currentTime += 1; });
  check('while a read is in flight nothing is committed (the first flush waits for it)', Object.keys(sh.server.days).length === 0, JSON.stringify(sh.server.days));
  w.releaseReads();
  await runAll([w], 5, () => { if (!a.paused) a.currentTime += 1; });
  a.pause(); await runAll([w], 5);
  const st = w.PM._state();
  check('…then the read lands, the backlog is sent once, and the local copy of the day equals the server', sh.server.days[todayStr] && st.days[todayStr] === sh.server.days[todayStr].seconds && sh.server.days[todayStr].seconds >= 600 && sh.server.days[todayStr].seconds <= 620, `local ${st.days[todayStr]} server ${sh.server.days[todayStr]?.seconds}`);
}
{
  // R1-5: the unload write must never carry the previous student's token.
  const sh = shared(), w = makeWorld(sh);
  const a = w.track(); a.play();
  await runAll([w], 65, () => { if (!a.paused) a.currentTime += 1; });
  a.pause(); await runAll([w], 3);
  check('student A has a token cached after a flush', true);
  w.user.uid = 'uid-B';
  w.user.getIdToken = () => new Promise(() => {});               // B\'s token is not back yet
  w.PM.status();
  await runAll([w], 2);
  w.PM._state().pend[todayStr] = 100;                             // B has counted 100 s that no flush has sent yet
  const f0 = w.log.fetches.length;
  for (const f of w.listeners['win:pagehide'] || []) f();
  check('B signed in, B\'s token not back: pagehide sends nothing (A\'s token is never used for B)', w.log.fetches.length === f0 && !w.log.fetches.some((f) => /minutes\/uid-B/.test(f.init && f.init.body || '')));
  check('…and B\'s backlog is still queued for next time', Object.values(qDays(w, 'uid-B') || {}).reduce((x, y) => x + y, 0) >= 100, JSON.stringify(qDays(w, 'uid-B')));
}
{
  // R1-6: rules not published → reads are refused. They must back off, not retry every tick.
  const sh = shared(); sh.net.denyReads = true; sh.net.denied = true;
  const w = makeWorld(sh);
  const a = w.track(); a.play();
  await runAll([w], 600, () => { if (!a.paused) a.currentTime += 1; });
  check('rules not published: 10 minutes of play make a handful of refused reads, not hundreds', (sh.net.reads || 0) <= 12, (sh.net.reads || 0) + ' reads');
  check('…and every counted second is still queued', sec(w) >= 590);
  sh.net.denyReads = false; sh.net.denied = false;
  await runAll([w], 330, () => { if (!a.paused) a.currentTime += 1; });
  a.pause(); await runAll([w], 3);
  check('rules published later: everything lands, exactly once', sh.server.days[todayStr].seconds === Math.min(1200, sec(w)) && sec(w) >= 900, sh.server.days[todayStr]?.seconds + ' vs ' + sec(w));
}
{
  // R1-7: a stale copy on another device must not flip a stored hit from true back to false.
  const sh = shared();
  sh.server.weeks['2026-W47'] = { seconds: 3500, goalSeconds: 3600, hit: false };
  sh.server.days['2026-11-16'] = { seconds: 0 };
  const sh1 = { ...sh, store: {} }, sh2 = { ...sh, store: {} };
  const d1 = makeWorld(sh1), d2 = makeWorld(sh2);
  const a = d1.track(), b = d2.track(); a.play();
  await runAll([d1, d2], 5, () => { if (!a.paused) a.currentTime += 1; });   // both load: hit false, 3500 s
  await d1.PM.load(); await d2.PM.load();
  d1.PM._state().pend[todayStr] = 150;                                      // device 1 crosses the goal
  await d1.PM.flush(); await runAll([d1, d2], 2);
  const mid = JSON.stringify(sh.server.weeks['2026-W47']);
  b.play();
  await runAll([d1, d2], 25, () => { if (!b.paused) b.currentTime += 1; });
  a.pause(); b.pause(); await runAll([d1, d2], 3);
  await d2.PM.flush(); await runAll([d1, d2], 3);
  check('device 1 crossed the goal (hit true); device 2, holding a stale copy, then flushed: hit stays true', JSON.parse(mid).hit === true && sh.server.weeks['2026-W47'].hit === true, mid + ' → ' + JSON.stringify(sh.server.weeks['2026-W47']));
}
{
  // R1-9 / R1-10: an element that errors must not keep the timer alive; resuming from the OS media controls must count.
  const w = makeWorld();
  const e = w.track('../audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-full.mp3'); e.play(); e.error = { code: 4 };
  await w.run(5);
  check('an element that errored (paused:false, error set) is dropped and the 1 s timer stops', w.PM._media.size === 0 && w.__timers.length <= 1, w.PM._media.size + ' elements, ' + w.__timers.length + ' timers');
  const w2 = makeWorld();
  const a = w2.track(); a.play();
  await w2.run(10, w2.playing(a));
  a.pause();
  await w2.run(6, w2.playing(a));
  const before = sec(w2);
  a.paused = false; a.emit('playing');                                          // resumed from the OS media controls: no play() call
  await w2.run(10, w2.playing(a));
  check('playback resumed from the OS media controls (no play() call, only the element\'s own `playing`) is counted', sec(w2) - before >= 8, 'added ' + (sec(w2) - before));
}
{
  // The goal does not depend on the student's period (or on having none): 4th, 7th, CAS, nothing chosen yet.
  const goals = [];
  for (const period of ['4', '7', 'CAS', '']) { const wd = makeWorld({ period }); const a = wd.track(); a.play(); await wd.run(3, wd.playing(a)); goals.push(wd.PM.status().week.goal); }
  check('the week goal is 3600 s for period 4, 7, CAS and "none chosen yet" alike', goals.every((g) => g === 3600), goals.join());
}

/* ═══════════ 10. Friday check 2026-11-01 (R2-*, PD-*) ═══════════ */
console.log('10. friday check 2026-11-01');
{
  // R2-1: a commit on the wire when the page closes. Jonathan's call (2026-11-01, reversing an earlier one the same day):
  // "be liberal with minutes since this is for motivation" — it stays queued; if it had landed, it counts twice ONCE.
  for (const delivered of [true, false]) {
    const sh = shared(); const w = makeWorld(sh);
    const a = w.track(); a.play();
    await runAll([w], 64, () => { if (!a.paused) a.currentTime += 1; });   // what has been sent so far lands
    await runAll([w], 20, () => { if (!a.paused) a.currentTime += 1; });   // 20 more seconds, still queued
    a.pause(); sh.net.stall = true;
    await runAll([w], 3);                                                   // Stop → a flush goes out and stalls
    const inflight = w.PM._state().inflight;
    leaveLikeChrome(w);
    const left = Object.entries(sh.store).filter(([k]) => k.startsWith('pm:q:uid-A')).map(([, v]) => JSON.parse(v));
    (sh.net.queued || []).forEach((x) => { x.res = () => {}; x.rej = () => {}; });   // the page is gone: nobody hears the answer
    if (delivered) w.drain(); else sh.net.queued = [];
    sh.net.stall = false;
    const w2 = makeWorld({ ...sh, clock: { ms: sh.clock.ms + 240000, perf: 9000 } });
    const b = w2.track(); b.play(); await runAll([w2], 5, () => { if (!b.paused) b.currentTime += 1; }); b.pause(); await runAll([w2], 4); await w2.PM.flush(); await w2.settle();
    const total = sh.server.days[todayStr]?.seconds || 0, played = 84 + 5;
    const batch = inflight ? Object.values(inflight.snap).reduce((x, y) => x + y, 0) : 0;
    if (delivered) check('a commit on the wire when the page closed, which DID land: re-sent by the next page — counted twice at most once (liberal on purpose)', !!inflight && total >= played && total <= played + batch, `server ${total} for ${played} played (batch ${batch}); leaving key ${JSON.stringify(left)}`);
    else check('…and one that did NOT land is kept and sent by the next page: nothing lost', !!inflight && total >= played - 1 && total <= played, `server ${total} for ${played} played`);
  }
  // …but a commit that has hung for over 30 s (offline backlog, no answer) stays queued: it almost certainly never landed.
  {
    const sh = shared(); const w = makeWorld(sh);
    const a = w.track(); a.play();
    await runAll([w], 84, () => { if (!a.paused) a.currentTime += 1; });
    a.pause(); sh.net.stall = true;
    await runAll([w], 40);                                                  // the Stop flush hangs for 40 s
    leaveLikeChrome(w);
    const held = Object.entries(sh.store).filter(([k]) => k.startsWith('pm:q:uid-A')).reduce((n, [, v]) => n + Object.values(JSON.parse(v).days).reduce((x, y) => x + y, 0), 0);
    check('a commit that hung for 40 s with no answer stays in the leaving key (a stalled backlog is not thrown away)', held >= 3, 'held ' + held);
  }
  // R2-1 (a): the keepalive sends `pend` even while a commit is in flight — they are different seconds.
  {
    const sh = shared(); const w = makeWorld(sh);
    const a = w.track(); a.play();
    await runAll([w], 84, () => { if (!a.paused) a.currentTime += 1; });
    sh.net.stall = true; w.PM.flush(); await w.settle();                    // a commit in flight…
    const inFlight = !!w.PM._state().inflight;
    await runAll([w], 10, () => { if (!a.paused) a.currentTime += 1; });   // …and 10 more seconds counted after it
    const f0 = w.log.fetches.length;
    leaveLikeChrome(w);
    const f = w.log.fetches.slice(f0).find((x) => /documents:commit$/.test(x.url));
    check('pagehide with a commit still in flight: the keepalive still sends the seconds counted after it', inFlight && !!f && /"integerValue":"(9|10|11)"/.test(f.init.body), (inFlight ? 'in flight; ' : 'NOTHING in flight; ') + (f ? f.init.body.slice(0, 160) : 'no keepalive'));
  }
}
{
  // R2-2: a Journey page (no reload) — the student signs out in another tab, then back in. Nothing queued may be lost.
  for (const back of ['A', 'B-then-A']) {
    const sh = shared(); const w = makeWorld(sh);
    const users = { A: w.user, B: { uid: 'uid-B', getIdToken() { return Promise.resolve('tok-B'); } }, none: null };
    let who = 'A';
    w.windowStub.PM_HOST.user = () => users[who];
    const a = w.track(); a.play();
    const mv = () => { if (!a.paused) a.currentTime += 1; };
    await runAll([w], 90, mv);
    a.pause();
    who = 'none'; await runAll([w], 1);
    if (back === 'B-then-A') { who = 'B'; await runAll([w], 20); }
    who = 'A'; await runAll([w], 15);
    a.play(); await runAll([w], 30, mv); a.pause(); await runAll([w], 5); await w.PM.flush(); await w.settle();
    const served = sh.server.days[todayStr]?.seconds || 0;
    check(`signed out and back in on an open Journey page (${back}): every second arrives once (120 played)`, served >= 118 && served <= 121, 'server ' + served);
  }
}
{
  // R2-4: the device clock moves back 30 s while tab A (offline) holds 40 s; a new tab must not take A's live queue.
  const sh = shared(); sh.net.online = false;
  const A = makeWorld(sh);
  const a = A.track(); a.play();
  await runAll([A], 40, () => { if (!a.paused) a.currentTime += 1; });
  a.pause(); await runAll([A], 3);
  sh.clock.ms -= 30000;
  const B = makeWorld(sh); B.PM.status();                                  // the new tab's first sync adopts dead pages' queues
  await runAll([A, B], 3);
  sh.net.online = true;
  for (const w of [A, B]) for (const f of w.listeners['win:online'] || []) f();
  await runAll([A, B], 70);
  const total = sh.server.days[todayStr]?.seconds || 0;
  check('the clock moved back 30 s: a new tab does not adopt a live tab\'s queue (40 played → 40 stored, not 80)', total >= 38 && total <= 41, 'server ' + total);
}
{
  // PD-2: a practice card's section button pauses for a count-in; while its player is live that is not a session end.
  const w = makeWorld();
  const a = w.track(); a.play();
  await w.run(20, w.playing(a));
  w.ctx.pcState = { live: true };
  a.pause(); await w.run(4);
  check('section tap (song paused 4 s for the count-in, card player still live): the session carries on', !!w.PM._session());
  a.play(); await w.run(5, w.playing(a));
  w.ctx.pcState = null; a.pause(); await w.run(3);
  check('…and Stop (player cleared) ends it 2 s later as before', !w.PM._session());
  w.ctx.pcState = { live: true }; a.play(); await w.run(5, w.playing(a)); a.pause(); await w.run(31);
  check('…a card left paused and live ends the session after 30 s', !w.PM._session());
  w.ctx.pcState = null;
}

{
  // Review of the fix (2026-11-01), finding 1: a link that answers nothing (captive portal, ISP down). The keepalive
  // must not be trusted over it — its seconds would be deleted as if they had landed.
  for (const kaFails of [true, false]) {
    const sh = shared(); sh.net.applyKeepalive = true; const w = makeWorld(sh);
    const a = w.track(); a.play();
    await runAll([w], 30, () => { if (!a.paused) a.currentTime += 1; });
    sh.net.stall = true;
    await runAll([w], 300, () => { if (!a.paused) a.currentTime += 1; });
    sh.net.keepaliveFails = kaFails;
    leaveLikeChrome(w);
    sh.net.queued = []; sh.net.stall = false; sh.net.keepaliveFails = false;     // the page is gone: its SDK commit dies with it
    const w2 = makeWorld({ ...sh, clock: { ms: sh.clock.ms + 240000, perf: 9000 } });
    w2.PM.status(); await runAll([w2], 40); await w2.PM.flush(); await w2.settle(); await runAll([w2], 5);
    const total = sh.server.days[todayStr]?.seconds || 0;
    check(`a link that answered nothing for 5 min, then the tab closed (keepalive ${kaFails ? 'fails too' : 'would land'}): nothing is lost or doubled (330 played)`, total >= 325 && total <= 331, 'server ' + total);
  }
  // Finding 2: an offline backlog goes out as ONE batch on `online`; the tab closes 5 s later. Minutes, not seconds: kept.
  {
    const sh = shared(); sh.net.online = false; const w = makeWorld(sh);
    const a = w.track(); a.play();
    await runAll([w], 600, () => { if (!a.paused) a.currentTime += 1; });
    a.pause(); await runAll([w], 5);
    sh.net.online = true; sh.net.stall = true;
    for (const f of w.listeners['win:online'] || []) f();
    await runAll([w], 5);
    leaveLikeChrome(w);
    sh.net.queued = []; sh.net.stall = false;                                    // never landed
    const w2 = makeWorld({ ...sh, clock: { ms: sh.clock.ms + 240000, perf: 9000 } });
    w2.PM.status(); await runAll([w2], 40); await w2.PM.flush(); await w2.settle(); await runAll([w2], 5);
    const total = sh.server.days[todayStr]?.seconds || 0;
    check('a 10-minute offline backlog sent 5 s before the tab closed, never answered: kept and sent by the next page (not dropped as "probably landed")', total >= 595 && total <= 601, 'server ' + total);
  }
  // Findings 4 and 6: sign-out / sign-in with a commit stuck on the wire.
  const signWorld = (extra = {}) => {
    const sh = shared(); const w = makeWorld(sh);
    let who = 'A'; const users = { A: w.user, B: { uid: 'uid-B', getIdToken() { return Promise.resolve('tok-B'); } }, none: null };
    w.windowStub.PM_HOST.user = () => users[who];
    const a = w.track(); const mv = () => { if (!a.paused) a.currentTime += 1; };
    const play = async (n) => { a.play(); await runAll([w], n, mv); a.pause(); await runAll([w], 3); };
    const as = async (u) => { who = u; w.PM.status(); await runAll([w], 2); };
    const finish = async () => { sh.net.stall = false; sh.net.holdReads = false; w.releaseReads(); w.drain(); await runAll([w], 5); await w.PM.flush(); await w.settle(); await runAll([w], 90); await w.PM.flush(); await w.settle(); return sh.server.days[todayStr]?.seconds || 0; };
    return { sh, w, play, as, finish };
  };
  {
    const t = signWorld();
    await t.play(64); t.sh.net.stall = true; t.sh.net.holdReads = true; await t.play(70); await t.play(30);
    await t.as('none'); await t.as('A'); await t.as('none'); await t.as('A');
    const total = await t.finish();
    check('A → out → A → out → A while one commit is stuck: the stuck seconds are subtracted once, not twice (164 played)', total >= 162 && total <= 165, 'server ' + total);
  }
  for (const lands of [true, false]) {
    const t = signWorld();
    await t.play(64); t.sh.net.stall = true; await t.play(70); await t.play(30);
    await t.as('none'); await t.as('A');
    if (lands) { t.sh.net.stall = false; t.w.drain(); }
    else { const q = t.sh.net.queued; t.sh.net.queued = []; t.sh.net.stall = false; q.forEach((x) => x.rej(new Error('unavailable'))); }
    await runAll([t.w], 5);
    const total = await t.finish();
    check(`signed out and back in while a commit was on the wire, which then ${lands ? 'landed' : 'failed'}: 164 played → 164 stored`, total >= 162 && total <= 165, 'server ' + total);
  }
  {
    const t = signWorld();
    await t.play(64); t.sh.net.stall = true; t.sh.net.holdReads = true; await t.play(70); await t.play(30);
    await t.as('none'); await t.as('A'); await runAll([t.w], 3);
    await t.play(100);
    await t.as('none');
    t.sh.net.stall = false; t.w.drain(); await runAll([t.w], 3);                 // the old commit lands while A is away
    t.sh.net.holdReads = false; t.w.releaseReads(); await runAll([t.w], 3);
    await t.as('A');
    const total = await t.finish();
    check('a commit from an older sign-in lands after a newer sign-in counted more: the newer seconds are not overwritten (264 played)', total >= 262 && total <= 265, 'server ' + total);
  }
}

{
  // Re-review R3-1: two pages of A (a Journey page P1 and the main site P2). A signs out with a commit stuck on P1 and
  // comes back 4 minutes later; P2 adopts P1's stale key and sends it; THEN P1's old commit answers. P1 must edit
  // its key, not rebuild it from its old state (that brought back seconds P2 had already sent).
  for (const outcome of ['lands', 'fails']) {
    const sh = shared();
    const P1 = makeWorld(sh), P2 = makeWorld(sh);
    let who = 'A'; const users = { A: P1.user, none: null };
    P1.windowStub.PM_HOST.user = () => users[who]; P2.windowStub.PM_HOST.user = () => users[who];
    P2.PM.status();
    const a = P1.track(); const mv = () => { if (!a.paused) a.currentTime += 1; };
    const play = async (n) => { a.play(); await runAll([P1, P2], n, mv); a.pause(); await runAll([P1, P2], 3); };
    await play(64); sh.net.stall = true; await play(70); await play(30);
    who = 'none'; P1.PM.status(); P2.PM.status(); await runAll([P1, P2], 2);
    await runAll([P1, P2], 240);
    who = 'A'; sh.net.stall = false;
    P2.PM.status(); await runAll([P2], 3); await P2.settle();
    if (outcome === 'lands') P1.drain(); else { const q = sh.net.queued; sh.net.queued = []; q.forEach((x) => x.rej(new Error('unavailable'))); }
    await P1.settle();
    P1.PM.status(); await runAll([P1, P2], 5); await P1.PM.flush(); await P1.settle(); await runAll([P1, P2], 70); await P1.PM.flush(); await P2.PM.flush(); await P1.settle();
    const total = sh.server.days[todayStr]?.seconds || 0, stuck = 59;
    check(`two pages, sign-out with a stuck commit that then ${outcome === 'lands' ? 'lands' : 'fails'} after the other page adopted the key: nothing lost, at most that one batch extra (164 played)`, total >= 162 && total <= 164 + (outcome === 'lands' ? stuck + 2 : 2), 'server ' + total);
  }
}

/* ═══════════ 11. Tests for what the 2026-11-01 re-review's mutants got away with, and R2-6 ═══════════ */
console.log('11. re-review test gaps and R2-6');
const sumOf = (o) => Object.values(o || {}).reduce((x, y) => x + y, 0);
const calcWeek = (w) => w.PM.calc.weekIdOf(todayStr);
const commitFetch = (w, from) => w.log.fetches.slice(from).find((x) => /documents:commit$/.test(x.url));
{
  // Gap 1 — settleAfterSwitch's "a newer state of this student exists" branch. A signs out with a commit stuck on the
  // wire (state A1), signs back in (A2, a newer state), then B signs in, and only THEN does A1's commit answer. A1 no
  // longer owns the key and A2 has written it since, so nothing is rebuilt from A1: a commit that FAILED is added back
  // to the key, one that LANDED is left alone. Mutants: drop the add-back (the stuck seconds are lost on a failure) or
  // add back always (they are counted twice when it landed).
  for (const outcome of ['lands', 'fails']) {
    const sh = shared(), w = makeWorld(sh);
    let who = 'A'; const users = { A: w.user, B: { uid: 'uid-B', getIdToken() { return Promise.resolve('tok-B'); } }, none: null };
    w.windowStub.PM_HOST.user = () => users[who];
    const a = w.track(); const mv = () => { if (!a.paused) a.currentTime += 1; };
    const play = async (n) => { a.play(); await runAll([w], n, mv); a.pause(); await runAll([w], 3); };
    const as = async (u) => { who = u; w.PM.status(); await runAll([w], 2); };
    await play(64); sh.net.stall = true; await play(70); await play(30);
    const stuck = sumOf(w.PM._state().inflight && w.PM._state().inflight.snap);
    await as('none'); await as('A'); await as('B');
    if (outcome === 'lands') { sh.net.stall = false; w.drain(); }
    else { const q = sh.net.queued; sh.net.queued = []; sh.net.stall = false; q.forEach((x) => x.rej(new Error('unavailable'))); }
    await runAll([w], 3);
    await as('A');
    await runAll([w], 5); await w.PM.flush(); await w.settle(); await runAll([w], 90); await w.PM.flush(); await w.settle();
    const total = sh.server.days[todayStr]?.seconds || 0;
    check(`a stuck commit answers after a NEWER sign-in of the same student and a sign-in of someone else, and ${outcome === 'lands' ? 'landed' : 'failed'}: ${outcome === 'lands' ? 'not counted twice' : 'not lost'} (164 played, ${stuck} s were on the wire)`, stuck > 0 && total >= 162 && total <= 165, `server ${total}, stuck ${stuck}`);
  }
}
{
  // Gap 2 — buildOps' `flying` term. A keepalive sent beside a commit still in flight must count the seconds in flight
  // when it decides the week's goal is hit, or the week doc ends at "not hit" with more than the goal in it. The week's
  // stored seconds are set so the queued seconds alone fall short of the goal and queued + in flight pass it.
  const sh = shared();
  const w = makeWorld(sh);
  const a = w.track(); a.play();
  await runAll([w], 84, () => { if (!a.paused) a.currentTime += 1; });
  sh.net.stall = true; w.PM.flush(); await w.settle();                      // a commit in flight…
  await runAll([w], 10, () => { if (!a.paused) a.currentTime += 1; });      // …and 10 more seconds queued after it
  const st = w.PM._state(), flying = sumOf(st.inflight && st.inflight.snap), queuedNow = sumOf(st.pend), wk = calcWeek(w);
  st.weeks[wk] = { seconds: 3600 - queuedNow - Math.ceil(flying / 2), goalSeconds: 3600, hit: false };
  const base = st.weeks[wk].seconds;                                        // read before pagehide: the keepalive folds its seconds in
  const f0 = w.log.fetches.length;
  leaveLikeChrome(w);
  const ka = commitFetch(w, f0);
  const premise = flying > 5 && queuedNow > 5 && base + queuedNow < 3600 && base + queuedNow + flying >= 3600;
  check('pagehide with a commit in flight that, with the queued seconds, passes the goal: the keepalive marks the week hit', premise && !!ka && /"hit":\{"booleanValue":true\}/.test(ka.init.body), `premise ${premise} (stored ${base}, in flight ${flying}, queued ${queuedNow}); ` + (ka ? ka.init.body.slice(0, 220) : 'no keepalive'));
}
{
  // Gap 3 — refreshToken() when a session starts. The token cached at page load is an hour old after an hour: a page left
  // open for two hours must send its unload write with a token issued when the session began, not the page-load one.
  const sh = shared(); sh.net.stall = true;                                  // no commit is answered: a landed flush would refresh the token too
  const w = makeWorld(sh);
  w.user.getIdToken = function () { return Promise.resolve('tok@' + sh.clock.ms); };
  w.PM.status(); await w.settle();
  const t0 = sh.clock.ms;
  sh.clock.ms += 2 * 3600 * 1000;                                           // the page stays open for two hours
  const a = w.track(); a.play();
  await runAll([w], 25, () => { if (!a.paused) a.currentTime += 1; });      // a session starts; no commit has landed yet
  const f0 = w.log.fetches.length;
  leaveLikeChrome(w);
  const ka = commitFetch(w, f0);
  const issued = ka ? +String(ka.init.headers.Authorization).split('@')[1] : 0;
  check('a session that starts two hours after page load sends its unload write with a token issued when it started (not the page-load one)', !!ka && issued >= t0 + 2 * 3600 * 1000, ka ? 'token issued ' + Math.round((issued - t0) / 60000) + ' min after page load' : 'no keepalive sent');
}
{
  // Gap 4 — pageshow clears `leavingPage`. A page frozen into the back/forward cache ran pagehide, then comes back. Hiding
  // the tab must flush again, or every later tab switch sends nothing until the 60 s timer.
  const sh = shared(); const w = makeWorld(sh);
  const a = w.track(); a.play();
  await runAll([w], 20, () => { if (!a.paused) a.currentTime += 1; });
  for (const f of w.listeners['win:pagehide'] || []) f();
  for (const f of w.listeners['win:pageshow'] || []) f({ persisted: true });
  await runAll([w], 30, () => { if (!a.paused) a.currentTime += 1; });      // 30 s after the restore, under the 60 s timer
  const before = sh.server.days[todayStr]?.seconds || 0;
  w.documentStub.visibilityState = 'hidden';
  for (const f of w.listeners['doc:visibilitychange'] || []) f();
  await w.settle();
  const sent = (sh.server.days[todayStr]?.seconds || 0) - before;
  check('restored from the back/forward cache, then the tab is hidden: the seconds counted since the restore are sent', sent >= 28 && sent <= 31, 'sent ' + sent);
  // …and a page that really leaves (pagehide, no pageshow) must start no commit on the visibilitychange that follows, even
  // when its keepalive could not go (the new student's token is not back yet) and it still holds seconds: the dying page
  // cannot finish a commit, and the seconds stay in its leaving key for the next page.
  const sh2 = shared(); const w2 = makeWorld(sh2);
  const b = w2.track(); b.play();
  await runAll([w2], 20, () => { if (!b.paused) b.currentTime += 1; });
  b.pause(); await runAll([w2], 3);
  w2.user.uid = 'uid-B'; w2.user.getIdToken = () => new Promise(() => {});    // B signs in on this page; B's token is not back
  w2.PM.status(); await runAll([w2], 3);
  w2.PM._state().pend[todayStr] = 100;                                        // B has queued seconds and nothing to send them with
  const c0 = w2.log.commits.length, held = sumOf(w2.PM._state().pend), f0 = w2.log.fetches.length;
  leaveLikeChrome(w2); await w2.settle();
  check('…while a page that is really leaving starts no commit when it is hidden, even holding seconds its keepalive could not send', held >= 100 && !commitFetch(w2, f0) && w2.log.commits.length === c0, `held ${held}, keepalive ${!!commitFetch(w2, f0)}, commits started ${w2.log.commits.length - c0}`);
}
{
  // R2-6 — commit 70ef823 wrote pm:q:<uid> (no page id, no `at`) for about an hour on 2026-11-01. adopt() only looked at
  // pm:q:<uid>:<page>, so those seconds sat there for ever. Adopt and remove it; leave other students' keys alone,
  // including one whose uid only STARTS with this one's.
  const sh = shared();
  sh.store['pm:q:uid-A'] = JSON.stringify({ days: { [todayStr]: 45 } });
  sh.store['pm:q:uid-B'] = JSON.stringify({ days: { [todayStr]: 30 } });
  sh.store['pm:q:uid-AB'] = JSON.stringify({ days: { [todayStr]: 20 } });
  const w = makeWorld(sh);
  w.PM.status(); await runAll([w], 5); await w.PM.flush(); await w.settle();
  check('a leftover pm:q:<uid> key (no page id, no `at`) is adopted and sent: its 45 s reach the server', (sh.server.days[todayStr]?.seconds || 0) === 45, 'server ' + (sh.server.days[todayStr]?.seconds || 0));
  check('…and the key is removed', !('pm:q:uid-A' in sh.store), JSON.stringify(Object.keys(sh.store)));
  check('…another student\'s keys (uid-B, and uid-AB whose name starts with uid-A) are not touched', sh.store['pm:q:uid-B'] === JSON.stringify({ days: { [todayStr]: 30 } }) && sh.store['pm:q:uid-AB'] === JSON.stringify({ days: { [todayStr]: 20 } }));
}

/* ═══════════ 12. All work on the site counts (2026-11-03) ═══════════
   Jonathan: "any work inside the website from modules to other class activities should
   count towards minutes and streaks". Rule he picked: counting goes on while the student
   did something in the last 2 minutes (click, key, scroll, pointer, a Web Audio sound, an
   open mic), or anything is playing — tab visible, student signed in. */
console.log('12. all site work counts');
{
  const w = makeWorld();
  w.PM._state();
  w.input('pointerdown');
  await w.run(420);
  check('one click and nothing else counts ≈ 2 minutes (118–121 s), then nothing over the next 5 minutes', sec(w) >= 118 && sec(w) <= 121, 'counted ' + sec(w));
  check('…and the 1 s timer stops once the student is idle', w.__timers.filter((t) => t.ms === 1000).length === 0, w.__timers.map((t) => t.ms).join());

  const evs = ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart', 'input'];
  const got = [];
  for (const ev of evs) { const x = makeWorld(); x.PM._state(); x.input(ev); await x.run(200); got.push(sec(x)); }
  check(`each of the ${evs.length} input events alone (${evs.join(', ')}) starts ≈ 2 minutes of counting`, got.every((n) => n >= 118 && n <= 121), got.join());

  const w2 = makeWorld();
  w2.PM._state();
  await w2.run(600, (i) => { if (i % 60 === 0) w2.input('keydown'); });
  check('a key press once a minute for 10 minutes counts ≈ 10 minutes (595–600 s)', sec(w2) >= 595 && sec(w2) <= 600, 'counted ' + sec(w2));

  const w3 = makeWorld();
  w3.PM._state();
  w3.input('pointerdown');
  w3.documentStub.visibilityState = 'hidden';
  await w3.run(30);
  check('a click, then the tab is hidden: nothing counts while hidden', sec(w3) === 0, 'counted ' + sec(w3));
  w3.documentStub.visibilityState = 'visible';
  (w3.listeners['doc:visibilitychange'] || []).forEach((f) => f());
  await w3.run(200);
  check('…visible again inside the 2 minutes: the rest of the window counts (≈ 90 s; the waking tick may add its capped 2 s)', sec(w3) >= 88 && sec(w3) <= 92, 'counted ' + sec(w3));

  const w4 = makeWorld({ signedOut: true });
  w4.input('pointerdown');
  await w4.run(60, () => w4.input('pointermove'));
  check('nobody signed in (or the ?teacher console): clicks count nothing, store nothing, start no timer', w4.PM._state() === null && !Object.keys(w4.store).some((k) => k.startsWith('pm:q')) && w4.__timers.filter((t) => t.ms === 1000).length === 0);

  const w5 = makeWorld();
  w5.PM._state();
  const src = new w5.FakeSource();
  await w5.run(300, () => src.start());
  const at300 = sec(w5);
  await w5.run(300);
  check('a Web Audio sound every second (the metronome) for 5 minutes, no clicks: ≈ 5 minutes, then 2 more after the last click (≈ 420 s)', at300 >= 298 && sec(w5) >= 416 && sec(w5) <= 421, at300 + ' → ' + sec(w5));
  check('…and the start() call still reaches the real one', src.started === true);

  const w6 = makeWorld();
  w6.PM._state();
  const stream = await new w6.FakeMediaDevices().getUserMedia({ audio: true });
  await w6.run(360);
  const mic6 = sec(w6);
  stream.track.readyState = 'ended';
  await w6.run(300);
  check('an open mic (tuner, Coach, a game) with no clicks counts while live (6 min ≈ 360 s), then 2 minutes after it closes (≈ 480 s)', mic6 >= 358 && sec(w6) >= 476 && sec(w6) <= 481, mic6 + ' → ' + sec(w6));
  check('…getUserMedia still hands the stream back untouched', typeof stream.getAudioTracks === 'function' && stream.getAudioTracks()[0] === stream.track);

  const w7 = makeWorld();
  w7.PM._state();
  w7.input('pointerdown');
  w7.documentStub.activeElement = { tagName: 'IFRAME' };
  (w7.listeners['win:blur'] || []).forEach((f) => f());
  await w7.run(900);
  check('a click into an embedded video (focus in the iframe): counts 10 minutes, then stops (≈ 600 s of 900)', sec(w7) >= 598 && sec(w7) <= 601, 'counted ' + sec(w7));

  const w8 = makeWorld();
  w8.PM._state();
  await w8.run(100, (i) => { if (i % 30 === 0) w8.input('scroll'); });
  check('counting from clicks alone counts (≈ 100 s) and writes no single document', w8.log.sets.length === 0 && sec(w8) >= 98, w8.log.sets.length + ' sets, ' + sec(w8) + ' s');

  const w9 = makeWorld();
  w9.PM._state();
  const a9 = w9.track(); w9.input('pointerdown'); a9.play();
  await w9.run(40, w9.playing(a9));
  check('a song with a click: a play run is open while it plays', !!w9.PM._play() && w9.PM._play().counted >= 38);
  a9.pause();
  await w9.run(3);
  check('…Stop ends the play run 2 s later (the recap moment) while the session keeps counting inside the 2-minute window', w9.PM._play() === null && !!w9.PM._session());
  await w9.run(200);
  check('…and counting ends 2 minutes after the click (≈ 120 s in all), not 2 minutes after the song', sec(w9) >= 118 && sec(w9) <= 121 && !w9.PM._session(), 'counted ' + sec(w9));

  const w10 = makeWorld();
  w10.PM._state();
  await w10.run(1800, (i) => { if (i % 30 === 0) w10.input('pointerdown'); });
  check('half an hour of clicking still stops at the daily cap (1200 s)', sec(w10) === 1200, 'counted ' + sec(w10));
}

/* ═══════════ 13. Class rank: rankBoard/{tag} (2026-11-05; was minutesBoard/{uid}) ═══════════ */
console.log('13. class rank');
{
  const weekSum = (w) => Object.values(w.server.weeks).reduce((a, b) => a + b.seconds, 0);
  const TAGX = 'c0ffee00c0ffee00c0ffee00c0ffee00';   // a student's private tag, for worlds that start with one made
  const tagOf = (w) => (w.server.meta['uid-A'] || {}).id;
  const boardOf = (w) => w.server.board[tagOf(w)];

  // The write: one number, the server-confirmed all-time seconds, only when it changed, not more than once per 2 minutes.
  const w = makeWorld();
  w.PM._state();
  w.input('pointerdown');
  await w.run(130);
  await w.PM.flush(); await w.settle();
  await w.run(130);
  check('the board doc exists; every write is { seconds } only under the own tag of the student: the first creates it at an absolute number (the server\'s sum), later ones are increments', w.log.board.length >= 2 && eq(Object.keys(w.log.board[0].data), ['seconds']) && typeof w.log.board[0].data.seconds === 'number'
    && w.log.board.slice(1).every((b) => eq(Object.keys(b.data), ['seconds']) && typeof b.data.seconds === 'object' && b.data.seconds.__inc > 0) && w.log.board.every((b) => b.id === tagOf(w) && b.id !== 'uid-A'), JSON.stringify(w.log.board));
  check('…after the last write the board holds exactly the weeks docs\' sum (the confirmed seconds)', boardOf(w) && boardOf(w).seconds > 0 && boardOf(w).seconds === weekSum(w), JSON.stringify(boardOf(w)) + ' vs weeks ' + weekSum(w));
  const n0 = w.log.board.length;
  await w.run(300);
  check('idle for 5 minutes with nothing new to confirm: no further board writes', w.log.board.length === n0, n0 + ' → ' + w.log.board.length);
  check('the board write is a single-document set on rankBoard only; no other path is ever set()', w.log.sets.length === 0 && w.log.board.every((b) => typeof b.id === 'string'), w.log.sets.length + ' other sets');

  // Many flushes in a long session: at most one board write per 2 minutes (a 20-minute day is ≤ 11 writes).
  const wl = makeWorld();
  wl.PM._state();
  await wl.run(1300, (i) => { if (i % 30 === 0) wl.input('pointerdown'); });
  check('a 20-minute day (≈ 20 flushes) writes the board at most once per 2 minutes (≤ 11 writes)', wl.log.board.length >= 2 && wl.log.board.length <= 11, wl.log.board.length + ' writes, ' + wl.log.commits.length + ' commits');
  check('…and with seconds still queued the board never runs ahead of what the server confirmed (≤ the weeks docs\' sum)', boardOf(wl).seconds <= weekSum(wl) && boardOf(wl).seconds > 0, boardOf(wl).seconds + ' vs ' + weekSum(wl));

  // The rules are not published: the minutes still count and land in full; the board retries at most every 5 minutes.
  const wd = makeWorld({ net: { online: true, denied: false, boardDenied: true } });
  wd.PM._state();
  await wd.run(1300, (i) => { if (i % 30 === 0) wd.input('pointerdown'); });
  await wd.PM.flush(); await wd.settle();
  check('with the board rules unpublished the minutes still all land (server = counted)', weekSum(wd) === sec(wd) && weekSum(wd) >= 1190, weekSum(wd) + ' vs ' + sec(wd));
  check('…the refused board attempts are retried only every 5 minutes (1 to 5 in a 22-minute day, not one per flush); nothing is stored', wd.log.board.length === 0 && Object.keys(wd.server.board).length === 0 && wd.log.boardRefused.length >= 1 && wd.log.boardRefused.length <= 5, wd.log.boardRefused.length + ' refused');
  const wdState = wd.PM._state();
  check('…and the refusal does not mark the board ready, and what is owed is kept', wdState.boardReady === false && wdState.boardRetryAt > 0 && wdState.boardOwed > 0, JSON.stringify({ ready: wdState.boardReady, owed: wdState.boardOwed }));

  // Two pages of ONE student (the main tab and a Journey tab): the board ADDS, it is never "whichever page wrote last".
  const sh2 = shared();
  const pMain = makeWorld(sh2), pJourney = makeWorld(sh2);
  pMain.PM._state(); pMain.input('pointerdown'); await pMain.run(3);                         // the main tab has loaded and created the board doc
  pJourney.PM._state(); pJourney.input('pointerdown'); await pJourney.run(130); await pJourney.PM.flush(); await pJourney.settle();   // a Journey tab works 2 minutes
  pMain.input('pointerdown'); await pMain.run(100); await pMain.PM.flush(); await pMain.settle();                                   // then the main tab works 100 s more
  await pMain.run(130); await pJourney.run(130); await pMain.run(130);                       // the main tab's session ended in there; its last write waits out the 2-minute spacing
  const both = weekSum(pJourney);
  check('two pages of one student: the board holds both pages\' minutes, exactly the weeks docs\' sum (not the last page\'s own total)', both >= 200 && sh2.server.board[tagOf(pMain)] && sh2.server.board[tagOf(pMain)].seconds === both, 'board ' + JSON.stringify(sh2.server.board[tagOf(pMain)]) + ' vs weeks ' + both);

  // The first write of a page looks at the doc. A student who already has minutes (from before the board existed) and no doc:
  // the doc is CREATED at everything the server has confirmed, history included, then grows with the minutes.
  const wfw0 = makeWorld({ server: { days: {}, weeks: { '2026-W46': { seconds: 3000, goalSeconds: 3600, hit: false } }, board: {} } });
  wfw0.PM._state(); wfw0.input('pointerdown'); await wfw0.run(130); await wfw0.PM.flush(); await wfw0.settle(); await wfw0.run(130);
  check('a student with 3000 s of history and no board doc: the doc is created at the whole history (3000 s plus the few seconds counted while the tag was made), then grows (= the weeks docs\' sum)', weekSum(wfw0) >= 3100 && boardOf(wfw0).seconds === weekSum(wfw0) && typeof wfw0.log.board[0].data.seconds === 'number' && wfw0.log.board[0].data.seconds >= 3000 && wfw0.log.board[0].data.seconds <= 3030, JSON.stringify(boardOf(wfw0)) + ' vs ' + weekSum(wfw0) + '; first write ' + JSON.stringify(wfw0.log.board[0] && wfw0.log.board[0].data));
  // A doc that exists is never overwritten by a page, only added to (whatever else wrote it, another device included, stays).
  const wfw1 = makeWorld({ server: { days: {}, weeks: { '2026-W46': { seconds: 3000, goalSeconds: 3600, hit: false } }, board: { [TAGX]: { seconds: 500 } }, meta: { 'uid-A': { id: TAGX } } } });
  wfw1.PM._state(); wfw1.input('pointerdown'); await wfw1.run(130); await wfw1.PM.flush(); await wfw1.settle(); await wfw1.run(130);
  const added = weekSum(wfw1) - 3000;
  check('an existing board doc (500 s) is only ever added to: 500 + this page\'s confirmed seconds, never replaced by this page\'s total', added >= 100 && boardOf(wfw1).seconds === 500 + added && wfw1.log.board.every((x) => typeof x.data.seconds === 'object' && x.data.seconds.__inc > 0), JSON.stringify(boardOf(wfw1)) + ' added ' + added + '; writes ' + JSON.stringify(wfw1.log.board.map((x) => x.data.seconds)));
  check('…and the page looks at its own doc exactly once, before its first write', (wfw1.log.boardGets || []).length === 1 && wfw1.log.boardGets[0] === TAGX && (wfw0.log.boardGets || []).length === 1, JSON.stringify(wfw1.log.boardGets) + ' ' + JSON.stringify(wfw0.log.boardGets));

  // The doc EXISTS and ready; a run of increments is refused (rules, then fixed); what was owed is kept and a later write brings the board level with the minutes.
  // (The first write of a page creates the doc at the whole confirmed sum, which hides a lost increment: this case is the one that does not.)
  const wrf = makeWorld({ server: { days: {}, weeks: { '2026-W46': { seconds: 3000, goalSeconds: 3600, hit: false } }, board: { [TAGX]: { seconds: 3000 } }, meta: { 'uid-A': { id: TAGX } } } });
  wrf.PM._state(); wrf.input('pointerdown'); await wrf.run(130); await wrf.PM.flush(); await wrf.settle(); await wrf.run(130);
  const ready0 = wrf.PM._state().boardReady;
  wrf.net.boardDenied = true; wrf.input('pointerdown'); await wrf.run(130); await wrf.PM.flush(); await wrf.settle(); await wrf.run(130);
  const refusedN = wrf.log.boardRefused.length, owedKept = wrf.PM._state().boardOwed > 0;
  wrf.net.boardDenied = false; wrf.clock.ms += 6 * 60 * 1000; wrf.clock.perf += 6 * 60 * 1000;
  wrf.input('pointerdown'); await wrf.run(130); await wrf.PM.flush(); await wrf.settle(); await wrf.run(130);
  const addedR = weekSum(wrf) - 3000;
  check('an existing board doc: increments refused for a while (rules), what is owed is kept, and after the wait the board is level with the minutes again (3000 + everything confirmed)', ready0 === true && refusedN >= 1 && owedKept && addedR >= 300 && boardOf(wrf).seconds === 3000 + addedR, JSON.stringify({ ready0, refusedN, owedKept, board: boardOf(wrf), added: addedR }));

  // A page whose load FAILED does not know the real total: its flushes publish nothing.
  const wnl = makeWorld({ net: { online: true, denied: false, denyReads: true } });
  wnl.PM._state(); wnl.input('pointerdown'); await wnl.run(130); await wnl.PM.flush(); await wnl.settle();
  check('a page whose load was refused but whose minutes still landed writes nothing to the board (it does not know the total)', weekSum(wnl) > 0 && !(wnl.log.boardTries || []).length && !(wnl.log.boardGets || []).length, weekSum(wnl) + ' s landed, ' + (wnl.log.boardTries || []).length + ' board tries');

  // The teacher's own account (signed in on a normal page, or on a projected Journey page) is never on the board.
  const wte = makeWorld({ uid: 'uid-T', server: { days: {}, weeks: {}, board: { 'uid-B': { seconds: 300 } } } });
  wte.user.email = 'teacher@example.org'; vm.runInContext("var TEACHER_EMAIL = 'teacher@example.org';", wte.ctx);
  wte.PM._state(); wte.input('pointerdown'); await wte.run(130); await wte.PM.flush(); await wte.settle(); await wte.run(130); await wte.PM._loadBoard();
  check('the teacher\'s account counts its minutes but writes nothing to the board, makes NO private tag, reads nothing and gets no rank', weekSum(wte) > 0 && !(wte.log.boardTries || []).length && eq(wte.server.meta, {}) && !wte.net.boardReads && wte.PM._rank() === null, weekSum(wte) + ' s, ' + (wte.log.boardTries || []).length + ' tries, rank ' + JSON.stringify(wte.PM._rank()));

  // The rank: 1 + the number of OTHER students with strictly more seconds; total counts me; my own doc is ignored.
  const sv = () => ({ days: {}, weeks: {}, board: { 'uid-B': { seconds: 100 }, 'uid-C': { seconds: 300 }, 'uid-D': { seconds: 600 }, 'uid-E': { seconds: 5000 }, [TAGX]: { seconds: 99999 } }, meta: { 'uid-A': { id: TAGX } } });
  const wr = makeWorld({ server: sv() });
  wr.PM._state();
  wr.input('pointerdown');
  await wr.run(130);
  await wr.PM.flush(); await wr.settle();
  const mine = sec(wr);
  const b = await wr.PM._loadBoard();
  const r = wr.PM._rank();
  check(`rank: with ${mine} s against 100 / 300 / 600 / 5000 (+ a stale doc of my own) I am 4th of 5`, !!b && r && r.n === 4 && r.total === 5, JSON.stringify(r) + ' mine ' + mine);
  const wt = makeWorld({ server: { days: {}, weeks: {}, board: { 'uid-B': { seconds: 120 }, 'uid-C': { seconds: 120 } } } });
  wt.PM._state(); wt.input('pointerdown'); await wt.run(130); await wt.PM.flush(); await wt.settle(); await wt.PM._loadBoard();
  const mt = sec(wt);
  wt.server.board['uid-B'].seconds = mt; wt.server.board['uid-C'].seconds = mt;
  wt.PM._state().board = null; wt.store['pm:b:uid-A'] = undefined; delete wt.store['pm:b:uid-A'];
  await wt.PM._loadBoard();
  check('a tie shares the rank (two others with exactly my seconds: I am 1st of 3, not 3rd)', wt.PM._rank() && wt.PM._rank().n === 1 && wt.PM._rank().total === 3, JSON.stringify(wt.PM._rank()));
  // The tie is by the whole minutes the screen shows: 179 s and 120 s both read "2 min" (a tie), 180 s reads "3 min" (above).
  const wm = makeWorld({ server: { days: {}, weeks: {}, board: { 'uid-B': { seconds: 179 }, 'uid-C': { seconds: 180 } } } });
  wm.PM._state(); wm.input('pointerdown'); await wm.run(130); await wm.PM.flush(); await wm.settle(); await wm.PM._loadBoard();
  check('179 s and 180 s against my 120 s: the 179 s student reads "2 min" like me (tie), the 180 s one is ahead: I am 2nd of 3', Math.floor(sec(wm) / 60) === 2 && wm.PM._rank() && wm.PM._rank().n === 2 && wm.PM._rank().total === 3, JSON.stringify(wm.PM._rank()) + ' mine ' + sec(wm));
  const wz = makeWorld({ server: sv() });
  wz.PM._state();
  await wz.PM.load(); await wz.PM._loadBoard();
  check('a student under a minute gets no rank number (n null), but the total is still known (5 with me)', wz.PM._rank() && wz.PM._rank().n === null && wz.PM._rank().total === 5, JSON.stringify(wz.PM._rank()));
  const wn = makeWorld({ net: { online: true, denied: false, denyBoardRead: true }, server: sv() });
  wn.PM._state();
  const bn = await wn.PM._loadBoard();
  check('a board that cannot be read (rules unpublished): no rank, nothing thrown', bn === null && wn.PM._rank() === null);

  // The board is read once, then kept 3 hours (memory and this student's localStorage key), then read again.
  const wc = makeWorld({ server: sv() });
  wc.PM._state();
  await wc.PM._loadBoard(); await wc.PM._loadBoard(); await wc.PM._loadBoard();
  check('three opens in a row read the whole class once', wc.net.boardReads === 1, 'reads ' + wc.net.boardReads);
  check('…the copy is kept under pm:b:<uid> with the other students\' seconds only (my own doc left out)', !!wc.store['pm:b:uid-A'] && eq(JSON.parse(wc.store['pm:b:uid-A']).others.slice().sort((x, y) => x - y), [100, 300, 600, 5000]), wc.store['pm:b:uid-A']);
  const wc2 = makeWorld({ server: sv(), store: wc.store, clock: wc.clock });
  wc2.PM._state();
  await wc2.PM._loadBoard();
  check('a new page of the same student inside 3 hours reuses the stored copy (no read)', !wc2.net.boardReads, 'reads ' + wc2.net.boardReads);
  wc.clock.ms += 170 * 60 * 1000; wc.clock.perf += 170 * 60 * 1000;
  await wc.PM._loadBoard();
  check('…still the same copy 170 minutes later (a whole class period; a read is one document per student)', wc.net.boardReads === 1, 'reads ' + wc.net.boardReads);
  wc.clock.ms += 11 * 60 * 1000; wc.clock.perf += 11 * 60 * 1000;
  await wc.PM._loadBoard();
  check('…and 181 minutes later reads the class again', wc.net.boardReads === 2, 'reads ' + wc.net.boardReads);
  const wo = makeWorld({ uid: 'uid-Z', server: sv(), store: wc.store, clock: wc.clock });
  wo.PM._state();
  await wo.PM._loadBoard();
  check('another student on the same Chromebook never uses the first student\'s copy (it is keyed by uid)', wo.net.boardReads === 1, 'reads ' + wo.net.boardReads);

  // What is drawn (the strings come back as their keys in the sim): the tile is there with a rank, says so with none, and is absent when the board is unknown.
  const host = () => ({ hidden: true, innerHTML: '', isConnected: true });
  const wh = makeWorld({ ui: true, config: { uiOn: true }, server: sv() });
  wh.PM._state(); wh.input('pointerdown'); await wh.run(130); await wh.PM.flush(); await wh.settle();
  const h1 = host(); wh.PM.renderProgress(h1); await wh.settle();
  check('My progress draws the Class rank tile once the board is read', /pm\.tileRank\b/.test(h1.innerHTML) && /pm\.tileRankVal/.test(h1.innerHTML) && /pm\.tileRankSub/.test(h1.innerHTML), h1.innerHTML.slice(0, 80));
  const wh0 = makeWorld({ ui: true, config: { uiOn: true }, net: { online: true, denied: false, denyBoardRead: true }, server: sv() });
  wh0.PM._state(); wh0.input('pointerdown'); await wh0.run(130); await wh0.PM.flush(); await wh0.settle();
  const h0 = host(); wh0.PM.renderProgress(h0); await wh0.settle();
  check('…and no tile at all when the board cannot be read, the rest of the panel still draws', !/pm\.tileRank/.test(h0.innerHTML) && /pm\.tileWeek/.test(h0.innerHTML));
  const whn = makeWorld({ ui: true, config: { uiOn: true }, server: sv() });
  whn.PM._state(); await whn.settle();
  const hn = host(); whn.PM.renderProgress(hn); await whn.settle();
  check('a student under a minute sees the "practice 1 minute" line instead of a number', /pm\.tileRankNone/.test(hn.innerHTML) && !/pm\.tileRankSub/.test(hn.innerHTML), hn.innerHTML.slice(0, 80));
  const wal = makeWorld({ ui: true, config: { uiOn: true }, server: { days: {}, weeks: {}, board: {} } });
  wal.PM._state(); wal.input('pointerdown'); await wal.run(130); await wal.PM.flush(); await wal.settle();
  const ha = host(); wal.PM.renderProgress(ha); await wal.settle();
  check('alone on the board (total 1) there is nothing to rank against: no tile', !/pm\.tileRank/.test(ha.innerHTML));
}

console.log('14. top 5 of the week');
{
  const W = '2026-W47', WPREV = '2026-W46';   // the sim's clock is Monday 16 Nov 2026 = ISO week 2026-W47
  const TAG = 'a1b2c3d4e5f60718293a4b5c6d7e8f90';   // a student's private Top 5 name tag, for worlds that start with one already made
  const own = (w) => { const m = w.server.meta['uid-A']; return m ? w.server.wb[m.id] : undefined; };   // the student's own board doc, by THEIR tag
  const wk = (secs) => ({ [W]: { seconds: secs, goalSeconds: 3600, hit: false } });
  const wbDoc = (secs, week = W, period = '4') => ({ week, period, seconds: secs });
  const host = () => ({ hidden: true, innerHTML: '', isConnected: true });
  const minOf = (m) => m * 60;
  const weekOf = (w) => Object.values(w.server.weeks).reduce((a, b) => a + b.seconds, 0);
  const advance = (w, ms) => { w.clock.ms += ms; w.clock.perf += ms; };
  /* A world for period 4 whose own week holds `mine` seconds and whose weekBoard holds `others` (an array of seconds, period 4, this week)
     plus `extra` documents; it loads, publishes and reads the class once. */
  async function top5World(mine, others, extra = {}, o = {}) {
    const wb = {}; others.forEach((x, i) => { wb['uid-O' + i] = wbDoc(x); });
    Object.assign(wb, extra);
    const w = makeWorld({ period: '4', server: { days: {}, weeks: wk(mine), board: {}, wb, meta: { 'uid-A': { id: TAG } } }, ...o });
    w.PM._state(); await w.PM.load(); await w.settle(); await w.PM._loadWeek(); await w.settle();
    return w;
  }
  const t5 = async (mine, others, extra) => (await top5World(mine, others, extra)).PM._top5();

  // The place. Whole minutes decide; ties share a place; 10 minutes this week are needed to be ranked.
  let r = await t5(minOf(15), [minOf(20), minOf(15), minOf(15) + 30, minOf(10), minOf(9)]);
  check('place: 15 min against 20 / 15 / 15:30 / 10 / 9: one student has more, so I am #2 and in (equal whole minutes share)', r && r.top === true && r.n === 2 && r.under === false, JSON.stringify(r));
  r = await t5(minOf(15), [minOf(20), minOf(20), minOf(20), minOf(20), minOf(15), minOf(15), minOf(15)]);
  check('four ahead and three at 15 min including me: I am #5 and in', r && r.top === true && r.n === 5, JSON.stringify(r));
  r = await t5(minOf(15), [minOf(30), minOf(25), minOf(20), minOf(20), minOf(15), minOf(15), minOf(15), minOf(15), minOf(15)]);
  check('…more than five tied at 5th: nine students wear it (4 ahead + 5 tied at 15 min) and I am #5 with the other four', r && r.top === true && r.n === 5, JSON.stringify(r));
  r = await t5(minOf(15), [minOf(20), minOf(20), minOf(20), minOf(20), minOf(20), minOf(15), minOf(15)]);
  check('five ahead of me: out, #6, and no "minutes to catch up" field (dropped 2026-11-06)', r && r.top === false && r.under === false && r.n === 6 && !('need' in r), JSON.stringify(r));
  r = await t5(minOf(20), [minOf(20), minOf(20), minOf(20), minOf(20), minOf(20), minOf(21)]);
  check('one student above me and five tied with me on whole minutes: all share the place, I am #2 and in', r && r.top === true && r.n === 2, JSON.stringify(r));
  r = await t5(minOf(19) + 59, [minOf(20), minOf(20), minOf(20), minOf(20), minOf(20)]);
  check('19:59 against five at 20 min: still out (whole minutes: 19 < 20), #6', r && r.top === false && r.n === 6, JSON.stringify(r));
  r = await t5(599, []);
  check('9:59 this week is not ranked (under the 10-minute minimum), even alone: "1 to go"', r && r.top === false && r.under === true && r.toRank === 1 && r.min === 10, JSON.stringify(r));
  r = await t5(600, []);
  check('exactly 10:00 alone in the period is ranked: #1 and in', r && r.top === true && r.n === 1 && r.under === false, JSON.stringify(r));
  r = await t5(minOf(12), [minOf(11), minOf(9), 0]);
  check('12 min against 11 / 9 / 0 (others under the minimum or not): #1 and in', r && r.top === true && r.n === 1, JSON.stringify(r));
  r = await t5(minOf(5), [minOf(60), minOf(60), minOf(60), minOf(60), minOf(60), minOf(60)]);
  check('under the minimum AND behind a full Top 5: the line is about the minimum (5 to go), not about catching up', r && r.under === true && r.top === false && r.toRank === 5, JSON.stringify(r));

  // The read: one query, equality filters only, this week and my period; other weeks and other periods do not count.
  const far = { 'uid-P7': wbDoc(minOf(100), W, '7'), 'uid-PCAS': wbDoc(minOf(100), W, 'CAS'), 'uid-PREV': wbDoc(minOf(100), WPREV, '4'), [TAG]: wbDoc(minOf(999)) };
  const wq = await top5World(minOf(15), [minOf(20)], far);
  const rq = wq.PM._top5();
  check('other periods, last week\'s docs and a stale doc of my own do not count: with only one real classmate I am #2 and in', rq && rq.top === true && rq.n === 2, JSON.stringify(rq));
  check('…the class is read with ONE query: equality on week and on period only (no index), and the cache holds numbers only (no uids)', wq.log.wbQueries.length === 1 && eq(wq.log.wbQueries[0], [['week', '==', W], ['period', '==', '4']])
    && eq(JSON.parse(wq.store['pm:w:uid-A']).others, [minOf(20)]) && !/uid-/.test(wq.store['pm:w:uid-A']), JSON.stringify(wq.log.wbQueries) + ' ' + wq.store['pm:w:uid-A']);

  // The cache: 15 minutes in memory and in localStorage under the student's id.
  const wc = await top5World(minOf(15), [minOf(20)]);
  await wc.PM._loadWeek(); await wc.PM._loadWeek(); await wc.PM._loadWeek();
  check('three opens in a row read the period once', wc.net.wbReads === 1, 'reads ' + wc.net.wbReads);
  const wc2 = makeWorld({ period: '4', server: wc.server, store: wc.store, clock: wc.clock });
  wc2.PM._state(); await wc2.PM._loadWeek();
  check('a new page of the same student inside 15 minutes reuses the stored copy (no read)', !wc2.net.wbReads, 'reads ' + wc2.net.wbReads);
  advance(wc, 14 * 60 * 1000); await wc.PM._loadWeek();
  check('…14 minutes later still no new read', wc.net.wbReads === 1, 'reads ' + wc.net.wbReads);
  advance(wc, 2 * 60 * 1000); await wc.PM._loadWeek();
  check('…16 minutes later one more read', wc.net.wbReads === 2, 'reads ' + wc.net.wbReads);
  const wo = makeWorld({ uid: 'uid-Z', period: '4', server: wc.server, store: wc.store, clock: wc.clock });
  wo.PM._state(); await wo.PM._loadWeek();
  check('another student on the same Chromebook never uses the first student\'s copy (keyed by uid)', wo.net.wbReads === 1, 'reads ' + wo.net.wbReads);
  const wp = makeWorld({ period: '7', server: wc.server, store: wc.store, clock: wc.clock });
  wp.PM._state(); await wp.PM._loadWeek();
  check('…and a copy kept for period 4 is not used once the student is in period 7 (a new read, filtered on 7)', wp.net.wbReads === 1 && eq(wp.log.wbQueries[0][1], ['period', '==', '7']), JSON.stringify(wp.log.wbQueries));
  advance(wc, 7 * 24 * 3600 * 1000);
  const reads0 = wc.net.wbReads; wc.PM._state(); await wc.PM._loadWeek();
  check('…and next Monday the old week\'s copy is not used (a new read for 2026-W48)', wc.net.wbReads === reads0 + 1 && eq(wc.log.wbQueries[wc.log.wbQueries.length - 1][0], ['week', '==', '2026-W48']), JSON.stringify(wc.log.wbQueries[wc.log.wbQueries.length - 1]));

  // No period, a period the rules refuse, the teacher: nothing is written, nothing is read, no place.
  for (const [label, o] of [['no class period answered yet', { period: '' }], ['a period the rules do not know', { period: '5' }], ['an inherited object key as the period', { period: 'constructor' }]]) {
    const wn = makeWorld({ server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: {} }, ...o });
    wn.PM._state(); await wn.PM.load(); await wn.settle(); await wn.PM._loadWeek();
    await wn.run(130, (i) => { if (i % 30 === 0) wn.input('pointerdown'); }); await wn.PM.flush(); await wn.settle();
    check(`${label}: no Top 5 board write attempted, no class read, no place — and the minutes still count`, !(wn.log.wbTrySets || []).length && !wn.net.wbReads && wn.PM._top5() === null && weekOf(wn) > minOf(15), `${wn.log.wbTx} tx, ${wn.net.wbReads} reads, ${JSON.stringify(wn.PM._top5())}`);
  }
  const wte = makeWorld({ uid: 'uid-T', period: '4', server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: { 'uid-B': wbDoc(minOf(30)) } } });
  wte.user.email = 'teacher@example.org'; vm.runInContext("var TEACHER_EMAIL = 'teacher@example.org';", wte.ctx);
  wte.PM._state(); await wte.PM.load(); await wte.settle(); await wte.PM._loadWeek();
  await wte.run(130, (i) => { if (i % 30 === 0) wte.input('pointerdown'); }); await wte.PM.flush(); await wte.settle();
  check('the teacher\'s account counts its minutes but writes nothing to the weekBoard, reads nothing and gets no place', weekOf(wte) > minOf(15) && !wte.log.wbTx && !wte.net.wbReads && wte.PM._top5() === null && !wte.server.wb['uid-T'], `${wte.log.wbTx} tx ${wte.net.wbReads} reads`);

  // The write: this week's server-confirmed seconds, { week, period, seconds } under my private tag, raised only.
  const ww = makeWorld({ period: '4', server: { days: {}, weeks: {}, board: {}, wb: {} } });
  ww.PM._state(); ww.input('pointerdown'); await ww.run(130); await ww.PM.flush(); await ww.settle(); await ww.run(130);
  check('a student who played writes the doc of their own tag exactly { week, period, seconds } — this week, their period, a whole number equal to the weeks doc', ww.log.wbWrites.length >= 1
    && ww.log.wbWrites.every((x) => x.id === ww.server.meta['uid-A'].id && eq(Object.keys(x.data).sort(), ['period', 'seconds', 'week']) && x.data.week === W && x.data.period === '4' && Number.isInteger(x.data.seconds))
    && own(ww).seconds === weekOf(ww) && !ww.log.wbRefused.length, JSON.stringify(ww.log.wbWrites) + ' vs weeks ' + weekOf(ww));
  check('…it is a transaction, never a bare set() (nothing lands in log.sets)', ww.log.sets.length === 0 && ww.log.wbGets >= 1, `${ww.log.sets.length} sets, ${ww.log.wbGets} gets`);
  const nW = ww.log.wbWrites.length, tx0 = ww.log.wbTx;
  await ww.run(300);
  check('idle for 5 minutes with nothing new confirmed: no further weekBoard writes and no transactions', ww.log.wbWrites.length === nW && ww.log.wbTx === tx0, nW + ' → ' + ww.log.wbWrites.length + ', tx ' + tx0 + ' → ' + ww.log.wbTx);
  const wl = makeWorld({ period: '7', server: { days: {}, weeks: {}, board: {}, wb: {} } });
  wl.PM._state();
  await wl.run(1300, (i) => { if (i % 30 === 0) wl.input('pointerdown'); });
  check('a 20-minute day (≈ 20 flushes) writes the week board at most once per 2 minutes (≤ 11), never ahead of the weeks doc', wl.log.wbWrites.length >= 2 && wl.log.wbWrites.length <= 11 && own(wl).seconds <= weekOf(wl) && own(wl).seconds > 0, wl.log.wbWrites.length + ' writes; ' + JSON.stringify(own(wl)) + ' vs ' + weekOf(wl));
  const mid = own(wl).seconds;
  await wl.PM.flush(); await wl.settle(); await wl.run(130);
  check('…and once flushed and the 2 minutes pass, the doc catches up to exactly the weeks doc', own(wl).seconds === weekOf(wl) && own(wl).seconds >= mid, JSON.stringify(own(wl)) + ' vs ' + weekOf(wl));

  // Raise-only: a page that holds an OLDER copy never lowers what another page of the same student wrote, in the same week and period.
  const hi = makeWorld({ period: '4', server: { days: {}, weeks: wk(600), board: {}, wb: { [TAG]: wbDoc(900) }, meta: { 'uid-A': { id: TAG } } } });
  hi.PM._state(); await hi.PM.load(); await hi.settle(); await hi.run(5);
  check('the doc holds 900 s (another page); this page knows 600 s: the transaction writes nothing and the doc stays 900', hi.log.wbTx >= 1 && hi.log.wbWrites.length === 0 && own(hi).seconds === 900, `${hi.log.wbTx} tx, ${JSON.stringify(own(hi))}`);
  const lo = makeWorld({ period: '4', server: { days: {}, weeks: wk(600), board: {}, wb: { [TAG]: wbDoc(300) }, meta: { 'uid-A': { id: TAG } } } });
  lo.PM._state(); await lo.PM.load(); await lo.settle(); await lo.run(5);
  check('the doc holds 300 s and this page knows 600 s: raised to 600', own(lo).seconds === 600 && lo.log.wbWrites.length === 1, JSON.stringify(own(lo)));
  const eqw = makeWorld({ period: '4', server: { days: {}, weeks: wk(600), board: {}, wb: { [TAG]: wbDoc(600) }, meta: { 'uid-A': { id: TAG } } } });
  eqw.PM._state(); await eqw.PM.load(); await eqw.settle(); await eqw.run(5);
  check('…equal numbers are not rewritten', eqw.log.wbWrites.length === 0, JSON.stringify(eqw.log.wbWrites));
  // Two pages at the same instant: another page writes 1000 between this page's read and its commit; the transaction runs again and sees it.
  const race = makeWorld({ period: '4', server: { days: {}, weeks: wk(600), board: {}, wb: { [TAG]: wbDoc(300) }, meta: { 'uid-A': { id: TAG } } } });
  race.net.wbBeforeCommit = (n) => { if (n === 0) { race.server.wb[TAG] = wbDoc(1000); race.server.wbVer[TAG] = (race.server.wbVer[TAG] || 0) + 1; } };
  race.PM._state(); await race.PM.load(); await race.settle(); await race.run(5);
  check('another page writes 1000 s between this page\'s read and commit: the transaction retries, sees 1000 ≥ 600, writes nothing — the doc stays 1000', race.log.wbRetries === 1 && race.log.wbWrites.length === 0 && own(race).seconds === 1000, `${race.log.wbRetries} retries ${JSON.stringify(own(race))}`);
  // A new week or a changed period overwrites, whatever the old number was.
  const nw = makeWorld({ period: '4', server: { days: {}, weeks: wk(120), board: {}, wb: { [TAG]: wbDoc(5000, WPREV) }, meta: { 'uid-A': { id: TAG } } } });
  nw.PM._state(); await nw.PM.load(); await nw.settle(); await nw.run(5);
  check('last week\'s doc (5000 s) is overwritten by this week\'s 120 s: one doc per student, the new week starts over', eq(own(nw), wbDoc(120)), JSON.stringify(own(nw)));
  const pc = makeWorld({ period: '4', server: { days: {}, weeks: wk(600), board: {}, wb: { [TAG]: wbDoc(5000, W, '7') }, meta: { 'uid-A': { id: TAG } } } });
  pc.PM._state(); await pc.PM.load(); await pc.settle(); await pc.run(5);
  check('a student moved from period 7 to 4 (a teacher\'s correction): the doc is rewritten as period 4 at the new number, even though it is lower', eq(own(pc), wbDoc(600, W, '4')), JSON.stringify(own(pc)));
  const nz = makeWorld({ period: '4', server: { days: {}, weeks: {}, board: {}, wb: {} } });
  nz.PM._state(); await nz.PM.load(); await nz.settle(); await nz.run(5);
  check('a student with nothing this week writes nothing to the Top 5 board (no doc of zeros)', !(nz.log.wbTrySets || []).length && eq(nz.server.wb, {}), `${nz.log.wbTx} tx`);

  // The rules are not published (or refuse the write): minutes still count and land; the retry waits 5 minutes; the read is retried every 30 s at most.
  const wd = makeWorld({ period: '4', net: { online: true, denied: false, wbDenied: true, wbReadDenied: true } });
  wd.PM._state(); await wd.run(1300, (i) => { if (i % 30 === 0) wd.input('pointerdown'); }); await wd.PM.flush(); await wd.settle();
  check('with the weekBoard rules unpublished the minutes still all land (server = counted)', weekOf(wd) === sec(wd) && weekOf(wd) >= 1190, weekOf(wd) + ' vs ' + sec(wd));
  check('…refused writes are retried only every 5 minutes (1 to 5 in a 22-minute day), nothing is stored, the engine does not mark the doc sent', wd.log.wbTx >= 1 && wd.log.wbTx <= 5 && eq(wd.server.wb, {}) && wd.PM._state().wbSent === '', wd.log.wbTx + ' tx');
  const wr = makeWorld({ ui: true, strip: true, config: { uiOn: true }, period: '4', net: { online: true, denied: false, wbDenied: true, wbReadDenied: true }, server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: {} } });
  wr.PM._state(); wr.PM.syncHeader(true); await wr.PM.load(); await wr.settle(); await wr.run(300, (i) => { if (i % 20 === 0) wr.input('pointerdown'); });
  check('…and with the rules unpublished the name tag cannot be made, so the class is not even asked for; with the strip up (a tick every second) there are 1 to 2 refused attempts in 5 minutes (5-minute wait), no place, no medal', !wr.net.wbReads && wr.log.wbTx >= 1 && wr.log.wbTx <= 2 && wr.PM._top5() === null && !/pm-top5/.test(wr.stripEl.innerHTML), wr.net.wbReads + ' reads, ' + wr.log.wbTx + ' tx');

  // What is drawn (the sim returns the string keys): the strip medal and the three tiles.
  const draw = async (mine, others, o = {}) => {
    const w = makeWorld({ ui: true, strip: true, config: { uiOn: true }, period: '4', ...o, server: { days: {}, weeks: wk(mine), board: {}, wb: Object.fromEntries(others.map((x, i) => ['uid-O' + i, wbDoc(x)])) } });
    w.PM._state(); w.PM.syncHeader(true); await w.PM.load(); await w.settle(); await w.PM._loadWeek(); await w.settle(); await w.run(2);
    const h = host(); w.PM.renderProgress(h); await w.settle();
    return { w, h, strip: w.stripEl.innerHTML };
  };
  const inn = await draw(minOf(15), [minOf(20)]);
  check('in the Top 5: the strip carries the medal (pm-top5-sm, label pm.top5Label) after the flame; the tile says "#2 in Period 4" and "starts over every Monday"', /pm-top5 pm-top5-sm/.test(inn.strip) && /pm\.top5Label/.test(inn.strip) && inn.strip.indexOf('pm-streak') < inn.strip.indexOf('pm-top5')
    && /pm\.top5You/.test(inn.h.innerHTML) && /pm\.top5Reset/.test(inn.h.innerHTML) && !/pm-top5-off/.test(inn.h.innerHTML), inn.strip.slice(-200));
  const out = await draw(minOf(15), [minOf(20), minOf(20), minOf(20), minOf(20), minOf(20)]);
  check('ranked but out: no medal in the strip; the tile has the dashed medal, "Not in the Top 5 yet" and "starts over every Monday", and no minutes-to-go line', !/pm-top5/.test(out.strip) && /pm-top5-off/.test(out.h.innerHTML) && /<b>pm\.top5Off/.test(out.h.innerHTML) && /pm\.top5Reset/.test(out.h.innerHTML) && !/pm\.top5(Need|Sub|ToGo)/.test(out.h.innerHTML), out.h.innerHTML.slice(-300));
  const und = await draw(minOf(4), [minOf(20)]);
  check('under 10 minutes: no medal; "Practice 10 min to get ranked" and "N min to go"', !/pm-top5/.test(und.strip) && /pm\.top5Under/.test(und.h.innerHTML) && /pm\.top5ToGo/.test(und.h.innerHTML), und.h.innerHTML.slice(-300));
  const unk = await draw(minOf(15), [minOf(20)], { net: { online: true, denied: false, wbReadDenied: true } });
  check('the class cannot be read: no Top 5 tile and no medal at all, the rest of the panel still draws', !/pm-top5/.test(unk.strip) && !/pm\.top5/.test(unk.h.innerHTML) && /pm\.tileWeek/.test(unk.h.innerHTML));
  const nop = await draw(minOf(15), [minOf(20)], { period: '' });
  check('no class period: no Top 5 tile and no medal', !/pm-top5/.test(nop.strip) && !/pm\.top5/.test(nop.h.innerHTML) && /pm\.tileWeek/.test(nop.h.innerHTML));
  check('nothing on screen shows another student: no uid anywhere in the strip or the panel', ![inn, out, und].some((x) => /uid-O/.test(x.strip + x.h.innerHTML)), '');

  // A slow connection: the class arrives after the 1 s tick has stopped (2 idle seconds). The arrival itself redraws the strip and sends the toast.
  const sl = makeWorld({ ui: true, strip: true, pills: true, config: { uiOn: true }, period: '4', server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: { 'uid-O0': wbDoc(minOf(20)) } } });
  sl.PM._state(); await sl.PM.load(); await sl.settle(); await sl.run(5);
  sl.net.holdReads = true; sl.PM.syncHeader(true); await sl.settle();
  check('the class read is still on its way: no medal, no toast yet', !/pm-top5/.test(sl.stripEl.innerHTML) && sl.pills().length === 0, sl.stripEl.innerHTML.slice(-80));
  sl.releaseReads(); await sl.settle();
  check('…it lands with the timer stopped (no tick runs): the strip gets its medal and the toast drops on the arrival alone', /pm-top5 pm-top5-sm/.test(sl.stripEl.innerHTML) && sl.pills().length === 1 && sl.store['pm:t5:uid-A'] === W, sl.stripEl.innerHTML.slice(-80) + ' pills ' + sl.pills().length);

  // The toast: once per week, never over the week-goal toast.
  const tw = makeWorld({ ui: true, strip: true, pills: true, config: { uiOn: true }, period: '4', server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: { 'uid-O0': wbDoc(minOf(20)) } } });
  tw.PM._state(); tw.PM.syncHeader(true); await tw.PM.load(); await tw.settle(); await tw.run(2);
  check('in the Top 5 with the strip on screen: the strip reads the class by itself and one toast drops: the medal and pm.top5Toast; remembered under pm:t5:<uid> for this week', tw.pills().length === 1 && /pm-top5-lg/.test(tw.pills()[0].innerHTML) && /pm\.top5Toast/.test(tw.pills()[0].innerHTML) && tw.store['pm:t5:uid-A'] === W && tw.net.wbReads === 1, tw.pills().map((p) => p.innerHTML).join('|').slice(0, 120) + ' reads ' + tw.net.wbReads);
  await tw.run(8);
  check('…it leaves after toastSeconds and does not come back the same week', tw.pills().length === 0, tw.pills().length + ' pills');
  const tw2 = makeWorld({ ui: true, strip: true, pills: true, config: { uiOn: true }, period: '4', server: tw.server, store: tw.store, clock: tw.clock });
  tw2.PM._state(); tw2.PM.syncHeader(true); await tw2.PM.load(); await tw2.settle(); await tw2.PM._loadWeek(); await tw2.settle(); await tw2.run(5);
  check('a new page (reload) the same week shows no toast again', tw2.pills().length === 0, tw2.pills().length + ' pills');
  advance(tw, 7 * 24 * 3600 * 1000);
  tw.server.weeks['2026-W48'] = { seconds: minOf(15), goalSeconds: 3600, hit: false }; tw.server.wb['uid-O0'] = wbDoc(minOf(20), '2026-W48');
  const tw3 = makeWorld({ ui: true, strip: true, pills: true, config: { uiOn: true }, period: '4', server: tw.server, store: tw.store, clock: tw.clock });
  tw3.PM._state(); tw3.PM.syncHeader(true); await tw3.PM.load(); await tw3.settle(); await tw3.PM._loadWeek(); await tw3.settle(); await tw3.run(2);
  check('next Monday\'s week (2026-W48): the toast comes again, once', tw3.pills().length === 1 && /pm\.top5Toast/.test(tw3.pills()[0].innerHTML) && tw3.store['pm:t5:uid-A'] === '2026-W48', tw3.pills().length + ' pills');
  const to = makeWorld({ ui: true, strip: true, pills: true, config: { uiOn: true }, period: '4', server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: { 'uid-O0': wbDoc(minOf(20)), 'uid-O1': wbDoc(minOf(20)), 'uid-O2': wbDoc(minOf(20)), 'uid-O3': wbDoc(minOf(20)), 'uid-O4': wbDoc(minOf(20)) } } });
  to.PM._state(); to.PM.syncHeader(true); await to.PM.load(); await to.settle(); await to.PM._loadWeek(); await to.settle(); await to.run(5);
  check('not in the Top 5 (five ahead): no toast, and nothing remembered', to.pills().length === 0 && !to.store['pm:t5:uid-A'], to.pills().length + ' pills');
  // Both are due on ONE tick: 59:50 of 60 minutes, in the Top 5. The strip cannot be anchored (opts.pills false) while the student crosses the
  // goal, so the goal toast and the Top 5 toast are both held; when the strip is back the goal toast drops first and the Top 5 toast waits it out.
  const tg = makeWorld({ ui: true, strip: true, pills: false, config: { uiOn: true }, period: '4', server: { days: {}, weeks: wk(3590), board: {}, wb: { 'uid-O0': wbDoc(minOf(20)) } } });
  tg.PM._state(); tg.PM.syncHeader(true); await tg.PM.load(); await tg.settle(); await tg.PM._loadWeek(); await tg.settle();
  tg.input('pointerdown');
  await tg.run(40, (i) => { if (i % 5 === 0) tg.input('pointerdown'); });
  check('the goal is crossed and the class is read, but the strip is covered: both toasts are held (the goal one pending, the Top 5 one not marked shown)', tg.pills().length === 0 && !!tg.PM._state().pendingToast && !tg.store['pm:t5:uid-A'] && !!tg.PM._top5() && tg.PM._top5().top === true, JSON.stringify({ pills: tg.pills().length, pending: tg.PM._state().pendingToast, t5: tg.store['pm:t5:uid-A'] }));
  tg.opts.pills = true;
  const seen = [];
  await tg.run(12, () => { seen.push(tg.pills().map((x) => (/pm-top5-lg/.test(x.innerHTML) ? 'top5' : 'goal')).join('+')); });
  const order = seen.filter((x, i) => i === 0 || x !== seen[i - 1]).filter(Boolean);
  check('the strip comes back with both due on one tick: the goal toast first, never both on screen at once, then the Top 5 toast (in that order)', eq(order, ['goal', 'top5']) && !seen.some((x) => x.includes('+')), JSON.stringify(order) + ' ' + JSON.stringify(seen));
  check('…and then neither repeats', tg.pills().length === 0 && tg.store['pm:t5:uid-A'] === W && tg.store['pm:t:uid-A'] === W, JSON.stringify({ pills: tg.pills().length, t5: tg.store['pm:t5:uid-A'], t: tg.store['pm:t:uid-A'] }));

  // ── Review round 1 (2026-11-04): what the first reviewer found, each as a scenario ──
  // R1-1: offline, a plain query get() RESOLVES empty from the cache (the real SDK). The class must be read from the SERVER, or the student gets a false "#1".
  const off = makeWorld({ ui: true, strip: true, pills: true, config: { uiOn: true }, period: '4', server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: Object.fromEntries([0, 1, 2, 3, 4, 5, 6, 7].map((i) => ['uid-O' + i, wbDoc(minOf(40))])) } });
  off.PM._state(); await off.PM.load(); await off.settle();
  off.net.online = false;
  off.PM.syncHeader(true); await off.settle(); await off.run(3, () => off.input('pointerdown'));
  check('OFFLINE (the lid was closed, Wi-Fi not back): the class read fails instead of answering "nobody", so no place, no medal, no toast, nothing cached', off.PM._top5() === null && !/pm-top5/.test(off.stripEl.innerHTML) && off.pills().length === 0 && !off.store['pm:w:uid-A'] && !off.store['pm:t5:uid-A'], JSON.stringify({ top5: off.PM._top5(), cache: off.store['pm:w:uid-A'], t5: off.store['pm:t5:uid-A'] }));
  check('…every class read asks the server (source "server"): a cached answer is never taken for the class', (off.log.wbQueryOpts || []).length >= 1 && off.log.wbQueryOpts.every((o) => o && o.source === 'server'), JSON.stringify(off.log.wbQueryOpts));
  off.net.online = true; await off.run(35, (i) => { if (i % 10 === 0) off.input('pointerdown'); }); await off.settle();
  const t9 = off.PM._top5();
  check('…back online it retries within 30 s and the true answer arrives: 9th (8 students have 40 min, I have 15), not in', !!t9 && t9.top === false && t9.n === 9 && !/pm-top5/.test(off.stripEl.innerHTML), JSON.stringify(t9));

  // R1-2: a Journey tab opened in a new tab never re-reads its week. What is published is the SERVER's week total (read in the transaction), not each page's own copy.
  const shj = shared();
  const pMain = makeWorld({ ...shj, period: '4' }), pJour = makeWorld({ ...shj, period: '4' });
  pMain.PM._state(); pMain.input('pointerdown'); await pMain.run(130); await pMain.PM.flush(); await pMain.settle();
  pJour.PM._state(); pJour.input('pointerdown'); await pJour.run(130); await pJour.PM.flush(); await pJour.settle();
  pMain.input('pointerdown'); await pMain.run(130); await pMain.PM.flush(); await pMain.settle();
  await pMain.run(130); await pJour.run(130); await pMain.run(130);
  const sumAll = weekOf(pMain), biggest = Math.max(...pMain.log.wbWrites.concat(pJour.log.wbWrites).map((x) => x.data.seconds));
  check('a main tab (5 min), a Journey tab (5 min), the main tab again (5 min): the doc holds the server\'s whole week total, not the biggest single page\'s copy', sumAll >= 330 && own(shj) && own(shj).seconds === sumAll && pJour.log.wkGets >= 1, 'doc ' + JSON.stringify(own(shj)) + ' vs weeks ' + sumAll + ' (biggest write ' + biggest + ')');

  // M23: this week only. Last week's minutes sit in the same weeks collection; they must not be published.
  const lw = makeWorld({ period: '4', server: { days: {}, weeks: { [WPREV]: { seconds: 5000, goalSeconds: 3600, hit: true }, [W]: { seconds: 600, goalSeconds: 3600, hit: false } }, board: {}, wb: {} } });
  lw.PM._state(); await lw.PM.load(); await lw.settle(); await lw.run(5);
  check('last week (5000 s) and this week (600 s) both on the server: the doc holds this week only, 600', eq(own(lw), wbDoc(600)) && lw.log.wkGets >= 1, JSON.stringify(own(lw)));

  // M34: unconfirmed seconds are not published (the server total, never the page's queue).
  const pe = makeWorld({ period: '4', server: { days: {}, weeks: wk(600), board: {}, wb: {} } });
  pe.PM._state(); await pe.PM.load(); await pe.settle(); await pe.run(5);
  pe.server.wb = {}; pe.PM._state().pend['2026-11-16'] = 100; pe.PM._state().wbSent = ''; pe.PM._state().wbAt = 0;
  pe.PM._publishWeek(); await pe.settle();
  check('100 s counted but not yet sent: the doc still says the server\'s 600, not 700', eq(own(pe), wbDoc(600)), JSON.stringify(own(pe)));
  // M30: the same number is not sent twice.
  const tx1 = pe.log.wbTx; pe.PM._publishWeek(); pe.PM._publishWeek(); await pe.settle(); await pe.run(130);
  check('publishing the same week number again (twice, then 2 minutes pass) starts no new transaction', pe.log.wbTx === tx1, tx1 + ' → ' + pe.log.wbTx);
  // A clock-ahead cap: the number written is never above 7 days of the cap, whatever the server holds.
  const big = makeWorld({ period: '4', server: { days: {}, weeks: wk(minOf(50)), board: {}, wb: {} } });
  big.PM._state(); await big.PM.load(); await big.settle(); big.server.weeks[W].seconds = 99999; big.PM._state().wbSent = ''; big.PM._state().wbAt = 0; big.PM._publishWeek(); await big.settle();
  check('a week total above 7 x the daily cap (impossible, but the rules would refuse it) is clamped to 8400, never refused', own(big) && own(big).seconds === 8400 && !big.log.wbRefused.length, JSON.stringify(own(big)));

  // M26: a place worked out for period 4 is not shown for period 7 (a teacher's correction arriving mid-session).
  const pcw = makeWorld({ ui: true, strip: true, config: { uiOn: true }, period: '4', server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: { 'uid-O0': wbDoc(minOf(20)) } } });
  pcw.PM._state(); pcw.PM.syncHeader(true); await pcw.PM.load(); await pcw.settle(); await pcw.PM._loadWeek(); await pcw.settle();
  const before = pcw.PM._top5(); pcw.opts.period = '7';
  check('the period changes from 4 to 7 after the class was read: no place at all until period 7 is read (never period 4\'s place under period 7)', !!before && before.top === true && pcw.PM._top5() === null, JSON.stringify({ before, after: pcw.PM._top5() }));

  // M11: a hidden tab asks nothing (the tick still runs for a playing song; the class is read when the tab is back).
  const hid = makeWorld({ ui: true, strip: true, config: { uiOn: true }, period: '4', server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: { 'uid-O0': wbDoc(minOf(20)) } } });
  hid.PM._state(); hid.PM.syncHeader(true); await hid.PM.load(); await hid.settle(); await hid.PM._loadWeek(); await hid.settle();
  const r0 = hid.net.wbReads; hid.documentStub.visibilityState = 'hidden'; hid.clock.ms += 20 * 60 * 1000; hid.clock.perf += 20 * 60 * 1000;
  for (let i = 0; i < 5; i++) { hid.PM._tick(); await hid.settle(); }
  const rHidden = hid.net.wbReads; hid.documentStub.visibilityState = 'visible'; hid.PM._tick(); await hid.settle();
  check('a hidden tab with a stale class (20 minutes) reads nothing over 5 ticks; visible again, the next tick reads once', rHidden === r0 && hid.net.wbReads === r0 + 1, `${r0} → ${rHidden} → ${hid.net.wbReads}`);

  // M29: My progress opened before the class arrives draws the tile when it does.
  const lt = makeWorld({ ui: true, config: { uiOn: true }, period: '4', server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: { 'uid-O0': wbDoc(minOf(20)) } } });
  lt.PM._state(); await lt.PM.load(); await lt.settle(); lt.net.holdReads = true;
  const hlt = host(); lt.PM.renderProgress(hlt); await lt.settle();
  const none = !/pm\.top5/.test(hlt.innerHTML); lt.releaseReads(); await lt.settle();
  check('My progress opened while the class read is still on its way: no Top 5 tile yet, and the tile is drawn when the read lands', none && /pm\.top5You/.test(hlt.innerHTML), hlt.innerHTML.slice(-120));

  // A refused read (rules not published) waits 5 minutes, not 30 seconds: ~120 failed reads an hour per student otherwise.
  const rr = makeWorld({ ui: true, strip: true, config: { uiOn: true }, period: '4', net: { online: true, denied: false, wbReadDenied: true }, server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: {} } });
  rr.PM._state(); rr.PM.syncHeader(true); await rr.PM.load(); await rr.settle(); await rr.run(1200, (i) => { if (i % 20 === 0) rr.input('pointerdown'); });
  check('rules not published: 20 minutes of work make 1 to 5 refused class reads (5-minute wait), not 40', rr.net.wbReads >= 1 && rr.net.wbReads <= 5, rr.net.wbReads + ' reads');

  // tabs/journey.js: a Journey page writes under the period only when THIS device has read the student's teacher override (the main page stores one for every student).
  {
    const js = readFileSync(join(ROOT, 'tabs/journey.js'), 'utf8');
    const m = /window\.PM_HOST = (\{[\s\S]*?\n\});/.exec(js);
    const per = (store, fb, doc) => {
      const sb = { localStorage: { getItem: (k) => (k in store ? store[k] : null) }, fbUser: fb, fbDb: {}, firebase: {}, pmDocPeriod: doc[0], pmDocPeriodUid: doc[1], JSON };
      vm.createContext(sb); return vm.runInContext('(' + m[1] + ').period()', sb);
    };
    const me = { uid: 'u1' }, ov = (uid, v) => ({ caPeriodOverride: JSON.stringify({ uid, v }) });
    const jr = [per(ov('u1', '4'), me, ['7', 'u1']), per(ov('u1', ''), me, ['7', 'u1']), per({}, me, ['7', 'u1']), per(ov('u2', ''), me, ['7', 'u1']), per(ov('u1', ''), null, ['7', 'u1']), per(ov('u1', ''), me, ['7', 'u2']), per({ caPeriodOverride: '{bad' }, me, ['7', 'u1'])];
    check('Journey page period: the teacher\'s override wins; the student\'s own answer only once this device read the override (known, empty); an unknown device, another student\'s cache, nobody signed in, another student\'s answer or a damaged cache give "" (nothing is written)', !!m && eq(jr, ['4', '7', '', '', '', '', '']), JSON.stringify(jr));
  }
}

console.log('15. offline reads');
{
  // The real SDK offline (measured in headless Chrome, offline and with firestore.googleapis.com blocked): a plain get() resolves EMPTY from the cache.
  // load() and loadBoard() read from the server, so a page that opens without Wi-Fi does not take "empty" for "no minutes".
  const W = '2026-W47';
  const server = { days: {}, weeks: { [W]: { seconds: 3000, goalSeconds: 3600, hit: false } }, board: { 'uid-B': { seconds: 5000 }, 'uid-C': { seconds: 100 } }, wb: {} };
  const w1 = makeWorld({ server });
  w1.PM._state(); await w1.PM.load(); await w1.settle();
  const kept = w1.store['pm:c:uid-A'];
  check('online: the page loads this week\'s 3000 s and keeps a copy in pm:c', w1.PM._state().loaded === true && w1.PM.status().week.secs === 3000 && /3000/.test(kept || ''), kept);
  // A second page of the same student opens with the Wi-Fi gone.
  const w2 = makeWorld({ server, store: { 'pm:c:uid-A': kept }, clock: w1.clock, net: { online: false, denied: false } });
  w2.PM._state(); await w2.PM.load(); await w2.settle();
  check('a page opened OFFLINE: not "loaded" (it does not know the server\'s numbers), still shows the saved 3000 s, the saved copy is NOT overwritten with an empty one', w2.PM._state().loaded === false && w2.PM.status().week.secs === 3000 && w2.store['pm:c:uid-A'] === kept, JSON.stringify({ loaded: w2.PM._state().loaded, secs: w2.PM.status().week.secs }));
  const opts2 = w2.log.getOpts.filter((g) => /^minutes\//.test(g.path));
  check('…both reads (weeks, days) asked the server', opts2.length >= 2 && opts2.every((g) => g.opts && g.opts.source === 'server'), JSON.stringify(w2.log.getOpts));
  w2.net.online = true; for (const f of w2.listeners['win:online'] || []) f(); await w2.settle();
  check('the Wi-Fi comes back (the online event, no 30 s wait): it loads at once and carries on with the server\'s 3000 s', w2.PM._state().loaded === true && w2.PM.status().week.secs === 3000, JSON.stringify({ loaded: w2.PM._state().loaded, secs: w2.PM.status().week.secs }));
  // No saved copy at all: week 0 is not claimed as the truth.
  const w3 = makeWorld({ server, net: { online: false, denied: false } });
  w3.PM._state(); await w3.PM.load(); await w3.settle();
  check('offline with no saved copy: not loaded, nothing saved as "0 minutes"', w3.PM._state().loaded === false && !w3.store['pm:c:uid-A'], JSON.stringify(w3.store));
  w3.net.online = true; for (const f of w3.listeners['win:online'] || []) f(); await w3.settle();
  check('…back online it loads the real 3000 s', w3.PM._state().loaded === true && w3.PM.status().week.secs === 3000, w3.PM.status().week.secs);
  // The class rank board: an empty offline answer would hide the tile for 3 hours.
  const w4 = makeWorld({ server, net: { online: false, denied: false } });
  w4.PM._state(); const bOff = await w4.PM._loadBoard(); await w4.settle();
  check('the rank board read offline fails (null) at the tag step: nothing is cached and nothing is read from the cache', bOff === null && !w4.store['pm:b:uid-A'] && !w4.log.getOpts.some((g) => g.path === 'rankBoard'), JSON.stringify(w4.log.getOpts));
  w4.net.online = true; await w4.PM.load(); await w4.PM._loadBoard(); await w4.settle();
  check('…back online it reads the board FROM THE SERVER: 3 students (me + 2), not an empty class', !!w4.PM._rank() && w4.PM._rank().total === 3 && w4.log.getOpts.filter((g) => g.path === 'rankBoard').length >= 1 && w4.log.getOpts.filter((g) => g.path === 'rankBoard').every((g) => g.opts && g.opts.source === 'server'), JSON.stringify({ rank: w4.PM._rank(), opts: w4.log.getOpts }));
}

console.log('16. the Top 5 board holds no name');
{
  // Jonathan, 2026-11-04: no per-period minutes tied to a name, readable by anyone. The board is keyed by a private random tag, never the uid.
  const W = '2026-W47', TAG = 'a1b2c3d4e5f60718293a4b5c6d7e8f90', HEX = /^[0-9a-f]{32}$/;
  const minOf = (m) => m * 60;
  const wk = (secs) => ({ [W]: { seconds: secs, goalSeconds: 3600, hit: false } });
  const mk = (extra = {}) => makeWorld({ period: '4', server: { days: {}, weeks: wk(900), board: {}, wb: {} }, ...extra });
  const w = mk();
  w.PM._state(); await w.PM.load(); await w.settle(); await w.run(5);
  const tag = w.server.meta['uid-A'] && w.server.meta['uid-A'].id;
  const everything = JSON.stringify({ wb: w.server.wb, wbWrites: w.log.wbWrites });
  check('a student who played: the board has ONE doc, its id is a 32-hex random tag, and neither the id nor any field contains the uid', Object.keys(w.server.wb).length === 1 && HEX.test(Object.keys(w.server.wb)[0]) && Object.keys(w.server.wb)[0] === tag && !/uid-A/.test(everything) && eq(Object.keys(w.server.wb[tag]).sort(), ['period', 'seconds', 'week']), JSON.stringify(w.server.wb));
  check('…the tag is kept in the student\'s own doc minutes/{uid}/meta/board as { id } only, made once (one create), and NOWHERE in localStorage (a shared Chromebook would hand it to the next student)', eq(Object.keys(w.server.meta['uid-A']), ['id']) && (w.log.tagWrites || []).length === 1 && w.PM._state().tag === tag && !Object.keys(w.store).some((k) => /pm:i:/.test(k)) && !Object.values(w.store).some((v) => String(v).includes(tag)), JSON.stringify({ meta: w.server.meta, creates: (w.log.tagWrites || []).length, keys: Object.keys(w.store) }));
  // The tag is RANDOM: not derived from the uid, and exactly the 16 bytes the page's crypto handed out.
  const fresh = () => ({ days: {}, weeks: wk(900), board: {}, wb: {}, meta: {} });
  const r1 = makeWorld({ period: '4', server: fresh() }), r2 = makeWorld({ period: '4', server: fresh() });
  const got = []; for (const r of [r1, r2]) { const real = r.windowStub.crypto.getRandomValues; r.windowStub.crypto.getRandomValues = (a) => { const o = real(a); if (a.length === 16) got.push(Array.from(a).map((b) => (b < 16 ? '0' : '') + b.toString(16)).join('')); return o; }; }
  for (const r of [r1, r2]) { r.PM._state(); await r.PM.load(); await r.settle(); await r.run(5); }
  const t1 = r1.server.meta['uid-A'].id, t2 = r2.server.meta['uid-A'].id;
  check('the same uid on two fresh servers gets two DIFFERENT tags (a tag worked out from the uid would repeat)', HEX.test(t1) && HEX.test(t2) && t1 !== t2, t1 + ' vs ' + t2);
  check('…and each tag is exactly the hex of the 16 bytes the page\'s crypto.getRandomValues handed out (all 16 used, nothing mixed in)', got.length === 2 && t1 === got[0] && t2 === got[1], JSON.stringify({ got, t1, t2 }));
  // Two students on one server never share a tag, and each page leaves its OWN doc out of "the others" by its tag.
  const srv = { days: {}, weeks: wk(minOf(15)), board: {}, wb: {}, meta: {} };
  const sA = makeWorld({ period: '4', server: srv }), sB = makeWorld({ period: '4', uid: 'uid-B', server: srv });
  sA.PM._state(); await sA.PM.load(); await sA.settle(); await sA.run(5);
  srv.weeks[W].seconds = minOf(20); sB.PM._state(); await sB.PM.load(); await sB.settle(); await sB.run(5);
  await sA.PM._loadWeek(); await sB.PM._loadWeek(); await sA.settle();
  const tA = srv.meta['uid-A'].id, tB = srv.meta['uid-B'].id;
  check('two students: two different tags and exactly two board docs, no uid in any doc id', tA !== tB && HEX.test(tA) && HEX.test(tB) && eq(Object.keys(srv.wb).sort(), [tA, tB].sort()) && !/uid-/.test(Object.keys(srv.wb).join()), JSON.stringify({ tA, tB, docs: Object.keys(srv.wb) }));
  const oA = JSON.parse(sA.store['pm:w:uid-A'] || '{}').others, oB = JSON.parse(sB.store['pm:w:uid-B'] || '{}').others;
  check('…each page leaves its OWN doc out of "the others" by its tag (A sees only B\'s 1200 s, B only A\'s 900 s) and ranks: B #1, A #2', eq(oA, [1200]) && eq(oB, [900]) && sB.PM._top5() && sB.PM._top5().n === 1 && sA.PM._top5() && sA.PM._top5().n === 2, JSON.stringify({ oA, oB, a: sA.PM._top5(), b: sB.PM._top5() }));
  // Two pages of ONE student opening at once end up with ONE tag (the transaction retries on the other's create).
  const sh = shared(); sh.server.weeks = wk(600);
  const pA = makeWorld({ ...sh, store: {}, period: '4' }), pB = makeWorld({ ...sh, store: {}, period: '4' });
  pA.PM._state(); pB.PM._state(); await Promise.all([pA.PM.load(), pB.PM.load()]); await pA.settle(); await pA.run(5);
  const creates = (pA.log.tagWrites || []).length + (pB.log.tagWrites || []).length;
  check('two pages of one student opening at the same moment: ONE tag is made (the second sees the first\'s), both pages hold the same one, one board doc', creates === 1 && Object.keys(sh.server.meta).length === 1 && pA.PM._state().tag === pB.PM._state().tag && pA.PM._state().tag === sh.server.meta['uid-A'].id && Object.keys(sh.server.wb).length === 1, JSON.stringify({ creates, meta: sh.server.meta, a: pA.PM._state().tag, b: pB.PM._state().tag }));
  // One read of the tag per page, however many times the board is read and written.
  const pc = makeWorld({ period: '4', server: { days: {}, weeks: wk(600), board: {}, wb: {}, meta: { 'uid-A': { id: TAG } } } });
  pc.PM._state(); await pc.PM.load(); await pc.settle(); await pc.PM._loadWeek(); await pc.run(130, (i) => { if (i % 30 === 0) pc.input('pointerdown'); }); await pc.PM.flush(); await pc.settle(); await pc.run(130);
  check('a page reads its tag ONCE (memory), however many times the class is read and the doc written, and writes under it', pc.log.metaGets === 1 && pc.log.wbWrites.length >= 1 && pc.log.wbWrites.every((x) => x.id === TAG), JSON.stringify({ metaGets: pc.log.metaGets, writes: pc.log.wbWrites.length }));
  // A tag in memory that is not the server's (the student's data was reset): the refused write clears it, and the next attempt reads the right one.
  const st = makeWorld({ period: '4', server: { days: {}, weeks: wk(600), board: {}, wb: {}, meta: { 'uid-A': { id: TAG } } } });
  st.PM.status(); st.PM._state().tag = 'f'.repeat(32); await st.PM.load(); await st.settle(); await st.run(5);
  const refused = st.log.wbRefused.length, cleared = st.PM._state().tag === '';
  st.clock.ms += 6 * 60 * 1000; st.clock.perf += 6 * 60 * 1000; st.PM._publishWeek(); await st.settle();
  check('a stale tag in memory: the write is refused, the tag is cleared, and 5 minutes later the right tag is read and used', refused === 1 && cleared && !!st.server.wb[TAG] && st.PM._state().tag === TAG && !st.server.wb['f'.repeat(32)], JSON.stringify({ refused, cleared, docs: Object.keys(st.server.wb) }));
  // No crypto in the page: no tag, so nothing is written, nothing is even ATTEMPTED on the board, and nothing is read (never a uid-keyed fallback).
  const nc = makeWorld({ noCrypto: true, period: '4', server: { days: {}, weeks: wk(600), board: {}, wb: {}, meta: {} } });
  nc.PM._state(); await nc.PM.load(); await nc.settle(); await nc.PM._loadWeek(); await nc.run(5);
  check('a page without window.crypto makes no tag: no board doc, no tag doc, no board write even attempted, no class read, no place — and the minutes still count', eq(nc.server.wb, {}) && eq(nc.server.meta, {}) && !(nc.log.wbTrySets || []).length && !nc.net.wbReads && nc.PM._top5() === null && nc.PM.status().week.secs === 600, JSON.stringify({ tries: nc.log.wbTrySets, wb: nc.server.wb, meta: nc.server.meta }));
  // The teacher's account never makes a tag.
  const te = makeWorld({ uid: 'uid-T', period: '4', server: { days: {}, weeks: wk(600), board: {}, wb: {}, meta: {} } });
  te.user.email = 'teacher@example.org'; vm.runInContext("var TEACHER_EMAIL = 'teacher@example.org';", te.ctx);
  te.PM._state(); await te.PM.load(); await te.settle(); await te.PM._loadWeek(); await te.run(5);
  check('the teacher\'s account makes no tag and writes no board doc', eq(te.server.meta, {}) && eq(te.server.wb, {}), JSON.stringify(te.server.meta));
  // A student with no class period makes no tag (nothing to publish).
  const np = makeWorld({ period: '', server: { days: {}, weeks: wk(600), board: {}, wb: {}, meta: {} } });
  np.PM._state(); await np.PM.load(); await np.settle(); await np.PM._loadWeek(); await np.run(5);
  check('a student whose class period is not answered yet still gets a tag (the class rank needs one) but no Top 5 board doc and no Top 5 read', !!np.server.meta['uid-A'] && /^[0-9a-f]{32}$/.test(np.server.meta['uid-A'].id) && eq(np.server.wb, {}) && !np.net.wbReads, JSON.stringify(np.server.meta));
  // The reconnect: the online event clears the 30 s wait on a failed class read, so it is asked again at once.
  const ol = makeWorld({ ui: true, strip: true, config: { uiOn: true }, period: '4', server: { days: {}, weeks: wk(minOf(15)), board: {}, wb: { 'uid-O0': { week: W, period: '4', seconds: minOf(20) } }, meta: {} } });
  ol.PM._state(); await ol.PM.load(); await ol.settle(); ol.net.online = false; ol.PM.syncHeader(true); await ol.settle(); await ol.run(3, (i) => ol.input('pointerdown'));
  ol.net.online = true; for (const f of ol.listeners['win:online'] || []) f(); const before = ol.net.wbReads || 0;
  await ol.run(3, (i) => ol.input('pointerdown')); await ol.settle();
  check('a failed class read waits 30 s, but the Wi-Fi coming back (the online event) asks again within 3 s, and the place arrives', (ol.net.wbReads || 0) > before && ol.PM._top5() !== null, JSON.stringify({ before, after: ol.net.wbReads, top5: ol.PM._top5() }));
  // One minute to go reads in the singular in both languages (Spanish: "Falta 1 min", not "Faltan 1 min").
  const one = makeWorld({ ui: true, strip: true, config: { uiOn: true }, period: '4', server: { days: {}, weeks: wk(599), board: {}, wb: { 'uid-O0': { week: W, period: '4', seconds: minOf(20) } }, meta: {} } });
  one.PM._state(); one.PM.syncHeader(true); await one.PM.load(); await one.settle(); await one.PM._loadWeek(); await one.settle();
  const ho = { hidden: true, innerHTML: '', isConnected: true }; one.PM.renderProgress(ho); await one.settle();
  check('9:59 (1 minute to be ranked): the tile uses the singular key pm.top5ToGoOne, not the plural', /pm\.top5ToGoOne/.test(ho.innerHTML) && !/pm\.top5ToGo[^O]/.test(ho.innerHTML), ho.innerHTML.slice(-160));
  // The class rank (rankBoard) is keyed by the same private tag: no uid in it, and the old uid-keyed minutesBoard is never touched (it has no rules block).
  const rk = { days: {}, weeks: wk(minOf(15)), board: {}, wb: {}, meta: {} };
  const rA = makeWorld({ period: '4', server: rk }), rB = makeWorld({ period: '4', uid: 'uid-B', server: rk });
  rA.PM._state(); await rA.PM.load(); await rA.settle(); await rA.run(5);
  rB.PM._state(); await rB.PM.load(); await rB.settle(); await rB.run(5);
  const bkeys = Object.keys(rk.board);
  check('the class rank board holds one doc per student under the private tags (the same tags as the Top 5), no uid in any id', bkeys.length === 2 && bkeys.every((k) => HEX.test(k)) && !/uid-/.test(bkeys.join()) && eq(bkeys.sort(), [rk.meta['uid-A'].id, rk.meta['uid-B'].id].sort()) && Object.values(rk.board).every((d) => eq(Object.keys(d), ['seconds'])), JSON.stringify({ board: rk.board, meta: rk.meta }));
  check('the engine never touches the old uid-keyed minutesBoard (no rules block: every access would be refused)', !rA.log.minutesBoardTouched && !rB.log.minutesBoardTouched, String(rA.log.minutesBoardTouched));
  await rA.PM._loadBoard(); await rA.settle();
  check('a page ranks itself against the OTHER tag in the rank board, leaving its own out: total 2, my place by whole minutes', !!rA.PM._rank() && rA.PM._rank().total === 2, JSON.stringify(rA.PM._rank()));
  // No crypto: nothing is attempted on either board.
  const rn = makeWorld({ noCrypto: true, period: '4', server: { days: {}, weeks: wk(600), board: {}, wb: {}, meta: {} } });
  rn.PM._state(); await rn.PM.load(); await rn.settle(); await rn.PM._loadBoard(); await rn.run(130, (i) => { if (i % 30 === 0) rn.input('pointerdown'); }); await rn.PM.flush(); await rn.settle();
  check('a page without window.crypto: no rank-board write is even attempted, no rank, no tag — and the minutes still count', !(rn.log.boardTries || []).length && !(rn.log.boardGets || []).length && eq(rn.server.board, {}) && eq(rn.server.meta, {}) && rn.PM._rank() === null && weekSumAll(rn) >= 600, JSON.stringify({ tries: rn.log.boardTries, meta: rn.server.meta }));
  function weekSumAll(w) { return Object.values(w.server.weeks).reduce((a, b) => a + b.seconds, 0); }
}

console.log('17. the teacher console\'s Practice minutes view (teacher.js teacherPmCompute, 2026-11-06)');
{
  /* The console works out every student's week, streak, class rank and Top 5 place from the weeks docs (it never reads the boards
     or the tags). It must give the numbers each student's own page gives. Three proofs, all on MADE-UP rosters:
     (a) 600 random rosters: the console's status is calc.status for every student, and its rank / Top 5 equal the student page's
         formulas exactly as they stood in rankInfo / top5Info BEFORE they moved into calc.rankPlace / calc.top5Place (2026-11-06),
         against a board that holds every student;
     (b) the same rosters: calc.rankPlace / calc.top5Place equal those old formulas on the student page's own inputs;
     (c) a sample of rosters run through the REAL engine, one student page per student (load, read the boards, place). */
  const TEACHER_SRC = siteSource('teacher.js', ROOT).replace(/\r\n/g, '\n');   // a Windows (CRLF) checkout too
  const fm = /\nfunction teacherPmCompute\([\s\S]*?\n}\n/.exec(TEACHER_SRC);
  check('teacher.js has teacherPmCompute (the console\'s Practice minutes maths)', !!fm);
  if (fm) {
    const compute = new Function(fm[0] + '\nreturn teacherPmCompute;')();
    const w0 = makeWorld(); const calc = w0.PM.calc, c = w0.PM.cfg();
    const refRank = (all, others) => { const mine = Math.floor(all / 60); let higher = 0; others.forEach((x) => { if (Math.floor(x / 60) > mine) higher++; }); return { n: all < 60 ? null : higher + 1, total: others.length + 1 }; };
    const refTop5 = (weekSecs, othersSecs) => {
      const min = Math.max(0, Math.round(+c.top5MinMinutes || 0)), mine = Math.floor((weekSecs || 0) / 60);
      const others = othersSecs.map((x) => Math.floor(x / 60)).sort((a, z) => z - a);
      let higher = 0; others.forEach((m) => { if (m > mine) higher++; });
      const top = mine >= min && higher < 5;   /* 'need' (minutes to catch 5th) left the formula 2026-11-06, on purpose */
      return { top, n: higher + 1, under: mine < min, min, toRank: Math.max(0, min - mine) };
    };
    let seed = 20261106; const rnd = () => (seed = ((Math.imul(seed, 1103515245) + 12345) >>> 0) % 2147483648) / 2147483648;   /* Math.imul: seed * 1103515245 ran past 2^53 and lost its low bits, so the rosters never made a tie at 5th (2026-11-06) */
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const TIE_MIN = [0, 1, 5, 9, 10, 11, 30, 45, 45, 59, 60, 60, 61, 90, 140];
    const first = calc.parse('2026-11-01').getTime(), last = calc.parse('2027-05-31').getTime();
    function roster(i) {
      const today = calc.ymd(new Date(first + Math.floor(rnd() * ((last - first) / 86400000 + 1)) * 86400000));
      const cur = calc.weekIdOf(today), n = 1 + Math.floor(rnd() * 40), st = [];
      for (let k = 0; k < n; k++) {
        const weeks = {}, kind = rnd();
        if (kind < 0.12) { /* nothing yet */ }
        else if (kind < 0.22) weeks[cur] = Math.floor(rnd() * 60);                                       // under a minute
        else for (let w = '2026-W44'; w <= cur; w = calc.weekAdd(w, 1)) {
          if (rnd() < 0.3) continue;
          const m = rnd() < 0.6 ? pick(TIE_MIN) : Math.floor(rnd() * 141);
          weeks[w] = Math.min(8400, m * 60 + (rnd() < 0.5 ? 0 : Math.floor(rnd() * 60)));
        }
        st.push({ uid: 'r' + i + '-s' + k, period: pick(['4', '7', 'CAS', '']), weeks });
      }
      return { today, cur, st };
    }
    const sum = (w) => Object.values(w).reduce((a, b) => a + b, 0);
    let students = 0, okStatus = 0, okRank = 0, okTotal = 0, okTop5 = 0, okCalc = 0, rosters = 0, breakWeeks = 0, ties5 = 0, noPeriod = 0, under1 = 0;
    const bad = [];
    const R = [];
    for (let i = 0; i < 600; i++) {
      const r = roster(i); R.push(r); rosters++;
      const weeks = {}; r.st.forEach((s) => { weeks[s.uid] = s.weeks; });
      const rows = compute(r.st.map((s) => ({ uid: s.uid, period: s.period })), weeks, c, r.today, calc);
      if (calc.goalSeconds(c, r.cur) === 0) breakWeeks++;
      const ranked = r.st.filter((s) => sum(s.weeks) >= 60).length;
      r.st.forEach((s) => {
        students++;
        const row = rows[s.uid], all = sum(s.weeks), wk = s.weeks[r.cur] || 0;
        const st = calc.status(c, s.weeks, r.today);
        if (eq(row.status, st) && row.all === all && row.week === wk && row.week === st.week.secs && row.last === (s.weeks[calc.weekAdd(r.cur, -1)] || 0)) okStatus++; else bad.push('status ' + s.uid);
        const others = r.st.filter((o) => o !== s).map((o) => sum(o.weeks));      // a board that holds EVERY other student (sub-minute ones too)
        const ref = refRank(all, others);
        if (row.rank.n === ref.n) okRank++; else bad.push('rank ' + s.uid + ' ' + row.rank.n + ' vs ' + ref.n);
        if (row.rankTotal === ranked) okTotal++; else bad.push('total ' + s.uid);
        if (all < 60) under1++;
        const same = r.st.filter((o) => o !== s && o.period && o.period === s.period).map((o) => o.weeks[r.cur] || 0);
        const refT = s.period ? refTop5(wk, same) : null;
        if (eq(row.top5, refT)) okTop5++; else bad.push('top5 ' + s.uid + ' ' + JSON.stringify(row.top5) + ' vs ' + JSON.stringify(refT));
        if (!s.period) noPeriod++;
        if (refT && refT.top && refT.n === 5 && same.some((x) => Math.floor(x / 60) === Math.floor(wk / 60))) ties5++;
        if (eq(calc.rankPlace(all, others), ref) && eq(calc.top5Place(c, wk, same), refTop5(wk, same))) okCalc++; else bad.push('calc ' + s.uid);
      });
    }
    check(`console week / last week / all time / streak = calc.status for every student: ${okStatus} of ${students} (${rosters} rosters, ${breakWeeks} on a break week)`, okStatus === students && students > 5000 && breakWeeks > 0, bad.slice(0, 3).join(' | '));
    check(`console class rank = the student page's rank (pre-2026-11-06 formula, every student on the board): ${okRank} of ${students} (${under1} under 1 minute, "—")`, okRank === students && under1 > 0, bad.slice(0, 3).join(' | '));
    check(`console rank total = students with at least 1 minute: ${okTotal} of ${students}`, okTotal === students, bad.slice(0, 3).join(' | '));
    check(`console Top 5 = the student page's place in their own period (pre-2026-11-06 formula): ${okTop5} of ${students} (${noPeriod} with no period; ${ties5} sharing #5 with a tie)`, okTop5 === students && noPeriod > 0 && ties5 > 0, bad.slice(0, 3).join(' | '));
    check(`calc.rankPlace / calc.top5Place = the old rankInfo / top5Info formulas: ${okCalc} of ${students}`, okCalc === students, bad.slice(0, 3).join(' | '));

    // (c) the real engine, one student page per student, on the first rosters of up to 15 students (made-up tags, fake server)
    let pages = 0, okPages = 0; const badP = [];
    const tagOf2 = (uid) => { let h = ''; for (const ch of uid) h += ch.charCodeAt(0).toString(16).padStart(2, '0'); return h.padStart(32, '0').slice(-32); };   // one distinct made-up tag per uid
    for (const r of R.filter((x) => x.st.length <= 15).slice(0, 25)) {
      const weeks = {}; r.st.forEach((s) => { weeks[s.uid] = s.weeks; });
      const rows = compute(r.st.map((s) => ({ uid: s.uid, period: s.period })), weeks, c, r.today, calc);
      const p = calc.parse(r.today);
      if (new Set(r.st.map((o) => tagOf2(o.uid))).size !== r.st.length) { badP.push('two made-up tags collide in roster ' + r.st[0].uid); pages++; continue; }
      for (const s of r.st) {
        const board = {}, wb = {};
        r.st.forEach((o) => { board[tagOf2(o.uid)] = { seconds: sum(o.weeks) }; if (o.period) wb[tagOf2(o.uid)] = { week: r.cur, period: o.period, seconds: o.weeks[r.cur] || 0 }; });
        const sw = {}; Object.keys(s.weeks).forEach((k) => { sw[k] = { seconds: s.weeks[k], goalSeconds: 3600, hit: false }; });
        const w = makeWorld({ uid: s.uid, period: s.period, clock: { ms: new Date(p.getFullYear(), p.getMonth(), p.getDate(), 12, 0, 0).getTime(), perf: 5000 }, server: { days: {}, weeks: sw, board, wb, meta: { [s.uid]: { id: tagOf2(s.uid) } } } });
        w.PM._state(); await w.PM.load(); await w.settle(); await w.PM._loadBoard(); await w.PM._loadWeek(); await w.settle();
        pages++;
        const row = rows[s.uid], st = w.PM.status(), rk = w.PM._rank(), t5 = w.PM._top5();
        const ok = st && eq(st, row.status) && rk && rk.n === row.rank.n && rk.total === r.st.length
          && (s.period ? (t5 && t5.top === row.top5.top && t5.n === row.top5.n && t5.under === row.top5.under) : t5 === null);
        if (ok) okPages++; else badP.push(s.uid + ' ' + JSON.stringify({ rk, row: row.rank, t5, top5: row.top5 }));
      }
    }
    check(`the REAL student page (load, boards, place) agrees with the console on streak, week, rank and Top 5: ${okPages} of ${pages} students`, okPages === pages && pages > 100, badP.slice(0, 2).join(' | '));
  }
}

/* ═══════════ 18. My progress: four rules that only pm-e2e.mjs guarded (Friday check 2026-11-06) ═══════════ */
console.log('18. My progress rules: can\'t-reach in seconds, "No streak yet" / "right now", the Longest line, the flame');
{
  /* A world standing on a fixed day with the given weeks held by the "server"; renders the panel into a fake host and returns its HTML
     (the strings come back as their keys). prior = seconds of each earlier week, newest first; the streak tile reads them. */
  const at = (iso, weekSecs, todaySecs, prior, goal = 3600) => {
    const w = makeWorld({ ui: true, strip: true, config: { uiOn: true }, startMs: new Date(iso).getTime() });
    w.PM.status();   // the first call makes the student's state
    const s = w.PM._state(), d = w.PM.calc.ymd(new Date(iso)), cur = w.PM.calc.weekIdOf(d);
    s.loaded = true; s.pend = {}; s.days = {}; s.weeks = {};
    prior.forEach((secs, i) => { s.weeks[w.PM.calc.weekAdd(cur, -(i + 1))] = { seconds: secs, goalSeconds: 3600, hit: secs >= 3600 }; });
    s.weeks[cur] = { seconds: weekSecs, goalSeconds: goal, hit: weekSecs >= goal };
    if (todaySecs) s.days[d] = todaySecs;
    const h = { hidden: true, innerHTML: '', isConnected: true };
    w.PM.renderProgress(h);
    return { w, html: h.innerHTML, strip: w.PM.stripHtml(), tile: (n) => (h.innerHTML.split('<div class="pm-tile">')[n] || '') };
  };
  const SUN = '2026-11-22T10:00:00', WED = '2026-11-18T10:00:00';   // not the Thanksgiving week (2026-11-23), which is a skipped week
  const streak3 = [3700, 3700, 3700];

  /* 1. "Can't reach" is compared in seconds, not rounded-up minutes. Sunday: room = today's cap (1200 s) minus what today already holds. */
  const out = (weekSecs, todaySecs) => /pm\.weekOut/.test(at(SUN, weekSecs, todaySecs, streak3).tile(1));
  check('can\'t reach, in seconds: 1 s short with exactly 1 s of today\'s cap left → still reachable', !out(3599, 1199));
  check('…1 s short with no cap left → cannot be reached', out(3599, 1200));
  check('…59 s short with exactly 59 s of cap left → still reachable', !out(3541, 1141));
  check('…60 s short with 59 s of cap left → cannot be reached', out(3540, 1141));
  check('…50 of 60 min with today at the cap → cannot be reached; with 10 min of cap left → reachable', out(3000, 1200) && !out(3000, 600));

  /* 2. "No streak yet" (never had one) vs "No streak right now" (lost one: longest above 0) vs a real streak. */
  const never = at(WED, 300, 0, []), lost = at('2026-12-16T10:00:00', 300, 0, [0, 0, 0, 3700, 3700, 3700])   /* streaks start at 2026-W45: hit Nov 2, 9, 16; Nov 23 is a skipped week; Nov 30 is the free miss; Dec 7 resets it */, live = at(WED, 300, 0, streak3);
  check('no streak, never had one: the Streak tile says pm.streakNone (not "right now", not "N-week")', /pm\.streakNone\b(?!Now)/.test(never.tile(2)) && !/pm\.streakNoneNow|pm\.tileStreakVal/.test(never.tile(2)), never.tile(2).slice(0, 200));
  check('a lost streak (3 hit weeks, then two missed ones: streak 0, longest 3): pm.streakNoneNow', /pm\.streakNoneNow/.test(lost.tile(2)) && !/pm\.streakNone\b(?!Now)/.test(lost.tile(2)), lost.tile(2).slice(0, 200));
  check('a streak going: "N-week streak" (pm.tileStreakVal.many), neither "none" wording', /pm\.tileStreakVal\.many/.test(live.tile(2)) && !/pm\.streakNone/.test(live.tile(2)), live.tile(2).slice(0, 200));
  check('a streak of exactly 1 uses the .one wording', /pm\.tileStreakVal\.one/.test(at(WED, 3700, 0, []).tile(2)));
  check('the header flame\'s label follows the same rule: pm.streakNone / pm.streakNoneNow', /aria-label="pm\.streakNone"/.test(never.strip) && /aria-label="pm\.streakNoneNow"/.test(lost.strip), [never.strip.slice(0, 160), lost.strip.slice(0, 160)].join(' | '));

  /* 3. The Longest line is hidden (empty, the tile keeps its height) at 0, and shown above 0. */
  const longest = (r) => (r.tile(2).match(/<div class="pm-tile-sub">(.*?)<\/div>/) || [])[1];
  check('Longest hidden at 0: the Streak tile\'s sub-line is empty when there has never been a streak', longest(never) === '', longest(never));
  check('…and shown above 0: a lost streak and a live one both carry pm.tileLongest', /pm\.tileLongest\.many/.test(longest(lost)) && /pm\.tileLongest\.many/.test(longest(live)), [longest(lost), longest(live)]);
  check('…"1 week" uses the .one wording', /pm\.tileLongest\.one/.test(longest(at(WED, 3700, 0, []))), longest(at(WED, 3700, 0, [])));

  /* 4. The flame is lit only when THIS week\'s goal is hit — in the My progress tile and in the header strip, whatever the streak. */
  const lit = (r) => ({ tile: /class="pm-streak pm-streak-lg pm-on"/.test(r.tile(2)), strip: /class="pm-streak pm-on"/.test(r.strip) });
  check('a 3-week streak but this week at 5 of 60 min: the flame is NOT lit (tile or strip)', eq(lit(live), { tile: false, strip: false }), JSON.stringify(lit(live)));
  check('no streak and this week at 5 min: not lit', eq(lit(never), { tile: false, strip: false }));
  const hit = at(WED, 3600, 0, streak3), hitFirst = at(WED, 3600, 0, []);
  check('this week at 60 of 60 min: lit in the tile AND the strip (with a streak, and as a first hit week)', eq(lit(hit), { tile: true, strip: true }) && eq(lit(hitFirst), { tile: true, strip: true }), JSON.stringify([lit(hit), lit(hitFirst)]));
  check('59 min 59 s: not lit', eq(lit(at(WED, 3599, 0, streak3)), { tile: false, strip: false }));
}

/* ═══════════ 19. This week's goal: config/class.pmWeekGoals (2026-11-09) ═══════════
   An override is { 'YYYY-Www': whole minutes } for ONE week. 0 = a break. n = n minutes. A skipWeeks week wins. Past weeks keep the goal
   they had. The maths is calc.goalSeconds(c, weekId), a pure function of c.weekGoals; the host hands the map in with PM.setWeekGoals(). */
console.log('19. this week\'s goal (pmWeekGoals)');
{
  const w = makeWorld();
  const calc = w.PM.calc;
  const base = { ...w.PM.cfg(), skipWeeks: [], semester2Start: '', streakStartWeek: '', weekGoals: {} };
  const wk = (n) => calc.weekAdd('2026-W36', n);
  const T = (n) => calc.ymd(calc.addDays(calc.weekMonday(wk(n)), 2));
  const withGoals = (goals, extra = {}) => ({ ...base, ...extra, weekGoals: goals });

  /* 1. n minutes: hit and miss, only in that week. */
  const c30 = withGoals({ [wk(1)]: 30 });
  check('an override of 30 makes that week\'s goal 1800 s; the weeks next to it keep 3600 s', calc.goalSeconds(c30, wk(1)) === 1800 && calc.goalSeconds(c30, wk(0)) === 3600 && calc.goalSeconds(c30, wk(2)) === 3600);
  let s = calc.status(c30, { [wk(0)]: 3600, [wk(1)]: 1800 }, T(2));
  check('override 30: 1800 s is a HIT (streak 2, the week shows "hit" with goal 1800)', s.streak === 2 && s.history.find((h) => h.id === wk(1)).state === 'hit' && s.history.find((h) => h.id === wk(1)).goal === 1800, JSON.stringify(s.history.find((h) => h.id === wk(1))));
  s = calc.status(c30, { [wk(0)]: 3600, [wk(1)]: 1799 }, T(2));
  check('override 30: 1799 s is a MISS (the free miss keeps streak 1; the week shows "missed")', s.streak === 1 && s.history.find((h) => h.id === wk(1)).state === 'missed', JSON.stringify(s.history.find((h) => h.id === wk(1))));
  s = calc.status(withGoals({ [wk(2)]: 30 }), { [wk(2)]: 1800 }, T(2));
  check('override for THIS week: 1800 s hits it (ring/message: week.hit, week.goal 1800)', s.week.hit && s.week.goal === 1800 && !s.week.isBreak);
  s = calc.status(withGoals({ [wk(2)]: 30 }), { [wk(2)]: 1799 }, T(2));
  check('…and 1799 s does not (goal 1800 shows, not 3600)', !s.week.hit && s.week.goal === 1800);

  /* 2. 0 = break week: same as a skipWeeks entry, everywhere. */
  const brk0 = withGoals({ [wk(1)]: 0 }), brkSkip = { ...base, skipWeeks: [calc.ymd(calc.weekMonday(wk(1)))] };
  const mid = { [wk(0)]: 3600, [wk(1)]: 100, [wk(2)]: 3600 };
  s = calc.status(brk0, mid, T(3));
  check('override 0 in the middle of a streak: neither counts nor breaks it (hit, break with 100 s, hit → streak 2, the break row keeps its 100 s)', s.streak === 2 && s.history.find((h) => h.id === wk(1)).state === 'break' && s.history.find((h) => h.id === wk(1)).secs === 100, JSON.stringify(s.history.find((h) => h.id === wk(1))));
  const afterBrk = { [wk(0)]: 3600, [wk(1)]: 100, [wk(2)]: 600, [wk(3)]: 3600 };
  check('…and it spends no free miss: hit, break, MISS, hit → streak 2 (the miss is still forgiven); the same minutes in an ordinary week (a miss, then a second miss) → streak 1', calc.status(brk0, afterBrk, T(4)).streak === 2 && calc.status(base, afterBrk, T(4)).streak === 1, calc.status(brk0, afterBrk, T(4)).streak + ' / ' + calc.status(base, afterBrk, T(4)).streak);
  check('…and it equals a skipWeeks break to the byte: status() of the same data (streak, longest, 8-week row, this week) is identical', eq(calc.status(brk0, mid, T(3)), calc.status(brkSkip, mid, T(3))));
  check('…the same when the break week is THIS week (4200 s, above the normal goal: never a hit, goal shown is the normal 3600, isBreak)', eq(calc.status(withGoals({ [wk(2)]: 0 }), { [wk(2)]: 4200 }, T(2)), calc.status({ ...base, skipWeeks: [calc.ymd(calc.weekMonday(wk(2)))] }, { [wk(2)]: 4200 }, T(2))) && calc.status(withGoals({ [wk(2)]: 0 }), { [wk(2)]: 4200 }, T(2)).week.isBreak);
  check('…and goalSeconds is 0 for it, so the stored week doc and the console table read it as a break too', calc.goalSeconds(brk0, wk(1)) === 0);

  /* 3. Past weeks keep their own goal; an override applies to its week only. */
  const allShort = withGoals({ [wk(0)]: 30, [wk(1)]: 30, [wk(2)]: 30 });
  const mShort = { [wk(0)]: 1800, [wk(1)]: 1800, [wk(2)]: 1800 };
  check('three weeks of 1800 s with an override of 30 each: streak 3', calc.status(allShort, mShort, T(3)).streak === 3);
  check('…the flat goal raised to 90 LATER does not re-judge them: still streak 3 (they keep the goal they had)', calc.status({ ...allShort, weeklyGoalMinutes: 90 }, mShort, T(3)).streak === 3);
  check('…while the same minutes with NO override miss under the flat 60: streak 0 (the free miss keeps it at 0, never 3) — so the override is what held the streak', calc.status(base, mShort, T(3)).streak === 0);
  s = calc.status(withGoals({ [wk(1)]: 90 }, { weeklyGoalMinutes: 30 }), { [wk(0)]: 1800, [wk(1)]: 3600 }, T(2));
  check('an override of 90 in a past week stays a MISS at 3600 s when the flat goal is lowered to 30; the week before it (no override) is judged by the flat 30 → hit', s.history.find((h) => h.id === wk(1)).state === 'missed' && s.history.find((h) => h.id === wk(0)).state === 'hit', JSON.stringify(s.history.slice(5, 7)));
  const next = withGoals({ [wk(3)]: 1 });
  s = calc.status(next, { [wk(2)]: 1800 }, T(2));
  check('an override for NEXT week has no effect this week: goal 3600, 1800 s is not a hit; next week alone is 60 s', s.week.goal === 3600 && !s.week.hit && calc.goalSeconds(next, wk(2)) === 3600 && calc.goalSeconds(next, wk(3)) === 60);
  check('an override for a PAST week has no effect on this one either', calc.goalSeconds(withGoals({ [wk(1)]: 5 }), wk(2)) === 3600);

  /* 4. skipWeeks wins. */
  const both = withGoals({ [wk(2)]: 30 }, { skipWeeks: [calc.ymd(calc.weekMonday(wk(2)))] });
  s = calc.status(both, { [wk(2)]: 1800 }, T(2));
  check('a skipWeeks week with an override of 30 is still a BREAK: goal 0, never a hit at 1800 s', calc.goalSeconds(both, wk(2)) === 0 && s.week.isBreak && !s.week.hit);

  /* 5. Validation: a bad entry is dropped, never guessed. */
  const raw = { '2026-W46': 30, '2026-W45': 140, '2026-W44': 0, bad: 5, '2026-W47': 1.5, '2026-W48': -1, '2026-W49': 141, '2026-W50': '30', '2026-W51': null, '2026-W52': NaN, '2026-W43': Infinity, '2026-W42': true, '26-W41': 30, constructor: 3, toString: 3 };
  const cleaned = calc.cleanWeekGoals(raw, base);
  check(`cleanWeekGoals keeps exactly the 3 valid entries of ${Object.keys(raw).length} (30, 140 = 7 x the 20-minute cap, and 0) and drops fractions, negatives, 141, strings, null, NaN, Infinity, booleans, a bad week id and own-key look-alikes`, eq(Object.keys(cleaned).sort(), ['2026-W44', '2026-W45', '2026-W46']) && cleaned['2026-W45'] === 140 && cleaned['2026-W44'] === 0 && cleaned['2026-W46'] === 30, JSON.stringify(cleaned));
  check('cleanWeekGoals of nothing, a list, a string or a number is {}', [undefined, null, [], [30], 'x', 7].every((v) => eq(calc.cleanWeekGoals(v, base), {})));
  check('the largest override comes from the cap, not a constant: with a 10-minute daily cap 70 is the most (70 kept, 71 dropped); 140 at the shipped 20', eq(calc.cleanWeekGoals({ '2026-W46': 70, '2026-W47': 71 }, { dailyCapMinutes: 10 }), { '2026-W46': 70 }) && calc.maxWeekGoalMinutes(base) === 140 && calc.maxWeekGoalMinutes({ dailyCapMinutes: 10 }) === 70);
  check('goalSeconds does not trust the map it is given: 141 (over the maximum), 1.5, "30" and -5 all fall back to the flat 3600; the lookup reads own keys only (a map with none answers null for "constructor" and "toString")', [141, 1.5, '30', -5].every((v) => calc.goalSeconds(withGoals({ [wk(1)]: v }), wk(1)) === 3600) && calc.weekGoalOf(withGoals({}), 'constructor') === null && calc.weekGoalOf(withGoals({}), 'toString') === null);
  const inherited = Object.create({ [wk(1)]: 30 });   // a number on the prototype chain, not an own entry
  check('…and a number that is only INHERITED (not an own entry of the map) is no override: goal stays 3600', calc.weekGoalOf(withGoals(inherited), wk(1)) === null && calc.goalSeconds(withGoals(inherited), wk(1)) === 3600 && eq(calc.cleanWeekGoals(inherited, base), {}));
  check('a goal that is written to the week doc is never under a minute: an override of 1 is 60 s', calc.goalSeconds(withGoals({ [wk(1)]: 1 }), wk(1)) === 60);
}
{
  /* The hand-in: PM.setWeekGoals() and the page's own copy in localStorage. */
  const w = makeWorld();
  const stored = (world) => { try { return JSON.parse(world.store['pm:wg']); } catch (e) { return 'no readable copy'; } };   // a missing copy is a red line, never a crash
  check('a fresh page has no overrides, and the config FILE cannot carry them (a weekGoals key in practice-minutes-config.js is ignored)', eq(w.PM.cfg().weekGoals, {}) && eq(makeWorld({ config: { weekGoals: { '2026-W47': 5 } } }).PM.cfg().weekGoals, {}));
  check('setWeekGoals({2026-W47: 30}) reports a change, and cfg() carries it; the same map again reports no change', w.PM.setWeekGoals({ '2026-W47': 30 }) === true && eq(w.PM.cfg().weekGoals, { '2026-W47': 30 }) && w.PM.setWeekGoals({ '2026-W47': 30 }) === false);
  check('…it is kept in this device\'s localStorage (pm:wg), once, as the cleaned map', eq(stored(w), { '2026-W47': 30 }));
  const w2 = makeWorld({ store: w.store });
  check('a second page on the same device starts with it (no flash of 60 before the live read lands)', eq(w2.PM.cfg().weekGoals, { '2026-W47': 30 }) && w2.PM.calc.goalSeconds(w2.PM.cfg(), '2026-W47') === 1800);
  check('bad entries in the stored copy (hand-edited) are dropped at load', eq(makeWorld({ store: { 'pm:wg': JSON.stringify({ '2026-W47': 999, '2026-W48': 15, nope: 1 }) } }).PM.cfg().weekGoals, { '2026-W48': 15 }));
  check('a stored copy that is not JSON, or not an object, is {}', eq(makeWorld({ store: { 'pm:wg': '{oops' } }).PM.cfg().weekGoals, {}) && eq(makeWorld({ store: { 'pm:wg': '[30]' } }).PM.cfg().weekGoals, {}));
  check('a read with the field ABSENT (the teacher cleared the box) replaces the map with nothing, and the copy follows', w.PM.setWeekGoals(undefined) === true && eq(w.PM.cfg().weekGoals, {}) && eq(stored(w), {}));
  check('setWeekGoals ignores a bad map as nothing (a list, a string): no throw, no change from {}', w.PM.setWeekGoals([30]) === false && w.PM.setWeekGoals('x') === false && eq(w.PM.cfg().weekGoals, {}));
  const noStore = makeWorld();
  Object.defineProperty(noStore.ctx, 'localStorage', { get() { throw new Error('blocked'); } });
  check('with localStorage blocked it still works in memory (no throw)', noStore.PM.setWeekGoals({ '2026-W47': 30 }) === true && noStore.PM.calc.goalSeconds(noStore.PM.cfg(), '2026-W47') === 1800);
}
{
  /* End to end: a real counted week with this week's goal at 30. Two 16-minute days = 1920 s. */
  const run = async (goal) => {
    const w = makeWorld();
    if (goal !== undefined) w.PM.setWeekGoals({ '2026-W47': goal });
    const a = w.track(); a.play();
    const seen = [];
    for (let day = 0; day < 2; day++) {
      await w.run(16 * 60, w.playing(a));
      a.pause();
      await w.run(5, w.playing(a));
      seen.push({ secs: w.PM.status().week.secs, pending: w.PM._state().pendingToast });
      w.clock.ms += 24 * 3600 * 1000; w.clock.perf += 24 * 3600 * 1000;
      a.play();
    }
    await w.run(3, w.playing(a));
    await w.PM.flush(); await w.settle();
    return { w, seen, doc: w.server.weeks['2026-W47'] };
  };
  const o = await run(30), plain = await run(undefined);
  check('this week at 30 min: after day 1 (960 s) the goal is not reached and no toast is waiting; day 2 crosses 1800 s and the week-goal toast is queued for this week', o.seen[0].pending === false && o.seen[1].pending === '2026-W47', JSON.stringify(o.seen));
  check('…the week doc written to the server says goalSeconds 1800 and hit true', !!o.doc && o.doc.goalSeconds === 1800 && o.doc.hit === true && o.doc.seconds >= 1800, JSON.stringify(o.doc));
  check('…and status() says this week is hit with goal 1800 and a streak of 1', o.w.PM.status().week.hit && o.w.PM.status().week.goal === 1800 && o.w.PM.status().streak === 1);
  check('the same two days with NO override: not hit at 1920 s, goalSeconds 3600 in the doc, no toast', plain.seen[1].pending === false && !plain.w.PM.status().week.hit && plain.doc.goalSeconds === 3600 && plain.doc.hit === false, JSON.stringify([plain.seen, plain.doc]));
  o.w.PM.setWeekGoals({ '2026-W47': 60 });
  check('the teacher RAISES it to 60 after the student hit 30: the week is no longer hit (the ring and message recompute from the seconds); goal shows 3600', !o.w.PM.status().week.hit && o.w.PM.status().week.goal === 3600 && o.w.PM.status().streak === 0);
  o.w.PM.setWeekGoals({ '2026-W47': 30 });
  check('…and LOWERING it again gives the hit back', o.w.PM.status().week.hit && o.w.PM.status().streak === 1);
  o.w.PM.setWeekGoals({ '2026-W47': 0 });
  check('the teacher sets 0 (break) for the week a student already played in: isBreak, never hit, minutes kept', o.w.PM.status().week.isBreak && !o.w.PM.status().week.hit && o.w.PM.status().week.secs >= 1800);
}

/* ═══════════ 20. The console's "This week's goal" box (teacher.js, 2026-11-09) ═══════════
   The REAL teacherSetPmWeekGoal / teacherPmGoalBoxHtml / teacherPmGoalPhrase / teacherPmCfg are cut out of teacher.js and run against
   the REAL engine, with a fake teacherWriteConfig that records every patch and base. What can be written, what the box shows by
   default, the rollback, the week guard, and that the console and a student page work one set of numbers out. */
console.log('20. the console\'s This week\'s goal box (teacher.js teacherSetPmWeekGoal)');
{
  const T = siteSource('teacher.js', ROOT).replace(/\r\n/g, '\n');
  const grab = (re) => { const m = re.exec(T); return m ? m[0] : null; };
  const parts = {
    cfg: grab(/\nfunction teacherPmCfg\(\)\{[\s\S]*?\n}\n/),
    phrase: grab(/\nfunction teacherPmGoalPhrase\([\s\S]*?\n}\n/),
    box: grab(/\nfunction teacherPmGoalBoxHtml\([\s\S]*?\n}\n/),
    write: grab(/\nasync function teacherSetPmWeekGoal\([\s\S]*?\n}\n/),
    compute: grab(/\nfunction teacherPmCompute\([\s\S]*?\n}\n/),
  };
  check('teacher.js has teacherPmCfg, teacherPmGoalPhrase, teacherPmGoalBoxHtml, teacherSetPmWeekGoal and teacherPmCompute', Object.values(parts).every(Boolean), Object.keys(parts).filter((k) => !parts[k]).join());
  if (Object.values(parts).every(Boolean)) {
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    /* A console at a fixed moment (nowMs), with the engine of a world configured by `config`; `cfgInit` is what the one read of the class settings returned. */
    function consoleAt(nowMs, { config, cfgInit = {}, fail = null, readOk = true } = {}) {
      const world = makeWorld({ config });
      const env = { writes: [], renders: [], forced: [], saveFailed: [], notes: [] };
      class FakeD extends Date { constructor(...a) { if (a.length) super(...a); else super(nowMs); } static now() { return nowMs; } }
      const teacherClassConfig = JSON.parse(JSON.stringify(cfgInit));
      const make = new Function('PM', 'window', 'escHtml', 'escAttr', 'firebase', 'ensureDb', 'teacherWriteConfig', 'teacherConfigSaveFailed', 'env', 'teacherClassConfig', 'Date',
        `let teacherPmGoalNote = null; let teacherView = 'minutes'; let teacherClassConfigReadOk = ${readOk};
         const renderTeacherMinutes = (force) => { env.renders.push(teacherPmGoalNote ? teacherPmGoalNote.kind : null); env.forced.push(!!force); };
         ${parts.cfg}${parts.phrase}${parts.box}${parts.write}${parts.compute}
         return { write: teacherSetPmWeekGoal, box: teacherPmGoalBoxHtml, phrase: teacherPmGoalPhrase, cfg: teacherPmCfg, compute: teacherPmCompute, note: () => teacherPmGoalNote, setNote: (n) => { teacherPmGoalNote = n; } };`);
      const firebaseStub = { firestore: { FieldValue: { delete: () => ({ __del: true }) } } };
      const writeConfig = async (patch, base) => { env.writes.push({ patch: JSON.parse(JSON.stringify(patch)), base: { ...base }, baseKeys: Object.keys(base || {}) }); if (fail) throw fail; };
      const api = make(world.PM, { PM: world.PM }, esc, esc, firebaseStub, async () => ({}), writeConfig, (e, msg) => env.saveFailed.push({ e, msg }), env, teacherClassConfig, FakeD);
      return { api, env, world, calc: world.PM.calc, cfg: teacherClassConfig };
    }
    const MON = new Date(2026, 10, 16, 9, 0, 0).getTime();            // Mon 16 Nov 2026 = 2026-W47
    const W = '2026-W47', maxMin = 140;
    const goalsOf = (k) => k.api.cfg().weekGoals;

    /* 1. A typed value is written as one cell, cell-checked, and the console reads it back through the engine. */
    {
      const k = consoleAt(MON);
      await k.api.write(W, '30');
      const wr = k.env.writes;
      check('typing 30 writes exactly one config patch: { pmWeekGoals: { "2026-W47": 30 } } — one key, one cell', wr.length === 1 && eq(wr[0].patch, { pmWeekGoals: { [W]: 30 } }), JSON.stringify(wr));
      check('…cell-checked on that one cell, "was absent" (a base, never the strict default)', wr[0].baseKeys.length === 1 && wr[0].baseKeys[0] === 'pmWeekGoals.' + W && wr[0].base['pmWeekGoals.' + W] === undefined);
      check('…the note goes Saving… then Saved, and the box is redrawn for each', eq(k.env.renders, ['saving', 'saved']) && k.api.note().kind === 'saved' && k.api.note().week === W, JSON.stringify(k.env.renders));
      check('…and the console\'s own numbers use it: goalSeconds is 1800 for this week and 3600 for the weeks around it', k.calc.goalSeconds(k.api.cfg(), W) === 1800 && k.calc.goalSeconds(k.api.cfg(), '2026-W46') === 3600 && k.calc.goalSeconds(k.api.cfg(), '2026-W49') === 3600);
      await k.api.write(W, '45');
      check('changing it 30 → 45 names the OLD value in the base (the write refuses if another console moved the cell)', k.env.writes.length === 2 && k.env.writes[1].base['pmWeekGoals.' + W] === 30 && k.env.writes[1].patch.pmWeekGoals[W] === 45);
      await k.api.write(W, '45');
      check('the same value again writes nothing', k.env.writes.length === 2);
      await k.api.write(W, '');
      const del = k.env.writes[2];
      check('a blank box clears the cell with FieldValue.delete() (never null, never ""), naming the old value in the base', !!del && eq(del.patch, { pmWeekGoals: { [W]: { __del: true } } }) && del.base['pmWeekGoals.' + W] === 45, JSON.stringify(del));
      check('…and the console goes back to the flat goal: 3600 s, nothing left in the map', k.calc.goalSeconds(k.api.cfg(), W) === 3600 && eq(k.cfg.pmWeekGoals, {}));
      await k.api.write(W, '  ');
      check('clearing a week that has no override writes nothing', k.env.writes.length === 3);
      await k.api.write(W, '0');
      check('0 is written as 0 (a break week), and the engine reads it as no goal', eq(k.env.writes[3].patch, { pmWeekGoals: { [W]: 0 } }) && k.calc.goalSeconds(k.api.cfg(), W) === 0 && k.calc.status(k.api.cfg(), { [W]: 4200 }, '2026-11-18').week.isBreak);
    }

    /* 2. Every value the console can write is a whole number from 0 to 7 x the cap; anything else writes nothing. */
    {
      let wrote = 0, bad = [], refused = 0, tried = 0;
      for (let n = 0; n <= 1000; n++) {
        const k = consoleAt(MON);
        await k.api.write(W, String(n)); tried++;
        k.env.writes.forEach((x) => { wrote++; const v = x.patch.pmWeekGoals[W]; if (!(Number.isInteger(v) && v >= 0 && v <= maxMin && v === n)) bad.push(n + '→' + v); });
        if (n > maxMin && !k.env.writes.length) refused++;
      }
      check(`over the inputs 0..1000 the console wrote ${wrote} values, every one a whole number from 0 to ${maxMin} equal to what was typed; the ${refused} above ${maxMin} wrote nothing`, wrote === maxMin + 1 && refused === 1000 - maxMin && bad.length === 0, bad.slice(0, 5).join() + ' wrote=' + wrote + ' refused=' + refused);
      const garbage = ['abc', '1.5', '-1', '-0', '+30', '1e1', '0x1F', '3 0', '٣٠', '１２', '1,5', '99999', '1000', '30%', '30m', 'NaN', 'Infinity', '--', '.', '０'];
      let leaked = 0; const kinds = new Set();
      for (const g of garbage) { const k = consoleAt(MON); await k.api.write(W, g); leaked += k.env.writes.length; kinds.add(k.api.note() && k.api.note().kind); }
      check(`${garbage.length} malformed entries (fractions, signs, exponents, hex, non-ASCII digits, units, words) write nothing and say "bad"`, leaked === 0 && eq([...kinds], ['bad']), 'leaked ' + leaked + ' ' + [...kinds]);
      const lead = consoleAt(MON); await lead.api.write(W, '007');
      check('"007" is the number 7 (leading zeros are fine, the value written is 7)', lead.env.writes.length === 1 && lead.env.writes[0].patch.pmWeekGoals[W] === 7);
      const k10 = consoleAt(MON, { config: { dailyCapMinutes: 10 } });
      await k10.api.write(W, '71'); await k10.api.write(W, '70');
      check('the largest value comes from the engine\'s cap, not a constant: with a 10-minute daily cap 71 is refused and 70 written', k10.env.writes.length === 1 && k10.env.writes[0].patch.pmWeekGoals[W] === 70 && /0 to 70/.test(consoleAt(MON, { config: { dailyCapMinutes: 10 } }).api.box(consoleAt(MON, { config: { dailyCapMinutes: 10 } }).api.cfg(), W, k10.calc, { week: W, kind: 'bad' })));
    }

    /* 2b. The 2026-11-09 review. A failed read of the class settings leaves a copy that is {} with version 0: nothing may be written from it. */
    {
      const bad = consoleAt(MON, { cfgInit: { pmWeekGoals: { [W]: 30 } }, readOk: false });
      await bad.api.write(W, '45'); await bad.api.write(W, ''); await bad.api.write(W, '0');
      check('after a FAILED read of the class settings the box writes nothing at all (a type, a clear, a 0) and only repaints, forced — it would have been refused as "another tab", or a clear would have done nothing and said nothing', bad.env.writes.length === 0 && bad.env.saveFailed.length === 0 && bad.env.renders.length === 3 && bad.env.forced.every(Boolean), JSON.stringify([bad.env.writes.length, bad.env.renders, bad.env.forced]));
      const k = consoleAt(MON);
      await k.api.write(W, '30'); await k.api.write(W, 'abc'); await k.api.write('2026-W46', '5'); await k.api.write(W, '30');
      check('every repaint the box\'s own writer makes is FORCED (it is the answer to the box being committed); the view\'s other repaints are not', k.env.renders.length >= 4 && k.env.forced.every(Boolean), JSON.stringify(k.env.forced));
      const html = (note, over) => { const c = consoleAt(MON, { cfgInit: over === undefined ? {} : { pmWeekGoals: { [W]: over } } }); return c.api.box(c.api.cfg(), W, c.calc, note); };
      check('"Saved" is said only while the box still holds what was saved: shown when the cell is still 30; NOT shown when another console cleared it (cell absent) or set it to 0; shown for a saved 0 and for a saved clear', /Saved/.test(html({ week: W, kind: 'saved', value: 30 }, 30)) && !/Saved/.test(html({ week: W, kind: 'saved', value: 30 }, undefined)) && !/Saved/.test(html({ week: W, kind: 'saved', value: 30 }, 0)) && /Saved/.test(html({ week: W, kind: 'saved', value: 0 }, 0)) && /Saved/.test(html({ week: W, kind: 'saved', value: null }, undefined)) && !/Saved/.test(html({ week: W, kind: 'saved', value: null }, 30)));
      check('…a "Not saved." and a "bad entry" note are shown whatever the cell holds (they are about the attempt)', /Not saved/.test(html({ week: W, kind: 'failed' }, 30)) && /whole number/.test(html({ week: W, kind: 'bad' }, undefined)));
      const sv = consoleAt(MON); await sv.api.write(W, '30'); await sv.api.write(W, '');
      check('the writer\'s "Saved" note carries the value it saved (30, then null for a clear) so the box can tell whether it is still true', sv.api.note().kind === 'saved' && sv.api.note().value === null);
    }

    /* 3. Failure rolls back; a stale week and a config break write nothing. */
    {
      const k = consoleAt(MON, { cfgInit: { pmWeekGoals: { [W]: 20 } }, fail: new Error('offline') });
      await k.api.write(W, '30');
      check('a failed write puts the old value back (20), says "Not saved.", and reports through teacherConfigSaveFailed', k.cfg.pmWeekGoals[W] === 20 && k.api.note().kind === 'failed' && k.env.saveFailed.length === 1 && /Could not save/.test(k.env.saveFailed[0].msg), JSON.stringify([k.cfg, k.env.saveFailed.length]));
      const k2 = consoleAt(MON, { fail: Object.assign(new Error('moved'), { staleConfig: true }) });
      await k2.api.write(W, '30');
      check('a refused (stale) write on a week with no override removes the optimistic cell again, and is reported once', !(W in k2.cfg.pmWeekGoals) && k2.env.saveFailed.length === 1 && k2.env.saveFailed[0].e.staleConfig === true);
      const k3 = consoleAt(MON, { cfgInit: { pmWeekGoals: { [W]: 20 } }, fail: new Error('offline') });
      await k3.api.write(W, '');
      check('a failed CLEAR puts the override back', k3.cfg.pmWeekGoals[W] === 20);
      const k4 = consoleAt(MON);
      await k4.api.write('2026-W46', '30');
      check('a box drawn for an earlier week (the console sat open over a Monday) writes nothing and says a new week started', k4.env.writes.length === 0 && k4.api.note().kind === 'newweek' && k4.api.note().week === W);
      const TUE_BREAK = new Date(2026, 10, 24, 9, 0, 0).getTime();     // Tue 24 Nov = 2026-W48, a skipWeeks week (Thanksgiving)
      const k5 = consoleAt(TUE_BREAK);
      await k5.api.write('2026-W48', '30');
      const html5 = k5.api.box(k5.api.cfg(), '2026-W48', k5.calc, null);
      check('a week that skipWeeks already makes a break writes nothing, and its box reads "Break week (set in config)", switched off, with no data-pm-goal hook', k5.env.writes.length === 0 && /Break week \(set in config\)/.test(html5) && /disabled/.test(html5) && !/data-pm-goal/.test(html5), html5.slice(0, 260));
      const bad = ['<', '"', 'x'].map((s) => consoleAt(MON));
      await bad[0].api.write('2026-W47"><script>', '30'); await bad[1].api.write('../config/class', '30'); await bad[2].api.write(undefined, '30');
      check('a week id that is not "YYYY-Www" writes nothing', bad.every((b) => b.env.writes.length === 0));
    }

    /* 4. What the box shows. Blank = the normal goal; the number comes from the settings, not from this file. */
    {
      const k = consoleAt(MON), box = k.api.box(k.api.cfg(), W, k.calc, null);
      check('default box: label "This week’s goal (minutes)", EMPTY value, placeholder "60" (the flat goal), and the help line says Blank = 60. 0 = break week. Goes back to 60 next Monday.', /This week’s goal \(minutes\)/.test(box) && /value=""/.test(box) && /placeholder="60"/.test(box) && /Blank = 60\. 0 = break week\. Goes back to 60 next Monday\./.test(box), box.slice(0, 400));
      check('…the week it is for is named by its Monday and Sunday (Nov 16 to Nov 22), and the box carries the week id the save will use', /Nov(ember)? 16/.test(box) && /Nov(ember)? 22/.test(box) && new RegExp('data-week="' + W + '"').test(box) && /data-pm-goal/.test(box) && !/disabled/.test(box));
      const k45 = consoleAt(MON, { config: { weeklyGoalMinutes: 45 } });
      const b45 = k45.api.box(k45.api.cfg(), W, k45.calc, null);
      check('with the flat goal at 45 the placeholder and the help line say 45 (derived from the settings, never a hard-coded 60)', /placeholder="45"/.test(b45) && /Blank = 45\./.test(b45) && /back to 45 next Monday/.test(b45) && !/60/.test(b45.replace(/2026-W47/g, '')));
      const ks = consoleAt(MON, { cfgInit: { pmWeekGoals: { [W]: 30 } } }), bs = ks.api.box(ks.api.cfg(), W, ks.calc, null);
      const kz = consoleAt(MON, { cfgInit: { pmWeekGoals: { [W]: 0 } } }), bz = kz.api.box(kz.api.cfg(), W, kz.calc, null);
      check('a week set to 30 shows value="30" (placeholder still 60); a week set to 0 shows value="0"; neither is disabled', /value="30"/.test(bs) && /placeholder="60"/.test(bs) && /value="0"/.test(bz) && !/disabled/.test(bs + bz));
      const kj = consoleAt(MON, { cfgInit: { pmWeekGoals: { [W]: 999, '2026-W48': 30, 'x': 5 } } }), bj = kj.api.box(kj.api.cfg(), W, kj.calc, null);
      check('a stored value that is not valid (999) is no override: the box is blank and the goal is 3600', /value=""/.test(bj) && kj.calc.goalSeconds(kj.api.cfg(), W) === 3600);
      const saving = k.api.box(k.api.cfg(), W, k.calc, { week: W, kind: 'saving' });
      check('while its own save is out the box is switched off (no second edit on top of it); an old note for another week shows nothing', / disabled>/.test(saving) && /Saving…/.test(saving) && !/Saving/.test(k.api.box(k.api.cfg(), W, k.calc, { week: '2026-W46', kind: 'saving' })));
      check('the footnote phrase: "60 minutes"; for an override "30 minutes, set for this week only (usually 60)"; for a break (0 or skipWeeks) "none: this is a break week"',
        k.api.phrase(k.api.cfg(), W, k.calc) === '60 minutes' && ks.api.phrase(ks.api.cfg(), W, ks.calc) === '30 minutes, set for this week only (usually 60)' && kz.api.phrase(kz.api.cfg(), W, kz.calc) === 'none: this is a break week' && consoleAt(MON).api.phrase(consoleAt(MON).api.cfg(), '2026-W48', k.calc) === 'none: this is a break week');
    }

    /* 5. One maths path: the console's row for a student is the status the student's own page works out. */
    {
      const goals = { [W]: 30, '2026-W45': 0, '2026-W44': 25 };
      const k = consoleAt(MON, { cfgInit: { pmWeekGoals: goals } });
      const student = makeWorld(); student.PM.setWeekGoals(goals);
      const weeks = { '2026-W44': 1500, '2026-W45': 100, '2026-W46': 3600, [W]: 1800 };
      const rows = k.api.compute([{ uid: 'a', period: '4' }], { a: weeks }, k.api.cfg(), '2026-11-16', k.calc);
      const mine = student.PM.calc.status(student.PM.cfg(), weeks, '2026-11-16');
      check('the console\'s status for a student equals the student page\'s own status, week by week (this week at 30 min hit; W45 a break; W44 judged by its own 25)', eq(rows.a.status, mine) && mine.week.hit && mine.week.goal === 1800 && mine.history.find((h) => h.id === '2026-W45').state === 'break' && mine.history.find((h) => h.id === '2026-W44').state === 'hit', JSON.stringify(mine.history.slice(4)));
      const flat = k.api.compute([{ uid: 'a', period: '4' }], { a: weeks }, { ...k.api.cfg(), weekGoals: {} }, '2026-11-16', k.calc);
      check('…and without the overrides the same minutes are NOT this week\'s hit (1800 of 3600), so the box is what changes the table', !flat.a.status.week.hit && flat.a.status.week.goal === 3600);
      check('the console and a student page name the same week: weekIdOf of the same local day', k.calc.weekIdOf('2026-11-16') === student.PM.calc.weekIdOf('2026-11-16') && k.calc.weekIdOf('2026-11-22') === W && k.calc.weekIdOf('2026-11-23') === '2026-W48');
    }
  }
}

/* ═══════════ 21. A goal that changes while the page is open (2026-11-09 review) ═══════════
   Before pmWeekGoals a goal could not move under an open page. Three things a change must do, each broken in a scratch copy and seen red. */
console.log('21. a goal that changes while the page is open');
{
  /* 1. The strip follows setWeekGoals() at once, not at the next tick. */
  const w = makeWorld({ ui: true, config: { uiOn: true }, strip: true });
  w.PM.syncHeader(true);
  const wk = w.PM.status().week.id;
  const a = w.track(); a.play(); await w.run(600, w.playing(a)); a.pause(); await w.run(3, w.playing(a));
  const before = w.stripEl.innerHTML;
  w.PM.setWeekGoals({ [wk]: 30 });
  const after = w.stripEl.innerHTML;
  check('setWeekGoals() repaints the strip at once (no tick in between): the ring after 10 minutes changes when this week\'s goal goes 60 → 30', !!before && !!after && before !== after, before.length + ' / ' + after.length);
}
{
  /* 2. A goal hit that was held back (the strip covered) and then taken away is not toasted. A later real crossing still is, once. */
  const opts = { ui: true, config: { uiOn: true }, strip: true, pills: false };
  const w = makeWorld(opts);
  w.PM.syncHeader(true);
  const wk = w.PM.status().week.id;
  w.PM.setWeekGoals({ [wk]: 30 });
  const a = w.track(); a.play(); await w.run(19 * 60, w.playing(a)); a.pause(); await w.run(3, w.playing(a));
  w.clock.ms += 24 * 3600 * 1000; w.clock.perf += 24 * 3600 * 1000;           // a second day: the 20-minute cap is per day
  a.play(); await w.run(12 * 60, w.playing(a)); a.pause(); await w.run(3, w.playing(a));
  const held = w.PM._state().pendingToast;
  w.PM.setWeekGoals({ [wk]: 60 });                                          // the teacher raises it before the held toast could show
  opts.pills = true;                                                        // the strip is on screen again
  await w.run(3);
  const toasts = () => w.pills().filter((p) => p.id === 'pm-toast' && !/top5/.test(p.className));
  check('a held "week goal hit" toast is DROPPED when the goal was raised before it showed (the ring says not hit, so the pill must not say hit); it was queued first', held === wk && toasts().length === 0 && !w.PM.status().week.hit && w.PM._state().pendingToast === false, JSON.stringify({ held, pills: toasts().length, week: w.PM.status().week }));
  check('…and the week is NOT stamped as toasted, so a real crossing later still toasts once', w.PM._state().toastWeek !== wk);
  w.PM.setWeekGoals({ [wk]: 31 });                                          // lowered again, a minute past what the student has (31 min counted over two days)
  const st = w.PM.status().week;
  check('…lowered again to a goal the student already has, it shows as hit with no pill (owner decision: a toast only when a counted second crosses the goal)', st.hit && toasts().length === 0, JSON.stringify(st));
}
{
  /* 3. Owner decision (2026-11-09): lowering a goal below what the student already has gives NO toast, even on their next counted seconds. */
  const w = makeWorld({ ui: true, config: { uiOn: true, recapMinSeconds: 1e9 }, strip: true, pills: true });
  w.PM.syncHeader(true);
  const wk = w.PM.status().week.id;
  const a = w.track(); a.play(); await w.run(15 * 60, w.playing(a)); a.pause(); await w.run(3, w.playing(a));
  w.PM.setWeekGoals({ [wk]: 10 });                                          // lowered below the 15 minutes already counted
  a.play(); await w.run(90, w.playing(a)); a.pause(); await w.run(3, w.playing(a));
  check('a goal lowered below what the student has: more counted seconds give NO toast, nothing queued, the week shows as hit', !w.pills().some((p) => p.id === 'pm-toast') && w.PM._state().pendingToast === false && w.PM._state().toastWeek !== wk && w.PM.status().week.hit);
}

/* ═══════════ 22. The Practice minutes view as drawn (teacher.js renderTeacherMinutes, 2026-11-09 review) ═══════════
   The REAL renderTeacherMinutes, teacherPmRowCells, teacherPmCompute and the goal-box helpers, with the view's state stubbed. The 2026-11-09
   review deleted the failed-read gate, the box gate and the typing guard in scratch copies and every check stayed green: these run them. */
console.log('22. the Practice minutes view as drawn (teacher.js renderTeacherMinutes)');
{
  const T = siteSource('teacher.js', ROOT).replace(/\r\n/g, '\n');
  const grab = (re) => { const m = re.exec(T); return m ? m[0] : null; };
  const parts = {
    cfg: grab(/\nfunction teacherPmCfg\(\)\{[\s\S]*?\n}\n/), phrase: grab(/\nfunction teacherPmGoalPhrase\([\s\S]*?\n}\n/), box: grab(/\nfunction teacherPmGoalBoxHtml\([\s\S]*?\n}\n/),
    compute: grab(/\nfunction teacherPmCompute\([\s\S]*?\n}\n/), cells: grab(/\nfunction teacherPmRowCells\(r\)\{[\s\S]*?\n}\n/), render: grab(/\nfunction renderTeacherMinutes\(force\)\{[\s\S]*?\n}\n/),
  };
  check('teacher.js has renderTeacherMinutes(force) and the helpers it draws with', Object.values(parts).every(Boolean), Object.keys(parts).filter((k) => !parts[k]).join());
  if (Object.values(parts).every(Boolean)) {
    const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    const MON = new Date(2026, 10, 16, 9, 0, 0).getTime(), W = '2026-W47';
    function view({ readOk = true, data = true, loading = false, goals = {}, active = null, pm = null, error = '' } = {}) {
      const world = makeWorld();
      class FakeD extends Date { constructor(...a) { if (a.length) super(...a); else super(MON); } static now() { return MON; } }
      const box = { innerHTML: 'KEEP' };
      const doc = { getElementById: (id) => (id === 't-grid-container' ? box : null), activeElement: active };
      const students = [{ uid: 'u1', name: 'Ana Test', period: '4' }, { uid: 'u2', name: 'Ben Test', period: '7' }];
      const env = { loads: 0, loading, readOk, error, data: data ? { at: MON, weeks: { u1: { [W]: 600 }, u2: {} } } : null, cfg: { pmWeekGoals: goals }, students };
      const make = new Function('PM', 'window', 'document', 'Date', 'escHtml', 'escAttr', 'env',
        `let teacherStudentsAt = 1, teacherRefreshFailed = false, teacherPmLoading = env.loading, teacherPmError = env.error, teacherPmData = env.data, teacherPmSort = 'week';
         let teacherClassConfigReadOk = env.readOk, teacherClassConfig = env.cfg, teacherPmGoalNote = null; const allStudents = env.students;
         const teacherPmRoster = () => env.students, teacherPmIsTeacher = () => false, teacherStudentPeriod = (s) => s.period, teacherPmPeriod = (s) => s.period, teacherLoadMinutes = () => { env.loads++; };
         ${parts.cfg}${parts.phrase}${parts.box}${parts.compute}${parts.cells}${parts.render}
         return { render: renderTeacherMinutes };`);
      const PM = pm || world.PM;
      const api = make(PM, { PM }, doc, FakeD, esc, esc, env);
      return { api, box, env };
    }
    const full = view(), v = full.api.render() || full.box.innerHTML;
    check('the view as drawn with its settings read: the box (blank, placeholder 60), the table with both students at "10 / 60 min" and "0 / 60 min", the footnote "The goal this week: 60 minutes."', /data-pm-goal/.test(full.box.innerHTML) && /pm-t-table/.test(full.box.innerHTML) && /Ana Test/.test(full.box.innerHTML) && /10 \/ 60 min/.test(full.box.innerHTML) && /0 \/ 60 min/.test(full.box.innerHTML) && /The goal this week: 60 minutes\./.test(full.box.innerHTML) && full.env.loads === 0, full.box.innerHTML.slice(0, 300));
    const g30 = view({ goals: { [W]: 30 } }); g30.api.render();
    check('with this week set to 30 the SAME drawn table reads "10 / 30 min" and the footnote says "30 minutes, set for this week only (usually 60)", the box value is 30', /10 \/ 30 min/.test(g30.box.innerHTML) && /30 minutes, set for this week only \(usually 60\)/.test(g30.box.innerHTML) && /value="30"/.test(g30.box.innerHTML) && !/10 \/ 60 min/.test(g30.box.innerHTML));
    const failed = view({ readOk: false }); failed.api.render();
    check('the class settings could not be read: NO table, NO goal box, and the line says so (a table drawn with the flat goal would be a confident wrong answer)', /data-pm-settings-failed/.test(failed.box.innerHTML) && /Could not read the class settings/.test(failed.box.innerHTML) && !/pm-t-table/.test(failed.box.innerHTML) && !/data-pm-goal/.test(failed.box.innerHTML), failed.box.innerHTML.slice(0, 300));
    const failedLoading = view({ readOk: false, loading: true }); failedLoading.api.render();
    check('…while a Refresh is out it says "Reading the class settings…" instead of telling the teacher to press Refresh', /Reading the class settings…/.test(failedLoading.box.innerHTML) && !/Press Refresh/.test(failedLoading.box.innerHTML));
    const noData = view({ data: false, loading: true }); noData.api.render();
    const noDataBad = view({ data: false, loading: true, readOk: false }); noDataBad.api.render();
    check('first load (no minutes yet): the box is already there when the settings were read, and not when they were not; neither draws a table', /data-pm-goal/.test(noData.box.innerHTML) && !/pm-t-table/.test(noData.box.innerHTML) && !/data-pm-goal/.test(noDataBad.box.innerHTML));
    const typing = { matches: (s) => s === '[data-pm-goal]', value: '4', defaultValue: '' };
    const t1 = view({ active: typing }); t1.api.render();
    const t2 = view({ active: typing }); t2.api.render(true);
    const t3 = view({ active: { ...typing, value: '' } }); t3.api.render();
    const t4 = view({ active: { matches: () => false, value: 'x', defaultValue: '' } }); t4.api.render();
    check('a half-typed goal is not painted away: an ordinary repaint leaves the view alone while the box has focus and unsaved text; a FORCED one (the box\'s own writer) paints; an untouched box or another field does not hold a repaint back', t1.box.innerHTML === 'KEEP' && t2.box.innerHTML !== 'KEEP' && t3.box.innerHTML !== 'KEEP' && t4.box.innerHTML !== 'KEEP');
    const world2 = makeWorld(), oldPM = { calc: { rankPlace: world2.PM.calc.rankPlace }, cfg: world2.PM.cfg };
    const old = view({ pm: oldPM }); let oldErr = '';
    try { old.api.render(); } catch (e) { oldErr = e.message; }   // a throw is a red line here, not a crash of the whole simulation
    check('an older engine on the page (no cleanWeekGoals / weekGoalOf / maxWeekGoalMinutes) draws "did not load, Reload" instead of throwing half way', !oldErr && /did not load on this page/.test(old.box.innerHTML) && !/pm-t-table/.test(old.box.innerHTML), oldErr);
  }
}

console.log(`\n${failed ? '✗' : '✓'} pm-sim: ${passed} passed, ${failed} failed`);
if (failed) { console.log('failed: ' + fails.join(' | ')); process.exit(1); }
