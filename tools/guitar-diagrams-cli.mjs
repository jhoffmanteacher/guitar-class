/* guitar-diagrams-cli.mjs — render chord / fretboard / note diagrams as
   standalone SVG or PNG, for the bilingual teacher slide decks.

   Draws from ../guitar-diagrams.js, the same file index.html loads, so a
   diagram on a slide is the same shape students see on the site.

     node tools/guitar-diagrams-cli.mjs chord Am -o Am.png
     node tools/guitar-diagrams-cli.mjs chord Am --label -o Am.png
     node tools/guitar-diagrams-cli.mjs string A -o Astring.png
     node tools/guitar-diagrams-cli.mjs notes lowE "0:E,2:F#,4:G#,5:A" -o hb-lowE.svg
     node tools/guitar-diagrams-cli.mjs note A 7 E -o A7.png
     node tools/guitar-diagrams-cli.mjs sheet -o all-chords.png
     node tools/guitar-diagrams-cli.mjs list

   --theme slide (default) cream ground, strokes/fonts x1.35 for a projector
   --theme web             the site's light-mode hex, unboosted

   SVG output needs nothing. PNG output needs `sharp` (npm i -g sharp);
   without it, write .svg and convert however you like. PowerPoint does not
   embed SVG reliably, so decks want PNG. */
import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const GD = require('../guitar-diagrams.js');

async function loadSharp() {
  try { return (await import('sharp')).default; } catch { /* try global */ }
  try {
    const root = execSync('npm root -g', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
    return createRequire(`${root}/`)('sharp');
  } catch { return null; }
}

const argv = process.argv.slice(2);
const outIdx = Math.max(argv.indexOf('-o'), argv.indexOf('--out'));
const out = outIdx > -1 ? argv[outIdx + 1] : null;
let rest = outIdx > -1 ? argv.filter((_, i) => i !== outIdx && i !== outIdx + 1) : argv;
const themeIdx = rest.indexOf('--theme');
const theme = themeIdx > -1 ? rest[themeIdx + 1] : 'slide';
rest = themeIdx > -1 ? rest.filter((_, i) => i !== themeIdx && i !== themeIdx + 1) : rest;
const wantLabel = rest.includes('--label');
rest = rest.filter((x) => x !== '--label');
const [cmd, ...a] = rest;

const USAGE = `guitar-diagrams-cli.mjs

  chord <Name>            vertical chord box          e.g. chord Am
  string <kind>           12-fret single string       e.g. string A
                          kinds: ${Object.keys(GD.STRING_KIND_TO_NUM).join(' ')}
  naturals <kind> [max]   6-string board, naturals     e.g. naturals A
                          circled on one string       e.g. naturals D 10
                          (max fret defaults to 12)
  notes <kind> <list>     6-string board, an explicit  e.g. notes lowE
                          fret:label list circled on   "0:E,2:F#,4:G#,5:A"
                          one string (sharps OK)
  note <kind> <fret> <N>  one note on the fretboard   e.g. note A 7 E
  sheet [Name ...]        contact sheet of chords
  list                    chord names in the library

  -o, --out <file>    write .svg or .png (png needs sharp)
      --label         chord name above the box
      --theme <t>     slide (default) | web`;

const opts = { theme };
let svg = null;
if (cmd === 'chord')       svg = GD.chordSvg(a[0], { ...opts, label: wantLabel ? a[0] : undefined });
else if (cmd === 'string') svg = GD.localStringFretboardSvg(a[0], opts);
else if (cmd === 'naturals') svg = GD.localStringNaturalsSvg(a[0], { ...opts, maxFret: a[1] ? Number(a[1]) : undefined });
else if (cmd === 'notes') svg = GD.localStringNotesSvg(a[0], (a[1] || '').split(',').map((pair) => {
  const [fret, label] = pair.split(':');
  return [Number(fret), label];
}), opts);
else if (cmd === 'note')   svg = GD.localNoteSvg(a[0], a[1], a[2], opts);
else if (cmd === 'sheet')  svg = GD.chordSheetSvg(a, opts);
else if (cmd === 'list') { console.log(Object.keys(GD.CHORD_DIAGRAMS).join(' ')); process.exit(0); }
else { console.log(USAGE); process.exit(cmd ? 1 : 0); }

if (!svg) {
  console.error(`Nothing to render for: ${rest.join(' ')}\n`);
  console.error(`Known chords:  ${Object.keys(GD.CHORD_DIAGRAMS).join(' ')}`);
  console.error(`Known strings: ${Object.keys(GD.STRING_KIND_TO_NUM).join(' ')}`);
  process.exit(1);
}

if (!out) { console.log(svg); process.exit(0); }

if (out.endsWith('.png')) {
  const sharp = await loadSharp();
  if (!sharp) {
    console.error('PNG output needs sharp — run `npm i -g sharp`, or write .svg instead.');
    process.exit(1);
  }
  await sharp(Buffer.from(svg)).png().toFile(out);
} else {
  writeFileSync(out, svg);
}
console.error(`wrote ${out}`);
