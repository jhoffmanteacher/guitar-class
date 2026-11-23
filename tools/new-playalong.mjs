#!/usr/bin/env node
/* new-playalong.mjs — the typing part of a new Play Along song (recipe: skill new-playalong, 2026-11-13).

     node tools/new-playalong.mjs <spec.json> --dry-run                 print everything it would add, change nothing
     node tools/new-playalong.mjs <spec.json> --from <upload.mp3>        make the two mp3s in audio/, then add the rest
     node tools/new-playalong.mjs <spec.json>                            the mp3s are already in audio/: add the rest
     --root <dir>   work on another copy of the site (default: this checkout)
     --private      a song behind the sign-in (SONG FILES, 2026-11-14; app/songfiles.js): the two mp3s go to the
                    private song folder (~/Documents/guitar-class-song-files/, or GC_SONG_FILES_DIR), never audio/;
                    the track's paths are 'private:<slug>-<bpm>'; both files are put on the SONG_FILES list with
                    tools/song-files.mjs (name, size, SHA-256, length) and checks.mjs's SONG_FILES_PIN goes up by 2 (tools/song-files.mjs moves it, once per new entry).
                    Then Jonathan uploads them in the console (Manage → Song files) and presses Verify before the push.
     node tools/new-playalong.mjs <spec.json> --built --from <upload.mp3>    a BUILT SONG (Song builder, Part a2)
     node tools/new-playalong.mjs <spec.json> --built [--from <upload.mp3>] --dry-run
                    instead of a card: the Import file and the stored copy, for Manage → Built songs → Import.
                    See "THE BUILT MODE" below. It edits NO repo file.

   THE BUILT MODE (--built, 2026-11-14; format: the header of app/builtsongs.js, "THE CHART" and "THE AUDIO").
     It writes TWO files into the private song folder (GC_SONG_FILES_DIR, else ~/Documents/guitar-class-song-files/;
     a folder inside the checkout is refused), never audio/ or the repo:
       <id>.json         the Import file { id, v: 1, title, artist, audio, song }. id = 'sb-' + the spec's slug with
                         everything but a-z and 0-9 taken out, cut to 24 (or the spec's "builtId"); 8 to 24 needed.
       <audio.id>.mp3    the stored copy: audio.id = <id>-<first 10 hex of its SHA-256>. ONE file, made like this:
                         the source's first audio stream; with a "cents" shift, first shifted as the card mode
                         shifts (rubberband, formants held) into a lossless copy whose timing is checked against the
                         upload (loudness.py's 40 s cross-correlation on the part above 2 kHz: on held notes a pitch
                         shift makes the full-band peak land a period off; under 10 ms); then ONE measured gain to
                         "the cure"'s loudness and a -1 dBFS limiter (both from tools/loudness.py, imported:
                         LIMITER, measure, the gain iteration and the ceiling search of encode_verified),
                         libmp3lame 192k CONSTANT bitrate, the source's sample rate and channels (no resample: a
                         source that is not 32, 44.1 or 48 kHz is refused), tags and cover art dropped. No
                         time-stretch, no slow file, no trim. It must pass loudness.py's own tests before it is
                         kept, against what was levelled: the cure's loudness ±0.3 LU, both decoded peaks ≤ -1 dBFS,
                         length within 0.05 s (decoded, and ffprobe against the upload), the first 40 s
                         cross-correlated under 10 ms; plus 192k CBR (frame headers and ffprobe) and the source's
                         rate and channels. Like loudness.py it tries the gain 8 times: a source the limiter keeps
                         eating (very peaky and quiet) can end outside ±0.3 LU, and is refused. Staged in a dot
                         folder, moved in only when every test passed.
     audio: bytes, sha256 (the stored copy), durationSec (ffprobe), gainDb (the one gain), sourceSha256 (the
       --from file), centsOff (tools/playalong-measure.py's TUNING reading of the STORED copy: with a "cents" shift
       that is the residual after it). |centsOff| > 10 is refused before anything is encoded (read on the source,
       minus the shift) and again on the copy: put "cents" in the spec.
     song: meter from beatsPerBar / countSix ('4/4', '3/4', '6/8'); bpm = feltBpm (the COUNTED beats a minute; the
       spec's bpm and slowBpm name files and are not used); anchor; barTimes (optional, below); chords from the same
       shape picker as the card (flat [lowE..highE] arrays); one bar string per bar from loop / chart ("A G" splits
       the bar evenly: 'A:2 G:2'; "-" is a rest, built mode only); sections from the labels (Intro, Verse N,
       Pre-Chorus, Chorus, Refrain, Bridge, Interlude, Solo, Riff, Requinto, Outro, Ending, or a section's own
       "name" / "n"); level from versions / chordStart. If the first section starts after bar 1, the bars before it
       are dropped and the anchor moves to it (bar numbers start again at 1).
     Spec fields read ONLY by --built (the card mode ignores them):
       barTimes      every song bar's downbeat in seconds, barTimes[0] = anchor (a beat map from 3+ pins)
       lyrics        per section: [{ "text": "...", "bars": n }], the lines adding up to the section's bars
                     (a line with text "" is bars with no words). Built songs show lyrics; a coded card never does
       name, n       per section: the built section name and number, when the label is not one of the list
       range         { "from": i, "to": j }: the card plays sections i..j (0-based); left out = the whole song
       builtId       the id, when the slug gives fewer than 8 letters and digits
       capo          the capo fret, 1-9 (song.capo): write the chords as PLAYED with it (C Em G at capo 4, not E G#m B)
     Captions, label_es, fileSlug, key, slowBpm and durationSec are not needed. --private is refused with it.
     It ends by running node tools/built-song-check.mjs <id>.json --audio <audio.id>.mp3 and printing its line;
     the exit code is that tool's. --dry-run prints the Import file (audio entry still empty), the validator's
     verdict on the chart and the planned ffmpeg chain, and writes nothing.

   WHY IT EXISTS. Every play-along on a record (ca-37, ca-39, ca-41, ca-42, ca-51) was typed by hand: two mp3s
   made with the same three ffmpeg lines, a SNIPPET_TRACKS entry, a card whose chart is the same loop written out
   lap after lap (ca-51: 71 chord objects, each with frets and midi worked out by hand, twice over for the power
   chords), the next free id, and four pins in three tools. That is what this does. It does NOT decide anything
   that needs ears or taste: the tempo, the first downbeat and the meter come from tools/playalong-measure.py and
   your judgment; the sections, captions and chords come from the spec you write; levelling is tools/loudness.py;
   checking the map against the record is tools/beat-audit.py.

   THE SPEC (JSON; see the skill for a filled-in example):
     song, artist                 as the title shows them: '"<song>" - <artist> — Play Along'
     slug                         SNIPPET_TRACKS key, e.g. "perdon-mama"
     fileSlug, key                audio/<fileSlug>-backing-<key>-<bpm>bpm-440hz-full.mp3 (artist-song, lower-case)
     bpm, slowBpm                 the two files (slowBpm = bpm / 1.2 rounded, as playalong-measure.py prints)
     feltBpm                      a number or an expression as the site writes it ("230 / 3")
     beatsPerBar, countSix        countSix only for 6/8 (beatsPerBar 2)
     anchor, durationSec          from playalong-measure.py (durationSec: the file's whole seconds)
     cents                        optional: shift the pitch this many cents (only when the record is over 10 off)
     trackComment, cardComment    how it was measured / where the chords came from (prose, wrapped for you)
     loop                         the chart, one entry per BAR: "C#m", or "A G" (two chords splitting the bar evenly)
     loopFrom                     the song bar the loop's first bar falls on (default 1)
     sections                     [{ label, label_es?, fromBar, bars, caption, caption_es, caption_power?,
                                     caption_power_es?, chart? }]  back to back; `chart` (bars, like loop) overrides
                                     the loop for that section
     versions                     "both" (Full chords notes + a Power chords switch; default), "power" or "full"
     chordStart                   "power" (default when versions is both) or "full"
     shapes, powerShapes          optional per-chord overrides: { "C#m": "A4" } = root on the A string, fret 4
     library                      true (default: More Play Along songs, for everyone, from the push)
     intro, intro_es, intro_power, intro_power_es   optional: one line each; a default is written from the loop
     id                           optional: default the next never-used ca-N (the RETIRED IDS note)
     date                         optional: YYYY-MM-DD for the comments, the changelog and the card's `added` (default today)

   WHAT IT WRITES (and --dry-run prints): audio/ (with --from), app/snippets.js (the track, last in
   SNIPPET_TRACKS), class-activities.js (the card, last in the array, and the RETIRED IDS note's next id),
   tools/checks.mjs (the id in CHORD_GRID_CARDS; 1ct's card count +2 and 1cs's direction-string count +10 or +6,
   EN + ES), tools/playalong-loop.mjs (METER and CLOCK_PINS: the pin is the
   measured clock, written so the walk can run; see the skill), CHANGELOG.md (a draft entry on top: read it and
   fix the words). It never touches sw.js (node tools/checks.mjs writes the audio hashes and the cache version). */
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, rmSync } from 'node:fs';
import { join, resolve, dirname, relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { addSongFile, songFilesDir, readSongFiles, SONG_ID_RE } from './song-files.mjs';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const DRY = args.includes('--dry-run');
const ROOT = resolve(opt('--root') || HERE);
const FROM = opt('--from');
const PRIVATE = args.includes('--private');
const BUILT = args.includes('--built');
const specPath = args.find((a, i) => !a.startsWith('--') && !['--root', '--from'].includes(args[i - 1]));
const die = (m) => { console.error('new-playalong: ' + m); process.exit(2); };
if (!specPath) die('usage: node tools/new-playalong.mjs <spec.json> [--dry-run] [--from <upload.mp3>] [--root <dir>] [--private]');
const S = JSON.parse(readFileSync(specPath, 'utf8'));
for (const k of BUILT ? ['song', 'artist', 'slug', 'feltBpm', 'beatsPerBar', 'anchor', 'sections']
  : ['song', 'artist', 'slug', 'fileSlug', 'key', 'bpm', 'slowBpm', 'feltBpm', 'beatsPerBar', 'anchor', 'durationSec', 'sections'])
  if (S[k] == null) die(`the spec has no "${k}"`);
/* Today on this computer's calendar (toISOString is UTC: after 4 PM Pacific it is already tomorrow). It is also the
   card's `added`, the Songs page's "Date added" (2026-11-23; checks.mjs 1fa). */
const localDay = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const date = S.date || localDay(new Date());
if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || isNaN(Date.parse(date + 'T00:00:00Z')) || new Date(date + 'T00:00:00Z').toISOString().slice(0, 10) !== date) die(`"date" must be YYYY-MM-DD (got ${JSON.stringify(date)})`);
const versions = S.versions || 'both';
const chordStart = S.chordStart || (versions === 'both' ? 'power' : null);
const library = S.library !== false;
const rd = (f) => readFileSync(join(ROOT, f), 'utf8');

/* ── the fretboard ── */
const STR = ['E', 'A', 'D', 'G', 'B', 'e'], OPEN = { E: 40, A: 45, D: 50, G: 55, B: 59, e: 64 };
const PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const pcOf = (r) => (PC[r[0]] + (r[1] === '#' ? 1 : r[1] === 'b' ? -1 : 0) + 12) % 12;
function parseChord(name) {
  const m = /^([A-G][#b]?)(m|5)?$/.exec(name);
  return m ? { root: m[1], q: m[2] || '' } : null;
}
/* Open shapes: the site's own chord library (guitar-diagrams.js CHORD_DIAGRAMS), position 0 only, so a full
   chord here draws what the chord pop-up draws. Barre chords: the E shape (root on the low E) or the A shape
   (root on the A string), major or minor. */
function openShapes() {
  const src = rd('guitar-diagrams.js');
  const body = src.slice(src.indexOf('var CHORD_DIAGRAMS = {'), src.indexOf('};', src.indexOf('var CHORD_DIAGRAMS = {')));
  const out = {};
  for (const m of body.matchAll(/'([^']+)'\s*:\s*\{\s*position:(\d+),\s*chord:(\[\[[^\n]*?\]\])\s*\}/g)) {
    if (m[2] !== '0') continue;
    const rows = JSON.parse(m[3].replace(/'/g, '"'));
    const frets = rows.filter(r => r[1] !== 'x').map(r => [STR[6 - r[0]], r[1]]).sort((a, b) => STR.indexOf(a[0]) - STR.indexOf(b[0]));
    out[m[1]] = frets;
  }
  return out;
}
const OPEN_SHAPES = openShapes();
const mk = (frets, note) => ({ frets, note, midi: frets.map(([s, f]) => OPEN[s] + f) });
function barre(c, where) {   // where: 'E<fret>' | 'A<fret>'
  const s = where[0], f = Number(where.slice(1)), minor = c.q === 'm';
  const fr = s === 'E'
    ? [['E', f], ['A', f + 2], ['D', f + 2], ['G', f + (minor ? 0 : 1)], ['B', f], ['e', f]]
    : [['A', f], ['D', f + 2], ['G', f + 2], ['B', f + (minor ? 1 : 2)], ['e', f]];
  return fr;
}
const rootFret = (c, s) => { const f = (pcOf(c.root) - (OPEN[s] % 12) + 12) % 12; return f === 0 ? 12 : f; };
/* Pick one position per chord so the hand moves least: every combination of E-string / A-string roots, the one
   with the smallest span of root frets, then the lowest. Fret 0 is never picked for a power chord (no open A5 /
   E5 on a play-along since the Watchtower retired it) and a full chord with an open shape uses it. */
function choosePositions(chords, fixed, allowOpen) {
  const opts = chords.map(n => {
    if (fixed[n]) { if (!allowOpen && Number(String(fixed[n]).slice(1)) + 2 > 10) die(`powerShapes "${n}": ${fixed[n]} goes above fret 10 (the classical guitars cannot reach it)`); return [fixed[n]]; }
    if (allowOpen && OPEN_SHAPES[n]) return ['open'];
    const c = parseChord(n);
    if (!c) die(`cannot place "${n}": write the plain chord (C#m, not C#m7) or give its shape in "shapes"`);
    /* A power chord never goes above fret 10 (Jonathan, 2026-11-23: the classical guitars cannot reach it): its top
       fret is the root + 2, so the root stays at fret 8 or lower. Every root has such a spot on one of the two strings. */
    const at = ['E', 'A'].map(s => s + rootFret(c, s)).filter(w => allowOpen || Number(w.slice(1)) + 2 <= 10);
    if (!at.length) die(`"${n}": no power-chord spot at fret 10 or under`);
    return at;
  });
  let best = null;
  const walk = (i, pick) => {
    if (i === chords.length) {
      const fr = pick.filter(p => p !== 'open').map(p => Number(p.slice(1)));
      const span = fr.length ? Math.max(...fr) - Math.min(...fr) : 0, low = fr.reduce((a, b) => a + b, 0);
      if (!best || span < best.span || (span === best.span && low < best.low)) best = { span, low, pick: pick.slice() };
      return;
    }
    for (const o of opts[i]) { pick.push(o); walk(i + 1, pick); pick.pop(); }
  };
  walk(0, []);
  return Object.fromEntries(chords.map((n, i) => [n, best.pick[i]]));
}
function fullShape(n, where) {
  if (where === 'open') return mk(OPEN_SHAPES[n], n);
  const c = parseChord(n);
  if (!c || c.q === '5') die(`"${n}" has no full-chord shape here; give it in "shapes"`);
  return mk(barre(c, where), n);
}
function powerShape(n, where) {
  const c = parseChord(n);
  const s = where[0], f = Number(where.slice(1));
  const up = STR[STR.indexOf(s) + 1], up2 = STR[STR.indexOf(s) + 2];
  const frets = [[up2, f + 2], [up, f + 2], [s, f]];   // high to low, as ca-51
  return mk(frets, c.root + '5');
}

/* ── the chart ── */
const loop = (S.loop || []).map(b => String(b).trim().split(/\s+/));
const loopFrom = S.loopFrom || 1;
const bpb = S.beatsPerBar;
function sectionNotes(sec) {
  const bars = [];
  for (let b = sec.fromBar; b < sec.fromBar + sec.bars; b++) {
    const src = sec.chart ? sec.chart.map(x => String(x).trim().split(/\s+/)) : loop;
    if (!src.length) die(`section ${sec.label}: no loop and no chart`);
    const i = sec.chart ? b - sec.fromBar : (((b - loopFrom) % src.length) + src.length) % src.length;
    if (i >= src.length) die(`section ${sec.label}: its chart has ${src.length} bars, the section ${sec.bars}`);
    bars.push(src[i]);
  }
  const notes = [];
  for (const bar of bars) for (const ch of bar) {
    const beats = bpb / bar.length;
    const last = notes[notes.length - 1];
    if (last && last.name === ch) last.beats += beats; else notes.push({ name: ch, beats });
  }
  return notes;
}
/* A power-only card has no switch: its caption IS the power caption, and no `_power` field is written. */
const sections = S.sections.map(s => {
  const t = { ...s, notes: sectionNotes(s) };
  if (versions === 'power' && t.caption_power) { t.caption = t.caption_power; t.caption_es = t.caption_power_es; }
  if (versions !== 'both') { delete t.caption_power; delete t.caption_power_es; }
  return t;
});
for (let i = 1; i < sections.length; i++)
  if (sections[i].fromBar !== sections[i - 1].fromBar + sections[i - 1].bars) die(`sections are not back to back at "${sections[i].label}"`);
const LABEL_ES = { Intro: 'Intro', Chorus: 'Coro', Interlude: 'Interludio', Solo: 'Solo', Bridge: 'Puente', Ending: 'Final', Outro: 'Final', Break: 'Pausa' };
const labelEs = (l) => LABEL_ES[l] || (/^Verse( \d+)?$/.test(l) ? l.replace('Verse', 'Estrofa') : /^Chorus \d+$/.test(l) ? l.replace('Chorus', 'Coro') : /^Solo \d+$/.test(l) ? l : null);
for (const s of sections) {
  s.label_es = s.label_es || labelEs(s.label);
  for (const k of BUILT ? ['label'] : ['label_es', 'caption', 'caption_es']) if (!s[k]) die(`section "${s.label}" has no ${k}`);
  if (!!s.caption_power !== !!s.caption_power_es) die(`section "${s.label}": caption_power and caption_power_es go together`);
}
const names = [...new Set(sections.flatMap(s => s.notes.map(n => n.name)))].filter(n => !(BUILT && n === '-'));   // '-': a rest, --built only
const fullPos = versions === 'power' ? {} : choosePositions(names, S.shapes || {}, true);
const powPos = versions === 'full' ? {} : choosePositions(names, S.powerShapes || {}, false);
const FULL = Object.fromEntries(Object.entries(fullPos).map(([n, w]) => [n, fullShape(n, w)]));
const POWER = Object.fromEntries(Object.entries(powPos).map(([n, w]) => [n, powerShape(n, w)]));
const span = (m) => { const f = Object.values(m).flatMap(x => x.frets.map(y => y[1])).filter(x => x > 0); return f.length ? `frets ${Math.min(...f)}-${Math.max(...f)}` : 'open'; };

/* ── THE BUILT MODE (--built): the Import file and the stored copy, into the private song folder; see the header.
   Everything the card mode does after this point (the id, the track, the card, the pins) is skipped. ── */
if (BUILT) {
  if (PRIVATE) die('--built and --private are two different outputs: pick one');
  if (!DRY && !FROM) die('--built needs --from <upload.mp3> (or --dry-run)');
  if (FROM && !existsSync(FROM)) die(`no file at ${FROM}`);
  const meter = S.countSix ? (bpb === 2 ? '6/8' : null) : bpb === 4 ? '4/4' : bpb === 3 ? '3/4' : null;
  if (!meter) die(`beatsPerBar ${bpb}${S.countSix ? ' with countSix' : ''} is not 4/4, 3/4 or 6/8 (6/8: beatsPerBar 2 and countSix)`);
  const bid = S.builtId || 'sb-' + String(S.slug).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 24);
  if (!/^sb-[a-z0-9]{8,24}$/.test(bid)) die(`the built id "${bid}" is not 'sb-' and 8 to 24 lower-case letters or digits: give "builtId" in the spec`);
  const felt = Number(Function(`"use strict";return (${typeof S.feltBpm === 'string' ? S.feltBpm : String(S.feltBpm)});`)());
  if (!(felt > 0)) die('feltBpm is not a positive number');
  /* the bars, one string each */
  const off = sections[0].fromBar - 1, nBars = sections.reduce((a, s) => a + s.bars, 0);
  const barsOf = (sec) => {
    const src = sec.chart ? sec.chart.map(x => String(x).trim().split(/\s+/)) : loop;
    if (!src.length) die(`section ${sec.label}: no loop and no chart`);
    const out = [];
    for (let b = sec.fromBar; b < sec.fromBar + sec.bars; b++) {
      const i = sec.chart ? b - sec.fromBar : (((b - loopFrom) % src.length) + src.length) % src.length;
      if (i >= src.length) die(`section ${sec.label}: its chart has ${src.length} bars, the section ${sec.bars}`);
      out.push(src[i]);
    }
    return out;
  };
  const beatsTxt = (b) => Number.isInteger(b * 2) ? String(b) : `${Math.round(b * 3)}/3`;
  const bars = sections.flatMap(s => barsOf(s)).map(bar => bar.length === 1 ? bar[0] : bar.map(n => `${n}:${beatsTxt(bpb / bar.length)}`).join(' '));
  /* the chords: the card mode's shapes, as flat six-string arrays */
  const six = (fr) => STR.map(s => { const h = fr.find(([x]) => x === s); return h ? h[1] : null; });
  const chords = Object.fromEntries(names.map(n => [n, { full: FULL[n] ? { frets: six(FULL[n].frets) } : null, power: POWER[n] ? { frets: six(POWER[n].frets) } : null }]));
  /* the sections */
  const SEC = { intro: 'intro', verse: 'verse', prechorus: 'prechorus', 'pre-chorus': 'prechorus', chorus: 'chorus', refrain: 'refrain', bridge: 'bridge',
    interlude: 'interlude', solo: 'solo', riff: 'riff', requinto: 'requinto', outro: 'outro', ending: 'ending' };
  const secs = sections.map(s => {
    let name = s.name, n = s.n;
    if (!name) {
      const m = /^([A-Za-z-]+)(?: (\d))?$/.exec(String(s.label).trim());
      name = m && SEC[m[1].toLowerCase()];
      if (!name) die(`section "${s.label}": not a built section name (${Object.keys(SEC).join(', ')}); give it "name" (and "n")`);
      if (m[2]) n = Number(m[2]);
    }
    return Object.assign({ name }, n ? { n } : {}, { from: s.fromBar - off, bars: s.bars }, s.lyrics ? { lyrics: s.lyrics } : {});
  });
  /* the grid: bar numbers start again at the first section */
  const r3 = (x) => Math.round(x * 1000) / 1000;
  let anchor = r3(Number(S.anchor) + off * bpb * 60 / felt), barTimes;
  if (S.barTimes) {
    if (!Array.isArray(S.barTimes) || Math.abs(S.barTimes[0] - S.anchor) > 0.001) die('barTimes[0] is not the anchor (barTimes are the song bars from bar 1)');
    barTimes = S.barTimes.slice(off, off + nBars + 1).map(r3);
    anchor = barTimes[0];
  }
  const song = Object.assign({ meter, bpm: Math.round(felt * 10000) / 10000, anchor }, barTimes ? { barTimes } : {}, { chords, bars, sections: secs,
    level: versions === 'both' ? { versions, start: chordStart } : { versions } }, S.range ? { range: S.range } : {}, S.capo !== undefined ? { capo: S.capo } : {});
  const file = { id: bid, v: 1, title: S.song, artist: S.artist, audio: null, song };

  const dir = songFilesDir();
  for (const r of new Set([ROOT, HERE])) { const rel = relative(r, dir); if (!rel || (!rel.startsWith('..') && !isAbsolute(rel))) die(`the private song folder ${dir} is inside the checkout ${r}: set GC_SONG_FILES_DIR to a folder outside it`); }
  const jsonPath = join(dir, bid + '.json');
  const ffDur = (p) => { const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', p], { encoding: 'utf8' }); return r.status === 0 ? Number(r.stdout.trim()) : NaN; };
  const B = (await import('./built-song-check.mjs')).loadBuiltSongs(ROOT);
  const srcDur = FROM ? ffDur(FROM) : Number(S.durationSec) || 0;
  /* the chart, checked now with a stand-in audio entry, so a chart the site would refuse costs no encode */
  const stand = { id: bid + '-0000000000', bytes: 1, sha256: '0'.repeat(64), durationSec: srcDur > 0 ? Math.round(srcDur * 1000) / 1000 : 1800, centsOff: 0 };
  const why0 = B.check(bid, { v: 1, title: S.song, artist: S.artist, audio: stand, song });
  console.log(`new-playalong --built: ${bid} "${S.song}" - ${S.artist}: ${meter} at ${song.bpm}, ${bars.length} bars${off ? ` (song bars ${off + 1}-${off + nBars}, renumbered from 1)` : ''}, ${secs.length} sections, ${names.length} chords, level ${versions}${barTimes ? ', a beat map' : ''}`);
  console.log(`  full chords: ${versions === 'power' ? '-' : Object.entries(fullPos).map(([n, w]) => `${n} ${w}`).join(', ')}`);
  console.log(`  power chords: ${versions === 'full' ? '-' : Object.entries(powPos).map(([n, w]) => `${POWER[n].note} ${w}`).join(', ')}`);
  if (why0.length) { console.log(`  the chart is refused by builtSongCheck (app/builtsongs.js), ${why0.length} reason${why0.length === 1 ? '' : 's'}:`); why0.forEach(w => console.log('    - ' + w)); die('nothing written'); }
  console.log('  the chart passes builtSongCheck' + (FROM ? ` against the upload's ${srcDur.toFixed(2)} s` : ''));

  /* The audio: Python, so the meter, the limiter, the gain iteration, the ceiling search and the checks are
     tools/loudness.py's own (imported, with its encode swapped for the 192k one) and the tuning is
     tools/playalong-measure.py's TUNING. Prints one JSON line on stdout; progress on stderr. */
  const PY = String.raw`
import json, os, sys, importlib.util
from pathlib import Path
TOOLS, A = sys.argv[1], json.loads(sys.argv[2])
sys.path.insert(0, TOOLS)
import loudness as L

def done(**kw):
    print(json.dumps(kw))
    sys.exit(0 if kw.get('ok') else 1)

shift = float(A.get('cents') or 0)
PITCH = 'rubberband=pitch=%.6f:formant=preserved' % (2 ** (-shift / 1200))   # the card mode's shift
RATES = (32000, 44100, 48000)   # MPEG-1 Layer III, where 192k exists

def cmd(src, dst, gain, limit, sr, ch):
    return ['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-i', src, '-map', '0:a:0',
            '-map_metadata', '-1', '-id3v2_version', '0', '-write_id3v1', '0',
            '-af', gain + ',' + limit, '-c:a', 'libmp3lame', '-b:a', '192k',
            '-ar', sr, '-ac', ch, dst]

def shift_cmd(src, dst, sr, ch):
    return ['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-i', src, '-map', '0:a:0', '-af', PITCH,
            '-c:a', 'pcm_f32le', '-ar', sr, '-ac', ch, dst]

def hp_decode(path, seconds):
    # the shift's timing: loudness.py's alignment on the part above 2 kHz (clicks, picks, cymbals). A pitch
    # shift moves every tone, so on held notes the full-band correlation peaks a period or two off (measured
    # -17 ms on made-up tones that the high-passed one reads at +0.2, 2026-11-14).
    import numpy as np, subprocess
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-t', str(seconds), '-af',
                        'highpass=f=2000:poles=2,highpass=f=2000:poles=2', '-f', 'f32le', '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)

def probe(p):
    j = json.loads(L.run(['ffprobe', '-v', 'error', '-select_streams', 'a:0', '-show_entries',
                          'stream=sample_rate,channels,bit_rate:format=duration', '-of', 'json', str(p)]).stdout)
    st = j['streams'][0]
    return int(st['sample_rate']), int(st['channels']), float(j['format']['duration']), st

try:
    if A.get('plan'):
        sr, ch = '<the source rate>', '<the source channels>'
        if A.get('src'):
            sr, ch = (str(x) for x in probe(A['src'])[:2])
        lv = A.get('src') or '<upload.mp3>'
        sh = shift_cmd(lv, '<shifted>.wav', sr, ch) if shift else None
        done(ok=True, shift=sh, cmd=cmd('<shifted>.wav' if shift else lv, '<staged copy>.mp3', 'volume=<gain>dB',
                                        L.LIMITER.replace('{limit:.6f}', '<ceiling>'), sr, ch))
    _s = importlib.util.spec_from_file_location('playalong_measure', os.path.join(TOOLS, 'playalong-measure.py'))
    PM = importlib.util.module_from_spec(_s)
    _s.loader.exec_module(PM)
    src, out = Path(A['src']), Path(A['out'])
    sr, ch, dur_src, _ = probe(src)
    if sr not in RATES:
        done(ok=False, why='the upload is %d Hz: a 192k mp3 exists at 32000, 44100 and 48000 Hz only, and the copy keeps the source rate (no resample)' % sr)
    c_src, n_src = PM.tuning_cents(PM.BA.decode(str(src)))
    if c_src is None:
        done(ok=False, why='the tuning could not be read (playalong-measure.py TUNING)')
    if abs(c_src - shift) > 10:
        done(ok=False, centsSrc=c_src, why='the record is %+.1f cents from A = 440%s: more than 10 cents off is not published. Put "cents": %.1f in the spec (the shift, as the card mode does)' % (c_src, ' (%+.1f after the spec\'s %+g shift)' % (c_src - shift, shift) if shift else '', c_src))
    params = {'sr': sr, 'channels': ch}
    lv, slag = src, None          # what is levelled: the upload, or (with a shift) the shifted copy
    if shift:
        lv = out.with_name('shifted.wav')
        L.run(shift_cmd(str(src), str(lv), str(sr), str(ch)))
        keep = L.decode_mono
        L.decode_mono = hp_decode
        try:
            slag = L.alignment(src, lv, sr)[0]
        finally:
            L.decode_mono = keep
        if abs(slag) >= L.LAG_PASS_MS:
            done(ok=False, why='the %+g-cent shift moved the audio %+.1f ms (high-passed, first 40 s)' % (shift, slag))
    target = L.loudness_only(L.reference_file())
    before = L.measure(lv)

    def encode(src_, dst, gain_db, ceiling_db, params_, vbr_q=None):
        L.run(cmd(str(src_), str(dst), 'volume=%.3fdB' % gain_db, L.LIMITER.format(limit=10 ** (ceiling_db / 20)),
                  str(params_['sr']), str(params_['channels'])))
    L.encode = encode                       # encode_verified's ceiling search, on the 192k encode

    gain = first = target - before['I']
    for _ in range(8):                      # loudness.py's iteration: ONE gain, until the copy lands on the target
        used = gain
        after, ceil = L.encode_verified(lv, out, gain, params, None)
        miss = target - after['I']
        print('  at %+.2f dB: %.2f LUFS, ceiling %.2f' % (gain, after['I'], ceil), file=sys.stderr, flush=True)
        if abs(miss) <= L.LEVEL_AIM:
            break
        gain += miss
    lag, fit, resid = L.alignment(lv, out, sr)   # loudness.py's check: the copy against what was levelled
    sr_o, ch_o, dur_out, st_o = probe(out)
    mp = L.mp3_params(out)
    c_out, n_out = PM.tuning_cents(PM.BA.decode(str(out)))
    why = []
    d = after['I'] - target
    if abs(d) > L.LEVEL_PASS:
        why.append('%+.2f LU from the cure (more than %.1f)' % (d, L.LEVEL_PASS))
    if after['sp'] > L.PEAK_MAX or after['tp'] > L.PEAK_MAX:
        why.append('peak %.2f dBFS (sample %.2f, true %.2f; over %.0f)' % (max(after['sp'], after['tp']), after['sp'], after['tp'], L.PEAK_MAX))
    if abs(after['len'] - before['len']) > L.LENGTH_PASS or abs(dur_out - dur_src) > L.LENGTH_PASS:
        why.append('length %+.3f s decoded, %+.3f s ffprobe' % (after['len'] - before['len'], dur_out - dur_src))
    if abs(lag) >= L.LAG_PASS_MS:
        why.append('lag %+.1f ms' % lag)
    if not mp['cbr'] or mp['kbps'] != 192 or str(st_o.get('bit_rate')) != '192000':
        why.append('not 192k constant bitrate (frames: %s, ffprobe stream bit_rate %s)' % ('CBR %sk' % mp['kbps'] if mp['cbr'] else 'VBR avg %.0fk' % mp['avg_kbps'], st_o.get('bit_rate')))
    if mp['sr'] != sr or sr_o != sr or mp['channels'] != ch or ch_o != ch:
        why.append('rate or channels changed: %d Hz %d ch -> %d Hz %d ch' % (sr, ch, sr_o, ch_o))
    if c_out is None or abs(c_out) > 10:
        why.append('the copy reads %s cents from A = 440 (more than 10)' % ('no' if c_out is None else '%+.1f' % c_out))
    done(ok=not why, why='; '.join(why), target=target, beforeI=before['I'], afterI=after['I'], sp=after['sp'], tp=after['tp'],
         ceiling=ceil, gainDb=used, firstGain=first, lagMs=lag, lenDiff=after['len'] - before['len'], durSrc=dur_src,
         durOut=dur_out, centsSrc=c_src, centsOut=c_out, shift=shift, shiftLagMs=slag, sr=sr_o, channels=ch_o,
         frames='CBR %sk' % mp['kbps'] if mp['cbr'] else 'VBR', bitRate=st_o.get('bit_rate'))
except RuntimeError as e:
    done(ok=False, why=str(e))
`;
  const py = (a) => {
    const r = spawnSync('python3', ['-c', PY, join(ROOT, 'tools'), JSON.stringify(a)], { cwd: ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'], maxBuffer: 1 << 24 });
    const line = (r.stdout || '').trim().split('\n').pop();
    try { return JSON.parse(line); } catch { console.error(`new-playalong: python3 exit ${r.status}: ${(r.stdout || '').slice(-400)}`); return null; }
  };
  /* The Import file as text: JSON, two-space indent, a shape's six frets on one line. */
  const pretty = (v, ind = '') => {
    if (Array.isArray(v)) {
      if (v.every(x => x === null || typeof x === 'number')) return '[' + v.map(x => JSON.stringify(x)).join(', ') + ']';
      return v.length ? '[\n' + v.map(x => ind + '  ' + pretty(x, ind + '  ')).join(',\n') + '\n' + ind + ']' : '[]';
    }
    if (v && typeof v === 'object') {
      const k = Object.keys(v);
      return k.length ? '{\n' + k.map(x => ind + '  ' + JSON.stringify(x) + ': ' + pretty(v[x], ind + '  ')).join(',\n') + '\n' + ind + '}' : '{}';
    }
    return JSON.stringify(v);
  };
  const fmtCmd = (c) => c.map(x => /[\s<>]/.test(x) ? JSON.stringify(x) : x).join(' ');
  if (DRY) {
    const plan = py({ plan: true, src: FROM, cents: S.cents || 0 });
    if (!plan) die('the audio plan did not print');
    console.log('\n── the Import file, ' + jsonPath + ' (audio is filled in from the stored copy) ──\n' + pretty(file));
    if (plan.shift) console.log(`\n── the shift ("cents": ${S.cents}), to a lossless copy; its timing checked against the upload (high-passed, under 10 ms) ──\n$ ` + fmtCmd(plan.shift));
    console.log('\n── the stored copy: ONE gain to the cure (tools/loudness.py; iterated until within 0.1 LU) and the -1 dBFS ceiling, lowered until both decoded peaks pass ──\n$ ' + fmtCmd(plan.cmd));
    console.log(`\nthen: the checks (the cure ±0.3 LU, peaks ≤ -1 dBFS, length ±0.05 s, lag < 10 ms, 192k CBR, rate kept, |cents| ≤ 10), ${dir}/${bid}-<sha10>.mp3, ${jsonPath}, node tools/built-song-check.mjs --audio`);
    console.log('(dry run: nothing written)');
    process.exit(0);
  }
  if (existsSync(jsonPath)) die(`${jsonPath} is already there: move it away first (nothing written)`);
  const stageDir = join(dir, `.built-${bid}-${process.pid}`);
  mkdirSync(stageDir, { recursive: true });
  let res;
  const fail = (m) => { rmSync(stageDir, { recursive: true, force: true }); die(m); };
  try {
    const stage = join(stageDir, 'stage.mp3');
    const srcBytes = readFileSync(FROM);
    const sourceSha256 = createHash('sha256').update(srcBytes).digest('hex');
    console.log(`  source ${FROM}: ${srcBytes.length.toLocaleString('en-US')} bytes, SHA-256 ${sourceSha256.slice(0, 12)}…; levelling (a minute or two)…`);
    res = py({ src: resolve(FROM), out: stage, cents: S.cents || 0 });
    if (!res) fail('the audio step did not finish (its output is above)');
    if (!res.ok) fail(`the stored copy fails, nothing written: ${res.why}`);
    const bytes = readFileSync(stage), sha256 = createHash('sha256').update(bytes).digest('hex');
    const audioId = `${bid}-${sha256.slice(0, 10)}`, mp3Path = join(dir, audioId + '.mp3');
    file.audio = { id: audioId, bytes: bytes.length, sha256, durationSec: Math.round(res.durOut * 1000) / 1000,
      centsOff: Math.round(res.centsOut * 10) / 10, gainDb: Math.round(res.gainDb * 100) / 100, sourceSha256 };
    const why1 = B.check(bid, { v: 1, title: file.title, artist: file.artist, audio: file.audio, song });
    if (why1.length) fail(`the finished song is refused by builtSongCheck, nothing written: ${why1.join('; ')}`);
    renameSync(stage, mp3Path);
    writeFileSync(jsonPath, pretty(file) + '\n');
    console.log(`  the cure ${res.target.toFixed(2)} LUFS; the source ${res.beforeI.toFixed(2)} → the copy ${res.afterI.toFixed(2)} LUFS at ${res.gainDb >= 0 ? '+' : ''}${res.gainDb.toFixed(2)} dB (first estimate ${res.firstGain >= 0 ? '+' : ''}${res.firstGain.toFixed(2)}), ceiling ${res.ceiling.toFixed(2)} dBFS${res.ceiling < -1 ? ' (lowered: the encode overshot -1)' : ''}`);
    console.log(`  peaks: sample ${res.sp.toFixed(2)}, true ${res.tp.toFixed(2)} dBFS; length ${res.lenDiff >= 0 ? '+' : ''}${res.lenDiff.toFixed(3)} s; lag ${res.lagMs >= 0 ? '+' : ''}${res.lagMs.toFixed(2)} ms; ${res.frames}, ffprobe ${res.bitRate}, ${res.sr} Hz, ${res.channels} ch; tuning ${res.centsSrc >= 0 ? '+' : ''}${res.centsSrc.toFixed(1)} cents → copy ${file.audio.centsOff >= 0 ? '+' : ''}${file.audio.centsOff.toFixed(1)}${res.shift ? ` (shifted ${res.shift} cents; the shift moved it ${res.shiftLagMs >= 0 ? '+' : ''}${res.shiftLagMs.toFixed(2)} ms)` : ''}`);
    console.log(`  wrote ${mp3Path}\n  wrote ${jsonPath}`);
    const chk = spawnSync(process.execPath, [join(HERE, 'tools', 'built-song-check.mjs'), jsonPath, '--audio', mp3Path, '--root', ROOT], { encoding: 'utf8' });
    process.stdout.write(chk.stdout || ''); process.stderr.write(chk.stderr || '');
    console.log('next (Jonathan): console → Manage → Built songs → pick both files → Import; then open it as a student');
    process.exitCode = chk.status === null ? 2 : chk.status;
  } finally {
    rmSync(stageDir, { recursive: true, force: true });
  }
  process.exit(process.exitCode);
}

/* ── the id ── */
const ca = rd('class-activities.js');
const said = [...ca.matchAll(/the next new activity is `ca-(\d+)`/g)].map(m => Number(m[1]));
const cards = [...ca.matchAll(/\bid:\s*'ca-(\d+)'/g)].map(m => Number(m[1]));
if (!said.length) die('class-activities.js has no "the next new activity is `ca-N`" line (the RETIRED IDS note)');
const next = said[said.length - 1];   // the note's LAST statement: an older one ("ca-43") is still in the text
if (cards.some(n => n >= next)) die(`the RETIRED IDS note says ca-${next} is next, but ca-${Math.max(...cards)} is a card: fix the note first`);
const id = S.id || `ca-${next}`;
if (new RegExp(`id:\\s*'${id}'`).test(ca)) die(`${id} is already a card`);
const snip = rd('app/snippets.js');
if (new RegExp(`^  '${S.slug}': \\{`, 'm').test(snip)) die(`'${S.slug}' is already in SNIPPET_TRACKS`);

/* ── text ── */
const NUM_EN = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen'];
const NUM_ES = ['cero', 'un', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve', 'diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis'];
const list = (xs, and) => xs.length < 2 ? xs.join('') : xs.slice(0, -1).join(', ') + ` ${and} ` + xs[xs.length - 1];
const loopNames = [...new Set(loop.flat())];
const powName = (n) => POWER[n] ? POWER[n].note : n;
const L = loop.length;
const defIntro = (xs, es) => es
  ? `Toca ${S.song} con la banda: ${list(xs, 'y')} en la misma vuelta de ${NUM_ES[L] || L} compases de principio a fin.`
  : `Play ${S.song} with the band: ${list(xs, 'and')} in the same ${NUM_EN[L] || L}-bar loop all the way through.`;
const baseNames = versions === 'power' ? loopNames.map(powName) : loopNames;
const intro = S.intro || (L ? defIntro(baseNames, false) : null);
const intro_es = S.intro_es || (L ? defIntro(baseNames, true) : null);
if (!intro || !intro_es) die('no loop to write the intro from: give intro and intro_es');
const withPower = versions === 'both';
const intro_power = S.intro_power || (withPower && L ? defIntro(loopNames.map(powName), false) : null);
const intro_power_es = S.intro_power_es || (withPower && L ? defIntro(loopNames.map(powName), true) : null);
const q = (s) => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const wrap = (text, ind, w = 112) => {   // a comment: '  /* ...' then continuation lines under its text, as the file does
  const out = []; let line = '';
  const pre = () => out.length ? ind + '   ' : ind;
  for (const word of String(text).trim().split(/\s+/)) {
    if ((pre() + line + ' ' + word).length > w && line) { out.push(pre() + line); line = word; } else line = line ? line + ' ' + word : word;
  }
  if (line) out.push(pre() + line);
  return out.join('\n');
};
const fretsJs = (fr) => '[' + fr.map(([s, f]) => `[${q(s)}, ${f}]`).join(', ') + ']';
const noteJs = (shape, beats) => `{ frets: ${fretsJs(shape.frets)}, note: ${q(shape.note)}, midi: [${shape.midi.join(', ')}], beats: ${+beats.toFixed(6)} }`;
const baseShape = (n) => versions === 'power' ? POWER[n] : FULL[n];

/* A file's name; the path SNIPPET_TRACKS gives it; where its bytes go on this machine. A private one (--private) is
   'private:<slug>-<bpm>' on the SONG_FILES list, its bytes in the private song folder. */
const nameOf = (bpm) => `${S.fileSlug}-backing-${S.key}-${bpm}bpm-440hz-full.mp3`;
const idOf = (bpm) => `${S.slug}-${bpm}`;
const fileOf = (bpm) => PRIVATE ? `private:${idOf(bpm)}` : `audio/${nameOf(bpm)}`;
const diskOf = (bpm) => PRIVATE ? join(songFilesDir(), nameOf(bpm)) : join(ROOT, 'audio', nameOf(bpm));
if (PRIVATE) {
  for (const b of [S.bpm, S.slowBpm]) if (!SONG_ID_RE.test(idOf(b))) die(`the private id "${idOf(b)}" is not ${SONG_ID_RE}: pick a slug of lower-case letters, digits and dashes`);
  let L;
  try { L = readSongFiles(ROOT); } catch (e) { die(e.message); }
  for (const b of [S.bpm, S.slowBpm]) if (L[idOf(b)] && L[idOf(b)].file !== nameOf(b)) die(`"${idOf(b)}" is already on the SONG_FILES list for ${L[idOf(b)].file}`);
  for (const b of [S.bpm, S.slowBpm]) if (existsSync(join(ROOT, 'audio', nameOf(b)))) die(`audio/${nameOf(b)} is in the public folder: a private song must not be public too`);
}
const feltJs = typeof S.feltBpm === 'string' ? S.feltBpm : String(S.feltBpm);
const feltNum = Number(Function(`"use strict";return (${feltJs});`)());
if (!(feltNum > 0)) die('feltBpm is not a positive number');
const trackJs = [
  wrap(`/* ${S.song} — ${S.artist} (Jonathan uploaded the record, ${date}). The RECORD itself: no rhythm-down mix, so \`src\` IS the full mix and there is no Guitar toggle.${PRIVATE ? ' Behind the sign-in: both files are private (SONG FILES, app/songfiles.js).' : ''} ${S.trackComment || ''} */`, '  '),
  `  '${S.slug}': {`,
  `    src:     ${q(fileOf(S.bpm))},`,
  `    srcSlow: ${q(fileOf(S.slowBpm))},`,
  `    trackBpm: ${S.bpm}, trackBpmSlow: ${S.slowBpm},`,
  `    feltBpm: ${feltJs},`,
  `    beatsPerBar: ${bpb},`,
  ...(S.countSix ? ['    countSix: true,                     // chord grid counts the bar 1-6 — see COUNT IN SIX'] : []),
  `    durationSec: ${S.durationSec},`,
  `    anchor: ${Number(S.anchor).toFixed(3)},`,
  `    anchorVerified: true,`,
  `    defaultSlow: true,`,
  `  },`,
].join('\n');

const secJs = sections.map(s => [
  '        {',
  `          label: ${q(s.label)}, label_es: ${q(s.label_es)},`,
  `          caption: ${q(s.caption)}, caption_es: ${q(s.caption_es)},`,
  ...(s.caption_power ? [`          caption_power: ${q(s.caption_power)}, caption_power_es: ${q(s.caption_power_es)},`] : []),
  `          fromBar: ${s.fromBar}, bars: ${s.bars},`,
  '          notes: [',
  s.notes.map(n => '            ' + noteJs(baseShape(n.name), n.beats)).join(',\n'),
  '          ]',
  '        }',
].join('\n')).join(',\n');
const powerMap = withPower ? [
  `    chordStart: ${q(chordStart)},   // opens on ${chordStart === 'power' ? 'Power' : 'Full'} chords until the student picks — see CHORD VERSIONS above`,
  '    chordVersions: {',
  '      power: {',
  ...names.map(n => `        ${q(n)}: { frets: ${fretsJs(POWER[n].frets)}, note: ${q(POWER[n].note)}, midi: [${POWER[n].midi.join(', ')}] },`),
  '      },',
  '    },',
] : [];
const cardJs = [
  wrap(`/* "${S.song}" — Play Along (Jonathan, ${date}). A practice card on the RECORD (track '${S.slug}' in app/snippets.js — its comment has how the grid was found), bars ${sections[0].fromBar}-${sections[sections.length - 1].fromBar + sections[sections.length - 1].bars - 1}, the whole song, and it loops (no Song Journey page, so not \`wholeSong\`). No lyrics: the song is not public domain. ${S.cardComment || ''} Full chords: ${versions === 'power' ? 'none' : span(FULL)}; power chords: ${versions === 'full' ? 'none' : span(POWER)}. */`, '  '),
  '  {',
  `    id:    '${id}',`,
  `    view:  'card',    // one screen: Play song + tab + checks — see CARD above`,
  ...(library ? [`    library: true,    // on the Songs page's More Play Along songs list for everyone — see LIBRARY above`] : []),
  `    added: '${date}',    // the Songs page's "Date added" — see LIBRARY above`,
  `    optional: true,   // Optional until switched to Required on the board — see OPTIONAL above`,
  ...powerMap,
  `    title:    ${q(`"${S.song}" - ${S.artist} — Play Along`)},`,
  `    title_es: ${q(`"${S.song}" - ${S.artist} — Toca con la canción`)},`,
  `    intro:    ${q(intro)},`,
  `    intro_es: ${q(intro_es)},`,
  ...(intro_power ? [`    intro_power:    ${q(intro_power)},`, `    intro_power_es: ${q(intro_power_es)},`] : []),
  '    card: {',
  `      track: ${q(S.slug)},`,
  `      chordGrid: true,  // chord grid: each chord once, cursor on the beats only (2026-10-26) — see CARD above`,
  `      slowest: true,    // Slowest / Slower / Slow / Normal`,
  `      caption:    'The song in order',`,
  `      caption_es: 'La canción en orden',`,
  '      sections: [',
  secJs,
  '      ],',
  '      checks: [',
  `        { label: ${q(`${sections[0].label} and ${sections[1] ? sections[1].label.toLowerCase() : 'the next part'}, slower`)}, label_es: ${q(`${sections[0].label_es} y ${sections[1] ? sections[1].label_es.toLowerCase() : 'lo que sigue'}, más lentas`)},`,
  `          text:    ${q(`Play the ${sections[0].label.toLowerCase()} and ${sections[1] ? sections[1].label.toLowerCase() : 'what follows'} with the band without stopping.`)},`,
  `          text_es: ${q(`Toca la ${sections[0].label_es.toLowerCase()} y la ${sections[1] ? sections[1].label_es.toLowerCase() : 'parte que sigue'} con la banda, sin detenerte.`)} },`,
  `        { label: 'The whole song, slower', label_es: 'La canción completa, más lenta',`,
  `          text:    'Play with the band from the intro to the last chord without stopping.',`,
  `          text_es: 'Toca con la banda desde la intro hasta el último acorde, sin detenerte.' },`,
  `        { levelUp: true,`,
  `          text:    'Slide the speed to Normal and play the whole song with the band.',`,
  `          text_es: 'Desliza la velocidad a «Normal» y toca la canción completa con la banda.' }`,
  '      ]',
  '    },',
  `    // No help ladder: a practice card is its checks and nothing else (Jonathan, 2026-10-07).`,
  '    steps: [],',
  '  },',
].join('\n');

const meterName = S.countSix ? '6/8' : `${bpb}/4`;
const clockPin = createHash('sha1').update(JSON.stringify([Number(Number(S.anchor).toFixed(3)), null, S.bpm, S.slowBpm, feltNum, bpb, !!S.countSix])).digest('hex').slice(0, 12);
const pw = withPower ? list(loopNames.map(powName), 'and') : '';
const changelog = [
  `## ${date} — A new Play Along song: "${S.song}"`,
  '',
  `- **"${S.song}" by ${S.artist} is ${library ? 'on the Songs page under "More Play Along songs."' : 'a new class activity.'}** You play along with the real recording for the whole song, from the intro to the last chord.${L ? ` It uses ${NUM_EN[loopNames.length]} chords in one ${NUM_EN[L] || L}-bar loop: ${list(loopNames, 'and')}.` : ''}`,
  ...(withPower ? [`- **Pick Power chords or Full chords at the top of the card.** It opens on ${chordStart === 'power' ? 'Power' : 'Full'} chords (${pw}, ${span(POWER)}). The chords and the beat counts are the same either way.`] : []),
  `- It has the same speed slider, Metronome and "Tap a section to start the song there" as the other Play Along songs. There are no lyrics on the card.`,
  '',
].join('\n');

/* ── apply ── */
const edits = [];
function edit(file, fn, what) { const before = rd(file); const after = fn(before); if (after === before) die(`${file}: could not place ${what}`); edits.push({ file, after, what }); }
edit('app/snippets.js', (s) => {
  const i = s.indexOf('const SNIPPET_TRACKS = {'); const j = s.indexOf('\n};', i);
  return i < 0 || j < 0 ? s : s.slice(0, j) + '\n' + trackJs + s.slice(j);
}, 'the track');
edit('class-activities.js', (s) => {
  const i = s.indexOf('window.CLASS_ACTIVITIES = ['); const j = s.indexOf('\n];', i);
  let t = i < 0 || j < 0 ? s : s.slice(0, j) + '\n' + cardJs + s.slice(j);
  const k = t.lastIndexOf('the next new activity is `');
  if (k >= 0) {
    const m = /the next new activity is `ca-(\d+)`\./.exec(t.slice(k));
    if (m) t = t.slice(0, k) + `\`${id}\` is the "${S.song}" play-along card (${date});\n   the next new activity is \`ca-${Number(id.slice(3)) + 1}\`.` + t.slice(k + m[0].length);
  }
  return t;
}, 'the card');
/* The pins a new card moves in checks.mjs, by exactly what this card adds (each check still counts the real page:
   a string the page stops reading, or a card that stops rendering, still turns it red). */
const dirStrings = 2 * ((intro ? 1 : 0) + (intro_power ? 1 : 0) + 3);   // 1cs reads intro, intro_power and the 3 checks' text, EN + ES
edit('tools/checks.mjs', (s) => s
  .replace(/(const CHORD_GRID_CARDS = \[[^\]]*?)(\];)/, (m, a, b) => `${a}, '${id}'${b}`)
  .replace(/const NO_CHECKLIST_CARDS = (\d+), NO_CHECKLIST_EXTRA = (\d+);/, (m, c, e) => library
    ? `const NO_CHECKLIST_CARDS = ${c}, NO_CHECKLIST_EXTRA = ${Number(e) + 2};`
    : `const NO_CHECKLIST_CARDS = ${Number(c) + 2}, NO_CHECKLIST_EXTRA = ${e};`)
  .replace(/const ONE_LINE_2A = (\d+),/, (m, n) => `const ONE_LINE_2A = ${Number(n) + dirStrings},`)
  , 'CHORD_GRID_CARDS, 1ct and 1cs pins');   // 1dz's SONG_FILES_PIN moves in addSongFile (tools/song-files.mjs), once per new entry
edit('tools/playalong-loop.mjs', (s) => s
  .replace(/(const METER = \{[\s\S]*?)(\n\};)/, (m, a, b) => `${a}\n  '${S.slug}': '${meterName}',${b}`)
  .replace(/(const CLOCK_PINS = \{[\s\S]*?)(\n\};)/, (m, a, b) => `${a}\n  '${S.slug}': '${clockPin}',   // ${date}: set from tools/playalong-measure.py, then checked with tools/beat-audit.py; not yet by ear (?snipcal=1)${b}`), 'METER and CLOCK_PINS');
edit('CHANGELOG.md', (s) => { const i = s.indexOf('\n## '); return i < 0 ? s : s.slice(0, i + 1) + changelog + '\n' + s.slice(i + 1); }, 'the changelog draft');

const audioCmds = [];
if (FROM || DRY) {
  const src = FROM || '<upload.mp3>';
  const pitch = S.cents ? `rubberband=pitch=${Math.pow(2, -S.cents / 1200).toFixed(6)}:formant=preserved` : '';
  const tempo = `rubberband=tempo=${(S.slowBpm / S.bpm).toFixed(6)}`;
  /* 192k constant bitrate, whatever the upload is (Jonathan, 2026-11-15: "any file that i upload that is not 192k should be
     converted moving forward"; 320k until then). Both files of a song at the same bitrate, so the speed stops never step between
     qualities. tools/loudness.py then levels them at the bitrate they have. */
  const enc = ['-map', '0:a:0', '-map_metadata', '-1', '-c:a', 'libmp3lame', '-b:a', '192k'];
  audioCmds.push(['ffmpeg', '-v', 'error', '-n', '-i', src, ...(pitch ? ['-af', pitch] : []), ...enc, diskOf(S.bpm)]);
  audioCmds.push(['ffmpeg', '-v', 'error', '-n', '-i', src, '-af', [pitch, tempo].filter(Boolean).join(','), ...enc, diskOf(S.slowBpm)]);
}

console.log(`new-playalong: ${id}, track '${S.slug}' (${meterName}, ${sections.length} sections, ${sections.reduce((a, s) => a + s.notes.length, 0)} chord changes)`);
console.log(`  full chords: ${versions === 'power' ? '-' : Object.entries(fullPos).map(([n, w]) => `${n} ${w}`).join(', ')}`);
console.log(`  power chords: ${versions === 'full' ? '-' : Object.entries(powPos).map(([n, w]) => `${POWER[n].note} ${w}`).join(', ')}`);
if (DRY) {
  for (const c of audioCmds) console.log('\n$ ' + c.map(x => /\s/.test(x) ? JSON.stringify(x) : x).join(' '));
  console.log('\n── app/snippets.js, last in SNIPPET_TRACKS ──\n' + trackJs);
  console.log('\n── class-activities.js, last in the array ──\n' + cardJs);
  console.log(`\n── tools/checks.mjs: '${id}' joins CHORD_GRID_CARDS, ${library ? 'NO_CHECKLIST_EXTRA' : 'NO_CHECKLIST_CARDS'} +2 (1ct, EN + ES), ONE_LINE_2A +${dirStrings} (1cs)${PRIVATE ? ', SONG_FILES_PIN +2 (1dz)' : ''}; tools/playalong-loop.mjs: METER '${S.slug}': '${meterName}', CLOCK_PINS '${S.slug}': '${clockPin}'`);
  if (PRIVATE) console.log(`\n── app/songfiles.js, the SONG_FILES list (tools/song-files.mjs --add) ──\n${[S.bpm, S.slowBpm].map(b => `  "${idOf(b)}": ${nameOf(b)}, measured from ${diskOf(b)}`).join('\n')}`);
  console.log('\n── CHANGELOG.md, on top ──\n' + changelog);
  console.log('(dry run: nothing written)');
  process.exit(0);
}
for (const c of audioCmds) {
  mkdirSync(dirname(c[c.length - 1]), { recursive: true });
  const r = spawnSync(c[0], c.slice(1), { stdio: 'inherit' });
  if (r.status !== 0) die(`ffmpeg failed: ${c.join(' ')}`);
}
for (const b of [S.bpm, S.slowBpm]) if (!existsSync(diskOf(b))) die(`${diskOf(b)} is not there (use --from <upload.mp3>)`);
if (PRIVATE) {
  for (const b of [S.bpm, S.slowBpm]) {
    let r;
    try { r = addSongFile(ROOT, diskOf(b), { id: idOf(b) }); } catch (e) { die(`the SONG_FILES list: ${e.message}`); }
    console.log(`  ${r.was ? 'updated' : 'added'} "${r.id}" on the SONG_FILES list: ${r.entry.file}, ${r.entry.bytes} bytes, ${r.entry.durationSec} s`);
  }
}
for (const e of edits) { writeFileSync(join(ROOT, e.file), e.after); console.log(`  wrote ${e.file}: ${e.what}`); }
console.log(`next: python3 tools/loudness.py ${S.fileSlug}   (the skill's step 5${PRIVATE ? '; it levels the private folder\'s files and updates their list entries' : ''})`);
