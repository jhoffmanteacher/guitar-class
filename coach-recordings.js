/* ════════════════════════════════════════════════════════════════════
   coach-recordings.js — the consented mic recordings of the arcade (micRec*):
   the one-time question, the capture, the local-recording mode and the save
   to micTakes. Split off coach-core.js on 2026-11-18 (Jonathan, with him:
   coach-core.js had reached 2,554 of the 2,600 lines checks.mjs 1cv allows),
   moved whole and unchanged; loaded right after coach-core.js
   (COACH_JS_PARTS in app/boot.js). Nothing here is detection or grading:
   the detectors, the scoring criteria and every line tools/mic-sim pins stay
   in coach-core.js. Every caller is in coach-core.js or a later part and
   runs after load, except three typeof-guarded ones that can run before
   this part has loaded (or after it failed to): coachMicOff()'s teardown call
   (reached by coachClose / coachStopAll) and coachFootText() in coach-core.js,
   and micRecFootSync() in app/save.js.
   ════════════════════════════════════════════════════════════════════ */
/* ══════════ Consented mic recordings (2026-10-08) ══════════
   Real classroom audio to tune the listening on. The Coach footer promises
   no sound is recorded or uploaded, and for anyone who doesn't say yes that
   stays exactly true: nothing here runs unless
     · the teacher has turned collection on (config/class.micSampling —
       app.js reads it into micSampling) and fewer than its `max` takes
       have been saved (micTakesMeta/count, read into micTakesCount);
     · and this student, on this device, has answered "Yes, save it" to the
       one-time question (localStorage, keyed by uid so the next student on
       a shared Chromebook is asked for themselves — "No thanks" is never
       asked again).
   Then a Listening Coach take, a strum-pattern check round (saved under the
   Coach's id, marked game 'strumcheck'), a Note Runner round (not a Finger Gym
   round, which shares Note Runner's engine) or a Power Chord Switch game
   (not Change Up) records the RAW mic
   (before COACH_MIC_GAIN and the filters) from the count-in to the end, at
   most MICREC_MAX_SEC (the strum-pattern check: its whole round, up to its
   own SC_REC_MAX_SEC, through micRecStart's cap), with a visible "Recording this take for your
   teacher" label the whole time, and saves it to micTakes/<uid>-<mode>
   (one per student per game, the next saved take overwrites it). Teacher preview
   and the dev bypass never upload. Every way out of a take ends up in
   coachMicOff(), which tears the capture down. */
const MICREC_MAX_SEC = 30;
const MICREC_MIN_STOPPED_SEC = 10;   // a Stopped Power Chord Switch game is saved only after this many seconds of play, count-in not included (see ccFinish)
const MICREC_RATE = 24000;            // saved sample rate: 16-bit mono
const MICREC_CHUNK = 600000;          // bytes per chunks/{i} doc (Firestore's cap is 1 MB)
const MICREC_ASK_KEY = 'micRecConsent';
let micRec = null;                    // the capture in progress, or a stopped one awaiting save

function micRecAskKey(){ return MICREC_ASK_KEY + ':' + (currentUser ? currentUser.uid : ''); }
function micRecAnswer(){
  try { return localStorage.getItem(micRecAskKey()) || ''; }
  catch(e){ return 'no'; }            // can't remember an answer: never ask, never record
}
function micRecOpen(){
  return typeof micSampling !== 'undefined' && micSampling && micSampling.on === true &&
    typeof micTakesCount === 'number' && micTakesCount < (micSampling.max || 0) &&
    !IS_TEACHER_MODE && typeof currentUser !== 'undefined' && !!currentUser &&
    !(typeof isGatePreviewer === 'function' && isGatePreviewer());   // the teacher's own account, previewing
}
function micRecShouldAsk(){ return micRecOpen() && micRecAnswer() === ''; }
function micRecWanted(){ return micRecLocal() || (micRecOpen() && micRecAnswer() === 'yes'); }
/* LOCAL RECORDING MODE (Jonathan, 2026-11-14: "can it build a mock site for me to record onto?"; his teacher account never records,
   a student account keeps one take per game). Only on the site served from this computer (the host is exactly localhost, 127.0.0.1
   or [::1]) AND signed in with the dev-bypass button: every listening round records (no question, no class switch, no counter, no
   Firestore), the usual red label shows, and each take is offered as two files, a .wav (the same 24 kHz 16-bit mono the site uploads)
   and a .json (the take document the site would write, without uid and name), named take-<game>-<YYYYMMDD-HHMMSS>, behind two links
   the user clicks (micRecLocalOffer). Never on the real site: both conditions, read at call time. checks.mjs 1eh pins it. */
function micRecLocal(){
  try { return ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) && typeof isDevBypassUser === 'function' && isDevBypassUser(); }
  catch(e){ return false; }
}
const MICREC_LOCAL_KEEP = 6;
let micRecLocalTakes = [];
function micRecWavBlob(pcm, rate){
  const len = pcm.length * 2, h = new DataView(new ArrayBuffer(44));
  const str = (o, s) => { for (let k = 0; k < s.length; k++) h.setUint8(o + k, s.charCodeAt(k)); };
  str(0, 'RIFF'); h.setUint32(4, 36 + len, true); str(8, 'WAVE'); str(12, 'fmt '); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true);
  h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true); str(36, 'data'); h.setUint32(40, len, true);
  return new Blob([h.buffer, new Uint8Array(pcm.buffer, pcm.byteOffset, len)], { type: 'audio/wav' });
}
function micRecLocalOffer(doc, pcm, rec){
  const d = new Date(), p2 = n => String(n).padStart(2, '0');
  const game = String(doc.game || rec.mode || 'take').replace(/[^A-Za-z0-9]/g, '');
  const base0 = `take-${game}-${d.getFullYear()}${p2(d.getMonth() + 1)}${p2(d.getDate())}-${p2(d.getHours())}${p2(d.getMinutes())}${p2(d.getSeconds())}`;
  let base = base0;
  for (let k = 2; micRecLocalTakes.some(x => x.base === base); k++) base = base0 + '-' + k;   // two takes in one second
  const json = Object.assign({}, doc, { wav: base + '.wav', localTake: true, savedAtLocal: d.toISOString() });
  delete json.uid; delete json.name;
  micRecLocalTakes.unshift({ base, wav: URL.createObjectURL(micRecWavBlob(pcm, MICREC_RATE)),
    json: URL.createObjectURL(new Blob([JSON.stringify(json, null, 2)], { type: 'application/json' })) });
  while (micRecLocalTakes.length > MICREC_LOCAL_KEEP){ const old = micRecLocalTakes.pop(); try { URL.revokeObjectURL(old.wav); URL.revokeObjectURL(old.json); } catch(e){} }
  micRecLocalRender();
}
/* The takes of this page load, newest first, in a small fixed box (English: never shown to a student). Gone on reload. */
function micRecLocalRender(){
  /* A page place for them (the strum-pattern check's row, data-micrec-local): the newest take's two links there, compact. */
  const slot = document.querySelector('[data-micrec-local]');
  if (slot && micRecLocalTakes.length){
    const x = micRecLocalTakes[0];
    slot.innerHTML = `<a href="${escAttr(x.wav)}" download="${escAttr(x.base)}.wav">Save this take (sound)</a> · <a href="${escAttr(x.json)}" download="${escAttr(x.base)}.json">Save this take (details)</a>`;
    return;
  }
  let box = document.getElementById('micrec-local');
  if (!box){ box = document.createElement('div'); box.id = 'micrec-local'; box.className = 'micrec-local'; document.body.appendChild(box); }
  box.innerHTML = '<b>Local recording mode</b> (this computer only). Save each take: the sound and the details.<ul>' +
    micRecLocalTakes.map(x => `<li>${escHtml(x.base)}: <a href="${escAttr(x.wav)}" download="${escAttr(x.base)}.wav">Save this take (sound)</a> · <a href="${escAttr(x.json)}" download="${escAttr(x.base)}.json">Save this take (details)</a></li>`).join('') + '</ul>';
}

function micRecAskHtml(game){
  return `<div class="micrec-ask" role="group" aria-label="${escHtml(t('micrec.ask'))}">
       <p class="micrec-q">&#x1F399;&#xFE0F; ${escHtml(t('micrec.ask'))}</p>
       <div class="micrec-btns">
         <button type="button" class="coach-start" onclick="micRecConsent(true,'${game}')">${escHtml(t('micrec.yes'))}</button>
         <button type="button" class="tp-btn" onclick="micRecConsent(false,'${game}')">${escHtml(t('micrec.no'))}</button>
       </div>
     </div>`;
}
/* The answer is remembered, then the take the student pressed Start for
   goes ahead (still inside their click, so the mic prompt can open). */
function micRecConsent(yes, game){
  try { localStorage.setItem(micRecAskKey(), yes ? 'yes' : 'no'); } catch(e){}
  micRecFootSync();
  if (game === 'nr') nrStart(); else if (game === 'pw') ccStart(!!(cc && cc.pendingAgain)); else if (game === 'sc') scStart(); else coachStartCheck();
}
function micRecBadgeHtml(){
  return `<div class="micrec-on" id="micrec-on"><span class="micrec-dot"></span>${escHtml(t('micrec.recording'))}<button type="button" class="micrec-stop" title="${escAttr(t('micrec.stopTitle'))}" onclick="micRecRevoke()">${escHtml(t('micrec.stop'))}</button></div>`;
}
/* A "yes" can be taken back: this take is dropped unsaved and none after it
   is recorded (the answer becomes "no", which is never asked again). */
function micRecRevoke(){
  try { localStorage.setItem(micRecAskKey(), 'no'); } catch(e){}
  micRecAbort();
  micRecFootSync();
}
function micRecFootSync(){
  // Only footers rendered with records=true (data-rec): the rest never record.
  document.querySelectorAll('.coach-foot-txt[data-rec]').forEach(el => { el.textContent = coachFootText(true); });
}

/* Start capturing. A separate source node off the raw stream, into a
   ScriptProcessor whose output goes to a zero gain — so nothing is heard
   and the listening chain is untouched. */
/* `maxSec` (optional): this take's own cap, for a take longer than
   MICREC_MAX_SEC by design. Only the strum-pattern check passes one
   (coach-strumcheck.js: eight bars at the step's tempo, at most
   SC_REC_MAX_SEC); every other caller keeps MICREC_MAX_SEC. */
function micRecStart(mode, maxSec){
  micRecAbort();
  const capSec = maxSec > 0 ? maxSec : MICREC_MAX_SEC;
  if (!micRecWanted() || !coachCtx || !coachStream) return false;
  try {
    const ctx = coachCtx, srcRate = ctx.sampleRate;
    const src = ctx.createMediaStreamSource(coachStream);
    const proc = ctx.createScriptProcessor(4096, 1, 1);
    const mute = ctx.createGain();
    mute.gain.value = 0;
    const rec = { mode, ctx, src, proc, mute, srcRate, bufs: [], n: 0,
      cap: Math.ceil(capSec * srcRate), capSec, live: true,
      perf0: performance.now(), ctx0: ctx.currentTime, firstPlay: null, got: 0, startMin: null,
      frames: 0, frameSum: 0, frameMax: 0, lastFrameT: 0,
      track: (coachStream.getAudioTracks()[0] || {}).label || '',
      settings: micRecTrackSettings(coachStream) };
    proc.onaudioprocess = e => {
      if (micRec !== rec || !rec.live) return;
      if (rec.firstPlay == null) rec.firstPlay = e.playbackTime;
      const x = e.inputBuffer.getChannelData(0);
      // a start candidate: now less everything captured so far; one buffer's can be late or early, micRecStartPerf keeps the earliest
      rec.got += x.length;
      const startBy = performance.now() - rec.got / rec.srcRate * 1000;
      if (rec.startMin == null || startBy < rec.startMin) rec.startMin = startBy;
      const take = Math.min(x.length, rec.cap - rec.n);
      if (take > 0){ rec.bufs.push(x.slice(0, take)); rec.n += take; }
      if (rec.n >= rec.cap) micRecTeardown(rec);   // the cap: stop listening, keep what we have
    };
    src.connect(proc); proc.connect(mute); mute.connect(ctx.destination);
    // Belt and braces: whatever happens, the capture stops a minute after
    // its cap, 30 s unless the caller gave one (what it holds is still saved if the take finishes).
    rec.timer = setTimeout(() => micRecTeardown(rec), (capSec + 60) * 1000);
    micRec = rec;
    return true;
  } catch(e){ micRecAbort(); return false; }
}
// Called by coachReadFrame on every detection frame while capturing.
function micRecFrame(nowT){
  const r = micRec;
  if (r.lastFrameT){
    const d = nowT - r.lastFrameT;
    r.frames++; r.frameSum += d; if (d > r.frameMax) r.frameMax = d;
  }
  r.lastFrameT = nowT;
}
function micRecTeardown(rec){
  if (!rec || !rec.live) return;
  rec.live = false;
  try { rec.proc.onaudioprocess = null; } catch(e){}
  try { rec.src.disconnect(); } catch(e){}
  try { rec.proc.disconnect(); } catch(e){}
  try { rec.mute.disconnect(); } catch(e){}
}
/* Stop and hand back the capture for micRecSave (the take's own finish
   calls this BEFORE coachMicOff). Null when nothing was recording. */
function micRecStop(){
  const rec = micRec;
  if (!rec) return null;
  micRecTeardown(rec);
  clearTimeout(rec.timer);
  micRec = null;
  return rec.n ? rec : null;
}
// Every other exit: tear down and throw the audio away.
function micRecAbort(){
  const rec = micRec;
  if (!rec) return;
  micRecTeardown(rec);
  clearTimeout(rec.timer);
  micRec = null;
  const el = document.getElementById('micrec-on');
  if (el) el.remove();
}
/* The recording's start on the performance.now() clock (when its first sample was on the page, where the game's analyser reads it), so a
   take's saved times line up with its audio. Since 2026-11-16 (recClock 2): the earliest, over every buffer, of "now less the samples
   captured so far" (startMin): within one audio burst (2-23 ms) of the truth while the device clock keeps pace with performance.now()
   (tools/mic-sim/micrec-clock.mjs); early by drift x the take's length when it runs fast (500 ppm over 60 s: about 28 ms, still nearer
   than micRecStartPerfV1, the estimate before, which stays for a capture with no buffer timing; recClockShiftMs saves the gap). */
function micRecStartPerf(rec){
  return rec.startMin != null ? rec.startMin : micRecStartPerfV1(rec);
}
/* Every take saved before 2026-11-16: the first buffer's playbackTime taken as the end of its input, mapped through (perf0, ctx0) read at
   micRecStart. Chromium's playbackTime is when the OUTPUT buffer plays, one buffer (4096 samples: 85 ms at 48 kHz) after the input ended,
   plus the first handler's delay; and a context whose device has not started yet reads currentTime 0, which puts the stamp early by that
   wait. On the 46 take summaries (replayed through the real game code): 92 ms late on the median take, about 130 ms early on 2 of 43. */
function micRecStartPerfV1(rec){
  const firstEnd = rec.firstPlay != null ? rec.firstPlay : rec.ctx0;
  return rec.perf0 + (firstEnd - rec.ctx0) * 1000 - 4096 / rec.srcRate * 1000;
}
// Box-filtered resample to MICREC_RATE, as 16-bit little-endian PCM.
function micRecPcm16(rec){
  const all = new Float32Array(rec.n);
  let o = 0;
  rec.bufs.forEach(b => { all.set(b, o); o += b.length; });
  const ratio = rec.srcRate / MICREC_RATE;
  const outN = Math.floor(rec.n / ratio);
  const out = new Int16Array(outN);
  for (let i = 0; i < outN; i++){
    const a = Math.floor(i * ratio), b = Math.max(a + 1, Math.floor((i + 1) * ratio));
    let s = 0;
    for (let k = a; k < b && k < all.length; k++) s += all[k];
    const v = Math.max(-1, Math.min(1, s / (b - a)));
    out[i] = v < 0 ? v * 32768 : v * 32767;
  }
  return out;
}
/* What the browser really gave the mic (2026-11-13, research-4 R4): the
   site asks for echo cancellation, noise suppression, automatic gain and
   voice isolation off (coachAcquireMicInner), but Chromium on ChromeOS may
   force automatic gain on whatever a page asks. Saved with each take as one
   map, `micSettings`, so a take made with processing on can be told apart.
   Only these keys, and only a true/false or a number (Firestore refuses
   `undefined`, and a browser may leave any of them out). Nothing that names
   the device: getSettings() also returns deviceId and groupId, which stay
   behind; the device is already in micLabel (micRecMicName). null when the
   browser reports none of them. */
const MICREC_SETTING_KEYS = ['echoCancellation', 'noiseSuppression', 'autoGainControl', 'voiceIsolation', 'sampleRate', 'channelCount', 'latency'];
function micRecTrackSettings(stream){
  try {
    const tr = stream && stream.getAudioTracks()[0];
    const got = tr && typeof tr.getSettings === 'function' ? tr.getSettings() : null;
    if (!got) return null;
    const out = {};
    MICREC_SETTING_KEYS.forEach(k => {
      const v = got[k];
      if (typeof v === 'boolean' || (typeof v === 'number' && isFinite(v))) out[k] = v;
    });
    return Object.keys(out).length ? out : null;
  } catch(e){ return null; }
}
/* Save a stopped capture with the take's metadata. Times in `meta` are
   performance.now() values; they are made relative to the recording's
   start here. Quiet on failure — a lost recording costs the student
   nothing. */
/* Saves run one after another: two takes in quick succession write the
   same chunk docs, and overlapping writes could splice them together. */
let micRecSaving = Promise.resolve();
/* The mic's device label can carry its owner's name ("Maria's AirPods",
   "AirPods de María"). Keep the device, drop the owner — BEFORE upload.
   Same rule, same two regexes, as teacher.js micEvalMicName (which cleans
   it again for display, and documents why the Spanish strip is
   case-sensitive); change one and change the other. */
function micRecMicName(label){
  return String(label || '')
    .replace(/^.*?['’]s\s+/i, '')
    .replace(/\s+de\s+\p{Lu}[^\s()]*(?:\s+\p{Lu}[^\s()]*)*/gu, '');
}
function micRecSave(rec, meta){
  micRecSaving = micRecSaving.then(() => micRecSaveNow(rec, meta)).catch(() => {});
  return micRecSaving;
}
async function micRecSaveNow(rec, meta){
  if (!rec || !rec.n || IS_TEACHER_MODE || !currentUser) return;
  const t0 = micRecStartPerf(rec);
  const rel = x => x == null ? null : Math.round((x - t0) * 10) / 10;
  const doc = Object.assign({}, meta.fields);
  doc.expected = (meta.expected || []).map(e => Object.assign({}, e, { t: rel(e.t) }));
  doc.events = (meta.events || []).map(e => Object.assign({}, e, { t: rel(e.t) }));
  /* Power Chord Switch: the tempo changes made while playing (ccLiveBpm), on the same clock; the field is left out when there were none. */
  if (meta.tempoChanges && meta.tempoChanges.length) doc.tempoChanges = meta.tempoChanges.map(e => Object.assign({}, e, { t: rel(e.t) }));
  /* No name on a take (Jonathan, 2026-11-16): the uid alone ties it to the student; the console looks the name up on its roster (teacherMicWho). */
  Object.assign(doc, {
    uid: currentUser.uid,
    period: (typeof periodOverride !== 'undefined' && periodOverride) || (typeof studentPeriod !== 'undefined' && studentPeriod) || '',
    mode: rec.mode,
    micLatencyMs: coachMicLatencyMs(),
    sampleRate: MICREC_RATE,
    srcSampleRate: rec.srcRate,
    durationSec: Math.round(rec.n / rec.srcRate * 100) / 100,
    micLabel: micRecMicName(rec.track),
    userAgent: (navigator.userAgent || '').slice(0, 300),
    frameMeanMs: rec.frames ? Math.round(rec.frameSum / rec.frames * 10) / 10 : null,
    frameMaxMs: Math.round(rec.frameMax * 10) / 10,
    lang: typeof getLang === 'function' ? getLang() : ''
  });
  if (rec.settings) doc.micSettings = rec.settings;   // left out when the browser reported none (micRecTrackSettings)
  /* The start the times rest on (micRecStartPerf): recClock 2 and the old estimate less the new one (old t = t - shift); neither field on a
     take timed by the old estimate. */
  if (rec.startMin != null){
    const shift = Math.round((micRecStartPerfV1(rec) - rec.startMin) * 10) / 10;
    doc.recClock = 2;
    if (isFinite(shift)) doc.recClockShiftMs = shift;
  }
  const pcm = micRecPcm16(rec);
  if (isDevBypassUser()){
    if (micRecLocal()){ micRecLocalOffer(doc, pcm, rec); return; }   // local recording mode: files, never Firestore
    console.info('[micRec] dev bypass — not uploading', doc, pcm.length + ' samples'); return;
  }
  let stage = 'save';   // 'count' once the take itself is written: a counter failure must not read as a lost take (review R1-2)
  try {
    if (typeof ensureDb === 'function') await ensureDb();
    if (!db) return;
    const id = currentUser.uid + '-' + rec.mode;
    const ref = db.collection('micTakes').doc(id);
    const bytes = new Uint8Array(pcm.buffer);
    const nChunks = Math.ceil(bytes.length / MICREC_CHUNK);
    for (let i = 0; i < nChunks; i++){
      await ref.collection('chunks').doc(String(i)).set({ i,
        pcm: firebase.firestore.Blob.fromUint8Array(bytes.subarray(i * MICREC_CHUNK, (i + 1) * MICREC_CHUNK)) });
    }
    doc.chunks = nChunks;
    doc.bytes = bytes.length;
    doc.savedAt = firebase.firestore.FieldValue.serverTimestamp();
    await ref.set(doc);
    // Count it once per take id (an overwrite of the same student's game
    // is not a new take). Remembered on this device, so a second device
    // can over-count by one — the quota only decides when asking stops.
    stage = 'count';
    let saved = [];
    try { saved = JSON.parse(localStorage.getItem('micRecSaved') || '[]'); } catch(e){}
    if (saved.indexOf(id) < 0){
      const cRef = db.collection('micTakesMeta').doc('count');
      await db.runTransaction(async tx => {
        const c = await tx.get(cRef);
        if (c.exists) tx.update(cRef, { n: (c.data().n || 0) + 1 });
        else tx.set(cRef, { n: 1 });
      });
      micTakesCount++;
      saved.push(id);
      try { localStorage.setItem('micRecSaved', JSON.stringify(saved)); } catch(e){}
    }
  } catch(e){
    console.warn(stage === 'count' ? '[micRec] take saved, take counter failed' : '[micRec] save failed', e);
    /* Seen by the teacher in Tools -> Error log (SITE_ERRORS, anonymous): the game, the error's code and the field Firestore names; never
       the error's own text, which carries the document path (the uid). Nothing is shown to the student. */
    try { const f = /in field ([\w.`[\]]+)/.exec(String(e && e.message || '')); if (typeof SITE_ERRORS !== 'undefined') SITE_ERRORS.report('error', { message: (stage === 'count' ? '[micRec] take saved, counter failed: ' : '[micRec] save failed: ') + rec.mode + ' ' + String((e && (e.code || e.name)) || 'error').slice(0, 40) + (f ? ' in field ' + f[1] : '') }); } catch(_){}
  }
}

