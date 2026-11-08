#!/usr/bin/env node
/* Tuning Simulator proof (2026-11-06, levels added 2026-11-07).

   tuning-sim.html keeps its round logic between /* ROUND-LOGIC-START *\/ and
   /* ROUND-LOGIC-END *\/ with no DOM in it. This pulls that text out, runs it in a
   bare vm context (no document, no window) and plays 1,000 rounds on EACH of the
   four levels, twice: once on a seeded generator (the same every run) and once on
   Math.random. For every round it checks:

     - level 1: the detune is 12..45 cents, flat or sharp, and the tuner's letter is
       the string's own letter (never already green, never a new letter)
     - levels 2-4: the string starts whole notes away (1-2, 2-4, 3-5), plus or minus
       at most 20 cents; the tuner shows ANOTHER letter; the difference is never more
       than 5 notes (a 4th), and the smallest and largest of each level are both drawn
     - the right answer is Up for every flat start and Down for every sharp start,
       and the circle of notes (ringMove, up = counterclockwise) gives the same way
       and the same number of steps, for every round
     - no string comes twice in a row
     - turning the peg toward the right answer reaches the tuner showing the string's
       own letter AND the sticky green band (the same +-8 in / +-11 out numbers as
       tuner.js) from every start, and never starts already done
   and, for all 132 pairs of different notes on the circle, that a pair 1-5 steps
   apart gives the same way as the pitch (the higher note is "up"). The drawing:
   ringPt puts C at the top and each next note 30 degrees COUNTERCLOCKWISE on the
   screen (up = the way the peg turns to tighten), and for every pair the arrow
   ringArc draws turns counterclockwise for Up and clockwise for Down, through
   exactly the steps ringMove counts, round the ring's centre (the SVG arc worked out the way the SVG spec
   does, endpoint to centre). tools/smoke.mjs measures the arrow in a real browser.

   It also checks that what the page copies is still what the site says:
     - STRINGS matches STRING_TARGETS in tuner.js (all six frequencies)
     - the tuner's status words match i18n.js, English and Spanish

     node tools/tuning-sim-proof.mjs                 prove tuning-sim.html
     node tools/tuning-sim-proof.mjs --file <path>   prove another copy (break-it runs)

   Not part of checks.mjs (it is a tool); checks.mjs 1cp pins the defaults and the
   direction words, and runs ringPt / ringArc itself. */
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
const L = vm.runInContext(`(function(){ ${m[1]}\n return { NOTES, STRINGS, MIN_DETUNE, MAX_DETUNE, LEVELS, JITTER, CLEAN_TO_LEVEL_UP, TICK_CENTS, PEG_LIMIT, STREAK_TO_PHASE2, DONE_MS, DEFAULTS, nearestNote, centsToFreq, makeRound, rightWay, ringMove, stickyInTune, RC, RA, ringPt, ringArc }; })()`, ctx);

const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };

function run(name, rnd, level, N = 1000) {
  const tag = `${name} level ${level}`, LV = L.LEVELS[level - 1];
  const c = { rounds: 0, rangeOk: 0, letterOk: 0, wayOk: 0, ringOk: 0, noRepeat: 0, doneReach: 0, notDoneAtStart: 0, flat: 0, sharp: 0 };
  const seen = new Set(), notes = new Set(); let prev = -1, minK = 99, maxK = 0;
  for (let n = 0; n < N; n++) {
    const r = L.makeRound(prev, rnd, level);
    c.rounds++;
    const k = Math.round(r.cents / 100), d = Math.abs(r.cents), tl = L.STRINGS[r.idx].note;
    if (Number.isInteger(r.cents)) {
      if (!LV.max) { if (d >= L.MIN_DETUNE && d <= L.MAX_DETUNE) c.rangeOk++; }
      else if (Math.abs(k) >= LV.min && Math.abs(k) <= LV.max && Math.abs(r.cents - k * 100) <= L.JITTER) c.rangeOk++;
    }
    minK = Math.min(minK, Math.abs(k)); maxK = Math.max(maxK, Math.abs(k)); notes.add(Math.abs(k));
    if (LV.max ? r.letter !== tl : r.letter === tl) c.letterOk++;
    if (r.cents < 0) c.flat++; else c.sharp++;
    if (r.answer === (r.cents < 0 ? 'up' : 'down')) c.wayOk++;
    const mv = L.ringMove(r.letter, tl);
    if (mv.n === Math.abs(k) && r.steps === mv.n && (mv.n === 0 || mv.way === r.answer)) c.ringOk++;
    if (r.idx !== prev) c.noRepeat++;
    seen.add(r.idx); prev = r.idx;
    const startShown = L.nearestNote(L.centsToFreq(r.idx, r.cents));
    if (!(startShown.name === tl && L.stickyInTune(false, startShown.cents))) c.notDoneAtStart++;
    // Turn toward the answer one 2-cent tick at a time, the way the peg does, until the tuner shows the string's own letter and the sticky band says green.
    let cents = r.cents, was = false, ticks = 0, done = false;
    while (ticks < 500) {
      const dir = r.answer === 'up' ? 1 : -1;
      cents = Math.max(-L.PEG_LIMIT, Math.min(L.PEG_LIMIT, cents + dir * L.TICK_CENTS)); ticks++;
      const nn = L.nearestNote(L.centsToFreq(r.idx, cents)), shown = Math.max(-50, Math.min(50, nn.cents));
      was = L.stickyInTune(was, shown);
      if (was && nn.name === tl) { done = true; break; }
    }
    if (done) c.doneReach++;
  }
  console.log(`${tag}: ${c.rounds} rounds — ${LV.max ? `${LV.min}-${LV.max} notes off (saw ${minK}..${maxK}, all of ${[...notes].sort().join(',')} drawn)` : `12..45 cents`}: ${c.rangeOk} of ${c.rounds}; tuner letter ${LV.max ? 'differs from ' : '= '}the string's: ${c.letterOk} of ${c.rounds}; Up for flat / Down for sharp: ${c.wayOk} of ${c.rounds} (${c.flat} flat, ${c.sharp} sharp); circle gives the same way and steps: ${c.ringOk} of ${c.rounds}; no string twice in a row: ${c.noRepeat} of ${c.rounds}; never done at the start: ${c.notDoneAtStart} of ${c.rounds}; the peg reaches the letter in green: ${c.doneReach} of ${c.rounds}; strings seen: ${seen.size} of 6`);
  must(c.rangeOk === c.rounds, `${tag}: ${c.rounds - c.rangeOk} starts outside the level's range`);
  must(c.letterOk === c.rounds, `${tag}: the tuner letter was wrong in ${c.rounds - c.letterOk} rounds`);
  must(c.wayOk === c.rounds, `${tag}: the right answer was wrong in ${c.rounds - c.wayOk} rounds`);
  must(c.ringOk === c.rounds, `${tag}: the circle disagreed with the answer in ${c.rounds - c.ringOk} rounds`);
  must(c.noRepeat === c.rounds, `${tag}: a string came twice in a row ${c.rounds - c.noRepeat} times`);
  must(c.notDoneAtStart === c.rounds, `${tag}: ${c.rounds - c.notDoneAtStart} rounds started already done`);
  must(c.doneReach === c.rounds, `${tag}: the peg never reached the letter in green in ${c.rounds - c.doneReach} rounds`);
  must(c.flat > 0 && c.sharp > 0, `${tag}: only one direction was ever drawn`);
  must(seen.size === 6, `${tag}: only ${seen.size} of 6 strings were ever drawn`);
  if (LV.max) must(minK === LV.min && maxK === LV.max, `${tag}: drew ${minK}..${maxK} notes off, the level says ${LV.min}..${LV.max}`);
}
for (let lv = 1; lv <= 4; lv++) { run('seeded', mulberry(20261106 + lv), lv); run('Math.random', Math.random, lv); }

// The circle against the pitch itself: for every pair of different notes 1-5 steps apart either way round, "up" means the other note is higher.
let pairs = 0;
for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
  if (a === b) continue;
  const mv = L.ringMove(L.NOTES[a], L.NOTES[b]), up = (b - a + 12) % 12;                // semitones from a up to b
  if (mv.n === 0 || mv.n > 6) { fails.push(`ringMove ${L.NOTES[a]}->${L.NOTES[b]} gave ${mv.n} steps`); continue; }
  if (up >= 1 && up <= 5) { if (mv.way !== 'up' || mv.n !== up) fails.push(`ringMove ${L.NOTES[a]}->${L.NOTES[b]}: ${up} up, got ${mv.n} ${mv.way}`); else pairs++; }
  if (up >= 7 && up <= 11) { if (mv.way !== 'down' || mv.n !== 12 - up) fails.push(`ringMove ${L.NOTES[a]}->${L.NOTES[b]}: ${12 - up} down, got ${mv.n} ${mv.way}`); else pairs++; }
}
console.log(`circle of notes: ${pairs} of 120 pairs 1-5 steps apart give the right way and count (the 12 pairs 6 apart are never drawn)`);
must(pairs === 120, `only ${pairs} of 120 note pairs were right on the circle`);

/* The drawing's direction. Screen angle of a point: counterclockwise on the screen is positive (y points down in SVG). */
const scrAng = ([x, y]) => Math.atan2(L.RC - y, x - L.RC) * 180 / Math.PI;
const norm = d => ((d % 360) + 540) % 360 - 180;
let ccw = 0;
for (let i = 0; i < 12; i++) { const step = norm(scrAng(L.ringPt((i + 1) % 12, 88)) - scrAng(L.ringPt(i, 88))); if (Math.abs(step - 30) < 0.01) ccw++; else fails.push(`ringPt: ${L.NOTES[(i + 1) % 12]} sits ${step.toFixed(1)} degrees from ${L.NOTES[i]} (expected +30, counterclockwise)`); }
const top = L.ringPt(0, 88);
must(Math.abs(top[0] - L.RC) < 0.01 && top[1] < L.RC, `ringPt: C is not at the top (${top})`);
/* An SVG arc "M x1 y1 A r r 0 large sweep x2 y2", turned into a signed screen angle (counterclockwise positive), the way SVG 1.1 F.6.5 does it. */
function arcTurn(d) {
  const n = d.match(/-?[\d.]+/g).map(Number), [x1, y1, r, , , fA, fS, x2, y2] = n;
  const hx = (x1 - x2) / 2, hy = (y1 - y2) / 2, h2 = hx * hx + hy * hy;
  const k = (fA !== fS ? 1 : -1) * Math.sqrt(Math.max(0, (r * r - h2) / h2));
  const cx = k * hy + (x1 + x2) / 2, cy = -k * hx + (y1 + y2) / 2;
  let dt = Math.atan2(y2 - cy, x2 - cx) - Math.atan2(y1 - cy, x1 - cx);
  if (!fS && dt > 0) dt -= 2 * Math.PI; if (fS && dt < 0) dt += 2 * Math.PI;
  return { turn: -dt * 180 / Math.PI, cx, cy };   // SVG angles grow clockwise on the screen
}
let arcs = 0;
for (let a = 0; a < 12; a++) for (let b = 0; b < 12; b++) {
  const mv = L.ringMove(L.NOTES[a], L.NOTES[b]);
  if (mv.n < 1 || mv.n > 5) continue;
  const { turn, cx, cy } = arcTurn(L.ringArc(a, b, mv.way === 'up')), want = (mv.way === 'up' ? 1 : -1) * mv.n * 30;
  const centred = Math.hypot(cx - L.RC, cy - L.RC) < 1;   // round the ring's own centre, not bulging the other way
  if (centred && Math.abs(turn - want) < 1) arcs++; else fails.push(`ringArc ${L.NOTES[a]}->${L.NOTES[b]} (${mv.n} ${mv.way}): the arrow turns ${turn.toFixed(1)} degrees on screen round (${cx.toFixed(1)}, ${cy.toFixed(1)}), expected ${want} (+ = counterclockwise) round the ring's centre (${L.RC}, ${L.RC})`);
}
console.log(`the drawing: ${ccw} of 12 notes sit 30 degrees counterclockwise of the one before, C at the top; ${arcs} of 120 arrows turn counterclockwise for Up and clockwise for Down through the right number of steps`);
must(ccw === 12 && arcs === 120, `the circle is drawn the wrong way round (${ccw} of 12 notes, ${arcs} of 120 arrows)`);

// Pinned numbers from the work order.
must(L.MIN_DETUNE === 12 && L.MAX_DETUNE === 45, `detune range is ${L.MIN_DETUNE}..${L.MAX_DETUNE}, the work order says 12..45`);
must(L.STREAK_TO_PHASE2 === 6, `Phase 2 comes after ${L.STREAK_TO_PHASE2} in a row, the work order says 6`);
must(L.DONE_MS === 1000, `done = green for ${L.DONE_MS} ms, the work order says 1000`);
must(L.TICK_CENTS === 2, `a peg tick is ${L.TICK_CENTS} cents, the work order says about 2`);
must(L.LEVELS.map(x => x.max).join() === '0,2,4,5', `level maximums are ${L.LEVELS.map(x => x.max)}, Jonathan's call is 0,2,4,5 (a 4th at the top)`);
must(L.LEVELS.every(x => x.max <= 5), 'a level goes past 5 notes: round the circle that is a 4th the other way');
must(L.PEG_LIMIT >= 5 * 100 + L.JITTER + 50, `the peg stops at ${L.PEG_LIMIT} cents, too soon for a string 5 notes away`);
must(L.CLEAN_TO_LEVEL_UP === 3, `a level goes up after ${L.CLEAN_TO_LEVEL_UP} clean rounds, expected 3`);

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
