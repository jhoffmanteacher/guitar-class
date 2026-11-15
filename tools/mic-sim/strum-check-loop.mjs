/* The strum-pattern check's closed loop (2026-11-14; coach-strumcheck.js, ca-46's eight bars). A sibling of listen-loop.mjs in the same
   style: a VIRTUAL STUDENT plays the D.DU.UDU pattern through D5 D5 C5 C5 G5 G5 D5 D5 into the REAL site code (benchSite's vm: coachOpen
   with the button buildStrum renders, scStart, coachCountIn, scLoop with Strum Radar's srHearStrum, coachReadFrame, coachPitchReadings,
   coachDetectPitch, scFinish), keeps an answer key written before any verdict, and compares.

     node tools/mic-sim/strum-check-loop.mjs [--students=a,b] [--rooms=quiet,...] [--bpm=60,80,100] [--seeds=N] [--fps=60] [--lag=70]
                                             [--root=<site folder>] [--json=<file>] [--replay=N] [--break=key] [--table=main|extras|chords]
       list    the student kinds
     Every option is ONE --name=value argument; an unknown or repeated one exits 2. Exit 2 on any error, 3 from the watchdog.

   WHAT IS REAL: every line of the site from the mic to the verdict (the strum detector and grid Strum Radar uses, the slot judge, the
   chord readings, rules 'a', 'b' and 'c'; the run records every rule's verdict on every bar, whatever SC_CHORD_RULE shows the student).
   WHAT IS FAKE: the student (note-student.mjs NotePlayer's guitar, hands and rooms, played here as power chords: 0.12 a string, strings
   ringing 1.0 s, both fitted on Power Chord Switch strums; an up strum is the same strings high to low), the foot tap and the hand grazing
   the strings (levels are GUESSES, given in dB under a strum), the room, the laptop mic, evenly spaced frames, a mic already allowed.
   THE KEY (per slot, from the student's own sound list): a strum slot is PLAYED when the student made a strum sound (guitar, desk tap, muted
   scratch) within a quarter of an eighth of it, ABSENT when none within half an eighth, NEAR between (either verdict fair); a slot where
   the hand misses is QUIET when no strum sound within half an eighth, EXTRA when one within a quarter, NEAR between. A foot tap and a graze
   are not strums: the key never counts them. The chord on the 1: right / wrong (another chord) / held (the bar before's chord) / none (no
   guitar on the 1: a tap, a scratch, silence, a missed strum). The key is checked against the student's own guitar track (an attack where
   it says a strum, none where it says quiet); --break=key flips one entry and the run must stop (exit 2).
   THESE ARE A MODEL'S NUMBERS: there are no real strum-pattern takes (2026-11-14). Real takes outrank everything here. Not in checks.mjs. */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { benchSite, worldSource } from './listen-site.mjs';
import { ROOMS, MICS, SR, gauss } from './student.mjs';
import { NotePlayer, PATTERN, NOTE_MODEL } from './note-student.mjs';

const STRUM_AMP = 0.12;          // note-student.mjs STRUM.amp (student.mjs's strum level, fitted on Power Chord Switch)
const MB = 1;                    // the bar the one-slot mistakes are made in (D5, not a change)
const CHANGES = [2, 4, 6];       // bars that change chord: D5 -> C5, C5 -> G5, G5 -> D5
const A = { base: 'right' };
/* The students. pat: what the PATTERN verdict of the mistake bar should be (pass / fail / either / info); every other field is how they play. */
export const KINDS = {
  right:   { ...A, what: 'the pattern and the chords right, a pick, 25 ms spread' },
  thumb:   { ...A, base: 'thumb', what: 'right, with the thumb' },
  quiet:   { ...A, base: 'quiet', what: 'right, quietly (-10 dB)' },
  ...Object.fromEntries([0, 2, 3, 5, 6, 7].map(k => ['miss' + k, { ...A, missSlot: k, what: `bar ${MB + 1}: leaves out the strum on slot ${k}` }])),
  ...Object.fromEntries([1, 4].map(k => ['extra' + k, { ...A, extraSlot: k, what: `bar ${MB + 1}: an extra strum on slot ${k}, where the hand should miss` }])),
  ...Object.fromEntries([50, 100, 150, 200].flatMap(ms => [['late' + ms, { ...A, shiftAll: ms, what: `every strum ${ms} ms late (the whole round)` }], ['early' + ms, { ...A, shiftAll: -ms, what: `every strum ${ms} ms early (the whole round)` }]])),
  ...Object.fromEntries([50, 100, 150, 200].flatMap(ms => [['oneLate' + ms, { ...A, shiftOne: ms, what: `bar ${MB + 1}: the strum on "2 and" ${ms} ms late` }], ['oneEarly' + ms, { ...A, shiftOne: -ms, what: `bar ${MB + 1}: the strum on "2 and" ${ms} ms early` }]])),
  halfEarly2: { ...A, halfSlot: 2, what: `bar ${MB + 1}: the strum on "2" half an eighth early, half-way between the miss on "1 and" and "2"` },
  wrongC:  { ...A, wrongBar: 2, wrongChord: 'G5', what: 'bar 3 (D5 -> C5): plays G5 instead' },
  wrongG:  { ...A, wrongBar: 4, wrongChord: 'D5', what: 'bar 5 (C5 -> G5): plays D5 instead' },
  wrongD:  { ...A, wrongBar: 6, wrongChord: 'C5', what: 'bar 7 (G5 -> D5): plays C5 instead' },
  fretC:   { ...A, wrongBar: 2, fretUp: true, what: 'bar 3: C5 one fret high (C#5)' },
  fretG:   { ...A, wrongBar: 4, fretUp: true, what: 'bar 5: G5 one fret high (G#5)' },
  fretD:   { ...A, wrongBar: 6, fretUp: true, what: 'bar 7: D5 one fret high (D#5)' },
  heldC:   { ...A, heldBar: 2, what: 'bar 3: keeps D5 (the old chord) for the bar' },
  heldG:   { ...A, heldBar: 4, what: 'bar 5: keeps C5 (the old chord) for the bar' },
  heldD:   { ...A, heldBar: 6, what: 'bar 7: keeps G5 (the old chord) for the bar' },
  silent:  { ...A, silent: true, what: 'plays nothing (the room only)' },
  taps:    { ...A, silent: true, tap: true, what: 'taps the desk on every strum slot, no guitar' },
  muted:   { ...A, silent: true, mute: true, what: 'muted-string scratches on every strum slot, no chord' },
  foot12:  { ...A, foot: 0.25, what: 'right, and a foot tap on every beat at -12 dB under a strum (a guess)' },
  foot6:   { ...A, foot: 0.5, what: 'right, and a foot tap on every beat at -6 dB under a strum (a guess)' },
  graze20: { ...A, graze: 0.1, what: 'right, and the swinging hand grazes the strings on each miss at -20 dB (a guess)' },
  graze14: { ...A, graze: 0.2, what: 'right, and the swinging hand grazes the strings on each miss at -14 dB (a guess)' }
};
const PC = m => ((Math.round(m) % 12) + 12) % 12;

/* The student: a NotePlayer (its guitar for strums, its room, its desk tap and muted scratch), playing the eight bars. */
class StrumCheckPlayer {
  constructor(kind, o){
    this.k = KINDS[kind];
    if (!this.k) throw new Error('strum-check-loop: no student ' + kind);
    this.np = new NotePlayer(PATTERN, this.k.base, o);
    this.lagMs = o.lagMs;
  }
  get clean(){ return this.np.clean; }
  render(air, fromMs, toMs){ this.np.render(air, fromMs, toMs); }
  /* round: { listenStartMs, beatMs, bars: [names], chords: { name: [midis] }, pattern }. Returns the key. */
  play(round){
    const { k, np } = this, r = np.r, slot = round.beatMs / 2, P = np.k;
    const sounds = [], chordOf = [];
    const strums = String(round.pattern).split('').map(c => c === 'D' || c === 'U');
    let prevMidis = null;
    round.bars.forEach((name, b) => {
      let midis = round.chords[name], did = 'right', played = name;
      if (k.wrongBar === b){ did = 'wrong'; if (k.fretUp){ midis = midis.map(m => m + 1); played = name + '+1'; } else { midis = round.chords[k.wrongChord]; played = k.wrongChord; } }
      if (k.heldBar === b){ did = 'held'; midis = round.chords[round.bars[b - 1]]; played = round.bars[b - 1]; }
      chordOf.push({ want: name, prev: b ? round.bars[b - 1] : null, did: k.silent ? 'none' : did, played: k.silent ? null : played, midis: k.silent ? null : midis });
      for (let s = 0; s < 8; s++){
        const idx = b * 8 + s;
        let play = strums[s];
        if (b === MB && k.missSlot === s) play = false;
        if (b === MB && k.extraSlot === s) play = true;
        const shift = (k.shiftAll || 0) + (b === MB && s === 3 && k.shiftOne ? k.shiftOne : 0) + (b === MB && s === k.halfSlot ? -slot / 2 : 0);
        const at = round.listenStartMs + idx * slot + this.lagMs + gauss(r) * P.sigmaMs + P.lateMs + shift;
        if (play){
          if (k.silent){
            if (k.tap){ np.tap(at); sounds.push({ atMs: at, kind: 'tap' }); }
            else if (k.mute){ np.mute(at); sounds.push({ atMs: at, kind: 'mute' }); }
          } else {
            /* the fretting hand leaves the old chord just before a new one (student.mjs liftMs 40) */
            if (s === 0 && prevMidis && midis.join() !== prevMidis.join()) np.strummer.lift(at - 40);
            const up = String(round.pattern)[s] === 'U' && strums[s];
            np.strummer.strum(at, up ? midis.slice().reverse() : midis, STRUM_AMP * P.ampX, np.touch);
            sounds.push({ atMs: at, kind: 'guitar', midis });
            prevMidis = midis;
          }
        } else if (k.graze && !strums[s]){
          /* the hand swinging through a miss brushes the strings: a damped scratch, no pitch */
          np.roomPlayer.hits.push({ s: Math.round(at / 1000 * SR), amp: STRUM_AMP * k.graze, kind: 'mute', n: Math.round((np.touch.spreadMs + 40) / 1000 * SR), spreadN: Math.round(np.touch.spreadMs / 1000 * SR), scrape: np.touch.scrape });
        }
        if (k.foot && s % 2 === 0) np.roomPlayer.hits.push({ s: Math.round((round.listenStartMs + idx * slot + this.lagMs + gauss(r) * 15) / 1000 * SR), amp: STRUM_AMP * k.foot, kind: 'bang' });
      }
    });
    np.strummer.lift(round.listenStartMs + (round.bars.length * 4 + 0.5) * round.beatMs + this.lagMs);
    /* the key, from the sound list */
    const key = [];
    round.bars.forEach((name, b) => {
      for (let s = 0; s < 8; s++){
        const want = round.listenStartMs + (b * 8 + s) * slot + this.lagMs;
        let near = Infinity, kind = null;
        sounds.forEach(x => { const d = Math.abs(x.atMs - want); if (d < near){ near = d; kind = x.kind; } });
        const close = near <= slot / 4, far = near > slot / 2;
        key.push({ bar: b, slot: s, strum: strums[s], wantMs: want, nearMs: isFinite(near) ? Math.round(near) : null, kind: close ? kind : null,
          truth: strums[s] ? (close ? 'played' : far ? 'absent' : 'near') : (far ? 'quiet' : close ? 'extra' : 'near') });
      }
    });
    return { key, chords: chordOf, sounds };
  }
}

/* The fake world's own test: an attack in the student's guitar track where the key says a strum was played, and none where it says
   quiet (the attack channel: the RMS of the sample-to-sample difference, in 5 ms blocks). Desk taps and scratches are in the room track, not
   the guitar track, so only guitar strums are checked for an attack. */
function hfOf(x, a, b){ a = Math.max(1, Math.round(a)); b = Math.min(x.length, Math.round(b)); let s = 0; for (let i = a; i < b; i++){ const d = x[i] - x[i - 1]; s += d * d; } return b > a ? Math.sqrt(s / (b - a)) : 0; }
function blocks(x, a, b){ const W = Math.round(0.005 * SR), v = []; for (let s = Math.round(a); s + W <= Math.round(b); s += W) v.push(hfOf(x, s, s + W)); return v; }
function rmsOf(x, a, b){ a = Math.max(0, Math.round(a)); b = Math.min(x.length, Math.round(b)); let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return b > a ? Math.sqrt(s / (b - a)) : 0; }
function rmsBlocks(x, a, b){ const W = Math.round(0.005 * SR), v = []; for (let s = Math.round(a); s + W <= Math.round(b); s += W) v.push(rmsOf(x, s, s + W)); return v; }
function keyCheck(play, clean, slotMs){
  const S = ms => ms / 1000 * SR;
  for (const e of play.key){
    const g = play.sounds.find(x => x.kind === 'guitar' && Math.abs(x.atMs - e.wantMs) <= slotMs / 4);
    if (e.truth === 'played' || e.truth === 'extra'){
      if (!g) continue;
      /* the loudest 5 ms of the attack channel over the strum (its strings spread over up to 60 ms with the thumb), against the typical 5 ms
         just before it: 1.1 x, because a thumb's soft attack over strings still ringing from 240 ms before (125 BPM) rises only a little */
      const rise = f => { const at = Math.max(0, ...f(clean, S(g.atMs - 5), S(g.atMs + 90))), bv = f(clean, S(g.atMs - 150), S(g.atMs - 20)).sort((p, q) => p - q); return at > 1.1 * (bv.length ? bv[Math.floor(bv.length / 2)] : 0) + 1e-6; };
      /* or the level itself rises (a dark thumb strum right after the hand left the old chord at a change) */
      if (!(rise(blocks) || rise(rmsBlocks))) throw new Error(`fake-world check failed: bar ${e.bar + 1} slot ${e.slot} says a strum at ${Math.round(g.atMs)} ms, and the student's guitar has no attack there`);
    } else if (e.truth === 'quiet' || e.truth === 'absent'){
      const v = blocks(clean, S(e.wantMs - slotMs / 4), S(e.wantMs + slotMs / 4)), sorted = v.slice().sort((p, q) => p - q), med = sorted[Math.floor(sorted.length / 2)] || 0;
      if (Math.max(0, ...v) > 4 * med + 1e-5) throw new Error(`fake-world check failed: bar ${e.bar + 1} slot ${e.slot} says no strum near ${Math.round(e.wantMs)} ms, and the student's guitar has an attack there`);
    }
  }
}

const SC_VM = `globalThis.__sc = {
  /* The button the site renders for ca-46's listening step (buildStrum -> strumCheckBtnHtml), read back from its own HTML. */
  button(){
    const a = CLASS_ACTIVITIES.find(x => x.id === 'ca-46');
    const steps = a ? a.steps.filter(s => s.strum && s.strum.listen === true) : [];
    if (steps.length !== 1) return JSON.stringify({ err: 'ca-46 has ' + steps.length + ' strum steps with listen: true' });
    const html = buildStrum(steps[0].strum, { keyPrefix: 'bpm:ca:ca-46:bench:strum' });
    const m = /data-strumcheck="([^"]*)"/.exec(html);
    if (!m) return JSON.stringify({ err: 'buildStrum drew no strum-check button' });
    const un = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    return JSON.stringify({ data: un(m[1]), slider: /class="bpm-slider"[^>]*value="(\\d+)"/.test(html) });
  },
  start(o){
    __lb.world(o.lat);
    const slider = { value: String(o.bpm), dataset: {}, parentNode: null, disabled: false, setAttribute(){}, removeAttribute(){} };
    const group = { querySelector(sel){ return sel === '.bpm-slider' ? slider : null; }, insertAdjacentElement(){}, closest(){ return null; } };
    const btn = { dataset: { strumcheck: o.data, scWhere: 'bench' }, parentElement: group, closest(sel){ return sel === '.bpm-control-group' ? group : null; } };
    /* the error log hears only of a belt that had to null a value or a failed save: both are bugs, so the bench collects them */
    __sc.logged = []; SITE_ERRORS.report = (k, ev) => { __sc.logged.push(String(ev && ev.message || '')); };
    coachOpen(btn);
    if (!sc) return 'coachOpen opened no strum check';
    /* The card opens at SC_START_BPM (85); the student moves it with -5 / +5. The bench sets the take's tempo the same way, directly. */
    sc.bpm = o.bpm;
    __lb.p = scStart();
    return '';
  },
  phase(){ return sc ? sc.phase + '|' + sc.listenStart : 'none'; },
  /* The take this round would save, through the REAL micRecSaveNow into a STRICT stub Firestore: set() throws, as the SDK does, on any
     value fsProblems lists (a Blob and the server-timestamp sentinel are the SDK's own types and pass). A student account (not the dev
     bypass), a capture of 1 s. Resolves to { sets: [paths written], refused: [why], warned: [...] }. Everything replaced is put back. */
  saveProbe(meta){
    const Blob_ = function(){}, Sent_ = function(){};
    const keep = { cu: currentUser, ed: ensureDb, db, fb: globalThis.firebase, warn: console.warn, cnt: micTakesCount };
    const out = { sets: [], refused: [], warned: [] };
    const sdkOk = v => v instanceof Blob_ || v instanceof Sent_;
    const strict = (path, v) => {
      const bad = __sc.fsProblems(v, '', [], sdkOk);
      if (bad.length){ out.refused.push(path + ': ' + bad.join(', ')); throw new Error('Unsupported field value (' + bad[0] + ')'); }
      out.sets.push(path);
    };
    const docRef = path => ({ set: async v => strict(path, v), collection: c => ({ doc: id => docRef(path + '/' + c + '/' + id) }) });
    currentUser = { uid: 'bench-student-0001', displayName: 'Test 0' };
    db = { collection: c => ({ doc: id => docRef(c + '/' + id) }),
      runTransaction: async fn => fn({ get: async () => ({ exists: false, data: () => ({}) }), update: (r, v) => strict('count update', v), set: (r, v) => strict('count set', v) }) };
    ensureDb = async () => db;
    globalThis.firebase = { firestore: { Blob: { fromUint8Array: () => new Blob_() }, FieldValue: { serverTimestamp: () => new Sent_() } } };
    console.warn = (...a) => { out.warned.push(String(a[0]) + ' ' + String(a[1] && a[1].message || '')); };
    const rec = { mode: 'coach', n: 48000, srcRate: 48000, bufs: [new Float32Array(48000)], ctx0: 0, perf0: 0, firstPlay: 0.1, frames: 10, frameSum: 170, frameMax: 20, track: '', settings: null };
    return micRecSaveNow(rec, meta).then(() => out, e => { out.warned.push('threw ' + e.message); return out; }).finally(() => {
      currentUser = keep.cu; ensureDb = keep.ed; db = keep.db; globalThis.firebase = keep.fb; console.warn = keep.warn; micTakesCount = keep.cnt; });
  },
  /* What the real Firestore SDK refuses in a document (it throws "Unsupported field value"): undefined anywhere, a function, an array
     directly inside an array, an object that is not a plain one; NaN and Infinity are listed too (the take keeps null there). */
  fsProblems(v, p, out, sdkOk){
    if (sdkOk && sdkOk(v)) return out;
    if (v === undefined) out.push(p + ' undefined');
    else if (typeof v === 'function') out.push(p + ' function');
    else if (typeof v === 'number' && !isFinite(v)) out.push(p + ' ' + v);
    else if (Array.isArray(v)) v.forEach((x, i) => { if (Array.isArray(x)) out.push(p + '[' + i + '] array in array'); __sc.fsProblems(x, p + '[' + i + ']', out, sdkOk); });
    else if (v && typeof v === 'object'){ const pr = Object.getPrototypeOf(v); if (pr !== Object.prototype && pr !== null) out.push(p + ' not a plain object'); Object.keys(v).forEach(k => __sc.fsProblems(v[k], p ? p + '.' + k : k, out, sdkOk)); }
    return out;
  },
  out(){
    const s = sc, r1 = x => x == null ? null : Math.round(x * 10) / 10;
    const html = scBody() ? scBody().innerHTML : '';
    const out = { bpm: s.bpm, win: s.win, slotMs: s.slotMs, listenStart: s.listenStart, gridOffset: r1(s.gridOffset), barsDone: s.barsDone, saved: __lb.saved,
      slots: s.slots.map(x => ({ bar: x.bar, slot: x.slot, strum: x.strum, state: x.state, devMs: r1(x.devMs) })),
      caps: s.caps.map(c => ({ bar: c.bar, chord: c.chord, prev: c.prev, a: c.a, b: c.b, c: c.c, verdict: c.verdict, n: c.rm.length, nA: c.rt.filter(t => t <= COACH_EVENT_TAIL).length, rm: c.rm.map(x => Math.round(x * 10) / 10) })),
      events: s.events.map(e => ({ t: r1(e.t - s.listenStart), k: e.k, dev: r1(e.dev), kind: e.kind })),
      metaProblems: [...new Set(__sc.fsProblems(scRecMeta(), '', []).map(x => x.replace(/\\[\\d+\\]/g, '[]')))],
      logged: __sc.logged.slice(), lines: s.lines.slice(), report: html.replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim(), rule: SC_CHORD_RULE, winFrac: SC_WIN_FRAC,
      progressWrites: typeof games === 'object' && games ? Object.keys(games).length : -1 };
    coachClose();
    return JSON.stringify(out);
  }
};`;

function bad(msg){ console.error('strum-check-loop: ' + msg); process.exit(2); }
const VALUED = ['students', 'rooms', 'bpm', 'seeds', 'fps', 'lag', 'root', 'json', 'replay', 'break', 'table', 'mics', 'stop'];
function parseArgs(argv){
  const o = {}, seen = new Set();
  for (const a of argv){
    if (a === 'list'){ o.list = true; continue; }
    const m = /^--([a-z]+)=(.+)$/.exec(a);
    if (!m || !VALUED.includes(m[1])) bad(`unknown argument "${a}"`);
    if (seen.has(m[1])) bad('--' + m[1] + ' is given twice');
    seen.add(m[1]); o[m[1]] = m[2];
  }
  return o;
}
function seedOf(s){ let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 2147483646) + 1; }

async function oneTake(site, t, o, btn, chords){
  const player = new StrumCheckPlayer(t.kind, { room: t.room, lagMs: o.lag, seed: t.seed });
  let play = null;
  const src = worldSource({ player, mic: t.mic, lagMs: o.lag, onRound: r => { play = player.play(r); return play.key; } });
  site.reset();
  site.clock.now = 1000;
  src.start(site);
  site.run('globalThis.__scArg = ' + JSON.stringify({ data: btn.data, bpm: t.bpm, lat: 50 }));
  const err = site.run('__sc.start(__scArg)');
  if (err) throw new Error('strum-check-loop: ' + err);
  await site.run('__lb.p');
  const [phase, ls] = site.run('__sc.phase()').split('|');
  if (phase !== 'countin') throw new Error('strum-check-loop: the check did not start its count-in (' + phase + ')');
  const spec = JSON.parse(btn.data);
  src.round({ listenStartMs: Number(ls), beatMs: 60000 / t.bpm, bars: spec.bars, chords, pattern: spec.pattern });
  let guard = 0;
  for (;;){
    if (site.run('__sc.phase()').split('|')[0] === 'report') break;
    /* --stop=N: the student presses Stop once N bars are over (scFinish(false), as the Stop button does) */
    if (o.stop && Number(site.run('sc ? sc.barsDone : 0')) >= o.stop) site.run('scFinish(false)');
    site.clock.now += 1000 / o.fps; src.pump(); site.tick();
    if (++guard > 400000) throw new Error('strum-check-loop: the round never ended');
  }
  /* the take through the real micRecSaveNow into the strict stub (before out(), which closes the check) */
  site.run('globalThis.__scSave = __sc.saveProbe(scRecMeta())');
  const save = JSON.parse(JSON.stringify(await site.run('__scSave')));
  const res = JSON.parse(site.run('__sc.out()'));
  res.save = save;
  res.beeps = site.beeps.length;   // the count-in's 4 clicks, and with --metro=on one per beat of the round
  if (!play) throw new Error('strum-check-loop: the student was never told the round');
  if (res.slots.length !== play.key.length) throw new Error('fake-world check failed: the site judged ' + res.slots.length + ' slots, the key has ' + play.key.length);
  if (o.break){ const e = play.key.find(x => x.truth === 'played' && play.sounds.some(s => s.kind === 'guitar')); if (e) e.truth = 'quiet'; }
  keyCheck(o.stop ? Object.assign({}, play, { key: play.key.filter(e => e.bar < o.stop) }) : play, player.clean, res.slotMs);   // --stop: no sound was made after the Stop
  return { res, play };
}

/* ── tables ── */
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
function tally(takes){
  const c = { played: [0, 0], absent: [0, 0], quiet: [0, 0], extra: [0, 0], near: 0, bars: 0, barsOk: 0, mbOk: 0, mbN: 0, falseExtra: 0 };
  takes.forEach(({ res, play }) => {
    res.slots.forEach((x, i) => {
      const tr = play.key[i].truth;
      if (tr === 'near'){ c.near++; return; }
      const hit = x.state === 'ok' || x.state === 'extra';
      c[tr][hit ? 0 : 1]++;
      if (tr === 'quiet' && hit) c.falseExtra++;
    });
    for (let b = 0; b < res.barsDone; b++){
      const own = res.slots.slice(b * 8, b * 8 + 8), okBar = own.every(x => x.strum ? x.state === 'ok' : x.state !== 'extra');
      c.bars++; if (okBar) c.barsOk++;
      if (b === MB){ c.mbN++; if (okBar) c.mbOk++; }
    }
  });
  return c;
}
function chordTally(takes, rule, filter){
  const out = {};
  takes.forEach(({ res, play }) => res.caps.forEach((cp, b) => {
    if (filter && !filter(b)) return;
    const did = play.chords[b].did, slot0 = play.key[b * 8].truth;
    /* the rules are compared only where the site heard the strum on the 1: a bar whose 1 it missed reads "could not hear" under both */
    if (res.slots[b * 8].state !== 'ok'){ out['(1 not heard)'] = out['(1 not heard)'] || { ok: 0, wrong: 0, unheard: 0 }; out['(1 not heard)'][cp[rule] || 'unheard']++; return; }
    const tr = did === 'right' && slot0 !== 'played' ? 'right, 1 not played' : did;
    const v = cp[rule] || 'unheard';
    out[tr] = out[tr] || { ok: 0, wrong: 0, unheard: 0 };
    out[tr][v]++;
  }));
  return out;
}
function report(o, takes, log){
  log('THESE ARE A MODEL\'S NUMBERS (a synthetic guitar, rooms and mic; no real strum-pattern takes exist yet). Real takes outrank them.');
  log(`\nPer slot. strum slots: played = a strum within a quarter of an eighth, absent = none within half; where the hand misses: quiet / extra the same way. "near" slots are not counted. Window: ${takes[0] ? takes[0].res.winFrac : '?'} of an eighth.`);
  log('student      room    bpm | takes | played: HEARD / missed | absent: HEARD / missed | quiet: QUIET / EXTRA(false) | extra: CAUGHT / missed | bars ✓ (all) | mistake bar ✓');
  for (const kind of o.students) for (const room of o.rooms) for (const bpm of o.bpm){
    const sel = takes.filter(x => x.t.kind === kind && x.t.room === room && x.t.bpm === bpm);
    if (!sel.length) continue;
    const c = tally(sel), f = (p, n) => `${p} / ${n}`;
    log(`${kind.padEnd(12)} ${room.padEnd(7)} ${String(bpm).padStart(3)} | ${String(sel.length).padStart(5)} | ${f(c.played[0], c.played[1]).padEnd(22)} | ${f(c.absent[0], c.absent[1]).padEnd(22)} | ${f(c.quiet[1], c.quiet[0]).padEnd(27)} | ${f(c.extra[0], c.extra[1]).padEnd(21)} | ${(c.barsOk + ' of ' + c.bars).padEnd(12)} | ${c.mbOk} of ${c.mbN}`);
  }
  log('\nFALSE EXTRAS in the slots where the hand misses (the student made no strum there), per 100 bars:');
  for (const kind of o.students) for (const room of o.rooms){
    const row = o.bpm.map(bpm => { const sel = takes.filter(x => x.t.kind === kind && x.t.room === room && x.t.bpm === bpm); if (!sel.length) return null; const c = tally(sel); return `${bpm} BPM ${c.falseExtra} in ${c.bars} bars (${(100 * c.falseExtra / Math.max(1, c.bars)).toFixed(1)})`; }).filter(Boolean);
    if (row.length) log(`  ${kind.padEnd(12)} ${room.padEnd(7)} ${row.join(' · ')}`);
  }
  log('\nCHORD ON THE 1, by what was strummed (the key) and rule: ok / wrong / could not hear. "right, 1 not played" = the right chord but no strum within a quarter of an eighth of the 1.');
  for (const room of o.rooms) for (const bpm of o.bpm) for (const rule of ['a', 'b', 'c']){
    for (const [label, f] of [['every bar', null], ['D5 -> C5 (bar 3)', b => b === 2], ['C5 -> G5 (bar 5)', b => b === 4], ['G5 -> D5 (bar 7)', b => b === 6], ['not a change', b => !CHANGES.includes(b)]]){
      const sel = takes.filter(x => x.t.room === room && x.t.bpm === bpm);
      const tbl = chordTally(sel, rule, f);
      const keys = Object.keys(tbl).sort();
      if (!keys.length) continue;
      log(`  ${room.padEnd(7)} ${String(bpm).padStart(3)} rule ${rule} ${label.padEnd(17)} ` + keys.map(k => `${k}: ${tbl[k].ok} / ${tbl[k].wrong} / ${tbl[k].unheard}`).join(' · '));
    }
  }
  log('\nPer student kind (chord verdicts of the bars that kind changes, rule a | rule b | rule c: ok / wrong / could not hear):');
  for (const kind of o.students){
    const k = KINDS[kind], bars = k.wrongBar != null ? [k.wrongBar] : k.heldBar != null ? [k.heldBar] : null;
    if (!bars && !k.silent) continue;
    for (const room of o.rooms){
      const sel = takes.filter(x => x.t.kind === kind && x.t.room === room);
      if (!sel.length) continue;
      const f = bars ? b => bars.includes(b) : null;
      const s = rule => { const t = chordTally(sel, rule, f); return Object.entries(t).map(([kk, v]) => `${kk} ${v.ok}/${v.wrong}/${v.unheard}`).join(', '); };
      log(`  ${kind.padEnd(10)} ${room.padEnd(7)} a: ${s('a').padEnd(34)} | b: ${s('b').padEnd(34)} | c: ${s('c')}`);
    }
  }
}

const watchdog = { last: Date.now(), where: 'starting', start(){ setInterval(() => { if (Date.now() - this.last > 120000){ console.error(`strum-check-loop: HUNG at "${this.where}"`); process.exit(3); } }, 5000).unref(); }, tick(w){ this.last = Date.now(); this.where = w; } };

async function main(){
  const o = parseArgs(process.argv.slice(2));
  if (o.list){ for (const [k, v] of Object.entries(KINDS)) console.log(`  ${k.padEnd(12)} ${v.what}`); console.log('rooms: ' + Object.keys(ROOMS).join(', ')); process.exit(0); }
  o.students = (o.students || Object.keys(KINDS).join(',')).split(',');
  o.rooms = (o.rooms || 'quiet').split(',');
  o.mics = (o.mics || 'chromebook').split(',');
  o.bpm = (o.bpm || '60,80,100').split(',').map(Number);
  o.stop = o.stop == null ? 0 : Number(o.stop);
  if (!(Number.isInteger(o.stop) && o.stop >= 0 && o.stop < 8)) bad('--stop must be a whole number of bars from 1 to 7');
  o.seeds = Number(o.seeds || 1); o.fps = Number(o.fps || 60); o.lag = Number(o.lag == null ? 70 : o.lag);
  for (const s of o.students) if (!KINDS[s]) bad('no student ' + s);
  for (const r of o.rooms) if (!ROOMS[r]) bad('no room ' + r);
  for (const m of o.mics) if (!MICS[m]) bad('no mic ' + m);
  if (o.bpm.some(b => !(b >= 40 && b <= 125))) bad('--bpm: 40 to 125 (the step\'s slider)');
  if (!(Number.isInteger(o.seeds) && o.seeds > 0)) bad('--seeds must be a whole number above 0');
  if (o.break && o.break !== 'key') bad('--break must be key');
  o.root = o.root ? resolve(o.root) : null;
  watchdog.start();
  const site = benchSite(o.root ? { root: o.root } : null);
  site.run(SC_VM);
  const btn = JSON.parse(site.run('__sc.button()'));
  if (btn.err) bad(btn.err);
  const spec = JSON.parse(btn.data);
  const chords = {};
  /* the student's hands: each chord from its frets in the activity (standard tuning, written here), checked against the button's notes */
  const OPEN = { E: 40, A: 45, D: 50, G: 55, B: 59, e: 64 };
  const caSpec = JSON.parse(site.run("JSON.stringify(CLASS_ACTIVITIES.find(x => x.id === 'ca-46').steps.find(s => s.strum && s.strum.listen).strum.chords)"));
  for (const [n, c] of Object.entries(caSpec)){
    chords[n] = c.frets.map(([s, f]) => OPEN[s] + f);
    if (chords[n].join() !== spec.chords[n].midi.join()) throw new Error(`fake-world check failed: ${n} from its frets is ${chords[n]}, the button says ${spec.chords[n].midi}`);
  }
  console.log(`strum-check-loop · site ${o.root || 'this checkout'} · student model ${NOTE_MODEL} · pattern ${spec.pattern} · bars ${spec.bars.join(' ')} · chord rule shown to students: ${site.run('SC_CHORD_RULE')} · window ${site.run('SC_WIN_FRAC')} of an eighth`);
  const plan = [];
  for (const kind of o.students) for (const room of o.rooms) for (const mic of o.mics) for (const bpm of o.bpm) for (let s = 1; s <= o.seeds; s++)
    plan.push({ kind, room, mic, bpm, s, seed: seedOf(['sc', kind, room, mic, bpm, s].join('|')) });
  plan.forEach((t, i) => { t.n = i + 1; });
  const only = o.replay ? Number(o.replay) : 0;
  if (!only) console.log(`${plan.length} takes · ${o.fps} fps · the student is ${o.lag} ms behind the click, the site's mic delay setting 50 ms`);
  const t0 = Date.now(), done = [];
  for (const t of plan){
    if (only && t.n !== only) continue;
    watchdog.tick(`take ${t.n}: ${t.kind} ${t.room} ${t.bpm}`);
    const r = await oneTake(site, t, o, btn, chords);
    if (r.res.progressWrites !== 0) throw new Error('the check wrote to games (the progress doc): ' + r.res.progressWrites + ' keys');
    if (r.res.saved) throw new Error('the check called saveGames ' + r.res.saved + ' times');
    /* The take's document as scRecMeta builds it must be one the real Firestore SDK accepts (a refused write is lost silently). */
    if (r.res.metaProblems.length) throw new Error('the take this round would save is not one Firestore accepts: ' + r.res.metaProblems.join(', '));
    if (r.res.logged.length) throw new Error('the round sent the error log: ' + r.res.logged.join(' | '));
    if (r.res.save.refused.length || r.res.save.warned.length || !r.res.save.sets.includes('micTakes/bench-student-0001-coach')) throw new Error('the take did not save through the real micRecSaveNow into the strict stub: ' + JSON.stringify(r.res.save));
    if (only){
      console.log(`take ${t.n}: ${t.kind} (${KINDS[t.kind].what}) · ${t.room} · ${t.bpm} BPM · grid offset at the end ${r.res.gridOffset} ms`);
      console.log('  report: ' + r.res.report);
      r.res.lines.forEach(l => console.log('  ' + l));
      r.res.slots.forEach((x, i) => { const k = r.play.key[i]; console.log(`  bar ${x.bar + 1} slot ${x.slot} ${x.strum ? 'strum' : 'miss '}  key ${k.truth.padEnd(7)} (${k.kind || '-'}, nearest ${k.nearMs} ms)  ->  ${x.state}${x.devMs == null ? '' : ' ' + x.devMs + ' ms'}`); });
      r.res.caps.forEach(c => console.log(`  bar ${c.bar + 1} chord ${c.chord} (played ${r.play.chords[c.bar].played}) a=${c.a} b=${c.b} readings ${c.n} (${c.nA} in 340 ms): ${c.rm.join(' ')}`));
      console.log('  sounds heard (ms from beat 1, eighth, dev, kind): ' + r.res.events.map(e => `${e.t}/${e.k}/${e.dev}/${e.kind}`).join(' '));
      process.exit(0);
    }
    done.push({ t, res: r.res, play: { key: r.play.key, chords: r.play.chords.map(c => ({ want: c.want, prev: c.prev, did: c.did, played: c.played })) } });
  }
  report(o, done, l => console.log(l));
  console.log(`\n${done.length} takes, ${done.reduce((n, d) => n + d.res.barsDone, 0)} bars, every key checked against the student's own guitar; the check wrote nothing to progress in any take · ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (o.json) writeFileSync(o.json, JSON.stringify({ tool: 'strum-check-loop', model: NOTE_MODEL, fps: o.fps, lag: o.lag, takes: done.map(d => ({ ...d.t, res: d.res, play: d.play })) }));
  process.exit(0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]){
  const die = e => { console.error('strum-check-loop: stopped on an error, exit 2: ' + (e && e.stack ? e.stack : e)); process.exit(2); };
  process.on('uncaughtException', die);
  process.on('unhandledRejection', die);
  main().catch(die);
}
