#!/usr/bin/env node
/* stop-loop.mjs — closed loop: "stop everything you start", across every way out (2026-11-25).

     node tools/stop-loop.mjs [options]

   THE QUESTION (.claude/rules/code-hygiene.md rule 4, which only review enforced until now; LOOPS.md proposal #4,
   chosen by Jonathan 2026-11-25). A student (or the console) starts something that plays, ticks, listens or records,
   then leaves by one of the ways out. Afterwards: is anything the started thing made still sounding, ticking, holding
   the mic or recording? Do the site's own "busy" tests (progressLoadRetryBusy in app/save.js, the update reload's
   busyReason in app/start.js) say idle? Is any drill left in a running phase?

   WHEN TO RUN IT. After adding or changing anything that starts sound, a timer, an rAF loop, a listener, the mic or a
   recorder (a drill, a card, a game, a floating tool, a live game), or a way out (activateSet, switchTabById, the hash
   router, caOnToggle / caCloseOpen, the visibilitychange handlers, toggleTranslate, signOut). Node only, no browser,
   no network. The default 221 schedules (one per start × way-out pair) take about 50 s of CPU: 1 to 3 minutes on a
   shared machine (2026-11-25).

   FLAGS
     --seed=S           base seed (default 1): picks the wait before the way out; the same seed gives the same stdout
     --reps=N           every pair N times, each with its own wait (default 1)
     --case=K           only schedule K (with --verbose: every press, every finding with the code that made it)
     --start=a,b        only starts whose id is or begins with these (names: --list)
     --leave=x,y        only these ways out
     --root=DIR         a site folder to test instead of this checkout (a scratch copy with a fix or a planted fault)
     --json=FILE        every schedule's result
     --stall=SEC        watchdog: no step for SEC seconds (default 120) -> prints where it was, exit 3
     --list             the starts and the ways out each one takes
     --verbose          the timeline of each schedule
     --probe=EXPR --before=CODE   (debugging, with --verbose) an expression logged 0/50/200/600 ms after the press;
                        code run in the page just before the press
   Exit 0 = every schedule held; 1 = a schedule failed (KNOWN ones too: the loop stays red until the fix lands), the
   instruments failed their self-test, or a full default run reached no schedule of a KNOWN entry (it looks fixed:
   take the entry out); 2 = bad arguments or the tool crashed; 3 = watchdog. Each FAIL line prints its replay command.
   The last line: "N schedules (D driven; P of T start × way-out pairs), K known (id ×n, …), M new". K counts failing
   schedules whose findings are all KNOWN, M those with at least one finding no KNOWN entry matches.

   WHAT IS REAL. The site's own scripts, unmodified, each under its own file name, in index.html's order, in one Node
   vm context per schedule: config-main.js, class-activities.js, i18n.js, guitar-diagrams.js, every app/*.js part
   (tools/site-src.mjs siteParts), practice-minutes-config.js, practice-minutes.js, fab-tools.js, tuner.js,
   live-quiz.js, live-changes.js, live-hilo.js; module-N.js and the coach-*.js / teacher-*.js parts load when the site
   appends their <script>, as in the browser. Sign-in is the site's own onAuthStateChanged callback (app/start.js):
   loadProgress, loadClassConfig, showApp (or showTeacherApp with ?teacher=true). Every start is the real control
   found in the rendered page (by its onclick or data-* attribute) and clicked: the event runs capture, target,
   bubble, inline on<type> handlers and delegated listeners as a browser does. Every way out is the site's own entry
   point (below). The update reload's test is the real 'controllerchange' listener of app/start.js.

   WHAT IS FAKE.
   - A virtual clock per page (Date, performance.now, setTimeout / setInterval / requestAnimationFrame); TZ
     America/Los_Angeles; a school Wednesday at 10:00. rAF does not fire while the tab is hidden (it waits, as in a
     browser); timeouts are NOT throttled in a hidden tab. Math.random is seeded.
   - A small DOM copied from tools/two-consoles-loop.mjs (innerHTML parsed into a real tree), plus recorded and
     dispatched listeners, <details> 'toggle', and <audio> elements that load in 30 ms, play on the clock and end
     after 200 s (FAKE_MEDIA_SECONDS) unless looped.
   - Web Audio: an AudioContext on the clock; AudioParams keep their automation, so a bus ducked to 0 is silent; a
     source node is AUDIBLE when it is between start and stop / the end of its buffer and some path of connections
     reaches the destination with a gain product above 0.001 in a running context. decodeAudioData gives a 3 s note;
     any .mp3 fetch succeeds (so recorded guitar notes load), every other fetch fails. getUserMedia gives a quiet
     mic whose track is live until stop(); a MediaRecorder records until stop(); a ScriptProcessor connected to
     something gets a buffer of quiet noise every 4096 samples.
   - Firebase: signed in as a made-up student (stu-test0, "Test 0", @example.test) or a made-up teacher; an in-memory
     Firestore (set / merge / update / delete, transactions, batches, queries that match nothing, onSnapshot),
     each answer in 20 ms, a write seen by this page's own listeners at once (the SDK's latency compensation).
     config/class opens Modules 1-11 to the student and dates only the cards a schedule uses. A private song file is
     "already loaded on this page" for the snippet start (sfUrls), and never arrives for song-loading@card.

   WHAT A START IS ("--list" prints them with their ways out): a tab's Play line on a set and on a card; Shuffle,
   Card Deck, Ear Spark, Find-the-Note (mid-round, and answered to the end then the language switch then Start again);
   Note Call, Call the chord, Name the power chord; a practice card, a whole-song card, the ca-54 speed card; a
   backing-track snippet and a private song still loading; the Module Review recorder; the floating Metronome, Timer
   and Tuner; the Listening Coach (open, Start, count-in, listening, with consented recording), and the Coach past its
   30 s recording cap; on the console, "Hear the chord change" in Preview and in a real game, left during the song's
   start-up or once its watch runs. The wait between Start and the way out is drawn from the start's window; a start
   that is not running when the way out comes is "not driven" (listed, never a pass).

   THE WAYS OUT. On a set: another set (activateSet), the Checklist tab (switchTabById), Module Review
   (railModuleReview), In class / Songs / My progress / Games (goExploreHash), the tab hidden (visibilitychange),
   the language (toggleTranslate), sign out (signOut: the page reloads, which kills everything), the step closed in
   the ladder (toggleStepOpen, tab lines only). On a card: closed by its title (details.open = false -> caOnToggle),
   "All activities" (caCloseOpen), another card, back to Modules (exitExploreHash), Songs, My progress, Games, hidden,
   language, sign out. On the console: a real game going live from another console, another console ending the game
   (a liveQuiz/current write), another console view, leaving Preview. The Coach past its cap: no way out ("the-cap").

   WHAT IS ASSERTED, watching 8 s of virtual time after the way out (findings by kind):
     sounding / rings-on  an <audio> element or a source node the start made is audible after GRACE_MS (700 ms);
                          rings-on = a note struck before the way out still ringing
     interval / raf / mic / recorder / processor / snapshot / listener   still running (a document or window
                          listener the start added and never removed counts)
     late-timer           a timeout the start set fires after the grace and changes the page or starts something
     left-running         a drill or player still in its running state (Shuffle 'play', Deck / Ear 'run', Name the power
                          chord 'play', ncLive, chcLive, pcState, snipState, playSeqState, recState, ecRuns, sfWait,
                          coachMicLive)
     retry-busy           progressLoadRetryBusy() is still true
     update-waits         a new service worker takes over and the page does not reload within 2.5 s (busyReason)
     label-outlives       "Recording this take" (#micrec-on) on screen while no capture runs (checked every 500 ms)
     stale-timer          (find-note-end) the round started again is ended by the old round's timer
   Every resource is tagged with the stack that made it ("erPlay app/drills.js:1163 < erStart …"); what the
   practice-minutes engine makes while it counts (its own clock) is not the started thing's and is left out.
   SURVIVORS (const SURVIVORS): what the code itself says is meant to outlive a way out, each with its quoted comment
   (the progress save's timers; the Metronome, Timer and Tuner on navigation; Name the power chord on a hidden tab;
   the download of a private song). KNOWN (const KNOWN): open findings of the 2026-11-25 sweep, counted by id and
   still failing; "product call" marks one waiting on Jonathan.

   THE INSTRUMENTS are self-tested first: a page that starts eight things and stops three must show exactly the five
   left (interval, rAF loop, one audible source of three, mic, listener) and one late timeout. Broken three ways on
   2026-11-25 (no late-timeout record, a gain path that ignores gain, mic tracks not recorded): each went red.

   NOT COVERED. The Song builder's Level / encode on the console (TEACHER-SB-3: needs its Web Worker and lamejs) and
   every other console view; the console's whole-song card (a survivor on a hidden tab, not driven); the Games hub's
   mic games (Power Chord Switch, Note Runner, Strum Radar, Change Up, Riff Runner, …) and the strum-pattern check
   (ca-46): only the Listening Coach is driven, on noise; a live game seen by a STUDENT (#live-quiz) and "Higher or
   lower?" (live-hilo.js); exit checks as a start; chord pop-up strums (strumChord); the Song Journey pages
   (tabs/*.html); timers throttled in a hidden tab; "starting the same thing twice leaves one set of timers"; what a
   page shows when the student comes BACK (a hidden tab shown again). Sign-out only proves that the page reloads. */
import vm from 'node:vm';
import { AsyncLocalStorage } from 'node:async_hooks';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { siteParts } from './site-src.mjs';

const TOOL = fileURLToPath(import.meta.url);
const REPO = join(dirname(TOOL), '..');
const ARGV = process.argv.slice(2);
const flag = n => ARGV.includes(n);
const optEq = (n, d) => { const a = ARGV.find(x => x.startsWith(n + '=')); if (a) return a.slice(n.length + 1); const i = ARGV.indexOf(n); return i >= 0 && i + 1 < ARGV.length && !ARGV[i + 1].startsWith('--') ? ARGV[i + 1] : d; };

/* ════════════════════════════════════════════════════════════════════════
   0. The watchdog (as tools/two-consoles-loop.mjs): the run happens in a child
   process that sends a heartbeat; no heartbeat for --stall seconds (default 120)
   → print the step, kill the child, exit 3. A site loop that never yields is
   only catchable from outside.
   ════════════════════════════════════════════════════════════════════════ */
if (!process.env.STOP_LOOP_CHILD) {
  const stall = Number(optEq('--stall', 120)) * 1000;
  const child = spawn(process.execPath, [TOOL, ...ARGV], { stdio: ['ignore', 'inherit', 'inherit', 'ipc'], env: { ...process.env, STOP_LOOP_CHILD: '1', TZ: 'America/Los_Angeles' } });
  let beat = Date.now(), step = 'starting';
  child.on('message', m => { beat = Date.now(); if (m && m.step) step = m.step; });
  const iv = setInterval(() => {
    if (Date.now() - beat > stall) {
      clearInterval(iv);
      process.stderr.write(`stop-loop: ✗ HUNG — no step for ${Math.round(stall / 1000)} s. Stuck at "${step}"\n`);
      try { child.kill('SIGKILL'); } catch { /* gone */ }
      process.exit(3);
    }
  }, 1000);
  child.on('exit', (code, sig) => { clearInterval(iv); process.exit(code === null ? (sig ? 1 : 0) : code); });
} else {
  process.on('unhandledRejection', e => { if (CURRENT_PAGE && !CURRENT_PAGE.dead) CURRENT_PAGE.errors.push('unhandled rejection: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e))); });
  setImmediate(() => main().then(code => process.exit(code), e => { console.error('stop-loop: tool error —', e && e.stack || e); process.exit(2); }));
}
let lastBeatSent = 0;
let CURRENT_PAGE = null;
function heartbeat(step) {
  const now = Date.now();
  if (now - lastBeatSent < 250) return;
  lastBeatSent = now;
  if (process.send) process.send({ step });
}

/* ════════════════════════════════════════════════════════════════════════
   1. A small DOM, copied from tools/two-consoles-loop.mjs (section 1) so the
   site's own painters run unchanged: innerHTML is parsed into a real tree, so
   getElementById, querySelector, closest, dataset and isConnected answer what a
   browser would. Two additions below the copy (section 1b): listeners that are
   recorded and dispatched, and <audio> elements that play on the virtual clock.
   ════════════════════════════════════════════════════════════════════════ */
/* Every change a selector could see bumps DOM_GEN, so a lookup repeated on an unchanged page is answered from a cache
   (the site asks for the same ids and classes on every timer tick; without it the tool spends most of its time here). */
let DOM_GEN = 0;
class GenMap extends Map { set(k, v) { DOM_GEN++; return super.set(k, v); } delete(k) { DOM_GEN++; return super.delete(k); } clear() { DOM_GEN++; return super.clear(); } }

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
    this.attrs = new GenMap(); this._style = null; this._value = undefined; this._checked = undefined; this.scrollTop = 0; this.scrollLeft = 0;
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
    const t = m[2].toLowerCase(), el = doc.createElement(t);
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
function qsaRaw(root, sel, first, includeRoot) {
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
   1b. What a page starts, recorded. Every resource below is one record in
   page.res: { id, kind, origin, made, where, ... } where `origin` is the
   AsyncLocalStorage label the page was running under when it was made:
   'start' for anything the started thing made (its click, every timer, rAF,
   listener and promise reaction that click led to, however deep), 'leave' for
   the way out, 'boot' and 'page' for the rest. A timer or listener runs under
   the label it was made under, so a chain started by the click stays 'start'
   to the end. `where` is the top site frames of the stack that made it
   ("erPlay app/drills.js:1163 < erStart app/drills.js:1151").
   ════════════════════════════════════════════════════════════════════════ */
const QSA_CACHE = new WeakMap();
function qsa(root, sel, first, includeRoot) {
  let m = QSA_CACHE.get(root); if (!m) QSA_CACHE.set(root, m = new Map());
  const key = (first ? '1' : '0') + (includeRoot ? '1' : '0') + sel, hit = m.get(key);
  if (hit && hit.gen === DOM_GEN) return hit.out.slice();
  const out = qsaRaw(root, sel, first, includeRoot);
  m.set(key, { gen: DOM_GEN, out });
  return out.slice();
}
for (const name of ['appendChild', 'insertBefore', 'removeChild', '_clear', 'replaceChild']) {
  const orig = MElement.prototype[name];
  MElement.prototype[name] = function (...a) { DOM_GEN++; const r = orig.apply(this, a); DOM_GEN++; return r; };
}
for (const [cls, prop] of [[MElement, 'innerHTML'], [MElement, 'textContent'], [MElement, 'checked']]) {
  const d = Object.getOwnPropertyDescriptor(cls.prototype, prop);
  Object.defineProperty(cls.prototype, prop, { configurable: true, get: d.get, set(v) { DOM_GEN++; d.set.call(this, v); DOM_GEN++; } });
}
MDocument.prototype.getElementById = function (id) {
  const c = this._idc || (this._idc = new Map()), hit = c.get(id);
  if (hit && hit.gen === DOM_GEN) return hit.el;
  const el = this._findId(id);
  c.set(id, { gen: DOM_GEN, el });
  return el;
};
const ALS = new AsyncLocalStorage();
const originNow = () => ALS.getStore() || 'page';
Error.stackTraceLimit = 40;
let SITE_FILES = new Set();
/* The site frames on the stack. practice-minutes.js wraps play() to count minutes: a frame of it on top means the
   practice-minutes engine made this (its own 1 s clock, which stops itself; tools/pm-sim.mjs covers it), so the resource
   is not the started thing's (whereNow returns null); a wrapper frame further down is skipped. */
function whereNow() {
  const out = [];
  for (const l of String(new Error().stack).split('\n').slice(2)) {
    const m = /at (?:async )?(?:([\w$.<>]+) )?\(?([^()]+?):(\d+):\d+\)?\s*$/.exec(l);
    if (!m || !SITE_FILES.has(m[2])) continue;
    if (m[2] === 'practice-minutes.js') { if (!out.length && !/\.play$|^HTMLMediaElement/.test(m[1] || '')) return null; continue; }
    out.push(`${(m[1] || '(anon)').replace(/^Object\./, '')} ${m[2]}:${m[3]}`);
    if (out.length >= 3) break;
  }
  return out.join(' < ') || '(no site frame)';
}
/* The first site function on the stack, file and line: the key an allow-list entry names. */
const whereKey = w => String(w).split(' < ')[0];

/* Listeners: recorded on every node and on window, and dispatched for real
   (capture from window down, then target and bubble up, then the inline
   on<type> attribute and the on<type> property, as a browser does). Only
   document's and window's listeners are resources: an element's listener dies
   with the element. */
function addListener(target, type, fn, opts) {
  if (typeof fn !== 'function' && !(fn && typeof fn.handleEvent === 'function')) return;
  const capture = typeof opts === 'boolean' ? opts : !!(opts && opts.capture);
  const ls = target._ls || (target._ls = new Map());
  const arr = ls.get(type) || []; ls.set(type, arr);
  if (arr.some(x => x.fn === fn && x.capture === capture)) return;
  const rec = { fn, capture, once: !!(opts && opts.once), origin: originNow(), alive: true };
  arr.push(rec);
  const page = target.__page || (target.ownerDocument && target.ownerDocument.__page);
  if (page && (target === page.doc || target === page.win)) {
    rec.res = page.track({ kind: 'listener', what: (target === page.doc ? 'document' : 'window') + ' ' + type, alive: () => rec.alive });
  }
  if (opts && opts.signal && typeof opts.signal.addEventListener === 'function') opts.signal.addEventListener('abort', () => removeListener(target, type, fn, opts));
}
function removeListener(target, type, fn, opts) {
  const capture = typeof opts === 'boolean' ? opts : !!(opts && opts.capture);
  const arr = target._ls && target._ls.get(type); if (!arr) return;
  const i = arr.findIndex(x => x.fn === fn && x.capture === capture);
  if (i >= 0) { arr[i].alive = false; arr.splice(i, 1); }
}
function callListener(page, target, rec, ev) {
  if (rec.once) removeListener(target, ev.type, rec.fn, { capture: rec.capture });
  page.guard('listener ' + ev.type, () => ALS.run(rec.origin, () => typeof rec.fn === 'function' ? rec.fn.call(target, ev) : rec.fn.handleEvent(ev)));
}
function dispatch(page, target, ev) {
  ev.target = ev.target || target;
  const path = []; for (let n = target; n; n = n.parentNode) path.push(n);
  if (path[path.length - 1] === page.doc) path.push(page.win);
  ev._path = path;
  const stopped = () => ev._stop;
  for (let i = path.length - 1; i >= 1 && !stopped(); i--) for (const r of [...((path[i]._ls && path[i]._ls.get(ev.type)) || [])]) if (r.capture) { ev.currentTarget = path[i]; callListener(page, path[i], r, ev); }
  for (let i = 0; i < path.length && !stopped(); i++) {
    const n = path[i]; ev.currentTarget = n;
    for (const r of [...((n._ls && n._ls.get(ev.type)) || [])]) if (!r.capture || i === 0) callListener(page, n, r, ev);
    if (n.nodeType === 1) {
      const code = n.getAttribute('on' + ev.type);
      if (code) page.guard(`inline on${ev.type}`, () => page.inlineHandler(code).call(n, ev));
    }
    const prop = n['__on' + ev.type];
    if (typeof prop === 'function') page.guard(`on${ev.type}`, () => prop.call(n, ev));
    if (ev.bubbles === false) break;
  }
  return !ev.defaultPrevented;
}
function makeEvent(type, o) {
  const ev = Object.assign({ type, bubbles: true, cancelable: true, defaultPrevented: false, _stop: false, timeStamp: 0, isTrusted: true, key: '', button: 0, detail: 1 }, o || {});
  ev.preventDefault = () => { ev.defaultPrevented = true; };
  ev.stopPropagation = () => { ev._stop = true; };
  ev.stopImmediatePropagation = () => { ev._stop = true; };
  ev.composedPath = () => (ev._path || []).slice();
  return ev;
}
MNode.prototype.addEventListener = function (t, f, o) { addListener(this, t, f, o); };
MNode.prototype.removeEventListener = function (t, f, o) { removeListener(this, t, f, o); };
MNode.prototype.dispatchEvent = function (ev) { const p = (this.ownerDocument || this).__page; return p ? dispatch(p, this, ev) : true; };
for (const t of ['click', 'load', 'error', 'ended', 'loadedmetadata', 'canplay', 'playing', 'play', 'pause', 'input', 'change', 'keydown', 'timeupdate', 'canplaythrough', 'loadeddata', 'seeked', 'toggle', 'close']) {
  Object.defineProperty(MNode.prototype, 'on' + t, { configurable: true, get() { return this['__on' + t] || null; }, set(v) { this['__on' + t] = v; } });
}
/* <details>.open fires 'toggle' (queued, as in a browser): the In-Class card closes through it (caOnToggle). */
Object.defineProperty(MElement.prototype, 'open', { configurable: true, get() { return this.hasAttribute('open'); }, set(v) {
  const was = this.hasAttribute('open'); this.toggleAttribute('open', !!v);
  const p = this.ownerDocument.__page;
  if (p && this.localName === 'details' && was !== !!v) { const o = originNow(); p.harnessTimer(0, () => ALS.run(o, () => dispatch(p, this, makeEvent('toggle', { bubbles: false })))); }
} });
MElement.prototype.click = function () { const p = this.ownerDocument.__page; if (p) dispatch(p, this, makeEvent('click')); };

/* <audio> / new Audio(): plays on the virtual clock. A file is 200 s long
   (FAKE_MEDIA_SECONDS) unless the tool says otherwise; metadata arrives 30 ms
   after src is set; 'playing' 20 ms after play(); 'ended' at the end unless
   loop. A playing, unmuted element is a sounding resource. */
const FAKE_MEDIA_SECONDS = 200;
class MMedia extends MElement {
  constructor(doc, tag) {
    super(doc, tag || 'audio');
    this._src = ''; this.paused = true; this.ended = false; this.readyState = 0; this._pos = 0; this._at = 0; this.playbackRate = 1; this.defaultPlaybackRate = 1;
    this.loop = false; this.volume = 1; this.muted = false; this.preload = 'auto'; this.duration = NaN; this.preservesPitch = true; this.crossOrigin = null; this._gen = 0;
    const page = doc.__page;
    if (page) this._res = page.track({ kind: 'media', what: 'an <audio> element', alive: () => !this.paused && !this.ended, audibleAt: t => this._audibleAt(t), el: this });
  }
  get src() { return this._src; }
  set src(v) {
    this._src = String(v || ''); this._gen++; this.readyState = 0; this.duration = NaN;
    if (!this.paused) { this._pos = this.currentTime; this.paused = true; this._log('pause'); }
    this._pos = 0; this.ended = false;
    if (this._src && !/^(about:blank)?$/.test(this._src)) {
      const g = this._gen, page = this.ownerDocument.__page;
      page.harnessTimer(30, () => { if (g !== this._gen) return; this.readyState = 4; this.duration = FAKE_MEDIA_SECONDS; ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'].forEach(e => dispatch(page, this, makeEvent(e, { bubbles: false }))); });
    }
  }
  setAttribute(n, v) { if (String(n).toLowerCase() === 'src') this.src = v; else super.setAttribute(n, v); }
  removeAttribute(n) { if (String(n).toLowerCase() === 'src') this.src = ''; else super.removeAttribute(n); }
  get currentTime() { return this.paused ? this._pos : this._pos + (this.ownerDocument.__page.clock.now - this._at) / 1000 * (this.playbackRate || 1); }
  set currentTime(v) { const n = Number(v) || 0, page = this.ownerDocument.__page; this._pos = n; this._at = page.clock.now; this._armEnd(); if (this.readyState >= 1) { this.seeking = true; page.harnessTimer(10, () => { this.seeking = false; dispatch(page, this, makeEvent('seeked', { bubbles: false })); }); } }
  _log(what) { const p = this.ownerDocument.__page; if (p) p.mediaLog.push({ at: p.clock.now, what, el: this }); }
  _armEnd() {
    if (this.paused || !(this.duration > 0)) return;
    const g = ++this._gen, page = this.ownerDocument.__page;
    const left = Math.max(0, (this.duration - this._pos) / (this.playbackRate || 1)) * 1000;
    page.harnessTimer(left, () => {
      if (g !== this._gen || this.paused) return;
      if (this.loop) { this._pos = 0; this._at = page.clock.now; this._armEnd(); return; }
      this._pos = this.duration; this.paused = true; this.ended = true; this._log('ended');
      dispatch(page, this, makeEvent('ended', { bubbles: false }));
    });
  }
  play() {
    const page = this.ownerDocument.__page;
    if (!this._src) return Promise.reject(Object.assign(new Error('no supported source'), { name: 'NotSupportedError' }));
    if (this.ended) { this._pos = 0; this.ended = false; }
    if (this.paused) {
      this.paused = false; this._at = page.clock.now; this._playOrigin = originNow(); this._playWhere = whereNow(); this._log('play');
      if (this._res) { this._res.origin = this._playOrigin; this._res.where = this._playWhere; this._res.made = page.clock.now; }
      const go = () => { dispatch(page, this, makeEvent('play', { bubbles: false })); dispatch(page, this, makeEvent('playing', { bubbles: false })); this._armEnd(); };
      if (this.readyState >= 1) page.harnessTimer(20, go);
      else { const g = this._gen; page.harnessTimer(50, () => { if (g === this._gen && !this.paused) go(); }); }
    }
    return Promise.resolve();
  }
  pause() { if (this.paused) return; this._pos = this.currentTime; this.paused = true; this._gen++; this._log('pause'); dispatch(this.ownerDocument.__page, this, makeEvent('pause', { bubbles: false })); }
  load() { this.src = this._src; }
  canPlayType() { return 'probably'; }
  _audibleAt(t) {
    if (this.paused || this.ended || this.muted || !(this.volume > 0)) return false;
    return this.ownerDocument.__page.dead ? false : true;
  }
}

/* ════════════════════════════════════════════════════════════════════════
   2. The virtual clock, one per page. Timers fire in (time, creation order);
   between two timers every promise reaction runs (setImmediate), as in a
   browser. A page timer is a resource while it is pending (an interval until
   cleared); a harness timer (media ends, the mic's audio frames) is not.
   ════════════════════════════════════════════════════════════════════════ */
class VClock {
  constructor() { this.now = 0; this.seq = 0; this.q = []; }
  add(delay, fn, meta) {
    const id = ++this.seq, at = this.now + Math.max(0, Number(delay) || 0);
    const t = { id, at, fn, meta };
    let lo = 0, hi = this.q.length;
    while (lo < hi) { const mid = (lo + hi) >> 1; const x = this.q[mid]; if (x.at < at || (x.at === at && x.id < id)) lo = mid + 1; else hi = mid; }
    this.q.splice(lo, 0, t);
    return t;
  }
  cancel(t) { const i = this.q.indexOf(t); if (i >= 0) this.q.splice(i, 1); }
}
const flushMicrotasks = async () => { for (let i = 0; i < 3; i++) await new Promise(r => setImmediate(r)); };

/* ════════════════════════════════════════════════════════════════════════
   3. Web Audio, the mic and the recorder, fake but faithful where it counts:
   an AudioContext whose currentTime is the virtual clock; AudioParams that
   keep their automation (setValueAtTime, ramps, setTargetAtTime, cancel), so
   a bus ducked to 0 is silent; source nodes that sound from start(when) to
   stop(when) or the end of their buffer; a node is AUDIBLE at time t when it
   is sounding and some path of connections reaches the destination with a
   gain product above 0.001 in a running context. getUserMedia gives a stream
   whose tracks are live until stop(); a MediaRecorder records until stop().
   A ScriptProcessor connected to something gets onaudioprocess every buffer
   (quiet noise in), driven by the harness while it stays connected.
   ════════════════════════════════════════════════════════════════════════ */
class AParam {
  constructor(ctx, v) { this.ctx = ctx; this._v = v; this.ev = []; this.defaultValue = v; this.minValue = -3.4e38; this.maxValue = 3.4e38; }
  get value() { return this.valueAt(this.ctx.currentTime); }
  set value(v) { this._v = Number(v); this.ev = this.ev.filter(e => e.t < this.ctx.currentTime); this.ev.push({ k: 'set', v: Number(v), t: this.ctx.currentTime }); }
  _add(e) { this.ev.push(e); this.ev.sort((a, b) => a.t - b.t); return this; }
  setValueAtTime(v, t) { return this._add({ k: 'set', v: Number(v), t: Number(t) || 0 }); }
  linearRampToValueAtTime(v, t) { return this._add({ k: 'lin', v: Number(v), t: Number(t) || 0 }); }
  exponentialRampToValueAtTime(v, t) { return this._add({ k: 'exp', v: Number(v), t: Number(t) || 0 }); }
  setTargetAtTime(v, t, tc) { return this._add({ k: 'tgt', v: Number(v), t: Number(t) || 0, tc: Number(tc) || 0.01 }); }
  setValueCurveAtTime(arr, t, d) { const a = Array.from(arr || []); return this._add({ k: 'set', v: a.length ? a[a.length - 1] : this._v, t: (Number(t) || 0) + (Number(d) || 0) }); }
  cancelScheduledValues(t) { const v = this.valueAt(Number(t) || 0); this.ev = this.ev.filter(e => e.t < (Number(t) || 0)); this._v = v; return this; }
  cancelAndHoldAtTime(t) { return this.cancelScheduledValues(t); }
  valueAt(T) {
    let v = this._v, prevT = 0, prevV = this._v;
    for (const e of this.ev) {
      if (e.k === 'tgt') { if (e.t > T) break; const x = (T - e.t) / e.tc; v = e.v + (prevV - e.v) * Math.exp(-x); prevV = v; prevT = T; continue; }
      if (e.t <= T) { v = e.v; prevT = e.t; prevV = e.v; continue; }
      if (e.k === 'lin') v = prevV + (e.v - prevV) * (T - prevT) / Math.max(1e-9, e.t - prevT);
      else if (e.k === 'exp') v = prevV > 0 && e.v > 0 ? prevV * Math.pow(e.v / prevV, (T - prevT) / Math.max(1e-9, e.t - prevT)) : prevV;
      break;
    }
    return v;
  }
}
class ANode {
  constructor(ctx, kind) { this.context = ctx; this.kind = kind; this.out = new Set(); this.numberOfInputs = 1; this.numberOfOutputs = 1; this.channelCount = 2; this._ls = null; }
  connect(n) { if (n) this.out.add(n); if (this._onConnect) this._onConnect(); return n; }
  disconnect(n) { if (n) this.out.delete(n); else this.out.clear(); }
  addEventListener(t, f, o) { addListener(this, t, f, o); } removeEventListener(t, f, o) { removeListener(this, t, f, o); }
  gainAt() { return 1; }
}
function pathGain(node, t, depth) {
  if (node === node.context.destination) return 1;
  if (depth > 24 || !(node instanceof ANode)) return 0;
  let best = 0;
  for (const o of node.out) { const g = pathGain(o, t, depth + 1); if (g > best) best = g; }
  return best * Math.abs(node.gainAt(t));
}
class AGain extends ANode { constructor(ctx) { super(ctx, 'gain'); this.gain = new AParam(ctx, 1); } gainAt(t) { return this.gain.valueAt(t); } }
class ASource extends ANode {
  constructor(ctx, kind) {
    super(ctx, kind); this.started = null; this.stopAt = Infinity; this.buffer = null; this.loop = false; this.loopStart = 0; this.loopEnd = 0;
    this.playbackRate = new AParam(ctx, 1); this.detune = new AParam(ctx, 0); this.frequency = new AParam(ctx, 440); this.offset = new AParam(ctx, 1); this.type = 'sine'; this.onended = null; this._ended = false;
  }
  _end() { const bufS = this.buffer && this.buffer.duration > 0 ? this.buffer.duration : null; const natural = this.kind === 'buffer' && !this.loop ? (bufS == null ? 0 : this.started + Math.max(0, bufS - this._off) / Math.max(1e-6, this.playbackRate.valueAt(this.started))) : Infinity; return Math.min(this.stopAt, natural); }
  start(when, off) {
    const ctx = this.context, page = ctx._page;
    if (this.started !== null) throw Object.assign(new Error('start() twice'), { name: 'InvalidStateError' });
    this.started = Math.max(ctx.currentTime, Number(when) || 0); this._off = Number(off) || 0;
    this._res = page.track({ kind: 'source', what: this.kind === 'osc' ? 'an oscillator' : this.kind === 'const' ? 'a constant source' : 'an audio buffer source', alive: () => !this._ended && ctx.currentTime < this._end() && ctx.state !== 'closed', audibleAt: () => this._audibleAt(ctx.currentTime) });
    this._armEnd();
  }
  stop(when) { if (this.started === null) throw Object.assign(new Error('stop() before start()'), { name: 'InvalidStateError' }); this.stopAt = Math.max(this.context.currentTime, Number(when) || 0); this._armEnd(); }
  _armEnd() {
    const ctx = this.context, page = ctx._page, end = this._end(), g = (this._g = (this._g || 0) + 1);
    if (end === Infinity) return;
    page.harnessTimer(Math.max(0, (end - ctx.currentTime) * 1000), () => {
      if (g !== this._g || this._ended) return; this._ended = true;
      const ev = makeEvent('ended', { bubbles: false, target: this });
      if (typeof this.onended === 'function') page.guard('onended', () => this.onended(ev));
      for (const r of [...((this._ls && this._ls.get('ended')) || [])]) callListener(page, this, r, ev);
    });
  }
  _audibleAt(t) {
    const ctx = this.context;
    if (this.started === null || this._ended || ctx.state !== 'running' || ctx._page.dead) return false;
    if (t < this.started || t >= this._end()) return false;
    return pathGain(this, t, 0) > 0.001;
  }
}
class AScriptProc extends ANode {
  constructor(ctx, size) {
    super(ctx, 'script'); this.bufferSize = size || 4096; this.onaudioprocess = null; this._ins = 0;
    const page = ctx._page;
    this._res = page.track({ kind: 'processor', what: 'a ScriptProcessor (mic frames)', alive: () => this._live() });
    this._tick = () => {
      if (!this._live()) { this._armed = false; return; }
      if (typeof this.onaudioprocess === 'function') {
        const n = this.bufferSize, rnd = page.rng;
        const inBuf = { sampleRate: ctx.sampleRate, length: n, duration: n / ctx.sampleRate, numberOfChannels: 1, getChannelData: () => { const a = new Float32Array(n); for (let i = 0; i < n; i += 1) a[i] = (rnd() - 0.5) * 0.002; return a; } };
        const outBuf = { sampleRate: ctx.sampleRate, length: n, numberOfChannels: 1, getChannelData: () => new Float32Array(n) };
        page.guard('onaudioprocess', () => ALS.run(this._res.origin, () => this.onaudioprocess({ inputBuffer: inBuf, outputBuffer: outBuf, playbackTime: ctx.currentTime })));
      }
      page.harnessTimer(this.bufferSize / ctx.sampleRate * 1000, this._tick);
    };
    this._onConnect = () => { if (!this._armed) { this._armed = true; page.harnessTimer(this.bufferSize / ctx.sampleRate * 1000, this._tick); } };
  }
  _live() { return !this.context._page.dead && this.context.state === 'running' && (this.out.size > 0 || this._ins > 0); }
}
class AAnalyser extends ANode {
  constructor(ctx) { super(ctx, 'analyser'); this.fftSize = 2048; this.smoothingTimeConstant = 0.8; this.minDecibels = -100; this.maxDecibels = -30; }
  get frequencyBinCount() { return this.fftSize / 2; }
  getFloatTimeDomainData(a) { const r = this.context._page.rng; for (let i = 0; i < a.length; i++) a[i] = (r() - 0.5) * 0.002; }
  getByteTimeDomainData(a) { a.fill(128); } getFloatFrequencyData(a) { a.fill(-100); } getByteFrequencyData(a) { a.fill(0); }
}
class FakeAudioContext {
  constructor(page, opts) {
    this._page = page; this.state = 'running'; this.sampleRate = (opts && opts.sampleRate) || 48000; this._t0 = page.clock.now; this.baseLatency = 0.01; this.outputLatency = 0.02;
    this.destination = new ANode(this, 'dest'); this.listener = {}; this._ls = null; this.onstatechange = null;
    this.audioWorklet = { addModule: () => Promise.reject(new Error('no AudioWorklet in the simulator')) };
    page.contexts.push(this);
  }
  get currentTime() { return (this._page.clock.now - this._t0) / 1000; }
  getOutputTimestamp() { return { contextTime: this.currentTime, performanceTime: this._page.clock.now }; }
  createGain() { return new AGain(this); }
  createOscillator() { return new ASource(this, 'osc'); }
  createBufferSource() { return new ASource(this, 'buffer'); }
  createConstantSource() { return new ASource(this, 'const'); }
  createBiquadFilter() { const n = new ANode(this, 'biquad'); n.frequency = new AParam(this, 350); n.Q = new AParam(this, 1); n.gain = new AParam(this, 0); n.detune = new AParam(this, 0); n.type = 'lowpass'; n.getFrequencyResponse = () => {}; return n; }
  createDynamicsCompressor() { const n = new ANode(this, 'comp'); ['threshold', 'knee', 'ratio', 'attack', 'release'].forEach(k => { n[k] = new AParam(this, 0); }); n.reduction = 0; return n; }
  createStereoPanner() { const n = new ANode(this, 'pan'); n.pan = new AParam(this, 0); return n; }
  createDelay() { const n = new ANode(this, 'delay'); n.delayTime = new AParam(this, 0); return n; }
  createConvolver() { const n = new ANode(this, 'conv'); n.buffer = null; return n; }
  createWaveShaper() { const n = new ANode(this, 'shaper'); n.curve = null; return n; }
  createChannelMerger() { return new ANode(this, 'merge'); }
  createChannelSplitter() { return new ANode(this, 'split'); }
  createAnalyser() { return new AAnalyser(this); }
  createScriptProcessor(size) { return new AScriptProc(this, size); }
  createMediaStreamSource(stream) { const n = new ANode(this, 'mic'); n.mediaStream = stream; const c = n.connect.bind(n); n.connect = x => { if (x instanceof AScriptProc) { x._ins++; x._onConnect(); } return c(x); }; const d = n.disconnect.bind(n); n.disconnect = x => { for (const o of (x ? [x] : [...n.out])) if (o instanceof AScriptProc) o._ins = Math.max(0, o._ins - 1); d(x); }; return n; }
  createMediaElementSource(el) { const n = new ANode(this, 'element'); n.mediaElement = el; return n; }
  createMediaStreamDestination() { const n = new ANode(this, 'streamdest'); n.stream = makeStream(this._page, false); return n; }
  createBuffer(ch, len, sr) { const data = Array.from({ length: ch }, () => new Float32Array(len)); return { numberOfChannels: ch, length: len, sampleRate: sr, duration: len / sr, getChannelData: i => data[i], copyToChannel() {}, copyFromChannel() {} }; }
  createPeriodicWave() { return {}; }
  decodeAudioData(ab, ok, err) {
    const sr = 48000, len = sr * 3; const b = this.createBuffer(1, len, sr); const d = b.getChannelData(0); d[100] = 0.5; d[101] = -0.4;
    if (typeof ok === 'function') ok(b); return Promise.resolve(b);
  }
  _setState(s) { if (this.state === s) return; this.state = s; const ev = makeEvent('statechange', { bubbles: false }); if (typeof this.onstatechange === 'function') this.onstatechange(ev); for (const r of [...((this._ls && this._ls.get('statechange')) || [])]) callListener(this._page, this, r, ev); }
  resume() { if (this.state !== 'closed') this._setState('running'); return Promise.resolve(); }
  suspend() { if (this.state !== 'closed') this._setState('suspended'); return Promise.resolve(); }
  close() { this._setState('closed'); return Promise.resolve(); }
  addEventListener(t, f, o) { addListener(this, t, f, o); } removeEventListener(t, f, o) { removeListener(this, t, f, o); }
}
function makeStream(page, isMic) {
  const tracks = [];
  const stream = { id: 'stream' + (++page.streamSeq), active: true, getTracks: () => tracks.slice(), getAudioTracks: () => tracks.slice(), getVideoTracks: () => [], addEventListener() {}, removeEventListener() {} };
  if (isMic) {
    const tr = { kind: 'audio', label: 'Simulated mic', id: 'trk' + page.streamSeq, enabled: true, muted: false, readyState: 'live', onended: null,
      stop() { tr.readyState = 'ended'; }, getSettings: () => ({ sampleRate: 48000, channelCount: 1, echoCancellation: false, autoGainControl: false, noiseSuppression: false }),
      getConstraints: () => ({}), applyConstraints: () => Promise.resolve(), addEventListener() {}, removeEventListener() {}, clone() { return tr; } };
    tracks.push(tr);
    tr._res = page.track({ kind: 'mic', what: 'a mic track', alive: () => tr.readyState === 'live' && !page.dead });
  }
  return stream;
}
function makeMediaRecorderClass(page) {
  return class MediaRecorder {
    static isTypeSupported() { return true; }
    constructor(stream, opts) { this.stream = stream; this.mimeType = (opts && opts.mimeType) || 'audio/webm'; this.state = 'inactive'; this._ls = null; this.ondataavailable = null; this.onstop = null; this.onstart = null; this.onerror = null; }
    addEventListener(t, f, o) { addListener(this, t, f, o); } removeEventListener(t, f, o) { removeListener(this, t, f, o); }
    _fire(type, extra) { const ev = makeEvent(type, Object.assign({ bubbles: false, target: this }, extra)); if (typeof this['on' + type] === 'function') page.guard('recorder on' + type, () => this['on' + type](ev)); for (const r of [...((this._ls && this._ls.get(type)) || [])]) callListener(page, this, r, ev); }
    start() { if (this.state !== 'inactive') throw Object.assign(new Error('not inactive'), { name: 'InvalidStateError' }); this.state = 'recording'; this._res = page.track({ kind: 'recorder', what: 'a MediaRecorder', alive: () => this.state === 'recording' && !page.dead }); page.harnessTimer(5, () => this._fire('start')); }
    stop() { if (this.state === 'inactive') return; this.state = 'inactive'; page.harnessTimer(10, () => { this._fire('dataavailable', { data: new (page.ctx.Blob)(['x'], { type: this.mimeType }) }); this._fire('stop'); }); }
    pause() { if (this.state === 'recording') this.state = 'paused'; } resume() { if (this.state === 'paused') this.state = 'recording'; }
    requestData() {}
  };
}

/* ════════════════════════════════════════════════════════════════════════
   4. Firebase, fake: Auth signed in as a made-up student ("Test 0",
   stu-test0@example.test) and an in-memory Firestore (set with merge, update,
   delete, transactions, batches, queries that match nothing, and onSnapshot
   listeners, which are resources until unsubscribed). Each answer takes 20 ms.
   The tool writes liveQuiz/current itself to start or move a live game.
   ════════════════════════════════════════════════════════════════════════ */
class FieldValue { constructor(k, x) { this.__fv = k; this.x = x; Object.freeze(this); } }
class FTimestamp { constructor(ms) { this.seconds = Math.floor(ms / 1000); this.nanoseconds = (ms % 1000) * 1e6; this._ms = ms; } toMillis() { return this._ms; } toDate() { return new Date(this._ms); } isEqual(o) { return o && o._ms === this._ms; } }
const FV = (k, x) => new FieldValue(k, x);
/* A copy of stored data: plain objects and arrays copied, timestamps kept (structuredClone would drop their methods). */
const dclone = v => Array.isArray(v) ? v.map(dclone) : v && typeof v === 'object' && !(v instanceof FTimestamp) && !(v instanceof Date) ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, dclone(x)])) : v;
function applyMerge(base, patch, merge) {
  const out = merge ? dclone(base || {}) : {};
  const put = (obj, k, v) => {
    if (v && v.__fv === 'delete') { delete obj[k]; return; }
    if (v && v.__fv === 'ts') { obj[k] = new FTimestamp(BASE_TIME + (CURRENT_PAGE ? CURRENT_PAGE.clock.now : 0)); return; }
    if (v && v.__fv === 'inc') { obj[k] = (Number(obj[k]) || 0) + v.x; return; }
    if (v && v.__fv === 'union') { const a = Array.isArray(obj[k]) ? obj[k].slice() : []; v.x.forEach(e => { if (!a.includes(e)) a.push(e); }); obj[k] = a; return; }
    if (v && v.__fv === 'remove') { obj[k] = (Array.isArray(obj[k]) ? obj[k] : []).filter(e => !v.x.includes(e)); return; }
    if (merge && v && typeof v === 'object' && !Array.isArray(v) && Object.keys(v).length && !(v instanceof Date) && !(v instanceof FTimestamp)) { obj[k] = obj[k] && typeof obj[k] === 'object' && !Array.isArray(obj[k]) ? obj[k] : {}; for (const [k2, v2] of Object.entries(v)) put(obj[k], k2, v2); return; }
    obj[k] = dclone(v);
  };
  for (const [k, v] of Object.entries(patch || {})) {
    if (k.includes('.') && merge === 'update') { const ps = k.split('.'); let o = out; for (const p of ps.slice(0, -1)) o = (o[p] = o[p] && typeof o[p] === 'object' ? o[p] : {}); put(o, ps[ps.length - 1], v); }
    else put(out, k, v);
  }
  return out;
}
function makeFirestore(page) {
  const docs = page.docs, subs = new Map();
  const later = fn => new Promise((res, rej) => page.harnessTimer(20, () => { try { res(fn()); } catch (e) { rej(e); } }));
  const snap = (path, id) => { const d = docs.get(path); return { id, ref: docRef(path), exists: d !== undefined, data: () => (d === undefined ? undefined : dclone(d)), get: k => d && d[k], metadata: { fromCache: false, hasPendingWrites: false } }; };
  const notify = path => { for (const s of [...(subs.get(path) || [])]) if (s.alive) page.harnessTimer(1, () => { if (s.alive) page.guard('onSnapshot', () => ALS.run(s.origin, () => s.next(snap(path, path.split('/').pop())))); }); };
  page.fsWrite = (path, data, merge) => { docs.set(path, applyMerge(docs.get(path), data, merge)); notify(path); };
  page.fsDelete = path => { docs.delete(path); notify(path); };
  const query = (cpath) => {
    const q = {
      where: () => q, orderBy: () => q, limit: () => q, limitToLast: () => q, startAfter: () => q, startAt: () => q, endAt: () => q, endBefore: () => q,
      get: () => later(() => { const ds = [...docs.keys()].filter(p => p.startsWith(cpath + '/') && !p.slice(cpath.length + 1).includes('/')).map(p => snap(p, p.split('/').pop())); return { docs: ds, empty: !ds.length, size: ds.length, forEach: f => ds.forEach(f) }; }),
      onSnapshot: (next) => { const s = { next: () => {}, alive: true, origin: originNow() }; s.res = page.track({ kind: 'snapshot', what: 'an onSnapshot listener on ' + cpath, alive: () => s.alive && !page.dead }); const f = typeof next === 'function' ? next : next && next.next; page.harnessTimer(5, () => { if (s.alive && f) page.guard('onSnapshot', () => ALS.run(s.origin, () => f({ docs: [], empty: true, size: 0, forEach() {}, docChanges: () => [] }))); }); return () => { s.alive = false; }; },
      doc: id => docRef(cpath + '/' + (id || ('auto' + (++page.autoId)))), path: cpath, id: cpath.split('/').pop(),
      add: data => { const r = docRef(cpath + '/auto' + (++page.autoId)); return r.set(data).then(() => r); },
    };
    return q;
  };
  function docRef(path) {
    return {
      id: path.split('/').pop(), path, parent: { id: path.split('/').slice(-2, -1)[0] },
      collection: c => query(path + '/' + c),
      get: () => page.holdSongFiles && /^songFiles\//.test(path) ? new Promise(() => {}) : later(() => snap(path, path.split('/').pop())),
      /* As the SDK does: the write shows in this page's listeners at once (latency compensation); its promise settles when the server answers. */
      set: (data, opt) => { page.fsWrite(path, data, !!(opt && (opt.merge || opt.mergeFields))); return later(() => {}); },
      update: data => { if (!docs.has(path)) return later(() => { throw Object.assign(new Error('No document to update'), { code: 'not-found' }); }); page.fsWrite(path, data, 'update'); return later(() => {}); },
      delete: () => { page.fsDelete(path); return later(() => {}); },
      onSnapshot: (a, b, c) => {
        const next = typeof a === 'function' ? a : typeof b === 'function' ? b : (a && a.next) || (b && b.next);
        const s = { next: next || (() => {}), alive: true, origin: originNow() };
        if (!subs.has(path)) subs.set(path, []);
        subs.get(path).push(s);
        s.res = page.track({ kind: 'snapshot', what: 'an onSnapshot listener on ' + path, alive: () => s.alive && !page.dead });
        page.harnessTimer(20, () => { if (s.alive) page.guard('onSnapshot', () => ALS.run(s.origin, () => s.next(snap(path, path.split('/').pop())))); });
        return () => { s.alive = false; };
      },
      isEqual: o => o && o.path === path,
    };
  }
  const db = {
    collection: c => query(c), doc: p => docRef(p),
    runTransaction: async fn => { await later(() => 0); const tx = { get: r => Promise.resolve(snap(r.path, r.id)), set: (r, d, o) => { page.fsWrite(r.path, d, !!(o && o.merge)); return tx; }, update: (r, d) => { page.fsWrite(r.path, d, 'update'); return tx; }, delete: r => { page.fsDelete(r.path); return tx; } }; return fn(tx); },
    batch: () => { const ops = []; const b = { set: (r, d, o) => { ops.push(() => page.fsWrite(r.path, d, !!(o && o.merge))); return b; }, update: (r, d) => { ops.push(() => page.fsWrite(r.path, d, 'update')); return b; }, delete: r => { ops.push(() => page.fsDelete(r.path)); return b; }, commit: () => later(() => ops.forEach(f => f())) }; return b; },
    enablePersistence: () => Promise.resolve(), settings() {}, enableNetwork: () => Promise.resolve(), disableNetwork: () => Promise.resolve(), waitForPendingWrites: () => Promise.resolve(),
  };
  const fs = Object.assign(() => db, {
    FieldValue: Object.assign(FieldValue, { delete: () => FV('delete'), serverTimestamp: () => FV('ts'), increment: n => FV('inc', n), arrayUnion: (...a) => FV('union', a), arrayRemove: (...a) => FV('remove', a) }),
    FieldPath: { documentId: () => '__name__' },
    Timestamp: Object.assign(FTimestamp, { now: () => new FTimestamp(page.ctx.Date.now()), fromMillis: ms => new FTimestamp(ms), fromDate: d => new FTimestamp(+d) }),
    Blob: { fromUint8Array: u => ({ toUint8Array: () => u }) },
  });
  return fs;
}
function makeAuth(page) {
  const cbs = [];
  const auth = {
    currentUser: null,
    onAuthStateChanged(cb) { cbs.push(cb); page.harnessTimer(30, () => page.guard('onAuthStateChanged', () => ALS.run('boot', () => cb(auth.currentUser)))); return () => { const i = cbs.indexOf(cb); if (i >= 0) cbs.splice(i, 1); }; },
    signOut() { auth.currentUser = null; return new Promise(res => page.harnessTimer(30, () => { cbs.forEach(cb => page.guard('onAuthStateChanged', () => cb(null))); res(); })); },
    signInWithPopup() { return new Promise(() => {}); },
    setPersistence: () => Promise.resolve(), useDeviceLanguage() {}, getRedirectResult: () => Promise.resolve(null),
  };
  return auth;
}

/* ════════════════════════════════════════════════════════════════════════
   5. A page: one load of index.html (or ?teacher=true), its own vm context,
   clock, DOM, storage, audio and fake Firebase. The site's scripts run whole
   and unmodified, each under its own file name, in index.html's order; the
   lazy ones (module-N.js, the coach-*.js and teacher-*.js parts) load when
   the site appends their <script>, as in the browser.
   ════════════════════════════════════════════════════════════════════════ */
const BASE_TIME = Date.UTC(2026, 10, 18, 18, 0, 0);   // Wednesday 18 Nov 2026, 10:00 in Los Angeles: a school day
let SITE = null;
function compileSite(root) {
  const S = (file, text) => new vm.Script(text, { filename: file });
  const read = f => readFileSync(join(root, f), 'utf8');
  const files = [];
  const add = f => { if (existsSync(join(root, f))) files.push(f); };
  ['config-main.js', 'class-activities.js', 'i18n.js', 'guitar-diagrams.js'].forEach(add);
  files.push(...siteParts('app.js', root));
  ['practice-minutes-config.js', 'practice-minutes.js', 'fab-tools.js', 'tuner.js', 'live-quiz.js', 'live-changes.js', 'live-hilo.js'].forEach(add);
  const scripts = [S('(made-up firebase-config)', "const IS_PRACTICE_COPY = false; const firebaseConfig = { projectId: 'stop-loop-sim', apiKey: 'none' }; const TEACHER_EMAIL = 'teacher@example.test';")];
  for (const f of files) scripts.push(S(f, read(f)));
  const lazy = new Map();
  for (const f of readdirSync(root)) if (/^(module-\d+|coach(-[\w-]+)?|teacher(-[\w-]+)?)\.js$/.test(f)) lazy.set(f, S(f, read(f)));
  const html = read('index.html');
  const body = /<body[^>]*>([\s\S]*)<\/body>/i.exec(html);
  if (!body) throw new Error('index.html has no <body>');
  SITE_FILES = new Set([...files, ...lazy.keys()]);
  return { root, scripts, lazy, bodyHtml: body[1].replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<!--[\s\S]*?-->/g, '') };
}
function makePage(opts) {
  const clock = new VClock();
  const doc = new MDocument();
  const page = { clock, doc, res: [], lateWork: [], leaveAt: null, graceMs: 0, errors: [], mediaLog: [], contexts: [], docs: new Map(), dead: false, reloaded: 0, streamSeq: 0, autoId: 0, rng: opts.rng, teacher: !!opts.teacher, swLs: [], alerts: [], log: [], handlers: new Map(), resSeq: 0 };
  doc.__page = page;
  CURRENT_PAGE = page;
  const origCreate = doc.createElement.bind(doc);
  doc.createElement = t => { const n = String(t).toLowerCase(); return n === 'audio' || n === 'video' ? new MMedia(doc, n) : origCreate(t); };
  page.track = r => { r.origin = originNow(); r.made = clock.now; r.id = ++page.resSeq; if (r.origin === 'start' || r.origin === 'leave') { r.where = whereNow(); if (r.where !== null) page.res.push(r); } return r; };
  page.guard = (what, fn) => {
    try { const r = fn(); if (r && typeof r.then === 'function') r.then(null, e => { if (!page.dead) page.errors.push(`${what}: unhandled rejection: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e)}`); }); return r; }
    catch (e) { if (!page.dead) page.errors.push(`${what}: threw: ${e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e)}`); }
  };
  page.harnessTimer = (ms, fn) => clock.add(ms, () => { if (!page.dead) fn(); }, { harness: true });
  const timers = new Map(); let tSeq = 0;
  const addTimer = (kind, fn, ms, args) => {
    const id = ++tSeq, origin = originNow();
    const rec = { kind, fn, ms: Math.max(kind === 'interval' ? 1 : 0, Number(ms) || 0), origin, pending: true };
    const arm = () => { rec.t = clock.add(rec.ms, () => {
      if (!rec.pending) return;
      if (kind !== 'interval') { rec.pending = false; timers.delete(id); } else arm();
      /* Work done after the way out by a timeout the started thing set: the page changed (DOM), or something new was made. */
      const late = origin === 'start' && kind === 'timeout' && page.leaveAt != null && clock.now >= page.leaveAt + page.graceMs;
      const g0 = DOM_GEN, r0 = page.resSeq;
      ALS.run(origin, () => page.guard(kind, () => typeof fn === 'function' ? fn(...(kind === 'raf' ? [clock.now] : args)) : vm.runInContext(String(fn), page.ctx)));
      if (late && (DOM_GEN !== g0 || page.resSeq !== r0)) page.lateWork.push({ at: clock.now, where: rec.res.where, what: `a setTimeout (${Math.round(rec.ms)} ms) that ${page.resSeq !== r0 ? 'started something' : 'changed the page'} when it fired` });
    }, { id }); if (kind === 'raf') rec.t.meta.raf = true; };
    arm();
    timers.set(id, rec);
    rec.res = page.track({ kind, what: kind === 'raf' ? 'a requestAnimationFrame' : kind === 'interval' ? `a setInterval (${rec.ms} ms)` : `a setTimeout (${rec.ms} ms)`, alive: () => rec.pending && !page.dead });
    return id;
  };
  const clearTimer = id => { const rec = timers.get(Number(id)); if (!rec) return; rec.pending = false; clock.cancel(rec.t); timers.delete(Number(id)); };
  const store = () => { const d = new Map(); return { getItem: k => d.has(String(k)) ? d.get(String(k)) : null, setItem: (k, v) => { d.set(String(k), String(v)); }, removeItem: k => { d.delete(String(k)); }, clear: () => d.clear(), key: i => [...d.keys()][i] ?? null, get length() { return d.size; } }; };
  const fmts = new Map();
  const fmt = (loc, o, d) => { const key = JSON.stringify([loc, o]); let f = fmts.get(key); if (!f) fmts.set(key, f = new Intl.DateTimeFormat(loc, o)); return f.format(d); };
  const hasDate = o => o && ['year', 'month', 'day', 'weekday', 'dateStyle'].some(k => k in o), hasTime = o => o && ['hour', 'minute', 'second', 'timeStyle'].some(k => k in o);
  class VDate extends Date {
    constructor(...a) { if (a.length === 0) super(BASE_TIME + clock.now); else super(...a); }
    static now() { return BASE_TIME + clock.now; }
    toLocaleDateString(loc, o) { return hasDate(o) && !hasTime(o) ? fmt(loc, o, this) : super.toLocaleDateString(loc, o); }
    toLocaleTimeString(loc, o) { return hasTime(o) && !hasDate(o) ? fmt(loc, o, this) : super.toLocaleTimeString(loc, o); }
  }
  const search = page.teacher ? '?teacher=true' : '';
  const loc = { search, hostname: 'sim.example.test', host: 'sim.example.test', origin: 'http://sim.example.test', protocol: 'http:', pathname: '/index.html', _hash: opts.hash || '',
    get hash() { return this._hash; }, set hash(v) { const h = String(v || ''); const nh = h && !h.startsWith('#') ? '#' + h : (h === '#' ? '' : h); if (nh === this._hash) return; this._hash = nh; page.ctx.history._e.splice(page.ctx.history._i + 1); page.ctx.history._e.push({ state: null, hash: nh }); page.ctx.history._i++; page.harnessTimer(0, () => dispatch(page, page.win, makeEvent('hashchange', { bubbles: false }))); },
    get href() { return this.origin + this.pathname + this.search + this._hash; }, set href(v) { const m = /#.*$/.exec(String(v)); this.hash = m ? m[0] : ''; },
    reload() { page.reload(); }, replace(u) { this.href = u; }, assign(u) { this.href = u; }, toString() { return this.href; } };
  const setHashFromUrl = u => { if (u == null) return; const m = /#.*$/.exec(String(u)); loc._hash = m ? (m[0] === '#' ? '' : m[0]) : (/^[?/]|^https?:/.test(String(u)) || String(u) === '' ? '' : loc._hash); };
  page.mic = { asks: 0 };
  const ctx = {
    console: { log() {}, info() {}, debug() {}, warn() {}, error: (...a) => { page.log.push('console.error: ' + a.map(x => x && x.stack ? x.stack.split('\n')[0] : String(x)).join(' ')); }, trace() {}, group() {}, groupEnd() {}, table() {} },
    document: doc, localStorage: store(), sessionStorage: store(), location: loc,
    history: {
      scrollRestoration: 'auto', _e: [{ state: null, hash: opts.hash || '' }], _i: 0,
      get state() { return this._e[this._i].state; }, get length() { return this._e.length; },
      replaceState(s, t, u) { setHashFromUrl(u); this._e[this._i] = { state: s, hash: loc._hash }; },
      pushState(s, t, u) { setHashFromUrl(u); this._e.splice(this._i + 1); this._e.push({ state: s, hash: loc._hash }); this._i++; },
      go(n) { const j = Math.max(0, Math.min(this._e.length - 1, this._i + (Number(n) || 0))); if (j === this._i) return; this._i = j; page.harnessTimer(0, () => { loc._hash = this._e[this._i].hash; dispatch(page, page.win, makeEvent('popstate', { bubbles: false, state: this._e[this._i].state })); }); },
      back() { this.go(-1); }, forward() { this.go(1); } },
    navigator: {
      userAgent: 'stop-loop (Node)', platform: 'node', language: 'en-US', languages: ['en-US'], onLine: true, maxTouchPoints: 0, hardwareConcurrency: 4,
      clipboard: { writeText: () => Promise.resolve() }, vibrate() { return true; }, wakeLock: undefined,
      serviceWorker: { controller: { postMessage() {} }, register: () => Promise.resolve({ update() {}, addEventListener() {} }), ready: new Promise(() => {}), getRegistrations: () => Promise.resolve([]),
        addEventListener: (t, f) => { page.swLs.push({ t, f }); }, removeEventListener() {} },
      mediaDevices: { getUserMedia: () => { page.mic.asks++; const o = originNow(), w = whereNow(); return new Promise(res => page.harnessTimer(50, () => ALS.run(o, () => { const st = makeStream(page, true); st.getTracks().forEach(t => { if (t._res) t._res.where = w; }); res(st); }))); }, enumerateDevices: () => Promise.resolve([]), addEventListener() {}, removeEventListener() {} },
      permissions: { query: () => Promise.resolve({ state: 'granted', addEventListener() {} }) },
    },
    setTimeout: (fn, ms, ...a) => addTimer('timeout', fn, ms, a), clearTimeout: clearTimer,
    setInterval: (fn, ms, ...a) => addTimer('interval', fn, ms, a), clearInterval: clearTimer,
    requestAnimationFrame: fn => addTimer('raf', fn, 16, []), cancelAnimationFrame: clearTimer,
    requestIdleCallback: fn => addTimer('timeout', () => fn({ timeRemaining: () => 10, didTimeout: false }), 1, []), cancelIdleCallback: clearTimer,
    queueMicrotask, structuredClone,
    alert: m => { page.alerts.push(String(m)); }, confirm: () => true, prompt: () => null, open: () => null, print() {}, focus() {}, blur() {},
    matchMedia: () => ({ matches: false, media: '', addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} }),
    getComputedStyle: el => ({ getPropertyValue: () => '', display: (el && el._style && el._style.display) || '', visibility: '' }),
    getSelection: () => ({ isCollapsed: true, rangeCount: 0, anchorNode: null, removeAllRanges() {}, addRange() {}, toString: () => '' }),
    CSS: { escape: s => String(s).replace(/[^\w-]/g, c => '\\' + c), supports: () => false },
    fetch: (u) => { const url = String(u && u.url || u); const o = originNow(); return new Promise((res, rej) => page.harnessTimer(30, () => ALS.run(o, () => /\.(mp3|m4a|ogg|wav)(\?|$)/.test(url) ? res({ ok: true, status: 200, arrayBuffer: () => Promise.resolve(new ArrayBuffer(16)), blob: () => Promise.resolve(new ctx.Blob([])), headers: { get: () => null } }) : rej(new TypeError('Failed to fetch (simulator: no network)'))))); },
    Image: class { constructor() { this.onload = null; this.onerror = null; } set src(v) { this._src = v; } get src() { return this._src; } },
    MutationObserver: class { observe() {} disconnect() {} takeRecords() { return []; } }, ResizeObserver: class { observe() {} unobserve() {} disconnect() {} }, IntersectionObserver: class { observe() {} unobserve() {} disconnect() {} },
    Event: class { constructor(t, o) { return makeEvent(t, o); } }, CustomEvent: class { constructor(t, o) { return makeEvent(t, o); } },
    KeyboardEvent: class { constructor(t, o) { return makeEvent(t, o); } }, MouseEvent: class { constructor(t, o) { return makeEvent(t, o); } }, PointerEvent: class { constructor(t, o) { return makeEvent(t, o); } },
    HTMLElement: MElement, Element: MElement, Node: MNode, HTMLInputElement: MElement, HTMLSelectElement: MElement, HTMLTextAreaElement: MElement, HTMLDetailsElement: MElement, HTMLMediaElement: MMedia, HTMLAudioElement: MMedia,
    Blob: class { constructor(p, o) { this.parts = p || []; this.type = (o && o.type) || ''; this.size = 16; } arrayBuffer() { return Promise.resolve(new ArrayBuffer(16)); } slice() { return this; } text() { return Promise.resolve(''); } },
    File: class { constructor(p, n, o) { this.name = n; this.type = (o && o.type) || ''; this.size = 16; } },
    FileReader: class { readAsDataURL() { setImmediate(() => { this.result = 'data:,'; if (this.onload) this.onload({ target: this }); }); } readAsArrayBuffer() { setImmediate(() => { this.result = new ArrayBuffer(16); if (this.onload) this.onload({ target: this }); }); } },
    URL: Object.assign(function (...a) { return new URL(...a); }, { createObjectURL: () => 'blob:stop-loop/' + (++page.autoId), revokeObjectURL() {} }), URLSearchParams, TextEncoder, TextDecoder, Date: VDate, Intl,
    AbortController, AbortSignal: { timeout: () => new AbortController().signal },
    performance: { now: () => clock.now, mark() {}, measure() {}, getEntriesByType: t => t === 'navigation' ? [{ workerStart: 5, type: 'navigate' }] : [], timeOrigin: BASE_TIME },
    crypto: { getRandomValues: a => { for (let i = 0; i < a.length; i++) a[i] = Math.floor(page.rng() * 256); return a; }, randomUUID: () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, () => Math.floor(page.rng() * 16).toString(16)) },
    scrollTo() {}, scroll() {}, scrollBy() {}, scrollX: 0, scrollY: 0, pageXOffset: 0, pageYOffset: 0, innerWidth: 1366, innerHeight: 657, outerWidth: 1366, outerHeight: 657, devicePixelRatio: 1,
    screen: { width: 1366, height: 768, orientation: { type: 'landscape-primary', addEventListener() {} } }, name: '', isSecureContext: true, indexedDB: undefined, caches: undefined,
  };
  ctx.URL.prototype = URL.prototype;
  ctx.NodeFilter = { SHOW_ALL: 0xFFFFFFFF, SHOW_ELEMENT: 1, SHOW_TEXT: 4, FILTER_ACCEPT: 1, FILTER_REJECT: 2, FILTER_SKIP: 3 };
  /* A TreeWalker over text nodes (the only kind the site walks: wrapChordLinksIn, app/snippets.js). */
  doc.createTreeWalker = (rootEl, what, filter) => {
    const list = [];
    const walk = n => { for (const c of n.childNodes) { if (c.nodeType === 3) { const r = filter && filter.acceptNode ? filter.acceptNode(c) : 1; if (r === 1) list.push(c); } else if (c.nodeType === 1) walk(c); } };
    walk(rootEl);
    let i = -1;
    return { currentNode: rootEl, nextNode() { i++; this.currentNode = list[i] || null; return this.currentNode; } };
  };
  ctx.Audio = function (src) { const a = new MMedia(doc, 'audio'); if (src) a.src = src; return a; };
  ctx.AudioContext = ctx.webkitAudioContext = function (o) { return new FakeAudioContext(page, o); };
  ctx.MediaRecorder = makeMediaRecorderClass(page);
  ctx.MediaStream = class {};
  ctx.addEventListener = (t, f, o) => addListener(ctx, t, f, o);
  ctx.removeEventListener = (t, f, o) => removeListener(ctx, t, f, o);
  ctx.dispatchEvent = ev => dispatch(page, ctx, ev);
  ctx.window = ctx; ctx.self = ctx; ctx.globalThis = ctx; ctx.top = ctx; ctx.parent = ctx;
  ctx.__page = page;
  page.win = ctx; page.ctx = ctx;
  vm.createContext(ctx);
  vm.runInContext('Math.random = __r; delete globalThis.__r;', Object.assign(ctx, { __r: () => page.rng() }));
  page.auth = makeAuth(page);
  ctx.firebase = { initializeApp() {}, auth: Object.assign(() => page.auth, { GoogleAuthProvider: class { setCustomParameters() {} addScope() {} }, Auth: { Persistence: { LOCAL: 'local' } } }), apps: [] };
  page.inlineHandler = code => { let f = page.handlers.get(code); if (!f) { f = vm.runInContext(`(function(event){${code}\n})`, ctx); page.handlers.set(code, f); } return f; };
  doc.onScript = el => {
    const src = el.getAttribute('src') || '';
    page.harnessTimer(10, () => {
      if (/firebase-firestore/.test(src)) { ctx.firebase.firestore = makeFirestore(page); }
      else {
        const f = src.replace(/^\.?\//, '').replace(/\?.*$/, '');
        const s = SITE.lazy.get(f);
        if (!s) { if (typeof el.__onerror === 'function') page.guard('script onerror', () => el.__onerror(makeEvent('error'))); return; }
        page.guard('loading ' + f, () => ALS.run('boot', () => s.runInContext(ctx)));
      }
      if (typeof el.__onload === 'function') page.guard('script onload', () => el.__onload(makeEvent('load')));
      dispatch(page, el, makeEvent('load', { bubbles: false }));
    });
  };
  page.reload = () => { if (page.dead) return; page.reloaded++; page.dead = true; for (const id of [...timers.keys()]) clearTimer(id); };
  page.hide = hidden => { doc.hidden = hidden; doc.visibilityState = hidden ? 'hidden' : 'visible'; dispatch(page, doc, makeEvent('visibilitychange', { bubbles: false })); };
  page.run = code => vm.runInContext(code, ctx);
  page.call = (code, origin) => ALS.run(origin || 'tool', () => page.guard(code, () => vm.runInContext(code, ctx)));
  page.timersPending = () => timers.size;
  parseInto(doc.body, SITE.bodyHtml);
  page.auth.currentUser = opts.user || null;
  ALS.run('boot', () => {
    for (const s of SITE.scripts) { try { s.runInContext(ctx); } catch (e) { page.errors.push('loading ' + s.filename + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e)); } }
  });
  return page;
}
/* Run the page's clock forward `ms`, timer by timer, every promise reaction in between. */
async function runFor(page, ms, step) {
  const until = page.clock.now + ms;
  for (;;) {
    await flushMicrotasks();
    const qi = page.doc.hidden ? page.clock.q.findIndex(t => !(t.meta && t.meta.raf)) : 0;
    const next = qi < 0 ? null : page.clock.q[qi];
    if (!next || next.at > until) break;
    page.clock.q.splice(qi, 1);
    page.clock.now = Math.max(page.clock.now, next.at);
    next.fn();
    if (step) heartbeat(step);
  }
  page.clock.now = Math.max(page.clock.now, until);
  await flushMicrotasks();
}

/* ════════════════════════════════════════════════════════════════════════
   6. Seeded randomness (mulberry32, as the other loops): each schedule has
   its own stream from (--seed, schedule index), so one replays alone.
   ════════════════════════════════════════════════════════════════════════ */
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hashSeed(seed, k, salt) { let h = 2166136261 ^ salt; for (const c of String(seed) + ':' + k) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
function makeRng(seed, k, salt) {
  const r = mulberry32(hashSeed(seed, k, salt || 0));
  const rng = () => r();
  rng.int = (a, b) => a + Math.floor(r() * (b - a + 1));
  rng.pick = arr => arr[Math.floor(r() * arr.length)];
  return rng;
}

/* ════════════════════════════════════════════════════════════════════════
   7. What a student (or the console) can START, and the ways OUT.
   A start names its place (a module set, an In-Class card, a Module Review,
   the console), the real control it presses (found in the rendered page by
   its own onclick / data-* attribute, then clicked: the inline handler and
   any delegated listener run as in a browser), and `running`, the page's own
   state that says it is going (checked before the way out: a start that did
   not start is "not driven", never a pass).
   ════════════════════════════════════════════════════════════════════════ */
const USER = { uid: 'stu-test0', email: 'stu-test0@example.test', displayName: 'Test 0', photoURL: null, emailVerified: true };
const TEACHER = { uid: 'teacher-test', email: 'teacher@example.test', displayName: 'Teacher', photoURL: null, emailVerified: true };
const q = (page, root, sel) => (root || page.doc).querySelector(sel);
const activePanel = page => page.doc.querySelector('.week-panel.active');
const openCard = (page, id) => page.doc.querySelector(`details.ca-card[data-id="${id}"]`);
const inSet = sel => page => { const p = activePanel(page); return p ? (p.querySelector(`.tab-panel.active ${sel}`) || p.querySelector(sel)) : null; };
const inCard = (id, sel) => page => { const c = openCard(page, id); return c ? c.querySelector(sel) : null; };
const any = expr => page => { try { return !!page.run(expr); } catch { return false; } };
/* Places. A set needs its module drawn (ensureModuleRendered) and the Modules view; a card, the In-Class page open on it. */
const PLACE = {
  set: id => ({ kind: 'set', id, async go(page) { page.call('ensureModuleRendered(2)'); await runFor(page, 200); const n = page.run(`(SETS.find(w => w.id === ${JSON.stringify(id)}) || {}).moduleNum || ${/^mr(\d+)/.test(id) ? Number(/^mr(\d+)/.exec(id)[1]) : 0}`); page.call(`ensureModuleRendered(${n})`); await runFor(page, 300); page.call('exitExploreHash()'); await runFor(page, 100); page.call(`activateSet(${JSON.stringify(id)})`); await runFor(page, 200); return !!activePanel(page) && activePanel(page).dataset.id === id; } }),
  card: id => ({ kind: 'card', id, async go(page) { page.call(`goExploreHash(${JSON.stringify('class-activities/' + id)})`); await runFor(page, 400); const c = openCard(page, id); return !!(c && c.open); } }),
  console: () => ({ kind: 'console', id: 'live', async go(page) { page.call("teacherView = 'livequiz'; if (typeof renderTeacherBody === 'function') renderTeacherBody();"); await runFor(page, 400); return !!page.doc.getElementById('lq-stage'); } }),
};
/* A tab line's Play button that plays more than a few notes (so it is still playing at the way out). */
const longTabLine = scope => page => { const root = scope(page); if (!root) return null; const bs = root.querySelectorAll('[onclick^="playSequenceFromGroup"]'); let best = null, n = 0; for (const b of bs) { let m = []; try { m = JSON.parse(b.dataset.midis || '[]'); } catch {} if (m.length > n) { n = m.length; best = b; } } return best; };
const SONG_LOADED = id => page => page.call(`(() => { const card = document.querySelector('details.ca-card[data-id="${id}"] .snip'); if (!card) return; const spec = JSON.parse(card.dataset.snip), tr = SNIPPET_TRACKS[spec.track];
  for (const s of [false, true]) for (const g of [false, true]) { const id = songFileId(snippetSrc(tr, s, g)); if (id) sfUrls.set(id, 'blob:stop-loop/' + id); } })()`);
/* The Coach button on the longest line in the open set (m6w1 has a 32-note line: at 30 BPM it listens 64 s, past the 30 s cap). */
const longCoach = page => { const p = activePanel(page); let best = null, n = 0; for (const b of (p ? p.querySelectorAll('[onclick^="coachOpenLazy"]') : [])) { let m = []; try { m = JSON.parse(b.dataset.midis || '[]'); } catch {} if (m.length > n) { n = m.length; best = b; } } return best; };
const COACH_SETUP = page => { page.ctx.localStorage.setItem('micRecConsent:' + USER.uid, 'yes'); page.call('micSampling = { on: true, max: 5 }; micTakesCount = 0;'); };
async function COACH_GO(page, log) {
  for (let i = 0; i < 300; i++) {
    const ask = page.doc.querySelector('[onclick^="coachMicAskGo"]'), go = page.doc.querySelector('.coach-start[onclick^="coachStartCheck"]');
    if (ask) { ALS.run('start', () => ask.click()); log('pressed coachMicAskGo()'); }
    else if (go) { ALS.run('start', () => go.click()); log('pressed coachStartCheck()'); return; }
    await runFor(page, 20);
  }
}
const STARTS = [
  { id: 'tab-line@set', place: PLACE.set('m2w1'), press: longTabLine(page => activePanel(page)), running: any('!!playSeqState'), window: [300, 2500] },
  { id: 'tab-line@card', place: PLACE.card('ca-1'), press: longTabLine(page => openCard(page, 'ca-1')), running: any('!!playSeqState'), window: [300, 2500] },
  { id: 'shuffle@set', place: PLACE.set('m2w1'), press: inSet('[onclick^="sdStart"]'), running: any("Object.values(shuffleDrills).some(s => s && s.phase === 'play')"), window: [200, 3000] },
  { id: 'shuffle@card', place: PLACE.card('ca-11'), press: inCard('ca-11', '[onclick^="sdStart"]'), running: any("Object.values(shuffleDrills).some(s => s && s.phase === 'play')"), window: [200, 3000] },
  { id: 'deck@set', place: PLACE.set('m3w1'), press: inSet('[onclick^="dkStart"]'), during: [{ at: 300, sel: '[onclick^="dkFlip"]' }, { at: 600, sel: '[onclick^="dkNext"]' }, { at: 900, sel: '[onclick^="dkFlip"]' }], running: any("Object.values(deckDrills).some(s => s && s.phase === 'run')"), window: [1000, 2500] },
  { id: 'deck@card', place: PLACE.card('ca-22'), press: inCard('ca-22', '[onclick^="dkStart"]'), during: [{ at: 300, sel: '[onclick^="dkFlip"]' }], running: any("Object.values(deckDrills).some(s => s && s.phase === 'run')"), window: [400, 2500] },
  { id: 'ear@set', place: PLACE.set('m10w3'), press: inSet('[onclick^="erStart"]'), running: any("Object.values(earDrills).some(s => s && s.phase === 'run')"), window: [100, 2500] },
  { id: 'find-note@set', place: PLACE.set('m2w1'), press: inSet('[onclick^="fgStart"]'), running: any("Object.values(fretGames).some(s => s && !s.done)"), window: [200, 3000] },
  /* Find-the-Note answered to the end, then the language switch inside the 650 ms before its score shows, then Start again:
     only one question is asked of it (the fresh round must not be ended by the old round's timer). */
  { id: 'find-note-end@set', place: PLACE.set('m2w1'), press: inSet('[onclick^="fgStart"]'), finish: 'fg', only: /^stale-timer$/, running: any("Object.values(fretGames).some(s => s)"), window: [0, 300] },
  { id: 'note-call@card', place: PLACE.card('ca-23'), press: inCard('ca-23', '[onclick^="ncStart"]'), running: any('!!ncLive'), window: [500, 4000] },
  { id: 'call-chord@card', place: PLACE.card('ca-48'), press: inCard('ca-48', '[data-chc-start]'), running: any('!!chcLive'), window: [500, 4000] },
  { id: 'power-name@card', place: PLACE.card('ca-49'), press: inCard('ca-49', '[data-pwn-start]'), running: any("Object.values(powerNames).some(s => s && s.phase === 'play')"), window: [200, 3000] },
  { id: 'practice-card@card', place: PLACE.card('ca-10'), press: inCard('ca-10', '[onclick^="pcToggle"]'), running: any('!!pcState'), window: [100, 4000] },
  { id: 'whole-song@card', place: PLACE.card('ca-24'), press: inCard('ca-24', '[onclick^="pcToggle"]'), running: any('!!pcState'), window: [100, 4000] },
  { id: 'speed-ladder@card', place: PLACE.card('ca-54'), press: inCard('ca-54', '[onclick^="pcToggle"]'), running: any('!!pcState'), window: [100, 4000] },
  /* ca-34's band is a private song file (app/songfiles.js): the snippet start finds every tier already loaded on this page
     (sfUrls, as after an earlier press); song-loading@card presses Play with nothing loaded and a download that never ends. */
  { id: 'snippet@card', place: PLACE.card('ca-34'), setup: SONG_LOADED('ca-34'), press: inCard('ca-34', '[onclick^="snipToggle"]'), running: any('!!snipState'), window: [100, 4000] },
  { id: 'song-loading@card', place: PLACE.card('ca-34'), setup: page => { page.holdSongFiles = true; }, press: inCard('ca-34', '[onclick^="snipToggle"]'), running: any('!!sfWait || sfInflight.size > 0'), window: [100, 3000] },
  { id: 'recorder@review', place: PLACE.set('mr2'), press: inSet('[onclick^="startRec"]'), running: any('Object.values(recState).some(s => s && (s.starting || s.recording))'), window: [300, 3000] },
  { id: 'metronome@fab', place: PLACE.set('m2w1'), press: page => page.doc.getElementById('metro-btn'), running: any('metroRunning'), window: [200, 2000] },
  { id: 'tuner@fab', place: PLACE.set('m2w1'), press: page => page.doc.getElementById('fab-tuner'), running: any('tunerRunning'), window: [300, 2000] },
  { id: 'timer@fab', place: PLACE.set('m2w1'), press: page => page.doc.getElementById('timer-btn'), running: any('timerRunning'), window: [200, 2000] },
  /* The Listening Coach on a tab line, with mic recording consented and switched on for the class (coach-recordings.js):
     open it (coachOpenLazy loads the coach-*.js parts), press Start (coachStartCheck), hear the count-in, listen. A fake mic
     gives quiet noise, so the Coach hears nothing and listens to the end of the line. "coach-cap" takes no way out: it
     waits for the 30 s recording cap (micRec stops capturing) and watches what is left on screen. */
  { id: 'coach@set', place: PLACE.set('m2w1'), setup: COACH_SETUP, press: page => { const b = longTabLine(p => activePanel(p))(page); const g = b && b.closest('.tab-group, .tab, .step'); return (g && g.querySelector('[onclick^="coachOpenLazy"]')) || inSet('[onclick^="coachOpenLazy"]')(page); },
    then: COACH_GO, running: any('!!(typeof coach !== "undefined" && coach && (coach.phase === "countin" || coach.phase === "listen"))'), window: [500, 4000] },
  { id: 'coach-cap@set', place: PLACE.set('m6w1'), setup: COACH_SETUP, press: page => { const b = longCoach(page); const g = b && b.closest('.bpm-control-group'); const sl = g && g.querySelector('.bpm-slider'); if (sl) sl.value = '30'; return b; },
    then: COACH_GO, leaveWhen: 'typeof micRec !== "undefined" && micRec && !micRec.live', leaveWhenMs: 60000, only: /^label-outlives$/, running: any('typeof micRec !== "undefined" && !!micRec'), window: [0, 0] },
  /* Hear the chord change on the console (live-changes.js lqCcRun): the section's song starts in steps (pings, load, seek,
     play, five readings of its position, a write) and only then does its watch (lqCcWatch) run. "…-startup" leaves while
     the song is playing and the watch has not started; "…-playing" once the watch runs. */
  { id: 'live-preview-startup@console', teacher: true, place: PLACE.console(), script: 'preview', leaveWhen: 'lqTCc && lqTCc.audio && !lqTCc.audio.paused && !lqTCc.timer', running: any('!!lqTCc'), window: [0, 250] },
  { id: 'live-preview-playing@console', teacher: true, place: PLACE.console(), script: 'preview', leaveWhen: 'lqTCc && lqTCc.timer', running: any('!!lqTCc'), window: [0, 1500] },
  { id: 'live-round-startup@console', teacher: true, place: PLACE.console(), script: 'real', leaveWhen: 'lqTCc && lqTCc.audio && !lqTCc.audio.paused && !lqTCc.timer', running: any('!!lqTCc'), window: [0, 250] },
  { id: 'live-round-playing@console', teacher: true, place: PLACE.console(), script: 'real', leaveWhen: 'lqTCc && lqTCc.timer', running: any('!!lqTCc'), window: [0, 1500] },
];
const SET_LEAVES = ['other-set', 'checklist-tab', 'module-review', 'in-class', 'songs', 'my-progress', 'games', 'hide', 'language', 'sign-out', 'step-close'];
const CARD_LEAVES = ['close-card', 'all-activities', 'other-card', 'modules', 'songs', 'my-progress', 'games', 'hide', 'language', 'sign-out'];
const REVIEW_LEAVES = ['other-set', 'in-class', 'songs', 'my-progress', 'games', 'hide', 'language', 'sign-out'];
const leavesFor = s => s.id === 'coach-cap@set' ? ['the-cap'] : s.id === 'find-note-end@set' ? ['language'] : /^live-preview/.test(s.id) ? ['real-game-live', 'console-view', 'exit-preview'] : /^live-round/.test(s.id) ? ['other-console-ends', 'console-view'] : s.id.startsWith('recorder') ? REVIEW_LEAVES : (s.place.kind === 'card' ? CARD_LEAVES : SET_LEAVES.filter(l => l !== 'step-close' || s.id.startsWith('tab-line')));
/* The ways out, each through the site's own entry point. */
const LEAVE = {
  'other-set': page => { const cur = activePanel(page) ? activePanel(page).dataset.id : ''; page.call(`activateSet(${JSON.stringify(cur === 'm2w2' ? 'm2w1' : 'm2w2')})`); },
  'checklist-tab': page => { const p = activePanel(page); if (p) page.call(`switchTabById(${JSON.stringify(p.dataset.id)}, 'checklist')`); },
  'module-review': page => page.call('railModuleReview()'),
  'in-class': page => page.call("goExploreHash('class-activities')"),
  'songs': page => page.call("goExploreHash('songs')"),
  'my-progress': page => page.call("goExploreHash('my-progress')"),
  'games': page => page.call("goExploreHash('games')"),
  'hide': page => page.hide(true),
  'language': page => page.call('toggleTranslate()'),
  'sign-out': page => page.call('signOut()'),
  'step-close': page => { const b = page.started && page.started.closest ? page.started.closest('.step') : null; const t = b ? b.querySelector('[onclick^="toggleStepOpen"]') : null; if (t) t.click(); else page.leaveNote = 'no step header to close'; },
  'the-cap': page => {},
  'close-card': page => { const c = page.doc.querySelector('details.ca-card[open]'); if (c) c.open = false; },
  'all-activities': page => page.call('caCloseOpen()'),
  'other-card': page => page.call("goExploreHash('class-activities/ca-13')"),
  'modules': page => page.call('exitExploreHash()'),
  'real-game-live': page => page.fsWrite('liveQuiz/current', { sessionId: 'lq-other', quizId: page.run('LQ_DEFAULT_QUIZ'), state: 'lobby', qIndex: -1, scores: {} }, false),
  'other-console-ends': page => page.fsWrite('liveQuiz/current', { state: 'off', endedAt: 1 }, true),
  'console-view': page => page.call("teacherView = 'manage'; if (typeof renderTeacherBody === 'function') renderTeacherBody();"),
  'exit-preview': page => page.call('lqTeacherExitPreview()'),
};

/* ════════════════════════════════════════════════════════════════════════
   8. The answer key: survivors the code itself documents, and the open
   findings this tool already knows (tagged, still failing).
   ════════════════════════════════════════════════════════════════════════ */
/* SURVIVORS: something the started thing made that is MEANT to outlive the way out. Each quotes the code's own comment.
   A finding matching one is not printed and does not fail. */
const NAV_LEAVES = /^(other-set|checklist-tab|module-review|in-class|songs|my-progress|games|language|step-close)$/;
const SURVIVORS = [
  { start: /.*/, leave: /.*/, kind: /^late-timer$/, where: /^(queueSave|setSaveMsg|flushSave|flushOnHide|logPracticeRep) app\/save\.js|^(queueSave|setSaveMsg) /,
    reason: 'app/save.js: the progress save is not the started thing\'s to stop. queueSave\'s debounce and its "Saved" note (setSaveMsg) run on after any way out by design: "A step marked done half a second ago is still inside queueSave\'s 800 ms debounce" (app/start.js) is the case every way out must keep.' },
  { start: /^metronome@fab$/, leave: NAV_LEAVES, kind: /.*/,
    reason: 'app/audio-ui.js stopCardAudio: "Deliberately NOT the FAB metronome: that is a tool the student started themselves, with its own Start/Stop, and it is not this card\'s sound to end."' },
  { start: /^timer@fab$/, leave: /^(other-set|checklist-tab|module-review|in-class|songs|my-progress|games|language|step-close|hide)$/, kind: /.*/,
    reason: 'fab-tools.js toggleTimer: a floating tool with its own Start/Pause, and "timerEndAt: wall-clock deadline while running. The countdown is recomputed from it on every tick instead of decrementing per tick — a hidden/suspended tab throttles or stalls setInterval": it is meant to keep counting in a hidden tab.' },
  { start: /^song-loading@card$/, leave: /.*/, kind: /^update-waits$/, what: /sfInflight/,
    reason: 'app/start.js busyReason: "A private song still downloading ... or any private file in flight (sfInflight, a lyric sheet too). A reload throws the download away and the song counts against the month again: its \'counted once\' record lasts one page." The download is kept on purpose after the card is left; the wait is bounded by SW_RELOAD_MAX_WAIT.' },
  { start: /^tuner@fab$/, leave: NAV_LEAVES, kind: /.*/,
    reason: 'tuner.js: "No Start/Stop button — opening the tuner popup starts listening, closing it stops (wired in fab-tools.js togglePopup/closePopup)." The popup floats over every page, so a way out that leaves it open leaves it listening; a hidden tab stops it (its own visibilitychange handler).' },
  { start: /^power-name@card$/, leave: /^hide$/, kind: /.*/,
    reason: 'app/activities-2.js visibilitychange: "Name the power chord is not stopped here (Jonathan, 2026-11-09): it has no clock, no sound and no mic, so a student who looks something up in another tab comes back to the same card and score."' },
];
/* KNOWN: open findings of the 2026-11-25 sweep this tool reaches. A failing schedule that matches one is counted under its
   id and still FAILS the run (exit 1): the loop is red on main until the fix lands, then the entry goes. `product` marks a
   finding that waits on Jonathan's call. */
const KNOWN = [
  { id: 'APP-DRILLS-1', note: 'Deck/Ear round left in \'run\' (and Ear notes playing) after a way out',
    match: (s, f) => /^(deck|ear)@/.test(s.start) && s.leave !== 'language' && (/^(Deck|Ear) /.test(f.what) || f.kind === 'retry-busy' || f.kind === 'update-waits' || /erPlay|playNote/.test(f.where || '')) },
  { id: 'APP-LESSON-1', note: 'a tab\'s Play line plays on over a set switch or a tab switch',
    match: (s, f) => /^tab-line@set$/.test(s.start) && /^(other-set|checklist-tab|module-review)$/.test(s.leave) },
  { id: 'APP-LESSON-1 (step move, product call)', product: true, note: 'the line plays on in a step closed in the ladder',
    match: (s, f) => /^tab-line@set$/.test(s.start) && s.leave === 'step-close' },
  { id: 'APP-DRILLS-3 (product call)', product: true, note: 'the Module Review recorder keeps recording after Songs / In class / My progress / a hidden tab',
    match: (s, f) => /^recorder@/.test(s.start) && /^(in-class|songs|my-progress|games|hide)$/.test(s.leave) },
  { id: 'APP-DRILLS-5', note: 'Find-the-Note\'s end-of-round timeout ends the NEXT round',
    match: (s, f) => /^find-note-end@/.test(s.start) && f.kind === 'stale-timer' },
  { id: 'LIVE-RULES-3', note: 'a chord-change round\'s song plays on when the session moves under it',
    match: (s, f) => /^live-(preview|round)-startup@console$/.test(s.start) && /^(real-game-live|other-console-ends)$/.test(s.leave) && (f.kind === 'sounding' || f.kind === 'media') },
  { id: 'COACH-A-2', note: 'the recording label outlives the capture',
    match: (s, f) => f.kind === 'label-outlives' },
];

/* ════════════════════════════════════════════════════════════════════════
   9. One schedule: boot, go to the place, press Start, wait, take one way
   out, then watch 12 s of virtual time.
   ════════════════════════════════════════════════════════════════════════ */
const GRACE_MS = 700;     // a stop may fade (playSeqDamp: 25 ms time constant) and a 650 ms flash may clear — nothing may still be going after this
const SETTLE_MS = 8000;   // how long after the way out the tool watches (an Ear round is 5 notes 1.1 s apart: 4.4 s)
const SAMPLE_MS = 500;
const RUNNING_STATE = `(() => { const out = [], each = (o, f) => Object.keys(o || {}).filter(k => o[k] && f(o[k]));
  each(shuffleDrills, s => s.phase === 'play').forEach(k => out.push('Shuffle ' + k + " in 'play'"));
  each(deckDrills, s => s.phase === 'run').forEach(k => out.push('Deck ' + k + " in 'run'"));
  each(earDrills, s => s.phase === 'run').forEach(k => out.push('Ear ' + k + " in 'run'"));
  if (typeof powerNames !== 'undefined') each(powerNames, s => s.phase === 'play').forEach(k => out.push('Name the power chord ' + k + " in 'play'"));
  if (ncLive) out.push('Note Call (ncLive)'); if (chcLive) out.push('Call the chord (chcLive)');
  if (pcState) out.push('a practice card (pcState)'); if (snipState) out.push('a snippet (snipState)'); if (playSeqState) out.push('a tab line (playSeqState)');
  each(recState, s => s.starting || s.recording).forEach(k => out.push('the recorder ' + k + ' (recState)'));
  if (Object.keys(ecRuns).length) out.push('an exit check (ecRuns)');
  if (typeof sfWait !== 'undefined' && sfWait) out.push('a card waiting for its song (sfWait)');
  if (window.coachMicLive) out.push('the Coach mic (coachMicLive)');
  return out; })()`;
const BUSY_WHY = `(() => { const any = (o, f) => Object.keys(o || {}).some(k => o[k] && f(o[k]));
  if (window.__authBootPending) return 'auth'; if (window.coachMicLive) return 'mic'; if (any(recState, s => s.starting || s.recording)) return 'recording';
  if (any(shuffleDrills, s => s.phase === 'play') || any(deckDrills, s => s.phase === 'run') || any(earDrills, s => s.phase === 'run')) return 'drill';
  if (Object.keys(ecRuns).length) return 'check'; if (ncLive || chcLive) return 'drill'; if (pcState) return 'playing';
  if (typeof sfWait !== 'undefined' && sfWait) return 'song (a card waiting: sfWait)'; if (typeof sfInflight !== 'undefined' && sfInflight.size) return 'song (a download in flight: sfInflight)';
  return ''; })()`;
async function runSchedule(k, sch, verbose) {
  const S = STARTS.find(x => x.id === sch.start);
  const rng = makeRng(SEED, k);
  const log = verbose ? (m => console.log(`  [${String(CURRENT_PAGE ? CURRENT_PAGE.clock.now : 0).padStart(6)} ms] ${m}`)) : () => {};
  const res = { k, start: sch.start, leave: sch.leave, findings: [], driven: false };
  /* Only the cards this schedule uses are on In class (its own and the one 'other-card' opens): the page draws every dated
     card, and a set's schedule needs none. A start on a set lands on the practice view (a hash the router leaves alone). */
  const page = makePage({ rng, user: S.teacher ? TEACHER : USER, teacher: !!S.teacher, hash: S.place.kind === 'set' ? '#main-content' : '' });
  const dated = S.place.kind === 'card' ? [S.place.id, 'ca-13'] : [];
  page.docs.set('config/class', { moduleOpenThrough: { [USER.uid]: 12 }, activityDates: Object.fromEntries(dated.map(i => [i, '2026-11-01'])) });
  await runFor(page, S.teacher ? 4500 : 3000, `#${k} boot`);
  const placed = await S.place.go(page);
  log(`at ${S.place.kind} ${S.place.id}: ${placed ? 'ok' : 'NOT REACHED'}`);
  if (!placed) { res.why = `could not reach ${S.place.kind} ${S.place.id}`; res.errors = page.errors; return res; }
  const bootErrors = page.errors.length;
  /* START */
  if (S.script) {
    const quiz = page.run("Object.keys(LIVE_QUIZZES).find(id => lqType(LIVE_QUIZZES[id]) === 'changes') || ''");
    if (!quiz) { res.why = 'no Hear the chord change quiz in LIVE_QUIZZES'; return res; }
    const pick = page.doc.getElementById('lq-quiz-pick'); if (pick) pick.value = quiz;
    page.call(`lqTPickedQuizId = ${JSON.stringify(quiz)};`);
    page.call(S.script === 'preview' ? 'lqTeacherPreview()' : 'lqTeacherStart()', 'start');
    await runFor(page, 400);
    page.call('lqTeacherOpenChanges(0)', 'start');
    log(`pressed ${S.script === 'preview' ? 'Preview' : 'Start'} and the first section (lqTeacherOpenChanges(0))`);
  } else {
    if (S.setup) S.setup(page);
    const el = S.press(page);
    if (!el) { res.why = 'no control to press in the place'; return res; }
    if (optEq('--before', '')) page.call(optEq('--before', ''));
    page.started = el; page.startAt = page.clock.now;
    ALS.run('start', () => el.click());
    log(`pressed ${el.getAttribute('onclick') || el.outerHTML.slice(0, 60)}`);
    for (const d of S.during || []) {
      await runFor(page, Math.max(0, d.at - (page.clock.now - page.startAt)));
      const root = el.isConnected ? (el.closest('.sdr') || activePanel(page) || page.doc) : page.doc;
      const b = (root.querySelector ? root : page.doc).querySelector(d.sel) || page.doc.querySelector(d.sel);
      if (b) { ALS.run('start', () => b.click()); log(`pressed ${b.getAttribute('onclick')}`); }
    }
    if (S.then) await S.then(page, log);
    if (S.finish === 'fg') {
      const sid = page.run('Object.keys(fretGames)[0] || ""');
      for (let i = 0; sid && i < 12; i++) {
        page.call(`(() => { const st = fretGames[${JSON.stringify(sid)}], p = st.prompts[st.idx]; const f = Object.keys(FG_NATURALS[p.str]).find(f => FG_NATURALS[p.str][f] === p.note); fgClick(${JSON.stringify(sid)}, p.str, Number(f)); })()`, 'start');
        if (page.run(`!!(fretGames[${JSON.stringify(sid)}] && fretGames[${JSON.stringify(sid)}].done)`)) break;
        await runFor(page, 700);
      }
      page.fgSid = sid;
      log(`answered every prompt of Find-the-Note ${sid}: done=${page.run(`!!(fretGames[${JSON.stringify(sid)}]||{}).done`)}`);
      /* The round is over: its 650 ms "show the score" timer is the only thing left; the way out lands inside it (below). */
    }
  }
  const probe = optEq('--probe', '');
  if (probe && verbose) for (const dt of [0, 50, 200, 600]) { await runFor(page, dt ? dt - (dt === 50 ? 0 : dt === 200 ? 50 : 200) : 0); let v; try { v = JSON.stringify(page.run(probe)); } catch (e) { v = 'threw ' + e.message; } log(`probe ${probe} = ${String(v).slice(0, 200)}`); }
  if (S.leaveWhen) {
    let ok = false;
    for (let i = 0; i < (S.leaveWhenMs || 10000) / 20 && !(ok = !!page.run(S.leaveWhen)); i++) await runFor(page, 20);
    log(`waited for ${S.leaveWhen}: ${ok}`);
    if (!ok) { res.why = `${S.id}: ${S.leaveWhen} never held`; res.errors = page.errors.slice(bootErrors); return res; }
  }
  const [lo, hi] = S.window;
  const wait = S.finish === 'fg' ? rng.int(0, 300) : rng.int(lo, hi);
  await runFor(page, Math.max(0, wait), `#${k} running`);
  const running = S.finish === 'fg' ? true : S.running(page);
  log(`after ${wait} ms: running=${running}`);
  if (!running) { res.why = `${S.id} was not running ${wait} ms after the press (${page.errors.slice(bootErrors)[0] || 'no error'})`; res.errors = page.errors.slice(bootErrors); return res; }
  res.driven = true;
  /* LEAVE */
  const leaveAt = page.clock.now;
  ALS.run('leave', () => { page.guard('leave ' + sch.leave, () => LEAVE[sch.leave](page)); });
  log(`way out: ${sch.leave}${page.leaveNote ? ' (' + page.leaveNote + ')' : ''}`);
  if (page.leaveNote) { res.driven = false; res.why = page.leaveNote; return res; }
  /* Find-the-Note: the student presses the fresh Start right after the language switch (APP-DRILLS-5's window). */
  if (S.finish === 'fg' && sch.leave === 'language') {
    await runFor(page, rng.int(0, 250));
    const b = page.doc.querySelector(`#fg-${page.fgSid} [onclick^="fgStart"]`) || page.doc.querySelector('[onclick^="fgStart"]');
    if (b) { ALS.run('restart', () => b.click()); log('pressed Start again'); }
    await runFor(page, 1000);
    /* The fresh round must still be asking its first prompts, not showing an end-of-round score. */
    const ended = page.run(`!!document.querySelector('#fg-${page.fgSid} .fg-score')`);
    if (b && ended) res.findings.push({ kind: 'stale-timer', what: 'the round started again right after the way out was ended at once, with a score, by the old round\'s end timer (fgEnd)', where: 'fgClick app/drills.js', at: page.clock.now - leaveAt });
  }
  /* WATCH */
  page.leaveAt = leaveAt; page.graceMs = GRACE_MS;
  const seen = new Map();
  for (let t = leaveAt + GRACE_MS; t <= leaveAt + SETTLE_MS; t += SAMPLE_MS) {
    await runFor(page, Math.max(0, t - page.clock.now), `#${k} watching`);
    if (page.dead) break;
    for (const r of page.res) {
      if (r.origin !== 'start') continue;
      let kind = null;
      if (r.kind === 'media' || r.kind === 'source') { if (r.audibleAt()) kind = r.kind === 'source' && r.made < leaveAt ? 'rings-on' : 'sounding'; }
      else if (r.kind === 'timeout') continue;   // a timeout counts only if it does work after the way out (lateWork)
      else if (r.alive()) kind = r.kind;
      if (!kind) continue;
      const key = kind + '|' + r.what + '|' + whereKey(r.where);
      if (!seen.has(key)) seen.set(key, { kind, what: r.what, where: r.where, at: page.clock.now - leaveAt, n: 0 });
      seen.get(key).n++;
    }
    if (page.doc.getElementById('micrec-on') && !page.run('typeof micRec !== "undefined" && micRec && micRec.live')) {
      const key = 'label-outlives';
      if (!seen.has(key)) seen.set(key, { kind: 'label-outlives', what: '"Recording this take" (#micrec-on) on screen with no capture running', where: 'micRecBadgeHtml coach-recordings.js', at: page.clock.now - leaveAt, n: 0 });
    }
  }
  for (const w of page.lateWork) { const key = 'late-timer|' + whereKey(w.where); if (!seen.has(key)) seen.set(key, { kind: 'late-timer', what: w.what, where: w.where, at: w.at - leaveAt, n: 0 }); seen.get(key).n++; }
  res.findings.push(...seen.values());
  if (!page.dead) {
    if (!S.teacher) {
      for (const w of page.run(RUNNING_STATE)) res.findings.push({ kind: 'left-running', what: w, where: '', at: page.clock.now - leaveAt });
      if (page.run('progressLoadRetryBusy()')) res.findings.push({ kind: 'retry-busy', what: 'progressLoadRetryBusy() still says busy (app/save.js): a failed sign-in read is never retried', where: '', at: page.clock.now - leaveAt });
      /* The update reload's own test (app/start.js busyReason): a new service worker takes over now. Idle = it reloads at once.
         busyWhy only names the reason for the report (a copy of busyReason's order); the verdict is the real reload. */
      const busyWhy = page.run(BUSY_WHY);
      const swAt = page.clock.now;
      for (const l of page.swLs.filter(x => x.t === 'controllerchange')) ALS.run('tool', () => page.guard('controllerchange', () => l.f(makeEvent('controllerchange'))));
      await runFor(page, 2500);
      if (!page.reloaded) res.findings.push({ kind: 'update-waits', what: `a site update waits instead of reloading (app/start.js busyReason: ${busyWhy || '?'})`, where: '', at: swAt - leaveAt });
    }
  }
  res.errors = page.errors.slice(bootErrors);
  /* A start that only asks one question of its way out (coach-cap: the take is still the student's, only the label is judged). */
  if (S.only) res.findings = res.findings.filter(f => S.only.test(f.kind));
  /* Survivors and known findings. */
  res.findings = res.findings.filter(f => { const sv = SURVIVORS.find(x => x.start.test(sch.start) && x.leave.test(sch.leave) && x.kind.test(f.kind) && (!x.where || x.where.test(whereKey(f.where || ''))) && (!x.what || x.what.test(f.what))); if (sv) { (res.survived = res.survived || []).push(f); return false; } return true; });
  for (const f of res.findings) { const kn = KNOWN.find(x => x.match(sch, f)); f.tag = kn ? kn.id : null; }
  if (verbose) {
    for (const f of res.findings) console.log(`  finding ${f.tag ? '[' + f.tag + '] ' : '[NEW] '}${f.kind}: ${f.what}${f.where ? ' — made by ' + f.where : ''} (${f.at} ms after the way out)`);
    for (const f of res.survived || []) console.log(`  survivor (documented): ${f.kind}: ${f.what} — ${f.where}`);
    for (const e of res.errors) console.log('  page error: ' + e);
  }
  return res;
}

/* ════════════════════════════════════════════════════════════════════════
   10. The run: every (start, way out) pair, once per --reps, in a fixed order.
   ════════════════════════════════════════════════════════════════════════ */
let SEED = 1;
function allSchedules(reps) {
  const out = [];
  for (let r = 0; r < reps; r++) for (const s of STARTS) for (const l of leavesFor(s)) out.push({ start: s.id, leave: l });
  return out;
}
/* The instruments, tested before any case: a page that starts eight things under 'start' and stops three of them must
   show exactly the five left (an interval, an rAF loop, a sounding oscillator, a mic track, a document listener) and a
   timeout that does work after the way out, and nothing of the three it stopped. */
async function selfTest() {
  const page = makePage({ rng: makeRng(0, 'self'), user: null, hash: '#main-content' });
  await runFor(page, 200);
  ALS.run('start', () => page.run(`
    window.__st = { iv: setInterval(() => {}, 100), gone: setInterval(() => {}, 100) }; clearInterval(__st.gone);
    (function f(){ requestAnimationFrame(f); })();
    const c = new AudioContext(), o = c.createOscillator(), g = c.createGain(); o.connect(g); g.connect(c.destination); o.start();
    const o2 = c.createOscillator(); o2.connect(c.destination); o2.start(); o2.stop(c.currentTime + 0.1);
    const o3 = c.createOscillator(), g3 = c.createGain(); o3.connect(g3); g3.connect(c.destination); o3.start(); g3.gain.setValueAtTime(0, c.currentTime + 0.05);
    navigator.mediaDevices.getUserMedia({ audio: true });
    document.addEventListener('keydown', function selfTestKey(){});
    setTimeout(() => { document.body.setAttribute('data-late', '1'); }, 2000);
  `));
  page.leaveAt = page.clock.now; page.graceMs = GRACE_MS;
  await runFor(page, 1500);
  const live = new Set(page.res.filter(r => r.origin === 'start' && (r.kind === 'source' ? r.audibleAt() : r.kind !== 'timeout' && r.kind !== 'media' && r.alive())).map(r => r.kind));
  await runFor(page, 1000);
  const want = ['interval', 'raf', 'source', 'mic', 'listener'];
  const sources = page.res.filter(r => r.kind === 'source' && r.origin === 'start' && r.audibleAt()).length;
  const ok = want.every(k => live.has(k)) && live.size === want.length && sources === 1 && page.lateWork.length === 1 && page.res.filter(r => r.kind === 'interval' && r.alive()).length === 1;
  CURRENT_PAGE = null;
  return ok ? null : `saw ${[...live].join(', ') || 'nothing'}; ${sources} sounding source(s) (want 1); ${page.lateWork.length} late timeout(s) (want 1)`;
}
async function main() {
  if (flag('--help')) { console.log(readFileSync(TOOL, 'utf8').split('*/')[0]); return 0; }
  const root = resolve(optEq('--root', REPO));
  if (!existsSync(join(root, 'index.html'))) { console.error(`stop-loop: ${root} is not a site folder (no index.html)`); return 2; }
  SEED = Number(optEq('--seed', 1));
  const reps = Number(optEq('--reps', 1));
  const only = optEq('--start', ''), onlyLeave = optEq('--leave', '');
  const caseArg = optEq('--case', '');
  const verbose = flag('--verbose');
  if (flag('--list')) { for (const s of STARTS) console.log(`${s.id.padEnd(22)} ${leavesFor(s).join(', ')}`); return 0; }
  const t0 = Date.now();
  SITE = compileSite(root);
  const st = await selfTest();
  if (st) { console.log(`stop-loop: ✗ SELF-TEST failed — the instruments are broken: ${st}`); return 1; }
  let list = allSchedules(reps).map((s, i) => ({ ...s, k: i }));
  if (only) list = list.filter(s => only.split(',').some(x => s.start === x || s.start.startsWith(x)));
  if (onlyLeave) list = list.filter(s => onlyLeave.split(',').includes(s.leave));
  if (caseArg !== '') list = list.filter(s => s.k === Number(caseArg));
  const rootArg = root === REPO ? '' : ` --root=${root}`;
  const replay = s => `node tools/stop-loop.mjs --seed=${SEED}${reps !== 1 ? ' --reps=' + reps : ''} --case=${s.k} --verbose${rootArg}`;
  const results = [];
  for (const s of list) {
    if (verbose) console.log(`#${s.k} ${s.start} → ${s.leave}`);
    let r;
    try { r = await runSchedule(s.k, s, verbose); }
    catch (e) { r = { k: s.k, start: s.start, leave: s.leave, findings: [], driven: false, why: 'tool error: ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : e) }; }
    CURRENT_PAGE = null;
    results.push(r);
    if (r.driven && r.findings.length) {
      const tags = [...new Set(r.findings.map(f => f.tag || 'NEW'))];
      const groups = new Map();
      for (const f of r.findings) { const key = f.kind + '|' + whereKey(f.where || ''); const g = groups.get(key) || { f, n: 0 }; g.n++; groups.set(key, g); }
      const parts = [...groups.values()].map(({ f, n }) => `${n > 1 ? n + ' × ' : ''}${f.kind}: ${n > 1 ? f.what.replace(/\(\d+(\.\d+)? ms\)/, '') : f.what}${f.where ? ' (' + whereKey(f.where) + ')' : ''}`);
      console.log(`FAIL #${s.k} ${s.start} → ${s.leave} [${tags.join(', ')}]: ${parts.slice(0, 4).join('; ')}${parts.length > 4 ? ` (+${parts.length - 4} more)` : ''}`);
      console.log(`     replay: ${replay(s)}`);
    } else if (!r.driven && verbose) console.log(`  not driven: ${r.why}`);
  }
  /* Summary. */
  const driven = results.filter(r => r.driven), failed = driven.filter(r => r.findings.length);
  const byTag = new Map();
  for (const r of failed) for (const t of new Set(r.findings.map(f => f.tag || 'NEW'))) byTag.set(t, (byTag.get(t) || 0) + 1);
  const newN = byTag.get('NEW') || 0;
  const known = [...byTag.entries()].filter(([t]) => t !== 'NEW');
  const knownN = failed.filter(r => r.findings.every(f => f.tag)).length;
  const notDriven = results.filter(r => !r.driven);
  if (notDriven.length) {
    const why = new Map(); for (const r of notDriven) { const w = `${r.start}: ${String(r.why).replace(/\d+ ms after/, 'N ms after')}`; why.set(w, (why.get(w) || 0) + 1); }
    console.log(`not driven (${notDriven.length}):`); for (const [w, n] of why) console.log(`  ${n} × ${w}`);
  }
  const survived = results.reduce((a, r) => a + (r.survived ? 1 : 0), 0);
  const total = allSchedules(1).length;
  console.log(`stop-loop: ${results.length} schedules (${driven.length} driven; ${new Set(driven.map(r => r.start + '|' + r.leave)).size} of ${total} start × way-out pairs), ${knownN} known (${known.map(([t, n]) => `${t} ×${n}`).join(', ') || 'none'}), ${newN} new${survived ? `, ${survived} with a documented survivor` : ''}`);
  process.stderr.write(`stop-loop: ${((Date.now() - t0) / 1000).toFixed(1)} s\n`);
  /* A full default run that reaches no schedule of a KNOWN entry: the fault looks fixed, so the entry must go (as save-loop). */
  let stale = 0;
  if (!only && !onlyLeave && caseArg === '') for (const kn of KNOWN) if (!byTag.has(kn.id)) { stale++; console.log(`KNOWN ${kn.id} matched no schedule: it looks fixed — take its entry out of KNOWN (tools/stop-loop.mjs)`); }
  if (optEq('--json', '')) writeFileSync(optEq('--json', ''), JSON.stringify(results.map(r => ({ ...r, findings: r.findings, errors: r.errors })), null, 1));
  return failed.length || stale ? 1 : 0;
}
