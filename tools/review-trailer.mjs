#!/usr/bin/env node
/* Sets the review label of a change's commits before they are pushed (2026-11-13; CLAUDE.md "Fast by default").

   A change is labelled as a whole: every commit of it ends `Review: Fast` (shipped with no reviewer; the Friday
   check reviews it) or `Review: Reviewed (<reviewer>, <N> round(s))` (a reviewer agent read it before it shipped).
   The lead sets the label once, after the last clean review round, with this tool:

     node tools/review-trailer.mjs <range> fast
     node tools/review-trailer.mjs <range> reviewed "site-reviewer-deep, 2 rounds"
     ... --dry-run          prints what would change and changes nothing

   <range> is a git range such as origin/main..HEAD (a single <rev> means <rev>..HEAD). Each commit in it gets the
   one label: every existing `Review:` line is removed (two become one), the new line goes into the last paragraph
   (the trailer block) above the Co-Authored-By lines, and the Co-Authored-By lines stay last. Commits after the
   range up to HEAD are re-parented with their messages unchanged. Authors, dates and trees are kept; only the
   messages (and so the hashes) change. The old tip stays in the reflog (git reflog).

   It refuses, changing nothing, when: the working tree has uncommitted changes to tracked files; HEAD is detached
   (it rewrites the branch checked out in THIS worktree, never another); a commit of the range is not on HEAD; a
   commit it would rewrite is a merge; or any commit it would rewrite is on origin/main or on any other remote
   branch (rewriting it would need a force-push, which CLAUDE.md forbids), or on another local branch (another
   session's unpushed work, such as a main that is ahead of origin/main). No origin/main to compare with → it
   refuses too: it cannot tell what is pushed.

   Node only, no packages. Exit 0 done (or nothing to do), 1 refused, 2 bad arguments. */
import { spawnSync } from 'node:child_process';

const argv = process.argv.slice(2);
const DRY = argv.includes('--dry-run');
const pos = argv.filter(a => a !== '--dry-run');
const usage = 'usage: node tools/review-trailer.mjs <range> fast|reviewed ["<reviewer>, <N> round(s)"] [--dry-run]';
if (argv.includes('--help')) { console.log(usage); process.exit(0); }
const [rangeArg, kind, who] = pos;
const bad = m => { console.error(`review-trailer: ${m}\n${usage}`); process.exit(2); };
if (!rangeArg || !kind || pos.length > 3) bad('needs a range and a label');
let label;
if (kind === 'fast') { if (who) bad('"fast" takes no reviewer'); label = 'Fast'; }
else if (kind === 'reviewed') {
  if (!who || !/^\S.*,\s*[1-9]\d*\s+rounds?$/.test(who.trim())) bad('"reviewed" needs "<reviewer>, <N> round(s)", e.g. "site-reviewer-deep, 2 rounds"');
  label = `Reviewed (${who.trim()})`;
} else bad(`unknown label "${kind}"`);
const NEW_LINE = `Review: ${label}`;

const git = (args, opts = {}) => {
  const r = spawnSync('git', args, { encoding: 'utf8', maxBuffer: 64 << 20, ...opts });
  if (r.status !== 0 && !opts.allowFail) { console.error(`review-trailer: git ${args.join(' ')} failed:\n${r.stderr}`); process.exit(1); }
  return r.status === 0 ? r.stdout : null;
};
const refuse = m => { console.error(`review-trailer: refused, nothing changed: ${m}`); process.exit(1); };
const lines = s => s.split('\n').filter(Boolean);

/* ── Where we are ── */
const branch = (git(['symbolic-ref', '-q', '--short', 'HEAD'], { allowFail: true }) || '').trim();
if (!branch) refuse('HEAD is detached; check out the change\'s own branch in this worktree first');
if (git(['status', '--porcelain', '--untracked-files=no']).trim()) refuse('the working tree has uncommitted changes; commit or stash them first');
if (!git(['rev-parse', '-q', '--verify', 'refs/remotes/origin/main'], { allowFail: true })) refuse('there is no origin/main to tell pushed commits from unpushed ones (git fetch first)');
const head = git(['rev-parse', 'HEAD']).trim();

/* ── Which commits ── */
const range = rangeArg.includes('..') ? rangeArg : `${rangeArg}..HEAD`;
const target = lines(git(['rev-list', '--reverse', '--topo-order', range]));
if (!target.length) { console.log(`review-trailer: ${range} has no commits; nothing to do`); process.exit(0); }
const inRange = new Set(target);
for (const c of target) if (spawnSync('git', ['merge-base', '--is-ancestor', c, 'HEAD']).status !== 0) refuse(`${c.slice(0, 7)} is in ${range} but not on ${branch} (HEAD): run this in the worktree whose branch holds the change`);
// Every commit from the oldest one in the range up to HEAD is rewritten (the later ones only re-parented).
const oldest = target[0];
const all = lines(git(['rev-list', '--reverse', '--topo-order', '--ancestry-path', `${oldest}^..HEAD`], { allowFail: true }) || '');
const chain = all.length ? all : lines(git(['rev-list', '--reverse', 'HEAD']));   // the oldest is a root commit
if (!chain.includes(oldest)) refuse(`could not walk from ${oldest.slice(0, 7)} to HEAD`);
for (const c of target) if (!chain.includes(c)) refuse(`${c.slice(0, 7)} is not on the line from ${oldest.slice(0, 7)} to HEAD`);
const merges = new Set(lines(git(['rev-list', '--parents', '--no-walk=unsorted', ...chain])).map(l => l.split(' ')).filter(x => x.length > 2).map(x => x[0]));
for (const c of chain) if (merges.has(c)) refuse(`${c.slice(0, 7)} is a merge commit; this tool rewrites a straight line of commits only`);
// One call: the commits on HEAD that no remote branch has. A commit to rewrite that is not among them is pushed.
const unpushed = new Set(lines(git(['rev-list', 'HEAD', '--not', '--remotes'])));
for (const c of chain) if (!unpushed.has(c)) {
  const where = spawnSync('git', ['merge-base', '--is-ancestor', c, 'refs/remotes/origin/main']).status === 0 ? 'origin/main' : 'a remote branch';
  refuse(`${c.slice(0, 7)} is already on ${where}; a pushed commit is never rewritten (it would need a force-push)`);
}
// Nor a commit another local branch holds (another session's work, e.g. an unpushed main): start the range after it.
const ownOnly = new Set(lines(git(['rev-list', 'HEAD', '--not', `--exclude=${branch}`, '--branches'])));
for (const c of chain) if (!ownOnly.has(c)) refuse(`${c.slice(0, 7)} is also on another local branch (git branch --contains ${c.slice(0, 7)}); start the range after it, at your change's own base`);

/* ── The message rewrite ── */
const isTrailer = l => /^[A-Za-z][A-Za-z0-9-]*:\s/.test(l);
const isCoAuthor = l => /^Co-Authored-By:/i.test(l);
const isReview = l => /^Review:/.test(l);
function relabel(msg) {
  const body = msg.replace(/\s+$/, '').split('\n').filter(l => !isReview(l));
  // Collapse blank runs a removed line may leave, and drop trailing blanks.
  const out = [];
  for (const l of body) if (!(l.trim() === '' && (out.length === 0 || out[out.length - 1].trim() === ''))) out.push(l);
  while (out.length && out[out.length - 1].trim() === '') out.pop();
  // The last paragraph is the trailer block when every line in it is a trailer and it is not the subject.
  let start = out.length;
  while (start > 0 && out[start - 1].trim() !== '') start--;
  const last = out.slice(start);
  const isBlock = start > 0 && last.length && last.every(isTrailer);
  if (!isBlock) return [...out, '', NEW_LINE].join('\n') + '\n';
  const others = last.filter(l => !isCoAuthor(l)), co = last.filter(isCoAuthor);
  return [...out.slice(0, start), ...others, NEW_LINE, ...co].join('\n') + '\n';
}
const labelOf = msg => { const r = msg.split('\n').filter(isReview).map(l => l.replace(/^Review:\s*/, '')); return r.length ? r.join(' + ') : '(none)'; };

/* ── Rewrite ── */
const rows = [];
let parent = null;   // the new parent; null until the first rewritten commit (it keeps its own parent)
for (const c of chain) {
  const meta = git(['show', '-s', '--format=%T%n%P%n%an%n%ae%n%aI%n%cn%n%ce%n%cI', c]).split('\n');
  const [tree, parents, an, ae, ad, cn, ce, cd] = meta;
  const msg = git(['show', '-s', '--format=%B', c]).replace(/\n+$/, '\n');
  const newMsg = inRange.has(c) ? relabel(msg) : msg;
  const p = parent ?? (parents.trim() || null);
  const env = { ...process.env, GIT_AUTHOR_NAME: an, GIT_AUTHOR_EMAIL: ae, GIT_AUTHOR_DATE: ad, GIT_COMMITTER_NAME: cn, GIT_COMMITTER_EMAIL: ce, GIT_COMMITTER_DATE: cd };
  const made = DRY ? null : git(['commit-tree', tree, ...(p ? ['-p', p] : []), '-F', '-'], { input: newMsg, env }).trim();
  parent = made;
  rows.push({ old: c, made, subject: msg.split('\n')[0], from: labelOf(msg), to: inRange.has(c) ? labelOf(newMsg) : '(kept)' });
}

for (const r of rows) console.log(`${r.old.slice(0, 7)} → ${r.made ? r.made.slice(0, 7) : '(dry run)'}  ${r.from} → ${r.to}  ${r.subject}`);
const changed = rows.filter(r => inRange.has(r.old)).length;
if (DRY) { console.log(`review-trailer: dry run; ${changed} commit(s) would be labelled "${NEW_LINE}", ${rows.length - changed} after them re-parented; nothing changed`); process.exit(0); }
git(['update-ref', '-m', `review-trailer: ${NEW_LINE}`, 'HEAD', parent, head]);
console.log(`review-trailer: ${changed} commit(s) labelled "${NEW_LINE}", ${rows.length - changed} after them re-parented; ${branch} ${head.slice(0, 7)} → ${parent.slice(0, 7)} (the old tip is in git reflog)`);
