#!/usr/bin/env node
/* new-playalong.mjs — the typing part of a new Play Along song (recipe: skill new-playalong, 2026-11-13).

     node tools/new-playalong.mjs <spec.json> --dry-run                 print everything it would add, change nothing
     node tools/new-playalong.mjs <spec.json> --from <upload.mp3>        make the two mp3s in audio/, then add the rest
     node tools/new-playalong.mjs <spec.json>                            the mp3s are already in audio/: add the rest
     --root <dir>   work on another copy of the site (default: this checkout)
     --private      a song behind the sign-in (SONG FILES, 2026-11-14; app/songfiles.js): the two mp3s go to the
                    private song folder (~/Documents/guitar-class-song-files/, or GC_SONG_FILES_DIR), never audio/;
                    the track's paths are 'private:<slug>-<bpm>'; both files are put on the SONG_FILES list with
                    tools/song-files.mjs (name, size, SHA-256, length) and checks.mjs's SONG_FILES_PIN goes up by 2.
                    Then Jonathan uploads them in the console (Manage → Song files) and presses Verify before the push.

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
     date                         optional: YYYY-MM-DD for the comments and the changelog (default today)

   WHAT IT WRITES (and --dry-run prints): audio/ (with --from), app/snippets.js (the track, last in
   SNIPPET_TRACKS), class-activities.js (the card, last in the array, and the RETIRED IDS note's next id),
   tools/checks.mjs (the id in CHORD_GRID_CARDS; 1ct's card count +2 and 1cs's direction-string count +10 or +6,
   EN + ES), tools/playalong-loop.mjs (METER and CLOCK_PINS: the pin is the
   measured clock, written so the walk can run; see the skill), CHANGELOG.md (a draft entry on top: read it and
   fix the words). It never touches sw.js (node tools/checks.mjs writes the audio hashes and the cache version). */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
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
const specPath = args.find((a, i) => !a.startsWith('--') && !['--root', '--from'].includes(args[i - 1]));
const die = (m) => { console.error('new-playalong: ' + m); process.exit(2); };
if (!specPath) die('usage: node tools/new-playalong.mjs <spec.json> [--dry-run] [--from <upload.mp3>] [--root <dir>] [--private]');
const S = JSON.parse(readFileSync(specPath, 'utf8'));
for (const k of ['song', 'artist', 'slug', 'fileSlug', 'key', 'bpm', 'slowBpm', 'feltBpm', 'beatsPerBar', 'anchor', 'durationSec', 'sections'])
  if (S[k] == null) die(`the spec has no "${k}"`);
const date = S.date || new Date().toISOString().slice(0, 10);
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
    if (fixed[n]) return [fixed[n]];
    if (allowOpen && OPEN_SHAPES[n]) return ['open'];
    const c = parseChord(n);
    if (!c) die(`cannot place "${n}": write the plain chord (C#m, not C#m7) or give its shape in "shapes"`);
    return ['E', 'A'].map(s => s + rootFret(c, s));
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
  for (const k of ['label_es', 'caption', 'caption_es']) if (!s[k]) die(`section "${s.label}" has no ${k}`);
  if (!!s.caption_power !== !!s.caption_power_es) die(`section "${s.label}": caption_power and caption_power_es go together`);
}
const names = [...new Set(sections.flatMap(s => s.notes.map(n => n.name)))];
const fullPos = versions === 'power' ? {} : choosePositions(names, S.shapes || {}, true);
const powPos = versions === 'full' ? {} : choosePositions(names, S.powerShapes || {}, false);
const FULL = Object.fromEntries(Object.entries(fullPos).map(([n, w]) => [n, fullShape(n, w)]));
const POWER = Object.fromEntries(Object.entries(powPos).map(([n, w]) => [n, powerShape(n, w)]));
const span = (m) => { const f = Object.values(m).flatMap(x => x.frets.map(y => y[1])).filter(x => x > 0); return f.length ? `frets ${Math.min(...f)}-${Math.max(...f)}` : 'open'; };

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
  .replace(/const SONG_FILES_PIN = (\d+);/, (m, n) => PRIVATE ? `const SONG_FILES_PIN = ${Number(n) + 2};` : m), PRIVATE ? 'CHORD_GRID_CARDS, 1ct, 1cs and 1dz pins' : 'CHORD_GRID_CARDS, 1ct and 1cs pins');
edit('tools/playalong-loop.mjs', (s) => s
  .replace(/(const METER = \{[\s\S]*?)(\n\};)/, (m, a, b) => `${a}\n  '${S.slug}': '${meterName}',${b}`)
  .replace(/(const CLOCK_PINS = \{[\s\S]*?)(\n\};)/, (m, a, b) => `${a}\n  '${S.slug}': '${clockPin}',   // ${date}: set from tools/playalong-measure.py, then checked with tools/beat-audit.py; not yet by ear (?snipcal=1)${b}`), 'METER and CLOCK_PINS');
edit('CHANGELOG.md', (s) => { const i = s.indexOf('\n## '); return i < 0 ? s : s.slice(0, i + 1) + changelog + '\n' + s.slice(i + 1); }, 'the changelog draft');

const audioCmds = [];
if (FROM || DRY) {
  const src = FROM || '<upload.mp3>';
  const pitch = S.cents ? `rubberband=pitch=${Math.pow(2, -S.cents / 1200).toFixed(6)}:formant=preserved` : '';
  const tempo = `rubberband=tempo=${(S.slowBpm / S.bpm).toFixed(6)}`;
  const enc = ['-map', '0:a:0', '-map_metadata', '-1', '-c:a', 'libmp3lame', '-b:a', '320k'];
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
