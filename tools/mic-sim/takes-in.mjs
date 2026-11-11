/* ONE COMMAND to bring new classroom takes into the closed-loop tests (2026-11-11).

     node tools/mic-sim/takes-in.mjs [what]

   `what` is the recordings as they come from the teacher console (Mic recordings: Download WAV + Download data): a folder of them, or a .zip of
   them. Left out, it takes the newest mic-recordings*.zip in ~/Downloads, then ~/Documents. An already anonymized folder (T01.wav ...) works too.

   What it does, in order, with nothing else to run:
     1. unzips into a temporary folder (a .zip only);
     2. anonymizes into a second temporary folder (tools/mic-sim/anon-takes.mjs: names, ids and labels are removed, and it stops if one is left);
     3. evaluates every take (tools/mic-sim/eval-takes.mjs, the console's own evaluator) for the truth;
     4. writes one SUMMARY per Power Chord Switch take into tools/mic-sim/takes/<fingerprint>.json: loudness and attack energy 94 times a second,
        the pitch the site's detector reads at each of those points, the game's own numbers and the evaluator's truth. No audio, no name, no id, no
        device label, no time of day (the day and the class period are kept). The fingerprint is a hash of the audio, so a take brought in twice is
        one file;
     5. checks itself: replays the base rule from the audio and from the new summaries and prints how often they agree, per take set;
     6. deletes both temporary folders (the audio never enters the repo);
     7. commits the summaries, and only them (git commit -- tools/mic-sim/takes). It does not push: `git push` after it, or tell Claude.
   --no-commit skips step 7. Other games' takes (Listening Coach, Note Runner) are counted and skipped: only Power Chord Switch has a replay so far.

   It prints counts and fingerprints only: never a name, a file name from the console, or a path inside the recordings. */
import { readdirSync, statSync, mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadAudio, loadSummaries, summarize, replayAll, todayRatios, askReasons, baseSite, TAKES_DIR } from './replay-takes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const fail = m => { console.error('takes-in: ' + m); process.exit(1); };
const args = process.argv.slice(2);
let what = args.find(a => !a.startsWith('--'));
if (!what){
  const found = [];
  for (const dir of [join(homedir(), 'Downloads'), join(homedir(), 'Documents')]){
    let names = [];
    try { names = readdirSync(dir); } catch (e){ continue; }
    names.filter(f => /^mic-recordings.*\.zip$/i.test(f)).forEach(f => found.push({ p: join(dir, f), t: statSync(join(dir, f)).mtimeMs }));
    if (found.length) break;
  }
  if (!found.length) fail('no mic-recordings*.zip in Downloads or Documents. Download the recordings from the console (Mic recordings), or give the folder or zip: node tools/mic-sim/takes-in.mjs <folder or zip>');
  what = found.sort((a, b) => b.t - a.t)[0].p;
  console.log('using the newest recordings zip in ' + dirname(what).replace(homedir(), '~'));
}
what = resolve(what);
if (!existsSync(what)) fail('that folder or zip does not exist');

const temps = [];
const temp = tag => { const d = mkdtempSync(join(tmpdir(), 'takes-in-' + tag + '-')); temps.push(d); return d; };
const cleanup = () => temps.forEach(d => { try { rmSync(d, { recursive: true, force: true }); } catch (e){} });
process.on('exit', cleanup);

try {
  let raw = what;
  if (/\.zip$/i.test(what)){
    raw = temp('raw');
    const z = spawnSync('unzip', ['-q', '-o', '-j', what, '-d', raw], { encoding: 'utf8' });
    if (z.status !== 0) fail('could not unzip it (is `unzip` installed?)');
  } else if (!statSync(what).isDirectory()) fail('give a folder or a .zip');
  const anon = join(temp('anon'), 'a');
  const an = spawnSync(process.execPath, [join(HERE, 'anon-takes.mjs'), raw, anon], { encoding: 'utf8' });
  if (an.status !== 0) fail('the anonymizer stopped, so nothing was written: ' + (an.stderr || '').trim());
  console.log('anonymized: ' + (an.stdout || '').trim().split('\n')[0]);

  const { takes, total } = loadAudio(anon);
  console.log(`${total} takes in all; ${takes.length} are Power Chord Switch (the others have no replay yet and are skipped)`);
  if (!takes.length) fail('no Power Chord Switch takes in there: nothing to add');

  mkdirSync(TAKES_DIR, { recursive: true });
  const before = new Set(loadSummaries(TAKES_DIR).map(t => t.id));
  let added = 0, same = 0;
  for (const tk of takes){
    const s = summarize(tk);
    writeFileSync(join(TAKES_DIR, tk.id + '.json'), JSON.stringify(s));
    if (before.has(tk.id)) same++; else added++;
    process.stderr.write('.');
  }
  process.stderr.write('\n');

  // the self-check: the base rule, from the audio and from the summaries just written
  const NOW = todayRatios(), ids = new Set(takes.map(t => t.id));
  const fromSum = loadSummaries(TAKES_DIR).filter(t => ids.has(t.id));
  replayAll(takes, ['base'], NOW); replayAll(fromSum, ['base'], NOW);
  let n = 0, eq = 0, eqHeard = 0;
  const heard = v => v.verdict !== 'miss';
  for (const a of takes){
    const b = fromSum.find(t => t.id === a.id);
    for (const key of ['base@own', 'base@now']) for (const i of Object.keys(a.res[key])){
      const x = a.res[key][i], y = b.res[key][i];
      n++; if (y && x.verdict === y.verdict) eq++; if (y && heard(x) === heard(y)) eqHeard++;
    }
  }
  console.log(`self-check: the replay from the summaries gives the same verdict as the replay from the audio on ${eq} of ${n} changes (heard / not heard: ${eqHeard} of ${n})`);
  const all = loadSummaries(TAKES_DIR);
  console.log(`summaries: ${added} new, ${same} already there (rewritten) · ${all.length} in tools/mic-sim/takes/ now`);

  cleanup();
  if (!args.includes('--no-commit')){
    const git = a => spawnSync('git', a, { cwd: HERE, encoding: 'utf8' });
    git(['add', '--', TAKES_DIR]);
    if (git(['diff', '--cached', '--quiet', '--', TAKES_DIR]).status === 0) console.log('git: nothing new to commit');
    else {
      const c = git(['commit', '-m', `Take summaries: ${added} new Power Chord Switch takes (${all.length} in all)\n\nMade by tools/mic-sim/takes-in.mjs. No audio and no names: loudness, attack energy and detector pitch per 512 samples,\nthe game's numbers and the evaluator's truth.`, '--', TAKES_DIR]);
      console.log(c.status === 0 ? 'git: committed the summaries (not pushed: run `git push`, or tell Claude)' : 'git: the commit did not go through; the files are written, commit them by hand:\n' + (c.stderr || c.stdout || '').trim().split('\n').slice(-3).join('\n'));
    }
  }
  const why = askReasons(all, baseSite());
  console.log(why.length ? 'still worth more takes later:\n' + why.map(w => '  - ' + w).join('\n') : 'the takes are current.');
  console.log('next: node tools/mic-sim/replay-takes.mjs   (any session can run it now)');
} finally { cleanup(); }
