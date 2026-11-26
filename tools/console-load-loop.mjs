#!/usr/bin/env node
/* console-load-loop.mjs — the teacher console when its two first reads fail, on a fake Firestore and a virtual clock
   (2026-11-25).

   Why: "the console recovers by itself after a failed load" went through three review rounds, and each round found a
   new MAJOR by hand, because nothing played a failed read. This plays them: the class-settings read (config/class)
   and the student-progress read (the progress collection) fail and come back on a schedule, while a teacher clicks
   views, hides the tab, types, drags, and a second console writes config/class.

     node tools/console-load-loop.mjs                       160 cases, seed 1 (about 15-30 s)
     node tools/console-load-loop.mjs --seed S --cases N     another seed / count
     node tools/console-load-loop.mjs --case K --verbose     replay ONE case: every event, read, write and check
     --family F     only that family (names below)            --root DIR    another site folder (a break-it copy)
     --stall S      the watchdog's limit, seconds (default 120)
     --no-outage    the self-test: the same cases on a network that never fails; every case must hold (no false alarm)
   Exit 0: every invariant held in every case (and the coverage floors were met). 1: a failed invariant (each prints
   its case, its finding id and its replay command) or a coverage floor missed. 2: the tool itself broke.
   3: the watchdog: no step for --stall seconds; it prints the step it was on.
   Run it after any change to the console's first load, its retry, the "student progress did not load" line, or what a
   view shows while the roster is missing (CLAUDE.md "Teacher console"); not in checks.mjs.

   WHAT IS REAL. One console: a vm context holding the site's scripts unchanged, in index.html's order: config-main.js,
   class-activities.js, i18n.js, guitar-diagrams.js, the app parts, practice-minutes, live-quiz.js, then the whole
   console script (siteSource('teacher.js')), the module files when showTeacherApp asks for them, and index.html's
   <body> as its DOM. It boots through the real showTeacherApp, on the view an update reload's note names (the real
   teacherResumeApply). Every click goes through the console's own listeners: a sidebar button, Arrange board, Back
   to list, a list row, a Songs Preview, Refresh, and every write control on screen (fire(), section 6: the click,
   change or inline onclick the browser would run). The tab is hidden and shown through the real visibilitychange
   listener; the minute timer is the console's own setInterval on the virtual clock. Nothing in the console is edited.
   STUBBED: Firestore (`db`, section 5); confirm() answers OK, alert() is recorded, prompt() answers nothing; no
   network, no audio. The second console is the server writing config/class itself, with configVersion moved on by
   one, as a second console's teacherWriteConfig does (no second vm).

   WHAT IS VARIED (section 7). Twenty families of cases, in turn: persist (one outage kind — settings, progress or
   both — from boot until a heal at 3-6 min), flip (the state drawn again every 30 s for 6 min), r31 (progress down for
   5 min and ONE settings failure in minute 1 or 2, booted on a settings view), r33 (progress down, settings good,
   booted on a settings view; the second console dates and hides every card at 15-25 s; a write click 62-75 s; a click
   1-120 ms after each background settings read lands; a box typed in while the first retry after the heal is out),
   storm (an outage, the tab hidden every 5 s and shown 2.5 s later, for a minute; every other storm hides it from
   50 s to 170 s instead), healthy (a good boot, outages from
   90 s), empty (a GOOD class with no students and no settings doc, or an empty one), live (booted on Live In-Class
   Games mid-game after an update reload, during an outage), detail (a card's page from the update reload's note,
   progress down; a Hidden click lands on top of the other console's change and its follow-up settings read fails, so
   the page is drawn from the failed copy; a tab return then starts the retry, with a click right after its read).
   Review R4 added eleven: early (slow reads, 250-700 ms; a view clicked 0.2-1.2 s in, while the first load is out,
   sometimes while the module files load too; both reads down for 1.5-3.5 s, then progress), early2 (the same with
   only progress down), midload (module files 300 ms; a view clicked while they load), summary (Skills Overview and
   a class-period change, progress down), livelist (booted on Live In-Class Games with the settings read down, then a
   Remove / Restore / move in its games list), games2 (Games with progress down: the class games switch must be
   offered), failedread (a loaded console whose settings read fails for 25 s; on a card's page: Refresh, a write, a
   tab return 15 s later that repaints the Students pane from the copy in hand; on the list: a write whose follow-up
   read fails, a list filter, a tab return; then Songs, Teacher view songs or Live In-Class Games, with write
   clicks), chaos (both reads flipping every 2-20 s for 6 min under random views, writes, sub-screens, hides and
   Refresh), slowprog (a progress read that takes 2-6 s, the settings fast; Manage, Games, Songs, Class activities,
   Skills Overview, Students or Practice minutes opened while it is out, in turn, then a Who picker, Arrange board, a
   list row or a filter, and a write click; it lands, or every third case fails) and cfgfirst (the settings read
   fails first, for 10-25 s, and the progress read is slow: booted on a roster or settings view with no click until
   the minute timer's retry, or booted on Live In-Class Games, Mic recordings' own read bringing the settings back,
   then a roster view opened) and landwrite (a card's page or the list with progress down for 10-25 s, every latency
   60 ms; a write click 60 ms before the retry's slow progress read lands, so the view's own read waits for it).
   Each case also draws the view it boots on (all 16, and the three Class activities screens), views clicked, Arrange
   board, Back to list, a list row, a Songs Preview, a Who picker opened, the tab hidden and shown, a box typed in or
   a card dragged for 10-90 s, the second console's writes (dates, Hidden, Optional, Play Along, Keep in Today, pins,
   games, periods, pauses, Open through, Who, gate clears), and write clicks on whatever write control is on screen.
   The network always heals at the end, and the 130 s after the heal have no click, no hidden tab and no typing (the
   recovery check below). Events a read or a commit queues (the clicks right after a read) run at their time.

   WHAT IS ASSERTED (each failure carries its finding id; the brief's invariants 1-5). The checks run after each event
   once its reads land, and also every 50 ms while they are out, and every 50 ms of the boot while its reads are out
   (the load window is on screen, and clickable, that long: review R4-1).
     R3-1  the screen matches the reads: no "Could not read the class settings" line while no settings read is out and
           the console's newest one was good; "Could not load student data" only after a progress read failed (not
           when the settings read failed first), also while a read is out; and once no read is out, no roster line
           ("Could not load student data" / "the student list") and no "Student progress did not load" note while
           the roster is loaded, and a note that says the class settings loaded only while they did. And recovery:
           125 s after the heal, with no click, a view that reads the roster (or the class settings) shows the roster
           loaded, no failure line and no note; a tool view is drawn (not index.html's "Loading student data…").
     R3-2  while the roster is missing (its first read still out, or it failed to load): no roster fact in the view —
           no count of students, accounts or done/turned-in, no "No students yet" / "No student data yet", no "not in
           the roster", no "would be locked out", no "Every roster account is", no "who hasn't finished" — and no control
           computed from the roster: a student's row buttons (games, period, pause, archive, Open through, Clear,
           Clear all, More…), a Who tick box, Open for all, Allow all in CAS, a roster account's Allowed / Locked out
           or a stray's Remove; no number in the Skills Overview summary strip; and no "Everyone is already open"
           alert.
     R3-3  a background read never moves the config copy without a redraw: (a) after a settings read made by the first
           load or its retry lands, by the time the console is quiet every write control on screen was drawn from
           that copy or one at least as new, and a click 1-120 ms after such a read is on such a control; (b) a write
           whose control was drawn before a second-console change it touches is refused ("Nothing was saved"), never
           committed, when a first-load / retry read moved the copy past that change (or no read did). When a write's
           own follow-up read or a view's read moved it, the write is counted ("stale-control writes outside this
           tool") and not failed: a healthy console does the same today (main d8ca4e2, --no-outage, seed 1 case 122:
           a card page's Hidden after a Clear).
     R2-reads  bounded reads (the brief's invariant 4): in any 60 s with the outage unchanged for the 60 s before and
           no click, the console makes at most 6 settings + progress reads while visible (4 retries, one every 15 s at
           most, one read each, plus one redraw read when the settings come back) and NONE while hidden; never two
           progress reads, nor two first-load settings reads, out at once; while the roster is down on a view that
           reads it, with the tab visible, the minute timer is running or a read is out (the retry never stops).
     R2-busy   a retry that lands while the teacher types is thrown away: the box typed in is never drawn over.
     R1-dead   no view left on a "Loading…" line with nothing left to run.
     R1-empty  a GOOD but empty class never shows a failure line or the note.
     R1-live   on Live In-Class Games the stage (#lq-stage) is always there and is never replaced while the view stays.
     R4-1      "Student progress did not load" / "Loading student progress" only while the roster is missing, and
               "Loading student progress" not once a progress read failed (a view drawn while loading is drawn again).
     R4-failedcopy  no write control, no Live games list button and no Class activities list row drawn from a FAILED
               settings read is on screen once the console is quiet (a view drawn from the empty copy it leaves).
     R4-archived  an archived student never comes back into the roster the views draw from after a failed settings read.
     R4-games  during a progress outage with the settings read good, Games still offers the class games On / Off switch.
     page-error   anything the console logs through console.error or throws.
   COVERAGE FLOORS (a full run, 64+ cases, no --family): every family ran; 40+ write clicks reached the server; 4+
   window clicks fired; 200+ checks ran with the roster down on a view that draws without it; 30+ recovery checks;
   5+ Who pickers opened; 3+ card pages kept over a failed read when a retry starts; 3+ boxes typed in during a retry;
   100+ checks while the first progress read was out; 3+ minutes measured with the tab hidden throughout.

   NOT COVERED: anything a browser adds (layout, CSS: a pane hidden by CSS counts as on screen here; focus moves;
   real event order); the update reload itself (the resume note is set, the reload is not played); a settings read
   that fails AFTER the roster has loaded, on a view with no retry (Games, Manage, Songs, Mic, the board's cached
   repaint): that view waits for a click or Refresh, as before (asserted for the R3-1 line consistency and R4-failedcopy,
   not for recovery); the sidebar's activity tree and the Live games picker drawn from a failed copy (no write
   control); a stale control written after a write's own follow-up read (R3-3 above); more than one console in a vm
   (the second console is the server); students writing their own docs
   during a case; the Delete dialog (tools/remove-one-sim.mjs); the write race between two real consoles
   (tools/two-consoles-loop.mjs). The latencies (8-78 ms, 15% of calls 120-600 ms) are guesses. Made-up data only:
   12 students "Test Student 01" … at example.test, a made-up teacher address. */
import vm from 'node:vm';
import { AsyncLocalStorage } from 'node:async_hooks';
import { spawn } from 'node:child_process';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteSource } from './site-src.mjs';

const TOOL = fileURLToPath(import.meta.url);
const REPO = join(dirname(TOOL), '..');
const ARGV = process.argv.slice(2);
const flag = n => ARGV.includes(n);
const opt = (n, d) => { const i = ARGV.indexOf(n); if (i >= 0 && i + 1 < ARGV.length) return ARGV[i + 1]; const eq = ARGV.find(a => a.startsWith(n + '=')); return eq ? eq.slice(n.length + 1) : d; };

/* ════════════════════════════════════════════════════════════════════════
   0. The watchdog (as tools/two-consoles-loop.mjs): the run happens in a
   child process; this parent passes its output through and listens for a
   heartbeat. No heartbeat for --stall seconds → print the step, kill the
   child, exit 3.
   ════════════════════════════════════════════════════════════════════════ */
if (!process.env.CONSOLE_LOAD_CHILD) {
  const stall = Number(opt('--stall', 120)) * 1000;
  const child = spawn(process.execPath, [TOOL, ...ARGV], { stdio: ['ignore', 'inherit', 'inherit', 'ipc'], env: { ...process.env, CONSOLE_LOAD_CHILD: '1' } });
  let beat = Date.now(), step = 'starting';
  child.on('message', m => { beat = Date.now(); if (m && m.step) step = m.step; });
  const iv = setInterval(() => {
    if (Date.now() - beat > stall) {
      clearInterval(iv);
      process.stderr.write(`console-load-loop: ✗ HUNG — no step for ${Math.round(stall / 1000)} s. Stuck at "${step}"\n`);
      try { child.kill('SIGKILL'); } catch { /* gone */ }
      process.exit(3);
    }
  }, 1000);
  child.on('exit', (code, sig) => { clearInterval(iv); process.exit(code === null ? (sig ? 1 : 0) : code); });
} else {
  // After the whole module has been evaluated (main uses bindings declared further down).
  setImmediate(() => main().catch(e => { console.error('console-load-loop: tool error —', e && e.stack || e); process.exit(2); }));
}
let lastBeatSent = 0;
function heartbeat(step, force) {
  const now = Date.now();
  if (!force && now - lastBeatSent < 250) return;
  lastBeatSent = now;
  if (process.send) process.send({ step });
}

/* ════════════════════════════════════════════════════════════════════════
   1. A small DOM, copied from tools/two-consoles-loop.mjs (section 1) with
   two additions: listeners are kept, so this tool can dispatch a click, a
   change or visibilitychange through the console's own listeners (fire(),
   section 6), and every element carries the config copy it was drawn from
   (_born). innerHTML is parsed into a real tree, so querySelector, closest,
   dataset, isConnected and textContent answer what a browser would. No
   layout (every box is 0×0).
   ════════════════════════════════════════════════════════════════════════ */
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
  // Listeners are kept (this tool dispatches clicks, changes and visibilitychange through them; see fire()).
  addEventListener(type, fn) { if (typeof fn !== 'function') return; const m = this._ls || (this._ls = new Map()); const a = m.get(type) || []; if (!a.includes(fn)) a.push(fn); m.set(type, a); }
  removeEventListener(type, fn) { const a = this._ls && this._ls.get(type); if (a) { const i = a.indexOf(fn); if (i >= 0) a.splice(i, 1); } }
  dispatchEvent() { return true; }
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
  select() {} click() {} scrollIntoView() {} scrollTo() {} scrollBy() {} play() { return Promise.resolve(); } pause() {} load() {} getContext() { return null; }
  showModal() { this.open = true; } show() { this.open = true; } close() { this.open = false; }
  animate() { return { finished: Promise.resolve(), cancel() {}, finish() {}, onfinish: null }; }
  getBoundingClientRect() { return { top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0 }; }
  getClientRects() { return this.isConnected ? [this.getBoundingClientRect()] : []; }
  get offsetWidth() { return 0; } get offsetHeight() { return 0; } get offsetTop() { return 0; } get offsetLeft() { return 0; }
  get clientWidth() { return 0; } get clientHeight() { return 0; } get scrollHeight() { return 0; } get scrollWidth() { return 0; }
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
  createElement(t) { const el = new MElement(this, String(t)); el._born = this.stampNow ? this.stampNow() : null; return el; }
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
  // Every element made here is stamped with the console's config copy at this moment (section 6, stampNow): what it was drawn from.
  const stamp = doc.stampNow ? doc.stampNow() : null;
  const re = /<!--[\s\S]*?-->|<![^>]*>|<\/([a-zA-Z][\w:-]*)\s*>|<([a-zA-Z][\w:-]*)((?:\s+[^\s"'>\/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*(\/?)>/g;
  let last = 0, m;
  const text = s => { if (!s) return; const t = new MText(doc, decodeEnt(s)); const top = stack[stack.length - 1]; t.parentNode = top; top.childNodes.push(t); };
  while ((m = re.exec(html))) {
    if (m.index > last) text(html.slice(last, m.index));
    last = re.lastIndex;
    if (m[0][1] === '!') continue;
    if (m[1]) { const t = m[1].toLowerCase(); for (let i = stack.length - 1; i > 0; i--) if (stack[i].localName === t) { stack.length = i; break; } continue; }
    const t = m[2].toLowerCase(), el = new MElement(doc, t);
    el._born = stamp;
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

/* ════════════════════════════════════════════════════════════════════════
   2. The virtual clock. One per case, shared by the console and the
   fake server. Timers fire in (time, creation order); after each one every
   promise reaction runs before the next timer, as in a browser.
   ════════════════════════════════════════════════════════════════════════ */
const ALS = new AsyncLocalStorage();
class VClock {
  constructor() { this.now = 0; this.seq = 0; this.q = []; this.cancelled = new Set(); }
  add(delay, fn, meta) {
    const id = ++this.seq, at = this.now + Math.max(0, Number(delay) || 0);
    const t = { id, at, fn, meta: meta || {}, run: AsyncLocalStorage.snapshot() };
    let lo = 0, hi = this.q.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; const x = this.q[mid]; if (x.at < at || (x.at === at && x.id < id)) lo = mid + 1; else hi = mid; }
    this.q.splice(lo, 0, t);
    return id;
  }
  cancel(id) { const i = this.q.findIndex(t => t.id === id); if (i >= 0) this.q.splice(i, 1); }
  sleep(ms, meta) { return new Promise(r => this.add(ms, r, meta)); }
  pending(filter) { return this.q.filter(filter || (() => true)); }
}
const flushMicrotasks = () => new Promise(r => setImmediate(r));
Error.stackTraceLimit = 50;

/* ════════════════════════════════════════════════════════════════════════
   3. Seeded randomness (mulberry32). Each schedule has its own stream,
   worked out from (--seed, schedule index), so one schedule replays alone.
   ════════════════════════════════════════════════════════════════════════ */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashSeed(seed, k, salt) { let h = 2166136261 ^ salt; for (const c of String(seed) + ':' + k) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function makeRng(seed, k, salt) {
  const r = mulberry32(hashSeed(seed, k, salt || 0));
  const rng = () => r();
  rng.int = (a, b) => a + Math.floor(r() * (b - a + 1));
  rng.pick = arr => arr[Math.floor(r() * arr.length)];
  rng.chance = p => r() < p;
  rng.shuffle = arr => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  return rng;
}

/* ════════════════════════════════════════════════════════════════════════
   4. Plain data helpers shared by the server, the model and the checks.
   ════════════════════════════════════════════════════════════════════════ */
const isMap = v => v !== null && typeof v === 'object' && !Array.isArray(v) && !(v && v.__fieldValue);
function canon(v) {
  if (v === undefined) return 'undefined';
  if (v === null || typeof v !== 'object') return JSON.stringify(v);
  if (Array.isArray(v)) return '[' + v.map(canon).join(',') + ']';
  return '{' + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ':' + canon(v[k])).join(',') + '}';
}
// A deep copy with every map's keys in sorted order — what Firestore hands back.
function sortedClone(v) {
  if (v === null || typeof v !== 'object') return v;
  if (Array.isArray(v)) return v.map(sortedClone);
  const o = {}; Object.keys(v).sort().forEach(k => { o[k] = sortedClone(v[k]); }); return o;
}
function getPath(obj, path) {
  let cur = obj;
  for (const p of path.split('.')) { if (cur === null || typeof cur !== 'object' || !Object.prototype.hasOwnProperty.call(cur, p)) return undefined; cur = cur[p]; }
  return cur;
}
// Every leaf of a doc (a map is walked; an array, a scalar or an EMPTY map is a leaf).
function leaves(obj, prefix, out) {
  out = out || new Map();
  Object.keys(obj || {}).forEach(k => {
    const p = prefix ? prefix + '.' + k : k, v = obj[k];
    if (isMap(v) && Object.keys(v).length) leaves(v, p, out); else out.set(p, v);
  });
  return out;
}
function docDiff(a, b) {
  const la = leaves(a), lb = leaves(b), out = [];
  new Set([...la.keys(), ...lb.keys()]).forEach(p => { if (canon(la.get(p)) !== canon(lb.get(p))) out.push(p); });
  return out.sort();
}

/* ════════════════════════════════════════════════════════════════════════
   5. The fake Firestore. One in-memory store. Modelled: doc reads, collection
   reads (where '==' filters, the rest of a query is ignored), transactions
   (re-run on a conflict, up to 5 attempts, a throwing update function ends
   it), set with {merge:true} (nested maps merge, FieldValue.delete() removes),
   update, delete, the two live-game listeners (liveQuiz/current and its
   answers: one snapshot each), a seeded latency on every call. The planned
   OUTAGE: a read of config/class (a doc get or a transaction's get) fails with
   code 'unavailable' while the case's network says the settings are down; a
   read of the progress collection fails while it says progress is down.
   Every other read succeeds. NOT modelled: the SDK's cache and offline queue,
   security rules, batched writes, server timestamps.
   ════════════════════════════════════════════════════════════════════════ */
const DELETE = Object.freeze({ __fieldValue: 'delete' });
const BACKOFF = [0, 1000, 1500, 2250, 3375];
class FakeServer {
  constructor({ clock, rng, docs, netAt }) {
    this.clock = clock; this.rng = rng; this.netAt = netAt;
    this.docs = new Map(); this.ver = new Map();
    Object.keys(docs).forEach(p => { this.docs.set(p, JSON.parse(JSON.stringify(docs[p]))); this.ver.set(p, 1); });
    this.reads = []; this.inflight = 0; this.progInflight = 0; this.loadCfgInflight = 0; this.maxProgInflight = 0; this.maxLoadCfgInflight = 0;
    const c0 = docs['config/class'] || {};
    this.history = [{ v: Number(c0.configVersion) || 0, by: 'seed', changed: [] }];
    this.commits = []; this.events = []; this.violations = [];
    this.onRead = null; this.onCommit = null; this.onIssue = null;
  }
  latency() { if (this.fixedLat) return this.fixedLat; const r = this.rng(); return r < 0.85 ? 8 + Math.floor(this.rng() * 70) : 120 + Math.floor(this.rng() * 480); }
  log(text) { this.events.push({ t: this.clock.now, text }); }
  down(kind) { const s = this.netAt(this.clock.now); return kind === 'cfg' ? !!s.cfg : kind === 'prog' ? !!s.prog : false; }
  unavailable(what) { return Object.assign(new Error('fake server: ' + what + ' is unavailable (the planned outage)'), { code: 'unavailable' }); }
  snap(path) { const ex = this.docs.has(path); return { exists: ex, data: ex ? sortedClone(this.docs.get(path)) : undefined, ver: this.ver.get(path) || 0 }; }
  version(path) { return this.ver.get(path) || 0; }
  async read(path, who) {
    const rec = { i: this.reads.length, kind: path === 'config/class' ? 'cfg' : 'doc', path, t0: this.clock.now, t1: null, ok: null, load: who.load, done: false };
    this.reads.push(rec); this.inflight++;
    if (rec.kind === 'cfg' && rec.load) { this.loadCfgInflight++; this.maxLoadCfgInflight = Math.max(this.maxLoadCfgInflight, this.loadCfgInflight); }
    try {
      await this.clock.sleep(this.latency(), { kind: 'server' });
      const fail = rec.kind === 'cfg' && this.down('cfg');
      const s = fail ? null : this.snap(path);
      await this.clock.sleep(this.latency(), { kind: 'server' });
      rec.ok = !fail; rec.t1 = this.clock.now; rec.done = true;
      rec.v = s && s.exists ? Number(s.data.configVersion) || 0 : 0;
      this.log(`read ${path}${rec.load ? ' (first load / retry)' : ''}: ${fail ? 'FAILED (outage)' : 'ok' + (rec.kind === 'cfg' ? ' v' + rec.v : '')}`);
      if (this.onRead) this.onRead(rec);
      if (fail) throw this.unavailable(path);
      return s;
    } finally { this.inflight--; if (rec.kind === 'cfg' && rec.load) this.loadCfgInflight--; }
  }
  async query(prefix, who, filters) {
    const rec = { i: this.reads.length, kind: prefix === 'progress' ? 'prog' : 'col', path: prefix, t0: this.clock.now, t1: null, ok: null, load: who.load, done: false };
    this.reads.push(rec); this.inflight++;
    if (this.onIssue) this.onIssue(rec);
    if (rec.kind === 'prog') { this.progInflight++; this.maxProgInflight = Math.max(this.maxProgInflight, this.progInflight); }
    try {
      await this.clock.sleep(this.latency() + (rec.kind === 'prog' ? this.progExtra || 0 : 0), { kind: 'server' });
      const fail = rec.kind === 'prog' && this.down('prog');
      let out = fail ? null : [...this.docs.keys()].filter(k => k.startsWith(prefix + '/') && k.slice(prefix.length + 1).indexOf('/') < 0).sort().map(p => ({ path: p, ...this.snap(p) }));
      if (out) (filters || []).forEach(([f, op, v]) => { if (op === '==') out = out.filter(d => getPath(d.data || {}, f) === v); });
      await this.clock.sleep(this.latency(), { kind: 'server' });
      rec.ok = !fail; rec.t1 = this.clock.now; rec.done = true;
      this.log(`read ${prefix}/*${rec.load ? ' (first load / retry)' : ''}: ${fail ? 'FAILED (outage)' : out.length + ' docs'}`);
      if (this.onRead) this.onRead(rec);
      if (fail) throw this.unavailable(prefix);
      return out;
    } finally { this.inflight--; if (rec.kind === 'prog') this.progInflight--; }
  }
  // set(…, {merge:true}) as Firestore does it (tools/two-consoles-loop.mjs, section 5).
  merge(dst, src) {
    const setsSomething = v => isMap(v) && Object.keys(v).length ? Object.keys(v).some(k => setsSomething(v[k])) : v !== DELETE;
    Object.keys(src).forEach(k => {
      const v = src[k];
      if (v === DELETE) delete dst[k];
      else if (isMap(v) && Object.keys(v).length) { if (!isMap(dst[k])) { if (!setsSomething(v)) return; dst[k] = {}; } this.merge(dst[k], v); }
      else dst[k] = v && v.__fieldValue ? null : JSON.parse(JSON.stringify(v === undefined ? null : v));
    });
    return dst;
  }
  write(path, data, mode, who) {
    if (path.startsWith('progress/')) { this.violations.push(`the console wrote ${path} (${mode})`); return; }
    if (path === 'config/class' && mode !== 'tx') { this.violations.push(`a bare ${mode} on config/class`); return; }
    if (mode === 'delete') this.docs.delete(path);
    else { const cur = this.docs.get(path) || {}; this.docs.set(path, mode === 'set' ? this.merge({}, data) : this.merge(JSON.parse(JSON.stringify(cur)), data)); }
    this.ver.set(path, this.version(path) + 1);
    this.log(`${who} ${mode} ${path}`);
  }
  // The second console: config/class moved on by one, as its teacherWriteConfig does.
  external(patch) {
    const before = sortedClone(this.docs.get('config/class') || {});
    const v = (Number(before.configVersion) || 0) + 1;
    const next = this.merge(JSON.parse(JSON.stringify(before)), Object.assign({}, patch, { configVersion: v }));
    this.docs.set('config/class', next); this.ver.set('config/class', this.version('config/class') + 1);
    const changed = docDiff(before, next).filter(p => p !== 'configVersion');
    this.history.push({ v, by: 'B', changed, t: this.clock.now });
    this.log(`the second console wrote config/class → v${v} (${changed.length} cells)`);
  }
  async transaction(fn, who) {
    this.txInflight = (this.txInflight || 0) + 1;
    try { return await this.transaction1(fn, who); } finally { this.txInflight--; }
  }
  async transaction1(fn, who) {
    for (let attempt = 1; attempt <= 5; attempt++) {
      if (attempt > 1) await this.clock.sleep(Math.round(BACKOFF[attempt - 1] * (0.5 + this.rng())), { kind: 'server' });
      const reads = new Map(), writes = [];
      let readCV = null;
      const t = {
        get: async ref => {
          await this.clock.sleep(this.latency(), { kind: 'server' });
          if (ref.path === 'config/class' && this.down('cfg')) throw this.unavailable('config/class (in a transaction)');
          const s = this.snap(ref.path); reads.set(ref.path, s.ver);
          if (ref.path === 'config/class') readCV = s.exists ? Number(s.data.configVersion) || 0 : 0;
          await this.clock.sleep(this.latency(), { kind: 'server' });
          return makeSnap(ref, s);
        },
        set: (ref, data, o) => { writes.push({ path: ref.path, data, merge: !!(o && o.merge) }); return t; },
        update: (ref, data) => { writes.push({ path: ref.path, data, merge: true }); return t; },
        delete: ref => { writes.push({ path: ref.path, del: true }); return t; }
      };
      let result;
      try { result = await fn(t); }
      catch (e) { this.log(`transaction by ${who.label}: the update function threw — ${e && e.message}`); throw e; }
      await this.clock.sleep(this.latency(), { kind: 'server' });
      if (writes.some(w => w.path === 'config/class') && this.down('cfg')) throw this.unavailable('config/class (the commit)');
      const stale = [...reads].filter(([p, v]) => this.version(p) !== v);
      if (stale.length) { this.log(`transaction by ${who.label}: commit refused (changed since read), attempt ${attempt}`); continue; }
      const before = sortedClone(this.docs.get('config/class') || {});
      writes.forEach(w => {
        if (w.del) { this.docs.delete(w.path); this.ver.set(w.path, this.version(w.path) + 1); return; }
        if (w.path.startsWith('progress/')) { this.violations.push(`a transaction wrote ${w.path}`); return; }
        const cur = this.docs.get(w.path) || {};
        this.docs.set(w.path, w.merge ? this.merge(JSON.parse(JSON.stringify(cur)), w.data) : this.merge({}, w.data));
        this.ver.set(w.path, this.version(w.path) + 1);
      });
      if (writes.some(w => w.path === 'config/class')) {
        const after = sortedClone(this.docs.get('config/class') || {});
        const v = Number(after.configVersion) || 0;
        const c = { t: this.clock.now, by: who.label, ctrl: who.ctrl, readCV, v, patch: writes.filter(w => w.path === 'config/class').map(w => w.data), changed: docDiff(before, after).filter(p => p !== 'configVersion') };
        this.commits.push(c); this.history.push({ v, by: who.label, changed: c.changed, t: c.t });
        this.log(`transaction by ${who.label}: COMMITTED config/class → v${v}`);
        if (this.onCommit) this.onCommit(c);
      }
      await this.clock.sleep(this.latency(), { kind: 'server' });
      return result;
    }
    throw Object.assign(new Error('fake server: transaction failed after 5 attempts'), { code: 'aborted' });
  }
}
function makeSnap(ref, s) {
  return { exists: s.exists, id: ref.path.split('/').pop(), ref, data: () => s.exists ? s.data : undefined, get: k => s.exists ? getPath(s.data, k) : undefined };
}
const qResult = (server, list, ref) => { const docs = list.map(d => makeSnap(ref(d.path), d)); return { docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) }; };
// The `db` the console sees. A read made inside loadAllStudents (the first load and its retries) is marked `load`, by the
// call stack (V8 keeps the awaiting caller in it); a write carries the control it was clicked on (the ALS store).
function makeDb(server, label) {
  const who = () => ({ label, load: /\bloadAllStudents\b/.test(new Error().stack), ctrl: ALS.getStore() || null });
  const docRef = path => ({
    path, id: path.split('/').pop(),
    get: () => { const w = who(); return server.read(path, w).then(s => makeSnap(docRef(path), s)); },
    set: (data, o) => { server.write(path, data, o && o.merge ? 'merge' : 'set', label); return Promise.resolve(); },
    update: data => { server.write(path, data, 'merge', label); return Promise.resolve(); },
    delete: () => { server.write(path, null, 'delete', label); return Promise.resolve(); },
    collection: n => colRef(path + '/' + n),
    onSnapshot: (cb, err) => {
      let live = true;
      server.clock.add(server.latency(), () => { if (live && typeof cb === 'function') cb(makeSnap(docRef(path), server.snap(path))); }, { kind: 'server' });
      return () => { live = false; };
    }
  });
  const colRef = (path, filters) => {
    const q = {
      path, doc: id => docRef(path + '/' + id),
      where: (f, op, v) => colRef(path, (filters || []).concat([[String(f), op, v]])), orderBy: () => q, limit: () => q, startAfter: () => q, endBefore: () => q,
      get: () => { const w = who(); return server.query(path, w, filters).then(list => qResult(server, list, docRef)); },
      add: data => { const id = 'auto-' + (server.events.length + 1); server.write(path + '/' + id, data, 'set', label); return Promise.resolve(docRef(path + '/' + id)); },
      onSnapshot: (cb) => {
        let live = true;
        server.clock.add(server.latency(), () => { if (live && typeof cb === 'function') cb(qResult(server, [], docRef)); }, { kind: 'server' });
        return () => { live = false; };
      }
    };
    return q;
  };
  return { collection: n => colRef(n), doc: p => docRef(p), runTransaction: fn => server.transaction(fn, who()), batch: () => { throw new Error('fake server: batch writes are not modelled'); } };
}

/* ════════════════════════════════════════════════════════════════════════
   6. The console: one vm context with the site's own scripts (as
   tools/two-consoles-loop.mjs section 6), plus live-quiz.js. Stubbed: `db`,
   confirm() (OK), alert() (recorded), prompt() (nothing). fire() plays a
   browser event: the target's inline on<type> handler, then every listener on
   it and on each ancestor up to the document.
   ════════════════════════════════════════════════════════════════════════ */
let SITE = null;
function compileSite(root) {
  const S = (file, text) => new vm.Script(text, { filename: file });
  const read = f => readFileSync(join(root, f), 'utf8');
  const scripts = [S('(made-up firebase-config)', "var TEACHER_EMAIL = 'teacher@example.test';")];
  for (const f of ['config-main.js', 'class-activities.js', 'i18n.js', 'guitar-diagrams.js']) scripts.push(S(f, read(f)));
  scripts.push(S('app (all parts)', siteSource('app.js', root)));
  for (const f of ['practice-minutes-config.js', 'practice-minutes.js', 'live-quiz.js']) if (existsSync(join(root, f))) scripts.push(S(f, read(f)));
  scripts.push(S('console (all teacher-*.js parts)', siteSource('teacher.js', root)));
  const modules = {};
  readdirSync(root).filter(f => /^module-\d+\.js$/.test(f)).forEach(f => { modules[/\d+/.exec(f)[0]] = S(f, read(f)); });
  const html = read('index.html');
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  if (!body) throw new Error('index.html has no <body>');
  return { root, scripts, modules, bodyHtml: body[1].replace(/<script\b[\s\S]*?<\/script>/gi, '') };
}
function makeConsole(W) {
  const clock = W.clock, doc = new MDocument();
  parseInto(doc.body, SITE.bodyHtml);
  const C = { doc, alerts: [], errors: [], ctx: null };
  const store = () => { const d = new Map(); return { getItem: k => d.has(String(k)) ? d.get(String(k)) : null, setItem: (k, v) => { d.set(String(k), String(v)); }, removeItem: k => { d.delete(String(k)); }, clear: () => d.clear(), key: i => [...d.keys()][i] ?? null, get length() { return d.size; } }; };
  const meta = { kind: 'console' };
  const intervals = new Map(); let ivSeq = 0;
  const rnd = makeRng(W.seed, W.k, 3);
  const BASE = W.baseTime;
  const fmts = new Map();
  const fmt = (loc, o, d) => { const key = JSON.stringify([loc, o]); let f = fmts.get(key); if (!f) fmts.set(key, f = new Intl.DateTimeFormat(loc, o)); return f.format(d); };
  const hasDate = o => o && ['year', 'month', 'day', 'weekday', 'dateStyle'].some(k => k in o), hasTime = o => o && ['hour', 'minute', 'second', 'timeStyle'].some(k => k in o);
  class VDate extends Date {
    constructor(...a) { if (a.length === 0) super(BASE + clock.now); else super(...a); }
    static now() { return BASE + clock.now; }
    toLocaleDateString(loc, o) { return hasDate(o) && !hasTime(o) ? fmt(loc, o, this) : super.toLocaleDateString(loc, o); }
    toLocaleTimeString(loc, o) { return hasTime(o) && !hasDate(o) ? fmt(loc, o, this) : super.toLocaleTimeString(loc, o); }
  }
  const pageError = (what, e) => C.errors.push({ t: clock.now, msg: what + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e)) });
  const ctx = {
    console: { log() {}, info() {}, debug() {}, warn() {}, error: (...a) => pageError('console.error', a.map(x => x && x.stack ? x.stack : String(x)).join(' ')) },
    document: doc, localStorage: store(), sessionStorage: store(),
    location: { search: '?teacher=true', hostname: 'localhost', host: 'localhost', origin: 'http://localhost', protocol: 'http:', pathname: '/index.html', hash: '', href: 'http://localhost/index.html?teacher=true',
      reload() {}, replace() {}, assign() {} },
    history: { scrollRestoration: 'auto', state: null, length: 1, replaceState() {}, pushState() {}, back() {} },
    navigator: { userAgent: 'console-load-loop', platform: 'node', language: 'en', languages: ['en'], onLine: true, maxTouchPoints: 0, clipboard: { writeText: () => Promise.resolve() } },
    setTimeout: (fn, ms, ...args) => clock.add(ms, () => { if (typeof fn === 'function') fn(...args); }, meta),
    clearTimeout: id => { if (typeof id === 'number') clock.cancel(id); },
    // An interval runs outside any click's context (a write it makes is not that click's).
    setInterval: (fn, ms) => { const iv = ++ivSeq; const arm = () => intervals.set(iv, clock.add(Math.max(Number(ms) || 0, 1), () => { arm(); fn(); }, { kind: 'interval', noAls: true })); ALS.exit(arm); return 'iv' + iv; },
    clearInterval: x => { const k = Number(String(x || '').slice(2)); if (intervals.has(k)) { clock.cancel(intervals.get(k)); intervals.delete(k); } },
    requestAnimationFrame: fn => clock.add(16, () => fn(clock.now), meta), cancelAnimationFrame: id => clock.cancel(id),
    requestIdleCallback: fn => clock.add(1, () => fn({ timeRemaining: () => 10, didTimeout: false }), meta), cancelIdleCallback: id => clock.cancel(id),
    queueMicrotask, structuredClone,
    alert: m => { C.alerts.push({ t: clock.now, msg: String(m), ctrl: ALS.getStore() || null }); },
    confirm: () => true, prompt: () => null, open: () => null, print() {}, focus() {}, blur() {},
    matchMedia: () => ({ matches: false, media: '', addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
    getComputedStyle: el => ({ getPropertyValue: () => '', display: (el && el._style && el._style.display) || '' }),
    getSelection: () => ({ isCollapsed: true, rangeCount: 0, anchorNode: null, removeAllRanges() {}, toString: () => '' }),
    CSS: { escape: s => String(s).replace(/[^\w-]/g, c => '\\' + c), supports: () => false },
    fetch: () => Promise.reject(new Error('no network')),
    Image: class { constructor() { this.onload = null; } }, Audio: class { play() { return Promise.resolve(); } pause() {} load() {} addEventListener() {} removeEventListener() {} },
    AudioContext: undefined, webkitAudioContext: undefined,
    MutationObserver: class { observe() {} disconnect() {} takeRecords() { return []; } }, ResizeObserver: class { observe() {} unobserve() {} disconnect() {} }, IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    Event: class { constructor(t, o) { this.type = t; Object.assign(this, o || {}); } preventDefault() {} stopPropagation() {} },
    CustomEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o || {}); } preventDefault() {} stopPropagation() {} },
    KeyboardEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o || {}); } }, MouseEvent: class { constructor(t, o) { this.type = t; Object.assign(this, o || {}); } },
    HTMLElement: MElement, Element: MElement, Node: MNode, HTMLInputElement: MElement, HTMLSelectElement: MElement, HTMLTextAreaElement: MElement, HTMLDetailsElement: MElement,
    Blob: class { constructor(p) { this.parts = p; } }, URL, URLSearchParams, TextEncoder, TextDecoder, Date: VDate,
    performance: { now: () => clock.now, mark() {}, measure() {} },
    crypto: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(rnd() * 256); return a; }, randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, () => Math.floor(rnd() * 16).toString(16)) },
    addEventListener() {}, removeEventListener() {}, dispatchEvent() { return true; },
    scrollTo() {}, scroll() {}, scrollBy() {}, scrollX: 0, scrollY: 0, pageXOffset: 0, pageYOffset: 0, innerWidth: 1366, innerHeight: 657, outerWidth: 1366, outerHeight: 657, devicePixelRatio: 1,
    screen: { width: 1366, height: 768 }, name: '', isSecureContext: true
  };
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx; ctx.top = ctx; ctx.parent = ctx;
  vm.createContext(ctx);
  vm.runInContext('Math.random = __r; delete globalThis.__r;', Object.assign(ctx, { __r: () => rnd() }));
  doc.onScript = el => {
    const m = /^module-(\d+)\.js$/.exec(el.getAttribute('src') || '');
    clock.add(W.modMs || 1, () => {
      if (m && SITE.modules[m[1]]) { try { SITE.modules[m[1]].runInContext(ctx); } catch (e) { pageError('loading ' + el.getAttribute('src'), e); } if (typeof el.onload === 'function') el.onload(); }
      else if (typeof el.onerror === 'function') el.onerror(new Error('no network'));
    }, meta);
  };
  for (const s of SITE.scripts) { try { s.runInContext(ctx); } catch (e) { pageError('loading the site', e); } }
  ctx.firebase = { firestore: Object.assign(() => ctx.__db, {
    FieldValue: { delete: () => DELETE, serverTimestamp: () => ({ __fieldValue: 'serverTimestamp' }), increment: n => ({ __fieldValue: 'increment', n }) },
    FieldPath: { documentId: () => '__name__' },
    Timestamp: class { constructor(s, n) { this.seconds = s; this.nanoseconds = n; } toMillis() { return this.seconds * 1000; } static now() { return new this(Math.floor((BASE + clock.now) / 1000), 0); } static fromMillis(ms) { return new this(Math.floor(ms / 1000), 0); } }
  }) };
  // What the checks read (typeof-guarded: a tree from before this feature has none of the roster-failure names).
  vm.runInContext(`
    globalThis.__stamp = () => ({ cfg: teacherClassConfig, v: teacherConfigVersion, ok: teacherClassConfigReadOk });
    globalThis.__peek = () => ({ view: teacherView, studentsAt: teacherStudentsAt, failed: teacherRefreshFailed, refreshing: teacherRefreshing,
      timer: !!teacherAutoRefreshTimer, cfg: teacherClassConfig, v: teacherConfigVersion, ok: teacherClassConfigReadOk,
      board: activityBoardMode, screen: (typeof teacherActivityScreen === 'function' && teacherView === 'activities') ? teacherActivityScreen() : '',
      raw: allStudentsRaw.length, uids: allStudents.map(s => s.uid), showArch: teacherShowArchived, drag: typeof boardDragId !== 'undefined' ? boardDragId : null });
    globalThis.__setDrag = v => { boardDragId = v; };
    globalThis.__resume = n => { swResumeNote = n; };
  `, ctx);
  ctx.__db = makeDb(W.server, 'A');
  vm.runInContext('db = __db;', ctx);
  doc.stampNow = () => { try { return ctx.__stamp(); } catch { return null; } };
  C.ctx = ctx; C.peek = () => ctx.__peek(); C.pageError = pageError;
  // A browser event: the target's inline handler, then the listeners on it and on each ancestor, then the document's.
  C.fire = (target, type, init) => {
    let stopped = false;
    const ev = Object.assign({ type, target, bubbles: true, cancelable: true, defaultPrevented: false, key: '', preventDefault() { this.defaultPrevented = true; }, stopPropagation() { stopped = true; }, stopImmediatePropagation() { stopped = true; } }, init || {});
    const path = []; for (let n = target; n; n = n.parentNode) path.push(n);
    ev.composedPath = () => path.concat([ctx]);
    for (const n of path) {
      ev.currentTarget = n;
      const inline = n.nodeType === 1 && n.getAttribute('on' + type);
      if (inline) { try { vm.runInContext('(function(event){' + inline + '\n})', ctx).call(n, ev); } catch (e) { pageError('inline on' + type, e); } }
      for (const fn of ((n._ls && n._ls.get(type)) || []).slice()) { try { fn.call(n, ev); } catch (e) { pageError(type + ' listener', e); } }
      if (stopped) break;
    }
  };
  return C;
}

/* ════════════════════════════════════════════════════════════════════════
   7. The made-up class, and the cases.
   ════════════════════════════════════════════════════════════════════════ */
const STUDENTS = Array.from({ length: 12 }, (_, i) => {
  const n = String(i + 1).padStart(2, '0');
  return { uid: 'fake-uid-' + n, name: 'Test Student ' + n, email: 'student' + n + '@example.test', period: i < 5 ? '4' : i < 10 ? '7' : 'CAS' };
});
const UNITS = { 1: ['ca-8', 'ca-1', 'ca-2', 'ca-3'], 2: ['ca-10', 'ca-12', 'ca-13', 'ca-14', 'ca-41'], 3: ['ca-21', 'ca-22', 'ca-23', 'ca-11'], 0: ['ca-43'] };
const BOARD_IDS = Object.values(UNITS).flat();
function seedDocs(empty, emptyKind) {
  const docs = {};
  if (empty) { if (emptyKind === 'blank') docs['config/class'] = {}; return docs; }
  const board = {};
  Object.keys(UNITS).forEach(mn => UNITS[mn].forEach((id, i) => { board[id] = { module: Number(mn), pos: i + 1 }; }));
  const dates = { 'ca-8': '2026-11-02', 'ca-1': '2026-11-03', 'ca-2': '2026-11-04', 'ca-3': '2026-11-05', 'ca-10': '2026-11-06', 'ca-12': '2026-11-09', 'ca-13': '2026-11-10', 'ca-21': '2026-11-11', 'ca-11': '2026-11-13' };
  docs['config/class'] = { configVersion: 5, gamesEnabled: true, gameOverrides: {}, activityBoardSeeded: true, activityBoard: board, activityDates: dates,
    hiddenActivities: { 'ca-22': true }, optionalActivities: {}, archivedActivities: { 'ca-23': true }, deletedActivities: {},
    activityPins: ['ca-21', 'ca-10'], activityStudents: { 'ca-12': { 'fake-uid-03': true, 'fake-uid-07': true } },
    archived: { 'fake-uid-12': true }, paused: {}, periodOverrides: {}, moduleOpenThrough: {}, activityTitles: {}, playAlongActivities: {}, keepTodayActivities: {}, songLibrary: {}, classSongs: {} };
  STUDENTS.forEach((s, i) => {
    const done = {}; Object.keys(dates).forEach((id, k) => { if ((i * 7 + k * 3) % 5 < 3) done[id] = true; });
    docs['progress/' + s.uid] = { name: s.name, email: s.email, period: s.period, classActivities: done, caSteps: {}, exitChecks: {}, skills: {}, responses: {}, migrations: { swap45: true } };
  });
  // The allow list: one roster account and one that is not in the roster; one request waiting, one answered.
  docs['config/access'] = { allow: { 'fake-uid-02': true, 'fake-uid-stray': true } };
  docs['accessRequests/fake-uid-asker'] = { name: 'Test Asker', email: 'asker@example.test', status: 'asked', at: null };
  docs['accessRequests/fake-uid-03'] = { name: 'Test Student 03', email: 'student03@example.test', status: 'allowed', at: null };
  return docs;
}
const VIEWS = ['activities', 'students', 'skills', 'responses', 'trouble', 'games', 'manage', 'songs', 'minutes', 'livequiz', 'mic', 'reports', 'tsongs', 'errors', 'songrequests', 'songbuilder'];
const TOOL_VIEWS = ['livequiz', 'mic', 'reports', 'tsongs', 'errors', 'songrequests', 'songbuilder'];
const SETTINGS_VIEWS = ['activities', 'games', 'manage', 'songs'];
const usesRoster = v => !TOOL_VIEWS.includes(v);
const FAMILIES = ['persist', 'flip', 'r31', 'r33', 'storm', 'healthy', 'empty', 'live', 'detail', 'early', 'early2', 'midload', 'summary', 'livelist', 'games2', 'failedread', 'chaos', 'slowprog', 'cfgfirst', 'landwrite'];
const MIN = 60000, SEC = 1000;
const ST = { ok: { cfg: false, prog: false }, cfg: { cfg: true, prog: false }, prog: { cfg: false, prog: true }, both: { cfg: true, prog: true } };
const stName = s => s.cfg && s.prog ? 'both' : s.cfg ? 'settings' : s.prog ? 'progress' : 'ok';

function genCase(seed, k, famOverride) {
  const r = makeRng(seed, k, 7);
  const fam = famOverride || FAMILIES[k % FAMILIES.length];
  // This case's turn within its family: the families below that must reach every view or variant take them in turn.
  const nth = famOverride ? k : Math.floor(k / FAMILIES.length);
  const c = { k, fam, slots: [], events: [], empty: fam === 'empty', emptyKind: r.pick(['missing', 'blank']), windowClicks: 0 };
  const slot = (from, to, s) => c.slots.push({ from, to, ...s });
  const pickBoot = pool => r.pick(pool);
  const bootPool = r.chance(0.5) ? SETTINGS_VIEWS : VIEWS;
  let boot = pickBoot(bootPool), heal = 0, busyTo = 0;
  const add = (t, kind, x) => c.events.push({ t: Math.round(t), kind, ...(x || {}) });
  const kind = r.pick(['cfg', 'prog', 'both']);
  if (fam === 'persist') { heal = r.int(3, 6) * MIN; slot(0, heal, ST[kind]); }
  else if (fam === 'flip') { heal = 6 * MIN; for (let t = 0; t < heal; t += 30 * SEC) { const x = r(); slot(t, t + 30 * SEC, x < 0.4 ? ST.ok : x < 0.6 ? ST.cfg : x < 0.85 ? ST.prog : ST.both); } }
  else if (fam === 'r31') { heal = 5 * MIN; boot = pickBoot(SETTINGS_VIEWS); const m = r.pick([1, 2]); slot(0, m * MIN - 15 * SEC, ST.prog); slot(m * MIN - 15 * SEC, m * MIN + 15 * SEC, ST.both); slot(m * MIN + 15 * SEC, heal, ST.prog); }
  else if (fam === 'r33') { heal = 4 * MIN; boot = pickBoot(SETTINGS_VIEWS); slot(0, heal, ST.prog); c.windowClicks = 3; }
  else if (fam === 'storm') { heal = 3 * MIN; slot(0, heal, ST[kind]); }
  else if (fam === 'healthy') { heal = 5 * MIN; for (let t = 90 * SEC; t < heal; t += 30 * SEC) { const x = r(); slot(t, t + 30 * SEC, x < 0.35 ? ST.ok : x < 0.55 ? ST.cfg : x < 0.85 ? ST.prog : ST.both); } c.slots.push({ from: 60 * SEC, to: 80 * SEC, cfg: false, prog: true }); c.healthyRefresh = true; }
  else if (fam === 'empty') { heal = 0; }
  else if (fam === 'live') { heal = r.int(3, 5) * MIN; boot = 'livequiz'; slot(0, heal, ST[r.pick(['prog', 'cfg', 'both'])]); }
  else if (fam === 'detail') { heal = 4 * MIN; boot = 'activities'; slot(0, heal, ST.prog); c.windowClicks = 2; c.outageOnCommit = true; }
  // The load window (review R4-1): a view clicked while the first load is still out (slow reads), or while the module
  // files load (slow scripts), before the progress read has failed or landed.
  else if (fam === 'early') { heal = 3 * MIN; c.noResume = true; boot = 'activities'; c.lat = r.int(250, 700); const b = r.int(1500, 3500); slot(0, b, ST.both); slot(b, heal, ST.prog); c.earlyView = r.pick(['activities', 'manage', 'songs', 'games', 'livequiz', 'skills', 'students']); c.earlyAt = r.int(200, 1200); if (r.chance(0.5)) c.modMs = 300; }
  else if (fam === 'early2') { heal = 3 * MIN; c.noResume = true; boot = 'activities'; c.lat = r.int(250, 700); slot(0, heal, ST.prog); c.earlyView = r.pick(['activities', 'manage', 'songs', 'games', 'skills', 'minutes']); c.earlyAt = r.int(200, 1200); }
  else if (fam === 'midload') { heal = 3 * MIN; c.noResume = true; boot = 'activities'; c.modMs = 300; slot(0, heal, ST.prog); c.earlyView = r.pick(['activities', 'manage', 'songs', 'games', 'trouble']); c.earlyAt = r.int(1000, 3000); }
  else if (fam === 'summary') { heal = 3 * MIN; boot = 'activities'; slot(0, heal, ST.prog); }
  else if (fam === 'livelist') { heal = 2 * MIN; boot = 'livequiz'; const e = r.int(5, 40) * SEC; slot(0, e, r.chance(0.5) ? ST.cfg : ST.both); slot(e, heal, r.chance(0.5) ? ST.prog : ST.ok); }
  else if (fam === 'games2') { heal = 3 * MIN; boot = 'games'; slot(0, heal, ST.prog); }
  // A loaded console whose settings read fails on a card's page (Refresh) and on Songs (review R1-5, the Songs guard).
  else if (fam === 'failedread') { heal = 2 * MIN; boot = 'activities'; const e = r.int(20, 30) * SEC; slot(e, e + 25 * SEC, ST.cfg); c.failAt = e; }
  // The load window held open (review R4-1): a progress read that takes 2-6 s, the settings fast; views drawn and
  // clicked while it is out, and it then lands or fails.
  else if (fam === 'slowprog') { heal = 3 * MIN; c.noResume = true; boot = 'activities'; c.progExtra = r.int(2000, 6000); if (nth % 3 === 2) slot(0, heal, ST.prog); c.earlyView = ['manage', 'games', 'songs', 'activities', 'manage', 'skills', 'students', 'minutes'][nth % 8]; c.earlyAt = r.int(100, 800); }
  // The settings read fails first (review R4-1): (A) booted on a view the box line replaces, the retry's settings read
  // comes back and its progress read is slow (no click: the minute timer); (B) booted on Live In-Class Games, the
  // settings read back through Mic recordings' own read, then a roster view opened (no progress read has failed).
  else if (fam === 'cfgfirst') { heal = 3 * MIN; c.progExtra = r.int(1500, 3000); slot(0, r.int(10, 25) * SEC, ST.cfg); c.variant = nth % 2 ? 'B' : 'A'; boot = c.variant === 'A' ? ['skills', 'activities', 'students', 'games', 'trouble', 'manage', 'responses', 'songs'][Math.floor(nth / 2) % 8] : 'livequiz'; }
  // A write still open when the retry's roster lands (review R4-1 (d), the reviewer's chaos case 30): every latency
  // 60 ms and a click 60 ms before the slow progress read lands, so the view's own read waits for the write.
  else if (fam === 'landwrite') { heal = 3 * MIN; boot = 'activities'; c.lat = 60; c.progExtra = r.int(1500, 3000); slot(0, r.int(10, 25) * SEC, ST.prog); c.writeAtProgLand = true; }
  else if (fam === 'chaos') { heal = 6 * MIN; for (let t = 0; t < heal; t += r.int(2, 20) * SEC) { const x = r(); slot(t, t + 20 * SEC, x < 0.3 ? ST.ok : x < 0.55 ? ST.cfg : x < 0.85 ? ST.prog : ST.both); } }
  c.boot = boot;
  c.bootSub = fam === 'detail' ? 'detail' : fam === 'landwrite' ? (nth % 2 ? 'split' : 'detail') : fam === 'failedread' ? (nth % 2 ? 'split' : 'detail') : c.noResume ? null : boot === 'activities' ? r.pick(['split', 'split', 'board', 'detail']) : null;
  c.heal = heal;
  // Before the heal: a teacher at work.
  const pre = Math.max(heal, 3 * MIN);
  const tIn = (a, b) => a + Math.floor(r() * Math.max(1, b - a));
  if (fam === 'r33') {
    add(tIn(15 * SEC, 25 * SEC), 'B', { cells: 'all' });
    add(tIn(62 * SEC, 75 * SEC), 'write', { prefer: 'date' });
    add(tIn(80 * SEC, 110 * SEC), 'B', { cells: 'all' });
    add(tIn(125 * SEC, 170 * SEC), 'write', {});
    if (r.chance(0.5)) add(tIn(180 * SEC, 200 * SEC), 'view', { v: r.pick(SETTINGS_VIEWS) });
    c.typeOnRetry = true;
  } else if (fam === 'r31') {
    if (r.chance(0.5)) add(tIn(150 * SEC, 200 * SEC), 'view', { v: r.pick(VIEWS) });
    if (r.chance(0.5)) add(tIn(20 * SEC, 280 * SEC), 'B', { cells: r.pick(['dates', 'mix']) });
  } else if (fam === 'storm') {
    // Every other storm hides the tab for two whole minutes instead: the reads it makes while hidden must be none.
    if (nth % 2) { add(50 * SEC, 'hide'); add(170 * SEC, 'show'); }
    else for (let i = 0; i < 12; i++) { add(60 * SEC + i * 5 * SEC, 'hide'); add(62.5 * SEC + i * 5 * SEC, 'show'); }
    if (r.chance(0.5)) add(tIn(10 * SEC, 50 * SEC), 'view', { v: r.pick(VIEWS.filter(usesRoster)) });
  } else if (fam === 'detail') {
    // A card's page (the update reload's note) while progress is down. The other console changes the dates; this one
    // clicks Hidden, which lands on top and reads the settings again, and that read fails (the outage starts at the
    // commit): the page is drawn again from the failed copy. A tab return then starts the retry, whose settings read
    // must redraw the page before anything on it is clicked (a click 1-120 ms after that read lands).
    add(r.int(15, 25) * SEC, 'B', { cells: 'dates' });
    add(r.int(30, 35) * SEC, 'write', { prefer: 'hidden' });
    add(50 * SEC, 'hide'); add(54 * SEC, 'show');
    add(r.int(70, 80) * SEC, 'B', { cells: 'all' });
    add(r.int(90, 100) * SEC, 'write', {});
  } else if (fam === 'early' || fam === 'early2' || fam === 'midload') {
    add(c.earlyAt, 'view', { v: c.earlyView, early: true });
    add(r.int(20, 40) * SEC, 'write', {});
    if (r.chance(0.5)) add(r.int(5, 15) * SEC, 'B', { cells: 'mix' });
  } else if (fam === 'summary') {
    add(r.int(5, 10) * SEC, 'view', { v: 'skills' });
    add(r.int(12, 20) * SEC, 'period');
  } else if (fam === 'livelist') {
    add(r.int(45, 60) * SEC, 'write', { prefer: 'lqg' });
  } else if (fam === 'games2') {
    add(r.int(5, 10) * SEC, 'write', { prefer: 'classgames', must: true });
  } else if (fam === 'failedread' && c.bootSub === 'split') {
    // A write whose follow-up read fails leaves the failed copy under the list; a filter click and a tab return
    // (the progress read only) then repaint the list's rows and the Students pane from it.
    add(c.failAt + 2 * SEC, 'write', { prefer: 'date' });
    add(c.failAt + 4 * SEC, 'sub', { what: 'filter' });
    add(c.failAt + 6 * SEC, 'hide'); add(c.failAt + 7.5 * SEC, 'show');
    add(c.failAt + 10 * SEC, 'view', { v: r.pick(['songs', 'tsongs', 'livequiz']) });
    add(c.failAt + 14 * SEC, 'write', {});
  } else if (fam === 'failedread') {
    // The card's page kept over the failed Refresh; a tab return 15 s after it (the roster read only) repaints the
    // Students pane from the copy in hand, which is the failed read.
    add(c.failAt + 3 * SEC, 'refresh');
    add(c.failAt + 6 * SEC, 'B', { cells: 'all' });
    add(c.failAt + 9 * SEC, 'write', {});
    add(c.failAt + 19 * SEC, 'hide'); add(c.failAt + 20.5 * SEC, 'show');
    add(c.failAt + 23 * SEC, 'view', { v: r.pick(['songs', 'tsongs', 'livequiz']) });
    add(c.failAt + 27 * SEC, 'write', {});
  } else if (fam === 'slowprog') {
    add(c.earlyAt, 'view', { v: c.earlyView, early: true });
    add(c.earlyAt + r.int(300, 1200), 'sub', { what: r.pick(['who', 'board', 'pick', 'filter']) });
    add(c.earlyAt + r.int(1300, 1900), 'write', {});
    if (r.chance(0.5)) add(r.int(10, 20) * SEC, 'B', { cells: 'mix' });
  } else if (fam === 'cfgfirst') {
    if (c.variant === 'A') { for (let t = 50 * SEC; t < 80 * SEC; t += 500) add(t, 'check'); }
    else { add(30 * SEC, 'view', { v: 'mic' }); add(34 * SEC, 'view', { v: r.pick(['skills', 'students', 'trouble', 'responses']) }); }
  } else if (fam === 'chaos') {
    for (let i = 0, n = r.int(4, 10); i < n; i++) add(tIn(3 * SEC, heal - 5 * SEC), 'view', { v: r.pick(VIEWS) });
    for (let i = 0, n = r.int(3, 8); i < n; i++) add(tIn(3 * SEC, heal - 5 * SEC), 'write', {});
    for (let i = 0, n = r.int(2, 6); i < n; i++) add(tIn(3 * SEC, heal - 5 * SEC), 'B', { cells: r.pick(['dates', 'mix', 'all']) });
    for (let i = 0, n = r.int(0, 3); i < n; i++) add(tIn(3 * SEC, heal - 5 * SEC), 'sub', { what: r.pick(['board', 'list', 'pick', 'songs-detail', 'who', 'tab']) });
    for (let i = 0, n = r.int(0, 2); i < n; i++) { const h = tIn(10 * SEC, heal - 40 * SEC); add(h, 'hide'); add(h + r.int(3, 30) * SEC, 'show'); }
    if (r.chance(0.5)) add(tIn(10 * SEC, heal - 10 * SEC), 'refresh');
    c.windowClicks = r.int(0, 4);
  } else if (fam === 'live') {
    add(tIn(30 * SEC, 80 * SEC), 'view', { v: r.pick(VIEWS.filter(usesRoster)) });
    add(tIn(100 * SEC, 140 * SEC), 'view', { v: 'livequiz' });
    if (r.chance(0.5)) { const h = tIn(150 * SEC, 160 * SEC); add(h, 'hide'); add(h + r.int(5, 20) * SEC, 'show'); }
  } else {
    const views = r.int(1, 4), subs = r.int(0, 2), writes = r.int(1, 3), bs = r.int(1, 2);
    for (let i = 0; i < views; i++) add(tIn(5 * SEC, pre - 10 * SEC), 'view', { v: r.chance(0.5) ? r.pick(SETTINGS_VIEWS) : r.pick(VIEWS) });
    for (let i = 0; i < subs; i++) add(tIn(5 * SEC, pre - 10 * SEC), 'sub', { what: r.pick(['board', 'list', 'pick', 'songs-detail', 'who', 'who']) });
    for (let i = 0; i < writes; i++) add(tIn(10 * SEC, pre - 5 * SEC), 'write', {});
    for (let i = 0; i < bs; i++) add(tIn(5 * SEC, pre - 5 * SEC), 'B', { cells: r.pick(['dates', 'mix', 'all']) });
    if (r.chance(0.3)) add(tIn(10 * SEC, pre - 10 * SEC), 'refresh');
    if (r.chance(0.4)) { const h = tIn(10 * SEC, pre - 40 * SEC); add(h, 'hide'); add(h + r.int(5, 30) * SEC, 'show'); }
    if (r.chance(0.4)) { const s = tIn(10 * SEC, pre - 100 * SEC), d = r.int(10, 90) * SEC; add(s, r.chance(0.6) ? 'type' : 'drag', { dur: d }); busyTo = Math.max(busyTo, s + d); }
    if (r.chance(0.3)) c.windowClicks = 1;
    // healthy: a Refresh while the progress read fails on a loaded console, then a view drawn from the settings.
    if (c.healthyRefresh) { add(65 * SEC, 'refresh'); add(68 * SEC, 'view', { v: r.pick(SETTINGS_VIEWS) }); }
    // A Who picker opened in every persist and healthy case (roster down, and loaded).
    if (fam === 'persist' || fam === 'healthy') add(tIn(10 * SEC, pre - 20 * SEC), 'sub', { what: 'who' });
    // A box typed in while the first retry after the heal is out, in persist cases too (r33 alone left the floor to chance).
    if (fam === 'persist') c.typeOnRetry = true;
  }
  // The heal and the recovery check: nothing but the second console between them.
  const healAt = Math.max(heal, ...c.events.map(e => e.t + (e.dur || 0) + SEC), 5 * SEC);
  if (healAt > heal) { slot(heal, healAt, c.slots.length ? { cfg: c.slots[c.slots.length - 1].cfg, prog: c.slots[c.slots.length - 1].prog } : ST.ok); }
  c.healAt = healAt;
  if (r.chance(0.3)) add(healAt + r.int(20, 100) * SEC, 'B', { cells: 'mix' });
  add(healAt, 'heal');
  add(healAt + 125 * SEC, 'recover');
  // After the check: a few more clicks on a healthy network.
  const tail = healAt + 130 * SEC;
  for (let i = 0, n = r.int(1, 3); i < n; i++) add(tail + i * 8 * SEC + r.int(0, 5) * SEC, r.chance(0.5) ? 'view' : 'write', { v: r.pick(VIEWS) });
  c.end = tail + 40 * SEC;
  for (let t = 15 * SEC; t < c.end; t += 15 * SEC) add(t, 'check');
  c.events.sort((a, b) => a.t - b.t);
  // --no-outage, the tool's self-test: the same cases on a network that never fails must all hold.
  if (flag('--no-outage')) { c.slots = []; c.outageOnCommit = false; }
  c.netAt = t => { for (let i = c.slots.length - 1; i >= 0; i--) { const s = c.slots[i]; if (t >= s.from && t < s.to) return s; } return ST.ok; };
  return c;
}
// What the second console writes: values that differ from the doc's (never a delete), on whole families of cells.
function bPatch(r, doc, cells) {
  const p = {}, fams = cells === 'all' ? ['dates', 'hidden', 'optional', 'play', 'keep', 'pins', 'games', 'students', 'who', 'clears']
    : cells === 'dates' ? ['dates'] : r.shuffle(['dates', 'hidden', 'optional', 'play', 'keep', 'pins', 'games', 'students', 'who', 'clears']).slice(0, 3);
  const n = (Number(doc.configVersion) || 0) + 1;
  const flipTo = (map, id) => (map || {})[id] === true ? false : true;
  if (fams.includes('dates')) { p.activityDates = {}; BOARD_IDS.forEach((id, i) => { p.activityDates[id] = '2026-11-' + String(10 + ((n * 3 + i) % 18)).padStart(2, '0'); }); }
  if (fams.includes('hidden')) { p.hiddenActivities = {}; BOARD_IDS.forEach(id => { p.hiddenActivities[id] = flipTo(doc.hiddenActivities, id); }); }
  if (fams.includes('optional')) { p.optionalActivities = {}; BOARD_IDS.forEach(id => { p.optionalActivities[id] = flipTo(doc.optionalActivities, id); }); }
  if (fams.includes('play')) { p.playAlongActivities = {}; BOARD_IDS.forEach(id => { p.playAlongActivities[id] = flipTo(doc.playAlongActivities, id); }); }
  if (fams.includes('keep')) { p.keepTodayActivities = {}; BOARD_IDS.forEach(id => { p.keepTodayActivities[id] = flipTo(doc.keepTodayActivities, id); }); }
  if (fams.includes('pins')) p.activityPins = (doc.activityPins || []).join() === 'ca-1,ca-2' ? ['ca-3'] : ['ca-1', 'ca-2'];
  if (fams.includes('games')) { p.gamesEnabled = doc.gamesEnabled === false; p.gameOverrides = {}; STUDENTS.forEach(s => { p.gameOverrides[s.uid] = !((doc.gameOverrides || {})[s.uid] === true); }); }
  if (fams.includes('students')) { p.periodOverrides = {}; p.paused = {}; p.moduleOpenThrough = {}; STUDENTS.forEach((s, i) => { p.periodOverrides[s.uid] = ((doc.periodOverrides || {})[s.uid] === '4') ? '7' : '4'; p.paused[s.uid] = !((doc.paused || {})[s.uid] === true); p.moduleOpenThrough[s.uid] = 2 + ((n + i) % 10); }); }
  if (fams.includes('who')) { p.activityStudents = {}; BOARD_IDS.forEach(id => { p.activityStudents[id] = { ['fake-uid-0' + (1 + (n % 9))]: true }; }); }
  if (fams.includes('clears')) { p.activityClears = {}; STUDENTS.forEach(s => { p.activityClears[s.uid] = {}; BOARD_IDS.forEach(id => { p.activityClears[s.uid][id] = !(((doc.activityClears || {})[s.uid] || {})[id] === true); }); }); }
  return p;
}

/* ════════════════════════════════════════════════════════════════════════
   8. One case: boot, play the events on the virtual clock, check.
   ════════════════════════════════════════════════════════════════════════ */
const WRITE_CLICK = ['[data-set-games]', '[data-open-all-through]', '[data-set-paused]', '[data-set-archived]', '[data-set-period]', '[data-set-activity-hidden]',
  '[data-set-module-hidden]', '[data-tvs-share]', '[data-set-song-place]', '[data-set-activity-optional]', '[data-set-activity-playalong]', '[data-activity-whole-class]',
  '[data-set-activity-pin]', '[data-set-activity-archived]', '[data-delete-activity]', '[data-set-activity-clear]', '[data-clear-all-blockers]', '[data-publish-activity]',
  '[data-unassign-activity]', '[data-board-bump]', '[data-access-set]', '[data-access-decide]', '[data-access-allow-cas]', '[data-access-del]', 'button[onclick*="teacherSetClassGames"]', '[data-rename-reset]', '[data-lqg-remove]', '[data-lqg-bump]', '[data-lqg-restore]'];
const WRITE_CHANGE = ['select[data-move-activity]', 'input[data-set-activity-date]', 'select[data-set-open-through]', 'input[data-set-activity-student]', 'input[data-set-activity-keep-today]', 'input[data-board-number]'];
const WRITE_SEL = WRITE_CLICK.concat(WRITE_CHANGE).join(', ');
// Controls worked out from the roster (R3-2): none of them may be on screen while the roster has failed to load.
const ROSTER_CTRL = '[data-set-games][data-uid], [data-open-all-through], [data-set-paused], [data-set-archived], [data-set-period], [data-set-open-through], [data-set-activity-clear], [data-clear-all-blockers], [data-set-activity-student], [data-remove-one], [data-access-set], [data-access-allow-cas]';
const ROSTER_FACTS = [
  [/No students? yet/i, '"No students yet"'], [/No student data yet/i, '"No student data yet"'], [/\b\d+ roster accounts?\b/, 'a count of roster accounts'],
  [/would be locked out/, '"would be locked out"'], [/not in the roster/i, '"not in the roster"'], [/Every roster account is/, '"Every roster account is …"'],
  [/\b\d+\s*\/\s*\d+\s*(done|turned in)\b/, 'a done / turned-in count'], [/\b\d+ of \d+ (students|turned in)\b/, 'an "N of M students" count'],
  [/who hasn.t (finished|turned it in)/, 'a "who hasn\'t finished" list'], [/Everyone has (finished|turned)/, '"Everyone has finished"'], [/Opened: \d+/, 'an Opened count'],
  [/Every student is archived/, '"Every student is archived"'], [/Students\s*\d+\s*\/\s*\d+/, 'a Students tab count'],
  [/\b\d+ (done|started|not started|not turned in)\b/, 'a done / started count'], [/\b\d+ paused · \d+ archived/, 'a paused / archived count']];
const textOf = el => el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
const clip = (s, n) => s.length > n ? s.slice(0, n) + '…' : s;
const mmss = t => { const s = Math.round(t / 100) / 10; return Math.floor(s / 60) + ':' + String((s % 60).toFixed(1)).padStart(4, '0'); };

async function runCase(seed, k, o) {
  const c = genCase(seed, k, o.family);
  const r = makeRng(seed, k, 11);
  const clock = new VClock();
  const W = { seed, k, clock, baseTime: Date.UTC(2026, 10, 24, 18, 0, 0), fails: [], log: [], stats: { writeClicks: 0, committed: 0, refused: 0, windowClicks: 0, downChecks: 0, recoverChecks: 0, noControl: 0, busyGuards: 0, whoOpened: 0, detailKept: 0, loadingChecks: 0, healthyStale: 0, hiddenMinutes: 0 } };
  W.server = new FakeServer({ clock, rng: makeRng(seed, k, 2), docs: seedDocs(c.empty, c.emptyKind), netAt: c.netAt });
  W.server.fixedLat = c.lat || 0; W.server.progExtra = c.progExtra || 0; W.modMs = c.modMs || 0;
  if (c.boot === 'livequiz' || c.fam === 'live') W.server.docs.set('liveQuiz/current', { state: 'question', quizId: 'string-id', qIndex: 0, sessionId: 'sess-1', limitSec: 20, scores: {}, mode: 'class' });
  const verbose = o.verbose;
  const say = s => { if (verbose) console.log(`  ${mmss(clock.now)} ${s}`); };
  const fail = (tag, msg) => { if (W.fails.some(f => f.tag === tag && f.msg === msg)) return; W.fails.push({ tag, msg, t: clock.now }); say(`✗ [${tag}] ${msg}`); };
  const A = makeConsole(W);
  // Which copy the console holds, and which read put it there (polled after every timer).
  W.lastCopy = null; W.bgCopy = null; W.lastCfgRead = null; W.stageEl = null; W.copyMoves = [];
  const pollCopy = () => {
    let s; try { s = A.ctx.__stamp(); } catch { return; }
    if (s.cfg === W.lastCopy) return;
    W.lastCopy = s.cfg;
    if (s.ok) W.goodCopy = s.cfg;
    const rd = W.lastCfgRead; W.lastCfgRead = null;
    // Which read moved the copy to which version: R3-3 (b) blames only a first-load / retry read.
    if (s.ok) W.copyMoves.push({ v: Number(s.v) || 0, load: !!(rd && rd.load), t: clock.now });
    if (rd && rd.load && rd.ok && s.ok) { W.bgCopy = { cfg: s.cfg, v: Number(s.v) || 0, t: clock.now }; say(`the copy is now v${s.v}, from a first-load / retry read`); }
    else if (verbose) say(`the copy is now ${s.ok ? 'v' + s.v : 'the failed read ({})'}`);
  };
  const queue = c.events.slice();
  W.server.onRead = rec => {
    if (rec.kind === 'cfg') W.lastCfgRead = rec;
    if (rec.kind === 'cfg' && rec.load && rec.ok && c.windowClicks > 0 && !c.empty) {
      c.windowClicks--;
      const at = clock.now + 1 + r.int(0, 119);
      queue.push({ t: at, kind: 'write', window: true, injected: true }); queue.sort((a, b) => a.t - b.t);
    }
  };
  W.server.onIssue = rec => {
    if (c.writeAtProgLand && !W.wroteAtLand && rec.kind === 'prog' && rec.load && clock.now > 30 * SEC && clock.now < c.healAt - 10 * SEC) {
      W.wroteAtLand = true;
      queue.push({ t: clock.now + c.progExtra + 60, kind: 'write', injected: true }); queue.sort((a, b) => a.t - b.t);
    }
    if (c.typeOnRetry && !W.typedOnRetry && rec.kind === 'prog' && rec.load && clock.now >= c.healAt) {
      W.typedOnRetry = true;
      queue.push({ t: clock.now + 1 + r.int(0, 39), kind: 'type', dur: 15 * SEC, guard: true, injected: true }); queue.sort((a, b) => a.t - b.t);
    }
  };
  W.server.onCommit = cm => {
    if (cm.by !== 'A') return;
    W.stats.committed++;
    if (c.outageOnCommit && !W.outageDone) { W.outageDone = true; const cur = c.netAt(clock.now); c.slots.push({ from: clock.now, to: clock.now + 5 * SEC, cfg: true, prog: cur.prog }); say('the settings go down for 5 s, starting at this commit'); }
    if (!cm.ctrl || !cm.ctrl.born) return;
    // R3-3 (b): this write's control was drawn from version bornV; a second-console change after that, to a cell it writes, must refuse it.
    const mine = new Set(); cm.patch.forEach(pt => leaves(pt).forEach((v, path) => mine.add(path)));
    const hit = W.server.history.filter(h => h.by === 'B' && h.v > cm.ctrl.bornV && h.v <= cm.readCV).flatMap(h => h.changed.filter(p => mine.has(p) || [...mine].some(m => p.startsWith(m + '.') || m.startsWith(p + '.'))));
    if (!hit.length) return;
    /* The read that first brought the copy past the other console's change: a first-load / retry read is this tool's
       business (it moved the copy without a redraw). A write's own follow-up read or a view's read does the same on a
       healthy console today (seen on main d8ca4e2 with --no-outage, a card page's Hidden / Delete after a Clear): not
       this tool's, counted and listed under "outside this tool" instead. No such read at all is a failure. */
    const firstV = Math.min(...W.server.history.filter(h => h.by === 'B' && h.v > cm.ctrl.bornV && h.v <= cm.readCV).map(h => h.v));
    const mover = W.copyMoves.find(m => m.v >= firstV);
    if (mover && !mover.load) { W.stats.healthyStale++; say(`(outside this tool) a write from a control drawn at v${cm.ctrl.bornV} (${cm.ctrl.sel}) committed over the other console's later change; the copy moved past it through a write's or a view's own read at ${mmss(mover.t)}`); return; }
    fail('R3-3', `a write from a control drawn at v${cm.ctrl.bornV} (${cm.ctrl.sel}) committed over the other console's later change to ${clip([...new Set(hit)].join(', '), 120)}${mover ? ` (a first-load / retry read moved the copy past it at ${mmss(mover.t)} without a redraw)` : ''} — a healthy console refuses it ("Nothing was saved")`);
  };
  // Up to T, or to an event a read or a commit has just queued (a click right after a read must happen then, not later).
  const advanceTo = async T => {
    for (;;) {
      await flushMicrotasks(); pollCopy();
      const injected = queue.reduce((m, e) => e.injected && e.t < m ? e.t : m, Infinity);
      if (injected < T) T = Math.max(clock.now, injected);
      const next = clock.q[0];
      if (!next || next.at > T) { clock.now = Math.max(clock.now, T); await flushMicrotasks(); pollCopy(); return; }
      clock.q.shift();
      clock.now = Math.max(clock.now, next.at);
      try { if (next.meta && next.meta.noAls) ALS.exit(() => next.fn()); else next.run(next.fn); }
      catch (e) { A.pageError('a timer threw', e); }
      heartbeat(`case ${k} (${c.fam}) @${mmss(clock.now)}`);
    }
  };
  // Boot: the update reload's note names the view (the real teacherResumeApply puts the console there).
  const note = { view: c.boot };
  if (c.bootSub === 'board') note.board = true;
  if (c.bootSub === 'detail') { note.act = 'ca-1'; note.from = 'songs'; }
  if (!c.noResume && (c.boot !== 'activities' || c.bootSub)) A.ctx.__resume({ uid: 'fake-teacher-uid', teacher: true, t: note });
  say(`case ${k}: family ${c.fam}, boots on ${c.boot}${c.bootSub ? ' (' + c.bootSub + ')' : ''}${c.empty ? ', an empty class (' + c.emptyKind + ')' : ''}; the network heals at ${mmss(c.healAt)}`);
  if (verbose) c.slots.forEach(s => console.log(`      network ${mmss(s.from)}–${mmss(s.to)}: ${stName(s)} down`));
  Promise.resolve().then(() => A.ctx.showTeacherApp({ uid: 'fake-teacher-uid', email: 'teacher@example.test', displayName: 'Teacher' })).catch(e => A.pageError('showTeacherApp', e));
  let hidden = false, busy = null;
  const grid = () => A.doc.getElementById('t-grid-container');
  const app = () => A.doc.getElementById('teacher-app');
  const newestDone = kind => { let best = null; for (const rd of W.server.reads) if (rd.kind === kind && rd.done && (!best || rd.i > best.i)) best = rd; return best; };
  const stamp = el => el && el._born ? el._born : null;
  const ctrlInfo = el => { const b = stamp(el); return { born: !!b, bornV: b ? Number(b.v) || 0 : 0, bornCfg: b ? b.cfg : null, sel: el.localName + [...el.attrs.keys()].filter(a => a.startsWith('data-') || a === 'onclick').map(a => '[' + a + ']').join('').slice(0, 80) }; };
  const staleVsBg = el => { const b = stamp(el); return !!(W.bgCopy && b && b.cfg !== W.bgCopy.cfg && (Number(b.cfg && b.cfg.configVersion) || 0) < W.bgCopy.v); };
  // The boot: looked at every 50 ms while the first load is out (the view the update reload's note names is drawn then).
  if (!c.noResume) { while (clock.now < 2 * SEC && !queue.some(e => e.injected && e.t <= clock.now + 50)) { await advanceTo(clock.now + 50); if (W.server.inflight) check('boot (reads out)'); } }
  function check(why) {
    const p = A.peek();
    const g = grid(), text = textOf(g), noteEl = A.doc.getElementById('t-roster-note'), noteTxt = textOf(noteEl);
    const quiet = W.server.inflight === 0;
    if (A.errors.length) { A.errors.forEach(e => fail('page-error', clip(e.msg, 220))); A.errors.length = 0; }
    W.server.violations.splice(0).forEach(v => fail('page-error', 'the fake server refused: ' + v));
    if (W.server.maxProgInflight > 1) fail('R2-reads', 'two progress reads out at once');
    if (W.server.maxLoadCfgInflight > 1) fail('R2-reads', 'two first-load settings reads out at once');
    const rosterDown = !p.studentsAt && p.failed;
    // R3-1: what the screen says matches the reads. The settings line is checked whenever no settings read is out,
    // so also while the first load's progress read is (review R4-1: the load window).
    const cfgOut = W.server.reads.some(rd => rd.kind === 'cfg' && !rd.done);
    const lastCfg = newestDone('cfg');
    if (!cfgOut && /Could not read the class settings/.test(text) && lastCfg && lastCfg.ok) fail('R3-1', `${p.view}: "Could not read the class settings" on screen while the newest settings read (${mmss(lastCfg.t1)}) was good${quiet ? '' : ' (a progress read is out)'}`);
    if (quiet) {
      if (noteEl && p.studentsAt) fail('R3-1', `${p.view}: the "student progress did not load" note while the roster is loaded`);
      if (noteEl && /class settings did load/.test(noteTxt) && lastCfg && !lastCfg.ok) fail('R3-1', `${p.view}: the note says the class settings loaded, while the newest settings read (${mmss(lastCfg.t1)}) failed`);
      if (/Could not load (student data|the student list)/.test(text) && p.studentsAt) fail('R3-1', `${p.view}: a roster failure line while the roster is loaded`);
    }
    // "Could not load student data" only after a progress read failed: also while one is out (a retry after a settings failure).
    const lastProg = newestDone('prog');
    if (/Could not load student data/.test(text) && (!lastProg || lastProg.ok)) fail('R3-1', `${p.view}: "Could not load student data" while ${lastProg ? 'the newest progress read (' + mmss(lastProg.t1) + ') was good' : 'no progress read was made (the settings read failed first)'}`);
    if (quiet && /^Loading/.test(text) && !clock.q.some(t => t.meta.kind !== 'interval')) fail('R1-dead', `${p.view}: left on "${clip(text, 60)}" with nothing left to run`);
    // R3-2: nothing from the roster while it is missing: failed to load, or its first read still out (review R4-1).
    if (!p.studentsAt && g) {
      if (rosterDown && usesRoster(p.view)) W.stats.downChecks++;
      if (!rosterDown) W.stats.loadingChecks++;
      for (const [re, what] of ROSTER_FACTS) { const m = re.exec(text); if (m) fail('R3-2', `${p.view}${p.screen ? '/' + p.screen : ''}: ${what} on screen while the roster has not loaded ("…${clip(text.slice(Math.max(0, m.index - 30), m.index + 50), 90)}…")`); }
      const ctl = g.querySelectorAll(ROSTER_CTRL);
      if (ctl.length) fail('R3-2', `${p.view}${p.screen ? '/' + p.screen : ''}: ${ctl.length} control(s) worked out from the roster while it has not loaded (${clip([...new Set(ctl.map(e => ctrlInfo(e).sel))].join(', '), 140)})`);
    }
    A.alerts.filter(a => !a.seen).forEach(a => { a.seen = true; if (/Everyone is already open/.test(a.msg) && !p.studentsAt) fail('R3-2', 'the "Everyone is already open" alert while the roster has not loaded'); });
    // R3-3 (a): once quiet after a first-load / retry settings read moved the copy, every write control was drawn from it (or newer).
    if (quiet && W.bgCopy && W.lastCopy === W.bgCopy.cfg && app()) {
      const stale = app().querySelectorAll(WRITE_SEL).filter(el => el.isConnected && staleVsBg(el));
      if (stale.length) fail('R3-3', `${p.view}${p.screen ? '/' + p.screen : ''}: a first-load / retry read moved the copy to v${W.bgCopy.v} at ${mmss(W.bgCopy.t)} and ${stale.length} write control(s) on screen are still drawn from an older copy (${clip([...new Set(stale.map(e => ctrlInfo(e).sel))].join(', '), 120)})`);
    }
    // R2-reads: the retry never stops while the roster is down, visible, on a view that reads it.
    if (quiet && rosterDown && !hidden && usesRoster(p.view) && !p.timer && !p.refreshing) fail('R2-reads', `${p.view}: the roster is down and nothing will read it again (no minute timer, no read out)`);
    // R2-busy: a retry that lands while the teacher types is thrown away, never drawn over the box (review R2-4).
    if (W.guard && !W.guard.isConnected) { fail('R2-busy', `${p.view}: a retry drew the view over the box being typed in`); W.guard = null; }
    // R1-empty / R1-live.
    if (c.empty && quiet && (/Could not (read|load)/.test(text) || noteEl)) fail('R1-empty', `${p.view}: a failure line in a good, empty class ("${clip(text, 80)}")`);
    // Missing only counts once the console is quiet or after it was there: booting, index.html's loading line is there until showTeacherApp draws the view.
    if (p.view === 'livequiz') {
      const stage = A.doc.getElementById('lq-stage');
      if (!stage) { if (quiet || W.stageEl) fail('R1-live', 'Live In-Class Games has no stage'); }
      else { if (W.stageEl && W.stageEl !== stage) fail('R1-live', 'the Live In-Class Games stage was replaced while the view stayed'); W.stageEl = stage; }
    } else W.stageEl = null;
    // R4-1: the roster-missing lines ("did not load" / "Loading student progress") only while it is missing.
    if (quiet && p.studentsAt && /Student progress did not load|Loading student progress/.test(text + ' ' + noteTxt)) fail('R4-1', `${p.view}${p.screen ? '/' + p.screen : ''}: a "student progress did not load / loading" line while the roster is loaded`);
    // ...and "Loading" only while no progress read has failed: a view drawn while loading is drawn again when the load fails.
    if (quiet && rosterDown && /Loading student progress/.test(text)) fail('R4-1', `${p.view}${p.screen ? '/' + p.screen : ''}: "Loading student progress…" on screen after the progress read failed (nothing is loading)`);
    // R3-2 / M2: the skills summary strip is roster fact too.
    const summ = A.doc.getElementById('t-summary');
    if (!p.studentsAt && p.view === 'skills' && summ && /\d/.test(textOf(summ)) && !(summ._style && summ._style.display === 'none')) fail('R3-2', `skills: the summary strip shows "${clip(textOf(summ), 80)}" while the roster has not loaded`);
    // Never drawn from a failed settings read (review R4, the R1-5 and Songs guards): no write control born from one.
    if (quiet && app()) {
      const failedCtl = app().querySelectorAll(WRITE_SEL + ', #lq-games button, [data-ta-pick]').filter(el => el.isConnected && el._born && el._born.ok === false && !el.closest('#t-side'));
      if (failedCtl.length) fail('R4-failedcopy', `${p.view}${p.screen ? '/' + p.screen : ''}: ${failedCtl.length} write control(s) drawn from a FAILED settings read are on screen (${clip([...new Set(failedCtl.map(e => ctrlInfo(e).sel))].join(', '), 120)})`);
    }
    // Archived students never come back after a failed read (review R4): the console's own last good list hides them.
    if (quiet && !W.server.txInflight && p.studentsAt && !p.showArch && W.goodCopy) {
      const arch = (p.ok ? p.cfg.archived : W.goodCopy.archived) || {};
      const back = p.uids.filter(u => arch[u] === true);
      if (back.length) fail('R4-archived', `${p.view}: ${back.length} archived student(s) back in the roster the views draw from (the newest settings read ${p.ok ? 'was good' : 'failed'})`);
    }
    if (verbose && why !== 'check' && !why.endsWith('(reads out)')) say(`  screen [${p.view}${p.screen ? '/' + p.screen : ''}${p.studentsAt ? '' : rosterDown ? ', ROSTER DOWN' : ', no roster yet'}${noteEl ? ', NOTE' : ''}] ${clip(text, 110)}`);
  }
  const clickWrite = (ev) => {
    const root = app(); if (!root) return;
    let els = root.querySelectorAll(WRITE_SEL).filter(el => el.isConnected && !el.disabled && !el.closest('#t-side'));
    if (ev.prefer === 'date') { const d = els.filter(el => el.matches('input[data-set-activity-date], [data-publish-activity]')); if (d.length) els = d; }
    if (ev.prefer === 'hidden') { const d = els.filter(el => el.matches('[data-set-activity-hidden]')); if (d.length) els = d; }
    if (ev.prefer === 'lqg') { const lr = A.doc.getElementById('lq-games'); const d = lr ? lr.querySelectorAll('button').filter(el => /Remove|Restore|▲|▼/.test(textOf(el))) : []; if (d.length) els = d; }
    if (ev.prefer === 'classgames') {
      const d = els.filter(el => el.matches('button[onclick*="teacherSetClassGames"]'));
      // M1 (lead, 2026-11-25): during a progress outage the class games switch is still offered while the settings read is good.
      if (ev.must && !d.length && A.peek().ok) fail('R4-games', 'the class games On / Off switch is not offered during a progress outage (the settings read is good)');
      if (d.length) els = d;
    }
    if (!els.length) { W.stats.noControl++; say('write click: no write control on screen'); return; }
    const el = r.pick(els), info = ctrlInfo(el);
    if (ev.window) { W.stats.windowClicks++; if (staleVsBg(el)) fail('R3-3', `a click ${ev.window ? 'right after' : 'after'} a first-load / retry read moved the copy to v${W.bgCopy.v} landed on a control drawn from an older copy (${info.sel})`); }
    W.stats.writeClicks++;
    say(`write click${ev.window ? ' (right after a background read)' : ''}: ${info.sel} (drawn at v${info.bornV})`);
    ALS.run(info, () => {
      if (el.matches(WRITE_CHANGE.join(', '))) {
        if (el.localName === 'select') { const opts = el.querySelectorAll('option').filter(x => x.getAttribute('value') && !x.hasAttribute('disabled')); if (!opts.length) return; el.value = r.pick(opts).getAttribute('value'); }
        else if (el.getAttribute('type') === 'checkbox') el.checked = !el.checked;
        else if (el.matches('input[data-set-activity-date]')) el.value = '2026-12-' + String(r.int(1, 28)).padStart(2, '0');
        else el.value = String(r.int(1, 4));
        A.fire(el, 'change');
      } else A.fire(el, 'click');
    });
  };
  for (;;) {
    queue.sort((a, b) => a.t - b.t);
    const ev = queue.shift();
    if (!ev) break;
    if (ev.injected) ev.injected = false;
    await advanceTo(ev.t);
    // A read or a commit during that advance queued an earlier event: put this one back and take that first.
    if (queue.some(e => e.injected && e.t < ev.t)) { queue.push(ev); continue; }
    const sb = A.doc.getElementById('t-side');
    switch (ev.kind) {
      case 'view': { const b = sb && sb.querySelector(`[data-view="${ev.v}"]`); say(`click: ${ev.v}`); if (b) A.fire(b, 'click'); break; }
      case 'sub': {
        const g = grid(); let t = null;
        if (ev.what === 'board') t = g && g.querySelector('[data-ta-board-open]');
        else if (ev.what === 'list') t = g && g.querySelector('[data-ta-board-back]');
        else if (ev.what === 'pick') { const rows = g ? g.querySelectorAll('[data-ta-pick]') : []; t = rows.length ? r.pick(rows) : null; }
        else if (ev.what === 'songs-detail') { const b = !ev.stay && sb && sb.querySelector('[data-view="songs"]'); if (b) { A.fire(b, 'click'); await advanceTo(clock.now + 2 * SEC); } const pv = grid() && grid().querySelectorAll('[data-open-activity]'); t = pv && pv.length ? r.pick(pv) : null; }
        else if (ev.what === 'filter') { const fs = g ? g.querySelectorAll('[data-ta-filter]') : []; t = fs.length ? r.pick(fs) : null; }
        else if (ev.what === 'tab') { const tabs = g ? g.querySelectorAll('[data-ta-tab]') : []; t = tabs.length ? r.pick(tabs) : null; }
        else if (ev.what === 'who') {
          // Open a Who picker: the shell's toggle listener fills its student list.
          if (A.peek().view !== 'activities') { const b = sb && sb.querySelector('[data-view="activities"]'); if (b) { A.fire(b, 'click'); await advanceTo(clock.now + 2 * SEC); } }
          let pk = grid() ? grid().querySelectorAll('details[data-board-who]') : [];
          if (!pk.length) { const bo = grid() && grid().querySelector('[data-ta-board-open]'); if (bo) { A.fire(bo, 'click'); await advanceTo(clock.now + 2 * SEC); pk = grid() ? grid().querySelectorAll('details[data-board-who]') : []; } }
          if (pk.length) { const d = r.pick(pk); d.open = true; W.stats.whoOpened++; say('click: open a Who picker'); A.fire(d, 'toggle'); }
          else say('click: who (no picker on screen)');
          break;
        }
        say(`click: ${ev.what}${t ? '' : ' (not on screen)'}`); if (t) A.fire(t, 'click');
        if (ev.stay && t) { await advanceTo(clock.now + 2 * SEC); const q = A.peek(); if (q.screen === 'detail' && !q.ok) { W.stats.detailKept++; say('the card stays on screen over a failed settings read (R1-5)'); } }
        break;
      }
      case 'refresh': { const b = A.doc.querySelector('[data-refresh-students]'); say('click: Refresh'); if (b) A.fire(b, 'click'); break; }
      case 'hide': hidden = true; A.doc.hidden = true; A.doc.visibilityState = 'hidden'; say('the tab is hidden'); A.fire(A.doc, 'visibilitychange'); break;
      case 'show': { const q = A.peek(); if (c.fam === 'detail' && q.screen === 'detail' && !q.ok) { W.stats.detailKept++; say('a card page drawn from a failed settings read is on screen (its controls too)'); } }
        hidden = false; A.doc.hidden = false; A.doc.visibilityState = 'visible'; say('the tab is back'); A.fire(A.doc, 'visibilitychange'); break;
      case 'type': {
        const g = grid(); const boxes = g ? g.querySelectorAll('input, select, textarea').filter(el => !el.matches('[data-ta-search]')) : [];
        if (boxes.length) { const el = r.pick(boxes); A.doc.activeElement = el; busy = 'type'; if (ev.guard) { W.guard = el; W.stats.busyGuards++; } say(`typing in ${ctrlInfo(el).sel} for ${Math.round(ev.dur / 1000)} s${ev.guard ? ' (started while a retry is out)' : ''}`); queue.push({ t: ev.t + ev.dur, kind: 'unbusy' }); }
        else say('typing: no box on screen'); break;
      }
      case 'drag': {
        if (grid() && grid().querySelector('.t-board')) { A.ctx.__setDrag('ca-1'); busy = 'drag'; say(`dragging a card for ${Math.round(ev.dur / 1000)} s`); queue.push({ t: ev.t + ev.dur, kind: 'unbusy' }); }
        else say('dragging: no board on screen'); break;
      }
      case 'unbusy': if (W.guard && !W.guard.isConnected) fail('R2-busy', 'a retry drew the view over the box being typed in'); W.guard = null; if (busy === 'drag') A.ctx.__setDrag(null); A.doc.activeElement = A.doc.body; say(`the ${busy} ends`); busy = null; break;
      case 'B': W.server.external(bPatch(r, W.server.docs.get('config/class') || {}, ev.cells)); say(`the second console writes (${ev.cells})`); break;
      case 'write': clickWrite(ev); break;
      case 'heal': W.rosterAtHeal = !!A.peek().studentsAt; say(`the network is healthy from here on${W.rosterAtHeal ? ' (the roster is loaded: no recovery to check)' : ''}`); break;
      case 'recover': {
        await advanceTo(clock.now + 3 * SEC);
        const p = A.peek(), text = textOf(grid());
        // Only a console whose roster had not loaded by the heal: a later settings failure on a loaded console waits for a click (header, NOT COVERED).
        if (W.rosterAtHeal) break;
        W.stats.recoverChecks++;
        if (usesRoster(p.view)) {
          if (!p.studentsAt) fail('R3-1', `${p.view}: 2 minutes after the network came back (no click, tab visible) the roster has still not loaded`);
          else if (/Could not (read|load)/.test(text) || A.doc.getElementById('t-roster-note')) fail('R3-1', `${p.view}: 2 minutes after the network came back the view still shows a failure line or the note ("${clip(text, 80)}")`);
        } else if (/Loading student data/.test(text)) fail('R3-1', `${p.view}: a tool view still on index.html's loading line 2 minutes after the network came back`);
        break;
      }
      case 'period': { const pf = A.doc.querySelectorAll('[data-set-period-filter]'); const b = pf.find(x => x.getAttribute('data-period') === '4') || pf[0]; say(`click: the period filter (${pf.length} buttons)`); if (b) A.fire(b, 'click'); break; }
      case 'check': break;
    }
    await advanceTo(clock.now + 1);
    // Let the reads the event started land before looking (up to 3 s, never past the next event).
    const nextT = queue.length ? Math.min(...queue.map(e => e.t)) : c.end;
    const until = Math.min(clock.now + 3 * SEC, nextT - 1);
    // Looked at while they are out too (every 50 ms): the load window is on screen, and clickable, for that long (review R4-1).
    while (W.server.inflight && clock.now < until && !queue.some(e => e.injected && e.t <= clock.now)) { check(ev.kind + ' (reads out)'); await advanceTo(Math.min(until, clock.now + 50)); }
    check(ev.kind);
  }
  await advanceTo(c.end);
  check('end');
  // R2-reads: reads per minute while the outage holds and nobody clicks.
  const clickT = c.events.filter(e => ['view', 'sub', 'write', 'refresh', 'type', 'drag'].includes(e.kind)).map(e => e.t);
  const hides = c.events.filter(e => e.kind === 'hide' || e.kind === 'show').sort((a, b) => a.t - b.t);
  const hiddenAt = t => { let h = false; for (const e of hides) { if (e.t > t) break; h = e.kind === 'hide'; } return h; };
  W.rate = {};
  for (let t = MIN; t + MIN <= c.healAt; t += 15 * SEC) {
    const s0 = c.netAt(t - MIN); let same = true;
    for (let u = t - MIN; u < t + MIN; u += SEC) { const s = c.netAt(u); if (s.cfg !== s0.cfg || s.prog !== s0.prog) { same = false; break; } }
    if (!same || (!s0.cfg && !s0.prog) || clickT.some(x => x >= t - 5 * SEC && x < t + MIN)) continue;
    const reads = W.server.reads.filter(rd => (rd.kind === 'cfg' || rd.kind === 'prog') && rd.t0 >= t && rd.t0 < t + MIN).length;
    const allHidden = hiddenAt(t) && !hides.some(e => e.t >= t && e.t < t + MIN);
    const key = (allHidden ? 'hidden, ' : '') + stName(s0) + ' down';
    W.rate[key] = Math.max(W.rate[key] || 0, reads);
    if (allHidden) W.stats.hiddenMinutes++;
    if (allHidden && reads) fail('R2-reads', `${reads} reads in the minute from ${mmss(t)} with the tab hidden (${stName(s0)} down): want 0`);
    if (!allHidden && reads > 6) fail('R2-reads', `${reads} reads in the minute from ${mmss(t)} (${stName(s0)} down, no click${hides.some(e => e.t >= t && e.t < t + MIN) ? ', the tab hidden and shown' : ''}): want at most 6`);
  }
  W.stats.refused = A.alerts.filter(a => /Nothing was saved/.test(a.msg)).length;
  return { c, W, A };
}

/* ════════════════════════════════════════════════════════════════════════
   9. The run.
   ════════════════════════════════════════════════════════════════════════ */
async function main() {
  const seed = Number(opt('--seed', 1));
  const n = Number(opt('--cases', 160));
  const only = opt('--case', null);
  const family = opt('--family', null);
  if (family && !FAMILIES.includes(family)) { console.error(`console-load-loop: unknown family "${family}" (${FAMILIES.join(', ')})`); process.exit(2); }
  const t0 = Date.now();
  SITE = compileSite(resolve(opt('--root', REPO)));
  const ks = only !== null ? [Number(only)] : Array.from({ length: n }, (_, i) => i);
  const out = { failed: [], byTag: {}, fams: {}, stats: { writeClicks: 0, committed: 0, refused: 0, windowClicks: 0, downChecks: 0, recoverChecks: 0, noControl: 0, busyGuards: 0, whoOpened: 0, detailKept: 0, loadingChecks: 0, healthyStale: 0, hiddenMinutes: 0 }, rate: {} };
  for (const k of ks) {
    heartbeat(`case ${k}`, true);
    const { c, W } = await runCase(seed, k, { verbose: flag('--verbose'), family });
    out.fams[c.fam] = (out.fams[c.fam] || 0) + 1;
    Object.keys(W.stats).forEach(x => { out.stats[x] += W.stats[x]; });
    Object.keys(W.rate).forEach(x => { out.rate[x] = Math.max(out.rate[x] || 0, W.rate[x]); });
    if (W.fails.length) {
      out.failed.push(k);
      const tags = [...new Set(W.fails.map(f => f.tag))];
      tags.forEach(t => { out.byTag[t] = (out.byTag[t] || 0) + 1; });
      W.fails.slice(0, 4).forEach(f => console.log(`  ✗ case ${k} (${c.fam}) [${f.tag}] at ${mmss(f.t)}: ${f.msg}`));
      if (W.fails.length > 4) console.log(`    … and ${W.fails.length - 4} more in this case`);
      console.log(`    replay: node tools/console-load-loop.mjs --seed ${seed} --case ${k} --verbose${family ? ' --family ' + family : ''}`);
    }
  }
  const st = out.stats;
  const floors = [];
  if (only === null && !family && ks.length >= 64 && !flag('--no-outage')) {
    FAMILIES.forEach(f => { if (!out.fams[f]) floors.push(`family ${f} never ran`); });
    if (st.committed + st.refused < 40) floors.push(`only ${st.committed + st.refused} write clicks reached the server (floor 40)`);
    if (st.windowClicks < 4) floors.push(`only ${st.windowClicks} clicks right after a background read (floor 4)`);
    if (st.downChecks < 200) floors.push(`only ${st.downChecks} checks with the roster down (floor 200)`);
    if (st.recoverChecks < 30) floors.push(`only ${st.recoverChecks} recovery checks (floor 30)`);
    if (st.busyGuards < 3) floors.push(`only ${st.busyGuards} boxes typed in while a retry was out (floor 3)`);
    if (st.whoOpened < 5) floors.push(`only ${st.whoOpened} Who pickers opened (floor 5)`);
    if (st.detailKept < 3) floors.push(`only ${st.detailKept} cards kept on screen over a failed settings read (floor 3)`);
    if (st.hiddenMinutes < 3) floors.push(`only ${st.hiddenMinutes} minutes measured with the tab hidden throughout (floor 3)`);
    if (st.loadingChecks < 100) floors.push(`only ${st.loadingChecks} checks while the first progress read was out (floor 100)`);
  }
  floors.forEach(f => console.log(`  ✗ [coverage] ${f}`));
  const rate = Object.keys(out.rate).sort().map(x => `${x} ${out.rate[x]}`).join(', ');
  const detail = `seed ${seed}; ${Object.keys(out.fams).map(f => f + ' ' + out.fams[f]).join(', ')}; ${st.writeClicks} write clicks (${st.committed} saved, ${st.refused} "Nothing was saved", ${st.windowClicks} right after a background read); ${st.downChecks} checks with the roster down; ${st.loadingChecks} while it was loading; ${st.hiddenMinutes} minutes hidden throughout; ${st.recoverChecks} recovery checks; ${st.whoOpened} Who pickers opened; ${st.detailKept} cards kept over a failed read; ${st.busyGuards} boxes typed in during a retry; ${st.healthyStale} stale-control writes outside this tool (a write's or a view's own read); most reads in a quiet minute: ${rate || '—'}`;
  process.stderr.write(`console-load-loop: ${((Date.now() - t0) / 1000).toFixed(1)} s\n`);
  if (out.failed.length || floors.length) {
    console.log(`console-load-loop: ✗ ${out.failed.length} of ${ks.length} cases failed (${Object.keys(out.byTag).sort().map(t => t + ' ' + out.byTag[t]).join(', ') || 'coverage'}) — ${detail}`);
    process.exit(1);
  }
  console.log(`console-load-loop: ✓ ${ks.length} of ${ks.length} cases held — ${detail}`);
  process.exit(0);
}
