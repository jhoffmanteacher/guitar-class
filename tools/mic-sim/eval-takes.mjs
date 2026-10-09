/* Evaluate consented mic recordings (micTakes) — see eval-core.js for what
   is measured and why.

   Two ways in:

   1. In the browser, on the teacher console (the only place that can read
      micTakes — the Firestore rules let the teacher's account read them and
      nobody else). Build the snippet once:
        node tools/mic-sim/eval-takes.mjs --snippet > mic-eval-snippet.js
      Open the site as the teacher (?teacher=true), open DevTools
      (Ctrl+Shift+J / Cmd+Option+J), paste the file's contents, Enter. It
      reads every take, prints the table, and downloads
      mic-eval-<date>.json: the analysis only — no audio, no names (takes
      are T01, T02…; the console prints which student is which, for the
      teacher's eyes only).

   2. In Node, on files from the console's "Download WAV" + "Download data"
      buttons (pairs sharing a base name, mic-coach-Name-2026-10-08-10-00.wav
      + .json):
        node tools/mic-sim/eval-takes.mjs <folder-or-files…> [--json out.json]

   Both judge with the site's own coachDetectPitch / COACH_PITCH_GATE /
   COACH_MIC_GAIN, pulled out of coach.js at run (or build) time. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { extract } from './extract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const coachSrc = fs.readFileSync(path.join(root, 'coach.js'), 'utf8');
const constOf = n => { const m = coachSrc.match(new RegExp('^const ' + n + '\\s*=\\s*([^;]+);', 'm')); if (!m) throw new Error('no ' + n + ' in coach.js'); return m[1].trim(); };
const pitchSrc = extract(coachSrc, 'coachDetectPitch');
const depsSrc = `{ GATE: ${constOf('COACH_PITCH_GATE')}, GAIN: ${constOf('COACH_MIC_GAIN')},
  detectPitch: (function(){ let coachYinD = null; ${pitchSrc}\n return coachDetectPitch; })() }`;
const coreSrc = fs.readFileSync(path.join(here, 'eval-core.js'), 'utf8');

const args = process.argv.slice(2);

if (args[0] === '--snippet'){
  process.stdout.write(`/* Mic recordings evaluator — paste into DevTools on the teacher console.
   Built ${new Date().toISOString().slice(0, 10)} by tools/mic-sim/eval-takes.mjs --snippet.
   Reads every micTakes recording, prints a table, downloads mic-eval-<date>.json
   (analysis only: no audio, no names). */
(async () => {
${coreSrc.replace(/^if \(typeof module.*$/m, '')}
const deps = ${depsSrc};
if (typeof ensureDb === 'function') await ensureDb();
if (typeof db === 'undefined' || !db){ console.error('Open the site as the teacher first (index.html?teacher=true).'); return; }
const snap = await db.collection('micTakes').get();
const docs = snap.docs.map(s => Object.assign({ id: s.id }, s.data()));
docs.sort((a, b) => ((a.savedAt && a.savedAt.toMillis && a.savedAt.toMillis()) || 0) - ((b.savedAt && b.savedAt.toMillis && b.savedAt.toMillis()) || 0));
console.log('Mic recordings: ' + docs.length + ' takes. Analysing…');
const rows = [], key = [];
for (let k = 0; k < docs.length; k++){
  const d = docs[k], label = 'T' + String(k + 1).padStart(2, '0');
  try {
    const ref = db.collection('micTakes').doc(d.id).collection('chunks');
    const parts = [];
    for (let c = 0; c < (d.chunks || 0); c++){
      const s = await ref.doc(String(c)).get();
      if (!s.exists) throw new Error('chunk ' + c + ' missing');
      parts.push(s.data().pcm.toUint8Array());
    }
    const len = parts.reduce((a, p) => a + p.length, 0);
    const bytes = new Uint8Array(len); let o = 0; parts.forEach(p => { bytes.set(p, o); o += p.length; });
    const pcm = new Int16Array(bytes.buffer, 0, len >> 1);
    const meta = Object.assign({}, d, { savedAt: d.savedAt && d.savedAt.toDate ? d.savedAt.toDate().toISOString() : null });
    rows.push(micEvalRow(label, meta, pcm, deps));
    key.push({ take: label, student: d.name || d.uid, game: d.mode, saved: meta.savedAt });
  } catch(e){ console.warn(label + ' (' + (d.name || d.id) + '): ' + (e && e.message)); }
  await new Promise(r => setTimeout(r, 0));
}
console.log(micEvalText(rows));
console.log('Which student is which (stays on this computer — not in the download):');
console.table(key);
const blob = new Blob([JSON.stringify({ generated: new Date().toISOString(), takes: rows.length, rows }, null, 1)], { type: 'application/json' });
const a = document.createElement('a');
a.href = URL.createObjectURL(blob); a.download = 'mic-eval-' + new Date().toISOString().slice(0, 10) + '.json';
document.body.appendChild(a); a.click(); a.remove();
console.log('Downloaded ' + a.download + ' — send that file back for the write-up.');
})();
`);
  process.exit(0);
}

const require = createRequire(import.meta.url);
const core = require(path.join(here, 'eval-core.js'));
const deps = new Function('return ' + depsSrc)();

let jsonOut = null;
const inputs = [];
for (let i = 0; i < args.length; i++){
  if (args[i] === '--json') jsonOut = args[++i];
  else inputs.push(args[i]);
}
if (!inputs.length){ console.error('usage: node eval-takes.mjs <folder-or-files…> [--json out.json] | --snippet'); process.exit(2); }

const files = [];
for (const p of inputs){
  if (fs.statSync(p).isDirectory()) fs.readdirSync(p).forEach(f => files.push(path.join(p, f)));
  else files.push(p);
}
function readWav(file){
  const b = fs.readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WAVE') throw new Error('not a WAV');
  let o = 12, rate = 24000, data = null;
  while (o + 8 <= b.length){
    const id = b.toString('ascii', o, o + 4), sz = b.readUInt32LE(o + 4);
    if (id === 'fmt '){
      if (b.readUInt16LE(o + 8) !== 1 || b.readUInt16LE(o + 10) !== 1 || b.readUInt16LE(o + 22) !== 16) throw new Error('expected 16-bit mono PCM');
      rate = b.readUInt32LE(o + 12);
    }
    if (id === 'data'){ data = b.subarray(o + 8, o + 8 + sz); break; }
    o += 8 + sz + (sz & 1);
  }
  if (!data) throw new Error('no data chunk');
  const pcm = new Int16Array(data.length >> 1);
  for (let i = 0; i < pcm.length; i++) pcm[i] = data.readInt16LE(2 * i);
  return { pcm, rate };
}
const wavs = files.filter(f => /\.wav$/i.test(f)).sort();
const rows = [];
wavs.forEach((w, k) => {
  const j = w.replace(/\.wav$/i, '.json');
  const label = 'T' + String(k + 1).padStart(2, '0');
  if (!fs.existsSync(j)){ console.warn(label + ': no ' + path.basename(j) + ' beside ' + path.basename(w) + ' — skipped'); return; }
  try {
    const { pcm, rate } = readWav(w);
    const d = JSON.parse(fs.readFileSync(j, 'utf8'));
    d.sampleRate = rate;
    rows.push(core.micEvalRow(label, d, pcm, deps));
    console.error(label + ' = ' + path.basename(w));
  } catch(e){ console.warn(label + ' (' + path.basename(w) + '): ' + e.message); }
});
console.log(core.micEvalText(rows));
if (jsonOut){
  fs.writeFileSync(jsonOut, JSON.stringify({ generated: new Date().toISOString(), takes: rows.length, rows }, null, 1));
  console.error('wrote ' + jsonOut);
}
