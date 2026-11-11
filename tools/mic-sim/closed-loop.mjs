/* Closed-loop test of Power Chord Switch (2026-11-11): a virtual student
   (student.mjs) plays whole games into the REAL site code, and the site's
   verdicts are compared with what the student really played.

     node tools/mic-sim/closed-loop.mjs [options]
       --students=steady,beginner,…   (default: every student in student.mjs; `list` prints them)
       --rooms=quiet,class,…          (default quiet,class)
       --mics=chromebook,…            (default chromebook)
       --bpm=30,60,90,120             tempos
       --pairs=F5-G5,G5-C5 | all      chord pairs (default F5-G5,B5-C5,G5-C5: one per column; all = the 11 pairs)
       --song=sweet-child-o-mine      play that song's switches instead (three rounds each)
       --rate=beat|2|bar              how long each chord lasts (default beat)
       --fps=60,20                    how fast the Chromebook draws (default 60)
       --lag=70                       ms from the site's click to the student's strum reaching the mic, beyond their own timing
       --seeds=2                      games per cell
       --coach=<file>                 another coach.js (git show <ref>:coach.js > file) for a before / after
       --rule=base|ring|half|half3|both|both3   a candidate grading rule from candidates.mjs, applied in memory
       --json=<file>                  every game, every change
       --takes-out=<folder>           also save every game as a take (V001.wav + V001.json, the console's download format, with the answer
                                      key in the JSON) for eval-takes.mjs and replay-takes.mjs; these hold no student audio
       --no-guitar                    the no-guitar cases (below) instead of the table; exits 1 when any case fails

   The no-guitar cases (Jonathan, 2026-11-11: "it's marking things right where there's nothing playing"). In each one NO
   chord is played in the whole game, so every "right" the game gives is wrong. The cases are listed in NO_GUITAR below:
   a dead mic, a quiet room, a fan, one person talking, a class talking, bumps, typing, a partner's guitar, a class of
   guitars, a loud class, and two with busy hands (taps on the desk on every beat; strums across muted strings). A case
   passes only when no change is marked right. --bpm, --pairs, --song, --rate, --fps and --seeds apply.

   What is real: the site's scripts run unchanged in a vm (the way tools/grid-sim.mjs
   loads them), and the game is started with its own ccPrepare / ccBeginStage. From
   there coachCountIn, ccLoop, coachReadFrame, coachPitchReadings, coachDetectPitch,
   ccResolvePend, ccStageEnd (a song switch's three rounds) and ccFinish all run as
   written, on a virtual clock. Nothing is stubbed between the microphone and the
   verdict.
   What is modelled: the student, the room and the laptop mic (student.mjs), the
   speaker playing the count-in clicks, and the site's mic chain (gain, 70 Hz
   high-pass, 1500 Hz low-pass: the numbers are read from coach.js).
   What is skipped: ccStart's microphone permission and consent screens, and the
   screen itself (tools/smoke.mjs clicks through those in a real browser).

   The loop is closed both ways: the student does not get a script of times. It is
   told the round only after the game has set it up, hears the count-in the game
   plays, and plays on that.

   Reading the table: each graded change is one of four truths.
     right   the new chord, strummed      -> the game should say right
     wrong   the shape one fret high       -> should say wrong chord
     held    the old chord, strummed again -> should say wrong chord
     silent  no strum                      -> should say no strum
   The game is lenient on purpose (coach.js, ccLoop's comment): a strum with fewer
   than 3 pitch readings counts on timing alone.

   Synthetic sound. One number (how long a string rings) is fitted to the classroom takes; the rest is not (student.mjs header). */
import vm from 'node:vm';
import { readFileSync, readdirSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Student, STUDENTS, ROOMS, MICS, SR, biquad, rng } from './student.mjs';
import { applyRule, RULES } from './candidates.mjs';
import { siteSource, siteText, readScriptArg } from '../site-src.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

/* The site in a vm, on a clock this file moves. One site can play many games. */
/* The two places coach.js reads SAMPLES, rewritten to read a take summary instead (replay-takes.mjs: a summary holds the energy of every 512-sample
   block and the pitch coachDetectPitch read at every block end, and no audio). Everything else in coachReadFrame and coachPitchReadings runs as written. */
function readSummaries(src){
  const rep = (a, b) => { const n = src.split(a).length - 1; if (n !== 1) throw new Error(`closed-loop: expected this once in coach.js, found it ${n} times: ${a.slice(0, 80)}`); src = src.replace(a, () => b); };
  rep(`    let sum = 0, dsum = 0;
    for (let i = end - N; i < end; i++){
      const v = buf[i];
      sum += v * v;
      const d = v - buf[i - 1];
      dsum += d * d;
    }`, `    const __e = __mic.energy(L - end, N); let sum = __e[0], dsum = __e[1];`);
  rep('    const f = coachDetectPitch(buf, sr, clarity, end);', '    const f = __mic.pitch(L - end, clarity);');
  return src;
}
export const SUM_HOP = 512;
export function makeSite(coachFile, rule, ratio, fromSummary){
  let coachSrc = applyRule(coachFile ? readScriptArg(coachFile) : siteSource('coach.js', ROOT), rule || 'base', ratio || null);
  if (fromSummary) coachSrc = readSummaries(coachSrc);
  const num = (re, what) => { const m = coachSrc.match(re); if (!m) throw new Error('closed-loop: coach.js no longer has ' + what); return Number(m[1]); };
  /* The site's mic chain, from coachAcquireMic's own lines. */
  const chain = {
    gain: num(/^const COACH_MIC_GAIN = ([\d.]+);/m, 'COACH_MIC_GAIN'),
    fft: num(/^const COACH_FFT\s*=\s*(\d+);/m, 'COACH_FFT'),
    hp: num(/hp\.type = 'highpass'; hp\.frequency\.value = ([\d.]+);/, 'the high-pass line'),
    hpQ: num(/hp\.type = 'highpass'; hp\.frequency\.value = [\d.]+; hp\.Q\.value = ([\d.]+);/, 'the high-pass Q'),
    lp: num(/lp\.type = 'lowpass'; lp\.frequency\.value = ([\d.]+);/, 'the low-pass line'),
    lpQ: num(/lp\.type = 'lowpass'; lp\.frequency\.value = [\d.]+; lp\.Q\.value = ([\d.]+);/, 'the low-pass Q')
  };
  const clock = { now: 0 };
  let timers = [], rafs = [], tid = 1;
  const beeps = [];
  const el = id => ({
    id, style: { setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; } }, dataset: {}, children: [], _h: '',
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    get innerHTML(){ return this._h; }, set innerHTML(v){ this._h = v; },
    textContent: '', value: '', hidden: false, checked: false, isConnected: true,
    addEventListener(){}, removeEventListener(){}, appendChild(){}, removeChild(){}, remove(){},
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){}, hasAttribute(){ return false; },
    querySelector(){ return null; }, querySelectorAll(){ return []; }, closest(){ return null; },
    focus(){}, blur(){}, click(){}, scrollIntoView(){}, insertAdjacentHTML(){}, insertAdjacentElement(){},
    cloneNode(){ return el(''); }, contains(){ return false; },
    getBoundingClientRect(){ return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; }
  });
  const els = {};
  const storage = () => ({ _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k, v){ this._d[k] = String(v); }, removeItem(k){ delete this._d[k]; }, clear(){ this._d = {}; } });
  const param = () => ({ value: 1, setValueAtTime(){}, setTargetAtTime(){}, cancelScheduledValues(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){} });
  /* The page's sound output. Every oscillator the site starts is logged: the count-in clicks come out of here. */
  const actx = {
    get currentTime(){ return clock.now / 1000; }, state: 'running', resume(){ return Promise.resolve(); }, destination: {}, sampleRate: SR,
    createOscillator(){ const o = { connect(){}, frequency: param(), start(at){ beeps.push({ atMs: (at == null ? actx.currentTime : at) * 1000, freq: o.frequency.value }); }, stop(){} }; return o; },
    createGain(){ return { connect(){}, disconnect(){}, context: actx, gain: param() }; },
    createBufferSource(){ return { connect(){}, playbackRate: param(), start(){}, stop(){} }; },
    createBuffer(){ return { getChannelData(){ return new Float32Array(16); } }; },
    createDynamicsCompressor(){ return { connect(){}, threshold: param(), knee: param(), ratio: param(), attack: param(), release: param() }; },
    close(){}
  };
  /* offsetMs: how far the site's clock runs ahead of the audio's (0 when the virtual student plays; a real take's `map` in replay-takes.mjs). */
  const mic = { proc: new Float32Array(0), upTo: 0, sr: SR, offsetMs: 0, sum: null };
  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    document: { documentElement: el(''), head: el(''), body: el(''), getElementById(id){ return els[id] || (els[id] = el(id)); },
      querySelector(){ return null; }, querySelectorAll(){ return []; }, createElement(){ return el(''); }, createDocumentFragment(){ return el(''); },
      addEventListener(){}, removeEventListener(){}, fonts: { ready: Promise.resolve() }, hidden: false, visibilityState: 'visible' },
    localStorage: storage(), sessionStorage: storage(),
    location: { hostname: 'localhost', href: 'http://localhost/', pathname: '/', search: '', hash: '', reload(){} },
    history: { scrollRestoration: 'auto', replaceState(){}, pushState(){} },
    navigator: { userAgent: 'node', platform: 'node', language: 'en', onLine: true },
    setTimeout: (fn, ms) => { const id = tid++; timers.push({ id, at: clock.now + (ms || 0), fn }); return id; },
    clearTimeout: id => { timers = timers.filter(x => x.id !== id); },
    setInterval: () => 0, clearInterval(){},
    requestAnimationFrame: fn => { const id = tid++; rafs.push({ id, fn }); return id; },
    cancelAnimationFrame: id => { rafs = rafs.filter(x => x.id !== id); },
    matchMedia: () => ({ matches: false, addEventListener(){}, addListener(){} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    fetch: () => Promise.reject(new Error('no network')),
    CustomEvent: class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } },
    Image: class {}, Audio: class { play(){ return Promise.resolve(); } pause(){} },
    AudioContext: class { constructor(){ return actx; } },
    performance: { now: () => clock.now }, URLSearchParams, URL, TextEncoder, TextDecoder,
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){}, scrollTo(){}, innerWidth: 1366, innerHeight: 657, devicePixelRatio: 1,
    /* The microphone the site reads: the newest COACH_FFT samples of the processed stream, as an AnalyserNode gives them. */
    __mic: {
      ctx: { get sampleRate(){ return mic.sr; }, get currentTime(){ return clock.now / 1000; } },
      analyser: { getFloatTimeDomainData(b){
        const end = Math.round((clock.now - mic.offsetMs) / 1000 * mic.sr), st = end - b.length;
        for (let i = 0; i < b.length; i++){ const s = st + i; b[i] = s >= 0 && s < mic.upTo ? mic.proc[s] : 0; }
      } },
      seek(sample){ clock.now = sample / mic.sr * 1000 + mic.offsetMs; },
      /* From a take summary (mic.sum = { E, D, pitch: { gate: Float32Array } }): the energy of the window of n samples that ends `back` samples before
         the newest one, and the pitch read at that point. Window ends are moved to the nearest block end (at most 5.3 ms at 48 kHz). */
      energy(back, n){
        const g = Math.round((Math.round((clock.now - mic.offsetMs) / 1000 * mic.sr) - back) / SUM_HOP), k = Math.round(n / SUM_HOP), S = mic.sum;
        let e = 0, d = 0;
        for (let j = g - k; j < g; j++) if (j >= 0 && j < S.E.length){ e += S.E[j]; d += S.D[j]; }
        return [e, d];
      },
      pitch(back, clarity){
        const P = mic.sum.pitch[JSON.stringify(clarity)];
        if (!P) throw new Error('closed-loop: the take summaries hold no pitch for the gate ' + JSON.stringify(clarity) + ' (run the intake again)');
        const g = Math.round((Math.round((clock.now - mic.offsetMs) / 1000 * mic.sr) - back) / SUM_HOP);
        return g >= 0 && g < P.length ? P[g] : 0;
      }
    }
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  const MODULE_FILES = readdirSync(ROOT).filter(f => /^module-\d+\.js$/.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  for (const f of ['i18n.js', 'guitar-diagrams.js', 'class-activities.js', 'config-main.js', ...MODULE_FILES, 'app.js', 'fab-tools.js', 'tuner.js'])
    vm.runInContext(siteText(f, ROOT), ctx, { filename: f });
  vm.runInContext(coachSrc, ctx, { filename: 'coach.js' });
  const run = code => vm.runInContext(code, ctx);
  run(`globalThis.__cl = {
    list(){ return JSON.stringify(CC_POWER_PROGRESSIONS.map((p, i) => ({ i, chords: p.chords, group: p.group, song: p.song || null, random: !!p.random }))); },
    rates(){ return JSON.stringify(CC_RATES.map(r => r.id)); },
    start(progIdx, bpm, rateIdx, lat){
      setLang('en'); ccSetup('power'); ccPickRate(rateIdx); ccPickProg(progIdx); cc.bpm = bpm;
      nrOffsetMs = lat;
      coachAnalyser = __mic.analyser; coachCtx = __mic.ctx; coachFrameBuf = new Float32Array(COACH_FFT);
      coachReadCtx = null;
      ccPrepare(false); ccBeginStage();
      /* A stand-in for a running capture, so ccLoop logs every strum it hears the way a saved take does (cc.evLog); nothing is recorded or saved. */
      micRec = { live: true, mode: 'pw', lastFrameT: 0, frames: 0, frameSum: 0, frameMax: 0 };
    },
    key(){ return cc ? cc.phase + '|' + cc.stage + '|' + cc.listenStart : 'none'; },
    round(){
      const midis = {};
      cc.chords.forEach(n => { midis[n] = chordMidis(pwBaseName(n, cc.shapes)); });
      return JSON.stringify({ stage: cc.stage, listenStartMs: cc.listenStart, beatMs: cc.beatMs, bpc: cc.bpc, slots: cc.slots, seq: cc.seq, midis });
    },
    result(){
      const out = { phase: cc.phase, onsets: cc.onsetCount, scoreBpm: cc.phase === 'done' ? ccScoreBpm() : null,
        changes: cc.changes.map(c => ({ from: c.from, to: c.to, stage: c.stage || 0, bpm: c.bpm, verdict: c.result, readings: c.readings ? c.readings.length : null })),
        meta: cc.phase === 'done' ? ccRecMeta(true) : null, lat: coachMicLatencyMs() };
      micRec = null;
      ccStop(); cc = null;
      return JSON.stringify(out);
    }
  };`);
  return {
    chain, clock, beeps, mic, run, coachSrc,
    progs: JSON.parse(run('__cl.list()')), rates: JSON.parse(run('__cl.rates()')),
    tick(){
      const due = timers.filter(x => x.at <= clock.now).sort((a, b) => a.at - b.at);
      timers = timers.filter(x => x.at > clock.now);
      due.forEach(x => x.fn());
      const q = rafs; rafs = [];
      q.forEach(x => x.fn(clock.now));
    },
    reset(){ timers = []; rafs = []; beeps.length = 0; clock.now = 0; mic.sr = SR; mic.offsetMs = 0; mic.sum = null; }
  };
}

/* One whole game. Returns { changes: [{ did, devMs, verdict, readings, bpm, stage, from, to }], ... }. */
export function playGame(site, g){
  const o = Object.assign({ student: 'steady', room: 'quiet', mic: 'chromebook', bpm: 60, rateIdx: site.rates.indexOf('beat'), fps: 60, lagMs: 70, lat: 50, seed: 1, clickAmp: 0.03 }, g);
  const device = typeof o.mic === 'string' ? MICS[o.mic] : o.mic;
  if (!device) throw new Error('no such mic: ' + o.mic);
  const student = new Student(o.student, { room: o.room, lagMs: o.lagMs, seed: o.seed });
  const jit = rng(o.seed * 7919 + 13);
  site.reset();
  const START = 1000;
  let air = new Float32Array(SR * 30), proc = new Float32Array(SR * 30), raw = new Float32Array(SR * 30);
  site.mic.proc = proc; site.mic.upTo = 0;
  const grow = s => { if (s <= air.length) return; const n = Math.max(s, air.length * 2); const a = new Float32Array(n), p = new Float32Array(n), w = new Float32Array(n); a.set(air); p.set(proc); w.set(raw); air = a; proc = p; raw = w; site.mic.proc = proc; };
  const devHp = device.hp ? biquad('highpass', device.hp, 0.7) : x => x;
  const hp = biquad('highpass', site.chain.hp, site.chain.hpQ), lp = biquad('lowpass', site.chain.lp, site.chain.lpQ);
  let rendered = 0, beepsDone = 0;
  const pump = () => {
    const toS = Math.round(site.clock.now / 1000 * SR);
    grow(toS + SR);
    // the speaker: each count-in click the site queued, heard `lagMs` later
    for (; beepsDone < site.beeps.length; beepsDone++){
      const b = site.beeps[beepsDone], s0 = Math.round((b.atMs + o.lagMs) / 1000 * SR), n = Math.round(0.08 * SR);
      grow(s0 + n + 1);
      for (let i = 0; i < n; i++) if (s0 + i >= rendered) air[s0 + i] += o.clickAmp * Math.pow(0.0025, i / n) * Math.sin(2 * Math.PI * b.freq * i / SR);
    }
    student.render(air, rendered / SR * 1000, toS / SR * 1000);
    for (let s = rendered; s < toS; s++){
      let v = devHp(air[s]) * device.gain;
      v = v > 1 ? 1 : v < -1 ? -1 : v;
      raw[s] = v;
      proc[s] = lp(hp(v * site.chain.gain));
    }
    rendered = toS; site.mic.upTo = toS;
  };
  site.clock.now = START;
  pump();
  site.run(`__cl.start(${o.progIdx}, ${o.bpm}, ${o.rateIdx}, ${o.lat})`);
  const key = [];
  let seen = '', guard = 0;
  const frameMs = 1000 / o.fps;
  for (;;){
    const k = site.run('__cl.key()');
    if (k !== seen){
      seen = k;
      if (k.startsWith('countin|')){
        const round = JSON.parse(site.run('__cl.round()'));
        student.play(round).forEach(x => key.push(Object.assign(x, { stage: round.stage })));
      }
      if (k.startsWith('done|') || k === 'none') break;
    }
    site.clock.now += frameMs * (0.85 + 0.3 * jit());
    pump();
    site.tick();
    if (++guard > 400000) throw new Error('closed-loop: the game never ended (' + k + ')');
  }
  const res = JSON.parse(site.run('__cl.result()'));
  if (res.changes.length !== key.length) throw new Error(`closed-loop: the game graded ${res.changes.length} changes, the student played ${key.length}`);
  const changes = res.changes.map((c, i) => {
    const t = key[i];
    if (t.to !== c.to || t.from !== c.from) throw new Error(`closed-loop: change ${i} is ${c.from}>${c.to} in the game and ${t.from}>${t.to} for the student`);
    return { stage: c.stage, bpm: c.bpm, from: c.from, to: c.to, did: t.did, devMs: t.devMs == null ? null : Math.round(t.devMs), verdict: c.verdict, readings: c.readings };
  });
  /* The game as a saved take (the console's Download WAV + Download data pair): the raw mic and what ccRecMeta would save. The site's clock and
     the audio's are the same clock here, so the take's `map` is 0. */
  const take = o.keepTake && res.meta ? { audio: raw.subarray(0, rendered), json: Object.assign({}, res.meta.fields, { expected: res.meta.expected, events: res.meta.events, tempoChanges: res.meta.tempoChanges,
    mode: 'pw', micLatencyMs: res.lat, sampleRate: SR, srcSampleRate: SR, durationSec: Math.round(rendered / SR * 100) / 100, frameMeanMs: Math.round(frameMs * 10) / 10, micLabel: 'virtual student', userAgent: 'closed-loop.mjs',
    savedAt: new Date(Date.UTC(2026, 10, 11, 0, 0, o.seed % 60, 0)).toISOString(), virtual: { student: o.student, room: o.room, mic: o.mic, key: changes.map(c => c.did) } }) } : null;
  return { changes, onsets: res.onsets, scoreBpm: res.scoreBpm, phase: res.phase, take };
}

export function writeWav(file, x, sr){
  const b = Buffer.alloc(44 + x.length * 2);
  b.write('RIFF', 0); b.writeUInt32LE(36 + x.length * 2, 4); b.write('WAVEfmt ', 8); b.writeUInt32LE(16, 16); b.writeUInt16LE(1, 20); b.writeUInt16LE(1, 22);
  b.writeUInt32LE(sr, 24); b.writeUInt32LE(sr * 2, 28); b.writeUInt16LE(2, 32); b.writeUInt16LE(16, 34); b.write('data', 36); b.writeUInt32LE(x.length * 2, 40);
  for (let i = 0; i < x.length; i++) b.writeInt16LE(Math.max(-32768, Math.min(32767, Math.round(x[i] * 32768))), 44 + i * 2);
  writeFileSync(file, b);
}

/* Counts for a list of games' changes: truth x verdict. */
export function tally(changes){
  const t = {};
  for (const d of ['right', 'wrong', 'held', 'silent']) t[d] = { n: 0, ok: 0, off: 0, miss: 0, okTiming: 0 };
  for (const c of changes){
    const row = t[c.did]; row.n++; row[c.verdict]++;
    if (c.verdict === 'ok' && (c.readings == null || c.readings < 3)) row.okTiming++;
  }
  return t;
}

/* The no-guitar cases: [name, student, room, what it is]. No chord sounds in any of them. */
export const NO_GUITAR = [
  ['dead mic',        'noGuitar',   'dead',    'the mic gives exact silence'],
  ['quiet room',      'noGuitar',   'quiet',   'an empty quiet room'],
  ['fan',             'noGuitar',   'fan',     'steady loud hiss and a hum, nothing that starts or stops'],
  ['one voice',       'noGuitar',   'talk',    'one person talking next to the laptop'],
  ['class talking',   'noGuitar',   'chatter', 'a class talking, no guitars out'],
  ['bumps',           'noGuitar',   'bumps',   'a chair or a case knocked every two seconds or so'],
  ['typing',          'noGuitar',   'typing',  'key and trackpad clicks on this laptop'],
  ['partner guitar',  'noGuitar',   'pair',    'only the partner is playing'],
  ['class guitars',   'noGuitar',   'class',   'the class is playing, this student is not'],
  ['loud class',      'noGuitar',   'loud',    'a loud class playing, this student is not'],
  ['desk taps',       'tapper',     'quiet',   'a tap on the desk on every beat'],
  ['muted strums',    'mutedStrum', 'quiet',   'strums on every beat across strings the hand is muting: a scratch, no chord']
];

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]){
  const args = process.argv.slice(2);
  const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
  if (args.includes('list')){
    console.log('students: ' + Object.keys(STUDENTS).join(', ') + '\nrooms:    ' + Object.keys(ROOMS).join(', ') + '\nmics:     ' + Object.keys(MICS).join(', '));
    process.exit(0);
  }
  const rule = opt('rule', 'base');
  if (!RULES.includes(rule)){ console.error('--rule must be one of ' + RULES.join(', ')); process.exit(2); }
  const site = makeSite(opt('coach', null), rule);
  if (rule !== 'base') console.log('CANDIDATE RULE "' + rule + '" (tools/mic-sim/candidates.mjs), not the site\'s own coach.js');
  const students = opt('students', Object.keys(STUDENTS).join(',')).split(',');
  const rooms = opt('rooms', 'quiet,class').split(','), mics = opt('mics', 'chromebook').split(',');
  const bpms = opt('bpm', '30,60,90,120').split(',').map(Number), fpss = opt('fps', '60').split(',').map(Number);
  const seeds = +opt('seeds', 2), lagMs = +opt('lag', 70);
  const rateArg = opt('rate', 'beat'), rateIdx = site.rates.indexOf(rateArg);
  if (rateIdx < 0){ console.error('--rate must be one of ' + site.rates.join(', ')); process.exit(2); }
  for (const [list, known, what] of [[students, STUDENTS, 'student'], [rooms, ROOMS, 'room'], [mics, MICS, 'mic']])
    for (const n of list) if (!known[n]){ console.error(`no ${what} "${n}" (node tools/mic-sim/closed-loop.mjs list)`); process.exit(2); }
  const song = opt('song', null), pairArg = opt('pairs', 'F5-G5,B5-C5,G5-C5');
  const progs = song ? site.progs.filter(p => p.song === song)
    : site.progs.filter(p => !p.random && !p.song && (pairArg === 'all' || pairArg.split(',').includes(p.chords.join('-'))));
  if (!progs.length){ console.error('no such pair or song'); process.exit(2); }
  if (args.includes('--no-guitar')){
    console.log(`Power Chord Switch with NO guitar · ${progs.map(p => p.chords.join('-')).join(' ')} · ${bpms.join('/')} BPM · every ${rateArg} · ${fpss.join('/')} fps · ${seeds} games per cell · strum rule ${site.run('CC_POWER_ONSET_RATIO')} / ${site.run('CC_POWER_HF_RATIO')}`);
    console.log('No chord is played in any of these games: every "right" is the game marking something nobody played.\n');
    console.log('case             | said RIGHT | said wrong chord | said no strum | changes | games with a right | right, by BPM (' + bpms.join(' / ') + ')');
    let failed = 0, seedBase = 0, total = 0;
    const out = [];
    for (const [name, st, room, what] of NO_GUITAR){
      const t = { ok: 0, off: 0, miss: 0 }, byBpm = bpms.map(() => [0, 0]);
      let n = 0, gamesN = 0, gamesRight = 0;
      for (const fps of fpss) bpms.forEach((bpm, bi) => { for (const p of progs) for (let s = 1; s <= seeds; s++){
        const g = playGame(site, { student: st, room, mic: mics[0], fps, bpm, progIdx: p.i, rateIdx, lagMs, seed: ++seedBase });
        if (g.changes.some(c => c.did !== 'silent')) throw new Error('closed-loop: a no-guitar case played a chord (' + name + ')');
        g.changes.forEach(c => { t[c.verdict]++; n++; byBpm[bi][1]++; if (c.verdict === 'ok') byBpm[bi][0]++; });
        gamesN++; if (g.changes.some(c => c.verdict === 'ok')) gamesRight++;
        out.push({ case: name, student: st, room, fps, bpm, pair: p.chords.join('-'), seed: seedBase, scoreBpm: g.scoreBpm, onsets: g.onsets, changes: g.changes });
      } });
      total += n;
      const pct = k => (String(t[k]).padStart(4) + ' ' + String(Math.round(100 * t[k] / n)).padStart(3) + '%');
      if (t.ok) failed++;
      console.log(`${name.padEnd(16)} | ${pct('ok')}  |    ${pct('off')}     |   ${pct('miss')}   | ${String(n).padStart(7)} | ${String(gamesRight).padStart(8)} of ${String(gamesN).padEnd(6)} | ${byBpm.map(x => Math.round(100 * x[0] / x[1]) + '%').join(' / ').padEnd(22)} ${t.ok ? 'FAIL' : 'pass'}  ${what}`);
    }
    console.log(`\n${failed} of ${NO_GUITAR.length} cases FAIL (something marked right with no chord played) · ${out.length} games, ${total} graded changes`);
    if (opt('json', null)) writeFileSync(opt('json'), JSON.stringify(out));
    process.exit(failed ? 1 : 0);
  }
  const games = students.length * rooms.length * mics.length * fpss.length * bpms.length * progs.length * seeds;
  console.log(`Power Chord Switch, closed loop · ${progs.length} ${song ? 'switches of ' + song : 'pairs'} (${progs.map(p => p.chords.join('-')).join(' ')}) · ${bpms.join('/')} BPM · every ${rateArg} · ${fpss.join('/')} fps · ${seeds} games per cell · ${games} games`);
  console.log(`strum rule ${site.run('CC_POWER_ONSET_RATIO')} / ${site.run('CC_POWER_HF_RATIO')} · mic chain x${site.chain.gain}, ${site.chain.hp}-${site.chain.lp} Hz · synthetic sound; only the ring time is fitted to classroom takes (student.mjs)\n`);
  const pc = (a, b) => b ? String(Math.round(100 * a / b)).padStart(3) + '%' : '   -';
  console.log('student     room   mic        fps | right chord: said right / wrong / no strum | fret high: caught | never moved: caught | no strum: said RIGHT (heard) |  changes');
  const all = [], t0 = Date.now(), takesOut = opt('takes-out', null);
  if (takesOut) mkdirSync(takesOut, { recursive: true });
  let seedBase = 0;
  for (const st of students) for (const room of rooms) for (const micName of mics) for (const fps of fpss){
    const cell = [];
    for (const bpm of bpms) for (const p of progs) for (let s = 1; s <= seeds; s++){
      const g = playGame(site, { student: st, room, mic: micName, fps, bpm, progIdx: p.i, rateIdx, lagMs, seed: ++seedBase, keepTake: !!takesOut });
      if (takesOut && g.take){ const b = join(takesOut, 'V' + String(seedBase).padStart(3, '0')); writeWav(b + '.wav', g.take.audio, SR); writeFileSync(b + '.json', JSON.stringify(g.take.json)); }
      g.changes.forEach(c => cell.push(c));
      all.push({ student: st, room, mic: micName, fps, bpm, pair: p.chords.join('-'), seed: seedBase, scoreBpm: g.scoreBpm, onsets: g.onsets, changes: g.changes });
    }
    const t = tally(cell);
    console.log(`${st.padEnd(11)} ${room.padEnd(6)} ${micName.padEnd(10)} ${String(fps).padStart(3)} |        ${pc(t.right.ok, t.right.n)} (${pc(t.right.okTiming, t.right.n).trim()} on timing) / ${pc(t.right.off, t.right.n)} / ${pc(t.right.miss, t.right.n)}  |       ${pc(t.wrong.off, t.wrong.n)}        |        ${pc(t.held.off, t.held.n)}         |     ${pc(t.silent.ok, t.silent.n)} (${pc(t.silent.ok + t.silent.off, t.silent.n).trim()})${t.silent.n ? ' of ' + t.silent.n : ''}`.padEnd(160) + `| ${String(cell.length).padStart(6)}`);
  }
  console.log(`\n${all.length} games, ${all.reduce((n, g) => n + g.changes.length, 0)} graded changes, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  if (opt('json', null)) writeFileSync(opt('json'), JSON.stringify(all));
}
