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
       --no-guitar                    the no-guitar cases (below) instead of the table; exits 1 when any case fails (with --against,
                                      the exit code is the comparison's instead)
       --game=changeup                CHANGE UP instead of Power Chord Switch (below); default power, which runs exactly as before
       --root=<folder>                load every site script from another site folder (a checkout, or a scratch copy with a planted fault)
       --against=<file>               an earlier --json of the SAME command: prints how many verdicts moved, ranked by the answer key
                                      (RANK below: worse, better, by design, between two wrong verdicts). With it, the exit code is
                                      about the comparison ALONE, in the table and in --no-guitar: 0 = no verdict moved; 1 = one moved,
                                      or the SITE graded a different set of changes with every world setting the same (how many changes,
                                      between which chords, or the answer key its round gave the student: sameChanges below); 2 = not
                                      the same command (another game list, game, case, student, room, mic, rate, --lag, fps, tempo,
                                      loop or seed, or a --json from another student model, STUDENT_MODEL in student.mjs: every --json
                                      game records it, and files from before 2026-11-12 have none), the same file as --json, or a file
                                      that cannot be read as a --json. The file is read before the run, so it is never this run's output.
       --replay=<n>                   play only game n of the run (the number --against prints) and print every change of it; n must be
                                      a positive whole number (anything else: exit 2). Not with --against or --json (exit 2): find the
                                      game with --against, then replay it alone.
       --no-takes                     leave out the REAL TAKES section (below) that ends every Power Chord Switch run
       --takes-only                   run only the REAL TAKES section (no virtual student)
       list                           print the students, rooms and mics; with --game=changeup also count every wrong chord a student can
                                      be given by its class (wrongClass)
     Arguments: each option is ONE argument, --name=value (a space instead of "=", a misspelt or unknown option, an option given twice,
     or a number option that is not a number: exit 2 before anything runs). Any error in the run exits 2 as well: 1 only ever means the
     site graded differently (--against) or a no-guitar case failed. The first line printed names the site folder the scripts were loaded from.

   REAL TAKES (2026-11-12; Jonathan: "we'll have to rely on recorded student takes. build that into the closed loop check"). Every Power Chord
   Switch run, the table and --no-guitar, ends with the take summaries in tools/mic-sim/takes/ (recorded students; brought in with
   node tools/mic-sim/takes-in.mjs) replayed through the loaded site's real ccLoop, with this run's --rule at the site's own strum ratios: how
   many takes and changes; windows with NO strum in the recording that the game HEARD and that it marked RIGHT; real strums the game LOST; the
   "reproduced" error bar (at each take's own ratios, how often the replay gives the take's saved verdict); and "ASK JONATHAN for new takes"
   when it applies. The code is replay-takes.mjs's, imported (realTakes below). --root, --coach and --rule apply to it; --json holds it per take
   and per change; --against compares it per change and prints it FIRST, ranked by the recording (no strum moving to "right" is WORSE, a real
   strum newly lost is WORSE). Real takes outrank the synthetic rooms when the two disagree: the rooms are guesses beside them.
   What it can judge: the strum rule (onset ratios, refractory, the miss window), the grid and the grading rules in ccResolvePend, on what the
   mic really heard. What it cannot: a change to coachDetectPitch, to the mic chain or to the 1024 / 512 window sizes (the summaries hold
   energy and pitch measured with the old ones; a changed detector or chain makes an ASK line), any rule that needs more than loudness, attack
   and pitch; and its frames are evenly spaced at each take's mean frame time (the real ones were not). The truth is only "was there a strum
   in the recording where the game listened" (eval-takes.mjs): it says nothing about which chord was played. A difference of 3 or fewer
   changes between two rules is no difference (the summary replay and the audio replay differ by up to 3, WORKFLOW 2026-11-11).

   CHANGE UP (--game=changeup, 2026-11-11). The sister game on OPEN chords: ccSetup() with no mode, as the Games hub calls it, then the same
   ccPrepare / ccBeginStage / coachCountIn / ccLoop / coachReadFrame / coachPitchReadings / ccResolvePend / ccFinish as Power Chord Switch; ccLoop
   picks the shared strum ratios CHK_ONSET_RATIO / CHK_HF_RATIO and the 0.55 chord gate for it (the strum-rule label printed is just that
   label: the game picks its own). Its own defaults: --bpm=40,60,90,120 (it runs 40-140), --rate=bar (the game's first rate: a change every
   bar, 7 changes a game), --pairs=Am-Em,G-C-D,C-G-Am-F (one loop of each length; `all` = its 21 loops). Not modelled: Random 4 (it draws with
   Math.random, so a game could not be replayed), --song, --rule and --takes-out (Power Chord Switch's; Change Up never records, so no capture
   stand-in is set either: a live one would also move the first count-in click). tools/grid-sim.mjs Part 2 already plays Change Up 40-140 on
   SCRIPTED frames with no audio and no pitch, for the grid's step cap; this plays sound, so the strum detector and the chord check run too.
   The rules the answer key is written from (prose, not code):
     - right: the new chord strummed on the change is right (coach-chords.js header: "did a strum land on beat 1 of the new bar, and does it
       ring like the new chord's notes"); a strum with fewer than 3 pitch readings counts on timing alone (ccLoop / ccResolvePend comments).
     - wrong: another chord of the loop, neither the old nor the new one, is wrong ("a strum of something else entirely is 'off'"). A two-chord
       loop has no such chord, so the student plays one of CC_RANDOM_POOL ("the open chords students know"). ccResolvePend grades with TWO
       rules (its comment): rule 1, "some tone of the NEW chord has to be heard at all"; rule 2, the old chord's exclusive tones must not
       outnumber the new chord's (the held-chord signature). The column is split three ways by what those rules do with the played shape,
       one ideal reading per string (wrongClass, worked out here from the shapes, never by asking the game; `wrongClass` in --json):
       "no shared note" (rule 1 catches it), "rule 2" (it shares a note, but rule 2 should still catch it) and "passes both" (the rules let
       it through BY DESIGN: only these carry byDesign: true). The first two measure a miss. `list --game=changeup` counts every wrong
       chord a student can be given: 181 (loop, old, new, other), 61 with no shared note, 31 for rule 2, 89 passing both (2026-11-12).
     - held: the old chord strummed again on the change is wrong ("a held chord keeps sounding what only it has ... the held-chord signature").
       Column "old chord again caught" (the neverMoves student does this on every change: one chord behind). The same comment says the
       parallel / relative pairs (E/Em, A/Am, C/Am, G/Em) "cannot tell apart either way" and that marking a right change wrong is the worse
       error, so a held change between one of those pairs is counted apart ("lenient pair", byDesign: true) as a known leniency.
     - silent: no strum near the change is "no strum" ("Overdue changes are misses").
     - the chords in the student's hands come from CHORD_DIAGRAMS (data) through standard tuning worked out HERE (low E = MIDI 40, A 45, D 50,
       G 55, B 59, high e 64), never from the game's chordMidis / cc.classes. A fake-world check stops the run when the two disagree on the
       pitch classes of any chord the student can play (the loop's, from cc.classes; the wrong-chord pool's, from the site's chordMidis):
       it catches a broken tuning table here, a broken tuning table on the site (STRING_OPEN_MIDI) and a game listening for chords other
       than the ones it set up. It cannot catch a wrong shape in CHORD_DIAGRAMS: both sides read that data.

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
     held    the old chord, strummed again -> should say wrong chord (neverMoves does this on every change: one chord behind)
     silent  no strum                      -> should say no strum
   The game is lenient on purpose (coach.js, ccLoop's comment): a strum with fewer
   than 3 pitch readings counts on timing alone.

   Synthetic sound. One number (how long a string rings) is fitted to the classroom takes; the rest is not (student.mjs header). */
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Student, STUDENTS, ROOMS, MICS, SR, biquad, rng, STUDENT_MODEL } from './student.mjs';
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
/* siteRoot: another site folder to load every script from (--root, for a before / after or a planted fault); ROOT when not given. */
export function makeSite(coachFile, rule, ratio, fromSummary, siteRoot){
  const SITE = siteRoot || ROOT;
  let coachSrc = applyRule(coachFile ? readScriptArg(coachFile) : siteSource('coach.js', SITE), rule || 'base', ratio || null);
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
  const MODULE_FILES = readdirSync(SITE).filter(f => /^module-\d+\.js$/.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  /* fingerprint: a hash of every script this site runs (coach.js as rewritten for the rule, the ratios and a summary), for the real-take cache. */
  const fp = createHash('sha1');
  for (const f of ['i18n.js', 'guitar-diagrams.js', 'class-activities.js', 'config-main.js', ...MODULE_FILES, 'app.js', 'fab-tools.js', 'tuner.js']){
    const text = siteText(f, SITE);
    fp.update(f + '\0' + text + '\0');
    vm.runInContext(text, ctx, { filename: f });
  }
  fp.update('coach.js\0' + coachSrc);
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
    /* Change Up (--game=changeup): the same steps as start() with ccSetup() as the Games hub calls it (no mode), and no capture stand-in,
       because Change Up never records (ccStart, ccBeginStage): a live capture would also move the count-in's first click (coachCountIn). */
    listCu(){ return JSON.stringify(CC_PROGRESSIONS.map((p, i) => ({ i, chords: p.chords, random: !!p.random }))); },
    startCu(progIdx, bpm, rateIdx, lat){
      setLang('en'); ccSetup(); ccPickRate(rateIdx); ccPickProg(progIdx); cc.bpm = bpm;
      nrOffsetMs = lat;
      coachAnalyser = __mic.analyser; coachCtx = __mic.ctx; coachFrameBuf = new Float32Array(COACH_FFT);
      coachReadCtx = null;
      ccPrepare(false); ccBeginStage();
    },
    /* Data only, for the student's hands: the diagram of each chord the round can use, and the pool Random 4 draws from (the open chords the
       game treats as known). classes() is read only by the fake-world check (playGame, and cuTriples with no game: then every name is
       the site's chordMidis), never for a verdict. */
    data(){ return JSON.stringify({ diagrams: Object.fromEntries(Object.entries(CHORD_DIAGRAMS).map(([k, v]) => [k, v.chord])), pool: CC_RANDOM_POOL, chords: cc ? cc.chords : null, mode: cc ? cc.mode : null, bpmMin: CC_BPM_MIN, bpmMax: CC_BPM_MAX }); },
    classes(names){ const out = Object.assign({}, cc ? cc.classes : null); names.forEach(n => { if (!out[n]) out[n] = chordMidis(n).map(m => ((m % 12) + 12) % 12); }); return JSON.stringify(out); },
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
    chain, clock, beeps, mic, run, coachSrc, fingerprint: fp.digest('hex'),
    progs: JSON.parse(run('__cl.list()')), rates: JSON.parse(run('__cl.rates()')), cuProgs: JSON.parse(run('__cl.listCu()')),
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
  const o = Object.assign({ student: 'steady', room: 'quiet', mic: 'chromebook', bpm: 60, rateIdx: site.rates.indexOf('beat'), fps: 60, lagMs: 70, lat: 50, seed: 1, clickAmp: 0.03, game: 'power' }, g);
  const cu = o.game === 'changeup';
  if (!cu && o.game !== 'power') throw new Error('no such game: ' + o.game);
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
  site.run(`__cl.${cu ? 'startCu' : 'start'}(${o.progIdx}, ${o.bpm}, ${o.rateIdx}, ${o.lat})`);
  let hands = null;
  if (cu){
    const d = JSON.parse(site.run('__cl.data()'));
    if (d.mode !== 'open') throw new Error('closed-loop: Change Up started as "' + d.mode + '", not "open"');
    const asked = site.cuProgs[o.progIdx] ? site.cuProgs[o.progIdx].chords.join('-') : null;
    if (d.chords.join('-') !== asked) throw new Error(`closed-loop: Change Up was asked for ${asked} and set up ${d.chords.join('-')}`);
    hands = cuHands(d);
    worldCheck(hands, JSON.parse(site.run(`__cl.classes(${JSON.stringify(Object.keys(hands.midis))})`)));
  }
  const key = [];
  let seen = '', guard = 0;
  const frameMs = 1000 / o.fps;
  for (;;){
    const k = site.run('__cl.key()');
    if (k !== seen){
      seen = k;
      if (k.startsWith('countin|')){
        const round = JSON.parse(site.run('__cl.round()'));
        if (hands){ round.midis = hands.midis; round.wrongPool = hands.wrongPool; }
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
    const rec = Object.assign({ stage: c.stage, bpm: c.bpm, from: c.from, to: c.to, did: t.did, devMs: t.devMs == null ? null : Math.round(t.devMs), verdict: c.verdict, readings: c.readings }, t.played ? { played: t.played } : {});
    /* Change Up: whether the game may pass this mistake BY DESIGN (worked out here from the chord shapes, never by asking the game).
       wrong: wrongClass below ('none' / 'rule2' / 'design'); only 'design' (the played shape passes both of ccResolvePend's rules) is byDesign.
       held: old and new are one of the pairs ccResolvePend's comment says it cannot tell apart (E/Em, A/Am, C/Am, G/Em). */
    if (hands && t.did === 'wrong'){ rec.wrongClass = wrongClass(hands.midis, c.from, c.to, t.played); rec.byDesign = rec.wrongClass === 'design'; }
    if (hands && t.did === 'held') rec.byDesign = lenientPair(c.from, c.to);
    return rec;
  });
  /* The game as a saved take (the console's Download WAV + Download data pair): the raw mic and what ccRecMeta would save. The site's clock and
     the audio's are the same clock here, so the take's `map` is 0. */
  const take = o.keepTake && res.meta ? { audio: raw.subarray(0, rendered), json: Object.assign({}, res.meta.fields, { expected: res.meta.expected, events: res.meta.events, tempoChanges: res.meta.tempoChanges,
    mode: 'pw', micLatencyMs: res.lat, sampleRate: SR, srcSampleRate: SR, durationSec: Math.round(rendered / SR * 100) / 100, frameMeanMs: Math.round(frameMs * 10) / 10, micLabel: 'virtual student', userAgent: 'closed-loop.mjs',
    savedAt: new Date(Date.UTC(2026, 10, 11, 0, 0, o.seed % 60, 0)).toISOString(), virtual: { student: o.student, room: o.room, mic: o.mic, key: changes.map(c => c.did) } }) } : null;
  return { changes, onsets: res.onsets, scoreBpm: res.scoreBpm, phase: res.phase, take };
}

/* Change Up's chords in the student's hands, worked out here from the diagram data alone (never from the game's chordMidis / cc.classes):
   standard tuning, low E string (6) = MIDI 40, then A 45, D 50, G 55, B 59, high e 64; a fret adds a semitone; an 'x' string is not
   played; the strum runs from the lowest string to the highest. The wrong chord is another chord of the progression (neither the old nor
   the new one); a two-chord loop has none, so it is drawn from CC_RANDOM_POOL, the open chords the game's own Random 4 treats as known. */
const OPEN_STRING = { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 };
export function shapeMidis(chord){
  return chord.slice().sort((a, b) => b[0] - a[0]).filter(([, f]) => f !== 'x' && f != null && f !== '').map(([s, f]) => OPEN_STRING[s] + Number(f));
}
function cuHands(d){
  const wrongPool = d.chords.length >= 3 ? d.chords.slice() : d.pool.slice();
  const midis = {};
  for (const n of new Set([...d.chords, ...wrongPool])){
    if (!d.diagrams[n]) throw new Error('closed-loop: no diagram for ' + n);
    midis[n] = shapeMidis(d.diagrams[n]);
  }
  return { midis, wrongPool };
}
/* The fake world's own check: every chord the student can play must hold the pitch classes the site gives it (the loop's chords: the game's
   cc.classes; the wrong-chord pool: the site's chordMidis). A mismatch means the student is not playing the site's chords (a broken tuning
   table here or on the site): stop, never grade on it. Both sides read CHORD_DIAGRAMS, so a wrong shape there is not seen. */
function worldCheck(hands, classes){
  for (const n of Object.keys(hands.midis)){
    const want = classes[n];
    if (!want) throw new Error(`closed-loop: fake-world check failed: the site gave no pitch classes for ${n}`);
    const have = [...new Set((hands.midis[n] || []).map(m => m % 12))].sort((a, b) => a - b).join(',');
    const need = [...new Set(want)].sort((a, b) => a - b).join(',');
    if (have !== need) throw new Error(`closed-loop: fake-world check failed: the student's ${n} has pitch classes [${have}], the site gives [${need}]`);
  }
}
/* Change Up: what ccResolvePend's two rules (its comment, 2026-09-28) are written to do with a wrong chord, worked out HERE from the shapes,
   never by calling the game. The readings are ideal: one per string the played shape sounds, its pitch class. The rules, as the comment
   states them and the toneOk line applies them to the readings:
     rule 1  some tone of the NEW chord is heard at all: more than 15% of the readings are tones of the new chord;
     rule 2  fail when readings on OLD-only tones (the old chord's, not the new one's) outnumber readings on NEW-only tones and are more
             than 15% of the readings (the "held-chord signature").
   Returns 'none' (rule 1 fails: with at most six strings that is exactly "no note of the new chord", one string being 1/6 > 15%; `list
   --game=changeup` checks it on every triple), 'rule2' (rule 1 passes, rule 2 fails: the rules are written to CATCH it) or 'design' (both
   pass: the game lets it through BY DESIGN). Real readings are fewer and bass-weighted, so this is what the rules intend, not a forecast. */
export function wrongClass(midis, from, to, played){
  const pcs = n => [...new Set(midis[n].map(m => m % 12))];
  const want = pcs(to), was = pcs(from), r = midis[played].map(m => m % 12), n = r.length;
  const newOnly = want.filter(c => !was.includes(c)), oldOnly = was.filter(c => !want.includes(c));
  const anyNew = r.filter(c => want.includes(c)).length / n;
  const newHits = r.filter(c => newOnly.includes(c)).length, oldHits = r.filter(c => oldOnly.includes(c)).length;
  if (!(anyNew > 0.15)) return 'none';
  return oldHits > newHits && oldHits / n > 0.15 ? 'rule2' : 'design';
}
/* Every (loop, old, new, other) a Change Up student can be given: each non-random loop, each change its plan (ccRoundPlan, at every rate)
   holds, and each wrong chord the student may draw for it (cuHands' pool, less the old and the new chord). For `list --game=changeup`. */
function cuTriples(site){
  const d = JSON.parse(site.run('__cl.data()')), out = [];
  for (const p of site.cuProgs.filter(q => !q.random)){
    const hands = cuHands({ chords: p.chords, pool: d.pool, diagrams: d.diagrams });
    worldCheck(hands, JSON.parse(site.run(`__cl.classes(${JSON.stringify(Object.keys(hands.midis))})`)));
    const pairs = new Set();
    for (const seq of JSON.parse(site.run(`JSON.stringify(CC_RATES.map(r => ccRoundPlan(CC_PROGRESSIONS[${p.i}], CC_PROGRESSIONS[${p.i}].chords, r).seq))`)))
      for (let s = 1; s < seq.length; s++) pairs.add(seq[s - 1] + '>' + seq[s]);
    for (const pr of pairs){
      const [from, to] = pr.split('>');
      for (const other of hands.wrongPool.filter(x => x !== from && x !== to)){
        const shared = hands.midis[other].some(m => hands.midis[to].some(k => k % 12 === m % 12));
        out.push({ loop: p.chords.join('-'), from, to, other, shared, cls: wrongClass(hands.midis, from, to, other) });
      }
    }
  }
  return out;
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
/* Change Up's defaults: its own tempo range from 40, and one loop of each length (the game's first loop, a three-chord loop, a four-chord loop). */
const CU_BPMS = '40,60,90,120', CU_LOOPS = 'Am-Em,G-C-D,C-G-Am-F';

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

/* --against: an earlier --json of the same command, compared change by change. Every verdict that moved is counted and ranked by the answer
   key (RANK, higher = closer to the truth): right: ok, then off and miss (both wrong); wrong and held: off, then miss, then ok (said right);
   silent: miss, then off, then ok (said right with nothing played). A move to a lower rank is WORSE, to a higher one better, between equal
   ranks "other". A Change Up mistake the game passes by design (`byDesign`: a wrong chord of class 'design', a held change on a lenient
   pair) has its own order: a move between off and ok is counted on its own ("by design"), a move INTO miss is WORSE (the strum went
   unheard) and a move out of miss is better. */
const AGREES = { right: 'ok', wrong: 'off', held: 'off', silent: 'miss' };
const RANK = { right: { ok: 2, off: 1, miss: 1 }, wrong: { off: 2, miss: 1, ok: 0 }, held: { off: 2, miss: 1, ok: 0 }, silent: { miss: 2, off: 1, ok: 0 } };
/* What a moved change was, in the words of the table's columns. */
const CLASS_WORD = { none: 'no shared note', rule2: 'rule 2', design: 'passes both' };
const moveWhat = c => c.did === 'wrong' && c.wrongClass ? ` (${c.played}, ${CLASS_WORD[c.wrongClass]})` : c.played ? ` (${c.played})` : c.did === 'held' && c.byDesign ? ' (lenient pair)' : '';
function moveKind(c, was){
  if (c.byDesign) return c.verdict === 'miss' ? 'WORSE' : was === 'miss' ? 'better' : 'by design';
  const r0 = RANK[c.did][was], r1 = RANK[c.did][c.verdict];
  return r1 < r0 ? 'WORSE' : r1 > r0 ? 'better' : 'other';
}
/* The world a game was played in: the command's settings and the student model. Any of them different and the two runs are different
   commands, never compared (exit 2). */
function sameWorld(w, g){
  if (w.model !== g.model) return `the student model: the earlier run was made with ${w.model ? 'version ' + w.model : 'no version (before 2026-11-12)'}, this one with ${g.model}; the student plays differently between them (student.mjs STUDENT_MODEL), so re-run the earlier command with today's tool`;
  for (const k of ['game', 'case', 'student', 'room', 'mic', 'rate', 'lagMs', 'fps', 'bpm', 'pair', 'seed']) if (w[k] !== g[k]) return k + ' ' + JSON.stringify(w[k]) + ' / ' + JSON.stringify(g[k]);
  return null;
}
/* The same world and still not the same graded changes: the SITE set up a different game (how many changes it grades, which chords they
   go between; or a different round or chord pool, so the same student played a different answer key), or closed-loop.mjs itself changed
   between the runs. That is a site change the comparison must not hide (exit 1), never "not the same command". */
function sameChanges(w, g){
  if (w.changes.length !== g.changes.length) return `${w.changes.length} graded changes then, ${g.changes.length} now`;
  for (let i = 0; i < g.changes.length; i++){
    const a = w.changes[i], b = g.changes[i];
    if (a.from !== b.from || a.to !== b.to) return `change ${i + 1} was ${a.from}>${a.to}, now ${b.from}>${b.to}`;
    for (const k of ['did', 'played']) if (a[k] !== b[k]) return `change ${i + 1} (${b.from}>${b.to}): the student ${k} ${JSON.stringify(a[k])} then, ${JSON.stringify(b[k])} now`;
  }
  return null;
}
/* Returns { code: 0 same, 1 a verdict moved or the site graded a different set of changes, 2 not the same command, lines }. `was` is the
   earlier run, read before this one started. */
function compareRuns(now, was, file){
  if (!Array.isArray(was)) return { code: 2, lines: [`against ${file}: not a --json of this tool (no list of games); nothing compared`] };
  if (!was.length && !now.length) return { code: 0, lines: [] };
  if (was.length !== now.length) return { code: 2, lines: [`against ${file}: NOT THE SAME COMMAND (it has ${was.length} games, this run ${now.length}); nothing compared`] };
  for (let gi = 0; gi < now.length; gi++){
    const why = sameWorld(was[gi], now[gi]);
    if (why) return { code: 2, lines: [`against ${file}: NOT THE SAME COMMAND (game ${gi + 1}: ${why}); nothing compared`] };
  }
  const siteDiff = [];
  now.forEach((g, gi) => { const why = sameChanges(was[gi], g); if (why) siteDiff.push(`game ${g.seed}: ${why}`); });
  let n = 0, diff = 0, worse = 0, better = 0, design = 0, other = 0, games = 0;
  const first = [];
  now.forEach((g, gi) => {
    const w = was[gi];
    if (sameChanges(w, g)) return;
    games++;
    g.changes.forEach((c, ci) => {
      n++;
      const o = w.changes[ci];
      if (o.verdict === c.verdict) return;
      diff++;
      const kind = moveKind(c, o.verdict);
      if (kind === 'WORSE') worse++; else if (kind === 'better') better++; else if (kind === 'by design') design++; else other++;
      if (first.length < 10) first.push(`  game ${g.seed} (${g.case ? g.case + ', ' : ''}${g.student} ${g.room} ${g.bpm} BPM ${g.pair}) change ${ci + 1}: played ${c.did}${moveWhat(c)}, was ${o.verdict}, now ${c.verdict}  ${kind}   replay: --replay=${g.seed}`);
    });
  });
  const lines = [];
  if (siteDiff.length) lines.push(`against ${file}: the SITE graded a different set of changes in ${siteDiff.length} of ${now.length} games, every world setting and the student model the same (${siteDiff.slice(0, 3).join('; ')}${siteDiff.length > 3 ? '; ...' : ''}); those games' verdicts are not compared  RED`);
  if (games) lines.push(`against ${file}: ${diff} of ${n} graded changes differ (${worse} worse by the answer key, ${better} better, ${design} a mistake the game may pass by design, ${other} between two wrong verdicts) in ${games} games${siteDiff.length ? ' with the same changes' : ''}${diff ? '  RED' : '  same'}`, ...first);
  return { code: diff || siteDiff.length ? 1 : 0, lines };
}

/* REAL TAKES (2026-11-12; Jonathan: "it's hard for me to do that. we'll have to rely on recorded student takes. build that into the closed loop
   check"). Every Power Chord Switch take summary in tools/mic-sim/takes/ replayed through the loaded site's real ccLoop, with the rule this run
   plays (--rule, base = the site's own) at the site's own strum ratios. All of it is replay-takes.mjs's code, imported, not copied: loadSummaries,
   askReasons, softNotes, replayAll, printReport. Imported when needed, because replay-takes.mjs imports makeSite from this file. */
/* The cache: one file per (summary, site code) in tools/mic-sim/.replay-cache/ (gitignored, tools/mic-sim/.gitignore; delete it any time). The key
   is a hash of this file and replay-takes.mjs, of every script the site ran (makeSite's fingerprint: coach.js as rewritten for the rule and the
   ratios included) and of the summary file itself, so any change to any of them replays again. */
const CACHE_DIR = join(dirname(fileURLToPath(import.meta.url)), '.replay-cache');
function replayCache(){
  const here = dirname(fileURLToPath(import.meta.url));
  const tools = createHash('sha1').update(readFileSync(join(here, 'closed-loop.mjs')) + '\0' + readFileSync(join(here, 'replay-takes.mjs'))).digest('hex');
  const c = { hits: 0, runs: 0,
    key: (site, tk) => createHash('sha1').update(tools + '|' + site.fingerprint + '|' + tk.hash).digest('hex'),
    get(k){ const f = join(CACHE_DIR, k + '.json'); if (!existsSync(f)){ c.runs++; return null; } c.hits++; return JSON.parse(readFileSync(f, 'utf8')); },
    set(k, v){ mkdirSync(CACHE_DIR, { recursive: true }); writeFileSync(join(CACHE_DIR, k + '.json'), JSON.stringify(v)); } };
  return c;
}
async function realTakes(at, rule){
  const RT = await import('./replay-takes.mjs');
  const t0 = Date.now(), takes = RT.loadSummaries(RT.TAKES_DIR), NOW = RT.todayRatios(at), cache = replayCache();
  const days = takes.map(t => t.day).filter(Boolean).sort();
  console.log(`\nREAL TAKES · ${takes.length} Power Chord Switch take summaries (tools/mic-sim/takes/${days.length ? ', ' + days[0] + ' to ' + days[days.length - 1] : ''}: recorded students, no audio) · replayed through this site's ccLoop, rule ${rule}, at its strum ratios ${NOW.join(' / ')}`);
  const why = RT.askReasons(takes, RT.baseSite(at)), soft = RT.softNotes(takes);
  console.log(why.length ? 'ASK JONATHAN for new takes (he downloads the recordings, then: node tools/mic-sim/takes-in.mjs):\n' + why.map(w => '  - ' + w).join('\n') : 'Takes are current: no need to ask Jonathan for new ones.');
  if (soft.length) console.log('Note (no need to ask him for this alone): ' + soft.join('; '));
  if (!takes.length) return { rule, ratios: NOW, takes: [] };
  RT.replayAll(takes, [rule], NOW, at, cache);
  console.log('  "no strum" = no strum in the recording where the game listened: HEARD and marked RIGHT should be 0. "real strums" = strums the game heard when');
  console.log('  the take was made: LOST = no longer heard. "reproduced" is the error bar: at each take\'s own ratios, how often the replay gives the saved verdict.');
  RT.printReport(takes, [rule], NOW, l => console.log(l));
  console.log(`  Cannot judge: a change to the pitch detector, the mic chain or the 1024 / 512 window sizes (the summaries hold readings made with the old ones;`);
  console.log(`  a stale one is an ASK line above); frames are replayed evenly spaced. Treat 3 or fewer changes between two rules as no difference.`);
  console.log(`  ${takes.length} takes in ${((Date.now() - t0) / 1000).toFixed(1)} s (${cache.runs} replays run, ${cache.hits} read from tools/mic-sim/.replay-cache/)`);
  const key = rule + '@now', own = rule + '@own';
  return { rule, ratios: NOW, takes: takes.map(tk => ({ take: tk.take, id: tk.id, day: tk.day, own: tk.own, mapFrom: tk.mapFrom,
    changes: tk.notes.map(n => { const v = tk.res[key][n.i], o = tk.res[own][n.i]; return { i: n.i, stage: n.stage, strum: !!n.played, cat: n.why ? n.why.cat : null, saved: n.site,
      verdict: v ? v.verdict : null, readings: v ? v.readings : null, ownVerdict: o ? o.verdict : null }; }) })) };
}
/* --against for the real takes, per take (by fingerprint) and per change. The truth is only whether the recording has a strum where the game
   listened: no strum ranks like `silent` (no strum, then wrong chord, then right: a move to "right" is WORSE); a real strum ranks heard (right or
   wrong chord, the take cannot say which chord was played) over not heard (newly LOST is WORSE). */
const TAKE_RANK = { strum: { ok: 1, off: 1, miss: 0 }, none: { miss: 2, off: 1, ok: 0 } };
const TAKE_WORD = { ok: 'right', off: 'wrong chord', miss: 'no strum' };
function compareTakes(now, was, file){
  if (!now && !was) return null;
  if (!now || !was) return { code: 2, lines: [`against ${file}: NOT THE SAME COMMAND (the real takes are in ${was ? 'the earlier run and not in this one' : 'this run and not in the earlier one'}: --no-takes and --takes-only must match); nothing compared`] };
  const byId = new Map(was.takes.map(t => [t.id, t]));
  let n = 0, diff = 0, worse = 0, better = 0, other = 0, takesN = 0;
  const split = { noneWorse: 0, noneBetter: 0, lost: 0, found: 0 };
  const first = [], only = now.takes.filter(t => !byId.has(t.id)).length + was.takes.filter(t => !now.takes.some(u => u.id === t.id)).length;
  for (const t of now.takes){
    const w = byId.get(t.id);
    if (!w) continue;
    takesN++;
    const wi = new Map(w.changes.map(c => [c.i, c]));
    for (const c of t.changes){
      const o = wi.get(c.i);
      if (!o || c.verdict == null || o.verdict == null) continue;
      n++;
      if (o.verdict === c.verdict) continue;
      diff++;
      const R = TAKE_RANK[c.strum ? 'strum' : 'none'], r0 = R[o.verdict], r1 = R[c.verdict];
      const kind = r1 < r0 ? 'WORSE' : r1 > r0 ? 'better' : 'other';
      if (kind === 'WORSE') worse++; else if (kind === 'better') better++; else other++;
      if (!c.strum && kind === 'WORSE') split.noneWorse++; else if (!c.strum && kind === 'better') split.noneBetter++;
      else if (c.strum && kind === 'WORSE') split.lost++; else if (c.strum && kind === 'better') split.found++;
      if (first.length < 10) first.push(`  take ${t.take} (${t.id}) change ${c.i}: ${c.strum ? 'a real strum' : 'no strum in the recording'}, was ${TAKE_WORD[o.verdict]}, now ${TAKE_WORD[c.verdict]}  ${kind}`);
    }
  }
  return { code: diff ? 1 : 0, lines: ['Real takes first: they are recorded students; the rooms below are guesses. When the two disagree, the real takes win.',
    `against ${file}: REAL TAKES ${diff} of ${n} replayed changes differ (${worse} worse by the recording, ${better} better, ${other} right <-> wrong chord on a real strum, which the takes cannot rank) in ${takesN} takes: no strum in the recording ${split.noneWorse} worse (now heard or marked right), ${split.noneBetter} better; real strums ${split.lost} newly LOST, ${split.found} heard again${only ? `; ${only} takes in only one of the runs, not compared` : ''}${diff ? '  RED' : '  same'}`, ...first] };
}
/* The whole comparison: the real takes first, then the synthetic games. Exit codes as compareRuns. */
function compareAll(games, takes, was, file){
  const t = compareTakes(takes, was.realTakes || null, file), g = compareRuns(games, was.games, file);
  const two = [t, g].filter(r => r && r.code === 2);
  if (two.length) return { code: 2, lines: two.flatMap(r => r.lines) };
  return { code: Math.max(t ? t.code : 0, g.code), lines: [...(t ? t.lines : []), ...g.lines] };
}
/* Change Up's lenient pairs (ccResolvePend's comment: "E/Em, A/Am, C/Am, G/Em ... cannot tell apart either way"). */
const LENIENT = [['E', 'Em'], ['A', 'Am'], ['C', 'Am'], ['G', 'Em']];
const lenientPair = (a, b) => LENIENT.some(([x, y]) => (a === x && b === y) || (a === y && b === x));
/* --replay: one game of the run, alone, every change printed. */
function printReplay(g, what, where){
  console.log(`game ${what.seed}: ${what.case ? what.case + ' · ' : ''}${what.student} · ${what.room} · ${what.bpm} BPM · ${what.pair} · ${what.fps} fps · score ${g.scoreBpm} BPM · ${g.onsets} sounds taken for strums · ${where}`);
  g.changes.forEach((c, i) => console.log(`  change ${String(i + 1).padStart(2)}  ${(c.from + '>' + c.to).padEnd(7)} played ${(c.did + (c.played ? ' (' + c.played + ')' : '')).padEnd(12)} said ${c.verdict.padEnd(4)} ${AGREES[c.did] === c.verdict ? 'agrees' : 'DISAGREES'}   timing ${c.devMs == null ? '-' : c.devMs + ' ms'}   pitch readings ${c.readings == null ? '-' : c.readings}`));
}

/* The command line. Every argument must be one of these, each at most once: a valued option written --name=value as ONE argument (so
   "--root <folder>" with a space is refused, never read as "no --root"), or a bare one. Anything else exits 2 before the site is loaded. */
const VALUED = ['students', 'rooms', 'mics', 'bpm', 'pairs', 'song', 'rate', 'fps', 'lag', 'seeds', 'coach', 'rule', 'json', 'takes-out', 'game', 'root', 'against', 'replay'];
const BARE = ['list', '--no-guitar', '--no-takes', '--takes-only'];
function badArg(msg){ console.error('closed-loop: ' + msg); process.exit(2); }
function checkArgs(args){
  const seen = new Set();
  for (const a of args){
    const m = /^--([a-z-]+)=([\s\S]*)$/.exec(a);
    const name = BARE.includes(a) ? a : m && VALUED.includes(m[1]) ? '--' + m[1] : null;
    if (!name){
      const k = /^--([a-z-]+)$/.exec(a);
      badArg(k && VALUED.includes(k[1]) ? `${a} needs its value in the same argument: ${a}=<value>` : `unknown argument "${a}" (the options are in the header of tools/mic-sim/closed-loop.mjs)`);
    }
    if (m && m[2] === '') badArg(`${a} has no value`);
    if (seen.has(name)) badArg(`${name} is given twice`);
    seen.add(name);
  }
}

async function main(){
  const args = process.argv.slice(2);
  checkArgs(args);
  const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
  /* A number option: every comma-separated value must be a plain number that `ok` accepts. */
  const nums = (k, d, ok, what) => String(opt(k, d)).split(',').map(v => { const x = Number(v); if (!/^-?\d+(\.\d+)?$/.test(v) || !ok(x)) badArg(`--${k} must be ${what}, not "${v}"`); return x; });
  const gameArg = opt('game', 'power');
  if (gameArg !== 'power' && gameArg !== 'changeup') badArg('--game must be power or changeup');
  const cu = gameArg === 'changeup';
  const siteRoot = opt('root', null) ? resolve(opt('root')) : ROOT, coachArg = opt('coach', null);
  const where = `site ${siteRoot}${coachArg ? ' (coach.js from ' + resolve(coachArg) + ')' : ''}`;
  if (args.includes('list')){
    console.log('students: ' + Object.keys(STUDENTS).join(', ') + '\nrooms:    ' + Object.keys(ROOMS).join(', ') + '\nmics:     ' + Object.keys(MICS).join(', '));
    if (cu){
      /* Change Up's wrong chords, every one a student can be given, by what ccResolvePend's two rules do with them (wrongClass). */
      const tr = cuTriples(makeSite(coachArg, 'base', null, false, siteRoot)), of = c => tr.filter(x => x.cls === c);
      const odd = tr.filter(x => (x.cls === 'none') === x.shared);
      console.log(`\nChange Up's wrong chords (${where}): ${tr.length} (loop, old, new, other chord) a student can be given by the ${new Set(tr.map(x => x.loop)).size} loops, ${new Set(tr.map(x => x.from + '>' + x.to + ':' + x.other)).size} different (old, new, other)`);
      console.log(`  no shared note ${tr.filter(x => !x.shared).length} · shares a note ${tr.filter(x => x.shared).length}: rule 2 should still catch ${of('rule2').length}, passes both rules (by design) ${of('design').length} · rule 1 fails on exactly the ones with no shared note: ${odd.length ? 'NO, ' + odd.length + ' differ' : 'yes'}`);
      console.log(`  rule 2 should catch: ${of('rule2').map(x => `${x.from}>${x.to} playing ${x.other} (${x.loop})`).join(', ')}`);
    }
    process.exit(0);
  }
  const rule = opt('rule', 'base');
  if (!RULES.includes(rule)) badArg('--rule must be one of ' + RULES.join(', '));
  if (cu && rule !== 'base') badArg('--rule: the candidate rules are Power Chord Switch\'s; --game=changeup runs only the site\'s own code');
  if (cu && (opt('song', null) || opt('takes-out', null))) badArg('--song and --takes-out are Power Chord Switch\'s (Change Up has no songs and never records)');
  const replayArg = opt('replay', null);
  if (replayArg != null && !/^[1-9]\d*$/.test(replayArg)) badArg(`--replay must be a game number (1, 2, ...), not "${replayArg}"`);
  if (replayArg != null && opt('against', null)) badArg('--replay plays one game and --against compares a whole run: give one of them (find the game with --against, then replay it without)');
  if (replayArg != null && opt('json', null)) badArg('--replay prints one game and writes no --json: give one of them');
  const bpms = nums('bpm', cu ? CU_BPMS : '30,60,90,120', x => x > 0, 'tempos above 0 (--bpm=60 or --bpm=60,90)');
  const fpss = nums('fps', '60', x => x > 0, 'frame rates above 0');
  const [seeds] = nums('seeds', '2', x => Number.isInteger(x) && x > 0, 'a whole number above 0');
  const [lagMs] = nums('lag', '70', () => true, 'a number of milliseconds');
  const against = opt('against', null);
  let wasRun = null;
  if (against){
    if (opt('json', null) && resolve(opt('json')) === resolve(against)) badArg('--against and --json name the same file: the run would be compared with itself');
    try { wasRun = JSON.parse(readFileSync(against, 'utf8')); } catch (e){ badArg(`--against: cannot read ${against} as a --json of this tool (${e.message})`); }
    /* A --json is { tool, games, realTakes } since 2026-11-12; before, the bare list of games (no real takes in it). */
    if (Array.isArray(wasRun)) wasRun = { games: wasRun, realTakes: null };
    if (!wasRun || !Array.isArray(wasRun.games)) badArg(`--against: ${against} is not a --json of this tool (no list of games)`);
  }
  /* The real takes: Power Chord Switch only (there are no Change Up takes), never with --replay. */
  const takesOnly = args.includes('--takes-only'), takesOn = !cu && !args.includes('--no-takes') && replayArg == null;
  if (takesOnly && args.includes('--no-takes')) badArg('--takes-only and --no-takes: give one of them');
  if (takesOnly && (cu || replayArg != null)) badArg('--takes-only replays the Power Chord Switch take summaries: not with --game=changeup or --replay');
  const at = { root: siteRoot, coach: coachArg ? resolve(coachArg) : null };
  /* The end of every run: the real takes, the --json, the comparison (real takes first). */
  const finish = async (games, code) => {
    const rt = takesOn ? await realTakes(at, rule) : null;
    if (opt('json', null)) writeFileSync(opt('json'), JSON.stringify({ tool: 'closed-loop', games, realTakes: rt }));
    if (against){ const r = compareAll(games, rt, wasRun, against); r.lines.forEach(l => console.log(l)); process.exit(r.code); }
    process.exit(code);
  };
  if (takesOnly){ console.log(`Power Chord Switch, the real takes only · ${where}`); await finish([], 0); }
  const site = makeSite(coachArg, rule, null, false, siteRoot);
  if (rule !== 'base') console.log('CANDIDATE RULE "' + rule + '" (tools/mic-sim/candidates.mjs), not the site\'s own coach.js');
  const students = opt('students', Object.keys(STUDENTS).join(',')).split(',');
  const rooms = opt('rooms', 'quiet,class').split(','), mics = opt('mics', 'chromebook').split(',');
  const rateArg = opt('rate', cu ? 'bar' : 'beat'), rateIdx = site.rates.indexOf(rateArg);
  if (rateIdx < 0){ console.error('--rate must be one of ' + site.rates.join(', ')); process.exit(2); }
  for (const [list, known, what] of [[students, STUDENTS, 'student'], [rooms, ROOMS, 'room'], [mics, MICS, 'mic']])
    for (const n of list) if (!known[n]){ console.error(`no ${what} "${n}" (node tools/mic-sim/closed-loop.mjs list)`); process.exit(2); }
  const song = opt('song', null), pairArg = opt('pairs', cu ? CU_LOOPS : 'F5-G5,B5-C5,G5-C5');
  const progs = cu ? site.cuProgs.filter(p => !p.random && (pairArg === 'all' || pairArg.split(',').includes(p.chords.join('-'))))
    : song ? site.progs.filter(p => p.song === song)
    : site.progs.filter(p => !p.random && !p.song && (pairArg === 'all' || pairArg.split(',').includes(p.chords.join('-'))));
  if (!progs.length){ console.error(cu ? 'no such loop (Change Up\'s loops: ' + site.cuProgs.filter(p => !p.random).map(p => p.chords.join('-')).join(' ') + ')' : 'no such pair or song'); process.exit(2); }
  const game = cu ? 'changeup' : 'power';
  if (cu){
    const lim = JSON.parse(site.run('__cl.data()'));
    const bad = bpms.filter(b => !(b >= lim.bpmMin && b <= lim.bpmMax));
    if (bad.length){ console.error(`--bpm: Change Up runs ${lim.bpmMin}-${lim.bpmMax} BPM (CC_BPM_MIN / CC_BPM_MAX), not ${bad.join(', ')}`); process.exit(2); }
  }
  const replay = replayArg == null ? 0 : +replayArg;
  /* Labels only: the ratios ccLoop's comment says each game uses. The game picks its own in ccLoop; nothing here sets them. */
  const ruleText = cu ? `${site.run('CHK_ONSET_RATIO')} / ${site.run('CHK_HF_RATIO')} (the shared CHK_* ratios, as ccLoop's comment says Change Up keeps)` : `${site.run('CC_POWER_ONSET_RATIO')} / ${site.run('CC_POWER_HF_RATIO')}`;
  if (args.includes('--no-guitar')){
    if (!replay){
      console.log(`${cu ? 'Change Up' : 'Power Chord Switch'} with NO guitar · ${progs.map(p => p.chords.join('-')).join(' ')} · ${bpms.join('/')} BPM · every ${rateArg} · ${fpss.join('/')} fps · ${seeds} games per cell · strum rule ${ruleText} · ${where}`);
      if (cu) console.log('Synthetic sound, not a classroom: the rooms are the guesses in student.mjs, the open chords are plucked-string models (student.mjs).');
      console.log('No chord is played in any of these games: every "right" is the game marking something nobody played.\n');
      console.log('case             | said RIGHT | said wrong chord | said no strum | changes | games with a right | right, by BPM (' + bpms.join(' / ') + ')');
    }
    let failed = 0, seedBase = 0, total = 0;
    const out = [];
    for (const [name, st, room, what] of NO_GUITAR){
      const t = { ok: 0, off: 0, miss: 0 }, byBpm = bpms.map(() => [0, 0]);
      let n = 0, gamesN = 0, gamesRight = 0;
      for (const fps of fpss) bpms.forEach((bpm, bi) => { for (const p of progs) for (let s = 1; s <= seeds; s++){
        const seed = ++seedBase;
        if (replay && seed !== replay) continue;
        const g = playGame(site, { student: st, room, mic: mics[0], fps, bpm, progIdx: p.i, rateIdx, lagMs, seed, game });
        if (g.changes.some(c => c.did !== 'silent')) throw new Error('closed-loop: a no-guitar case played a chord (' + name + ')');
        g.changes.forEach(c => { t[c.verdict]++; n++; byBpm[bi][1]++; if (c.verdict === 'ok') byBpm[bi][0]++; });
        gamesN++; if (g.changes.some(c => c.verdict === 'ok')) gamesRight++;
        out.push({ case: name, student: st, room, fps, bpm, pair: p.chords.join('-'), seed: seedBase, scoreBpm: g.scoreBpm, onsets: g.onsets, changes: g.changes, mic: mics[0], game, rate: rateArg, lagMs, model: STUDENT_MODEL });
        if (replay){ printReplay(g, out[out.length - 1], where); process.exit(0); }
      } });
      if (replay) continue;
      total += n;
      const pct = k => (String(t[k]).padStart(4) + ' ' + String(Math.round(100 * t[k] / n)).padStart(3) + '%');
      if (t.ok) failed++;
      console.log(`${name.padEnd(16)} | ${pct('ok')}  |    ${pct('off')}     |   ${pct('miss')}   | ${String(n).padStart(7)} | ${String(gamesRight).padStart(8)} of ${String(gamesN).padEnd(6)} | ${byBpm.map(x => Math.round(100 * x[0] / x[1]) + '%').join(' / ').padEnd(22)} ${t.ok ? 'FAIL' : 'pass'}  ${what}`);
    }
    if (replay){ console.error(`--replay=${replay}: this run has only ${seedBase} games`); process.exit(2); }
    console.log(`\n${failed} of ${NO_GUITAR.length} cases FAIL (something marked right with no chord played) · ${out.length} games, ${total} graded changes`);
    await finish(out, failed ? 1 : 0);
  }
  const games = students.length * rooms.length * mics.length * fpss.length * bpms.length * progs.length * seeds;
  if (!replay){
    console.log(`${cu ? 'Change Up' : 'Power Chord Switch'}, closed loop · ${progs.length} ${cu ? 'loops' : song ? 'switches of ' + song : 'pairs'} (${progs.map(p => p.chords.join('-')).join(' ')}) · ${bpms.join('/')} BPM · every ${rateArg} · ${fpss.join('/')} fps · ${seeds} games per cell · ${games} games · ${where}`);
    console.log(`strum rule ${ruleText} · mic chain x${site.chain.gain}, ${site.chain.hp}-${site.chain.lp} Hz · synthetic sound; only the ring time is fitted to classroom takes (student.mjs)\n`);
    if (cu) console.log('"other chord" = another chord of the loop, neither the old nor the new one (a two-chord loop: one of CC_RANDOM_POOL), split by what ccResolvePend\'s two rules do with its shape (one ideal reading per string): "no shared note" = no note of the new chord, so rule 1 ("some tone of the NEW chord") catches it; "rule 2" = it shares a note, but its notes only the OLD chord has outnumber those only the new one has, so rule 2 (the held-chord signature) should still catch it; "passes both" = the rules let it through BY DESIGN. The first two columns measure a miss, the third does not.\n"old chord again" = the chord the change leaves, strummed on the change (neverMoves: one chord behind); "lenient pair" = old and new are a pair the game cannot tell apart ON PURPOSE (E/Em, A/Am, C/Am, G/Em; ccResolvePend\'s comment).\n');
  }
  const pc = (a, b) => b ? String(Math.round(100 * a / b)).padStart(3) + '%' : '   -';
  if (!replay) console.log(cu ? 'student     room   mic        fps | right chord: said right / wrong / no strum | other chord caught: no shared note / rule 2 / passes both (by design) | old chord again caught: rest / lenient pair | no strum: said RIGHT (heard) |  changes'
    : `student     room   mic        fps | right chord: said right / wrong / no strum | fret high: caught | never moved: caught | no strum: said RIGHT (heard) |  changes`);
  const all = [], t0 = Date.now(), takesOut = opt('takes-out', null);
  if (takesOut) mkdirSync(takesOut, { recursive: true });
  let seedBase = 0;
  for (const st of students) for (const room of rooms) for (const micName of mics) for (const fps of fpss){
    const cell = [];
    for (const bpm of bpms) for (const p of progs) for (let s = 1; s <= seeds; s++){
      const seed = ++seedBase;
      if (replay && seed !== replay) continue;
      const g = playGame(site, { student: st, room, mic: micName, fps, bpm, progIdx: p.i, rateIdx, lagMs, seed, keepTake: !!takesOut, game });
      if (takesOut && g.take){ const b = join(takesOut, 'V' + String(seedBase).padStart(3, '0')); writeWav(b + '.wav', g.take.audio, SR); writeFileSync(b + '.json', JSON.stringify(g.take.json)); }
      g.changes.forEach(c => cell.push(c));
      all.push({ student: st, room, mic: micName, fps, bpm, pair: p.chords.join('-'), seed: seedBase, scoreBpm: g.scoreBpm, onsets: g.onsets, changes: g.changes, game, rate: rateArg, lagMs, model: STUDENT_MODEL });
      if (replay){ printReplay(g, all[all.length - 1], where); process.exit(0); }
    }
    if (replay) continue;
    const t = tally(cell);
    const head = `${st.padEnd(11)} ${room.padEnd(6)} ${micName.padEnd(10)} ${String(fps).padStart(3)} |        ${pc(t.right.ok, t.right.n)} (${pc(t.right.okTiming, t.right.n).trim()} on timing) / ${pc(t.right.off, t.right.n)} / ${pc(t.right.miss, t.right.n)}  |`;
    const tail = `${pc(t.silent.ok, t.silent.n)} (${pc(t.silent.ok + t.silent.off, t.silent.n).trim()})${t.silent.n ? ' of ' + t.silent.n : ''}`;
    if (cu){
      const w = cell.filter(c => c.did === 'wrong'), h = cell.filter(c => c.did === 'held');
      const caught = l => l.length ? `${pc(l.filter(c => c.verdict === 'off').length, l.length)} of ${String(l.length).padEnd(3)}` : '   -       ';
      console.log(`${head}      ${caught(w.filter(c => c.wrongClass === 'none'))}  /  ${caught(w.filter(c => c.wrongClass === 'rule2'))}  /  ${caught(w.filter(c => c.wrongClass === 'design'))}      |      ${caught(h.filter(c => !c.byDesign))} / ${caught(h.filter(c => c.byDesign))}      |     ${tail}`.padEnd(200) + `| ${String(cell.length).padStart(6)}`);
    }
    else console.log(`${head}       ${pc(t.wrong.off, t.wrong.n)}        |        ${pc(t.held.off, t.held.n)}         |     ${tail}`.padEnd(160) + `| ${String(cell.length).padStart(6)}`);
  }
  if (replay){ console.error(`--replay=${replay}: this run has only ${seedBase} games`); process.exit(2); }
  console.log(`\n${all.length} games, ${all.reduce((n, g) => n + g.changes.length, 0)} graded changes, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  await finish(all, 0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]){
  /* Any error, in the arguments, the site or the run, exits 2: 1 is kept for "a verdict moved" (--against) or "a no-guitar case failed". */
  const die = e => { console.error('closed-loop: stopped on an error, exit 2: ' + (e && e.stack ? e.stack : e)); process.exit(2); };
  process.on('uncaughtException', die);
  process.on('unhandledRejection', die);
  main().catch(die);
}
