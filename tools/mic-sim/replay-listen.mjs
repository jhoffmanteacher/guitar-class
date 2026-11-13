/* Recorded Listening Coach and Note Runner takes, replayed through the REAL game loops (2026-11-12, the listening bench, steps 1a, 2, 3).

     node tools/mic-sim/replay-listen.mjs [folder] [--root=<site folder>] [--coach=<file>] [--noise] [--json=<file>] [--against=<file>]

   With no folder it reads the take SUMMARIES in tools/mic-sim/takes/ (kind coach-melody / coach-chords / nr; no audio, no names; made
   by tools/mic-sim/takes-in.mjs), so any session can run it. Given a folder of anonymized takes (T01.wav + T01.json, anon-takes.mjs) it
   replays the audio itself. Student audio: never commit it; this prints take numbers and counts only.

   THE TRUTH, per expected note, comes from the console's evaluator (eval-takes.mjs: teacher-mic.js micEvalTake), never from the loop
   under test: `played` (a pick attack within half a beat of the note in the recording) and `present` (the recording, read through the
   site's own filters and coachDetectPitch at its plain 0.22 gate, holds the note or its octave in half or more of its readings:
   'present'; 20-50 %: 'mixed'; a steady other pitch: 'other'; under 2 readings: 'none'; a chord's share of chord tones, 20 % = present).
   Notes past the end of the recording (the 30 s cap) are `dropped` by the evaluator and left out here too.
   THE SITE, per take: the real Listening Coach (coachOpen with the drill rebuilt from the take: its notes, or its chord names through the
   site's chordMidis; coachStartCheck, coachLoop, coachFinalizeEvent, coachMatchEvent, coachMelodyVote, coachToneShare, the second look,
   coachFinish and coachRenderReport), or Note Runner's real nrLoop / nrFinalizeEvent / nrGrade / nrFinish on the take's own notes
   (tools/mic-sim/listen-site.mjs). At the take's own tempo, mic-delay setting and mean frame time, with the site's clock running the
   take's clock offset (`mapMs`) ahead of the recording.
     from audio      the recording goes back through the site's mic chain (gain, 70 Hz high-pass, 1500 Hz low-pass, read from coach.js);
     from a summary  the energy of every 512-sample block and coachDetectPitch at every block end, at 0.22 and 0.55 (closed-loop.mjs
                     readSummaries rewrites coach.js's two sample loops to read them; nothing else changes).
   Printed per mode (Coach melody, Coach chords, Note Runner), for the site's SAVED verdicts and for the REPLAY:
     real notes   notes with a pick attack in the recording: right (ok / octave; Note Runner perfect / good), half credit (Note Runner
                  'pitch': on the beat, wrong or unclear note), unclear (Coach dim), wrong, missed;
     clearly there, not counted right   notes the recording clearly holds (`present`) that the site did not mark right, by the site's
                  own reason in the replay (no event matched / under 2 readings / readings disagreed / heard another note);
     nothing played   notes with no attack and nothing clearly in the recording: how many the site still marked right or heard at all.
   reproduced   how often the replay gives the take's OWN saved verdict: the error bar for everything else. It mixes two things: the replay's
                own error (evenly spaced frames, the shorter count-in, the take's clock offset) and every change to the site's listening
                since the take was made (the 2026-10-09 takes predate the second look of 2026-10-16).
   --noise      replays each take again with its clock offset moved by -20, +20, -40, +40 and -100 ms (the noise bar tonight's Power
                Chord Switch work used) and prints how far each count moves: a difference between two sites smaller than that is none.
   --against    an earlier --json of this command: per note, ranked by the recording (RANK below); exit 0 same, 1 moved, 2 not comparable.
   --own-day    (with a folder of audio only) also replays each take on the site as it was when the take was saved (the last commit on
                origin/main before the take's savedAt, unpacked with git archive into a temporary folder and deleted after), and prints
                that "reproduced" line: the replay's OWN error, with no listening change in between. Measured 2026-11-12 on the 13 takes:
                Coach melody 47 of 64, Coach chords 4 of 8, Note Runner 53 of 74 (today's site: 43, 4, 51). The time of day is read to pick
                the commit and never printed; a summary keeps only the day, so this needs the audio.
   What it can judge: the matcher, the onset rule, the readings' consensus and vote, the second look, the chord-tone share, the slot
   verdicts and Note Runner's grade, on what the mic really heard. What it cannot: a change to coachDetectPitch, the mic chain, the level
   window or hop or the analyser size (the summaries hold readings made with the old ones: printed as CANNOT JUDGE, refused by
   --against); which note the student MEANT (the truth is what is in the recording). The report's levels are replayed too, but the takes
   hold no level to compare with: shown, not ranked. */
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync, renameSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { benchSite, coachTake, nrRound, takeSource } from './listen-site.mjs';
import { SUM_HOP } from './closed-loop.mjs';
import { loadAudio, detectorStamp, measuredWith, staleReasons, baseSite, TAKES_DIR } from './replay-takes.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
export const LISTEN_KINDS = ['coach-melody', 'coach-chords', 'nr'];
export const NOISE_SHIFTS = [-20, 20, -40, 40, -100];
const b64 = a => Buffer.from(a.buffer, a.byteOffset, a.byteLength).toString('base64');
const unb64 = s => { const b = Buffer.from(s, 'base64'); return new Float32Array(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength)); };

/* ── Summaries (takes-in.mjs writes them) ── */
const KEEP = ['game', 'mode', 'coachMode', 'bpm', 'beatMs', 'gridOffsetMs', 'micLatencyMs', 'frameMeanMs', 'frameMaxMs', 'durationSec', 'level', 'chords', 'goodMs', 'perfectMs', 'score'];
export const LISTEN_GATES = [0.22, 0.55];
export function summarizeListen(tk){
  const site = baseSite();
  site.reset();
  site.mic.proc = tk.proc; site.mic.upTo = tk.proc.length; site.mic.sr = tk.srcRate; site.mic.offsetMs = 0;
  const n = Math.floor(tk.proc.length / SUM_HOP), E = new Float32Array(n), D = new Float32Array(n);
  for (let g = 0; g < n; g++){
    let e = 0, dd = 0;
    for (let i = g * SUM_HOP; i < (g + 1) * SUM_HOP; i++){ const v = tk.proc[i], d = v - (i ? tk.proc[i - 1] : 0); e += v * v; dd += d * d; }
    E[g] = e; D[g] = dd;
  }
  site.run('globalThis.__gates = ' + JSON.stringify(LISTEN_GATES));
  const P = site.run(`__rp.yin(__gates, ${n}, ${SUM_HOP})`), pitch = {};
  LISTEN_GATES.forEach((g, k) => { pitch[JSON.stringify(g)] = b64(Float32Array.from(P[k])); });
  const take = {};
  KEEP.forEach(k => { if (tk.d[k] !== undefined) take[k] = tk.d[k]; });
  const coach = tk.kind !== 'nr';
  take.expected = (tk.d.expected || []).map((e, i) => coach
    ? { i: e.i == null ? i : e.i, t: e.t, midi: e.midi, midis: e.midis || null, chord: e.chord || null, label: e.label || '', verdict: e.verdict, loose: !!e.loose, secondLook: !!e.secondLook, devMs: e.devMs == null ? null : e.devMs }
    : { i, t: e.t, midi: e.midi, string: e.string, fret: e.fret, chord: e.chord || null, verdict: e.verdict, unclear: !!e.unclear, secondLook: !!e.secondLook });
  take.events = (tk.d.events || []).map(e => Object.assign({ t: e.t, midi: e.midi == null ? null : e.midi, readings: e.readings || [] }, e.slot != null ? { slot: e.slot } : {}, e.look ? { look: e.look } : {}));
  return { summary: 1, kind: tk.kind, id: tk.id, day: tk.day, period: tk.period, chromebook: tk.chromebook, hop: SUM_HOP, srcRate: tk.srcRate, detector: detectorStamp(site), measured: measuredWith(site), take,
    truth: { mapMs: tk.mapMs, mapFrom: tk.mapFrom, dropped: tk.dropped, notes: tk.notes.map(n => ({ i: n.i, site: n.site, played: n.played, present: n.replay, cat: n.why && n.why.cat,
      siteN: n.why ? n.why.siteN : null, winN: n.why ? n.why.winN : null, lateN: n.why ? n.why.lateN : null, lateHit: n.why ? n.why.lateHit : null, share: n.share != null ? n.share : n.exact != null ? Math.round((n.exact + n.oct) * 100) / 100 : null })) },
    E: b64(E), D: b64(D), pitch };
}
export function loadListenSummaries(dir){
  if (!existsSync(dir)) return [];
  return readdirSync(dir).filter(f => /^[0-9a-f]{12}\.json$/.test(f)).sort().map(f => { const text = readFileSync(join(dir, f), 'utf8'); return Object.assign(JSON.parse(text), { __hash: createHash('sha1').update(text).digest('hex') }); })
    .filter(s => s.summary === 1 && LISTEN_KINDS.includes(s.kind))
    .sort((a, b) => String(b.day).localeCompare(String(a.day)) || a.id.localeCompare(b.id))
    .map((s, k) => ({ take: 'L' + String(k + 1).padStart(2, '0'), id: s.id, hash: s.__hash, kind: s.kind, day: s.day, period: s.period, d: s.take, srcRate: s.srcRate, mapMs: s.truth.mapMs, mapFrom: s.truth.mapFrom,
      notes: s.truth.notes, dropped: s.truth.dropped, detector: s.detector, measured: s.measured,
      sum: { E: unb64(s.E), D: unb64(s.D), pitch: Object.fromEntries(Object.entries(s.pitch).map(([k, v]) => [k, unb64(v)])) } }));
}
/* Audio takes in the same shape (notes with `present`). */
export function loadListenAudio(folder){
  const a = loadAudio(folder, true);
  return { total: a.total, takes: a.listen.map(t => Object.assign(t, { notes: t.notes.map(n => ({ i: n.i, site: n.site, played: n.played, present: n.replay, cat: n.why && n.why.cat })) })) };
}

/* ── One take through the real loop ── */
/* The Coach drill the take was: melody, its notes (a slot's midis when it had more than one); chords, its chord names in slot order,
   each name's notes from the site's chordMidis. The rebuilt drill must give the take's own slots back (count and names), or the take is
   not replayed. */
function coachDrill(site, d){
  const exp = d.expected || [];
  if (d.coachMode === 'chords'){
    const uniq = [], seen = new Set();
    exp.forEach(e => { if (!seen.has(e.chord)){ seen.add(e.chord); uniq.push(e.chord); } });
    const spec = uniq.map(n => ({ n, m: JSON.parse(site.run(`JSON.stringify(chordMidis(${JSON.stringify(n)}))`)) }));
    if (spec.some(c => !c.m.length)) return { error: 'no diagram for ' + spec.filter(c => !c.m.length).map(c => c.n).join(', ') };
    return { chords: JSON.stringify(spec), check: exp.map(e => e.chord) };
  }
  return { midis: JSON.stringify(exp.map(e => e.midis && e.midis.length > 1 ? e.midis : e.midi)), check: null };
}
export async function replayOne(tk, at, shiftMs){
  const site = benchSite(at, !!tk.sum), d = tk.d, map = (tk.mapMs || 0) + (shiftMs || 0);
  const src = takeSource(tk.sum || tk.proc, tk.srcRate, map), frameMs = Math.max(8, Math.min(120, Number(d.frameMeanMs) || 16.667));
  const exp = d.expected || [];
  if (tk.kind === 'nr'){
    const r = await nrRound(site, src, { notes: exp.map(e => ({ t: e.t, midi: e.midi, string: e.string, fret: e.fret, chord: !!e.chord, name: e.chord || undefined })),
      chords: !!d.chords, beatMs: Number(d.beatMs) || 60000 / d.bpm, goodMs: d.goodMs, perfectMs: d.perfectMs, lat: Number(d.micLatencyMs) || 0, frameMs });
    return { notes: r.notes.map(n => ({ v: n.verdict === 'pitch' && n.unclear ? 'pitch-unclear' : n.verdict, look: n.look })), events: r.events.length };
  }
  const dr = coachDrill(site, d);
  if (dr.error) return { error: dr.error };
  const r = await coachTake(site, src, { chords: dr.chords, midis: dr.midis, bpm: d.bpm, lat: Number(d.micLatencyMs) || 0, frameMs, beat1: exp[0].t });
  if (r.slots.length !== exp.length) return { error: `the rebuilt drill has ${r.slots.length} slots, the take ${exp.length}` };
  if (dr.check && r.slots.some((s, i) => s.chord !== dr.check[i])) return { error: 'the rebuilt drill\'s chords are not the take\'s, slot by slot' };
  return { notes: r.slots.map(s => ({ v: s.state, n: s.n, look: s.look })), overall: r.overall, crits: r.crits, events: r.events.length };
}

/* ── The cache (one small file per take, site code and clock shift; closed-loop.mjs's folder) ── */
const CACHE_DIR = join(HERE, '.replay-cache');
function listenCache(){
  const tools = createHash('sha1');
  for (const f of ['replay-listen.mjs', 'listen-site.mjs', 'closed-loop.mjs', 'replay-takes.mjs']) tools.update(readFileSync(join(HERE, f)));
  const th = tools.digest('hex');
  const c = { hits: 0, runs: 0,
    key: (site, tk, shift) => createHash('sha1').update('listen|' + th + '|' + site.fingerprint + '|' + tk.hash + '|' + shift).digest('hex'),
    get(k){ const f = join(CACHE_DIR, k + '.json'); if (existsSync(f)){ try { const v = JSON.parse(readFileSync(f, 'utf8')); if (v && typeof v === 'object'){ c.hits++; return v; } } catch (e){} } c.runs++; return null; },
    set(k, v){ mkdirSync(CACHE_DIR, { recursive: true }); const f = join(CACHE_DIR, k + '.json'), tmp = f + '.' + process.pid + '.tmp'; writeFileSync(tmp, JSON.stringify(v)); renameSync(tmp, f); } };
  return c;
}
export async function replayAllListen(takes, at, shifts, useCache){
  const cache = useCache ? listenCache() : null;
  for (const tk of takes){
    tk.res = {};
    for (const sh of shifts){
      const site = benchSite(at, !!tk.sum), k = cache && tk.hash ? cache.key(site, tk, sh) : null, hit = k ? cache.get(k) : null;
      /* A site that reads pitch at a gate the summaries were not measured at (a changed clarity) cannot be replayed from them: the
         take is kept with the reason, and noGate() turns it into a CANNOT JUDGE. */
      try { tk.res[sh] = hit || await replayOne(tk, at, sh); }
      catch (e){ if (!/hold no pitch for the gate/.test(e.message)) throw e; tk.res[sh] = { error: e.message.replace(/^closed-loop: /, '') }; continue; }
      if (k && !hit) cache.set(k, tk.res[sh]);
    }
  }
  return cache;
}

/* Why the summaries cannot judge this site, beyond staleReasons: a take the site asked for pitch at a gate they do not hold. */
export function noGate(takes){
  const bad = takes.filter(t => Object.values(t.res || {}).some(r => r && r.error && /hold no pitch for the gate/.test(r.error)));
  return bad.length ? [`${bad.length} of ${takes.length} Coach / Note Runner summaries hold no pitch at the gate this site reads (${[...new Set(bad.flatMap(t => Object.values(t.res).filter(r => r.error).map(r => r.error.replace(/ \(run the intake again\)/, ''))))].join('; ')}): a change to the pitch detector's clarity needs the audio`] : [];
}

/* ── Counting ── */
/* A verdict, in the owner's words: right, half (Note Runner 'pitch' on a clear wrong note), unclear (Coach dim; Note Runner 'pitch'
   on an unclear note), wrong (Coach), missed. */
const WORD = { ok: 'right', oct: 'right', perfect: 'right', good: 'right', dim: 'unclear', 'pitch-unclear': 'unclear', pitch: 'half', wrong: 'wrong', miss: 'missed' };
const SAVED = (tk, e) => tk.kind === 'nr' ? (e.verdict === 'pitch' && e.unclear ? 'pitch-unclear' : e.verdict) : e.verdict;
/* Why the replay did not count a note the recording clearly holds: the site's own state for that slot. */
function why(tk, v){
  if (v.v === 'miss') return 'no sound matched to it';
  if (tk.kind === 'nr') return v.v === 'pitch-unclear' ? 'heard, pitch unclear' : 'heard another note';
  if (v.v === 'dim') return v.n != null && v.n < (tk.kind === 'coach-chords' ? 1 : 2) ? 'heard, too few readings' : 'heard, readings disagreed';
  return 'heard another note';
}
export function countMode(takes, kind, key){
  const out = { takes: 0, notes: 0, dropped: 0, real: {}, clearly: 0, clearlyNot: {}, nothing: 0, nothingRight: 0, nothingHeard: 0, repro: [0, 0], skipped: 0 };
  for (const tk of takes.filter(t => t.kind === kind)){
    out.takes++; out.dropped += tk.dropped || 0;
    const res = key == null ? null : tk.res[key];
    if (res && res.error){ out.skipped++; continue; }
    for (const n of tk.notes){
      const e = tk.d.expected[n.i], saved = SAVED(tk, e), v = res ? res.notes[n.i] : { v: saved, n: null };
      if (!v) continue;
      out.notes++;
      const w = WORD[v.v] || v.v;
      if (res){ out.repro[1]++; if (v.v === saved) out.repro[0]++; }
      if (n.played) out.real[w] = (out.real[w] || 0) + 1;
      if (n.present === 'present'){ out.clearly++; if (w !== 'right'){ const r = res ? why(tk, v) : (n.cat || '?'); out.clearlyNot[r] = (out.clearlyNot[r] || 0) + 1; } }
      if (!n.played && n.present !== 'present' && n.present !== 'mixed'){ out.nothing++; if (w === 'right') out.nothingRight++; if (w !== 'missed') out.nothingHeard++; }
    }
  }
  return out;
}
const MODES = [['coach-melody', 'Listening Coach, melody'], ['coach-chords', 'Listening Coach, chords'], ['nr', 'Note Runner']];
export function printListen(takes, shifts, log){
  const report = {};
  for (const [kind, name] of MODES){
    const sel = takes.filter(t => t.kind === kind);
    if (!sel.length) continue;
    const saved = countMode(sel, kind, null), now = countMode(sel, kind, 0);
    const realN = c => Object.values(c.real).reduce((a, b) => a + b, 0);
    const realTxt = c => ['right', 'half', 'unclear', 'wrong', 'missed'].filter(k => kind === 'nr' ? k !== 'wrong' : k !== 'half').map(k => (c.real[k] || 0) + ' ' + k).join(' / ');
    const nots = c => Object.entries(c.clearlyNot).sort((a, b) => b[1] - a[1]).map(([k, v]) => v + ' ' + k).join(', ') || 'none';
    log(`\n== ${name}: ${sel.length} takes, ${saved.notes} notes judged (${saved.dropped} past the end of the recording, not judged)`);
    log(`   SAVED by the site when the take was made:`);
    log(`     real notes (an attack in the recording) ${realN(saved)}: ${realTxt(saved)}`);
    log(`     clearly in the recording ${saved.clearly}, not marked right ${Object.values(saved.clearlyNot).reduce((a, b) => a + b, 0)} (the evaluator's reason: ${nots(saved)})`);
    log(`     nothing played there ${saved.nothing}: marked right ${saved.nothingRight}, heard at all ${saved.nothingHeard}`);
    log(`   REPLAYED through today's site${now.skipped ? ` (${now.skipped} takes could not be replayed)` : ''}:`);
    log(`     real notes ${realN(now)}: ${realTxt(now)}`);
    log(`     clearly in the recording ${now.clearly}, not marked right ${Object.values(now.clearlyNot).reduce((a, b) => a + b, 0)} (the site's own reason: ${nots(now)})`);
    log(`     nothing played there ${now.nothing}: marked right ${now.nothingRight}, heard at all ${now.nothingHeard}`);
    log(`     reproduced: the replay gives the take's own saved verdict on ${now.repro[0]} of ${now.repro[1]} notes (the error bar: replay error plus every listening change since the take)`);
    const r = { saved, now };
    if (shifts.length > 1){
      const runs = shifts.filter(s => s !== 0).map(s => countMode(sel, kind, s));
      const span = f => { const v = [f(now), ...runs.map(f)]; return `${Math.min(...v)}-${Math.max(...v)}`; };
      log(`     noise (clock offset moved ${shifts.filter(s => s !== 0).join(', ')} ms): real notes right ${span(c => c.real.right || 0)}, clearly there not right ${span(c => Object.values(c.clearlyNot).reduce((a, b) => a + b, 0))}, nothing played marked right ${span(c => c.nothingRight)}, heard ${span(c => c.nothingHeard)}`);
      r.noise = runs;
    }
    if (kind.startsWith('coach')){
      const lv = {};
      sel.forEach(t => { const x = t.res[0]; if (x && !x.error) lv[x.overall] = (lv[x.overall] || 0) + 1; });
      log(`     the report's level in the replay (the takes hold none to compare): ${Object.entries(lv).map(([k, v]) => v + ' ' + ({ couldntHear: "couldn't hear", 1: 'Needs work', 2: 'Good', 3: 'Great' }[k] || k)).join(', ')}`);
    }
    report[kind] = r;
  }
  const off = takes.filter(t => t.mapFrom !== 'notes');
  if (off.length) log(`\nclock offset not from the notes: ${off.map(t => t.take + ' (' + t.mapFrom + ')').join(', ')}`);
  return report;
}

/* ── --against: per note, ranked by the recording ── */
/* present: right > unclear / missed > wrong (calling a clear right note wrong is the worst); another note clearly there ('other'):
   wrong / half > unclear / missed > right; nothing played and nothing there: missed > unclear / wrong / half > right. 'mixed' and a
   played note with no readable pitch are not ranked: the recording does not say. */
const RANK = { present: { right: 3, unclear: 2, missed: 2, half: 1, wrong: 1 }, other: { wrong: 3, half: 3, unclear: 2, missed: 2, right: 1 }, nothing: { missed: 3, unclear: 2, wrong: 2, half: 2, right: 1 } };
export function listenJson(takes){
  return takes.map(t => ({ take: t.take, id: t.id, kind: t.kind, error: t.res[0] && t.res[0].error || null, overall: t.res[0] && t.res[0].overall != null ? t.res[0].overall : null,
    notes: t.notes.map(n => { const v = t.res[0] && t.res[0].notes ? t.res[0].notes[n.i] : null; return { i: n.i, played: !!n.played, present: n.present, v: v ? v.v : null }; }) }));
}
export function compareListen(now, was, file, stale){
  const no = why => ({ code: 2, lines: [`against ${file}: ${why}; nothing compared`] });
  if (!was || !Array.isArray(was.takes)) return no('NOT THE SAME COMMAND (the earlier run has no Listening Coach / Note Runner takes)');
  if (stale && stale.length) return no('the recorded Coach / Note Runner takes cannot judge this change (' + stale.join('; ') + ')');
  const byId = new Map(was.takes.map(t => [t.id, t]));
  if (now.length !== was.takes.length || now.some(t => !byId.has(t.id))) return no(`NOT THE SAME TAKES (this run ${now.length}, the earlier one ${was.takes.length})`);
  let n = 0, diff = 0, worse = 0, better = 0, other = 0;
  const first = [];
  for (const t of now){
    const w = new Map(byId.get(t.id).notes.map(x => [x.i, x]));
    for (const x of t.notes){
      const o = w.get(x.i);
      if (!o || x.v == null || o.v == null) continue;
      n++;
      if (o.v === x.v) continue;
      diff++;
      const truth = x.present === 'present' ? 'present' : x.present === 'other' && x.played ? 'other' : !x.played && x.present !== 'present' && x.present !== 'mixed' ? 'nothing' : null;
      const a = truth ? RANK[truth][WORD[o.v]] : null, b = truth ? RANK[truth][WORD[x.v]] : null;
      const kind = truth == null || a === b ? 'other' : b < a ? 'WORSE' : 'better';
      if (kind === 'WORSE') worse++; else if (kind === 'better') better++; else other++;
      if (first.length < 10) first.push(`  ${t.kind} take ${t.take} (${t.id}) note ${x.i}: ${truth ? { present: 'the note is clearly in the recording', other: 'another note is clearly in the recording', nothing: 'nothing played there' }[truth] : 'the recording does not say'}, was ${WORD[o.v] || o.v}, now ${WORD[x.v] || x.v}  ${kind}`);
    }
  }
  return { code: diff ? 1 : 0, lines: [`against ${file}: COACH / NOTE RUNNER TAKES ${diff} of ${n} replayed notes differ (${worse} worse by the recording, ${better} better, ${other} the recording cannot rank)${diff ? '  RED' : '  same'}`, ...first] };
}

/* For closed-loop.mjs's REAL TAKES section: the summaries in the repo through the loaded site, with the noise bar's numbers held fixed
   (LISTEN_BAR, measured with --noise). */
export async function realListen(at, log){
  const t0 = Date.now(), takes = loadListenSummaries(TAKES_DIR);
  const kinds = MODES.filter(([k]) => takes.some(t => t.kind === k)).map(([, n]) => n);
  log(`\nREAL TAKES · ${takes.length} Listening Coach and Note Runner take summaries (${kinds.join(', ') || 'none'}; tools/mic-sim/takes/: recorded students, no audio) · replayed through this site's coachLoop and nrLoop`);
  if (!takes.length){ log('  none yet: bring them in with node tools/mic-sim/takes-in.mjs'); return { takes: [], stale: [] }; }
  const stale = staleReasons(takes, baseSite(at));
  const cache = await replayAllListen(takes, at, [0], true);
  stale.push(...noGate(takes));
  const STALE2 = 'THE REAL TAKES CANNOT JUDGE THIS SITE: ' + stale.join('; ') + '. The numbers below are not this site\'s.';
  if (stale.length) log(STALE2);
  printListen(takes, [0], log);
  if (stale.length) log(STALE2);
  log(`  Noise (node tools/mic-sim/replay-listen.mjs --noise moves each take's clock offset 20 to 100 ms): read a difference between two sites as real only past it.`);
  log(`  ${takes.length} takes in ${((Date.now() - t0) / 1000).toFixed(1)} s (${cache.runs} replays run, ${cache.hits} read from tools/mic-sim/.replay-cache/)`);
  return { takes: listenJson(takes), stale };
}

/* --own-day: each take on the site of its own day (see the header). */
async function ownDay(takes, log){
  const { execFileSync } = await import('node:child_process'), { mkdtempSync, rmSync } = await import('node:fs'), { tmpdir } = await import('node:os');
  const repo = join(HERE, '..', '..'), tmp = mkdtempSync(join(tmpdir(), 'replay-listen-day-')), roots = {}, tot = {};
  try {
    for (const tk of takes){
      if (typeof tk.d.savedAt !== 'string'){ log(`   ${tk.take}: no savedAt, not replayed on its own day`); continue; }
      const c = execFileSync('git', ['rev-list', '-1', '--before=' + tk.d.savedAt, 'origin/main'], { cwd: repo, encoding: 'utf8' }).trim();
      if (!c){ log(`   ${tk.take}: no commit before it`); continue; }
      if (!roots[c]){ const dir = join(tmp, c.slice(0, 10)); execFileSync('mkdir', ['-p', dir]); execFileSync('sh', ['-c', `git archive ${c} | tar -x -C "${dir}"`], { cwd: repo }); roots[c] = dir; }
      const r = await replayOne(tk, { root: roots[c] }, 0);
      if (r.error){ log(`   ${tk.take}: ${r.error}`); continue; }
      let n = 0, same = 0;
      for (const nt of tk.notes){ const v = r.notes[nt.i]; if (!v) continue; n++; if (v.v === SAVED(tk, tk.d.expected[nt.i])) same++; }
      const T = tot[tk.kind] = tot[tk.kind] || { same: 0, n: 0, commits: new Set() };
      T.same += same; T.n += n; T.commits.add(c.slice(0, 7));
    }
  } finally { rmSync(tmp, { recursive: true, force: true }); }
  log(`\n--own-day: each take replayed on the site of the day it was saved (the replay's own error, no listening change in between):`);
  for (const [kind, name] of MODES) if (tot[kind]) log(`   ${name}: the replay gives the saved verdict on ${tot[kind].same} of ${tot[kind].n} notes (commits ${[...tot[kind].commits].join(', ')})`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]){
  const args = process.argv.slice(2), folder = args.find(a => !a.startsWith('--'));
  const opt = k => { const a = args.find(x => x.startsWith('--' + k + '=')); return a ? a.slice(k.length + 3) : null; };
  for (const a of args.filter(x => x.startsWith('--'))) if (!/^--(root|coach|json|against)=.+$/.test(a) && a !== '--noise' && a !== '--own-day'){ console.error('replay-listen: unknown argument ' + a); process.exit(2); }
  if (args.includes('--own-day') && !folder){ console.error('replay-listen: --own-day needs the folder of audio (a summary keeps no time of day)'); process.exit(2); }
  const at = opt('root') || opt('coach') ? { root: opt('root') ? resolve(opt('root')) : null, coach: opt('coach') ? resolve(opt('coach')) : null } : null;
  let was = null;
  if (opt('against')){ try { was = JSON.parse(readFileSync(opt('against'), 'utf8')); } catch (e){ console.error('replay-listen: cannot read ' + opt('against')); process.exit(2); } }
  (async () => {
    const t0 = Date.now();
    let takes, stale = [];
    if (folder){
      const a = loadListenAudio(folder); takes = a.takes;
      console.log(`${takes.length} Listening Coach / Note Runner takes of ${a.total} in the folder, from AUDIO · site ${at && at.root ? at.root : 'this checkout'}`);
    } else {
      takes = loadListenSummaries(TAKES_DIR);
      console.log(`${takes.length} Listening Coach / Note Runner take summaries (tools/mic-sim/takes/) · site ${at && at.root ? at.root : 'this checkout'}`);
      stale = staleReasons(takes, baseSite(at));
      if (stale.length) console.log('THE REAL TAKES CANNOT JUDGE THIS SITE: ' + stale.join('; '));
    }
    if (!takes.length) process.exit(1);
    const shifts = args.includes('--noise') ? [0, ...NOISE_SHIFTS] : [0];
    await replayAllListen(takes, at, shifts, !folder);
    const gateWhy = noGate(takes);
    if (gateWhy.length){ stale.push(...gateWhy); console.log('THE REAL TAKES CANNOT JUDGE THIS SITE: ' + gateWhy.join('; ')); }
    const report = printListen(takes, shifts, l => console.log(l));
    if (args.includes('--own-day')) await ownDay(takes, l => console.log(l));
    console.log(`\n${takes.length} takes, ${shifts.length} replay(s) each, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
    const json = { tool: 'replay-listen', from: folder ? 'audio' : 'summaries', takes: listenJson(takes), report };
    if (opt('json')) writeFileSync(opt('json'), JSON.stringify(json));
    if (was){ const c = compareListen(json.takes, was, opt('against'), stale); c.lines.forEach(l => console.log(l)); process.exit(c.code); }
  })().catch(e => { console.error('replay-listen: ' + (e && e.stack || e)); process.exit(2); });
}
