#!/usr/bin/env node
/* Tuning Simulator proof (2026-11-06).

   tuning-sim.html keeps its round logic between /* ROUND-LOGIC-START *\/ and
   /* ROUND-LOGIC-END *\/ with no DOM in it. This pulls that text out, runs it in a
   bare vm context (no document, no window) and plays 1,000 rounds, twice: once
   on a seeded generator (the same every run) and once on Math.random. For every
   round it checks what the work order asks:

     - the detune is 12..45 cents, flat or sharp (never already green, never a new letter)
     - the tuner's letter (the note nearest the pitch) is the target string's note
     - the right answer is Up for every flat start and Down for every sharp start
     - no string comes twice in a row
     - turning the peg toward the right answer reaches the sticky green band (the
       same +-8 in / +-11 out numbers as tuner.js) from every start, and never
       starts already green

   It also checks that what the page copies is still what the site says:
     - STRINGS matches STRING_TARGETS in tuner.js (all six frequencies)
     - the tuner's status words match i18n.js, English and Spanish

     node tools/tuning-sim-proof.mjs                 prove tuning-sim.html
     node tools/tuning-sim-proof.mjs --file <path>   prove another copy (break-it runs)

   Not part of checks.mjs (it is a tool); checks.mjs 1cp pins the defaults. */
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const fi = args.indexOf('--file');
const FILE = fi >= 0 ? resolve(args[fi + 1]) : join(ROOT, 'tuning-sim.html');
const html = readFileSync(FILE, 'utf8');
const fails = [];
const must = (cond, msg) => { if (!cond) fails.push(msg); };

const m = html.match(/\/\* ROUND-LOGIC-START \*\/([\s\S]*?)\/\* ROUND-LOGIC-END \*\//);
if (!m) { console.error('tuning-sim-proof: no ROUND-LOGIC block in ' + FILE); process.exit(1); }
// The block is plain `const`s and functions; return them from one expression.
const ctx = vm.createContext({});
const L = vm.runInContext(`(function(){ ${m[1]}\n return { NOTES, STRINGS, MIN_DETUNE, MAX_DETUNE, TICK_CENTS, PEG_LIMIT, STREAK_TO_PHASE2, DONE_MS, DEFAULTS, nearestNote, centsToFreq, makeRound, rightWay, stickyInTune }; })()`, ctx);

const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

function run(name, rnd, N = 1000) {
  const c = { rounds: 0, detuneOk: 0, letterOk: 0, wayOk: 0, noRepeat: 0, greenReach: 0, notGreenAtStart: 0, flat: 0, sharp: 0 };
  const seen = new Set(); let prev = -1, minD = 999, maxD = 0;
  for (let n = 0; n < N; n++) {
    const r = L.makeRound(prev, rnd);
    c.rounds++;
    const d = Math.abs(r.cents);
    if (Number.isInteger(r.cents) && d >= L.MIN_DETUNE && d <= L.MAX_DETUNE) c.detuneOk++;
    minD = Math.min(minD, d); maxD = Math.max(maxD, d);
    if (r.letter === L.STRINGS[r.idx].note) c.letterOk++;
    if (r.cents < 0) c.flat++; else c.sharp++;
    if (r.answer === (r.cents < 0 ? 'up' : 'down')) c.wayOk++;
    if (r.idx !== prev) c.noRepeat++;
    seen.add(r.idx); prev = r.idx;
    if (!L.stickyInTune(false, r.cents)) c.notGreenAtStart++;
    // Turn toward the answer one tick at a time, the way the peg does, until the sticky band says green.
    let cents = r.cents, was = false, ticks = 0;
    while (ticks < 200) {
      const dir = r.answer === 'up' ? 1 : -1;
      cents = Math.max(-L.PEG_LIMIT, Math.min(L.PEG_LIMIT, cents + dir * L.TICK_CENTS)); ticks++;
      const shown = Math.max(-50, Math.min(50, Math.round(cents)));
      was = L.stickyInTune(was, shown);
      if (was) break;
    }
    if (was) c.greenReach++;
  }
  console.log(`${name}: ${c.rounds} rounds — detune 12..45 (saw ${minD}..${maxD}): ${c.detuneOk} of ${c.rounds}; tuner letter = target note: ${c.letterOk} of ${c.rounds}; right answer Up for flat / Down for sharp: ${c.wayOk} of ${c.rounds} (${c.flat} flat, ${c.sharp} sharp); no string twice in a row: ${c.noRepeat} of ${c.rounds}; never green at the start: ${c.notGreenAtStart} of ${c.rounds}; the peg reaches green: ${c.greenReach} of ${c.rounds}; strings seen: ${seen.size} of 6`);
  must(c.detuneOk === c.rounds, `${name}: ${c.rounds - c.detuneOk} detunes outside 12..45 cents`);
  must(c.letterOk === c.rounds, `${name}: the letter changed in ${c.rounds - c.letterOk} rounds`);
  must(c.wayOk === c.rounds, `${name}: the right answer was wrong in ${c.rounds - c.wayOk} rounds`);
  must(c.noRepeat === c.rounds, `${name}: a string came twice in a row ${c.rounds - c.noRepeat} times`);
  must(c.notGreenAtStart === c.rounds, `${name}: ${c.rounds - c.notGreenAtStart} rounds started already green`);
  must(c.greenReach === c.rounds, `${name}: the peg never reached green in ${c.rounds - c.greenReach} rounds`);
  must(c.flat > 0 && c.sharp > 0, `${name}: only one direction was ever drawn`);
  must(seen.size === 6, `${name}: only ${seen.size} of 6 strings were ever drawn`);
}
run('seeded', mulberry(20261106));
run('Math.random', Math.random);

// Pinned numbers from the work order.
must(L.MIN_DETUNE === 12 && L.MAX_DETUNE === 45, `detune range is ${L.MIN_DETUNE}..${L.MAX_DETUNE}, the work order says 12..45`);
must(L.STREAK_TO_PHASE2 === 6, `Phase 2 comes after ${L.STREAK_TO_PHASE2} in a row, the work order says 6`);
must(L.DONE_MS === 1000, `done = green for ${L.DONE_MS} ms, the work order says 1000`);
must(L.TICK_CENTS === 2, `a peg tick is ${L.TICK_CENTS} cents, the work order says about 2`);

// What the page copies from the site.
const tuner = readFileSync(join(ROOT, 'tuner.js'), 'utf8');
const tm = tuner.match(/const STRING_TARGETS = \{([^}]*)\}/);
const targets = {}; if (tm) for (const x of tm[1].matchAll(/'([A-G]\d)':\s*([\d.]+)/g)) targets[x[1]] = +x[2];
must(tm && Object.keys(targets).length === 6, 'could not read the six STRING_TARGETS from tuner.js');
let tFreq = 0;
for (const s of L.STRINGS) { if (targets[s.id] === s.freq) tFreq++; else fails.push(`STRINGS ${s.id} is ${s.freq} but tuner.js has ${targets[s.id]}`); }
const i18n = readFileSync(join(ROOT, 'i18n.js'), 'utf8');
const pair = key => { const r = i18n.match(new RegExp(`'${key.replace('.', '\\.')}':\\s*\\{\\s*en:\\s*'((?:[^'\\\\]|\\\\.)*)',\\s*es:\\s*'((?:[^'\\\\]|\\\\.)*)'`)); return r ? { en: r[1], es: r[2] } : null; };
const copies = [['tools.flat', 'flat'], ['tools.inTune', 'inTune'], ['tools.sharp', 'sharp'], ['tools.inTuneStatus', 'stInTune'], ['tools.tooHighSharp', 'stSharp'], ['tools.tooLowFlat', 'stFlat']];
let words = 0;
for (const [key, pk] of copies) {
  const p = pair(key);
  if (!p) { fails.push(`i18n.js has no ${key}`); continue; }
  for (const lang of ['en', 'es']) {
    const re = new RegExp(`\\b${pk}:'${p[lang].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'`);
    if (re.test(html)) words++; else fails.push(`the page's ${lang} ${pk} is not the site's ${key} text (${p[lang]})`);
  }
}
const low = pair('fret.stringLowE');
if (!low || !html.includes(`'${low.es}'`) || !html.includes(`'${low.en}'`)) fails.push(`the page's low E name is not the site's fret.stringLowE (${low && low.en} / ${low && low.es})`);
console.log(`copied from the site: ${tFreq} of 6 string frequencies match tuner.js STRING_TARGETS; ${words} of ${copies.length * 2} tuner words match i18n.js (EN + ES); low E / Mi grave ${low && html.includes(`'${low.es}'`) ? 'matches' : 'DIFFERS'}`);

if (fails.length) { console.error(`tuning-sim-proof: ✗ ${fails.length} problem(s):`); fails.slice(0, 20).forEach(f => console.error('  - ' + f)); process.exit(1); }
console.log('tuning-sim-proof: ✓ all proofs hold');
