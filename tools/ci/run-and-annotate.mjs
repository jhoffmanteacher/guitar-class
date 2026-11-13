#!/usr/bin/env node
/* Runs one slow browser tool on GitHub and makes its result readable without logging in (2026-11-13).

   .github/workflows/browser.yml runs tools/smoke.mjs, slow-load.mjs, update-reload-loop.mjs and
   playalong-loop.mjs through this. GitHub's public API does not serve a job's log text, but it does
   serve the job's check-run annotations. So this wrapper:
     - runs the command, passing its output through unchanged, and also writes it all to --log;
     - on success, prints ONE `::notice` line: the tool's summary line(s) (--summary picks them);
     - on failure, prints TWO `::error` lines (GitHub keeps at most 10 error annotations a step):
         1. "<title> failed (exit N: what N means)" with the tool's own ✗ / HUNG / "could not run" lines;
         2. the last --tail lines of the output (default 40), folded into one annotation with %0A;
     - writes the same text to the job summary page ($GITHUB_STEP_SUMMARY) when GitHub provides one;
     - exits with the tool's own exit code (1 when the tool was stopped by a signal).
   The four tools share one meaning for their exit codes: 0 passed, 1 a check failed, 2 could not run
   (bad arguments, no Chrome, nothing walked), 3 the tool's own watchdog stopped a hung run.

   --deadline <minutes>: if the tool is still running then, it is stopped (SIGTERM, then SIGKILL after
   15 s) and reported as failed with its last lines. Set it a few minutes below the job's
   timeout-minutes: a job that GitHub itself times out leaves no annotation at all.

     node tools/ci/run-and-annotate.mjs --title <name> --log <file> [--summary <regex>] [--tail 40]
       [--deadline <minutes>] -- <command> [args...]

   Node only, no packages. Off GitHub it behaves the same (the annotation lines are plain text). */
import { spawn } from 'node:child_process';
import { createWriteStream, mkdirSync, appendFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const argv = process.argv.slice(2);
const sep = argv.indexOf('--');
const own = sep >= 0 ? argv.slice(0, sep) : argv;
const cmd = sep >= 0 ? argv.slice(sep + 1) : [];
const opt = (name) => { const i = own.indexOf(name); return i >= 0 ? own[i + 1] : null; };
const usage = 'usage: node tools/ci/run-and-annotate.mjs --title <name> --log <file> [--summary <regex>] [--tail 40] [--deadline <minutes>] -- <command> [args...]';
if (own.includes('--help')) { console.log(usage); process.exit(0); }
const TITLE = opt('--title'), LOG = opt('--log');
if (!TITLE || !LOG || !cmd.length) { console.error(usage); process.exit(2); }
const TAIL = Number(opt('--tail') || 40);
const DEADLINE_MIN = opt('--deadline') == null ? 0 : Number(opt('--deadline'));
if (!(TAIL > 0) || !(DEADLINE_MIN >= 0)) { console.error('run-and-annotate: --tail and --deadline take a positive number'); process.exit(2); }
let SUMMARY;
try { SUMMARY = new RegExp(opt('--summary') || '✓|✗'); } catch (e) { console.error(`run-and-annotate: --summary is not a regular expression: ${e.message}`); process.exit(2); }

/* Workflow-command escaping, as GitHub's own toolkit does it (actions/toolkit packages/core/src/command.ts). */
const escData = (s) => String(s).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
const escProp = (s) => escData(s).replace(/:/g, '%3A').replace(/,/g, '%2C');
const plain = (s) => String(s).replace(/\x1b\[[0-9;?]*[A-Za-z]/g, '');
// One annotation's message may be up to 64 KB; each line is capped and the whole kept well below that.
const fold = (lines) => { const out = lines.map(l => { const p = plain(l); return p.length > 600 ? p.slice(0, 600) + ' …' : p; }).join('\n'); return out.length > 48000 ? '…\n' + out.slice(-48000) : out; };
const annotate = (level, title, lines) => console.log(`::${level} title=${escProp(title)}::${escData(fold(lines))}`);
const MEANING = { 1: 'a check failed', 2: 'could not run (bad arguments, no Chrome, or nothing walked)', 3: "hung: the tool's own watchdog stopped it" };

const logPath = resolve(LOG);
mkdirSync(dirname(logPath), { recursive: true });
const log = createWriteStream(logPath);
const lines = [];
let partial = '';
const take = (chunk, toStream) => {
  toStream.write(chunk);
  log.write(chunk);
  const text = partial + chunk.toString('utf8');
  const parts = text.split('\n');
  partial = parts.pop();
  for (const p of parts) { lines.push(p.replace(/\r$/, '')); if (lines.length > 5000) lines.splice(0, lines.length - 4000); }
};

const t0 = Date.now();
const child = spawn(cmd[0], cmd.slice(1), { stdio: ['ignore', 'pipe', 'pipe'] });
child.stdout.on('data', (c) => take(c, process.stdout));
child.stderr.on('data', (c) => take(c, process.stderr));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { try { child.kill(sig); } catch { /* gone */ } });

let deadlineHit = false, killTimer = null;
const deadline = DEADLINE_MIN > 0 ? setTimeout(() => {
  deadlineHit = true;
  console.error(`run-and-annotate: ${TITLE} still running after ${DEADLINE_MIN} min (--deadline): stopping it`);
  try { child.kill('SIGTERM'); } catch { /* gone */ }
  killTimer = setTimeout(() => { try { child.kill('SIGKILL'); } catch { /* gone */ } }, 15000);
}, DEADLINE_MIN * 60000) : null;

let finished = false;
const finish = (code, signal, spawnError) => {
  // A command that cannot start fires 'error' and may fire 'close' too: report once.
  if (finished) return;
  finished = true;
  clearTimeout(deadline); clearTimeout(killTimer);
  if (partial) { lines.push(partial); partial = ''; }
  const mins = ((Date.now() - t0) / 60000).toFixed(1);
  const exit = spawnError ? 2 : (code == null ? 1 : code);
  const summaryFile = process.env.GITHUB_STEP_SUMMARY;
  const writeSummary = (md) => { if (summaryFile) { try { appendFileSync(summaryFile, md + '\n'); } catch { /* best effort */ } } };
  const done = () => process.exit(exit);
  if (exit === 0 && !deadlineHit) {
    const picked = lines.filter(l => SUMMARY.test(l)).slice(-3);
    const text = picked.length ? picked : [lines.filter(l => l.trim()).pop() || '(no output)'];
    annotate('notice', `${TITLE} passed (${mins} min)`, text);
    writeSummary(`### ${TITLE}: passed in ${mins} min\n\n\`\`\`\n${text.map(plain).join('\n')}\n\`\`\``);
    log.end(done);
    return;
  }
  const why = spawnError ? `could not start ${cmd[0]}: ${spawnError.message}`
    : deadlineHit ? `stopped after ${DEADLINE_MIN} min by --deadline (the run was taking too long)`
    : signal ? `killed by ${signal} (cancelled, or the job ran out of time)`
    : `exit ${code}: ${MEANING[code] || 'failed'}`;
  const verdicts = lines.filter(l => /✗|HUNG|could not run|tool itself failed|no Chrome|refusing/.test(l)).slice(0, 12);
  annotate('error', `${TITLE} failed (${why})`, verdicts.length ? verdicts : [`${TITLE}: ${why}; no ✗ line in the output, see the next annotation`]);
  const tail = lines.slice(-TAIL);
  annotate('error', `${TITLE}: last ${tail.length} lines of output`, tail.length ? tail : ['(no output)']);
  writeSummary(`### ${TITLE}: FAILED (${why}) after ${mins} min\n\n\`\`\`\n${tail.map(plain).join('\n')}\n\`\`\``);
  log.end(done);
};
child.on('error', (e) => finish(null, null, e));
child.on('close', (code, signal) => finish(code, signal, null));
