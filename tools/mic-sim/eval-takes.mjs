/* Evaluate consented mic recordings (micTakes) on downloaded files — the
   same measurements as the teacher console's "Evaluate all recordings"
   button (Mic recordings view), whose functions (micEvalSignal, micEvalTake,
   micEvalTakePw, micEvalRow, micEvalDevice, micEvalText in teacher.js) this
   pulls out and runs. See the comments above micEvalTake (Listening Coach,
   Note Runner) and micEvalTakePw (Power Chord Switch: strums against the
   site's verdicts, per round) for what is measured and why. Synthetic takes
   with known answers: fake-take.mjs, fake-pw-take.mjs.

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
  ATTACK_SKIP: ${constOf('COACH_ATTACK_SKIP')}, EVENT_TAIL: ${constOf('COACH_EVENT_TAIL')}, REFRACT: ${constOf('COACH_ONSET_REFRACT')},
  MATCH_FRAC: ${constOf('COACH_MATCH_FRAC')}, MATCH_MIN_MS: ${constOf('COACH_MATCH_MIN_MS')}, VOTE_TOL: ${constOf('COACH_VOTE_TOL')},
  detectPitch: (function(){ let coachYinD = null; ${pitchSrc}\n return coachDetectPitch; })() }`;
const teacherSrc = fs.readFileSync(path.join(root, 'teacher.js'), 'utf8');
const core = new Function(['micEvalSignal', 'micEvalTake', 'micEvalTakePw', 'micEvalStrumRule', 'micEvalStrumFrames', 'micEvalStrumHits', 'micEvalMicName', 'micEvalDevice', 'micEvalRow',
  'micEvalWhatIfSummary', 'micEvalWhatIfText', 'micEvalPitchSummary', 'micEvalPitchText', 'micEvalText'].map(n => extract(teacherSrc, n)).join('\n') +
  '\nreturn { micEvalTake, micEvalDevice, micEvalRow, micEvalText, micEvalWhatIfSummary, micEvalPitchSummary };')();

const args = process.argv.slice(2);

const deps = new Function('return ' + depsSrc)();
// The site's own strum rule for the Power Chord Switch what-if (teacher.js micEvalStrumRule): its numbers and the text of three coach.js functions
const numOf = n => { const m = coachSrc.match(new RegExp('^const [^\\n]*?\\b' + n + '\\s*=\\s*([\\d.]+)', 'm')); if (!m) throw new Error('no ' + n + ' in coach.js'); return Number(m[1]); };
deps.strum = { consts: { FLOOR: numOf('CHK_ONSET_FLOOR'), RATIO: numOf('CHK_ONSET_RATIO'), HF_FLOOR: numOf('CHK_HF_FLOOR'), HF_RATIO: numOf('CHK_HF_RATIO'),
  REFRACT: numOf('COACH_ONSET_REFRACT'), WIN: numOf('COACH_LVL_WIN'), HOP: numOf('COACH_LVL_HOP'), CATCHUP: numOf('COACH_CATCHUP_MAX_MS') },
  ccLoopSrc: extract(coachSrc, 'ccLoop'), readFrameSrc: extract(coachSrc, 'coachReadFrame'), smoothSrc: extract(coachSrc, 'coachSmooth') };

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
console.log('\n' + whyText(rows));

/* Per-note reason (teacher.js micEvalWhy) for every note the site did not
   count, then the category totals over every note. */
function whyText(rows){
  const pad = (v, w) => { const s = v == null ? '-' : String(v); return s.length >= w ? s.slice(0, w) : s + ' '.repeat(w - s.length); };
  const cols = [['take', 5], ['game', 16], ['i', 3], ['site', 8], ['why', 16], ['detail', 22], ['siteN', 6], ['winN', 5], ['lateN', 6], ['lateHit', 7], ['share', 6], ['replay', 8], ['exact', 6]];
  const out = [cols.map(c => pad(c[0], c[1])).join(' ')];
  const tot = {}, totBy = {};
  rows.forEach(r => (r.perNote || []).forEach(n => {
    const w = n.why || {};
    tot[w.cat] = (tot[w.cat] || 0) + 1;
    const g = r.game.indexOf('Coach') === 0 ? 'Coach' : r.kind === 'pw' ? 'Power Chord Switch' : 'Note Runner';
    (totBy[g] = totBy[g] || {})[w.cat] = (totBy[g][w.cat] || 0) + 1;
    // a Power Chord Switch change (teacher.js micEvalTakePw): listed unless the site and the recording agree
    if (w.cat === 'counted' || w.cat === 'wrong' || w.cat === 'agree') return;
    const detail = r.kind === 'pw' ? 'round ' + (n.stage + 1) + (n.onsetMs != null ? ' strum ' + (n.onsetMs > 0 ? '+' : '') + n.onsetMs + 'ms' : '')
      : [w.detail, w.devMs != null ? (w.devMs > 0 ? '+' : '') + w.devMs + 'ms' : null,
        w.audio != null ? 'audio ' + (w.audio ? 'yes' + (w.audioDevMs != null ? ' ' + (w.audioDevMs > 0 ? '+' : '') + w.audioDevMs : '') : 'no') : null].filter(Boolean).join(' ');
    out.push([r.take, r.game, n.i, n.site, w.cat, detail, w.siteN, w.winN, w.lateN, w.lateHit, w.share, n.replay, n.exact].map((v, k) => pad(v, cols[k][1])).join(' '));
  }));
  const fmt = h => Object.entries(h).sort((a, b) => b[1] - a[1]).map(([k, v]) => k + ' ' + v).join(' · ');
  out.push('', 'all ' + rows.reduce((a, r) => a + (r.perNote || []).length, 0) + ' notes: ' + fmt(tot));
  Object.keys(totBy).forEach(g => out.push('  ' + g + ': ' + fmt(totBy[g])));
  out.push('', 'siteN  readings the site collected for the note (consensus and vote need 2)',
    'winN   readings the replay finds in the same window on the site\'s own 40 ms schedule',
    'lateN  ...in the 400 ms after the window (short of the next beat); lateHit = how many are the target note');
  return out.join('\n');
}
if (jsonOut){
  fs.writeFileSync(jsonOut, JSON.stringify({ generated: new Date().toISOString(), takes: rows.length, strumWhatIf: core.micEvalWhatIfSummary(rows), pitchRule: core.micEvalPitchSummary(rows), rows }, null, 1));
  console.error('wrote ' + jsonOut);
}
