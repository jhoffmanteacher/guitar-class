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
    `<div class="coach-tip rn-center">&#x1F3B8; ${t('games.wait.modeDescriptionHtml')}</div>`;
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
   (660 normal / 990 accent), but softer during play so the plucked riff
   notes stay on top of the pulse. */
function rnClickAt(t, accent, loud){ gameClickAt(rn.ctx, t, accent, loud ? 0.25 : 0.12); }

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
   audio-clock time. 4 count-in clicks (beat 4 high, like coachCountIn),
   then a quiet pulse with beat 1 of each bar accented — until the student's
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
      rnClickAt(t, countin ? s.nextClick === 3 : (s.nextClick - 4) % s.bpb === 0, countin);
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
  if (!coachStream && !(await coachAcquireMic())){
    if (rn === s){ s.phase = 'ready'; rnRenderReady(coachMicFailMsg('games.common.micAccessDenied')); }
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
       <div class="rnw-target-note">${t('games.wait.playNoteHtml', {note: escHtml(cur.label || coachNoteName(cur.midi))})}</div>
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
    /* No onset detector in this loop — the first frame over the gate after
       silence IS the pluck. Readings wait out COACH_ATTACK_SKIP from there,
       same guard the Coach and Note Runner use from their onset timestamp. */
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
    rnwFeedback('&#x2713; ' + escHtml(n.label || coachNoteName(n.midi)), 'ok');
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
    rnwFeedback(t('games.wait.nearFarOff', {heard: escHtml(heard), target: escHtml(n.label || coachNoteName(n.midi))}), 'near');
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
    `<div class="rnw-target-note">${t('games.wait.playNoteHtml', {note: escHtml(n.label || coachNoteName(n.midi))})}</div>
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

/* ════════════════════════════════════════════════════════════════════
   NOTE RUNNER — a Guitar-Hero-style note ladder for the low E and A
   strings through fret 12. Each level GENERATES a fresh exercise (never
   the same twice): fret ranges widen 0–3 → 5 → 7 → 12 while rhythms
   ramp from straight quarters through halves/wholes/rests and eighths
   to sixteenth bursts. Two TAB-style lanes (Riff Runner's track, cut
   to A over low E) scroll toward the hit line and the student plays
   each note on a REAL guitar: the Coach's onset + YIN pipeline grades
   pitch AND timing against a FIXED beat grid — this is the timed game,
   so no adaptive drift; the scrolling track itself is the beat anchor
   (Strum Radar's silent-click grid has no visual anchor, hence its
   easing — this one does, hence none).
   Speaker audio during grading would bleed into the mic (see Strum
   Radar's design note), so the count-in clicks, then goes SILENT — the
   scrolling notes and pulsing beat pips carry the tempo. No synth
   reward on hits either; the reward is the student's own guitar.
   A per-device mic-latency offset (nrMicOffset, localStorage — it's a
   property of the MACHINE, so it outlives the session) shifts every
   onset earlier before grading: classroom Chromebooks hear a pick
   ~40–120ms after it happens, which would grade honest playing as
   "late" forever. Default 50ms (was 70 — see coachMicLatencyMs); the ready
   screen has the slider.
   ════════════════════════════════════════════════════════════════════ */

const NR_PASS = 80;   // % accuracy that clears a level and unlocks the next

/* Rhythm tiers: each pattern is one 4/4 bar as [beat, durBeats] events.
   A gap between events is space; beats listed in 'rests' additionally get
   a visible rest glyph (a written rest the student should count through
   reads differently from mid-phrase emptiness). */
const NR_RHYTHMS = {
  q:   { nameKey: 'games.nr.tier.q', patterns: [
          { ev: [[0,1],[1,1],[2,1],[3,1]] } ] },
  long:{ nameKey: 'games.nr.tier.long', patterns: [
          { ev: [[0,2],[2,1],[3,1]] },
          { ev: [[0,1],[1,1],[2,2]] },
          { ev: [[0,4]] },
          { ev: [[0,1],[2,1],[3,1]], rests: [1] },
          { ev: [[0,1],[1,1],[3,1]], rests: [2] },
          { ev: [[0,2],[2,2]] } ] },
  e8:  { nameKey: 'games.nr.tier.e8', patterns: [
          { ev: [[0,.5],[.5,.5],[1,1],[2,1],[3,1]] },
          { ev: [[0,1],[1,.5],[1.5,.5],[2,1],[3,1]] },
          { ev: [[0,1],[1,1],[2,.5],[2.5,.5],[3,1]] },
          { ev: [[0,1],[1,1],[2,1],[3,.5],[3.5,.5]] } ] },
  e8s: { nameKey: 'games.nr.tier.e8s', patterns: [
          { ev: [[0,.5],[.5,.5],[1,.5],[1.5,.5],[2,1],[3,1]] },
          { ev: [[0,.5],[.5,.5],[1,1],[2,.5],[2.5,.5],[3,1]] },
          { ev: [[0,.5],[.5,.5],[1,.5],[1.5,.5],[2,.5],[2.5,.5],[3,1]] },
          { ev: [[0,1],[1,.5],[1.5,.5],[2,1],[3,.5],[3.5,.5]] },
          { ev: [[0,.5],[.5,.5],[1,1],[3,1]], rests: [2] } ] },
  s16: { nameKey: 'games.nr.tier.s16', patterns: [
          { ev: [[0,.25],[.25,.25],[.5,.5],[1,1],[2,1],[3,1]] },
          { ev: [[0,1],[1,.25],[1.25,.25],[1.5,.5],[2,1],[3,1]] },
          { ev: [[0,.5],[.5,.5],[1,1],[2,.25],[2.25,.25],[2.5,.5],[3,1]] },
          { ev: [[0,.25],[.25,.25],[.5,.25],[.75,.25],[1,1],[2,1],[3,1]] } ] }
};

/* The ladder. strings use the site's numbering (6 = low E, 5 = A);
   tiers are drawn easy→hard across the round's bars. Tempos stay modest:
   above ~85 BPM the eighth/sixteenth gaps close on the onset detector's
   refractory window (COACH_ONSET_REFRACT). */
const NR_LEVELS = [
  { nameKey:'games.nr.lv1',  strings:[6],   maxFret:3,  tiers:['q'],             bpm:72, bars:4 },
  { nameKey:'games.nr.lv2',  strings:[5],   maxFret:3,  tiers:['q'],             bpm:72, bars:4 },
  { nameKey:'games.nr.lv3',  strings:[6,5], maxFret:3,  tiers:['q'],             bpm:76, bars:4 },
  { nameKey:'games.nr.lv4',  strings:[6,5], maxFret:3,  tiers:['long'],          bpm:76, bars:4 },
  { nameKey:'games.nr.lv5',  strings:[6,5], maxFret:5,  tiers:['q','long'],      bpm:80, bars:4 },
  { nameKey:'games.nr.lv6',  strings:[6,5], maxFret:3,  tiers:['e8'],            bpm:66, bars:4 },
  { nameKey:'games.nr.lv7',  strings:[6,5], maxFret:5,  tiers:['e8'],            bpm:72, bars:4 },
  { nameKey:'games.nr.lv8',  strings:[6,5], maxFret:7,  tiers:['q','long','e8'], bpm:80, bars:4 },
  { nameKey:'games.nr.lv9',  strings:[6,5], maxFret:7,  tiers:['e8s'],           bpm:72, bars:4 },
  { nameKey:'games.nr.lv10', strings:[6,5], maxFret:12, tiers:['q','long','e8'], bpm:84, bars:4 },
  { nameKey:'games.nr.lv11', strings:[6,5], maxFret:12, tiers:['e8s'],           bpm:76, bars:4 },
  { nameKey:'games.nr.lv12', strings:[6,5], maxFret:12, tiers:['e8s','s16'],     bpm:63, bars:4 },
  /* Power-chord branch: chords:true switches the generator to power-chord
     shapes rooted on the E and A strings (maxFret bounds the ROOT) and the
     grader to the Coach's chord-tone vote — single-pitch consensus is the
     wrong test for a strum (see coachFinalizeEvent's note). chordHold =
     beats before the chord may change, so lines chug like real power-chord
     riffs instead of shape-hopping every strum. `after` reroutes the
     unlock: clearing level 5 (index 4, both strings to fret 5) opens this
     branch — power chords shouldn't have to wait behind sixteenth notes.
     Within the branch, levels chain normally. */
  { nameKey:'games.nr.lv13', strings:[6,5], maxFret:3, tiers:['q','long'], bpm:66, bars:4, chords:true, chordHold:4, after:4 },
  { nameKey:'games.nr.lv14', strings:[6,5], maxFret:7, tiers:['q','long'], bpm:72, bars:4, chords:true, chordHold:2 },
  { nameKey:'games.nr.lv15', strings:[6,5], maxFret:5, tiers:['e8s'],      bpm:66, bars:4, chords:true, chordHold:4 }
];

/* ── Adaptive mode — the game's front door is ONE Play button ──
   The stage order walks the melody ladder with the power-chord branch
   interleaved right after its level-5 prerequisite, so chords start
   showing up mid-journey instead of after sixteenth notes. Results move
   the student along it: ≥90% steps up a stage, <65% steps back one
   (unless the round smells like a MIC problem — an unclear-heavy round
   means the machine couldn't hear, not that the student can't play),
   anything between stays put. The full level picker survives behind a
   "practice a specific skill" door for targeted work (and for pointing
   the whole class at one thing).
   Weak spots: every missed or wrong-note position bumps a small score in
   a per-student map ('string:fret', 'c:'-prefixed for chords); the
   generator re-deals live weak spots ~⅓ of the time, and clean hits pay
   the score back down until the entry retires. Map + stage persist in
   games.nr for signed-in students. */
const NR_ADAPT_ORDER = [0, 1, 2, 3, 4, 12, 5, 6, 13, 7, 8, 14, 9, 10, 11];
const NR_UP_PCT = 90, NR_DOWN_PCT = 65;

let nr = null, nrRaf = null;
let nrOffsetMs = null;   // lazy-read from localStorage on first use
let nrWeakMap = null;    // hydrated once per page from games.nr.weak

function nrWeak(){
  if (!nrWeakMap){
    nrWeakMap = {};
    if (typeof games !== 'undefined' && games && games.nr && games.nr.weak){
      for (const k in games.nr.weak){
        const v = games.nr.weak[k] | 0;
        if (v > 0) nrWeakMap[k] = Math.min(6, v);
      }
    }
  }
  return nrWeakMap;
}
function nrWeakKey(n){ return (n.chord ? 'c:' : '') + n.string + ':' + n.fret; }

function nrStagePos(){
  // games.nr.stage (Firestore-synced) is preferred over the sessionStorage
  // cache: within one tab's session they're always written together (see
  // nrFinish), so this loses nothing there, but a tab left open across
  // days/devices would otherwise keep replaying its own stale cached
  // position forever instead of picking up progress made elsewhere.
  // sessionStorage is the fallback for when Firestore data isn't in yet
  // (dev bypass, signed-out, or the very first paint of a fresh load).
  if (typeof games !== 'undefined' && games && games.nr && typeof games.nr.stage === 'number'){
    return Math.max(0, Math.min(NR_ADAPT_ORDER.length - 1, games.nr.stage));
  }
  let p = -1;
  try { p = parseInt(sessionStorage.getItem('nrStagePos'), 10); } catch(e){}
  return Math.max(0, Math.min(NR_ADAPT_ORDER.length - 1, p >= 0 ? p : 0));
}
function nrSetStagePos(p){
  try { sessionStorage.setItem('nrStagePos', String(p)); } catch(e){}
}
/* A non-button sign-out (token revoked, remote sign-out) skips app.js's normal
   reload, so every game's sessionStorage-cached "today's best" / in-progress
   picks would otherwise survive into the next signed-in user's session on a
   shared Chromebook — not just Note Runner's weak-spot map (which is also
   in-memory and leaks the same way), but the *Best:<id> caches, Riff
   Roulette's rrDone/rrPts/rrQueue daily counters, and every game's
   remembered deck/pattern/tempo choice. The ordinary signOut() path in
   app.js already runs a full sessionStorage.clear(); this is the one other
   path auth can resolve to null from, so it needs the same result without
   also reloading (see the comment on the caller). Prefix-matched rather
   than one sessionStorage.clear() call so a cold signed-out load — this
   branch's OTHER, far more common trigger — never wipes something outside
   the games arcade that happens to be sitting in sessionStorage at boot. */
const GAMES_SESSION_KEY_PREFIXES = [
  'bcDeck', 'bcBest:', 'cbDeck', 'cbDir', 'cbBest2:', 'ccBpm', 'ccProg', 'ccRate', 'ccBest:',
  'pwBpm', 'pwProg', 'pwRate',
  'cdDeck', 'cdBest2:', 'fgBest:', 'fretLevel', 'fzDeck', 'fzBest:', 'nrStagePos', 'nrBest:',
  'ntrBest', 'pdBest', 'psBest', 'psgBest', 'rnMode', 'rnSong', 'rnBest:',
  'rrBenched', 'rrDay', 'rrDone', 'rrLast', 'rrPts', 'rrQueue', 'rrSkips',
  'shBpm', 'shPat', 'shBest:', 'srBpm', 'srPat', 'srBest:',
  // The Listening Coach's per-card streak (coach.streakKey).
  'coachStreak:',
  // app.js's own session caches: the shuffle-drill and deck bests and the
  // Note Call progress (sdSessionKey, dkBest, ncProgKey).
  'sdBest:', 'dkBest:', 'nc:'
];
function gamesResetForUser(){
  nrWeakMap = null;
  try {
    for (let i = sessionStorage.length - 1; i >= 0; i--){
      const k = sessionStorage.key(i);
      if (k && GAMES_SESSION_KEY_PREFIXES.some(p => k === p || k.indexOf(p) === 0)) sessionStorage.removeItem(k);
    }
  } catch(e){}
}

function nrBody(){ return document.getElementById('nr-body'); }
/* The level a round is running. Finger Gym puts its own level object on the
   state (s.lv) and borrows the rest of the engine unchanged. */
function nrLv(s){ return (s && s.lv) || NR_LEVELS[s.level]; }
function nrBestKey(i){ return 'nrBest:' + i; }

function nrOffset(){
  if (nrOffsetMs === null){
    let v = NaN;
    try { v = parseInt(localStorage.getItem('nrMicOffset'), 10); } catch(e){}
    nrOffsetMs = (v >= 0 && v <= 250) ? v : 50;
  }
  return nrOffsetMs;
}
function nrSetOffset(v){
  nrOffsetMs = Math.max(0, Math.min(250, parseInt(v, 10) || 0));
  try { localStorage.setItem('nrMicOffset', String(nrOffsetMs)); } catch(e){}
  const el = document.getElementById('nr-off-lbl');
  if (el) el.textContent = nrOffsetMs + ' ms';
}

/* Session best per level (accuracy %), merged with the Firestore best the
   same way Riff Runner merges — so unlocks survive across days for a
   signed-in student and still progress within a dev-bypass session. */
function nrBestSession(i){
  let v = 0;
  try { v = parseInt(sessionStorage.getItem(nrBestKey(i)), 10) || 0; } catch(e){}
  return v;
}
function nrBestMerged(i){
  let fs = 0;
  if (typeof games !== 'undefined' && games && games.nr && games.nr.levels){
    fs = games.nr.levels[i] || 0;
  }
  return Math.max(nrBestSession(i), fs);
}
/* Which level must be cleared before level i opens (see `after` above). */
function nrReq(i){
  const a = NR_LEVELS[i].after;
  return a !== undefined ? a : i - 1;
}
function nrUnlocked(i){
  /* Teacher + localhost dev bypass preview any level — same rule as the
     set gate (app.js isGatePreviewer): they're checking content and
     demoing for the class, not earning the ladder. */
  if (typeof isGatePreviewer === 'function' && isGatePreviewer()) return true;
  return i === 0 || nrBestMerged(nrReq(i)) >= NR_PASS;
}

function nrStop(){
  if (nrRaf){ cancelAnimationFrame(nrRaf); nrRaf = null; }
  if (nr){
    nrHearStop();
    (nr.timeouts || []).forEach(clearTimeout);
    if (nr.micOn){ nr.micOn = false; coachMicOff(); }
    nr = null;
  }
}

function nrSetup(){
  nr = { phase: 'home', level: 0, timeouts: [], pv: null, micOn: false };
  nrRenderHome();
}

/* ── Home: one big Play button + where you are on the journey ── */
function nrRenderHome(){
  const body = nrBody();
  if (!body || !nr) return;
  nrHearStop();
  nr.phase = 'home';
  const pos = nrStagePos();
  const lv = NR_LEVELS[NR_ADAPT_ORDER[pos]];
  body.innerHTML =
    `<div class="coach-tip rn-center">${t('games.nr.homeIntro')}</div>
     <div class="nr-stage rn-center"><strong>${t('games.nr.homeStage', {n: pos + 1, total: NR_ADAPT_ORDER.length})}</strong> &mdash; ${t(lv.nameKey)}<br>
       <span class="rn-song-sub">${nrLevelMeta(lv)}</span></div>
     <div class="rn-center"><button type="button" class="coach-start nr-play" onclick="nrPlayAdaptive()">&#x1F3B8; ${t('games.nr.playButton')}</button></div>
     <div class="nr-slider"><label for="nr-off">${t('games.nr.offsetLabel')}</label>
       <input type="range" id="nr-off" min="0" max="250" step="5" value="${nrOffset()}" oninput="nrSetOffset(this.value)">
       <span id="nr-off-lbl">${nrOffset()} ms</span></div>
     <div class="coach-tip rn-center">${t('games.nr.offsetTip')}</div>
     <div class="rn-center"><button type="button" class="tp-btn" onclick="nrShowSelect()">&#x1F3AF; ${t('games.nr.practiceDoor')}</button></div>`;
}

function nrPlayAdaptive(){
  if (!nr || (nr.phase !== 'home' && nr.phase !== 'done')) return;
  nr.adaptive = true;
  nr.stagePos = nrStagePos();
  nr.level = NR_ADAPT_ORDER[nr.stagePos];
  nr.phase = 'ready';
  nrStart();
}

/* ── Level select ── */

function nrLevelMeta(lv){
  const topTier = NR_RHYTHMS[lv.tiers[lv.tiers.length - 1]];
  if (lv.chords)
    return `${t('games.nr.meta.pcRoots', {n: lv.maxFret})} &middot; ${t(topTier.nameKey)} &middot; ${lv.bpm} BPM`;
  const strings = lv.strings.length === 2 ? t('games.nr.meta.stringsBoth')
    : lv.strings[0] === 6 ? t('games.nr.meta.stringsE') : t('games.nr.meta.stringsA');
  return `${strings} &middot; ${t('games.nr.meta.frets', {n: lv.maxFret})} &middot; ${t(topTier.nameKey)} &middot; ${lv.bpm} BPM`;
}

function nrRenderSelect(){
  const body = nrBody();
  if (!body || !nr) return;
  const cards = NR_LEVELS.map((lv, i) => {
    const un = nrUnlocked(i);
    const b = nrBestMerged(i);
    let meta;
    if (!un){
      meta = `<span class="rn-song-lock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg> ${t('games.nr.clearToUnlock', {pct: NR_PASS, n: nrReq(i) + 1})}</span>`;
    } else if (b > 0){
      meta = `<span class="rn-song-best">${t('games.nr.bestPercent', {pct: b})}${b >= NR_PASS ? ' &middot; ' + t('games.nr.clearedFlag') : ''}</span>`;
    } else {
      meta = `<span class="rn-song-best dim">${t('games.nr.notPlayedYet')}</span>`;
    }
    return `<button type="button" class="rn-song${un ? '' : ' locked'}" ${un ? `onclick="nrPick(${i})"` : 'disabled'}>
       <span class="rn-song-title">${t('games.nr.levelChip', {n: i + 1})} — ${t(lv.nameKey)}</span>
       <span class="rn-song-sub">${nrLevelMeta(lv)}</span>
       ${meta}</button>`;
  }).join('');
  body.innerHTML =
    `<div class="coach-tip rn-center">${t('games.nr.tipHowToPlay')}</div>
     <div class="rn-songs">${cards}</div>
     <div class="rn-center"><button type="button" class="tp-btn" onclick="nrRenderHome()">&#x2190; ${t('games.nr.homeButton')}</button></div>`;
}

function nrShowSelect(){
  if (!nr) return;
  nrHearStop();
  nr.phase = 'select';
  nrRenderSelect();
}

function nrPick(i){
  if (!nr || !nrUnlocked(i)) return;
  nrHearStop();
  nr.adaptive = false;   // the practice door: the student chose this level
  nr.level = i;
  nr.phase = 'ready';
  nrRenderReady();
}

function nrRenderReady(msg){
  if (nr && nr.gym){ fgRenderReady(msg); return; }
  const body = nrBody();
  if (!body || !nr) return;
  const lv = NR_LEVELS[nr.level];
  const tiers = lv.tiers.map(k => t(NR_RHYTHMS[k].nameKey)).join(' + ');
  const b = nrBestMerged(nr.level);
  body.innerHTML =
    `${msg ? `<div class="coach-tip rn-center">${msg}</div>` : ''}
     <div class="coach-tip rn-center"><strong>${t('games.nr.levelChip', {n: nr.level + 1})} — ${t(NR_LEVELS[nr.level].nameKey)}</strong><br>
       ${nrLevelMeta(lv)} &middot; ${t('games.nr.readyBars', {bars: lv.bars})}<br>
       ${t('games.nr.readyRhythms', {list: tiers, pct: NR_PASS})}</div>
     ${b > 0 ? `<div class="coach-tip rn-center">${t('games.nr.bestPercent', {pct: b})}</div>` : ''}
     <div class="rn-center">
       <button type="button" class="tp-btn" id="nr-hear" onclick="nrHear()">&#x1F50A; ${t('games.nr.hearButton')}</button>
       <button type="button" class="tp-btn" onclick="nrShowSelect()">&#x2190; ${t('games.nr.allLevelsButton')}</button>
     </div>
     <div class="rn-center"><button type="button" class="coach-start" onclick="nrStart()">&#x1F3B8; ${t('games.nr.startButton')}</button></div>
     <div class="nr-slider"><label for="nr-off">${t('games.nr.offsetLabel')}</label>
       <input type="range" id="nr-off" min="0" max="250" step="5" value="${nrOffset()}" oninput="nrSetOffset(this.value)">
       <span id="nr-off-lbl">${nrOffset()} ms</span></div>
     <div class="coach-tip rn-center">${t('games.nr.offsetTip')}</div>
     <div class="coach-tip rn-center">${t('games.nr.clickNote')}</div>`;
}

/* ── "Hear an example" — one generated round through the pluck synth,
   scheduled on the audio clock (rnPluckAt is Riff Runner's). ── */

/* Beat <-> ms after beat 1. A round is ONE constant tempo, except the Finger
   Gym's: it steps up lv.bpmStep BPM at the start of every lap (lv.lapBars
   bars = 16 notes). s.laps / this map holds one { beat, ms, beatMs } per
   tempo, so everything that places a note in time asks here rather than
   multiplying by a single beatMs. With no lv.laps it is one entry and the
   maths is exactly beat * beatMs. */
function nrLapMap(lv){
  const laps = lv.laps || 1;
  const per = (lv.lapBars || lv.bars) * 4;
  const out = [];
  let ms = 0;
  for (let k = 0; k < laps; k++){
    const beatMs = 60000 / (lv.bpm + k * (lv.bpmStep || 0));
    out.push({ beat: k * per, ms, beatMs });
    ms += per * beatMs;
  }
  return out;
}
function nrBeatToMs(laps, beat){
  let i = laps.length - 1;
  while (i > 0 && beat < laps[i].beat) i--;
  return laps[i].ms + (beat - laps[i].beat) * laps[i].beatMs;
}
function nrMsToBeat(laps, ms){
  let i = laps.length - 1;
  while (i > 0 && ms < laps[i].ms) i--;
  return laps[i].beat + (ms - laps[i].ms) / laps[i].beatMs;
}

async function nrHear(){
  const s = nr;
  if (!s || s.phase !== 'ready') return;
  if (s.pv){ nrHearStop(); return; }
  if (typeof getAudioCtx !== 'function') return;
  stopAllDemoAudio();
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended'){
    try { await ctx.resume(); } catch(e){}
  }
  if (nr !== s || s.phase !== 'ready' || s.pv) return;   // switched during the resume
  if (!nrBody()){ nrHearStop(); return; }
  const lv = nrLv(s);
  const laps = nrLapMap(lv);
  /* In time order, so each note can lift the one before it (gameVoice). */
  const notes = nrGen(lv).filter(n => !n.rest).sort((a, b) => a.beat - b.beat);
  const startAt = ctx.currentTime + 0.2;
  const line = gameLine();
  /* A chord token previews as root + fifth + octave — the power-chord sound. */
  s.pv = { srcs: notes.flatMap(n => (n.chord ? [0, 7, 12] : [0])
    .map(iv => rnPluckAt(n.midi + iv, startAt + nrBeatToMs(laps, n.beat) / 1000, line, n.beat))) };
  const btn = document.getElementById('nr-hear');
  if (btn) btn.innerHTML = '&#x25A0; ' + t('games.common.stop');
  const pv = s.pv;
  pv.autoStop = setTimeout(() => { if (nr === s && s.pv === pv) nrHearStop(); },
    (0.2 + nrBeatToMs(laps, lv.bars * 4) / 1000 + 1.6) * 1000);
  s.timeouts.push(pv.autoStop);
}

function nrHearStop(){
  if (!nr || !nr.pv) return;
  clearTimeout(nr.pv.autoStop);
  nr.pv.srcs.forEach(src => { try { src.stop(); } catch(e){} });
  nr.pv = null;
  const btn = document.getElementById('nr-hear');
  if (btn) btn.innerHTML = '&#x1F50A; ' + t('games.nr.hearButton');
}

/* ── Exercise generator: a random walk over the level's note pool.
   Mostly small steps (±1–3 frets in pitch order), never more than two
   repeats of the same note, starting near the bottom of the pool —
   playable lines rather than fret-number lottery.
   Power-chord levels walk the same way over ROOT positions, but the
   chord only changes every chordHold beats (each strum inside a hold
   window repeats the shape — that's what a power-chord riff is), and
   every event carries chord:true + a display name (root + "5"). ── */
function nrGen(lv){
  if (lv.gym) return fgGen(lv);
  const pool = [];
  lv.strings.forEach(str => {
    for (let f = 0; f <= lv.maxFret; f++)
      pool.push({ string: str, fret: f, midi: STRING_OPEN_MIDI[str] + f });
  });
  pool.sort((a, b) => a.midi - b.midi || b.string - a.string);

  const walk = (idx, same) => {
    let next = idx, tries = 0;
    do {
      const step = [0, 1, -1, 1, -1, 2, -2, 3, -3][Math.floor(Math.random() * 9)];
      next = Math.max(0, Math.min(pool.length - 1, idx + step));
      tries++;
    } while (tries < 6 && next === idx && same >= 2);
    return next;
  };

  /* Weak-spot re-dealing: ~¼ of picks swap in a position the student has
     been missing (see the adaptive-mode note above NR_ADAPT_ORDER) when
     one lives inside this pool. The walk resumes FROM the weak spot so
     the line stays melodic around it — which also means its neighbours
     recur, so the effective dose is higher than the swap rate; don't
     raise this without playing a round. */
  const wk = nrWeak();
  const weakSwap = (curIdx, chord) => {
    if (Math.random() >= 0.25) return curIdx;
    const cands = [];
    for (let i = 0; i < pool.length; i++){
      if (wk[(chord ? 'c:' : '') + pool[i].string + ':' + pool[i].fret] > 0) cands.push(i);
    }
    return cands.length ? cands[Math.floor(Math.random() * cands.length)] : curIdx;
  };

  /* Chord levels: one pool position per hold window, decided up front. */
  let windows = null;
  if (lv.chords){
    const nWin = Math.ceil(lv.bars * 4 / lv.chordHold);
    windows = [];
    let wIdx = Math.floor(Math.random() * Math.min(4, pool.length));
    let wSame = 0;
    for (let wn = 0; wn < nWin; wn++){
      wIdx = weakSwap(wIdx, true);
      windows.push(pool[wIdx]);
      const next = walk(wIdx, wSame);
      wSame = next === wIdx ? wSame + 1 : 0;
      wIdx = next;
    }
  }

  const notes = [];
  let idx = Math.floor(Math.random() * Math.min(4, pool.length));
  let same = 0;
  for (let b = 0; b < lv.bars; b++){
    /* easy tiers in the early bars, the harder ones later */
    const tier = NR_RHYTHMS[lv.tiers[Math.min(lv.tiers.length - 1,
      Math.floor(b * lv.tiers.length / lv.bars))]];
    const pat = tier.patterns[Math.floor(Math.random() * tier.patterns.length)];
    (pat.rests || []).forEach(beat => notes.push({ rest: true, beat: b * 4 + beat }));
    pat.ev.forEach(ev => {
      const beat = b * 4 + ev[0];
      if (lv.chords){
        const c = windows[Math.floor(beat / lv.chordHold)];
        notes.push({ string: c.string, fret: c.fret, midi: c.midi, chord: true,
                     name: coachNoteName(c.midi) + '5', beat, dur: ev[1] });
        return;
      }
      idx = weakSwap(idx, false);
      const cur = pool[idx];
      notes.push({ string: cur.string, fret: cur.fret, midi: cur.midi,
                   beat, dur: ev[1] });
      const next = walk(idx, same);
      same = next === idx ? same + 1 : 0;
      idx = next;
    });
  }
  notes.sort((a, b) => a.beat - b.beat);
  return notes;
}

/* ── The round ── */

async function nrStart(){
  if (!nr || nr.phase !== 'ready') return;
  const s = nr;
  const body = nrBody();
  if (!body) return;
  // Collection is on and this device hasn't answered yet: ask first.
  // Never for a Finger Gym round: it is not recorded (see below).
  if (!s.gym && micRecShouldAsk()){ body.innerHTML = micRecAskHtml('nr'); return; }
  coachClose();
  coachEvictTuner();
  nrHearStop();
  body.innerHTML = `<div class="coach-tip rn-center">${t('games.common.startingMic')}</div>`;
  if (!coachStream && !(await coachAcquireMic())){
    if (nr === s){ s.phase = 'ready'; nrRenderReady(coachMicFailMsg('games.common.micAccessDenied')); }
    return;
  }
  await coachEnsureRunning();
  if (nr !== s || !nrBody()){ coachReleaseMicIfIdle(); return; }
  if (document.hidden){
    coachMicOff();
    s.phase = 'ready';
    nrRenderReady(t('games.wait.pausedBackground'));
    return;
  }
  stopAllDemoAudio();
  s.micOn = true;
  window.coachMicLive = true;

  const lv = nrLv(s);
  s.phase = 'countin';
  s.chordMode = !!lv.chords;
  s.laps = nrLapMap(lv);
  s.beatMs = s.laps[0].beatMs;   // the count-in runs at the starting tempo
  s.totalBeats = lv.bars * 4;
  s.notes = nrGen(lv);
  s.playable = s.notes.filter(n => !n.rest);

  /* Hit windows, in ms: wider than Riff Runner's key windows (onset
     detection adds its own jitter — same reasoning as Strum Radar's),
     capped below half the smallest gap so neighbours can't both claim
     one pluck. */
  let minGap = Infinity;
  for (let i = 1; i < s.playable.length; i++)
    minGap = Math.min(minGap, nrBeatToMs(s.laps, s.playable[i].beat) - nrBeatToMs(s.laps, s.playable[i - 1].beat));
  s.goodMs = Math.min(180, 0.45 * minGap);
  s.perfectMs = Math.min(90, s.goodMs * 0.55);

  s.score = 0; s.combo = 0; s.maxCombo = 0; s.missStreak = 0;
  s.errs = [];
  s.sweepIdx = 0; s.lastBeat = -1;
  s.countCleared = false;   // else round 2+ never wipes the count-in "4" off the track
  s.smoothRms = 0; s.smoothHf = 0; s.lastOnsetT = -1e9; s.lastPitchT = 0; s.pendings = []; s.looks = [];
  s.evLog = [];

  nrRenderPlay();
  s.els = s.notes.map((_, i) => document.getElementById('nr-n-' + i));
  /* A consented recording runs from here to the end of the round. Not a
     Finger Gym round: it would save to the same micTakes/<uid>-nr doc and
     overwrite the student's Note Runner take, and at ~67 s it runs past
     the 30 s cap while `expected` lists every note. */
  if (!s.gym && micRecStart('nr')){ const b = nrBody(); if (b) b.insertAdjacentHTML('afterbegin', micRecBadgeHtml()); }
  /* coachCountIn beeps 4 clicks and sets s.listenStart = beat 1. The
     clicks stop there — see the header comment. */
  coachCountIn(s, 'nr-count', () => {
    if (nr === s && s.phase === 'countin') s.phase = 'play';
  });
  s.playable.forEach(n => { n.t = s.listenStart + nrBeatToMs(s.laps, n.beat); n.result = null; });
  if (nrRaf) cancelAnimationFrame(nrRaf);
  nrLoop();
}

function nrRenderPlay(){
  const body = nrBody();
  if (!body || !nr) return;
  const s = nr;
  /* All six strings draw, like real TAB (thin high e on top, low E on the
     bottom — Riff Runner's layout), even though this game only writes to
     strings 5 and 6: reading two lines floating in space is a habit the
     real page never asks for. */
  const names = { 1: 'e', 2: 'B', 3: 'G', 4: 'D', 5: 'A', 6: 'E' };
  const lanes = [1, 2, 3, 4, 5, 6].map(str => {
    const toks = s.notes.map((n, i) => {
      if (n.rest || n.string !== str) return '';   // rests render once, below the lanes
      /* Chord tokens ride the ROOT string's lane: fret number in the circle
         (where the root goes), chord name above — the shape is always
         root + two-frets-up one string down, so that fully specifies it. */
      return `<span class="rn-token nr-token${n.chord ? ' nr-chord' : ''}" id="nr-n-${i}">${n.finger ? `<span class="rn-token-label nr-finger" aria-label="${escAttr(t('games.fg.fingerN', {n: n.finger}))}">${n.finger}</span>` : `<span class="rn-token-label">${n.chord ? n.name : coachNoteName(n.midi)}</span>`}<span class="rn-token-fret">${n.fret}</span>${n.dur > 1 ? '<span class="nr-tail"></span>' : ''}</span>`;
    }).join('');
    return `<div class="rn-lane nr-lane"><span class="rn-lane-name">${str} ${names[str]}</span>${toks}</div>`;
  });
  /* rests live between the lanes, on the track itself */
  const rests = s.notes.map((n, i) => n.rest
    ? `<span class="rn-token nr-token nr-rest" id="nr-n-${i}"><span class="rn-token-fret">&#x1D13D;</span></span>` : '').join('');
  body.innerHTML =
    `<div class="sh-hud">
       <span class="sh-score" id="nr-score">${t('games.common.score', {n: 0})}</span>
       <span class="sh-combo" id="nr-combo">&nbsp;</span>
       <span class="sh-bar" id="nr-bar">${t('games.nr.getReady')}</span>
     </div>
     <div class="cc-beats" id="nr-beats">${'<span class="cc-pip"></span>'.repeat(4)}</div>
     ${nrRaceHtml()}
     <div class="rn-track nr-track" id="nr-track">${lanes.join('')}${rests}<div class="rn-hitline"></div><div class="rn-count" id="nr-count">&nbsp;</div></div>
     <div class="coach-tip rn-center">${t(s.gym ? 'games.fg.tipPlay' : 'games.nr.tipPlay')}</div>
     <button type="button" class="tp-btn coach-stop" onclick="nrFinish()">&#x25A0; ${t('games.common.stop')}</button>`;
}

function nrLoop(){
  const s = nr;
  if (!s || (s.phase !== 'countin' && s.phase !== 'play')) return;
  // Analyser gone (another feature took the mic) or panel closed under us —
  // same guard every other mic loop uses, so a lost mic stops the round
  // instead of silently reading as misses and demoting the adaptive stage.
  if (!coachAnalyser || !nrBody() || !document.getElementById('nr-track')){ nrStop(); return; }
  const now = performance.now();

  /* count-in digits are drawn by coachCountIn's timeouts; clear on go */
  if (s.phase === 'play' && !s.countCleared){
    s.countCleared = true;
    const el = document.getElementById('nr-count');
    if (el) el.innerHTML = '&nbsp;';
  }

  /* ── mic: the Coach's dual-channel onset detector + YIN readings.
     Runs through the count-in too (trackers warm against room noise and
     beep leakage, same as coachLoop) — but grading only ever matches
     onsets that land inside a note's window, so count-in noodling and
     the count-in beeps themselves are free. ── */
  if (coachAnalyser){
    const rms = coachReadFrame();
    const hf = coachHfRms;
    const at = coachOnsetAt;   // when the pluck arrived, not when this frame ran
    if (at - s.lastOnsetT > COACH_ONSET_REFRACT &&
        ((rms > CHK_ONSET_FLOOR && rms > s.smoothRms * CHK_ONSET_RATIO) ||
         (hf > CHK_HF_FLOOR && hf > s.smoothHf * CHK_HF_RATIO))){
      s.lastOnsetT = at;
      // Events overlap, as in coachLoop: a neighbour's pluck no longer cuts
      // the student's note off before it has been read.
      s.pendings.push({ t: at, readings: [] });
    }
    coachSmooth(s, rms, hf);
    if ((s.pendings.length || s.looks.length) && rms > COACH_PITCH_GATE * 0.5){
      /* Chord levels loosen YIN's clarity gate the way the Coach's chord
         mode does — a strum isn't cleanly periodic, and the tone vote
         below is what keeps loose readings from becoming wrong verdicts. */
      const ps = s.pendings, lk = s.looks;
      const from = Math.min(ps.length ? ps[0].t + COACH_ATTACK_SKIP : Infinity,
                            lk.length ? Math.min.apply(null, lk.map(L => L.at)) + COACH_EVENT_TAIL : Infinity);
      coachPitchReadings(s.lastPitchT, from, s.chordMode ? 0.55 : 0.22).forEach(r => {
        s.lastPitchT = r.t;
        if (r.midi == null) return;
        ps.forEach(p => {
          if (r.t >= p.t + COACH_ATTACK_SKIP && r.t - p.t <= COACH_EVENT_TAIL) p.readings.push(r.midi);
        });
        coachLookFeed(lk, r.t, r.midi);
      });
    }
    while (nr && s.pendings.length && now - s.pendings[0].t > COACH_EVENT_TAIL) nrFinalizeEvent();
    if (nr && s.looks.length) nrLookResolve(false);
  }

  nrRaceFrame(now);   // the race lane above the track — see NR_RUNNER_SVG

  /* ── token scroll: pure function of the clock (JS transforms, not CSS
     animations — reduced-motion zeroes those). ── */
  const track = document.getElementById('nr-track');
  if (track){
    const w = track.clientWidth;
    const hitX = w * 0.22;
    const lookBeats = w < 480 ? 4 : 8;
    /* Scroll in BEATS, not ms: tokens keep one spacing on screen and a
       faster lap just moves them faster. At a constant tempo this is the
       old (tt - now) * pxPerMs, term for term. */
    const pxPerBeat = (w - hitX) / lookBeats;
    const curBeat = nrMsToBeat(s.laps, now - s.listenStart);
    for (let i = 0; i < s.notes.length; i++){
      const el = s.els[i];
      if (!el) continue;
      const n = s.notes[i];
      const x = hitX + (n.beat - curBeat) * pxPerBeat;
      if (x < -80 || x > w + 40){
        el.style.visibility = 'hidden';
      } else {
        el.style.visibility = 'visible';
        el.style.transform = 'translateX(' + x + 'px)';
        if (n.dur > 1){
          const tail = el.querySelector('.nr-tail');
          if (tail) tail.style.width = ((n.dur - 1) * pxPerBeat) + 'px';
        }
      }
    }
  }

  if (s.phase === 'play'){
    /* Notes past their window become misses — but only after the event
       tail has had its chance to finalize a pluck that landed late in
       the window (+COACH_EVENT_TAIL, not Riff Runner's 150ms). */
    while (s.sweepIdx < s.playable.length && s.playable[s.sweepIdx].result) s.sweepIdx++;
    for (let i = s.sweepIdx; i < s.playable.length; i++){
      const n = s.playable[i];
      /* nrOffset() is added because scoring subtracts it from onset times
         (tEv = p.t - nrOffset() in nrFinalizeEvent) — without it, a raised
         mic-offset lets the sweep call "miss" on a pluck whose event is
         still inside the shifted window, before it can finalize. */
      if (n.t + s.goodMs + nrOffset() + COACH_EVENT_TAIL + 60 > now) break;
      if (!n.result){
        n.result = 'miss';
        s.combo = 0;
        s.missStreak++;
        if (s.missStreak >= 2) nrRaceSlip();
        nrMark(n, 'miss');
        nrHud();
        // A later note already graded can no longer be taken over: its
        // snapshot is from before this miss, and restoring it would erase it.
        for (let j = i + 1; j < s.playable.length && s.playable[j].result; j++) s.playable[j].snap = null;
      }
    }
    const beat = Math.floor(nrMsToBeat(s.laps, now - s.listenStart));
    if (beat !== s.lastBeat && beat >= 0){
      s.lastBeat = beat;
      const bar = Math.floor(beat / 4);
      const barEl = document.getElementById('nr-bar');
      if (barEl && bar < nrLv(s).bars){
        if (s.gym){
          /* Gym: say which lap and how fast — the speed-up is the point. */
          let k = s.laps.length - 1;
          while (k > 0 && beat < s.laps[k].beat) k--;
          barEl.textContent = t('games.fg.lapBpm', {lap: k + 1, total: s.laps.length, bpm: Math.round(60000 / s.laps[k].beatMs)});
        } else {
          barEl.textContent = t('games.nr.barOfTotal', {bar: bar + 1, total: nrLv(s).bars});
        }
      }
      document.querySelectorAll('#nr-beats .cc-pip').forEach((el, i) =>
        el.classList.toggle('on', i === ((beat % 4) + 4) % 4));
    }
    if (now > s.listenStart + nrBeatToMs(s.laps, s.totalBeats) + COACH_EVENT_TAIL + 300){ nrFinish(true); return; }   // played through — this one counts
  }
  nrRaf = requestAnimationFrame(nrLoop);
}

function nrMark(n, cls){
  const i = nr.notes.indexOf(n);
  const el = i >= 0 && nr.els[i];
  if (el) el.classList.add(cls);
}

/* ── Hit celebrations (the Guitar-Hero sparkle) ──
   A perfect throws a spark burst at the hit line on that note's lane; a
   good gets a soft expanding ring; stepping the combo multiplier (×2 at
   8 in a row, up to ×4) pops the new multiplier over the track. Pure
   CSS animations on throwaway elements — spawned here, removed on a
   timer, hidden entirely under prefers-reduced-motion (the grade marks
   on the tokens carry the same information without motion). */
function nrBurst(n, kind){
  const s = nr;
  const track = document.getElementById('nr-track');
  const i = s ? s.notes.indexOf(n) : -1;
  const el = i >= 0 && s.els[i];
  if (!track || !el || !el.parentElement) return;
  const b = document.createElement('span');
  b.className = 'nr-burst ' + kind;
  b.style.left = (track.clientWidth * 0.22) + 'px';
  b.style.top = (el.parentElement.offsetTop + el.parentElement.offsetHeight / 2) + 'px';
  track.appendChild(b);
  s.timeouts.push(setTimeout(() => b.remove(), 650));
}
function nrComboPop(mult){
  const s = nr;
  const track = document.getElementById('nr-track');
  if (!s || !track) return;
  const b = document.createElement('span');
  b.className = 'nr-combo-pop';
  b.textContent = '×' + mult;
  track.appendChild(b);
  s.timeouts.push(setTimeout(() => b.remove(), 950));
}

/* ══ RACE LANE — the little guitar running for the finish flag ══════════
   Sits above the TAB track. One rule: the runner's distance along the road
   is *notes landed ÷ notes in the level*. That makes it honest in three
   ways at once —

     • where it stops IS the round's accuracy, the number the results
       screen reports, so the picture can never disagree with the score;
     • the checkpoint flag sits exactly on NR_PASS, so "did I get past the
       marker?" and "did I unlock the next level?" are the same question,
       and it moves if that constant ever does;
     • a single miss just stops the runner gaining ground — nothing
       un-plays a note, so it can't lose distance it already earned. Two
       or more misses in a row (nrRaceSlip) are different: the runner
       visibly stumbles backward, then eases back to the accuracy line
       as the slip decays (s.raceSlip) — a beat or two, not a hard reset.
       That temporary dip is motion-only: reduced motion skips the slip
       and keeps snapping straight to the true accuracy line.

   Speed is the other half of the ask. Distance-per-note is fixed, so a
   faster level lands notes more often and the runner covers the road
   faster on its own. On top of that its leg cycle is tied to how many
   notes are arriving *right now* (a 2-second window either side of the
   playhead), so eighth-notes at 100 BPM visibly sprint where quarters at
   60 lope — and a live combo multiplier kicks in speed lines.

   No live percentage is drawn, deliberately: at bar 1 of 4 the runner is
   correctly a quarter of the way along, and a "25%" label next to it
   would read as a failing grade instead of a distance.

   State hangs off the round object (s.race*) and is reset by spotting a
   fresh #nr-runner element rather than by a hook in nrStart — so this
   whole block is two call sites: the markup in nrRenderPlay, the frame in
   nrLoop. ══════════════════════════════════════════════════════════════ */

/* The runner: an ordinary guitar — two bouts, neck straight up the same
   axis — stood on a pair of stubby legs and tipped forward into the run.
   The lean lives on the .nr-gtr group alone, pivoting at the hips, so the
   legs stay planted and vertical while the body leans; putting it on the
   whole sprite would tilt the legs too and it would read as falling over.
   Legs draw first so the lower bout overlaps their tops. Fixed wood
   colours rather than theme variables: it's an object in the world, and
   the same browns read on either background. */
const NR_RUNNER_SVG =
  `<span class="nr-runner-art" aria-hidden="true">
     <span class="nr-runner-lines"></span>
     <svg viewBox="0 0 40 44" width="36" height="40">
       <g class="nr-legs" fill="none" stroke="#6b4a2a" stroke-width="3.2" stroke-linecap="round">
         <path class="nr-leg-a" d="M15 35 L12 43.5"/>
         <path class="nr-leg-b" d="M21 35 L25 42.5"/>
       </g>
       <g class="nr-gtr">
         <path d="M18 17 L18 5" fill="none" stroke="#6b4a2a" stroke-width="3.4" stroke-linecap="round"/>
         <circle cx="18" cy="3.6" r="2.4" fill="#4d3418"/>
         <ellipse cx="18" cy="21" rx="6.8" ry="6.2" fill="#c98a3f"/>
         <ellipse cx="18" cy="30" rx="8.6" ry="7.6" fill="#c98a3f"/>
         <circle cx="18" cy="26.4" r="2.8" fill="#3a2412"/>
         <!-- six strings read as three at this size; they run the whole way,
              over the soundhole, and the bridge caps them like the real thing -->
         <g stroke="#f7ead6" stroke-width="0.55" opacity="0.9">
           <path d="M16.9 4.6 L16.9 33.2"/>
           <path d="M18 4.3 L18 33.2"/>
           <path d="M19.1 4.6 L19.1 33.2"/>
         </g>
         <rect x="14.6" y="32.6" width="6.8" height="1.6" rx="0.8" fill="#4d3418"/>
       </g>
     </svg>
   </span>`;

/* One MediaQueryList, made on first use and read live (.matches follows a
   setting change): this runs every animation frame of a round, and each
   matchMedia() call parses the query and builds a new list. */
let nrRaceMql;
function nrRaceMotionOk(){
  if (nrRaceMql === undefined) nrRaceMql = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : null;
  return !(nrRaceMql && nrRaceMql.matches);
}

/* Called once per note that extends a miss streak to 2+ (s.missStreak,
   tracked in nrFinalizeEvent and the sweep-timeout miss in nrLoop; a
   'pitch' wrong-note counts same as a timed-out 'miss'). Each call adds
   more backward slip, capped so a long streak can't shove the runner all
   the way to the start line; nrRaceFrame decays it back toward zero every
   frame it runs, so the dip reads as a stumble, not a demotion. */
function nrRaceSlip(){
  const s = nr;
  if (!s) return;
  s.raceSlip = Math.min(0.18, (s.raceSlip || 0) + 0.05);
}

function nrRaceHtml(){
  return `<div class="nr-race" id="nr-race" role="img" aria-label="${t('games.nr.race.aria')}">
       <div class="nr-race-lane">
         <div class="nr-race-ground" aria-hidden="true"></div>
         <div class="nr-race-gate" style="left:${NR_PASS}%" data-lbl="${t('games.nr.race.unlock')}" aria-hidden="true"></div>
         <div class="nr-runner" id="nr-runner">${NR_RUNNER_SVG}</div>
       </div>
       <span class="nr-race-flag" aria-hidden="true">&#x1F3C1;</span>
     </div>`;
}

function nrRaceFrame(now){
  const s = nr;
  const run = document.getElementById('nr-runner');
  if (!s || !run) return;
  const lane = run.parentElement;
  const total = s.playable ? s.playable.length : 0;
  if (!lane || !total) return;

  /* New round: nrRenderPlay built a fresh runner, so the old distance is
     stale. (Cheaper and harder to forget than resetting in nrStart.) */
  if (s.raceEl !== run){
    s.raceEl = run;
    s.raceP = 0; s.raceCycle = 0; s.raceWon = false; s.raceSlip = 0;
  }

  let hits = 0;
  for (let i = 0; i < total; i++){
    const r = s.playable[i].result;
    if (r === 'perfect' || r === 'good') hits++;
  }
  const target = hits / total;
  /* Glide toward the true distance instead of teleporting, so a hit reads
     as a stride rather than a jump cut. Reduced motion snaps straight to
     the true accuracy line, ignoring raceSlip — see nrRaceSlip. */
  const motion = nrRaceMotionOk();
  const effTarget = motion ? Math.max(0, target - (s.raceSlip || 0)) : target;
  s.raceP += (effTarget - s.raceP) * (motion ? 0.12 : 1);
  if (motion && s.raceSlip) s.raceSlip *= 0.94;   // eases back over a beat or two
  run.style.transform = 'translateX(' + (s.raceP * lane.clientWidth) + 'px)';

  if (!motion) return;   // position carries the information; the rest is flourish

  /* Notes arriving around the playhead → leg cycle. Retuned only when it
     moves enough to see, since this runs every frame. */
  let near = 0;
  for (let i = 0; i < total; i++){
    const dt = s.playable[i].t - now;
    if (dt > -2000 && dt < 2000) near++;
  }
  const rate = near / 4;                                        // notes per second
  const cycle = Math.max(150, Math.min(760, 760 / Math.max(0.6, rate)));
  if (Math.abs(cycle - s.raceCycle) > 12){
    s.raceCycle = cycle;
    run.style.setProperty('--nr-run-ms', cycle.toFixed(0) + 'ms');
  }
  run.classList.toggle('running', s.phase === 'play' && rate > 0);
  run.classList.toggle('boost', s.combo >= 8);                  // ×2 and up — see nrFinalizeEvent

  if (!s.raceWon && target >= 0.999){
    s.raceWon = true;
    const race = document.getElementById('nr-race');
    if (race){
      race.classList.add('won');
      s.timeouts.push(setTimeout(() => race.classList.remove('won'), 1400));
    }
  }
}

/* An event finished collecting readings: consensus pitch (the Coach's
   tight-median filter — "unclear" is honest, a wrong verdict isn't),
   then match against the one open note whose window it landed in. */
function nrFinalizeEvent(){
  const s = nr;
  if (!s) return;
  const p = s.pendings.shift();   // oldest first
  if (!p || (s.phase !== 'play' && s.phase !== 'countin')) return;
  let midi = null;
  if (p.readings.length >= 2){
    const med = tunerMedian(p.readings);
    const tight = p.readings.filter(r => Math.abs(r - med) <= 0.6);
    if (tight.length >= 2 && tight.length * 2 >= p.readings.length){
      midi = Math.round(tunerMedian(tight));
    }
  }
  /* Onset time, minus the device's mic latency. */
  const tEv = p.t - nrOffset();
  if (s.evLog && s.evLog.length < 400) s.evLog.push({ t: tEv, midi, readings: p.readings.map(r => Math.round(r * 100) / 100) });
  if (tEv < s.listenStart - s.goodMs) return;   // count-in: free
  /* Right note? Melody: exact midi — or the octave above, because a
     Chromebook mic often hears the low strings' 2nd harmonic louder than
     the fundamental (the same physics behind tuner.js's octave guard).
     Chords: the Coach's chord-tone vote — what fraction of the strum's
     raw pitch readings are tones of the chord (root or fifth; the
     detector legitimately hops between them, so single-pitch consensus
     would fail honest strums — see coachFinalizeEvent). */
  const pitchFor = n => {
    if (n.chord){
      const want = [((n.midi % 12) + 12) % 12, ((n.midi + 7) % 12) % 12];
      const cls = p.readings.map(r => ((Math.round(r) % 12) + 12) % 12);
      return { ok: cls.length >= 2 && cls.filter(c => want.indexOf(c) >= 0).length / cls.length >= 0.20,
               unclear: cls.length < 2 };          // heard a strum, no usable pitch reads
    }
    const ok = (midi !== null && (midi === n.midi || midi === n.midi + 12)) ||
      // loud room: the note is a big share of the readings (see coachTargetShare)
      (p.readings.length >= 2 && coachTargetShare(p.readings, [n.midi, n.midi + 12]) >= COACH_VOTE_SHARE);
    return { ok, unclear: !ok && midi === null };  // heard a pluck, consensus failed
  };
  let best = -1, bestAbs = Infinity;
  for (let i = 0; i < s.playable.length; i++){
    const n = s.playable[i];
    if (n.t - tEv > s.goodMs) break;            // time-sorted — rest are ahead
    const a = Math.abs(n.t - tEv);
    /* NEAREST WINS (2026-10-07, same rule as coachMatchEvent): a note an
       event already graded can be re-graded by a later event that landed
       closer to it — in a loud room a neighbour's pluck often arrives
       inside the window before the student's own. A swept miss is final.
       Pitch plays no part — see coachMatchEvent for why. */
    if (n.result && !(n.snap && a < n.hitAbs)) continue;
    if (a <= s.goodMs && a < bestAbs){ bestAbs = a; best = i; }
  }
  if (best < 0) return;   // stray onset with no note nearby: ignored, the
                          // same bargain the check flows strike (see CHK_*)
  const n = s.playable[best];
  /* Undo the farther event's grade. Events finalize in onset order and
     the next note is at least two windows away, so nothing after this
     note has been graded since — restoring the snapshot is exact. */
  if (n.snap) nrUndo(n);
  n.snap = { state: { score: s.score, combo: s.combo, missStreak: s.missStreak, maxCombo: s.maxCombo }, errsLen: s.errs.length };
  n.hitAbs = bestAbs;
  n.hitP = p;
  const pv = pitchFor(n);
  nrGrade(n, tEv, pv.ok, pv.unclear);
  /* Heard, on the beat, but too few readings to say: a second look
     (COACH_LOOK_TAIL), cut 60 ms before the next note arrives. */
  if (!n.chord && !pv.ok && pv.unclear && p.readings.length < 2){
    const nx = s.playable[best + 1];
    const end = nx ? Math.min(p.t + COACH_LOOK_TAIL, nx.t + nrOffset() - 60) : p.t + COACH_LOOK_TAIL;
    if (end > p.t + COACH_EVENT_TAIL) s.looks.push({ n, p, tEv, at: p.t, end, own: p.readings, extra: [] });
  }
}
// Take back note n's grade (its snapshot holds the score/combo from just before it).
function nrUndo(n){
  const s = nr;
  Object.assign(s, n.snap.state);
  s.errs.length = n.snap.errsLen;
  const el = s.els[s.notes.indexOf(n)];
  if (el) el.classList.remove('hit-perfect', 'hit-good', 'nr-hit-pitch');
  n.result = null; n.unclear = false;
}
/* Note Runner's second looks whose window has closed (all of them when
   `all`). A pass re-grades the note as right, through the same snapshot
   undo a nearer event uses — but only while that note is still the last
   thing graded (one s.errs entry since its snapshot), so a later note's
   grade is never disturbed. */
function nrLookResolve(all){
  const s = nr;
  if (!s || !s.looks || !s.looks.length) return;
  const now = performance.now();
  s.looks = s.looks.filter(L => {
    if (!all && now <= L.end) return true;
    const n = L.n;
    if (n.result === 'pitch' && n.unclear && n.hitP === L.p && n.snap &&
        s.errs.length === n.snap.errsLen + 1 && coachLookPass(L, [n.midi])){
      nrUndo(n);
      nrGrade(n, L.tEv, true, false);
      n.secondLook = true;
    }
    return false;
  });
}
// Score note n (n.hitAbs = how far off its beat) as right, or as 'pitch'.
function nrGrade(n, tEv, pitchOk, unclear){
  const s = nr, bestAbs = n.hitAbs;
  s.errs.push((tEv - n.t) / 1000);
  if (pitchOk){
    const prevMult = Math.min(4, 1 + Math.floor(s.combo / 8));
    s.combo++;
    s.missStreak = 0;
    if (s.combo > s.maxCombo) s.maxCombo = s.combo;
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));
    if (bestAbs <= s.perfectMs){
      n.result = 'perfect'; s.score += 100 * mult; nrMark(n, 'hit-perfect');
      nrBurst(n, 'nr-burst-perfect');
    } else {
      n.result = 'good'; s.score += 50 * mult; nrMark(n, 'hit-good');
      nrBurst(n, 'nr-burst-good');
    }
    if (mult > prevMult) nrComboPop(mult);
  } else {
    /* On the beat but the wrong (or unclear) note: half credit, amber.
       The unclear flag feeds the mic-problem guard in nrFinish. */
    n.result = 'pitch'; n.unclear = unclear;
    s.combo = 0; s.score += 20; nrMark(n, 'nr-hit-pitch');
    s.missStreak++;
    if (s.missStreak >= 2) nrRaceSlip();
  }
  nrHud();
}

function nrHud(){
  const s = nr;
  const sc = document.getElementById('nr-score');
  if (sc) sc.textContent = t('games.common.score', {n: s.score});
  const cb = document.getElementById('nr-combo');
  if (cb){
    const mult = Math.min(4, 1 + Math.floor(s.combo / 8));
    cb.innerHTML = s.combo >= 3
      ? '&#x1F525; ' + t('games.common.inARow', {n: s.combo}) + (mult > 1 ? ' &mdash; &times;' + mult : '')
      : '&nbsp;';
  }
}

/* `complete` is passed only by nrLoop, when the round played all the way to
   its last beat. Every other caller is the ■ Stop button, i.e. the student
   walked out mid-round — and an abandoned round is NOT a failed round. The
   fill-in below marks every note that never came due as a 'miss', so without
   this distinction, tapping Stop during the count-in would charge ~16
   positions into the weak map and demote the adaptive stage off a round where
   nothing was ever played (acc 0, and the mic-problem guard can't rescue it
   either — an abandoned round has no 'unclear' results to trip it). Riff
   Runner and Strum Radar guard their writes the same way, on acc > 0.
   A round that ran to the end and went badly still counts as a failure. */
function nrFinish(complete){
  if (!nr || (nr.phase !== 'play' && nr.phase !== 'countin')) return;
  const s = nr;
  if (nrRaf){ cancelAnimationFrame(nrRaf); nrRaf = null; }
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  while (s.pendings.length) nrFinalizeEvent();
  nrLookResolve(true);
  const rec = micRecStop();
  if (s.micOn){ s.micOn = false; coachMicOff(); }
  s.playable.forEach(n => { if (!n.result) n.result = 'miss'; });   // early Stop
  s.phase = 'done';
  // A round played to the end is saved; a Stopped one is thrown away.
  if (rec && complete){
    const lv = nrLv(s) || {};
    micRecSave(rec, {
      // A Finger Gym round never records (nrStart), so this is always Note Runner.
      fields: { game: 'nr', level: s.level, bpm: lv.bpm || null, chords: !!s.chordMode,
                beatMs: Math.round(s.beatMs * 100) / 100, goodMs: s.goodMs, perfectMs: s.perfectMs,
                score: s.score, eventTimes: 'played (arrival - micLatencyMs)' },
      expected: s.playable.map(n => ({ t: n.t, midi: n.midi, string: n.string, fret: n.fret,
        chord: n.chord ? n.name : null, verdict: n.result, unclear: !!n.unclear, secondLook: !!n.secondLook })),
      events: s.evLog || []
    });
  }

  const total = s.playable.length;
  const nPerfect = s.playable.filter(n => n.result === 'perfect').length;
  const nGood = s.playable.filter(n => n.result === 'good').length;
  const nPitch = s.playable.filter(n => n.result === 'pitch').length;
  s.acc = total ? Math.round(100 * (nPerfect + nGood) / total) : 0;
  s.passed = s.acc >= NR_PASS;
  // Finger Gym keeps its own bests (games.fg) and has no weak map or stage.
  if (s.gym){ fgFinish(s, complete, nPerfect, nGood, nPitch, total); return; }
  s.prevBest = nrBestMerged(s.level);

  /* Weak-map upkeep: misses and wrong notes charge a position up; clean
     hits pay it back down until the entry retires. Completed rounds only —
     the early-Stop fill-in isn't evidence about the student's fretboard. */
  const wk = nrWeak();
  let wkChanged = false;
  if (complete){
    s.playable.forEach(n => {
      const k = nrWeakKey(n);
      if (n.result === 'miss' || n.result === 'pitch'){
        wk[k] = Math.min(6, (wk[k] || 0) + 2); wkChanged = true;
      } else if (wk[k]){
        wk[k] -= 1; wkChanged = true;
        if (wk[k] <= 0) delete wk[k];
      }
    });
  }

  /* Adaptive stage move. An unclear-heavy round is a MIC problem, not a
     student problem — hold the stage and say so instead of demoting. */
  s.micSuspect = false;
  if (s.adaptive){
    const unclear = s.playable.filter(n => n.result === 'pitch' && n.unclear).length;
    s.micSuspect = total > 0 && unclear >= Math.max(3, Math.round(total * 0.4));
    let move = 0;
    if (complete){
      if (s.acc >= NR_UP_PCT) move = 1;
      else if (s.acc < NR_DOWN_PCT && !s.micSuspect) move = -1;
    }
    /* move stays 0 on an early Stop: the stage holds, and nrRenderDone falls
       through to its "staying here" line — no new string needed. */
    s.stageWas = s.stagePos;
    s.stagePos = Math.max(0, Math.min(NR_ADAPT_ORDER.length - 1, s.stagePos + move));
    s.stageMove = s.stagePos - s.stageWas;
    nrSetStagePos(s.stagePos);
  }

  if (s.acc > nrBestSession(s.level)){
    try { sessionStorage.setItem(nrBestKey(s.level), String(s.acc)); } catch(e){}
  }
  /* Cross-session best + unlocks + adaptive stage + weak map → the
     student's progress doc. Skipped in dev bypass (Firestore rejects that
     uid; sessionStorage still carries the session). */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    if (!games.nr) games.nr = {};
    if (!games.nr.levels) games.nr.levels = {};
    let dirty = false, isNewBest = false;
    if (s.acc > (games.nr.levels[s.level] || 0)){ games.nr.levels[s.level] = s.acc; dirty = true; isNewBest = true; }
    if (s.adaptive && games.nr.stage !== s.stagePos){ games.nr.stage = s.stagePos; dirty = true; }
    if (wkChanged){ games.nr.weak = wk; dirty = true; }
    if (dirty) games.nr.at = new Date().toISOString().slice(0, 10);
    // XP is participation credit for an actual round — an immediate Start →
    // Stop is not one, same reasoning as the weak-map skip just above — and
    // nor is a silent round that timed out with no note hit.
    if (complete && nPerfect + nGood > 0) awardArcadeXp(isNewBest);
    // Best, stage and weak map are saved on their own — awardArcadeXp is
    // gated, so they would otherwise sit in memory unsaved (see shFinish).
    if (dirty || isNewBest) saveGames();
  }
  nrRenderDone(nPerfect, nGood, nPitch, total);
}

function nrRenderDone(nPerfect, nGood, nPitch, total){
  const body = nrBody();
  if (!body || !nr) return;
  const s = nr;
  /* Next levels come from the unlock chain (`after`), not array order: the
     power-chord branch sits at 12-14 but opens off level 5, so the melody
     ladder tops out at index 11 and the branch ends at 14. Clearing level 5
     opens two levels at once. */
  const nexts = NR_LEVELS.map((_, j) => j).filter(j => j !== s.level && nrReq(j) === s.level);
  const nxt = nexts.length ? nexts[0] : -1;
  /* "Unlocked!" only when THIS clear is what opened the next level — a
     re-clear gets the plain cleared line instead. */
  const firstClear = s.passed && s.prevBest < NR_PASS;
  const justUnlocked = !s.adaptive && nxt >= 0 && firstClear;
  const nextOpen = nxt >= 0 && nrUnlocked(nxt);

  let statusLine, banner = justUnlocked;
  if (s.adaptive){
    /* Adaptive verdict: where the journey goes next, and why. */
    const atTop = s.stageWas === NR_ADAPT_ORDER.length - 1;
    const hereName = t(NR_LEVELS[NR_ADAPT_ORDER[s.stagePos]].nameKey);
    if (s.micSuspect){
      statusLine = t('games.nr.micSuspect');
    } else if (s.stageMove > 0){
      statusLine = t('games.nr.stageUp', {name: hereName});
      banner = true;
    } else if (s.acc >= NR_UP_PCT && atTop){
      statusLine = t('games.nr.stageTop');
      banner = true;
    } else if (s.stageMove < 0){
      statusLine = t('games.nr.stageDown', {name: hereName});
    } else {
      statusLine = t('games.nr.stageStay');
    }
  } else if (s.passed){
    /* "Ladder complete — you've run the whole neck" is the melody ladder's
       top only; the end of the power-chord branch is a plain clear. */
    statusLine = justUnlocked
        ? (nexts.length > 1 ? t('games.nr.passUnlockedTwo', {a: nexts[0] + 1, b: nexts[1] + 1})
          : t('games.nr.passUnlocked', {n: nxt + 1}))
      : nxt < 0 && !NR_LEVELS[s.level].chords ? t('games.nr.passLadderDone')
      : t('games.nr.passCleared');
  } else {
    statusLine = t('games.nr.failLine', {pct: NR_PASS});
  }

  /* What's coming back around — the top weak spots the next rounds will
     re-deal (shown in adaptive mode, where re-dealing is the promise). */
  let weakLine = '';
  if (s.adaptive){
    const wk = nrWeak();
    const seen = [];
    Object.keys(wk).filter(k => wk[k] >= 2).sort((a, b) => wk[b] - wk[a]).forEach(k => {
      const parts = k.split(':');
      const chord = parts[0] === 'c';
      const str = +parts[chord ? 1 : 0], fret = +parts[chord ? 2 : 1];
      const name = coachNoteName(STRING_OPEN_MIDI[str] + fret) + (chord ? '5' : '') +
        ' (' + t('games.nr.fretN', {n: fret}) + ')';
      if (seen.indexOf(name) < 0) seen.push(name);
    });
    if (seen.length){
      weakLine = `<div class="coach-tip rn-center">${t('games.nr.weakLine', {list: seen.slice(0, 3).join(' · ')})}</div>`;
    }
  }

  /* Early/late bias — median signed error, only with enough hits to
     mean something (same bar Riff Runner uses). */
  let biasLine = '';
  if (s.errs.length >= 4){
    const med = tunerMedian(s.errs) * 1000;
    if (Math.abs(med) > 25){
      biasLine = `<div class="coach-tip rn-center">${med < 0
        ? t('games.nr.biasEarly', {ms: Math.round(-med)})
        : t('games.nr.biasLate', {ms: Math.round(med)})}</div>`;
    } else {
      biasLine = `<div class="coach-tip rn-center">${t('games.nr.biasTight')}</div>`;
    }
  }

  const marks = s.playable.map(n => {
    const cls = n.result === 'perfect' ? 'p' : n.result === 'good' ? 'g' : n.result === 'pitch' ? 'a' : 'm';
    const sym = n.result === 'perfect' ? '&#x2605;' : n.result === 'good' ? '&#x2713;' : n.result === 'pitch' ? '~' : '&middot;';
    return `<span class="nr-mark ${cls}" title="${escAttr((n.chord ? n.name : coachNoteName(n.midi)) + ' — ' + t('games.nr.fretN', {n: n.fret}))}">${sym}</span>`;
  }).join('');

  let bestLine = '';
  if (s.prevBest > 0 && s.acc > s.prevBest){
    bestLine = `<div class="sh-newbest">&#x1F3C6; ${t('games.nr.newBest', {prevBest: s.prevBest + '%'})}</div>`;
  }

  const buttons = s.adaptive
    ? `<button type="button" class="coach-start" onclick="nrPlayAdaptive()">&#x1F3B8; ${t('games.nr.nextRoundButton')}</button>
       <button type="button" class="tp-btn" onclick="nrRenderHome()">&#x2190; ${t('games.nr.homeButton')}</button>`
    : `<button type="button" class="coach-start" onclick="nrPick(${s.level})">&#x21BB; ${t('games.nr.tryAgainButton')}</button>
       ${nextOpen ? `<button type="button" class="coach-start" onclick="nrPick(${nxt})">${t('games.nr.nextLevelButton')} &#x2192;</button>` : ''}
       <button type="button" class="tp-btn" onclick="nrShowSelect()">&#x2190; ${t('games.nr.allLevelsButton')}</button>`;
  body.innerHTML =
    `<div class="nr-acc ${s.passed ? 'pass' : ''}">${s.acc}%</div>
     <div class="coach-tip rn-center">${t('games.nr.resLine', {hits: nPerfect + nGood, total, perfects: nPerfect})}${nPitch ? ' ' + t('games.nr.resPitch', {n: nPitch}) : ''}</div>
     ${banner ? `<div class="rn-unlock">&#x1F513; ${statusLine}</div>` : `<div class="coach-tip rn-center">${statusLine}</div>`}
     ${bestLine}
     <div class="nr-marks">${marks}</div>
     ${biasLine}
     ${weakLine}
     <div class="rn-center">${buttons}</div>`;
}

