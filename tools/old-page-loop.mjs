#!/usr/bin/env node
/* old-page-loop.mjs — an OLD page meets NEW files (2026-11-16, WORKFLOW "MORE FOR WINDOWS, 2" item W6).

     node tools/old-page-loop.mjs --old <ref|folder> --new <ref|folder> [options]

   THE QUESTION. A page opened BEFORE a push keeps the OLD part lists in memory (COACH_JS_PARTS and
   TEACHER_JS_PARTS, the arrays in the app code) and the OLD index.html scripts it already ran. Part URLs carry no
   version (loadScriptOnce(src)), so every part such a page fetches AFTER the push is the NEW file. When a part is
   split, a part list changes or a function moves between parts, does anything other scripts call into the lazily
   loaded groups throw (or silently not run) on that page? On 2026-11-16 the coach splits as first built
   (d6c3e16) did: "cbStop is not defined" from gamesStopMic() (Games, the Tuner, Record Yourself, the Coach, Note
   Call) and "nr is not defined" from gamesHideStop() on a hidden tab (WORKFLOW, "W2 DONE", R1-1).
   tools/sw-upgrade-proof.mjs compares bytes and runs nothing, so it cannot see this; this tool RUNS the code.

   WHEN TO RUN IT. Before pushing a change to a part list, a split of a part, a move of a function between
   parts, or a change to the loader (loadScriptOnce and the group loaders in app/boot.js): --old origin/main
   --new <your tip>. It needs two commits, so it is not in checks.mjs. Node only: no browser, no network, and it
   writes nothing (a ref is read straight from git objects). About 25 s for the coach group, 35 s for the console
   group, 60 s for both.
   WHERE IT RUNS. It imports only Node built-ins and reads refs with `git -C <the folder above tools/>`, so it must
   sit in tools/ of a checkout of this repo, or run with GIT_DIR set to a repo that holds both refs (a bare clone
   with planted commits works: GIT_DIR=<clone> node <checkout>/tools/old-page-loop.mjs --old … --new …). A
   folder given as --old / --new is read from disk instead. An unknown flag is exit 2.

   FLAGS
     --old <ref|folder>   the page's side: a git ref of this repo, or a site folder
     --new <ref|folder>   the files served after the push (same forms)
     --orders=N           seeded arrival orders per case (default 12)
     --case=NAME          one case (names: --list; the two controls always run too, they define the noise)
     --seed=S             only that seed
     --verbose            the entry points and their tags; with --case, every request, arrival and call
     --strict             a WINDOW (below) also makes the exit code 1
     --list               print the case names for this --old/--new and exit
   Exit 0 = no finding; 1 = a finding (a control's own finding counts); 2 = could not run (a ref or folder that
   cannot be read, no part list or group loader found, a page that cannot be built).

   WHAT IS REAL. The page is a Node vm with an ordinary global object (vm.constants.DONT_CONTEXTIFY: node's
   intercepted sandbox kept a "not defined" for a global const declared by a LATER script, a false finding no
   browser makes). The OLD tree's index.html scripts run in it, every local <script src> in document order, so the
   loader, the group loaders (found as the function whose body names each part-list array) and the part lists are
   the OLD commit's own code. Every <script> element the page appends goes to the fetch layer: it is answered by
   the tree that is live at that moment, its text runs in the page, then its onload fires; a file that tree does
   not have fires onerror (the loader's own failure path). Nothing in the site is shimmed: an undefined name is a
   real ReferenceError and the code's own `typeof x` guards behave as in a browser.
   WHAT IS STUBBED. The DOM (inert elements; getElementById finds an id only if the page's OWN index.html has it
   or a script wrote it into markup or attached it since, else null, so new code that needs an element only the
   new index.html has throws on an old page as it would for real; querySelector is always null), storage, audio,
   the microphone, timers (a virtual clock: after each call the setTimeout callbacks run, at most 200; setInterval
   and requestAnimationFrame never fire), Firebase and the service worker (absent). A throw that is not a missing
   site name is NOISE when a control makes the same throw from the same call (a stub the code did not expect).

   WHAT IT CALLS (discovered from the code, not listed here). For each group: every name its files declare at top
   level (OLD or NEW tree) that a file OUTSIDE the group calls (the OLD page's eager scripts, index.html's inline
   handlers, the other groups' files), once per literal argument list found at those call sites (gamesStopMic(true))
   or with one stub element; every inline handler in the markup the NEW page's own calls render (the hub's cards:
   gamesShow('<id>') for every game); every visibilitychange / pagehide / keydown / resize / gc-langchange /
   online listener the page registered (a hidden tab runs gamesHideStop). Three moments:
     at-resolve  inside the group loader's .then, as the real callers do. A name a caller calls inside a loader
                 .then (or right after `await loader()`) is tagged A; any other call made here is a user action
                 tried early, and a throw from it while a file is still in flight is a WINDOW, not a finding.
     arrival     after every file arrives, the names a caller reaches through a typeof guard with no loader call
                 just before it (the Tuner's gamesStopMic), and only if that guard passes (tag G).
     settled     once nothing is in flight: everything again, then the listeners.
   A name every caller guards with typeof (tag S) is called through that guard: when the guard finds nothing on a
   page whose own list declares it, that is a SKIPPED finding (gamesResetForUser not running on sign-out).

   CASES (per changed group; a group whose list and files are the same in old and new is not run, unless nothing
   differs at all: then every group runs as a self-check). control-old (old page, old files) and control-new (new
   page, new files): a missing name in only one of them is a finding; one both make is printed "ON BOTH PAGES"
   (not caused by the push, never a finding). after-push: the group loaded after the push (W2's timeline 1).
   half-K: the FIRST K files of the list are old, the rest new (timeline "half"; a prefix only). mixed-random:
   each seed makes its own subset of the group's files old (under sw.js any subset can come from an old cache,
   e.g. a new core with an old hub). loaded-before: the group loaded before the push, then the calls (timeline 3:
   safe). fail-<file>: after-push with that one fetch failing once; the caller catches the rejection and the NEXT
   loader call retries (the loader forgets a failed promise), as a second click would. new-page-old-<file>: a NEW
   page with that one part OLD (a new page served while the old worker's cache still holds the file); when the
   old file is the whole of a split parent, its new child logs "already declared" and nothing is missing: a NOTE.
   Each case runs --orders seeded arrival orders: when more than one file is in flight (a part that loads another
   part itself, module data) the seed picks which arrives first, uniformly, so "4 of 12" is the tool's coin, not
   a browser rate. cache-fast is the realistic order for a second old tab: the old list's files arrive at once
   in list order (an old cache answers in milliseconds), anything fetched outside the chain arrives last; each
   finding says whether cache-fast shows it.

   OUTPUT. Findings grouped by cause (one missing name, every call it breaks, the new file that defines it and
   whether the old list names that file), the cases and seeds it was seen in, and a replay line. The last line
   counts entry points, orders, cases and calls.

   THE STATIC PASS (beside the run; see staticPass() below). Every name the new site declares that an old page
   never gets (only in a new part its old list never fetches, or only in a new app script), referenced from a file
   an old page runs, with file:line: a reference behind `typeof` is SKIPPED (silently not done), any other THROWS
   when reached. A part an old-list part fetches itself (loadScriptOnce('…'), a bridge like fix A2) counts as
   fetched; whether it arrives in time is left to the run (at-resolve, cache-fast). Every UNGUARDED reference is
   a finding, the name moved or new in this push (labelled: a new name reached only after a guarded call into the
   new part, as ca5a220b's scStart after scOpen, cannot throw, but that cannot be proved statically: read the
   lines). A guarded reference to a name the old site had is a finding (SKIPPED); to a new name, a NOTE.

   WHAT THE RUN CANNOT SEE (the static pass is what covers the first two). Code that runs only during PLAY: a
   game's own loop (rAF, timers past the first 200 callbacks, the mic loop) never runs in the vm, so a helper
   moved out of Change Up's loop is invisible to the run. The console's own screens: they need Firestore, which the
   page does not have, so for TEACHER_JS_PARTS only the calls from outside the console run (about 10), not its
   board, its student pages or its buttons. Code reached only through arguments a stub cannot stand in for: a call
   that throws the same way in both controls stops there. A guard with an extra condition (`teacherView ===
   'songs' && typeof f === 'function'`) is probed as if the condition held. The service worker's caches and which
   copy of a file a page gets (half-K, mixed-random and new-page-old stand in), reload timing (SW_RELOAD_MAX_WAIT,
   the busy-tab wait), more than one tab, layout, audio: tools/update-reload-loop.mjs (Chrome) and
   tools/sw-upgrade-proof.mjs cover those. The static pass cannot see a name built at run time (window[name]) or a
   call through a value passed from elsewhere. */
import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const T0 = Date.now();

// ───────────────────────── arguments ─────────────────────────
const ARGS = {};
for (let i = 2; i < process.argv.length; i++){
  const a = process.argv[i];
  const m = a.match(/^--([\w-]+)(?:=(.*))?$/);
  if (!m) die(`unknown argument ${a}`);
  if (!['old', 'new', 'orders', 'seed', 'case', 'verbose', 'strict', 'list'].includes(m[1])) die(`unknown flag --${m[1]} (the flags are in the header)`);
  if (m[2] !== undefined) ARGS[m[1]] = m[2];
  else if (['old', 'new', 'orders', 'seed', 'case'].includes(m[1])) ARGS[m[1]] = process.argv[++i];
  else ARGS[m[1]] = true;
}
const VERBOSE = !!ARGS.verbose;
const ORDERS = ARGS.orders ? parseInt(ARGS.orders, 10) : 12;
if (!ARGS.old || !ARGS.new) die('usage: node tools/old-page-loop.mjs --old <ref|folder> --new <ref|folder> [--orders=N] [--case=NAME --seed=S --verbose] [--list]');
if (!(ORDERS >= 1)) die('--orders must be a number of at least 1');

function die(msg){ console.log('old-page-loop: could not run: ' + msg); process.exit(2); }

// ───────────────────────── trees: a git ref or a folder, read without writing anything ─────────────────────────
const WANTED = p => /^[^/]+\.(js|html)$/.test(p) || /^app\/[^/]+\.js$/.test(p);
function openTree(spec){
  let sha = null;
  try { sha = execFileSync('git', ['-C', ROOT, 'rev-parse', '--verify', '--quiet', spec + '^{commit}'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch {}
  if (sha){
    const files = new Map();
    const names = execFileSync('git', ['-C', ROOT, 'ls-tree', '-r', '--name-only', sha], { encoding: 'utf8', maxBuffer: 64 << 20 }).split('\n').filter(Boolean);
    const all = new Set(names);
    const want = names.filter(WANTED);
    // one `git cat-file --batch` for every root / app script: nothing is written to disk
    const out = execFileSync('git', ['-C', ROOT, 'cat-file', '--batch'], { input: want.map(p => `${sha}:${p}`).join('\n') + '\n', maxBuffer: 256 << 20 });
    let pos = 0;
    for (const p of want){
      const nl = out.indexOf(10, pos);
      const head = out.slice(pos, nl).toString('utf8').split(' ');
      const size = parseInt(head[2], 10);
      files.set(p, out.slice(nl + 1, nl + 1 + size).toString('utf8'));
      pos = nl + 1 + size + 1;
    }
    return {
      label: spec === sha.slice(0, spec.length) ? sha.slice(0, 7) : `${spec} (${sha.slice(0, 7)})`, sha,
      has: p => all.has(p),
      read(p){
        if (files.has(p)) return files.get(p);
        if (!all.has(p)) return null;
        const t = execFileSync('git', ['-C', ROOT, 'cat-file', 'blob', `${sha}:${p}`], { encoding: 'utf8', maxBuffer: 64 << 20 });
        files.set(p, t); return t;
      },
      scripts: () => want.filter(p => p.endsWith('.js')),
    };
  }
  const dir = resolve(spec);
  if (!existsSync(dir) || !statSync(dir).isDirectory()) die(`${spec} is neither a git ref of ${ROOT} nor a folder`);
  if (!existsSync(join(dir, 'index.html'))) die(`${spec} has no index.html: not a site folder`);
  const cache = new Map();
  const scripts = [...readdirSync(dir).filter(f => f.endsWith('.js')), ...(existsSync(join(dir, 'app')) ? readdirSync(join(dir, 'app')).filter(f => f.endsWith('.js')).map(f => 'app/' + f) : [])];
  return {
    label: dir, sha: null,
    has: p => existsSync(join(dir, p)) && statSync(join(dir, p)).isFile(),
    read(p){
      if (cache.has(p)) return cache.get(p);
      const f = join(dir, p);
      const t = existsSync(f) && statSync(f).isFile() ? readFileSync(f, 'utf8') : null;
      cache.set(p, t); return t;
    },
    scripts: () => scripts,
  };
}

// ───────────────────────── reading code ─────────────────────────
/* One pass over a script, keeping every character's position (comments and strings become spaces, newlines stay,
   so an index in the result is an index in the source and line numbers hold):
     code  comments out, strings kept (an inline handler inside a template string is a call site too);
     refs  comments out AND string text out, except on…= handler attributes inside strings, up to their closing quote
           or across a ${…} / ' + x + ' to the end of the piece (a name that is only
           mentioned in a string or a comment is not a reference; a handler in markup is).
   A `/` that starts a regex literal is not modelled: a quote or `//` inside one can blank the rest of that line. */
const SCAN = new Map();
function scanJs(src){
  if (SCAN.has(src)) return SCAN.get(src);
  const n = src.length, code = src.split(''), refs = src.split(''), modes = [];
  const blank = (arr, a, b) => { for (let k = a; k < b; k++) if (arr[k] !== '\n') arr[k] = ' '; };
  /* Keep a handler attribute's text: from on…= to its closing quote, or to the end of this piece of string when the
     handler goes on after a ${…} or a ' + x + ' (review R2-1: `onclick="ccPickRate(${i})"` has no closing quote in
     the piece before ${). Inside one template literal the handler carries on into the next piece (st.hq). */
  const keep = (a, b) => { for (let k = a; k < b; k++) refs[k] = src[k]; };
  const strText = (a, b, st) => {
    blank(refs, a, b);
    let k = a;
    if (st && st.hq){
      const e = src.indexOf(st.hq, k), stop = e < 0 || e >= b ? b : e;
      keep(k, stop);
      if (stop >= b) return;
      st.hq = null; k = stop + 1;
    }
    const re = /\bon[a-z]+\s*=\s*(["']?)/g;
    re.lastIndex = 0;
    const piece = src.slice(k, b);
    let m;
    while ((m = re.exec(piece))){
      const s = k + m.index, q = m[1], from = s + m[0].length;
      let e;
      if (q){ const x = src.indexOf(q, from); e = x < 0 || x >= b ? -1 : x; }
      else { const w = piece.slice(from - k).search(/[\s>]/); e = w < 0 ? b : from + w; }
      if (e < 0){ keep(s, b); if (st) st.hq = q; return; }
      keep(s, e); re.lastIndex = e + 1 - k;
    }
  };
  const tpl = [];   // one state per open template literal
  let i = 0;
  while (i < n){
    const c = src[i], d = src[i + 1], top = modes[modes.length - 1];
    if (top === 'tpl'){
      const s0 = i;
      while (i < n && src[i] !== '`' && !(src[i] === '$' && src[i + 1] === '{')){ if (src[i] === '\\') i++; i++; }
      strText(s0, Math.min(i, n), tpl[tpl.length - 1]);
      if (i >= n) break;
      if (src[i] === '`'){ modes.pop(); tpl.pop(); i++; continue; }
      modes.push('expr'); i += 2; continue;
    }
    if (c === '/' && d === '/'){ const e = src.indexOf('\n', i), end = e < 0 ? n : e; blank(code, i, end); blank(refs, i, end); i = end; continue; }
    if (c === '/' && d === '*'){ const e = src.indexOf('*/', i + 2), end = e < 0 ? n : e + 2; blank(code, i, end); blank(refs, i, end); i = end; continue; }
    if (c === '\'' || c === '"'){
      let j = i + 1; while (j < n && src[j] !== c && src[j] !== '\n'){ if (src[j] === '\\') j++; j++; }
      strText(i + 1, Math.min(j, n)); i = j + 1; continue;
    }
    if (c === '`'){ modes.push('tpl'); tpl.push({ hq: null }); i++; continue; }
    if (c === '{' && top){ modes.push('brace'); i++; continue; }
    if (c === '}' && top){ modes.pop(); i++; continue; }
    i++;
  }
  const r = { code: code.join(''), refs: refs.join('') };
  SCAN.set(src, r);
  return r;
}
const stripComments = src => scanJs(src).code;
// Used for DISCOVERY only (names and call sites): a miss shows as a smaller entry count in the summary.

const ID = '[A-Za-z_$][\\w$]*';
function topDecls(src){
  const s = stripComments(src), names = new Set();
  for (const m of s.matchAll(new RegExp(`^(?:async\\s+)?function\\s*\\*?\\s*(${ID})|^(?:const|let|var|class)\\s+(${ID})`, 'gm'))) names.add(m[1] || m[2]);
  // const a = 1, b = 2;  /  let x, y;  (one line)
  for (const m of s.matchAll(new RegExp(`^(?:const|let|var)\\s+([^;\\n=]+(?:=[^,;\\n]+)?(?:,\\s*${ID}\\s*(?:=[^,;\\n]+)?)+);`, 'gm')))
    for (const x of m[1].matchAll(new RegExp(`(?:^|,)\\s*(${ID})`, 'g'))) names.add(x[1]);
  return names;
}
const LITERAL_ARGS = /^\s*(?:(?:'[^'\\]*'|"[^"\\]*"|-?\d+(?:\.\d+)?|true|false|null)\s*(?:,\s*(?:'[^'\\]*'|"[^"\\]*"|-?\d+(?:\.\d+)?|true|false|null)\s*)*)?$/;

function eagerScripts(tree){
  const html = tree.read('index.html');
  if (html == null) die(`${tree.label} has no index.html`);
  const list = [];
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)){
    const src = (m[1].match(/\bsrc="([^"]+)"/) || [])[1];
    if (src){ if (!/^(https?:)?\/\//.test(src)) list.push({ file: src.replace(/^\.\//, '').replace(/[?#].*$/, '') }); }
    else if (!/type="(?!text\/javascript)/.test(m[1]) && m[2].trim()) list.push({ inline: m[2], file: 'index.html (inline script)' });
  }
  return list;
}
function inlineHandlers(html){
  return [...html.matchAll(/\son[a-z]+="([^"]*)"/g)].map(m => m[1].replace(/&quot;/g, '"').replace(/&#39;/g, '\'').replace(/&amp;/g, '&'));
}

/* The page's lazy groups, read from its own app code: every one-line array of .js names, and the function
   whose body names that array (the group loader). Nothing about the names is assumed. */
function readGroups(tree){
  const eager = eagerScripts(tree).filter(s => s.file && s.file.startsWith('app/')).map(s => tree.read(s.file) || '').join('\n');
  const code = stripComments(eager);
  const groups = [];
  for (const m of code.matchAll(new RegExp(`^const (${ID})\\s*=\\s*\\[((?:\\s*'[^'\\n]+\\.js'\\s*,?)+)\\];`, 'gm'))){
    const files = [...m[2].matchAll(/'([^']+)'/g)].map(x => x[1]);
    const fn = code.match(new RegExp(`function\\s+(${ID})\\s*\\(\\s*\\)\\s*\\{[^{}]*\\b${m[1]}\\b[^{}]*\\}`));
    groups.push({ array: m[1], files, loader: fn ? fn[1] : null });
  }
  return groups;
}

// ───────────────────────── seeded random ─────────────────────────
function rng(seed){ let s = (seed * 2654435761) >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }

// ───────────────────────── the page ─────────────────────────
const SCRIPT_CACHE = new Map();
function compiled(treeLabel, file, text){
  const k = treeLabel + '\0' + file;
  if (!SCRIPT_CACHE.has(k)) {
    try { SCRIPT_CACHE.set(k, { script: new vm.Script(text, { filename: `${treeLabel === 'OLD' ? 'old' : 'new'}:${file}` }) }); }
    catch (e) { SCRIPT_CACHE.set(k, { error: e }); }
  }
  return SCRIPT_CACHE.get(k);
}

function makePage({ pageTree, pageLabel, rand, log, search }){
  const timers = [];        // { id, at, fn, args }
  let clock = 0, timerId = 0;
  const listeners = [];     // { target, type, fn, file }
  const htmlLog = [];
  let curFile = null;
  const net = { serve: null, serveLabel: null, pending: [], failOnce: new Set(), failAlways: new Set(), arrivals: [], loadErrors: [], requested: [] };

  const stubStyle = () => ({ setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; } });
  const mkEl = (tag, id) => {
    const attrs = {};
    const el = {
      tagName: String(tag || 'div').toUpperCase(), nodeName: String(tag || 'div').toUpperCase(), id: id || '', nodeType: 1,
      style: stubStyle(), dataset: {}, children: [], childNodes: [], hidden: false, isConnected: true, parentNode: null, parentElement: null,
      classList: { add(){}, remove(){}, toggle(){ return false; }, contains(){ return false; }, replace(){} },
      _h: '', get innerHTML(){ return this._h; }, set innerHTML(v){ this._h = String(v); htmlLog.push(this._h); knowIds(this._h); },
      get outerHTML(){ return this._h; }, textContent: '', innerText: '', value: '', checked: false, disabled: false,
      offsetWidth: 0, offsetHeight: 0, clientWidth: 0, clientHeight: 0, scrollHeight: 0, scrollWidth: 0, scrollTop: 0, scrollLeft: 0,
      addEventListener(){}, removeEventListener(){}, dispatchEvent(){ return true; },
      appendChild(c){ attach(c); if (c && c.tagName === 'SCRIPT') net.request(c); return c; }, append(...c){ c.forEach(attach); }, prepend(...c){ c.forEach(attach); }, after(...c){ c.forEach(attach); }, before(...c){ c.forEach(attach); },
      insertBefore(c){ attach(c); if (c && c.tagName === 'SCRIPT') net.request(c); return c; }, removeChild(c){ return c; }, replaceChildren(...c){ c.forEach(attach); }, replaceWith(...c){ c.forEach(attach); },
      remove(){ this._removed = true; },
      setAttribute(k, v){ attrs[k] = String(v); if (k === 'id') this.id = String(v); }, getAttribute(k){ return k === 'id' && this.id ? this.id : (k in attrs ? attrs[k] : null); },
      removeAttribute(k){ delete attrs[k]; }, hasAttribute(k){ return k in attrs; }, toggleAttribute(k, f){ if (f === false || (f === undefined && k in attrs)) { delete attrs[k]; return false; } attrs[k] = ''; return true; },
      querySelector(){ return null; }, querySelectorAll(){ return []; }, getElementsByTagName(){ return []; }, getElementsByClassName(){ return []; },
      closest(){ return null; }, matches(){ return false; }, contains(){ return false; },
      focus(){}, blur(){}, click(){}, scrollIntoView(){}, scrollTo(){}, scrollBy(){}, insertAdjacentHTML(p, h){ knowIds(String(h)); }, insertAdjacentElement(p, c){ attach(c); return c; }, insertAdjacentText(){},
      cloneNode(){ return mkEl(tag); }, getBoundingClientRect(){ return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0, x: 0, y: 0 }; },
      getClientRects(){ return []; }, animate(){ return { finished: Promise.resolve(), cancel(){}, onfinish: null }; },
      showModal(){}, close(){}, show(){}, play(){ return Promise.resolve(); }, pause(){}, load(){}, select(){}, setSelectionRange(){},
      requestFullscreen(){ return Promise.resolve(); }, getContext(){ return null; }, attachShadow(){ return mkEl('div'); },
    };
    return el;
  };
  /* The elements a page can find by id: the ones its OWN index.html has (old markup on an old page), plus every
     id written into markup or attached by its scripts since. Any other id is null, as on the real page (review
     R1-4: new code that needs an element only the new index.html has). */
  const els = {}, knownIds = new Set();
  const knowIds = html => { for (const m of html.matchAll(/\bid\s*=\s*["']([^"'<>]+)["']/g)) knownIds.add(m[1]); };
  const attach = c => { if (c && typeof c === 'object' && c.id){ knownIds.add(c.id); if (!els[c.id]) els[c.id] = c; } if (c && c._h) knowIds(c._h); };
  knowIds(pageTree.tree.read('index.html') || '');
  const storage =() => ({ _d: {}, get length(){ return Object.keys(this._d).length; }, key(i){ return Object.keys(this._d)[i] ?? null; },
    getItem(k){ return this._d[k] ?? null; }, setItem(k, v){ this._d[k] = String(v); }, removeItem(k){ delete this._d[k]; }, clear(){ this._d = {}; } });
  const param = () => ({ value: 1, setValueAtTime(){}, setTargetAtTime(){}, cancelScheduledValues(){}, linearRampToValueAtTime(){}, exponentialRampToValueAtTime(){} });
  const node = () => ({ connect(){ return node(); }, disconnect(){}, start(){}, stop(){}, frequency: param(), gain: param(), playbackRate: param(), detune: param(), Q: param(),
    threshold: param(), knee: param(), ratio: param(), attack: param(), release: param(), getFloatTimeDomainData(){}, getByteFrequencyData(){}, fftSize: 2048, buffer: null, onended: null, port: { postMessage(){}, onmessage: null } });
  class AudioCtx { constructor(){ this.currentTime = 0; this.state = 'running'; this.sampleRate = 44100; this.destination = {}; this.audioWorklet = { addModule: () => Promise.resolve() }; }
    resume(){ return Promise.resolve(); } suspend(){ return Promise.resolve(); } close(){ return Promise.resolve(); }
    createOscillator(){ return node(); } createGain(){ return node(); } createBufferSource(){ return node(); } createAnalyser(){ return node(); }
    createBiquadFilter(){ return node(); } createDynamicsCompressor(){ return node(); } createMediaStreamSource(){ return node(); } createMediaElementSource(){ return node(); }
    createScriptProcessor(){ return node(); } createConvolver(){ return node(); } createStereoPanner(){ return node(); } createDelay(){ return node(); }
    createBuffer(){ return { getChannelData(){ return new Float32Array(16); }, duration: 0, length: 16, sampleRate: 44100, numberOfChannels: 1 }; }
    decodeAudioData(){ return Promise.reject(new Error('no audio in old-page-loop')); } }
  const doc = {
    readyState: 'complete', title: '', cookie: '', referrer: '', hidden: false, visibilityState: 'visible', activeElement: null, fullscreenElement: null,
    get currentScript(){ return curFile ? { src: 'http://localhost/' + curFile } : null; },
    getElementById(id){ return els[id] || (knownIds.has(String(id)) ? (els[id] = mkEl('div', id)) : null); },
    querySelector(){ return null; }, querySelectorAll(){ return []; }, getElementsByTagName(){ return []; }, getElementsByClassName(){ return []; },
    createElement(tag){ return mkEl(tag); }, createElementNS(ns, tag){ return mkEl(tag); }, createTextNode(t){ return { textContent: t, nodeType: 3 }; },
    createDocumentFragment(){ return mkEl('fragment'); }, createRange(){ return { selectNodeContents(){}, getBoundingClientRect(){ return { top: 0, left: 0, width: 0, height: 0 }; } }; },
    addEventListener(type, fn){ listeners.push({ target: 'document', type, fn, file: curFile }); }, removeEventListener(type, fn){ const i = listeners.findIndex(l => l.target === 'document' && l.type === type && l.fn === fn); if (i >= 0) listeners.splice(i, 1); },
    dispatchEvent(){ return true; }, exitFullscreen(){ return Promise.resolve(); }, hasFocus(){ return true; }, execCommand(){ return false; },
    fonts: { ready: Promise.resolve(), load: () => Promise.resolve([]), check: () => true },
  };
  doc.documentElement = mkEl('html'); doc.head = mkEl('head'); doc.body = mkEl('body');
  const props = {
    console: { log(){}, warn(){}, error(){}, info(){}, debug(){}, table(){}, group(){}, groupEnd(){}, time(){}, timeEnd(){} },
    document: doc, localStorage: storage(), sessionStorage: storage(),
    location: { hostname: 'localhost', host: 'localhost', origin: 'http://localhost', protocol: 'http:', href: "http://localhost/" + (search || ""), pathname: "/", search: search || "", hash: "", reload(){}, assign(){}, replace(){} },
    history: { scrollRestoration: 'auto', state: null, length: 1, replaceState(){}, pushState(){}, back(){} },
    navigator: { userAgent: 'node old-page-loop', platform: 'node', language: 'en', languages: ['en'], onLine: true, maxTouchPoints: 0, hardwareConcurrency: 4,
      mediaDevices: { getUserMedia: () => Promise.reject(new Error('no mic in old-page-loop')), enumerateDevices: () => Promise.resolve([]), addEventListener(){} },
      clipboard: { writeText: () => Promise.resolve() }, permissions: { query: () => Promise.resolve({ state: 'prompt', addEventListener(){} }) }, sendBeacon(){ return true; } },
    setTimeout(fn, ms, ...args){ const id = ++timerId; if (typeof fn === 'function') timers.push({ id, at: clock + (+ms || 0), fn, args }); return id; },
    clearTimeout(id){ const i = timers.findIndex(t => t.id === id); if (i >= 0) timers.splice(i, 1); },
    setInterval(){ return ++timerId; }, clearInterval(){},
    requestAnimationFrame(){ return ++timerId; }, cancelAnimationFrame(){}, requestIdleCallback(){ return ++timerId; }, cancelIdleCallback(){},
    queueMicrotask: fn => Promise.resolve().then(fn),
    matchMedia: () => ({ matches: false, media: '', addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }),
    getComputedStyle: () => ({ getPropertyValue: () => '', paddingTop: '0px', paddingBottom: '0px', marginTop: '0px', lineHeight: '20px', fontSize: '16px' }),
    fetch: () => Promise.reject(new Error('no network in old-page-loop')),
    CustomEvent: class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } },
    Event: class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } preventDefault(){} stopPropagation(){} },
    Image: class { constructor(){ this.onload = null; } }, Audio: class { constructor(){ this.currentTime = 0; this.paused = true; } play(){ return Promise.resolve(); } pause(){} load(){} addEventListener(){} removeEventListener(){} },
    AudioContext: AudioCtx, webkitAudioContext: AudioCtx, OfflineAudioContext: AudioCtx, AudioWorkletNode: class { constructor(){ return node(); } },
    MediaRecorder: Object.assign(class { constructor(){ this.state = 'inactive'; } start(){} stop(){} addEventListener(){} }, { isTypeSupported: () => true }),
    ResizeObserver: class { observe(){} unobserve(){} disconnect(){} }, IntersectionObserver: class { observe(){} unobserve(){} disconnect(){} },
    MutationObserver: class { observe(){} disconnect(){} takeRecords(){ return []; } },
    BroadcastChannel: class { constructor(){ this.onmessage = null; } postMessage(){} close(){} addEventListener(){} },
    crypto: { getRandomValues: a => a, randomUUID: () => '00000000-0000-4000-8000-000000000000' },
    performance: { now: () => clock, mark(){}, measure(){}, getEntriesByType(){ return []; } }, structuredClone,
    URLSearchParams, TextEncoder, TextDecoder, Blob, File: class {}, FileReader: class { readAsText(){} readAsArrayBuffer(){} readAsDataURL(){} }, FormData: class { append(){} },
    URL: Object.assign(function(...a){ return new URL(...a); }, { createObjectURL: () => 'blob:old-page-loop', revokeObjectURL(){} }),
    HTMLElement: class {}, Element: class {}, Node: class {}, HTMLInputElement: class {}, HTMLCanvasElement: class {}, SVGElement: class {}, DOMParser: class { parseFromString(){ return doc; } },
    addEventListener(type, fn){ listeners.push({ target: 'window', type, fn, file: curFile }); }, removeEventListener(type, fn){ const i = listeners.findIndex(l => l.target === 'window' && l.type === type && l.fn === fn); if (i >= 0) listeners.splice(i, 1); },
    dispatchEvent(){ return true; }, scrollTo(){}, scrollBy(){}, scroll(){}, open(){ return null; }, alert(){}, confirm(){ return false; }, prompt(){ return null; }, print(){}, focus(){}, blur(){},
    innerWidth: 1366, innerHeight: 657, outerWidth: 1366, outerHeight: 657, devicePixelRatio: 1, scrollX: 0, scrollY: 0, pageXOffset: 0, pageYOffset: 0,
    screen: { width: 1366, height: 768, orientation: { type: 'landscape-primary', addEventListener(){} } }, visualViewport: null, isSecureContext: true, name: '',
  };
  props.URL.prototype = URL.prototype;
  /* An ordinary global object (DONT_CONTEXTIFY), not node's intercepted sandbox: with the sandbox, a function that
     looked up a global const BEFORE a later script declared it kept throwing "not defined" after it was declared
     (seen on gamesRenderHub / SH_PATTERNS: a false finding a browser never makes). */
  const ctx = vm.createContext(vm.constants.DONT_CONTEXTIFY);
  Object.assign(ctx, props);
  ctx.window = ctx; ctx.self = ctx; ctx.top = ctx; ctx.parent = ctx; ctx.frames = ctx;

  const run = code => vm.runInContext(code, ctx);
  function runFile(treeLabel, file, text){
    const c = compiled(treeLabel, file, text);
    if (c.error) return c.error;
    const was = curFile; curFile = file;
    try { c.script.runInContext(ctx); return null; }
    catch (e) { return e; }
    finally { curFile = was; }
  }

  // the fetch layer: a <script src> the page appends is answered by whichever tree is live NOW
  net.request = el => {
    const src = String(el.src || '').replace(/^https?:\/\/localhost\//, '').replace(/^\.\//, '').replace(/[?#].*$/, '');
    net.requested.push(src);
    net.pending.push({ el, src });
    if (log) log(`    request ${src}`);
  };
  net.deliverOne = () => {
    if (!net.pending.length) return false;
    /* cache-fast: the files of the page's own list come first, in request order, as an old cache answers them in
       milliseconds; anything else (a part a part loads itself, module data) arrives after (review R1-6). */
    let i = 0;
    if (net.prefer){ i = net.pending.findIndex(p => net.prefer.has(p.src)); if (i < 0) i = 0; }
    else if (rand) i = Math.floor(rand() * net.pending.length);
    const { el, src } = net.pending.splice(i, 1)[0];
    const tree = net.serve(src);
    const text = tree.tree.read(src);
    if (net.failOnce.has(src) || net.failAlways.has(src) || text == null){
      const why = net.failOnce.has(src) ? 'failed once (planted)' : net.failAlways.has(src) ? 'dropped (canary)' : `not in ${tree.label}`;
      net.failOnce.delete(src);
      net.arrivals.push(src + '!');
      if (log) log(`    arrive ${src}: onerror (${why})`);
      if (typeof el.onerror === 'function') try { el.onerror(new ctx.Event('error')); } catch (e) { net.loadErrors.push({ src, e }); }
      return true;
    }
    net.arrivals.push(src);
    const e = runFile(tree.label, src, text);
    if (e){ net.loadErrors.push({ src, e, tree: tree.label }); if (log) log(`    arrive ${src} (${tree.label}): THREW AT LOAD ${e && e.name}: ${e && e.message}`); }
    else if (log) log(`    arrive ${src} (${tree.label})`);
    if (typeof el.onload === 'function') try { el.onload(new ctx.Event('load')); } catch (e2) { net.loadErrors.push({ src, e: e2 }); }
    return true;
  };

  // the virtual clock: run the setTimeout callbacks that are due, earliest first, at most `limit`
  function drainTimers(limit, onThrow){
    let n = 0;
    while (timers.length && n < limit){
      timers.sort((a, b) => a.at - b.at || a.id - b.id);
      const t = timers.shift();
      clock = Math.max(clock, t.at); n++;
      try { t.fn(...t.args); } catch (e) { onThrow(e); }
    }
    return n;
  }

  // build: the page's own scripts, from ITS tree, in document order
  const buildErrors = [];
  for (const s of eagerScripts(pageTree.tree)){
    if (s.inline){ try { vm.runInContext(s.inline, ctx, { filename: s.file }); } catch (e) { buildErrors.push({ file: s.file, e }); } continue; }
    const text = pageTree.tree.read(s.file);
    if (text == null){ buildErrors.push({ file: s.file, e: new Error('not in the tree') }); continue; }
    const e = runFile(pageTree.label, s.file, text);
    if (e) buildErrors.push({ file: s.file, e });
  }
  const buildTimerThrows = [];
  drainTimers(200, e => buildTimerThrows.push(e));
  return { ctx, run, net, drainTimers, listeners, htmlLog, buildErrors, buildTimerThrows, doc, pageLabel, mkEl };
}

const flush = () => new Promise(r => setImmediate(r));

// ───────────────────────── setup: trees, groups, entry points ─────────────────────────
const OLD = { tree: openTree(ARGS.old), label: 'OLD' };
const NEW = { tree: openTree(ARGS.new), label: 'NEW' };
OLD.name = OLD.tree.label; NEW.name = NEW.tree.label;

const oldGroups = readGroups(OLD.tree), newGroups = readGroups(NEW.tree);
if (!oldGroups.length) die(`no part-list array found in the app code of ${OLD.name} (a one-line const NAME = ['x.js', …]; in an app/*.js part named by index.html)`);
for (const g of [...oldGroups, ...newGroups]) if (!g.loader) die(`no function whose body names ${g.array} (the group loader)`);
const GROUPS = oldGroups.map(g => {
  const n = newGroups.find(x => x.array === g.array);
  return { array: g.array, short: g.array.replace(/_JS_PARTS$|_PARTS$/, '').toLowerCase(), loader: g.loader,
    oldFiles: g.files, newFiles: n ? n.files : null, newLoader: n ? n.loader : null };
});
/* A new tree with no such list (a pre-cut commit, a list renamed): a new page cannot be built the same way, so the
   controls cannot run. Say so instead of crashing (review R1-3). */
const noList = GROUPS.filter(g => !g.newFiles);
if (noList.length) die(`${NEW.name} declares no ${noList.map(g => g.array).join(' or ')} (no one-line const … = ['…js']; in its app parts, with a function that names it): the tool compares two trees that both have the part lists`);

// top-level names, per file, both trees; which file defines a name
const declsOf = (tree, f) => { const t = tree.read(f); return t == null ? new Set() : topDecls(t); };
const NEW_DEF = new Map(), OLD_DEF = new Map(), SITE_NAMES = new Set();
for (const [tree, map] of [[NEW.tree, NEW_DEF], [OLD.tree, OLD_DEF]])
  for (const f of tree.scripts()) for (const n of declsOf(tree, f)){ SITE_NAMES.add(n); if (!map.has(n)) map.set(n, []); map.get(n).push(f); }

const oldEager = eagerScripts(OLD.tree).filter(s => s.file && !s.inline).map(s => s.file);
const oldEagerNames = new Set(); for (const f of oldEager) for (const n of declsOf(OLD.tree, f)) oldEagerNames.add(n);

/* For each group: the names its files declare (either tree) that something OUTSIDE the group calls, with the
   literal argument lists seen at those call sites, and whether a caller reaches the name through a typeof guard. */
function groupEntries(g){
  const gFiles = new Set([...g.oldFiles, ...(g.newFiles || [])]);
  const names = new Set();
  for (const f of g.oldFiles) for (const n of declsOf(OLD.tree, f)) names.add(n);
  for (const f of (g.newFiles || [])) for (const n of declsOf(NEW.tree, f)) names.add(n);
  for (const n of oldEagerNames) names.delete(n);   // the page already has it from its own scripts
  const callers = [];
  for (const f of oldEager) callers.push(stripComments(OLD.tree.read(f) || ''));
  callers.push(inlineHandlers(OLD.tree.read('index.html') || '').join('\n'));
  for (const o of GROUPS) if (o !== g) for (const [tree, list] of [[OLD.tree, o.oldFiles], [NEW.tree, o.newFiles || []]])
    for (const f of list) if (!gFiles.has(f)) callers.push(stripComments(tree.read(f) || ''));
  const loaderCall = new RegExp(`\\b(?:${[g.loader, g.newLoader].filter(Boolean).join('|')})\\s*\\(`);
  /* What runs the moment the group loader's promise resolves: the body of a `.then(` right after a loader call,
     or the statements after `await loader()` up to the next await. Everything else other scripts call into the
     group is a later user action (a click on a card the hub drew, a tab hidden). */
  const atResolve = new Set();
  for (const text of callers) for (const m of text.matchAll(new RegExp(`${loaderCall.source}\\s*\\)`, 'g'))){
    const end = m.index + m[0].length;
    let body = '';
    const th = text.slice(end, end + 60).match(/^[\s)\]]*\.then\s*\(/);
    if (th){
      let i = end + th[0].length, depth = 1;
      const stop = Math.min(text.length, i + 4000);
      for (; i < stop && depth; i++){ if (text[i] === '(') depth++; else if (text[i] === ')') depth--; }
      body = text.slice(end + th[0].length, i);
    } else if (/\bawait\s*$/.test(text.slice(Math.max(0, m.index - 12), m.index))){
      const rest = text.slice(end, end + 1500), nx = rest.search(/\bawait\b/);
      body = nx < 0 ? rest : rest.slice(0, nx);
    }
    for (const c of body.matchAll(new RegExp(`(?<![\\w$.])(${ID})\\s*\\(`, 'g'))) atResolve.add(c[1]);
  }
  const entries = [];
  for (const n of [...names].sort()){
    const q = n.replace(/\$/g, '\\$');
    const argLists = new Set();
    let gap = false, allGuarded = true;
    for (const text of callers){
      if (bindsLocally(text, q)) continue;   // that file's own parameter or local of the same name (a callback `cb`)
      let calls = 0, guards = 0;
      for (const m of text.matchAll(new RegExp(`(?<![\\w$.])${q}\\s*\\(([^()]*)\\)`, 'g'))){
        if (/function\s*$/.test(text.slice(Math.max(0, m.index - 9), m.index))) continue;
        argLists.add(LITERAL_ARGS.test(m[1]) ? m[1].trim() : '__stub__');
        calls++;
      }
      /* A typeof guard with no group-loader call in the 300 characters before it: a call that can come while the
         group is still arriving (the Tuner's gamesStopMic). A guard inside the loader's .then runs after it. */
      for (const m of text.matchAll(new RegExp(`typeof\\s+${q}\\s*[!=]==?\\s*['"]function['"]`, 'g'))){
        guards++;
        if (!loaderCall.test(text.slice(Math.max(0, m.index - 300), m.index))) gap = true;
      }
      if (calls && !guards) allGuarded = false;
    }
    if (!argLists.size) continue;
    /* guarded: probed after every arrival. guardAll: every file that calls it checks typeof first, so on the page
       a missing definition is SKIPPED, not thrown: the tool calls it the same way and reports the skip. */
    for (const a of [...argLists].sort()) entries.push({ name: n, call: a === '__stub__' ? `${n}(__opl_el())` : `${n}(${a})`, guarded: gap, guardAll: allGuarded, atResolve: atResolve.has(n) });
  }
  return { entries, names };
}
/* Every name a caller file binds for itself: a const/let/var anywhere (not only at top level), a function or
   arrow parameter, a catch binding. Read once per file. */
const LOCALS = new Map();
function bindsLocally(text, q){
  if (!LOCALS.has(text)){
    const s = new Set();
    for (const m of text.matchAll(new RegExp(`\\b(?:const|let|var)\\s+(${ID})|\\bcatch\\s*\\(\\s*(${ID})\\s*\\)|(?<![\\w$.])(${ID})\\s*=>`, 'g'))) s.add(m[1] || m[2] || m[3]);
    for (const m of text.matchAll(/function\s*[\w$]*\s*\(([^()]*)\)|\(([^()\n]*)\)\s*=>/g))
      for (const p of (m[1] ?? m[2]).matchAll(new RegExp(`(?<![\\w$.])(${ID})`, 'g'))) s.add(p[1]);
    LOCALS.set(text, s);
  }
  return LOCALS.get(text).has(q.replace(/\\\$/g, '$'));
}

/* ── THE STATIC PASS (review R1-1). The run only reaches what a call from outside reaches with stub arguments; code
   that runs only during PLAY (a game's rAF / timer / mic loop) or only inside the console's own screens never runs
   in the vm. So, beside the run: every name the NEW site declares (in a part of a NEW list, or a NEW app script)
   that an old page never gets, referenced from a file an old page DOES run, is a finding, with file:line.
   What an old page runs: its OLD eager scripts (old text) and inline handlers, every file of its OLD lists that
   the new tree has (NEW text: that is what it fetches), and any file one of those fetches itself with a literal
   loadScriptOnce('…') (a bridge such as fix A / A2: its names count as reachable; WHEN they arrive is the run's
   question). Names it never gets: declared at top level in a NEW list part or NEW eager script, declared nowhere
   it runs (nor assigned as window.X there). A reference is an identifier in code (not in a comment, not in a
   string except an on…="…" handler), not a property (obj.name), not an object key, not shadowed by a binding of
   the same name in its enclosing top-level function. A reference behind `typeof name` within the 300 characters
   before it is GUARDED: on an old page it is silently skipped; any other reference throws when reached. */
function staticPass(){
  const runs = [];
  for (const f of oldEager){ const t = OLD.tree.read(f); if (t != null) runs.push({ file: f, text: t, side: 'old' }); }
  runs.push({ file: 'index.html (inline handlers)', text: inlineHandlers(OLD.tree.read('index.html') || '').join('\n'), side: 'old' });
  const inRuns = new Set(runs.map(r => r.file));
  for (const g of GROUPS) for (const f of g.oldFiles) if (!inRuns.has(f) && NEW.tree.has(f)){ runs.push({ file: f, text: NEW.tree.read(f), side: 'new' }); inRuns.add(f); }
  const bridged = [];
  for (let k = 0; k < runs.length; k++) if (runs[k].side === 'new'){   // a bridge is a part loading another part itself
    for (const m of scanJs(runs[k].text).code.matchAll(/\bloadScriptOnce\s*\(\s*['"]([^'"]+)['"]/g)){
      const f = m[1];
      if (inRuns.has(f) || !NEW.tree.has(f) || !/\.js$/.test(f)) continue;
      runs.push({ file: f, text: NEW.tree.read(f), side: 'new' }); inRuns.add(f); bridged.push({ file: f, by: runs[k].file });
    }
  }
  const have = new Set();
  for (const r of runs){
    for (const n of topDecls(r.text)) have.add(n);
    for (const m of scanJs(r.text).code.matchAll(new RegExp(`\\bwindow\\.(${ID})\\s*=(?!=)`, 'g'))) have.add(m[1]);
  }
  const newEager = eagerScripts(NEW.tree).filter(s => s.file && !s.inline).map(s => s.file);
  const homes = new Map();   // a name the old page never gets → the NEW file(s) that declare it
  for (const f of [...new Set([...GROUPS.flatMap(g => g.newFiles || []), ...newEager])]) for (const n of declsOf(NEW.tree, f))
    if (!have.has(n)){ if (!homes.has(n)) homes.set(n, []); homes.get(n).push(f); }
  const found = new Map();   // name → [{ file, line, guarded, fn, text }]
  if (homes.size) for (const r of runs){
    const { code, refs } = scanJs(r.text);
    const lines = r.text.split('\n'), starts = [0];
    for (let k = 0; k < r.text.length; k++) if (r.text[k] === '\n') starts.push(k + 1);
    const lineOf = p => { let lo = 0, hi = starts.length - 1; while (lo < hi){ const mid = (lo + hi + 1) >> 1; if (starts[mid] <= p) lo = mid; else hi = mid - 1; } return lo; };
    // top-level functions: a line that starts `function` / `async function` at column 0, to the next `}` at column 0
    const regions = [];
    for (const m of code.matchAll(/^(?:async\s+)?function\s*\*?\s*([\w$]+)[^\n]*$/gm)){
      const end = code.indexOf('\n}', m.index);
      regions.push({ a: m.index, b: end < 0 ? code.length : end + 2, name: m[1] });
    }
    const regionOf = p => regions.find(x => x.a <= p && p < x.b);
    for (const m of refs.matchAll(new RegExp(`(?<![\\w$.])(${ID})`, 'g'))){
      const n = m[1];
      if (!homes.has(n)) continue;
      const p = m.index, after = refs.slice(p + n.length, p + n.length + 3), before = refs.slice(Math.max(0, p - 40), p);
      if (/^\s*:(?!:)/.test(after) && /[{,]\s*$/.test(before)) continue;           // an object key
      if (/\btypeof\s+$/.test(before)) continue;                                   // the guard itself
      if (/\b(?:function|const|let|var|class)\s+$/.test(before)) continue;        // a declaration of its own
      const reg = regionOf(p);
      if (reg && bindsLocally(code.slice(reg.a, reg.b), n.replace(/\$/g, '\\$'))) continue;   // a local of that name
      const q = n.replace(/\$/g, '\\$');
      const guarded = new RegExp(`\\btypeof\\s+${q}\\b`).test(code.slice(Math.max(reg ? reg.a : 0, p - 300), p));
      const ln = lineOf(p);
      if (!found.has(n)) found.set(n, []);
      found.get(n).push({ file: r.file, line: ln + 1, guarded, fn: reg ? reg.name : null, text: lines[ln].trim().slice(0, 110) });
    }
  }
  return { found, homes, bridged, runs: runs.length };
}

// ───────────────────────── one run ─────────────────────────
const MISSING = /^(?:(\S+) is not defined|Cannot access '([^']+)' before initialization|(\S+) is not a function)$/;
function classify(e){
  const msg = e && e.message != null ? String(e.message) : String(e);
  const name = e && e.name ? e.name : 'Error';
  const m = msg.match(MISSING);
  const id = m ? (m[1] || m[2] || m[3]) : null;
  const missing = !!(id && /^[A-Za-z_$][\w$]*$/.test(id) && SITE_NAMES.has(id) && (name === 'ReferenceError' || name === 'TypeError'));
  return { key: `${name}: ${msg}`, missing, id: missing ? id : null };
}
let asyncSink = null;
process.on('unhandledRejection', r => { if (asyncSink) asyncSink(r); });

/* spec: { name, group, page: 'old'|'new', serve(arrivedCount) → OLD|NEW, preload, failOnce } */
async function runCase(spec, seed, handlers){
  const g = spec.group;
  const out = { throws: [], calls: 0, arrivals: "", buildErrors: [], requested: [], harvested: [], log: [], listenerLabels: [] };
  const log = VERBOSE ? (s => out.log.push(s)) : null;
  const side = spec.page === 'new' ? NEW : OLD;
  const page = makePage({ pageTree: side, pageLabel: side.label, rand: rng(seed), log, search: g.short === 'teacher' ? '?teacher' : '' });
  out.buildErrors = page.buildErrors.map(b => `${b.file}: ${b.e && b.e.name}: ${b.e && b.e.message}`);
  if (spec.failOnce) page.net.failOnce.add(spec.failOnce);
  if (spec.drop) page.net.failAlways.add(spec.drop);
  if (spec.cacheFast) page.net.prefer = new Set(side === NEW ? g.newFiles : g.oldFiles);
  let phase = 'build', current = '(page build)';
  let win = null;   // the files still in flight when a later user action is tried early (see callAll)
  const onThrow = e => { const c = classify(e); out.throws.push({ phase, call: current, ...c, window: win }); if (log) log(`      ✗ ${current}: ${c.key}${c.missing ? '   [MISSING NAME]' : ''}`); };
  asyncSink = r => { const c = classify(r); out.throws.push({ phase, call: current + ' (async)', ...c }); if (log) log(`      ✗ async, after ${current}: ${c.key}`); };

  let arrived = 0, serve = spec.serve;
  page.net.serve = src => serve(arrived, src, seed);
  const loaderName = side === NEW ? g.newLoader : g.loader;

  const call = (label, code, guardName) => {
    if (guardName){ let ok = false; try { ok = page.run(`typeof ${guardName} === 'function'`); } catch {} if (!ok) return; }
    current = label; out.calls++;
    if (log) log(`      → ${label}`);
    try { page.run(code); } catch (e) { onThrow(e); }
    page.drainTimers(200, onThrow);
  };
  page.run(`var __opl_el = () => document.createElement('button');`);
  const callListeners = () => {
    page.listeners.forEach((l, i) => {
      if (!/^(visibilitychange|pagehide|gc-langchange|online|resize|keydown)$/.test(l.type)) return;
      const hidden = l.type === 'visibilitychange' || l.type === 'pagehide';
      current = `listener ${l.target}.${l.type} #${i} (${l.file})`; out.calls++; if (!out.listenerLabels.includes(current)) out.listenerLabels.push(current);
      if (log) log(`      → ${current}`);
      if (hidden){ page.doc.hidden = true; page.doc.visibilityState = 'hidden'; }
      try { l.fn.call(l.target === 'document' ? page.doc : page.ctx, { type: l.type, key: 'Escape', target: page.doc.body, persisted: false, preventDefault(){}, stopPropagation(){}, stopImmediatePropagation(){} }); }
      catch (e) { onThrow(e); }
      page.drainTimers(200, onThrow);
      if (hidden){ page.doc.hidden = false; page.doc.visibilityState = 'visible'; }
    });
  };
  // the names this page's own group list declares: once the group has resolved, each of them should exist
  const expected = new Set();
  for (const f of (side === NEW ? g.newFiles : g.oldFiles)) for (const n of declsOf(side.tree, f)) expected.add(n);
  /* At resolve, a call no loader .then makes is a user action tried early: if it throws while files are still in
     flight, that is a WINDOW (a click before those files arrive), reported apart from what stays broken. */
  let curWhich = null;
  const early = en => (curWhich !== 'settled' && !(en && en.atResolve) && page.net.pending.length) ? page.net.pending.map(p => p.src) : null;
  const callAll = which => {
    phase = which; curWhich = which;
    for (const en of g.entries){
      if (en.guardAll){
        let ok = false; try { ok = page.run(`typeof ${en.name} === 'function'`); } catch {}
        if (!ok){
          if (expected.has(en.name)){
            out.calls++;
            out.throws.push({ phase, call: en.call, key: `SKIPPED: every caller's typeof guard finds no ${en.name}, so it silently does not run`, missing: true, id: en.name, window: early(en) });
            if (log) log(`      ✗ ${en.call}: skipped by its callers' typeof guard: ${en.name} is missing   [MISSING NAME]`);
          }
          continue;
        }
      }
      win = early(en); call(en.call, en.call, null); win = null;
    }
    for (const h of handlers){ win = early(null); call(`handler: ${h}`, `(function(event){ ${h} }).call(__opl_el(), { type: 'click', target: __opl_el(), preventDefault(){}, stopPropagation(){} });`, null); win = null; }
    if (which === 'settled') callListeners();
  };
  // after every arrival: what other scripts may call at ANY moment, through their typeof guard
  const probe = () => { const was = phase; phase = 'arrival'; for (const en of g.entries) if (en.guarded) call(en.call, en.call, en.name); phase = was; };
  const deliver = () => { if (page.net.deliverOne()){ arrived++; probe(); } };
  async function drain(){
    for (let n = 0; n < 1000; n++){
      await flush(); await flush();
      if (!page.net.pending.length){ await flush(); if (!page.net.pending.length) return; }
      deliver();
    }
    throw new Error('more than 1000 script loads: the loader is looping');
  }
  const start = which => {
    current = `${loaderName}()`;
    let p, state = { done: false, failed: false };
    try { p = page.run(`${loaderName}()`); } catch (e) { onThrow(e); state.done = true; state.failed = true; return state; }
    // the real callers act inside the loader promise's .then: so do the calls here
    p.then(() => { state.done = true; if (log) log(`    ${loaderName}() resolved`); callAll(which); },
           e => { state.done = true; state.failed = true; if (log) log(`    ${loaderName}() rejected (${e && e.message}): its caller shows the load-failed toast`); });
    return state;
  };
  try {
    if (log) log(`  page ${side.label} (${side.name})${g.short === 'teacher' ? ' ?teacher' : ''}; seed ${seed}; ${spec.name}`);
    if (spec.preload){
      serve = () => OLD;
      const st = start('preload'); void st;
      await drain();
      serve = spec.serve;
      if (log) log('    --- the push ---');
    }
    let st = start('at-resolve');
    await drain();
    if (st.failed){ st = start('retry'); await drain(); }   // the next click: the loader forgot the failed promise
    await drain();
    phase = 'settled'; callAll('settled');
    await drain();
  } finally { asyncSink = null; }
  for (const l of page.net.loadErrors){ const c = classify(l.e); out.throws.push({ phase: 'load', call: `${l.src} running at load`, ...c }); }
  const mine = new Set([...g.oldFiles, ...(g.newFiles || [])]);
  out.arrivals = page.net.arrivals.filter(a => mine.has(a.replace(/!$/, ''))).join(' ');   // the group's own files: module data loads race too, but no group code waits on them
  out.requested = [...new Set(page.net.requested)];
  out.harvested = page.htmlLog;
  return out;
}

// ───────────────────────── which groups, which cases ─────────────────────────
const differs = g => !g.newFiles || g.newFiles.join('|') !== g.oldFiles.join('|') || g.loader !== g.newLoader ||
  [...g.oldFiles, ...g.newFiles].some(f => OLD.tree.read(f) !== NEW.tree.read(f));
const SAME = !GROUPS.some(differs);   // old and new are the same here: run every group anyway, as a self-check of the tool
const RUN = SAME ? GROUPS.slice() : GROUPS.filter(differs);
for (const g of RUN){ const r = groupEntries(g); g.entries = r.entries; g.names = r.names; }
const appChanged = oldEager.some(f => OLD.tree.read(f) !== NEW.tree.read(f));

console.log(`old-page-loop: old ${OLD.name}, new ${NEW.name}`);
for (const g of GROUPS){
  const same = g.newFiles && g.newFiles.join('|') === g.oldFiles.join('|');
  const ran = RUN.includes(g);
  console.log(`  ${g.array} (loader ${g.loader}()): old ${g.oldFiles.length} parts, new ${g.newFiles ? g.newFiles.length : 'NO LIST'}` +
    `${same ? ', same list' : ', LIST CHANGED'}${ran ? `; ${g.entries.length} calls from outside it into it (${g.entries.filter(e => e.guarded).length} behind a typeof guard)${SAME ? '; no file differs: run as a self-check' : ''}` : '; no file differs: not run'}`);
}
const STATIC = staticPass();
console.log(`  static: ${STATIC.homes.size} names the new site declares that an old page never gets; ${STATIC.found.size} of them referenced from the ${STATIC.runs} files an old page runs`);
for (const b of STATIC.bridged) console.log(`  static: ${b.file} is fetched by ${b.by} itself (loadScriptOnce), outside the loader's chain: its names count as reachable; whether they arrive in time is the run's question`);
if (VERBOSE) for (const g of RUN) console.log(`  ${g.short} entry points (A = called in a loader .then, G = behind a typeof guard any time, S = every caller guards it):\n    ` +
  g.entries.map(e => `${e.call}${e.atResolve || e.guarded || e.guardAll ? ' [' + (e.atResolve ? 'A' : '') + (e.guarded ? 'G' : '') + (e.guardAll ? 'S' : '') + ']' : ''}`).join(' · '));
if (!RUN.length){ console.log(`\nold-page-loop: no part list and no part file differs${appChanged ? ' (the app scripts do; this tool runs the lazy groups only)' : ''}: nothing to run. ✓ 0 findings`); process.exit(0); }

const casesFor = g => {
  const sfx = RUN.length > 1 ? `:${g.short}` : '';
  const c = [
    { name: 'control-old' + sfx, group: g, page: 'old', serve: () => OLD, control: true },
    { name: 'control-new' + sfx, group: g, page: 'new', serve: () => NEW, control: true },
    { name: 'after-push' + sfx, group: g, page: 'old', serve: () => NEW },
  ];
  for (let k = 1; k < g.oldFiles.length; k++) c.push({ name: `half-${k}${sfx}`, group: g, page: 'old', serve: n => n < k ? OLD : NEW });
  c.push({ name: 'loaded-before' + sfx, group: g, page: 'old', serve: () => NEW, preload: true });
  /* Under sw.js ANY subset of the parts can come from an old cache, not only a first K (review R1-5): each seed
     picks its own subset of the group's files to be old (a file the old tree has), the rest new. */
  const own = new Set([...g.oldFiles, ...(g.newFiles || [])]);
  c.push({ name: 'mixed-random' + sfx, group: g, page: 'old', serve: (n, src, seed) => own.has(src) && OLD.tree.has(src) && subsetPick(seed, src) ? OLD : NEW });
  // a second old tab: its list's files from the cache at once, the parts fetched outside the chain last (R1-6)
  c.push({ name: 'cache-fast' + sfx, group: g, page: 'old', serve: () => NEW, cacheFast: true, once: true });
  /* The other way round: a NEW page given one OLD cached part (a new page served while the old worker's cache
     still holds that file). One case per new-list file the old tree has with other bytes. */
  for (const f of (g.newFiles || [])) if (OLD.tree.has(f) && OLD.tree.read(f) !== NEW.tree.read(f))
    c.push({ name: `new-page-old-${f}${sfx}`, group: g, page: 'new', serve: (n, src) => src === f ? OLD : NEW });
  return c;
};
// a seeded coin per (seed, file): the same seed always picks the same subset
function subsetPick(seed, src){ let h = (seed * 2654435761) >>> 0; for (const ch of src) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0x5bd1e995) >>> 0; h ^= h >>> 15; return (h & 1) === 1; }

const only = ARGS.case, onlySeed = ARGS.seed != null ? parseInt(ARGS.seed, 10) : null;
const seeds = onlySeed != null ? [onlySeed] : Array.from({ length: ORDERS }, (_, i) => i + 1);
if (ARGS.list){
  for (const g of RUN) console.log(casesFor(g).map(c => c.name).join('\n') + `\nfail-<file>${RUN.length > 1 ? ':' + g.short : ''} for each file after-push fetches`);
  process.exit(0);
}

const results = [];
const handlersOf = new Map(), fetched = new Map();
for (const g of RUN){
  /* The inline handlers the NEW page's own calls render (the hub's cards → every game id), found once, on the
     new page with the new files; only those that call a name this group declares. */
  const probeRun = await runCase({ name: 'harvest', group: g, page: 'new', serve: () => NEW }, 1, []);
  if (probeRun.buildErrors.length) die(`the NEW page could not be built: ${probeRun.buildErrors.join(' | ')}`);
  const seen = new Set();
  for (const h of probeRun.harvested) for (const code of inlineHandlers(h)){
    const called = [...code.matchAll(new RegExp(`(?<![\\w$.])(${ID})\\s*\\(`, 'g'))].map(m => m[1]);
    if (called.some(n => g.names.has(n)) && !/\$\{/.test(code)) seen.add(code.trim());
  }
  handlersOf.set(g, [...seen].sort());
  const oldRun = await runCase({ name: 'probe-old', group: g, page: 'old', serve: () => NEW }, 1, []);
  if (oldRun.buildErrors.length) die(`the OLD page could not be built: ${oldRun.buildErrors.join(' | ')}`);
  fetched.set(g, oldRun.requested);
  /* Pins, so the tool cannot go blind (code-hygiene 7 and 8): the group has calls into it, the old page fetched
     every file of its own list, and a CANARY: the new page with one new file that never arrives (the one that
     declares the most of the entry names) must make at least one call throw a missing name. */
  if (!g.entries.length) die(`${g.array}: no call from outside the group into it was found (discovery is blind)`);
  /* the old page fetches its list in order up to the first file the new tree does not have (the loader stops there:
     a rollback, or a part removed); anything less means the fetch layer or the loader call is broken */
  const gone = g.oldFiles.findIndex(f => !NEW.tree.has(f));
  const notFetched = g.oldFiles.slice(0, gone < 0 ? undefined : gone + 1).filter(f => !oldRun.requested.includes(f));
  if (notFetched.length) die(`${g.array}: the old page never fetched ${notFetched.join(', ')} (the fetch layer or the loader call is broken)`);
  if (gone >= 0) g.gone = g.oldFiles[gone];
  const declCount = f => g.entries.filter(e => declsOf(NEW.tree, f).has(e.name)).length;
  const drop = [...(g.newFiles || g.oldFiles)].sort((a, b) => declCount(b) - declCount(a))[0];
  const canary = await runCase({ name: 'canary', group: g, page: 'new', serve: () => NEW, drop }, 1, handlersOf.get(g));
  const caught = canary.throws.filter(t => t.missing).length;
  if (!caught) die(`canary: the new page without ${drop} made no call throw a missing name: the tool is blind`);
  g.canary = `without ${drop} (declares ${declCount(drop)} entry names) ${caught} calls threw a missing name`;
}
for (const g of RUN){
  const sfx = RUN.length > 1 ? `:${g.short}` : '';
  const cases = [...casesFor(g), ...fetched.get(g).filter(f => g.oldFiles.includes(f) || (g.newFiles || []).includes(f)).map(f => ({ name: `fail-${f}${sfx}`, group: g, page: 'old', serve: () => NEW, failOnce: f }))];
  for (const c of cases){
    if (only && c.name !== only && !c.control) continue;   // the controls always run: they say which throws are stub noise
    for (const s of (c.once ? seeds.slice(0, 1) : seeds)){
      const out = await runCase(c, s, handlersOf.get(g));
      results.push({ case: c.name, control: !!c.control, seed: s, out });
      if (only && VERBOSE && c.name === only){ console.log(`── ${c.name} seed ${s}: arrivals ${out.arrivals}`); for (const l of out.log) console.log(l); }
    }
  }
}
if (only && !results.some(r => r.case === only)) die(`no case named ${only} (--list names them)`);

// ───────────────────────── verdicts ─────────────────────────
/* A throw that is not a missing site name is NOISE when a control makes the same throw from the same call:
   the stubs, not the code. Every missing-name throw (and every skip by a typeof guard) is a finding, controls
   included. Findings are grouped by their cause: one missing name, with every call it breaks. */
/* A throw AT LOAD (a part that does not run through: a SyntaxError, a name read at load that is missing) is never
   noise: a stub cannot cause it (review R1-2: a cut that COPIED code instead of moving it). */
const hard = t => t.missing || t.phase === 'load';
const noise = new Set();
for (const r of results) if (r.control) for (const t of r.out.throws) if (!hard(t)) noise.add(`${t.call}\0${t.key}`);
/* A missing-name throw that BOTH consistent pages make (old page + old files, new page + new files), from the
   same call in the same phase, is not caused by the push: listed apart as "on both pages", never a finding. */
const ctrlMissing = { 'control-old': new Set(), 'control-new': new Set() };
for (const r of results) if (r.control) for (const t of r.out.throws) if (hard(t)) ctrlMissing[r.case.replace(/:.*/, '')].add(`${t.call}\0${t.key}\0${t.phase}`);
const both = new Set([...ctrlMissing['control-old']].filter(k => ctrlMissing['control-new'].has(k)));
const causes = new Map(), before = new Map(), notes = new Map();
const callsSeen = new Set(), callsHit = new Set();
let calls = 0, threw = 0, noiseN = 0;
for (const r of results){
  calls += r.out.calls;
  for (let t of r.out.throws){
    if (!hard(t) && (r.control || noise.has(`${t.call}\0${t.key}`))){ noiseN++; if (VERBOSE && only) console.log(`   noise (same in a control): ${t.call} → ${t.key}`); continue; }
    if (both.has(`${t.call}\0${t.key}\0${t.phase}`)){ const k = `${t.call} → ${t.key} [${t.phase}]`; before.set(k, (before.get(k) || 0) + 1); continue; }
    /* A new page with one OLD cached part F (the whole file before a split) and the new child C: C does not load
       ("Identifier … has already been declared"), but when F already declares every name C declares, nothing is
       missing; the page logs one error. A NOTE, not a finding (a split always does this). */
    const npo = r.case.match(/^new-page-old-(.+?)(?::\w+)?$/);
    if (npo && t.phase === 'load' && /has already been declared/.test(t.key)){
      const C = t.call.replace(/ running at load$/, ''), have = declsOf(OLD.tree, npo[1]);
      if ([...declsOf(NEW.tree, C)].every(n => have.has(n))){ const k = `a new page with the old ${npo[1]} logs "${t.key}" when ${C} loads; the old file already holds every name ${C} declares, so nothing is missing (one error report)`; notes.set(k, (notes.get(k) || 0) + 1); continue; }
    }
    threw++;
    // a control's own load throw: that SITE does not load, push or no push
    if (t.phase === 'load' && r.control) t = { ...t, missing: false, key: `the ${r.case.startsWith('control-new') ? 'NEW' : 'OLD'} site itself does not load: ${t.call.replace(/ running at load$/, '')} → ${t.key}` };
    const k = (t.missing ? `${t.id}\0${t.key.startsWith('SKIPPED') ? 'skip' : 'throw'}` : `${t.call}\0${t.key}`) + (t.window ? '\0window' : '');
    if (!causes.has(k)) causes.set(k, { id: t.id, key: t.key.startsWith('SKIPPED') ? t.key : (t.missing ? `${t.key.split(':')[0]}: ${t.id} ${/before initialization/.test(t.key) ? 'used before its file ran' : 'is not defined'}` : t.key), calls: new Set(), phases: new Set(), cases: new Map(), first: null, windowOnly: true, pending: new Set() });
    const c = causes.get(k);
    if (t.window) for (const p of t.window) c.pending.add(p); else c.windowOnly = false;
    c.calls.add(t.call); c.phases.add(t.phase); if (t.phase !== 'load') callsHit.add(t.call.replace(/ \(async\)$/, ''));
    if (!c.cases.has(r.case)) c.cases.set(r.case, new Set());
    c.cases.get(r.case).add(r.seed);
    if (!c.first || (!t.window && c.first.window)) c.first = { case: r.case, seed: r.seed, window: !!t.window };
  }
}
for (const g of RUN){ for (const en of g.entries) callsSeen.add(en.call); for (const h of handlersOf.get(g)) callsSeen.add(`handler: ${h}`); }
const listenerLabels = new Set(results.flatMap(r => r.out.listenerLabels || []));
for (const l of listenerLabels) callsSeen.add(l);
const orders = new Map();
for (const r of results){ if (!orders.has(r.case)) orders.set(r.case, new Set()); orders.get(r.case).add(r.out.arrivals); }
const maxOrders = Math.max(...[...orders.values()].map(s => s.size));
const caseNames = [...new Set(results.map(r => r.case))];

for (const g of RUN){
  const own = fetched.get(g).filter(f => g.oldFiles.includes(f) || (g.newFiles || []).includes(f));
  console.log(`  ${g.short}: ${g.entries.length} calls + ${handlersOf.get(g).length} inline handlers from the new page's markup + ${listenerLabels.size} page listeners; the old page fetched ${own.length} group files after the push (${own.join(', ')})${fetched.get(g).length > own.length ? ` and ${fetched.get(g).length - own.length} others` : ''}`);
  console.log(`  ${g.short} canary: ${g.canary} ✓`);
}
const inCases = (c, prefix) => [...c.cases.keys()].some(n => n.startsWith(prefix));
const all = [...causes.values()].sort((a, b) => (b.id ? 1 : 0) - (a.id ? 1 : 0) || b.calls.size - a.calls.size || a.key.localeCompare(b.key));
const list = all.filter(c => !c.windowOnly), windows = all.filter(c => c.windowOnly);
for (const g of RUN) if (g.gone) list.unshift({ id: null, windowOnly: false, pending: new Set(), phases: new Set(['load']),
  key: `the old page's ${g.array} names ${g.gone}, which the new files do not have: ${g.loader}() rejects there on every try, so the group never finishes loading`,
  calls: new Set([`${g.loader}()`]), cases: new Map([['after-push' + (RUN.length > 1 ? ':' + g.short : ''), new Set(seeds)]]), first: { case: 'after-push' + (RUN.length > 1 ? ':' + g.short : ''), seed: seeds[0] } });
if (!only) console.log(`  controls: old page + old files ${list.filter(c => inCases(c, 'control-old')).length} findings; new page + new files ${list.filter(c => inCases(c, 'control-new')).length} findings (${noise.size} distinct throws a control also makes are stub noise, not counted)`);
console.log(`  cases: ${caseNames.length} × ${seeds.length} seeded orders; most distinct arrival orders seen in one case: ${maxOrders}${maxOrders === 1 ? ' (nothing loads concurrently on these pages: every order is the same)' : ''}`);
const show = (arr, title, mark) => {
  if (!arr.length) return;
  console.log(title);
  arr.forEach((f, i) => {
    console.log(`  ${mark}${i + 1}. ${f.key}   [${[...f.phases].join(', ')}]`);
    if (f.id){
      const where = NEW_DEF.get(f.id) || [], was = OLD_DEF.get(f.id) || [];
      const g = GROUPS.find(gr => where.some(w => (gr.newFiles || []).includes(w)));
      const never = g ? where.filter(w => !g.oldFiles.includes(w)) : [];
      console.log(`     ${f.id} is defined in ${where.length ? where.join(', ') + ' (new)' : 'no new file'}${was.length ? `, ${was.join(', ')} (old)` : ''}` +
        (never.length ? `: the old page's ${g.array} never asks for ${never.join(', ')}` : ''));
    }
    if (f.windowOnly) console.log(`     only while ${[...f.pending].join(', ')} ${f.pending.size === 1 ? 'is' : 'are'} still in flight after the group loader resolved: a click that lands first throws; once ${f.pending.size === 1 ? 'it arrives' : 'they arrive'} it works`);
    const cl = [...f.calls];
    console.log(`     ${cl.length} call${cl.length === 1 ? '' : 's'}: ${cl.slice(0, 12).join(' · ')}${cl.length > 12 ? ` · … ${cl.length - 12} more (--verbose)` : ''}`);
    if (VERBOSE && cl.length > 12) console.log(`       ${cl.slice(12).join(' · ')}`);
    const cs = [...f.cases.entries()];
    const orderCases = cs.filter(([c]) => !/^cache-fast/.test(c));
    const inOrders = orderCases.reduce((a, [, s]) => a + s.size, 0), ofOrders = orderCases.length * seeds.length;
    console.log(`     in ${inOrders} of ${ofOrders} seeded runs of the cases it appears in (uniform arrival orders: not a browser rate); in cache-fast (a second old tab, its list from the cache first): ${cs.some(([c]) => /^cache-fast/.test(c)) ? 'YES' : 'no'}`);
    console.log(`     cases: ${orderCases.slice(0, 8).map(([c, s]) => `${c} ${s.size}/${seeds.length}`).join(', ')}${orderCases.length > 8 ? `, … ${orderCases.length - 8} more` : ''}`);
    console.log(`     replay: node tools/old-page-loop.mjs --old ${ARGS.old} --new ${ARGS.new} --case=${f.first.case} --seed=${f.first.seed} --verbose`);
  });
};
if (notes.size) console.log(`\nNOTES (${notes.size}; not findings):\n    ${[...notes.keys()].join('\n    ')}`);
if (before.size) console.log(`\nON BOTH PAGES (${before.size}; old page + old files and new page + new files make these too, so the push does not cause them; not findings):\n    ${[...before.keys()].join('\n    ')}`);
show(list, `\nFINDINGS (${list.length} cause${list.length === 1 ? '' : 's'}; a call a real caller makes throws or is skipped; [settled] = still broken once every file has arrived, until a reload):`, '✗ ');
show(windows, `\nWINDOWS (${windows.length}; a user action in the moment between the group loader resolving and a part it loads itself arriving; exit 1 only with --strict):`, '⚠ ');
/* Static verdicts (review R2-2). An UNGUARDED reference throws when an old page reaches it, whether the name moved
   or is new in this push: a finding either way, labelled so the reader can judge ("new in this push": reachable
   only after a guarded call into the new part, as ca5a220b's scStart after scOpen, is not provable statically).
   A name the OLD site had, reached only behind typeof, is a finding too (SKIPPED: silently not done any more). A
   NEW name reached only behind typeof is a NOTE: the guard does what it is for. */
const staticAll = [...STATIC.found.entries()].sort((a, b) => a[0].localeCompare(b[0]));
const staticList = staticAll.filter(([n, rs]) => OLD_DEF.has(n) || rs.some(r => !r.guarded));
const staticNote = staticAll.filter(([n, rs]) => !OLD_DEF.has(n) && rs.every(r => r.guarded));
const staticWarn = [];
const showStatic = (arr, title, mark) => {
  if (!arr.length) return;
  console.log(title);
  arr.forEach(([n, rs], i) => {
    const un = rs.filter(r => !r.guarded), gd = rs.filter(r => r.guarded);
    console.log(`  ${mark}${i + 1}. ${n} (only in ${STATIC.homes.get(n).join(', ')} (new), which an old page never fetches${OLD_DEF.has(n) ? `; the old site had it in ${OLD_DEF.get(n).join(', ')}` : '; new in this push'}): ${un.length ? `${un.length} reference${un.length === 1 ? '' : 's'} THROW when reached` : ''}${un.length && gd.length ? ', ' : ''}${gd.length ? `${gd.length} behind typeof: SKIPPED, silently not done` : ''}`);
    for (const r of [...un, ...gd].slice(0, VERBOSE ? Infinity : 4))
      console.log(`       ${r.file}:${r.line}${r.fn ? ` in ${r.fn}()` : ''} [${r.guarded ? 'skipped' : 'throws'}]  ${r.text}`);
    if (!VERBOSE && rs.length > 4) console.log(`       … ${rs.length - 4} more (--verbose)`);
  });
};
const nNew = staticList.filter(([n]) => !OLD_DEF.has(n)).length;
showStatic(staticList, `\nSTATIC FINDINGS (${staticList.length} name${staticList.length === 1 ? '' : 's'} an old page reaches but never gets: ${staticList.filter(([, rs]) => rs.some(r => !r.guarded)).length} THROW when reached, ${staticList.filter(([, rs]) => rs.every(r => r.guarded)).length} only SKIPPED; this covers code the run cannot reach: in-game loops, the console's own screens)` +
  (nNew ? `:\n  ${nNew} of them are new in this push: read their lines; one reached only after a guarded call into the new part (e.g. after \`typeof scOpen\`) cannot throw on an old page, but that cannot be proved statically:` : ':'), '✗ S');
showStatic(staticNote, `\nSTATIC NOTES (${staticNote.length}; a name new in this push, referenced only behind typeof: an old page skips it, as the guard intends; not findings):`, '· S');
const parts = side => RUN.map(g => `${side === 'old' ? g.oldFiles.length : (g.newFiles || []).length} ${g.short}`).join(' + ');
const bad = list.length || staticList.length || (ARGS.strict && windows.length);
console.log(`\nold-page-loop: old ${parts('old')} parts, new ${parts('new')} parts; ${callsSeen.size} entry points × ${seeds.length} orders × ${caseNames.length} cases = ${calls} calls; ${callsHit.size} of the ${callsSeen.size} entry points threw or were skipped (${threw} times): ${list.length} finding${list.length === 1 ? '' : 's'}, ${windows.length} window${windows.length === 1 ? '' : 's'}; static: ${staticList.length} finding${staticList.length === 1 ? "" : "s"} (${nNew} new in this push), ${staticNote.length} note${staticNote.length === 1 ? "" : "s"}; ${noiseN} throws matched a control (stub noise). ${bad ? '✗' : '✓'} ${((Date.now() - T0) / 1000).toFixed(1)} s`);
process.exit(bad ? 1 : 0);
