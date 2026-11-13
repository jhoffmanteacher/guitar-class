/* Does a listening feature give credit when NOTHING is played? (2026-11-12, the listening bench; the scout's candidate C1.)

     node tools/mic-sim/no-guitar-listen.mjs [--takes=<folder of anonymized takes>] [--games=chords,melody,radar] [--root=<site folder>]
                                            [--json=<file>] [--against=<earlier --json>]

   The answer key is one line long and needs no code: in every case below this student plays NO note, so any "right", any level above
   "Needs work" and any Strum Radar hit is credit for nothing.
   Played into the REAL site code (tools/mic-sim/listen-site.mjs: loaded unchanged in closed-loop.mjs's vm, the mic opened by the site's
   own coachAcquireMic, a fake signed-in student whose saveGames is counted):
     chords  the Listening Coach in chord mode, on EVERY Coach-gated chord skill (skillIsCoachGated, practice.type 'chord'), with the
             Coach button the site's own practice panel renders for it (coachChordBtnRowHtml), at the tempo it opens at;
     melody  the Listening Coach in melody mode, on every Coach-gated playSeq skill whose panel draws a Coach button
             (playSeqControlsHtml), at its slider's tempo;
     radar   Strum Radar, every pattern (SH_PATTERNS) at its default tempo.
   For the Coach it reads what the site itself did: the level the report shows (couldn't hear / 1 Needs work / 2 Good / 3 Great), the
   level coachRenderReport saved for the skill (games.coachSkill) and whether the check-off gate still holds afterwards, by the site's
   own test (skillIsCoachGated && coachSkillBest < COACH_GATE_MIN_LEVEL, toggleSkill in app/audio-ui.js). For Strum Radar: its score
   and its stars (srRenderDone's 85 / 65 / 40 % bars).
   The rooms with no guitar:
     synthetic  the twelve no-guitar cases of closed-loop.mjs (NO_GUITAR: a dead mic, a quiet room, a fan, one voice, a class talking,
                bumps, typing, a partner's guitar, a class of guitars, a loud class, desk taps on every beat, strums across muted
                strings), through student.mjs and its Chromebook mic. Guesses at rooms (student.mjs header);
     real       with --takes: each recorded take's ROOM sound (tools/mic-sim/takes-audio.mjs: the stretches with no attack in them, a
                second after the last one, no count-in), spliced end to end with slow cross-fades (takes-audio.mjs JOIN_FADE_MS) until it covers the round, through
                the site's mic chain. Real rooms and real Chromebook mics; a take with under 1 s of room sound is left out. The joins
                are new: the tool counts the onsets the site took within 150 ms of one against the share of the time that close to a
                join (a join that made a sound would show as many more).
   Fake: the frames are evenly spaced (60 a second); the count-in's speaker clicks are added for the synthetic rooms (as closed-loop.mjs
   does) and not for the recorded ones (their own clicks are cut out with the count-ins).
   Exit: 0 when no case gave credit for nothing; 1 when one did (a Coach level of 2 or more, or a gate that opened); 2 on an error.
   With --against: the comparison's exit code (0 same, 1 a level moved, 2 not the same command). Not in checks.mjs: today's site fails it. */
import { writeFileSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { benchSite, coachTake, srRound, takeSource, worldSource } from './listen-site.mjs';
import { NO_GUITAR } from './closed-loop.mjs';

const VALUED = ['takes', 'games', 'root', 'json', 'against'];
function args(){
  const a = process.argv.slice(2), o = {};
  for (const x of a){
    const m = /^--([a-z]+)=(.+)$/.exec(x);
    if (!m || !VALUED.includes(m[1]) || o[m[1]] != null){ console.error('no-guitar-listen: bad or repeated argument "' + x + '" (options: ' + VALUED.map(v => '--' + v + '=').join(' ') + ')'); process.exit(2); }
    o[m[1]] = m[2];
  }
  return o;
}

export async function noGuitar(o){
  const at = o.root ? { root: resolve(o.root) } : null, site = benchSite(at);
  const games = (o.games || 'chords,melody,radar').split(',');
  const gated = JSON.parse(site.run('__lb.gatedSkills()'));
  const chordSkills = gated.filter(g => g.type === 'chord' && g.chords), melodySkills = gated.filter(g => g.type === 'playSeq' && g.midis);
  const noButton = gated.filter(g => !(g.chords || g.midis)).length;
  /* the rooms */
  const rooms = NO_GUITAR.map(([name, student, room]) => ({ name, kind: 'synthetic', make: () => worldSource({ student, room, seed: 1 }) }));
  if (o.takes){
    const { loadTakeAudio, roomSound } = await import('./takes-audio.mjs');
    for (const tk of loadTakeAudio(o.takes, at && at.root)){
      const snd = roomSound(tk, 60000, site.chain);
      if (!snd || snd.seconds < 1) continue;
      /* the share of the sound's time that lies within 150 ms of a join: what the onsets near a join would be if joins made none */
      let near = 0;
      for (let t = 0; t < snd.ms; t += 10) if (snd.joins.some(j => Math.abs(j - t) < 150)) near++;
      rooms.push({ name: `${tk.take} room (${tk.game}, period ${tk.period}, ${snd.seconds.toFixed(1)} s)`, kind: 'real', take: tk.take, joins: snd.joins, nearShare: near / (snd.ms / 10), make: () => takeSource(snd.proc, snd.srcRate, 0) });
    }
  }
  const rows = [];
  for (const room of rooms){
    if (games.includes('chords')) for (const g of chordSkills){
      const r = await coachTake(site, room.make(), { chords: g.chords, skills: [g.sid], bpm: g.bpm, lat: 50 });
      rows.push(coachRow('chords', room, g, r));
    }
    if (games.includes('melody')) for (const g of melodySkills){
      const r = await coachTake(site, room.make(), { midis: g.midis, skills: [g.sid], bpm: g.bpm, lat: 50 });
      rows.push(coachRow('melody', room, g, r));
    }
    if (games.includes('radar')) for (const p of JSON.parse(site.run('__lb.patterns()'))){
      const r = await srRound(site, room.make(), { pattern: p.id, bpm: p.defBpm, lat: 50 });
      rows.push({ game: 'radar', room: room.name, kind: room.kind, what: p.id + ' ' + p.defBpm + ' BPM', acc: r.acc, stars: r.stars, hits: r.hits, total: r.total, extras: r.extras, credit: r.hits > 0 });
    }
  }
  return { rows, chordSkills: chordSkills.length, melodySkills: melodySkills.length, noButton, rooms: rooms.map(r => ({ name: r.name, kind: r.kind })) };

  function coachRow(game, room, g, r){
    const sk = r.skills[0] || {}, states = {};
    r.slots.forEach(s => { states[s.state] = (states[s.state] || 0) + 1; });
    /* event times are "played" (arrival - the 50 ms mic delay); the recorded room sound starts at the site's clock 0 */
    const joinOnsets = room.joins ? r.events.filter(e => room.joins.some(j => Math.abs(e.t + 50 - j) < 150)).length : null;
    return { game, room: room.name, kind: room.kind, what: g.sid, bpm: g.bpm, slots: r.slots.length, states, overall: r.overall, crits: r.crits, saved: sk.saved, gateOpened: sk.gated && !sk.gateHolds,
      events: r.events.length, joinOnsets, nearShare: room.nearShare, credit: r.overall === 2 || r.overall === 3 || (sk.gated && !sk.gateHolds) };
  }
}

function report(res, log){
  const { rows } = res, lvlWord = { couldntHear: "couldn't hear", 1: 'Needs work', 2: 'Good', 3: 'Great' };
  log(`No guitar played in any case: any level of Good or Great, any gate that opens and any Strum Radar hit is credit for nothing.`);
  log(`Coach-gated skills: ${res.chordSkills} chord, ${res.melodySkills} melody (playSeq) with a Coach button${res.noButton ? `, ${res.noButton} whose panel draws none (not run)` : ''} · rooms: ${res.rooms.filter(r => r.kind === 'synthetic').length} synthetic, ${res.rooms.filter(r => r.kind === 'real').length} recorded`);
  for (const game of ['chords', 'melody']){
    const sel = rows.filter(r => r.game === game);
    if (!sel.length) continue;
    log(`\n== Listening Coach, ${game === 'chords' ? 'CHORD' : 'MELODY'} mode: ${sel.length} takes with nothing played (${res.rooms.length} rooms x ${new Set(sel.map(r => r.what)).size} skills)`);
    log('room                                       | takes | couldn\'t hear | Needs work | Good | Great | gate OPENED | slots right / unclear / wrong / miss');
    for (const room of res.rooms){
      const s = rows.filter(r => r.game === game && r.room === room.name);
      if (!s.length) continue;
      const c = k => s.filter(r => r.overall === k).length, st = k => s.reduce((n, r) => n + (r.states[k] || 0), 0);
      log(`${room.name.padEnd(42)} | ${String(s.length).padStart(5)} | ${String(c('couldntHear')).padStart(13)} | ${String(c(1)).padStart(10)} | ${String(c(2)).padStart(4)} | ${String(c(3)).padStart(5)} | ${String(s.filter(r => r.gateOpened).length).padStart(11)} | ${st('ok') + st('oct')} / ${st('dim')} / ${st('wrong')} / ${st('miss')}`);
    }
    for (const kind of ['synthetic', 'real']){
      const s = sel.filter(r => r.kind === kind);
      if (!s.length) continue;
      const c = k => s.filter(r => r.overall === k).length;
      log(`   ${kind} rooms: ${s.length} takes: couldn't hear ${c('couldntHear')}, Needs work ${c(1)}, Good ${c(2)}, Great ${c(3)}; the check-off gate OPENED in ${s.filter(r => r.gateOpened).length} of ${s.length}`);
      const pitchAt = s.filter(r => r.crits && r.overall >= 2), byPitch = {};
      pitchAt.forEach(r => { const k = 'pitch ' + r.crits[0] + ', completion ' + r.crits[4]; byPitch[k] = (byPitch[k] || 0) + 1; });
      if (pitchAt.length) log(`   the Good/Great ones by their pitch and completion levels: ${Object.entries(byPitch).map(([k, v]) => k + ': ' + v).join(' · ')}`);
    }
    const ex = sel.find(r => r.gateOpened && r.kind === 'synthetic') || sel.find(r => r.gateOpened);
    if (ex) log(`   example: ${ex.room}, skill ${ex.what} at ${ex.bpm} BPM: ${ex.slots} slots ${JSON.stringify(ex.states)}, criteria (pitch, timing, tempo, changes, completion) ${JSON.stringify(ex.crits)}, the report says ${lvlWord[ex.overall]}, saved level ${ex.saved}`);
  }
  const rd = rows.filter(r => r.game === 'radar');
  if (rd.length){
    log(`\n== Strum Radar: ${rd.length} rounds with nothing played (every pattern at its default tempo)`);
    log('room                                       | rounds | score (each pattern)                | stars 0 / 1 / 2 / 3 | extra sounds');
    for (const room of res.rooms){
      const s = rd.filter(r => r.room === room.name);
      if (!s.length) continue;
      const st = k => s.filter(r => r.stars === k).length;
      log(`${room.name.padEnd(42)} | ${String(s.length).padStart(6)} | ${s.map(r => String(r.acc).padStart(3) + '%').join(' ').padEnd(35)} | ${st(0)} / ${st(1)} / ${st(2)} / ${st(3)}         | ${s.reduce((n, r) => n + r.extras, 0)}`);
    }
    for (const kind of ['synthetic', 'real']){
      const s = rd.filter(r => r.kind === kind);
      if (!s.length) continue;
      const accs = s.map(r => r.acc).sort((a, b) => a - b);
      log(`   ${kind} rooms: ${s.length} rounds, median score ${accs[Math.floor(accs.length / 2)]}%, ${s.filter(r => r.stars >= 1).length} with a star or more, ${s.filter(r => r.stars >= 2).length} with two or more`);
    }
  }
  const real = rows.filter(r => r.joinOnsets != null);
  if (real.length){
    const ev = real.reduce((n, r) => n + r.events, 0), expect = real.reduce((n, r) => n + r.events * r.nearShare, 0);
    log(`\nJoins in the recorded room sound: ${real.reduce((n, r) => n + r.joinOnsets, 0)} of the ${ev} sounds the Coach took sit within 150 ms of a join; if the joins made no sound, about ${Math.round(expect)} would (that share of the time lies that close to one). Many more than that means the splicing makes sounds.`);
  }
  const credit = rows.filter(r => r.game !== 'radar' && r.credit).length;
  log(`\n${credit} of ${rows.filter(r => r.game !== 'radar').length} Coach takes with nothing played gave Good or better or opened the gate; ${rd.filter(r => r.credit).length} of ${rd.length} Strum Radar rounds scored a hit.`);
  return credit;
}

function compare(now, was, file){
  if (!was || was.tool !== 'no-guitar-listen' || !Array.isArray(was.rows)) return { code: 2, lines: [`against ${file}: not a --json of this tool; nothing compared`] };
  const key = r => r.game + '|' + r.room + '|' + r.what;
  const w = new Map(was.rows.map(r => [key(r), r]));
  if (was.rows.length !== now.length || now.some(r => !w.has(key(r)))) return { code: 2, lines: [`against ${file}: NOT THE SAME COMMAND (other rooms, skills or games); nothing compared`] };
  const rank = r => r.game === 'radar' ? -r.acc : r.overall === 'couldntHear' ? 0 : -Number(r.overall);
  let worse = 0, better = 0, n = 0;
  const first = [];
  for (const r of now){
    const o = w.get(key(r));
    n++;
    const a = rank(o), b = rank(r);
    if (a === b) continue;
    if (b < a) worse++; else better++;
    if (first.length < 10) first.push(`  ${r.game} · ${r.room} · ${r.what}: was ${r.game === 'radar' ? o.acc + '%' : o.overall}, now ${r.game === 'radar' ? r.acc + '%' : r.overall}  ${b < a ? 'WORSE (more credit for nothing)' : 'better'}`);
  }
  return { code: worse + better ? 1 : 0, lines: [`against ${file}: ${worse + better} of ${n} rounds moved (${worse} worse: more credit with nothing played, ${better} better)${worse + better ? '  RED' : '  same'}`, ...first] };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]){
  const o = args();
  let was = null;
  if (o.against){ try { was = JSON.parse(readFileSync(o.against, 'utf8')); } catch (e){ console.error('no-guitar-listen: cannot read ' + o.against); process.exit(2); } }
  noGuitar(o).then(res => {
    console.log(`site ${o.root ? resolve(o.root) : 'this checkout'}`);
    const credit = report(res, l => console.log(l));
    if (o.json) writeFileSync(o.json, JSON.stringify({ tool: 'no-guitar-listen', rows: res.rows }));
    if (o.against){ const c = compare(res.rows, was, o.against); c.lines.forEach(l => console.log(l)); process.exit(c.code); }
    process.exit(credit ? 1 : 0);
  }).catch(e => { console.error('no-guitar-listen: ' + (e && e.stack || e)); process.exit(2); });
}
