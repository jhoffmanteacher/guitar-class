#!/usr/bin/env node
/* Tests tools/update-reload-loop.mjs's removeProfile() without Chrome (2026-11-13).

   GitHub's Linux runner left one Chrome profile folder of 11 behind after update-reload-loop.mjs had closed
   Chrome and removed it. This test plays that moment with two plain Node processes standing in for Chrome:
     - a "browser" started with --user-data-dir=<folder>;
     - a "helper" it starts in a session of its own (as Chrome's crash handler runs outside the browser's
       process group), named with --database=<folder>/Crash Reports, holding a file in the folder open and,
       once the browser is gone, still writing into the folder (it makes the subfolder again each time) for
       a while before it exits.
   The tool stops the browser exactly as stopChrome() does (SIGTERM, wait for its exit), then removes the
   folder with the OLD code (one rmSync) or the NEW code (removeProfile, read from update-reload-loop.mjs
   between its "removeProfile: begin" / "removeProfile: end" lines and run as it stands), waits until the
   helper has certainly finished, and asks whether the folder is still there.

   Cases: "helper lingers 1.5 s then exits" and "helper never exits by itself" (the new code must kill it).
   Expected: old code leaves the folder in both; new code removes it in both. Exit 0 only when every
   expectation holds. macOS and Linux (pgrep); on Windows it says so and exits 0 without testing.

     node tools/ci/chrome-cleanup-test.mjs */
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

if (process.platform === 'win32') { console.log('chrome-cleanup-test: Windows has no pgrep; nothing tested here'); process.exit(0); }
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

const src = readFileSync(join(ROOT, 'tools/update-reload-loop.mjs'), 'utf8');
const m = src.match(/\/\/ removeProfile: begin[^\n]*\n([\s\S]*?)\/\/ removeProfile: end/);
if (!m) { console.error('chrome-cleanup-test: ✗ no "removeProfile: begin/end" block in tools/update-reload-loop.mjs'); process.exit(1); }
const removeProfileNew = new Function('execFileSync', 'rmSync', 'existsSync', 'sleep', 'process', `${m[1]}\nreturn removeProfile;`)(execFileSync, rmSync, existsSync, sleep, process);
// The code it replaced (update-reload-loop.mjs before 2026-11-13): `const dropProfile = () => rmSync(prof, { recursive: true, force: true });`
const removeProfileOld = async (dir) => { rmSync(dir, { recursive: true, force: true }); return !existsSync(dir); };

const HELPER = `
const fs = require('fs'), path = require('path');
const dir = process.argv[1].slice('--database='.length).replace(/\\/Crash Reports$/, ''), browser = Number(process.argv[2]), linger = Number(process.argv[3]);
const fd = fs.openSync(path.join(dir, 'held.log'), 'a');
let goneAt = 0;
setInterval(() => {
  let alive = true; try { process.kill(browser, 0); } catch { alive = false; }
  if (alive) { fs.writeSync(fd, 'x'); return; }
  if (!goneAt) goneAt = Date.now();
  if (linger >= 0 && Date.now() - goneAt > linger) process.exit(0);
  try { fs.mkdirSync(path.join(dir, 'Crash Reports'), { recursive: true }); fs.writeFileSync(path.join(dir, 'Crash Reports', 'settings.dat'), 'x'); } catch {}
}, 30);`;
const BROWSER = `
const { spawn } = require('child_process');
const dir = process.argv[1].slice('--user-data-dir='.length), linger = process.argv[2];
const h = spawn(process.execPath, ['-e', ${JSON.stringify(HELPER)}, '--', '--database=' + dir + '/Crash Reports', String(process.pid), linger], { detached: true, stdio: 'ignore' });
h.unref();
console.log(h.pid);
setInterval(() => {}, 1000);`;

/* stopChrome(), as update-reload-loop.mjs has it: SIGTERM, SIGKILL after 1 s, give up waiting at 3 s. */
const stopBrowser = (p) => new Promise(res => {
  if (p.exitCode !== null || p.signalCode !== null) return res();
  let kill = null, cap = null;
  const done = () => { clearTimeout(kill); clearTimeout(cap); res(); };
  p.once('exit', done); p.kill();
  kill = setTimeout(() => { try { p.kill('SIGKILL'); } catch { /* gone */ } }, 1000);
  cap = setTimeout(done, 3000);
});

async function play(label, removal, linger) {
  const dir = mkdtempSync(join(tmpdir(), 'gc-cleanup-test-'));
  const browser = spawn(process.execPath, ['-e', BROWSER, '--', '--user-data-dir=' + dir, String(linger)], { stdio: ['ignore', 'pipe', 'ignore'] });
  const helperPid = await new Promise((r, j) => { browser.stdout.once('data', d => r(Number(String(d).trim()))); browser.once('exit', c => j(new Error(`the stand-in browser exited (${c}) before starting its helper`))); });
  await sleep(400);
  const heldBefore = existsSync(join(dir, 'held.log'));
  await stopBrowser(browser);
  const t0 = Date.now();
  const said = await removal(dir);
  const took = Date.now() - t0;
  await sleep(linger >= 0 ? linger + 600 : 600);   // past the helper's last possible write
  const left = existsSync(dir);
  let helperAlive = true; try { process.kill(helperPid, 0); } catch { helperAlive = false; }
  try { process.kill(helperPid, 'SIGKILL'); } catch { /* gone */ }
  await sleep(100);
  rmSync(dir, { recursive: true, force: true });
  return { label, heldBefore, said, took, left, helperAlive };
}

const cases = [
  { name: 'helper lingers 1.5 s then exits', linger: 1500 },
  { name: 'helper never exits by itself', linger: -1 },
];
let bad = 0;
for (const c of cases) {
  for (const [which, fn, wantLeft] of [['old', removeProfileOld, true], ['new', (d) => removeProfileNew(d, { waitMs: 2500 }), false]]) {
    const r = await play(c.name, fn, c.linger);
    const ok = r.heldBefore && r.left === wantLeft && (which === 'old' || !r.helperAlive);
    if (!ok) bad++;
    console.log(`  ${ok ? '✓' : '✗'} ${which} code, ${c.name}: folder ${r.left ? 'STILL THERE' : 'gone'} after the helper finished`
      + ` (removal said ${r.said ? 'removed' : 'not removed'}, took ${r.took} ms; helper ${r.helperAlive ? 'still running' : 'exited'}; file held open before: ${r.heldBefore})`
      + `; expected ${wantLeft ? 'still there' : 'gone'}`);
  }
}
console.log(bad ? `chrome-cleanup-test: ✗ ${bad} of ${cases.length * 2} expectations failed` : `chrome-cleanup-test: ✓ ${cases.length * 2} of ${cases.length * 2} expectations held (old code leaves the folder, new code removes it)`);
process.exit(bad ? 1 : 0);
