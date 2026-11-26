/* ══ ECHO — the site plays a short phrase, the student plays it back (step.drill, type 'echo') ═══════════
   (Jonathan, 2026-11-26: "create an echo activity … for sweet child of mine"; ca-55.) The mic does not work in
   his room, so NOTHING here listens or grades: the student plays the phrase back in the gap the drill leaves, then
   says how it went (Got it / Again / Next phrase). Nothing is saved: the phrase dots are on screen only, and the
   step is ticked by the card's own Focus-view button, like every other drill step.

   THE LADDER (Jonathan, same day: start on short made-up D5 / C5 / G5 phrases that are NOT the song, then work up
   one step at a time to the song's own strum patterns, so "it kind of tricks students into practicing the verse
   and chorus patterns"). Two kinds of phrase, in one list, easiest first:
     made-up   { pattern:'D.D.D.D.', bars:['D5','D5'], bpm:80 } — a strum pattern (the strum board's own format:
               eight slots a bar, D down, U up, . the hand misses, - it stops; strumSequence in app/tab.js) on
               the drill's `chords`, played by the SITE: the recorded guitar notes behind playNote, strummed, with
               a click on every beat. Slower plays it at ECHO_SLOWER of `bpm`.
     record    { pattern, bars, record:{ section:'Verse 1', fromBar:25 } } — the same bars of the RECORD (the
               practice card `card`'s backing track and section, read by pcLayout: nothing copied; snippet windows
               are bars, never seconds). `bars` must be the chords the card plays in those bars (echoModel refuses
               it otherwise, so checks.mjs 1fi fails the push). Slower is the track's slow file.
   Module-data schema:
     drill: { type:'echo', card:'ca-33', chords:{ D5:{ frets, midi }, … }, phrases:[ …as above… ] }

   ONE PHRASE, three parts, one press:
     count-in   one bar of clicks (pcClick, app/cards.js);
     Listen     made-up: the site strums the phrase over the click; record: the full mix (the guitar playing);
     Your turn  the same length again, straight after, the board still lit strum by strum: made-up: the click
                alone; record: the SAME bars on the rhythm-down mix (the Guitar switch's off file: the band with the
                rhythm guitar turned down), so the student plays it back with the band.
   Then it stops and asks: "Got it" (a green dot, and the next phrase plays), "Again", "Next phrase" (no dot). After
   the last phrase: how many were got, which parts of which song the record phrases were (the reveal), Start over.

   A made-up phrase is scheduled whole on the AudioContext clock (every click and strum; each strum damps the one
   before it, as playSequence does). A record phrase is two <audio> elements, each seeked to its own window
   (snippetWindow per FILE, with its Guitar state); the Your-turn one is parked at its window's start and started by
   a timer set for the moment Listen's window ends on the decoder's clock. Everything started here (both elements,
   every scheduled click and strum, the timers, the frame loop) is stopped by echoStop, and every way out reaches
   it: stopCardAudio (app/audio-ui.js), a card closing (caStopRoundsIn, app/activities-2.js), a hidden tab
   (app/activities-list.js), and the box leaving the page (echoFrame). node tools/stop-loop.mjs walks it
   (start 'echo@card'). */
const ECHO_COUNT_LEAD = 0.1;       // seconds from the press (or the notes arriving) to the first count-in click
const ECHO_HANDOVER_AHEAD = 0.3;   // record: set the hand-over timer once Listen is this close to its end
const ECHO_SLOWER = 0.8;           // made-up phrases at Slower: this share of their bpm
const ECHO_DAMP_TC = 0.025;        // a strum damps the one before it (playSequence's PLAY_SEQ_DAMP_TC)
const echoes = {};
let echoLive = null;               // key of the drill whose phrase is playing

function echoBox(key){ return document.getElementById('echor-' + key); }

/* Pure: the chord sounding at the start of each bar of one lap of section S (bar 0 = its fromBar). */
function echoBarChords(S, bpb){
  const out = [];
  for(let b = 0; b < S.bars; b++){
    const beat = b * bpb;
    let pos = 0, name = '';
    for(const nt of S.notes){
      const len = nt.beats > 0 ? nt.beats : 1;
      if(beat < pos + len - 1e-6){ name = nt.rest ? '' : (nt.note || ''); break; }
      pos += len;
    }
    out.push(name);
  }
  return out;
}
/* Pure: everything about one drill that does not move, or null when anything is off (checks.mjs 1fi renders every
   echo drill and fails the push on a null): a pattern that is not eight slots, a bar whose chord has no notes, a
   bpm out of range, a record phrase outside its section or whose chords are not the card's. */
function echoModel(drill){
  if(!drill || !Array.isArray(drill.phrases) || !drill.phrases.length) return null;
  const chords = drill.chords || {};
  const act = drill.card ? (window.CLASS_ACTIVITIES || []).find(x => x.id === drill.card) : null;
  const L = act ? pcLayout(act) : null;
  const phrases = [];
  for(const p of drill.phrases){
    if(!p || !/^[DU.\-]{8}$/.test(String(p.pattern || '')) || !/[DU]/.test(p.pattern) || !Array.isArray(p.bars) || !p.bars.length) return null;
    if(p.bars.some(b => !chords[b] || !Array.isArray(chords[b].midi) || !chords[b].midi.length)) return null;
    const strum = { pattern: p.pattern, bars: p.bars.slice(), chords, barsPerRow: p.bars.length > 2 ? 4 : 2,
                    caption: p.bars.filter((b, i) => i === 0 || b !== p.bars[i - 1]).join(' · ') };
    if(p.record){
      if(!L) return null;
      const S = L.sections.find(x => x.s.label === p.record.section);
      if(!S) return null;
      const bpb = L.tr.beatsPerBar > 0 ? L.tr.beatsPerBar : 4;
      if(bpb !== 4) return null;   // the strum board is eight eighths a bar
      const off = p.record.fromBar - S.fromBar, n = p.bars.length;
      if(!(off >= 0) || Math.floor(off) !== off || off + n > S.bars * S.reps) return null;
      const lap = echoBarChords(S, bpb);
      if(p.bars.some((b, k) => lap[(off + k) % S.bars] !== b)) return null;
      phrases.push({ record: true, fromBar: p.record.fromBar, bars: n, S, strum });
    } else {
      const bpm = Number(p.bpm);
      if(!(bpm >= 40 && bpm <= 200) || Math.floor(bpm) !== bpm) return null;
      phrases.push({ record: false, bars: p.bars.length, bpm, strum });
    }
  }
  return { act, L, phrases, n: phrases.length, song: act ? (tf(act, 'title') || '').split(' — ')[0] : '' };
}

function renderEcho(drill, key){
  const prev = echoes[key];
  if(prev) echoStop(key);
  const M = echoModel(drill);
  if(!M) return '';
  /* A rebuild (language switch, a card redrawn) keeps the place, the dots and the speed; a playing phrase stops. */
  const keep = prev && prev.M && prev.M.n === M.n;
  echoes[key] = { key, drill, M, phase: keep && (prev.phase === 'done' || prev.phase === 'ask') ? prev.phase : 'setup',
                  idx: keep ? Math.min(prev.idx, M.n - 1) : 0, got: keep ? prev.got.slice() : Array(M.n).fill(false), slow: prev ? prev.slow : true };
  return `<div class="sdr echor" id="echor-${escAttr(key)}" onclick="echoDown(event)">${echoScreenHtml(key)}</div>`;
}
function echoScreenHtml(key){
  const st = echoes[key];
  if(!st) return '';
  return st.phase === 'done' ? echoDoneHtml(key) : st.phase === 'ask' ? echoAskHtml(key) : st.phase === 'play' ? echoPlayHtml(key) : echoSetupHtml(key);
}
/* The tempo the phrase plays at: a made-up phrase's bpm (ECHO_SLOWER of it at Slower); a record phrase's file tempo. */
function echoBpm(st, P){
  if(P.record){ const tr = st.M.L.tr; return st.slow && tr.srcSlow ? tr.trackBpmSlow : tr.trackBpm; }
  return Math.round(st.slow ? P.bpm * ECHO_SLOWER : P.bpm);
}
function echoHeadHtml(st, done){
  const P = st.M.phrases[st.idx];
  const meta = done ? t(st.slow ? 'echo.slower' : 'echo.normal')
    : t('echo.phrase', { n: st.idx + 1, total: st.M.n }) + ' · ' + t('echo.bpm', { bpm: echoBpm(st, P) });
  return `<div class="sdr-head"><span>${escHtml(t('echo.head'))}</span><span class="sdr-meta">${escHtml(meta)}</span></div>`;
}
/* The phrase on the strum board (buildStrum, app/tab.js, with no key: the board alone, no Play row). */
function echoBoardHtml(st){
  return `<div class="echo-board" id="echo-board-${escAttr(st.key)}">${buildStrum(st.M.phrases[st.idx].strum, {})}</div>`;
}
/* The phrase dots: green = Got it. Each is a button that moves to that phrase (not while one plays). */
function echoDotsHtml(st, live){
  return `<div class="fret-dots echo-dots">` + st.got.map((g, i) => {
    const cls = 'fret-dot' + (g ? ' hit' : i === st.idx ? ' cur' : '');
    const lab = escAttr(t('echo.phrase', { n: i + 1, total: st.M.n }));
    return live ? `<span class="${cls}"></span>` : `<button type="button" class="${cls} echo-dot" data-echo-go="${i}" aria-label="${lab}" title="${lab}"></button>`;
  }).join('') + `</div>`;
}
function echoSpeedHtml(st){
  const pill = (slow, label) =>
    `<button type="button" class="sdr-pill${st.slow === slow ? ' active' : ''}" aria-pressed="${st.slow === slow}" data-echo-slow="${slow ? 1 : 0}">${escHtml(label)}</button>`;
  return `<div class="nc-toggle echo-speed"><span class="nc-toggle-label">${escHtml(t('echo.speed'))}</span>${pill(true, t('echo.slower'))}${pill(false, t('echo.normal'))}</div>`;
}
function echoSetupHtml(key){
  const st = echoes[key];
  return echoHeadHtml(st) +
    `<div class="sdr-body">` +
      `<div class="sdr-intro">${escHtml(t('echo.intro'))}</div>` +
      echoBoardHtml(st) +
      `<div class="echo-row">` + echoSpeedHtml(st) +
      `<div class="sdr-actions"><button type="button" class="sdr-start" data-echo-start="1">&#x25B6; ${escHtml(t('echo.start'))}</button>` +
      (st.idx < st.M.n - 1 ? `<button type="button" class="sdr-btn2" data-echo-next="1">${escHtml(t('echo.next'))}</button>` : '') + `</div></div>` +
      echoDotsHtml(st, false) +
    `</div>`;
}
function echoPlayHtml(key){
  const st = echoes[key];
  return echoHeadHtml(st) +
    `<div class="sdr-body echo-play">` +
      `<div class="echo-cue" id="echo-cue-${escAttr(key)}" aria-live="polite">${escHtml(t('echo.countIn'))}</div>` +
      echoBoardHtml(st) +
      `<div class="nc-foot">${echoDotsHtml(st, true)}<button type="button" class="sdr-btn2" data-echo-stop="1">${escHtml(t('echo.stop'))}</button></div>` +
    `</div>`;
}
function echoAskHtml(key){
  const st = echoes[key], last = st.idx >= st.M.n - 1;
  return echoHeadHtml(st) +
    `<div class="sdr-body">` +
      `<div class="pc-ask echo-ask"><p class="pc-ask-msg">${escHtml(t('echo.ask'))}</p><div class="pc-ask-btns">` +
        `<button type="button" class="pc-ask-btn pc-ask-got" data-echo-got="1">${escHtml(t(last ? 'echo.gotLast' : 'echo.got'))}</button>` +
        `<button type="button" class="pc-ask-btn" data-echo-again="1">${escHtml(t('echo.again'))}</button>` +
        `<button type="button" class="pc-ask-btn" data-echo-next="1">${escHtml(t(last ? 'echo.finish' : 'echo.next'))}</button>` +
      `</div></div>` +
      echoBoardHtml(st) +
      `<div class="echo-row">${echoSpeedHtml(st)}</div>` +
      echoDotsHtml(st, false) +
    `</div>`;
}
/* The reveal: the record phrases' sections, by name, and the song ("Verse 1 and Chorus 1 of …"). */
function echoRevealText(st){
  const names = [];
  st.M.phrases.forEach(P => { if(P.record){ const nm = tf(P.S.s, 'label'); if(names.indexOf(nm) < 0) names.push(nm); } });
  if(!names.length || !st.M.song) return '';
  const parts = names.length === 1 ? names[0] : names.slice(0, -1).join(', ') + t('echo.and') + names[names.length - 1];
  return t('echo.reveal', { parts, song: st.M.song });
}
function echoDoneHtml(key){
  const st = echoes[key], n = st.got.filter(Boolean).length, all = n === st.M.n;
  const reveal = echoRevealText(st);
  return echoHeadHtml(st, true) +
    `<div class="sdr-body">` +
      `<div class="sdr-score">${escHtml(t('echo.score', { n, total: st.M.n }))}</div>` +
      (reveal ? `<div class="echo-reveal">${escHtml(reveal)}</div>` : '') +
      `<div class="sdr-verdict ${all ? 'good' : 'mid'}">${escHtml(t(all ? 'echo.doneAll' : 'echo.doneSome'))}</div>` +
      `<div class="sdr-actions"><button type="button" class="sdr-start" data-echo-over="1">&#x25B6; ${escHtml(t('echo.over'))}</button></div>` +
      echoDotsHtml(st, false) +
    `</div>`;
}
function echoRepaint(key){ const b = echoBox(key); if(b) b.innerHTML = echoScreenHtml(key); }

/* One click handler for the whole drill (no inline arguments: the box's id names it). */
function echoDown(ev){
  const box = ev.currentTarget;
  const el = ev.target && ev.target.closest ? ev.target.closest('[data-echo-start],[data-echo-stop],[data-echo-slow],[data-echo-got],[data-echo-again],[data-echo-next],[data-echo-go],[data-echo-over]') : null;
  if(!el || !box) return;
  const key = box.id.replace(/^echor-/, '');
  const st = echoes[key];
  if(!st) return;
  if(el.hasAttribute('data-echo-stop')) return echoQuit(key);
  if(st.phase === 'play') return;   // nothing else acts while a phrase plays (Stop is its way out)
  if(el.hasAttribute('data-echo-start') || el.hasAttribute('data-echo-again')) return echoStart(key);
  if(el.hasAttribute('data-echo-slow')){ st.slow = el.getAttribute('data-echo-slow') === '1'; return echoRepaint(key); }
  if(el.hasAttribute('data-echo-got')){ st.got[st.idx] = true; return echoAdvance(key, true); }
  if(el.hasAttribute('data-echo-next')) return echoAdvance(key, st.phase === 'ask');
  if(el.hasAttribute('data-echo-go')){ const i = parseInt(el.getAttribute('data-echo-go'), 10); if(i >= 0 && i < st.M.n){ st.idx = i; st.phase = 'setup'; echoRepaint(key); } return; }
  if(el.hasAttribute('data-echo-over')){ st.got = Array(st.M.n).fill(false); st.idx = 0; st.phase = 'setup'; return echoRepaint(key); }
}
/* The next phrase: played at once from the prompt (the hands are on the guitar), shown from the setup screen.
   Past the last phrase: the score. */
function echoAdvance(key, play){
  const st = echoes[key];
  if(st.idx >= st.M.n - 1){ st.phase = 'done'; return echoRepaint(key); }
  st.idx++;
  if(play) return echoStart(key);
  st.phase = 'setup';
  echoRepaint(key);
}

function echoStart(key){
  const st = echoes[key];
  if(!st || st.phase === 'play') return;
  if(window.coachMicLive) return;                 // never play into a live mic (same guard as pcStart, chcStart)
  stopAllDemoAudio();                              // the tab player, snippets, a practice card, other drills, the metronome
  if(typeof coachInterrupt === 'function') coachInterrupt(t('coach.interrupt.micLost'));
  try { getAudioCtx().resume(); } catch(e){}
  const P = st.M.phrases[st.idx];
  Object.assign(st, { phase: 'play', part: 'count', P, aL: null, aT: null, winL: null, winT: null, hits: strumSequence(P.strum),
                      raf: 0, timers: [], clicks: [], voices: [], t0: 0, beat: 0, handover: false, shown: '', lit: -2 });
  echoLive = key;
  echoRepaint(key);
  if(P.record) echoStartRecord(st); else echoStartMadeUp(st);
  st.raf = requestAnimationFrame(echoFrame);
}
/* A made-up phrase: wait (at most GUITAR_NOTE_WAIT_MS) for its recorded notes, as playSequence does, then schedule
   the whole phrase. */
function echoStartMadeUp(st){
  const P = st.P;
  const midis = P.strum.bars.map(b => P.strum.chords[b].midi.map(Number));
  let go = synth => {
    go = () => {};
    if(echoes[st.key] !== st || st.phase !== 'play' || st.P !== P) return;
    echoSchedule(st, synth);
  };
  if(guitarNotesReadyFor(midis)) return go(false);
  loadGuitarNotesFor(midis).then(() => go(false));
  st.timers.push(setTimeout(() => go(!guitarNotesReadyFor(midis)), GUITAR_NOTE_WAIT_MS));
}
/* A bar of count-in, then the strums with a click on every beat (Listen), then the clicks alone (Your turn); each
   strum a little louder down than up (▶ Play strum's STRUM_DOWN_GAIN / STRUM_UP_GAIN, app/tab.js). */
function echoSchedule(st, synth){
  const P = st.P, ctx = getAudioCtx(), bpb = 4;
  const beat = 60 / echoBpm(st, P);
  const t0 = ctx.currentTime + ECHO_COUNT_LEAD;
  const len = P.bars * bpb * beat;
  Object.assign(st, { t0, beat, tL: t0 + bpb * beat, tT: t0 + bpb * beat + len, tEnd: t0 + bpb * beat + 2 * len });
  for(let k = 0; k < bpb; k++) st.clicks.push(pcClick(t0 + k * beat, true));
  for(let k = 0; k < 2 * P.bars * bpb; k++) st.clicks.push(pcClick(st.tL + k * beat, false, STRUM_CLICK_GAIN));
  let prev = [];
  const damp = at => prev.forEach(v => { try { v.gain.gain.setTargetAtTime(0, at, ECHO_DAMP_TC); v.src.stop(at + ECHO_DAMP_TC * 8); } catch(e){} });
  st.hits.forEach(h => {
    const at = st.tL + h.at * beat / 2;
    damp(at);
    const vg = chordGain(h.midi.length) * (h.dir === 'D' ? STRUM_DOWN_GAIN : STRUM_UP_GAIN);
    prev = h.midi.map(m => playNote(m, vg, at, synth));
    st.voices.push(...prev);
  });
  damp(st.tT);   // the last strum of Listen stops where Your turn begins: the gap is the student's
}
/* A record phrase: the full mix (Listen), then the rhythm-down mix of the same bars (Your turn). A track with no full
   mix plays the rhythm-down mix for both: one fewer cue, never a broken drill. */
function echoStartRecord(st){
  const key = st.key, P = st.P, tr = st.M.L.tr;
  const full = snippetHasFull(tr);
  const spec = { fromBar: P.fromBar, bars: P.bars };
  const mk = guitar => { const a = new Audio(); a.preload = 'auto'; a.loop = false; a.src = snippetSrc(tr, st.slow, guitar); return a; };
  Object.assign(st, { aL: mk(full), aT: mk(false), winL: snippetWindow(tr, spec, st.slow, full), winT: snippetWindow(tr, spec, st.slow, false) });
  const { aL, aT } = st;
  const lost = el => () => { if(echoes[key] === st && (st.aL === el || st.aT === el)){ echoQuit(key); songLoadFailed(); } };
  aL.addEventListener('error', lost(aL), { once: true });
  aT.addEventListener('error', lost(aT), { once: true });
  // The Your-turn file waits at its window's start, buffering, while the count-in and Listen play.
  const parkT = () => { if(echoes[key] === st && st.aT === aT){ try { aT.currentTime = st.winT.start; } catch(e){} } };
  if(aT.readyState >= 1) parkT(); else aT.addEventListener('loadedmetadata', parkT, { once: true });
  const begin = () => {
    if(echoes[key] !== st || st.phase !== 'play' || st.aL !== aL) return;
    try { aL.currentTime = st.winL.start; } catch(e){}
    const e = st.winL.edges, beat = (e[1] - e[0]) / 4;
    const t0 = getAudioCtx().currentTime + ECHO_COUNT_LEAD;
    for(let k = 0; k < 4; k++) st.clicks.push(pcClick(t0 + k * beat, true));
    Object.assign(st, { t0, beat });
    st.timers.push(setTimeout(() => {
      if(echoes[key] !== st || st.phase !== 'play') return;
      st.part = 'listen';
      aL.play().catch(() => {});
    }, (ECHO_COUNT_LEAD + 4 * beat) * 1000));
  };
  if(aL.readyState >= 1) begin(); else aL.addEventListener('loadedmetadata', begin, { once: true });
}
/* Record: Listen's window has ended, so the record stops and the band plays the same bars without the guitar. */
function echoHandOver(st){
  if(echoes[st.key] !== st || st.phase !== 'play' || st.part !== 'listen') return;
  try { st.aL.pause(); } catch(e){}
  if(Math.abs(st.aT.currentTime - st.winT.start) > 0.05){ try { st.aT.currentTime = st.winT.start; } catch(e){} }
  st.part = 'turn';
  st.aT.play().catch(() => {});
}
function echoFrame(){
  const st = echoLive && echoes[echoLive];
  if(!st || st.phase !== 'play') return;
  const box = echoBox(st.key);
  if(!box || !box.isConnected){ echoStop(st.key); st.phase = 'setup'; return; }
  let slot = -1;   // the eighth-note slot of the phrase being HEARD (output latency taken off), or -1
  if(st.P.record){
    if(st.part === 'listen'){
      const left = st.winL.end - st.aL.currentTime;
      if(st.aL.ended || left <= 0.002) echoHandOver(st);
      else if(!st.handover && !st.aL.paused && left < ECHO_HANDOVER_AHEAD){
        st.handover = true;
        const rate = st.aL.playbackRate > 0 ? st.aL.playbackRate : 1;
        st.timers.push(setTimeout(() => echoHandOver(st), Math.max(0, left / rate * 1000)));
      }
    } else if(st.part === 'turn' && (st.aT.ended || st.aT.currentTime >= st.winT.end - 0.01)) return echoEnd(st);
    if(st.part !== 'count'){
      const el = st.part === 'listen' ? st.aL : st.aT, win = st.part === 'listen' ? st.winL : st.winT;
      const b = snipBarsAt(win, el.currentTime - snipLatency());
      if(b >= 0 && b < st.P.bars) slot = Math.floor(b * 8 + 1e-6);
    }
  } else if(st.t0){
    const h = getAudioCtx().currentTime - snipLatency();
    if(h >= st.tEnd) return echoEnd(st);
    st.part = h >= st.tT ? 'turn' : h >= st.tL ? 'listen' : 'count';
    if(st.part !== 'count') slot = Math.floor((h - (st.part === 'listen' ? st.tL : st.tT)) / (st.beat / 2));
  }
  echoPaint(st, slot);
  st.raf = requestAnimationFrame(echoFrame);
}
function echoEnd(st){
  echoStop(st.key);
  st.phase = 'ask';
  echoRepaint(st.key);
}
/* What moved: the cue (Count in, Listen, Your turn) and the strum lit on the board (the last strum at or before the
   slot heard; the board's own .beat-now, as ▶ Play strum lights it). */
function echoPaint(st, slot){
  const key = st.key;
  if(st.part !== st.shown){
    st.shown = st.part;
    const el = document.getElementById('echo-cue-' + key);
    if(el){
      el.textContent = t(st.part === 'listen' ? 'echo.listen' : st.part === 'turn' ? 'echo.yourTurn' : 'echo.countIn');
      el.className = 'echo-cue' + (st.part === 'listen' ? ' listen' : st.part === 'turn' ? ' turn' : '');
      const body = el.parentNode;
      if(body && body.classList) body.classList.toggle('turn', st.part === 'turn');   // the lit strum goes green on Your turn (styles.css)
    }
  }
  let lit = -1;
  if(slot >= 0) st.hits.forEach((h, i) => { if(h.at <= slot) lit = i; });
  if(lit !== st.lit){
    st.lit = lit;
    const board = document.getElementById('echo-board-' + key);
    if(board){
      board.querySelectorAll('.beat-now').forEach(c => c.classList.remove('beat-now'));
      if(lit >= 0) board.querySelectorAll(`[data-seq="${lit}"]`).forEach(c => c.classList.add('beat-now'));
    }
  }
}

/* Stops both files, every scheduled click and strum (a source stopped before its start never sounds), the timers
   and the loop. Does not touch the screen: callers pick what to show. */
function echoStop(key){
  const st = echoes[key];
  if(!st) return;
  if(st.raf){ cancelAnimationFrame(st.raf); st.raf = 0; }
  (st.timers || []).forEach(clearTimeout); st.timers = [];
  (st.clicks || []).forEach(o => { try { o.stop(0); } catch(e){} try { o.disconnect(); } catch(e){} }); st.clicks = [];
  (st.voices || []).forEach(v => { try { v.src.stop(0); } catch(e){} try { v.gain.disconnect(); } catch(e){} }); st.voices = [];
  ['aL', 'aT'].forEach(k => { if(st[k]){ try { st[k].pause(); st[k].src = ''; } catch(e){} st[k] = null; } });
  st.t0 = 0;
  if(echoLive === key) echoLive = null;
}
function echoQuit(key){
  const st = echoes[key];
  if(!st) return;
  echoStop(key);
  st.phase = 'setup';
  echoRepaint(key);
}
/* Every playing phrase, back to its setup screen. Called by stopCardAudio, a card closing and the hidden tab, like
   chcStopAll; `scope` as drillBoxInScope reads it. */
function echoStopAll(scope){
  Object.keys(echoes).forEach(k => {
    if(echoes[k].phase !== 'play') return;
    if(scope && !drillBoxInScope(echoBox(k), scope)) return;
    echoQuit(k);
  });
}
