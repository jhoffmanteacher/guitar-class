/* The virtual student (2026-11-11): one model of a student playing guitar into a
   Chromebook, for closed-loop tests. It writes SOUND (what reaches the mic) and
   keeps the ANSWER KEY (what was really played), so a test can compare the
   site's verdict with the truth. It knows nothing about the site: the runner
   (closed-loop.mjs) tells it the round the game is asking for and feeds its
   sound to the real listening code.

   What it models
     guitar    plucked strings (Karplus-Strong: a noise burst going round a
               delay line, so the attack, the overtones and the decay come out
               together, unlike the sine sums in the older tools here); a strum
               is the chord's strings one after another; a string rings until
               it is plucked again or the hand lifts.
     hand      `touch`: pick (bright, a scrape, fast strum), thumb (dark, soft
               attack, slow strum), finger (between the two).
     mistakes  per graded change: the wrong chord (the shape one fret high), a
               chord that never changed (held), no strum at all (skip).
     rhythm    every strum early or late by a spread (`sigmaMs`), a constant
               lean (`lateMs`), extra lateness on the change itself
               (`changeLateMs`: the hand is still moving), a drifting tempo.
     room      steady noise, a low rumble, other guitars, bangs (a chair, a case).
     device    the laptop mic: how loud it hears, how much of the low notes it
               loses (`hp`: a small mic hears little under about 200 Hz).

   NOT modelled: fret buzz, a half-muted string, bends, automatic gain in the
   OS, room echo. Levels are the raw-mic levels tools/mic-sim/fake-pw-take.mjs uses
   (strum about 0.12, quiet room 0.002). One number is fitted to the classroom
   takes (`ringS`, below); the touches, the rooms and the mics are not.
   Until it is, read every number this produces as "the model says", not "the
   classroom does". */

export const SR = 48000;

export function rng(seed){
  let a = seed >>> 0;
  return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
export function gauss(r){ let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

/* How the hand meets the strings. bright: 0..1, how much of the pluck's high end
   survives; scrape: the pick's click, as a share of the note; spreadMs: low string
   to high string; riseMs: how long the pluck takes to reach full level. */
export const TOUCH = {
  pick:   { bright: 0.85, scrape: 0.9,  spreadMs: 22, riseMs: 1 },
  finger: { bright: 0.45, scrape: 0.15, spreadMs: 38, riseMs: 4 },
  thumb:  { bright: 0.22, scrape: 0.03, spreadMs: 60, riseMs: 9 }
};

/* Rooms, raw mic levels. neighbours: strums per second from the other guitars (three of them, each ringing until its next strum); nbLevel: how
   loud one of them is at this student's mic, as a share of the student's own guitar; bangs: per second. These four are guesses of what "a
   partner", "a class" and "a loud class" sound like; the first thing to fit to real takes. */
export const ROOMS = {
  quiet:   { noise: 0.002, rumble: 0.001, neighbours: 0,   nbLevel: 0,    bangs: 0 },
  pair:    { noise: 0.003, rumble: 0.002, neighbours: 0.8, nbLevel: 0.25, bangs: 0 },
  class:   { noise: 0.006, rumble: 0.004, neighbours: 1.5, nbLevel: 0.12, bangs: 0.05 },
  loud:    { noise: 0.02,  rumble: 0.02,  neighbours: 3,   nbLevel: 0.3,  bangs: 0.15 }
};

/* Laptop mics. hp: Hz below which the mic loses level (0 = a flat mic). */
export const MICS = {
  flat:       { gain: 1,   hp: 0 },
  chromebook: { gain: 1,   hp: 180 },
  thin:       { gain: 0.6, hp: 320 }
};

/* ringS: seconds a string rings (to 1/e). The one number here fitted to real takes (2026-11-11): on the 12 classroom takes of 2026-11-04
   (40-90 BPM) the strum rule at 1.8 / 2.19 lost 1 of 132 real strums and at 2.2 / 2.67 lost 4 (WORKFLOW.md, "Strum what-if"). The steady
   student in a quiet room and a class at 40 / 60 / 90 BPM loses 0% / 0-2% with 0.8 s and 0% / 3-7% with 1.2 s; 2.5 s (a guess at an open
   string left alone) lost 2% / 22%, so that guitar was far too hard to hear. A strum is heard as a jump over the chord still ringing, so
   this number matters more than any other here. */
const RING = 1.0;
/* Students. Probabilities are per graded change; times are ms. strums: 'beat' =
   strum on every beat (what the game's tip asks for), 'change' = only when the
   chord changes. */
const BASE = { touch: 'pick', amp: 0.12, ringS: RING, strums: 'beat', pWrong: 0, pHeld: 0, pSkip: 0, sigmaMs: 25, lateMs: 0, changeLateMs: 0, drift: 0, liftMs: 90 };
export const STUDENTS = {
  steady:     { ...BASE },
  beginner:   { ...BASE, pWrong: 0.12, pHeld: 0.08, pSkip: 0.08, sigmaMs: 60, changeLateMs: 70 },
  thumb:      { ...BASE, touch: 'thumb' },
  finger:     { ...BASE, touch: 'finger' },
  soft:       { ...BASE, amp: 0.03 },
  softThumb:  { ...BASE, touch: 'thumb', amp: 0.03 },
  late:       { ...BASE, lateMs: 120 },
  loose:      { ...BASE, sigmaMs: 90 },
  changeOnly: { ...BASE, strums: 'change' },
  wrongFret:  { ...BASE, pWrong: 1 },
  neverMoves: { ...BASE, pHeld: 1 },
  noGuitar:   { ...BASE, silent: true }
};

/* One string. pluck() starts a note; lift() lets it die in about 30 ms. */
class StringVoice {
  constructor(r){ this.r = r; this.buf = new Float32Array(2); this.L = 0; this.i = 0; this.on = false; this.rho = 0; this.prev = 0; this.ax = 0; this.ay = 0; this.C = 0; this.rise = 0; this.riseN = 1; }
  pluck(midi, amp, touch, ringS){
    const f = 440 * Math.pow(2, (midi - 69) / 12), D = SR / f;
    const L = Math.floor(D - 0.6), d = D - 0.5 - L;
    this.L = L; this.C = (1 - d) / (1 + d); this.i = 0; this.prev = 0; this.ax = 0; this.ay = 0;
    if (this.buf.length < L) this.buf = new Float32Array(L);
    // the pluck: noise, darkened by the touch, with the notch a pluck a fifth of the way along the string makes
    const raw = new Float32Array(L);
    let lp = 0, e = 0;
    const a = 0.04 + 0.96 * touch.bright * touch.bright;
    for (let k = 0; k < L; k++){ lp += (this.r() * 2 - 1 - lp) * a; raw[k] = lp; }
    const notch = Math.max(1, Math.round(L / 5));
    for (let k = 0; k < L; k++){ const v = raw[k] - raw[(k + L - notch) % L]; this.buf[k] = v; e += v * v; }
    const g = amp / (Math.sqrt(e / L) || 1);
    for (let k = 0; k < L; k++) this.buf[k] *= g;
    // how long the string rings (seconds to 1/e of its level)
    this.rho = Math.exp(-1 / (ringS * f));
    this.rise = 0; this.riseN = Math.max(1, Math.round(touch.riseMs / 1000 * SR));
    this.left = 8 * SR;   // after 8 s a string is far under the room (e^-3.2 of its start): stop computing it
    this.on = true;
  }
  lift(){ if (this.on){ this.rho = Math.min(this.rho, Math.exp(-1 / (0.03 * SR / this.L))); this.left = Math.min(this.left, Math.round(0.3 * SR)); } }
  tick(){
    if (!this.on) return 0;
    if (--this.left <= 0){ this.on = false; return 0; }
    const out = this.buf[this.i];
    const lp = this.rho * 0.5 * (out + this.prev); this.prev = out;
    const ap = this.C * lp + this.ax - this.C * this.ay; this.ax = lp; this.ay = ap;
    this.buf[this.i] = ap;
    if (++this.i >= this.L) this.i = 0;
    return this.rise < this.riseN ? out * (this.rise++ / this.riseN) : out;
  }
}

/* A guitar being played: a list of timed events rendered into `air` (Float32Array,
   sample 0 = time 0 ms). */
class Guitar {
  constructor(r, ringS){ this.r = r; this.ringS = ringS; this.voices = Array.from({ length: 6 }, () => new StringVoice(r)); this.ev = []; }
  strum(atMs, midis, amp, touch){
    midis.forEach((m, k) => this.ev.push({ s: Math.round((atMs + k * touch.spreadMs / Math.max(1, midis.length - 1)) / 1000 * SR), k, m, amp: amp * (0.85 + 0.3 * this.r()), touch }));
    for (let k = midis.length; k < 6; k++) this.ev.push({ s: Math.round(atMs / 1000 * SR), k, lift: true });
  }
  lift(atMs){ for (let k = 0; k < 6; k++) this.ev.push({ s: Math.round(atMs / 1000 * SR), k, lift: true }); }
  render(air, fromS, toS){
    this.ev.sort((a, b) => a.s - b.s);
    let e = 0, scrapeLeft = 0, scrapeN = 1, scrapeAmp = 0;
    const end = Math.min(toS, air.length);
    for (let s = Math.max(0, fromS); s < end; s++){
      while (e < this.ev.length && this.ev[e].s <= s){
        const x = this.ev[e++];
        if (x.lift) this.voices[x.k].lift();
        else {
          this.voices[x.k].pluck(x.m, x.amp, x.touch, this.ringS);
          scrapeN = scrapeLeft = Math.round(0.006 * SR); scrapeAmp = x.amp * x.touch.scrape;
        }
      }
      let v = 0;
      for (let k = 0; k < 6; k++) v += this.voices[k].tick();
      if (scrapeLeft > 0){ v += (this.r() * 2 - 1) * scrapeAmp * (scrapeLeft / scrapeN); scrapeLeft--; }
      air[s] += v;
    }
    this.ev = this.ev.filter(x => x.s >= end);
  }
}

/* The student. play(round) is called once per round, as soon as the game has set
   it up, and returns that round's answer key.
     round: { listenStartMs, beatMs, bpc, slots, seq: [chord names], midis: { name: [midi] } }
   The student hears the count-in `opts.lagMs` late in total (speaker out, mic in)
   and plays on what they hear, so a strum meant for beat b reaches the mic at
   listenStart + b * beatMs + lagMs + (their own timing). */
export class Student {
  constructor(profile, opts){
    this.p = typeof profile === 'string' ? STUDENTS[profile] : profile;
    if (!this.p) throw new Error('no such student: ' + profile);
    this.o = Object.assign({ room: 'quiet', lagMs: 70, seed: 1 }, opts || {});
    this.room = typeof this.o.room === 'string' ? ROOMS[this.o.room] : this.o.room;
    if (!this.room) throw new Error('no such room: ' + this.o.room);
    this.r = rng(this.o.seed * 2654435761);
    this.guitar = new Guitar(this.r, this.p.ringS);
    this.others = Array.from({ length: 3 }, () => new Guitar(this.r, BASE.ringS));
    this.roomAt = 0; this.rum = 0; this.nextNb = 0; this.nextBang = 0; this.bangs = [];
  }
  play(round){
    const { p, r } = this, touch = TOUCH[p.touch];
    const key = [];
    const beats = round.slots * round.bpc;
    let tempoErr = 0;
    for (let b = 0; b < beats; b++){
      const slot = Math.floor(b / round.bpc), isChange = b % round.bpc === 0 && slot > 0;
      const want = round.seq[slot], prev = slot > 0 ? round.seq[slot - 1] : null;
      tempoErr += p.drift * round.beatMs;
      const dev = gauss(r) * p.sigmaMs + p.lateMs + tempoErr + (isChange ? Math.abs(gauss(r)) * p.changeLateMs : 0);
      const at = round.listenStartMs + b * round.beatMs + this.o.lagMs + dev;
      let did = 'right';
      if (isChange){
        const x = r();
        did = p.silent ? 'silent' : x < p.pSkip ? 'silent' : x < p.pSkip + p.pHeld ? 'held' : x < p.pSkip + p.pHeld + p.pWrong ? 'wrong' : 'right';
        this.cur = did === 'held' ? (this.cur || round.midis[prev]) : did === 'wrong' ? round.midis[want].map(m => m + 1) : did === 'right' ? round.midis[want] : this.cur;
        key.push({ beat: b, from: prev, to: want, did, devMs: did === 'silent' ? null : dev, atMs: did === 'silent' ? null : at });
        if (did === 'silent'){ if (!p.silent) this.guitar.lift(at - p.liftMs); continue; }
        if (did !== 'held') this.guitar.lift(at - p.liftMs);   // the hand leaves the old chord before the new one sounds
      } else {
        if (p.silent || (p.strums === 'change' && b > 0)) continue;
        if (b === 0) this.cur = round.midis[want];
      }
      if (this.cur) this.guitar.strum(at, this.cur, p.amp, touch);
    }
    this.guitar.lift(round.listenStartMs + (beats + 0.5) * round.beatMs + this.o.lagMs);
    return key;
  }
  /* Everything in the air between two times: this guitar, the room, the others. Call it in order, with no gaps. */
  render(air, fromMs, toMs){
    const { r, room } = this, a = Math.round(fromMs / 1000 * SR), b = Math.min(air.length, Math.round(toMs / 1000 * SR));
    const myAmp = this.p.amp;
    while (room.neighbours > 0 && this.nextNb < toMs){
      if (this.nextNb >= fromMs){
        const root = 40 + Math.floor(r() * 12), tk = r() < 0.7 ? TOUCH.pick : TOUCH.thumb;
        this.others[Math.floor(r() * this.others.length)].strum(this.nextNb, [root, root + 7, root + 12], myAmp * room.nbLevel * (0.5 + r()), tk);
      }
      this.nextNb = Math.max(this.nextNb, fromMs) - Math.log(1 - r()) * 1000 / room.neighbours;
    }
    while (room.bangs > 0 && this.nextBang < toMs){
      if (this.nextBang >= fromMs) this.bangs.push({ s: Math.round(this.nextBang / 1000 * SR), amp: myAmp * (0.5 + r()) });
      this.nextBang = Math.max(this.nextBang, fromMs) - Math.log(1 - r()) * 1000 / room.bangs;
    }
    this.guitar.render(air, a, b);
    this.others.forEach(g => g.render(air, a, b));
    for (let s = a; s < b; s++){
      this.rum += ((r() * 2 - 1) * room.rumble * 12 - this.rum) * 0.004;
      air[s] += (r() * 2 - 1) * room.noise * 1.73 + this.rum;
    }
    // a bang: 60 ms of low thump with a click on top
    this.bangs = this.bangs.filter(bg => {
      const n = Math.round(0.06 * SR);
      for (let s = Math.max(a, bg.s); s < Math.min(b, bg.s + n); s++){ const k = s - bg.s; air[s] += bg.amp * Math.exp(-k / (0.015 * SR)) * (Math.sin(2 * Math.PI * 110 * k / SR) + 0.5 * (r() * 2 - 1)); }
      return bg.s + n > b;
    });
  }
}

/* A Web Audio biquad (the same formulas the browser uses), for the laptop mic and for the site's own filters. */
export function biquad(type, freq, Q){
  const w = 2 * Math.PI * freq / SR, cs = Math.cos(w), al = Math.sin(w) / (2 * Q);
  let b0, b1, b2;
  if (type === 'highpass'){ b0 = (1 + cs) / 2; b1 = -(1 + cs); b2 = (1 + cs) / 2; }
  else if (type === 'lowpass'){ b0 = (1 - cs) / 2; b1 = 1 - cs; b2 = (1 - cs) / 2; }
  else throw new Error('biquad: ' + type);
  const a0 = 1 + al, a1 = -2 * cs, a2 = 1 - al;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return x => { const y = (b0 * x + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0; x2 = x1; x1 = x; y2 = y1; y1 = y; return y; };
}
