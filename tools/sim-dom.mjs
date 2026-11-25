/* sim-dom.mjs — a small DOM for Node tools that run the site's REAL renderers and players in a vm (2026-11-25).

   Copied whole from tools/two-consoles-loop.mjs, section 1 ("A small DOM"), on 2026-11-25 for
   tools/built-song-loop.mjs; two-consoles-loop keeps its own copy (it was not changed). A later tool that needs a
   DOM imports this file instead of copying again.

   innerHTML is parsed into a real tree, so querySelector, querySelectorAll, closest, matches, dataset, classList,
   isConnected and textContent answer what a browser would. No layout and no events are dispatched.
   Two changes from the copy, both for a card player that draws:
     - getContext() gives a 2D stand-in that takes every drawing call and draws nothing (the copy gave null);
     - an element's box: el._box = { w, h } (default 0 x 0) is what clientWidth, offsetWidth and
       getBoundingClientRect answer, so code that returns early on a 0-wide box can be let through.
   Selectors: comma lists, descendant / child / sibling combinators, tag, #id, .class, [attr], [attr=v] (and ^= $= *=
   ~= |=), :not(...), :checked, :first-child, :last-child, :focus, :scope. Anything else is recorded in
   document.selectorProblems (a tool should fail on a non-empty list) rather than silently matching nothing.

     import { MDocument } from './sim-dom.mjs';
     const doc = new MDocument();  doc.body.innerHTML = '<div class="pc" data-id="x">…</div>'; */
const VOID_TAGS = new Set('area base br col embed hr img input link meta source track wbr'.split(' '));
const RAW_TAGS = new Set(['script', 'style', 'textarea', 'title']);
const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', middot: '·', mdash: '—', ndash: '–', hellip: '…',
  rarr: '→', larr: '←', uarr: '↑', darr: '↓', times: '×', copy: '©', bull: '•', check: '✓', laquo: '«', raquo: '»',
  rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', deg: '°', minus: '−', le: '≤', ge: '≥', sharp: '♯', flat: '♭', thinsp: ' ', ensp: ' ', emsp: ' ' };
const decodeEnt = s => s.indexOf('&') < 0 ? s : s.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g, (m, e) =>
  e[0] === '#' ? String.fromCodePoint((e[1] === 'x' || e[1] === 'X') ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10)) : (ENT[e] !== undefined ? ENT[e] : m));
const escText = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escAttrV = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');
const kebab = k => k.replace(/[A-Z]/g, c => '-' + c.toLowerCase());
const camel = k => k.replace(/-([a-z])/g, (m, c) => c.toUpperCase());

/* The 2D stand-in getContext() gives: every drawing call is taken and does nothing. */
const CTX2D = new Proxy(function(){}, { get: (o, k) => (k === 'width' || k === 'height' ? 10 : k === Symbol.toPrimitive ? () => 0 : CTX2D), apply: () => CTX2D, set: () => true });   // measureText(...).width reads 10

class MNode {
  constructor(doc) { this.ownerDocument = doc; this.parentNode = null; this.childNodes = []; }
  get parentElement() { return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null; }
  get firstChild() { return this.childNodes[0] || null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] || null; }
  get nextSibling() { const p = this.parentNode; return p ? p.childNodes[p.childNodes.indexOf(this) + 1] || null : null; }
  get previousSibling() { const p = this.parentNode; return p ? p.childNodes[p.childNodes.indexOf(this) - 1] || null : null; }
  get isConnected() { let n = this; while (n) { if (n.nodeType === 9) return true; n = n.parentNode; } return false; }
  remove() { if (this.parentNode) this.parentNode.removeChild(this); }
  contains(n) { while (n) { if (n === this) return true; n = n.parentNode; } return false; }
  addEventListener() {} removeEventListener() {} dispatchEvent() { return true; }
}
class MText extends MNode {
  constructor(doc, data) { super(doc); this.nodeType = 3; this.nodeName = '#text'; this.data = String(data); }
  get textContent() { return this.data; } set textContent(v) { this.data = String(v); }
  get nodeValue() { return this.data; }
  cloneNode() { return new MText(this.ownerDocument, this.data); }
}
function makeStyle() {
  const st = { cssText: '', setProperty(k, v) { st[camel(k)] = v; }, removeProperty(k) { delete st[camel(k)]; }, getPropertyValue(k) { return st[camel(k)] || ''; } };
  return st;
}
class MElement extends MNode {
  constructor(doc, tag) {
    super(doc); this.nodeType = 1; this.localName = tag.toLowerCase(); this.tagName = this.localName.toUpperCase(); this.nodeName = this.tagName;
    this.attrs = new Map(); this._style = null; this._value = undefined; this._checked = undefined; this.scrollTop = 0; this.scrollLeft = 0;
  }
  getAttribute(n) { n = String(n).toLowerCase(); return this.attrs.has(n) ? this.attrs.get(n) : null; }
  setAttribute(n, v) { this.attrs.set(String(n).toLowerCase(), String(v)); }
  removeAttribute(n) { this.attrs.delete(String(n).toLowerCase()); }
  hasAttribute(n) { return this.attrs.has(String(n).toLowerCase()); }
  toggleAttribute(n, f) { const has = this.hasAttribute(n), want = f === undefined ? !has : !!f; if (want) this.setAttribute(n, ''); else this.removeAttribute(n); return want; }
  get attributes() { return [...this.attrs].map(([name, value]) => ({ name, value })); }
  get id() { return this.getAttribute('id') || ''; } set id(v) { this.setAttribute('id', v); }
  get className() { return this.getAttribute('class') || ''; } set className(v) { this.setAttribute('class', v); }
  get title() { return this.getAttribute('title') || ''; } set title(v) { this.setAttribute('title', v); }
  get type() { return this.getAttribute('type') || ''; } set type(v) { this.setAttribute('type', v); }
  get name() { return this.getAttribute('name') || ''; } set name(v) { this.setAttribute('name', v); }
  get href() { return this.getAttribute('href') || ''; } set href(v) { this.setAttribute('href', v); }
  get src() { return this.getAttribute('src') || ''; } set src(v) { this.setAttribute('src', v); }
  get hidden() { return this.hasAttribute('hidden'); } set hidden(v) { this.toggleAttribute('hidden', !!v); }
  get open() { return this.hasAttribute('open'); } set open(v) { this.toggleAttribute('open', !!v); }
  get disabled() { return this.hasAttribute('disabled'); } set disabled(v) { this.toggleAttribute('disabled', !!v); }
  get selected() { return this.hasAttribute('selected'); } set selected(v) { this.toggleAttribute('selected', !!v); }
  get checked() { return this._checked !== undefined ? this._checked : this.hasAttribute('checked'); } set checked(v) { this._checked = !!v; }
  get value() {
    if (this._value !== undefined) return this._value;
    if (this.localName === 'select') { const o = this.querySelectorAll('option'); const s = o.find(x => x.hasAttribute('selected')) || o[0]; return s ? s.value : ''; }
    if (this.localName === 'textarea') return this.textContent;
    if (this.localName === 'option') return this.hasAttribute('value') ? this.getAttribute('value') : this.textContent;
    return this.getAttribute('value') ?? '';
  }
  set value(v) { this._value = String(v); }
  get defaultValue() { return this.getAttribute('value') ?? ''; }
  get validity() { return { badInput: false, valid: true }; }
  get classList() {
    const el = this, list = () => el.className.split(/\s+/).filter(Boolean);
    const api = {
      add(...c) { const l = list(); c.forEach(x => { if (!l.includes(x)) l.push(x); }); el.className = l.join(' '); },
      remove(...c) { el.className = list().filter(x => !c.includes(x)).join(' '); },
      toggle(c, f) { const has = list().includes(c), want = f === undefined ? !has : !!f; if (want && !has) api.add(c); else if (!want && has) api.remove(c); return want; },
      contains(c) { return list().includes(c); },
      replace(a, b) { if (!list().includes(a)) return false; api.remove(a); api.add(b); return true; },
      get length() { return list().length; }
    };
    return api;
  }
  get dataset() {
    const el = this, key = k => 'data-' + kebab(String(k));
    return new Proxy({}, {
      get(_, k) { if (typeof k !== 'string') return undefined; const a = key(k); return el.attrs.has(a) ? el.attrs.get(a) : undefined; },
      set(_, k, v) { el.attrs.set(key(k), String(v)); return true; },
      deleteProperty(_, k) { el.attrs.delete(key(k)); return true; },
      has(_, k) { return el.attrs.has(key(k)); },
      ownKeys() { return [...el.attrs.keys()].filter(a => a.startsWith('data-')).map(a => camel(a.slice(5))); },
      getOwnPropertyDescriptor(_, k) { const a = key(k); return el.attrs.has(a) ? { value: el.attrs.get(a), enumerable: true, configurable: true, writable: true } : undefined; }
    });
  }
  get style() { if (!this._style) this._style = makeStyle(); return this._style; }
  set style(v) { this._style = makeStyle(); this._style.cssText = String(v); }
  get children() { return this.childNodes.filter(n => n.nodeType === 1); }
  get childElementCount() { return this.children.length; }
  get firstElementChild() { return this.children[0] || null; }
  get lastElementChild() { const c = this.children; return c[c.length - 1] || null; }
  get nextElementSibling() { const p = this.parentNode; if (!p) return null; const c = p.childNodes; for (let i = c.indexOf(this) + 1; i < c.length; i++) if (c[i].nodeType === 1) return c[i]; return null; }
  get previousElementSibling() { const p = this.parentNode; if (!p) return null; const c = p.childNodes; for (let i = c.indexOf(this) - 1; i >= 0; i--) if (c[i].nodeType === 1) return c[i]; return null; }
  _adopt(n) { if (n.parentNode) n.parentNode.removeChild(n); n.parentNode = this; }
  appendChild(n) {
    if (n.nodeType === 11) { [...n.childNodes].forEach(c => this.appendChild(c)); return n; }
    this._adopt(n); this.childNodes.push(n); this.ownerDocument._inserted(n); return n;
  }
  insertBefore(n, ref) {
    if (!ref) return this.appendChild(n);
    if (n.nodeType === 11) { [...n.childNodes].forEach(c => this.insertBefore(c, ref)); return n; }
    this._adopt(n); const i = this.childNodes.indexOf(ref); this.childNodes.splice(i < 0 ? this.childNodes.length : i, 0, n); this.ownerDocument._inserted(n); return n;
  }
  removeChild(n) { const i = this.childNodes.indexOf(n); if (i >= 0) { this.childNodes.splice(i, 1); n.parentNode = null; } return n; }
  replaceChild(n, old) { this.insertBefore(n, old); this.removeChild(old); return old; }
  _clear() { this.childNodes.forEach(c => { c.parentNode = null; }); this.childNodes = []; }
  replaceChildren(...ns) { this._clear(); this.append(...ns); }
  append(...ns) { ns.forEach(n => this.appendChild(typeof n === 'string' ? new MText(this.ownerDocument, n) : n)); }
  prepend(...ns) { const f = this.firstChild; ns.forEach(n => this.insertBefore(typeof n === 'string' ? new MText(this.ownerDocument, n) : n, f)); }
  before(...ns) { const p = this.parentNode; if (p) ns.forEach(n => p.insertBefore(typeof n === 'string' ? new MText(this.ownerDocument, n) : n, this)); }
  after(...ns) { const p = this.parentNode; if (!p) return; let ref = this.nextSibling; ns.forEach(n => p.insertBefore(typeof n === 'string' ? new MText(this.ownerDocument, n) : n, ref)); }
  replaceWith(...ns) { this.before(...ns); this.remove(); }
  get textContent() { let s = ''; const walk = n => { for (const c of n.childNodes) { if (c.nodeType === 3) s += c.data; else if (c.nodeType === 1) walk(c); } }; walk(this); return s; }
  set textContent(v) { this._clear(); v = v === null || v === undefined ? '' : String(v); if (v !== '') { const t = new MText(this.ownerDocument, v); t.parentNode = this; this.childNodes.push(t); } }
  get innerText() { return this.textContent; } set innerText(v) { this.textContent = v; }
  get innerHTML() { return this.childNodes.map(serialize).join(''); }
  set innerHTML(h) { this._clear(); parseInto(this, String(h)); this.ownerDocument._htmlSet(this); }
  get outerHTML() { return serialize(this); }
  insertAdjacentHTML(pos, html) { const f = this.ownerDocument.createDocumentFragment(); parseInto(f, String(html)); this._adjacent(pos, f); }
  insertAdjacentElement(pos, el) { this._adjacent(pos, el); return el; }
  insertAdjacentText(pos, t) { this._adjacent(pos, new MText(this.ownerDocument, t)); }
  _adjacent(pos, node) {
    const p = String(pos).toLowerCase();
    if (p === 'beforebegin') { if (this.parentNode) this.parentNode.insertBefore(node, this); }
    else if (p === 'afterbegin') this.insertBefore(node, this.firstChild);
    else if (p === 'beforeend') this.appendChild(node);
    else if (p === 'afterend') { if (this.parentNode) this.parentNode.insertBefore(node, this.nextSibling); }
  }
  querySelector(sel) { return qsa(this, sel, true)[0] || null; }
  querySelectorAll(sel) { return qsa(this, sel, false); }
  getElementsByTagName(t) { return qsa(this, t, false); }
  getElementsByClassName(c) { return qsa(this, String(c).split(/\s+/).filter(Boolean).map(x => '.' + x).join(''), false); }
  closest(sel) { const s = parseSelector(sel, this.ownerDocument); let n = this; while (n && n.nodeType === 1) { if (matchesAny(n, s)) return n; n = n.parentNode; } return null; }
  matches(sel) { return matchesAny(this, parseSelector(sel, this.ownerDocument)); }
  focus() { this.ownerDocument.activeElement = this; }
  blur() { if (this.ownerDocument.activeElement === this) this.ownerDocument.activeElement = this.ownerDocument.body; }
  select() {} click() {} scrollIntoView() {} scrollTo() {} scrollBy() {} play() { return Promise.resolve(); } pause() {} load() {} getContext() { return CTX2D; }
  showModal() { this.open = true; } show() { this.open = true; } close() { this.open = false; }
  animate() { return { finished: Promise.resolve(), cancel() {}, finish() {}, onfinish: null }; }
  getBoundingClientRect() { const b = this._box || { w: 0, h: 0 }; return { top: 0, left: 0, right: b.w, bottom: b.h, width: b.w, height: b.h, x: 0, y: 0 }; }
  getClientRects() { return this.isConnected ? [this.getBoundingClientRect()] : []; }
  get offsetWidth() { return this._box ? this._box.w : 0; } get offsetHeight() { return this._box ? this._box.h : 0; } get offsetTop() { return 0; } get offsetLeft() { return 0; }
  get clientWidth() { return this._box ? this._box.w : 0; } get clientHeight() { return this._box ? this._box.h : 0; } get scrollHeight() { return 0; } get scrollWidth() { return 0; }
  cloneNode(deep) { const c = new MElement(this.ownerDocument, this.localName); this.attrs.forEach((v, k) => c.attrs.set(k, v)); if (deep) this.childNodes.forEach(ch => { const k = ch.cloneNode(true); k.parentNode = c; c.childNodes.push(k); }); return c; }
}
class MDocument extends MNode {
  constructor() {
    super(null); this.ownerDocument = this; this.nodeType = 9; this.nodeName = '#document';
    this.documentElement = new MElement(this, 'html'); this.documentElement.parentNode = this; this.childNodes = [this.documentElement];
    this.head = new MElement(this, 'head'); this.body = new MElement(this, 'body');
    this.documentElement.appendChild(this.head); this.documentElement.appendChild(this.body);
    this.activeElement = this.body; this.hidden = false; this.visibilityState = 'visible'; this.readyState = 'complete'; this.cookie = ''; this.title = '';
    this.fonts = { ready: Promise.resolve(), load: () => Promise.resolve([]) };
    this.onScript = null; this.onHtml = null; this.selectorProblems = [];
  }
  _inserted(n) { if (this.onScript && n.nodeType === 1 && n.localName === 'script' && n.getAttribute('src') && n.isConnected) this.onScript(n); }
  _htmlSet(el) { if (this.onHtml) this.onHtml(el); }
  createElement(t) { return new MElement(this, String(t)); }
  createElementNS(ns, t) { return new MElement(this, String(t)); }
  createTextNode(d) { return new MText(this, d); }
  createComment() { return new MText(this, ''); }
  createDocumentFragment() { const f = new MElement(this, '#fragment'); f.nodeType = 11; return f; }
  getElementById(id) {
    // A remembered answer is used only while it is still in this document under that id.
    const hit = this._ids && this._ids.get(id);
    if (hit && hit.attrs.get('id') === id && hit.isConnected) return hit;
    const found = this._findId(id);
    if (found) (this._ids = this._ids || new Map()).set(id, found);
    return found;
  }
  _findId(id) {
    const stack = [this.documentElement];
    while (stack.length) { const n = stack.pop(); if (n.attrs.get('id') === id) return n; for (let i = n.childNodes.length - 1; i >= 0; i--) if (n.childNodes[i].nodeType === 1) stack.push(n.childNodes[i]); }
    return null;
  }
  querySelector(s) { return qsa(this.documentElement, s, true, true)[0] || null; }
  querySelectorAll(s) { return qsa(this.documentElement, s, false, true); }
  getElementsByTagName(t) { return this.querySelectorAll(t); }
  get scrollingElement() { return this.documentElement; }
  execCommand() { return false; }
  hasFocus() { return true; }
}
function parseInto(parent, html) {
  const doc = parent.ownerDocument, stack = [parent];
  const re = /<!--[\s\S]*?-->|<![^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
  let last = 0, m;
  const text = s => { if (!s) return; const t = new MText(doc, decodeEnt(s)); const top = stack[stack.length - 1]; t.parentNode = top; top.childNodes.push(t); };
  while ((m = re.exec(html))) {
    if (m.index > last) text(html.slice(last, m.index));
    last = re.lastIndex;
    if (m[0][1] === '!') continue;
    if (m[1]) { const t = m[1].toLowerCase(); for (let i = stack.length - 1; i > 0; i--) if (stack[i].localName === t) { stack.length = i; break; } continue; }
    const t = m[2].toLowerCase(), el = new MElement(doc, t);
    const ar = /([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g; let a;
    while ((a = ar.exec(m[3]))) el.attrs.set(a[1].toLowerCase(), decodeEnt(a[2] !== undefined ? a[2] : a[3] !== undefined ? a[3] : a[4] !== undefined ? a[4] : ''));
    const top = stack[stack.length - 1]; el.parentNode = top; top.childNodes.push(el);
    if (RAW_TAGS.has(t)) {
      const end = html.toLowerCase().indexOf('</' + t, last), raw = end < 0 ? html.slice(last) : html.slice(last, end);
      if (raw) { const tn = new MText(doc, t === 'textarea' || t === 'title' ? decodeEnt(raw) : raw); tn.parentNode = el; el.childNodes.push(tn); }
      last = end < 0 ? html.length : html.indexOf('>', end) + 1; re.lastIndex = last; continue;
    }
    if (!VOID_TAGS.has(t) && !m[4]) stack.push(el);
  }
  if (last < html.length) text(html.slice(last));
}
function serialize(n) {
  if (n.nodeType === 3) return n.parentNode && RAW_TAGS.has(n.parentNode.localName) && n.parentNode.localName !== 'textarea' ? n.data : escText(n.data);
  if (n.nodeType !== 1) return '';
  let s = '<' + n.localName; n.attrs.forEach((v, k) => { s += ' ' + k + (v === '' ? '' : '="' + escAttrV(v) + '"'); }); s += '>';
  if (VOID_TAGS.has(n.localName)) return s;
  return s + n.childNodes.map(serialize).join('') + '</' + n.localName + '>';
}
/* Selectors: comma lists, descendant / child / sibling combinators, tag, #id,
   .class, [attr], [attr=v] (and ^= $= *= ~=), :not(...), :checked,
   :first-child, :last-child. Anything else is recorded as a harness
   problem (the run fails) rather than silently matching nothing. */
const selCache = new Map();
function parseSelector(sel, doc) {
  sel = String(sel);
  if (selCache.has(sel)) return selCache.get(sel);
  let i = 0; const n = sel.length;
  const ident = () => { let s = ''; while (i < n) { const c = sel[i]; if (c === '\\') { s += sel[i + 1]; i += 2; } else if (/[\w -￿-]/.test(c)) { s += c; i++; } else break; } return s; };
  const groups = []; let parts = [], comb = null;
  const compound = () => {
    const c = { tag: null, id: null, cls: [], attrs: [], nots: [], pseudo: [] }; let any = false;
    while (i < n) {
      const ch = sel[i];
      if (ch === '#' || ch === '.') { i++; const v = ident(); if (ch === '#') c.id = v; else c.cls.push(v); any = true; }
      else if (ch === '[') {
        i++; let depthQ = null, inner = '';
        while (i < n) { const x = sel[i]; if (depthQ) { if (x === '\\') { inner += x + sel[i + 1]; i += 2; continue; } if (x === depthQ) depthQ = null; inner += x; i++; continue; } if (x === '"' || x === "'") { depthQ = x; inner += x; i++; continue; } if (x === ']') { i++; break; } inner += x; i++; }
        const mm = /^\s*([\w-]+)\s*(?:([~^$*|]?=)\s*(?:"((?:[^"\\]|\\.)*)"|'((?:[^'\\]|\\.)*)'|([^\s\]]+)))?\s*$/.exec(inner);
        if (!mm) throw new Error('selector: cannot read [' + inner + ']');
        const raw = mm[3] !== undefined ? mm[3] : mm[4] !== undefined ? mm[4] : mm[5];
        c.attrs.push({ name: mm[1].toLowerCase(), op: mm[2] || null, val: raw === undefined ? null : raw.replace(/\\(.)/g, '$1') });
        any = true;
      } else if (ch === ':') {
        i++; if (sel[i] === ':') i++; const name = ident(); let arg = null;
        if (sel[i] === '(') { let d = 0, s = ''; i++; while (i < n) { const x = sel[i]; if (x === '(') d++; if (x === ')') { if (d === 0) { i++; break; } d--; } s += x; i++; } arg = s; }
        if (name === 'not') c.nots.push(parseSelector(arg, doc)); else c.pseudo.push(name);
        any = true;
      } else if (ch === '*') { i++; any = true; }
      else if (/[\w-]/.test(ch)) { c.tag = ident().toLowerCase(); any = true; }
      else break;
    }
    return any ? c : null;
  };
  while (i < n) {
    const ch = sel[i];
    if (/\s/.test(ch)) { i++; if (parts.length && comb === null) comb = ' '; continue; }
    if (ch === ',') { i++; if (parts.length) groups.push(parts); parts = []; comb = null; continue; }
    if (ch === '>' || ch === '+' || ch === '~') { i++; comb = ch; continue; }
    const c = compound();
    if (!c) throw new Error('selector: cannot read "' + sel + '" at ' + i);
    parts.push({ comb: parts.length ? (comb || ' ') : null, c }); comb = null;
  }
  if (parts.length) groups.push(parts);
  selCache.set(sel, groups);
  return groups;
}
const KNOWN_PSEUDO = new Set(['checked', 'first-child', 'last-child', 'focus', 'scope']);
function matchCompound(el, c) {
  if (c.tag && el.localName !== c.tag) return false;
  if (c.id !== null && el.attrs.get('id') !== c.id) return false;
  if (c.cls.length) { const have = (el.attrs.get('class') || '').split(/\s+/); for (const k of c.cls) if (!have.includes(k)) return false; }
  for (const a of c.attrs) {
    if (!el.attrs.has(a.name)) return false;
    if (a.op === null) continue;
    const v = el.attrs.get(a.name);
    if (a.op === '=' && v !== a.val) return false;
    if (a.op === '^=' && !v.startsWith(a.val)) return false;
    if (a.op === '$=' && !v.endsWith(a.val)) return false;
    if (a.op === '*=' && !v.includes(a.val)) return false;
    if (a.op === '~=' && !v.split(/\s+/).includes(a.val)) return false;
    if (a.op === '|=' && !(v === a.val || v.startsWith(a.val + '-'))) return false;
  }
  for (const p of c.pseudo) {
    if (!KNOWN_PSEUDO.has(p)) { el.ownerDocument.selectorProblems.push(':' + p); return false; }
    if (p === 'checked' && !el.checked) return false;
    if (p === 'focus' && el.ownerDocument.activeElement !== el) return false;
    if (p === 'first-child' && el.parentNode && el.parentNode.childNodes.find(x => x.nodeType === 1) !== el) return false;
    if (p === 'last-child' && el.parentNode && el.parentNode.lastElementChild !== el) return false;
  }
  for (const g of c.nots) if (matchesAny(el, g)) return false;
  return true;
}
function matchParts(el, parts, k) {
  if (!matchCompound(el, parts[k].c)) return false;
  if (k === 0) return true;
  const comb = parts[k].comb;
  if (comb === '>') { const p = el.parentNode; return !!(p && p.nodeType === 1 && matchParts(p, parts, k - 1)); }
  if (comb === '+') { const p = el.previousElementSibling; return !!(p && matchParts(p, parts, k - 1)); }
  if (comb === '~') { let p = el.previousElementSibling; while (p) { if (matchParts(p, parts, k - 1)) return true; p = p.previousElementSibling; } return false; }
  let p = el.parentNode; while (p && p.nodeType === 1) { if (matchParts(p, parts, k - 1)) return true; p = p.parentNode; } return false;
}
function matchesAny(el, groups) { for (const g of groups) if (matchParts(el, g, g.length - 1)) return true; return false; }
function qsa(root, sel, first, includeRoot) {
  let groups;
  try { groups = parseSelector(sel, root.ownerDocument); } catch (e) { root.ownerDocument.selectorProblems.push(String(sel)); return []; }
  const out = [], stack = includeRoot ? [root] : [...root.childNodes].reverse();
  while (stack.length) {
    const nd = stack.pop();
    if (nd.nodeType !== 1) continue;
    if (matchesAny(nd, groups)) { out.push(nd); if (first) return out; }
    for (let i = nd.childNodes.length - 1; i >= 0; i--) stack.push(nd.childNodes[i]);
  }
  return out;
}
export { MDocument, MElement, MText, parseInto, serialize };
