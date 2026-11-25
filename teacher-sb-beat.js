/* ── Song builder: the Beat step (2026-11-15, Song builder Part b) ────────────────────────────────────────
   Step 3 of the Song builder (teacher-sb-core.js has the view and the draft; teacher-sb-dsp.js the numbers).
   Jonathan taps along (the TAP button or the space bar; the first press starts the song) or types a BPM, and
   picks the beats in a bar: 3, 4, or 6/8 counted in two (the meters a built song takes, app/builtsongs.js
   BS_METERS; there is no 2/4 there, so no "2"). From that the audio sets the grid (sbAutoGrid): the record's
   beat followed through the whole song (sbTrack), bar 1 on the first LOUD beat, and a pin near the end where the
   music is. He
   checks it on the waveform (numbered bar lines, his taps as ▲) and by ear: "Listen with clicks" plays the
   levelled copy with the card's own Metronome click (pcClick, app/cards.js, at the play-along level) on the
   grid. Bar 1 moves with its handle (drag), ±10 ms and ±1 beat. The DRIFT CHECK measures windows through the
   song against the grid; a window more than 30 ms off says so and offers "Pin bar N to the music"; three or
   more pins make the song's barTimes (sbBarTimes, at the Chart step, when the bar count is known). The taps
   are reported as their real spread (people tap within 20 to 40 ms; the plan).
   Saved in the draft as beat = { meter, bpm, anchor, pins: [{ bar, t }], trackBpm, trackSub, tapBpm, taps,
   tapSpreadMs, driftOff, pinsNeeded } (driftOff: windows still over 30 ms; the list shows "Check the beat" while it
   is above 0. trackBpm and trackSub: the beat track's tempo and how it divides the beat, so the same track is found
   when the draft is opened again. pinsNeeded: how many pins the record's own bars would take, sbPinsNeeded; over
   SB_PINS_MAX the step says the song does not fit the builder (it cannot hold the record's beat; Jonathan, 2026-11-16:
   the builder is for songs that do not drift much, "keep the warning that a song doesn't fit"), beside "Listen with
   clicks" too since he listened first and missed the box, and to send the mp3 to Claude, and the list
   shows "Beat: send to Claude"; the later steps stay open, as with the 10-cent rule).
   THE TAPS also say which pulse is the beat (sbTapPulse): on a strummed record the "and" is as loud as the beat,
   and only the person tapping knows which is which. A typed BPM has no taps: bar 1 is then the first loud pulse.
   Everything that sounds here stops on every way out: leaving the view (teacherSbLeave), another step or song,
   a hidden tab, Stop. It never calls a global stopper (the console may be playing to the room). */
const SB_TAP_WANT = 16;
let sbBt = null;   // { id, taps: [], fit, audio, url, raf, clicks: [], lastClick, from, drag, drift, computing, view } (the save: sbSaveSoon, teacher-sb-core.js)
function sbBtFor(id){
  if(!sbBt || sbBt.id !== id){ sbBeatStop(); sbBt = { id, taps: [], fit: null, audio: null, raf: 0, clicks: [], lastClick: -1, drift: null, view: null, playingFor: '' }; }
  return sbBt;
}
function sbBeatOf(d){ return d && d.beat && Number.isFinite(d.beat.anchor) && Number.isFinite(d.beat.bpm) ? d.beat : null; }
function sbFmtT(s){ const m = Math.floor(s / 60), r = s - m * 60; return `${m}:${r < 10 ? '0' : ''}${r.toFixed(2)}`; }

function sbBeatPaneHtml(d){
  if(d && d.audio && d.beat && d.beat.fromImport) return sbBeatImportedHtml(d);
  if(!d || !d.audio || !(d.volume || d.imported)) return `<div class="sb-box"><p class="sb-note" style="margin:0">Level the record first (step 2).</p></div>`;
  const lv = sbMem.id === sbSel ? sbMem.level : null;
  if(!lv || !lv.E) return `<div class="sb-box"><p class="sb-note" style="margin:0" data-sb-beatwait>${lv ? 'Reading the beats…' : d && d.audio && sbMem.failed === d.audio.sha256 ? 'The levelled copy did not load (the line above says why).' : 'Loading the levelled copy…'}</p></div>`;
  const bt = sbBtFor(sbSel), beat = sbBeatOf(d), meter = (beat && beat.meter) || bt.meter || '4/4';
  const off = sbBusy ? ' disabled' : '';
  const fit = bt.fit;
  const dots = Array.from({ length: SB_TAP_WANT }, (_, i) => `<i${i < bt.taps.length ? '' : ' class="dim"'}></i>`).join('');
  const tapLine = fit ? `${fit.n} taps · <b>${fit.bpm.toFixed(1)} BPM</b> · spread ${Math.round(fit.spreadMs)} ms`
    : bt.taps.length ? `${bt.taps.length} tap${bt.taps.length === 1 ? '' : 's'}… keep going`
    : beat && beat.taps ? `${beat.taps} taps · ${Number(beat.tapBpm).toFixed(1)} BPM · spread ${Math.round(beat.tapSpreadMs)} ms`
    : 'Press TAP to start the song, then tap with the beat';
  const bpmVal = beat ? sbPinBpm(beat).toFixed(1) : fit ? fit.bpm.toFixed(1) : '';
  const meters = [['3/4', '3'], ['4/4', '4'], ['6/8', '6/8 in two']].map(([m, l]) => `<button type="button" class="${m === meter ? 'on' : ''}" data-sb-meter="${m}" aria-pressed="${m === meter}"${off}>${l}</button>`).join('');
  let html = `<div class="sb-beat-top">
    <button type="button" class="sb-tap" data-sb-act="tap"${off}>TAP<small>space bar works too</small></button>
    <div class="sb-beat-mid">
      <div class="sb-h">Tap along with the beat for a few bars</div>
      <div class="sb-dots" aria-hidden="true">${dots}</div>
      <div class="sb-note sb-tapline"><span data-sb-tapline>${tapLine}</span>. Or type it: <input class="sb-input small sb-bpm" data-sb-bpm inputmode="decimal" aria-label="Beats a minute" value="${escAttr(bpmVal)}"${off}> BPM
        ${bt.taps.length ? `<button type="button" class="sb-btn small" data-sb-act="taps-reset"${off}>Tap again</button>` : ''}</div>
      <div class="sb-row"><span class="sb-note" style="margin:0">Beats in a bar</span><span class="sb-seg" role="group" aria-label="Beats in a bar">${meters}</span>${meter === '6/8' ? '<span class="sb-hint" style="margin:0">Tap the two big beats of each bar.</span>' : ''}</div>
    </div>
    <div class="sb-beat-bar1">
      <div class="sb-hint" style="margin:0">Bar 1 starts at</div><div class="sb-big sb-bar1t">${beat ? escHtml(sbFmtT(beat.anchor)) : '—'}</div>
      <div class="sb-row sb-nudge"><button type="button" class="sb-btn small" data-sb-act="a-beat"${off || !beat ? ' disabled' : ''} title="Bar 1 one beat earlier">◀ 1 beat</button><button type="button" class="sb-btn small" data-sb-act="a-10"${off || !beat ? ' disabled' : ''}>◀ 10 ms</button><button type="button" class="sb-btn small" data-sb-act="a+10"${off || !beat ? ' disabled' : ''}>10 ms ▶</button><button type="button" class="sb-btn small" data-sb-act="a+beat"${off || !beat ? ' disabled' : ''} title="Bar 1 one beat later">1 beat ▶</button></div>
      <div class="sb-row sb-nudge"><span class="sb-hint" style="margin:0">Clicks between the beats?</span><button type="button" class="sb-btn small" data-sb-act="a-half"${off || !beat ? ' disabled' : ''} title="Every bar line half a beat earlier: for clicks that land on the 'and'">◀ ½ beat</button><button type="button" class="sb-btn small" data-sb-act="a+half"${off || !beat ? ' disabled' : ''} title="Every bar line half a beat later: for clicks that land on the 'and'">½ beat ▶</button></div>
    </div>
  </div>`;
  html += `<div class="sb-wave sb-wave-main"><canvas data-sb-wave="main" height="118" aria-label="The start of the song, with the bar lines the card will use"></canvas></div>`;
  html += `<div class="sb-row sb-wave-foot"><span class="sb-hint" style="margin:0">${beat ? 'Purple lines are the bars the card will use; ▲ are your taps. Drag the handle on bar 1 to the first loud chord.' : 'The bar lines appear once you tap or type a BPM.'}</span>`
    + `<button type="button" class="sb-btn small" data-sb-act="listen"${!beat ? ' disabled' : ''}>▶ Listen with clicks</button><button type="button" class="sb-btn small" data-sb-act="listen-stop">■ Stop</button>`
    + (beat && sbBeatTooMuch(bt.need ? bt.need.pins : beat.pinsNeeded) ? `<span class="sb-bad sb-nofit" role="note">This song does not fit the builder: the clicks will drift. See the red box below.</span>` : '')
    + (beat ? `<button type="button" class="sb-btn small" data-sb-act="clear-beat"${off}>Clear this step</button>` : '') + `</div>`;
  if(beat){
    const dr = bt.drift || [], last = sbBarsIn(beat, d.audio.durationSec);
    const nPins = sbPins(beat).length;
    if(sbBeatTooMuch(bt.need ? bt.need.pins : beat.pinsNeeded)) html += sbNoFitHtml(bt.need ? bt.need.pins : beat.pinsNeeded);
    html += `<div class="sb-h sb-drift-title">Drift check: does the grid still sit on the music later in the song?</div>
      <p class="sb-hint sb-drift-sum">${escHtml(`${sbPinBpm(beat).toFixed(2)} BPM · ${last} bars fit in the file · ${nPins} pin${nPins === 1 ? '' : 's'} (bar 1${nPins > 1 ? ' and ' + sbPins(beat).slice(1).map(p => p.bar).join(', ') : ''})`)}${nPins >= 3 ? ' · the bars follow the pins (a beat map)' : ''}</p>`;
    html += `<div class="sb-drift">` + dr.map(w => {
      const late = Math.abs(w.ms) > SB_DRIFT_MS && w.sure && !w.pinned;
      const said = w.pinned ? '<span class="sb-ok">pinned</span>' : !w.sure ? '<span class="sb-hint" style="margin:0">can\'t tell (quiet here)</span>'
        : Math.abs(w.ms) < 5 ? '<span class="sb-ok">on the beat</span>' : late ? `<span class="sb-warn">music ${Math.abs(w.ms)} ms ${w.ms > 0 ? 'late' : 'early'}</span>`
        : `<span class="sb-ok">${Math.abs(w.ms)} ms</span>`;
      const btn = w.pinned ? (w.bar === sbAutoEndBar(beat) ? '' : `<button type="button" class="sb-btn small" data-sb-act="unpin" data-sb-bar="${w.bar}"${off}>Unpin</button>`)
        : late ? `<button type="button" class="sb-btn small" data-sb-act="pin" data-sb-bar="${w.bar}"${off}>Pin bar ${w.bar} to the music</button>` : '';
      return `<div class="sb-box${late ? ' sb-late' : ''}"><div class="sb-drift-h"><span>Bar ${w.bar}</span>${said}</div><div class="sb-wave"><canvas data-sb-wave="drift" data-sb-bar="${w.bar}" height="50"></canvas></div>`
        + `<div class="sb-row sb-drift-btns"><button type="button" class="sb-btn small" data-sb-act="listen-bar" data-sb-bar="${w.bar}">▶ Listen</button>${btn}</div></div>`;
    }).join('') + `</div>`;
  }
  return html;
}
/* The red box for a record the builder cannot hold (over SB_PINS_MAX pins). The same words at the Beat, Preview and
   Publish steps (Jonathan, 2026-11-16: "keep the warning that a song doesn't fit"); it never blocks Publish
   (Jonathan, 2026-11-15: the pins line only warns). */
function sbNoFitHtml(pins){
  return `<div class="sb-flag red" data-sb-nofit><span class="fi">!</span><div class="sb-flag-body"><b>This song does not fit the builder: it cannot hold this record's beat.</b> The builder is for records with a steady beat. This one would need about ${escHtml(String(pins))} pins to stay on the beat (a steady record needs 2 or 3): the tempo moves, or the beat is hard to follow, so the clicks drift off the music. Send the mp3 to Claude to build this song. You can still try the other steps.</div></div>`;
}
/* The pin sbAutoGrid set near the end (the highest pinned bar): kept, never offered for Unpin. */
function sbAutoEndBar(beat){ const ps = (beat.pins || []).map(p => p.bar); return ps.length ? Math.max(...ps) : null; }

/* After a paint with the Beat step showing: load what is missing, then draw. */
/* An imported song's beat (teacher-sb-publish.js, sbDraftFromDoc): kept exactly as it came, shown read-only (the
   builder cannot measure a grid it did not set: no taps, no drift windows); Clear this step sets a new one here. */
function sbBeatImportedHtml(d){
  const b = d.beat, n = Array.isArray(b.barTimes) ? b.barTimes.length : 0, off = sbBusy ? ' disabled' : '';
  return `<div class="sb-box tint"><div class="sb-h">The bars came with the imported song</div>
    <p class="sb-note">${escHtml(`${(Math.round(b.bpm * 10) / 10)} BPM, ${b.meter === '6/8' ? '6/8 in two' : b.meter.slice(0, 1) + ' beats a bar'}, bar 1 at ${sbFmtT(b.anchor)}`)}${n ? `, and a beat map of ${n} bar times (bars that are not all the same length)` : ', every bar the same length'}. The builder keeps them exactly as they are, so a song you publish again plays on the same bars.</p>
    <p class="sb-note">They were measured when the song file was made, not here: there are no taps and no drift check to show. Hear them at Preview. To set a new beat here instead, clear this step (the imported bars are then gone from the draft).</p>
    <div class="sb-row"><button type="button" class="sb-btn small" data-sb-act="clear-beat"${off}>Clear this step: set a new beat</button></div></div>`;
}
function sbBeatMounted(){
  const d = sbDraft();
  if(!d || !d.audio || !(d.volume || d.imported) || (d.beat && d.beat.fromImport)) return;
  const lv = sbMem.id === sbSel ? sbMem.level : null;
  if(!lv){ if(!sbBusy && sbMem.failed !== d.audio.sha256) sbLoadLevel(); return; }   // never again by itself after a failed load (sbMem.failed)
  if(!lv.E){
    const id = sbSel, gen = sbViewGen;
    setTimeout(() => {
      /* The draft as it is now (SB-1: a re-read in these 30 ms may have put another copy of it in memory). */
      const cur = sbDraft();
      if(sbStopped(gen) || sbSel !== id || lv.E || !cur || !cur.audio) return;
      lv.E = sbOnsetEnv(lv.mono, lv.fs);
      const b = sbBeatOf(cur);
      if(b) sbBeatTrack(lv, b);
      sbBtFor(id).drift = b ? sbDrift(lv.E, b, cur.audio.durationSec) : null;
      sbBtFor(id).need = b ? sbPinsNeeded(lv.E, b, cur.audio.durationSec) : null;
      /* A beat whose drift windows are not measured on this copy (a new copy was levelled, review R1-6): measured
         and saved now, so Publish knows them. */
      if(b && (!Number.isFinite(b.driftOff) || (b.driftFor && b.driftFor !== cur.audio.sha256))){ sbBeatSet(cur, Object.assign({}, b), null); return; }
      teacherSbPaint();
    }, 30);
    return;
  }
  const bt = sbBtFor(sbSel), b = sbBeatOf(d);
  if(b && !bt.drift) bt.drift = sbDrift(lv.E, b, d.audio.durationSec);
  sbDrawAll();
}

/* The beat track a saved grid was made with, found again on lv.E: the same tempo and division (beat.trackBpm,
   beat.trackSub; a draft saved before 2026-11-15 has no trackSub and gets the track a new grid would). It is made
   again when the meter changes: the bar's pattern is part of it. */
function sbBeatTrack(lv, beat){
  const tr = lv.E.track;
  if(!Number.isFinite(beat.trackBpm)) return;
  if(tr && tr.meter === beat.meter && Math.abs(tr.bpm - beat.trackBpm) < 1e-4 && (!beat.trackSub || tr.sub === beat.trackSub)) return;
  lv.E.track = sbTrack(lv.E, beat.trackBpm, beat.meter, beat.trackSub ? { sub: beat.trackSub } : null);
}

/* ── Drawing ── */
function sbCss(name, fb){ try{ const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim(); return v || fb; }catch(e){ return fb; } }
function sbMainView(beat, dur){
  const t0 = beat ? Math.max(0, beat.anchor - 2) : 0;
  return { t0, t1: Math.min(dur, t0 + 21) };
}
function sbDrawAll(){
  const d = sbDraft(), lv = sbMem.id === sbSel ? sbMem.level : null;
  if(!d || !lv) return;
  const beat = sbBeatOf(d), bt = sbBtFor(sbSel);
  document.querySelectorAll('[data-sb-root] canvas[data-sb-wave]').forEach(cv => {
    if(cv.dataset.sbWave === 'main'){
      const v = sbMainView(beat, lv.durationSec);
      bt.view = v;
      sbDrawWave(cv, lv, v.t0, v.t1, beat, { taps: bt.taps, handle: !!beat, secs: true });
    } else if(beat){
      const bar = Number(cv.dataset.sbBar), s = sbBarTime(beat, bar), e = sbBarTime(beat, bar + 1), bpb = SB_METER[beat.meter].bpb, beatSec = (e - s) / bpb;
      sbDrawWave(cv, lv, s - beatSec * 1.2, s + beatSec * 1.8, beat, { first: bar });
    }
  });
}
function sbDrawWave(cv, lv, t0, t1, beat, o){
  /* The drawn height is the markup's height="…", kept in data-h: setting cv.height below rewrites that attribute in
     device pixels, so reading it back doubled the waveform on every redraw on a Retina screen (2026-11-15). */
  if(!cv.dataset.h) cv.dataset.h = cv.getAttribute('height') || '100';
  const dpr = window.devicePixelRatio || 1, W = Math.max(50, cv.clientWidth || cv.parentNode.clientWidth || 600), H = Number(cv.dataset.h) || 100;
  cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cv.style.height = H + 'px';
  const g = cv.getContext('2d');
  if(!g) return;
  g.setTransform(dpr, 0, 0, dpr, 0, 0);
  g.clearRect(0, 0, W, H);
  const top = beat ? 14 : 2, mid = (H + top) / 2, amp = (H - top) / 2 - 2, x = t => (t - t0) / (t1 - t0) * W;
  const pk = sbPeaks(lv.mono, lv.fs, t0, t1, Math.round(W));
  let m = 0; for(let i = 0; i < pk.length; i++) m = Math.max(m, Math.abs(pk[i]));
  const sc = m > 0 ? 0.95 / m : 1;
  g.fillStyle = sbCss('--text3', '#888'); g.globalAlpha = 0.6;
  for(let c = 0; c < W; c++){ const lo = pk[2 * c] * sc, hi = pk[2 * c + 1] * sc; g.fillRect(c, mid - hi * amp, 1, Math.max(1, (hi - lo) * amp)); }
  g.globalAlpha = 1;
  const purple = sbCss('--purple-accent', '#6b5fd0');
  if(beat){
    const bpb = SB_METER[beat.meter].bpb;
    const firstBar = Math.max(1, Math.floor(1 + (t0 - beat.anchor) / sbBarSec(beat)) - 1);
    for(let b = firstBar; b < firstBar + 400; b++){
      const s = sbBarTime(beat, b), e = sbBarTime(beat, b + 1);
      if(s > t1) break;
      for(let k = 0; k < bpb; k++){
        const t = s + (e - s) * k / bpb;
        if(t < t0 || t > t1) continue;
        const X = Math.round(x(t)) + 0.5;
        if(k === 0){
          g.strokeStyle = purple; g.lineWidth = 2; g.setLineDash([]);
          g.beginPath(); g.moveTo(X, 13); g.lineTo(X, H); g.stroke();
          const lbl = String(b); g.font = '700 10px system-ui, sans-serif';
          const wv = g.measureText(lbl).width + 8; g.fillStyle = purple; g.fillRect(X + 1, 0, wv, 13);
          g.fillStyle = '#fff'; g.fillText(lbl, X + 5, 10);
        } else {
          g.strokeStyle = purple; g.globalAlpha = 0.4; g.lineWidth = 1; g.setLineDash([3, 3]);
          g.beginPath(); g.moveTo(X, 17); g.lineTo(X, H); g.stroke(); g.globalAlpha = 1; g.setLineDash([]);
        }
      }
    }
    if(o.handle){
      const X = x(beat.anchor);
      g.fillStyle = sbCss('--bg', '#fff'); g.strokeStyle = purple; g.lineWidth = 2;
      g.beginPath(); g.rect(X - 7, mid - 16, 14, 32); g.fill(); g.stroke();
      g.beginPath(); g.moveTo(X - 2, mid - 7); g.lineTo(X - 2, mid + 7); g.moveTo(X + 2, mid - 7); g.lineTo(X + 2, mid + 7); g.lineWidth = 1.5; g.stroke();
    }
  }
  if(o.taps){
    g.fillStyle = sbCss('--amber-text', '#a06000');
    o.taps.forEach(t => { if(t < t0 || t > t1) return; const X = x(t); g.beginPath(); g.moveTo(X - 5, H - 1); g.lineTo(X + 5, H - 1); g.lineTo(X, H - 9); g.closePath(); g.fill(); });
  }
  if(o.secs){
    g.fillStyle = sbCss('--text3', '#888'); g.font = '9px system-ui, sans-serif';
    for(let s = Math.ceil(t0 / 5) * 5; s <= t1; s += 5) g.fillText(sbFmtT(s).replace(/\.\d+$/, ''), x(s) + 2, H - 3);
  }
  const a = sbBt && sbBt.audio;
  if(a && !a.paused && a.currentTime >= t0 && a.currentTime <= t1){
    g.strokeStyle = sbCss('--red-text', '#c00'); g.lineWidth = 1.5; const X = x(a.currentTime);
    g.beginPath(); g.moveTo(X, 0); g.lineTo(X, H); g.stroke();
  }
}

/* ── Playing: the levelled copy in an <audio> (what a card plays), clicks on the AudioContext ── */
function sbBeatPlay(from, withClicks){
  const lv = sbMem.id === sbSel ? sbMem.level : null, bt = sbBt;
  if(!lv || !bt) return;
  sbBeatStop(true);
  if(!lv.url) lv.url = URL.createObjectURL(new Blob([lv.bytes], { type: 'audio/mpeg' }));
  const a = new Audio(lv.url);
  bt.audio = a; bt.clicks = []; bt.lastClick = -1; bt.withClicks = !!withClicks;
  a.addEventListener('loadedmetadata', () => { try{ a.currentTime = Math.max(0, from); }catch(e){} a.play().catch(() => {}); }, { once: true });
  a.addEventListener('ended', () => sbBeatStop());
  const loop = () => {
    if(!sbBt || sbBt.audio !== a) return;
    if(teacherView !== 'songbuilder'){ sbBeatStop(); return; }   // left the view by a way that skipped teacherSbLeave
    if(bt.withClicks) sbScheduleClicks(a);
    const v = bt.view;
    if(v && a.currentTime >= v.t0 - 0.5 && a.currentTime <= v.t1 + 0.5){
      const cv = document.querySelector('[data-sb-root] canvas[data-sb-wave="main"]'), d = sbDraft();
      if(cv && d) sbDrawWave(cv, lv, v.t0, v.t1, sbBeatOf(d), { taps: bt.taps, handle: !!sbBeatOf(d), secs: true });
    }
    bt.raf = requestAnimationFrame(loop);
  };
  bt.raf = requestAnimationFrame(loop);
}
/* The card's own click (pcClick, app/cards.js) on every counted beat (every eighth in 6/8), each scheduled once it
   is under 100 ms away, with the card's latency (snipLatency). Every click the SAME tone, beat 1 included (Jonathan,
   2026-11-17: "it would be most useful if the clicks were all the same tone ... instead of beat 1 being a different
   tone"): here the clicks check the grid against the record, not count the bar. The students' card keeps its accent. */
function sbScheduleClicks(a){
  const d = sbDraft(), beat = sbBeatOf(d), bt = sbBt;
  if(!beat || a.paused || typeof getAudioCtx !== 'function' || typeof pcClick !== 'function') return;
  const ctx = getAudioCtx(), m = SB_METER[beat.meter], per = m.bpb * m.sub, now = a.currentTime;
  const bar = Math.max(1, Math.floor(1 + (now - beat.anchor) / sbBarSec(beat)) - 1);
  for(let b = bar; b < bar + 3; b++){
    const s = sbBarTime(beat, b), e = sbBarTime(beat, b + 1);
    for(let k = 0; k < per; k++){
      const t = s + (e - s) * k / per, n = b * per + k;
      if(t < now - 0.01 || n <= bt.lastClick) continue;
      const ahead = t - now;
      if(ahead > 0.1) return;
      const lat = (typeof snipLatency === 'function' ? snipLatency() : 0) - (ctx.outputLatency || ctx.baseLatency || 0);
      bt.clicks.push(pcClick(ctx.currentTime + Math.max(0, ahead + lat), false, typeof PLAYALONG_CLICK_GAIN === 'number' ? PLAYALONG_CLICK_GAIN : 1));
      if(bt.clicks.length > 32) bt.clicks.splice(0, bt.clicks.length - 32);
      bt.lastClick = n;
    }
  }
}
/* Stops the song and every click this step scheduled. keepTaps: a new play from the same step. */
function sbBeatStop(keep){
  const bt = sbBt;
  if(!bt) return;
  if(bt.raf){ cancelAnimationFrame(bt.raf); bt.raf = 0; }
  if(bt.audio){ try{ bt.audio.pause(); bt.audio.removeAttribute('src'); bt.audio.load(); }catch(e){} bt.audio = null; }
  (bt.clicks || []).forEach(o => { try{ o.stop(); }catch(e){} });
  bt.clicks = [];
  if(!keep){ clearTimeout(bt.tapTimer); bt.tapTimer = 0; }
}

/* ── Taps, BPM, meter, bar 1, pins ── */
function sbBeatTap(){
  const d = sbDraft(), bt = sbBtFor(sbSel), lv = sbMem.level;
  if(!d || !lv || !lv.E || sbBusy) return;
  const a = bt.audio;
  if(!a || a.paused){
    bt.taps = []; bt.fit = null;
    const b = sbBeatOf(d);
    sbBeatPlay(b ? Math.max(0, b.anchor - 1) : 0, false);
    teacherSbPaint();
    return;
  }
  bt.taps.push(a.currentTime);
  if(bt.taps.length > 32) bt.taps.shift();
  bt.fit = sbTapFit(bt.taps);
  const line = document.querySelector('[data-sb-tapline]');
  if(line) line.innerHTML = bt.fit ? `${bt.fit.n} taps · <b>${bt.fit.bpm.toFixed(1)} BPM</b> · spread ${Math.round(bt.fit.spreadMs)} ms` : `${bt.taps.length} tap${bt.taps.length === 1 ? '' : 's'}… keep going`;
  document.querySelectorAll('[data-sb-root] .sb-dots i').forEach((el, i) => el.classList.toggle('dim', i >= bt.taps.length));
  clearTimeout(bt.tapTimer);
  if(bt.taps.length >= 8 && bt.fit) bt.tapTimer = setTimeout(() => sbBeatFromBpm(bt.fit.bpm, bt.fit), 1500);
}
/* A tempo (from taps or typed) → the whole grid from the audio, then saved. */
function sbBeatFromBpm(bpm0, fit){
  const d = sbDraft(), lv = sbMem.level, bt = sbBtFor(sbSel);
  if(!d || !lv || !lv.E || sbBusy) return;
  /* The validator's own bounds (builtSongCheck, app/builtsongs.js: 30 to 260; SB-7): a faster grid could not be published. */
  if(!sbBpmOk(bpm0)){ sbNote = SB_BPM_WHY; teacherSbPaint(); return; }
  const meter = (d.beat && d.beat.meter) || bt.meter || '4/4';
  const g = sbAutoGrid(lv.E, lv.mono, lv.fs, d.audio.durationSec, meter, bpm0, fit ? bt.taps : null);
  const beat = Object.assign({}, g.beat, { trackBpm: lv.E.track.bpm, trackSub: lv.E.track.sub,
    tapBpm: fit ? Math.round(fit.bpm * 100) / 100 : null, taps: fit ? fit.n : 0, tapSpreadMs: fit ? Math.round(fit.spreadMs) : null });
  sbBeatSet(d, beat, `The grid: ${sbPinBpm(beat).toFixed(2)} BPM, bar 1 at ${sbFmtT(beat.anchor)}. Check it with Listen with clicks.`);
}
/* The BPM a built song may have (builtSongCheck's bpm rule), and the song's BPM a grid makes (sbSongOf rounds it so). */
const SB_BPM_WHY = 'A BPM from 30 to 260, please. A faster song: count it in two (half the BPM).';
function sbBpmOk(bpm){ return bpm >= 30 && bpm <= 260; }
function sbSongBpm(beat){ return Math.round(sbPinBpm(beat) * 1000) / 1000; }
/* Sets the beat, measures the drift windows, saves the draft (once things settle: 1.2 s after the last change; the
   save is the draft's, sbSaveSoon in teacher-sb-core.js, SB-1). A grid whose song BPM the validator would refuse is not
   set (SB-7, review note: a typed 260 can fit to 260.3, and a pin or a moved bar 1 changes it too), with the typed BPM's
   line, so Level never refuses a BPM the Beat step took. */
function sbBeatSet(d, beat, note, now){
  const lv = sbMem.level, bt = sbBtFor(sbSel);
  beat.bpm = Math.round(sbPinBpm(beat) * 10000) / 10000;
  if(!sbBpmOk(sbSongBpm(beat))){ sbNote = `This grid makes ${sbSongBpm(beat)} BPM. ` + SB_BPM_WHY; teacherSbPaint(); return; }
  bt.drift = sbDrift(lv.E, beat, d.audio.durationSec);
  beat.driftOff = bt.drift.filter(w => w.sure && !w.pinned && Math.abs(w.ms) > SB_DRIFT_MS).length;
  beat.driftFor = d.audio.sha256;            // review R1-6: the copy the windows were measured on
  bt.need = sbPinsNeeded(lv.E, beat, d.audio.durationSec);
  beat.pinsNeeded = bt.need ? bt.need.pins : null;
  d.beat = beat;
  d.step = Math.max(3, Number(d.step) || 1);
  d.unsaved = true;
  if(note != null) sbNote = note;
  sbSaveSoon(sbSel, now ? 0 : 1200);
  teacherSbPaint();
}
function sbBeatAct(act, b){
  const d = sbDraft(), lv = sbMem.level, beat = sbBeatOf(d);
  if(!d || !lv || !lv.E) return;
  if(act === 'tap'){ sbBeatTap(); return; }
  if(act === 'taps-reset'){ const bt = sbBtFor(sbSel); bt.taps = []; bt.fit = null; teacherSbPaint(); return; }
  if(act === 'listen'){ if(beat) sbBeatPlay(Math.max(0, beat.anchor - 1), true); return; }
  if(act === 'listen-bar'){ if(beat){ const bar = Number(b.dataset.sbBar); sbBeatPlay(Math.max(0, sbBarTime(beat, Math.max(1, bar - 2))), true); } return; }
  if(act === 'listen-stop'){ sbBeatStop(); sbDrawAll(); return; }
  if(!beat) return;
  const moveAnchor = dt => {
    const a = Math.max(0, Math.min(d.audio.durationSec - 1, beat.anchor + dt));
    sbBeatSet(d, Object.assign({}, beat, { anchor: Math.round(a * 10000) / 10000, pins: (beat.pins || []).filter(p => p.bar > 1) }), null);
  };
  if(act === 'a-10') return moveAnchor(-0.01);
  if(act === 'a+10') return moveAnchor(0.01);
  /* Clicks on the "and" (Jonathan, 2026-11-16, American Girl: "the clicks are basically exactly half a beat off"):
     the WHOLE grid moves half a beat, bar 1 and every pin, each by half of the beat where it sits, so the grid
     keeps following the record's tempo. (◀ 1 beat ▶ moves the whole grid by one beat the same way: which beat is the
     "1", sbBar1Moved.) */
  if(act === 'a-half' || act === 'a+half'){
    const sign = act === 'a-half' ? -1 : 1, bpb = SB_METER[beat.meter].bpb;
    const half = bar => (sbBarTime(beat, bar + 1) - sbBarTime(beat, bar)) / bpb / 2;
    const a = beat.anchor + sign * half(1);
    if(a < 0 || a > d.audio.durationSec - 1){ sbNote = 'Bar 1 cannot move that way: it would leave the recording.'; teacherSbPaint(); return; }
    const pins = (beat.pins || []).filter(p => p.bar > 1).map(p => ({ bar: p.bar, t: Math.round((p.t + sign * half(p.bar)) * 10000) / 10000 }));
    sbBeatSet(d, Object.assign({}, beat, { anchor: Math.round(a * 10000) / 10000, pins }), `Every bar line moved half a beat ${sign < 0 ? 'earlier' : 'later'}. Listen with clicks again.`);
    return;
  }
  if(act === 'a-beat' || act === 'a+beat'){
    const nb = sbBar1Moved(beat, (act === 'a-beat' ? -1 : 1) * sbBeatAt(beat, 1), d.audio.durationSec);
    if(!nb){ sbNote = 'Bar 1 cannot move that way: it would leave the recording.'; teacherSbPaint(); return; }
    sbBeatSet(d, nb, null);
    return;
  }
  if(act === 'pin' || act === 'unpin'){
    const bar = Number(b.dataset.sbBar);
    if(!(bar > 1)) return;
    let pins = (beat.pins || []).filter(p => p.bar !== bar);
    if(act === 'pin'){ const f = sbFindBar(lv.E, beat, bar); pins = pins.concat([{ bar, t: Math.round(f.t * 10000) / 10000 }]); }
    sbBeatSet(d, Object.assign({}, beat, { pins: pins.sort((x, y) => x.bar - y.bar) }), act === 'pin' ? `Bar ${bar} is pinned to the music.` : `Bar ${bar} is no longer pinned.`, true);
  }
}
/* SB-4 (sweep 2026-11-25). The length of one beat where bar `bar` sits on the grid (s). */
function sbBeatAt(beat, bar){ return (sbBarTime(beat, bar + 1) - sbBarTime(beat, bar)) / SB_METER[beat.meter].bpb; }
/* Bar 1 moved by dt seconds (◀ 1 beat ▶ and the drag). Its WHOLE beats move every bar line: bar 1 and each pin by
   that many beats where it sits, as ½ beat does, so another beat becomes the "1" and the grid still follows the record
   (moving bar 1 alone kept the end pin, and the bars between were squeezed by a beat: mid-song they sat on the "and").
   What is left, under half a beat, moves bar 1 alone, as ±10 ms does. Null when bar 1 would leave the recording. */
function sbBar1Moved(beat, dt, durationSec){
  const a = beat.anchor + dt, k = Math.round(dt / sbBeatAt(beat, 1));
  if(!(a >= 0 && a <= durationSec - 1)) return null;
  const pins = (beat.pins || []).filter(p => p.bar > 1).map(p => ({ bar: p.bar, t: Math.round((p.t + k * sbBeatAt(beat, p.bar)) * 10000) / 10000 }));
  return Object.assign({}, beat, { anchor: Math.round(a * 10000) / 10000, pins });
}
function sbBeatChange(e){
  const t = e.target;
  if(t.matches('[data-sb-bpm]')){ const v = Number(String(t.value).replace(',', '.')); if(Number.isFinite(v)) sbBeatFromBpm(v, null); return; }
}
function sbBeatInput(){}
/* The meter buttons: the grid keeps its tempo and bar 1; the pins (bar numbers of the old meter) are set again. */
document.addEventListener('click', e => {
  const m = e.target && e.target.closest ? e.target.closest('[data-sb-root] [data-sb-meter]') : null;
  if(!m || m.disabled || teacherView !== 'songbuilder') return;
  const d = sbDraft(), lv = sbMem.level, bt = sbBtFor(sbSel), meter = m.dataset.sbMeter;
  bt.meter = meter;
  const beat = sbBeatOf(d);
  if(!beat || !lv || !lv.E){ teacherSbPaint(); return; }
  if(beat.meter === meter) return;
  const nb = Object.assign({}, beat, { meter, pins: [] });
  sbBeatTrack(lv, nb);
  const last = sbBarsIn(nb, d.audio.durationSec);
  if(last >= 8){ const f = sbFindBar(lv.E, nb, last - 2); if(f.sure) nb.pins = [{ bar: last - 2, t: Math.round(f.t * 10000) / 10000 }]; }
  sbBeatSet(d, nb, `Beats in a bar: ${meter === '6/8' ? '6/8 counted in two' : meter.slice(0, 1)}. The pins were set again for the new bar lines.`, true);
});
/* Space bar = TAP, while the Beat step shows and no text box has the focus. */
function sbBeatKey(e){
  if(sbStepOn !== 3 || e.key !== ' ' || e.repeat) return;
  const t = e.target, tag = t && t.tagName;
  if(tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || (t && t.isContentEditable) || tag === 'BUTTON') return;
  if(!document.querySelector('[data-sb-root] [data-sb-act="tap"]')) return;
  e.preventDefault();
  sbBeatTap();
}
/* Dragging bar 1's handle on the main waveform: the grid drawn while dragging is the one that is saved (sbBar1Moved:
   whole beats move every bar line, the rest bar 1 alone; SB-4). */
document.addEventListener('pointerdown', e => {
  const cv = e.target && e.target.closest ? e.target.closest('[data-sb-root] canvas[data-sb-wave="main"]') : null;
  if(!cv || teacherView !== 'songbuilder' || sbBusy) return;
  const d = sbDraft(), beat = sbBeatOf(d), bt = sbBt;
  if(!beat || !bt || !bt.view) return;
  const r = cv.getBoundingClientRect(), v = bt.view, tx = px => v.t0 + (px - r.left) / r.width * (v.t1 - v.t0);
  const hx = r.left + (beat.anchor - v.t0) / (v.t1 - v.t0) * r.width;
  if(Math.abs(e.clientX - hx) > 12) return;
  e.preventDefault();
  try{ cv.setPointerCapture(e.pointerId); }catch(err){}
  const lv = sbMem.level;
  let a = beat.anchor;
  const move = ev => { a = Math.max(0, Math.min(v.t1, tx(ev.clientX))); sbDrawWave(cv, lv, v.t0, v.t1, sbBar1Moved(beat, a - beat.anchor, d.audio.durationSec) || beat, { taps: bt.taps, handle: true, secs: true }); };
  const up = () => {
    cv.removeEventListener('pointermove', move); cv.removeEventListener('pointerup', up); cv.removeEventListener('pointercancel', up);
    /* The draft as it is now (SB-1: a re-read during the drag may have put another copy of it in memory). */
    const cur = sbDraft(), now = sbBeatOf(cur);
    if(!now || Math.abs(a - beat.anchor) <= 0.0005) return;
    const nb = sbBar1Moved(now, a - beat.anchor, cur.audio.durationSec);
    if(nb) sbBeatSet(cur, nb, null);
    else { sbNote = 'Bar 1 cannot move that way: it would leave the recording.'; teacherSbPaint(); }
  };
  cv.addEventListener('pointermove', move); cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
});
