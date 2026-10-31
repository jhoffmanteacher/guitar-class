#!/usr/bin/env node
/* trainer-sim.mjs — simulated learners and unit checks for "Hear It First".

   Runs the REAL engine in trainer-core.js against eight scripted learners
   (A–H, work order section 8) and a set of unit checks. No browser, no
   network, no Firebase; randomness is seeded, so a run is reproducible.

     node tools/trainer-sim.mjs                 unit checks + learners A–H
     node tools/trainer-sim.mjs --all           also the worked example, the
                                                phrase samples, learner A's
                                                placement and the unlock speed
     node tools/trainer-sim.mjs --example       worked example only
     node tools/trainer-sim.mjs --unlock-speed  sessions to each unlock
     node tools/trainer-sim.mjs --only=A,G      some learners
     node tools/trainer-sim.mjs --seeds=30      seeds per learner (default 20)
     node tools/trainer-sim.mjs --quiet         print only the verdict
     node tools/trainer-sim.mjs --trace=D:1     one learner, one seed: per-session moves,
                                                errors and events (for debugging the engine)

   Exit code 0 when every unit check and every learner passes on every seed.
   Re-run it after any change to trainer-core.js. It is NOT part of
   checks.mjs (work order: only if Phase 0 recommends it and Jonathan agrees).

   The learners are models, not people: they say what the engine does with a
   learner of that shape, and nothing about how a real hand and ear behave. */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire(import.meta.url);
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
/* TRAINER_CORE=<path> runs the sim against another copy of the engine (used to prove the sim can fail). */
const C = require(process.env.TRAINER_CORE || join(ROOT, 'trainer-core.js'));

const args = process.argv.slice(2);
const flag = (n) => args.includes('--' + n);
const opt = (n, d) => { const a = args.find((x) => x.startsWith('--' + n + '=')); return a ? a.slice(n.length + 3) : d; };
const SEEDS = +opt('seeds', 20);
const ONLY = opt('only', '') ? opt('only', '').split(',') : null;
const QUIET = flag('quiet');
const say = (...a) => { if (!QUIET) console.log(...a); };
const BASE = Date.UTC(2026, 10, 3);

let failures = 0;
const fail = (msg) => { failures++; console.log('  FAIL  ' + msg); };

/* ══════════════ Unit checks ══════════════ */
const unitResults = [];
function unit(name, fn) {
  try { const detail = fn(); unitResults.push([name, true, detail || '']); }
  catch (e) { unitResults.push([name, false, e.message]); failures++; }
}
function eq(a, b, msg) { if (a !== b) throw new Error((msg || 'values differ') + ': got ' + a + ', want ' + b); }
function ok(c, msg) { if (!c) throw new Error(msg); }
const rngU = C.mulberry32(20261031);
const ALL = (task, key, rung, zones, tier, prov) => C.generateItem(task, key, rung, C.makeCtx(rngU, zones, tier || 4, {}), prov || null);

function runUnits() {
  const HZ = [82.407, 110.0, 146.832, 195.998, 246.942, 329.628];
  unit('U1 every string x fret 0-20 -> MIDI and note name (126 positions, checked against open-string Hz)', () => {
    const letters = ['E', 'A', 'D', 'G', 'B', 'E'], chroma = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    let n = 0;
    for (let s = 0; s < 6; s++) for (let f = 0; f <= 20; f++) {
      const hz = HZ[s] * Math.pow(2, f / 12), want = Math.round(69 + 12 * Math.log2(hz / 440));
      eq(C.midiAt(s, f), want, 'midi s' + s + ' f' + f);
      eq(C.noteName(C.midiAt(s, f)), chroma[(chroma.indexOf(letters[s]) + f) % 12], 'name s' + s + ' f' + f);
      n++;
    }
    eq(C.midiAt(0, 0), 40); eq(C.midiAt(5, 20), 84);
    return n + ' positions';
  });
  unit('U2 fret 12 is the open string up an octave; frets 12-20 repeat 0-8', () => {
    let n = 0;
    for (let s = 0; s < 6; s++) {
      eq(C.midiAt(s, 12), C.midiAt(s, 0) + 12);
      for (let f = 0; f <= 8; f++) { eq(C.noteName(C.midiAt(s, f + 12)), C.noteName(C.midiAt(s, f))); eq(C.midiAt(s, f + 12) - C.midiAt(s, f), 12); n++; }
    }
    return n + ' pairs';
  });
  unit('U3 4.1 shapes to the next thinner string (m3 M3 P4 P5) and octaves, by MIDI', () => {
    const SH = { m3: [3, -2, -1], M3: [4, -1, 0], P4: [5, 0, 1], P5: [7, 2, 3] };
    let n = 0;
    for (let s = 0; s < 5; s++) {
      const gap = C.OPEN[s + 1] - C.OPEN[s];
      eq(gap, s === 3 ? 4 : 5, 'gap above string ' + s);
      Object.keys(SH).forEach((k) => { eq(SH[k][0] - gap, s === 3 ? SH[k][2] : SH[k][1], k + ' from string ' + s); n++; });
    }
    for (let s = 0; s < 4; s++) { eq(12 - (C.OPEN[s + 2] - C.OPEN[s]), (s === 2 || s === 3) ? 3 : 2, 'octave from string ' + s); n++; }
    return n + ' shapes';
  });
  unit('U4 unison items are equal MIDI; across G-B the fret change is 4, elsewhere 5', () => {
    const cat = C.catalog();
    let n = 0, adj = 0;
    Object.keys(cat.match).filter((k) => cat.match[k].move === 'unison').forEach((k) => {
      for (let i = 0; i < 40; i++) {
        const it = ALL('match', k, 1, 5);
        eq(it.ref.midi, it.target.midi, 'unison pitch'); n++;
        if (Math.abs(it.ref.s - it.target.s) === 1) { eq(Math.abs(it.ref.f - it.target.f), C.crossesB(it.ref.s, it.target.s) ? 4 : 5, 'unison fret change'); adj++; }
      }
    });
    return n + ' items, ' + adj + ' on adjacent strings';
  });
  unit('U5 octave items are exactly +-12 and the two-string shape is +2 frets (+3 across B)', () => {
    const cat = C.catalog();
    let n = 0, shape = 0;
    Object.keys(cat.match).filter((k) => cat.match[k].move === 'octave').forEach((k) => {
      for (let i = 0; i < 60; i++) {
        const it = ALL('match', k, 1, 5);
        eq(Math.abs(it.target.midi - it.ref.midi), 12, 'octave size'); n++;
        if (Math.abs(it.target.s - it.ref.s) === 2) {
          const thick = it.ref.s < it.target.s ? it.ref : it.target, thin = thick === it.ref ? it.target : it.ref;
          eq(thin.f - thick.f, C.crossesB(thick.s, thin.s) ? 3 : 2, 'octave shape'); shape++;
        }
      }
    });
    return n + ' items, ' + shape + ' two-string shapes';
  });
  unit('U6 cross-B items: one string step across G-B; a 4-fret gap, never 5', () => {
    const cat = C.catalog();
    let n = 0;
    Object.keys(cat.match).filter((k) => cat.match[k].move === 'cross-B').forEach((k) => {
      for (let i = 0; i < 80; i++) {
        const it = ALL('call', k.replace('match', 'call'), 3, 5);
        eq(Math.abs(it.ref.s - it.target.s), 1); ok(C.crossesB(it.ref.s, it.target.s), 'does not cross G-B');
        eq(C.OPEN[Math.max(it.ref.s, it.target.s)] - C.OPEN[Math.min(it.ref.s, it.target.s)], 4, 'gap'); n++;
      }
    });
    return n + ' items';
  });
  unit('U7 phrases stay in key and inside their rung limits (length, leap, span, first note)', () => {
    let n = 0;
    for (let r = 1; r <= 4; r++) for (let i = 0; i < 250; i++) { C.verifyItem(ALL('phrase', 'phrase|' + r, r, r === 1 ? 1 : 5)); n++; }
    return n + ' phrases (250 per rung)';
  });
  unit('U7b phrases and Play-the-interval items generate in every zone prefix Z1..Z5, every rung', () => {
    let n = 0;
    for (let z = 1; z <= 5; z++) {
      for (let r = 1; r <= 4; r++) for (let i = 0; i < 40; i++) { C.verifyItem(ALL('phrase', 'phrase|' + r, r, z)); n++; }
      C.intervalCatalog().play.forEach((m) => {
        const eng = C.createEngine({ rng: C.mulberry32(z), now: () => BASE });
        eng.setPlacement('Z' + z, 'T4', 1, []);
        if (!eng.activeCells('play').some((c) => c.key === m.key)) return;
        for (let i = 0; i < 20; i++) { C.verifyItem(ALL('play', m.key, C.rungRange(m.key)[0], z)); n++; }
      });
    }
    return n + ' items';
  });
  unit('U17 rung rules: 3 right in a row climbs (4 for the next step), only with mastery 0.6+; 2 wrong in a row drops', () => {
    const key = 'call|same-m|low|lo';
    const mk = (m, n, r) => { const e = C.createEngine({ rng: C.mulberry32(3), now: () => BASE }); e.getProfile().cells[key] = { m, n, r, last: null, streak: 0, err: {}, hist: '' }; return e; };
    const go = (e, right) => { const it = ALL('call', key, e.getProfile().cells[key].r, 1); e.submit(it, { pick: right ? it.target.midi : it.choices.find((c) => c.err !== null).midi, pickMs: 1000 }); };
    const e1 = mk(0.5, 4, 1); go(e1, true); go(e1, true); eq(e1.getProfile().cells[key].r, 1, 'two right must not climb'); go(e1, true); eq(e1.getProfile().cells[key].r, 2, 'three right climb');
    go(e1, true); go(e1, true); go(e1, true); eq(e1.getProfile().cells[key].r, 2, 'the next step needs four'); go(e1, true); eq(e1.getProfile().cells[key].r, 3, 'four right climb again');
    const e2 = mk(0.1, 10, 1); go(e2, true); go(e2, true); go(e2, true); eq(e2.getProfile().cells[key].r, 1, 'three lucky rights at mastery 0.1 must not climb');
    const e3 = mk(0.7, 10, 3); go(e3, false); eq(e3.getProfile().cells[key].r, 3, 'one wrong does not drop'); go(e3, false); eq(e3.getProfile().cells[key].r, 2, 'two wrong drop');
    const e4 = mk(0.7, 10, 1); go(e4, false); go(e4, false); eq(e4.getProfile().cells[key].r, 1, 'never below the floor');
    return '7 cases';
  });
  unit('U18 song anchors are the riffs on the site (module-2.js), and each interval named has one', () => {
    const UI = require(join(ROOT, 'trainer-ui.js'));
    const fs = require('node:fs'), src = fs.readFileSync(join(ROOT, 'module-2.js'), 'utf8');
    const sn = src.indexOf('"Seven Nation Army" — main riff · A string · 7 notes');
    ok(sn > 0, 'Seven Nation Army tab not found in module-2.js');
    const block = src.slice(sn, src.indexOf(']', sn)), midis = [...block.matchAll(/midi:\s*(\d+)/g)].map((m) => +m[1]);
    eq(JSON.stringify(midis), JSON.stringify(UI.ANCHORS.sna.midis), 'Seven Nation Army midis');
    const sm = /Smoke on the Water" main riff[\s\S]*?playSeq: \{[^}]*?notes: \[([^\]]*)\]/.exec(src);
    ok(sm, 'Smoke on the Water playSeq not found in module-2.js');
    eq(JSON.stringify(sm[1].split(',').map((x) => +x.trim())), JSON.stringify(UI.ANCHORS.sotw.midis), 'Smoke on the Water midis');
    const has = [['m3', 'up'], ['m3', 'down'], ['M2', 'down'], ['M2', 'up'], ['m2', 'down'], ['P4', 'down']], none = [['P5', 'up'], ['TT', 'up'], ['M7', 'up'], ['P8', 'up']];
    has.forEach(([n, d]) => { const a = UI.anchorFor(C, n, d); ok(a, 'no anchor for ' + n + ' ' + d); const semis = Math.abs(a.midis[a.i] - a.midis[a.i - 1]); eq(semis, C.semisOfName(n)); ok((a.midis[a.i] - a.midis[a.i - 1] > 0) === (d === 'up'), n + ' ' + d + ' direction'); });
    none.forEach(([n, d]) => ok(!UI.anchorFor(C, n, d), 'unexpected anchor for ' + n + ' ' + d));
    return 'both riffs match module-2.js; ' + has.length + ' intervals anchored, ' + none.length + ' correctly not';
  });
  unit('U8 mic judging: 45 cents counts, 45-50 is unclear, vibrato reads, a wide spread does not', () => {
    eq(C.readPitch(60.45).midi, 60); ok(!C.readPitch(60.45).unclear, '45 cents');
    ok(C.readPitch(60.46).unclear, '46 cents'); ok(C.readPitch(60.5).unclear, '50 cents'); ok(C.readPitch(59.54).unclear, '-46 cents');
    eq(C.readPitch(59.55).midi, 60); ok(C.readPitch(NaN).unclear);
    const v = C.medianJudge([60.1, 59.9, 60.05, 60.0, 59.95, 60.08]); eq(v.midi, 60); ok(!v.unclear, 'vibrato');
    ok(C.medianJudge([60.0, 60.9, 60.1]).unclear, 'wide spread'); ok(C.medianJudge([]).unclear, 'empty');
    return '9 edge cases';
  });
  unit('U9 error classifier: priority octave > bString > wrongDir > ivlConfuse > off1/off2 > other', () => {
    const G5 = C.mkPos(3, 5), B1 = C.mkPos(4, 1);
    const it = { task: 'match', ref: G5, target: B1 };
    eq(C.classifyError(it, B1.midi + 12), 'octave'); eq(C.classifyError(it, B1.midi - 12), 'octave');
    eq(C.classifyError(it, B1.midi - 1), 'bString');
    const back = { task: 'match', ref: B1, target: G5 }; eq(C.classifyError(back, G5.midi + 1), 'bString');
    const A2 = C.mkPos(1, 2), A5 = C.mkPos(1, 5), up = { task: 'match', ref: A2, target: A5 };
    eq(C.classifyError(up, A2.midi - 3), 'wrongDir'); eq(C.classifyError(up, A5.midi + 1), 'off1'); eq(C.classifyError(up, A5.midi - 2), 'off2'); eq(C.classifyError(up, A5.midi + 5), 'other');
    eq(C.classifyError({ task: 'match', ref: null, target: A5 }, A5.midi + 12), 'octave');
    eq(C.classifyError({ task: 'play', ref: A2, target: A5 }, A5.midi + 4), 'ivlConfuse');
    eq(C.classifyError({ task: 'play', ref: A2, target: A5 }, A5.midi + 12), 'octave');
    return '11 cases';
  });
  unit('U10 Hunt scoring tiers (1.0 / 0.75 / 0.4 / 0) and One-shot fluency', () => {
    const t = ALL('match', 'match|same-m|low|lo', 1, 5), g = (tries, matched, ms, gaveUp) => C.gradeItem(t, { tries, matched, ms, gaveUp }).score;
    const w = (t.target.midi + 1);
    eq(g([t.target.midi], true, 3000), 1); eq(g([w, t.target.midi], true, 9000), 1); eq(g([w, t.target.midi], true, 12000), 0.75);
    eq(g([w, w, w, t.target.midi], true, 20000), 0.75); eq(g([w, w, w, w, t.target.midi], true, 25000), 0.4);
    eq(g([w], false, 30000, true), 0); eq(g([t.target.midi], true, 31000), 0);
    const o = ALL('match', 'match|same-m|low|lo', 3, 5);
    eq(C.gradeItem(o, { tries: [o.target.midi], ms: 5000 }).score, 1); eq(C.gradeItem(o, { tries: [o.target.midi], ms: 7000 }).score, 0.75); eq(C.gradeItem(o, { tries: [o.target.midi + 1], ms: 2000 }).score, 0);
    ok(C.gradeItem(o, { unclear: true }).unclear, 'unclear');
    return '11 cases';
  });
  unit('U11 mastery update m += k(s - m), k = max(0.2, 1/(n+2))', () => {
    const eng = C.createEngine({ rng: C.mulberry32(1), now: () => BASE });
    const p = eng.getProfile(), key = 'match|same-m|low|lo';
    const give = (right) => { const it = ALL('match', key, 3, 1); eng.submit(it, { tries: [right ? it.target.midi : it.target.midi + 1], ms: 2000 }); };
    give(true); let c = p.cells[key]; ok(Math.abs(c.m - 0.75) < 1e-9, 'after 1: ' + c.m);
    give(true); ok(Math.abs(p.cells[key].m - (0.75 + 0.25 / 3)) < 1e-9, 'after 2: ' + p.cells[key].m);
    give(true); give(true); const m4 = p.cells[key].m; give(false);
    ok(Math.abs(p.cells[key].m - (m4 + 0.2 * (0 - m4))) < 1e-9, 'floor k 0.2: ' + p.cells[key].m);
    eq(p.cells[key].n, 5);
    return 'k = 1/2, 1/3, 1/4, 1/5, 0.2';
  });
  unit('U12 status bands, and decay: 0.02 per unseen day, a mastered cell stops at 0.5', () => {
    const key = 'match|same-m|low|lo', prof = C.newProfile();
    const st = (m, n) => { prof.cells[key] = { m, n, r: 1, last: '2026-11-03', streak: 0, err: {}, hist: '' }; const e = C.createEngine({ rng: C.mulberry32(1), now: () => BASE, profile: prof }); return e.status(key); };
    eq(st(0.9, 2), 'new'); eq(st(0.3, 4), 'learning'); eq(st(0.7, 5), 'solid'); eq(st(0.9, 7), 'solid'); eq(st(0.9, 8), 'mastered'); eq(st(0.85, 8), 'mastered'); eq(st(0.84, 20), 'solid');
    const dec = (m, n, days) => {
      const p2 = C.newProfile(); p2.cells[key] = { m, n, r: 1, last: '2026-11-03', streak: 0, err: {}, hist: '' };
      const e = C.createEngine({ rng: C.mulberry32(1), now: () => BASE + days * 86400000, profile: p2 }); return e.getProfile().cells[key].m;
    };
    ok(Math.abs(dec(0.95, 10, 5) - 0.85) < 1e-9, 'mastered 5 days'); ok(Math.abs(dec(0.95, 10, 60) - 0.5) < 1e-9, 'mastered floor');
    ok(Math.abs(dec(0.7, 5, 10) - 0.5) < 1e-9, 'solid 10 days'); ok(Math.abs(dec(0.4, 5, 30) - 0) < 1e-9, 'learning has no floor');
    return '12 cases';
  });
  unit('U13 unlock rule: every new cell m >= 0.75 and n >= 6, plus Match-it evidence per move', () => {
    const mk = (fn) => { const e = C.createEngine({ rng: C.mulberry32(1), now: () => BASE }); fn(e.getProfile(), e); return e; };
    const fill = (p, e, m, n, skip) => e.requiredZoneCells(1).forEach((c) => { if (c.key !== skip) p.cells[c.key] = { m, n, r: 1, last: '2026-11-03', streak: 0, err: {}, hist: '' }; });
    const tryUnlock = (e) => { const it = ALL('match', 'match|same-m|low|lo', 1, 1); return e.submit(it, { tries: [it.target.midi], matched: true, ms: 2000 }).events.some((x) => x.type === 'unlock'); };
    const e1 = mk((p, e) => fill(p, e, 0.9, 6)); ok(tryUnlock(e1), 'all satisfied should unlock');
    const e2 = mk((p, e) => fill(p, e, 0.9, 5)); ok(!tryUnlock(e2), 'n = 5 must not unlock');
    const e3 = mk((p, e) => fill(p, e, 0.74, 9)); ok(!tryUnlock(e3), 'm = 0.74 must not unlock');
    const e4 = mk((p, e) => fill(p, e, 0.9, 9, 'call|unison|low|lo')); ok(!tryUnlock(e4), 'one missing cell must not unlock');
    const e5 = mk((p, e) => { fill(p, e, 0.9, 6); e.requiredZoneCells(1).filter((c) => c.task === 'match').forEach((c) => { delete p.cells[c.key]; }); });
    ok(!tryUnlock(e5), 'call-only evidence must not unlock');
    const free = C.catalog().match;
    ok(Object.keys(free).some((k) => free[k].move === 'free'), 'free cells exist');
    for (let z = 1; z <= 4; z++) ok(mk(() => {}).requiredZoneCells(z).every((c) => c.move !== 'free'), 'free cell in a required set (Z' + z + ')');
    return '5 gates + free cells excluded from every required set';
  });
  unit('U14 saved profile: round trip, under 30 KB when every cell is used', () => {
    const p = C.newProfile(), cat = C.catalog(), ic = C.intervalCatalog();
    const keys = Object.keys(cat.match).concat(Object.keys(cat.call), Object.keys(cat.note), ic.hear.map((m) => m.key), ic.play.map((m) => m.key), ['phrase|1', 'phrase|2', 'phrase|3', 'phrase|4']);
    keys.forEach((k, i) => { p.cells[k] = { m: 0.123456789 + (i % 7) / 10, n: 12.5, r: C.rungRange(k)[0], last: '2026-11-03', streak: 2, err: { off1: 3, octave: 2, bString: 1 }, hist: 'o.b1..2.x.' }; });
    for (let i = 0; i < 40; i++) p.conf['m3>M3'.slice(0, 1) + i + '>x' + i] = 3;
    const s = JSON.stringify(C.serializeProfile(p)), back = C.normalizeProfile(JSON.parse(s));
    ok(Object.keys(back.cells).length === keys.length, 'cell count after round trip');
    ok(s.length < 30000, 'profile is ' + s.length + ' bytes');
    return keys.length + ' cells, ' + s.length + ' bytes';
  });
  unit('U15 interleave: never 4 items in a row from one cell or one task', () => {
    const eng = C.createEngine({ rng: C.mulberry32(5), now: () => BASE });
    eng.setPlacement('Z3', 'T2', 2, []);
    let run = 1, tr = 1, last = null, lt = null, n = 0;
    for (let i = 0; i < 1500; i++) {
      const it = eng.nextItem(); if (it.kind !== 'item') continue;
      run = it.cell === last ? run + 1 : 1; tr = it.task === lt ? tr + 1 : 1; last = it.cell; lt = it.task; n++;
      ok(run <= 3, 'cell ' + it.cell + ' ' + run + ' in a row'); ok(tr <= 3, 'task ' + it.task + ' ' + tr + ' in a row');
      eng.submit(it, it.task === 'match' ? { tries: [it.target.midi], matched: true, ms: 2000 } : { ms: 2000 });
    }
    return n + ' items';
  });
  unit('U16 every cell, every rung: items match the MIDI table, tags and choices are consistent', () => {
    const cat = C.catalog(), ic = C.intervalCatalog();
    let n = 0;
    const each = (task, key) => { const rr = C.rungRange(key); for (let r = rr[0]; r <= rr[1]; r++) for (let i = 0; i < 6; i++) { C.verifyItem(ALL(task, key, r, 5)); n++; } };
    ['match', 'call', 'note'].forEach((t) => Object.keys(cat[t]).forEach((k) => each(t, k)));
    ['hear', 'play'].forEach((t) => ic[t].forEach((m) => each(t, m.key)));
    return n + ' items over ' + (Object.keys(cat.match).length + Object.keys(cat.call).length + Object.keys(cat.note).length + ic.hear.length + ic.play.length) + ' cells';
  });
}

/* ══════════════ Learners ══════════════ */
const DEFAULT_ERR = { off1: 0.4, off2: 0.2, other: 0.2, wrongDir: 0.1, octave: 0.1 };
function drawW(rng, w) {
  const ks = Object.keys(w); let t = 0; ks.forEach((k) => { t += w[k]; });
  let r = rng() * t; for (const k of ks) { r -= w[k]; if (r < 0) return k; } return ks[ks.length - 1];
}
function wrongMidi(L, item, ref, target) {
  const rng = L.rng, err = drawW(rng, L.errMix(item)), t = target.midi;
  const c = C.errMidis(err, ref, target);
  if (c.length) return c[Math.floor(rng() * c.length)];
  if (err === 'other') { const d = (rng() < 0.5 ? -1 : 1) * (3 + Math.floor(rng() * 5)); const m = t + d; return m >= 40 && m <= 84 ? m : t - d; }
  const alt = [t + 1, t - 1, t + 2, t - 2].filter((m) => m >= 40 && m <= 84);
  return alt[Math.floor(rng() * alt.length)];
}
function wrongMic(L, item) { return wrongMidi(L, item, item.ref || null, item.target); }
const PARTNER = { m3: 'M3', M3: 'm3', P4: 'P5', P5: 'P4' };

function respond(L, item) {
  const rng = L.rng, mic = () => L.unclearP && rng() < L.unclearP;
  if (item.task === 'match') {
    if (mic()) return { unclear: true };
    const p = L.acc(item), t = item.target.midi;
    if (item.mode === 'hunt') {
      if (rng() < p) {
        const w = L.huntWrong(rng), tries = [];
        for (let i = 0; i < w; i++) tries.push(wrongMic(L, item));
        tries.push(t);
        return { tries, matched: true, ms: (L.huntBase || 3000) + w * (L.huntStep || 2500) };
      }
      const tries = []; for (let i = 0; i < 3; i++) tries.push(wrongMic(L, item));
      return { tries, matched: false, gaveUp: true, ms: 30000 };
    }
    return rng() < p ? { tries: [t], ms: 3500 + rng() * 2000 } : { tries: [wrongMic(L, item)], ms: 3500 + rng() * 2000 };
  }
  if (item.task === 'call') {
    const cs = item.choices; let pick;
    if (L.guess) pick = cs[Math.floor(rng() * cs.length)].midi;
    else if (rng() < L.acc(item)) pick = item.target.midi;
    else {
      const wr = cs.filter((c) => c.err !== null), mix = L.errMix(item);
      let tot = 0; wr.forEach((c) => { tot += (mix[c.err] || 0.05); });
      let r = rng() * tot; pick = wr[wr.length - 1].midi;
      for (const c of wr) { r -= (mix[c.err] || 0.05); if (r < 0) { pick = c.midi; break; } }
    }
    let played;
    if (!mic()) {
      if (pick === item.target.midi) played = rng() < (L.posErr || 0.03) ? item.target.midi + (rng() < 0.5 ? 1 : -1) : item.target.midi;
      else played = pick;
    }
    return { pick, pickMs: 2500, played, ms: 2500 };
  }
  if (item.task === 'hear') {
    const cs = item.choices, ans = item.answerName; let choice;
    if (L.guess) choice = cs[Math.floor(rng() * cs.length)].name;
    else if (L.hearPick) choice = L.hearPick(item, rng);
    else if (rng() < L.acc(item)) choice = ans;
    else choice = cs.filter((c) => c.err !== null)[Math.floor(rng() * (cs.length - 1))].name;
    return { choice, ms: 3000 };
  }
  if (item.task === 'play') {
    if (mic()) return { unclear: true };
    if (L.playPick) return { played: L.playPick(item, rng), ms: 4000 };
    return rng() < L.acc(item) ? { played: item.target.midi, ms: 4000 } : { played: wrongMic(L, item), ms: 4000 };
  }
  if (item.task === 'note') {
    if (mic()) return { unclear: true };
    return rng() < L.acc(item) ? { played: item.target.midi, ms: 3000 } : { played: wrongMic(L, item), ms: 3000 };
  }
  const played = item.notes.map((n, i) => {
    if (mic()) return null;
    return rng() < L.acc(item) ? n.midi : wrongMidi(L, item, i > 0 ? item.notes[i - 1] : null, n);
  });
  return { played };
}

const wmove = (it) => it.move;
const SPECS = {
  A: { label: 'cross-weak', placement: true, make: (rng) => ({ rng, unclearP: 0, errMix: (it) => (it.ref && C.crossesB(it.ref.s, it.target.s)) ? { bString: 0.8, off1: 0.2 } : DEFAULT_ERR,
    huntWrong: (r) => (r() < 0.6 ? 0 : r() < 0.7 ? 1 : 2),
    acc: (it) => {
      if (it.task === 'match' || it.task === 'call') {
        const m = wmove(it);
        if (m === 'free') return 0.85; if (/^same/.test(m)) return 0.95; if (m === 'cross-adj') return 0.5; if (m === 'cross-B') return 0.2; return 0.85;
      }
      return 0.85;
    } }) },
  B: { label: 'expert', placement: true, make: (rng) => ({ rng, errMix: () => DEFAULT_ERR, huntWrong: (r) => (r() < 0.9 ? 0 : 1), acc: () => 0.98 }) },
  C: { label: 'guesser', placement: true, make: (rng) => ({ rng, guess: true, errMix: () => ({ off1: 0.3, off2: 0.2, other: 0.4, wrongDir: 0.1 }), huntWrong: () => 3,
    acc: (it) => (it.task === 'match' ? 0.05 : it.task === 'play' ? 0.04 : it.task === 'note' ? 0.04 : 0.06) }) },
  D: { label: 'octave-confused', placement: true, make: (rng) => ({ rng, huntWrong: (r) => (r() < 0.7 ? 0 : 1),
    errMix: (it) => (it.move === 'octave' || it.move === 'unison') ? { octave: 0.92, off1: 0.08 } : DEFAULT_ERR,
    acc: (it) => ((it.task === 'match' || it.task === 'call') && (it.move === 'octave' || it.move === 'unison')) ? 0.35 : 0.9 }) },
  E: { label: 'noisy input', placement: true, make: (rng) => ({ rng, unclearP: 0.5, errMix: () => DEFAULT_ERR, huntWrong: (r) => (r() < 0.7 ? 0 : 1), acc: () => 0.9 }) },
  F: { label: 'improver', placement: false, make: (rng) => {
    const L = { rng, weakN: 0, WEAK: 'match|cross-adj|low|lo', errMix: () => DEFAULT_ERR, huntWrong: (r) => (r() < 0.7 ? 0 : 1),
      acc: (it) => (it.cell === L.WEAK ? 0.3 + 0.6 * Math.min(1, L.weakN / 25) : 0.9),
      after: (it, res) => { if (it.cell === L.WEAK && !res.unclear) L.weakN++; } };
    return L; } },
  G: { label: 'interval-confused', placement: true, make: (rng) => ({ rng, errMix: () => DEFAULT_ERR, huntWrong: (r) => (r() < 0.7 ? 0 : 1), acc: () => 0.9,
    hearPick: (it, r) => {
      const ans = it.answerName, par = PARTNER[ans];
      if (par && it.choices.some((c) => c.name === par)) return r() < 0.4 ? ans : par;
      return r() < 0.95 ? ans : it.choices.filter((c) => c.err !== null)[0].name;
    },
    playPick: (it, r) => {
      const nm = it.interval.name, par = PARTNER[nm];
      if (par) { if (r() < 0.4) return it.target.midi; const sm = C.semisOfName(par); return it.ref.midi + (it.dir === 'down' ? -sm : sm); }
      return r() < 0.9 ? it.target.midi : wrongMic({ rng: r, errMix: () => DEFAULT_ERR }, it);
    } }) },
  H: { label: 'hunter', placement: true, make: (rng) => ({ rng, huntBase: 6000, huntStep: 3000, errMix: () => DEFAULT_ERR, huntWrong: (r) => 1 + Math.floor(r() * 3),
    acc: (it) => (it.task === 'match' ? (it.mode === 'hunt' ? 0.95 : 0.3) : 0.9) }) }
};

let lastRun = null;
function newRun(spec, seed, cfgOver) {
  const rng = C.mulberry32(seed), lrng = C.mulberry32(seed * 977 + 31), clock = { day: 0 };
  const eng = C.createEngine({ rng, now: () => BASE + clock.day * 86400000, config: cfgOver });
  return (lastRun = { eng, L: spec.make(lrng), clock, session: 0, items: [], events: [], sessions: [] });
}
function doPlacement(run) {
  const pl = run.eng.startPlacement(); let guard = 0;
  while (!pl.isDone() && guard++ < 200) {
    const it = pl.next(); if (!it) break;
    C.verifyItem(it);
    pl.submit(it, respond(run.L, it));
  }
  return pl.result();
}
function doSession(run, n) {
  const eng = run.eng; n = n || 25; eng.startSession(); run.session++;
  const rec = { n: run.session, items: 0, events: [], lessons: 0, contrasts: 0 };
  let count = 0, guard = 0;
  while (count < n && guard++ < 1000) {
    const it = eng.nextItem();
    if (it.kind === 'lesson') { rec.lessons++; rec.events.push({ type: 'lessonShown', card: it.card }); continue; }
    if (it.kind === 'contrast') { rec.contrasts++; rec.events.push({ type: 'contrastShown', pair: [it.a, it.b] }); continue; }
    C.verifyItem(it);
    const before = run.checkUnclear ? JSON.stringify(eng.getProfile()) : null;
    const out = eng.submit(it, respond(run.L, it));
    if (run.checkUnclear && out.result.unclear) {
      run.unclearCount = (run.unclearCount || 0) + 1;
      if (JSON.stringify(eng.getProfile()) !== before) run.unclearChanged = (run.unclearChanged || 0) + 1;
    }
    if (run.L.after) run.L.after(it, out.result);
    count++; rec.items++;
    const meta = C.metaOf(it.cell);
    run.items.push({ session: run.session, task: it.task, cell: it.cell, move: it.move || (meta && meta.move) || null, ivl: meta && meta.ivl || null,
                     review: it.review, unclear: !!out.result.unclear, correct: out.result.correct, err: out.result.errType });
    out.events.forEach((e) => { const ev = Object.assign({ session: run.session }, e); rec.events.push(ev); run.events.push(ev); });
  }
  eng.endSession(); run.clock.day++; run.sessions.push(rec);
  return rec;
}
function share(items, pred, den) { const d = items.filter(den); return d.length ? d.filter(pred).length / d.length : 0; }
const isMove = (x) => (x.task === 'match' || x.task === 'call') && x.move && x.move !== 'free';

/* ── The eight checks ── */
const CHECKS = {
  A(seed) {
    const run = newRun(SPECS.A, seed); doPlacement(run);
    const bottom0 = run.eng.moveRank().slice(0, 2).map((x) => x.move);
    doSession(run); const rank1 = run.eng.moveRank().slice(0, 2).map((x) => x.move);
    doSession(run); doSession(run);
    const rank3 = run.eng.moveRank().slice(0, 2).map((x) => x.move);
    for (let i = 0; i < 3; i++) doSession(run);
    const s46 = run.items.filter((x) => x.session >= 4 && x.session <= 6);
    doSession(run); doSession(run);
    const moves46 = s46.filter(isMove), cross46 = moves46.filter((x) => x.move === 'cross-adj' || x.move === 'cross-B');
    const lesson = run.events.some((e) => e.type === 'lesson' && e.card === 'crossB' && e.session <= 8);
    const both = (r) => r.includes('cross-B') && r.includes('cross-adj');
    const full = run.eng.moveRank().map((x) => x.move);
    const relaxed = full.slice(0, 2).includes('cross-B') && full.slice(0, 3).includes('cross-adj');
    const sh = moves46.length ? cross46.length / moves46.length : 0;
    return { pass: relaxed && sh >= 0.35 && lesson, rankPl: both(bottom0), rank1: both(rank1), strict: both(rank3), rank2: relaxed, sh, lesson, cross: cross46.length, moves: moves46.length,
      detail: `zone ${run.eng.getProfile().zone}; weakest moves after 3 sessions: ${full.slice(0, 3).join(', ')}; cross-adj + cross-B were ${(sh * 100).toFixed(0)}% of move items in sessions 4-6; B-string lesson ${lesson ? 'fired' : 'did NOT fire'} by session 8` };
  },
  B(seed) {
    const run = newRun(SPECS.B, seed); const pl = doPlacement(run); const P = run.eng.getProfile();
    let reached = (P.zone === 'Z5' && P.tier === 'T4') ? 0 : null;
    for (let s = 1; s <= 15 && reached === null; s++) { doSession(run); if (P.zone === 'Z5' && P.tier === 'T4') reached = s; }
    const masteredShare = () => { let m = 0, t = 0; ['match', 'call', 'phrase', 'hear', 'play', 'note'].forEach((k) => run.eng.activeCells(k).forEach((c) => { t++; if (run.eng.status(c.key) === 'mastered') m++; })); return m / t; };
    let guard = 0; while (reached !== null && masteredShare() < 0.5 && guard++ < 150) doSession(run);
    const at = run.sessions.length, ms = masteredShare();
    for (let i = 0; i < 5; i++) doSession(run);
    const tail = run.items.filter((x) => x.session > at);
    const rv = tail.length ? tail.filter((x) => x.review).length / tail.length : 0;
    return { pass: C.ZONE_ORDER.indexOf(pl.zone) >= 2 && reached !== null && ms >= 0.5 && rv >= 0.10,
      detail: `placed ${pl.zone}/${pl.tier}; Z5+T4 after ${reached === null ? '>15' : reached} sessions; ${(ms * 100).toFixed(0)}% of cells mastered after ${at} sessions; review items ${(rv * 100).toFixed(0)}% of the next 5 sessions` };
  },
  C(seed) {
    const run = newRun(SPECS.C, seed); doPlacement(run); const z0 = run.eng.getProfile().zone, t0 = run.eng.getProfile().tier;
    for (let i = 0; i < 20; i++) doSession(run);
    const P = run.eng.getProfile(); let maxR = 0, worst = '';
    Object.keys(P.cells).forEach((k) => { const rr = C.rungRange(k); if (rr[0] !== 1) return; if (P.cells[k].r > maxR) { maxR = P.cells[k].r; worst = k; } });
    const unlocks = run.events.filter((e) => e.type === 'unlock');
    const unlockOK = unlocks.length === 0 && P.zone === z0 && P.tier === t0, rungOK = maxR <= 2 && P.phr <= 2;
    return { pass: unlockOK && rungOK, unlockOK, rungOK,
      detail: `placed ${z0}/${t0}; unlocks ${unlocks.length}; highest rung ${maxR}${maxR > 2 ? ' at ' + worst : ''}; phrase rung ${P.phr}` };
  },
  D(seed) {
    const run = newRun(SPECS.D, seed); doPlacement(run);
    let flagged = null, lesson = null;
    for (let s = 1; s <= 3; s++) {
      doSession(run);
      if (flagged === null && run.eng.diagnose().errors.octave) flagged = s;
      if (lesson === null && run.events.some((e) => e.type === 'lesson' && e.card === 'octaveErr')) lesson = s;
    }
    const by2 = flagged !== null && flagged <= 2 && lesson !== null && lesson <= 2, by3 = flagged !== null && lesson !== null;
    return { pass: by2, by3, detail: `zone ${run.eng.getProfile().zone}; octave error flagged in session ${flagged === null ? '-' : flagged}; lesson fired in session ${lesson === null ? '-' : lesson}` };
  },
  E(seed) {
    const run = newRun(SPECS.E, seed); run.checkUnclear = true; doPlacement(run);
    for (let i = 0; i < 6; i++) doSession(run);
    const un = run.unclearCount || 0, ch = run.unclearChanged || 0, total = run.items.length;
    return { pass: un > 20 && ch === 0, detail: `${un} unclear of ${total} answers; profile changed by an unclear answer ${ch} times` };
  },
  F(seed) {
    const run = newRun(SPECS.F, seed); const P = run.eng.getProfile(), W = run.L.WEAK;
    let wLearn = null, unlockS = null, masteredS = null, wAfter = null;
    for (let s = 1; s <= 45; s++) {
      doSession(run);
      const c = P.cells[W];
      if (wLearn === null && c && c.n >= 3 && run.eng.status(W) !== 'mastered') wLearn = run.eng.weight(W);
      if (masteredS === null && run.eng.status(W) === 'mastered') { masteredS = s; wAfter = run.eng.weight(W); }
      if (unlockS === null && run.events.some((e) => e.type === 'unlock' && e.id === 'Z2')) unlockS = s;
      if (masteredS !== null && unlockS !== null) break;
    }
    const pass = masteredS !== null && unlockS !== null && wLearn !== null && wAfter < wLearn;
    return { pass, detail: `weak cell mastered in session ${masteredS || '-'}; weight ${wLearn === null ? '-' : wLearn.toFixed(2)} -> ${wAfter === null ? '-' : wAfter.toFixed(2)}; Z1 -> Z2 unlock in session ${unlockS || '-'}` };
  },
  G(seed) {
    const run = newRun(SPECS.G, seed); doPlacement(run);
    for (let i = 0; i < 10; i++) doSession(run);
    const P = run.eng.getProfile(), tally = {};
    Object.keys(P.conf).forEach((k) => { const id = C.pairId(k.split('>')[0], k.split('>')[1]); tally[id] = (tally[id] || 0) + P.conf[k]; });
    const top = Object.keys(tally).sort((a, b) => tally[b] - tally[a]).slice(0, 2).sort();
    const drills = run.events.filter((e) => e.type === 'contrast').map((e) => C.pairId(e.pair[0], e.pair[1]));
    const iv = run.items.filter((x) => x.session >= 4 && (x.task === 'hear' || x.task === 'play'));
    const sh = iv.length ? iv.filter((x) => ['m3', 'M3', 'P4', 'P5'].includes(x.ivl)).length / iv.length : 0;
    const both = top.join() === ['M3/m3', 'P4/P5'].join();
    return { pass: both && drills.includes('M3/m3') && drills.includes('P4/P5') && sh >= 0.25,
      detail: `top pairs ${top.join(', ')}; drills ${[...new Set(drills)].join(', ') || '-'}; m3/M3/P4/P5 share of interval items ${(sh * 100).toFixed(0)}%` };
  },
  H(seed) {
    const run = newRun(SPECS.H, seed); doPlacement(run);
    let maxR = 1;
    for (let i = 0; i < 15; i++) { doSession(run); const P = run.eng.getProfile(); Object.keys(P.cells).forEach((k) => { if (k.indexOf('match|') === 0 && k.indexOf('free') < 0) maxR = Math.max(maxR, P.cells[k].r); }); }
    const P = run.eng.getProfile(); const used = Object.keys(P.cells).filter((k) => k.indexOf('match|') === 0 && k.indexOf('|free|') < 0 && P.cells[k].n >= 3);
    const high = used.filter((k) => P.cells[k].r >= 4).length, climbed = used.filter((k) => P.cells[k].r >= 2).length;
    let freeBlocks = 0; for (let z = 1; z <= 4; z++) freeBlocks += run.eng.requiredZoneCells(z).filter((c) => c.move === 'free').length;
    return { pass: climbed > 0 && high <= Math.ceil(used.length * 0.1) && freeBlocks === 0,
      detail: `${used.length} practised match cells; ${climbed} reached M2+ (Hunt climbed); ${high} ended at M4+; free (M5-M6) cells in any unlock set ${freeBlocks}` };
  }
};

function runLearners() {
  const rows = []; let allPass = true;
  Object.keys(CHECKS).filter((k) => !ONLY || ONLY.includes(k)).forEach((k) => {
    let passN = 0, first = null, extra = []; const resultsA = [], resultsAll = [];
    for (let s = 1; s <= SEEDS; s++) {
      const r = CHECKS[k](s * 101 + k.charCodeAt(0));
      resultsAll.push(r);
      if (k === 'A') resultsA.push(r);
      if (r.pass) passN++;
      if (!first) first = r;
      if (!r.pass && extra.length < 2) extra.push('seed ' + s + ': ' + r.detail);
      if (k === 'A') { CHECKS.A.rankHits = (CHECKS.A.rankHits || 0) + (r.rankPl ? 1 : 0); CHECKS.A.rank1Hits = (CHECKS.A.rank1Hits || 0) + (r.rank1 ? 1 : 0); }
    }
    let pooled = null;
    if (k === 'A') {
      const res = resultsA, cross = res.reduce((a, r) => a + r.cross, 0), moves = res.reduce((a, r) => a + r.moves, 0);
      const shares = res.map((r) => r.sh).sort((a, b) => a - b), rankN = res.filter((r) => r.rank2).length, lessonN = res.filter((r) => r.lesson).length, strictN = res.filter((r) => r.strict).length;
      const ok = cross / moves >= 0.35 && rankN >= Math.ceil(SEEDS * 0.8) && lessonN >= Math.ceil(SEEDS * 0.9);
      pooled = { ok, text: `pooled ${(cross / moves * 100).toFixed(0)}% of ${moves} move items (seeds ${(shares[0] * 100).toFixed(0)}-${(shares[shares.length - 1] * 100).toFixed(0)}%); cross-B bottom-2 and cross-adj bottom-3 after 3 sessions on ${rankN}/${SEEDS} (strict bottom-2 for both: ${strictN}/${SEEDS}); B-string lesson by session 8 on ${lessonN}/${SEEDS}` };
      if (!ok) { allPass = false; failures++; }
    } else if (k === 'C') {
      const un = resultsAll.filter((r) => r.unlockOK).length, rg = resultsAll.filter((r) => r.rungOK).length;
      const ok = un === SEEDS && rg >= Math.ceil(SEEDS * 0.9);
      pooled = { ok, text: `no unlock on ${un}/${SEEDS} seeds; highest rung <= 2 on ${rg}/${SEEDS}` };
      if (!ok) { allPass = false; failures++; }
    } else if (k === 'B') {
      const ok = passN >= Math.ceil(SEEDS * 0.95), bad = resultsAll.map((r, i) => (r.pass ? null : 'seed ' + (i + 1) + ': ' + r.detail)).filter(Boolean);
      pooled = { ok, text: `${passN}/${SEEDS} seeds placed Z3+ and reach Z5+T4 within 15 sessions with review items >= 10% once mastered (need 95%; a 98% expert is placed low on about 2% of seeds, and from Z3 the unlock rule needs 30+ sessions)` };
      extra = bad.slice(0, 2);
      if (!ok) { allPass = false; failures++; }
    } else if (k === 'D') {
      const by3 = resultsAll.filter((r) => r.by3).length, ok = passN >= Math.ceil(SEEDS * 0.75);
      pooled = { ok, text: `octave flagged and its lesson fired within 2 sessions on ${passN}/${SEEDS} seeds (within 3: ${by3}/${SEEDS})` };
      if (!ok) { allPass = false; failures++; }
    } else if (k === 'G') {
      const ok = passN >= Math.ceil(SEEDS * 0.9);
      pooled = { ok, text: `${passN}/${SEEDS} seeds: both pairs top the tally, both drills fire, the pairs get 25%+ of interval items` };
      if (!ok) { allPass = false; failures++; }
    } else if (passN !== SEEDS) { allPass = false; failures++; }
    rows.push({ k, label: SPECS[k].label, passN, first, extra, pooled });
  });
  console.log('\nSimulated learners (' + SEEDS + ' seeds each; detail is seed 1):');
  rows.forEach((r) => {
    if (r.pooled) { console.log(`  ${r.pooled.ok ? 'PASS' : 'FAIL'}  ${r.k} ${r.label.padEnd(16)} ${r.pooled.text}`); console.log('        seed 1: ' + r.first.detail); return; }
    console.log(`  ${r.passN === SEEDS ? 'PASS' : 'FAIL'}  ${r.k} ${r.label.padEnd(16)} ${String(r.passN).padStart(2)}/${SEEDS}  ${r.first.detail}`);
    r.extra.forEach((e) => console.log('        ' + e));
  });
  if (!ONLY || ONLY.includes('A')) console.log(`  note  A: right after the 20-item placement (about one item per move) cross-B and cross-adj were the bottom two on ${CHECKS.A.rankHits}/${SEEDS} seeds; after 1 session ${CHECKS.A.rank1Hits}/${SEEDS}; after 3 sessions the pass line above`);
  return allPass;
}

/* ══════════════ Worked example, phrases, placement, unlock speed ══════════════ */
const P = (p) => `${['low E', 'A', 'D', 'G', 'B', 'high e'][p.s]} fret ${p.f} (${C.noteLabel(p.midi)}, ${p.midi})`;
function printItem(it) {
  const iv = it.interval ? `${it.interval.dir === 'same' ? 'unison' : it.interval.name + ' ' + it.interval.dir} (${it.interval.semis >= 0 ? '+' : ''}${it.interval.semis})` : '-';
  console.log(`  #${it.id} ${it.task.toUpperCase()}  cell ${it.cell}  rung ${it.rung}${it.mode ? '  ' + it.mode : ''}`);
  if (it.task === 'match') console.log(`      ref ${it.ref ? P(it.ref) : 'none (free)'}${it.showString ? ' [target string shown]' : ''}\n      target ${P(it.target)}   move ${it.move}   interval ${iv}`);
  if (it.task === 'call') {
    console.log(`      ref ${P(it.ref)}   target ${P(it.target)}   move ${it.move}   interval ${iv}   replay ${it.replayRef}, frets shown ${it.showFrets}${it.timeLimitMs ? ', ' + it.timeLimitMs + ' ms' : ''}`);
    it.choices.forEach((c, i) => console.log(`        ${i === it.answerIndex ? '*' : ' '} ${C.noteLabel(c.midi)} (${c.midi})  ${c.err ? 'distractor tag ' + c.err + ' (' + (c.midi - it.target.midi >= 0 ? '+' : '') + (c.midi - it.target.midi) + ' vs target)' : 'ANSWER'}`));
  }
  if (it.task === 'hear') {
    console.log(`      notes ${it.notes.map((m) => C.noteLabel(m) + ' (' + m + ')').join(' then ')}${it.harmonic ? ' (together)' : ''}   answer ${it.answerName}`);
    it.choices.forEach((c, i) => console.log(`        ${i === it.answerIndex ? '*' : ' '} ${c.name}  ${c.err ? 'tag ' + c.err : 'ANSWER'}`));
  }
  if (it.task === 'play') console.log(`      ref ${P(it.ref)}   asked ${it.interval.name} ${it.dir}${it.showString ? ' on the ' + ['low E', 'A', 'D', 'G', 'B', 'high e'][it.target.s] + ' string' : ' (any string)'}   target ${P(it.target)}`);
  if (it.task === 'note') console.log(`      shown ${it.name}${it.showString ? ' on the ' + ['low E', 'A', 'D', 'G', 'B', 'high e'][it.s] + ' string' : ''}${it.region ? ' in the ' + it.region + ' half' : ''}   target ${P(it.target)}   accepts ${it.accept.length} pitches`);
  if (it.task === 'phrase') {
    console.log(`      key ${it.key.rootName} ${it.key.mode}   first note ${it.showFirst ? 'shown' : 'not shown'}   span ${it.span} frets   biggest leap ${it.maxLeap}`);
    console.log('      ' + it.notes.map((n) => `${n.name}${C.noteOctave(n.midi)} (${['E', 'A', 'D', 'G', 'B', 'e'][n.s]}${n.f})`).join('  '));
  }
}
function workedExample() {
  console.log('\nWorked example: 15 generated items (every pitch and interval is verified against the MIDI table as it prints)');
  const g = (task, key, rung, zones, tier, prov) => { const it = ALL(task, key, rung, zones, tier, prov); C.verifyItem(it); return it; };
  const items = [
    g('match', 'match|same-m|low|lo', 1, 3), g('match', 'match|cross-B|mid|lo', 4, 3), g('match', 'match|free|high|up', 6, 5),
    g('call', 'call|cross-adj|low|lo', 1, 3), g('call', 'call|unison|mid|lo', 2, 3), g('call', 'call|cross-B|mid|lo', 3, 3, 4, 'bString'),
    g('hear', 'hear|m3|up', 1, 1), g('hear', 'hear|P4|up', 2, 1, null), g('hear', 'hear|cmp|up', 5, 1),
    g('play', 'play|P5|up', 1, 3), g('play', 'play|M3|down', 3, 3),
    g('note', 'note|B|5-8', 1, 3), g('note', 'note|highE|13-16', 3, 5),
    g('phrase', 'phrase|2', 2, 3), g('phrase', 'phrase|4', 4, 5)
  ];
  items.forEach(printItem);
  console.log('  (* marks the right answer; "distractor tag" is the error a learner who picks it is making; all ' + items.length + ' items verified)');
}
function phraseSamples() {
  console.log('\nPhrases: two at each rung, with note names (letter+octave, then string+fret)');
  const rng = C.mulberry32(404);
  for (let r = 1; r <= 4; r++) for (let i = 0; i < 2; i++) {
    const it = C.generateItem('phrase', 'phrase|' + r, r, C.makeCtx(rng, r === 1 ? 1 : 5, 4, {}), null); C.verifyItem(it);
    console.log(`  Ph${r}  key ${it.key.rootName} ${it.key.mode}, ${it.notes.length} notes, first note ${it.showFirst ? 'shown' : 'hidden'}, span ${it.span}, biggest leap ${it.maxLeap}`);
    console.log('       ' + it.notes.map((n) => `${n.name}${C.noteOctave(n.midi)} (${['E', 'A', 'D', 'G', 'B', 'e'][n.s]}${n.f})`).join('  '));
  }
}
function placementSample() {
  console.log('\nLearner A (cross-weak) through the placement, seed 1:');
  const run = newRun(SPECS.A, 101 + 65), pl = run.eng.startPlacement(); let n = 0; const lines = [];
  while (!pl.isDone() && n < 100) {
    const it = pl.next(); if (!it) break;
    const out = pl.submit(it, respond(run.L, it)); n++;
    lines.push(`   ${String(n).padStart(2)}. ${it.task.padEnd(6)} ${it.cell.padEnd(28)} rung ${it.rung}  ${out.result.unclear ? 'unclear' : out.result.right ? 'right' : 'wrong'}${out.result.errType ? ' (' + out.result.errType + ')' : ''}`);
  }
  lines.forEach((l) => console.log(l));
  const r = pl.result();
  console.log(`  -> ${r.items} items. Mixed probe ${(r.pMixed * 100).toFixed(0)}% right, branch ${r.branch}. Placed: zone ${r.zone}, tier ${r.tier}, phrase rung Ph${r.phr}.`);
  console.log('     Strong: ' + (r.strengths.map((s) => s.id).join(', ') || '(none perfect)') + '.  Work on next: ' + (r.workOn.map((w) => w.id).join(', ') || '(none)') + '.');
  console.log('     Move ranking now (weakest first): ' + run.eng.moveRank().map((x) => x.move + ' ' + x.m.toFixed(2)).join(', '));
}
function unlockSpeed() {
  console.log('\nUnlock speed for a steady 95% learner from a fresh profile (no placement), 25 items a session, 90 sessions at most (3 seeds; - = not within 90):');
  const variants = [
    ['the work order as written (cell rule, default weights)', { unlock: { granularity: 'cell' } }],
    ['+ coverage weight x2 on cells the step still needs', { unlock: { granularity: 'cell' }, weights: { coverage: 2 } }],
    ['+ coverage x2 and 4 answers per cell instead of 6', { unlock: { granularity: 'cell', minN: 4 }, weights: { coverage: 2 } }],
    ['row pooling (over group) + coverage x2', { unlock: { granularity: 'row' }, weights: { coverage: 2 } }]
  ];
  variants.forEach(([label, over]) => {
    const spec = { label: 'steady', make: (rng) => ({ rng, errMix: () => DEFAULT_ERR, huntWrong: (r) => (r() < 0.8 ? 0 : 1), acc: () => 0.95 }) };
    const rowsOut = [];
    for (let seed = 1; seed <= 3; seed++) {
      const run = newRun(spec, seed * 13, over), when = {};
      for (let s = 1; s <= 90; s++) {
        doSession(run);
        run.events.filter((e) => e.type === 'unlock' && when[e.id] === undefined).forEach((e) => { when[e.id] = s; });
        if (when.Z5 !== undefined && when.T4 !== undefined) break;
      }
      rowsOut.push(when);
    }
    console.log('  ' + label);
    console.log('     ' + ['Z2', 'Z3', 'Z4', 'Z5', 'T2', 'T3', 'T4'].map((id) => id + ' ' + rowsOut.map((w) => (w[id] === undefined ? '-' : w[id])).join('/')).join('   '));
  });
}

/* ══════════════ Main ══════════════ */
runUnits();
console.log('Unit checks:');
unitResults.forEach(([n, okk, d]) => { if (!QUIET || !okk) console.log(`  ${okk ? 'ok  ' : 'FAIL'}  ${n}${d ? '  [' + d + ']' : ''}`); });
if (opt('trace', '')) {
  const [k, sd] = opt('trace', '').split(':'), seed = (+sd || 1) * 101 + k.charCodeAt(0), r = CHECKS[k](seed);
  console.log('\nTrace ' + k + ' seed ' + sd + ': ' + (r.pass ? 'pass' : 'FAIL') + '  ' + r.detail);
  lastRun.sessions.forEach((ss) => {
    const its = lastRun.items.filter((x) => x.session === ss.n), mv = {}, er = [];
    its.forEach((x) => { if (x.move) mv[x.move] = (mv[x.move] || 0) + 1; if (x.err) er.push(x.err); });
    if (lastRun.eng.moveRank) { /* ranking printed once at the end */ }
    console.log(`  s${ss.n}: ${its.length} items; moves ${Object.keys(mv).map((m) => m + ':' + mv[m]).join(' ')}; errors [${er.join(',')}]; events ${ss.events.filter((e) => e.type !== 'lessonShown' && e.type !== 'contrastShown').map((e) => e.type + ':' + (e.card || e.id || (e.pair || []).join('/'))).join(' ')}`);
  });
  console.log('  final move ranking (weakest first): ' + lastRun.eng.moveRank().map((x) => x.move + ' m=' + x.m.toFixed(2) + ' n=' + x.n.toFixed(0)).join(', '));
  process.exit(0);
}
if (flag('example') && !flag('all')) { workedExample(); phraseSamples(); }
else if (flag('unlock-speed') && !flag('all')) unlockSpeed();
else {
  runLearners();
  if (flag('all')) { workedExample(); phraseSamples(); placementSample(); unlockSpeed(); }
}
console.log('\n' + (failures ? failures + ' FAILURE(S)' : 'All checks passed') + (QUIET ? '' : '.'));
process.exit(failures ? 1 : 0);
