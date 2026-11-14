"""song_files.py: the Python tools' reading of SONG FILES (song recordings behind the sign-in, 2026-11-14), the twin
of tools/song-files.mjs (its header has the rules; app/songfiles.js has the design). Imported by tools/loudness.py
and tools/beat-audit.py. It only READS the list; tools/song-files.mjs is the one writer (loudness.py calls it after
it rewrites a private file).

A track path is 'audio/<file>.mp3' (public, in the repo) or 'private:<id>' (in the private song folder on
Jonathan's Mac: ~/Documents/guitar-class-song-files/, or GC_SONG_FILES_DIR). resolve_audio() says where the bytes
are: a private file is used only when the folder has it AND its size and SHA-256 are the list's; a copy that differs
raises SongFilesError (never silently used); no copy gives file None, and the caller works from the list's entry.
"""
import hashlib
import json
import os
import re
from pathlib import Path

PREFIX = 'private:'
SRC = 'app/songfiles.js'
ID_RE = re.compile(r'^[a-z0-9][a-z0-9-]{0,79}$')
NAME_RE = re.compile(r'^[A-Za-z0-9][A-Za-z0-9._#-]{0,159}\.mp3$')
SHA_RE = re.compile(r'^[0-9a-f]{64}$')
BYTES_MAX = 36000000
SECONDS_MAX = 1800
FIELDS = ('file', 'bytes', 'sha256', 'durationSec')
BLOCK_RE = re.compile(r'/\* SONG_FILES:BEGIN[\s\S]*?\*/\r?\nconst SONG_FILES = ([\s\S]*?);\r?\n/\* SONG_FILES:END \*/')


class SongFilesError(Exception):
    pass


def song_files_dir():
    env = (os.environ.get('GC_SONG_FILES_DIR') or '').strip()
    return Path(env).expanduser().resolve() if env else Path.home() / 'Documents' / 'guitar-class-song-files'


def private_id(path):
    return path[len(PREFIX):] if isinstance(path, str) and path.startswith(PREFIX) else None


def entry_problem(sid, e):
    if not ID_RE.match(sid):
        return 'id "%s" is not %s' % (sid, ID_RE.pattern)
    if not isinstance(e, dict):
        return '%s: not an object' % sid
    odd = [k for k in e if k not in FIELDS]
    if odd:
        return '%s: unknown field(s) %s' % (sid, ', '.join(odd))
    missing = [k for k in FIELDS if k not in e]
    if missing:
        return '%s: missing %s' % (sid, ', '.join(missing))
    if not isinstance(e['file'], str) or not NAME_RE.match(e['file']):
        return '%s: file %r is not a plain *.mp3 name' % (sid, e['file'])
    b = e['bytes']
    if isinstance(b, bool) or not isinstance(b, int) or not 1 <= b <= BYTES_MAX:
        return '%s: bytes %r is not a whole number from 1 to %d' % (sid, b, BYTES_MAX)
    if not isinstance(e['sha256'], str) or not SHA_RE.match(e['sha256']):
        return '%s: sha256 %r is not 64 lower-case hex digits' % (sid, e['sha256'])
    d = e['durationSec']
    if isinstance(d, bool) or not isinstance(d, (int, float)) or not 0 < d <= SECONDS_MAX:
        return '%s: durationSec %r is not a number above 0 and at most %d' % (sid, d, SECONDS_MAX)
    return None


def read_song_files(root):
    """{id: entry} from <root>/app/songfiles.js; SongFilesError on a missing block, bad JSON or a bad entry."""
    try:
        src = (Path(root) / SRC).read_text(encoding='utf8')
    except OSError as ex:
        raise SongFilesError('%s cannot be read: %s' % (SRC, ex))
    m = BLOCK_RE.search(src)
    if not m:
        raise SongFilesError('%s has no SONG_FILES:BEGIN ... SONG_FILES:END block' % SRC)
    try:
        lst = json.loads(m.group(1))
    except ValueError as ex:
        raise SongFilesError('%s: the list between the SONG_FILES markers is not strict JSON (%s)' % (SRC, ex))
    if not isinstance(lst, dict):
        raise SongFilesError('%s: SONG_FILES is not a JSON object' % SRC)
    seen = {}
    for sid, e in lst.items():
        p = entry_problem(sid, e)
        if p:
            raise SongFilesError('%s: SONG_FILES %s' % (SRC, p))
        if e['file'] in seen:
            raise SongFilesError('%s: SONG_FILES %s and %s name the same file %s' % (SRC, sid, seen[e['file']], e['file']))
        seen[e['file']] = sid
    return lst


_sha_memo = {}


def file_sha256(path):
    st = os.stat(path)
    k = (str(path), st.st_size, st.st_mtime_ns)
    if k not in _sha_memo:
        h = hashlib.sha256()
        with open(path, 'rb') as f:
            for chunk in iter(lambda: f.read(1 << 20), b''):
                h.update(chunk)
        _sha_memo[k] = h.hexdigest()
    return _sha_memo[k]


def local_mismatch(path, entry):
    size = os.path.getsize(path)
    if size != entry['bytes']:
        return 'is %d bytes, the list says %d' % (size, entry['bytes'])
    sha = file_sha256(path)
    if sha != entry['sha256']:
        return 'has SHA-256 %s..., the list says %s...' % (sha[:12], entry['sha256'][:12])
    return None


def resolve_audio(root, path, lst=None, folder=None, base=''):
    """{'kind': 'public', 'file': Path} or {'kind': 'private', 'id', 'entry', 'file': Path or None, 'local': Path}."""
    sid = private_id(path)
    if sid is None:
        return {'kind': 'public', 'file': Path(root) / base / path}
    lst = read_song_files(root) if lst is None else lst
    entry = lst.get(sid)
    if entry is None:
        raise SongFilesError('%s: "%s" is not on the SONG_FILES list in %s' % (path, sid, SRC))
    local = Path(folder or song_files_dir()) / entry['file']
    if not local.exists():
        return {'kind': 'private', 'id': sid, 'entry': entry, 'file': None, 'local': local}
    bad = local_mismatch(local, entry)
    if bad:
        raise SongFilesError('%s: the private folder\'s %s %s (re-run node tools/song-files.mjs --add on the right '
                             'file, or put the listed file back)' % (path, local, bad))
    return {'kind': 'private', 'id': sid, 'entry': entry, 'file': local, 'local': local}


def absent_line(sid, entry):
    """The one line a tool prints for a private file the folder does not have."""
    return 'private:%s (%s): not in the private folder %s; skipped (the list: %d bytes, %.1f s)' % (
        sid, entry['file'], song_files_dir(), entry['bytes'], entry['durationSec'])
