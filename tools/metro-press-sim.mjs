#!/usr/bin/env node
/* metro-press-sim.mjs — does a switch pressed right at a Metronome count lose or double that click? (2026-11-16)

     node tools/metro-press-sim.mjs [--only=ca-10,ca-20] [--all] [--ctx-step=MS] [--root=DIR] [--verbose]

   THE QUESTION. A play-along's Metronome click is queued up to 0.1 s before its count (pcScheduleClick in
   app/cards.js, snipScheduleClick in app/snippets.js). A speed stop or the Guitar switch takes the queued click
   back (cancelQueuedClicks, QUEUED CLICKS in app/snippets.js) because the count is queued again on the new clock.
   Does every count still click exactly once, whenever the press comes?

   WHEN TO RUN IT. After a change to pcScheduleClick, pcRetrack, pcSetMetro or pcCountIn (app/cards.js), or to
   snipScheduleClick, snipSetTier, queueClick, cancelQueuedClicks or keptClickCount (app/snippets.js). Node only,
   about 35 s. It is not in checks.mjs. tools/playalong-loop.mjs (a browser) is still the test of the whole player.

   WHAT IS REAL. The whole app script in a Node vm (tools/sim-app-page.mjs), unmodified: a practice card is started
   with the site's pcStart on the real card and track data, counts in with pcCountIn, plays with pcGo and pcFrame;
   the press is the site's pcSetSpeedTo (the four-stop speed control) or pcSetGuitar. A step snippet is started
   with snipToggle and pressed with snipSetTier.

   WHAT IS FAKE. One virtual clock (ms) drives setTimeout, requestAnimationFrame (a frame every 1000/60 ms), the
   AudioContext's currentTime and the <audio> elements. An <audio> has its file at once (a file SWITCH takes
   300 ms to load), starts moving 40 ms after play(), and then moves at playbackRate; so the twin, started later,
   runs a few ms behind the playing element, as twinReady allows (under 60 ms). An oscillator records when it was
   told to start and whether it was stopped again before that. The DOM is the stub of sim-app-page.mjs: the card's
   root answers no selector, so nothing is drawn.
   The run has two passes. The first has an exact AudioContext clock. The second (rows marked ~) has that clock
   advance in steps of 7 ms while the <audio> elements stay exact (--ctx-step=MS: another step; 0: no second
   pass): a MODEL of a device whose audio clock moves a buffer at a time, not a measured device. It is there
   because the take-back rule reads the AudioContext clock and the scheduler reads the <audio> position, and the
   fix below must hold when the two disagree by a few ms.

   THE CASES. For each card, each press kind and each of the counts 5 to 8 of the play, one play per press time:
   0.5, 1.5, ... 24.5 ms before the count is reached, and the same after it, while its click still waits out the
   output latency (50 times; a frame is 16.7 ms).
     rate-fast   Normal -> Slow: the same file, another rate
     rate-slow   Slower -> Slowest: the same (slow) file, another rate
     guitar      the Guitar switch with the other mix already playing in step (the twin): a swap, no load
     file        Slower -> Slow: ANOTHER file, 300 ms to load (the control: the music stops and comes back before
                 the count, so the count is reached again; judged for lost and doubled clicks only, because the
                 fake <audio> starts moving 40 ms after play() and the first click back is that much early)
     count-in    a speed press 0.5 to 24.5 ms before each count-in click: the count-in starts again (by design)
     snip-rate   a step snippet, Slow -> Slowest: the same file, another rate
     snip-guitar a step snippet, the Guitar switch with the twin in step
   THE EXPECTED ANSWER, worked out here from the fake world, never from the code under test: every count from the
   first one of the play up to two counts after the press is HEARD exactly once (an oscillator started and not
   stopped before its start time), and each heard click starts within 25 ms of the moment the music reaches its
   count plus the latency the site compensates for (the moment is read from the fake <audio>'s position). After a
   count-in press: no click of the old count-in sounds after the press, and the new count-in has all its clicks.

   Exit 0 = every press kept every click; 1 = a click was lost, doubled or late; 2 = bad arguments or a crash.

   FOUND 2026-11-16, on origin/main 9bf2b07 (first pass, 4 cards and the snippet, 3,733 plays: 346 red).
   1. A LOST CLICK: a speed or Guitar press less than one frame before a count lost that count's click whenever no
      frame came between the press and the count (306 plays: rate-fast 122 and rate-slow 107 of 272 such presses
      each, guitar 30 of 204, snip-rate 27 and snip-guitar 20 of 68). The press took the queued click back and
      reset lastBeat; the next frame came after the count and only looks at the NEXT count. Only where the music
      carries on: the same file at another rate, or the twin swapped in. A file that loads was never wrong (0 of
      800), and neither was a press in the count-in (0 of 325: the count-in starts again).
      Fixed: each click carries its count, cancelQueuedClicks returns the latest count it took back, and
      pcRetrack / snipSetTier hand it straight back to the scheduler on those two paths, which queues that count
      by number even when the music has just reached it.
   2. A DOUBLED CLICK: a Guitar press in the 25 ms AFTER a count clicked that count twice (40 plays: guitar 38 of
      600, snip-guitar 2 of 200). The click was rightly kept, but lastBeat went back to -1 and the twin, a few ms
      behind, reached the count again. Fixed: after a switch the scheduler starts from the latest count whose
      click is kept (keptClickCount), not from -1.

   BREAK-IT RECORD (2026-11-16, each red; the families named are the ones that turned): see the commit messages
   of the two fixes for the numbers. The re-queue removed from pcRetrack's same-file path, from its twin path,
   from snipSetTier's same-file path and from its twin path; the scheduler ignoring the count handed back, in
   pcScheduleClick and in snipScheduleClick (second pass only); lastBeat back to -1 in pcRetrack and in
   snipSetTier; cancelQueuedClicks taking back every click not yet heard, the 2026-11-12 first cut;
   cancelQueuedClicks taking nothing back.

   NOT COVERED. The 'file' family on the stepped clock (not run in the second pass): a press within a clock step
   of a count can take back a click whose count the <audio> has already passed, or keep one it has not reached,
   and the music then comes back on the other side of the count (seen with a 10 ms step: some lost, some twice,
   the same before and after the two fixes). Whether a real Chromebook's audio clock steps like that is not
   measured. The Metronome switch itself, Stop, the lap of a loop, Build up speed, and the Song Journey pages' own
   click (tabs/journey.js, where every take-back comes with the music stopping or jumping) are not walked here. */
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { appPage } from './sim-app-page.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = n => { const a = args.find(x => x === '--' + n || x.startsWith('--' + n + '=')); return a ? (a.includes('=') ? a.slice(a.indexOf('=') + 1) : true) : null; };
const known = ['only', 'all', 'ctx-step', 'root', 'verbose'];
for (const a of args) if (!known.some(k => a === '--' + k || a.startsWith('--' + k + '='))) { console.error(`metro-press-sim: unknown argument ${a} (see the header of tools/metro-press-sim.mjs)`); process.exit(2); }
const ROOT = flag('root') ? resolve(String(flag('root'))) : join(HERE, '..');
const VERBOSE = !!flag('verbose');
const COARSE = flag('ctx-step') != null ? Number(flag('ctx-step')) : 7;   // the second pass's AudioContext clock step, ms (0: no second pass)
if (!(COARSE >= 0)) { console.error('metro-press-sim: --ctx-step wants a number of ms'); process.exit(2); }
let CTX_STEP = 0;   // the pass now running
const DEFAULT_CARDS = ['ca-10', 'ca-20', 'ca-24', 'ca-35'];   // a 4/4 part, a six-count part, a whole song, a 3/4 song with no full mix
const FRAME = 1000 / 60, LOAD_MS = 300, START_MS = 40, TOL_MS = 25;
const BEFORE = Array.from({ length: 25 }, (_, i) => i + 0.5);        // ms before the count is reached
const DELTAS = [...BEFORE.map(d => -d).reverse(), ...BEFORE];       // and (negative) after it, while its click waits out the latency
const when = d => d > 0 ? `${d} ms before` : `${-d} ms after`;
const COUNTS = [4, 5, 6, 7];

/* ── the fake world ── */
const W = { T: 0, q: [], seq: 0, rafs: [], nextFrame: 0, osc: [], gen: 0, loadMs: 0, after: null };
const later = (t, fn) => { const e = { t, fn, id: ++W.seq, dead: false }; W.q.push(e); return e.id; };
const ctxNow = () => (CTX_STEP > 0 ? Math.floor(W.T / CTX_STEP) * CTX_STEP : W.T) / 1000;
class FakeCtx {
  get currentTime() { return ctxNow(); }
  get outputLatency() { return 0.02; }
  get baseLatency() { return 0.01; }
  get destination() { return {}; }
  resume() { return Promise.resolve(); }
  close() {}
  createGain() { return { connect() {}, disconnect() {}, gain: { value: 1, setValueAtTime() {}, exponentialRampToValueAtTime() {}, linearRampToValueAtTime() {}, cancelScheduledValues() {} } }; }
  createOscillator() {
    const o = { frequency: { value: 0 }, connect() {}, disconnect() {}, at: null, natural: null, cancelAt: null, madeAt: W.T, gen: W.gen, tag: null,
      start(at) { o.at = at; },
      stop(t) { if (o.natural == null && t > 0) o.natural = t; else if (o.cancelAt == null) o.cancelAt = W.T / 1000; } };
    W.osc.push(o);
    return o;
  }
}
class FakeAudio {
  constructor() { this.l = {}; this._src = ''; this._pos = 0; this._since = W.T; this._rate = 1; this.paused = true; this.readyState = 0; this.seeking = false; this.ended = false; this.muted = false; this.defaultPlaybackRate = 1; }
  _sync() { if (this.paused) { this._since = W.T; return; } if (W.T > this._since) { this._pos += (W.T - this._since) / 1000 * this._rate; this._since = W.T; } }
  get currentTime() { this._sync(); return this._pos; }
  set currentTime(v) { if (this.readyState >= 1) { this._sync(); this._pos = v; } }
  get playbackRate() { return this._rate; }
  set playbackRate(v) { this._sync(); this._rate = v; }
  get src() { return this._src; }
  set src(v) {
    this._sync(); this._src = v; this._pos = 0; this.paused = true; this.readyState = 0;
    if (!v) return;
    const done = () => { if (this._src !== v || this.readyState) return; this.readyState = 4; this.fire('loadedmetadata'); };
    if (W.loadMs > 0) later(W.T + W.loadMs, done); else this.readyState = 4;
  }
  getAttribute(n) { return n === 'src' ? this._src : null; }
  removeAttribute(n) { if (n === 'src') this.src = ''; }
  addEventListener(t, f, o) { (this.l[t] ||= []).push({ f, once: !!(o && o.once) }); }
  removeEventListener() {}
  fire(t) { const ls = this.l[t] || []; this.l[t] = ls.filter(x => !x.once); ls.forEach(x => x.f({ type: t })); }
  play() { this._sync(); if (this.paused) { this.paused = false; this._since = W.T + START_MS; later(W.T + START_MS, () => { if (!this.paused) this.fire('playing'); }); } return Promise.resolve(); }
  pause() { this._sync(); this.paused = true; }
  load() {}
}

let page;
try { page = appPage(ROOT); } catch (e) { console.error('metro-press-sim: the app did not load (' + (e && e.message) + ')'); process.exit(2); }
const C = page.ctx;
C.AudioContext = FakeCtx; C.webkitAudioContext = FakeCtx; C.Audio = FakeAudio;
C.setTimeout = (fn, ms) => later(W.T + (Number(ms) || 0), fn);
C.clearTimeout = id => { const e = W.q.find(x => x.id === id); if (e) e.dead = true; };
C.requestAnimationFrame = fn => { const id = ++W.seq; W.rafs.push({ id, fn }); return id; };
C.cancelAnimationFrame = id => { W.rafs = W.rafs.filter(r => r.id !== id); };
C.performance = { now: () => W.T };
page.run('audioCtx = null');
const need = ['pcStart', 'pcStop', 'pcSetSpeedTo', 'pcSetGuitar', 'pcSpeed3Html', 'pcLayout', 'caView', 'snipToggle', 'snipStop', 'snipSetTier', 'snipBarsAt', 'snipTimeAtBars', 'clickSub', 'snipLatency'];
const gone = need.filter(n => !page.run(`typeof ${n} === 'function'`));
if (gone.length) { console.error('metro-press-sim: the app has no ' + gone.join(', ')); process.exit(2); }
/* What the harness reads after every event: [who is playing, counting, lastBeat, position in counts, file seconds
   since the last count, rate]. Read-only. */
page.run(`globalThis.__mp = { sample(){
  const c = pcState, s = snipState;
  if(c){ const n = c.L.tr.beatsPerBar * clickSub(c.L.tr), p = c.audio.currentTime, bp = snipBarsAt(c.win, p) * n;
    return ['card', !!c.counting, c.lastBeat, bp, p - snipTimeAtBars(c.win, Math.floor(bp) / n), c.audio.playbackRate, c.audio.paused]; }
  if(s){ const n = s.tr.beatsPerBar * clickSub(s.tr), p = s.audio.currentTime, bp = snipBarsAt(s.win, p) * n;
    return ['snip', false, s.lastBeat, bp, p - snipTimeAtBars(s.win, Math.floor(bp) / n), s.audio.playbackRate, s.audio.paused]; }
  return null;
} }`);
const LAT_MS = (page.run('snipLatency()') - 0.02) * 1000;

/* After every event: tag the new oscillators (a count-in click, or the count the scheduler just queued) and note
   when the music passed each count. */
let reached = {}, prev = null;
function afterEvent() {
  const s = page.run('__mp.sample()');
  for (const o of W.osc) if (o.tag == null) o.tag = !s ? 'none' : s[1] ? 'in' : s[2];
  if (s && !s[1] && !s[6]) {
    const [who, , , bp, since, rate] = s;
    if (prev && prev.who === who && prev.gen === W.gen && bp > prev.bp && Math.floor(bp) > Math.floor(prev.bp) && bp - prev.bp < 1) reached[Math.floor(bp)] = W.T - since / rate * 1000;
    prev = { who, bp, gen: W.gen };
  } else prev = null;
  if (W.after) W.after(s);
}
function run(until, stop) {
  for (;;) {
    W.q = W.q.filter(e => !e.dead);
    let e = null;
    for (const x of W.q) if (!e || x.t < e.t || (x.t === e.t && x.id < e.id)) e = x;
    const te = e ? e.t : Infinity, tn = Math.min(te, W.nextFrame);
    if (tn > until) break;
    W.T = Math.max(W.T, tn);
    if (te <= W.nextFrame) { W.q.splice(W.q.indexOf(e), 1); e.fn(); }
    else { W.nextFrame += FRAME; const r = W.rafs; W.rafs = []; r.forEach(x => x.fn(W.T)); }
    afterEvent();
    if (stop && stop()) return true;
  }
  W.T = Math.max(W.T, until);
  return false;
}
function reset(phase) {
  page.run('pcStop(); snipStop()');
  W.q = []; W.rafs = []; W.osc = []; W.gen++; W.loadMs = 0; W.after = null;
  W.T = Math.ceil(W.T / 1000) * 1000 + 1000;   // a clean second, so no old click or timer reaches into this play
  W.nextFrame = W.T + phase;
  reached = {}; prev = null;
}
const stubEl = dataset => ({ dataset, isConnected: true, parentElement: null, hidden: false, innerHTML: '', querySelector() { return null; }, querySelectorAll() { return []; }, closest() { return null; },
  setAttribute() {}, getAttribute() { return null; }, classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } } });
const heard = o => o.at != null && (o.cancelAt == null || o.cancelAt > o.at + 0.005);

/* The four speed stops of a card, read from the site's own markup for the control. */
function speedStops(id) {
  C.__mp.id = id;
  const html = page.run(`pcSpeed3Html(pcLayout(caView(CLASS_ACTIVITIES.find(x => x.id === __mp.id))).tr, false)`);
  const stops = [...html.matchAll(/data-speed="([^"]+)" data-rate="([^"]+)" data-label="([^"]*)"/g)].map(m => ({ dataset: { speed: m[1], rate: m[2], label: m[3] }, classList: { toggle() {} } }));
  if (stops.length !== 4) throw new Error(`${id}: the speed control has ${stops.length} stops, wanted 4`);
  return stops;
}
function pressSpeed(root, stops, name) {
  const i = stops.findIndex(s => s.dataset.speed === name);
  const wrap = { querySelectorAll: sel => sel === '.pc-speed-tick' ? stops : [] };
  C.__mp.range = { value: i, setAttribute() {}, closest: sel => sel === '.pc' ? root : sel === '.pc-speed4' ? wrap : null };
  page.run('pcSetSpeedTo(__mp.range)');
}
const START = { 'rate-fast': 'normal', 'rate-slow': 'slower', guitar: 'slower', file: 'slower', 'count-in': 'slower' };
const PRESS = { 'rate-fast': 'slow', 'rate-slow': 'slowest', file: 'slow', 'count-in': 'slowest' };
const stopData = (stops, name) => { const s = stops.find(x => x.dataset.speed === name).dataset; return { slow: s.speed === 'slowest' || s.speed === 'slower' ? '1' : '', rate: s.rate }; };

/* Judge the in-song clicks of one play: counts 0..last heard once each, on time. */
function judgeSong(last, out, noTiming) {
  for (let b = 0; b <= last; b++) {
    const mine = W.osc.filter(o => o.tag === b), n = mine.filter(heard).length;
    if (n === 0) out.push({ kind: 'lost', b });
    else if (n > 1) out.push({ kind: 'double', b });
    else if (!noTiming && reached[b] != null) {
      const off = mine.find(heard).at * 1000 - (reached[b] + LAT_MS);
      if (Math.abs(off) > TOL_MS + CTX_STEP) out.push({ kind: 'late', b, off });
    }
  }
}
function cardTrial(id, fam, k, delta, stops, hasFull) {
  reset((k * 7 + delta * 3) % FRAME);
  const root = stubEl({ id, guitar: hasFull ? '1' : '', metro: '1', twin: '1', ...stopData(stops, START[fam]) });
  C.__mp.root = root;
  page.run('pcStart(__mp.root, 0)');
  if (!page.run('!!pcState && pcState.counting')) throw new Error(`${id}: pcStart did not start a count-in`);
  const out = [];
  if (fam === 'count-in') {
    const first = W.osc.slice(), n = first.length, beat = (first[1].at - first[0].at) * 1000, t0 = first[0].at * 1000;
    const tp = t0 + k * beat - delta;
    run(tp);
    const oldGen = W.gen; W.gen++;
    pressSpeed(root, stops, PRESS[fam]); afterEvent();
    if (run(W.T + 20000, () => page.run('!!pcState && !pcState.counting')) !== true) throw new Error(`${id}: the song never came in after a count-in press`);
    const t1 = W.T;
    run(W.T + 2500);
    const oldAfter = W.osc.filter(o => o.gen === oldGen && o.tag === 'in' && o.at * 1000 > tp && heard(o)).length;
    const fresh = W.osc.filter(o => o.gen !== oldGen && o.tag === 'in' && heard(o)).length;
    if (oldAfter) out.push({ kind: 'old count-in click after the press', b: k });
    if (fresh !== n) out.push({ kind: `new count-in has ${fresh} of ${n} clicks`, b: k });
    void t1;
    judgeSong(1, out);
    return out;
  }
  if (run(W.T + 20000, () => page.run('!!pcState && !pcState.counting')) !== true) throw new Error(`${id}: the song never came in`);
  const a = page.run('pcState.audio'), n = page.run('pcState.L.tr.beatsPerBar * clickSub(pcState.L.tr)');
  C.__mp.k = k;
  const target = page.run(`snipTimeAtBars(pcState.win, __mp.k / ${n})`);
  const tp = Math.max(W.T, a._since) + (target - a._pos) / a._rate * 1000 - delta;
  run(tp);
  if (fam === 'guitar') {
    if (!page.run('twinReady(pcState, pcState.audio, snippetSrc(pcState.L.tr, __mp.root.dataset.slow === "1", false))')) throw new Error(`${id}: the twin was not in step at the press`);
    C.__mp.g = { closest: () => root, setAttribute() {}, querySelectorAll() { return []; } };
    page.run('pcSetGuitar(__mp.g)');
  } else {
    if (fam === 'file') W.loadMs = LOAD_MS;
    pressSpeed(root, stops, PRESS[fam]);
  }
  afterEvent();
  if (run(W.T + 20000, () => reached[k + 2] != null) !== true) throw new Error(`${id} ${fam}: the music never reached count ${k + 3}`);
  run(W.T + 250);
  judgeSong(k + 2, out, fam === 'file');   // a file that loads starts moving START_MS after play(): the first click back is not timed here
  return out;
}
function snipTrial(track, fam, k, delta) {
  reset((k * 5 + delta * 3) % FRAME);
  const card = stubEl({ snip: JSON.stringify({ track, fromBar: 1, bars: 8 }), guitar: '1', slow: '1', slowest: '', metro: '1', twin: '1' });
  const btn = pressed => ({ closest: () => card, _p: pressed, getAttribute() { return this._p ? 'true' : 'false'; }, setAttribute(key, v) { if (key === 'aria-pressed') this._p = v === 'true'; }, classList: { add() {}, remove() {}, toggle() {} }, querySelector() { return null; }, querySelectorAll() { return []; }, innerHTML: '' });
  C.__mp.play = btn(false); C.__mp.sl = btn(false); C.__mp.gt = btn(true);
  page.run('snipToggle(__mp.play)');
  if (!page.run('!!snipState')) throw new Error(`${track}: snipToggle did not start`);
  const a = page.run('snipState.audio'), n = page.run('snipState.tr.beatsPerBar * clickSub(snipState.tr)');
  C.__mp.k = k;
  const target = page.run(`snipTimeAtBars(snipState.win, __mp.k / ${n})`);
  const tp = Math.max(W.T, a._since) + (target - a._pos) / a._rate * 1000 - delta;
  run(tp);
  if (fam === 'snip-guitar') {
    if (!page.run('twinReady(snipState, snipState.audio, snippetSrc(snipState.tr, true, false))')) throw new Error(`${track}: the snippet's twin was not in step at the press`);
    page.run('snipSetTier(__mp.gt, "guitar")');
  } else page.run('snipSetTier(__mp.sl, "slowest")');
  afterEvent();
  if (run(W.T + 20000, () => reached[k + 2] != null) !== true) throw new Error(`${track} ${fam}: the music never reached count ${k + 3}`);
  run(W.T + 250);
  const out = [];
  judgeSong(k + 2, out);
  return out;
}

/* ── the run ── */
const ids = page.run(`(window.CLASS_ACTIVITIES || []).filter(a => { try { return a && a.card && a.card.slowest && !!pcLayout(caView(a)) && !!pcLayout(caView(a)).tr.srcSlow; } catch(e){ return false; } }).map(a => a.id).join(',')`).split(',').filter(Boolean);
let cards = flag('all') ? ids : DEFAULT_CARDS.filter(id => ids.includes(id));
if (flag('only') && flag('only') !== true) cards = String(flag('only')).split(',');
for (const id of cards) if (!ids.includes(id)) { console.error(`metro-press-sim: ${id} is not a practice card with the four-stop speed control (there are ${ids.length}: ${ids.join(' ')})`); process.exit(2); }
if (!cards.length) { console.error('metro-press-sim: no card to walk'); process.exit(2); }
const snipTrack = page.run(`Object.keys(SNIPPET_TRACKS).find(k => snippetHasFull(SNIPPET_TRACKS[k]) && SNIPPET_TRACKS[k].srcSlow) || ''`);

const tally = {};   // family -> { plays, bad, lost, double, late, other, near, nearBad }
const note = (fam, delta, out, label) => {
  if (CTX_STEP) { fam += ' ~'; label += ` (clock in ${CTX_STEP} ms steps)`; }
  const tl = tally[fam] ||= { plays: 0, bad: 0, lost: 0, double: 0, late: 0, other: 0, near: 0, nearBad: 0, first: null };
  tl.plays++;
  const near = delta > 0 && delta < FRAME;
  if (near) tl.near++;
  if (!out.length) return;
  tl.bad++; if (near) tl.nearBad++;
  for (const p of out) { if (p.kind === 'lost') tl.lost++; else if (p.kind === 'double') tl.double++; else if (p.kind === 'late') tl.late++; else tl.other++; }
  const line = `${label}: ` + out.map(p => p.kind === 'lost' ? `count ${p.b + 1} never clicked` : p.kind === 'double' ? `count ${p.b + 1} clicked twice` : p.kind === 'late' ? `count ${p.b + 1} clicked ${p.off.toFixed(1)} ms off` : p.kind).join('; ');
  if (!tl.first) tl.first = line;
  if (VERBOSE) console.log('  ✗ ' + line);
};
/* One pass over the cards and the snippet with the AudioContext clock in steps of `step` ms (0: exact). */
function pass(step, fams) {
  CTX_STEP = step;
  for (const id of cards) {
    const stops = speedStops(id);
    C.__mp.id = id;
    const hasFull = page.run(`snippetHasFull(pcLayout(caView(CLASS_ACTIVITIES.find(x => x.id === __mp.id))).tr)`);
    /* No press at all: the harness itself must hear every count once. */
    for (const fam of ['rate-fast', 'rate-slow']) {
      reset(3);
      C.__mp.root = stubEl({ id, guitar: hasFull ? '1' : '', metro: '1', twin: '1', ...stopData(stops, START[fam]) });
      page.run('pcStart(__mp.root, 0)');
      run(W.T + 20000, () => reached[8] != null); run(W.T + 250);
      const out = []; judgeSong(8, out);
      note('no press', 99, out, `${id} from ${START[fam]}, no press`);
    }
    for (const fam of ['rate-fast', 'rate-slow', 'guitar', 'file']) {
      if (!fams.includes(fam) || (fam === 'guitar' && !hasFull)) continue;
      for (const k of COUNTS) for (const d of DELTAS) note(fam, d, cardTrial(id, fam, k, d, stops, hasFull), `${id} ${fam}, press ${when(d)} count ${k + 1}`);
    }
    if (!fams.includes('count-in')) continue;
    const nIn = page.run(`(() => { const tr = pcLayout(caView(CLASS_ACTIVITIES.find(x => x.id === __mp.id))).tr; return tr.beatsPerBar * clickSub(tr); })()`);
    for (let j = 1; j < nIn; j++) for (const d of BEFORE) note('count-in', d, cardTrial(id, 'count-in', j, d, stops, hasFull), `${id} count-in, press ${d} ms before count-in click ${j + 1}`);
  }
  if (snipTrack) for (const fam of ['snip-rate', 'snip-guitar']) for (const k of COUNTS) for (const d of DELTAS) note(fam, d, snipTrial(snipTrack, fam, k, d), `snippet ${snipTrack} ${fam}, press ${when(d)} count ${k + 1}`);
}
const started = Date.now();
try {
  pass(0, ['rate-fast', 'rate-slow', 'guitar', 'file', 'count-in']);
  if (COARSE > 0) pass(COARSE, ['rate-fast', 'rate-slow', 'guitar']);   // not 'file': see NOT COVERED
} catch (e) {
  console.error('metro-press-sim: the tool crashed: ' + (e && e.stack || e));
  process.exit(2);
}
let bad = 0, plays = 0;
console.log(`metro-press-sim: ${cards.length} card(s) (${cards.join(' ')})${snipTrack ? ' and the step snippet of ' + snipTrack : ''}; a press from 24.5 ms before a count to 24.5 ms after it${COARSE ? `; rows marked ~: the AudioContext clock in steps of ${COARSE} ms` : ''}`);
for (const [fam, tl] of Object.entries(tally)) {
  bad += tl.bad; plays += tl.plays;
  const near = fam.startsWith('no press') ? '' : `; of the presses less than one frame before the count: ${tl.nearBad} of ${tl.near}`;
  console.log(`  ${tl.bad ? '✗' : '✓'} ${fam.padEnd(13)} ${tl.bad} of ${tl.plays} plays lost, doubled or mistimed a click (lost ${tl.lost}, twice ${tl.double}, off ${tl.late}${tl.other ? ', other ' + tl.other : ''})${near}`);
  if (tl.first) console.log(`      first: ${tl.first}`);
}
console.log(`metro-press-sim: ${bad ? '✗' : '✓'} ${plays - bad} of ${plays} plays kept every click`);
console.error(`metro-press-sim: ${((Date.now() - started) / 1000).toFixed(1)} s`);
process.exit(bad ? 1 : 0);
