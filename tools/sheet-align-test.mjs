#!/usr/bin/env node
/* THE LOOSE READ of a lyric sheet (app/cards-sheet.js pcSheetAlign, 2026-11-18): RUN in Node on made-up layouts and
   made-up chord lines. No sheet's words, no lyrics: a "sheet" here is only its chord lines, its section headers
   ("[Verse]") and a "(Repeat to end)" line. checks.mjs 1ev runs it and pins the case count.

   What it proves (each case prints ✓/✗):
     exact   a sheet written one name per change: ok, and the same map as pcSheetMap (tok and start), so the loose
             read changes nothing on such a sheet
     R1      E7 / Dsus4 / Cmaj7 = their triad, G/B = G, Am7 / Amin = Am, A5 = A = Am, D#m = Ebm; planted faults: Em
             on the sheet where the card plays E, C where it plays C#, Bdim where it plays B: each a mismatch whose
             line names the change, the card's chord and the sheet's
     R2      the chord boxes' labels above the first [header] are skipped; planted: the same labels with no header
             (a mismatch), a chord line between two headers (counted, not skipped)
     R3      E7 E7 G G over two bars each: one change per run, the dot on the name of the bar being played; planted: a
             run longer than its change's bars (a mismatch naming the run); a run across a header (the chord held
             from one section into the next); A then A7 on the card: one name each
     R4      "(Repeat to end)" after the last chord line plays that line again for every change left, ending mid-line
             too; planted: no repeat line (runs out), a repeat line with a chord line after it (not final: runs out),
             a change in a later round that is not the line's (a mismatch)
     ends    a sheet with names after the card's last change: a mismatch; the table: one row per lap, ok before the
             first mismatch, false on it, null after
     pdf     (default; --no-cards skips) a made-up one-column sheet written here as a real pdf (Courier): the app's own
             pcSheetModel gives the chord names, their lines and the header / repeat marks the loose read needs
     cards   (default; --no-cards skips) the three coded sheet cards (ca-38, ca-44, ca-45): their PDFs read through
             the vendored pdf.js in Node and the app's own pcSheetModel, then pcSheetAlign gives pcSheetMap's map
             exactly (tok and start, every note of every lap)
   --breaks  runs the made-up cases against broken copies of pcSheetAlign; each must turn at least one case red.

   Made-up data only; nothing leaves the process. */
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(join(ROOT, 'app/cards-sheet.js'), 'utf8');
const J = JSON.stringify;

/* A light page for app/cards-sheet.js alone: what its top level and pcSheetAlign / pcSheetMap / pcSheetWhere use. */
function load(src){
  const nop = () => {};
  const ctx = { console, Math, Object, Array, String, Number, JSON, Set, Map, Promise, Error,
    window: { addEventListener: nop }, document: { addEventListener: nop },
    t: (k, p) => k + (p ? J(p) : ''), tf: (o, f) => (o && o[f]) || '' };
  vm.createContext(ctx);
  vm.runInContext(src + '\n;globalThis.__api = { pcSheetAlign, pcSheetMap, pcSheetFold, pcSheetSame, PC_SHEET_HEAD_RE, PC_SHEET_REPEAT_RE };', ctx, { filename: 'app/cards-sheet.js' });
  return ctx.__api;
}

/* A made-up card layout, as pcLayout builds it: sections of bars, each bar 'D' (the whole bar), 'G:2 A:2' (beats)
   or '-' (a rest). opts.again: section labels named again on every lap (pcSheetMap's nameAgain). */
function layout(secs, bpb = 4, opts = {}){
  let from = 1;
  const sections = secs.map(([label, bars, reps]) => {
    const notes = [], beatEnds = [];
    let acc = 0;
    bars.forEach(b => b.trim().split(/\s+/).forEach(tk => {
      const [nm, bt] = tk.includes(':') ? tk.split(':') : [tk, String(bpb)];
      const beats = Number(bt);
      notes.push(nm === '-' ? { rest: true, beats } : { note: nm, beats });
      acc += beats; beatEnds.push(acc);
    }));
    const S = { s: { label }, notes, fromBar: from, bars: bars.length, reps: reps || 1, beatEnds, nameAgain: !!(opts.again && opts.again.includes(label)) };
    from += bars.length * (reps || 1);
    return S;
  });
  return { tr: { beatsPerBar: bpb }, sections, firstBar: 1, totalBars: from - 1 };
}
/* A made-up sheet: lines of chord names, '[Header]' lines and '(Repeat to end)' lines. Only kinds and names. */
function sheet(lines){
  const toks = [], marks = [];
  let line = 0;
  lines.forEach(l => {
    if (/^\[.*\]$/.test(l)) { marks.push({ kind: 'head', at: toks.length }); return; }
    if (/^\(.*\)$/.test(l)) { marks.push({ kind: 'repeat', at: toks.length }); return; }
    l.trim().split(/\s+/).forEach(name => toks.push({ name, line }));
    line++;
  });
  return { toks, marks };
}

function suite(api, quiet){
  let pass = 0, fail = 0; const red = [];
  const ok = (name, cond, why) => { if (cond) pass++; else { fail++; red.push(name); } if (!quiet) console.log((cond ? '  ✓ ' : '  ✗ ') + name + (cond || !why ? '' : '  — ' + why)); };
  const say = s => { if (!quiet) console.log(s); };
  const A = (L, lines) => api.pcSheetAlign(L, sheet(lines));
  const tokAt = (r, si, rep, ni) => r.tok[si][rep][ni];

  say('== exact: one name per change');
  { const L = layout([['Verse', ['D', 'E', 'G:2 A:2', 'D'], 2], ['Chorus', ['G', 'A', '-', 'D']]]);
    const sh = sheet(['[Verse]', 'D E G A D', 'E G A D', '[Chorus]', 'G A D']);   // lap 1 ends on D, lap 2 starts on it: one change
    const r = api.pcSheetAlign(L, sh), m = api.pcSheetMap(L);
    ok('exact: ok, nothing skipped, folded or cycled', r.ok && r.skipped === 0 && r.folded === 0 && r.cycled === 0, r.why);
    ok('exact: the same tok as pcSheetMap, every note of every lap', J(r.tok) === J(m.tok), J(r.tok) + ' vs ' + J(m.tok));
    ok('exact: the same start as pcSheetMap', J(r.start) === J(m.start), J(r.start) + ' vs ' + J(m.start));
    ok('exact: the table has one row per lap (3), all ok', r.table.length === 3 && r.table.every(x => x.ok === true), J(r.table));
    ok('exact: the rest bar keeps the dot on the chord before it', tokAt(r, 1, 0, 2) === tokAt(r, 1, 0, 1));
  }

  say('== R1: names folded to what a card can name');
  { const L = layout([['Verse', ['E', 'G', 'Am', 'D', 'A', 'C', 'D#m', 'B']]]);
    const r = A(L, ['[Verse]', 'E7 G/B Am7 Dsus4 A5 Cmaj7 Ebm B7']);
    ok('R1: E7, G/B, Am7, Dsus4, A5, Cmaj7, Ebm, B7 follow E G Am D A C D#m B', r.ok && r.folded === 8, r.why);
    ok('R1: Amin = Am and A5 = Am', api.pcSheetSame('Amin', 'Am') && api.pcSheetSame('A5', 'Am') && api.pcSheetSame('Am', 'A5'));
    const f1 = A(layout([['Verse', ['E', 'A']]]), ['[Verse]', 'Em A']);
    ok('R1 planted: Em where the card plays E is a mismatch naming change 1, E and Em', !f1.ok && /Chord change 1 \(Verse\): the card plays E, the sheet's chord 1 is Em\./.test(f1.why), f1.why);
    const f2 = A(layout([['Verse', ['C#', 'A']]]), ['[Verse]', 'C A']);
    ok('R1 planted: C where the card plays C# is a mismatch', !f2.ok && /plays C#, the sheet's chord 1 is C\./.test(f2.why), f2.why);
    const f3 = A(layout([['Verse', ['A', 'B']]]), ['[Verse]', 'A Bdim']);
    ok('R1 planted: Bdim where the card plays B is a mismatch at change 2', !f3.ok && /^Chord change 2 /.test(f3.why), f3.why);
    ok('R1: a slash chord on another root is that chord (D/F# = D, not F#)', api.pcSheetSame('D/F#', 'D') && !api.pcSheetSame('D/F#', 'F#'));
  }

  say('== R2: the chord boxes above the first header');
  { const L = layout([['Intro', ['D', 'E']], ['Verse', ['G', 'A']]]);
    const r = A(L, ['D E7 G A A7 Em Bm', '[Intro]', 'D E7', '[Verse]', 'G A']);
    ok('R2: 7 labels skipped, the song follows', r.ok && r.skipped === 7, r.why + ' skipped ' + r.skipped);
    ok('R2: the dot starts on the first name under [Intro] (index 7)', tokAt(r, 0, 0, 0) === 7, String(tokAt(r, 0, 0, 0)));
    ok('R2: a skipped label starts nothing (no start)', r.start.slice(0, 7).every(x => !x) && !!r.start[7]);
    const f1 = A(L, ['D E7 G A A7 Em Bm', 'D E7', 'G A']);
    ok('R2 planted: the same labels with no header are read as the song: a mismatch', !f1.ok && f1.skipped === 0, f1.why);
    const f2 = A(L, ['[Intro]', 'D E7', 'Bm', '[Verse]', 'G A']);
    ok('R2 planted: a chord line between two headers is counted, not skipped: a mismatch at change 3', !f2.ok && /^Chord change 3 .*is Bm\./.test(f2.why), f2.why);
  }

  say('== R3: a name written again');
  { const L = layout([['Intro', ['E', 'E', 'G', 'G', 'A', 'A']]]);
    const r = A(L, ['[Intro]', 'E7 E7 G G A A']);
    ok('R3: E7 E7 G G A A over two bars each: ok, 3 changes', r.ok && r.count === 3, r.why);
    ok('R3: the dot is on the name of the bar being played (bar 1 -> name 0, bar 2 -> name 1, bar 4 -> name 3)', tokAt(r, 0, 0, 0) === 0 && tokAt(r, 0, 0, 1) === 1 && tokAt(r, 0, 0, 3) === 3, J(r.tok));
    ok('R3: a tap on the second E7 starts that lap', r.start[1] && r.start[1].si === 0 && r.start[1].rep === 0);
    const f1 = A(L, ['[Intro]', 'E7 E7 E7 G G A A']);
    ok('R3 planted: E7 three times over a two-bar change is a mismatch naming the run', !f1.ok && /the sheet names E7 3 times in a row, but the card plays it for 2 bars\./.test(f1.why), f1.why);
    const L2 = layout([['Chorus', ['G', 'D']], ['Verse', ['D', 'E']]]);
    const r2 = A(L2, ['[Chorus]', 'G D', '[Verse]', 'D E']);
    ok('R3: D at the end of a section and again at the next one\'s start is the one change held across: ok', r2.ok && r2.count === 3, r2.why);
    ok('R3: …the dot on the Verse\'s D in the Verse', tokAt(r2, 0, 0, 1) === 1 && tokAt(r2, 1, 0, 0) === 2, J(r2.tok));
    const L3 = layout([['Chorus', ['G', 'D']], ['Verse', ['E', 'E']]]);
    const f2 = A(L3, ['[Chorus]', 'G D', '[Verse]', 'D E']);
    ok('R3 planted: a held D the card does not play in the next section: a mismatch (D twice over one bar)', !f2.ok && /names D 2 times in a row, but the card plays it for 1 bar\./.test(f2.why), f2.why);
    const L4 = layout([['Verse', ['A', 'A7', 'D']]]);
    const r4 = A(L4, ['[Verse]', 'A A7 D']);
    ok('R3: the card goes A then A7 (one chord, folded): one name each', r4.ok && tokAt(r4, 0, 0, 0) === 0 && tokAt(r4, 0, 0, 1) === 1 && tokAt(r4, 0, 0, 2) === 2, r4.why + J(r4.tok));
    const L6 = layout([['Verse', ['E5', 'E5', 'A5']]]);
    const r6 = A(L6, ['[Verse]', 'E Em A']);
    ok('R3: on a power-chord card, E then Em on the sheet are the one E5 (two bars)', r6.ok && r6.count === 2 && tokAt(r6, 0, 0, 1) === 1, r6.why);
    const L5 = layout([['Riff', ['D5', 'G5'], 2]], 4, { again: ['Riff'] });
    const r5 = A(L5, ['[Riff]', 'D5 G5', 'D5 G5']), m5 = api.pcSheetMap(L5);
    ok('R3: a section named again every lap (pcSheetMap\'s nameAgain) maps as pcSheetMap does', r5.ok && J(r5.tok) === J(m5.tok), r5.why + J(r5.tok) + J(m5.tok));
  }

  say('== R4: "(Repeat to end)"');
  { const L = layout([['Verse', ['G', 'A']], ['Outro', ['D', 'E', 'G', 'A'], 3]]);
    const r = A(L, ['[Verse]', 'G A', '[Outro]', 'D E7 G A', '(Repeat to end)']);
    ok('R4: the last line plays round again for laps 2 and 3: ok, 8 changes cycled', r.ok && r.cycled === 8, r.why + ' cycled ' + r.cycled);
    ok('R4: in lap 3 the dot is on the line\'s names again', tokAt(r, 1, 2, 0) === 2 && tokAt(r, 1, 2, 3) === 5, J(r.tok[1]));
    const Lm = layout([['Verse', ['G', 'A']], ['Outro', ['D', 'E', 'G', 'A', 'D', 'E']]]);
    ok('R4: a song ending part way round the line: ok', A(Lm, ['[Verse]', 'G A', '[Outro]', 'D E7 G A', '(Repeat to end)']).ok);
    const f1 = A(L, ['[Verse]', 'G A', '[Outro]', 'D E7 G A']);
    ok('R4 planted: no repeat line: the sheet runs out at change 7', !f1.ok && /^The sheet runs out of chord names at chord change 7 \(D, Outro\b[^)]*\): the card plays 8 more\./.test(f1.why), f1.why);
    const f2 = A(L, ['[Verse]', 'G A', '(Repeat to end)', '[Outro]', 'D E7 G A']);
    ok('R4 planted: a repeat line that is not the last (chord lines after it): no round again, the sheet runs out', !f2.ok && f2.cycled === 0 && /^The sheet runs out .*chord change 7 /.test(f2.why), f2.why);
    const Lx = layout([['Outro', ['D', 'E', 'G', 'A', 'D', 'E', 'G', 'C']]]);
    const f3 = A(Lx, ['[Outro]', 'D E7 G A', '(Repeat to end)']);
    ok('R4 planted: the second round plays C where the line has A: a mismatch at change 8', !f3.ok && /^Chord change 8 .*plays C, the sheet's chord 4 is A\./.test(f3.why), f3.why);
    ok('R4: the repeat line is read in English and Spanish, with or without brackets', api.PC_SHEET_REPEAT_RE.test('(Repeat to end)') && api.PC_SHEET_REPEAT_RE.test('Repeat till the end') && api.PC_SHEET_REPEAT_RE.test('(Repetir hasta el final)') && !api.PC_SHEET_REPEAT_RE.test('(Repeat x2)'));
    ok('a header is a line of one [ ... ] only', api.PC_SHEET_HEAD_RE.test('[Pre-Chorus]') && !api.PC_SHEET_HEAD_RE.test('[Verse] more') && !api.PC_SHEET_HEAD_RE.test('Verse'));
  }

  say('== the ends and the table');
  { const L = layout([['Verse', ['D', 'E']], ['Chorus', ['G', 'A']], ['Outro', ['D']]]);
    const f1 = A(L, ['[Verse]', 'D E', '[Chorus]', 'G A', '[Outro]', 'D G']);
    ok('a sheet with a name after the card\'s last change: a mismatch saying so', !f1.ok && /^The sheet names 1 more chord after the card's last change \(from chord 6, G\)\./.test(f1.why), f1.why);
    const f2 = A(L, ['[Verse]', 'D E', '[Chorus]', 'G C', '[Outro]', 'D']);
    ok('the table: Verse ok, Chorus false (the mismatch), Outro null (after it)', J(f2.table.map(x => x.ok)) === '[true,false,null]', J(f2.table.map(x => x.ok)));
    ok('the table names what each lap plays and what the sheet names there', J(f2.table[0].card) === '["D","E"]' && J(f2.table[0].sheet) === '["D","E"]' && J(f2.table[1].card) === '["G","A"]', J(f2.table));
    ok('a mismatch leaves no change half-placed (the dot stays off: ok false)', !f2.ok && f2.tok[2][0][0] === -1);
  }
  return { pass, fail, red };
}

/* Each break: [name, old text, new text, ...]. The old text must occur exactly once in app/cards-sheet.js. */
const BREAKS = [
  ['R1 off: names compared as written', "  return !!(x && y && x.pc === y.pc && (x.q === y.q || x.q === '5' || y.q === '5'));", "  return String(a) === String(b);"],
  ['R1: a slash chord is not folded', "(\\/[A-G](#|b)?)?$/.exec(", "$/.exec("],
  ['R1: a 5 chord does not match the minor', "x.q === '5' || y.q === '5'", "(x.q === '5' && y.q === '') || (y.q === '5' && x.q === '')"],
  ['R1: the quality is not compared', "x.pc === y.pc && (x.q === y.q || x.q === '5' || y.q === '5')", "x.pc === y.pc"],
  ['R1: dim folds to the triad', "/^(dim|°|ø)|b5/.test(r) ? 'dim' : ", ''],
  ['R2 off: the labels are read', "  const skip = head ? head.at : 0;", "  const skip = 0;"],
  ['R2: the first line is skipped with no header', "  const skip = head ? head.at : 0;", "  const skip = head ? head.at : (toks.length ? toks.filter(T => T.line === toks[0].line).length : 0);"],
  ['R2: the LAST header is used', "  const head = marks.find(m => m.kind === 'head');", "  const head = marks.filter(m => m.kind === 'head').pop();"],
  ['R3 off: one name per change', "    while(p + run < seq.length && pcSheetSame(toks[seq[p + run]].name, c.name)) run++;", ''],
  ['R3: a run is measured against the sheet\'s first name, not the card\'s chord', "pcSheetSame(toks[seq[p + run]].name, c.name)) run++;", "pcSheetSame(toks[seq[p + run]].name, T.name)) run++;"],
  ['R3: a run longer than its bars passes', "    if(k > c.bars){", "    if(false){"],
  ['R3: the dot stays on the first name of a run', "Math.min(o.k - 1, Math.floor(off * o.k / c.bars + 1e-6))", "0"],
  ['R3: A then A7 on the card takes both names at once', "    const k = Math.max(1, run - same);", "    const k = run;"],
  ['R4 off: no round again', "  for(let n = 0; n < ch.length && again.length; n++) seq.push(...again);", ''],
  ['R4: a repeat line anywhere counts', "m.kind === 'repeat' && m.at === toks.length", "m.kind === 'repeat'"],
  ['R4: the whole sheet goes round again, not the last line', "seq.filter(i => toks[i].line === last)", "seq.slice()"],
  ['ends: names left over pass', "  if(!why && p < real){", "  if(false){"],
  ['ends: the table marks the rows after a mismatch as failed', "mine.length && mine[0] > bad ? null : false", "false"],
];

const real = suite(load(SRC), false);
let cardsLine = '';
if (!process.argv.includes('--no-cards')) {
  console.log('== real pdfs through pdf.js and pcSheetModel: a made-up sheet, and the three coded sheet cards (pcSheetAlign = pcSheetMap)');
  const res = await cardsCheck();
  for (const x of res.rows) { console.log((x.ok ? '  ✓ ' : '  ✗ ') + x.line); if (x.ok) real.pass++; else { real.fail++; real.red.push(x.line); } }
  const cr = res.rows.filter(x => x.card);
  cardsLine = ` (${cr.filter(x => x.ok).length} of ${cr.length} sheet cards identical)`;
}
console.log(`\nsheet-align-test: ${real.pass + real.fail} cases, ${real.fail} failed${cardsLine}`);
let missed = 0;
if (process.argv.includes('--breaks')) {
  console.log('\n== broken copies of pcSheetAlign (each must turn at least one made-up case red)');
  for (const [name, ...pairs] of BREAKS) {
    let broken = SRC, bad = '';
    for (let i = 0; i < pairs.length; i += 2) {
      const n = broken.split(pairs[i]).length - 1;
      if (n !== 1) { bad = `the text to break is found ${n} times (must be 1): ${J(pairs[i].slice(0, 60))}`; break; }
      broken = broken.replace(pairs[i], () => pairs[i + 1]);
    }
    if (bad) { console.log(`  ✗ ${name}: ${bad}`); missed++; continue; }
    let r;
    try { r = suite(load(broken), true); } catch (e) { r = { fail: 1, red: ['threw: ' + String(e.message || e).slice(0, 100)] }; }
    if (r.fail) console.log(`  ✓ caught: ${name} — ${r.red.slice(0, 2).join(' | ')}`);
    else { console.log(`  ✗ NOT caught: ${name}`); missed++; }
  }
  console.log(`\n${missed ? '✗' : '✓'} ${BREAKS.length - missed} of ${BREAKS.length} breaks caught`);
}
process.exit(real.fail || missed ? 1 : 0);

/* The coded sheet cards, end to end in Node: the whole app (tools/sim-app-page.mjs), the vendored pdf.js handed each
   PDF's bytes, the app's own pcSheetModel and pcLayout(caView(a)), then pcSheetAlign against pcSheetMap. */
async function cardsCheck(){
  const { appPage } = await import('./sim-app-page.mjs');
  const require = createRequire(import.meta.url);
  const lib = require(join(ROOT, 'vendor/pdfjs/pdf.min.js'));
  lib.GlobalWorkerOptions.workerSrc = join(ROOT, 'vendor/pdfjs/pdf.worker.min.js');
  const page = appPage(ROOT);
  page.ctx.pdfjsLib = { GlobalWorkerOptions: {}, getDocument: src => lib.getDocument(typeof src === 'string' ? { data: src === 'made-up.pdf' ? page.ctx.__made : new Uint8Array(readFileSync(join(ROOT, src))), isEvalSupported: false } : src) };
  page.ctx.loadScriptOnce = () => Promise.resolve();
  const ids = page.run('CLASS_ACTIVITIES.filter(a => a && a.view === "card" && a.card && a.card.sheet).map(a => a.id)');
  const rows = [];
  /* A made-up one-column sheet, written here as a real pdf (Courier, as the sheets are): the chord boxes' labels, a
     title line, headers, chord lines over made-up words, and "(Repeat to end)". Read by the app's own pcSheetPage /
     pcSheetModel: the marks and lines the loose read needs come out of a real pdf, not only out of sheet() above. */
  try {
    page.ctx.__made = madePdf(['D E7 G A', 'Test Song Title', '[Intro]', 'D E7', '[Verse 1]', 'G A', 'Test words here and there', 'D', 'Test more words', '[Outro]', 'G A', '(Repeat to end)']);
    const r = await page.run(`(async () => {
      const model = await pcSheetModel('made-up.pdf', 1);
      const L = { tr: { beatsPerBar: 4 }, firstBar: 1, totalBars: 9, sections: [
        { s: { label: 'Intro' }, notes: [{ note: 'D', beats: 4 }, { note: 'E', beats: 4 }], fromBar: 1, bars: 2, reps: 1, beatEnds: [4, 8] },
        { s: { label: 'Verse' }, notes: [{ note: 'G', beats: 4 }, { note: 'A', beats: 4 }, { note: 'D', beats: 4 }], fromBar: 3, bars: 3, reps: 1, beatEnds: [4, 8, 12] },
        { s: { label: 'Outro' }, notes: [{ note: 'G', beats: 4 }, { note: 'A', beats: 4 }], fromBar: 6, bars: 2, reps: 2, beatEnds: [4, 8] }] };
      const al = pcSheetAlign(L, model);
      return { names: model.toks.map(T => T.name).join(' '), lines: model.toks.map(T => T.line).join(''), marks: model.marks.map(m => m.kind + '@' + m.at).join(' '), ok: al.ok, why: al.why, skipped: al.skipped, cycled: al.cycled, folded: al.folded };
    })()`);
    const want = { names: 'D E7 G A D E7 G A D G A', lines: '00001122344', marks: 'head@4 head@6 head@9 repeat@11' };
    const same = r.names === want.names && r.lines === want.lines && r.marks === want.marks && r.ok && r.skipped === 4 && r.cycled === 2 && r.folded === 1;
    rows.push({ ok: same, line: `a made-up pdf (Courier, one column): ${r.names.split(' ').length} chord names on ${new Set(r.lines).size} lines, marks ${r.marks || 'none'}; loose read ${r.ok ? 'ok' : 'NOT ok: ' + r.why}, skipped ${r.skipped}, folded ${r.folded}, cycled ${r.cycled}${same ? '' : ' — expected ' + J(want) + ', skipped 4, folded 1, cycled 2'}` });
  } catch (e) { rows.push({ ok: false, line: `a made-up pdf: threw ${String(e && e.message || e).slice(0, 200)}` }); }
  if (ids.length !== 3) rows.push({ ok: false, line: `expected 3 coded sheet cards (ca-38, ca-44, ca-45), found ${ids.length}: ${J(ids)}` });
  for (const id of ids) {
    try {
      page.ctx.__id = id;
      const r = await page.run(`(async () => {
        const a = CLASS_ACTIVITIES.find(x => x.id === __id), L = pcLayout(a);
        const model = await pcSheetModel(a.card.sheet, a.card.sheetColumns);
        const al = pcSheetAlign(L, model), m = pcSheetMap(L);
        return { names: model.toks.length, marks: (model.marks || []).map(x => x.kind + '@' + x.at).join(' '), ok: al.ok, why: al.why, skipped: al.skipped, folded: al.folded, cycled: al.cycled,
          sameTok: JSON.stringify(al.tok) === JSON.stringify(m.tok), sameStart: JSON.stringify(al.start) === JSON.stringify(m.start), count: m.count };
      })()`);
      const same = r.ok && r.sameTok && r.sameStart && r.names === r.count;
      rows.push({ card: true, ok: same, line: `${id}: ${r.names} chord names, ${r.count} changes; loose read ${r.ok ? 'ok' : 'NOT ok: ' + r.why}; skipped ${r.skipped}, folded ${r.folded}, cycled ${r.cycled}; tok ${r.sameTok ? 'identical' : 'DIFFERENT'}, start ${r.sameStart ? 'identical' : 'DIFFERENT'}; marks: ${r.marks || 'none'}` });
    } catch (e) { rows.push({ card: true, ok: false, line: `${id}: threw ${String(e && e.message || e).slice(0, 200)}` }); }
  }
  return { rows };
}

/* A one-page pdf of these lines in Courier 11, one under the other: the smallest real pdf pdf.js reads text from. */
function madePdf(lines){
  const esc = t => t.replace(/[\\()]/g, m => '\\' + m);
  const body = 'BT /F1 11 Tf 13 TL 72 740 Td ' + lines.map(l => `(${esc(l)}) Tj T*`).join(' ') + ' ET';
  const objs = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>', `<< /Length ${body.length} >>\nstream\n${body}\nendstream`];
  let out = '%PDF-1.4\n'; const at = [];
  objs.forEach((o, i) => { at.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n` + at.map(n => String(n).padStart(10, '0') + ' 00000 n \n').join('') + `trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF\n`;
  return new Uint8Array(Buffer.from(out, 'latin1'));
}
