/* ONE COMMAND to bring new classroom takes into the closed-loop tests (2026-11-11).

     node tools/mic-sim/takes-in.mjs [what]

   `what` is the recordings as they come from the teacher console (Mic recordings: Download WAV + Download data): a folder of them, or a .zip of
   them. Left out, it takes the newest mic-recordings*.zip in ~/Downloads, then ~/Documents. An already anonymized folder (T01.wav ...) works too.

   What it does, in order, with nothing else to run:
     1. unzips into a temporary folder (a .zip only);
     2. anonymizes into a second temporary folder (tools/mic-sim/anon-takes.mjs: names, ids and labels are removed, and it stops if one is left);
     3. evaluates every take (tools/mic-sim/eval-takes.mjs, the console's own evaluator) for the truth;
     4. writes one SUMMARY per take into tools/mic-sim/takes/<fingerprint>.json: loudness and attack energy 94 times a second, the pitch the
        site's detector reads at each of those points, the game's own numbers and the evaluator's truth. No audio, no name, no id, no device
        label, no time of day (the day and the class period are kept). The fingerprint is a hash of the audio, so a take brought in twice is
        one file. Power Chord Switch: replay-takes.mjs summarize (pitch at RNW_POWER_CLARITY and 0.55), unchanged. Listening Coach and Note
        Runner (since 2026-11-12): replay-listen.mjs summarizeListen, with `kind` (coach-melody / coach-chords / nr), pitch at the plain 0.22
        gate the melody listeners use and at 0.55 (chords), the expected notes with the site's saved verdicts, its events with their pitch
        readings, the evaluator's truth per note (an attack there, the note clearly in the recording, its reason), the detector stamp and the
        measuring constants (`measured`);
     5. checks itself: replays the base rule (Power Chord Switch) and the real Coach / Note Runner loops from the audio and from the new
        summaries and prints how often they agree;
     6. deletes both temporary folders (the audio never enters the repo);
     7. commits the summaries, and only them (git commit -- tools/mic-sim/takes). It does not push: `git push` after it, or tell Claude.
   --no-commit skips step 7. --games=pw,coach,nr (default all three) writes only those games' summaries: --games=coach,nr brings in the Coach and
   Note Runner takes without rewriting the Power Chord Switch summaries already in the repo.

   It prints counts and fingerprints only: never a name, a file name from the console, or a path inside the recordings. */
import { readdirSync, statSync, mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { tmpdir, homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { loadAudio, loadSummaries, summarize, replayAll, todayRatios, askReasons, baseSite, TAKES_DIR } from './replay-takes.mjs';
import { summarizeListen, loadListenSummaries, replayAllListen } from './replay-listen.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const fail = m => { console.error('takes-in: ' + m); process.exit(1); };
const args = process.argv.slice(2);
const gamesArg = (args.find(a => a.startsWith('--games=')) || '--games=pw,coach,nr').slice(8).split(',');
for (const a of args.filter(x => x.startsWith('--'))) if (a !== '--no-commit' && !a.startsWith('--games=')) fail('unknown option ' + a);
if (gamesArg.some(g => !['pw', 'coach', 'nr'].includes(g))) fail('--games takes pw, coach and nr');
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

  const loaded = loadAudio(anon, true), total = loaded.total;
  const takes = gamesArg.includes('pw') ? loaded.takes : [];
  const listen = loaded.listen.filter(t => gamesArg.includes(t.kind === 'nr' ? 'nr' : 'coach'));
  console.log(`${total} takes in all: ${loaded.takes.length} Power Chord Switch, ${loaded.listen.filter(t => t.kind !== 'nr').length} Listening Coach, ${loaded.listen.filter(t => t.kind === 'nr').length} Note Runner; writing ${gamesArg.join(', ')}`);
  if (!takes.length && !listen.length) fail('no takes of those games in there: nothing to add');

  mkdirSync(TAKES_DIR, { recursive: true });
  const before = new Set(loadSummaries(TAKES_DIR).map(t => t.id).concat(loadListenSummaries(TAKES_DIR).map(t => t.id)));
  let added = 0, same = 0;
  for (const tk of listen){
    writeFileSync(join(TAKES_DIR, tk.id + '.json'), JSON.stringify(summarizeListen(tk)));
    if (before.has(tk.id)) same++; else added++;
    process.stderr.write('.');
  }
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
  if (takes.length){ replayAll(takes, ['base'], NOW); replayAll(fromSum, ['base'], NOW); }
  let n = 0, eq = 0, eqHeard = 0;
  const heard = v => v.verdict !== 'miss';
  for (const a of takes){
    const b = fromSum.find(t => t.id === a.id);
    for (const key of ['base@own', 'base@now']) for (const i of Object.keys(a.res[key])){
      const x = a.res[key][i], y = b.res[key][i];
      n++; if (y && x.verdict === y.verdict) eq++; if (y && heard(x) === heard(y)) eqHeard++;
    }
  }
  if (takes.length) console.log(`self-check: the replay from the summaries gives the same verdict as the replay from the audio on ${eq} of ${n} changes (heard / not heard: ${eqHeard} of ${n})`);
  if (listen.length){
    const lids = new Set(listen.map(t => t.id)), lsum = loadListenSummaries(TAKES_DIR).filter(t => lids.has(t.id));
    await replayAllListen(listen, null, [0], false); await replayAllListen(lsum, null, [0], false);
    let ln = 0, leq = 0;
    for (const a of listen){
      const b = lsum.find(t => t.id === a.id), x = a.res[0], y = b && b.res[0];
      if (!x || x.error || !y || y.error) continue;
      x.notes.forEach((v, i) => { ln++; if (y.notes[i] && y.notes[i].v === v.v) leq++; });
    }
    console.log(`self-check (Listening Coach, Note Runner): the real loops replayed from the summaries give the same verdict as from the audio on ${leq} of ${ln} notes`);
  }
  const all = loadSummaries(TAKES_DIR), allListen = loadListenSummaries(TAKES_DIR);
  console.log(`summaries: ${added} new, ${same} already there (rewritten) · ${all.length} Power Chord Switch and ${allListen.length} Listening Coach / Note Runner in tools/mic-sim/takes/ now`);

  cleanup();
  if (!args.includes('--no-commit')){
    const git = a => spawnSync('git', a, { cwd: HERE, encoding: 'utf8' });
    git(['add', '--', TAKES_DIR]);
    if (git(['diff', '--cached', '--quiet', '--', TAKES_DIR]).status === 0) console.log('git: nothing new to commit');
    else {
      const c = git(['commit', '-m', `Take summaries: ${added} new takes (${all.length} Power Chord Switch, ${allListen.length} Listening Coach / Note Runner in all)\n\nMade by tools/mic-sim/takes-in.mjs. No audio and no names: loudness, attack energy and detector pitch per 512 samples,\nthe game's numbers and the evaluator's truth.`, '--', TAKES_DIR]);
      console.log(c.status === 0 ? 'git: committed the summaries (not pushed: run `git push`, or tell Claude)' : 'git: the commit did not go through; the files are written, commit them by hand:\n' + (c.stderr || c.stdout || '').trim().split('\n').slice(-3).join('\n'));
    }
  }
  const why = all.length ? askReasons(all, baseSite()) : [];
  console.log(why.length ? 'still worth more takes later:\n' + why.map(w => '  - ' + w).join('\n') : 'the takes are current.');
  console.log('next: node tools/mic-sim/replay-takes.mjs   (any session can run it now)');
} finally { cleanup(); }
