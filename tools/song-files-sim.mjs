#!/usr/bin/env node
/* Song files — the loader in app/songfiles.js, RUN in Node against a fake Firestore, a fake IndexedDB shared by
   "tabs", and a shared Web Locks stand-in (2026-11-14). checks.mjs 1dx runs it and pins the case count.

   What it proves (each case prints ✓/✗):
     public      a public path ('audio/…mp3') goes through songFileSrc / songFileNeedsLoad unchanged
     maths       the month id (UTC, at the edges of a month and a year); the cost (bytes × 4/3, rounded up)
     download    a 3-piece file whose pieces arrive OUT OF ORDER is put back together byte for byte; the month's
                 count rises by the cost, once; the device keeps a copy; a second ask in the page reads nothing
     device      a new page (same IndexedDB) plays from the copy with 0 reads and no count; offline too; a copy
                 whose SHA-256 is not the list's (re-exported) is downloaded again and replaced
     refusals    signed out (signin, nothing read); not on the list; not uploaded; still 'uploading'; the stored
                 file's SHA-256 or size not the list's (missing, nothing counted); a missing piece (missing); a
                 piece of the wrong length (bad); one wrong byte (bad); the rules refuse (denied); offline with no
                 copy (offline, nothing read) — and in every one, no copy kept and no address given
     full        a full device (QuotaExceededError): the song still plays this time, nothing kept, and the next
                 page downloads it again
     tabs        two tabs ask for the same song at once: one download, one count, both get it; two asks in one
                 page share one download and both see progress
     limit       the month's count plus the cost exactly at the limit: allowed; one byte over: limit, nothing
                 read, nothing counted
     wait        songFileWaitThen: the loading line rises to the % and clears, restart() runs once; a stop
                 (songFileCancelWait) during the load: no restart, line cleared; a second card's wait cancels
                 the first's; a failure shows its line (EN and ES keys exist for every code)
   --breaks  runs the cases against broken copies of app/songfiles.js; each must turn at least one case red.

   Made-up bytes only; nothing leaves the process. */
import { readFileSync } from 'node:fs';
import { createHash, randomBytes } from 'node:crypto';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = readFileSync(join(ROOT, 'app/songfiles.js'), 'utf8');
const I18N = readFileSync(join(ROOT, 'i18n.js'), 'utf8');
const sha = b => createHash('sha256').update(b).digest('hex');
const PIECE = 900000;
const tick = () => new Promise(r => setTimeout(r, 0));

/* ── fakes ── */
class FakeBytes { constructor(u8){ this.u8 = u8; } toUint8Array(){ return new Uint8Array(this.u8); } }
function makeFirestore(){
  const docs = new Map();                     // path -> data
  const st = { reads: 0, pieceReads: 0, writes: 0, deny: false, offline: false, order: [], dropAtPiece: -1, denyCount: false };
  const err = code => { const e = new Error(code); e.code = code; return e; };
  /* Pieces answer out of order, the same way every run: piece k waits [6, 1, 3][k % 3] ms, so 0, 1, 2 arrive 1, 2, 0. */
  const later = async path => { const m = /\/pieces\/(\d+)$/.exec(path); await new Promise(r => setTimeout(r, m ? [6, 1, 3][+m[1] % 3] : 0)); };
  const docRef = path => ({
    path,
    collection: name => collRef(path + '/' + name),
    async get(){
      st.reads++; if (/\/pieces\//.test(path)) { st.pieceReads++; }
      await later(path);
      if (st.offline) throw err('unavailable');
      if (st.deny) throw err('permission-denied');
      // The connection drops at one piece, once (navigator.onLine still says online).
      if (/\/pieces\//.test(path) && +path.split('/').pop() === st.dropAtPiece){ st.dropAtPiece = -1; throw err('unavailable'); }
      if (/\/pieces\//.test(path)) st.order.push(+path.split('/').pop());
      const d = docs.get(path);
      return { exists: !!d, id: path.split('/').pop(), data: () => d ? Object.assign({}, d) : undefined };
    },
    async set(data, opt){
      st.writes++;
      await later(path);
      if (st.offline) throw err('unavailable');
      if (st.deny || (st.denyCount && path.startsWith('songFilesUsage/'))) throw err('permission-denied');
      const old = (opt && opt.merge && docs.get(path)) || {};
      const out = Object.assign({}, opt && opt.merge ? old : {});
      for (const [k, v] of Object.entries(data)) out[k] = (v && v.__inc != null) ? (Number(old[k]) || 0) + v.__inc : v;
      docs.set(path, out);
    },
  });
  const collRef = path => ({ doc: id => docRef(path + '/' + id) });
  const db = { collection: name => collRef(name) };
  return { db, docs, st };
}
function putFile(fs, id, bytes, over){
  const n = Math.ceil(bytes.length / PIECE);
  fs.docs.set('songFiles/' + id, Object.assign({ file: id + '.mp3', bytes: bytes.length, sha256: sha(bytes), pieces: n, pieceBytes: PIECE, durationSec: 100, state: 'ready' }, over || {}));
  for (let k = 0; k < n; k++) fs.docs.set(`songFiles/${id}/pieces/${k}`, { i: k, data: new FakeBytes(bytes.subarray(k * PIECE, (k + 1) * PIECE)) });
}
/* A tiny IndexedDB: open / onupgradeneeded / transaction / objectStore get & put, async like the real one. */
function makeIdb(opts){
  const stores = new Map();                   // one 'files' store
  const st = { full: false, puts: 0 };
  const req = () => ({ onsuccess: null, onerror: null, onupgradeneeded: null, onblocked: null, result: undefined, error: null });
  const db = {
    objectStoreNames: { contains: () => true },
    createObjectStore(){ return {}; },
    transaction(name, mode){
      const tx = { oncomplete: null, onerror: null, onabort: null, error: null };
      let fail = null;
      const store = {
        get(key){ const r = req(); setTimeout(() => { r.result = stores.get(key); }, 0); return r; },
        put(rec){
          const r = req();
          st.puts++;
          if (st.full){ fail = Object.assign(new Error('QuotaExceededError'), { name: 'QuotaExceededError' }); }
          else setTimeout(() => stores.set(rec.id, rec), 0);
          return r;
        },
      };
      setTimeout(() => setTimeout(() => { if (fail){ tx.error = fail; tx.onabort && tx.onabort(); } else tx.oncomplete && tx.oncomplete(); }, 1), 0);
      tx.objectStore = () => store;
      return tx;
    },
  };
  const indexedDB = { open(){ const r = req();
    if (opts && opts.openHang) return r;                                  // never answers
    if (opts && opts.openError) { setTimeout(() => { r.error = new Error('blocked'); r.onerror && r.onerror(); }, 0); return r; }
    setTimeout(() => { r.result = db; if (!opts || !opts.noUpgrade) r.onupgradeneeded && r.onupgradeneeded(); r.onsuccess && r.onsuccess(); }, 0); return r; } };
  return { indexedDB, stores, st };
}
function makeLocks(){
  const q = new Map();
  const L = { hung: false, request(name, a, b){
    const fn = typeof a === 'function' ? a : b, opt = typeof a === 'function' ? {} : (a || {});
    if (L.hung) return new Promise((res, rej) => { const sg = opt.signal; if (!sg) return; const go = () => rej(Object.assign(new Error('lock wait timed out'), { name: 'TimeoutError' })); if (sg.aborted) go(); else sg.addEventListener('abort', go); });
    const prev = q.get(name) || Promise.resolve(); const run = prev.then(() => fn()); q.set(name, run.catch(() => {})); return run; } };
  return L;
}
/* An element just big enough for songFileShow: querySelector, appendChild, attributes, textContent. */
const LINE_LOG = [];                          // every text a line was given, in order
function makeEl(cls){
  let txt = '';
  const el = { className: cls || '', children: [], attrs: {}, get textContent(){ return txt; }, set textContent(v){ txt = v; if (v) LINE_LOG.push(v); }, isConnected: true, parentNode: null,
    setAttribute(k, v){ this.attrs[k] = String(v); }, getAttribute(k){ return this.attrs[k]; },
    appendChild(c){ c.parentNode = this; this.children.push(c); return c; },
    insertBefore(c){ return this.appendChild(c); },
    querySelector(sel){ const want = sel.replace(/^\./, ''); const walk = n => { for (const c of n.children){ if ((' ' + c.className + ' ').includes(' ' + want + ' ')) return c; const f = walk(c); if (f) return f; } return null; }; return walk(this); },
    set innerHTML(v){ this.children = []; txt = ''; }, get innerHTML(){ return ''; },
    get text(){ return this.children.map(c => c.textContent).join('') || this.textContent; } };
  return el;
}

/* One "tab": a fresh context running app/songfiles.js with the shared fakes. */
function makeTab(src, shared, opts){
  const o = opts || {};
  // The waits are seconds long on the site; the sim shortens them in its own copy of the text.
  src = src.replace('const SONG_FILES_IDB_WAIT_MS = 5000;', 'const SONG_FILES_IDB_WAIT_MS = 40;').replace('const SONG_FILES_LOCK_WAIT_MS = 60000;', 'const SONG_FILES_LOCK_WAIT_MS = 40;');
  const urls = [];
  const ctx = {
    console, Promise, Map, Set, Uint8Array, Date, Math, Number, String, Error, JSON, Object, Array, setTimeout, clearTimeout,
    Blob, crypto: globalThis.crypto,
    URL: { createObjectURL: b => { const u = 'blob:sim/' + urls.length; urls.push(b); return u; } },
    indexedDB: shared.idb.indexedDB,
    navigator: { locks: o.noLocks ? undefined : shared.locks, onLine: !o.offline, storage: { persist: async () => true } },
    AbortSignal,
    firebase: { firestore: { FieldValue: { increment: n => ({ __inc: n }) } } },
    currentUser: o.signedOut ? null : { uid: 'uidSim' },
    ensureDb: async () => shared.fs.db,
    document: { createElement: () => makeEl() },
    t: (k, p) => k + (p ? JSON.stringify(p) : ''),
  };
  vm.createContext(ctx);
  /* The sim's own list: whatever the site ships on SONG_FILES is cleared, so a real entry never changes a case (review B3). */
  vm.runInContext(src + `\n;for (const k of Object.keys(SONG_FILES)) delete SONG_FILES[k];\nglobalThis.__api = { SONG_FILES, songFileLoad, songFileSrc, songFileNeedsLoad, songFileWaitThen, songFileCancelWait, songFileCancelWaitIn, songFileWaitingFor, songFileCost, songFileMonth, SONG_FILES_MONTH_LIMIT, SONG_FILE_LINE_KEYS };`, ctx, { filename: 'app/songfiles.js' });
  return { api: ctx.__api, ctx, urls };
}
const newShared = o => ({ fs: makeFirestore(), idb: makeIdb(o), locks: makeLocks() });
const bytesOf = n => new Uint8Array(randomBytes(n));
const register = (tab, id, b, over) => { tab.api.SONG_FILES[id] = Object.assign({ file: id + '.mp3', bytes: b.length, sha256: sha(b), durationSec: 100 }, over || {}); };
const blobBytes = async b => new Uint8Array(await b.arrayBuffer());
const usage = shared => { for (const [k, v] of shared.fs.docs) if (k.startsWith('songFilesUsage/')) return v.bytes; return 0; };

async function suite(src, quiet){
  let pass = 0, fail = 0; const red = [];
  const ok = (name, cond, why) => { if (cond) pass++; else { fail++; red.push(name); } if (!quiet) console.log((cond ? '  ✓ ' : '  ✗ ') + name + (cond || !why ? '' : '  — ' + why)); };
  const code = async p => { try { await p; return 'resolved'; } catch (e) { return e.code || 'no-code'; } };
  const say = s => { if (!quiet) console.log(s); };
  const BIG = bytesOf(2 * PIECE + 12345), cost = Math.ceil(BIG.length * 4 / 3);

  say('== public paths');
  { const tab = makeTab(src, newShared());
    ok('songFileSrc leaves a public path alone', tab.api.songFileSrc('audio/x-backing-full.mp3') === 'audio/x-backing-full.mp3');
    ok('songFileNeedsLoad is false for a public path', tab.api.songFileNeedsLoad('audio/x-backing-full.mp3') === false);
    ok('…and for undefined (a track with no slow tier)', tab.api.songFileNeedsLoad(undefined) === false && tab.api.songFileSrc(undefined) === undefined);
    ok('songFileNeedsLoad is true for a private path not loaded', tab.api.songFileNeedsLoad('private:made-up') === true);
  }
  say('== maths');
  { const tab = makeTab(src, newShared());
    ok('month: 2026-11-30 23:59 UTC is 2026-11', tab.api.songFileMonth(Date.UTC(2026, 10, 30, 23, 59)) === '2026-11');
    ok('month: 2026-12-01 00:00 UTC is 2026-12', tab.api.songFileMonth(Date.UTC(2026, 11, 1, 0, 0)) === '2026-12');
    ok('month: 2027-01-01 00:00 UTC is 2027-01', tab.api.songFileMonth(Date.UTC(2027, 0, 1)) === '2027-01');
    ok('cost: 3 bytes count 4', tab.api.songFileCost(3) === 4);
    ok('cost: 4 bytes count 6 (rounded up)', tab.api.songFileCost(4) === 6);
    ok('the limit is 6 GiB', tab.api.SONG_FILES_MONTH_LIMIT === 6 * 2 ** 30);
  }

  say('== download, pieces out of order');
  const sh = newShared();
  putFile(sh.fs, 'made-up', BIG);
  { const tab = makeTab(src, sh); register(tab, 'made-up', BIG);
    const seen = [];
    const url = await tab.api.songFileLoad('made-up', f => seen.push(f));
    ok('it resolves to a blob: address', /^blob:/.test(url), url);
    ok('the pieces arrived out of order (the sim\'s jitter)', JSON.stringify(sh.fs.st.order) === '[1,2,0]', JSON.stringify(sh.fs.st.order));
    const got = await blobBytes(tab.urls[0]);
    ok('the bytes are the file, byte for byte', got.length === BIG.length && sha(got) === sha(BIG));
    ok('3 pieces read', sh.fs.st.pieceReads === 3, String(sh.fs.st.pieceReads));
    ok('progress rose to 1', seen.length === 3 && seen[2] === 1 && seen[0] < seen[1], JSON.stringify(seen));
    ok('the month\'s count rose by the cost, once', usage(sh) === cost, usage(sh) + ' vs ' + cost);
    await tick(); await tick();
    ok('the device keeps a copy', !!sh.idb.stores.get('made-up') && sh.idb.stores.get('made-up').sha256 === sha(BIG));
    ok('songFileSrc now gives the blob: address', tab.api.songFileSrc('private:made-up') === url && !tab.api.songFileNeedsLoad('private:made-up'));
    const r0 = sh.fs.st.reads;
    const url2 = await tab.api.songFileLoad('made-up');
    ok('a second ask in the page reads nothing and gives the same address', url2 === url && sh.fs.st.reads === r0);
    tab.ctx.currentUser = null;
    ok('signed out in the same tab: the loaded copy is not handed out (needs a load again, the address is the path)', tab.api.songFileNeedsLoad('private:made-up') && tab.api.songFileSrc('private:made-up') === 'private:made-up');
    ok('…and asking again says sign in', await code(tab.api.songFileLoad('made-up')) === 'signin');
    tab.ctx.currentUser = { uid: 'uidOther' };
    ok('another student signs in on that tab: the copy plays again with no read', !tab.api.songFileNeedsLoad('private:made-up') && sh.fs.st.reads === r0);
  }
  say('== the device copy');
  { const r0 = sh.fs.st.reads, u0 = usage(sh);
    const tab = makeTab(src, sh); register(tab, 'made-up', BIG);
    const url = await tab.api.songFileLoad('made-up');
    ok('a new page plays from the copy: 0 reads', /^blob:/.test(url) && sh.fs.st.reads === r0, String(sh.fs.st.reads - r0));
    ok('…and nothing counted', usage(sh) === u0);
    const off = makeTab(src, sh, { offline: true }); register(off, 'made-up', BIG);
    ok('offline, with the copy: it plays', /^blob:/.test(await off.api.songFileLoad('made-up')));
    const signedOut = makeTab(src, sh, { signedOut: true }); register(signedOut, 'made-up', BIG);
    ok('signed out, even with the copy: signin', await code(signedOut.api.songFileLoad('made-up')) === 'signin');
    const B2 = bytesOf(BIG.length);    // same size, other bytes: only the SHA-256 tells them apart
    putFile(sh.fs, 'made-up', B2);
    const re = makeTab(src, sh); register(re, 'made-up', B2);
    await re.api.songFileLoad('made-up'); await tick(); await tick();
    ok('a re-exported song (new SHA-256 on the list) is downloaded again and replaces the copy', sh.idb.stores.get('made-up').sha256 === sha(B2) && sha(await blobBytes(re.urls[0])) === sha(B2));
  }

  say('== refusals: nothing kept, no address');
  const refuse = async (label, setup, want, extra) => {
    const s = newShared(); const B = bytesOf(2 * PIECE + 99);
    putFile(s.fs, 'x', B);
    const tab = makeTab(src, s, extra && extra.tab); register(tab, 'x', B);
    if (setup) setup(s, tab, B);
    const c = await code(tab.api.songFileLoad('x'));
    await tick(); await tick();
    ok(`${label}: ${want}`, c === want, c);
    ok(`${label}: no copy kept, no address`, !s.idb.stores.get('x') && tab.api.songFileNeedsLoad('private:x'));
    if (extra && extra.noRead) ok(`${label}: nothing read`, s.fs.st.reads === 0, String(s.fs.st.reads));
    if (extra && extra.noCount) ok(`${label}: nothing counted`, usage(s) === 0, String(usage(s)));
    return s;
  };
  await refuse('signed out', null, 'signin', { tab: { signedOut: true }, noRead: true });
  await refuse('not on the list', (s, tab) => { delete tab.api.SONG_FILES.x; }, 'notready', { noRead: true });
  await refuse('not uploaded', s => { s.fs.docs.delete('songFiles/x'); }, 'notready', { noCount: true });
  await refuse('still uploading', s => { s.fs.docs.get('songFiles/x').state = 'uploading'; }, 'notready', { noCount: true });
  await refuse('the stored SHA-256 is not the list\'s', s => { s.fs.docs.get('songFiles/x').sha256 = 'b'.repeat(64); }, 'notready', { noCount: true });
  await refuse('the stored size is not the list\'s', s => { s.fs.docs.get('songFiles/x').bytes += 1; }, 'notready', { noCount: true });
  await refuse('a missing piece', s => { s.fs.docs.delete('songFiles/x/pieces/1'); }, 'notready');
  await refuse('a piece of the wrong length', s => { const p = s.fs.docs.get('songFiles/x/pieces/2'); p.data = new FakeBytes(p.data.u8.subarray(1)); }, 'notready');
  await refuse('a piece under the wrong index', s => { s.fs.docs.get('songFiles/x/pieces/1').i = 0; }, 'notready');
  await refuse('one wrong byte (the SHA-256 check)', s => { const p = s.fs.docs.get('songFiles/x/pieces/1'); const c = new Uint8Array(p.data.u8); c[500] ^= 1; p.data = new FakeBytes(c); }, 'notready');
  await refuse('the rules refuse', s => { s.fs.st.deny = true; }, 'denied', { noCount: true });
  await refuse('offline with no copy', null, 'offline', { tab: { offline: true }, noRead: true, noCount: true });

  say('== review round 1 (A2, m4-m7, B1, B4)');
  { // A2: a broken stored file is refused at once on the next press: no read, no count
    const s = newShared(); putFile(s.fs, 'x', BIG);
    const tab = makeTab(src, s); register(tab, 'x', BIG);
    const p = s.fs.docs.get('songFiles/x/pieces/1'); const c = new Uint8Array(p.data.u8); c[9] ^= 1; p.data = new FakeBytes(c);
    await code(tab.api.songFileLoad('x'));
    const r0 = s.fs.st.reads, u0 = usage(s);
    const again = await code(tab.api.songFileLoad('x'));
    ok('a broken file: the second press says not ready with no read and no count', again === 'notready' && s.fs.st.reads === r0 && usage(s) === u0 && u0 === cost, `${again} ${s.fs.st.reads - r0} ${usage(s)}`);
  }
  { // L5 + L2 + A2: the connection drops mid-download: offline, no copy kept; the retry downloads and is NOT counted again
    const s = newShared(); putFile(s.fs, 'x', BIG); s.fs.st.dropAtPiece = 2;
    const tab = makeTab(src, s); register(tab, 'x', BIG);
    const c1 = await code(tab.api.songFileLoad('x'));
    await tick(); await tick();
    ok('a connection dropped mid-download (navigator still online) reads as offline', c1 === 'offline', c1);
    ok('…keeps no copy', !s.idb.stores.get('x'));
    const c2 = await code(tab.api.songFileLoad('x'));
    await tick(); await tick();
    ok('…the next press downloads it', c2 === 'resolved' && sha(await blobBytes(tab.urls[0])) === sha(BIG), c2);
    ok('…counted once for the two presses', usage(s) === cost, String(usage(s)));
    const pr = s.fs.st.pieceReads, fresh = makeTab(src, s); register(fresh, 'x', BIG);
    ok('…and kept: a new page plays the copy with no read', await code(fresh.api.songFileLoad('x')) === 'resolved' && s.fs.st.pieceReads === pr);
  }
  { // L1 + m4: a device copy with the right label but the wrong size, or the right size but other bytes, is not used
    for (const [label, blob] of [['the wrong size', new Blob([new Uint8Array(BIG.length - 1)])], ['the right size, other bytes', new Blob([new Uint8Array(BIG.length)])]]) {
      const s = newShared(); putFile(s.fs, 'x', BIG);
      s.idb.stores.set('x', { id: 'x', sha256: sha(BIG), bytes: BIG.length, blob, savedAt: 1 });
      const tab = makeTab(src, s); register(tab, 'x', BIG);
      await tab.api.songFileLoad('x'); await tick(); await tick();
      ok(`a device copy labelled right but ${label}: downloaded again and replaced`, s.fs.st.pieceReads === 3 && sha(await blobBytes(tab.urls[0])) === sha(BIG) && s.idb.stores.get('x').blob.size === BIG.length && sha(await blobBytes(s.idb.stores.get('x').blob)) === sha(BIG));
    }
  }
  { // L3: 'unavailable' on the first read with navigator online
    const s = newShared(); putFile(s.fs, 'x', BIG); s.fs.st.offline = true;
    const tab = makeTab(src, s); register(tab, 'x', BIG);
    ok('the database unreachable while the browser says online: offline', await code(tab.api.songFileLoad('x')) === 'offline');
  }
  { // L4 + m5: IndexedDB that errors, or never answers: the song still plays (no copy)
    for (const [label, o] of [['errors', { openError: true }], ['never answers', { openHang: true }]]) {
      const s = newShared(o); putFile(s.fs, 'x', BIG);
      const tab = makeTab(src, s); register(tab, 'x', BIG);
      const c = await Promise.race([code(tab.api.songFileLoad('x')), new Promise(r => setTimeout(() => r('hung'), 3000))]);
      ok(`IndexedDB that ${label}: the song still plays this time`, c === 'resolved', c);
    }
  }
  { // m5: another tab hung holding the lock: this one goes on without it
    const s = newShared(); putFile(s.fs, 'x', BIG); s.locks.hung = true;
    const tab = makeTab(src, s); register(tab, 'x', BIG);
    const c = await Promise.race([code(tab.api.songFileLoad('x')), new Promise(r => setTimeout(() => r('hung'), 3000))]);
    ok('a lock held by a hung tab: the song still loads', c === 'resolved', c);
  }
  { // m6: the counter write refused while the read passed: this Chromebook's date
    const s = newShared(); putFile(s.fs, 'x', BIG); s.fs.st.denyCount = true;
    const tab = makeTab(src, s); register(tab, 'x', BIG);
    const c = await code(tab.api.songFileLoad('x'));
    ok('the month\'s count refused (another month on this Chromebook\'s clock): the date line, nothing read', c === 'clock' && s.fs.st.pieceReads === 0, c);
  }
  { // B1: the card leaves, is hidden, or its fold closes during the load: no restart
    for (const [label, edit] of [['removed from the page', h => { h.isConnected = false; }], ['inside a closed fold', h => { h.closest = sel => /details:not\(\[open\]\)/.test(sel) ? {} : null; }], ['not laid out', h => { h.getClientRects = () => []; }]]) {
      const s = newShared(); putFile(s.fs, 'x', BIG);
      const tab = makeTab(src, s); register(tab, 'x', BIG);
      const h = makeEl('snip'); h.closest = () => null; h.getClientRects = () => [1]; let runs = 0;
      tab.api.songFileWaitThen(h, 'private:x', () => runs++);
      edit(h);
      while (tab.api.songFileNeedsLoad('private:x')) await tick();
      await tick(); await tick();
      ok(`the card ${label} while it loads: the song does not start`, runs === 0);
    }
    const s = newShared(); putFile(s.fs, 'x', BIG);
    const tab = makeTab(src, s); register(tab, 'x', BIG);
    const h = makeEl('snip'), fold = { contains: el => el === h }, other = { contains: () => false };
    let runs = 0, ui = '';
    tab.api.songFileWaitThen(h, 'private:x', () => runs++, { wait: () => { ui += 'w'; }, done: () => { ui += 'd'; } });
    tab.api.songFileCancelWaitIn(other);
    const still = tab.api.songFileWaitingFor(h);
    tab.api.songFileCancelWaitIn(fold);
    while (tab.api.songFileNeedsLoad('private:x')) await tick();
    await tick(); await tick();
    ok('closing another fold leaves the wait; closing the card\'s own fold cancels it: no start', still && !tab.api.songFileWaitingFor(h) && runs === 0);
    ok('the player\'s button: Stop while it waits, Play again when the wait is cancelled', ui === 'wd', ui);
  }

  say('== a full device');
  { const s = newShared(); s.idb.st.full = true; putFile(s.fs, 'x', BIG);
    const tab = makeTab(src, s); register(tab, 'x', BIG);
    const url = await tab.api.songFileLoad('x');
    ok('a full device still plays the song this time', /^blob:/.test(url) && sha(await blobBytes(tab.urls[0])) === sha(BIG));
    await tick(); await tick();
    ok('…keeps nothing', !s.idb.stores.get('x') && s.idb.st.puts === 1, String(s.idb.st.puts));
    const r0 = s.fs.st.pieceReads;
    const next = makeTab(src, s); register(next, 'x', BIG);
    await next.api.songFileLoad('x');
    ok('…and the next page downloads it again', s.fs.st.pieceReads === r0 + 3);
  }

  say('== two tabs, one song');
  { const s = newShared(); putFile(s.fs, 'x', BIG);
    const a = makeTab(src, s), b = makeTab(src, s); register(a, 'x', BIG); register(b, 'x', BIG);
    const [ua, ub] = await Promise.all([a.api.songFileLoad('x'), b.api.songFileLoad('x')]);
    ok('both tabs get the song', /^blob:/.test(ua) && /^blob:/.test(ub));
    ok('one download (3 piece reads)', s.fs.st.pieceReads === 3, String(s.fs.st.pieceReads));
    ok('one count', usage(s) === cost, String(usage(s)));
    const s2 = newShared(); putFile(s2.fs, 'x', BIG);
    const c = makeTab(src, s2); register(c, 'x', BIG);
    const p1 = [], p2 = [];
    const [u1, u2] = await Promise.all([c.api.songFileLoad('x', f => p1.push(f)), c.api.songFileLoad('x', f => p2.push(f))]);
    ok('two asks in one page share one download', u1 === u2 && s2.fs.st.pieceReads === 3 && usage(s2) === cost);
    ok('…and both see the progress', p1.length === 3 && p2.length === 3);
  }

  say('== the monthly limit');
  { const at = async (start, want) => {
      const s = newShared(); putFile(s.fs, 'x', BIG);
      const tab = makeTab(src, s); register(tab, 'x', BIG);
      s.fs.docs.set('songFilesUsage/' + tab.api.songFileMonth(), { bytes: start });
      const c = await code(tab.api.songFileLoad('x'));
      return { c, s, start };
    };
    const L = 6 * 2 ** 30;
    const okRun = await at(L - cost, 'resolved');
    ok('exactly at the limit: allowed', okRun.c === 'resolved', okRun.c);
    ok('…and counted up to the limit', usage(okRun.s) === L);
    const over = await at(L - cost + 1, 'limit');
    ok('one byte over: limit', over.c === 'limit', over.c);
    ok('…nothing read', over.s.fs.st.pieceReads === 0);
    ok('…nothing counted', usage(over.s) === L - cost + 1);
    const s = newShared(); putFile(s.fs, 'x', BIG);
    const tab = makeTab(src, s); register(tab, 'x', BIG);
    s.fs.docs.set('songFilesUsage/' + tab.api.songFileMonth(Date.now() - 40 * 86400000), { bytes: L });
    ok('last month\'s full count does not block this month', await code(tab.api.songFileLoad('x')) === 'resolved');
  }

  say('== the card waiting for its song');
  { const s = newShared(); putFile(s.fs, 'x', BIG);
    const tab = makeTab(src, s); register(tab, 'x', BIG);
    const host = makeEl('snip'); host.appendChild(makeEl('snip-controls'));
    let runs = 0;
    LINE_LOG.length = 0;
    tab.api.songFileWaitThen(host, 'private:x', () => runs++);
    while (tab.api.songFileNeedsLoad('private:x') && runs === 0) await tick();
    await tick(); await tick();
    const texts = LINE_LOG.slice();
    ok('the line starts at "sf.loading" 0%', texts[0] === 'sf.loading{"pct":0}', texts[0]);
    ok('…and rises with the pieces', texts.some(x => { const m = /"pct":(\d+)/.exec(x); return m && +m[1] > 0 && +m[1] < 99; }), JSON.stringify(texts));
    ok('restart runs once when the song is here', runs === 1, String(runs));
    ok('the line is cleared', host.querySelector('.sf-line').text === '');

    const s2 = newShared(); putFile(s2.fs, 'y', BIG);
    const tab2 = makeTab(src, s2); register(tab2, 'y', BIG);
    const h2 = makeEl('snip'); let r2 = 0;
    tab2.api.songFileWaitThen(h2, 'private:y', () => r2++);
    await tick();
    tab2.api.songFileCancelWait();
    ok('a stop clears the line at once', h2.querySelector('.sf-line').text === '');
    while (tab2.api.songFileNeedsLoad('private:y')) await tick();
    await tick(); await tick();
    ok('…and the song does not start by itself when it arrives', r2 === 0);

    const s3 = newShared(); putFile(s3.fs, 'z', BIG); putFile(s3.fs, 'w', BIG);
    const tab3 = makeTab(src, s3); register(tab3, 'z', BIG); register(tab3, 'w', BIG);
    const hA = makeEl('snip'), hB = makeEl('snip'); let rA = 0, rB = 0;
    tab3.api.songFileWaitThen(hA, 'private:z', () => rA++);
    tab3.api.songFileWaitThen(hB, 'private:w', () => rB++);
    while (tab3.api.songFileNeedsLoad('private:z') || tab3.api.songFileNeedsLoad('private:w')) await tick();
    await tick(); await tick();
    ok('a second card\'s wait cancels the first\'s restart', rA === 0 && rB === 1, `${rA} ${rB}`);

    const s4 = newShared(); putFile(s4.fs, 'q', BIG);
    const tab4 = makeTab(src, s4); register(tab4, 'q', BIG);
    s4.fs.docs.set('songFilesUsage/' + tab4.api.songFileMonth(), { bytes: 6 * 2 ** 30 });
    const h4 = makeEl('pc'); const status = makeEl('pc-status'); h4.appendChild(status); let r4 = 0;
    tab4.api.songFileWaitThen(h4, 'private:q', () => r4++);
    for (let i = 0; i < 50; i++) await tick();
    ok('a practice card shows the limit line in its own status line', status.text === 'sf.limit' && r4 === 0, status.text);
    const keys = Object.values(tab4.api.SONG_FILE_LINE_KEYS);
    const missingKeys = [...new Set(keys)].filter(k => !new RegExp(`'${k.replace('.', '\\.')}':\\s*\\{ en: '[^']+',\\s*(\\n\\s*)?es: '[^']+'`).test(I18N));
    ok(`every line the loader can show has English and Spanish in i18n.js (${new Set(keys).size} keys)`, missingKeys.length === 0, missingKeys.join(', '));
  }
  return { pass, fail, red };
}

/* Each break: [name, old text, new text]. The old text must occur exactly once in app/songfiles.js. */
const BREAKS = [
  /* Review round 1 (2026-11-14): the reviewer's five loader plants L1-L5, the restart plant C1, and the fixes. */
  ['L1: a device copy\'s size is not checked (and not re-hashed, which now covers it)', "rec.blob && rec.blob.size === entry.bytes", "rec.blob", "      if(sha !== entry.sha256) return null;\n", ''],
  ['L2: a failed load is never tried again', ".finally(() => sfInflight.delete(id));", ".then(u => { sfInflight.delete(id); return u; });"],
  ['L3: unavailable is not read as offline', "if(c === 'unavailable') return 'offline';", ''],
  ['L4: an IndexedDB open error, with no time limit, hangs', "    setTimeout(() => resolve(null), SONG_FILES_IDB_WAIT_MS);\n", ''],
  ['L4b: the open error handler gone and no time limit', "    req.onerror = () => resolve(null);       // private window, blocked storage: no copy, the song still plays this time\n", "    req.onerror = null;\n", "    setTimeout(() => resolve(null), SONG_FILES_IDB_WAIT_MS);\n", ''],
  ['L5: a junk copy kept when the connection drops mid-download', "    try { bytes = await songFileReadPieces(db, id, entry, progress); }", "    try { bytes = await songFileReadPieces(db, id, entry, progress); }\n    catch(e){ if(e && e.code === 'unavailable') await sfCopyPut({ id, sha256: entry.sha256, bytes: entry.bytes, blob: new Blob([new Uint8Array(entry.bytes)]), savedAt: 0 }); throw e; }\n    try {}"],
  ['C1: the restart does not ask whether the card is still shown', "    if(songFileHostShown(host)) restart();", "    restart();"],
  ['B1: closing a fold does not cancel a wait inside it', "  if(sfWait && el && typeof el.contains === 'function' && el.contains(sfWait.host)) songFileCancelWait();", ''],
  ['B1: a closed fold counts as shown', "host.closest('details:not([open]), [hidden], [inert]')", "host.closest('[data-never]')"],
  ['A2: a broken file is read and counted again', "  if(sfBroken.has(key)) throw songFileErr('notready', 'broken earlier in this page');\n", ''],
  ['A2: a retry is counted again', "    if(!sfCounted.has(key)){", "    if(true){"],
  ['m4: a device copy is not re-hashed', "      if(sha !== entry.sha256) return null;\n", ''],
  ['m5: no time limit on a hung lock', "      const opts = (typeof AbortSignal !== 'undefined' && AbortSignal.timeout) ? { signal: AbortSignal.timeout(SONG_FILES_LOCK_WAIT_MS) } : {};", "      const opts = {};"],
  ['m6: a refused count reads as not allowed', "catch(e){ if(e && e.code === 'permission-denied') throw songFileErr('clock'); throw e; }", "catch(e){ throw e; }"],
  ['B4: a cancelled wait leaves the button on Stop', "  songFileShow(w.host, '');\n  if(w.ui && w.ui.done) try { w.ui.done(); } catch(e) {}", "  songFileShow(w.host, '');"],
  ['the SHA-256 is not checked', "if(sha !== expect.sha256) throw songFileErr('bad', 'the SHA-256 is not the list\\'s');", ''],
  /* No break drops the piece-length check: a piece of the wrong length also changes the whole file's SHA-256, which
     the next check refuses ('one wrong byte' and 'a piece of the wrong length' above), so that mutant only names the
     fault later. */
  ['a piece\'s index is not checked', "if(d.i !== k || !bytes || bytes.length !== want)", "if(!bytes || bytes.length !== want)"],
  /* No break skips a missing piece: the hole then fails the SHA-256 check, and both end on the same "not ready" line. */
  ['pieces placed in arrival order, not by index', "out.set(bytes, k * SONG_FILE_PIECE);", "out.set(bytes, Math.min(got, expect.bytes - bytes.length));"],
  ['the limit is not checked', "if(used + cost > SONG_FILES_MONTH_LIMIT) throw songFileErr('limit');", ''],
  ['the limit lets one byte over', "if(used + cost > SONG_FILES_MONTH_LIMIT)", "if(used + cost > SONG_FILES_MONTH_LIMIT + 1)"],
  ['nothing is counted', "await ref.set({ bytes: firebase.firestore.FieldValue.increment(cost) }, { merge: true });", ''],
  ['counted at the raw size', "return Math.ceil(bytes * 4 / 3);", "return bytes;"],
  ['the device copy is not used', "    if(!sfCopyOk(rec, entry)) return null;", "    return null;"],
  ['a copy of another version is used (label not compared, not re-hashed)', "rec.sha256 === entry.sha256 && ", '', "      if(sha !== entry.sha256) return null;\n", ''],
  ['no lock between tabs', "return navigator.locks.request('gc-song-file:' + id, opts, fn)", "return Promise.resolve().then(fn)"],
  ['the copy is not looked at again under the lock', "const again = await fromCopy();", "const again = null;"],
  ['no sharing of one load in a page', "let job = sfInflight.get(id);", "let job = null;"],
  ['a file still uploading is read', "h.state !== 'ready' || ", ''],
  ['the stored SHA-256 is not compared with the list', "|| h.sha256 !== entry.sha256 ", ''],
  ['signed out is not refused', "if(!songFileHost().user) return Promise.reject(songFileErr('signin'));", ''],
  ['offline is not noticed before reading', "if(typeof navigator !== 'undefined' && navigator.onLine === false) throw songFileErr('offline');", ''],
  ['a full device fails the song', "    } catch(e) {}\n    return b;", "    } catch(e) { throw e; }\n    return b;"],
  ['the month is local time, not UTC', "return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0');", "return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 2).padStart(2, '0');"],
  ['a stop does not cancel the restart', "  const w = sfWait;\n  sfWait = null;", "  const w = sfWait;"],
  ['the restart runs for a card no longer waiting', "  songFileLoad(id, f => { if(mine()) songFileShow(host, 'loading', f); }).then(() => {\n    if(!mine()) return;", "  songFileLoad(id, f => { if(mine()) songFileShow(host, 'loading', f); }).then(() => {"],
  ['the loading line never shows the %', "{ pct: Math.max(0, Math.min(99, Math.floor((frac || 0) * 100))) }", "{ pct: 0 }"],
  ['denied reads as failed', "if(c === 'permission-denied' || c === 'unauthenticated') return 'denied';", ''],
  ['a sign-out still hands out the loaded copy', "return (id && sfUrls.has(id) && songFileHost().user) ? sfUrls.get(id) : src;", "return (id && sfUrls.has(id)) ? sfUrls.get(id) : src;"],
  ['a public path is mapped', "return (id && sfUrls.has(id) && songFileHost().user) ? sfUrls.get(id) : src;", "return (id && sfUrls.has(id) && songFileHost().user) ? sfUrls.get(id) : String(src);"],
];

const real = await suite(SRC, false);
console.log(`\nsong-files-sim: ${real.pass + real.fail} cases, ${real.fail} failed`);
let missed = 0;
if (process.argv.includes('--breaks')) {
  console.log('\n== broken copies of app/songfiles.js (each must turn at least one case red)');
  for (const [name, ...pairs] of BREAKS) {
    let broken = SRC, bad = '';
    for (let i = 0; i < pairs.length; i += 2) {
      const n = broken.split(pairs[i]).length - 1;
      if (n !== 1) { bad = `the text to break is found ${n} times (must be 1): ${JSON.stringify(pairs[i].slice(0, 60))}`; break; }
      broken = broken.replace(pairs[i], () => pairs[i + 1]);
    }
    if (bad) { console.log(`  ✗ ${name}: ${bad}`); missed++; continue; }
    let r;
    try { r = await suite(broken, true); } catch (e) { r = { fail: 1, red: ['threw: ' + String(e.message || e).slice(0, 100)] }; }
    if (r.fail) console.log(`  ✓ caught: ${name} — ${r.red.slice(0, 2).join(' | ')}`);
    else { console.log(`  ✗ NOT caught: ${name}`); missed++; }
  }
  console.log(`\n${missed ? '✗' : '✓'} ${BREAKS.length - missed} of ${BREAKS.length} breaks caught`);
}
process.exit(real.fail || missed ? 1 : 0);
