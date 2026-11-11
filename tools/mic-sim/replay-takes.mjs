/* Replay candidate Power Chord Switch rules on REAL takes (2026-11-11).

     node tools/mic-sim/replay-takes.mjs <folder of anonymized takes> [--rules=base,ring,half,half3,both,both3] [--json=out.json]

   The folder holds the console's Download WAV + Download data pairs after tools/mic-sim/anon-takes.mjs (T01.wav + T01.json ...). Takes carry
   student audio: never commit them, and this tool prints take numbers and counts only.

   What it does, per Power Chord Switch take and per rule (tools/mic-sim/candidates.mjs):
     1. tools/mic-sim/eval-takes.mjs is run on the folder for the TRUTH: per change, is there a strum in the recording where the site listened
        (`played`), and the take's own clock offset (`mapMs`).
     2. The recording is put back through the site's mic chain (gain, high-pass, low-pass: coach.js's numbers) and fed to the REAL ccLoop in a vm
        (closed-loop.mjs's site), round by round, at the take's own frame time and mic delay setting, with the count-in read as the game reads it.
        Nothing is replayed from the take's saved strums: the rule hears the audio again.
     3. Each rule is run twice: with the strum ratios the take was graded with (so `base` should give back the take's own saved verdicts: the
        "reproduced" line says how often it does, and the rest is only as good as that number) and with coach.js's ratios of today.
   Counted, as Jonathan asked (2026-11-11):
     no strum in the window  changes where the recording has no strum where the site listened: how many the rule HEARD anyway (right or wrong
                             chord), and how many it marked RIGHT. Fewer is better.
     real strums             changes where the recording has a strum and the site heard it ("agree"): how many the rule no longer hears (LOST),
                             and how many it no longer marks right.
   Left out, as the evaluator leaves them out: changes past the end of the audio, rounds the student retimed, impossible data.

   Limits: the take's audio is the raw mic, resampled here to the capture rate; frames are evenly spaced at the take's mean frame time (the real
   ones were not); a take with no clock offset (fewer than 3 strums found) uses the count-in's lag, else 0, and is listed. */
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { makeSite } from './closed-loop.mjs';
import { biquad } from './student.mjs';
import { RULES } from './candidates.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));

export function readWav(file){
  const b = readFileSync(file);
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WAVE') throw new Error('not a WAV file');
  let fmt = null, data = null;
  for (let p = 12; p + 8 <= b.length;){
    const id = b.toString('ascii', p, p + 4), n = b.readUInt32LE(p + 4);
    if (id === 'fmt ') fmt = { tag: b.readUInt16LE(p + 8), ch: b.readUInt16LE(p + 10), sr: b.readUInt32LE(p + 12), bits: b.readUInt16LE(p + 22) };
    if (id === 'data'){ data = b.subarray(p + 8, Math.min(b.length, p + 8 + n)); break; }
    p += 8 + n + (n & 1);
  }
  if (!fmt || !data) throw new Error('WAV without fmt or data');
  const step = fmt.bits / 8 * fmt.ch, n = Math.floor(data.length / step), x = new Float32Array(n);
  for (let i = 0; i < n; i++){
    const o = i * step;
    x[i] = fmt.tag === 3 ? data.readFloatLE(o) : fmt.bits === 16 ? data.readInt16LE(o) / 32768 : fmt.bits === 8 ? (data[o] - 128) / 128 : data.readInt32LE(o) / 2147483648;
  }
  return { sr: fmt.sr, x };
}
/* The helpers this tool adds to the site's vm: one round of a take, set up the way ccPrepare + ccBeginStage leave it, then the real ccLoop. */
const VM_HELPERS = `globalThis.__rp = {
  start(o){
    setLang('en'); ccSetup('power');
    nrOffsetMs = o.lat;
    coachAnalyser = __mic.analyser; coachCtx = __mic.ctx; coachFrameBuf = new Float32Array(COACH_FFT); coachReadCtx = null;
    const names = [...new Set(o.changes.flatMap(c => [c.from, c.to]))], classes = {};
    names.forEach(n => { classes[n] = chordMidis(pwBaseName(n, PW_A5_OPEN)).map(m => ((m % 12) + 12) % 12); });
    const bad = names.filter(n => !classes[n].length);
    if (bad.length) return JSON.stringify({ error: 'no shape for ' + bad.join(', ') });
    Object.assign(cc, { chords: names, shapes: PW_A5_OPEN, bpc: o.bpc, slots: o.changes.length + 1, seq: [o.changes[0].from].concat(o.changes.map(c => c.to)), classes,
      ladder: false, stage: 0, stageLog: [], stageBpms: [o.bpm], evLog: [], onsetCount: 0, tempoLog: [], startBpms: [o.bpm], retimedStages: [], countIns: [],
      changes: o.changes.map(c => ({ beat: c.beat, from: c.from, to: c.to, result: null, pend: null })),
      beatMs: 60000 / o.bpm, roundLow: o.bpm, smoothRms: 0, smoothHf: 0, lastOnsetT: -1e9, prevOnsetT: -1e9, lastPitchT: 0, gridOffset: 0, lastBeat: -1,
      phase: 'countin', listenStart: o.listenStart });
    ccLoop();
    return '{}';
  },
  go(){ if (cc && cc.phase === 'countin'){ cc.phase = 'play'; cc.firstPlayAt = performance.now(); } },
  end(){
    cc.changes.forEach(c => { if (c.pend) ccResolvePend(c); if (c.result === null) c.result = 'miss'; });
    const out = cc.changes.map(c => ({ verdict: c.result, readings: c.readings ? c.readings.length : null }));
    ccStop(); cc = null;
    return JSON.stringify(out);
  }
};`;

const sites = {};
function siteFor(rule, ratio){
  const k = rule + '|' + (ratio ? ratio.join('/') : 'now');
  if (!sites[k]){ sites[k] = makeSite(null, rule, ratio); sites[k].run(VM_HELPERS); }
  return sites[k];
}

/* One take's audio as the site's analyser would hold it. */
function prepare(wav, srcRate, chain){
  let x = wav.x;
  if (wav.sr !== srcRate){
    const n = Math.floor(x.length * srcRate / wav.sr), y = new Float32Array(n), k = wav.sr / srcRate;
    for (let i = 0; i < n; i++){ const p = i * k, a = Math.floor(p), f = p - a; y[i] = x[a] * (1 - f) + (a + 1 < x.length ? x[a + 1] : x[a]) * f; }
    x = y;
  }
  const hp = biquad('highpass', chain.hp, chain.hpQ, srcRate), lp = biquad('lowpass', chain.lp, chain.lpQ, srcRate), out = new Float32Array(x.length);
  for (let i = 0; i < x.length; i++) out[i] = lp(hp(x[i] * chain.gain));
  return out;
}

/* Replays one take under one site. Returns { [expected index]: { verdict, readings } } for the rounds it could run. */
export function replayTake(site, d, proc, srcRate, mapMs){
  const out = {}, exp = Array.isArray(d.expected) ? d.expected : [], bpc = d.bpc > 0 ? d.bpc : 1;
  const stages = [...new Set(exp.map(e => e.stage == null ? 0 : e.stage))].sort((a, b) => a - b);
  const frameMs = Math.max(8, Math.min(120, Number(d.frameMeanMs) || 16.667));
  for (const st of stages){
    const list = exp.map((e, k) => ({ e, k })).filter(z => (z.e.stage == null ? 0 : z.e.stage) === st).sort((a, b) => a.e.t - b.e.t);
    if (!list.length || list.some(z => z.e.retimed)) continue;
    const bpm = Number(list[0].e.bpm) || (Array.isArray(d.stageBpms) && d.stageBpms[st]) || d.bpm;
    if (!(bpm >= 10 && bpm <= 140)) continue;
    const beat = 60000 / bpm, listen = list[0].e.t - bpc * beat;
    const changes = list.map(z => ({ beat: Math.round((z.e.t - listen) / beat), from: z.e.from, to: z.e.to }));
    const cin = Array.isArray(d.countInBeats) && d.countInBeats[st] >= 1 && d.countInBeats[st] <= 4 ? d.countInBeats[st] : 4;
    site.reset();
    site.mic.proc = proc; site.mic.upTo = proc.length; site.mic.sr = srcRate; site.mic.offsetMs = mapMs;
    site.clock.now = listen - cin * beat;
    const r = JSON.parse(site.run(`__rp.start(${JSON.stringify({ lat: d.micLatencyMs, bpc, bpm, listenStart: listen, changes })})`));
    if (r.error) continue;
    const end = listen + (changes[changes.length - 1].beat + 0.95) * beat;
    let going = false;
    while (site.clock.now < end){
      site.clock.now += frameMs;
      if (!going && site.clock.now >= listen){ site.run('__rp.go()'); going = true; }
      site.tick();
    }
    JSON.parse(site.run('__rp.end()')).forEach((v, j) => { out[list[j].e.i == null ? list[j].k : list[j].e.i] = v; });
  }
  return out;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]){
  const args = process.argv.slice(2), folder = args.find(a => !a.startsWith('--'));
  const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
  if (!folder){ console.error('usage: node tools/mic-sim/replay-takes.mjs <folder of takes> [--rules=base,ring,...] [--json=out.json]'); process.exit(2); }
  const rules = opt('rules', RULES.join(',')).split(',');
  for (const r of rules) if (!RULES.includes(r)){ console.error('no rule "' + r + '" (' + RULES.join(', ') + ')'); process.exit(2); }
  const tmp = join(mkdtempSync(join(tmpdir(), 'replay-takes-')), 'eval.json');
  // the evaluator names each take's file on stderr ("T01 = file.wav"): the table itself is not needed here
  const ev = spawnSync(process.execPath, [join(HERE, 'eval-takes.mjs'), resolve(folder), '--json', tmp], { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (ev.status !== 0){ console.error('eval-takes.mjs failed:\n' + ev.stderr); process.exit(1); }
  const evalOut = ev.stderr + '\n' + ev.stdout;
  const fileOf = {};
  evalOut.split('\n').forEach(l => { const m = l.match(/^(T\d+) = (.+\.wav)\s*$/i); if (m) fileOf[m[1]] = m[2]; });
  const rows = JSON.parse(readFileSync(tmp, 'utf8')).rows.filter(r => r.kind === 'pw');
  const today = siteFor('base', null);
  const NOW = [Number(today.run('CC_POWER_ONSET_RATIO')), Number(today.run('CC_POWER_HF_RATIO'))];
  console.log(`${rows.length} Power Chord Switch takes in ${Object.keys(fileOf).length} takes · rules ${rules.join(', ')} · today's strum ratios ${NOW.join(' / ')}`);
  const takes = [];
  for (const row of rows){
    const f = fileOf[row.take];
    if (!f){ console.log(row.take + ': no file name from the evaluator, skipped'); continue; }
    const base = join(resolve(folder), f.replace(/\.wav$/i, ''));
    const d = JSON.parse(readFileSync(base + '.json', 'utf8')), wav = readWav(base + '.wav');
    const srcRate = Number(d.srcSampleRate) || wav.sr;
    const own = [Number(d.onsetRatio) || row.strumRatio.full, Number(d.hfRatio) || row.strumRatio.hf];
    const lat = Number(d.micLatencyMs) || 0;
    const L = row.latency || {};
    const mapMs = L.mapMs != null ? L.mapMs : L.clickLagMs != null ? lat - L.clickLagMs : 0;
    const proc = prepare(wav, srcRate, today.chain);
    const tk = { take: row.take, own, mapFrom: L.mapMs != null ? 'strums' : L.clickLagMs != null ? 'count-in' : 'none', notes: row.perNote, res: {} };
    for (const rule of rules) for (const [mode, ratio] of [['own', own], ['now', NOW]]) tk.res[rule + '@' + mode] = replayTake(siteFor(rule, ratio), d, proc, srcRate, mapMs);
    takes.push(tk);
    process.stderr.write('.');
  }
  process.stderr.write('\n');
  const heard = v => v && (v.verdict === 'ok' || v.verdict === 'off');
  const groups = [...new Set(takes.map(t => t.own[0]))].sort((a, b) => a - b).map(r => ({ name: 'takes graded at ' + r, pick: t => t.own[0] === r })).concat([{ name: 'ALL takes', pick: () => true }]);
  const report = {};
  for (const g of groups){
    const ts = takes.filter(g.pick), notes = ts.flatMap(t => t.notes.map(n => ({ t, n })));
    const noStrum = notes.filter(z => !z.n.played), agree = notes.filter(z => z.n.why && z.n.why.cat === 'agree');
    console.log(`\n== ${g.name}: ${ts.length} takes, ${notes.length} judged changes · no strum in the window ${noStrum.length} (the site heard ${noStrum.filter(z => z.n.site !== 'miss').length}, marked right ${noStrum.filter(z => z.n.site === 'right').length}) · real strums the site heard ("agree") ${agree.length} (marked right ${agree.filter(z => z.n.site === 'right').length})`);
    // how well the replay gives back the take's own verdicts: base, at the ratios the take was graded with
    if (rules.includes('base')){
      let same = 0, sameHeard = 0, n = 0;
      notes.forEach(z => { const v = z.t.res['base@own'][z.n.i]; if (!v) return; n++; const site = v.verdict === 'ok' ? 'right' : v.verdict === 'off' ? 'wrong' : 'miss'; if (site === z.n.site) same++; if ((site !== 'miss') === (z.n.site !== 'miss')) sameHeard++; });
      console.log(`   reproduced: the base rule at each take's own ratios gives the saved verdict on ${same} of ${n} changes (heard / not heard: ${sameHeard} of ${n})`);
    }
    console.log('   rule   ratios | no strum: HEARD   marked RIGHT | real strums: LOST   right before -> right now');
    for (const rule of rules) for (const mode of ['own', 'now']){
      const key = rule + '@' + mode, get = z => z.t.res[key][z.n.i];
      const ns = noStrum.filter(z => get(z)), ag = agree.filter(z => get(z));
      const row = { noStrum: ns.length, heard: ns.filter(z => heard(get(z))).length, right: ns.filter(z => get(z).verdict === 'ok').length,
        agree: ag.length, lost: ag.filter(z => !heard(get(z))).length, rightBefore: ag.filter(z => z.n.site === 'right').length, rightNow: ag.filter(z => get(z).verdict === 'ok').length };
      (report[g.name] = report[g.name] || {})[key] = row;
      console.log(`   ${rule.padEnd(6)} ${(mode === 'own' ? "take's" : NOW.join('/')).padEnd(8)}|      ${String(row.heard).padStart(3)} of ${String(row.noStrum).padEnd(4)}     ${String(row.right).padStart(3)}      |        ${String(row.lost).padStart(3)} of ${String(row.agree).padEnd(4)}      ${String(row.rightBefore).padStart(3)} -> ${row.rightNow}`);
    }
  }
  const noMap = takes.filter(t => t.mapFrom !== 'strums');
  if (noMap.length) console.log(`\nclock offset not from strums: ${noMap.map(t => t.take + ' (' + t.mapFrom + ')').join(', ')}`);
  if (opt('json', null)) writeFileSync(opt('json'), JSON.stringify({ rules, now: NOW, report, takes: takes.map(t => ({ take: t.take, own: t.own, mapFrom: t.mapFrom, res: t.res })) }));
}
