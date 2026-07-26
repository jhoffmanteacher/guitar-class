/* One-shot regression harness for the 2026-07-26 diagram extraction.
   Proves guitar-diagrams.js in default (css) mode emits byte-identical
   SVG to the pre-split app.js. Run from the repo root:
       node tools/diagram-parity-check.mjs <pre-split-commit>
   The ref is REQUIRED and must be a commit from BEFORE the extraction
   (i.e. one where app.js still contained the renderers). Exits non-zero
   on any mismatch. Kept as reproducible evidence for the split; it is
   not part of the pre-push battery. */
import { execSync } from 'node:child_process';
import { createRequire } from 'node:module';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const NEW = require('../guitar-diagrams.js');

/* ── Reconstruct the ORIGINAL implementation from git history ── */
const REF = process.argv[2];
if (!REF) {
  console.error('usage: node tools/diagram-parity-check.mjs <pre-split-commit>');
  console.error('       (a commit from before guitar-diagrams.js was split out of app.js)');
  process.exit(2);
}
const origAppJs = execSync(`git show ${REF}:app.js`, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
const lines = origAppJs.split('\n');
/* Lines 541-828 (1-indexed) hold every diagram function plus the audio
   helpers interleaved with them; the audio helpers are harmless here. */
const block = lines.slice(540, 828).join("\n");

const sandbox = {
  escHtml: (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'),
  window: {}, document: undefined, setTimeout, clearTimeout, Math, Number, String, Object, isNaN,
  getAudioCtx: () => ({ state: 'running', resume() {} }), playNote: () => {},
};
vm.createContext(sandbox);
vm.runInContext(block, sandbox, { filename: 'app.js(original)' });

for (const fn of ['chordDiagramSVG', 'localChordSvg', 'localStringSvg', 'localStringFretboardSvg', 'localNoteSvg', 'noteFullLabel']) {
  if (typeof sandbox[fn] !== 'function') {
    console.error(`✗ could not recover ${fn}() from ${REF}:app.js — line range is wrong`);
    process.exit(2);
  }
}

/* ── Compare ── */
let checked = 0, failed = 0;
const cmp = (label, a, b) => {
  checked++;
  if (a !== b) {
    failed++;
    console.error(`\n✗ ${label}`);
    const i = [...a].findIndex((c, k) => c !== b[k]);
    console.error(`  first difference at char ${i}`);
    console.error(`  old: …${a.slice(Math.max(0, i - 40), i + 60)}`);
    console.error(`  new: …${b.slice(Math.max(0, i - 40), i + 60)}`);
  }
};

for (const name of Object.keys(NEW.CHORD_DIAGRAMS)) {
  cmp(`chordDiagramSVG(${name})`, sandbox.chordDiagramSVG(NEW.CHORD_DIAGRAMS[name]), NEW.chordDiagramSVG(NEW.CHORD_DIAGRAMS[name]));
  cmp(`localChordSvg(${name})`,  sandbox.localChordSvg(name),                        NEW.localChordSvg(name));
}
for (const kind of Object.keys(NEW.STRING_DIAGRAMS)) {
  cmp(`localStringSvg(${kind})`, sandbox.localStringSvg(kind), NEW.localStringSvg(kind));
}
for (const kind of Object.keys(NEW.STRING_KIND_TO_NUM)) {
  cmp(`localStringFretboardSvg(${kind})`, sandbox.localStringFretboardSvg(kind), NEW.localStringFretboardSvg(kind));
  for (let fret = 0; fret <= 12; fret++) {
    for (const note of ['', 'E', 'F#', 'A&b']) {
      cmp(`localNoteSvg(${kind},${fret},"${note}")`, sandbox.localNoteSvg(kind, fret, note), NEW.localNoteSvg(kind, fret, note));
    }
    cmp(`noteFullLabel(X,${fret},${kind})`, sandbox.noteFullLabel('X', fret, kind), NEW.noteFullLabel('X', fret, kind));
  }
}
/* Unknown inputs must still return null, not throw */
cmp('localChordSvg(unknown)', String(sandbox.localChordSvg('Zz')), String(NEW.localChordSvg('Zz')));
cmp('localStringFretboardSvg(unknown)', String(sandbox.localStringFretboardSvg('zz')), String(NEW.localStringFretboardSvg('zz')));
cmp('localNoteSvg(bad fret)', String(sandbox.localNoteSvg('A', -1, 'E')), String(NEW.localNoteSvg('A', -1, 'E')));

console.log(`\n${failed ? '✗ FAIL' : '✓ PASS'} — ${checked - failed}/${checked} outputs byte-identical to ${REF}:app.js`);
process.exit(failed ? 1 : 0);
