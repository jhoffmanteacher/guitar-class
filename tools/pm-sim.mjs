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
  const clock = { ms: opts.startMs ?? new Date(2026, 10, 16, 9, 0, 0).getTime(), perf: 5000 };   // Mon 16 Nov 2026, 9:00 local
  const timers = [];
  let timerId = 1;
  const store = {}, session = {};
  const listeners = {};
  const net = { online: true, denied: false, commitDelay: 0, aggregate: 5 };
  const server = { days: {}, weeks: {}, heartbeats: {} };   // what Firestore holds
  const log = { commits: [], heartbeats: [], fetches: [] };

  class FakeDate extends Date {
    constructor(...a) { if (a.length) super(...a); else super(clock.ms); }
    static now() { return clock.ms; }
  }
  const user = { uid: opts.uid || 'uid-A', getIdToken: () => Promise.resolve('tok-' + (opts.uid || 'uid-A')) };
  const auth = { currentUser: user };
  const inc = (n) => ({ __inc: n });
  const stamp = { __server: true };
  const docSnap = (id, data) => ({ id, data: () => data });
  const dbCollection = (path) => ({
    doc: (id) => ({
      path: path + '/' + id,
      collection: (sub) => dbCollection(path + '/' + id + '/' + sub),
      set: (data) => {
        if (path === 'heartbeats') { log.heartbeats.push({ id, data }); return Promise.resolve(); }
        return Promise.resolve();
      },
    }),
    get: () => Promise.resolve({
      forEach: (fn) => {
        const bag = path.endsWith('/days') ? server.days : path.endsWith('/weeks') ? server.weeks : {};
        Object.keys(bag).forEach((k) => fn(docSnap(k, bag[k])));
      },
    }),
    where: (a, op, b) => ({
      __where: [a, op, b],
      get: () => Promise.resolve({
        forEach: (fn) => { Object.keys(server.days).filter((k) => k >= b).forEach((k) => fn(docSnap(k, server.days[k]))); },
      }),
    }),
  });
  const db = {
    collection: (c) => dbCollection(c),
    batch: () => {
      const ops = [];
      return {
        set: (ref, data, o) => { ops.push({ path: ref.path, data, o }); },
        commit: () => {
          if (net.denied) { const e = new Error('denied'); e.code = 'permission-denied'; return Promise.reject(e); }
          if (!net.online) return new Promise(() => {});
          // The rules: a day above the cap is refused (1200 s), as in firestore.rules.
          for (const op of ops) {
            if (/\/days\//.test(op.path)) {
              const id = op.path.split('/').pop();
              const next = (server.days[id]?.seconds || 0) + op.data.seconds.__inc;
              if (next > 1200) { const e = new Error('cap'); e.code = 'permission-denied'; return Promise.reject(e); }
            }
          }
          for (const op of ops) {
            const id = op.path.split('/').pop();
            if (/\/days\//.test(op.path)) server.days[id] = { seconds: (server.days[id]?.seconds || 0) + op.data.seconds.__inc };
            else server.weeks[id] = { seconds: (server.weeks[id]?.seconds || 0) + op.data.seconds.__inc, goalSeconds: op.data.goalSeconds, hit: op.data.hit };
          }
          log.commits.push(ops.map((o) => ({ path: o.path, data: o.data })));
          return Promise.resolve();
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
  });
  class FakeAudio {
    constructor(src) { this.src = src; this.currentSrc = src; this.paused = true; this.ended = false; this.muted = false; this.volume = 1; this.readyState = 4; this.currentTime = 0; this.tagName = 'AUDIO'; this.frozen = false; }
    play() { this.paused = false; return Promise.resolve(); }
    pause() { this.paused = true; }
  }
  const documentStub = {
    visibilityState: 'visible',
    addEventListener: (ev, fn) => { (listeners['doc:' + ev] ||= []).push(fn); },
    querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
  };
  const windowStub = {
    PM_HOST: null,
    addEventListener: (ev, fn) => { (listeners['win:' + ev] ||= []).push(fn); },
    crypto: { getRandomValues: (a) => { for (let i = 0; i < a.length; i++) a[i] = (i * 37 + 11) % 256; return a; } },
    innerWidth: 1366,
  };
  const ctx = vm.createContext({
    window: windowStub, document: documentStub, HTMLMediaElement: FakeAudio, firebase,
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
      if (/runAggregationQuery$/.test(url)) return Promise.resolve({ ok: true, json: () => Promise.resolve([{ result: { aggregateFields: { n: { integerValue: String(net.aggregate) } } } }]) });
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
  return { ctx, PM, clock, net, server, log, store, session, listeners, documentStub, windowStub, FakeAudio, run, settle, track, playing, user, firebase, db };
}
/* Everything counted so far: queued + already acknowledged by the server. */
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
  check('4th period meets 3 days, 7th meets 5 (the spec)', calc.normalMeetings(c, '4') === 3 && calc.normalMeetings(c, '7') === 5);
  check('normal week goal = 30 min = 1800 s for both', calc.goalSeconds(c, '2026-W45', '4') === 1800 && calc.goalSeconds(c, '2026-W45', '7') === 1800);
  // Wed 11 Nov 2026 is Veterans Day (in the placeholder list) → W46 has one fewer meeting for both.
  check('proration: Veterans Day week → 4th 2/3 of 1800 = 1200, 7th 4/5 = 1440',
    calc.goalSeconds(c, '2026-W46', '4') === 1200 && calc.goalSeconds(c, '2026-W46', '7') === 1440, calc.goalSeconds(c, '2026-W46', '4') + ',' + calc.goalSeconds(c, '2026-W46', '7'));
  check('Thanksgiving week and winter break have zero meetings (goal 0 = skipped)',
    calc.goalSeconds(c, '2026-W48', '7') === 0 && calc.goalSeconds(c, '2026-W48', '4') === 0 && calc.goalSeconds(c, '2026-W52', '7') === 0);
  check('"4 meetings of 5" week from the shortWeeks list overrides the count',
    calc.goalSeconds({ ...c, shortWeeks: [{ week: '2026-W47', meetings: { '7': 2 } }] }, '2026-W47', '7') === 720);
  check('a period missing from meetingDays (CAS) uses the default weekdays (5)', calc.normalMeetings(c, 'CAS') === 5 && calc.normalMeetings(c, '') === 5);
}

/* ═══════════ 2. Streaks ═══════════ */
console.log('2. week streak');
{
  const w = makeWorld();
  const calc = w.PM.calc;
  const base = { ...w.PM.cfg(), noSchool: [], semesters: [{ start: '2026-08-01', end: '2026-12-31' }, { start: '2027-01-01', end: '2027-06-30' }], shortWeeks: [] };
  const wk = (n) => calc.weekAdd('2026-W36', n);                          // W36 = Mon 31 Aug 2026
  const mk = (pattern, today) => {                                         // 'H' hit, 'x' miss, '.' = no play
    const m = {};
    pattern.split('').forEach((ch, i) => { if (ch === 'H') m[wk(i)] = 1800; else if (ch === 'x') m[wk(i)] = 600; });
    return calc.status(base, m, '7', today);
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
  check('misses before any hit: first free, second resets, then 2 hits → 2', s.streak === 2, 'got ' + s.streak);
  // Break (zero-meeting) week in the middle: skipped.
  const brk = { ...base, noSchool: [[calc.ymd(calc.weekMonday(wk(2))), calc.ymd(calc.addDays(calc.weekMonday(wk(2)), 6))]] };
  const m2 = {}; m2[wk(0)] = 1800; m2[wk(1)] = 1800; m2[wk(3)] = 1800;
  s = calc.status(brk, m2, '7', T(4));
  check('a break week between two hits neither counts nor breaks: streak 3', s.streak === 3, 'got ' + s.streak);
  check('…and the break shows as "break" in the 8-week row', s.history.some((h) => h.state === 'break'));
  // Freeze is per SEMESTER: a miss in each semester is forgiven.
  const sem = { ...base, semesters: [{ start: '2026-08-01', end: '2026-09-27' }, { start: '2026-09-28', end: '2027-06-30' }] };
  const m3 = {}; [0, 2, 3, 5].forEach((i) => { m3[wk(i)] = 1800; }); m3[wk(1)] = 100; m3[wk(4)] = 100;
  s = calc.status(sem, m3, '7', T(6));
  check('one miss in each of two semesters is forgiven twice: H x H H x H → streak 4', s.streak === 4, 'got ' + s.streak);
  const one = { ...base, semesters: [{ start: '2026-08-01', end: '2027-06-30' }] };
  s = calc.status(one, m3, '7', T(6));
  check('the same pattern inside ONE semester resets at the second miss: streak 1', s.streak === 1, 'got ' + s.streak);
  // Longest.
  s = mk('HHHxxHH', T(7));
  check('longest streak is remembered after a reset (3), current 2', s.longest === 3 && s.streak === 2, s.longest + '/' + s.streak);
  // Proration decides hit: a short week is hit with less.
  const short = { ...base, noSchool: [calc.ymd(calc.addDays(calc.weekMonday(wk(0)), 1))] };    // Tue off → 4/5 → 1440
  s = calc.status(short, { [wk(0)]: 1440 }, '7', T(1));
  check('a short week is a hit at its smaller goal (1440 s)', s.streak === 1);
  s = calc.status(short, { [wk(0)]: 1439 }, '7', T(1));
  check('…and 1439 s misses it (the free miss keeps streak 0 → 0, no hit)', s.streak === 0);
  // streakStartWeek.
  s = calc.status({ ...base, streakStartWeek: wk(2) }, { [wk(0)]: 1800, [wk(1)]: 1800, [wk(2)]: 1800 }, '7', T(3));
  check('streakStartWeek ignores earlier weeks', s.streak === 1, 'got ' + s.streak);
  // History is 8 squares ending on this week.
  s = mk('HH', T(2));
  check('history = 8 weeks, oldest first, last is "now"', s.history.length === 8 && s.history[7].state === 'now' && s.history[6].id === wk(1));
  // No data at all.
  s = calc.status(base, {}, '7', T(1));
  check('a brand-new student: streak 0, longest 0, no crash', s.streak === 0 && s.longest === 0);
  // Break week now: ring uses the normal goal, nothing is "hit".
  s = calc.status(brk, {}, '7', T(2));
  check('during a break week the week shows the normal goal and is flagged isBreak', s.week.isBreak && s.week.goal === 1800 && !s.week.hit);
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
  check('a guitar-note file, a recording blob and a non-backing mp3 count 0 s', sec(w2) === 0 && !Object.keys(w2.PM._state()?.days || {}).length);

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
  check('the week doc rolls up { seconds, goalSeconds: 1800, hit: false } (1200 < 1800)', wk && wk.goalSeconds === 1800 && wk.hit === false && wk.seconds === (w.server.days[todayStr].seconds), JSON.stringify(wk));
  check('every commit writes ONLY days/{date}.seconds and weeks/{id}.{seconds,goalSeconds,hit}',
    w.log.commits.every((c) => c.every((o) => /^minutes\/uid-A\/(days|weeks)\//.test(o.path) && (/days/.test(o.path) ? eq(Object.keys(o.data), ['seconds']) : eq(Object.keys(o.data).sort(), ['goalSeconds', 'hit', 'seconds'])))));
}
{
  // Offline: nothing sent, nothing lost; online: it all goes.
  const w = makeWorld();
  const a = w.track(); a.play();
  w.net.online = false;
  await w.run(130, w.playing(a));
  check('offline for 130 s: no commit was attempted', w.log.commits.length === 0);
  const q = JSON.parse(w.store['pm:q:uid-A'] || 'null');
  check('…and the seconds are in localStorage (pm:q:<uid>) ≈ 130', q && q.days[todayStr] >= 125 && q.days[todayStr] <= 130, JSON.stringify(q));
  w.net.online = true;
  for (const f of w.listeners['win:online'] || []) f();
  await w.run(3, w.playing(a));
  const st = w.PM._state();
  check('back online: the queue is sent and cleared', (w.server.days[todayStr]?.seconds || 0) >= 125 && (st.pend[todayStr] || 0) <= 5, `server ${w.server.days[todayStr]?.seconds} pend ${st.pend[todayStr]}`);
}
{
  // Closed tab leaves a queue; the next page load (same student) sends it.
  const w = makeWorld();
  const a = w.track(); a.play();
  w.net.online = false;
  await w.run(70, w.playing(a));
  const saved = { ...w.store };
  const w2 = makeWorld();
  Object.assign(w2.store, saved);
  const b = w2.track(); b.play();
  await w2.run(5, w2.playing(b));
  await w2.PM.flush(); await w2.settle();
  check('a queue left by a closed tab is picked up by the next load and sent', (w2.server.days[todayStr]?.seconds || 0) >= 70, 'server ' + w2.server.days[todayStr]?.seconds);
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
  check('rules published later → after the 5-minute back-off everything lands', (w.server.days[todayStr]?.seconds || 0) >= 190 && (w.PM._state().pend[todayStr] || 0) <= 70, `server ${w.server.days[todayStr]?.seconds} pend ${w.PM._state().pend[todayStr]}`);
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
  check('…increment transforms for the day and the week doc, week carries goalSeconds + hit',
    dayW && dayW.updateTransforms[0].increment.integerValue > 0 && weekW && weekW.update.fields.goalSeconds.integerValue === '1800' && weekW.update.fields.hit.booleanValue === false);
  check('…and what it sent leaves the queue (not sent twice next visit)', Object.values(w.PM._state().pend).reduce((x, y) => x + y, 0) === 0 && !w.store['pm:q:uid-A']);
}
{
  // Student switch on a shared Chromebook.
  const w = makeWorld();
  const a = w.track(); a.play();
  w.net.online = false;
  await w.run(20, w.playing(a));
  const mine = JSON.parse(w.store['pm:q:uid-A']).days[todayStr];
  w.user.uid = 'uid-B';
  await w.run(20, w.playing(a));
  check('a different student signing in does not inherit the first one\'s queue', w.PM._state().uid === 'uid-B' && (w.PM._state().pend[todayStr] || 0) <= 21 && JSON.parse(w.store['pm:q:uid-A']).days[todayStr] >= mine && JSON.parse(w.store['pm:q:uid-A']).days[todayStr] <= 21,
    `A queue ${mine} → ${JSON.parse(w.store['pm:q:uid-A']).days[todayStr]}`);
}

/* ═══════════ 5. Goal ═══════════ */
console.log('5. the weekly goal');
{
  // Hit the goal across several days: 4 days × 8 min = 32 min ≥ 30 in the week.
  const w = makeWorld();
  const a = w.track(); a.play();
  for (let day = 0; day < 4; day++) {
    await w.run(8 * 60, w.playing(a));
    a.pause();
    await w.run(5, w.playing(a));
    w.clock.ms += 24 * 3600 * 1000; w.clock.perf += 24 * 3600 * 1000;      // jump to the same time the next day
    a.play();
  }
  await w.run(3, w.playing(a));
  await w.PM.flush(); await w.settle();
  const wk = w.server.weeks['2026-W47'];
  check('four 8-minute days add up in the week doc and flip hit=true at 1800 s', wk && wk.seconds >= 1800 && wk.hit === true, JSON.stringify(wk));
  check('each day is its own doc: four days of exactly 480 s (plus the 3 s tail of the fifth morning)', Object.values(w.server.days).filter((d) => d.seconds === 480).length === 4 && Object.values(w.server.days).every((d) => d.seconds <= 480), JSON.stringify(w.server.days));
  check('status() says this week is hit and the streak is 1', w.PM.status().week.hit === true && w.PM.status().streak === 1);
}

/* ═══════════ 6. Heartbeat ═══════════ */
console.log('6. heartbeats');
{
  const w = makeWorld();
  const a = w.track(); a.play();
  await w.run(95, w.playing(a));
  const hb = w.log.heartbeats;
  check('a heartbeat about every 30 s while counting (95 s → 4)', hb.length >= 3 && hb.length <= 4, hb.length + ' sent');
  check('the doc holds ONLY { period, lastSeen } and period is the student\'s section', hb.every((h) => eq(Object.keys(h.data).sort(), ['lastSeen', 'period']) && h.data.period === '7'));
  check('lastSeen is the SERVER timestamp (the rules require it to equal request.time)', hb.every((h) => h.data.lastSeen && h.data.lastSeen.__server === true));
  check('the id is 24 hex characters, the same all session, and is NOT the uid', hb.every((h) => /^[0-9a-f]{24}$/.test(h.id) && h.id === hb[0].id && !h.id.includes('uid')));
  check('the id lives in sessionStorage only', /^[0-9a-f]{24}$/.test(w.session.pmSid) && !Object.values(w.store).some((v) => String(v).includes(w.session.pmSid)));
  const w2 = makeWorld({ period: '' });
  const b = w2.track(); b.play();
  await w2.run(65, w2.playing(b));
  check('no period chosen yet → no heartbeat (the doc needs one), minutes still count', w2.log.heartbeats.length === 0 && sec(w2) + (w2.PM._state().days[todayStr] || 0) >= 60);
  const w3 = makeWorld();
  const c = w3.track(); c.play();
  w3.net.online = false;
  await w3.run(65, w3.playing(c));
  check('offline: no heartbeat attempts', w3.log.heartbeats.length === 0);
  const w4 = makeWorld();
  const d = w4.track(); d.play(); d.pause();
  await w4.run(65, w4.playing(d));
  check('nothing playing → no heartbeat', w4.log.heartbeats.length === 0);
}

/* ═══════════ 7. uiOn is off by default and counting does not need it ═══════════ */
console.log('7. defaults');
{
  const w = makeWorld();
  check('shipped config: uiOn is false', w.ctx.PRACTICE_MINUTES_CONFIG.uiOn === false);
  check('shipped config: goal 30, cap 20, 4th meets 3 days, 7th meets 5', w.ctx.PRACTICE_MINUTES_CONFIG.weeklyGoalMinutes === 30 && w.ctx.PRACTICE_MINUTES_CONFIG.dailyCapMinutes === 20
    && w.ctx.PRACTICE_MINUTES_CONFIG.meetingDays['4'].length === 3 && w.ctx.PRACTICE_MINUTES_CONFIG.meetingDays['7'].length === 5);
  check('uiOn false → stripHtml() is empty', w.PM.stripHtml() === '');
  const a = w.track(); a.play();
  await w.run(70, w.playing(a));
  check('…yet minutes were counted and written', (w.server.days[todayStr]?.seconds || 0) >= 55);
}


/* ═══════════ 8. The "N playing" lookup (uiOn) ═══════════ */
console.log('8. live count');
{
  const w = makeWorld({ ui: true, config: { uiOn: true } });
  const a = w.track(); a.play();
  await w.run(3, w.playing(a));
  w.net.aggregate = 7;
  w.PM._pollLive(); await w.settle();
  const f = w.log.fetches.find((x) => /runAggregationQuery$/.test(x.url));
  check('one REST runAggregationQuery (a count — about one read, not one per player)', !!f && f.init.method === 'POST' && new RegExp((process.env.PM_PROJECT || 'guitar-class-test') + '/databases/\\(default\\)/documents:runAggregationQuery$').test(f.url));
  const body = f && JSON.parse(f.init.body).structuredAggregationQuery;
  const filt = body && body.structuredQuery.where.compositeFilter.filters;
  check('…over heartbeats, period == the student\'s period ("7") and lastSeen > ~60 s ago',
    body && body.structuredQuery.from[0].collectionId === 'heartbeats' && filt[0].fieldFilter.value.stringValue === '7'
    && filt[1].fieldFilter.op === 'GREATER_THAN' && Math.abs(Date.parse(filt[1].fieldFilter.value.timestampValue) - (w.clock.ms - 60000)) < 5000 && body.aggregations[0].count);
  check('…with the student\'s bearer token', f && f.init.headers.Authorization === 'Bearer tok-uid-A');
  check('…and the answer (7) is stored for the strip', w.PM._state().live === 7);
  if (process.env.PM_DUMP) writeFileSync(process.env.PM_DUMP + '/agg.json', JSON.stringify({ url: f.url, init: f.init }));
  const off = makeWorld({ ui: true, config: { uiOn: false } });
  const b = off.track(); b.play(); await off.run(3, off.playing(b));
  off.PM._pollLive(); await off.settle();
  check('uiOn false → the lookup never runs (no reads for a hidden feature)', !off.log.fetches.some((x) => /runAggregationQuery/.test(x.url)));
}

console.log(`\n${failed ? '✗' : '✓'} pm-sim: ${passed} passed, ${failed} failed`);
if (failed) { console.log('failed: ' + fails.join(' | ')); process.exit(1); }
