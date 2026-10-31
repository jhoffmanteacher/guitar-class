#!/usr/bin/env node
/* diagram-regression.mjs — proves guitar-diagrams.js still draws every EXISTING
   diagram exactly as it did at a git ref.

     node tools/diagram-regression.mjs <git-ref>        e.g. origin/main, a9ea3a3

   Loads guitar-diagrams.js from <git-ref> and from this checkout, renders the
   same 204 diagrams through both (every chord, every string board, naturals,
   single notes, an explicit-notes board, a two-string board and the contact
   sheet, in the slide, web and css themes), and fails on the first difference.
   Anything ADDED to the file (a new function) is not rendered by the old
   copy, so adding one cannot make this fail; changing an old one does.

   Work order WO-hear-it-first: "existing diagram output must stay
   byte-identical". tools/guitar-diagrams-cli.mjs draws from this same file,
   so a match here is a match there. */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const ref = process.argv[2];
if (!ref) { console.error('usage: node tools/diagram-regression.mjs <git-ref>'); process.exit(2); }

const dir = mkdtempSync(join(tmpdir(), 'gd-regress-'));
let code = 0;
try {
  const old = execFileSync('git', ['-C', ROOT, 'show', `${ref}:guitar-diagrams.js`], { encoding: 'utf8', maxBuffer: 1 << 26 });
  writeFileSync(join(dir, 'gd-old.js'), old);
  const require = createRequire(import.meta.url);
  const OLD = require(join(dir, 'gd-old.js'));
  const NEW = require(join(ROOT, 'guitar-diagrams.js'));

  function renders(GD) {
    const rows = [];
    for (const theme of ['slide', 'web', 'css']) {
      const o = { theme };
      for (const c of Object.keys(GD.CHORD_DIAGRAMS)) rows.push([`${theme} chord ${c}`, GD.chordSvg(c, o)]);
      for (const k of Object.keys(GD.STRING_KIND_TO_NUM)) {
        rows.push([`${theme} string ${k}`, GD.localStringFretboardSvg(k, o)]);
        rows.push([`${theme} naturals ${k} 12`, GD.localStringNaturalsSvg(k, { ...o, maxFret: 12 })]);
        rows.push([`${theme} naturals ${k} 10`, GD.localStringNaturalsSvg(k, { ...o, maxFret: 10 })]);
        rows.push([`${theme} note ${k} 7`, GD.localNoteSvg(k, 7, 'E', o)]);
        rows.push([`${theme} note ${k} 0`, GD.localNoteSvg(k, 0, 'E', o)]);
      }
      rows.push([`${theme} notes lowE`, GD.localStringNotesSvg('lowE', [[0, 'E'], [2, 'F#'], [4, 'G#'], [5, 'A']], o)]);
      rows.push([`${theme} multi`, GD.localStringMultiNotesSvg([{ kind: 'lowE', notes: [[1, 'F'], [3, 'G'], [5, 'A']] }, { kind: 'A', notes: [[3, 'C'], [5, 'D']] }], o)]);
      rows.push([`${theme} sheet`, GD.chordSheetSvg(undefined, o)]);
    }
    return rows;
  }
  const a = renders(OLD), b = renders(NEW);
  if (a.length !== b.length) throw new Error(`render count differs: ${a.length} vs ${b.length}`);
  let nulls = 0;
  a.forEach(([name, svg], i) => {
    if (!svg) nulls++;
    if (svg !== b[i][1]) { console.error(`DIFFERENT: ${name}`); code = 1; }
  });
  if (nulls) { console.error(`${nulls} render(s) returned nothing — the sample set is broken`); code = 1; }
  if (!code) console.log(`diagram-regression: ✓ ${a.length} existing diagrams are byte-identical to ${ref}`);
} catch (e) { console.error('diagram-regression: could not run —', e.message); code = 2; }
finally { rmSync(dir, { recursive: true, force: true }); }
process.exit(code);
