/* Replay candidate Power Chord Switch rules on REAL takes (2026-11-11).

     node tools/mic-sim/replay-takes.mjs [folder] [--rules=base,ring,half,half3,both,both3] [--json=out.json]

   With no folder it reads the take SUMMARIES in tools/mic-sim/takes/ (in the repo: no audio, no names; made by tools/mic-sim/takes-in.mjs), so any
   session can run it. Given a folder of takes (the console's Download WAV + Download data pairs after anon-takes.mjs: T01.wav + T01.json ...) it
   replays the audio itself. Takes carry student audio: never commit them. This tool prints take numbers and counts only.

   Per Power Chord Switch take and per rule (tools/mic-sim/candidates.mjs):
     1. TRUTH comes from tools/mic-sim/eval-takes.mjs (the console's evaluator): per change, is there a strum in the recording where the site listened
        (`played`), and the take's own clock offset (`mapMs`). A summary carries these from the day it was made.
     2. The REAL ccLoop is run in a vm (closed-loop.mjs's site), round by round, at the take's own frame time and mic delay setting, with the count-in
        read as the game reads it. Nothing is replayed from the take's saved strums: the rule hears the take again.
          from audio      the recording goes back through the site's mic chain (gain, high-pass, low-pass: coach.js's numbers);
          from a summary  coach.js's two sample loops are rewritten to read the summary (closed-loop.mjs readSummaries): the energy of every
                          512-sample block of that same processed stream, and the pitch coachDetectPitch read at every block end. A window's end is
                          moved to the nearest block end (5.3 ms at most). takes-in.mjs prints how often the two replays agree.
     3. Each rule is run twice: with the strum ratios the take was graded with (so `base` should give back the take's own saved verdicts: the
        "reproduced" line says how often it does, and the rest is only as good as that number) and with coach.js's ratios of today.
   Counted, as Jonathan asked (2026-11-11):
     no strum in the window  changes where the recording has no strum where the site listened: how many the rule HEARD anyway (right or wrong
                             chord), and how many it marked RIGHT. Fewer is better.
     real strums             changes where the recording has a strum and the site heard it ("agree"): how many the rule no longer hears (LOST),
                             and how many it no longer marks right. The evaluator's "strum" is any attack: a tap counts.
   Left out, as the evaluator leaves them out: changes past the end of the audio, rounds the student retimed, impossible data.

   What a summary CANNOT test: a change to coachDetectPitch itself, to the mic chain, or to the 1024 / 512 window sizes (the summary was measured with
   the old ones; the "detector" stamp is compared and a mismatch is printed), and any rule that needs more than loudness, attack and pitch.

   WHEN TO ASK JONATHAN FOR NEW TAKES: the first lines this tool prints say so ("ASK JONATHAN"). The reasons: no summaries yet; the pitch detector
   or mic chain changed since they were made; no take was graded at today's strum ratios (each summary holds the ratios its take was graded
   with, so this needs no history); or, as a backup, the newest take is older than the last commit that changed a line DEFINING a listening
   constant in coach.js (so nothing recorded shows the current rule at work). Old takes or few takes alone are only a "Note" line, not a reason to ask (Jonathan, 2026-11-11). He downloads the
   recordings from the console and runs ONE command: node tools/mic-sim/takes-in.mjs.

   Limits: frames are evenly spaced at the take's mean frame time (the real ones were not); a take with no clock offset (fewer than 3 strums found)
   uses the count-in's lag, else 0, and is listed. */
import { readFileSync, writeFileSync, mkdtempSync, readdirSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { join, dirname, resolve } from 'node:path';
// coach.js may be cut into parts (tools/site-src.mjs): the git search below names the old file (its history before the cut) and every part.
import { siteParts } from '../site-src.mjs';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import { makeSite, SUM_HOP } from './closed-loop.mjs';
import { extract } from './extract.mjs';
import { biquad } from './student.mjs';
import { RULES } from './candidates.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const TAKES_DIR = join(HERE, 'takes');

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
  /* For a summary: the pitch coachDetectPitch reads in the window ending at every block end, per gate. */
  yin(gates, nBlocks, hop){
    coachAnalyser = __mic.analyser; coachCtx = __mic.ctx; coachFrameBuf = new Float32Array(COACH_FFT);
    const out = gates.map(() => new Float32Array(nBlocks)), sr = coachCtx.sampleRate;
    for (let g = 0; g < nBlocks; g++){
      __mic.seek(g * hop);
      coachAnalyser.getFloatTimeDomainData(coachFrameBuf);
      gates.forEach((gate, k) => { const f = coachDetectPitch(coachFrameBuf, sr, gate, coachFrameBuf.length); out[k][g] = f > 0 ? f : 0; });
    }
    return out;
  },
  gates(){ return JSON.stringify([RNW_POWER_CLARITY, 0.55]); },
  end(){
    cc.changes.forEach(c => { if (c.pend) ccResolvePend(c); if (c.result === null) c.result = 'miss'; });
    const out = cc.changes.map(c => ({ verdict: c.result, readings: c.readings ? c.readings.length : null }));
    ccStop(); cc = null;
    return JSON.stringify(out);
  }
};`;

const sites = {};
/* `at`: { root, coach } loads the site from another folder or coach.js from a file (closed-loop.mjs --root / --coach); left out, this repo. */
function siteFor(rule, ratio, fromSummary, at){
  const o = at || {};
  const k = rule + '|' + (ratio ? ratio.join('/') : 'now') + '|' + (fromSummary ? 's' : 'a') + '|' + (o.root || '') + '|' + (o.coach || '');
  if (!sites[k]){ sites[k] = makeSite(o.coach || null, rule, ratio, !!fromSummary, o.root || null); sites[k].run(VM_HELPERS); }
  return sites[k];
}
/* What a summary's pitch and energy were measured with: coachDetectPitch's text and the mic chain. A summary made with another stamp is stale for pitch. */
export function detectorStamp(site){
  return createHash('sha1').update(extract(site.coachSrc, 'coachDetectPitch') + JSON.stringify(site.chain) + SUM_HOP).digest('hex').slice(0, 12);
}
const b64 = a => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
const unb64 = s => { const b = Buffer.from(s, 'base64'); return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };

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
export function replayTake(site, d, src, srcRate, mapMs){
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
    if (src.E) site.mic.sum = src; else { site.mic.proc = src; site.mic.upTo = src.length; }
    site.mic.sr = srcRate; site.mic.offsetMs = mapMs;
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


/* The fields of a take a summary keeps: the game's own numbers. No name, id, label, user agent or time of day. */
const KEEP = ['game', 'complete', 'progression', 'song', 'ladder', 'bpm', 'stageBpms', 'bpc', 'gridStepCapMs', 'countInBeats', 'onsetRatio', 'hfRatio', 'micLatencyMs',
  'frameMeanMs', 'frameMaxMs', 'durationSec', 'tempoChanges', 'virtual'];
export function summarize(tk){
  const site = siteFor('base', null, false);
  site.reset();
  site.mic.proc = tk.proc; site.mic.upTo = tk.proc.length; site.mic.sr = tk.srcRate; site.mic.offsetMs = 0;
  const n = Math.floor(tk.proc.length / SUM_HOP), E = new Float32Array(n), D = new Float32Array(n);
  for (let g = 0; g < n; g++){
    let e = 0, dd = 0;
    for (let i = g * SUM_HOP; i < (g + 1) * SUM_HOP; i++){ const v = tk.proc[i], d = v - (i ? tk.proc[i - 1] : 0); e += v * v; dd += d * d; }
    E[g] = e; D[g] = dd;
  }
  const gates = JSON.parse(site.run('__rp.gates()'));
  site.run('globalThis.__gates = ' + JSON.stringify(gates));
  const P = site.run(`__rp.yin(__gates, ${n}, ${SUM_HOP})`), pitch = {};
  gates.forEach((g, k) => { pitch[JSON.stringify(g)] = b64(Float32Array.from(P[k])); });
  const take = {};
  KEEP.forEach(k => { if (tk.d[k] !== undefined) take[k] = tk.d[k]; });
  take.expected = (tk.d.expected || []).map(e => ({ i: e.i, t: e.t, from: e.from, to: e.to, stage: e.stage, bpm: e.bpm, verdict: e.verdict, readings: e.readings, retimed: e.retimed }));
  take.events = (tk.d.events || []).map(e => ({ t: e.t, stage: e.stage }));
  return { summary: 1, id: tk.id, day: tk.day, period: tk.period, chromebook: tk.chromebook, hop: SUM_HOP, srcRate: tk.srcRate, detector: detectorStamp(site), take,
    truth: { mapMs: tk.mapMs, mapFrom: tk.mapFrom, own: tk.own, notes: tk.notes.map(n => ({ i: n.i, stage: n.stage, site: n.site, played: n.played, cat: n.why && n.why.cat })) },
    E: b64(E), D: b64(D), pitch };
}

/* Takes from a folder of audio (anonymized pairs). */
export function loadAudio(folder){
  const tmp = join(mkdtempSync(join(tmpdir(), 'replay-takes-')), 'eval.json');
  // the evaluator names each take's file on stderr ("T01 = file.wav"): the table itself is not needed here
  const ev = spawnSync(process.execPath, [join(HERE, 'eval-takes.mjs'), resolve(folder), '--json', tmp], { encoding: 'utf8', maxBuffer: 1 << 28 });
  if (ev.status !== 0) throw new Error('eval-takes.mjs failed:\n' + ev.stderr);
  const fileOf = {};
  (ev.stderr + '\n' + ev.stdout).split('\n').forEach(l => { const m = l.match(/^(T\d+) = (.+\.wav)\s*$/i); if (m) fileOf[m[1]] = m[2]; });
  const all = JSON.parse(readFileSync(tmp, 'utf8')).rows, chain = siteFor('base', null, false).chain, out = [];
  for (const row of all.filter(r => r.kind === 'pw')){
    const f = fileOf[row.take];
    if (!f) continue;
    const base = join(resolve(folder), f.replace(/\.wav$/i, ''));
    const raw = readFileSync(base + '.wav'), d = JSON.parse(readFileSync(base + '.json', 'utf8')), wav = readWav(base + '.wav');
    const srcRate = Number(d.srcSampleRate) || wav.sr, lat = Number(d.micLatencyMs) || 0, L = row.latency || {};
    out.push({ take: row.take, id: createHash('sha1').update(raw).digest('hex').slice(0, 12), day: typeof d.savedAt === 'string' ? d.savedAt.slice(0, 10) : null,
      period: d.period == null ? null : String(d.period).slice(0, 4), chromebook: !!(row.device && row.device.chromebook), d, srcRate,
      own: [Number(d.onsetRatio) || row.strumRatio.full, Number(d.hfRatio) || row.strumRatio.hf],
      mapMs: L.mapMs != null ? L.mapMs : L.clickLagMs != null ? lat - L.clickLagMs : 0, mapFrom: L.mapMs != null ? 'strums' : L.clickLagMs != null ? 'count-in' : 'none',
      notes: row.perNote, proc: prepare(wav, srcRate, chain) });
  }
  return { takes: out, total: all.length };
}
/* Takes from the summaries in the repo. */
export function loadSummaries(dir){
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => /^[0-9a-f]{12}\.json$/.test(f)).sort().map(f => { const text = readFileSync(join(dir, f), 'utf8'); return Object.assign(JSON.parse(text), { __hash: createHash('sha1').update(text).digest('hex') }); }).filter(s => s.summary === 1)
    .sort((a, b) => String(b.day).localeCompare(String(a.day)) || a.id.localeCompare(b.id))
    .map((s, k) => ({ take: 'S' + String(k + 1).padStart(2, '0'), id: s.id, hash: s.__hash, day: s.day, period: s.period, d: s.take, srcRate: s.srcRate, own: s.truth.own, mapMs: s.truth.mapMs, mapFrom: s.truth.mapFrom,
      notes: s.truth.notes.map(n => ({ i: n.i, stage: n.stage, site: n.site, played: n.played, why: { cat: n.cat } })), detector: s.detector,
      sum: { E: unb64(s.E), D: unb64(s.D), pitch: Object.fromEntries(Object.entries(s.pitch).map(([k, v]) => [k, unb64(v)])) } }));
}
/* Runs every rule on every take; res[rule@own|now] = { expected index: { verdict, readings } }. */
/* `cache` (closed-loop.mjs passes one; this tool's own command line does not): { key(site, tk), get(key), set(key, result) }, so a replay already
   made by the same site code on the same summary is read back instead of run again. */
export function replayAll(takes, rules, now, at, cache){
  takes.forEach(tk => { tk.res = {};
    for (const rule of rules) for (const [mode, ratio] of [['own', tk.own], ['now', now]]){
      const site = siteFor(rule, ratio, !!tk.sum, at), k = cache && tk.hash ? cache.key(site, tk) : null, hit = k ? cache.get(k) : null;
      tk.res[rule + '@' + mode] = hit || replayTake(site, tk.d, tk.sum || tk.proc, tk.srcRate, tk.mapMs);
      if (k && !hit) cache.set(k, tk.res[rule + '@' + mode]);
    }
  });
}
/* Should Jonathan be asked for new takes? Reasons, from the summaries and the repo's history. */
export function askReasons(takes, site){
  const why = [];
  if (!takes.length) return ['there are no take summaries in tools/mic-sim/takes/ yet'];
  const stamp = detectorStamp(site), stale = takes.filter(t => t.detector !== stamp).length;
  if (stale) why.push(`${stale} of ${takes.length} summaries were measured before the pitch detector or the mic chain changed: their pitch is out of date`);
  const days = takes.map(t => t.day).filter(Boolean).sort(), newest = days[days.length - 1] || null;
  /* The main test, exact and without git (2026-11-11): every summary holds the strum ratios its take was graded with (truth.own). If no take was
     graded at today's ratios, nothing recorded shows today's rule at work. */
  const now = [Number(site.run('CC_POWER_ONSET_RATIO')), Number(site.run('CC_POWER_HF_RATIO'))];
  const same = (x, y) => Math.abs(Number(x) - Number(y)) < 1e-6, at = r => `${r[0]} / ${r[1]}`;
  const atNow = takes.filter(t => t.own && same(t.own[0], now[0]) && same(t.own[1], now[1])).length;
  if (!atNow){
    const last = takes.filter(t => t.day === newest && t.own)[0] || takes.filter(t => t.own)[0];
    why.push(`no take was graded at today's strum ratios (${at(now)})` + (last ? `: the newest is from ${last.day}, graded at ${at(last.own)}` : ''));
  }
  /* The backup, for a change to the other listening constants (the ratios are covered above). It used to run in tools/mic-sim, where the path
     "coach.js" matches nothing, so it could never fire; and its pattern matched any MENTION of a name, so a comment-only commit counted as a change.
     Now: from the repo root, and only lines that DEFINE a constant. */
  const git = a => { const r = spawnSync('git', a, { cwd: join(HERE, '..', '..'), encoding: 'utf8' }); return r.status === 0 ? r.stdout.trim() : ''; };
  const lastListen = git(['log', '-1', '--format=%cs', '-G', '^const (CC_POWER_ONSET_RATIO|CC_POWER_HF_RATIO|CHK_ONSET_FLOOR|CHK_ONSET_RATIO|CHK_HF_FLOOR|CHK_HF_RATIO|COACH_EVENT_TAIL|COACH_ATTACK_SKIP)', '--', 'coach.js', ...siteParts('coach.js', join(HERE, '..', '..'))]);
  if (atNow && newest && lastListen && newest < lastListen) why.push(`the newest take is from ${newest}, before the last change to a listening constant in coach.js (${lastListen}): no take shows today's rule at work`);
  return why;
}
/* Weaker reasons: worth a mention to a session that is working on listening, never a reminder to Jonathan by themselves (his call, 2026-11-11:
   old takes alone would repeat every Friday). */
export function softNotes(takes){
  const notes = [], days = takes.map(t => t.day).filter(Boolean).sort(), newest = days[days.length - 1] || null;
  if (takes.length && takes.length < 15) notes.push(`only ${takes.length} Power Chord Switch takes (15 or more make the counts steadier)`);
  if (newest && (Date.now() - Date.parse(newest)) / 864e5 > 30) notes.push(`the newest take is from ${newest}, more than 30 days ago`);
  return notes;
}
export function printReport(takes, rules, NOW, log){
  const heard = v => v && (v.verdict === 'ok' || v.verdict === 'off');
  const groups = [...new Set(takes.map(t => t.own[0]))].sort((a, b) => a - b).map(r => ({ name: 'takes graded at ' + r, pick: t => t.own[0] === r })).concat([{ name: 'ALL takes', pick: () => true }]);
  const report = {};
  for (const g of groups){
    const ts = takes.filter(g.pick), notes = ts.flatMap(t => t.notes.map(n => ({ t, n })));
    const noStrum = notes.filter(z => !z.n.played), agree = notes.filter(z => z.n.why && z.n.why.cat === 'agree');
    log(`\n== ${g.name}: ${ts.length} takes, ${notes.length} judged changes · no strum in the window ${noStrum.length} (the site heard ${noStrum.filter(z => z.n.site !== 'miss').length}, marked right ${noStrum.filter(z => z.n.site === 'right').length}) · real strums the site heard ("agree") ${agree.length} (marked right ${agree.filter(z => z.n.site === 'right').length})`);
    // how well the replay gives back the take's own verdicts: base, at the ratios the take was graded with
    if (rules.includes('base')){
      let same = 0, sameHeard = 0, n = 0;
      notes.forEach(z => { const v = z.t.res['base@own'][z.n.i]; if (!v) return; n++; const site = v.verdict === 'ok' ? 'right' : v.verdict === 'off' ? 'wrong' : 'miss'; if (site === z.n.site) same++; if ((site !== 'miss') === (z.n.site !== 'miss')) sameHeard++; });
      log(`   reproduced: the base rule at each take's own ratios gives the saved verdict on ${same} of ${n} changes (heard / not heard: ${sameHeard} of ${n})`);
      report[g.name] = { reproduced: [same, sameHeard, n] };
    }
    log('   rule   ratios | no strum: HEARD   marked RIGHT | real strums: LOST   right before -> right now');
    for (const rule of rules) for (const mode of ['own', 'now']){
      const key = rule + '@' + mode, get = z => z.t.res[key][z.n.i];
      const ns = noStrum.filter(z => get(z)), ag = agree.filter(z => get(z));
      const row = { noStrum: ns.length, heard: ns.filter(z => heard(get(z))).length, right: ns.filter(z => get(z).verdict === 'ok').length,
        agree: ag.length, lost: ag.filter(z => !heard(get(z))).length, rightBefore: ag.filter(z => z.n.site === 'right').length, rightNow: ag.filter(z => get(z).verdict === 'ok').length };
      (report[g.name] = report[g.name] || {})[key] = row;
      log(`   ${rule.padEnd(6)} ${(mode === 'own' ? "take's" : NOW.join('/')).padEnd(8)}|      ${String(row.heard).padStart(3)} of ${String(row.noStrum).padEnd(4)}     ${String(row.right).padStart(3)}      |        ${String(row.lost).padStart(3)} of ${String(row.agree).padEnd(4)}      ${String(row.rightBefore).padStart(3)} -> ${row.rightNow}`);
    }
  }
  const noMap = takes.filter(t => t.mapFrom !== 'strums');
  if (noMap.length) log(`\nclock offset not from strums: ${noMap.map(t => t.take + ' (' + t.mapFrom + ')').join(', ')}`);
  return report;
}
export function todayRatios(at){ const s = siteFor('base', null, false, at); return [Number(s.run('CC_POWER_ONSET_RATIO')), Number(s.run('CC_POWER_HF_RATIO'))]; }
export function baseSite(at){ return siteFor('base', null, false, at); }

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]){
  const args = process.argv.slice(2), folder = args.find(a => !a.startsWith('--'));
  const opt = (k, d) => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : d; };
  const rules = opt('rules', RULES.join(',')).split(',');
  for (const r of rules) if (!RULES.includes(r)){ console.error('no rule "' + r + '" (' + RULES.join(', ') + ')'); process.exit(2); }
  const NOW = todayRatios();
  let takes;
  if (folder){
    const a = loadAudio(folder); takes = a.takes;
    console.log(`${takes.length} Power Chord Switch takes of ${a.total} in the folder, from AUDIO · rules ${rules.join(', ')} · today's strum ratios ${NOW.join(' / ')}`);
  } else {
    takes = loadSummaries(TAKES_DIR);
    const days = takes.map(t => t.day).filter(Boolean).sort();
    console.log(`${takes.length} Power Chord Switch take summaries (tools/mic-sim/takes/${days.length ? ', ' + days[0] + ' to ' + days[days.length - 1] : ''}) · rules ${rules.join(', ')} · today's strum ratios ${NOW.join(' / ')}`);
    const why = askReasons(takes, baseSite());
    console.log(why.length ? 'ASK JONATHAN for new takes (he downloads the recordings, then: node tools/mic-sim/takes-in.mjs):\n' + why.map(w => '  - ' + w).join('\n') : 'Takes are current: no need to ask Jonathan for new ones.');
    const soft = softNotes(takes);
    if (soft.length) console.log('Note (no need to ask him for this alone): ' + soft.join('; '));
    if (!takes.length) process.exit(1);
  }
  replayAll(takes, rules, NOW);
  const report = printReport(takes, rules, NOW, console.log);
  if (opt('json', null)) writeFileSync(opt('json'), JSON.stringify({ rules, now: NOW, report, takes: takes.map(t => ({ take: t.take, id: t.id, own: t.own, mapFrom: t.mapFrom, res: t.res })) }));
}
