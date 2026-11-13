/* The listening test bench's runners (2026-11-12): the REAL Listening Coach (coachOpen + coachStartCheck + coachLoop + coachFinish +
   coachRenderReport), Note Runner's real nrLoop / nrFinalizeEvent / nrFinish and Strum Radar's real srStart / srLoop / srFinish, each loaded
   unchanged in closed-loop.mjs's vm site (makeSite) and played on a virtual clock from a sound source this file controls. Nothing here
   grades: every verdict is the site's own. Imported by replay-listen.mjs, room-onsets.mjs and no-guitar-listen.mjs; not a command.

   What the vm gets on top of makeSite's stubs (the fake world, all of it here):
     - a microphone that is already open: coachStream / coachCtx / coachAnalyser are set to closed-loop.mjs's analyser over the sound
       source, so coachAcquireMic's permission prompt never runs (the same place closed-loop.mjs starts: after the prompt);
     - a signed-in student with no progress (`currentUser` = a made-up uid, `games` = {}), so coachRenderReport writes the take's level
       into games.coachSkill as it would for a real student; saveGames() is replaced by a counter (the fake Firestore: nothing is sent);
       micSampling stays off, so nothing records;
     - the Coach button the site renders, as an object: data-chords / data-midis / data-coachskills and a .bpm-slider holding the BPM
       (readGroupBpm reads it, as it reads the real slider). For a gated skill the data-chords / data-midis come from the site's own
       coachChordBtnRowHtml / playSeqControlsHtml output (gatedSkills below), never written here.
   Differences from a real take, all on purpose and small:
     - the count-in's lead before the first click is COACH_COUNTIN_LEAD (0.1 s), not COACH_COUNTIN_REC_LEAD (0.4 s): no capture is
       running. A replay sets the clock so that listenStart lands on the take's own beat 1; only the count-in (which grades nothing) is
       0.3 s shorter;
     - frames come evenly spaced (closed-loop.mjs's driver), at the take's mean frame time or the given fps;
     - Note Runner's round is set up the way nrStart sets it up, from the take's own notes (nrStart itself draws new random notes with
       nrGen): the same state fields, nrRenderPlay, coachCountIn, then the real nrLoop. One lap at the take's beat; beat 1 is the first
       note (true for level 1 and Finger Gym: their first bar starts on beat 1). */
import { makeSite } from './closed-loop.mjs';
import { Student, MICS, SR, biquad } from './student.mjs';

const VM = `globalThis.__lb = {
  saved: 0,
  world(lat){
    setLang('en');
    currentUser = { uid: 'bench-student-0001' };
    games = {};
    saveGames = function(){ __lb.saved++; };
    nrOffsetMs = lat;
    coachReadCtx = null;
    /* The page's sound output stays closed-loop.mjs's (the count-in clicks are logged there); the MIC's context is this one, at the
       recording's sample rate, and getUserMedia always says yes. coachAcquireMic then builds its graph for real; its analyser is the
       bench's, which already holds the sound after the site's gain and filters. */
    getAudioCtx();
    const node = () => ({ connect(){}, disconnect(){}, gain: { value: 1 }, frequency: { value: 0 }, Q: { value: 0 }, type: '' });
    const micCtx = { get sampleRate(){ return __mic.ctx.sampleRate; }, get currentTime(){ return __mic.ctx.currentTime; }, state: 'running',
      resume(){ return Promise.resolve(); }, close(){}, createMediaStreamSource: node, createGain: node, createBiquadFilter: node,
      createAnalyser(){ return __mic.analyser; } };
    window.AudioContext = function(){ return micCtx; };
    navigator.mediaDevices = { getUserMedia(){ return Promise.resolve({ getAudioTracks(){ return [{ label: '' }]; }, getTracks(){ return []; } }); } };
  },
  button(o){
    const group = { querySelector(sel){ return sel === '.bpm-slider' ? { value: String(o.bpm) } : null; }, insertAdjacentElement(){}, closest(){ return null; } };
    const dataset = o.chords ? { chords: o.chords } : { midis: o.midis };
    if (o.skills && o.skills.length) dataset.coachskills = o.skills.join(',');
    return { dataset, parentElement: group, closest(sel){ return sel === '.bpm-control-group' ? group : null; } };
  },
  coachStart(o){
    __lb.world(o.lat);
    coachOpen(__lb.button(o));
    if (!coach) return 'coachOpen refused the button';
    __lb.p = coachStartCheck();
    return '';
  },
  coachPhase(){ return coach ? coach.phase + '|' + coach.listenStart : 'none'; },
  coachOut(){
    const c = coach, html = coachBody().innerHTML;
    const said = k => html.indexOf(t(k)) >= 0;
    const overall = said('coach.report.couldntHearChords') || said('coach.report.couldntHearMelody') ? 'couldntHear'
      : said('coach.overall.great') || said('coach.overall.greatHeard') ? 3 : said('coach.overall.good') ? 2 : said('coach.overall.practice') ? 1 : null;
    const crits = overall === 'couldntHear' ? null : [coachScorePitch(), coachScoreTiming(), coachScoreTempo(), coachScoreChanges(), coachScoreCompletion()].map(x => x.level);
    const skills = c.skillIds.map(sid => ({ sid, saved: games.coachSkill && games.coachSkill[sid] ? games.coachSkill[sid].level : 0,
      gated: skillIsCoachGated(sid), gateHolds: skillIsCoachGated(sid) && coachSkillBest(sid) < COACH_GATE_MIN_LEVEL }));
    const out = { mode: c.mode, phase: c.phase, listenStart: c.listenStart, beatMs: c.beatMs, overall, crits, skills, saved: __lb.saved,
      slots: c.slots.map(s => ({ state: s.state, chord: s.chordName || null, devMs: s.hit && s.hit.devMs != null ? Math.round(s.hit.devMs * 10) / 10 : null,
        n: s.hit && s.hit.readings ? s.hit.readings.length : null, look: !!s.secondLook })),
      events: c.events.map(e => ({ t: Math.round(e.t * 10) / 10, slot: e.slot, n: (e.readings || []).length })),
      gate: COACH_GATE_MIN_LEVEL, minHeard: coachMinHeard(c.slots.length), matchWinMs: coachMatchWinMs() };
    coachClose();
    return JSON.stringify(out);
  },
  nrMic(o){
    __lb.world(o.lat);
    nrStop();
    __lb.p = coachAcquireMic();
  },
  nrStart(o){
    if (!coachAnalyser) return 'the mic did not open';
    nr = { phase: 'ready', level: 0, timeouts: [], pv: null, micOn: false, adaptive: false };
    const s = nr;
    s.micOn = true;
    s.phase = 'countin';
    s.chordMode = !!o.chords;
    s.beatMs = o.beatMs;
    s.laps = [{ beat: 0, ms: 0, beatMs: o.beatMs }];
    s.totalBeats = o.totalBeats;
    s.notes = o.notes.map(n => Object.assign({}, n));
    s.playable = s.notes.filter(n => !n.rest);
    s.goodMs = o.goodMs; s.perfectMs = o.perfectMs;
    s.score = 0; s.combo = 0; s.maxCombo = 0; s.missStreak = 0;
    s.errs = []; s.sweepIdx = 0; s.lastBeat = -1; s.countCleared = false;
    s.smoothRms = 0; s.smoothHf = 0; s.lastOnsetT = -1e9; s.lastPitchT = 0; s.pendings = []; s.looks = [];
    s.evLog = [];
    nrRenderPlay();
    s.els = s.notes.map((_, i) => document.getElementById('nr-n-' + i));
    coachCountIn(s, 'nr-count', () => { if (nr === s && s.phase === 'countin') s.phase = 'play'; });
    const shift = s.listenStart - o.notes[0].t;
    s.playable.forEach(n => { n.t = n.t + shift; n.result = null; });
    s.shift = shift;
    nrLoop();
    return '';
  },
  nrPhase(){ return nr ? nr.phase : 'none'; },
  nrOut(){
    const s = nr;
    return JSON.stringify({ phase: s.phase, listenStart: s.listenStart, shift: s.shift, goodMs: s.goodMs, acc: s.acc,
      notes: s.playable.map(n => ({ verdict: n.result, unclear: !!n.unclear, look: !!n.secondLook })),
      events: (s.evLog || []).map(e => ({ t: Math.round((e.t - s.shift) * 10) / 10, n: e.readings.length })) });
  },
  srStart(o){
    __lb.world(o.lat);
    srSetup();
    const i = SH_PATTERNS.findIndex(p => p.id === o.pattern);
    if (i < 0) return 'no Strum Radar pattern ' + o.pattern;
    sr.patIdx = i; sr.bpm = o.bpm;
    __lb.p = srStart();
    return '';
  },
  srPhase(){ return sr ? sr.phase + '|' + sr.listenStart : 'none'; },
  srOut(){
    const s = sr;
    return JSON.stringify({ phase: s.phase, acc: s.acc, win: s.win, extras: s.extras, hits: s.notes.filter(n => n.result === 'ok').length, total: s.notes.length,
      listenStart: s.listenStart, beatMs: s.beatMs, stars: s.acc >= 85 ? 3 : s.acc >= 65 ? 2 : s.acc >= 40 ? 1 : 0 });
  },
  patterns(){ return JSON.stringify(SH_PATTERNS.map(p => ({ id: p.id, defBpm: p.defBpm, slots: p.slots.filter(Boolean).length }))); },
  /* Every Coach-gated skill (skillIsCoachGated) with the Coach button the practice panel renders for it: the site's own HTML, attribute read
     back. Chord skills: coachChordBtnRowHtml; playSeq skills: playSeqControlsHtml. A skill whose panel draws no Coach button is listed with
     button null. */
  gatedSkills(){
    const unesc = s => s.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
    const out = [];
    for (const w of SETS) for (const sk of (w.skills || [])){
      if (!skillIsCoachGated(sk.id)) continue;
      const p = sk.practice, html = p.type === 'chord' ? coachChordBtnRowHtml(p.chords, sk.id) : playSeqControlsHtml(p, sk.id);
      const ch = /data-chords="([^"]*)"/.exec(html), md = /class="coach-btn" data-midis="([^"]*)"/.exec(html), sl = /class="bpm-slider"[^>]*value="(\d+)"/.exec(html);
      /* The tempo the Coach opens at: the slider beside the button (readGroupBpm), else its default of 60 (a chord row has no slider). */
      out.push({ sid: sk.id, set: w.id, type: p.type, chords: ch ? unesc(ch[1]) : null, midis: md ? unesc(md[1]) : null, bpm: sl ? Number(sl[1]) : 60 });
    }
    return JSON.stringify(out);
  }
};`;

/* A site with the bench's helpers. `at`: { root, coach } as closed-loop.mjs's --root / --coach. fromSummary: read a take summary instead of
   samples (closed-loop.mjs readSummaries). */
const cache = {};
export function benchSite(at, fromSummary){
  const o = at || {}, k = (o.root || '') + '|' + (o.coach || '') + '|' + (fromSummary ? 's' : 'a');
  if (!cache[k]){ cache[k] = makeSite(o.coach || null, 'base', null, !!fromSummary, o.root || null); cache[k].run(VM); }
  return cache[k];
}

/* The sound the mic hears.
   take(proc | sum, srcRate, mapMs): a recording (already through the site's mic chain, replay-takes.mjs prepare) or its summary; the
     site's clock runs mapMs ahead of the recording's.
   world(student, room, mic, seed, lagMs): a student.mjs Student in a room, rendered as the clock moves, with the count-in clicks the site
     queues coming out of the speaker lagMs late (closed-loop.mjs playGame's pump, the same steps). */
export function takeSource(src, srcRate, mapMs){
  return { kind: 'take', start(site){ if (src.E) site.mic.sum = src; else { site.mic.proc = src; site.mic.upTo = src.length; } site.mic.sr = srcRate; site.mic.offsetMs = mapMs; }, pump(){} };
}
export function worldSource(o){
  const student = new Student(o.student, { room: o.room, lagMs: o.lagMs == null ? 70 : o.lagMs, seed: o.seed || 1 });
  const device = MICS[o.mic || 'chromebook'];
  let air = null, proc = null, rendered = 0, beepsDone = 0, devHp = null, hp = null, lp = null, site = null;
  const grow = s => { if (s <= air.length) return; const n = Math.max(s, air.length * 2); const a = new Float32Array(n), p = new Float32Array(n); a.set(air); p.set(proc); air = a; proc = p; site.mic.proc = proc; };
  return {
    kind: 'world', student,
    start(st){
      site = st; air = new Float32Array(SR * 30); proc = new Float32Array(SR * 30); rendered = Math.round(site.clock.now / 1000 * SR); beepsDone = 0;
      devHp = device.hp ? biquad('highpass', device.hp, 0.7) : x => x;
      hp = biquad('highpass', site.chain.hp, site.chain.hpQ); lp = biquad('lowpass', site.chain.lp, site.chain.lpQ);
      site.mic.proc = proc; site.mic.upTo = rendered; site.mic.sr = SR; site.mic.offsetMs = 0;
    },
    /* round: what the student is told once the game has set it up (closed-loop.mjs playGame does the same at the count-in). */
    round(r){ return student.play(r); },
    pump(){
      const toS = Math.round(site.clock.now / 1000 * SR);
      grow(toS + SR);
      for (; beepsDone < site.beeps.length; beepsDone++){
        const b = site.beeps[beepsDone], s0 = Math.round((b.atMs + (o.lagMs == null ? 70 : o.lagMs)) / 1000 * SR), n = Math.round(0.08 * SR);
        grow(s0 + n + 1);
        for (let i = 0; i < n; i++) if (s0 + i >= rendered) air[s0 + i] += 0.03 * Math.pow(0.0025, i / n) * Math.sin(2 * Math.PI * b.freq * i / SR);
      }
      student.render(air, rendered / SR * 1000, toS / SR * 1000);
      for (let s = rendered; s < toS; s++){
        let v = devHp(air[s]) * device.gain;
        v = v > 1 ? 1 : v < -1 ? -1 : v;
        proc[s] = lp(hp(v * site.chain.gain));
      }
      rendered = toS; site.mic.upTo = toS;
    }
  };
}

/* Runs the clock until `done()` says so: each step moves the clock one frame, gives the sound source its audio, then runs the site's due
   timers and animation frames. A guard stops a round that never ends. */
function drive(site, src, frameMs, done, what){
  let guard = 0;
  for (;;){
    if (done()) return;
    site.clock.now += frameMs;
    src.pump();
    site.tick();
    if (++guard > 200000) throw new Error('listen-site: ' + what + ' never ended');
  }
}

/* One Listening Coach take. o: { chords (data-chords JSON) | midis (data-midis JSON), skills: [sid], bpm, lat, frameMs, beat1 (the
   site-clock time beat 1 must land on; default 1000 + the count-in) }. Returns coachOut(): the slots' verdicts, the events, the level
   the report shows, what coachRenderReport saved for each skill and whether the check-off gate still holds. */
export async function coachTake(site, src, o){
  site.reset();
  const beatMs = 60000 / o.bpm, lead = Number(site.run('COACH_COUNTIN_LEAD')) * 1000;
  const beat1 = o.beat1 != null ? o.beat1 : 1000 + lead + 4 * beatMs;
  site.clock.now = beat1 - lead - 4 * beatMs;
  src.start(site);
  site.run('globalThis.__lbArg = ' + JSON.stringify({ chords: o.chords || null, midis: o.midis || null, skills: o.skills || [], bpm: o.bpm, lat: o.lat }));
  const err = site.run('__lb.coachStart(__lbArg)');
  if (err) throw new Error('listen-site: ' + err);
  await site.run('__lb.p');
  const [phase, ls] = site.run('__lb.coachPhase()').split('|');
  if (phase !== 'countin') throw new Error('listen-site: the Coach did not start its count-in (' + phase + ')');
  if (Math.abs(Number(ls) - beat1) > 0.01) throw new Error(`listen-site: the Coach put beat 1 at ${ls}, not ${beat1}`);
  if (src.round){
    const slots = JSON.parse(site.run('coach.slots.length'));
    src.round({ listenStartMs: Number(ls), beatMs, bpc: 1, slots, seq: Array(slots).fill('X'), midis: { X: [] } });
  }
  drive(site, src, o.frameMs || 1000 / 60, () => site.run('__lb.coachPhase()').split('|')[0] === 'report', 'the Coach take');
  return JSON.parse(site.run('__lb.coachOut()'));
}

/* One Note Runner round from a take's notes. o: { notes: [{ t, midi, string, fret, chord }], chords, beatMs, goodMs, perfectMs, lat,
   frameMs }. Beat 1 is notes[0].t. */
export async function nrRound(site, src, o){
  site.reset();
  const lead = Number(site.run('COACH_COUNTIN_LEAD')) * 1000, beat1 = o.notes[0].t;
  site.clock.now = beat1 - lead - 4 * o.beatMs;
  src.start(site);
  const last = o.notes[o.notes.length - 1].t;
  site.run('globalThis.__lbArg = ' + JSON.stringify({ notes: o.notes, chords: !!o.chords, beatMs: o.beatMs, goodMs: o.goodMs, perfectMs: o.perfectMs, lat: o.lat,
    totalBeats: Math.ceil((last - beat1) / o.beatMs) + 1 }));
  site.run('__lb.nrMic(__lbArg)');
  await site.run('__lb.p');
  const err = site.run('__lb.nrStart(__lbArg)');
  if (err) throw new Error('listen-site: ' + err);
  const sh = Number(site.run('nr.shift'));
  if (Math.abs(sh) > 0.01) throw new Error('listen-site: Note Runner put beat 1 ' + sh + ' ms off the take\'s');
  drive(site, src, o.frameMs || 1000 / 60, () => site.run('__lb.nrPhase()') === 'done', 'the Note Runner round');
  return JSON.parse(site.run('__lb.nrOut()'));
}

/* One Strum Radar round. o: { pattern, bpm, lat, frameMs }. */
export async function srRound(site, src, o){
  site.reset();
  const beatMs = 60000 / o.bpm;
  site.clock.now = 1000;
  src.start(site);
  site.run('globalThis.__lbArg = ' + JSON.stringify(o));
  const err = site.run('__lb.srStart(__lbArg)');
  if (err) throw new Error('listen-site: ' + err);
  await site.run('__lb.p');
  const [phase, ls] = site.run('__lb.srPhase()').split('|');
  if (phase !== 'countin') throw new Error('listen-site: Strum Radar did not start its count-in (' + phase + ')');
  if (src.round){ const n = Number(site.run('4 * SR_BARS')); src.round({ listenStartMs: Number(ls), beatMs, bpc: 1, slots: n, seq: Array(n).fill('X'), midis: { X: [] } }); }
  drive(site, src, o.frameMs || 1000 / 60, () => site.run('__lb.srPhase()').split('|')[0] === 'done', 'the Strum Radar round');
  return JSON.parse(site.run('__lb.srOut()'));
}
