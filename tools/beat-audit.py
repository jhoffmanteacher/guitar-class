#!/usr/bin/env python3
"""beat-audit.py: LISTEN to every backing track and LIST where the site's beat map (stage 1) and the practice
cards' chord roots (stage 2) disagree with the record. It never changes anything: no beat map, anchor, chart or
audio file is written, and it never prints a "corrected" map to paste. Jonathan settles each line by ear
(?snipcal=1 on a snippet card shows a live timecode; every finding gives the time in the file as m:ss.s).

  python3 tools/beat-audit.py                         the whole library, both stages (about 10 min cold)
  python3 tools/beat-audit.py --only seven-nation-army one track (a SNIPPET_TRACKS key)
  python3 tools/beat-audit.py --file audio/<name>.mp3 one file of one track
  python3 tools/beat-audit.py --stage 1               beats only (2 = chord roots only)
  python3 tools/beat-audit.py --verbose               per-bar numbers
  python3 tools/beat-audit.py --json out.json         every number, for a script
  python3 tools/beat-audit.py --root <folder>         read app/snippets.js, class-activities.js and audio/ from
                                                      another checkout (how the planted-fault proof hands it a copy)
  python3 tools/beat-audit.py --cache <folder>        keep each file's analysis there, keyed by the file's SHA-1
                                                      (must be outside the site folder; nothing is cached without it)
  python3 tools/beat-audit.py --self-test             the fake world (below); --break env_shift|no_unwrap|flip|no_slip_fix|no_band_witness|no_far_bands
                                                      breaks the detector on purpose, and the self-test must FAIL
  python3 tools/beat-audit.py --resolution            plant bar-line shifts in memory and print, per track, the
                                                      smallest one it catches
A PRIVATE track file (SONG FILES, 2026-11-14: a SNIPPET_TRACKS path 'private:<id>'; tools/song_files.py) is read from
the private song folder (~/Documents/guitar-class-song-files/, or GC_SONG_FILES_DIR) when the folder has it and its
size and SHA-256 are the list's (app/songfiles.js of --root); one the folder does not have is "not measured" with one
line naming the id and its list size and length; a copy that differs stops the run (exit 2).
NOT HANDLED: a half-beat section on a 6/8 map with barTimes (half a big beat is 3 half-units, which the comb
cannot see; none such exists today: the 6/8 tracks are steady grids).

WHAT AN EXIT 0 MEANS: every bar the tool could measure sits within about its "catches about N ms" figure of the
map, the slow files follow the scaling rule, and no card section of 4 bars or more fits the record better a bar off (a shorter section, 13 of them
today, cannot be judged a bar off). It does NOT mean
the map is clean: in the bars it calls "cannot tell" (listed per file) a planted 150-250 ms fault was often missed
(PROOF below gives the dated count), and half-beat or whole-beat shifts there, or on the two-file mariachi tracks, can pass unseen, so
those bars still need ears.

Exit: 0 = nothing on THE LIST, FAR OFF, BEAT 1 or the counted STAGE 2 LIST (WEAK, OUTSIDE EVERY CARD, SETTLED and
BASS DIFFERS do not fail), 1 = findings (or a self-test
FAIL), 2 = could not run (no ffmpeg or node, a file missing), 3 = watchdog (no progress for 120 s; it names the
step it was stuck on).

WHEN TO RUN IT: after any change to a SNIPPET_TRACKS entry (anchor, barTimes, trackBpm, trackBpmSlow, feltBpm,
beatsPerBar), after a new or re-exported backing track, and after a practice card's sections or chords change.

PYTHON, NOT NODE: the work is signal processing (FFTs, band filters, chroma) and numpy does it in a few lines;
scipy and librosa are not installed and are not needed. The site's DATA is read by running the site's own files,
unchanged, in Node (app/snippets.js and class-activities.js in a vm with a stub window), so the tool never parses
JS with a regex and never calls the site's functions (snippetWindow, snipBarsAt, pcLocate): it computes from the
data by the rules below.

WHAT IS REAL: the site's mp3s, decoded by ffmpeg to a pipe (mono, 22050 Hz, float); the site's data. WHAT IS
FAKE: only the self-test's band. The tool decodes as ffmpeg does (it trims an mp3's encoder delay when the file's
header says how much); how a BROWSER trims it is not modelled, so a mix offset the tool reports is ffmpeg's view of
the two files. NOT MODELLED: the browser's output latency (the dots' SNIP_OUTPUT_LATENCY lead is
a display matter, not the map's), the Slowest tier (the slow file played at 0.8, which reads the same file clock),
Journey pages' data-click-bars (checks.mjs 1bk holds them equal to barTimes).

THE RULES TAKEN FROM THE SITE (app/snippets.js comments and snippetWindow / pcLayout / pcLocate, the
audio-and-snippets skill, the song-facts skill):
 R1. A track with a barTimes list of 2+ entries: bar n starts at barTimes[n-1] (seconds, FAST file); barTimes[0] is
     bar 1 and equals anchor; the last entry closes the last bar. The site extends past it at the average bar, but
     1ak refuses a window there, so the tool measures only the listed bars.
 R2. A track without barTimes: bar n starts at anchor + (n-1) * beatsPerBar * 60 / feltBpm (a steady grid); the
     tool measures every whole bar inside the file from bar 1.
 R3. The slow file's time is the fast file's times trackBpm / trackBpmSlow (both the barTimes and the anchor are
     scaled; never a second anchor).
 R4. Inside a bar the beats are evenly spaced between its two bar lines (the windows, the dots and the click all
     divide a measured bar evenly).
 R5. beatsPerBar counts FELT beats ("the cure": 4 at feltBpm 72 though the file reads 144); a countSix track (Luna,
     Arsenal Efectivo, Ella, Perdon Mama) is 6/8 felt in two: beatsPerBar 2, three eighths to a big beat, six
     counts drawn. A "beat" in this tool's output is always the counted beat, 60 / feltBpm (times the slow scale).
 R6. A practice card section plays its notes once per rep; rep r covers bars fromBar + r * bars ...; a note's bar
     inside a rep is floor(beat position / beatsPerBar) (pcLocate). recordingVersions swap in their own card and
     track (Neil Young); keyVersions swap the track and rename the chords through their `full` map.
 R7. Settled facts are not findings: which click is beat 1 (comments), Las Mananitas bar 62 being two beats long,
     the file's last entry not being a downbeat, BPM labels (never checked: "don't verify BPM in audits").
 R8. The dots are meant to lead the sound slightly (SNIP_OUTPUT_LATENCY): that is display, not data, so the tool
     measures the map itself; a steady few tens of ms is not listed (CONST_MIN).

THE GRID. units a bar G = lcm(beatsPerBar, beatsPerBar * trackBpm / feltBpm): the counted beats and the file's own
pulse together ("the cure" 8, Seven Nation Army 4, the 6/8 tracks 6, the 3/4 tracks 3). 3/4 and 6/8 need nothing
else: every rule above is per unit and per bar, and the 6/8 tracks are measured on their eighths.

STAGE 1, HOW (per file):
 1. Onset envelopes: three zero-phase band-passes (FFT mask) of the whole file, low 35-180 Hz (kick, bass), mid
    180-1500 Hz, high 1500-8000 Hz (snare, hats, strums); energy over a TRAILING window ending at each 2.9 ms frame
    (so a hit registers when it starts, not half a window early), log, rise over 4 frames, rectified, each band
    scaled by its 99th percentile; their sum is the main envelope. Works on a full mix and on a quiet rhythm-down
    mix (drums and bass remain). The fake world measures its bias: +8 to +10 ms (ONSET_BIAS = 9 ms, subtracted).
 2. Method 1 (primary): the map's teeth on a half-unit grid (2G a bar). For each tooth, a comb of teeth spaced at
    the map's LOCAL unit (median over +-4 bars, so one wrong bar line moves the tooth it sits on, not the comb),
    +-1 bar, triangle weights, slid +-half a half-unit at 1/256 steps with a parabolic peak: the offset of the
    record's grid from that tooth, and a contrast (best peak against the best value a fifth of a step away).
    Offsets fold every half-unit; they are followed in time order (each tooth takes the fold nearest the last
    three, with a light pull toward the unit-grid comb's circular mean). A STEADY grid (no barTimes) is first
    searched for its own tempo (a stretch within +-2 % about bar 1, with a free phase, that puts the most onset
    energy on the units), measured against the stretched grid and the stretch added back: a wrong feltBpm or
    trackBpmSlow is a straight drift that can pass a whole unit across a quiet stretch.
    HALF A UNIT APART: a stretch of 4+ bars where method 1 and the unit-grid comb disagree by half a unit, and
    method 1 stays flat there, is where the record's accents sit between two of the map's units (off-beat strums,
    16th patterns): which is the beat cannot be told from onsets, so those bars are "cannot tell".
 3. Bar lines from teeth: tooth j of bar i is off by (1 - j/2G) e[i] + (j/2G) e[i+1] (R4), so the bar-line errors
    e[] are a weighted least squares over every tooth (weight contrast^2, zero for a comb under a quarter of the
    file's typical height), with Huber reweighting at 40 ms and a light smoothness term. e = record minus map:
    positive = the record's beat comes after the map's (the map is EARLY). A bar line whose teeth carry under
    SUPPORT_REL of the file's median weight is "cannot tell" (intro pads, held chords, fades, breaks).
 4. Method 2 (confirmation): each band alone, teeth on the unit grid, comb +-half a unit, no folding; the same
    least squares; unfolded along the song only to compare. A finding is confirmed by a band that sees the same
    sign and a comparable size (40 % to 200 % of it, +25 ms). It cannot see a shift over 0.4 unit, so it is silent there (neither
    confirms nor denies) and the other files decide.
 5. Kinds. CONSTANT: the median of e minus ONSET_BIAS, listed past CONST_MIN (45 ms). DRIFT: a straight line
    through e that moves more than DRIFT_MIN (or 4 scatter) and explains half the variance; it says where it
    passes a quarter beat, and says whether its worse end is the start or the end of the file. LOCAL: a bar line off its neighbours' running median (+-6 bars) by more than
    max(LOCAL_MIN 35 ms, 4 x the file's bar-to-bar scatter); that threshold is printed per file as "catches".
    SECTION: 4+ bars whose running median sits off the constant by the same rule. PATTERN: a map bar whose onset
    pattern matches the song's typical bar much better read as TWO bars (a dropped barTimes entry: every later
    bar a bar early), or two map bars that match as ONE (a doubled entry); a whole-bar shift is otherwise
    invisible to beats; it is tried only on a map bar 1.5x or more its neighbours (or a pair of map bars that
    together are no longer than 1.5 of them): read on every bar it mistakes half a rock bar for a whole one. A map
    bar of zero length or under half its neighbours (a doubled or mistyped entry) is listed from the data alone,
    no listening. A wrong beatsPerBar on a STEADY track keeps every beat on a beat and is not seen by stage 1 (the
    chords then change on another unit, which the BEAT 1 gate may not pass); stage 2 sees it as sections that fit
    the chart a bar or two off: one reason to keep stage 2 in the default run.
    SLOW: a finding seen only in the slow file(s); when the onsets-only test finds the slow file IS the fast one
    scaled, such a finding is a measuring quirk of the slow file and goes to WEAK. SLOW STRETCH: the slow file's real stretch
    against the fast file, from onsets alone (no map, no beat tracker: the ratio and lag that best line up six
    windows), against trackBpm / trackBpmSlow; then 8-second windows at that ratio for local slips. MIX: the full
    mix against its rhythm-down twin, 8-second windows: the median lag of the clear windows, listed past 15 ms, in
    words ("the rhythm-down file is 25 ms LATER than the full mix"); a constant finding on the same track says to
    settle that file offset first and gives the constant against the full mix too. Every constant is printed
    "+-15 ms" with each band's own reading: the fake world calibrates the detector on clicks (+9 ms), but on real
    records the low and high bands differ by up to about 30 ms (the cure, Luna), so it is not calibrated there.
    FAR OFF WHERE THE FIRST PASS COULD NOT TELL (a second pass, counted): a bar line inside a card's sections,
    "cannot tell" in at least one file and in no other finding, that at least 3 files (or every measured file)
    read off their own trend by more than max(80 ms, 1.5 x that file's catch threshold; 120 ms on a track with only
    two files, which are one take twice), same sign, sizes within
    40 % once slow files are divided by their scale. Every file line also says how many of its "cannot tell" bars
    sit inside card sections. SLIPS: a stretch of 4+ bars that method 1 followed half a unit away from the whole
    file's level, while the unit comb stays on it, is the following slipping at a moved bar line: it is put back
    (it used to turn 25 bars after one bad line into "cannot tell").
 6. BEAT 1 (a separate, weaker judgment): a one-whole-beat shift keeps every beat on a beat. Only where the chords
    change can tell: mid-register chroma averaged over one counted beat before and after each unit of the bar,
    novelty = 1 - cosine, averaged over the song. Listed only when every file of the track puts the changes on the
    same unit other than the map's first, by 15 %+; its confidence is "higher" when 3 of 4 quarters of the song
    agree in every file, else "low". A CONSTANT finding also says where the chords change when every file agrees,
    so a shift of a fraction of a unit plus whole units can be read whole (Perdon Mama's anchor + half a beat).
 7. Strong or weak: THE LIST holds the strong findings. The files of one take (fast, slow, full, rhythm-down) are ONE
    method, since every feature of the record repeats in all of them. A finding is strong when the bands agree (2
    of 3) in at least TWO files; where the shift is over 0.4 unit (the bands cannot represent it) when two files
    see it over their own thresholds. A file counts only over its own threshold. A slow-only finding that the
    onsets test explains is weak before anything else is counted. Everything else is WEAK. THE BANDS ARE THE WITNESS where method 1 is unsure (review
    round 2): a stretch is put back after a slip only when 2 of 3 bands sit on the file's level there; a stretch where the
    bands and the unit comb agree away from method 1 is "cannot tell" (round 3: moving it gave wrong confident
    readings); a finding near half a unit (0.4-0.6) is strong only when the bands of 2 files also read it 0.3 unit off, and
    never where a file had bars put back (else WEAK, "possible half-beat fold"); a single bar whose low band (kick,
    bass) sits on the map while mid and high read the shift is WEAK, "probably playing feel". "catches about N ms"
    is the threshold divided by 0.75, because method 1 reads a planted shift about a quarter small. Loudest first (by
    size in ms). Bars no practice card plays are printed under OUTSIDE EVERY CARD, bars the comments settle under
    SETTLED; neither counts for the exit code. Constant and drift findings name the whole map, never one bar.

STAGE 2, HOW: for each card (and its recording / key versions), each section, rep and half bar, the chart's bass
pitch class weighted by beats (a chord's root; for a slash chord also the note after the slash; a single-note riff
its note). A half bar is judged when one pitch class holds 60 %+ of its beats. The record's low register
(38-262 Hz chroma, 0.74 s frames, of the full mix if the track has one, else the record) over that half bar, on the
map's times: AGREE when the loudest pitch class is the chart's note or its fifth (root-fifth bass lines), or the
chart's note is at least 0.7 of the loudest; CANNOT TELL when the loudest is the chord's third (a passing bass);
DISAGREE when the loudest is outside the chord, holds 30 %+ of the energy and the chart's note is under 0.35 of it.
Listed (counted): a section that agrees clearly better moved one or two bars earlier or later, judged on 8+ half
bars (a wrong fromBar, or the map a bar off there; a section shorter than 4 bars is never judged this way); a section where most judged half bars disagree; 4+ judged half
bars IN A ROW (two bars) that disagree inside a section where 60 %+ agree. Under BASS DIFFERS (rough, NOT counted):
runs of exactly 3 (a walking bass looks the same). A wrong chord name on ONE bar makes only 2 half bars and is never
listed. Each place is printed once, naming every card that shares it. A lone disagreeing half bar is counted, never
listed: on the confirmed Hendrix Watchtower the bass fills make about ten of them per card.

THE FAKE WORLD (--self-test): a band (kick 1 and 3, snare 2 and 4, hats on eighths, a bass note and a triad per bar,
A G F G) whose tempo wanders +-3 % on a seeded random walk, rendered at known times, through a real mp3 encoder and
back; a slow twin at 1.25x, a full twin with strummed guitar, and a copy in pink noise at 0 dB. Checks: the exact
map comes back at the bias with per-bar rms under 6 ms (12 noisy) and nothing listed; four planted bar lines
(+60, -250, +35, -120 ms) come back within 15 ms and the ones of 50 ms+ are listed; a straight grid on the drifting
band is listed; a wrong trackBpmSlow is seen by the onsets test and the slow file.
"""
import argparse
import hashlib
import json
import math
import os
import subprocess
import sys
import tempfile
import threading
import time

import numpy as np

import song_files as sf

SR = 22050
HOP = 64
FPS = SR / HOP
TOOL_VERSION = 'beat-audit-1'

# ── reading the site's data: the site's own files, run unchanged in Node ──
NODE_LOADER = r"""
const vm = require('vm'), fs = require('fs'), path = require('path');
const root = process.argv[1];
const stub = new Proxy(function(){}, { get: (t, k) => k === Symbol.toPrimitive ? (() => '') : stub, apply: () => stub, construct: () => stub });
const ctx = { console, Math, JSON, Array, Object, String, Number, RegExp, Date, Map, Set, WeakMap, Promise,
  setTimeout: () => 0, clearTimeout: () => 0, setInterval: () => 0, clearInterval: () => 0,
  addEventListener: () => {}, removeEventListener: () => {} };
ctx.window = ctx;
ctx.location = { href: '', search: '', hash: '' };
ctx.document = stub;
ctx.navigator = { userAgent: '' };
ctx.localStorage = { getItem: () => null, setItem: () => {}, removeItem: () => {} };
vm.createContext(ctx);
vm.runInContext(fs.readFileSync(path.join(root, 'app/snippets.js'), 'utf8') + '\n;window.__ST = SNIPPET_TRACKS;', ctx, { filename: 'app/snippets.js' });
vm.runInContext(fs.readFileSync(path.join(root, 'class-activities.js'), 'utf8'), ctx, { filename: 'class-activities.js' });
const cards = [];
const notesOf = s => (s.notes || []).map(n => ({ note: n.rest ? null : (n.note == null ? null : String(n.note)), beats: n.beats > 0 ? n.beats : 1, rest: !!n.rest }));
const secs = c => (c.sections || []).map(s => ({ label: String(s.label || ''), fromBar: Math.max(1, s.fromBar || 1), bars: Math.max(1, s.bars || 1), reps: Math.max(1, s.reps || 1), notes: notesOf(s) }));
for (const a of (ctx.CLASS_ACTIVITIES || [])) {
  if (!a || !a.card || !a.card.track) continue;
  cards.push({ id: a.id, version: '', track: a.card.track, sections: secs(a.card), keyMap: null });
  if (a.recordingVersions) for (const k of Object.keys(a.recordingVersions)) {
    const rv = a.recordingVersions[k];
    if (rv && rv.track && rv.card) cards.push({ id: a.id, version: k, track: rv.track, sections: secs(rv.card), keyMap: null });
  }
  if (a.keyVersions) for (const k of Object.keys(a.keyVersions)) {
    const kv = a.keyVersions[k];
    if (!kv || !kv.track) continue;
    const m = {};
    for (const [nm, v] of Object.entries(kv.full || {})) m[nm] = String(v.note);
    cards.push({ id: a.id, version: 'key ' + k, track: kv.track, sections: secs(a.card), keyMap: m });
  }
}
process.stdout.write(JSON.stringify({ tracks: ctx.__ST, cards }));
"""


def load_site(root):
    for need in ('app/snippets.js', 'class-activities.js'):
        if not os.path.exists(os.path.join(root, need)):
            raise ToolError('%s has no %s (is --root a site folder?)' % (root, need))
    r = subprocess.run(['node', '-e', NODE_LOADER, root], capture_output=True, text=True)
    if r.returncode != 0:
        errs = [l for l in r.stderr.splitlines() if 'Error' in l or 'ENOENT' in l]
        raise ToolError('could not read the site data with node from %s: %s' % (
            root, errs[0].strip() if errs else (r.stderr.strip().splitlines() or ['node failed'])[0]))
    return json.loads(r.stdout)


class ToolError(Exception):
    pass


# ── watchdog: exit 3 when nothing has moved for 120 s ──
class Watchdog:
    def __init__(self, limit):
        self.limit = limit
        self.last = time.monotonic()
        self.where = 'starting'
        self.proc = None
        t = threading.Thread(target=self._run, daemon=True)
        t.start()

    def step(self, where):
        self.where = where
        self.last = time.monotonic()

    def _run(self):
        while True:
            time.sleep(2)
            if time.monotonic() - self.last > self.limit:
                sys.stdout.flush()
                sys.stderr.write('beat-audit: ✗ HUNG: no progress for %d s. Stuck at "%s"\n' % (self.limit, self.where))
                sys.stderr.flush()
                p = self.proc
                if p is not None:
                    try:
                        p.kill()
                    except Exception:
                        pass
                os._exit(3)


WD = None


def progress(where):
    if WD is not None:
        WD.step(where)


# ── audio ──
def decode(path):
    """mono float32 at SR, through a pipe; the site file is never written."""
    progress('decoding ' + os.path.basename(path))
    p = subprocess.Popen(['nice', '-n', '10', 'ffmpeg', '-v', 'error', '-nostdin', '-i', path, '-ac', '1', '-ar', str(SR),
                          '-f', 'f32le', '-'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    if WD is not None:
        WD.proc = p
    out, err = p.communicate()
    if WD is not None:
        WD.proc = None
    if p.returncode != 0:
        raise ToolError('ffmpeg could not decode %s: %s' % (path, err.decode(errors='replace').strip()))
    return np.frombuffer(out, dtype=np.float32).astype(np.float64)


BANDS = (('low', 35.0, 180.0, 1024), ('mid', 180.0, 1500.0, 512), ('high', 1500.0, 8000.0, 256))
ONSET_LAG = 4


def band_signal(X, n, lo, hi):
    f = np.fft.rfftfreq(n, 1.0 / SR)
    m = np.zeros_like(f)
    edge = 0.25
    a0, a1, b0, b1 = lo * (1 - edge), lo, hi, hi * (1 + edge)
    m[(f >= a1) & (f <= b0)] = 1.0
    r = (f > a0) & (f < a1)
    m[r] = 0.5 - 0.5 * np.cos(np.pi * (f[r] - a0) / (a1 - a0))
    r = (f > b0) & (f < b1)
    m[r] = 0.5 + 0.5 * np.cos(np.pi * (f[r] - b0) / (b1 - b0))
    return np.fft.irfft(X * m, n)


def onset_envelopes(x):
    """Per band: zero-phase band-pass (FFT mask), energy over a TRAILING window ending at each frame, log, rise over
    ONSET_LAG frames, half-wave rectified, scaled by its 99th percentile. Frame i is at time i*HOP/SR."""
    n = 1
    while n < len(x):
        n *= 2
    X = np.fft.rfft(x, n)
    nfr = len(x) // HOP
    out = {}
    for name, lo, hi, L in BANDS:
        progress('onset envelope %s' % name)
        y = band_signal(X, n, lo, hi)[:len(x)]
        c = np.concatenate(([0.0], np.cumsum(y * y)))
        idx = np.arange(nfr) * HOP
        e = c[idx] - c[np.maximum(idx - L, 0)]
        e = np.maximum(e, 0.0)
        floor = 1e-3 * (np.mean(e) + 1e-12)
        le = np.log(e + floor)
        o = np.zeros(nfr)
        o[ONSET_LAG:] = le[ONSET_LAG:] - le[:-ONSET_LAG]
        o = np.maximum(o, 0.0)
        s = np.percentile(o, 99)
        out[name] = o / (s if s > 0 else 1.0)
    out['all'] = out['low'] + out['mid'] + out['high']
    return out


# ── the map, from the data alone ──
def units_per_bar(tr):
    """Grid units per bar: the finest regular grid the data names. pulses per bar = beatsPerBar * trackBpm / feltBpm
    (the file's own pulse); counted beats per bar = beatsPerBar; the grid is their least common multiple."""
    bpb = int(round(tr['beatsPerBar']))
    ppb = int(round(tr['beatsPerBar'] * tr['trackBpm'] / tr['feltBpm']))
    return bpb * ppb // math.gcd(bpb, ppb), bpb, ppb


def fast_bar_lines(tr, duration):
    """Bar lines (seconds, FAST file). barTimes when it has 2+ entries (bar n starts at barTimes[n-1]; the last entry
    closes the last bar); else anchor + k * beatsPerBar * 60 / feltBpm for every whole bar inside the file."""
    bt = tr.get('barTimes')
    if isinstance(bt, list) and len(bt) > 1:
        return np.array(bt, dtype=float), True
    bar = tr['beatsPerBar'] * 60.0 / tr['feltBpm']
    n = int(math.floor((duration - tr['anchor']) / bar + 1e-9))
    return tr['anchor'] + bar * np.arange(n + 1), False


def teeth_of(E, G):
    """Every grid unit of the map: G per bar, evenly spaced inside each bar (the site spaces beats evenly between two
    bar lines). Returns times, bar index (0 = bar 1), unit index."""
    nb = len(E) - 1
    j = np.arange(G)
    t = (E[:-1, None] + (E[1:, None] - E[:-1, None]) * j[None, :] / G).ravel()
    bi = np.repeat(np.arange(nb), G)
    ui = np.tile(j, nb)
    return t, bi, ui


def interp_env(env, t):
    f = t * FPS
    i = np.floor(f).astype(np.int64)
    a = f - i
    ok = (i >= 0) & (i + 1 < len(env))
    i = np.clip(i, 0, len(env) - 2)
    v = env[i] * (1 - a) + env[i + 1] * a
    return np.where(ok, v, 0.0)


def comb_offsets(env, t, period, span_units):
    """For each tooth time t[k]: the offset d (seconds, |d| <= period/2) that best lines a comb of teeth spaced
    period[k] apart, +-span_units teeth with triangle weights, centred on t[k] + d, up with the onset envelope.
    The comb is the AUDIO's local grid: its spacing comes from the map's median bar over +-4 bars, so one wrong bar
    line moves the tooth it sits on, not the comb. Returns offset, contrast (0..1) and the comb's height."""
    K = len(t)
    m = np.arange(-span_units, span_units + 1)
    w = 1.0 - np.abs(m) / (span_units + 1.0)
    out_d = np.zeros(K)
    out_c = np.zeros(K)
    out_h = np.zeros(K)
    nd = 256
    frac = (np.arange(nd) + 0.5) / nd - 0.5
    for k0 in range(0, K, 64):
        sl = slice(k0, min(K, k0 + 64))
        p = period[sl]
        d = frac[None, :] * p[:, None]
        pos = t[sl, None, None] + d[:, :, None] + m[None, None, :] * p[:, None, None]
        v = interp_env(env, pos.ravel()).reshape(pos.shape)
        C = (v * w[None, None, :]).sum(-1) / w.sum()
        i = np.argmax(C, 1)
        rows = np.arange(C.shape[0])
        c0 = C[rows, i]
        cl = C[rows, (i - 1) % nd]
        cr = C[rows, (i + 1) % nd]
        den = cl - 2 * c0 + cr
        sh = np.where(den < 0, 0.5 * (cl - cr) / np.where(den < 0, den, -1), 0.0)
        sh = np.clip(sh, -0.5, 0.5)
        out_d[sl] = (frac[i] + sh / nd) * p
        # contrast: how much higher the best peak is than the best value more than a fifth of a unit away
        dist = np.abs(((np.arange(nd)[None, :] - i[:, None]) + nd // 2) % nd - nd // 2)
        c2 = np.where(dist > nd // 5, C, -np.inf).max(1)
        out_c[sl] = np.clip((c0 - c2) / np.maximum(c0, 1e-9), 0.0, 1.0)
        out_h[sl] = c0
    return out_d, out_c, out_h


def solve_bar_lines(d, conf, height, bi, ui, G, nbars, lam=0.02, huber=0.040):
    """Bar-line errors from tooth offsets. The map's teeth inside bar i sit on the straight line between bar lines i
    and i+1, so tooth j of bar i is off by (1 - j/G) * e[i] + (j/G) * e[i+1]. Weighted least squares over every
    tooth (weight = contrast^2, zero for a tooth whose comb is under a quarter of the file's typical height), a light
    smoothness term so a bar line with no evidence is carried by its neighbours (and reported "cannot tell"), and
    Huber reweighting so one tooth on a fill cannot move a bar line. Returns e (seconds, audio minus map; + = the
    record's beat comes AFTER the map's) and each bar line's support (summed weight of the teeth that touch it)."""
    typ = np.median(height[conf > 0.3]) if np.any(conf > 0.3) else np.median(height)
    w0 = np.where(height >= 0.25 * typ, conf ** 2, 0.0)
    n = nbars + 1
    a = 1.0 - ui / G
    b = ui / G
    support = np.zeros(n)
    np.add.at(support, bi, w0 * a)
    np.add.at(support, bi + 1, w0 * b)
    w = w0.copy()
    e = np.zeros(n)
    for _ in range(6):
        A = np.zeros((n, n))
        rhs = np.zeros(n)
        np.add.at(A, (bi, bi), w * a * a)
        np.add.at(A, (bi, bi + 1), w * a * b)
        np.add.at(A, (bi + 1, bi), w * a * b)
        np.add.at(A, (bi + 1, bi + 1), w * b * b)
        np.add.at(rhs, bi, w * a * d)
        np.add.at(rhs, bi + 1, w * b * d)
        k = np.arange(n - 1)
        A[k, k] += lam
        A[k + 1, k + 1] += lam
        A[k, k + 1] -= lam
        A[k + 1, k] -= lam
        A[np.arange(n), np.arange(n)] += 1e-6
        e = np.linalg.solve(A, rhs)
        r = d - (a * e[bi] + b * e[bi + 1])
        ar = np.abs(r)
        w = w0 * np.where(ar <= huber, 1.0, huber / np.maximum(ar, 1e-12))
    return e, support


PULL = 0.1


def unwrap_track(d, conf, period, t, ref0):
    """Tooth offsets come back folded into +-period/2. Follow them in time order: each tooth takes the fold nearest
    the last confident unfolded teeth (the median of the last 3, plus their trend), because the record's beat moves
    smoothly against the map: a drift, or a moved bar line, spreads over the teeth between two bar lines, so
    neighbouring teeth differ by much less than a fold."""
    u = d.copy()
    hist = []
    ref = ref0
    for k in np.argsort(t, kind='stable'):
        # the fold nearest the moving reference, with a light pull (PULL) toward the whole file's circular mean, so
        # a stretch of unclear teeth cannot leave every later tooth one fold away (a slip), while a real drift,
        # which moves the reference with it, still wins
        n0 = np.round((ref - d[k]) / period[k])
        cand = d[k] + (n0 + np.array([-1.0, 0.0, 1.0])) * period[k]
        cost = np.abs(cand - ref) + PULL * np.abs(cand - ref0)
        u[k] = cand[int(np.argmin(cost))]
        if conf[k] >= 0.3:
            hist.append(u[k])
            if len(hist) > 3:
                hist.pop(0)
            ref = float(np.median(hist))
            if len(hist) == 3:
                ref += 0.5 * (hist[2] - hist[0]) / 2.0
    return u


def chroma_frames(x, nfft, hop, fmin, fmax):
    """Pitch-class energy per frame (frames x 12, C = 0), magnitude squared folded by the nearest semitone with a
    triangular weight, from fmin to fmax. Frame i is centred at (i * hop + nfft / 2) / SR."""
    win = np.hanning(nfft)
    f = np.fft.rfftfreq(nfft, 1.0 / SR)
    sel = np.where((f >= fmin) & (f <= fmax))[0]
    pitch = 69 + 12 * np.log2(f[sel] / 440.0)
    near = np.round(pitch)
    wt = np.maximum(0.0, 1.0 - 2.0 * np.abs(pitch - near))
    pc = (near.astype(int) % 12)
    M = np.zeros((len(sel), 12))
    M[np.arange(len(sel)), pc] = wt
    nfr = max(0, (len(x) - nfft) // hop + 1)
    out = np.zeros((nfr, 12))
    for k0 in range(0, nfr, 256):
        k1 = min(nfr, k0 + 256)
        idx = (np.arange(k0, k1) * hop)[:, None] + np.arange(nfft)[None, :]
        X = np.fft.rfft(x[idx] * win[None, :], axis=1)
        out[k0:k1] = (np.abs(X[:, sel]) ** 2) @ M
    return out


def analyse_audio(path, cache_dir):
    """Everything the tool reads from one file: onset envelopes per band, a mid-register chroma (harmony changes)
    and a bass chroma. Cached by the file's SHA-1 only when --cache names a folder."""
    key = None
    if cache_dir:
        h = hashlib.sha1()
        with open(path, 'rb') as fh:
            for blk in iter(lambda: fh.read(1 << 20), b''):
                h.update(blk)
        key = os.path.join(cache_dir, '%s-%s.npz' % (TOOL_VERSION, h.hexdigest()))
        if os.path.exists(key):
            z = np.load(key)
            return {k: z[k] for k in z.files}
    x = decode(path)
    return analyse_signal(x, key)


def analyse_signal(x, key=None):
    a = onset_envelopes(x)
    progress('chroma')
    a['chroma_mid'] = chroma_frames(x, 4096, 1024, 80.0, 2000.0)
    a['chroma_bass'] = chroma_frames(x, 16384, 2048, 38.0, 262.0)
    a['duration'] = np.array(len(x) / SR)
    if key:
        os.makedirs(os.path.dirname(key), exist_ok=True)
        tmp = key + '.tmp.npz'
        np.savez(tmp, **a)
        os.replace(tmp, key)
    return a


def local_period(E, U, bi):
    bl = np.diff(E) / U
    med = np.array([np.median(bl[max(0, b - 4):b + 5]) for b in range(len(bl))])
    return med[bi]


def circ_mean(d, c, per):
    ok = c >= 0.3
    if not np.any(ok):
        return 0.0
    z = np.sum(c[ok] * np.exp(2j * np.pi * d[ok] / per[ok]))
    return float(np.angle(z) / (2 * np.pi) * np.median(per[ok]))


def steady_scale(env, E, G):
    """A steady grid's tempo against the record, before any following: the stretch k of the grid about its first
    bar line (within +-2 %), with a free phase, that puts the most onset energy on the grid's units over the whole
    file. A wrong feltBpm (or a slow file scaled by a wrong trackBpmSlow) is a straight-line drift that can run past
    a whole unit, which the tooth-by-tooth following can lose across a quiet stretch; measuring against the
    stretched grid and adding the stretch back keeps it. Returns k (1.0 = the map's own tempo)."""
    t, _, _ = teeth_of(E, G)
    unit = (E[-1] - E[0]) / (len(E) - 1) / G
    sm = np.convolve(env, np.hanning(9) / np.hanning(9).sum(), mode='same')

    def search(ks, phs):
        best = (-1.0, 1.0, 0.0)
        for k in ks:
            pos = E[0] + (t - E[0]) * k
            v = interp_env(sm, (pos[None, :] + phs[:, None]).ravel()).reshape(len(phs), len(pos)).sum(1)
            i = int(np.argmax(v))
            if v[i] > best[0]:
                best = (float(v[i]), float(k), float(phs[i]))
        return best
    progress('steady grid: tempo search')
    b = search(1 + np.arange(-100, 101) * 2e-4, np.arange(-unit / 2, unit / 2, 0.004))
    b2 = search(b[1] + np.arange(-20, 21) * 1e-5, b[2] + np.arange(-0.006, 0.0061, 0.001))
    return b2[1]


def half_unit_stretches(e, eg, sg, bands, E, G, breaks=(), unit_is_beat=True):
    """Stretches of 4+ bars where method 1 and the unit comb sit half a unit apart: put back (a slip of the
    following, the bands with the file's level), kept (the bands with method 1), or "cannot tell". Returns e,
    ambiguous, fixed_mask, fixed. Its own function so the self-test can feed it a slip and a real section."""
    e = e.copy()
    unit_g = np.maximum(np.concatenate([np.diff(E) / G, [(E[-1] - E[-2]) / G]]), 1e-3)
    okg = sg >= SUPPORT_REL * np.median(sg)
    diff = (e - eg + unit_g / 2) % unit_g - unit_g / 2
    half = okg & (np.abs(np.abs(diff) - unit_g / 2) < unit_g / 6)
    ambiguous = np.zeros(len(e), bool)
    fixed_mask = np.zeros(len(e), bool)
    band_mask = np.zeros(len(e), bool)
    fixed = 0
    if 'no_ambiguity' not in breaks:
        rr = []
        for i0, i1 in runs(half, gap=0):
            seg = e[i0:i1 + 1]
            # a drift sweeps e - eg through every value; only a stretch that STAYS half a unit off counts
            if i1 - i0 + 1 >= 4 and float(seg.max() - seg.min()) < float(np.median(unit_g[i0:i1 + 1])) / 4:
                rr.append((i0, i1))
        inrun = np.zeros(len(e), bool)
        for i0, i1 in rr:
            inrun[i0:i1 + 1] = True
        for i0, i1 in rr:
            # A SLIP of the following (review R1-1: one 150 ms bar line made the slow file follow the eighth between
            # two beats for 25 bars): the stretch sits half a unit off the bars just before or after it, while the
            # unit comb there sits WITH those bars. Put it back. Otherwise (the stretch agrees with its neighbours
            # and only the unit comb is off: off-beat accents) it is "cannot tell".
            hh = float(np.median(unit_g[i0:i1 + 1])) / 2
            # judged against the whole file's level (the bars outside every such stretch): the bars right next to a
            # slip are the moved line's own ramp, so they are no reference
            ctx = list(np.where(okg & ~inrun)[0])
            here = float(np.median(e[i0:i1 + 1]))
            dnow = (e[i0:i1 + 1] - eg[i0:i1 + 1] + 2 * hh * 0.5) % (2 * hh) - hh
            if abs(float(np.median(np.abs(dnow))) - hh) >= hh / 3:
                continue        # already put back with an earlier stretch of the same slip
            if len(ctx) >= 8 and 'no_slip_fix' not in breaks:
                there = float(np.median(e[ctx]))
                gd = float(np.median((eg[i0:i1 + 1] - there + hh) % (2 * hh) - hh))
                # the BANDS are the witness (review R2-2: a planted half-beat section was "put back" while all three
                # bands read it half a unit off): put back only when 2 of 3 bands sit with the file's level here
                gu = 2 * hh
                with_level = 0
                for eb_, sb_ in bands.values():
                    okb = sb_[i0:i1 + 1] >= SUPPORT_REL * np.median(sb_)
                    if okb.sum() >= 2:
                        db = float(np.median(((eb_[i0:i1 + 1] - there + gu / 2) % gu - gu / 2)[okb]))
                        with_level += abs(db) < hh / 3
                if abs(abs(here - there) - hh) < hh / 3 and abs(gd) < hh / 3 and \
                        (with_level >= 2 or 'no_band_witness' in breaks):
                    # the slipped stretch: the run, and the bars on either side still at its level
                    a0, a1 = i0, i1
                    while a0 - 1 >= 0 and abs(e[a0 - 1] - here) < hh / 3:
                        a0 -= 1
                    while a1 + 1 < len(e) and abs(e[a1 + 1] - here) < hh / 3:
                        a1 += 1
                    e[a0:a1 + 1] += (hh if there > here else -hh)
                    inrun[a0:a1 + 1] = False
                    fixed_mask[a0:a1 + 1] = True
                    fixed += a1 - a0 + 1
                    continue
            # the bands side with method 1 (2 of 3 read the stretch where method 1 does): the record really sits
            # half a unit from the unit comb's guess here, so the measurement stands (review R2-2)
            gu = 2 * hh
            with_e = 0
            for eb_, sb_ in bands.values():
                okb = sb_[i0:i1 + 1] >= SUPPORT_REL * np.median(sb_)
                if okb.sum() >= 2:
                    db = float(np.median(((eb_[i0:i1 + 1] - here + gu / 2) % gu - gu / 2)[okb]))
                    with_e += abs(db) < hh / 3
            if with_e >= 2:
                continue
            # (round 3: the "band move" that used to shift such a stretch half a unit to where the bands and the unit
            # comb agreed is REMOVED. On the clean library it read the playing in a solo as a half-unit fault (Vuelve
            # slow, bars 65-68), inside a real quarter-beat fault it flipped the sign (Sweet Child bars 150-157 slow),
            # and on Las Mananitas it fed a counted line at a bar nobody moved. Such a stretch is "cannot tell".)
            ambiguous[i0:i1 + 1] = True
    return e, ambiguous, fixed_mask, fixed, band_mask


def measure_map(a, E, G, breaks=(), steady=False, bpb=None):
    """The per-bar-line measurement of one file against one map (bar lines E, seconds in THIS file).
    PRIMARY (method 1): teeth on a half-unit grid (2G a bar), the comb on the summed envelope, folds followed in
    time order, then the bar-line least squares. SECOND (method 2): each band (low, mid, high) on its own, teeth on
    the unit grid (G a bar), comb +-half a unit, no folding; it confirms or not."""
    env = a['all']
    if 'env_shift' in breaks:
        env = np.roll(env, int(round(0.030 * FPS)))
    E_map = E
    k = steady_scale(env, E, G) if steady else 1.0
    if abs(k - 1.0) * (E[-1] - E[0]) > 0.025:
        E = E[0] + (E - E[0]) * k
    else:
        k = 1.0
    nb = len(E) - 1
    F = 2 * G
    t, bi, ui = teeth_of(E, F)
    per = local_period(E, F, bi)
    progress('comb, %d teeth' % len(t))
    d, c, h = comb_offsets(env, t, per, F)
    tg, big, uig = teeth_of(E, G)
    perg = local_period(E, G, big)
    # the file's own reference fold comes from the UNIT-grid comb (which tells a beat from the eighth between two
    # beats), not from the half-unit comb (which cannot); the half-unit offsets are then followed from there
    dg, cg, hg = comb_offsets(env, tg, perg, G)
    ref0 = circ_mean(dg, cg, perg)
    if 'no_unwrap' in breaks:
        u = d
    else:
        u = unwrap_track(d, c, per, t, ref0)
    e, sup = solve_bar_lines(u, c, h, bi, ui, F, nb)
    bands = {}
    for b in ('low', 'mid', 'high'):
        progress('comb %s band' % b)
        db, cb, hb = comb_offsets(a[b], tg, perg, G)
        eb, sb = solve_bar_lines(db, cb, hb, big, uig, G, nb)
        bands[b] = (eb, sb)
    # Half a unit apart: a stretch of 4+ bars where the half-unit comb (method 1) and the unit comb disagree by
    # half a unit is a place where the record's accents sit between two of the map's units (off-beat strums, a
    # 16th-note pattern): which of the two is the beat cannot be told from onsets. Those bars are "cannot tell",
    # never a finding either way. A single moved bar line (1-2 bars) is never caught by this.
    eg, sg = solve_bar_lines(dg, cg, hg, big, uig, G, nb)
    e, ambiguous, fixed_mask, fixed, band_mask = half_unit_stretches(e, eg, sg, bands, E, G, breaks,
                                                                     unit_is_beat=(bpb is None or bpb == G))
    if k != 1.0:
        # measured against the stretched grid; add the stretch back so e is record minus the SITE's map
        e = e + (E - E_map)
        for bkey in bands:
            eb, sb = bands[bkey]
            bands[bkey] = (eb + (E - E_map), sb)
    E = E_map
    unit = np.concatenate([np.diff(E) / G, [(E[-1] - E[-2]) / G]])
    return {'E': E, 'e': e, 'sup': sup, 'bands': bands, 'unit': unit, 'G': G, 'ambiguous': ambiguous, 'stretch': k,
            'slip_fixed': fixed, 'fixed_mask': fixed_mask, 'band_fold': int(band_mask.sum())}


def best_ratio(env_ref, env_other, ratio0, t1):
    """The stretch the slow file REALLY has against the fast one, from onsets alone: the ratio (within +-4 % of the
    data's trackBpm / trackBpmSlow) and small lag that best line up six 6-second windows spread over the song;
    coarse on a 4x decimated envelope, then fine. Returns (ratio, lag, mean correlation)."""
    def dec(x):
        n = len(x) // 4 * 4
        return x[:n].reshape(-1, 4).mean(1)
    ra, ro = dec(env_ref), dec(env_other)
    fps4 = FPS / 4

    def ip(env, t, fps):
        f = t * fps
        i = np.clip(np.floor(f).astype(np.int64), 0, len(env) - 2)
        a = f - i
        v = env[i] * (1 - a) + env[i + 1] * a
        return np.where((f >= 0) & (f < len(env) - 1), v, 0.0)

    Ts = np.linspace(8.0, max(9.0, t1 - 8.0), 6)

    def score(ratios, lags, envr, envo, fps, step):
        best = np.full(len(ratios), -1.0)
        bestlag = np.zeros(len(ratios))
        tot = np.zeros((len(ratios), len(lags)))
        for T in Ts:
            ts = np.arange(T - 3.0, T + 3.0, step)
            ref = ip(envr, ts, fps)
            ref = ref - ref.mean()
            pos = ratios[:, None, None] * ts[None, None, :] + lags[None, :, None]
            oth = ip(envo, pos.ravel(), fps).reshape(pos.shape)
            oth = oth - oth.mean(2, keepdims=True)
            r = (oth @ ref) / (np.sqrt((oth * oth).sum(2) * (ref * ref).sum()) + 1e-12)
            tot += r
        tot /= len(Ts)
        k = np.argmax(tot, 1)
        best = tot[np.arange(len(ratios)), k]
        bestlag = lags[k]
        return best, bestlag

    progress('slow-file stretch, coarse')
    rs = ratio0 * (1 + 0.0005 * np.arange(-80, 81))
    lags = np.arange(-0.15, 0.1501, 1.0 / fps4)
    b, l = score(rs, lags, ra, ro, fps4, 1.0 / fps4)
    i = int(np.argmax(b))
    progress('slow-file stretch, fine')
    rs2 = rs[i] * (1 + 0.00002 * np.arange(-30, 31))
    lags2 = l[i] + np.arange(-0.02, 0.0201, 1.0 / FPS)
    b2, l2 = score(rs2, lags2, env_ref, env_other, FPS, 1.0 / FPS)
    j = int(np.argmax(b2))
    return float(rs2[j]), float(l2[j]), float(b2[j])


def window_lags(env_ref, env_other, scale, t0, t1, maxlag, win=8.0, hop=8.0, track_pred=True):
    """Onset-envelope cross-correlation, window by window: for each window [T - win/2, T + win/2) of env_ref
    (seconds in ITS file), the lag L (seconds in env_other's file) that best matches env_other at t * scale + L.
    No beat tracker, no map: this is the scaling rule tested on the audio alone. The search follows the previous
    window's lag (a wrong ratio makes the lag grow steadily). Returns rows (T, lag, correlation)."""
    rows = []
    pred = 0.0
    T = t0 + win / 2
    step = 1.0 / FPS
    lags = np.arange(-maxlag, maxlag + step / 2, step)
    while T + win / 2 <= t1:
        progress('cross-correlation at %.0f s' % T)
        ts = np.arange(T - win / 2, T + win / 2, step)
        ref = interp_env(env_ref, ts)
        ref = ref - ref.mean()
        L = pred + lags
        pos = ts[None, :] * scale + L[:, None]
        oth = interp_env(env_other, pos.ravel()).reshape(pos.shape)
        oth = oth - oth.mean(1, keepdims=True)
        num = oth @ ref
        den = np.sqrt((oth * oth).sum(1) * (ref * ref).sum()) + 1e-12
        r = num / den
        i = int(np.argmax(r))
        sh = 0.0
        if 0 < i < len(r) - 1:
            dd = r[i - 1] - 2 * r[i] + r[i + 1]
            if dd < 0:
                sh = float(np.clip(0.5 * (r[i - 1] - r[i + 1]) / dd, -0.5, 0.5))
        lag = L[i] + sh * step
        rows.append((T, lag, float(r[i])))
        if track_pred and r[i] >= 0.3:
            pred = lag
        T += hop
    return rows


# Facts the SNIPPET_TRACKS comments settle (R7): a finding on these bars is printed under SETTLED, not listed.
SETTLED = {
    ('las-mananitas', 62): 'bar 62 really is two beats long; the phase moves by one beat there (its comment)',
    ('las-mananitas', 63): 'right after the two-beat bar 62 (its comment)',
}


# ── judging one file ──
ONSET_BIAS = 0.009        # seconds the detector reports a click late: the fake world's exact map reads +7.8 ms clean, +9.8 ms noisy
LOCAL_MIN = 0.035         # a bar line this far off its neighbours' trend, at the least
LOCAL_K = 4.0             # ... and LOCAL_K times the file's own bar-to-bar scatter
SECTION_MIN = 0.040       # a run of 4+ bars this far off the file's constant
DRIFT_MIN = 0.040         # a straight-line drift that moves this much across the file
CONST_MIN = 0.045         # a constant offset beyond this (after ONSET_BIAS) is listed
SUPPORT_REL = 0.35        # a bar line with less than this share of the file's median support: "cannot tell"


def running_median(x, ok, half=6):
    out = np.full(len(x), np.nan)
    idx = np.where(ok)[0]
    if len(idx) == 0:
        return out
    for i in range(len(x)):
        lo = np.searchsorted(idx, i - half)
        hi = np.searchsorted(idx, i + half, side='right')
        if hi > lo:
            out[i] = np.median(x[idx[lo:hi]])
    return out


def runs(mask, gap=1):
    """[start, end] index pairs of True runs, bridging gaps of up to `gap` False entries."""
    out = []
    i, n = 0, len(mask)
    while i < n:
        if not mask[i]:
            i += 1
            continue
        j = i
        k = i
        while k + 1 < n:
            if mask[k + 1]:
                k += 1
                j = k
            elif any(mask[k + 1:min(n, k + 2 + gap)]):
                k += 1
            else:
                break
        out.append((i, j))
        i = j + 1
    return out


def robust_line(t, y, w):
    A = np.stack([np.ones_like(t), t], 1)
    ww = w.copy()
    coef = np.zeros(2)
    for _ in range(6):
        W = np.sqrt(ww)[:, None]
        coef = np.linalg.lstsq(A * W, y * W[:, 0], rcond=None)[0]
        r = np.abs(y - A @ coef)
        s = 1.4826 * np.median(r) + 1e-4
        ww = w * np.where(r <= 2 * s, 1.0, 2 * s / np.maximum(r, 1e-12))
    return coef


def judge_file(m, beat):
    """Turn one file's bar-line offsets into its numbers and its candidate findings (each with the second-method
    verdict from the three bands)."""
    E, e, sup, unit = m['E'], m['e'], m['sup'], m['unit']
    n = len(e)
    good = (sup >= SUPPORT_REL * np.median(sup)) & (sup > 0.05) & ~m['ambiguous']
    out = {'bars': n - 1, 'measured_lines': int(good.sum()), 'good': good}
    if good.sum() < 8:
        out.update({'C': float('nan'), 'sigma': float('nan'), 'cands': [], 'cannot': True})
        return out
    C = float(np.median(e[good]))
    gi = np.where(good)[0]
    dif = np.diff(e[gi])[np.diff(gi) == 1]
    sigma = float(1.4826 * np.median(np.abs(dif)) / math.sqrt(2)) if len(dif) > 4 else 0.02
    T = running_median(e, good)
    thr_local = max(LOCAL_MIN, LOCAL_K * sigma)
    thr_sec = max(SECTION_MIN, LOCAL_K * sigma)
    tt = E[:n]
    coef = robust_line(tt[good] / 60.0, e[good], np.ones(good.sum()))
    line = coef[0] + coef[1] * tt / 60.0
    span = (tt[gi[-1]] - tt[gi[0]]) / 60.0
    drift_total = coef[1] * span
    resid_c = e[good] - C
    resid_l = e[good] - line[good]
    vr = 1.0 - np.mean(resid_l ** 2) / max(np.mean(resid_c ** 2), 1e-12)
    drift = abs(drift_total) > max(DRIFT_MIN, LOCAL_K * sigma) and vr > 0.5
    model = line if drift else np.full(n, C)
    out.update({'C': C, 'sigma': sigma, 'thr_local': thr_local, 'T': T, 'line': line, 'drift': drift,
                'drift_per_min': float(coef[1]), 'cannot': False})
    bands = m['bands']
    band_T = {}
    for b, (eb, sb) in bands.items():
        gb = sb >= SUPPORT_REL * np.median(sb)
        # a band's teeth are not followed across folds; unfold its bar lines along the song (one unit = one fold),
        # then move the whole series by whole folds to sit on the primary measurement
        eb = eb.copy()
        ig = np.where(gb)[0]
        if len(ig) > 2:
            uu = unit[ig]
            uu = np.maximum(uu, 1e-3)
            eb[ig] = np.unwrap(eb[ig] * 2 * np.pi / uu) * uu / (2 * np.pi)
            k = np.round(np.median((e[ig] - eb[ig]) / uu))
            eb[ig] += k * uu
        band_T[b] = (eb, sb, gb, running_median(eb, gb), float(np.median(eb[gb])) if gb.any() else 0.0)
    gU = np.maximum(unit, 1e-3)

    def wrap(x, u):
        return (x + u / 2) % u - u / 2
    # each band's constant, wrapped into +-half a unit around the file's (review R2-7: a band a whole unit off is
    # the band's own fold, not a reading)
    out['band_C'] = {b: C + float(wrap(v[4] - C, float(np.median(gU)))) - ONSET_BIAS for b, v in band_T.items()}
    # each band's own reading of every bar line against the file's trend, wrapped into +-half a unit: the WITNESS
    # used where method 1 is unsure (review R2: in those bars the bands read planted faults that method 1 missed)
    Tfill = np.where(np.isfinite(T), T, C)
    out['band_dev'] = {b: (wrap(eb_raw - Tfill, gU), sb_raw > 0.05 * np.median(sb_raw))
                       for b, (eb_raw, sb_raw) in bands.items()}
    out['band_lvl'] = {}
    for b, (eb_raw, sb_raw) in bands.items():
        okb = sb_raw >= SUPPORT_REL * np.median(sb_raw)
        lvl = float(np.median(eb_raw[okb])) if okb.any() else C
        out['band_lvl'][b] = (wrap(eb_raw - lvl, gU), sb_raw > 0.05 * np.median(sb_raw))

    def confirm(i0, i1, dev_fn, size):
        """How many bands see the same deviation (same sign, within 25 ms or 40 %), at the worst bar of the run."""
        agree, seen = 0, 0
        if abs(size) > 0.4 * unit[i0]:
            # method 2 (no folding, +-half a unit) cannot represent a shift this big: it neither confirms nor denies
            return 0, 0
        for b, (eb, sb, gb, Tb, Cb) in band_T.items():
            vals = []
            for i in range(i0, i1 + 1):
                if gb[i] and np.isfinite(Tb[i]):
                    vals.append(dev_fn(b, i, eb, Tb, Cb))
            if not vals:
                continue
            seen += 1
            v = vals[int(np.argmax(np.abs(vals)))] if size != 0 else 0.0
            u = unit[i0]
            v = (v - size + u / 2) % u - u / 2 + size
            # the same direction and a comparable size: a band's own least squares (four teeth a bar, Huber at
            # 40 ms) tends to under-read a moved bar line, so under-reading down to 40 % still agrees
            if (size == 0 and abs(v) <= 0.025) or (size != 0 and np.sign(v) == np.sign(size) and
                                                   0.4 * abs(size) <= abs(v) <= 2 * abs(size) + 0.025):
                agree += 1
        return agree, seen

    cands = []
    if abs(C - ONSET_BIAS) > CONST_MIN and not drift:
        ag, se = confirm(0, n - 1, lambda b, i, eb, Tb, Cb: Cb - ONSET_BIAS, C - ONSET_BIAS)
        cands.append({'kind': 'constant', 'i0': 0, 'i1': n - 2, 'peak': int(gi[0]), 'size': C - ONSET_BIAS,
                      'bands': (ag, se)})
    if drift:
        q = beat / 4.0
        past = np.where(good & (np.abs(line - ONSET_BIAS) > q))[0]
        k = int(past[0]) if len(past) else int(gi[-1])
        end_worse = abs(line[gi[-1]] - ONSET_BIAS) >= abs(line[gi[0]] - ONSET_BIAS)
        worst = float((line[gi[-1]] if end_worse else line[gi[0]]) - ONSET_BIAS)
        ag, se = confirm(gi[0], gi[-1], lambda b, i, eb, Tb, Cb: 0.0, 0.0)
        bl = []
        for b, (eb, sb, gb, Tb, Cb) in band_T.items():
            if gb.sum() > 8:
                cb = robust_line(tt[gb] / 60.0, eb[gb], np.ones(gb.sum()))
                bl.append(cb[1])
        ag = sum(1 for s in bl if np.sign(s) == np.sign(coef[1]) and abs(s - coef[1]) <= 0.4 * abs(coef[1]))
        cands.append({'kind': 'drift', 'i0': int(gi[0]), 'i1': int(gi[-1]), 'peak': k, 'size': worst,
                      'worst_end': 'end' if end_worse else 'start',
                      'quarter_at': int(past[0]) if len(past) else None, 'per_min': float(coef[1]),
                      'bands': (ag, len(bl))})
    dev = e - T
    flag = good & np.isfinite(T) & (np.abs(dev) > thr_local)
    for i0, i1 in runs(flag, gap=1):
        seg = np.arange(i0, i1 + 1)
        pk = int(seg[np.argmax(np.abs(np.where(good[seg], dev[seg], 0)))])
        size = float(dev[pk])
        ag, se = confirm(pk, pk, lambda b, i, eb, Tb, Cb: eb[i] - Tb[i], size)
        cands.append({'kind': 'local', 'i0': i0, 'i1': i1, 'peak': pk, 'size': size, 'bands': (ag, se)})
    if not drift:
        sdev = T - model
        sflag = good & np.isfinite(T) & (np.abs(sdev) > thr_sec)
        for i0, i1 in runs(sflag, gap=2):
            if i1 - i0 + 1 < 4:
                continue
            seg = np.arange(i0, i1 + 1)
            pk = int(seg[np.argmax(np.abs(np.where(good[seg], sdev[seg], 0)))])
            size = float(np.median(sdev[seg][good[seg]]))
            ag, se = confirm(i0, i1, lambda b, i, eb, Tb, Cb: Tb[i] - Cb, size)
            cands.append({'kind': 'section', 'i0': i0, 'i1': i1, 'peak': pk, 'size': size, 'bands': (ag, se)})
    out['cands'] = cands
    return out


def downbeat_judgment(a, E, G, bpb, C):
    """Which grid unit of the bar do the chords change on? Mid-register chroma averaged over one counted beat before
    and after each unit (map + the file's constant offset); novelty = 1 - cosine. Plus the low band's onset there.
    Returns per-unit novelty, the best unit, the ratio best / unit 0, and how many of the song's quarters agree."""
    ch = a['chroma_mid']
    if len(ch) < 4 or len(E) < 9:
        return None
    ft = (np.arange(len(ch)) * 1024 + 2048) / SR
    cs = np.vstack([np.zeros((1, 12)), np.cumsum(ch, 0)])

    def mean_ch(t0, t1):
        i0 = np.clip(np.searchsorted(ft, t0), 0, len(ch))
        i1 = np.clip(np.searchsorted(ft, t1), 0, len(ch))
        i1 = np.maximum(i1, i0 + 1)
        i1 = np.minimum(i1, len(ch))
        i0 = np.minimum(i0, i1 - 1)
        return (cs[i1] - cs[i0]) / (i1 - i0)[:, None]

    nb = len(E) - 1
    bar = np.diff(E)
    nov = np.zeros((nb, G))
    low = np.zeros((nb, G))
    for j in range(G):
        tau = E[:-1] + bar * j / G + C
        bl = bar / bpb
        A = mean_ch(tau - bl, tau)
        B = mean_ch(tau, tau + bl)
        na = np.linalg.norm(A, axis=1) * np.linalg.norm(B, axis=1) + 1e-12
        nov[:, j] = 1.0 - (A * B).sum(1) / na
        low[:, j] = interp_env(a['low'], tau)
    energy = np.array([np.sum(mean_ch(E[i:i + 1], E[i + 1:i + 2])) for i in range(nb)])
    ok = energy > 0.05 * np.median(energy)
    if ok.sum() < 8:
        return None
    mn = nov[ok].mean(0)
    best = int(np.argmax(mn))
    q = np.array_split(np.where(ok)[0], 4)
    agree = sum(1 for qq in q if len(qq) and int(np.argmax(nov[qq].mean(0))) == best)
    return {'nov': mn, 'low': low[ok].mean(0), 'best': best, 'ratio': float(mn[best] / max(mn[0], 1e-9)),
            'quarters': agree}


def pattern_check(a, E, G, good):
    """Does each map bar hold ONE of the record's bars? The bar's onset pattern (8 points a unit, three bands) is
    compared with the song's typical bar (the median over the measured bars): r1 = as mapped, r2 = the bar read as
    TWO bars (each half against the typical bar). A bar that matches much better as two is a bar the map has
    swallowed (a dropped barTimes entry); a pair of map bars that match better as one is a doubled one."""
    nb = len(E) - 1
    NB = 8 * G

    def vec(t0, t1, k=1):
        tt = t0 + (t1 - t0) * ((np.arange(NB * k) + 0.5) / (NB * k))
        return np.concatenate([interp_env(a[b], tt) for b in ('low', 'mid', 'high')]).reshape(3, NB * k)

    V = np.stack([vec(E[i], E[i + 1]) for i in range(nb)])
    gb = good[:nb] & good[1:nb + 1]
    if gb.sum() < 8:
        return []
    tmpl = np.median(V[gb], 0)

    def corr(x, y):
        x = x.ravel() - x.mean()
        y = y.ravel() - y.mean()
        return float(x @ y / (np.linalg.norm(x) * np.linalg.norm(y) + 1e-12))

    r1 = np.array([corr(V[i], tmpl) for i in range(nb)])
    typ = np.median(r1[gb])
    out = []
    bl = np.diff(E)
    near = np.array([np.median(np.concatenate([bl[max(0, i - 4):i], bl[i + 1:i + 5]])) for i in range(nb)])
    short = set()
    for i in range(nb):
        # review R1-4: a bar of zero length, or under half its neighbours, is listed from the data alone (a doubled
        # or mistyped barTimes entry); no listening can be better evidence than the arithmetic
        if bl[i] <= 0 or bl[i] < 0.5 * near[i]:
            short.add(i)
            out.append({'kind': 'pattern', 'i0': i, 'i1': i, 'peak': i, 'size': 0.0, 'what': 'short',
                        'len': float(bl[i]), 'near': float(near[i])})
    for i in range(nb):
        if i in short or i + 1 in short or i - 1 in short:
            continue
        # only a bar the MAP draws much longer than its neighbours is read as two (the audio test alone, on every
        # bar, mistakes half a rock bar for a whole one too often)
        if bl[i] < 1.5 * near[i]:
            continue
        v2 = vec(E[i], E[i + 1], 2)
        r2 = 0.5 * (corr(v2[:, :NB], tmpl) + corr(v2[:, NB:], tmpl))
        if r2 > 0.5 * typ and r2 - r1[i] > 0.25:
            out.append({'kind': 'pattern', 'i0': i, 'i1': i, 'peak': i, 'size': 0.0, 'what': 'two',
                        'r1': float(r1[i]), 'r2': float(r2), 'typ': float(typ)})
    for i in range(nb - 1):
        if bl[i] + bl[i + 1] > 1.5 * near[i] or i in short or i + 1 in short:
            continue
        tt = vec(E[i], E[i + 2])
        r = corr(tt, tmpl)
        if r > 0.5 * typ and r - max(r1[i], r1[i + 1]) > 0.25:
            out.append({'kind': 'pattern', 'i0': i, 'i1': i + 1, 'peak': i, 'size': 0.0, 'what': 'half',
                        'r1': float(max(r1[i], r1[i + 1])), 'r2': float(r), 'typ': float(typ)})
    return out


# ── one track: every file, then the comparisons between files ──
ROLES = (('fast', 'src', False), ('slow', 'srcSlow', True), ('full fast', 'srcFull', False), ('full slow', 'srcFullSlow', True))


def fmt_t(sec):
    sec = max(0.0, sec)
    m = int(sec // 60)
    return '%d:%04.1f' % (m, sec - 60 * m)


def card_index(cards, slug):
    out = []
    for c in cards:
        if c['track'] != slug:
            continue
        name = c['id'] + (' (%s)' % c['version'] if c['version'] else '')
        for s in c['sections']:
            out.append((s['fromBar'], s['fromBar'] + s['bars'] * s['reps'] - 1, name, s['label']))
    return out


def where_in_cards(idx, bar):
    hits = {}
    for b0, b1, name, label in idx:
        if b0 <= bar <= b1:
            hits.setdefault(label, []).append(name)
    if not hits:
        return 'no card plays this bar'
    parts = ['%s "%s"' % ('/'.join(v), k) for k, v in sorted(hits.items(), key=lambda kv: (kv[1][0], kv[0]))]
    return '; '.join(parts[:3]) + (' (+%d more)' % (len(parts) - 3) if len(parts) > 3 else '')


_LISTS = {}


def audio_path(root, rel):
    """The file a track path names: <root>/<rel> for a public one; for 'private:<id>' the private folder's copy when
    it is there and matches the list, None when the folder does not have it. ToolError when it differs, or when
    the id is not on the list."""
    if sf.private_id(rel) is None:
        return os.path.join(root, rel)
    try:
        if root not in _LISTS:
            _LISTS[root] = sf.read_song_files(root)
        r = sf.resolve_audio(root, rel, lst=_LISTS[root])
    except sf.SongFilesError as ex:
        raise ToolError(str(ex))
    return str(r['file']) if r['file'] else None


def absent_skip(root, rel):
    """The 'not measured' reason for a private file the folder does not have."""
    e = _LISTS[root][sf.private_id(rel)]
    return 'not in the private folder %s; the list: %d bytes, %.1f s' % (sf.song_files_dir(), e['bytes'], e['durationSec'])


def audit_track(slug, tr, cards, root, opts, breaks=(), override_E=None):
    files = []
    for role, key, slow in ROLES:
        if tr.get(key):
            files.append((role, tr[key], slow))
    if opts.get('file'):
        want = os.path.abspath(opts['file'])
        files = [f for f in files if os.path.abspath(audio_path(root, f[1]) or f[1]) == want]
    absent = [f for f in files if audio_path(root, f[1]) is None]
    files = [f for f in files if f not in absent]
    scale_slow = tr['trackBpm'] / tr['trackBpmSlow']
    G, bpb, ppb = units_per_bar(tr)
    beat_fast = 60.0 / tr['feltBpm']
    res = {'slug': slug, 'G': G, 'bpb': bpb, 'files': [], 'groups': [], 'xcorr': [], 'downbeat': [],
           'played': set(b for b0, b1, _, _ in card_index(cards, slug) for b in range(b0, b1 + 1)), 'breaks': breaks}
    for role, rel, slow in absent:
        res['files'].append({'role': role, 'rel': rel, 'scale': scale_slow if slow else 1.0, 'skip': absent_skip(root, rel)})
    fast_dur = None
    A = {}
    for role, rel, slow in files:
        path = audio_path(root, rel)
        if not os.path.exists(path):
            raise ToolError('missing audio file: ' + rel)
        progress('%s %s' % (slug, role))
        a = opts['analyse'](path)
        A[role] = a
        dur = float(a['duration'])
        if fast_dur is None:
            fast_dur = dur / scale_slow if slow else dur
    for role, rel, slow in files:
        a = A[role]
        scale = scale_slow if slow else 1.0
        if override_E is not None:
            E0, mapped = override_E, True
        else:
            E0, mapped = fast_bar_lines(tr, fast_dur)
        E = E0 * scale
        dur = float(a['duration'])
        keep = np.where(E <= dur + 1e-6)[0]
        E = E[:keep[-1] + 1] if len(keep) else E[:1]
        if len(E) < 10:
            res['files'].append({'role': role, 'rel': rel, 'scale': scale, 'skip': 'fewer than 9 bars inside the file'})
            continue
        m = measure_map(a, E, G, breaks, steady=not mapped, bpb=bpb)
        j = judge_file(m, beat_fast * scale)
        db = downbeat_judgment(a, E, G, bpb, j['C'] if np.isfinite(j['C']) else 0.0)
        pat = pattern_check(a, E, G, j['good']) if not j['cannot'] else []
        res['files'].append({'role': role, 'rel': rel, 'scale': scale, 'm': m, 'j': j, 'db': db, 'pat': pat,
                             'beat': beat_fast * scale, 'mapped': mapped})
    # the scaling rule on onsets alone, and the two mixes of one take
    for fr, sr_ in (('fast', 'slow'), ('full fast', 'full slow')):
        if fr in A and sr_ in A:
            dur_f = float(A[fr]['duration'])
            ratio, lag0, rr = best_ratio(A[fr]['all'], A[sr_]['all'], scale_slow, dur_f)
            rows = window_lags(A[fr]['all'], A[sr_]['all'], ratio, 2.0, dur_f - 2.0, 0.12)
            res['xcorr'].append({'kind': 'slow-onsets', 'a': fr, 'b': sr_, 'rows': rows, 'scale': scale_slow,
                                 'ratio': ratio, 'ratio_corr': rr, 'dur_fast': dur_f, 'beat_slow': beat_fast * scale_slow})
    for fr, sr_, sc in (('fast', 'full fast', 1.0), ('slow', 'full slow', 1.0)):
        if fr in A and sr_ in A:
            rows = window_lags(A[fr]['all'], A[sr_]['all'], 1.0, 2.0, float(A[fr]['duration']) - 2.0, 0.15, track_pred=False)
            res['xcorr'].append({'kind': 'mix', 'a': fr, 'b': sr_, 'rows': rows, 'scale': 1.0})
    group_findings(res)
    return res


def band_verdict(bands):
    ag, se = bands
    if ag >= 2:
        return 'agree'
    if se >= 2 and ag == 0:
        return 'disagree'
    return 'unclear'


def group_findings(res):
    """One finding per (kind, bars) across the files of the track; which are strong: see the rule at the end."""
    items = []
    for fi, f in enumerate(res['files']):
        if 'j' not in f:
            continue
        for c in f['j']['cands'] + f['pat']:
            items.append((fi, c))
    groups = []
    unit_track = next((float(np.median(f['m']['unit'])) for f in res['files'] if 'm' in f and f['scale'] == 1.0), None) \
        or next((float(np.median(f['m']['unit'])) / f['scale'] for f in res['files'] if 'm' in f), 1.0)
    res['unit_fast'] = unit_track

    def halfish(x):
        # half a unit early and half a unit late are the same pulse: such readings group whatever their sign
        return 0.4 <= abs(x) / unit_track <= 0.6
    for fi, c in items:
        sz = c['size'] / res['files'][fi]['scale']
        hit = None
        for g in groups:
            if g['kind'] != c['kind'] or (c['kind'] == 'pattern' and g.get('what') != c.get('what')):
                continue
            if c['i0'] > g['i1'] + 1 or c['i1'] < g['i0'] - 1:
                continue
            if c['kind'] not in ('pattern',) and not (halfish(sz) and halfish(g['size_fast'])) and \
                    (np.sign(sz) != np.sign(g['size_fast']) or
                     abs(sz - g['size_fast']) > max(0.025, 0.4 * abs(g['size_fast']))):
                continue
            hit = g
            break
        if hit is None:
            hit = {'kind': c['kind'], 'what': c.get('what'), 'i0': c['i0'], 'i1': c['i1'], 'size_fast': sz, 'seen': []}
            groups.append(hit)
        hit['i0'] = min(hit['i0'], c['i0'])
        hit['i1'] = max(hit['i1'], c['i1'])
        if abs(sz) > abs(hit['size_fast']):
            hit['size_fast'] = sz
        hit['seen'].append((fi, c))
    for x in res['xcorr']:
        rows = [r for r in x['rows'] if r[2] >= 0.3]
        x['n'] = len(x['rows'])
        x['n_good'] = len(rows)
        if len(rows) < 3:
            x['finding'] = None
            x['stretch'] = None
            continue
        lags = np.array([r[1] for r in rows])
        Ts = np.array([r[0] for r in rows])
        base = float(np.median(lags))
        dev = lags - base
        x['base'] = base
        x['maxdev'] = float(np.max(np.abs(dev)))
        lim = 0.025 if x['kind'] == 'slow-onsets' else 0.015
        k = int(np.argmax(np.abs(dev if x['kind'] == 'slow-onsets' else lags)))
        worst = float(dev[k] if x['kind'] == 'slow-onsets' else lags[k])
        bad = np.abs(dev if x['kind'] == 'slow-onsets' else lags) > lim
        x['finding'] = None
        if x['kind'] == 'mix':
            # the two mixes' offset is the median lag over every clear window (review R1-3); lag < 0 means the
            # same sound comes LATER in the rhythm-down file (x['a']) than in the full mix (x['b'])
            if abs(base) > lim and bad.sum() * 2 >= len(rows):
                x['finding'] = {'size': base, 'lo': float(lags.min()), 'hi': float(lags.max()), 'count': int(bad.sum())}
        elif bad.sum() >= 2:
            first = int(np.where(bad)[0][0])
            x['finding'] = {'T': float(Ts[k]), 'size': worst, 'first_T': float(Ts[first]), 'count': int(bad.sum())}
        if x['kind'] == 'slow-onsets':
            # the stretch itself: the file's real ratio against trackBpm / trackBpmSlow
            gap = x['ratio'] - x['scale']
            total = gap * x['dur_fast']
            x['stretch'] = None
            if abs(total) > 0.025:
                tq = (x['beat_slow'] / 4.0) / abs(gap)
                x['stretch'] = {'size': total, 'quarter_T': tq * x['scale'] if tq < x['dur_fast'] else None}
    res['groups'] = groups
    measured = [fi for fi, f in enumerate(res['files']) if 'j' in f and not f['j']['cannot']]
    slow_clean = [x for x in res['xcorr'] if x['kind'] == 'slow-onsets']

    def file_value(fi, g, i):
        """What another file says at this group's bar, in fast-file seconds (None when it cannot tell there)."""
        f = res['files'][fi]
        j, m = f['j'], f['m']
        if i >= len(j['good']) or not j['good'][i]:
            return None
        if g['kind'] == 'local':
            v = m['e'][i] - j['T'][i] if np.isfinite(j['T'][i]) else None
        elif g['kind'] == 'section':
            seg = [k for k in range(g['i0'], min(g['i1'] + 1, len(j['good']))) if j['good'][k] and np.isfinite(j['T'][k])]
            v = float(np.median([j['T'][k] - j['C'] for k in seg])) if seg else None
        elif g['kind'] == 'constant':
            v = j['C'] - ONSET_BIAS
        elif g['kind'] == 'drift':
            return j.get('drift_per_min')
        else:
            return None
        return None if v is None else v / f['scale']

    for g in groups:
        fis = sorted(set(fi for fi, c in g['seen']))
        # one verdict per FILE (review R2-11): a file's best reading among its candidates in this group
        per_file = {}
        for fi, c in g['seen']:
            if 'bands' in c:
                v = band_verdict(c['bands'])
                old = per_file.get(fi)
                rank = {'agree': 2, 'unclear': 1, 'disagree': 0}
                if old is None or rank[v] > rank[old]:
                    per_file[fi] = v
        verdicts = [per_file[fi] for fi in sorted(per_file)]
        n_agree = sum(1 for v in verdicts if v == 'agree')
        n_dis = sum(1 for v in verdicts if v == 'disagree')
        big = max(g['seen'], key=lambda fc: abs(fc[1]['size']))[1]
        ref = big.get('per_min', g['size_fast']) if g['kind'] == 'drift' else g['size_fast']
        support, contra = [], []
        if g['kind'] in ('local', 'section', 'constant', 'drift'):
            for fi in measured:
                if fi in fis:
                    continue
                v = file_value(fi, g, big['peak'])
                if v is None:
                    continue
                # a file counts for a finding only over ITS OWN threshold (review R1-2: "leaning" at half the size
                # is the same take agreeing with itself, not evidence)
                jf = res['files'][fi]['j']
                sc = res['files'][fi]['scale']
                own = {'local': jf['thr_local'] / sc, 'section': jf['thr_local'] / sc, 'constant': CONST_MIN,
                       'drift': 0.0}[g['kind']]
                same = halfish(v) and halfish(ref) or np.sign(v) == np.sign(ref)
                if g['kind'] == 'drift':
                    ok = jf.get('drift') and np.sign(v) == np.sign(ref)
                else:
                    ok = same and abs(v) > own
                if ok:
                    support.append(fi)
                elif not same or abs(v) < 0.5 * abs(ref):
                    contra.append(fi)
        g['files'] = fis
        g['support'] = support
        g['contra'] = contra
        g['verdicts'] = verdicts
        g['note'] = ''
        slow_only = all(res['files'][fi]['scale'] != 1.0 for fi in fis + support) and any(
            res['files'][fi]['scale'] == 1.0 for fi in measured)
        span = range(g['i0'], g['i1'] + 1)
        fixed_here = [fi for fi in measured if any(i < len(res['files'][fi]['m']['fixed_mask']) and
                                                   res['files'][fi]['m']['fixed_mask'][i] for i in span)]
        if slow_only and g['kind'] in ('drift', 'local', 'section', 'constant'):
            g['kind_shown'] = 'slow ' + g['kind']
            fast_fixed = [fi for fi in fixed_here if res['files'][fi]['scale'] == 1.0]
            if fast_fixed:
                # review R2-2: the fast file had this stretch "put back"; the slow file is then the witness, not a quirk
                g['note'] = 'the record-tempo file had these bars put back after a slip, so the slow file is not dismissed'
            elif (any(res['files'][fi]['scale'] == 1.0 for fi in measured) and
                  all(sum(1 for i in span if i < len(res['files'][fi]['j']['good']) and not res['files'][fi]['j']['good'][i])
                      * 2 >= len(span) for fi in measured if res['files'][fi]['scale'] == 1.0)):
                # review R3-6: NO record-tempo file can tell here, so the slow file is not dismissed as a quirk.
                # Every one of them, not any one (Fable check F-1, 2026-11-12): when another record-tempo file measures
                # the bar on the map, the slow-only finding is still a quirk and must not reach THE LIST.
                g['note'] = 'no record-tempo file can tell here, so the slow file is not dismissed'
            elif slow_clean and all(x.get('n_good', 0) >= 3 and not x.get('finding') and not x.get('stretch') for x in slow_clean):
                # the onsets test (no map, no tracker) says the slow file IS the fast one scaled, here as everywhere
                contra = contra + ['onsets']
                g['contra'] = contra
                g['note'] = 'the onsets-only test finds the slow file is the fast one scaled here: a measuring quirk of the slow file'
        else:
            g['kind_shown'] = g['kind']
        # STRONG (review R1-2): the files of one take are ONE method. A second method is the bands: at least two
        # files whose bands agree (2 of 3 each). Where the bands cannot represent the shift (over 0.4 unit) the
        # rule is two files over their own thresholds. Never against more files than see it, never when the bands
        # disagree in more than half of them, and never a slow-only finding the onsets test explains.
        unit_f = next((float(np.median(f['m']['unit'])) for f in res['files'] if 'm' in f and f['scale'] == 1.0),
                      None) or float(np.median(res['files'][fis[0]]['m']['unit'])) / res['files'][fis[0]]['scale']
        g['blind'] = g['kind'] in ('local', 'section', 'constant') and abs(g['size_fast']) > 0.4 * unit_f
        nfiles = len(fis) + len(support)
        frac = abs(g['size_fast']) / unit_f
        second = n_agree >= 2
        if g['blind']:
            # review R2-1: over 0.4 unit the agree/disagree test cannot work, but the bands still READ the bar. A
            # shift near half a unit (0.4-0.6) is strong only when the bands of at least 2 files also read it 0.3
            # unit or more off; else it may be method 1 folded onto the eighth between two beats. Over 0.6 unit,
            # two files over their thresholds. Never when a file had these bars put back after a slip.
            off_files = bands_off_files(res, measured, g, big, unit_f)
            if fixed_here:
                second = False
                g['note'] = (g['note'] + '; ' if g['note'] else '') + \
                    'a file had these bars put back after a slip: possibly half a beat folded, listen'
            elif frac <= 0.6:
                second = off_files >= 2
                if not second:
                    g['note'] = (g['note'] + '; ' if g['note'] else '') + \
                        'possible half-beat fold: the bands read the record on the map here (%d file(s) read it off)' % off_files
            else:
                second = nfiles >= 2
        g['strong'] = second and n_dis * 2 <= len(verdicts) and nfiles > len(contra) and 'onsets' not in contra
        if g['strong'] and g['kind'] == 'local' and not g['blind'] and playing_feel(res, g):
            g['strong'] = False
            g['note'] = (g['note'] + '; ' if g['note'] else '') + \
                'the low band (kick, bass) sits on the map while mid and high are off: probably playing feel, listen'
        if g['kind'] == 'pattern':
            g['strong'] = len(fis) >= 2 or g.get('what') == 'short'
    rescue_pass(res, measured)
    return res


def bands_off_files(res, measured, g, big, unit_f):
    """How many files have 2 or more bands reading this group's bar (or span, or whole map) 0.3 unit or more off,
    the bands' own readings wrapped into +-half a unit (review R2-1)."""
    n = 0
    for fi in measured:
        f = res['files'][fi]
        j = f['j']
        u = unit_f * f['scale']
        k = 0
        for b in ('low', 'mid', 'high'):
            if g['kind'] == 'constant':
                v = j['band_C'].get(b)
            else:
                if g['kind'] == 'section':
                    # a section moves the trend with it, so its bands are read against the file's level
                    dev, ok = j['band_lvl'][b]
                    idx = [i for i in range(g['i0'], g['i1'] + 1) if i < len(dev) and ok[i]]
                else:
                    dev, ok = j['band_dev'][b]
                    idx = [big['peak']] if big['peak'] < len(dev) and ok[big['peak']] else []
                v = float(np.median(np.abs(dev[idx]))) if idx else None
            if v is not None and abs(v) >= 0.3 * u:
                k += 1
        n += k >= 2
    return n


def playing_feel(res, g):
    """Review R2-8: a single bar where the low band (kick, bass) sits on the map while mid and high read the shift is
    the band's feel at that spot (the guitar ahead of the kick), not a map line. Round 3: the vote is among EVERY
    measured file that reads the bar with all three bands, not only the files that have a candidate there, so a
    fault elsewhere cannot flip it."""
    votes = n = 0
    i = max(g['seen'], key=lambda fc: abs(fc[1]['size']))[1]['peak']
    for f in res['files']:
        if 'j' not in f or f['j'].get('cannot'):
            continue
        bd = f['j']['band_dev']
        if any(i >= len(bd[b][0]) or not bd[b][1][i] or not bd[b][1].any() for b in bd):
            continue
        size = g['size_fast'] * f['scale']
        vals = {b: bd[b][0][i] - float(np.median(bd[b][0][bd[b][1]])) for b in bd}
        low, mid, high = vals['low'], vals['mid'], vals['high']
        n += 1
        if abs(low) < 0.4 * abs(size) and np.sign(mid) == np.sign(size) and np.sign(high) == np.sign(size) and \
                min(abs(mid), abs(high)) >= 0.5 * abs(size):
            votes += 1
    return n > 0 and votes * 2 > n


FAR_MIN = 0.080
FAR_BANDS = 2         # bands that must agree for a file to count by its bands
FAR_NEED_M1 = True    # at least one file must read the bar by method 1 (bands alone, in every file, listed 9 bars of
                      # the clean library, 4 of them on the confirmed Hendrix map)
PROOF = ('in the 2026-11-12 plants, the counted lists caught 7 of 12 planted 150-250 ms bar-line faults (6 of 10 at 150 ms, 1 of 2 at 250 ms) in '
         '"cannot tell" bars (a dated test result, not a measurement of this run)')
UNDER_READ = 0.75     # method 1 reads a planted bar-line shift at about 75 % of its size (review R2-5: SNA 150 -> 112,
                      # Manianitas 100 -> 71-77, Hendrix 150 -> 99); "catches about" divides the threshold by it
FAR_MIN_TWO = 0.120   # a track with only two files (one record, two tempos): one take twice, so a higher floor
FAR_K = 1.5          # x the file's own catch threshold (2 lost Hendrix bar 67 +150 ms in its solo: 95 ms vs 110)


def rescue_pass(res, measured):
    """The second pass over the bar lines the first pass calls "cannot tell" (review R1-1: a 150 ms fault in a loud
    chorus was measured right in all four files and thrown away for low support). A bar line inside a card's
    sections, "cannot tell" in at least one file and in no finding yet, is listed when at least 3 files (or every
    measured file) read it off their own trend by more than max(FAR_MIN, FAR_K x that file's catch threshold), all the
    same sign, the sizes (slow files divided by their scale) within 40 % of each other. A file reads it by method 1,
    or, where method 1 is unsure there, by 2 of its 3 bands past the same limit; at least one file must read it
    by method 1. Adjacent bars make one entry. Only STRONG findings cover bars."""
    covered = set()
    for g in res['groups']:
        # only a STRONG finding covers its bars (review R2-3: a weak one used to hide a fault every file read)
        if g.get('strong'):
            covered.update(range(g['i0'] - 1, g['i1'] + 2))
    covered.update(b - 1 for (sl, b) in SETTLED if sl == res['slug'])
    played = res.get('played', set())
    res['far'] = []
    if len(measured) < 2:
        return
    n = min(len(res['files'][fi]['m']['e']) for fi in measured)
    for i in range(1, n - 1):
        if (i + 1) not in played or i in covered:
            continue
        if all(res['files'][fi]['j']['good'][i] for fi in measured):
            continue
        vals = []
        how = {}
        for fi in measured:
            f = res['files'][fi]
            T = f['j']['T']
            floor = FAR_MIN if len(measured) >= 3 else FAR_MIN_TWO
            lim = max(floor, FAR_K * f['j']['thr_local'] / f['scale'])
            if np.isfinite(T[i]) and f['m']['sup'][i] > 0.05:
                d = (f['m']['e'][i] - T[i]) / f['scale']
                if abs(d) > lim:
                    vals.append((fi, d))
                    how[fi] = 'method 1'
                    continue
            # review R2-4: where method 1 under-reads or folds, the file still counts when 2 of its 3 bands read
            # the bar past the same limit, the same way (each band against its own level)
            bd = f['j']['band_dev']
            bvals = []
            for b in ('low', 'mid', 'high'):
                dev, ok = bd[b]
                if i < len(dev) and ok[i] and ok.any():
                    bvals.append((dev[i] - float(np.median(dev[ok]))) / f['scale'])
            if 'no_far_bands' in res.get('breaks', ()):
                continue
            for sg in (1, -1):
                hit = [v for v in bvals if np.sign(v) == sg and abs(v) > lim]
                if len(hit) >= FAR_BANDS:
                    vals.append((fi, float(np.median(hit))))
                    how[fi] = 'bands'
                    break
        need = min(3, len(measured))
        if len(vals) < need:
            continue
        if FAR_NEED_M1 and not any(h == 'method 1' for h in how.values() if h):
            continue
        ds = np.array([d for _, d in vals])
        if not (np.all(ds > 0) or np.all(ds < 0)):
            continue
        if np.min(np.abs(ds)) < 0.6 * np.max(np.abs(ds)):
            continue
        new = {'i': i, 'size': float(np.median(ds)), 'files': [fi for fi, _ in vals], 'how': [how[fi] for fi, _ in vals],
               'last': i, 'first': i}
        prev = res['far'][-1] if res['far'] else None
        if prev is not None and prev['last'] == i - 1 and np.sign(prev['size']) == np.sign(new['size']):
            # one moved bar line ramps through its neighbours: one entry per run, at its largest bar
            prev['last'] = i
            if abs(new['size']) > abs(prev['size']):
                prev.update({k: new[k] for k in ('i', 'size', 'files', 'how')})
            continue
        res['far'].append(new)


# ── words ──
def ms(x):
    return '%+.0f ms' % (1000 * x)


def way(x):
    """e = record minus map: positive = the record's beat comes AFTER the map's, i.e. the map is early."""
    return 'early' if x > 0 else 'late'


def beat_frac(x, beat):
    return '%.2f beat' % (abs(x) / beat)


def describe_group(res, g, idx):
    # described from the record-tempo file when it sees it (its ms are the ones on the fast grid), else the largest
    f0i, c0 = max(g['seen'], key=lambda fc: (res['files'][fc[0]]['scale'] == 1.0, abs(fc[1]['size'])))
    f0 = res['files'][f0i]
    E = f0['m']['E']
    beat = f0['beat']
    bar = c0['peak'] + 1
    tfile = E[min(c0['peak'], len(E) - 1)]
    seen = ', '.join(res['files'][fi]['role'] for fi in g['files'])
    if g.get('support'):
        seen += '; also over its own threshold (no candidate of its own here): ' + ', '.join(res['files'][fi]['role'] for fi in g['support'])
    if g.get('contra'):
        seen += '; NOT in: ' + ', '.join(('onsets test' if fi == 'onsets' else res['files'][fi]['role']) for fi in g['contra'])
    if g.get('note'):
        seen += '; ' + g['note']
    v = g['verdicts']
    conf = 'strong' if g['strong'] else 'weak'
    bands = ', bands ' + '/'.join(v) if v else ''
    kind = g['kind_shown']
    if g['kind'] == 'pattern':
        if g['what'] == 'two':
            what = ('bar %d (map bar %.2f s long) sounds like TWO of the record\'s bars (pattern match %.2f as one bar, '
                    '%.2f as two; typical %.2f): a barTimes entry missing here?' %
                    (bar, E[c0['peak'] + 1] - E[c0['peak']], c0['r1'], c0['r2'], c0['typ']))
        elif g['what'] == 'short':
            what = ('bar %d is %.2f s long in the map, under half its neighbours (%.2f s): a barTimes entry doubled or '
                    'mistyped? (read from the data alone, no listening)' % (bar, c0['len'], c0['near']))
        else:
            what = ('bars %d-%d sound like ONE of the record\'s bars (pattern match %.2f as two bars, %.2f as one; '
                    'typical %.2f): an extra barTimes entry?' % (bar, bar + 1, c0['r1'], c0['r2'], c0['typ']))
        size_ms = 0.0
    elif g['kind'] == 'constant':
        bc = f0['j'].get('band_C', {})
        what = 'the whole map is %s by %s (%s; +-15 ms: the bands read %s): an anchor question' % (
            way(c0['size']), ms(abs(c0['size']))[1:], beat_frac(c0['size'], beat),
            ' / '.join('%s %s' % (b, ms(bc[b])) for b in ('low', 'mid', 'high') if b in bc))
        mix = [x for x in res['xcorr'] if x['kind'] == 'mix' and x.get('finding')]
        if mix:
            # review R1-3: part of a constant can be one mix's own lag against the other; settle that first
            x = next((y for y in mix if y['a'] == f0['role'] or y['b'] == f0['role']), mix[0])
            full = next((ff for ff in res['files'] if ff['role'] == x['b'] and 'j' in ff), None)
            what += ('; SETTLE THE FILE OFFSET FIRST: %s' % mix_words(x))
            if full is not None and np.isfinite(full['j']['C']):
                cf = full['j']['C'] - ONSET_BIAS
                what += ', and against the full mix the map is %s by %s' % (way(cf), ms(abs(cf))[1:])
        b1 = beat1_unit(res)
        if b1 is not None:
            G = res['G']
            off = b1 if b1 <= G // 2 else b1 - G
            tot = c0['size'] + off * beat * res['bpb'] / G
            what += ('; and every file puts the chord changes on unit %d of %d, so the whole shift may be %s %s '
                     '(%s; the units part is the weaker judgment)' % (b1 + 1, G, ms(abs(tot))[1:], way(tot), beat_frac(tot, beat)))
        size_ms = abs(c0['size'])
    elif g['kind'] == 'drift':
        qa = c0.get('quarter_at')
        what = ('the map drifts %+.0f ms a minute against the record, %s %s %s' %
                (1000 * c0['per_min'], ms(abs(c0['size']))[1:], way(c0['size']),
                 'by the end of the file' if c0.get('worst_end', 'end') == 'end' else 'at the START of the file'))
        if qa is not None:
            what += '; it passes a quarter beat at bar %d (%s)' % (qa + 1, fmt_t(E[qa]))
        size_ms = abs(c0['size'])
    elif g['kind'] == 'section':
        what = 'bars %d-%d: the map is %s by about %s (%s) while the rest of the file sits on its constant' % (
            g['i0'] + 1, g['i1'] + 1, way(c0['size']), ms(abs(c0['size']))[1:], beat_frac(c0['size'], beat))
        size_ms = abs(c0['size'])
    else:
        what = 'bar %d%s: %s' % (bar, '' if g['i0'] == g['i1'] else ' (bars %d-%d)' % (g['i0'] + 1, g['i1'] + 1),
                                 bar_words(res, bar, c0['size'], beat))
        size_ms = abs(c0['size'])
    uf = res.get('unit_fast') or 1.0
    if g['kind'] in ('local', 'section', 'constant') and 0.4 <= abs(g['size_fast']) / uf <= 0.6:
        what += ' (half a unit off: "early" or "late" is the same pulse here)'
    if g['kind'] in ('constant', 'drift'):
        # review R1-6: a whole-map finding names no bar
        where = 'whole map in %s' % os.path.basename(f0['rel'])
    else:
        where = 'bar %d at %s in %s · %s' % (bar, fmt_t(tfile), os.path.basename(f0['rel']), where_in_cards(idx, bar))
    line = '%s · %s · %s · %s · %s [%s; seen in: %s%s]' % (res['slug'], kind, where, what, conf, kind, seen, bands)
    return size_ms, line


def bar_words(res, bar, size, beat):
    """Review R2-8: on a steady-grid track there is no bar line to edit (one anchor, one tempo), so the words say what
    the RECORD does at that bar."""
    if any(f.get('mapped') is False for f in res['files'] if 'm' in f):
        return 'the record plays bar %d about %s %s against the steady grid (%s; no number to edit there: listen)' % (
            bar, ms(abs(size))[1:], 'late' if size > 0 else 'early (it pushes)', beat_frac(size, beat))
    return 'the map\'s bar line is %s by about %s (%s) against its neighbours' % (
        way(size), ms(abs(size))[1:], beat_frac(size, beat))


def mix_words(x):
    """Which mix is later, in words. lag < 0: the same sound comes later in x['a'] (the rhythm-down file)."""
    f = x['finding']
    late, early = (x['a'], x['b']) if f['size'] < 0 else (x['b'], x['a'])
    name = {'fast': 'the rhythm-down file', 'slow': 'the slow rhythm-down file', 'full fast': 'the full mix',
            'full slow': 'the slow full mix'}
    return '%s is %.0f ms LATER than %s (median of the clear windows; %.0f to %.0f ms)' % (
        name.get(late, late), 1000 * abs(f['size']), name.get(early, early), 1000 * abs(f['hi'] if f['size'] < 0 else f['lo']),
        1000 * abs(f['lo'] if f['size'] < 0 else f['hi']))


def describe_stretch(res, x):
    st = x['stretch']
    q = (' It passes a quarter beat at %s in the slow file.' % fmt_t(st['quarter_T'])) if st['quarter_T'] is not None else ''
    return abs(st['size']), ('%s · slow stretch · %s is the fast file stretched by %.4f (onsets only, no map), but '
                             'trackBpm/trackBpmSlow says %.4f: the slow grid drifts %s %s over the song.%s' % (
                                 res['slug'], x['b'], x['ratio'], x['scale'], ms(abs(st['size']))[1:],
                                 'early' if st['size'] > 0 else 'late', q))


def describe_xcorr(res, x):
    f = x['finding']
    if x['kind'] == 'slow-onsets':
        return abs(f['size']), ('%s · slow file vs the fast file scaled by trackBpm/trackBpmSlow (%s vs %s, onsets only, no '
                                'map) · from %s in the fast file the slow file sits %s off the scaled grid, worst %s at %s '
                                '(%d of %d windows over 25 ms)' % (
                                    res['slug'], x['b'], x['a'], fmt_t(f['first_T']), 'growing' if f['count'] > 3 else '',
                                    ms(f['size']), fmt_t(f['T']), f['count'], x['n_good']))
    return abs(f['size']), ('%s · full mix vs rhythm-down (%s vs %s, onsets only) · %s; %d of %d clear windows over '
                            '15 ms. Pressing Guitar jumps by that much. (ffmpeg\'s decoding; how a browser trims an mp3\'s '
                            'encoder delay is not modelled.)' % (res['slug'], x['b'], x['a'], mix_words(x), f['count'],
                                                                 x['n_good']))


def file_line(f, played=None):
    if 'skip' in f:
        return '  %-9s %s: not measured (%s)' % (f['role'], os.path.basename(f['rel']), f['skip'])
    j, m = f['j'], f['m']
    nb = j['bars']
    good = j['good']
    bars_ok = int((good[:-1] & good[1:]).sum()) if len(good) > 1 else 0
    if j['cannot']:
        return '  %-9s %s: %d bars, too few with a clear beat to judge' % (f['role'], os.path.basename(f['rel']), nb)
    dev = np.where(good & np.isfinite(j['T']), m['e'] - j['T'], 0.0)
    k = int(np.argmax(np.abs(dev)))
    unclear = [b + 1 for b in range(nb) if not (good[b] and good[b + 1])]
    in_cards = sum(1 for b in unclear if played and b in played)
    bc = j.get('band_C', {})
    s = ('  %-9s %s: %d bars, %d measured, %d cannot tell (%d of them inside card sections: listen to them; ' + PROOF + ') · constant %s +-15 ms (%s %s; bands %s) · scatter %.0f ms · catches about '
         '%.0f ms+ (a planted shift reads about a quarter small) · worst bar %d %s at %s') % (
        f['role'], os.path.basename(f['rel']), nb, bars_ok, nb - bars_ok, in_cards, ms(j['C'] - ONSET_BIAS),
        beat_frac(j['C'] - ONSET_BIAS, f['beat']), 'map ' + way(j['C'] - ONSET_BIAS),
        '/'.join(ms(bc[b]) for b in ('low', 'mid', 'high') if b in bc), 1000 * j['sigma'],
        1000 * j['thr_local'] / UNDER_READ, k + 1, ms(dev[k]), fmt_t(m['E'][k]))
    if m.get('slip_fixed'):
        s += ' · %d bars put back after the following slipped half a unit' % m['slip_fixed']
    if j['drift']:
        s += ' · drift %+.0f ms/min' % (1000 * j['drift_per_min'])
    if m['ambiguous'].any():
        s += ' · %d bars where the accents sit between two units (cannot tell which is the beat)' % int(m['ambiguous'].sum())
    if f['db']:
        s += ' · chords change most on unit %d of %d' % (f['db']['best'] + 1, len(f['db']['nov']))
    return s


def downbeat_lines(res):
    """Beat 1: a separate, weaker judgment. Listed when every measured file of the track puts the chord changes on
    the same unit other than the map's first, by 15 %+ and in 3 of 4 quarters of the song."""
    b = beat1_unit(res)
    if b is None:
        return []
    dbs = [(f['role'], f['db']) for f in res['files'] if f.get('db')]
    if min(d['ratio'] for _, d in dbs) < 1.15:
        return []
    G = res['G']
    f = next(ff for ff in res['files'] if ff.get('db'))
    unit = f['beat'] * res['bpb'] / G
    off = b if b <= G // 2 else b - G
    conf = 'higher' if all(d['quarters'] >= 3 for _, d in dbs) else 'low'
    if 2 * abs(off) == G:
        which = 'half a bar off (early or late: the same either way)'
    else:
        which = '%s' % ('early' if off > 0 else 'late')
    return ['%s · beat 1 (weaker judgment, confidence %s) · in all %d files the chords change most on unit %d of the '
            'map\'s %d (%.2fx unit 1 at the least; quarters of the song agreeing: %s): the map\'s "1" may be %d unit(s) '
            '(%.0f ms, %.2f beat) %s' % (
                res['slug'], conf, len(dbs), b + 1, G, min(d['ratio'] for _, d in dbs),
                '/'.join('%d of 4' % d['quarters'] for _, d in dbs), abs(off), 1000 * abs(off) * unit,
                abs(off) * unit / f['beat'], which)]


def beat1_unit(res):
    """The unit every measured file puts the chord changes on, when they all agree and it is not the map's first."""
    dbs = [f['db'] for f in res['files'] if f.get('db')]
    if not dbs:
        return None
    bests = set(d['best'] for d in dbs)
    if len(bests) != 1 or 0 in bests:
        return None
    return bests.pop()


def main(argv):
    global WD
    ap = argparse.ArgumentParser(description='List where the beat map (and the chart) disagree with the record.')
    ap.add_argument('--only', help='one track slug (a SNIPPET_TRACKS key)')
    ap.add_argument('--file', help='one audio file (path); its track is audited on that file only')
    ap.add_argument('--json', help='write every number to this file')
    ap.add_argument('--verbose', action='store_true', help='per-bar numbers')
    ap.add_argument('--root', default=os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                    help='site folder to read app/snippets.js, class-activities.js and audio/ from')
    ap.add_argument('--stage', default='1,2', help='1, 2 or 1,2 (default)')
    ap.add_argument('--cache', help='folder for decoded-audio analyses, keyed by file hash (never inside the repo)')
    ap.add_argument('--self-test', action='store_true', help='run the fake world instead of the site')
    ap.add_argument('--break', dest='breaks', default='', help='self-test only: break the detector on purpose')
    ap.add_argument('--resolution', action='store_true', help='plant shifts in memory and find the smallest caught')
    ap.add_argument('--watchdog', type=float, default=120.0, help=argparse.SUPPRESS)
    args = ap.parse_args(argv)
    WD = Watchdog(args.watchdog)
    t_start = time.monotonic()
    breaks = tuple(b for b in args.breaks.split(',') if b)
    try:
        if subprocess.run(['ffmpeg', '-version'], capture_output=True).returncode != 0:
            raise ToolError('ffmpeg not found')
    except FileNotFoundError:
        print('beat-audit: ✗ ffmpeg not found on PATH', file=sys.stderr)
        return 2
    if args.self_test:
        return self_test(breaks)
    try:
        site = load_site(args.root)
    except (ToolError, OSError, ValueError) as ex:
        print('beat-audit: ✗ %s' % ex, file=sys.stderr)
        return 2
    cache = os.path.abspath(args.cache) if args.cache else None
    if cache and cache.startswith(os.path.abspath(args.root) + os.sep):
        print('beat-audit: ✗ --cache must be outside the site folder', file=sys.stderr)
        return 2
    opts = {'analyse': lambda p: analyse_audio(p, cache), 'file': args.file}
    tracks = site['tracks']
    slugs = sorted(tracks)
    if args.only:
        if args.only not in tracks:
            print('beat-audit: ✗ no track %r (have: %s)' % (args.only, ', '.join(slugs)), file=sys.stderr)
            return 2
        slugs = [args.only]
    if args.file:
        want = os.path.abspath(args.file)
        try:
            slugs = [s for s in slugs if any(tracks[s].get(k) and os.path.abspath(audio_path(args.root, tracks[s][k]) or tracks[s][k]) == want
                                             for _, k, _ in ROLES)]
        except ToolError as ex:
            print('beat-audit: ✗ %s' % ex, file=sys.stderr)
            return 2
        if not slugs:
            print('beat-audit: ✗ %s is not a file of any SNIPPET_TRACKS entry' % args.file, file=sys.stderr)
            return 2
    stages = set(args.stage.replace(' ', '').split(','))
    if args.resolution:
        try:
            return resolution_sweep(site, slugs, args.root, opts)
        except ToolError as ex:
            print('beat-audit: ✗ %s' % ex, file=sys.stderr)
            return 2
    results = []
    try:
        for slug in slugs:
            r = audit_track(slug, tracks[slug], site['cards'], args.root, opts)
            if '2' in stages:
                r['stage2'] = stage2_track(slug, tracks[slug], site['cards'], r, opts, args.root)
            results.append(r)
    except ToolError as ex:
        print('beat-audit: ✗ %s' % ex, file=sys.stderr)
        return 2
    return report(results, site, args, stages, time.monotonic() - t_start)


def report(results, site, args, stages, elapsed):
    strong, weak, beat1, cannot, outside, settled, far = [], [], [], [], [], [], []
    p1 = print if '1' in stages else (lambda *x, **k: None)
    n_files = n_bars = n_cannot = 0
    by_kind = {}
    p1('beat-audit: stage 1, the beat map against the record (%d track%s)' % (len(results), '' if len(results) == 1 else 's'))
    for r in results:
        idx = card_index(site['cards'], r['slug'])
        p1('%s (grid: %d units a bar, %d counted beats)' % (r['slug'], r['G'], r['bpb']))
        for f in r['files']:
            p1(file_line(f, r.get('played')))
            if 'j' in f:
                n_files += 1
                g = f['j']['good']
                nb = f['j']['bars']
                ok = int((g[:-1] & g[1:]).sum())
                n_bars += nb
                n_cannot += nb - ok
                if nb - ok:
                    bad = np.where(~(g[:-1] & g[1:]))[0]
                    spans = runs(np.isin(np.arange(nb), bad), gap=0)
                    cannot.append('%s %s: %s' % (r['slug'], f['role'], ', '.join(
                        ('bar %d' % (a + 1) if a == b else 'bars %d-%d' % (a + 1, b + 1)) for a, b in spans)))
                if args.verbose:
                    m, j = f['m'], f['j']
                    for i in range(len(m['e'])):
                        bv = ' '.join('%s %s' % (b[0], ms(m['bands'][b][0][i])) for b in ('low', 'mid', 'high'))
                        p1('      bar %3d %s map %s record-minus-map %s trend %s support %.2f%s · %s' % (
                            i + 1, fmt_t(m['E'][i]), '%.3f' % m['E'][i], ms(m['e'][i]),
                            ms(j['T'][i]) if np.isfinite(j['T'][i]) else '   -', m['sup'][i],
                            '' if j['good'][i] else ' (cannot tell)', bv))
        for x in r['xcorr']:
            if x['n_good'] >= 3:
                p1('  %-9s %s vs %s, onsets only: %d windows, %d clear, base lag %s, largest move %s' % (
                    x['kind'], x['b'], x['a'], x['n'], x['n_good'], ms(x['base']), ms(x['maxdev'])))
            else:
                p1('  %-9s %s vs %s, onsets only: too few clear windows (%d of %d)' % (x['kind'], x['b'], x['a'], x['n_good'], x['n']))
        for g in r['groups']:
            size, line = describe_group(r, g, idx)
            bars = range(g['i0'] + 1, g['i1'] + 2)
            why = next((w for (sl, b), w in SETTLED.items() if sl == r['slug'] and b in bars and g['kind'] in ('local', 'pattern')), None)
            if why:
                settled.append(line + ' -- SETTLED: ' + why)
                by_kind['settled'] = by_kind.get('settled', 0) + 1
                continue
            played = sum(1 for b in bars if where_in_cards(idx, b) != 'no card plays this bar')
            if g['kind'] != 'constant' and g['kind'] != 'drift' and played * 2 < len(bars):
                outside.append((size, line))
                by_kind['outside cards'] = by_kind.get('outside cards', 0) + 1
                continue
            (strong if g['strong'] else weak).append((size, line))
            k = g['kind_shown'] + ('' if g['strong'] else ' (weak)')
            by_kind[k] = by_kind.get(k, 0) + 1
        for x in r['xcorr']:
            if x.get('stretch'):
                size, line = describe_stretch(r, x)
                others = [y for y in r['xcorr'] if y is not x and y.get('stretch')]
                slow_groups = [g for g in r['groups'] if g['kind_shown'].startswith('slow ')]
                ok = bool(others) or bool(slow_groups)
                (strong if ok else weak).append((size, line + (' [strong]' if ok else ' [weak: one pair only]')))
                k = 'slow stretch' + ('' if ok else ' (weak)')
                by_kind[k] = by_kind.get(k, 0) + 1
            if x.get('finding'):
                size, line = describe_xcorr(r, x)
                others = [y for y in r['xcorr'] if y is not x and y['kind'] == x['kind'] and y.get('finding')]
                slow_groups = [g for g in r['groups'] if g['kind_shown'].startswith('slow ')]
                ok = bool(others) or (x['kind'] == 'slow-onsets' and bool(slow_groups))
                (strong if ok else weak).append((size, line + (' [strong]' if ok else ' [weak: one pair only]')))
                k = x['kind'] + ('' if ok else ' (weak)')
                by_kind[k] = by_kind.get(k, 0) + 1
        for line in downbeat_lines(r):
            beat1.append(line)
            by_kind['beat 1'] = by_kind.get('beat 1', 0) + 1
        for fz in r.get('far', []):
            i = fz['i']
            f0 = next(r['files'][fi] for fi in fz['files'])
            span = '' if fz.get('last', i) == i else ' (bars %d-%d)' % (min(i, fz['first']) + 1, fz['last'] + 1)
            far.append((abs(fz['size']), '%s · far off where the first pass could not tell%s · bar %d at %s in %s · %s · '
                        '%s; %d files agree (%s), every one past max(80 ms (120 ms with two files), 1.5 x its own catch '
                        'threshold), same sign, sizes within 40 %%' % (
                            r['slug'], span, i + 1, fmt_t(f0['m']['E'][i]), os.path.basename(f0['rel']), where_in_cards(idx, i + 1),
                            bar_words(r, i + 1, fz['size'], f0['beat'] / f0['scale']), len(fz['files']),
                            ', '.join('%s by %s' % (r['files'][fi]['role'], h) for fi, h in zip(fz['files'], fz['how'])))))
            by_kind['far, unclear bar'] = by_kind.get('far, unclear bar', 0) + 1
    strong.sort(key=lambda sl: (-sl[0], sl[1]))
    weak.sort(key=lambda sl: (-sl[0], sl[1]))
    p1('')
    p1('THE LIST (seen by two methods; loudest first):')
    for i, (_, line) in enumerate(strong):
        p1('  %d. %s' % (i + 1, line))
    if not strong:
        p1('  (nothing)')
    p1('FAR OFF WHERE THE FIRST PASS COULD NOT TELL (counted; every file agrees on a big offset in a bar a card plays):')
    for _, line in sorted(far, key=lambda sl: (-sl[0], sl[1])):
        p1('  - ' + line)
    if not far:
        p1('  (nothing)')
    p1('BEAT 1 (a weaker judgment, from where the chords change):')
    for line in beat1:
        p1('  - ' + line)
    if not beat1:
        p1('  (nothing)')
    p1('WEAK (one method only; listen before believing):')
    for _, line in weak:
        p1('  - ' + line)
    if not weak:
        p1('  (nothing)')
    p1('OUTSIDE EVERY CARD (bars no practice card plays; listed, not counted):')
    for _, line in sorted(outside, key=lambda sl: (-sl[0], sl[1])):
        p1('  - ' + line)
    if not outside:
        p1('  (nothing)')
    p1('SETTLED (the SNIPPET_TRACKS comments already say so; not findings):')
    for line in settled:
        p1('  - ' + line)
    if not settled:
        p1('  (nothing)')
    p1('CANNOT TELL (no clear beat there):')
    for line in cannot:
        p1('  - ' + line)
    s2 = stage2_report(results, site) if '2' in stages else []
    if '1' not in stages:
        strong, beat1, weak, far, by_kind = [], [], [], [], {}
    kinds = ', '.join('%s %d' % kv for kv in sorted(by_kind.items())) or 'none'
    print('')
    print(('beat-audit: %d track(s), %d file(s), %d bars, %d measured, %d cannot tell; stage 1: %d listed, %d far-off '
           'in unclear bars (' + PROOF + '; listen to those bars), %d beat-1, '
           '%d weak (%s); stage 2: %d listed') % (
              len(results), n_files, n_bars, n_bars - n_cannot, n_cannot, len(strong), len(far), len(beat1), len(weak),
              kinds, len(s2)))
    # the run time goes to stderr, so the same files give the same stdout byte for byte
    print('beat-audit: %.0f s' % elapsed, file=sys.stderr)
    if args.json:
        dump_json(results, args.json, strong, weak, beat1)
    return 1 if (strong or far or beat1 or s2) else 0


def dump_json(results, path, strong, weak, beat1):
    out = {'tool': TOOL_VERSION, 'list': [l for _, l in strong], 'beat1': beat1, 'weak': [l for _, l in weak], 'tracks': []}
    for r in results:
        tr = {'slug': r['slug'], 'files': [], 'far_off': [{'bar': fz['i'] + 1, 'bars': [fz.get('first', fz['i']) + 1,
                                                                         fz.get('last', fz['i']) + 1],
                                                                'record_minus_map_ms': round(1000 * fz['size'], 1),
                                                                'files': [r['files'][fi]['role'] for fi in fz['files']],
                                                                'how': fz['how']} for fz in r.get('far', [])]}
        for f in r['files']:
            if 'j' not in f:
                tr['files'].append({'role': f['role'], 'file': f['rel'], 'skip': f['skip']})
                continue
            m, j = f['m'], f['j']
            tr['files'].append({'role': f['role'], 'file': f['rel'], 'constant_ms': round(1000 * (j['C'] - ONSET_BIAS), 1)
                                if np.isfinite(j['C']) else None, 'scatter_ms': round(1000 * j['sigma'], 1) if np.isfinite(j['sigma']) else None,
                                'bars': [{'bar': i + 1, 'time': round(float(m['E'][i]), 3), 'record_minus_map_ms': round(1000 * float(m['e'][i]), 1),
                                          'support': round(float(m['sup'][i]), 2), 'clear': bool(j['good'][i])} for i in range(len(m['e']))]})
        tr['xcorr'] = [{'kind': x['kind'], 'a': x['a'], 'b': x['b'], 'windows': [[round(a, 2), round(1000 * b, 1), round(c, 3)] for a, b, c in x['rows']]}
                       for x in r['xcorr']]
        if r.get('stage2'):
            tr['stage2'] = r['stage2'].get('json')
        out['tracks'].append(tr)
    with open(path, 'w') as fh:
        json.dump(out, fh, indent=1, sort_keys=True)


# ── stage 2: the chord's root against the chart ──
PC = {'C': 0, 'D': 2, 'E': 4, 'F': 5, 'G': 7, 'A': 9, 'B': 11}
PC_NAME = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']


def name_pc(name):
    """The pitch class a chart name puts in the bass: its root, and for a slash chord also the note after the slash
    (a band may play either). 'C#m' -> {1}; 'G/B' -> {7, 11}; 'Bb5' -> {10}."""
    out = []
    for k, part in enumerate(str(name).split('/')[:2]):
        part = part.strip()
        if not part or part[0] not in PC:
            continue
        v = PC[part[0]]
        if len(part) > 1 and part[1] == '#':
            v += 1
        elif len(part) > 1 and part[1] == 'b':
            v -= 1
        out.append(v % 12)
    return out


def chart_halves(card, bpb):
    """Per song bar, per half bar: the chart's bass pitch classes weighted by beats (rests count as silence).
    A section plays its notes once per rep; rep r covers bars fromBar + r * bars onward; inside a rep a note's
    bar is floor(beat position / beatsPerBar) (the site's pcLocate rule)."""
    halves = {}
    km = card.get('keyMap') or {}
    shift = None
    for k, v in km.items():
        a, b = name_pc(k), name_pc(v)
        if a and b:
            shift = (b[0] - a[0]) % 12
            break
    for si, s in enumerate(card['sections']):
        for rep in range(s['reps']):
            pos = 0.0
            for n in s['notes']:
                dur = n['beats']
                if n['note'] and not n['rest']:
                    nm = km.get(n['note'], n['note'])
                    pcs = name_pc(nm) if n['note'] in km else [((p + shift) % 12 if shift is not None else p) for p in name_pc(n['note'])]
                    a = pos
                    while a < pos + dur - 1e-9:
                        bar_in = int(math.floor(a / bpb + 1e-9))
                        half = 0 if (a - bar_in * bpb) < bpb / 2.0 - 1e-9 else 1
                        edge = bar_in * bpb + (bpb / 2.0 if half == 0 else bpb)
                        b_end = min(pos + dur, edge)
                        if bar_in < s['bars']:
                            key = (s['fromBar'] + rep * s['bars'] + bar_in, half)
                            h = halves.setdefault(key, {'w': {}, 'sec': (si, s['label'])})
                            for p in pcs[:1]:
                                h['w'][p] = h['w'].get(p, 0.0) + (b_end - a)
                            if len(pcs) > 1:
                                h.setdefault('alt', set()).add(pcs[1])
                        a = b_end
                pos += dur
    return halves


def bass_profile(a, t0, t1):
    ch = a['chroma_bass']
    ft = (np.arange(len(ch)) * 2048 + 8192) / SR
    sel = (ft >= t0) & (ft < t1)
    if sel.sum() < 1:
        k = int(np.clip(np.searchsorted(ft, 0.5 * (t0 + t1)), 0, len(ch) - 1))
        v = ch[k]
    else:
        v = ch[sel].sum(0)
    return v


def judge_half(v, okset):
    """One half bar: agree / disagree / cannot, from its bass profile v (12 pitch classes) and the chart's set.
    The loudest bass pitch class AGREES when it is the chart's root (or slash bass) or its fifth, or the chart's
    note is at least 0.7 of it; a third of the chart's chord is CANNOT TELL (a passing bass); DISAGREE needs a
    loudest note outside the chord, holding 30 %+ of the energy, with the chart's note under 0.35 of it."""
    tot = v.sum()
    if tot <= 1e-9:
        return 'cannot', None, 0.0, 0.0
    srt = np.sort(v)[::-1]
    share = float(srt[0] / tot)
    heard = int(np.argmax(v))
    rel = float(max(v[p] for p in okset) / (srt[0] + 1e-12))
    if share < 0.2:
        return 'cannot', heard, share, rel
    fifths = {(p + 7) % 12 for p in okset}
    thirds = {(p + k) % 12 for p in okset for k in (3, 4)}
    if heard in okset or heard in fifths or rel >= 0.7:
        # a bass on the chord's fifth is the chord (root-fifth bass lines: Perdon Mama, the rancheras)
        return 'agree', heard, share, rel
    if heard in thirds:
        return 'cannot', heard, share, rel
    if rel < 0.35 and share >= 0.3:
        return 'disagree', heard, share, rel
    return 'cannot', heard, share, rel


SHIFTS = (-2, -1, 1, 2)


def stage2_track(slug, tr, cards, r, opts, root):
    """Each card on this track (and its recording / key versions), each section, each half bar: the root heard in
    the low register (bass chroma 38-262 Hz of the full mix if the track has one, else the record) against the
    chart's. A half bar is judged only when the chart gives it one pitch class for 60 %+ of its beats. Each section
    is also tried one and two bars earlier and later: a section that agrees clearly better moved is listed as
    shifted (a wrong fromBar, or the map a bar off there)."""
    fa = next((f for f in r['files'] if f['role'] == 'full fast' and 'm' in f), None) or \
        next((f for f in r['files'] if f['role'] == 'fast' and 'm' in f), None)
    if fa is None:
        return None
    a = opts['analyse'](audio_path(root, fa['rel']))
    E = fa['m']['E']
    nbars = len(E) - 1
    bpb = int(round(tr['beatsPerBar']))
    prof = {}

    def profile(bar, half):
        if (bar, half) not in prof:
            if bar < 1 or bar > nbars:
                prof[(bar, half)] = None
            else:
                t0, t1 = E[bar - 1], E[bar]
                tm = t0 + (t1 - t0) * (0.5 if half else 0.0)
                prof[(bar, half)] = (bass_profile(a, tm, tm + 0.5 * (t1 - t0)), float(tm))
        return prof[(bar, half)]

    out = {'file': fa['rel'], 'cards': [], 'json': []}
    for c in cards:
        if c['track'] != slug:
            continue
        progress('stage 2 %s %s' % (c['id'], c['version']))
        halves = chart_halves(c, bpb)
        res = {'id': c['id'], 'version': c['version'], 'agree': 0, 'disagree': 0, 'cannot': 0, 'rows': [], 'sections': {}}
        for (bar, half) in sorted(halves):
            h = halves[(bar, half)]
            tot = sum(h['w'].values())
            exp, wexp = max(h['w'].items(), key=lambda kv: (kv[1], -kv[0]))
            okset = {exp} | h.get('alt', set())
            st = res['sections'].setdefault(h['sec'], {'agree': 0, 'disagree': 0, 'cannot': 0, 'bars': [],
                                                       'halves': [], 'shift': {}})
            pr = profile(bar, half)
            if pr is None:
                verdict, heard, why = 'cannot', None, 'past the map'
            elif tot <= 0 or wexp / tot < 0.6:
                verdict, heard, why = 'cannot', None, 'two roots in one half bar'
            else:
                verdict, heard, share, rel = judge_half(pr[0], okset)
                why = '' if verdict != 'disagree' else 'heard %s (%.0f%% of the bass energy), chart %s at %.0f%% of it' % (
                    PC_NAME[heard], 100 * share, PC_NAME[exp], 100 * rel)
                st['halves'].append((bar, half, okset))
                res['rows'].append((bar, half, PC_NAME[exp], PC_NAME[heard] if heard is not None else '-', verdict, why, pr[1]))
            res[verdict] += 1
            st[verdict] += 1
            if verdict == 'disagree':
                st['bars'].append((bar, half))
        for sec, st in res['sections'].items():
            for sh in SHIFTS:
                ag = dis = 0
                for bar, half, okset in st['halves']:
                    pr = profile(bar + sh, half)
                    if pr is None:
                        continue
                    v = judge_half(pr[0], okset)[0]
                    ag += v == 'agree'
                    dis += v == 'disagree'
                st['shift'][sh] = (ag, dis)
        out['cards'].append(res)
        out['json'].append({'card': c['id'], 'version': c['version'], 'agree': res['agree'], 'disagree': res['disagree'],
                            'cannot': res['cannot'], 'rows': [list(x) for x in res['rows']]})
    return out


def stage2_report(results, site):
    """Listed: a section that agrees clearly better moved by one or two bars (agreement up by a quarter of its
    judged half bars, to 60 %+, and fewer disagreements); a section where most judged half bars disagree; 3+ judged
    half bars IN A ROW that disagree inside a section where 60 %+ agree. A lone disagreeing half bar is counted,
    never listed (on the confirmed Watchtower the bass's fills make 10 of them per card)."""
    print('')
    print('STAGE 2: the root heard in the low register against the chart (rough; read the denominators)')
    tot = {'agree': 0, 'disagree': 0, 'cannot': 0}
    listed, rough = {}, {}

    def add(store, key, name, text):
        # one line per place, naming every card that shares it (review R1-7)
        if key not in store:
            store[key] = [text, []]
        if name not in store[key][1]:
            store[key][1].append(name)
    for r in results:
        s2 = r.get('stage2')
        if not s2:
            continue
        for c in s2['cards']:
            for k in tot:
                tot[k] += c[k]
            name = c['id'] + (' (%s)' % c['version'] if c['version'] else '')
            print('  %s %s on %s: %d half bars agree, %d disagree, %d cannot tell' % (
                r['slug'], name, os.path.basename(s2['file']), c['agree'], c['disagree'], c['cannot']))
            for (si, label), st in sorted(c['sections'].items()):
                judged = st['agree'] + st['disagree']
                if judged < 4:
                    continue
                best = max(SHIFTS, key=lambda sh: (st['shift'][sh][0] - st['shift'][sh][1], -abs(sh)))
                ag_s, dis_s = st['shift'][best]
                n_s = ag_s + dis_s
                if judged >= 8 and n_s >= 8 and ag_s / n_s >= 0.6 and ag_s / n_s - st['agree'] / judged >= 0.25 and dis_s < st['disagree']:
                    first = min(b for b, h, o in st['halves'])
                    row = next(x for x in c['rows'] if x[0] == first)
                    add(listed, (r['slug'], label, first, best), name,
                        '%s %%s "%s" (from bar %d at %s): the record matches the chart %d bar(s) %s -- %d of %d '
                        'half bars agree as placed, %d of %d moved; a fromBar (or the map) off by a bar?' % (
                            r['slug'], label, first, fmt_t(row[6]), abs(best),
                            'later' if best > 0 else 'earlier', st['agree'], judged, ag_s, n_s))
                elif st['disagree'] > 0.5 * judged:
                    add(listed, (r['slug'], label, st['bars'][0][0], 'most'), name,
                        '%s %%s "%s": %d of %d judged half bars disagree with the chart (first at bar %d)' % (
                            r['slug'], label, st['disagree'], judged, st['bars'][0][0]))
                elif st['disagree'] and st['agree'] >= 0.6 * judged:
                    # one chord the record does not play: 3+ judged half bars IN A ROW that disagree (a bass fill or
                    # a passing note is one or two; a single half bar is never listed, only counted)
                    judged_rows = [x for x in c['rows'] if x[4] in ('agree', 'disagree') and any(
                        (x[0], x[1]) == (b, h) for b, h, o in st['halves'])]
                    k = 0
                    while k < len(judged_rows):
                        if judged_rows[k][4] != 'disagree':
                            k += 1
                            continue
                        j = k
                        while j + 1 < len(judged_rows) and judged_rows[j + 1][4] == 'disagree':
                            j += 1
                        if j - k + 1 >= 3:
                            a0, a1 = judged_rows[k], judged_rows[j]
                            heard = '/'.join(sorted(set(x[3] for x in judged_rows[k:j + 1])))
                            # review R2-10: 4+ half bars (two bars) are counted; 3 stay rough. A wrong ONE-bar chord
                            # name makes only 2 half bars and is never listed
                            add(listed if j - k + 1 >= 4 else rough, (r['slug'], a0[0], a1[0]), name,
                                '%s %%s bars %d-%d at %s: the chart says %s, the loudest bass note is %s (a fifth counts as agreeing, so this is outside the chord) in %d half bars in a row' % (
                                    r['slug'], a0[0], a1[0], fmt_t(a0[6]),
                                    '/'.join(sorted(set(x[2] for x in judged_rows[k:j + 1]))), heard, j - k + 1))
                        k = j + 1
    out = [t % ', '.join(names) for t, names in (listed[k] for k in sorted(listed, key=str))]
    print('  STAGE 2 LIST (counted: a section of 4+ bars that fits the record better a bar or two off (shorter ones are '
          'never judged so), or mostly disagrees, '
          'or 4+ half bars in a row where the bass is outside the chart\'s chord):')
    for l in out:
        print('    - ' + l)
    if not out:
        print('    (nothing)')
    print('  BASS DIFFERS (rough, NOT counted: 3 half bars in a row where the bass is outside the chart\'s chord; a '
          'walking bass or a slash chord looks the same):')
    for t, names in (rough[k] for k in sorted(rough, key=str)):
        print('    - ' + t % ', '.join(names))
    if not rough:
        print('    (nothing)')
    print('  stage 2 totals: %d half bars agree, %d disagree, %d cannot tell' % (tot['agree'], tot['disagree'], tot['cannot']))
    return out


# ── the fake world ──
FAKE_SR = 44100
FAKE_CHORDS = ((57, 60, 64), (55, 59, 62), (53, 57, 60), (55, 59, 62))   # A G F G, roots A2 G2 F2 G2


def fake_score(seed, bars=56, bpm=120.0, wobble=0.03):
    """Beat times of a band that drifts: the tempo follows a smooth seeded random walk within +-wobble."""
    rng = np.random.default_rng(seed)
    n = bars * 4 + 1
    walk = np.cumsum(rng.normal(0, 1, n))
    walk = np.convolve(walk, np.ones(9) / 9, mode='same')
    walk = walk / (np.max(np.abs(walk)) + 1e-9) * wobble
    period = 60.0 / bpm * (1 + walk)
    beats = 1.5 + np.concatenate([[0.0], np.cumsum(period[:-1])])
    return beats


def fake_render(beats, scale=1.0, guitar=False, noise_db=None, seed=0):
    """Drums, bass and a pad at KNOWN times (beats x scale): kick on 1 and 3, snare on 2 and 4, hats on every eighth,
    a bass note per bar on the chord root, a sustained triad per bar (A G F G), optionally a strummed guitar on
    every eighth (the 'full' twin) and pink noise at noise_db below the music."""
    rng = np.random.default_rng(seed + 7)
    t_end = beats[-1] * scale + 2.0
    n = int(t_end * FAKE_SR)
    y = np.zeros(n)
    tb = beats * scale

    def add(t0, sig):
        i = int(round(t0 * FAKE_SR))
        if i < 0 or i >= n:
            return
        k = min(len(sig), n - i)
        y[i:i + k] += sig[:k]

    tt = np.arange(int(0.25 * FAKE_SR)) / FAKE_SR
    kick = np.sin(2 * np.pi * np.cumsum(50 + 70 * np.exp(-tt / 0.03)) / FAKE_SR) * np.exp(-tt / 0.12)
    sn = rng.normal(0, 1, len(tt))
    snare = (np.convolve(sn, [1, -1], mode='same') * 0.5 + 0.4 * np.sin(2 * np.pi * 190 * tt)) * np.exp(-tt / 0.07)
    th = tt[:int(0.05 * FAKE_SR)]
    hat = np.diff(np.concatenate([[0], rng.normal(0, 1, len(th))])) * np.exp(-th / 0.012) * 0.25
    for k in range(len(tb) - 1):
        pos = k % 4
        add(tb[k], 0.9 * kick if pos in (0, 2) else 0.6 * snare)
        add(tb[k], hat)
        add(0.5 * (tb[k] + tb[k + 1]), 0.6 * hat)
    for b in range((len(tb) - 1) // 4):
        if b % 8 == 0:
            progress('fake world: rendering bar %d' % (b + 1))
        t0, t1 = tb[4 * b], tb[4 * b + 4]
        L = int((t1 - t0) * FAKE_SR)
        tl = np.arange(L) / FAKE_SR
        ch = FAKE_CHORDS[b % 4]
        f0 = 440.0 * 2 ** ((ch[0] - 24 - 69) / 12.0)
        bass = sum(np.sin(2 * np.pi * f0 * h * tl) / h for h in (1, 2, 3)) * np.exp(-tl / 0.9) * 0.5
        bass *= np.minimum(1.0, tl / 0.004)
        pad = sum(np.sin(2 * np.pi * 440.0 * 2 ** ((m - 69) / 12.0) * tl) for m in ch) * 0.06
        pad *= np.minimum(1.0, tl / 0.05) * np.minimum(1.0, (tl[-1] - tl + 1e-9) / 0.05)
        add(t0, bass + pad)
        if guitar:
            for e8 in range(8):
                te = t0 + (t1 - t0) * e8 / 8
                g = sum(np.sin(2 * np.pi * 440.0 * 2 ** ((m - 69 + 12) / 12.0) * tt[:int(0.2 * FAKE_SR)]) for m in ch)
                add(te, g * np.exp(-tt[:int(0.2 * FAKE_SR)] / 0.08) * 0.08)
    if noise_db is not None:
        w = rng.normal(0, 1, n)
        W = np.fft.rfft(w)
        f = np.fft.rfftfreq(n, 1.0 / FAKE_SR)
        W[1:] /= np.sqrt(f[1:])
        W[0] = 0
        pink = np.fft.irfft(W, n)
        pink *= np.sqrt(np.mean(y ** 2)) / np.sqrt(np.mean(pink ** 2)) * 10 ** (-noise_db / 20.0)
        y = y + pink
    y = y / (np.max(np.abs(y)) + 1e-9) * 0.8
    return y


def fake_write_mp3(y, path):
    """Through a real mp3 encoder and back (the site's files are mp3), so encoder delay is part of the test."""
    p = subprocess.run(['nice', '-n', '10', 'ffmpeg', '-v', 'error', '-nostdin', '-y', '-f', 'f32le', '-ar', str(FAKE_SR),
                        '-ac', '1', '-i', '-', '-c:a', 'libmp3lame', '-b:a', '192k', path],
                       input=y.astype(np.float32).tobytes(), capture_output=True)
    if p.returncode != 0:
        raise ToolError('ffmpeg could not encode the fake world: ' + p.stderr.decode(errors='replace'))


def self_test(breaks):
    """The fake world: audio made here with beats at known times, the same measuring code as the site run, and
    PASS / FAIL against the times we planted. Breaking the detector (--break env_shift | no_unwrap | flip |
    no_slip_fix | no_band_witness | no_far_bands) must FAIL."""
    print('beat-audit self-test: a fake band with known beats%s' % (' (detector broken on purpose: %s)' % ','.join(breaks) if breaks else ''))
    t0 = time.monotonic()
    beats = fake_score(11)
    bars_true = beats[::4]
    tmp = tempfile.mkdtemp(prefix='beat-audit-fake-')
    fails = []
    lines = []
    try:
        worlds = {}
        for name, noise in (('clean', None), ('noisy', 0.0)):
            progress('fake world %s' % name)
            for role, scale, gtr in (('fast', 1.0, False), ('slow', 1.25, False), ('full fast', 1.0, True), ('full slow', 1.25, True)):
                fn = os.path.join(tmp, '%s-%s.mp3' % (name, role.replace(' ', '-')))
                progress('fake world: %s %s' % (name, role))
                y = fake_render(beats, scale, gtr, noise, seed=3)
                progress('fake world: encoding %s %s' % (name, role))
                fake_write_mp3(y, fn)
            worlds[name] = tmp
        memo = {}

        def analyse_once(p):
            if p not in memo:
                memo[p] = analyse_audio(p, None)
            return memo[p]
        opts = {'analyse': analyse_once, 'file': None}

        def track(name, bar_times=None, steady=None, slow_bpm=96.0):
            tr = {'src': '%s-fast.mp3' % name, 'srcSlow': '%s-slow.mp3' % name, 'srcFull': '%s-full-fast.mp3' % name,
                  'srcFullSlow': '%s-full-slow.mp3' % name, 'trackBpm': 120.0, 'trackBpmSlow': slow_bpm, 'feltBpm': 120.0,
                  'beatsPerBar': 4, 'anchor': float(bars_true[0])}
            if steady is not None:
                tr['feltBpm'] = steady
            else:
                tr['barTimes'] = [float(v) for v in bar_times]
            return tr

        def run(label, name, tr, expect):
            r = audit_track('fake-' + label, tr, [], tmp, opts, breaks)
            fast = r['files'][0]
            e = fast['m']['e']
            if 'flip' in breaks:
                e = -e
                fast['m']['e'] = e
            return r, fast, e

        # 1. the exact map, clean and noisy: every bar line should come back at the detector's own bias
        for name in ('clean', 'noisy'):
            r, fast, e = run('exact-' + name, name, track(name, bars_true), None)
            g = fast['j']['good']
            C = float(np.median(e[g]))
            err = (e[g] - C) * 1000
            rms = float(np.sqrt(np.mean(err ** 2)))
            mx = float(np.max(np.abs(err)))
            lines.append('%-6s exact map: %d of %d bar lines measured; constant %+.1f ms (the detector\'s bias); per-bar '
                         'error after it: rms %.1f ms, worst %.1f ms; findings listed: %d' % (
                             name, int(g.sum()), len(g), 1000 * C, rms, mx, sum(1 for gg in r['groups'] if gg['strong'])))
            if abs(C - ONSET_BIAS) > 0.006:
                fails.append('%s: the constant on an exact map is %+.1f ms, not the calibrated bias %+.1f ms' % (name, 1000 * C, 1000 * ONSET_BIAS))
            if rms > (6.0 if name == 'clean' else 12.0):
                fails.append('%s: per-bar rms error %.1f ms' % (name, rms))
            if any(gg['strong'] for gg in r['groups']):
                fails.append('%s: a finding on an exact map' % name)
        # 2. planted errors in the map, clean and noisy: each must come back at its size
        unit = 60.0 / 120.0
        plants = ((12, 0.060), (24, -0.250), (36, 0.035), (44, -0.120))
        for name in ('clean', 'noisy'):
            bt = bars_true.copy()
            for b, d in plants:
                bt[b - 1] += d
            r, fast, e = run('planted-' + name, name, track(name, bt), None)
            C = float(np.median(e[fast['j']['good']]))
            for b, d in plants:
                got = -(e[b - 1] - C)
                err = 1000 * (got - d)
                ok = abs(err) <= 15.0
                found = any(gg['strong'] and gg['i0'] <= b - 1 <= gg['i1'] for gg in r['groups'])
                lines.append('%-6s planted bar %2d %+4.0f ms: recovered %+6.1f ms (error %+5.1f ms) %s%s' % (
                    name, b, 1000 * d, 1000 * got, err, 'ok' if ok else 'WRONG SIZE',
                    ', listed' if found else (', not listed' if abs(d) >= 0.05 else '')))
                if not ok:
                    fails.append('%s: bar %d planted %+.0f ms, recovered %+.0f ms' % (name, b, 1000 * d, 1000 * got))
                if abs(d) >= 0.05 and not found:
                    fails.append('%s: bar %d planted %+.0f ms not listed' % (name, b, 1000 * d))
        # 2b. a half-unit SECTION in the audio map (review R2-2): bars 47-52 each a half beat late must be listed
        bt = bars_true.copy()
        bt[46:52] += 0.25
        r, fast, e = run('half-section', 'clean', track('clean', bt), None)
        hit = [gg for gg in r['groups'] if gg['strong'] and gg['i0'] <= 48 <= gg['i1'] + 1]
        got = max((abs(gg['size_fast']) for gg in hit), default=0.0)
        lines.append('clean  planted bars 47-52 +250 ms (half a beat): %s, size %.0f ms' % (
            'listed' if hit else 'NOT listed', 1000 * got))
        if not hit or abs(got - 0.25) > 0.05:
            fails.append('a half-beat section (bars 47-52, +250 ms) was not listed at about 250 ms')
        # 2c. the half-unit stretch logic, fed directly (review R2-2): a SLIP of the following (bands with the file's
        # level) must be put back; a REAL half-unit section (bands with method 1) must be kept and not called unclear
        Es = np.arange(61) * 2.0
        flat = np.full(61, 0.01)
        bands_level = {b: (flat + 0.002 * k, np.ones(61)) for k, b in enumerate(('low', 'mid', 'high'))}
        slip = flat.copy()
        slip[20:30] -= 0.25
        e2, amb2, fm2, fx2, _ = half_unit_stretches(slip, flat, np.ones(61), bands_level, Es, 4, breaks)
        ok_slip = fx2 >= 10 and np.allclose(e2[20:30], 0.01, atol=0.005) and not amb2.any()
        lines.append('logic  a 10-bar slip of the following (bands on the level): %s' % (
            'put back' if ok_slip else 'NOT put back (fixed %d, unclear %d)' % (fx2, int(amb2.sum()))))
        if not ok_slip:
            fails.append('a slip of the following was not put back')
        sec = flat.copy()
        sec[20:30] += 0.25
        bands_sec = {b: (np.where(np.arange(61) >= 20, np.where(np.arange(61) < 30, 0.26, 0.01), 0.01) + 0.002 * k,
                         np.ones(61)) for k, b in enumerate(('low', 'mid', 'high'))}
        e3, amb3, fm3, fx3, _ = half_unit_stretches(sec, flat, np.ones(61), bands_sec, Es, 4, breaks)
        ok_sec = fx3 == 0 and not amb3.any() and np.allclose(e3[20:30], 0.26, atol=0.005)
        lines.append('logic  a real 10-bar half-unit section (bands read it): %s' % (
            'kept' if ok_sec else 'NOT kept (put back %d, unclear %d)' % (fx3, int(amb3.sum()))))
        if not ok_sec:
            fails.append('a real half-unit section was put back or called unclear')
        # 2d. the far-off pass's band route, fed directly (review R3-7): bar 21 is "cannot tell" in 4 files; one file
        # reads it 150 ms off by method 1, the other three under-read it by method 1 while 2 of their 3 bands read
        # it. It must be listed with 4 files; without the band route only 1 file counts and it is not.
        def fake_file(m1, bands_v):
            n = 40
            e = np.zeros(n)
            e[20] = m1
            good = np.ones(n, bool)
            good[20] = False
            bd = {}
            for k, b in enumerate(('low', 'mid', 'high')):
                dev = np.zeros(n)
                dev[20] = bands_v[k]
                bd[b] = (dev, np.ones(n, bool))
            return {'role': 'f', 'scale': 1.0, 'm': {'e': e, 'sup': np.ones(n)},
                    'j': {'good': good, 'T': np.zeros(n), 'thr_local': 0.035, 'band_dev': bd, 'cannot': False}}
        fres = {'slug': 'fake', 'groups': [], 'played': set(range(1, 41)), 'breaks': breaks,
                'files': [fake_file(-0.150, (-0.14, -0.15, -0.02))] +
                         [fake_file(-0.030, (-0.14, -0.13, 0.01)) for _ in range(3)]}
        rescue_pass(fres, [0, 1, 2, 3])
        hit_far = [z for z in fres['far'] if z['i'] == 20]
        lines.append('logic  bar 21 unclear, 1 file by method 1 and 3 by their bands: %s' % (
            ('far off, %d files (%s)' % (len(hit_far[0]['files']), '/'.join(hit_far[0]['how']))) if hit_far else 'NOT listed'))
        if not hit_far or len(hit_far[0]['files']) != 4:
            fails.append('the far-off pass did not count the files whose bands read the bar')
        # 3. a straight grid at the band's average tempo: the drift must be found
        mean_bpm = 60.0 / ((bars_true[-1] - bars_true[0]) / (4 * (len(bars_true) - 1)))
        for name in ('clean',):
            tr = track(name, steady=mean_bpm * 1.004)
            r, fast, e = run('steady-' + name, name, tr, None)
            dr = [gg for gg in r['groups'] if gg['kind'] in ('drift', 'section') and gg['strong']]
            truth = bars_true - (tr['anchor'] + np.arange(len(bars_true)) * 4 * 60.0 / tr['feltBpm'])
            n = min(len(truth), len(e))
            g = fast['j']['good'][:n]
            C = float(np.median((e[:n] - truth[:n])[g]))
            err = 1000 * ((e[:n] - truth[:n])[g] - C)
            lines.append('%-6s straight grid at %.2f BPM on the drifting band: the true error runs %+.0f to %+.0f ms; '
                         'recovered within rms %.1f ms (worst %.1f); drift/section findings: %d' % (
                             name, tr['feltBpm'], 1000 * truth.min(), 1000 * truth.max(), float(np.sqrt(np.mean(err ** 2))),
                             float(np.max(np.abs(err))), len(dr)))
            if not dr:
                fails.append('the straight grid on a drifting band was not listed')
            if float(np.sqrt(np.mean(err ** 2))) > 12.0:
                fails.append('the straight grid: per-bar rms %.1f ms' % float(np.sqrt(np.mean(err ** 2))))
        # 4. the slow tier: a wrong trackBpmSlow must show in the slow file alone and in the onsets test
        tr = track('clean', bars_true, slow_bpm=98.0)
        r, fast, e = run('slow-wrong', 'clean', tr, None)
        sx = [x for x in r['xcorr'] if x['kind'] == 'slow-onsets' and (x.get('stretch') or x.get('finding'))]
        sg = [gg for gg in r['groups'] if gg['kind_shown'].startswith('slow ')]
        lines.append('clean  trackBpmSlow 98 instead of 96: onsets test %s, slow-file findings %d' % (
            ('finds a stretch of %.4f against %.4f' % (sx[0]['ratio'], sx[0]['scale'])) if sx else 'MISSES it', len(sg)))
        if not sx or not sg:
            fails.append('a wrong trackBpmSlow was not seen by both the onsets test and the slow file')
    finally:
        for fn in os.listdir(tmp):
            os.remove(os.path.join(tmp, fn))
        os.rmdir(tmp)
    for l in lines:
        print('  ' + l)
    for f in fails:
        print('  ✗ FAIL: ' + f)
    print('beat-audit self-test: %s (%d checks failed) in %.0f s' % ('PASS' if not fails else 'FAIL', len(fails), time.monotonic() - t0))
    return 0 if not fails else 1


SWEEP_MS = (30, 45, 60, 80, 100, 150)


def resolution_sweep(site, slugs, root, opts):
    """--resolution: for each track, move FIVE bar lines at once (spread over the song, on bars every file can
    measure and away from today's own findings, alternately later and earlier) by each size in SWEEP_MS, in memory
    only, and run the WHOLE stage-1 judgment (every file of the track, bands, other mixes, slow file). A plant is
    caught when THE LIST holds a local finding over that bar (+-1) of the right sign and at least half the size.
    The smallest size caught 5 of 5 (and 4 of 5) is the track's resolution. The whole-map (anchor) resolution
    follows from CONST_MIN and the file's own constant."""
    print('beat-audit --resolution: planted bar-line shifts, in memory, through the whole stage-1 judgment')
    for slug in slugs:
        tr = site['tracks'][slug]
        if audio_path(root, tr['src']) is None:
            print('  %s: %s, not swept' % (slug, absent_skip(root, tr['src'])))
            continue
        a = opts['analyse'](audio_path(root, tr['src']))
        G, bpb, _ = units_per_bar(tr)
        E0, _ = fast_bar_lines(tr, float(a['duration']))
        base = audit_track(slug, tr, [], root, opts, override_E=E0)
        meas = [f for f in base['files'] if 'j' in f and not f['j']['cannot']]
        if not meas:
            print('  %s: no clear beat, not swept' % slug)
            continue
        n = min(len(f['j']['good']) for f in meas)
        okall = np.ones(n, bool)
        for f in meas:
            okall &= f['j']['good'][:n]
        busy = set()
        for g in base['groups']:
            if g['kind'] in ('local', 'section', 'pattern'):
                busy.update(range(g['i0'] - 3, g['i1'] + 4))
        cand = [i for i in range(3, n - 3) if okall[i - 1] and okall[i] and okall[i + 1] and i not in busy]
        if len(cand) < 5:
            print('  %s: fewer than 5 bars every file can measure, not swept' % slug)
            continue
        picks = [cand[int(round(k * (len(cand) - 1) / 4.0))] for k in range(5)]
        row = []
        res5 = res4 = None
        for size in SWEEP_MS:
            progress('resolution %s %d ms' % (slug, size))
            E = E0.copy()
            sgn = []
            for k, i in enumerate(picks):
                sg = 1 if k % 2 == 0 else -1
                E[i] += sg * size / 1000.0
                sgn.append(sg)
            r = audit_track(slug, tr, [], root, opts, override_E=E)
            hit = 0
            for i, sg in zip(picks, sgn):
                hit += any(g['strong'] and g['kind'] == 'local' and g['i0'] - 1 <= i <= g['i1'] + 1 and
                           np.sign(g['size_fast']) == -sg and abs(g['size_fast']) >= 0.5 * size / 1000.0
                           for g in r['groups'])
            row.append('%d:%d/5' % (size, hit))
            if hit == 5 and res5 is None:
                res5 = size
            if hit >= 4 and res4 is None:
                res4 = size
        f0 = meas[0]
        C = f0['j']['C'] - ONSET_BIAS
        print('  %s (bars %s): %s · this track: single bar lines off by %s (5 of 5), %s (4 of 5); whole-map shifts '
              'of %.0f ms later or %.0f ms earlier' % (
                  slug, ','.join(str(i + 1) for i in picks), ' '.join(row),
                  ('%d ms or more' % res5) if res5 else 'more than %d ms' % SWEEP_MS[-1],
                  ('%d ms or more' % res4) if res4 else 'more than %d ms' % SWEEP_MS[-1],
                  1000 * (CONST_MIN + C), 1000 * (CONST_MIN - C)))
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
