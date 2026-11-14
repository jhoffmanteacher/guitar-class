#!/usr/bin/env python3
"""playalong-measure.py: the numbers a NEW play-along needs from ONE record (Jonathan's uploaded mp3), printed with
the evidence for each, so the judgment calls (which pulse is beat 1, how the room counts it) are made on numbers and
not on a guess. It writes nothing. Recipe: skill new-playalong.

  python3 tools/playalong-measure.py <record.mp3>
  python3 tools/playalong-measure.py <record.mp3> --pulses-per-bar 3 --meter 6/8 [--beat1 2]

WHAT IT PRINTS
 1. The file: length, sample rate, bitrate. TUNING: cents from A=440 (median of the strong spectral peaks).
    History: Arsenal Efectivo was 14 cents sharp and was shifted (rubberband, formants held); Ella (5), Vuelve a la
    Vida (6) and Perdon Mama (under 5) were left alone. Over 10 cents: shift it, both files, before levelling.
 2. THE TICK AND THE PULSE: the tick is the steadiest fast grid (a phase-coherence search over 40-500 a minute, then
    0.001 steps); the pulse is the tick / 1, 2 or 4, the fastest a room could count (260 or less), on the phase where
    the onsets land hardest. STEADY OR NOT: the tick's phase in 20-second windows. Within about 15 ms = a steady grid
    (one `anchor`, no `barTimes`; every uploaded record so far but Teen Spirit). Off only in the last window or two =
    a free-time ending (Vuelve a la Vida): still steady, end the card before it. Past 30 ms mid-song = the record
    drifts: STOP, it needs a beat map (see the skill).
    Tried on the four steady records on the site (2026-11-13): the anchor lands on the same pulse of the bar as the
    shipped one in 4 of 4, within 11 ms (Perdon Mama), 21 ms (Arsenal Efectivo), 7 ms (Vuelve a la Vida, whose bar 1
    is a quiet pickup, so the tool calls it bar 2) and 37 ms (Ella) of it.
 3. FIRST LOUD PULSE: the first pulse whose next second is at least a quarter of the song's median loudness. A record
    often starts with a quiet lead-in (Perdon Mama: two near-silent pulses; the first build anchored on them and
    every bar line sat a pulse early, review MAJOR 2026-11-10).
 4. METER EVIDENCE, per grouping of 2, 3, 4 and 6 pulses: how loud the low band (kick, bass) hits on each pulse of
    the group, and how much the harmony changes there (chroma before vs after). A strong pulse every N with the
    chords changing on it says a bar is N pulses. This is EVIDENCE, not a verdict: the meter is a musical call
    (Perdon Mama read as 4/4 at first; the accents said strong every 6 pulses of 230 a minute, Jonathan chose 6/8).
 5. With --pulses-per-bar N (and --meter 4/4 | 3/4 | 6/8): which pulse of the N the chords change on (beat 1; or
    --beat1 K to take pulse K of the group), the anchor = the first loud pulse that is a beat 1, and the
    SNIPPET_TRACKS numbers to paste (feltBpm, beatsPerBar, countSix, anchor, durationSec, the slow tier), plus a
    per-bar loudness strip (low / voice band), eight bars to a row, to read the song map off. Sections are a
    judgment: this tool does not draw them.

Reuses the decoder, onset envelopes and chroma of tools/beat-audit.py (imported, not copied). Needs ffmpeg and numpy.
It does NOT check a map against the record once the card exists: that is tools/beat-audit.py --only <slug>.
"""
import argparse
import importlib.util
import json
import math
import os
import subprocess
import sys

import numpy as np

HERE = os.path.dirname(os.path.abspath(__file__))
_spec = importlib.util.spec_from_file_location('beat_audit', os.path.join(HERE, 'beat-audit.py'))
BA = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(BA)
SR, HOP, FPS = BA.SR, BA.HOP, BA.FPS


def probe(path):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration,bit_rate:stream=sample_rate,channels',
                        '-of', 'json', path], capture_output=True, text=True)
    j = json.loads(r.stdout or '{}')
    st = (j.get('streams') or [{}])[0]
    fm = j.get('format') or {}
    return float(fm.get('duration', 0)), int(st.get('sample_rate', 0)), int(fm.get('bit_rate', 0)), int(st.get('channels', 0))


def tuning_cents(x):
    """Median deviation (cents) of strong spectral peaks from the nearest equal-tempered pitch at A=440."""
    nfft, hop = 16384, 8192
    win = np.hanning(nfft)
    f = np.fft.rfftfreq(nfft, 1.0 / SR)
    sel = (f > 100) & (f < 2000)
    devs, wts = [], []
    for s in range(0, len(x) - nfft, hop):
        X = np.abs(np.fft.rfft(x[s:s + nfft] * win))
        m = X[sel]
        fs = f[sel]
        thr = np.percentile(m, 99.5)
        pk = np.where((m[1:-1] > m[:-2]) & (m[1:-1] >= m[2:]) & (m[1:-1] > thr))[0] + 1
        for i in pk:
            a, b, c = np.log(m[i - 1] + 1e-12), np.log(m[i] + 1e-12), np.log(m[i + 1] + 1e-12)
            d = 0.5 * (a - c) / (a - 2 * b + c) if (a - 2 * b + c) != 0 else 0.0
            fr = fs[i] + d * (fs[1] - fs[0])
            p = 69 + 12 * math.log2(fr / 440.0)
            devs.append(100 * (p - round(p)))
            wts.append(m[i])
    if not devs:
        return None, 0
    d = np.array(devs)
    # circular median-ish: the mode of a 1-cent histogram, refined by the mean around it
    h, e = np.histogram(d, bins=100, range=(-50, 50), weights=np.array(wts))
    k = int(np.argmax(np.convolve(h, np.ones(5), 'same')))
    c0 = (e[k] + e[k + 1]) / 2
    near = np.abs(d - c0) < 15
    return float(np.average(d[near], weights=np.array(wts)[near])), int(near.sum())


def coherence(env, t, bpm):
    """Phase coherence of the onset energy on a grid of 60/bpm s: (R in 0..1, phase in s)."""
    P = 60.0 / bpm
    ang = 2 * np.pi * (t / P)
    z = np.sum(env * np.exp(1j * ang))
    R = abs(z) / (np.sum(env) + 1e-12)
    ph = (np.angle(z) / (2 * np.pi)) % 1.0 * P
    return R, ph


def find_pulse(env, low):
    """The tick: the steadiest fast periodicity (40-500 a minute; on a decimated envelope first, then 0.001 steps at
    full rate). The pulse: the tick divided by 1, 2 or 4, the fastest that a room could count (260 or less), on the
    one of its phases where the onsets (all bands plus the low band) land hardest."""
    dec = 4
    n4 = len(env) // dec * dec
    e4 = env[:n4].reshape(-1, dec).sum(1)
    t4 = (np.arange(len(e4)) * dec + (dec - 1) / 2) / FPS
    grid = np.arange(40.0, 500.0, 0.05)
    Rs = np.zeros(len(grid))
    for i0 in range(0, len(grid), 128):
        g = grid[i0:i0 + 128]
        z = np.exp(1j * 2 * np.pi * np.outer(g / 60.0, t4)) @ e4
        Rs[i0:i0 + 128] = np.abs(z) / (e4.sum() + 1e-12)
    b0 = grid[int(np.argmax(Rs))]
    t = np.arange(len(env)) / FPS
    best = (0, b0, 0)
    for bb in np.arange(b0 - 0.1, b0 + 0.1, 0.001):
        R, ph = coherence(env, t, bb)
        if R > best[0]:
            best = (R, bb, ph)
    R, tick, tph = best
    d = next(d for d in (1, 2, 4, 8) if tick / d <= 260)
    bpm = tick / d
    P = 60.0 / bpm
    cands = [(tph + k * 60.0 / tick) % P for k in range(d)]
    score = [float(np.sum(BA.interp_env(env + low, ph + np.arange(int((t[-1] - ph) / P)) * P))) for ph in cands]
    ph = cands[int(np.argmax(score))]
    return tick, tph, R, bpm, ph, d


def phase_track(env, bpm, ph0, win=20.0):
    t = np.arange(len(env)) / FPS
    P = 60.0 / bpm
    out = []
    for s in np.arange(0, t[-1] - win / 2, win):
        m = (t >= s) & (t < s + win)
        e = env[m]
        if e.sum() < 0.02 * env.sum() * win / t[-1]:
            out.append((s, None))
            continue
        _, ph = coherence(e, t[m], bpm)
        d = (ph - ph0 + P / 2) % P - P / 2
        out.append((s, d))
    return out


def rms_per(x, times, span):
    out = []
    for t0 in times:
        a, b = int(max(0, t0) * SR), int(max(0, t0 + span) * SR)
        seg = x[a:b]
        out.append(float(np.sqrt(np.mean(seg * seg))) if len(seg) else 0.0)
    return np.array(out)


def main(argv):
    ap = argparse.ArgumentParser()
    ap.add_argument('mp3')
    ap.add_argument('--pulses-per-bar', type=int)
    ap.add_argument('--meter', choices=['4/4', '3/4', '6/8'])
    ap.add_argument('--beat1', type=int, help='which pulse of the bar (0-based) is beat 1, overriding the chords')
    ap.add_argument('--slow-ratio', type=float, default=1.2, help='record tempo / slow tier (history: 1.17 to 1.225)')
    a = ap.parse_args(argv)
    dur, rate, br, ch = probe(a.mp3)
    print(f'FILE  {os.path.basename(a.mp3)}: {dur:.3f} s, {rate} Hz, {ch} ch, {br // 1000} kb/s')
    x = BA.decode(a.mp3)
    cents, n = tuning_cents(x)
    if cents is None:
        print('TUNING  could not read')
    else:
        act = 'SHIFT it to 440 (both files, before levelling)' if abs(cents) > 10 else 'leave it (10 cents or less)'
        print(f'TUNING  {cents:+.1f} cents from A=440 ({n} peaks): {act}')
    E = BA.onset_envelopes(x)
    env = E['all']
    tick, tph, R, bpm, ph, d = find_pulse(env, E['low'])
    ph = (ph - BA.ONSET_BIAS) % (60.0 / bpm)   # the detector reports a hit about 9 ms late (beat-audit's ONSET_BIAS)
    P = 60.0 / bpm
    print(f'TICK   {tick:.3f} a minute (the steadiest fast grid, coherence {R:.3f})')
    print(f'PULSE  {bpm:.3f} a minute ({P:.5f} s) = the tick / {d}; first pulse at {ph:.3f} s')
    tr = phase_track(env, tick, tph)
    ds = [d for _, d in tr if d is not None]
    worst = max((abs(d) for d in ds), default=0.0)
    print('STEADY  phase per 20 s window (ms): ' + ' '.join('--' if d is None else f'{d * 1000:+.0f}' for _, d in tr))
    bad = [s for s, d in tr if d is not None and abs(d) > 0.030]
    if worst <= 0.015:
        print(f'        within {worst * 1000:.0f} ms: a STEADY grid (one anchor, no barTimes)')
    elif worst <= 0.030:
        print(f'        within {worst * 1000:.0f} ms: steady enough, but say so in the track comment')
    elif all(d is None or abs(d) <= 0.030 for s, d in tr if s < bad[0]) and all(s >= bad[0] for s in bad) and len(bad) <= 2 \
            and bad[0] >= 0.75 * tr[-1][0]:
        print(f'        steady until about {bad[0]:.0f} s, then {worst * 1000:.0f} ms off: a free-time ENDING (Vuelve a la Vida). '
              'Steady grid; end the card before it')
    else:
        print(f'        {worst * 1000:.0f} ms off at worst, mid-song: the record DRIFTS. STOP: it needs a beat map (skill new-playalong)')
    npulse = int((dur - ph) / P) + 1
    pt = ph + np.arange(npulse) * P
    loud = rms_per(x, pt, P)
    med = np.median(loud[loud > 0]) if np.any(loud > 0) else 0
    first_loud = int(np.argmax(loud >= 0.25 * med)) if med > 0 else 0
    print(f'FIRST LOUD PULSE  pulse {first_loud} at {pt[first_loud]:.3f} s (pulses before it: '
          + (' '.join(f'{v / med:.2f}' for v in loud[:first_loud]) or 'none') + ' of the median)')
    lowmax = np.array([np.max(E['low'][max(0, int((t - 0.03) * FPS)):max(1, int((t + 0.03) * FPS) + 1)]) for t in pt])
    chm = BA.chroma_frames(x, 4096, 1024, 80.0, 2000.0)
    ft = (np.arange(len(chm)) * 1024 + 2048) / SR
    cs = np.vstack([np.zeros((1, 12)), np.cumsum(chm, 0)])

    def mean_ch(t0, t1):
        i0 = np.clip(np.searchsorted(ft, t0), 0, len(chm) - 1)
        i1 = np.clip(np.searchsorted(ft, t1), 0, len(chm))
        i1 = np.maximum(i1, i0 + 1)
        return (cs[i1] - cs[i0]) / (i1 - i0)[:, None]

    def novelty(W):
        A = mean_ch(pt - W, pt)
        B = mean_ch(pt, pt + W)
        return 1.0 - (A * B).sum(1) / (np.linalg.norm(A, axis=1) * np.linalg.norm(B, axis=1) + 1e-12)
    W0 = P * max(1, round(0.5 / P))      # about half a second either side
    nov = novelty(W0)
    idx = np.arange(npulse)
    use = idx >= first_loud

    def profile(v, k):
        p = np.array([v[use & (idx % k == j)].mean() for j in range(k)])
        return p / p.mean()
    print('METER EVIDENCE (pulses from the first loud one; low = kick/bass hit, chg = harmony change; 1.00 = the group mean)')
    for k in (2, 3, 4, 6, 8):
        lo, cg = profile(lowmax, k), profile(nov, k)
        print(f'  every {k}: low ' + ' '.join(f'{v:.2f}' for v in lo) + '   chg ' + ' '.join(f'{v:.2f}' for v in cg)
              + f'   (strongest: low {int(np.argmax(lo))}, chg {int(np.argmax(cg))}; spread {lo.max() - lo.min():.2f} / {cg.max() - cg.min():.2f})')
    if not a.pulses_per_bar:
        print('\nNEXT  pick the bar (pulses per bar) and the meter from the evidence, then run again with --pulses-per-bar N --meter M')
        return 0
    N = a.pulses_per_bar
    bar = N * P
    meter = a.meter or {3: '3/4', 4: '4/4', 6: '6/8'}.get(N, '4/4')
    bpb = 2 if meter == '6/8' else int(meter[0])
    cg = profile(novelty(bar / bpb), N)     # one counted beat either side, as beat-audit's BEAT 1 judgment
    lo = profile(lowmax, N)
    order = np.argsort(-cg)
    j1 = a.beat1 if a.beat1 is not None else int(order[0])
    k = first_loud
    while k % N != j1:
        k += 1
    anchor = pt[k]
    felt = bpb * 60.0 / bar
    file_bpm = round(bpm) if bpm <= 160 else round(bpm / 2)
    slow = round(file_bpm / a.slow_ratio)
    print(f'\nBAR  {N} pulses = {bar:.4f} s, {meter}, {bpb} counted beats')
    print('  chords change (one counted beat either side): ' + ' '.join(f'{j}:{v:.2f}' for j, v in enumerate(cg))
          + '   low hits: ' + ' '.join(f'{j}:{v:.2f}' for j, v in enumerate(lo)))
    if a.beat1 is not None:
        print(f'  beat 1 = pulse {j1} of the bar (--beat1)')
    else:
        margin = cg[order[0]] / max(cg[order[1]], 1e-9) - 1
        print(f'  beat 1 = pulse {j1} of the bar, where the chords change most ({margin * 100:.0f}% over pulse {int(order[1])})'
              + ('  CLOSE: check it against the chart (which chord starts the loop) and by ear; --beat1 picks the other' if margin < 0.15 else ''))
    print(f'ANCHOR  {anchor:.3f} s (pulse {k}, the first loud beat 1)')
    nbars = int((dur - anchor) / bar)
    print(f'BARS  {nbars} whole bars from the anchor to the end of the file (bar {nbars} ends at {anchor + nbars * bar:.2f} s of {dur:.2f})')
    print('\nSNIPPET_TRACKS numbers (tools/new-playalong.mjs takes them as --bpm --slow-bpm --felt --beats --anchor --duration):')
    print(f'    trackBpm: {file_bpm}, trackBpmSlow: {slow},    // the file names; slow file = rubberband tempo={slow}/{file_bpm}, pitch held')
    print(f'    feltBpm: {felt:.4f},   // {meter}: {bpb} counted beats a bar of {bar:.4f} s')
    print(f'    beatsPerBar: {bpb},' + ('   countSix: true,' if meter == '6/8' else ''))
    print(f'    durationSec: {int(dur)},')
    print(f'    anchor: {anchor:.3f},')
    if abs(bpm - round(bpm)) > 0.05:
        print(f'  NOTE the pulse is {bpm:.3f}, not a whole number: feltBpm uses the measured value; the file names round it')
    # song-map strip
    bt = anchor + np.arange(nbars) * bar
    nn = 1 << int(np.ceil(np.log2(len(x))))
    voice = BA.band_signal(np.fft.rfft(x, nn), nn, 300.0, 3000.0)[:len(x)]
    vo_b = rms_per(voice, bt, bar)
    vmed = np.median(vo_b) or 1.0
    print('\nSONG MAP STRIP: voice-band loudness per bar (1.0 = the song median; singing usually reads 1.1+, the band alone lower).')
    print('  Sections are a judgment: read the strip with your ears (?snipcal=1) and the chart.')
    for r0 in range(0, nbars, 8):
        print(f'  bars {r0 + 1:3d}-{min(nbars, r0 + 8):3d}: ' + ' '.join(f'{v / vmed:4.2f}' for v in vo_b[r0:r0 + 8]))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
