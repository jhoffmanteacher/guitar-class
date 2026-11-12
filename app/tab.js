/* ── Render ── */
let lastModuleNum = 1;
let lastSetId = null;
/* Song Journey readiness, read-only here: written by tabs/journey.js into the
   same progress doc (songReady[songId] = {layer: bool}, songReadyAt[songId] =
   ms). The resume card is the only consumer — never write these from app.js. */
let songReady = {};
let songReadyAt = {};

let _fullModuleDataQueued = false;
/* The module change renderAll started, so swResumeApply can wait for the set
   to be on screen. Nothing else reads it. */
let _bootModuleChange = null;
/* ...and the catch-up run below (every module loaded, the gate re-checked):
   swResumeApply waits for it when the set first came up as a locked preview
   only because the module before it had not loaded yet. */
let _bootCatchUp = null;
function renderAll(){
  // Class-wide start module (CLASS_OPEN_THROUGH): a saved place in a skipped
  // module lands on the start module instead. Module 13 sits outside the chain.
  const startNum = classOpenThrough();
  if(startNum > 1 && (lastModuleNum||1) < startNum){ lastModuleNum = startNum; lastSetId = null; }
  populateModuleDropdown();
  _bootModuleChange = onModuleChange(lastModuleNum||1, lastSetId);
  syncPreviewNote();
  // The dropdown's 🔒 lock marker (isModuleGateLocked) judges "previous
  // module complete" from that module's own SETS/MODULE_REVIEWS data — lazy-
  // loaded per module (ensureModuleRendered), so right after login only the
  // CURRENT module (if that) has loaded. An unloaded previous module reads
  // as "nothing built yet" and holds the gate, so a fresh page load can
  // flash 🔒 on modules that are actually done. Every module-N.js is in the
  // service worker's cache (except on the first load after an update, when
  // they come from the network once: sw.js precacheRest), so loading them all
  // normally costs no network round trip — queue it once and redraw the dropdown when it lands so any
  // wrong guess corrects itself without the student having to touch anything.
  if(!_fullModuleDataQueued){
    _fullModuleDataQueued = true;
    _bootCatchUp = ensureAllModuleData().then(()=>{
      populateModuleDropdown();
      // The dropdown redraw only fixes the 🔒 marker there — the visible
      // panel for the module already on screen was gated on the same stale
      // guess, so re-run the gate check against it too (idempotent: lands
      // back on the same set when the guess was already right). Quiet: when
      // it lands back on what's already showing, it must not re-run
      // activateSet's side effects — see onModuleChange.
      return onModuleChange(lastModuleNum, lastSetId, {quiet:true});
    });
  }
}

/* Teacher/dev accounts skip the sequential set gate (isGatePreviewer), which
   makes their view quietly different from a student's — no 🔒 anywhere. This
   badge makes that visible so preview mode can't be mistaken for student view. */
function syncPreviewNote(){
  const pn = document.getElementById('preview-note');
  if(pn) pn.hidden = !isGatePreviewer();
}

/* Chord, string-fretboard and single-note diagram renderers moved to
   guitar-diagrams.js (2026-07-26) — it loads before this file and is the
   single source shared with the teacher slide decks. chordDiagramSVG,
   CHORD_DIAGRAMS, localChordSvg, localStringSvg, localStringFretboardSvg,
   localNoteSvg, noteFullLabel and ordinal are globals from there. */

/* ══════════════════════════════════════════════
   AUTO CHORD LINKS — scan step text for chord
   names, wrap them in clickable spans that load
   a chord diagram in the resource panel.
   ══════════════════════════════════════════════ */

/* MIDI base for each open string (1 = high E … 6 = low E). Adding the
   fret number gives the MIDI pitch for that fretted note. */
const STRING_OPEN_MIDI = { 6:40, 5:45, 4:50, 3:55, 2:59, 1:64 };

/* Given a chord name from CHORD_DIAGRAMS, return the MIDI pitch list
   in low→high order (string 6 to string 1), skipping muted ('x') strings. */
function chordSpecMidis(chordArr){
  return (chordArr || [])
    .slice()
    .sort((a, b) => b[0] - a[0])
    .filter(([, fret]) => fret !== 'x' && fret != null)
    .map(([str, fret]) => STRING_OPEN_MIDI[str] + Number(fret));
}
function chordMidis(chordName){
  const cfg = CHORD_DIAGRAMS[chordName];
  return cfg ? chordSpecMidis(cfg.chord) : [];
}

/* Strum a chord one string at a time. ~35ms between strings approximates
   a moderate downstrum. btnEl, when supplied, gets a brief 'playing' class. */
let chordStrumTimeouts = [];
function strumChord(chordName, btnEl){
  if(window.coachMicLive) return;  // demo audio would score itself while the Coach listens
  chordStrumTimeouts.forEach(clearTimeout);
  chordStrumTimeouts = [];
  const midis = chordMidis(chordName);
  if (!midis.length) return;
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const stepMs = 35;
  const vg = chordGain(midis.length, true);
  midis.forEach((m, i) => {
    chordStrumTimeouts.push(setTimeout(() => playNote(m, vg), i * stepMs));
  });
  if (btnEl){
    btnEl.classList.add('playing');
    chordStrumTimeouts.push(setTimeout(() => btnEl.classList.remove('playing'), midis.length * stepMs + 200));
  }
}

/* ── Inline TAB renderer ──
   spec = { caption, notes: [{ string, fret, note, midi }, ...] }
     OR  { caption, phrases: [{ label, notes: [...] }, ...] }
   string is the TAB label: 'e' (high), 'B', 'G', 'D', 'A', 'E' (low).
   Renders all 6 string lines so students see real TAB layout, with
   fret numbers placed on the relevant string and a row of clickable
   note-name buttons below that play the corresponding pitch. A note may
   also carry `finger` (1-4, the fretting finger): then the button under
   that column shows the finger in a circle INSTEAD of the note name —
   the Finger Gym convention (see renderTabSystem). `hideNames: true` on the
   spec drops that row entirely — fret numbers only, for sight-reading. */
const TAB_STRINGS = ['e','B','G','D','A','E'];
/* Notes per system before the TAB wraps onto a new staff. The board never
   scrolls sideways: a phrase longer than this breaks into stacked systems the
   way printed TAB breaks into lines. Rows in one tab are balanced
   (rows = ceil(N/TAB_MAX_COLS), perRow = ceil(N/rows)) and every system in a
   tab uses the same column count, so fret spacing lines up row to row. */
const TAB_MAX_COLS = 8;
/* One six-line system: the six string rows, the note-name row under them, and
   the staff box (an absolutely-positioned grid child, so it spans the six
   string rows without occupying a cell and can't be knocked out of line by a
   padded column or a chord cell). `cols` is the column count every system in
   this tab shares; a short final chunk pads with empty cells that carry no
   data-seq, so the beat cursor never lands on one. */
/* `timed` (with counts — a practice card's Counts TAB, 2026-10-21): each
   note takes counts[ci].span eighth-note columns instead of one, so the
   spacing follows the rhythm — an eighth is half the room of a quarter —
   and a beat with no strum gets its own empty column with its count in
   grey under it (Jonathan: "that way the 3 can sit alone without a chord
   above it"). The filler columns carry no data-seq: the beat cursor still
   lands only on the column a chord starts in. `cols` counts columns. */
function renderTabSystem(chunk, off, cols, hideNames, counts, timed){
  const spanOf = ci => (timed && counts && counts[ci] && counts[ci].span) || 1;
  const used = chunk.reduce((a, n, ci) => a + spanOf(ci), 0);
  const rows = TAB_STRINGS.map(strLabel => {
    const cells = [`<div class="tab-str-label">${strLabel}</div>`];
    chunk.forEach((n, ci) => {
      let fret;
      if (Array.isArray(n.frets)) {
        const hit = n.frets.find(([s]) => s === strLabel);
        if (hit) fret = hit[1];
      } else if (n.string === strLabel) {
        fret = n.fret;
      }
      if (fret !== undefined) {
        cells.push(`<div class="tab-cell" data-seq="${off + ci}"><span class="tab-fret">${escHtml(String(fret))}</span></div>`);
      } else {
        cells.push(`<div class="tab-cell" data-seq="${off + ci}"></div>`);
      }
      for (let k = 1; k < spanOf(ci); k++) cells.push('<div class="tab-cell"></div>');
    });
    for (let pi = used; pi < cols; pi++) cells.push('<div class="tab-cell"></div>');
    return cells.join('');
  }).join('');
  const noteBtns = ['<div></div>'];
  chunk.forEach((n, ci) => {
    /* A rest ({ rest: true, beats } — a practice card's ca-41 verses,
       2026-10-25): no fret on any string above and no note button here,
       just a column the highlight stops on, so the note after it lights
       on its beat. */
    if (n.rest) {
      noteBtns.push(`<div class="tab-rest" data-seq="${off + ci}" aria-hidden="true"></div>`);
      for (let k = 1; k < spanOf(ci); k++) noteBtns.push('<div></div>');
      return;
    }
    const midis = (Array.isArray(n.midi) ? n.midi : [n.midi]).map(Number);
    const midisAttr = escAttr(JSON.stringify(midis));
    /* A note carrying `finger` (1-4) shows the FINGER in a light-purple circle
       under the staff instead of its note name — the Finger Gym convention
       Jonathan settled on for the teacher deck (2026-08-26): fret on the line,
       finger circled below, no note names. The button still plays the pitch
       and its tooltip still names the note; `note` stays in the data for the
       Coach card. No speaker glyph inside a circle — it would stretch it on
       hover; the tooltip and the hover ring are the affordance there. */
    const hasFinger = n.finger != null;
    const label = hasFinger
      ? `<span class="tab-finger">${escHtml(String(n.finger))}</span>`
      : `${escHtml(n.note)}<span class="tab-spkr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M4 9v6h4l5 4V5L8 9z"/><path d="M17 8a5 5 0 0 1 0 8"/></svg></span>`;
    const tip = hasFinger ? t('tab.playFinger',{n:n.finger, note:n.note}) : t('tab.playNote',{note:n.note});
    noteBtns.push(`<button type="button" class="tab-note-btn${hasFinger ? ' has-finger' : ''}" data-seq="${off + ci}" data-midis="${midisAttr}" onclick="playBeat(this)" title="${escAttr(tip)}" aria-label="${escAttr(tip)}">${label}</button>`);
    for (let k = 1; k < spanOf(ci); k++) noteBtns.push('<div></div>');
  });
  for (let pi = used; pi < cols; pi++) noteBtns.push('<div></div>');
  /* hideNames (a tab spec's `hideNames: true`): no row under the staff at all —
     fret numbers only. Sight-reading practice (ca-21) needs the student to
     work out each note from the fret, not read the letter or tap it to hear
     it first. The beat cursor still lands on the fret cells (they carry
     data-seq too), and ▶ Play tab stays as the answer key. */
  if (hideNames) noteBtns.length = 0;
  /* counts (optional, one { lab, held } per note — tabCounts()): a row under the
     note names with the count each note starts on, "1 + 2 + 3 + 4 +" (ca-29,
     Jonathan 2026-10-21). Each cell carries data-seq, so the beat cursor
     lights the count with its note. Shown or hidden by the Counts switch
     on a practice card (.pc-tab.counts-on, styles.css). */
  const countCells = [];
  if (Array.isArray(counts)) {
    countCells.push('<div class="tab-count" aria-hidden="true"></div>');
    chunk.forEach((n, ci) => {
      const c = counts[ci] || { lab: '', held: [], fill: [] };
      /* Untimed, a held beat prints beside the count, "2 (3)"; timed, it
         gets its own column (the filler cells below) and prints in the same
         parentheses, "(3)", so it never reads as a strum. */
      const held = !timed && c.held.length ? ` <span class="tab-count-held">(${escHtml(c.held.join(' '))})</span>` : '';
      countCells.push(`<div class="tab-count" data-seq="${off + ci}" aria-hidden="true">${escHtml(c.lab)}${held}</div>`);
      for (let k = 1; k < spanOf(ci); k++){
        const f = (c.fill && c.fill[k - 1]) || '';
        countCells.push(`<div class="tab-count tab-count-held" aria-hidden="true">${f ? '(' + escHtml(f) + ')' : ''}</div>`);
      }
    });
    for (let pi = used; pi < cols; pi++) countCells.push('<div class="tab-count" aria-hidden="true"></div>');
  }
  return `
      <div class="tab-grid" style="grid-template-columns:28px repeat(${cols},1fr)">
        <div class="tab-box" style="grid-column:2/${cols + 2};grid-row:1/7"></div>
        ${rows}
        ${noteBtns.join('')}
        ${countCells.join('')}
      </div>`;
}
/* The count each note STARTS on, worked out from its `beats`: "1" "2" "3"
   "4" on a beat, "+" on the half beat between. Anything finer (a triplet,
   a sixteenth) gets no label rather than a wrong one. `held` lists the
   beats a note rings through with no new strum — ca-29's strum on 2 in
   bar 2 holds through 3, shown as a grey "(3)" so the "+" after it reads as the "+" of
   3, not of 2 (Jonathan, 2026-10-21). On a timed TAB the held beat's own
   column prints the same "(3)" (a bare 3 read as "strum on 3"); the "+"
   columns stay empty. The notes start on beat 1 of a bar —
   true of every practice-card section (fromBar is a whole bar). */
function tabCounts(notes, beatsPerBar){
  const bpb = beatsPerBar > 0 ? beatsPerBar : 4;
  const EPS = 1e-6;
  const beatName = p => String((((Math.round(p) % bpb) + bpb) % bpb) + 1);
  let pos = 0;
  return notes.map(n => {
    const len = n.beats > 0 ? n.beats : 1;
    const inBar = ((pos % bpb) + bpb) % bpb;
    let lab = '';
    if (Math.abs(inBar - Math.round(inBar)) < EPS) lab = beatName(inBar);
    else if (Math.abs(inBar * 2 - Math.round(inBar * 2)) < EPS) lab = '+';
    const held = [];
    for (let b = Math.floor(pos + EPS) + 1; b < pos + len - EPS; b++) held.push(beatName(b));
    /* span: how many eighth-note columns the note fills on a timed TAB
       (null when its length isn't a whole number of eighths — a triplet —
       and the TAB falls back to one column a note). fill: the count under
       each column after the first — a beat number on a beat, '' on a "+". */
    const halves = len * 2, span = Math.abs(halves - Math.round(halves)) < EPS && halves >= 1 ? Math.round(halves) : null;
    const fill = [];
    for (let k = 1; span && k < span; k++){
      const p = pos + k / 2;
      fill.push(Math.abs(p - Math.round(p)) < EPS ? beatName(p) : '');
    }
    const start = pos;
    pos += len;
    return { lab, held, span, fill, start };
  });
}
function renderTabBlock(notes, seqOffset, padTo, hideNames){
  if (!notes || !notes.length) return '';
  const off = seqOffset || 0;   // sequential index across phrases and systems — the beat cursor's address
  /* padTo: the note count of the longest phrase in this tab. Every phrase in a
     multi-phrase tab is laid out on the same column grid, so short phrases get
     trailing empty columns instead of a ragged right edge — the string lines
     just run on to the end, the way printed TAB does. When the widest phrase is
     itself long enough to wrap, perRow comes from its split and the short
     phrase pads to that. */
  const widest = Math.max(notes.length, padTo || 0);
  const perRow = Math.ceil(widest / Math.ceil(widest / TAB_MAX_COLS));
  const grids = [];
  for (let s = 0; s < notes.length; s += perRow) {
    grids.push(renderTabSystem(notes.slice(s, s + perRow), off + s, perRow, hideNames));
  }
  return `
    <div class="tab-board">${grids.join('')}
    </div>`;
}
function buildTab(spec, opts){
  if (!spec) return '';
  const keyPrefix = (opts && opts.keyPrefix) || '';
  /* Header title: prefer explicit title; otherwise use caption as the header.
     If both are present and distinct, caption stays in the body. */
  const headTitle = (spec.title && tf(spec,'title')) || (spec.caption && tf(spec,'caption')) || t('tab.defaultTitle');
  const showCaptionInBody = !!spec.title && !!spec.caption && spec.title !== spec.caption;
  const headHtml = `<div class="tab-head"><span class="tab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span><span class="tab-title">${escHtml(headTitle)}</span><span class="tab-kind">${t('tab.label')}</span></div>`;
  const captionHtml = showCaptionInBody ? `<div class="tab-caption">${escHtml(tf(spec,'caption'))}</div>` : '';
  /* Collect all midis (across phrases if any) so the tab play-all walks the whole melody.
     A note can carry an optional beats:N (default 1) to hold longer than one beat —
     playSequence() reads that back off the { midi, beats } shape. */
  const toSeqEntry = n => {
    const midi = Array.isArray(n.midi) ? n.midi.map(Number) : Number(n.midi);
    return (n.beats && n.beats !== 1) ? { midi, beats: n.beats } : midi;
  };
  let allMidis = [];
  if (spec.phrases && spec.phrases.length) {
    spec.phrases.forEach(p => {
      if (p.notes && p.notes.length) allMidis = allMidis.concat(p.notes.map(toSeqEntry));
    });
  } else if (spec.notes && spec.notes.length) {
    allMidis = spec.notes.map(toSeqEntry);
  }
  /* revealDelay (ca-18, 2026-09-25 "the cure" rebuild, Jonathan: read the
     directions before the board distracts you): the tab stays hidden while
     the student reads the step text, then fades in on its own — see
     wrapTabReveal/caArmTabReveals. A reveal-delayed tab has no Play tab
     button either: there's no "watch it get played" demo any more, just the
     board and its per-note buttons, so there's nothing for Play to drive.
     opts.noRevealDelay (teacher.js's activity preview) keeps the button
     suppressed for parity but skips the hide-then-fade wrapper — the
     preview has no arming pass and Jonathan wants to see the board
     immediately when checking an activity, not wait out the same delay. */
  const hasRevealDelay = !!spec.revealDelay;
  let controlsHtml = '';
  if (allMidis.length && keyPrefix) {
    const defBpm = spec.bpm || 60;
    const minBpm = spec.minBpm || 40;
    const maxBpm = spec.maxBpm || 120;
    const bpm = readStoredBpm(keyPrefix, defBpm);
    const midisAttr = JSON.stringify(allMidis);
    /* The coach card shows this tab's exact fingering: collect the notes
       (across phrases if any) in the same order as allMidis. */
    let allTabNotes = [];
    if (spec.phrases && spec.phrases.length) spec.phrases.forEach(p => { if (p.notes) allTabNotes = allTabNotes.concat(p.notes); });
    else if (spec.notes) allTabNotes = spec.notes.slice();
    const tabNotesJson = JSON.stringify(allTabNotes.map(n =>
      n.frets ? { frets: n.frets, note: n.note, midi: n.midi }
              : { string: n.string, fret: n.fret, note: n.note, midi: n.midi }));
    // Held notes ({midi,beats}, from toSeqEntry) aren't one-pick-per-beat
    // either — same rationale as noCoach below.
    const hasHolds = allMidis.some(n => n && typeof n === 'object' && !Array.isArray(n));
    const showPlayAll = !hasRevealDelay;
    // noCoach: tabs with slurred notes (hammer-ons/pull-offs) aren't
    // one-pick-per-note, so a mic check would fail correct technique.
    // suppressCoach: this step already has a chord-check Coach button —
    // don't show a second one for the tab's note sequence.
    const showCoach = !(spec.noCoach || hasHolds || (opts && opts.suppressCoach));
    if (showPlayAll || showCoach) {
      controlsHtml = `<div class="tab-controls${spec.controlsBelow ? ' tab-controls--below' : ''}"><span class="bpm-control-group">` +
        (showPlayAll ? `<button type="button" class="play-seq-btn" data-midis="${escAttr(midisAttr)}" onclick="playSequenceFromGroup(this)" title="${escAttr(t('tab.playTabTitle'))}">&#x25B6; ${t('tab.playTab')}</button>` : '') +
        renderBpmControl(keyPrefix, bpm, minBpm, maxBpm) +
        (showCoach ? coachBtnHtml(midisAttr, tabNotesJson, undefined, !!spec.hideNames) : '') +
        `</span></div>`;
    }
  }
  /* controlsBelow (ca-21, Jonathan 2026-10-01): a sight-reading tab is read
     and played FIRST, and ▶ Play tab is the answer key afterwards — so the
     Play / BPM / Coach row sits under the board instead of above it, where
     it was the first thing a student pressed. Per tab, opt-in; every other
     tab keeps its controls on top. One builder, so both step renderers
     (caStepHtml, renderTeacherActivityDetail) get it. */
  const ctrlTop = spec.controlsBelow ? '' : controlsHtml;
  const ctrlBottom = spec.controlsBelow ? controlsHtml : '';
  const paged = buildPagedTabBody(spec, opts);
  let html;
  if (paged) {
    // data-total-notes: how many plucks this tab has in all, so a sibling
    // snippet (snipSyncTabPage) can work out notes-per-bar against its own
    // spec.bars without re-deriving it from the DOM's data-seq attributes.
    html = `<div class="tab tab--paged" data-total-notes="${allMidis.length}">${headHtml}<div class="tab-body">${captionHtml}${ctrlTop}${paged}${ctrlBottom}</div></div>`;
  } else if (spec.phrases && spec.phrases.length) {
    let seqOff = 0;
    const widest = spec.phrases.reduce((m, p) => Math.max(m, (p.notes || []).length), 0);
    const blocks = spec.phrases.map(p => {
      const block = `
      <div class="tab-phrase">
        ${p.label ? `<div class="tab-phrase-label">${escHtml(tf(p,'label'))}</div>` : ''}
        ${renderTabBlock(p.notes, seqOff, widest, !!spec.hideNames)}
      </div>`;
      seqOff += (p.notes || []).length;
      return block;
    }).join('');
    html = `<div class="tab">${headHtml}<div class="tab-body">${captionHtml}${ctrlTop}${blocks}${ctrlBottom}</div></div>`;
  } else {
    const body = renderTabBlock(spec.notes, 0, 0, !!spec.hideNames);
    if (!body) return '';
    html = `<div class="tab">${headHtml}<div class="tab-body">${captionHtml}${ctrlTop}${body}${ctrlBottom}</div></div>`;
  }
  return (hasRevealDelay && !(opts && opts.noRevealDelay)) ? wrapTabReveal(html, spec.revealDelay, keyPrefix) : html;
}
/* ── Strum pattern (a class-activity step's `strum` field, ca-46 —
   Jonathan, 2026-11-03: "draw the strum pattern … and just name the chords
   D5 C5, etc. instead of showing tab"). Each bar is eight slots, one per
   eighth note (1 + 2 + 3 + 4 +): a down arrow, an up arrow, a faint dot
   where the hand keeps moving but misses the strings, or nothing at all for
   '-', a stop — the hand waits for the next 1 (built for ca-47 on 2026-11-03;
   no card uses it since 2026-11-04, when ca-47's chunks went to dots so the
   hand never stops). The chord name sits
   over the first slot of its bar, the count under every slot.
     strum: { caption, caption_es, pattern: 'D.DU.UDU', bpm?,
              chords: { D5: { frets: [['A',5],['D',7],['G',7]], midi: [50,57,62] } },
              bars: ['D5', 'C5', …] }        // one chord name per bar
   It is a `.tab` on purpose, so it gets the tab's header, ▶ Play / BPM row
   and the playSequence cursor (`[data-seq]` + .beat-now) for free — no new
   audio code. Each strum is one sequence entry that rings until the next
   strum (a missed slot adds half a beat), so the sound is the pattern and
   the cursor lands on every arrow. ONE builder, called by both step
   renderers (caStepHtml in app.js, renderTeacherActivityDetail in
   teacher.js) — checks.mjs 1d pins both calls. */
const STRUM_SLOTS = 8;   // eighth notes in a 4/4 bar
const STRUM_COUNT = ['1', '+', '2', '+', '3', '+', '4', '+'];
const STRUM_BARS_PER_ROW = 2;
function strumSequence(spec){
  /* [{ bar, slot, dir, midi, beats }] — one per strum, in order. */
  const pat = String(spec.pattern || '');
  const bars = Array.isArray(spec.bars) ? spec.bars : [];
  const hits = [];
  bars.forEach((name, b) => {
    for(let k = 0; k < STRUM_SLOTS; k++){
      const c = pat[k];
      if(c !== 'D' && c !== 'U') continue;
      const ch = spec.chords && spec.chords[name];
      hits.push({ bar: b, slot: k, dir: c, midi: ch && Array.isArray(ch.midi) ? ch.midi.map(Number) : [], at: b * STRUM_SLOTS + k });
    }
  });
  const end = bars.length * STRUM_SLOTS;
  hits.forEach((h, i) => { h.beats = ((i + 1 < hits.length ? hits[i + 1].at : end) - h.at) / 2; });
  return hits;
}
/* ▶ Play clicks (Jonathan, 2026-11-04: "each one should have a play clicks
   option too", then "could play clicks just open the metronome on the site at
   60bpm?"), later at the card's own BPM slider: opens the rail's Metronome tool at the
   slider's tempo (60 if there is none) in 4/4 and starts it.
   It is the student's tool from then on — their own Start/Stop and slider —
   so nothing here stops it (the same rule as caAutoStartMetro). Play strum
   stops first so the two never sound together. The teacher console preview
   does nothing: the tool sits in the hidden student page, so a metronome
   started there would click with no Stop on screen. */
const STRUM_METRO_BPM = 60;
/* ▶ Play strum (Jonathan, 2026-11-04: "the play strum should have clicks going
   the whole time too to make it clear. the downstrums could have slight
   accents as well"): a click on every beat from the button's data-clicks
   count, every click the same like the Metronome's (2026-11-09; beat 1 was
   higher until then), and each down strum a little louder than each up strum.
   A running Metronome stops when it starts (playSequence). */
const STRUM_DOWN_GAIN = 1.25;
const STRUM_UP_GAIN = 0.8;
const STRUM_CLICK_GAIN = 1.2;
function strumOpenMetro(btn){
  if(typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE) return;
  stopPlaySeq();
  /* The card's own BPM slider sets the tempo; STRUM_METRO_BPM is only the fallback. */
  const wanted = btn ? readGroupBpm(btn, STRUM_METRO_BPM) : STRUM_METRO_BPM;
  const slider = document.getElementById('bpm-slider');
  const pop = document.getElementById('metro-popup');
  if(!slider || !pop || typeof startMetro !== 'function' || typeof togglePopup !== 'function') return;
  /* One tick later: fab-tools.js closes every tool popup on a click outside
     them, and its listener runs after this button's handler — opening here
     would be undone by the very click that opened it. */
  setTimeout(() => { if(!pop.classList.contains('open')) togglePopup('metro'); }, 0);
  slider.value = wanted;
  onBpmSlider(String(slider.value));
  if(typeof setMetroMeter === 'function' && typeof getMetroMeter === 'function' && getMetroMeter() !== 4) setMetroMeter(4);
  if(!metroRunning) startMetro();
}
function buildStrum(spec, opts){
  if(!spec || !Array.isArray(spec.bars) || !spec.bars.length) return '';
  const keyPrefix = (opts && opts.keyPrefix) || '';
  const hits = strumSequence(spec);
  const seqOf = {};
  hits.forEach((h, i) => { seqOf[h.at] = i; });
  const title = (spec.caption && tf(spec, 'caption')) || t('strum.label');
  const headHtml = `<div class="tab-head"><span class="tab-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg></span><span class="tab-title">${escHtml(title)}</span><span class="tab-kind">${t('strum.label')}</span></div>`;
  let controlsHtml = '';
  if(hits.length && keyPrefix){
    const bpm = readStoredBpm(keyPrefix, spec.bpm || 60);
    const midis = hits.map(h => ({ midi: h.midi, beats: h.beats, down: h.dir === 'D' }));
    controlsHtml = `<div class="tab-controls"><span class="bpm-control-group">`
      + `<button type="button" class="play-seq-btn" data-midis="${escAttr(JSON.stringify(midis))}" data-clicks="${spec.bars.length * 4}" onclick="playSequenceFromGroup(this)" title="${escAttr(t('strum.playTitle'))}">&#x25B6; ${t('strum.play')}</button>`
      + `<button type="button" class="play-seq-btn strum-clicks-btn" onclick="strumOpenMetro(this)" title="${escAttr(t('strum.clicksTitle'))}">&#x25B6; ${t('strum.clicks')}</button>`
      + renderBpmControl(keyPrefix, bpm, spec.minBpm || 40, spec.maxBpm || 125)
      + `</span></div>`;
  }
  const pat = String(spec.pattern || '');
  const rows = [];
  /* `barsPerRow: 4` on the spec (ca-46's eight-bar chord step, 2026-11-04):
     a row per two chords, so eight bars read as a chord chart and fit a
     657px screen; the default is two. checks.mjs 1d allows 1, 2 or 4. */
  const perRow = [1, 2, 4].includes(Number(spec.barsPerRow)) ? Number(spec.barsPerRow) : STRUM_BARS_PER_ROW;
  for(let b0 = 0; b0 < spec.bars.length; b0 += perRow){
    const cells = [];
    for(let b = b0; b < Math.min(b0 + perRow, spec.bars.length); b++){
      for(let k = 0; k < STRUM_SLOTS; k++){
        const at = b * STRUM_SLOTS + k;
        const c = pat[k];
        const seq = seqOf[at];
        const seqAttr = seq === undefined ? '' : ` data-seq="${seq}"`;
        const stop = c === '-';
        const dirWord = c === 'D' ? t('strum.down') : c === 'U' ? t('strum.up') : stop ? t('strum.stop') : t('strum.miss');
        const arrow = c === 'D' ? '&#x2193;' : c === 'U' ? '&#x2191;' : stop ? '' : '&middot;';
        cells.push(`<div class="strum-cell${k === 0 ? ' strum-cell--bar' : ''}${seq === undefined ? ' strum-cell--miss' : ''}${stop ? ' strum-cell--stop' : ''}"${seqAttr}>`
          + `<span class="strum-chord">${k === 0 ? escHtml(String(spec.bars[b])) : ''}</span>`
          + `<span class="strum-dir" role="img" aria-label="${escAttr(dirWord)}">${arrow}</span>`
          + `<span class="strum-count">${STRUM_COUNT[k]}</span></div>`);
      }
    }
    rows.push(`<div class="strum-row" style="--strum-cols:${cells.length}">${cells.join('')}</div>`);
  }
  return `<div class="tab tab--strum">${headHtml}<div class="tab-body">${controlsHtml}<div class="strum-board">${rows.join('')}</div></div></div>`;
}
/* Hides a just-built tab (`wrapTabReveal`) until caArmTabReveals() has let
   its `revealDelay` seconds pass, then fades it in. `hidden` short-circuits
   the animation while it's off-screen; body.print-activity overrides it
   (styles.css) the same way a paged tab's other pages do, so printing shows
   the board immediately rather than a blank box. */
/* `revealDelay` is SECONDS in the content (`revealDelay: 10`); setTimeout
   wants ms. Until 2026-09-25 the value went through unconverted, so every
   reveal-delayed tab appeared after 10 milliseconds and the feature did
   nothing.

   `key` (the tab's keyPrefix) lets a tab the student has already waited out
   stay revealed across the re-renders that aren't navigation — a language
   switch, coming back to the browser tab (visibilitychange), Mark done —
   instead of blanking for another countdown. caRevealedTabs is cleared on a
   Focus-view step move, so going back to a step still restarts its own
   countdown, as described below. */
const caRevealedTabs = new Set();
function wrapTabReveal(html, sec, key){
  const ms = Math.max(0, Number(sec) || 0) * 1000;
  return `<div class="tab-reveal" data-reveal-delay="${ms}" data-reveal-key="${escAttr(key || '')}" hidden>${html}</div>`;
}
/* Arms every not-yet-revealed tab under root that's actually visible — called
   at the end of renderClassActivities() AND from caOnToggle() when a card
   opens. Focus-view step navigation re-renders the whole page while the card
   is open, so returning to a step re-arms its tab and restarts its own
   countdown, same as before.

   A tab inside a CLOSED accordion card is skipped here on purpose (found
   2026-09-25): the render pass writes every card's markup regardless of
   which are open, so arming unconditionally started the countdown the
   moment the page rendered, not when the student actually opened the card.
   A student who opened a card more than revealDelay seconds after landing
   on the page found its tab already revealed — the "read the directions
   first" delay had silently expired while the card sat closed. caOnToggle()
   re-arms the card's own tabs at the moment it actually opens instead. */
function caArmTabReveals(root){
  if (!root) return;
  root.querySelectorAll('.tab-reveal[hidden]').forEach(el => {
    const details = el.closest('details');
    if (details && !details.open) return;
    if (el.dataset.revealArmed) return;
    el.dataset.revealArmed = '1';
    const key = el.dataset.revealKey;
    if (key && caRevealedTabs.has(key)) {
      el.removeAttribute('hidden');
      el.classList.add('tab-revealed');
      return;
    }
    const ms = Number(el.dataset.revealDelay) || 0;
    setTimeout(() => {
      if (key) {
        caRevealedTabs.add(key);
        /* A re-render mid-countdown (language switch at 5 s) replaced `el`
           with a new node that started its own full wait; reveal that one
           now too, so the tab still appears on the original schedule. */
        document.querySelectorAll('.tab-reveal[hidden]').forEach(o => {
          if (o !== el && o.dataset.revealKey === key) {
            o.removeAttribute('hidden');
            o.classList.add('tab-revealed');
          }
        });
      }
      el.removeAttribute('hidden');
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('tab-revealed')));
    }, ms);
  });
}
/* ── Paged tab: `linesPerPage: N` on a tab spec (Jonathan, 2026-09-25,
   ca-18: "too much on this page … show a couple lines at a time and
   highlight the notes that students should play").

   A "line" is one rendered row of tab — one renderTabSystem() grid, the
   thing a student reads left to right — not a phrase: a 32-note verse is
   one phrase but four rows. The rows are cut exactly the way
   renderTabBlock() cuts them (same widest-phrase column count), then dealt
   N to a page. Only one page shows, with Previous / Next above it; a
   phrase label repeats at the top of any page its rows are on, so a
   student never lands on a row with no name over it.

   Play tab follows along: playSequence() lights the sounding note as
   always (the beat cursor) and turns to the page that holds it — half a
   note early at a page's last note, so the next line is up before its
   first note is due (tabPageOf/tabShowPage). data-seq numbering is the
   same as the unpaged tab, so the cursor, the Coach and the BPM key are
   untouched. Returns '' when the tab fits on one page — the caller then
   renders it the usual way. Print shows every page (styles.css). */
/* The class-activity default (Jonathan, 2026-09-25: "apply this to upcoming
   class activities as well"). Every class-activity tab longer than this many
   rows pages at this many — caStepHtml() and teacher.js's
   renderTeacherActivityDetail() both pass it as opts.defaultLinesPerPage, so
   a new activity inherits it without saying anything. A tab that sets its own
   `linesPerPage` wins; `linesPerPage: 0` opts one tab out. Module lessons and
   exit checks don't pass it and render as before. checks.mjs 1bb pins both
   renderers passing it. */
const CA_TAB_LINES_PER_PAGE = 2;
function buildPagedTabBody(spec, opts){
  const own = spec && spec.linesPerPage;
  const per = Math.floor(Number(own !== undefined && own !== null ? own : ((opts && opts.defaultLinesPerPage) || 0)) || 0);
  if (per <= 0) return '';
  const phrases = (spec.phrases && spec.phrases.length) ? spec.phrases
    : (spec.notes && spec.notes.length ? [{ notes: spec.notes }] : []);
  if (!phrases.length) return '';
  const widest = phrases.reduce((m, p) => Math.max(m, (p.notes || []).length), 0);
  const perRow = Math.ceil(widest / Math.ceil(widest / TAB_MAX_COLS));
  const rows = [];   // { pi, grid }
  let seqOff = 0;
  phrases.forEach((p, pi) => {
    const notes = p.notes || [];
    for (let s = 0; s < notes.length; s += perRow) {
      rows.push({ pi, grid: renderTabSystem(notes.slice(s, s + perRow), seqOff + s, perRow, !!spec.hideNames) });
    }
    seqOff += notes.length;
  });
  if (rows.length <= per) return '';
  const pages = [];
  for (let s = 0, k = 0; s < rows.length; s += per, k++) {
    const slice = rows.slice(s, s + per);
    const groups = [];
    slice.forEach(row => {
      const g = groups[groups.length - 1];
      if (g && g.pi === row.pi) g.grids.push(row.grid);
      else groups.push({ pi: row.pi, grids: [row.grid] });
    });
    const inner = groups.map(g => {
      const p = phrases[g.pi];
      return `
      <div class="tab-phrase">
        ${p.label ? `<div class="tab-phrase-label">${escHtml(tf(p,'label'))}</div>` : ''}
        <div class="tab-board">${g.grids.join('')}
        </div>
      </div>`;
    }).join('');
    pages.push(`<div class="tab-page" data-page="${k}"${k ? ' hidden' : ''}>${inner}</div>`);
  }
  const pagerHtml = `<div class="tab-pager" data-total="${pages.length}">`
    + `<button type="button" class="tab-pager-btn" onclick="tabPageStep(this,-1)" disabled>&#x25C0; ${escHtml(t('tab.pagePrev'))}</button>`
    + `<span class="tab-pager-label" aria-live="polite">${escHtml(t('tab.pageOf', {a: 1, n: pages.length}))}</span>`
    + `<button type="button" class="tab-pager-btn" onclick="tabPageStep(this,1)">${escHtml(t('tab.pageNext'))} &#x25B6;</button>`
    + `</div>`;
  return pagerHtml + pages.join('');
}
/* Show page k of a paged tab (clamped) and keep the pager in step. */
function tabShowPage(tabEl, k){
  if(!tabEl) return;
  const pages = tabEl.querySelectorAll('.tab-page');
  if(!pages.length) return;
  k = Math.max(0, Math.min(pages.length - 1, k));
  pages.forEach((p, i) => { p.hidden = i !== k; });
  const pager = tabEl.querySelector('.tab-pager');
  if(!pager) return;
  const label = pager.querySelector('.tab-pager-label');
  if(label) label.textContent = t('tab.pageOf', {a: k + 1, n: pages.length});
  const btns = pager.querySelectorAll('.tab-pager-btn');
  if(btns[0]) btns[0].disabled = k === 0;
  if(btns[1]) btns[1].disabled = k === pages.length - 1;
}
function tabPageStep(btn, dir){
  const tabEl = btn.closest('.tab');
  if(!tabEl) return;
  const pages = Array.from(tabEl.querySelectorAll('.tab-page'));
  const cur = pages.findIndex(p => !p.hidden);
  const k = Math.max(0, Math.min(pages.length - 1, (cur < 0 ? 0 : cur) + dir));
  tabShowPage(tabEl, k);
  /* Keep the snippet's page-sync cache (snipSyncTabPage) in step with a
     manual Prev/Next — it used to only ever get written by the snippet loop
     itself, so a manual page-turn left it stale: the loop's next computed
     page could coincidentally match the STALE cached value and skip turning
     the page back, silently freezing the tab on the wrong two lines while
     the band kept playing. Found 2026-09-26. Harmless no-op on a tab with no
     snippet sibling — nothing ever reads the attribute in that case. */
  tabEl.dataset.snipPage = String(k);
}
/* The page holding beat `seq`, or -1 when the tab isn't paged. */
function tabPageOf(tabEl, seq){
  const hit = tabEl && tabEl.querySelector(`.tab-page [data-seq="${seq}"]`);
  const page = hit && hit.closest('.tab-page');
  return page ? Number(page.dataset.page) : -1;
}

