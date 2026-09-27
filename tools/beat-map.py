#!/usr/bin/env python3
"""Beat map for a live-band backing track — the `barTimes` list in
SNIPPET_TRACKS (app.js). See CLAUDE.md, "Live-band tracks carry a beat map".

  python3 tools/beat-map.py <rhythm-down.mp3> <rhythm-down-metronome.mp3> <bpm> <downbeat-click> [beatsPerBar]

  bpm             the FILE's tempo (the fast tier), e.g. 125
  downbeat-click  0-based index of the click that is beat 1 of bar 1.
                  Moises clicks every beat the same, so this is a musical
                  call: pick it from the chord changes, never assume 0.
  beatsPerBar     clicks per bar, default 4

Needs ffmpeg on PATH plus numpy and scipy. Measure the FAST file only — the
slow tier is derived by scaling (see snippetWindow in app.js).

How: the two mixes are one Moises export with and without the click, so
subtracting them leaves the click alone. A band-pass around the click
(900-2000 Hz) removes what little music survives the subtraction, and each
click is the first frame over 30% of the file's loud-click level, at least
0.6 of a beat after the last one. It prints the JS array to paste, plus the
sanity numbers 1ak will check.
"""
import json
import subprocess
import sys

import numpy as np
from scipy.signal import butter, sosfiltfilt

SR = 44100


def decode(path):
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-ac', '1', '-ar', str(SR),
                        '-f', 'f32le', '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32)


def clicks(plain, metro, bpm):
    a, b = decode(plain), decode(metro)
    n = min(len(a), len(b))
    d = sosfiltfilt(butter(4, [900, 2000], 'bandpass', fs=SR, output='sos'), b[:n] - a[:n])
    e = np.abs(d)
    hop = 32
    fr = e[:len(e) // hop * hop].reshape(-1, hop).max(1)
    thr = np.percentile(fr, 99.5) * 0.3
    beat = 60 / bpm
    out, last = [], -9.0
    for i, v in enumerate(fr):
        t = i * hop / SR
        if v > thr and t - last > 0.6 * beat:
            out.append(t)
            last = t
    return np.array(out)


def main():
    if len(sys.argv) < 5:
        sys.exit(__doc__)
    plain, metro, bpm, first = sys.argv[1], sys.argv[2], float(sys.argv[3]), int(sys.argv[4])
    per_bar = int(sys.argv[5]) if len(sys.argv) > 5 else 4
    t = clicks(plain, metro, bpm)
    g = np.diff(t)
    beat = 60 / bpm
    print(f'// {len(t)} clicks, gaps {g.min():.3f}-{g.max():.3f}s (nominal {beat:.3f}); '
          f'missed {int(np.sum(g > 1.5 * beat))}, doubled {int(np.sum(g < 0.7 * beat))}')
    bars = t[first::per_bar]
    bg = np.diff(bars)
    print(f'// {len(bars) - 1} whole bars, bar length {bg.min():.3f}-{bg.max():.3f}s '
          f'(nominal {per_bar * beat:.3f}); anchor = {bars[0]:.3f}')
    vals = [f'{v:.3f}' for v in bars]
    print('barTimes: [')
    for i in range(0, len(vals), 10):
        print('  ' + ', '.join(vals[i:i + 10]) + ',')
    print('],')


if __name__ == '__main__':
    main()
