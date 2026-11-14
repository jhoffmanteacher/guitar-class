#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════
   never-blocks.mjs — CLAUDE.md's "Never, whatever the task says" list,
   turned from instructions into checks (Jonathan, 2026-11-13: "Automatic
   blocks for the 'never' rules. Today those are instructions; a block can't
   be forgotten.").

   tools/checks.mjs runs these four, so they run in the pre-commit and
   pre-push hooks (.githooks/) and on GitHub after every push
   (.github/workflows/checks.yml), in a cloud session and after a hand edit
   alike:

     1dl  progress keys and frozen quizzes, against the push's base
          (rules 1 and 2): when a module-N.js or config-main.js differs from
          the base, tools/rule-zero-proof.mjs is run against it and its
          verdict is the check's, every line of its printout shown. It
          freezes keyed quizzes in Modules 1..FROZEN_THROUGH and in the next
          module, the one the class is about to enter. A REVERT (each changed
          module file equal to that file at an earlier commit, and every
          commit it undoes committed under REVERT_MAX_HOURS ago) is let
          through with a loud line (BREAK-GLASS.md step 4).
          Also: FROZEN_THROUGH = checks.mjs's FROZEN_MC_THROUGH_MODULE.
          Module progress keys stay valid for good (Jonathan, 2026-11-13:
          "modules do not reset for students unless i do it"), so there is
          no override.
     1dm  Firestore writes, read from the code (rules 3 and 4). Every script a
          page loads is read, its inline <script> blocks and on…="" handlers
          too. Only the places pinned in PROGRESS_WRITERS write progress/…; no
          console part (teacher-*.js) writes it, lets a reference to it leave a
          read, or calls an app function that saves it; config/class is written
          only inside teacherWriteConfig() in teacher-config.js, the one
          declaration of that name. Paths are folded ('prog' + 'ress',
          constants, template literals); a path it cannot read counts as "may
          be either".
     1dn  firestore.rules (rule 5): when it differs from the base, a loud line
          says Jonathan must paste it. At the PUSH (pre-push hook and GitHub,
          GC_CHECKS_STAGE=push) it fails until RULES-PASTE.md has one more line
          naming this exact text's hash than the base had; every line the base
          had must still be there. At a commit or a turn's end it warns.
     1do  things that stay as they are (rules 6, 7 and 8): "the cure"'s four
          audio files keep their bytes; the Daily 5 and Take It to a Song keep
          their substance (fingerprints, counts, step hashes); the deleted
          student tour stays deleted.

   THE BASE (1dl, 1dn) is what this change is measured against:
     - GC_CHECKS_BASE when set (GitHub sets it to the push's `before` commit,
       which the workflow fetches; a shallow checkout has no other history);
     - else `git merge-base HEAD <ref>` for the first of origin/main,
       origin/HEAD, main that exists: where this branch left main, so a branch
       that is merely BEHIND main is not blamed for main's own work;
     - else none: if the working tree or the last commit touches a module file
       or firestore.rules, that is a refusal (fetch origin); otherwise a warning.
   They compare the WORKING TREE with the base, so uncommitted edits count.
   Text is compared with line endings as LF throughout (a Windows checkout).

   Each refusal prints one plain sentence: what was refused, which rule,
   where the rule is written, what to do instead. No allowlist: the code
   shapes 1dm cannot follow that exist today are named below, each with its
   reason, matched exactly, and every pin says how it is changed.

   USAGE
     node tools/never-blocks.mjs               run the four checks on this tree
     node tools/never-blocks.mjs --pins        print today's values of every pin
                                               (to re-pin a deliberate change,
                                               with its reason and date)
     node tools/never-blocks.mjs --self-test   plant each forbidden edit (and
                                               the allowed near-misses) in a
                                               scratch worktree and prove the
                                               checks go red / stay green
   Zero dependencies, Node 18+, Windows and macOS.
   ════════════════════════════════════════════════════════════════════ */

import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdtempSync, rmSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, posix } from 'node:path';
import { tmpdir } from 'node:os';
import vm from 'node:vm';
import { tokenize, segments, matchClose as matchCloseTok, foldString } from './js-scan.mjs';
import { analyzeFile, collectConstants, collectHandles, collectFactories, callGraph, realCalls, localNames, handlerSources, scriptHandlerSources, pathString, statementSig } from './firestore-paths.mjs';
import { siteParts } from './site-src.mjs';
import { fileHash } from './sw-audio-map.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = join(HERE, '..');
const NEVER = 'CLAUDE.md, "Never, whatever the task says"';
const lf = s => String(s).replace(/\r\n?/g, '\n');
const readText = (root, rel) => { try { return lf(readFileSync(join(root, rel), 'utf8')); } catch { return null; } };
const sha = (s, n = 12) => createHash('sha256').update(s).digest('hex').slice(0, n);

/* ── git and the base ─────────────────────────────────────────────── */
function git(root, args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 });
  return { ok: !r.error && r.status === 0, out: (r.stdout || '').trim(), raw: r.stdout || '', status: r.status, err: (r.stderr || '').trim() };
}
const baseCache = new Map();
export const clearBaseCache = () => baseCache.clear();
export function resolveBase(root) {
  if (baseCache.has(root)) return baseCache.get(root);
  let res;
  const set = Object.prototype.hasOwnProperty.call(process.env, 'GC_CHECKS_BASE');
  const env = (process.env.GC_CHECKS_BASE || '').trim();
  if (env && !/^0+$/.test(env)) {
    const c = git(root, ['rev-parse', '--verify', '-q', `${env}^{commit}`]);
    res = c.ok ? { ref: c.out, label: `the push's base ${c.out.slice(0, 7)} (GC_CHECKS_BASE)` }
               : { missing: `GC_CHECKS_BASE=${env} is not a commit in this checkout (on GitHub: the workflow's fetch of the push's base failed)` };
  } else if (set && process.env.GITHUB_ACTIONS === 'true') {
    res = { none: 'GitHub gave no commit to compare with (a new branch, or the push\'s base is gone)' };
  } else if (!git(root, ['rev-parse', '--git-dir']).ok) {
    res = { none: 'this folder is not a git checkout' };
  } else {
    for (const cand of ['origin/main', 'origin/HEAD', 'main']) {
      if (!git(root, ['rev-parse', '--verify', '-q', `${cand}^{commit}`]).ok) continue;
      const mb = git(root, ['merge-base', 'HEAD', cand]);
      if (mb.ok) { res = { ref: mb.out, label: `where this branch left ${cand} (${mb.out.slice(0, 7)})` }; break; }
    }
    if (!res) res = { none: 'there is no origin/main, origin/HEAD or main here that shares history with HEAD' };
  }
  baseCache.set(root, res);
  return res;
}
/* With no base: does the working tree, or the last commit, touch these paths? */
function touchesWithoutBase(root, specs, pick) {
  const st = git(root, ['status', '--porcelain', '--untracked-files=all', '--', ...specs]);
  // the last commit's own change (a commit with no parent here, a shallow clone's, has nothing to compare with)
  const last = git(root, ['rev-parse', '-q', '--verify', 'HEAD^']).ok ? git(root, ['diff', '--name-only', 'HEAD^', 'HEAD', '--', ...specs]) : { ok: true, out: '' };
  if (!st.ok && !last.ok) return null;   // not git at all: cannot tell
  const names = [...(st.raw || '').split('\n').map(l => l.slice(3).trim().replace(/^.* -> /, '')), ...last.out.split('\n')].filter(Boolean).filter(pick);
  return [...new Set(names)];
}
/* Paths that differ between the base and the WORKING TREE, plus untracked ones. */
function changedSince(root, base, specs, pick) {
  const d = git(root, ['diff', '--name-only', base, '--', ...specs]);
  const u = git(root, ['ls-files', '--others', '--exclude-standard', '--', ...specs]);
  return [...new Set([...(d.ok ? d.out.split('\n') : []), ...(u.ok ? u.out.split('\n') : [])].filter(Boolean))].filter(pick);
}
const strip = s => String(s).replace(/\x1b\[[0-9;]*m/g, '');
/* One tokenization per file per run, keyed by the text itself. */
const tokenCache = new Map();
const tokensOf = (key, src) => { const c = tokenCache.get(key); if (c && c.src === src) return c.toks; const toks = tokenize(src); tokenCache.set(key, { src, toks }); return toks; };

/* Results are lines for checks.mjs to print and count: {kind: 'ok'|'err'|'warn'|'info', text}. */
const R = () => { const lines = []; return { lines, ok: t => lines.push({ kind: 'ok', text: t }), err: t => lines.push({ kind: 'err', text: t }), warn: t => lines.push({ kind: 'warn', text: t }), info: t => lines.push({ kind: 'info', text: t }) }; };

/* ════════════════════════════════════════════════════════════════════
   1dl. PROGRESS KEYS AND FROZEN QUIZZES, AGAINST THE BASE (rules 1, 2)
   ════════════════════════════════════════════════════════════════════ */
const MODULE_FILE = /^(module-\d+\.js|config-main\.js)$/;
const GUARD_FILES = ['tools/never-blocks.mjs', 'tools/never-blocks-selftest.mjs', 'tools/never-pins.json', 'tools/js-scan.mjs', 'tools/firestore-paths.mjs', 'tools/rule-zero-proof.mjs', '.githooks', '.github/workflows/checks.yml'];
const MODULE_SPECS = ['module-*.js', 'config-main.js'];
/* A REVERT is let through when, for each changed module file, the tree's copy
   equals that file at some earlier commit on the base's history, AND every commit
   it undoes landed less than REVERT_MAX_HOURS ago (judged by the oldest one): a
   step that has been live longer may already hold students' ticks (Jonathan can
   change the number; review R2-5, 2026-11-13). Per file, so reverting the older
   of two pushes that touched different module files works. */
export const REVERT_MAX_HOURS = 24;
export const LET_THROUGH = [];   // loud lines checks.mjs repeats beside its final summary
function revertCheck(root, base, changed) {
  const now = Date.now();
  let oldest = null, undone = [];
  for (const f of changed) {
    const here = existsSync(join(root, f)) ? git(root, ['hash-object', '--', f]).out : null;
    const hist = git(root, ['log', '--format=%H %ct', '-n', '400', base, '--', f]);
    if (!hist.ok) return { why: `git cannot list ${f}'s history` };
    const commits = hist.out.split('\n').filter(Boolean).map(l => { const [h, t] = l.split(' '); return { h, t: Number(t) * 1000 }; });
    let match = -1;
    for (let i = 0; i < commits.length; i++) {
      const before = git(root, ['rev-parse', '-q', '--verify', `${commits[i].h}^:${f}`]);
      const blob = before.ok ? before.out : null;          // null: the file did not exist before that commit
      if (blob === here) { match = i; break; }
    }
    if (match < 0) return { why: `${f} is not the same as at any earlier commit on main` };
    const these = commits.slice(0, match + 1);
    undone.push(...these.map(c => c.h));
    const o = these[these.length - 1];
    if (!oldest || o.t < oldest.t) oldest = { ...o, file: f };
  }
  if (!oldest) return { why: 'nothing to undo' };
  const hours = (now - oldest.t) / 3600e3;
  const subject = git(root, ['log', '-1', '--format=%s', oldest.h]).out;
  // Judged by COMMIT time (when it reached main is not in git); a commit dated in the future proves nothing.
  if (hours < -0.25) return { why: `the change it undoes, ${oldest.h.slice(0, 7)} ("${subject}"), is dated ${Math.ceil(-hours)} hours in the future, so its age cannot be told: ask Jonathan` };
  if (hours >= REVERT_MAX_HOURS) return { why: `the oldest change it undoes, ${oldest.h.slice(0, 7)} ("${subject}", ${oldest.file}), was committed ${Math.floor(hours)} hours ago; students may have ticked it: ask Jonathan` };
  return { ok: true, commits: [...new Set(undone)], oldest, hours, subject };
}
/* The numbers that say which modules are frozen, read from a source text. */
const readNums = (rz, ck) => ({
  frozen: rz ? Number((rz.match(/^const FROZEN_THROUGH(?:_PINNED)? = (\d+);/m) || [])[1]) : NaN,
  open: rz ? Number((rz.match(/^const OPEN_THROUGH = (?:Math\.max\()?(\d+)/m) || [])[1]) : NaN,
  mc: ck ? Number((ck.match(/^const FROZEN_MC_THROUGH_MODULE = (\d+);/m) || [])[1]) : NaN,
  fps: ck ? Object.fromEntries([...((ck.match(/^const FROZEN_MC_FINGERPRINTS = \{([\s\S]*?)\n\};/m) || [])[1] || '').matchAll(/'([^']+)':\s*'([0-9a-f]+)'/g)].map(m => [m[1], m[2]])) : {},
});
/* Run a rule-zero-proof source against `base`: the tree's own file, or (when the
   push changes the proof itself) the base's text, written to a temporary file that
   points at this tree. */
function runProof(root, base, nums, src) {
  let file = join(root, 'tools', 'rule-zero-proof.mjs'), tmp = null;
  if (src) {
    const pinned = src.replace(/^const ROOT = .*$/m, `const ROOT = ${JSON.stringify(root)};`);
    if (pinned === src) return { status: 2, out: "✗ the base's rule-zero-proof.mjs has no `const ROOT = …` line to point at this tree" };
    tmp = mkdtempSync(join(tmpdir(), 'gc-rz-')); file = join(tmp, 'rule-zero-proof-base.mjs'); writeFileSync(file, pinned);
  }
  const p = spawnSync(process.execPath, [file, base, `--frozen-through=${nums.frozen}`, `--open-through=${nums.open}`], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26, timeout: 120000 });
  if (tmp) { try { rmSync(tmp, { recursive: true, force: true }); } catch { /* best effort */ } }
  return { status: p.status, out: strip((p.stdout || '') + (p.stderr || '')).replace(/\r\n?/g, '\n') };
}
export function checkKeysAgainstBase(root = DEFAULT_ROOT, { frozenMcThrough } = {}) {
  const r = R();
  const treeNums = readNums(readText(root, 'tools/rule-zero-proof.mjs'), readText(root, 'tools/checks.mjs'));
  if (!Number.isFinite(treeNums.frozen)) r.err('1dl: tools/rule-zero-proof.mjs has no `const FROZEN_THROUGH_PINNED = <n>;` line, so nothing proves which modules are frozen');
  const mcNow = frozenMcThrough !== undefined ? frozenMcThrough : treeNums.mc;
  if (Number.isFinite(treeNums.frozen) && Number.isFinite(mcNow) && treeNums.frozen !== mcNow)
    r.err(`1dl: rule-zero-proof.mjs freezes Modules 1–${treeNums.frozen} but checks.mjs 1ap freezes keyed quizzes in Modules 1–${mcNow}; they are one setting (CLAUDE.md "Three regimes"): raise both together when the class enters a module, and never lower either`);
  const base = resolveBase(root);
  if (base.missing) { r.err(`1dl: cannot compare with the push's base: ${base.missing}`); return r.lines; }
  if (base.none) {
    const t = touchesWithoutBase(root, MODULE_SPECS, f => MODULE_FILE.test(f));
    if (t && t.length) r.err(`1dl: refused — ${t.join(', ')} changed, and ${base.none}, so this check cannot tell whether a saved place moved (${NEVER}). Run git fetch origin (so origin/main exists) and check again.`);
    else r.warn(`1dl: ${base.none}; no module file changed here (or this is not git), so there was nothing to compare`);
    return r.lines;
  }
  /* A push that changes the guards themselves says so, loudly (not a failure): a weakened guard would
     otherwise judge its own push quietly (review R3, m4). */
  const guards = changedSince(root, base.ref, GUARD_FILES, () => true);
  if (guards.length) r.warn(`1dl: this push changes the guards: ${guards.join(', ')}. Read those diffs before trusting this run's verdicts.`);
  /* The frozen numbers and 1ap's fingerprints may only go UP: module progress is never wiped
     (Jonathan, 2026-11-13: "modules do not reset for students unless i do it"). */
  const show = f => { const g = git(root, ['show', `${base.ref}:${f}`]); return g.ok ? lf(g.raw) : null; };
  const baseProofSrc = show('tools/rule-zero-proof.mjs');
  const baseNums = readNums(baseProofSrc, show('tools/checks.mjs'));
  const lowered = [];
  for (const [k, label] of [['frozen', 'FROZEN_THROUGH (tools/rule-zero-proof.mjs)'], ['open', 'OPEN_THROUGH (tools/rule-zero-proof.mjs)'], ['mc', 'FROZEN_MC_THROUGH_MODULE (tools/checks.mjs)']])
    if (Number.isFinite(baseNums[k]) && !(treeNums[k] >= baseNums[k])) lowered.push(`${label} ${baseNums[k]} → ${Number.isFinite(treeNums[k]) ? treeNums[k] : 'gone'}`);
  /* A fingerprint REMOVED is refused. A fingerprint CHANGED is the documented reword (response.renamedChoices,
     then re-pin 1ap; CLAUDE.md "Three regimes"): allowed only when a module file changed in the same push and
     rule-zero-proof, the base's copy too, passes (it checks every old pick maps to a new choice). */
  const fpGone = Object.keys(baseNums.fps).filter(k => !(k in treeNums.fps));
  const fpChanged = Object.entries(baseNums.fps).filter(([k, v]) => k in treeNums.fps && treeNums.fps[k] !== v).map(([k]) => k);
  if (lowered.length || fpGone.length)
    r.err(`1dl: refused — ${[...lowered, ...(fpGone.length ? [`${fpGone.length} of 1ap's FROZEN_MC_FINGERPRINTS removed (${fpGone.slice(0, 3).join(', ')}${fpGone.length > 3 ? ', …' : ''})`] : [])].join('; ')}. These only ever go up: module progress is never wiped (Jonathan, 2026-11-13: "modules do not reset for students unless i do it"), so a module once frozen stays frozen (${NEVER}; "Three regimes"). Put them back.`);
  const nums = { frozen: Math.max(treeNums.frozen || 0, baseNums.frozen || 0), open: Math.max(treeNums.open || 0, baseNums.open || 0) };
  const changed = changedSince(root, base.ref, MODULE_SPECS, f => MODULE_FILE.test(f));
  if (fpChanged.length && !changed.length)
    r.err(`1dl: refused — 1ap's fingerprint changed for ${fpChanged.slice(0, 3).join(', ')}${fpChanged.length > 3 ? ', …' : ''} but no module file changed: a re-pin goes with the reword it records (response.renamedChoices in the module, "Three regimes"). Put the old fingerprint back.`);
  if (!changed.length) { if (!r.lines.some(l => l.kind === 'err')) r.ok(`no module file differs from ${base.label}: no progress key can have moved; the frozen numbers (${nums.frozen}, open ${nums.open}) and ${Object.keys(treeNums.fps).length} fingerprints are no lower than the base's`); return r.lines; }
  const proofChanged = baseProofSrc !== null && lf(readText(root, 'tools/rule-zero-proof.mjs') || '') !== baseProofSrc;
  const runs = [runProof(root, base.ref, nums, null)];
  if ((proofChanged || fpChanged.length) && baseProofSrc) runs.push(runProof(root, base.ref, nums, baseProofSrc));
  const lines = runs.flatMap(x => x.out.split('\n'));
  const crosses = [...new Set(lines.filter(l => /^✗ /.test(l)).map(l => l.slice(2)))];
  const ticks = runs[0].out.split('\n').filter(l => /^✓ /.test(l)).map(l => l.slice(2));
  const rest = runs[0].out.split('\n').filter(l => l.trim() && !/^[✓✗] /.test(l) && !/^\s*\(none\)\s*$/.test(l));
  const passed = runs.every(x => x.status === 0);
  const how = `run with the higher of the base's and the tree's numbers (frozen through ${nums.frozen}, open through ${nums.open})${proofChanged ? '; this push changes rule-zero-proof.mjs, so the base\'s copy was run too' : ''}`;
  if (passed) {
    r.ok(`${changed.length} module file${changed.length === 1 ? '' : 's'} changed since ${base.label} (${changed.join(', ')}); tools/rule-zero-proof.mjs passes, ${how}: ${ticks.join('; ')}`);
    rest.forEach(l => r.info(l));
    return r.lines;
  }
  const rev = fpChanged.length ? { why: '1ap fingerprints changed in the same push' } : revertCheck(root, base.ref, changed);
  if (rev.ok) {
    const msg = `1dl LET THROUGH: this change puts ${changed.join(', ')} back as ${changed.length === 1 ? 'it was' : 'they were'} before ${rev.commits.map(c => c.slice(0, 7)).join(', ')}; the oldest change undone (${rev.oldest.h.slice(0, 7)}, "${rev.subject}") was committed ${Math.max(0, rev.hours).toFixed(1)} hours ago, under ${REVERT_MAX_HOURS}: a revert, let through (BREAK-GLASS.md step 4). Without it, rule-zero-proof said: ${crosses.join(' | ') || 'not proved'}`;
    r.warn(msg);
    LET_THROUGH.push(msg);
    if (process.env.GITHUB_ACTIONS === 'true') console.log(`::warning title=1dl let a revert through::${msg.replace(/[\r\n]+/g, ' ')}`);
    return r.lines;
  }
  const crash = crosses.length ? null : (lines.join('\n').match(/^.*Error:.*$/m) || [null])[0];
  r.err(`1dl: refused — this change ${crosses.length ? 'moves a saved place or rewords a frozen quiz' : 'could not be proved safe'} (${NEVER}: never move or renumber a section or step; never reword a keyed quiz's choices or English prompt in Modules 1–${nums.frozen} or in Module ${nums.frozen + 1}, the one after them; "Three regimes"). Module progress keys stay valid for good. Put it back as it was in ${base.ref.slice(0, 7)}${rev.why && !/is not the same as at any earlier/.test(rev.why) ? ` (it is not a revert that can be let through: ${rev.why})` : ''}; a fix a frozen module blocks goes on the list in skill summer-reset. tools/rule-zero-proof.mjs ${base.ref.slice(0, 7)}, ${how}, said:`);
  if (crosses.length) crosses.forEach(c => r.err(`  ${c}`));
  else r.err(`  (the proof did not finish, exit ${runs.map(x => x.status).join('/')}) ${crash || lines.filter(Boolean).slice(-2).join(' | ')}`);
  rest.forEach(l => r.info(l));
  return r.lines;
}

/* ════════════════════════════════════════════════════════════════════
   1dm. FIRESTORE WRITES, READ FROM THE CODE (rules 3, 4)
   ════════════════════════════════════════════════════════════════════ */
/* The pins of 1dm and 1do live in tools/never-pins.json, each with the reason
   and date it was set. `node tools/never-blocks.mjs --pins` lists every value
   that differs from today's code; with `--why "<reason>"` it writes the new
   values and that reason beside them (a deliberate change Jonathan asked for).
   PROGRESS_WRITERS: the only places that may write progress/… directly, by
   file|function, with a fingerprint of each write's statement (target,
   payload and options), so dropping `merge` or changing the doc is a change.
   The save path is a danger zone (CLAUDE.md "Triggers"), so re-pinning one is
   Always Reviewed. A console part (teacher-*.js) may never be listed. */
export const PINS_FILE = 'tools/never-pins.json';
export function loadPins(root) { try { return JSON.parse(readText(root, PINS_FILE)); } catch { return null; } }
/* The code shapes in the console that the reader cannot follow, each the exact
   case, with its reason. Anything else of the same shape fails. */
const UNFOLLOWABLE_TODAY = [
  { file: 'teacher-backup.js', fn: 'teacherBackupDecode', match: c => c.kind === 'escape' && c.base === 'F' && c.detail === 'returned',
    why: 'decodes a reference-typed field VALUE out of a backup file for a restore script (F is the SDK namespace); it is stored inside the decoded data, never written to' },
  { file: 'teacher-mic.js', fn: 'micEvalStrumRule', odd: /^Function\(/, count: 2,
    why: "runs the arcade's own onset condition and smoothing code (ccLoop's and coachSmooth's text, taken from the loaded coach parts) to replay recorded takes; that code lives in coach-*.js, which 1dm reads as code" },
];
const isException = (rec, kind) => UNFOLLOWABLE_TODAY.some(x => x.file === rec.file && x.fn === rec.fn && (kind === 'chain' ? x.match && x.match(rec) : x.odd && x.odd.test(rec.what)));

const compat = (seg, want) => seg === '?' || seg === '*' || seg === want;
const mayBeProgress = p => compat(p[0], 'progress');
function mayBeConfigClass(p, unknownBase) {
  const target = ['config', 'class'];
  if (unknownBase) { const rest = p.slice(1); return rest.length <= 2 && rest.every((s, i) => compat(s, target[target.length - rest.length + i])); }
  if (p.length === 1) return compat(p[0], 'config');            // the collection itself, which can name the doc later
  return p.length === 2 && p.every((s, i) => compat(s, target[i]));
}

/* Every page (each .html outside tools/), and every script one loads: its
   <script src> tags, its inline <script> blocks and on…="" handlers, plus
   what index.html loads later — the arcade and console parts (COACH_JS_PARTS,
   TEACHER_JS_PARTS), the Hear It First files (trainer-site-adapter.js's
   `var need = [...]`), module-N.js (loadModuleData), any literal
   loadScriptOnce('…'), and sw.js. */
export function loadedScripts(root) {
  const g = git(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', '*.html']);
  let pages = g.ok ? g.out.split('\0').filter(Boolean) : [];
  if (!g.ok) for (const d of ['', 'tabs']) { try { for (const f of readdirSync(join(root, d))) if (f.endsWith('.html')) pages.push(d ? `${d}/${f}` : f); } catch { /* none */ } }
  pages = pages.filter(f => !/^(tools|node_modules|screens|song-journey-build)\//.test(f) && existsSync(join(root, f))).sort();
  const scripts = new Set(), inline = [];
  const add = rel => { if (rel && existsSync(join(root, rel)) && /\.m?js$/.test(rel)) scripts.add(rel); };
  for (const page of pages) {
    const html = readText(root, page) || '';
    const dir = posix.dirname(page);
    let n = 0;
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      const src = /\ssrc\s*=\s*["']([^"']+)["']/i.exec(m[1]);
      if (src) { if (!/^(https?:)?\/\//.test(src[1])) add(posix.normalize(posix.join(dir, src[1].replace(/[?#].*$/, '')))); }
      else if (m[2].trim()) {
        const line = html.slice(0, m.index).split('\n').length;
        inline.push({ file: `${page} <script> #${++n}`, src: '\n'.repeat(line - 1) + m[2] });
      }
    }
    const handlers = handlerSources(html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, s => s.replace(/[^\n]/g, ' ')));
    if (handlers.length) inline.push({ file: `${page} on…="" handlers`, src: handlers.map(h => `\n`.repeat(0) + `function __handler_line_${h.line}(event){ ${h.code}\n}`).join('\n') });
  }
  for (const rel of [...siteParts('coach.js', root), ...siteParts('teacher.js', root)]) add(rel);
  /* Every tracked script outside tools/ and vendor/, so one loaded in a way this list cannot see (a built
     name in createElement('script'), loadScriptOnce(variable), importScripts) is still read. Today that adds
     eslint.config.mjs only. */
  const tracked = git(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard', '--', '*.js', '*.mjs']);
  if (tracked.ok) for (const f of tracked.out.split('\0').filter(Boolean)) if (!/^(tools|vendor|node_modules|\.claude|\.github|screens|song-journey-build)\//.test(f)) add(f);
  for (const f of readdirSync(root)) if (/^module-\d+\.js$/.test(f) || /^teacher-[\w-]+\.js$/.test(f)) add(f);
  add('sw.js');
  // literal lazy loads, in any script found so far (and in the ones they find)
  for (let grew = true; grew;) {
    grew = false;
    for (const s of [...scripts]) {
      const text = readText(root, s) || '';
      const need = /var need = \[([^\]]*)\]/.exec(text);
      const lits = [...text.matchAll(/loadScriptOnce\(\s*['"]([^'"]+\.js)['"]/g)].map(x => x[1]);
      for (const rel of [...(need ? [...need[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : []), ...lits]) if (!scripts.has(rel) && existsSync(join(root, rel))) { scripts.add(rel); grew = true; }
    }
  }
  return { pages, scripts: [...scripts].sort(), inline };
}
/* Outside the console, a script is read as code only when it could make a
   reference itself. Any reference it is HANDED was made in a script that does
   (and 1dm follows a reference out of the script it is made in: an "escape").
   Console parts and handler code are always read whole. */
const MAY_TOUCH_FIRESTORE = /\.\s*(?:collection|collectionGroup|doc|runTransaction|batch)\s*\(|\bfirestore\b|\.\s*ref\b|\b(?:setDoc|updateDoc|addDoc|deleteDoc|writeBatch)\b|googleapis/;

function analyzeSite(root) {
  const consoleFiles = new Set([...siteParts('teacher.js', root), ...readdirSync(root).filter(f => /^teacher-[\w-]+\.js$/.test(f))]);
  const ls = loadedScripts(root);
  const entries = [];
  for (const f of ls.scripts) {
    const src = readText(root, f);
    if (src === null) continue;
    const e = { file: f, src, console: consoleFiles.has(f) };
    entries.push(e);
  }
  entries.push(...ls.inline.map(x => ({ ...x, console: false })));
  const tok = e => tokensOf(`${root}::${e.file}`, e.src);
  // Handler code inside each script's strings is code too: read as its own pseudo-file.
  const handlerEntries = [];
  for (const e of entries) {
    if (e.file.includes('<script>') || e.file.includes('handlers')) continue;
    if (!/\bon[a-z]{3,}\s*=/.test(e.src)) continue;
    const hs = scriptHandlerSources(tok(e));
    if (hs.length) handlerEntries.push({ file: `${e.file} on…="" handlers`, src: hs.map(h => `function __handler_line_${h.line}(event){ ${h.code}\n}`).join('\n'), console: e.console, handlersOf: e.file });
  }
  const all = [...entries, ...handlerEntries];
  /* Every script is tokenized (2026-11-13, review R2-8: a TEXT shortcut cannot see a member named in brackets
     from pieces). The chain analysis then runs on a script that, as tokens, could reach Firestore itself: it
     names a Firestore member (collection, doc, ref, set …) as an identifier, or in brackets as a string that
     folds to one ('coll' + 'ection'), indexes a database handle (db[x]), names firestore, eval, Function or
     the REST endpoint. Anything it is HANDED was made in a script that does, and is followed out of there.
     Console parts and handler code are always analyzed. */
  const consts = collectConstants(all.map(tok));
  const handles = collectHandles(all.map(tok));
  const FS_IDS = new Set(['collection', 'doc', 'collectionGroup', 'ref', 'firestore', 'runTransaction', 'batch', 'setDoc', 'updateDoc', 'addDoc', 'deleteDoc', 'writeBatch', 'getFirestore', 'eval', 'Function']);
  const FS_MEMBERS = new Set(['collection', 'doc', 'collectionGroup', 'ref', 'set', 'update', 'add', 'delete', 'batch', 'runTransaction', 'firestore', 'parent']);
  const mayReach = (arr) => {
    for (let k = 0; k < arr.length; k++) {
      const x = arr[k];
      if (x.t === 'tpl') { if (x.quasis.some(q => q.includes('googleapis')) || x.exprs.some(mayReach)) return true; continue; }
      if (x.t === 'id' && (FS_IDS.has(x.v) || (handles.has(x.v) && arr[k + 1] && arr[k + 1].v === '['))) return true;
      if (x.t === 'str' && x.v.includes('googleapis')) return true;
      if (x.t === 'punc' && x.v === '[' && arr[k - 1] && (arr[k - 1].t === 'id' || arr[k - 1].v === ')' || arr[k - 1].v === ']')) {
        let d = 0, j = k + 1;
        for (; j < arr.length; j++) { if (arr[j].t === 'punc' && /^[\[({]$/.test(arr[j].v)) d++; else if (arr[j].t === 'punc' && /^[\])}]$/.test(arr[j].v)) { if (d === 0) break; d--; } }
        const f = foldString(arr.slice(k + 1, j), consts);
        if (f && f.length === 1 && typeof f[0] === 'string' && FS_MEMBERS.has(f[0])) return true;
      }
    }
    return false;
  };
  const relevant = all.filter(e => e.console || e.handlersOf || e.file.includes('handlers') || mayReach(tok(e)));
  const run = (factories, list) => {
    const found = { chains: [], refs: [], odd: [] };
    for (const e of list) {
      const segmentMayReach = arr => mayReach(arr) || arr.some(x => x.t === 'id' && (factories.has(x.v) || x.v === 'setTimeout' || x.v === 'setInterval'));
      const a = analyzeFile(e.file, tok(e), consts, { handles, factories, segmentMayReach });
      for (const k of ['chains', 'refs', 'odd']) a[k].forEach(c => { c.console = e.console; c.handler = !!(e.handlersOf || e.file.includes('handlers')); found[k].push(c); });
    }
    return found;
  };
  let found = run(new Map(), relevant);
  const factories = collectFactories(found.chains);
  if (factories.size) {
    // a second pass only where a reference-returning function is called: those scripts' chains are replaced
    const callsOne = e => tok(e).some((x, i, arr) => x.t === 'id' && factories.has(x.v) && arr[i + 1] && arr[i + 1].v === '(');
    const again = relevant.filter(callsOne), names = new Set(again.map(e => e.file));
    const second = run(factories, again);
    for (const k of ['chains', 'refs', 'odd']) found[k] = [...found[k].filter(c => !names.has(c.file)), ...second[k]];
  }
  return { entries: all, relevant, found, consoleFiles, tok, factories, ls };
}

/* Count, per file|function, the chains that write progress/… or hand a reference to it on. */
function progressWriteSites(found, consoleToo) {
  const sites = new Map();
  for (const c of found.chains) {
    if ((!consoleToo && c.console) || !mayBeProgress(c.path) || !(c.kind === 'write' || c.kind === 'escape')) continue;
    if (isException(c, 'chain')) continue;
    const fileKey = c.file.replace(/ on…="" handlers$/, '');
    const k = `${fileKey}|${c.fn}`;
    if (!sites.has(k)) sites.set(k, []);
    sites.get(k).push(c);
  }
  for (const x of found.refs) if (x.paths && x.paths.some(mayBeProgress) && x.writes && (consoleToo || !x.console)) {
    const k = `${x.file}|${x.fn}`;
    if (!sites.has(k)) sites.set(k, []);
    sites.get(k).push({ ...x, kind: 'write', detail: '.ref write', path: x.paths[0] });
  }
  return sites;
}

export function checkFirestoreWrites(root = DEFAULT_ROOT) {
  const r = R();
  const { entries, relevant, found, consoleFiles, tok, factories, ls } = analyzeSite(root);
  const bad = [];
  const where = c => `${c.file}:${c.line} (${c.fn})`;
  const RULE3 = `${NEVER}: never write progress/{uid} from console code — the console reads students' saved work and never changes it`;
  const RULE4 = `${NEVER}: never write config/class except through teacherWriteConfig() — the one writer that checks no other console changed it first (checks.mjs 1ai)`;
  const cannot = (o) => `this check cannot tell where it writes: ${o.what}. ${o.todo ? o.todo[0].toUpperCase() + o.todo.slice(1) : 'Write the Firestore call out plainly'}, where 1dm can read it.`;

  // Rule 3a: the pinned direct writers of progress/…, across every script a page loads.
  const pins = loadPins(root);
  if (!pins) bad.push(`1dm: ${PINS_FILE} is missing or not valid JSON — the pins of 1dm and 1do live there`);
  const PW = (pins && pins.PROGRESS_WRITERS) || {};
  const sites = progressWriteSites(found, false);
  for (const [k, list] of sites) {
    const pin = PW[k];
    const head = c => `${where(c)} ${c.kind === 'write' ? `writes ${c.path[0] === 'progress' ? 'progress/…' : `a path this check cannot name (${pathString(c.path)})`} with ${c.detail}` : `hands a reference to ${c.path[0] === 'progress' ? 'progress/…' : `a path this check cannot name (${pathString(c.path)})`} on (${c.detail})`}`;
    if (!pin) { bad.push(`1dm: refused — ${head(list[0])}, and no new place may write a student's saved work (${NEVER}; the pinned writers are PROGRESS_WRITERS in ${PINS_FILE}). If it is deliberate and not console code: node tools/never-blocks.mjs --pins --why "<reason>" — a save-path change, Always Reviewed.`); continue; }
    const want = [...pin.value];
    for (const c of list) {
      const i = want.indexOf(c.sig);
      if (i >= 0) { want.splice(i, 1); continue; }
      bad.push(`1dm: refused — ${head(c)}: a write to progress/… in a pinned writer that is new or changed (statement ${c.sig}, not among the ${pin.value.length} pinned for ${k}; ${pin.why}). A changed target, payload or option (merge) changes what students' saved work becomes. If it is deliberate: node tools/never-blocks.mjs --pins --why "<reason>" — a save-path change, Always Reviewed.`);
    }
  }
  for (const k of Object.keys(PW)) {
    if (consoleFiles.has(k.split('|')[0])) bad.push(`1dm: ${PINS_FILE} lists ${k} in PROGRESS_WRITERS, a console part — the console may never write progress/… (${RULE3}).`);
  }
  const stalePins = Object.entries(PW).filter(([k, v]) => { const have = (sites.get(k) || []).map(c => c.sig); return v.value.some(x => !have.includes(x)); }).map(([k]) => k);

  // Rule 3b: the console never writes progress/… nor lets a reference to it out of a read.
  let progressReads = 0;
  for (const c of found.chains) {
    if (!c.console || !mayBeProgress(c.path)) continue;
    if (c.kind === 'read' || c.kind === 'tracked') { if (c.path[0] === 'progress') progressReads++; continue; }
    if (isException(c, 'chain')) continue;
    const what = c.kind === 'write' ? `writes ${c.path[0] === 'progress' ? 'progress/…' : `a path this check cannot name (${pathString(c.path)}), so it may be progress/…`} with ${c.detail}`
      : `lets a reference to ${c.path[0] === 'progress' ? 'progress/…' : `a path this check cannot name (${pathString(c.path)})`} out of a read (${c.detail}), where it could be written`;
    bad.push(`1dm: refused — ${where(c)} ${what} (${RULE3}). Read it with .get() and change nothing there; a student's own page saves their work.`);
  }
  for (const x of found.refs) {
    if (!x.console) continue;
    if (!x.paths) bad.push(`1dm: refused — ${where(x)} takes .ref from "${x.base}"; this check cannot tell which query that snapshot came from, so the write it allows may land in progress/… (${RULE3}). Take the snapshot from a db.collection('<name>') query in the same function, as teacherMicDelete and teacherErrorsDeleteOld do.`);
    else if (x.paths.some(mayBeProgress)) bad.push(`1dm: refused — ${where(x)} takes .ref from a progress snapshot (${x.paths.map(pathString).join(', ')}), which is a handle for writing a student's saved work (${RULE3}). Use the snapshot's .data() and change nothing.`);
  }
  const oddCount = new Map();
  for (const o of found.odd) {
    if (!o.console) continue;
    if (isException(o, 'odd')) { const k = `${o.file}|${o.fn}`; oddCount.set(k, (oddCount.get(k) || 0) + 1); continue; }
    bad.push(`1dm: refused — ${where(o)}: ${cannot(o)} In the console it could write progress/… unseen (${RULE3}).`);
  }
  for (const x of UNFOLLOWABLE_TODAY.filter(x => x.count)) {
    const n = oddCount.get(`${x.file}|${x.fn}`) || 0;
    if (n > x.count) bad.push(`1dm: refused — ${x.file} ${x.fn}() now has ${n} pieces of code this check cannot read, ${x.count} expected (the ${x.count} it has always had: ${x.why}) (${RULE3}).`);
  }
  // Rule 3c: the console calls no app function that saves progress (directly, or through what it calls).
  const writers = new Set([...sites.keys()].map(k => k.split('|')[1]).filter(f => f !== '(top level)'));
  const graph = new Map();
  for (const e of entries) {
    if (e.console || e.file === 'sw.js' || e.file.startsWith('tabs/') || e.file.includes('<script>') || e.file.includes('handlers')) continue;
    if (!/\.m?js$/.test(e.file) || /^module-\d+\.js$/.test(e.file)) continue;
    for (const [k, v] of callGraph(e.file, tok(e))) if (k !== '(top level)' && !v.data) { if (!graph.has(k)) graph.set(k, new Set()); v.calls.forEach(c => graph.get(k).add(c)); }
  }
  const reach = new Set(writers);
  for (let grew = true; grew;) { grew = false; for (const [k, calls] of graph) if (!reach.has(k) && [...calls].some(c => reach.has(c))) { reach.add(k); grew = true; } }
  /* The list: a function is on it only if a chain of calls from its body (NAME(…), or a function handed on
     by name) reaches a progress write; a data table (const NAME = { … }) is not a function and is never on it.
     Any mention of such a function in console code is refused, called or not: handed to setTimeout or
     .then, aliased, .call()ed, (0, f)() or named in brackets all run it. Not a mention: a local of the same
     name, someone else's member (obj.f), an object key or method of that name. The one exception that exists
     today is the exact case below, with its reason. */
  const MENTION_OK = [{ file: 'teacher-mic.js', name: 'ccLoop', ctx: 'String(', count: 1, why: "the mic evaluator reads ccLoop's TEXT (String(ccLoop)) to replay recorded takes; it never calls it" }];
  let consoleCalls = 0, mentionOk = 0;
  const okUsed = new Map();
  for (const e of entries.filter(e => e.console)) {
    const t = tok(e);
    for (const seg of segments(t)) {
      const body = t.slice(seg.from, seg.to);
      const locals = localNames(body); locals.delete(seg.name);
      consoleCalls += realCalls(body, locals).length;
      const walk = arr => arr.forEach((x, k) => {
        if (x.t === 'tpl') { x.exprs.forEach(walk); return; }
        if (x.t === 'str' && reach.has(x.v) && arr[k - 1] && arr[k - 1].v === '[' && arr[k + 1] && arr[k + 1].v === ']') {
          bad.push(`1dm: refused — ${e.file}:${x.line} (${seg.name}) names ${x.v} in brackets (["${x.v}"]), an app function that saves to progress/… (${RULE3}). Show the student's work from the console's own read instead.`);
          return;
        }
        if (x.t !== 'id' || !reach.has(x.v) || locals.has(x.v)) return;
        const p = arr[k - 1], n = arr[k + 1];
        if (p && p.t === 'punc' && (p.v === '.' || p.v === '?.') && !(arr[k - 2] && arr[k - 2].t === 'id' && /^(window|globalThis|self|this)$/.test(arr[k - 2].v) && !(arr[k - 3] && arr[k - 3].t === 'punc' && arr[k - 3].v === '.'))) return;
        if (n && n.t === 'punc' && n.v === ':' && p && p.t === 'punc' && (p.v === '{' || p.v === ',')) return;                        // an object key
        if (n && n.t === 'punc' && n.v === '(' && p && p.t === 'punc' && /^[{},;]$/.test(p.v)) { const close = matchCloseTok(arr, k + 1); if (arr[close + 1] && arr[close + 1].v === '{') return; }   // a method definition
        if (p && p.t === 'id' && p.v === 'function') return;                                                                             // its own declaration (a local)
        const ex = MENTION_OK.find(m => m.file === e.file && m.name === x.v && p && p.v === '(' && arr[k - 2] && arr[k - 2].v === 'String' && n && n.v === ')');
        if (ex) { okUsed.set(ex, (okUsed.get(ex) || 0) + 1); mentionOk++; return; }
        bad.push(`1dm: refused — ${e.file}:${x.line} (${seg.name}) ${n && n.v === '(' ? 'calls' : 'mentions'} ${x.v}, an app function that saves to progress/… (${writers.has(x.v) ? 'directly' : 'through the functions it calls'}); handed on, aliased or called, it would write the signed-in account's progress from the console (${RULE3}). Show the student's work from the console's own read instead.`);
      });
      walk(body);
    }
  }
  for (const m of MENTION_OK) if ((okUsed.get(m) || 0) > m.count) bad.push(`1dm: refused — ${m.file} now mentions ${m.name} ${okUsed.get(m)} times as ${m.ctx}…), ${m.count} expected (${m.why}) (${RULE3}).`);
  for (const e of entries.filter(e => e.console && e.handlersOf)) {
    for (const c of realCalls(tok(e))) if (reach.has(c.name)) bad.push(`1dm: refused — ${e.handlersOf} writes an inline handler that calls ${c.name}(), which saves to progress/… (${RULE3}).`);
  }

  // Rule 4: config/class is written only inside teacherWriteConfig(), declared once, in teacher-config.js.
  const decls = [];
  for (const e of entries) {
    if (e.handlersOf || e.file.includes('handlers')) continue;
    const t = tok(e);
    for (let k = 0; k + 1 < t.length; k++) {
      if (t[k].t === 'id' && t[k].v === 'function' && t[k + 1].t === 'id' && t[k + 1].v === 'teacherWriteConfig') decls.push(`${e.file}:${t[k].line}`);
      if (t[k].t === 'id' && t[k].v === 'teacherWriteConfig' && t[k + 1].t === 'punc' && t[k + 1].v === '=' && !(t[k - 1] && t[k - 1].t === 'punc' && t[k - 1].v === '.' && !(t[k - 2] && /^(window|globalThis|self)$/.test(t[k - 2].v)))) decls.push(`${e.file}:${t[k].line} (assigned)`);
    }
  }
  if (decls.length !== 1 || !decls[0].startsWith('teacher-config.js:'))
    bad.push(`1dm: refused — teacherWriteConfig must be declared exactly once, in teacher-config.js (found ${decls.length ? decls.join(', ') : 'none'}): config/class's only writer is that one function (${RULE4}).`);
  let configReads = 0, guardWrites = 0;
  const inGuard = c => c.console && c.file === 'teacher-config.js' && c.fn === 'teacherWriteConfig';
  for (const c of found.chains) {
    if (!mayBeConfigClass(c.path, c.unknownBase)) continue;
    if (c.kind === 'read' || c.kind === 'tracked') { configReads++; continue; }
    if (inGuard(c)) { guardWrites++; continue; }
    if (isException(c, 'chain')) continue;
    if (mayBeProgress(c.path) && c.path[0] !== 'config' && (c.console || sites.has(`${c.file}|${c.fn}`))) continue;   // already judged above as a may-be-progress path
    const what = c.kind === 'write' ? `writes ${c.path.join('/') === 'config/class' ? 'config/class' : `a path that may be config/class (${pathString(c.path)})`} with ${c.detail}`
      : `lets a reference to ${c.path.join('/') === 'config/class' ? 'config/class' : `a path that may be config/class (${pathString(c.path)})`} out of a read (${c.detail}), where it could be written`;
    bad.push(`1dm: refused — ${where(c)} ${what} (${RULE4}). Call teacherWriteConfig(patch) instead.`);
  }
  for (const x of found.refs) {
    if (x.paths && x.paths.some(p => mayBeConfigClass(p, false)) && !inGuard(x))
      bad.push(`1dm: refused — ${where(x)} takes .ref from a config/class snapshot, a handle for writing it outside teacherWriteConfig() (${RULE4}).`);
  }
  if (!found.chains.some(c => inGuard(c) && c.path.join('/') === 'config/class'))
    bad.push('1dm: teacherWriteConfig() no longer names config/class in a way this check can read — the one allowed writer is gone or rewritten (checks.mjs 1ai pins its shape)');

  if (bad.length) { [...new Set(bad)].forEach(b => r.err(b)); return r.lines; }
  if (stalePins.length) r.warn(`1dm: PROGRESS_WRITERS pins writes the code no longer has: ${stalePins.join(', ')} — re-pin (node tools/never-blocks.mjs --pins --why "<reason>"), so a new write there is caught`);
  const consoleChains = found.chains.filter(c => c.console).length;
  r.ok(`${entries.filter(e => !e.handlersOf).length} scripts from ${ls.pages.length} pages (${relevant.length} that can reach Firestore read as code, inline handlers included; ${[...consoleFiles].length} console parts): progress/… is written only where PROGRESS_WRITERS says (${sites.size} places, ${[...sites.values()].reduce((a, l) => a + l.length, 0)} write statements, each its pinned fingerprint); in the console ${consoleChains} Firestore chains, ${progressReads} on progress/… and every one a read, ${found.refs.filter(x => x.console).length} snapshot .refs traced to non-progress queries, ${consoleCalls} calls and no mention of the ${reach.size} app functions that save progress (${mentionOk} read as text: the named exception); config/class: ${configReads} reads, ${guardWrites} writes, all inside the one teacherWriteConfig(); ${factories.size} reference-returning functions followed; ${UNFOLLOWABLE_TODAY.length} console shapes it cannot follow, each the exact case named in tools/never-blocks.mjs`);
  return r.lines;
}

/* ════════════════════════════════════════════════════════════════════
   1dn. A firestore.rules CHANGE IS PASTED BY JONATHAN (rule 5)
   GitHub Pages never publishes firestore.rules: until Jonathan pastes it in
   the Firebase console, the live rules are the old ones, and code that needs
   the new ones fails with no error a student can see. Three parts:
   - THE CHANGE: a push whose firestore.rules differs from the base needs one
     more record line in RULES-PASTE.md than the base had, naming the first 12
     hex of the sha256 of the new text (line endings as LF), in exactly the form
     the check prints, dated no earlier than the rules' last change. Adding the
     printed line again works even when the same words are already there.
   - THE STATE: whatever the base, the current firestore.rules text must be named
     by a record line. So a red on GitHub after a push has landed stays red on
     the next push until the line is added: it cannot clear itself.
   - THE HOOKS: the pre-push and pre-commit hooks git will run (core.hooksPath,
     often an older checkout's .githooks/) must be this tree's copies, or a stale
     hook could skip the block.
   Record lines are append-only. It blocks at the push: GC_CHECKS_STAGE=push
   (the pre-push hook, GitHub), or, when that is unset, a parent process that is
   the pre-push hook (found with `ps`, which works on macOS and Linux; on Windows
   Git Bash it may not, so there it relies on the hook's GC_CHECKS_STAGE). At a
   commit or a turn's end it warns, so work in progress is not stuck.
   ════════════════════════════════════════════════════════════════════ */
export const RULES_FILE = 'firestore.rules';
export const PASTE_FILE = 'RULES-PASTE.md';
export const rulesHash = text => sha(lf(text));
const RECORD = /^- (\d{4}-\d{2}-\d{2}) firestore\.rules ([0-9a-f]{12}): (.*)$/;
const ACK_TAIL = d => `Jonathan was told on ${d} to paste it in the Firebase console (Firestore → Rules → Publish)`;
export const ackLine = (date, hash) => `- ${date} firestore.rules ${hash}: ${ACK_TAIL(date)}`;
const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const tally = lines => lines.reduce((m, l) => m.set(l, (m.get(l) || 0) + 1), new Map());
export function pushStage() {
  const st = process.env.GC_CHECKS_STAGE;
  if (st === 'push') return { push: true, how: 'GC_CHECKS_STAGE=push' };
  if (st) return { push: false, how: `GC_CHECKS_STAGE=${st}` };
  for (let pid = process.ppid, i = 0; pid > 1 && i < 3; i++) {
    const r = spawnSync('ps', ['-o', 'ppid=,args=', '-p', String(pid)], { encoding: 'utf8' });
    if (r.status !== 0 || !r.stdout.trim()) break;
    const m = r.stdout.trim().match(/^(\d+)\s+(.*)$/);
    if (!m) break;
    if (/(^|[\/\s])pre-push(\s|$)/.test(m[2])) return { push: true, how: 'run by the pre-push hook (seen with ps)' };
    pid = Number(m[1]);
  }
  return { push: false, how: 'not at a push' };
}
/* The hooks git will run, compared with main's .githooks/ copies (the base's; this tree's when there is
   no base). A hook older than main's could skip a block, so that is refused at the push. A push that itself
   changes a hook is told to update the hooks folder after it lands (else no hook change could ever land). */
export function staleHooks(root, baseRef) {
  const hp = git(root, ['config', '--get', 'core.hooksPath']);
  if (!hp.ok || !hp.out) return { unset: true, list: [], ahead: [] };
  const top = git(root, ['rev-parse', '--show-toplevel']).out || root;
  const dir = hp.out.startsWith('/') || /^[A-Za-z]:[\\/]/.test(hp.out) ? hp.out : join(top, hp.out);
  const list = [], ahead = [];
  for (const h of ['pre-push', 'pre-commit']) {
    const mine = readText(root, `.githooks/${h}`);
    const mainCopy = baseRef ? (g => g.ok ? lf(g.raw) : null)(git(root, ['show', `${baseRef}:.githooks/${h}`])) : mine;
    const used = (() => { try { return lf(readFileSync(join(dir, h), 'utf8')); } catch { return null; } })();
    if (used === mine) continue;
    if (mainCopy !== null && used !== mainCopy) list.push(`${join(dir, h)}${used === null ? ' (missing)' : ''}`);
    else ahead.push(h);
  }
  return { dir, list, ahead };
}
export function checkRulesPaste(root = DEFAULT_ROOT) {
  const r = R();
  const stage = pushStage();
  const atPush = stage.push;
  const block = t => atPush ? r.err(t) : r.warn(`${t} (a warning here; the push will refuse it)`);
  // THE HOOKS (git's own runs only; GitHub has none)
  const hookCheck = (baseRef) => {
    if (process.env.GITHUB_ACTIONS === 'true') return;
    const sh = staleHooks(root, baseRef);
    if (sh.unset) r.warn(`1dn: git runs no hooks here (core.hooksPath is not set), so no check runs before a commit or a push. Run: git config core.hooksPath .githooks`);
    else if (sh.list.length) block(`1dn: refused — the hooks this push runs are an older copy: ${sh.list.join(', ')} ${sh.list.length === 1 ? 'is' : 'are'} not main's, so a check may be skipped. Bring the folder they live in up to date: git -C "${dirname(sh.dir)}" pull --ff-only. If that cannot fast-forward (that checkout has commits of its own, or is not on main), point git at this tree's hooks instead: git config core.hooksPath "${join(git(root, ['rev-parse', '--show-toplevel']).out || root, '.githooks')}" (and set it back once that checkout is up to date)`);
    else if (sh.ahead.length) r.warn(`1dn: this change updates ${sh.ahead.join(' and ')} in .githooks/; the copy git runs (${sh.dir}) is main's. After it lands, bring that folder up to date: git -C "${dirname(sh.dir)}" pull --ff-only (if it cannot fast-forward, git config core.hooksPath to an up-to-date checkout's .githooks)`);
  };
  const base = resolveBase(root);
  hookCheck(base.ref || null);
  if (base.missing) { r.err(`1dn: cannot compare with the push's base: ${base.missing}`); return r.lines; }
  const now = readText(root, RULES_FILE);
  const nowLines = (readText(root, PASTE_FILE) || '').split('\n').filter(l => RECORD.test(l));
  const today = todayLocal();
  /* A record line counts only in the printed form, for this text. When THIS push changes the rules, it must
     also be dated no earlier than that change: the last commit in base..HEAD that touched the file (its
     author date, which a rebase keeps), or today when the change is not committed. When the rules equal the
     base's, any printed-form line naming the hash counts: the date of a change made in an earlier push is
     not this push's business (and a shallow checkout cannot see it; review R3-1). */
  let changedOn = '0000-00-00';
  const valid = (l, h) => {
    const m = l.match(RECORD);
    if (!m || m[2] !== h || m[3] !== ACK_TAIL(m[1])) return false;
    const d = new Date(`${m[1]}T12:00:00`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== m[1]) return false;
    if (m[1] > today && (new Date(`${m[1]}T00:00:00`) - new Date()) > 36 * 3600e3) return false;   // not in the future (a day's slack)
    return m[1] >= changedOn;
  };
  const changeDate = baseRef => {
    if (!git(root, ['diff', '--quiet', 'HEAD', '--', RULES_FILE]).ok) return today;          // changed and not committed
    const d = baseRef ? git(root, ['log', '-1', '--format=%as', `${baseRef}..HEAD`, '--', RULES_FILE]).out : '';
    return d || today;
  };
  const h = now === null ? null : rulesHash(now);
  if (base.none) {
    const t = touchesWithoutBase(root, [RULES_FILE], f => f === RULES_FILE);
    changedOn = changeDate(null);
    if (t && t.length && !(h && nowLines.some(l => valid(l, h)))) block(`1dn: refused — firestore.rules changed, and ${base.none}, so this check cannot tell whether Jonathan was told (${NEVER}). Run git fetch origin (so origin/main exists) and check again.`);
    else r.warn(`1dn: ${base.none}; nothing to compare firestore.rules with`);
    return r.lines;
  }
  // Record lines are append-only: every one the base had stays, unchanged.
  const baseLog = git(root, ['show', `${base.ref}:${PASTE_FILE}`]);
  const beforeLines = baseLog.ok ? lf(baseLog.raw).split('\n').filter(l => RECORD.test(l)) : [];
  const nowTally = tally(nowLines), beforeTally = tally(beforeLines);
  const lost = [...beforeTally].filter(([l, n]) => (nowTally.get(l) || 0) < n).map(([l]) => l);
  if (lost.length) block(`1dn: refused — ${PASTE_FILE} lost or changed ${lost.length} record line${lost.length === 1 ? '' : 's'} the base had ("${lost[0].slice(0, 90)}"${lost.length > 1 ? ', …' : ''}); it is the record of what Jonathan was told, so record lines are only ever added (${NEVER}). Put ${lost.length === 1 ? 'it' : 'them'} back as ${lost.length === 1 ? 'it was' : 'they were'}.`);
  if (now === null) { block(`1dn: refused — firestore.rules is gone. The live rules stay whatever was last pasted; deleting the file changes nothing there and loses the record (${NEVER}). Put it back.`); return r.lines; }
  const diff = git(root, ['diff', '--quiet', base.ref, '--', RULES_FILE]);
  if (diff.status !== 0 && diff.status !== 1) { r.err(`1dn: git could not compare firestore.rules with ${base.label}: ${diff.err}`); return r.lines; }
  const untracked = git(root, ['ls-files', '--others', '--exclude-standard', '--', RULES_FILE]).out;
  const thenText = git(root, ['show', `${base.ref}:${RULES_FILE}`]);
  const same = (diff.status === 0 && !untracked) || (thenText.ok && rulesHash(now) === rulesHash(thenText.raw));
  if (!same) changedOn = changeDate(base.ref);
  const want = ackLine(today >= changedOn ? today : changedOn, h);
  const acked = nowLines.filter(l => valid(l, h));
  if (same) {
    if (acked.length) { if (!lost.length) r.ok(`firestore.rules is unchanged since ${base.label}: nothing new for Jonathan to paste; its text (${h}) is on record in ${PASTE_FILE} ("${acked[acked.length - 1].slice(2, 60)}…")${baseLog.ok ? '' : ` (${PASTE_FILE} is new on this branch)`}`); }
    else block(`1dn: refused — the rules on main are not acknowledged: firestore.rules (${h}) is not named by any record line in ${PASTE_FILE}${baseLog.ok ? '' : ` (the file is not on main yet)`}. If a push that changed the rules has already landed: tell Jonathan it needs pasting in the Firebase console, add this line to ${PASTE_FILE} and push:  ${want}`);
    return r.lines;
  }
  r.warn(`firestore.rules changed: Jonathan must paste it in the Firebase console (Firestore → Rules → paste → Publish); GitHub does not publish it.`);
  const added = acked.filter(l => (nowTally.get(l) || 0) > (beforeTally.get(l) || 0));
  if (added.length) { if (!lost.length) r.ok(`firestore.rules ${h} acknowledged by a new line in ${PASTE_FILE}: "${added[0].slice(2)}"`); return r.lines; }
  const near = nowLines.filter(l => (nowTally.get(l) || 0) > (beforeTally.get(l) || 0) && !valid(l, h));
  block(`1dn: refused — firestore.rules differs from ${base.label} and ${PASTE_FILE} has no new line for this exact text (sha256 ${h}) in the printed form (${NEVER}: never change firestore.rules without telling Jonathan it needs a console paste; the steps are under "Other standing rules"). Tell Jonathan first, then add this line to ${PASTE_FILE}:  ${want}${near.length ? `  (the new line there, "${near[0].slice(0, 80)}…", is not that form, names another text, or is dated before the rules changed on ${changedOn})` : ''}`);
  return r.lines;
}

/* ════════════════════════════════════════════════════════════════════
   1do. THINGS THAT STAY AS THEY ARE (rules 6, 7, 8)
   Every pin below is changed the same way when Jonathan asks for a change to
   the thing it guards: run `node tools/never-blocks.mjs --pins`, paste the new
   value, and put the date and his reason in the comment beside it.
   ════════════════════════════════════════════════════════════════════ */
/* "The cure" is the loudness every backing track is levelled to (−12.5 LUFS,
   tools/loudness.py, checks.mjs 1bu): re-levelling it would silently move the
   target for every other song. Its four files are pinned by the same hash
   sw.js's AUDIO_HASHES uses (tools/sw-audio-map.mjs fileHash: the first 10 hex
   of the sha256 of the bytes; audio is binary, so no line endings), and the
   pins must match that map too. */
export const CURE_SLUG = 'olivia-rodrigo-the-cure';
export const CURE_AUDIO = {
  'audio/olivia-rodrigo-the-cure-backing-Am-120bpm-440hz-full.mp3': '1a5e1bf343',
  'audio/olivia-rodrigo-the-cure-backing-Am-120bpm-440hz-rhythm-down.mp3': 'df874dc77f',
  'audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-full.mp3': 'f3f8742c93',
  'audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-rhythm-down.mp3': '7a658c5026',
};
/* Switched off, never deleted (CLAUDE.md "Play-along first" and "Other
   standing rules"), and not hollowed out. The pins are in tools/never-pins.json,
   each with its reason and date:
   - DAILY5_FUNCTIONS: each function's token fingerprint (comments, spacing and
     line endings do not count; any change to its code does); a second
     declaration of one of those names anywhere also fails (it would shadow it);
   - SWITCH_READS: a fingerprint of the innermost function that reads each
     switch, so `DAILY5_ENABLED && false && …`, an `if(0){…}` around the read
     or an early return above it is a change;
   - DAILY5_CSS: every selector naming a .daily5 class, each with a non-empty rule;
   - DAILY5_INDEX_MARKUP, WARMUP_BANK_MIN: counts; the daily5 strings must be
     non-empty in English and Spanish;
   - TAKE_TO_SONG_STEPS: every step, by a hash of its label, text, label_es and
     text_es, per module.
   Adding is fine. A change that keeps it working (a renamed helper, an
   accessibility attribute) is re-pinned with its reason:
   node tools/never-blocks.mjs --pins --why "<reason>". */
const SWITCHES = ['DAILY5_ENABLED', 'TAKE_TO_SONG_ENABLED'];
const DAILY5_KEYS = ['daily5.tuneWarmupHtml', 'daily5.openToday', 'daily5.title', 'daily5.closeAria', 'daily5.tuneUpBody', 'daily5.warmUp', 'daily5.todaysDrill', 'daily5.fromModule', 'daily5.streak'];
/* The student tour (tour.html + 13 screenshots in tour-img/) was deleted
   2026-08-27 (5dc1ab8): it taught the retired three-station model. Jonathan is
   building a new one, so new files (in tour-img/ too, with any title) are
   allowed; the old ones, from any of its four versions, are not. Pinned by git
   blob id (sha1 of "blob <len>\0" + bytes; for a text file also of its bytes
   with CRLF made LF, so a Windows checkout's copy matches), so a restore under
   any name is caught, and by two phrases from its slides that a lightly edited
   restore keeps. */
const TOUR_BLOBS = {
  '7f28752191042b8eb40940b223c7f4822d521efd': 'tour.html (5dc1ab8^)', '3f61eace369907bccc2c7fc6808504b1cc78bb72': 'tour.html (an earlier version)',
  '62291008892563b4a682cfc4edd56df5f84cdbac': 'tour.html (an earlier version)', 'fb0ead686a9db6a24a07d03f8d888c83fcd4cb18': 'tour.html (an earlier version)',
  'f671a300638a7fe6b56c38fbb505a2fa35dd6fe0': 'tour-img/checklist.webp', '402cf54251f56ea58ede877adba423ae97449b6b': 'tour-img/coach-button.webp',
  'b63c3fd717013a020d86850bb80a8d5db41d93b2': 'tour-img/coach-card.webp', '95698153d7b7e7eed6f57b589473807b5b3b3cee': 'tour-img/explore.webp',
  'a39fa83f5e9efb14be4c433ad9638571604e020d': 'tour-img/header.webp', 'c3a346cd2a684f0b8125fccbb4f9656a0c0c4169': 'tour-img/metronome.webp',
  '0b15a24170b00ef262038b3a1e8c979daad93ce3': 'tour-img/modules-sets.webp', '3c982dbf32b6ae2e7cee5a69f016f517c90854ef': 'tour-img/overview.webp',
  '4aa018446849d19baf6036be56879ad5a1815102': 'tour-img/signin.webp', '96084d7f00b026dca29611b2c42e09ff561ef325': 'tour-img/songs.webp',
  '13ebd9725956df0ff2e410d4e896cd93f6c8c862': 'tour-img/station-b.webp', '7bd2ed7423b6337d4414291da5617e5fef4f726d': 'tour-img/this-set.webp',
  'e85c483231760ff465af70b50f4da3299f4a8437': 'tour-img/tools.webp',
};
const TOUR_TEXT_SIZES = new Set([33341, 29198, 30403]);
const TOUR_SIZES = new Set([33341, 29198, 30403, 53188, 32006, 41390, 11152, 9256, 10424, 9414, 57252, 21902, 75982, 54786, 10476, 3862]);
const TOUR_PHRASES = ['Welcome! This is your practice home.', 'Go make some noise.'];
const blobId = buf => createHash('sha1').update(`blob ${buf.length}\0`).update(buf).digest('hex');

function treeFiles(root) {
  const g = git(root, ['ls-files', '-z', '--cached', '--others', '--exclude-standard']);
  if (g.ok) return [...new Set(g.out.split('\0').filter(Boolean))].filter(f => existsSync(join(root, f)));
  const out = [];
  const walk = (dir) => {
    for (const d of readdirSync(join(root, dir), { withFileTypes: true })) {
      if (d.name.startsWith('.') || d.name === 'node_modules') continue;
      const p = dir ? `${dir}/${d.name}` : d.name;
      if (d.isDirectory()) walk(p); else out.push(p);
    }
  };
  walk('');
  return out;
}

function loadSets(root) {
  const cfg = readText(root, 'config-main.js');
  const sets = [];
  for (const f of readdirSync(root).filter(f => /^module-\d+\.js$/.test(f))) {
    const sb = { console: { log() {}, warn() {}, error() {} } };
    vm.createContext(sb);
    vm.runInContext(cfg, sb);
    vm.runInContext(readText(root, f), sb, { filename: f });
    sets.push(...vm.runInContext('SETS', sb));
  }
  return sets;
}
const tokenSig = t => t.t === 'tpl' ? `tpl(${t.quasis.map(q => JSON.stringify(q)).join(',')};${t.exprs.map(e => e.map(tokenSig).join(' ')).join(';')})` : `${t.t}:${t.v}`;
const stepHash = st => sha([st.label, st.text, st.label_es, st.text_es].map(x => x == null ? '' : String(x)).join('\u0001'), 8);

/* The fingerprint of the innermost function (declaration or arrow) that holds toks[k]: a switch read is
   pinned with its whole function, so `if(0){…}` around it or an early return above it is a change. */
function innermostFunctionSig(t, k) {
  let d = 0;
  for (let j = k - 1; j >= 0; j--) {
    const y = t[j];
    if (y.t !== 'punc') continue;
    if (y.v === '}' || y.v === ')' || y.v === ']') { d++; continue; }
    if (y.v === '(' || y.v === '[') { if (d) d--; continue; }
    if (y.v !== '{') continue;
    if (d) { d--; continue; }
    // an enclosing block: is it a function body?
    const p = t[j - 1];
    let start = -1;
    if (p && p.t === 'punc' && p.v === '=>') {
      const q = t[j - 2];
      if (q && q.t === 'punc' && q.v === ')') { let dd = 0, i = j - 2; for (; i >= 0; i--) { if (t[i].v === ')') dd++; else if (t[i].v === '(') { dd--; if (!dd) break; } } start = i; }
      else start = j - 2;
    } else if (p && p.t === 'punc' && p.v === ')') {
      let dd = 0, i = j - 1; for (; i >= 0; i--) { if (t[i].v === ')') dd++; else if (t[i].v === '(') { dd--; if (!dd) break; } }
      const before = t[i - 1], before2 = t[i - 2];
      if ((before && before.v === 'function') || (before && before.t === 'id' && before2 && before2.v === 'function')) start = before.v === 'function' ? i - 1 : i - 2;
    }
    if (start >= 0) return sha(t.slice(start, matchCloseTok(t, j) + 1).map(tokenSig).join(' '));
  }
  return sha(t.map(tokenSig).join(' '));   // top level: the whole file
}

/* Today's value of every 1do pin (also what --pins compares and writes). `fnNames` = the pinned functions. */
export function measureKept(root, sets, fnNames) {
  const appFiles = siteParts('app.js', root);
  const fnSig = {}, declared = {}, reads = {}, fnDecls = {};
  for (const sw of SWITCHES) { declared[sw] = []; reads[sw] = []; }
  for (const f of fnNames) fnDecls[f] = [];
  for (const f of appFiles) {
    const src = readText(root, f) || '';
    const t = tokensOf(`${root}::${f}`, src);
    for (const seg of segments(t)) if (fnNames.includes(seg.name) && t[seg.from].v !== 'const') fnSig[seg.name] = sha(t.slice(seg.from, seg.to).map(tokenSig).join(' '));
    for (let k = 0; k < t.length; k++) {
      const x = t[k];
      if (x.t !== 'id' || !SWITCHES.includes(x.v)) continue;
      if (t[k - 1] && t[k - 1].t === 'id' && t[k - 1].v === 'const' && t[k + 1] && t[k + 1].v === '=') declared[x.v].push(t[k + 2] && t[k + 2].t === 'id' && t[k + 3] && t[k + 3].v === ';' ? t[k + 2].v : '(not a literal)');
      else if (!(t[k - 1] && t[k - 1].t === 'punc' && (t[k - 1].v === '.' || t[k - 1].v === '?.'))) reads[x.v].push(innermostFunctionSig(t, k));
    }
  }
  // every declaration of a pinned function's name, in every script a page loads
  for (const f of loadedScripts(root).scripts) {
    if (/^module-\d+\.js$/.test(f)) continue;
    const t = tokensOf(`${root}::${f}`, readText(root, f) || '');
    for (let k = 0; k + 1 < t.length; k++) {
      const x = t[k], n = t[k + 1];
      if (x.t === 'id' && x.v === 'function' && n.t === 'id' && fnDecls[n.v]) fnDecls[n.v].push(`${f}:${n.line}`);
      if (x.t === 'id' && /^(const|let|var)$/.test(x.v) && n.t === 'id' && fnDecls[n.v]) fnDecls[n.v].push(`${f}:${n.line}`);
      // an assignment replaces the function too: NAME = …, window.NAME = …, window['NAME'] = …
      if (x.t === 'id' && fnDecls[x.v] && n.t === 'punc' && n.v === '=' && !(t[k - 1] && t[k - 1].t === 'id' && /^(const|let|var)$/.test(t[k - 1].v)) && !(t[k - 1] && t[k - 1].t === 'punc' && (t[k - 1].v === '.' || t[k - 1].v === '?.') && !(t[k - 2] && /^(window|globalThis|self)$/.test(t[k - 2].v)))) fnDecls[x.v].push(`${f}:${x.line} (assigned)`);
      if (x.t === 'str' && fnDecls[x.v] && t[k - 1] && t[k - 1].v === '[' && n.t === 'punc' && n.v === ']' && t[k + 2] && t[k + 2].v === '=') fnDecls[x.v].push(`${f}:${x.line} (assigned in brackets)`);
    }
  }
  // .daily5 selectors and whether each rule has a declaration
  const css = (readText(root, 'styles.css') || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const cssSel = {};
  for (const m of css.matchAll(/([^{}]*)\{([^{}]*)\}/g)) {
    const filled = /[\w-]+\s*:\s*[^;\s]/.test(m[2]);
    for (const sel of m[1].split(',').map(x => x.replace(/\s+/g, ' ').trim()).filter(x => /\.daily5[\w-]*/.test(x))) cssSel[sel] = cssSel[sel] || filled;
  }
  const indexMarkup = ((readText(root, 'index.html') || '').match(/class="[^"]*\bdaily5[\w-]*/g) || []).length;
  const i18n = readText(root, 'i18n.js') || '';
  const strings = {};
  for (const k of DAILY5_KEYS) {
    const at = i18n.indexOf(`'${k}':`);
    const next = at < 0 ? -1 : i18n.slice(at + k.length + 3).search(/\n\s*'[\w.]+'\s*:/);
    const body = at < 0 ? '' : i18n.slice(at, next < 0 ? undefined : at + k.length + 3 + next);
    const val = lang => { const m = body.match(new RegExp(`\\b${lang}:\\s*(['"\`])((?:\\\\.|(?!\\1)[\\s\\S])*)\\1`)); return m ? m[2].trim() : ''; };
    strings[k] = { en: val('en'), es: val('es') };
  }
  let warmup = 0;
  try { const sb = {}; vm.createContext(sb); vm.runInContext(readText(root, 'config-main.js'), sb); warmup = vm.runInContext('Array.isArray(WARMUP_BANK) ? WARMUP_BANK.filter(w => w && String(w.text || "").trim()).length : 0', sb); } catch { /* gone */ }
  const steps = {};
  for (const w of (sets || loadSets(root))) for (const st of Object.values(w.stations || {})) for (const sec of (st.sections || [])) {
    if (sec.kind !== 'take-to-song') continue;
    const m = String(Number(w.moduleNum));
    (steps[m] = steps[m] || []).push(...(sec.steps || []).map(stepHash));
  }
  return { fnSig, fnDecls, declared, reads, cssSel, indexMarkup, strings, warmup, steps };
}
/* Every pinned value as today's code has it, in never-pins.json's shape. */
export function currentPins(root, pins) {
  const fnNames = Object.keys((pins && pins.DAILY5_FUNCTIONS) || {});
  const k = measureKept(root, null, fnNames);
  const { found } = analyzeSite(root);
  const sites = progressWriteSites(found, false);
  return {
    PROGRESS_WRITERS: Object.fromEntries([...sites].sort().map(([key, list]) => [key, list.map(c => c.sig)])),
    DAILY5_FUNCTIONS: Object.fromEntries(fnNames.map(f => [f, k.fnSig[f] || null])),
    SWITCH_READS: Object.fromEntries(SWITCHES.map(sw => [sw, k.reads[sw]])),
    DAILY5_CSS: Object.keys(k.cssSel).filter(x => k.cssSel[x]).sort(),
    DAILY5_INDEX_MARKUP: k.indexMarkup,
    WARMUP_BANK_MIN: k.warmup,
    TAKE_TO_SONG_STEPS: k.steps,
  };
}
const subsetOf = (want, have) => { const h = [...have]; for (const w of want) { const i = h.indexOf(w); if (i < 0) return false; h.splice(i, 1); } return true; };

export function checkKeptThings(root = DEFAULT_ROOT, { sets } = {}) {
  const r = R();
  const bad = [];
  // 6. the cure
  const sw = readText(root, 'sw.js') || '';
  for (const [f, pin] of Object.entries(CURE_AUDIO)) {
    let h = null;
    try { h = fileHash(readFileSync(join(root, f))); } catch { /* gone */ }
    const say = `(${NEVER}: never re-level "the cure" — it is the loudness every other song is levelled to, tools/loudness.py and the audio-and-snippets skill)`;
    if (h === null) bad.push(`1do: refused — ${f} is gone; "the cure" is the loudness reference ${say}. Put it back: git checkout origin/main -- ${f}`);
    else if (h !== pin) bad.push(`1do: refused — ${f} has new bytes (hash ${h}, pinned ${pin}) ${say}. Put the old file back (git checkout origin/main -- ${f}) and level the OTHER song instead: python3 tools/loudness.py <its slug>`);
    const inMap = (sw.match(new RegExp(`"${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}": '([0-9a-f]{10})'`)) || [])[1];
    if (h === pin && inMap && inMap !== pin) bad.push(`1do: sw.js's AUDIO_HASHES has ${inMap} for ${f}, but the file and the pin are ${pin} — run the full node tools/checks.mjs to rewrite the map (never by hand)`);
  }
  const lp = readText(root, 'tools/loudness.py') || '';
  if (!new RegExp(`^REFERENCE_SLUG = '${CURE_SLUG}'$`, 'm').test(lp) || !/^\s+if slug == REFERENCE_SLUG:\n[^\n]*\n[^\n]*\n\s+return 2$/m.test(lp))
    bad.push(`1do: refused — tools/loudness.py no longer takes "the cure" (REFERENCE_SLUG = '${CURE_SLUG}') as its reference, or no longer refuses to level it (${NEVER}: never re-level "the cure"). Put both back.`);
  try {
    for (const f of readdirSync(join(root, 'audio'))) {
      const p = `audio/${f}`;
      if (!f.startsWith(`${CURE_SLUG}-backing-`) || CURE_AUDIO[p]) continue;
      const m = f.match(/-(\d+)bpm-\d+hz-([a-z-]+)\.mp3$/);
      if (m && m[2] === 'full' && Number(m[1]) >= 144)
        bad.push(`1do: refused — ${p} is a new record-tempo full mix of "the cure", which tools/loudness.py would take as the loudness reference in place of the pinned one (${NEVER}: never re-level "the cure"). Remove it, or ask Jonathan.`);
    }
  } catch { /* no audio/ */ }

  // 7. switched off, never deleted — and not hollowed out
  const pins = loadPins(root);
  if (!pins) { bad.push(`1do: ${PINS_FILE} is missing or not valid JSON — the pins of 1do live there`); }
  const P = pins || {};
  const fnPins = P.DAILY5_FUNCTIONS || {};
  const k = measureKept(root, sets, Object.keys(fnPins));
  const OFF = `(${NEVER}: never delete what is switched off — "switched off, never deleted", so flipping the switch brings it back)`;
  const REPIN = `If it keeps the feature working (a renamed helper, an accessibility attribute, a typo fixed inside it) and Jonathan asked for it, that is allowed: re-pin it with its reason, node tools/never-blocks.mjs --pins --why "<reason>"`;
  for (const sw of SWITCHES) {
    const d = k.declared[sw];
    if (d.length !== 1 || !/^(true|false)$/.test(d[0])) bad.push(`1do: refused — ${sw} must be declared once in the app as \`const ${sw} = true;\` or \`= false;\` (found ${d.length ? d.join(', ') : 'nothing'}) ${OFF}. On or off is Jonathan's call; deleting the switch is not.`);
    const want = ((P.SWITCH_READS || {})[sw] || {}).value || [];
    if (!subsetOf(want, k.reads[sw])) bad.push(`1do: refused — a statement that reads ${sw} was deleted or changed (${k.reads[sw].length} reads now, ${want.length} pinned): a place the switch turns on or off no longer works the same, so flipping it back would not bring it back ${OFF}. Put the statement back as it was. ${REPIN}.`);
  }
  const goneFns = Object.keys(fnPins).filter(f => !k.fnSig[f]);
  if (goneFns.length) bad.push(`1do: refused — ${goneFns.map(f => `${f}()`).join(', ')} ${goneFns.length === 1 ? 'is' : 'are'} gone from the app parts; part of the switched-off Daily 5 / Take It to a Song ${OFF}. Put ${goneFns.length === 1 ? 'it' : 'them'} back from origin/main.`);
  const changedFns = Object.keys(fnPins).filter(f => k.fnSig[f] && k.fnSig[f] !== fnPins[f].value);
  if (changedFns.length) bad.push(`1do: refused — the code of ${changedFns.map(f => `${f}() (now ${k.fnSig[f]}, pinned ${fnPins[f].value})`).join(', ')} changed; it is part of the switched-off Daily 5 / Take It to a Song ${OFF}. Put it back from origin/main. ${REPIN}.`);
  const shadowed = Object.entries(k.fnDecls).filter(([, l]) => l.length > 1);
  if (shadowed.length) bad.push(`1do: refused — ${shadowed.map(([f, l]) => `${f} is declared ${l.length} times (${l.join(', ')})`).join('; ')}: a second declaration replaces the switched-off code at run time ${OFF}. Rename the new one.`);
  const cssWant = (P.DAILY5_CSS || {}).value || [];
  const cssGone = cssWant.filter(x => !k.cssSel[x]);
  if (cssGone.length) bad.push(`1do: refused — styles.css lost or emptied ${cssGone.length} of the ${cssWant.length} pinned .daily5 selectors (${cssGone.slice(0, 3).join(' | ')}${cssGone.length > 3 ? ' | …' : ''}): the Daily 5's look would be gone when it is switched back on ${OFF}. Put the rules back. ${REPIN}.`);
  const im = ((P.DAILY5_INDEX_MARKUP || {}).value) || 0;
  if (k.indexMarkup < im) bad.push(`1do: refused — index.html has ${k.indexMarkup} daily5 elements, ${im} pinned ${OFF}. Put the markup back.`);
  const emptyStr = Object.entries(k.strings).filter(([, v]) => !v.en || !v.es).map(([key, v]) => `${key} (${!v.en ? 'English' : ''}${!v.en && !v.es ? ' and ' : ''}${!v.es ? 'Spanish' : ''})`);
  if (emptyStr.length) bad.push(`1do: refused — the switched-off Daily 5's strings are gone or empty in i18n.js: ${emptyStr.join(', ')} ${OFF}. Put the words back.`);
  const wb = ((P.WARMUP_BANK_MIN || {}).value) || 0;
  if (k.warmup < wb) bad.push(`1do: refused — config-main.js's WARMUP_BANK has ${k.warmup} warm-ups with text, ${wb} pinned; the switched-off Daily 5 deals from it ${OFF}. Put them back.`);
  const tts = P.TAKE_TO_SONG_STEPS || {};
  for (const [m, pin] of Object.entries(tts)) {
    const have = new Set(k.steps[m] || []);
    const missing = pin.value.filter(h => !have.has(h));
    if (missing.length) bad.push(`1do: refused — Module ${m}'s Take It to a Song sections lost or changed ${missing.length} of their ${pin.value.length} steps (a step's label, text or Spanish changed, it was removed, or its section was) ${OFF}; each section also holds the number that every later saved tick is keyed by. Put them back as they were; hide a step with hidden: true if it must not show. ${REPIN}.`);
  }
  const ttsPinned = Object.values(tts).reduce((a, x) => a + x.value.length, 0);

  // 8. the deleted student tour
  const TOUR = `(${NEVER}: never resurrect the deleted student tour — it taught the retired Station B/C model; deleted 2026-08-27 in 5dc1ab8, and Jonathan is building a new one)`;
  let scanned = 0;
  const tourHits = [];
  for (const f of treeFiles(root)) {
    let st; try { st = statSync(join(root, f)); } catch { continue; }
    if (!st.isFile() || f.startsWith('tools/')) continue;
    const why = [];
    const text = /\.(html?|js|css)$/i.test(f) && st.size < 4e6 ? lf(readFileSync(join(root, f), 'utf8')) : null;
    if (TOUR_SIZES.has(st.size) || (text !== null && TOUR_TEXT_SIZES.has(Buffer.byteLength(text)))) {
      scanned++;
      const raw = readFileSync(join(root, f));
      const id = blobId(raw), idLf = text !== null ? blobId(Buffer.from(text)) : id;
      const hit = TOUR_BLOBS[id] || TOUR_BLOBS[idLf];
      if (hit) why.push(hit === f ? 'restored' : `= its ${hit}`);
    }
    if (text !== null && !why.length) { const ph = TOUR_PHRASES.filter(p => text.includes(p)); if (ph.length === TOUR_PHRASES.length) why.push(`its slides' words "${ph.join('", "')}"`); }
    if (why.length) tourHits.push(`${f} (${why.join(', ')})`);
  }
  if (tourHits.length) bad.push(`1do: refused — the deleted student tour is back: ${tourHits.slice(0, 6).join('; ')}${tourHits.length > 6 ? `; and ${tourHits.length - 6} more` : ''} ${TOUR}. Delete ${tourHits.length === 1 ? 'it' : 'them'}; a new tour is new pages with new words.`);

  if (bad.length) { bad.forEach(b => r.err(b)); return r.lines; }
  const secSteps = Object.values(k.steps).reduce((a, l) => a + l.length, 0);
  r.ok(`"the cure": ${Object.keys(CURE_AUDIO).length} of ${Object.keys(CURE_AUDIO).length} files keep their pinned bytes (and sw.js's map agrees), and tools/loudness.py still takes it as the reference it refuses to level; switched off, never deleted: ${SWITCHES.join(' and ')} declared once and their ${SWITCHES.map(sw => k.reads[sw].length).join(' and ')} reading statements as pinned, ${Object.keys(fnPins).length} functions with their pinned code and no second declaration, ${cssWant.length} .daily5 selectors with non-empty rules, ${k.indexMarkup} daily5 element${k.indexMarkup === 1 ? '' : 's'} in index.html, ${DAILY5_KEYS.length} daily5 strings in English and Spanish, ${k.warmup} warm-ups, ${ttsPinned} pinned Take It to a Song steps all present (${secSteps} today, in ${Object.keys(k.steps).length} modules); the deleted tour: none of its ${Object.keys(TOUR_BLOBS).length} files (${scanned} same-size files hashed) and no page with its slides' words`);
  return r.lines;
}

/* --pins: every pin whose value differs from today's code. With --why "<reason>", write the new values into
   tools/never-pins.json with that reason and today's date; without it, refuse to write. */
function printPins(root) {
  const pins = loadPins(root) || {};
  const cur = currentPins(root, pins);
  const i = process.argv.indexOf('--why'), why = i >= 0 ? (process.argv[i + 1] || '').trim() : '';
  const diffs = [];
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  for (const [k, v] of Object.entries(cur)) {
    if (k === 'PROGRESS_WRITERS' || k === 'DAILY5_FUNCTIONS' || k === 'SWITCH_READS' || k === 'TAKE_TO_SONG_STEPS') {
      const keys = new Set([...Object.keys(v), ...Object.keys(pins[k] || {})]);
      for (const key of keys) { const was = ((pins[k] || {})[key] || {}).value; if (!same(was, v[key])) diffs.push([k, key, was, v[key]]); }
    } else { const was = (pins[k] || {}).value; if (!same(was, v)) diffs.push([k, null, was, v]); }
  }
  if (!diffs.length) { console.log(`every pin in ${PINS_FILE} matches today's code`); return; }
  for (const [k, key, was, now] of diffs) console.log(`${k}${key ? ` · ${key}` : ''}\n  pinned: ${JSON.stringify(was)}\n  today:  ${JSON.stringify(now)}`);
  if (!why) { console.log(`\n${diffs.length} pin${diffs.length === 1 ? '' : 's'} differ. Not written: give the reason Jonathan asked for it, node tools/never-blocks.mjs --pins --why "<reason>"`); process.exitCode = 1; return; }
  const date = todayLocal();
  for (const [k, key, , now] of diffs) {
    if (key) { pins[k] = pins[k] || {}; if (now === undefined || now === null) delete pins[k][key]; else pins[k][key] = { value: now, why, date }; }
    else pins[k] = { value: now, why, date };
  }
  writeFileSync(join(root, PINS_FILE), JSON.stringify(pins, null, 1) + '\n');
  console.log(`\nwrote ${diffs.length} pin${diffs.length === 1 ? '' : 's'} to ${PINS_FILE}, each with "${why}" (${date})`);
}

const isMain = (() => { try { return !!process.argv[1] && realpathSync(fileURLToPath(import.meta.url)) === realpathSync(process.argv[1]); } catch { return false; } })();
if (isMain) {
  if (process.argv.includes('--self-test')) import('./never-blocks-selftest.mjs').then(m => m.selfTest());
  else if (process.argv.includes('--pins')) printPins(DEFAULT_ROOT);
  else {
    let bad = 0;
    for (const [label, f] of [['1dl', () => checkKeysAgainstBase(DEFAULT_ROOT)], ['1dm', () => checkFirestoreWrites(DEFAULT_ROOT)], ['1dn', () => checkRulesPaste(DEFAULT_ROOT)], ['1do', () => checkKeptThings(DEFAULT_ROOT)]]) {
      for (const l of f()) { console.log(`${l.kind === 'ok' ? '✓' : l.kind === 'err' ? '✗' : l.kind === 'info' ? ' ' : '!'} ${label} ${l.text}`); if (l.kind === 'err') bad++; }
    }
    process.exit(bad ? 1 : 0);
  }
}
