/* Recorded takes as SOUND for the listening bench (2026-11-12): a folder of anonymized pairs (T01.wav + T01.json, from anon-takes.mjs),
   every game. Imported by room-onsets.mjs and no-guitar-listen.mjs; not a command. Student audio: nothing here writes a file or prints a
   name; callers print take numbers (T01...) and counts only.

   The truth about where a pick or a strum really hit is the console's evaluator's attack detector (teacher-mic.js micEvalSignal: a jump in
   the first-difference level over its own running base, 2.2 x, and 4 x over the take's 20th-percentile floor), never the site's onset rule
   that the bench is testing. Its blind spot: an attack softer than that (a thumb, a very soft pluck) is not found, so a sound the site's
   rule takes there is counted as "no attack".

   ROOM stretches: the parts of a take with no attack in them and, by a margin, nobody playing:
     - from ROOM_AFTER_MS after an attack to ROOM_BEFORE_MS before the next one (the student's own string has had a second to fade; it
       still rings softly: that is the "chord left ringing" a classroom has too);
     - never the count-ins (the site's own clicks): nothing before the take's first expected note + 300 ms, and for Power Chord Switch
       nothing from each round's count-in to its first change + 300 ms;
     - never the capture's warm-up (the first 500 ms) or a run of exact zeros, never past the end;
     - at least ROOM_MIN_MS long. */
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readWav, prepare } from './replay-takes.mjs';
import { extract } from './extract.mjs';
import { siteSource } from '../site-src.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
export const ROOM_AFTER_MS = 1000, ROOM_BEFORE_MS = 300, ROOM_MIN_MS = 400;

/* micEvalSignal from the console (teacher.js), as eval-takes.mjs lifts it. */
let evalSignal = null;
function signalFn(root){
  if (!evalSignal){
    const src = siteSource('teacher.js', root || ROOT);
    evalSignal = new Function(extract(src, 'micEvalSignal') + '\nreturn micEvalSignal;')();
  }
  return evalSignal;
}
/* The game a take is from, by its own JSON: 'pw' Power Chord Switch, 'coach-melody', 'coach-chords', 'nr' Note Runner. */
export function takeGame(d){ return d.mode === 'pw' ? 'pw' : d.mode === 'nr' ? 'nr' : d.mode === 'coach' ? 'coach-' + (d.coachMode || 'melody') : 'other'; }

export function loadTakeAudio(folder, root){
  const dir = resolve(folder), out = [];
  const names = readdirSync(dir).filter(f => /^T\d+\.wav$/.test(f)).sort();
  for (const f of names){
    const base = join(dir, f.replace(/\.wav$/, '')), d = JSON.parse(readFileSync(base + '.json', 'utf8')), wav = readWav(base + '.wav');
    const pcm = new Int16Array(wav.x.length);
    for (let i = 0; i < pcm.length; i++) pcm[i] = Math.max(-32768, Math.min(32767, Math.round(wav.x[i] * 32768)));
    const sig = signalFn(root)(pcm, wav.sr, { GATE: 0.004, GAIN: 3 });
    out.push({ take: f.replace(/\.wav$/, ''), game: takeGame(d), d, wav, sr: wav.sr, srcRate: Number(d.srcSampleRate) || wav.sr, attacks: sig.onsets.map(o => o.ms),
      durMs: wav.x.length / wav.sr * 1000, period: d.period == null ? null : String(d.period).slice(0, 4) });
  }
  return out;
}

/* [from, to] ms stretches of a take with nobody playing (above). */
export function roomRegions(tk){
  const d = tk.d, x = tk.wav.x, sr = tk.sr, banned = [[0, 500]];
  const exp = (Array.isArray(d.expected) ? d.expected : []).filter(e => e && e.t != null);
  if (exp.length) banned.push([0, exp[0].t + 300]);
  if (tk.game === 'pw'){
    const stages = [...new Set(exp.map(e => e.stage || 0))];
    for (const st of stages){
      const first = exp.filter(e => (e.stage || 0) === st).sort((a, b) => a.t - b.t)[0];
      const bpm = Number(first.bpm) || d.bpm || 60, beat = 60000 / bpm, cin = Array.isArray(d.countInBeats) && d.countInBeats[st] ? d.countInBeats[st] : 4;
      banned.push([first.t - ((d.bpc || 1) + cin + 1) * beat, first.t + 300]);
    }
  }
  /* runs of exact zeros (the capture's warm-up, a dropout): 20 ms or longer */
  let z0 = -1;
  for (let i = 0; i <= x.length; i++){
    if (i < x.length && x[i] === 0){ if (z0 < 0) z0 = i; continue; }
    if (z0 >= 0 && i - z0 >= 0.02 * sr) banned.push([z0 / sr * 1000 - 50, i / sr * 1000 + 50]);
    z0 = -1;
  }
  const att = tk.attacks.slice().sort((a, b) => a - b), cand = [];
  let from = 0;
  for (const a of att.concat([tk.durMs + ROOM_BEFORE_MS])){
    const lo = from, hi = a - ROOM_BEFORE_MS;
    if (hi - lo >= ROOM_MIN_MS) cand.push([lo, Math.min(hi, tk.durMs)]);
    from = a + ROOM_AFTER_MS;
  }
  let regs = cand;
  for (const [b0, b1] of banned){
    const next = [];
    for (const [r0, r1] of regs){
      if (b1 <= r0 || b0 >= r1){ next.push([r0, r1]); continue; }
      if (b0 - r0 >= ROOM_MIN_MS) next.push([r0, b0]);
      if (r1 - b1 >= ROOM_MIN_MS) next.push([b1, r1]);
    }
    regs = next;
  }
  return regs.filter(([a, b]) => b - a >= ROOM_MIN_MS);
}

/* One take's room stretches spliced end to end (30 ms cross-fades), repeated until it lasts `ms`, through the site's mic chain at the
   take's own capture rate. Returns { proc, srcRate, joins: [ms of each join in the result], seconds: room seconds the take gave }. */
export function roomSound(tk, ms, chain){
  const regs = roomRegions(tk), sr = tk.sr, x = tk.wav.x, fade = Math.round(0.03 * sr), need = Math.ceil(ms / 1000 * sr);
  const total = regs.reduce((n, [a, b]) => n + (b - a), 0);
  if (!regs.length) return null;
  const out = new Float32Array(need), joins = [];
  let o = 0, k = 0;
  while (o < need){
    const [a, b] = regs[k % regs.length], s0 = Math.round(a / 1000 * sr), s1 = Math.round(b / 1000 * sr);
    if (o > 0) joins.push(o / sr * 1000);
    const start = o > 0 ? o - fade : 0;
    for (let i = 0; i < s1 - s0 && start + i < need; i++){
      const v = x[s0 + i], j = start + i;
      if (o > 0 && i < fade){ const w = i / fade; out[j] = out[j] * (1 - w) + v * w; } else out[j] = v;
    }
    o = Math.min(need, start + (s1 - s0));
    k++;
  }
  return { proc: prepare({ x: out, sr }, tk.srcRate, chain), srcRate: tk.srcRate, joins: joins.map(j => j * 1), seconds: total / 1000, regions: regs.length };
}
