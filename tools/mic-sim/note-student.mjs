/* The virtual student for SINGLE NOTES, RIFFS, CHORD ROWS and STRUM PATTERNS (2026-11-13, the listening bench, step 4). The sister of
   student.mjs's Student (which plays Power Chord Switch changes): it writes the SOUND a student makes into the air and keeps the ANSWER
   KEY (what was really played), written before any game judges it. It knows nothing about the site: listen-loop.mjs tells it the line,
   the chord row or the strum pattern the game set up, and feeds its sound to the real listening code.

   What it reuses from student.mjs, unchanged: the plucked string (StringVoice, Karplus-Strong), the guitar (Guitar), the hands (TOUCH:
   pick / finger / thumb), the rooms (ROOMS, rendered by a silent Student: noise, rumble, other guitars, bangs, voices, keys, a fan) and
   the desk tap and muted-strum sounds (Student.render's 'bang' and 'mute' hits).
   What is new here:
     - one note at a time on its own string (first position: the lowest fret that reaches the note; fingering() below), the finger
       leaving the string just before the next note is picked (or not, for `ring`);
     - the mistakes a teacher hears in a played line: a note a fret off, a note on the wrong string (same fret, the next string), a
       skipped note, the whole line a fret off; in a chord row: one bar of another chord, two strums skipped, one chord held the whole
       row; in a strum pattern: missed strums, extra strums, strums on the wrong eighths;
     - two numbers FITTED to the real Listening Coach melody takes (FIT below): how loud a single plucked note is, and how long it rings.
   A chord row and a strum pattern strum with student.mjs's own level (0.12 per string) and ring (1.0 s), fitted on Power Chord Switch.

   THE FIT (2026-11-13). The 8 real Listening Coach melody takes in tools/mic-sim/takes/ (period 4, 60 BPM, low E and A string lines;
   summaries only, no audio) were measured by listen-loop.mjs --fit, which prints the same numbers for the model next to them. Per note
   with a pick attack in the recording (45 notes): how far the attack's 512-sample block rises over the room (the take's 20th
   percentile block: median 12 dB, quartiles 10-16), how far it has fallen 300 ms later (median -7 dB) and how many pitch readings the
   site got for it (23 of 45 under 2). FIT.noteAmp 0.05 and FIT.ringS 0.45 were chosen so that the `right` student in room4 (the room
   fitted to the loud period-4 Power Chord Switch takes) lands near those three numbers: attack 14 dB over the room (real 12), fallen
   6 dB after 300 ms (real 7), under 2 readings for 96 of 192 notes (real 23 of 45). Values tried: noteAmp 0.04 to 0.1 and ringS 0.4
   to 0.45; in room4 the attack measure barely moves with noteAmp (the room's own peaks set it), so 0.05 rests mostly on the readings.
   WHAT THE FIT DOES NOT FIX (2026-11-13, measured with --fit): on what it DOES read, the Coach calls the room4 student's right notes
   wrong far more than in the real takes: right 8% / unclear 58% / wrong 32% (192 notes) against, for real notes with a pick attack,
   33% / 47% / 20% (45 notes, some of them really wrong notes) and, for real notes clearly in the recording, 67% / 33% / 0% (27). The
   cause is room4's pitched sound: with its other guitars and its voices both turned off (--fit-room) the wrong share falls to 0%, with
   only the voices off to 25%, with only the guitars off to 45%; and the share of the 300 ms before each attack holding a pitch that is
   not the student's is 28% in room4 against 9% in the real takes. room4 and room7 were fitted on loudness and strum onsets with
   strums at 0.12 per string, which drown such room sound; a single note at 0.05 does not. The synthetic `class` room is the one that
   sits inside the real numbers for single notes: attack 15 dB, fallen 6 dB, pitch before the attack 9% (real 9%), under 2 readings
   40% (real 51%), right 56% / unclear 40% / wrong 4% (192 notes). So for the single-note games (Coach melody, Note Runner) read
   `class` as the closest room, room4 and room7 as harsher than the real rooms, and quiet as kinder; the floor of `class` is quieter
   than the real takes' (-39 against -23 dBFS). The other numbers here (the touches, the timing spreads, the mistakes' sizes) are
   stated guesses, not fitted.
   NOT modelled: fret buzz, a string not pressed down fully, string noise from the left hand, a finger muting the next string, bends,
   vibrato, the student's own voice counting along, OS gain control, room echo. Read every number this produces as "the model says",
   not "the classroom does": the real takes outrank it. */
import { Student, Guitar, TOUCH, ROOMS, SR, rng, gauss } from './student.mjs';

/* Bump whenever a change here makes the same seed sound different or keep a different answer key: listen-loop.mjs writes it into every
   --json take and refuses to compare takes of two versions (--against). */
export const NOTE_MODEL = '2026-11-13';

/* FITTED to the 8 real Coach melody takes (the header; listen-loop.mjs --fit). noteAmp: raw-mic level (RMS) of one plucked note, as
   student.mjs's 0.12 is for one string of a strum. ringS: seconds a single string rings to 1/e. */
export const FIT = { noteAmp: 0.05, ringS: 0.45 };
/* The strum a chord row or a strum pattern uses: student.mjs's own level and ring (BASE: 0.12, ringS 1.0, fitted on Power Chord Switch). */
const STRUM = { amp: 0.12, ringS: 1.0 };
/* For fitting only (listen-loop.mjs --fit --fit-room=<json>): room4 with the fields the option names changed. Never in a measurement. */
export const NOTE_ROOMS = { trial: { ...ROOMS.room4 } };

/* Standard tuning, the site's string numbers (6 = low E). Written here from the guitar, not read from the site. */
export const OPEN_MIDI = { 6: 40, 5: 45, 4: 50, 3: 55, 2: 59, 1: 64 };
/* Where a student plays a note: the string that reaches it with the lowest fret (first position: an A is the open A string, not the
   low E's 5th fret). */
export function fingering(midi){
  let best = null;
  for (const s of [6, 5, 4, 3, 2, 1]){ const f = midi - OPEN_MIDI[s]; if (f >= 0 && (!best || f < best.fret)) best = { string: s, fret: f }; }
  return best || { string: 6, fret: Math.max(0, midi - 40) };
}
/* A note's midis on strings (a double stop: each on its own string, the lowest note placed first). */
function place(midis){
  const used = new Set(), out = [];
  for (const m of midis.slice().sort((a, b) => a - b)){
    let p = fingering(m);
    if (used.has(p.string)) for (let s = p.string - 1; s >= 1; s--){ const f = m - OPEN_MIDI[s]; if (!used.has(s) && f >= 0){ p = { string: s, fret: f }; break; } }
    used.add(p.string); out.push({ string: p.string, fret: p.fret, midi: OPEN_MIDI[p.string] + p.fret });
  }
  return out;
}
/* The wrong string: the same fret on the next string up (toward the high e), or down from the high e. */
function wrongString(p){ const s = p.string > 1 ? p.string - 1 : 2; return { string: s, fret: p.fret, midi: OPEN_MIDI[s] + p.fret }; }

/* The students. gate: what the check-off gate SHOULD do for this playing (the answer key's verdict on the whole take, from the site's
   own prose: coach-core.js's header and "Timing forgiveness" block: a note played at the right pitch is the right note even off the
   pulse; a quiet or unclear take gets "I couldn't hear that clearly", never a wrong verdict; app/audio-ui.js: the gate asks for a take
   at Good or better):
     pass    the line was played right: a closed gate is a FALSE FAIL;
     fail    it was not played (or not the line): an open gate is a FALSE PASS;
     either  one slip in an otherwise right take: the report may fairly say Good or Needs work ("A clearly-wrong note caps the score
             at level 2"), so the gate is shown and not counted either way.
   Times in ms; ampX scales the level; mistake names one of the mistakes below. */
const B = { touch: 'pick', ampX: 1, sigmaMs: 25, lateMs: 0, ring: false, mistake: null };
export const MELODY = {
  right:          { ...B, gate: 'pass', what: 'every note right, with a pick, on the beat (25 ms spread)' },
  late:           { ...B, gate: 'pass', lateMs: 150, what: 'every note right, 150 ms late' },
  early:          { ...B, gate: 'pass', lateMs: -150, what: 'every note right, 150 ms early' },
  loose:          { ...B, gate: 'pass', sigmaMs: 200, what: 'every note right, timing scattered (200 ms spread)' },
  quiet:          { ...B, gate: 'pass', ampX: 0.3, what: 'every note right, played quietly (a third of the level, -10 dB)' },
  ring:           { ...B, gate: 'pass', ring: true, what: 'every note right, each string left ringing into the next' },
  thumb:          { ...B, gate: 'pass', touch: 'thumb', what: 'every note right, plucked with the thumb' },
  finger:         { ...B, gate: 'pass', touch: 'finger', what: 'every note right, plucked with a finger' },
  oneFretOff:     { ...B, gate: 'either', mistake: 'fretOff1', what: 'one note a fret high, the rest right' },
  oneWrongString: { ...B, gate: 'either', mistake: 'string1', what: 'one note on the wrong string (same fret, next string), the rest right' },
  skipOne:        { ...B, gate: 'either', mistake: 'skip1', what: 'one note left out, the rest right' },
  allFretOff:     { ...B, gate: 'fail', mistake: 'fretOffAll', what: 'every note a fret high: the line is not the written one' },
  silent:         { ...B, gate: 'fail', silent: true, what: 'plays nothing (the room only)' },
  tapper:         { ...B, gate: 'fail', silent: true, tap: true, what: 'taps the desk on every beat, no note' },
  mutedStrum:     { ...B, gate: 'fail', silent: true, mute: true, what: 'strums muted strings on every beat: a scratch, no note' }
};
export const CHORDS = {
  right:          { ...B, gate: 'pass', what: 'every strum the right chord, on the beat' },
  late:           { ...B, gate: 'pass', lateMs: 150, what: 'every strum right, 150 ms late' },
  early:          { ...B, gate: 'pass', lateMs: -150, what: 'every strum right, 150 ms early' },
  loose:          { ...B, gate: 'pass', sigmaMs: 200, what: 'every strum right, timing scattered (200 ms spread)' },
  quiet:          { ...B, gate: 'pass', ampX: 0.3, what: 'every strum right, played quietly (-10 dB)' },
  thumb:          { ...B, gate: 'pass', touch: 'thumb', what: 'every strum right, with the thumb' },
  finger:         { ...B, gate: 'pass', touch: 'finger', what: 'every strum right, with a finger' },
  oneWrongChord:  { ...B, gate: 'either', mistake: 'wrongBar', what: 'one bar of another chord (the one sharing fewest notes), the rest right' },
  skipTwo:        { ...B, gate: 'either', mistake: 'skip2', what: 'two strums left out, the rest right' },
  holdsOne:       { ...B, gate: 'fail', mistake: 'hold', what: 'strums the first chord all the way through (rows of two or more chords only)' },
  silent:         { ...B, gate: 'fail', silent: true, what: 'plays nothing (the room only)' },
  tapper:         { ...B, gate: 'fail', silent: true, tap: true, what: 'taps the desk on every beat, no chord' },
  mutedStrum:     { ...B, gate: 'fail', silent: true, mute: true, what: 'strums muted strings on every beat: a scratch, no chord' }
};
/* Strum Radar has no gate: `gate` here says what the SCORE should look like (pass: the pattern was strummed; fail: it was not). */
export const PATTERN = {
  right:          { ...B, gate: 'pass', what: 'every written strum, on time (25 ms spread), holding a G chord' },
  late:           { ...B, gate: 'pass', lateMs: 80, what: 'every written strum, 80 ms late' },
  thumb:          { ...B, gate: 'pass', touch: 'thumb', what: 'every written strum, with the thumb' },
  quiet:          { ...B, gate: 'pass', ampX: 0.3, what: 'every written strum, quietly (-10 dB)' },
  missSome:       { ...B, gate: 'either', mistake: 'missQuarter', what: 'leaves out about one written strum in four' },
  extras:         { ...B, gate: 'either', mistake: 'extras', what: 'every written strum plus a strum on every empty eighth (the "eighths" pattern has none)' },
  wrongEighths:   { ...B, gate: 'fail', mistake: 'shift', what: 'strums one eighth late all through: on the empty eighths, not the written ones' },
  silent:         { ...B, gate: 'fail', silent: true, what: 'plays nothing (the room only)' },
  tapper:         { ...B, gate: 'fail', silent: true, tap: true, what: 'taps the desk on every written strum, no guitar' },
  mutedStrum:     { ...B, gate: 'either', silent: true, mute: true, what: 'muted-string scratches on every written strum (a strum with no chord: rhythm right)' }
};
/* Note Runner: per note, not per take. */
export const RUNNER = {
  right:          { ...B, gate: 'pass', what: 'every note right, on time' },
  late:           { ...B, gate: 'pass', lateMs: 100, what: 'every note right, 100 ms late' },
  early:          { ...B, gate: 'pass', lateMs: -100, what: 'every note right, 100 ms early' },
  veryLate:       { ...B, gate: 'fail', lateMs: 250, what: 'every note right but 250 ms late (past the game\'s 180 ms cap)' },
  quiet:          { ...B, gate: 'pass', ampX: 0.3, what: 'every note right, quietly (-10 dB)' },
  thumb:          { ...B, gate: 'pass', touch: 'thumb', what: 'every note right, with the thumb' },
  wrongNotes:     { ...B, gate: 'either', mistake: 'fretOffEvery4', what: 'every fourth note a fret high' },
  skips:          { ...B, gate: 'either', mistake: 'skipEvery4', what: 'every fourth note left out' },
  silent:         { ...B, gate: 'fail', silent: true, what: 'plays nothing (the room only)' }
};

/* A G chord, open (320003), low string first: what the hand holds for Strum Radar. */
const G_CHORD = [43, 47, 50, 55, 59, 67];

export class NotePlayer {
  /* kind: a name in `kinds`; o: { room, lagMs, seed } (the room is a student.mjs room). */
  constructor(kinds, kind, o){
    this.k = kinds[kind];
    if (!this.k) throw new Error('note-student: no such student: ' + kind);
    this.name = kind;
    this.o = Object.assign({ room: 'quiet', lagMs: 70, seed: 1 }, o || {});
    this.r = rng(this.o.seed * 2654435761 + 40503);
    /* The room: a silent student.mjs Student (its neighbours play at a share of a STRUM's level, as in Power Chord Switch). */
    this.roomPlayer = new Student('noGuitar', { room: NOTE_ROOMS[this.o.room] || this.o.room, lagMs: this.o.lagMs, seed: this.o.seed });
    this.touch = TOUCH[this.k.touch];
    this.guitar = new Guitar(this.r, FIT.ringS);
    this.strummer = new Guitar(this.r, STRUM.ringS);
    /* The student's own guitar alone (no room, no mic): the fake world's check reads it (listen-loop.mjs keyCheck). */
    this.clean = new Float32Array(SR * 30);
  }
  /* A pluck on one string (voice 6 - string), and the finger leaving it. */
  pluck(atMs, string, midi, amp){ this.guitar.ev.push({ s: Math.round(atMs / 1000 * SR), k: 6 - string, m: midi, amp: amp * (0.85 + 0.3 * this.r()), touch: this.touch }); }
  lift(atMs, string){ this.guitar.ev.push({ s: Math.round(atMs / 1000 * SR), k: 6 - string, lift: true }); }
  tap(atMs){ this.roomPlayer.hits.push({ s: Math.round(atMs / 1000 * SR), amp: STRUM.amp * this.k.ampX * (0.8 + 0.6 * this.r()), kind: 'bang' }); }
  mute(atMs){ const t = this.touch; this.roomPlayer.hits.push({ s: Math.round(atMs / 1000 * SR), amp: STRUM.amp * this.k.ampX * (0.6 + 0.3 * this.r()), kind: 'mute', n: Math.round((t.spreadMs + 40) / 1000 * SR), spreadN: Math.round(t.spreadMs / 1000 * SR), scrape: t.scrape }); }
  when(listenStartMs, beatMs, beat){ return listenStartMs + beat * beatMs + this.o.lagMs + gauss(this.r) * this.k.sigmaMs + this.k.lateMs; }

  /* A line of single notes (the Listening Coach's melody mode, Note Runner). round: { listenStartMs, beatMs, notes: [{ beat, midis: [..] }] }.
     Returns the key, one entry per written note: { i, want: [midis], played: [midis] | null, did, atMs, at: [{ string, fret }] }.
     did: right | fretOff | wrongString | skipped | silent | tap | mute. */
  playLine(round){
    const { k, r } = this, n = round.notes.length, key = [];
    const one = Math.floor(r() * n);
    let held = [];
    for (let i = 0; i < n; i++){
      const note = round.notes[i], at = this.when(round.listenStartMs, round.beatMs, note.beat);
      const want = place(note.midis);
      let did = 'right', pos = want;
      if (k.silent){ did = k.tap ? 'tap' : k.mute ? 'mute' : 'silent'; if (k.tap) this.tap(at); if (k.mute) this.mute(at); }
      else if (k.mistake === 'fretOffAll' || (k.mistake === 'fretOff1' && i === one) || (k.mistake === 'fretOffEvery4' && i % 4 === 3)){ did = 'fretOff'; pos = want.map(p => ({ string: p.string, fret: p.fret + 1, midi: p.midi + 1 })); }
      else if (k.mistake === 'string1' && i === one){ did = 'wrongString'; pos = [wrongString(want[0])].concat(want.slice(1)); }
      else if ((k.mistake === 'skip1' && i === one) || (k.mistake === 'skipEvery4' && i % 4 === 3)) did = 'skipped';
      const sounds = did === 'right' || did === 'fretOff' || did === 'wrongString';
      if (sounds){
        /* The fretting finger leaves the last note just before the new one is picked (a string picked again stops by itself). */
        if (!k.ring) held.forEach(s => { if (!pos.some(p => p.string === s)) this.lift(at - 15, s); });
        pos.forEach(p => this.pluck(at, p.string, p.midi, FIT.noteAmp * k.ampX));
        held = pos.map(p => p.string);
      }
      key.push({ i, want: want.map(p => p.midi), played: sounds ? pos.map(p => p.midi) : null, did, atMs: sounds || did === 'tap' || did === 'mute' ? at : null,
        sched: round.listenStartMs + note.beat * round.beatMs + this.o.lagMs, at: sounds ? pos.map(p => ({ string: p.string, fret: p.fret })) : null });
    }
    const last = round.notes.length ? round.notes[round.notes.length - 1].beat : 0;
    if (!k.ring) held.forEach(s => this.lift(round.listenStartMs + (last + 1.5) * round.beatMs + this.o.lagMs, s));
    return key;
  }

  /* A chord row (the Coach's chord mode): one strum per beat. round: { listenStartMs, beatMs, slots: [{ chord, midis }], other }: other =
     { name, midis } the chord the `oneWrongChord` student plays for one bar. Key per slot: { i, want, played, wantName, playedName, did, atMs }.
     did: right | wrong (another chord) | held (the first chord, on a slot that wants another) | skipped | silent | tap | mute. */
  playRow(round){
    const { k, r } = this, n = round.slots.length, key = [];
    const firstChange = round.slots.findIndex((s, i) => i > 0 && s.chord !== round.slots[i - 1].chord);
    const wrongFrom = firstChange > 0 ? firstChange : Math.min(4, n - 1);
    const skips = new Set([Math.min(2, n - 1), Math.min(5, n - 1)]);
    for (let i = 0; i < n; i++){
      const slot = round.slots[i], at = this.when(round.listenStartMs, round.beatMs, i);
      let did = 'right', midis = slot.midis, name = slot.chord;
      if (k.silent){ did = k.tap ? 'tap' : k.mute ? 'mute' : 'silent'; if (k.tap) this.tap(at); if (k.mute) this.mute(at); midis = null; name = null; }
      else if (k.mistake === 'hold' && slot.chord !== round.slots[0].chord){ did = 'held'; midis = round.slots[0].midis; name = round.slots[0].chord; }
      else if (k.mistake === 'wrongBar' && i >= wrongFrom && i < wrongFrom + 4){ did = 'wrong'; midis = round.other.midis; name = round.other.name; }
      else if (k.mistake === 'skip2' && skips.has(i)){ did = 'skipped'; midis = null; name = null; }
      if (midis){
        const amp = STRUM.amp * k.ampX;
        this.strummer.strum(at, midis, amp, this.touch);
      }
      key.push({ i, want: slot.midis, wantName: slot.chord, played: midis, playedName: name, did, atMs: midis || did === 'tap' || did === 'mute' ? at : null,
        sched: round.listenStartMs + i * round.beatMs + this.o.lagMs });
    }
    this.strummer.lift(round.listenStartMs + (n + 0.5) * round.beatMs + this.o.lagMs);
    return key;
  }

  /* A strum pattern (Strum Radar). round: { listenStartMs, beatMs, bars, slots: [written? per eighth, 8 a bar] (true/false), dirs }.
     Returns { strums: [{ atMs, eighth, extra }], key }: key per WRITTEN strum, in order: { i, eighth, did, nearMs, wantMs, atMs } where did is played (a
     strum of this student within a quarter of an eighth of it), notPlayed (none within half an eighth), near (between: either verdict is
     fair) and kind says what made the sound (guitar | tap | mute | none). Times are when the sound reaches the mic. */
  playPattern(round){
    const { k, r } = this, eighth = round.beatMs / 2, strums = [];
    for (let b = 0; b < round.bars; b++) for (let e = 0; e < 8; e++){
      const written = round.slots[e], idx = b * 8 + e;
      let play = written;
      if (k.mistake === 'missQuarter' && written && r() < 0.25) play = false;
      if (k.mistake === 'extras' && !written) play = true;
      if (!play) continue;
      const shift = k.mistake === 'shift' ? 1 : 0;
      const at = this.when(round.listenStartMs, eighth, idx + shift);
      if (k.silent){ if (k.tap) this.tap(at); if (k.mute) this.mute(at); if (k.tap || k.mute) strums.push({ atMs: at, eighth: idx + shift, extra: !written, kind: k.tap ? 'tap' : 'mute' }); continue; }
      const dir = round.dirs[e] || 'D', midis = dir === 'U' ? G_CHORD.slice().reverse() : G_CHORD;
      this.strummer.strum(at, midis, STRUM.amp * k.ampX, this.touch);
      strums.push({ atMs: at, eighth: idx + shift, extra: !written, kind: 'guitar' });
    }
    this.strummer.lift(round.listenStartMs + (round.bars * 4 + 0.5) * round.beatMs + this.o.lagMs);
    const key = [];
    for (let b = 0; b < round.bars; b++) for (let e = 0; e < 8; e++){
      if (!round.slots[e]) continue;
      const want = round.listenStartMs + (b * 8 + e) * eighth + this.o.lagMs;
      let near = Infinity, kind = 'none', atMs = null;
      strums.forEach(s => { const d = Math.abs(s.atMs - want); if (d < near){ near = d; kind = s.kind; atMs = s.atMs; } });
      key.push({ i: key.length, eighth: b * 8 + e, did: near <= eighth / 4 ? 'played' : near > eighth / 2 ? 'notPlayed' : 'near', kind: near <= eighth / 2 ? kind : 'none',
        nearMs: isFinite(near) ? Math.round(near) : null, wantMs: want, atMs: near <= eighth / 2 ? atMs : null });
    }
    return { strums, key };
  }

  /* Everything in the air between two times: this student's guitar, the room. Called in order with no gaps (listen-site.mjs worldSource). */
  render(air, fromMs, toMs){
    const a = Math.round(fromMs / 1000 * SR), b = Math.min(air.length, Math.round(toMs / 1000 * SR));
    if (b > this.clean.length){ const c = new Float32Array(Math.max(b, this.clean.length * 2)); c.set(this.clean); this.clean = c; }
    this.guitar.render(this.clean, a, b);
    this.strummer.render(this.clean, a, b);
    for (let s = a; s < b; s++) air[s] += this.clean[s];
    this.roomPlayer.render(air, fromMs, toMs);
  }
}
