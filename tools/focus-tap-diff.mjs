#!/usr/bin/env node
/* focus-tap-diff.mjs — a Focus step tap redraws the open card alone; is the page then EXACTLY the page a full render
   would draw? (2026-11-25, sweep perf fix: caRedrawOpenCard in app/activities.js.)

     node tools/focus-tap-diff.mjs                 every case below; exit 0 = every tap identical, 1 = a ✗ line
     node tools/focus-tap-diff.mjs --root DIR      another site folder (a scratch copy with a planted fault)
     node tools/focus-tap-diff.mjs --only ca-21    one Focus activity
     node tools/focus-tap-diff.mjs --verbose       print the first difference of each failure in full
     node tools/focus-tap-diff.mjs --all           more taps per placement (see the end of CASES)

   WHY. Before 2026-11-25 every Focus "Got it" / step button tap ran renderClassActivities(): every card on the In
   class page rebuilt (43 cards, about 2 MB of HTML, 760 ms tap to paint at 4x CPU in headless Chrome). caFocusGo now
   rebuilds the open card with the builder and arguments the last full render used for it (caCardOut notes them) and
   falls back to the full render when it cannot be sure. The rule this tool holds: after ANY tap, the In class page's
   HTML is byte for byte what a full renderClassActivities() draws at that moment.

   WHAT IS REAL. The whole student app (tools/sim-app-page.mjs: i18n.js, class-activities.js, config-main.js, every
   module, every app/*.js part) and the real CLASS_ACTIVITIES. The taps are the real caFocusGo / caFocusGotIt; the
   post-render steps are the real applyI18n, caArmTabReveals and caSyncTopbar (caSyncSolo's classes included).
   STUBBED: the DOM. A small one is written below (an HTML parser that decodes entities, a tree, a serializer, a
   selector engine for the selectors these paths use; anything it cannot read throws, so it never matches nothing in
   silence). No layout: every size is 0, so caFitBar never tightens. Timers and frames never run (a tab's reveal
   countdown stays armed, the same in both pages). Made-up board: the Focus activity under test plus ten others.

   HOW ONE TAP IS CHECKED. Full render with the card open, then the tap; snapshot A = the page body, the open card's
   bar and the classes on <body> and the screen. Then renderClassActivities(); snapshot B. A === B, and the tap's own
   page renders are counted: 0 when the card is redrawn alone, 1 when it fell back, each case saying which it expects
   (a redraw that silently always fell back would pass the identity and fail this count).

   CASES, each in English and Spanish:
     placement  every Focus activity (21 on 2026-11-25) in Today (pending: the hero builder; finished: the kind row;
                yesterday's: with its date chip), in "Since your last visit" (its top hero card and a row), in the
                Unfinished fold (inside a module fold), in the Completed fold, pin-only under the Keep practicing row,
                and a Level up's target in another card's Today slot (caSwap). Today (pending) walks every step:
                the step button, then "Got it" (a tick), then back to step 1 and a second "Got it" pass over done
                steps; the rest walk step 2 and the last step (--all: every step in the Unfinished fold too, and
                steps 1, 2 and the last elsewhere). The last step's "Got it" must fall back (the plan keeps it on the
                full render) and match.
     switches   ca-34's chord version (full / power) and ca-46's paths (each path picked), in Today, the Unfinished
                fold and the Level up swap.
     audio      a tap while a snippet and a practice card's song are playing: snipStop and pcStop run during it.
     fall-backs each must render the page once and match: a new day since the render, another student, a language
                switch with no render, a pending "Since your last visit" repaint, another card also open, the fold
                around the card closed, CLASS_ACTIVITIES replaced (a built-song merge), the card finished elsewhere.
   Node only: 2112 taps, about 80 s of CPU alone (2026-11-25; 290 s on a loaded machine). --all: every step in the
   Unfinished fold too and steps 1, 2 and the last elsewhere, 2976 taps. Run it after any change to caFocusGo / caFocusGotIt / caRedrawOpenCard / caCardOut, to a
   card call site in renderClassActivities, caSinceHtml or caFinishedGroupHtml, or to anything OUTSIDE a card that
   starts to read a step's tick (caStepDone) or caStepOpen. */
import { resolve } from 'node:path';
import { appPage } from './sim-app-page.mjs';

const args = process.argv.slice(2);
const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ROOT = resolve(opt('--root') || process.cwd());
const ONLY = opt('--only');
const VERBOSE = args.includes('--verbose');
const ALL = args.includes('--all');

/* ── The small DOM ─────────────────────────────────────────────────────────────────────────────────────────────── */
const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
const RAW = new Set(['script', 'style', 'textarea', 'title']);
const NAMED = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0', middot: '\u00b7', rarr: '\u2192', larr: '\u2190',
  mdash: '\u2014', ndash: '\u2013', ldquo: '\u201c', rdquo: '\u201d', lsquo: '\u2018', rsquo: '\u2019', times: '\u00d7', hellip: '\u2026',
  bull: '\u2022', check: '\u2713', deg: '\u00b0', sharp: '\u266f', flat: '\u266d', copy: '\u00a9', eacute: '\u00e9', aacute: '\u00e1',
  iacute: '\u00ed', oacute: '\u00f3', uacute: '\u00fa', ntilde: '\u00f1', iexcl: '\u00a1', iquest: '\u00bf', uarr: '\u2191', darr: '\u2193' };
const unknownEntities = new Set();
const decode = s => s.indexOf('&') < 0 ? s : s.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (m, e) => {
  if (e[0] === '#') return String.fromCodePoint(e[1] === 'x' || e[1] === 'X' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10));
  if (e in NAMED) return NAMED[e];
  unknownEntities.add(e); return m;
});
const escText = s => !/[&<>\u00a0]/.test(s) ? s : s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\u00a0/g, '&nbsp;');
const escAttrV = s => /[&"\u00a0]/.test(s) ? s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/\u00a0/g, '&nbsp;') : s;
let strayEnds = 0;
let treeGen = 0;   // bumped by every change to the tree or to an id (doc.getElementById's index)

class Node_ { constructor(type){ this.nodeType = type; this.parentNode = null; } get parentElement(){ return this.parentNode && this.parentNode.nodeType === 1 ? this.parentNode : null; }
  remove(){ if (this.parentNode) this.parentNode._remove(this); }
  replaceWith(n){ treeGen++; const p = this.parentNode; if (!p) return; const kids = n.nodeType === 11 ? n.childNodes.slice() : [n]; const i = p.childNodes.indexOf(this);
    kids.forEach(k => { if (k.parentNode) k.parentNode._remove(k); k.parentNode = p; }); p.childNodes.splice(i, 1, ...kids); this.parentNode = null; } }
class Text_ extends Node_ { constructor(d){ super(3); this.data = d; } get textContent(){ return this.data; } set textContent(v){ this.data = String(v); } }
class Comment_ extends Node_ { constructor(d){ super(8); this.data = d; } get textContent(){ return ''; } }
class Parent_ extends Node_ {
  constructor(type){ super(type); this.childNodes = []; }
  get children(){ return this.childNodes.filter(n => n.nodeType === 1); }
  get firstElementChild(){ return this.childNodes.find(n => n.nodeType === 1) || null; }
  get childElementCount(){ return this.children.length; }
  _remove(n){ treeGen++; const i = this.childNodes.indexOf(n); if (i >= 0) this.childNodes.splice(i, 1); n.parentNode = null; }
  appendChild(n){ treeGen++; const kids = n.nodeType === 11 ? n.childNodes.slice() : [n]; kids.forEach(k => { if (k.parentNode) k.parentNode._remove(k); k.parentNode = this; this.childNodes.push(k); }); return n; }
  removeChild(n){ this._remove(n); return n; }
  get textContent(){ return this.childNodes.map(n => n.nodeType === 8 ? '' : n.textContent).join(''); }
  set textContent(v){ treeGen++; this.childNodes.forEach(n => { n.parentNode = null; }); this.childNodes = []; if (String(v) !== '') this.appendChild(new Text_(String(v))); }
  get innerHTML(){ return this.childNodes.map(serialize).join(''); }
  set innerHTML(html){ this.childNodes.forEach(n => { n.parentNode = null; }); this.childNodes = []; parseInto(this, String(html)); }
  querySelectorAll(sel){ const list = parseSelector(sel), out = []; walk(this, el => { if (list.some(c => matchComplex(el, c, this))) out.push(el); }); return out; }
  querySelector(sel){ const list = parseSelector(sel); return find(this, el => list.some(c => matchComplex(el, c, this))); }
  contains(n){ for (let x = n; x; x = x.parentNode) if (x === this) return true; return false; }
  getElementById(id){ return find(this, el => el.attrs.get('id') === id); }
}
class Fragment_ extends Parent_ { constructor(){ super(11); } }
class Element_ extends Parent_ {
  constructor(name, svg){ super(1); this.localName = name; this.svg = svg; this.attrs = new Map(); this._cs = null; this._cl = null;
    if (name === 'template') this.content = new Fragment_(); }
  get style(){ return this._st || (this._st = { setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; } }); }
  get dataset(){
    const self = this, an = k => 'data-' + String(k).replace(/[A-Z]/g, c => '-' + c.toLowerCase());
    return this._ds || (this._ds = new Proxy({}, {
      get: (t, k) => typeof k === 'string' ? (self.getAttribute(an(k)) ?? undefined) : undefined,
      set: (t, k, v) => { self.setAttribute(an(k), String(v)); return true; },
      deleteProperty: (t, k) => { self.removeAttribute(an(k)); return true; },
      has: (t, k) => self.hasAttribute(an(k)),
    }));
  }
  _classes(){ const c = this.attrs.get('class'); if (c === undefined) return []; if (c !== this._cs) { this._cs = c; this._cl = c.split(/\s+/).filter(Boolean); } return this._cl; }
  get classList(){
    const self = this;
    return this._clo || (this._clo = {
      contains: c => self._classes().includes(c),
      add: (...cs) => { const l = self._classes().slice(); let ch = false; cs.forEach(c => { if (!l.includes(c)) { l.push(c); ch = true; } }); if (ch) self.setAttribute('class', l.join(' ')); },
      remove: (...cs) => { if (!self.attrs.has('class')) return; const l = self._classes(); if (cs.some(c => l.includes(c))) self.setAttribute('class', l.filter(c => !cs.includes(c)).join(' ')); },
      toggle: (c, force) => { const on = force === undefined ? !self._classes().includes(c) : !!force; if (on) self.classList.add(c); else self.classList.remove(c); return on; },
    });
  }
  get tagName(){ return this.svg ? this.localName : this.localName.toUpperCase(); }
  get nodeName(){ return this.tagName; }
  get id(){ return this.getAttribute('id') || ''; }
  get className(){ return this.getAttribute('class') || ''; }
  set className(v){ this.setAttribute('class', String(v)); }
  getAttribute(n){ const v = this.attrs.get(n); return v !== undefined ? v : (n !== n.toLowerCase() ? this.getAttribute(n.toLowerCase()) : null); }
  hasAttribute(n){ return this.getAttribute(n) !== null; }
  setAttribute(n, v){ n = n.toLowerCase(); if (n === 'id') treeGen++; this.attrs.set(n, String(v)); }
  removeAttribute(n){ n = n.toLowerCase(); if (n === 'id') treeGen++; this.attrs.delete(n); }
  get hidden(){ return this.hasAttribute('hidden'); }
  set hidden(v){ if (v) this.setAttribute('hidden', ''); else this.removeAttribute('hidden'); }
  get open(){ return this.hasAttribute('open'); }
  set open(v){ if (v) this.setAttribute('open', ''); else this.removeAttribute('open'); }
  get outerHTML(){ return serialize(this); }
  get innerHTML(){ return (this.localName === 'template' ? this.content : this).childNodes.map(serialize).join(''); }
  set innerHTML(html){ const host = this.localName === 'template' ? this.content : this; host.childNodes.forEach(n => { n.parentNode = null; }); host.childNodes = []; parseInto(host, String(html), this.svg || this.localName === 'svg'); }
  closest(sel){ const list = parseSelector(sel); for (let x = this; x && x.nodeType === 1; x = x.parentNode) if (list.some(c => matchComplex(x, c, null))) return x; return null; }
  matches(sel){ return parseSelector(sel).some(c => matchComplex(this, c, null)); }
  focus(){ doc.activeElement = this; } blur(){} click(){} scrollIntoView(){} addEventListener(){} removeEventListener(){}
  get offsetHeight(){ return 0; } get offsetWidth(){ return 0; } get clientWidth(){ return 0; } get clientHeight(){ return 0; }
  getBoundingClientRect(){ return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0 }; }
  getClientRects(){ return []; }
  insertAdjacentHTML(pos, html){ const f = new Fragment_(); parseInto(f, html, this.svg); const p = this.parentNode;
    if (pos === 'beforeend') this.appendChild(f); else if (pos === 'afterbegin') { const kids = f.childNodes.slice(); kids.forEach(k => { k.parentNode = this; }); this.childNodes.unshift(...kids); }
    else if (pos === 'beforebegin' && p) { const i = p.childNodes.indexOf(this); f.childNodes.forEach(k => { k.parentNode = p; }); p.childNodes.splice(i, 0, ...f.childNodes); }
    else if (pos === 'afterend' && p) { const i = p.childNodes.indexOf(this); f.childNodes.forEach(k => { k.parentNode = p; }); p.childNodes.splice(i + 1, 0, ...f.childNodes); }
    else throw new Error('insertAdjacentHTML ' + pos); }
  cloneNode(deep){ const e = new Element_(this.localName, this.svg); e.attrs = new Map(this.attrs); if (deep) parseInto(e, this.innerHTML, this.svg); return e; }
}
function find(root, test){ const ks = root.childNodes; for (let i = 0; i < ks.length; i++) { const n = ks[i]; if (n.nodeType === 1) { if (test(n)) return n; const f = find(n.localName === 'template' ? n.content : n, test); if (f) return f; } } return null; }
function walk(root, fn){ const ks = root.childNodes; for (let i = 0; i < ks.length; i++) { const n = ks[i]; if (n.nodeType === 1) { fn(n); walk(n.localName === 'template' ? n.content : n, fn); } } }
function serialize(n){
  if (n.nodeType === 3) return n.parentNode && n.parentNode.nodeType === 1 && RAW.has(n.parentNode.localName) ? n.data : escText(n.data);
  if (n.nodeType === 8) return `<!--${n.data}-->`;
  let attrs = '';
  for (const [k, v] of n.attrs) attrs += ` ${k}="${escAttrV(v)}"`;
  if (!n.svg && VOID.has(n.localName)) return `<${n.localName}${attrs}>`;
  const kids = (n.localName === 'template' ? n.content : n).childNodes.map(serialize).join('');
  return `<${n.localName}${attrs}>${kids}</${n.localName}>`;
}
const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/y;
const ATTR_RE = /\s+([^\s"'>\/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/y;
function parseInto(host, html, inSvg = false){
  treeGen++;
  const stack = [host];
  const svgAt = [inSvg];
  let i = 0, text = '';
  const top = () => stack[stack.length - 1];
  const flush = () => { if (text) { const t = new Text_(decode(text)); t.parentNode = top(); top().childNodes.push(t); text = ''; } };
  while (i < html.length) {
    const lt = html.indexOf('<', i);
    if (lt < 0) { text += html.slice(i); break; }
    text += html.slice(i, lt); i = lt;
    if (html.startsWith('<!--', i)) { const e = html.indexOf('-->', i + 4); flush(); const c = new Comment_(html.slice(i + 4, e < 0 ? html.length : e)); c.parentNode = top(); top().childNodes.push(c); i = e < 0 ? html.length : e + 3; continue; }
    if (html.startsWith('<!', i)) { const e = html.indexOf('>', i); i = e < 0 ? html.length : e + 1; continue; }
    TAG_RE.lastIndex = i;
    const m = TAG_RE.exec(html);
    if (!m) { text += '<'; i++; continue; }
    flush();
    i = TAG_RE.lastIndex;
    const name = m[2].toLowerCase();
    if (m[1]) {
      let k = stack.length - 1;
      while (k > 0 && !(stack[k].localName === name)) k--;
      if (k > 0) { stack.length = k; svgAt.length = k; } else strayEnds++;
      continue;
    }
    const svg = svgAt[svgAt.length - 1] || name === 'svg';
    const el = new Element_(svg ? m[2] : name, svg);
    ATTR_RE.lastIndex = 0;
    const as = m[3]; let am; ATTR_RE.lastIndex = 0;
    while (ATTR_RE.lastIndex < as.length && (am = ATTR_RE.exec(as))) {
      const an = am[1].toLowerCase();
      if (!el.attrs.has(an)) el.attrs.set(an, decode(am[2] ?? am[3] ?? am[4] ?? ''));
    }
    el.parentNode = top(); top().childNodes.push(el);
    if ((!svg && VOID.has(name)) || (svg && m[4])) continue;
    if (!svg && RAW.has(name)) {
      const e = html.toLowerCase().indexOf('</' + name, i);
      const body = html.slice(i, e < 0 ? html.length : e);
      if (body) { const t = new Text_(name === 'textarea' || name === 'title' ? decode(body) : body); t.parentNode = el; el.childNodes.push(t); }
      i = e < 0 ? html.length : html.indexOf('>', e) + 1;
      continue;
    }
    if (name === 'template') el.content.localName = 'template';   // so </template> closes it
    stack.push(name === 'template' ? el.content : el);
    svgAt.push(svg);
  }
  flush();
}
/* Selectors: a list of complex selectors; compound = tag | * | #id | .class | [attr] | [attr="v"] | [attr^="v"] |
   :not(<compound>); combinators ' ' and '>'. Anything else throws. */
const selCache = new Map();
function parseSelector(sel){
  if (selCache.has(sel)) return selCache.get(sel);
  const list = [];
  for (const part of splitTop(sel, ',')) {
    const s = part.trim(); const steps = []; let i = 0, comb = ' ';
    while (i < s.length) {
      if (/\s/.test(s[i])) { i++; continue; }
      if (s[i] === '>') { comb = '>'; i++; continue; }
      if (s[i] === '+' || s[i] === '~') throw new Error(`focus-tap-diff's DOM cannot read the combinator "${s[i]}" in ${sel}`);
      const [cmp, j] = parseCompound(s, i, sel); steps.push({ comb, cmp }); comb = ' '; i = j;
    }
    list.push(steps);
  }
  selCache.set(sel, list);
  return list;
}
function splitTop(s, ch){ const out = []; let d = 0, q = null, cur = ''; for (const c of s) { if (q) { if (c === q) q = null; cur += c; continue; } if (c === '"' || c === "'") q = c;
  if (c === '(' || c === '[') d++; if (c === ')' || c === ']') d--; if (c === ch && !d) { out.push(cur); cur = ''; } else cur += c; } out.push(cur); return out; }
function parseCompound(s, i, sel){
  const tests = [];
  while (i < s.length && !/[\s>+~,]/.test(s[i])) {
    let m;
    const rest = s.slice(i);
    if ((m = /^(\*|[a-zA-Z][a-zA-Z0-9-]*)/.exec(rest))) { const t = m[1].toLowerCase(); if (t !== '*') tests.push(el => el.localName.toLowerCase() === t); i += m[0].length; continue; }
    if ((m = /^#((?:\\.|[\w-])+)/.exec(rest))) { const v = m[1].replace(/\\(.)/g, '$1'); tests.push(el => el.getAttribute('id') === v); i += m[0].length; continue; }
    if ((m = /^\.((?:\\.|[\w-])+)/.exec(rest))) { const v = m[1].replace(/\\(.)/g, '$1'); tests.push(el => el.classList.contains(v)); i += m[0].length; continue; }
    if ((m = /^\[\s*([\w-]+)\s*(?:([\^$*]?=)\s*(?:"((?:\\.|[^"\\])*)"|'((?:\\.|[^'\\])*)'|([\w-]+)))?\s*\]/.exec(rest))) {
      const an = m[1].toLowerCase(), op = m[2], v = (m[3] ?? m[4] ?? m[5] ?? '').replace(/\\(.)/g, '$1');
      tests.push(el => { const got = el.getAttribute(an); if (got === null) return false; if (!op) return true;
        return op === '=' ? got === v : op === '^=' ? got.startsWith(v) : op === '$=' ? got.endsWith(v) : got.includes(v); });
      i += m[0].length; continue;
    }
    if (rest.startsWith(':not(')) { let d = 0, j = i + 4; for (; j < s.length; j++) { if (s[j] === '(') d++; if (s[j] === ')') { d--; if (!d) break; } }
      const inner = parseSelector(s.slice(i + 5, j)); tests.push(el => !inner.some(c => c.length === 1 && c[0].cmp(el))); i = j + 1; continue; }
    throw new Error(`focus-tap-diff's DOM cannot read "${rest}" in the selector ${sel}`);
  }
  return [el => tests.every(t => t(el)), i];
}
function matchComplex(el, steps, scope){
  const m = (k, node) => {
    if (!steps[k].cmp(node)) return false;
    if (k === 0) return true;
    const comb = steps[k].comb;
    for (let p = node.parentNode; p && p.nodeType === 1 && p !== scope; p = p.parentNode) { if (m(k - 1, p)) return true; if (comb === '>') return false; }
    return false;
  };
  return m(steps.length - 1, el);
}

/* The page the app writes into: the parts of index.html these paths reach. */
const doc = {
  activeElement: null, fullscreenElement: null, hidden: false, visibilityState: 'visible',
  fonts: { ready: Promise.resolve() },
  createElement: n => new Element_(String(n).toLowerCase(), false),
  createDocumentFragment: () => new Fragment_(),
  addEventListener(){}, removeEventListener(){},
};
function newDocument(){
  const html = new Element_('html', false);
  parseInto(html, `<head></head><body><div class="page-screen ca-screen" id="class-activities-screen"><div class="page-topbar">`
    + `<h2 class="page-title" id="ca-page-title"><span data-i18n="nav.classActivitiesNav">In class</span></h2><div class="ca-bar-open" id="ca-bar-open" hidden></div></div>`
    + `<div class="page-body" id="class-activities-body"></div></div><div id="resume-card" hidden></div></body>`);
  doc.documentElement = html;
  doc.head = html.children[0]; doc.body = html.children[1];
  /* An id index, rebuilt when the tree has changed since (caSyncTopbar looks up six ids, most of them absent). */
  let at = -1, ids = null;
  doc.getElementById = id => { if (at !== treeGen) { ids = new Map(); walk(html, el => { const v = el.attrs.get('id'); if (v !== undefined && !ids.has(v)) ids.set(v, el); }); at = treeGen; } return ids.get(id) || null; };
  doc.querySelector = s => html.querySelector(s);
  doc.querySelectorAll = s => html.querySelectorAll(s);
  doc.activeElement = doc.body;
}

/* ── The app ───────────────────────────────────────────────────────────────────────────────────────────────────── */
const page = appPage(ROOT);
const { ctx, run } = page;
newDocument();
ctx.document = doc;
let clock = 0;
ctx.performance = { now: () => (clock += 1000) };   // caFocusGotIt ignores a second tap inside 400 ms
ctx.CSS = { escape: s => String(s).replace(/["\\]/g, '\\$&') };
ctx.history = { state: null, replaceState(){}, pushState(){} };
ctx.setTimeout = () => 0; ctx.requestAnimationFrame = () => 0;
const J = JSON.stringify;
const must = ['caFocusGo', 'caFocusGotIt', 'renderClassActivities', 'caRedrawOpenCard', 'caCardOut', 'caRoute', 'caIsFocus'];
const missing = must.filter(f => run(`typeof ${f}`) !== 'function');
if (missing.length) { console.log(`✗ focus-tap-diff cannot run: the app has no ${missing.join(', ')}`); process.exit(1); }
run('window.__caSaved = window.CLASS_ACTIVITIES');
const counts = { renders: 0, snip: 0, pc: 0 };
ctx.__counts = counts;
run(`(() => { const r = renderClassActivities, s = snipStop, p = pcStop;
  renderClassActivities = function(){ __counts.renders++; return r.apply(this, arguments); };
  snipStop = function(){ __counts.snip++; return s.apply(this, arguments); };
  pcStop = function(){ __counts.pc++; return p.apply(this, arguments); }; })()`);

const MODS = run('MODULE_MANIFEST.map(m => m.num)');
const MA = MODS[3], MB = MODS[4];
const T = '2025-11-10', Y = '2025-11-09', D4 = '2025-11-06', D5 = '2025-11-05', D10 = '2025-10-31', D20 = '2025-10-21', FUT = '2099-01-05';
/* The ten others, light ones (the page stays near 100 KB): three practice cards, both exit checks, the one plain
   ladder, four Focus ladders (ca-46 with its paths; a spare stands in for one that is the card under test), spread
   over every group. [id, date, done] */
const OTHERS = [['ca-10', T, false], ['ca-14', Y, false], ['ca-48', D4, false], ['ca-50', D5, false], ['ca-46', D20, false],
  ['ca-52', D4, true], ['ca-15', D20, true], ['ca-49', D10, false], ['ca-54', T, true], ['ca-44', D5, true]];
const SPARE = ['ca-43', 'ca-23', 'ca-20'];
const PLACE = {   // the card under test: its date, done, and whether "Since your last visit" is on (the dev user)
  today: { date: T, done: false }, todayDone: { date: T, done: true }, yesterday: { date: Y, done: false },
  sinceTop: { date: D4, done: false, since: true }, sinceRow: { date: D5, done: false, since: true, low: true },
  todo: { date: D20, done: false }, finished: { date: D20, done: true },
  pinOnly: { date: FUT, done: false, pin: true }, swap: { date: FUT, done: false, pin: true, swapFrom: 'ca-10' },
};
/* Every step in Today (and, with --all, in the Unfinished fold); the other placements walk step 2 and the last step
   (--all: steps 1, 2 and the last). */
const FULL_WALK = new Set(ALL ? ['today', 'todo'] : ['today']);

function setUp(F, place, lang, mode){
  const P = PLACE[place];
  const used = new Set([F]);
  const others = OTHERS.map(o => o.slice()).map(o => { if (o[0] === F) { const s = SPARE.find(x => !used.has(x) && !OTHERS.some(q => q[0] === x)); o[0] = s; } used.add(o[0]); return o; });
  // Board order: the others, then F last (the highest number: the top of its date in Since), or first for sinceRow.
  const order = P.low ? [[F, P.date, P.done]].concat(others) : others.concat([[F, P.date, P.done]]);
  const board = {}, dates = {}, done = {};
  order.forEach(([id, date, isDone], pos) => { board[id] = { module: pos < order.length / 2 ? MA : MB, pos }; dates[id] = date; if (isDone) done[id] = true; });
  ctx.__s = { board, dates, done, today: T, pins: P.pin ? [F] : [], swap: P.swapFrom ? { from: P.swapFrom, to: F } : null, dev: !!P.since, F, mode };
  run(`window.CLASS_ACTIVITIES = __caSaved; activityBoard = __s.board; activityBoardOn = true; activityDates = __s.dates; classActivities = __s.done; optionalActivityIds = {};
    hiddenActivityIds = {}; keepTodayActivityIds = {}; retiredActivityIds = {}; activityForMe = {}; activityPins = __s.pins; activityClears = {};
    playAlongActivityIds = {}; songLibraryIds = {}; classSongIds = {}; studentPeriod = '4'; periodOverride = '';
    currentUser = __s.dev ? { uid: 'dev-user' } : null; window.__caWorkDays = __s.dev ? ['2025-10-31'] : [];
    caTodayStr = () => __s.today; caTodoOpen = true; caFinishedOpen = false; caLinkMissingId = null; caNudgeId = null; caSinceRepaint = false;
    for (const k in caModFoldOpen) delete caModFoldOpen[k];
    caStepDone = {}; caStepOpen = {}; caRevealedTabs.clear(); caSwap = __s.swap;
    for (const k in caChordModes) delete caChordModes[k];
    if (__s.mode && __s.mode.chord) caChordModes[__s.F] = __s.mode.chord;
    if (__s.mode && __s.mode.path) caStepDone[__s.F + ':path:' + __s.mode.path] = true;
    setLang(${J(lang)});
    caOpenId = __s.F;`);
  newDocument();
  run('renderClassActivities()');
}
const snap = () => {
  const b = doc.getElementById('class-activities-body'), bar = doc.getElementById('ca-bar-open'), scr = doc.getElementById('class-activities-screen');
  return `${b.innerHTML}\n--bar ${bar.outerHTML}\n--title ${doc.getElementById('ca-page-title').outerHTML}\n--body ${doc.body.getAttribute('class')}\n--screen ${scr.getAttribute('class')}`;
};
const firstDiff = (a, b) => { let i = 0; while (i < a.length && a[i] === b[i]) i++; return { at: i, a: a.slice(Math.max(0, i - 160), i + 240), b: b.slice(Math.max(0, i - 160), i + 240) }; };

let taps = 0, same = 0, redrawn = 0, fellBack = 0, bad = 0, changed = 0;   // changed: taps that changed the open card at all
const fails = [];
const byKind = {};
/* One tap: `code` runs it; `expect` = 0 (the card redrawn alone) or 1 (the page rendered once). `before` runs first
   (a state change the tap must notice). */
function tap(label, code, expect, before){
  if (before) run(before);
  const openNow = () => { const c = doc.getElementById('class-activities-body').querySelector('.ca-card[open]'); return c ? c.outerHTML : ''; };
  const pre = openNow();
  counts.renders = 0; counts.snip = 0; counts.pc = 0;
  run(code);
  const r = counts.renders, sn = counts.snip, pc = counts.pc;
  const A = snap();
  if (openNow() !== pre) changed++;
  run('renderClassActivities()');
  const B = snap();
  taps++;
  const kind = label.split(' ')[0];
  byKind[kind] = byKind[kind] || { taps: 0, same: 0 };
  byKind[kind].taps++;
  const problems = [];
  if (A !== B) problems.push('the page differs from a full render');
  if (r !== expect) problems.push(`it rendered the page ${r} time(s), expected ${expect}`);
  if (sn < 1 || pc < 1) problems.push(`snipStop ran ${sn} time(s) and pcStop ${pc}: the tap must stop both`);
  if (!problems.length) { same++; byKind[kind].same++; if (r === 0) redrawn++; else fellBack++; return true; }
  bad++;
  if (fails.length < 40) fails.push({ label, problems, diff: A !== B ? firstDiff(A, B) : null });
  return false;
}
const focusIds = run('(window.CLASS_ACTIVITIES || []).filter(a => caIsFocus(a)).map(a => a.id)').filter(id => !ONLY || id === ONLY);
if (!focusIds.length) { console.log(`✗ focus-tap-diff found no Focus activity${ONLY ? ' ' + ONLY : ''}`); process.exit(1); }
const modesOf = id => {
  const out = [null];
  if (run(`caHasChordVersions(CLASS_ACTIVITIES.find(a => a.id === ${J(id)}))`)) out.push({ chord: 'power' }, { chord: 'full' });
  const paths = run(`(CLASS_ACTIVITIES.find(a => a.id === ${J(id)}).paths || []).map(p => p.key)`);
  if (paths.length) return paths.map(p => ({ path: p }));   // no path picked = the picker: no step to tap
  return out;
};
const t0 = Date.now();
let walked = 0;
for (const F of focusIds) {
  for (const mode of modesOf(F)) for (const lang of ['en', 'es']) for (const place of Object.keys(PLACE)) {
    if (mode && !['today', 'todo', 'swap'].includes(place)) continue;   // the switches walk the main placements
    setUp(F, place, lang, mode);
    const tag = `${F}${mode ? '/' + J(mode) : ''} ${lang} ${place}`;
    const route = run(`caRoute(CLASS_ACTIVITIES.find(a => a.id === ${J(F)}))`);
    if (run(`caChooserUp(CLASS_ACTIVITIES.find(a => a.id === ${J(F)}))`) || !route.length) { fails.push({ label: `${tag}: no step to tap (the path picker is up)`, problems: ['setup'] }); bad++; continue; }
    if (doc.getElementById('class-activities-body').querySelectorAll(`.ca-card[open][data-id="${F}"]`).length !== 1) { fails.push({ label: `${tag}: the card is not open on the page after the setup render`, problems: ['setup'] }); bad++; continue; }
    walked++;
    const last = route.length - 1;
    const posList = FULL_WALK.has(place) ? route.map((_, i) => i) : [...new Set(ALL ? [0, Math.min(1, last), last] : [Math.min(1, last), last])];
    for (const pos of posList) {
      const si = route[pos];
      tap(`step ${tag} step ${pos + 1}: the step button`, `caFocusGo(${J(F)}, ${si})`, 0);
      tap(`gotit ${tag} step ${pos + 1}: Got it`, `caFocusGotIt(${J(F)}, ${si})`, pos === last ? 1 : 0);
    }
    if (place === 'today') {
      // A second pass over steps already done: Got it just moves on (the last one unticks, and falls back).
      tap(`back ${tag}: back to step 1`, `caFocusGo(${J(F)}, ${route[0]})`, 0);
      for (let pos = 0; pos < route.length; pos++) tap(`again ${tag} step ${pos + 1}: Got it on a done step`, `caFocusGotIt(${J(F)}, ${route[pos]})`, pos === last ? 1 : 0);
    }
  }
}
/* Fall-backs and audio, on ca-21 (or --only) in Today and in the Unfinished fold, both languages. */
const FB = ONLY || 'ca-21';
for (const lang of ['en', 'es']) for (const place of ['today', 'todo']) {
  const tag = `${FB} ${lang} ${place}`;
  const route = () => run(`caRoute(CLASS_ACTIVITIES.find(a => a.id === ${J(FB)}))`);
  const fresh = () => { setUp(FB, place, lang, null); return route(); };
  let r = fresh();
  tap(`audio ${tag}: a tap while a snippet and a song play`, `caFocusGo(${J(FB)}, ${r[1]})`, 0,
    `snipState = { card: document.querySelector('.ca-card[open]'), audio: { pause(){}, removeAttribute(){}, load(){}, src: '' }, raf: 0, clicks: [] }; pcState = null;`);
  const st = run('[snipState === null, pcState === null]');
  if (!st[0]) { bad++; fails.push({ label: `audio ${tag}: the snippet was still playing after the tap`, problems: ['audio'] }); }
  r = fresh(); tap(`newday ${tag}: a new day since the render`, `caFocusGo(${J(FB)}, ${r[1]})`, 1, `__s.today = '2025-11-11'`);
  r = fresh(); tap(`student ${tag}: another student since the render`, `caFocusGo(${J(FB)}, ${r[1]})`, 1, `currentUser = { uid: 'test-1' }`);
  r = fresh(); tap(`lang ${tag}: a language switch with no render`, `caFocusGo(${J(FB)}, ${r[1]})`, 1, `setLang(${J(lang === 'en' ? 'es' : 'en')})`);
  r = fresh(); tap(`since ${tag}: a "Since your last visit" repaint pending`, `caFocusGo(${J(FB)}, ${r[1]})`, 1, `caSinceRepaint = true`);
  r = fresh(); tap(`twoopen ${tag}: another card open on the page`, `caFocusGo(${J(FB)}, ${r[1]})`, 1,
    `document.querySelector('.ca-card:not([open])').setAttribute('open', '')`);
  if (place === 'todo') { r = fresh(); tap(`foldshut ${tag}: the fold around the card closed`, `caFocusGo(${J(FB)}, ${r[1]})`, 1,
    `document.querySelector('.ca-card[open]').closest('.ca-todo-group').removeAttribute('open'); caTodoOpen = false`); }
  r = fresh(); tap(`merge ${tag}: CLASS_ACTIVITIES replaced`, `caFocusGo(${J(FB)}, ${r[1]})`, 1, `window.CLASS_ACTIVITIES = window.CLASS_ACTIVITIES.map(a => Object.assign({}, a))`);
  r = fresh(); tap(`finished ${tag}: the card finished elsewhere`, `caFocusGo(${J(FB)}, ${r[1]})`, 1, `classActivities[${J(FB)}] = true`);
  r = fresh(); tap(`other ${tag}: a step button on a card that is not the open one`, `caOpenId = null; caFocusGo(${J(FB)}, ${r[1]})`, 1);
}
const secs = ((Date.now() - t0) / 1000).toFixed(1);
if (unknownEntities.size) console.log(`  note: entities the small DOM left as written: ${[...unknownEntities].join(', ')}`);
if (strayEnds) console.log(`  note: ${strayEnds} end tag(s) with no open element (left out, the same in both pages)`);
for (const f of fails) {
  console.log(`✗ ${f.label}: ${f.problems.join('; ')}`);
  if (f.diff) console.log(VERBOSE ? `    redrawn: …${f.diff.a}…\n    full:    …${f.diff.b}…` : `    first difference at character ${f.diff.at}: redrawn "${f.diff.a.slice(150, 260)}" / full "${f.diff.b.slice(150, 260)}"`);
}
const kinds = Object.entries(byKind).map(([k, v]) => `${k} ${v.same}/${v.taps}`).join(', ');
if (bad || !taps || !redrawn || changed < taps / 2) {
  console.log(`✗ focus-tap-diff: ${same} of ${taps} taps identical to a full render (${bad} failed; ${redrawn} redrawn alone, ${fellBack} fell back; ${changed} changed the open card, at least half must) over ${focusIds.length} Focus activities, ${walked} set-ups, ${secs} s. By kind: ${kinds}`);
  process.exit(1);
}
console.log(`✓ focus-tap-diff: ${same} of ${taps} taps identical to a full render, byte for byte (${redrawn} redrawn the open card alone, ${fellBack} fell back as expected; ${changed} changed the open card) over ${focusIds.length} Focus activities, ${walked} set-ups in EN and ES, ${secs} s. By kind: ${kinds}`);
