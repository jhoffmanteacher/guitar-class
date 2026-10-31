/* ══════════════════════════════════════════════════════════════════════
   trainer-core.js — "Hear It First": the pure logic of the ear + fretboard
   trainer. NO DOM, NO Web Audio, NO Firebase, NO prose. Everything the
   screens need comes back as plain data (pitches, keys, tags, scores,
   events); the English text lives in trainer-ui.js.

   Loads two ways, like guitar-diagrams.js: as a classic <script> (one global,
   HIF_CORE) and from Node (require) so tools/trainer-sim.mjs can run the
   real engine against simulated learners. Nothing here touches a site
   global. Randomness and the clock are injected: createEngine({ rng, now }).

   Work order: WO-hear-it-first.md (not in the repo). Section numbers in the
   comments (4.1, 4.2 …) are that file's.

   ── Conventions ──
   Strings are indexed 0..5 = low E, A, D, G, B, high e (the site's coach.js
   numbers them 6..1; the adapter converts). A position is { s, f, midi }.
   A cell key is 'task|a|b|c' (4.3). Keys are data, never shown to a student.

   ── Interpretations (the work order is silent or ambiguous; each is also
      listed in the Phase 1 report) ──
   I1  skip = 2+ strings apart and up to 4 frets apart; shift = 5+ frets and
       1+ strings. (4.3 says skip ≤3 and shift ≥5, which leaves 4 open.)
   I2  octave beats every other move: any pair 12 semitones apart is
       'octave', even on one string (12 frets) or one string over.
   I3  neck = 'up' when the higher of the two frets is 13+, else 'lo'.
       Fret 12 is 'lo'. A Z4 item always has a fret from 12 to 20.
   I4  A free item (no reference) takes its group and neck from the target.
   I5  Hunt: 1.0 = at most 1 wrong note and 10 s or less; 0.75 = at most 3
       wrong notes; 0.4 = matched after more; 0 = no match in 30 s / gave up.
   I6  Hear/Play rungs: the cell's kind carries the rung (up 1..2, down 3,
       harmonic 4, compound 5 for Hear; up 1..5, down 3..5, compound 4..5 for
       Play). A rung is a difficulty step inside a cell, not a task-wide dial.
   I7  A rung goes up after 3 right in a row (4 for the second step, 5 for the
       third) ONLY while the cell's mastery is 0.6 or better, so a guesser's
       lucky run can't climb; down after 2 wrong in a row.
   I8  A remediation fires on 3 wrong in one cell, or 3 wrong on one move (one
       interval for Hear/Play), in a session; or when the newest error type
       is also one of the previous two, counted over the session or over one
       move, ignoring right answers between. Each lesson card shows at most
       once per session. (4.7 says 'twice in a row'; with one error in a
       dozen items that never fires in time.)
   I9  Zone unlock: every match/call cell new in the newest zone has
       m >= 0.75 with n >= 6, and each of its moves has Match-it mastery
       0.6+. 'row' granularity (pool over group) is a config switch.
   I10 Placement answers go through the normal update and nothing else: a
       lucky answer in the 20-item probe never sets a rung.
   I11 A cell with little data (n < 3) borrows its weakness from its move
       (Match/Call) or its interval (Hear/Play) for the picking weight, so a
       weak move is found in a session or two, not cell by cell. An interval
       in a confusion pair seen twice is picked 1.5x as often.
   ══════════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HIF_CORE = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── Small utilities ── */
  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      var t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function rint(rng, a, b) { return a + Math.floor(rng() * (b - a + 1)); }
  function pickOne(rng, arr) { return arr[Math.floor(rng() * arr.length)]; }
  function shuffled(rng, arr) {
    var a = arr.slice(), i, j, t;
    for (i = a.length - 1; i > 0; i--) { j = Math.floor(rng() * (i + 1)); t = a[i]; a[i] = a[j]; a[j] = t; }
    return a;
  }
  function weightedPick(rng, items, wfn) {
    var ws = items.map(wfn), total = 0, i;
    for (i = 0; i < ws.length; i++) { if (!(ws[i] > 0)) ws[i] = 0; total += ws[i]; }
    if (total <= 0) return items[Math.floor(rng() * items.length)];
    var r = rng() * total;
    for (i = 0; i < ws.length; i++) { r -= ws[i]; if (r < 0) return items[i]; }
    return items[items.length - 1];
  }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function dayStr(ms) { return new Date(ms).toISOString().slice(0, 10); }
  function daysBetween(a, b) {
    return Math.round((Date.parse(b + 'T00:00:00Z') - Date.parse(a + 'T00:00:00Z')) / 86400000);
  }
  function uniq(arr) { var seen = {}; return arr.filter(function (x) { if (seen[x]) return false; seen[x] = 1; return true; }); }

  /* ── 4.1 Pitch math ── */
  var OPEN = [40, 45, 50, 55, 59, 64];
  var STRING_KEYS = ['lowE', 'A', 'D', 'G', 'B', 'highE'];
  var SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var FLAT = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
  var MIDI_LO = 40, MIDI_HI = 84, FRET_MAX = 20;

  function midiAt(s, f) { return OPEN[s] + f; }
  function mkPos(s, f) { return { s: s, f: f, midi: OPEN[s] + f }; }
  function noteName(m, flat) { return (flat ? FLAT : SHARP)[((m % 12) + 12) % 12]; }
  function noteOctave(m) { return Math.floor(m / 12) - 1; }
  function noteLabel(m, flat) { return noteName(m, flat) + noteOctave(m); }
  function isAccidental(m) { var pc = ((m % 12) + 12) % 12; return pc === 1 || pc === 3 || pc === 6 || pc === 8 || pc === 10; }

  /* 4.1 Mic judging. x is a fractional MIDI reading. The nearest note counts
     when it is within 45 cents; 45–50 cents is unclear and is not graded. */
  function readPitch(x) {
    if (typeof x !== 'number' || !isFinite(x)) return { unclear: true };
    var m = Math.round(x), off = (x - m) * 100;
    var cents = Math.round(off * 10) / 10;
    if (Math.abs(off) > 45 + 1e-6) return { unclear: true, midi: m, cents: cents };
    return { midi: m, cents: cents };
  }
  /* The median of the stable frames (light vibrato still reads). Frames that
     spread more than 0.6 semitone are not a stable reading. */
  function medianJudge(frames) {
    if (!frames || !frames.length) return { unclear: true };
    var s = frames.slice().sort(function (a, b) { return a - b; });
    var mid = s.length >> 1;
    var med = s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
    if (s[s.length - 1] - s[0] > 0.6) return { unclear: true };
    return readPitch(med);
  }

  /* ── Intervals (4.1) ── */
  var IVL = ['P1', 'm2', 'M2', 'm3', 'M3', 'P4', 'TT', 'P5', 'm6', 'M6', 'm7', 'M7', 'P8'];
  var SIMPLE_NAMES = IVL.slice(1);
  function ivlInfo(semis) {
    var a = Math.abs(semis);
    if (a <= 12) return { name: IVL[a], simple: IVL[a], cmp: false, semis: a };
    if (a <= 24) return { name: IVL[a - 12] + ' + octave', simple: IVL[a - 12], cmp: true, semis: a };
    return { name: a + ' semitones', simple: null, cmp: true, semis: a };
  }
  function ivlOf(fromMidi, toMidi) {
    var d = toMidi - fromMidi, info = ivlInfo(d);
    return { semis: d, abs: Math.abs(d), name: info.name, simple: info.simple, cmp: info.cmp,
             dir: d > 0 ? 'up' : d < 0 ? 'down' : 'same' };
  }
  function semisOfName(name) { return IVL.indexOf(name); }
  /* 4.2 Hear-the-interval confusion pairs. */
  var CONF_GROUPS = [['m3', 'M3'], ['P4', 'P5', 'TT'], ['m6', 'M6'], ['m7', 'M7'], ['M7', 'P8']];
  function confPartners(name) {
    var out = [];
    CONF_GROUPS.forEach(function (g) {
      if (g.indexOf(name) >= 0) g.forEach(function (n) { if (n !== name && out.indexOf(n) < 0) out.push(n); });
    });
    return out;
  }
  function pairId(a, b) { return [a, b].sort().join('/'); }
  /* Only simple intervals (m2..P8) form a confusion pair: a played unison or a
     compound name has no cell to drill. */
  function isSimpleName(n) { return SIMPLE_NAMES.indexOf(n) >= 0; }

  /* 4.5 Interval tier ladder. */
  var T1_UP = ['M2', 'm3', 'M3', 'P4', 'P5', 'P8'];
  var T2_UP_ADD = ['m2', 'M6', 'm7'];
  var T3_UP_ADD = ['TT', 'm6', 'M7'];
  function bySemis(a, b) { return semisOfName(a) - semisOfName(b); }
  function tierNames(tierIdx, dir) {
    var up = T1_UP.slice();
    if (tierIdx >= 2) up = up.concat(T2_UP_ADD);
    if (tierIdx >= 3) up = up.concat(T3_UP_ADD);
    if (dir === 'up') return up.sort(bySemis);
    if (dir === 'down') {
      if (tierIdx < 2) return [];
      return tierIdx >= 3 ? SIMPLE_NAMES.slice() : T1_UP.slice().sort(bySemis);
    }
    return SIMPLE_NAMES.slice();
  }

  /* ── 4.3 Moves ── */
  function groupOf(s) { return s <= 1 ? 'low' : s <= 3 ? 'mid' : 'high'; }
  /* The G–B gap is four semitones where every other gap is five. A move
     crosses it when one string is G or thicker and the other is B or thinner. */
  function crossesB(s1, s2) { var lo = Math.min(s1, s2), hi = Math.max(s1, s2); return lo <= 3 && hi >= 4; }
  /* What the 5-fret rule would play instead: one semitone low going to
     thinner strings, one high going to thicker (4.4 bString). */
  function bShift(a, b) {
    if (!crossesB(a.s, b.s)) return 0;
    return b.s > a.s ? -1 : 1;
  }
  function classifyMove(a, b) {
    var d = b.midi - a.midi, ds = Math.abs(b.s - a.s), df = Math.abs(b.f - a.f);
    if (d === 0) return ds === 0 ? null : 'unison';
    if (Math.abs(d) === 12) return 'octave';
    if (ds === 0) return df <= 2 ? 'same-s' : df <= 5 ? 'same-m' : df <= 12 ? 'same-l' : null;
    if (df >= 5) return 'shift';
    if (ds === 1) return crossesB(a.s, b.s) ? 'cross-B' : 'cross-adj';
    return 'skip';
  }
  function neckOf(a, b) { return Math.max(a.f, b.f) >= 13 ? 'up' : 'lo'; }
  function bandOf(f) { return f <= 4 ? '0-4' : f <= 8 ? '5-8' : f <= 12 ? '9-12' : f <= 16 ? '13-16' : '17-20'; }

  /* ── 4.5 Zone ladder ── */
  var ZONE_ORDER = ['Z1', 'Z2', 'Z3', 'Z4', 'Z5'];
  var BASE_MOVES = ['same-s', 'same-m', 'same-l', 'cross-adj', 'unison'];
  var Z3_MOVES = BASE_MOVES.concat(['octave', 'skip', 'cross-B']);
  var ZONES = {
    Z1: { strings: [0, 1], lo: 0, hi: 12, moves: BASE_MOVES },
    Z2: { strings: [0, 1, 2, 3], lo: 0, hi: 12, moves: BASE_MOVES.concat(['octave', 'skip']) },
    Z3: { strings: [0, 1, 2, 3, 4, 5], lo: 0, hi: 12, moves: Z3_MOVES },
    Z4: { strings: [0, 1, 2, 3, 4, 5], lo: 12, hi: 20, moves: Z3_MOVES },
    Z5: { strings: [0, 1, 2, 3, 4, 5], lo: 0, hi: 20, moves: Z3_MOVES.concat(['shift']) }
  };
  var MAX_MOVE_SEMIS = 24;
  var _zoneCache = {};
  function zoneData(zi) {
    if (_zoneCache[zi]) return _zoneCache[zi];
    var z = ZONES[ZONE_ORDER[zi - 1]], pos = [], allowed = {}, byKey = {}, i, j;
    z.strings.forEach(function (s) { for (var f = z.lo; f <= z.hi; f++) pos.push(mkPos(s, f)); });
    z.moves.forEach(function (m) { allowed[m] = true; });
    for (i = 0; i < pos.length; i++) {
      for (j = 0; j < pos.length; j++) {
        if (i === j) continue;
        var a = pos[i], b = pos[j], d = b.midi - a.midi;
        if (Math.abs(d) > MAX_MOVE_SEMIS) continue;
        var mv = classifyMove(a, b);
        if (!mv || !allowed[mv]) continue;
        var key = mv + '|' + groupOf(a.s) + '|' + neckOf(a, b);
        (byKey[key] = byKey[key] || []).push({ a: a, b: b, move: mv, d: d });
      }
    }
    return (_zoneCache[zi] = { positions: pos, byKey: byKey });
  }
  var _unionCache = {};
  /* The pool an item may draw from: the union of the windows in `zones`
     (1-based zone numbers). Z1..Zk is the normal case; the placement's Z4
     probe asks for [4] alone. */
  function unionData(zones) {
    var k = zones.join(',');
    if (_unionCache[k]) return _unionCache[k];
    var seenP = {}, seenPair = {}, positions = [], byKey = {}, byMidi = {};
    zones.forEach(function (zi) {
      var zd = zoneData(zi);
      zd.positions.forEach(function (p) {
        var pk = p.s * 100 + p.f;
        if (seenP[pk]) return;
        seenP[pk] = 1; positions.push(p);
        (byMidi[p.midi] = byMidi[p.midi] || []).push(p);
      });
      Object.keys(zd.byKey).forEach(function (key) {
        zd.byKey[key].forEach(function (pr) {
          var ik = pr.a.s + ':' + pr.a.f + '>' + pr.b.s + ':' + pr.b.f;
          if (seenPair[ik]) return;
          seenPair[ik] = 1;
          (byKey[key] = byKey[key] || []).push(pr);
        });
      });
    });
    return (_unionCache[k] = { positions: positions, byKey: byKey, byMidi: byMidi, zones: zones });
  }
  function prefixZones(k) { var a = [], i; for (i = 1; i <= k; i++) a.push(i); return a; }

  /* ── Cell catalog (4.3) ── */
  var _cat = null, _lookup = null, _zoneLists = null;
  function catalog() {
    if (_cat) return _cat;
    var cat = { match: {}, call: {}, note: {} }, zi;
    for (zi = 1; zi <= 5; zi++) {
      var zd = zoneData(zi);
      Object.keys(zd.byKey).forEach(function (mgn) {
        var p = mgn.split('|');
        ['match', 'call'].forEach(function (task) {
          var key = task + '|' + mgn;
          if (!cat[task][key]) cat[task][key] = { key: key, task: task, move: p[0], group: p[1], neck: p[2], intro: zi };
        });
      });
      zd.positions.forEach(function (pos) {
        var g = groupOf(pos.s), n = pos.f >= 13 ? 'up' : 'lo';
        var fk = 'match|free|' + g + '|' + n;
        if (!cat.match[fk]) cat.match[fk] = { key: fk, task: 'match', move: 'free', group: g, neck: n, intro: zi };
        var nk = 'note|' + STRING_KEYS[pos.s] + '|' + bandOf(pos.f);
        if (!cat.note[nk]) cat.note[nk] = { key: nk, task: 'note', s: pos.s, band: bandOf(pos.f), intro: zi };
      });
    }
    return (_cat = cat);
  }
  var _icat = null;
  function intervalCatalog() {
    if (_icat) return _icat;
    var cat = { hear: [], play: [] };
    function add(task, ivl, dir, intro) {
      cat[task].push({ key: task + '|' + ivl + '|' + dir, task: task, ivl: ivl, dir: dir, intro: intro });
    }
    ['hear', 'play'].forEach(function (task) {
      T1_UP.forEach(function (n) { add(task, n, 'up', 1); });
      T2_UP_ADD.forEach(function (n) { add(task, n, 'up', 2); });
      T1_UP.forEach(function (n) { add(task, n, 'down', 2); });
      T3_UP_ADD.forEach(function (n) { add(task, n, 'up', 3); });
      T2_UP_ADD.concat(T3_UP_ADD).forEach(function (n) { add(task, n, 'down', 3); });
      if (task === 'hear') SIMPLE_NAMES.forEach(function (n) { add(task, n, 'harm', 4); });
      add(task, 'cmp', 'up', 4);
      add(task, 'cmp', 'down', 4);
    });
    return (_icat = cat);
  }
  function zoneCellList(task) {
    if (!_zoneLists) {
      var c = catalog();
      _zoneLists = {};
      ['match', 'call', 'note'].forEach(function (t) { _zoneLists[t] = Object.keys(c[t]).map(function (k) { return c[t][k]; }); });
    }
    return _zoneLists[task];
  }
  var PHRASE_COUNT = 4;
  function metaOf(key) {
    if (!_lookup) {
      _lookup = {};
      ['match', 'call', 'note'].forEach(function (t) { zoneCellList(t).forEach(function (m) { _lookup[m.key] = m; }); });
      ['hear', 'play'].forEach(function (t) { intervalCatalog()[t].forEach(function (m) { _lookup[m.key] = m; }); });
      for (var r = 1; r <= PHRASE_COUNT; r++) _lookup['phrase|' + r] = { key: 'phrase|' + r, task: 'phrase', rung: r, intro: r };
    }
    return _lookup[key] || null;
  }

  /* 4.2 Rungs are stored per cell; each kind of cell lives in a range (I6). */
  function rungRange(key) {
    var p = key.split('|'), task = p[0];
    if (task === 'match') return p[1] === 'free' ? [5, 6] : [1, 4];
    if (task === 'call') return [1, 5];
    if (task === 'note') return [1, 4];
    if (task === 'phrase') return [+p[1], +p[1]];
    var ivl = p[1], dir = p[2];
    if (task === 'hear') {
      if (dir === 'harm') return [4, 4];
      if (ivl === 'cmp') return [5, 5];
      if (dir === 'down') return [3, 3];
      return [1, 2];
    }
    if (ivl === 'cmp') return [4, 5];
    return dir === 'down' ? [3, 5] : [1, 5];
  }

  /* ── 4.4 Error types ── */
  var HIST_CODE = { octave: 'o', bString: 'b', wrongDir: 'w', ivlConfuse: 'i', off1: '1', off2: '2', other: 'x', posError: 'p' };
  var HIST_NAME = {};
  Object.keys(HIST_CODE).forEach(function (k) { HIST_NAME[HIST_CODE[k]] = k; });

  /* played is a MIDI number. item.target / item.ref are positions. */
  function classifyError(item, played) {
    var target = item.target, ref = item.ref || null, t = target.midi, d = played - t;
    if (Math.abs(d) === 12) return 'octave';
    if (ref && d !== 0 && d === bShift(ref, target)) return 'bString';
    if (ref && Math.sign(played - ref.midi) * Math.sign(t - ref.midi) < 0) return 'wrongDir';
    if (item.task === 'play') return 'ivlConfuse';
    if (Math.abs(d) === 1) return 'off1';
    if (Math.abs(d) === 2) return 'off2';
    return 'other';
  }
  /* The distractor a given error type would produce (Call it, 4.2/4.4). */
  function errMidis(err, ref, target) {
    var t = target.midi, c = [];
    if (err === 'octave') c = [t + 12, t - 12];
    else if (err === 'bString') { if (ref && crossesB(ref.s, target.s)) c = [t + bShift(ref, target)]; }
    else if (err === 'wrongDir') { if (ref) c = [2 * ref.midi - t]; }
    else if (err === 'off1') c = [t + 1, t - 1];
    else if (err === 'off2') c = [t + 2, t - 2];
    return c.filter(function (m) { return m >= MIDI_LO && m <= MIDI_HI && m !== t; });
  }

  /* ── Config ── */
  var CONFIG_DEFAULT = {
    sessionItems: 25,
    mix: { match: 0.30, call: 0.20, phrase: 0.15, hear: 0.15, play: 0.10, note: 0.10 },
    mixShift: 0.10,
    weights: { solid: 0.25, masteredStale: 0.3, masteredFresh: 0.05, newNewest: 0.4, newOld: 0.25, workOn: 0.3, errBoost: 1.5, coverage: 1 },
    errWindow: 10,
    errMin: 3,
    kFloor: 0.2,
    status: { newN: 3, learnM: 0.6, solidM: 0.85, masteredN: 8 },
    unlock: { minM: 0.75, minN: 6, matchM: 0.6, granularity: 'cell' },
    rung: { up: 3, down: 2, upMinM: 0.6 },
    decay: { perDay: 0.02, floor: 0.5 },
    fluentMs: { match: 6000, call: 4000, hear: 5000, play: 8000, note: 6000 },
    timedMs: { call: 4000, play: 5000, note: 5000 },
    hunt: { fastMs: 10000, maxMs: 30000, fastWrong: 1, okWrong: 3 },
    interleave: { cellRun: 3, taskRun: 4 },
    remed: { wrongInCell: 3, scaffolds: 2, contrastCount: 3, contrastReps: 3, contrastItems: 4 }
  };
  function mergeConfig(over) {
    var out = JSON.parse(JSON.stringify(CONFIG_DEFAULT));
    if (!over) return out;
    Object.keys(over).forEach(function (k) {
      if (over[k] && typeof over[k] === 'object' && !Array.isArray(over[k])) Object.keys(over[k]).forEach(function (j) { out[k][j] = over[k][j]; });
      else out[k] = over[k];
    });
    return out;
  }

  /* ── Item generators ── */
  var idSeq = 0;
  function parseMatchCell(key) { var p = key.split('|'); return { task: p[0], move: p[1], group: p[2], neck: p[3], mgn: p.slice(1).join('|') }; }
  function makeCtx(rng, zoneIdx, tierIdx, extra) {
    var c = { rng: rng, zones: prefixZones(zoneIdx), zoneIdx: zoneIdx, tierIdx: tierIdx || 1, cellState: null };
    if (extra) Object.keys(extra).forEach(function (k) { c[k] = extra[k]; });
    return c;
  }
  function baseItem(task, key, rung, extra) {
    var it = { kind: 'item', id: ++idSeq, task: task, cell: key, rung: rung, scaffold: null, review: false, provoke: null };
    Object.keys(extra).forEach(function (k) { it[k] = extra[k]; });
    return it;
  }
  function provokeOK(err, pr) {
    if (err === 'bString') return crossesB(pr.a.s, pr.b.s);
    if (err === 'wrongDir') { var mir = 2 * pr.a.midi - pr.b.midi; return mir >= MIDI_LO && mir <= MIDI_HI && mir !== pr.b.midi; }
    if (err === 'octave') return pr.b.midi + 12 <= MIDI_HI || pr.b.midi - 12 >= MIDI_LO;
    return true;
  }
  function pickPair(ctx, mgn, provoke) {
    var list = unionData(ctx.zones).byKey[mgn];
    if (!list || !list.length) return null;
    var use = list;
    if (provoke) { var f = list.filter(function (pr) { return provokeOK(provoke, pr); }); if (f.length) use = f; }
    return pickOne(ctx.rng, use);
  }

  function genMatch(ctx, key, rung, provoke) {
    var m = parseMatchCell(key), rng = ctx.rng, ref = null, target, pr;
    var mode = (rung === 1 || rung === 2 || rung === 5) ? 'hunt' : 'oneshot';
    if (m.move === 'free') {
      var cands = unionData(ctx.zones).positions.filter(function (p) {
        return groupOf(p.s) === m.group && (p.f >= 13 ? 'up' : 'lo') === m.neck;
      });
      target = pickOne(rng, cands);
    } else {
      pr = pickPair(ctx, m.mgn, provoke);
      if (!pr) throw new Error('no pair for ' + key);
      ref = pr.a; target = pr.b;
    }
    return baseItem('match', key, rung, {
      mode: mode, ref: ref, target: target, move: m.move, group: m.group, neck: m.neck,
      showRef: !!ref, playRef: !!ref, showString: !!ref && (rung === 1 || rung === 3),
      interval: ref ? ivlOf(ref.midi, target.midi) : null,
      accept: [target.midi], provoke: provoke || null
    });
  }

  function buildCallChoices(ctx, ref, target, rung, cellState, provoke) {
    var rng = ctx.rng, t = target.midi, used = {}, ds = [];
    used[t] = 1;
    var probe = { task: 'call', target: target, ref: ref };
    function add(m) {
      if (m < MIDI_LO || m > MIDI_HI || used[m]) return false;
      used[m] = 1; ds.push({ midi: m, err: classifyError(probe, m) });
      return true;
    }
    function addFar() {
      var g = 0;
      while (g++ < 60) { var m = t + rint(rng, -12, 12); if (Math.abs(m - t) >= 3 && add(m)) return true; }
      for (var k = 3; k <= 40; k++) { if (add(t + k) || add(t - k)) return true; }
      return false;
    }
    var want = rung <= 2 ? 2 : 3;
    if (rung <= 1) { while (ds.length < want) addFar(); }
    else if (rung === 2) {
      var near = shuffled(rng, [t + 1, t - 1, t + 2, t - 2]);
      for (var i = 0; i < near.length && ds.length < 1; i++) add(near[i]);
      while (ds.length < want) addFar();
    } else {
      var order = [], errs = (cellState && cellState.err) || {};
      var seen = Object.keys(errs).filter(function (e) { return ['octave', 'bString', 'wrongDir', 'off1', 'off2'].indexOf(e) >= 0; })
        .sort(function (x, y) { return errs[y] - errs[x]; });
      if (provoke && seen.indexOf(provoke) < 0) seen.unshift(provoke);
      order = uniq(seen.concat(['off1', 'octave', 'off2', 'wrongDir', 'bString']));
      var pass;
      for (pass = 0; pass < 2 && ds.length < want; pass++) {
        order.forEach(function (e) {
          if (ds.length >= want) return;
          var cs = shuffled(rng, errMidis(e, ref, target));
          if (cs.length > pass) add(cs[pass]);
        });
      }
      while (ds.length < want) addFar();
    }
    var all = shuffled(rng, [{ midi: t, err: null }].concat(ds));
    var answerIndex = 0;
    all.forEach(function (c, ix) { if (c.err === null && c.midi === t) answerIndex = ix; });
    return { choices: all, answerIndex: answerIndex };
  }

  function genCall(ctx, key, rung, provoke) {
    var m = parseMatchCell(key), pr = pickPair(ctx, m.mgn, provoke);
    if (!pr) throw new Error('no pair for ' + key);
    var ch = buildCallChoices(ctx, pr.a, pr.b, rung, ctx.cellState, provoke);
    return baseItem('call', key, rung, {
      ref: pr.a, target: pr.b, move: m.move, group: m.group, neck: m.neck,
      interval: ivlOf(pr.a.midi, pr.b.midi), choices: ch.choices, answerIndex: ch.answerIndex,
      replayRef: rung < 4, showFrets: rung < 4, timeLimitMs: rung >= 5 ? CONFIG_DEFAULT.timedMs.call : null,
      accept: [pr.b.midi], provoke: provoke || null
    });
  }

  function hearChoices(ctx, semis, dir, rung, tierIdx, mustInclude) {
    var rng = ctx.rng, info = ivlInfo(semis), ans = info.name, out = [{ name: ans, err: null }], used = {};
    used[ans] = 1;
    function add(name, err) { if (used[name] || out.length >= 4) return; used[name] = 1; out.push({ name: name, err: err }); }
    var plus = ' + octave';
    if (info.cmp) {
      add(info.simple, 'octave');
      confPartners(info.simple).forEach(function (p) { add(p + plus, 'ivlConfuse'); });
      shuffled(rng, SIMPLE_NAMES).forEach(function (n) { add(n + plus, 'ivlConfuse'); });
    } else {
      var allowed = tierNames(tierIdx, dir).filter(function (n) { return n !== ans; });
      (mustInclude || []).forEach(function (n) { add(n, 'ivlConfuse'); });
      if (rung >= 2) shuffled(rng, confPartners(ans).filter(function (n) { return allowed.indexOf(n) >= 0; })).slice(0, 2).forEach(function (n) { add(n, 'ivlConfuse'); });
      var far = shuffled(rng, allowed.filter(function (n) { return Math.abs(semisOfName(n) - semis) >= 3; }));
      far.forEach(function (n) { add(n, 'ivlConfuse'); });
      shuffled(rng, allowed).forEach(function (n) { add(n, 'ivlConfuse'); });
      shuffled(rng, SIMPLE_NAMES).forEach(function (n) { add(n, 'ivlConfuse'); });
    }
    var all = shuffled(rng, out), answerIndex = 0;
    all.forEach(function (c, ix) { if (c.err === null) answerIndex = ix; });
    return { choices: all, answerIndex: answerIndex };
  }

  function genHear(ctx, key, rung, provoke, opt) {
    opt = opt || {};
    var p = key.split('|'), ivl = p[1], dir = p[2], rng = ctx.rng;
    var semis = opt.semis != null ? opt.semis : (ivl === 'cmp' ? rint(rng, 13, 24) : semisOfName(ivl));
    var lo, hi, root;
    if (dir === 'down') { lo = Math.max(MIDI_LO + semis, 50); hi = Math.min(MIDI_HI, 76); if (lo > hi) { lo = MIDI_LO + semis; hi = MIDI_HI; } }
    else { lo = 45; hi = Math.min(MIDI_HI - semis, 72); if (lo > hi) { lo = MIDI_LO; hi = MIDI_HI - semis; } }
    root = rint(rng, lo, hi);
    var second = dir === 'down' ? root - semis : root + semis;
    var ch = hearChoices(ctx, semis, dir, rung, opt.tierIdx || ctx.tierIdx, opt.mustInclude);
    var info = ivlInfo(semis);
    return baseItem('hear', key, rung, {
      dir: dir, notes: [root, second], harmonic: dir === 'harm', interval: { semis: second - root, abs: semis, name: info.name, simple: info.simple, cmp: info.cmp, dir: dir },
      answerName: info.name, choices: ch.choices, answerIndex: ch.answerIndex, provoke: provoke || null
    });
  }

  /* The semitone counts a Play cell can use inside the unlocked frets. A fixed
     interval has one; a compound cell may use 13..24. Narrow zones leave some
     compound sizes with no reference spot, so the choice is made from these. */
  function playRefs(u, dir, semis) {
    return u.positions.filter(function (rp) {
      var tm = dir === 'down' ? rp.midi - semis : rp.midi + semis;
      return tm >= MIDI_LO && tm <= MIDI_HI && u.byMidi[tm];
    });
  }
  function playSemisList(ivl) {
    if (ivl !== 'cmp') return [semisOfName(ivl)];
    var out = [], i;
    for (i = 13; i <= 24; i++) out.push(i);
    return out;
  }
  var _playFeas = {};
  function playFeasible(meta, zoneIdx) {
    var ck = zoneIdx + ':' + meta.key;
    if (ck in _playFeas) return _playFeas[ck];
    var u = unionData(prefixZones(zoneIdx));
    return (_playFeas[ck] = playSemisList(meta.ivl).some(function (sm) { return playRefs(u, meta.dir, sm).length > 0; }));
  }
  function genPlay(ctx, key, rung, provoke) {
    var p = key.split('|'), ivl = p[1], dir = p[2], rng = ctx.rng, u = unionData(ctx.zones);
    var semis = null, refs = [], list = shuffled(rng, playSemisList(ivl)), i;
    for (i = 0; i < list.length && !refs.length; i++) { semis = list[i]; refs = playRefs(u, dir, semis); }
    if (!refs.length) throw new Error('no reference for ' + key);
    var ref = pickOne(rng, refs), tm = dir === 'down' ? ref.midi - semis : ref.midi + semis;
    var target = pickOne(rng, u.byMidi[tm]), info = ivlInfo(semis);
    return baseItem('play', key, rung, {
      dir: dir, ref: ref, target: target, interval: { semis: tm - ref.midi, abs: semis, name: info.name, simple: info.simple, cmp: info.cmp, dir: dir },
      showString: rung <= 1, timeLimitMs: rung >= 5 ? CONFIG_DEFAULT.timedMs.play : null, accept: [tm], provoke: provoke || null
    });
  }

  function genNote(ctx, key, rung, provoke) {
    var p = key.split('|'), s = STRING_KEYS.indexOf(p[1]), band = p[2], rng = ctx.rng;
    var u = unionData(ctx.zones);
    var cands = u.positions.filter(function (q) { return q.s === s && bandOf(q.f) === band; });
    if (!cands.length) throw new Error('no position for ' + key);
    var target = pickOne(rng, cands), pc = target.midi % 12;
    var flat = isAccidental(target.midi) && rng() < 0.5;
    var region = target.f > 12 ? 'up' : 'lo';
    var same = u.positions.filter(function (q) { return q.midi % 12 === pc; });
    var pool;
    if (rung <= 1) pool = same.filter(function (q) { return q.s === s; });
    else if (rung === 3) pool = same.filter(function (q) { return region === 'up' ? q.f >= 12 : q.f <= 12; });
    else pool = same;
    return baseItem('note', key, rung, {
      target: target, name: noteName(target.midi, flat), flat: flat, s: s,
      showString: rung <= 1, region: rung === 3 ? region : null,
      timeLimitMs: rung >= 4 ? CONFIG_DEFAULT.timedMs.note : null,
      accept: uniq(pool.map(function (q) { return q.midi; })), provoke: provoke || null
    });
  }

  /* 4.2 Phrase rungs. Ph2's and Ph4's first note: the work order only says
     Ph1 shows it and Ph3 doesn't, so Ph2 shows and Ph4 doesn't. */
  var PHRASE_RUNGS = {
    1: { len: [3, 3], maxLeap: 2, minLeap: 0, span4: true, firstShown: true },
    2: { len: [3, 4], maxLeap: 7, minLeap: 3, firstShown: true },
    3: { len: [4, 5], maxLeap: 12, minLeap: 5, firstShown: false },
    4: { len: [5, 5], maxLeap: 12, minLeap: 3, minSpan: 4, firstShown: false }
  };
  var SCALES = { major: [0, 2, 4, 5, 7, 9, 11], minor: [0, 2, 3, 5, 7, 8, 10] };
  function bestPath(rng, seq, posList) {
    var byMidi = {};
    posList.forEach(function (p) { (byMidi[p.midi] = byMidi[p.midi] || []).push(p); });
    var cand = seq.map(function (m) { return byMidi[m]; });
    var cost = cand.map(function (c) { return c.map(function () { return 0; }); });
    var from = cand.map(function (c) { return c.map(function () { return -1; }); });
    var i, a, b;
    for (i = 1; i < seq.length; i++) {
      for (b = 0; b < cand[i].length; b++) {
        var best = Infinity, bi = 0;
        for (a = 0; a < cand[i - 1].length; a++) {
          var pa = cand[i - 1][a], pb = cand[i][b];
          var cst = cost[i - 1][a] + Math.abs(pb.f - pa.f) + 1.5 * Math.abs(pb.s - pa.s) + rng() * 0.01;
          if (cst < best) { best = cst; bi = a; }
        }
        cost[i][b] = best; from[i][b] = bi;
      }
    }
    var last = cand.length - 1, bj = 0, bestC = Infinity;
    for (b = 0; b < cand[last].length; b++) if (cost[last][b] < bestC) { bestC = cost[last][b]; bj = b; }
    var path = [];
    for (i = last; i >= 0; i--) { path[i] = cand[i][bj]; bj = from[i][bj]; }
    return path;
  }
  function genPhrase(ctx, rung) {
    var rng = ctx.rng, u = unionData(ctx.zones), cfg = PHRASE_RUNGS[rung], tries = 0;
    var frets = u.positions.map(function (p) { return p.f; });
    var minF = Math.min.apply(null, frets), maxF = Math.max.apply(null, frets);
    while (tries++ < 600) {
      var rootPc = rint(rng, 0, 11), mode = rng() < 0.5 ? 'major' : 'minor', pcs = {};
      SCALES[mode].forEach(function (iv) { pcs[(rootPc + iv) % 12] = 1; });
      var allowedPos = u.positions.filter(function (p) { return pcs[p.midi % 12]; });
      if (cfg.span4) {
        var b0 = rint(rng, minF, Math.max(minF, maxF - 3));
        allowedPos = allowedPos.filter(function (p) { return p.f >= b0 && p.f <= b0 + 3; });
      }
      var pitchSet = uniq(allowedPos.map(function (p) { return p.midi; })).sort(function (x, y) { return x - y; });
      if (pitchSet.length < 5) continue;
      var len = rint(rng, cfg.len[0], cfg.len[1]), seq = [pickOne(rng, pitchSet)], ok = true, i;
      for (i = 1; i < len; i++) {
        var prev = seq[i - 1];
        var nexts = pitchSet.filter(function (m) { var dd = Math.abs(m - prev); return dd >= 1 && dd <= cfg.maxLeap; });
        if (!nexts.length) { ok = false; break; }
        seq.push(pickOne(rng, nexts));
      }
      if (!ok) continue;
      var leaps = seq.slice(1).map(function (m, ix) { return Math.abs(m - seq[ix]); });
      if (cfg.minLeap && Math.max.apply(null, leaps) < cfg.minLeap) continue;
      var path = bestPath(rng, seq, allowedPos);
      var pf = path.map(function (p) { return p.f; });
      var span = Math.max.apply(null, pf) - Math.min.apply(null, pf);
      if (cfg.minSpan != null && span < cfg.minSpan) continue;
      var flatKey = mode === 'minor' ? [1, 3, 6, 8, 10].indexOf((rootPc + 3) % 12) >= 0 : [1, 3, 6, 8, 10].indexOf(rootPc) >= 0;
      var notes = path.map(function (p) { return { midi: p.midi, s: p.s, f: p.f, name: noteName(p.midi, flatKey) }; });
      var pairs = [];
      for (i = 1; i < path.length; i++) {
        var mv = classifyMove(path[i - 1], path[i]);
        var ckey = mv ? 'match|' + mv + '|' + groupOf(path[i - 1].s) + '|' + neckOf(path[i - 1], path[i]) : null;
        if (ckey && !catalog().match[ckey]) ckey = null;
        pairs.push({ move: mv, key: ckey, from: i - 1, to: i });
      }
      return baseItem('phrase', 'phrase|' + rung, rung, {
        key: { root: rootPc, rootName: noteName(rootPc, flatKey), mode: mode }, notes: notes, pairs: pairs,
        showFirst: cfg.firstShown, span: span, maxLeap: Math.max.apply(null, leaps), accept: null
      });
    }
    throw new Error('phrase generation failed at Ph' + rung);
  }

  function generateItem(task, key, rung, ctx, provoke, opt) {
    if (task === 'match') return genMatch(ctx, key, rung, provoke);
    if (task === 'call') return genCall(ctx, key, rung, provoke);
    if (task === 'hear') return genHear(ctx, key, rung, provoke, opt);
    if (task === 'play') return genPlay(ctx, key, rung, provoke);
    if (task === 'note') return genNote(ctx, key, rung, provoke);
    if (task === 'phrase') return genPhrase(ctx, rung);
    throw new Error('unknown task ' + task);
  }

  /* ── Grading (4.2, 4.4, 4.7) ── */
  function fluentScore(cfg, task, ms) {
    var lim = cfg.fluentMs[task];
    return (ms == null || ms <= lim) ? 1 : 0.75;
  }
  function gradeItem(item, ans, cfg) {
    cfg = cfg || CONFIG_DEFAULT;
    ans = ans || {};
    var res = { task: item.task, unclear: false, correct: false, right: false, score: 0, errType: null, pair: null, posError: false, ms: ans.ms == null ? null : ans.ms };
    var played, r;
    if (item.task === 'match') {
      if (ans.unclear) return { unclear: true, task: 'match' };
      var t = item.target.midi, tries = ans.tries || [];
      if (item.mode === 'hunt') {
        var matched = !!ans.matched && !ans.gaveUp, ms = ans.ms == null ? 0 : ans.ms;
        var nWrong = matched ? Math.max(0, tries.length - 1) : tries.length;
        var firstWrong = null, i;
        for (i = 0; i < tries.length; i++) if (tries[i] !== t) { firstWrong = tries[i]; break; }
        if (!matched || ms > cfg.hunt.maxMs) res.score = 0;
        else if (nWrong <= cfg.hunt.fastWrong && ms <= cfg.hunt.fastMs) res.score = 1;
        else if (nWrong <= cfg.hunt.okWrong) res.score = 0.75;
        else res.score = 0.4;
        res.correct = res.score > 0;
        res.hunt = { wrong: nWrong, matched: matched };
        if (firstWrong != null) res.errType = classifyError(item, firstWrong);
      } else {
        if (!tries.length) return { unclear: true, task: 'match' };
        played = tries[0];
        res.correct = played === t;
        res.score = res.correct ? fluentScore(cfg, 'match', ans.ms) : 0;
        if (!res.correct) res.errType = classifyError(item, played);
      }
    } else if (item.task === 'call') {
      var ch = null, k;
      for (k = 0; k < item.choices.length; k++) if (item.choices[k].midi === ans.pick) ch = item.choices[k];
      if (!ch) return { unclear: true, task: 'call' };
      res.correct = ch.err === null;
      res.score = res.correct ? fluentScore(cfg, 'call', ans.pickMs != null ? ans.pickMs : ans.ms) : 0;
      if (!res.correct) res.errType = ch.err;
      if (res.correct && typeof ans.played === 'number' && ans.played !== item.target.midi) res.posError = true;
    } else if (item.task === 'hear') {
      var hc = null, h;
      for (h = 0; h < item.choices.length; h++) if (item.choices[h].name === ans.choice) hc = item.choices[h];
      if (!hc) return { unclear: true, task: 'hear' };
      res.correct = hc.err === null;
      res.score = res.correct ? fluentScore(cfg, 'hear', ans.ms) : 0;
      if (!res.correct) {
        res.errType = hc.err;
        if (hc.err === 'ivlConfuse' && isSimpleName(item.answerName) && isSimpleName(hc.name)) res.pair = item.answerName + '>' + hc.name;
      }
    } else if (item.task === 'play') {
      if (typeof ans.played !== 'number') return { unclear: true, task: 'play' };
      res.correct = ans.played === item.target.midi;
      res.score = res.correct ? fluentScore(cfg, 'play', ans.ms) : 0;
      if (!res.correct) {
        res.errType = classifyError(item, ans.played);
        if (res.errType === 'ivlConfuse') {
          var pn = ivlInfo(Math.abs(ans.played - item.ref.midi)).name;
          if (isSimpleName(item.interval.name) && isSimpleName(pn)) res.pair = item.interval.name + '>' + pn;
        }
      }
    } else if (item.task === 'note') {
      if (typeof ans.played !== 'number') return { unclear: true, task: 'note' };
      res.correct = item.accept.indexOf(ans.played) >= 0;
      res.score = res.correct ? fluentScore(cfg, 'note', ans.ms) : 0;
      if (!res.correct) res.errType = classifyError(item, ans.played);
    } else if (item.task === 'phrase') {
      var pl = ans.played || [], graded = 0, right = 0, rights = [], errs = [], n;
      for (n = 0; n < item.notes.length; n++) {
        var pv = pl[n];
        /* undefined = the note timed out (never heard): it counts as missed.
           null = unclear three times: it is not graded. */
        if (pv === undefined) { graded++; rights.push(false); continue; }
        if (pv === null) { rights.push(null); continue; }
        graded++;
        var okn = pv === item.notes[n].midi;
        rights.push(okn);
        if (okn) right++;
        else errs.push(classifyError({ task: 'match', target: item.notes[n], ref: n > 0 ? item.notes[n - 1] : null }, pv));
      }
      if (!graded) return { unclear: true, task: 'phrase' };
      res.score = right / graded;
      res.correct = right > 0;
      res.rights = rights;
      res.noteErrs = errs;
      res.errType = errs.length ? errs[0] : null;
    }
    res.right = res.task === 'phrase' ? res.score >= 0.8 : res.score >= 0.75;
    return res;
  }

  /* ── Item self-check against the MIDI table (used by the sim) ── */
  function verifyItem(item) {
    function bad(msg) { throw new Error('verifyItem #' + item.id + ' ' + item.task + ' ' + item.cell + ': ' + msg); }
    function posOK(p, label) {
      if (!p || p.s < 0 || p.s > 5 || p.f < 0 || p.f > FRET_MAX) bad(label + ' off the neck');
      if (p.midi !== OPEN[p.s] + p.f) bad(label + ' midi ' + p.midi + ' != ' + (OPEN[p.s] + p.f));
    }
    if (item.target && item.task !== 'hear') posOK(item.target, 'target');
    if (item.ref) posOK(item.ref, 'ref');
    if (item.task === 'match' || item.task === 'call') {
      if (item.ref) {
        var mv = classifyMove(item.ref, item.target);
        if (mv !== item.move) bad('move ' + item.move + ' vs ' + mv);
        if (groupOf(item.ref.s) !== item.group) bad('group');
        if (neckOf(item.ref, item.target) !== item.neck) bad('neck');
        if (item.cell.split('|').slice(1).join('|') !== mv + '|' + item.group + '|' + item.neck) bad('cell key');
        if (ivlOf(item.ref.midi, item.target.midi).semis !== item.interval.semis) bad('interval semis');
        if (mv === 'unison' && item.ref.midi !== item.target.midi) bad('unison pitch');
        if (mv === 'octave' && Math.abs(item.ref.midi - item.target.midi) !== 12) bad('octave pitch');
        if (mv === 'cross-B' && Math.abs(item.ref.s - item.target.s) !== 1) bad('cross-B strings');
      } else if (item.move !== 'free') bad('missing ref');
    }
    if (item.task === 'call') {
      var cs = item.choices, mids = cs.map(function (c) { return c.midi; });
      if (cs.length !== (item.rung <= 2 ? 3 : 4)) bad('choice count ' + cs.length);
      if (uniq(mids).length !== cs.length) bad('duplicate choices');
      if (cs[item.answerIndex].midi !== item.target.midi || cs[item.answerIndex].err !== null) bad('answerIndex');
      cs.forEach(function (c) {
        if (c.midi < MIDI_LO || c.midi > MIDI_HI) bad('choice out of range');
        if (c.err !== null && c.err !== classifyError(item, c.midi)) bad('tag ' + c.err + ' vs ' + classifyError(item, c.midi));
        if (c.err === 'octave' && Math.abs(c.midi - item.target.midi) !== 12) bad('octave tag');
        if (c.err === 'bString' && c.midi - item.target.midi !== bShift(item.ref, item.target)) bad('bString tag');
        if (item.rung <= 1 && c.err !== null && Math.abs(c.midi - item.target.midi) < 3) bad('C1 distractor too near');
      });
    }
    if (item.task === 'hear') {
      if (item.notes[1] - item.notes[0] !== item.interval.semis) bad('hear notes vs semis');
      if (ivlInfo(item.interval.abs).name !== item.answerName) bad('answer name');
      if (item.choices.length !== 4) bad('choice count');
      var names = item.choices.map(function (c) { return c.name; });
      if (uniq(names).length !== 4) bad('duplicate names');
      if (item.choices[item.answerIndex].name !== item.answerName) bad('answerIndex');
      item.notes.forEach(function (m) { if (m < MIDI_LO || m > MIDI_HI) bad('note out of range'); });
    }
    if (item.task === 'play') {
      if (item.target.midi - item.ref.midi !== item.interval.semis) bad('play semis');
      if (ivlInfo(item.interval.abs).name !== item.interval.name) bad('play name');
      if (item.accept[0] !== item.target.midi) bad('accept');
    }
    if (item.task === 'note') {
      if (item.accept.indexOf(item.target.midi) < 0) bad('accept lacks target');
      item.accept.forEach(function (m) { if (m % 12 !== item.target.midi % 12) bad('accept pitch class'); });
      if (noteName(item.target.midi, item.flat) !== item.name) bad('name');
    }
    if (item.task === 'phrase') {
      var pcs = {};
      SCALES[item.key.mode].forEach(function (iv) { pcs[(item.key.root + iv) % 12] = 1; });
      var cfg = PHRASE_RUNGS[item.rung];
      if (item.notes.length < cfg.len[0] || item.notes.length > cfg.len[1]) bad('length ' + item.notes.length);
      item.notes.forEach(function (n, i) {
        posOK(n, 'note ' + i);
        if (!pcs[n.midi % 12]) bad('note ' + i + ' out of key');
        if (i > 0) {
          var dd = Math.abs(n.midi - item.notes[i - 1].midi);
          if (dd < 1 || dd > cfg.maxLeap) bad('leap ' + dd + ' over ' + cfg.maxLeap);
        }
      });
      if (cfg.span4 && item.span > 3) bad('span ' + item.span + ' over 4 frets');
      if (cfg.minSpan != null && item.span < cfg.minSpan) bad('span too small');
      if (item.showFirst !== cfg.firstShown) bad('showFirst');
    }
    return true;
  }

  /* ── Profile (section 6) ── */
  function newProfile() {
    return { v: 1, zone: 'Z1', tier: 'T1', unlockedZones: ['Z1'], unlockedTiers: ['T1'], placementDone: null,
             inputDeviceLabel: '', sessions: 0, lastSession: null, cells: {}, conf: {}, workOn: [], phr: 1, drilled: {}, decayDay: null };
  }
  function normalizeProfile(raw) {
    var p = newProfile();
    if (!raw || typeof raw !== 'object') return p;
    ['placementDone', 'inputDeviceLabel', 'sessions', 'lastSession', 'decayDay'].forEach(function (k) { if (raw[k] != null) p[k] = raw[k]; });
    var zi = Math.max(1, Math.min(5, ZONE_ORDER.indexOf(raw.zone) + 1 || 1));
    var ti = Math.max(1, Math.min(4, ['T1', 'T2', 'T3', 'T4'].indexOf(raw.tier) + 1 || 1));
    p.zone = ZONE_ORDER[zi - 1]; p.unlockedZones = ZONE_ORDER.slice(0, zi);
    p.tier = 'T' + ti; p.unlockedTiers = ['T1', 'T2', 'T3', 'T4'].slice(0, ti);
    p.phr = clamp(+raw.phr || 1, 1, PHRASE_COUNT);
    p.conf = raw.conf && typeof raw.conf === 'object' ? JSON.parse(JSON.stringify(raw.conf)) : {};
    p.drilled = raw.drilled && typeof raw.drilled === 'object' ? JSON.parse(JSON.stringify(raw.drilled)) : {};
    p.workOn = Array.isArray(raw.workOn) ? raw.workOn.slice() : [];
    Object.keys(raw.cells || {}).forEach(function (k) {
      var c = raw.cells[k], rr = rungRange(k);
      if (!c || typeof c.m !== 'number') return;
      var err = {};
      Object.keys(c.err || {}).forEach(function (e) { err[HIST_NAME[e] || e] = c.err[e]; });
      var last = c.last || null;
      if (last && /^\d{6}$/.test(last)) last = '20' + last.slice(0, 2) + '-' + last.slice(2, 4) + '-' + last.slice(4, 6);
      p.cells[k] = { m: clamp(c.m, 0, 1), n: Math.max(0, +c.n || 0), r: clamp(+c.r || rr[0], rr[0], rr[1]), last: last,
                     streak: +c.streak || 0, err: err, hist: typeof c.hist === 'string' ? c.hist.slice(-10) : '' };
    });
    return p;
  }
  /* The compact form that gets saved: no per-attempt log, no audio, only
     what the engine reads back. Rounded and trimmed to stay under 30 KB. */
  function serializeProfile(p) {
    var out = { v: p.v, zone: p.zone, tier: p.tier, unlockedZones: p.unlockedZones.slice(), unlockedTiers: p.unlockedTiers.slice(),
                placementDone: p.placementDone, inputDeviceLabel: p.inputDeviceLabel, sessions: p.sessions, lastSession: p.lastSession,
                phr: p.phr, decayDay: p.decayDay, cells: {}, conf: p.conf, workOn: p.workOn, drilled: p.drilled };
    Object.keys(p.cells).forEach(function (k) {
      var c = p.cells[k], o = { m: Math.round(c.m * 1000) / 1000, n: Math.round(c.n * 10) / 10, r: c.r };
      if (c.last) o.last = c.last.slice(2).replace(/-/g, '');
      if (c.streak) o.streak = c.streak;
      var ek = Object.keys(c.err || {});
      if (ek.length) { o.err = {}; ek.forEach(function (e) { o.err[HIST_CODE[e] || e] = c.err[e]; }); }
      if (c.hist) o.hist = c.hist;
      out.cells[k] = o;
    });
    return out;
  }

  /* moveRank shrinks each move toward the class average, as if every move
     had already shown two ordinary answers: one bad answer is not a weak spot. */
  var RANK_PRIOR = 0.7, RANK_PRIOR_W = 2;

  /* ── The engine ── */
  function createEngine(opts) {
    opts = opts || {};
    var cfg = mergeConfig(opts.config);
    var rng = opts.rng || Math.random;
    var nowFn = opts.now || Date.now;
    var profile = opts.profile ? normalizeProfile(opts.profile) : newProfile();
    var session = null, pending = [], recent = [];
    var eng = { cfg: cfg };

    function today() { return dayStr(nowFn()); }
    function zoneIdx() { return profile.unlockedZones.length; }
    function tierIdx() { return profile.unlockedTiers.length; }
    function getCell(key, create) {
      var c = profile.cells[key];
      if (!c && create) {
        var rr = rungRange(key);
        c = profile.cells[key] = { m: 0.5, n: 0, r: rr[0], last: null, streak: 0, err: {}, hist: '' };
      }
      return c || null;
    }
    function statusOf(c) {
      var S = cfg.status;
      if (!c || c.n < S.newN) return 'new';
      if (c.m < S.learnM) return 'learning';
      if (c.m >= S.solidM && c.n >= S.masteredN) return 'mastered';
      return 'solid';
    }
    function topErr(c) {
      if (!c || !c.hist) return null;
      var cnt = {}, best = null, bn = 0, i;
      for (i = 0; i < c.hist.length; i++) {
        var nm = HIST_NAME[c.hist[i]];
        if (!nm) continue;
        cnt[nm] = (cnt[nm] || 0) + 1;
        if (cnt[nm] > bn) { bn = cnt[nm]; best = nm; }
      }
      return bn >= cfg.errMin ? best : null;
    }
    function isNewest(meta) {
      if (meta.task === 'hear' || meta.task === 'play') return meta.intro === tierIdx();
      if (meta.task === 'phrase') return meta.rung === profile.phr;
      return meta.intro === zoneIdx();
    }
    function workOnHit(meta) {
      return profile.workOn.some(function (w) { return (w.k === 'move' && w.id === meta.move) || (w.k === 'ivl' && w.id === meta.ivl); });
    }
    function unseenDays(c) { return c && c.last ? daysBetween(c.last, today()) : 99; }
    var aggCache = null;
    function aggregates() {
      if (aggCache) return aggCache;
      var mv = {}, iv = {}, pairs = {};
      Object.keys(profile.cells).forEach(function (key) {
        var c = profile.cells[key], p = key.split('|'), a;
        if (!c.n) return;
        if ((p[0] === 'match' || p[0] === 'call') && p[1] !== 'free') { a = mv[p[1]] = mv[p[1]] || { w: 0, s: 0 }; a.w += c.n; a.s += c.m * c.n; }
        else if ((p[0] === 'hear' || p[0] === 'play') && p[1] !== 'cmp') { a = iv[p[1]] = iv[p[1]] || { w: 0, s: 0 }; a.w += c.n; a.s += c.m * c.n; }
      });
      Object.keys(profile.conf).forEach(function (k) {
        var x = k.split('>'), id = pairId(x[0], x[1]);
        pairs[id] = (pairs[id] || 0) + profile.conf[k];
      });
      return (aggCache = { mv: mv, iv: iv, pairs: pairs });
    }
    function priorM(meta, c) {
      var mc = c ? c.m : 0.5, nc = c ? c.n : 0, A = aggregates(), a = null;
      if (meta.task === 'match' || meta.task === 'call') a = meta.move === 'free' ? null : A.mv[meta.move];
      else if (meta.task === 'hear' || meta.task === 'play') a = meta.ivl === 'cmp' ? null : A.iv[meta.ivl];
      if (!a || a.w < 1) return mc;
      return (mc * nc + (a.s / a.w) * 2) / (nc + 2);
    }
    function pairHit(meta) {
      if (meta.task !== 'hear' && meta.task !== 'play') return false;
      var A = aggregates();
      return Object.keys(A.pairs).some(function (id) { return A.pairs[id] >= 2 && id.split('/').indexOf(meta.ivl) >= 0; });
    }
    function cellWeight(meta) {
      var c = profile.cells[meta.key] || null, W = cfg.weights, st = statusOf(c), w;
      if (st === 'new') w = Math.max(isNewest(meta) ? W.newNewest : W.newOld, 1 - priorM(meta, c));
      else if (st === 'learning') w = 1 - c.m;
      else if (st === 'solid') w = W.solid;
      else w = unseenDays(c) >= 3 ? W.masteredStale : W.masteredFresh;
      if ((st === 'new' || st === 'learning') && workOnHit(meta)) w += W.workOn;
      if (topErr(c) || pairHit(meta)) w *= W.errBoost;
      /* coverage: off at 1 (the work order's weights). Above 1, a cell that the
         newest step still needs (fewer than minN answers) is picked more often. */
      if (W.coverage !== 1 && meta.move !== 'free' && isNewest(meta) && meta.task !== 'note' && meta.task !== 'phrase' && (!c || c.n < cfg.unlock.minN)) w *= W.coverage;
      return w;
    }
    function activeCells(task) {
      if (task === 'phrase') { var out = [], r; for (r = 1; r <= profile.phr; r++) out.push(metaOf('phrase|' + r)); return out; }
      if (task === 'hear') return intervalCatalog().hear.filter(function (m) { return m.intro <= tierIdx(); });
      if (task === 'play') return intervalCatalog().play.filter(function (m) { return m.intro <= tierIdx() && playFeasible(m, zoneIdx()); });
      return zoneCellList(task).filter(function (m) { return m.intro <= zoneIdx(); });
    }

    /* 4.7 Task mix: the default share, with the weakest task up by as much
       as 10 points. */
    function taskShares() {
      var tasks = Object.keys(cfg.mix), weak = {}, meanW = 0, shares = {}, worst = null, i;
      tasks.forEach(function (t) {
        var cells = activeCells(t), s = 0;
        cells.forEach(function (m) { var c = profile.cells[m.key]; s += 1 - (c ? c.m : 0.5); });
        weak[t] = cells.length ? s / cells.length : 0;
        meanW += cfg.mix[t] * weak[t];
        shares[t] = cfg.mix[t];
      });
      for (i = 0; i < tasks.length; i++) if (worst === null || weak[tasks[i]] > weak[worst]) worst = tasks[i];
      var bonus = Math.min(cfg.mixShift, Math.max(0, weak[worst] - meanW) * 0.5);
      if (bonus > 0) {
        var others = 1 - cfg.mix[worst];
        tasks.forEach(function (t) { shares[t] = t === worst ? cfg.mix[t] + bonus : cfg.mix[t] - bonus * cfg.mix[t] / others; });
      }
      return shares;
    }
    function pickTask() {
      var shares = taskShares(), tasks = Object.keys(shares), run = cfg.interleave.taskRun - 1;
      var last = recent.slice(-run);
      if (last.length === run && last.every(function (r) { return r.task === last[0].task; })) {
        var rest = tasks.filter(function (t) { return t !== last[0].task; });
        if (rest.length) tasks = rest;
      }
      return weightedPick(rng, tasks, function (t) { return shares[t]; });
    }
    function pickCell(task) {
      var metas = activeCells(task), run = cfg.interleave.cellRun, last = recent.slice(-run);
      if (last.length === run && last.every(function (r) { return r.key === last[0].key; })) {
        var rest = metas.filter(function (m) { return m.key !== last[0].key; });
        if (rest.length) metas = rest;
      }
      return weightedPick(rng, metas, cellWeight);
    }
    function makeItemFor(meta, o) {
      o = o || {};
      var c = profile.cells[meta.key] || null, rr = rungRange(meta.key);
      var rung = clamp((c ? c.r : rr[0]) + (o.rungDelta || 0), rr[0], rr[1]);
      var xtra = { cellState: c };
      if (o.zones) xtra.zones = o.zones;
      var ctx = makeCtx(rng, o.zoneIdx || zoneIdx(), o.tierIdx || tierIdx(), xtra);
      var provoke = topErr(c);
      var item = generateItem(meta.task, meta.key, rung, ctx, provoke, o.gen);
      item.review = statusOf(c) === 'mastered';
      if (o.scaffold) item.scaffold = o.scaffold;
      return item;
    }
    function track(item) { recent.push({ task: item.task, key: item.cell }); if (recent.length > 6) recent.shift(); }

    function startSession() {
      session = { items: 0, wrongByCell: {}, wrongByGroup: {}, errSeq: [], errByGroup: {}, cards: {}, contrast: {}, remed: {}, byTask: {}, review: 0 };
      return session;
    }
    function endSession() {
      if (!session) return null;
      profile.sessions++; profile.lastSession = today();
      var s = session; session = null; pending = [];
      return { items: s.items, byTask: s.byTask, review: s.review };
    }

    /* o.task forces the task ('Practice one task'); the cell is still picked
       by the engine, so it stays adaptive inside that task. */
    function nextItem(o) {
      if (!session) startSession();
      while (pending.length) {
        var p = pending.shift();
        if (p.kind === 'scaffold') {
          var sm = metaOf(p.cell);
          if (!sm) continue;
          var sit = makeItemFor(sm, { rungDelta: -1, scaffold: p.scaffold });
          track(sit);
          return sit;
        }
        if (p.kind === 'contrastItem') {
          var cm = metaOf('hear|' + p.name + '|up');
          if (!cm) continue;
          var ctx = makeCtx(rng, zoneIdx(), 4, {});
          var cit = generateItem('hear', cm.key, 2, ctx, null, { mustInclude: [p.partner], tierIdx: 4 });
          cit.scaffold = { contrast: true, pair: [p.name, p.partner] };
          track(cit);
          return cit;
        }
        return p;
      }
      var meta = pickCell((o && o.task) || pickTask());
      var item = makeItemFor(meta);
      track(item);
      return item;
    }

    /* 4.7 mastery update. w is 1 for a direct answer, 0.5 for a phrase pair. */
    function update(c, s, w) {
      var k = Math.max(cfg.kFloor, 1 / (c.n + 2)) * w;
      c.m = clamp(c.m + k * (s - c.m), 0, 1);
      c.n += w;
      c.last = today();
    }
    function pushHist(c, code) { c.hist = (c.hist + code).slice(-cfg.errWindow); }

    function lessonFor(errType, meta, pair) {
      if (errType === 'bString') return 'crossB';
      if (errType === 'octave') return 'octaveErr';
      if (errType === 'wrongDir') return 'wrongDir';
      if (errType === 'posError') return 'posError';
      if (errType === 'ivlConfuse') {
        if (pair) {
          var a = pair.split('>')[0], b = pair.split('>')[1], id = pairId(a, b);
          if (id === 'M3/m3') return 'm3M3';
          if (id === 'P4/P5') return 'p4p5';
        }
        return null;
      }
      var mv = meta && meta.move;
      if (mv === 'same-s' || mv === 'same-m' || mv === 'same-l') return 'sameString';
      if (mv === 'cross-adj' || mv === 'unison') return 'crossAdj';
      if (mv === 'cross-B') return 'crossB';
      if (mv === 'octave') return 'octave';
      return null;
    }
    function queueRemediation(item, errType, pair, events, why) {
      var meta = metaOf(item.cell), card = lessonFor(errType, meta, pair);
      if (!card || session.cards[card]) return;
      session.cards[card] = 1;
      var ev = { type: 'lesson', card: card, cell: item.cell, err: errType, why: why };
      pending.push({ kind: 'lesson', card: card, cell: item.cell, err: errType });
      events.push(ev);
      if (item.task !== 'phrase') {
        var sc = (item.task === 'match' || item.task === 'call' || item.task === 'play') ? { hearSlide: true } : { hearFirst: true };
        for (var i = 0; i < cfg.remed.scaffolds; i++) pending.push({ kind: 'scaffold', cell: item.cell, scaffold: sc });
      }
    }
    function checkContrast(pair, events) {
      var a = pair.split('>')[0], b = pair.split('>')[1], id = pairId(a, b);
      var count = (profile.conf[a + '>' + b] || 0) + (profile.conf[b + '>' + a] || 0);
      var base = profile.drilled[id] || 0;
      if (count - base < cfg.remed.contrastCount || session.contrast[id]) return false;
      session.contrast[id] = 1;
      profile.drilled[id] = count;
      events.push({ type: 'contrast', pair: [a, b], count: count });
      pending.push({ kind: 'contrast', a: a, b: b, root: 52 + rint(rng, 0, 8), reps: cfg.remed.contrastReps });
      var order = [a, b], i;
      for (i = 0; i < cfg.remed.contrastItems; i++) pending.push({ kind: 'contrastItem', name: order[i % 2], partner: order[(i + 1) % 2] });
      return true;
    }

    function applyDirect(item, res, flags, events) {
      var c = getCell(item.cell, true), rr = rungRange(item.cell);
      update(c, res.score, 1);
      var code = res.errType ? HIST_CODE[res.errType] : (res.posError ? HIST_CODE.posError : '.');
      pushHist(c, code);
      if (res.errType) c.err[res.errType] = (c.err[res.errType] || 0) + 1;
      if (res.posError) c.err.posError = (c.err.posError || 0) + 1;
      if (res.pair && res.errType === 'ivlConfuse') profile.conf[res.pair] = (profile.conf[res.pair] || 0) + 1;
      if (res.right) c.streak = c.streak > 0 ? c.streak + 1 : 1;
      else c.streak = c.streak < 0 ? c.streak - 1 : -1;
      if (c.streak >= cfg.rung.up + (c.r - rr[0]) && c.m >= cfg.rung.upMinM) { if (c.r < rr[1]) c.r++; c.streak = 0; }
      else if (c.streak <= -cfg.rung.down) { if (c.r > rr[0]) c.r--; c.streak = 0; }
      if (flags.placement) return;
      var meta = metaOf(item.cell), seen = res.errType || (res.posError ? 'posError' : null);
      var gk = (meta.task === 'match' || meta.task === 'call') ? meta.move : (meta.task === 'hear' || meta.task === 'play') ? meta.ivl : meta.task;
      var gseq = session.errByGroup[gk] = session.errByGroup[gk] || [];
      if (seen) { session.errSeq.push(seen); gseq.push(seen); }
      if (!res.correct) {
        session.wrongByCell[item.cell] = (session.wrongByCell[item.cell] || 0) + 1;
        session.wrongByGroup[gk] = (session.wrongByGroup[gk] || 0) + 1;
      }
      var handled = false;
      if (res.pair && res.errType === 'ivlConfuse') handled = checkContrast(res.pair, events);
      if (!handled && seen) {
        var twiceIn = function (q) {
          var m = q.length, last = q[m - 1];
          return m >= 2 && last !== 'other' && q.slice(-3).filter(function (e) { return e === last; }).length >= 2;
        };
        var twice = twiceIn(session.errSeq) || twiceIn(gseq);
        var three = !res.correct && (session.wrongByCell[item.cell] >= cfg.remed.wrongInCell || session.wrongByGroup[gk] >= cfg.remed.wrongInCell);
        if (twice || three) {
          queueRemediation(item, seen, res.pair, events, three ? 'wrongInCell' : 'sameErrorTwice');
          if (three) { session.wrongByCell[item.cell] = 0; session.wrongByGroup[gk] = 0; }
        }
      }
    }
    function applyPhrase(item, res, flags) {
      var c = getCell(item.cell, true);
      update(c, res.score, 1);
      pushHist(c, res.errType ? HIST_CODE[res.errType] : '.');
      if (res.errType) c.err[res.errType] = (c.err[res.errType] || 0) + 1;
      if (res.right) c.streak = c.streak > 0 ? c.streak + 1 : 1;
      else if (res.score < 0.5) c.streak = c.streak < 0 ? c.streak - 1 : -1;
      else c.streak = 0;
      if (c.streak >= cfg.rung.up + (item.rung - 1) && c.m >= cfg.rung.upMinM) { if (profile.phr < PHRASE_COUNT && item.rung === profile.phr) profile.phr++; c.streak = 0; }
      else if (c.streak <= -cfg.rung.down) { if (profile.phr > 1 && item.rung === profile.phr) profile.phr--; c.streak = 0; }
      item.pairs.forEach(function (pr) {
        if (!pr.key || res.rights[pr.to] == null) return;
        var pc = getCell(pr.key, true);
        update(pc, res.rights[pr.to] ? 1 : 0, 0.5);
      });
    }

    /* 4.5 Unlock rule. */
    function requiredZoneCells(k) {
      return zoneCellList('match').concat(zoneCellList('call')).filter(function (m) { return m.intro === k && m.move !== 'free'; });
    }
    function requiredTierCells(k) {
      return intervalCatalog().hear.concat(intervalCatalog().play).filter(function (m) { return m.intro === k && (m.task === 'hear' || playFeasible(m, zoneIdx())); });
    }
    function unitsOf(metas, isZone) {
      var U = cfg.unlock, units = {};
      metas.forEach(function (m) {
        var uk = (isZone && U.granularity === 'row') ? m.task + '|' + m.move + '|' + m.neck : m.key;
        var u = units[uk] = units[uk] || { n: 0, ms: 0 };
        var c = profile.cells[m.key];
        if (c) { u.n += c.n; u.ms += c.m * c.n; }
      });
      return units;
    }
    function stepProgress(metas, isZone) {
      var U = cfg.unlock, units = unitsOf(metas, isZone), keys = Object.keys(units), ok = 0;
      keys.forEach(function (k) { var u = units[k]; if (u.n >= U.minN && u.ms / u.n >= U.minM) ok++; });
      return { required: keys.length, satisfied: ok };
    }
    function matchEvidence(k, metas) {
      var moves = uniq(metas.map(function (m) { return m.move; })), U = cfg.unlock;
      return moves.every(function (mv) {
        var s = 0, n = 0;
        zoneCellList('match').forEach(function (m) {
          if (m.move !== mv || m.intro > k) return;
          var c = profile.cells[m.key];
          if (c && c.n > 0) { s += c.m * c.n; n += c.n; }
        });
        return n >= 3 && s / n >= U.matchM;
      });
    }
    function checkUnlocks(events) {
      var moved = true;
      while (moved) {
        moved = false;
        var zk = zoneIdx();
        if (zk < 5) {
          var rz = requiredZoneCells(zk), pz = stepProgress(rz, true);
          if (pz.required && pz.satisfied === pz.required && matchEvidence(zk, rz)) {
            profile.unlockedZones.push(ZONE_ORDER[zk]); profile.zone = ZONE_ORDER[zk];
            events.push({ type: 'unlock', kind: 'zone', id: profile.zone });
            if (zk + 1 === 4) pending.push({ kind: 'lesson', card: 'z4', cell: null, err: null });
            moved = true;
          }
        }
        var tk = tierIdx();
        if (tk < 4) {
          var rt = requiredTierCells(tk), pt = stepProgress(rt, false);
          if (pt.required && pt.satisfied === pt.required) {
            profile.unlockedTiers.push('T' + (tk + 1)); profile.tier = 'T' + (tk + 1);
            events.push({ type: 'unlock', kind: 'tier', id: profile.tier });
            moved = true;
          }
        }
      }
    }

    function submit(item, answer, flags) {
      flags = flags || {};
      var res = gradeItem(item, answer, cfg), events = [];
      if (res.unclear) return { result: res, events: events };
      if (!session) startSession();
      if (!flags.placement) {
        session.items++;
        session.byTask[item.task] = (session.byTask[item.task] || 0) + 1;
        if (item.review) session.review++;
      }
      if (item.task === 'phrase') applyPhrase(item, res, flags);
      else applyDirect(item, res, flags, events);
      aggCache = null;
      checkUnlocks(events);
      return { result: res, events: events };
    }

    /* On load: every unseen day lowers m by 0.02; a mastered cell stops at 0.5. */
    function applyDecay() {
      var t = today();
      Object.keys(profile.cells).forEach(function (k) {
        var c = profile.cells[k];
        if (!c.last) return;
        var from = c.last;
        if (profile.decayDay && profile.decayDay > from) from = profile.decayDay;
        var days = daysBetween(from, t);
        if (days <= 0) return;
        var floor = statusOf(c) === 'mastered' ? cfg.decay.floor : 0;
        c.m = Math.max(Math.min(floor, c.m), c.m - cfg.decay.perDay * days);
      });
      profile.decayDay = t;
    }

    /* Read-outs the screens and the sim use. */
    function moveRank() {
      var agg = {};
      Object.keys(profile.cells).forEach(function (key) {
        var p = key.split('|');
        if ((p[0] !== 'match' && p[0] !== 'call') || p[1] === 'free') return;
        var c = profile.cells[key];
        if (!c.n) return;
        var a = agg[p[1]] = agg[p[1]] || { w: 0, s: 0 };
        a.w += c.n; a.s += c.m * c.n;
      });
      return Object.keys(agg).map(function (mv) { return { move: mv, m: (agg[mv].s + RANK_PRIOR * RANK_PRIOR_W) / (agg[mv].w + RANK_PRIOR_W), raw: agg[mv].s / agg[mv].w, n: agg[mv].w }; })
        .sort(function (x, y) { return x.m - y.m; });
    }
    function diagnose() {
      var tot = {}, errors = {}, pairs = [];
      Object.keys(profile.cells).forEach(function (key) {
        var c = profile.cells[key], i;
        for (i = 0; i < c.hist.length; i++) {
          var nm = HIST_NAME[c.hist[i]];
          if (!nm) continue;
          var t = tot[nm] = tot[nm] || { total: 0, cells: {} };
          t.total++; t.cells[key] = 1;
        }
      });
      Object.keys(tot).forEach(function (nm) {
        if (tot[nm].total >= cfg.errMin) errors[nm] = { total: tot[nm].total, cells: Object.keys(tot[nm].cells) };
      });
      Object.keys(profile.conf).forEach(function (k) { pairs.push({ pair: k, count: profile.conf[k] }); });
      pairs.sort(function (x, y) { return y.count - x.count; });
      return { errors: errors, pairs: pairs };
    }
    function unlockState() {
      var zk = zoneIdx(), tk = tierIdx();
      return { zone: profile.zone, tier: profile.tier,
               zoneStep: zk < 5 ? stepProgress(requiredZoneCells(zk), true) : null,
               tierStep: tk < 4 ? stepProgress(requiredTierCells(tk), false) : null };
    }

    eng.snapshot = function () { return serializeProfile(profile); };
    eng.getProfile = function () { return profile; };
    eng.startSession = startSession;
    eng.endSession = endSession;
    eng.nextItem = nextItem;
    eng.submit = submit;
    eng.status = function (key) { return statusOf(profile.cells[key] || null); };
    eng.weight = function (key) { var m = metaOf(key); return m ? cellWeight(m) : 0; };
    eng.activeCells = activeCells;
    eng.shares = taskShares;
    eng.moveRank = moveRank;
    eng.diagnose = diagnose;
    eng.unlockState = unlockState;
    eng.requiredZoneCells = requiredZoneCells;
    eng.requiredTierCells = requiredTierCells;
    eng.makeItemFor = makeItemFor;
    eng.getSession = function () { return session; };
    eng.today = today;
    eng.applyDecay = applyDecay;
    eng.setPlacement = function (zone, tier, phr, workOn) {
      var zi = ZONE_ORDER.indexOf(zone) + 1, ti = ['T1', 'T2', 'T3', 'T4'].indexOf(tier) + 1;
      profile.zone = zone; profile.unlockedZones = ZONE_ORDER.slice(0, zi);
      profile.tier = tier; profile.unlockedTiers = ['T1', 'T2', 'T3', 'T4'].slice(0, ti);
      profile.phr = clamp(phr, 1, PHRASE_COUNT);
      profile.workOn = workOn || [];
      profile.placementDone = today();
    };
    eng.startPlacement = function (popts) { return createPlacement(eng, profile, rng, cfg, popts || {}); };
    eng.rng = rng;
    if (opts.profile) applyDecay();
    return eng;
  }

  /* ── 4.6 Placement: a scripted item order through the normal engine ── */
  var PROBE_MOVES = ['same-m', 'cross-adj', 'cross-B', 'unison', 'octave', 'skip', 'same-l', 'same-s'];
  var IVL_PROBE = ['m3', 'M3', 'P4', 'P5', 'm7', 'P8'];
  function createPlacement(eng, profile, rng, cfg, popts) {
    var st = { stage: 'mixed', queue: [], i: 0, rung: { match: 2, call: 2, note: 2 }, mixed: { n: 0, right: 0 }, small: { n: 0, right: 0 },
               byMove: {}, hear: { n: 0, right: 0, hr: 0, rung: 2, pairs: [] }, phraseScore: null, zoneOut: null, done: false, out: null, moveCycle: 0 };
    var cycle = shuffled(rng, PROBE_MOVES);
    function startMixed() {
      st.stage = 'mixed'; st.i = 0;
      st.queue = shuffled(rng, ['match', 'match', 'match', 'match', 'match', 'call', 'call', 'call', 'call', 'note', 'note', 'note']);
      st.zones = [1, 2, 3];
    }
    function startSmall(zones) {
      st.stage = 'small'; st.i = 0; st.zones = zones;
      st.queue = shuffled(rng, ['match', 'match', 'call', 'note']);
      st.rung = { match: 2, call: 2, note: 2 };
    }
    function startIvl() { st.stage = 'ivl'; st.i = 0; st.queue = IVL_PROBE.slice(); st.queue = shuffled(rng, st.queue); }
    function startPhrase() { st.stage = 'phrase'; st.i = 0; st.queue = ['phrase']; }
    startMixed();

    function cellForProbe(task) {
      var list = zoneCellList(task).filter(function (m) { return m.intro <= 5 && m.move !== 'free'; });
      var inZone = unionData(st.zones);
      list = list.filter(function (m) { return inZone.byKey[m.move + '|' + m.group + '|' + m.neck]; });
      if (task === 'note') {
        var nl = zoneCellList('note').filter(function (m) { return unionData(st.zones).positions.some(function (p) { return p.s === m.s && bandOf(p.f) === m.band; }); });
        return pickOne(rng, nl);
      }
      var mv = cycle[st.moveCycle++ % cycle.length], sub = list.filter(function (m) { return m.move === mv; });
      return pickOne(rng, sub.length ? sub : list);
    }
    function nextItem() {
      if (st.done) return null;
      if (st.i >= st.queue.length) return null;
      var task = st.queue[st.i], item;
      if (task === 'phrase') {
        var pctx = makeCtx(rng, 3, 4, { zones: [1, 2, 3] });
        item = generateItem('phrase', 'phrase|2', 2, pctx, null);
      } else if (st.stage === 'ivl') {
        var name = task, semis = semisOfName(name), r = st.hear.rung, key;
        if (r <= 2) key = 'hear|' + name + '|up';
        else if (r === 3) key = 'hear|' + name + '|down';
        else if (r === 4) key = 'hear|' + name + '|harm';
        else key = 'hear|cmp|up';
        var ictx = makeCtx(rng, 1, 4, {});
        item = generateItem('hear', key, r, ictx, null, { semis: r === 5 ? semis + 12 : semis, tierIdx: 4 });
      } else {
        var meta = cellForProbe(task), rr = rungRange(meta.key), rung = clamp(st.rung[task], rr[0], rr[1]);
        var ctx = makeCtx(rng, 3, 3, { zones: st.zones, cellState: null });
        item = generateItem(task, meta.key, rung, ctx, null);
      }
      item.placementStage = st.stage;
      return item;
    }
    function submit(item, answer) {
      var out = eng.submit(item, answer, { placement: true });
      var res = out.result;
      if (res.unclear) return out;
      st.i++;
      if (item.task === 'phrase') st.phraseScore = res.score;
      else if (st.stage === 'ivl') {
        st.hear.n++;
        if (res.right) { st.hear.right++; st.hear.hr = Math.max(st.hear.hr, item.rung); st.hear.rung = Math.min(5, st.hear.rung + 1); }
        else { st.hear.rung = Math.max(1, st.hear.rung - 1); if (res.pair) st.hear.pairs.push(res.pair); }
      } else {
        var bucket = st.stage === 'mixed' ? st.mixed : st.small;
        bucket.n++; if (res.right) bucket.right++;
        var rr = rungRange(item.cell);
        st.rung[item.task] = res.right ? Math.min(rr[1], st.rung[item.task] + 1) : Math.max(rr[0], st.rung[item.task] - 1);
        if (item.move && item.move !== 'free') {
          var b = st.byMove[item.move] = st.byMove[item.move] || { n: 0, right: 0 };
          b.n++; if (res.right) b.right++;
        }
      }
      if (st.i >= st.queue.length) advance();
      return out;
    }
    function advance() {
      if (st.stage === 'mixed') {
        var p = st.mixed.right / st.mixed.n;
        st.p = p;
        if (p <= 0.5) { st.branch = 'z1'; startSmall([1]); }
        else if (p >= 0.85) { st.branch = 'z4'; startSmall([4]); }
        else { st.branch = 'mid'; st.zoneOut = 'Z3'; startIvl(); }
      } else if (st.stage === 'small') {
        var q = st.small.right / st.small.n;
        if (st.branch === 'z1') st.zoneOut = q >= 0.75 ? 'Z2' : 'Z1';
        else st.zoneOut = q >= 0.75 ? 'Z5' : q >= 0.5 ? 'Z4' : 'Z3';
        startIvl();
      } else if (st.stage === 'ivl') startPhrase();
      else finish();
    }
    function finish() {
      var h = st.hear, tier = 'T1';
      if (h.right >= 3) tier = h.hr >= 5 ? 'T4' : h.hr === 4 ? 'T3' : h.hr === 3 ? 'T2' : 'T1';
      var phr = st.phraseScore == null ? 2 : st.phraseScore >= 0.99 ? 3 : st.phraseScore < 0.5 ? 1 : 2;
      var moves = Object.keys(st.byMove).map(function (mv) { var b = st.byMove[mv]; return { move: mv, rate: b.right / b.n, n: b.n }; });
      var strengths = moves.filter(function (x) { return x.rate === 1; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 2).map(function (x) { return { k: 'move', id: x.move }; });
      var work = moves.filter(function (x) { return x.rate < 1; }).sort(function (a, b) { return a.rate - b.rate || b.n - a.n; }).slice(0, 2).map(function (x) { return { k: 'move', id: x.move }; });
      var pairWork = uniq(h.pairs).slice(0, 1).map(function (pr) { return { k: 'ivl', id: pr.split('>')[0] }; });
      var workOn = work.concat(pairWork).slice(0, 3);
      eng.setPlacement(st.zoneOut, tier, phr, workOn);
      st.done = true;
      st.out = { zone: st.zoneOut, tier: tier, phr: phr, strengths: strengths, workOn: workOn, pMixed: st.p, branch: st.branch,
                 items: st.mixed.n + st.small.n + st.hear.n + (st.phraseScore == null ? 0 : 1) };
    }
    return {
      next: nextItem, submit: submit,
      isDone: function () { return st.done; },
      result: function () { return st.out; },
      stage: function () { return st.stage; }
    };
  }

  return {
    OPEN: OPEN, STRING_KEYS: STRING_KEYS, MIDI_LO: MIDI_LO, MIDI_HI: MIDI_HI, FRET_MAX: FRET_MAX, IVL: IVL, SIMPLE_NAMES: SIMPLE_NAMES,
    ZONES: ZONES, ZONE_ORDER: ZONE_ORDER, CONFIG_DEFAULT: CONFIG_DEFAULT, PHRASE_RUNGS: PHRASE_RUNGS, SCALES: SCALES, CONF_GROUPS: CONF_GROUPS,
    mulberry32: mulberry32, midiAt: midiAt, mkPos: mkPos, noteName: noteName, noteLabel: noteLabel, noteOctave: noteOctave,
    readPitch: readPitch, medianJudge: medianJudge, ivlInfo: ivlInfo, ivlOf: ivlOf, semisOfName: semisOfName, confPartners: confPartners,
    pairId: pairId, tierNames: tierNames, groupOf: groupOf, crossesB: crossesB, bShift: bShift, classifyMove: classifyMove, neckOf: neckOf,
    bandOf: bandOf, classifyError: classifyError, errMidis: errMidis, zoneData: zoneData, unionData: unionData, prefixZones: prefixZones,
    catalog: catalog, intervalCatalog: intervalCatalog, metaOf: metaOf, rungRange: rungRange, makeCtx: makeCtx, generateItem: generateItem,
    gradeItem: gradeItem, verifyItem: verifyItem, newProfile: newProfile, normalizeProfile: normalizeProfile, serializeProfile: serializeProfile,
    createEngine: createEngine, mergeConfig: mergeConfig, daysBetween: daysBetween, dayStr: dayStr
  };
});
