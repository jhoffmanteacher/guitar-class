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
  server.board ||= {};                                       // minutesBoard/{uid}: { seconds } (the class rank)
  /* sets: every single-document set() on ANY path EXCEPT minutesBoard/{uid}, which goes to
     log.board. The minutes go in one batch, so this stays empty; the heartbeats/{sessionId}
     writer removed 2026-11-04 landed here, and anything but the board landing here fails. */
  const log = { commits: [], sets: [], fetches: [], board: [], boardRefused: [] };

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
  const dbCollection = (path) => ({
    doc: (id) => ({
      path: path + '/' + id,
      /* minutesBoard/{uid}.get(): the page looks at its own doc once, before its first write. */
      get: () => {
        if (path !== 'minutesBoard') return Promise.reject(new Error('doc.get is only faked for minutesBoard'));
        if (net.boardDenied) { log.boardRefused.push({ id, get: true }); return Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' })); }
        (log.boardGets ||= []).push(id);
        return Promise.resolve({ exists: server.board[id] !== undefined, data: () => server.board[id] });
      },
      collection: (sub) => dbCollection(path + '/' + id + '/' + sub),
      set: (data, o) => {
        if (path === 'minutesBoard') {
          /* The rules: the document that results is only { seconds }, a number 0..400 x 1200 (an increment({__inc}) merged
             onto the stored value, as Firestore does); net.boardDenied = the rules are not published. Every attempt is logged. */
          (log.boardTries ||= []).push({ id, data, o });
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
    get: () => (path === 'minutesBoard' && (net.boardDenied || net.denyBoardRead)) ? Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' }))
      : net.denyReads ? (net.reads = (net.reads || 0) + 1, Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' }))) : reply(() => ({
      forEach: (fn) => {
        if (path === 'minutesBoard') { net.boardReads = (net.boardReads || 0) + 1; Object.keys(server.board).forEach((k) => fn(docSnap(k, server.board[k]))); return; }
        const bag = path.endsWith('/days') ? server.days : path.endsWith('/weeks') ? server.weeks : {};
        Object.keys(bag).forEach((k) => fn(docSnap(k, bag[k])));
      },
    })),
    where: (a, op, b) => ({
      __where: [a, op, b],
      get: () => net.denyReads ? (net.reads = (net.reads || 0) + 1, Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' }))) : reply(() => ({
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
  const db = {
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
  const stripEl = opts.strip ? { id: 'pm-header', hidden: true, innerHTML: '', getClientRects: () => [], getBoundingClientRect: () => ({}), contains: () => false } : null;
  const documentStub = {
    visibilityState: 'visible', activeElement: null,
    addEventListener: (ev, fn) => { (listeners['doc:' + ev] ||= []).push(fn); },
    querySelector: () => null,
    querySelectorAll: (sel) => (stripEl && sel === '.pm-strip' ? [stripEl] : []),
    getElementById: (id) => (stripEl && id === 'pm-header' ? stripEl : null),
  };
  const windowStub = {
    PM_HOST: null,
    addEventListener: (ev, fn) => { (listeners['win:' + ev] ||= []).push(fn); },
    crypto: { getRandomValues: (a) => { const seed = (globalThis.__pmSeed = (globalThis.__pmSeed || 0) + 7); for (let i = 0; i < a.length; i++) a[i] = (i * 37 + seed * 13 + 11) % 256; return a; } },
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
  return { stripEl, input, FakeSource, FakeMediaDevices, __timers: timers, drain, releaseReads, ctx, PM, clock, net, server, log, store, session, listeners, documentStub, windowStub, FakeAudio, run, settle, track, playing, user, firebase, db };
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

/* ═══════════ 13. Class rank: minutesBoard/{uid} (2026-11-04) ═══════════ */
console.log('13. class rank');
{
  const weekSum = (w) => Object.values(w.server.weeks).reduce((a, b) => a + b.seconds, 0);
  const boardOf = (w) => w.server.board['uid-A'];

  // The write: one number, the server-confirmed all-time seconds, only when it changed, not more than once per 2 minutes.
  const w = makeWorld();
  w.PM._state();
  w.input('pointerdown');
  await w.run(130);
  await w.PM.flush(); await w.settle();
  await w.run(130);
  check('the board doc exists; every write is { seconds } only on uid-A: the first creates it at an absolute number (the server\'s sum), later ones are increments', w.log.board.length >= 2 && eq(Object.keys(w.log.board[0].data), ['seconds']) && typeof w.log.board[0].data.seconds === 'number'
    && w.log.board.slice(1).every((b) => eq(Object.keys(b.data), ['seconds']) && typeof b.data.seconds === 'object' && b.data.seconds.__inc > 0) && w.log.board.every((b) => b.id === 'uid-A'), JSON.stringify(w.log.board));
  check('…after the last write the board holds exactly the weeks docs\' sum (the confirmed seconds)', boardOf(w) && boardOf(w).seconds > 0 && boardOf(w).seconds === weekSum(w), JSON.stringify(boardOf(w)) + ' vs weeks ' + weekSum(w));
  const n0 = w.log.board.length;
  await w.run(300);
  check('idle for 5 minutes with nothing new to confirm: no further board writes', w.log.board.length === n0, n0 + ' → ' + w.log.board.length);
  check('the board write is a single-document set on minutesBoard only; no other path is ever set()', w.log.sets.length === 0 && w.log.board.every((b) => typeof b.id === 'string'), w.log.sets.length + ' other sets');

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
  check('two pages of one student: the board holds both pages\' minutes, exactly the weeks docs\' sum (not the last page\'s own total)', both >= 200 && sh2.server.board['uid-A'] && sh2.server.board['uid-A'].seconds === both, 'board ' + JSON.stringify(sh2.server.board['uid-A']) + ' vs weeks ' + both);

  // The first write of a page looks at the doc. A student who already has minutes (from before the board existed) and no doc:
  // the doc is CREATED at everything the server has confirmed, history included, then grows with the minutes.
  const wfw0 = makeWorld({ server: { days: {}, weeks: { '2026-W46': { seconds: 3000, goalSeconds: 3600, hit: false } }, board: {} } });
  wfw0.PM._state(); wfw0.input('pointerdown'); await wfw0.run(130); await wfw0.PM.flush(); await wfw0.settle(); await wfw0.run(130);
  check('a student with 3000 s of history and no board doc: the doc is created at the full 3000 s, then grows (= the weeks docs\' sum)', weekSum(wfw0) >= 3100 && boardOf(wfw0).seconds === weekSum(wfw0) && typeof wfw0.log.board[0].data.seconds === 'number' && wfw0.log.board[0].data.seconds === 3000, JSON.stringify(boardOf(wfw0)) + ' vs ' + weekSum(wfw0) + '; first write ' + JSON.stringify(wfw0.log.board[0] && wfw0.log.board[0].data));
  // A doc that exists is never overwritten by a page, only added to (whatever else wrote it, another device included, stays).
  const wfw1 = makeWorld({ server: { days: {}, weeks: { '2026-W46': { seconds: 3000, goalSeconds: 3600, hit: false } }, board: { 'uid-A': { seconds: 500 } } } });
  wfw1.PM._state(); wfw1.input('pointerdown'); await wfw1.run(130); await wfw1.PM.flush(); await wfw1.settle(); await wfw1.run(130);
  const added = weekSum(wfw1) - 3000;
  check('an existing board doc (500 s) is only ever added to: 500 + this page\'s confirmed seconds, never replaced by this page\'s total', added >= 100 && boardOf(wfw1).seconds === 500 + added && wfw1.log.board.every((x) => typeof x.data.seconds === 'object' && x.data.seconds.__inc > 0), JSON.stringify(boardOf(wfw1)) + ' added ' + added + '; writes ' + JSON.stringify(wfw1.log.board.map((x) => x.data.seconds)));
  check('…and the page looks at its own doc exactly once, before its first write', (wfw1.log.boardGets || []).length === 1 && wfw1.log.boardGets[0] === 'uid-A' && (wfw0.log.boardGets || []).length === 1, JSON.stringify(wfw1.log.boardGets) + ' ' + JSON.stringify(wfw0.log.boardGets));

  // A page whose load FAILED does not know the real total: its flushes publish nothing.
  const wnl = makeWorld({ net: { online: true, denied: false, denyReads: true } });
  wnl.PM._state(); wnl.input('pointerdown'); await wnl.run(130); await wnl.PM.flush(); await wnl.settle();
  check('a page whose load was refused but whose minutes still landed writes nothing to the board (it does not know the total)', weekSum(wnl) > 0 && !(wnl.log.boardTries || []).length && !(wnl.log.boardGets || []).length, weekSum(wnl) + ' s landed, ' + (wnl.log.boardTries || []).length + ' board tries');

  // The teacher's own account (signed in on a normal page, or on a projected Journey page) is never on the board.
  const wte = makeWorld({ uid: 'uid-T', server: { days: {}, weeks: {}, board: { 'uid-B': { seconds: 300 } } } });
  wte.user.email = 'teacher@example.org'; vm.runInContext("var TEACHER_EMAIL = 'teacher@example.org';", wte.ctx);
  wte.PM._state(); wte.input('pointerdown'); await wte.run(130); await wte.PM.flush(); await wte.settle(); await wte.run(130); await wte.PM._loadBoard();
  check('the teacher\'s account counts its minutes but writes nothing to the board and gets no rank', weekSum(wte) > 0 && !(wte.log.boardTries || []).length && wte.PM._rank() === null, weekSum(wte) + ' s, ' + (wte.log.boardTries || []).length + ' tries, rank ' + JSON.stringify(wte.PM._rank()));

  // The rank: 1 + the number of OTHER students with strictly more seconds; total counts me; my own doc is ignored.
  const sv = () => ({ days: {}, weeks: {}, board: { 'uid-B': { seconds: 100 }, 'uid-C': { seconds: 300 }, 'uid-D': { seconds: 600 }, 'uid-E': { seconds: 5000 }, 'uid-A': { seconds: 99999 } } });
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

console.log(`\n${failed ? '✗' : '✓'} pm-sim: ${passed} passed, ${failed} failed`);
if (failed) { console.log('failed: ' + fails.join(' | ')); process.exit(1); }
