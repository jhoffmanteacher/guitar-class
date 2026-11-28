/* ══ SPOT THE MISTAKE — the site plays a practice card's line with ONE thing wrong; the student taps where ══════════
   (step.drill, type 'spot'; Jonathan, 2026-11-27, WORK-ORDER-spot-record-wording Part 2; ca-57. The design is
   skill in-class-activities shapes/15-spot-the-mistake.md, which was proposal P3.) A listening drill that gives a real
   score without the mic: NOTHING here listens. The answer is a tap, so it works in a loud room and with no guitar.

   THE LINE is one lap of a section of a practice card, read by reference (pcLayout, app/cards.js: nothing copied, so a
   change to the card moves the drill too):
     notes   drill: { type:'spot', card:'ca-10', section:'The riff', rounds:10 }
             the section's tab as written, one column a note; a position is a note.
     chords  drill: { type:'spot', card:'ca-29', section:'Verse 1', chords:true, rounds:10 }
             the section's chords on eighth-note columns (the chord grid's layout, a count row under it); a position is
             one chord of the line (consecutive strums of the same chord are one chord: Verse 1 is A5 G5 F5 G5).
   spotModel refuses anything it cannot draw or change (checks.mjs 1fs renders every spot drill and fails on a null).

   THE MISTAKE is made by a rule here, never typed into the data (spotPick, pure, its random source passed in):
     notes   one note moves one or two frets up or down ON ITS OWN STRING (never below fret 0, never above
             SPOT_MAX_FRET), so it is never the same pitch;
     chords  one chord is played as another chord of the same line (the chords the student sees on the page), never
             one with the same notes.
   A fresh Math.random per round; never the position the round before changed.

   ONE ROUND: a bar of count-in clicks (pcClick, app/cards.js), then the line once at the card's Slower tempo (the slow
   file's BPM; a one-file track at the Slower stop's rate), the site's own recorded guitar notes (playNote), no click.
   The student taps a column (or a chord). Taps before the line's first note are ignored. A tap while the line plays
   stops it. "Play again" replays the same mistake, at most SPOT_REPLAYS times a round (the research report: more
   listens raise false alarms). Right: the column flashes green and the wrong note (or chord), then the right one,
   play. Wrong: the tapped column turns red and the right one is outlined. Ten rounds (`rounds`), a streak, and
   SPOT_PASS_SHARE of them to pass ("8 of 10", the pass line under Start, as chordcall shows its own).

   Nothing is saved: the round dots and the streak are on screen only, and the step is ticked by the Focus view's own
   "Got it — next step", like every other drill step. Everything started here (every scheduled note and click, the
   timers) is stopped by spotStop, and every way out reaches it: stopCardAudio (app/audio-ui.js), a card closing
   (caStopRoundsIn, app/activities-2.js), a hidden tab (app/activities-list.js), a rebuild of the step (renderSpot),
   and a timer that finds the box gone from the page. node tools/stop-loop.mjs walks it (start 'spot@card'). */
const SPOT_ROUNDS = 10;            // rounds when the data gives none
const SPOT_PASS_SHARE = 0.8;       // 8 of 10
const SPOT_REPLAYS = 2;            // "Play again" presses a round, at most
const SPOT_MAX_FRET = 15;          // a moved note stays at or under this fret
const SPOT_LEAD = 0.1;             // seconds from the press to the first count-in click
const SPOT_DAMP_TC = 0.025;        // a note damps the one before it (playSequence's PLAY_SEQ_DAMP_TC)
const SPOT_REVEAL_GAP = 0.75;      // seconds between the wrong and the right note of the reveal
const spots = {};

function spotBox(key){ return document.getElementById('spotr-' + key); }

/* The card's Slower tempo: the slow file's BPM, or a one-file track at the Slower stop's rate (pcSpeed3Html). */
function spotBpm(tr){
  if(tr.srcSlow && tr.trackBpmSlow > 0) return tr.trackBpmSlow;
  return Math.round(tr.trackBpm * PC_ONE_FILE_RATES[1]);
}
/* Pure: everything about one drill that does not move, or null. */
function spotModel(drill){
  if(!drill || drill.type !== 'spot') return null;
  const act = (window.CLASS_ACTIVITIES || []).find(x => x.id === drill.card);
  const L = act && pcLayout(act);
  if(!L) return null;
  const S = L.sections.find(x => x.s.label === drill.section);
  if(!S || !S.notes.length) return null;
  const bpb = L.tr.beatsPerBar > 0 ? L.tr.beatsPerBar : 4;
  const chords = drill.chords === true;
  const rounds = drill.rounds === undefined ? SPOT_ROUNDS : drill.rounds;
  if(!Number.isInteger(rounds) || rounds < 1 || rounds > 20) return null;
  const notes = [];
  let pos = 0;
  for(const n of S.notes){
    const beats = n.beats > 0 ? n.beats : 1;
    if(n.rest) notes.push({ rest: true, start: pos, beats });
    else {
      const midi = (Array.isArray(n.midi) ? n.midi : [n.midi]).map(Number);
      if(!midi.length || midi.some(m => !(m > 0))) return null;
      if(chords){
        if(!Array.isArray(n.frets) || !n.frets.length || !n.note) return null;
        notes.push({ name: n.note, frets: n.frets, midi, start: pos, beats });
      } else {
        if(Array.isArray(n.frets) || !TAB_STRINGS.includes(n.string) || !Number.isInteger(n.fret) || midi.length !== 1) return null;
        notes.push({ name: n.note || '', frets: [[n.string, n.fret]], string: n.string, fret: n.fret, midi, start: pos, beats });
      }
    }
    pos += beats;
  }
  const total = pos;
  /* The positions: a note each (notes); a run of the same chord each (chords). `from`..`to` are indexes in `notes`. */
  const items = [];
  notes.forEach((n, i) => {
    if(n.rest) return;
    const last = items[items.length - 1];
    if(chords && last && last.to === i - 1 && last.name === n.name) last.to = i;
    else items.push({ name: n.name, from: i, to: i, midi: n.midi, frets: n.frets, string: n.string, fret: n.fret });
  });
  if(items.length < 2) return null;
  let choices = null;
  if(chords){
    /* Chord columns are eighths: every strum must start on one. */
    if(notes.some(n => Math.abs(n.start * 2 - Math.round(n.start * 2)) > 1e-6)) return null;
    choices = [];
    items.forEach(it => { if(!choices.some(c => c.name === it.name)) choices.push({ name: it.name, midi: it.midi, frets: it.frets }); });
    if(choices.length < 2) return null;
  }
  return { act, L, S, bpb, chords, notes, items, choices, total, rounds, passAt: Math.ceil(rounds * SPOT_PASS_SHARE),
           bpm: spotBpm(L.tr), song: (tf(act, 'title') || '').split(' — ')[0] };
}
/* Pure: the same pitch set? (A chord swapped for one with the same notes would not be a mistake.) */
function spotSameNotes(a, b){
  const x = a.slice().sort((p, q) => p - q), y = b.slice().sort((p, q) => p - q);
  return x.length === y.length && x.every((m, i) => m === y[i]);
}
/* Pure: this round's mistake. `prev` is the position the round before changed (-1 for none); `rnd` returns [0, 1).
   { pos, midi, fret?, name? } — the changed position and what plays there instead. */
function spotPick(M, prev, rnd){
  const r = typeof rnd === 'function' ? rnd : Math.random;
  const any = k => Math.min(k - 1, Math.floor(r() * k));
  const open = [];
  M.items.forEach((it, i) => { if(i !== prev && spotOptions(M, it).length) open.push(i); });
  if(!open.length) return null;
  const pos = open[any(open.length)];
  const opts = spotOptions(M, M.items[pos]);
  return Object.assign({ pos }, opts[any(opts.length)]);
}
/* Pure: every wrong version of one position. */
function spotOptions(M, it){
  if(M.chords) return M.choices.filter(c => c.name !== it.name && !spotSameNotes(c.midi, it.midi)).map(c => ({ name: c.name, midi: c.midi.slice(), frets: c.frets }));
  return [-2, -1, 1, 2].map(d => it.fret + d).filter(f => f >= 0 && f <= SPOT_MAX_FRET)
    .map(f => ({ fret: f, midi: [it.midi[0] + (f - it.fret)] }));
}
/* Pure: the line as played, { at (beats from its first note), beats, midi }, with the mistake in it; a rest is midi []. */
function spotLine(M, wrong){
  const it = wrong ? M.items[wrong.pos] : null;
  return M.notes.map((n, i) => ({ at: n.start, beats: n.beats, midi: n.rest ? [] : (it && i >= it.from && i <= it.to ? wrong.midi : n.midi) }));
}

function renderSpot(drill, key){
  const prev = spots[key];
  if(prev) spotStop(key);
  const M = spotModel(drill);
  if(!M) return '';
  spots[key] = { key, drill, M, phase: 'setup', idx: 0, res: [], streak: 0, best: 0, prevPos: -1, wrong: null,
                 left: SPOT_REPLAYS, playing: false, answer: null, part: '', timers: [], clicks: [], voices: [] };
  return `<div class="sdr spotr" id="spotr-${escAttr(key)}" onclick="spotDown(event)">${spotScreenHtml(key)}</div>`;
}
function spotScreenHtml(key){
  const st = spots[key];
  if(!st) return '';
  return st.phase === 'done' ? spotDoneHtml(st) : st.phase === 'round' ? spotRoundHtml(st) : spotSetupHtml(st);
}
function spotHeadHtml(st, meta){
  return `<div class="sdr-head"><span>${escHtml(t('spot.head', { song: st.M.song, section: tf(st.M.S.s, 'label') }))}</span>` +
    `<span class="sdr-meta">${escHtml(meta)}</span></div>`;
}
/* The line on a six-string tab, drawn here rather than by renderTabSystem / the chord grid: those carry the card's
   play-a-note buttons, and here a tap on a column is the answer. Every cell is placed by grid-row and grid-column;
   the tap targets are absolutely placed over their columns (`live`: a round waiting for a tap). */
function spotLineHtml(st, live){
  const M = st.M;
  const sub = 2;
  const colOf = n => M.chords ? Math.round(n.start * sub) : M.notes.indexOf(n);
  const cols = M.chords ? Math.round(M.total * sub) : M.notes.length;
  const cells = [];
  TAB_STRINGS.forEach((lab, r) => {
    cells.push(`<div class="tab-str-label" style="grid-row:${r + 1};grid-column:1">${lab}</div>`);
    const at = {};
    M.notes.forEach(n => { if(!n.rest) at[colOf(n)] = n; });
    for(let c = 0; c < cols; c++){
      const n = at[c], hit = n ? n.frets.find(([s]) => s === lab) : null;
      cells.push(`<div class="tab-cell" style="grid-row:${r + 1};grid-column:${c + 2}">` + (hit ? `<span class="tab-fret">${escHtml(String(hit[1]))}</span>` : '') + `</div>`);
    }
  });
  if(M.chords) for(let c = M.bpb * sub; c < cols; c += M.bpb * sub) cells.push(`<div class="tab-bar-line" style="grid-column:${c + 2};grid-row:1/7" aria-hidden="true"></div>`);
  // The name row: each note's name (notes), each chord's name where it starts (chords).
  M.items.forEach(it => { cells.push(`<span class="spot-name" style="grid-row:7;grid-column:${colOf(M.notes[it.from]) + 2}">${escHtml(it.name)}</span>`); });
  if(M.chords){
    for(let c = 0; c < cols; c++){
      const beat = c % sub === 0;
      cells.push(`<div class="tab-count${beat ? '' : ' tab-count-held'}" style="grid-row:8;grid-column:${c + 2}" aria-hidden="true">${beat ? (c / sub) % M.bpb + 1 : '+'}</div>`);
    }
  }
  const ans = st.answer;
  M.items.forEach((it, i) => {
    const c0 = colOf(M.notes[it.from]);
    const last = M.notes[it.to];
    const c1 = M.chords ? Math.round((last.start + last.beats) * sub) : colOf(last) + 1;
    let cls = '';
    if(ans){
      if(i === ans.pick) cls = ans.right ? ' spot-hit' : ' spot-miss';
      else if(i === st.wrong.pos) cls = ' spot-ans';
    }
    const area = `grid-row:1/${M.chords ? 9 : 8};grid-column:${c0 + 2}/${c1 + 2}`;
    const lab = escAttr(t(M.chords ? 'spot.colChord' : 'spot.colNote', { n: i + 1, name: it.name }));
    cells.push(live
      ? `<button type="button" class="spot-col${cls}" style="${area}" data-spot-pick="${i}" aria-label="${lab}" title="${lab}"></button>`
      : (cls ? `<div class="spot-col${cls}" style="${area}" aria-hidden="true"></div>` : ''));
  });
  return `<div class="tab spot-tab${M.chords ? ' spot-chords' : ''}"><div class="tab-body"><div class="tab-board">` +
    `<div class="tab-grid${M.chords ? ' chord-grid' : ''} spot-grid" style="grid-template-columns:28px repeat(${cols},1fr)">` +
    `<div class="tab-box" style="grid-column:2/${cols + 2};grid-row:1/7"></div>` + cells.join('') + `</div></div></div></div>`;
}
function spotDotsHtml(st){
  return `<div class="fret-dots spot-dots">` + Array.from({ length: st.M.rounds }, (_, i) => {
    const r = st.res[i];
    return `<span class="fret-dot${r === 'hit' ? ' hit' : r === 'miss' ? ' miss' : i === st.idx && st.phase === 'round' ? ' cur' : ''}"></span>`;
  }).join('') + `</div>`;
}
function spotSetupHtml(st){
  const M = st.M;
  return spotHeadHtml(st, t('spot.meta', { total: M.rounds, bpm: M.bpm })) +
    `<div class="sdr-body">` +
      `<div class="sdr-intro">${escHtml(t(M.chords ? 'spot.introChords' : 'spot.introNotes', { pass: M.passAt, total: M.rounds }))}</div>` +
      spotLineHtml(st, false) +
      `<div class="sdr-actions"><button type="button" class="sdr-start" data-spot-start="1">&#x25B6; ${escHtml(t('spot.start'))}</button></div>` +
      `<div class="sdr-best">${escHtml(t('spot.pass', { pass: M.passAt, total: M.rounds }))}</div>` +
    `</div>`;
}
function spotCueText(st){
  if(st.answer) return '';
  if(st.playing) return t(st.part === 'count' ? 'spot.countIn' : 'spot.listen');
  return t('spot.pick');
}
function spotFeedback(st){
  const a = st.answer;
  if(!a) return '';
  const M = st.M, it = M.items[st.wrong.pos];
  const vars = M.chords ? { n: st.wrong.pos + 1, wrong: st.wrong.name, right: it.name } : { n: st.wrong.pos + 1, wrong: st.wrong.fret, right: it.fret };
  return t((a.right ? 'spot.fbHit' : 'spot.fbMiss') + (M.chords ? 'Chord' : 'Note'), vars);
}
function spotRoundHtml(st){
  const M = st.M, a = st.answer, last = st.idx >= M.rounds - 1;
  const meta = t('spot.round', { n: st.idx + 1, total: M.rounds }) + ' · ' + t('spot.streak', { n: st.streak });
  const replay = a ? '' : `<button type="button" class="sdr-btn2" data-spot-replay="1"${st.left > 0 && !st.playing ? '' : ' disabled'}>${escHtml(t('spot.replay', { n: st.left }))}</button>`;
  const next = a ? `<button type="button" class="sdr-start" data-spot-next="1">&#x25B6; ${escHtml(t(last ? 'spot.finish' : 'spot.next'))}</button>` : '';
  return spotHeadHtml(st, meta) +
    `<div class="sdr-body spot-round">` +
      `<div class="spot-cue" id="spot-cue-${escAttr(st.key)}" aria-live="polite">${escHtml(spotCueText(st))}</div>` +
      spotLineHtml(st, !a) +
      `<div class="sdr-fb nc-fb spot-fb${a ? (a.right ? ' hit' : ' miss') : ''}" aria-live="polite">${escHtml(spotFeedback(st))}</div>` +
      `<div class="sdr-actions">${next}${replay}<button type="button" class="sdr-btn2" data-spot-stop="1">${escHtml(t('spot.stop'))}</button></div>` +
      spotDotsHtml(st) +
    `</div>`;
}
function spotDoneHtml(st){
  const M = st.M, n = st.res.filter(r => r === 'hit').length, pass = n >= M.passAt;
  return spotHeadHtml(st, t('spot.meta', { total: M.rounds, bpm: M.bpm })) +
    `<div class="sdr-body">` +
      `<div class="sdr-score">${escHtml(t('spot.score', { n, total: M.rounds }))}</div>` +
      `<div class="sdr-score-sub">${escHtml(t('spot.bestStreak', { n: st.best }))}</div>` +
      `<div class="sdr-verdict ${pass ? 'good' : 'mid'}">${escHtml(pass ? t('spot.verdictPass', { n, total: M.rounds }) : t('spot.verdictAgain', { pass: M.passAt, total: M.rounds }))}</div>` +
      `<div class="sdr-actions"><button type="button" class="sdr-start" data-spot-start="1">&#x25B6; ${escHtml(t('spot.again'))}</button></div>` +
      spotDotsHtml(st) +
    `</div>`;
}
function spotRepaint(key){ const b = spotBox(key); if(b) b.innerHTML = spotScreenHtml(key); }

/* One click handler for the whole drill (no inline arguments: the box's id names it). */
function spotDown(ev){
  const box = ev.currentTarget;
  const el = ev.target && ev.target.closest ? ev.target.closest('[data-spot-start],[data-spot-stop],[data-spot-replay],[data-spot-next],[data-spot-pick]') : null;
  if(!el || !box || el.disabled) return;
  const key = box.id.replace(/^spotr-/, '');
  const st = spots[key];
  if(!st) return;
  if(el.hasAttribute('data-spot-stop')) return spotQuit(key);
  if(el.hasAttribute('data-spot-start')) return spotBegin(key);
  if(el.hasAttribute('data-spot-next')) return spotNext(key);
  if(el.hasAttribute('data-spot-replay')) return spotReplay(key);
  if(el.hasAttribute('data-spot-pick')) return spotTap(key, parseInt(el.getAttribute('data-spot-pick'), 10));
}
/* Start (or Go again): ten fresh rounds, the first one playing at once. */
function spotBegin(key){
  const st = spots[key];
  if(!st) return;
  spotStop(key);
  Object.assign(st, { phase: 'round', idx: 0, res: [], streak: 0, best: 0, prevPos: -1 });
  spotNewRound(st);
}
function spotNewRound(st){
  st.wrong = spotPick(st.M, st.prevPos);
  st.prevPos = st.wrong ? st.wrong.pos : -1;
  st.left = SPOT_REPLAYS;
  st.answer = null;
  spotPlay(st);
}
function spotNext(key){
  const st = spots[key];
  if(!st || st.phase !== 'round' || !st.answer) return;
  spotStop(key);
  if(st.idx >= st.M.rounds - 1){ st.phase = 'done'; return spotRepaint(key); }
  st.idx++;
  spotNewRound(st);
}
function spotReplay(key){
  const st = spots[key];
  if(!st || st.phase !== 'round' || st.answer || st.playing || st.left <= 0) return;
  st.left--;
  spotPlay(st);
}
/* The line with this round's mistake: a bar of count-in, then the notes, each damping the one before. */
function spotPlay(st){
  if(window.coachMicLive) return;              // never play into a live mic (as pcStart, chcStart, echoStart)
  stopAllDemoAudio();                          // the tab player, snippets, a practice card, other drills, the metronome
  spotStop(st.key);
  if(typeof coachInterrupt === 'function') coachInterrupt(t('coach.interrupt.micLost'));
  try { getAudioCtx().resume(); } catch(e){}
  const line = spotLine(st.M, st.wrong);
  const midis = line.filter(x => x.midi.length).map(x => x.midi);
  Object.assign(st, { playing: true, part: 'count', lineAt: Infinity });
  spotRepaint(st.key);
  let go = synth => {
    go = () => {};
    if(spots[st.key] !== st || !st.playing) return;
    spotSchedule(st, line, synth);
  };
  if(guitarNotesReadyFor(midis)) return go(false);
  loadGuitarNotesFor(midis).then(() => go(false));
  st.timers.push(setTimeout(() => go(!guitarNotesReadyFor(midis)), GUITAR_NOTE_WAIT_MS));
}
function spotSchedule(st, line, synth){
  const ctx = getAudioCtx(), M = st.M, beat = 60 / M.bpm;
  const t0 = ctx.currentTime + SPOT_LEAD, tL = t0 + M.bpb * beat;
  st.lineAt = tL;
  for(let k = 0; k < M.bpb; k++) st.clicks.push(pcClick(t0 + k * beat, true));
  let prev = [];
  const damp = at => prev.forEach(v => { try { v.gain.gain.setTargetAtTime(0, at, SPOT_DAMP_TC); v.src.stop(at + SPOT_DAMP_TC * 8); } catch(e){} });
  line.forEach(x => {
    const at = tL + x.at * beat;
    damp(at);
    prev = x.midi.map(m => playNote(m, chordGain(x.midi.length) * (M.chords ? STRUM_DOWN_GAIN : 1), at, synth));
    st.voices.push(...prev);
  });
  const tEnd = tL + M.total * beat;
  damp(tEnd + 0.4);
  const ms = s => Math.max(0, (s - ctx.currentTime) * 1000);
  st.timers.push(setTimeout(() => spotPart(st, 'listen'), ms(tL)));
  st.timers.push(setTimeout(() => spotPart(st, 'end'), ms(tEnd)));
}
/* The cue moves from Count in to Listen, and at the end of the line to the question. A box that has left the page
   stops everything (the card was redrawn without a stop). */
function spotPart(st, part){
  if(spots[st.key] !== st || !st.playing) return;
  const box = spotBox(st.key);
  if(!box || !box.isConnected){ spotStop(st.key); st.phase = 'setup'; return; }
  if(part === 'end'){ st.playing = false; st.part = ''; spotRepaint(st.key); return; }
  st.part = part;
  const cue = document.getElementById('spot-cue-' + st.key);
  if(cue) cue.textContent = spotCueText(st);
}
function spotTap(key, i){
  const st = spots[key];
  if(!st || st.phase !== 'round' || st.answer || !st.wrong || !(i >= 0 && i < st.M.items.length)) return;
  if(st.playing && getAudioCtx().currentTime < st.lineAt) return;   // the line has not started: not an answer yet
  spotStop(key);
  const right = i === st.wrong.pos;
  st.answer = { pick: i, right };
  st.res[st.idx] = right ? 'hit' : 'miss';
  st.streak = right ? st.streak + 1 : 0;
  st.best = Math.max(st.best, st.streak);
  spotRepaint(key);
  if(right) spotReveal(st);
}
/* Right: the wrong version, then the right one, of the changed note or chord. */
function spotReveal(st){
  if(window.coachMicLive) return;
  const ctx = getAudioCtx(), it = st.M.items[st.wrong.pos];
  const t0 = ctx.currentTime + 0.05;
  const g = n => chordGain(n) * (st.M.chords ? STRUM_DOWN_GAIN : 1);
  const a = st.wrong.midi.map(m => playNote(m, g(st.wrong.midi.length), t0));
  const b = it.midi.map(m => playNote(m, g(it.midi.length), t0 + SPOT_REVEAL_GAP));
  a.forEach(v => { try { v.gain.gain.setTargetAtTime(0, t0 + SPOT_REVEAL_GAP, SPOT_DAMP_TC); v.src.stop(t0 + SPOT_REVEAL_GAP + SPOT_DAMP_TC * 8); } catch(e){} });
  b.forEach(v => { try { v.gain.gain.setTargetAtTime(0, t0 + 2 * SPOT_REVEAL_GAP + 0.4, SPOT_DAMP_TC); v.src.stop(t0 + 2 * SPOT_REVEAL_GAP + 0.4 + SPOT_DAMP_TC * 8); } catch(e){} });
  st.voices.push(...a, ...b);
}

/* Stops every scheduled note and click (a source stopped before its start never sounds) and the timers. Does not touch
   the screen: callers pick what to show. */
function spotStop(key){
  const st = spots[key];
  if(!st) return;
  (st.timers || []).forEach(clearTimeout); st.timers = [];
  (st.clicks || []).forEach(o => { try { o.stop(0); } catch(e){} try { o.disconnect(); } catch(e){} }); st.clicks = [];
  (st.voices || []).forEach(v => { try { v.src.stop(0); } catch(e){} try { v.gain.disconnect(); } catch(e){} }); st.voices = [];
  st.playing = false; st.part = '';
}
/* Stop: back to the setup screen; the rounds so far are dropped. */
function spotQuit(key){
  const st = spots[key];
  if(!st) return;
  spotStop(key);
  Object.assign(st, { phase: 'setup', idx: 0, res: [], streak: 0, best: 0, prevPos: -1, wrong: null, answer: null });
  spotRepaint(key);
}
/* Every playing line, stopped; its round stays on screen, waiting for a tap (a line cut short can be heard again with
   Play again, which a stop gives back). Called by stopCardAudio, a card closing and the hidden tab, like echoStopAll;
   `scope` as drillBoxInScope reads it. */
function spotStopAll(scope){
  Object.keys(spots).forEach(k => {
    const st = spots[k];
    if(!st.playing && !(st.voices && st.voices.length)) return;
    if(scope && !drillBoxInScope(spotBox(k), scope)) return;
    const cut = st.playing;
    spotStop(k);
    if(cut && st.phase === 'round' && !st.answer){ st.left = Math.min(SPOT_REPLAYS, st.left + 1); }
    spotRepaint(k);
  });
}
