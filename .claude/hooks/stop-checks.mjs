#!/usr/bin/env node
/* Claude Code Stop hook (2026-10-25): the "did I just break something?" step,
   done for you.

   When Claude finishes a turn and code files are changed, this runs the repo's
   offline checks (`node tools/checks.mjs --check --skip-links`, about 9 s). If
   they fail, it BLOCKS the stop and hands the failure back, so the fix happens
   in the same turn instead of at commit time. Wired in .claude/settings.json.

   Built so that it can never trap a session:
   - It only runs when the set of changed code files differs from the last state
     it checked (a read-only or chat-only turn costs nothing).
   - The expected "shell cache stale" / "audio cache stale" lines are NOT
     failures here: the cache versions are recomputed once, by the full
     `node tools/checks.mjs`, right before a push, and nobody may hand-edit them.
   - It blocks at most MAX_BLOCKS times per turn (prompt_id), and never twice
     for the exact same file state (if Claude changed nothing, there is nothing
     new to say). Claude Code also caps consecutive stop-hook continuations
     itself (8, reset whenever Claude calls a tool).
   - Every internal problem (no git, no node script, a timeout) fails OPEN: the
     stop is allowed and a short note is shown.
   - Off switch: set GC_STOP_CHECKS=0 in the environment.

   It does not replace the git pre-commit / pre-push hooks, the full
   `node tools/checks.mjs`, or tools/smoke.mjs; it only moves the cheapest of
   them to the end of every editing turn. Node only (no bash/jq), so it works
   on both of Jonathan's machines. */
import { execFileSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, statSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const MAX_BLOCKS = 3;
const CHECK_TIMEOUT_MS = 100000;
// Files whose change means "re-run the checks". Notes and docs (*.md) are not
// code; .claude/ is configuration; audio/ is not text.
const CODE = /\.(js|mjs|css|html|json)$/i;
const SKIP = /^(\.claude\/|audio\/|node_modules\/|screens\/)/;

const done = (obj) => { if (obj) console.log(JSON.stringify(obj)); process.exit(0); };
const note = (msg) => done({ systemMessage: msg });

if (process.env.GC_STOP_CHECKS === '0') done();

let input = {};
try { input = JSON.parse(readFileSync(0, 'utf8') || '{}'); } catch { /* no stdin payload: fine */ }

const git = (cwd, ...args) => execFileSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 26, stdio: ['ignore', 'pipe', 'ignore'] });
let root;
try { root = git(input.cwd || process.cwd(), 'rev-parse', '--show-toplevel').trim(); } catch { done(); }   // not a git checkout
if (!existsSync(join(root, 'tools', 'checks.mjs'))) done();                                               // not this repo

// Changed code files: modified, added, renamed and untracked.
function changedCodeFiles() {
  let out;
  try { out = git(root, 'status', '--porcelain=v1', '-z', '-uall'); } catch { return []; }
  const parts = out.split('\0').filter(Boolean);
  const files = [];
  for (let i = 0; i < parts.length; i++) {
    const status = parts[i].slice(0, 2), path = parts[i].slice(3);
    if (status[0] === 'R' || status[0] === 'C') i++;          // the next entry is the old path
    if (status.includes('D')) continue;                         // a deleted file has nothing to check
    if (CODE.test(path) && !SKIP.test(path)) files.push(path);
  }
  return [...new Set(files)].sort();
}
const fingerprint = (files) => {
  const h = createHash('sha1');
  for (const f of files) {
    let s = '';
    try { const st = statSync(join(root, f)); s = st.size + ':' + Math.round(st.mtimeMs); } catch { s = 'gone'; }
    h.update(f + '\0' + s + '\0');
  }
  return h.digest('hex');
};

const files = changedCodeFiles();
if (!files.length) done();

const statePath = join(tmpdir(), `gc-stop-checks-${String(input.session_id || 'nosession').replace(/[^\w-]/g, '')}-${createHash('sha1').update(root).digest('hex').slice(0, 8)}.json`);
let state = {};
try { state = JSON.parse(readFileSync(statePath, 'utf8')); } catch { /* first run */ }
const save = (s) => { try { writeFileSync(statePath, JSON.stringify(s)); } catch { /* best effort */ } };

const fp = fingerprint(files);
if (state.fp === fp && state.result === 'pass') done();                                  // already verified this exact state
if (state.fp === fp && state.result === 'fail') note('Stop-hook checks still fail on the same files; not blocking again.');

const run = spawnSync(process.execPath, ['tools/checks.mjs', '--check', '--skip-links'], { cwd: root, encoding: 'utf8', timeout: CHECK_TIMEOUT_MS, maxBuffer: 1 << 26 });
if (run.error || run.status === null) note(`Stop-hook checks could not run (${run.error ? run.error.code || run.error.message : 'timed out'}); allowing the stop.`);

const lines = (run.stdout + '\n' + run.stderr).replace(/\x1b\[[0-9;]*m/g, '').split('\n');
const failing = lines.filter(l => /^\s*✗/.test(l) && !/cache stale|problems? found/i.test(l));
if (!failing.length) { save({ fp, result: 'pass', blocks: 0, turn: String(input.prompt_id || '') }); done(); }

// The retry budget is per turn (prompt_id): a failure left unfixed in one turn
// must not make the hook give up instantly in every later turn.
const turn = String(input.prompt_id || '');
const blocks = (state.turn === turn ? state.blocks || 0 : 0) + 1;
save({ fp, result: 'fail', blocks, turn });
if (blocks > MAX_BLOCKS) note(`Stop-hook checks still fail after ${MAX_BLOCKS} tries; handing back to you. First failure: ${failing[0].trim()}`);

const detail = lines.filter(l => l.trim() && !/^\s*✓/.test(l) && !/cache stale|problems? found/i.test(l)).slice(0, 60);
done({
  decision: 'block',
  reason: [
    `The repo's offline checks fail after your edits (${files.slice(0, 8).join(', ')}${files.length > 8 ? ', …' : ''}).`,
    'Fix the cause; do not loosen a check or add an allowlist entry. The "shell cache stale" / "audio cache stale" lines are expected and are not failures.',
    `Re-run: node tools/checks.mjs --check --skip-links   (attempt ${blocks} of ${MAX_BLOCKS})`,
    '',
    ...detail,
  ].join('\n'),
});
