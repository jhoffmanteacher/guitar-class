/* site-src.mjs — the ONE place a Node tool reads the text of app.js, coach.js or teacher.js (rebuild slice 0a, 2026-11-11).

   Why: the rebuild (todo.md, "The shape of the rebuild") cuts those three scripts into part files that, concatenated
   in load order, equal today's file byte for byte. Many tools read the three files by name as TEXT (checks.mjs pins,
   pm-sim, grid-sim, the mic-sim tools). They all call this file, so after the cut they still see the same text.
   Today nothing is cut: each part list is the single file, and siteSource(name) is readFileSync(name, 'utf8').

   Zero dependencies, Node 18+, Windows and macOS.

   ── What it gives ──
     siteParts(name, root)   the ordered repo-relative part files of 'app.js' | 'coach.js' | 'teacher.js'
                             (forward slashes, load order). Any other name throws.
     siteSource(name, root)  the parts' raw text joined with NOTHING between them, each exactly as
                             readFileSync(file, 'utf8') returns it: no newline added or removed, no CRLF conversion
                             (callers keep whatever handling they have). Any other name throws.
     siteText(name, root)    for a loop over LOGICAL script names that mixes the three with other files:
                             siteSource for the three, readFileSync(join(root, name), 'utf8') for anything else.
     readScriptArg(path)     for a tool given a script's path on its command line: the whole script when the
                             path is one of the three inside a site folder, else the file as it is.
     hasScript(name, root)   whether that script is there, whole or in parts.
     SPLIT_NAMES             ['app.js', 'coach.js', 'teacher.js']
   `root` defaults to the repo root (the parent of tools/).

   ── Logical names and physical files: pick the right one ──
   'app.js', 'coach.js' and 'teacher.js' are LOGICAL names here: "the whole script". After the cut a part may carry
   the same name as the whole (the plan keeps the first 2,326 lines of coach.js in a file still called coach.js).
     * A tool that wants the CODE (a function body, a constant, a pin)       → siteSource(name) / siteText(name).
     * A tool that walks the FILES that ship (hash each one, `node --check` each one, "is it in sw.js ASSETS")
                                                                             → ...siteParts(name) in its list, and a
       plain readFileSync on each entry. Never siteText() on such a list: it would return the whole script for
       the part that shares its name.

   ── Where the part lists live (the cut edits DATA there, not this file's logic) ──
   Each list is declared once, in the place the site itself loads the parts from:

     app.js      index.html, a marked block of script tags, in load order:
                     <!-- site-parts:app.js -->
                     <script defer src="app/boot.js"></script>
                     <script defer src="app/save.js"></script>
                     <!-- /site-parts:app.js -->
                 Between the two markers only <script defer src="…"></script> tags and white space are allowed.

     coach.js    an array in the app code, next to ensureCoachJs(), on one line that starts the line:
                     const COACH_JS_PARTS = ['coach.js', 'coach-hub.js'];
     teacher.js  the same next to ensureTeacherJs():
                     const TEACHER_JS_PARTS = ['teacher.js', 'teacher-activities.js'];
                 (the loaders load those arrays in order; this file reads them out of siteSource('app.js'), so the
                 arrays may sit in any app part).

   No declaration → the list is [name], which is the site as it is today. A declaration that is malformed, names a
   part that does not exist, or leaves a stale whole file behind (app.js still on disk but not one of its own
   parts) THROWS: a tool must never silently read half a script.

   The array name must not appear anywhere else in the app code, comments included: a line that starts with
   `const COACH_JS_PARTS = [` inside a block comment would be taken for the declaration (review R1-4), and any
   other mention with no declaration line throws.

   The marker and array names above are the contract slices 0b / 1Z write to. To change the format, change
   declaredParts() below (the single function that reads declarations) and this header together. */
import { readFileSync, existsSync, readdirSync, realpathSync } from 'node:fs';
import { dirname, join, resolve, basename } from 'node:path';
import { fileURLToPath } from 'node:url';

const DEFAULT_ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export const SPLIT_NAMES = Object.freeze(['app.js', 'coach.js', 'teacher.js']);

const ARRAY_NAME = { 'coach.js': 'COACH_JS_PARTS', 'teacher.js': 'TEACHER_JS_PARTS' };

function assertSplitName(name, who) {
  if (!SPLIT_NAMES.includes(name)) {
    throw new Error(`site-src: ${who}(${JSON.stringify(name)}): only ${SPLIT_NAMES.join(', ')} are read through site-src (use readFileSync for any other file, or siteText() in a loop over script names)`);
  }
}

/* The single reader of part-list declarations. Returns the declared list, or null when the site declares none
   (today). Throws on a declaration it cannot read. */
function declaredParts(name, root) {
  if (name === 'app.js') {
    let html;
    try { html = readFileSync(join(root, 'index.html'), 'utf8'); } catch { return null; }
    const open = '<!-- site-parts:app.js -->', close = '<!-- /site-parts:app.js -->';
    const a = html.indexOf(open);
    if (a < 0) {
      if (html.includes(close)) throw new Error(`site-src: index.html has "${close}" without "${open}"`);
      return null;
    }
    const b = html.indexOf(close, a);
    if (b < 0) throw new Error(`site-src: index.html has "${open}" without "${close}"`);
    if (html.indexOf(open, a + open.length) >= 0) throw new Error(`site-src: index.html has "${open}" more than once`);
    const block = html.slice(a + open.length, b);
    const TAG = /<script defer src="([^"?#]+)"><\/script>/g;
    const parts = [...block.matchAll(TAG)].map(m => m[1]);
    if (block.replace(TAG, '').trim() !== '') throw new Error('site-src: index.html: between the site-parts:app.js markers only <script defer src="…"></script> tags are allowed');
    return parts;
  }
  const arr = ARRAY_NAME[name];
  // A folder with no app code at all (pm-sim's PM_ROOT copy holds four files) declares nothing (review R1-2).
  if (!existsSync(join(root, 'app.js')) && declaredParts('app.js', root) === null) {
    /* …but a SITE folder (it has an index.html) with neither app.js nor a part block has lost its app code:
       saying "nothing declared" there handed back part 1 of coach.js and teacher.js without a word (review R2-1). */
    if (existsSync(join(root, 'index.html'))) throw new Error(`site-src: ${root} has an index.html but no app.js and no site-parts:app.js block, so the part list of ${name} cannot be read`);
    return null;
  }
  const app = siteSource('app.js', root);
  const found = [...app.matchAll(new RegExp(`^const ${arr}\\s*=\\s*\\[([^\\]\\n]*)\\];`, 'gm'))];
  if (!found.length) {
    if (new RegExp(`^\\s*(?:const|let|var)\\s+${arr}\\b`, 'm').test(app)) throw new Error(`site-src: the app code declares ${arr} but not as one line "const ${arr} = ['…', '…'];" at the start of a line`);
    /* The name is in the app code but not as the one-line declaration (window.X = …, a property, a
       commented-out line): that must not read as "nothing declared", which would hand back part 1 alone
       (review R1-3). */
    if (new RegExp(`\\b${arr}\\b`).test(app)) throw new Error(`site-src: the app code mentions ${arr} but has no line "const ${arr} = ['…', '…'];" at the start of a line: write it that way, or remove the name`);
    return null;
  }
  if (found.length > 1) throw new Error(`site-src: the app code declares ${arr} ${found.length} times`);
  const body = found[0][1];
  const ITEM = /'([^'\\]+)'|"([^"\\]+)"/g;
  const parts = [...body.matchAll(ITEM)].map(m => m[1] || m[2]);
  if (body.replace(ITEM, '').replace(/[\s,]/g, '') !== '') throw new Error(`site-src: ${arr} must hold only quoted file names`);
  return parts;
}

/* Files that look like parts of a script: app/*.js, coach-*.js, teacher-*.js beside the script. Every one of them
   must be in the declared list, and with nothing declared there must be none: parts on disk that no list names
   mean the cut was written but not declared (or a list is short), and the file still called coach.js is then
   only its first part (review R2-1, R2-5). */
function looseParts(name, root, listed) {
  const stem = name.replace(/\.js$/, ''), found = [];
  try { for (const f of readdirSync(root)) if (f.startsWith(stem + '-') && f.endsWith('.js')) found.push(f); } catch { /* no such folder: nothing to find */ }
  if (name === 'app.js') { try { for (const f of readdirSync(join(root, 'app'))) if (f.endsWith('.js')) found.push('app/' + f); } catch { /* no app/ folder */ } }
  return found.filter(f => !listed.includes(f)).sort();
}

export function siteParts(name, root = DEFAULT_ROOT) {
  assertSplitName(name, 'siteParts');
  const parts = declaredParts(name, root);
  const loose = looseParts(name, root, parts || []);
  if (loose.length) throw new Error(`site-src: ${loose.join(', ')} ${loose.length > 1 ? 'look' : 'looks'} like part${loose.length > 1 ? 's' : ''} of ${name} but ${parts ? 'the declared list does not name ' + (loose.length > 1 ? 'them' : 'it') : 'no part list is declared'}: declare the parts (see this file's header) or remove the file${loose.length > 1 ? 's' : ''}`);
  if (parts === null) return [name];
  if (!parts.length) throw new Error(`site-src: the part list declared for ${name} is empty`);
  // './coach.js', 'sub//x.js' and 'Coach.js' are the same file as their plain spelling on a Mac: one spelling only (review R1-5).
  for (const p of parts) if (p !== p.replace(/^\.\//, '').replace(/\/+/g, '/') || /(^|\/)\.(\/|$)/.test(p)) throw new Error(`site-src: ${name} part ${JSON.stringify(p)} must be written plainly (no "./", no "//")`);
  if (new Set(parts.map(p => p.toLowerCase())).size !== parts.length) throw new Error(`site-src: the part list declared for ${name} names a file twice (letter case aside): ${parts.join(', ')}`);
  if (new Set(parts).size !== parts.length) throw new Error(`site-src: the part list declared for ${name} names a file twice: ${parts.join(', ')}`);
  for (const p of parts) {
    if (/^(?:[a-z]+:|\/)|\\|(?:^|\/)\.\.(?:\/|$)/i.test(p)) throw new Error(`site-src: ${name} part ${JSON.stringify(p)} is not a plain repo-relative path`);
    if (!existsSync(join(root, p))) throw new Error(`site-src: ${name} part ${p} does not exist`);
  }
  if (!parts.includes(name) && existsSync(join(root, name))) throw new Error(`site-src: ${name} is still on disk but is not one of its own declared parts (${parts.join(', ')}): delete it or list it`);
  return parts;
}

export function siteSource(name, root = DEFAULT_ROOT) {
  assertSplitName(name, 'siteSource');
  let out = '';
  for (const p of siteParts(name, root)) out += readFileSync(join(root, p), 'utf8');
  return out;
}

export function siteText(name, root = DEFAULT_ROOT) {
  return SPLIT_NAMES.includes(name) ? siteSource(name, root) : readFileSync(join(root, name), 'utf8');
}

/* For a tool that is GIVEN a script's path (node tools/mic-sim/power-wait.mjs coach.js): when the path is
   app.js, coach.js or teacher.js inside a site folder (one with an index.html), the whole script is returned,
   parts and all; any other path (an old copy saved with `git show`, a scratch file) is read as it is. After the
   cut a file still called coach.js holds only the first part, and a tool that read it directly reported success
   on a quarter of the code (review R1-1). */
export function readScriptArg(path) {
  // The real file behind a link: a link to a cut site's coach.js is that site's coach.js (review R2-2).
  let full = resolve(path); try { full = realpathSync(full); } catch { /* not there: the read below says so */ }
  const dir = dirname(full), name = basename(full);
  if (SPLIT_NAMES.includes(name) && existsSync(join(dir, 'index.html'))) return siteSource(name, dir);
  return readFileSync(full, 'utf8');
}
// Whether a site folder has that script at all, whole or in parts.
export function hasScript(name, root = DEFAULT_ROOT) {
  try { return siteParts(name, root).every(p => existsSync(join(root, p))); } catch { return false; }
}
