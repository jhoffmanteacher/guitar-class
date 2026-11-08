/* Synthetic Power Chord Switch takes (micTakes/<uid>-pw, coach.js ccRecMeta +
   micRecSaveNow) with KNOWN answers, to prove teacher.js micEvalTakePw.
     node tools/mic-sim/fake-pw-take.mjs <out-folder>
   writes every fixture below as <name>.wav + <name>.json (what the console's
   Download WAV / Download data buttons give) and truth.json. tools/checks.mjs
   (1cl) imports PW_FIXTURES + makePwTake and builds them in memory instead.

   The timeline (ms on the recording's clock, the way micRecSaveNow makes the
   times relative):
     · round (stage) k at its own tempo: four count-in beeps (660, 660, 660,
       990 Hz) at C_k + 0..3 beats, listen start L_k = C_k + 4 beats, the
       graded changes at L_k + s × bpc beats (s = 1 .. slots-1), the round's
       end one beat after its last chord; the next count-in starts 0.4 s later
       (0.1 s once the 30 s capture has stopped: COACH_COUNTIN_REC_LEAD);
     · beeps and strums land `lag` ms after they were scheduled (one number,
       or one per round); the student strums on EVERY beat on the beeps they
       hear (± 12 ms, plus `allDev`), a three-string power chord with a pick
       scrape; the first 100 ms of audio are exact zeros (a Chromebook capture
       warming up); `extras` are a neighbour's plucks at the given times;
     · the site's clock runs `map` ms ahead of the recording's. Every strum
       the site hears is an onset at played time = attack + map - micLatencyMs,
       and the site's VERDICTS ARE NOT PLANTED: they come from coach.js
       ccLoop's own rule, run here on those onsets in order — rel = played -
       listenStart - gridOffset; gridOffset += 0.25 × (rel - nearest beat), at most
       CC_GRID_STEP_CAP_MS either way (a take marked `uncapped` is one saved before the cap: no cap, no gridStepCapMs field), when that is under half a beat; the first change still open with
       |its beat - rel| <= win (half a beat, at least 220 ms, at most half the
       gap between changes) takes the strum: 'off' if it was the wrong chord,
       else 'ok'; a change nothing took is 'miss'. Onsets are logged as events
       only while the capture runs (the 30 s cap, Stop).
   Per graded change, `plan` picks what the student does (default: the new
   chord, on time):
     off       the wrong chord (a fret too high), on time
     late:N    N ms late on the beeps they hear (early when N < 0)
     detmiss   strummed, but the site's detector does not hear it
     silent    not strummed, strings muted
     held      not strummed, the old chord rings on, and the site hears an onset
               anyway (noise) at its own beat
     noise:out not strummed; the site hears noise 25 ms past its window's late edge
     in:late / in:early / out:late / out:early   strummed 25 ms inside / outside
               the edge of the site's own window (where the site's grid is)
     at:N      strummed N ms from the centre of the site's window
     beyond:F  strummed F beats past the late edge of the site's window
     pre:in:late  the site hears noise between the raw window edge and its (late)
               window, then a strum 25 ms inside the late edge
   `readings: true` saves the pitch readings the way coach.js ccRecMeta does (takes from 2026-11-05):
   per change null when the verdict is 'miss', 4 readings for 'off' (a wrong verdict needs 3+), and for 'ok'
   0, 1, 2, 3 or 5 readings by [0, 1, 2, 3, 5][change index % 5] (under 3 = passed on timing alone).
   Without it the take has no `readings` key at all, like a take saved before. The truth then holds
   `pitch`: what the evaluator's pitch-rule column must say, worked out here from the planted counts
   and the truth categories (not from teacher.js).
   `deaf`: the site hears nothing at all (every change 'miss'). `drift`: every strum
   slides from on the beat to `drift` ms late over the take. `flipVerdict`: that
   change's saved verdict is flipped after the rule gave it (truth.mismatch).
   Room-noise and soft-strum takes (for the strum what-if, teacher.js
   micEvalStrumRule): the room is steady white noise (`noise`) plus a low rumble
   (`rumble`); the site's strum rule fires on a loudness jump over its smoothed
   level, so:
     burst:J   no strum: a 300 ms burst of LOW-frequency noise whose level is J x
               the room's, on a frame boundary of the site's 50 ms frames
               (`frameMs`); the site hears it (it jumps the full-band level,
               not the pick-attack channel) and grades the change; the recording
               has no strum there (the evaluator's onset finder reads the pick
               attack channel)
     soft:A    a real strum of amplitude A on a frame boundary, with a pick
               scrape that jumps the attack channel, `tau` seconds of ring
     `noStrums`  no strum anywhere else; `skipFirst`  none on beat 0;
     `tailMs`    that much quiet room after the game (the evaluator's attack
               floor is the quiet 20th percentile of the take, so a soft strum
               over a loud room is still a pick attack to it).
   Their truth is MEASURED on the audio, not planted: for each such event the
   jump over the room's level of the full-band and the attack channel
   (this file's own window arithmetic, the loudest of the four 512-sample
   windows that end in the frame after it), and with it whether the site's rule
   fires at each candidate ratio (PW_WHATIF); `truth.whatIf` has the totals per
   candidate. A jump within 6% of a threshold is refused (too close to call).
   truth: per change, dropped (its window runs past the audio's end) or
     agree            site ok/off, a strum in the site's window
     false-hit        site ok/off, no strum in it
     detector-missed  site miss, a strum in it
     off-window       site miss, none in it, but a strum (in the audio or heard by
                      the site) up to a quarter beat outside it (never past half
                      the gap between changes), or that near the beat the
                      student heard (the beeps): played early or late, or the
                      delay setting put the site's window off the strum
     silent-miss      site miss, nothing there
   using the window where the site had it: centre = due + gridOffset + setting
   - map. When fewer than 3 heard strums can be matched to the audio (the map is
   unknown) the evaluator centres on the beeps' lag instead, else on the
   setting, and so does the truth. Per round: lag, ideal = lag + map, skew =
   ideal - setting. Per take: onsets on no beat of the student's grid
   (extra). The generator refuses a take where a strum sits within 8 ms of a
   window edge it did not aim at (too close to call). */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/* The most the site's grid moves for one strum: read from coach.js, so this stand-in for ccLoop cannot drift from it (2026-11-07). */
const GRID_STEP_CAP_MS = Number((/^const CC_GRID_STEP_CAP_MS = (\d+);/m.exec(fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'coach.js'), 'utf8')) || [])[1]);
if (!(GRID_STEP_CAP_MS > 0)) throw new Error('coach.js has no CC_GRID_STEP_CAP_MS (fake-pw-take reads it)');

const R = 24000, CAP_MS = 30000;
// Root midi of each three-finger shape (coach.js CC_POWER_PROGRESSIONS): root, +7, +12.
const ROOT = { E5: 40, F5: 41, G5: 43, A5: 45, B5: 47, C5: 48, D5: 50 };
export const pwWin = (beat, bpc) => Math.min(beat * bpc * 0.5, Math.max(220, beat * 0.5));   // coach.js ccLoop's `win`

const base = { song: 'fake-song', bpc: 1, slots: 8, map: 25, amp: 0.12, clickAmp: 0.03, noise: 0.002 };
export const PW_FIXTURES = [
  { ...base, readings: true, name: 'pw-loud', desc: 'loud, clips; 3 rounds 90/105/120', bpms: [90, 105, 120], chords: ['G5', 'C5'],
    lag: 120, lat: 145, amp: 0.55, clickAmp: 0.06, seed: 11,
    plan: { 1: 'off', 3: 'detmiss', 5: 'late:120', 8: 'held', 11: 'silent', 14: 'late:-110', 17: 'detmiss' } },
  { ...base, readings: true, name: 'pw-quiet', desc: 'quiet mic; 3 rounds 90/105/120', bpms: [90, 105, 120], chords: ['A5', 'D5'],
    lag: 140, map: 30, lat: 120, amp: 0.025, clickAmp: 0.006, noise: 0.0006, seed: 12,
    plan: { 0: 'detmiss', 4: 'held', 7: 'silent', 10: 'off', 13: 'late:130', 20: 'silent' } },
  { ...base, name: 'pw-delay50', desc: 'short mic delay (50 ms), setting 0; 3 rounds 90/105/120', bpms: [90, 105, 120], chords: ['F5', 'G5'],
    lag: 50, map: 20, lat: 0, seed: 13,
    plan: { 2: 'held', 6: 'detmiss', 9: 'silent', 12: 'off', 16: 'held' } },
  { ...base, name: 'pw-delay250', desc: 'long mic delay (250 ms), setting 100; overtones on the beep pitch (E3 x 4 = 659 Hz); 3 rounds 90/105/120', bpms: [90, 105, 120], chords: ['E5', 'A5'],
    lag: 250, map: 35, lat: 100, harm: [1, 0.5, 0.35, 0.3, 0.2, 0.15], seed: 14,
    plan: { 1: 'silent', 5: 'detmiss', 9: 'held', 15: 'late:60', 19: 'off' } },
  { ...base, name: 'pw-cap', desc: 'default 60/75/90: cut by the 30 s cap in round 3 (one window ends 100 ms past the end); the beeps land later each round (130/160/145 ms)', bpms: [60, 75, 90], chords: ['G5', 'C5'],
    lag: [130, 160, 145], lat: 100, start: 746, seed: 15,
    plan: { 2: 'detmiss', 6: 'silent', 9: 'held', 15: 'off', 19: 'detmiss', 20: 'held' } },
  { ...base, readings: true, name: 'pw-pair', desc: 'a pair: one round, 15 changes at 70 BPM, with a neighbour\'s guitar', bpms: [70], slots: 16, chords: ['F5', 'G5'], song: null,
    lag: 160, map: 20, lat: 150, seed: 16, extras: [5150, 9100, 14800], flipVerdict: 5,
    plan: { 3: 'held', 7: 'detmiss', 10: 'silent', 12: 'late:-200' } },
  { ...base, readings: true, name: 'pw-every2-stop', desc: 'every 2 beats (strums between the changes), Stopped in round 2', bpms: [90, 105, 120], bpc: 2, chords: ['A5', 'C5'],
    lag: 110, lat: 100, seed: 17, stopAt: { stage: 1, afterChange: 3, plusMs: 600 },
    plan: { 1: 'held', 3: 'beyond:0.2', 4: 'silent', 8: 'detmiss', 9: 'out:late', 10: 'in:early' } },
  { ...base, name: 'pw-noclicks', desc: 'headphones: no beeps in the audio; setting right', bpms: [90, 105, 120], chords: ['E5', 'G5'],
    lag: 120, map: 30, lat: 150, clickAmp: 0, seed: 18,
    plan: { 3: 'detmiss', 8: 'held', 13: 'silent' } },
  { ...base, name: 'pw-noclicks-wrong', desc: 'no beeps, and the delay setting 140 ms too small; a pluck by a neighbour 30 ms past the grid tolerance', bpms: [80, 95, 110], chords: ['D5', 'G5'],
    lag: 160, map: 30, lat: 50, clickAmp: 0, seed: 19, extras: [5232],
    plan: { 2: 'silent', 6: 'detmiss', 10: 'held', 15: 'off' } },
  { ...base, name: 'pw-fast-beat', desc: 'every beat, 110/125/140 BPM: at 140 the window is capped at half the gap (214 ms, not the 220 ms floor)', bpms: [110, 125, 140], chords: ['B5', 'D5'],
    lag: 100, lat: 125, seed: 20,
    plan: { 2: 'in:late', 5: 'in:early', 9: 'detmiss', 15: 'at:217', 18: 'silent', 20: 'held' } },
  { ...base, name: 'pw-fast-bar', desc: 'every bar at 140 BPM, a pair: the 220 ms floor sets the window; strums 25 ms inside and outside its edges', bpms: [140], bpc: 4, chords: ['F5', 'A5'], song: null,
    lag: 115, lat: 140, seed: 21, stopAt: { stage: 0, afterChange: 5, plusMs: 250 },
    plan: { 0: 'in:late', 1: 'out:late', 2: 'out:early', 3: 'at:217', 4: 'in:early', 5: 'noise:out' } },
  { ...base, name: 'pw-deaf', desc: 'the site hears nothing (its floor is above this mic): every change is judged on the beeps', bpms: [90, 105, 120], chords: ['G5', 'C5'],
    lag: 130, lat: 100, deaf: true, seed: 22,
    plan: { 4: 'silent', 11: 'silent' } },
  { ...base, name: 'pw-late-high-setting', desc: 'reviewer case 1: setting 300 ms (should be 151), every 2 beats, strumming only on the changes, 400 ms behind the beeps: inside the site window, outside one centred on the beeps', bpms: [90], bpc: 2, slots: 6, chords: ['G5', 'C5'], song: null,
    lag: 126, lat: 300, onlyChanges: true, allDev: 400, seed: 23, plan: {} },
  { ...base, name: 'pw-late-low-setting', desc: 'reviewer case 2: setting 100 ms (should be 285), every 2 beats, strumming only on the changes, 200 ms behind the beeps: outside the site window, inside one centred on the beeps', bpms: [120], bpc: 2, slots: 6, chords: ['A5', 'D5'], song: null,
    lag: 250, map: 35, lat: 100, onlyChanges: true, allDev: 200, seed: 24, plan: {} },
  { ...base, name: 'pw-late-every2', desc: 'reviewer case 3: setting right, every 2 beats, strumming only on the changes, 300 ms late', bpms: [120], bpc: 2, slots: 6, chords: ['F5', 'G5'], song: null,
    lag: 120, lat: 145, onlyChanges: true, allDev: 300, seed: 25, plan: {} },
  { ...base, name: 'pw-drift', desc: 'a pair at 60 BPM whose strums drift from on the beat to 300 ms late: the gridOffset of the site follows them far', bpms: [60], slots: 16, chords: ['G5', 'D5'], song: null,
    lag: 120, lat: 145, drift: 300, seed: 26, plan: { 5: 'in:late', 8: 'silent', 10: 'pre:in:late', 11: 'detmiss', 13: 'pre:in:late' } },
  { ...base, name: 'pw-drift-old', desc: 'pw-drift as an older take: saved before the grid step cap (no gridStepCapMs), so the site moved its grid uncapped and the console must replay it that way', bpms: [60], slots: 16, chords: ['G5', 'D5'], song: null,
    lag: 120, lat: 145, drift: 300, seed: 26, uncapped: true, plan: { 5: 'in:late', 8: 'silent', 10: 'pre:in:late', 11: 'detmiss', 13: 'pre:in:late' } },
  { ...base, readings: true, name: 'pw-room-noise', desc: 'every 2 beats at 140 BPM (the window is its 220 ms floor; the mic delay setting 325 ms puts the site 300 ms from the audio: a replay that ignores it misses every window), room noise, no strums at all: low-frequency bursts 1.6 / 2.0 / 2.38 / 2.9 x the room, each one graded by the site (the 2026-11-04 finding)', bpms: [140], bpc: 2, slots: 16, chords: ['G5', 'C5'], song: null, start: 1000,
    lag: 120, map: 25, lat: 325, clickAmp: 0, noise: 0.004, rumble: 0.03, noStrums: true, frameMs: 50, seed: 31,
    plan: { 0: 'burst:1.6', 1: 'burst:2.0', 2: 'burst:2.38', 3: 'burst:2.9', 5: 'burst:2.9', 6: 'burst:2.38', 8: 'burst:2.0', 9: 'burst:1.6', 11: 'burst:2.38', 12: 'burst:2.9', 14: 'burst:1.6' } },
  { ...base, name: 'pw-soft-strums', desc: 'soft real strums over a loud room: pick attacks the evaluator finds, about 2.5 / 2.9 / 3.5 x the room on the attack channel, 1.2 to 1.6 x on the full band', bpms: [140], bpc: 2, slots: 16, chords: ['A5', 'D5'], song: null, start: 1000,
    lag: 300, map: 25, lat: 335, clickAmp: 0, noise: 0.004, rumble: 0.03, tau: 0.25, pf: 0.1, onlyChanges: true, skipFirst: true, frameMs: 50, tailMs: 8000, seed: 32,
    plan: { 0: 'soft:0.01219', 1: 'soft:0.01467', 2: 'soft:0.01876', 3: 'soft:0.01262', 4: 'soft:0.01303', 5: 'soft:0.01896', 6: 'soft:0.01231', 7: 'soft:0.01561', 8: 'soft:0.01665', 9: 'soft:0.01239', 10: 'soft:0.01471', 11: 'soft:0.01911', 12: 'soft:0.01179', 13: 'soft:0.01568', 14: 'soft:0.01790' } }
];
// The candidate ratios the strum what-if tries: the shared ones older takes were graded with (coach.js CHK_ONSET_RATIO 1.4, CHK_HF_RATIO 1.7; Power Chord Switch grades with its own stricter CC_POWER_* since 2026-11-05, and takes graded with those are left out of the what-if) and stricter ones; the attack-channel ratio scales the same way
export const PW_WHATIF = { full: [1.4, 1.8, 2.2, 2.6], hfBase: 1.7, fullBase: 1.4, floor: 0.003, hfFloor: 0.0008, margin: 0.06 };
export const pwWhatIfCandidates = () => PW_WHATIF.full.map(r => ({ ratio: r, hfRatio: Math.round(PW_WHATIF.hfBase * r / PW_WHATIF.fullBase * 100) / 100 }));

export function makePwTake(o){
  let seed = o.seed || 1;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  const S = ms => Math.round(ms / 1000 * R);
  const lagOf = k => Array.isArray(o.lag) ? o.lag[k] : o.lag;
  const allDev = o.allDev || 0;
  let driftAt = () => 0;

  /* ── the site's timeline ── */
  const rounds = [];
  let c1 = o.start || 420, gi = 0, stopMs = null;
  for (let k = 0; k < o.bpms.length; k++){
    const beat = 60000 / o.bpms[k], L = c1 + 4 * beat;
    const rd = { stage: k, bpm: o.bpms[k], beat, c1, listen: L, lag: lagOf(k), win: pwWin(beat, o.bpc), changes: [] };
    for (let s = 1; s < o.slots; s++) rd.changes.push({ i: gi++, s, t: L + s * o.bpc * beat, from: o.chords[(s - 1) % 2], to: o.chords[s % 2], stage: k, bpm: o.bpms[k], kind: o.plan[gi - 1] || 'ok' });
    rounds.push(rd);
    const end = L + (o.slots * o.bpc + 1) * beat;
    if (o.stopAt && o.stopAt.stage === k){ stopMs = rd.changes[o.stopAt.afterChange].t + o.stopAt.plusMs; break; }
    c1 = end + 20 + (end + 20 < CAP_MS ? 400 : 100);
  }
  const lastRound = rounds[rounds.length - 1];
  const gameEnd = stopMs != null ? stopMs : lastRound.listen + (o.slots * o.bpc + 1) * lastRound.beat;
  // `drift`: the student slides from on the beat (first beat) to `drift` ms late (last beat)
  if (o.drift) driftAt = due => o.drift * Math.max(0, Math.min(1, (due - rounds[0].listen) / (gameEnd - rounds[0].listen)));
  const audioEnd = Math.min(CAP_MS, gameEnd + 150 + (o.tailMs || 0));
  const gameAudioEnd = Math.min(CAP_MS, gameEnd + 150);
  const N = S(audioEnd);

  /* ── the audio ── */
  const strums = new Float32Array(N);
  function partial(atMs, f, amp, tau){
    const s0 = S(atMs), n = Math.min(S(1800), N - s0), fade = S(20);
    for (let i = 0; i < n; i++){
      if (s0 + i < 0) continue;
      const env = amp * Math.exp(-i / R / tau) * (i > n - fade ? (n - i) / fade : 1);
      strums[s0 + i] += env * Math.sin(2 * Math.PI * f * i / R);
    }
  }
  function strum(atMs, rootMidi, amp){
    [0, 7, 12].forEach((off, k) => {
      const f = 440 * Math.pow(2, (rootMidi + off - 69) / 12);
      (o.harm || [1, 0.5, 0.25]).forEach((a, h) => partial(atMs + k * 12, f * (h + 1), amp * a / 2 * (o.pf == null ? 1 : o.pf), o.tau || 0.8));
    });
    const s0 = S(atMs);
    for (let i = 0; i < S(12) && s0 + i < N; i++) if (s0 + i >= 0) strums[s0 + i] += (rnd() - 0.5) * amp * 2 * (1 - i / S(12)) * (o.sf == null ? 1 : o.sf);
  }
  // a muted change: the strings are stopped 40 ms before it, so what is ringing dies within ~0.1 s
  const mute = ms => { const m0 = Math.max(0, S(ms)); for (let i = m0; i < N; i++){ const k = Math.exp(-(i - m0) / R / 0.02); if (k < 1e-6){ strums.fill(0, i); break; } strums[i] *= k; } };

  const bursts = [], planted = [];   // what-if events: { ms, J } room bursts; { ch, kind, ms } every burst / soft strum with its change
  const attacks = [];          // every pick attack in the audio: { ms, deliberate }
  const events = [];           // what the site logged (played time, stage)
  /* ccLoop, one onset at a time (played = arrival - micLatencyMs) */
  rounds.forEach(rd => {
    let goff = 0;
    rd.onsets = [];
    rd.siteHear = (played, sharp) => {
      const rel = played - rd.listen - goff;
      const bi = Math.round(rel / rd.beat), dev = rel - bi * rd.beat, before = goff;
      if (Math.abs(dev) < rd.beat * 0.5) goff += o.uncapped ? dev * 0.25 : Math.max(-GRID_STEP_CAP_MS, Math.min(GRID_STEP_CAP_MS, dev * 0.25));
      const ch = rd.changes.find(c => !c.match && Math.abs(c.s * o.bpc * rd.beat - rel) <= rd.win);
      if (ch) ch.match = { played, sharp, goff: before };
      rd.onsets.push({ played, goffAfter: goff });
      if (played + o.lat - o.map < audioEnd) events.push({ t: Math.round(played * 10) / 10, stage: rd.stage });
    };
    rd.goffNow = () => goff;
  });
  // a neighbour's pluck: in the audio, and heard by the site like any onset (in time order, inside a round's play)
  const extras = (o.extras || []).slice().sort((a, b) => a - b);
  const pluck = (ms, rd) => {
    strum(ms, 47, o.amp * 0.6); attacks.push({ ms, deliberate: false, extra: true });
    if (rd && !o.deaf) rd.siteHear(ms + o.map - o.lat, false);
  };
  rounds.forEach(rd => {
    const bySlotBeat = {};
    rd.changes.forEach(ch => { bySlotBeat[ch.s * o.bpc] = ch; });
    for (let m = 0; m < o.slots * o.bpc; m++){
      const due = rd.listen + m * rd.beat;
      if (stopMs != null && due > stopMs) break;
      const ch = bySlotBeat[m];
      if (o.onlyChanges && !ch && m !== 0) continue;
      if (o.skipFirst && m === 0) continue;
      const chord = o.chords[Math.floor(m / o.bpc) % 2];
      let kind = ch ? ch.kind : 'ok', attack = due + rd.lag + allDev + driftAt(due) + (rnd() - 0.5) * 24, deliberate = false;
      // the site hears onsets in time order: a pluck before this beat's strum first
      while (extras.length && extras[0] < attack - 30){ const ms = extras.shift(); pluck(ms, ms + o.map >= rd.listen ? rd : null); }
      const site = X => ch.t + rd.goffNow() + X + o.lat - o.map;   // X ms from the centre of the site's window, on the audio clock
      if (/^late:/.test(kind)) attack = due + rd.lag + allDev + driftAt(due) + +kind.slice(5);
      if (kind === 'pre:in:late'){
        // noise the site hears after the raw window edge (due - win) but before its window opens (gridOffset is late), then a strum 25 ms inside its late edge
        if (rd.goffNow() < 80) throw new Error(o.name + ': change ' + ch.i + ' needs a gridOffset over 80 ms for pre:in:late (has ' + Math.round(rd.goffNow()) + ')');
        if (!o.deaf) rd.siteHear(ch.t - rd.win + 20, false);
        kind = 'in:late';
      }
      else if (/^(in|out):(late|early)$/.test(kind)){ const [io, side] = kind.split(':'); attack = site((side === 'late' ? 1 : -1) * (io === 'in' ? rd.win - 25 : rd.win + 25)); deliberate = true; }
      else if (/^at:/.test(kind)){ attack = site(+kind.slice(3)); deliberate = true; }
      else if (/^beyond:/.test(kind)){ attack = site(rd.win + +kind.slice(7) * rd.beat); deliberate = true; }
      const burstM = /^burst:([\d.]+)$/.exec(kind), softM = /^soft:([\d.]+)$/.exec(kind);
      if (burstM){
        // low-frequency room noise, on a 50 ms frame boundary, 10 ms after the centre of the site's window; the site hears it
        const b = Math.ceil((ch.t + rd.goffNow() + 10 + o.lat - o.map) / 50) * 50;
        bursts.push({ ms: b, J: +burstM[1] }); planted.push({ ch, kind, ms: b });
        if (!o.deaf) rd.siteHear(b + o.map - o.lat, false);
        continue;
      }
      if (softM){
        attack = Math.ceil(attack / 50) * 50;
        strum(attack, ROOT[chord], +softM[1]);
        attacks.push({ ms: attack, deliberate: false }); planted.push({ ch, kind, ms: attack });
        if (!o.deaf) rd.siteHear(attack + o.map - o.lat, false);
        continue;
      }
      if (o.noStrums && kind !== 'held' && kind !== 'silent') continue;
      if (kind === 'silent'){ mute(attack - 40); continue; }
      if (kind === 'held'){ if (!o.deaf) rd.siteHear(ch.t + rd.goffNow() + 10, false); continue; }
      if (kind === 'noise:out'){ if (!o.deaf) rd.siteHear(ch.t + rd.goffNow() + rd.win + 25, false); continue; }
      if (stopMs != null && attack > stopMs) continue;
      strum(attack, ROOT[chord] + (kind === 'off' ? 1 : 0), o.amp);
      attacks.push({ ms: attack, deliberate });
      if (kind !== 'detmiss' && !o.deaf) rd.siteHear(attack + o.map - o.lat, kind === 'off');
    }
  });
  extras.forEach(ms => pluck(ms, null));
  const x = new Float32Array(N);
  // the room: white noise plus a low rumble (one-pole filtered); after the game, `tailMs` of the room quiet
  const gameN = S(gameAudioEnd);
  let rum = 0;
  for (let i = 0; i < N; i++){
    const q = i < gameN ? 1 : 0.25;
    if (o.rumble) rum += ((rnd() - 0.5) * 2 * o.rumble * q - rum) * 0.05;
    x[i] = strums[i] + (rnd() - 0.5) * o.noise * q + rum;
  }
  /* The what-if's truth: the room's level as the site's frames read it (the loudest of four 512-sample windows ending in each 50 ms frame), measured
     on a stretch with nothing played (200-2400 ms), then each planted event's jump over it. This file's own arithmetic, not micEvalStrumFrames'. */
  const frameLevel = (buf, endS) => {
    let f = 0, h = 0;
    for (let j = 0; j < 4; j++){
      const e = endS - j * 256; if (e - 512 < 1) continue;
      let sq = 0, dq = 0;
      for (let i = e - 512; i < e; i++){ sq += buf[i] * buf[i]; const dd = buf[i] - buf[i - 1]; dq += dd * dd; }
      f = Math.max(f, Math.sqrt(sq / 512)); h = Math.max(h, Math.sqrt(dq / 512));
    }
    return { f, h };
  };
  let roomF = 0, roomH = 0, roomN = 0;
  if (planted.length){
    for (let e = Math.ceil(S(200) / 1200) * 1200 + 1200; e <= S(2400); e += 1200){ const l = frameLevel(x, e); roomF += l.f; roomH += l.h; roomN++; }
    roomF /= roomN; roomH /= roomN;
    // a burst: low-frequency noise (one-pole filtered) scaled so the frame holding it is J x the room on the full band
    bursts.forEach(bu => {
      const s0 = S(bu.ms), n = S(300), unit = new Float32Array(n), base0 = x.slice(s0, s0 + n);
      let y = 0, sq = 0;
      for (let i = 0; i < n; i++){ y += ((rnd() - 0.5) - y) * 0.02; unit[i] = y; sq += y * y; }
      // the frame holding it reads the loudest of four windows: search the scale until the frame's jump is J (it only rises with the scale)
      const put = k => { for (let i = 0; i < n && s0 + i < N; i++) x[s0 + i] = base0[i] + unit[i] * k; return frameLevel(x, s0 + 1200).f / roomF; };
      let lo = 0, hi = roomF * 20 / Math.sqrt(sq / n);
      for (let it = 0; it < 40; it++){ const mid = (lo + hi) / 2; if (put(mid) < bu.J) lo = mid; else hi = mid; }
      put((lo + hi) / 2);
    });
  }
  const clickMs = [];
  if (o.clickAmp > 0) rounds.forEach(rd => {
    for (let j = 0; j < 4; j++){
      const at = rd.c1 + j * rd.beat + rd.lag, s0 = S(at), f = j === 3 ? 990 : 660;
      if (at < audioEnd) clickMs.push(at);
      for (let i = 0; i < S(80) && s0 + i < N; i++) x[s0 + i] += o.clickAmp * Math.exp(-i / R / 0.03) * Math.sin(2 * Math.PI * f * i / R);
    }
  });
  for (let i = 0; i < S(100) && i < N; i++) x[i] = 0;
  const pcm = new Int16Array(N);
  for (let i = 0; i < N; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round(x[i] * 32767)));

  /* ── what the site saved, and the truth ── */
  const expected = [], truth = { name: o.name, changes: [], rounds: [], audioEndMs: audioEnd };
  // the map is measurable when 3+ heard strums are real attacks (micEvalTakePw matches events to onsets within 120 ms)
  const realHeard = events.filter(ev => attacks.some(a => Math.abs(ev.t + o.lat - o.map - a.ms) < 20)).length;
  const mapKnown = realHeard >= 3;
  const tooClose = (d, edge, what, deliberate) => { if (!deliberate && Math.abs(Math.abs(d) - edge) < 8) throw new Error(o.name + ': ' + what + ' ' + Math.round(d) + ' ms from a ' + Math.round(edge) + ' ms edge (too close to call)'); };
  rounds.forEach(rd => {
    let n = 0, dropped = 0;
    const gap = o.bpc * rd.beat, reach = Math.min(gap / 2, rd.win + rd.beat / 4);
    const centreKind = mapKnown ? 'site' : o.clickAmp > 0 ? 'beeps' : 'setting';
    rd.changes.forEach(ch => {
      const after = stopMs != null && ch.t > stopMs;
      ch.verdict = after || !ch.match ? 'miss' : ch.match.sharp ? 'off' : 'ok';
      // `flipVerdict`: a saved verdict that the rule of the site does not give (micEvalTakePw replayMismatch must notice)
      if (o.flipVerdict === ch.i) ch.verdict = ch.verdict === 'miss' ? 'ok' : 'miss';
      ch.readings = !o.readings ? undefined : ch.verdict === 'miss' ? null
        : Array.from({ length: ch.verdict === 'off' ? 4 : [0, 1, 2, 3, 5][ch.i % 5] }, (_, j) => Math.round((ROOT[ch.to] + j * 0.07) * 100) / 100);
      expected.push(Object.assign({ i: ch.i, t: Math.round(ch.t * 10) / 10, from: ch.from, to: ch.to, stage: ch.stage, bpm: ch.bpm, verdict: ch.verdict },
        o.readings ? { readings: ch.readings } : {}));
      // the gridOffset the site's window had: the one its strum was judged with, else the one after every onset before the window opened
      const prior = rd.onsets.filter(on => on.played < ch.t - rd.win);
      const goff = ch.match ? ch.match.goff : prior.length ? prior[prior.length - 1].goffAfter : 0;
      const centre = centreKind === 'site' ? ch.t + goff + o.lat - o.map : centreKind === 'beeps' ? ch.t + rd.lag : ch.t + o.lat;
      if (Math.abs(centre + rd.win - audioEnd) < 40) throw new Error(o.name + ': change ' + ch.i + "'s window ends " + Math.round(centre + rd.win - audioEnd) + ' ms from the audio end (too close to call)');
      if (centre + rd.win > audioEnd){ dropped++; truth.changes.push({ i: ch.i, stage: ch.stage, cat: 'dropped', windowPastEndMs: Math.round(centre + rd.win - audioEnd) }); return; }
      n++;
      attacks.forEach(a => { tooClose(a.ms - centre, rd.win, 'a strum near change ' + ch.i + ' is', a.deliberate); if (reach > rd.win) tooClose(a.ms - centre, reach, 'a strum near change ' + ch.i + ' is', a.deliberate); });
      const inWin = attacks.some(a => Math.abs(a.ms - centre) <= rd.win);
      const heard = ch.verdict !== 'miss';
      const siteCentre = ch.t + goff;
      // where the student heard the beat (the beeps): a strum late or early on THAT beat is near too
      const heardBeat = o.clickAmp > 0 ? ch.t + rd.lag : null;
      if (heardBeat != null) attacks.forEach(a => tooClose(a.ms - heardBeat, reach, 'a strum near change ' + ch.i + ' (on the beeps) is', a.deliberate));
      const out = d => Math.abs(d) > rd.win && Math.abs(d) <= reach;
      const near = attacks.some(a => Math.abs(a.ms - centre) > rd.win && (out(a.ms - centre) || (heardBeat != null && Math.abs(a.ms - heardBeat) <= reach))) ||
        events.some(ev => ev.stage === rd.stage && Math.abs(ev.t - siteCentre) > rd.win && Math.abs(ev.t - siteCentre) <= reach);
      truth.changes.push({ i: ch.i, stage: ch.stage, kind: after ? 'after-stop' : ch.kind, verdict: ch.verdict, replayHeard: !!ch.match && !after, goff,
        readingsN: ch.readings ? ch.readings.length : null,
        cat: inWin ? (heard ? 'agree' : 'detector-missed') : heard ? 'false-hit' : near ? 'off-window' : 'silent-miss' });
    });
    truth.rounds.push({ stage: rd.stage, bpm: rd.bpm, n, dropped, clicks: o.clickAmp > 0 && rd.c1 + 3 * rd.beat + rd.lag + 80 < audioEnd, centre: centreKind,
      lagMs: rd.lag, idealMs: rd.lag + o.map, skewMs: rd.lag + o.map - o.lat });
  });
  // onsets on no beat of the student's grid (micEvalTakePw room.extra): the beeps' lag, else the setting less the map
  const tol = rd => Math.max(150, rd.beat * 0.35);
  const grid = [];
  rounds.forEach(rd => {
    const offs = o.clickAmp > 0 ? rd.lag : mapKnown ? o.lat - o.map : o.lat, last = rd.changes[rd.changes.length - 1].t;
    for (let m = -4; rd.listen + m * rd.beat <= last + (o.bpc - 0.5) * rd.beat; m++) grid.push([rd.listen + m * rd.beat + offs, tol(rd)]);
  });
  truth.extra = attacks.concat(clickMs.map(ms => ({ ms }))).filter(a => a.ms < audioEnd).filter(a => {
    const d = Math.min(...grid.map(g => Math.abs(g[0] - a.ms) - g[1]));
    if (Math.abs(d) < 8) throw new Error(o.name + ': an onset ' + Math.round(d) + ' ms from the grid tolerance (too close to call)');
    return d >= 0;
  }).length;
  if (planted.length){
    const cands = pwWhatIfCandidates(), M = PW_WHATIF.margin;
    const events2 = planted.map(pl => {
      const l = frameLevel(x, S(pl.ms) + 1200), full = l.f / roomF, hf = l.h / roomH;
      const fires = cands.map(c => {
        const close = (v, t) => Math.abs(v - t) < M * t;
        if ((close(full, c.ratio) && !(hf > c.hfRatio * (1 + M))) || (close(hf, c.hfRatio) && !(full > c.ratio * (1 + M))))
          throw new Error(o.name + ': change ' + pl.ch.i + ' (' + pl.kind + ') jumps ' + full.toFixed(2) + ' full-band / ' + hf.toFixed(2) + ' attack channel, within ' + (M * 100) + '% of the ' + c.ratio + ' / ' + c.hfRatio + ' thresholds (too close to call)');
        return (full > c.ratio && roomF > PW_WHATIF.floor) || (hf > c.hfRatio && roomH > PW_WHATIF.hfFloor);
      });
      if (!fires[0]) throw new Error(o.name + ': change ' + pl.ch.i + ' (' + pl.kind + ') would not fire at the site\'s own ratios (' + full.toFixed(2) + ' / ' + hf.toFixed(2) + ') yet the site is made to hear it');
      // what the evaluator must make of it: a soft strum is a pick attack (attack channel over its 2.2 x base), room noise is not
      if (/^soft/.test(pl.kind) && hf < 2.2 * (1 + M)) throw new Error(o.name + ': change ' + pl.ch.i + ' (' + pl.kind + ') jumps the attack channel only ' + hf.toFixed(2) + ' x: the evaluator would not find it');
      if (/^burst/.test(pl.kind) && hf > 2.0) throw new Error(o.name + ': change ' + pl.ch.i + ' (' + pl.kind + ') jumps the attack channel ' + hf.toFixed(2) + ' x: not room noise');
      return { i: pl.ch.i, kind: pl.kind, full: Math.round(full * 100) / 100, hf: Math.round(hf * 100) / 100, fires };
    });
    const byCh = new Map(events2.map(e => [e.i, e]));
    truth.whatIf = { frameMs: o.frameMs, roomRms: roomF, roomHf: roomH, events: events2, candidates: cands.map((c, k) => {
      const r = { ...c, strums: events2.filter(e => e.fires[k]).length, judged: 0, reproduced: 0, falseHits: 0, falseHitsRemoved: 0, agree: 0, realLost: 0 };
      truth.changes.forEach(tc => {
        if (tc.cat === 'dropped') return;
        r.judged++;
        const ev = byCh.get(tc.i), fires = ev ? ev.fires[k] : false;
        if (fires === (tc.verdict !== 'miss')) r.reproduced++;
        if (tc.cat === 'false-hit'){ r.falseHits++; if (!fires) r.falseHitsRemoved++; }
        if (tc.cat === 'agree'){ r.agree++; if (!fires) r.realLost++; }
      });
      return r;
    }) };
  }
  /* The pitch rule's column ("no readable pitch, no tick"): of the changes graded right, those with under 3 readings would lose their tick.
     Worked out here from the planted counts and the categories above. null for a take with no readings (an older take). */
  {
    const jd = truth.changes.filter(c => c.cat !== 'dropped'), right = jd.filter(c => c.verdict === 'ok'), low = c => c.readingsN < 3;
    truth.pitch = !o.readings ? null : {
      right: right.length, withPitch: right.filter(c => !low(c)).length, timingOnly: right.filter(low).length, unknown: 0,
      falseHits: jd.filter(c => c.cat === 'false-hit').length, agree: jd.filter(c => c.cat === 'agree').length,
      falseHitsRemoved: right.filter(c => c.cat === 'false-hit' && low(c)).length, realLost: right.filter(c => c.cat === 'agree' && low(c)).length
    };
  }
  truth.mapKnown = mapKnown;
  truth.mismatch = truth.changes.filter(c => c.cat !== 'dropped' && c.replayHeard !== (c.verdict !== 'miss')).length;
  const meta = {
    game: 'pw', complete: stopMs == null, progression: o.chords.join('-'), song: o.song, ladder: o.bpms.length > 1,
    bpm: o.bpms[0], stageBpms: o.bpms.slice(), bpc: o.bpc, eventTimes: 'played (arrival - micLatencyMs)',
    ...(o.uncapped ? {} : { gridStepCapMs: GRID_STEP_CAP_MS }),   // an `uncapped` take is one saved before 2026-11-07: no such field, graded on the uncapped grid
    ...(o.readings ? { changeReadings: 'per change: null = no strum in its window; [] = a strum but no pitch could be read; else the midi readings its chord check used (under 3 passes on timing alone)' } : {}),
    expected, events, uid: 'fake', name: 'Fake Student', period: '3', mode: 'pw',
    micLatencyMs: o.lat, sampleRate: R, srcSampleRate: 48000, durationSec: Math.round(N / R * 100) / 100,
    micLabel: 'Internal Microphone (Built-in)',
    userAgent: 'Mozilla/5.0 (X11; CrOS x86_64 16093.68.0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36',
    frameMeanMs: o.frameMs || 48.2, frameMaxMs: 131, lang: 'en', chunks: 2, savedAt: '2026-11-04T17:00:00.000Z'
  };
  return { pcm, meta, truth };
}

export function wavBytes(pcm){
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length * 2, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22); h.writeUInt32LE(R, 24); h.writeUInt32LE(R * 2, 28);
  h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(pcm.length * 2, 40);
  return Buffer.concat([h, Buffer.from(pcm.buffer, pcm.byteOffset, pcm.byteLength)]);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)){
  const out = process.argv[2];
  if (!out){ console.error('usage: node tools/mic-sim/fake-pw-take.mjs <out-folder>'); process.exit(2); }
  fs.mkdirSync(out, { recursive: true });
  const all = [];
  PW_FIXTURES.forEach(f => {
    const { pcm, meta, truth } = makePwTake(f);
    fs.writeFileSync(path.join(out, f.name + '.wav'), wavBytes(pcm));
    fs.writeFileSync(path.join(out, f.name + '.json'), JSON.stringify(meta, null, 1));
    all.push(truth);
    const c = {}; truth.changes.forEach(ch => { c[ch.cat] = (c[ch.cat] || 0) + 1; });
    console.log(f.name.padEnd(20) + ' ' + meta.durationSec + ' s  ' + Object.entries(c).map(([k, v]) => k + ' ' + v).join(' · ') + '  extra ' + truth.extra + '  (' + f.desc + ')');
  });
  fs.writeFileSync(path.join(out, 'truth.json'), JSON.stringify(all, null, 1));
}
