/* How often the SHARED onset rule hears a "note" where nobody played, in the real rooms (2026-11-12, the listening bench, step 1b).

     node tools/mic-sim/room-onsets.mjs <folder of anonymized takes: T01.wav + T01.json ...> [--root=<site folder>] [--json=<file>]

   Every recorded take (any game: its audio is evidence about the room and the mic) is played through the REAL Listening Coach loop
   (coachLoop, loaded unchanged: tools/mic-sim/listen-site.mjs) as an onset probe: a 32-note drill at 30 BPM with no mic delay, so it
   listens to the whole take and logs every sound its onset test takes (coach.events). That test is the one every beat-graded loop
   carries a copy of (coachLoop, nrLoop, srLoop, ccLoop for Change Up): CHK_ONSET_FLOOR / CHK_ONSET_RATIO / CHK_HF_FLOOR / CHK_HF_RATIO
   over coachReadFrame / coachSmooth, with COACH_ONSET_REFRACT.
   The truth (independent of that rule): the console evaluator's attack detector (micEvalSignal, teacher-mic.js) and the room stretches
   of tools/mic-sim/takes-audio.mjs (no attack, a second after the last one, no count-in). A probe onset more than MATCH_MS from every
   evaluator attack is "where the evaluator finds no attack".
   Printed, per take and in all, with denominators:
     - onsets with no attack per minute of room sound;
     - for each game's own window, read from the site at run time (Strum Radar: s.win of every pattern at its default tempo, from a real
       srStart; the Listening Coach: coachMatchWinMs() at 60 BPM, from a real take; Note Runner: goodMs as its takes saved it), the share
       of EMPTY windows (2 x the half-width, slid 50 ms at a time, wholly inside a room stretch) that hold at least one onset: "an empty
       slot gets a hit X% of the time";
     - the noisy takes (by T-number), and the frame time each was replayed at.
   Real: the site's loop and its onset rule; the take's sound through the site's mic chain (gain, 70 Hz high-pass, 1500 Hz low-pass, read
   from coach.js). Fake: the frames come evenly spaced at the take's own mean frame time. Not judged: what the game then does with such a
   sound (no-guitar-listen.mjs runs the games), and soft attacks the evaluator cannot see (counted as "no attack").
   Takes are student audio: this prints take numbers and counts only, and writes nothing but --json (numbers only). */
import { writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { benchSite, coachTake, srRound, takeSource, worldSource } from './listen-site.mjs';
import { loadTakeAudio, roomRegions } from './takes-audio.mjs';
import { prepare } from './replay-takes.mjs';

const MATCH_MS = 80, STEP_MS = 50;

export async function roomOnsets(folder, at){
  const site = benchSite(at);
  const takes = loadTakeAudio(folder, at && at.root);
  /* The games' windows, from the site. */
  const pats = JSON.parse(site.run('__lb.patterns()')), wins = [];
  for (const p of pats){
    const r = await srRound(site, worldSource({ student: 'noGuitar', room: 'dead', seed: 1 }), { pattern: p.id, bpm: p.defBpm, lat: 50 });
    wins.push({ game: `Strum Radar "${p.id}" at ${p.defBpm} BPM`, half: r.win });
  }
  const nrGood = [...new Set(takes.filter(t => t.game === 'nr').map(t => Number(t.d.goodMs)).filter(Boolean))];
  const rows = [];
  let coachWin = null;
  for (const tk of takes){
    const proc = prepare(tk.wav, tk.srcRate, site.chain), frameMs = Math.max(8, Math.min(120, Number(tk.d.frameMeanMs) || 16.667));
    const r = await coachTake(site, takeSource(proc, tk.srcRate, 0), { midis: JSON.stringify(Array(32).fill(40)), bpm: 30, lat: 0, frameMs, beat1: 0 });
    const probe = r.events.map(e => e.t);
    if (coachWin == null){
      const w = await coachTake(site, worldSource({ student: 'noGuitar', room: 'dead', seed: 1 }), { midis: JSON.stringify(Array(8).fill(40)), bpm: 60, lat: 50 });
      coachWin = w.matchWinMs;
    }
    const regs = roomRegions(tk), roomS = regs.reduce((n, [a, b]) => n + (b - a), 0) / 1000;
    const atAttack = probe.filter(t => tk.attacks.some(a => Math.abs(a - t) <= MATCH_MS)).length;
    const inRoom = probe.filter(t => regs.some(([a, b]) => t >= a && t < b) && !tk.attacks.some(a => Math.abs(a - t) <= MATCH_MS));
    rows.push({ take: tk.take, game: tk.game, period: tk.period, frameMs, seconds: Math.round(tk.durMs) / 1000, onsets: probe.length, atAttack, attacks: tk.attacks.length,
      roomS: Math.round(roomS * 10) / 10, roomOnsets: inRoom.length, inRoom, regs });
  }
  const games = wins.concat([{ game: 'Listening Coach at 60 BPM (coachMatchWinMs)', half: coachWin }], nrGood.map(g => ({ game: 'Note Runner (goodMs, as its takes saved it)', half: g })));
  /* empty windows: every window of 2 x half, 50 ms apart, wholly inside a room stretch */
  const windowShare = (sel, half) => {
    let n = 0, hit = 0;
    for (const r of sel) for (const [a, b] of r.regs) for (let c = a + half; c + half <= b; c += STEP_MS){ n++; if (r.inRoom.some(t => t >= c - half && t < c + half)) hit++; }
    return { n, hit };
  };
  return { rows, games, windowShare };
}

function report(res, log){
  const { rows, games, windowShare } = res, pct = (a, b) => b ? (100 * a / b).toFixed(1) + '%' : '-';
  const groups = [['Power Chord Switch takes', r => r.game === 'pw'], ['Listening Coach takes', r => r.game.startsWith('coach')], ['Note Runner takes', r => r.game === 'nr'],
    ['period 4', r => r.period === '4'], ['period 7', r => r.period === '7'], ['ALL takes', () => true]];
  log('take  game          per  frame  seconds  onsets (at an attack)  room s  no-attack onsets in the room  per minute');
  rows.forEach(r => log(`${r.take}   ${r.game.padEnd(13)} ${String(r.period).padEnd(4)} ${String(r.frameMs).padEnd(6)} ${String(r.seconds).padEnd(8)} ${String(r.onsets).padStart(4)} (${String(r.atAttack).padStart(3)})             ${String(r.roomS).padStart(5)}   ${String(r.roomOnsets).padStart(4)}                          ${r.roomS ? (r.roomOnsets / r.roomS * 60).toFixed(1) : '-'}`));
  log('');
  const out = {};
  for (const [name, f] of groups){
    const sel = rows.filter(f), roomS = sel.reduce((n, r) => n + r.roomS, 0), on = sel.reduce((n, r) => n + r.roomOnsets, 0);
    log(`== ${name}: ${sel.length} takes, ${roomS.toFixed(1)} s of room sound with nobody playing, ${on} onsets the site's rule took there (no attack within ${MATCH_MS} ms): ${roomS ? (on / roomS * 60).toFixed(1) : '-'} a minute`);
    out[name] = { takes: sel.length, roomS: Math.round(roomS * 10) / 10, onsets: on, windows: [] };
    for (const g of games){
      const w = windowShare(sel, g.half);
      log(`   ${g.game}, window +/- ${Math.round(g.half)} ms: an empty window gets a hit ${w.hit} of ${w.n} times (${pct(w.hit, w.n)})`);
      out[name].windows.push({ game: g.game, half: g.half, hit: w.hit, n: w.n });
    }
  }
  const noisy = rows.filter(r => r.roomS >= 2).sort((a, b) => b.roomOnsets / b.roomS - a.roomOnsets / a.roomS);
  log(`\nnoisiest takes (no-attack onsets per minute of room sound, takes with 2 s or more of it): ${noisy.slice(0, 8).map(r => `${r.take} ${(r.roomOnsets / r.roomS * 60).toFixed(0)}/min (${r.game}, period ${r.period})`).join(', ')}`);
  log(`quiet takes (0 such onsets): ${noisy.filter(r => !r.roomOnsets).map(r => r.take).join(', ') || 'none'}; takes with under 2 s of room sound: ${rows.filter(r => r.roomS < 2).map(r => r.take).join(', ') || 'none'}`);
  log(`\nTruth: the console evaluator's attack detector (micEvalSignal); an attack it cannot see (a very soft pluck) counts as "no attack" here. Room = no attack, ${'1 s'} after the last one, no count-in (takes-audio.mjs). Frames evenly spaced at each take's mean frame time.`);
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]){
  const args = process.argv.slice(2), folder = args.find(a => !a.startsWith('--'));
  const opt = k => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
  if (!folder){ console.error('usage: node tools/mic-sim/room-onsets.mjs <folder of anonymized takes> [--root=<site folder>] [--json=<file>]'); process.exit(2); }
  const at = opt('root') ? { root: resolve(opt('root')) } : null;
  roomOnsets(folder, at).then(res => {
    const out = report(res, l => console.log(l));
    if (opt('json')) writeFileSync(opt('json'), JSON.stringify({ tool: 'room-onsets', groups: out, takes: res.rows.map(r => ({ take: r.take, game: r.game, period: r.period, roomS: r.roomS, roomOnsets: r.roomOnsets, onsets: r.onsets, atAttack: r.atAttack })) }));
  }).catch(e => { console.error('room-onsets: ' + (e && e.stack || e)); process.exit(2); });
}
