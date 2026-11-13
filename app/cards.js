/* ══ CHORD GRID — a chord card's TAB without the strumming ══════════════
   (Jonathan, 2026-10-26.) The record's strumming is not consistent through a
   song and the strum patterns are taught on the slides, so on a chord card
   the TAB stops drawing every strum: each chord appears ONCE, where it
   really starts — on a beat or on the "+" — and the cursor moves on the
   beats only (1 2 3 4 of each bar), never on a "+". Opt in with
   `card.chordGrid: true`, and `chordGrid: false` on a section to leave it as
   it is (a solo, a single-note verse). Display only: no `notes` array
   changes, so the audio, pcLayout's beat totals, checks 1bf / 1bf2 / 1az and
   the Journey whole-song tabs are untouched. Single-note cards never opt in.
   Layout: eighth-note columns, FOUR BARS to a row whatever the meter (16
   beats across in 4/4, 12 in 3/4, 8 in 2/4), a bar line between bars. A
   lyric line (`rowLabels`) keeps its own row where it starts on a bar line;
   a 10-bar line is 4 + 4 + 2 bars with the lyric over the first. `rows`
   without labels are only wrapping hints and are ignored here. */
const PC_GRID_BARS = 4;
/* Fold consecutive same-name notes into one event { name, frets, midi,
   start, beats, ... } with `start` the running sum of beats. A rest ends a
   chord and is an event of its own ({ rest: true }). With everyStrum, consecutive same-name notes stay separate events (ca-29). Pure: no DOM. */
function pcChordGrid(notes, beatsPerBar, everyStrum){
  const bpb = beatsPerBar > 0 ? beatsPerBar : 4;
  const events = [];
  let pos = 0;
  (notes || []).forEach((n, i) => {
    const len = n.beats > 0 ? n.beats : 1;
    const prev = events[events.length - 1];
    if(n.rest){
      if(prev && prev.rest) prev.beats += len;
      else events.push({ rest: true, name: '', start: pos, beats: len, seq: i, bar: Math.floor(pos / bpb + 1e-6) });
    } else if(!everyStrum && prev && !prev.rest && prev.name === n.note){
      prev.beats += len;
    } else {
      const frets = Array.isArray(n.frets) ? n.frets : (n.string != null ? [[n.string, n.fret]] : []);
      events.push({ name: n.note, frets, midi: Array.isArray(n.midi) ? n.midi : [n.midi], start: pos, beats: len, seq: i, bar: Math.floor(pos / bpb + 1e-6) });
    }
    pos += len;
  });
  return events;
}
/* The rows of one chord-grid section: [{ b0, b1, label }] in beats from the
   start of the pass. Every b0 is a bar line. A lyric line whose first note
   does not start on a bar line loses its label (checks.mjs 1bv fails the
   push on that, so it cannot happen quietly). */
function pcGridRows(S, bpb){
  const total = S.bars * bpb;
  const starts = [];
  let pos = 0;
  S.notes.forEach(n => { starts.push(pos); pos += n.beats > 0 ? n.beats : 1; });
  const spec = Array.isArray(S.s.rows) && S.s.rows.every(r => Number.isInteger(r) && r > 0)
    && S.s.rows.reduce((x, y) => x + y, 0) === S.notes.length ? S.s.rows : null;
  const rl = tf(S.s, 'rowLabels');
  const labels = spec && Array.isArray(rl) && rl.length === spec.length ? rl : null;
  const lines = [{ b0: 0, label: '' }];
  if(labels){
    lines.length = 0;
    let k = 0;
    spec.forEach((r, ri) => {
      const b = starts[k];
      k += r;
      const bar = b / bpb;
      if(ri === 0) lines.push({ b0: 0, label: labels[0] });
      else if(Math.abs(bar - Math.round(bar)) < 1e-6 && labels[ri]) lines.push({ b0: Math.round(bar) * bpb, label: labels[ri] });
    });
  }
  const rows = [];
  lines.forEach((ln, li) => {
    const end = li + 1 < lines.length ? lines[li + 1].b0 : total;
    for(let b = ln.b0, first = true; b < end - 1e-6; b += PC_GRID_BARS * bpb, first = false){
      rows.push({ b0: b, b1: Math.min(end, b + PC_GRID_BARS * bpb), label: first ? ln.label : '' });
    }
  });
  return rows;
}
/* One row of a chord grid. Columns are eighths (a bar is 2 x beatsPerBar of
   them); `cols` is shared by every row of the section so beats line up row
   to row. Fret numbers (bar the alternating-bass note on beat 1 of a bar —
   see BASS NOTES) and the chord-name button sit at each event's onset
   column only. data-beat (the beat within the pass) goes on every BEAT column
   — string cells and count cell — and never on a "+" column: that is what
   the cursor lights (pcPaint). The count row is always on here: beats in
   ink, "+" faint, so a chord on a "+" has a label under it. */
/* COUNT IN SIX (Jonathan, 2026-11-10): a 6/8 track (countSix) draws three
   columns per big beat, every one a counted column numbered 1-6 across the
   bar, and the cursor lights each of the six (data-beat is then the eighth
   within the pass, not the big beat). The click sounds on all six too, 1 and
   4 accented (see CLICK IN SIX). sub = columns per beat. */
function renderChordGridRow(events, row, cols, bpb, seqOff, bass, restWord, sub){
  sub = sub === 3 ? 3 : 2;
  const barCols = bpb * sub;
  const used = Math.round((row.b1 - row.b0) * sub);
  const bassAt = pcBassMarks(events, row, bpb, bass);   // alternating bass — see BASS NOTES
  const at = {};
  events.forEach(ev => {
    if(ev.start < row.b0 - 1e-6 || ev.start >= row.b1 - 1e-6) return;
    at[Math.round((ev.start - row.b0) * sub)] = ev;
  });
  const beatOf = sub === 3
    ? c => (c < used ? Math.round(row.b0 * 3) + c : null)
    : c => (c < used && c % 2 === 0) ? Math.round(row.b0 + c / 2) : null;
  const strRows = TAB_STRINGS.map(lab => {
    const cells = [`<div class="tab-str-label">${lab}</div>`];
    for(let c = 0; c < cols; c++){
      const b = beatOf(c), ev = at[c];
      const hit = ev && !ev.rest ? ev.frets.find(([s]) => s === lab) : null;
      const bn = bassAt[c] && bassAt[c].s === lab ? bassAt[c] : null;
      const attrs = (b !== null ? ` data-beat="${b}"` : '') + (ev && !ev.rest ? ` data-seq="${seqOff + ev.seq}"` : '');
      const cls = c < used ? 'tab-cell' : 'tab-cell tab-pad';   // a short last row's empty columns carry no string line
      const fret = hit ? hit[1] : (bn ? bn.f : null);
      cells.push(fret !== null
        ? `<div class="${cls}"${attrs}><span class="tab-fret${bn ? ' tab-bass' : ''}">${escHtml(String(fret))}</span></div>`
        : `<div class="${cls}"${attrs}></div>`);
    }
    return cells.join('');
  }).join('');
  let bars = '';
  for(let c = barCols; c < used; c += barCols) bars += `<div class="tab-bar-line" style="grid-column:${c + 2};grid-row:1/7" aria-hidden="true"></div>`;
  // The name row keeps its height in a row where no chord starts (a long chord held across the row).
  let names = '<div class="tab-chord-pad" style="grid-row:7;grid-column:1" aria-hidden="true"></div>';
  /* A rest is drawn as a word in the name row — at its onset, and at the start of
     any row that begins inside one — so a silent bar does not look like a held
     chord while the beats keep lighting. */
  events.forEach(ev => {
    if(!ev.rest) return;
    const end = ev.start + ev.beats;
    let col = -1;
    if(ev.start >= row.b0 - 1e-6 && ev.start < row.b1 - 1e-6) col = Math.round((ev.start - row.b0) * sub);
    else if(ev.start < row.b0 && end > row.b0 + 1e-6) col = 0;
    if(col >= 0 && restWord !== false) names += `<span class="tab-rest-lab" style="grid-row:7;grid-column:${col + 2}">${escHtml(t('tab.restStop'))}</span>`;
  });
  /* A chord still ringing when a row begins (a lyric line or a 4-bar wrap that
     starts mid-chord) gets its name at the row's first column in parentheses —
     the site's mark for a held beat (the timed TAB count row uses the same) —
     so no row opens on an empty name cell. Its frets are not repeated: the
     chord is still shown once, where it starts. */
  const chordBtn = (ev, col, held) => {
    const midisAttr = escAttr(JSON.stringify(ev.midi.map(Number)));
    const tip = t('tab.playNote', {note: ev.name});
    const label = held ? `(${ev.name})` : ev.name;
    return `<button type="button" class="tab-note-btn tab-chord-btn" style="grid-row:7;grid-column:${col + 2}" data-seq="${seqOff + ev.seq}" data-midis="${midisAttr}" onclick="playBeat(this)" title="${escAttr(tip)}" aria-label="${escAttr(tip)}">${escHtml(label)}<span class="tab-spkr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg></span></button>`;
  };
  events.forEach(ev => {
    if(ev.rest || at[0]) return;
    if(ev.start < row.b0 - 1e-6 && ev.start + ev.beats > row.b0 + 1e-6) names += chordBtn(ev, 0, true);
  });
  Object.keys(at).forEach(k => {
    const ev = at[k];
    if(ev.rest) return;
    names += chordBtn(ev, Number(k), false);
  });
  let counts = '<div class="tab-count" style="grid-row:8;grid-column:1" aria-hidden="true"></div>';
  for(let c = 0; c < cols; c++){
    const b = beatOf(c);
    const pos = `style="grid-row:8;grid-column:${c + 2}"`;
    if(c >= used) counts += `<div class="tab-count" ${pos} aria-hidden="true"></div>`;
    else if(b !== null) counts += `<div class="tab-count" data-beat="${b}" ${pos} aria-hidden="true">${sub === 3 ? c % barCols + 1 : (c / 2) % bpb + 1}</div>`;
    else counts += `<div class="tab-count tab-count-held" ${pos} aria-hidden="true">+</div>`;
  }
  return `
      <div class="tab-grid chord-grid" style="grid-template-columns:28px repeat(${cols},1fr)">
        <div class="tab-box" style="grid-column:2/${used + 2};grid-row:1/7"></div>
        ${strRows}
        ${bars}
        ${names}
        ${counts}
      </div>`;
}
/* The grid rows of one section, with a lyric line (pc-row-label) over each
   row that starts one. */
function pcChordGridHtml(S, bpb, sub){
  sub = sub === 3 ? 3 : 2;
  const events = pcChordGrid(S.notes, bpb, S.every);
  const cols = Math.min(PC_GRID_BARS, S.bars) * bpb * sub;
  return pcGridRows(S, bpb).map(row =>
    (row.label ? `<div class="tab-phrase-label pc-row-label">${escHtml(String(row.label))}</div>` : '')
    + renderChordGridRow(events, row, cols, bpb, S.seqOff, S.bass, !S.quietRest, sub)
  ).join('');
}
/* Sections with their tab offsets and running beat totals, plus the window
   the player loops over (bars from the first section to the end of the
   last). null when the track is unknown — the card then renders nothing
   rather than a player with no song (checks.mjs 1bf fails that push). */
function pcLayout(a){
  const c = a && a.card;
  const tr = c && SNIPPET_TRACKS[c.track];
  if(!tr) return null;
  let seq = 0;
  const sections = (c.sections || []).map(s => {
    const notes = s.notes || [];
    /* grid: this section is drawn as a chord grid (card.chordGrid, with
       section.chordGrid:false to opt one out) — see CHORD GRID below. */
    const out = { s, notes, fromBar: Math.max(1, s.fromBar || 1), bars: Math.max(1, s.bars || 1),
                  reps: Math.max(1, s.reps || 1), seqOff: seq, beatEnds: [],
                  grid: !!(c.chordGrid && s.chordGrid !== false), every: !!c.everyStrum, quietRest: c.restWord === false,
                  nameAgain: !!(c.sheet && Array.isArray(c.sheetNamedAgain) && c.sheetNamedAgain.includes(s.label)) };   // see pcSheetMap
    out.bass = out.grid && c.__bass ? c.__bass : null;   // alternating bass, drawn on the grid only — see BASS NOTES
    let acc = 0;
    notes.forEach(n => { acc += n.beats > 0 ? n.beats : 1; out.beatEnds.push(acc); });
    seq += notes.length;
    return out;
  });
  if(!sections.length) return null;
  const firstBar = sections[0].fromBar;
  const last = sections[sections.length - 1];
  return { tr, sections, firstBar, totalBars: last.fromBar + last.bars * last.reps - firstBar };
}
/* Where `barsIn` (fractional bars from the window start) falls: which
   section, which repeat of it, which note on its page, that note's
   data-seq in the tab, and the beat / bar within the pass. */
function pcLocate(L, barsIn){
  if(!(barsIn >= 0)) return null;
  const songBar = L.firstBar + barsIn;
  for(let si = L.sections.length - 1; si >= 0; si--){
    const S = L.sections[si];
    if(songBar < S.fromBar) continue;
    const beatIn = (songBar - S.fromBar) * L.tr.beatsPerBar;
    const repBeats = S.bars * L.tr.beatsPerBar;
    const rep = Math.min(S.reps - 1, Math.floor(beatIn / repBeats));
    const local = beatIn - rep * repBeats;
    let ni = S.beatEnds.findIndex(e => local < e - 1e-6);
    if(ni < 0) ni = S.notes.length - 1;
    /* beat: the whole beat within this pass (0-based) — what a chord grid's
       cursor sits on. bar: the bar within the pass. */
    const bpb = L.tr.beatsPerBar > 0 ? L.tr.beatsPerBar : 4;
    if(S.grid && L.tr.countSix){   // the cursor's six steps a bar — see COUNT IN SIX
      const e8 = Math.max(0, Math.min(Math.round(repBeats * 3) - 1, Math.floor(local * 3 + 1e-6)));
      return { si, rep, ni, seq: S.seqOff + ni, beat: e8, bar: Math.floor(e8 / (bpb * 3)) };
    }
    const beat = Math.max(0, Math.min(Math.round(repBeats) - 1, Math.floor(local + 1e-6)));
    return { si, rep, ni, seq: S.seqOff + ni, beat, bar: Math.floor(beat / bpb) };
  }
  return null;
}
const PC_TAB_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
function pcPlayBtnHtml(playing){
  return (playing ? '&#x25A0; ' : '&#x25B6; ')
    + `<span class="pc-play-label">${escHtml(t(playing ? 'ca.snipStop' : 'ca.cardPlay'))}</span>`;
}
/* The speed control. Every card gets the Slower / Normal switch (the slow
   and fast files). A card with `slowest: true` gets a four-way control
   instead — Slowest / Slower / Slow / Normal — where Slowest is the SLOW file
   played at SLOWEST_RATE, pitch held (preservesPitch), so the tuner
   still agrees with it. ca-18 only, for now (Jonathan, 2026-09-29: a
   student needed it that day); ca-10 got it the same day. "the cure" goes
   60 -> 48 felt BPM. There is no third file: every timing below reads the
   file's own clock (currentTime), so only the real-time pieces — the
   count-in, the click lookahead and the output latency — divide by the
   rate. SLOWEST_RATE and slowestApplyRate() live with the snippet player,
   which has the same Slowest tier.
   A fourth stop, Slow (Jonathan, 2026-10-09: "just below the normal speed
   of each song"), sits between Slower and Normal: the FAST file at
   pcSlowRate(tr), halfway between the slow tier and normal for that song —
   so it is always above Slower, even on Watchtower where the slow file is
   already 105 against 115. Each option carries its own playback rate in
   data-rate; the card's data-rate is what pcRate() reads. */
function pcSlowRate(tr){ return (1 + tr.trackBpmSlow / tr.trackBpm) / 2; }
/* A control's tooltip naming its key (KEYS, below). None in the console's
   preview (`preview`), where the keys are off. */
function pcKeyTitle(key, preview){ return preview ? '' : ` title="${escAttr(t(key))}"`; }
function pcSpeedSwitchHtml(preview){
  return `<button type="button" class="pc-speed" role="switch" aria-checked="false" aria-label="${escAttr(t('ca.cardSpeedAria'))}"${pcKeyTitle('pc.keys.speed', preview)} onclick="pcSetSpeed(this)">`
    +   `<span class="pc-speed-lab on">${escHtml(t('ca.cardSlower'))}</span>`
    +   `<span class="pc-speed-track" aria-hidden="true"><span class="pc-speed-knob"></span></span>`
    +   `<span class="pc-speed-lab">${escHtml(t('ca.cardNormal'))}</span></button>`;
}
/* The Guitar switch (2026-10-09, Jonathan: "a switch like the old tempo
   switch" that says "guitar on / guitar off"): the same track-and-knob as
   pcSpeedSwitchHtml, Off on the left and On on the right, knob under the
   bold label. "Off" is the rhythm-down mix, so the record's guitar gets
   quieter, not silent; the tooltip (ca.cardGuitarTitle) says so. Step
   snippets and the Journey pages keep their who-plays-it button. It sits
   in a chip like the Metronome button, with a green track, so it never
   reads as part of the purple speed control beside it. */
function pcGuitarSwitchHtml(){
  return `<button type="button" class="pc-speed pc-guitar" role="switch" aria-checked="true" aria-label="${escAttr(t('ca.cardGuitarAria'))}" title="${escAttr(t('ca.cardGuitarTitle'))}" onclick="pcSetGuitar(this)">`
    +   `<span class="pc-guitar-ico" aria-hidden="true">&#x1F3B8;</span>`
    +   `<span class="pc-speed-lab">${escHtml(t('ca.cardGuitarOff'))}</span>`
    +   `<span class="pc-speed-track" aria-hidden="true"><span class="pc-speed-knob"></span></span>`
    +   `<span class="pc-speed-lab on">${escHtml(t('ca.cardGuitarOn'))}</span></button>`;
}
function pcSpeed3Html(tr, preview){
  /* A stepped slider (2026-10-08): the dot-row version left students unsure
     the middle dots were options at all. The ends read "Slower" and
     "Normal" (Jonathan, 2026-10-09) as directions, not stop names; every
     stop shows how fast it plays against the record (pcSpeedFactor), worked
     out from this song's files, and the knob's stop is the bold one. The
     native range does drag, keyboard and the accessible value; the ticks sit
     exactly under its four stops, so a tap on a tick lands on that stop.
     Each tick still carries data-speed / data-rate — pcSetSpeedTo() reads
     the one the range points at. */
  const ratio = tr.trackBpmSlow / tr.trackBpm;   // the slow file against the record
  const stops = [
    ['slowest', 'ca.cardSlowest', SLOWEST_RATE,                ratio * SLOWEST_RATE],
    ['slower',  'ca.cardSlower',  1,                           ratio],
    ['slow',    'ca.cardSlow',    pcSlowRate(tr).toFixed(4),   pcSlowRate(tr)],
    ['normal',  'ca.cardNormal',  1,                           1],
  ];
  const START = 1;   // Slower — the card opens with data-slow="1"
  const ticks = stops.map(([speed, key, rate, factor], i) => {
    const x = pcSpeedFactor(factor);
    return `<span class="pc-speed-tick${i === START ? ' on' : ''}" style="--i:${i}" data-speed="${speed}" data-rate="${rate}" data-label="${escAttr(t(key) + ', ' + x)}"></span>`
      + `<span class="pc-speed-x${i === START ? ' on' : ''}" style="--i:${i}" aria-hidden="true">${x}</span>`;
  }).join('');
  return `<span class="pc-speed4" role="group" aria-label="${escAttr(t('ca.cardSpeed4Aria'))}"${pcKeyTitle('pc.keys.speed', preview)}>`
    + `<span class="pc-speed-end" aria-hidden="true">${escHtml(t('ca.cardSlower'))}</span>`
    + `<span class="pc-speed-rail"><span class="pc-speed-line" aria-hidden="true"></span>${ticks}`
    +   `<input type="range" class="pc-speed-range" min="0" max="3" step="1" value="${START}" aria-label="${escAttr(t('ca.cardSpeedLabel'))}" aria-valuetext="${escAttr(t(stops[START][1]) + ', ' + pcSpeedFactor(stops[START][3]))}" oninput="pcSpeedShow(this)" onchange="pcSetSpeedTo(this)"></span>`
    + `<span class="pc-speed-end" aria-hidden="true">${escHtml(t('ca.cardNormal'))}</span>`
    + `</span>`;
}
// 0.833 -> "0.85×": the nearest 0.05, YouTube's playback-speed style.
function pcSpeedFactor(f){ return (Math.round(f * 20) / 20).toString() + '\u00d7'; }
function pcRate(root){ const r = root && parseFloat(root.dataset.rate); return r > 0 ? r : 1; }
function pcPlayerHtml(a, L, preview){
  const hasFull = snippetHasFull(L.tr);
  return `<div class="pc-player">`
    + `<button type="button" class="pc-play"${pcKeyTitle('pc.keys.play', preview)} onclick="pcToggle(this)">${pcPlayBtnHtml(false)}</button>`
    + `<button type="button" class="snip-toggle pc-metro" aria-pressed="false" onclick="pcSetMetro(this)">&#x1F3B5; ${escHtml(t('tools.metronome'))}</button>`
    + (a.card.slowest ? pcSpeed3Html(L.tr, preview) : pcSpeedSwitchHtml(preview))
    /* The Guitar switch: only where a full mix exists, ON by default. */
    + (hasFull ? pcGuitarSwitchHtml() : '')
    + `</div>`;
}
function pcTabHtml(a, L, preview){
  const c = a.card;
  const many = L.sections.length > 1;
  const chips = many
    ? `<p class="pc-hint">${escHtml(t('ca.cardSectionHint'))}</p><div class="pc-secs">`
      + L.sections.map((S, si) => `<button type="button" class="pc-sec${si === 0 ? ' cur' : ''}" data-sec="${si}"${pcKeyTitle('pc.keys.section', preview)} onclick="pcFromSection(this,${si})"><span class="pc-sec-play" aria-hidden="true">&#x25B6;</span>${escHtml(tf(S.s, 'label'))}</button>`).join('')
      + `</div>`
    : '';
  const pages = L.sections.map((S, si) => {
    const widest = S.notes.length || 1;
    const grids = [];
    /* A chord-grid section (card.chordGrid) is laid out by pcChordGridHtml
       instead — see CHORD GRID. It always shows its own count row. */
    if(S.grid){
      return `<div class="tab-page pc-page" data-page="${si}"${si ? ' hidden' : ''}><div class="tab-phrase">`
        + `<div class="tab-phrase-label">${escHtml(tf(S.s, 'caption'))}<span class="pc-rep" hidden></span></div>`
        + `<div class="tab-board">${pcChordGridHtml(S, L.tr.beatsPerBar > 0 ? L.tr.beatsPerBar : 4, L.tr.countSix ? 3 : 2)}</div></div></div>`;
    }
    const counts = c.counts ? tabCounts(S.notes, L.tr.beatsPerBar) : null;   // card.counts — the Counts switch
    /* `rows` on a section — notes per tab row, e.g. [7, 9] — ends each row
       where the music does instead of balancing them (ca-25 / ca-31 chorus:
       one riff lap per row; balanced, lap 2's first E sat at the end of row
       1 — Jonathan, 2026-10-05). Every row shares the widest row's columns.
       Ignored unless it accounts for every note (checks.mjs 1bf fails that). */
    const rowsSpec = Array.isArray(S.s.rows) && S.s.rows.every(r => Number.isInteger(r) && r > 0)
      && S.s.rows.reduce((x, y) => x + y, 0) === S.notes.length ? S.s.rows : null;
    /* A Counts card lays its TAB out in time (renderTabSystem `timed`): one
       bar per row, every row as wide as a bar in eighths, so beat 3 sits
       under beat 3 in every row. Needs every note a whole number of
       eighths; otherwise the count row still shows, on the plain layout. */
    const timed = !!counts && counts.length > 0 && counts.every(x => x.span);
    if(timed){
      const bpb = L.tr.beatsPerBar > 0 ? L.tr.beatsPerBar : 4;
      const bars = [];
      counts.forEach((x, i) => { const b = Math.floor(x.start / bpb + 1e-6); (bars[b] = bars[b] || []).push(i); });
      const rowsIdx = bars.filter(Boolean);
      const cols = Math.max(bpb * 2, ...rowsIdx.map(r => r.reduce((a, i) => a + counts[i].span, 0)));
      rowsIdx.forEach(r => {
        const k = r[0], m = r.length;
        grids.push(renderTabSystem(S.notes.slice(k, k + m), S.seqOff + k, cols, false, counts.slice(k, k + m), true));
      });
    } else if(rowsSpec){
      const cols = Math.max(...rowsSpec);
      /* `rowLabels` / `rowLabels_es` (optional, one string per row) print a
         line over each row — the lyric that row is sung to (ca-35, Las
         Mañanitas, Jonathan 2026-10-14: "add lyrics"). Plain text, escaped;
         ignored unless there is exactly one per row (checks.mjs 1bf). The
         label is a sibling of the .tab-grid rows, so pcFollow() skips over
         it when it looks for the next row. */
      const rl = tf(S.s, 'rowLabels');
      const labels = Array.isArray(rl) && rl.length === rowsSpec.length ? rl : null;
      let k = 0;
      rowsSpec.forEach((r, ri) => {
        if(labels && labels[ri]) grids.push(`<div class="tab-phrase-label pc-row-label">${escHtml(String(labels[ri]))}</div>`);
        grids.push(renderTabSystem(S.notes.slice(k, k + r), S.seqOff + k, cols, false, counts && counts.slice(k, k + r))); k += r;
      });
    } else {
      const perRow = Math.ceil(widest / Math.ceil(widest / TAB_MAX_COLS));
      for(let k = 0; k < S.notes.length; k += perRow) grids.push(renderTabSystem(S.notes.slice(k, k + perRow), S.seqOff + k, perRow, false, counts && counts.slice(k, k + perRow)));
    }
    return `<div class="tab-page pc-page" data-page="${si}"${si ? ' hidden' : ''}><div class="tab-phrase">`
      + `<div class="tab-phrase-label">${escHtml(tf(S.s, 'caption'))}<span class="pc-rep" hidden></span></div>`
      + `<div class="tab-board">${grids.join('')}</div></div></div>`;
  }).join('');
  const pager = many
    ? `<div class="tab-pager pc-pager">`
      + `<button type="button" class="tab-pager-btn"${pcKeyTitle('pc.keys.prev', preview)} onclick="pcPage(this,-1)" disabled>&#x25C0; ${escHtml(t('tab.pagePrev'))}</button>`
      + `<span class="tab-pager-label" aria-live="polite">${escHtml(t('ca.cardSectionOf', {a: 1, n: L.sections.length}))}</span>`
      + `<button type="button" class="tab-pager-btn"${pcKeyTitle('pc.keys.next', preview)} onclick="pcPage(this,1)">${escHtml(t('tab.pageNext'))} &#x25B6;</button></div>`
    : '';
  const title = (c.caption && tf(c, 'caption')) || t('tab.defaultTitle');
  /* The status line ("Playing from Chorus", the count-in, "End of the
     song") lives at the top of the TAB, not in the player row (2026-10-10,
     maximize-the-view): with the four-stop slider and the Guitar switch the
     player row is full at Chromebook width, so the status wrapped onto a
     blank line of its own and cost every card ~31px. On a card with
     sections it takes the "Tap a section…" line while it has something to
     say (styles.css), so nothing moves when the song starts. */
  /* The Counts switch (card.counts, first ca-29 — Jonathan 2026-10-21: "a toggle
     switch to turn it on or off, default off"). In the TAB's own head, not
     the player row, which is full at Chromebook width. The choice is
     remembered per browser (pcCountsPref); first visit is off. */
  /* A card whose every section is a chord grid has no switch: those sections
     always show their count row. A mixed card (ca-41) keeps it for the
     sections that are not a grid, and its label says the count shows beats. */
  const hasGrid = L.sections.some(S => S.grid);
  const needsCounts = !!c.counts && L.sections.some(S => !S.grid);
  const countsOn = needsCounts && pcCountsPref();
  const countsAria = t(hasGrid ? 'ca.cardCountsAriaGrid' : 'ca.cardCountsAria');
  const countsSw = needsCounts
    ? `<button type="button" class="pc-speed pc-guitar pc-counts" role="switch" aria-checked="${countsOn}" aria-label="${escAttr(countsAria)}" title="${escAttr(countsAria)}" onclick="pcSetCounts(this)">`
      + `<span class="pc-speed-lab on">${escHtml(t('ca.cardCounts'))}</span>`
      + `<span class="pc-speed-track" aria-hidden="true"><span class="pc-speed-knob"></span></span></button>`
    : '';
  return `<div class="tab pc-tab${countsOn ? ' counts-on' : ''}"><div class="tab-head"><span class="tab-icon">${PC_TAB_ICON}</span><span class="tab-title">${escHtml(title)}</span>${countsSw}<span class="tab-kind">${t('tab.label')}</span></div>`
    + `<div class="tab-body"><p class="pc-status" aria-live="polite"></p>${chips}${pages}${pager}</div></div>`;
}
/* No checklist on a practice card (Jonathan, 2026-11-10: "get rid of the
   checklists on the activities. only have mark complete or next step"). The
   card ends with its Mark complete button (caMarkRowHtml), or with nothing on
   an extra song. What its last check, the Level up, carried stays as a plain
   button with no checkbox: the link to the next practice card (`card:
   'ca-N'` on the Level up, ca-10 → ca-25, shown once that card can be opened)
   or the Song Journey page. The Song Journey button lives here and only here
   on a card — the card's equivalent of caStepHtml's last-step rule
   (checks.mjs 1ba pins this call). The console preview shows its own link
   row instead. */
function pcChecksHtml(a, preview){
  const checks = caCardChecks(a);
  const ci = checks.length - 1, c = checks[ci] || {};
  let jl = '';
  if(ci === checks.length - 1 && c.levelUp && !preview) jl = caJourneyLinkHtml(a);
  if(ci === checks.length - 1 && c.levelUp && c.card && !preview) jl = caCardLinkHtml(a.id, c.card);
  return jl ? `<div class="pc-next">${jl}</div>` : '';
}
/* The step ladder, read-only: each step a fold with its text and tab. No
   Mark done — the checks above are what a student ticks. */
function pcHelpHtml(a, preview){
  const steps = a.steps || [];
  if(!steps.length) return '';
  const pfx = preview ? 'ca-preview' : 'ca';
  const body = steps.map((st, si) => {
    const tab = st.tab ? buildTab(st.tab, { keyPrefix: `bpm:${pfx}:${a.id}:h${si}:tab`, defaultLinesPerPage: CA_TAB_LINES_PER_PAGE, suppressCoach: preview, noRevealDelay: true }) : '';
    return `<details class="pc-help-step"><summary>${escHtml(caStepHeadText(st, si))}</summary><div class="pc-help-body">${wrapGotItWhen(tf(st, 'text') || '')}${tab}</div></details>`;
  }).join('');
  return `<button type="button" class="pc-help-btn" aria-expanded="false" onclick="pcToggleHelp(this)">${escHtml(t('ca.cardHelp'))} <span class="pc-help-arrow" aria-hidden="true">&#x25B8;</span></button>`
    + `<div class="pc-help" hidden><p class="pc-help-note">${escHtml(t('ca.cardHelpNote'))}</p>${body}</div>`;
}
function caCardBodyHtml(a, opts){
  a = caView(a);   // power-chord version when the switch says so — see caView
  const L = pcLayout(a);
  if(!L) return '';
  const preview = !!(opts && opts.preview);
  /* A card with `card.sheet` shows that chord sheet PDF in place of the tab
     (ca-38 — see LYRIC SHEET below). The sheet is drawn after the HTML is in
     the page, so the builder only queues a scan; every caller (the student
     card, the hero card, the console preview) gets it the same way. */
  const sheet = !!a.card.sheet;
  if(sheet) setTimeout(pcSheetScan, 0);
  return `<div class="pc" data-id="${escAttr(a.id)}" data-slow="1"${snippetHasFull(L.tr) ? ' data-guitar="1"' : ''}${preview ? ' data-preview="1"' : ''}>`
    + caRecordingSwitchHtml(a) + caKeySwitchHtml(a) + caChordSwitchHtml(a) + caBassSwitchHtml(a)
    + `<p class="pc-dir">${escHtml(t(sheet ? 'ca.sheetDirections' : L.sections.some(S => S.grid) ? (L.sections.every(S => S.grid) ? (L.sections.every(S => S.every) ? 'ca.cardStrumDirections' : 'ca.cardChordDirections') : 'ca.cardChordMixedDirections') : 'ca.cardDirections'))}`
    + (caBassMode(a) === 'on' && tf(a, 'bassDirections') ? ' ' + escHtml(tf(a, 'bassDirections')) : '')   // alternating bass — see BASS NOTES
    + `</p>`
    + pcPlayerHtml(a, L, preview) + (sheet ? pcSheetHtml(a, L, preview) : pcTabHtml(a, L, preview)) + pcChecksHtml(a, preview) + pcHelpHtml(a, preview)
    + `</div>`;
}

/* ══ LYRIC SHEET — a practice card drawn as a chord sheet PDF ═══════════
   (Jonathan, 2026-10-19; ca-38.) `card.sheet` names a PDF in sheets/ — his
   own chord sheet, saved from Word — and the card shows it AS IS, lyrics and
   all, in place of the tab. Everything else is the practice card unchanged:
   Play song, the four speeds, the Guitar switch, the Metronome, the checks,
   pcFrame's clock and pcLocate. Only the marks differ:
     - the DOT sits just left of the chord being played. It fills in on
       every BEAT (2026-10-26 — not on every strum: the record's strumming
       is not consistent) and goes hollow between beats; a faint ring marks
       the next chord;
     - "This bar" counts 1 + 2 + 3 + 4 + and marks where each chord starts
       (a "+" cell too, never lit), lighting the beat cell only, sticky at
       the top of the sheet so it stays on screen;
     - the page follows the line being played (pcFollow, the tab's own rule).
   Where the chords are is read from the PDF's TEXT, never typed into code:
   every word on a line made only of chord names is a chord, in reading
   order, a two-column page column by column. Chord n on the sheet is the
   card's n-th chord CHANGE (a repeated strum of the same chord is the same
   chord name), so the sheet must have exactly one name per change —
   checks.mjs 1bf2 holds that, and the console preview says so if it breaks.
   pdf.js (vendor/pdfjs, Mozilla, Apache-2.0) draws the page; it loads only
   when a sheet card is on screen. Vendored, not a CDN: the CSP in
   index.html runs scripts from this origin only (plus Google/Firebase). */
const PC_SHEET_LEAD = 0.175;      // real seconds the dot runs ahead of the record — Jonathan tuned it by ear, 2026-10-19
/* The tab's note cursor lights on the decoder's position, NOT held back by
   snipLatency() as it was until 2026-10-22 (Jonathan, on ca-29: "the
   highlighting of the notes is a few ms behind"). Held back, it lit with the
   sound, and a cue that arrives with the sound reads as late — the same
   reason the snippet dots are left slightly early. Raise it to lead more. */
const PC_TAB_LEAD = 0;
/* …except at a LINE change (Jonathan, 2026-10-22, ca-29: "the highlight is
   delayed every time it changes to the second line or goes back to the
   first line"). Inside a line the eye is already on the next note; at a
   line change it has to jump to the start of another row, so a cursor that
   gets there with the sound reads as late. The first note of a new row (or
   a new section's page) lights this many real seconds early; every other
   note keeps PC_TAB_LEAD. Same reason as PC_SHEET_LEAD. On a chord grid the
   cursor is a beat, not a note, and the same rule holds (pcLocRow). */
const PC_ROW_LEAD = 0.15;
const PC_SHEET_SOLID = 0.42;      // beats the dot stays filled after a beat
const PC_SHEET_MAX_SCALE = 1.9;   // CSS px per PDF point at most (chord names ~19px)
const PC_SHEET_CHORD_RE = /^[A-G](#|b)?(maj|min|m|dim|aug|sus|add|\+|°|ø|[0-9])*(\/[A-G](#|b)?)?$/;
function pcSheetLoadPdfjs(){
  return loadScriptOnce('vendor/pdfjs/pdf.min.js').then(() => {
    if(!window.pdfjsLib) throw new Error('pdf.js did not load');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/pdf.worker.min.js';
    return window.pdfjsLib;
  });
}
/* One parse per PDF: EVERY page (2026-11-03 — "the cure" runs to three
   pages, Sweet Child to two; ca-38 is one), and every chord name on them in
   reading order. The pages are stacked into one tall sheet: each is cropped
   to its words (pages share one left/right edge so they line up) and placed
   under the one before, so a token's x0/y0 are in that sheet's PDF points
   and `crop` is the whole stack ({ x: 0, y: 0, w, h }). Reading order is
   page by page, and on a page column by column — or, with `cols` 1
   (card.sheetColumns: 1, a one-column chord-over-lyric sheet), line by line
   with no column split: a chord line's wide gaps are not a gutter there. */
const pcSheetModels = {};
function pcSheetModel(url, cols){
  const one = cols === 1, key = url + (one ? '#1' : '');
  if(pcSheetModels[key]) return pcSheetModels[key];
  pcSheetModels[key] = pcSheetLoadPdfjs().then(async lib => {
    const doc = await lib.getDocument(url).promise;
    const pages = [];
    for(let pn = 1; pn <= doc.numPages; pn++) pages.push(await pcSheetPage(await doc.getPage(pn), one));
    const all = pages.flatMap(P => P.words);
    if(!all.length) throw new Error('the PDF has no text — save it from Word, not as a scan');
    const pad = 14, W = Math.max(...pages.map(P => P.width));
    const x = Math.max(0, Math.min(...all.map(w => w.x0)) - pad);
    const w = Math.min(W, Math.max(...all.map(w2 => w2.x1)) + pad) - x;
    let top = 0;
    const toks = [];
    pages.forEach(P => {
      if(!P.words.length){ P.top = null; return; }
      P.y = Math.max(0, Math.min(...P.words.map(w2 => w2.y0)) - pad);
      P.h = Math.min(P.height, Math.max(...P.words.map(w2 => w2.y1)) + pad) - P.y;
      P.top = top; top += P.h;
      P.toks.forEach(T => toks.push({ name: T.name, x0: T.x0 - x, x1: T.x1 - x, y0: T.y0 - P.y + P.top, y1: T.y1 - P.y + P.top }));
    });
    return { pages: pages.filter(P => P.top !== null).map(P => ({ page: P.page, x, y: P.y, h: P.h, top: P.top })), toks, crop: { x: 0, y: 0, w, h: top } };
  });
  pcSheetModels[key].catch(() => { delete pcSheetModels[key]; });   // a failed load can be tried again
  return pcSheetModels[key];
}
/* One page of a sheet: its words and its chord names in reading order, in
   that page's PDF points with y running down the page. */
async function pcSheetPage(page, one){
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  const words = [];
  tc.items.forEach(it => {
    if(!it.str || !it.str.trim()) return;
    const [a, b, , d, e, f] = it.transform;
    const size = Math.hypot(a, b) || Math.abs(d) || it.height || 10;
    const cw = it.width / it.str.length;   // the sheets are Courier: every character is one width
    const re = /\S+/g; let m;
    while((m = re.exec(it.str))){
      const x0 = e + m.index * cw, x1 = x0 + m[0].length * cw;
      const r = vp.convertToViewportRectangle([x0, f - size * 0.22, x1, f + size * 0.78]);
      words.push({ s: m[0], x0: Math.min(r[0], r[2]), x1: Math.max(r[0], r[2]), y0: Math.min(r[1], r[3]), y1: Math.max(r[1], r[3]) });
    }
  });
  // Lines by baseline; on a two-column sheet a wide gap past the middle of the page starts the second column.
  const byY = new Map();
  words.forEach(w => { const k = Math.round(w.y1); (byY.get(k) || byY.set(k, []).get(k)).push(w); });
  const segs = [];
  byY.forEach(ws => {
    ws.sort((p, q) => p.x0 - q.x0);
    let cur = [ws[0]];
    for(let i = 1; i < ws.length; i++){
      if(!one && ws[i].x0 - ws[i - 1].x1 > vp.width * 0.08 && ws[i].x0 > vp.width * 0.4){ segs.push(cur); cur = []; }
      cur.push(ws[i]);
    }
    segs.push(cur);
  });
  const lines = segs.filter(ws => ws.every(w => PC_SHEET_CHORD_RE.test(w.s)));
  lines.forEach(ws => { ws.col = !one && ws[0].x0 > vp.width * 0.45 ? 1 : 0; });
  lines.sort((p, q) => p.col - q.col || p[0].y0 - q[0].y0);
  const toks = lines.flatMap(ws => ws.map(w => ({ name: w.s, x0: w.x0, x1: w.x1, y0: w.y0, y1: w.y1 })));
  return { page, width: vp.width, height: vp.height, words, toks };
}
/* Which sheet chord each note of the card is: tok[si][rep][ni]. A rest is not a
   chord on the sheet: the dot stays on the chord before it. The count
   goes up at every chord CHANGE across the whole song, laps included —
   and at the first chord of every lap of a section named in
   card.sheetNamedAgain (Jonathan, 2026-11-03: Sweet Child's sheet writes
   D5 at the start of each intro line, verse half and riff lap, where the
   D5 is still ringing from before). */
function pcSheetMap(L){
  const tok = [], start = [];
  let n = -1, prev = null;
  L.sections.forEach((S, si) => {
    tok[si] = [];
    for(let r = 0; r < S.reps; r++){
      tok[si][r] = S.notes.map((nt, ni) => {
        if(!nt.rest && (nt.note !== prev || (S.nameAgain && ni === 0))){ n++; prev = nt.note; start[n] = { si, rep: r, name: nt.note }; }
        return n;
      });
    }
  });
  return { tok, start, count: n + 1 };
}
function pcSheetHtml(a, L, preview){
  const c = a.card;
  const many = L.sections.length > 1;
  const chips = many
    ? `<div class="pc-secs">` + L.sections.map((S, si) => `<button type="button" class="pc-sec${si === 0 ? ' cur' : ''}" data-sec="${si}"${pcKeyTitle('pc.keys.section', preview)} onclick="pcFromSection(this,${si})"><span class="pc-sec-play" aria-hidden="true">&#x25B6;</span>${escHtml(tf(S.s, 'label'))}</button>`).join('') + `</div>`
    : '';
  const cells = ['1', '+', '2', '+', '3', '+', '4', '+'].slice(0, L.tr.beatsPerBar * 2)
    .map(n => `<span class="pc-strip-cell"><span class="pc-strip-ch"></span><span class="pc-strip-n">${n}</span></span>`).join('');
  const title = (c.caption && tf(c, 'caption')) || '';
  return `<div class="pc-sheet" data-sheet="${escAttr(c.sheet)}">`
    + (title ? `<p class="pc-sheet-title">${escHtml(title)}</p>` : '')
    + `<p class="pc-status" aria-live="polite"></p>`
    + `<p class="pc-hint">${escHtml(t('ca.sheetTapHint'))}</p>${chips}`
    + `<div class="pc-sheet-bar"><span class="pc-sheet-where">${escHtml(pcSheetWhere(L, 0, 0))}</span>`
    +   `<span class="pc-strip" aria-hidden="true"><span class="pc-strip-label">${escHtml(t('ca.sheetThisBar'))}</span>${cells}</span></div>`
    + `<div class="pc-sheet-paper"><p class="pc-sheet-msg">${escHtml(t('ca.sheetLoading'))}</p></div>`
    + `</div>`;
}
function pcSheetWhere(L, si, rep){
  const S = L.sections[si];
  if(!S) return '';
  return tf(S.s, 'label') + (S.reps > 1 ? ' · ' + t('ca.cardRepOf', {what: tf(S.s, 'repLabel'), n: rep + 1, total: S.reps}) : '');
}
/* Draw every sheet on the page that has a width. A ResizeObserver redraws
   on a width change — the card opening (a closed card is 0 wide), the
   window, the rail collapsing. */
let pcSheetRO = null, pcSheetCols = [];
/* The fill changing (a window resized onto or off a big screen) leaves the
   column's CSS width alone, so the observer does not fire: redraw any sheet
   drawn at another fill. */
window.addEventListener('resize', () => {
  const fill = typeof siteFill === 'function' ? siteFill() : 1;
  pcSheetCols.forEach(col => { const p = col._sheetPaper; if(p && p.isConnected && p._sheetFill !== undefined && p._sheetFill !== fill) pcSheetDraw(p); });
});
function pcSheetScan(){
  /* Every renderClassActivities() builds a new sheet, and an observed column
     is never let go by itself: drop the ones that have left the page, and
     the paper (with its canvas) each one points at. */
  if(pcSheetRO) pcSheetCols = pcSheetCols.filter(col => {
    if(col.isConnected) return true;
    pcSheetRO.unobserve(col);
    col._sheetPaper = null;
    return false;
  });
  document.querySelectorAll('.pc-sheet-paper:not([data-watched])').forEach(paper => {
    paper.dataset.watched = '1';
    if(typeof ResizeObserver === 'function'){
      if(!pcSheetRO) pcSheetRO = new ResizeObserver(entries => entries.forEach(en => {
        const p = en.target, w = Math.round(en.contentRect.width);
        if(w > 0 && w !== p._sheetW){ p._sheetW = w; pcSheetDraw(p); }
      }));
      pcSheetRO.observe(paper.parentElement);   // the sheet column, not the paper (the paper takes its width from the drawing)
      paper.parentElement._sheetPaper = paper;
      pcSheetCols.push(paper.parentElement);
    } else pcSheetDraw(paper);
  });
}
async function pcSheetDraw(paperOrCol){
  const paper = paperOrCol._sheetPaper || paperOrCol;
  const root = paper.closest('.pc');
  const col = paper.parentElement;
  if(!root || !col || !paper.isConnected) return;
  const a = pcActivity(root), L = a && pcLayout(a);
  if(!L || !a.card.sheet) return;
  const job = paper._sheetJob = (paper._sheetJob || 0) + 1;
  const msg = text => { let m = paper.querySelector('.pc-sheet-msg'); if(!m){ m = document.createElement('p'); m.className = 'pc-sheet-msg'; paper.appendChild(m); } m.textContent = text; m.hidden = !text; };
  let model;
  try { model = await pcSheetModel(a.card.sheet, a.card.sheetColumns); }
  catch(e){ if(paper._sheetJob === job) msg(t('ca.sheetFailed')); return; }
  if(paper._sheetJob !== job || !paper.isConnected) return;
  const avail = col.clientWidth;
  if(!(avail > 0)) return;
  const { crop } = model;
  const scale = Math.min(avail / crop.w, PC_SHEET_MAX_SCALE);
  /* Screen pixels per CSS pixel: the display's own ratio times the big-screen
     fill (site-fill.js), which CSS zoom adds without changing
     devicePixelRatio; without it the sheet is blurred on a big screen. */
  const fill = typeof siteFill === 'function' ? siteFill() : 1;
  const dpr = Math.min((window.devicePixelRatio || 1) * fill, 3);
  let canvas = paper.querySelector('canvas');
  if(!canvas){
    canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', t('ca.sheetAlt'));
    paper.insertBefore(canvas, paper.firstChild);
  }
  const k = scale * dpr;
  const off = document.createElement('canvas');   // draw off screen, then swap — no blank flash on a redraw
  off.width = Math.floor(crop.w * k); off.height = Math.floor(crop.h * k);
  /* Each page on a canvas of its own, then placed under the one before
     (pdf.js paints a page's whole canvas white, so pages can't share one). */
  try {
    const ctx = off.getContext('2d');
    for(const P of model.pages){
      const pc = document.createElement('canvas');
      pc.width = off.width; pc.height = Math.max(1, Math.floor(P.h * k));
      const vp = P.page.getViewport({ scale: k, offsetX: -P.x * k, offsetY: -P.y * k });
      await P.page.render({ canvasContext: pc.getContext('2d'), viewport: vp }).promise;
      if(paper._sheetJob !== job) return;
      ctx.drawImage(pc, 0, Math.floor(P.top * k));
    }
  }
  catch(e){ if(paper._sheetJob === job) msg(t('ca.sheetFailed')); return; }
  if(paper._sheetJob !== job || !paper.isConnected) return;
  canvas.width = off.width; canvas.height = off.height;
  canvas.getContext('2d').drawImage(off, 0, 0);
  paper.style.width = crop.w * scale + 'px';
  paper._sheetFill = fill;
  msg('');
  const map = pcSheetMap(L);
  const ok = map.count === model.toks.length && model.toks.every((T, i) => T.name === map.start[i].name);
  paper._sheet = { model, scale, map, ok };
  paper.querySelectorAll('.pc-sheet-hit, .pc-sheet-line').forEach(el => el.remove());
  if(!ok){
    /* The dot would land on the wrong chords — no dot at all. Say why in
       the console preview, where Jonathan checks a card before class. */
    if(root.dataset.preview === '1'){
      const bad = model.toks.findIndex((T, i) => !map.start[i] || T.name !== map.start[i].name);
      msg(t('ca.sheetMismatch', {sheet: model.toks.length, card: map.count, at: bad + 1}));
    }
    return;
  }
  const box = (T, padX, padY) => `left:${(T.x0 - crop.x - padX) * scale}px;top:${(T.y0 - crop.y - padY) * scale}px;width:${(T.x1 - T.x0 + 2 * padX) * scale}px;height:${(T.y1 - T.y0 + 2 * padY) * scale}px`;
  const html = model.toks.map((T, i) => {
    const at = map.start[i], S = L.sections[at.si];
    return `<button type="button" class="pc-sheet-hit" style="${box(T, 2, 1.5)}" onclick="pcSheetStartAt(this,${i})" aria-label="${escAttr(t('ca.sheetStartAt', {chord: T.name, section: pcSheetWhere(L, at.si, at.rep)}))}"></button>`;
  }).join('');
  paper.insertAdjacentHTML('beforeend', html + '<span class="pc-sheet-line" aria-hidden="true"></span>');
  ['pc-sheet-pill', 'pc-sheet-ghost', 'pc-sheet-dot'].forEach(cls => {
    if(!paper.querySelector('.' + cls)){ const el = document.createElement('span'); el.className = cls; el.setAttribute('aria-hidden', 'true'); paper.appendChild(el); }
  });
  const st = pcState && pcState.root === root ? pcState : null;
  const cur = st && st.si >= 0 ? map.tok[st.si][st.rep][st.seq - st.L.sections[st.si].seqOff] : 0;
  pcSheetMark(paper, cur, false);
}
function pcSheetMark(paper, idx, hit, beatSec){
  const sh = paper._sheet;
  if(!sh || !sh.ok) return null;
  const T = sh.model.toks[idx];
  if(!T) return null;
  const { crop } = sh.model, s = sh.scale;
  const pill = paper.querySelector('.pc-sheet-pill'), dot = paper.querySelector('.pc-sheet-dot'), ghost = paper.querySelector('.pc-sheet-ghost');
  if(pill) pill.style.cssText = `left:${(T.x0 - crop.x - 2) * s}px;top:${(T.y0 - crop.y - 1.5) * s}px;width:${(T.x1 - T.x0 + 4) * s}px;height:${(T.y1 - T.y0 + 3) * s}px`;
  const mid = T2 => ((T2.y0 + T2.y1) / 2 - crop.y) * s;
  if(dot){
    dot.style.left = (T.x0 - crop.x) * s + 'px'; dot.style.top = mid(T) + 'px';
    if(hit){
      dot.style.setProperty('--pc-hit', Math.max(0.08, (beatSec || 0.5) * PC_SHEET_SOLID) + 's');
      dot.classList.remove('hit'); void dot.offsetWidth; dot.classList.add('hit');
    }
  }
  const N = sh.model.toks[idx + 1];
  if(ghost){ ghost.hidden = !N; if(N){ ghost.style.left = (N.x0 - crop.x) * s + 'px'; ghost.style.top = mid(N) + 'px'; } }
  // The line being played, with room for the lyric under it — what pcFollow keeps in view.
  const line = paper.querySelector('.pc-sheet-line');
  if(line){ line.style.top = (T.y0 - crop.y - 3) * s + 'px'; line.style.height = (T.y1 - T.y0) * 2.6 * s + 'px'; }
  return line;
}
function pcSheetPaint(st, loc, flash){
  const paper = st.root.querySelector('.pc-sheet-paper');
  const where = st.root.querySelector('.pc-sheet-where');
  if(where && (loc.si !== st.si || loc.rep !== st.rep)) where.textContent = pcSheetWhere(st.L, loc.si, loc.rep);
  if(loc.si !== st.si) pcShowSection(st.root, st.L, loc.si);
  const sh = paper && paper._sheet;
  if(!sh || !sh.ok) return;
  const idx = sh.map.tok[loc.si][loc.rep][loc.ni];
  const beatSec = st.win.bar / st.L.tr.beatsPerBar / pcRate(st.root);
  const line = pcSheetMark(paper, idx, !!flash, beatSec);
  const T = sh.model.toks[idx];
  if(line && st.sheetLine !== T.y0){ st.sheetLine = T.y0; pcSheetStickyTop(st.root); pcFollow(line, false); }
}
/* "This bar": the strums of the bar being played, and the count it is on. */
function pcSheetStrip(st, loc, barsIn){
  const cells = st.root.querySelectorAll('.pc-strip-cell');
  if(!cells.length) return;
  if(!loc){ cells.forEach(c => c.classList.remove('now')); return; }
  const S = st.L.sections[loc.si], bpb = st.L.tr.beatsPerBar;
  const local = (st.L.firstBar + barsIn - S.fromBar) * bpb - loc.rep * S.bars * bpb;   // beats into this lap
  const bar = Math.max(0, Math.floor(local / bpb + 1e-6));
  const key = loc.si + ':' + bar;
  if(st.stripKey !== key){
    st.stripKey = key;
    // One name per chord CHANGE, on the cell it lands in (a "+" cell too): the strumming is not shown.
    const marks = [];
    pcChordGrid(S.notes, bpb).forEach(ev => {
      if(!ev.rest && ev.bar === bar) marks[Math.round((ev.start - bar * bpb) * 2)] = ev.name;
    });
    cells.forEach((c, i) => { c.classList.toggle('strum', !!marks[i]); c.querySelector('.pc-strip-ch').textContent = marks[i] || ''; });
  }
  // Lit on the BEAT only: the cell stays lit through its "+" and no "+" cell is ever lit.
  const now = Math.floor(local - bar * bpb + 1e-6) * 2;
  cells.forEach((c, i) => c.classList.toggle('now', i === now));
}
/* The bar sticks under whatever already sticks to the top of the scroll box
   (.main on a laptop, the page on a phone): the In class page's sticky bar,
   and on a phone the fixed site header. A sticky `top` counts from the top
   of that box, so this measures the chrome's own sticky offset + height, not
   where it happens to sit right now. The card itself is overflow:clip, not
   hidden (styles.css), or nothing inside it could stick. */
function pcSheetStickyTop(root){
  let box = root.parentElement;
  while(box && box !== document.body){
    const oy = getComputedStyle(box).overflowY;
    if(oy === 'auto' || oy === 'scroll') break;
    box = box.parentElement;
  }
  const isDoc = !box || box === document.body;
  let top = 0;
  const hdr = document.querySelector('.header');
  if(isDoc && hdr && hdr.offsetHeight && /fixed|sticky/.test(getComputedStyle(hdr).position)) top = hdr.offsetHeight;
  const bar = document.querySelector('.ca-screen .page-topbar');
  if(bar && bar.offsetHeight && getComputedStyle(bar).position === 'sticky' && (isDoc || box.contains(bar)))
    top = Math.max(top, (parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight);
  root.style.setProperty('--pc-sheet-top', Math.round(top) + 'px');
}
function pcSheetStarted(st){
  pcSheetStickyTop(st.root);
  st.sheetLine = null; st.stripKey = null;
  const paper = st.root.querySelector('.pc-sheet-paper');
  const sh = paper && paper._sheet;
  const where = st.root.querySelector('.pc-sheet-where');
  if(where) where.textContent = pcSheetWhere(st.L, st.loopFrom, st.fromRep);
  if(!sh || !sh.ok) return;
  const first = sh.map.tok[st.loopFrom][st.fromRep][0];
  const line = pcSheetMark(paper, first, false);
  st.sheetLine = sh.model.toks[first].y0;
  pcFollow(line, true);
}
function pcSheetStopped(root){
  root.querySelectorAll('.pc-strip-cell.now').forEach(c => c.classList.remove('now'));
  root.querySelectorAll('.pc-sheet-dot.hit').forEach(d => d.classList.remove('hit'));
}
// A tap on a chord: the song from the start of that line's lap, after the count-in.
function pcSheetStartAt(btn, idx){
  const root = btn.closest('.pc');
  const paper = btn.closest('.pc-sheet-paper');
  const at = paper && paper._sheet && paper._sheet.map.start[idx];
  if(root && at) pcStart(root, at.si, at.rep);
}

/* The player. One card plays at a time, and it shares the site's
   one-sound-at-a-time rule: starting it calls stopAllDemoAudio() (it is
   "about to play" — see the two silencers in CLAUDE.md), and
   stopCardAudio(), playSequence() and renderClassActivities() all call
   pcStop(), exactly where they call snipStop(). */
let pcState = null;
function pcActivity(root){
  const id = root && root.dataset.id;
  /* The view, not the raw entry: in another key (keyVersions) the card
     plays that key's track. Same id, checks and timing either way. */
  return caView((window.CLASS_ACTIVITIES || []).find(x => x.id === id));
}
function pcWindow(L, slow){ return snippetWindow(L.tr, { fromBar: L.firstBar, bars: L.totalBars }, slow); }
function pcStatus(root, html){ const el = root.querySelector('.pc-status'); if(el) el.innerHTML = html || ''; }   // '' = :empty, see styles.css
function pcStop(){
  if(!pcState) return;
  const st = pcState;
  pcState = null;                      // first, so the frame loop's guard bails
  if(st.raf) cancelAnimationFrame(st.raf);
  st.timers.forEach(clearTimeout);
  // Every count-in click stops; an in-song click stops if its count is still to come (QUEUED CLICKS, app/snippets.js).
  const clickNow = (st.clicks || []).length ? getAudioCtx().currentTime : 0;
  (st.clicks || []).forEach(o => { if(o._due != null && !(o._due > clickNow)) return; try { o.stop(0); } catch(e) {} try { o.disconnect(); } catch(e) {} });
  try { st.audio.pause(); st.audio.src = ''; } catch(e) {}
  [st.spare, st.leaving].forEach(el => { if(el){ try { el.pause(); el.src = ''; } catch(e) {} } });
  st.spare = st.leaving = null;
  twinStop(st);
  const root = st.root;
  if(root && root.isConnected){
    const btn = root.querySelector('.pc-play');
    if(btn){ btn.innerHTML = pcPlayBtnHtml(false); btn.classList.remove('playing'); }
    root.querySelectorAll('.beat-now').forEach(el => el.classList.remove('beat-now'));
    root.querySelectorAll('.pc-rep').forEach(el => { el.hidden = true; el.textContent = ''; });
    pcSheetStopped(root);
    pcStatus(root, '');
  }
  pcSyncBarStop();
}
/* Stop in the sticky bar while a practice card's song plays (Jonathan,
   2026-09-30). pcFollow scrolls the card's own Play/Stop off the top of a
   Chromebook screen by the second line of tab, and the bar is the one thing
   that stays put. caSyncTopbar writes the button (hidden) for a card;
   pcStart and pcStop show and hide it. */
function pcSyncBarStop(){
  const b = document.querySelector('#ca-bar-open .ca-bar-stop');
  if(!b) return;
  const hide = !(pcState && pcState.root && pcState.root.isConnected && pcState.root.closest('.ca-card[open]'));
  if(b.hidden === hide) return;
  b.hidden = hide;
  // Stop takes ~90px of the bar while it shows (caFitBar).
  caFitBar();
  caPlaceToolPopups();
}
/* THE SPARE — a lap that comes round with no gap (Jonathan, 2026-10-07: "a
   slight delay when it starts to repeat"). The loop used to be one <audio>
   element seeking itself back to the start of the window, and a seek in a
   big MP3 is not instant: the element goes quiet while it finds and decodes
   the new spot, a beat-sized hole on a Chromebook, on every lap. So a card
   that loops keeps a SECOND element on the same file, paused and already
   sitting on the loop's first downbeat. Nothing has to seek at the lap.

   The handoff OVERLAPS, which one element cannot do. Even a paused, ready
   element takes 15-20 ms from play() to its first sound (measured, desktop
   Chrome), so starting it AT the end still leaves a hole that size. So
   pcFrame only SPOTS the end coming, PC_LAP_LEAD ahead, and sets two timers
   — a frame is 16 ms apart, too coarse to place a downbeat with:
     - the spare starts PC_SPARE_START before the end of the window, so its
       first sound lands on the end, and it becomes the playing element;
     - the one that was playing is paused at the end of the window (it
       cannot run on into the bar after), is sent back to the loop start in
       its own time, and is the spare for the next lap.
   Both constants are REAL seconds; pcFrame scales the file clock by the
   playback rate. `st.leaving` is the element on its way out, set from the
   moment the lap is spotted until it is parked.

   pcRetrack re-parks the spare after a speed or Guitar switch. If it is not
   ready when the lap ends (slow Wi-Fi, a file that failed, a switch in the
   last tenth of a second), pcFrame falls back to the old seek, so the worst
   case is what the card did before. A whole-song card never loops and never
   makes one. */
const PC_LAP_LEAD = 0.1, PC_SPARE_START = 0.02;
function pcLoopStart(st){ return snipTimeAtBars(st.win, st.L.sections[st.loopFrom].fromBar - st.L.firstBar); }
/* One of the card's <audio> elements failed. The two swap roles every lap,
   so both get this same handler: the PLAYING one stops the card and says
   so; the spare (or the one on its way out) is just dropped, since losing
   it is not losing the song — the lap falls back to a seek. */
function pcAudioError(st, el){
  if(pcState !== st) return;
  if(st.audio !== el){ if(st.spare === el) st.spare = null; if(st.leaving === el) st.leaving = null; if(st.twin === el) st.twin = null; return; }
  pcStop();
  if(typeof gateToast === 'function') gateToast(t('ca.snipLoadFailed'));
}
function pcSparePark(st){
  if(st.wholeSong || pcState !== st || st.leaving) return;   // mid-handoff: the timer parks it
  let sp = st.spare;
  if(!sp){
    sp = st.spare = new Audio();
    sp.preload = 'auto';
    sp.loop = false;
    // A spare that cannot load is just dropped: the lap falls back to a seek.
    // After a lap it is the playing element, and then an error stops the card.
    sp.addEventListener('error', () => pcAudioError(st, sp), { once: true });
  }
  slowestApplyRate(sp, pcRate(st.root));
  // Reads the window when it runs, not when it was queued — a speed switch
  // while the file is still loading must not park it on the old tier's clock.
  const seek = () => { if(pcState === st && st.spare === sp){ try { sp.currentTime = pcLoopStart(st); } catch(e) {} } };
  if(sp.src !== st.audio.src){
    sp.addEventListener('loadedmetadata', seek, { once: true });
    sp.src = st.audio.src;
    sp.load();
  } else if(sp.readyState >= 1) seek();
}
function pcSpareReady(st){
  const sp = st.spare;
  return !!(sp && sp.src === st.audio.src && sp.readyState >= 3 && !sp.seeking && Math.abs(sp.currentTime - pcLoopStart(st)) < 0.05);
}
function pcToggle(btn){
  const root = btn.closest('.pc');
  if(!root) return;
  if(pcState && pcState.root === root){ pcStop(); return; }
  pcStart(root, 0);
}
function pcFromSection(btn, si){
  const root = btn.closest('.pc');
  if(root) pcStart(root, si);
}
function pcStart(root, si, rep){
  if(window.coachMicLive) return;      // same guard as snipToggle: never play into a live mic
  if(typeof stopAllDemoAudio === 'function') stopAllDemoAudio();   // includes pcStop()
  const a = pcActivity(root);
  const L = a && pcLayout(a);
  if(!L || !L.sections[si]) return;
  const slow = root.dataset.slow === '1', guitar = root.dataset.guitar === '1';
  const audio = new Audio();
  audio.preload = 'auto';
  audio.loop = false;                  // the window is looped (or stopped) by hand, in pcFrame
  audio.src = snippetSrc(L.tr, slow, guitar);
  slowestApplyRate(audio, pcRate(root));
  /* `rep` (optional): start at that lap of the section — a tap on a chord on
     a lyric sheet (pcSheetStartAt). The loop, if any, still returns to the
     section's start. */
  const fromRep = Math.max(0, Math.min(L.sections[si].reps - 1, rep | 0));
  const st = { root, L, audio, win: pcWindow(L, slow), loopFrom: si, fromRep, wholeSong: !!a.card.wholeSong, sheet: !!a.card.sheet, raf: 0, timers: [], lastBeat: -1, counting: true, si: -1, seq: -1, rep: -1, beat: -1, key: '', row: null };
  pcState = st;
  const btn = root.querySelector('.pc-play');
  if(btn){ btn.innerHTML = pcPlayBtnHtml(true); btn.classList.add('playing'); }
  pcShowSection(root, L, si);
  pcSyncBarStop();
  if(st.sheet) pcSheetStarted(st);
  else pcFollow(root.querySelector('.pc-tab .pc-page:not([hidden]) .tab-grid'), true);
  // After a lap this element may be the spare (see THE SPARE).
  audio.addEventListener('error', () => pcAudioError(st, audio), { once: true });
  const begin = () => {
    if(pcState !== st) return;
    try { audio.currentTime = snipTimeAtBars(st.win, L.sections[si].fromBar + fromRep * L.sections[si].bars - L.firstBar); } catch(e) {}
    pcSparePark(st);                   // loads and parks during the count-in
    pcCountIn(st, si);
  };
  if(audio.readyState >= 1) begin();
  else audio.addEventListener('loadedmetadata', begin, { once: true });
}
function pcGo(st, si){
  st.counting = false;
  st.lastBeat = -1;
  pcStatus(st.root, escHtml(t('ca.cardPlayingFrom', {section: tf(st.L.sections[si].s, 'label')})));
  st.audio.play().catch(() => {});
  st.raf = requestAnimationFrame(pcFrame);
  // The other mix loads only once this one is playing, and only where
  // twinWanted (see THE TWIN).
  const el = st.audio;
  el.addEventListener('playing', () => { if(pcState === st) pcParkTwin(st); }, { once: true });
}
/* The twin is the OTHER mix of the tier now playing — see THE TWIN. */
function pcParkTwin(st){
  const root = st.root;
  if(!snippetHasFull(st.L.tr) || !twinWanted(root)) return;
  twinPark(st, snippetSrc(st.L.tr, root.dataset.slow === '1', root.dataset.guitar !== '1'), el => pcAudioError(st, el));
}
/* One bar of clicks (four in 4/4, six in 6/8 — CLICK IN SIX) before the song comes in, on
   every start — otherwise the student is dropped in with no way to find
   beat 1. The clicks run at the tempo of the bar the song comes in on (the
   first bar of the section, or of the lap tapped on a lyric sheet), on the
   file and speed being played, so the song's first beat lands one click
   after the last. Not the window's average bar (st.win.bar), which on a
   live-band beat map can be several per cent off that bar (2026-11-12).
   chcBeatSec (app/drills-call.js) is the arithmetic Call the chord's own
   count-in already uses for its first bar. */
function pcCountIn(st, si){
  const ctx = getAudioCtx();
  try { ctx.resume(); } catch(e) {}
  const n = st.L.tr.beatsPerBar * clickSub(st.L.tr);   // six on a 6/8 track — see CLICK IN SIX
  const S = st.L.sections[si];
  const bar = S.fromBar + (st.fromRep || 0) * S.bars - st.L.firstBar;   // the bar pcStart seeks to, in the window
  const beat = chcBeatSec(st.win, n, bar) / pcRate(st.root);   // real seconds, not file seconds
  const t0 = ctx.currentTime + 0.1;
  /* All four clicks are scheduled on the AudioContext up front, so clearing
     the timers does not silence them: pcStop stops these nodes too, or a Stop,
     a section tap or a speed switch mid count-in leaves the rest still
     clicking (over the next count-in, at the old tempo). */
  st.clicks = [];
  for(let k = 0; k < n; k++){
    st.clicks.push(pcClick(t0 + k * beat, clickAccent(st.L.tr, k), true));
    st.timers.push(setTimeout(() => { if(pcState === st) pcStatus(st.root, escHtml(t('ca.cardCountIn', {n: k + 1}))); }, (0.1 + k * beat) * 1000));
  }
  st.timers.push(setTimeout(() => { if(pcState === st) pcGo(st, si); }, (0.1 + n * beat) * 1000));
}
// +5 dB (10^(5/20), 2026-10-30) on the in-song click of the play-along cards:
// practice cards (pcScheduleClick) and snippet cards (snipScheduleClick), and
// the Song Journey page's own copy in tabs/journey.js. Those call sites pass
// it as pcClick's `gain`. Not the 4-click count-in, and not Note Calls
// (ncClicks), which share pcClick and keep their old level.
const PLAYALONG_CLICK_GAIN = Math.pow(10, 5 / 20);
/* CLICK IN SIX (Jonathan, 2026-11-10: "it should click one through 6 ... one
   and 4 can have a different sounding click"). On a countSix track the
   click, and the count-in, sound every eighth, six to a bar; the big beats,
   1 and 4, take the accented click. Any other track: one click a beat,
   beat 1 accented. clickSub = clicks per counted beat. */
function clickSub(tr){ return tr && tr.countSix ? 3 : 1; }
function clickAccent(tr, nb){
  const sub = clickSub(tr);
  return sub === 3 ? nb % sub === 0 : nb % tr.beatsPerBar === 0;
}
function pcClick(at, accent, countIn, gain){
  const ctx = getAudioCtx();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = accent ? 1500 : 1000;
  // Quiet on purpose (Jonathan, 2026-09-27: the first cut was "very loud").
  // The count-in is a little louder (2026-09-29) — it plays over silence
  // and has to be caught first time.
  // A track's clickGain lifts its in-song click where the mix buries it.
  const peak = (accent ? 0.2 : 0.13) * (countIn ? 1.6 : 1) * (gain || 1);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.08);
  o.connect(g); g.connect(ctx.destination);
  o.start(at); o.stop(at + 0.1);
  return o;
}
/* The next counted beat, scheduled once it is under 100 ms away. `lastBeat`
   is reset on a loop or a track switch, so a jump back never skips beats. */
function pcScheduleClick(st, now){
  const bpb = st.L.tr.beatsPerBar * clickSub(st.L.tr);   // clicks a bar — see CLICK IN SIX
  const beatPos = snipBarsAt(st.win, now) * bpb;
  const nb = Math.ceil(beatPos - 1e-6);
  if(nb < st.lastBeat) st.lastBeat = nb - 1;
  if(nb <= st.lastBeat || nb < 0 || nb >= st.L.totalBars * bpb) return;
  const ahead = (snipTimeAtBars(st.win, nb / bpb) - now) / pcRate(st.root);   // real seconds
  if(ahead > 0.1) return;
  const ctx = getAudioCtx();
  const lat = snipLatency() - (ctx.outputLatency || ctx.baseLatency || 0);
  const at = ctx.currentTime + Math.max(0, ahead + lat);
  // Kept until it has sounded, so a switch or Stop can take it back — see QUEUED CLICKS (app/snippets.js).
  queueClick(st, pcClick(at, clickAccent(st.L.tr, nb), false, (st.L.tr.clickGain || 1) * PLAYALONG_CLICK_GAIN), at, ctx.currentTime + Math.max(0, ahead));
  st.lastBeat = nb;
}
function pcFrame(){
  const st = pcState;
  if(!st) return;
  if(!st.root.isConnected){ pcStop(); return; }   // a re-render pulled the card out
  const { L } = st;
  let audio = st.audio;
  const now = audio.currentTime;
  const left = (st.win.end - now) / (audio.playbackRate || 1);   // real seconds to the end of the window
  if(left <= PC_LAP_LEAD && !st.leaving && !audio.ended && pcSpareReady(st)){
    // The lap, with no seek and no hole — see THE SPARE.
    const sp = st.spare, old = audio;
    st.leaving = old;
    // The two handoff timers' ids, so pcRetrack can cancel exactly these.
    const hand = st.handoff = [];
    hand.push(setTimeout(() => {
      if(pcState !== st || st.leaving !== old) return;
      if(st.audio !== old || !pcSpareReady(st)){ st.leaving = null; return; }   // switched under us: seek instead
      slowestApplyRate(sp, pcRate(st.root));   // a speed tap in the last tenth of a second skipped pcSparePark
      sp.play().catch(() => {});
      st.audio = sp; st.spare = null;
      st.lastBeat = -1;
    }, Math.max(0, (left - PC_SPARE_START) * 1000)));
    hand.push(setTimeout(() => {
      if(pcState !== st || st.leaving !== old) return;
      st.leaving = null; st.handoff = null;
      if(st.audio === old) return;       // the spare never started; pcFrame seeks
      try { old.pause(); } catch(e) {}
      st.spare = old;
      pcSparePark(st);
      if(st.audio.paused) st.audio.play().catch(() => {});
    }, Math.max(0, left * 1000 - 4)));
    st.timers.push(...hand);           // pcStop still clears them with the rest
  } else if(!st.leaving && (now >= st.win.end - 0.02 || audio.ended)){
    // A whole-song card stops at the end of the song (Jonathan, 2026-10-02:
    // it used to loop back to where it started). A card that is a few bars
    // of the song (ca-10's twelve laps of the riff, ca-20's four-bar loop)
    // still loops.
    if(st.wholeSong){
      const root = st.root;
      pcStop();
      pcStatus(root, escHtml(t('ca.cardSongEnd')));
      return;
    }
    // The spare was not ready (or this card has none yet): the old seek.
    try { audio.currentTime = pcLoopStart(st); } catch(e) {}
    if(audio.paused) audio.play().catch(() => {});
    pcSparePark(st);                   // try to be ready for the next lap
    st.lastBeat = -1;
  }
  if(st.root.dataset.metro === '1') pcScheduleClick(st, audio.currentTime);
  twinFollow(st, st.audio);
  /* The tab lights a note PC_TAB_LEAD ahead of the decoder; a lyric sheet's
     dot runs PC_SHEET_LEAD ahead, so the chord is on screen as the student
     plays it (Jonathan tuned it by ear, 2026-10-19). */
  const shift = st.sheet ? PC_SHEET_LEAD : PC_TAB_LEAD;
  const barsIn = snipBarsAt(st.win, audio.currentTime + shift * pcRate(st.root));
  let loc = pcLocate(L, barsIn);
  if(!st.sheet && loc){
    // A note (a beat, on a chord grid) on another row lights PC_ROW_LEAD early — see PC_ROW_LEAD.
    const ahead = pcLocate(L, snipBarsAt(st.win, audio.currentTime + (shift + PC_ROW_LEAD) * pcRate(st.root)));
    if(ahead && pcLocKey(L, ahead) !== pcLocKey(L, loc)
       && pcLocRow(st.root, L, ahead) !== pcLocRow(st.root, L, loc)) loc = ahead;
  }
  /* A chord grid repaints on a new BEAT, not a new note; a lyric sheet
     repaints on either (its dot fills on every beat, its chord mark moves on
     every chord change). */
  if(loc && (pcLocKey(L, loc) !== st.key || (st.sheet && loc.beat !== st.beat))) pcPaint(st, loc);
  if(st.sheet) pcSheetStrip(st, loc, barsIn);
  st.raf = requestAnimationFrame(pcFrame);
}
/* What a repaint is keyed on: the beat on a chord-grid section, the note
   everywhere else. Never the note on a grid — it moves on a "+". */
function pcLocKey(L, loc){
  return loc.si + ':' + loc.rep + ':' + (L.sections[loc.si].grid ? 'b' + loc.beat : 's' + loc.seq);
}
// The tab row the cursor is on for `loc` (a grid's beat is only unique within its page).
function pcLocRow(root, L, loc){
  const cell = L.sections[loc.si].grid
    ? root.querySelector(`.pc-tab .pc-page[data-page="${loc.si}"] [data-beat="${loc.beat}"]`)
    : root.querySelector(`.pc-tab [data-seq="${loc.seq}"]`);
  return cell && cell.closest('.tab-grid');
}
function pcPaint(st, loc){
  const root = st.root;
  const key = pcLocKey(st.L, loc);
  if(st.sheet){
    // The dot fills on a new beat; a chord change on a "+" moves the mark but does not fill it.
    const flash = loc.beat !== st.beat || loc.rep !== st.rep || loc.si !== st.si;
    pcSheetPaint(st, loc, flash);
    st.si = loc.si; st.seq = loc.seq; st.rep = loc.rep; st.beat = loc.beat; st.key = key;
    return;
  }
  const S = st.L.sections[loc.si];
  root.querySelectorAll('.pc-tab .beat-now').forEach(el => el.classList.remove('beat-now'));
  const sel = S.grid ? `.pc-page[data-page="${loc.si}"] [data-beat="${loc.beat}"]` : `[data-seq="${loc.seq}"]`;
  root.querySelectorAll(`.pc-tab ${sel}`).forEach(el => el.classList.add('beat-now'));
  if(loc.si !== st.si) pcShowSection(root, st.L, loc.si);
  const cell = root.querySelector(`.pc-tab .pc-page:not([hidden]) ${S.grid ? `[data-beat="${loc.beat}"]` : `[data-seq="${loc.seq}"]`}`);
  const row = cell && cell.closest('.tab-grid');
  if(row && row !== st.row){ st.row = row; pcFollow(row, false); }
  const rep = root.querySelector(`.pc-page[data-page="${loc.si}"] .pc-rep`);
  if(rep && S.reps > 1){
    rep.hidden = false;
    rep.textContent = t('ca.cardRepOf', {what: tf(S.s, 'repLabel'), n: loc.rep + 1, total: S.reps});
  }
  st.si = loc.si; st.seq = loc.seq; st.rep = loc.rep; st.beat = loc.beat; st.key = key;
}
/* Keep the line being played on screen (Jonathan, 2026-09-30: a long
   section runs off the bottom of a Chromebook, and the student's hands are
   on the guitar, not the trackpad). Each time the cursor moves to a new tab
   row, scroll just far enough that this row AND the one after it are both
   in view — never further than putting this row right under the sticky
   bar, so Play/Stop above the tab stays on screen as long as it can. A
   student who scrolled the whole tab out of view (to the checks, say) is
   left there; Play itself (`force`) always brings the tab back. Scrolls
   whatever is actually scrolling — .main on a laptop, the page on a phone. */
function pcFollow(row, force){
  if(!row) return;
  let box = row.parentElement;
  while(box && box !== document.body){
    const oy = getComputedStyle(box).overflowY;
    if((oy === 'auto' || oy === 'scroll') && box.scrollHeight > box.clientHeight) break;
    box = box.parentElement;
  }
  if(!box || box === document.body) box = document.scrollingElement || document.documentElement;
  const isDoc = box === document.scrollingElement || box === document.documentElement;
  let top = isDoc ? 0 : box.getBoundingClientRect().top;
  const bottom = isDoc ? window.innerHeight : box.getBoundingClientRect().bottom;
  // Whatever sticks over the top of the scrollport: the site header on a
  // phone, the In class page's sticky bar everywhere.
  ['.header', '.ca-screen .page-topbar'].forEach(sel => {
    const el = document.querySelector(sel);
    if(!el || !el.offsetHeight) return;
    const pos = getComputedStyle(el).position;
    if(pos !== 'sticky' && pos !== 'fixed') return;
    const r = el.getBoundingClientRect();
    if(r.top <= top + 1 && r.bottom > top) top = r.bottom;
  });
  // A lyric sheet's own sticky bar (the "This bar" strip) sits under those.
  const sbar = row.closest('.pc-sheet') && row.closest('.pc-sheet').querySelector('.pc-sheet-bar');
  if(sbar && sbar.offsetHeight){
    const r = sbar.getBoundingClientRect();
    if(r.top <= top + 1 && r.bottom > top) top = r.bottom;
  }
  const tab = row.closest('.pc-tab');
  if(!force && tab){
    const tr = tab.getBoundingClientRect();
    if(tr.bottom < top || tr.top > bottom) return;
  }
  // The next row, past a lyric line (`rowLabels`, ca-35) sitting between them.
  let next = row.nextElementSibling;
  if(next && next.classList.contains('pc-row-label')) next = next.nextElementSibling;
  if(next && !next.classList.contains('tab-grid')) next = null;
  // Keep a row's lyric line (just above it) in view along with the row.
  const lab = row.previousElementSibling && row.previousElementSibling.classList.contains('pc-row-label') ? row.previousElementSibling : null;
  const rr = (lab || row).getBoundingClientRect();
  const need = (next || row).getBoundingClientRect().bottom;
  const pad = 12;
  let delta = 0;
  if(need > bottom - pad) delta = need - (bottom - pad);              // reveal the next row
  delta = Math.min(delta, rr.top - (top + pad));                     // …but keep this one below the bar
  if(rr.top < top + pad) delta = rr.top - (top + pad);               // this row is hidden above: bring it down
  if(Math.abs(delta) < 2) return;
  box.scrollBy({ top: delta, behavior: scrollBehavior() });
}
function pcShowSection(root, L, si){
  root.querySelectorAll('.pc-page').forEach(p => { p.hidden = Number(p.dataset.page) !== si; });
  root.querySelectorAll('.pc-sec').forEach(b => b.classList.toggle('cur', Number(b.dataset.sec) === si));
  const pager = root.querySelector('.pc-pager');
  if(!pager) return;
  const label = pager.querySelector('.tab-pager-label');
  if(label) label.textContent = t('ca.cardSectionOf', {a: si + 1, n: L.sections.length});
  const btns = pager.querySelectorAll('.tab-pager-btn');
  if(btns[0]) btns[0].disabled = si === 0;
  if(btns[1]) btns[1].disabled = si === L.sections.length - 1;
}
// Previous / Next while stopped; while the song plays the song turns the pages.
function pcPage(btn, dir){
  const root = btn.closest('.pc');
  if(!root || (pcState && pcState.root === root)) return;
  const a = pcActivity(root);
  const L = a && pcLayout(a);
  if(!L) return;
  const cur = Array.from(root.querySelectorAll('.pc-page')).findIndex(p => !p.hidden);
  pcShowSection(root, L, Math.max(0, Math.min(L.sections.length - 1, cur + dir)));
}
function pcSetMetro(btn){
  const root = btn.closest('.pc');
  if(!root) return;
  const on = root.dataset.metro !== '1';
  root.dataset.metro = on ? '1' : '';
  btn.classList.toggle('on', on);
  btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  if(on){ try { getAudioCtx().resume(); } catch(e) {} }
  // No file swap — the click is ours. A click already queued is taken back (QUEUED CLICKS).
  if(pcState && pcState.root === root){ cancelQueuedClicks(pcState); pcState.lastBeat = -1; }
}
function pcSetSpeed(sw){
  const root = sw.closest('.pc');
  if(!root) return;
  const slow = root.dataset.slow !== '1';
  root.dataset.slow = slow ? '1' : '';
  sw.setAttribute('aria-checked', slow ? 'false' : 'true');   // checked = Normal
  const labs = sw.querySelectorAll('.pc-speed-lab');
  if(labs[0]) labs[0].classList.toggle('on', slow);
  if(labs[1]) labs[1].classList.toggle('on', !slow);
  pcRetrack(root);
}
// The four-stop slider (a card with `slowest: true`): Slowest and Slower
// both set data-slow, so every slow-file reader above is unchanged; Slow and
// Normal play the fast file, and the stop's data-rate becomes the card's.
// While dragging, `input` only repaints; `change` (release, a tap, an arrow
// key) applies, so a drag across the rail swaps the file once, not per stop.
function pcSpeedShow(range){
  const wrap = range.closest('.pc-speed4');
  const ticks = wrap.querySelectorAll('.pc-speed-tick');
  const i = ticks[+range.value] ? +range.value : 1, tick = ticks[i];
  ticks.forEach(tk => tk.classList.toggle('on', tk === tick));
  wrap.querySelectorAll('.pc-speed-x').forEach((x, j) => x.classList.toggle('on', j === i));
  range.setAttribute('aria-valuetext', tick.dataset.label);
  return tick;
}
function pcSetSpeedTo(range){
  const root = range.closest('.pc');
  if(!root) return;
  const tick = pcSpeedShow(range);
  const speed = tick.dataset.speed, rate = tick.dataset.rate || '1';
  const slow = (speed === 'slowest' || speed === 'slower') ? '1' : '';
  if(root.dataset.slow === slow && pcRate(root) === parseFloat(rate)) return;
  root.dataset.slow = slow;
  root.dataset.rate = rate;
  pcRetrack(root);
}
function pcSetGuitar(btn){
  const root = btn.closest('.pc');
  if(!root) return;
  const on = root.dataset.guitar !== '1';
  root.dataset.guitar = on ? '1' : '';
  root.dataset.twin = '1';             // from now on this card keeps the twin — see twinWanted
  btn.setAttribute('aria-checked', on ? 'true' : 'false');
  const labs = btn.querySelectorAll('.pc-speed-lab');
  if(labs[0]) labs[0].classList.toggle('on', !on);
  if(labs[1]) labs[1].classList.toggle('on', on);
  pcRetrack(root);
}
/* The Counts switch's remembered choice — per browser, a convenience only:
   storage can throw or come back empty, and then the switch starts off. */
const PC_COUNTS_KEY = 'pcCounts';
function pcCountsPref(){ try { return localStorage.getItem(PC_COUNTS_KEY) === '1'; } catch(e){ return false; } }
function pcSetCounts(btn){
  const tab = btn.closest('.pc-tab');
  if(!tab) return;
  const on = !tab.classList.contains('counts-on');
  tab.classList.toggle('counts-on', on);
  btn.setAttribute('aria-checked', on ? 'true' : 'false');
  try { localStorage.setItem(PC_COUNTS_KEY, on ? '1' : '0'); } catch(e){}
}
/* A speed or Guitar switch inside the last PC_LAP_LEAD of a lap lands after
   pcFrame armed the two handoff timers at the OLD rate, so the spare would
   start ~25 ms early and overlap the end of the window. Cancel the handoff
   instead and let pcFrame take the lap again from scratch — re-armed at the
   new rate if the spare is ready in time, otherwise the plain seek, which
   THE SPARE already names as the acceptable worst case. If the spare has
   already started (the first timer fired), the outgoing element is paused
   here and becomes the spare, the second timer's job, since nothing else
   would stop it running on into the bar after the window. */
function pcCancelHandoff(st){
  if(!st.leaving) return;
  const old = st.leaving, hand = st.handoff || [];
  hand.forEach(clearTimeout);
  st.timers = st.timers.filter(id => hand.indexOf(id) < 0);
  st.leaving = null; st.handoff = null;
  if(st.audio !== old){
    try { old.pause(); } catch(e) {}
    st.spare = old;                    // pcRetrack's pcSparePark re-parks it
  }
}
/* Switch files mid-song at the same MUSICAL position — bars into the
   window, not seconds, because the two tiers run on different clocks (the
   same rule snipSetTier follows). Mid count-in, the count restarts at the
   new tempo. */
function pcRetrack(root){
  const st = pcState;
  if(!st || st.root !== root) return;
  if(st.counting){ pcStart(root, st.loopFrom, st.fromRep); return; }
  pcCancelHandoff(st);
  const slow = root.dataset.slow === '1', guitar = root.dataset.guitar === '1';
  // A switch still waiting for its file keeps the place it saved — see snipSetTier.
  const pend = st.pending;
  const barsIn = pend ? pend.bars : snipBarsAt(st.win, st.audio.currentTime);
  st.win = pcWindow(st.L, slow);
  // The count is queued again on the new clock: take back the one already queued (QUEUED CLICKS).
  cancelQueuedClicks(st);
  st.lastBeat = -1;
  const at = snipTimeAtBars(st.win, isFinite(barsIn) && barsIn > 0 ? barsIn : 0);
  const src = snippetSrc(st.L.tr, slow, guitar);
  slowestApplyRate(st.audio, pcRate(root));   // Slowest <-> Slower and Slow <-> Normal are the same file, just the rate
  if(st.audio.src.endsWith(src)){
    // Same file, same window: only the rate moved — no seek (see snipSetTier).
    if(!pend && Math.abs(st.audio.currentTime - at) > SAME_FILE_SEEK_SEC){ try { st.audio.currentTime = at; } catch(e) {} }
    pcSparePark(st);
    return;
  }
  /* Guitar flipped and the twin is already playing the other mix in step:
     swap which one is heard. No load, no seek — see THE TWIN. The spare is
     still on the old mix, so it is re-parked on the new one as usual. */
  if(twinReady(st, st.audio, src)){
    st.audio = twinSwap(st, st.audio);
    pcParkTwin(st);
    pcSparePark(st);
    return;
  }
  const p = st.pending = { bars: isFinite(barsIn) && barsIn > 0 ? barsIn : 0, play: pend ? pend.play : !st.audio.paused };
  // A new file that fails to load must stop the card and say so. Both
  // elements already carry pcAudioError (pcStart / pcSparePark); this adds
  // it again so a retrack never depends on which element is playing now.
  const el = st.audio;
  el.addEventListener('error', () => pcAudioError(st, el), { once: true });
  // Only the latest switch's handler acts (all fire on the same event).
  el.addEventListener('loadedmetadata', () => {
    if(pcState !== st || st.pending !== p) return;
    st.pending = null;
    try { el.currentTime = snipTimeAtBars(st.win, p.bars); } catch(e) {}
    if(p.play) el.play().catch(() => {});
  }, { once: true });
  st.audio.src = src;
  st.audio.load();
  pcSparePark(st);                     // the spare follows the file
  // ...and so does the twin, once the new file is playing.
  el.addEventListener('playing', () => { if(pcState === st && st.audio === el) pcParkTwin(st); }, { once: true });
}
function pcToggleHelp(btn){
  const box = btn.nextElementSibling;
  if(!box) return;
  const open = box.hidden;
  box.hidden = !open;
  btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  const arrow = btn.querySelector('.pc-help-arrow');
  if(arrow) arrow.innerHTML = open ? '&#x25BE;' : '&#x25B8;';
}
/* ══ KEYS — the practice-card player from the keyboard (2026-11-13) ══════
   A student holding a guitar can start and stop with a thumb on the space
   bar instead of aiming the trackpad. Every key presses a control the card
   already has, by calling the SAME function that control's onclick /
   onchange calls; nothing here plays, seeks or times anything itself:
     Space or K   the Play / Stop button        pcToggle(play button)
     ← / →        stopped: the Previous / Next pager   pcPage(btn, ∓1)
                  playing: the previous / next section chip   pcFromSection(chip, si)
     < or ,       one speed stop slower         pcSetSpeedTo(range) / pcSetSpeed(switch)
     > or .       one speed stop faster         (same, within the control's own ends)
   A card with one section has no pager and no chips, so the arrows do
   nothing there; a lyric-sheet card has chips but no pager, so its arrows
   work only while it plays.
   WHICH card answers: the one playing (pcState); else the one last touched
   or focused (pcKeyLast, written by pcKeyNote); else, if exactly one card
   is on screen AND part of its player is inside the window, that one; else
   none, and Space scrolls the page as always. "On screen" = in the page,
   laid out (no [hidden] or closed <details> above it), not inert (an open
   dialog marks #app inert) and not the console's preview.
   NOTHING happens while the student is typing (a field, a select, a slider,
   contenteditable) or is on an <audio> / <video> player, with Ctrl / Cmd /
   Alt held, on a held-down repeat, when another handler already took the
   key, in the teacher console, while the nav drawer, a dialog (the games,
   the live quiz, the gates, Report a problem), the search panel, a tool
   popup (metronome, timer, tuner, recorder), the video viewer or the live
   quiz's join banner is open, while a "Turn on the microphone" panel is on
   screen, a mic listens (coachMicLive) or a Call-the-chord round owns the
   space bar (chcLive). Space on a focused button, link or <summary> keeps
   its own meaning (it presses THAT control), so a Play button reached with
   Tab is never toggled twice.
   A MOUSE OR TOUCH press on a card control leaves Chrome's focus on it, and
   then Space would press that control again (a section chip restarts with a
   new count-in) and every key would stay in the speed slider. So once a
   pointer press inside a card is over (its click and change have run),
   pcKeyPointerUp lets the focus go, and the keys reach the player as the
   Play tooltip says. A control reached with Tab is never touched (no
   pointer), and a field that is typed in keeps its focus.
   A key that acts cancels its default, so Space never scrolls the page
   then. The listeners are registered once, in app/start.js, for the page's
   life, like the site's other document keys; they hold no audio or element
   of their own (pcKeyLast is checked for isConnected before use; the
   pointer's one-turn timer reads the focus and ends). */
let pcKeyLast = null, pcKeyPressRoot = null;
function pcKeyNote(e){
  const tg = e && e.target;
  const r = tg && tg.closest ? tg.closest('.pc') : null;
  if(r) pcKeyLast = r;
  // The card a pointer press started in (null outside every card): pcKeyPointerUp reads it, wherever the press ends.
  if(e && e.type === 'pointerdown') pcKeyPressRoot = r && r.dataset.preview !== '1' ? r : null;
}
function pcKeyPointerUp(){
  const r = pcKeyPressRoot;
  pcKeyPressRoot = null;
  if(!r || (typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE)) return;
  setTimeout(() => {
    const a = document.activeElement;
    if(!a || a === document.body || !r.contains(a) || typeof a.blur !== 'function') return;
    if(a.matches('textarea, select, [contenteditable]:not([contenteditable="false"])') || a.isContentEditable) return;
    if(a.tagName === 'INPUT' && !/^(range|button|checkbox|radio|submit|reset)$/i.test(a.getAttribute('type') || 'text')) return;
    a.blur();
  }, 0);
}
function pcKeyLive(root){
  return !!(root && root.isConnected && root.dataset && root.dataset.preview !== '1'
    && root.getClientRects().length && !root.closest('[inert], [hidden], details:not([open])'));
}
function pcKeyInView(root){
  const p = root.querySelector('.pc-player') || root;
  const r = p.getBoundingClientRect();
  const vh = window.innerHeight || document.documentElement.clientHeight || 0;
  const vw = window.innerWidth || document.documentElement.clientWidth || 0;
  return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh && r.right > 0 && r.left < vw;
}
function pcKeyRoot(){
  if(pcState && pcKeyLive(pcState.root)) return pcState.root;
  if(pcKeyLive(pcKeyLast)) return pcKeyLast;
  const live = Array.from(document.querySelectorAll('.pc')).filter(pcKeyLive);
  return live.length === 1 && pcKeyInView(live[0]) ? live[0] : null;
}
function pcKeyBlocked(){
  const b = document.body;
  if(b && b.classList.contains('rail-open')) return true;
  if(window.coachMicLive) return true;
  if(typeof chcLive !== 'undefined' && chcLive) return true;
  if(document.querySelector('.tool-popup.open, #search-panel:not([hidden]), #video-overlay:not([hidden]), #lq-banner')) return true;
  if(Array.from(document.querySelectorAll('.micrec-ask')).some(m => m.getClientRects().length)) return true;
  return Array.from(document.querySelectorAll('[aria-modal="true"]')).some(m => !m.closest('[hidden]') && m.getClientRects().length);
}
const PC_KEYS = { ' ': 'play', 'Spacebar': 'play', 'k': 'play', 'K': 'play', 'ArrowLeft': 'prev', 'ArrowRight': 'next', '<': 'slower', ',': 'slower', '>': 'faster', '.': 'faster' };
function pcKeydown(e){
  const act = Object.prototype.hasOwnProperty.call(PC_KEYS, e.key) ? PC_KEYS[e.key] : null;
  if(!act || e.defaultPrevented || e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
  if(typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE) return;
  const tg = e.target && e.target.closest ? e.target : null;
  if(tg && (tg.closest('input, textarea, select, audio, video, [contenteditable]:not([contenteditable="false"])') || tg.isContentEditable)) return;
  // Arrows inside a widget that uses them itself (the tool popups' radio groups, a tab strip).
  if(tg && (act === 'prev' || act === 'next') && tg.closest('[role="radiogroup"], [role="tablist"], [role="listbox"], [role="menu"], [role="slider"]')) return;
  if(act === 'play' && e.key !== 'k' && e.key !== 'K' && tg && tg.closest('button, a[href], summary, [role="button"], [role="switch"], [role="checkbox"], [role="radio"], [role="tab"], [role="menuitem"], [role="option"]')) return;
  if(pcKeyBlocked()) return;
  const root = pcKeyRoot();
  if(!root) return;
  const playing = !!(pcState && pcState.root === root);
  let done = false;
  if(act === 'play'){
    const btn = root.querySelector('.pc-play');
    if(btn){ pcToggle(btn); done = true; }
  } else if(act === 'prev' || act === 'next'){
    const dir = act === 'next' ? 1 : -1;
    if(playing){
      const cur = pcState.si >= 0 ? pcState.si : pcState.loopFrom;
      const chip = root.querySelector(`.pc-sec[data-sec="${cur + dir}"]`);
      if(chip){ pcFromSection(chip, cur + dir); done = true; }
    } else {
      const btn = root.querySelectorAll('.pc-pager .tab-pager-btn')[dir < 0 ? 0 : 1];
      if(btn && !btn.disabled){ pcPage(btn, dir); done = true; }
    }
  } else {
    const dir = act === 'faster' ? 1 : -1;
    const range = root.querySelector('.pc-speed-range');
    const sw = range ? null : root.querySelector('.pc-player .pc-speed:not(.pc-guitar)');
    if(range){
      const v = Number(range.value) + dir;
      if(v >= Number(range.min) && v <= Number(range.max)){ range.value = String(v); pcSetSpeedTo(range); done = true; }
    } else if(sw && (root.dataset.slow === '1') === (dir > 0)){
      pcSetSpeed(sw); done = true;
    }
  }
  if(!done) return;
  pcKeyLast = root;
  e.preventDefault();
}
/* The 🖨 button. It rides in the open card's bar only (caSyncTopbar) since
   2026-10-31 — Jonathan: the collapsed rows (plain card and Today hero) each
   had one, a column of printer icons down the list. Open the card, then
   print. Exit checks carry none on purpose (see caCheckCardHtml). */
function caPrintBtnHtml(a){
  return `<button type="button" class="ca-print-btn" onclick="printActivity(event,'${escAttr(a.id)}')" title="${escAttr(t('ca.printTitle'))}" aria-label="${escAttr(t('ca.print'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></svg></button>`;
}
function caActivityCardHtml(a, chipIso){
  if(a.kind === 'check') return caCheckCardHtml(a, chipIso);
  a = caView(a);   // power-chord version when the switch says so — see caView
  const done = classActivities[a.id] === true;
  const open = caOpenId === a.id;
  // Focus view always has exactly one step open (caFocusIdx); the accordion
  // can have none (-1).
  const focus = caIsFocus(a);
  const card = caIsCard(a);   // practice card — see caCardBodyHtml
  const titleHtml = caNumHtml(caNumber(a)) + escHtml(caTitle(a));
  /* Quieter edge for every card that shows the "Optional" tag and the
     student hasn't done (2026-10-31; widened 2026-11-01), so the required
     ones stand out: a teacher flag, an optional-in-its-data card, or one
     given from the board's "Who" picker all look the same. Not for a CAS
     student: every card is optional for them, and fading the whole list
     would make nothing stand out. */
  const quiet = caQuietOptional(a, done);
  // Undated activities only reach a screen under dev bypass (caIsVisible
  // gates students on the date) — but an empty chip renders as a stray amber
  // dash, on the printed handout as much as on screen, so skip it entirely.
  // A card open under the Keep practicing row only (caIsPinOnly) shows none
  // either — its own date can still be in the future.
  // `chipIso` (a string) replaces the card's own date: a finished card in
  // Today's activities passes its slot's chip, '' when the heading says it.
  const dateLabel = caIsPinOnly(a) ? '' : caFormatDate(typeof chipIso === 'string' ? chipIso : caDate(a));
  return `<details class="ca-card${focus ? ' ca-card--focus' : ''}${card ? ' ca-card--practice' : ''}${quiet ? ' ca-card--optional' : ''}" ${open ? 'open' : ''} data-id="${escAttr(a.id)}" ontoggle="caOnToggle(this)">
    <summary class="ca-card-summary" onclick="caCardMarkOpening(this)">
      ${dateLabel ? `<span class="ca-chip">${escHtml(dateLabel)}</span>` : ''}
      <span class="ca-card-titlewrap"><span class="ca-card-title" role="heading" aria-level="3">${titleHtml}</span>${caChunkMetaHtml(a)}</span>
      ${done ? `<span class="ca-done-mark" aria-hidden="true">${TCK_CHECK_SVG_INLINE}</span>` : ''}
    </summary>
    ${caCardBodyBlockHtml(a, done, focus, card)}
  </details>`;
}
