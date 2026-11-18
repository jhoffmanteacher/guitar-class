/* Jonathan's own takes from LOCAL RECORDING MODE (2026-11-14; coach-recordings.js micRecLocal: the site served from his own computer, the
   dev-bypass button, each round saved as take-<game>-<YYYYMMDD-HHMMSS>.wav + .json). These are the teacher's own playing, never a
   student's: the files carry no name and no uid (the site leaves both out), and this tool checks that before it copies anything.

     node tools/mic-sim/local-takes-in.mjs <folder> --note="<what you played>"   [--out=<folder>]

   It copies every complete pair in <folder> into the take set, `Claude outputs/takes-anon/` in the main checkout (or --out), as
   J01.wav / J01.json, J02..., the next free numbers (J = Jonathan's own; the student takes are T01...; the console's evaluator and
   takes-in.mjs read T files only). Each JSON gains teacherOwn: true, answerNote (the --note text, so a later replay knows what was
   meant: "played right", "D5 instead of G5 in bar 5", ...) and source (the original file name). A pair already copied (same .wav
   bytes) is skipped. It prints counts only, never a file's contents.
   Exit 2: no folder, no --note, a file that is not one of these takes (no localTake mark), or a JSON holding a uid / name / email. */
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';

const args = process.argv.slice(2);
const bad = m => { console.error('local-takes-in: ' + m); process.exit(2); };
const folder = args.find(a => !a.startsWith('--'));
const opt = k => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
for (const a of args) if (a.startsWith('--') && !/^--(note|out)=/.test(a)) bad('unknown option ' + a);
if (!folder) bad('name the folder that holds the take-*.wav / take-*.json pairs');
const note = opt('note');
if (!note || !note.trim()) bad('--note="<what you played>" is required (it is the answer note a later replay reads)');
let out = opt('out');
if (!out) {
  const common = execFileSync('git', ['rev-parse', '--path-format=absolute', '--git-common-dir'], { encoding: 'utf8' }).trim();
  out = join(dirname(common), 'Claude outputs', 'takes-anon');
}
const dir = resolve(folder);
if (!existsSync(dir)) bad('no such folder');
mkdirSync(out, { recursive: true });
const pairs = readdirSync(dir).filter(f => /^take-[A-Za-z0-9]+-\d{8}-\d{6}(-\d+)?\.json$/.test(f)).filter(f => existsSync(join(dir, f.replace(/\.json$/, '.wav'))));
const have = new Set(readdirSync(out).filter(f => /^J\d+\.wav$/.test(f)).map(f => createHash('sha1').update(readFileSync(join(out, f))).digest('hex')));
let next = 1 + Math.max(0, ...readdirSync(out).map(f => (/^J(\d+)\.wav$/.exec(f) || [])[1]).filter(Boolean).map(Number));
let copied = 0, skipped = 0;
const games = {}, todo = [];
// Every pair is checked before any is copied: one bad file copies nothing.
for (const f of pairs) {
  const wav = readFileSync(join(dir, f.replace(/\.json$/, '.wav')));
  const h = createHash('sha1').update(wav).digest('hex');
  if (have.has(h)) { skipped++; continue; }
  let d;
  try { d = JSON.parse(readFileSync(join(dir, f), 'utf8')); } catch (e) { bad('a JSON that does not read: one of the take files; nothing copied'); }
  if (d.localTake !== true) bad('a JSON without the local-take mark: only files from local recording mode are taken; nothing copied');
  if ('uid' in d || 'name' in d || 'email' in d) bad('a JSON holding a uid, name or email; nothing copied');
  have.add(h); todo.push({ f, wav, d });
}
for (const { f, wav, d } of todo) {
  const id = 'J' + String(next++).padStart(2, '0');
  Object.assign(d, { teacherOwn: true, answerNote: note.trim(), source: f });
  writeFileSync(join(out, id + '.wav'), wav);
  writeFileSync(join(out, id + '.json'), JSON.stringify(d, null, 2));
  copied++;
  const g = String(d.game || d.mode || '?'); games[g] = (games[g] || 0) + 1;
}
console.log(`local-takes-in: ${pairs.length} complete pair(s) in the folder; copied ${copied} (${Object.entries(games).map(([g, n]) => g + ' ' + n).join(', ') || 'none'}), skipped ${skipped} already there; take set: ${out}`);
