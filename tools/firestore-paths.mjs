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
   the REST endpoint, a string handed to setTimeout).

   Two things cross files (analyzeFile's `ctx`):
     handles    every name the site assigns the database to (db, fbDb, lqDb …,
                from `NAME = firebase.firestore()`, `= await ensureDb()`, `= db`):
                collectHandles() finds them in all the scripts at once
     factories  a function that returns a reference (`function lqDoc(){ return
                lqDb.collection('liveQuiz').doc('current'); }`): a chain that starts
                with a call to it starts at that path

   Inline handlers (onclick="…" in a page, or in a string a script builds) are
   code too: handlerSources() pulls them out so they are read like a script. */

import { createHash } from 'node:crypto';
import { tokenize, readChain, splitArgs, foldString, segments, matchClose, UNKNOWN } from './js-scan.mjs';

export const WRITE_METHODS = new Set(['set', 'update', 'delete', 'add']);
const READ_TERMINALS = new Set(['get', 'onSnapshot', 'id', 'path', 'isEqual']);
const BUILDERS = new Set(['where', 'orderBy', 'limit', 'limitToLast', 'startAt', 'startAfter', 'endAt', 'endBefore', 'withConverter']);
const PATH_LINKS = new Set(['collection', 'doc', 'collectionGroup']);
const GLOBAL_HANDLES = new Set(['db', 'fbDb']);
const SNAP_ITER = new Set(['forEach', 'map', 'filter', 'some', 'every', 'find', 'flatMap', 'reduce']);
const FIRESTORE_MEMBER_NAMES = new Set(['collection', 'doc', 'collectionGroup', 'ref', 'set', 'update', 'add', 'delete', 'batch', 'runTransaction', 'parent', 'firestore']);
const MODULAR = new Set(['setDoc', 'updateDoc', 'deleteDoc', 'addDoc', 'writeBatch', 'getFirestore']);

/* Every name the database is assigned to, across all the scripts (a fixpoint:
   `const a = db; const b = a;`). */
export function collectHandles(tokenArrays) {
  const handles = new Set(GLOBAL_HANDLES);
  const isHandleInit = (toks, j) => {
    let k = j;
    if (toks[k] && toks[k].t === 'id' && toks[k].v === 'await') k++;
    const x = toks[k], n1 = toks[k + 1], n2 = toks[k + 2], n3 = toks[k + 3];
    if (!x || x.t !== 'id') return false;
    if (x.v === 'firebase' && n1 && n1.v === '.' && n2 && n2.v === 'firestore' && n3 && n3.v === '(') return true;
    if (x.v === 'ensureDb' && n1 && n1.v === '(') return true;
    if (handles.has(x.v) && !(n1 && n1.t === 'punc' && /^(\.|\?\.|\(|\[)$/.test(n1.v))) return true;
    return false;
  };
  for (let grew = true; grew;) {
    grew = false;
    for (const toks of tokenArrays) for (let k = 1; k + 1 < toks.length; k++) {
      if (toks[k].t !== 'punc' || toks[k].v !== '=' || toks[k - 1].t !== 'id' || handles.has(toks[k - 1].v)) continue;
      const before = toks[k - 2];
      if (before && before.t === 'punc' && (before.v === '.' || before.v === '?.')) continue;
      if (isHandleInit(toks, k + 1)) { handles.add(toks[k - 1].v); grew = true; }
    }
  }
  return handles;
}

/* Inline handler code: the value of every on<event>="…" / on<event>='…' in an
   HTML page's text, or in a script's string and template literals (a ${…} becomes
   the name __tpl__). Returns [{ code, line }]. */
export function handlerSources(text, line0 = 1) {
  const out = [];
  const re = /(?:^|[\s"'`<])on[a-z]{3,}\s*=\s*(["'])/g;
  let m;
  while ((m = re.exec(text))) {
    const q = m[1];
    const end = text.indexOf(q, re.lastIndex);
    if (end < 0) break;
    const val = text.slice(re.lastIndex, end).replace(/&quot;/g, '"').replace(/&#0*39;|&#x0*27;|&apos;/gi, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    let line = line0;
    for (let i = text.indexOf('\n'); i >= 0 && i < m.index; i = text.indexOf('\n', i + 1)) line++;
    if (/[A-Za-z_$]/.test(val)) out.push({ code: val, line });
    re.lastIndex = end + 1;
  }
  return out;
}
/* The handler code inside a script's string and template literals. */
export function scriptHandlerSources(toks) {
  const out = [];
  const walk = (arr) => {
    for (const x of arr) {
      if (x.t === 'str' && /\bon[a-z]{3,}\s*=/.test(x.v)) out.push(...handlerSources(x.v, x.line));
      else if (x.t === 'tpl') {
        const joined = x.quasis.join('__tpl__');
        if (/\bon[a-z]{3,}\s*=/.test(joined)) out.push(...handlerSources(joined, x.line));
        x.exprs.forEach(walk);
      }
    }
  };
  walk(toks);
  return out;
}

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
export function analyzeFile(file, src, consts, ctx = {}) {
  const toks = Array.isArray(src) ? src : tokenize(src);
  const out = { chains: [], refs: [], odd: [] };
  for (const seg of segments(toks)) {
    const body = toks.slice(seg.from, seg.to);
    if (ctx.segmentMayReach && !ctx.segmentMayReach(body)) continue;   // nothing in it can name Firestore
    analyzeSegment(file, body, seg.name, consts, out, ctx);
  }
  return out;
}

/* Functions that return a reference: fn name → paths (from a first analysis). */
export function collectFactories(chains) {
  const f = new Map();
  for (const c of chains) if (c.kind === 'escape' && c.detail === 'returned' && c.fn !== '(top level)' && !c.unknownBase) {
    if (!f.has(c.fn)) f.set(c.fn, []);
    f.get(c.fn).push(c.path);
  }
  return f;
}

function analyzeSegment(file, toks, fn, consts, out, ctx) {
  const vars = new Map();      // name → [path, …]  (references)
  const handles = new Set(ctx.handles || GLOBAL_HANDLES);
  const factories = ctx.factories || new Map();
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
  /* A member named in brackets from constant pieces (db['coll' + 'ection']) is that member. */
  const linkName = L => { if (L.name) return L.name; if (!L.index) return null; const f = foldString(L.index, consts); return f && f.length === 1 && typeof f[0] === 'string' ? f[0] : null; };
  const chainPath = (c) => {
    let paths = null, li = 0, handle = false, unknownBase = false, last = -1;
    if (!c.baseCall && vars.has(c.base)) paths = vars.get(c.base).map(p => p.slice());
    else if (c.baseCall && !c.baseCall.length && factories.has(c.base)) paths = factories.get(c.base).map(p => p.slice());
    else if (!c.baseCall && handles.has(c.base)) handle = true;
    else if (c.base === 'firebase' && c.links[0] && c.links[0].name === 'firestore' && c.links[0].call) { handle = true; li = 1; }
    for (let i = li; i < c.links.length; i++) {
      const L = c.links[i], nm = linkName(L);
      if (nm && PATH_LINKS.has(nm) && L.call) {
        const arg = splitArgs(L.call)[0];
        if (!paths) {
          const segs = pathSegments(arg, consts, true);
          if (handle && i === li && nm !== 'collectionGroup') paths = [segs];
          else { paths = [['?', ...segs]]; unknownBase = true; }
        } else if (nm === 'collectionGroup') {
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
    const prevTok = arr[k - 1];
    const isDef = called && ((prevTok && prevTok.t === 'id' && prevTok.v === 'function') ||
      (prevTok && prevTok.t === 'punc' && /^[{},;]$/.test(prevTok.v) && arr[matchClose(arr, k + 1) + 1] && arr[matchClose(arr, k + 1) + 1].v === '{'));
    if ((x.v === 'eval' || x.v === 'Function') && called) out.odd.push({ file, fn, line: x.line, what: `${x.v}(…) runs code`, todo: 'run no code from a string in the console' });
    if ((x.v === 'setTimeout' || x.v === 'setInterval') && called && arr[k + 2] && (arr[k + 2].t === 'str' || arr[k + 2].t === 'tpl')) out.odd.push({ file, fn, line: x.line, what: `${x.v}() with a string runs that string as code`, todo: `pass ${x.v} a function, not a string` });
    if (MODULAR.has(x.v) && called && !isDef) out.odd.push({ file, fn, line: x.line, what: `${x.v}(…) is the modular SDK's write`, todo: "use the page's compat SDK: db.collection('<name>')…" });
    if (PATH_LINKS.has(x.v) && called && !isDef) out.odd.push({ file, fn, line: x.line, what: `a bare ${x.v}(…) call (the modular SDK's shape)`, todo: "write db.collection('<name>')… instead" });
    // a destructured `ref` ({ ref } = snap, ({ ref }) => …, for (const { ref } of …)): a reference under another name.
    // An object literal that merely has a `ref` key ({ ref: el }) is not one.
    if (x.v === 'ref' && prevTok && prevTok.t === 'punc' && (prevTok.v === '{' || prevTok.v === ',') && arr[k + 1] && arr[k + 1].t === 'punc' && /^[,}:=]$/.test(arr[k + 1].v) && isPattern(arr, k))
      out.odd.push({ file, fn, line: x.line, what: 'a `ref` taken by destructuring', todo: "use d.ref on a snapshot from a db.collection('<name>') query in the same function" });
    for (const L of c.links) {
      if (L.index) {
        const f = foldString(L.index, consts);
        const v = f && f.length === 1 && typeof f[0] === 'string' ? f[0] : null;
        if (v !== null && FIRESTORE_MEMBER_NAMES.has(v) && (handles.has(c.base) || vars.has(c.base) || snaps.has(c.base) || c.links.some(L2 => L2.name && (PATH_LINKS.has(L2.name) || L2.name === 'ref'))))
          out.odd.push({ file, fn, line: x.line, what: `a Firestore method named in brackets (["${v}"])`, todo: `write .${v}(…)` });
        if (v === null && (handles.has(c.base) || vars.has(c.base))) out.odd.push({ file, fn, line: x.line, what: `${c.base}[…] picks a member of a database reference by a value`, todo: 'name the method: .collection(…), .doc(…), .get()' });
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
      const nm = linkName(L);
      if (nm && WRITE_METHODS.has(nm) && L.call) { kind = 'write'; detail = `.${nm}(…)`; break; }
      if (nm && READ_TERMINALS.has(nm)) { kind = 'read'; break; }
      if (nm && BUILDERS.has(nm)) continue;
      kind = 'escape'; detail = nm ? `.${nm}` : '[…]'; break;
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
    const sig = statementSig(arr, k, c.end);
    for (const p of cp.paths) out.chains.push({ file, fn, line: x.line, base: c.base, path: p, kind, detail, unknownBase: !!cp.paths.unknownBase, sig });
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
        out.odd.push({ file, fn, line: nm.line, what: `.${nm.v} on something that is not a plain name (a bracketed or computed receiver)`, todo: 'put the database or the snapshot in a plain variable first' });
    }
  };
  walkLinks(toks);

  // The REST endpoint (a fetch() to it writes with no SDK call to read). Other string contents are text,
  // except inline handlers, which handlerSources() hands back to be read as code.
  const walkStr = (arr) => { for (const y of arr) { if (y.t === 'str' && /firestore\.googleapis\.com/.test(y.v)) out.odd.push({ file, fn, line: y.line, what: 'a string names the Firestore REST endpoint', todo: 'use the SDK (db.collection(…))' }); else if (y.t === 'tpl') { if (y.quasis.some(q => /firestore\.googleapis\.com/.test(q))) out.odd.push({ file, fn, line: y.line, what: 'a string names the Firestore REST endpoint', todo: 'use the SDK (db.collection(…))' }); y.exprs.forEach(walkStr); } } };
  walkStr(toks);
}

/* A fingerprint of the statement a chain sits in (from the `;`, `{` or `}` before
   it to the one after it, at the same depth): the target, the payload and the
   options all count, so dropping `merge` or changing the doc is a new fingerprint. */
const tokSig = t => t.t === 'tpl' ? `tpl(${t.quasis.map(q => JSON.stringify(q)).join(',')};${t.exprs.map(e => e.map(tokSig).join(' ')).join(';')})` : `${t.t}:${t.v}`;
export const tokenSignature = toks => toks.map(tokSig).join(' ');
export function statementSig(arr, from, to) {
  let a = from, d = 0, crossed = 0;
  for (let j = from - 1; j >= 0; j--) {
    const y = arr[j];
    if (y.t === 'punc' && (y.v === ')' || y.v === ']' || y.v === '}')) { if (d === 0 && y.v === '}') break; d++; }
    else if (y.t === 'punc' && (y.v === '(' || y.v === '[' || y.v === '{')) { if (d === 0) { if (y.v === '{') break; crossed++; } else d--; }
    else if (d === 0 && y.t === 'punc' && y.v === ';') break;
    a = j;
  }
  let b = to; d = 0;
  for (let j = to; j < arr.length; j++) {
    const y = arr[j];
    if (y.t === 'punc' && (y.v === '(' || y.v === '[' || y.v === '{')) d++;
    else if (y.t === 'punc' && (y.v === ')' || y.v === ']' || y.v === '}')) { if (d === 0) { if (crossed > 0 && y.v !== '}') crossed--; else break; } else d--; }
    else if (d === 0 && crossed === 0 && y.t === 'punc' && y.v === ';') break;
    b = j + 1;
  }
  return createHash('sha256').update(tokenSignature(arr.slice(a, b))).digest('hex').slice(0, 12);
}

/* Is the `{` that encloses toks[k] a destructuring pattern? `const {…} =`, `{…} = x`,
   `({…}) =>`, `function f({…})`, `for (const {…} of …)`. */
function isPattern(toks, k) {
  let d = 0, open = -1;
  for (let j = k - 1; j >= 0; j--) {
    const y = toks[j];
    if (y.t !== 'punc') continue;
    if (y.v === '}' || y.v === ')' || y.v === ']') d++;
    else if (y.v === '{' || y.v === '(' || y.v === '[') { if (d === 0) { if (y.v === '{') { open = j; break; } return false; } d--; }
  }
  if (open < 0) return false;
  const close = matchClose(toks, open), after = toks[close + 1], before = toks[open - 1];
  if (before && before.t === 'id' && /^(const|let|var)$/.test(before.v)) return true;
  if (after && after.t === 'punc' && after.v === '=') return true;
  if (before && before.t === 'punc' && (before.v === '(' || before.v === ',')) {
    // a parameter: find the `)` that closes the list, then `=>` or a function body
    let dd = 0;
    for (let j = close + 1; j < toks.length; j++) {
      const y = toks[j];
      if (y.t === 'punc' && (y.v === '(' || y.v === '[' || y.v === '{')) dd++;
      else if (y.t === 'punc' && (y.v === ')' || y.v === ']' || y.v === '}')) { if (dd === 0) { const z = toks[j + 1]; return !!(z && z.t === 'punc' && (z.v === '=>' || z.v === '{')); } dd--; }
    }
  }
  return false;
}

/* The names a segment declares for itself (const / let / var, inner functions,
   parameters, catch bindings): a call to one of them is to the local, not to a
   global function of the same name. */
export function localNames(toks) {
  const names = new Set();
  const addParams = (from, to) => { for (let j = from; j < to; j++) { const y = toks[j]; if (y.t === 'id' && !(toks[j - 1] && toks[j - 1].t === 'punc' && (toks[j - 1].v === '.' || toks[j - 1].v === '=' || toks[j - 1].v === ':'))) names.add(y.v); } };
  for (let k = 0; k < toks.length; k++) {
    const x = toks[k];
    if (x.t === 'id' && /^(const|let|var)$/.test(x.v)) {
      const n = toks[k + 1];
      if (n && n.t === 'id') names.add(n.v);
      else if (n && n.t === 'punc' && (n.v === '{' || n.v === '[')) addParams(k + 2, matchClose(toks, k + 1));
      // later declarators on the same statement: , NAME =
      let d = 0;
      for (let j = k + 2; j < toks.length; j++) {
        const y = toks[j];
        if (y.t === 'punc' && (y.v === '(' || y.v === '[' || y.v === '{')) d++;
        else if (y.t === 'punc' && (y.v === ')' || y.v === ']' || y.v === '}')) { if (d === 0) break; d--; }
        else if (d === 0 && y.t === 'punc' && y.v === ';') break;
        else if (d === 0 && y.t === 'punc' && y.v === ',' && toks[j + 1] && toks[j + 1].t === 'id' && toks[j + 2] && toks[j + 2].v === '=') names.add(toks[j + 1].v);
      }
    }
    if (x.t === 'id' && x.v === 'function') {
      let j = k + 1;
      if (toks[j] && toks[j].t === 'id') { names.add(toks[j].v); j++; }
      if (toks[j] && toks[j].v === '(') addParams(j + 1, matchClose(toks, j));
    }
    if (x.t === 'id' && x.v === 'catch' && toks[k + 1] && toks[k + 1].v === '(' && toks[k + 2] && toks[k + 2].t === 'id') names.add(toks[k + 2].v);
    if (x.t === 'punc' && x.v === '=>') {
      const p = toks[k - 1];
      if (p && p.t === 'id') names.add(p.v);
      else if (p && p.t === 'punc' && p.v === ')') {
        let d = 0, j = k - 1;
        for (; j >= 0; j--) { const y = toks[j]; if (y.t === 'punc' && (y.v === ')' || y.v === ']' || y.v === '}')) d++; else if (y.t === 'punc' && (y.v === '(' || y.v === '[' || y.v === '{')) { d--; if (d === 0) break; } }
        addParams(j + 1, k - 1);
      }
    }
  }
  return names;
}

/* The real calls in a token list: NAME( and window. / globalThis. / self. / this.NAME(,
   never a definition (function NAME(, a method NAME(…){ in an object or class) and
   never a name the segment declares itself. Returns [{ name, line }]. */
export function realCalls(toks, locals = new Set()) {
  const out = [];
  const walk = (arr) => {
    for (let k = 0; k < arr.length; k++) {
      const x = arr[k];
      if (x.t === 'tpl') { x.exprs.forEach(walk); continue; }
      if (x.t !== 'id' || !arr[k + 1] || arr[k + 1].t !== 'punc' || arr[k + 1].v !== '(') continue;
      const p = arr[k - 1];
      if (p && p.t === 'id' && (p.v === 'function' || p.v === 'new' || p.v === 'get' || p.v === 'set' || p.v === 'async' && arr[k - 2] && arr[k - 2].t === 'punc' && (arr[k - 2].v === '{' || arr[k - 2].v === ','))) continue;
      if (p && p.t === 'punc' && (p.v === '.' || p.v === '?.')) {
        const o = arr[k - 2];
        if (!(o && o.t === 'id' && /^(window|globalThis|self|this)$/.test(o.v) && !(arr[k - 3] && arr[k - 3].t === 'punc' && (arr[k - 3].v === '.' || arr[k - 3].v === '?.')))) continue;
      } else if (locals.has(x.v)) continue;
      const close = matchClose(arr, k + 1), after = arr[close + 1];
      if (after && after.t === 'punc' && after.v === '{' && p && p.t === 'punc' && (p.v === '{' || p.v === ',' || p.v === '}' || p.v === ';')) continue;   // a method definition
      out.push({ name: x.v, line: x.line });
    }
  };
  walk(toks);
  return out;
}

/* The call edges of each segment: real calls (realCalls: NAME( and window.NAME(,
   not a local of the same name, not a definition) and functions handed on by
   name as an argument. */
export function callGraph(file, src) {
  const toks = Array.isArray(src) ? src : tokenize(src);
  const graph = new Map();
  for (const seg of segments(toks)) {
    const body = toks.slice(seg.from, seg.to);
    const locals = localNames(body);
    locals.delete(seg.name);
    const cur = graph.get(seg.name) || { calls: new Set(), file };
    for (const c of realCalls(body, locals)) cur.calls.add(c.name);
    // a function handed on by name (setTimeout(flushSave, 0), addEventListener('x', save)) is an edge too
    const walk = (arr) => arr.forEach((x, k) => {
      if (x.t === 'tpl') { x.exprs.forEach(walk); return; }
      if (x.t !== 'id' || locals.has(x.v)) return;
      const p = arr[k - 1], n = arr[k + 1];
      if (p && p.t === 'punc' && (p.v === '(' || p.v === ',') && n && n.t === 'punc' && (n.v === ')' || n.v === ',')) cur.calls.add(x.v);
    });
    walk(body);
    graph.set(seg.name, cur);
  }
  return graph;
}
