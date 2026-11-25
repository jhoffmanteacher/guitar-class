/* ════════════════════════════════════════════════════════════════════
   RIFF RUNNER — the class songs as a scrolling-TAB lane game. Six lanes
   are the six strings, drawn like real TAB (thin high e on top, thick
   low E on the bottom); fret numbers slide toward a hit line and the
   student presses that string's key (1–6) — or taps its lane — as each
   one crosses. A hit PLAYS that note through the plucked-string synth,
   so playing well means hearing the riff; a miss plays nothing. Songs
   unlock in order and each song has three speed levels; both unlock at
   90% accuracy. Same audio-clock scheduling as Strum Hero: a lookahead
   scheduler keeps the click steady, taps are bridged in via an epoch
   pair. No mic.
   ════════════════════════════════════════════════════════════════════ */

const RN_TIERS = [
  { pct: 0.6, labelKey: 'games.riff.tier.slow' },
  { pct: 0.8, labelKey: 'games.riff.tier.medium' },
  { pct: 1,   labelKey: 'games.riff.tier.full' }
];

/* Riff data extracted from the site's OWN journey-page tabs (never from
   memory — tabs/seven-nation-army.html, all-along-the-watchtower.html,
   luna.html, sweet-child-o-mine.html). notes = [string, fret, beat,
   label]: string 6 = low E, beat counts from lap start. Beats follow the
   site's TEACHING rhythm, not the records': Seven Nation Army is taught
   as straight quarter notes (the journey page defers the real syncopation
   to external TAB), and Luna's beats are 6/8 DOWNBEATS felt in 2 — its
   bpm is downbeat BPM and its bars are 2 beats. "Sweet Child" substitutes
   the Layer-2 verse bass roots because the intro arpeggio is not tabbed
   anywhere on this site. Extra fields beyond {id,title,hint,bpm,notes}:
   sub (song-card line), bpb (beats per bar), loopBeats (lap length,
   including the closing rest), laps (times through per round). */
const RN_SONGS = [
  { id: 'sna', title: '"Seven Nation Army"',
    subKey: 'games.riff.song.sna.sub',
    hintKey: 'games.riff.song.sna.hint',
    bpm: 60, bpb: 4, loopBeats: 8, laps: 4,
    notes: [[5,7,0,'E'],[5,7,1,'E'],[5,10,2,'G'],[5,7,3,'E'],[5,5,4,'D'],[5,3,5,'C'],[5,2,6,'B']] },
  { id: 'watchtower', title: '"All Along the Watchtower"',
    subKey: 'games.riff.song.watchtower.sub',
    hintKey: 'games.riff.song.watchtower.hint',
    bpm: 80, bpb: 4, loopBeats: 8, laps: 4,
    // The record's rhythm (measured, Jonathan confirmed it by ear, 2026-10-26).
    // Bar 1: A on 1 & 2 &, G on 3 & 4 & (four eighths each). Bar 2: F on 1 & 2,
    // rest, G on the "&" of 3, on 4 and on the "&" of 4.
    notes: [[6,5,0,'A5'],[6,5,0.5,'A5'],[6,5,1,'A5'],[6,5,1.5,'A5'],
            [6,3,2,'G5'],[6,3,2.5,'G5'],[6,3,3,'G5'],[6,3,3.5,'G5'],
            [6,1,4,'F5'],[6,1,4.5,'F5'],[6,1,5,'F5'],
            [6,3,6.5,'G5'],[6,3,7,'G5'],[6,3,7.5,'G5']] },
  { id: 'luna', title: '"Luna"',
    subKey: 'games.riff.song.luna.sub',
    hintKey: 'games.riff.song.luna.hint',
    bpm: 80, bpb: 2, loopBeats: 12, laps: 4,
    notes: [[6,1,0,'F'],[6,1,1,'F'],[6,1,2,'F'],[6,1,3,'F'],[5,0,4,'Am'],[5,0,5,'Am'],[5,0,6,'Am'],[5,0,7,'Am'],[6,10,8,'D'],[6,13,9,'F'],[5,10,10,'G']] },
  { id: 'sweetchild', title: '"Sweet Child O’ Mine"',
    subKey: 'games.riff.song.sweetchild.sub',
    hintKey: 'games.riff.song.sweetchild.hint',
    bpm: 60, bpb: 4, loopBeats: 32, laps: 1,
    notes: [[5,5,0,'D'],[5,5,4,'D'],[5,3,8,'C'],[5,3,12,'C'],[6,3,16,'G'],[6,3,20,'G'],[5,5,24,'D'],[5,5,28,'D']] }
];

let rn = null, rnRaf = null;

function rnStop(){
  if (rnRaf){ cancelAnimationFrame(rnRaf); rnRaf = null; }
  document.removeEventListener('keydown', rnKeydown);
  if (rn){
    if (rn.sched){ clearInterval(rn.sched); rn.sched = null; }
    rnHearStop();
    if (rn.micOn){ rn.micOn = false; coachMicOff(); }   // Wait Mode owned the mic
    (rn.timeouts || []).forEach(clearTimeout);
    rn = null;
  }
}

function rnBody(){ return document.getElementById('rn-body'); }
function rnBestKey(songId){ return 'rnBest:' + songId; }

/* Session best per song: JSON {acc, tier} — best accuracy ever, plus the
   highest speed level CLEARED at 90%+ (-1 = none yet). */
function rnBestSession(songId){
  try {
    const b = JSON.parse(sessionStorage.getItem(rnBestKey(songId)));
    if (b && b.acc > 0) return { acc: Math.round(b.acc), tier: typeof b.tier === 'number' ? b.tier : -1 };
  } catch(e){}
  return null;
}

/* Unlocks read the max of the session best and the Firestore best, so a
   signed-in student keeps unlocks across days and a dev-bypass session
   (which never loads Firestore) still progresses within the session. */
function rnBestMerged(songId){
  const sess = rnBestSession(songId);
  let fs = null;
  if (typeof games !== 'undefined' && games && games.rn && games.rn.songs){
    const g = games.rn.songs[songId];
    if (g && g.acc > 0) fs = { acc: Math.round(g.acc), tier: typeof g.tier === 'number' ? g.tier : -1 };
  }
  if (!sess) return fs;
  if (!fs) return sess;
  return { acc: Math.max(sess.acc, fs.acc), tier: Math.max(sess.tier, fs.tier) };
}

function rnSongUnlocked(i){
  if (i === 0) return true;
  const b = rnBestMerged(RN_SONGS[i - 1].id);
  return !!b && b.tier >= 2;
}

function rnTierUnlocked(songId, t){
  if (t === 0) return true;
  const b = rnBestMerged(songId);
  return !!b && b.tier >= t - 1;
}

function rnTierBpm(song, t){ return Math.round(song.bpm * RN_TIERS[t].pct); }
function rnTierName(tier){
  const keys = ['games.riff.tier.slowCleared', 'games.riff.tier.mediumCleared', 'games.riff.tier.fullCleared'];
  return keys[tier] ? t(keys[tier]) : '';
}

function rnSetup(){
  rn = { phase: 'select', songIdx: 0, tier: 0, timeouts: [], pv: null, guitar: false, micOn: false };
  try {
    const sid = sessionStorage.getItem('rnSong');
    const i = RN_SONGS.findIndex(sg => sg.id === sid);
    if (i >= 0 && rnSongUnlocked(i)) rn.songIdx = i;
    rn.guitar = sessionStorage.getItem('rnMode') === 'guitar';
  } catch(e){}
  rnRenderSelect();
}

function rnShowSelect(){
  if (!rn) return;
  rnHearStop();
  rn.phase = 'select';
  rnRenderSelect();
}

function rnRenderSelect(){
  const body = rnBody();
  if (!body || !rn) return;
  const cards = RN_SONGS.map((song, i) => {
    const unlocked = rnSongUnlocked(i);
    const b = rnBestMerged(song.id);
    let meta;
    if (!unlocked){
      meta = `<span class="rn-song-lock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg> ${t('games.riff.clearToUnlock', {title: escHtml(RN_SONGS[i - 1].title)})}</span>`;
    } else if (b){
      meta = `<span class="rn-song-best">${t('games.riff.bestPercent', {pct: b.acc})}${b.tier >= 0 ? ' &middot; ' + t('games.riff.clearedTier', {tier: rnTierName(b.tier)}) : ''}</span>`;
    } else {
      meta = `<span class="rn-song-best dim">${t('games.riff.notPlayedYet')}</span>`;
    }
    return `<button type="button" class="rn-song${unlocked ? '' : ' locked'}" ${unlocked ? `onclick="rnPick(${i})"` : 'disabled'}>
       <span class="rn-song-title">${escHtml(song.title)}</span>
       <span class="rn-song-sub">${escHtml(t(song.subKey))}</span>
       ${meta}
     </button>`;
  }).join('');
  body.innerHTML =
    `<div class="coach-tip rn-center">${t('games.riff.tipHowToPlay')}</div>
     <div class="rn-songs">${cards}</div>`;
}

function rnPick(i){
  if (!rn || !rnSongUnlocked(i)) return;
  rnHearStop();
  rn.songIdx = i;
  const song = RN_SONGS[i];
  try { sessionStorage.setItem('rnSong', song.id); } catch(e){}
  /* Default to the fastest speed level the student has unlocked. */
  let t = 0;
  while (t < 2 && rnTierUnlocked(song.id, t + 1)) t++;
  rn.tier = t;
  rn.phase = 'ready';
  rnRenderReady();
}

function rnPickTier(t){
  if (!rn || rn.phase !== 'ready') return;
  const song = RN_SONGS[rn.songIdx];
  /* Wait Mode is a practice aid, so every speed is open — the whole point is
     to build up from slow to full tempo. The timed Keys game keeps its ladder. */
  if (!rn.guitar && !rnTierUnlocked(song.id, t)) return;
  rnHearStop();
  rn.tier = t;
  rnRenderReady();
}

function rnRenderReady(msg){
  const body = rnBody();
  if (!body || !rn) return;
  const song = RN_SONGS[rn.songIdx];
  let anyLocked = false;
  const pills = RN_TIERS.map((tr, ti) => {
    const un = rnTierUnlocked(song.id, ti);
    if (!un) anyLocked = true;
    return `<button type="button" class="ts-btn${ti === rn.tier ? ' active' : ''}${un ? '' : ' rn-locked'}" ${un ? `onclick="rnPickTier(${ti})"` : 'disabled'}>${t(tr.labelKey)} &middot; ${rnTierBpm(song, ti)} BPM</button>`;
  }).join('');
  const b = rnBestMerged(song.id);
  /* Mode toggle: "Keys / tap" is the timed groove game; "My guitar" is Wait
     Mode — the tab holds each note until you actually play it, no clock. */
  const modeToggle =
    `<div class="cc-group"><div class="cc-group-title">${t('games.riff.howToPlayTitle')}</div>
       <div class="fret-levels rn-modes">
         <button type="button" class="ts-btn${rn.guitar ? '' : ' active'}" onclick="rnSetMode(false)">&#x2328;&#xFE0F; ${t('games.riff.modeKeysTap')}</button>
         <button type="button" class="ts-btn${rn.guitar ? ' active' : ''}" onclick="rnSetMode(true)">&#x1F3B8; ${t('games.riff.modeMyGuitar')}</button>
       </div></div>`;
  const keysUi =
    `<div class="cc-group"><div class="cc-group-title">${t('games.riff.speedLevelTitle')}</div><div class="fret-levels">${pills}</div></div>
     ${anyLocked ? `<div class="coach-tip rn-center">${t('games.riff.tipUnlockNext')}</div>` : ''}
     ${b ? `<div class="coach-tip rn-center">${t('games.riff.bestPercent', {pct: b.acc})}${b.tier >= 0 ? ' &middot; ' + t('games.riff.clearedTier', {tier: rnTierName(b.tier)}) : ''}.</div>` : ''}
     <div class="coach-tip rn-center">${t('games.riff.tipKeysLegend')}</div>`;
  const guitarUi =
    `<div class="coach-tip rn-center">&#x1F3B8; ${t('games.wait.modeDescriptionHtml')}</div>` + coachSetupLineHtml(true);
  body.innerHTML =
    (msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '') +
    `<div class="rn-ready-title">${escHtml(song.title)}</div>
     <div class="coach-tip rn-center">${escHtml(t(song.hintKey))}</div>
     ${modeToggle}
     ${rn.guitar ? guitarUi : keysUi}
     <div class="coach-actions">
       <button type="button" class="tp-btn" id="rn-hear" onclick="rnHear()">&#x1F50A; ${t('games.riff.hearItButton')}</button>
       <button type="button" class="tp-btn" onclick="rnShowSelect()">&#x2190; ${t('games.riff.allSongsButton')}</button>
     </div>
     <button type="button" class="coach-start" onclick="rnStart()">${rn.guitar ? '&#x1F3B8; ' + t('games.riff.startPlayItButton') : '&#x25B6; ' + t('games.common.start')}</button>`;
}

/* Toggle timed-keys vs. guitar Wait Mode from the ready screen. */
function rnSetMode(guitar){
  if (!rn || rn.phase !== 'ready') return;
  rnHearStop();
  rn.guitar = !!guitar;
  try { sessionStorage.setItem('rnMode', rn.guitar ? 'guitar' : 'keys'); } catch(e){}
  rnRenderReady();
}

/* playNote's guitar note, at a future audio-clock start time so "Hear it"
   can schedule the whole riff ahead. Returns the source so an early Stop can
   silence notes that haven't sounded yet. Goes through playNote() (app.js
   loads first on index.html) so Riff Runner gets the same recorded guitar
   as every TAB Play button, and the synth fallback when a note isn't
   downloaded yet — it used to build its own synth buffer here. */
function rnPluckAt(midi, t, line, group){
  if (line) return gameVoice(line, group, midi, PLUCK_VOICE_GAIN, t);
  return playNote(midi, PLUCK_VOICE_GAIN, t).src;
}

/* A guitarist lifts the last note as the next one sounds. A recorded note
   left alone rings for three seconds, so a riff preview turned into a wash
   (app.js damps its own lines the same way: playSeqDamp). gameVoice plays
   one note and fades out the previous group the moment this one starts.
   `line` = { group, voices }, one per preview; notes that share a `group`
   (one strum, one chord) ring together. Returns the source so a Stop can
   still cut it. `at` is an audio-clock time, or omitted for now. */
function gameLine(){ return { group: null, voices: [] }; }
function gameVoice(line, group, midi, gain, at){
  const v = playNote(midi, gain, at);
  const when = at || getAudioCtx().currentTime;
  if (line.group !== group){
    line.voices.forEach(p => {
      try {
        p.gain.gain.setTargetAtTime(0, when, PLAY_SEQ_DAMP_TC);
        p.src.stop(when + PLAY_SEQ_DAMP_TC * 8);
      } catch(e){ /* already stopped */ }
    });
    line.voices = [];
    line.group = group;
  }
  line.voices.push(v);
  return v.src;
}

/* "Hear it" — the teaching moment: play one lap of the riff through the
   synth at the chosen speed, scheduled on the audio clock. Free and
   repeatable; the button toggles. */
async function rnHear(){
  const s = rn;
  if (!s || s.phase !== 'ready') return;
  if (s.pv){ rnHearStop(); return; }
  if (typeof getAudioCtx !== 'function') return;
  stopAllDemoAudio();
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended'){
    try { await ctx.resume(); } catch(e){}
  }
  if (rn !== s || s.phase !== 'ready' || s.pv) return;   // switched during the resume
  if (!rnBody()){ rnStop(); return; }
  const song = RN_SONGS[s.songIdx];
  const spb = 60 / rnTierBpm(song, s.tier);
  s.pv = { ctx, spb, notes: song.notes, idx: 0, srcs: [], line: gameLine(),
           startAt: ctx.currentTime + 0.15, sched: setInterval(rnPvSchedule, 25) };
  rnPvSchedule();
  const btn = document.getElementById('rn-hear');
  if (btn) btn.innerHTML = '&#x25A0; ' + t('games.common.stop');
  /* The auto-stop belongs to THIS preview — guard on its identity and let
     rnHearStop clear it, or a timer from an earlier, manually-stopped
     preview would silence a later one mid-riff. */
  const pv = s.pv;
  pv.autoStop = setTimeout(() => { if (rn === s && s.pv === pv) rnHearStop(); },
    (0.15 + song.loopBeats * spb + 1.6) * 1000);
  s.timeouts.push(pv.autoStop);
}

function rnPvSchedule(){
  const s = rn;
  if (!s || !s.pv) return;
  const pv = s.pv;
  const horizon = pv.ctx.currentTime + 0.12;
  while (pv.idx < pv.notes.length){
    const nt = pv.notes[pv.idx];
    const t = pv.startAt + nt[2] * pv.spb;
    if (t >= horizon) break;
    pv.srcs.push(rnPluckAt(STRING_OPEN_MIDI[nt[0]] + nt[1], t, pv.line, nt[2]));
    pv.idx++;
  }
  if (pv.idx >= pv.notes.length && pv.sched){ clearInterval(pv.sched); pv.sched = null; }
}

function rnHearStop(){
  const s = rn;
  if (!s || !s.pv) return;
  if (s.pv.autoStop) clearTimeout(s.pv.autoStop);
  if (s.pv.sched) clearInterval(s.pv.sched);
  s.pv.srcs.forEach(src => { try { src.stop(); } catch(e){} });
  s.pv = null;
  const btn = document.getElementById('rn-hear');
  if (btn) btn.innerHTML = '&#x1F50A; ' + t('games.riff.hearItButton');
}

/* One metronome click at an exact audio-clock time — Strum Hero's voice
   (gameClickAt: every click 660 Hz), but softer during play so the plucked
   riff notes stay on top of the pulse. */
function rnClickAt(t, loud){ gameClickAt(rn.ctx, t, loud ? 0.25 : 0.12); }

/* Combo streak at which the click fades out for the rest of the round — the
   student's timing has clearly locked onto the tempo on its own, so the
   crutch backs off. Reuses the exact threshold the score multiplier already
   steps up at (see rnPress/rnHudRefresh's "×2 at 8 in a row"), rather than
   inventing a fresh number — the HUD already taught the student what "8 in
   a row" means. No mic is involved in this game (keys/taps only), so an
   audible click can safely keep running right up to that point with zero
   risk of being picked up as a false "note" the way it would in a
   mic-graded drill (see coachLoop/srLoop/nrLoop, which deliberately never
   play a click during graded listening for exactly that reason). */
const RN_METRONOME_FADE_COMBO = 8;

/* Lookahead scheduler (the "two clocks" pattern, same as Strum Hero):
   every ~25ms, post any click due in the next ~120ms at its exact
   audio-clock time. 4 count-in clicks, then a quieter pulse, every click
   of each the same (gameClickAt) — until the student's
   combo crosses RN_METRONOME_FADE_COMBO, after which play-phase clicks go
   silent (the count-in always stays audible; s.nextClick bookkeeping still
   advances either way so the schedule itself doesn't drift). */
function rnSchedule(){
  const s = rn;
  if (!s || (s.phase !== 'countin' && s.phase !== 'play')) return;
  const horizon = s.ctx.currentTime + 0.12;
  while (s.nextClick < 4 + s.totalBeats){
    const t = s.startAt + s.nextClick * s.spb;
    if (t >= horizon) break;
    const countin = s.nextClick < 4;
    if (countin || !s.clickMuted){
      rnClickAt(t, countin);
    }
    s.nextClick++;
  }
}

async function rnStart(){
  if (!rn || rn.phase === 'countin' || rn.phase === 'play' || rn.phase === 'wait') return;
  if (rn.guitar) return rnwStart();   // Wait Mode: untimed, mic-graded
  if (typeof getAudioCtx !== 'function'){ rnRenderReady(t('games.riff.noSoundMsg')); return; }
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  rnHearStop();
  const s = rn;
  s.phase = 'countin';
  stopAllDemoAudio();
  const ctx = getAudioCtx();
  /* We schedule on the audio clock, so a suspended (autoplay-blocked)
     clock must actually be running before we capture the epoch — hence
     the await, with the usual stale guard. */
  if (ctx.state === 'suspended'){
    try { await ctx.resume(); } catch(e){}
  }
  if (rn !== s || s.phase !== 'countin') return;   // panel switched during the resume
  if (!rnBody()){ rnStop(); return; }

  const song = RN_SONGS[s.songIdx];
  s.ctx = ctx;
  s.bpm = rnTierBpm(song, s.tier);
  s.spb = 60 / s.bpm;                              // seconds per beat (Luna: per downbeat)
  s.bpb = song.bpb;
  s.totalBeats = song.loopBeats * song.laps;
  s.totalBars = s.totalBeats / s.bpb;
  /* Clock bridge: DOM presses arrive in performance.now() ms; clicks live
     on ctx.currentTime seconds. One epoch pair converts between them. */
  s.epoch = performance.now() - ctx.currentTime * 1000;
  s.startAt = ctx.currentTime + 0.25;              // count-in beat 1
  s.t0 = s.startAt + 4 * s.spb;                    // lap 1, beat 1
  s.notes = [];
  for (let lap = 0; lap < song.laps; lap++){
    song.notes.forEach(nt => s.notes.push({
      string: nt[0], fret: nt[1], label: nt[3] || '',
      t: s.t0 + (lap * song.loopBeats + nt[2]) * s.spb, result: null
    }));
  }
  /* Hit windows: Perfect ±70ms, Good ±140ms — capped at 45% of the
     smallest gap between consecutive notes at this tempo, so neighbouring
     windows can't overlap. */
  let minGap = Infinity;
  for (let i = 1; i < s.notes.length; i++) minGap = Math.min(minGap, s.notes[i].t - s.notes[i - 1].t);
  s.good = Math.min(0.140, 0.45 * minGap);
  s.perfect = Math.min(0.070, s.good);
  s.score = 0; s.combo = 0; s.maxCombo = 0; s.extras = 0;
  s.errs = [];                                     // signed press errors (s), for the early/late line
  s.sweepIdx = 0; s.lastBeat = -1; s.nextClick = 0;
  s.clickMuted = false; s.tightCombo = 0;           // fresh round: click starts on every time
  rnRenderPlay();
  s.els = s.notes.map((_, i) => document.getElementById('rn-n-' + i));
  s.laneEls = {};
  for (let k = 1; k <= 6; k++) s.laneEls[k] = document.getElementById('rn-lane-' + k);
  document.addEventListener('keydown', rnKeydown);   // keys 1–6 = strings 1–6
  if (s.sched) clearInterval(s.sched);
  s.sched = setInterval(rnSchedule, 25);
  rnSchedule();
  if (rnRaf) cancelAnimationFrame(rnRaf);
  rnLoop();
}

function rnRenderPlay(){
  const body = rnBody();
  if (!body || !rn) return;
  const s = rn;
  const names = { 1: 'e', 2: 'B', 3: 'G', 4: 'D', 5: 'A', 6: 'E' };
  const lanes = [];
  for (let str = 1; str <= 6; str++){
    const toks = s.notes.map((n, i) => n.string !== str ? '' :
      `<span class="rn-token" id="rn-n-${i}">${n.label ? `<span class="rn-token-label">${escHtml(n.label)}</span>` : ''}<span class="rn-token-fret">${n.fret}</span></span>`
    ).join('');
    lanes.push(`<div class="rn-lane" id="rn-lane-${str}" onpointerdown="rnLaneTap(${str}, event)"><span class="rn-lane-name">${str} ${names[str]}</span>${toks}</div>`);
  }
  body.innerHTML =
    `<div class="sh-hud">
       <span class="sh-score" id="rn-score">${t('games.common.score', {n: 0})}</span>
       <span class="sh-combo" id="rn-combo">&nbsp;</span>
       <span class="rn-metro-status" id="rn-metro-status">${t('games.riff.metroOn')}</span>
       <span class="sh-bar" id="rn-bar">${t('games.riff.getReady')}</span>
     </div>
     <div class="cc-beats" id="rn-beats">${'<span class="cc-pip"></span>'.repeat(s.bpb)}</div>
     <div class="rn-track" id="rn-track">${lanes.join('')}<div class="rn-hitline"></div><div class="rn-count" id="rn-count">&nbsp;</div></div>
     <div class="coach-tip rn-center">${t('games.riff.tipPressString')}</div>
     <button type="button" class="tp-btn coach-stop" onclick="rnFinish()">&#x25A0; ${t('games.common.stop')}</button>`;
}
/* Reflects s.clickMuted into the HUD (fires once, right when the fade
   happens — no need to poll it every frame). */
function rnMetroStatusRefresh(){
  const el = document.getElementById('rn-metro-status');
  if (!el || !rn) return;
  el.textContent = t(rn.clickMuted ? 'games.riff.metroOff' : 'games.riff.metroOn');
  el.classList.toggle('rn-metro-off', !!rn.clickMuted);
}

function rnKeydown(e){
  if (e.key.length !== 1 || e.key < '1' || e.key > '6') return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  if (e.repeat) return;
  rnPress(parseInt(e.key, 10), e.timeStamp);
}

function rnLaneTap(str, e){
  rnPress(str, e.timeStamp);
}

function rnHudRefresh(){
  const s = rn;
  const scoreEl = document.getElementById('rn-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', {n: s.score});
  const comboEl = document.getElementById('rn-combo');
  if (comboEl){
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));
    comboEl.innerHTML = s.combo >= 4
      ? '&#x1F525; ' + t('games.common.inARow', {n: s.combo}) + (mult > 1 ? ' &mdash; &times;' + mult : '')
      : '&nbsp;';
  }
}

/* Brief amber pulse on a lane after a wrong-string or stray press. */
function rnLaneFlash(str){
  const s = rn;
  const el = s && s.laneEls && s.laneEls[str];
  if (!el) return;
  el.classList.add('wrong');
  s.timeouts.push(setTimeout(() => {
    if (rn === s && s.laneEls[str]) s.laneEls[str].classList.remove('wrong');
  }, 180));
}

/* One press: bridge it onto the audio clock, then match it against open
   tokens. A press only ever HITS tokens on its own string — pressing a
   different string while a token is crossing kills that token (miss, no
   score) and flashes the pressed lane, so mashing all six keys can't win.
   A hit sounds the note through the synth; a miss stays silent. */
function rnPress(str, ts){
  const s = rn;
  if (!s || (s.phase !== 'countin' && s.phase !== 'play')) return;
  const t = (ts - s.epoch) / 1000;
  if (t < s.t0 - s.good) return;         // still the count-in: free
  let best = -1, bestAbs = Infinity, near = -1, nearAbs = Infinity;
  for (let i = 0; i < s.notes.length; i++){
    const n = s.notes[i];
    if (n.result) continue;
    if (n.t - t > s.good) break;         // time-sorted — the rest are too far ahead
    const a = Math.abs(n.t - t);
    if (a > s.good) continue;
    if (a < nearAbs){ nearAbs = a; near = i; }
    if (n.string === str && a < bestAbs){ bestAbs = a; best = i; }
  }
  if (best >= 0){
    const n = s.notes[best];
    // The reward: the riff itself, each hit lifting the one before (gameVoice).
    if (typeof playNote === 'function') gameVoice(s.rewardLine || (s.rewardLine = gameLine()), best + ':' + n.t, STRING_OPEN_MIDI[n.string] + n.fret);
    s.errs.push(t - n.t);
    s.combo++;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));   // ×2 at 8 in a row, cap ×4
    if (bestAbs <= s.perfect){
      n.result = 'perfect';
      s.score += 100 * mult;
      if (s.els[best]) s.els[best].classList.add('hit-perfect');
      /* Metronome fade: only PERFECT presses (the tight window) build the
         streak — a "good" is still a hit, but not tight enough timing to
         start trusting the student without the click. */
      s.tightCombo++;
      if (!s.clickMuted && s.tightCombo >= RN_METRONOME_FADE_COMBO){
        s.clickMuted = true;
        rnMetroStatusRefresh();
      }
    } else {
      n.result = 'good';
      s.score += 50 * mult;
      if (s.els[best]) s.els[best].classList.add('hit-good');
      s.tightCombo = 0;
    }
  } else if (near >= 0){
    const n = s.notes[near];             // wrong string while a token was in its window
    n.result = 'miss';
    s.combo = 0; s.tightCombo = 0;
    if (s.els[near]) s.els[near].classList.add('miss');
    rnLaneFlash(str);
  } else if (t >= s.t0){
    s.extras++;                          // stray press, nothing near: small penalty
    s.combo = 0; s.tightCombo = 0;
    s.score = Math.max(0, s.score - 10);
    rnLaneFlash(str);
  }
  rnHudRefresh();
}

function rnLoop(){
  if (!rn) return;
  if (!rnBody()){ rnStop(); return; }   // panel swapped under us
  const s = rn;
  const now = s.ctx.currentTime;

  if (s.phase === 'countin'){
    const el = document.getElementById('rn-count');
    if (now >= s.t0){
      s.phase = 'play';
      if (el) el.innerHTML = '&nbsp;';
    } else if (now >= s.startAt && el){
      el.textContent = String(Math.min(4, Math.floor((now - s.startAt) / s.spb) + 1));
    }
  }

  /* Token positions are a pure function of the audio clock — JS transforms,
     not CSS animations (reduced-motion zeroes those). Wide tracks show 2
     bars of lookahead right of the hit line, narrow ones 1 bar. */
  const track = document.getElementById('rn-track');
  if (track){
    const w = track.clientWidth;
    const hitX = w * 0.22;
    const lookBeats = (w < 480 ? 1 : 2) * s.bpb;
    const pxPerSec = (w - hitX) / (lookBeats * s.spb);
    for (let i = 0; i < s.notes.length; i++){
      const el = s.els[i];
      if (!el) continue;
      const x = hitX + (s.notes[i].t - now) * pxPerSec;
      if (x < -40 || x > w + 40){
        el.style.visibility = 'hidden';
      } else {
        el.style.visibility = 'visible';
        el.style.transform = 'translateX(' + x + 'px)';
      }
    }
  }

  if (s.phase === 'play'){
    /* Tokens past their window (+150ms grace) become misses — silently:
       no sound for a missed note IS the feedback. */
    while (s.sweepIdx < s.notes.length && s.notes[s.sweepIdx].result) s.sweepIdx++;
    for (let i = s.sweepIdx; i < s.notes.length; i++){
      const n = s.notes[i];
      if (n.t + s.good + 0.15 > now) break;
      if (!n.result){
        n.result = 'miss';
        s.combo = 0; s.tightCombo = 0;
        if (s.els[i]) s.els[i].classList.add('miss');
        rnHudRefresh();
      }
    }

    const beat = Math.floor((now - s.t0) / s.spb);
    if (beat !== s.lastBeat && beat >= 0){
      s.lastBeat = beat;
      const bar = Math.floor(beat / s.bpb);
      const barEl = document.getElementById('rn-bar');
      if (barEl && bar < s.totalBars) barEl.textContent = t('games.riff.barOfTotal', {bar: bar + 1, total: s.totalBars});
      document.querySelectorAll('#rn-beats .cc-pip').forEach((el, i) => el.classList.toggle('on', i === beat % s.bpb));
    }

    if (now > s.t0 + s.totalBeats * s.spb + 0.4){ rnFinish(true); return; }
  }
  rnRaf = requestAnimationFrame(rnLoop);
}

function rnFinish(complete){
  if (!rn || (rn.phase !== 'play' && rn.phase !== 'countin')) return;
  const s = rn;
  if (s.sched){ clearInterval(s.sched); s.sched = null; }
  if (rnRaf){ cancelAnimationFrame(rnRaf); rnRaf = null; }
  document.removeEventListener('keydown', rnKeydown);
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  s.notes.forEach(n => { if (!n.result) n.result = 'miss'; });   // early Stop: the rest never got pressed
  s.phase = 'done';
  const song = RN_SONGS[s.songIdx];
  const total = s.notes.length;
  const nPerfect = s.notes.filter(n => n.result === 'perfect').length;
  const nGood = s.notes.filter(n => n.result === 'good').length;
  s.acc = total ? Math.round(100 * (nPerfect + 0.5 * nGood) / total) : 0;
  const cleared = s.acc >= 90 ? s.tier : -1;
  const prev = rnBestMerged(song.id) || { acc: 0, tier: -1 };
  s.prevSess = rnBestSession(song.id);
  s.newTier = cleared >= 0 && cleared > prev.tier && s.tier < 2;
  s.newSong = cleared === 2 && prev.tier < 2 && s.songIdx < RN_SONGS.length - 1;
  if (s.acc > (s.prevSess ? s.prevSess.acc : 0) || cleared > (s.prevSess ? s.prevSess.tier : -1)){
    const old = s.prevSess || { acc: 0, tier: -1 };
    try {
      sessionStorage.setItem(rnBestKey(song.id),
        JSON.stringify({ acc: Math.max(old.acc, s.acc), tier: Math.max(old.tier, cleared) }));
    } catch(e){}
  }
  /* Cross-session best + unlocks → the student's progress doc. Skipped in
     dev bypass (Firestore rejects that uid; the session best still counts). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const g = (games.rn && games.rn.songs && games.rn.songs[song.id]) || { acc: 0, tier: -1 };
    const isNewBest = s.acc > g.acc || cleared > g.tier;
    if (isNewBest){
      if (!games.rn) games.rn = { songs: {} };
      if (!games.rn.songs) games.rn.songs = {};
      games.rn.songs[song.id] = { acc: Math.max(g.acc, s.acc), tier: Math.max(g.tier, cleared) };
      games.rn.at = new Date().toISOString().slice(0, 10);
    }
    // XP is participation credit for an actual round — an immediate Start →
    // Stop is not one, and nor is a round with no note hit.
    if (complete && nPerfect + nGood > 0) awardArcadeXp(isNewBest);
    // Saved on its own — see shFinish.
    if (isNewBest) saveGames();
  }
  rnRenderDone();
}

function rnRenderDone(){
  const body = rnBody();
  if (!body || !rn) return;
  const s = rn;
  const song = RN_SONGS[s.songIdx];
  const total = s.notes.length;
  const nPerfect = s.notes.filter(n => n.result === 'perfect').length;
  const nGood = s.notes.filter(n => n.result === 'good').length;
  const nMiss = total - nPerfect - nGood;
  const stars = s.acc >= 90 ? 3 : s.acc >= 70 ? 2 : s.acc >= 50 ? 1 : 0;
  const starHtml = '&#x2605;'.repeat(stars) + '&#x2606;'.repeat(3 - stars);

  let verdict, advice;
  if (stars === 3){
    verdict = t('games.riff.verdict.three', {acc: s.acc});
    advice = s.tier < 2 ? t('games.riff.advice.threeMore') : t('games.riff.advice.threeMax');
  } else if (stars === 2){
    verdict = t('games.riff.verdict.two', {acc: s.acc});
    advice = t('games.riff.advice.two');
  } else if (stars === 1){
    verdict = t('games.riff.verdict.one', {acc: s.acc});
    advice = t('games.riff.advice.one');
  } else {
    verdict = t('games.riff.verdict.zero', {acc: s.acc});
    advice = s.tier > 0
      ? t('games.riff.advice.zeroSlower')
      : t('games.riff.advice.zeroHearIt');
  }

  /* Early/late bias — median signed error over the graded presses. Only
     shown with enough presses to mean something. */
  let biasLine = '';
  if (s.errs.length >= 4){
    const med = tunerMedian(s.errs) * 1000;
    if (Math.abs(med) > 25){
      biasLine = `<div class="coach-tip rn-center">${med < 0
        ? t('games.riff.biasEarly', {ms: Math.round(-med)})
        : t('games.riff.biasLate', {ms: Math.round(med)})}</div>`;
    }
  }

  let bestLine = '';
  const pb = s.prevSess ? s.prevSess.acc : 0;
  if (pb > 0 && s.acc > pb){
    bestLine = `<div class="sh-newbest">&#x1F3C6; ${t('games.riff.newBest', {prevBest: pb + '%'})}</div>`;
  } else if (pb > 0){
    bestLine = `<div class="coach-tip rn-center">${t('games.common.bestTodayValue', {value: pb + '%'})}</div>`;
  }

  let unlockHtml = '';
  if (s.newSong){
    unlockHtml = `<div class="rn-unlock" id="rn-unlock">&#x1F513; ${t('games.riff.newSongUnlocked', {title: escHtml(RN_SONGS[s.songIdx + 1].title)})}</div>`;
  } else if (s.newTier){
    unlockHtml = `<div class="rn-unlock" id="rn-unlock">&#x1F513; ${t('games.riff.newTierUnlocked', {tier: escHtml(t(RN_TIERS[s.tier + 1].labelKey)), bpm: rnTierBpm(song, s.tier + 1)})}</div>`;
  }

  const canUp = s.tier < 2 && rnTierUnlocked(song.id, s.tier + 1);
  const rec = stars >= 3 ? (canUp ? 'up' : 'same') : stars >= 1 ? 'same' : (s.tier > 0 ? 'down' : 'same');
  body.innerHTML =
    `<div class="coach-report">
       <div class="sh-done-score">${s.score}</div>
       <div class="sh-stars">${starHtml}</div>
       <div class="coach-overall">&#x1F3C3; ${escHtml(verdict)}</div>
       <div class="coach-strip">
         <span class="coach-chip ok">${t('games.riff.chipPerfect', {n: nPerfect})}</span>
         <span class="coach-chip good">${t('games.riff.chipGood', {n: nGood})}</span>
         <span class="coach-chip miss">${t('games.riff.chipMiss', {n: nMiss})}</span>
         ${s.extras ? `<span class="coach-chip dim">${t('games.riff.chipExtraPresses', {n: s.extras})}</span>` : ''}
       </div>
       ${s.maxCombo >= 8 ? `<div class="coach-tip rn-center">${t('games.riff.longestStreak', {n: s.maxCombo})}</div>` : ''}
       ${biasLine}
       ${bestLine}
       ${unlockHtml}
       ${stars === 3 ? `<div class="coach-tip rn-center">&#x1F3B8; ${t('games.riff.tipPlayOnRealGuitar')}</div>` : ''}
       <div class="coach-crit-note">${escHtml(advice)}</div>
       <div class="coach-actions">
         ${s.tier > 0 ? `<button type="button" class="${rec === 'down' ? 'coach-start' : 'tp-btn'}" onclick="rnAgain(-1)">&#x2B07; ${t('games.riff.slowerButton')}</button>` : ''}
         <button type="button" class="${rec === 'same' ? 'coach-start' : 'tp-btn'}" onclick="rnAgain(0)">&#x21BB; ${t('games.common.again', { bpm: rnTierBpm(song, s.tier) })}</button>
         ${canUp ? `<button type="button" class="${rec === 'up' ? 'coach-start' : 'tp-btn'}" onclick="rnAgain(1)">&#x2B06; ${t('games.riff.fasterButton')}</button>` : ''}
       </div>
       ${s.songIdx < RN_SONGS.length - 1 && rnSongUnlocked(s.songIdx + 1) ? `<button type="button" class="tp-btn" onclick="rnPick(${s.songIdx + 1})">${t('games.riff.nextSongButton')} &#x2192;</button>` : ''}
       <button type="button" class="tp-btn" onclick="rnShowSelect()">&#x2190; ${t('games.riff.allSongsButton')}</button>
     </div>`;
  if (s.newSong || s.newTier) rrCelebrate(document.getElementById('rn-unlock'));
}

function rnAgain(d){
  if (!rn) return;
  const song = RN_SONGS[rn.songIdx];
  const t = Math.min(2, Math.max(0, rn.tier + d));
  if (rnTierUnlocked(song.id, t)) rn.tier = t;
  rn.phase = 'ready';
  rnStart();
}

/* ════════════════════════════════════════════════════════════════════
   RIFF RUNNER — WAIT MODE (guitar). Play the riff on a real guitar, one
   note at a time, at your own pace — no clock. The mic must HEAR the
   right pitch before the tab moves to the next note, so there's nothing
   to fall behind on. (Dropped the metronome/count-in this mode shipped
   with originally — real-guitar testing found it confusing: the click
   implied a fixed rhythm to match, but the tab was already waiting on
   pitch, not time, so the two signals fought each other. The timed Keys
   game is where tempo/rhythm practice lives.) Idea from PickHero's Wait
   Mode. Reuses the coach's mic pipeline + trimmed-YIN detector
   (coachDetectPitch, the same one Note Hunt grades single notes with)
   for listening. Practice aid — no score, no unlocks; the timed Keys
   game still owns scoring and progression. One pass through the riff's
   notes.
   ════════════════════════════════════════════════════════════════════ */

/* Friendly spoken name for a string, e.g. 6 → "low E", 1 → "high e". */
const RNW_STRING_SAY_KEYS = { 6: 'games.wait.string.lowE', 5: 'games.wait.string.a', 4: 'games.wait.string.d',
  3: 'games.wait.string.g', 2: 'games.wait.string.b', 1: 'games.wait.string.highE' };
function rnwWhere(n){
  const string = t(RNW_STRING_SAY_KEYS[n.string]);
  return n.fret === 0 ? t('games.wait.stringOpen', {string}) : t('games.wait.stringFret', {string, fret: n.fret});
}

/* The pitches that answer token n (2026-10-12). A token labelled as a
   power chord ('A5', 'G5', 'F5' — Watchtower) says "Play A5", so a
   student strums the power chord: the root plus the fifth (and often the
   octave) on two or three strings. Until now only the root counted, and
   YIN reads a strum like that as the root, the fifth, the octave or
   nothing at all — A2 + E3 only repeats every 55 Hz, under
   coachDetectPitch's 60 Hz floor. A synthetic strum registered 0 times
   in 40, so the student saw nothing happen and had to Skip. Now a
   power-chord token takes the root, the fifth or the octave; a
   single-note token still takes only its exact note; and a note that is
   none of them keeps the wrong-note hints.
   The targets alone changed nothing: at the 0.22 gate YIN found NO pitch
   in most strums. So these tokens read each window at 0.22 first and,
   only when that finds nothing, again at 0.45 (RNW_POWER_CLARITY). A
   clean single note still reads at 0.22, as before.
   Why not 0.55 alone, the Coach's chord-mode gate? With a weak low
   fundamental (a laptop mic) it read a single root an octave sharp, so a
   right note got a "wrong note" hint (7 of 60). It also counted a note
   one fret low as right (31 of 60), and an open low E as A5 (50 of 60).
   A second tier of 0.5 or 0.55 gave right strums false "wrong" hints
   (9 and 19 of 60). The 0.22-then-0.45 pair counted no wrong note right
   and gave no false hint in any quiet-room case tried. A strum counted
   first time, quiet / one loud neighbour / classroom (tune.mjs's rooms):
   0 / 1 / 1% before, 100 / 56 / 83% now. The cost: in those loud rooms a
   neighbour's note on the fifth or octave now and then answers for a
   wrong note (about 1 in 100, from 0).
   Still missed: with strong low fundamentals, a two-string root+fifth,
   and a strum whose root string is quietest, still read as nothing. They
   stay silent, as before, and never get a wrong hint.
   ALL of this is synthetic audio (tools/mic-sim's approach, 2026-10-12),
   NOT a real guitar through a Chromebook mic. Check it with the console's
   Mic recordings before tuning it further. */
const RNW_POWER_RE = /^[A-G][#b]?5$/;
const RNW_POWER_CLARITY = [0.22, 0.45];
/* coachPowerTargets(rootMidi) (root, 5th, octave) lives in app.js, which always
   loads before this file. Riff Runner's Wait Mode below is its only user: Note
   Call takes the root, the octave and the octave below, not the 5th. */
function rnwIsPower(n){ return !!n && RNW_POWER_RE.test(n.label || ''); }
/* What Wait Mode tells the student to play: a power chord's own name ("Play A5"),
   otherwise the note itself. A chord label on a single-note token ('Am' on Luna's
   open A) is chord context for the Keys-mode lane; "Play Am" would ask for a chord
   strum that rnwTargets below does not accept. */
function rnwSay(n){ return rnwIsPower(n) ? n.label : coachNoteName(n.midi); }
function rnwTargets(n){
  if (!n) return null;
  return rnwIsPower(n) ? coachPowerTargets(n.midi) : [n.midi];
}

async function rnwStart(){
  const song = RN_SONGS[rn.songIdx];
  const body = rnBody();
  if (!body) return;
  /* One mic owner at a time — hand the pipeline over cleanly. */
  coachClose(); ccStop(); coachEvictTuner();
  rnHearStop();
  if (rn.sched){ clearInterval(rn.sched); rn.sched = null; }
  const s = rn;
  s.phase = 'wait';
  body.innerHTML = `<div class="coach-tip rn-center">${t('games.common.startingMic')}</div>`;
  if (!coachStream && !(await coachAcquireMic({ el: body }))){
    if (rn === s){ s.phase = 'ready'; rnRenderReady(coachMicFailMsg()); }
    return;
  }
  await coachEnsureRunning();
  if (rn !== s || !rnBody()){ coachReleaseMicIfIdle(); return; }   // panel closed during the prompt
  if (document.hidden){
    coachMicOff();
    s.phase = 'ready';
    rnRenderReady(t('games.wait.pausedBackground'));
    return;
  }
  stopAllDemoAudio();
  s.micOn = true;
  window.coachMicLive = true;
  /* One pass through the riff's notes (no laps — laps are the timed groove).
     beat = each note's beat within the pass, kept only so the tab can space
     notes visually like the riff's rhythm shape — no clock enforces it. */
  s.wait = {
    notes: song.notes.map(nt => ({ string: nt[0], fret: nt[1], label: nt[3] || '',
      midi: STRING_OPEN_MIDI[nt[0]] + nt[1], beat: nt[2], result: null })),
    cur: 0, tries: 0, firstTry: 0, readings: [],
    needSilence: false, cooldownUntil: 0, lastPitchT: 0, advTimer: null, hint: '', heard: ''
  };
  rnwRender();
  if (rnRaf) cancelAnimationFrame(rnRaf);
  rnwLoop();
}

function rnwRender(){
  const body = rnBody();
  if (!body || !rn || !rn.wait) return;
  const w = rn.wait;
  const names = { 1: 'e', 2: 'B', 3: 'G', 4: 'D', 5: 'A', 6: 'E' };
  const lanes = [];
  for (let str = 1; str <= 6; str++){
    const toks = w.notes.map((n, i) => n.string !== str ? '' :
      `<span class="rn-token rnw-token" id="rnw-n-${i}">${n.label ? `<span class="rn-token-label">${escHtml(n.label)}</span>` : ''}<span class="rn-token-fret">${n.fret}</span></span>`
    ).join('');
    lanes.push(`<div class="rn-lane" id="rnw-lane-${str}"><span class="rn-lane-name">${str} ${names[str]}</span>${toks}</div>`);
  }
  const cur = w.notes[w.cur];
  body.innerHTML =
    `<div class="sh-hud">
       <span class="sh-score">${t('games.wait.noteOfTotal', {n: Math.min(w.cur + 1, w.notes.length), total: w.notes.length})}</span>
       <span class="sh-bar rnw-live" id="rnw-live"><span class="coach-live-dot"></span>${t('games.wait.playWheneverReady')}</span>
     </div>
     <div class="rn-track rnw-track" id="rnw-track">${lanes.join('')}<div class="rn-hitline"></div></div>
     <div class="rnw-target" id="rnw-target">
       <div class="rnw-target-note">${t('games.wait.playNoteHtml', {note: escHtml(rnwSay(cur))})}</div>
       <div class="rnw-target-where">${escHtml(rnwWhere(cur))}</div>
     </div>
     <div class="rnw-feedback" id="rnw-feedback">&nbsp;</div>
     <div class="coach-actions">
       <button type="button" class="tp-btn" onclick="rnwSkip()">${t('games.wait.skipNoteButton')} &#x2192;</button>
       <button type="button" class="tp-btn coach-stop" onclick="rnwFinish()">&#x25A0; ${t('games.common.stop')}</button>
     </div>`;
  rnwPositionTokens(false);
}

/* Slide the lane so the current target sits on the purple hit line; past notes
   to its left, upcoming ones to its right. Spacing is proportional to the notes'
   BEAT gaps (no clock enforces them — it's just so the tab reads like the
   riff's rhythm shape) — a note two beats away sits twice as far as a note
   one beat away. Pure JS transform (reduced-motion just gets no CSS
   transition — see the stylesheet). */
function rnwPositionTokens(animate){
  const w = rn && rn.wait;
  const track = document.getElementById('rnw-track');
  if (!w || !track) return;
  const tw = track.clientWidth;
  const hitX = tw * 0.22;
  const pxPerBeat = Math.max(40, Math.min(92, (tw - hitX) / 5));   // ~5 beats visible ahead
  const curBeat = w.notes[w.cur] ? w.notes[w.cur].beat : 0;
  for (let i = 0; i < w.notes.length; i++){
    const el = document.getElementById('rnw-n-' + i);
    if (!el) continue;
    const x = hitX + (w.notes[i].beat - curBeat) * pxPerBeat;
    if (x < -50 || x > tw + 50){ el.style.visibility = 'hidden'; continue; }
    el.style.visibility = 'visible';
    el.classList.toggle('rnw-cur', i === w.cur && !w.notes[i].result);
    el.classList.toggle('rnw-past', i < w.cur || !!w.notes[i].result);
    el.style.transform = 'translateX(' + x + 'px)';
  }
}

function rnwLoop(){
  if (!rn || rn.phase !== 'wait') return;
  if (!coachAnalyser || !document.getElementById('rnw-track')){ rnStop(); return; }
  const w = rn.wait;
  const now = performance.now();

  const rms = coachReadFrame();
  /* One pluck = one answer: after a reading, wait for the note to decay
     (or 1.8s) before listening again — same gate Note Hunt uses. */
  if (w.needSilence && (rms < COACH_PITCH_GATE * 0.7 || now > w.cooldownUntil + 1800)){
    w.needSilence = false;
  }
  /* Readings are spaced by wall clock, not frame parity: the analyser
     window is ~43ms, so readings closer together than that all see the
     SAME window (and can sit inside the pick attack). >=40ms apart makes
     the 3-reading consensus span more than one window at any refresh
     rate — same spacing nrLoop uses. */
  if (!w.needSilence && now >= w.cooldownUntil && rms > COACH_PITCH_GATE){
    /* The shared onset detector runs in this loop too: coachSettlePitch
       (coachOnsetTick) moves attackT to a new pluck it hears, and
       coachIdleTick (below) does while waiting for silence. When neither has,
       the first frame over the gate after silence stands in for the pluck.
       Readings wait out COACH_ATTACK_SKIP from attackT, the guard the Coach
       and Note Runner use. */
    if (!w.attackT) w.attackT = Math.max(coachOnsetAt, w.cooldownUntil);
    const n = w.notes[w.cur];
    const m = coachSettlePitch(w, rnwTargets(n), rms, w.cooldownUntil,
                               rnwIsPower(n) ? RNW_POWER_CLARITY : undefined);
    if (m != null) rnwJudge(m);
  } else {
    if (rms < COACH_PITCH_GATE * 0.5){
      w.readings = [];
      w.attackT = 0;    // note died — next gate crossing is a new pluck
    }
    coachIdleTick(w, rms, w.cooldownUntil);     // a new pluck ends the wait for silence
  }
  rnRaf = requestAnimationFrame(rnwLoop);
}

function rnwJudge(midi){
  const w = rn.wait, n = w.notes[w.cur];
  w.readings = [];
  w.attackT = 0;
  w.needSilence = true;
  w.cooldownUntil = performance.now() + 350;
  w.tries++;
  if (rnwTargets(n).indexOf(midi) >= 0){     // correct note (or power-chord tone) — advance
    n.result = w.tries === 1 ? 'first' : 'ok';
    if (w.tries === 1) w.firstTry++;
    /* No note playback: at tempo the student is already playing it, so the
       synth would clash with their own guitar. Just confirm and move on. */
    rnwFeedback('&#x2713; ' + escHtml(rnwSay(n)), 'ok');
    const el = document.getElementById('rnw-n-' + w.cur);
    if (el) el.classList.add('rnw-hit');
    /* Stored on w as well as rn.timeouts: rnwAdvance clears it, so a Skip
       tapped inside the 220ms can't stack a second advance on top. */
    w.advTimer = setTimeout(rnwAdvance, 220);
    rn.timeouts.push(w.advTimer);
    return;
  }
  const heard = coachNoteName(midi);
  const d = n.midi - midi;
  if (d % 12 === 0){
    const key = midi > n.midi ? 'games.wait.octaveHigh' : 'games.wait.octaveLow';
    rnwFeedback(t(key, {where: escHtml(rnwWhere(n))}), 'near');
  } else if (Math.abs(d) <= 9){
    const plural = Math.abs(d) > 1;
    const key = d > 0
      ? (plural ? 'games.wait.nearFretUpPlural' : 'games.wait.nearFretUpSingular')
      : (plural ? 'games.wait.nearFretDownPlural' : 'games.wait.nearFretDownSingular');
    rnwFeedback(t(key, {heard: escHtml(heard), n: Math.abs(d)}), 'near');
  } else {
    rnwFeedback(t('games.wait.nearFarOff', {heard: escHtml(heard), target: escHtml(rnwSay(n))}), 'near');
  }
}

function rnwFeedback(html, cls){
  const el = document.getElementById('rnw-feedback');
  if (el){ el.innerHTML = html; el.className = 'rnw-feedback ' + (cls || ''); }
}

function rnwAdvance(){
  if (!rn || rn.phase !== 'wait') return;
  const w = rn.wait;
  /* Any pending auto-advance dies here — whether this call IS that timer
     firing or a Skip beat it to the punch, the note advances exactly once. */
  if (w.advTimer){ clearTimeout(w.advTimer); w.advTimer = null; }
  w.cur++;
  w.tries = 0;
  w.readings = [];
  w.attackT = 0;
  if (w.cur >= w.notes.length){ rnwFinish(); return; }
  /* Update the target readout + slide the lane; don't re-render the whole
     panel so the mic loop and lane keep running smoothly. */
  const n = w.notes[w.cur];
  const tEl = document.getElementById('rnw-target');
  if (tEl) tEl.innerHTML =
    `<div class="rnw-target-note">${t('games.wait.playNoteHtml', {note: escHtml(rnwSay(n))})}</div>
     <div class="rnw-target-where">${escHtml(rnwWhere(n))}</div>`;
  const hud = document.querySelector('#rn-body .sh-score');
  if (hud) hud.textContent = t('games.wait.noteOfTotal', {n: w.cur + 1, total: w.notes.length});
  rnwFeedback('&nbsp;', '');
  rnwPositionTokens(true);
}

function rnwSkip(){
  if (!rn || rn.phase !== 'wait') return;
  const w = rn.wait, n = w.notes[w.cur];
  if (n && !n.result) n.result = 'skip';
  rnwAdvance();
}

function rnwFinish(){
  if (!rn || rn.phase !== 'wait') return;
  if (rnRaf){ cancelAnimationFrame(rnRaf); rnRaf = null; }
  const w = rn.wait;
  (rn.timeouts || []).forEach(clearTimeout);
  rn.timeouts = [];
  if (rn.micOn){ rn.micOn = false; coachMicOff(); }
  rn.phase = 'done';
  const played = w.notes.filter(n => n.result && n.result !== 'skip').length;
  const total = w.notes.length;
  const first = w.firstTry;
  let verdict, advice;
  if (played === total && first === total){
    verdict = t('games.wait.verdict.allFirstTry');
    advice = t('games.wait.advice.allFirstTry');
  } else if (played === total){
    verdict = t('games.wait.verdict.allPlayed', {first, total});
    advice = t('games.wait.advice.allPlayed');
  } else {
    verdict = t('games.wait.verdict.partial', {played, total});
    advice = t('games.wait.advice.partial');
  }
  const body = rnBody();
  if (!body) return;
  body.innerHTML =
    `<div class="coach-report">
       <div class="coach-overall">&#x1F3B8; ${escHtml(verdict)}</div>
       <div class="coach-crit-note">${escHtml(advice)}</div>
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="rnwAgain()">&#x21BB; ${t('games.wait.playAgainButton')}</button>
         <button type="button" class="tp-btn" onclick="rnGoReady()">&#x2699;&#xFE0F; ${t('games.wait.modeButton')}</button>
       </div>
       ${rn.songIdx < RN_SONGS.length - 1 && rnSongUnlocked(rn.songIdx + 1) ? `<button type="button" class="tp-btn" onclick="rnPick(${rn.songIdx + 1})">${t('games.riff.nextSongButton')} &#x2192;</button>` : ''}
       <button type="button" class="tp-btn" onclick="rnShowSelect()">&#x2190; ${t('games.riff.allSongsButton')}</button>
     </div>`;
}

function rnwAgain(){
  if (!rn) return;
  rn.phase = 'ready';
  rnwStart();
}

/* Back to the ready screen (speed + mode chooser) from a Wait-Mode result. */
function rnGoReady(){
  if (!rn) return;
  rn.phase = 'ready';
  rnRenderReady();
}

/* DELIBERATE BRIDGE, remove after 2026-12-01 (todo.md lists it): a page opened before the 2026-11-16
   split still holds the old part list in app/boot.js, which never names coach-noterunner.js, so coach-runner.js
   asks for it here. It also writes the new part into that list (a later ensureCoachJs() waits for it, and fetches
   it again if it failed) and makes the part the old list's loader asks for next (coach-more.js, where bcStop
   lives) wait for it, so that loader runs the parts in the new order and fails with its own "could not load"
   message if the new part does not arrive. A page with the new list skips this block. */
if (typeof COACH_JS_PARTS !== 'undefined' && COACH_JS_PARTS.indexOf('coach-noterunner.js') < 0 && COACH_JS_PARTS.indexOf('coach-runner.js') >= 0 && typeof loadScriptOnce === 'function'){
  const at = COACH_JS_PARTS.indexOf('coach-runner.js') + 1, next = COACH_JS_PARTS[at];
  COACH_JS_PARTS.splice(at, 0, 'coach-noterunner.js');
  const part = loadScriptOnce('coach-noterunner.js');
  if (next && typeof _lazyScripts !== 'undefined' && !_lazyScripts[next]){
    _lazyScripts[next] = part.then(() => { delete _lazyScripts[next]; return loadScriptOnce(next); },
                                   e => { delete _lazyScripts[next]; throw e; });
  } else part.catch(() => {});
}
