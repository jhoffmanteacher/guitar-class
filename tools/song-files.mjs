#!/usr/bin/env node
/* song-files.mjs — the tools' side of SONG FILES (song recordings behind the sign-in, 2026-11-14; the site's side
   is app/songfiles.js, whose header has the whole design).

     node tools/song-files.mjs                          the list, and per entry whether the private folder has it
                                                        and whether it matches (exit 1 when a local copy differs)
     node tools/song-files.mjs --add <mp3> [--id <id>]  measure an mp3 (bytes, SHA-256, length) and write or update
                                                        its entry in app/songfiles.js; the mp3 is copied into the
                                                        private folder when it is not there yet
     --root <dir>   work on another copy of the site (default: this checkout)

   WHERE A PRIVATE SONG LIVES. Not in the repo. On Jonathan's Mac, in the private song folder:
   ~/Documents/guitar-class-song-files/, or the folder in the environment variable GC_SONG_FILES_DIR. The repo holds
   only the LIST (SONG_FILES in app/songfiles.js, strict JSON between the SONG_FILES:BEGIN / SONG_FILES:END
   markers): per id the file's name, its size in bytes, its SHA-256 and its length in seconds. On GitHub and in a
   fresh worktree the folder is not there; every tool then works from the list (checks.mjs uses its length where
   it needs one) instead of failing. A copy in the folder that does NOT match its entry is an error, never
   silently used: the list is what the site checks every download against.

   WHAT A LENGTH IS. durationSec is counted from the mp3's frames the way tools/checks.mjs's mp3DurationSec does
   (every frame's samples over the sample rate), so a check reads the same number from the list as it would from
   the file. ffprobe's reading (it honours the encoder delay) is printed beside it by --add, never stored.

   The Python tools (tools/loudness.py, tools/beat-audit.py) read the same list through tools/song_files.py; this
   file is the only WRITER of the list. */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, existsSync, statSync, mkdirSync, copyFileSync, renameSync } from 'node:fs';
import { join, resolve, dirname, basename } from 'node:path';
import { homedir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

export const SONG_FILE_PREFIX = 'private:';
export const SONG_FILES_SRC = 'app/songfiles.js';
export const SONG_ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;
/* A plain file name (no folder), as the console uploads it. */
export const SONG_FILE_NAME_RE = /^[A-Za-z0-9][A-Za-z0-9._#-]{0,159}\.mp3$/;
export const SONG_BYTES_MAX = 36000000;
export const SONG_SECONDS_MAX = 1800;
const SHA_RE = /^[0-9a-f]{64}$/;
const FIELDS = ['file', 'bytes', 'sha256', 'durationSec'];
/* The list, markers included: group 1 is the JSON object. */
const BLOCK_RE = /(\/\* SONG_FILES:BEGIN[\s\S]*?\*\/\r?\n)const SONG_FILES = ([\s\S]*?);(\r?\n\/\* SONG_FILES:END \*\/)/;

export function songFilesDir() {
  const env = process.env.GC_SONG_FILES_DIR;
  return resolve(env && env.trim() ? env.trim() : join(homedir(), 'Documents', 'guitar-class-song-files'));
}
export function privateId(path) {
  return typeof path === 'string' && path.startsWith(SONG_FILE_PREFIX) ? path.slice(SONG_FILE_PREFIX.length) : null;
}

/* What is wrong with one entry, or null. */
export function entryProblem(id, e) {
  if (!SONG_ID_RE.test(id)) return `id "${id}" is not ${SONG_ID_RE} (lower-case letters, digits and dashes, at most 80)`;
  if (!e || typeof e !== 'object' || Array.isArray(e)) return `${id}: not an object`;
  const keys = Object.keys(e);
  const odd = keys.filter(k => !FIELDS.includes(k));
  if (odd.length) return `${id}: unknown field${odd.length > 1 ? 's' : ''} ${odd.join(', ')} (an entry has exactly ${FIELDS.join(', ')})`;
  const missing = FIELDS.filter(k => !(k in e));
  if (missing.length) return `${id}: missing ${missing.join(', ')}`;
  if (typeof e.file !== 'string' || !SONG_FILE_NAME_RE.test(e.file)) return `${id}: file "${e.file}" is not a plain *.mp3 name`;
  if (!Number.isInteger(e.bytes) || e.bytes < 1 || e.bytes > SONG_BYTES_MAX) return `${id}: bytes ${JSON.stringify(e.bytes)} is not a whole number from 1 to ${SONG_BYTES_MAX}`;
  if (typeof e.sha256 !== 'string' || !SHA_RE.test(e.sha256)) return `${id}: sha256 ${JSON.stringify(e.sha256)} is not 64 lower-case hex digits`;
  if (typeof e.durationSec !== 'number' || !(e.durationSec > 0) || e.durationSec > SONG_SECONDS_MAX) return `${id}: durationSec ${JSON.stringify(e.durationSec)} is not a number above 0 and at most ${SONG_SECONDS_MAX}`;
  return null;
}

/* The list in <root>/app/songfiles.js. Throws (with the reason) on a missing block, bad JSON or a bad entry. */
export function readSongFiles(root) {
  let src;
  try { src = readFileSync(join(root, SONG_FILES_SRC), 'utf8'); }
  catch (e) { throw new Error(`${SONG_FILES_SRC} cannot be read: ${e.message}`); }
  const m = BLOCK_RE.exec(src);
  if (!m) throw new Error(`${SONG_FILES_SRC} has no "/* SONG_FILES:BEGIN … */ const SONG_FILES = {…}; /* SONG_FILES:END */" block`);
  let list;
  try { list = JSON.parse(m[2]); }
  catch (e) { throw new Error(`${SONG_FILES_SRC}: the list between the SONG_FILES markers is not strict JSON (${e.message})`); }
  if (!list || typeof list !== 'object' || Array.isArray(list)) throw new Error(`${SONG_FILES_SRC}: SONG_FILES is not a JSON object`);
  const seen = new Map();
  for (const [id, e] of Object.entries(list)) {
    const p = entryProblem(id, e);
    if (p) throw new Error(`${SONG_FILES_SRC}: SONG_FILES ${p}`);
    if (seen.has(e.file)) throw new Error(`${SONG_FILES_SRC}: SONG_FILES ${id} and ${seen.get(e.file)} name the same file ${e.file}`);
    seen.set(e.file, id);
  }
  return list;
}

/* The block as this tool writes it: ids sorted, one entry per line, fields in a fixed order. */
export function renderSongFiles(list) {
  const ids = Object.keys(list).sort();
  if (!ids.length) return '{}';
  return '{\n' + ids.map(id => '  ' + JSON.stringify(id) + ': ' + JSON.stringify(Object.fromEntries(FIELDS.map(k => [k, list[id][k]])))).join(',\n') + '\n}';
}
export function writeSongFiles(root, list) {
  for (const [id, e] of Object.entries(list)) { const p = entryProblem(id, e); if (p) throw new Error(`refusing to write SONG_FILES: ${p}`); }
  const f = join(root, SONG_FILES_SRC);
  const src = readFileSync(f, 'utf8');
  if (!BLOCK_RE.test(src)) throw new Error(`${SONG_FILES_SRC} has no SONG_FILES block to write into`);
  const out = src.replace(BLOCK_RE, (_, a, __, c) => `${a}const SONG_FILES = ${renderSongFiles(list)};${c}`);
  writeFileSync(f + '.song-files-part', out);
  renameSync(f + '.song-files-part', f);
  return readSongFiles(root);   // read back: what was written parses
}

/* SHA-256 of a file, kept per path + size + mtime for this process (a check run asks for the same file often). */
const shaMemo = new Map();
export function fileSha256(file) {
  const s = statSync(file);
  const k = `${file}\0${s.size}\0${s.mtimeMs}`;
  if (!shaMemo.has(k)) shaMemo.set(k, createHash('sha256').update(readFileSync(file)).digest('hex'));
  return shaMemo.get(k);
}

/* A local copy against its entry: null when it matches, else what differs. */
export function localMismatch(file, entry) {
  const size = statSync(file).size;
  if (size !== entry.bytes) return `is ${size} bytes, the list says ${entry.bytes}`;
  const sha = fileSha256(file);
  if (sha !== entry.sha256) return `has SHA-256 ${sha.slice(0, 12)}…, the list says ${entry.sha256.slice(0, 12)}…`;
  return null;
}

/* Where an audio path's bytes are.
     'audio/x.mp3' (relative to <root>/<base>)  -> { kind:'public', file }
     'private:<id>'                             -> { kind:'private', id, entry, file } where file is the local copy
                                                   when the folder has it AND it matches, else null (work from entry)
   Throws when the id is not on the list, and when a local copy is there but does NOT match: never silently used.
   opts: { list, dir, base } (list read from root, dir songFilesDir(), base '' by default). */
export function resolveAudio(root, path, opts = {}) {
  const id = privateId(path);
  if (id === null) return { kind: 'public', file: join(root, opts.base || '', path) };
  const list = opts.list || readSongFiles(root);
  const entry = Object.prototype.hasOwnProperty.call(list, id) ? list[id] : null;
  if (!entry) throw new Error(`${path}: "${id}" is not on the SONG_FILES list in ${SONG_FILES_SRC}`);
  const local = join(opts.dir || songFilesDir(), entry.file);
  if (!existsSync(local)) return { kind: 'private', id, entry, file: null, local };
  const bad = localMismatch(local, entry);
  if (bad) throw new Error(`${path}: the private folder's ${local} ${bad} — re-run node tools/song-files.mjs --add on the right file, or put the listed file back`);
  return { kind: 'private', id, entry, file: local, local };
}

/* Seconds of an mp3 by its frames: the same count as tools/checks.mjs mp3DurationSec. */
const MP3_BITRATES = { 1: [0,32,40,48,56,64,80,96,112,128,160,192,224,256,320,0], 2: [0,8,16,24,32,40,48,56,64,80,96,112,128,144,160,0] };
const MP3_RATES = { 3: [44100,48000,32000], 2: [22050,24000,16000], 0: [11025,12000,8000] };
export function mp3FrameSeconds(buf) {
  let i = 0;
  if (buf.length > 10 && buf[0] === 0x49 && buf[1] === 0x44 && buf[2] === 0x33)
    i = 10 + ((buf[6] << 21) | (buf[7] << 14) | (buf[8] << 7) | buf[9]);
  let samples = 0, rate = 0, frames = 0;
  while (i < buf.length - 4) {
    if (buf[i] !== 0xFF || (buf[i + 1] & 0xE0) !== 0xE0) { i++; continue; }
    const verBits = (buf[i + 1] >> 3) & 3, layer = (buf[i + 1] >> 1) & 3;
    const brIdx = (buf[i + 2] >> 4) & 15, srIdx = (buf[i + 2] >> 2) & 3, pad = (buf[i + 2] >> 1) & 1;
    if (layer !== 1 || verBits === 1 || srIdx === 3 || brIdx === 0 || brIdx === 15) { i++; continue; }
    const sr = (MP3_RATES[verBits] || [])[srIdx];
    const br = MP3_BITRATES[verBits === 3 ? 1 : 2][brIdx] * 1000;
    if (!sr || !br) { i++; continue; }
    const spf = verBits === 3 ? 1152 : 576;
    const len = Math.floor(spf / 8 * br / sr) + pad;
    if (len < 4) { i++; continue; }
    samples += spf; rate = sr; frames++;
    i += len;
  }
  return (frames && rate) ? samples / rate : null;
}
function ffprobeSeconds(file) {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' });
  const v = !r.error && r.status === 0 ? Number(r.stdout.trim()) : NaN;
  return Number.isFinite(v) ? v : null;
}
/* What the list stores for one mp3. */
export function measureSongFile(file) {
  const buf = readFileSync(file);
  const sec = mp3FrameSeconds(buf);
  if (sec === null) throw new Error(`${file}: no mp3 frames found (not an mp3?)`);
  return { bytes: buf.length, sha256: createHash('sha256').update(buf).digest('hex'), durationSec: Math.round(sec * 1000) / 1000, ffprobeSec: ffprobeSeconds(file) };
}
export function idFromName(name) {
  return basename(name).replace(/\.mp3$/i, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80).replace(/-+$/, '');
}

/* Register one mp3: measure it, copy it into the private folder (unless it is there already, byte for byte), and
   write its entry. An id already on the list may only be updated with the same file name; a file name already on
   the list under another id is refused; a different file of the same name in the folder is never overwritten. */
export function addSongFile(root, mp3, opts = {}) {
  const src = resolve(mp3);
  if (!existsSync(src)) throw new Error(`${mp3} does not exist`);
  const name = basename(src);
  if (!SONG_FILE_NAME_RE.test(name)) throw new Error(`"${name}" is not a plain *.mp3 name (${SONG_FILE_NAME_RE})`);
  const id = opts.id || idFromName(name);
  if (!SONG_ID_RE.test(id)) throw new Error(`id "${id}" is not ${SONG_ID_RE}`);
  if (existsSync(join(root, 'audio', name))) throw new Error(`audio/${name} is in the public folder: a private song must not be public too (move it out first)`);
  const list = readSongFiles(root);
  if (list[id] && list[id].file !== name) throw new Error(`"${id}" is already on the list for ${list[id].file}, not ${name}`);
  const other = Object.keys(list).find(k => k !== id && list[k].file === name);
  if (other) throw new Error(`${name} is already on the list as "${other}"`);
  const m = measureSongFile(src);
  const dir = opts.dir || songFilesDir();
  const dest = join(dir, name);
  let copied = false;
  if (resolve(dest) !== src) {
    if (existsSync(dest)) {
      if (statSync(dest).size !== m.bytes || fileSha256(dest) !== m.sha256)
        throw new Error(`the private folder already has a different ${name} (${dest}); move one of them away first`);
    } else {
      mkdirSync(dir, { recursive: true });
      copyFileSync(src, dest + '.song-files-part');
      renameSync(dest + '.song-files-part', dest);
      copied = true;
    }
  }
  const was = list[id] || null;
  list[id] = { file: name, bytes: m.bytes, sha256: m.sha256, durationSec: m.durationSec };
  writeSongFiles(root, list);
  /* ONE pin counts the list (checks.mjs 1dz, SONG_FILES_PIN; review B3): a NEW entry moves it here, so every way a
     song joins the list (this CLI, new-playalong --private, loudness.py's rewrite of an existing entry, which does
     not move it) keeps the checks green without a hand edit. */
  if (!was) {
    const cf = join(root, 'tools', 'checks.mjs');
    if (existsSync(cf)) {
      const t = readFileSync(cf, 'utf8'), n = t.replace(/const SONG_FILES_PIN = (\d+);/, (x, k) => `const SONG_FILES_PIN = ${Number(k) + 1};`);
      if (n === t) throw new Error('tools/checks.mjs has no "const SONG_FILES_PIN = N;" to move');
      writeFileSync(cf, n);
    }
  }
  return { id, entry: list[id], was, copied, dest, ffprobeSec: m.ffprobeSec };
}

/* Each entry against the private folder. */
export function songFilesStatus(root, opts = {}) {
  const list = opts.list || readSongFiles(root);
  const dir = opts.dir || songFilesDir();
  const folder = existsSync(dir);
  return { dir, folder, rows: Object.entries(list).map(([id, entry]) => {
    const local = join(dir, entry.file);
    if (!existsSync(local)) return { id, entry, state: 'missing' };
    const bad = localMismatch(local, entry);
    return { id, entry, state: bad ? 'differs' : 'matches', why: bad };
  }) };
}

/* ── CLI ── */
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
  const root = resolve(opt('--root') || join(dirname(fileURLToPath(import.meta.url)), '..'));
  const die = (m) => { console.error('song-files: ✗ ' + m); process.exit(2); };
  try {
    if (args.includes('--add')) {
      const mp3 = opt('--add');
      if (!mp3 || mp3.startsWith('--')) die('usage: node tools/song-files.mjs --add <mp3> [--id <id>] [--root <dir>]');
      const r = addSongFile(root, mp3, { id: opt('--id') || undefined });
      const e = r.entry;
      console.log(`song-files: ${r.was ? 'updated' : 'added'} "${r.id}" in ${SONG_FILES_SRC}: ${e.file}, ${e.bytes} bytes, sha256 ${e.sha256.slice(0, 12)}…, ${e.durationSec} s by its frames${r.ffprobeSec !== null ? ` (ffprobe ${r.ffprobeSec.toFixed(3)} s)` : ''}`);
      if (r.was && (r.was.bytes !== e.bytes || r.was.sha256 !== e.sha256)) console.log(`  was ${r.was.bytes} bytes, sha256 ${r.was.sha256.slice(0, 12)}…: the console's copy must be uploaded again (Manage → Song files)`);
      console.log(r.copied ? `  copied into the private folder: ${r.dest}` : `  the private folder already has it: ${r.dest}`);
      process.exit(0);
    }
    const st = songFilesStatus(root);
    const n = st.rows.length;
    console.log(`song-files: ${n} song file${n === 1 ? '' : 's'} on the list (${SONG_FILES_SRC}); private folder ${st.dir} ${st.folder ? 'is here' : 'is NOT here (the tools work from the list)'}`);
    for (const r of st.rows)
      console.log(`  ${r.id.padEnd(40)} ${r.entry.file}  ${r.entry.bytes} bytes  ${r.entry.durationSec} s  ${r.state === 'matches' ? 'local copy matches' : r.state === 'missing' ? 'no local copy' : 'LOCAL COPY DIFFERS: ' + r.why}`);
    process.exit(st.rows.some(r => r.state === 'differs') ? 1 : 0);
  } catch (e) { die(e.message); }
}
