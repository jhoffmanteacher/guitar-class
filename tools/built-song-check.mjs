#!/usr/bin/env node
/* built-song-check.mjs — a built song's Import file, checked in Node by the SAME validator every student page
   runs (builtSongCheck in app/builtsongs.js, loaded from the site's own files), 2026-11-14.

     node tools/built-song-check.mjs <song.json> [--audio <stored copy.mp3>] [--root <site folder>]

   <song.json> is the Import file (app/builtsongs.js, "THE IMPORT FILE"): { id, v, title, artist, audio, song }.
   It prints every reason the site would refuse it, or one ✓ line with what the card holds. With --audio it
   also checks the mp3 against the file's `audio` entry the way the console's Import and every Chromebook do:
   the size in bytes and the SHA-256; and, when ffprobe is on the PATH, the length (within 0.05 s of
   audio.durationSec) and the bitrate (192k constant: Jonathan, 2026-11-14), printed with what was read.
   Exit 0: it passes. 1: refused (each reason printed). 2: could not run (no file, not JSON, no site files).
   Made-up or real, nothing leaves this computer: the tool reads two local files and writes nothing. */
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = join(dirname(fileURLToPath(import.meta.url)), '..');

/* The validator and the expansion, run from the site's own files in a small vm: i18n.js (the strings the card
   takes), app/songfiles.js (the 'private:' prefix and the tracked list) and app/builtsongs.js. Exported for the
   other Node tools. */
export function loadBuiltSongs(root = HERE){
  const el = () => ({ style: {}, dataset: {}, classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } }, setAttribute(){}, getAttribute(){ return null; },
    querySelector(){ return null; }, querySelectorAll(){ return []; }, addEventListener(){}, appendChild(){} });
  const store = () => ({ _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k, v){ this._d[k] = String(v); }, removeItem(k){ delete this._d[k]; } });
  const ctx = { console, setTimeout, clearTimeout, URL, TextEncoder,
    document: { documentElement: el(), body: el(), head: el(), getElementById(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; }, addEventListener(){}, createElement: el },
    localStorage: store(), sessionStorage: store(), navigator: { language: 'en', onLine: true }, location: { hostname: 'localhost', href: 'http://localhost/', hash: '', search: '' },
    addEventListener(){}, matchMedia: () => ({ matches: false, addEventListener(){} }) };
  ctx.window = ctx; ctx.globalThis = ctx;
  vm.createContext(ctx);
  for (const f of ['i18n.js', 'app/songfiles.js', 'app/builtsongs.js']) vm.runInContext(readFileSync(join(root, f), 'utf8'), ctx, { filename: f });
  return {
    check: (id, doc) => vm.runInContext('builtSongCheck', ctx)(id, doc),
    expand: (id, doc) => vm.runInContext('builtSongExpand', ctx)(id, doc),
    SONG_FILES: vm.runInContext('SONG_FILES', ctx),
    ctx,
  };
}

async function main(){
  const args = process.argv.slice(2);
  const opt = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
  const file = args.find((a, i) => !a.startsWith('--') && (i === 0 || !['--audio', '--root'].includes(args[i - 1])));
  const root = resolve(opt('--root') || HERE), audio = opt('--audio');
  if (!file || !existsSync(file)) { console.error('built-song-check: give the song file: node tools/built-song-check.mjs <song.json> [--audio <mp3>]'); return 2; }
  let f;
  try { f = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { console.error('built-song-check: not JSON: ' + e.message); return 2; }
  let B;
  try { B = loadBuiltSongs(root); } catch (e) { console.error('built-song-check: could not load the site files from ' + root + ': ' + e.message); return 2; }
  const why = [];
  if (!f || typeof f !== 'object' || Array.isArray(f)) why.push('the file is not one JSON object');
  else {
    const extra = Object.keys(f).filter(k => !['id', 'v', 'title', 'artist', 'audio', 'song'].includes(k));
    if (extra.length) why.push('the Import file has field(s) the console does not take: ' + extra.join(', '));
  }
  const { id, ...doc } = f || {};
  if (!why.length) why.push(...B.check(id, doc));
  if (!why.length && Object.prototype.hasOwnProperty.call(B.SONG_FILES, doc.audio.id)) why.push(`audio.id ${doc.audio.id} is on SONG_FILES (the tracked list wins: the site leaves this song out)`);
  let audioLine = '';
  if (audio) {
    if (!existsSync(audio)) why.push('no mp3 at ' + audio);
    else if (doc && doc.audio) {
      const bytes = readFileSync(audio), sha = createHash('sha256').update(bytes).digest('hex');
      if (bytes.length !== doc.audio.bytes) why.push(`the mp3 is ${bytes.length} bytes; the file says ${doc.audio.bytes}`);
      if (sha !== doc.audio.sha256) why.push(`the mp3's SHA-256 is ${sha.slice(0, 12)}…; the file says ${String(doc.audio.sha256).slice(0, 12)}…`);
      const pr = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration,bit_rate:stream=bit_rate,sample_rate,codec_name', '-of', 'json', audio], { encoding: 'utf8' });
      if (pr.status === 0) {
        const j = JSON.parse(pr.stdout), st = (j.streams || [])[0] || {}, dur = Number(j.format && j.format.duration);
        if (!(Math.abs(dur - doc.audio.durationSec) <= 0.05)) why.push(`ffprobe reads ${dur} s; the file says ${doc.audio.durationSec} s (more than 0.05 s apart)`);
        if (st.codec_name !== 'mp3') why.push(`the audio is ${st.codec_name}, not mp3`);
        if (Number(st.bit_rate) !== 192000) why.push(`the stream's bitrate is ${st.bit_rate}, not 192000 (192k constant)`);
        audioLine = `; mp3 ${bytes.length.toLocaleString('en-US')} bytes, SHA-256 matches, ${dur.toFixed(2)} s, ${st.bit_rate / 1000}k, ${st.sample_rate} Hz`;
      } else audioLine = `; mp3 ${bytes.length.toLocaleString('en-US')} bytes, SHA-256 checked (no ffprobe: length and bitrate not read)`;
    }
  }
  if (why.length) { console.log(`built-song-check: ✗ ${String(id)} refused, ${why.length} reason${why.length === 1 ? '' : 's'}:`); why.forEach(w => console.log('  - ' + w)); return 1; }
  const ex = B.expand(id, doc);
  const secs = ex.activity.card.sections;
  const lyr = secs.filter(s => s.rowLabels).length;
  console.log(`built-song-check: ✓ ${id} "${doc.title}" passes: ${doc.song.meter} at ${Math.round(doc.song.bpm * 100) / 100}, ${doc.song.bars.length} bars, ${doc.song.sections.length} section${doc.song.sections.length === 1 ? '' : 's'} (the card plays ${secs.length}), ${Object.keys(doc.song.chords).length} chords, level ${doc.song.level.versions}${doc.song.barTimes ? ', a beat map' : ''}, ${lyr} section${lyr === 1 ? '' : 's'} with lyric lines, ${doc.audio.centsOff} cents${audioLine}`);
  return 0;
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) process.exit(await main());
