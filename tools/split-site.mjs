#!/usr/bin/env node
/* Cut app.js, coach.js and teacher.js into part files (2026-11-11).

   Part of the whole-site rebuild (todo.md, "The shape of the rebuild", slice
   0b). It is a tool Claude runs, not a build step: the parts it writes are
   committed and served as they are.

   The three files are too big to work in (17,900 / 10,700 / 7,200 lines) and
   main changes them about ten times a day, so the cut cannot be done by hand
   once: it has to be re-run on a newer main. This tool does only that. It
   moves nothing by judgement: a part is a run of whole lines, and the parts
   put back together in order are the source file byte for byte.

     node tools/split-site.mjs                    check tools/split-plan.json against this checkout
                                                  (writes nothing)
     node tools/split-site.mjs --write --in-place also write the part files into this checkout: the cut itself
                                                  (coach.js and teacher.js become their first parts)
     node tools/split-site.mjs --src <dir>        read app.js / coach.js / teacher.js from another folder
     node tools/split-site.mjs --out <dir>        write the parts under another folder (implies --write)
     node tools/split-site.mjs --plan <file>      another plan file
     node tools/split-site.mjs --only app.js      one source file

   The plan (tools/split-plan.json): for each source file, its parts in load
   order. A part is { "file": "app/save.js", "mark": "<text>", "back": 0 }.
   `mark` is text that must appear on EXACTLY ONE line of the source; the part
   begins `back` lines above that line (default 0) and runs to the line before
   the next part. The first part has no mark: it begins at line 1. Marks are
   text, not line numbers, so the same plan still cuts a newer main in the same
   places; a mark that has gone, or now appears twice, stops the run and names
   itself.

   It fails (exit 1, nothing written) when:
     - a mark is missing or not unique, or the parts are not in file order;
     - a part would be empty;
     - the parts put back together are not the source, byte for byte;
     - a part does not parse on its own (`node --check`): a cut that falls
       inside a function, a comment or a template string;
     - a part does not begin at the start of a comment banner or a top-level
       statement (its first line is indented).

   What it cannot see: a statement in one part that RUNS at load time and
   needs a function or a `let` from a LATER part. One file hoists every
   function; several files do not. That is found by loading the parts one by
   one (the slice 0c check and tools/golden.mjs), not here. */
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync, rmSync, existsSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const real = d => { try { return realpathSync(d); } catch { return d; } };
const SRC = real(resolve(opt('--src') || HERE));
const OUT = opt('--out') ? real(resolve(opt('--out'))) : (args.includes('--write') ? real(HERE) : null);
const PLAN_FILE = resolve(opt('--plan') || join(HERE, 'tools', 'split-plan.json'));
const ONLY = opt('--only');

const plan = JSON.parse(readFileSync(PLAN_FILE, 'utf8'));
let failed = 0;
const fail = (m) => { console.error('split-site: ✗ ' + m); failed++; };
const tmp = mkdtempSync(join(tmpdir(), 'gc-split-'));
const results = [];

for (const [name, parts] of Object.entries(plan)) {
  if (name.startsWith('_') || (ONLY && name !== ONLY)) continue;
  const srcFile = join(SRC, name);
  if (!existsSync(srcFile)) { fail(`${name}: not found in ${SRC}`); continue; }
  const text = readFileSync(srcFile, 'utf8');
  // Lines keep their own line ending, so joining them back cannot change a byte.
  const lines = text.match(/[^\n]*\n|[^\n]+$/g) || [];
  const starts = [];
  let ok = true;
  // Part names tools/site-src.mjs can recognise on disk: app/<x>.js for the app, <stem>-<x>.js for the others, or the script's own name for a first part.
  const stem = name.replace(/\.js$/, '');
  for (const p of parts) if (!(p.file === name || (name === 'app.js' ? /^app\/[^/]+\.js$/.test(p.file) : new RegExp('^' + stem + '-[^/]+\\.js$').test(p.file)))) { fail(`${name}: part ${p.file} must be named ${name === 'app.js' ? 'app/<name>.js' : stem + '-<name>.js'} (see tools/site-src.mjs)`); ok = false; }
  parts.forEach((p, i) => {
    if (i === 0) { if (p.mark) { fail(`${name}: the first part (${p.file}) begins at line 1 and takes no mark`); ok = false; } starts.push(0); return; }
    if (!p.mark) { fail(`${name}: part ${p.file} has no mark`); ok = false; starts.push(-1); return; }
    const hits = []; lines.forEach((l, n) => { if (l.includes(p.mark)) hits.push(n); });
    if (hits.length !== 1) { fail(`${name}: the mark for ${p.file} is on ${hits.length} lines, it must be on exactly one: ${JSON.stringify(p.mark)}${hits.length ? ' (lines ' + hits.slice(0, 5).map(n => n + 1).join(', ') + ')' : ''}`); ok = false; starts.push(-1); return; }
    starts.push(hits[0] - (p.back || 0));
  });
  if (!ok) continue;
  for (let i = 1; i < starts.length; i++) if (starts[i] <= starts[i - 1]) { fail(`${name}: ${parts[i].file} (line ${starts[i] + 1}) does not come after ${parts[i - 1].file} (line ${starts[i - 1] + 1}): parts must be in file order and not empty`); ok = false; }
  if (!ok) continue;
  const bodies = parts.map((p, i) => lines.slice(starts[i], i + 1 < starts.length ? starts[i + 1] : lines.length).join(''));
  if (bodies.join('') !== text) { fail(`${name}: the parts put back together are not the source file`); continue; }
  parts.forEach((p, i) => {
    const first = bodies[i].split('\n')[0];
    if (/^\s/.test(first) && first.trim()) { fail(`${name}: ${p.file} would begin on an indented line (${starts[i] + 1}: ${JSON.stringify(first.slice(0, 60))}): a cut belongs at a banner or a top-level statement`); ok = false; }
    const f = join(tmp, name.replace(/\W/g, '_') + '-' + i + '.js'); writeFileSync(f, bodies[i]);
    const r = spawnSync(process.execPath, ['--check', f], { encoding: 'utf8' });
    if (r.status !== 0) { fail(`${name}: ${p.file} (lines ${starts[i] + 1}-${i + 1 < starts.length ? starts[i + 1] : lines.length}) does not parse on its own: ${(r.stderr || '').split('\n').filter(x => /Error/.test(x))[0] || 'syntax error'}`); ok = false; }
  });
  if (!ok) continue;
  results.push({ name, parts, starts, bodies, total: lines.length });
}
rmSync(tmp, { recursive: true, force: true });

if (failed) { console.error(`split-site: ${failed} problem(s); nothing written`); process.exit(1); }
/* Writing into the folder the sources came from replaces coach.js and teacher.js with their first parts. That
   is the cut itself, so it must be asked for by name (review R2-1: a plain --write left a tree whose coach.js
   was a quarter of the script and whose tools still ran). */
/* "This very folder" is any folder that already holds a script the write would replace with its first part:
   the source folder under another spelling, or this checkout when the sources come from elsewhere (--src
   <newer main> --write), which the first form of this test let through (review R3-3). */
const replaces = OUT ? results.filter(r => r.parts.some(p => p.file === r.name) && existsSync(join(OUT, r.name))).map(r => r.name) : [];
if (OUT && (OUT === SRC || replaces.length) && !args.includes('--in-place')) { console.error('split-site: --write would cut the files of this very folder. Use --out <another folder> to look at the parts, or --write --in-place to make the cut here (then declare the part lists in the same change).'); process.exit(1); }
for (const r of results) {
  console.log(`split-site: ${r.name} (${r.total} lines) → ${r.parts.length} parts, put back together = the source, each parses on its own`);
  r.parts.forEach((p, i) => { const end = i + 1 < r.starts.length ? r.starts[i + 1] : r.total; console.log(`  ${String(r.starts[i] + 1).padStart(6)}-${String(end).padEnd(6)} ${String(end - r.starts[i]).padStart(5)} lines  ${p.file}`); });
  if (OUT) for (const [i, p] of r.parts.entries()) { const f = join(OUT, p.file); mkdirSync(dirname(f), { recursive: true }); writeFileSync(f, r.bodies[i]); }
}
if (!results.length) { console.error('split-site: nothing to do (no source file matched)'); process.exit(1); }
const replaced = replaces;
console.log(OUT ? `split-site: ✓ parts written under ${OUT}` + (replaced.length ? ` (${replaced.join(' and ')} now ${replaced.length > 1 ? 'hold' : 'holds'} only the first part; any other source file is left as it is and must be deleted, and the part lists declared, in the same change: see tools/site-src.mjs)` : ' (the source files are left as they are)') : 'split-site: ✓ plan checks out (nothing written; --write or --out <dir> writes the parts)');
