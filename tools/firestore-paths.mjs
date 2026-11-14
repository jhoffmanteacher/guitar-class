/* firestore-paths.mjs — where the site's code reads and writes Firestore, read
   from the CODE (tools/js-scan.mjs), for checks.mjs 1dm (2026-11-13).

   For every member chain that names a Firestore place (db.collection(…),
   .doc(…), a variable holding such a reference, firebase.firestore()…), it
   works out the PATH, with string pieces folded ('prog' + 'ress', a constant,
   a template literal), and what the chain DOES with the reference:

     read     it ends in .get() / .onSnapshot() / .id / .path (no reference leaves)
     write    .set() / .update() / .delete() / .add() on it
     tracked  it is stored in a plain variable in the same function; every use
              of that variable is then a chain of its own and judged the same way
     escape   the reference itself goes anywhere else: an argument (a batch or
              transaction write takes its reference that way), a return value,
              an object, a member this file does not know. Where it goes next
              cannot be followed, so a check treats an escape like a write.

   A path piece it cannot read is never guessed: a collection name it cannot
   fold is '?', so "may be any collection"; a document id it cannot fold is '*'.

   It also lists every `.ref` taken from a document snapshot, traced to the
   query that produced the snapshot when that query is in the same function
   (`const s = await <chain>.get()`, `for (const d of s.docs)`,
   `s.docs.forEach(d => …)`), and the code shapes it cannot follow at all
   (a Firestore method named in brackets, eval, the modular SDK's bare calls,
   the REST endpoint, Firestore code written inside a string). */

import { tokenize, readChain, splitArgs, foldString, segments, matchClose, UNKNOWN } from './js-scan.mjs';

export const WRITE_METHODS = new Set(['set', 'update', 'delete', 'add']);
const READ_TERMINALS = new Set(['get', 'onSnapshot', 'id', 'path', 'isEqual']);
const BUILDERS = new Set(['where', 'orderBy', 'limit', 'limitToLast', 'startAt', 'startAfter', 'endAt', 'endBefore', 'withConverter']);
const PATH_LINKS = new Set(['collection', 'doc', 'collectionGroup']);
const GLOBAL_HANDLES = new Set(['db', 'fbDb']);
const SNAP_ITER = new Set(['forEach', 'map', 'filter', 'some', 'every', 'find', 'flatMap', 'reduce']);
const FIRESTORE_MEMBER_NAMES = new Set(['collection', 'doc', 'collectionGroup', 'ref', 'set', 'update', 'add', 'delete', 'batch', 'runTransaction', 'parent', 'firestore']);
const MODULAR = new Set(['setDoc', 'updateDoc', 'deleteDoc', 'addDoc', 'writeBatch', 'getFirestore']);

/* Top-level `const NAME = <string expression>` across the given sources: the
   constants a path may be built from. A name bound twice to different values
   is left out (unknown). */
export function collectConstants(sources) {
  const seen = new Map(), bad = new Set();
  for (const src of sources) {
    const toks = Array.isArray(src) ? src : tokenize(src);
    for (let k = 0; k + 3 < toks.length; k++) {
      if (toks[k].t === 'id' && toks[k].v === 'const' && toks[k + 1].t === 'id' && toks[k + 2].v === '=') {
        // the initializer, up to `;` / `,` at depth 0 or the end of the line
        let j = k + 3, d = 0;
        const init = [];
        for (; j < toks.length; j++) {
          const y = toks[j];
          if (d === 0 && y.t === 'punc' && (y.v === ';' || y.v === ',')) break;
          if (d === 0 && j > k + 3 && y.line > toks[j - 1].line && !(toks[j - 1].t === 'punc' && toks[j - 1].v === '+') && !(y.t === 'punc' && y.v === '+')) break;
          if (y.t === 'punc' && (y.v === '(' || y.v === '[' || y.v === '{')) d++;
          if (y.t === 'punc' && (y.v === ')' || y.v === ']' || y.v === '}')) d--;
          if (d < 0) break;
          init.push(y);
        }
        const f = foldString(init, null);
        const name = toks[k + 1].v;
        if (f && f.length === 1 && typeof f[0] === 'string') {
          if (seen.has(name) && seen.get(name) !== f[0]) bad.add(name);
          seen.set(name, f[0]);
        } else if (seen.has(name)) bad.add(name);
      }
    }
  }
  for (const b of bad) seen.delete(b);
  return seen;
}

/* Fold a path argument into segments. `atRoot` = the path starts at the
   database (so its first segment is a collection). */
function pathSegments(argToks, consts, collectionPosition) {
  if (!argToks || !argToks.length) return ['*'];
  const pieces = foldString(argToks, consts) || [UNKNOWN];
  let s = '';
  for (const p of pieces) s += p === UNKNOWN ? '\u0000' : p;
  const segs = s.split('/').filter((x, i, a) => !(x === '' && (i === 0 || i === a.length - 1)));
  return segs.map((x, i) => {
    if (!x.includes('\u0000')) return x;
    const isCollection = collectionPosition ? i % 2 === 0 : i % 2 === 1;
    return isCollection ? '?' : '*';
  });
}

export const pathString = p => p ? p.join('/') : '(none)';

/* Analyze one file. Returns {chains, refs, odd}. Each entry carries the
   function (segment) it is in and its line. */
export function analyzeFile(file, src, consts) {
  const toks = Array.isArray(src) ? src : tokenize(src);
  const out = { chains: [], refs: [], odd: [] };
  for (const seg of segments(toks)) analyzeSegment(file, toks.slice(seg.from, seg.to), seg.name, consts, out);
  return out;
}

function analyzeSegment(file, toks, fn, consts, out) {
  const vars = new Map();      // name → [path, …]  (references)
  const handles = new Set(GLOBAL_HANDLES);
  const snaps = new Map();     // name → [path, …]  (query / document snapshots and their docs)

  // Every chain start in this segment, templates' ${…} included, in order.
  const starts = [];
  const collect = (arr) => {
    for (let k = 0; k < arr.length; k++) {
      const x = arr[k];
      if (x.t === 'tpl') { x.exprs.forEach(collect); continue; }
      if (x.t !== 'id') continue;
      const prev = arr[k - 1];
      if (prev && prev.t === 'punc' && (prev.v === '.' || prev.v === '?.')) continue;
      starts.push({ arr, k });
    }
  };
  collect(toks);

  const lhsOf = (arr, k) => {
    // `NAME =` (plain assignment or a declaration) right before index k, skipping `await`
    let p = k - 1;
    if (arr[p] && arr[p].t === 'id' && arr[p].v === 'await') p--;
    if (!(arr[p] && arr[p].t === 'punc' && arr[p].v === '=')) return null;
    const nameTok = arr[p - 1];
    if (!nameTok || nameTok.t !== 'id') return null;
    const before = arr[p - 2];
    if (before && before.t === 'punc' && (before.v === '.' || before.v === '?.' || before.v === ']')) return null;
    return nameTok.v;
  };

  /* The Firestore path a chain names, or null when it names none.
     {paths: [[segment, …], …], tailFrom: index of the first link after the path}.
     A chain whose base is a variable holding a reference starts from that
     variable's path(s); one on the database handle starts at the root; a path
     link on anything else (a parameter, a call's result) starts at '?'. */
  const chainPath = (c) => {
    let paths = null, li = 0, handle = false, unknownBase = false, last = -1;
    if (!c.baseCall && vars.has(c.base)) paths = vars.get(c.base).map(p => p.slice());
    else if (!c.baseCall && handles.has(c.base)) handle = true;
    else if (c.base === 'firebase' && c.links[0] && c.links[0].name === 'firestore' && c.links[0].call) { handle = true; li = 1; }
    for (let i = li; i < c.links.length; i++) {
      const L = c.links[i];
      if (L.name && PATH_LINKS.has(L.name) && L.call) {
        const arg = splitArgs(L.call)[0];
        if (!paths) {
          const segs = pathSegments(arg, consts, true);
          if (handle && i === li && L.name !== 'collectionGroup') paths = [segs];
          else { paths = [['?', ...segs]]; unknownBase = true; }
        } else if (L.name === 'collectionGroup') {
          paths = [['?', ...pathSegments(arg, consts, true)]];
        } else {
          paths = paths.map(p => p.concat(pathSegments(arg, consts, p.length % 2 === 0)));
        }
        last = i;
        continue;
      }
      if (paths) break;            // the path part has ended
      if (handle) return null;     // db.batch(), db.runTransaction(…): not a reference
    }
    if (!paths) return null;
    paths.unknownBase = unknownBase;
    return { paths, tailFrom: last + 1 };
  };

  // Pass 1 (twice, so a variable built from another variable is known): handles, references, snapshots.
  for (let pass = 0; pass < 2; pass++) {
    for (const { arr, k } of starts) {
      const c = readChain(arr, k);
      const name = lhsOf(arr, k);
      if (!name) continue;
      if ((c.base === 'ensureDb' && c.baseCall && !c.links.length) ||
          (c.base === 'firebase' && c.links.length === 1 && c.links[0].name === 'firestore' && c.links[0].call) ||
          (handles.has(c.base) && !c.links.length && !c.baseCall) ||
          (c.links.length === 1 && c.links[0].name === 'db' && !c.links[0].call)) { handles.add(name); continue; }
      const cp = chainPath(c);
      if (!cp) continue;
      const tail = c.links.slice(cp.tailFrom);
      if (tail.length && tail[tail.length - 1].name === 'get' && tail[tail.length - 1].call) {
        const cur = snaps.get(name) || [];
        snaps.set(name, cur.concat(cp.paths));
      } else if (tail.every(L => L.name && BUILDERS.has(L.name))) {
        const cur = vars.get(name) || [];
        const add = cp.paths.filter(p => !cur.some(q => q.join('/') === p.join('/')));
        vars.set(name, cur.concat(add));
      }
    }
    // documents of a snapshot: for (const D of S.docs) and S.docs.forEach(D => …)
    for (const { arr, k } of starts) {
      const x = arr[k];
      if (x.v === 'for' && arr[k + 1] && arr[k + 1].v === '(') {
        const e = matchClose(arr, k + 1);
        const inner = arr.slice(k + 2, e);
        const ofAt = inner.findIndex(y => y.t === 'id' && y.v === 'of');
        if (ofAt > 0 && inner[ofAt - 1].t === 'id' && inner[ofAt + 1] && inner[ofAt + 1].t === 'id' && snaps.has(inner[ofAt + 1].v)) {
          snaps.set(inner[ofAt - 1].v, snaps.get(inner[ofAt + 1].v));
        }
        continue;
      }
      if (!snaps.has(x.v)) continue;
      const c = readChain(arr, k);
      for (const L of c.links) {
        if (L.name && SNAP_ITER.has(L.name) && L.call && L.call.length) {
          const a = L.call;
          let param = null;
          if (a[0].t === 'id' && a[1] && a[1].v === '=>') param = a[0].v;
          else if (a[0].v === '(' && a[1] && a[1].t === 'id') param = a[1].v;
          else if (a[0].v === 'function' && a[1] && a[1].v === '(' && a[2] && a[2].t === 'id') param = a[2].v;
          else if (a[0].v === 'async' && a[1] && a[1].t === 'id') param = a[1].v;
          if (param) snaps.set(param, snaps.get(x.v));
        }
      }
    }
  }

  // Pass 2: judge every chain.
  const consumed = new Map();   // token array → Set of link positions read as part of a chain
  for (const { arr, k } of starts) {
    const x = arr[k];
    const c = readChain(arr, k);
    if (!consumed.has(arr)) consumed.set(arr, new Set());
    c.links.forEach(L => consumed.get(arr).add(L.at));
    // the bad shapes first (they need no path)
    const called = arr[k + 1] && arr[k + 1].t === 'punc' && arr[k + 1].v === '(';
    if ((x.v === 'eval' || x.v === 'Function') && called) out.odd.push({ file, fn, line: x.line, what: `${x.v}(…) runs code this check cannot read` });
    if (MODULAR.has(x.v) && called) out.odd.push({ file, fn, line: x.line, what: `${x.v}(…) is the modular SDK's write, which this check cannot follow` });
    if (PATH_LINKS.has(x.v) && called) out.odd.push({ file, fn, line: x.line, what: `a bare ${x.v}(…) call (the modular SDK's shape), which this check cannot follow` });
    // a destructured `ref` ({ ref } = snap, ({ ref }) => …): a document reference under another name
    if (x.v === 'ref' && arr[k - 1] && arr[k - 1].t === 'punc' && (arr[k - 1].v === '{' || arr[k - 1].v === ',') && arr[k + 1] && arr[k + 1].t === 'punc' && /^[,}:=]$/.test(arr[k + 1].v))
      out.odd.push({ file, fn, line: x.line, what: 'a `ref` taken by destructuring, a document reference this check cannot trace' });
    for (const L of c.links) {
      if (L.index) {
        const f = foldString(L.index, consts);
        const v = f && f.length === 1 && typeof f[0] === 'string' ? f[0] : null;
        if (v !== null && FIRESTORE_MEMBER_NAMES.has(v)) out.odd.push({ file, fn, line: x.line, what: `a Firestore method named in brackets (["${v}"]) — the check reads only .${v}(…)` });
        if (v === null && (handles.has(c.base) || vars.has(c.base))) out.odd.push({ file, fn, line: x.line, what: `${c.base}[…] picks a member of a database reference by a value this check cannot read` });
      }
    }
    // `.ref` from a snapshot
    c.links.forEach((L, i) => {
      if (L.name !== 'ref' || L.call) return;
      const traced = snaps.has(c.base) ? snaps.get(c.base) : null;
      const after = c.links.slice(i + 1);
      out.refs.push({ file, fn, line: x.line, base: c.base, paths: traced, writes: after.some(A => A.name && WRITE_METHODS.has(A.name) && A.call) });
    });

    // skip the declaration / assignment target itself, and object keys
    const nx = arr[c.end];
    if (!c.links.length && !c.baseCall && nx && nx.t === 'punc' && nx.v === '=') continue;
    const prev = arr[k - 1];
    if (prev && prev.t === 'id' && (prev.v === 'const' || prev.v === 'let' || prev.v === 'var' || prev.v === 'function')) continue;
    if (!c.links.length && nx && nx.t === 'punc' && nx.v === ':' && prev && prev.t === 'punc' && (prev.v === '{' || prev.v === ',')) continue;

    const cp = chainPath(c);
    if (!cp) continue;
    const tail = c.links.slice(cp.tailFrom);
    let kind = null, detail = '';
    for (const L of tail) {
      if (L.name && WRITE_METHODS.has(L.name) && L.call) { kind = 'write'; detail = `.${L.name}(…)`; break; }
      if (L.name && READ_TERMINALS.has(L.name)) { kind = 'read'; break; }
      if (L.name && BUILDERS.has(L.name)) continue;
      kind = 'escape'; detail = L.name ? `.${L.name}` : '[…]'; break;
    }
    if (!kind) {
      const name = lhsOf(arr, k);
      if (name && (vars.has(name))) { kind = 'tracked'; detail = name; }
      else {
        kind = 'escape';
        const p = arr[k - 1], pp = p && p.t === 'id' && p.v === 'await' ? arr[k - 2] : p;
        detail = !pp ? 'used' : pp.t === 'id' && pp.v === 'return' ? 'returned' : pp.t === 'punc' && (pp.v === '(' || pp.v === ',') ? 'passed as an argument' : `used after "${pp.v}"`;
      }
    }
    for (const p of cp.paths) out.chains.push({ file, fn, line: x.line, base: c.base, path: p, kind, detail, unknownBase: !!cp.paths.unknownBase });
  }

  // A path link or .ref on something that is not an identifier chain: (db).collection(…), (await x()).doc(…), a[0].ref …
  const walkLinks = (arr) => {
    const seen = consumed.get(arr) || new Set();
    for (let k = 0; k + 1 < arr.length; k++) {
      const y = arr[k];
      if (y.t === 'tpl') { y.exprs.forEach(walkLinks); continue; }
      if (y.t !== 'punc' || (y.v !== '.' && y.v !== '?.') || seen.has(k)) continue;
      const nm = arr[k + 1];
      if (nm.t === 'id' && ((PATH_LINKS.has(nm.v) && arr[k + 2] && arr[k + 2].v === '(') || nm.v === 'ref'))
        out.odd.push({ file, fn, line: nm.line, what: `.${nm.v} on something that is not a plain name (a bracketed or computed receiver), which this check cannot follow` });
    }
  };
  walkLinks(toks);

  // Firestore code or the REST endpoint written inside a string or template literal.
  const strings = [];
  const walkStr = (arr) => { for (const y of arr) { if (y.t === 'str') strings.push([y.v, y.line]); else if (y.t === 'tpl') { y.quasis.forEach(q => strings.push([q, y.line])); y.exprs.forEach(walkStr); } } };
  walkStr(toks);
  for (const [s, line] of strings) {
    if (/firestore\.googleapis\.com/.test(s)) out.odd.push({ file, fn, line, what: 'a string names the Firestore REST endpoint, which this check cannot follow' });
    if (/\.\s*(collection|collectionGroup|doc)\s*\(|\bfirestore\s*\(\s*\)|\.runTransaction\s*\(|\.batch\s*\(\s*\)/.test(s)) out.odd.push({ file, fn, line, what: `Firestore code inside a string ("${s.trim().slice(0, 60)}") runs where this check cannot read it` });
  }
}

/* Names of functions called (or passed by name) in each segment, and names
   written as NAME( inside its strings (inline handlers). */
export function callGraph(file, src) {
  const toks = Array.isArray(src) ? src : tokenize(src);
  const graph = new Map();
  for (const seg of segments(toks)) {
    const calls = new Set(), strCalls = new Set();
    const walk = (arr) => {
      for (let k = 0; k < arr.length; k++) {
        const x = arr[k];
        if (x.t === 'tpl') { x.quasis.forEach(q => { for (const m of q.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) strCalls.add(m[1]); }); x.exprs.forEach(walk); continue; }
        if (x.t === 'str') { for (const m of x.v.matchAll(/\b([A-Za-z_$][\w$]*)\s*\(/g)) strCalls.add(m[1]); continue; }
        if (x.t !== 'id') continue;
        const prev = arr[k - 1];
        if (prev && prev.t === 'punc' && (prev.v === '.' || prev.v === '?.')) continue;
        if (prev && prev.t === 'id' && prev.v === 'function') continue;
        calls.add(x.v);
      }
    };
    walk(toks.slice(seg.from, seg.to));
    const cur = graph.get(seg.name) || { calls: new Set(), strCalls: new Set(), file };
    calls.forEach(c => cur.calls.add(c)); strCalls.forEach(c => cur.strCalls.add(c));
    graph.set(seg.name, cur);
  }
  return graph;
}
