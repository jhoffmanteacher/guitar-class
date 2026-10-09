/* Evaluate consented mic recordings (micTakes) on downloaded files — the
   same measurements as the teacher console's "Evaluate all recordings"
   button (Mic recordings view), whose functions (micEvalTake, micEvalRow,
   micEvalDevice, micEvalText in teacher.js) this pulls out and runs. See the
   comment above micEvalTake for what is measured and why.

   Input: the console's "Download WAV" + "Download data" files, pairs sharing
   a base name (mic-coach-Name-2026-10-08-10-00.wav + .json):
     node tools/mic-sim/eval-takes.mjs <folder-or-files…> [--json out.json]

   Judged with the site's own coachDetectPitch / COACH_PITCH_GATE /
   COACH_MIC_GAIN, pulled out of coach.js at run time. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { extract } from './extract.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..', '..');
const coachSrc = fs.readFileSync(path.join(root, 'coach.js'), 'utf8');
const constOf = n => { const m = coachSrc.match(new RegExp('^const ' + n + '\\s*=\\s*([^;]+);', 'm')); if (!m) throw new Error('no ' + n + ' in coach.js'); return m[1].trim(); };
const pitchSrc = extract(coachSrc, 'coachDetectPitch');
const depsSrc = `{ GATE: ${constOf('COACH_PITCH_GATE')}, GAIN: ${constOf('COACH_MIC_GAIN')},
  detectPitch: (function(){ let coachYinD = null; ${pitchSrc}\n return coachDetectPitch; })() }`;
const teacherSrc = fs.readFileSync(path.join(root, 'teacher.js'), 'utf8');
const core = new Function(['micEvalTake', 'micEvalDevice', 'micEvalRow', 'micEvalText'].map(n => extract(teacherSrc, n)).join('\n') +
  '\nreturn { micEvalTake, micEvalDevice, micEvalRow, micEvalText };')();

const args = process.argv.slice(2);

const deps = new Function('return ' + depsSrc)();

let jsonOut = null;
const inputs = [];
for (let i = 0; i < args.length; i++){
  if (args[i] === '--json') jsonOut = args[++i];
  else inputs.push(args[i]);
}
if (!inputs.length){ console.error('usage: node eval-takes.mjs <folder-or-files…> [--json out.json]'); process.exit(2); }

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
