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
   within the pass, not the big beat). The click sounds on all six too, every
   click the same (see CLICK IN SIX). sub = columns per beat. */
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
  return { tr, sections, firstBar, totalBars: last.fromBar + last.bars * last.reps - firstBar, rounds: pcRoundsOf(c, sections.length) };
}
/* ROUNDS (Jonathan, 2026-11-24, ca-54 "Sweet Child O' Mine — Speed Ladder"). A card with `card.rounds` shows round
   buttons where the section chips sit. A round is { label, what, from, to, startStop }: the sections from..to
   (indexes; one lap is all of them in order) played with Loop and Build up speed on, beginning at stop `startStop`
   of the speed control (0 = the bottom stop). With `card.buildLaps` 1 the climb moves up after ONE time through
   a stop (Build's usual is PC_BUILD_LAPS, app/cards-loop.js). Nothing is stored. A card without `rounds` is
   unchanged. pcRoundsOf returns the validated list, or null (the card then draws its section chips). */
function pcRoundsOf(c, n){
  const rs = c && c.rounds;
  if(!Array.isArray(rs) || !rs.length) return null;
  const ok = rs.every(r => r && Number.isInteger(r.from) && Number.isInteger(r.to) && r.from >= 0 && r.to >= r.from && r.to < n && (r.startStop === undefined || (Number.isInteger(r.startStop) && r.startStop >= 0 && r.startStop <= 3)));
  return ok ? rs : null;
}
/* A card with ONE round (ca-54 since 2026-11-24 "just build speed through verse and chorus") has no round or section
   buttons and no hint: Play starts its round (pcToggle), and the song stops after each stop for the "Got it / Practice
   again" prompt (pcLadderAsk, app/cards-loop.js). */
function pcOneRound(L){ return !!(L && L.rounds && L.rounds.length === 1); }
// The round tapped last (root.dataset.round), or null.
function pcRoundNow(a, root){
  const n = a && a.card && a.card.sections ? a.card.sections.length : 0;
  const rs = pcRoundsOf(a && a.card, n);
  return rs && root ? rs[parseInt(root.dataset.round, 10)] || null : null;
}
// The round tapped last, when section `si` is inside it; else null (a plain loop of that section).
function pcRoundIn(a, root, si){
  const rd = pcRoundNow(a, root);
  return rd && si >= rd.from && si <= rd.to ? rd : null;
}
// The buttons of the .pc-secs row: one per section, or one per round.
function pcSecButtonsHtml(L, preview){
  if(L.rounds) return L.rounds.map((rd, ri) => `<button type="button" class="pc-sec pc-round" data-round="${ri}" onclick="pcFromRound(this,${ri})"><span class="pc-sec-play" aria-hidden="true">&#x25B6;</span>${escHtml(tf(rd, 'label'))}</button>`).join('');
  return L.sections.map((S, si) => `<button type="button" class="pc-sec${si === 0 ? ' cur' : ''}" data-sec="${si}"${pcKeyTitle('pc.keys.section', preview)} onclick="pcFromSection(this,${si})"><span class="pc-sec-play" aria-hidden="true">&#x25B6;</span>${escHtml(tf(S.s, 'label'))}</button>`).join('');
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
   played at SLOWEST_RATE (ca-54: its own `slowestRate`, pcSlowestRate), pitch held (preservesPitch), so the tuner
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
/* ONE-FILE SPEEDS (2026-11-14, Jonathan: "the browser slows the one file"): a track with no slow file (a built song,
   app/builtsongs.js) gets the same four stops on its ONE file, at these rates, pitch held. Every card opens on Normal (1×, PC_START_NORMAL).
   The bars never move (the same file at another rate), so data-slow stays '' at every stop and only data-rate
   changes. A track that has a srcSlow keeps the two-file stops above, unchanged. */
const PC_ONE_FILE_RATES = [0.65, 0.85, 0.9, 1];
/* Every play-along card opens on Normal, 1× (Jonathan, 2026-11-20: "have songs default to full screen 1x speed when
   they are opened" — every play-along, In-Class Activities and the Songs page). Was Slower (the slow file, or 0.85
   on one file). The card's data-slow / data-rate (pcCardHtml), the slider's START and the two-way switch all
   start here; full screen is caSongFullscreen (app/activities-2.js). ONE card is the exception: ca-54, the speed
   ladder, opens on its bottom stop, 90 (`startStop`, below; checks.mjs 1fc pins it to that card alone). */
const PC_START_NORMAL = true;
/* The one exception to both rules above and to "the Slowest stop is the slow file at SLOWEST_RATE" (Jonathan, 2026-11-24,
   ca-54, the speed ladder): a card with `startStop: 'slowest'` opens on its bottom stop, and `slowestRate` (0.9 there:
   the slow file, 100, at 0.9 = 90) replaces SLOWEST_RATE for that card's bottom stop. Every other card, and
   SLOWEST_RATE itself, are unchanged. Two files only: a one-file track keeps its stops. */
function pcOneFile(tr){ return !!tr && !tr.srcSlow; }
function pcSlowestRate(c){ return c && c.slowestRate > 0 && c.slowestRate < 1 ? c.slowestRate : SLOWEST_RATE; }
function pcStartsSlowest(c, tr){ return !!c && c.startStop === 'slowest' && !!c.slowest && !pcOneFile(tr); }
/* A control's tooltip naming its key (KEYS, below). None in the console's
   preview (`preview`), where the keys are off. */
function pcKeyTitle(key, preview){ return preview ? '' : ` title="${escAttr(t(key))}"`; }
function pcSpeedSwitchHtml(preview){
  const n = PC_START_NORMAL;   // checked = Normal (pcSetSpeed)
  return `<button type="button" class="pc-speed" role="switch" aria-checked="${n}" aria-label="${escAttr(t('ca.cardSpeedAria'))}"${pcKeyTitle('pc.keys.speed', preview)} onclick="pcSetSpeed(this)">`
    +   `<span class="pc-speed-lab${n ? '' : ' on'}">${escHtml(t('ca.cardSlower'))}</span>`
    +   `<span class="pc-speed-track" aria-hidden="true"><span class="pc-speed-knob"></span></span>`
    +   `<span class="pc-speed-lab${n ? ' on' : ''}">${escHtml(t('ca.cardNormal'))}</span></button>`;
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
function pcSpeed3Html(tr, preview, c){
  /* A stepped slider (2026-10-08): the dot-row version left students unsure
     the middle dots were options at all. The ends read "Slower" and
     "Normal" (Jonathan, 2026-10-09) as directions, not stop names; every
     stop shows how fast it plays against the record (pcSpeedFactor), worked
     out from this song's files, and the knob's stop is the bold one. The
     native range does drag, keyboard and the accessible value; the ticks sit
     exactly under its four stops, so a tap on a tick lands on that stop.
     Each tick still carries data-speed / data-rate — pcSetSpeedTo() reads
     the one the range points at. */
  const one = pcOneFile(tr);
  const ratio = one ? 1 : tr.trackBpmSlow / tr.trackBpm;   // the slow file against the record
  const stops = one
    ? [
    ['slowest', 'ca.cardSlowest', PC_ONE_FILE_RATES[0],        PC_ONE_FILE_RATES[0]],
    ['slower',  'ca.cardSlower',  PC_ONE_FILE_RATES[1],        PC_ONE_FILE_RATES[1]],
    ['slow',    'ca.cardSlow',    PC_ONE_FILE_RATES[2],        PC_ONE_FILE_RATES[2]],
    ['normal',  'ca.cardNormal',  PC_ONE_FILE_RATES[3],        PC_ONE_FILE_RATES[3]],
  ] : [
    ['slowest', 'ca.cardSlowest', pcSlowestRate(c),            ratio * pcSlowestRate(c)],
    ['slower',  'ca.cardSlower',  1,                           ratio],
    ['slow',    'ca.cardSlow',    pcSlowRate(tr).toFixed(4),   pcSlowRate(tr)],
    ['normal',  'ca.cardNormal',  1,                           1],
  ];
  const START = pcStartsSlowest(c, tr) ? 0 : PC_START_NORMAL ? 3 : 1;   // Normal (1×), or a startStop card's bottom stop — matches the card's data-slow / data-rate (caCardBodyHtml)
  const ticks = stops.map(([speed, key, rate, factor], i) => {
    const x = pcSpeedFactor(factor);
    return `<span class="pc-speed-tick${i === START ? ' on' : ''}" style="--i:${i}" data-speed="${speed}" data-rate="${rate}" data-label="${escAttr(t(key) + ', ' + x)}"></span>`
      + `<span class="pc-speed-x${i === START ? ' on' : ''}" style="--i:${i}" aria-hidden="true">${x}</span>`;
  }).join('');
  return `<span class="pc-speed4"${one ? ' data-one-file="1"' : ''} role="group" aria-label="${escAttr(t('ca.cardSpeed4Aria'))}"${pcKeyTitle('pc.keys.speed', preview)}>`
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
    + ((a.card.slowest || pcOneFile(L.tr)) ? pcSpeed3Html(L.tr, preview, a.card) : pcSpeedSwitchHtml(preview))   // one file: always the four stops
    /* The Guitar switch: only where a full mix exists, ON by default. */
    + (hasFull ? pcGuitarSwitchHtml() : '')
    + `</div>`;
}
function pcTabHtml(a, L, preview){
  const c = a.card;
  const many = L.sections.length > 1;
  const chips = many && !pcOneRound(L) && !c.fade   /* a memory fade plays every section through (app/fade.js): nothing to tap */
    ? `<p class="pc-hint">${escHtml(t(L.rounds ? 'ca.roundHint' : 'ca.cardSectionHint'))}</p><div class="pc-secs">`
      + pcSecButtonsHtml(L, preview)
      + pcLoopHtml(L, preview) + `</div>`
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
     (ca-38 — see LYRIC SHEET, app/cards-sheet.js). The sheet is drawn after the HTML is in
     the page, so the builder only queues a scan; every caller (the student
     card, the hero card, the console preview) gets it the same way. */
  const sheet = !!a.card.sheet && typeof pcSheetHtml === 'function';   /* the sheet is app/cards-sheet.js, a later part: a page with the new cards.js without it draws the tab (W24 review R1-1) */
  if(sheet) setTimeout(pcSheetScan, 0);
  return `<div class="pc" data-id="${escAttr(a.id)}"${pcStartsSlowest(a.card, L.tr) ? ` data-slow="1" data-rate="${pcSlowestRate(a.card)}"` : PC_START_NORMAL ? ' data-slow="" data-rate="1"' : pcOneFile(L.tr) ? ` data-slow="" data-rate="${PC_ONE_FILE_RATES[1]}"` : ' data-slow="1"'}${a.card.buildLaps >= 1 ? ` data-build-laps="${Math.floor(a.card.buildLaps)}"` : ''}${snippetHasFull(L.tr) ? ' data-guitar="1"' : ''}${preview ? ' data-preview="1"' : ''}>`
    + caRecordingSwitchHtml(a) + caKeySwitchHtml(a) + caChordSwitchHtml(a) + caBassSwitchHtml(a) + (typeof caViewSwitchHtml === 'function' ? caViewSwitchHtml(a) : '')   /* Chords / Tab / Lyrics: app/cards-views.js, a later part; guarded so a page that has the new cards.js without it still draws the card (W23 review R1-1) */
    + `<p class="pc-dir">${escHtml((typeof fadeDirections === 'function' && fadeDirections(a)) || t(L.rounds ? 'ca.roundDirections' : sheet ? 'ca.sheetDirections' : L.sections.some(S => S.grid) ? (L.sections.every(S => S.grid) ? (L.sections.every(S => S.every) ? 'ca.cardStrumDirections' : 'ca.cardChordDirections') : 'ca.cardChordMixedDirections') : 'ca.cardDirections'))}`
    + (caBassMode(a) === 'on' && tf(a, 'bassDirections') ? ' ' + escHtml(tf(a, 'bassDirections')) : '')   // alternating bass — see BASS NOTES
    + `</p>`
    + pcPlayerHtml(a, L, preview) + pcLadderAskHtml(L)
    + (typeof fadeBarHtml === 'function' ? fadeBarHtml(a, preview) : '')   /* MEMORY FADE (ca-56): app/fade.js, a later part; '' on every other card */
    + (sheet ? pcSheetHtml(a, L, preview) : pcTabHtml(a, L, preview)) + pcChecksHtml(a, preview) + pcHelpHtml(a, preview)
    + `</div>`;
}

/* THE LEAD (Jonathan, 2026-11-13: "the highlights should show up only very
   slightly before the actual beat"). Every highlight of a practice card (a
   tab's note, a chord grid's beat, a lyric sheet's dot and its "This bar"
   cell) appears PC_LEAD real seconds before its beat is HEARD: the same on
   every card, every song and every speed, and the same at a line change.
   It replaced three numbers (2026-11-16): the sheet dot ran 0.175 s ahead of
   the decoder (tuned by ear on ca-38, 2026-10-19), a note on a new tab row
   0.15 s more (ca-29, 2026-10-22: the eye has to jump to another row), every
   other note 0 (on the decoder, so one output latency ahead of the sound).
   Measured against the heard beat (tools/playalong-loop.mjs --leads) those
   were about 255, 230 and 80 ms. The row's extra lead is gone: a line change
   gets the same small lead as every other note.
   "Heard" is the decoder's position (audio.currentTime) plus the speakers'
   delay, snipLatency() (app/snippets.js, an estimate). So the cursor reads
   the music at currentTime + (PC_LEAD - snipLatency()) x the playback rate
   (pcLeadShift): with a lead shorter than the latency it reads a little
   BEHIND the decoder. PC_LEAD is 0 since 2026-11-17: ON the heard beat, not ahead
   of it (Jonathan: "play along highlights should be exactly on the beat and not
   ahead of it for everything ... it's confusing otherwise"; this reverses his 60 ms
   of the day before). The step snippets' bar dots are on the heard beat too, so
   every highlight on the site now follows one rule. "Heard" still rests on the
   latency estimate: `?snipcal=1&lead=<ms>` on the URL overrides the lead live
   (app/boot.js; `&lat=<ms>` overrides the latency the same way). The lyric
   sheet's SCROLL keeps its own look-ahead (PC_SHEET_FOLLOW_AHEAD): that is the
   page moving, not a highlight. */
const PC_LEAD = 0;
function pcLead(){ return typeof window.__pcLead === 'number' ? window.__pcLead : PC_LEAD; }
// File seconds the cursor reads ahead of audio.currentTime (negative = behind it).
function pcLeadShift(root){ return (pcLead() - snipLatency()) * pcRate(root); }
/* Where the cursor reads (window bars) with the decoder at `ct`: pcLeadShift
   on, never back past st.passFrom once the decoder has reached it (pcFrame). */
function pcLeadBars(st, ct){
  const read = snipBarsAt(st.win, ct + pcLeadShift(st.root));
  return read < st.passFrom && snipBarsAt(st.win, ct) >= st.passFrom - 1e-6 ? st.passFrom : read;
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
function pcWindow(L, slow, guitar){ return snippetWindow(L.tr, { fromBar: L.firstBar, bars: L.totalBars }, slow, guitar); }   // per FILE: see snipFileOffset
function pcStatus(root, html){ const el = root.querySelector('.pc-status'); if(el) el.innerHTML = html || ''; }   // '' = :empty, see styles.css
function pcStop(){
  songFileCancelWait();                // a card waiting for its song (SONG FILES, app/songfiles.js) never starts by itself after a stop
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
    if(typeof pcSheetStopped === 'function') pcSheetStopped(root);   /* app/cards-sheet.js (W24 R1-1) */
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
   makes one, nor does a speed ladder while it stops and asks after each stop
   (pcLadderPause, app/cards-loop.js). */
const PC_LAP_LEAD = 0.1, PC_SPARE_START = 0.02;
function pcLoopStart(st){ return pcLoopStartIn(st, st.win); }
/* The lap goes back to the section started from, or, with Loop this part on,
   to the section being looped (LOOP THIS PART, app/cards-loop.js). */
function pcLoopStartIn(st, win){ return snipTimeAtBars(win, st.L.sections[pcLoopSec(st)].fromBar - st.L.firstBar); }
/* One of the card's <audio> elements failed. The two swap roles every lap,
   so both get this same handler: the PLAYING one stops the card and says
   so; the spare (or the one on its way out) is just dropped, since losing
   it is not losing the song — the lap falls back to a seek. */
function pcAudioError(st, el){
  if(pcState !== st) return;
  if(st.audio !== el){ if(st.spare === el) st.spare = null; if(st.leaving === el) st.leaving = null; if(st.twin === el) st.twin = null; return; }
  pcStop();
  // What a failed song shows (the toast, or the song help pop-up): app/songhelp.js.
  songLoadFailed();
}
function pcSparePark(st){
  if(pcState !== st || st.leaving) return;   // mid-handoff: the timer parks it
  /* A whole-song card laps only while Loop this part is on. With it off (never on, or turned off) its spare is
     dropped, so the song stops at its end (Friday check 2026-11-14: Loop on, then off, left the spare parked and
     the card lapped forever). A speed ladder that stops and asks (pcLadderPause, ROUNDS in app/cards-loop.js) never
     hands a lap to its spare either: none is made. A speed picked by hand ends the ladder, and its pcRetrack parks one. */
  if((st.wholeSong && !(st.loopSi >= 0)) || pcLadderPause(st)){
    if(st.spare){ try { st.spare.pause(); st.spare.removeAttribute('src'); st.spare.load(); } catch(e) {} st.spare = null; }
    return;
  }
  let sp = st.spare;
  if(!sp){
    sp = st.spare = new Audio();
    sp.preload = 'auto';
    sp.loop = false;
    // A spare that cannot load is just dropped: the lap falls back to a seek.
    // After a lap it is the playing element, and then an error stops the card.
    sp.addEventListener('error', () => pcAudioError(st, sp), { once: true });
  }
  /* Build up speed (app/cards-loop.js): when the lap coming up is one step
     faster, the spare waits on THAT stop's file and place, so the step lands
     on the bar line with no gap. pcLoopNext() is null otherwise. */
  const nx = pcLoopNext(st);
  slowestApplyRate(sp, nx ? parseFloat(nx.rate) : pcRate(st.root));
  // Reads the window when it runs, not when it was queued — a speed switch
  // while the file is still loading must not park it on the old tier's clock.
  const seek = () => { if(pcState === st && st.spare === sp){ const n = pcLoopNext(st); try { sp.currentTime = n ? pcLoopStartIn(st, n.win) : pcLoopStart(st); } catch(e) {} } };
  if(nx ? !twinSrcIs(sp, nx.src) : sp.src !== st.audio.src){
    sp.addEventListener('loadedmetadata', seek, { once: true });
    sp.src = nx ? nx.src : st.audio.src;
    sp.load();
  } else if(sp.readyState >= 1) seek();
}
function pcSpareReady(st){
  if(st.wholeSong && !(st.loopSi >= 0)) return false;   // a whole-song card ends at its end unless Loop this part is on
  if(pcLadderPause(st)) return false;  // a ladder stops at the end of each stop: no spare takes the lap over
  const sp = st.spare, nx = pcLoopNext(st);
  if(nx) return !!(sp && twinSrcIs(sp, nx.src) && sp.readyState >= 3 && !sp.seeking && Math.abs(sp.currentTime - pcLoopStartIn(st, nx.win)) < 0.05);
  return !!(sp && sp.src === st.audio.src && sp.readyState >= 3 && !sp.seeking && Math.abs(sp.currentTime - pcLoopStart(st)) < 0.05);
}
/* While a private song loads (SONG FILES), Play reads Stop and a press (or
   Space / K) cancels the wait; it goes back to Play when the wait ends. */
function pcWaitUi(root){
  const btn = root.querySelector('.pc-play');
  const set = on => { if(btn){ btn.innerHTML = pcPlayBtnHtml(on); btn.classList.toggle('playing', on); } };
  return { wait: () => set(true), done: () => set(false) };
}
function pcToggle(btn){
  const root = btn.closest('.pc');
  if(!root) return;
  if(pcState && pcState.root === root){ pcStop(); return; }
  // Stop while the song is still loading (SONG FILES): cancel the wait.
  if(songFileWaitingFor(root)){ songFileCancelWait(); return; }
  /* ROUNDS: Play plays the round tapped last again (its switches are still as the round left them: a hand-picked speed
     left a plain loop of it); before any round, the whole card from the top. */
  const a = pcActivity(root), L = a && pcLayout(a);
  if(pcOneRound(L)){ pcRoundStart(root, 0, L); return; }   // a one-round card: Play is the ladder, from its bottom stop
  const rd = pcRoundNow(a, root);
  pcStart(root, rd ? rd.from : 0);
}
function pcFromSection(btn, si){
  const root = btn.closest('.pc');
  if(root) pcStart(root, si);
}
/* A round button (ROUNDS): Loop and Build up speed on, the round remembered (pcStart reads it), then the round plays
   from a count-in at its first stop. Stay at this speed starts off. */
function pcFromRound(btn, ri){
  const root = btn.closest('.pc');
  if(root) pcRoundStart(root, ri);
}
function pcRoundStart(root, ri, L0, keepBuild){
  const a = pcActivity(root), L = L0 || (a && pcLayout(a)), rd = L && L.rounds && L.rounds[ri];
  if(!rd) return;
  root.dataset.round = String(ri);
  pcLoopSet(root, 'loop', true);
  pcLoopSet(root, 'build', true);
  pcLoopSet(root, 'hold', false);
  pcStart(root, rd.from, 0, keepBuild);
}
function pcStart(root, si, rep, keepBuild){
  if(window.coachMicLive) return;      // same guard as snipToggle: never play into a live mic
  if(typeof stopAllDemoAudio === 'function') stopAllDemoAudio();   // includes pcStop()
  const a = pcActivity(root);
  const L = a && pcLayout(a);
  if(!L || !L.sections[si]) return;
  pcLadderAskHide(root);               // a play starts: the "Got it / Practice again" prompt (app/cards-loop.js) goes
  /* Loop this part / Build up speed (app/cards-loop.js): Build starts every
     play at the slowest stop (or, after a private song loaded, the stop it
     reached: keepBuild), so the speed control is set before the file is picked. */
  const rd = pcRoundIn(a, root, si);   // a round tapped (ROUNDS): the climb starts at its stop, its lap is all its sections
  const build = pcBuildBegin(root, keepBuild, rd ? rd.startStop : 0);
  const slow = root.dataset.slow === '1', guitar = root.dataset.guitar === '1';
  const src = snippetSrc(L.tr, slow, guitar);
  // A private song not on this page yet: "Loading the song… 40%", then this press again (SONG FILES).
  if(songFileNeedsLoad(src)){ songFileWaitThen(root, src, () => pcStart(root, si, rep), pcWaitUi(root)); return; }
  const audio = new Audio();
  audio.preload = 'auto';
  audio.loop = false;                  // the window is looped (or stopped) by hand, in pcFrame
  audio.src = src;
  slowestApplyRate(audio, pcRate(root));
  /* `rep` (optional): start at that lap of the section — a tap on a chord on
     a lyric sheet (pcSheetStartAt). The loop, if any, still returns to the
     section's start. */
  const fromRep = Math.max(0, Math.min(L.sections[si].reps - 1, rep | 0));
  const st = { root, L, audio, win: pcWindow(L, slow, guitar), loopFrom: si, fromRep, wholeSong: !!a.card.wholeSong, sheet: !!a.card.sheet && typeof pcSheetHtml === 'function', raf: 0, timers: [], lastBeat: -1, counting: true, si: -1, seq: -1, rep: -1, beat: -1, key: '', row: null,
               loopSi: root.dataset.loop === '1' ? si : -1, loopTo: rd ? rd.to : si, build, laps: 0,
               passFrom: L.sections[si].fromBar + fromRep * L.sections[si].bars - L.firstBar };   // where this pass began, in window bars (THE LEAD)
  pcState = st;
  if(typeof fadeStarted === 'function') fadeStarted(st);   // MEMORY FADE (app/fade.js): the loop on, or the last time through ending at its end
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
  pcLoopStatus(st);                    // "Looping: Chorus" / "Round 1 of 2 at Slowest" instead, with Loop on
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
  const slow = root.dataset.slow === '1', guitar = root.dataset.guitar === '1';
  twinPark(st, snippetSrc(st.L.tr, slow, !guitar), el => pcAudioError(st, el),
    snipFileOffset(st.L.tr, slow, !guitar) - snipFileOffset(st.L.tr, slow, guitar));
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
    st.clicks.push(pcClick(t0 + k * beat, true));
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
/* CLICK IN SIX (Jonathan, 2026-11-10: "it should click one through 6"). On a
   countSix track the click, and the count-in, sound every eighth, six to a
   bar; any other track: one click a beat. clickSub = clicks per counted beat.
   EVERY CLICK THE SAME (Jonathan, 2026-11-25: "no distinct beat anywhere is
   simplist"): no click is higher, louder or longer for beat 1, or for 1 and 4
   in 6/8 — that accent (his 2026-11-10 "one and 4 can have a different
   sounding click") is gone, so pcClick takes no accent. */
function clickSub(tr){ return tr && tr.countSix ? 3 : 1; }
function pcClick(at, countIn, gain){
  const ctx = getAudioCtx();
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.frequency.value = 1000;
  // Quiet on purpose (Jonathan, 2026-09-27: the first cut was "very loud").
  // The count-in is a little louder (2026-09-29) — it plays over silence
  // and has to be caught first time; every click of it the same.
  // A track's clickGain lifts its in-song click where the mix buries it.
  const peak = 0.13 * (countIn ? 1.6 : 1) * (gain || 1);
  g.gain.setValueAtTime(0.0001, at);
  g.gain.exponentialRampToValueAtTime(peak, at + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, at + 0.08);
  o.connect(g); g.connect(ctx.destination);
  o.start(at); o.stop(at + 0.1);
  return o;
}
/* The next counted beat, scheduled once it is under 100 ms away. `lastBeat`
   is reset on a loop, and on a track switch goes back to the last count whose
   click was kept (keptClickCount, app/snippets.js), so a jump back never
   skips beats and never clicks one twice. */
function pcScheduleClick(st, now, back){
  const bpb = st.L.tr.beatsPerBar * clickSub(st.L.tr);   // clicks a bar — see CLICK IN SIX
  const beatPos = snipBarsAt(st.win, now) * bpb;
  let nb = Math.ceil(beatPos - 1e-6);
  if(back >= 0 && back < nb) nb = back;   // the count a switch just took back, reached since: it still clicks (QUEUED CLICKS, app/snippets.js)
  if(nb < st.lastBeat) st.lastBeat = nb - 1;
  if(nb <= st.lastBeat || nb < 0 || nb >= pcLoopEndBars(st) * bpb) return;   // the looped section's end, as the card's end: the next lap clicks its own downbeat
  const ahead = (snipTimeAtBars(st.win, nb / bpb) - now) / pcRate(st.root);   // real seconds
  if(ahead > 0.1) return;
  const ctx = getAudioCtx();
  const lat = snipLatency() - (ctx.outputLatency || ctx.baseLatency || 0);
  const at = ctx.currentTime + Math.max(0, ahead + lat);
  // Kept until it has sounded, so a switch or Stop can take it back — see QUEUED CLICKS (app/snippets.js).
  queueClick(st, pcClick(at, false, (st.L.tr.clickGain || 1) * PLAYALONG_CLICK_GAIN), at, ctx.currentTime + Math.max(0, ahead), nb);
  st.lastBeat = nb;
}
function pcFrame(){
  const st = pcState;
  if(!st) return;
  if(!st.root.isConnected){ pcStop(); return; }   // a re-render pulled the card out
  const { L } = st;
  let audio = st.audio;
  const now = audio.currentTime;
  const end = pcLoopEnd(st);           // the end of the window, or of the section Loop this part repeats
  const left = (end - now) / (audio.playbackRate || 1);   // real seconds to the end of the window
  if(left <= PC_LAP_LEAD && !st.leaving && !audio.ended && pcSpareReady(st)){
    // The lap, with no seek and no hole — see THE SPARE.
    const sp = st.spare, old = audio;
    st.leaving = old;
    // The two handoff timers' ids, so pcRetrack can cancel exactly these.
    const hand = st.handoff = [];
    hand.push(setTimeout(() => {
      if(pcState !== st || st.leaving !== old) return;
      if(st.audio !== old || !pcSpareReady(st)){ st.leaving = null; return; }   // switched under us: seek instead
      const nx = pcLoopNext(st);       // Build up speed: this lap is one stop faster, and the spare waits on it
      if(nx){ pcBuildShow(st.root, nx.stop); st.win = nx.win; }
      slowestApplyRate(sp, pcRate(st.root));   // a speed tap in the last tenth of a second skipped pcSparePark
      sp.play().catch(() => {});
      st.audio = sp; st.spare = null;
      st.lastBeat = -1;
      st.passFrom = st.L.sections[pcLoopSec(st)].fromBar - st.L.firstBar;   // the lap's first bar (THE LEAD)
      pcLoopLapDone(st, nx);
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
  } else if(!st.leaving && (now >= end - 0.02 || audio.ended)){
    // A ladder (card.rounds, ca-54) plays one time through a stop, then stops and asks: Got it or Practice again.
    if(pcLadderPause(st)){ pcLadderAsk(st); return; }
    // A whole-song card stops at the end of the song (Jonathan, 2026-10-02:
    // it used to loop back to where it started). A card that is a few bars
    // of the song (ca-10's twelve laps of the riff, ca-20's four-bar loop)
    // still loops.
    if(st.wholeSong && !(st.loopSi >= 0)){
      const root = st.root;
      pcStop();
      if(typeof fadeSongEnd === 'function' && fadeSongEnd(st)) return;   // a memory fade's last time through (app/fade.js) says so in its own bar
      pcStatus(root, escHtml(t('ca.cardSongEnd')));
      return;
    }
    // The spare was not ready (or this card has none yet): the old seek.
    const nx = pcLoopNext(st);
    // Build up speed, the next stop a private song not loaded yet: load it, then that stop from a count-in (SONG FILES).
    if(nx && pcBuildWaitStep(st, nx)) return;
    try { audio.currentTime = pcLoopStart(st); } catch(e) {}
    st.passFrom = st.L.sections[pcLoopSec(st)].fromBar - st.L.firstBar;   // the lap's first bar (THE LEAD)
    if(audio.paused) audio.play().catch(() => {});
    /* Build up speed: the lap is counted and the control moved to the next
       stop first, then the speed switch's own path plays it (the rate, or the
       other file at this bar), and the spare is parked for the lap after. */
    if(nx) pcBuildShow(st.root, nx.stop);
    pcLoopLapDone(st, nx);
    if(nx){ pcRetrack(st.root); audio = st.audio; }
    pcSparePark(st);                   // try to be ready for the next lap
    st.lastBeat = -1;
  }
  if(st.root.dataset.metro === '1' && !audio.seeking) pcScheduleClick(st, audio.currentTime);   // not mid-seek: see clickTick in tabs/journey.js
  twinFollow(st, st.audio);
  /* Every highlight is PC_LEAD before its beat is heard — see THE LEAD. A
     cursor that reads behind the decoder never reads back past where this
     pass began (st.passFrom: the start, or the lap's first bar) once the
     decoder is there, or for a few ms after a start or a lap it would show
     the bar BEFORE the jump. (A file still loading after a switch sits at 0,
     before the pass: nothing is lifted then, and nothing moves.) A lead
     never looks past the end of the section Loop this part repeats
     (pcLoopClamp). */
  const read = pcLeadBars(st, audio.currentTime);
  const barsIn = pcLoopClamp(st, read);
  const loc = pcLocate(L, barsIn);
  /* A chord grid repaints on a new BEAT, not a new note; a lyric sheet
     repaints on either (its dot fills on every beat, its chord mark moves on
     every chord change). */
  if(loc && (pcLocKey(L, loc) !== st.key || (st.sheet && loc.beat !== st.beat))) pcPaint(st, loc);
  if(st.sheet){ pcSheetStrip(st, loc, barsIn); pcSheetFollow(st, audio.currentTime); }
  st.raf = requestAnimationFrame(pcFrame);
}
/* What a repaint is keyed on: the beat on a chord-grid section, the note
   everywhere else. Never the note on a grid — it moves on a "+". */
function pcLocKey(L, loc){
  return loc.si + ':' + loc.rep + ':' + (L.sections[loc.si].grid ? 'b' + loc.beat : 's' + loc.seq);
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
  if(row && row !== st.row){
    st.row = row;
    /* The first follow after a view press (st.keepTop, caCardViewReveal): the switch row stays on screen if the row
       being played is on screen; only the look-ahead to the next row gives way. Every later row follows as ever. */
    const keep = st.keepTop && st.keepTop.isConnected && row.getBoundingClientRect().bottom <= window.innerHeight ? st.keepTop : null;
    st.keepTop = null;
    pcFollow(row, false, keep);
  }
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
   whatever is actually scrolling — .main on a laptop, the page on a phone.
   `keep` (a lyric sheet's line being played, when `row` is the line coming:
   THE SHEET'S LOOK-AHEAD, app/cards-sheet.js): the scroll stops short of moving it off screen,
   and pcFollow returns true when it did. `jump`: an instant scroll, not a
   smooth one. `toTop` (a lyric sheet's line being played, THE SHEET'S TOP, app/cards-sheet.js):
   the row goes as high as it can, `pad` under the sticky bars, whatever is
   below it; the scroll box's end stops it there. pcFollowPlan works the
   scroll out without making it (null: none to make); pcFollowScroll makes
   it. */
function pcFollow(row, force, keep, jump, toTop){
  const p = pcFollowPlan(row, force, keep, toTop);
  if(!p) return;
  if(Math.abs(p.delta) >= 2) pcFollowScroll(p, jump);
  return p.short;
}
function pcFollowPlan(row, force, keep, toTop){
  if(!row) return null;
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
    // Not stuck yet (the sheet's top is on screen): it will be, under the bars above, once `row` is at the top.
    else if(toTop) top += r.height;
  }
  const tab = row.closest('.pc-tab');
  if(!force && tab){
    const tr = tab.getBoundingClientRect();
    if(tr.bottom < top || tr.top > bottom) return null;
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
  if(toTop) delta = rr.top - (top + pad);                            // as high as it can go
  else {
    if(need > bottom - pad) delta = need - (bottom - pad);            // reveal the next row
    delta = Math.min(delta, rr.top - (top + pad));                   // …but keep this one below the bar
    if(rr.top < top + pad) delta = rr.top - (top + pad);             // this row is hidden above: bring it down
  }
  let short = false;
  if(keep){
    // Where `keep` can go and stay inside the view; when it is taller than the view, its top.
    const kr = keep.getBoundingClientRect(), lo = kr.bottom - (bottom - pad), hi = kr.top - (top + pad);
    const d = lo <= hi ? Math.min(hi, Math.max(lo, delta)) : hi;
    short = Math.abs(d - delta) >= 2;
    delta = d;
  }
  // `on`: the row is all on screen now, under the sticky bars.
  return { box, isDoc, delta, short, on: rr.top >= top - 0.5 && row.getBoundingClientRect().bottom <= bottom + 0.5 };
}
/* Makes a pcFollowPlan's scroll; returns how far the content moves up, in
   getBoundingClientRect pixels, once the scroll ends (the box's end can stop
   it short of the plan). */
function pcFollowScroll(p, jump){
  const box = p.box;
  /* Every number above is a getBoundingClientRect one, which counts the
     scroll box's own CSS zoom; scrollBy counts in the box's own pixels. Full
     screen zooms .main (body.ca-full, --ca-zoom, 1.37 on a Chromebook), so
     each follow there scrolled 1.37 times too far: a jump back to the top of
     a lyric sheet's second column left the line half a screen low (ca-45,
     2026-11-16). Measured, not read from --ca-zoom; 1 everywhere else. */
  const zoom = p.isDoc || !box.offsetHeight ? 1 : box.getBoundingClientRect().height / box.offsetHeight;
  const by = p.delta / (zoom > 0 ? zoom : 1), from = box.scrollTop;
  const to = Math.max(0, Math.min(box.scrollHeight - box.clientHeight, from + by));
  box.scrollBy({ top: by, behavior: jump ? 'auto' : scrollBehavior() });
  return (to - from) * (zoom > 0 ? zoom : 1);
}
/* Full screen on or off, or a window resize, moves the line being played:
   entering full screen puts the scroll box back at its top (Chrome 157,
   measured 2026-11-16: .main from 154 to 0 with the song playing) and the
   zoom changes every height. Forget the line pcFollow last kept in view, so
   the next frame (a sheet: the line being played, jumped back to the top,
   THE SHEET'S TOP, app/cards-sheet.js) or the next note (a tab) brings it back. */
function pcRefollow(){ if(pcState){ pcState.sheetLine = null; pcState.sheetLit = null; pcState.sheetAim = null; pcState.sheetTop = null; pcState.row = null; } }
document.addEventListener('fullscreenchange', pcRefollow);
window.addEventListener('resize', pcRefollow);
function pcShowSection(root, L, si){
  root.querySelectorAll('.pc-page').forEach(p => { p.hidden = Number(p.dataset.page) !== si; });
  root.querySelectorAll('.pc-sec[data-sec]').forEach(b => b.classList.toggle('cur', Number(b.dataset.sec) === si));
  root.querySelectorAll('.pc-round').forEach(b => b.classList.toggle('cur', b.dataset.round === root.dataset.round));   // ROUNDS: the round tapped last
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
  pcBuildTakeover(root);               // a speed chosen by hand ends Build up speed (app/cards-loop.js)
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
  const one = !!range.closest('.pc-speed4[data-one-file="1"]');   // ONE-FILE SPEEDS: every stop is the one file
  const slow = !one && (speed === 'slowest' || speed === 'slower') ? '1' : '';
  if(root.dataset.slow === slow && pcRate(root) === parseFloat(rate)) return;
  pcBuildTakeover(root);               // a speed chosen by hand ends Build up speed (app/cards-loop.js)
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
  // A speed or Guitar change while this card's song still loads: wait for the file asked for now (SONG FILES).
  if((!st || st.root !== root) && songFileRedoWait(root)) return;
  if(!st || st.root !== root) return;
  if(st.counting){ pcStart(root, st.loopFrom, st.fromRep, st.build); return; }
  const slow = root.dataset.slow === '1', guitar = root.dataset.guitar === '1';
  /* The new tier is a private file not loaded yet (SONG FILES): stop, load it,
     then start the section that was playing again, on the new tier. */
  const sfSrc = snippetSrc(st.L.tr, slow, guitar);
  if(songFileNeedsLoad(sfSrc)){
    const from = st.loopFrom;
    pcStop();
    songFileWaitThen(root, sfSrc, () => pcStart(root, from), pcWaitUi(root));
    return;
  }
  pcCancelHandoff(st);
  // A switch still waiting for its file keeps the place it saved — see snipSetTier.
  const pend = st.pending;
  const barsIn = pend ? pend.bars : snipBarsAt(st.win, st.audio.currentTime);
  st.win = pcWindow(st.L, slow, guitar);   // the NEW file's window: a Guitar switch may change the offset
  // The count is queued again on the new clock: take back the one already queued (QUEUED CLICKS).
  const back = cancelQueuedClicks(st);
  st.lastBeat = keptClickCount(st);
  const at = snipTimeAtBars(st.win, isFinite(barsIn) && barsIn > 0 ? barsIn : 0);
  const src = snippetSrc(st.L.tr, slow, guitar);
  slowestApplyRate(st.audio, pcRate(root));   // Slowest <-> Slower and Slow <-> Normal are the same file, just the rate
  if(st.audio.src.endsWith(src)){
    // Same file, same window: only the rate moved — no seek (see snipSetTier).
    if(!pend && Math.abs(st.audio.currentTime - at) > SAME_FILE_SEEK_SEC){ try { st.audio.currentTime = at; } catch(e) {} }
    pcSparePark(st);
    // The music carries on: the count just taken back is queued again now (QUEUED CLICKS, app/snippets.js).
    if(back >= 0 && !st.audio.seeking) pcScheduleClick(st, st.audio.currentTime, back);
    return;
  }
  /* Guitar flipped and the twin is already playing the other mix in step:
     swap which one is heard. No load, no seek — see THE TWIN. The spare is
     still on the old mix, so it is re-parked on the new one as usual. */
  if(twinReady(st, st.audio, src)){
    st.audio = twinSwap(st, st.audio);
    pcParkTwin(st);
    pcSparePark(st);
    // The music carries on: the count just taken back is queued again now (QUEUED CLICKS, app/snippets.js).
    if(back >= 0 && !st.audio.seeking) pcScheduleClick(st, st.audio.currentTime, back);
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
     L            the Loop this part switch     pcSetLoopSw(switch) — a card with sections only (app/cards-loop.js)
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
   Alt held, with Shift held (except for < and >, which need it), on a
   held-down repeat, when another handler already took the
   key, in the teacher console, while the nav drawer, a dialog (the games,
   the live quiz, the gates, Report a problem), the search panel, a tool
   popup (metronome, timer, tuner), the video viewer or the live
   quiz's join banner is open, while a "Turn on the microphone" panel is on
   screen, a mic listens (coachMicLive) or a Call-the-chord round owns the
   space bar (chcLive). Space on a focused button, link or <summary> keeps
   its own meaning (it presses THAT control), so a Play button reached with
   Tab is never toggled twice.
   A MOUSE OR TOUCH press on a card control leaves Chrome's focus on it, and
   then Space would press that control again (a section chip restarts with a
   new count-in) and every key would stay in the speed slider. So once a
   pointer press inside a card is over (its click and change have run), the
   focus is let go (pcKeyLetGo), and the keys reach the player as the Play
   tooltip says. Twice, because the order differs: a mouse focuses on its
   press, so the pointerup's timer turn finds the focus; a touchscreen tap
   focuses only with the mouse events Chrome sends after pointerup, so the
   click that follows a pointer press lets it go again (pcKeyClick). A click
   with no pointer press before it (Enter or Space on a control reached with
   Tab) is never touched: any key press forgets the press. A field that is
   typed in keeps its focus.
   A key that acts cancels its default, so Space never scrolls the page
   then. The listeners are registered once, in app/start.js, for the page's
   life, like the site's other document keys; they hold no audio or element
   of their own (pcKeyLast is checked for isConnected before use; the
   pointer's one-turn timer reads the focus and ends). */
let pcKeyLast = null, pcKeyPressRoot = null, pcKeyClickRoot = null;
function pcKeyNote(e){
  const tg = e && e.target;
  const r = tg && tg.closest ? tg.closest('.pc') : null;
  if(r) pcKeyLast = r;
  // The card a pointer press started in (null outside every card): pcKeyPointerUp reads it, wherever the press ends.
  if(e && e.type === 'pointerdown'){ pcKeyPressRoot = r && r.dataset.preview !== '1' ? r : null; pcKeyClickRoot = null; }
}
function pcKeyPointerUp(){
  const r = pcKeyPressRoot;
  pcKeyPressRoot = null;
  // The click this press makes (a touch tap focuses only then) lets go once more: pcKeyClick.
  pcKeyClickRoot = r;
  pcKeyLetGo(r);
}
function pcKeyClick(e){
  const r = pcKeyClickRoot;
  pcKeyClickRoot = null;
  // detail 0 = a click no pointer made (Enter / Space, or code calling .click()): never one to let go after.
  if(e && e.detail === 0) return;
  pcKeyLetGo(r);
}
function pcKeyLetGo(r){
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
const PC_KEYS = { ' ': 'play', 'Spacebar': 'play', 'k': 'play', 'K': 'play', 'ArrowLeft': 'prev', 'ArrowRight': 'next', '<': 'slower', ',': 'slower', '>': 'faster', '.': 'faster', 'l': 'loop', 'L': 'loop' };
function pcKeydown(e){
  const act = Object.prototype.hasOwnProperty.call(PC_KEYS, e.key) ? PC_KEYS[e.key] : null;
  // A key press forgets the last pointer press, so the click Enter or Space makes on a control keeps its focus.
  pcKeyClickRoot = null;
  if(!act || e.defaultPrevented || e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
  // Shift + an arrow or the space bar belongs to the page (selecting, scrolling up); < and > need Shift.
  if(e.shiftKey && act !== 'slower' && act !== 'faster') return;
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
  } else if(act === 'loop'){
    const sw = root.querySelector('.pc-loop-sw[data-loop-sw="loop"]');
    if(sw && !sw.hidden){ pcSetLoopSw(sw); done = true; }   // a rounds card hides its Loop switch: its rounds start the loops
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
