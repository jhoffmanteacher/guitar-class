/* i18n-drift.mjs — "the English changed and its Spanish twin did not" (checks.mjs 1dp, 2026-11-13).

   Jonathan approved it on 2026-11-13 ("a warning when an English string changes and its Spanish twin doesn't").
   It is a WARNING, never a failure: some English edits need no Spanish change (a typo, a capital letter).

   ── What it compares ──
   The working tree (committed or not) against a BASE commit:
     GC_DRIFT_BASE=<ref>      that ref, when set (a CI run can pass the push's "before" commit);
     otherwise                git merge-base HEAD origin/main: on a branch, what the branch changed; before a push
                              from main, what the push will carry. A tree that IS origin/main (after a push, or on
                              GitHub's checkout, where origin/main is the commit under test) has nothing to
                              compare, and the check says so; GitHub's shallow checkout has no older commit.
   Only files that differ from the base are read, so a tree with no string changes costs two `git` calls.

   ── The pairs (every twin the site has) ──
     i18n.js            each I18N key's { en, es }, read from the object the browser builds (loadI18n, the
                        same loader 1e uses).
     data files         module-N.js, class-activities.js, config-main.js, run in a sandbox the way checks.mjs
                        validates them. Every object key named in the student field list 1w / 1w-t already use
                        (STUDENT_VALUE_NAME_RE in checks.mjs, passed in as `fields`; with its `_power` form) that
                        has a `<key>_es` twin beside it. Arrays (choices, items) pair item by item. A pair is
                        named by its path, sets and activities by id: SETS[id=m4w2].stations.b.sections[1].steps[3].text.
     tabs/*.html        each element carrying data-es="…" against its own English inner HTML. These have no
                        key, so a pair is matched by its Spanish: the same data-es in the old and new page with a
                        different English beside it.
   A pair that is new (no old twin), or that lost a language, is not this check's business (1b / 1d / 1e).

   ── What is NOT a change (decided on 30 past commits; see the report of 2026-11-13) ──
   The English counts as unchanged when only these differ: whitespace, letter case, HTML entities against the
   characters they stand for, straight against curly quotes, and the punctuation marks  . , ; : ! ? ' " ( ) - – — …
   (Spanish punctuation follows its own rules: ¿ ¡ «», and a dash or a full stop is not mirrored one for one.)
   Everything else counts: a word, a number, a chord or note name, a tag added or removed. And the Spanish counts
   as changed if ANY character of it changed: someone touched it, so they saw it.

   Zero dependencies, Node 18+. Exports driftReport(); checks.mjs prints it. */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', mdash: '—', ndash: '–', hellip: '…',
  ldquo: '"', rdquo: '"', lsquo: "'", rsquo: "'", laquo: '«', raquo: '»', middot: '·', rarr: '→', larr: '←', times: '×' };
export const decodeEntities = s => String(s)
  .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
  .replace(/&([a-z]+);/gi, (m, n) => (n.toLowerCase() in ENTITIES ? ENTITIES[n.toLowerCase()] : m));

/* The English "as a student reads it, ignoring what Spanish does not mirror". Two values equal under norm() are
   the same English. */
export function norm(s) {
  return decodeEntities(s)
    .replace(/[‘’‚′`]/g, "'").replace(/[“”„″]/g, '"')
    .toLowerCase()
    .replace(/[.,;:!?'"()\-–—…]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const git = (root, args) => {
  const r = spawnSync('git', ['-C', root, ...args], { encoding: 'utf8', maxBuffer: 1 << 28 });
  return r.status === 0 ? r.stdout : null;
};

/* Every <tag … data-es="…" …>English</tag> on a page: [{ es, en, line }]. The English is the element's inner HTML
   (what journey.js stashes before it swaps), found by counting nested tags of the same name. */
export function journeyPairs(html) {
  const out = [];
  const open = /<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)\sdata-es="([^"]*)"([^>]*)>/g;
  let m;
  while ((m = open.exec(html))) {
    const tag = m[1].toLowerCase(), start = m.index + m[0].length;
    const re = new RegExp(`<(/?)${tag}\\b[^>]*>`, 'gi');
    re.lastIndex = start;
    let depth = 1, end = -1, t;
    while ((t = re.exec(html))) {
      if (t[1]) { if (--depth === 0) { end = t.index; break; } }
      else if (!/\/>$/.test(t[0])) depth++;
    }
    if (end < 0) continue;
    out.push({ es: decodeEntities(m[3]), en: html.slice(start, end), line: html.slice(0, m.index).split('\n').length });
  }
  return out;
}

/* Every twin pair in a data object graph: Map(path → { en, es }). */
export function dataPairs(roots, fields) {
  const out = new Map(), seen = new Set();
  const isStr = v => typeof v === 'string';
  const rec = (o, path) => {
    if (!o || typeof o !== 'object' || seen.has(o)) return;
    seen.add(o);
    if (Array.isArray(o)) { o.forEach((x, i) => rec(x, `${path}[${x && typeof x === 'object' && isStr(x.id) ? 'id=' + x.id : i}]`)); return; }
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (!k.endsWith('_es') && fields.has(k.replace(/_power$/, '')) && (k + '_es') in o) {
        const es = o[k + '_es'];
        if (isStr(v) && isStr(es)) out.set(`${path}.${k}`, { en: v, es });
        else if (Array.isArray(v) && Array.isArray(es) && v.length === es.length)
          v.forEach((x, i) => { if (isStr(x) && isStr(es[i])) out.set(`${path}.${k}[${i}]`, { en: x, es: es[i] }); });
      }
      if (v && typeof v === 'object') rec(v, `${path}.${k}`);
    }
  };
  for (const [name, val] of Object.entries(roots)) rec(val, name);
  return out;
}

/* Run a data file (with config-main.js first for a module) and return the objects it fills. */
function runData(file, src, configSrc) {
  const sb = { console: { log() {}, warn() {}, error() {}, info() {} } };
  sb.window = sb; sb.globalThis = sb; sb.self = sb;
  vm.createContext(sb);
  const names = /^module-\d+\.js$/.test(file) ? ['SETS', 'MODULE_REVIEWS', 'MODULE_SONGS']
    : file === 'config-main.js' ? ['MODULE_MANIFEST', 'WARMUP_BANK', 'MODULE_REVIEWS'] : null;
  if (names) vm.runInContext(configSrc, sb, { filename: 'config-main.js' });
  if (file !== 'config-main.js') vm.runInContext(src, sb, { filename: file });
  if (!names) {   // class-activities.js: whatever it put on window
    const roots = {};
    for (const k of Object.keys(sb)) if (!['console', 'window', 'globalThis', 'self'].includes(k)) roots[k] = sb[k];
    return roots;
  }
  const roots = {};
  for (const n of names) { try { const v = vm.runInContext(`typeof ${n} === 'undefined' ? undefined : ${n}`, sb); if (v !== undefined) roots[n] = v; } catch { /* absent */ } }
  return roots;
}

const DATA_RE = /^(module-\d+\.js|class-activities\.js|config-main\.js)$/;
const JOURNEY_RE = /^tabs\/[^/]+\.html$/;

/* The comparison itself, on two versions of one file. Returns { pairs, hits: [{ key, enOld, enNew, es }] }. */
export function compareFile(file, oldSrc, newSrc, { fields, loadI18n, oldConfig, newConfig, rawOnly = false }) {
  const hits = [];
  let pairs = 0;
  // rawOnly: any English byte counts (used to measure the rule on past commits, never by the check).
  const changed = rawOnly ? (a, b) => a !== b : (a, b) => a !== b && norm(a) !== norm(b);
  if (file === 'i18n.js') {
    const A = loadI18n(oldSrc), B = loadI18n(newSrc);
    for (const k of Object.keys(B)) {
      const a = A[k], b = B[k];
      if (!a || !b || typeof a.en !== 'string' || typeof b.en !== 'string' || typeof a.es !== 'string' || typeof b.es !== 'string') continue;
      pairs++;
      if (a.es === b.es && changed(a.en, b.en)) hits.push({ key: k, enOld: a.en, enNew: b.en, es: b.es });
    }
  } else if (DATA_RE.test(file)) {
    const A = dataPairs(runData(file, oldSrc, oldConfig), fields), B = dataPairs(runData(file, newSrc, newConfig), fields);
    for (const [k, b] of B) {
      const a = A.get(k);
      if (!a) continue;
      pairs++;
      if (a.es === b.es && changed(a.en, b.en)) hits.push({ key: k, enOld: a.en, enNew: b.en, es: b.es });
    }
  } else if (JOURNEY_RE.test(file)) {
    const A = journeyPairs(oldSrc), B = journeyPairs(newSrc);
    const oldByEs = new Map();
    for (const p of A) { if (!oldByEs.has(p.es)) oldByEs.set(p.es, []); oldByEs.get(p.es).push(p.en); }
    const newByEs = new Map();
    for (const p of B) { if (!newByEs.has(p.es)) newByEs.set(p.es, []); newByEs.get(p.es).push(p.en); }
    for (const p of B) {
      const olds = oldByEs.get(p.es);
      if (!olds) continue;   // the Spanish changed too (or the element is new)
      pairs++;
      const news = newByEs.get(p.es);
      if (olds.some(e => !changed(e, p.en))) continue;   // this English was already there with this Spanish
      // The English it replaced: an old English beside this Spanish that is no longer beside it.
      const gone = olds.find(e => !news.some(n => !changed(e, n)));
      if (gone !== undefined) hits.push({ key: `line ${p.line}`, enOld: gone, enNew: p.en, es: p.es });
    }
  }
  return { pairs, hits };
}

/* The whole check. Returns { base, baseHow, files, pairs, hits: [{ file, key, enOld, enNew, es }], skipped? }. */
export function driftReport(root, { fields, loadI18n, env = process.env } = {}) {
  let base = null, baseHow = '';
  if (env.GC_DRIFT_BASE) {
    base = (git(root, ['rev-parse', '--verify', '-q', env.GC_DRIFT_BASE + '^{commit}']) || '').trim() || null;
    baseHow = `GC_DRIFT_BASE=${env.GC_DRIFT_BASE}`;
    if (!base) return { skipped: `GC_DRIFT_BASE=${env.GC_DRIFT_BASE} is not a commit here` };
  } else {
    // One git call in the usual case: merge-base fails (null) when the ref is missing or this is no git checkout.
    for (const ref of ['origin/main', 'origin/HEAD']) {
      base = (git(root, ['merge-base', 'HEAD', ref]) || '').trim() || null;
      if (base) { baseHow = `where this branch left ${ref}`; break; }
    }
    if (!base) return { skipped: 'no origin/main to compare with here (not a git checkout, or no such ref), and no GC_DRIFT_BASE' };
  }
  // Only the files that can hold twins are asked about, so git never walks audio/ or img/.
  const names = (git(root, ['diff', '--name-only', '--no-renames', base, '--', 'i18n.js', 'module-*.js', 'class-activities.js', 'config-main.js', 'tabs/*.html']) || '')
    .split('\n').filter(Boolean).filter(f => f === 'i18n.js' || DATA_RE.test(f) || JOURNEY_RE.test(f));
  const show = f => git(root, ['show', `${base}:${f}`]);
  const needConfig = names.some(f => /^(module-\d+|config-main)\.js$/.test(f));
  const oldConfig = needConfig ? (show('config-main.js') ?? '') : '', newConfig = needConfig && existsSync(join(root, 'config-main.js')) ? readFileSync(join(root, 'config-main.js'), 'utf8') : '';
  const hits = [], errors = [];
  let pairs = 0, files = 0;
  for (const f of names) {
    const p = join(root, f);
    if (!existsSync(p)) continue;   // deleted
    const oldSrc = show(f);
    if (oldSrc == null) continue;   // new file: every pair is new
    files++;
    try {
      const r = compareFile(f, oldSrc, readFileSync(p, 'utf8'), { fields, loadI18n, oldConfig, newConfig });
      pairs += r.pairs;
      for (const h of r.hits) hits.push({ file: f, ...h });
    } catch (e) { errors.push(`${f}: ${String(e && e.message).split('\n')[0]}`); }
  }
  return { base, baseHow, files, pairs, hits, errors };
}
