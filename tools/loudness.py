#!/usr/bin/env python3
"""Level one song's backing tracks to "the cure" — one gain for the whole
song. See the audio-and-snippets skill, "Backing tracks".

  python3 tools/loudness.py <song-slug> [--dry-run] [--source-ref <git-ref>] [--accept-spread]
  python3 tools/loudness.py --list-reference-files

  song-slug        the file-name prefix before `-backing-`, e.g.
                   guns-n-roses-sweet-child-o-mine
  --dry-run        do everything (measure, encode, verify, print the table)
                   but leave audio/ alone
  --source-ref REF encode from the bytes at that commit (git show
                   REF:audio/<file>) instead of the ones in audio/ — for a
                   song re-encoded once already since its export, so this
                   encode starts from the export, not from a copy of a copy
  --accept-spread  write the song even though a file OTHER than its level
                   file lands outside ±1 LU (see "one gain per song" below).
                   That is Jonathan's call: ask first, and never give the
                   file its own gain instead
  --list-reference-files
                   print, as JSON, the reference file and every song's level
                   file. checks.mjs (1br) reads this, so the choice of file
                   lives here and nowhere else

Needs ffmpeg on PATH plus numpy, like tools/beat-map.py (scipy not needed).

THE RULE (Jonathan, 2026-10-25): every backing track plays at the same
loudness as "the cure".
- The target is the integrated loudness (EBU R128, ffmpeg's ebur128) of
  audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-full.mp3, measured
  fresh on every run: about -12.5 LUFS. "the cure" itself is never
  re-levelled, and this tool refuses it.
- ONE GAIN PER SONG, worked out from the song's LEVEL FILE: its record-tempo
  full mix (the `full` file with the highest bpm), or its record-tempo
  `rhythm-down` mix when it has no full mix. A metronome mix is never the
  level file. When two files tie (Madrecita Querida's two keys), the one
  app.js names first wins. The same gain goes on EVERY file of the song —
  both tempos, full and rhythm-down, Let It Be's metronome mix, both keys —
  so the Guitar toggle, Slow and the key switch keep their balance. A
  rhythm-down mix is quieter than its full twin on purpose (the part is
  turned down; "the cure"'s own are 0.6 and 2.1 LU under it), so a file
  that lands outside ±1 LU is REPORTED, never given a gain of its own.
- Gain plus a peak limiter at -1 dBFS, and nothing else: no resample, no
  pitch change, no trim. Every file keeps its bitrate (CBR as it was, or VBR
  at the LAME quality nearest its old average), sample rate, channels and
  tags.

HOW
1. The limiter eats loudness on a dynamic mix, and so does the re-encode
   itself at 192k (LAME loses about 0.25 dB a generation there; at 320k,
   nothing measurable), so the gain is iterated: the level file is
   encoded, decoded and measured until it lands within ±0.1 LU of the
   target (±0.3 passes). Still one gain — every other file of the song
   gets the gain the level file ended on.
2. The -1 dBFS ceiling is checked on the DECODED FINAL mp3 (sample peak and
   true peak), because the limiter works on samples and the encoder
   overshoots what it let through. A file that overshoots is re-encoded
   with a lower ceiling — a ceiling, not a gain — and the table says so.
3. ⚠️ ffmpeg's alimiter has `level` ON by default: it normalises its output
   back up toward full scale and silently undoes the gain. It also delays
   the audio by its lookahead (5 ms) unless `latency` is on. LIMITER below
   sets both, and attack and release, explicitly. Never trust the filter
   chain: the verification is what counts.
4. Every file is verified against its source: loudness (level file ±0.3 LU,
   the rest ±1 LU), both peaks ≤ -1 dBFS, decoded length within 0.05 s, and
   the first 40 s cross-correlated (lag under 10 ms), so `anchor`,
   `barTimes` and the Journey pages' data-click-bars still line up.
5. Nothing reaches audio/ unless EVERY file of the song passed: the encodes
   are staged in a temp folder and moved in at the end. Exit 1 on any
   failure. A song already within ±0.3 LU is skipped (no re-encode, no
   generation loss), so running this twice is harmless.
"""
import concurrent.futures as cf
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / 'audio'
REFERENCE_SLUG = 'olivia-rodrigo-the-cure'
NAME_RE = re.compile(r'^(?P<slug>[a-z0-9-]+?)-backing-(?P<key>[A-G][a-z#]*)-(?P<bpm>\d+)bpm-'
                     r'(?P<hz>\d+)hz-(?P<mix>[a-z-]+)\.mp3$')

LEVEL_AIM = 0.1        # LU — where the gain iteration stops
LEVEL_PASS = 0.3       # LU — the level file must land this close
SPREAD_PASS = 1.0      # LU — every other file of the song
PEAK_MAX = -1.0        # dBFS, sample peak and true peak, on the decoded final mp3
LENGTH_PASS = 0.05     # s
LAG_PASS_MS = 10.0
XCORR_SECONDS = 40
# The limiter. level=disabled and latency=1 are the two that matter (see 3.
# above); attack and release are alimiter's own defaults, written out so a
# change of ffmpeg version cannot move them.
LIMITER = 'alimiter=level_in=1:level_out=1:limit={limit:.6f}:attack=5:release=50:asc=0:level=disabled:latency=1'


def parse_name(path):
    m = NAME_RE.match(Path(path).name)
    return m.groupdict() | {'bpm': int(m['bpm'])} if m else None


def songs():
    """slug -> sorted list of its backing-track paths in audio/."""
    out = {}
    for p in sorted(AUDIO.glob('*-backing-*.mp3')):
        n = parse_name(p)
        if n:
            out.setdefault(n['slug'], []).append(p)
    return out


def level_file(files):
    """The record-tempo full mix (else rhythm-down), ties to app.js order."""
    try:
        app = (ROOT / 'app.js').read_text(encoding='utf8')
    except OSError:
        app = ''
    for mix in ('full', 'rhythm-down'):
        cands = [p for p in files if parse_name(p)['mix'] == mix]
        if cands:
            top = max(parse_name(p)['bpm'] for p in cands)
            cands = [p for p in cands if parse_name(p)['bpm'] == top]
            pos = lambda p: (app.find(f"'audio/{p.name}'") % (len(app) + 1), p.name)  # -1 (absent) sorts last
            return min(cands, key=pos)
    return None


def reference_file():
    return level_file(songs().get(REFERENCE_SLUG, []))


def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    if r.returncode:
        raise RuntimeError(f'{cmd[0]} failed: {r.stderr.strip()[-400:]}')
    return r


def measure(path):
    """Integrated loudness (LUFS), sample peak and true peak (dBFS), length (s)
    of the decoded file — one decode. ebur128 prints its running values as
    frame metadata (3 decimals, where its summary gives 1); astats gives the
    exact sample peak and the sample count."""
    import math
    r = run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(path), '-af',
             'ebur128=metadata=1:peak=true+sample,'
             'astats=measure_perchannel=none:measure_overall=Peak_level+Number_of_samples,'
             'ametadata=mode=print:file=-', '-f', 'null', '-'])
    last = {}
    for line in r.stdout.splitlines():
        k, _, v = line.partition('=')
        if k.startswith('lavfi.r128.'):
            last[k[11:]] = float(v)
    peak = re.search(r'Overall.*?Peak level dB: (\S+)', r.stderr, re.S)
    nsamp = re.search(r'Overall.*?Number of samples: (\d+)', r.stderr, re.S)
    rate = re.search(r'Audio: [^,]*, (\d+) Hz', r.stderr)
    db = lambda lin: 20 * math.log10(lin) if lin > 0 else -math.inf
    return {'I': last['I'], 'tp': db(last['true_peak']),
            'sp': float(peak[1]) if peak else db(last['sample_peak']),
            'len': int(nsamp[1]) / int(rate[1])}


def loudness_only(path):
    r = run(['ffmpeg', '-hide_banner', '-nostats', '-v', 'error', '-i', str(path), '-af',
             'ebur128=metadata=1,ametadata=mode=print:key=lavfi.r128.I:file=-', '-f', 'null', '-'])
    return float(r.stdout.strip().splitlines()[-1].split('=')[1])


def mp3_params(path):
    """What the encode has to keep: rate, channels, joint stereo, and CBR
    bitrate or VBR average — read off the frame headers."""
    b = Path(path).read_bytes()
    i = 0
    if b[:3] == b'ID3':
        i = 10 + ((b[6] << 21) | (b[7] << 14) | (b[8] << 7) | b[9]) + (10 if b[5] & 0x10 else 0)
    br1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0]
    br2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160, 0]
    rates = {3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000]}
    seen, modes, first, nbytes, nframes, sr, spf = {}, set(), True, 0, 0, 0, 1152
    while i < len(b) - 4:
        if b[i] != 0xFF or (b[i + 1] & 0xE0) != 0xE0:
            i += 1
            continue
        v, layer = (b[i + 1] >> 3) & 3, (b[i + 1] >> 1) & 3
        bri, sri, pad, mode = (b[i + 2] >> 4) & 15, (b[i + 2] >> 2) & 3, (b[i + 2] >> 1) & 1, (b[i + 3] >> 6) & 3
        if layer != 1 or v == 1 or sri == 3 or bri in (0, 15):
            i += 1
            continue
        sr = rates[v][sri]
        br = (br1 if v == 3 else br2)[bri] * 1000
        spf = 1152 if v == 3 else 576
        n = spf // 8 * br // sr + pad
        side = (32 if mode != 3 else 17) if v == 3 else (17 if mode != 3 else 9)
        if first and b[i + 4 + side:i + 8 + side] in (b'Xing', b'Info'):
            first = False                     # the header frame: no audio in it
            i += n
            continue
        first = False
        seen[br // 1000] = seen.get(br // 1000, 0) + 1
        modes.add(mode)
        nbytes += n
        nframes += 1
        i += n
    if not nframes:
        raise RuntimeError(f'{path}: no mp3 frames found')
    chans = 1 if modes == {3} else 2
    secs = nframes * spf / sr
    return {'sr': sr, 'channels': chans, 'joint': 1 in modes,
            'cbr': len(seen) == 1, 'kbps': next(iter(seen)) if len(seen) == 1 else None,
            'avg_kbps': nbytes * 8 / secs / 1000}


def encode(src, dst, gain_db, ceiling_db, params, vbr_q=None):
    af = f'volume={gain_db:.3f}dB,' + LIMITER.format(limit=10 ** (ceiling_db / 20))
    rate = ['-b:a', f"{params['kbps']}k"] if params['cbr'] else ['-q:a', str(vbr_q)]
    run(['ffmpeg', '-hide_banner', '-v', 'error', '-y', '-i', str(src), '-map', '0:a:0',
         '-map_metadata', '0', '-af', af, '-c:a', 'libmp3lame', *rate,
         '-ar', str(params['sr']), '-ac', str(params['channels']),   # the source's own: never a resample
         '-joint_stereo', '1' if params['joint'] else '0', str(dst)])


def decode_mono(path, seconds):
    import numpy as np
    r = subprocess.run(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '1', '-t', str(seconds),
                        '-f', 'f32le', '-'], capture_output=True, check=True)
    return np.frombuffer(r.stdout, dtype=np.float32).astype(np.float64)


def alignment(src, new, rate):
    """Lag (ms, + = new is late) of `new` against `src` over the first 40 s,
    by FFT cross-correlation, plus what a pure gain would predict: the
    least-squares gain at that lag (dB) and how much of `new` it leaves
    unexplained (dB under `new`) — the limiter and the codec, nothing else."""
    import numpy as np
    a, b = decode_mono(src, XCORR_SECONDS), decode_mono(new, XCORR_SECONDS)
    n = min(len(a), len(b))
    a, b = a[:n], b[:n]
    size = 1 << (2 * n - 1).bit_length()
    c = np.fft.irfft(np.fft.rfft(b, size) * np.conj(np.fft.rfft(a, size)), size)
    m = int(0.5 * rate)
    win = np.concatenate([c[-m:], c[:m + 1]])
    k = int(np.argmax(win))
    lag = k - m
    if 0 < k < len(win) - 1:                  # parabolic, for sub-sample ms
        y0, y1, y2 = win[k - 1], win[k], win[k + 1]
        lag += 0.5 * (y0 - y2) / (y0 - 2 * y1 + y2)
    s = int(round(lag))
    x = np.roll(a, s)
    g = float(np.dot(x, b) / np.dot(x, x))
    resid = 10 * np.log10(np.sum((b - g * x) ** 2) / np.sum(b ** 2))
    return lag / rate * 1000, 20 * np.log10(abs(g)), resid


def pick_vbr_quality(src, tmp, gain_db, params):
    """A VBR file is re-encoded at the LAME quality whose average bitrate
    comes nearest the old file's."""
    best = None
    for q in range(0, 7):
        out = tmp / f'vbr-trial-{q}.mp3'
        encode(src, out, gain_db, PEAK_MAX, params, vbr_q=q)
        d = abs(mp3_params(out)['avg_kbps'] - params['avg_kbps'])
        if best is None or d < best[0]:
            best = (d, q)
        out.unlink()
    return best[1]


def encode_verified(src, dst, gain_db, params, vbr_q):
    """Encode at the song's gain with the HIGHEST ceiling (to 0.1 dB) whose
    decoded result has both peaks at or under -1 dBFS — the ceiling moves,
    never the gain.

    Not a simple step down by the overshoot: alimiter holds SAMPLE peaks, and
    on a clipped master the true peak sits up to ~1 dB above them BETWEEN
    samples, so lowering the ceiling does nothing to it until the ceiling
    drops below those samples (2026-10-25, Arsenal Efectivo: true peak -0.91
    at a -1 and at a -2 dB ceiling, -2.43 at -3). So: step down until it
    passes, then bisect back up."""
    tries = {}

    def attempt(c):
        out = dst.with_name(f'{dst.stem}.try{len(tries)}{dst.suffix}')
        encode(src, out, gain_db, c, params, vbr_q)
        m = measure(out)
        tries[c] = (out, m)
        return max(m['tp'], m['sp']) <= PEAK_MAX

    fail, ok = None, None
    c = PEAK_MAX
    while ok is None:
        if attempt(c):
            ok = c
        else:
            fail = c
            if c < PEAK_MAX - 12:
                break                         # give up; the caller's verify reports the peak
            c -= max(max(tries[c][1]['tp'], tries[c][1]['sp']) - PEAK_MAX, 0.5) + 0.1
    while ok is not None and fail is not None and fail - ok > 0.1:
        mid = round((ok + fail) / 2, 3)
        if attempt(mid):
            ok = mid
        else:
            fail = mid
    best = ok if ok is not None else min(tries)
    os.replace(tries[best][0], dst)
    for c, (out, _) in tries.items():
        if c != best:
            out.unlink(missing_ok=True)
    return tries[best][1], best


def fmt_table(rows):
    head = ('| file | before LUFS | after LUFS | Δ target | sample pk | true pk | ceiling | '
            'limiter | length before → after (s) | lag ms | gain fit | residual | result |')
    out = [head, '|' + '---|' * (head.count('|') - 1)]
    for r in rows:
        out.append('| {name}{star} | {bI:.2f} | {aI:.2f} | {dI:+.2f} | {sp:.2f} | {tp:.2f} | {c:.2f} | '
                   '{lim:.1f} dB | {bl:.3f} → {al:.3f} ({dl:+.3f}) | {lag:+.2f} | {fit:+.2f} dB | '
                   '{res:.0f} dB | {verdict} |'.format(**r))
    return '\n'.join(out)


def main(argv):
    args = argv[1:]
    if '--list-reference-files' in args:
        all_songs = songs()
        ref = reference_file()
        print(json.dumps({
            'reference': ref.relative_to(ROOT).as_posix() if ref else None,
            'songs': {s: level_file(f).relative_to(ROOT).as_posix()
                      for s, f in all_songs.items() if s != REFERENCE_SLUG and level_file(f)},
        }, indent=1))
        return 0
    dry = '--dry-run' in args
    accept_spread = '--accept-spread' in args
    source_ref = None
    if '--source-ref' in args:
        i = args.index('--source-ref')
        if i + 1 >= len(args):
            sys.exit('--source-ref needs a git ref, e.g. --source-ref 194696b')
        source_ref = args[i + 1]
        del args[i:i + 2]
    rest = [a for a in args if not a.startswith('--')]
    if len(rest) != 1 or len(rest) != len(args) - dry - accept_spread:
        sys.exit(__doc__)
    slug = rest[0]
    if slug == REFERENCE_SLUG:
        print(f'{slug} is the reference — every other song is levelled TO it. '
              'It is never re-levelled (Jonathan, 2026-10-25).', file=sys.stderr)
        return 2
    files = songs().get(slug)
    if not files:
        print(f'no audio/{slug}-backing-*.mp3 files. Songs: {", ".join(sorted(songs()))}', file=sys.stderr)
        return 2
    ref = reference_file()
    if not ref:
        print('cannot find "the cure"\'s record-tempo full mix in audio/', file=sys.stderr)
        return 2
    lvl = level_file(files)
    if not lvl:
        print(f'{slug} has no full or rhythm-down mix to take its level from', file=sys.stderr)
        return 2

    target = loudness_only(ref)
    now = loudness_only(lvl)
    print(f'target  {target:.2f} LUFS  ({ref.name})')
    print(f'song    {slug}: {len(files)} files, level file {lvl.name} at {now:.2f} LUFS now')
    if abs(now - target) <= LEVEL_PASS:
        print(f'already within ±{LEVEL_PASS} LU of the target ({now - target:+.2f}) — skipped, nothing re-encoded')
        return 0

    tmp = Path(tempfile.mkdtemp(prefix='loudness-'))
    try:
        # The sources: audio/ as it is, or the bytes at --source-ref.
        src = {}
        for p in files:
            if source_ref:
                s = tmp / f'src-{p.name}'
                r = subprocess.run(['git', '-C', str(ROOT), 'show', f'{source_ref}:audio/{p.name}'],
                                   capture_output=True)
                if r.returncode:
                    print(f'{p.name} is not in {source_ref}: {r.stderr.decode().strip()}', file=sys.stderr)
                    return 1
                s.write_bytes(r.stdout)
                src[p] = s
            else:
                src[p] = p
        if source_ref:
            print(f'sources {source_ref}:audio/ (not the files in audio/ now)')
        params = {p: mp3_params(src[p]) for p in files}
        with cf.ThreadPoolExecutor(max_workers=min(4, len(files))) as ex:
            before = dict(zip(files, ex.map(lambda p: measure(src[p]), files)))
        gain = target - before[lvl]['I']
        vbr = {p: pick_vbr_quality(src[p], tmp, gain, params[p]) for p in files if not params[p]['cbr']}

        # 1. the level file: iterate the ONE gain until it lands on the target.
        out = {p: tmp / p.name for p in files}
        after, ceil = {}, {}
        for _ in range(8):
            after[lvl], ceil[lvl] = encode_verified(src[lvl], out[lvl], gain, params[lvl], vbr.get(lvl))
            miss = target - after[lvl]['I']
            print(f'  level file at {gain:+.2f} dB: {after[lvl]["I"]:.2f} LUFS, ceiling {ceil[lvl]:.2f}',
                  file=sys.stderr, flush=True)
            if abs(miss) <= LEVEL_AIM:
                break
            gain += miss
        print(f'gain    {gain:+.2f} dB on every file (first estimate {target - before[lvl]["I"]:+.2f}; '
              f'the limiter and the re-encode took {before[lvl]["I"] + gain - after[lvl]["I"]:.2f} LU off the level file)')

        # 2. every other file: the same gain, its own ceiling only if it overshoots.
        others = [p for p in files if p != lvl]
        with cf.ThreadPoolExecutor(max_workers=max(1, min(4, len(others)))) as ex:
            for p, (m, c) in zip(others, ex.map(
                    lambda p: encode_verified(src[p], out[p], gain, params[p], vbr.get(p)), others)):
                after[p], ceil[p] = m, c

        # 3. verify.
        rows, failed, spread = [], [], []
        for p in files:
            b, a = before[p], after[p]
            rate = params[p]['sr']
            lag, fit, resid = alignment(src[p], out[p], rate)
            dur_b = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(src[p])]).stdout)
            dur_a = float(run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(out[p])]).stdout)
            np_ = mp3_params(out[p])
            why = []
            d = a['I'] - target
            if p == lvl and abs(d) > LEVEL_PASS:
                why.append(f'level file {d:+.2f} LU off')
            if p != lvl and abs(d) > SPREAD_PASS:
                spread.append((p, d))
                if not accept_spread:
                    why.append(f'{d:+.2f} LU (outside ±{SPREAD_PASS})')
            if a['sp'] > PEAK_MAX or a['tp'] > PEAK_MAX:
                why.append(f'peak {max(a["sp"], a["tp"]):.2f}')
            if abs(a['len'] - b['len']) > LENGTH_PASS or abs(dur_a - dur_b) > LENGTH_PASS:
                why.append(f'length {a["len"] - b["len"]:+.3f} s (probe {dur_a - dur_b:+.3f})')
            if abs(lag) >= LAG_PASS_MS:
                why.append(f'lag {lag:+.1f} ms')
            if (np_['sr'], np_['channels'], np_['cbr'], np_['kbps']) != \
               (params[p]['sr'], params[p]['channels'], params[p]['cbr'], params[p]['kbps']):
                why.append(f'codec params changed: {params[p]} -> {np_}')
            if why:
                failed.append((p, why))
            rows.append({'name': p.name, 'star': ' (level)' if p == lvl else '',
                         'bI': b['I'], 'aI': a['I'], 'dI': d, 'sp': a['sp'], 'tp': a['tp'], 'c': ceil[p],
                         'lim': max(0.0, b['sp'] + gain - ceil[p]),
                         'bl': b['len'], 'al': a['len'], 'dl': a['len'] - b['len'], 'lag': lag,
                         'fit': fit - gain, 'res': resid,
                         'verdict': 'FAIL: ' + '; '.join(why) if why else
                                    ('ok, OUT ±1 LU' if abs(d) > SPREAD_PASS else 'ok')})
        print()
        print(fmt_table(rows))
        print()
        print('limiter = how far the gained signal\'s sample peak sat over the ceiling; '
              'gain fit = least-squares gain at the lag, minus the song gain; '
              'residual = what a pure gain does not explain.')
        for p in files:
            if not params[p]['cbr']:
                print(f'{p.name}: VBR, avg {params[p]["avg_kbps"]:.0f} kbps -> LAME -q:a {vbr[p]} '
                      f'avg {mp3_params(out[p])["avg_kbps"]:.0f} kbps')
            if ceil[p] < PEAK_MAX:
                print(f'{p.name}: ceiling lowered to {ceil[p]:.2f} dBFS (the encode overshot -1)')
        if spread:
            print(f'\n{len(spread)} file(s) outside ±{SPREAD_PASS} LU at the one song gain — the song '
                  'gain stands, never a file of its own:')
            for p, d in spread:
                print(f'  {p.name}: {d:+.2f} LU')
            if not accept_spread:
                print('Ask Jonathan; to level the song anyway, re-run with --accept-spread.')
        if failed:
            print(f'\nFAILED — audio/ left untouched:')
            for p, why in failed:
                print(f'  {p.name}: {"; ".join(why)}')
            return 1
        if dry:
            print('\n--dry-run: every file passed; audio/ left untouched')
            return 0
        for p in files:            # all passed: move them in, each by an atomic rename
            part = p.with_name(f'.{p.name}.loudness-part')
            shutil.copyfile(out[p], part)
            os.replace(part, p)
        print(f'\nwrote {len(files)} files to audio/ at {gain:+.2f} dB')
        return 0
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == '__main__':
    sys.exit(main(sys.argv))
