#!/usr/bin/env node
/* Is every public file on the live site the one we pushed? (2026-11-26)

   `node tools/checks.mjs --live` compares one line, the live sw.js CACHE_VERSION.
   This tool compares EVERY file GitHub Pages publishes with the same path at
   the commit that was deployed: byte for byte, except the backing tracks
   (sampled, below). It catches a failed or half-done
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
   and a line break (front matter) is rendered by Jekyll, not copied: such a
   file is only checked for answering 200 (none today; the self-test proves the
   rule). The files the site cannot run without
   (index.html, sw.js and every file its lists name, every app / coach / teacher
   part, module-N.js, i18n.js, class-activities.js, tabs/*.html, the CSS,
   privacy.html, firebase-config.js, manifest.json) must be in the commit AND
   public, or the run fails before it fetches anything.

   How each file is compared (the live address is LIVE_BASE below):
     - every file but the backing tracks: downloaded and its sha256 compared with
       the commit's bytes; the site root "/" is compared with index.html;
     - audio/*.mp3 (and .m4a .wav .ogg; about 290 MB): not downloaded whole.
       Two 8 KB pieces of each (the middle and the end, as Range requests) must
       be the commit's bytes, and the total size in the answer the commit's
       size: a track re-levelled at the same bitrate, or another track of the
       same size at its address (18 of 61 are 36,720 bytes), differs in the
       middle. Its hash in the commit's sw.js AUDIO_HASHES must also be the
       commit's bytes (sw.js itself is compared byte for byte). A server that
       ignores Range sends the whole file, which is then hashed whole.
       --audio-bytes downloads and hashes every track whole.
     - The kill switch (BREAK-GLASS.md (b): tools/kill-switch/kill-sw.js copied
       over sw.js) has no AUDIO_HASHES: the map check is skipped and said so;
       every file, the tracks included, is still compared.
   A file that differs or is missing is tried again, all of them together in up
   to three more passes (--retries 3) after waits of 10 s, 30 s and 60 s
   (--retry-delay 10 is the first wait, then x3 and x6). GitHub's CDN (Fastly)
   ignores the query string (checked 2026-11-26: a new ?q= was a cache HIT) and
   may keep a copy up to `cache-control: max-age=600` after a deploy, so the
   ?lf=… query and `cache-control: no-cache` on each request only get past
   caches in between (a proxy). So when files still differ after those passes
   and the deploy finished less than 620 s ago (--cdn-max-age 600, plus 20 s),
   the run waits until then and makes one last pass; after it a difference is a
   failure.

   Waiting for the deploy (skipped with --no-wait or a --base that is not the
   live site): GitHub's Deployments API (environment github-pages) is read with
   $GITHUB_TOKEN / $GH_TOKEN, else through `gh api`, else unauthenticated. The
   run waits (--wait 15 minutes) until the commit's deployment says "success".
   Once the API has answered, a later failed call is only "ask again" (the next
   poll), never a switch to the weaker route below.
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

   --self-test: serves the commit's own public files from a local server (with
   Range) and runs the real comparison against it: unchanged (must pass, and
   must have compared more than 150 files); four planted faults (an app part
   with a changed byte, a module file missing, a backing track one byte longer,
   a backing track swapped for another of the same size: must fail on exactly
   those four); a file stale on the first request only (passes on the second);
   a file stale for 1.5 s with no retry left (fails without the last pass,
   passes with it); a front-matter file served different (passes only as
   rendered). Without a server: a _config.yml excluding app/ fails on the
   required parts; the kill switch's sw.js plans with no problem; a fake GitHub
   API that fails twice after answering once still ends "ready" by the API.
   No network; seconds. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createServer } from 'node:http';

const LIVE_BASE = 'https://jhoffmanteacher.github.io/guitar-class/';
const REPO = 'jhoffmanteacher/guitar-class';
const AUDIO_RE = /^audio\/.*\.(mp3|m4a|wav|ogg)$/i;

const argv = process.argv.slice(2);
const has = (f) => argv.includes(f);
const opt = (name, dflt) => { const i = argv.indexOf(name); return i >= 0 && argv[i + 1] != null ? argv[i + 1] : dflt; };
const USAGE = 'usage: node tools/live-files.mjs [--sha <commit>] [--base <url>] [--wait <minutes>] [--no-wait] [--retries <n>] [--retry-delay <seconds>] [--cdn-max-age <seconds>] [--audio-bytes] [--concurrency <n>] [--list] | --self-test';
const KILL_SWITCH_VERSION = 'guitar-class-kill-switch';
const VER_RE = /CACHE_VERSION\s*=\s*['"]([^'"]+)['"]/;
const SAMPLE = 8192;
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

/* Front matter: Jekyll renders such a file instead of copying it. */
export const isRendered = (buf) => /^---\r?\n/.test(buf.subarray(0, 8).toString('latin1'));

/* The two pieces of a track that are compared (the middle and the end), each
   with the sha256 of the commit's bytes there. */
function samplesOf(bytes) {
  const n = bytes.length;
  if (n <= 2 * SAMPLE) return [{ start: 0, end: n, sha: sha256(bytes) }];
  const mid = Math.floor(n / 2) - SAMPLE / 2;
  return [mid, n - SAMPLE].map(start => ({ start, end: start + SAMPLE, sha: sha256(bytes.subarray(start, start + SAMPLE)) }));
}

/* What the deploy of <sha> publishes, and the problems that need no network.
   swText replaces the commit's sw.js (the self-test's kill-switch case). */
export function plan(sha, { configText, swText } = {}) {
  const tree = treeOf(sha);
  const cfg = configText != null ? configText : (tree.has('_config.yml') ? blob(tree.get('_config.yml').oid).toString('utf8') : '');
  const lists = jekyllLists(cfg);
  const problems = [];
  const files = [];
  for (const [path, info] of tree) {
    if (!isPublished(path, lists)) continue;
    const audio = AUDIO_RE.test(path);
    const f = { path, ...info, audio };
    if (audio) {
      const bytes = blob(info.oid, false);
      f.sha = sha256(bytes);
      f.samples = samplesOf(bytes);
    } else f.rendered = isRendered(blob(info.oid));
    files.push(f);
  }
  const notes = [];
  const published = new Set(files.map(f => f.path));
  if (!tree.has('sw.js')) { problems.push({ path: 'sw.js', why: 'the commit has no sw.js' }); return { files, problems, published, notes }; }
  const sw = swText != null ? swText : blob(tree.get('sw.js').oid).toString('utf8');
  const { listed, audio } = swLists(sw);
  /* BREAK-GLASS.md (b): the kill switch has no AUDIO_HASHES, and the site runs
     without it; the tracks are still compared below. */
  const killSwitch = !/const AUDIO_HASHES = \{/.test(sw) || (sw.match(VER_RE) || [])[1] === KILL_SWITCH_VERSION;
  if (killSwitch) notes.push('sw.js is the kill switch (no AUDIO_HASHES): the map check is skipped; every file is still compared');
  const required = new Set(listed);
  for (const p of tree.keys()) if (REQUIRED_RE.some(re => re.test(p))) required.add(p);
  for (const p of [...required].sort()) {
    if (!tree.has(p)) problems.push({ path: p, why: 'sw.js lists it, but the commit has no such file' });
    else if (!published.has(p)) problems.push({ path: p, why: 'the site needs it, but _config.yml leaves it out of the deploy' });
  }
  if (!killSwitch) {
    for (const f of files) {
      if (!f.audio) continue;
      const want = f.sha.slice(0, 10);
      if (audio[f.path] !== want) problems.push({ path: f.path, why: `sw.js AUDIO_HASHES says ${audio[f.path] || 'nothing'}, the commit's bytes hash to ${want}` });
    }
    for (const p of Object.keys(audio)) if (!tree.has(p)) problems.push({ path: p, why: 'sw.js AUDIO_HASHES names it, but the commit has no such file' });
  }
  /* The site root is served as index.html. */
  if (published.has('index.html')) files.push({ ...files.find(f => f.path === 'index.html'), path: '', audio: false });
  files.sort((a, b) => a.path.localeCompare(b.path));
  return { files, problems, published, notes };
}

/* ── fetching and comparing ─────────────────────────────────────────── */

/* The query only gets past caches between here and GitHub (a proxy):
   GitHub's CDN ignores it (see the header). */
let bust = 0;
function urlFor(base, path) {
  const u = new URL(path.split('/').map(encodeURIComponent).join('/'), base);
  u.searchParams.set('lf', `${Date.now().toString(36)}-${(bust++).toString(36)}-${Math.random().toString(36).slice(2, 8)}`);
  return u.href;
}

const fetchLive = (base, f, extra = {}) => fetch(urlFor(base, f.path), {
  headers: { 'cache-control': 'no-cache', pragma: 'no-cache', 'user-agent': 'guitar-class-live-files', ...extra },
  signal: AbortSignal.timeout(f.audio ? 120000 : 30000),
  redirect: 'follow',
});
const drop = async (res) => { try { await res.body?.cancel(); } catch { /* nothing to cancel */ } };

/* A track: each sample as a Range request; a 200 answer is the whole file. */
async function liveAudio(base, f) {
  for (const smp of f.samples) {
    const res = await fetchLive(base, f, { range: `bytes=${smp.start}-${smp.end - 1}` });
    if (res.status === 200) {
      const have = sha256(Buffer.from(await res.arrayBuffer()));
      return have === f.sha ? { ok: true } : { live: short(have) };
    }
    if (res.status !== 206) { await drop(res); return { live: String(res.status) }; }
    const total = Number(((res.headers.get('content-range') || '').match(/\/(\d+)$/) || [])[1]);
    const got = Buffer.from(await res.arrayBuffer());
    if (total !== f.size) return { live: `${Number.isFinite(total) ? total : '?'} bytes (commit: ${f.size})` };
    if (sha256(got) !== smp.sha) return { live: `other bytes at ${smp.start}-${smp.end - 1}` };
  }
  return { ok: true };
}

async function liveOnce(base, f, audioBytes) {
  try {
    if (f.audio && !audioBytes) return await liveAudio(base, f);
    const res = await fetchLive(base, f);
    if (res.status !== 200) { await drop(res); return { live: String(res.status) }; }
    const got = Buffer.from(await res.arrayBuffer());
    /* Jekyll renders a front-matter file: only that it is served is checked. */
    if (f.rendered) return { ok: true };
    const want = f.audio ? f.sha : sha256(blob(f.oid));
    const have = sha256(got);
    return have === want ? { ok: true } : { live: short(have) };
  } catch (e) {
    return { live: `error (${(e && e.cause && e.cause.code) || (e && e.name) || e})` };
  }
}

/* One pass over every file, then up to --retries more passes over the ones that
   did not match, after a wait (retryDelay x1, x3, x6), so a run in which the
   whole CDN is behind waits about 100 s, not 100 s a file. If files still
   differ and settleAt (the deploy's end + the CDN's max-age + 20 s) is still
   ahead, one last pass at settleAt. */
export async function compare(base, files, { retries = 3, retryDelay = 10, audioBytes = false, concurrency = 8, settleAt = 0, log = () => {} } = {}) {
  const waits = [1, 3, 6].map(x => x * retryDelay * 1000);
  const result = new Map();
  let todo = files;
  const runPass = async (pass, n) => {
    let next = 0;
    async function worker() {
      while (next < pass.length) {
        const f = pass[next++];
        result.set(f, { ...(await liveOnce(base, f, audioBytes)), tries: n });
      }
    }
    await Promise.all(Array.from({ length: Math.max(1, concurrency) }, worker));
    return pass.filter(f => !result.get(f).ok);
  };
  let round = 0;
  for (; round <= retries && todo.length; round++) {
    if (round) { log(`  ${todo.length} file${todo.length === 1 ? '' : 's'} did not match: trying again in ${waits[Math.min(round - 1, waits.length - 1)] / 1000} s`); await sleep(waits[Math.min(round - 1, waits.length - 1)]); }
    todo = await runPass(todo, round + 1);
  }
  if (todo.length && settleAt > Date.now()) {
    log(`  ${todo.length} file${todo.length === 1 ? '' : 's'} did not match: the CDN may keep a copy up to its max-age; one last pass in ${Math.ceil((settleAt - Date.now()) / 1000)} s`);
    await sleep(settleAt - Date.now());
    todo = await runPass(todo, round + 1);
  }
  const bad = todo.map(f => ({ path: f.path || '(site root /)', expected: f.audio && !audioBytes ? `${f.size} bytes and its samples` : short(f.audio ? f.sha : sha256(blob(f.oid))), live: result.get(f).live, tries: result.get(f).tries }));
  bad.sort((x, y) => x.path.localeCompare(y.path));
  return bad;
}

/* ── the deploy ─────────────────────────────────────────────────────── */

/* API_BASE / API_ROUTES are changed only by the self-test (a fake API). */
let API_BASE = 'https://api.github.com';
let API_ROUTES = null;
let apiRoute = null;
let apiAnswered = false;
async function api(path) {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const viaFetch = async (auth) => {
    const res = await fetch(`${API_BASE}${path}`, {
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
  const all = API_ROUTES || [...(token ? ['token'] : []), 'gh', 'anon'];
  const order = apiRoute ? [apiRoute, ...all.filter(r => r !== apiRoute)] : all;
  for (const r of order) {
    try { const out = await routes[r](); apiRoute = r; apiAnswered = true; return out; } catch { /* the next route */ }
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
  if (c && c.status) { aheadMemo.set(key, c.status === 'ahead'); return c.status === 'ahead'; }
  /* No answer: the local history, not remembered (a shallow clone may not hold it). */
  try { git(['merge-base', '--is-ancestor', older, newer]); return true; } catch { return false; }
}

/* ready | waiting | failed | superseded | replaced | noapi */
async function deployState(sha) {
  const deps = await api(`/repos/${REPO}/deployments?environment=github-pages&per_page=20`);
  if (!Array.isArray(deps)) return apiAnswered ? { state: 'waiting', why: 'the GitHub API did not answer; asking again' } : { state: 'noapi' };
  const mine = deps.filter(d => d.sha === sha);
  const after = mine.length ? Date.parse(mine[0].created_at) : -Infinity;
  const newer = deps.filter(d => d.sha !== sha && Date.parse(d.created_at) > after).slice(0, 5);
  for (const d of newer) {
    if (await isAhead(sha, d.sha)) return { state: 'superseded', by: d.sha };
  }
  if (!mine.length) return { state: 'waiting', why: 'no deployment of this commit yet' };
  const st = await api(`/repos/${REPO}/deployments/${mine[0].id}/statuses?per_page=1`);
  const s = Array.isArray(st) && st[0] ? st[0].state : 'pending';
  if (s === 'success') return { state: 'ready', at: Date.parse(st[0].created_at) || Date.now() };
  if (s === 'failure' || s === 'error') return { state: 'failed', log: st[0].log_url || '' };
  if (s === 'inactive') return newer.length ? { state: 'replaced', by: newer[0].sha } : { state: 'waiting', why: 'inactive' };
  return { state: 'waiting', why: s };
}

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

/* Wait for the Pages deploy of <sha>. outcome: ready (with doneAt) |
   superseded | replaced | failed | timeout | unreadable; mode: api | version. */
export async function waitForDeploy(sha, base, { waitMs, pollMs = 15000, log = () => {} }) {
  const deadline = Date.now() + waitMs;
  const s8 = sha.slice(0, 8);
  let lastSay = 0;
  for (;;) {
    const d = await deployState(sha);
    if (d.state === 'noapi') break;
    if (d.state === 'ready') { log(`  the Pages deploy of ${s8} has finished (GitHub's Deployments API)`); return { outcome: 'ready', mode: 'api', doneAt: d.at }; }
    if (d.state === 'superseded') return { outcome: 'superseded', mode: 'api', text: `a later commit, ${d.by.slice(0, 8)}, is deployed` };
    if (d.state === 'replaced') return { outcome: 'replaced', mode: 'api', text: `the live site was redeployed from ${d.by.slice(0, 8)}, which is not a later commit than ${s8}`, summary: 'the live site is not this commit' };
    if (d.state === 'failed') return { outcome: 'failed', mode: 'api', text: `the Pages deploy of ${s8} failed: ${d.log}`, summary: 'the deploy failed' };
    if (Date.now() > deadline) return { outcome: 'timeout', mode: 'api', text: `the Pages deploy of ${s8} was not done after ${Math.round(waitMs / 6000) / 10} minutes (${d.why})`, summary: 'the deploy did not finish in time' };
    if (Date.now() - lastSay > 60000) { log(`  waiting for the Pages deploy of ${s8} (${d.why})`); lastSay = Date.now(); }
    await sleep(pollMs);
  }
  const want = (blob(treeOf(sha).get('sw.js').oid).toString('utf8').match(VER_RE) || [])[1];
  log(`  no GitHub API here: waiting until the live sw.js says ${want}`);
  for (;;) {
    const live = await liveVersion(base);
    if (live === want) return { outcome: 'ready', mode: 'version', doneAt: Date.now() };
    if (live && laterVersions(sha).has(live)) return { outcome: 'superseded', mode: 'version', text: `the live sw.js (${live}) is a later commit's` };
    if (Date.now() > deadline) {
      if (live == null) return { outcome: 'unreadable', mode: 'version' };
      return { outcome: 'timeout', mode: 'version', text: `after ${Math.round(waitMs / 6000) / 10} minutes the live sw.js says ${live}, the commit's says ${want}`, summary: 'the deploy did not finish in time' };
    }
    await sleep(pollMs);
  }
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
  const cdnMaxAge = Number(opt('--cdn-max-age', 600));
  const audioBytes = has('--audio-bytes');
  if (![waitMin, retries, retryDelay, concurrency, cdnMaxAge].every(n => Number.isFinite(n) && n >= 0)) { console.error(USAGE); process.exit(2); }
  let sha;
  try { sha = git(['rev-parse', '--verify', `${opt('--sha', 'HEAD')}^{commit}`]).toString().trim(); } catch {
    console.error(`live-files: could not run: no commit ${opt('--sha', 'HEAD')} here (fetch it first)`); process.exit(2);
  }
  const label = `${sha.slice(0, 8)} at ${base}`;
  const { files, problems, notes } = plan(sha);
  const nAudio = files.filter(f => f.audio).length;
  if (has('--list')) { for (const f of files) console.log(f.path || '(site root /)'); process.exit(problems.length ? 1 : 0); }
  console.log(`live-files: ${files.length} public files at ${sha.slice(0, 8)} (${nAudio} backing tracks by ${audioBytes ? 'their bytes' : 'size and two 8 KB samples'}), against ${base}`);
  for (const n of notes) console.log(`  note: ${n}`);
  if (problems.length) { report([], problems, files.length, label); process.exit(1); }

  const waiting = !has('--no-wait') && base === LIVE_BASE;
  let mode = 'none';
  let settleAt = 0;
  if (waiting) {
    const w = await waitForDeploy(sha, base, { waitMs: waitMin * 60000, log: (x) => console.log(x) });
    mode = w.mode;
    if (w.outcome === 'superseded') { console.log(`live-files: ✓ superseded: ${w.text}; its own run checks the site`); process.exit(0); }
    if (w.outcome === 'unreadable') { console.log(`live-files: could not run: the live sw.js could not be read at ${base}`); process.exit(2); }
    if (w.outcome !== 'ready') { console.log(`  ✗ ${w.text}`); console.log(`live-files: ✗ ${w.summary} (${label})`); process.exit(1); }
    settleAt = w.doneAt + (cdnMaxAge + 20) * 1000;
  }

  const bad = await compare(base, files, { retries, retryDelay, audioBytes, concurrency, settleAt, log: (s) => console.log(s) });
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
  check(isRendered(Buffer.from('---\ntitle: x\n---\n')) && isRendered(Buffer.from('---\r\n')) && !isRendered(Buffer.from('--- not front matter')) && files.filter(f => f.rendered).length === 0,
    `front matter is told apart; ${files.filter(f => f.rendered).length} public files have it today`);

  /* A server of the commit's public files, under /guitar-class/ as on Pages,
     with single Range requests (206), as Pages answers them. */
  const byPath = new Map(files.map(f => [f.path, f]));
  let planted = {};
  const hits = new Map();
  const bytesOf = (f) => blob(f.oid, !f.audio);
  const server = createServer((req, res) => {
    const u = new URL(req.url, 'http://x');
    const rel = decodeURIComponent(u.pathname.replace(/^\/guitar-class\//, ''));
    const f = byPath.get(rel);
    hits.set(rel, (hits.get(rel) || 0) + 1);
    const p = planted[rel];
    if (!f || p === 'missing') { res.writeHead(404); res.end('not found'); return; }
    let body = bytesOf(f);
    if (p === 'changed' || (p === 'stale-once' && hits.get(rel) === 1) || (p && p.staleUntil && Date.now() < p.staleUntil)) body = Buffer.concat([body, Buffer.from('\n')]);
    if (p === 'longer') body = Buffer.concat([body, Buffer.from([0])]);
    if (p && p.swapWith) body = bytesOf(byPath.get(p.swapWith));
    const range = (req.headers.range || '').match(/^bytes=(\d+)-(\d+)$/);
    if (range) {
      const start = Number(range[1]), end = Math.min(Number(range[2]), body.length - 1);
      res.writeHead(206, { 'content-range': `bytes ${start}-${end}/${body.length}`, 'content-length': end - start + 1 });
      res.end(body.subarray(start, end + 1));
      return;
    }
    res.writeHead(200, { 'content-length': body.length });
    res.end(body);
  });
  await new Promise(r => server.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${server.address().port}/guitar-class/`;
  const quick = { retries: 1, retryDelay: 0, concurrency: 8 };
  /* Every file but the tracks, and four tracks (two of the same size): the
     server reads a track from git for each request, so all 61 would take a minute. */
  const audio = files.filter(f => f.audio);
  const bySize = new Map();
  for (const f of audio) bySize.set(f.size, [...(bySize.get(f.size) || []), f]);
  const twins = [...bySize.values()].find(l => l.length > 1);
  const someAudio = new Set([...(twins || []).slice(0, 2), ...audio.slice(-2)].map(f => f.path));
  const tested = files.filter(f => !f.audio || someAudio.has(f.path));
  const i18n = [byPath.get('i18n.js')];
  try {
    let bad = await compare(base, tested, quick);
    check(bad.length === 0, `unchanged copy: ${tested.length - bad.length} of ${tested.length} match (${someAudio.size} of ${audio.length} tracks)${bad.length ? ` (differ: ${bad.map(b => b.path).join(', ')})` : ''}`);
    check(!!twins, `two backing tracks of the same size exist (${twins ? `${twins[0].path} and ${twins[1].path}, ${twins[0].size} bytes` : 'none'})`);
    const longer = audio[audio.length - 1];
    planted = { 'app/save.js': 'changed', 'module-3.js': 'missing', [longer.path]: 'longer' };
    if (twins) planted[twins[0].path] = { swapWith: twins[1].path };
    bad = await compare(base, tested, quick);
    const got = bad.map(b => b.path).sort().join(', ');
    const want = Object.keys(planted).sort().join(', ');
    check(got === want, `${Object.keys(planted).length} planted faults: red on exactly ${want} (got: ${got || 'nothing'})`);
    for (const b of bad) console.log(`      ${b.path}  expected ${b.expected}  live ${b.live}`);
    planted = { 'i18n.js': 'stale-once' };
    hits.clear();
    bad = await compare(base, i18n, quick);
    check(bad.length === 0 && hits.get('i18n.js') === 2, `a file stale on the first request only passes on the second (requests: ${hits.get('i18n.js')}, differ: ${bad.length})`);
    planted = { 'i18n.js': { staleUntil: Date.now() + 1000 } };
    bad = await compare(base, i18n, { ...quick, retries: 0 });
    check(bad.length === 1, `a file stale for 1 s, no retry and no last pass: red (${bad.length} differ)`);
    planted = { 'i18n.js': { staleUntil: Date.now() + 1000 } };
    bad = await compare(base, i18n, { ...quick, retries: 0, settleAt: Date.now() + 1500 });
    check(bad.length === 0, `the same with the CDN's last pass 1.5 s later: green (${bad.length} differ)`);
    const fm = { ...byPath.get('privacy.html') };
    planted = { 'privacy.html': 'changed' };
    const asCopied = await compare(base, [fm], quick);
    const asRendered = await compare(base, [{ ...fm, rendered: true }], quick);
    check(asCopied.length === 1 && asRendered.length === 0, `a file served with other bytes: red as a copied file (${asCopied.length}), green as a rendered one (${asRendered.length})`);
  } finally { server.close(); }

  const cfg = blob(treeOf(sha).get('_config.yml').oid).toString('utf8') + '  - "app/"\n';
  const p2 = plan(sha, { configText: cfg });
  check(p2.problems.length > 20 && p2.problems.every(p => p.path.startsWith('app/')), `a _config.yml that also excludes app/ fails on the app parts (${p2.problems.length} required files not published)`);
  const kill = blob(treeOf(sha).get('tools/kill-switch/kill-sw.js').oid).toString('utf8');
  const p3 = plan(sha, { swText: kill });
  check(p3.problems.length === 0 && p3.notes.length === 1 && p3.files.filter(f => f.audio).length === files.filter(f => f.audio).length,
    `the kill switch's sw.js: ${p3.problems.length} problems, the tracks still compared (${p3.files.filter(f => f.audio).length}), note: ${p3.notes[0] || 'none'}`);

  /* A fake GitHub API: one answer (in progress), then two failures, then success. */
  let depCalls = 0, stCalls = 0;
  const fakeApi = createServer((req, res) => {
    const send = (code, obj) => { res.writeHead(code, { 'content-type': 'application/json' }); res.end(JSON.stringify(obj)); };
    if (/\/deployments\?/.test(req.url)) {
      depCalls++;
      if (depCalls === 2 || depCalls === 3) return send(502, { message: 'bad gateway' });
      return send(200, [{ id: 7, sha, created_at: new Date(Date.now() - 60000).toISOString() }]);
    }
    if (/\/deployments\/7\/statuses/.test(req.url)) { stCalls++; return send(200, [{ state: stCalls === 1 ? 'in_progress' : 'success', created_at: new Date().toISOString() }]); }
    return send(404, {});
  });
  await new Promise(r => fakeApi.listen(0, '127.0.0.1', r));
  API_BASE = `http://127.0.0.1:${fakeApi.address().port}`;
  API_ROUTES = ['anon'];
  try {
    const w = await waitForDeploy(sha, 'http://127.0.0.1:9/', { waitMs: 5000, pollMs: 10 });
    check(w.outcome === 'ready' && w.mode === 'api' && depCalls === 4, `the API answers, fails twice, answers: "${w.outcome}" by the ${w.mode} route after ${depCalls} calls`);
  } finally { fakeApi.close(); }

  console.log(fails ? `live-files self-test: ✗ ${fails} check(s) failed` : 'live-files self-test: ✓ every check passed');
  process.exit(fails ? 1 : 0);
}

const run = has('--self-test') ? selfTest : main;
run().catch(e => { console.error(`live-files: could not run: ${e && e.stack ? e.stack : e}`); process.exit(2); });
