#!/usr/bin/env node
/* built-songs-sim.mjs — the built songs' merge (app/builtsongs.js, Song builder Part a2, 2026-11-14), RUN in Node:
   the REAL whole app script (every app/*.js part, in index.html order, after i18n.js, guitar-diagrams.js,
   class-activities.js, config-main.js and the module data, the same set checks.mjs 0b renders), a fake Firestore
   (builtSongsMeta/list, builtSongs/{id}; denied, missing, offline), a fake IndexedDB shared by the "pages" of one
   case (the device copy), and a spy on the error log. checks.mjs 1em runs it and pins the case count.

     node tools/built-songs-sim.mjs                 every case (a few seconds)
     node tools/built-songs-sim.mjs --verbose       every case's line, not only the failures
     node tools/built-songs-sim.mjs --breaks        the cases against broken copies of the site (each must turn red)
     node tools/built-songs-sim.mjs --against <dir> also renders every coded practice card (both languages, every
                                                    chord view) in this tree and in <dir> (a checkout of the commit
                                                    before) and compares them byte for byte

   What it proves (each case prints ✓/✗):
     zero      with no built song (the list missing, empty, refused, offline with no device copy, nobody signed
               in, no IndexedDB at all): CLASS_ACTIVITIES and SNIPPET_TRACKS deep-equal before and after (the same
               objects, the same tracks), no audio entry, no repaint, no write, no error-log line; every
               coded practice card still has its two-file stops (no data-one-file, opens on Normal: data-slow="", Slowest 0.8 of the
               slow file, Slow at pcSlowRate) — the guard that 0 built songs changes nothing a student sees
     merge     the made-up fixtures (tools/built-songs-fixtures.mjs: 4/4, 3/4, 6/8 counted in six, a beat map,
               power chords only, both versions opening each way, lyric lines, a 1-bar section, 15 sections, a
               from-to range, and a built copy of ca-51) each merge as ONE library card and ONE one-file track,
               render through caCardBodyHtml in English and Spanish (section buttons, names, lyrics escaped, the
               chord names of the view it opens on, the one-file stops 0.65 / 0.85 / 0.9 / 1 opening on 1), are
               on the Songs page list, never visible on In-Class Activities, never on the board, never moved by
               config/class.songLibrary, have no Mark complete, and fit their file
     sheet     (2026-11-18) a doc with song.sheet passes, expands to ONE Lyrics view (otherViews.lyrics: the private
               pdf, read loose, one column unless cols 2) and a .pdf song-file entry; merged, the card offers Chords /
               Lyrics, opens on Chords, and in Lyrics draws the private sheet over the same sections (EN and ES); a sheet
               id on SONG_FILES or another song's file with other bytes leaves that song out alone; no fixture without
               song.sheet gets views
     refused   one broken doc per validator rule (tools/built-songs-fixtures.mjs brokenFixtures) is left out
               ALONE while every good song merges; at most one error-log line per page
     store     offline → the device copy; signed out → nothing, not even from the device copy; refused → nothing,
               even with a device copy; a listed song whose doc is missing is skipped; a newer edit replaces the
               device copy's; the same edit is not read again; a song taken off the list leaves the page; the list's
               bad keys and values are skipped; a refused or failed doc read; an audio id on SONG_FILES or another
               song's with other bytes; an id already a coded track; sign-out clears; a deep link waits for the
               merge; a changed file drops the page's loaded copy; Hidden takes it off the list; a broken
               IndexedDB, and every connection closed (one opened after a "blocked" answer, one whose transaction
               throws); the tab-return read at most once every 15 minutes; no write anywhere
   Made-up data only; nothing leaves the process. */
import { readFileSync, readdirSync } from 'node:fs';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { siteParts } from './site-src.mjs';
import { FIXTURES, withAudio, audioIdFor, brokenFixtures, ca51Built } from './built-songs-fixtures.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const VERBOSE = args.includes('--verbose'), BREAKS = args.includes('--breaks');
const AGAINST = (() => { const i = args.indexOf('--against'); return i >= 0 ? resolve(args[i + 1]) : null; })();
const tick = () => new Promise(r => setImmediate(r));
const settle = async (n = 30) => { for (let i = 0; i < n; i++) await tick(); };
const hex = n => { let x = n * 2654435761 >>> 0, s = ''; while (s.length < 64) { x ^= x << 13; x >>>= 0; x ^= x >>> 17; x ^= x << 5; x >>>= 0; s += (x >>> 0).toString(16).padStart(8, '0'); } return s.slice(0, 64); };

/* ── the site's text, part by part (a break replaces one part) ── */
function siteFiles(root){
  const mods = readdirSync(root).filter(f => /^module-\d+\.js$/.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  const pre = ['i18n.js', 'guitar-diagrams.js', 'class-activities.js', 'config-main.js', ...mods].map(f => [f, readFileSync(join(root, f), 'utf8')]);
  const app = siteParts('app.js', root).map(f => [f, readFileSync(join(root, f), 'utf8')]);
  return [...pre, ...app];
}

/* ── fakes ── */
function makeFirestore(){
  const docs = new Map();
  const st = { reads: [], writes: 0, offline: false, deny: new Set(), denyAll: false };
  const err = code => { const e = new Error(code); e.code = code; return e; };
  const ref = path => ({
    path,
    collection: n => ({ doc: id => ref(path + '/' + n + '/' + id) }),
    async get(){
      st.reads.push(path); await tick();
      if (st.offline) throw err('unavailable');
      if (st.denyAll || st.deny.has(path)) throw err('permission-denied');
      const d = docs.get(path);
      /* A savedAt with toDate() stands for a Firestore Timestamp and is handed over as it is (JSON would drop it). */
      const data = () => { if (d === undefined) return undefined; const o = JSON.parse(JSON.stringify(d)); if (d.savedAt && typeof d.savedAt.toDate === 'function') o.savedAt = d.savedAt; return o; };
      return { exists: d !== undefined, id: path.split('/').pop(), data };
    },
    async set(){ st.writes++; }, async update(){ st.writes++; }, async delete(){ st.writes++; },
  });
  const db = { collection: n => ({ doc: id => ref(n + '/' + id), get: async () => { st.reads.push(n); return { docs: [], forEach(){} }; } }),
    batch: () => ({ set(){ st.writes++; }, update(){ st.writes++; }, delete(){ st.writes++; }, commit: async () => {} }),
    runTransaction: async () => { st.writes++; } };
  return { docs, st, db };
}
/* IndexedDB with one shared backing Map per "device": open / upgrade / transaction / get / put. */
function makeIdb(shared, opts = {}){
  return {
    open(name){
      if (opts.throws) throw new Error('blocked');
      const req = {};
      /* blocked: another tab holds an older version; the open says "blocked" first and goes through 5 ms later. */
      if (opts.blocked) setTimeout(() => { if (req.onblocked) req.onblocked(); }, 0);
      setTimeout(() => {
        if (opts.never) return;
        let dbs = shared.get(name), fresh = false;
        if (!dbs) { dbs = new Map(); shared.set(name, dbs); fresh = true; }
        const db = {
          createObjectStore(s, o){ if (!dbs.has(s)) dbs.set(s, { key: o.keyPath, rows: new Map() }); },
          transaction(s){
            if (opts.txThrows) throw new Error('NotFoundError');
            const store = dbs.get(s);
            const tx = {};
            const reqs = [];
            tx.objectStore = () => ({
              get(k){ const r = { result: store.rows.has(k) ? structuredClone(store.rows.get(k)) : undefined }; reqs.push(r); return r; },
              put(v){ const r = {}; if (opts.quota) { setTimeout(() => tx.onerror && tx.onerror(), 0); return r; } store.rows.set(v[store.key], structuredClone(v)); reqs.push(r); return r; },
            });
            setTimeout(() => { if (!opts.quota && tx.oncomplete) tx.oncomplete(); }, 0);
            return tx;
          },
          close(){ opts.closed = (opts.closed || 0) + 1; },
        };
        opts.opened = (opts.opened || 0) + 1;
        req.result = db;
        if (fresh && req.onupgradeneeded) req.onupgradeneeded();
        if (req.onsuccess) req.onsuccess();
      }, opts.blocked ? 5 : 0);
      return req;
    },
  };
}

/* ── one page: the whole app in a vm ── */
function makePage(files, shared = {}){
  const stubStyle = () => ({ setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; } });
  const el = () => ({
    style: stubStyle(), dataset: {}, children: [], hidden: false,
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    innerHTML: '', textContent: '', value: '', checked: false,
    addEventListener(){}, removeEventListener(){}, appendChild(){}, removeChild(){}, remove(){},
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){}, hasAttribute(){ return false; },
    querySelector(){ return null; }, querySelectorAll(){ return []; }, closest(){ return null; },
    focus(){}, blur(){}, click(){}, scrollIntoView(){}, insertAdjacentHTML(){}, cloneNode(){ return el(); },
    getBoundingClientRect(){ return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; },
  });
  const storage = () => ({ _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k, v){ this._d[k] = String(v); }, removeItem(k){ delete this._d[k]; }, clear(){ this._d = {}; } });
  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    document: { documentElement: el(), head: el(), body: el(), getElementById(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; },
      createElement(){ return el(); }, createDocumentFragment(){ return el(); }, addEventListener(){}, removeEventListener(){}, fonts: { ready: Promise.resolve() }, hidden: false, visibilityState: 'visible' },
    localStorage: storage(), sessionStorage: storage(),
    location: { hostname: 'localhost', href: 'http://localhost/', pathname: '/', search: '', hash: '', reload(){} },
    history: { scrollRestoration: 'auto', replaceState(){}, pushState(){} },
    navigator: { userAgent: 'node', language: 'en', onLine: true },
    setTimeout, clearTimeout, setInterval: () => 0, clearInterval(){},
    requestAnimationFrame: () => 0, cancelAnimationFrame(){},
    matchMedia: () => ({ matches: false, addEventListener(){}, addListener(){} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    fetch: () => Promise.reject(new Error('no network')),
    CustomEvent: class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } },
    Image: class {}, Audio: class { play(){ return Promise.resolve(); } pause(){} },
    AudioContext: class { createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency: { value: 0 } }; } createGain(){ return { connect(){}, gain: { value: 0, setValueAtTime(){} } }; } close(){} },
    performance: { now: () => 0 }, structuredClone,
    URLSearchParams, URL: Object.assign(function(){ return new URL(...arguments); }, { createObjectURL: () => 'blob:sim', revokeObjectURL(){} }), TextEncoder, TextDecoder, Blob,
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){}, scrollTo(){},
    innerWidth: 1366, innerHeight: 657, devicePixelRatio: 1,
  };
  ctx.URL.prototype = URL.prototype;
  if (shared.idb) ctx.indexedDB = shared.idb;
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  for (const [f, src] of files) vm.runInContext(src, ctx, { filename: f });
  const run = x => vm.runInContext(x, ctx);
  const F = shared.fs || makeFirestore();
  ctx.__fdb = F.db;
  run(`ensureDb = async () => __fdb; window.__logs = []; SITE_ERRORS.report = (k, e) => { __logs.push(String(e && e.message)); };
       window.__repaints = 0; const __rsp = refreshSongsPlayAlong; refreshSongsPlayAlong = function(){ __repaints++; return __rsp.apply(this, arguments); };`);
  return { ctx, run, F, signIn: (uid = 'stub-uid-1') => run(`currentUser = { uid: ${JSON.stringify(uid)}, email: 'test0@example.org', displayName: 'Test 0' }`), signOut: () => run('currentUser = null') };
}

/* The fixtures with made-up audio: { id, doc } each, audio id '<id>-<sha10>'. */
function goodSongs(page){
  const out = Object.entries(FIXTURES).map(([k, f], i) => {
    const sha = hex(i + 1), d = withAudio(f.doc, 1000 + i, sha); d.audio.id = audioIdFor(f.id, sha); d.audio.gainDb = -1.5; d.audio.sourceSha256 = hex(i + 101);
    return { key: k, id: f.id, doc: d };
  });
  const a = page.run(`CLASS_ACTIVITIES.find(x => x.id === 'ca-51')`), tr = page.run(`SNIPPET_TRACKS['perdon-mama']`);
  const d = ca51Built(JSON.parse(JSON.stringify(a)), JSON.parse(JSON.stringify(tr))); const sha = hex(99);
  Object.assign(d.audio, { id: audioIdFor('sb-copyofca51x', sha), bytes: 5000, sha256: sha });
  out.push({ key: 'ca51', id: 'sb-copyofca51x', doc: d });
  return out;
}
function publish(F, songs, vers){
  F.docs.set('builtSongsMeta/list', { songs: Object.fromEntries(songs.map(s => [s.id, (vers && vers[s.id]) || 1])) });
  songs.forEach(s => F.docs.set('builtSongs/' + s.id, s.doc));
}

/* ── the cases ── */
async function runCases(files){
  let cases = 0, fails = 0; const lines = [];
  const ok = (cond, line) => { cases++; if (!cond) fails++; if (!cond || VERBOSE) lines.push((cond ? '  ✓ ' : '  ✗ ') + line); return !!cond; };
  const sync = async p => { await p.run('builtSongsSync()'); await settle(); };
  const snap = p => p.run(`JSON.stringify([CLASS_ACTIVITIES.length, CLASS_ACTIVITIES, Object.keys(SNIPPET_TRACKS).length, SNIPPET_TRACKS])`);

  /* ── zero ── */
  {
    const variants = [
      ['the list missing', F => {}],
      ['the list empty', F => { F.docs.set('builtSongsMeta/list', { songs: {} }); }],
      ['the list refused (rules not pasted, or an account not let in)', F => { F.st.denyAll = true; }],
      ['offline with no device copy', F => { F.st.offline = true; }],
      ['nobody signed in', F => { F.docs.set('builtSongsMeta/list', { songs: { 'sb-test44aaaa': 1 } }); }, true],
      ['no IndexedDB at all', F => {}, false, true],
    ];
    for (const [name, setup, signedOut, noIdb] of variants) {
      const shared = { fs: makeFirestore(), idb: noIdb ? undefined : makeIdb(new Map()) };
      setup(shared.fs);
      const p = makePage(files, shared);
      const objs = p.run('CLASS_ACTIVITIES.slice()');
      const nActs = objs.length, nTracks = p.run('Object.keys(SNIPPET_TRACKS).length');
      const before = snap(p);
      if (!signedOut) p.signIn();
      await sync(p);
      p.ctx.__o0 = objs;
      const same = snap(p) === before && nActs > 0 && p.run('CLASS_ACTIVITIES.length') === nActs && p.run(`CLASS_ACTIVITIES.every((a, i) => a === __o0[i])`);
      ok(same && nTracks > 0 && p.run('Object.keys(SNIPPET_TRACKS).length') === nTracks, `zero (${name}): CLASS_ACTIVITIES (${nActs}, the same objects) and SNIPPET_TRACKS (${nTracks}) deep-equal before and after the merge`);
      ok(p.run('__repaints') === 0 && shared.fs.st.writes === 0 && p.run('__logs.length') === 0 && p.run(`songFileEntry('sb-test44aaaa-x') === null && Object.keys(sfBuilt).length === 0`),
        `zero (${name}): no repaint, no write, no error-log line, no audio entry (${p.run('__repaints')} / ${shared.fs.st.writes} / ${p.run('__logs.length')})`);
      if (signedOut) ok(shared.fs.st.reads.length === 0, `zero (${name}): nothing is read (${shared.fs.st.reads.length} reads)`);
    }
    /* Every coded practice card keeps its two-file stops. */
    const p = makePage(files);
    const res = p.run(`(() => { const out = []; for (const a of CLASS_ACTIVITIES) { if (a.view !== 'card' || !a.card || !a.card.slowest || a.card.startStop) continue;   /* the speed ladder (ca-54) opens on its bottom stop, 90: 1fc pins it */
      const tr = SNIPPET_TRACKS[caView(a).card.track]; const h = caCardBodyHtml(a); if (!h) continue;
      const rates = [...h.matchAll(/class="pc-speed-tick[^"]*"[^>]*data-rate="([^"]+)"/g)].map(m => m[1]);
      const want = [String(SLOWEST_RATE), '1', pcSlowRate(tr).toFixed(4), '1'];
      out.push({ id: a.id, ok: !/data-one-file/.test(h) && /<div class="pc" data-id="[^"]+" data-slow="" data-rate="1"/.test(h) && JSON.stringify(rates) === JSON.stringify(want) && !!tr.srcSlow }); } return out; })()`);
    ok(res.length === 26 && res.every(r => r.ok), `zero: every coded practice card keeps its two-file stops (no data-one-file, opens on Normal, ${res.filter(r => r.ok).length} of ${res.length} cards; ${res.filter(r => !r.ok).map(r => r.id).join(', ')})`);
  }

  /* ── merge ── */
  const base = makePage(files);
  const GOOD = goodSongs(base);
  {
    const shared = { fs: makeFirestore(), idb: makeIdb(new Map()) };
    publish(shared.fs, GOOD);
    const p = makePage(files, shared);
    p.signIn(); await sync(p);
    const lib = p.run('songsLibraryHtml()');
    for (const g of GOOD) {
      const id = g.id, d = g.doc;
      const r = p.run(`(() => { const id = ${JSON.stringify(id)}; const all = CLASS_ACTIVITIES.filter(a => a.id === id); const a = all[0], tr = SNIPPET_TRACKS[id];
        return { n: all.length, src: tr && tr.src, slow: tr && ('srcSlow' in tr), lib: a && caIsLibrarySong(a), libMoved: a && caIsLibraryCard(a, { [id]: false }), vis: a && caIsVisible(a),
          board: !!caBoardOrder(CLASS_ACTIVITIES, {}, {}).number[id] || !!caBoardOrder(CLASS_ACTIVITIES, { [id]: { module: 4, pos: 1 } }, { seeded: true }).assigned[id], song: a && caIsSongCard(a),
          mark: a ? caMarkRowHtml(a, false, 'x') : 'none', entry: songFileEntry(${JSON.stringify(d.audio.id)}),
          shape: a && JSON.stringify([a.library, a.optional, !!a.journey, !!a.card.wholeSong, !!a.card.sheet, !!a.teacherOnly, a.kind || '']),
          end: a && pcWindow(pcLayout(a), false).end, beats: tr && tr.beatsPerBar, six: tr && !!tr.countSix, bt: tr && tr.barTimes ? tr.barTimes.length : 0 }; })()`);
      ok(r.n === 1 && r.src === 'private:' + d.audio.id && r.slow === false, `merge ${g.key}: one card and one one-file track (src private:${d.audio.id.slice(0, 18)}…, no srcSlow)`);
      ok(r.lib && r.libMoved && r.song && !r.vis && !r.board && r.mark === '' && r.shape === JSON.stringify([true, true, false, false, false, false, '']),
        `merge ${g.key}: on the Songs list, never moved by songLibrary, never visible on In-Class Activities, never on the board, no Mark complete, library + optional only`);
      ok(r.entry && r.entry.bytes === d.audio.bytes && r.entry.sha256 === d.audio.sha256 && r.end <= d.audio.durationSec + 0.05, `merge ${g.key}: its audio entry is the doc's, and the card's window ends inside the file (${r.end.toFixed(2)} of ${d.audio.durationSec} s)`);
      ok(lib.includes(`songsLibraryOpen(&quot;${id}&quot;)`) && lib.includes(escapeHtml(`"${d.title}"`)), `merge ${g.key}: a row on Songs → More Play Along songs`);
      for (const lang of ['en', 'es']) {
        p.run(`setLang(${JSON.stringify(lang)})`);
        const h = p.run(`caCardBodyHtml(CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(id)}))`);
        const secs = d.song.range ? d.song.sections.slice(d.song.range.from, d.song.range.to + 1) : d.song.sections;
        const names = secs.map(s => p.run(`tIn(${JSON.stringify('bs.sec.' + s.name)}, ${JSON.stringify(lang)})`) + (s.n ? ' ' + s.n : ''));
        const chips = (h.match(/class="pc-sec[ "]/g) || []).length;
        const rates = [...h.matchAll(/class="pc-speed-tick[^"]*"[^>]*data-rate="([^"]+)"/g)].map(m => m[1]).join(',');
        const lyr = secs.flatMap(s => (s.lyrics || []).map(l => l.text).filter(Boolean));
        const start = d.song.level.versions === 'power' || d.song.level.start === 'power' ? 'power' : 'full';
        const firstChord = d.song.bars.map(b => b.split(/\s+/)[0].split(':')[0]).find(n => n !== '-');
        const shownName = start === 'power' && !/5$/.test(firstChord) ? firstChord.replace(/m$/, '') + '5' : firstChord;
        ok(h.length > 500 && (secs.length > 1 ? chips === secs.length : chips === 0) && names.every(n => h.includes(escapeHtml(n))) && rates === '0.65,0.85,0.9,1'
          && /<div class="pc" data-id="[^"]+" data-slow="" data-rate="1"/.test(h) && /data-one-file="1"/.test(h)
          && lyr.every(t => h.includes(`pc-row-label">${escapeHtml(t)}</div>`)) && h.includes(`>${escapeHtml(shownName)}<span class="tab-spkr"`),
          `merge ${g.key} [${lang}]: renders through caCardBodyHtml: ${secs.length} section${secs.length === 1 ? '' : 's'} named in ${lang}, ${lyr.length} lyric line${lyr.length === 1 ? '' : 's'} escaped, opens on ${start} chords (${shownName}), the stops 0.65 / 0.85 / 0.9 / 1 opening on 1`);
      }
      p.run(`setLang('en')`);
    }
    /* the other chord view, and the one-file count in six */
    const six = GOOD.find(g => g.key === 'sixEight');
    p.run(`caChordModes[${JSON.stringify(six.id)}] = 'full'`);
    const hFull = p.run(`caCardBodyHtml(CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(six.id)}))`);
    p.run(`delete caChordModes[${JSON.stringify(six.id)}]`);
    const hPow = p.run(`caCardBodyHtml(CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(six.id)}))`);
    ok(/>Am<span class="tab-spkr"/.test(hFull) && !/>A5<span/.test(hFull) && /data-beat="5"/.test(hFull) && />6<\/div>/.test(hFull) && />A5<span class="tab-spkr"/.test(hPow),
      'merge sixEight: the Full chords view names Am, the Power view A5; the 6/8 grid counts 1-6 a bar');
    ok(hFull.includes(escapeHtml('Rest')) || /tab-rest-lab/.test(hFull), 'merge sixEight: its rest bar draws the rest word');
    const bm = GOOD.find(g => g.key === 'beatMap');
    ok(p.run(`JSON.stringify(snippetWindow(SNIPPET_TRACKS[${JSON.stringify(bm.id)}], { fromBar: 1, bars: 12 }, false).edges)`) === JSON.stringify(bm.doc.song.barTimes),
      'merge beatMap: the window\'s 13 bar lines are its barTimes');
    const rg = GOOD.find(g => g.key === 'range');
    ok(p.run(`(() => { const L = pcLayout(CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(rg.id)})); return L.sections.length === 2 && L.firstBar === 5 && L.totalBars === 8; })()`),
      'merge range: the card plays sections 2 to 3 only (bars 5 to 12)');
    /* The directions line names each chord once, and only the chords the card plays (review R1-2, R1-3). */
    {
      const ex = (doc, id) => p.run(`builtSongExpand(${JSON.stringify(id)}, ${JSON.stringify(doc)})`).activity;
      const bmd = JSON.parse(JSON.stringify(bm.doc)); bmd.song.chords.Em = { full: { frets: [0, 2, 2, 0, 0, 0] }, power: { frets: [0, 2, 2, null, null, null] } }; bmd.song.bars[1] = 'Em';
      const a1 = ex(bmd, bm.id);
      ok(p.run(`builtSongCheck(${JSON.stringify(bm.id)}, ${JSON.stringify(bmd)}).length`) === 0 && a1.intro === 'Play along with the band: E, Em, D and A.' && a1.intro_power === 'Play along with the band: E5, D5 and A5.' && a1.intro_power_es === 'Toca con la banda: E5, D5 y A5.',
        `directions: E and Em are one power chord, named once (${JSON.stringify(a1.intro_power)})`);
      const po = JSON.parse(JSON.stringify(GOOD.find(g => g.key === 'threeFour').doc)); po.song.chords.Am = { full: null, power: { frets: [null, 0, 2, 2, null, null] } }; po.song.bars[4] = 'Am';
      const a2 = ex(po, 'sb-test34bbbb');
      ok(a2.intro === 'Play along with the band: A5, D5 and E5.', `directions: a power-only card with A and Am names A5 once (${JSON.stringify(a2.intro)})`);
      const rd = JSON.parse(JSON.stringify(rg.doc)); rd.song.bars = rd.song.bars.map((b, i) => (i < 4 || i >= 12) ? 'Bm' : ['D', 'G', 'A', 'D'][i % 4]);
      const a3 = ex(rd, rg.id);
      ok(p.run(`builtSongCheck(${JSON.stringify(rg.id)}, ${JSON.stringify(rd)}).length`) === 0 && a3.intro === 'Play along with the band: D, G and A.' && a3.intro_es === 'Toca con la banda: D, G y A.',
        `directions: with a range, only the chords the card plays (Bm only outside it: ${JSON.stringify(a3.intro)})`);
    }
    const fx = GOOD.find(g => g.key === 'fifteen');
    const copyBytes = JSON.stringify({ id: 'all', songs: { [fx.id]: { ver: 1, doc: fx.doc } } }).length;
    ok(copyBytes > 1000 && p.run(`CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(fx.id)}).card.sections.length`) === 15, `merge fifteen: 15 sections with lyrics merge; its device copy is ${copyBytes.toLocaleString('en-US')} bytes of JSON`);
    lines.push(`  · the device copy of the 15-section fixture with lyrics: ${copyBytes.toLocaleString('en-US')} bytes (JSON); all ${GOOD.length} fixtures: ${JSON.stringify({ id: 'all', songs: Object.fromEntries(GOOD.map(g => [g.id, { ver: 1, doc: g.doc }])) }).length.toLocaleString('en-US')} bytes`);
    ok(shared.fs.st.writes === 0 && p.run('__logs.length') === 0 && p.run('__repaints') === 1, `merge: no write, no error-log line, one repaint (${shared.fs.st.writes} / ${p.run('__logs.length')} / ${p.run('__repaints')})`);
  }

  /* ── sheet: a chord sheet (song.sheet, 2026-11-18): the card gets a Lyrics view of a private pdf, read loose ── */
  {
    ok(GOOD.every(g => !base.run(`builtSongExpand(${JSON.stringify(g.id)}, ${JSON.stringify(g.doc)})`).activity.card.otherViews), `sheet: no fixture without song.sheet gets card views (${GOOD.length} of ${GOOD.length})`);
    const g = GOOD.find(x => x.key === 'fourFour'), sha = hex(77);
    const withSheet = (cols) => { const d = JSON.parse(JSON.stringify(g.doc)); d.song.sheet = { id: 'sheet-test44-' + sha.slice(0, 8), bytes: 123456, sha256: sha }; if (cols) d.song.sheet.cols = cols; return d; };
    const d1 = withSheet(), d2 = withSheet(2);
    ok(base.run(`builtSongCheck(${JSON.stringify(g.id)}, ${JSON.stringify(d1)}).length`) === 0 && base.run(`builtSongCheck(${JSON.stringify(g.id)}, ${JSON.stringify(d2)}).length`) === 0, 'sheet: a doc with song.sheet passes builtSongCheck (cols left out, and cols 2)');
    const x1 = base.run(`builtSongExpand(${JSON.stringify(g.id)}, ${JSON.stringify(d1)})`), x2 = base.run(`builtSongExpand(${JSON.stringify(g.id)}, ${JSON.stringify(d2)})`);
    ok(JSON.stringify(x1.activity.card.otherViews) === JSON.stringify({ lyrics: { sheet: 'private:' + d1.song.sheet.id, sheetRead: 'loose', sheetColumns: 1 } }) && !x1.activity.card.sheet,
      `sheet: the expansion adds one Lyrics view, private, read loose, one column (${JSON.stringify(x1.activity.card.otherViews)})`);
    ok(JSON.stringify(x2.activity.card.otherViews.lyrics) === JSON.stringify({ sheet: 'private:' + d2.song.sheet.id, sheetRead: 'loose' }), 'sheet: cols 2 reads two columns (no sheetColumns)');
    ok(JSON.stringify(x1.sheet) === JSON.stringify({ file: d1.song.sheet.id + '.pdf', bytes: 123456, sha256: sha, durationSec: 1 }), 'sheet: and a song-file entry for the pdf (.pdf, its bytes and SHA-256)');
    const shared = { fs: makeFirestore(), idb: makeIdb(new Map()) };
    publish(shared.fs, [{ id: g.id, doc: d1 }, ...GOOD.filter(x => x.id !== g.id)]);
    const p = makePage(files, shared);
    p.signIn(); await sync(p);
    const r = p.run(`(() => { const id = ${JSON.stringify(g.id)}; const a = CLASS_ACTIVITIES.find(x => x.id === id);
      const out = { has: !!a, list: a && caCardViewList(a).join(','), own: a && caCardViewMode(a), entry: songFileEntry(${JSON.stringify(d1.song.sheet.id)}), audio: songFileEntry(${JSON.stringify(d1.audio.id)}) };
      const sw = caCardBodyHtml(a); out.buttons = (sw.match(/data-view="/g) || []).length; out.chordsFirst = /data-view="chords"[^>]*>[^<]*<\\/button><button[^>]*data-view="lyrics"/.test(sw);
      caCardViewModes[id] = 'lyrics';
      const v = caView(a), L = pcLayout(v);
      out.viewSheet = v.card.sheet; out.viewRead = v.card.sheetRead; out.viewCols = v.card.sheetColumns; out.sameSecs = L && L.sections.length === pcLayout(a).sections.length;
      const h = caCardBodyHtml(a); out.sheetHtml = h.includes('class="pc-sheet" data-sheet="private:' + ${JSON.stringify(d1.song.sheet.id)} + '"');
      setLang('es'); out.esSheet = caCardBodyHtml(a).includes('data-sheet="private:'); setLang('en');
      delete caCardViewModes[id];
      return out; })()`);
    ok(r.has && r.list === 'chords,lyrics' && r.own === 'chords' && r.buttons === 2 && r.chordsFirst, `sheet: merged, the card offers Chords / Lyrics, opens on Chords (${r.list}, ${r.buttons} buttons)`);
    ok(r.entry && r.entry.file === d1.song.sheet.id + '.pdf' && r.entry.bytes === 123456 && r.entry.sha256 === sha && r.audio && r.audio.sha256 === d1.audio.sha256, 'sheet: the merge hands the pdf\'s entry to app/songfiles.js beside the audio\'s');
    ok(r.viewSheet === 'private:' + d1.song.sheet.id && r.viewRead === 'loose' && r.viewCols === 1 && r.sameSecs && r.sheetHtml && r.esSheet, 'sheet: in Lyrics the card draws the private sheet, read loose, over the same sections (EN and ES)');
    /* The sheet's id is checked as the audio's is: not on SONG_FILES, not another song's file with other bytes. */
    const listed = Object.keys(base.run('SONG_FILES'))[0];
    const d3 = withSheet(); d3.song.sheet.id = listed;
    const g2 = GOOD.find(x => x.key === 'threeFour'), d4 = withSheet(); d4.song.sheet.id = g2.doc.audio.id;
    const sh2 = { fs: makeFirestore(), idb: makeIdb(new Map()) };
    publish(sh2.fs, [{ id: g.id, doc: d3 }, g2]);
    const p2 = makePage(files, sh2); p2.signIn(); await sync(p2);
    const sh3 = { fs: makeFirestore(), idb: makeIdb(new Map()) };
    publish(sh3.fs, [{ id: g.id, doc: d4 }, g2]);
    const p3 = makePage(files, sh3); p3.signIn(); await sync(p3);
    ok(!p2.run(`CLASS_ACTIVITIES.some(a => a.id === ${JSON.stringify(g.id)})`) && p2.run(`CLASS_ACTIVITIES.some(a => a.id === ${JSON.stringify(g2.id)})`)
      && !p3.run(`CLASS_ACTIVITIES.some(a => a.id === ${JSON.stringify(g.id)})`) && p3.run(`CLASS_ACTIVITIES.some(a => a.id === ${JSON.stringify(g2.id)})`),
      'sheet: a sheet id on SONG_FILES, or another built song\'s audio id with other bytes, leaves that song out alone');
  }

  /* ── capo: song.capo (2026-11-20, Sailor Song at capo 4): shapes as played, the line says where the capo goes ── */
  {
    const g = GOOD.find(x => x.key === 'fourFour'), sx = GOOD.find(x => x.key === 'sixEight');
    const withCapo = (src, c) => { const d = JSON.parse(JSON.stringify(src.doc)); d.song.capo = c; return d; };
    const run = (id, d, what) => base.run(`(() => { const x = builtSongExpand(${JSON.stringify(id)}, ${JSON.stringify(d)}); return ${what}; })()`);
    const d4 = withCapo(g, 4), d6 = withCapo(sx, 2);
    ok(base.run(`builtSongCheck(${JSON.stringify(g.id)}, ${JSON.stringify(d4)}).length`) === 0 && base.run(`builtSongCheck(${JSON.stringify(sx.id)}, ${JSON.stringify(d6)}).length`) === 0, 'capo: a doc with song.capo 4 (full only) and 2 (both versions) passes builtSongCheck');
    const bad = [0, 10, 2.5, '4', null, -1].filter(c => base.run(`builtSongCheck(${JSON.stringify(g.id)}, ${JSON.stringify(withCapo(g, c))}).some(w => /song\.capo/.test(w))`));
    ok(bad.length === 6, `capo: 0, 10, 2.5, "4", null and -1 are refused with the capo reason (${bad.length} of 6)`);
    const en = run(g.id, d4, 'x.activity.intro'), es = run(g.id, d4, 'x.activity.intro_es');
    ok(en === 'Put a capo on fret 4 and play along with the band: G, C, D and Em.' && es === 'Pon el capo en el traste 4 y toca con la banda: G, C, D y Em.', `capo: the directions say where the capo goes, then the chords as played (${en} / ${es})`);
    const pe = run(sx.id, d6, 'x.activity.intro_power'), pes = run(sx.id, d6, 'x.activity.intro_power_es');
    ok(/^Put a capo on fret 2 and /.test(pe) && /^Pon el capo en el traste 2 y /.test(pes), `capo: the power-chord line says it too (${pe} / ${pes})`);
    const plain = run(g.id, g.doc, 'x.activity.card.sections[0].notes[0]'), capoed = run(g.id, d4, 'x.activity.card.sections[0].notes[0]');
    ok(JSON.stringify(plain.frets) === JSON.stringify(capoed.frets) && plain.note === capoed.note && capoed.midi.length === plain.midi.length && capoed.midi.every((m, i) => m === plain.midi[i] + 4),
      `capo: a chord is drawn as written (${capoed.note} ${JSON.stringify(capoed.frets)}) and sounds 4 half steps higher (${JSON.stringify(plain.midi)} → ${JSON.stringify(capoed.midi)})`);
    const pv = run(sx.id, d6, 'x.activity.chordVersions.power.Am'), pv0 = run(sx.id, sx.doc, 'x.activity.chordVersions.power.Am');
    ok(pv.midi.every((m, i) => m === pv0.midi[i] + 2) && JSON.stringify(pv.frets) === JSON.stringify(pv0.frets), 'capo: the power-chord shapes sound higher by the capo too, drawn as written');
    ok(GOOD.every(x => !/[Cc]apo/.test(run(x.id, x.doc, 'x.activity.intro + x.activity.intro_es'))), `capo: no fixture without song.capo says Capo (${GOOD.length} of ${GOOD.length})`);
    const short = base.run(`bsIntro(['G','C','D','Em','Am','A','E','F','Bm','Dm','B','Bb','C#m','F#m','G#m','D#m','A#m'], 'en', 3)`);
    ok(short === 'Put a capo on fret 3 and play along, one part at a time.' && base.run(`bsIntro([], 'es', 3)`) === 'Pon el capo en el traste 3 y toca una parte a la vez.', `capo: a line too long for one row falls back to the short one, still with the capo (${short})`);
  }

  /* ── refused: one broken doc per rule, each left out alone ── */
  {
    const good = GOOD.find(g => g.key === 'fourFour');
    const broken = brokenFixtures({ id: good.id, doc: good.doc });
    const shared = { fs: makeFirestore(), idb: makeIdb(new Map()) };
    publish(shared.fs, [...GOOD, ...broken]);
    const p = makePage(files, shared);
    p.signIn(); await sync(p);
    const ids = new Set(p.run('CLASS_ACTIVITIES.map(a => a.id)'));
    for (const b of broken) ok(!ids.has(b.id) && !p.run(`!!SNIPPET_TRACKS[${JSON.stringify(b.id)}]`), `refused alone: ${b.rule}`);
    ok(GOOD.every(g => ids.has(g.id)), `refused: the ${GOOD.length} good songs still merge beside ${broken.length} broken ones`);
    ok(p.run('__logs.length') === 1 && !/stub-uid|test0@|Test 0/.test(p.run('__logs[0]')), `refused: one error-log line for the page (${p.run('__logs.length')}), with no account in it`);
  }

  /* ── store ── */
  const fresh = () => ({ fs: makeFirestore(), idb: makeIdb(new Map()) });
  const g1 = GOOD[0], g2 = GOOD[1];
  {
    const shared = fresh(); publish(shared.fs, [g1, g2]);
    const p1 = makePage(files, shared); p1.signIn(); await sync(p1);
    shared.fs.st.offline = true; shared.fs.st.reads = [];
    const p2 = makePage(files, shared); p2.signIn(); await sync(p2);
    ok(p2.run(`[${JSON.stringify(g1.id)}, ${JSON.stringify(g2.id)}].every(id => CLASS_ACTIVITIES.some(a => a.id === id) && SNIPPET_TRACKS[id])`), 'store: offline, a new page merges the device copy');
    const p3 = makePage(files, shared); await sync(p3);
    ok(!p3.run(`CLASS_ACTIVITIES.some(a => /^sb-/.test(a.id))`), 'store: signed out, nothing merges, not even from the device copy');
    shared.fs.st.offline = false; shared.fs.st.denyAll = true;
    const p4 = makePage(files, shared); p4.signIn(); await sync(p4);
    ok(!p4.run(`CLASS_ACTIVITIES.some(a => /^sb-/.test(a.id))`) && p4.run('__logs.length') === 0, 'store: the list refused, nothing merges even with a device copy, and nothing is logged');
    shared.fs.st.denyAll = false; shared.fs.st.reads = [];
    const p5 = makePage(files, shared); p5.signIn(); await sync(p5);
    ok(!shared.fs.st.reads.some(r => r.startsWith('builtSongs/')) && p5.run(`CLASS_ACTIVITIES.filter(a => /^sb-/.test(a.id)).length`) === 2, `store: the same edit numbers: the songs come from the device copy, no song doc read (${shared.fs.st.reads.length} read)`);
    const changed = JSON.parse(JSON.stringify(g1.doc)); changed.title = 'Test Song Four, edited';
    shared.fs.docs.set('builtSongs/' + g1.id, changed);
    shared.fs.docs.set('builtSongsMeta/list', { songs: { [g1.id]: 2, [g2.id]: 1 } });
    shared.fs.st.reads = [];
    const p6 = makePage(files, shared); p6.signIn(); await sync(p6);
    ok(shared.fs.st.reads.includes('builtSongs/' + g1.id) && !shared.fs.st.reads.includes('builtSongs/' + g2.id) && p6.run(`caTitle(CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(g1.id)}))`).includes('edited'),
      'store: a newer edit is read again and replaces the device copy\'s; the unchanged song is not read');
    shared.fs.st.offline = true;
    const p7 = makePage(files, shared); p7.signIn(); await sync(p7);
    ok(p7.run(`caTitle(CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(g1.id)}))`).includes('edited'), 'store: offline afterwards, the device copy holds the newer edit');
    shared.fs.st.offline = false;
    /* taken off the list: gone from the page, with its audio entry */
    shared.fs.docs.set('builtSongsMeta/list', { songs: { [g2.id]: 1 } });
    const rp = p6.run('__repaints');
    await p6.run('builtSongsSync()'); await settle();
    ok(!p6.run(`CLASS_ACTIVITIES.some(a => a.id === ${JSON.stringify(g1.id)}) || !!SNIPPET_TRACKS[${JSON.stringify(g1.id)}] || !!songFileEntry(${JSON.stringify(g1.doc.audio.id)})`) && p6.run('__repaints') === rp + 1,
      'store: a song taken off the list leaves the page (card, track and audio entry), with one repaint');
    await p6.run('builtSongsSync()'); await settle();
    ok(p6.run('__repaints') === rp + 1, 'store: a merge that changes nothing repaints nothing');
    p6.run('builtSongsClear()');
    ok(snap(p6) === snap(makePage(files)), 'store: sign-out clears every built entry: CLASS_ACTIVITIES and SNIPPET_TRACKS deep-equal a page with none');
  }
  /* ── "Date added" (2026-11-23): the day of savedAt rides beside the doc, into the activity and the device copy ── */
  {
    const idbMap = new Map();
    const shared = { fs: makeFirestore(), idb: makeIdb(idbMap) }; publish(shared.fs, [g1, g2]);
    const at = new Date(2026, 10, 21, 23, 30);          // late evening, this computer's calendar: still the 21st
    shared.fs.docs.set('builtSongs/' + g1.id, Object.assign({}, g1.doc, { savedAt: { toDate: () => new Date(at.getTime()) } }));
    const addedOf = (p, id) => p.run(`(CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(id)}) || {}).added`);
    const p1 = makePage(files, shared); p1.signIn(); await sync(p1);
    ok(addedOf(p1, g1.id) === '2026-11-21' && addedOf(p1, g2.id) === undefined, `date added: a song gets the day of its savedAt (${addedOf(p1, g1.id)}); one with no savedAt gets none (the Songs page's default)`);
    ok(p1.run(`builtSongCheck(${JSON.stringify(g1.id)}, ${JSON.stringify(g1.doc)}).length`) === 0 && !p1.run(`'added' in builtSongExpand(${JSON.stringify(g1.id)}, ${JSON.stringify(g1.doc)}).activity`), 'date added: the doc format is unchanged (the validator and the expansion know nothing of it)');
    shared.fs.st.offline = true;
    const p2 = makePage(files, shared); p2.signIn(); await sync(p2);
    ok(addedOf(p2, g1.id) === '2026-11-21', 'date added: offline, the device copy keeps the day');
    shared.fs.st.offline = false; shared.fs.st.reads = [];
    const p3 = makePage(files, shared); p3.signIn(); await sync(p3);
    ok(!shared.fs.st.reads.some(r => r.startsWith('builtSongs/')) && addedOf(p3, g1.id) === '2026-11-21', `date added: the same edit numbers: the day comes from the device copy, no song doc read (${shared.fs.st.reads.length} read)`);
    /* A device copy written before "Date added" (no `added`): each song is read again once, then dated. */
    const rec = idbMap.get('gc-built-songs').get('songs').rows.get('all');
    Object.values(rec.songs).forEach(s => { delete s.added; });
    shared.fs.st.reads = [];
    const p4 = makePage(files, shared); p4.signIn(); await sync(p4);
    const songReads = shared.fs.st.reads.filter(r => r.startsWith('builtSongs/')).length;
    ok(songReads === 2 && addedOf(p4, g1.id) === '2026-11-21', `date added: an older device copy is read again once for the day (${songReads} of 2 song docs read)`);
    shared.fs.st.reads = [];
    const p5 = makePage(files, shared); p5.signIn(); await sync(p5);
    ok(!shared.fs.st.reads.some(r => r.startsWith('builtSongs/')), 'date added: and not again after that (the copy now holds the day, or "" for none)');
    /* The day changes on the page: a merge with the same edit number but a newly known day replaces the activity. */
    const p6 = makePage(files, shared); p6.signIn();
    shared.fs.st.offline = true; idbMap.get('gc-built-songs').get('songs').rows.get('all').songs[g1.id].added = '';
    await sync(p6);
    const before = addedOf(p6, g1.id);
    shared.fs.st.offline = false;
    idbMap.get('gc-built-songs').get('songs').rows.get('all').songs[g1.id].added = undefined;
    await sync(p6);
    ok(before === undefined && addedOf(p6, g1.id) === '2026-11-21', `date added: a later merge that learns the day puts it on the page (${before} → ${addedOf(p6, g1.id)})`);
  }
  {
    const shared = fresh(); publish(shared.fs, [g1, g2]);
    shared.fs.docs.delete('builtSongs/' + g2.id);
    shared.fs.docs.set('builtSongsMeta/list', { songs: { [g1.id]: 1, [g2.id]: 1, 'SB-CAPITALS1': 1, 'sb-short': 1, 'sb-stringver1': '2', 'sb-zeroverss': 0, 'sb-floatvers': 1.5, 'sb-nodocatall': 3 } });
    const p = makePage(files, shared); p.signIn(); await sync(p);
    const reads = shared.fs.st.reads.filter(r => r.startsWith('builtSongs/'));
    ok(p.run(`CLASS_ACTIVITIES.filter(a => /^sb-/.test(a.id)).map(a => a.id).join()`) === g1.id && reads.length === 3 && !reads.some(r => /CAPITALS|short|stringver|zeroverss|floatvers/.test(r)),
      `store: a listed song whose doc is missing is skipped; the list's bad keys and values are never read (${reads.length} doc reads)`);
  }
  {
    const shared = fresh(); publish(shared.fs, [g1, g2]);
    const p1 = makePage(files, shared); p1.signIn(); await sync(p1);
    shared.fs.docs.set('builtSongsMeta/list', { songs: { [g1.id]: 2, [g2.id]: 2 } });
    shared.fs.st.deny.add('builtSongs/' + g1.id);
    shared.fs.docs.delete('builtSongs/' + g2.id);
    const p2 = makePage(files, shared); p2.signIn(); await sync(p2);
    ok(!p2.run(`CLASS_ACTIVITIES.some(a => /^sb-/.test(a.id))`), 'store: a song doc read refused, or missing, at a newer edit: left out (the older device copy is not used)');
  }
  {
    const shared = fresh(); publish(shared.fs, [g1, g2]);
    const p1 = makePage(files, shared); p1.signIn(); await sync(p1);
    publish(shared.fs, [g1, g2], { [g1.id]: 3, [g2.id]: 3 });
    const pOff = makePage(files, shared); pOff.signIn();
    const fsOff = shared.fs.db.collection;
    pOff.ctx.__fdb = { collection: n => n === 'builtSongs' ? { doc: id => ({ get: async () => { const e = new Error('unavailable'); e.code = 'unavailable'; throw e; } }) } : fsOff(n) };
    pOff.run('ensureDb = async () => __fdb');
    await sync(pOff);
    ok(pOff.run(`CLASS_ACTIVITIES.filter(a => /^sb-/.test(a.id)).length`) === 2, 'store: a song doc read that fails (not refused) keeps the device copy\'s older version');
  }
  {
    const shared = fresh();
    const clash = JSON.parse(JSON.stringify(g2.doc)); clash.audio.id = g1.doc.audio.id;
    const listed = { id: 'sb-listedaudio', doc: JSON.parse(JSON.stringify(g2.doc)) }; listed.doc.audio.id = 'listed-song-file';
    const coded = { id: 'sb-codedtrack1', doc: JSON.parse(JSON.stringify(g2.doc)) }; coded.doc.audio.id = 'coded-track-audio';
    publish(shared.fs, [g1, { id: 'sb-zzlaterclash', doc: clash }, listed, coded]);
    const p = makePage(files, shared); p.signIn();
    p.run(`SONG_FILES['listed-song-file'] = { file: 'x.mp3', bytes: 7, sha256: '${hex(7)}', durationSec: 9 }; SNIPPET_TRACKS['sb-codedtrack1'] = { src: 'audio/x.mp3' };`);
    await sync(p);
    const ids = p.run(`CLASS_ACTIVITIES.filter(a => /^sb-/.test(a.id)).map(a => a.id).join()`);
    ok(ids === g1.id, `store: refused — an audio id another built song uses with other bytes, an audio id on SONG_FILES, an id already a coded track (kept: ${ids})`);
    ok(p.run(`songFileEntry('listed-song-file').bytes === 7 && SNIPPET_TRACKS['sb-codedtrack1'].src === 'audio/x.mp3'`), 'store: the tracked list keeps its entry, and the coded track is untouched');
    p.run(`sfBuilt = {}; songFilesSetBuilt({ 'listed-song-file': { file: 'y.mp3', bytes: 8, sha256: '${hex(8)}', durationSec: 1 } })`);
    ok(p.run(`songFileEntry('listed-song-file').bytes === 7 && !('listed-song-file' in sfBuilt)`), 'store: songFilesSetBuilt never takes an id the list has');
  }
  {
    const shared = fresh(); publish(shared.fs, [g1]);
    const p = makePage(files, shared); p.signIn(); await sync(p);
    p.run(`sfUrls.set(${JSON.stringify(g1.doc.audio.id)}, 'blob:old')`);
    const d = JSON.parse(JSON.stringify(g1.doc)); d.audio.sha256 = hex(55);
    shared.fs.docs.set('builtSongs/' + g1.id, d); shared.fs.docs.set('builtSongsMeta/list', { songs: { [g1.id]: 2 } });
    await sync(p);
    ok(!p.run(`sfUrls.has(${JSON.stringify(g1.doc.audio.id)})`), 'store: a re-imported file under the same audio id drops the page\'s loaded copy of the old bytes');
    p.run(`hiddenActivityIds[${JSON.stringify(g1.id)}] = true`);
    ok(!p.run(`caIsLibrarySong(CLASS_ACTIVITIES.find(a => a.id === ${JSON.stringify(g1.id)}))`) && !p.run('songsLibraryHtml()').includes(g1.id), 'store: Hidden (config/class.hiddenActivities) takes it off the Songs list');
  }
  {
    const shared = fresh(); publish(shared.fs, [g1]);
    const p = makePage(files, shared); p.signIn();
    let ran = 0; p.ctx.__ran = () => { ran++; };
    p.run(`location.hash = '#class-activities/${g1.id}'`);
    ok(!p.run(`builtSongWait(${JSON.stringify(g1.id)}, __ran)`), 'deep link: with no merge on its way, builtSongWait says no (the usual not-posted path)');
    const pr = p.run('builtSongsSync()');
    const waiting = p.run(`builtSongWait(${JSON.stringify(g1.id)}, () => __ran(CLASS_ACTIVITIES.some(a => a.id === ${JSON.stringify(g1.id)})))`);
    await pr; await settle();
    ok(waiting && ran === 1, 'deep link: a link to a built song that comes before the merge waits, and runs once after it, with the song on the page');
    const pr2 = p.run('builtSongsSync()');
    p.run(`builtSongWait(${JSON.stringify(g1.id)}, __ran)`);
    p.run(`location.hash = '#songs'`);
    await pr2; await settle();
    ok(ran === 1, 'deep link: a student who moved on meanwhile is not taken to the card');
  }
  {
    /* The tab-return throttle (BS_RETURN_MS, 15 minutes), on the page's own clock. */
    const shared = fresh(); publish(shared.fs, [g1]);
    const p = makePage(files, shared); p.signIn();
    p.ctx.__now = 1e12; p.run('Date.now = () => __now');
    const metaReads = () => shared.fs.st.reads.filter(r => r === 'builtSongsMeta/list').length;
    const ret = async min => { p.ctx.__now = 1e12 + min * 60000; p.run('builtSongsSyncSoon()'); await p.run('bsPending || Promise.resolve()'); await settle(); };
    await sync(p);
    await ret(1); await ret(14);
    ok(metaReads() === 1, `tab return: the sign-in read, then two tab returns inside 15 minutes: 1 read of the list (${metaReads()})`);
    await ret(15.1);
    ok(metaReads() === 2, `tab return: one after 15 minutes: 2 reads (${metaReads()})`);
    shared.fs.st.denyAll = true;
    await ret(31);
    const afterDenied = metaReads();
    await ret(40);
    ok(afterDenied === 3 && metaReads() === 3, `tab return: a refused read starts the clock too (one at 31 min refused, none at 40: ${afterDenied}, then ${metaReads()})`);
    shared.fs.st.denyAll = false; shared.fs.st.offline = true;
    await ret(47);
    await ret(48);
    ok(metaReads() === 5, `tab return: a failed (offline) read does not start the clock: the next tab return tries again (${metaReads()})`);
    shared.fs.st.offline = false;
  }
  {
    for (const [name, o] of [['an IndexedDB whose open throws', { throws: true }], ['an IndexedDB that never answers', { never: true }], ['a full IndexedDB', { quota: true }]]) {
      const shared = { fs: makeFirestore(), idb: makeIdb(new Map(), o) }; publish(shared.fs, [g1]);
      const p = makePage(files, shared); p.signIn();
      const t0 = Date.now(); await p.run('builtSongsSync()'); await settle();
      ok(p.run(`CLASS_ACTIVITIES.some(a => a.id === ${JSON.stringify(g1.id)})`), `store: ${name}: the song still merges (${Date.now() - t0} ms)`);
    }
    /* Review R1-6 (2026-11-25): a connection nobody will use is closed (an open one blocks the next version upgrade). */
    for (const [name, o] of [['an open answered "blocked" that goes through later', { blocked: true }], ['a transaction that throws', { txThrows: true }]]) {
      const shared = { fs: makeFirestore(), idb: makeIdb(new Map(), o) }; publish(shared.fs, [g1]);
      const p = makePage(files, shared); p.signIn();
      await p.run('builtSongsSync()'); await settle(); await new Promise(r => setTimeout(r, 50));
      ok(p.run(`CLASS_ACTIVITIES.some(a => a.id === ${JSON.stringify(g1.id)})`) && o.opened > 0 && o.closed === o.opened, `store: ${name}: the song still merges, and every connection is closed (${o.closed || 0} of ${o.opened || 0})`);
    }
  }
  return { cases, fails, lines };
}
function escapeHtml(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

/* Every coded practice card, both languages, every chord view: the HTML, for --against. */
function codedRenders(root){
  const p = makePage(siteFiles(root));
  return p.run(`(() => { const out = {}; for (const lang of ['en', 'es']) { setLang(lang); for (const a of CLASS_ACTIVITIES) { if (a.view !== 'card' || !a.card) continue;
    for (const m of ['full', 'power']) { caChordModes[a.id] = m; out[lang + '|' + a.id + '|' + m] = caCardBodyHtml(a); } delete caChordModes[a.id]; } } return out; })()`);
}

async function main(){
  /* The watchdog guards ONE run of the cases (5 minutes); --breaks re-arms it for each planted fault, so a long list
     of breaks on a busy machine is not mistaken for a hang (it was, at 28 breaks, 2026-11-15). */
  let watchdog = null;
  const arm = () => { clearTimeout(watchdog); watchdog = setTimeout(() => { console.log('built-songs-sim: ✗ HUNG (5 minutes in one run of the cases)'); process.exit(3); }, 300000); watchdog.unref(); };
  arm();
  const files = siteFiles(ROOT);
  let res;
  try { res = await runCases(files); }
  catch (e) { console.log('built-songs-sim: the code would not run: ' + (e && e.stack || e)); return 1; }
  for (const l of res.lines) console.log(l);
  console.log(`built-songs-sim: ${res.cases} cases, ${res.fails} failed`);
  let bad = res.fails ? 1 : 0;
  if (AGAINST) {
    const a = codedRenders(ROOT), b = codedRenders(AGAINST);
    const keys = Object.keys(b), diff = keys.filter(k => a[k] !== b[k]);
    const same = !diff.length && Object.keys(a).length === keys.length;
    console.log(`${same ? '✓' : '✗'} against ${AGAINST}: ${keys.length - diff.length} of ${keys.length} coded card renders (2 languages x 2 chord views) byte for byte the same${diff.length ? '; differ: ' + diff.slice(0, 5).join(', ') : ''}`);
    if (!same) bad = 1;
  }
  if (BREAKS) {
    const MUT = [
      ['app/builtsongs.js', 'a meter looked up without the own-property test', "function bsMeter(m){ return bsOwn(BS_METERS, m) ? BS_METERS[m] : null; }", "function bsMeter(m){ return BS_METERS[m] || null; }"],
      ['app/builtsongs.js', 'the lyric-line cap raised to 10000', "BS_MAX_LYRIC = 160", "BS_MAX_LYRIC = 10000"],
      ['app/builtsongs.js', 'a power chord named twice in the directions', "powerNames = [...new Set(used.map(n => bsChordName(n).q === '5' ? n : bsPowerName(n)))];", "powerNames = used.map(n => bsChordName(n).q === '5' ? n : bsPowerName(n));"],
      ['app/builtsongs.js', 'the directions name chords from outside the range', "  const parts = s.bars.map(b => bsBarParts(b, meter, s.chords));", "  const parts = s.bars.map(b => { const p = bsBarParts(b, meter, s.chords); p.forEach(x => { if(x.name && !used.includes(x.name)) used.push(x.name); }); return p; });"],
      ['app/builtsongs.js', 'the cents rule dropped', "Math.abs(a.centsOff) > BS_MAX_CENTS", "Math.abs(a.centsOff) > 99"],
      ['app/builtsongs.js', 'the title separator not refused', "else if(doc.title.indexOf(BS_SEP) >= 0)", "else if(false)"],
      ['app/builtsongs.js', 'a section gap allowed', "if(x.from !== next) no(", "if(false) no("],
      ['app/builtsongs.js', 'a bar\'s beats not added up', "if(Math.abs(sum - meter.bpb) > 1e-6) return", "if(false) return"],
      ['app/builtsongs.js', 'unknown chart fields allowed', "if(sx.length) no(", "if(false) no("],
      ['app/builtsongs.js', 'the old entries not removed on a merge', "for(let i = list.length - 1; i >= 0; i--) if(list[i] && bsApplied.has(list[i].id)) list.splice(i, 1);", ""],
      ['app/builtsongs.js', 'a refused list read treated as offline (the device copy used)', "if(bsDenied(e)){ list = {}; denied = true; bsLastRead = Date.now(); }", "if(false){ list = {}; denied = true; bsLastRead = Date.now(); }"],
      ['app/builtsongs.js', 'a refused list read wipes the device copy', "if(!teacher && !denied){", "if(!teacher){"],
      ['app/builtsongs.js', 'the device copy used signed out', "if(!user){ if(bsApply([])) bsRepaint(); return; }", "if(false){ }"],
      ['app/builtsongs.js', 'the list\'s keys not checked', "if(BS_ID_RE.test(k) && bsInt(v) && v >= 1", "if(bsInt(v) && v >= 1"],
      ['app/builtsongs.js', 'an extra song made required', "id, view: 'card', library: true, optional: true,", "id, view: 'card', library: true, optional: false,"],
      ['app/builtsongs.js', 'the same edit read again', "if(have && have.ver === list[id] && bsIsObj(have.doc)){", "if(false){"],
      ['app/builtsongs.js', 'every refusal logged', "if(bsLogged) return;\n  bsLogged = true;", "bsLogged = true;"],
      ['app/builtsongs.js', 'an audio (or sheet) id on SONG_FILES kept', "if(typeof SONG_FILES !== 'undefined' && Object.prototype.hasOwnProperty.call(SONG_FILES, fid)){ why.push(", "if(false){ why.push("],
      /* song.sheet (2026-11-18): a chord sheet pdf in the song-file store, the card's Lyrics view. */
      /* song.capo (2026-11-20). */
      ['app/builtsongs.js', 'song.capo not checked', "if(s.capo !== undefined && (!bsInt(s.capo)", "if(false && (!bsInt(s.capo)"],
      ['app/builtsongs.js', 'the capo left out of the directions', "intro: bsIntro(shown, 'en', capo), intro_es: bsIntro(shown, 'es', capo),", "intro: bsIntro(shown, 'en'), intro_es: bsIntro(shown, 'es'),"],
      ['app/builtsongs.js', 'a capo chord sounds as written', "midi.push(BS_OPEN_MIDI[i] + f[i] + up);", "midi.push(BS_OPEN_MIDI[i] + f[i]);"],
      ['app/builtsongs.js', 'song.capo refused as an unknown field', "'level', 'range', 'sheet', 'capo']);", "'level', 'range', 'sheet']);"],
      ['app/builtsongs.js', 'song.sheet not checked', "  if(s.sheet !== undefined){\n    const sh = s.sheet;", "  if(false){\n    const sh = s.sheet;"],
      ['app/builtsongs.js', 'a sheet id that is the audio id allowed', "else if(bsIsObj(a) && sh.id === a.id) no(", "else if(false) no("],
      ['app/builtsongs.js', 'no Lyrics view made from song.sheet', "    act.card.otherViews = { lyrics };\n", ""],
      ['app/builtsongs.js', 'cols 2 read as one column', "if(s.sheet.cols !== 2) lyrics.sheetColumns = 1;", "lyrics.sheetColumns = 1;"],
      ['app/builtsongs.js', 'the sheet\'s file not handed to the song-file loader', " if(k.ex.sheet) audio[k.doc.song.sheet.id] = k.ex.sheet;", ""],
      ['app/builtsongs.js', 'a file id another built song uses with other bytes kept', "if(audioSha.has(fid) && audioSha.get(fid) !== sha){", "if(false){"],
      ['app/builtsongs.js', 'a repaint with no change', "if(sig === bsSig) return false;", ""],
      ['app/builtsongs.js', 'the tab-return throttle dropped', "  if(Date.now() - bsLastRead < BS_RETURN_MS) return;\n", ""],
      ['app/builtsongs.js', 'a refused read does not start the throttle\'s clock', "if(bsDenied(e)){ list = {}; denied = true; bsLastRead = Date.now(); }", "if(bsDenied(e)){ list = {}; denied = true; }"],
      ['app/builtsongs.js', 'R1-6: a connection that opens after the answer was "none" is left open', "else if(conn){ try { conn.close(); } catch(e) {} }", ""],
      ['app/builtsongs.js', 'R1-6: a transaction that throws leaves its connection open', "catch(e){ try { db.close(); } catch(e2) {} resolve(null); }", "catch(e){ resolve(null); }"],
      ['app/builtsongs.js', 'a deep link that never waits', "if(typeof id !== 'string' || !BS_ID_RE.test(id) || !bsPending) return false;", "return false;"],
      ['app/cards.js', 'one-file stops at the two-file rates', "const PC_ONE_FILE_RATES = [0.65, 0.85, 0.9, 1];", "const PC_ONE_FILE_RATES = [0.8, 1, 0.9, 1];"],
      ['app/cards.js', 'a one-file card opening on the slow file', " data-slow=\"\" data-rate=\"${PC_ONE_FILE_RATES[1]}\"", " data-slow=\"1\""],
      ['app/cards.js', 'a coded card given one-file stops', "function pcOneFile(tr){ return !!tr && !tr.srcSlow; }", "function pcOneFile(tr){ return !!tr; }"],
      ['app/activities-2.js', 'songLibrary moves a built song', "  if(isBuiltSongId(a.id)) return a.library === true;\n", ""],
      ['app/songfiles.js', 'the built map takes a listed id', "if(!Object.prototype.hasOwnProperty.call(SONG_FILES, id)) next[id] = map[id];", "next[id] = map[id];"],
      ['app/songfiles.js', 'a changed file keeps the old copy', "      sfUrls.delete(id);\n", "\n"],
    ];
    let caught = 0;
    for (const [file, name, from, to] of MUT) {
      const i = files.findIndex(([f]) => f === file);
      const n = i < 0 ? 0 : files[i][1].split(from).length - 1;
      if (n !== 1) { console.log(`  ✗ break "${name}": its text is in ${file} ${n} times (must be once)`); continue; }
      const copy = files.map(([f, s], j) => [f, j === i ? s.replace(from, to) : s]);
      let r;
      arm();
      try { r = await runCases(copy); } catch (e) { r = { fails: 1 }; }
      if (r.fails > 0) { caught++; console.log(`  ✓ break caught: ${name} (${r.fails} red)`); }
      else console.log(`  ✗ break NOT caught: ${name}`);
    }
    console.log(`${caught === MUT.length ? '✓' : '✗'} ${caught} of ${MUT.length} breaks caught`);
    if (caught !== MUT.length) bad = 1;
  }
  return bad;
}
process.exit(await main());
