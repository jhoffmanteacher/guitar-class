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
          verdict is the check's. Also: rule-zero-proof's FROZEN_THROUGH and
          checks.mjs's FROZEN_MC_THROUGH_MODULE are the same number.
     1dm  Firestore writes, read from the code (rules 3 and 4): no console
          part (teacher-*.js) writes progress/… or lets a reference to it
          leave a read; no code anywhere writes config/class outside
          teacherWriteConfig(). Paths are folded ('prog' + 'ress', constants,
          template literals); a path it cannot read counts as "may be either".
     1dn  firestore.rules (rule 5): when it differs from the base, a loud line
          says Jonathan must paste it, and the check fails until
          RULES-PASTE.md has a NEW line naming this exact rules text's hash
          and the paste.
     1do  things that stay as they are (rules 6, 7 and 8): "the cure"'s four
          audio files keep their bytes; the Daily 5 and Take It to a Song are
          still there, switched off; the deleted student tour stays deleted.

   THE BASE (1dl, 1dn) is what this change is measured against:
     - GC_CHECKS_BASE when set (GitHub sets it to the push's `before` commit,
       which the workflow fetches; a shallow checkout has no other history);
     - else `git merge-base HEAD origin/main`: where this branch left main, so
       a branch that is merely BEHIND main is not blamed for main's own work;
     - else none: the two checks say so in one warning line and pass.
   They compare the WORKING TREE with the base, so uncommitted edits count.

   Each refusal prints one plain sentence: what was refused, which rule,
   where the rule is written, what to do instead. No allowlist: the two code
   shapes 1dm cannot follow that exist today are named below, each with its
   reason, matched exactly.

   USAGE
     node tools/never-blocks.mjs               run the four checks on this tree
     node tools/never-blocks.mjs --self-test   plant each forbidden edit (and
                                               the allowed near-misses) in a
                                               scratch worktree and prove the
                                               checks go red / stay green
   Zero dependencies, Node 18+, Windows and macOS.
   ════════════════════════════════════════════════════════════════════ */

import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import vm from 'node:vm';
import { tokenize, segments } from './js-scan.mjs';
import { analyzeFile, collectConstants, callGraph, pathString } from './firestore-paths.mjs';
import { siteParts } from './site-src.mjs';
import { fileHash } from './sw-audio-map.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const DEFAULT_ROOT = join(HERE, '..');
const NEVER = 'CLAUDE.md, "Never, whatever the task says"';

/* ── git and the base ─────────────────────────────────────────────── */
function git(root, args) {
  const r = spawnSync('git', args, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 });
  return { ok: !r.error && r.status === 0, out: (r.stdout || '').trim(), status: r.status, err: (r.stderr || '').trim() };
}
const baseCache = new Map();
export function resolveBase(root) {
  if (baseCache.has(root)) return baseCache.get(root);
  let res;
  const env = (process.env.GC_CHECKS_BASE || '').trim();
  if (env && !/^0+$/.test(env)) {
    const c = git(root, ['rev-parse', '--verify', '-q', `${env}^{commit}`]);
    res = c.ok ? { ref: c.out, label: `the push's base ${c.out.slice(0, 7)} (GC_CHECKS_BASE)` }
               : { missing: `GC_CHECKS_BASE=${env} is not a commit in this checkout (on GitHub: the workflow's fetch of the push's base failed)` };
  } else if (!git(root, ['rev-parse', '--git-dir']).ok) {
    res = { none: 'this folder is not a git checkout' };
  } else if (!git(root, ['rev-parse', '--verify', '-q', 'origin/main']).ok) {
    res = { none: 'there is no origin/main here and GC_CHECKS_BASE is not set' };
  } else {
    const mb = git(root, ['merge-base', 'HEAD', 'origin/main']);
    res = mb.ok ? { ref: mb.out, label: `where this branch left origin/main (${mb.out.slice(0, 7)})` }
                : { none: 'HEAD and origin/main share no history here (a shallow checkout?)' };
  }
  baseCache.set(root, res);
  return res;
}
/* Paths (pathspecs) that differ between the base and the WORKING TREE, plus
   untracked files matching them. */
function changedSince(root, base, specs) {
  const d = git(root, ['diff', '--name-only', base, '--', ...specs]);
  const u = git(root, ['ls-files', '--others', '--exclude-standard', '--', ...specs]);
  return [...new Set([...(d.ok ? d.out.split('\n') : []), ...(u.ok ? u.out.split('\n') : [])].filter(Boolean))];
}
const strip = s => String(s).replace(/\x1b\[[0-9;]*m/g, '');
/* One tokenization per file per run (1dm and 1do both read the app parts), keyed by the text itself. */
const tokenCache = new Map();
const tokensOf = (key, src) => { const c = tokenCache.get(key); if (c && c.src === src) return c.toks; const toks = tokenize(src); tokenCache.set(key, { src, toks }); return toks; };

/* Results are lines for checks.mjs to print and count: {kind: 'ok'|'err'|'warn'|'info', text}. */
const R = () => { const lines = []; return { lines, ok: t => lines.push({ kind: 'ok', text: t }), err: t => lines.push({ kind: 'err', text: t }), warn: t => lines.push({ kind: 'warn', text: t }), info: t => lines.push({ kind: 'info', text: t }) }; };

/* ════════════════════════════════════════════════════════════════════
   1dl. PROGRESS KEYS AND FROZEN QUIZZES, AGAINST THE BASE (rules 1, 2)
   ════════════════════════════════════════════════════════════════════ */
export function checkKeysAgainstBase(root = DEFAULT_ROOT, { frozenMcThrough } = {}) {
  const r = R();
  // The two FROZEN numbers are one setting (CLAUDE.md: FROZEN_THROUGH (= FROZEN_MC_THROUGH_MODULE)).
  const rz = (() => { try { return readFileSync(join(root, 'tools', 'rule-zero-proof.mjs'), 'utf8'); } catch { return ''; } })();
  const m = rz.match(/^const FROZEN_THROUGH = (\d+);/m);
  if (!m) r.err('1dl: tools/rule-zero-proof.mjs has no `const FROZEN_THROUGH = <n>;` line, so nothing proves which modules are frozen');
  else if (frozenMcThrough !== undefined && Number(m[1]) !== frozenMcThrough)
    r.err(`1dl: rule-zero-proof.mjs freezes Modules 1–${m[1]} but checks.mjs 1ap freezes keyed quizzes in Modules 1–${frozenMcThrough}; they are one setting (CLAUDE.md "Three regimes"): raise both together, a module ahead of the class, and never lower either`);
  const base = resolveBase(root);
  if (base.missing) { r.err(`1dl: cannot compare with the push's base: ${base.missing}`); return r.lines; }
  if (base.none) { r.warn(`1dl skipped: ${base.none}, so no module was compared with main — run node tools/rule-zero-proof.mjs <ref> by hand`); return r.lines; }
  const changed = changedSince(root, base.ref, ['module-*.js', 'config-main.js']);
  if (!changed.length) { r.ok(`no module file differs from ${base.label}: no progress key can have moved`); return r.lines; }
  const p = spawnSync(process.execPath, [join(root, 'tools', 'rule-zero-proof.mjs'), base.ref], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26, timeout: 120000 });
  const out = strip((p.stdout || '') + (p.stderr || ''));
  const crosses = out.split('\n').filter(l => /^✗ /.test(l)).map(l => l.slice(2));
  if (p.status === 0) {
    const summary = out.split('\n').filter(l => /^✓ /.test(l)).map(l => l.slice(2));
    r.ok(`${changed.length} module file${changed.length === 1 ? '' : 's'} changed since ${base.label} (${changed.join(', ')}); tools/rule-zero-proof.mjs passes: ${summary.join('; ')}`);
    return r.lines;
  }
  r.err(`1dl: refused — this change ${crosses.length ? 'moves a saved place or rewords a frozen quiz' : 'could not be proved safe'} (${NEVER}: never move or renumber a section or step; never reword a frozen keyed quiz's choices or English prompt; rules in "Three regimes"). Students would lose their ticks or answers. Put it back as it was in ${base.ref.slice(0, 7)}; a fix a frozen module blocks goes on the Summer reset list (skill summer-reset). tools/rule-zero-proof.mjs ${base.ref.slice(0, 7)} said:`);
  if (crosses.length) crosses.forEach(c => r.err(`  ${c}`));
  else r.err(`  (exit ${p.status}) ${out.split('\n').filter(Boolean).slice(-3).join(' | ')}`);
  return r.lines;
}

/* ════════════════════════════════════════════════════════════════════
   1dm. FIRESTORE WRITES, READ FROM THE CODE (rules 3, 4)
   ════════════════════════════════════════════════════════════════════ */
/* The two code shapes in the console that the reader cannot follow, each the
   exact case, with its reason. Anything else of the same shape fails. */
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

function siteJsFiles(root) {
  const list = (dir, re) => { try { return readdirSync(join(root, dir)).filter(f => re.test(f)).map(f => dir === '.' ? f : `${dir}/${f}`); } catch { return []; } };
  return [...new Set([
    ...list('.', /\.js$/).filter(f => !/^module-\d+\.js$/.test(f)),
    ...list('app', /\.js$/), ...list('tabs', /\.js$/),
  ])].sort();
}
function inlineScripts(root) {
  const out = [];
  const list = (dir) => { try { return readdirSync(join(root, dir)).filter(f => /\.html$/.test(f)).map(f => dir === '.' ? f : `${dir}/${f}`); } catch { return []; } };
  for (const f of [...list('.'), ...list('tabs')]) {
    const html = readFileSync(join(root, f), 'utf8');
    let n = 0;
    for (const m of html.matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi)) out.push({ file: `${f} <script> #${++n}`, src: m[1] });
  }
  return out;
}
/* Outside the console, a file is read as code only when it could make a reference itself: it calls
   .collection( / .collectionGroup( / .doc( / .runTransaction( / .batch(, names firestore, takes a .ref,
   or uses the modular SDK or the REST endpoint. Any reference it is HANDED was made in a file that does
   (and 1dm follows a reference out of the file it is made in: an "escape"). The console parts are always
   read whole. */
const MAY_TOUCH_FIRESTORE = /\.\s*(?:collection|collectionGroup|doc|runTransaction|batch)\s*\(|\bfirestore\b|\.\s*ref\b|\b(?:setDoc|updateDoc|addDoc|deleteDoc|writeBatch)\b|googleapis/;

export function checkFirestoreWrites(root = DEFAULT_ROOT) {
  const r = R();
  const consoleFiles = new Set([...siteParts('teacher.js', root), ...readdirSync(root).filter(f => /^teacher-[\w-]+\.js$/.test(f))]);
  const entries = [...siteJsFiles(root).map(f => ({ file: f, src: readFileSync(join(root, f), 'utf8') })), ...inlineScripts(root)];
  for (const e of entries) e.console = consoleFiles.has(e.file);
  const toks = new Map();
  const tok = e => { if (!toks.has(e.file)) toks.set(e.file, tokensOf(join(root, e.file), e.src)); return toks.get(e.file); };
  const relevant = entries.filter(e => e.console || MAY_TOUCH_FIRESTORE.test(e.src));
  const consts = collectConstants(relevant.map(tok));
  const found = { chains: [], refs: [], odd: [] };
  for (const e of relevant) {
    const a = analyzeFile(e.file, tok(e), consts);
    a.chains.forEach(c => { c.console = e.console; found.chains.push(c); });
    a.refs.forEach(c => { c.console = e.console; found.refs.push(c); });
    a.odd.forEach(c => { c.console = e.console; found.odd.push(c); });
  }
  const bad = [];
  const where = c => `${c.file}:${c.line} (${c.fn})`;
  const RULE3 = `${NEVER}: never write progress/{uid} from console code — the console reads students' saved work and never changes it`;
  const RULE4 = `${NEVER}: never write config/class except through teacherWriteConfig() — the one writer that checks no other console changed it first (checks.mjs 1ai)`;

  // Rule 3: the console never writes progress/… nor lets a reference to it out of a read.
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
    if (!x.paths) bad.push(`1dm: refused — ${where(x)} takes .ref from "${x.base}", a snapshot this check cannot trace to its query, so the write it allows may land in progress/… (${RULE3}). Take the reference from a db.collection('<name>') chain in the same function, as teacherMicDelete and teacherErrorsDeleteOld do.`);
    else if (x.paths.some(mayBeProgress)) bad.push(`1dm: refused — ${where(x)} takes .ref from a progress snapshot (${x.paths.map(pathString).join(', ')}), which is a handle for writing a student's saved work (${RULE3}). Use the snapshot's .data() and change nothing.`);
  }
  const oddCount = new Map();
  for (const o of found.odd) {
    if (!o.console) continue;
    if (isException(o, 'odd')) { const k = `${o.file}|${o.fn}`; oddCount.set(k, (oddCount.get(k) || 0) + 1); continue; }
    bad.push(`1dm: refused — ${where(o)}: ${o.what}, so it could write progress/… unseen (${RULE3}). Write the Firestore call out plainly (db.collection('<name>')…) where 1dm can read it.`);
  }
  for (const x of UNFOLLOWABLE_TODAY.filter(x => x.count)) {
    const n = oddCount.get(`${x.file}|${x.fn}`) || 0;
    if (n > x.count) bad.push(`1dm: refused — ${x.file} ${x.fn}() now has ${n} pieces of code this check cannot read, ${x.count} expected (the ${x.count} it has always had: ${x.why}) (${RULE3}).`);
  }
  // The app's own progress writers, and every app function that reaches one: the console must not call them.
  const appFiles = entries.filter(e => !e.console && !/<script>/.test(e.file) && e.file !== 'sw.js' && !e.file.startsWith('tabs/'));
  const writers = new Set();
  for (const c of found.chains) if (!c.console && !c.file.startsWith('tabs/') && c.path[0] === 'progress' && (c.kind === 'write' || c.kind === 'escape')) writers.add(c.fn);
  writers.delete('(top level)');
  const graph = new Map();
  for (const e of appFiles) for (const [k, v] of callGraph(e.file, tok(e))) if (k !== '(top level)') graph.set(k, v);
  const reach = new Set(writers);
  for (let grew = true; grew;) { grew = false; for (const [k, v] of graph) if (!reach.has(k) && [...v.calls].some(c => reach.has(c))) { reach.add(k); grew = true; } }
  let consoleRefs = 0;
  for (const e of entries.filter(e => e.console)) {
    const t = tok(e);
    for (const seg of segments(t)) {
      const s = t.slice(seg.from, seg.to);
      const walk = arr => arr.forEach((x, k) => {
        if (x.t === 'tpl') { x.quasis.forEach(q => { for (const m of q.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (reach.has(m[1])) bad.push(`1dm: refused — ${e.file}:${x.line} (${seg.name}) writes an inline handler that calls ${m[1]}(), which saves to progress/… (${RULE3}).`); }); x.exprs.forEach(walk); return; }
        if (x.t === 'str') { for (const m of x.v.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) if (reach.has(m[1])) bad.push(`1dm: refused — ${e.file}:${x.line} (${seg.name}) writes an inline handler that calls ${m[1]}(), which saves to progress/… (${RULE3}).`); return; }
        if (x.t !== 'id' || !reach.has(x.v)) return;
        const p = arr[k - 1], n = arr[k + 1];
        if (p && p.t === 'punc' && (p.v === '.' || p.v === '?.') && !(arr[k - 2] && arr[k - 2].t === 'id' && /^(window|globalThis|self)$/.test(arr[k - 2].v))) return;   // someone else's member of that name (window.NAME is the global)
        if (p && p.t === 'id' && p.v === 'typeof') return;
        if (p && p.t === 'punc' && p.v === '(' && arr[k - 2] && arr[k - 2].v === 'String' && n && n.v === ')') { consoleRefs++; return; }   // String(fn): its text
        if (n && n.t === 'punc' && n.v === '.' && arr[k + 2] && arr[k + 2].v === 'toString') { consoleRefs++; return; }
        bad.push(`1dm: refused — ${e.file}:${x.line} (${seg.name}) uses ${x.v}, an app function that saves to progress/… (${[...writers].filter(w => w === x.v).length ? 'directly' : 'through the functions it calls'}) (${RULE3}).`);
      });
      walk(s);
    }
  }

  // Rule 4: config/class is written only inside teacherWriteConfig(), in a console part.
  let configRefs = 0, guardWrites = 0;
  const inGuard = c => c.console && c.fn === 'teacherWriteConfig';
  for (const c of found.chains) {
    if (!mayBeConfigClass(c.path, c.unknownBase)) continue;
    if (c.kind === 'read' || c.kind === 'tracked') { configRefs++; continue; }
    if (inGuard(c)) { guardWrites++; continue; }
    if (isException(c, 'chain')) continue;
    if (c.console && mayBeProgress(c.path) && !(c.path[0] === 'config')) continue;   // already refused above as a may-be-progress path
    const what = c.kind === 'write' ? `writes ${c.path.join('/') === 'config/class' ? 'config/class' : `a path that may be config/class (${pathString(c.path)})`} with ${c.detail}`
      : `lets a reference to ${c.path.join('/') === 'config/class' ? 'config/class' : `a path that may be config/class (${pathString(c.path)})`} out of a read (${c.detail}), where it could be written`;
    bad.push(`1dm: refused — ${where(c)} ${what} (${RULE4}). Call teacherWriteConfig(patch) instead.`);
  }
  for (const x of found.refs) {
    if (x.paths && x.paths.some(p => mayBeConfigClass(p, false)) && !(x.console && x.fn === 'teacherWriteConfig'))
      bad.push(`1dm: refused — ${where(x)} takes .ref from a config/class snapshot, a handle for writing it outside teacherWriteConfig() (${RULE4}).`);
  }
  if (!found.chains.some(c => inGuard(c) && c.path.join('/') === 'config/class'))
    bad.push('1dm: teacherWriteConfig() no longer names config/class in a way this check can read — the one allowed writer is gone or rewritten (checks.mjs 1ai pins its shape)');

  if (bad.length) { [...new Set(bad)].forEach(b => r.err(b)); return r.lines; }
  const consoleChains = found.chains.filter(c => c.console).length;
  r.ok(`${entries.length} scripts (${relevant.length} that can reach Firestore read as code, ${[...consoleFiles].length} console parts): ${consoleChains} Firestore chains in the console, ${progressReads} on progress/… and every one a read; ${found.refs.filter(x => x.console).length} snapshot .refs traced to non-progress queries; ${reach.size} app functions save progress (${writers.size} directly) and the console calls none (${consoleRefs} read as text); config/class: ${configRefs} reads, ${guardWrites} writes, all inside teacherWriteConfig(); ${UNFOLLOWABLE_TODAY.length} shapes it cannot follow, each the exact case named in tools/never-blocks.mjs`);
  return r.lines;
}

/* ════════════════════════════════════════════════════════════════════
   1dn. A firestore.rules CHANGE IS PASTED BY JONATHAN (rule 5)
   GitHub Pages never publishes firestore.rules: until Jonathan pastes it in
   the Firebase console, the live rules are the old ones, and code that needs
   the new ones fails with no error a student can see. So a change to the
   file needs a NEW line in RULES-PASTE.md naming the first 12 hex of the
   sha256 of the new text (line endings as LF) and the paste. The hash ties
   the line to this exact text: a later edit, or a revert to an older text,
   needs a line of its own.
   ════════════════════════════════════════════════════════════════════ */
export const RULES_FILE = 'firestore.rules';
export const PASTE_FILE = 'RULES-PASTE.md';
export const rulesHash = text => createHash('sha256').update(String(text).replace(/\r\n/g, '\n')).digest('hex').slice(0, 12);
const PASTE_LINE = /^- (\d{4})-(\d{2})-(\d{2}) firestore\.rules ([0-9a-f]{12}): (.*)$/;
const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
export function checkRulesPaste(root = DEFAULT_ROOT) {
  const r = R();
  const base = resolveBase(root);
  if (base.missing) { r.err(`1dn: cannot compare with the push's base: ${base.missing}`); return r.lines; }
  if (base.none) { r.warn(`1dn skipped: ${base.none}, so a firestore.rules change cannot be seen here — if you changed it, tell Jonathan it needs pasting in the Firebase console`); return r.lines; }
  const now = (() => { try { return readFileSync(join(root, RULES_FILE), 'utf8'); } catch { return null; } })();
  // git's own comparison (it applies the checkout's line-ending rules, so a Windows CRLF copy is "the same")
  const diff = git(root, ['diff', '--quiet', base.ref, '--', RULES_FILE]);
  const untracked = git(root, ['ls-files', '--others', '--exclude-standard', '--', RULES_FILE]).out;
  const same = diff.status === 0 && !untracked;
  if (diff.status !== 0 && diff.status !== 1) { r.err(`1dn: git could not compare firestore.rules with ${base.label}: ${diff.err}`); return r.lines; }
  if (same) { r.ok(`firestore.rules is the same as at ${base.label}: nothing for Jonathan to paste`); return r.lines; }
  if (now === null) { r.err(`1dn: refused — firestore.rules is gone. The live rules stay whatever was last pasted; deleting the file changes nothing there and loses the record (${NEVER}). Put it back.`); return r.lines; }
  const h = rulesHash(now);
  r.warn(`firestore.rules changed: Jonathan must paste it in the Firebase console (Firestore → Rules → paste → Publish); GitHub does not publish it.`);
  const read = p => { try { return readFileSync(join(root, p), 'utf8'); } catch { return ''; } };
  const before = new Set(((git(root, ['show', `${base.ref}:${PASTE_FILE}`]).ok ? git(root, ['show', `${base.ref}:${PASTE_FILE}`]).out : '')).split(/\r?\n/));
  const want = `- ${todayLocal()} firestore.rules ${h}: told Jonathan to paste it in the Firebase console (Firestore → Rules → Publish)`;
  const lines = read(PASTE_FILE).split(/\r?\n/);
  const today = todayLocal();
  const good = lines.find(l => {
    const m = l.match(PASTE_LINE);
    if (!m || m[4] !== h || before.has(l)) return false;
    const date = `${m[1]}-${m[2]}-${m[3]}`, d = new Date(`${date}T12:00:00`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) return false;
    if (date > today && (new Date(`${date}T00:00:00`) - new Date()) > 36 * 3600e3) return false;   // no date in the future (a day's slack for time zones)
    return /\bpaste/i.test(m[5]) && /Firebase console/i.test(m[5]);
  });
  if (good) { r.ok(`firestore.rules ${h} acknowledged in ${PASTE_FILE}: "${good.slice(2)}"`); return r.lines; }
  const stale = lines.filter(l => PASTE_LINE.test(l) && !before.has(l));
  r.err(`1dn: refused — firestore.rules differs from ${base.label} and ${PASTE_FILE} has no new line for this exact text (sha256 ${h}) (${NEVER}: never change firestore.rules without telling Jonathan it needs a console paste; the steps are under "Other standing rules"). Tell Jonathan first, then add this line to ${PASTE_FILE}:  ${want}${stale.length ? `  (the new line there names ${stale.map(l => l.match(PASTE_LINE)[4]).join(', ')}, an earlier text of the file)` : ''}`);
  return r.lines;
}

/* ════════════════════════════════════════════════════════════════════
   1do. THINGS THAT STAY AS THEY ARE (rules 6, 7, 8)
   ════════════════════════════════════════════════════════════════════ */
/* "The cure" is the loudness every backing track is levelled to (−12.5 LUFS,
   tools/loudness.py, checks.mjs 1bu): re-levelling it would silently move the
   target for every other song. Its four files are pinned by the same hash
   sw.js's AUDIO_HASHES uses (tools/sw-audio-map.mjs fileHash: the first 10 hex
   of the sha256 of the bytes), and the pins must match that map too. */
export const CURE_SLUG = 'olivia-rodrigo-the-cure';
export const CURE_AUDIO = {
  'audio/olivia-rodrigo-the-cure-backing-Am-120bpm-440hz-full.mp3': '1a5e1bf343',
  'audio/olivia-rodrigo-the-cure-backing-Am-120bpm-440hz-rhythm-down.mp3': 'df874dc77f',
  'audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-full.mp3': 'f3f8742c93',
  'audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-rhythm-down.mp3': '7a658c5026',
};
/* Switched off, never deleted (CLAUDE.md "Play-along first" and "Other
   standing rules"): the two switches, the Daily 5's code and strings, and
   every Take It to a Song section with its steps. Counted per module at
   origin/main 2026-11-13 (f9d3b3d); a section or step ADDED is fine. */
const SWITCHES = ['DAILY5_ENABLED', 'TAKE_TO_SONG_ENABLED'];
const DAILY5_FUNCTIONS = ['buildDaily5', 'openDaily5Here', 'closeDaily5', 'daily5EscClose', 'dayOfYear', 'moduleStepsFlat', 'buildModuleRoutine', 'isTakeToSongSection'];
const DAILY5_KEYS = ['daily5.tuneWarmupHtml', 'daily5.openToday', 'daily5.title', 'daily5.closeAria', 'daily5.tuneUpBody', 'daily5.warmUp', 'daily5.todaysDrill', 'daily5.fromModule', 'daily5.streak'];
export const TAKE_TO_SONG_MIN = { 2: [2, 8], 3: [2, 4], 4: [3, 6], 5: [2, 7], 6: [3, 6], 7: [3, 5], 8: [3, 3], 9: [2, 2], 10: [3, 3], 11: [3, 3], 12: [3, 3] };   // module → [sections, steps in them]
/* The student tour (tour.html + 13 screenshots in tour-img/) was deleted
   2026-08-27 (5dc1ab8): it taught the retired three-station model. Jonathan is
   building a new one, so a NEW tour.html is allowed; the old one, from any of
   its four versions, is not. Pinned by git blob id (sha1 of "blob <len>\0" +
   bytes), so a restore under any name is caught, and by its title. */
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
const TOUR_SIZES = new Set([33341, 29198, 30403, 53188, 32006, 41390, 11152, 9256, 10424, 9414, 57252, 21902, 75982, 54786, 10476, 3862]);
const TOUR_TITLE = 'Website Tour — Beginning Guitar';
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
  const cfg = readFileSync(join(root, 'config-main.js'), 'utf8');
  const sets = [];
  for (const f of readdirSync(root).filter(f => /^module-\d+\.js$/.test(f))) {
    const sb = { console: { log() {}, warn() {}, error() {} } };
    vm.createContext(sb);
    vm.runInContext(cfg, sb);
    vm.runInContext(readFileSync(join(root, f), 'utf8'), sb, { filename: f });
    sets.push(...vm.runInContext('SETS', sb));
  }
  return sets;
}

export function checkKeptThings(root = DEFAULT_ROOT, { sets } = {}) {
  const r = R();
  const bad = [];
  // 6. the cure
  const sw = (() => { try { return readFileSync(join(root, 'sw.js'), 'utf8'); } catch { return ''; } })();
  for (const [f, pin] of Object.entries(CURE_AUDIO)) {
    let h = null;
    try { h = fileHash(readFileSync(join(root, f))); } catch { /* gone */ }
    const say = `(${NEVER}: never re-level "the cure" — it is the loudness every other song is levelled to, tools/loudness.py and the audio-and-snippets skill)`;
    if (h === null) bad.push(`1do: refused — ${f} is gone; "the cure" is the loudness reference ${say}. Put it back: git checkout origin/main -- ${f}`);
    else if (h !== pin) bad.push(`1do: refused — ${f} has new bytes (hash ${h}, pinned ${pin}) ${say}. Put the old file back (git checkout origin/main -- ${f}) and level the OTHER song instead: python3 tools/loudness.py <its slug>`);
    const inMap = (sw.match(new RegExp(`"${f.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}": '([0-9a-f]{10})'`)) || [])[1];
    if (h === pin && inMap && inMap !== pin) bad.push(`1do: sw.js's AUDIO_HASHES has ${inMap} for ${f}, but the file and the pin are ${pin} — run the full node tools/checks.mjs to rewrite the map (never by hand)`);
  }
  // tools/loudness.py names the cure as its reference and refuses to level it; moving either moves the target.
  const lp = (() => { try { return readFileSync(join(root, 'tools', 'loudness.py'), 'utf8'); } catch { return ''; } })();
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

  // 7. switched off, never deleted
  const appFiles = siteParts('app.js', root);
  const decl = new Map(), fnDecl = new Set();
  for (const f of appFiles) {
    const appToks = tokensOf(join(root, f), readFileSync(join(root, f), 'utf8'));
    for (let k = 0; k + 3 < appToks.length; k++) {
      const x = appToks[k];
      if (x.t === 'id' && x.v === 'const' && appToks[k + 1].t === 'id' && appToks[k + 2].v === '=') {
        const name = appToks[k + 1].v;
        if (!decl.has(name)) decl.set(name, []);
        decl.get(name).push(appToks[k + 3].t === 'id' && appToks[k + 4] && appToks[k + 4].v === ';' ? appToks[k + 3].v : '(not a literal)');
      }
      if (x.t === 'id' && x.v === 'function' && appToks[k + 1].t === 'id') fnDecl.add(appToks[k + 1].v);
    }
  }
  const OFF = `(${NEVER}: never delete what is switched off — "switched off, never deleted", so flipping the switch brings it back)`;
  for (const s of SWITCHES) {
    const d = decl.get(s) || [];
    if (d.length !== 1 || !/^(true|false)$/.test(d[0])) bad.push(`1do: refused — ${s} must be declared once in the app as \`const ${s} = true;\` or \`= false;\` (found ${d.length ? d.join(', ') : 'nothing'}) ${OFF}. On or off is Jonathan's call; deleting the switch is not.`);
  }
  const goneFns = DAILY5_FUNCTIONS.filter(f => !fnDecl.has(f));
  if (goneFns.length) bad.push(`1do: refused — ${goneFns.map(f => `${f}()`).join(', ')} ${goneFns.length === 1 ? 'is' : 'are'} gone from the app parts; ${goneFns.length === 1 ? 'it is' : 'they are'} part of the switched-off Daily 5 / Take It to a Song ${OFF}. Put ${goneFns.length === 1 ? 'it' : 'them'} back from origin/main.`);
  const cfgSrc = (() => { try { return readFileSync(join(root, 'config-main.js'), 'utf8'); } catch { return ''; } })();
  if (!/^const WARMUP_BANK = \[/m.test(cfgSrc)) bad.push(`1do: refused — WARMUP_BANK is gone from config-main.js; the switched-off Daily 5 reads it ${OFF}.`);
  const i18n = (() => { try { return readFileSync(join(root, 'i18n.js'), 'utf8'); } catch { return ''; } })();
  for (const k of DAILY5_KEYS) {
    const at = i18n.indexOf(`'${k}':`);
    const next = at < 0 ? -1 : i18n.slice(at + k.length + 3).search(/\n\s*'[\w.]+'\s*:/);
    const body = at < 0 ? '' : i18n.slice(at, next < 0 ? undefined : at + k.length + 3 + next);
    if (!body || !/\ben:/.test(body) || !/\bes:/.test(body)) bad.push(`1do: refused — the i18n string ${k} (English and Spanish) is gone from i18n.js; the switched-off Daily 5 shows it ${OFF}.`);
  }
  let all = sets;
  if (!all) { try { all = loadSets(root); } catch (e) { bad.push(`1do: the module files would not load to count Take It to a Song sections: ${e.message}`); all = []; } }
  const per = {};
  for (const w of all) for (const st of Object.values(w.stations || {})) for (const sec of (st.sections || [])) {
    if (sec.kind !== 'take-to-song') continue;
    const m = Number(w.moduleNum);
    per[m] = per[m] || [0, 0];
    per[m][0]++; per[m][1] += (sec.steps || []).length;
  }
  for (const [m, [secs, steps]] of Object.entries(TAKE_TO_SONG_MIN)) {
    const [hs, hst] = per[m] || [0, 0];
    if (hs < secs) bad.push(`1do: refused — Module ${m} has ${hs} Take It to a Song section${hs === 1 ? '' : 's'}, ${secs} at origin/main ${OFF}; each holds a section number that every later saved tick is keyed by. Put it back.`);
    else if (hst < steps) bad.push(`1do: refused — Module ${m}'s Take It to a Song sections hold ${hst} steps, ${steps} at origin/main ${OFF}. Put them back; hide one with hidden: true if it must not show.`);
  }

  // 8. the deleted student tour
  const TOUR = `(${NEVER}: never resurrect the deleted student tour — it taught the retired Station B/C model; deleted 2026-08-27 in 5dc1ab8, and Jonathan is building a new one)`;
  let scanned = 0;
  const tourHits = [];
  for (const f of treeFiles(root)) {
    let st; try { st = statSync(join(root, f)); } catch { continue; }
    if (!st.isFile()) continue;
    const why = [];
    if (TOUR_SIZES.has(st.size)) {
      scanned++;
      const id = blobId(readFileSync(join(root, f)));
      if (TOUR_BLOBS[id]) why.push(TOUR_BLOBS[id] === f ? 'restored' : `= its ${TOUR_BLOBS[id]}`);
    }
    if (/\.(html?|js|css)$/i.test(f) && st.size < 4e6 && !f.startsWith('tools/')) {
      const text = readFileSync(join(root, f), 'utf8');
      if (text.includes(TOUR_TITLE)) why.push(`its title "${TOUR_TITLE}"`);
      if (/\btour-img\//.test(text)) why.push('points at tour-img/');
    }
    if (why.length) tourHits.push(`${f} (${why.join(', ')})`);
  }
  if (tourHits.length) bad.push(`1do: refused — the deleted student tour is back: ${tourHits.slice(0, 6).join('; ')}${tourHits.length > 6 ? `; and ${tourHits.length - 6} more` : ''} ${TOUR}. Delete ${tourHits.length === 1 ? 'it' : 'them'}; a new tour is new files with its own title.`);

  if (bad.length) { bad.forEach(b => r.err(b)); return r.lines; }
  const secs = Object.values(per).reduce((a, [s]) => a + s, 0), steps = Object.values(per).reduce((a, [, s]) => a + s, 0);
  r.ok(`"the cure": ${Object.keys(CURE_AUDIO).length} of ${Object.keys(CURE_AUDIO).length} files keep their pinned bytes (and sw.js's map agrees), and tools/loudness.py still takes it as the reference it refuses to level; switched off, never deleted: ${SWITCHES.join(' and ')} declared, ${DAILY5_FUNCTIONS.length} functions, WARMUP_BANK and ${DAILY5_KEYS.length} daily5 strings kept, ${secs} Take It to a Song sections with ${steps} steps in ${Object.keys(per).length} modules (none fewer than at origin/main); the deleted tour: none of its ${Object.keys(TOUR_BLOBS).length} files (${scanned} same-size files hashed) and no page names it`);
  return r.lines;
}

/* ════════════════════════════════════════════════════════════════════
   SELF-TEST: each forbidden edit made in a scratch worktree must turn its
   check red; each allowed near-miss must leave it green. No Chrome, no
   network; one `git worktree add` (removed at the end).
   ════════════════════════════════════════════════════════════════════ */
function selfTest() {
  const root = DEFAULT_ROOT;
  const dir = mkdtempSync(join(tmpdir(), 'gc-never-'));
  const wt = join(dir, 'tree');
  const add = git(root, ['worktree', 'add', '--detach', wt, 'HEAD']);
  if (!add.ok) { console.log(`self-test: could not make a scratch worktree: ${add.err}`); process.exit(2); }
  /* The base is HEAD itself: the scratch tree starts equal to it. The tools under test are the
     CURRENT ones (copied in after every reset, since this tree may have uncommitted edits to them),
     and so is RULES-PASTE.md. */
  const TOOLS = ['tools/never-blocks.mjs', 'tools/js-scan.mjs', 'tools/firestore-paths.mjs', 'tools/rule-zero-proof.mjs', 'RULES-PASTE.md'].filter(f => existsSync(join(root, f)));
  const head = git(wt, ['rev-parse', 'HEAD']).out;
  let pass = 0, fail = 0;
  const reset = () => { git(wt, ['reset', '-q', '--hard', head]); git(wt, ['clean', '-fdq']);
    for (const f of TOOLS) writeFileSync(join(wt, f), readFileSync(join(root, f)));
    process.env.GC_CHECKS_BASE = head; baseCache.clear(); };
  const edit = (f, from, to) => { const p = join(wt, f), s = readFileSync(p, 'utf8'); if (!s.includes(from)) throw new Error(`self-test: "${from.slice(0, 50)}" not in ${f}`); writeFileSync(p, s.replace(from, to)); };
  const run = (check) => ({ '1dl': () => checkKeysAgainstBase(wt, { frozenMcThrough: 3 }), '1dm': () => checkFirestoreWrites(wt), '1dn': () => checkRulesPaste(wt), '1do': () => checkKeptThings(wt) })[check]();
  const expect = (name, check, wantRed, plant) => {
    reset();
    try { plant(); } catch (e) { console.log(`✗ ${name}: could not plant — ${e.message}`); fail++; return; }
    const lines = run(check);
    const red = lines.filter(l => l.kind === 'err');
    const okk = red.length > 0 === wantRed;
    if (okk) pass++; else fail++;
    console.log(`${okk ? '✓' : '✗'} ${wantRed ? 'BLOCKED' : 'allowed'} ${check} ${name}${wantRed ? '' : ' (stays green)'}`);
    (red.length ? red : lines).slice(0, 2).forEach(l => console.log(`     ${l.kind}: ${l.text.slice(0, 400)}`));
  };
  const appendTeacher = (code) => { const p = join(wt, 'teacher-students.js'); writeFileSync(p, readFileSync(p, 'utf8') + '\n' + code + '\n'); };
  const appendApp = (code) => { const p = join(wt, 'app/explore.js'); writeFileSync(p, readFileSync(p, 'utf8') + '\n' + code + '\n'); };
  try {
    // ── the unmodified tree ──
    for (const c of ['1dl', '1dm', '1dn', '1do']) expect('the unmodified tree', c, false, () => {});
    // ── 1. move or renumber a section or step ──
    expect('rule 1: two steps of a Module 2 section swap places', '1dl', true, () => {
      const p = join(wt, 'module-2.js'); let s = readFileSync(p, 'utf8');
      const sets = loadSets(wt); const w = sets.find(x => x.moduleNum === 2); const sec = w.stations.b.sections.find(x => (x.steps || []).length >= 2 && x.steps[0].label !== x.steps[1].label);
      const a = JSON.stringify(sec.steps[0].label), b = JSON.stringify(sec.steps[1].label);
      // swap the two label lines in the file (enough: the label is how rule-zero sees an index)
      const la = s.indexOf(`label: ${a.replace(/^"|"$/g, "'")}`) >= 0 ? `label: ${a.replace(/^"|"$/g, "'")}` : `label:${a.replace(/^"|"$/g, "'")}`;
      const lb = s.indexOf(`label: ${b.replace(/^"|"$/g, "'")}`) >= 0 ? `label: ${b.replace(/^"|"$/g, "'")}` : `label:${b.replace(/^"|"$/g, "'")}`;
      if (!s.includes(la) || !s.includes(lb)) throw new Error('labels not found as written');
      s = s.replace(la, '\u0001').replace(lb, la).replace('\u0001', lb); writeFileSync(p, s);
    });
    expect('rule 1: a section removed from Module 7', '1dl', true, () => {
      edit('module-7.js', "kind: 'take-to-song'", "kind: 'take-to-song', __drop: true");
      const p = join(wt, 'module-7.js'); writeFileSync(p, readFileSync(p, 'utf8') + "\nSETS.forEach(w => Object.values(w.stations || {}).forEach(st => { if (st.sections) st.sections = st.sections.filter(x => !x.__drop); }));\n");
    });
    expect('near-miss: a step appended at the tail of a frozen Module 2 section', '1dl', false, () => {
      const p = join(wt, 'module-2.js'); writeFileSync(p, readFileSync(p, 'utf8') + "\n(function(){ const w = SETS.find(x => x.id === 'm2w1'); const sec = w.stations.b.sections[w.stations.b.sections.length - 1]; sec.steps.push({ label: 'Self-test appended step', text: 'Play it.' }); })();\n");
    });
    expect('near-miss: a step inserted mid-section in open Module 5', '1dl', false, () => {
      const p = join(wt, 'module-5.js'); writeFileSync(p, readFileSync(p, 'utf8') + "\n(function(){ const w = SETS.find(x => x.moduleNum === 5); const sec = w.stations.b.sections.find(s => !s.kind && (s.steps||[]).length > 1); sec.steps.splice(1, 0, { label: 'Self-test inserted step', text: 'Play it.' }); })();\n");
    });
    // ── 2. reword a frozen keyed MC ──
    const frozenMc = () => { const sets = loadSets(wt); for (const w of sets) { if (w.moduleNum > 3) continue; for (const st of Object.values(w.stations || {})) for (const sec of st.sections || []) for (const step of sec.steps || []) if (step.response && step.response.type === 'mc' && step.response.prompt) return { w, step }; } };
    expect("rule 2: a frozen keyed quiz's English prompt reworded", '1dl', true, () => {
      const { w, step } = frozenMc(); const f = `module-${w.moduleNum}.js`; const q = JSON.stringify(step.response.prompt).slice(1, -1);
      const s = readFileSync(join(wt, f), 'utf8'); const hit = [`'${q.replace(/'/g, "\\'")}'`, `"${q}"`].find(x => s.includes(x)); if (!hit) throw new Error('prompt not found as written');
      writeFileSync(join(wt, f), s.replace(hit, hit[0] + 'Quick check: ' + hit.slice(1)));
    });
    expect("rule 2: a frozen keyed quiz's choice reworded", '1dl', true, () => {
      const { w, step } = frozenMc(); const f = `module-${w.moduleNum}.js`; const c = step.response.choices[0];
      const s = readFileSync(join(wt, f), 'utf8'); const hit = [`'${c.replace(/'/g, "\\'")}'`, `"${c}"`].find(x => s.includes(x)); if (!hit) throw new Error('choice not found as written');
      writeFileSync(join(wt, f), s.replace(hit, hit[0] + 'Maybe ' + hit.slice(1)));
    });
    expect("near-miss: a frozen keyed quiz's Spanish prompt reworded", '1dl', false, () => {
      const { w, step } = frozenMc(); const f = `module-${w.moduleNum}.js`; if (!step.response.prompt_es) throw new Error('no prompt_es');
      const q = JSON.stringify(step.response.prompt_es).slice(1, -1); const s = readFileSync(join(wt, f), 'utf8'); const hit = [`'${q.replace(/'/g, "\\'")}'`, `"${q}"`].find(x => s.includes(x)); if (!hit) throw new Error('prompt_es not found as written');
      writeFileSync(join(wt, f), s.replace(hit, hit[0] + 'Revisa: ' + hit.slice(1)));
    });
    expect('near-miss: a keyed quiz ADDED to an existing step of frozen Module 2', '1dl', false, () => {
      const p = join(wt, 'module-2.js'); writeFileSync(p, readFileSync(p, 'utf8') + "\n(function(){ const w = SETS.find(x => x.id === 'm2w1'); const step = w.stations.b.sections.flatMap(s => s.steps || []).find(st => !st.response); step.response = { type: 'mc', prompt: 'Which string is lowest?', choices: ['Low E', 'A', 'High e'], answer: 0 }; })();\n");
    });
    // ── 3. the console writes progress ──
    expect("rule 3: console writes progress, the name built from pieces", '1dm', true, () => appendTeacher("function teacherSelfTestReset(uid){ const C = 'prog' + 'ress'; return db.collection(C).doc(uid).set({}, {merge:true}); }"));
    expect("rule 3: console writes progress through a template path", '1dm', true, () => appendTeacher("async function teacherSelfTestA(uid){ await db.doc(`progress/${uid}`).update({ x: 1 }); }"));
    expect("rule 3: console batch-writes progress through a variable", '1dm', true, () => appendTeacher("async function teacherSelfTestB(uid){ const r = db.collection('progress').doc(uid); const b = db.batch(); b.update(r, {x:1}); await b.commit(); }"));
    expect("rule 3: console writes through a progress snapshot's .ref", '1dm', true, () => appendTeacher("async function teacherSelfTestC(){ const s = await db.collection('progress').get(); s.docs.forEach(d => d.ref.update({x:1})); }"));
    expect("rule 3: console calls the app's progress writer", '1dm', true, () => appendTeacher("function teacherSelfTestD(){ flushSave(); }"));
    expect("rule 3: console writes through a reference from an unknown collection", '1dm', true, () => appendTeacher("function teacherSelfTestE(name, uid){ return db.collection(name).doc(uid).set({}); }"));
    expect("rule 3: console writes progress through a bracketed receiver", '1dm', true, () => appendTeacher("async function teacherSelfTestF(uid){ await (db).collection('progress').doc(uid).set({}); }"));
    expect("rule 3: console takes ref by destructuring", '1dm', true, () => appendTeacher("async function teacherSelfTestG(){ const s = await db.collection('progress').get(); s.docs.forEach(({ ref }) => ref.update({ x: 1 })); }"));
    expect("rule 3: console calls the app's progress writer as window.saveProgress", '1dm', true, () => appendTeacher("function teacherSelfTestH(){ window.saveProgress(); }"));
    expect("rule 3: console writes progress inside an inline handler string", '1dm', true, () => appendTeacher("function teacherSelfTestI(uid){ return `<button onclick=\"db.collection('progress').doc('${uid}').delete()\">x</button>`; }"));
    expect("rule 3: console hands a progress reference to a helper", '1dm', true, () => appendTeacher("function teacherSelfTestJ(uid){ return teacherSelfTestWrite(db.collection('progress').doc(uid)); }\nfunction teacherSelfTestWrite(r){ return r.set({}); }"));
    expect("near-miss: a new console READ of one student's progress", '1dm', false, () => appendTeacher("async function teacherSelfTestRead(uid){ const s = await db.collection('progress').doc(uid).get(); return s.exists ? s.data() : null; }"));
    expect("near-miss: a console write to another collection, deleted through .ref", '1dm', false, () => appendTeacher("async function teacherSelfTestOther(){ const s = await db.collection('issueReports').where('x','==',1).get(); const b = db.batch(); s.docs.forEach(d => b.delete(d.ref)); await b.commit(); }"));
    // ── 4. config/class outside teacherWriteConfig ──
    expect('rule 4: a console write to config/class, the path built from pieces', '1dm', true, () => appendTeacher("async function teacherSelfTestCfg(){ await db.collection('con' + 'fig').doc('cl' + 'ass').set({ x: 1 }, { merge: true }); }"));
    expect('rule 4: an app write to config/class through a constant', '1dm', true, () => appendApp("const SELF_TEST_CFG = 'config/class';\nfunction selfTestAppCfg(){ return db.doc(SELF_TEST_CFG).update({ x: 1 }); }"));
    expect('near-miss: a new config field written through teacherWriteConfig()', '1dm', false, () => appendTeacher("async function teacherSelfTestField(on){ try{ await teacherWriteConfig({ selfTestField: on }); }catch(e){ teacherConfigSaveFailed(e, 'x'); } }"));
    expect('near-miss: a new read of config/class', '1dm', false, () => appendApp("async function selfTestReadCfg(){ const d = await db.collection('config').doc('class').get(); return d.data(); }"));
    // ── 5. firestore.rules ──
    expect('rule 5: firestore.rules changed with no acknowledgement', '1dn', true, () => { const p = join(wt, RULES_FILE); writeFileSync(p, readFileSync(p, 'utf8') + '\n// self-test edit\n'); });
    expect('rule 5: changed, with an OLD acknowledgement line only (a revert to an earlier text)', '1dn', true, () => {
      const p = join(wt, RULES_FILE); const old = readFileSync(p, 'utf8'); writeFileSync(p, old + '\n// self-test edit\n');
      const ack = `- ${todayLocal()} firestore.rules ${rulesHash(old + '\n// self-test edit\n')}: told Jonathan to paste it in the Firebase console`;
      writeFileSync(join(wt, PASTE_FILE), (existsSync(join(wt, PASTE_FILE)) ? readFileSync(join(wt, PASTE_FILE), 'utf8') : '') + ack + '\n');
      git(wt, ['-c', 'core.hooksPath=/dev/null', '-c', 'user.name=self-test', '-c', 'user.email=self-test@example.invalid', 'commit', '-qam', 'self-test base', '--no-verify']); git(wt, ['add', '-A']); git(wt, ['-c', 'core.hooksPath=/dev/null', '-c', 'user.name=self-test', '-c', 'user.email=self-test@example.invalid', 'commit', '-qm', 'self-test base 2', '--no-verify']);
      process.env.GC_CHECKS_BASE = git(wt, ['rev-parse', 'HEAD']).out; baseCache.clear();
      writeFileSync(p, old);   // back to the earlier text: the line above names the other text, and an old line never counts
    });
    expect('rule 5: changed, acknowledged with the wrong hash', '1dn', true, () => {
      const p = join(wt, RULES_FILE); writeFileSync(p, readFileSync(p, 'utf8') + '\n// self-test edit\n');
      writeFileSync(join(wt, PASTE_FILE), (existsSync(join(wt, PASTE_FILE)) ? readFileSync(join(wt, PASTE_FILE), 'utf8') : '') + `- ${todayLocal()} firestore.rules 000000000000: told Jonathan to paste it in the Firebase console\n`);
    });
    expect('near-miss: firestore.rules changed WITH its acknowledgement', '1dn', false, () => {
      const p = join(wt, RULES_FILE); const t = readFileSync(p, 'utf8') + '\n// self-test edit\n'; writeFileSync(p, t);
      writeFileSync(join(wt, PASTE_FILE), (existsSync(join(wt, PASTE_FILE)) ? readFileSync(join(wt, PASTE_FILE), 'utf8') : '') + `- ${todayLocal()} firestore.rules ${rulesHash(t)}: told Jonathan to paste it in the Firebase console (Firestore → Rules → Publish)\n`);
    });
    expect('near-miss: a push that does not touch the rules', '1dn', false, () => edit('teacher-songs.js', 'function ', 'function selfTestNoop(){}\nfunction '));
    // ── 6. the cure ──
    expect('rule 6: "the cure" re-levelled (new bytes)', '1do', true, () => { const f = join(wt, 'audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-full.mp3'); const b = readFileSync(f); b[b.length - 1] ^= 1; writeFileSync(f, b); });
    expect('rule 6: loudness.py pointed at another song as the reference', '1do', true, () => edit('tools/loudness.py', "REFERENCE_SLUG = 'olivia-rodrigo-the-cure'", "REFERENCE_SLUG = 'the-beatles-let-it-be'"));
    expect('near-miss: a new song\'s audio added', '1do', false, () => writeFileSync(join(wt, 'audio/self-test-song-backing-E-100bpm-440hz-full.mp3'), Buffer.from('ID3 self-test')));
    // ── 7. switched off ──
    expect('rule 7: the Daily 5 code deleted (banner line kept)', '1do', true, () => edit('app/lesson.js', 'function buildDaily5(){', 'function buildDaily5_gone(){'));
    expect('rule 7: TAKE_TO_SONG_ENABLED deleted', '1do', true, () => edit('app/shell.js', 'const TAKE_TO_SONG_ENABLED = false;', ''));
    expect('rule 7: a Take It to a Song section emptied of its steps', '1do', true, () => { const p = join(wt, 'module-8.js'); writeFileSync(p, readFileSync(p, 'utf8') + "\nSETS.filter(w => w.moduleNum === 8).forEach(w => Object.values(w.stations||{}).forEach(st => (st.sections||[]).forEach(s => { if (s.kind === 'take-to-song') s.steps = []; })));\n"); });
    expect('near-miss: the Daily 5 switched ON (Jonathan\'s call)', '1do', false, () => edit('app/lesson.js', 'const DAILY5_ENABLED = false;', 'const DAILY5_ENABLED = true;'));
    // ── 8. the tour ──
    expect('rule 8: the deleted tour restored from git', '1do', true, () => { const r = git(wt, ['checkout', '5dc1ab8^', '--', 'tour.html', 'tour-img']); if (!r.ok) throw new Error(r.err); });
    expect('rule 8: one old tour screenshot restored under a new name', '1do', true, () => { const r = spawnSync('git', ['show', '5dc1ab8^:tour-img/songs.webp'], { cwd: wt, maxBuffer: 1 << 24 }); writeFileSync(join(wt, 'img', 'songs-shot.webp'), r.stdout); });
    expect('near-miss: a NEW tour.html of Jonathan\'s own', '1do', false, () => writeFileSync(join(wt, 'tour.html'), '<!doctype html><title>Guitar class — welcome</title><p>New tour.</p>'));
  } finally {
    git(root, ['worktree', 'remove', '--force', wt]);
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ }
  }
  console.log(`\nself-test: ${pass} of ${pass + fail} cases behaved (${fail ? 'FAIL' : 'all blocked edits red, all near-misses green'})`);
  process.exit(fail ? 1 : 0);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) {
  if (process.argv.includes('--self-test')) selfTest();
  else {
    let bad = 0;
    for (const [label, f] of [['1dl', () => checkKeysAgainstBase(DEFAULT_ROOT)], ['1dm', () => checkFirestoreWrites(DEFAULT_ROOT)], ['1dn', () => checkRulesPaste(DEFAULT_ROOT)], ['1do', () => checkKeptThings(DEFAULT_ROOT)]]) {
      for (const l of f()) { console.log(`${l.kind === 'ok' ? '✓' : l.kind === 'err' ? '✗' : '!'} ${label} ${l.text}`); if (l.kind === 'err') bad++; }
    }
    process.exit(bad ? 1 : 0);
  }
}
