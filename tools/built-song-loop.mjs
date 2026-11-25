#!/usr/bin/env node
/* built-song-loop.mjs — closed loop: the Song builder → builtSongCheck → the student's card, on GENERATED songs
   (2026-11-25; tools/LOOPS proposal #2, Jonathan chose it 2026-11-25).

     node tools/built-song-loop.mjs [options]

   THE QUESTION. A built song goes live for every student with no push. Whatever the builder's controls make, does
   the validator take it, and does the card a student gets start, play a section and stop?

   WHEN TO RUN IT. After any change to app/builtsongs.js (the format, builtSongCheck, the expansion), to the card
   player (app/cards.js, app/cards-sheet.js, app/cards-views.js, app/cards-loop.js) or to the builder's chart and beat
   code (teacher-sb-chart.js, teacher-sb-beat.js, teacher-sb-dsp.js, sbDraftFromDoc in teacher-sb-publish.js). About
   10-35 s for the default 60 songs (measured 2026-11-25 in a cloud container). Node only: no browser, no network.

   FLAGS
     --cases=N     how many songs (default 60); each has its own seed
     --seed=S      base seed (default 1); the same seed gives the same output byte for byte
     --case=I      only song I (with --verbose: its spec, every step and every check)
     --verbose     every song's line, not only the failures
     --root=DIR    a site folder to test instead of this checkout (a scratch copy with a planted fault or a fix)
   Exit 0 = every song held every invariant; 1 = a song failed one (KNOWN ones included: they are open bugs, the run
   stays red until they are fixed); 2 = bad arguments or the tool crashed. The last line counts the failing songs by
   finding id; "new" is a failure that no KNOWN tag describes. Each FAIL line prints its replay command.

   WHAT IS REAL (nothing is lifted out with a regex; nothing in the site's code is replaced except as listed under
   WHAT IS FAKE):
   - THE BUILDER: the whole console (every teacher-*.js part, app/songfiles.js, app/builtsongs.js; tools/sb-world.mjs).
     A song is made through the builder's own functions: the Beat step's BPM box (sbBeatChange → sbBeatFromBpm →
     sbAutoGrid on a made-up click track of the song's tempo) or a beat put through sbBeatSet; the chart READ from
     generated text (sbChartDoRead: bar lines, folds such as G7, Am7, G/B, Dsus4, N.C. rests, headers such as
     [Verse 2]); or an IMPORTED song (the same shape a Claude --built file has: bars in halves and in thirds) turned into
     a draft by sbDraftFromDoc; then the grid's own edits through sbChartAct / sbChartChange (pick a bar, split it,
     set a part's chord or a rest, + Bar, Remove bar, a new section and its name, lyric words, Full / Power / Both, a
     range); then sbSongOf and sbSongWhy. The beat controls through sbBeatAct (◀ 10 ms ▶, ◀ ½ beat ▶, ◀ 1 beat ▶)
     and the drag of bar 1 through the Beat step's own pointerdown / pointermove / pointerup listeners.
   - THE STUDENT'S PAGE: the whole app (tools/sim-app-page.mjs) with a real DOM tree (tools/sim-dom.mjs):
     builtSongCheck on the doc, builtSongExpand, the card through caCardBodyHtml in English and Spanish, in Chords and,
     with a sheet, Lyrics (caCardViewModes, caSetCardView); the player pcToggle / pcFromSection / pcSheetStartAt,
     pcStart, pcCountIn, pcGo, pcFrame, pcPaint, pcSheetStarted, pcSheetDraw, pcSheetStrip, pcStop, on a virtual clock.

   WHAT IS FAKE: the clock (both pages); the record (a made-up click track at 8 kHz, as the levelled copy the Beat step
   reads); the audio element (its currentTime runs with the virtual clock) and the AudioContext (clicks counted, no
   sound); the song file is marked loaded (sfUrls) for a made-up signed-in student; the chord sheet's pdf: pcSheetModel
   returns a made-up page model (the chord names' boxes, one line per four changes, or a looser sheet: E7 for E, a
   name written again bar by bar, chord boxes above the first [Verse] header), checked with the console's own sheet
   check (pcSheetAlign) before it is used, as the Lyrics sheet row does.

   WHAT IT VARIES (seeded): meter 4/4, 3/4 or 6/8; the typed BPM across the Beat step's range (30-300); bar 1's time;
   1 to 15 sections, 1-bar sections; songs whose first section starts on a rest, and rests at the end; bars split in
   halves (4/4, 3/4) or thirds (6/8, imported); 0 to 6 grid edits; the level and a range; pins (none, an end pin, two);
   0 to 4 beat moves; a lyric sheet or none; which ways into play (Play, a section chip, a tap on the first chord, a
   switch into Lyrics during the count-in); the language the card plays in.

   INVARIANTS (each failure is printed with the song's replay command):
     B1  every bar the chart grid leaves passes the validator's bar rule (bsBarParts) — whatever the grid accepts, the
         validator accepts
     B2  a BPM the Beat step took gives a song whose bpm the validator takes; a BPM the validator takes (30-260) is
         one the Beat step takes
     B3  the song the builder makes from a chart that fits its record passes sbSongWhy AND the student's builtSongCheck
     B4  after each beat move, every bar line sits within 10 ms (plus the drag's own jitter) of the grid moved evenly:
         bar 1's move counted in beats, each bar moved that many of its own beats
     C1  the card renders in EN and ES in every view it offers, with its section names
     C2  every way into play starts without throwing; the count-in clicks the meter's count (4, 3, or 6 in 6/8)
     C3  a "This bar" strip has as many numbered cells as the meter counts (1-4, 1-3, 1-6); a lit cell is a numbered one
     C4  the song plays (the count-in ends, the cursor paints) with no error in any frame or timer, and Stop leaves
         nothing playing, lit or ticking
   KNOWN (open findings of the 2026-11-25 sweep; a failure that matches one is counted under its id, and still fails):
     APP-CARDS-1     a lyric sheet whose lap starts on a rest throws in pcSheetStarted (TypeError reading 'y0')
     APP-CARDS-2     a 6/8 lyric sheet's "This bar" strip has 4 cells "1 + 2 +", not 1-6
     TEACHER-SB-4    ◀ 1 beat ▶ or a drag of bar 1 keeps the pins: the grid between is squeezed (B4)
     TEACHER-SB-5    a chord set in a bar written in thirds is written back as 0.3333333333333333 (B1)
     TEACHER-SB-7    the Beat step takes 261-300 BPM, the validator 30-260 (B2)
   "All green" (all five fixed) prints, seed 1:
     built-song-loop: ✓ 60 of 60 songs hold (seed 1) · failing by finding: APP-CARDS-1 ×0, APP-CARDS-2 ×0, TEACHER-SB-4 ×0, TEACHER-SB-5 ×0, TEACHER-SB-7 ×0; new 0
     built-song-loop: 60 songs, 0 failing: 0 known finding(s) seen (none), 0 new
   When a finding is fixed, its line stays in KNOWN (×0 is the proof); take it out once the fix is on main.

   WHAT IT DOES NOT COVER: sound (no audio is decoded or heard); the real pdf.js read of a sheet (sheet-align-test.mjs
   and song-builder-sim.mjs read made-up pdfs); the levelling and the Volume step (sb-dsp-test.mjs); the store and its
   timers (tools/sb-draft-loop.mjs); the merge after sign-in and the device copy (built-songs-sim.mjs); what is lit at
   which moment against the chart (playalong-loop.mjs --built, in Chrome); scrolling and layout (no layout here: every
   box but the sheet's column is 0 x 0); Loop this part, Build up speed and the speed switch; capo songs; the Tab view
   (a built song has none). A section played is at most about 4 s after its count-in. */
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { appPage } from './sim-app-page.mjs';
import { MDocument } from './sim-dom.mjs';
import { makeConsole, makeDb, VClock, vDateOf, rng, mix, turns } from './sb-world.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ARGV = process.argv.slice(2);
const opt = (k, d) => { const a = ARGV.find(x => x === '--' + k || x.startsWith('--' + k + '=')); if(!a) return d; return a.includes('=') ? a.slice(a.indexOf('=') + 1) : true; };
const argFail = m => { console.error('built-song-loop: ' + m + ' (see the header of tools/built-song-loop.mjs)'); process.exit(2); };
for(const a of ARGV){
  const m = /^--([a-z-]+)(=(.*))?$/.exec(a);
  if(!m) argFail('not an option: ' + JSON.stringify(a));
  if(m[1] === 'verbose'){ if(m[2]) argFail('--verbose takes no value'); continue; }
  if(!['cases', 'seed', 'case', 'root'].includes(m[1])) argFail('unknown option --' + m[1]);
  if(!m[2] || m[3] === '') argFail('--' + m[1] + ' needs a value (--' + m[1] + '=…)');
  if(m[1] !== 'root' && !/^\d+$/.test(m[3])) argFail(`--${m[1]} must be a whole number, not ${JSON.stringify(m[3])}`);
}
if(opt('root', null) && !existsSync(resolve(opt('root')))) argFail('--root: no such folder ' + JSON.stringify(opt('root')));
const ROOT = resolve(opt('root', join(HERE, '..')));
const VERBOSE = !!opt('verbose', false);
const SEED = Number(opt('seed', 1)), N = Number(opt('cases', 60));
const SINGLE = opt('case', null);
if(SINGLE != null && Number(SINGLE) >= N) argFail(`--case=${SINGLE} is not below --cases=${N}`);
process.on('uncaughtException', e => { console.error('built-song-loop: the tool crashed: ' + (e && e.stack || e)); process.exit(2); });

const KNOWN = {
  'APP-CARDS-1': 'a lyric sheet whose lap starts on a rest throws in pcSheetStarted',
  'APP-CARDS-2': 'a 6/8 lyric sheet\'s "This bar" strip does not count 1-6',
  'TEACHER-SB-4': '◀ 1 beat ▶ or a drag of bar 1 keeps the pins and squeezes the grid',
  'TEACHER-SB-5': 'a chord set in a bar in thirds is written as a long decimal the validator refuses',
  'TEACHER-SB-7': 'the Beat step takes a BPM over 260 that the validator refuses',
};
const METERS = { '4/4': { bpb: 4, q: 2, count: 4 }, '3/4': { bpb: 3, q: 2, count: 3 }, '6/8': { bpb: 2, q: 3, count: 6 } };
const SPLITS = { '4/4': ['4', '2+2', '3+1', '1+3'], '3/4': ['3', '2+1', '1+2'], '6/8': ['2', '1+1'] };   // teacher-sb-chart.js SB_SPLITS, as the buttons' data-sb-split
const FS = 8000;
const pick = (r, a) => a[Math.floor(r() * a.length)];
const int = (r, lo, hi) => lo + Math.floor(r() * (hi - lo + 1));
const q3 = x => Math.round(x * 1000) / 1000;

/* ═══ the song generator ═══ */
/* Each chord: its name (what the card says) and the ways a chart writes it (the reader folds them to the name). */
const CHORDS = {
  G: ['G', 'G7', 'G/B', 'Gmaj7'], C: ['C', 'Cadd9', 'C/G', 'Cmaj7'], D: ['D', 'Dsus4', 'D7', 'D/F#'], A: ['A', 'A7', 'Asus2'],
  E: ['E', 'E7'], F: ['F', 'Fmaj7'], Bb: ['Bb'], Am: ['Am', 'Am7'], Em: ['Em', 'Em7'], Dm: ['Dm', 'Dm7'], Bm: ['Bm', 'Bm7'],
  'F#m': ['F#m'], 'C#m': ['C#m'], E5: ['E5'], A5: ['A5'], D5: ['D5'], G5: ['G5'], C5: ['C5'],
};
const HEADS = [['intro', 'Intro'], ['verse', 'Verse'], ['prechorus', 'Pre-Chorus'], ['chorus', 'Chorus'], ['bridge', 'Bridge'], ['solo', 'Solo'], ['outro', 'Outro'], ['interlude', 'Interlude'], ['riff', 'Riff'], ['ending', 'Ending']];
const NAMES = HEADS.map(h => h[0]);
function genSpec(idx){
  const r = rng(mix(SEED, idx + 1));
  const meter = pick(r, Object.keys(METERS)), M = METERS[meter];
  const u = r();
  const bpm0 = u < 0.15 ? int(r, 30, 59) : u < 0.75 ? int(r, 60, 200) : int(r, 201, 300);
  const imported = r() < 0.25 || (meter === '6/8' && r() < 0.3);
  const bpm = imported ? Math.min(260, bpm0) : bpm0;           // an imported file passed the validator already
  const beatMode = imported ? 'import' : (bpm > 255 || r() < 0.35) ? 'typed' : 'set';
  const barSec = M.bpb * 60 / bpm;
  const anchor = q3(0.2 + r() * 2);
  const maxBars = Math.max(2, Math.min(40, Math.floor((34 - anchor) / barSec) - 5));
  const nBars = int(r, Math.min(2, maxBars), maxBars);
  const nSecs = Math.min(nBars, r() < 0.1 ? int(r, 8, 15) : int(r, 1, 5));
  const palette = [];
  const pool = Object.keys(CHORDS);
  const nCh = int(r, 2, 5);
  while(palette.length < nCh){ const c = pick(r, pool); if(!palette.includes(c)) palette.push(c); }
  const leadRest = r() < 0.35 ? Math.min(nBars - 1, int(r, 1, 2)) : 0, tailRest = r() < 0.15 && nBars - leadRest > 2 ? 1 : 0;
  /* bars: [{ parts: [{ name ('' rest), beats }] }]; imported bars may be uneven (halves or thirds) */
  const bars = [];
  for(let b = 0; b < nBars; b++){
    if(b < leadRest || b >= nBars - tailRest){ bars.push([{ name: '', beats: M.bpb }]); continue; }
    const v = r();
    if(v < 0.06) bars.push([{ name: '', beats: M.bpb }]);
    else if(v < 0.25){
      const a = pick(r, palette), c = pick(r, palette);
      if(imported){
        const s = meter === '6/8' ? pick(r, [[1 / 3, 5 / 3], [2 / 3, 4 / 3], [4 / 3, 2 / 3], [1, 1]]) : meter === '3/4' ? pick(r, [[1.5, 1.5], [2.5, 0.5], [1, 2]]) : pick(r, [[1.5, 2.5], [2.5, 1.5], [3.5, 0.5], [2, 2]]);
        bars.push([{ name: a, beats: s[0] }, { name: c, beats: s[1] }]);
      } else bars.push([{ name: a, beats: M.bpb / 2 }, { name: c, beats: M.bpb / 2 }]);   // read from "| a c |": split evenly
    } else bars.push([{ name: pick(r, palette), beats: M.bpb }]);
  }
  /* every chord of the song is somewhere (a palette chord no bar names is dropped) */
  const used = [...new Set(bars.flat().map(p => p.name).filter(Boolean))];
  if(!used.length && nBars){ const b = Math.min(nBars - 1, leadRest); bars[b] = [{ name: palette[0], beats: M.bpb }]; used.push(palette[0]); }
  /* sections: sizes summing to nBars */
  const cuts = new Set(); while(cuts.size < nSecs - 1) cuts.add(int(r, 1, nBars - 1));
  const edges = [0, ...[...cuts].sort((a, b) => a - b), nBars];
  const counts = {};
  const sections = edges.slice(0, -1).map((from, i) => {
    const h = pick(r, HEADS), unknown = !imported && r() < 0.08;
    counts[h[0]] = (counts[h[0]] || 0) + 1;
    return { name: h[0], head: unknown ? 'Hook' : h[1], from, bars: edges[i + 1] - from, lyric: r() < 0.3 };
  });
  const edits = [];
  const nEd = int(r, 0, 6);
  for(let k = 0; k < nEd; k++) edits.push({ kind: pick(r, ['split', 'chord', 'chord', 'rest', 'add', 'remove', 'secsplit', 'lyric', 'level', 'range']), g: r(), v: r(), w: r() });
  if(imported && meter === '6/8' && r() < 0.8) edits.unshift({ kind: 'thirds', g: r(), v: r(), w: r() });   // a chord set in a bar written in thirds
  const pins = beatMode === 'set' ? (r() < 0.45 ? 1 : r() < 0.4 ? 2 : 0) : 0;
  const drift = (r() - 0.5) * 0.02;
  const moves = [];
  const nMv = beatMode === 'import' ? 0 : int(r, 0, 4);
  for(let k = 0; k < nMv; k++) moves.push({ kind: pick(r, ['a-10', 'a+10', 'a-half', 'a+half', 'a-beat', 'a+beat', 'drag']), n: pick(r, [-2, -1, 1, 2]), jit: q3((r() - 0.5) * 0.03) });
  const sheet = r() < 0.55 ? pick(r, ['exact', 'exact', 'loose']) : null;
  const level = pick(r, ['full', 'full', 'power', 'both']);
  const entries = ['play', 'chip', 'tap', 'switch'].filter(() => r() < 0.6);
  if(!entries.length) entries.push('play');
  return { idx, meter, bpm, imported, beatMode, anchor, nBars, sections, bars, palette: used.length ? used : palette, leadRest, tailRest, edits, pins, drift, moves, sheet, level,
    lang: r() < 0.5 ? 'en' : 'es', entries, chipSi: r(), counts, words: int(r, 1, 999), seedR: mix(SEED, idx + 77) };
}
/* The chart as text, bar lines (the reader's own format): "| G | Em7 C | N.C. |", four bars a line. */
function chartText(spec, r){
  const out = [];
  const nth = {};
  spec.sections.forEach(s => {
    nth[s.name] = (nth[s.name] || 0) + 1;
    const head = s.head + (s.head !== 'Hook' && spec.counts[s.name] > 1 && nth[s.name] > 1 ? ' ' + nth[s.name] : '');
    out.push('[' + head + ']');
    const cells = spec.bars.slice(s.from, s.from + s.bars).map(parts => parts.map(p => p.name ? pick(r, CHORDS[p.name]) : 'N.C.').join(' '));
    for(let i = 0; i < cells.length; i += 4) out.push('| ' + cells.slice(i, i + 4).join(' | ') + ' |');
  });
  return out.join('\n');
}
/* A made-up click track at the song's tempo (one click a counted beat, three a beat in 6/8; louder on the 1), at 8 kHz. */
const TRACKS = new Map();
function clickTrack(bpm, meter, anchor, dur, drift){
  const key = [bpm, meter, anchor, dur, drift].join('|');
  if(TRACKS.has(key)) return TRACKS.get(key);
  const M = METERS[meter], sub = meter === '6/8' ? 3 : 1, beat = 60 / bpm * (1 + drift), n = Math.round(dur * FS), x = new Float32Array(n);
  let s = 12345;
  for(let k = 0; ; k++){
    const t = anchor + k * beat / sub;
    if(t >= dur) break;
    if(t < 0) continue;
    const i0 = Math.round(t * FS), amp = k % (M.bpb * sub) === 0 ? 0.9 : k % sub === 0 ? 0.55 : 0.3;
    for(let i = 0; i < 160 && i0 + i < n; i++){ s = (s * 1103515245 + 12345) >>> 0; x[i0 + i] += amp * ((s >>> 16) / 32768 - 1) * Math.exp(-i / 30); }
  }
  TRACKS.set(key, x);
  return x;
}
const hex64 = n => { let x = (n * 2654435761) >>> 0 || 1, o = ''; while(o.length < 64){ x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; o += x.toString(16).padStart(8, '0'); } return o.slice(0, 64); };

/* ═══ the two pages ═══ */
const C = makeConsole(ROOT, { db: makeDb().db, clock: new VClock(), seed: SEED });   // timers never move: no save timer fires
const crun = C.run;
const page = appPage(ROOT), ctx = page.ctx, prun = page.run;
const clock = new VClock();
const doc = new MDocument();
ctx.document = doc;
ctx.setTimeout = (f, ms, ...a) => clock.setTimeout(f, ms, ...a); ctx.clearTimeout = id => clock.clearTimeout(id);
ctx.setInterval = (f, ms) => clock.setTimeout(f, ms); ctx.clearInterval = id => clock.clearTimeout(id);
const FRAME_MS = 40;
ctx.requestAnimationFrame = f => clock.setTimeout(() => { FRAMES.n++; f(clock.now); }, FRAME_MS); ctx.cancelAnimationFrame = id => clock.clearTimeout(id);
ctx.performance = { now: () => clock.now }; ctx.Date = vDateOf(clock);
const FRAMES = { n: 0 };
const node = () => new Proxy({}, { get: (o, k) => k in o ? o[k] : (k === 'gain' || k === 'frequency' || k === 'playbackRate') ? (o[k] = new Proxy({ value: 0 }, { get: (p, kk) => kk in p ? p[kk] : () => {} })) : (k === 'then' ? undefined : () => node()) });
const AC = { oscillators: 0 };
ctx.AudioContext = class { constructor(){ this.state = 'running'; this.outputLatency = 0; this.baseLatency = 0; } get currentTime(){ return clock.now / 1000; } createOscillator(){ AC.oscillators++; return node(); } createGain(){ return node(); } createBufferSource(){ return node(); } resume(){ return Promise.resolve(); } get destination(){ return {}; } close(){ return Promise.resolve(); } };
ctx.webkitAudioContext = undefined;
const AUDIOS = [];
ctx.Audio = class {
  constructor(){ this.src = ''; this._t = 0; this._t0 = 0; this._w0 = 0; this.paused = true; this.readyState = 4; this.playbackRate = 1; this.seeking = false; this.ended = false; this.L = {}; AUDIOS.push(this); }
  get currentTime(){ return this.paused ? this._t : this._t0 + (clock.now - this._w0) / 1000 * this.playbackRate; }
  set currentTime(v){ this._t = v; this._t0 = v; this._w0 = clock.now; }
  play(){ if(this.paused){ this._t0 = this._t; this._w0 = clock.now; this.paused = false; } return Promise.resolve(); }
  pause(){ if(!this.paused){ this._t = this.currentTime; this.paused = true; } }
  addEventListener(t, f){ (this.L[t] = this.L[t] || []).push(f); } removeEventListener(){} load(){} removeAttribute(n){ if(n === 'src') this.src = ''; }
};
const pq = () => turns(6);
const padv = ms => clock.advance(ms, pq);
prun("currentUser = { uid: 'test-0' }");
const MODELS = new Map();
ctx.__model = url => MODELS.has(url) ? Promise.resolve(MODELS.get(url)) : Promise.reject(new Error('sim: no sheet model for ' + url));
prun('pcSheetModel = (url, cols) => __model(url)');
let REJ = [];
process.on('unhandledRejection', e => { REJ.push(e); });

/* ═══ one song ═══ */
async function runSong(idx){
  const spec = genSpec(idx), r = rng(spec.seedR);
  const fails = [], log = [];
  const fail = (tag, where, msg) => { fails.push({ tag, where, msg }); log.push(`  ✗ ${where}: ${msg}${tag ? ' [' + tag + ']' : ''}`); };
  const say = s => { if(VERBOSE) log.push('  ' + s); };
  const M = METERS[spec.meter];
  const id = 'sb-loop' + String(idx).padStart(4, '0') + 'x' + (SEED % 1000);
  say(`spec: ${spec.meter} ${spec.bpm} BPM (${spec.beatMode}), ${spec.nBars} bars in ${spec.sections.length} section(s), lead rest ${spec.leadRest}, ${spec.edits.length} edit(s), ${spec.moves.length} move(s), pins ${spec.pins}, sheet ${spec.sheet || 'none'}, level ${spec.level}, play ${spec.entries.join('/')} in ${spec.lang}`);
  if(!spec.nBars){ say('no bars fit this tempo for an import: skipped'); return { spec, fails, log, skipped: true }; }

  /* ── the builder ── */
  const barSec = M.bpb * 60 / spec.bpm;
  const dur = q3(Math.min(359, spec.anchor + (spec.nBars + 6) * barSec * 1.03 + 1.5));
  const sha = hex64(idx + 1), audio = { id: id + '-' + sha.slice(0, 8), bytes: 1900000, sha256: sha, durationSec: dur, centsOff: 0, gainDb: 1.5, sourceSha256: hex64(idx + 7) };
  C.box.__spec = spec;
  let d;
  crun('sbBusy = ""; sbNote = ""; sbCh = null;');
  if(spec.imported){
    const chords = {};
    spec.palette.forEach(n => { const sh = crun('sbShapeOf')(n); chords[n] = { full: spec.level === 'power' ? null : sh.full, power: spec.level === 'full' ? null : sh.power }; });
    const beatStr = b => { const x = Math.round(b * 3); return Math.abs(b * 3 - x) < 1e-9 && x % 3 && spec.meter === '6/8' ? x + '/3' : String(Math.round(b * 1000) / 1000); };
    const bars = spec.bars.map(parts => parts.length === 1 ? (parts[0].name || '-') : parts.map(p => (p.name || '-') + ':' + beatStr(p.beats)).join(' '));
    const n = {};
    const song = { meter: spec.meter, bpm: spec.bpm, anchor: spec.anchor, chords, bars,
      sections: spec.sections.map(s => { n[s.name] = (n[s.name] || 0) + 1; const o = { name: s.name, from: s.from + 1, bars: s.bars }; if(spec.counts[s.name] > 1) o.n = Math.min(9, n[s.name]); if(s.lyric) o.lyrics = [{ text: 'Test words ' + spec.words, bars: s.bars }]; return o; }),
      level: spec.level === 'both' ? { versions: 'both', start: 'power' } : { versions: spec.level } };
    const docIn = { v: 1, title: 'Test Song ' + idx, artist: 'Test Band', audio, song };
    const why = prun('builtSongCheck')(id, docIn);
    if(why.length){ fail(null, 'tool', 'the generated import does not pass builtSongCheck (a tool fault): ' + why[0]); return { spec, fails, log }; }
    d = crun('sbDraftFromDoc')(id, { doc: JSON.parse(JSON.stringify(docIn)), ver: 1 });
  } else {
    d = { v: 1, title: 'Test Song ' + idx, artist: 'Test Band', step: 3, source: { name: 'test.mp3', bytes: 400000, sha256: audio.sourceSha256, durationSec: dur, sampleRate: 32000, channels: 2, kbps: 192 },
      audio, volume: { before: -14, after: -12.5, samplePeak: -1.2, truePeak: -1.1, ceilingDb: -1, encodes: 1 }, pitch: { cents: 0, peaks: 10 }, beat: null, chart: null,
      level: { versions: 'full', start: null, range: null } };
  }
  C.box.__d = d;
  crun(`sbDrafts = sbDrafts || new Map(); sbDrafts.set(${JSON.stringify(id)}, __d); sbSel = ${JSON.stringify(id)}; sbMemFor(sbSel); sbStepOn = 3;`);
  if(!spec.imported){
    const mono = clickTrack(spec.bpm, spec.meter, spec.anchor, dur, spec.beatMode === 'set' ? spec.drift : 0);
    C.box.__mono = mono;
    crun(`sbMem.level = { bytes: null, sha256: __d.audio.sha256, chans: [__mono], fs: ${FS}, mono: __mono, durationSec: ${dur}, url: null, E: sbOnsetEnv(__mono, ${FS}) }; sbBtFor(sbSel).meter = ${JSON.stringify(spec.meter)};`);
    if(spec.beatMode === 'typed'){
      crun(`sbBeatChange({ target: { matches: q => q === '[data-sb-bpm]', value: ${JSON.stringify(String(spec.bpm))} } })`);
      const b = crun('sbDraft().beat'), note = crun('sbNote');
      say(`typed ${spec.bpm}: ${b ? `grid ${b.bpm} BPM, bar 1 at ${b.anchor}, pins ${JSON.stringify(b.pins)}` : 'refused: ' + note}`);
      if(!b && spec.bpm <= 260) fail(null, 'B2', `the Beat step refused a typed ${spec.bpm} BPM, which the validator takes (30-260): ${note}`);
      else if(!b) say(`the Beat step refused ${spec.bpm} BPM and said why: no song`);
      else if(!(b.bpm >= 30 && b.bpm <= 260)) fail('TEACHER-SB-7', 'B2', `the Beat step took ${spec.bpm} BPM (grid ${b.bpm}); the validator takes 30 to 260`);
    } else {
      const pins = [];
      const at = bar => q3(spec.anchor + (bar - 1) * barSec * (1 + spec.drift));
      if(spec.pins >= 1 && spec.nBars >= 4) pins.push({ bar: spec.nBars, t: at(spec.nBars) });
      if(spec.pins >= 2 && spec.nBars >= 6){ const m = Math.floor(spec.nBars / 2); pins.unshift({ bar: m, t: at(m) }); }
      C.box.__beat = { meter: spec.meter, bpm: spec.bpm, anchor: spec.anchor, pins };
      crun('sbBeatSet(sbDraft(), __beat, null)');
      say(`beat set: ${JSON.stringify(crun('sbDraft().beat.pins'))} at ${crun('sbDraft().beat.bpm')} BPM`);
    }
    if(!crun('sbDraft().beat')){ return { spec, fails, log }; }
    /* the chart, read from text */
    const text = chartText(spec, r);
    crun(`sbStepOn = 4; sbChartDoRead(sbDraft(), ${JSON.stringify(text)})`);
    await C.quiesce(); await turns(20);
    const ch = crun('sbDraft().chart');
    if(!ch || !ch.sections){ fail(null, 'chart', 'the reader read nothing from a generated chart (a tool fault?): ' + crun('sbNote') + ' | ' + text.slice(0, 120)); return { spec, fails, log }; }
    say(`read ${ch.sections.length} section(s), ${ch.sections.reduce((n, s) => n + s.bars.length, 0)} bars: ${ch.sections.map(s => (s.name || '?') + ':' + s.bars.join(' ')).join(' / ').slice(0, 200)}`);
    /* a section the reader could not name is named in the grid (the builder's "pick a name") */
    ch.sections.forEach((s, si) => {
      if(s.name) return;
      const g = crun('sbGridFirst')(crun('sbDraft().chart.sections'), si);
      crun(`sbChFor(sbSel).sel = ${g}; sbChartChange({ target: { matches: q => q === '[data-sb-secname]', value: ${JSON.stringify(pick(r, NAMES))}, dataset: {} } })`);
    });
  }
  /* the grid's edits */
  crun('sbStepOn = 4');
  const act = (a, ds) => crun(`sbChartAct(${JSON.stringify(a)}, { dataset: ${JSON.stringify(ds || {})} })`);
  const change = (sel, value, ds) => crun(`sbChartChange({ target: { matches: q => q === ${JSON.stringify(sel)}, value: ${JSON.stringify(value)}, dataset: ${JSON.stringify(ds || {})} } })`);
  const nBarsNow = () => crun('sbChartBars(sbDraft().chart.sections)');
  const seenBad = new Set();
  const barCheck = (where) => {
    const secs = crun('sbDraft().chart.sections'), names = {};
    crun('sbChartChords')(secs).forEach(n => { names[n] = 1; });
    secs.forEach((s, si) => s.bars.forEach((bar, bi) => {
      const p = crun('bsBarParts')(bar, crun('BS_METERS')[spec.meter], names);
      if(typeof p !== 'string' || seenBad.has(bar)) return;     // each bad bar once
      seenBad.add(bar);
      /* SB-5: the long decimal; and a later edit of that same bar, which reads the long decimal as NaN (its consequence) */
      const sb5 = /thirds of a beat/.test(p) && (/\d\.\d{5,}/.test(bar) || (/NaN/.test(bar) && fails.some(f => f.tag === 'TEACHER-SB-5')));
      fail(sb5 ? 'TEACHER-SB-5' : null, 'B1', `after ${where}, section ${si + 1} bar ${bi + 1} is ${JSON.stringify(bar)}: the validator says it ${p}`);
    }));
  };
  for(const e of spec.edits){
    const n = nBarsNow(); if(!n) break;
    const g = Math.min(n - 1, Math.floor(e.g * n));
    crun(`sbChFor(sbSel).sel = null; sbNote = ''`);
    if(e.kind === 'thirds'){
      const secs = crun('sbDraft().chart.sections');
      const flat = secs.flatMap(s => s.bars);
      const t = flat.findIndex(b => /\/3/.test(b));
      if(t < 0) continue;
      act('bar-pick', { sbG: String(t) }); act('bar-part', { sbPart: String(Math.floor(e.v * 2)) }); act('bar-chord', { sbChord: pick(r, spec.palette) });
    } else if(e.kind === 'split'){ act('bar-pick', { sbG: String(g) }); act('bar-split', { sbSplit: SPLITS[spec.meter][Math.floor(e.v * SPLITS[spec.meter].length)] }); }
    else if(e.kind === 'chord' || e.kind === 'rest'){ act('bar-pick', { sbG: String(g) }); act('bar-part', { sbPart: String(Math.floor(e.w * 2)) }); act('bar-chord', { sbChord: e.kind === 'rest' ? '' : spec.palette[Math.floor(e.v * spec.palette.length)] }); }
    else if(e.kind === 'add'){ act('bar-pick', { sbG: String(g) }); act('bar-add'); }
    else if(e.kind === 'remove'){ if(n > 1){ act('bar-pick', { sbG: String(g) }); act('bar-remove'); } }
    else if(e.kind === 'secsplit'){
      const secs = crun('sbDraft().chart.sections');
      if(secs.length < 15 && !secs.some((s, si) => crun('sbGridFirst')(secs, si) === g)){ act('bar-pick', { sbG: String(g) }); act('sec-split'); change('[data-sb-secname]', NAMES[Math.floor(e.v * NAMES.length)]); }
    }
    else if(e.kind === 'lyric'){ act('bar-pick', { sbG: String(g) }); change('[data-sb-lyric]', 'Test words ' + Math.floor(e.v * 1000)); }
    else if(e.kind === 'level'){ const v = ['full', 'power', 'both'][Math.floor(e.v * 3)]; act('level-versions', { sbV: v }); if(v === 'both') act('level-start', { sbV: e.w < 0.5 ? 'full' : 'power' }); }
    else if(e.kind === 'range'){
      const ns = crun('sbDraft().chart.sections.length');
      act('level-range', { sbV: 'range' });
      const from = Math.floor(e.v * ns), to = Math.min(ns - 1, from + Math.floor(e.w * ns));
      change('[data-sb-range]', String(from), { sbRange: 'from' }); change('[data-sb-range]', String(to), { sbRange: 'to' });
    }
    say(`edit ${e.kind} at bar ${g + 1}: ${crun('sbNote') || 'ok'}`);
    barCheck('edit ' + e.kind);
  }
  if(!spec.imported && spec.level !== 'full' && !spec.edits.some(e => e.kind === 'level')){ act('level-versions', { sbV: spec.level }); if(spec.level === 'both') act('level-start', { sbV: 'power' }); }
  if(!spec.edits.length) barCheck('the read');
  /* the sheet the song will carry (the Lyrics sheet row adds it to a published song; Edit and Publish keep it) */
  const sheetId = 'sheet-loop' + idx;
  crun(`sbDraft().sheet = ${spec.sheet ? JSON.stringify({ id: sheetId, bytes: 12345, sha256: hex64(idx + 99) }) : 'null'}`);
  /* the song, and both validators */
  const song = crun('sbSongOf(sbDraft())');
  const whyC = crun('sbSongWhy(sbDraft(), sbSel)');
  const sdoc = song ? JSON.parse(JSON.stringify({ v: 1, title: d.title, artist: d.artist, audio: crun('sbDraft().audio'), song })) : null;
  const whyS = sdoc ? prun('builtSongCheck')(id, sdoc) : ['no song'];
  const bpmOnly = w => w.length && w.every(x => /^bpm is not a number from 30 to 260/.test(x));
  const thirdsOnly = w => w.length && w.every(x => /thirds of a beat/.test(x));
  const restsOnly = w => w.length === 1 && /^chords has 0 chords/.test(w[0]);   // edits left a chart of rests only: the Level step says so, and there is no song to check
  if(restsOnly(whyS) || restsOnly(whyC)){ say('the edits left rests only: no song (the Level step says why)'); return { spec, fails, log }; }
  if(whyC.length || whyS.length){
    const w = whyS.length ? whyS : whyC;
    const tag = bpmOnly(w) && spec.beatMode === 'typed' && spec.bpm > 260 ? 'TEACHER-SB-7' : thirdsOnly(w) && fails.some(f => f.tag === 'TEACHER-SB-5') ? 'TEACHER-SB-5' : null;
    if(!(tag && fails.some(f => f.tag === tag))) fail(tag, 'B3', `the builder's song is refused: ${w.slice(0, 2).join(' | ')}${w.length > 2 ? ` (+${w.length - 2})` : ''}`);
  }
  /* the beat moves (after the song was taken: they are checked on their own) */
  if(!spec.imported) await beatMoves(spec, r, fail, say);
  if(whyS.length) return { spec, fails, log };

  /* ── the student's card ── */
  await cardStage(spec, id, sdoc, sheetId, r, fail, say);
  return { spec, fails, log };
}

const CTX = new Proxy(function(){}, { get: (o, k) => (k === 'width' || k === 'height' ? 10 : CTX), apply: () => CTX, set: () => true });   // a canvas 2D context that draws nothing
/* B4: each move, against the grid moved evenly by bar 1's move counted in beats. */
async function beatMoves(spec, r, fail, say){
  const bt = () => JSON.parse(JSON.stringify(crun('sbDraft().beat')));
  const times = (b, n) => { C.box.__b = b; return crun(`Array.from({ length: ${n} }, (_, i) => sbBarTime(__b, i + 1))`); };
  for(const mv of spec.moves){
    crun('sbBusy = ""');
    const b0 = bt(), nb = crun('sbChartBars(sbDraft().chart.sections)') + 1;
    const T0 = times(b0, nb + 1), P0 = (T0[1] - T0[0]) / METERS[spec.meter].bpb;
    let jit = 0, n = 0;
    if(mv.kind === 'drag'){
      n = mv.n; jit = mv.jit;
      const dt = n * P0 + jit, a1 = b0.anchor + dt;
      if(a1 < 0.05 || a1 > crun('sbDraft().audio.durationSec') - 1.05) continue;
      const v = { t0: Math.max(0, Math.min(b0.anchor, a1) - 1), t1: Math.max(b0.anchor, a1) + 1 };
      crun(`sbBtFor(sbSel).view = ${JSON.stringify(v)}`);
      const H = {}, W = 1000, px = t => (t - v.t0) / (v.t1 - v.t0) * W;
      const cv = { dataset: { h: '100' }, style: {}, width: 0, height: 0, clientWidth: W, parentNode: { clientWidth: W },
        closest: s => /canvas\[data-sb-wave="main"\]/.test(s) ? cv : null, getAttribute: () => '100', getContext: () => CTX,
        getBoundingClientRect: () => ({ left: 0, top: 0, width: W, height: 100 }), setPointerCapture(){}, addEventListener: (t, f) => { H[t] = f; }, removeEventListener(){} };
      const downs = C.world.listeners.pointerdown || [];
      downs.forEach(f => f({ target: cv, clientX: px(b0.anchor), pointerId: 1, preventDefault(){} }));
      if(!H.pointermove || !H.pointerup){ fail(null, 'B4', 'the drag of bar 1 did not start (no pointermove handler): the Beat step\'s drag changed shape'); continue; }
      H.pointermove({ clientX: px(a1) }); H.pointerup({});
    } else {
      crun(`sbBeatAct(${JSON.stringify(mv.kind)}, { dataset: {} })`);
    }
    const b1 = bt();
    if(b1.anchor === b0.anchor) { say(`move ${mv.kind}: refused (${crun('sbNote')})`); continue; }
    const T1 = times(b1, nb + 1), k = (T1[0] - T0[0]) / P0;
    const tol = 0.0105 + Math.abs(jit);
    /* ◀ 10 ms ▶ moves bar 1 alone, the pins kept (by design: TEACHER-SB.md): the bars up to the last pin are checked;
       past it the line through the pins is extended, so a 10 ms nudge of bar 1 tilts those bars a little more. */
    const lastPin = Math.max(1, ...(b0.pins || []).map(p => p.bar));
    const upto = /10$/.test(mv.kind) && (b0.pins || []).length ? Math.min(T0.length - 1, lastPin) : T0.length - 1;
    let worst = 0, wb = 0;
    for(let i = 0; i < upto; i++){
      const beatI = (T0[i + 1] - T0[i]) / METERS[spec.meter].bpb, want = T0[i] + k * beatI, off = Math.abs(T1[i] - want);
      if(off > worst){ worst = off; wb = i + 1; }
    }
    say(`move ${mv.kind}${mv.kind === 'drag' ? ' ' + n + ' beat(s) ' + jit + ' s' : ''}: bar 1 by ${k.toFixed(3)} beats; worst bar ${wb} off ${(worst * 1000).toFixed(1)} ms; pins ${JSON.stringify(b0.pins)} → ${JSON.stringify(b1.pins)}`);
    if(worst > tol){
      const whole = Math.abs(k) >= 0.5 && (b0.pins || []).length > 0 && (mv.kind === 'drag' || /beat$/.test(mv.kind));
      fail(whole ? 'TEACHER-SB-4' : null, 'B4', `${mv.kind}${mv.kind === 'drag' ? ' (' + n + ' beats)' : ''} moved bar 1 by ${k.toFixed(2)} beats but bar ${wb} sits ${(worst * 1000).toFixed(0)} ms from the evenly moved grid (allowed ${(tol * 1000).toFixed(1)})`);
      break;   // the next move starts from a bent grid: one finding a song
    }
  }
}

/* The card in the student's page: render, play each way in, stop. */
function cardHtml(id){ return prun(`caCardBodyHtml(CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(id)}))`); }
function mount(id){
  doc.body.innerHTML = `<div class="ca-card" open data-id="${id}">${cardHtml(id)}</div>`;
  sizeSheets();
  return doc.querySelector('.pc');
}
function sizeSheets(){ doc.querySelectorAll('.pc-sheet').forEach(e => { e._box = { w: 700, h: 900 }; }); }
function sheetModel(L, style, r){
  const { ch } = prun('pcSheetChanges')(L);
  const names = [];
  if(style === 'loose') names.push('G', 'C', 'Em');            // chord boxes above the first header (R2)
  const head = names.length;
  ch.forEach(c => {
    const fold = /m$/.test(c.name) ? c.name + '7' : /5$/.test(c.name) ? c.name : c.name + pick(r, ['', '7']);
    const k = style === 'loose' && c.bars > 1 && r() < 0.5 ? int(r, 2, Math.min(3, c.bars)) : 1;   // written again bar by bar (R3)
    for(let j = 0; j < k; j++) names.push(style === 'loose' ? fold : c.name);
  });
  const toks = names.map((name, i) => { const line = Math.floor(i / 4), x = 40 + (i % 4) * 90, y = 40 + line * 36; return { name, line, x0: x, x1: x + 8 * name.length, y0: y, y1: y + 10 }; });
  const marks = style === 'loose' ? [{ kind: 'head', at: head }] : [];
  return { toks, marks, crop: { x: 0, y: 0, w: 480, h: 60 + 36 * Math.ceil(names.length / 4) }, pages: [], split: false };
}
function guard(fn){ try { return { v: fn() }; } catch(e){ return { e }; } }
const errLine = e => (e && e.stack ? e.stack.split('\n').slice(0, 3).map(s => s.trim()).join(' | ') : String(e)).slice(0, 300);
const tagOfErr = e => e && /reading 'y0'/.test(e.message || '') && /pcSheetStarted/.test(e.stack || '') ? 'APP-CARDS-1' : null;
async function cardStage(spec, id, sdoc, sheetId, r, fail, say){
  prun('pcStop()'); clock.q.length = 0; REJ = [];
  ctx.__doc = sdoc;
  const ex = prun(`(() => { const ex = builtSongExpand(${JSON.stringify(id)}, __doc); CLASS_ACTIVITIES = CLASS_ACTIVITIES.filter(a => !/^sb-loop/.test(a.id)).concat([ex.activity]); SNIPPET_TRACKS[${JSON.stringify(id)}] = ex.track;
    const m = { [__doc.audio.id]: ex.audio }; if(ex.sheet) m[__doc.song.sheet.id] = ex.sheet; songFilesSetBuilt(m); sfUrls.set(__doc.audio.id, 'blob:sim-audio'); caCardViewModes = {}; return { views: caCardViewList(ex.activity) }; })()`);
  const views = ex.views.length ? ex.views : ['chords'];
  const raw = () => prun(`CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(id)})`);
  /* the sheet: a made-up model, checked as the console's Lyrics sheet row checks one (pcSheetAlign) */
  if(spec.sheet){
    prun(`caCardViewModes[${JSON.stringify(id)}] = 'lyrics'`);
    const L = prun(`pcLayout(caView(CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(id)})))`);
    const model = sheetModel(L, spec.sheet, r);
    const al = prun('pcSheetAlign')(L, model);
    if(!al.ok && /plays no chords/.test(al.why)){ say('sheet: the card plays rests only, so the Lyrics sheet row would refuse a sheet: Chords only'); views.splice(views.indexOf('lyrics'), 1); }
    else if(!al.ok){ fail(null, 'tool', `the made-up ${spec.sheet} sheet does not follow the card (a tool fault): ${al.why}`); return; }
    else say(`sheet: ${model.toks.length} names (${spec.sheet}), ${al.count} changes, ${al.cycled || 0} cycled, skipped ${al.skipped}`);
    MODELS.clear(); MODELS.set('private:' + sheetId, model);
  }
  /* C1: every view in both languages */
  for(const v of views){
    for(const lang of ['en', 'es']){
      prun(`setLang(${JSON.stringify(lang)}); caCardViewModes[${JSON.stringify(id)}] = ${JSON.stringify(v)}`);
      const g = guard(() => cardHtml(id));
      if(g.e){ fail(tagOfErr(g.e), 'C1', `${v} view in ${lang} throws: ${errLine(g.e)}`); continue; }
      const labels = sdoc.song.sections.slice(sdoc.song.range ? sdoc.song.range.from : 0, sdoc.song.range ? sdoc.song.range.to + 1 : undefined).map(s => prun('bsSectionLabel')(s, lang));
      if(!(g.v.length > 300) || !labels.every(l => g.v.includes(l.replace(/&/g, '&amp;')))) fail(null, 'C1', `${v} view in ${lang} is missing a section name (${labels.filter(l => !g.v.includes(l)).join(', ')}) or is empty (${g.v.length} chars)`);
    }
  }
  prun(`setLang(${JSON.stringify(spec.lang)})`);
  const count = METERS[spec.meter].count;
  const plays = [];
  for(const v of views) for(const e of spec.entries){
    if(e === 'tap' && v !== 'lyrics') continue;
    if(e === 'switch' && (v !== 'chords' || !views.includes('lyrics'))) continue;
    plays.push([v, e]);
  }
  if(!plays.length) plays.push([views[0], 'play']);
  for(const [v, e] of plays){
    const where = `${v} · ${e}`;
    prun('pcStop()'); clock.q.length = 0; REJ = []; clock.errors.length = 0;
    prun(`caCardViewModes[${JSON.stringify(id)}] = ${JSON.stringify(v)}`);
    const root = mount(id);
    await padv(0);                                   // the sheet's scan and draw
    if(v === 'lyrics'){
      const paper = root.querySelector('.pc-sheet-paper');
      if(!(paper && paper._sheet && paper._sheet.ok)){ fail(null, 'C2', `${where}: the sheet was not drawn (${paper && paper._sheet ? 'not ok' : 'no sheet'}${REJ.length ? '; ' + errLine(REJ[0]) : ''})`); continue; }
      /* C3: "This bar" counts the meter */
      const cells = root.querySelectorAll('.pc-strip-cell').map(c => c.querySelector('.pc-strip-n').textContent);
      const numbered = cells.filter(c => c !== '+');
      const want = Array.from({ length: count }, (_, i) => String(i + 1));
      if(numbered.join(' ') !== want.join(' ')) fail(spec.meter === '6/8' && cells.join(' ') === '1 + 2 +' ? 'APP-CARDS-2' : null, 'C3', `${where}: "This bar" reads "${cells.join(' ')}"; ${spec.meter} counts ${want.join(' ')}`);
    }
    AC.oscillators = 0;
    let g;
    const chips = root.querySelectorAll('.pc-sec[data-sec]');
    const si = chips.length ? Math.min(chips.length - 1, Math.floor(spec.chipSi * chips.length)) : 0;
    if(e === 'chip' && chips.length) g = guard(() => prun('pcFromSection')(chips[si], si));
    else if(e === 'tap'){
      const hit = root.querySelector('.pc-sheet-hit');
      const ti = hit ? Number((/pcSheetStartAt\(this,(\d+)\)/.exec(hit.getAttribute('onclick')) || [])[1]) : -1;
      g = hit ? guard(() => prun('pcSheetStartAt')(hit, ti)) : guard(() => prun('pcToggle')(root.querySelector('.pc-play')));
    }
    else g = guard(() => prun('pcToggle')(root.querySelector('.pc-play')));
    if(!g.e && e === 'switch'){
      await padv(60);
      const btn = root.querySelector('.ca-view-switch [data-view="lyrics"]');
      g = guard(() => prun('caSetCardView')(id, 'lyrics', btn));
      sizeSheets();
      await padv(0);
    }
    const startErr = g.e || REJ[0] || clock.errors[0];
    if(startErr){ fail(tagOfErr(startErr), 'C2', `${where}: starting throws: ${errLine(startErr)}`); continue; }
    const st = prun('pcState');
    if(!st || st.root !== root){ fail(null, 'C2', `${where}: nothing started (pcState ${st ? 'on another card' : 'null'})`); continue; }
    if(!(st.clicks && st.clicks.length === count)) fail(null, 'C2', `${where}: the count-in clicks ${st.clicks ? st.clicks.length : 0} times; ${spec.meter} counts ${count}`);
    /* the count-in, then up to 4 s of the section */
    const beatSec = st.win.bar / st.L.tr.beatsPerBar / (Number(root.dataset.rate) || 1);
    const S = st.L.sections[st.loopFrom];
    const secSec = S.bars * st.win.bar / (Number(root.dataset.rate) || 1);
    await padv(Math.ceil((0.1 + count / (st.L.tr.countSix ? 3 : 1) * beatSec) * 1000) + 30);
    let lit = [];
    const playMs = Math.min(4000, Math.max(200, secSec * 1000 - 100));
    for(let t = 0; t < playMs; t += 200){
      await padv(200);
      const now = root.querySelectorAll('.pc-strip-cell.now');
      lit = lit.concat(now.map(c => c.querySelector('.pc-strip-n').textContent));
      if(now.length > 1) fail(null, 'C3', `${where}: ${now.length} "This bar" cells lit at once`);
    }
    const runErr = REJ[0] || clock.errors[0];
    if(runErr){ fail(tagOfErr(runErr), 'C4', `${where}: an error while playing: ${errLine(runErr)}`); }
    const st2 = prun('pcState');
    if(!st2 || st2 !== st) fail(null, 'C4', `${where}: the card stopped by itself within ${Math.round(playMs)} ms of its count-in`);
    else {
      if(st2.counting) fail(null, 'C4', `${where}: still counting in after the count-in's length`);
      if(!(st2.si >= 0)) fail(null, 'C4', `${where}: the cursor never painted (si ${st2.si})`);
      if(st2.audio.paused) fail(null, 'C4', `${where}: the song is not playing after the count-in`);
    }
    if(lit.some(x => x === '+')) fail(null, 'C3', `${where}: a "+" cell of "This bar" was lit`);
    const sg = guard(() => prun('pcStop()'));
    if(sg.e){ fail(tagOfErr(sg.e), 'C4', `${where}: Stop throws: ${errLine(sg.e)}`); continue; }
    const f0 = FRAMES.n;
    await padv(600);
    const leftLit = root.querySelectorAll('.pc-strip-cell.now, .beat-now').length;
    if(prun('pcState') || AUDIOS.some(a => !a.paused && a.src) || FRAMES.n !== f0 || leftLit) fail(null, 'C4', `${where}: after Stop: ${prun('pcState') ? 'pcState still set; ' : ''}${AUDIOS.filter(a => !a.paused && a.src).length} audio playing, ${FRAMES.n - f0} frame(s) ran, ${leftLit} cell(s) still lit`);
    say(`${where}: ${count} count-in clicks, painted ${st.si >= 0 ? 'yes' : 'no'}, lit ${[...new Set(lit)].join(' ') || '-'}`);
  }
}

/* ═══ main ═══ */
async function main(){
  const t0 = Date.now();
  const idxs = SINGLE != null ? [Number(SINGLE)] : Array.from({ length: N }, (_, i) => i);
  const byTag = {}, newOnes = [];
  let failed = 0, skipped = 0, held = 0;
  const shown = {};
  for(const idx of idxs){
    const res = await runSong(idx);
    if(res.skipped){ skipped++; if(VERBOSE) console.log(`  song ${idx}: skipped\n` + res.log.join('\n')); continue; }
    if(!res.fails.length){ held++; if(VERBOSE) console.log(`✓ song ${idx} (${res.spec.meter}, ${res.spec.bpm} BPM, ${res.spec.beatMode})\n` + res.log.join('\n')); continue; }
    failed++;
    const tags = [...new Set(res.fails.map(f => f.tag || 'new'))];
    tags.forEach(t => { byTag[t] = (byTag[t] || 0) + 1; });
    const isNew = tags.includes('new');
    const quiet = !VERBOSE && !isNew && tags.every(t => (shown[t] = (shown[t] || 0) + 1) > 3);
    if(quiet) continue;
    console.log(`✗ FAIL song ${idx} (seed ${SEED}; ${res.spec.meter}, ${res.spec.bpm} BPM, ${res.spec.beatMode}${res.spec.sheet ? ', sheet' : ''}): ${tags.join(', ')}`);
    const lines = VERBOSE ? res.log : res.log.filter(l => /✗/.test(l)).slice(0, 4);
    for(const l of lines) console.log('  ' + l.trim());
    console.log(`    replay: node tools/built-song-loop.mjs --seed=${SEED} --case=${idx} --cases=${N} --verbose${opt('root', null) ? ' --root=' + ROOT : ''}`);
  }
  for(const t of Object.keys(shown)) if(shown[t] > 3 && !VERBOSE) console.log(`  … ${shown[t] - 3} more song(s) with ${t} not printed (--verbose prints all)`);
  const known = Object.keys(KNOWN).map(k => `${k} ×${byTag[k] || 0}`).join(', ');
  const kSum = Object.keys(KNOWN).reduce((n, k) => n + (byTag[k] ? 1 : 0), 0);
  const ran = idxs.length - skipped;
  console.log(`built-song-loop: ${failed ? '✗' : '✓'} ${held} of ${ran} songs hold (seed ${SEED}${skipped ? `, ${skipped} skipped: no bar fits` : ''}) · failing by finding: ${known}; new ${byTag.new || 0}`);
  console.log(`built-song-loop: ${ran} songs, ${failed} failing: ${kSum} known finding(s) seen (${Object.keys(KNOWN).filter(k => byTag[k]).map(k => k + ' ×' + byTag[k]).join(', ') || 'none'}), ${byTag.new || 0} new`);
  console.error(`built-song-loop: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return failed ? 1 : 0;
}
main().then(c => process.exit(c), e => { console.error('built-song-loop: the tool crashed: ' + (e && e.stack || e)); process.exit(2); });
