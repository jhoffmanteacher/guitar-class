#!/usr/bin/env node
/* The update reload lands where you were: a closed loop (2026-11-11).

   When a new version of the site takes over, an open tab reloads itself once
   (app/start.js, the service-worker block) and the next load puts the student
   or the teacher back where they were (app/boot.js, "Back where you were after
   an update (2026-11-09)": swResumeSave / swResumeTake / swResumeApply /
   swResumeScroll / swResumeWatch; teacher-core.js: teacherResumeSnapshot /
   teacherResumeApply). Nothing checked that end to end. This tool does it with
   a REAL service worker in headless Chrome:

     the tool's own server serves "the site" from a folder it can switch;
     version 1 = the site; version 2 = the same site with one visible string
     changed (i18n.js 'auth.updating' gets " [v2]") and `node tools/checks.mjs
     --skip-links` run in that copy, which writes the new CACHE_VERSION.

   One case = a fresh Chrome profile → load version 1 → wait until the worker
   controls the page and every file sw.js ASSETS lists (that the folder has) is
   in its cache (the gc-precache-rest round is over); that first visit must not
   have reloaded itself (start.js hadController: checked in every case, one
   navigation committed and none asked for) → load again, so the page is
   CONTROLLED WHEN IT LOADED, as a returning student's is → sign in (dev
   bypass, or the console on the stub Firestore of
   tools/console-layout-smoke.mjs) → go to a place by clicking → record it →
   switch the server to version 2 → registration.update(), as a visit does →
   wait for the page's OWN reload (the tool never navigates) → sign in again
   (that call is "the first sign-in of the load") → wait 10 s (longer than the
   restore's own 8 s) → read where the page is.

   What "the same place" is, measured from the DOM, not from the code under
   test: the address; the active set panel's data-id, its checklist / peek
   state and its view (one step / all steps); the open steps' data-keys; the
   open fold panels' ids; which in-column page is showing; the open In class
   card; the scroll (the lesson: where the row being read sits in the pane,
   in px; the other pages: the pane's scrollTop); the language. The console:
   the lit sidebar view, the pressed list filter, the picked activity (the lit
   list row), its tab, Arrange board, the picked student, the window scroll.
     - The lesson row: after the reload the test page makes the lesson box
       49 px taller above its rows (a style it adds, in the cases that compare
       the row), so a restore by plain scrollTop shows as a 49 px row Δ; the
       row restore moves the pane by 49 px and the row by 0.
     - deep-link: the browser keeps the address across a reload and the router
       opens the card from it, so only the scroll depends on the note; the case
       picks a card whose page scrolls more than 300 px and scrolls it. This
       case found a real fault on 2026-11-12 (275c0e7), fixed the same day: the
       reload's deep link brought the card back to the top (caFocusActivity →
       caScrollToActivity), so the scroll the student had (456 px) came back as
       14 px. The router now leaves the scroll to the restore when a note for
       that address is being put back (swResumeRouting, app/boot.js), and with
       no note the card comes into view as before (to 14 px), so the scroll
       tells "note used" from "no note" (planted 2026-11-12: a save that skips
       deep links turns it red, 456→14). busy-card compares the scroll too.
     - lesson-one sits at the very bottom of its pane, so a restore that only
       scrolled to the bottom would pass it; lesson-all and lesson-behind are
       scrolled part-way and would not.
     - lesson-behind: Songs, scrolled, over a lesson; after the restore Songs is
       closed with its own control and the lesson behind it is compared too.

   Every case also asserts: the page that lands is version 2 (the marker, and
   the only shell cache is version 2's); it reloaded exactly once, counted by
   the browser three ways from the update to the end (navigations committed,
   navigations the page asked for, document requests: two location.reload()
   calls in a row commit only once, so the first count alone cannot see a
   double reload); gcSwResume is gone from sessionStorage; and the restore
   wrote nothing: the saved maps (golden.mjs's STATE: completed, skills,
   responses, caSteps, classActivities, exitChecks, practiceLog, games, streak
   and localStorage) are the same before the update and after the restore (the
   student maps are seeded first, the same on both loads, so the comparison is
   not {} against {}), AND the new page started no save: every queueSave() and
   flushSave() call from the sign-in to the end is counted (wrapped in the test
   page) and must be 0, because under the dev bypass queueSave() empties its
   dirty set at once and a queued save leaves no trace in the maps. On the
   console the stub Firestore after the restore equals the stub as it was
   seeded.

   The cases that must NOT happen:
     - busy means wait: a Shuffle drill mid-round, a practice card playing, an
       exit check part-way, a recording (one case each), and in busy-others the
       other eight things the wait reads, one after another, each held 3.2 s
       (two of the page's 1.5 s checks): the Firestore boot after a sign-in,
       the Google sign-in popup, a live mic, a recording starting, a Deck drill,
       an Ear drill, a Note Call round, a Call the chord round. All set through
       the page's real state objects, as busyReason() reads them.
     - the 5-minute cap, from both sides, on a fake page clock (busy-cap): at
       4:50 after the takeover the page is still waiting (held 4 s), at 5:01 it
       reloads with the drill still mid-round. A cap anywhere from 4:54 to 5:01
       passes. That the sign-in popup has NO cap is not tested.
     - the person wins, before the restore lands: a real pointer press, key or
       wheel after the reload and before the restore starts (the restore is
       held back by delaying the module change it waits for, in the test page
       only) stops it before it opens anything.
     - the person wins, after it lands (person-late, console-person-late): the
       place is back, then a wheel turn while the restore's 8 s scroll loop is
       still running; 10 s later the page is where the wheel left it.
     - not someone else's place: another uid signs in first; a note 10:01 old
       is dropped, with a control at 9:58 that must still restore (the age is
       set on the new page's clock at its first line; boot.js reads the note a
       little later, so a limit moved by under about 2 s either way, or a load
       slower than 2 s, is not told apart).
     - not on an ordinary reload; a locked set's preview is not restored (the
       dev account sees every set unlocked, so the preview is opened with the
       locked pill's own call, activateSet(id, {peek})).

   What no case compares (so a fault there stays green): on the console, the
   Teacher view song, the skills grid's set, where an activity was opened from
   (from / fromUid: Songs or a student's page), and the scroll on a picked
   activity or student (those pages sit at 0); a press, key or touch during
   the console's load before its restore (only the wheel after it); a touch
   (no case sends one); on the site, a key, press or touch AFTER the restore
   lands, and any input later than about 0.1 s into its 8 s scroll loop (the
   late cases send one wheel turn); a write to progress/{uid} that goes
   round queueSave() and flushSave().

   Three things about the fake world that matter:
     - The server answers byte ranges (206) as GitHub Pages does. Answering an
       <audio> element's range request with the whole file (200) kept the OLD
       worker busy and held the takeover back for 40 s and more on In class and
       Songs: that was the server, not the site.
     - A practice card's FIRST play of a track not yet in the audio cache
       streams it through the old worker, and the new worker cannot take over
       until that stream ends (measured: no takeover while the song plays, one
       about 1 s after Stop; the reload waits for the song anyway). busy-card
       therefore plays the card once, lets sw.js store the track, stops, and
       plays it again from the cache, so the takeover can come mid-song and
       busyReason()'s pcState is what holds the reload.
     - registration.update() sometimes resolves without asking the server for
       sw.js at all (seen on In class, about 1 run in 3: Chrome folds it into an
       update check of its own that had already fetched version 1). The tool
       then asks again after 10 s, at most twice, and prints a "!" line for each
       time it had to; a real tab checks again on its next page load.

     node tools/update-reload-loop.mjs                  every case
     node tools/update-reload-loop.mjs --only a,b       just those cases (--list names them)
     node tools/update-reload-loop.mjs --site <dir>     use that folder as the site (a break-it copy:
                                                        it is copied, never changed; default: git archive HEAD)
     --verbose    print what was measured before and after, and the timings
     --keep       leave the two site folders (their paths are printed)
     --build-only build the two versions, leave them, print their paths, start no Chrome
     --v2 <dir>   use that folder, as it is, as version 2 and skip the 2-5 minute build. It must be the
                  version 2 that --build-only or --keep made FROM THE SAME --site (pass that run's
                  version 1 folder as --site): version 2 is always the site under test plus the marker.
                  The tool checks the two folders differ only in i18n.js's marker and sw.js (and the
                  tools/.loudness-cache.json checks.mjs writes; .claude/ is not site).
     --stall <s>  the watchdog: no step for <s> seconds (default 120) → print the
                  step, close Chrome, exit 3
     --chrome <path>  Chrome for Testing (or CHROME=...). The system Google Chrome
                  is refused: a headless run on it stops Jonathan's own Chrome
                  from opening (2026-11-11).

   Exit 0 = every case passed, 1 = a case failed, 2 = could not run, 3 = the
   watchdog. Run it after any change to sw.js, the service-worker block in
   app/start.js, swResume* in app/boot.js or teacherResume* in teacher-core.js.
   Only one headless-Chrome run at a time on the machine (CLAUDE.md). The
   network is blocked (--host-resolver-rules): nothing here needs it. Building
   version 2 runs checks.mjs once (2 to 5 minutes, slower when the machine is
   busy); the cases 17 to 45 s each (busy-others 45 s, busy-card 40 s); a full
   run of the 29 cases about 16 minutes (967 s on 2026-11-12, the build 256 s
   of it). Until 2026-11-12's fix it exited 1 on deep-link (see above); it
   now exits 0 on the site.
   --build-only starts no Chrome; run it as `node ./tools/update-reload-loop.mjs`
   so the one-browser-at-a-time check (`ps ... grep "^node tools/..."`) does not
   make other sessions wait for a build.

   What it cannot see: a real school Chromebook; a real Google sign-in; the
   audio cache; an install interrupted and then an offline visit (the accepted
   upgrade risk of 2026-11-11, recorded by tools/sw-upgrade-proof.mjs). */
import { createServer } from 'node:http';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, writeFileSync, existsSync, statSync, symlinkSync, rmSync, realpathSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, extname, normalize, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import net from 'node:net';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : null; };
const VERBOSE = args.includes('--verbose'), KEEP = args.includes('--keep');
const STALL_S = Number(opt('--stall') || 120);
if (!(STALL_S > 0)) { console.error('update-reload: --stall needs a number of seconds'); process.exit(2); }
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const say = (...a) => console.log(...a);
const vsay = (...a) => { if (VERBOSE) console.log(...a); };

/* ── The watchdog ── every step marks where the run is; no step for --stall seconds → print it, close Chrome, exit 3. */
const progress = { where: 'starting', at: Date.now() };
const mark = (where) => { progress.where = where; progress.at = Date.now(); };
let chromeProc = null, buildProc = null;
const cleanup = [];
const stopChrome = () => new Promise(res => {
  const p = chromeProc; chromeProc = null;
  if (!p || p.exitCode !== null || p.signalCode !== null) return res();
  let kill = null, cap = null;
  const done = () => { clearTimeout(kill); clearTimeout(cap); res(); };
  p.once('exit', done);
  p.kill();
  kill = setTimeout(() => { try { p.kill('SIGKILL'); } catch { /* gone */ } }, 1000);
  cap = setTimeout(done, 3000);
});
/* ── Removing a Chrome profile folder (2026-11-13) ──
   On GitHub's Linux runner every case passed and one profile folder of 11 was still there at the end. The
   browser process had exited, but Chrome's helpers (the crash handler, which runs outside the browser's
   process group, and child processes still shutting down) can go on writing into the profile for a moment
   after it, so a single rmSync right after the browser's exit removed the folder and a helper made it
   again (or, on Windows, a helper still had a file open). So, per folder:
     1. wait until no process has the folder in its command line (`pgrep -f`, macOS and Linux; every Chrome
        process, the crash handler included, carries --user-data-dir or its --database under it), up to
        --wait-ms; any still there after that are killed (SIGKILL) and waited for once more;
     2. remove it, and look again after a pause: it counts as gone only when it is still gone then;
        tried up to `tries` times (Windows: a file still open makes rmSync throw EBUSY / EPERM; it is retried).
   It returns false when the folder is still there after all that: the run's end check then fails loudly,
   as before. Windows has no pgrep: there step 1 is skipped and step 2's retries do the waiting. */
// removeProfile: begin (tools/ci/chrome-cleanup-test.mjs runs the lines from here to "removeProfile: end" as they stand)
const reEscape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const holders = (dir) => {
  if (process.platform === 'win32') return [];
  try { return execFileSync('pgrep', ['-f', reEscape(dir)], { encoding: 'utf8' }).split('\n').map(Number).filter(n => n > 0 && n !== process.pid); }
  catch { return []; }
};
async function removeProfile(dir, { waitMs = 8000, tries = 12, gap = 250 } = {}) {
  for (let t = Date.now(); holders(dir).length && Date.now() - t < waitMs;) await sleep(100);
  const stuck = holders(dir);
  for (const pid of stuck) { try { process.kill(pid, 'SIGKILL'); } catch { /* gone */ } }
  for (let t = Date.now(); stuck.length && holders(dir).length && Date.now() - t < 3000;) await sleep(100);
  for (let i = 0; i < tries; i++) {
    try { rmSync(dir, { recursive: true, force: true, maxRetries: 3, retryDelay: 100 }); } catch { /* still held: tried again below */ }
    await sleep(gap);
    if (!existsSync(dir)) return true;
  }
  return !existsSync(dir);
}
// removeProfile: end
const runCleanup = async () => { if (buildProc) { try { buildProc.kill('SIGKILL'); } catch { /* gone */ } } await stopChrome(); for (const f of cleanup.splice(0).reverse()) { try { await f(); } catch { /* best effort */ } } };
const watchdog = setInterval(() => {
  const quiet = (Date.now() - progress.at) / 1000;
  if (quiet < STALL_S) return;
  clearInterval(watchdog);
  console.error(`update-reload: ✗ HUNG: no step started for ${Math.round(quiet)} s (--stall ${STALL_S}). Stuck at "${progress.where}". Closing Chrome and exiting.`);
  runCleanup().finally(() => process.exit(3));
}, 1000);
watchdog.unref();
// Stopped from outside (Ctrl-C, kill): close Chrome and remove the folders on the way out too.
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { console.error(`update-reload: ${sig} — closing Chrome and removing the temp folders`); runCleanup().finally(() => process.exit(sig === 'SIGINT' ? 130 : 143)); });

/* ── Chrome for Testing only ── */
const CHROME = opt('--chrome') || process.env.CHROME;
if (!CHROME) { console.error('update-reload: set CHROME (or --chrome) to Chrome for Testing; the system Chrome is never used'); process.exit(2); }
if (/Google Chrome\.app\/Contents\/MacOS\/Google Chrome$/.test(CHROME) || /^\/Applications\/Google Chrome\.app\//.test(CHROME)
    || /[\\/]Google[\\/]Chrome[\\/]Application[\\/]chrome\.exe$/i.test(CHROME)) {
  console.error(`update-reload: refusing the system Google Chrome (${CHROME}): a headless run on it stops Jonathan's own Chrome from opening. Use Chrome for Testing.`);
  process.exit(2);
}
if (!existsSync(CHROME)) { console.error(`update-reload: no Chrome at ${CHROME}`); process.exit(2); }
if (typeof WebSocket === 'undefined') { console.error('update-reload: needs Node 22+ (global WebSocket)'); process.exit(2); }

/* ── The two versions ── */
const MARK_KEY = 'auth.updating', MARK = ' [v2]';
const MARK_RE = /('auth\.updating'\s*:\s*\{\s*en:\s*')([^']*)(',\s*es:\s*')([^']*)(')/;
function copySite(src, label) {
  const dir = mkdtempSync(join(tmpdir(), `gc-update-reload-${label}-`));
  // Removed on any way out, a signal or the watchdog included, unless --keep / --build-only (which empty this list).
  if (!KEEP) cleanup.push(() => rmSync(dir, { recursive: true, force: true }));
  if (src === null) {
    const tar = execFileSync('git', ['-C', ROOT, 'archive', 'HEAD'], { maxBuffer: 1 << 30 });
    execFileSync('tar', ['-x', '-C', dir, '--exclude=audio'], { input: tar, maxBuffer: 1 << 30 });
  } else {
    const tar = execFileSync('tar', ['-c', '-C', src, '--exclude=./audio', '--exclude=./.git', '--exclude=./.claude', '--exclude=./node_modules', '.'], { maxBuffer: 1 << 30 });
    execFileSync('tar', ['-x', '-C', dir], { input: tar, maxBuffer: 1 << 30 });
  }
  // audio/ is hundreds of MB and decides nothing here: linked, as smoke.mjs and golden.mjs do.
  const audio = src && existsSync(join(src, 'audio')) ? realpathSync(join(src, 'audio')) : join(ROOT, 'audio');
  try { if (existsSync(audio)) symlinkSync(audio, join(dir, 'audio')); } catch { /* best effort */ }
  return dir;
}
const swVersion = (dir) => { try { const m = /const CACHE_VERSION = '([^']*)'/.exec(readFileSync(join(dir, 'sw.js'), 'utf8')); return m ? m[1] : null; } catch { return null; } };
// The files the worker's install + precacheRest() must end up holding: ASSETS, read from the folder's own sw.js, that the folder has.
function wantedAssets(dir) {
  let src; try { src = readFileSync(join(dir, 'sw.js'), 'utf8'); } catch { return null; }
  const m = /const ASSETS = \[([\s\S]*?)\];/.exec(src);
  if (!m) return null;
  const list = [...m[1].matchAll(/'([^']+)'/g)].map(x => x[1]);
  return list.filter(u => { const p = u === './' ? 'index.html' : u.replace(/^\.\//, ''); try { return statSync(join(dir, p)).isFile(); } catch { return false; } })
    .map(u => '/' + u.replace(/^\.\//, ''));
}
async function buildV2(v1) {
  const v2 = copySite(v1, 'v2');
  const i18nPath = join(v2, 'i18n.js');
  const text = readFileSync(i18nPath, 'utf8');
  if (!MARK_RE.test(text)) throw new Error(`could not find the '${MARK_KEY}' string in i18n.js to mark version 2`);
  if (text.includes(MARK)) throw new Error(`version 1 already carries the marker "${MARK}"`);
  writeFileSync(i18nPath, text.replace(MARK_RE, (all, a, en, b, es, c) => a + en + MARK + b + es + MARK + c));
  mark('setup: building version 2 (checks.mjs --skip-links in the copy)');
  const t0 = Date.now();
  const code = await new Promise((res) => {
    if (!existsSync(join(v2, 'tools', 'checks.mjs'))) return res('no tools/checks.mjs');
    const p = buildProc = spawn(process.execPath, ['tools/checks.mjs', '--skip-links'], { cwd: v2, stdio: ['ignore', 'ignore', 'ignore'] });
    // checks.mjs takes about 3 minutes: keep the watchdog fed while it is alive, and give it 10.
    const beat = setInterval(() => mark(`setup: building version 2 (checks.mjs running, ${Math.round((Date.now() - t0) / 1000)} s)`), 20000);
    const cap = setTimeout(() => { try { p.kill('SIGKILL'); } catch { /* gone */ } }, 600000);
    p.on('exit', (c, s) => { buildProc = null; clearInterval(beat); clearTimeout(cap); res(s ? 'killed ' + s : c); });
  });
  return { v2, checksExit: code, seconds: Math.round((Date.now() - t0) / 1000) };
}

/* ── The server: one port, a folder it can switch ── */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json', '.txt': 'text/plain' };
const site = { dir: null, docHits: 0, swHits: [] };
function serve() {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent((req.url || '/').split('?')[0].split('#')[0]);
    if (p.endsWith('/')) p += 'index.html';
    if (p === '/index.html') site.docHits++;
    if (p === '/sw.js') site.swHits.push(site.dir);
    const base = site.dir;
    const f = normalize(join(base, p));
    if (!base || !f.startsWith(base) || !existsSync(f) || !statSync(f).isFile()) { res.writeHead(404); res.end('not found'); return; }
    // no-store: the browser's HTTP cache never answers for the server, so what the worker fetches is the folder being served.
    const body = readFileSync(f), type = MIME[extname(f).toLowerCase()] || 'application/octet-stream';
    // Byte ranges, as GitHub Pages answers them (an <audio> element asks for them): 206 with the slice.
    const m = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
    if (m && (m[1] || m[2])) {
      let a = m[1] ? +m[1] : Math.max(0, body.length - +m[2]), b = m[1] && m[2] ? Math.min(+m[2], body.length - 1) : body.length - 1;
      if (a > b || a >= body.length) { res.writeHead(416, { 'content-range': `bytes */${body.length}` }); res.end(); return; }
      res.writeHead(206, { 'content-type': type, 'cache-control': 'no-store', 'accept-ranges': 'bytes', 'content-range': `bytes ${a}-${b}/${body.length}`, 'content-length': b - a + 1 });
      res.end(body.subarray(a, b + 1)); return;
    }
    res.writeHead(200, { 'content-type': type, 'cache-control': 'no-store', 'accept-ranges': 'bytes', 'content-length': body.length });
    res.end(body);
  });
  return new Promise(r => srv.listen(0, '127.0.0.1', () => r({ srv, port: srv.address().port })));
}
const freePort = () => new Promise((res, rej) => { const s = net.createServer(); s.listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => res(p)); }); s.on('error', rej); });

/* ── CDP ── */
async function openPage(cdpPort) {
  const t = await (await fetch(`http://127.0.0.1:${cdpPort}/json/new?about:blank`, { method: 'PUT' })).json();
  const ws = new WebSocket(t.webSocketDebuggerUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = j; });
  let id = 0; const pending = new Map(); const handlers = [];
  ws.onmessage = e => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(JSON.stringify(m.error))) : res(m.result); }
    else if (m.method) handlers.forEach(h => h(m.method, m.params));
  };
  // Every call has a limit: a context destroyed by a navigation can leave a call unanswered.
  const send = (method, params = {}, ms = 20000) => new Promise((res, rej) => {
    const i = ++id; const timer = setTimeout(() => { pending.delete(i); rej(new Error(`CDP ${method} gave no answer in ${ms} ms`)); }, ms);
    pending.set(i, { res: v => { clearTimeout(timer); res(v); }, rej: e => { clearTimeout(timer); rej(e); } });
    ws.send(JSON.stringify({ id: i, method, params }));
  });
  const evalJs = async (expression, ms) => {
    const r = await send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true }, ms);
    if (r.exceptionDetails) throw new Error((r.exceptionDetails.exception && r.exceptionDetails.exception.description) || JSON.stringify(r.exceptionDetails));
    return r.result.value;
  };
  return { send, evalJs, on: h => handlers.push(h), close: () => { try { ws.close(); } catch { /* gone */ } } };
}

/* ── What the page holds, read in the page ── */
// The saved maps, as golden.mjs's STATE reads them.
const STATE = `(() => { const ls = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); ls[k] = localStorage.getItem(k); }
  return JSON.stringify({ completed, skills: progress, responses, caSteps: caStepDone, classActivities, exitChecks, practiceLog, games, streak, localStorage: ls }); })()`;
/* The same made-up progress on both loads, put in before each sign-in (dev bypass never loads progress), so "the restore wrote
   nothing" compares real maps. Keys of the FIRST set of module 1 and two activities; the cases use later sets. */
// (SETS is still empty before the sign-in: the module files load after it. w1 is Module 1's first set.)
const SEED = `(() => { const w = { id: 'w1' }; const k = w.id + '-b-sec0-';
  completed = { [k + '0']: true, [k + '1']: true }; responses = { [k + '2']: 'seeded answer' };
  classActivities = { 'ca-1': true }; caStepDone = { 'ca-2:0': true }; exitChecks = {}; games = {}; streak = { count: 3, lastDay: '2026-11-10' };
  return w.id; })()`;
const MEASURE = (anchorKey) => `(() => {
  const panel = document.querySelector('#week-panels .week-panel.active');
  const tp = panel && panel.querySelector('.tab-panel.active');
  const dp = panel && panel.querySelector('.dp');
  const mc = document.getElementById('main-content');
  const vis = id => { const e = document.getElementById(id); return !!e && !e.hasAttribute('hidden') && getComputedStyle(e).display !== 'none'; };
  const key = ${JSON.stringify(anchorKey || null)};
  const li = key && tp ? [...tp.querySelectorAll('li.step')].find(x => x.dataset.key === key) : null;
  const paneTop = mc ? mc.getBoundingClientRect().top : 0;
  return {
    hash: location.hash, lang: document.documentElement.lang || '',
    set: panel ? panel.dataset.id : null, peek: !!(panel && panel.classList.contains('set-peek')),
    checklist: !!(panel && panel.classList.contains('on-checklist')),
    view: dp ? (dp.classList.contains('focus') ? 'one step' : 'all steps') : null,
    open: dp ? [...dp.querySelectorAll('li.step:not(.collapsed)')].map(x => x.dataset.key) : [],
    folds: dp ? [...dp.querySelectorAll('.step-fold-panel:not([hidden])')].map(x => x.id) : [],
    page: ['class-activities-screen', 'songs-screen', 'my-progress-screen'].filter(vis),
    cards: [...document.querySelectorAll('.ca-card[open]')].map(x => x.dataset.id || '?'),
    paneY: mc ? Math.round(mc.scrollTop) : 0, winY: Math.round(scrollY), paneMax: mc ? mc.scrollHeight - mc.clientHeight : 0,
    anchorTop: li && li.getClientRects().length ? Math.round(li.getBoundingClientRect().top - paneTop) : null,
    dpPad: dp ? getComputedStyle(dp).paddingTop : null,
    appShown: (document.getElementById('app') || {}).style ? document.getElementById('app').style.display : ''
  }; })()`;
const MEASURE_CONSOLE = `(() => {
  const cur = [...document.querySelectorAll('#t-side [aria-current="page"]')].map(b => b.dataset.view);
  const tab = document.querySelector('[data-ta-tab][aria-selected="true"]');
  const flt = document.querySelector('[data-ta-filter][aria-pressed="true"]');
  return { view: cur.join(','), teacherView, picked: activityDetailId, listPick: activityListPickId, filter: flt ? flt.dataset.taFilter : null,
    lit: [...document.querySelectorAll('[data-ta-pick].is-sel')].map(x => x.dataset.id).join(','),
    tab: tab ? tab.dataset.taTab : null, board: !!document.querySelector('[data-ta-board-back]'), boardMode: activityBoardMode,
    student: studentDetailUid, studentPage: !!document.querySelector('.stu-back'), winY: Math.round(scrollY),
    winMax: document.documentElement.scrollHeight - innerHeight }; })()`;
const STORE = `JSON.stringify([...__store.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1))`;
// The console's fake class and Firestore: tools/console-layout-smoke.mjs's STUB, read from that file so the two never drift.
function consoleStub() {
  const src = readFileSync(join(ROOT, 'tools', 'console-layout-smoke.mjs'), 'utf8');
  const m = /const STUB = String\.raw`([\s\S]*?)`;\n/.exec(src);
  if (!m) throw new Error('could not read STUB from tools/console-layout-smoke.mjs');
  return m[1];
}
// A spot on screen whose element is not a control: a press there does nothing but press.
const NEUTRAL_POINT = `(() => { const bad = 'button,a,input,select,textarea,label,summary,details,[onclick],[role=button],[contenteditable],audio,video,iframe';
  for (let y = 120; y < innerHeight - 20; y += 37) for (let x = 400; x < innerWidth - 20; x += 53) {
    const e = document.elementFromPoint(x, y); if (e && !e.closest(bad)) return { x, y, tag: e.tagName + (e.id ? '#' + e.id : '') }; }
  return null; })()`;

/* ── Going to a place (student): real controls, clicked ── */
// Non-first sets of the module on screen, each with its steps that have a Hint fold (index > 0).
const HINT_CANDIDATES = `(() => { const mod = (SETS.find(w => document.querySelector('#week-panels .week-panel[data-id="' + w.id + '"]')) || {}).moduleNum;
  const sets = SETS.filter(w => w.moduleNum === mod && !w.locked && !w.comingSoon);
  const out = [];
  sets.slice(1).forEach(w => { const p = document.querySelector('#week-panels .week-panel[data-id="' + w.id + '"]'); if (!p) return;
    [...p.querySelectorAll('.dp li.step')].forEach((li, i) => { if (i > 0 && li.querySelector('.step-hint-fold')) out.push({ set: w.id, idx: i, key: li.dataset.key }); }); });
  return out; })()`;
const clickPill = (id) => `(() => { const b = document.querySelector('.wpill[data-id="${id}"]'); if (!b) return false; b.click(); return true; })()`;
const OPEN_KEY = `(() => { const p = document.querySelector('#week-panels .week-panel.active'); const li = p && p.querySelector('.dp li.step:not(.collapsed)'); return li ? li.dataset.key : null; })()`;
const NEXT_STEP = `(() => { const p = document.querySelector('#week-panels .week-panel.active'); const b = p && [...p.querySelectorAll('.fm-next')].find(x => !x.hidden && x.getClientRects().length); if (!b) return false; b.click(); return true; })()`;
const openHint = (key) => `(() => { const li = [...document.querySelectorAll('#week-panels .week-panel.active li.step')].find(x => x.dataset.key === ${JSON.stringify(key)});
  const pill = li && li.querySelector('.step-hint-fold'); if (!pill) return false; if (pill.getAttribute('aria-expanded') !== 'true') pill.click(); return pill.getAttribute('aria-expanded') === 'true'; })()`;
// Scroll the reading pane so `key`'s row starts `into` px above the top of the pane (part-way into the step); returns what it got.
const scrollInto = (key, into) => `(async () => { const mc = document.getElementById('main-content');
  const li = [...document.querySelectorAll('#week-panels .week-panel.active li.step')].find(x => x.dataset.key === ${JSON.stringify(key)});
  if (!mc || !li) return null; const paneTop = mc.getBoundingClientRect().top;
  const want = Math.max(0, Math.round(mc.scrollTop + li.getBoundingClientRect().top - paneTop + ${into}));
  mc.scrollTop = want; await new Promise(r => setTimeout(r, 700));
  return { y: Math.round(mc.scrollTop), max: mc.scrollHeight - mc.clientHeight, top: Math.round(li.getBoundingClientRect().top - paneTop), h: Math.round(li.getBoundingClientRect().height) }; })()`;
const scrollPaneTo = (frac) => `(async () => { const mc = document.getElementById('main-content'); if (!mc) return null;
  const max = mc.scrollHeight - mc.clientHeight; mc.scrollTop = Math.round(max * ${frac}); await new Promise(r => setTimeout(r, 700));
  return { y: Math.round(mc.scrollTop), max }; })()`;
const clickSel = (sel) => `(() => { const b = [...document.querySelectorAll(${JSON.stringify(sel)})].find(x => x.getClientRects().length) || document.querySelector(${JSON.stringify(sel)}); if (!b) return false; b.click(); return true; })()`;

/* A step-by-step context for one case. */
function makeCtx(page, caseName) {
  const step = (s) => mark(`${caseName}: ${s}`);
  const js = (e, ms) => page.evalJs(e, ms);
  // Poll an expression until it is truthy (no limit of its own: the watchdog is the limit) or, with ms, until ms pass.
  const until = async (label, expr, ms, every = 150) => {
    step(label);
    const t0 = Date.now();
    for (;;) {
      let v = null; try { v = await js(expr, 15000); } catch { /* the page is between documents */ }
      if (v) return v;
      if (ms && Date.now() - t0 > ms) return null;
      await sleep(every);
    }
  };
  return { step, js, until };
}

/* ── The cases ── */
/* The scroll tolerance, in px. Measured first (2026-11-11): the real restore landed at 0 px from the saved place in every
   case, the lesson's row and the pages' scrollTop alike; 4 px leaves room for sub-pixel rounding and nothing more. */
const tol = 4;
// The extra height the test page puts above the lesson rows after the reload (R1-5), in px.
const SHIFT_PX = 49;
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
// Field-by-field comparison: each entry [name, ok, shown].
const cmpPlace = (fields, b, a) => fields.map(f => {
  if (f === 'anchor') { const d = (a.anchorTop == null || b.anchorTop == null) ? null : a.anchorTop - b.anchorTop; return ['row Δ', d !== null && Math.abs(d) <= tol, d === null ? `row not on screen (${b.anchorTop}→${a.anchorTop})` : `${d}px (pane ${b.paneY}→${a.paneY})`]; }
  if (f === 'paneY') { const d = a.paneY - b.paneY; return ['scroll Δ', Math.abs(d) <= tol, `${d}px (${b.paneY}→${a.paneY} of ${a.paneMax})${!b.paneMax && !a.paneMax ? ' (this page does not scroll at 1366x657: nothing to restore)' : ''}`]; }
  if (f === 'winY') { const d = a.winY - b.winY; return ['scroll Δ', Math.abs(d) <= tol, `${d}px (${b.winY}→${a.winY})`]; }
  return [f, same(a[f], b[f]), JSON.stringify(a[f])];
});
const LESSON_FIELDS = ['hash', 'set', 'checklist', 'peek', 'view', 'open', 'folds', 'page', 'anchor'];

// The lesson, one step at a time: a non-first set, a step after the first, its Hint open, scrolled part-way into it.
async function placeLessonOne(c) {
  const cands = await c.js(HINT_CANDIDATES);
  if (!cands.length) throw new Error('no non-first set in this module has a step after the first with a Hint fold');
  for (const cand of cands.slice(0, 12)) {
    c.step(`lesson: open ${cand.set}, step ${cand.idx + 1}`);
    if (!await c.js(clickPill(cand.set))) continue;
    await sleep(400);
    await c.js(clickSel('[onclick="setStationView(true)"]')); await sleep(200);
    for (let i = 0; i < cand.idx + 2 && (await c.js(OPEN_KEY)) !== cand.key; i++) { if (!await c.js(NEXT_STEP)) break; await sleep(250); }
    if ((await c.js(OPEN_KEY)) !== cand.key) continue;
    if (!await c.js(openHint(cand.key))) continue;
    await sleep(300);
    const s = await c.js(scrollInto(cand.key, 140));
    if (s && s.y >= 60 && s.top < 0 && s.top + s.h > 0) return { anchor: cand.key, note: `${cand.set} step ${cand.idx + 1}, Hint open, ${-s.top}px into the step` };
  }
  throw new Error('no candidate step could be scrolled part-way into');
}
// "All steps", two steps open: the checklist's "Show me where" on a skill two steps teach (list view lights every one), a Hint opened in one.
async function placeLessonAll(c) {
  await c.js(clickSel('[onclick="setStationView(false)"]'));   // the switch is in the set band; any set's does
  const sets = await c.js(`(() => { const mod = (SETS.find(w => document.querySelector('#week-panels .week-panel[data-id="' + w.id + '"]')) || {}).moduleNum;
    const s = SETS.filter(w => w.moduleNum === mod && !w.locked && !w.comingSoon).map(w => w.id); return s.slice(1).concat(s.slice(0, 1)); })()`);
  for (const id of sets) {
    c.step(`all steps: ${id}`);
    if (!await c.js(clickPill(id))) continue;
    await sleep(400);
    await c.js(clickSel('[onclick="setStationView(false)"]')); await sleep(200);
    await c.js(clickSel('.rail-station.st-chk')); await sleep(400);
    const btn = await c.js(`(() => { const p = document.querySelector('#week-panels .week-panel.active');
      const lis = [...p.querySelectorAll('.dp li.step[data-skills]')];
      const btns = [...p.querySelectorAll('.sk-where-btn')];
      for (const b of btns) { const m = /showSkillLesson\\('[^']*',\\s*(\\d+)\\)/.exec(b.getAttribute('onclick') || ''); if (!m) continue;
        const n = lis.filter(li => li.dataset.skills.split(',').includes(m[1])); if (n.length >= 2 && n.some(li => li.querySelector('.step-hint-fold'))) { b.click(); return n.map(li => li.dataset.key); } }
      return null; })()`);
    if (!btn) continue;
    await sleep(900);
    const open = await c.js(`[...document.querySelectorAll('#week-panels .week-panel.active .dp li.step:not(.collapsed)')].map(x => x.dataset.key)`);
    if (open.length < 2) continue;
    const withHint = await c.js(`(() => { const ks = ${JSON.stringify(open)}; return ks.find(k => { const li = [...document.querySelectorAll('#week-panels .week-panel.active li.step')].find(x => x.dataset.key === k); return li && li.querySelector('.step-hint-fold'); }) || null; })()`);
    if (!withHint || !await c.js(openHint(withHint))) continue;
    await sleep(300);
    const s = await c.js(scrollInto(open[open.length - 1], 120));
    if (s && s.y >= 60 && s.top < 0 && s.top + s.h > 0) return { anchor: open[open.length - 1], note: `${id}, ${open.length} steps open, Hint open in ${withHint}` };
  }
  throw new Error('no set has a checklist skill taught by two steps, one with a Hint, that can be scrolled into');
}
async function placeChecklist(c) {
  const cands = await c.js(HINT_CANDIDATES);
  const id = cands.length ? cands[0].set : null;
  if (!id || !await c.js(clickPill(id))) throw new Error('no non-first set');
  await sleep(400);
  await c.js(clickSel('.rail-station.st-chk')); await sleep(500);
  const s = await c.js(scrollPaneTo(0.45));
  if (!s || s.y < 60) throw new Error('the checklist is too short to scroll');
  return { note: `${id} checklist, scrolled ${s.y} of ${s.max}px` };
}
const placeExplore = (toggle, screen, label, frac) => async (c) => {
  if (!await c.js(`(() => { const e = document.getElementById('${screen}'); return !!e && !e.hasAttribute('hidden'); })()`)) {
    if (!await c.js(clickSel(`[onclick="${toggle}"]`))) throw new Error(`no ${toggle} button`);
  }
  await c.until(`${label}: page on screen`, `(() => { const e = document.getElementById('${screen}'); const mc = document.getElementById('main-content'); return !!e && !e.hasAttribute('hidden') && mc && mc.scrollHeight - mc.clientHeight > 300; })()`, 20000);
  await sleep(1500);   // Songs and My progress fill in once every module is in
  const s = await c.js(scrollPaneTo(frac));
  if (!s || s.y < 100) throw new Error(`${label} is too short to scroll (${s && s.max}px)`);
  return { note: `${label}, scrolled ${s.y} of ${s.max}px` };
};
/* A deep link to one activity, its practice card open, and the pane scrolled: the browser keeps the address across a reload
   and the router opens the card again from it, so only the scroll depends on the note (review R1-3). Cards are tried in
   order until one whose page scrolls more than 300 px (with a Play button when the case plays it). */
const placeDeepLink = (needPlay) => async (c) => {
  const ids = await c.js(`CLASS_ACTIVITIES.filter(a => a.card${needPlay ? ' && !a.card.sheet' : ''}).map(a => a.id)`);
  if (!ids.length) throw new Error('no practice-card activity');
  const tried = [];
  for (const id of ids.slice(0, 25)) {
    c.step(`deep link: #class-activities/${id}`);
    await c.js(`location.hash = '#class-activities/${id}'`);
    if (!await c.until('deep link: card open', `!!document.querySelector('.ca-card[open][data-id="${id}"]')`, 8000)) { tried.push(id + ' (no card)'); continue; }
    await sleep(800);
    const m = await c.js(`(() => { const mc = document.getElementById('main-content'); return { max: mc ? mc.scrollHeight - mc.clientHeight : 0, play: !!document.querySelector('.ca-card[open] .pc-play') }; })()`);
    tried.push(`${id} ${m.max}px`);
    if (m.max <= 300 || (needPlay && !m.play)) continue;
    const s = await c.js(scrollPaneTo(0.35));
    if (!s || s.y < 100) continue;
    return { note: `#class-activities/${id}, card open, scrolled ${s.y} of ${s.max}px` };
  }
  throw new Error(`no practice card whose page scrolls more than 300 px${needPlay ? ' and has a Play button' : ''} (tried ${tried.join(', ')})`);
};
/* A lesson behind Songs (review R1-4): the lesson case's place, then Songs opened over it and scrolled. The lesson's own
   state is read before Songs opens; after the restore Songs is closed with its own control and the lesson read again. */
async function placeLessonBehind(c) {
  const r = await placeLessonOne(c);
  const lessonBefore = await c.js(MEASURE(r.anchor));
  const s = await placeExplore('toggleSongsHub()', 'songs-screen', 'Songs', 0.5)(c);
  return { anchor: r.anchor, lessonBefore, note: `${s.note}, over ${r.note}` };
}
async function placeSpanish(c) {
  if (!await c.js(clickSel('#btn-translate'))) throw new Error('no translate button');
  await sleep(800);
  if ((await c.js(`document.documentElement.lang`)) !== 'es') throw new Error('the page did not switch to Spanish');
  const r = await placeLessonOne(c);
  return { ...r, note: 'Spanish; ' + r.note };
}
async function placePeek(c) {
  const sets = await c.js(`(() => { const mod = (SETS.find(w => document.querySelector('#week-panels .week-panel[data-id="' + w.id + '"]')) || {}).moduleNum;
    return SETS.filter(w => w.moduleNum === mod && !w.locked && !w.comingSoon).map(w => w.id); })()`);
  // The student's own set is the first; the preview is the next one (a locked set is always a later one).
  if (sets.length < 2) throw new Error('need two sets in the module on screen');
  await c.js(clickPill(sets[0])); await sleep(400);
  // A locked set opened to preview: the locked pill's own call (renderPills). The dev account sees every set unlocked, so the call is made directly.
  await c.js(`activateSet(${JSON.stringify(sets[1])}, { peek: true })`); await sleep(500);
  if (!await c.js(`!!document.querySelector('.week-panel.active.set-peek')`)) throw new Error('the preview did not open');
  await c.js(scrollPaneTo(0.4));
  return { real: sets[0], peeked: sets[1], note: `${sets[0]} open, ${sets[1]} previewed, scrolled` };
}

/* Console places: real clicks on the console's own controls. */
async function consoleView(c) {
  await c.js(`document.querySelector('#t-side [data-view="songs"]').click()`); await sleep(700);
  await c.js(`window.scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * 0.5))`); await sleep(400);
  const y = await c.js(`Math.round(scrollY)`);
  return { note: `Songs view, window scrolled ${y}px` };
}
async function consoleActivity(c) {
  await c.js(`document.querySelector('#t-side [data-view="activities"]').click()`); await sleep(500);
  // The list's filter, not the default ('units'): restored from the note (teacherResumeApply: activityListFilter).
  if (!await c.js(clickSel('[data-ta-filter="all"]'))) throw new Error('no "All" filter button');
  await sleep(400);
  // A row on screen that is not the one picked already (the list opens with one picked): the third such row.
  const id = await c.js(`(() => { const rows = [...document.querySelectorAll('[data-ta-pick]')].filter(r => r.getClientRects().length && !r.classList.contains('is-sel'));
    const r = rows[2] || rows[0]; if (!r) return null; r.click(); return r.dataset.id; })()`);
  if (!id) throw new Error('no activity row on screen');
  await sleep(300);
  if (!await c.js(clickSel('[data-ta-tab="students"]'))) throw new Error('no Students tab');
  await sleep(400);
  return { note: `Class activities, filter All, ${id} picked, Students tab` };
}
async function consoleStudent(c) {
  await c.js(`document.querySelector('#t-side [data-view="students"]').click()`); await sleep(600);
  if (!await c.js(clickSel('[data-open-student][data-uid="stub-uid-07"]'))) throw new Error('no stub-uid-07 row');
  await sleep(600);
  return { note: 'Students, stub-uid-07 open' };
}
async function consoleBoard(c) {
  await c.js(`document.querySelector('#t-side [data-view="activities"]').click()`); await sleep(500);
  if (!await c.js(clickSel('[data-ta-board-open]'))) throw new Error('no Arrange board button');
  await sleep(600);
  await c.js(`window.scrollTo(0, Math.round((document.documentElement.scrollHeight - innerHeight) * 0.4))`); await sleep(400);
  return { note: `Arrange board, window scrolled ${await c.js('Math.round(scrollY)')}px` };
}

// Busy states: the page's real state objects, as busyReason() reads them.
const BUSY = {
  drill: { is: `!!shuffleDrills['gc-test']`, on: `(shuffleDrills['gc-test'] = { phase: 'play' }, true)`, off: `(delete shuffleDrills['gc-test'], true)`, what: 'a Shuffle drill mid-round (shuffleDrills[k].phase = play)' },
  check: { is: `!!ecRuns['ca-14']`, on: `(ecRuns['ca-14'] = { i: 1, picks: ['x'] }, true)`, off: `(delete ecRuns['ca-14'], true)`, what: 'an exit check part-way (ecRuns has a run)' },
  recording: { is: `!!recState['gc-test']`, on: `(recState['gc-test'] = { recording: true }, true)`, off: `(delete recState['gc-test'], true)`, what: 'a recording in progress (recState[k].recording)' },
  /* Played twice. The FIRST play of a track that is not in the audio cache yet streams it through the worker (sw.js, the
     Range path), and while that stream is open the old worker cannot be replaced at all (measured: no takeover for as long
     as the song plays, then one about 1 s after Stop). So the first play is stopped once sw.js has stored the whole track,
     and the card is played again from the cache: the takeover can then happen mid-song, and what holds the reload back is
     busyReason()'s pcState, the thing under test. */
  card: { on: `(async () => { const play = () => { const b = document.querySelector('.ca-card[open] .pc-play'); if (!b) return false; b.click(); return true; };
      const audioCache = async () => { const k = (await caches.keys()).find(n => /audio/.test(n) && !/hashes/.test(n)); return k ? (await (await caches.open(k)).keys()).length : 0; };
      if (!play()) return false;
      for (let i = 0; i < 100 && !(await audioCache()); i++) await new Promise(r => setTimeout(r, 200));
      if (!(await audioCache())) return false;
      if (pcState) play();
      await new Promise(r => setTimeout(r, 800));
      return play(); })()`,
    ready: `pcState !== null`, is: `pcState !== null`, off: `(() => { const b = document.querySelector('.ca-card[open] .pc-play'); if (b) b.click(); return pcState === null; })()`, what: 'a practice card playing (its Play button; pcState set), its track already in the audio cache' },
  /* The other reasons busyReason() gives (and the sign-in popup, held like the others: its having no cap is not tested), one after another in one case (review R1-8):
     each is set before the one before it is cleared, so the page is never idle in between, and each is held for
     CYCLE_MS, at least two of the page's 1.5 s checks. A reason the page ignores lets the reload through inside its own
     window, and the line for that reason turns red. */
  others: { on: `(window.__authBootPending = true, true)`, what: 'the other busy reasons, one after another' }
};
const CYCLE_MS = 3200;
const CYCLE = [
  ['the Firestore boot after a sign-in (__authBootPending)', `(window.__authBootPending = true, true)`, `(window.__authBootPending = false, true)`],
  ['the Google sign-in popup (__authPopupPending)', `(window.__authPopupPending = true, true)`, `(window.__authPopupPending = false, true)`],
  ['a live mic (coachMicLive)', `(window.coachMicLive = true, true)`, `(window.coachMicLive = false, true)`],
  ['a recording starting (recState[k].starting)', `(recState['gc-test'] = { starting: true }, true)`, `(delete recState['gc-test'], true)`],
  ['a Deck drill mid-round (deckDrills[k].phase = run)', `(deckDrills['gc-test'] = { phase: 'run' }, true)`, `(delete deckDrills['gc-test'], true)`],
  ['an Ear drill mid-round (earDrills[k].phase = run)', `(earDrills['gc-test'] = { phase: 'run' }, true)`, `(delete earDrills['gc-test'], true)`],
  ['a Note Call round (ncLive)', `(ncLive = 'gc-test', true)`, `(ncLive = null, true)`],
  ['a Call the chord round (chcLive)', `(chcLive = 'gc-test', true)`, `(chcLive = null, true)`]
];

const CASES = [
  { name: 'lesson-one', what: 'a lesson, one step at a time: a later set, a later step, its Hint open, scrolled into it', place: placeLessonOne, fields: LESSON_FIELDS },
  { name: 'lesson-all', what: '"All steps": two steps open (Show me where), a Hint open, scrolled', place: placeLessonAll, fields: LESSON_FIELDS },
  { name: 'checklist', what: 'the checklist panel of a set, scrolled', place: placeChecklist, fields: ['hash', 'set', 'checklist', 'peek', 'page', 'paneY'] },
  { name: 'in-class', what: 'In-Class Activities, scrolled', place: placeExplore('toggleClassActivities()', 'class-activities-screen', 'In class', 0.4), fields: ['hash', 'page', 'cards', 'paneY'] },
  { name: 'songs', what: 'Songs, scrolled', place: placeExplore('toggleSongsHub()', 'songs-screen', 'Songs', 0.5), fields: ['hash', 'page', 'paneY'] },
  { name: 'my-progress', what: 'My progress, scrolled', place: placeExplore('toggleMyProgress()', 'my-progress-screen', 'My progress', 0.5), fields: ['hash', 'page', 'paneY'] },
  { name: 'deep-link', what: 'a deep link to one activity with its practice card open, scrolled', place: placeDeepLink(false), fields: ['hash', 'page', 'cards', 'paneY'] },
  { name: 'lesson-behind', what: 'Songs, scrolled, over a lesson (a later set, a later step, its Hint): both come back', place: placeLessonBehind, behind: true, fields: ['hash', 'page', 'paneY'] },
  { name: 'spanish', what: 'the lesson case in Spanish', place: placeSpanish, fields: ['lang', ...LESSON_FIELDS] },
  { name: 'console-view', console: true, what: 'the console on a view other than the default (Songs), scrolled', place: consoleView, fields: ['view', 'teacherView', 'winY'] },
  { name: 'console-activity', console: true, what: 'the console: the All filter, a picked activity on its Students tab', place: consoleActivity, fields: ['view', 'filter', 'picked', 'listPick', 'lit', 'tab', 'board'] },
  { name: 'console-student', console: true, what: 'the console: a picked student', place: consoleStudent, fields: ['view', 'student', 'studentPage'] },
  { name: 'console-board', console: true, what: 'the console: Arrange board, scrolled', place: consoleBoard, fields: ['view', 'board', 'boardMode', 'winY'] },
  // ── What must not happen ──
  ...['drill', 'card', 'check', 'recording', 'others'].map(k => ({ name: 'busy-' + k, what: 'busy means wait: ' + BUSY[k].what, busy: k,
    place: k === 'card' ? placeDeepLink(true) : k === 'check' ? placeExplore('toggleClassActivities()', 'class-activities-screen', 'In class', 0.3) : placeLessonOne,
    fields: k === 'card' ? ['hash', 'page', 'cards', 'paneY'] :k === 'check' ? ['hash', 'page', 'paneY'] : LESSON_FIELDS })),
  { name: 'busy-cap', what: 'busy for good (a Shuffle drill never ends): no reload at 4:50, the reload at the 5-minute cap (page clock moved on)', busy: 'drill', cap: true, clock: true, place: placeLessonOne, fields: LESSON_FIELDS },
  ...[['press', 'a pointer press'], ['key', 'a key'], ['wheel', 'a wheel turn']].map(([k, w]) => ({ name: 'person-' + k, person: k,
    what: `the person wins: ${w} after the reload, before the restore lands, stops it`, place: placeLessonOne })),
  { name: 'person-late', late: true, what: 'the person wins: a wheel turn after the restore has landed, while its 8 s scroll loop runs, is kept', place: placeLessonOne },
  { name: 'console-person-late', console: true, late: true, what: 'the console: a wheel turn after the scroll has come back, while its loop runs, is kept', place: consoleView },
  { name: 'other-user', what: 'a different user signs in first after the reload: not their place', otherUser: true, place: placeLessonOne },
  { name: 'note-stale', what: 'a note 10:01 old (page clock) is dropped', clock: true, noteAge: 10 * 60000 + 1000, place: placeLessonOne },
  { name: 'note-fresh', what: 'control: a note 9:58 old (page clock) is still used', clock: true, noteAge: 10 * 60000 - 2000, place: placeLessonOne, fields: LESSON_FIELDS },
  { name: 'ordinary-reload', what: 'a plain reload with no update (a note left in sessionStorage too) opens the home page', ordinary: true, place: placeLessonOne },
  { name: 'locked-preview', what: "a locked set's preview is not restored", peek: true, place: placePeek }
];
if (args.includes('--list')) { for (const c of CASES) say(`${c.name.padEnd(17)} ${c.what}`); process.exit(0); }
const ONLY = opt('--only') ? opt('--only').split(',').map(s => s.trim()).filter(Boolean) : null;
if (ONLY) { const bad = ONLY.filter(n => !CASES.some(c => c.name === n)); if (bad.length) { console.error(`update-reload: no case ${bad.join(', ')} (--list)`); process.exit(2); } }
const RUN = CASES.filter(c => !ONLY || ONLY.includes(c.name));

// A clock the test can move (the 5-minute cap, the 10-minute note): Date with an offset read from window.__clockOffset.
const CLOCK = `(() => { const R = Date; const off = () => (window.__clockOffset || 0);
  function D(...a) { if (!new.target) return new R(R.now() + off()).toString(); return a.length ? new R(...a) : new R(R.now() + off()); }
  D.prototype = R.prototype; D.now = () => R.now() + off(); D.parse = R.parse; D.UTC = R.UTC; window.Date = D; })();`;

/* ── One case ── */
async function runCase(cs, env) {
  const { base, V1, V2, want1, stub } = env;
  const t0 = Date.now();
  const res = { name: cs.name, checks: [], note: '', ms: 0, notes: [] };
  const check = (name, ok, shown) => res.checks.push([name, !!ok, shown]);
  site.dir = env.v1;
  mark(`${cs.name}: starting Chrome`);
  const prof = mkdtempSync(join(tmpdir(), 'gc-update-reload-chrome-'));
  env.profiles.push(prof);
  // Also on the watchdog's way out (runCleanup stops Chrome first, then runs these).
  const dropProfile = () => removeProfile(prof);
  cleanup.push(dropProfile);
  const cdp = await freePort();
  chromeProc = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${cdp}`, `--user-data-dir=${prof}`, '--no-first-run', '--disable-gpu',
    '--autoplay-policy=no-user-gesture-required', '--host-resolver-rules=MAP * ~NOTFOUND , EXCLUDE 127.0.0.1', 'about:blank'], { stdio: 'ignore' });
  let page = null;
  try {
    for (let i = 0; i < 80; i++) { try { await fetch(`http://127.0.0.1:${cdp}/json/version`); break; } catch { await sleep(250); } }
    page = await openPage(cdp);
    const c = makeCtx(page, cs.name);
    /* Reloads, counted by the browser three ways: navigations committed (frameNavigated), navigations the page asked for
       (frameRequestedNavigation: location.reload() is one even when a second one cancels it before it commits), and
       document requests sent (Network). "Exactly once" needs all three to be 1. */
    let navs = 0, asked = 0, docs = 0, mainFrame = null;
    page.on((m, p) => {
      if (m === 'Page.frameNavigated' && !p.frame.parentId) { navs++; mainFrame = p.frame.id; }
      if (m === 'Page.frameRequestedNavigation' && (!mainFrame || p.frameId === mainFrame)) asked++;
      if (m === 'Network.requestWillBeSent' && p.type === 'Document' && (!mainFrame || p.frameId === mainFrame)) docs++;
    });
    await page.send('Page.enable'); await page.send('Runtime.enable'); await page.send('Network.enable');
    await page.send('Emulation.setDeviceMetricsOverride', { width: 1366, height: 657, deviceScaleFactor: 1, mobile: false });
    if (cs.clock) await page.send('Page.addScriptToEvaluateOnNewDocument', { source: CLOCK });
    const url = `${base}/index.html${cs.console ? '?teacher=true' : ''}`;

    // 1. A first visit: the worker installs, takes over, and fills its cache (the shell, then precacheRest).
    c.step('first visit to version 1');
    await page.send('Page.navigate', { url });
    await c.until('waiting for the worker to control the page and fill its cache', `(async () => { if (!navigator.serviceWorker.controller) return false;
      if (!(await caches.keys()).includes(${JSON.stringify(V1)})) return false;
      const have = new Set((await (await caches.open(${JSON.stringify(V1)})).keys()).map(r => new URL(r.url).pathname));
      return ${JSON.stringify(want1)}.every(p => have.has(p)); })()`, 0, 300);
    /* A first visit never reloads for an update (start.js hadController): the worker taking control of a page it did not
       load is not a new version. Counted from the first navigation to here (review R1-7). */
    check('first visit did not reload', navs === 1 && asked === 0, `${navs} committed, ${asked} asked for, ${docs} document request(s) on the first visit`);
    // 2. Come back: now the page was controlled when it loaded, as a returning student's is.
    c.step('second visit to version 1');
    await page.send('Page.reload', {});
    await sleep(300);
    await c.until('second visit: page ready', `document.readyState === 'complete' && typeof devBypass === 'function' && performance.getEntriesByType('navigation')[0].workerStart > 0`, 0);
    const signIn = async (label) => {
      if (cs.console) {
        await c.until(`${label}: console scripts`, `typeof ensureTeacherJs === 'function' && typeof CLASS_ACTIVITIES !== 'undefined' && document.readyState === 'complete'`, 0);
        c.step(`${label}: loading the console`);
        await c.js(`ensureTeacherJs()`, 30000);
        await c.until(`${label}: showTeacherApp`, `typeof showTeacherApp === 'function'`, 0);
        await c.js(stub);
        const seeded = await c.js(STORE);
        await c.js(`(currentUser = { uid: 'stub-teacher', email: TEACHER_EMAIL, displayName: 'Teacher', photoURL: null }, showTeacherApp(currentUser).catch(e => { window.__showErr = e.message; }), true)`);
        await c.until(`${label}: console painted`, `!!document.querySelector('#t-side [data-view]') && typeof allStudentsRaw !== 'undefined' && allStudentsRaw.length > 0`, 0);
        return seeded;
      }
      c.step(`${label}: seeding progress, signing in (dev bypass)`);
      await c.js(SEED);
      return null;
    };
    await signIn('first sign-in');
    if (!cs.console) {
      await c.js(`(devBypass(), true)`);
      await c.until('first sign-in: module on screen', `(async () => { await _bootModuleChange; return !!document.querySelector('#week-panels .week-panel.active .dp'); })()`, 0);
      await sleep(500);
    } else await sleep(800);

    // 3. Go to the place, and read it.
    c.step('going to the place');
    const placed = await cs.place(c);
    res.note = placed.note;
    if (cs.busy) {
      c.step('starting the busy thing');
      if (!await c.js(BUSY[cs.busy].on)) throw new Error('could not start: ' + BUSY[cs.busy].what);
      if (BUSY[cs.busy].ready && !await c.until('busy thing running', BUSY[cs.busy].ready, 8000)) throw new Error('did not start: ' + BUSY[cs.busy].what);
    }
    await sleep(300);
    const before = cs.console ? await c.js(MEASURE_CONSOLE) : await c.js(MEASURE(placed.anchor));
    const stateBefore = cs.console ? null : await c.js(STATE);
    vsay(`    [${cs.name}] before: ${JSON.stringify(before)}`);

    // 4. The update (or, for ordinary-reload, a plain reload with a note left behind).
    await c.js(`(window.__gcOldDoc = 1, window.__gcTook = 0, window.__gcTookAt = 0, navigator.serviceWorker.addEventListener('controllerchange', () => { window.__gcTook++; if (!window.__gcTookAt) window.__gcTookAt = Date.now(); }), true)`);
    /* The note's age, set on the new page's clock before any of its scripts run: the clock is moved so that the note
       (written by the old page, clock not moved) is noteAge old at the first line of the new document. boot.js reads it a
       little later, so the age it sees is noteAge plus the load up to boot.js. */
    if (cs.noteAge) await page.send('Page.addScriptToEvaluateOnNewDocument', { source: `(() => { try { const v = JSON.parse(sessionStorage.getItem('gcSwResume') || 'null');
      if (v && typeof v.at === 'number') { window.__clockOffset = v.at + ${cs.noteAge} - Date.now(); window.__gcNoteAgeSet = ${cs.noteAge}; } } catch (e) { /* no note: the case says so */ } })();` });
    navs = 0; asked = 0; docs = 0; site.docHits = 0; site.swHits = [];
    const tUpd = Date.now();
    if (cs.ordinary) {
      c.step('ordinary reload with a note left behind');
      await c.js(`(swResumeSave(), true)`);
      check('note planted', await c.js(`!!sessionStorage.getItem('gcSwResume')`), 'swResumeSave() wrote one before the plain reload');
      await page.send('Page.reload', {});
    } else {
      c.step('switching the server to version 2 and asking for the update');
      site.dir = env.v2;
      /* The update check, as a visit makes it. Its outcome is kept (window.__gcUpd) and, when it brings no new worker
         (no install, no takeover, no reload) within 10 s, it is asked again, at most twice: a real visit would check
         again on the next navigation. Each retry is printed with why. */
      const ask = `(window.__gcUpd = 'asked', navigator.serviceWorker.getRegistration().then(r => r ? r.update() : Promise.reject(new Error('no registration')))
        .then(() => { window.__gcUpd = 'resolved'; }, e => { window.__gcUpd = 'rejected: ' + (e && e.message); }), true)`;
      await c.js(ask);
      res.retries = [];
      for (let k = 0; k < 2; k++) {
        const moved = await c.until(`update check ${k + 1}: waiting for a new worker`, `window.__gcOldDoc !== 1 || window.__gcTook > 0 || (async () => { const r = await navigator.serviceWorker.getRegistration();
          return !!(r && (r.installing || r.waiting)) || (await caches.keys()).includes(${JSON.stringify(V2)}); })()`, 10000, 100);
        if (moved) break;
        const why = await c.js(`(async () => { const r = await navigator.serviceWorker.getRegistration(); return { upd: window.__gcUpd, active: r && r.active && r.active.state, caches: (await caches.keys()).filter(k => !/audio/.test(k)) }; })()`).catch(e => ({ err: e.message }));
        res.retries.push(`no new worker 10 s after update() (${JSON.stringify(why)}; the server sent sw.js ${site.swHits.length} time(s), from ${[...new Set(site.swHits.map(d => d === env.v2 ? 'version 2' : d === env.v1 ? 'version 1' : d))].join(', ') || 'nowhere'}): asked again`);
        await c.js(ask);
      }
    }

    // 5. Busy: the reload must wait while the thing goes on, and come once it ends (or at the cap).
    if (cs.busy) {
      // Stops early if the page goes (a reload that did not wait: the next check says so).
      const took = await c.until('busy: waiting for version 2 to take over', `window.__gcOldDoc !== 1 ? 'gone' : window.__gcTook > 0 ? 'took' : ''`, 20000, 100);
      check('version 2 took over while busy', !!took, took === 'took' ? 'controllerchange heard by the old page' : took === 'gone' ? 'the page reloaded at once' : 'no takeover in 20 s');
      const up = async () => (await c.js(`window.__gcOldDoc === 1`).catch(() => false)) && navs === 0 && asked === 0;
      if (cs.busy === 'others') {
        // One reason after another, each held CYCLE_MS; the next is set before this one is cleared.
        let ok = true;
        for (let i = 0; i < CYCLE.length && ok; i++) {
          c.step(`busy: holding ${CYCLE[i][0]}`);
          if (i > 0) { await c.js(CYCLE[i][1]); await c.js(CYCLE[i - 1][2]); }
          await sleep(CYCLE_MS);
          ok = await up();
          check(`no reload while ${CYCLE[i][0]}`, ok, ok ? `the old page is still up after ${CYCLE_MS / 1000} s` : `the page reloaded (${navs} navigation(s), ${asked} asked for)`);
        }
        if (ok) {
          c.step('busy: clearing the last reason');
          await c.js(CYCLE[CYCLE.length - 1][2]).catch(() => null);
          const t1 = Date.now();
          const gone = await c.until('busy: waiting for the reload after the last reason ended', `window.__gcOldDoc !== 1`, 6000, 100);
          check('reload once it ended', !!gone, gone ? `${((Date.now() - t1) / 1000).toFixed(1)} s after the last reason ended` : 'no reload within 6 s of the end');
        }
      }
      c.step('busy: watching for a reload that must not come');
      if (cs.busy !== 'others') await sleep(6000);
      const still = cs.busy !== 'others' && await up();
      if (cs.busy !== 'others') check('no reload while busy (6 s)', still, still ? 'the old page is still up' : `the page reloaded mid-${cs.busy} (${navs} navigation(s), ${asked} asked for)`);
      if (still && cs.cap) {
        const busyNow = await c.js(BUSY[cs.busy].on.includes('shuffleDrills') ? `shuffleDrills['gc-test'] && shuffleDrills['gc-test'].phase === 'play'` : 'true');
        /* The cap from below (review R1-1): the page clock moved to 4:50 after the takeover (when the page's wait started),
           held 4 s (two of its 1.5 s checks): still no reload. Then past 5:00. */
        c.step('busy-cap: moving the page clock to 4:50');
        const at = (ms) => `(window.__clockOffset = window.__gcTookAt + ${ms} - (Date.now() - (window.__clockOffset || 0)), Date.now() - window.__gcTookAt)`;
        const t450 = await c.js(at(4 * 60000 + 50000));
        await sleep(4000);
        const wait450 = await up();
        const shown450 = await c.js(`Math.round((Date.now() - window.__gcTookAt) / 1000)`).catch(() => null);
        check('no reload at 4:50, still busy', wait450, wait450 ? `the old page is still up at ${Math.floor(shown450 / 60)}:${String(shown450 % 60).padStart(2, '0')} on the page clock (moved to ${Math.round(t450 / 1000)} s after the takeover)` : `the page reloaded before the 5-minute cap (page clock moved to ${Math.round(t450 / 1000)} s after the takeover; ${navs} navigation(s))`);
        c.step('busy-cap: moving the page clock past 5 minutes');
        if (wait450) await c.js(at(5 * 60000 + 1000));
        const gone = await c.until('busy-cap: waiting for the reload at the cap', `window.__gcOldDoc !== 1`, 6000, 100);
        if (wait450) check('reload at the 5-minute cap, still busy', busyNow && !!gone, gone ? `reloaded ${((Date.now() - tUpd) / 1000).toFixed(1)} s after the update (page clock 5:01 after the takeover), drill still mid-round` : 'no reload after the clock passed 5 minutes');
      } else if (still) {
        check('still busy at the end of the wait', await c.js(BUSY[cs.busy].is), BUSY[cs.busy].is);
        c.step('busy: ending the busy thing');
        await c.js(BUSY[cs.busy].off).catch(() => null);
        const t1 = Date.now();
        const gone = await c.until('busy: waiting for the reload after it ended', `window.__gcOldDoc !== 1`, 6000, 100);
        check('reload once it ended', !!gone, gone ? `${((Date.now() - t1) / 1000).toFixed(1)} s after it ended` : 'no reload within 6 s of the end');
      }
    }

    // 6. The page's own reload, then the sign-in that takes the note.
    const ready = await c.until('waiting for the page to reload itself', `window.__gcOldDoc !== 1 && document.readyState === 'complete' && typeof devBypass === 'function'`, 40000, 100);
    if (!ready) {
      // Why not: the worker's state and what the page's wait reads (diagnosis only).
      const why = await c.js(`(async () => { const r = await navigator.serviceWorker.getRegistration(); const st = w => w ? w.state + ' ' + (w.scriptURL || '').split('/').pop() : null;
        return { took: window.__gcTook, active: st(r && r.active), waiting: st(r && r.waiting), installing: st(r && r.installing), caches: await caches.keys(),
          busy: { authBoot: !!window.__authBootPending, popup: !!window.__authPopupPending, mic: !!window.coachMicLive, pc: typeof pcState !== 'undefined' && !!pcState,
            ec: Object.keys(ecRuns), rec: Object.keys(recState).filter(k => recState[k] && (recState[k].starting || recState[k].recording)), nc: ncLive, chc: chcLive,
            drills: [shuffleDrills, deckDrills, earDrills].map(o => Object.keys(o).filter(k => o[k] && (o[k].phase === 'play' || o[k].phase === 'run'))) },
          reloading: !!window.__swReloading, audio: document.querySelectorAll('audio').length, media: [...document.querySelectorAll('audio,video')].map(m => (m.currentSrc || m.src || '').split('/').pop() + ':' + m.readyState + ':' + m.networkState) }; })()`).catch(e => 'unreadable: ' + e.message);
      throw new Error('the page did not reload within 40 s of the update: ' + JSON.stringify(why));
    }
    res.reloadS = ((Date.now() - tUpd) / 1000).toFixed(1);
    const landed = await c.js(`({ note: sessionStorage.getItem('gcSwResume'), marker: typeof t === 'function' ? t(${JSON.stringify(MARK_KEY)}) : '', caches: null })`);
    // The shell caches (the audio caches keep their names across versions on purpose: sw.js AUDIO_CACHE).
    landed.caches = (await c.js(`caches.keys()`)).filter(k => !/audio/.test(k));
    let seeded = null;
    /* Rows above the one being read made taller, in the new page only (review R1-5): the restore goes by that row, so the
       row lands where it was and the pane's scrollTop moves by the extra height; a restore by plain scrollTop would leave
       the row SHIFT_PX lower. Only for the cases that compare the row. */
    const shifted = !!(cs.fields && cs.fields.includes('anchor'));
    if (shifted) await c.js(`(() => { const st = document.createElement('style'); st.id = 'gc-test-shift'; st.textContent = '#week-panels .dp { padding-top: ${SHIFT_PX + 12}px !important; }'; document.head.appendChild(st); return true; })()`);
    if (cs.console) seeded = await signIn('sign-in after the reload');
    else {
      c.step('sign-in after the reload');
      /* Every save the new page starts from here on, counted (review R1-6): under the dev bypass queueSave() clears its
         dirty set at once, so a save asked for leaves no trace in _dirtyKeys or the maps. Wrapped in this test page only. */
      await c.js(`(() => { window.__gcSaves = []; for (const n of ['queueSave', 'flushSave']) { const real = window[n]; if (typeof real !== 'function') continue;
        window[n] = function (...a) { window.__gcSaves.push(n + '(' + a.join(',') + ')'); return real.apply(this, a); }; } return true; })()`);
      await c.js(SEED);
      if (cs.person) {
        // Hold back what the restore waits for (the module change renderAll starts), in this test page only, so the person's input lands first.
        await c.js(`(() => { window.__gcHold = new Promise(r => { window.__gcRelease = r; }); const real = onModuleChange;
          window.onModuleChange = function(...a) { const p = real.apply(this, a); return Promise.all([p, window.__gcHold]).then(v => v[0]); }; return true; })()`);
      }
      if (cs.otherUser) await c.js(`(currentUser = { uid: 'gc-test-other-user', displayName: 'Other Student', email: 'other@example.test', photoURL: null }, restoreLocalPlace(), showApp(currentUser), true)`);
      else await c.js(`(devBypass(), true)`);
      if (cs.person) {
        c.step(`person: ${cs.person} before the restore lands`);
        await sleep(400);
        const pt = await c.js(NEUTRAL_POINT);
        if (!pt) throw new Error('no neutral spot to press');
        if (cs.person === 'press') {
          await page.send('Input.dispatchMouseEvent', { type: 'mousePressed', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
          await page.send('Input.dispatchMouseEvent', { type: 'mouseReleased', x: pt.x, y: pt.y, button: 'left', clickCount: 1 });
        } else if (cs.person === 'key') {
          for (const type of ['keyDown', 'keyUp']) await page.send('Input.dispatchKeyEvent', { type, key: 'Shift', code: 'ShiftLeft', windowsVirtualKeyCode: 16 });
        } else await page.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: pt.x, y: pt.y, deltaX: 0, deltaY: 120 });
        await sleep(300);
        res.personAt = await c.js(MEASURE(placed.anchor));
        await c.js(`(window.__gcRelease(), true)`);
      }
    }
    if (cs.late) {
      /* The person wins after the restore has landed (review R1-2): wait until the place is back, then turn the wheel up
         while the restore's scroll loop (8 s from its start) is still running, and see that the loop leaves it there. */
      const tIn = Date.now();
      const backNow = cs.console
        ? `(() => { const m = ${MEASURE_CONSOLE}; return m.view === ${JSON.stringify(before.view)} && Math.abs(m.winY - ${before.winY}) <= ${tol} ? m : null; })()`
        : `(() => { const m = ${MEASURE(placed.anchor)}; return JSON.stringify(m.open) === ${JSON.stringify(JSON.stringify(before.open))} && JSON.stringify(m.folds) === ${JSON.stringify(JSON.stringify(before.folds))} && m.anchorTop != null && Math.abs(m.anchorTop - ${before.anchorTop}) <= ${tol} ? m : null; })()`;
      const back = await c.until('person-late: waiting for the restore to land', backNow, 8000, 100);
      const landedMs = Date.now() - tIn;
      check('restore landed first', !!back, back ? `${(landedMs / 1000).toFixed(1)} s after the sign-in` : 'the place did not come back within 8 s of the sign-in');
      if (back) {
        const pt = await c.js(NEUTRAL_POINT);
        if (!pt) throw new Error('no neutral spot to turn the wheel on');
        // The lowest scroll position seen from here on, so a wheel that scrolled and was then pulled back still shows it scrolled.
        const pos = cs.console ? `Math.round(scrollY)` : `Math.round(document.getElementById('main-content').scrollTop)`;
        await c.js(`(window.__gcMinY = ${pos}, document.addEventListener('scroll', () => { window.__gcMinY = Math.min(window.__gcMinY, ${pos}); }, true), true)`);
        await page.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: pt.x, y: pt.y, deltaX: 0, deltaY: -120 });
        res.lateWheelMs = Date.now() - tIn;
        await sleep(800);
        res.personAt = cs.console ? await c.js(MEASURE_CONSOLE) : await c.js(MEASURE(placed.anchor));
        res.minY = await c.js(`window.__gcMinY`);
      }
    }
    // 7. The restore: retries for up to 8 s (SW_RESUME_SCROLL_MS); the console starts its scroll after the first paint.
    c.step('waiting for the restore to finish (10 s)');
    await sleep(10000);
    const saves = cs.console ? null : await c.js(`window.__gcSaves || null`);
    const after = cs.console ? await c.js(MEASURE_CONSOLE) : await c.js(MEASURE(placed.anchor));
    vsay(`    [${cs.name}] after:  ${JSON.stringify(after)}`);
    const tail = await c.js(`({ note: sessionStorage.getItem('gcSwResume'), lang: document.documentElement.lang })`);

    // ── Verdicts ──
    if (cs.ordinary) check('version 1 still (no update)', !String(landed.marker).includes(MARK) && same(landed.caches, [V1]), `${JSON.stringify(landed.caches)}`);
    else check('version 2 landed', String(landed.marker).includes(MARK) && same(landed.caches, [V2]), `marker ${String(landed.marker).includes(MARK) ? 'on' : 'MISSING'}, caches ${JSON.stringify(landed.caches)}`);
    const counts = `${navs} committed, ${asked} asked for, ${docs} document request(s)`;
    check('reloaded exactly once', navs === 1 && asked <= 1 && docs === 1, counts);
    check('note gone', landed.note === null && tail.note === null, landed.note === null && tail.note === null ? 'gcSwResume not in sessionStorage' : 'gcSwResume still there');
    if (cs.console) {
      const storeAfter = await c.js(STORE);
      check('restore wrote nothing', storeAfter === seeded, storeAfter === seeded ? `stub Firestore unchanged (${JSON.parse(seeded).length} docs)` : 'the stub Firestore changed during the restore');
    } else {
      const stateAfter = await c.js(STATE);
      const b = JSON.parse(stateBefore), a = JSON.parse(stateAfter);
      const diff = Object.keys({ ...b, ...a }).filter(k => !same(b[k], a[k]));
      const ls = diff.includes('localStorage') ? Object.keys({ ...b.localStorage, ...a.localStorage }).filter(k => b.localStorage[k] !== a.localStorage[k]) : [];
      if (cs.otherUser) res.notes.push('saved maps not compared: another account signed in (its own maps)');
      else check('restore wrote nothing', !diff.length, diff.length ? `changed: ${diff.join(', ')}${ls.length ? ' (localStorage ' + ls.join(', ') + ')' : ''}` : `${Object.keys(a.completed).length + Object.keys(a.responses).length + Object.keys(a.classActivities).length + Object.keys(a.caSteps).length} seeded entries and ${Object.keys(a.localStorage).length} localStorage keys the same`);
      check('restore started no save', Array.isArray(saves) && !saves.length, !Array.isArray(saves) ? 'the save counter was not installed' : saves.length ? `${saves.length} call(s): ${[...new Set(saves)].slice(0, 4).join(', ')}` : 'no queueSave() or flushSave() call from the sign-in to 10 s after it');
    }
    const home = ['#class-activities'];
    if (cs.fields && !cs.person && !cs.otherUser && !(cs.noteAge > 10 * 60000) && !cs.ordinary && !cs.peek) {
      for (const [n, ok, shown] of cmpPlace(cs.fields, before, after)) check(n, ok, shown);
    }
    if (shifted) check('rows above made taller', after.dpPad === `${SHIFT_PX + 12}px` && before.dpPad !== after.dpPad, `lesson box padding ${before.dpPad} → ${after.dpPad}; pane ${before.paneY} → ${after.paneY} (row restore: the pane moves by the extra ${SHIFT_PX}px, the row does not)`);
    if (cs.noteAge) {
      /* A check, not a note (review R2-1): if the new page found no note to age, note-fresh would pass on a note 0 s old
         and the 9:58 / 10:01 pair would no longer bracket the limit. */
      const ageSet = await c.js('window.__gcNoteAgeSet || null');
      check('note age set on the new page', ageSet === cs.noteAge, `${ageSet} ms at its first line (wanted ${cs.noteAge})`);
    }
    if (cs.behind) {
      // Close Songs with its own control and read the lesson behind it.
      c.step('lesson-behind: closing Songs');
      if (!await c.js(clickSel('[onclick="closeSongsScreen()"]'))) await c.js(`(closeSongsScreen(), true)`);
      await c.until('lesson-behind: Songs closed', `(() => { const e = document.getElementById('songs-screen'); return !e || e.hasAttribute('hidden'); })()`, 8000);
      await sleep(1200);
      const lb = placed.lessonBefore, la = await c.js(MEASURE(placed.anchor));
      vsay(`    [${cs.name}] lesson before: ${JSON.stringify(lb)}\n    [${cs.name}] lesson after:  ${JSON.stringify(la)}`);
      for (const [n, ok, shown] of cmpPlace(LESSON_FIELDS, lb, la)) check('lesson behind: ' + n, ok, shown);
    }
    if (cs.late) {
      const p = res.personAt;
      if (p) {
        const moved = cs.console ? before.winY - p.winY : before.paneY - p.paneY, now = cs.console ? after.winY : after.paneY, then = cs.console ? p.winY : p.paneY;
        const was = cs.console ? before.winY : before.paneY;
        check('the wheel moved the page', was - res.minY > 40, `${was - res.minY}px up at most (${was} → ${res.minY}), ${(res.lateWheelMs / 1000).toFixed(1)} s after the sign-in`);
        check('scroll left to the person', moved > 40 && now === then, `${then} 0.8 s after the wheel, ${now} 10 s later (restored place ${was}, lowest seen ${res.minY})`);
      }
    }
    if (cs.person) {
      const p = res.personAt;
      check('restore stopped', !same(after.open, before.open) && !same(after.folds, before.folds),
        `open ${JSON.stringify(after.open)} (saved ${JSON.stringify(before.open)}), folds ${JSON.stringify(after.folds)}`);
      const d = after.anchorTop == null || before.anchorTop == null ? null : after.anchorTop - before.anchorTop;
      check('scroll left to the person', after.paneY === p.paneY && (d === null || Math.abs(d) > tol), `pane ${p.paneY} after the ${cs.person}, ${after.paneY} 10 s later (saved place ${before.paneY})`);
    }
    if (cs.otherUser || cs.noteAge > 10 * 60000 || cs.ordinary) {
      check('home page, not the saved place', same(after.page, ['class-activities-screen']) && home.includes(after.hash), `address ${JSON.stringify(after.hash)}, page ${JSON.stringify(after.page)} (saved: ${JSON.stringify(before.hash)} lesson ${before.set})`);
      check('saved step and fold not applied', !same(after.folds, before.folds) || !after.folds.length, `folds ${JSON.stringify(after.folds)}`);
    }
    if (cs.peek) {
      check('the real set, not the preview', after.set === placed.real && !after.peek, `set ${after.set}${after.peek ? ' (preview)' : ''}; previewed ${placed.peeked}, real ${placed.real}`);
      check('preview scroll not restored', after.paneY <= tol, `pane ${after.paneY}px (was ${before.paneY}px)`);
    }
    if (cs.name === 'spanish') check('still Spanish', tail.lang === 'es', tail.lang);
    // Cleanup of this profile's worker and caches (the profile folder goes too).
    c.step('removing the worker and caches');
    await c.js(`(async () => { for (const r of await navigator.serviceWorker.getRegistrations()) await r.unregister(); for (const k of await caches.keys()) await caches.delete(k); return true; })()`, 15000).catch(() => null);
  } catch (e) {
    check('ran', false, String(e && e.message || e).split('\n')[0]);
  } finally {
    if (page) page.close();
    mark(`${cs.name}: closing Chrome`);
    await stopChrome();
    // Taken off the exit list only once it has run, so a signal arriving during the removal still removes it.
    if (!(await dropProfile())) res.notes.push(`profile folder still there after Chrome closed: ${prof}`);
    cleanup.splice(cleanup.indexOf(dropProfile), 1);
  }
  res.ms = Date.now() - t0;
  return res;
}

/* ── Main ── */
const tStart = Date.now();
let exitCode = 0;
try {
  const SITE = opt('--site') ? resolve(opt('--site')) : null;
  if (SITE && !existsSync(SITE)) { console.error(`update-reload: no folder ${SITE}`); process.exit(2); }
  mark('setup: copying the site (version 1)');
  const v1 = copySite(SITE, 'v1');
  const V1 = swVersion(v1), want1 = wantedAssets(v1) || [];
  let v2 = null, V2 = null, built = null;
  if (V1 && opt('--v2')) {
    v2 = resolve(opt('--v2')); V2 = swVersion(v2);
    if (!V2 || V2 === V1) { console.error(`update-reload: --v2 ${v2} has CACHE_VERSION ${V2} (version 1: ${V1})`); exitCode = 2; throw new Error('bad --v2'); }
    // Version 2 must be THIS site plus the marker: every file the same but i18n.js (the marker) and sw.js (its version lines).
    const out = (() => { try { return execFileSync('diff', ['-rq', '-x', 'audio', '-x', '.claude', '-x', '.loudness-cache.json', '-x', 'i18n.js', '-x', 'sw.js', v1, v2], { encoding: 'utf8' }); } catch (e) { return e.stdout || String(e); } })();
    const i18nOk = readFileSync(join(v1, 'i18n.js'), 'utf8').replace(MARK_RE, (all, a, en, b, es, c) => a + en + MARK + b + es + MARK + c) === readFileSync(join(v2, 'i18n.js'), 'utf8');
    if (out.trim() || !i18nOk) { console.error(`update-reload: --v2 ${v2} is not version 1 plus the marker:\n${out.trim().split('\n').slice(0, 5).join('\n')}${i18nOk ? '' : '\n  i18n.js differs beyond the marker'}`); exitCode = 2; throw new Error('bad --v2'); }
  }
  else if (V1) {
    built = await buildV2(v1);
    v2 = built.v2;
    V2 = swVersion(v2);
    if (!V2 || V2 === V1) { console.error(`update-reload: version 2 has CACHE_VERSION ${V2} (version 1: ${V1}); checks.mjs exit ${built.checksExit}`); exitCode = 2; throw new Error('no version 2'); }
  } else {
    // No sw.js: nothing will ever control the page; the run goes on so the watchdog can say where it stopped.
    say(`update-reload: ! ${join(SITE || ROOT, 'sw.js')} is missing: version 2 not built`);
    v2 = v1;
  }
  if (args.includes('--build-only')) {
    say(`update-reload: --build-only: version 1 ${V1} in ${v1}\nupdate-reload: --build-only: version 2 ${V2} in ${v2}${built ? ` (checks.mjs ${built.seconds} s, exit ${built.checksExit})` : ''}`);
    cleanup.length = 0;
    throw Object.assign(new Error('built'), { built: true });
  }
  const { srv, port } = await serve(); cleanup.push(() => srv.close());
  const base = `http://127.0.0.1:${port}`;
  say(`update-reload: version 1 ${V1} (${want1.length} files to cache), version 2 ${V2}${built ? ` (checks.mjs ${built.seconds} s, exit ${built.checksExit})` : ''}; ${RUN.length} case(s), one fresh Chrome profile each`);
  if (KEEP) say(`update-reload: --keep: version 1 in ${v1}, version 2 in ${v2}`);
  const env = { base, v1, v2, V1, V2, want1, stub: consoleStub(), profiles: [] };
  const results = [];
  for (const cs of RUN) {
    say(`update-reload: ▸ ${cs.name}`);
    const r = await runCase(cs, env);
    results.push(r);
    const bad = r.checks.filter(x => !x[1]);
    say(`  ${bad.length ? '✗' : '✓'} ${r.name} (${(r.ms / 1000).toFixed(0)} s${r.reloadS ? `, reload ${r.reloadS} s after the update` : ''}): ${r.note || ''}`);
    for (const line of r.retries || []) say(`      ! ${line}`);
    for (const line of r.notes || []) say(`      · ${line}`);
    for (const [n, ok, shown] of r.checks) if (!ok || VERBOSE || /Δ|reload|took|busy|stopped|person|home|preview|real set|Spanish|note planted|version 1|4:50|while|save|taller|wheel|landed|behind/.test(n)) say(`      ${ok ? '✓' : '✗'} ${n}: ${shown}`);
    if (!bad.length) say(`      fields: ${r.checks.map(x => x[0]).join(' · ')}`);
  }
  const failed = results.filter(r => r.checks.some(x => !x[1]));
  const nChecks = results.reduce((s, r) => s + r.checks.length, 0), nBad = results.reduce((s, r) => s + r.checks.filter(x => !x[1]).length, 0);
  const left = env.profiles.filter(p => existsSync(p));
  say(`update-reload: ${results.length - failed.length} of ${results.length} cases passed, ${nChecks - nBad} of ${nChecks} checks; ${env.profiles.length} Chrome profiles made, ${left.length} left behind; ${((Date.now() - tStart) / 1000).toFixed(0)} s`);
  if (left.length) {
    say(`update-reload: ✗ profile folders left: ${left.join(', ')}`);
    // What is in each, and who still has it open (the next fix starts from these).
    for (const p of left) {
      let inside = '';
      try { inside = readdirSync(p).slice(0, 12).join(', '); } catch (e) { inside = `(cannot list: ${e.code || e.message})`; }
      say(`      ${p}: ${inside || '(empty)'}; processes naming it: ${holders(p).join(', ') || 'none'}`);
    }
    exitCode = 1;
  }
  if (failed.length) { say(`update-reload: ✗ failed: ${failed.map(r => r.name).join(', ')}`); exitCode = 1; }
} catch (e) {
  if (e && e.built) exitCode = 0;
  else if (!exitCode) { console.error('update-reload: could not run —', e && e.message); exitCode = 2; }
} finally {
  clearInterval(watchdog);
  await runCleanup();
}
process.exit(exitCode);
