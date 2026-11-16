/* Is a recorded take's clock right? (2026-11-16, the micRecStartPerf fault: WORKFLOW "Existing faults found on the way")

     node tools/mic-sim/micrec-clock.mjs [--root=<site folder>] [--verbose]

   A recorded take (micTakes, local recording mode) saves its times (expected[].t, events[].t, tempoChanges[].t) as ms from the
   recording's first sample: micRecSaveNow subtracts micRecStartPerf(rec), the performance.now() time it takes that sample to have.
   This tool runs the REAL micRecStart, its onaudioprocess handler, micRecStop and micRecSaveNow (coach-core.js, pulled out of the site
   as it is, in a vm, the dev-bypass path that logs the document instead of uploading it) against a FAKE audio clock that behaves as
   Chromium's does (third_party/blink/renderer/modules/webaudio/script_processor_handler.cc, read 2026-11-16):
     - the graph renders 128-frame quanta, in bursts of H frames when the audio device asks (H = 128 .. 1024);
       ctx.currentTime, read on the page, is the frames rendered so far (it stands still between bursts, and at 0 until the device starts);
     - a ScriptProcessor (4096 frames) fills its input buffer on the audio thread and, when it is full, POSTS a task; the page runs the
       handler later (the main thread's delay, delta) with playbackTime = (frames rendered at that moment + 4096) / sampleRate: the time its
       OUTPUT buffer will play, one buffer after the input buffer ended.
   The truth: a sample is available to the page (the game's analyser, the same graph) once its quantum has been rendered. The right start
   stamp is the lower envelope of (when a frame became available - its time from the recording's first frame). An onset placed on that
   envelope at a known frame is put in the take's events; the saved t must be its true time from the recording's first sample.
   err = stamp - truth (+ = the stamp is LATE, so every saved time is that much too early against the audio). A stamp that rests on
   buffer-end frames only can sit up to one burst (H / sampleRate) above the envelope, which is the band each case allows.
   Cases: two sample rates, five burst sizes, a slow first handler, a page stalled mid-take, and an audio device that starts after the
   recording does (a context whose clock still stands at 0 when micRecStart reads it). Exit 1 when any case is outside its band.
   Measured on the real takes the same day (46 summaries in tools/mic-sim/takes/, replayed through the real game code with the clock
   fitted on the onsets; 43 of 46 could be fitted): the stamp before 2026-11-16 was 92 ms late on the median take (40 of 43 between 48
   and 107 ms, one poor fit at 22; one buffer at 48 kHz is 85.3 ms), and about 130 ms EARLY on 2 of 43. */
import vm from 'node:vm';
import { join, resolve } from 'node:path';
import { siteSource } from '../site-src.mjs';
import { extract } from './extract.mjs';

const args = process.argv.slice(2);
const opt = n => { const a = args.find(x => x.startsWith('--' + n + '=')); return a ? a.slice(n.length + 3) : null; };
const verbose = args.includes('--verbose');
const ROOT = opt('root') ? resolve(opt('root')) : join(import.meta.dirname, '..', '..');
const src = siteSource('coach.js', ROOT);

/* The recording code as the site has it. Functions that a site may not have (an older one) are left out. */
const NEED = ['micRecStart', 'micRecTeardown', 'micRecStop', 'micRecAbort', 'micRecStartPerf', 'micRecSaveNow', 'micRecPcm16', 'micRecMicName', 'micRecTrackSettings'];
const OPTIONAL = ['micRecStartPerfV1'];
const fns = NEED.map(n => (src.includes('async function ' + n + '(') ? 'async ' : '') + extract(src, n)).concat(OPTIONAL.filter(n => src.includes('function ' + n + '(')).map(n => extract(src, n)));
const consts = src.split('\n').filter(l => /^const MICREC_(MAX_SEC|RATE|CHUNK|SETTING_KEYS)\b/.test(l)).join('\n');
if ((consts.match(/^const /gm) || []).length !== 4) throw new Error('micrec-clock: the MICREC_* constants were not found in coach.js');

function makeVm(){
  const clock = { now: 0, ctxTime: 0 };
  const logged = [];
  const ctx = {
    performance: { now: () => clock.now },
    console: { info: (...a) => logged.push(a), warn(){}, log(){}, error(){} },
    navigator: { userAgent: 'micrec-clock' },
    setTimeout: () => 0, clearTimeout(){}, Promise, Math, JSON, Object, Array, Float32Array, Int16Array, Uint8Array, Number, String, isFinite,
    document: { getElementById: () => null },
    IS_TEACHER_MODE: false, currentUser: { uid: 'test-0', displayName: 'Test 0' }, periodOverride: '', studentPeriod: '4',
    coachMicLatencyMs: () => 50, getLang: () => 'en', isDevBypassUser: () => true, micRecLocal: () => false, micRecWanted: () => true,
    coachCtx: null, coachStream: null, __clock: clock
  };
  vm.createContext(ctx);
  vm.runInContext(consts + '\nlet micRec = null;\nlet micRecSaving = Promise.resolve();\n' + fns.join('\n') +
    '\nglobalThis.__get = () => micRec; globalThis.__set = v => { micRec = v; };', ctx);
  return { ctx, clock, logged };
}

/* A seeded random stream. */
function rng(seed){ let s = seed >>> 0; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; }

/* One take. c: { sr, H, cold (ms the device starts after micRecStart; 0 = running long before), d1 (the first handler's delay, ms),
   dMax (the other handlers' delays, uniform 0.2..dMax ms), stall: [fromBuffer, toBuffer, ms] (a page stall), sec, seed }. */
async function runCase(c){
  const { ctx, clock, logged } = makeVm();
  const sr = c.sr, H = c.H, Q = 128, B = 4096, R = rng(c.seed || 1);
  const pCreate = 1000, pStart = c.cold > 0 ? pCreate + 5 + c.cold : pCreate - 5000;   // a warm context started 5 s before
  const pRec = pCreate + 5;                                                           // micRecStart
  const quantaByBurst = k => Math.ceil((k + 1) * H / Q);                              // quanta rendered once burst k is done
  const burstOfQuantum = q => Math.max(0, Math.ceil((q + 1) * Q / H) - 1);
  const renderedAt = q => pStart + 1000 * (burstOfQuantum(q) + 1) * H / sr;          // the perf time quantum q is rendered (available)
  const framesAt = p => { if (p < pStart + 1000 * H / sr) return 0; const k = Math.floor((p - pStart) / (1000 * H / sr)) - 1; return quantaByBurst(k) * Q; };
  /* The page's view of the context clock. */
  const actx = { get currentTime(){ return framesAt(clock.now) / sr; }, sampleRate: sr, destination: {},
    createMediaStreamSource: () => ({ connect(){}, disconnect(){} }),
    createScriptProcessor: () => (actx.proc = { connect(){}, disconnect(){}, onaudioprocess: null }),
    createGain: () => ({ gain: { value: 1 }, connect(){}, disconnect(){} }) };
  ctx.coachCtx = actx;
  ctx.coachStream = { getAudioTracks: () => [{ label: 'Test mic', getSettings: () => ({ sampleRate: sr }) }] };
  clock.now = pRec;
  if (!vm.runInContext('micRecStart("pw")', ctx)) throw new Error('micRecStart refused');
  /* The ScriptProcessor's first frame: the next quantum the graph renders after the connection is made. */
  const F0 = framesAt(pRec);
  const n = Math.ceil(c.sec * sr / B);
  let h = pRec, data = new Float32Array(B);
  for (let k = 0; k < n; k++){
    const qEnd = (F0 + B * (k + 1)) / Q - 1;                       // the quantum that fills buffer k
    const lo = c.dMin || 0.2;
    let d = k === 0 ? c.d1 : lo + R() * (c.dMax - lo);
    if (c.stall && k >= c.stall[0] && k <= c.stall[1]) d += c.stall[2];
    h = Math.max(h + 0.05, renderedAt(qEnd) + d);                    // the page runs handlers one after another
    clock.now = h;
    const proc = actx.proc;
    if (!proc.onaudioprocess) break;
    proc.onaudioprocess({ playbackTime: (framesAt(h) + B) / sr, inputBuffer: { getChannelData: () => data } });
  }
  const rec = vm.runInContext('micRecStop()', ctx);
  /* The truth: the lower envelope over every quantum of (available at - its first frame's time from F0). */
  let truth = Infinity;
  for (let q = F0 / Q; q < F0 / Q + n * B / Q; q++) truth = Math.min(truth, renderedAt(q) - 1000 * ((q + 1) * Q - F0) / sr);
  /* An onset at a known frame (the middle of the take), heard by the game when the envelope says: its saved t must be its true time. */
  const fOn = F0 + Math.floor(n / 2) * B + 1234, tTrue = 1000 * (fOn - F0) / sr;
  const meta = { fields: { game: 'pw' }, expected: [{ t: truth + tTrue }], events: [{ t: truth + tTrue }] };
  await vm.runInContext('(rec, meta) => micRecSaveNow(rec, meta)', ctx)(rec, meta);
  const doc = (logged.find(a => String(a[0]).indexOf('[micRec]') === 0) || [])[1];
  if (!doc) throw new Error('micRecSaveNow wrote nothing');
  const err = tTrue - doc.events[0].t;                           // stamp - truth
  const band = 1000 * H / sr + 2 + (c.floor || 0);
  const undef = JSON.stringify(doc, (k, v) => v === undefined ? '__u' : v).includes('__u');
  /* The take says which clock it is on: recClock 2, and recClockShiftMs = the older estimate's stamp less this one (so a tool can put it
     on the old clock). Checked against the older estimate run on the same capture. A site without micRecStartPerfV1 has neither. */
  let mark = '';
  if (OPTIONAL.every(f => fns.some(s => s.startsWith('function ' + f + '(')))){
    const v1 = vm.runInContext('r => micRecStartPerfV1(r)', ctx)(rec), now = vm.runInContext('r => micRecStartPerf(r)', ctx)(rec);
    if (doc.recClock !== 2) mark = 'recClock is ' + JSON.stringify(doc.recClock) + ', not 2';
    else if (typeof doc.recClockShiftMs !== 'number' || Math.abs(doc.recClockShiftMs - (v1 - now)) > 0.06) mark = `recClockShiftMs is ${JSON.stringify(doc.recClockShiftMs)}, want ${Math.round((v1 - now) * 10) / 10}`;
  }
  return { err: Math.round(err * 10) / 10, band: Math.round(band * 10) / 10, ok: err >= -2 && err <= band && !undef && !mark, undef, mark, doc, F0, n };
}

/* A capture with no buffer timing in it (a hand-built one, as checks.mjs 1ca builds): the older estimate stands, and the take must not
   claim the new clock. */
async function runBare(){
  const { ctx, logged } = makeVm();
  const rec = { mode: 'pw', n: 48000, srcRate: 48000, bufs: [new Float32Array(48000)], perf0: 9000, ctx0: 0, firstPlay: 0, frames: 0, frameSum: 0, frameMax: 0, track: '', settings: null };
  await vm.runInContext('(rec, meta) => micRecSaveNow(rec, meta)', ctx)(rec, { fields: { game: 'pw' }, expected: [], events: [{ t: 10000 }] });
  const doc = (logged.find(a => String(a[0]).indexOf('[micRec]') === 0) || [])[1];
  const t = doc && doc.events[0].t, want = Math.round((10000 - (9000 - 4096 / 48000 * 1000)) * 10) / 10;
  return { ok: !!doc && t === want && !('recClock' in doc) && !('recClockShiftMs' in doc), t, want, keys: doc ? ['recClock', 'recClockShiftMs'].filter(k => k in doc) : [] };
}

const CASES = [
  ['Chromebook-like: 48 kHz, 10 ms bursts, warm', { sr: 48000, H: 480, cold: 0, d1: 3, dMax: 15 }],
  ['48 kHz, 128-frame bursts, warm', { sr: 48000, H: 128, cold: 0, d1: 1, dMax: 8 }],
  ['48 kHz, 1024-frame bursts, warm', { sr: 48000, H: 1024, cold: 0, d1: 3, dMax: 15 }],
  ['MacBook-like: 44.1 kHz, 512-frame bursts, warm', { sr: 44100, H: 512, cold: 0, d1: 3, dMax: 10 }],
  ['44.1 kHz, 256-frame bursts, warm', { sr: 44100, H: 256, cold: 0, d1: 2, dMax: 10 }],
  ['48 kHz, the first handler 40 ms late (a busy page at the count-in)', { sr: 48000, H: 480, cold: 0, d1: 40, dMax: 15 }],
  ['48 kHz, the page stalls 400 ms mid-take', { sr: 48000, H: 480, cold: 0, d1: 3, dMax: 15, stall: [100, 103, 400] }],
  ['48 kHz, a busy page: every handler 8-30 ms late (band + 8)', { sr: 48000, H: 480, cold: 0, d1: 30, dMax: 30, floor: 8, dMin: 8 }],
  ['48 kHz, the device starts 100 ms after micRecStart', { sr: 48000, H: 480, cold: 100, d1: 3, dMax: 15 }],
  ['48 kHz, the device starts 230 ms after micRecStart', { sr: 48000, H: 480, cold: 230, d1: 3, dMax: 15 }],
  ['44.1 kHz, the device starts 230 ms after micRecStart', { sr: 44100, H: 512, cold: 230, d1: 3, dMax: 10 }]
];
let bad = 0;
for (const [name, c] of CASES){
  const r = await runCase(Object.assign({ sec: 30, seed: 7 }, c));
  if (!r.ok) bad++;
  console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${name}: stamp ${r.err > 0 ? '+' : ''}${r.err} ms (band -2..+${r.band})${r.undef ? ' · the document holds an undefined field' : ''}${r.mark ? ' · ' + r.mark : ''}`);
  if (verbose) console.log('     ' + JSON.stringify({ F0: r.F0, buffers: r.n, recClock: r.doc.recClock, recClockShiftMs: r.doc.recClockShiftMs }));
}
const bare = await runBare();
if (!bare.ok) bad++;
console.log(`${bare.ok ? 'ok  ' : 'FAIL'} a capture with no buffer timing (hand-built): t ${bare.t} (want ${bare.want}, the older estimate), new-clock fields ${bare.keys.length ? bare.keys.join(', ') : 'none'} (want none)`);
console.log(`micrec-clock: ${CASES.length + 1 - bad} of ${CASES.length + 1} cases pass (${CASES.length} inside their band of one audio burst, 1 hand-built); ${fns.length} recording functions from ${ROOT === join(import.meta.dirname, '..', '..') ? 'this site' : ROOT}`);
process.exit(bad ? 1 : 0);
