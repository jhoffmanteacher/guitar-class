/* Anonymize the console's mic recordings BEFORE anyone else sees them.
   The teacher runs this on his own machine; only the output folder is
   handed on.
     node tools/mic-sim/anon-takes.mjs <raw-folder> <out-folder>

   Pairs <base>.wav + <base>.json, sorts the pairs newest first by the
   JSON's savedAt (the console's own order, so T01 = newest), and writes
   <out>/T01.wav + T01.json, T02…, with the audio copied byte for byte.

   Removed from each JSON, at any depth:
   - every key matching ID_KEY (name, uid, email, user, student,
     displayName, photo) — except userAgent, which is the device info the
     eval groups by and holds no person;
   - `id`, the Firestore doc id, which is `<uid>-<mode>`;
   - from micLabel, a leading "Maria's " / trailing " de Maria" (the same
     scrub as coach.js micRecMicName, for takes saved before it existed).
   Then every string left is checked for any removed value; a hit stops the
   run before anything is written.

   Prints counts only — never a filename, a path, or a field value. */
import fs from 'fs';
import path from 'path';

const ID_KEY = /name|uid|email|user|student|displayName|photo/i;
const KEEP_KEY = /^userAgent$/;
const DROP_KEY = /^id$/;

function fail(msg){ console.error('anon-takes: ' + msg); process.exit(1); }

const [rawDir, outDir] = process.argv.slice(2);
if (!rawDir || !outDir) fail('usage: node tools/mic-sim/anon-takes.mjs <raw-folder> <out-folder>');
const rawAbs = path.resolve(rawDir), outAbs = path.resolve(outDir);
if (rawAbs === outAbs) fail('the output folder must be a different folder from the raw one');
if (outAbs.startsWith(rawAbs + path.sep)) fail('the output folder must not be inside the raw folder');

let names;
try { names = fs.readdirSync(rawAbs); } catch(e){ fail('could not read the raw folder'); }
const bases = ext => new Set(names.filter(f => f.toLowerCase().endsWith(ext)).map(f => f.slice(0, -ext.length)));
const wavs = bases('.wav'), jsons = bases('.json');
const lonelyWav = [...wavs].filter(b => !jsons.has(b)).length;
if (lonelyWav) fail(lonelyWav + ' .wav file(s) have no .json partner — download "data" for each, then re-run');
const lonelyJson = [...jsons].filter(b => !wavs.has(b)).length;
if (!wavs.size) fail('no .wav + .json pairs found');

function micName(label){
  return String(label || '')
    .replace(/^.*?['’]s\s+/i, '')
    .replace(/\s+de\s+\p{Lu}[^\s()]*(?:\s+\p{Lu}[^\s()]*)*/gu, '');
}

// Strip one JSON, collecting every removed string so the leak check can
// look for it anywhere else in the file.
function scrub(v, removed, stats){
  if (Array.isArray(v)) return v.map(x => scrub(x, removed, stats));
  if (!v || typeof v !== 'object') return v;
  const o = {};
  for (const k of Object.keys(v)){
    if ((ID_KEY.test(k) && !KEEP_KEY.test(k)) || DROP_KEY.test(k)){
      collect(v[k], removed); stats.n++; continue;
    }
    if (k === 'micLabel' && typeof v[k] === 'string'){
      const clean = micName(v[k]);
      if (clean !== v[k]){ removed.push(v[k].slice(0, v[k].length - clean.length).replace(/['’]s\s*$/i, '').trim()); stats.n++; }
      o[k] = clean; continue;
    }
    o[k] = scrub(v[k], removed, stats);
  }
  return o;
}
function collect(v, out){
  if (typeof v === 'string' || typeof v === 'number') out.push(String(v));
  else if (v && typeof v === 'object') Object.values(v).forEach(x => collect(x, out));
}
function strings(v, out){
  if (typeof v === 'string') out.push(v);
  else if (v && typeof v === 'object') Object.keys(v).forEach(k => { out.push(k); strings(v[k], out); });
  return out;
}
// A uid / id is also matched by its uid half (before "-coach" / "-nr").
function needles(removed){
  const s = new Set();
  removed.forEach(r => {
    r = r.trim(); if (r.length < 3) return;
    s.add(r.toLowerCase());
    const uidPart = r.replace(/-[a-z]+$/i, ''); if (uidPart.length >= 3) s.add(uidPart.toLowerCase());
    r.split(/[\s@.]+/).forEach(w => { if (w.length >= 3) s.add(w.toLowerCase()); });
  });
  return [...s];
}

const pairs = [];
let bad = 0;
for (const b of wavs){
  let d;
  try { d = JSON.parse(fs.readFileSync(path.join(rawAbs, b + '.json'), 'utf8')); } catch(e){ bad++; continue; }
  const t = Date.parse(d && d.savedAt) || 0;
  pairs.push({ b, d, t });
}
if (bad) fail(bad + ' .json file(s) could not be read as JSON');
pairs.sort((x, y) => y.t - x.t);
const undated = pairs.filter(p => !p.t).length;

const out = [];
const removedCounts = [];
let leaks = 0;
pairs.forEach((p, k) => {
  const removed = [], stats = { n: 0 };
  const clean = scrub(p.d, removed, stats);
  const hay = strings(clean, []).map(s => s.toLowerCase());
  // Ignore needles that are ordinary values the eval keeps (a mode word,
  // a number) — only a removed value of 3+ chars that is not itself a
  // kept value counts.
  const kept = new Set(hay);
  const hit = needles(removed).some(n => !kept.has(n) ? hay.some(h => h.includes(n)) : false);
  if (hit) leaks++;
  removedCounts.push(stats.n);
  out.push({ label: 'T' + String(k + 1).padStart(2, '0'), b: p.b, clean });
});
if (leaks) fail(leaks + ' file(s) still contain a removed value somewhere else in the JSON — nothing written');

try { fs.mkdirSync(outAbs, { recursive: true }); } catch(e){ fail('could not create the output folder'); }
const already = fs.readdirSync(outAbs).filter(f => /^T\d+\.(wav|json)$/i.test(f)).length;
if (already) fail('the output folder already has ' + already + ' T##.wav/.json file(s) — use an empty folder');
try {
  out.forEach(o => {
    fs.copyFileSync(path.join(rawAbs, o.b + '.wav'), path.join(outAbs, o.label + '.wav'));
    fs.writeFileSync(path.join(outAbs, o.label + '.json'), JSON.stringify(o.clean, null, 1));
  });
} catch(e){ fail('could not write the output files'); }

const lo = Math.min(...removedCounts), hi = Math.max(...removedCounts);
console.log(out.length + ' pairs → T01–' + out[out.length - 1].label + ', ' +
  (lo === hi ? lo : lo + '–' + hi) + ' fields removed per file');
if (lonelyJson) console.log(lonelyJson + ' .json file(s) with no .wav were ignored');
if (undated) console.log(undated + ' pair(s) had no savedAt and were put last');
