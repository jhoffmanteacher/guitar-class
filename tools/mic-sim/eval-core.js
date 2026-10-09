/* Mic-recording evaluator — the analysis, shared by two runners:
     eval-takes.mjs           Node, on downloaded WAV + JSON pairs (or a bundle)
     eval-snippet (built)     pasted into the browser on the teacher console,
                              where it reads micTakes straight from Firestore
   Plain script, no imports: the runners inline it. `deps` carries what comes
   from the site itself, so both runners judge with the SAME code the site
   listens with:
     deps.detectPitch  coachDetectPitch, extracted from coach.js
     deps.GATE         COACH_PITCH_GATE   (RMS floor for a pitch reading)
     deps.GAIN         COACH_MIC_GAIN     (the fixed boost before the gate)

   What one take tells us (micTakes/<uid>-<coach|nr>, see coach.js micRec*):
   the RAW mic from the count-in to the end, 24 kHz 16-bit mono, plus every
   expected note (time + verdict the site gave) and every event the site
   heard. Times in the JSON are performance.now() made relative to the
   recording's start; event times are "played" = arrival - micLatencyMs.

   The four count-in beeps (660, 660, 660, 990 Hz, 80 ms, through the
   Chromebook's own speaker) are in the recording. A student who plays on
   the click they HEAR lands in the recording exactly where the click
   landed, because both went speaker/guitar -> air -> mic. So the clicks
   give, per device:
     clickLagMs  where the clicks landed vs when they were scheduled
     mapMs       site's clock vs the recording's, measured on the notes the
                 site detected (it also folds in the detector's own delay)
     idealMs     the micLatencyMs that would make an on-click note score
                 dead on the beat   = clickLagMs + mapMs
     skewMs      what the site actually did to an on-click note
                 (+ = called it late) = idealMs - micLatencyMs
   And per expected note: the audio is replayed through the site's own
   filters + gate + YIN, so a note the site missed can be split into
   "the note is clearly in the audio" (a detector problem) and "it isn't"
   (the student didn't play it, or the mic didn't pick it up). */

function micEvalTake(pcm, R, d, deps){
  const N = pcm.length;
  const x = new Float32Array(N);
  for (let i = 0; i < N; i++) x[i] = pcm[i] / 32768;
  const ms2s = ms => Math.round(ms / 1000 * R);
  const s2ms = s => s / R * 1000;
  const dB = v => 20 * Math.log10(Math.max(v, 1e-9));
  const r1 = v => v == null || !isFinite(v) ? null : Math.round(v * 10) / 10;
  const pct = (a, q) => { if (!a.length) return null; const b = Array.from(a).sort((p, q2) => p - q2); return b[Math.min(b.length - 1, Math.floor(q * b.length))]; };
  const med = a => pct(a, 0.5);
  const lat = Number(d.micLatencyMs) || 0;
  const beat = Number(d.beatMs) || (d.bpm ? 60000 / d.bpm : 0);
  const expected = Array.isArray(d.expected) ? d.expected : [];
  const events = Array.isArray(d.events) ? d.events : [];

  /* ── levels: 20 ms RMS every 5 ms ── */
  const HOP = ms2s(5), WL = ms2s(20);
  const nH = Math.max(0, Math.floor((N - WL) / HOP));
  const env = new Float32Array(nH), hf = new Float32Array(nH);
  let mean = 0, peak = 0, clip = 0;
  for (let i = 0; i < N; i++){ const v = x[i]; mean += v; const a = Math.abs(v); if (a > peak) peak = a; if (a >= 0.999) clip++; }
  mean /= N || 1;
  for (let h = 0; h < nH; h++){
    let s = 0, ds = 0;
    const a = h * HOP;
    for (let i = a; i < a + WL; i++){ const v = x[i] - mean; s += v * v; if (i){ const dd = x[i] - x[i - 1]; ds += dd * dd; } }
    env[h] = Math.sqrt(s / WL); hf[h] = Math.sqrt(ds / WL);
  }
  const envDb = Array.from(env, dB);
  const level = {
    floorDb: r1(pct(envDb, 0.10)), medianDb: r1(pct(envDb, 0.5)), loudDb: r1(pct(envDb, 0.99)),
    peakDb: r1(dB(peak)), clipPct: r1(100 * clip / (N || 1)), dcOffset: Math.round(mean * 1e4) / 1e4,
    // how far the loud bits clear the site's pitch gate after its fixed gain
    gateHeadroomDb: r1(pct(envDb, 0.99) - dB(deps.GATE / deps.GAIN)),
    floorGateDb: r1(pct(envDb, 0.10) - dB(deps.GATE / deps.GAIN))
  };

  /* ── onsets: jumps in the first-difference level (a pick attack is broadband) ── */
  const hfFloor = pct(hf, 0.2) || 1e-6;
  const onsets = [];
  let base = hf[0] || 0, lastOn = -1e9;
  for (let h = 1; h < nH; h++){
    const v = hf[h];
    if (v > base * 2.2 && v > hfFloor * 4 && (h - lastOn) * 5 > 70){
      // the window is 20 ms wide: find the first 1 ms inside it where the jump starts
      const ref = Math.max(base, hfFloor), a = h * HOP, m1 = ms2s(1);
      let at = a + WL - m1;
      for (let s = a; s + m1 <= a + WL; s += m1){
        let ds = 0; for (let i = Math.max(1, s); i < s + m1; i++){ const dd = x[i] - x[i - 1]; ds += dd * dd; }
        if (Math.sqrt(ds / m1) > ref * 3){ at = s; break; }
      }
      onsets.push({ ms: s2ms(at), str: v / ref }); lastOn = h;
    }
    base += (v - base) * 0.12;
  }

  /* ── count-in clicks ── */
  function tone(f, centreS, halfS){
    // sinusoid amplitude at f over [centre-half, centre+half] (Goertzel)
    const a = Math.max(0, centreS - halfS), b = Math.min(N, centreS + halfS);
    if (b - a < 16) return 0;
    const w = 2 * Math.PI * f / R, c = 2 * Math.cos(w);
    let s1 = 0, s2 = 0;
    for (let i = a; i < b; i++){ const s0 = x[i] + c * s1 - s2; s2 = s1; s1 = s0; }
    const re = s1 - s2 * Math.cos(w), im = s2 * Math.sin(w);
    return 2 * Math.sqrt(re * re + im * im) / (b - a);
  }
  const clicks = { found: false };
  if (beat > 0){
    const span = Math.min(N - ms2s(4 * beat), ms2s(Math.max(1500, (expected[0] && expected[0].t || 0) + 600)));
    const halfS = ms2s(20), stepS = ms2s(4);
    const sc = [];
    for (let c = 0; c < span; c += stepS){
      const k = [0, 1, 2].map(j => tone(660, c + ms2s(j * beat) + halfS, halfS));
      k.push(tone(990, c + ms2s(3 * beat) + halfS, halfS));
      sc.push({ c, v: k.reduce((p, q) => p + Math.min(q, 3 * Math.min(...k) + 1e-6), 0), k });
    }
    if (sc.length){
      const best = sc.reduce((p, q) => q.v > p.v ? q : p);
      const bg = med(sc.map(o => o.v)) || 1e-9;
      clicks.snrDb = r1(dB(best.v / bg));
      // every one of the four beeps must stand clear of its own tone's background
      const each = [0, 1, 2, 3].every(j => best.k[j] > 3 * (med(sc.map(o => o.k[j])) || 1e-9));
      // and for the Coach, whose schedule we know, land somewhere a speaker could put them
      const e0c = expected[0] && expected[0].t;
      const lagC = d.mode !== 'nr' && e0c != null ? s2ms(best.c) - (e0c - 4 * beat) : 0;
      if (best.v / bg > 4 && each && lagC > -100 && lagC < 600){
        // each click's onset: first 2 ms step where its tone passes half its own peak
        const ons = [0, 1, 2, 3].map(j => {
          const f = j === 3 ? 990 : 660, c0 = best.c + ms2s(j * beat);
          let pk = 0; const prof = [];
          for (let s = c0 - ms2s(60); s < c0 + ms2s(100); s += ms2s(2)){ const v = tone(f, s, ms2s(5)); prof.push([s, v]); if (v > pk) pk = v; }
          const hit = prof.find(p => p[1] >= pk * 0.5);
          return s2ms(hit ? hit[0] : c0) - j * beat;
        });
        const c0ms = med(ons);
        clicks.found = true;
        clicks.audioMs = r1(c0ms);
        clicks.jitterMs = r1(Math.max(...ons) - Math.min(...ons));
        clicks.ampDb = r1(dB(Math.max(...best.k)));
        // when the first click was scheduled, on the recording's clock
        const e0 = expected[0] && expected[0].t;
        if (e0 != null){
          if (d.mode === 'nr'){
            // Note Runner's first note can sit after beat 1: try each half beat
            let bestL = null;
            for (let j = 0; j <= 32; j++){
              const L = c0ms - (e0 - (4 + j / 2) * beat);
              if (bestL == null || Math.abs(L - 120) < Math.abs(bestL - 120)) bestL = L;
            }
            clicks.lagMs = r1(bestL);
          } else clicks.lagMs = r1(c0ms - (e0 - 4 * beat));
        }
      }
    }
  }

  /* ── the site's clock vs the recording's, from the events it heard ── */
  const nearOnset = (ms, win) => {
    let b = null;
    for (const o of onsets){ const dd = Math.abs(o.ms - ms); if (dd <= win && (!b || dd < Math.abs(b.ms - ms))) b = o; }
    return b;
  };
  const maps = [];
  events.forEach(ev => { if (ev.t == null) return; const o = nearOnset(ev.t + lat, 120); if (o) maps.push(ev.t + lat - o.ms); });
  const mapMs = maps.length >= 3 ? med(maps) : null;
  const latency = { settingMs: lat, clickFound: clicks.found, clickSnrDb: clicks.snrDb == null ? null : clicks.snrDb,
    clickAmpDb: clicks.ampDb == null ? null : clicks.ampDb, clickJitterMs: clicks.jitterMs == null ? null : clicks.jitterMs,
    clickLagMs: clicks.lagMs == null ? null : clicks.lagMs, mapMs: r1(mapMs), mapN: maps.length };
  if (clicks.lagMs != null && mapMs != null){
    latency.idealMs = r1(clicks.lagMs + mapMs);
    latency.skewMs = r1(clicks.lagMs + mapMs - lat);
  }

  /* ── replay each expected note through the site's filters + gate + YIN ── */
  // 2x up to 48 kHz (what the live analyser runs at), then gain + 70 Hz HP + 1500 Hz LP
  const R2 = R * 2, y = new Float32Array(N * 2);
  for (let i = 0; i < N; i++){ const a = x[i], b = i + 1 < N ? x[i + 1] : a; y[2 * i] = a; y[2 * i + 1] = (a + b) / 2; }
  function biquad(buf, type, f0, Q){
    const w = 2 * Math.PI * f0 / R2, al = Math.sin(w) / (2 * Q), cw = Math.cos(w);
    let b0, b1, b2;
    if (type === 'hp'){ b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; } else { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; }
    const a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < buf.length; i++){
      const v = buf[i], o = (b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      x2 = x1; x1 = v; y2 = y1; y1 = o; buf[i] = o;
    }
  }
  for (let i = 0; i < y.length; i++) y[i] *= deps.GAIN;
  biquad(y, 'hp', 70, 0.7); biquad(y, 'lp', 1500, 0.7);
  const FW = 2048;
  function readings(fromMs, toMs){
    const out = [];
    for (let t = fromMs; t <= toMs; t += 15){
      const end = Math.round((t + 42.7) / 1000 * R2);
      if (end > y.length || end - FW < 0) continue;
      let s = 0; for (let i = end - 1024; i < end; i++) s += y[i] * y[i];
      if (Math.sqrt(s / 1024) <= deps.GATE) continue;
      const f = deps.detectPitch(y, R2, 0.22, end);
      if (f > 0) out.push(69 + 12 * Math.log2(f / 440));
    }
    return out;
  }
  const VERD = { ok: 'right', oct: 'right', perfect: 'right', good: 'right', wrong: 'wrong', pitch: 'wrong', dim: 'unclear', miss: 'miss' };
  // where an on-the-click note lands in the recording
  const offs = clicks.lagMs != null ? clicks.lagMs : (mapMs != null ? lat - mapMs : lat);
  const floorDb = level.floorDb;
  const notes = [];
  expected.forEach((e, i) => {
    if (e.t == null) return;
    const want = e.t + offs;
    const half = Math.min(beat ? beat * 0.5 : 300, 400);
    let o = null;
    for (const on of onsets){ const dd = on.ms - want; if (dd >= -half && dd < half && (!o || Math.abs(dd) < Math.abs(o.ms - want))) o = on; }
    const at = o ? o.ms : want;
    let pk = 0; for (let h = Math.floor(at / 5); h < Math.floor((at + 150) / 5) && h < nH; h++) if (h >= 0 && env[h] > pk) pk = env[h];
    const rd = readings(at + 30, at + Math.min(beat ? beat * 0.9 : 500, 500));
    let site = VERD[e.verdict] || e.verdict || '?';
    if (site === 'wrong' && e.unclear) site = 'unclear';
    const chord = !!(e.chord || (e.midis && e.midis.length > 1 && d.coachMode === 'chords'));
    const rec = { i, site, played: !!o, onsetMs: o ? r1(o.ms - want) : null, snrDb: r1(dB(pk) - floorDb), n: rd.length };
    if (chord){
      const cls = (e.midis && e.midis.length ? e.midis : [e.midi, e.midi + 7]).filter(m => m != null).map(m => ((m % 12) + 12) % 12);
      const share = rd.length ? rd.filter(r => cls.indexOf(((Math.round(r) % 12) + 12) % 12) >= 0).length / rd.length : 0;
      rec.chord = true; rec.share = Math.round(share * 100) / 100;
      rec.replay = rd.length < 2 ? 'none' : share >= 0.2 ? 'present' : 'other';
    } else if (e.midi != null){
      const T = e.midi;
      const ex = rd.filter(r => Math.abs(r - T) <= 0.5), oc = rd.filter(r => Math.abs(r - T - 12) <= 0.5);
      rec.midi = T;
      rec.exact = rd.length ? Math.round(ex.length / rd.length * 100) / 100 : 0;
      rec.oct = rd.length ? Math.round(oc.length / rd.length * 100) / 100 : 0;
      const near = ex.map(r => r - T).concat(oc.map(r => r - T - 12));
      rec.cents = near.length ? Math.round(100 * med(near)) : null;
      rec.replay = rd.length < 2 ? 'none' : rec.exact + rec.oct >= 0.5 ? 'present' : rec.exact + rec.oct >= 0.2 ? 'mixed' : 'other';
      // low strings: fundamental vs 2nd harmonic, straight off the raw mic
      if (T < 52 && o && rd.length >= 2){
        const f0 = 440 * Math.pow(2, (T - 69) / 12), c = ms2s(at + 90);
        const h1 = tone(f0, c, ms2s(42)), h2 = tone(2 * f0, c, ms2s(42));
        rec.h1h2Db = r1(dB(h1) - dB(h2));
      }
    } else return;
    notes.push(rec);
  });

  const cnt = f => notes.filter(f).length;
  const strong = n => n.played && n.snrDb != null && n.snrDb >= 15;
  const lowNotes = notes.filter(n => n.h1h2Db != null);
  const extra = onsets.filter(on => !expected.some(e => e.t != null && Math.abs(e.t + offs - on.ms) < Math.max(150, (beat || 600) * 0.35))).length;
  const startMs = expected.length && expected[0].t != null ? expected[0].t + offs : 0;
  const playMs = Math.max(1, s2ms(N) - startMs);
  const summary = {
    n: notes.length,
    siteRight: cnt(n => n.site === 'right'), siteWrong: cnt(n => n.site === 'wrong'),
    siteUnclear: cnt(n => n.site === 'unclear'), siteMiss: cnt(n => n.site === 'miss'),
    replayPresent: cnt(n => n.replay === 'present'),
    // the site said not-right, but the note is clearly in the audio, loud
    detectorMissed: cnt(n => n.site !== 'right' && n.replay === 'present' && strong(n)),
    // the site said right, the replay can't find it
    siteRightReplayNot: cnt(n => n.site === 'right' && n.replay !== 'present'),
    // no new pick attack anywhere near the note: nothing was played there
    silentMiss: cnt(n => (n.site === 'miss' || n.site === 'unclear') && !n.played),
    octDominant: cnt(n => n.oct > n.exact && n.oct >= 0.3),
    medianSnrDb: r1(med(notes.filter(n => n.snrDb != null).map(n => n.snrDb))),
    medianCents: (() => { const c = notes.filter(n => n.cents != null).map(n => n.cents); return c.length ? med(c) : null; })(),
    medianAbsOnsetMs: r1(med(notes.filter(n => n.onsetMs != null).map(n => Math.abs(n.onsetMs)))),
    lowH1H2Db: r1(med(lowNotes.map(n => n.h1h2Db))), lowN: lowNotes.length
  };
  return {
    level, latency, notes: summary, perNote: notes,
    room: { extraOnsetsPerMin: Math.round(extra / playMs * 60000), onsets: onsets.length }
  };
}

// The device, from what the take recorded about itself.
function micEvalDevice(d){
  const ua = String(d.userAgent || '');
  const cros = ua.match(/CrOS \S+ ([\d.]+)/), chrome = ua.match(/Chrome\/(\d+)/);
  const os = cros ? 'ChromeOS ' + cros[1] : /Windows/.test(ua) ? 'Windows' : /iPad|iPhone/.test(ua) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /Linux/.test(ua) ? 'Linux' : '?';
  return { os, chromebook: !!cros, chrome: chrome ? +chrome[1] : null, micLabel: d.micLabel || '', srcRate: d.srcSampleRate || null };
}

/* One take -> one row: device + game + the analysis. No names, no uid —
   this row is what leaves the teacher's machine. */
function micEvalRow(label, d, pcm, deps){
  const a = micEvalTake(pcm, d.sampleRate || 24000, d, deps);
  return Object.assign({
    take: label, period: d.period || '', savedAt: d.savedAt || null,
    game: d.mode === 'nr' ? 'Note Runner L' + ((d.level | 0) + 1) + (d.chords ? ' chords' : '') : 'Coach ' + (d.coachMode || ''),
    bpm: d.bpm || null, durationSec: d.durationSec || null, lang: d.lang || '',
    device: micEvalDevice(d), frame: { meanMs: d.frameMeanMs == null ? null : d.frameMeanMs, maxMs: d.frameMaxMs == null ? null : d.frameMaxMs }
  }, a);
}

// A plain-text table of the rows, for the console / terminal.
function micEvalText(rows){
  const pad = (v, w) => { const s = v == null ? '-' : String(v); return s.length >= w ? s.slice(0, w) : s + ' '.repeat(w - s.length); };
  const cols = [['take', 5], ['per', 4], ['game', 16], ['os', 18], ['mic', 22], ['fps', 4], ['floor', 6], ['loud', 6], ['clip%', 5],
    ['click', 6], ['lag', 5], ['ideal', 6], ['skew', 5], ['right', 6], ['inAud', 6], ['detMiss', 7], ['silent', 6], ['oct', 4], ['snr', 5], ['cents', 5], ['h1h2', 5], ['xtra/m', 6]];
  const head = cols.map(c => pad(c[0], c[1])).join(' ');
  const lines = rows.map(r => [
    r.take, r.period, r.game, r.device.os, r.device.micLabel, r.frame.meanMs ? Math.round(1000 / r.frame.meanMs) : null,
    r.level.floorDb, r.level.loudDb, r.level.clipPct,
    r.latency.clickFound ? r.latency.clickSnrDb : 'none', r.latency.clickLagMs, r.latency.idealMs, r.latency.skewMs,
    r.notes.siteRight + '/' + r.notes.n, r.notes.replayPresent + '/' + r.notes.n, r.notes.detectorMissed, r.notes.silentMiss, r.notes.octDominant,
    r.notes.medianSnrDb, r.notes.medianCents, r.notes.lowH1H2Db, r.room.extraOnsetsPerMin
  ].map((v, k) => pad(v, cols[k][1])).join(' '));
  return [head].concat(lines).join('\n') + `

floor/loud  raw mic level, dBFS (10th / 99th percentile of 20 ms windows)
click       count-in beeps found in the recording: how far above the background (dB); "none" = speaker muted or headphones
lag         where the beeps landed vs when they were scheduled (ms)
ideal       the mic-delay setting that would score an on-the-click note dead on the beat (ms)
skew        what the site did to an on-the-click note with the student's actual setting (+ = called it late)
right       notes the site counted right / notes expected
inAud       notes the replay (site's own filters + YIN) finds clearly in the audio
detMiss     site said not-right, but the note is loud and clearly in the audio
silent      site said miss/unclear and there is no pick attack near the note either (not played)
oct         notes where the octave above outvoted the real note
snr         median note level above the room floor (dB)
cents       median tuning of the notes heard (cents off the written note)
h1h2        low-string notes: fundamental vs 2nd harmonic (dB; very negative = the mic loses the low end)
xtra/m      onsets per minute that are not near any expected note (other guitars, noise)`;
}

if (typeof module !== 'undefined') module.exports = { micEvalTake, micEvalRow, micEvalDevice, micEvalText };
