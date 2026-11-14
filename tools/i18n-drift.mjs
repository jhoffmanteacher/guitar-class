/* i18n-drift.mjs — "the English changed and its Spanish twin did not" (checks.mjs 1dp, 2026-11-13; review round 1
   the same day: R1-1 to R1-10).

   Jonathan approved it on 2026-11-13 ("a warning when an English string changes and its Spanish twin doesn't").
   It is a WARNING, never a failure: some English edits need no Spanish change (a typo, a capital letter). The one
   failure is the floor checks.mjs pins on how many twins it reads (below).

   ── What it compares ──
   The working tree (committed or not) against a BASE commit:
     GC_DRIFT_BASE=<ref>      that ref, when set (a CI run can pass the push's "before" commit);
     otherwise                git merge-base HEAD origin/main: on a branch, what the branch changed; before a push
                              from main, what the push will carry.
   A tree that IS its base (after a push, or GitHub's shallow checkout, where origin/main is the commit under test)
   and a missing or wrong base are said on an info line with no tick: nothing was compared (R1-8).
   The old side is read only for the files that differ from the base; the new side is read whole every run (about
   0.3 s), to count every twin for the floor.

   ── The pairs ──
     i18n.js            each I18N key's { en, es }, read from the object the browser builds (loadI18n, the
                        same loader 1e uses). A key renamed with its English changed (old key gone, a new key
                        with the same Spanish) is compared with the old key.
     data files         module-N.js, class-activities.js, config-main.js, run in a sandbox the way checks.mjs
                        validates them. EVERY key X that has an X_es key beside it (no field list: 34 field names
                        today, recordingLabel and the _power forms among them). An array (choices, items) pairs
                        whole: a choice added, removed or reordered in English only is a change. A pair is named by
                        its path, sets and activities by id; when a step was inserted, removed or moved, the same
                        field with the same Spanish is found again in its new place.
     tabs/*.html        each element carrying data-es="…" against its own English inner HTML, grouped by their
                        Spanish (57 of 460 lines share one); within a group the English is compared as a multiset.
   NOT covered (said so the reader knows): the data-es strings written inside tabs/journey.js, and the few
   `lang === 'es' ? … : …` strings in app/*.js. A pair that is new (no old twin), or that lost a language, is not
   this check's business (1b / 1d / 1e).

   ── What is NOT a change ──
   The English counts as unchanged when only these differ: whitespace, letter case, HTML entities against the
   characters they stand for, straight against curly quotes, and the punctuation marks  . , ; : ! ? ' " ( ) - – — …
   (decided on the 2026-11-13 mining: every one of the 3 such past changes needed no Spanish). The Spanish counts as
   changed if ANY character of it changed: someone touched it, so they saw it.
   A change prints in FULL, or as one compact line, by driftWeight() below (review R1-2; R2-1 order swaps and R2-5
   short meaning flips print in full too).

   Zero dependencies, Node 18+. Exports driftReport(); checks.mjs prints it. */
import { spawnSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
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

/* Every twin pair in a data object graph: Map(path → { en, es, shape }). A twin is ANY key X with an X_es key beside
   it (review R1-7/R1-10, 2026-11-13: no field list to fall out of date; recordingLabel, caption_power and the rest
   all count). A string pairs with a string; an array of strings with an array of strings, whole (a choice added,
   removed or reordered in English only is a change; the lengths need not match). `shape` is the path with every
   array position replaced by *, so an inserted, removed or swapped step can be matched again (R1-1). */
export function dataPairs(roots) {
  const out = new Map(), seen = new Set();
  const isStr = v => typeof v === 'string';
  const strs = v => Array.isArray(v) && v.every(isStr);
  const rec = (o, path) => {
    if (!o || typeof o !== 'object' || seen.has(o)) return;
    seen.add(o);
    if (Array.isArray(o)) { o.forEach((x, i) => rec(x, `${path}[${x && typeof x === 'object' && isStr(x.id) ? 'id=' + x.id : i}]`)); return; }
    for (const k of Object.keys(o)) {
      const v = o[k];
      if (!k.endsWith('_es') && (k + '_es') in o) {
        const es = o[k + '_es'], p = `${path}.${k}`;
        if ((isStr(v) && isStr(es)) || (strs(v) && strs(es))) out.set(p, { en: v, es, shape: p.replace(/\[\d+\]/g, '[*]') });
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
const asText = v => Array.isArray(v) ? v.join(' | ') : String(v);
const key = v => Array.isArray(v) ? JSON.stringify(v) : v;

/* ── How much a change says (review R1-2, 2026-11-13) ──
   Most English-only edits are plain-English rewording the Spanish already had ("stays put" → "stays in place").
   A warning is printed IN FULL only when a FACT token changed (a number, or a chord / note name like Em, G/B, F#m7)
   or 3 or more content words were added or removed (tags stripped, stop words dropped, simple endings folded);
   every other change is ONE compact line. The rule and both thresholds are the reviewer's, FITTED on the mined
   history (161 past English-only changes, 152 of them past norm(); 17 judged real misses): 28 full warnings instead
   of 152, 16 of the 17 real ones in full, the 17th ("swung feel" → "timing") as a compact line. */
const plainText = s => decodeEntities(String(s).replace(/<[^>]*>/g, ' ')).replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
const STOP = new Set('a an the of to in on at for and or but with from by as is are was be been it its this that these those you your yours we our i me my he she they them their then than so if not no do does did will would can could should have has had just only still again also very more most each every all any some one once there here up down out off over into about after before while when what which who how why now too'.split(' '));
const contentWords = s => plainText(s).toLowerCase().replace(/[^a-z0-9#'\/ ]+/g, ' ').split(/\s+/).filter(w => w && !STOP.has(w)).map(w => w.replace(/'s$/, '').replace(/(ing|ed|es|s)$/, ''));
const facts = s => {
  const p = plainText(s), out = [];
  for (const m of p.matchAll(/\d+(?:\/\d+)?/g)) out.push(m[0]);
  for (const m of p.matchAll(/(?<![A-Za-z#])([A-G](?:#|b|♯|♭)?(?:m|maj|min|dim|sus|add)?\d{0,2}(?:\/[A-G][#b]?)?)(?![A-Za-z'’])/g))
    if (m[1] !== 'A' || /(?:^|[\s(,–—-])A(?=[\s,.;:)–—-]|$)/.test(p.slice(Math.max(0, m.index - 1), m.index + 2)) && !/^A [a-z]/.test(p.slice(m.index, m.index + 3))) out.push(m[1]);
  return out.join(' ');   // in reading order: "G, then C" → "C, then G" is a change (review R2-1)
};
const bagDiff = (a, b) => { const A = new Map(), B = new Map(); for (const w of a) A.set(w, (A.get(w) || 0) + 1); for (const w of b) B.set(w, (B.get(w) || 0) + 1);
  const gone = [], added = []; for (const [w, n] of A) for (let i = (B.get(w) || 0); i < n; i++) gone.push(w); for (const [w, n] of B) for (let i = (A.get(w) || 0); i < n; i++) added.push(w); return [gone, added]; };
/* R2-5 (the reviewer's narrow list; on the mined history it adds no full warning beyond R2-1's). */
const NEGATIONS = new Set("not no never don't doesn't can't cannot without".split(' '));
const FLIPS = new Set("not no never don't doesn't can't cannot without with before after up down left right first last high low higher lower open barre major minor once twice one two three four five six seven eight half whole index middle ring pinky thumb faster slower always hard lightly mute strum thickest thinnest can".split(' '));
export function driftWeight(enOld, enNew) {
  const a = asText(enOld), b = asText(enNew);
  const fact = facts(a) !== facts(b);
  const [gone, added] = bagDiff(contentWords(a), contentWords(b));
  // What to show on a compact line: the plain words that went and came (no stemming, stop words kept).
  const show = s => plainText(s).replace(/[^\p{L}\p{N}#'\/ ]+/gu, ' ').split(/\s+/).filter(Boolean);
  const [wGone, wAdded] = bagDiff(show(a).map(w => w.toLowerCase()), show(b).map(w => w.toLowerCase()));
  // R2-1: a change that moved words without adding or removing any (an order swap) prints in full: norm() already
  // said the English differs, and the word bags cannot show what moved.
  const reordered = !gone.length && !added.length && !wGone.length && !wAdded.length && norm(a) !== norm(b);
  // R2-5: a short meaning flip — only words from a small list of opposites changed, some went and some came
  // ("before" → "after", "up" → "down", "major" → "minor"), or only a negation word went or came ("don't").
  const all = [...wGone, ...wAdded];
  const flip = all.length > 0 && (all.every(w => NEGATIONS.has(w)) || (wGone.length > 0 && wAdded.length > 0 && all.length <= 4 && all.every(w => FLIPS.has(w))));
  return { full: fact || reordered || flip || Math.max(gone.length, added.length) >= 3, fact, reordered, flip, gone: gone.length, added: added.length, wGone, wAdded };
}

/* The comparison itself, on two versions of one file. Returns { pairs, hits: [{ key, enOld, enNew, es }] }.
   `newPairs` (optional) is the new side already read. */
export function compareFile(file, oldSrc, newSrc, { loadI18n, oldConfig, newConfig, rawOnly = false, newPairs = null }) {
  const hits = [];
  let pairs = 0;
  // rawOnly: any English byte counts (used to measure the rule on past commits, never by the check).
  const changedS = rawOnly ? (a, b) => a !== b : (a, b) => a !== b && norm(a) !== norm(b);
  const changed = (a, b) => (Array.isArray(a) || Array.isArray(b))
    ? !(Array.isArray(a) && Array.isArray(b) && a.length === b.length && a.every((x, i) => !changedS(x, b[i])))
    : changedS(a, b);
  if (file === 'i18n.js') {
    const A = loadI18n(oldSrc), B = loadI18n(newSrc);
    const ok = e => e && typeof e.en === 'string' && typeof e.es === 'string';
    // A key renamed (old key gone, new key with the same Spanish): compare with the old key's English (R1-7).
    const goneByEs = new Map();
    for (const k of Object.keys(A)) if (ok(A[k]) && !(k in B)) { if (!goneByEs.has(A[k].es)) goneByEs.set(A[k].es, []); goneByEs.get(A[k].es).push(k); }
    for (const k of Object.keys(B)) {
      const b = B[k];
      if (!ok(b)) continue;
      let a = A[k], name = k;
      if (!ok(a)) {
        const olds = goneByEs.get(b.es);
        if (!olds) continue;   // a new key
        if (olds.some(o => !changed(A[o].en, b.en))) continue;   // renamed, same English
        a = A[olds[0]]; name = `${olds[0]} → ${k} (key renamed)`;
      }
      pairs++;
      if (a.es === b.es && changed(a.en, b.en)) hits.push({ key: name, enOld: a.en, enNew: b.en, es: b.es });
    }
  } else if (DATA_RE.test(file)) {
    const A = dataPairs(runData(file, oldSrc, oldConfig)), B = newPairs || dataPairs(runData(file, newSrc, newConfig));
    const group = M => { const g = new Map(); for (const p of M.values()) { const id = p.shape + '\u0000' + key(p.es); if (!g.has(id)) g.set(id, []); g.get(id).push(p); } return g; };
    const gA = group(A), gB = group(B);
    for (const [k, b] of B) {
      let a = A.get(k);
      if (!a || key(a.es) !== key(b.es)) {
        /* The same path no longer holds the same Spanish: a step was inserted, removed or moved above it. Look for an
           old pair of the same field and shape with the same Spanish (R1-1, as the Journey pages are matched). */
        const id = b.shape + '\u0000' + key(b.es), olds = gA.get(id);
        if (!olds) continue;   // new, or the Spanish changed too
        if (olds.some(o => !changed(o.en, b.en))) { pairs++; continue; }   // it only moved
        const news = gB.get(id) || [];
        // The English it replaced: one that is beside this Spanish fewer times now than before (R2-3: two identical
        // sections, one changed, still leave one copy of the old English, so "gone entirely" missed it).
        const cnt = (L, en) => L.filter(p => !changed(p.en, en)).length;
        a = olds.find(o => cnt(olds, o.en) > cnt(news, o.en));
        if (!a) continue;
      }
      pairs++;
      if (changed(a.en, b.en)) hits.push({ key: k, enOld: a.en, enNew: b.en, es: b.es });
    }
  } else if (JOURNEY_RE.test(file)) {
    /* No keys: elements are grouped by their Spanish. Within a group the English is compared as a multiset (R1-6):
       an English that is new to the group, while another English of the group lost a copy, is a change — so changing
       1 of 5 lines that share one Spanish is caught, and an element added or moved is not. */
    const A = journeyPairs(oldSrc), B = journeyPairs(newSrc);
    const byEs = L => { const g = new Map(); for (const p of L) { if (!g.has(p.es)) g.set(p.es, []); g.get(p.es).push(p); } return g; };
    const gA = byEs(A), gB = byEs(B);
    for (const [es, news] of gB) {
      const olds = gA.get(es);
      if (!olds) continue;
      pairs += news.length;
      const count = (L, en) => L.filter(p => !changed(p.en, en)).length;
      const lost = olds.filter(o => count(olds, o.en) > count(news, o.en));
      if (!lost.length) continue;
      const used = new Set();
      for (const p of news) {
        if (count(news, p.en) <= count(olds, p.en)) continue;   // this English was there before as often
        const o = lost.find(x => !used.has(x.en)) || lost[0];
        used.add(o.en);
        hits.push({ key: `line ${p.line}`, enOld: o.en, enNew: p.en, es });
        if (used.size >= lost.length) break;
      }
    }
  }
  return { pairs, hits };
}

/* Every twin on the current tree, counted (R1-10: the floor checks.mjs pins, so the guard cannot shrink unseen).
   Returns { data: Map(file → Map), journey: n, i18n: n, fields: Set }. */
function readTree(root, loadI18n) {
  const out = { data: new Map(), journey: 0, i18n: 0, fields: new Set(), pairs: 0 };
  const cfgPath = join(root, 'config-main.js'), cfg = existsSync(cfgPath) ? readFileSync(cfgPath, 'utf8') : '';
  const files = [...readdirSync(root).filter(f => /^module-\d+\.js$/.test(f)), 'class-activities.js', 'config-main.js'].filter(f => existsSync(join(root, f)));
  for (const f of files) {
    const m = dataPairs(runData(f, readFileSync(join(root, f), 'utf8'), cfg));
    out.data.set(f, m);
    out.pairs += m.size;
    for (const k of m.keys()) out.fields.add(k.slice(k.lastIndexOf('.') + 1));
  }
  const tabs = join(root, 'tabs');
  if (existsSync(tabs)) for (const f of readdirSync(tabs).filter(x => x.endsWith('.html'))) out.journey += journeyPairs(readFileSync(join(tabs, f), 'utf8')).length;
  if (existsSync(join(root, 'i18n.js'))) { const t = loadI18n(readFileSync(join(root, 'i18n.js'), 'utf8')); out.i18n = Object.values(t).filter(e => e && typeof e.en === 'string' && typeof e.es === 'string').length; }
  out.pairs += out.journey + out.i18n;
  return out;
}

/* The whole check. Returns { totals, base, baseHow, files, pairs, hits: [{ file, key, enOld, enNew, es, weight }],
   errors, nothing? } — `nothing` (a reason) when there is no base or nothing to compare. */
export function driftReport(root, { loadI18n, env = process.env } = {}) {
  const tree = readTree(root, loadI18n);
  const totals = { pairs: tree.pairs, fields: tree.fields.size, i18n: tree.i18n, journey: tree.journey };
  let base = null, baseHow = '';
  if (env.GC_DRIFT_BASE) {
    base = (git(root, ['rev-parse', '--verify', '-q', env.GC_DRIFT_BASE + '^{commit}']) || '').trim() || null;
    baseHow = `GC_DRIFT_BASE=${env.GC_DRIFT_BASE}`;
    if (!base) return { totals, nothing: `could not compare: GC_DRIFT_BASE=${env.GC_DRIFT_BASE} is not a commit here` };
  } else {
    // One git call in the usual case: merge-base fails (null) when the ref is missing or this is no git checkout.
    for (const ref of ['origin/main', 'origin/HEAD']) {
      base = (git(root, ['merge-base', 'HEAD', ref]) || '').trim() || null;
      if (base) { baseHow = `where this branch left ${ref}`; break; }
    }
    if (!base) return { totals, nothing: 'could not compare: no origin/main here (not a git checkout, or no such ref), and no GC_DRIFT_BASE' };
  }
  // Only the files that can hold twins are asked about, so git never walks audio/ or img/.
  const names = (git(root, ['diff', '--name-only', '--no-renames', base, '--', 'i18n.js', 'module-*.js', 'class-activities.js', 'config-main.js', 'tabs/*.html']) || '')
    .split('\n').filter(Boolean).filter(f => f === 'i18n.js' || DATA_RE.test(f) || JOURNEY_RE.test(f));
  if (!names.length) {
    const head = (git(root, ['rev-parse', 'HEAD']) || '').trim();
    return { totals, base, baseHow, nothing: head === base ? `this tree IS ${base.slice(0, 7)} (${baseHow}): nothing to compare` : `no file with twins differs from ${base.slice(0, 7)} (${baseHow})` };
  }
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
      const r = compareFile(f, oldSrc, readFileSync(p, 'utf8'), { loadI18n, oldConfig, newConfig, newPairs: tree.data.get(f) || null });
      pairs += r.pairs;
      for (const h of r.hits) hits.push({ file: f, ...h, weight: driftWeight(h.enOld, h.enNew) });
    } catch (e) { errors.push(`${f}: ${String(e && e.message).split('\n')[0]}`); }
  }
  return { totals, base, baseHow, files, pairs, hits, errors };
}
