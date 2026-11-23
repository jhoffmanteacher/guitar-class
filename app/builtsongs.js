/* ══ BUILT SONGS — Play Along songs that live in the database, not in the code (2026-11-14) ══════════
   Jonathan, 2026-11-14: "go with song builder". A built song is a Play Along song he adds in the console
   (the Song builder's Publish, teacher-sb-publish.js; or Manage → Built songs: Import, teacher-builtsongs.js) with
   NO code push. It shows
   where today's extra songs show, Songs → "More Play Along songs", for every student, with the same card a
   coded song has (caCardBodyHtml): Play song, Metronome, the speed slider, section buttons, Loop this part,
   Full / Power chords. Its lyrics always show when the chart has them (Jonathan: "lyrics always show if they
   are available"; this reverses "No lyrics" for BUILT songs only — coded cards are unchanged). It is never
   on In-Class Activities, never blocks, never has a #N, never touches a Journey page: the expansion below
   gives it `library: true` and `optional: true`, and caIsLibraryCard() ignores config/class.songLibrary for
   an 'sb-' id, so nothing can move it to the board. Hidden (config/class.hiddenActivities) takes it off.
   Work order: "Claude outputs/WORK-ORDER-song-builder.md", Part a2.

   THE STORE (firestore.rules "BUILT SONGS"; written only by the console):
     builtSongs/{id}       { v, title, artist, audio, song, savedAt }   a school account GETS one by id
     builtSongsMeta/list   { songs: { <id>: <edit number> }, updatedAt }   the only index; a school account reads it
     songDrafts/{id}       the console's drafts (teacher only; never read here)
   id = 'sb-' + 8 to 24 lower-case letters and digits. `v` is the FORMAT version (1; a page refuses a `v` it does
   not know); an edit keeps it. The list's number for a song is its EDIT number: it goes up on every import or
   publish, is never used twice for a song (the console makes it from its clock, teacherBsNextVer), and is what tells
   a page to fetch the doc again. The rules check the doc's outer shape only; THIS
   FILE checks everything (builtSongCheck), on every page, before a song is shown, and the list's keys and
   values one by one (the rules cannot loop over a map).

   THE AUDIO is an ordinary songFiles entry (app/songfiles.js, the SONG FILES store) named by `audio` (and a chord
   sheet, song.sheet below, another one: a .pdf):
     audio { id, bytes, sha256, durationSec, centsOff, gainDb?, sourceSha256? }
       id            the songFiles doc id (the console's Import uploads it there)
       bytes, sha256 what the download is checked against (app/songfiles.js, as for a listed file)
       durationSec   the file's length in seconds
       centsOff      the record's tuning against A = 440, from -10 to 10 (Jonathan, 2026-11-14: a record further
                     off is not published; the rules hold it too)
       gainDb, sourceSha256   the one gain that levelled the stored copy and the SHA-256 of the original upload,
                     so Claude can make a clean slow file later from the same source
     The stored copy is ONE file: the record levelled to "the cure" (one measured gain, a -1 dBFS limiter), 192k
     constant bitrate (Jonathan, 2026-11-14). Its four speeds are that one file played at 0.65, 0.85, 0.9 and 1,
     pitch held (pcSpeed3Html, app/cards.js), opening on Normal, 1× (2026-11-20). A built track with a `srcSlow` (a clean slow file
     made later by a code push) would use today's two-file stops; v1 docs have none.

   THE CHART: `song` (format v1). Firestore refuses an array directly inside an array, so nothing here nests
   one: a shape's frets are one flat array, a bar is one string.
     meter      '4/4' | '3/4' | '6/8'. 6/8 is counted in two big beats a bar, every eighth on the grid
                (countSix), like Perdón Mamá (ca-51)
     bpm        the COUNTED beats a minute (quarter notes in 4/4 and 3/4; big beats, three eighths, in 6/8)
     anchor     seconds into the file: the downbeat of bar 1 (the first LOUD beat 1, skill new-playalong)
     barTimes   optional: every bar's downbeat in seconds, barTimes[0] = anchor, at least one per bar of `bars`
                (a beat map from three or more pins; a steady record has none and uses anchor + bpm)
     chords     { <name>: { full: <shape>|null, power: <shape>|null } }, at most BS_MAX_CHORDS
                name: a root A-G, an optional # or b, then nothing (major), 'm' (minor) or '5' (a power chord)
                shape: { frets: [lowE, A, D, G, B, highE] }, each a fret 0-20 or null (not played). The pitches
                are worked out from the frets: a full chord must hold its root and third and nothing outside
                root / third / fifth; a power chord is root and fifth only, 2 to 4 strings, the root lowest.
                Its name on the card is the root plus '5' (C#m → C#5).
     bars       one string per bar, bar 1 first, at most BS_MAX_BARS:
                  'G'              G for the whole bar
                  'G:2 C:2'        G for 2 beats then C for 2 (beats in counted beats; they add up to the bar)
                  'Em:1.5 D:0.5' / 'A:1/3 B:5/3'   halves in 4/4 and 3/4, thirds (one eighth) in 6/8
                  '-'  /  'G:2 -:2'   a rest (the bar, or its beats, silent)
                every name is a key of `chords`
     sections   [{ name, n?, from, bars, lyrics? }], 1 to BS_MAX_SECTIONS, back to back from bar 1 to the last
                bar (no gap, no overlap, every bar in one):
                  name    a key of BS_SECTION_NAMES (the fixed list; its words come from i18n.js 'bs.sec.*')
                  n       optional 1-9: "Verse 2"
                  from    the first bar (1-based), bars: how many (at least 1)
                  lyrics  optional [{ text, bars }]: the words sung over `bars` bars, the lines adding up to the
                          section's bars (a line with text '' is bars with no words). Shown over its row of the
                          chord grid, the same in English and Spanish, escaped where drawn
     level      { versions: 'full' | 'power' | 'both', start?: 'full' | 'power' } — Full chords only, Power
                chords only, or both with the switch (start = which one it opens on; needed with 'both')
     capo       optional 1-9 (2026-11-20, Jonathan: Sailor Song, capo 4 with G shapes): the fret the capo goes on.
                The chords are then named and shaped AS PLAYED with the capo (C, Em, G), checked as written; the
                directions line starts "Put a capo on fret N and" (one sentence, verb first) and a tapped chord sounds N half steps higher, as the
                record does. A page older than this format refuses a doc with song.capo (the whole song is left out
                there), so the reader ships before the first song with a capo is imported.
     range      optional { from, to }: the card plays sections from..to (0-based, inclusive; Jonathan, 2026-11-14:
                a from-to range, no gaps). Left out = the whole song. The card always LOOPS at its end (no
                wholeSong; Jonathan: like ca-51)
     sheet      optional { id, bytes, sha256, cols? } (2026-11-18, Jonathan: a Lyrics view for private songs): his
                chord sheet, a pdf in the PRIVATE song-file store (app/songfiles.js, A CHORD SHEET), never in the
                repo. id 'sheet-' + lower-case letters, digits and dashes (a song-file id, never the audio's), bytes
                up to BS_MAX_SHEET_BYTES, its SHA-256; cols 2 reads a two-column page, left out (or 1) one column
                (a chord-over-lyric sheet from the web). The card then gets a Chords / Lyrics switch
                (card.otherViews.lyrics, app/cards-views.js): the pdf drawn as it is, read LOOSE (pcSheetAlign,
                app/cards-sheet.js: E7 = E, the chord boxes skipped, a name written again, "(Repeat to end)"). A
                sheet that does not follow the chart draws with no dot; the console checks it before it is added.
                A page older than this format refuses a doc with song.sheet as an unknown field (the whole song is
                left out there), so the reader ships before the first sheet is attached.

   THE IMPORT FILE (tools/built-song-check.mjs checks one in Node; the console's Import reads one): the doc
   without savedAt, plus its id: { id, v, title, artist, audio, song }.

   WHAT A PAGE DOES (builtSongsSync, started from app/start.js only: after a sign-in, and on a tab return when the
   last answered read of the list is over 15 minutes old, BS_RETURN_MS):
     1. one read of builtSongsMeta/list. Refused (permission-denied: the rules not pasted yet, or an account the
        rules do not let in) or missing → NO built songs, no line on screen, no error-log entry (a refused read
        leaves the device copy as it was, unused). Offline or another failure → the device copy (below), only
        while someone is signed in.
     2. each listed song whose edit number the device copy does not already hold is read (get, never a list);
        a doc that is missing or refused is skipped; a failed read keeps the device copy's older version if any.
     3. builtSongCheck on each; a refused song is left out ALONE (at most one anonymous error-log line per page),
        and so is one whose id is already a coded activity or track, or whose audio id (or chord sheet id,
        song.sheet) is on SONG_FILES (the tracked list wins) or used by another built song with other bytes.
     4. the previous built entries in CLASS_ACTIVITIES and SNIPPET_TRACKS are replaced AS A WHOLE (a song gone
        from the list is gone from the page), the audio (and sheet) entries handed to app/songfiles.js
        (songFilesSetBuilt), and the Songs page's list repainted if it is showing (refreshSongsPlayAlong);
        in the console, its Songs view and Manage → Built songs. Nothing is repainted when nothing changed.
     Signed out → every built entry is removed and the device copy is never used. A deep link to an 'sb-' id that
     arrives before the first merge waits for it (builtSongWait, from caFocusActivity), then opens the card or
     does what a link to an unknown id does today.
   With no built song this changes NOTHING a student sees or saves: CLASS_ACTIVITIES and SNIPPET_TRACKS are
   untouched (tools/built-songs-sim.mjs proves deep equality). It writes nothing to progress/{uid} or
   config/class; opening a built song counts in songOpens through the existing songsLibraryOpen().

   THE DEVICE COPY: IndexedDB 'gc-built-songs', store 'songs', ONE record { id: 'all', savedAt, songs: { <id>:
   { ver, doc, added } } } (added: the "Date added" day, bsDayOf; a copy without it is read again once), rewritten after each merge made from the database (songs with lyrics add up, and
   localStorage is small and shared with the site's other keys). Every doc in it is checked again before use. A
   failed or slow IndexedDB never blocks anything: the page goes on without it. It holds the class-wide songs
   only, nothing of any student; a shared Chromebook's next account reads it only when the database cannot be
   reached, and the audio still needs that account's own sign-in.

   tools/built-songs-sim.mjs runs this file in Node; tools/built-song-check.mjs is the validator on a file. */

const BS_ID_RE = /^sb-[a-z0-9]{8,24}$/;
const BS_AUDIO_ID_RE = /^[a-z0-9][a-z0-9-]{0,79}$/;     // firestore.rules: the songFiles id
const BS_SHA_RE = /^[0-9a-f]{64}$/;
const BS_FORMAT = 1;                                    // the `v` this page knows
const BS_CAP = 105;                                     // checks.mjs 1cs CAP_2A: one rendered line at 1366x657
const BS_MAX_SECTIONS = 15, BS_MAX_BARS = 600, BS_MAX_CHORDS = 24, BS_MAX_LYRIC = 160, BS_MAX_SONGS = 200;
const BS_MAX_BYTES = 36000000, BS_MAX_SEC = 1800, BS_MAX_CENTS = 10;
const BS_SHEET_ID_RE = /^sheet-[a-z0-9-]{1,74}$/, BS_MAX_SHEET_BYTES = 5000000;   // song.sheet: a pdf in the song-file store
const BS_SEP = ' — ';                              // the long-dash separator songsLibraryHtml() cuts a title at
/* The fixed list of section names: key -> i18n key. 'Outro' and 'Ending' both read "Final" in Spanish, as on the
   coded cards. */
const BS_SECTION_NAMES = { intro: 'bs.sec.intro', verse: 'bs.sec.verse', prechorus: 'bs.sec.prechorus', chorus: 'bs.sec.chorus',
  refrain: 'bs.sec.refrain', bridge: 'bs.sec.bridge', interlude: 'bs.sec.interlude', solo: 'bs.sec.solo', riff: 'bs.sec.riff',
  requinto: 'bs.sec.requinto', outro: 'bs.sec.outro', ending: 'bs.sec.ending' };
const BS_METERS = { '4/4': { bpb: 4, q: 2 }, '3/4': { bpb: 3, q: 2 }, '6/8': { bpb: 2, q: 3, countSix: true } };
/* Every lookup by a value the doc supplies goes through an own-property test: a plain object answers "constructor",
   "__proto__" or "toString" with Object.prototype's own (review R1-1, 2026-11-15). */
function bsOwn(o, k){ return typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k); }
function bsMeter(m){ return bsOwn(BS_METERS, m) ? BS_METERS[m] : null; }
const BS_STRINGS = ['E', 'A', 'D', 'G', 'B', 'e'];
const BS_OPEN_MIDI = [40, 45, 50, 55, 59, 64];
const BS_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const BS_CHORD_RE = /^([A-G])([#b]?)(m|5)?$/;
const BS_CTRL_RE = /[\u0000-\u001F\u007F\u2028\u2029]/;

function bsIsObj(v){ return !!v && typeof v === 'object' && !Array.isArray(v); }
function bsKeysOnly(o, allowed){ return Object.keys(o).filter(k => !allowed.includes(k)); }
function bsNum(v){ return typeof v === 'number' && Number.isFinite(v); }
function bsInt(v){ return Number.isInteger(v); }
function bsText(v, min, max){ return typeof v === 'string' && v.trim().length >= min && v.length <= max && !BS_CTRL_RE.test(v); }
/* '2', '1.5', '1/3', '5/3' → a number of beats; NaN when it is not one of those. */
function bsBeats(s){
  const m = /^(\d{1,2})(?:\.(\d{1,3}))?$/.exec(s) || null;
  if(m) return Number(s);
  const f = /^(\d{1,2})\/([1-4])$/.exec(s);
  return f ? Number(f[1]) / Number(f[2]) : NaN;
}
/* A chord name → { root pitch class, quality '', 'm' or '5', the root's letters }, or null. */
function bsChordName(name){
  const m = typeof name === 'string' ? BS_CHORD_RE.exec(name) : null;
  if(!m) return null;
  const pc = (BS_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? 11 : 0)) % 12;
  return { pc, q: m[3] || '', root: m[1] + m[2] };
}
function bsPowerName(name){ const c = bsChordName(name); return c ? c.root + '5' : ''; }
/* A shape's sounded strings → { midi: [low..high], sounded: n } or a reason string. */
function bsShapeMidi(shape){
  if(!bsIsObj(shape) || bsKeysOnly(shape, ['frets']).length) return 'not { frets }';
  const f = shape.frets;
  if(!Array.isArray(f) || f.length !== 6) return 'frets is not six strings (low E to high e)';
  const midi = [];
  for(let i = 0; i < 6; i++){
    if(f[i] === null) continue;
    if(!bsInt(f[i]) || f[i] < 0 || f[i] > 20) return `a fret on the ${BS_STRINGS[i]} string is not 0 to 20 or null`;
    midi.push(BS_OPEN_MIDI[i] + f[i]);
  }
  return { midi };
}
/* A full chord holds its root and third (a 5 chord: root and fifth) and nothing outside root / third / fifth;
   a power chord is root and fifth, 2 to 4 strings, the root lowest. */
function bsShapeProblem(name, shape, kind){
  const c = bsChordName(name);
  const r = bsShapeMidi(shape);
  if(typeof r === 'string') return r;
  const pcs = new Set(r.midi.map(m => ((m % 12) - c.pc + 12) % 12));
  if(kind === 'power' || c.q === '5'){
    if(r.midi.length < 2 || r.midi.length > 4) return 'a power chord plays 2 to 4 strings';
    if(!pcs.has(0) || !pcs.has(7) || [...pcs].some(p => p !== 0 && p !== 7)) return 'a power chord is its root and fifth only';
    if(((r.midi[0] % 12) - c.pc + 12) % 12 !== 0) return 'a power chord has its root lowest';
    return '';
  }
  const third = c.q === 'm' ? 3 : 4;
  if(r.midi.length < 3) return 'a full chord plays at least 3 strings';
  if(!pcs.has(0) || !pcs.has(third)) return `the shape does not hold the chord's root and ${c.q === 'm' ? 'minor' : 'major'} third`;
  if([...pcs].some(p => p !== 0 && p !== third && p !== 7)) return 'the shape has a note outside the chord';
  return '';
}
/* One bar's string → [{ name ('' = rest), beats }] or a reason string. */
function bsBarParts(s, meter, chords){
  if(typeof s !== 'string' || !s.trim() || s.length > 120) return 'is not a bar';
  const toks = s.trim().split(/\s+/);
  if(toks.length > 8) return 'has more than 8 changes';
  const out = [];
  if(toks.length === 1 && toks[0].indexOf(':') < 0){
    const n = toks[0] === '-' ? '' : toks[0];
    if(n && !Object.prototype.hasOwnProperty.call(chords, n)) return `names ${JSON.stringify(n)}, which is not in chords`;
    return [{ name: n, beats: meter.bpb }];
  }
  let sum = 0;
  for(const tk of toks){
    const i = tk.lastIndexOf(':');
    if(i <= 0) return `has ${JSON.stringify(tk)}: write name:beats`;
    const n = tk.slice(0, i) === '-' ? '' : tk.slice(0, i), b = bsBeats(tk.slice(i + 1));
    if(n && !Object.prototype.hasOwnProperty.call(chords, n)) return `names ${JSON.stringify(n)}, which is not in chords`;
    if(!(b > 0) || Math.abs(b * meter.q - Math.round(b * meter.q)) > 1e-6) return `gives ${JSON.stringify(tk)} a length that is not a whole number of ${meter.q === 3 ? 'thirds' : 'halves'} of a beat`;
    out.push({ name: n, beats: b }); sum += b;
  }
  if(Math.abs(sum - meter.bpb) > 1e-6) return `adds up to ${Math.round(sum * 100) / 100} beats, not ${meter.bpb}`;
  return out;
}
function bsLang(key, lang, params){ return typeof tIn === 'function' ? tIn(key, lang, params) : key; }
function bsSectionLabel(s, lang){ return bsLang(bsOwn(BS_SECTION_NAMES, s.name) ? BS_SECTION_NAMES[s.name] : '', lang) + (s.n ? ' ' + s.n : ''); }
/* "G, C and D" in English, "G, C y D" in Spanish. */
function bsList(names, lang){
  if(names.length < 2) return names.join('');
  return names.slice(0, -1).join(', ') + bsLang('bs.and', lang) + names[names.length - 1];
}
/* The directions line over the card (an activity's intro): the chords it uses, or the short line when that would
   not fit one rendered line (BS_CAP, both languages). */
function bsIntro(names, lang, capo){
  const c = capo ? 'Capo' : '';   // with a capo the line says where it goes first (bs.introCapo / bs.introShortCapo)
  if(!names.length) return bsLang('bs.introShort' + c, lang, capo ? { capo } : undefined);   // a card of rests only names no chord
  const long = bsLang('bs.intro' + c, lang, { chords: bsList(names, lang), capo });
  return long.length <= BS_CAP ? long : bsLang('bs.introShort' + c, lang, capo ? { capo } : undefined);
}

/* ── The validator: every reason a doc is refused ([] = fine). `id` is the doc's id. Pure: no DOM, no store. Used
   by the console before Import and Publish, by every page before a merge, and by Node
   (tools/built-song-check.mjs). ── */
function builtSongCheck(id, doc){
  const why = [];
  const no = m => { why.push(m); return why; };
  if(typeof id !== 'string' || !BS_ID_RE.test(id)) no(`the id ${JSON.stringify(String(id)).slice(0, 40)} is not 'sb-' and 8 to 24 lower-case letters or digits`);
  if(!bsIsObj(doc)) return no('the song is not an object');
  const extra = bsKeysOnly(doc, ['v', 'title', 'artist', 'audio', 'song', 'savedAt']);
  if(extra.length) no(`unknown field(s): ${extra.slice(0, 4).join(', ')}`);
  if(doc.v !== BS_FORMAT) return no(`format version ${JSON.stringify(doc.v)} is not one this site reads (${BS_FORMAT})`);
  if(!bsText(doc.title, 1, 120)) no('the title is not 1 to 120 characters of plain text');
  else if(doc.title.indexOf(BS_SEP) >= 0) no('the title contains " — " (a long dash between spaces): the Songs page cuts names there');
  if(typeof doc.artist !== 'string' || doc.artist.length > 120 || BS_CTRL_RE.test(doc.artist)) no('the artist is not 0 to 120 characters of plain text');
  else if(doc.artist.indexOf(BS_SEP) >= 0) no('the artist contains " — " (a long dash between spaces)');
  const a = doc.audio;
  if(!bsIsObj(a)) no('audio is missing');
  else {
    const ex = bsKeysOnly(a, ['id', 'bytes', 'sha256', 'durationSec', 'centsOff', 'gainDb', 'sourceSha256']);
    if(ex.length) no(`audio has unknown field(s): ${ex.slice(0, 4).join(', ')}`);
    if(typeof a.id !== 'string' || !BS_AUDIO_ID_RE.test(a.id)) no('audio.id is not a song-file id (lower-case letters, digits and dashes, up to 80)');
    if(!bsInt(a.bytes) || a.bytes <= 0 || a.bytes > BS_MAX_BYTES) no('audio.bytes is not a whole number from 1 to 36,000,000');
    if(typeof a.sha256 !== 'string' || !BS_SHA_RE.test(a.sha256)) no('audio.sha256 is not 64 lower-case hex letters');
    if(!bsNum(a.durationSec) || a.durationSec <= 0 || a.durationSec > BS_MAX_SEC) no('audio.durationSec is not a length above 0 and at most 1800 seconds');
    if(!bsNum(a.centsOff) || Math.abs(a.centsOff) > BS_MAX_CENTS) no(`audio.centsOff is ${JSON.stringify(a.centsOff)}: a record more than 10 cents off A = 440 is not published (send the file to Claude)`);
    if('gainDb' in a && (!bsNum(a.gainDb) || a.gainDb < -40 || a.gainDb > 40)) no('audio.gainDb is not a number from -40 to 40');
    if('sourceSha256' in a && (typeof a.sourceSha256 !== 'string' || !BS_SHA_RE.test(a.sourceSha256))) no('audio.sourceSha256 is not 64 lower-case hex letters');
  }
  const s = doc.song;
  if(!bsIsObj(s)) return no('song (the chart) is missing');
  const sx = bsKeysOnly(s, ['meter', 'bpm', 'anchor', 'barTimes', 'chords', 'bars', 'sections', 'level', 'range', 'sheet', 'capo']);
  if(sx.length) no(`the chart has unknown field(s): ${sx.slice(0, 4).join(', ')} (a built song is never a whole-song, journey, teacher-only, check or required card)`);
  if(s.sheet !== undefined){
    const sh = s.sheet;
    if(!bsIsObj(sh)) no('song.sheet is not { id, bytes, sha256, cols } (a chord sheet pdf in the song-file store)');
    else {
      const ex = bsKeysOnly(sh, ['id', 'bytes', 'sha256', 'cols']);
      if(ex.length) no(`song.sheet has unknown field(s): ${ex.slice(0, 4).join(', ')}`);
      if(typeof sh.id !== 'string' || !BS_SHEET_ID_RE.test(sh.id) || !BS_AUDIO_ID_RE.test(sh.id)) no("song.sheet.id is not 'sheet-' and lower-case letters, digits and dashes (a song-file id, up to 80)");
      else if(bsIsObj(a) && sh.id === a.id) no("song.sheet.id is the audio's id: the sheet is a file of its own");
      if(!bsInt(sh.bytes) || sh.bytes <= 0 || sh.bytes > BS_MAX_SHEET_BYTES) no('song.sheet.bytes is not a whole number from 1 to 5,000,000');
      if(typeof sh.sha256 !== 'string' || !BS_SHA_RE.test(sh.sha256)) no('song.sheet.sha256 is not 64 lower-case hex letters');
      if(sh.cols !== undefined && sh.cols !== 1 && sh.cols !== 2) no('song.sheet.cols is 1 (one column) or 2 (two columns), or left out');
    }
  }
  if(s.capo !== undefined && (!bsInt(s.capo) || s.capo < 1 || s.capo > 9)) no('song.capo is the fret the capo goes on, 1 to 9, or left out');
  const meter = bsMeter(s.meter);
  if(!meter) return no(`meter ${JSON.stringify(s.meter)} is not 4/4, 3/4 or 6/8`);
  if(!bsNum(s.bpm) || s.bpm < 30 || s.bpm > 260) no('bpm is not a number from 30 to 260 (counted beats a minute)');
  const dur = a && bsNum(a.durationSec) ? a.durationSec : 0;
  if(!bsNum(s.anchor) || s.anchor < 0 || (dur && s.anchor >= dur)) no('anchor (bar 1) is not a time inside the file');
  /* chords */
  const chords = bsIsObj(s.chords) ? s.chords : null;
  if(!chords) return no('chords is missing');
  const names = Object.keys(chords);
  if(!names.length || names.length > BS_MAX_CHORDS) no(`chords has ${names.length} chords (1 to ${BS_MAX_CHORDS})`);
  const lv = s.level;
  if(!bsIsObj(lv) || bsKeysOnly(lv, ['versions', 'start']).length || !['full', 'power', 'both'].includes(lv.versions)) return no('level is not { versions: full | power | both, start }');
  if(lv.versions === 'both' ? !['full', 'power'].includes(lv.start) : (lv.start !== undefined && lv.start !== lv.versions)) no('level.start is not the version the card opens on (needed with both)');
  const needFull = lv.versions !== 'power', needPower = lv.versions !== 'full';
  names.forEach(n => {
    const c = chords[n];
    if(!bsChordName(n)){ no(`chord name ${JSON.stringify(n).slice(0, 20)} is not a root A-G, # or b, and m or 5`); return; }
    if(!bsIsObj(c) || bsKeysOnly(c, ['full', 'power']).length){ no(`chord ${n} is not { full, power }`); return; }
    ['full', 'power'].forEach(k => {
      const sh = c[k];
      if(sh === null || sh === undefined){
        if(k === 'full' ? needFull : needPower) no(`chord ${n} has no ${k} shape, and the level needs one`);
        return;
      }
      const p = bsShapeProblem(n, sh, k);
      if(p) no(`chord ${n} (${k}): ${p}`);
    });
  });
  /* bars */
  const bars = Array.isArray(s.bars) ? s.bars : null;
  if(!bars || !bars.length || bars.length > BS_MAX_BARS) return no(`bars is not 1 to ${BS_MAX_BARS} bars`);
  bars.forEach((b, i) => { const p = bsBarParts(b, meter, chords); if(typeof p === 'string') no(`bar ${i + 1} ${p}`); });
  /* the grid fits the file */
  const barSec = bsNum(s.bpm) && s.bpm > 0 ? meter.bpb * 60 / s.bpm : 0;
  if(s.barTimes !== undefined){
    const bt = s.barTimes;
    if(!Array.isArray(bt) || bt.length < Math.max(3, bars.length) || bt.length > bars.length + 1 || !bt.every(bsNum)) no(`barTimes needs one downbeat per bar (${bars.length}, or one more for the end), at least 3`);
    else {
      if(Math.abs(bt[0] - s.anchor) > 0.001) no('barTimes[0] is not the anchor');
      for(let i = 1; i < bt.length; i++){
        const d = bt[i] - bt[i - 1];
        if(!(d > 0) || (barSec && (d < barSec * 0.5 || d > barSec * 2))){ no(`barTimes: bar ${i} is ${Math.round(d * 1000)} ms long, not near the bpm's ${Math.round(barSec * 1000)} ms`); break; }
      }
      const last = bt.length - 1, avg = last ? (bt[last] - bt[0]) / last : barSec;
      const end = bt.length > bars.length ? bt[bars.length] : bt[last] + (bars.length - last) * avg;
      if(dur && end > dur + 0.05) no(`the last bar ends at ${end.toFixed(2)} s, past the end of the file (${dur} s)`);
    }
  } else if(dur && barSec && bsNum(s.anchor) && s.anchor + bars.length * barSec > dur + 0.05){
    no(`${bars.length} bars at ${s.bpm} bpm from ${s.anchor} s end at ${(s.anchor + bars.length * barSec).toFixed(2)} s, past the end of the file (${dur} s)`);
  }
  /* sections */
  const secs = Array.isArray(s.sections) ? s.sections : null;
  if(!secs || !secs.length || secs.length > BS_MAX_SECTIONS) return no(`sections is not 1 to ${BS_MAX_SECTIONS} sections`);
  let next = 1;
  secs.forEach((x, i) => {
    const at = `section ${i + 1}`;
    if(!bsIsObj(x) || bsKeysOnly(x, ['name', 'n', 'from', 'bars', 'lyrics']).length){ no(`${at} is not { name, n, from, bars, lyrics }`); return; }
    if(!Object.prototype.hasOwnProperty.call(BS_SECTION_NAMES, x.name)) no(`${at}: ${JSON.stringify(String(x.name)).slice(0, 30)} is not on the list of section names`);
    if(x.n !== undefined && (!bsInt(x.n) || x.n < 1 || x.n > 9)) no(`${at}: its number is not 1 to 9`);
    if(!bsInt(x.bars) || x.bars < 1){ no(`${at} has ${JSON.stringify(x.bars)} bars (at least 1)`); return; }
    if(x.from !== next) no(`${at} starts at bar ${JSON.stringify(x.from)}, not ${next}: sections start at bar 1 and follow each other with no gap`);
    next = (bsInt(x.from) ? x.from : next) + x.bars;
    if(x.lyrics !== undefined){
      if(!Array.isArray(x.lyrics) || !x.lyrics.length || x.lyrics.length > x.bars){ no(`${at}: lyrics is not 1 to ${x.bars} lines`); return; }
      let sum = 0;
      x.lyrics.forEach((l, j) => {
        if(!bsIsObj(l) || bsKeysOnly(l, ['text', 'bars']).length || typeof l.text !== 'string' || l.text.length > BS_MAX_LYRIC || BS_CTRL_RE.test(l.text) || !bsInt(l.bars) || l.bars < 1) no(`${at}, lyric line ${j + 1} is not { text (up to ${BS_MAX_LYRIC} characters), bars }`);
        else sum += l.bars;
      });
      if(sum && sum !== x.bars) no(`${at}: its lyric lines cover ${sum} bars, not its ${x.bars}`);
    }
  });
  if(next - 1 !== bars.length) no(`the sections cover bars 1 to ${next - 1}, but the chart has ${bars.length} bars`);
  if(s.range !== undefined){
    const r = s.range;
    if(!bsIsObj(r) || bsKeysOnly(r, ['from', 'to']).length || !bsInt(r.from) || !bsInt(r.to) || r.from < 0 || r.to < r.from || r.to >= secs.length) no(`range is not { from, to } inside the ${secs.length} sections`);
  }
  if(why.length) return why;
  /* The expansion, checked as the card it becomes: one line of directions, an extra song only. */
  const ex = builtSongExpand(id, doc);
  const act = ex.activity;
  ['intro', 'intro_es', 'intro_power', 'intro_power_es'].forEach(k => { if(typeof act[k] === 'string' && act[k].length > BS_CAP) no(`the card's ${k} is ${act[k].length} characters (at most ${BS_CAP})`); });
  if(act.library !== true || act.optional !== true || act.journey || act.teacherOnly || act.kind === 'check' || act.card.wholeSong || act.card.sheet || act.view !== 'card')
    no('the card it makes is not an optional extra song (library, optional, no journey, wholeSong, sheet, teacherOnly or check)');
  const ov = act.card.otherViews;
  if(ov !== undefined && (!s.sheet || Object.keys(ov).join() !== 'lyrics' || ov.lyrics.sheetRead !== 'loose' || ov.lyrics.sheet !== SONG_FILE_PREFIX + s.sheet.id))
    no('the card\'s views are not one Lyrics view of its own sheet, read loose');
  return why;
}

/* ── The expansion: a checked doc → one ordinary practice card, one SNIPPET_TRACKS entry, one song-file entry.
   Every string a student reads comes from i18n.js (both languages) except the title, the artist and the lyric
   lines, which are the teacher's and the same in both. ── */
/* `capo`: the shape is drawn as written and SOUNDS that many half steps higher (song.capo). */
function bsNoteOf(name, shape, beats, label, capo){
  const f = shape.frets, frets = [], midi = [], up = capo || 0;
  for(let i = 0; i < 6; i++) if(f[i] !== null){ frets.push([BS_STRINGS[i], f[i]]); midi.push(BS_OPEN_MIDI[i] + f[i] + up); }
  return { frets, note: label || name, midi, beats };
}
function builtSongExpand(id, doc){
  const s = doc.song, meter = bsMeter(s.meter), lv = s.level, capo = s.capo || 0;
  const versions = lv.versions;
  const notesFull = versions !== 'power';          // the notes hold full chords (a power-only card holds power chords)
  /* The chords the CARD plays (the sections in its range), in the order they first sound: the directions line and
     the power-chord map name these and no others (review R1-3). */
  const used = [];
  const parts = s.bars.map(b => bsBarParts(b, meter, s.chords));
  const noteFor = x => {
    if(!x.name) return { rest: true, beats: x.beats };
    const c = s.chords[x.name];
    return notesFull ? bsNoteOf(x.name, c.full, x.beats, undefined, capo) : bsNoteOf(x.name, c.power, x.beats, bsChordName(x.name).q === '5' ? x.name : bsPowerName(x.name), capo);
  };
  const r = s.range || { from: 0, to: s.sections.length - 1 };
  const sections = s.sections.slice(r.from, r.to + 1).map(x => {
    const notes = [], rows = [], labels = [];
    const lines = Array.isArray(x.lyrics) ? x.lyrics : null;
    let bar = x.from - 1;
    (lines || [{ text: '', bars: x.bars }]).forEach(l => {
      let n = 0;
      for(let k = 0; k < l.bars; k++, bar++) parts[bar].forEach(p => { if(p.name && !used.includes(p.name)) used.push(p.name); notes.push(noteFor(p)); n++; });
      rows.push(n); labels.push(l.text);
    });
    const out = { label: bsSectionLabel(x, 'en'), label_es: bsSectionLabel(x, 'es'),
      caption: bsSectionLabel(x, 'en'), caption_es: bsSectionLabel(x, 'es'), fromBar: x.from, bars: x.bars, notes };
    if(lines && labels.some(Boolean)){ out.rows = rows; out.rowLabels = labels.slice(); out.rowLabels_es = labels.slice(); }
    return out;
  });
  const tail = doc.artist && doc.artist.trim() ? ' - ' + doc.artist.trim() : '';
  const name = '"' + doc.title.trim() + '"' + tail;
  /* E and Em are both E5: a name is said once, in the order it first sounds (review R1-2). */
  const fullNames = used.slice(), powerNames = [...new Set(used.map(n => bsChordName(n).q === '5' ? n : bsPowerName(n)))];
  const shown = notesFull ? fullNames : powerNames;
  const act = {
    id, view: 'card', library: true, optional: true,
    title: name + BS_SEP + bsLang('bs.titleEnd', 'en'), title_es: name + BS_SEP + bsLang('bs.titleEnd', 'es'),
    intro: bsIntro(shown, 'en', capo), intro_es: bsIntro(shown, 'es', capo),
    card: { track: id, chordGrid: true, slowest: true, caption: bsLang('bs.caption', 'en'), caption_es: bsLang('bs.caption', 'es'), sections, checks: [] },
    steps: [],
  };
  if(versions === 'both'){
    const power = {};
    used.forEach(n => { power[n] = bsNoteOf(n, s.chords[n].power, undefined, bsChordName(n).q === '5' ? n : bsPowerName(n), capo); delete power[n].beats; });
    act.chordVersions = { power };
    act.chordStart = lv.start;
    act.intro_power = bsIntro(powerNames, 'en', capo); act.intro_power_es = bsIntro(powerNames, 'es', capo);
  }
  /* THE LYRICS VIEW (song.sheet): the card's sections, drawn as his pdf, read loose (CARD VIEWS, app/cards-views.js;
     THE LOOSE READ, app/cards-sheet.js). One column unless cols is 2. */
  let sheet = null;
  if(bsIsObj(s.sheet)){
    const lyrics = { sheet: SONG_FILE_PREFIX + s.sheet.id, sheetRead: 'loose' };
    if(s.sheet.cols !== 2) lyrics.sheetColumns = 1;
    act.card.otherViews = { lyrics };
    sheet = { file: s.sheet.id + '.pdf', bytes: s.sheet.bytes, sha256: s.sheet.sha256, durationSec: 1 };
  }
  const track = { src: SONG_FILE_PREFIX + doc.audio.id, trackBpm: s.bpm, feltBpm: s.bpm, beatsPerBar: meter.bpb,
    durationSec: doc.audio.durationSec, anchor: s.anchor, anchorVerified: true };
  if(meter.countSix) track.countSix = true;
  if(Array.isArray(s.barTimes)) track.barTimes = s.barTimes.slice();
  const audio = { file: doc.audio.id + '.mp3', bytes: doc.audio.bytes, sha256: doc.audio.sha256, durationSec: doc.audio.durationSec };
  return { activity: act, track, audio, sheet };
}
/* ── The merge ── */
let bsApplied = new Map();      // id -> { ver, sha, title } of the built songs on this page now
let bsSig = '';                 // what is on the page, to repaint only on a change
let bsGen = 0;                  // a newer sync drops an older one
let bsPending = null;           // the promise of the sync in flight, or null
let bsLastRead = 0;             // when the list was last read with an answer (read, missing or refused); 0 = never
let bsLogged = false;           // at most one error-log line per page
let bsWaiter = null;            // { id, fn } a deep link waiting for the first merge
const BS_IDB = 'gc-built-songs', BS_IDB_WAIT_MS = 4000;
/* A tab return reads the list again only when its last answered read (read, missing or refused) is older than
   this. Every tab return by every student would otherwise cost a read, and Firestore's free daily reads are
   shared with saving. A sign-in always reads once. A read that failed (offline) does not start the clock. */
const BS_RETURN_MS = 15 * 60 * 1000;

function bsIdb(){
  return new Promise(resolve => {
    let req;
    setTimeout(() => resolve(null), BS_IDB_WAIT_MS);
    try { req = indexedDB.open(BS_IDB, 1); } catch(e) { resolve(null); return; }
    req.onupgradeneeded = () => { try { req.result.createObjectStore('songs', { keyPath: 'id' }); } catch(e) {} };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => resolve(null);
    req.onblocked = () => resolve(null);
  });
}
function bsCopyDo(mode, fn){
  return Promise.race([
    bsIdb().then(db => new Promise(resolve => {
      if(!db){ resolve(null); return; }
      let r;
      try { const tx = db.transaction('songs', mode); r = fn(tx.objectStore('songs')); tx.oncomplete = () => { try { db.close(); } catch(e) {} resolve(r && 'result' in r ? r.result : null); }; tx.onerror = tx.onabort = () => { try { db.close(); } catch(e) {} resolve(null); }; }
      catch(e){ resolve(null); }
    })).catch(() => null),
    new Promise(r => setTimeout(() => r(null), BS_IDB_WAIT_MS)),
  ]);
}
/* { id -> { ver, doc } } from the device, or {} */
async function bsCopyRead(){
  const rec = await bsCopyDo('readonly', st => st.get('all'));
  return rec && bsIsObj(rec.songs) ? rec.songs : {};
}
function bsCopyWrite(songs){ return bsCopyDo('readwrite', st => st.put({ id: 'all', savedAt: Date.now(), songs })); }

function bsLog(msg){
  if(bsLogged) return;
  bsLogged = true;
  try { if(typeof SITE_ERRORS !== 'undefined') SITE_ERRORS.report('error', { message: 'Built song refused: ' + String(msg).slice(0, 200) }); } catch(e) {}
}
function bsCode(e){ return e && e.code ? String(e.code) : ''; }
function bsDenied(e){ const c = bsCode(e); return c === 'permission-denied' || c === 'unauthenticated' || /permission/i.test(c); }
/* The meta list's songs, each key and value checked (the rules cannot): id -> edit number. */
function bsListOf(data){
  const out = {};
  const m = data && bsIsObj(data.songs) ? data.songs : {};
  Object.keys(m).slice(0, BS_MAX_SONGS * 2).forEach(k => {
    const v = m[k];
    if(BS_ID_RE.test(k) && bsInt(v) && v >= 1 && v <= 1e9 && Object.keys(out).length < BS_MAX_SONGS) out[k] = v;
  });
  return out;
}
/* Who may see built songs on this page: someone signed in. The console reads them too (its Songs view). */
function bsHost(){ return { user: typeof currentUser !== 'undefined' ? currentUser : null, db: () => (typeof ensureDb === 'function' ? ensureDb() : null) }; }

/* "Date added" (2026-11-23): a built song's date on the Songs page is the day (this device's calendar) of the doc's
   savedAt, the server time of its last Import or Publish. The doc's FORMAT is unchanged (no new field: the rules
   allow none, and an older page refuses an unknown one); the date rides beside the doc, in the entry and in the
   device copy ({ ver, doc, added }), and lands on the activity as `added` (app/explore.js songAddedOf). '' = not
   known: the Songs page counts it as SONG_ADDED_DEFAULT. */
function bsDayOk(d){ return typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : ''; }
function bsDayOf(t){
  try {
    const d = t && typeof t.toDate === 'function' ? t.toDate() : (t instanceof Date ? t : null);
    if(!d || isNaN(d.getTime())) return '';
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  } catch(e){ return ''; }
}
/* Keep the songs that pass, in id order: { id, ver, doc, added, ex }. A song that clashes with the page's own data or
   another built song's audio is left out alone. */
function bsKeep(entries){
  const kept = [], audioSha = new Map();
  const coded = new Set((window.CLASS_ACTIVITIES || []).filter(a => !bsApplied.has(a.id)).map(a => a.id));
  entries.sort((x, y) => x.id < y.id ? -1 : 1).forEach(e => {
    const why = builtSongCheck(e.id, e.doc);
    /* Its song files: the audio, and the chord sheet when it has one. Each is checked as the audio always was. */
    const files = why.length ? [] : [['audio', e.doc.audio.id, e.doc.audio.sha256]].concat(bsIsObj(e.doc.song.sheet) ? [['sheet', e.doc.song.sheet.id, e.doc.song.sheet.sha256]] : []);
    if(!why.length){
      if(coded.has(e.id) || (typeof SNIPPET_TRACKS !== 'undefined' && Object.prototype.hasOwnProperty.call(SNIPPET_TRACKS, e.id) && !bsApplied.has(e.id))) why.push('its id is already a coded activity or track');
      else for(const [what, fid, sha] of files){
        if(typeof SONG_FILES !== 'undefined' && Object.prototype.hasOwnProperty.call(SONG_FILES, fid)){ why.push(`its ${what} id ${fid} is on the site's list of song files (the list wins)`); break; }
        if(audioSha.has(fid) && audioSha.get(fid) !== sha){ why.push(`its ${what} id ${fid} is another built song's, with other bytes`); break; }
      }
    }
    if(why.length){ bsLog(e.id + ': ' + why[0]); return; }
    files.forEach(([, fid, sha]) => audioSha.set(fid, sha));
    const ex = builtSongExpand(e.id, e.doc);
    if(e.added) ex.activity.added = e.added;    // the Songs page's "Date added" (bsDayOf)
    kept.push(Object.assign({}, e, { ex }));
  });
  return kept;
}
/* Replace every built entry on the page with `kept`, as a whole. Returns true when anything changed. */
function bsApply(kept){
  const sig = kept.map(k => k.id + ':' + k.ver + ':' + k.doc.audio.sha256 + ':' + (k.added || '')).join('|');
  if(sig === bsSig) return false;
  const list = window.CLASS_ACTIVITIES;
  if(Array.isArray(list)){
    for(let i = list.length - 1; i >= 0; i--) if(list[i] && bsApplied.has(list[i].id)) list.splice(i, 1);
    kept.forEach(k => list.push(k.ex.activity));
  }
  if(typeof SNIPPET_TRACKS !== 'undefined'){
    bsApplied.forEach((_, id) => { delete SNIPPET_TRACKS[id]; });
    kept.forEach(k => { SNIPPET_TRACKS[k.id] = k.ex.track; });
  }
  const audio = {};
  kept.forEach(k => { audio[k.doc.audio.id] = k.ex.audio; if(k.ex.sheet) audio[k.doc.song.sheet.id] = k.ex.sheet; });
  if(typeof songFilesSetBuilt === 'function') songFilesSetBuilt(audio);
  bsApplied = new Map(kept.map(k => [k.id, { ver: k.ver, sha: k.doc.audio.sha256, title: k.doc.title }]));
  bsSig = sig;
  return true;
}
function bsRepaint(){
  try {
    if(typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE){
      if(typeof teacherView !== 'undefined' && teacherView === 'songs' && typeof renderTeacherSongs === 'function') renderTeacherSongs();
      if(typeof teacherBsOnMerged === 'function') teacherBsOnMerged();
    } else if(typeof refreshSongsPlayAlong === 'function') refreshSongsPlayAlong();
  } catch(e) {}
}
/* Every built song off the page (sign-out, an account the rules refuse). */
function builtSongsClear(){
  bsGen++;
  if(bsApply([])) bsRepaint();
}
/* One sync: read the list, the changed songs, check, merge. Resolves when done (never rejects). */
function builtSongsSync(){
  const gen = ++bsGen;
  const p = bsSyncOnce(gen).catch(() => {}).then(() => {
    if(bsPending === p) bsPending = null;
    bsWaiterRun();
  });
  bsPending = p;
  return p;
}
async function bsSyncOnce(gen){
  const host = bsHost(), user = host.user;
  const live = () => gen === bsGen && bsHost().user === user;
  if(!user){ if(bsApply([])) bsRepaint(); return; }
  const teacher = typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE;
  let db = null;
  try { db = await host.db(); } catch(e) {}
  let list = null, offline = !db, denied = false;
  if(db){
    try {
      const snap = await db.collection('builtSongsMeta').doc('list').get();
      list = snap.exists ? bsListOf(snap.data()) : {};
      bsLastRead = Date.now();
    } catch(e){
      if(bsDenied(e)){ list = {}; denied = true; bsLastRead = Date.now(); }
      else offline = true;
    }
  }
  if(!live()) return;
  const copy = teacher ? {} : await bsCopyRead();
  if(!live()) return;
  if(offline){
    /* No answer from the database: the device copy, while someone is signed in. */
    const entries = Object.keys(copy).filter(id => BS_ID_RE.test(id) && copy[id] && bsIsObj(copy[id].doc)).map(id => ({ id, ver: copy[id].ver, doc: copy[id].doc, added: bsDayOk(copy[id].added) }));
    if(bsApply(bsKeep(entries))) bsRepaint();
    return;
  }
  const ids = Object.keys(list);
  const entries = [];
  await Promise.all(ids.map(async id => {
    const have = copy[id];
    /* A copy written before "Date added" (no `added` string) is read again once, for its date. */
    if(have && have.ver === list[id] && bsIsObj(have.doc) && typeof have.added === 'string'){ entries.push({ id, ver: have.ver, doc: have.doc, added: bsDayOk(have.added) }); return; }
    try {
      const snap = await db.collection('builtSongs').doc(id).get();
      if(snap.exists){
        const d = Object.assign({}, snap.data());
        const added = bsDayOf(d.savedAt);
        delete d.savedAt;                       // a server Timestamp: not part of the chart, and not cloneable everywhere
        entries.push({ id, ver: list[id], doc: d, added });
      }
    } catch(e){
      if(!bsDenied(e) && have && bsIsObj(have.doc)) entries.push({ id, ver: have.ver, doc: have.doc, added: bsDayOk(have.added) });
    }
  }));
  if(!live()) return;
  const kept = bsKeep(entries);
  if(bsApply(kept)) bsRepaint();
  /* A refused read is no answer about the songs: the device copy is left as it was (and not used). */
  if(!teacher && !denied){
    const out = {};
    kept.forEach(k => { out[k.id] = { ver: k.ver, doc: k.doc, added: k.added || '' }; });
    try { await bsCopyWrite(out); } catch(e) {}
  }
}
/* A tab return: again, only while signed in, and only when the last answered read is older than BS_RETURN_MS
   (15 minutes) (app/start.js). */
function builtSongsSyncSoon(){
  const u = bsHost().user;
  if(!u || (typeof isDevBypassUser === 'function' && isDevBypassUser()) || bsPending) return;
  if(Date.now() - bsLastRead < BS_RETURN_MS) return;
  builtSongsSync();
}
/* A deep link to an 'sb-' id that is not on the page yet: true when a merge is still on its way (then fn runs
   once after it, if the address still names that card). */
function builtSongWait(id, fn){
  if(typeof id !== 'string' || !BS_ID_RE.test(id) || !bsPending) return false;
  bsWaiter = { id, fn };
  return true;
}
function bsWaiterRun(){
  const w = bsWaiter;
  bsWaiter = null;
  if(!w) return;
  try { if(String(location.hash || '').indexOf(w.id) >= 0) w.fn(); } catch(e) {}
}
function builtSongIds(){ return [...bsApplied.keys()]; }
function isBuiltSongId(id){ return typeof id === 'string' && BS_ID_RE.test(id); }
