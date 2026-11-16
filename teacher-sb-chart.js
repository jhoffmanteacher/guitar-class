/* ── Song builder: the Chart and Level steps (2026-11-16, Song builder Part c) ───────────────────────────
   Steps 4 and 5 of the Song builder (teacher-sb-core.js has the view and the draft; work order "Claude outputs/
   WORK-ORDER-song-builder.md", Part c). Jonathan pastes the song's chord chart; the builder READS it into
   sections and bars, he sets the truth in the GRID, and picks the LEVEL. Nothing here reaches a student until
   Publish (teacher-sb-publish.js, Part d).

   THE READER (sbChartRead; pure, run in Node by tools/song-builder-sim.mjs on made-up charts). It reads
     - chord lines over lyric lines        G        D         /  Lanterns on the Calder street
     - ChordPro                            [G]Lanterns on the [D]Calder street
     - bar lines                           | G | D | Em C |      (two chords in a bar share it; % = the bar before)
     - section headers                     [Verse 1]   Chorus:   CORO   {start_of_chorus}   [Intro] G D Em C
     - "x2" on a line or a header, and a header with nothing under it or "same chords as Verse 1": copied
   and REFUSES, line by line and with the reason: TAB ("e|--3--2--"), number charts ("1 4 5", "I IV V"), and a
   chord symbol it cannot read ("Bdim", "G7#9"). A refused line is left out and FLAGGED until Jonathan says
   "Leave it out" or types its chords. A slash chord or a seventh FOLDS to the plain chord (G/B and G7 are G, Am7
   is Am) and the step says so. Chords over lyrics do not say how long a chord lasts: each gets ONE bar, and the
   step says how many bars the chart makes against how many the recording has ("Hold the long ones in the grid").
   A line that starts with # is ignored (that is what "Leave it out" writes).

   SECTIONS take a name from the fixed list (BS_SECTION_NAMES, app/builtsongs.js: the words students see come from
   i18n.js) and a number; English and Spanish header words are known ("Coro", "Puente"). A header that is not on the
   list is kept with NO name, and the grid asks him to pick one.

   SHAPES (sbShapeOf): a chord in the site's CHORD_DIAGRAMS (guitar-diagrams.js) takes that shape; any other major,
   minor or 5 chord takes the E-shape or A-shape barre (the lower one on the neck); a power chord is the site's
   three-string shape with its root on the low E string (E to A) or the A string (Bb to Eb). Every shape is one
   builtSongCheck takes (tools/song-builder-sim.mjs: all 36). A full chord the class has NOT been taught
   (SB_TAUGHT_FULL) is flagged: "Keep (the card shows its diagram)" or "Swap for…".

   THE GRID is where the truth is set: a bar's chord, a bar split (2 + 2, 3 + 1, 1 + 3), a rest, + Bar (hold: the
   same chord one more bar), Remove bar, a new section from a bar, a section edge moved one bar, a section joined to
   the one before, its name and number, a lyric line's words. Undo steps back (this tab only).

   THE LEVEL: Full chords only / Power chords only / Both with the switch (and which one it opens on); the whole
   song or a from-to range of sections (Jonathan, 2026-11-14: a range, no free ticks). The card always loops.

   Saved in the draft (songDrafts/{id}; teacher only) as
     chart: { text, meter, fmt, sections: [{ name|null, label, n|null, bars: ['G', 'G:2 C:2', '-'], lyrics:
              [{ text, bars }]|null, copied }], left: [refused line numbers he has dealt with], kept: [chord names
              kept though not taught], edited }
     level: { versions: 'full'|'power'|'both', start, range: { from, to }|null }
   sbSongOf(d) makes the `song` builtSongs takes (app/builtsongs.js) from the beat, the chart and the level, and
   sbSongWhy(d, id) is builtSongCheck's own answer on it: the same function every student page runs. Preview and
   Publish (teacher-sb-publish.js, Part d) use the same two.
   THE CHART CAN COME EARLY (Jonathan, 2026-11-15: "the app should allow me to upload chord charts, etc. as other
   things are being worked on like levels ... and/or to let me put all the files in the initial upload"): step 1
   has a box for it, and step 4 opens as soon as the draft exists; it is read in 4/4 until the Beat step says
   otherwise, and read again by itself when the meter changes and the grid has not been edited by hand.
   PDFS (teacher-sb-pdf.js, 2026-11-16): the "Pdfs" bar above this step takes chords pdfs (their text goes into the
   paste box) and tab pdfs (shown beside the chart, never read). */
const SB_TAUGHT_FULL = ['E', 'Em', 'A', 'Am', 'D', 'Dm', 'G', 'C', 'F', 'Bm'];   // Module 4's open chords and its Bm
const SB_CHART_MAX = 20000;            // characters of pasted chart kept
const SB_FOLD_MAJ = ['7', 'maj7', 'M7', 'Maj7', 'ma7', '9', 'maj9', 'add9', 'add2', '2', '4', 'sus', 'sus2', 'sus4', '7sus4', '7sus', '6', '11', '13', 'add4', 'maj', 'M', 'Maj'];
const SB_FOLD_MIN = ['m7', 'min7', 'mi7', '-7', 'm9', 'm6', 'madd9', 'm11', 'min', 'mi', '-'];
const SB_SPLITS = { '4/4': [[4], [2, 2], [3, 1], [1, 3]], '3/4': [[3], [2, 1], [1, 2]], '6/8': [[2], [1, 1]] };
let sbCh = null;   // { id, view: 'paste'|'read'|'grid', text, sel, part, undo: [], saveTimer, typed: {} } — this tab only

/* ── Chord symbols ── */
/* A symbol → { name: 'G' | 'Am' | 'E5' | '' (a rest: N.C.), from, folded } or null when it cannot be read. */
function sbChordRead(sym){
  let s = String(sym == null ? '' : sym).trim().replace(/♯/g, '#').replace(/♭/g, 'b');
  const p = /^\((.+)\)$/.exec(s); if(p) s = p[1];
  if(/^(?:N\.?C\.?|N\/C)$/i.test(s)) return { name: '', from: s, folded: false };
  const m = /^([A-G])([#b]?)([^\/\s]*)(?:\/([A-G][#b]?))?$/.exec(s);
  if(!m) return null;
  const q = m[3], k = q === '' ? '' : q === 'm' ? 'm' : q === '5' ? '5' : SB_FOLD_MAJ.includes(q) ? '' : SB_FOLD_MIN.includes(q) ? 'm' : null;
  if(k === null) return null;
  const name = m[1] + m[2] + k;
  return { name, from: s, folded: s !== name };
}
/* A token that looks like someone meant a chord ("Bdim", "G7#9", "C°") though it cannot be read. */
function sbChordish(tok){ return /^\(?[A-G][#b]?(?:[0-9#+°ø()\/-]|dim|aug|maj|min|sus|add|alt|m|M)*\)?$/.test(tok); }

/* ── Section names ── */
const SB_SEC_WORDS = [['intro', /intro(?:duction|ducci[oó]n)?/], ['verse', /verse|verso|estrofa/], ['chorus', /chorus|coro/], ['refrain', /refrain|estribillo/],
  ['bridge', /bridge|puente/], ['interlude', /interlud(?:e|io)|instrumental|\bbreak\b/], ['solo', /\bsolo\b/], ['riff', /\briff\b/], ['requinto', /requinto/],
  ['outro', /outro|\bcoda\b/], ['ending', /ending|\bend\b|\bfinal\b|\bfin\b/]];
/* A header's words → { name: a key of BS_SECTION_NAMES or null, n: 1-9 or null }. The LAST section word wins
   ("Final chorus" is a chorus). */
function sbSectionOf(label){
  const s = String(label || '').toLowerCase(), d = /([1-9])/.exec(s), n = d ? Number(d[1]) : null;
  if(/pre[\s-]?(?:chorus|coro)/.test(s)) return { name: 'prechorus', n };
  let name = null, at = -1;
  for(const [key, re] of SB_SEC_WORDS){ const m = re.exec(s); if(m && m.index >= at){ at = m.index; name = key; } }
  return { name, n };
}
function sbSecLabel(sec){ return sec.name ? bsSectionLabel({ name: sec.name, n: sec.n || undefined }, 'en') : (sec.label || 'Section') + ' (pick a name)'; }
const SB_HEAD_FILL = ['last', 'final', 'first', 'second', 'third', '1st', '2nd', '3rd', 'guitar', 'short', 'long', 'repeat', 'instrumental', 'the'];

/* ── The reader ── */
function sbTimesOf(s){ const m = /\(?\bx\s?([2-4])\b\)?|\(?\b([2-4])\s?x\b\)?/i.exec(s); return m ? { times: Number(m[1] || m[2]), rest: (s.slice(0, m.index) + ' ' + s.slice(m.index + m[0].length)).trim() } : { times: 1, rest: s }; }
/* Is this line a section header? → { label, rest (what follows it on the line) } or null. */
function sbHeaderOf(line){
  const t = line.trim();
  let m = /^\[([^\]]{1,40})\]\s*(.*)$/.exec(t);
  if(m){
    const inner = m[1].trim();
    if(sbSectionOf(inner).name || (!sbChordRead(inner) && !/[\[\]]/.test(m[2]))) return { label: inner, rest: m[2] };
    return null;
  }
  m = /^\{\s*([a-z_]+)\s*(?::\s*(.*?))?\s*\}$/i.exec(t);
  if(m){
    const k = m[1].toLowerCase(), v = m[2] || '';
    const map = { soc: 'Chorus', start_of_chorus: 'Chorus', sov: 'Verse', start_of_verse: 'Verse', sob: 'Bridge', start_of_bridge: 'Bridge' };
    if(map[k]) return { label: v || map[k], rest: '' };
    if(['c', 'comment', 'ci', 'comment_italic', 'cb', 'comment_box'].includes(k) && sbSectionOf(v).name) return { label: v, rest: '' };
    return { meta: true };
  }
  m = /^([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s-]{1,28}?\s*[1-9]?)\s*:\s*(.*)$/.exec(t);
  if(m && sbSectionOf(m[1]).name && sbHeadWords(m[1])) return { label: m[1].trim(), rest: m[2] };
  const bare = sbTimesOf(t.replace(/^\((.*)\)$/, '$1'));
  if(sbSectionOf(bare.rest).name && sbHeadWords(bare.rest)) return { label: bare.rest.trim(), rest: bare.times > 1 ? 'x' + bare.times : '' };
  return null;
}
/* Every word of a bare or "Name:" header is a section word, a number or a filler ("Last chorus", "Verse 2"). */
function sbHeadWords(s){
  const words = String(s).toLowerCase().split(/[\s-]+/).filter(Boolean);
  return words.length >= 1 && words.length <= 3 && words.every(w => /^[1-9]$/.test(w) || SB_HEAD_FILL.includes(w) || sbSectionOf(w).name || /^pre$/.test(w));
}
function sbLooksTab(t){ return (t.match(/-/g) || []).length >= 4 && /^\s*[eEBGDA]?\s*[|:]?[\s\-–0-9hpbrs\/\\~xX()^<>.|]*-{2}[\s\-–0-9hpbrs\/\\~xX()^<>.|]*$/.test(t); }
function sbLooksNumbers(toks){ return toks.length >= 2 && toks.every(k => /^(?:[1-7](?:m|-|°|dim|7)?|[b#]?(?:III|II|IV|VII|VI|I|V|iii|ii|iv|vii|vi|i|v)(?:m|°|dim|7)?)$/.test(k)); }
/* The chords of one bar-line cell → a bar string in this meter, or null (more chords than the bar's beats). */
function sbBarOf(names, meter){
  const bpb = (SB_METER[meter] || SB_METER['4/4']).bpb, nm = n => n || '-';
  if(names.length === 1) return nm(names[0]);
  const share = names.length === 2 ? (bpb === 4 ? [2, 2] : bpb === 3 ? [2, 1] : [1, 1]) : names.length === 3 ? (bpb === 4 ? [2, 1, 1] : bpb === 3 ? [1, 1, 1] : null)
    : names.length === 4 && bpb === 4 ? [1, 1, 1, 1] : null;
  return share ? names.map((n, i) => nm(n) + ':' + share[i]).join(' ') : null;
}
/* One line → what it is. { kind: 'blank' | 'meta' | 'header' | 'chords' | 'chordpro' | 'bars' | 'lyric' | 'bad', ... } */
function sbLineOf(raw, meter){
  const text = raw.replace(/\t/g, '    '), t = text.trim();
  if(!t) return { kind: 'blank' };
  if(t[0] === '#') return { kind: 'meta' };
  const h = sbHeaderOf(t);
  if(h && h.meta) return { kind: 'meta' };
  if(h){
    const out = { kind: 'header', label: h.label, times: 1, sameAs: '', inline: null };
    let rest = h.rest.trim();
    const same = /\(?\s*same(?:\s+chords?)?\s+as\s+(?:the\s+)?([^)]+?)\s*\)?$/i.exec(rest);
    if(same){ out.sameAs = same[1].trim(); rest = rest.slice(0, same.index).trim(); }
    const tm = sbTimesOf(rest);
    out.times = tm.times; rest = tm.rest.replace(/^[()\s]+$/, '').trim();
    if(rest){ const inl = sbLineOf(rest, meter); if(inl.kind === 'chords' || inl.kind === 'bars' || inl.kind === 'chordpro' || inl.kind === 'bad') out.inline = inl; }
    return out;
  }
  if(sbLooksTab(t)) return { kind: 'bad', why: 'tab' };
  if(t.indexOf('|') >= 0){
    const tm = sbTimesOf(t), cells = tm.rest.split('|').map(c => c.trim());
    if(cells.length && cells[0] === '') cells.shift();
    if(cells.length && cells[cells.length - 1] === '') cells.pop();
    const bars = [], folds = [];
    for(const c of cells){
      const toks = c.split(/\s+/).filter(k => k && k !== '/' && k !== '-');
      if(!toks.length || (toks.length === 1 && toks[0] === '%')){ bars.push('%'); continue; }
      const names = [];
      for(const k of toks){ const r = sbChordRead(k); if(!r) return { kind: 'bad', why: 'symbol', sym: k }; names.push(r.name); if(r.folded) folds.push(r); }
      const b = sbBarOf(names, meter);
      if(b === null) return { kind: 'bad', why: 'crowded', sym: c };
      bars.push(b);
    }
    if(bars.length) return { kind: 'bars', bars, folds, times: tm.times };
  }
  if(/\[[^\]]+\]/.test(t)){
    const names = [], folds = []; let bad = null;
    const words = t.replace(/\[([^\]]+)\]/g, (all, inner) => { const r = sbChordRead(inner); if(r){ names.push(r.name); if(r.folded) folds.push(r); return ''; } if(sbChordish(inner.trim())) bad = bad || inner.trim(); return all; });
    if(bad) return { kind: 'bad', why: 'symbol', sym: bad };
    if(names.length) return { kind: 'chordpro', names, folds, lyric: words.replace(/\s+/g, ' ').trim(), times: 1 };
  }
  const tm = sbTimesOf(t), toks = tm.rest.split(/\s+/).filter(k => k && k !== '/' && k !== '-' && k !== '|');
  if(!toks.length) return { kind: 'lyric', text: t };
  const read = toks.map(sbChordRead);
  if(read.every(Boolean)) return { kind: 'chords', names: read.map(r => r.name), folds: read.filter(r => r.folded), times: tm.times };
  if(sbLooksNumbers(toks)) return { kind: 'bad', why: 'numbers' };
  const good = read.filter(Boolean).length, odd = toks.filter((k, i) => !read[i]);
  if(good >= 1 && good / toks.length >= 0.6 && odd.every(sbChordish)) return { kind: 'bad', why: 'symbol', sym: odd[0] };
  return { kind: 'lyric', text: t };
}
const SB_WHY = { tab: 'looks like TAB; the builder reads chord names only', numbers: 'looks like a number chart (1 4 5 or I IV V); the builder reads chord names',
  symbol: 'has a chord symbol the builder cannot read', crowded: 'puts more chords in one bar than the bar has beats' };
/* The whole chart → { fmt, lines: [{ n, kind, text, why, sym }], sections, folds: [{ from, to }], bad: [{ line, why, text, sym }],
   notes: [text], chords: [names] }. `left`: refused line numbers already dealt with (they are not flagged again). */
function sbChartRead(text, meter){
  const src = String(text || '').replace(/\r\n?/g, '\n').slice(0, SB_CHART_MAX).split('\n').slice(0, 600);
  const lines = [], sections = [], folds = [], bad = [], notes = [], seen = { chords: 0, chordpro: 0, bars: 0 };
  let cur = null, last = null;            // last: the item a lyric line on the NEXT line belongs to
  const open = (label, o) => { cur = { label, items: [], times: (o && o.times) || 1, sameAs: (o && o.sameAs) || '', headed: !!o }; sections.push(cur); return cur; };
  const addFolds = f => (f || []).forEach(r => { if(!folds.some(x => x.from === r.from)) folds.push({ from: r.from, to: r.name || 'a rest' }); });
  const take = (L, n) => {
    if(L.kind === 'bad'){ bad.push({ line: n, why: L.why, sym: L.sym || '', text: src[n - 1].trim().slice(0, 80) }); return null; }
    addFolds(L.folds); seen[L.kind]++;
    if(!cur) open('', null);
    let bars = L.kind === 'bars' ? L.bars.slice() : L.names.map(x => x || '-');
    for(let i = 0; i < bars.length; i++) if(bars[i] === '%'){ const prev = i ? bars[i - 1] : (cur.items.length ? cur.items[cur.items.length - 1].bars.slice(-1)[0] : '-'); bars[i] = prev || '-'; }
    const one = bars.slice(); for(let k = 1; k < (L.times || 1); k++) bars = bars.concat(one);
    const item = { bars, lyric: L.kind === 'chordpro' ? L.lyric : '', line: n };
    cur.items.push(item);
    return item;
  };
  src.forEach((raw, i) => {
    const n = i + 1, L = sbLineOf(raw, meter);
    lines.push({ n, kind: L.kind, text: raw.replace(/\t/g, '    '), why: L.why || '', sym: L.sym || '' });
    if(L.kind === 'blank' || L.kind === 'meta'){ last = null; return; }
    if(L.kind === 'header'){
      open(L.label, L); last = null;
      if(L.inline){ if(L.inline.kind === 'bad') lines[i].kind = 'bad', lines[i].why = L.inline.why, lines[i].sym = L.inline.sym || ''; last = take(L.inline, n); }
      return;
    }
    if(L.kind === 'lyric'){
      const words = L.text.replace(/\s+/g, ' ').trim().slice(0, BS_MAX_LYRIC);
      if(last && !last.lyric) last.lyric = words;
      else if(cur && cur.items.length){ const it = cur.items[cur.items.length - 1]; it.lyric = (it.lyric ? it.lyric + ' / ' : '') + words; if(it.lyric.length > BS_MAX_LYRIC) it.lyric = it.lyric.slice(0, BS_MAX_LYRIC); }
      else lines[i].kind = 'skipped';
      last = null;
      return;
    }
    const item = take(L, n);
    last = item && L.kind !== 'chordpro' ? item : null;
  });
  /* Sections: copies, repeats, names and numbers. */
  const byLabel = l => sections.find(s => s.done && s.label.toLowerCase() === String(l).toLowerCase()) || null;
  const out = [], count = {};
  sections.forEach(s => {
    const id = sbSectionOf(s.label);
    let items = s.items, copied = '';
    if(!items.length && s.headed){
      const from = (s.sameAs && (byLabel(s.sameAs) || sections.find(x => x.done && sbSectionOf(x.label).name === sbSectionOf(s.sameAs).name && (sbSectionOf(s.sameAs).n || 1) === (sbSectionOf(x.label).n || 1))))
        || sections.find(x => x.done && id.name && sbSectionOf(x.label).name === id.name);
      if(from){ items = from.items.map(it => ({ bars: it.bars.slice(), lyric: '', line: it.line })); copied = from.label; }
    }
    s.done = true; s.items = items;
    if(!items.length){ if(s.headed) notes.push(`Nothing could be read under "${s.label}": it was left out.`); return; }
    let bars = [], lyrics = [];
    for(let k = 0; k < s.times; k++) items.forEach(it => { bars = bars.concat(it.bars); lyrics.push({ text: k ? '' : it.lyric, bars: it.bars.length }); });
    let n = id.n;
    if(id.name){ count[id.name] = (count[id.name] || 0) + 1; if(!n && count[id.name] > 1) n = Math.min(9, count[id.name]); }
    out.push({ name: id.name, label: s.label.slice(0, 40), n: n || null, bars, lyrics: lyrics.some(l => l.text) ? lyrics : null, copied });
  });
  if(out.length > BS_MAX_SECTIONS) notes.push(`The chart has ${out.length} sections; a card takes ${BS_MAX_SECTIONS}. Join some in the grid.`);
  const kinds = Object.keys(seen).filter(k => seen[k]);
  const fmt = !kinds.length ? '' : kinds.length > 1 ? 'a mix of formats' : kinds[0] === 'chords' ? 'chords over lyrics' : kinds[0] === 'chordpro' ? 'ChordPro' : 'bar lines';
  return { fmt, lines, sections: out, folds, bad, notes, chords: sbChartChords(out) };
}
/* The chord names a list of sections plays, in the order they first sound. */
function sbChartChords(sections){
  const names = [];
  (sections || []).forEach(s => s.bars.forEach(b => String(b).split(/\s+/).forEach(tk => { const n = tk.split(':')[0]; if(n && n !== '-' && !names.includes(n)) names.push(n); })));
  return names;
}
function sbChartBars(sections){ return (sections || []).reduce((n, s) => n + s.bars.length, 0); }

/* ── Shapes ── */
function sbDiagramFrets(name){
  const cfg = typeof CHORD_DIAGRAMS !== 'undefined' && Object.prototype.hasOwnProperty.call(CHORD_DIAGRAMS, name) ? CHORD_DIAGRAMS[name] : null;
  if(!cfg || !Array.isArray(cfg.chord)) return null;
  const f = [null, null, null, null, null, null];
  cfg.chord.forEach(c => { const i = 6 - Number(c[0]); if(i >= 0 && i < 6) f[i] = c[1] === 'x' ? null : Number(c[1]); });
  return f;
}
function sbPowerFrets(pc){
  const d = sbDiagramFrets(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][pc] + '5');
  if(d) return d;
  const fE = (pc - 4 + 12) % 12, fA = (pc - 9 + 12) % 12;
  return fE <= 5 ? [fE, fE + 2, fE + 2, null, null, null] : [null, fA, fA + 2, fA + 2, null, null];
}
/* A chord name → { full: { frets }|null, power: { frets }, taught, how: 'site' | 'barre' | 'power' } or null. */
function sbShapeOf(name){
  const c = bsChordName(name);
  if(!c) return null;
  const power = { frets: sbPowerFrets(c.pc) };
  if(c.q === '5') return { full: { frets: power.frets.slice() }, power, taught: true, how: 'power' };
  const site = sbDiagramFrets(name);
  if(site && !bsShapeProblem(name, { frets: site }, 'full')) return { full: { frets: site }, power, taught: SB_TAUGHT_FULL.includes(name), how: 'site' };
  const fE = (c.pc - 4 + 12) % 12 || 12, fA = (c.pc - 9 + 12) % 12 || 12, third = c.q === 'm' ? 0 : 1;
  const frets = fE <= fA ? [fE, fE + 2, fE + 2, fE + third, fE, fE] : [null, fA, fA + 2, fA + 2, fA + 1 + third, fA];
  return { full: { frets }, power, taught: SB_TAUGHT_FULL.includes(name), how: 'barre' };
}

/* ── The grid's edits: each takes the sections and returns NEW sections (the old ones are the Undo step) ── */
function sbGridCopy(sections){ return sections.map(s => Object.assign({}, s, { bars: s.bars.slice(), lyrics: s.lyrics ? s.lyrics.map(l => ({ text: l.text, bars: l.bars })) : null })); }
function sbGridAt(sections, g){ let k = g; for(let si = 0; si < sections.length; si++){ if(k < sections[si].bars.length) return { si, bi: k }; k -= sections[si].bars.length; } return null; }
function sbGridFirst(sections, si){ let g = 0; for(let i = 0; i < si; i++) g += sections[i].bars.length; return g; }
function sbLyrAt(sec, bi){ if(!sec.lyrics) return -1; let k = bi; for(let i = 0; i < sec.lyrics.length; i++){ if(k < sec.lyrics[i].bars) return i; k -= sec.lyrics[i].bars; } return -1; }
function sbGridTidy(sections){
  return sections.filter(s => s.bars.length).map(s => {
    if(s.lyrics){
      const kept = [];
      s.lyrics.forEach(l => { if(l.bars > 0) kept.push(l); else if(l.text && kept.length) kept[kept.length - 1].text = (kept[kept.length - 1].text + ' / ' + l.text).slice(0, BS_MAX_LYRIC); });
      s.lyrics = kept.some(l => l.text) && kept.reduce((n, l) => n + l.bars, 0) === s.bars.length ? kept : null;
    }
    return s;
  });
}
function sbGridSetBar(sections, g, bar){ const out = sbGridCopy(sections), at = sbGridAt(out, g); if(at) out[at.si].bars[at.bi] = bar; return out; }
/* + Bar: the bar at g once more, right after it (a chord held one more bar). */
function sbGridAddBar(sections, g){
  const out = sbGridCopy(sections), at = sbGridAt(out, g); if(!at) return out;
  const s = out[at.si], li = sbLyrAt(s, at.bi);
  s.bars.splice(at.bi + 1, 0, s.bars[at.bi]);
  if(li >= 0) s.lyrics[li].bars++;
  return out;
}
function sbGridRemoveBar(sections, g){
  const out = sbGridCopy(sections), at = sbGridAt(out, g); if(!at) return out;
  const s = out[at.si], li = sbLyrAt(s, at.bi);
  s.bars.splice(at.bi, 1);
  if(li >= 0) s.lyrics[li].bars--;
  return sbGridTidy(out);
}
/* A new section starts at bar g (the rest of its section moves into it; its name is to pick). */
function sbGridSplit(sections, g){
  const out = sbGridCopy(sections), at = sbGridAt(out, g); if(!at || at.bi === 0) return out;
  const s = out[at.si], tail = { name: null, label: 'New section', n: null, bars: s.bars.splice(at.bi), lyrics: null, copied: '' };
  if(s.lyrics){
    const a = [], b = []; let k = at.bi;
    s.lyrics.forEach(l => { if(k >= l.bars){ a.push(l); k -= l.bars; } else if(k > 0){ a.push({ text: l.text, bars: k }); b.push({ text: '', bars: l.bars - k }); k = 0; } else b.push(l); });
    s.lyrics = a; tail.lyrics = b;
  }
  out.splice(at.si + 1, 0, tail);
  return sbGridTidy(out);
}
/* Section si starts one bar earlier (dir -1: it takes the last bar of the section before) or later (+1). */
function sbGridEdge(sections, si, dir){
  const out = sbGridCopy(sections), s = out[si], p = out[si - 1];
  if(!s || !p) return out;
  if(dir < 0 && p.bars.length > 1){
    s.bars.unshift(p.bars.pop());
    if(p.lyrics) p.lyrics[p.lyrics.length - 1].bars--;
    if(s.lyrics) s.lyrics[0].bars++;
  } else if(dir > 0 && s.bars.length > 1){
    p.bars.push(s.bars.shift());
    if(s.lyrics) s.lyrics[0].bars--;
    if(p.lyrics) p.lyrics[p.lyrics.length - 1].bars++;
  }
  return sbGridTidy(out);
}
/* Section si is joined to the one before it. */
function sbGridJoin(sections, si){
  const out = sbGridCopy(sections), s = out[si], p = out[si - 1];
  if(!s || !p) return out;
  if(p.lyrics || s.lyrics) p.lyrics = (p.lyrics || [{ text: '', bars: p.bars.length }]).concat(s.lyrics || [{ text: '', bars: s.bars.length }]);
  p.bars = p.bars.concat(s.bars);
  out.splice(si, 1);
  return sbGridTidy(out);
}
/* Every bar that plays `from` plays `to` instead (Swap for…). */
function sbGridSwap(sections, from, to){
  const out = sbGridCopy(sections);
  out.forEach(s => { s.bars = s.bars.map(b => String(b).split(/\s+/).map(tk => { const p = tk.split(':'); if(p[0] === from) p[0] = to; return p.join(':'); }).join(' ')); });
  return out;
}
/* A bar string → [{ name ('' = rest), beats }], and back. */
function sbBarRead(bar, meter){ const m = SB_METER[meter] || SB_METER['4/4']; return String(bar).indexOf(':') < 0 ? [{ name: bar === '-' ? '' : bar, beats: m.bpb }] : String(bar).split(/\s+/).map(tk => { const p = tk.split(':'); return { name: p[0] === '-' ? '' : p[0], beats: Number(p[1]) }; }); }
function sbBarWrite(parts, meter){
  const m = SB_METER[meter] || SB_METER['4/4'];
  if(parts.length === 1 || parts.every(p => p.name === parts[0].name)) return parts[0].name || '-';
  return parts.map(p => (p.name || '-') + ':' + p.beats).join(' ');
}

/* ── From the draft to the song builtSongs takes ── */
function sbSongOf(d){
  const beat = d.beat, ch = d.chart, lv = d.level || { versions: 'full' };
  if(!beat || !ch || !Array.isArray(ch.sections) || !ch.sections.length) return null;
  const bars = [], sections = [], chords = {};
  let from = 1;
  ch.sections.forEach(s => {
    const o = { name: s.name, from, bars: s.bars.length };
    if(s.n) o.n = s.n;
    if(s.lyrics && s.lyrics.some(l => l.text)) o.lyrics = s.lyrics.map(l => ({ text: l.text, bars: l.bars }));
    sections.push(o); bars.push(...s.bars); from += s.bars.length;
  });
  sbChartChords(ch.sections).forEach(n => { const sh = sbShapeOf(n); if(sh) chords[n] = { full: sh.full, power: sh.power }; });
  const song = { meter: beat.meter, bpm: Math.round(sbPinBpm(beat) * 1000) / 1000, anchor: beat.anchor, chords, bars, sections,
    level: lv.versions === 'both' ? { versions: 'both', start: lv.start === 'power' ? 'power' : 'full' } : { versions: lv.versions === 'power' ? 'power' : 'full' } };
  const bt = sbBarTimes(beat, bars.length);
  if(bt) song.barTimes = bt;
  if(lv.range && Number.isInteger(lv.range.from) && Number.isInteger(lv.range.to)) song.range = { from: lv.range.from, to: lv.range.to };
  return song;
}
/* builtSongCheck's own reasons on the draft as a song ([] = it passes). The pitch reason is the Volume step's to
   say (over 10 cents the song cannot be published; these steps stay open), so it is left out here. */
function sbSongWhy(d, id){
  const song = sbSongOf(d);
  if(!song) return [!d.beat ? 'Set the beat first (step 3).' : 'Read a chart first (step 4).'];
  if(!d.audio) return ['Level the record first (step 2).'];
  if(d.chart.sections.some(s => !s.name)) return ['A section still has no name: pick one in the grid (step 4).'];
  return builtSongCheck(id, { v: 1, title: d.title, artist: d.artist, audio: d.audio, song }).filter(w => !/^audio\.centsOff/.test(w));
}
/* What still needs him at the Chart step: refused lines not dealt with, chords not taught and not kept, sections
   with no name. */
function sbChartOpen(d, read){
  const ch = d && d.chart;
  if(!ch || !Array.isArray(ch.sections)) return { bad: [], untaught: [], unnamed: 0, n: 0 };
  const left = ch.left || [], kept = ch.kept || [];
  const bad = ((read && read.bad) || []).filter(b => !left.includes(b.line));
  const power = d.level && d.level.versions === 'power';
  const untaught = power ? [] : sbChartChords(ch.sections).filter(n => { const sh = sbShapeOf(n); return sh && !sh.taught && !kept.includes(n); });
  const unnamed = ch.sections.filter(s => !s.name).length;
  return { bad, untaught, unnamed, n: bad.length + untaught.length + unnamed };
}

/* ── The view ── */
function sbChFor(id){
  if(!sbCh || sbCh.id !== id){ if(sbCh) clearTimeout(sbCh.saveTimer); sbCh = { id, view: '', text: null, sel: null, part: 0, undo: [], saveTimer: 0, read: null, readOf: '' }; }
  return sbCh;
}
function sbChartMeter(d){ return (d && d.beat && d.beat.meter) || '4/4'; }
/* The reading of the draft's own text (kept, so the flags and the marked paste need no second read). */
function sbChartReadOf(d){
  const st = sbChFor(sbSel), ch = d.chart || {}, key = sbChartMeter(d) + '\n' + (ch.text || '');
  if(st.readOf !== key){ st.read = sbChartRead(ch.text || '', sbChartMeter(d)); st.readOf = key; }
  return st.read;
}
function sbChipsHtml(names, kept){
  return names.map(n => { const sh = sbShapeOf(n), nt = sh && !sh.taught; return `<span class="sb-chip ${nt ? 'new' : 'taught'}"${nt ? ` title="${kept.includes(n) ? 'Not taught; kept on purpose' : 'Not taught yet'}"` : ''}>${escHtml(n)}</span>`; }).join(' ');
}
function sbSecGridHtml(sections, meter, o){
  let g = 0;
  return sections.map((s, si) => {
    const first = g; let cells = '', bi = 0;
    const rows = s.lyrics || [{ text: '', bars: s.bars.length }];
    rows.forEach(l => {
      if(l.text) cells += `<div class="sb-lyr">${escHtml(l.text)}</div>`;
      else if(s.lyrics) cells += `<div class="sb-lyr sb-lyr-none"></div>`;
      for(let k = 0; k < l.bars; k++, bi++, g++){
        const parts = sbBarRead(s.bars[bi], meter), rest = parts.every(p => !p.name);
        const inner = rest ? '<span class="half">rest</span>' : parts.map(p => `<span class="half">${escHtml(p.name || '–')}</span>`).join('');
        const nt = parts.some(p => { const sh = p.name && sbShapeOf(p.name); return sh && !sh.taught; });
        const cls = 'sb-bar' + (o.sel === g ? ' sel' : '') + (rest ? ' empty' : '') + (nt ? ' new' : '');
        cells += o.pick ? `<button type="button" class="${cls}" data-sb-act="bar-pick" data-sb-g="${g}" aria-pressed="${o.sel === g}" aria-label="Bar ${g + 1}"><span class="bn">${g + 1}</span>${inner}</button>`
          : `<div class="${cls}"><span class="bn">${g + 1}</span>${inner}</div>`;
      }
    });
    const meta = (s.bars.length > 1 ? `bars ${first + 1}–${first + s.bars.length}` : `bar ${first + 1}`) + (s.copied ? ` · copied from ${escHtml(s.copied)}` : '');
    return `<div class="sb-sec${o.mini ? ' mini' : ''}${s.name ? '' : ' sb-sec-open'}"><div class="sb-sec-h"><span>${escHtml(sbSecLabel(s))}</span><span class="sb-sec-meta">${meta}</span>`
      + (o.play ? `<button type="button" class="sb-btn small" data-sb-act="chart-play" data-sb-g="${first}">▶ from here</button>` : '') + `</div><div class="sb-grid">${cells}</div></div>`;
  }).join('');
}
const SB_FORMS = `<div class="sb-forms"><span class="sb-chip">Chords over lyrics</span><span class="sb-chip">ChordPro <code>[G]words</code></span><span class="sb-chip">Bar lines <code>| G | D | Em |</code></span><span class="sb-chip">A .txt or .pro file</span><span class="sb-chip">A PDF with text</span></div>`;
function sbChartPaneHtml(d){
  if(!d) return `<div class="sb-box"><p class="sb-note" style="margin:0">Save the song first (step 1).</p></div>`;
  const st = sbChFor(sbSel), ch = d.chart || {}, has = Array.isArray(ch.sections) && ch.sections.length > 0, off = sbBusy ? ' disabled' : '';
  const view = st.view || (has ? (ch.edited ? 'grid' : 'read') : 'paste');
  const pdfBar = typeof sbPdfBarHtml === 'function' ? sbPdfBarHtml() : '';
  if(view === 'paste' || !has){
    const text = st.text != null ? st.text : ch.text || '';
    return pdfBar + `<div class="sb-cols c3"><div>
      <div class="sb-row sb-paste-top"><div class="sb-h" style="margin:0">Paste the chart</div><label class="sb-btn small sb-filebtn">Pick a text file<input type="file" accept=".txt,.pro,.cho,.crd,.chordpro,.chopro,text/plain" data-sb-chartfile${off}></label></div>
      <textarea class="sb-pastebox" data-sb-charttext spellcheck="false" maxlength="${SB_CHART_MAX}" aria-label="The chord chart"${off}>${escHtml(text)}</textarea>
      <div class="sb-hint">${text ? `${text.split('\n').length} lines.` : 'Chords over the words, ChordPro, or bars between | lines.'}${has ? ' Reading again replaces what is in the grid now.' : ''}</div>
    </div><div>
      <div class="sb-h">It reads any of these</div>${SB_FORMS}
      <p class="sb-note">Section names in brackets (<code>[Verse 1]</code>, <code>[Chorus]</code>, <code>[Coro]</code>) become the card's sections. "x2" and "same chords as Verse 1" are understood.</p>
      <div class="sb-box tint sb-box-tight"><div class="sb-h small">Have a PDF or a photo?</div><p class="sb-note" style="margin:0">Pick a PDF under <b>Pdfs</b> above: one with real text is read into this box. The builder cannot read pictures (a scan, a photo): it shows the PDF beside the chart for you to type from, or ask Claude: <i>"Turn this chart photo into plain text, chords over lyrics"</i>, then paste the answer here.</p></div>
      <div class="sb-row"><button type="button" class="sb-btn primary big" data-sb-act="chart-read"${off}>Read the chart</button>${has ? `<button type="button" class="sb-btn" data-sb-act="chart-view" data-sb-v="grid"${off}>Back to the grid</button>` : ''}</div>
      ${d.beat ? '' : '<p class="sb-hint">The beat is not set yet (step 3): the chart is read in 4 beats a bar until it is.</p>'}
    </div></div>`;
  }
  const meter = ch.meter || sbChartMeter(d), read = sbChartReadOf(d), open = sbChartOpen(d, read), kept = ch.kept || [];
  const nBars = sbChartBars(ch.sections), names = sbChartChords(ch.sections);
  const rec = d.beat && d.audio ? sbBarsIn(d.beat, d.audio.durationSec) : null;
  const stale = d.beat && ch.meter && ch.meter !== d.beat.meter ? `<div class="sb-flag red"><span class="fi">!</span><div class="sb-flag-body"><b>The beat is now ${escHtml(d.beat.meter === '6/8' ? '6/8 in two' : d.beat.meter.slice(0, 1) + ' beats a bar')}; this chart was read in ${escHtml(ch.meter)}.</b> Read it again so its bars fit. <button type="button" class="sb-btn small" data-sb-act="chart-read"${off}>Read it again</button></div></div>` : '';
  const count = rec == null ? '' : nBars === rec ? `<span class="sb-chip on">✓ ${nBars} bars, the same as the recording</span>` : `<span class="sb-chip${nBars > rec ? ' new' : ''}">${nBars} bars; the recording has ${rec}</span>`;
  if(view === 'grid'){
    const sel = st.sel != null && st.sel < nBars ? st.sel : null;
    return pdfBar + stale + `<div class="sb-tools">${count}<span class="sb-hint" style="margin:0">${open.n ? `${open.n} thing${open.n === 1 ? '' : 's'} still to settle` : 'Pick a bar to change it.'}</span><span class="sb-toolbtns">`
      + `<button type="button" class="sb-btn small" data-sb-act="chart-view" data-sb-v="read"${off}>← What was read</button><button type="button" class="sb-btn small" data-sb-act="chart-undo"${off || !st.undo.length ? ' disabled' : ''}>Undo</button><button type="button" class="sb-btn small" data-sb-act="clear-chart"${off}>Clear this step</button></span></div>`
      + `<div class="sb-cols sb-gridcols"><div class="sb-gridscroll">${sbSecGridHtml(ch.sections, meter, { sel, pick: true, play: !!(d.beat && d.audio) })}</div><div>${sbBarPanelHtml(d, sel)}</div></div>`;
  }
  /* What was read. */
  const flags = [];
  read.bad.forEach(b => {
    const done = (ch.left || []).includes(b.line);
    const typed = st.typed && st.typed[b.line] != null ? st.typed[b.line] : '';
    flags.push(`<div class="sb-flag${done ? ' sb-flag-done' : ' red'}"><span class="fi">${done ? '✓' : '?'}</span><div class="sb-flag-body"><b>Line ${b.line} ${done ? 'is left out' : 'could not be read'}.</b> It ${escHtml(SB_WHY[b.why] || 'could not be read')}${b.sym ? ` (<code>${escHtml(b.sym)}</code>)` : ''}: <code>${escHtml(b.text)}</code>`
      + (done ? '' : `<div class="sb-row"><button type="button" class="sb-btn small" data-sb-act="chart-leave" data-sb-line="${b.line}"${off}>Leave it out</button><input class="sb-input small sb-typed" data-sb-typed="${b.line}" placeholder="Type its chords: G D Em C" aria-label="The chords of line ${b.line}" value="${escAttr(typed)}"${off}><button type="button" class="sb-btn small" data-sb-act="chart-use" data-sb-line="${b.line}"${off}>Use these chords</button></div>`) + `</div></div>`);
  });
  open.untaught.forEach(n => {
    const sh = sbShapeOf(n), opts = SB_TAUGHT_FULL.filter(x => x !== n).map(x => `<option value="${escAttr(x)}">${escHtml(x)}</option>`).join('');
    flags.push(`<div class="sb-flag"><span class="fi">!</span><div class="sb-flag-body"><b>${escHtml(n)} is a chord the class has not been taught.</b> ${sh.how === 'barre' ? 'It would be a barre chord.' : ''} On the power-chord level it is ${escHtml(bsPowerName(n))}.`
      + `<div class="sb-row"><button type="button" class="sb-btn small" data-sb-act="chart-keep" data-sb-chord="${escAttr(n)}"${off}>Keep ${escHtml(n)} (the card shows its diagram)</button><select class="sb-input small" data-sb-swap="${escAttr(n)}" aria-label="Swap ${escAttr(n)} for"${off}><option value="">Swap for…</option>${opts}</select></div></div></div>`);
  });
  if(open.unnamed) flags.push(`<div class="sb-flag"><span class="fi">!</span><div class="sb-flag-body"><b>${open.unnamed} section${open.unnamed === 1 ? ' has' : 's have'} no name on the list.</b> Pick ${open.unnamed === 1 ? 'it' : 'each one'} in the grid: Intro, Verse, Chorus…</div></div>`);
  if(read.folds.length) flags.push(`<div class="sb-flag sb-flag-info"><span class="fi">i</span><div class="sb-flag-body"><b>${read.folds.length} chord${read.folds.length === 1 ? ' was' : 's were'} made plain.</b> ${read.folds.slice(0, 8).map(f => `${escHtml(f.from)} → ${escHtml(f.to)}`).join(', ')}${read.folds.length > 8 ? ', …' : ''}. The card plays the plain chord.</div></div>`);
  read.notes.forEach(t => flags.push(`<div class="sb-flag sb-flag-info"><span class="fi">i</span><div class="sb-flag-body">${escHtml(t)}</div></div>`));
  if(rec != null && nBars !== rec) flags.push(`<div class="sb-flag sb-flag-info"><span class="fi">i</span><div class="sb-flag-body"><b>The chart makes ${nBars} bars; the recording has about ${rec}</b> at ${escHtml(String(Math.round(sbPinBpm(d.beat))))} BPM. ${read.fmt === 'bar lines' ? 'Add or remove bars in the grid.' : 'Chords over lyrics do not say how long each chord lasts, so each got one bar. Hold the long ones in the grid.'}</div></div>`);
  const marked = `<pre class="sb-paste">` + read.lines.map(l => `<span class="ln ${l.kind === 'bad' ? ((ch.left || []).includes(l.n) ? 'out' : 'bad') : l.kind === 'header' ? 'hd' : l.kind === 'chords' || l.kind === 'bars' || l.kind === 'chordpro' ? 'ch' : l.kind === 'skipped' || l.kind === 'meta' ? 'out' : ''}"><span class="no">${l.n}</span>${escHtml(l.text) || ' '}</span>`).join('') + `</pre>`;
  return pdfBar + stale + `<div class="sb-tools"><span class="sb-chip on">✓ Read as ${escHtml(read.fmt || 'a chart')}</span><span class="sb-note" style="margin:0">${ch.sections.length} section${ch.sections.length === 1 ? '' : 's'} · ${nBars} bars · chords: ${sbChipsHtml(names, kept)}</span><span class="sb-toolbtns">`
    + `<button type="button" class="sb-btn small" data-sb-act="chart-view" data-sb-v="paste"${off}>← Paste again</button><button type="button" class="sb-btn small" data-sb-act="clear-chart"${off}>Clear this step</button><button type="button" class="sb-btn small primary" data-sb-act="chart-view" data-sb-v="grid"${off}>Fix in the grid →</button></span></div>`
    + `<div class="sb-cols c3"><div>${ch.edited ? '<p class="sb-hint">The grid has been changed by hand since this was read; the right side shows the grid as it is now.</p>' : ''}${flags.join('')}${marked}</div><div class="sb-gridscroll">${sbSecGridHtml(ch.sections, meter, { mini: true })}</div></div>`;
}
/* The panel beside the grid: the picked bar, and its section. */
function sbBarPanelHtml(d, sel){
  const ch = d.chart, meter = ch.meter || sbChartMeter(d), st = sbChFor(sbSel), off = sbBusy ? ' disabled' : '';
  if(sel == null) return `<div class="sb-box"><div class="sb-h">Set the truth here</div><p class="sb-note">Pick a bar. Then: its chord, a split bar, a rest, one more bar of the same chord (a held chord), or remove it. A section's name, number and edges are here too.</p><p class="sb-hint">The numbers are the record's bars: bar 1 is where you put it at the Beat step.</p></div>`;
  const at = sbGridAt(ch.sections, sel), s = ch.sections[at.si], parts = sbBarRead(s.bars[at.bi], meter), part = Math.min(st.part || 0, parts.length - 1);
  const split = (SB_SPLITS[meter] || SB_SPLITS['4/4']).map(sp => { const on = sp.length === parts.length && sp.every((b, i) => Math.abs(b - parts[i].beats) < 1e-6); return `<button type="button" class="${on ? 'on' : ''}" data-sb-act="bar-split" data-sb-split="${sp.join('+')}" aria-pressed="${on}"${off}>${sp.length === 1 ? 'Whole bar' : sp.join(' + ')}</button>`; }).join('');
  const partBtns = parts.length > 1 ? `<div class="sb-row"><span class="sb-hint" style="margin:0">Which part</span><span class="sb-seg">${parts.map((p, i) => `<button type="button" class="${i === part ? 'on' : ''}" data-sb-act="bar-part" data-sb-part="${i}" aria-pressed="${i === part}"${off}>${escHtml(p.name || 'rest')} · ${p.beats}</button>`).join('')}</span></div>` : '';
  const pal = [...new Set(sbChartChords(ch.sections).concat(SB_TAUGHT_FULL))];
  const cur = parts[part].name;
  const palHtml = pal.map(n => { const sh = sbShapeOf(n); return `<button type="button" class="${n === cur ? 'on' : ''}${sh && !sh.taught ? ' nt' : ''}" data-sb-act="bar-chord" data-sb-chord="${escAttr(n)}" aria-pressed="${n === cur}"${off}>${escHtml(n)}</button>`; }).join('')
    + `<button type="button" class="${cur === '' ? 'on' : ''}" data-sb-act="bar-chord" data-sb-chord="" aria-pressed="${cur === ''}"${off}>Rest</button>`;
  const li = sbLyrAt(s, at.bi), first = sbGridFirst(ch.sections, at.si);
  const names = Object.keys(BS_SECTION_NAMES).map(k => `<option value="${k}"${s.name === k ? ' selected' : ''}>${escHtml(bsSectionLabel({ name: k }, 'en'))}</option>`).join('');
  const nums = ['', 1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => `<option value="${n}"${(s.n || '') === n ? ' selected' : ''}>${n === '' ? 'no number' : n}</option>`).join('');
  return `<div class="sb-box sb-box-sel"><div class="sb-h">Bar ${sel + 1} · ${escHtml(sbSecLabel(s))}</div>
      <div class="sb-row"><span class="sb-seg">${split}</span></div>${partBtns}
      <div class="sb-pal">${palHtml}</div>
      <div class="sb-row"><input class="sb-input small sb-other" data-sb-other placeholder="Another chord: Bb, F#m, C5" aria-label="Another chord"${off}><button type="button" class="sb-btn small" data-sb-act="bar-other"${off}>Use it</button><span class="sb-hint" style="margin:0">Dashed = not taught yet.</span></div>
      <div class="sb-row"><button type="button" class="sb-btn small" data-sb-act="bar-add"${off}>+ Bar (hold this chord)</button><button type="button" class="sb-btn small danger" data-sb-act="bar-remove"${off || sbChartBars(ch.sections) < 2 ? ' disabled' : ''}>Remove bar</button>${d.beat && d.audio ? `<button type="button" class="sb-btn small" data-sb-act="chart-play" data-sb-g="${Math.max(0, sel - 1)}">▶ Hear it</button><button type="button" class="sb-btn small" data-sb-act="listen-stop">■ Stop</button>` : ''}</div>
      <div class="sb-field"><label for="sb-lyr">The words over this row</label><input id="sb-lyr" class="sb-input" data-sb-lyric maxlength="${BS_MAX_LYRIC}" value="${escAttr(li >= 0 ? s.lyrics[li].text : '')}" placeholder="No words here"${off}></div>
    </div>
    <div class="sb-box sb-box-tight"><div class="sb-h small">This section: bars ${first + 1}–${first + s.bars.length}</div>
      <div class="sb-row"><select class="sb-input small" data-sb-secname aria-label="Section name"${off}>${s.name ? '' : '<option value="" selected>Pick a name…</option>'}${names}</select><select class="sb-input small" data-sb-secn aria-label="Section number"${off}>${nums}</select></div>
      <div class="sb-row"><button type="button" class="sb-btn small" data-sb-act="sec-split"${off || at.bi === 0 ? ' disabled' : ''} title="A new section starts at this bar">+ Section from this bar</button>
        <button type="button" class="sb-btn small" data-sb-act="sec-join"${off || at.si === 0 ? ' disabled' : ''} title="This section becomes part of the one before it">Join to the one before</button></div>
      <div class="sb-row"><button type="button" class="sb-btn small" data-sb-act="sec-edge" data-sb-dir="-1"${off || at.si === 0 || ch.sections[at.si - 1].bars.length < 2 ? ' disabled' : ''}>Start 1 bar earlier</button><button type="button" class="sb-btn small" data-sb-act="sec-edge" data-sb-dir="1"${off || at.si === 0 || s.bars.length < 2 ? ' disabled' : ''}>Start 1 bar later</button></div>
    </div>`;
}
function sbLevelPaneHtml(d){
  const ch = d && d.chart;
  if(!d || !ch || !Array.isArray(ch.sections) || !ch.sections.length) return `<div class="sb-box"><p class="sb-note" style="margin:0">Read the chart first (step 4).</p></div>`;
  const lv = d.level || { versions: 'full' }, off = sbBusy ? ' disabled' : '', names = sbChartChords(ch.sections);
  const powers = [...new Set(names.map(n => bsChordName(n).q === '5' ? n : bsPowerName(n)))];
  const opt = (v, t, sub) => `<button type="button" class="sb-opt${lv.versions === v ? ' on' : ''}" data-sb-act="level-versions" data-sb-v="${v}" role="radio" aria-checked="${lv.versions === v}"${off}><span class="sb-radio"></span><span><span class="sb-opt-t">${t}</span><span class="sb-opt-d">${sub}</span></span></button>`;
  const both = lv.versions === 'both' ? `<div class="sb-row sb-opens"><span class="sb-hint" style="margin:0">Opens on</span><span class="sb-seg">${[['full', 'Full chords'], ['power', 'Power chords']].map(([v, l]) => `<button type="button" class="${(lv.start || 'full') === v ? 'on' : ''}" data-sb-act="level-start" data-sb-v="${v}" aria-pressed="${(lv.start || 'full') === v}"${off}>${l}</button>`).join('')}</span></div>` : '';
  const r = lv.range, whole = !r;
  let g = 0;
  const rows = ch.sections.map((s, i) => {
    const first = g; g += s.bars.length;
    const inR = whole || (i >= r.from && i <= r.to);
    return `<div class="sb-secrow${inR ? '' : ' out'}"><span class="sb-check${inR ? ' on' : ''}"></span><span><b>${escHtml(sbSecLabel(s))}</b></span><span class="m">${s.bars.length > 1 ? `bars ${first + 1}–${first + s.bars.length}` : `bar ${first + 1}`}</span><span class="m">${escHtml(sbChartChords([s]).join(' '))}</span></div>`;
  }).join('');
  const sel = (which, val) => `<select class="sb-input small" data-sb-range="${which}" aria-label="${which === 'from' ? 'From section' : 'To section'}"${off}>${ch.sections.map((s, i) => `<option value="${i}"${i === val ? ' selected' : ''}>${escHtml(sbSecLabel(s))}</option>`).join('')}</select>`;
  const why = sbSongWhy(d, sbSel), open = sbChartOpen(d, sbChartReadOf(d));
  const verdict = !why.length ? `<div class="sb-flag sb-flag-ok"><span class="fi">✓</span><div class="sb-flag-body"><b>The song passes every check a student's page runs.</b> ${open.n ? `${open.n} thing${open.n === 1 ? '' : 's'} at the Chart step still want${open.n === 1 ? 's' : ''} a look.` : 'Next: hear it at Preview, then Publish.'}</div></div>`
    : `<div class="sb-flag red"><span class="fi">!</span><div class="sb-flag-body"><b>Not ready yet:</b><ul class="sb-list">${why.slice(0, 5).map(w => `<li>${escHtml(w)}</li>`).join('')}</ul>${why.length > 5 ? `and ${why.length - 5} more.` : ''}</div></div>`;
  return `<div class="sb-cols c3"><div>
      <div class="sb-h">Which chords?</div>
      <div role="radiogroup" aria-label="Which chords">${opt('full', 'Full chords only', escHtml(names.join(' · ') || 'no chords'))}${opt('power', 'Power chords only', escHtml(powers.join(' · ') || 'no chords') + ', made from the same chart')}${opt('both', 'Both, with the switch on the card', 'Like Perdón Mamá: Full chords / Power chords.')}</div>
      ${both}
      <p class="sb-hint">Speeds come free: Slowest · Slower · Slow · Normal, from the one file.</p>
      ${verdict}
    </div><div>
      <div class="sb-row sb-paste-top"><div class="sb-h" style="margin:0">Which sections?</div><span class="sb-seg"><button type="button" class="${whole ? 'on' : ''}" data-sb-act="level-range" data-sb-v="whole" aria-pressed="${whole}"${off}>Whole song</button><button type="button" class="${whole ? '' : 'on'}" data-sb-act="level-range" data-sb-v="range" aria-pressed="${!whole}"${off}>A range</button></span></div>
      ${whole ? '' : `<div class="sb-row">From ${sel('from', r.from)} to ${sel('to', r.to)}</div>`}
      <div class="sb-box sb-secbox">${rows}</div>
      <p class="sb-hint">A range makes a shorter card (just the chorus, say). Either way the card loops: at its last bar it goes back to its first.</p>
    </div></div>`;
}

/* ── Acting ── */
/* A change to the chart or the level: kept in the draft, saved once things settle (1.2 s), repainted now. */
function sbChartSet(d, patch, note, now){
  const st = sbChFor(sbSel), id = sbSel;
  Object.assign(d, patch);
  d.step = Math.max(Number(d.step) || 1, patch.level ? 5 : 4);
  if(note != null) sbNote = note;
  clearTimeout(st.saveTimer);
  const save = () => { const cur = sbDraft(); if(sbSel === id && !sbBusy && cur === d) sbWriteDraft(id, d); else if(sbSel === id && cur === d) st.saveTimer = setTimeout(save, 600); };
  if(now) save(); else st.saveTimer = setTimeout(save, 1200);
  teacherSbPaint();
}
function sbChartEdit(d, sections, note){
  const st = sbChFor(sbSel);
  st.undo.push(JSON.stringify(d.chart.sections)); if(st.undo.length > 40) st.undo.shift();
  const n = sbChartBars(sections);
  if(st.sel != null && st.sel >= n) st.sel = n ? n - 1 : null;
  /* A range that no longer fits the sections is dropped: the whole song. */
  const lv = d.level && d.level.range && d.level.range.to >= sections.length ? Object.assign({}, d.level, { range: null }) : d.level;
  sbChartSet(d, Object.assign({ chart: Object.assign({}, d.chart, { sections, edited: true }) }, lv !== d.level ? { level: lv } : {}), note);
}
/* Read the box's text (or the draft's own, when the meter changed) into the draft. */
function sbChartDoRead(d, text){
  const st = sbChFor(sbSel), meter = sbChartMeter(d);
  const t = String(text || '').replace(/\r\n?/g, '\n').slice(0, SB_CHART_MAX);
  if(!t.trim()){ sbNote = 'Paste the chart first.'; teacherSbPaint(); return; }
  const read = sbChartRead(t, meter);
  if(!read.sections.length){ sbNote = read.bad.length ? `No chords could be read: ${read.bad.length} line${read.bad.length === 1 ? '' : 's'} ${read.bad.length === 1 ? 'was' : 'were'} refused (line ${read.bad[0].line} ${SB_WHY[read.bad[0].why] || ''}).` : 'No chords could be read in that text.'; st.text = t; teacherSbPaint(); return; }
  st.read = read; st.readOf = meter + '\n' + t; st.view = 'read'; st.text = null; st.sel = null; st.undo = [];
  const lv = d.level && d.level.range ? Object.assign({}, d.level, { range: null }) : d.level;
  sbChartSet(d, Object.assign({ chart: { text: t, meter, fmt: read.fmt, sections: read.sections, left: [], kept: ((d.chart && d.chart.kept) || []).filter(n => read.chords.includes(n)), edited: false } }, lv !== d.level ? { level: lv } : {}),
    `Read: ${read.sections.length} section${read.sections.length === 1 ? '' : 's'}, ${sbChartBars(read.sections)} bars${read.bad.length ? `, ${read.bad.length} line${read.bad.length === 1 ? '' : 's'} refused` : ''}.`, true);
}
/* The line `line` of the draft's text is replaced (null: put out with a #), and the chart read again. */
function sbChartLine(d, line, withText){
  const rows = String(d.chart.text || '').split('\n');
  if(line < 1 || line > rows.length) return;
  if(withText == null){
    const left = (d.chart.left || []).concat([line]);
    sbChartSet(d, { chart: Object.assign({}, d.chart, { left }) }, `Line ${line} is left out.`);
    return;
  }
  const L = sbLineOf(withText, sbChartMeter(d));
  if(L.kind !== 'chords' && L.kind !== 'bars'){ sbNote = `Those are not chords the builder reads${L.kind === 'bad' && L.sym ? ` (${L.sym})` : ''}. Write them like: G D Em C`; teacherSbPaint(); return; }
  rows[line - 1] = withText.trim();
  const st = sbChFor(sbSel); if(st.typed) delete st.typed[line];
  if(d.chart.edited && !confirm('Reading the chart again replaces the changes you made in the grid. Go on?')) return;
  sbChartDoRead(d, rows.join('\n'));
}
function sbChartAct(act, b){
  const d = sbDraft();
  if(!d || !/^(chart-|bar-|sec-|level-)/.test(act)) return false;
  const st = sbChFor(sbSel), ch = d.chart;
  if(act === 'chart-read'){
    if(sbBusy) return true;
    const box = document.querySelector('[data-sb-charttext]'), text = box ? box.value : st.text != null ? st.text : (ch && ch.text) || '';
    if(ch && ch.edited && !confirm('Reading the chart again replaces the changes you made in the grid. Go on?')) return true;
    sbChartDoRead(d, text); return true;
  }
  if(act === 'chart-view'){ st.view = b.dataset.sbV; if(st.view !== 'paste') st.text = null; sbNote = ''; teacherSbPaint(); return true; }
  if(act === 'chart-play'){ sbChartPlay(d, Number(b.dataset.sbG)); return true; }
  if(sbBusy || !ch || !Array.isArray(ch.sections)) return true;
  const meter = ch.meter || sbChartMeter(d);
  if(act === 'chart-leave'){ sbChartLine(d, Number(b.dataset.sbLine), null); return true; }
  if(act === 'chart-use'){ const inp = document.querySelector(`[data-sb-typed="${Number(b.dataset.sbLine)}"]`); sbChartLine(d, Number(b.dataset.sbLine), inp ? inp.value : ''); return true; }
  if(act === 'chart-keep'){ const n = b.dataset.sbChord; sbChartSet(d, { chart: Object.assign({}, ch, { kept: (ch.kept || []).filter(x => x !== n).concat([n]) }) }, `${n} is kept: the card shows its diagram.`); return true; }
  if(act === 'chart-undo'){
    if(!st.undo.length) return true;
    const sections = JSON.parse(st.undo.pop());
    sbChartSet(d, { chart: Object.assign({}, ch, { sections }) }, 'Undone.');
    return true;
  }
  if(act === 'level-versions'){ const v = b.dataset.sbV; sbChartSet(d, { level: Object.assign({ range: null }, d.level, { versions: v, start: v === 'both' ? ((d.level && d.level.start) || 'full') : v }) }, null); return true; }
  if(act === 'level-start'){ sbChartSet(d, { level: Object.assign({ versions: 'both', range: null }, d.level, { start: b.dataset.sbV }) }, null); return true; }
  if(act === 'level-range'){ sbChartSet(d, { level: Object.assign({ versions: 'full' }, d.level, { range: b.dataset.sbV === 'whole' ? null : { from: 0, to: ch.sections.length - 1 } }) }, null); return true; }
  if(act === 'bar-pick'){ const g = Number(b.dataset.sbG); st.sel = st.sel === g ? null : g; st.part = 0; teacherSbPaint(); return true; }
  const sel = st.sel, at = sel != null ? sbGridAt(ch.sections, sel) : null;
  if(!at) return true;
  const parts = sbBarRead(ch.sections[at.si].bars[at.bi], meter), part = Math.min(st.part || 0, parts.length - 1);
  if(act === 'bar-part'){ st.part = Number(b.dataset.sbPart) || 0; teacherSbPaint(); return true; }
  if(act === 'bar-split'){
    const beats = b.dataset.sbSplit.split('+').map(Number);
    const next = beats.map((bt, i) => ({ name: (parts[i] || parts[parts.length - 1]).name, beats: bt }));
    st.part = Math.min(part, next.length - 1);
    sbChartEdit(d, sbGridSetBar(ch.sections, sel, next.length === 1 ? (next[0].name || '-') : next.map(p => (p.name || '-') + ':' + p.beats).join(' ')), null);
    return true;
  }
  if(act === 'bar-chord' || act === 'bar-other'){
    let name = b.dataset.sbChord;
    if(act === 'bar-other'){
      const inp = document.querySelector('[data-sb-other]'), r = sbChordRead(inp ? inp.value : '');
      if(!r || !r.name){ sbNote = 'That is not a chord the builder reads. Write it like Bb, F#m or C5.'; teacherSbPaint(); return true; }
      name = r.name;
      if(!sbChartChords(ch.sections).includes(name) && sbChartChords(ch.sections).length >= BS_MAX_CHORDS){ sbNote = `A card takes ${BS_MAX_CHORDS} different chords at most.`; teacherSbPaint(); return true; }
    }
    parts[part] = { name, beats: parts[part].beats };
    sbChartEdit(d, sbGridSetBar(ch.sections, sel, parts.length === 1 ? (name || '-') : parts.map(p => (p.name || '-') + ':' + p.beats).join(' ')), null);
    return true;
  }
  if(act === 'bar-add'){ if(sbChartBars(ch.sections) >= BS_MAX_BARS) return true; st.sel = sel + 1; sbChartEdit(d, sbGridAddBar(ch.sections, sel), `Bar ${sel + 2} added: every later bar moved one on.`); return true; }
  if(act === 'bar-remove'){ sbChartEdit(d, sbGridRemoveBar(ch.sections, sel), `Bar ${sel + 1} removed: every later bar moved one back.`); return true; }
  if(act === 'sec-split'){ if(ch.sections.length >= BS_MAX_SECTIONS){ sbNote = `A card takes ${BS_MAX_SECTIONS} sections at most.`; teacherSbPaint(); return true; } sbChartEdit(d, sbGridSplit(ch.sections, sel), 'A new section starts at this bar: pick its name.'); return true; }
  if(act === 'sec-join'){ sbChartEdit(d, sbGridJoin(ch.sections, at.si), 'Joined to the section before.'); return true; }
  if(act === 'sec-edge'){ sbChartEdit(d, sbGridEdge(ch.sections, at.si, Number(b.dataset.sbDir)), null); return true; }
  return true;
}
function sbChartChange(e){
  const t = e.target, d = sbDraft();
  if(t.matches('[data-sb-chartfile]')){
    const f = t.files && t.files[0];
    if(!f) return true;
    if(f.size > 200000){ sbNote = 'That file is too big to be a chord chart.'; teacherSbPaint(); return true; }
    const forId = sbSel, gen = sbViewGen;
    f.text().then(text => {
      if(sbStopped(gen) || sbSel !== forId) return;
      if(/\u0000/.test(text.slice(0, 2000))){ sbNote = 'That is not a text file. Copy the chart\'s text and paste it.'; teacherSbPaint(); return; }
      const clean = text.replace(/\r\n?/g, '\n').slice(0, SB_CHART_MAX);
      if(sbStepOn === 1){ const obj = sbDraft() || sbNew; if(obj){ obj.chartText = clean; if(sbDraft()) sbDraft().dirty = true; } }
      else sbChFor(sbSel).text = clean;
      sbNote = `Read ${clean.split('\n').length} lines from ${String(f.name || 'the file').slice(0, 80)}.`;
      teacherSbPaint();
    }).catch(() => { sbNote = 'Could not read that file.'; teacherSbPaint(); });
    return true;
  }
  if(!d || sbBusy) return false;
  const ch = d.chart, st = sbChFor(sbSel);
  if(t.matches('[data-sb-swap]')){
    const from = t.dataset.sbSwap, to = t.value;
    if(to && ch) sbChartEdit(d, sbGridSwap(ch.sections, from, to), `Every ${from} is now ${to}.`);
    return true;
  }
  if(t.matches('[data-sb-range]')){
    const r = Object.assign({ from: 0, to: ch.sections.length - 1 }, d.level && d.level.range), v = Number(t.value);
    if(t.dataset.sbRange === 'from'){ r.from = v; if(r.to < v) r.to = v; } else { r.to = v; if(r.from > v) r.from = v; }
    sbChartSet(d, { level: Object.assign({ versions: 'full' }, d.level, { range: r }) }, null);
    return true;
  }
  const at = ch && st.sel != null ? sbGridAt(ch.sections, st.sel) : null;
  if(!at) return false;
  if(t.matches('[data-sb-secname]') || t.matches('[data-sb-secn]')){
    const out = sbGridCopy(ch.sections), s = out[at.si];
    if(t.matches('[data-sb-secname]')){ if(!Object.prototype.hasOwnProperty.call(BS_SECTION_NAMES, t.value)) return true; s.name = t.value; }
    else s.n = /^[1-9]$/.test(t.value) ? Number(t.value) : null;
    sbChartEdit(d, out, null);
    return true;
  }
  if(t.matches('[data-sb-lyric]')){
    const out = sbGridCopy(ch.sections), s = out[at.si], words = String(t.value || '').replace(/\s+/g, ' ').trim().slice(0, BS_MAX_LYRIC);
    if(!s.lyrics){ if(!words) return true; s.lyrics = sbRowsOf(s.bars.length); }
    const li = sbLyrAt(s, at.bi);
    if(li < 0 || s.lyrics[li].text === words) return true;
    s.lyrics[li].text = words;
    sbChartEdit(d, sbGridTidy(out), null);
    return true;
  }
  return false;
}
/* A section with no words yet, in rows of 4 bars: where typed words go. */
function sbRowsOf(n){ const rows = []; for(let k = 0; k < n; k += 4) rows.push({ text: '', bars: Math.min(4, n - k) }); return rows; }
function sbChartInput(e){
  const t = e.target;
  if(t.matches('[data-sb-charttext]')){
    if(sbStepOn === 1){ const obj = sbDraft() || sbNew; if(obj){ obj.chartText = t.value; if(sbDraft()) sbDraft().dirty = true; } }
    else sbChFor(sbSel).text = t.value;
    return true;
  }
  if(t.matches('[data-sb-typed]')){ const st = sbChFor(sbSel); st.typed = st.typed || {}; st.typed[Number(t.dataset.sbTyped)] = t.value; return true; }
  return false;
}
/* ▶ from here: the record from the bar before `g`, with the card's click on the grid (the Beat step's player). */
function sbChartPlay(d, g){
  if(!d.beat || !d.audio || typeof sbBeatPlay !== 'function') return;
  const go = () => { sbBtFor(sbSel); sbBeatPlay(Math.max(0, sbBarTime(d.beat, g + 1) - 0.05), true); };
  if(sbMem.id === sbSel && sbMem.level) go();
  else sbLoadLevel().then(ok => { if(ok && sbDraft() === d) go(); });
}
/* When the Chart step is shown: a chart read in another meter than the beat's is read again by itself, unless the
   grid has been changed by hand (then the step says so and he decides). */
function sbChartMounted(){
  const d = sbDraft(), ch = d && d.chart;
  if(!d || sbBusy || !ch || !Array.isArray(ch.sections) || !ch.sections.length || !d.beat) return;
  if(ch.meter && ch.meter !== d.beat.meter && !ch.edited) sbChartDoRead(d, ch.text || '');
}
