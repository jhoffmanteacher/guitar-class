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
          module, the one the class is about to enter. A PURE REVERT (every
          module file byte-identical to an ancestor of the base, within 50
          commits) is let through with a loud line (BREAK-GLASS.md step 4).
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

import { readFileSync, readdirSync, existsSync, statSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, join, posix } from 'node:path';
import { tmpdir } from 'node:os';
import vm from 'node:vm';
import { tokenize, segments } from './js-scan.mjs';
import { analyzeFile, collectConstants, collectHandles, collectFactories, callGraph, realCalls, localNames, handlerSources, scriptHandlerSources, pathString } from './firestore-paths.mjs';
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
const MODULE_SPECS = ['module-*.js', 'config-main.js'];
/* A pure revert: every module file (the set of names and each one's bytes, as
   git would store them) equals some ancestor of the base, at most 50 back. */
function revertTarget(root, base) {
  const names = readdirSync(root).filter(f => MODULE_FILE.test(f)).sort();
  const h = git(root, ['hash-object', '--', ...names]);
  if (!h.ok) return null;
  const now = names.map((n, i) => `${n} ${h.out.split('\n')[i]}`).join('\n');
  const list = git(root, ['rev-list', '--max-count=50', `${base}^`]);
  if (!list.ok) return null;
  for (const c of list.out.split('\n').filter(Boolean)) {
    const t = git(root, ['ls-tree', c]);
    if (!t.ok) continue;
    const then = t.out.split('\n').map(l => l.match(/^\d+ blob ([0-9a-f]+)\t(.+)$/)).filter(m => m && MODULE_FILE.test(m[2])).map(m => `${m[2]} ${m[1]}`).sort().join('\n');
    if (then === now) return { commit: c, subject: git(root, ['log', '-1', '--format=%s', c]).out };
  }
  return null;
}
export function checkKeysAgainstBase(root = DEFAULT_ROOT, { frozenMcThrough } = {}) {
  const r = R();
  // The two FROZEN numbers are one setting (CLAUDE.md: FROZEN_THROUGH (= FROZEN_MC_THROUGH_MODULE)).
  const rz = readText(root, 'tools/rule-zero-proof.mjs') || '';
  const m = rz.match(/^const FROZEN_THROUGH = (\d+);/m);
  if (!m) r.err('1dl: tools/rule-zero-proof.mjs has no `const FROZEN_THROUGH = <n>;` line, so nothing proves which modules are frozen');
  else if (frozenMcThrough !== undefined && Number(m[1]) !== frozenMcThrough)
    r.err(`1dl: rule-zero-proof.mjs freezes Modules 1–${m[1]} but checks.mjs 1ap freezes keyed quizzes in Modules 1–${frozenMcThrough}; they are one setting (CLAUDE.md "Three regimes"): raise both together, a module ahead of the class, and never lower either`);
  const base = resolveBase(root);
  if (base.missing) { r.err(`1dl: cannot compare with the push's base: ${base.missing}`); return r.lines; }
  if (base.none) {
    const t = touchesWithoutBase(root, MODULE_SPECS, f => MODULE_FILE.test(f));
    if (t && t.length) r.err(`1dl: refused — ${t.join(', ')} changed, and ${base.none}, so this check cannot tell whether a saved place moved (${NEVER}). Run git fetch origin (so origin/main exists) and check again.`);
    else r.warn(`1dl: ${base.none}; no module file changed here (or this is not git), so there was nothing to compare`);
    return r.lines;
  }
  const changed = changedSince(root, base.ref, MODULE_SPECS, f => MODULE_FILE.test(f));
  if (!changed.length) { r.ok(`no module file differs from ${base.label}: no progress key can have moved`); return r.lines; }
  const p = spawnSync(process.execPath, [join(root, 'tools', 'rule-zero-proof.mjs'), base.ref], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26, timeout: 120000 });
  const out = strip((p.stdout || '') + (p.stderr || '')).replace(/\r\n?/g, '\n');
  const lines = out.split('\n');
  const crosses = lines.filter(l => /^✗ /.test(l)).map(l => l.slice(2));
  const ticks = lines.filter(l => /^✓ /.test(l)).map(l => l.slice(2));
  const rest = lines.filter(l => l.trim() && !/^[✓✗] /.test(l) && !/^\s*\(none\)\s*$/.test(l));
  if (p.status === 0) {
    r.ok(`${changed.length} module file${changed.length === 1 ? '' : 's'} changed since ${base.label} (${changed.join(', ')}); tools/rule-zero-proof.mjs passes: ${ticks.join('; ')}`);
    rest.forEach(l => r.info(l));
    return r.lines;
  }
  const rev = revertTarget(root, base.ref);
  if (rev) {
    r.warn(`1dl: this change puts every module file back exactly as it was in ${rev.commit.slice(0, 7)} ("${rev.subject}"), an ancestor of ${base.ref.slice(0, 7)}: a pure revert, let through (BREAK-GLASS.md step 4). rule-zero-proof against the base said: ${crosses.join(' | ') || `exit ${p.status}`}`);
    return r.lines;
  }
  const crash = crosses.length ? null : (out.match(/^.*Error:.*$/m) || [null])[0];
  r.err(`1dl: refused — this change ${crosses.length ? 'moves a saved place or rewords a frozen quiz' : 'could not be proved safe'} (${NEVER}: never move or renumber a section or step; never reword a keyed quiz's choices or English prompt in Modules 1–${m ? m[1] : '?'} or in Module ${m ? Number(m[1]) + 1 : '?'}, the one the class is about to enter; "Three regimes"). Module progress keys stay valid for good. Put it back as it was in ${base.ref.slice(0, 7)}; a fix a frozen module blocks goes on the list in skill summer-reset. tools/rule-zero-proof.mjs ${base.ref.slice(0, 7)} said:`);
  if (crosses.length) crosses.forEach(c => r.err(`  ${c}`));
  else r.err(`  (the proof did not finish, exit ${p.status}) ${crash || lines.filter(Boolean).slice(-2).join(' | ')}`);
  rest.forEach(l => r.info(l));
  return r.lines;
}

/* ════════════════════════════════════════════════════════════════════
   1dm. FIRESTORE WRITES, READ FROM THE CODE (rules 3, 4)
   ════════════════════════════════════════════════════════════════════ */
/* The only places that may write progress/… directly (a write, or a
   reference handed on), by file and function, with how many such chains each
   has. A new one anywhere, or one more in a pinned function, fails until it is
   added here with its reason: the save path is a danger zone (CLAUDE.md
   "Triggers"), so that edit is Always Reviewed. A console part (teacher-*.js)
   may never be listed. `node tools/never-blocks.mjs --pins` prints today's. */
export const PROGRESS_WRITERS = {
  'app/save.js|swap45Commit': { n: 3, why: 'the one-time Modules 4/5 move: its transaction reads and writes the signed-in student\'s own doc' },
  'app/save.js|flushSave': { n: 1, why: 'the app\'s progress writer: the signed-in student\'s own doc' },
  'app/explore.js|songsLibraryOpen': { n: 1, why: 'a Songs-page click counts one open in the student\'s own doc (checks.mjs 1ch)' },
  'trainer-site-adapter.js|(top level)': { n: 1, why: 'Hear It First saves its profile in the signed-in account\'s own doc (mergeFields trainer)' },
  'tabs/journey.js|flushSave': { n: 3, why: 'a Journey page\'s "I\'m ready" saves into the student\'s own doc' },
};
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
  const relevant = all.filter(e => e.console || e.handlersOf || e.file.includes('handlers') || MAY_TOUCH_FIRESTORE.test(e.src));
  const consts = collectConstants(relevant.map(tok));
  const handles = collectHandles(relevant.map(tok));
  const run = (factories) => {
    const found = { chains: [], refs: [], odd: [] };
    for (const e of relevant) {
      const a = analyzeFile(e.file, tok(e), consts, { handles, factories });
      for (const k of ['chains', 'refs', 'odd']) a[k].forEach(c => { c.console = e.console; c.handler = !!(e.handlersOf || e.file.includes('handlers')); found[k].push(c); });
    }
    return found;
  };
  let found = run(new Map());
  const factories = collectFactories(found.chains);
  if (factories.size) found = run(factories);
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
  const sites = progressWriteSites(found, false);
  for (const [k, list] of sites) {
    const pin = PROGRESS_WRITERS[k];
    if (!pin) bad.push(`1dm: refused — ${where(list[0])} ${list[0].kind === 'write' ? `writes ${list[0].path[0] === 'progress' ? 'progress/…' : `a path this check cannot name (${pathString(list[0].path)})`} with ${list[0].detail}` : `hands a reference to ${list[0].path[0] === 'progress' ? 'progress/…' : `a path this check cannot name (${pathString(list[0].path)})`} on (${list[0].detail})`}, and no new place may write a student's saved work (${NEVER}; the pinned writers are PROGRESS_WRITERS in tools/never-blocks.mjs). If it is deliberate and not console code, add it there with its reason — a save-path change, Always Reviewed.`);
    else if (list.length > pin.n) bad.push(`1dm: refused — ${k.replace('|', ' ')}() now has ${list.length} chains that write progress/… or hand it on, ${pin.n} pinned (${pin.why}); the new one is at line ${list[list.length - 1].line}. If it is deliberate, raise n in PROGRESS_WRITERS (tools/never-blocks.mjs) with its reason — a save-path change, Always Reviewed.`);
  }
  for (const k of Object.keys(PROGRESS_WRITERS)) {
    if (consoleFiles.has(k.split('|')[0])) bad.push(`1dm: PROGRESS_WRITERS lists ${k}, a console part — the console may never write progress/… (${RULE3}).`);
  }
  const stalePins = Object.entries(PROGRESS_WRITERS).filter(([k, v]) => (sites.get(k) || []).length < v.n).map(([k, v]) => `${k} (${(sites.get(k) || []).length} of ${v.n})`);

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
    for (const [k, v] of callGraph(e.file, tok(e))) if (k !== '(top level)') { if (!graph.has(k)) graph.set(k, new Set()); v.calls.forEach(c => graph.get(k).add(c)); }
  }
  const reach = new Set(writers);
  for (let grew = true; grew;) { grew = false; for (const [k, calls] of graph) if (!reach.has(k) && [...calls].some(c => reach.has(c))) { reach.add(k); grew = true; } }
  let consoleCalls = 0;
  for (const e of entries.filter(e => e.console)) {
    const t = tok(e);
    for (const seg of segments(t)) {
      const body = t.slice(seg.from, seg.to);
      const locals = localNames(body); locals.delete(seg.name);
      for (const c of realCalls(body, locals)) {
        consoleCalls++;
        if (reach.has(c.name)) bad.push(`1dm: refused — ${e.file}:${c.line} (${seg.name}) calls ${c.name}(), an app function that saves to progress/… (${writers.has(c.name) ? 'directly' : 'through the functions it calls'}) (${RULE3}). Show the student's work from the console's own read instead.`);
      }
    }
  }
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
  if (stalePins.length) r.warn(`1dm: PROGRESS_WRITERS pins more than the code has: ${stalePins.join(', ')} — lower n (or drop the entry) in tools/never-blocks.mjs, so a new write there is caught`);
  const consoleChains = found.chains.filter(c => c.console).length;
  r.ok(`${entries.filter(e => !e.handlersOf).length} scripts from ${ls.pages.length} pages (${relevant.length} that can reach Firestore read as code, inline handlers included; ${[...consoleFiles].length} console parts): progress/… is written only where PROGRESS_WRITERS says (${sites.size} places, ${[...sites.values()].reduce((a, l) => a + l.length, 0)} chains); in the console ${consoleChains} Firestore chains, ${progressReads} on progress/… and every one a read, ${found.refs.filter(x => x.console).length} snapshot .refs traced to non-progress queries, ${consoleCalls} calls and none to the ${reach.size} app functions that save progress; config/class: ${configReads} reads, ${guardWrites} writes, all inside the one teacherWriteConfig(); ${factories.size} reference-returning functions followed; ${UNFOLLOWABLE_TODAY.length} console shapes it cannot follow, each the exact case named in tools/never-blocks.mjs`);
  return r.lines;
}

/* ════════════════════════════════════════════════════════════════════
   1dn. A firestore.rules CHANGE IS PASTED BY JONATHAN (rule 5)
   GitHub Pages never publishes firestore.rules: until Jonathan pastes it in
   the Firebase console, the live rules are the old ones, and code that needs
   the new ones fails with no error a student can see. So a change to the
   file needs one more line in RULES-PASTE.md than the base had, naming the
   first 12 hex of the sha256 of the new text (line endings as LF) and that
   Jonathan was told. The hash ties the line to this exact text: a later edit,
   or a revert to an older text, needs a line of its own (adding the printed
   line again works even when the same words are already there). It blocks
   at the push (GC_CHECKS_STAGE=push: the pre-push hook and GitHub); at a
   commit or a turn's end it warns, so work in progress is not stuck.
   ════════════════════════════════════════════════════════════════════ */
export const RULES_FILE = 'firestore.rules';
export const PASTE_FILE = 'RULES-PASTE.md';
export const rulesHash = text => sha(lf(text));
const PASTE_LINE = /^- (\d{4})-(\d{2})-(\d{2}) firestore\.rules ([0-9a-f]{12}): (.*)$/;
const todayLocal = () => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; };
const tally = lines => lines.reduce((m, l) => m.set(l, (m.get(l) || 0) + 1), new Map());
export function checkRulesPaste(root = DEFAULT_ROOT) {
  const r = R();
  const atPush = process.env.GC_CHECKS_STAGE === 'push';
  const block = t => atPush ? r.err(t) : r.warn(`${t} (a warning here; the push will refuse it)`);
  const base = resolveBase(root);
  if (base.missing) { r.err(`1dn: cannot compare with the push's base: ${base.missing}`); return r.lines; }
  if (base.none) {
    const t = touchesWithoutBase(root, [RULES_FILE], f => f === RULES_FILE);
    if (t && t.length) block(`1dn: refused — firestore.rules changed, and ${base.none}, so this check cannot tell whether Jonathan was told (${NEVER}). Run git fetch origin (so origin/main exists) and check again.`);
    else r.warn(`1dn: ${base.none}; firestore.rules did not change here (or this is not git), so there was nothing to compare`);
    return r.lines;
  }
  /* The record is append-only: every record line the base had (the "- YYYY-MM-DD firestore.rules …"
     lines) stays, unchanged. The explanation above them may be edited. */
  const baseLog = git(root, ['show', `${base.ref}:${PASTE_FILE}`]);
  const isRecord = l => /^- \d{4}-\d{2}-\d{2} firestore\.rules /.test(l);
  const beforeLines = baseLog.ok ? lf(baseLog.raw).split('\n').filter(isRecord) : [];
  const nowLines = (readText(root, PASTE_FILE) || '').split('\n').filter(isRecord);
  const nowTally = tally(nowLines), beforeTally = tally(beforeLines);
  const lost = [...beforeTally].filter(([l, n]) => (nowTally.get(l) || 0) < n).map(([l]) => l);
  if (lost.length) block(`1dn: refused — ${PASTE_FILE} lost or changed ${lost.length} record line${lost.length === 1 ? '' : 's'} the base had ("${lost[0].slice(0, 90)}"${lost.length > 1 ? ', …' : ''}); it is the record of what Jonathan was told, so lines are only ever added (${NEVER}). Put ${lost.length === 1 ? 'it' : 'them'} back as ${lost.length === 1 ? 'it was' : 'they were'}.`);
  const now = readText(root, RULES_FILE);
  const diff = git(root, ['diff', '--quiet', base.ref, '--', RULES_FILE]);
  if (diff.status !== 0 && diff.status !== 1) { r.err(`1dn: git could not compare firestore.rules with ${base.label}: ${diff.err}`); return r.lines; }
  const untracked = git(root, ['ls-files', '--others', '--exclude-standard', '--', RULES_FILE]).out;
  const thenText = git(root, ['show', `${base.ref}:${RULES_FILE}`]);
  // git's own comparison applies the checkout's line-ending rules; the hash comparison covers a CRLF copy with none.
  const same = (diff.status === 0 && !untracked) || (now !== null && thenText.ok && rulesHash(now) === rulesHash(thenText.raw));
  if (same) { if (!lost.length) r.ok(`firestore.rules is the same as at ${base.label}: nothing for Jonathan to paste${baseLog.ok ? `; ${PASTE_FILE} keeps all ${beforeLines.length} lines the base had` : ''}`); return r.lines; }
  if (now === null) { block(`1dn: refused — firestore.rules is gone. The live rules stay whatever was last pasted; deleting the file changes nothing there and loses the record (${NEVER}). Put it back.`); return r.lines; }
  const h = rulesHash(now);
  const today = todayLocal();
  r.warn(`firestore.rules changed: Jonathan must paste it in the Firebase console (Firestore → Rules → paste → Publish); GitHub does not publish it.`);
  const want = `- ${today} firestore.rules ${h}: Jonathan was told on ${today} to paste it in the Firebase console (Firestore → Rules → Publish)`;
  const valid = l => {
    const m = l.match(PASTE_LINE);
    if (!m || m[4] !== h) return false;
    const date = `${m[1]}-${m[2]}-${m[3]}`, d = new Date(`${date}T12:00:00`);
    if (Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== date) return false;
    if (date > today && (new Date(`${date}T00:00:00`) - new Date()) > 36 * 3600e3) return false;   // no date in the future (a day's slack for time zones)
    return /\btold\b/i.test(m[5]) && /\bpaste/i.test(m[5]) && /Firebase console/i.test(m[5]);
  };
  const added = [...nowTally].filter(([l, n]) => valid(l) && n > (beforeTally.get(l) || 0)).map(([l]) => l);
  if (added.length) { if (!lost.length) r.ok(`firestore.rules ${h} acknowledged by a new line in ${PASTE_FILE}: "${added[0].slice(2)}"`); return r.lines; }
  const other = nowLines.filter(l => PASTE_LINE.test(l) && (nowTally.get(l) || 0) > (beforeTally.get(l) || 0));
  block(`1dn: refused — firestore.rules differs from ${base.label} and ${PASTE_FILE} has no new line for this exact text (sha256 ${h}) (${NEVER}: never change firestore.rules without telling Jonathan it needs a console paste; the steps are under "Other standing rules"). Tell Jonathan first, then add this line to ${PASTE_FILE}:  ${want}${other.length ? `  (the new line there names ${other.map(l => l.match(PASTE_LINE)[4]).join(', ')}, another text of the file)` : ''}`);
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
   standing rules"). Pinned at origin/main 2026-11-13 (0d973cf):
   - each function's token fingerprint (comments, spacing and line endings do
     not count; any change to its code does);
   - how many times the app reads each switch, the .daily5 rules in styles.css,
     the daily5 markup in index.html, the daily5 strings (English and Spanish,
     not empty), WARMUP_BANK's entries;
   - every Take It to a Song step, by a hash of its label, text, label_es and
     text_es, per module. Adding sections, steps, rules or entries is fine. */
const SWITCH_READS = { DAILY5_ENABLED: 1, TAKE_TO_SONG_ENABLED: 2 };   // app/lesson.js: ladderHtml() reads the first; visibleSteps() and visibleSections() the second
export const DAILY5_FUNCTIONS = {
  buildDaily5: '00eff2494800', openDaily5Here: 'e009f23fe6ee', closeDaily5: '2f57d98c568f', daily5EscClose: '095632226185',
  dayOfYear: '3b1729df30c0', moduleStepsFlat: '114343a50a76', buildModuleRoutine: '3623c95a5044', isTakeToSongSection: '9e117490f7a0',
};
const DAILY5_KEYS = ['daily5.tuneWarmupHtml', 'daily5.openToday', 'daily5.title', 'daily5.closeAria', 'daily5.tuneUpBody', 'daily5.warmUp', 'daily5.todaysDrill', 'daily5.fromModule', 'daily5.streak'];
const DAILY5_CSS_RULES = 12;   // selectors naming a .daily5 class in styles.css
const DAILY5_INDEX_MARKUP = 1;   // the search panel reuses .daily5-panel
const WARMUP_BANK_MIN = 3;
export const TAKE_TO_SONG_STEPS = {
  2: ['632e0618', '4b962563', '12e037b6', '3ff9522a', '6a052b9f', '9bccfa86', '7ba62b77', '4a29051a'],
  3: ['94f1fb26', '4a56e7bb', '270e1454', '6d62106e'],
  4: ['9014262e', '59628d20', '83c07e5d', 'a7c42178', 'd181121a', 'e12331e6'],
  5: ['71e8b80d', '00bcc49e', '560c3e09', '6b992898', '1e8630a1', '563cfd38', '39c29dbb'],
  6: ['b2a0a0f5', '235c75e2', 'fd15cb59', '18e825f1', 'e5a0b558', '85866425'],
  7: ['746975a8', '0fd5ae96', 'e167ef7f', '84109771', '1b1fa0a1'],
  8: ['80f8f729', 'ce998de6', '81192928'],
  9: ['26745c8e', '55b0ebca'],
  10: ['7d4df60a', 'be3911d4', 'cffb036a'],
  11: ['6478eaa1', '12c4e71d', '09aeca5d'],
  12: ['b5dfa4bf', '483cbd18', 'ade55e1a'],
};
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

/* Today's values of every 1do pin (also printed by --pins). */
export function measureKept(root, sets) {
  const appFiles = siteParts('app.js', root);
  const fnSig = {}, declared = {}, reads = {};
  for (const s of Object.keys(SWITCH_READS)) { declared[s] = []; reads[s] = 0; }
  for (const f of appFiles) {
    const src = readText(root, f) || '';
    const t = tokensOf(`${root}::${f}`, src);
    for (const seg of segments(t)) if (Object.prototype.hasOwnProperty.call(DAILY5_FUNCTIONS, seg.name) && t[seg.from].v !== 'const') fnSig[seg.name] = sha(t.slice(seg.from, seg.to).map(tokenSig).join(' '));
    for (let k = 0; k < t.length; k++) {
      const x = t[k];
      if (x.t !== 'id' || !Object.prototype.hasOwnProperty.call(reads, x.v)) continue;
      if (t[k - 1] && t[k - 1].t === 'id' && t[k - 1].v === 'const' && t[k + 1] && t[k + 1].v === '=') declared[x.v].push(t[k + 2] && t[k + 2].t === 'id' && t[k + 3] && t[k + 3].v === ';' ? t[k + 2].v : '(not a literal)');
      else reads[x.v]++;
    }
  }
  const css = (readText(root, 'styles.css') || '').replace(/\/\*[\s\S]*?\*\//g, '');
  const cssRules = css.split('}').map(c => c.split('{')[0]).reduce((n, sel) => n + (sel.match(/\.daily5[\w-]*/g) || []).length, 0);   // selectors naming a .daily5 class
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
    const m = Number(w.moduleNum);
    (steps[m] = steps[m] || []).push(...(sec.steps || []).map(stepHash));
  }
  return { fnSig, declared, reads, cssRules, indexMarkup, strings, warmup, steps };
}

export function checkKeptThings(root = DEFAULT_ROOT, { sets } = {}) {
  const r = R();
  const bad = [];
  const REPIN = 'If Jonathan asked for this change, re-pin it: node tools/never-blocks.mjs --pins, with the date and his reason beside the new value';
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
  const k = measureKept(root, sets);
  const OFF = `(${NEVER}: never delete what is switched off — "switched off, never deleted", so flipping the switch brings it back)`;
  for (const [s, n] of Object.entries(SWITCH_READS)) {
    const d = k.declared[s];
    if (d.length !== 1 || !/^(true|false)$/.test(d[0])) bad.push(`1do: refused — ${s} must be declared once in the app as \`const ${s} = true;\` or \`= false;\` (found ${d.length ? d.join(', ') : 'nothing'}) ${OFF}. On or off is Jonathan's call; deleting the switch is not.`);
    if (k.reads[s] < n) bad.push(`1do: refused — the app reads ${s} ${k.reads[s]} time${k.reads[s] === 1 ? '' : 's'}, ${n} pinned: a place the switch turns on or off was deleted, so flipping it back would not bring that back ${OFF}. Put the line back. ${REPIN}.`);
  }
  const goneFns = Object.keys(DAILY5_FUNCTIONS).filter(f => !k.fnSig[f]);
  if (goneFns.length) bad.push(`1do: refused — ${goneFns.map(f => `${f}()`).join(', ')} ${goneFns.length === 1 ? 'is' : 'are'} gone from the app parts; part of the switched-off Daily 5 / Take It to a Song ${OFF}. Put ${goneFns.length === 1 ? 'it' : 'them'} back from origin/main.`);
  const changedFns = Object.keys(DAILY5_FUNCTIONS).filter(f => k.fnSig[f] && DAILY5_FUNCTIONS[f] && k.fnSig[f] !== DAILY5_FUNCTIONS[f]);
  if (changedFns.length) bad.push(`1do: refused — the code of ${changedFns.map(f => `${f}() (now ${k.fnSig[f]}, pinned ${DAILY5_FUNCTIONS[f]})`).join(', ')} changed; it is part of the switched-off Daily 5 / Take It to a Song ${OFF}. Put it back from origin/main. ${REPIN}.`);
  if (k.cssRules < DAILY5_CSS_RULES) bad.push(`1do: refused — styles.css has ${k.cssRules} selectors naming a .daily5 class, ${DAILY5_CSS_RULES} pinned: the Daily 5's look would be gone when it is switched back on ${OFF}. Put them back.`);
  if (k.indexMarkup < DAILY5_INDEX_MARKUP) bad.push(`1do: refused — index.html has ${k.indexMarkup} daily5 elements, ${DAILY5_INDEX_MARKUP} pinned ${OFF}. Put the markup back.`);
  const emptyStr = Object.entries(k.strings).filter(([, v]) => !v.en || !v.es).map(([key, v]) => `${key} (${!v.en ? 'English' : ''}${!v.en && !v.es ? ' and ' : ''}${!v.es ? 'Spanish' : ''})`);
  if (emptyStr.length) bad.push(`1do: refused — the switched-off Daily 5's strings are gone or empty in i18n.js: ${emptyStr.join(', ')} ${OFF}. Put the words back.`);
  if (k.warmup < WARMUP_BANK_MIN) bad.push(`1do: refused — config-main.js's WARMUP_BANK has ${k.warmup} warm-ups with text, ${WARMUP_BANK_MIN} pinned; the switched-off Daily 5 deals from it ${OFF}. Put them back.`);
  for (const [m, pinned] of Object.entries(TAKE_TO_SONG_STEPS)) {
    const have = new Set(k.steps[m] || []);
    const missing = pinned.filter(h => !have.has(h));
    if (missing.length) bad.push(`1do: refused — Module ${m}'s Take It to a Song sections lost or changed ${missing.length} of their ${pinned.length} steps (a step's label, text or Spanish changed, it was removed, or its section was) ${OFF}; each section also holds the number that every later saved tick is keyed by. Put them back as they were; hide a step with hidden: true if it must not show. ${REPIN}.`);
  }

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
  r.ok(`"the cure": ${Object.keys(CURE_AUDIO).length} of ${Object.keys(CURE_AUDIO).length} files keep their pinned bytes (and sw.js's map agrees), and tools/loudness.py still takes it as the reference it refuses to level; switched off, never deleted: ${Object.keys(SWITCH_READS).join(' and ')} declared and read ${Object.values(k.reads).join(' and ')} times, ${Object.keys(DAILY5_FUNCTIONS).length} functions with their pinned code, ${k.cssRules} .daily5 selectors, ${k.indexMarkup} daily5 element${k.indexMarkup === 1 ? '' : 's'} in index.html, ${DAILY5_KEYS.length} daily5 strings in English and Spanish, ${k.warmup} warm-ups, ${Object.values(TAKE_TO_SONG_STEPS).reduce((a, l) => a + l.length, 0)} pinned Take It to a Song steps all present (${secSteps} today, in ${Object.keys(k.steps).length} modules); the deleted tour: none of its ${Object.keys(TOUR_BLOBS).length} files (${scanned} same-size files hashed) and no page with its slides' words`);
  return r.lines;
}

/* --pins: today's value of every pin, to paste (with a date and a reason) after a change Jonathan asked for. */
function printPins(root) {
  const k = measureKept(root);
  const { found } = analyzeSite(root);
  const sites = progressWriteSites(found, false);
  console.log('PROGRESS_WRITERS (file|function: chains that write progress/… or hand it on):');
  for (const [key, list] of [...sites].sort()) console.log(`  '${key}': { n: ${list.length}, why: '…' },   // lines ${list.map(c => c.line).join(', ')}`);
  console.log(`SWITCH_READS = ${JSON.stringify(k.reads)};   // declared: ${JSON.stringify(k.declared)}`);
  console.log('DAILY5_FUNCTIONS = {');
  for (const [f, h] of Object.entries(k.fnSig)) console.log(`  ${f}: '${h}',`);
  console.log('};');
  console.log(`DAILY5_CSS_RULES = ${k.cssRules}; DAILY5_INDEX_MARKUP = ${k.indexMarkup}; WARMUP_BANK_MIN = ${k.warmup};`);
  console.log(`daily5 strings: ${Object.entries(k.strings).map(([key, v]) => `${key} en ${v.en.length} es ${v.es.length}`).join('; ')}`);
  console.log('TAKE_TO_SONG_STEPS = {');
  for (const [m, l] of Object.entries(k.steps)) console.log(`  ${m}: [${l.map(h => `'${h}'`).join(', ')}],`);
  console.log('};');
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
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
