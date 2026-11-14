/* The review labels of the commits not yet on origin/main (2026-11-13; checks.mjs 1dw, a WARNING, never a failure).

   CLAUDE.md "Fast by default": a change is labelled as a whole, `Review: Fast` or `Review: Reviewed (<reviewer>,
   <N> round(s))`, and a danger-zone change is never Fast. This reads the commits between HEAD's merge-base with
   origin/main and HEAD (merges left out) and returns two kinds of warning:
     - the range mixes `Review: Fast` and `Review: Reviewed` commits;
     - a `Review: Fast` commit changes a danger-zone FILE named in CLAUDE.md "Triggers": `firestore.rules`,
       `app/save.js`, or `sw.js` code. Not counted there, so not here: the `CACHE_VERSION` line and the
       `AUDIO_HASHES` block (checks.mjs writes both). Every other line of sw.js is code, the precache lists too.
   The other danger zones in "Triggers" are parts of files (teacherWriteConfig() and the config/class reads in
   teacher-config.js, coach detection in a coach-*.js part, any other direct write to progress/{uid}): a file name
   cannot tell them from a screen or a wording change, so they are left to the lead's reading.
   No origin/main, no common base, or HEAD on origin/main → nothing to read, no warning.
   Node only; a handful of git calls (one log, plus two file reads per Fast commit that touches sw.js). */
import { spawnSync } from 'node:child_process';
import { AUDIO_BLOCK_RE } from './sw-audio-map.mjs';

export const DANGER_FILES = ['firestore.rules', 'app/save.js'];
const SW = 'sw.js';
const swCode = s => s.replace(/^const CACHE_VERSION = '[^']*';$/gm, "const CACHE_VERSION = '';").replace(AUDIO_BLOCK_RE, '/* AUDIO_HASHES */');

export function reviewLabelReport(root) {
  const git = a => { const r = spawnSync('git', a, { cwd: root, encoding: 'utf8', maxBuffer: 64 << 20 }); return r.status === 0 ? r.stdout : null; };
  if (git(['rev-parse', '-q', '--verify', 'refs/remotes/origin/main^{commit}']) === null) return { why: 'no origin/main in this clone' };
  const base = (git(['merge-base', 'HEAD', 'refs/remotes/origin/main']) || '').trim();
  if (!base) return { why: 'HEAD and origin/main have no common commit' };
  const out = git(['log', '--no-merges', '--format=%x1e%H%x1f%s%x1f%B%x1f', '--name-only', `${base}..HEAD`]);
  if (out === null) return { why: 'git log failed' };
  const commits = out.split('\x1e').filter(Boolean).map(chunk => {
    const [hash, subject, body, files] = chunk.split('\x1f');
    const labels = [...body.matchAll(/^Review:[ \t]*(.*)$/gm)].map(m => m[1].trim());
    return { hash, subject, labels, files: files.split('\n').map(f => f.trim()).filter(Boolean) };
  });
  const kind = c => c.labels.some(l => /^Fast\b/.test(l)) ? 'Fast' : c.labels.some(l => /^Reviewed\b/.test(l)) ? 'Reviewed' : null;
  const fast = commits.filter(c => kind(c) === 'Fast'), reviewed = commits.filter(c => kind(c) === 'Reviewed');
  const warnings = [];
  const short = list => list.map(c => c.hash.slice(0, 7)).join(', ');
  if (fast.length && reviewed.length) warnings.push(`the ${commits.length} commits since origin/main mix ${fast.length} "Review: Fast" (${short(fast)}) and ${reviewed.length} "Review: Reviewed" (${short(reviewed)}): a change is labelled as a whole; set one label on all its unpushed commits with node tools/review-trailer.mjs <range> fast|reviewed (two separate changes in one range: ignore this)`);
  for (const c of fast) {
    const hit = c.files.filter(f => DANGER_FILES.includes(f));
    if (c.files.includes(SW)) {
      const before = git(['show', `${c.hash}^:${SW}`]), after = git(['show', `${c.hash}:${SW}`]);
      if (before === null || after === null || swCode(before) !== swCode(after)) hit.push(`${SW} (code beyond the CACHE_VERSION line and the AUDIO_HASHES block)`);
    }
    if (hit.length) warnings.push(`${c.hash.slice(0, 7)} "${c.subject}" says "Review: Fast" but changes ${hit.join(' and ')}: a danger-zone file is Always Reviewed (CLAUDE.md "Fast by default"); have it reviewed, then node tools/review-trailer.mjs <range> reviewed "<reviewer>, <N> round(s)"`);
  }
  return { commits: commits.length, fast: fast.length, reviewed: reviewed.length, warnings };
}
