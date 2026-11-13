#!/usr/bin/env node
/* lint.mjs — the site's "name checker": ESLint over every shipped script, page by page (2026-11-13).

     node tools/lint.mjs              a short report; always exits 0 (report-only)
     node tools/lint.mjs --strict     exit 1 when any error-level finding is left (see "Strict" below)
     node tools/lint.mjs --verbose    also list every no-unused-vars warning
     node tools/lint.mjs --github     also print GitHub annotations (::warning per finding, ::notice with counts)
     node tools/lint.mjs --root=DIR   lint another site folder (a scratch copy with a planted fault)

   Zero dependencies itself. It runs ESLint fetched by npx at the exact versions pinned in eslint.config.mjs
   (`npx --yes -p eslint@X -p globals@Y node tools/lint.mjs --inner …`), so nothing is installed in the repo and
   nothing here ships. npx needs the network the first time; after that it uses npm's cache. It runs on GitHub
   (.github/workflows/checks.yml, job "lint", never failing the run); it is NOT part of tools/checks.mjs.

   ── Why page by page ──
   Every script on a page shares one global scope, so a name declared at the top of one script is a global in all
   the others. The pages:
     index.html     its <script src> tags (the app parts, i18n.js, …) and the scripts it loads LATER on demand:
                    the arcade parts (COACH_JS_PARTS), the console parts (TEACHER_JS_PARTS), module-N.js and the
                    "Hear It First" files trainer-site-adapter.js loads (its `var need = [...]` line)
     tabs/*.html    each Song Journey page: its <script src> tags and its inline <script> blocks
     other *.html   in the repo root and tabs/: their scripts and inline blocks
     sw.js          alone, with the service-worker globals
   Pass 1 collects each script's own top-level names (its declarations, and what it puts on `window`).
   Pass 2 lints each script once per page it is on, with the names the page's OTHER scripts declare as globals.
   A finding on a shared script (i18n.js, tuner.js, …) is printed once, with the pages it shows on when that is
   not all of them.

   ── Inline handlers ──
   The site builds most of its buttons as HTML strings: `onclick="caOpen(${jsonAttrArg(id)})"`. ESLint cannot see
   inside a string, so this file pulls every on*="…" / on*='…' attribute value out of every script and HTML page,
   puts each `${…}` back as the placeholder $TPL$, undoes the HTML entities and JS escapes, and lints the result
   as a function body on the same page. A name built from a placeholder (`pc${kind}Play()`) cannot be checked and
   is counted as "dynamic". A value that does not parse after that (string concatenation across quotes) is
   counted as "skipped".

   ── Load order ──
   Its own check: a statement that runs when its script loads (not inside a function) and uses a name that only a
   LATER script on that page declares. Order = the page's non-deferred scripts in document order, then its
   deferred ones, then the on-demand ones (arcade, console, Hear It First, modules). `typeof x` is not a use.

   ── Reading the no-undef list ──
   Each line is `file:line name`, tagged when it applies:
     [guarded]      the same file contains `typeof name` (the call is meant to be skipped when the name is absent)
     [write]        the name is assigned, never declared: it becomes a global in sloppy mode (it works, but a typo
                    in such a name would silently make a second variable)
     [handler]      inside an inline on*="…" handler in an HTML string
     [pages: …]     only on those pages (the script is on other pages where the name exists)

   ── Strict ──
   --strict exits 1 when any error-level finding is left, except no-undef lines tagged [guarded]: a typeof guard
   on a name that one page lacks is the design (fab-tools.js on a Journey page), not a bug. */
import { readFileSync, readdirSync, existsSync, realpathSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { dirname, join, resolve, relative, delimiter, posix } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { siteParts } from './site-src.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TOOL_ROOT = resolve(HERE, '..');
const argv = process.argv.slice(2);
const flag = n => argv.includes('--' + n);
const opt = (n, d) => { const a = argv.find(x => x.startsWith('--' + n + '=')); return a ? a.slice(n.length + 3) : d; };
const ROOT = resolve(opt('root', TOOL_ROOT));
if (!existsSync(join(ROOT, 'index.html'))) { console.error(`lint: ${ROOT} has no index.html`); process.exit(2); }

const configMod = await import(pathToFileURL(join(TOOL_ROOT, 'eslint.config.mjs')).href);
const { ESLINT_VERSION, GLOBALS_VERSION, scriptConfig } = configMod;

/* ── Outer run: fetch the pinned ESLint with npx and run this file again inside it ── */
if (!flag('inner')) {
  const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
  const r = spawnSync(npx, ['--yes', '-p', `eslint@${ESLINT_VERSION}`, '-p', `globals@${GLOBALS_VERSION}`,
    'node', fileURLToPath(import.meta.url), '--inner', ...argv],
    { stdio: 'inherit', shell: process.platform === 'win32' });
  if (r.error) { console.error('lint: could not run npx: ' + r.error.message); process.exit(flag('strict') ? 2 : 0); }
  process.exit(r.status ?? (flag('strict') ? 2 : 0));
}

/* ── Inner run: ESLint and globals are on PATH (npx put their .bin there) ── */
function npxModules() {
  for (const d of (process.env.PATH || '').split(delimiter)) {
    if (existsSync(join(d, 'eslint')) || existsSync(join(d, 'eslint.cmd'))) {
      const nm = dirname(d);
      if (existsSync(join(nm, 'eslint', 'package.json')) && existsSync(join(nm, 'globals', 'package.json'))) return nm;
    }
  }
  console.error('lint: --inner found no eslint + globals install on PATH (run it without --inner)');
  process.exit(2);
}
const req = createRequire(join(npxModules(), 'noop.js'));
const { Linter } = req('eslint');
const GLOBALS = req('globals');
const realVersion = req('eslint/package.json').version;
if (realVersion !== ESLINT_VERSION) { console.error(`lint: npx gave ESLint ${realVersion}, pinned ${ESLINT_VERSION}`); process.exit(2); }

const read = rel => readFileSync(join(ROOT, rel), 'utf8');
const lineOf = (text, idx) => { let n = 1; for (let i = 0; i < idx; i++) if (text.charCodeAt(i) === 10) n++; return n; };

/* ── Units: a script file, an inline <script> block, or the handlers pulled out of one file ── */
const units = new Map();   // key → { key, file, code, lineMap?, kind }
function scriptUnit(rel) {
  if (!units.has(rel)) units.set(rel, { key: rel, file: rel, code: read(rel), kind: 'script' });
  return rel;
}

/* <script> tags of an HTML page, in run order: classic non-deferred in document order, then deferred. */
function htmlScripts(htmlRel) {
  const html = read(htmlRel), dir = posix.dirname(htmlRel);
  const now = [], later = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const attrs = m[1], src = /\ssrc="([^"]+)"/.exec(attrs);
    if (/type="(?!text\/javascript)/i.test(attrs)) continue;
    const deferred = /\s(defer|async)\b/i.test(attrs);
    if (src) {
      if (/^(https?:)?\/\//.test(src[1])) continue;
      const rel = posix.normalize(posix.join(dir, src[1].replace(/[?#].*$/, '')));
      if (!existsSync(join(ROOT, rel))) { console.error(`lint: ${htmlRel} loads ${rel}, which does not exist`); continue; }
      (deferred ? later : now).push(scriptUnit(rel));
    } else if (m[2].trim()) {
      const start = m.index + m[0].indexOf('>') + 1;
      const line = lineOf(html, start);
      const key = `${htmlRel}#script@${line}`;
      units.set(key, { key, file: htmlRel, code: '\n'.repeat(line - 1) + m[2], kind: 'inline' });
      now.push(key);
    }
  }
  return [...now, ...later];
}

/* Inline handler values: on<event>="…" or on<event>='…' (optionally \"-escaped inside a JS string). */
const HANDLER_STATS = { found: 0, skipped: [], dynamic: new Set() };
const linter = new Linter({ cwd: ROOT });
const parses = code => !linter.verify(code, [{ languageOptions: { ecmaVersion: 'latest', sourceType: 'script' } }], { filename: join(ROOT, 'x.js') }).some(m => m.fatal);
function handlerUnit(fileRel, text) {
  const out = [], lineMap = [0];
  const re = /(?<=[\s"'`])on[a-z]{3,}=(\\?)(["'])/g;
  let m;
  while ((m = re.exec(text))) {
    const esc = m[1], q = m[2];
    let i = re.lastIndex, val = '', ok = false;
    while (i < text.length) {
      const c = text[i];
      if (c === '\n') break;
      if (c === '$' && text[i + 1] === '{') {
        let depth = 0, j = i + 1;
        for (; j < text.length; j++) { if (text[j] === '{') depth++; else if (text[j] === '}' && --depth === 0) break; }
        val += '$TPL$'; i = j + 1; continue;
      }
      if (esc ? (c === '\\' && text[i + 1] === q) : c === q) { ok = true; break; }
      if (c === '\\' && i + 1 < text.length) { val += text[i + 1]; i += 2; continue; }
      val += c; i++;
    }
    if (!ok) continue;
    re.lastIndex = i + 1;
    const body = val.replace(/&quot;/g, '"').replace(/&#0*39;|&#x0*27;|&apos;/gi, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    if (!/[A-Za-z_$]/.test(body)) continue;
    HANDLER_STATS.found++;
    const fn = `;(function (event) { ${body}\n});`, line = lineOf(text, m.index);
    if (!parses(fn)) { HANDLER_STATS.skipped.push(`${fileRel}:${line} ${body}`); continue; }
    out.push(fn);
    lineMap.push(line, line);
  }
  if (!out.length) return null;
  const key = fileRel + '#handlers';
  units.set(key, { key, file: fileRel, code: out.join('\n'), lineMap, kind: 'handlers' });
  return key;
}

/* ── The pages ── */
const pages = [];   // { name, keys: [unit keys in run order], lazyFrom: index where on-demand scripts start, env }
function htmlFiles() {
  const list = [];
  for (const d of ['', 'tabs']) {
    let names = [];
    try { names = readdirSync(join(ROOT, d)); } catch { continue; }
    for (const f of names.sort()) if (f.endsWith('.html')) list.push(d ? d + '/' + f : f);
  }
  return list;
}
for (const html of htmlFiles()) {
  const keys = htmlScripts(html);
  const lazyFrom = keys.length;
  if (html === 'index.html') {
    const adapter = existsSync(join(ROOT, 'trainer-site-adapter.js')) ? read('trainer-site-adapter.js') : '';
    const need = /var need = \[([^\]]*)\]/.exec(adapter);
    const trainer = need ? [...need[1].matchAll(/'([^']+)'/g)].map(x => x[1]) : [];
    if (adapter && !need) console.error('lint: trainer-site-adapter.js has no `var need = [...]` line: the Hear It First files are not linted');
    const modules = readdirSync(ROOT).filter(f => /^module-\d+\.js$/.test(f)).sort((a, b) => parseInt(a.slice(7)) - parseInt(b.slice(7)));
    for (const rel of [...siteParts('coach.js', ROOT), ...siteParts('teacher.js', ROOT), ...trainer, ...modules]) {
      if (existsSync(join(ROOT, rel)) && !keys.includes(rel)) keys.push(scriptUnit(rel));
    }
  }
  const h = handlerUnit(html, read(html));
  for (const k of [...keys]) { const u = units.get(k); if (u.kind === 'script') { const hk = handlerUnit(k, u.code); if (hk) keys.push(hk); } }
  if (h) keys.push(h);
  pages.push({ name: html, keys, lazyFrom, env: 'browser' });
}
if (existsSync(join(ROOT, 'sw.js'))) pages.push({ name: 'sw.js', keys: [scriptUnit('sw.js')], lazyFrom: 1, env: 'serviceworker' });

/* ── Pass 1: each unit's own top-level names ──
   declared: its top-level declarations (var / let / const / function / class): two scripts on one page declaring
             the same name is what no-redeclare reports.
   exported: names it puts on the global object without declaring them: `window.X = …` (also self. / globalThis.)
             and the UMD shape `(function (root, factory) { … root.X = api; })(typeof self !== 'undefined' ? self :
             this, …)` the trainer files use. Other scripts may use them; no-redeclare does not look at them.
   A bare write to a name nobody declares (`foo = 1`) is NOT taken as a declaration: every use of it is reported,
   tagged [write]. */
const declared = new Map();   // key → Set of declared names
const exported = new Map();   // key → Set of names put on the global object
const parseErrors = [];
const implicitWrites = new Set();   // names some script assigns while no script on its page declares them
function collectPlugin(decl, exp) {
  return { rules: { collect: { create(context) {
    const sc = context.sourceCode;
    const GLOBAL_OBJ = /\b(self|window|globalThis|this)\b/;
    function globalObject(id, node) {
      if (['window', 'self', 'globalThis'].includes(id.name)) return true;
      for (let s = sc.getScope(node); s; s = s.upper) {
        const v = s.set.get(id.name);
        if (!v) continue;
        const d = v.defs[0];
        if (!d || d.type !== 'Parameter') return false;
        const fn = d.node, call = fn.parent, at = fn.params.indexOf(d.name);
        return !!(call && call.type === 'CallExpression' && call.callee === fn && at >= 0 && call.arguments[at] && GLOBAL_OBJ.test(sc.getText(call.arguments[at])));
      }
      return false;
    }
    return {
      AssignmentExpression(node) {
        const l = node.left;
        if (l.type !== 'MemberExpression' || l.object.type !== 'Identifier' || !globalObject(l.object, node)) return;
        if (!l.computed && l.property.type === 'Identifier') exp.add(l.property.name);
        else if (l.computed && l.property.type === 'Literal' && typeof l.property.value === 'string') exp.add(l.property.value);
      },
      'Program:exit'(node) {
        const g = sc.getScope(node);
        for (const v of g.variables) if (v.defs.length) decl.add(v.name);
        for (const r of g.through) if (r.isWrite()) implicitWrites.add(r.identifier.name);
      },
    };
  } } } };
}
const COLLECT_ONLY = Object.fromEntries(Object.keys(scriptConfig({})[0].rules).map(r => [r, 'off']).concat([['site/collect', 'error']]));
for (const u of units.values()) {
  const decl = new Set(), exp = new Set();
  if (u.kind !== 'handlers') {
    const msgs = linter.verify(u.code, scriptConfig({}, collectPlugin(decl, exp), COLLECT_ONLY), { filename: join(ROOT, 'x.js') });
    for (const msg of msgs) if (msg.fatal) parseErrors.push({ file: u.file, line: msg.line, text: msg.message });
  }
  declared.set(u.key, decl);
  exported.set(u.key, exp);
}

/* ── Pass 2: lint each unit on each page ── */
function loadOrderPlugin() {
  return { rules: { 'load-order': { meta: { schema: false }, create(context) {
    const later = context.options[0] || {};
    return { 'Program:exit'(node) {
      const g = context.sourceCode.getScope(node);
      for (const v of g.variables) {
        if (!later[v.name] || v.defs.length) continue;
        for (const ref of v.references) {
          const p = ref.identifier.parent;
          if (p && p.type === 'UnaryExpression' && p.operator === 'typeof') continue;
          let s = ref.from, inFn = false;
          for (; s; s = s.upper) if (s.type === 'function' || s.type.startsWith('class-')) { inFn = true; break; }
          if (!inFn) context.report({ node: ref.identifier, message: `${v.name} is used while this script loads, but only ${later[v.name]} declares it, and that loads later` });
        }
      }
    } };
  } } } };
}
const base = env => Object.fromEntries(Object.keys(env === 'serviceworker' ? GLOBALS.serviceworker : GLOBALS.browser).map(k => [k, 'readonly']));
const findings = new Map();   // dedupe key → finding
let lintRuns = 0;
const memo = new Map();
for (const page of pages) {
  const declaredAt = new Map();   // name → indexes (in run order) of the units on this page that declare it
  page.keys.forEach((k, i) => { for (const n of declared.get(k)) { if (!declaredAt.has(n)) declaredAt.set(n, []); declaredAt.get(n).push(i); } });
  page.keys.forEach((k, i) => {
    const u = units.get(k), own = declared.get(k);
    const globals = base(page.env);
    const later = {};   // name → the file that first declares it, when that runs after this unit (load-order)
    for (const [n, at] of declaredAt) {
      const others = at.filter(j => j !== i);
      if (!others.length) continue;
      globals[n] = 'writable';   // declared by another script on the page; when this one declares it too, no-redeclare says so
      if (u.kind !== 'handlers' && !own.has(n) && others[0] > i) later[n] = units.get(page.keys[others[0]]).file;
    }
    for (const o of page.keys) for (const n of exported.get(o)) if (!(n in globals) && !own.has(n)) globals[n] = 'writable';
    if (u.kind === 'handlers') globals.$TPL$ = 'readonly';
    const extra = u.kind === 'handlers'
      ? { 'no-unused-vars': 'off', 'no-redeclare': 'off' }
      : { 'site/load-order': ['error', later] };
    /* The six Song Journey pages give a shared script the same names: lint it once per distinct name set. */
    const memoKey = k + '\n' + Object.keys(globals).sort().join(',') + '\n' + JSON.stringify(later);
    let msgs = memo.get(memoKey);
    if (!msgs) { lintRuns++; msgs = linter.verify(u.code, scriptConfig(globals, loadOrderPlugin(), extra), { filename: join(ROOT, 'x.js') }); memo.set(memoKey, msgs); }
    for (const msg of msgs) {
      if (msg.fatal) continue;   // a script that does not parse is reported once, from pass 1
      const rule = msg.ruleId === 'site/load-order' ? 'load-order' : msg.ruleId;
      const line = u.lineMap ? u.lineMap[msg.line] : msg.line;
      let name = '';
      if (rule === 'no-undef') name = (/^'([^']+)'/.exec(msg.message) || [])[1] || msg.message;
      if (rule === 'no-undef' && name.includes('$TPL$')) { HANDLER_STATS.dynamic.add([u.file, line, name].join('|')); continue; }
      let text = msg.message;
      if (rule === 'no-redeclare' && /built-in global/.test(text)) {
        const n = (/^'([^']+)'/.exec(text) || [])[1];
        const other = page.keys.find(o => o !== k && declared.get(o).has(n));
        text = `'${n}' is also declared at the top of ${other ? units.get(other).file : 'another script'}`;
        if (!other) continue;   // a browser global (name, status, …): a top-level `var name` here is the site's own choice
      }
      const dk = [u.file, line, msg.column, rule, text, u.kind === 'handlers'].join('|');
      const f = findings.get(dk) || { file: u.file, line, rule, name, text, severity: msg.severity, kind: u.kind, pages: new Set() };
      f.pages.add(page.name);
      findings.set(dk, f);
    }
  });
}
/* The pages each unit is on, to say "only on these" for a finding that does not show on all of them. */
const unitPages = new Map();
for (const p of pages) for (const k of p.keys) { const f = units.get(k).file; if (!unitPages.has(f)) unitPages.set(f, new Set()); unitPages.get(f).add(p.name); }
const writes = implicitWrites;

/* ── Report ── */
const all = [...findings.values()].sort((a, b) => a.file.localeCompare(b.file) || a.line - b.line);
const tags = f => {
  const t = [];
  if (f.rule === 'no-undef') {
    const src = units.get(f.file)?.code ?? read(f.file);
    if (new RegExp(`typeof\\s*\\(?\\s*${f.name.replace(/\$/g, '\\$')}\\b`).test(src)) t.push('guarded');
    if (writes.has(f.name)) t.push('write');
  }
  if (f.kind === 'handlers') t.push('handler');
  const on = unitPages.get(f.file);
  if (on && f.pages.size < on.size) {
    const ps = [...f.pages];
    t.push('pages: ' + (ps.length > 2 && ps.every(p => p.startsWith('tabs/')) ? `tabs/*.html (${ps.length})` : ps.join(', ')));
  }
  return t;
};
const count = {};
for (const f of all) count[f.rule] = (count[f.rule] || 0) + 1;
const RULE_ORDER = ['no-undef', 'load-order', 'no-redeclare', 'no-dupe-keys', 'no-unreachable', 'no-unused-vars'];
const scripts = [...units.values()].filter(u => u.kind === 'script').length;
const inline = [...units.values()].filter(u => u.kind === 'inline').length;
console.log(`lint: ESLint ${ESLINT_VERSION} over ${scripts} scripts + ${inline} inline <script> blocks + ${HANDLER_STATS.found} inline handlers (${HANDLER_STATS.dynamic.size} dynamic names not checkable, ${HANDLER_STATS.skipped.length} handlers did not parse), on ${pages.length} pages (${lintRuns} lint runs)`);
const countLine = RULE_ORDER.map(r => `${r} ${count[r] || 0}`).join(' · ') + (parseErrors.length ? ` · PARSE ERRORS ${parseErrors.length}` : '');
console.log('  ' + countLine + '   (no-unused-vars is a warning; the rest are errors)');
for (const p of parseErrors) console.log(`  PARSE ERROR ${p.file}:${p.line} ${p.text}`);
let strictBad = parseErrors.length;
const ghEsc = x => String(x).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A').replace(/::/g, ': :');
const annotate = (file, line, title, text) => { if (flag('github')) console.log(`::warning file=${ghEsc(file)},line=${line},title=${ghEsc(title)}::${ghEsc(text)}`); };
if (flag('verbose')) for (const h of HANDLER_STATS.skipped) console.log(`  handler not parsed: ${h}`);
for (const rule of RULE_ORDER) {
  const list = all.filter(f => f.rule === rule);
  if (!list.length) continue;
  if (rule === 'no-unused-vars' && !flag('verbose')) { console.log(`no-unused-vars: ${list.length} (list them with --verbose)`); continue; }
  if (rule === 'no-undef') {
    /* One line per file + name + tags, so 50 uses of one helper on the Journey pages read as one line. The
       untagged ones (undefined on every page the script is on, no typeof guard) come first: those are the
       likely ReferenceErrors. */
    const groups = new Map();
    for (const f of list) {
      const t = tags(f), gk = [f.file, f.name, t.join('|')].join('#');
      if (!groups.has(gk)) groups.set(gk, { file: f.file, name: f.name, t, lines: [] });
      const g = groups.get(gk);
      if (!g.lines.includes(f.line)) g.lines.push(f.line);
      if (!t.includes('guarded')) strictBad++;
    }
    const gl = [...groups.values()];
    const plain = g => !g.t.some(x => x === 'guarded' || x.startsWith('pages:'));
    gl.sort((x, y) => (plain(y) - plain(x)) || x.file.localeCompare(y.file) || x.lines[0] - y.lines[0]);
    console.log(`no-undef (${list.length} uses in ${gl.length} groups; untagged first: undefined on every page its script is on, no typeof guard):`);
    for (const g of gl) {
      const where = `${g.file}:${g.lines.join(',')}`;
      console.log(`  ${where} ${g.name}${g.lines.length > 1 ? ' ×' + g.lines.length : ''}${g.t.length ? '  [' + g.t.join('] [') + ']' : ''}`);
      annotate(g.file, g.lines[0], 'no-undef', `${g.name} is not defined${g.lines.length > 1 ? ` (${g.lines.length} lines: ${g.lines.join(', ')})` : ''}${g.t.length ? ' [' + g.t.join('] [') + ']' : ''}`);
    }
    continue;
  }
  console.log(`${rule}:`);
  for (const f of list) {
    const t = tags(f);
    if (f.severity === 2) { strictBad++; annotate(f.file, f.line, rule, f.text + (t.length ? ' [' + t.join('] [') + ']' : '')); }
    console.log(`  ${f.file}:${f.line} ${f.text}${t.length ? '  [' + t.join('] [') + ']' : ''}`);
  }
}
if (flag('github')) console.log(`::notice title=lint (report-only)::${countLine}`);
if (flag('strict') && strictBad) { console.log(`lint: --strict: ${strictBad} error-level finding(s) left (no-undef [guarded] lines aside)`); process.exit(1); }
process.exit(0);
