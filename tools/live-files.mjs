#!/usr/bin/env node
/* Is every public file on the live site the one we pushed? (2026-11-26)

   `node tools/checks.mjs --live` compares one line, the live sw.js CACHE_VERSION.
   This tool compares EVERY file GitHub Pages publishes, byte for byte, with the
   same path at the commit that was deployed. It catches a failed or half-done
   deploy and a CDN copy that stayed stale (a fresh sw.js next to an old app part).
   Node only, no packages, writes nothing.

     node tools/live-files.mjs                      the commit checked out (HEAD)
     node tools/live-files.mjs --sha <commit>       a given commit
     node tools/live-files.mjs --self-test          a local server, no network (below)
     node tools/live-files.mjs --list               print the public files and stop

   GitHub runs it after every push to main and once a day
   (.github/workflows/live-files.yml).

   Which files are public: GitHub Pages builds this repo with Jekyll from the
   branch (there is no .nojekyll file), so the site is every file in the commit
   EXCEPT what Jekyll leaves out: a path with a part that starts with "." "_" "#"
   or "~" or ends with "~", and the `exclude:` list of the commit's _config.yml
   (matched as Jekyll 3 does: a glob in which * also matches "/", or a plain
   prefix), unless its `include:` list names it. A file that starts with "---"
   (front matter) would be rendered by Jekyll, not copied: such a file is only
   checked for being there (none today). The files the site cannot run without
   (index.html, sw.js and every file its lists name, every app / coach / teacher
   part, module-N.js, i18n.js, class-activities.js, tabs/*.html, the CSS,
   privacy.html, firebase-config.js, manifest.json) must be in the commit AND
   public, or the run fails before it fetches anything.

   How each file is compared (the live address is LIVE_BASE below):
     - every file but the backing tracks: downloaded and its sha256 compared with
       the commit's bytes; the site root "/" is compared with index.html;
     - audio/*.mp3 (and .m4a .wav .ogg; about 290 MB): not downloaded. Each one
       must answer a HEAD request with 200 and the commit's size, and its hash in
       the commit's sw.js AUDIO_HASHES must be the commit's bytes (sw.js itself is
       compared byte for byte, so the live map is the commit's map).
       --audio-bytes downloads and hashes them too.
   Every request carries a new ?lf=… query, which the CDN (Fastly) treats as a
   new address, and `cache-control: no-cache`. A file that differs or is missing
   is tried again, all of them together in up to three more passes (--retries 3)
   after waits of 10 s, 30 s and 60 s (--retry-delay 10 is the first wait, then
   x3 and x6), so a CDN edge that is still catching up is not a failure; after
   the last pass it is.

   Waiting for the deploy (skipped with --no-wait or a --base that is not the
   live site): GitHub's Deployments API (environment github-pages) is read with
   $GITHUB_TOKEN / $GH_TOKEN, else through `gh api`, else unauthenticated. The
   run waits (--wait 15 minutes) until the commit's deployment says "success".
     - A deployment of a LATER commit (GitHub's compare API: "ahead") means a
       newer push superseded this one: the run says so and passes, because that
       push's own run checks the site. It is looked at before anything is
       fetched, and again if anything differs, in case it landed mid-run.
     - "failure" or "error" fails the run, with the deploy's log address.
     - Not done in time fails the run.
   With no API at all it waits instead until the live sw.js CACHE_VERSION is the
   commit's (as checks.mjs --live does); a live version that belongs to a later
   commit in the local history counts as superseded. That route is weaker: a
   commit that changed only files outside the version's fingerprint has the
   previous version, so the wait ends at once and only the retries cover it.

   Output: one line per file that differs ("✗ <path>  expected <sha256 12>  live
   <sha256 12 | 404 | error>"), then one summary line that starts "live-files:".
   Exit 0 every file matches (or a later push superseded the commit), 1 a file
   differs or is missing, or the deploy failed or did not finish in time,
   2 could not run (bad arguments, an unknown commit, the live site not reached).

   --self-test: serves the commit's own public files from a local server and
   runs the real comparison against it three times: unchanged (must pass, and
   must have compared more than 150 files), with three planted faults (one app
   part with a changed byte, a module file missing, a backing track one byte
   longer: must fail on exactly those three), and a file that is stale on the
   first request only (must pass after one retry). It also checks that a
   _config.yml excluding app/ fails on the required parts. No network; seconds. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';

const LIVE_BASE = 'https://jhoffmanteacher.github.io/guitar-class/';
const REPO = 'jhoffmanteacher/guitar-class';
const AUDIO_RE = /^audio\/.*\.(mp3|m4a|wav|ogg)$/i;

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : dflt; };
const USAGE = 'usage: node tools/live-files.mjs [--sha <commit>] [--base <url>] [--wait <minutes>] [--no-wait] [--retries <n>] [--retry-delay <seconds>] [--audio-bytes] [--concurrency <n>] [--list] | --self-test';
if (has('--help')) { console.log(USAGE); process.exit(0); }

const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');
const short = (h) => (h ? h.slice(0, 12) : '?');
const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const git = (args, opts = {}) => execFileSync('git', args, { maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'pipe'], ...opts });

/* ── which files are public ─────────────────────────────────────────── */

/* The `exclude:` and `include:` lists of a _config.yml (a block list of strings;
   that is all this repo's file uses). */
export function jekyllLists(text) {
  const out = { exclude: [], include: [] };
  let cur = null;
  for (const raw of String(text || '').split(/\r?\n/)) {
    const line = raw.replace(/\s+#.*$/, '');
    if (/^\s*(#|$)/.test(raw)) continue;
    const key = line.match(/^([A-Za-z_]+)\s*:\s*(.*)$/);
    if (key) {
      cur = (key[1] === 'exclude' || key[1] === 'include') ? key[1] : null;
      const inline = key[2].trim();
      if (cur && inline.startsWith('[')) {
        out[cur].push(...inline.replace(/^\[|\]$/g, '').split(',').map(s => s.trim().replace(/^["']|["']$/g, '')).filter(Boolean));
        cur = null;
      }
      continue;
    }
    const item = line.match(/^\s*-\s*(.+?)\s*$/);
    if (cur && item) out[cur].push(item[1].replace(/^["']|["']$/g, ''));
  }
  return out;
}

/* Jekyll 3's EntryFilter#glob_include?: File.fnmatch without FNM_PATHNAME (so *
   matches "/"), or the path starts with the pattern. */
function jekyllGlob(pattern, path) {
  if (path.startsWith(pattern) || pattern === `${path}/`) return true;
  let re = '';
  for (const ch of pattern) {
    if (ch === '*') re += '.*';
    else if (ch === '?') re += '.';
    else re += ch.replace(/[.+^${}()|[\]\\]/g, '\\$&');
  }
  return new RegExp(`^${re}$`).test(path);
}

/* Jekyll's defaults (Configuration::DEFAULTS); none of these exists in the repo. */
const JEKYLL_DEFAULT_EXCLUDE = ['Gemfile', 'Gemfile.lock', 'node_modules', 'vendor/bundle/', 'vendor/cache/', 'vendor/gems/', 'vendor/ruby/'];

export function isPublished(path, lists) {
  const included = lists.include.some(p => jekyllGlob(p, path));
  const special = path.split('/').some(part => /^[._#~]/.test(part) || part.endsWith('~'));
  if (special && !included) return false;
  const excl = [...JEKYLL_DEFAULT_EXCLUDE, ...lists.exclude].filter(p => !lists.include.includes(p));
  return !excl.some(p => jekyllGlob(p, path));
}

/* Every blob of the commit: path, object id, size. */
function treeOf(sha) {
  const out = new Map();
  const raw = git(['ls-tree', '-r', '-z', '-l', '--full-tree', sha]).toString('utf8');
  for (const rec of raw.split('\0')) {
    if (!rec) continue;
    const m = rec.match(/^(\d+) (\w+) ([0-9a-f]+)\s+(\d+|-)\t(.*)$/s);
    if (!m || m[2] !== 'blob' || m[1] === '120000') continue;
    out.set(m[5], { oid: m[3], size: Number(m[4]) });
  }
  return out;
}
const blobCache = new Map();
/* Audio is read once and never kept (about 290 MB). */
function blob(oid, keep = true) {
  if (blobCache.has(oid)) return blobCache.get(oid);
  const b = git(['cat-file', 'blob', oid]);
  if (keep) blobCache.set(oid, b);
  return b;
}

/* The paths sw.js names (ASSETS, PRECACHE_CRITICAL: every './x' string in a
   const X = [ … ] list) and its AUDIO_HASHES map. */
function swLists(swText) {
  const listed = new Set();
  for (const m of swText.matchAll(/const\s+[A-Z_]+\s*=\s*\[([\s\S]*?)\];/g)) {
    for (const s of m[1].matchAll(/'\.\/([^']*)'/g)) listed.add(s[1] === '' ? 'index.html' : s[1]);
  }
  const audio = {};
  const block = swText.match(/const AUDIO_HASHES = \{([\s\S]*?)\};/);
  if (block) for (const m of block[1].matchAll(/"([^"]+)":\s*'([0-9a-f]+)'/g)) audio[m[1]] = m[2];
  return { listed, audio };
}

const REQUIRED_RE = [
  /^index\.html$/, /^sw\.js$/, /^app\/[^/]+\.js$/, /^coach-[^/]+\.js$/, /^teacher-[^/]+\.js$/,
  /^module-\d+\.js$/, /^i18n\.js$/, /^class-activities\.js$/, /^tabs\/[^/]+\.html$/, /^[^/]+\.css$/,
  /^privacy\.html$/, /^firebase-config\.js$/, /^manifest\.json$/,
];

/* What the deploy of <sha> publishes, and the problems that need no network. */
export function plan(sha, { configText } = {}) {
  const tree = treeOf(sha);
  const cfg = configText != null ? configText : (tree.has('_config.yml') ? blob(tree.get('_config.yml').oid).toString('utf8') : '');
  const lists = jekyllLists(cfg);
  const problems = [];
  const files = [];
  for (const [path, info] of tree) {
    if (!isPublished(path, lists)) continue;
    files.push({ path, ...info, audio: AUDIO_RE.test(path) });
  }
  const published = new Set(files.map(f => f.path));
  if (!tree.has('sw.js')) { problems.push({ path: 'sw.js', why: 'the commit has no sw.js' }); return { files, problems, published }; }
  const { listed, audio } = swLists(blob(tree.get('sw.js').oid).toString('utf8'));
  const required = new Set(listed);
  for (const p of tree.keys()) if (REQUIRED_RE.some(re => re.test(p))) required.add(p);
  for (const p of [...required].sort()) {
    if (!tree.has(p)) problems.push({ path: p, why: 'sw.js lists it, but the commit has no such file' });
    else if (!published.has(p)) problems.push({ path: p, why: 'the site needs it, but _config.yml leaves it out of the deploy' });
  }
  for (const f of files) {
    if (!f.audio) continue;
    const want = sha256(blob(f.oid, false)).slice(0, 10);
    if (audio[f.path] !== want) problems.push({ path: f.path, why: `sw.js AUDIO_HASHES says ${audio[f.path] || 'nothing'}, the commit's bytes hash to ${want}` });
  }
  for (const p of Object.keys(audio)) if (!tree.has(p)) problems.push({ path: p, why: 'sw.js AUDIO_HASHES names it, but the commit has no such file' });
  /* The site root is served as index.html. */
  if (published.has('index.html')) files.push({ ...files.find(f => f.path === 'index.html'), path: '', audio: false });
  files.sort((a, b) => a.path.localeCompare(b.path));
  return { files, problems, published };
}

/* ── fetching and comparing ─────────────────────────────────────────── */

let bust = 0;
function urlFor(base, path) {
  const u = new URL(path.split('/').map(encodeURIComponent).join('/'), base);
  u.searchParams.set('lf', `${Date.now().toString(36)}-${(bust++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  return u.href;
}

async function liveOnce(base, f, audioBytes) {
  const headOnly = f.audio && !audioBytes;
  try {
    const res = await fetch(urlFor(base, f.path), {
      method: headOnly ? 'HEAD' : 'GET',
      headers: { 'cache-control': 'no-cache', pragma: 'no-cache', 'user-agent': 'guitar-class-live-files' },
      signal: AbortSignal.timeout(f.audio ? 120000 : 30000),
      redirect: 'follow',
    });
    if (res.status !== 200) { try { await res.body?.cancel(); } catch { /* nothing to cancel */ } return { live: String(res.status) }; }
    if (headOnly) {
      const enc = res.headers.get('content-encoding');
      const len = res.headers.get('content-length');
      if (enc || len == null) return liveOnce(base, f, true);
      return Number(len) === f.size ? { ok: true } : { live: `${len} bytes (commit: ${f.size})` };
    }
    const got = Buffer.from(await res.arrayBuffer());
    const want = sha256(blob(f.oid, !f.audio));
    const have = sha256(got);
    return have === want ? { ok: true } : { live: short(have) };
  } catch (e) {
    return { live: `error (${(e && e.cause && e.cause.code) || (e && e.name) || e})` };
  }
}

/* One pass over every file, then up to --retries more passes over the ones that
   did not match, after a wait (retryDelay x1, x3, x6), so a run in which the
   whole CDN is behind waits about 100 s, not 100 s a file. */
export async function compare(base, files, { retries = 3, retryDelay = 10, audioBytes = false, concurrency = 8, log = () => {} } = {}) {
  const waits = [1, 3, 6].map(x => x * retryDelay * 1000);
  const result = new Map();
  let todo = files;
  for (let round = 0; round <= retries && todo.length; round++) {
    if (round) { log(`  ${todo.length} file${todo.length === 1 ? '' : 's'} did not match: trying again in ${waits[Math.min(round - 1, waits.length - 1)] / 1000} s`); await sleep(waits[Math.min(round - 1, waits.length - 1)]); }
    let next = 0;
    const pass = todo;
    async function worker() {
      while (next < pass.length) {
        const f = pass[next++];
        result.set(f, { ...(await liveOnce(base, f, audioBytes)), tries: round + 1 });
      }
    }
    await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
    todo = pass.filter(f => !result.get(f).ok);
  }
  const bad = todo.map(f => ({ path: f.path || '(site root /)', expected: f.audio && !audioBytes ? `${f.size} bytes` : short(sha256(blob(f.oid, !f.audio))), live: result.get(f).live, tries: result.get(f).tries }));
  bad.sort((x, y) => x.path.localeCompare(y.path));
  return bad;
}

/* ── the deploy ─────────────────────────────────────────────────────── */

let apiRoute = null;
async function api(path) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const viaFetch = async (auth) => {
    const res = await fetch(`https://api.github.com${path}`, {
      headers: { accept: 'application/vnd.github+json', 'x-github-api-version': '2022-11-28', 'user-agent': 'guitar-class-live-files', ...(auth ? { authorization: `Bearer ${auth}` } : {}) },
      signal: AbortSignal.timeout(20000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  };
  const routes = {
    token: () => viaFetch(token),
    gh: async () => JSON.parse(execFileSync('gh', ['api', path], { stdio: ['ignore', 'pipe', 'pipe'], timeout: 20000 }).toString('utf8')),
    anon: () => viaFetch(null),
  };
  const order = apiRoute ? [apiRoute] : [...(token ? ['token'] : []), 'gh', 'anon'];
  for (const r of order) {
    try { const out = await routes[r](); apiRoute = r; return out; } catch { /* the next route */ }
  }
  return null;
}

/* Remembered per pair: the wait asks again every 15 s, and GitHub allows a
   workflow's token 1,000 requests an hour. */
const aheadMemo = new Map();
async function isAhead(older, newer) {
  const key = `${older}...${newer}`;
  if (aheadMemo.has(key)) return aheadMemo.get(key);
  const c = await api(`/repos/${REPO}/compare/${older}...${newer}`);
  let ahead;
  if (c && c.status) ahead = c.status === 'ahead';
  else { try { git(['merge-base', '--is-ancestor', older, newer]); ahead = true; } catch { ahead = false; } }
  aheadMemo.set(key, ahead);
  return ahead;
}

/* ready | waiting | failed | superseded | replaced | noapi */
async function deployState(sha) {
  const deps = await api(`/repos/${REPO}/deployments?environment=github-pages&per_page=20`);
  if (!Array.isArray(deps)) return { state: 'noapi' };
  const mine = deps.filter(d => d.sha === sha);
  const after = mine.length ? Date.parse(mine[0].created_at) : -Infinity;
  const newer = deps.filter(d => d.sha !== sha && Date.parse(d.created_at) > after).slice(0, 5);
  for (const d of newer) {
    if (await isAhead(sha, d.sha)) return { state: 'superseded', by: d.sha };
  }
  if (!mine.length) return { state: 'waiting', why: 'no deployment of this commit yet' };
  const st = await api(`/repos/${REPO}/deployments/${mine[0].id}/statuses?per_page=1`);
  const s = Array.isArray(st) && st[0] ? st[0].state : 'pending';
  if (s === 'success') return { state: 'ready' };
  if (s === 'failure' || s === 'error') return { state: 'failed', log: st[0].log_url || '' };
  if (s === 'inactive') return newer.length ? { state: 'replaced', by: newer[0].sha } : { state: 'waiting', why: 'inactive' };
  return { state: 'waiting', why: s };
}

const VER_RE = /CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/;
async function liveVersion(base) {
  try {
    const res = await fetch(urlFor(base, 'sw.js'), { headers: { 'cache-control': 'no-cache' }, signal: AbortSignal.timeout(20000) });
    if (!res.ok) return null;
    return ((await res.text()).match(VER_RE) || [])[1] || null;
  } catch { return null; }
}
function laterVersions(sha) {
  const out = new Set();
  for (const ref of ['origin/main', 'HEAD']) {
    let list = [];
    try { list = git(['rev-list', `${sha}..${ref}`, '--', 'sw.js']).toString().split('\n').filter(Boolean); } catch { continue; }
    for (const h of list) {
      try { const v = (git(['show', `${h}:sw.js`]).toString().match(VER_RE) || [])[1]; if (v) out.add(v); } catch { /* skip */ }
    }
  }
  return out;
}

/* ── the run ────────────────────────────────────────────────────────── */

function report(bad, problems, total, label) {
  for (const p of problems) console.log(`  ✗ ${p.path}  ${p.why}`);
  for (const b of bad) console.log(`  ✗ ${b.path}  expected ${b.expected}  live ${b.live}  (${b.tries} ${b.tries === 1 ? 'try' : 'tries'})`);
  const n = bad.length + problems.length;
  if (!n) console.log(`live-files: ✓ ${total} of ${total} public files match ${label}`);
  else console.log(`live-files: ✗ ${n} problem${n === 1 ? '' : 's'}: ${bad.length} of ${total} public files differ or are missing${problems.length ? `, ${problems.length} found in the commit itself` : ''} (${label})`);
  return n;
}

async function main() {
  const base = opt('--base', LIVE_BASE).replace(/\/?$/, '/');
  const waitMin = Number(opt('--wait', 15));
  const retries = Number(opt('--retries', 3));
  const retryDelay = Number(opt('--retry-delay', 10));
  const concurrency = Number(opt('--concurrency', 8));
  const audioBytes = has('--audio-bytes');
  if (![waitMin, retries, retryDelay, concurrency].every(n => Number.isFinite(n) && n >= 0)) { console.error(USAGE); process.exit(2); }
  let sha;
  try { sha = git(['rev-parse', '--verify', `${opt('--sha', 'HEAD')}^{commit}`]).toString().trim(); } catch {
    console.error(`live-files: could not run: no commit ${opt('--sha', 'HEAD')} here (fetch it first)`); process.exit(2);
  }
  const label = `${sha.slice(0, 8)} at ${base}`;
  const { files, problems } = plan(sha);
  const nAudio = files.filter(f => f.audio).length;
  if (has('--list')) { for (const f of files) console.log(f.path || '(site root /)'); process.exit(problems.length ? 1 : 0); }
  console.log(`live-files: ${files.length} public files at ${sha.slice(0, 8)} (${nAudio} backing tracks by ${audioBytes ? 'their bytes' : 'size and the AUDIO_HASHES map'}), against ${base}`);
  if (problems.length) { report([], problems, files.length, label); process.exit(1); }

  const waiting = !has('--no-wait') && base === LIVE_BASE;
  let mode = 'none';
  if (waiting) {
    const deadline = Date.now() + waitMin * 60000;
    let lastSay = 0;
    for (;;) {
      const d = await deployState(sha);
      if (d.state === 'noapi') { mode = 'version'; break; }
      mode = 'api';
      if (d.state === 'ready') { console.log(`  the Pages deploy of ${sha.slice(0, 8)} has finished (GitHub's Deployments API)`); break; }
      if (d.state === 'superseded') { console.log(`live-files: ✓ superseded: a later commit, ${d.by.slice(0, 8)}, is deployed; its own run checks the site`); process.exit(0); }
      if (d.state === 'replaced') { console.log(`  ✗ the live site was redeployed from ${d.by.slice(0, 8)}, which is not a later commit than ${sha.slice(0, 8)}`); console.log(`live-files: ✗ the live site is not this commit (${label})`); process.exit(1); }
      if (d.state === 'failed') { console.log(`  ✗ the Pages deploy of ${sha.slice(0, 8)} failed: ${d.log}`); console.log(`live-files: ✗ the deploy failed (${label})`); process.exit(1); }
      if (Date.now() > deadline) { console.log(`  ✗ the Pages deploy of ${sha.slice(0, 8)} was not done after ${waitMin} minutes (${d.why})`); console.log(`live-files: ✗ the deploy did not finish in time (${label})`); process.exit(1); }
      if (Date.now() - lastSay > 60000) { console.log(`  waiting for the Pages deploy of ${sha.slice(0, 8)} (${d.why})`); lastSay = Date.now(); }
      await sleep(15000);
    }
    if (mode === 'version') {
      const want = (blob(treeOf(sha).get('sw.js').oid).toString('utf8').match(VER_RE) || [])[1];
      console.log(`  no GitHub API here: waiting until the live sw.js says ${want}`);
      for (;;) {
        const live = await liveVersion(base);
        if (live === want) break;
        if (live && laterVersions(sha).has(live)) { console.log(`live-files: ✓ superseded: the live sw.js (${live}) is a later commit's`); process.exit(0); }
        if (Date.now() > deadline) {
          if (live == null) { console.log(`live-files: could not run: the live sw.js could not be read at ${base}`); process.exit(2); }
          console.log(`  ✗ after ${waitMin} minutes the live sw.js says ${live}, the commit's says ${want}`);
          console.log(`live-files: ✗ the deploy did not finish in time (${label})`); process.exit(1);
        }
        await sleep(15000);
      }
    }
  }

  const bad = await compare(base, files, { retries, retryDelay, audioBytes, concurrency, log: (s) => console.log(s) });
  if (bad.length === files.length && bad.every(b => /^error/.test(b.live))) {
    console.log(`live-files: could not run: no file could be fetched from ${base} (${bad[0].live})`); process.exit(2);
  }
  if (bad.length && waiting) {
    if (mode === 'api') {
      const d = await deployState(sha);
      if (d.state === 'superseded') { console.log(`live-files: ✓ superseded during the run: a later commit, ${d.by.slice(0, 8)}, was deployed; its own run checks the site`); process.exit(0); }
    } else if (mode === 'version') {
      const live = await liveVersion(base);
      if (live && laterVersions(sha).has(live)) { console.log(`live-files: ✓ superseded during the run: the live sw.js (${live}) is a later commit's`); process.exit(0); }
    }
  }
  process.exit(report(bad, [], files.length, label) ? 1 : 0);
}

/* ── --self-test ────────────────────────────────────────────────────── */

async function selfTest() {
  const sha = git(['rev-parse', 'HEAD']).toString().trim();
  const { files, problems, published } = plan(sha);
  let fails = 0;
  const check = (cond, what) => { console.log(`  ${cond ? '✓' : '✗'} ${what}`); if (!cond) fails++; };
  check(problems.length === 0, `the commit itself has no problem (${problems.length}: ${problems.map(p => p.path).join(', ') || 'none'})`);
  check(files.length > 150, `${files.length} public files planned (more than 150)`);
  check(!published.has('CLAUDE.md') && !published.has('tools/checks.mjs') && !published.has('_config.yml') && !published.has('.github/workflows/checks.yml'), 'CLAUDE.md, tools/, _config.yml and .github/ are not public');

  /* A server of the commit's public files, under /guitar-class/ as on Pages. */
  const byPath = new Map(files.map(f => [f.path, f]));
  let planted = {};
  const hits = new Map();
  const server = createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    const rel = decodeURIComponent(u.pathname.replace(/^\/guitar-class\//, ''));
    const f = byPath.get(rel);
    hits.set(rel, (hits.get(rel) || 0) + 1);
    const p = planted[rel];
    if (!f || p === 'missing') { res.writeHead(404); res.end('not found'); return; }
    let body = f.audio && req.method === 'HEAD' ? null : blob(f.oid);
    let size = f.size;
    if (p === 'changed' || (p === 'stale-once' && hits.get(rel) === 1)) { body = Buffer.concat([blob(f.oid), Buffer.from('\n')]); size = body.length; }
    if (p === 'longer') size += 1;
    res.writeHead(200, { 'content-length': body ? body.length : size });
    res.end(req.method === 'HEAD' ? undefined : body);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/guitar-class/`;
  const quick = { retries: 1, retryDelay: 0, concurrency: 8 };
  try {
    let bad = await compare(base, files, quick);
    check(bad.length === 0, `unchanged copy: ${files.length - bad.length} of ${files.length} match${bad.length ? ` (differ: ${bad.map(b => b.path).join(', ')})` : ''}`);
    const audio = files.find(f => f.audio);
    planted = { 'app/save.js': 'changed', 'module-3.js': 'missing', [audio.path]: 'longer' };
    bad = await compare(base, files, quick);
    const got = bad.map(b => b.path).sort().join(', ');
    const want = Object.keys(planted).sort().join(', ');
    check(got === want, `three planted faults: red on exactly ${want} (got: ${got || 'nothing'})`);
    for (const b of bad) console.log(`      ${b.path}  expected ${b.expected}  live ${b.live}`);
    planted = { 'i18n.js': 'stale-once' };
    hits.clear();
    bad = await compare(base, files, quick);
    check(bad.length === 0 && hits.get('i18n.js') === 2, `a file stale on the first request only passes on the second (requests: ${hits.get('i18n.js')}, differ: ${bad.length})`);
    bad = await compare(base, files, { ...quick, retries: 0 });
    check(bad.length === 0, 'that file is fresh on later requests (the stale copy was the first answer only)');
  } finally { server.close(); }
  const cfg = blob(treeOf(sha).get('_config.yml').oid).toString('utf8') + '  - "app/"\n';
  const p2 = plan(sha, { configText: cfg });
  check(p2.problems.length > 20 && p2.problems.every(p => p.path.startsWith('app/')), `a _config.yml that also excludes app/ fails on the app parts (${p2.problems.length} required files not published)`);
  console.log(fails ? `live-files self-test: ✗ ${fails} check(s) failed` : 'live-files self-test: ✓ every check passed');
  process.exit(fails ? 1 : 0);
}

const run = has('--self-test') ? selfTest : main;
run().catch(e => { console.error(`live-files: could not run: ${e && e.stack ? e.stack : e}`); process.exit(2); });
