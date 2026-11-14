/* js-scan.mjs — a small JavaScript tokenizer and member-chain reader for the
   checks that must read CODE, not text (tools/never-blocks.mjs, 2026-11-13).

   Why not a regular expression: a grep for "collection('progress')" walks past
   'prog' + 'ress', a constant, a template literal or a comment that happens to
   hold the words. This reads the code the way the browser does at the level the
   checks need: comments are dropped, strings and template literals become their
   VALUES, regular-expression literals are skipped whole, and every
   identifier.member(…)[…] chain is read as one piece.

   Zero dependencies, Node 18+. It is not a full parser: it does not build
   statements. What it gives:

     tokenize(src)            [{t, v, line, quasis?, exprs?}]
                              t: 'id' | 'str' | 'tpl' | 'num' | 'punc' | 're'
                              'str'  v = the string's value (escapes decoded)
                              'tpl'  quasis = the cooked text pieces,
                                     exprs  = one token array per ${…}
     matchClose(toks, i)      index of the bracket that closes toks[i]
     readChain(toks, i)       the member/call chain that STARTS at toks[i]
                              (an identifier not after a dot):
                              {start, end, base, links:[{name, call?, index?}]}
     foldString(toks, consts) the value of a string expression made of
                              literals, + and constants: an array of pieces,
                              each a string or UNKNOWN; null if it is not a
                              string expression at all
     segments(toks)           the top-level pieces of a file: each function
                              declaration (or const NAME = …) with its token
                              range, and '(top level)' for the rest
*/

export const UNKNOWN = Symbol('unknown');

const KEYWORD_BEFORE_REGEX = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await']);
const PUNCT4 = new Set(['>>>=']);
const PUNCT3 = new Set(['...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=']);
const PUNCT2 = new Set(['=>', '==', '!=', '<=', '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '**']);
const isIdStart = c => (c >= 65 && c <= 90) || (c >= 97 && c <= 122) || c === 95 || c === 36 || c >= 0xc0;
const isIdPart = c => isIdStart(c) || (c >= 48 && c <= 57);
const isDigit = c => c >= 48 && c <= 57;

function decodeEscapes(s) {
  return s.replace(/\\(u\{([0-9a-fA-F]+)\}|u([0-9a-fA-F]{4})|x([0-9a-fA-F]{2})|\r\n|[\s\S])/g, (m, e, cp, u4, x2) => {
    if (cp) return String.fromCodePoint(parseInt(cp, 16));
    if (u4) return String.fromCharCode(parseInt(u4, 16));
    if (x2) return String.fromCharCode(parseInt(x2, 16));
    switch (e) {
      case 'n': return '\n'; case 't': return '\t'; case 'r': return '\r'; case 'b': return '\b';
      case 'f': return '\f'; case 'v': return '\v'; case '0': return '\0';
      case '\n': case '\r\n': case ' ': case ' ': return '';
      default: return e;
    }
  });
}

/* Tokenize src. `pos` lets the template reader tokenize a ${…} in place; it
   returns {toks, end} when `stopAtBrace` is set. */
function lex(src, pos, stopAtBrace, lineRef) {
  const toks = [];
  let i = pos, depth = 0;
  const n = src.length;
  const prevSig = () => toks.length ? toks[toks.length - 1] : null;
  const regexAllowed = () => {
    const p = prevSig();
    if (!p) return true;
    if (p.t === 'num' || p.t === 'str' || p.t === 'tpl' || p.t === 're') return false;
    if (p.t === 'id') return KEYWORD_BEFORE_REGEX.has(p.v);
    return !(p.v === ')' || p.v === ']' || p.v === '}');
  };
  while (i < n) {
    const cc = src.charCodeAt(i);
    if (cc === 10) { lineRef.line++; i++; continue; }
    if (cc === 32 || cc === 9 || cc === 13 || cc === 12 || cc === 11 || cc === 0xa0 || cc === 0xfeff || cc === 0x2028 || cc === 0x2029) { i++; continue; }
    if (cc === 47 && src.charCodeAt(i + 1) === 47) { const e = src.indexOf('\n', i); i = e < 0 ? n : e; continue; }
    if (cc === 47 && src.charCodeAt(i + 1) === 42) {
      const e = src.indexOf('*/', i + 2);
      const stop = e < 0 ? n : e + 2;
      for (let k = src.indexOf('\n', i); k >= 0 && k < stop; k = src.indexOf('\n', k + 1)) lineRef.line++;
      i = stop; continue;
    }
    const c = src[i];
    const line = lineRef.line;
    if (c === '"' || c === "'") {
      let j = i + 1, esc = false;
      while (j < n) {
        const d = src.charCodeAt(j);
        if (d === 92) { esc = true; if (src[j + 1] === '\n') lineRef.line++; j += 2; continue; }   // backslash
        if (d === 10 || src[j] === c) break;   // the close, or unterminated at the line end
        j++;
      }
      const raw = src.slice(i + 1, j);
      toks.push({ t: 'str', v: esc ? decodeEscapes(raw) : raw, line });
      i = j + 1; continue;
    }
    if (c === '`') {
      const quasis = [], exprs = [];
      let j = i + 1, from = j, esc = false;
      const piece = () => { const raw = src.slice(from, j); quasis.push(esc ? decodeEscapes(raw) : raw); esc = false; };
      while (j < n) {
        const d = src.charCodeAt(j);
        if (d === 96) break;                          // `
        if (d === 92) { esc = true; if (src[j + 1] === '\n') lineRef.line++; j += 2; continue; }
        if (d === 36 && src[j + 1] === '{') {         // ${
          piece();
          const sub = lex(src, j + 2, true, lineRef);
          exprs.push(sub.toks);
          j = sub.end + 1; from = j; continue;
        }
        if (d === 10) lineRef.line++;
        j++;
      }
      piece();
      toks.push({ t: 'tpl', quasis, exprs, line });
      i = j + 1; continue;
    }
    if (isIdStart(cc)) {
      let j = i + 1;
      while (j < n && isIdPart(src.charCodeAt(j))) j++;
      toks.push({ t: 'id', v: src.slice(i, j), line });
      i = j; continue;
    }
    if (isDigit(cc) || (c === '.' && isDigit(src.charCodeAt(i + 1)))) {
      let j = i + 1;
      while (j < n && (isIdPart(src.charCodeAt(j)) || src[j] === '.')) j++;
      toks.push({ t: 'num', v: src.slice(i, j), line });
      i = j; continue;
    }
    if (c === '/' && regexAllowed()) {
      let j = i + 1, inClass = false;
      while (j < n) {
        const d = src[j];
        if (d === '\\') { j += 2; continue; }
        if (d === '\n') break;
        if (inClass) { if (d === ']') inClass = false; }
        else if (d === '[') inClass = true;
        else if (d === '/') break;
        j++;
      }
      j++;
      while (j < n && isIdPart(src.charCodeAt(j))) j++;
      toks.push({ t: 're', v: src.slice(i, j), line });
      i = j; continue;
    }
    if (stopAtBrace) {
      if (c === '{') depth++;
      if (c === '}') { if (depth === 0) return { toks, end: i }; depth--; }
    }
    let p = c;
    const c1 = src.charCodeAt(i + 1);
    if (c1 === 61 || c1 === 62 || c1 === 38 || c1 === 124 || c1 === 63 || c1 === 46 || c1 === 43 || c1 === 45 || c1 === 42 || c1 === 60) {   // = > & | ? . + - * <
      p = PUNCT4.has(src.substr(i, 4)) ? src.substr(i, 4) : PUNCT3.has(src.substr(i, 3)) ? src.substr(i, 3) : PUNCT2.has(src.substr(i, 2)) ? src.substr(i, 2) : c;
    }
    if (p === '?.' && isDigit(src.charCodeAt(i + 2))) p = '?';   // a ? .5 : b
    toks.push({ t: 'punc', v: p, line });
    i += p.length;
  }
  return stopAtBrace ? { toks, end: n } : toks;
}

export function tokenize(src) {
  return lex(String(src), 0, false, { line: 1 });
}

const OPEN = { '(': ')', '[': ']', '{': '}' };
export function matchClose(toks, i) {
  const open = toks[i].v, close = OPEN[open];
  let depth = 0;
  for (let k = i; k < toks.length; k++) {
    const x = toks[k];
    if (x.t !== 'punc') continue;
    if (x.v === open) depth++;
    else if (x.v === close) { depth--; if (depth === 0) return k; }
  }
  return toks.length - 1;
}

/* The chain that starts at toks[i] (an identifier). Links: `.name`, `.name(…)`,
   `?.name`, `[…]`, and a direct call `(…)` on the base. */
export function readChain(toks, i) {
  const base = toks[i].v;
  const links = [];
  let k = i + 1;
  let baseCall = null;
  if (toks[k] && toks[k].t === 'punc' && toks[k].v === '(') {
    const e = matchClose(toks, k);
    baseCall = toks.slice(k + 1, e);
    k = e + 1;
  }
  for (;;) {
    const x = toks[k];
    if (!x || x.t !== 'punc') break;
    if ((x.v === '.' || x.v === '?.') && toks[k + 1] && toks[k + 1].t === 'id') {
      const link = { name: toks[k + 1].v, at: k };
      k += 2;
      if (toks[k] && toks[k].t === 'punc' && toks[k].v === '(') {
        const e = matchClose(toks, k);
        link.call = toks.slice(k + 1, e);
        k = e + 1;
      }
      links.push(link);
      continue;
    }
    if (x.v === '?.' && toks[k + 1] && toks[k + 1].t === 'punc' && (toks[k + 1].v === '[' || toks[k + 1].v === '(')) { k++; continue; }
    if (x.v === '[') {
      const e = matchClose(toks, k);
      links.push({ name: null, index: toks.slice(k + 1, e), at: k });
      k = e + 1;
      continue;
    }
    if (x.v === '(' && links.length) {
      const e = matchClose(toks, k);
      links[links.length - 1].call = toks.slice(k + 1, e);   // a call on a computed member: x[y](…)
      k = e + 1;
      continue;
    }
    break;
  }
  return { start: i, end: k, base, baseCall, links };
}

/* Split a call's argument tokens at top-level commas. */
export function splitArgs(toks) {
  const out = [];
  let cur = [], depth = 0;
  for (const x of toks) {
    if (x.t === 'punc' && (x.v === '(' || x.v === '[' || x.v === '{')) depth++;
    if (x.t === 'punc' && (x.v === ')' || x.v === ']' || x.v === '}')) depth--;
    if (depth === 0 && x.t === 'punc' && x.v === ',') { out.push(cur); cur = []; continue; }
    cur.push(x);
  }
  if (cur.length) out.push(cur);
  return out;
}

/* Fold a string expression: literals, template literals, `+`, parentheses and
   identifiers found in `consts` (name → string). Returns an array of pieces
   (string | UNKNOWN), or null when the tokens are clearly not a string
   expression. Anything it cannot read becomes UNKNOWN, never a guess. */
export function foldString(toks, consts) {
  if (!toks || !toks.length) return null;
  const out = [];
  let expectOperand = true, sawString = false;
  for (let k = 0; k < toks.length; k++) {
    const x = toks[k];
    if (expectOperand) {
      if (x.t === 'str') { out.push(x.v); sawString = true; }
      else if (x.t === 'tpl') {
        sawString = true;
        x.quasis.forEach((q, qi) => {
          out.push(q);
          if (qi < x.exprs.length) {
            const inner = foldString(x.exprs[qi], consts);
            if (inner) out.push(...inner); else out.push(UNKNOWN);
          }
        });
      } else if (x.t === 'id' && consts && consts.has(x.v) && !(toks[k + 1] && toks[k + 1].t === 'punc' && /^(\.|\?\.|\(|\[)$/.test(toks[k + 1].v))) {
        out.push(consts.get(x.v)); sawString = true;
      } else if (x.t === 'punc' && x.v === '(') {
        const e = matchClose(toks, k);
        const inner = foldString(toks.slice(k + 1, e), consts);
        out.push(...(inner || [UNKNOWN]));
        k = e;
      } else {
        // An operand this cannot read (a variable, a call, a member): skip the
        // whole operand up to the next top-level `+`.
        let depth = 0, j = k;
        for (; j < toks.length; j++) {
          const y = toks[j];
          if (y.t === 'punc' && (y.v === '(' || y.v === '[' || y.v === '{')) depth++;
          if (y.t === 'punc' && (y.v === ')' || y.v === ']' || y.v === '}')) depth--;
          if (depth === 0 && y.t === 'punc' && y.v === '+') break;
        }
        out.push(UNKNOWN);
        k = j - 1;
      }
      expectOperand = false;
    } else {
      if (x.t === 'punc' && x.v === '+') { expectOperand = true; continue; }
      // Not a plain concatenation (a ternary, a method call on the result…): unreadable.
      return sawString ? [UNKNOWN] : null;
    }
  }
  // Merge adjacent strings.
  const merged = [];
  for (const p of out) {
    if (typeof p === 'string' && typeof merged[merged.length - 1] === 'string') merged[merged.length - 1] += p;
    else merged.push(p);
  }
  return merged;
}

/* The top-level pieces of a file, by brace depth: `function NAME(…){…}`,
   `async function NAME`, `const|let|var NAME = …` up to the end of its
   statement, and everything else as '(top level)'. Each piece: {name, from, to}
   (token indexes, `to` exclusive). */
export function segments(toks) {
  const segs = [];
  let depth = 0, k = 0;
  let topFrom = 0;
  const pushTop = (to) => { if (to > topFrom) segs.push({ name: '(top level)', from: topFrom, to }); };
  while (k < toks.length) {
    const x = toks[k];
    if (depth === 0 && x.t === 'id' && (x.v === 'function' || (x.v === 'async' && toks[k + 1] && toks[k + 1].v === 'function'))) {
      const fk = x.v === 'async' ? k + 1 : k;
      let nk = fk + 1;
      if (toks[nk] && toks[nk].t === 'punc' && toks[nk].v === '*') nk++;
      if (toks[nk] && toks[nk].t === 'id') {
        // find the body's `{` after the parameter list
        let p = nk + 1;
        if (toks[p] && toks[p].v === '(') p = matchClose(toks, p) + 1;
        if (toks[p] && toks[p].v === '{') {
          const e = matchClose(toks, p);
          pushTop(k);
          segs.push({ name: toks[nk].v, from: k, to: e + 1 });
          k = e + 1; topFrom = k;
          continue;
        }
      }
    }
    if (depth === 0 && x.t === 'id' && (x.v === 'const' || x.v === 'let' || x.v === 'var') && toks[k + 1] && toks[k + 1].t === 'id' && toks[k + 2] && toks[k + 2].v === '=') {
      // to the end of the statement: the next `;` at depth 0, or a newline-terminated
      // statement whose next token starts a new top-level declaration
      let j = k + 3, d = 0;
      for (; j < toks.length; j++) {
        const y = toks[j];
        if (y.t === 'punc' && (y.v === '(' || y.v === '[' || y.v === '{')) d++;
        else if (y.t === 'punc' && (y.v === ')' || y.v === ']' || y.v === '}')) d--;
        else if (d === 0 && y.t === 'punc' && y.v === ';') break;
        if (d === 0 && j > k + 3 && y.line > toks[j - 1].line && y.t === 'id' && /^(const|let|var|function|async|if|for|while|try|document|window)$/.test(y.v) && !(toks[j - 1].t === 'punc' && /^[-+*/%&|^!?:=,.(\[{<>]$|^(=>|&&|\|\||\?\?|\?\.)$/.test(toks[j - 1].v))) { j--; break; }
      }
      pushTop(k);
      segs.push({ name: toks[k + 1].v, from: k, to: j + 1 });
      k = j + 1; topFrom = k;
      continue;
    }
    if (x.t === 'punc') {
      if (x.v === '{' || x.v === '(' || x.v === '[') depth++;
      else if (x.v === '}' || x.v === ')' || x.v === ']') depth--;
    }
    k++;
  }
  pushTop(toks.length);
  return segs;
}

/* Every token, templates' ${…} tokens included, in source order, each with the
   array it lives in: for walks that must also see code inside template literals. */
export function* allTokenArrays(toks) {
  yield toks;
  for (const x of toks) if (x.t === 'tpl') for (const e of x.exprs) yield* allTokenArrays(e);
}
