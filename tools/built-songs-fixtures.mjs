/* built-songs-fixtures.mjs — MADE-UP built songs (app/builtsongs.js, format v1) for the Node and browser tools
   (2026-11-14): tools/built-songs-sim.mjs, tools/playalong-loop.mjs --built, tools/song-files-e2e.mjs.
   Titles, artists and lyric lines are invented ("Test …"); no real record, chart or lyric is here.

     FIXTURES               { name: { id, doc } } — the docs WITHOUT their audio entry's bytes and SHA-256
     withAudio(doc, bytes, sha256, durationSec?)   a copy with audio filled in (the caller makes the bytes)
     ca51Built(activity, track)   a built copy of ca-51's chart (Perdón Mamá), from the coded card and its
                            track: the same bars, sections and chords, so a walk of the two can be compared
     brokenFixtures(good)   [{ rule, id, doc }]: one doc per validator rule, each wrong in that one way
     importFile(id, doc)    the Import file Claude hands Jonathan: { id, v, title, artist, audio, song }

   Shapes are [low E, A, D, G, B, high e], a fret or null. */

export const SHAPES = {
  G: [3, 2, 0, 0, 0, 3], C: [null, 3, 2, 0, 1, 0], D: [null, null, 0, 2, 3, 2], Em: [0, 2, 2, 0, 0, 0],
  Am: [null, 0, 2, 2, 1, 0], A: [null, 0, 2, 2, 2, 0], E: [0, 2, 2, 1, 0, 0], F: [1, 3, 3, 2, 1, 1],
  Bm: [null, 2, 4, 4, 3, 2], Dm: [null, null, 0, 2, 3, 1],
};
export const POWER = {
  G: [3, 5, 5, null, null, null], C: [null, 3, 5, 5, null, null], D: [null, null, 0, 2, null, null],
  E: [0, 2, 2, null, null, null], A: [null, 0, 2, 2, null, null], F: [1, 3, 3, null, null, null], B: [null, 2, 4, 4, null, null],
};
const rootOf = n => n.replace(/m$|5$/, '');
const chord = (n, full = true, power = true) => ({ full: full ? { frets: SHAPES[n] || null } : null, power: power ? { frets: POWER[rootOf(n)] } : null });
const chords = (names, full, power) => Object.fromEntries(names.map(n => [n, chord(n, full, power)]));
const AUDIO0 = durationSec => ({ id: '', bytes: 1, sha256: '0'.repeat(64), durationSec, centsOff: 0 });
const doc = (title, artist, durationSec, song) => ({ v: 1, title, artist, audio: AUDIO0(durationSec), song });
const rep = (arr, n) => Array.from({ length: n }, (_, i) => arr[i % arr.length]);

export const FIXTURES = {
  /* 4/4 at 96: intro 4, verse 1 with two lyric lines, chorus 8. Full chords only. */
  fourFour: { id: 'sb-test44aaaa', doc: doc('Test Song Four', 'Test Band', 55, {
    meter: '4/4', bpm: 96, anchor: 0.5, chords: chords(['G', 'C', 'D', 'Em']),
    bars: [...rep(['G', 'C'], 4), ...rep(['G', 'D', 'Em', 'C'], 8), ...rep(['C:2 D:2', 'G'], 8)],
    sections: [{ name: 'intro', from: 1, bars: 4 },
      { name: 'verse', n: 1, from: 5, bars: 8, lyrics: [{ text: 'Test line one goes here', bars: 4 }, { text: 'Test line <two> & "three"', bars: 4 }] },
      { name: 'chorus', from: 13, bars: 8 }],
    level: { versions: 'full' } }) },
  /* 3/4 at 120 (a bar is 1.5 s): power chords only. */
  threeFour: { id: 'sb-test34bbbb', doc: doc('Test Waltz', 'Test Trio', 30, {
    meter: '3/4', bpm: 120, anchor: 0.25, chords: chords(['A', 'D', 'E'], false, true),
    bars: rep(['A', 'D', 'E', 'A:2 E:1'], 16),
    sections: [{ name: 'verse', from: 1, bars: 8 }, { name: 'chorus', from: 9, bars: 8 }],
    level: { versions: 'power' } }) },
  /* 6/8 counted in two (countSix), a split bar, a bar in thirds, a rest; both versions, opening on power chords. */
  sixEight: { id: 'sb-test68cccc', doc: doc('Test Six Eight', 'Test Duo', 45, {
    meter: '6/8', bpm: 76, anchor: 0.4, chords: chords(['Am', 'F', 'C', 'G']),
    bars: [...rep(['Am', 'F', 'C', 'G'], 8), 'Am:1 F:1', 'C:2/3 G:4/3', '-', 'Am', ...rep(['F', 'C', 'G', 'Am'], 8)],
    sections: [{ name: 'intro', from: 1, bars: 8 }, { name: 'verse', from: 9, bars: 4 }, { name: 'chorus', from: 13, bars: 8 }],
    level: { versions: 'both', start: 'power' } }) },
  /* A beat map: 12 bars a little uneven, from three or more pins. Both versions, opening on full chords. */
  beatMap: { id: 'sb-testbtdddd', doc: doc('Test Beat Map', 'Test Live Band', 40, {
    meter: '4/4', bpm: 100, anchor: 1.0,
    barTimes: [1.0, 3.43, 5.85, 8.30, 10.70, 13.12, 15.58, 18.00, 20.38, 22.80, 25.25, 27.70, 30.10],
    chords: chords(['E', 'A', 'D']),
    bars: rep(['E', 'A', 'D', 'A'], 12),
    sections: [{ name: 'verse', from: 1, bars: 8 }, { name: 'outro', from: 9, bars: 4 }],
    level: { versions: 'both', start: 'full' } }) },
  /* Power chords named as power chords (E5, A5, B5): no full shapes at all. */
  powerOnly: { id: 'sb-testpweeee', doc: doc('Test Power', 'Test Rockers', 30, {
    meter: '4/4', bpm: 120, anchor: 0.0,
    chords: { E5: { full: null, power: { frets: POWER.E } }, A5: { full: null, power: { frets: POWER.A } }, B5: { full: null, power: { frets: POWER.B } } },
    bars: rep(['E5', 'A5', 'B5', 'A5:2 B5:2'], 12),
    sections: [{ name: 'riff', from: 1, bars: 4 }, { name: 'verse', from: 5, bars: 8 }],
    level: { versions: 'power' } }) },
  /* Lyric lines everywhere, one with no words, and a 1-bar ending. */
  lyrics: { id: 'sb-testlyffff', doc: doc('Test Words', '', 40, {
    meter: '4/4', bpm: 90, anchor: 0.3, chords: chords(['C', 'Am', 'F', 'G']),
    bars: [...rep(['C', 'Am', 'F', 'G'], 12), 'C'],
    sections: [{ name: 'verse', n: 1, from: 1, bars: 8, lyrics: [{ text: 'Test words for the first line', bars: 2 }, { text: '', bars: 2 }, { text: 'Test words for the third line', bars: 4 }] },
      { name: 'chorus', from: 9, bars: 4, lyrics: [{ text: 'Test chorus words, all four bars', bars: 4 }] },
      { name: 'ending', from: 13, bars: 1 }],
    level: { versions: 'full' } }) },
  /* Fifteen sections of two bars, every one with lyric lines (the biggest doc the format allows in sections). */
  fifteen: { id: 'sb-test15gggg', doc: doc('Test Fifteen', 'Test Many Parts', 70, {
    meter: '4/4', bpm: 120, anchor: 0.2, chords: chords(['G', 'D', 'Em', 'C']),
    bars: rep(['G', 'D', 'Em', 'C'], 30),
    sections: Array.from({ length: 15 }, (_, i) => ({ name: ['verse', 'chorus', 'bridge'][i % 3], n: Math.floor(i / 3) + 1, from: 1 + 2 * i, bars: 2,
      lyrics: [{ text: `Test line ${i + 1}a with some made-up words to fill it out`, bars: 1 }, { text: `Test line ${i + 1}b with more made-up words in it`, bars: 1 }] })),
    level: { versions: 'both', start: 'power' } }) },
  /* A from-to range: four sections, the card plays the middle two. */
  range: { id: 'sb-testrghhhh', doc: doc('Test Range', 'Test Band', 50, {
    meter: '4/4', bpm: 100, anchor: 0.6, chords: chords(['D', 'G', 'A', 'Bm']),
    bars: rep(['D', 'G', 'A', 'Bm'], 16),
    sections: [{ name: 'intro', from: 1, bars: 4 }, { name: 'verse', from: 5, bars: 4 }, { name: 'chorus', from: 9, bars: 4 }, { name: 'outro', from: 13, bars: 4 }],
    level: { versions: 'full' }, range: { from: 1, to: 2 } }) },
};

export function withAudio(d, bytes, sha256, durationSec){
  const out = JSON.parse(JSON.stringify(d));
  out.audio = Object.assign({}, out.audio, { bytes, sha256 }, durationSec ? { durationSec } : {});
  return out;
}
/* Each fixture's audio id: '<song id>-<first 10 of the SHA-256>' (what tools/new-playalong.mjs --built writes). */
export function audioIdFor(id, sha256){ return id + '-' + sha256.slice(0, 10); }

export function importFile(id, d){ return { id, v: d.v, title: d.title, artist: d.artist, audio: d.audio, song: d.song }; }

/* ca-51 as a built song: its sections, bars and chords read off the coded card (6/8, two big beats a bar). */
const STR = ['E', 'A', 'D', 'G', 'B', 'e'];
const frets6 = f => STR.map(s => { const h = f.find(([x]) => x === s); return h ? h[1] : null; });
export function ca51Built(a, tr){
  const bpb = tr.beatsPerBar, chordsOut = {}, bars = [], sections = [];
  const names = { Intro: 'intro', Verse: 'verse', Interlude: 'interlude', Ending: 'ending' };
  for (const s of a.card.sections) {
    const m = /^(\w+)(?: (\d))?$/.exec(s.label);
    sections.push(Object.assign({ name: names[m[1]] }, m[2] ? { n: +m[2] } : {}, { from: s.fromBar, bars: s.bars }));
    let cur = [], fill = 0;
    for (const n of s.notes) {
      chordsOut[n.note] = chordsOut[n.note] || { full: { frets: frets6(n.frets) }, power: { frets: frets6(a.chordVersions.power[n.note].frets) } };
      let left = n.beats;
      while (left > 1e-9) {
        const take = Math.min(left, bpb - fill);
        cur.push(n.note + ':' + take); fill += take; left -= take;
        if (fill >= bpb - 1e-9) { bars.push(cur.length === 1 ? cur[0].split(':')[0] : cur.join(' ')); cur = []; fill = 0; }
      }
    }
  }
  return { v: 1, title: 'Test copy of ca-51', artist: 'Test', audio: AUDIO0(tr.durationSec), song: {
    meter: '6/8', bpm: tr.feltBpm, anchor: tr.anchor, chords: chordsOut, bars, sections, level: { versions: 'both', start: 'power' } } };
}

/* One broken doc per validator rule (app/builtsongs.js builtSongCheck), each from a good one. */
export function brokenFixtures(good){
  const B = [];
  const add = (rule, mut, id) => { const d = JSON.parse(JSON.stringify(good.doc)); mut(d); B.push({ rule, id: id || 'sb-brk' + String(B.length).padStart(3, '0') + 'zzzz', doc: d }); };
  add('format v 2', d => { d.v = 2; });
  add('an id without sb-', () => {}, 'xb-test0broken');
  add('an id with a capital', () => {}, 'sb-Testbroken1');
  add('an unknown top field', d => { d.extra = 1; });
  add('a title with the long-dash separator', d => { d.title = 'Test — Song'; });
  add('an empty title', d => { d.title = '   '; });
  add('an artist with the long-dash separator', d => { d.artist = 'Test — Band'; });
  add('audio with an extra field', d => { d.audio.extra = 1; });
  add('audio.id not a song-file id', d => { d.audio.id = 'Bad_Id'; });
  add('audio.bytes 0', d => { d.audio.bytes = 0; });
  add('audio.sha256 in capitals', d => { d.audio.sha256 = d.audio.sha256.toUpperCase().replace(/^[0-9]/, 'A'); });
  add('centsOff 10.1', d => { d.audio.centsOff = 10.1; });
  add('centsOff -10.5', d => { d.audio.centsOff = -10.5; });
  add('a chart field that would make a whole-song card', d => { d.song.wholeSong = true; });
  add('a chart field that would make a sheet card', d => { d.song.sheet = 'sheets/x.pdf'; });
  add('a chart field that would make it required', d => { d.song.optional = false; });
  add('meter 5/4', d => { d.song.meter = '5/4'; });
  add('bpm 0', d => { d.song.bpm = 0; });
  add('anchor past the end of the file', d => { d.song.anchor = d.audio.durationSec + 1; });
  add('the bars run past the end of the file', d => { d.song.bpm = 31; });
  add('a chord not in chords', d => { d.song.bars[0] = 'Zz'; });
  add('a bar whose beats do not add up', d => { d.song.bars[1] = d.song.meter === '6/8' ? 'Am:1 F:2' : 'G:3 C:3'; });
  add('a chord name that is not a chord', d => { d.song.chords['Gsus4'] = d.song.chords[Object.keys(d.song.chords)[0]]; });
  add('a fret of 25', d => { const k = Object.keys(d.song.chords)[0]; const sh = d.song.chords[k].full || d.song.chords[k].power; sh.frets[0] = 25; });
  add('a full shape that is not the chord', d => { const k = Object.keys(d.song.chords).find(n => d.song.chords[n].full); d.song.chords[k].full.frets = [0, 0, 0, 0, 0, 0].map((x, i) => i === 1 ? 1 : x); });
  add('a power shape with the fifth lowest', d => { const k = Object.keys(d.song.chords).find(n => d.song.chords[n].power); const f = d.song.chords[k].power.frets; d.song.chords[k].power.frets = [null, null, null, null, null, null]; d.song.chords[k].power.frets[1] = f[0] != null ? f[0] + 2 : 7; d.song.chords[k].power.frets[2] = f[0] != null ? f[0] + 2 : 7; });
  add('a level that needs a shape it does not have', d => { const k = Object.keys(d.song.chords)[0]; d.song.chords[k].power = null; d.song.level = { versions: 'both', start: 'full' }; });
  add('sections that do not start at bar 1', d => { d.song.sections[0].from = 2; });
  add('sections with a gap', d => { d.song.sections[1].from += 1; });
  add('sections that do not reach the last bar', d => { d.song.bars.push(d.song.bars[0]); });
  add('a section name not on the list', d => { d.song.sections[0].name = 'tag'; });
  add('a section of 0 bars', d => { d.song.sections.push({ name: 'outro', from: d.song.bars.length + 1, bars: 0 }); });
  add('16 sections', d => { const n = d.song.bars.length; d.song.bars = Array.from({ length: 16 }, (_, i) => d.song.bars[i % n]); d.song.sections = Array.from({ length: 16 }, (_, i) => ({ name: 'verse', from: i + 1, bars: 1 })); });
  add('lyric lines that do not cover the section', d => { const s = d.song.sections.find(x => x.lyrics) || d.song.sections[0]; s.lyrics = [{ text: 'Test', bars: s.bars + 1 }]; });
  add('a range outside the sections', d => { d.song.range = { from: 0, to: d.song.sections.length }; });
  add('barTimes that do not start at the anchor', d => { d.song.barTimes = d.song.bars.map((_, i) => d.song.anchor + 0.2 + i * 2.5); });
  return B;
}
