/* emu-site.mjs — the site's own pages on the REAL Firebase JS SDK, against the Firebase EMULATORS (2026-11-26).

   Shared by tools/signin-loop.mjs and tools/progress-emu-loop.mjs (closed-loop report 2026-11-26, steps 1 and 2).
   Not a test on its own. Needs Java and three npm packages the repo does not carry (firebase-tools, firebase at
   the version index.html loads from gstatic): see either tool's header for the commands, and
   .github/workflows/rules.yml (job "emu-loops") for how GitHub runs them.

   WHAT IS REAL
   - The site's scripts, unmodified, each page its own Node vm context, in index.html's order (firebase-config.js,
     config-main.js, class-activities.js, i18n.js, guitar-diagrams.js, every module-N.js, every app/*.js part,
     practice-minutes-config.js, practice-minutes.js, fab-tools.js, tuner.js, live-quiz.js, live-quiz-teacher.js),
     as tools/shared-chromebook-loop.mjs loads them. The console parts (teacher-*.js) load when the site appends
     their <script> (ensureTeacherJs), as in the browser.
   - The Firebase JS SDK: the compat build (firebase/compat/app, auth, firestore) from npm, at the version
     index.html loads (checked at start), one app per page load (a reload is a fresh SDK: a fresh memory cache
     and a fresh write queue, as the site has no enablePersistence). Node's build of the SDK talks gRPC where a
     browser talks WebChannel; everything above the transport (the write queue, merge, transactions, the offline
     queue, the cache) is the same code.
   - The Auth emulator (the made-up accounts) and the Firestore emulator with the rules text the tool loads (the
     repo's firestore.rules unless a tool plants a fault in a copy).
   - The site's own sign-in callback (app/start.js onAuthStateChanged) and everything it calls.

   WHAT IS NOT
   - The Google popup: Node has none. The tool signs the page's own Auth in with signInWithCredential and a
     made-up Google token (the Auth emulator's own way); from the site's onAuthStateChanged on, it is the site's.
   - The DOM: a stub (the shape of shared-chromebook-loop's). It records what the site writes; it does not lay
     anything out. getElementById gives a stub for every id EXCEPT the ids the site creates itself
     (`.id = '...'` in an app part: the access screen, the paused screen, the notices, the period question),
     which exist only once the site appends them, as in the browser. element.querySelector finds an element the site
     drew into that element's innerHTML (one compound selector; see `found` in makePage); document.querySelector and
     querySelectorAll find nothing.
   - Timers are real (the site's 800 ms save debounce really waits), so each case takes seconds.

   THE REALM BRIDGE. The SDK runs in the tool's own realm; the site runs in a vm realm. The SDK refuses an object
   made in another realm ("a custom Object object"), which in a browser never happens (one realm). So every call
   from the site into the SDK goes through toMain(): a plain object or array of the site's is copied, value for
   value, into the tool's realm (undefined values kept, so the SDK still refuses them; a Date copied as a Date);
   any other object (an SDK object, a class instance of the site's) is passed as it is, so the SDK judges it as a
   browser's would. Values back from the SDK are wrapped (SDK objects) or copied into the site's realm (plain
   data). Nothing else is translated. site-errors-rules-test.mjs --site does the same copy by hand.

   THE WALL. A run refuses to start unless the project id starts with "demo-" (an id the emulators accept and no
   real project can have) and both emulators are on 127.0.0.1 / localhost. The site's own firebaseConfig (the
   class project's, from firebase-config.js) is read and recorded but never used: every page's app gets the demo
   config. The tool's own fetch() refuses any address that is not 127.0.0.1 / localhost (and counts it: a tool
   ends red when the count is not 0); a page's fetch() refuses everything. */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';
import vm from 'node:vm';
import net from 'node:net';

const HERE = dirname(fileURLToPath(import.meta.url));

/* ─────────────────────────── arguments shared by both tools ─────────────────────────── */
export function emuArgs(argv, toolName){
  const val = k => { const i = argv.indexOf('--' + k); if (i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--')) return argv[i + 1]; const a = argv.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
  const site = resolve(val('site') || join(HERE, '..'));
  const deps = resolve(val('deps') || process.cwd());
  const rules = resolve(val('rules') || join(site, 'firestore.rules'));
  const hostOf = (envName, flag, dflt) => { const v = val(flag) || process.env[envName] || dflt; return v.replace(/^https?:\/\//, ''); };
  const fsHost = hostOf('FIRESTORE_EMULATOR_HOST', 'firestore', '127.0.0.1:8089');
  const authHost = hostOf('FIREBASE_AUTH_EMULATOR_HOST', 'auth', '127.0.0.1:9099');
  const project = val('project') || process.env.GCLOUD_PROJECT || 'demo-gc';
  const fail = msg => { console.log(`\n✗ ${toolName}: ${msg}: 0 passed, 1 failed`); process.exit(2); };
  if (!/^demo-[a-z0-9-]+$/.test(project)) fail(`the project id "${project}" does not start with "demo-": refused (the emulators run under a demo- id, which no real project can have)`);
  for (const h of [fsHost, authHost]) if (!/^(127\.0\.0\.1|localhost):\d+$/.test(h)) fail(`the emulator address ${h} is not 127.0.0.1 or localhost: refused`);
  if (!existsSync(join(site, 'app', 'boot.js'))) fail(`--site ${site} holds no app/boot.js`);
  if (!existsSync(rules)) fail(`no rules file at ${rules}`);
  return { site, deps, rules, fsHost, authHost, project, val, has: k => argv.includes('--' + k) };
}

/* ─────────────────────────── the SDK, from the deps folder ─────────────────────────── */
export function loadSdk(deps, site){
  const req = createRequire(join(deps, 'noop.js'));
  let m;
  try { m = req('firebase/compat/app'); req('firebase/compat/auth'); req('firebase/compat/firestore'); }
  catch (e){ throw new Error(`cannot load the Firebase SDK from ${deps}/node_modules (npm i firebase@<the version index.html loads> there, or pass --deps): ${e.message}`); }
  const fb = m.default || m;
  const have = req('firebase/package.json').version;
  const html = readFileSync(join(site, 'index.html'), 'utf8');
  const want = (/gstatic\.com\/firebasejs\/([0-9.]+)\/firebase-app-compat\.js/.exec(html) || [])[1] || '?';
  fb.firestore.setLogLevel('silent');
  return { fb, version: have, siteVersion: want };
}

/* ─────────────────────────── the wall: the tool's own fetch ─────────────────────────── */
export const wall = { refused: [] };
{
  const realFetch = globalThis.fetch;
  globalThis.fetch = function(url, opts){
    const u = String(url && url.url ? url.url : url);
    if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(u)){
      wall.refused.push(u.slice(0, 120));
      return Promise.reject(new Error('emu-site wall: refused ' + u.slice(0, 80)));
    }
    return realFetch(url, opts);
  };
}
/* gRPC (the Node SDK's Firestore transport) honours https_proxy; the emulator is local. */
if (process.env.https_proxy || process.env.HTTPS_PROXY || process.env.grpc_proxy) process.env.no_grpc_proxy = '127.0.0.1,localhost';

/* ─────────────────────────── the emulators' REST doors ─────────────────────────── */
export function emulator(a){
  const fsBase = `http://${a.fsHost}`, authBase = `http://${a.authHost}`;
  const docs = `${fsBase}/v1/projects/${a.project}/databases/(default)/documents`;
  /* Every call to an emulator's REST door gives up after 15 s (AbortSignal): a stalled emulator fails a step, it
     never holds the run. */
  const req = async (method, url, body, token) => {
    const r = await fetch(url, { method, signal: AbortSignal.timeout(15000), headers: Object.assign({ 'Content-Type': 'application/json' }, token ? { Authorization: 'Bearer ' + token } : {}), body: body === undefined ? undefined : JSON.stringify(body) });
    const text = await r.text();
    let json = null; try { json = text ? JSON.parse(text) : null; } catch { json = null; }
    return { status: r.status, json, text };
  };
  return {
    async loadRules(text){
      const r = await req('PUT', `${fsBase}/emulator/v1/projects/${a.project}:securityRules`, { rules: { files: [{ name: 'firestore.rules', content: text }] } });
      if (r.status !== 200) throw new Error(`the emulator refused the rules (HTTP ${r.status}): ${r.text.slice(0, 300)}`);
    },
    /* Asked once more, half a second later, after an HTTP 500: one 500 from the emulator should not stop a run. */
    async clearFirestore(){
      const url = `${fsBase}/emulator/v1/projects/${a.project}/databases/(default)/documents`;
      let r = await req('DELETE', url);
      if (r.status === 500){ await new Promise(res => setTimeout(res, 500)); r = await req('DELETE', url); }
      if (r.status !== 200) throw new Error('clear Firestore: HTTP ' + r.status);
    },
    async clearAuth(){ const r = await req('DELETE', `${authBase}/emulator/v1/projects/${a.project}/accounts`); if (r.status !== 200) throw new Error('clear Auth: HTTP ' + r.status); },
    /* The SEPARATE READER: the emulator's REST door with the owner key (rules bypassed), never the client SDK and
       never the site's code. null = no such document. */
    async ownerGet(path){
      const r = await req('GET', `${docs}/${path}`, undefined, 'owner');
      if (r.status === 404) return null;
      if (r.status !== 200) throw new Error(`owner read ${path}: HTTP ${r.status} ${r.text.slice(0, 160)}`);
      return decodeFields(r.json.fields || {});
    },
    async ownerList(coll){
      const r = await req('GET', `${docs}/${coll}?pageSize=300`, undefined, 'owner');
      if (r.status !== 200) throw new Error(`owner list ${coll}: HTTP ${r.status}`);
      return ((r.json && r.json.documents) || []).map(d => ({ id: d.name.split('/').pop(), data: decodeFields(d.fields || {}) }));
    },
    /* Replaces the whole document (or creates it), rules bypassed: the tool's seeds. */
    async ownerSet(path, obj){
      const r = await req('PATCH', `${docs}/${path}`, { fields: encodeFields(obj) }, 'owner');
      if (r.status !== 200) throw new Error(`owner write ${path}: HTTP ${r.status} ${r.text.slice(0, 200)}`);
    },
    async ownerDelete(path){ await req('DELETE', `${docs}/${path}`, undefined, 'owner'); },
    /* A read AS an account (its ID token, from the Auth emulator or forged below): 'ok' | 'denied' | 'HTTP n'. */
    async readAs(path, token){
      const r = await req('GET', `${docs}/${path}`, undefined, token);
      if (r.status === 200 || r.status === 404) return 'ok';
      if (r.status === 403) return 'denied';
      return 'HTTP ' + r.status + ' ' + r.text.slice(0, 100);
    },
    /* An account through the Auth emulator's own Google sign-in (the same door signInWithCredential uses):
       { idToken, email (as the emulator keeps it), emailVerified, uid }. */
    async googleSignIn(claims){
      const postBody = 'id_token=' + encodeURIComponent(JSON.stringify(claims)) + '&providerId=google.com';
      const r = await req('POST', `${authBase}/identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=demo-key`, { postBody, requestUri: 'http://localhost', returnIdpCredential: true, returnSecureToken: true });
      if (r.status !== 200) return { error: (r.json && r.json.error && r.json.error.message) || ('HTTP ' + r.status) };
      const tok = decodeJwt(r.json.idToken);
      return { idToken: r.json.idToken, uid: r.json.localId, email: tok.email, emailVerified: tok.email_verified === true, claims: tok };
    },
    /* A token no sign-in made: the claims exactly as given (unsigned, as the emulators accept; what
       @firebase/rules-unit-testing calls mockUserToken). For the addresses a provider could send in a shape the
       Auth emulator changes (it lower-cases an address). */
    forgeToken(claims){
      const iat = Math.floor(Date.now() / 1000);
      const uid = claims.sub;
      const payload = Object.assign({ iss: `https://securetoken.google.com/${a.project}`, aud: a.project, iat, exp: iat + 3600, auth_time: iat, sub: uid, user_id: uid, firebase: { sign_in_provider: 'google.com', identities: {} } }, claims);
      const b64 = o => Buffer.from(JSON.stringify(o)).toString('base64url');
      return b64({ alg: 'none', kid: 'fakekid', type: 'JWT' }) + '.' + b64(payload) + '.';
    },
  };
}
export function decodeJwt(t){ try { return JSON.parse(Buffer.from(String(t).split('.')[1], 'base64url').toString('utf8')); } catch { return {}; } }
function encodeValue(v){
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number') return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (typeof v === 'string') return { stringValue: v };
  if (v instanceof Date) return { timestampValue: v.toISOString() };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(encodeValue) } };
  return { mapValue: { fields: encodeFields(v) } };
}
function encodeFields(o){ const f = {}; for (const k of Object.keys(o)) f[k] = encodeValue(o[k]); return f; }
/* Timestamps come back as { __ts: <ms> } so a compare can tell them from numbers. */
function decodeValue(v){
  if ('nullValue' in v) return null;
  if ('booleanValue' in v) return v.booleanValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return Number(v.doubleValue);
  if ('stringValue' in v) return v.stringValue;
  if ('timestampValue' in v) return { __ts: Date.parse(v.timestampValue) };
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(decodeValue);
  if ('mapValue' in v) return decodeFields(v.mapValue.fields || {});
  return { __other: Object.keys(v)[0] };
}
function decodeFields(f){ const o = {}; for (const k of Object.keys(f)) o[k] = decodeValue(f[k]); return o; }

/* ─────────────────────────── the realm bridge ─────────────────────────── */
function membrane(ctx){
  const V = vm.runInContext('({ O: Object.prototype, A: Array.prototype, D: Date.prototype, mkO: () => ({}), mkA: () => [] })', ctx);
  const t2p = new WeakMap(), p2t = new WeakMap(), fnIn = new WeakMap(), fnOut = new WeakMap();
  const plainOf = v => { const p = Object.getPrototypeOf(v); return p === Object.prototype || p === null || p === V.O; };
  /* An object or function made in the site's realm (not an instance of this realm's Object). */
  const siteMade = v => !(v instanceof Object) && Object.getPrototypeOf(v) !== null;
  function toMain(v){
    if (v === null || (typeof v !== 'object' && typeof v !== 'function')) return v;
    if (p2t.has(v)) return p2t.get(v);
    if (typeof v === 'function'){
      if (fnIn.has(v)) return fnIn.get(v);
      const w = function(...args){ return toMain(v.apply(this === undefined || this === globalThis ? undefined : wrap(this), args.map(wrap))); };
      fnIn.set(v, w); fnOut.set(w, v); return w;
    }
    if (Array.isArray(v)) return Array.from(v, toMain);
    if (Object.getPrototypeOf(v) === V.D) return new Date(v.getTime());
    if (plainOf(v)){ const o = {}; for (const k of Object.keys(v)) o[k] = toMain(v[k]); return o; }
    return v;
  }
  function toVmData(v){
    if (Array.isArray(v)){ const a = V.mkA(); for (const x of v) a.push(wrap(x)); return a; }
    const o = V.mkO(); for (const k of Object.keys(v)) o[k] = wrap(v[k]); return o;
  }
  const handler = {
    /* A read-only, non-configurable property must come back as itself (a Proxy invariant). */
    get(t, k){ const d = Object.getOwnPropertyDescriptor(t, k); const v = Reflect.get(t, k, t); return d && 'value' in d && !d.configurable && !d.writable ? v : wrap(v); },
    set(t, k, val){ return Reflect.set(t, k, toMain(val), t); },
    apply(t, thisArg, args){ return wrap(Reflect.apply(t, p2t.has(thisArg) ? p2t.get(thisArg) : thisArg, args.map(toMain))); },
    construct(t, args){ return wrap(Reflect.construct(t, args.map(toMain))); },
  };
  function wrap(v){
    if (v === null || (typeof v !== 'object' && typeof v !== 'function')) return v;
    if (p2t.has(v)) return v;
    if (t2p.has(v)) return t2p.get(v);
    if (fnOut.has(v)) return fnOut.get(v);
    if (siteMade(v)) return v;
    if (v instanceof Promise) return v.then(wrap);
    if (v instanceof Error) return v;
    if (typeof v === 'object' && (Array.isArray(v) || plainOf(v))) return toVmData(v);
    const p = new Proxy(v, handler);
    t2p.set(v, p); p2t.set(p, v);
    return p;
  }
  return { toMain, wrap, unwrap: v => (p2t.has(v) ? p2t.get(v) : v) };
}

/* ─────────────────────────── the site's files ─────────────────────────── */
const SCRIPTS = new Map();
export async function siteFiles(site){
  const { siteParts } = await import(pathToFileURL(join(site, 'tools', 'site-src.mjs')).href);
  const mods = readdirSync(site).filter(f => /^module-\d+\.js$/.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  return ['firebase-config.js', 'config-main.js', 'class-activities.js', 'i18n.js', 'guitar-diagrams.js', ...mods, ...siteParts('app.js', site),
    'practice-minutes-config.js', 'practice-minutes.js', 'fab-tools.js', 'tuner.js', 'live-quiz.js',
    ...(existsSync(join(site, 'live-quiz-teacher.js')) ? ['live-quiz-teacher.js'] : [])].filter(f => existsSync(join(site, f)));
}
/* A plant: { file: 'app/boot.js', from: '...', to: '...' } (each `from` must be found exactly once). */
export function plantedText(site, file, plants){
  let src = readFileSync(join(site, file), 'utf8');
  for (const p of plants || []){
    if (p.file !== file) continue;
    const n = src.split(p.from).length - 1;
    if (n !== 1) throw Object.assign(new Error(`plant "${p.name}": the text to change is found ${n} times in ${file} (must be 1): ${p.from.slice(0, 70)}`), { plantMiss: true });
    src = src.replace(p.from, () => p.to);
  }
  return src;
}
function script(site, file, plants){
  const key = site + '|' + file + '|' + JSON.stringify((plants || []).filter(p => p.file === file));
  if (!SCRIPTS.has(key)) SCRIPTS.set(key, new vm.Script(plantedText(site, file, plants), { filename: file }));
  return SCRIPTS.get(key);
}
/* The ids the site makes itself (an element whose .id it sets, then appends): absent until appended. */
let DYN_IDS = null;
async function dynamicIds(site){
  if (DYN_IDS) return DYN_IDS;
  const { siteParts } = await import(pathToFileURL(join(site, 'tools', 'site-src.mjs')).href);
  const ids = new Set();
  for (const f of siteParts('app.js', site)){
    const src = readFileSync(join(site, f), 'utf8');
    for (const m of src.matchAll(/\.id\s*=\s*'([A-Za-z][\w-]*)'/g)) ids.add(m[1]);
  }
  DYN_IDS = ids;
  return ids;
}

/* ─────────────────────────── a world: devices and pages ─────────────────────────── */
export async function makeWorld(a, sdk, opts = {}){
  const files = await siteFiles(a.site);
  const dyn = await dynamicIds(a.site);
  const world = { a, sdk, files, dyn, pages: [], appN: 0, faults: [], log: [], verbose: !!opts.verbose, plants: opts.plants || [], siteConfigs: [], liveAuth: new Set(), gates: [], raws: [] };
  world.say = s => { world.log.push(s); if (world.verbose) console.log('      · ' + s); };
  CURRENT = world;
  return world;
}
/* A rejection nobody handled, or an exception thrown out of a site callback the SDK called: noted against the
   world now running (printed by the tools), never a crash of the run. A closed page's SDK, and an offline read
   nobody waited for, are not faults. */
let CURRENT = null;
const quiet = /terminated|has been deleted|app-deleted|client is offline/i;
process.on('unhandledRejection', r => {
  const s = r && r.stack ? r.stack.split('\n').slice(0, 2).join(' | ') : String(r);
  if (!quiet.test(s) && CURRENT) CURRENT.faults.push('unhandled rejection: ' + s.slice(0, 200));
});
process.on('uncaughtException', e => {
  const s = e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e);
  if (CURRENT) CURRENT.faults.push('uncaught exception: ' + s.slice(0, 240));
  else { console.log('emu-site: uncaught exception: ' + s); process.exit(2); }
});
/* A device's line to the Firestore emulator: a TCP relay the tool can cut (the Wi-Fi drops: open connections die,
   new ones are refused at once, as a browser with no network sees) and mend. The Auth emulator is reached directly
   (a token lasts an hour; no case outlives one). */
export async function netGate(target){
  const [th, tp] = target.split(':');
  const socks = new Set();
  let open = true;
  const server = net.createServer(c => {
    if (!open){ c.destroy(); return; }
    const u = net.connect(Number(tp), th);
    socks.add(c); socks.add(u);
    const end = () => { c.destroy(); u.destroy(); socks.delete(c); socks.delete(u); };
    c.on('error', end); u.on('error', end); c.on('close', end); u.on('close', end);
    c.pipe(u); u.pipe(c);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  return {
    port: server.address().port,
    cut(){ open = false; for (const s of socks) s.destroy(); socks.clear(); },
    mend(){ open = true; },
    close(){ open = false; for (const s of socks) s.destroy(); socks.clear(); server.close(); },
  };
}
export async function makeDevice(world, name){
  const d = { name, store: {}, online: true, pages: [], raws: [] };
  d.gate = await netGate(world.a.fsHost);
  world.gates.push(d.gate);
  d.localStorage = {
    getItem: k => (Object.prototype.hasOwnProperty.call(d.store, String(k)) ? d.store[String(k)] : null),
    setItem: (k, v) => { d.store[String(k)] = String(v); },
    removeItem: k => { delete d.store[String(k)]; },
    clear: () => { d.store = {}; },
    key: i => Object.keys(d.store)[i] ?? null,
    get length(){ return Object.keys(d.store).length; },
  };
  return d;
}

/* One load of index.html (or index.html?teacher=true) in a tab of `device`. */
export function makePage(world, device, opts = {}){
  const { fb } = world.sdk, a = world.a;
  const page = { id: `${device.name}#${device.pages.length + 1}${opts.teacher ? '(console)' : ''}`, device, alive: true, timers: new Set(), saveMsgs: [], notices: [], els: {}, docL: {}, winL: {}, reloadAsked: false, faults: [], warns: [] };
  device.pages.push(page); world.pages.push(page);
  const guard = (fn, where) => { if (!page.alive) return undefined; try { return fn(); } catch (e){ page.faults.push((where || 'timer') + ': ' + (e && e.stack ? e.stack.split('\n').slice(0, 2).join(' | ') : String(e))); return undefined; } };
  /* The stub DOM. */
  const mkEl = (id, tag) => {
    const e = {
      id: id || '', tagName: (tag || 'div').toUpperCase(), style: { setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; }, cssText: '', display: '' }, dataset: {}, children: [], attrs: {}, listeners: {},
      classList: { _s: new Set(), add(...c){ c.forEach(x => this._s.add(x)); }, remove(...c){ c.forEach(x => this._s.delete(x)); }, toggle(c, f){ const on = f === undefined ? !this._s.has(c) : !!f; if (on) this._s.add(c); else this._s.delete(c); return on; }, contains(c){ return this._s.has(c); } },
      innerHTML: '', textContent: '', value: '', hidden: false, checked: false, disabled: false, isConnected: true, src: '', parentNode: null, className: '',
      addEventListener(t, f){ (e.listeners[t] = e.listeners[t] || []).push(f); }, removeEventListener(t, f){ e.listeners[t] = (e.listeners[t] || []).filter(x => x !== f); },
      appendChild(c){ if (c && typeof c === 'object'){ c.parentNode = e; e.children.push(c); if (c.id) page.els[c.id] = c; } return c; },
      append(...cs){ cs.forEach(c => e.appendChild(c)); }, prepend(c){ return e.appendChild(c); }, insertBefore(c){ return e.appendChild(c); }, removeChild(c){ e.children = e.children.filter(x => x !== c); return c; },
      remove(){ e.removed = true; if (e.id && page.els[e.id] === e && world.dyn.has(e.id)) delete page.els[e.id]; if (e.parentNode) e.parentNode.children = e.parentNode.children.filter(x => x !== e); },
      setAttribute(k, v){ e.attrs[k] = String(v); if (k === 'data-i18n' && e.__saveInd) page.saveMsgs.push({ at: Date.now(), key: String(v) }); },
      getAttribute(k){ return Object.prototype.hasOwnProperty.call(e.attrs, k) ? e.attrs[k] : null; },
      removeAttribute(k){ delete e.attrs[k]; if (k === 'data-i18n' && e.__saveInd) page.saveMsgs.push({ at: Date.now(), key: '' }); },
      hasAttribute(k){ return Object.prototype.hasOwnProperty.call(e.attrs, k); }, toggleAttribute(){},
      querySelector(sel){ return found(e, sel); }, querySelectorAll(){ return []; }, closest(){ return null; }, matches(){ return false; },
      focus(){}, blur(){}, click(){}, scrollIntoView(){}, scrollTo(){}, insertAdjacentHTML(){}, insertAdjacentElement(){},
      cloneNode(){ return mkEl('', tag); }, contains(){ return false; }, play(){ return Promise.resolve(); }, pause(){}, load(){},
      getBoundingClientRect(){ return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; },
    };
    /* innerHTML as a property that forgets what querySelector found in the old text. */
    let html = '';
    Object.defineProperty(e, 'innerHTML', { get: () => html, set: v => { html = String(v); e.q = null; }, enumerable: true });
    return e;
  };
  /* element.querySelector: an element the site drew into this element's innerHTML is found, and it is the same stub
     on every call until the innerHTML changes. Only one compound selector (tag, #id, .class, [attr], [attr="v"]); a
     selector with a space, >, or : finds nothing, as before. GitHub run 45885160639 (2026-11-26): with every
     querySelector answering null, the console's split view (renderTeacherActivityDetail, teacher-activities-2.js)
     drew [data-ta-detail] and then never found it, so it drew the split again, a promise round with no timer,
     forever: the whole tool stopped. */
  const found = (e, sel) => {
    const s = String(sel || '');
    if (!/^[\w-]*(?:#[\w-]+|\.[\w-]+|\[[\w-]+(?:="[^"]*")?\])*$/.test(s) || !s) return null;
    e.q = e.q || new Map();
    if (e.q.has(s)) return e.q.get(s);
    const tagWant = (/^[\w-]+/.exec(s) || [])[0], parts = [...s.matchAll(/#([\w-]+)|\.([\w-]+)|\[([\w-]+)(?:="([^"]*)")?\]/g)];
    let hit = null;
    for (const m of e.innerHTML.matchAll(/<([a-zA-Z][\w-]*)((?:\s+[\w:-]+(?:="[^"]*"|='[^']*')?)*)\s*\/?>/g)){
      const attrs = {};
      for (const a of m[2].matchAll(/([\w:-]+)(?:="([^"]*)"|='([^']*)')?/g)) attrs[a[1]] = a[2] !== undefined ? a[2] : (a[3] !== undefined ? a[3] : '');
      if (tagWant && m[1].toLowerCase() !== tagWant.toLowerCase()) continue;
      const cls = String(attrs.class || '').split(/\s+/);
      if (parts.every(p => (p[1] ? attrs.id === p[1] : p[2] ? cls.includes(p[2]) : p[3] in attrs && (p[4] === undefined || attrs[p[3]] === p[4])))){ hit = { tag: m[1], attrs }; break; }
    }
    let el = null;
    if (hit){
      el = hit.attrs.id && page.els[hit.attrs.id] ? page.els[hit.attrs.id] : mkEl(hit.attrs.id || '', hit.tag);
      el.parentNode = e; el.className = hit.attrs.class || '';
      String(hit.attrs.class || '').split(/\s+/).filter(Boolean).forEach(c => el.classList.add(c));
      for (const [k, v] of Object.entries(hit.attrs)){
        if (k.startsWith('data-')) el.dataset[k.slice(5).replace(/-([a-z])/g, (_, c) => c.toUpperCase())] = v;
        if (k !== 'class' && k !== 'id') el.attrs[k] = v;
      }
      if (hit.attrs.id) page.els[hit.attrs.id] = el;
    }
    e.q.set(s, el);
    return el;
  };
  const saveInd = mkEl('save-ind'); saveInd.__saveInd = true;
  const body = mkEl('body', 'body');
  const bodyAppend = body.appendChild;
  body.appendChild = c => {
    bodyAppend(c);
    if (c && typeof c === 'object' && /^(unsaved-notice|reset-notice|load-notice)$/.test(c.id || '')) page.notices.push({ at: Date.now(), id: c.id, key: c.children[0] && c.children[0].attrs ? c.children[0].attrs['data-i18n'] : '' });
    return c;
  };
  const head = mkEl('head', 'head');
  /* The Firebase namespace the site sees (the compat global). */
  let app = null, fsRaw = null, authRaw = null;
  const M = { ref: null };
  const firestoreFn = () => {
    if (!fsRaw){
      fsRaw = app.firestore();
      fsRaw.useEmulator('127.0.0.1', device.gate.port);
      if (opts.onFirestore) opts.onFirestore(fsRaw, page);
    }
    return M.ref.wrap(fsRaw);
  };
  const ns = {
    initializeApp(cfg){
      world.siteConfigs.push(cfg && cfg.projectId);
      app = fb.initializeApp({ apiKey: 'demo-key', authDomain: `${a.project}.firebaseapp.com`, projectId: a.project, appId: '1:1:web:demo' }, 'p' + (++world.appN));
      if (app.options.projectId !== a.project || !/^demo-/.test(app.options.projectId)) throw new Error('the wall: an app outside the demo project');
      authRaw = app.auth();
      authRaw.useEmulator('http://' + a.authHost, { disableWarnings: true });
      world.liveAuth.add(authRaw);
      return M.ref.wrap(app);
    },
    auth: null, firestore: undefined, apps: [],
  };
  ns.auth = Object.assign(() => M.ref.wrap(authRaw), { GoogleAuthProvider: null });
  const fsNamespace = Object.assign(firestoreFn, { FieldValue: null, FieldPath: null, Timestamp: null });
  head.appendChild = s => {
    const src = (s && s.src) || '';
    if (/firebase-firestore-compat\.js$/.test(src)){
      const h = setTimeout(() => { page.timers.delete(h); if (!page.alive) return; ns.firestore = fsNamespace; guard(() => s.onload && s.onload(), 'firestore onload'); }, 20);
      page.timers.add(h);
    } else if (/\.js$/.test(src) && !/^https?:/.test(src)){
      const f = src.replace(/^\.\//, '');
      const h = setTimeout(() => {
        page.timers.delete(h); if (!page.alive) return;
        /* A file the page already ran (every module-N.js runs at load, as in the other page tools) only fires onload. */
        if (page.loaded.has(f)){ guard(() => s.onload && s.onload(), f + ' onload'); return; }
        page.loaded.add(f);
        try { script(a.site, f, world.plants).runInContext(ctx); guard(() => s.onload && s.onload(), f + ' onload'); }
        catch (e){ page.faults.push(`${f} failed to load: ${e.message}`); guard(() => s.onerror && s.onerror(), f + ' onerror'); }
      }, 5);
      page.timers.add(h);
    } else {
      const h = setTimeout(() => { page.timers.delete(h); guard(() => s.onerror && s.onerror(), 'script onerror'); }, 5);
      page.timers.add(h);
    }
    return s;
  };
  const tset = (fn, ms, args, every) => {
    const run = () => guard(() => (typeof fn === 'function' ? fn(...args) : undefined), 'timer');
    const h = every ? setInterval(run, Math.max(10, Number(ms) || 0)) : setTimeout(() => { page.timers.delete(h); run(); }, Math.max(0, Number(ms) || 0));
    page.timers.add(h); return h;
  };
  const tclear = h => { if (h != null){ clearTimeout(h); clearInterval(h); page.timers.delete(h); } };
  const audioNode = () => new Proxy(function(){}, { get(t, k){ if (k === 'then' || typeof k === 'symbol') return undefined; if (k === 'connect') return () => audioNode(); return audioNode(); }, apply(){ return audioNode(); }, set(){ return true; } });
  class FakeAudioContext { constructor(){ this.state = 'running'; this.sampleRate = 48000; this.currentTime = 0; this.destination = audioNode(); } resume(){ return Promise.resolve(); } suspend(){ return Promise.resolve(); } close(){ return Promise.resolve(); } createBuffer(){ return audioNode(); } decodeAudioData(){ return Promise.resolve(audioNode()); } createBufferSource(){ return audioNode(); } createGain(){ return audioNode(); } createOscillator(){ return audioNode(); } createBiquadFilter(){ return audioNode(); } createAnalyser(){ return audioNode(); } createDynamicsCompressor(){ return audioNode(); } createStereoPanner(){ return audioNode(); } createConstantSource(){ return audioNode(); } createDelay(){ return audioNode(); } }
  const search = opts.teacher ? '?teacher=true' : '';
  const ctx = {
    console: { log(){}, info(){}, debug(){}, warn: (...x) => page.warns.push(x.map(v => v && v.message ? v.message : String(v)).join(' ').slice(0, 200)), error: (...x) => page.warns.push('error: ' + x.map(v => v && v.message ? v.message : String(v)).join(' ').slice(0, 200)) },
    document: {
      documentElement: mkEl('html', 'html'), head, body, readyState: 'complete', referrer: '', title: '',
      getElementById(id){ if (page.els[id]) return page.els[id]; if (world.dyn.has(id)) return null; return (page.els[id] = mkEl(id)); },
      querySelector(sel){ return sel === '.wrap, main, body' ? body : null; },
      querySelectorAll(sel){ return sel === '.save-ind' ? [saveInd] : []; },
      createElement(tag){ return mkEl('', tag); }, createDocumentFragment(){ return mkEl('', 'fragment'); }, createTextNode(){ return mkEl('', 'text'); },
      addEventListener(t, f){ (page.docL[t] = page.docL[t] || []).push(f); }, removeEventListener(t, f){ page.docL[t] = (page.docL[t] || []).filter(x => x !== f); },
      fonts: { ready: Promise.resolve() }, activeElement: null, hasFocus(){ return true; }, hidden: false, visibilityState: 'visible',
    },
    localStorage: device.localStorage,
    sessionStorage: (() => { const s = {}; return { getItem: k => (k in s ? s[k] : null), setItem: (k, v) => { s[k] = String(v); }, removeItem: k => { delete s[k]; }, clear: () => { for (const k of Object.keys(s)) delete s[k]; }, key: i => Object.keys(s)[i] ?? null, get length(){ return Object.keys(s).length; } }; })(),
    location: { hostname: 'class.example.test', protocol: 'https:', host: 'class.example.test', origin: 'https://class.example.test', href: 'https://class.example.test/' + search, pathname: '/', search, hash: '', reload(){ page.reloadAsked = true; }, assign(){}, replace(){} },
    history: { scrollRestoration: 'auto', replaceState(){}, pushState(){}, back(){}, length: 1 },
    navigator: { userAgent: 'emu-site', language: 'en', get onLine(){ return device.online; }, clipboard: { writeText: () => Promise.resolve() } },
    setTimeout: (fn, ms, ...args) => tset(fn, ms, args, false), clearTimeout: tclear,
    setInterval: (fn, ms, ...args) => tset(fn, ms, args, true), clearInterval: tclear,
    requestAnimationFrame: () => 0, cancelAnimationFrame(){}, requestIdleCallback: fn => tset(fn, 50, [{ timeRemaining: () => 10, didTimeout: false }], false), cancelIdleCallback: tclear,
    matchMedia: () => ({ matches: false, addEventListener(){}, removeEventListener(){}, addListener(){}, removeListener(){} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    fetch: () => Promise.reject(new Error('no network on an emu-site page')),
    alert(){}, confirm(){ return true; }, prompt(){ return null; }, open(){ return null; },
    CustomEvent: class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } }, Event: class { constructor(t){ this.type = t; } },
    Image: class {}, Audio: class { constructor(){ this.paused = true; this.currentTime = 0; } play(){ this.paused = false; return Promise.resolve(); } pause(){ this.paused = true; } load(){} addEventListener(){} removeEventListener(){} },
    HTMLMediaElement: class {}, AudioContext: FakeAudioContext, webkitAudioContext: FakeAudioContext, OfflineAudioContext: FakeAudioContext,
    MediaRecorder: class { static isTypeSupported(){ return true; } },
    ResizeObserver: class { observe(){} unobserve(){} disconnect(){} }, IntersectionObserver: class { observe(){} unobserve(){} disconnect(){} }, MutationObserver: class { observe(){} disconnect(){} },
    performance: { now: () => performance.now(), getEntriesByType: () => [] },
    URLSearchParams, URL, TextEncoder, TextDecoder, Blob: class {}, FileReader: class {}, crypto: globalThis.crypto, structuredClone,
    CSS: { escape: v => String(v).replace(/[^a-zA-Z0-9_-]/g, c => '\\' + c), supports: () => false },
    addEventListener(t, f){ (page.winL[t] = page.winL[t] || []).push(f); }, removeEventListener(t, f){ page.winL[t] = (page.winL[t] || []).filter(x => x !== f); }, dispatchEvent(){ return true; },
    scrollTo(){}, scrollBy(){}, innerWidth: 1366, innerHeight: 657, devicePixelRatio: 1, screen: { width: 1366, height: 768 },
    firebase: ns,
  };
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  M.ref = membrane(ctx);
  ns.auth.GoogleAuthProvider = M.ref.wrap(fb.auth.GoogleAuthProvider);
  fsNamespace.FieldValue = M.ref.wrap(fb.firestore.FieldValue);
  fsNamespace.FieldPath = M.ref.wrap(fb.firestore.FieldPath);
  fsNamespace.Timestamp = M.ref.wrap(fb.firestore.Timestamp);
  page.ctx = ctx;
  page.run = code => vm.runInContext(code, ctx, { timeout: 10000 });
  page.fs = () => fsRaw;
  page.auth = () => authRaw;
  page.app = () => app;
  page.loaded = new Set(world.files);
  for (const f of world.files){
    try { script(a.site, f, world.plants).runInContext(ctx, { timeout: 10000 }); }
    catch (e){ if (e.plantMiss) throw e; page.faults.push(`${f} threw while loading: ${e && e.message}`); }
  }
  /* What the page shows now: 'access' | 'paused' | 'app' | 'console' | null (still signing in). */
  page.screen = () => {
    try {
      if (page.run('typeof accessLocked !== "undefined" && accessLocked')) return 'access';
      const ps = page.els['paused-screen'];
      if (ps && ps.style.display === 'block') return 'paused';
      if (page.els['app'] && page.els['app'].style.display === 'block') return 'app';
      if (page.els['teacher-app'] && page.els['teacher-app'].style.display === 'block') return 'console';
    } catch { /* a page the tool closed */ }
    return null;
  };
  page.saveKey = () => (page.saveMsgs.length ? page.saveMsgs[page.saveMsgs.length - 1].key : '');
  page.fire = (target, type, ev) => { for (const f of ((target === 'doc' ? page.docL : page.winL)[type] || []).slice()) guard(() => f(ev || { type }), type); };
  page.click = (elId, dataset) => {
    const el = page.els[elId];
    if (!el || !(el.listeners.click || []).length) return false;
    const target = { dataset, closest: sel => (sel.startsWith('[data-') ? { dataset } : null) };
    for (const f of el.listeners.click) guard(() => f({ target }), 'click ' + elId);
    return true;
  };
  /* Close the tab: pagehide (unless opts.silent: the battery died), then the SDK instance goes, unsent writes with it. */
  page.close = async (how = 'close') => {
    if (!page.alive) return;
    if (how === 'close'){ ctx.document.hidden = true; ctx.document.visibilityState = 'hidden'; page.fire('doc', 'visibilitychange'); page.fire('win', 'pagehide'); }
    page.alive = false;
    for (const h of page.timers){ clearTimeout(h); clearInterval(h); }
    page.timers.clear();
    if (authRaw) world.liveAuth.delete(authRaw);
    if (app) await endApp(app);
  };
  return page;
}

/* The SDK alone, no site code: one app signed in as `acct` on `device`'s line (for checks of the SDK itself). */
export async function rawClient(world, device, acct){
  const { fb } = world.sdk, a = world.a;
  const app = fb.initializeApp({ apiKey: 'demo-key', authDomain: `${a.project}.firebaseapp.com`, projectId: a.project, appId: '1:1:web:demo' }, 'raw' + (++world.appN));
  if (!/^demo-/.test(app.options.projectId)) throw new Error('the wall: an app outside the demo project');
  const auth = app.auth();
  auth.useEmulator('http://' + a.authHost, { disableWarnings: true });
  const db = app.firestore();
  db.useEmulator('127.0.0.1', device.gate.port);
  const cred = fb.auth.GoogleAuthProvider.credential(JSON.stringify({ sub: acct.sub, email: acct.email, email_verified: acct.verified !== false, name: acct.name || '' }));
  const u = (await bounded(auth.signInWithCredential(cred), 15000, 'an SDK sign-in at the Auth emulator')).user;
  const c = { app, auth, db, uid: u.uid, FV: fb.firestore.FieldValue, alive: true, close: async () => { if (!c.alive) return; c.alive = false; await endApp(app); } };
  world.raws.push(c); device.raws.push(c);
  return c;
}
/* ─────────────────────────── the case runner ───────────────────────────
   GitHub run 45870814442 (2026-11-26) printed nothing for 24 minutes and was cancelled: the step kept each tool's
   output in a file, and nothing bounded a slow or stuck step. Now: one line as each case starts (▶) and ends (■),
   printed even in the quiet planted-fault runs; every await on the SDK inside a case is a step() with its own limit;
   a case past its limit fails with its name ("HUNG at <step>") and the run goes on; the whole run has a deadline
   (watchdog) after which it prints "HUNG at <case>" and exits 3. */
export const RUN = { current: '(starting)', t0: Date.now() };
export function bounded(p, ms, what){
  let timer;
  const gate = new Promise((_, rej) => { timer = setTimeout(() => rej(Object.assign(new Error(`${what} did not finish in ${ms / 1000} s`), { hung: true, step: what, limit: ms / 1000 })), ms); });
  return Promise.race([Promise.resolve(p), gate]).finally(() => clearTimeout(timer));
}
export function makeRunner(opts = {}){
  const R = { pass: 0, fail: 0, red: [], quiet: !!opts.quiet, prefix: opts.prefix || '', caseMs: opts.caseMs || 40000 };
  const el = () => ((Date.now() - RUN.t0) / 1000).toFixed(1).padStart(6) + ' s';
  R.out = s => { if (!R.quiet) console.log(s); };
  R.note = s => R.out('  ~ ' + s);
  R.check = (name, ok, why) => {
    if (ok) R.pass++; else { R.fail++; R.red.push(name); }
    if (RUN.beat) RUN.beat();
    if (!R.quiet){ if (!ok && why) console.log('      ' + String(why).slice(0, 320)); console.log((ok ? '  ✓ ' : '  ✗ ') + name); }
    return ok;
  };
  R.case = async (name, fn, ms = R.caseMs) => {
    RUN.current = R.prefix + name;
    if (RUN.beat) RUN.beat();
    console.log(`  ▶ ${el()}  ${R.prefix}${name}`);
    const t = Date.now();
    const seen = faultMark();
    let res;
    try { res = await bounded(Promise.resolve().then(fn), ms, name); }
    catch (e){
      if (e && e.hung) R.check(`${name}: HUNG at ${e.step === name ? 'the case itself' : e.step} (limit ${e.limit} s)`, false, 'a step never settled; the case was abandoned and the run went on');
      else if (e && e.skipped) R.check(`${name}: not run`, false, e.message);
      else R.check(`${name}: the tool threw`, false, e && e.stack ? e.stack.split('\n').slice(0, 3).join(' | ') : String(e));
    }
    /* A site error during the case (an exception in a site callback, a rejection nobody handled, a script that did
       not load) turns it red: a clean run has none (review R1-2, 2026-11-26). */
    const fresh = faultsSince(seen);
    if (fresh.length) R.check(`${name}: no page fault or unhandled rejection`, false, `${fresh.length}: ${fresh.slice(0, 2).join(' / ')}`);
    console.log(`  ■ ${el()}  ${R.prefix}${name} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
    return res;
  };
  return R;
}
/* The faults the world now running has collected (its own: unhandled rejections and exceptions out of site callbacks;
   each page's: a timer, a listener or a script that threw), marked so a case can take only those that came during it. */
function faultMark(){
  const w = CURRENT;
  return { w, n: w ? w.faults.length : 0, pages: new Map(w ? w.pages.map(p => [p, p.faults.length]) : []) };
}
function faultsSince(m){
  if (!m.w) return [];
  return [...m.w.faults.slice(m.n), ...m.w.pages.flatMap(p => p.faults.slice(m.pages.get(p) || 0).map(f => p.id + ': ' + f))];
}
/* One await on the SDK or an emulator inside a case, with its own limit and name. */
export const step = (p, what, ms = 15000) => bounded(p, ms, what);
/* The deadline, kept by a WORKER THREAD (GitHub run 45885160639, 2026-11-26: signin-loop went silent for 9.5
   minutes and neither its case limit nor its deadline fired, so this thread's own event loop was blocked: a timer
   here never runs then). This thread writes a heartbeat, the case it is in and its counts into shared memory once a
   second; the worker reads them. When the run passes `seconds`, or no heartbeat came for `stall` seconds (a blocked
   loop: a synchronous loop, or promises that never yield), the worker pauses this thread through its own inspector
   port (127.0.0.1, a free port, opened here; a pause interrupts running code), prints where it was stuck and the
   HUNG line, and ends the process with exit 3 (a SIGKILL if that does not take within 5 s). Awaited: the worker
   must be running before anything can block. */
export async function watchdog(tool, seconds, tally, stall = 30){
  const { Worker } = await import('node:worker_threads');
  const inspector = (await import('node:inspector')).default;
  if (!inspector.url()) inspector.open(0, '127.0.0.1', false);
  const sab = new SharedArrayBuffer(4 * 4 + 1024);
  const nums = new Int32Array(sab, 0, 4), name = new Uint8Array(sab, 16);
  const enc = new TextEncoder();
  const beat = () => {
    let t = { pass: 0, fail: 0 };
    try { t = tally(); } catch { /* keep the last counts */ }
    Atomics.store(nums, 0, Math.floor((Date.now() - RUN.t0) / 1000));
    Atomics.store(nums, 1, t.pass); Atomics.store(nums, 2, t.fail);
    const b = enc.encode(String(RUN.current)).slice(0, name.length - 1);
    name.fill(0); name.set(b);
    Atomics.store(nums, 3, b.length);
  };
  beat();
  /* The runner calls it too, as each case starts and at each check: a loop blocked right after would otherwise be
     reported under the case before. */
  RUN.beat = beat;
  const w = new Worker(WATCHDOG_WORKER, { eval: true, workerData: { tool, seconds, stall, sab, url: inspector.url(), t0: RUN.t0 } });
  await new Promise((res, rej) => { w.once('online', res); w.once('error', rej); });
  w.unref();
  setInterval(beat, 1000).unref();
}
const WATCHDOG_WORKER = String.raw`
const { workerData: D } = require('node:worker_threads');
const fs = require('node:fs');
const nums = new Int32Array(D.sab, 0, 4), name = new Uint8Array(D.sab, 16);
const out = s => { try { fs.writeSync(1, s + '\n'); } catch {} };
let fired = false;
const tick = setInterval(() => {
  if (fired) return;
  const now = Math.floor((Date.now() - D.t0) / 1000), last = Atomics.load(nums, 0);
  const why = now >= D.seconds ? 'the run passed its ' + D.seconds + ' s deadline'
    : now - last >= D.stall ? 'nothing else could run for ' + (now - last) + ' s: the event loop was blocked' : '';
  if (!why) return;
  fired = true;
  const at = Buffer.from(name.slice(0, Atomics.load(nums, 3))).toString('utf8');
  const line = where => '\n✗ ' + D.tool + ': HUNG at "' + at + '" (' + why + (where ? '; stuck in ' + where : '') + '): ' + Atomics.load(nums, 1) + ' passed, ' + (Atomics.load(nums, 2) + 1) + ' failed';
  const bye = () => { out(line('')); setTimeout(() => process.kill(process.pid, 'SIGKILL'), 5000); };
  let ws;
  try { ws = new WebSocket(D.url); } catch (e){ out('      (no stack: ' + e.message + ')'); return bye(); }
  const urls = {};
  let id = 0, done = false;
  const send = (method, params) => ws.send(JSON.stringify({ id: ++id, method, params: params || {} }));
  const fallback = setTimeout(() => { if (!done){ done = true; out('      (no stack: the pause did not answer in 15 s)'); bye(); } }, 15000);
  /* Three samples 300 ms apart, each with its async callers: a loop of promises shows its whole round. */
  const samples = [];
  const where = f => (f.functionName || '(anonymous)') + ' ' + String(urls[f.scriptId || (f.location && f.location.scriptId)] || f.url || '?').replace(/^file:\/\/.*\//, '') + ':' + (((f.location ? f.location.lineNumber : f.lineNumber) || 0) + 1);
  ws.onopen = () => { send('Debugger.enable'); send('Debugger.setAsyncCallStackDepth', { maxDepth: 16 }); setTimeout(() => send('Debugger.pause'), 300); };
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.method === 'Debugger.scriptParsed') urls[m.params.scriptId] = m.params.url;
    if (m.method !== 'Debugger.paused' || done) return;
    const fr = m.params.callFrames.slice(0, 10).map(where);
    for (let a = m.params.asyncStackTrace, k = 0; a && k < 4; a = a.parent, k++) fr.push('[' + (a.description || 'async') + '] ' + (a.callFrames || []).slice(0, 4).map(where).join(' < '));
    samples.push(fr);
    if (samples.length < 3){ send('Debugger.resume'); setTimeout(() => send('Debugger.pause'), 300); return; }
    done = true; clearTimeout(fallback);
    samples.forEach((f, k) => out('      stuck in (sample ' + (k + 1) + ' of 3): ' + f.join(' < ')));
    out(line(samples[0].slice(0, 3).join(' < ')));
    send('Runtime.evaluate', { expression: 'process.exit(3)' });
    setTimeout(() => process.kill(process.pid, 'SIGKILL'), 5000);
  };
}, 1000);
`;
/* Before any case: the SDK must reach BOTH emulators (a sign-in, then a server read through a device relay), each
   within 15 s. '' = fine; otherwise what failed, and the tool stops (exit 2) instead of running every case into
   its limit. */
export async function preflight(world){
  const dev = await makeDevice(world, 'PREFLIGHT');
  const t = Date.now();
  let c;
  try { c = await bounded(rawClient(world, dev, { sub: 'preflight', email: 'test-preflight@seq.org', verified: true, name: 'Test P' }), 15000, 'a sign-in at the Auth emulator'); }
  catch (e){ return `the SDK could not sign in at the Auth emulator ${world.a.authHost}: ${e.code || e.message}`; }
  try { await bounded(c.db.doc('config/class').get({ source: 'server' }), 15000, 'a server read'); }
  catch (e){ return `the SDK could not read from the Firestore emulator at ${world.a.fsHost} through this tool's relay (127.0.0.1:${dev.gate.port}): ${e.code || e.message}`; }
  finally { if (c) await c.close(); }
  console.log(`   preflight: the SDK signed in at ${world.a.authHost} and read from ${world.a.fsHost} in ${Date.now() - t} ms`);
  return '';
}
/* An app's end (a closed tab): its unsent writes go with it. Never waited on for more than 5 s. */
async function endApp(app){ try { await Promise.race([app.delete(), sleep(5000)]); } catch { /* already gone */ } }
/* Sign a page in as `acct` ({ sub, email, verified, name }) through its own Auth, as the popup would. */
export async function signInPage(world, page, acct){
  const { fb } = world.sdk;
  const cred = fb.auth.GoogleAuthProvider.credential(JSON.stringify({ sub: acct.sub, email: acct.email, email_verified: acct.verified !== false, name: acct.name || '' }));
  const r = await bounded(page.auth().signInWithCredential(cred), 15000, 'the page signing in at the Auth emulator');
  return r.user;
}
/* Wait until the site's sign-in callback has decided a screen. */
export async function waitScreen(page, ms = 20000){
  const t0 = Date.now();
  while (Date.now() - t0 < ms){
    const s = page.screen();
    let pending = true;
    try { pending = page.run('!!window.__authBootPending'); } catch { pending = false; }
    if (s && !pending) return s;
    await sleep(25);
  }
  return null;
}
export const sleep = ms => new Promise(r => setTimeout(r, ms));
export async function until(fn, ms = 15000, step = 25){
  const t0 = Date.now();
  while (Date.now() - t0 < ms){ let v; try { v = await fn(); } catch { v = false; } if (v) return v; await sleep(step); }
  return false;
}
/* Every save this page queued has settled (landed, or failed and parked): no dirty key and no write on the wire. */
export async function waitSaved(page, ms = 15000){
  await sleep(900);
  return until(() => page.run('_dirtyKeys.size === 0 && !_flushP'), ms);
}
export async function closeAll(world){ await Promise.all(world.pages.filter(p => p.alive).map(p => p.close('silent'))); await Promise.all(world.raws.map(c => c.close())); for (const g of world.gates) g.close(); }
/* The device's Wi-Fi: the relay is cut or mended, every open page hears 'offline' / 'online', and its SDK restarts
   its network the way the browser SDK's connectivity monitor does on either event (restartNetwork: disable, then
   enable), so a reconnect is not left to the stream's back-off. */
export async function setOnline(device, on){
  device.online = on;
  if (on) device.gate.mend(); else device.gate.cut();
  for (const p of device.pages.filter(x => x.alive)){
    const fs = p.fs();
    if (fs){ try { await fs.disableNetwork(); await fs.enableNetwork(); } catch { /* a page closing */ } }
    p.fire('win', on ? 'online' : 'offline');
  }
  for (const c of device.raws.filter(x => x.alive)){ try { await c.db.disableNetwork(); await c.db.enableNetwork(); } catch { /* closing */ } }
}
