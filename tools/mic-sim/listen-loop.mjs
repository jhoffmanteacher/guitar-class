/* The listening bench, step 4 (2026-11-13; Jonathan: "i would like the audio detection from power chord switch to apply site-wide like to
   listening coach, etc."): a VIRTUAL STUDENT (note-student.mjs) plays single notes, chord rows and strum patterns into the REAL listening
   code, keeps an answer key, and this compares the site's verdicts with it. The Power Chord Switch closed loop (closed-loop.mjs), widened to
   the other games that listen.

     node tools/mic-sim/listen-loop.mjs --game=melody|chords|radar|runner [options]
       --game=melody    the Listening Coach, melody mode, on the Coach-gated playSeq skills (default)
       --game=chords    the Listening Coach, chord mode, on the Coach-gated chord skills
       --game=radar     Strum Radar, its strum patterns at their default tempos
       --game=runner    Note Runner, real levels (nrStart builds the round; its random draw is seeded)
       --students=a,b   the student kinds (default: every kind of that game; `list` prints them with what each plays)
       --rooms=a,b      student.mjs rooms (default quiet,room7,room4,class: a quiet room, the two FITTED classroom rooms, the synthetic class)
       --mics=a,b       student.mjs mics (default chromebook; chromebook,thin = both laptop mics)
       --skills=a,b|all melody / chords: skill ids (default: melody, ten skills spread over Modules 1-11, DEFAULT_MELODY; chords, all 6)
       --patterns=a,b   radar: pattern ids (default all four)
       --levels=1,3     runner: level numbers as the game shows them (default 1,3; the power-chord levels 13-15 are not modelled)
       --seeds=N        takes per cell (default 1)
       --fps=60         frames a second (evenly spaced)
       --lag=70         ms from the site's click to the student's note reaching the mic, beyond their own timing (closed-loop.mjs's default)
       --root=<folder>  load the site from another folder (a checkout, or a scratch copy with a planted fault)
       --json=<file>    every take, every note
       --against=<file> an earlier --json of the SAME command: per note (and per take for the gate), ranked by the ANSWER KEY (RANK below).
                        Exit 0 = nothing moved, 1 = something moved, 2 = not the same command (other takes, game, student model, fps or lag)
       --replay=N       play take N of the run alone and print its timeline (not with --json or --against)
       --fit            melody only: play the 8 real Coach melody takes' own lines (tools/mic-sim/takes/, summaries) with the `right` student
                        and print the model next to the real takes (how loud an attack is over the room, how fast it falls, how many pitch
                        readings the site got, what the Coach said). --rooms default room4,room7,quiet; --seeds default 3.
                        --fit-amp=<raw RMS> and --fit-ring=<seconds> try other values of note-student.mjs FIT (only with --fit).
       --break=key      the fake-world self-test: the tool corrupts its own answer key (one note's pitch, or one strum played <-> not
                        played, in every take) and the key check must stop the run (exit 2). Never use it for a measurement.
       list             the student kinds of --game, the rooms and the mics
     Every option is ONE argument, --name=value; an unknown or repeated option, or a bad number, exits 2 before anything runs. Exit 2 also on
     any error in the run. Exit 3 from the watchdog: no take finished for 120 s (it prints the take it was on).

   WHAT IS REAL. The site's scripts, unchanged, in closed-loop.mjs's vm (listen-site.mjs benchSite): the Listening Coach from its own
   button (coachOpen, coachStartCheck, coachCountIn, coachLoop, coachReadFrame, coachPitchReadings, coachDetectPitch, coachFinalizeEvent,
   coachMatchEvent, the second look, coachFinish, coachRenderReport: the level the student sees, the level saved for the skill, and the
   check-off gate by the site's own test from toggleSkill); Strum Radar's srSetup / srStart / srLoop / srFinish; Note Runner's nrStart
   (which builds the round with nrGen and sets the hit windows), nrLoop, nrFinalizeEvent, nrGrade, the second look and nrFinish. The skills,
   their lines, their chord notes, their tempos and the Coach button are the site's (gatedSkills: the practice panel's own HTML).
   WHAT IS FAKE. The student (note-student.mjs: a plucked-string guitar, the hands, the mistakes, the timing), the room and the laptop mic
   (student.mjs), the count-in clicks coming out of the speaker, a microphone that is already allowed, a signed-in student whose saveGames is
   only counted, evenly spaced frames, and Note Runner's Math.random (seeded, so a round can be replayed).
   WHAT IS NOT JUDGED. Which note the student MEANT (the key is what was played); the report's wording; anything the screen shows; Strum
   Radar's up / down arrows (the game says it cannot hear them); the Coach's chord NAME (it never claims one: coach-core.js's honesty rules).

   THE ANSWER KEY, written BEFORE any verdict (note-student.mjs plays and returns it; nothing here asks the site what was played). The rules
   it is judged by, from the site's prose (never from its code):
     - Coach melody (coach-core.js header, coachMatchEvent's comment): a note played at the written pitch is RIGHT, whatever its timing in
       the beat ("A note played at the right pitch is the right note, even when it lands off the pulse"); an octave counts ("an octave-off
       correct note still counts"). A note a fret off or on the wrong string is WRONG. A note not played should be MISSED.
     - Coach chords: the Coach never names a chord; it asks whether the strum's readings are chord tones ("ok when >=20% of the readings
       land on chord tones ... 'Wrong' only on strong contrary evidence"). So a wrong chord is CATCHABLE only when it shares no note with the
       written chord: its ideal share (the share of its strings whose pitch class is a written chord tone, one reading per string) at or
       under 10% ("catchable"); at 20% or more the Coach passes it BY DESIGN ("design"); between, unclear is the honest answer ("between").
       The column splits a wrong or held chord by this, worked out here from the notes.
     - the report and the gate (coach-core.js "Honesty rules": "A too-quiet/unclear take gets 'I couldn't hear that clearly', never a wrong
       verdict"; app/audio-ui.js: the gate asks for Good or better): each student kind says what the gate SHOULD do (note-student.mjs:
       pass / fail / either). A right-playing kind whose gate stays shut is a FALSE FAIL, counted apart when the report said "couldn't
       hear" (honest about the mic) and when it said "Needs work" (a verdict on the playing). A kind that did not play the line whose gate
       opens is a FALSE PASS. "either" kinds (one slip) are shown and not counted.
     - Strum Radar (coach-strum.js header: "the mic grades WHEN each strum lands ... no pitch anywhere"): a written strum the student
       strummed within a quarter of an eighth should be a HIT; one with no strum within half an eighth should be a MISS; between, either.
       Extra strums are free by design ("counted, never punished live"). A desk tap is not a strum, but the game cannot tell (no pitch):
       its hits are shown as by-design.
     - Note Runner (coach-runner.js nrGrade / nrFinalizeEvent comments): the right note on time is RIGHT (perfect or good); "On the beat but
       the wrong (or unclear) note: half credit"; a note never played is a MISS; a note played past the game's window ("capped below half
       the smallest gap", at most 180 ms) should not be credited. A round clears the level at 80% (NR_PASS's comment).
   The key check (the fake world's own test, every take): the student's guitar alone (no room, no mic) is read back at every key entry:
   a played note must hold the key's pitch class (an autocorrelation pitch, written here); a strum must be an attack; a note or strum the key
   says was not played must have no attack. A key that disagrees with the sound stops the run (exit 2). --break=key proves it.
   Also checked: the site's string tuning (STRING_OPEN_MIDI) against the student's (note-student.mjs OPEN_MIDI), the Coach's chord row
   against the row the student reads off the card (coachChordSlots's comment: "1 chord: 8 strums; 2+ chords: 2 passes through the loop",
   4 beats a chord, at most 32), and Note Runner's chart notes against the student's fingering.

   RANK (for --against; higher = closer to the key): Coach slot, played right: ok = oct (2) > dim = miss (1) > wrong (0); played wrong
   (catchable): wrong (2) > dim = miss (1) > ok (0); not played: miss (2) > dim = wrong (1) > ok (0); a wrong or held chord the Coach passes
   by design ("design" / "between"): ok <-> wrong is counted on its own, into miss is WORSE. The gate, per take: a "pass" kind newly shut is
   WORSE, a "fail" kind newly open is WORSE. Strum Radar, per written strum: played: hit (1) > miss (0); not played: miss (1) > hit (0).
   Note Runner, per note: right: perfect = good (2) > pitch (1) > miss (0); wrong: pitch (2) > miss (1) > right (0); not played or past the
   window: miss (2) > pitch (1) > right (0).

   THESE ARE A MODEL'S NUMBERS, NOT THE CLASSROOM'S. The guitar and rooms were fitted on Power Chord Switch strums (low strings, two rooms);
   the single note has two numbers fitted to the 8 real Coach melody takes (note-student.mjs FIT; --fit shows how close). The real takes
   (replay-listen.mjs, closed-loop.mjs REAL TAKES) outrank everything here. Not in checks.mjs. */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { benchSite, coachTake, srRound, worldSource } from './listen-site.mjs';
import { ROOMS, MICS, SR } from './student.mjs';
import { NotePlayer, MELODY, CHORDS, PATTERN, RUNNER, NOTE_MODEL, OPEN_MIDI, FIT, NOTE_ROOMS } from './note-student.mjs';
import { shapeMidis } from './closed-loop.mjs';

const GAMES = { melody: MELODY, chords: CHORDS, radar: PATTERN, runner: RUNNER };
/* Ten melody skills, one or two per module, short and long lines, single strings and across strings. */
export const DEFAULT_MELODY = ['w2-s6', 'm2w2-s1', 'm3w1-s5', 'm4w1-s4', 'm4w3-s5', 'm5w1-s1', 'm7w1-s4', 'm8w1-s6', 'm10w1-s2', 'm11w3-s7'];
const NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const nm = m => m == null ? '-' : NAMES[((Math.round(m) % 12) + 12) % 12] + (Math.floor(Math.round(m) / 12) - 1);
const MODEL_LINE = 'THESE ARE A MODEL\'S NUMBERS, NOT THE CLASSROOM\'S: a synthetic guitar in synthetic or fitted rooms (note-student.mjs, student.mjs). Real takes outrank them (replay-listen.mjs).';

/* ── arguments ── */
const VALUED = ['game', 'students', 'rooms', 'mics', 'skills', 'patterns', 'levels', 'seeds', 'fps', 'lag', 'root', 'json', 'against', 'replay', 'break', 'fit-amp', 'fit-ring', 'fit-room'];
const BARE = ['list', '--fit'];
function bad(msg){ console.error('listen-loop: ' + msg); process.exit(2); }
function parseArgs(argv){
  const o = {}, seen = new Set();
  for (const a of argv){
    if (BARE.includes(a)){ if (seen.has(a)) bad(a + ' is given twice'); seen.add(a); o[a.replace(/^--/, '')] = true; continue; }
    const m = /^--([a-z-]+)=(.+)$/.exec(a);
    if (!m || !VALUED.includes(m[1])) bad(`unknown argument "${a}" (the options are in the header of tools/mic-sim/listen-loop.mjs)`);
    if (seen.has(m[1])) bad('--' + m[1] + ' is given twice');
    seen.add(m[1]); o[m[1]] = m[2];
  }
  return o;
}
const num = (v, d, ok, what) => { if (v == null) return d; const x = Number(v); if (!/^-?\d+(\.\d+)?$/.test(v) || !ok(x)) bad(what + ', not "' + v + '"'); return x; };
/* One seed per take from what the take IS, so a take sounds the same whatever else is in the run. */
function seedOf(s){ let h = 2166136261; for (let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return ((h >>> 0) % 2147483646) + 1; }

/* ── the fake world's checks ── */
function rmsOf(x, a, b){ a = Math.max(0, Math.round(a)); b = Math.min(x.length, Math.round(b)); let s = 0; for (let i = a; i < b; i++) s += x[i] * x[i]; return b > a ? Math.sqrt(s / (b - a)) : 0; }
/* A pitch, by normalized autocorrelation over 2048 samples, preferring the shortest period that is nearly as good as the best (so a
   note is not read an octave low). Written here for the key check; it shares nothing with coachDetectPitch. Returns a midi or null. */
function acPitch(x, at){
  const N = 2048, a = Math.round(at);
  if (a < 0 || a + N + SR / 70 >= x.length) return null;
  let e0 = 0; for (let i = 0; i < N; i++) e0 += x[a + i] * x[a + i];
  if (e0 < 1e-9) return null;
  const lo = Math.floor(SR / 1100), hi = Math.ceil(SR / 70), r = new Float32Array(hi + 1);
  let best = 0;
  for (let tau = lo; tau <= hi; tau++){
    let c = 0, e1 = 0;
    for (let i = 0; i < N; i++){ const y = x[a + i + tau]; c += x[a + i] * y; e1 += y * y; }
    r[tau] = c / Math.sqrt(e0 * e1 + 1e-12);
    if (r[tau] > best) best = r[tau];
  }
  if (best < 0.5) return null;
  for (let tau = lo + 1; tau < hi; tau++) if (r[tau] >= 0.9 * best && r[tau] >= r[tau - 1] && r[tau] >= r[tau + 1]) return 69 + 12 * Math.log2(SR / tau / 440);
  return null;
}
const pc = m => ((Math.round(m) % 12) + 12) % 12;
/* Every key entry against the student's own guitar track. Throws "fake-world check failed" on the first disagreement. */
function keyCheck(game, key, clean){
  const S = ms => ms / 1000 * SR;
  for (const e of key){
    const played = game === 'radar' ? e.did === 'played' && e.kind === 'guitar' : !!e.played;
    const notPlayed = game === 'radar' ? e.did === 'notPlayed' : !e.played;
    const at = e.checkAtMs != null ? e.checkAtMs : e.atMs;
    if (played){
      const attack = rmsOf(clean, S(at), S(at + 60)), before = rmsOf(clean, S(at - 120), S(at - 30));
      if (!(attack > 1.3 * before + 1e-6)) throw new Error(`fake-world check failed: key entry ${e.i} says played at ${Math.round(at)} ms, and the student's guitar has no attack there`);
      if (game === 'melody' || game === 'runner'){
        const f = acPitch(clean, S(at + 60));
        const want = e.played.map(pc);
        if (f == null || !want.includes(pc(f))) throw new Error(`fake-world check failed: key entry ${e.i} says ${e.played.map(nm).join('+')} was played, the student's guitar sounds ${f == null ? 'no pitch' : nm(f)}`);
      }
    } else if (notPlayed){
      const t = game === 'radar' ? e.wantMs : e.sched;
      const now = rmsOf(clean, S(t - 150), S(t + 200)), was = rmsOf(clean, S(t - 400), S(t - 200));
      if (now > 1.3 * was + 1e-5) throw new Error(`fake-world check failed: key entry ${e.i} says nothing was played near ${Math.round(t)} ms, and the student's guitar has an attack there`);
    }
  }
}
/* --break=key: corrupt the key the way a broken student would (before the check runs). */
function breakKey(game, key){
  const e = key[0];
  if (!e) return;
  if (game === 'radar'){ e.did = e.did === 'played' ? 'notPlayed' : 'played'; e.kind = 'guitar'; e.atMs = e.wantMs; return; }
  if (game === 'chords'){ if (e.played){ e.played = null; } else { e.played = e.want; e.atMs = e.sched; } return; }
  if (e.played) e.played = e.played.map(m => m + 1); else { e.played = e.want; e.atMs = e.sched; }
}

/* ── the Coach's chord row, as the student reads it off the card (coachChordSlots's comment, written here) ── */
function chordRow(chords){
  const out = [];
  for (let c = 0; c < 2 && out.length < 32; c++) for (const ch of chords) for (let b = 0; b < 4; b++){ if (out.length < 32) out.push({ chord: ch.n, midis: ch.m.map(Number) }); }
  return out;
}
/* The ideal chord-tone share of a played chord against a written one: the share of its strings whose pitch class is a written chord tone. */
function share(played, want){ const w = new Set(want.map(pc)); return played.filter(m => w.has(pc(m))).length / played.length; }
const shareClass = s => s <= 0.10 ? 'catchable' : s >= 0.20 ? 'design' : 'between';

/* ── one take per game ── */
async function coachOne(site, t, o){
  const kinds = o.game === 'melody' ? MELODY : CHORDS;
  const player = new NotePlayer(kinds, t.kind, { room: t.room, lagMs: o.lag, seed: t.seed });
  let key = null, row = null, wrongWorld = null;
  if (o.game === 'chords'){
    const chords = JSON.parse(t.chords);
    row = chordRow(chords);
    /* oneWrongChord: the open chord (CHORD_DIAGRAMS, through closed-loop.mjs shapeMidis: standard tuning written there) that shares the
       fewest notes with the chord it replaces; ties by name. */
    const first = row.findIndex((s, i) => i > 0 && s.chord !== row[i - 1].chord), at = first > 0 ? first : Math.min(4, row.length - 1);
    const pool = o.pool.map(p => ({ name: p.name, midis: p.midis, s: share(p.midis, row[at].midis) })).filter(p => !row.some(r => r.chord === p.name)).sort((a, b) => a.s - b.s || a.name.localeCompare(b.name));
    t.other = pool[0];
  }
  const src = worldSource({ player, mic: t.mic, lagMs: o.lag, onRound: r => {
    if (o.game === 'melody'){
      const line = JSON.parse(t.midis).slice(0, r.slots);
      if (line.length !== r.slots) wrongWorld = `the Coach set up ${r.slots} slots for a line of ${line.length} notes`;
      key = player.playLine({ listenStartMs: r.listenStartMs, beatMs: r.beatMs, notes: line.map((m, i) => ({ beat: i, midis: (Array.isArray(m) ? m : [m]).map(Number) })) });
    } else {
      if (row.length !== r.slots) wrongWorld = `the Coach set up ${r.slots} slots; the card's row (2 passes, 4 beats a chord, at most 32) has ${row.length}`;
      key = player.playRow({ listenStartMs: r.listenStartMs, beatMs: r.beatMs, slots: row, other: t.other });
    }
    return key;
  } });
  const res = await coachTake(site, src, { midis: t.midis || null, chords: t.chords || null, skills: t.sid ? [t.sid] : [], bpm: t.bpm, lat: 50, frameMs: 1000 / o.fps });
  if (wrongWorld) throw new Error('fake-world check failed: ' + wrongWorld);
  if (!key) throw new Error('listen-loop: the student was never told the round');
  if (row && res.slots.some((s, i) => s.chord !== row[i].chord)) throw new Error('fake-world check failed: the Coach\'s chord row is not the one on the card, slot by slot');
  if (o.break) breakKey(o.game, key);
  keyCheck(o.game, key, player.clean);
  const sk = res.skills[0] || null;
  const items = key.map((k, i) => {
    const s = res.slots[i], it = { i, did: k.did, v: s.state, n: s.n, heard: s.heard, devMs: s.devMs, playMs: k.atMs == null ? null : Math.round(k.atMs - k.sched) };
    if (o.game === 'melody'){ it.want = k.want; it.played = k.played; }
    else {
      it.want = k.wantName; it.played = k.playedName;
      if ((k.did === 'wrong' || k.did === 'held') && k.played){ it.share = Math.round(share(k.played, k.want) * 100) / 100; it.cls = shareClass(it.share); }
    }
    return it;
  });
  return { items, overall: res.overall, crits: res.crits, gateOpen: sk ? sk.gated && !sk.gateHolds : null, saved: sk ? sk.saved : null, events: res.events.length, evList: res.events, listenStart: res.listenStart, proc: o.keepProc ? src.proc() : null, key };
}
async function radarOne(site, t, o){
  const player = new NotePlayer(PATTERN, t.kind, { room: t.room, lagMs: o.lag, seed: t.seed });
  let played = null;
  const src = worldSource({ player, mic: t.mic, lagMs: o.lag, onRound: r => {
    played = player.playPattern({ listenStartMs: r.listenStartMs, beatMs: r.beatMs, bars: r.slots / 4, slots: t.slots.map(Boolean), dirs: t.slots });
    return played.key;
  } });
  const res = await srRound(site, src, { pattern: t.item, bpm: t.bpm, lat: 50, frameMs: 1000 / o.fps });
  if (!played) throw new Error('listen-loop: the student was never told the round');
  const key = played.key;
  if (res.notes.length !== key.length) throw new Error(`fake-world check failed: Strum Radar graded ${res.notes.length} strums, the pattern data written out has ${key.length}`);
  if (o.break) breakKey('radar', key);
  keyCheck('radar', key, player.clean);
  const items = key.map((k, i) => ({ i, did: k.did, kind: k.kind, v: res.notes[i].result, nearMs: k.nearMs }));
  return { items, acc: res.acc, stars: res.stars, extras: res.extras, gateOpen: null, strums: played.strums.length, key };
}
/* Note Runner: the real nrStart for level `level` (0-based), its Math.random seeded inside the vm. */
const NR_VM = `globalThis.__ll = {
  start(o){
    __lb.world(o.lat);
    nrStop();
    let a = o.seed >>> 0;
    const keep = Math.random;
    Math.random = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    nr = { phase: 'ready', level: o.level, timeouts: [], pv: null, micOn: false, adaptive: false };
    __lb.p = nrStart().finally(() => { Math.random = keep; });
  },
  round(){ const s = nr; return JSON.stringify({ phase: s.phase, listenStart: s.listenStart, beatMs: s.beatMs, goodMs: s.goodMs, perfectMs: s.perfectMs, chords: !!s.chordMode,
    notes: s.playable.map(n => ({ beat: n.beat, t: n.t, midi: n.midi, string: n.string, fret: n.fret })) }); },
  levels(){ return JSON.stringify(NR_LEVELS.map((l, i) => ({ i, chords: !!l.chords, bpm: l.bpm, bars: l.bars, strings: l.strings, maxFret: l.maxFret, tiers: l.tiers }))); }
};`;
async function runnerOne(site, t, o){
  if (!site.__ll){ site.run(NR_VM); site.__ll = true; }
  const player = new NotePlayer(RUNNER, t.kind, { room: t.room, lagMs: o.lag, seed: t.seed });
  site.reset();
  site.clock.now = 1000;
  const src = worldSource({ player, mic: t.mic, lagMs: o.lag, onRound: () => null });
  src.start(site);
  site.run(`__ll.start(${JSON.stringify({ lat: 50, level: t.level, seed: t.seed })})`);
  await site.run('__lb.p');
  const r = JSON.parse(site.run('__ll.round()'));
  if (r.phase !== 'countin') throw new Error('listen-loop: Note Runner did not start its count-in (' + r.phase + ')');
  /* The student plays the chart: each note on the string and fret it shows, its midi worked out from the student's own tuning. */
  const key = player.playLine({ listenStartMs: r.listenStart, beatMs: r.beatMs, notes: r.notes.map(n => {
    const m = OPEN_MIDI[n.string] + n.fret;
    if (m !== n.midi) throw new Error(`fake-world check failed: Note Runner's chart says string ${n.string} fret ${n.fret} is midi ${n.midi}; standard tuning makes it ${m}`);
    return { beat: n.beat, midis: [m] };
  }) });
  let guard = 0;
  for (;;){
    if (site.run('nr ? nr.phase : "none"') === 'done') break;
    site.clock.now += 1000 / o.fps; src.pump(); site.tick();
    if (++guard > 200000) throw new Error('listen-loop: the Note Runner round never ended');
  }
  const out = JSON.parse(site.run('JSON.stringify({ acc: nr.acc, passed: !!nr.passed, notes: nr.playable.map(n => ({ v: n.result, unclear: !!n.unclear, look: !!n.secondLook })), events: (nr.evLog || []).length })'));
  if (out.notes.length !== key.length) throw new Error('listen-loop: Note Runner graded a different number of notes');
  if (o.break) breakKey('runner', key);
  keyCheck('runner', key, player.clean);
  const pastWindow = Math.abs(RUNNER[t.kind].lateMs) > r.goodMs;
  const items = key.map((k, i) => ({ i, did: k.did === 'right' && pastWindow ? 'pastWindow' : k.did, v: out.notes[i].v === 'pitch' && out.notes[i].unclear ? 'pitch-unclear' : out.notes[i].v, want: k.want, played: k.played, playMs: k.atMs == null ? null : Math.round(k.atMs - k.sched) }));
  return { items, acc: out.acc, gateOpen: out.passed, goodMs: r.goodMs, notes: r.notes.length, key };
}

/* ── truth classes and ranks ── */
/* What a key entry is, for the tables: right, wrong (a catchable wrong note or chord), design (a wrong or held chord the Coach passes by
   design), none (nothing played), and Strum Radar's played / notPlayed / near, Note Runner's right / wrong / none. */
function truth(game, it){
  if (game === 'radar') return it.did === 'played' ? (it.kind === 'guitar' || it.kind === 'mute' ? 'played' : 'tap') : it.did;
  if (game === 'runner') return it.did === 'right' ? 'right' : it.did === 'fretOff' || it.did === 'wrongString' ? 'wrong' : 'none';
  if (it.did === 'right') return 'right';
  if (it.did === 'fretOff' || it.did === 'wrongString') return 'wrong';
  if (it.did === 'wrong' || it.did === 'held') return it.cls === 'catchable' ? 'wrong' : 'design';
  return 'none';
}
const RANK = {
  coach: { right: { ok: 2, oct: 2, dim: 1, miss: 1, wrong: 0 }, wrong: { wrong: 2, dim: 1, miss: 1, ok: 0, oct: 0 }, none: { miss: 2, dim: 1, wrong: 1, ok: 0, oct: 0 } },
  radar: { played: { ok: 1, miss: 0 }, notPlayed: { miss: 1, ok: 0 } },
  runner: { right: { perfect: 2, good: 2, pitch: 1, 'pitch-unclear': 1, miss: 0 }, wrong: { pitch: 2, 'pitch-unclear': 1, miss: 1, perfect: 0, good: 0 },
    none: { miss: 2, pitch: 1, 'pitch-unclear': 1, perfect: 0, good: 0 } }
};
function moveKind(game, tr, was, now){
  if (game === 'chords' && tr === 'design') return now === 'miss' ? 'WORSE' : was === 'miss' ? 'better' : 'by design';
  const R = RANK[game === 'melody' || game === 'chords' ? 'coach' : game][tr];
  if (!R) return 'unranked';
  return R[now] < R[was] ? 'WORSE' : R[now] > R[was] ? 'better' : 'other';
}

/* ── the tables ── */
const WORD = { ok: 'right', oct: 'right', perfect: 'right', good: 'right', dim: 'unclear', 'pitch-unclear': 'unclear', pitch: 'half', wrong: 'wrong', miss: 'missed' };
const pct = (a, b) => b ? Math.round(100 * a / b) + '%' : '-';
function countBy(list){ const c = {}; list.forEach(x => { c[x] = (c[x] || 0) + 1; }); return c; }
function report(o, takes, log){
  const g = o.game, kinds = GAMES[g];
  log(MODEL_LINE);
  if (g === 'melody' || g === 'chords'){
    log(`\nPer note (all takes of each student kind in each room). "right" = the written ${g === 'melody' ? 'note' : 'chord'}, played; "wrong" = ${g === 'melody' ? 'a fret off or on the wrong string' : 'another chord sharing no note with the written one (catchable)'}; "by design" = ${g === 'melody' ? '-' : 'another or the held chord sharing a note: the Coach passes it on purpose (it never names a chord)'}; "nothing" = no note played there.`);
    log('student          room    | takes | right notes: called right / unclear / WRONG / missed | wrong: caught / unclear / said RIGHT / missed | by design: said right / other | nothing: said RIGHT / heard / missed');
    for (const kind of Object.keys(kinds)) for (const room of o.rooms){
      const sel = takes.filter(t => t.kind === kind && t.room === room);
      if (!sel.length) continue;
      const by = { right: [], wrong: [], design: [], none: [] };
      sel.forEach(t => t.items.forEach(it => by[truth(g, it)].push(WORD[it.v])));
      const c = k => countBy(by[k]), R = c('right'), W = c('wrong'), D = c('design'), N = c('none');
      const f = (C, n, keys) => n ? keys.map(k => C[k] || 0).join(' / ') + ` of ${n}` : '-';
      log(`${kind.padEnd(16)} ${room.padEnd(7)} | ${String(sel.length).padStart(5)} | ${f(R, by.right.length, ['right', 'unclear', 'wrong', 'missed']).padEnd(52)} | ${f(W, by.wrong.length, ['wrong', 'unclear', 'right', 'missed']).padEnd(43)} | ${(by.design.length ? `${D.right || 0} / ${by.design.length - (D.right || 0)} of ${by.design.length}` : '-').padEnd(29)} | ${by.none.length ? `${N.right || 0} / ${by.none.length - (N.right || 0) - (N.missed || 0)} / ${N.missed || 0} of ${by.none.length}` : '-'}`);
    }
    log(`\nPer take: the report's level and the check-off gate (the site's own test: Good or better opens it). gate should: pass = the line was played right, fail = it was not, either = one slip.`);
    log('student          gate should  room    | takes | couldn\'t hear / Needs work / Good / Great | gate OPENED | FALSE FAIL (Needs work + couldn\'t hear) | FALSE PASS');
    for (const kind of Object.keys(kinds)) for (const room of o.rooms){
      const sel = takes.filter(t => t.kind === kind && t.room === room && t.gateOpen != null);
      if (!sel.length) continue;
      const L = countBy(sel.map(t => String(t.overall))), open = sel.filter(t => t.gateOpen).length, should = kinds[kind].gate;
      const ff = should === 'pass' ? `${sel.length - open} (${L['1'] || 0} + ${L.couldntHear || 0})` : '-', fp = should === 'fail' ? String(open) : '-';
      log(`${kind.padEnd(16)} ${should.padEnd(12)} ${room.padEnd(7)} | ${String(sel.length).padStart(5)} | ${[L.couldntHear || 0, L['1'] || 0, L['2'] || 0, L['3'] || 0].join(' / ').padEnd(41)} | ${String(open).padStart(11)} | ${ff.padEnd(40)} | ${fp}`);
    }
    log('\nBY ROOM: how often a student who PLAYED IT RIGHT is kept out (a false fail), and how often a performance that is wrong or missing opens the gate (a false pass).');
    for (const room of o.rooms){
      const ok = takes.filter(t => t.room === room && kinds[t.kind].gate === 'pass' && t.gateOpen != null), no = takes.filter(t => t.room === room && kinds[t.kind].gate === 'fail' && t.gateOpen != null);
      const shut = ok.filter(t => !t.gateOpen), nw = shut.filter(t => t.overall === 1).length, open = no.filter(t => t.gateOpen);
      const rightN = takes.filter(t => t.room === room).reduce((n, t) => n + t.items.filter(it => truth(g, it) === 'right').length, 0);
      const rightAcc = takes.filter(t => t.room === room).reduce((n, t) => n + t.items.filter(it => truth(g, it) === 'right' && it.v === 'wrong').length, 0);
      log(`  ${room.padEnd(7)} false fail ${shut.length} of ${ok.length} right-playing takes (${pct(shut.length, ok.length)}; Needs work ${nw}, couldn't hear ${shut.length - nw}) · false pass ${open.length} of ${no.length} takes that did not play it (${pct(open.length, no.length)}${open.length ? ': ' + Object.entries(countBy(open.map(t => t.kind))).map(([k, v]) => k + ' ' + v).join(', ') : ''}) · right notes called WRONG ${rightAcc} of ${rightN}`);
    }
  } else if (g === 'radar'){
    log('\nPer written strum. "played" = strummed within a quarter of an eighth; "not played" = no strum within half an eighth; "tap" = a desk tap there, no guitar (the game cannot tell: by design).');
    log('student          room    | rounds | played: HIT / missed | not played: HIT / missed | tap: hit / missed | score (median, range) | stars 0/1/2/3 | extra sounds');
    for (const kind of Object.keys(kinds)) for (const room of o.rooms){
      const sel = takes.filter(t => t.kind === kind && t.room === room);
      if (!sel.length) continue;
      const by = { played: [], notPlayed: [], tap: [], near: [] };
      sel.forEach(t => t.items.forEach(it => by[truth(g, it)].push(it.v)));
      const f = k => by[k].length ? `${by[k].filter(v => v === 'ok').length} / ${by[k].filter(v => v !== 'ok').length}` : '-';
      const acc = sel.map(t => t.acc).sort((a, b) => a - b), st = countBy(sel.map(t => t.stars));
      log(`${kind.padEnd(16)} ${room.padEnd(7)} | ${String(sel.length).padStart(6)} | ${f('played').padEnd(20)} | ${f('notPlayed').padEnd(24)} | ${f('tap').padEnd(17)} | ${(acc[Math.floor(acc.length / 2)] + '% (' + acc[0] + '-' + acc[acc.length - 1] + ')').padEnd(21)} | ${[0, 1, 2, 3].map(k => st[k] || 0).join('/').padEnd(13)} | ${sel.reduce((n, t) => n + t.extras, 0)}`);
    }
    log('\nBY ROOM: rounds strummed right that scored under two stars (65%), and rounds where the pattern was NOT strummed that earned a star (40%) or more.');
    for (const room of o.rooms){
      const ok = takes.filter(t => t.room === room && kinds[t.kind].gate === 'pass'), no = takes.filter(t => t.room === room && kinds[t.kind].gate === 'fail');
      log(`  ${room.padEnd(7)} strummed right, under 2 stars: ${ok.filter(t => t.stars < 2).length} of ${ok.length} · not strummed, a star or more: ${no.filter(t => t.stars >= 1).length} of ${no.length}${no.length ? ' (' + Object.entries(countBy(no.filter(t => t.stars >= 1).map(t => t.kind))).map(([k, v]) => k + ' ' + v).join(', ') + ')' : ''}`);
    }
  } else {
    log('\nPer note. "right" = the charted note on time; "wrong" = a fret off; "nothing" = not played, or played past the game\'s window (veryLate).');
    log('student          room    | rounds | right notes: right / half / unclear / missed | wrong notes: half (caught) / unclear / said RIGHT / missed | nothing: said RIGHT / half / missed | score (median) | cleared (80%)');
    for (const kind of Object.keys(kinds)) for (const room of o.rooms){
      const sel = takes.filter(t => t.kind === kind && t.room === room);
      if (!sel.length) continue;
      const by = { right: [], wrong: [], none: [] };
      sel.forEach(t => t.items.forEach(it => by[truth(g, it.did === 'pastWindow' ? Object.assign({}, it, { did: 'skipped' }) : it)].push(WORD[it.v])));
      const c = k => countBy(by[k]), R = c('right'), W = c('wrong'), N = c('none');
      const f = (C, n, keys) => n ? keys.map(k => C[k] || 0).join(' / ') + ` of ${n}` : '-';
      const acc = sel.map(t => t.acc).sort((a, b) => a - b);
      log(`${kind.padEnd(16)} ${room.padEnd(7)} | ${String(sel.length).padStart(6)} | ${f(R, by.right.length, ['right', 'half', 'unclear', 'missed']).padEnd(44)} | ${f(W, by.wrong.length, ['half', 'unclear', 'right', 'missed']).padEnd(58)} | ${f(N, by.none.length, ['right', 'half', 'missed']).padEnd(35)} | ${String(acc[Math.floor(acc.length / 2)] + '%').padEnd(14)} | ${sel.filter(t => t.gateOpen).length} of ${sel.length}`);
    }
    log('\nBY ROOM: rounds played right that did not clear the level (80%), and rounds not played right (veryLate, silent) that cleared it.');
    for (const room of o.rooms){
      const ok = takes.filter(t => t.room === room && kinds[t.kind].gate === 'pass'), no = takes.filter(t => t.room === room && kinds[t.kind].gate === 'fail');
      log(`  ${room.padEnd(7)} played right, not cleared: ${ok.filter(t => !t.gateOpen).length} of ${ok.length} · not played right, cleared: ${no.filter(t => t.gateOpen).length} of ${no.length}`);
    }
  }
  log('\n' + MODEL_LINE);
}

/* ── --replay ── */
function printReplay(o, t, r, log){
  log(`take ${t.n}: ${o.game} · ${t.kind} (${GAMES[o.game][t.kind].what}) · ${t.room} · ${t.mic} · ${t.item} · ${t.bpm} BPM · seed ${t.seed}`);
  if (o.game === 'melody' || o.game === 'chords'){
    log(`  report: ${r.overall === 'couldntHear' ? "couldn't hear" : ['', 'Needs work', 'Good', 'Great'][r.overall]} · criteria (pitch, timing, tempo, changes, completion) ${JSON.stringify(r.crits)} · gate ${r.gateOpen == null ? 'n/a' : r.gateOpen ? 'OPEN' : 'shut'} · ${r.events} sounds taken${t.other ? ' · wrong chord: ' + t.other.name : ''}`);
    log('  sounds the Coach took (played time from beat 1, slot, readings): ' + r.evList.map(e => `${Math.round(e.t - r.listenStart)} ms${e.slot >= 0 ? ' slot ' + (e.slot + 1) : ''} [${e.rd.map(nm).join(' ')}]`).join(' · '));
    r.items.forEach(it => log(`  slot ${String(it.i + 1).padStart(2)}  wants ${(Array.isArray(it.want) ? it.want.map(nm).join('+') : it.want).padEnd(10)} played ${(it.played == null ? '-' : Array.isArray(it.played) ? it.played.map(nm).join('+') : it.played).padEnd(10)} (${it.did}${it.cls ? ', ' + it.cls + ' ' + it.share : ''}) ${it.playMs == null ? '' : 'at ' + it.playMs + ' ms'}  ->  ${it.v.padEnd(5)} readings ${it.n == null ? '-' : it.n}  heard ${it.heard == null ? '-' : nm(it.heard)}  grid ${it.devMs == null ? '-' : it.devMs + ' ms'}`));
  } else if (o.game === 'radar'){
    log(`  score ${r.acc}% · ${r.stars} stars · ${r.extras} extra sounds · the student made ${r.strums} sounds`);
    r.items.forEach(it => log(`  strum ${String(it.i + 1).padStart(2)}  ${it.did.padEnd(9)} (${it.kind}, nearest ${it.nearMs == null ? '-' : it.nearMs + ' ms'})  ->  ${it.v}`));
  } else {
    log(`  score ${r.acc}% · window ${Math.round(r.goodMs)} ms · ${r.gateOpen ? 'cleared' : 'not cleared'}`);
    r.items.forEach(it => log(`  note ${String(it.i + 1).padStart(2)}  wants ${it.want.map(nm).join('+').padEnd(5)} played ${(it.played ? it.played.map(nm).join('+') : '-').padEnd(5)} (${it.did}) ${it.playMs == null ? '' : 'at ' + it.playMs + ' ms'}  ->  ${it.v}`));
  }
}

/* ── --against ── */
function compare(o, now, was, file){
  if (!was || was.tool !== 'listen-loop' || !Array.isArray(was.takes)) return { code: 2, lines: [`against ${file}: not a --json of this tool; nothing compared`] };
  if (was.model !== now.model) return { code: 2, lines: [`against ${file}: NOT THE SAME COMMAND (student model ${was.model} then, ${now.model} now: note-student.mjs NOTE_MODEL); nothing compared`] };
  for (const k of ['game', 'fps', 'lag']) if (was[k] !== now[k]) return { code: 2, lines: [`against ${file}: NOT THE SAME COMMAND (${k} ${was[k]} then, ${now[k]} now); nothing compared`] };
  const id = t => [t.kind, t.room, t.mic, t.item, t.seed].join('|');
  if (was.takes.length !== now.takes.length || now.takes.some((t, i) => id(t) !== id(was.takes[i]))) return { code: 2, lines: [`against ${file}: NOT THE SAME COMMAND (other takes: ${was.takes.length} then, ${now.takes.length} now, or other students, rooms, mics, items or seeds); nothing compared`] };
  const g = now.game, kinds = GAMES[g];
  let n = 0, diff = 0, worse = 0, better = 0, design = 0, other = 0, gw = 0, gb = 0, gm = 0, siteDiff = 0;
  const first = [];
  now.takes.forEach((t, ti) => {
    const w = was.takes[ti];
    if (w.items.length !== t.items.length || w.items.some((x, i) => x.did !== t.items[i].did)){ siteDiff++; return; }
    t.items.forEach((it, i) => {
      n++;
      const v0 = w.items[i].v;
      if (v0 === it.v) return;
      diff++;
      const k = moveKind(g, truth(g, it), v0, it.v);
      if (k === 'WORSE') worse++; else if (k === 'better') better++; else if (k === 'by design') design++; else other++;
      if (first.length < 12) first.push(`  take ${t.n} (${t.kind}, ${t.room}, ${t.item}) ${g === 'radar' ? 'strum' : 'note'} ${i + 1}: played ${it.did}${it.cls ? ' (' + it.cls + ')' : ''}, was ${v0}, now ${it.v}  ${k}   replay: --replay=${t.n}`);
    });
    if (w.gateOpen !== t.gateOpen && t.gateOpen != null){
      gm++;
      const should = kinds[t.kind].gate, k = should === 'pass' ? (t.gateOpen ? 'better' : 'WORSE') : should === 'fail' ? (t.gateOpen ? 'WORSE' : 'better') : 'unranked';
      if (k === 'WORSE') gw++; else if (k === 'better') gb++;
      if (first.length < 12) first.push(`  take ${t.n} (${t.kind}, ${t.room}, ${t.item}): the ${g === 'runner' ? 'level' : 'gate'} was ${w.gateOpen ? 'OPEN' : 'shut'}, now ${t.gateOpen ? 'OPEN' : 'shut'} (should ${should})  ${k}   replay: --replay=${t.n}`);
    }
  });
  const lines = [`against ${file}: ${diff} of ${n} graded ${g === 'radar' ? 'strums' : 'notes'} differ (${worse} worse by the answer key, ${better} better${g === 'chords' ? `, ${design} a chord the Coach passes by design` : ''}, ${other} between two verdicts of the same rank) in ${now.takes.length - siteDiff} takes; ${g === 'radar' ? '' : `${g === 'runner' ? 'level cleared' : 'gate'} moved in ${gm} takes (${gw} worse, ${gb} better)`}${siteDiff ? `; ${siteDiff} takes NOT compared: the site set up a different round (other notes or slots) with the same student` : ''}${diff || gm || siteDiff ? '  RED' : '  same'}`, ...first];
  return { code: diff || gm || siteDiff ? 1 : 0, lines };
}

/* ── --fit: the model against the 8 real Coach melody takes ── */
const db = x => 10 * Math.log10(x);
const q = (arr, p) => { if (!arr.length) return NaN; const s = arr.slice().sort((a, b) => a - b); return s[Math.floor(p * (s.length - 1))]; };
/* Per note: how far its attack block rises over the take's room (the 20th percentile block), and how far it has fallen 300 ms later; the
   same measure on a real summary (E) and on the model's sound after the site's mic chain (proc). */
function blockE(proc){ const n = Math.floor(proc.length / 512), E = new Float32Array(n), D = new Float32Array(n); for (let g = 0; g < n; g++){ let e = 0, d = 0; for (let i = g * 512; i < (g + 1) * 512; i++){ e += proc[i] * proc[i]; const x = proc[i] - (i ? proc[i - 1] : 0); d += x * x; } E[g] = e; D[g] = d; } return { E, D }; }
/* The room's pitch: the share of blocks from 400 to 100 ms before a note's attack where coachDetectPitch (gate 0.22) reads a pitch that is
   neither this note nor the one before it (nor their octaves): pitched sound that is not the student's. P: Hz per block (0 = none). */
function roomPitch(P, msPer, tRec, notes){
  if (!P) return null;
  let n = 0, other = 0;
  for (let b = Math.round((tRec - 400) / msPer); b < Math.round((tRec - 100) / msPer); b++){
    if (b < 0 || b >= P.length) continue;
    n++;
    if (P[b] > 0){ const m = 69 + 12 * Math.log2(P[b] / 440); if (!notes.some(x => x != null && [0, 12, -12].some(k => Math.abs(m - x - k) <= 0.6))) other++; }
  }
  return n ? other / n : null;
}
function attackStats(E, msPer, tRec, D){
  const sorted = Array.from(E).sort((a, b) => a - b), floor = sorted[Math.floor(sorted.length * 0.2)] || 1e-12;
  const b0 = Math.round((tRec - 150) / msPer), b1 = Math.round((tRec + 250) / msPer);
  let pk = -1, pv = 0;
  for (let b = Math.max(0, b0); b < Math.min(E.length, b1); b++) if (E[b] > pv){ pv = E[b]; pk = b; }
  if (pk < 0) return null;
  const at = ms => { const b = pk + Math.round(ms / msPer); return b < E.length ? E[b] : 0; };
  /* brightness: the attack block's difference energy over its energy (the HF channel's share), which the mic's low cut and the touch set */
  return { pk: db(pv / floor), d300: db(Math.max(at(300), 1e-12) / pv), floorDb: db(floor / 512), bright: D ? db(D[pk] / pv) : null };
}
async function fit(o, log){
  const { loadListenSummaries, replayAllListen } = await import('./replay-listen.mjs');
  const { TAKES_DIR } = await import('./replay-takes.mjs');
  const at = o.root ? { root: o.root } : null;
  const takes = loadListenSummaries(TAKES_DIR).filter(t => t.kind === 'coach-melody');
  if (!takes.length) bad('--fit: no Listening Coach melody summaries in tools/mic-sim/takes/');
  await replayAllListen(takes, at, [0], true);
  const real = [];
  for (const tk of takes){
    const res = tk.res[0];
    tk.notes.forEach(n => {
      const e = tk.d.expected[n.i], st = attackStats(tk.sum.E, 512 / tk.srcRate * 1000, e.t + Number(tk.d.micLatencyMs || 0) - (tk.mapMs || 0), tk.sum.D);
      if (st) st.room = roomPitch(tk.sum.pitch['0.22'], 512 / tk.srcRate * 1000, e.t + Number(tk.d.micLatencyMs || 0) - (tk.mapMs || 0), [e.midi, n.i ? tk.d.expected[n.i - 1].midi : null]);
      real.push({ played: n.played, present: n.present, v: res && res.notes && res.notes[n.i] ? res.notes[n.i].v : null, n: res && res.notes && res.notes[n.i] ? res.notes[n.i].n : null, st });
    });
  }
  const site = benchSite(at), ys = (await import('./replay-takes.mjs')).baseSite(at);
  const model = {};
  for (const room of o.rooms){
    model[room] = [];
    for (const tk of takes) for (let s = 1; s <= o.seeds; s++){
      const exp = tk.d.expected, midis = JSON.stringify(exp.map(e => e.midis && e.midis.length > 1 ? e.midis : e.midi));
      const t = { kind: 'right', room, mic: o.mics[0], item: tk.take, midis, sid: null, bpm: tk.d.bpm, seed: seedOf(`fit|${room}|${tk.id}|${s}`) };
      const r = await coachOne(site, t, Object.assign({}, o, { game: 'melody', keepProc: true, fps: 1000 / Math.max(8, Math.min(120, Number(tk.d.frameMeanMs) || 16.667)) }));
      const B = blockE(r.proc);
      ys.reset(); ys.mic.proc = r.proc; ys.mic.upTo = r.proc.length; ys.mic.sr = SR; ys.mic.offsetMs = 0;
      const P = ys.run(`__rp.yin([0.22], ${B.E.length}, 512)`)[0];
      r.items.forEach((it, i) => { const st = attackStats(B.E, 512 / SR * 1000, r.key[i].atMs, B.D); if (st) st.room = roomPitch(P, 512 / SR * 1000, r.key[i].atMs, [r.key[i].want[0], i ? r.key[i - 1].want[0] : null]); model[room].push({ v: it.v, n: it.n, st }); });
      watchdog.tick(`--fit ${room} ${tk.take} seed ${s}`);
    }
  }
  const row = (label, sel) => {
    const st = sel.filter(x => x.st), pk = st.map(x => x.st.pk), d3 = st.map(x => x.st.d300), fl = st.map(x => x.st.floorDb), br = st.map(x => x.st.bright), rp = st.filter(x => x.st.room != null).map(x => x.st.room);
    const nn = sel.filter(x => x.n != null).map(x => x.n), V = countBy(sel.map(x => WORD[x.v] || 'none'));
    return `${label.padEnd(40)} | ${String(sel.length).padStart(5)} | ${[0.25, 0.5, 0.75].map(p => q(pk, p).toFixed(0)).join(' / ').padEnd(12)} | ${[0.25, 0.5, 0.75].map(p => q(d3, p).toFixed(0)).join(' / ').padEnd(14)} | ${q(fl, 0.5).toFixed(0).padStart(5)} | ${q(br, 0.5).toFixed(1).padStart(6)} | ${pct(Math.round(100 * rp.reduce((a, b) => a + b, 0)), 100 * rp.length).padStart(10)} | ${`${nn.filter(x => x === 0).length} / ${nn.filter(x => x === 1).length} / ${nn.filter(x => x >= 2).length}`.padEnd(14)} | ${['right', 'unclear', 'wrong', 'missed'].map(k => `${V[k] || 0} (${pct(V[k] || 0, sel.length)})`).join(' / ')}`;
  };
  log(`FIT: the model's "right" student against the 8 real Coach melody takes (tools/mic-sim/takes/, period 4, 60 BPM; their own lines, tempo, mic delay and frame time) · note-student.mjs FIT noteAmp ${FIT.noteAmp}, ringS ${FIT.ringS}`);
  log('notes                                    | notes | attack over room dB (25/50/75%) | 300 ms later dB | room dBFS | bright | room pitch | readings 0 / 1 / 2+ | the Coach said right / unclear / wrong / missed');
  log(row('REAL: every note with a pick attack', real.filter(x => x.played)));
  log(row('REAL: attack, and clearly the right note', real.filter(x => x.played && x.present === 'present')));
  log(row('REAL: clearly the right note (any)', real.filter(x => x.present === 'present')));
  for (const room of o.rooms) log(row(`MODEL ${room}: right student, every note`, model[room]));
  log('Real: the site\'s verdicts are today\'s replay of the summaries (replay-listen.mjs); readings are what that replay\'s matched slot read. "Clearly the right note" = the console\'s evaluator found the note in the recording (it reads the same detector, so it leans to readable notes); "attack" = a pick attack there. The real students did not all play right: "every note with a pick attack" includes their wrong notes (15 of 45 hold another pitch), so a right-playing model should sit between that row and the "clearly the right note" rows.');
  log(MODEL_LINE);
}

/* ── the watchdog ── */
const watchdog = { last: Date.now(), where: 'starting', timer: null,
  start(){ this.timer = setInterval(() => { if (Date.now() - this.last > 120000){ console.error(`listen-loop: HUNG, no take finished for 120 s. Stuck at "${this.where}"`); process.exit(3); } }, 5000); this.timer.unref(); },
  tick(where){ this.last = Date.now(); this.where = where; } };

async function main(){
  const o = parseArgs(process.argv.slice(2));
  o.game = o.game || 'melody';
  if (!GAMES[o.game]) bad('--game must be melody, chords, radar or runner');
  const kinds = GAMES[o.game];
  o.root = o.root ? resolve(o.root) : null;
  if (o.list){
    console.log(`student kinds for --game=${o.game} (gate should: pass / fail / either):`);
    for (const [k, v] of Object.entries(kinds)) console.log(`  ${k.padEnd(16)} ${v.gate.padEnd(7)} ${v.what}`);
    console.log('rooms: ' + Object.keys(ROOMS).join(', ') + ' (and "trial", for --fit --fit-room only)\nmics:  ' + Object.keys(MICS).join(', '));
    process.exit(0);
  }
  if ((o['fit-amp'] || o['fit-ring'] || o['fit-room']) && !o.fit) bad('--fit-amp, --fit-ring and --fit-room go with --fit only');
  try { if (o['fit-room']) Object.assign(NOTE_ROOMS.trial, JSON.parse(o['fit-room'])); } catch (e){ bad('--fit-room: not JSON (' + e.message + ')'); }
  if (!o.fit && (o.rooms || '').split(',').includes('trial')) bad('the room "trial" is for --fit only');
  if (o.fit && o.game !== 'melody') bad('--fit is for --game=melody');
  if (o.replay != null && !/^[1-9]\d*$/.test(o.replay)) bad(`--replay must be a take number (1, 2, ...), not "${o.replay}"`);
  if (o.replay != null && (o.json || o.against)) bad('--replay prints one take: not with --json or --against');
  if (o.break && o.break !== 'key') bad('--break must be key');
  o.seeds = num(o.seeds, o.fit ? 3 : 1, x => Number.isInteger(x) && x > 0, '--seeds must be a whole number above 0');
  o.fps = num(o.fps, 60, x => x > 0, '--fps must be above 0');
  o.lag = num(o.lag, 70, () => true, '--lag must be a number of ms');
  o.rooms = (o.rooms || (o.fit ? 'room4,room7,quiet' : 'quiet,room7,room4,class')).split(',');
  o.mics = (o.mics || 'chromebook').split(',');
  o.students = (o.students || Object.keys(kinds).join(',')).split(',');
  for (const r of o.rooms) if (!ROOMS[r] && !NOTE_ROOMS[r]) bad(`no room "${r}" (list)`);
  for (const m of o.mics) if (!MICS[m]) bad(`no mic "${m}" (list)`);
  for (const s of o.students) if (!kinds[s]) bad(`no ${o.game} student "${s}" (--game=${o.game} list)`);
  if (o['fit-amp']) FIT.noteAmp = num(o['fit-amp'], 0, x => x > 0, '--fit-amp must be above 0');
  if (o['fit-ring']) FIT.ringS = num(o['fit-ring'], 0, x => x > 0, '--fit-ring must be above 0');
  let was = null;
  if (o.against){
    if (o.json && resolve(o.json) === resolve(o.against)) bad('--against and --json name the same file');
    try { was = JSON.parse(readFileSync(o.against, 'utf8')); } catch (e){ bad(`--against: cannot read ${o.against} (${e.message})`); }
  }
  watchdog.start();
  console.log(`listen-loop · site ${o.root || 'this checkout'} · ${o.game} · student model ${NOTE_MODEL}`);
  if (o.fit){ await fit(o, l => console.log(l)); process.exit(0); }
  const site = benchSite(o.root ? { root: o.root } : null);
  /* The fake world's tuning against the site's (both written independently). */
  const sTune = JSON.parse(site.run('JSON.stringify(STRING_OPEN_MIDI)'));
  for (const s of [1, 2, 3, 4, 5, 6]) if (Number(sTune[s]) !== OPEN_MIDI[s]) throw new Error(`fake-world check failed: string ${s} is midi ${sTune[s]} on the site and ${OPEN_MIDI[s]} for the student`);
  /* What the run plays. */
  const items = [];
  if (o.game === 'melody' || o.game === 'chords'){
    const gated = JSON.parse(site.run('__lb.gatedSkills()')).filter(g => o.game === 'melody' ? g.type === 'playSeq' && g.midis : g.type === 'chord' && g.chords);
    const want = !o.skills ? (o.game === 'melody' ? DEFAULT_MELODY : gated.map(g => g.sid)) : o.skills === 'all' ? gated.map(g => g.sid) : o.skills.split(',');
    for (const sid of want){ const g = gated.find(x => x.sid === sid); if (!g) bad(`no Coach-gated ${o.game} skill with a Coach button "${sid}"`); items.push({ item: sid, sid, midis: g.midis, chords: g.chords, bpm: g.bpm }); }
    if (o.game === 'chords'){
      /* The wrong chord's pool: open chords, shapes from CHORD_DIAGRAMS (data) through closed-loop.mjs shapeMidis (standard tuning written there). */
      const dg = JSON.parse(site.run("JSON.stringify(Object.fromEntries(['C','G','D','E','Em','Am','A','Dm'].filter(n => CHORD_DIAGRAMS[n]).map(n => [n, CHORD_DIAGRAMS[n].chord])))"));
      o.pool = Object.entries(dg).map(([name, ch]) => ({ name, midis: shapeMidis(ch) }));
      /* Where a row's chord has an open-chord diagram, its notes in the drill must be that diagram's (pitch classes): the student reads the
         drill's notes, so this is the check that they are a real chord's. */
      for (const it of items) for (const c of JSON.parse(it.chords)){ const d = o.pool.find(p => p.name === c.n); if (d){ const a = [...new Set(d.midis.map(pc))].sort().join(), b = [...new Set(c.m.map(pc))].sort().join(); if (a !== b) throw new Error(`fake-world check failed: ${it.sid}'s ${c.n} holds pitch classes [${b}], its diagram [${a}]`); } }
    }
  } else if (o.game === 'radar'){
    const pats = JSON.parse(site.run('JSON.stringify(SH_PATTERNS.map(p => ({ id: p.id, slots: p.slots, defBpm: p.defBpm })))'));
    const want = o.patterns ? o.patterns.split(',') : pats.map(p => p.id);
    for (const id of want){ const p = pats.find(x => x.id === id); if (!p) bad(`no Strum Radar pattern "${id}"`); items.push({ item: id, slots: p.slots, bpm: p.defBpm }); }
  } else {
    if (!site.__ll){ site.run(NR_VM); site.__ll = true; }
    const lv = JSON.parse(site.run('__ll.levels()'));
    for (const x of (o.levels || '1,3').split(',')){
      const i = Number(x) - 1;
      if (!/^\d+$/.test(x) || !lv[i]) bad(`--levels: no Note Runner level ${x}`);
      if (lv[i].chords) bad(`--levels: level ${x} is a power-chord level; the runner student plays single notes only`);
      items.push({ item: 'level ' + x, level: i, bpm: lv[i].bpm });
    }
  }
  /* The run's takes, in order: student, room, mic, item, seed. */
  const plan = [];
  for (const kind of o.students) for (const room of o.rooms) for (const mic of o.mics) for (const it of items){
    if (o.game === 'chords' && kind === 'holdsOne' && new Set(JSON.parse(it.chords).map(c => c.n)).size < 2) continue;
    for (let s = 1; s <= o.seeds; s++) plan.push(Object.assign({}, it, { kind, room, mic, s, seed: seedOf([o.game, kind, room, mic, it.item, s].join('|')) }));
  }
  plan.forEach((t, i) => { t.n = i + 1; });
  const only = o.replay != null ? Number(o.replay) : 0;
  if (only && only > plan.length) bad(`--replay=${only}: this run has only ${plan.length} takes`);
  if (!only) console.log(`${plan.length} takes: ${o.students.length} students x ${o.rooms.length} rooms x ${o.mics.length} mics x ${items.length} ${o.game === 'radar' ? 'patterns' : o.game === 'runner' ? 'levels' : 'skills'} x ${o.seeds} seeds${o.game === 'chords' ? ' (holdsOne only on rows of 2+ chords)' : ''} · ${o.fps} fps · the student is ${o.lag} ms behind the click, the site's mic delay setting 50 ms`);
  const t0 = Date.now(), done = [];
  for (const t of plan){
    if (only && t.n !== only) continue;
    watchdog.tick(`take ${t.n}: ${t.kind} ${t.room} ${t.mic} ${t.item}`);
    const r = o.game === 'radar' ? await radarOne(site, t, o) : o.game === 'runner' ? await runnerOne(site, t, o) : await coachOne(site, t, o);
    watchdog.tick(`after take ${t.n}`);
    if (only){ printReplay(o, t, r, l => console.log(l)); process.exit(0); }
    done.push({ n: t.n, kind: t.kind, room: t.room, mic: t.mic, item: t.item, seed: t.seed, bpm: t.bpm, items: r.items, overall: r.overall, crits: r.crits, gateOpen: r.gateOpen, acc: r.acc, stars: r.stars, extras: r.extras, other: t.other ? t.other.name : undefined });
  }
  report(o, done, l => console.log(l));
  console.log(`\n${done.length} takes, ${done.reduce((n, t) => n + t.items.length, 0)} graded ${o.game === 'radar' ? 'strums' : 'notes'}, every answer key checked against the student's own guitar, ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  const out = { tool: 'listen-loop', model: NOTE_MODEL, game: o.game, fps: o.fps, lag: o.lag, fit: FIT, takes: done };
  if (o.json) writeFileSync(o.json, JSON.stringify(out));
  if (was){ const c = compare(o, out, was, o.against); c.lines.forEach(l => console.log(l)); process.exit(c.code); }
  process.exit(0);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]){
  const die = e => { console.error('listen-loop: stopped on an error, exit 2: ' + (e && e.stack ? e.stack : e)); process.exit(2); };
  process.on('uncaughtException', die);
  process.on('unhandledRejection', die);
  main().catch(die);
}
