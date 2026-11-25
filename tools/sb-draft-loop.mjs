#!/usr/bin/env node
/* sb-draft-loop.mjs — closed loop: the Song builder's edits against its own re-read, save timers, encoder and store
   (2026-11-25; tools/LOOPS proposal #3, Jonathan chose it 2026-11-25).

     node tools/sb-draft-loop.mjs [options]

   THE QUESTION. Jonathan edits a song in the Song builder while time passes: a 1.2 s "save once things settle" timer
   after each beat or chart edit, its 600 ms retry, the 15 s re-read that the next paint starts, an encoder that takes
   seconds, a store that answers late. Is every edit he made still in the store once the timers have run? Is the
   builder ever left busy with nothing running, or a timer left retrying for ever? Can Publish send an old recording?
   Is a published song's file ever marked 'uploading' when the stored file already matches?

   WHEN TO RUN IT. After any change to teacher-sb-core.js (teacherSbLoad, renderTeacherSongBuilder, sbWriteDraft,
   sbPickFile, sbSaveUpload, sbRunLevel, sbEncode, teacherSbLeave), the save timers of teacher-sb-beat.js (sbBeatSet)
   and teacher-sb-chart.js (sbChartSet, sbChFor), teacher-sb-pdf.js's pick, teacher-sb-publish.js (sbPublish,
   sbEditAt, sbEnsureDraft) or the Song files writer (teacherSfPutFile). About 10 s of CPU for the default 30 schedules
   (30-50 s of wall time measured 2026-11-25 on a busy 2-core cloud container).
   Node only: no browser, no network.

   FLAGS
     --cases=N     how many schedules (default 30); each has its own seed
     --seed=S      base seed (default 1); the same seed gives the same output byte for byte
     --case=I      only schedule I (with --verbose: every action, the time, what it changed, every check)
     --verbose     every schedule's line, not only the failures
     --root=DIR    a site folder to test instead of this checkout (a scratch copy with a planted fault or a fix)
   Exit 0 = every schedule held every invariant; 1 = one did not (KNOWN findings included: open bugs keep it red);
   2 = bad arguments or the tool crashed. The last line counts the failing schedules by finding id; "new" is a
   failure no KNOWN tag describes. Each FAIL line prints its replay command.

   WHAT IS REAL. The whole console (tools/sb-world.mjs: every teacher-*.js part, app/songfiles.js, app/builtsongs.js),
   driven through its own entry points: renderTeacherSongBuilder / teacherSbPaint (the paint that starts the 15 s
   re-read), sbOpen, sbGoStep, sbEditAt (Edit of a published song), sbInput (a typed title, the step-1 chart box),
   sbPdfAdd (a chords pdf, with a made-up pdf.js), sbPickFile, sbSaveUpload (Next), sbRunLevel (Level it / Level it
   again), sbBeatChange (a typed BPM), sbBeatAct (◀ 10 ms ▶, ◀ ½ beat ▶), sbChartAct (pick a bar, + Bar, a chord),
   sbPublish, and leaving the view as setTeacherView does it (teacherSbLeave, then teacherView changes) and coming
   back. The encoder is the REAL sbEncode, on a made-up Worker that answers on the virtual clock.
   WHAT IS FAKE (tools/sb-world.mjs): the clock (timers and Date), the store's latency (20-400 ms a read or write,
   seeded), the made-up mp3s A, B (same length as A: the beat is kept) and C, the decoder, the loudness measuring
   (sbLevel: it awaits the real encode, then returns the made-up levelled bytes of that record). teacherSbLoad is
   WATCHED (a wrapper records when each re-read lands; it changes nothing).

   THE STORE AT THE START: a published song (sb-pubsong0001: its draft at step 7, its levelled copy of mp3 A, its doc on
   builtSongs and the list), a draft at the Chart step with a levelled copy of C (sb-draftone001), and a draft at step
   1 with chart text and no recording (sb-drafttwo002).

   WHAT IT VARIES (seeded): 10 to 22 actions among: open a song, Edit the published song at a step, go to a step, type
   a BPM, nudge the beat, + Bar or a chord in the grid, type a title, type chart text or pick a chords pdf at step 1,
   pick an mp3 (the same one, one of the same length, one of another length), Next, Level it, Publish, leave the view
   (also in the middle of an encode) and come back, a repaint, and time passing between them (0 ms to 20 s).

   INVARIANTS
     D1  no edit is lost: once the timers have run, the store holds the last beat and the last chart grid he made on
         each draft (whatever he did next: a repaint, another song, leaving the view); and the last title, step-1 chart
         text and picked mp3 while he stayed on that song, after a final Next (on a draft Next cannot save yet, "Pick
         the mp3 first.", they must still be on screen)
     D2  no timer retries for ever: 20 s after the last action no timer is waiting
     D3  the builder is never left busy with nothing running: 20 s after the last action sbBusy is '' (an encode left
         by leaving the view must end)
     D4  Publish never sends a recording other than the one he picked last for that song
     D5  a published song's audio head is never written 'uploading' over a stored file that already matches it
     D6  every write passes the rules (the stub store's rules check), and no timer or promise throws
     D7  (two tabs) a recording another tab levelled the song to is never replaced by the one it replaced, in the draft
         or on the Songs page, the title this tab typed is stored, and no levelled copy is left that nothing names
   TWO TABS (review round 1 of the sweep, 2026-11-25, R1-1): after the 30 schedules, one scripted schedule with two
   consoles on the one store and clock, its timings seeded: X3, tab A types a title on the published song, tab B picks
   another mp3 for it and levels it (copy Y over A's copy X), then A (with or without its 15 s re-read due, a repaint or
   not) presses Next, again if the line says the song changed in another tab, and Publish. Tag REVIEW-SB-R1-1.
   KNOWN (open findings of the 2026-11-25 sweep; counted under their id, and still failing):
     TEACHER-SB-1  the 15 s re-read (or a switch / leave within 1.2 s) drops edits waiting to be saved; the beat's save
                   timer then retries every 600 ms (D1, D2, D4)
     TEACHER-SB-2  "Level it again" on a published song writes its own audio head 'uploading' (D5)
     TEACHER-SB-3  leaving during the encode leaves sbBusy 'level' for good (D3; the edits it then refuses, D1/D2)
     REVIEW-SB-R1-1  two tabs on one song: a recording the other tab levelled is written back or published over (D7)
   NEW (found by this loop 2026-11-25, not yet a finding id, so it counts as "new"): a beat nudge made while a save is
   in flight (sbBeatAct has no sbBusy check) is lost when that save lands, because sbWriteDraft puts the copy it wrote
   in memory; D1 says "while a save was in flight". Seed 1 does not reach it; --seed=6 does (schedule 20 there).
   Closed on fix/r1-sb-2026-11-25 (2e5e32d: the copy in memory is kept when it changed during the write).
   "All green" (the three fixed) prints, seed 1:
     sb-draft-loop: ✓ 30 of 30 schedules hold (seed 1) · failing by finding: TEACHER-SB-1 ×0, TEACHER-SB-2 ×0, TEACHER-SB-3 ×0; new 0
   When a finding is fixed its line stays in KNOWN (×0 is the proof); take it out once the fix is on main.

   WHAT IT DOES NOT COVER: two consoles at once beyond the scripted X3; a write that fails or is refused (every write lands); the Lyrics sheet
   row, Unpublish, Delete and Import (song-builder-sim.mjs's scripted cases); the meter buttons, taps and pins; the
   Preview card (no student app here); a reload of the console between actions; the levelling's measurements
   (sb-dsp-test.mjs). The made-up records are 10.5-12 s long. */
import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { makeConsole, makeDb, putCopy, VClock, rng, mix, sha, fileOf, SRC, SRC_SEC, LEVELLED, TS } from './sb-world.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const ARGV = process.argv.slice(2);
const opt = (k, d) => { const a = ARGV.find(x => x === '--' + k || x.startsWith('--' + k + '=')); if(!a) return d; return a.includes('=') ? a.slice(a.indexOf('=') + 1) : true; };
const argFail = m => { console.error('sb-draft-loop: ' + m + ' (see the header of tools/sb-draft-loop.mjs)'); process.exit(2); };
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
const SEED = Number(opt('seed', 1)), N = Number(opt('cases', 30));
const SINGLE = opt('case', null);
if(SINGLE != null && Number(SINGLE) >= N) argFail(`--case=${SINGLE} is not below --cases=${N}`);
process.on('uncaughtException', e => { console.error('sb-draft-loop: the tool crashed: ' + (e && e.stack || e)); process.exit(2); });
let REJ = [];
process.on('unhandledRejection', e => { REJ.push(e); });

const KNOWN = {
  'TEACHER-SB-1': 'the 15 s re-read (or a switch or leave within 1.2 s) drops edits waiting to be saved',
  'TEACHER-SB-2': '"Level it again" on a published song writes its audio head \'uploading\'',
  'TEACHER-SB-3': 'leaving during the encode leaves the builder busy for good',
  'REVIEW-SB-R1-1': 'two tabs on one song: a recording the other tab levelled is written back or published over',
};
const pick = (r, a) => a[Math.floor(r() * a.length)];
const P = 'sb-pubsong0001', D1 = 'sb-draftone001', D2 = 'sb-drafttwo002';
const FILES = { A: ['test-a.mp3', SRC.A, SRC_SEC.A], B: ['test-b.mp3', SRC.B, SRC_SEC.B], C: ['test-c.mp3', SRC.C, SRC_SEC.C] };
const copyId = (id, k) => id + '-' + sha(LEVELLED[k]).slice(0, 8);
const audioOf = (id, k) => ({ id: copyId(id, k), bytes: LEVELLED[k].length, sha256: sha(LEVELLED[k]), durationSec: SRC_SEC[k], centsOff: 0, gainDb: 3.21, sourceSha256: sha(SRC[k]) });
const sourceOf = k => ({ name: FILES[k][0], bytes: SRC[k].length, sha256: sha(SRC[k]), durationSec: SRC_SEC[k], sampleRate: 32000, channels: 1, kbps: 192 });
const VOLUME = { before: -15.71, after: -12.5, samplePeak: -1.2, truePeak: -1.1, ceilingDb: -1, encodes: 1, seconds: 3 };

/* The made-up pdf.js (song-builder-sim.mjs's, cut down): a chords pdf of one page, its lines as text items. */
const tcOf = lines => ({ items: lines.map((s, i) => ({ str: s, transform: [10, 0, 0, 10, 72, 100 + 12 * i], width: s.length * 6, height: 10 })) });
const PDF_LINES = new Map();
function pdfFile(name, lines){
  const bytes = new TextEncoder().encode('%PDF-1.7\n% made-up ' + name + '\n' + 'x'.repeat(40));
  PDF_LINES.set(sha(bytes), lines);
  return { name, size: bytes.length, type: 'application/pdf', arrayBuffer: async () => bytes.slice().buffer };
}
const FAKE_PDFJS = { getDocument({ data }){ const lines = PDF_LINES.get(sha(data)); if(!lines) return { promise: Promise.reject(Object.assign(new Error('Invalid PDF structure.'), { name: 'InvalidPDFException' })) };
  return { promise: Promise.resolve({ numPages: 1, async getPage(){ return { getViewport: () => ({ convertToViewportPoint: (x, y) => [x, y], width: 612, height: 792 }), getTextContent: async () => tcOf(lines) }; }, destroy(){} }) }; } };

/* The store at the start (see the header), written through console C (its sbSongOf makes the published song). */
function seedWorld(F, C){
  const { run, box } = C;
  const pubDraft = { v: 1, title: 'Test Pub', artist: 'Test Band', step: 7, source: sourceOf('A'), audio: audioOf(P, 'A'), volume: VOLUME, pitch: { cents: 0, peaks: 10 },
    beat: { meter: '4/4', bpm: 120, anchor: 0.5, pins: [], trackBpm: 120, trackSub: 1, driftOff: 0, driftFor: sha(LEVELLED.A), pinsNeeded: 2 },
    chart: { text: '', meter: '4/4', fmt: 'bar lines', sections: [{ name: 'verse', n: null, label: 'Verse', bars: ['G', 'D', 'G'], lyrics: null }], left: [], kept: [], edited: true, powerAt: null },
    level: { versions: 'full', start: null, range: null }, pubVer: 1, sheet: null, capo: null, imported: null };
  box.__pd = pubDraft;
  const song = JSON.parse(JSON.stringify(run('sbSongOf(__pd)')));
  F.S.set('songDrafts/' + P, Object.assign(JSON.parse(JSON.stringify(pubDraft)), { savedAt: TS }));
  F.S.set('builtSongs/' + P, { v: 1, title: pubDraft.title, artist: pubDraft.artist, audio: pubDraft.audio, song, savedAt: TS });
  F.S.set('builtSongsMeta/list', { songs: { [P]: 1 }, updatedAt: TS });
  putCopy(F, copyId(P, 'A'), LEVELLED.A, SRC_SEC.A);
  F.S.set('songDrafts/' + D1, { v: 1, title: 'Test One', artist: 'Test Band', step: 4, source: sourceOf('C'), audio: audioOf(D1, 'C'), volume: VOLUME, pitch: { cents: 0, peaks: 10 },
    beat: { meter: '4/4', bpm: 100, anchor: 0.4, pins: [], trackBpm: 100, trackSub: 1, driftOff: 0, driftFor: sha(LEVELLED.C), pinsNeeded: 2 },
    chart: { text: '', meter: '4/4', fmt: 'bar lines', sections: [{ name: 'chorus', n: null, label: 'Chorus', bars: ['Am', 'F', 'C'], lyrics: null }], left: [], kept: [], edited: true, powerAt: null },
    level: { versions: 'full', start: null, range: null }, pubVer: null, sheet: null, capo: null, imported: null, savedAt: TS });
  putCopy(F, copyId(D1, 'C'), LEVELLED.C, SRC_SEC.C);
  F.S.set('songDrafts/' + D2, { v: 1, title: 'Test Two', artist: '', step: 1, source: null, audio: null, volume: null, pitch: null, beat: null, chart: { text: '[Verse]\n| G | C |' },
    level: { versions: 'full', start: null, range: null }, pubVer: null, sheet: null, capo: null, imported: null, savedAt: TS });
}

/* ═══ one schedule ═══ */
async function runSchedule(idx){
  const r = rng(mix(SEED, idx + 1));
  const clock = new VClock();
  const fails = [], log = [];
  const fail = (tag, where, msg) => { fails.push({ tag, where, msg }); log.push(`  ✗ ${where}: ${msg}${tag ? ' [' + tag + ']' : ''}`); };
  const t = () => (clock.now / 1000).toFixed(2) + ' s';
  const say = s => { if(VERBOSE) log.push(`  ${t()} ${s}`); };
  /* D5 and D4 watch the store as it changes */
  const model = {};   // id -> { beat, chart, title, chartText, source, lastPick, at: {field: time}, abandoned: {field: true} }
  const M = id => model[id] = model[id] || { at: {}, abandoned: {} };
  let F;
  const onWrite = (op, path, next, prev) => {
    const p = path.split('/');
    if(op === 'set' && p[0] === 'songFiles' && p.length === 2 && next && next.state === 'uploading' && prev && prev.state === 'ready' && prev.sha256 === next.sha256 && prev.bytes === next.bytes){
      const list = (F.S.get('builtSongsMeta/list') || {}).songs || {};
      const owner = Object.keys(list).find(k => { const d = F.S.get('builtSongs/' + k); return d && d.audio && d.audio.id === p[1]; });
      if(owner) fail('TEACHER-SB-2', 'D5', `${t()}: ${owner}'s audio ${p[1]} was written 'uploading' over a stored file with the same bytes: Chromebooks without a copy are refused the live song until it is 'ready' again`);
    }
    if(op === 'set' && p[0] === 'builtSongs' && p.length === 2 && next && next.audio){
      const want = model[p[1]] && model[p[1]].lastPick;
      if(want && next.audio.sourceSha256 !== want) fail(readAfter(p[1], 'source') ? 'TEACHER-SB-1' : null, 'D4', `${t()}: Publish sent ${p[1]} with the recording of ${nameOfSha(next.audio.sourceSha256)}, but the last mp3 he picked for it was ${nameOfSha(want)}`);
    }
  };
  F = makeDb({ clock, delay: () => 20 + Math.floor(r() * 380), onWrite });
  const C = makeConsole(ROOT, { db: F.db, clock, seed: mix(SEED, idx + 5), encodeMs: () => 1500 + Math.floor(r() * 4500) });
  const { run, box, quiesce } = C;
  box.pcSheetLoadPdfjs = async () => FAKE_PDFJS;
  seedWorld(F, C);
  /* the watched re-read */
  const reads = [];
  box.__readLanded = () => reads.push(clock.now);
  run('(() => { const real = teacherSbLoad; teacherSbLoad = async function(){ const out = await real.apply(this, arguments); __readLanded(); return out; }; })()');
  const nameOfSha = s => Object.keys(SRC).find(k => sha(SRC[k]) === s) || (s || '').slice(0, 8);
  const readAfter = (id, field) => { const at = M(id).at[field]; return at != null && reads.some(x => x > at); };
  const advance = async ms => { await clock.advance(ms, quiesce); };
  const settleNow = async () => { await quiesce(); };
  /* what the teacher sees of the selected draft */
  const canonBeat = b => b ? JSON.stringify({ meter: b.meter, bpm: b.bpm, anchor: b.anchor, pins: b.pins || [] }) : 'null';
  const canonChart = c => c && Array.isArray(c.sections) ? JSON.stringify(c.sections.map(s => [s.name, s.n || null, s.bars])) : 'none';
  const snap = () => { const d = run('sbDraft()'); return d ? { id: run('sbSel'), busy: run('sbBusy'), beat: canonBeat(d.beat), chart: canonChart(d.chart), title: d.title, chartText: typeof d.chartText === 'string' ? d.chartText : null, source: d.source ? d.source.sha256 : null } : { id: run('sbSel') }; };
  let left = false, encodeLeft = false;
  const abandon = id => { if(id && model[id]) ['title', 'chartText', 'source'].forEach(f => { model[id].abandoned[f] = true; }); };
  const lastSwitch = {};
  run('renderTeacherSongBuilder()');
  await advance(1500);

  /* ── the actions ── each gets there the way he would (opens a song, clicks the step) before it acts; null = nothing done */
  /* sbOpen does nothing while the builder is busy (a save in flight): he waits a moment and clicks again */
  const openSong = async to => {
    for(let k = 0; k < 4 && run('sbSel') !== to; k++){
      const from = run('sbSel');
      run(`sbOpen(${JSON.stringify(to)})`);
      if(run('sbSel') === to){ abandon(from); lastSwitch[from] = clock.now; }
      await advance(k ? 600 : 200);
    }
    return run('sbSel') === to;
  };
  /* a pick made inside a combined action: the model takes the mp3 the draft now shows (the beat, if another length cleared it, goes with Next) */
  const notePick = id => {
    if(run('sbSel') !== id) return;
    const src = run('sbDraft() && sbDraft().source && sbDraft().source.sha256');
    if(!src) return;
    const m = M(id);
    if(m.source !== src){ m.source = src; m.at.source = clock.now; }
    m.lastPick = src; m.abandoned.source = false;
    if(run('sbDraft().beat') === null) delete m.beat;
  };
  let MARK = null;
  const act = code => { MARK = snap(); return run(code); };   // the snapshot "before" is taken at the act itself, after any way there
  const onDraft = () => !!run('sbDraft()');
  const toDraft = async () => {
    if(onDraft()) return true;
    const to = pick(r, [P, D1, D2]);
    await openSong(to);
    if(to === P && !onDraft()){ run(`sbEditAt(${pick(r, [1, 3, 4])})`); await advance(pick(r, [300, 900])); }
    say('opened ' + run('sbSel') + (onDraft() ? '' : ' (no draft open)'));
    return onDraft();
  };
  const toStep = async k => {
    if(!(await toDraft())) return false;
    if(run('sbStepOn') !== k){ run(`sbGoStep(${k})`); await advance(pick(r, [150, 400, 900])); }
    return run('sbStepOn') === k;
  };
  const ACTS = {
    open: async () => { const to = pick(r, [P, D1, D2]), from = run('sbSel'); run(`sbOpen(${JSON.stringify(to)})`); if(from !== to){ abandon(from); lastSwitch[from] = clock.now; } return 'open ' + to; },
    edit: async () => { if(!(await openSong(P)) || run('sbEditing.has(sbSel)')) return null; const k = pick(r, [1, 3, 4, 6]); run(`sbEditAt(${k})`); return 'Edit at step ' + k; },
    step: async () => { if(!(await toDraft())) return null; const k = pick(r, [1, 2, 3, 4, 5, 6]); run(`sbGoStep(${k})`); return 'step ' + k; },
    bpm: async () => { if(!(await toStep(3)) || !run('sbMem.level && sbMem.level.E')) return null; const v = pick(r, [92, 100, 110, 118, 124, 132]); act(`sbBeatChange({ target: { matches: q => q === '[data-sb-bpm]', value: '${v}' } })`); return 'typed BPM ' + v; },
    nudge: async () => { if(!(await toStep(3)) || !run('sbMem.level && sbMem.level.E')) return null; const a = pick(r, ['a+10', 'a-10', 'a+half', 'a-half', 'a+10']); act(`sbBeatAct(${JSON.stringify(a)}, { dataset: {} })`); return 'beat ' + a; },
    addbar: async () => { if(!(await toStep(4)) || !run('!!(sbDraft().chart && sbDraft().chart.sections)')) return null; const n = run('sbChartBars(sbDraft().chart.sections)'); if(n >= 5) return null;
      act(`sbChartAct('chart-view', { dataset: { sbV: 'grid' } }); sbChFor(sbSel).sel = null; sbChartAct('bar-pick', { dataset: { sbG: '${n - 1}' } }); sbChartAct('bar-add', { dataset: {} })`); return '+ Bar'; },
    chord: async () => { if(!(await toStep(4)) || !run('!!(sbDraft().chart && sbDraft().chart.sections)')) return null; const n = run('sbChartBars(sbDraft().chart.sections)'), g = Math.floor(r() * n), c = pick(r, ['G', 'C', 'D', 'Em', 'Am']);
      act(`sbChartAct('chart-view', { dataset: { sbV: 'grid' } }); sbChFor(sbSel).sel = null; sbChartAct('bar-pick', { dataset: { sbG: '${g}' } }); sbChartAct('bar-chord', { dataset: { sbChord: '${c}' } })`); return `bar ${g + 1} → ${c}`; },
    title: async () => { if(!(await toStep(1))) return null; const v = 'Test Title ' + Math.floor(r() * 1000); act(`sbInput({ target: { matches: q => q === '[data-sb-field]', dataset: { sbField: 'title' }, value: ${JSON.stringify(v)} } })`); return 'title "' + v + '"'; },
    text: async () => { if(!(await toStep(1)) || run('sbHasChart(sbDraft())')) return null; const v = '[Verse]\n| G | D | Em | C |\n[Chorus]\n| C | G |' + ' '.repeat(Math.floor(r() * 3)); act(`sbInput({ target: { matches: q => q === '[data-sb-charttext]', value: ${JSON.stringify(v)} } })`); return 'chart text typed'; },
    pdf: async () => { if(!(await toStep(1))) return null; box.__pdf = pdfFile('chords-' + idx + '-' + Math.floor(r() * 1e6) + '.pdf', ['[Verse]', 'G  D  Em  C', '[Chorus]', 'C  G']); act("sbPdfAdd('chords', [__pdf])"); return 'a chords pdf'; },
    pick: async () => { if(!(await toStep(1))) return null; const k = pick(r, ['A', 'B', 'B', 'C']); box.__f = fileOf(...FILES[k]); act('sbPickFile(__f)'); return 'picked mp3 ' + k; },
    next: async () => { if(!(await toStep(1))) return null; act('sbSaveUpload()'); return 'Next'; },
    level: async () => {
      if(!(await toDraft())) return null;
      if(!run('sbMem.src && sbMem.id === sbSel')){ if(!(await toStep(1))) return null; const id = run('sbSel'), k = id === D1 ? 'C' : pick(r, ['A', 'B']); box.__f = fileOf(...FILES[k]); run('sbPickFile(__f)'); await settleNow(); notePick(id); await advance(100); say('picked mp3 ' + k + ' to level it'); }
      if(!(await toStep(2))) return null;
      if(run('sbBusy') !== 'level') act('sbRunLevel()');
      return 'Level it';
    },
    levelLeave: async () => { const w = await ACTS.level(); if(!w) return null; await advance(pick(r, [200, 800, 1400])); return w + ', then ' + ACTS.leave(); },
    relevelPub: async () => {
      if(!(await openSong(P))) return null;
      if(!run('sbEditing.has(sbSel)')){ run('sbEditAt(1)'); await advance(800); }
      if(run('sbSel') !== P || !onDraft()) return null;
      if(!(await toStep(1))) return null;
      box.__f = fileOf(...FILES.A); run('sbPickFile(__f)'); await settleNow();
      notePick(P);
      await advance(100);
      if(!(await toStep(2))) return null;
      act('sbRunLevel()');
      return 'Level it again on the published song (the same mp3)';
    },
    /* a new mp3 of the same length for the published song, time passing, a chart change, then Publish */
    swapPublish: async () => {
      if(!(await openSong(P))) return null;
      if(!run('sbEditing.has(sbSel)')){ run('sbEditAt(1)'); await advance(800); }
      if(run('sbSel') !== P || !onDraft()) return null;
      if(!(await toStep(1))) return null;
      box.__f = fileOf(...FILES.B); act('sbPickFile(__f)'); await settleNow();
      notePick(P); MARK = null;
      say('picked mp3 B for the published song');
      await advance(pick(r, [3000, 16000])); run('teacherSbPaint()'); await advance(pick(r, [500, 2000]));
      MARK = null;
      if(!(await toStep(4))) return 'picked B; the Chart step did not open';
      const n = run('sbChartBars(sbDraft().chart.sections)'), c = pick(r, ['C', 'Em', 'Am']);
      /* act, not run (review round 1): the model books this chart change on the published song (the action may have
         started on another song, so its "before" is taken here); with run it expected the grid from before it. */
      act(`sbChartAct('chart-view', { dataset: { sbV: 'grid' } }); sbChFor(sbSel).sel = null; sbChartAct('bar-pick', { dataset: { sbG: '${n - 1}' } }); sbChartAct('bar-chord', { dataset: { sbChord: '${c}' } })`);
      await advance(1500);
      if(!(await toStep(3))) return 'picked B, changed the chart; the Beat step did not open';
      await advance(500);
      if(run('sbStepOn') !== 6){ run('sbGoStep(6)'); await advance(300); }
      if(run('sbStepOn') !== 6) return 'picked B, changed the chart; Preview did not open (' + String(run('sbNote')).slice(0, 60) + ')';
      run('sbPublish()');
      return 'picked B, changed the chart, Publish';
    },
    publish: async () => { if(run('sbSel') !== P || !onDraft()) return null; if(run('sbStepOn') !== 6){ run('sbGoStep(6)'); await advance(300); } if(run('sbStepOn') !== 6) return null; act('sbPublish()'); return 'Publish'; },
    leave: () => { const enc = run('sbBusy') === 'level' && C.world.workers.some(w => !w.terminated && !w.done); run("teacherSbLeave(); teacherView = 'manage';"); left = true; encodeLeft = encodeLeft || enc; abandon(run('sbSel')); lastSwitch[run('sbSel')] = clock.now; return 'left the view' + (enc ? ' during the encode' : ''); },
    paint: async () => { run('teacherSbPaint()'); return 'repaint'; },
  };
  const WEIGHTS = [['open', 2], ['edit', 2], ['step', 3], ['bpm', 1], ['nudge', 4], ['addbar', 3], ['chord', 2], ['title', 3], ['text', 1], ['pdf', 1], ['pick', 2], ['next', 2], ['level', 2], ['levelLeave', 1], ['relevelPub', 1], ['publish', 2], ['leave', 1], ['paint', 4], ['swapPublish', 1]];
  const total = WEIGHTS.reduce((n, w) => n + w[1], 0);
  const nActs = 10 + Math.floor(r() * 13);
  for(let i = 0; i < nActs; i++){
    if(left){
      if(r() < 0.6){ run("teacherView = 'songbuilder'; renderTeacherSongBuilder();"); left = false; say('came back to the Song builder'); }
      await advance(pick(r, [300, 1300, 4000]));
      continue;
    }
    let x = r() * total, name = WEIGHTS[0][0];
    for(const [n, w] of WEIGHTS){ if((x -= w) < 0){ name = n; break; } }
    let before = snap(), what;
    MARK = null;
    try { what = await ACTS[name](); } catch(e){ fail(null, 'D6', `${t()}: ${name} threw: ${(e && e.stack || String(e)).split('\n').slice(0, 2).join(' | ')}`); }
    await settleNow();
    if(MARK) before = MARK;
    if(what){
      const after = snap();
      /* the model: what he did, read off the console right after the action (before any time passes) */
      if(after.id === before.id && before.id && model){
        const m = M(before.id);
        for(const f of ['beat', 'chart', 'title', 'chartText', 'source']) if(after[f] !== undefined && after[f] !== before[f] && !(f === 'beat' && name === 'pick')){
          if(f === 'source'){ m.lastPick = after.source; }
          m[f] = after[f]; m.at[f] = clock.now; m.abandoned[f] = false; m.busy = m.busy || {}; m.busy[f] = before.busy;
          if(f === 'source' && after.beat !== before.beat) delete m.beat;   // another length: the beat starts over (by design), saved with Next like the mp3
        }
        if(name === 'pick' && after.source === before.source && before.source) m.lastPick = after.source;
        if(name === 'level' || name === 'publish' || name === 'edit') delete m.beat;   // Level may set the beat again (a new copy); Edit and Publish rebuild the draft
      }
      say(what + (run('sbNote') ? ' — ' + String(run('sbNote')).slice(0, 90) : ''));
      if(VERBOSE){ const id = run('sbSel'), d = run('sbDraft()'), st = F.S.get('songDrafts/' + id); say(`    [${id} step ${run('sbStepOn')}${run('sbBusy') ? ' busy ' + run('sbBusy') : ''}; shown: mp3 ${d && d.source ? nameOfSha(d.source.sha256) : '-'}, title "${d ? d.title : ''}"${d && d.dirty ? ' (unsaved)' : ''}; stored: mp3 ${st && st.source ? nameOfSha(st.source.sha256) : '-'}, title "${st ? st.title : ''}"]`); }
    }
    await advance(pick(r, [0, 50, 300, 700, 1300, 1300, 3000, 16000]));
  }
  /* the end: back to the view, the timers run out, a final Next on the song he stayed on */
  if(left){ run("teacherView = 'songbuilder'; renderTeacherSongBuilder();"); left = false; say('came back to the Song builder'); }
  await advance(20000);
  run('teacherSbPaint()');
  await advance(3000);
  const sel = run('sbSel');
  const pendingNext = sel && model[sel] && ['title', 'chartText', 'source'].some(f => model[sel][f] !== undefined && !model[sel].abandoned[f]);
  let unsaveable = null;   // a draft Next cannot save yet (no mp3 picked: "Pick the mp3 first."): what he typed must still be on screen
  if(pendingNext && run('sbDraft()')){
    run('sbSaveUpload()'); say('Next (to save what he typed on step 1)' + (run('sbNote') ? ' — ' + run('sbNote') : ''));
    if(/Pick the mp3 first/.test(run('sbNote'))) unsaveable = sel;
    await advance(6000);
  }
  await advance(20000);
  const stuck = run('sbBusy');

  /* D3 */
  if(stuck) fail(stuck === 'level' && encodeLeft ? 'TEACHER-SB-3' : null, 'D3', `20 s after the last action the builder is still busy ('${stuck}': "${run('sbProgress')}")${C.world.workers.some(w => w.terminated && !w.done) ? '; its encoder was ended by leaving the view and its promise never settled' : ''}`);
  /* D2 */
  if(clock.pending()){
    const ds = clock.q.map(x => x.delay);
    fail(stuck ? (stuck === 'level' && encodeLeft ? 'TEACHER-SB-3' : null) : ds.includes(600) ? 'TEACHER-SB-1' : null, 'D2', `${clock.pending()} timer(s) still waiting 20 s after the last action (delays ${[...new Set(ds)].join(', ')} ms): ${ds.includes(600) ? 'a save timer that retries every 600 ms and never finds its draft' : 'something keeps re-arming'}`);
  }
  /* D1 */
  for(const id of Object.keys(model)){
    const m = model[id], st0 = F.S.get('songDrafts/' + id);
    if(!st0) continue;
    /* Next could not save it: the title and chart text are checked on screen (the draft in memory) instead */
    const mem = id === unsaveable ? run('sbDrafts && sbDrafts.get(' + JSON.stringify(id) + ')') : null;
    const st = mem ? Object.assign({}, st0, { title: mem.title, chart: typeof mem.chartText === 'string' ? { text: mem.chartText } : st0.chart }) : st0;
    const lost = [];
    if(m.beat !== undefined && canonBeat(st.beat) !== m.beat) lost.push(['beat', `the beat ${m.beat.slice(0, 80)} (stored ${canonBeat(st.beat).slice(0, 80)})`]);
    if(m.chart !== undefined && canonChart(st.chart) !== m.chart) lost.push(['chart', `the chart grid ${m.chart.slice(0, 80)} (stored ${canonChart(st.chart).slice(0, 80)})`]);
    if(m.title !== undefined && !m.abandoned.title && st.title !== m.title) lost.push(['title', `the title "${m.title}" (stored "${st.title}")`]);
    if(m.chartText != null && !m.abandoned.chartText && !(st.chart && (st.chart.text === m.chartText.replace(/\r\n?/g, '\n').trim() || st.chart.text === m.chartText || Array.isArray(st.chart.sections)))) lost.push(['chartText', 'the chart text he typed or picked at step 1']);
    if(m.source !== undefined && !m.abandoned.source && (st.source ? st.source.sha256 : null) !== m.source) lost.push(['source', `the mp3 he picked (${nameOfSha(m.source)}; stored ${st.source ? nameOfSha(st.source.sha256) : 'none'})`]);
    for(const [f, what] of lost){
      const at = m.at[f], sw = lastSwitch[id];
      /* An edit made while a save was in flight: that save's landing puts the copy it wrote in memory (sbWriteDraft), so
         the edit is gone whether or not a re-read follows. Not TEACHER-SB-1's cause: counted as new. */
      if(m.busy && m.busy[f] === 'save'){ fail(null, 'D1', `${id}: lost ${what}, made at ${at != null ? (at / 1000).toFixed(2) + ' s' : '?'} while a save was in flight (the save's landing replaced the draft in memory)`); continue; }
      const why = readAfter(id, f) ? 'a re-read landed after it' : sw != null && at != null && sw >= at && sw - at < 1200 ? 'he left the song or the view within 1.2 s of it' : '';
      fail(why ? 'TEACHER-SB-1' : stuck === 'level' && encodeLeft ? 'TEACHER-SB-3' : null, 'D1', `${id}: lost ${what}, made at ${at != null ? (at / 1000).toFixed(2) + ' s' : '?'}${why ? '; ' + why : ''}`);
    }
  }
  /* D6 */
  F.st.violations.forEach(v => fail(null, 'D6', 'a write the rules refuse: ' + v));
  clock.errors.forEach(e => fail(null, 'D6', 'a timer threw: ' + (e && e.stack || String(e)).split('\n').slice(0, 2).join(' | ')));
  REJ.splice(0).forEach(e => fail(null, 'D6', 'a promise was rejected with no handler: ' + (e && e.stack || String(e)).split('\n').slice(0, 2).join(' | ')));
  return { fails, log, nActs, reads: reads.length };
}

/* ═══ two tabs on one store: X3 (see the header, TWO TABS) ═══ */
async function runTwoTabX3(){
  const r = rng(mix(SEED, 9001)), clock = new VClock(), fails = [], log = [];
  const fail = (tag, where, msg) => { fails.push({ tag, where, msg }); log.push(`  ✗ ${where}: ${msg}${tag ? ' [' + tag + ']' : ''}`); };
  const t = () => (clock.now / 1000).toFixed(2) + ' s', say = s => { if(VERBOSE) log.push(`  ${t()} ${s}`); };
  const X = copyId(P, 'A'), Y = copyId(P, 'B');
  let afterY = false;
  const onWrite = (op, path, next) => {
    if(op !== 'set' || !next || !next.audio) return;
    if(path === 'songDrafts/' + P && next.audio.id === Y) afterY = true;
    else if(afterY && path === 'songDrafts/' + P && next.audio.id === X) fail('REVIEW-SB-R1-1', 'D7', `${t()}: the draft was written back to the recording ${X} after the other tab levelled it to ${Y}`);
    if(afterY && path === 'builtSongs/' + P && next.audio.id === X) fail('REVIEW-SB-R1-1', 'D7', `${t()}: Publish sent the recording ${X}, which the other tab had replaced with ${Y}`);
  };
  const F = makeDb({ clock, delay: () => 20 + Math.floor(r() * 380), onWrite });
  const tab = k => makeConsole(ROOT, { db: F.db, clock, seed: mix(SEED, 9002 + k), encodeMs: () => 1500 + Math.floor(r() * 4500) });
  const A = tab(0), B = tab(1), note = K => K.run('sbNote') ? ' — ' + String(K.run('sbNote')).slice(0, 110) : '';
  seedWorld(F, A);
  const advance = ms => clock.advance(ms, async () => { await A.quiesce(); await B.quiesce(); });
  for(const K of [A, B]){ K.run('renderTeacherSongBuilder()'); await advance(900); K.run(`sbOpen(${JSON.stringify(P)})`); await advance(300); K.run('sbEditAt(1)'); await advance(900); }
  const title = 'Test Title ' + Math.floor(r() * 1000);
  A.run(`sbStepOn = 1; sbInput({ target: { matches: q => q === '[data-sb-field]', dataset: { sbField: 'title' }, value: ${JSON.stringify(title)} } })`);
  say(`tab A typed the title "${title}" (not saved)`);
  B.box.__f = fileOf(...FILES.B); B.run('sbPickFile(__f)'); await advance(300);
  B.run('sbSaveUpload()'); await advance(12000);
  say(`tab B picked mp3 B, pressed Next, and Volume levelled it: its draft names ${B.run('sbDraft() && sbDraft().audio && sbDraft().audio.id') === Y ? 'Y' : 'not Y'}` + note(B));
  await advance(pick(r, [0, 300, 4000, 16000]));
  if(r() < 0.5){ A.run('teacherSbPaint()'); await advance(pick(r, [200, 1500])); say('tab A repainted' + note(A)); }
  for(let k = 0; k < 2 && A.run('!!(sbDraft() && sbDraft().dirty)'); k++){ A.run('sbGoStep(2)'); await advance(3000); say('tab A pressed Next' + note(A)); }
  if(A.run('sbStepOn') !== 6){ A.run('sbGoStep(6)'); await advance(300); }
  A.run('sbPublish()'); await advance(3000); say('tab A pressed Publish' + note(A));
  await advance(20000);
  const st = F.S.get('songDrafts/' + P) || {}, live = F.S.get('builtSongs/' + P) || {};
  if(!afterY) fail(null, 'D7', 'tab B\'s level never named its copy Y: the schedule did not run as written');
  if(st.title !== title) fail('REVIEW-SB-R1-1', 'D1', `tab A's title "${title}" is not stored (stored "${st.title}")`);
  if(!st.audio || st.audio.id !== Y) fail('REVIEW-SB-R1-1', 'D7', `at the end the draft names ${st.audio ? st.audio.id : 'no recording'}, not tab B's ${Y}`);
  const named = new Set([st.audio && st.audio.id, live.audio && live.audio.id, copyId(D1, 'C')]);
  [...F.S.keys()].filter(k => /^songFiles\/[^/]+$/.test(k) && !named.has(k.slice(10))).forEach(k => fail('REVIEW-SB-R1-1', 'D7', `the levelled copy ${k.slice(10)} is left with nothing naming it`));
  for(const [n, K] of [['A', A], ['B', B]]) if(K.run('sbBusy')) fail(null, 'D3', `tab ${n} is still busy ('${K.run('sbBusy')}') 20 s after the last action`);
  if(clock.pending()) fail(null, 'D2', `${clock.pending()} timer(s) still waiting 20 s after the last action (delays ${[...new Set(clock.q.map(x => x.delay))].join(', ')} ms)`);
  F.st.violations.forEach(v => fail(null, 'D6', 'a write the rules refuse: ' + v));
  clock.errors.forEach(e => fail(null, 'D6', 'a timer threw: ' + (e && e.stack || String(e)).split('\n').slice(0, 2).join(' | ')));
  return { fails, log };
}

/* ═══ main ═══ */
async function main(){
  const t0 = Date.now();
  const idxs = SINGLE != null ? [Number(SINGLE)] : Array.from({ length: N }, (_, i) => i);
  const byTag = {}, shown = {};
  let failed = 0, acts = 0, reads = 0;
  for(const idx of idxs){
    const res = await runSchedule(idx);
    acts += res.nActs; reads += res.reads;
    if(!res.fails.length){ if(VERBOSE) console.log(`✓ schedule ${idx} (${res.nActs} actions, ${res.reads} re-reads)\n` + res.log.join('\n')); continue; }
    failed++;
    const tags = [...new Set(res.fails.map(f => f.tag || 'new'))];
    tags.forEach(t => { byTag[t] = (byTag[t] || 0) + 1; });
    const quiet = !VERBOSE && !tags.includes('new') && tags.every(t => (shown[t] = (shown[t] || 0) + 1) > 3);
    if(quiet) continue;
    console.log(`✗ FAIL schedule ${idx} (seed ${SEED}; ${res.nActs} actions, ${res.reads} re-reads): ${tags.join(', ')}`);
    const lines = VERBOSE ? res.log : res.log.filter(l => /✗/.test(l)).slice(0, 4);
    for(const l of lines) console.log('  ' + l.trim());
    console.log(`    replay: node tools/sb-draft-loop.mjs --seed=${SEED} --case=${idx} --cases=${N} --verbose${opt('root', null) ? ' --root=' + ROOT : ''}`);
  }
  for(const k of Object.keys(shown)) if(shown[k] > 3 && !VERBOSE) console.log(`  … ${shown[k] - 3} more schedule(s) with ${k} not printed (--verbose prints all)`);
  /* the two-tab schedule (not with --case) */
  let two = '', twoFailed = 0;
  if(SINGLE == null){
    const res = await runTwoTabX3(), tags = [...new Set(res.fails.map(f => f.tag || 'new'))];
    tags.forEach(t => { byTag[t] = (byTag[t] || 0) + 1; });
    twoFailed = res.fails.length ? 1 : 0;
    two = `, two tabs: ${1 - twoFailed} of 1 (X3)`;
    if(res.fails.length || VERBOSE){
      console.log(`${res.fails.length ? '✗ FAIL' : '✓'} two-tab schedule X3 (seed ${SEED})${res.fails.length ? ': ' + tags.join(', ') : ''}`);
      for(const l of VERBOSE ? res.log : res.log.filter(l => /✗/.test(l))) console.log('  ' + l.trim());
    }
  }
  const known = Object.keys(KNOWN).map(k => `${k} ×${byTag[k] || 0}`).join(', ');
  console.log(`sb-draft-loop: ${failed + twoFailed ? '✗' : '✓'} ${idxs.length - failed} of ${idxs.length} schedules hold (seed ${SEED})${two} · failing by finding: ${known}; new ${byTag.new || 0}`);
  console.log(`sb-draft-loop: ${idxs.length} schedules, ${acts} actions, ${reads} re-reads landed`);
  console.error(`sb-draft-loop: ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  return failed + twoFailed ? 1 : 0;
}
main().then(c => process.exit(c), e => { console.error('sb-draft-loop: the tool crashed: ' + (e && e.stack || e)); process.exit(2); });
