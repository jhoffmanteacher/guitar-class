/* ── Mic recordings view ────────────────────────────────────────────────
   Real classroom audio for tuning the mic listening (coach.js micRec*).
   Off until switched on here. While on, a student starting a Listening
   Coach check or a Note Runner round is asked ONCE per device "Save this
   take as a recording to help your teacher make this feature better?" —
   only a "Yes, save it" device records, with a red "Recording this take
   for your teacher" label showing the whole time. It stops asking once
   `max` takes are saved (micTakesMeta/count).

   Each take is micTakes/<uid>-<coach|nr|pw>: the metadata on the doc, the
   audio (24 kHz 16-bit mono, at most 30 s) in chunks/{i}. Download WAV
   puts the chunks back together into a .wav right here in the browser;
   Download data is the doc as JSON (what was expected and when, what the
   mic heard, the verdicts, the device). Needs the micTakes rules pasted
   into the Firebase console — see firestore.rules. */
let teacherMicTakes = [];
/* A take's saved time as a Date, or null. Students write these docs and the
   micTakes rule checks only the id and uid, so savedAt can be a plain map
   whose toDate / toMillis is not a function — calling it would throw and
   leave the whole view on "Loading…". */
function micTakeDate(d){
  const t = d && d.savedAt;
  return t && typeof t.toDate === 'function' ? t.toDate() : null;
}
/* The take's expected notes: an array of objects, whatever was written
   (a non-array, or a null entry, threw on .filter / e.verdict). */
function micTakeExpected(d){
  return Array.isArray(d && d.expected) ? d.expected.filter(e => e && typeof e === 'object') : [];
}
async function renderTeacherMic(){
  const box=document.getElementById('t-grid-container');
  box.innerHTML='<div class="t-loading">Loading mic recordings…</div>';
  const cfg = await loadTeacherClassConfig();
  if(teacherView!=='mic' || !cfg) return;
  if(!teacherClassConfigReadOk){
    box.innerHTML='<div class="t-loading">Could not read the class settings — check your connection and reload.</div>';
    return;
  }
  let count = 0, takes = [], readErr = '';
  try{
    await ensureDb();
    const c = await db.collection('micTakesMeta').doc('count').get();
    count = c.exists ? (Number(c.data().n) || 0) : 0;
    const snap = await db.collection('micTakes').get();
    takes = snap.docs.map(d => Object.assign({ id: d.id }, d.data()));
    takes.sort((a,b) => ((micTakeDate(b) || 0) - (micTakeDate(a) || 0)));
  }catch(e){
    readErr = 'Could not load the recordings. If you have not yet pasted the new firestore.rules into the Firebase console (Firestore Database → Rules → Publish), do that first.';
  }
  if(teacherView!=='mic') return;
  teacherMicTakes = takes;
  const ms = cfg.micSampling || {};
  const on = ms.on === true;
  const max = Number(ms.max) > 0 ? Number(ms.max) : 40;
  const ctl = `
    <div class="tg-class">
      <div class="tg-class-lbl">&#x1F399;&#xFE0F; Collect mic recordings</div>
      <div class="tg-seg">
        <button class="tg-seg-btn ${on?'on':''}" onclick="teacherSetMicSampling(true)">On</button>
        <button class="tg-seg-btn ${!on?'on':''}" onclick="teacherSetMicSampling(false)">Off</button>
      </div>
    </div>
    <div class="tg-note">
      Stop after <input type="number" id="t-mic-max" min="1" max="500" value="${max}" style="width:5em"> takes
      <button class="tg-seg-btn" onclick="teacherSetMicSampling(${on})">Save</button>
      · Collected so far: <b>${count}</b>
      <button class="tg-seg-btn" onclick="teacherResetMicCount()">Reset counter</button>
    </div>
    <div class="tg-note">When this is on, each student is asked once per device before a Listening Coach check, a Note Runner round or a Power Chord Switch game. Only students who say “Yes, save it” are recorded, with a red label on screen while it records. Each student keeps one take per game; a newer take replaces it. Students load the setting when they open the site.</div>`;
  if(readErr){ box.innerHTML = ctl + `<div class="t-loading">${escHtml(readErr)}</div>`; return; }
  if(!takes.length){ box.innerHTML = ctl + '<div class="t-loading">No recordings yet.</div>'; return; }
  const rows = takes.map((d, i) => {
    const saved = micTakeDate(d), when = saved ? saved.toLocaleString() : '—';
    const game = d.mode === 'nr' ? 'Note Runner' + (d.level != null ? ' · level ' + (Number(d.level) + 1) : '')
               : d.mode === 'pw' ? 'Power Chord Switch' + (d.progression ? ' · ' + d.progression : '')
                                 : 'Listening Coach' + (d.coachMode ? ' · ' + d.coachMode : '');
    const exp = micTakeExpected(d);
    const right = exp.filter(e => ['ok','oct','perfect','good'].indexOf(e.verdict) >= 0).length;
    return `<tr><td class="nc" title="${escAttr(d.name || d.uid || '')}">${escHtml(d.name || (d.uid || '').slice(0,8))}</td>`+
      `<td>${escHtml(d.period || '')}</td><td>${escHtml(game)}</td><td>${escHtml(String(d.bpm || ''))}</td>`+
      `<td>${escHtml(String(d.durationSec || ''))} s</td><td>${right} / ${exp.length}</td><td>${escHtml(when)}</td>`+
      `<td><button class="tg-seg-btn" onclick="teacherMicDownloadWav(${i})">Download WAV</button> `+
      `<button class="tg-seg-btn" onclick="teacherMicDownloadJson(${i})">Download data</button> `+
      `<button class="tg-seg-btn" onclick="teacherMicDelete(${i})">Delete</button></td></tr>`;
  }).join('');
  box.innerHTML = ctl + `<div class="tg-note" style="margin:12px 0 16px"><button class="tp-btn primary" id="t-mic-dl-every" style="flex:none;padding:8px 16px;margin-right:10px" onclick="teacherMicDownloadEverything()">Download everything (${takes.length})</button>
      One click: measures every recording, then saves ONE .zip with each recording's WAV and data plus the results. Nothing is changed or deleted. Then, on the Mac: <code>node tools/mic-sim/takes-in.mjs</code></div>
    <div id="t-mic-every-note"></div>
    <div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th><th>Period</th><th>Game</th><th>BPM</th><th>Length</th><th>Counted right</th><th>Saved</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>
    <div class="tg-note" style="margin-top:16px"><button class="tp-btn" id="t-mic-dl-all" style="flex:none;padding:8px 16px;margin-right:10px" onclick="teacherMicDownloadAll()">Download all (${takes.length})</button>
      One .zip with every recording's WAV and data, named the same as the buttons above.</div>
    <div class="tg-note" style="margin-top:8px"><button class="tp-btn primary" style="flex:none;padding:8px 16px;margin-right:10px" onclick="teacherMicEvaluate()">Evaluate all recordings</button>
      Measures every recording: how loud the mic is, the real mic delay, and whether each note the site missed is in the audio. About a minute; nothing is changed.</div>
    <div id="t-mic-eval">${teacherMicEvalRows.length ? teacherMicEvalHtml() : ''}</div>`;
}
async function teacherSetMicSampling(on){
  const el = document.getElementById('t-mic-max');
  const max = Math.max(1, Math.min(500, Math.round(Number(el && el.value) || 40)));
  const prev = (teacherClassConfig || {}).micSampling;
  try{
    await teacherWriteConfig({ micSampling: { on: !!on, max } },
      { 'micSampling.on': prev ? prev.on : undefined, 'micSampling.max': prev ? prev.max : undefined });
    if(teacherClassConfig) teacherClassConfig.micSampling = { on: !!on, max };
  }catch(e){
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='mic') renderTeacherMic();
}
async function teacherResetMicCount(){
  if(!confirm('Set the count of collected takes back to 0? The recordings themselves are kept. Students will be asked again only on devices that have not answered yet.')) return;
  try{
    await ensureDb();
    await db.collection('micTakesMeta').doc('count').set({ n: 0 });
  }catch(e){ alert('Could not reset the counter — check your connection and Firestore rules.'); }
  if(teacherView==='mic') renderTeacherMic();
}
function teacherMicSaveFile(name, blob){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
function teacherMicFileBase(d){
  const who = String(d.name || d.uid || 'student').replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const saved = micTakeDate(d);
  const when = saved ? saved.toISOString().slice(0, 16).replace(/[:T]/g, '-') : 'take';
  return `mic-${d.mode || 'take'}-${who}-${when}`;
}
function teacherMicJsonable(v){
  if(v && typeof v.toDate === 'function') return v.toDate().toISOString();
  if(Array.isArray(v)) return v.map(teacherMicJsonable);
  if(v && typeof v === 'object'){ const o = {}; Object.keys(v).forEach(k => o[k] = teacherMicJsonable(v[k])); return o; }
  return v;
}
function teacherMicDownloadJson(i){
  const d = teacherMicTakes[i]; if(!d) return;
  teacherMicSaveFile(teacherMicFileBase(d) + '.json',
    new Blob([JSON.stringify(teacherMicJsonable(d), null, 2)], { type: 'application/json' }));
}
/* A take's audio chunks, in order (the raw 16-bit PCM bytes). Read side by
   side, not one round trip after another: Download all and Evaluate all call
   this once per take. `chunks` is off the student-written take doc, so it is
   bounded before it sizes anything — a real take is at most 30 s, three
   chunks (coach.js MICREC_MAX_SEC / MICREC_CHUNK). */
const TEACHER_MIC_MAX_CHUNKS = 16;
async function teacherMicChunks(d){
  await ensureDb();
  const ref = db.collection('micTakes').doc(d.id).collection('chunks');
  const n = Math.max(0, Math.ceil(Number(d.chunks) || 0));
  if(n > TEACHER_MIC_MAX_CHUNKS) throw new Error(n + ' chunks is more than one take can hold');
  return Promise.all(Array.from({ length: n }, async (_, k) => {
    const c = await ref.doc(String(k)).get();
    if(!c.exists) throw new Error('chunk ' + k + ' missing');
    return c.data().pcm.toUint8Array();
  }));
}
// The chunks back together, behind a 44-byte WAV header (16-bit mono PCM).
async function teacherMicWavBlob(d){
  const parts = await teacherMicChunks(d);
  const len = parts.reduce((a, p) => a + p.length, 0);
  const rate = d.sampleRate || 24000;
  const h = new DataView(new ArrayBuffer(44));
  const str = (o, s) => { for(let k = 0; k < s.length; k++) h.setUint8(o + k, s.charCodeAt(k)); };
  str(0, 'RIFF'); h.setUint32(4, 36 + len, true); str(8, 'WAVE');
  str(12, 'fmt '); h.setUint32(16, 16, true); h.setUint16(20, 1, true); h.setUint16(22, 1, true);
  h.setUint32(24, rate, true); h.setUint32(28, rate * 2, true); h.setUint16(32, 2, true); h.setUint16(34, 16, true);
  str(36, 'data'); h.setUint32(40, len, true);
  return new Blob([h.buffer].concat(parts), { type: 'audio/wav' });
}
async function teacherMicDownloadWav(i){
  const d = teacherMicTakes[i]; if(!d) return;
  try{
    teacherMicSaveFile(teacherMicFileBase(d) + '.wav', await teacherMicWavBlob(d));
  }catch(e){ alert('Could not download that recording — ' + (e && e.message ? e.message : 'check your connection.')); }
}

/* "Download all": every take's WAV + data in ONE .zip, the same file names
   the per-row buttons use, so tools/mic-sim/anon-takes.mjs reads the
   unzipped folder as-is (pairs share a base name). One file instead of two
   clicks per row, and no "allow multiple downloads" prompt.
   The zip is "stored" (no compression — WAV barely compresses and it keeps
   this dependency-free): local header + data per file, then the central
   directory, then the end record. Names are UTF-8 (flag bit 11). */
let teacherMicCrcTable = null;
function teacherMicCrc32(u8){
  if(!teacherMicCrcTable){
    teacherMicCrcTable = new Uint32Array(256);
    for(let n = 0; n < 256; n++){ let c = n; for(let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; teacherMicCrcTable[n] = c >>> 0; }
  }
  let c = 0xFFFFFFFF;
  for(let i = 0; i < u8.length; i++) c = teacherMicCrcTable[(c ^ u8[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}
// files: [{ name, data: Uint8Array }] -> Blob (application/zip)
function teacherMicZip(files){
  const enc = new TextEncoder(), now = new Date();
  const dosTime = (now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1);
  const dosDate = ((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate();
  const out = [], cen = [];
  let off = 0;
  for(const f of files){
    const nm = enc.encode(f.name), crc = teacherMicCrc32(f.data), sz = f.data.length;
    const lh = new DataView(new ArrayBuffer(30));
    lh.setUint32(0, 0x04034b50, true); lh.setUint16(4, 20, true); lh.setUint16(6, 0x0800, true);
    lh.setUint16(8, 0, true); lh.setUint16(10, dosTime, true); lh.setUint16(12, dosDate, true);
    lh.setUint32(14, crc, true); lh.setUint32(18, sz, true); lh.setUint32(22, sz, true);
    lh.setUint16(26, nm.length, true); lh.setUint16(28, 0, true);
    out.push(lh.buffer, nm, f.data);
    const ch = new DataView(new ArrayBuffer(46));
    ch.setUint32(0, 0x02014b50, true); ch.setUint16(4, 20, true); ch.setUint16(6, 20, true);
    ch.setUint16(8, 0x0800, true); ch.setUint16(10, 0, true); ch.setUint16(12, dosTime, true); ch.setUint16(14, dosDate, true);
    ch.setUint32(16, crc, true); ch.setUint32(20, sz, true); ch.setUint32(24, sz, true);
    ch.setUint16(28, nm.length, true); ch.setUint32(42, off, true);
    cen.push(ch.buffer, nm);
    off += 30 + nm.length + sz;
  }
  const cenLen = cen.reduce((a, p) => a + (p.byteLength != null ? p.byteLength : p.length), 0);
  const end = new DataView(new ArrayBuffer(22));
  end.setUint32(0, 0x06054b50, true); end.setUint16(8, files.length, true); end.setUint16(10, files.length, true);
  end.setUint32(12, cenLen, true); end.setUint32(16, off, true);
  return new Blob(out.concat(cen, [end.buffer]), { type: 'application/zip' });
}
/* Every take's WAV + data as zip entries, for "Download all" and "Download
   everything". `btn` (may be null) shows the count while it reads. Throws
   on the first take it cannot read, so no zip is ever saved with one missing. */
async function teacherMicPackFiles(takes, btn){
  const files = [], used = {};
  for(let i = 0; i < takes.length; i++){
    if(btn){ btn.disabled = true; btn.textContent = `Packing ${i + 1} of ${takes.length}…`; }
    const d = takes[i];
    let base = teacherMicFileBase(d), k = 2;
    while(used[base]) base = teacherMicFileBase(d) + '-' + (k++);
    used[base] = true;
    const wav = new Uint8Array(await (await teacherMicWavBlob(d)).arrayBuffer());
    files.push({ name: base + '.wav', data: wav });
    files.push({ name: base + '.json', data: new TextEncoder().encode(JSON.stringify(teacherMicJsonable(d), null, 2)) });
  }
  return files;
}
async function teacherMicDownloadAll(){
  const takes = teacherMicTakes.slice();
  if(!takes.length) return;
  const btn = document.getElementById('t-mic-dl-all');
  const label = btn ? btn.textContent : '';
  try{
    const files = await teacherMicPackFiles(takes, btn);
    const day = new Date().toISOString().slice(0, 10);
    teacherMicSaveFile(`mic-recordings-${day}.zip`, teacherMicZip(files));
  }catch(e){
    alert('Could not download all the recordings — ' + (e && e.message ? e.message : 'check your connection.'));
  }
  if(btn){ btn.disabled = false; btn.textContent = label; }
}
/* "Download everything": the one click. It runs "Evaluate all recordings",
   then saves ONE .zip: every take's WAV + data (the same names "Download
   all" uses, and the same zip name, so tools/mic-sim/takes-in.mjs picks it
   up as before) plus the results file "Download results" would save
   (mic-eval-<day>.json: no audio, no names). The intake's anonymizer
   ignores a .json with no .wav partner, so the extra file is safe there.
   The results go in only when THIS click's evaluation finished: if the
   listening code did not load, a take could not be measured, or the view
   was left, the zip still holds every recording and the note under the
   button says the results are missing or partial. It reads, measures and
   saves; it never writes to or deletes from Firestore. */
let teacherMicEveryBusy = false;
async function teacherMicDownloadEverything(){
  const takes = teacherMicTakes.slice();
  if(!takes.length || teacherMicEveryBusy) return;
  teacherMicEveryBusy = true;
  const btn = document.getElementById('t-mic-dl-every');
  const label = btn ? btn.textContent : '';
  const note = msg => { const n = document.getElementById('t-mic-every-note'); if(n) n.innerHTML = msg ? `<div class="tg-note">${escHtml(msg)}</div>` : ''; };
  note('');
  try{
    if(btn){ btn.disabled = true; btn.textContent = 'Measuring…'; }
    let measured = false;
    try{ measured = (await teacherMicEvaluate()) === true; }catch(e){ measured = false; }
    if(teacherView !== 'mic'){ teacherMicEveryBusy = false; return; }
    const files = await teacherMicPackFiles(takes, btn);
    const day = new Date().toISOString().slice(0, 10);
    const withResults = measured && teacherMicEvalRows.length > 0;
    if(withResults) files.push({ name: `mic-eval-${day}.json`, data: new TextEncoder().encode(teacherMicEvalJson()) });
    teacherMicSaveFile(`mic-recordings-${day}.zip`, teacherMicZip(files));
    const short = takes.length - teacherMicEvalRows.length;
    note(!withResults ? `Saved ${takes.length} recordings. The results are NOT in the zip: the measuring did not finish. Try "Evaluate all recordings" below.`
       : short > 0 ? `Saved ${takes.length} recordings and the results for ${teacherMicEvalRows.length} of them (${short} could not be measured; see below the table).`
       : `Saved ${takes.length} recordings and their results in one .zip.`);
  }catch(e){
    note('Nothing was saved: could not read every recording — ' + (e && e.message ? e.message : 'check your connection.'));
  }
  teacherMicEveryBusy = false;
  if(btn){ btn.disabled = false; btn.textContent = label; }
}
async function teacherMicDelete(i){
  const d = teacherMicTakes[i]; if(!d) return;
  if(!confirm(`Delete ${d.name || 'this student'}’s ${d.mode === 'nr' ? 'Note Runner' : d.mode === 'pw' ? 'Power Chord Switch' : 'Listening Coach'} recording? This cannot be undone.`)) return;
  try{
    await ensureDb();
    const ref = db.collection('micTakes').doc(d.id);
    const chunks = await ref.collection('chunks').get();
    for(const c of chunks.docs) await c.ref.delete();
    await ref.delete();
  }catch(e){ alert('Could not delete that recording — check your connection and Firestore rules.'); }
  if(teacherView==='mic') renderTeacherMic();
}

/* ── Mic recordings: evaluation ─────────────────────────────────────────
   Shared with tools/mic-sim/eval-takes.mjs, which runs these same functions
   (pulled out of this file) on downloaded WAV + JSON pairs. `deps` carries what comes
   from the site itself, so both runners judge with the SAME code the site
   listens with:
     deps.detectPitch  coachDetectPitch, extracted from coach.js
     deps.GATE         COACH_PITCH_GATE   (RMS floor for a pitch reading)
     deps.GAIN         COACH_MIC_GAIN     (the fixed boost before the gate)
     deps.ATTACK_SKIP / EVENT_TAIL / REFRACT / MATCH_FRAC / MATCH_MIN_MS /
       VOTE_TOL        the COACH_* constants of the same names, for
                       micEvalWhy (defaults inside it if a runner omits them)

   What one take tells us (micTakes/<uid>-<coach|nr|pw>, see coach.js micRec*; a pw take — Power Chord Switch — is measured by micEvalTakePw below, which reads strums, not notes):
   the RAW mic from the count-in to the end, 24 kHz 16-bit mono, plus every
   expected note (time + verdict the site gave) and every event the site
   heard. Times in the JSON are performance.now() made relative to the
   recording's start; event times are "played" = arrival - micLatencyMs.

   The four count-in beeps (660, 660, 660, 990 Hz, 80 ms, through the
   Chromebook's own speaker; a Power Chord Switch round below 60 BPM has two,
   660 and 990, since 2026-11-09: micEvalTakePw) are in the recording. A student who plays on
   the click they HEAR lands in the recording exactly where the click
   landed, because both went speaker/guitar -> air -> mic. So the clicks
   give, per device:
     clickLagMs  where the clicks landed vs when they were scheduled
     mapMs       site's clock vs the recording's, measured on the notes the
                 site detected (it also folds in the detector's own delay)
     idealMs     the micLatencyMs that would make an on-click note score
                 dead on the beat   = clickLagMs + mapMs
     skewMs      what the site actually did to an on-click note
                 (+ = called it late) = idealMs - micLatencyMs
   And per expected note: the audio is replayed through the site's own
   filters + gate + YIN, so a note the site missed can be split into
   "the note is clearly in the audio" (a detector problem) and "it isn't"
   (the student didn't play it, or the mic didn't pick it up). */

/* What every take is read for the same way, whatever the game (micEvalTake,
   micEvalTakePw): the samples as floats, the levels, the pick attacks
   (onsets) and a tone meter (Goertzel). tools/mic-sim/eval-takes.mjs and
   checks.mjs 1cl lift this out together with the two evaluators. */
function micEvalSignal(pcm, R, deps){
  const N = pcm.length;
  const x = new Float32Array(N);
  for (let i = 0; i < N; i++) x[i] = pcm[i] / 32768;
  const ms2s = ms => Math.round(ms / 1000 * R);
  const s2ms = s => s / R * 1000;
  const dB = v => 20 * Math.log10(Math.max(v, 1e-9));
  const r1 = v => v == null || !isFinite(v) ? null : Math.round(v * 10) / 10;
  const pct = (a, q) => { if (!a.length) return null; const b = Array.from(a).sort((p, q2) => p - q2); return b[Math.min(b.length - 1, Math.floor(q * b.length))]; };

  /* ── levels: 20 ms RMS every 5 ms ── */
  const HOP = ms2s(5), WL = ms2s(20);
  const nH = Math.max(0, Math.floor((N - WL) / HOP));
  const env = new Float32Array(nH), hf = new Float32Array(nH);
  let mean = 0, peak = 0, clip = 0;
  for (let i = 0; i < N; i++){ const v = x[i]; mean += v; const a = Math.abs(v); if (a > peak) peak = a; if (a >= 0.999) clip++; }
  mean /= N || 1;
  for (let h = 0; h < nH; h++){
    let s = 0, ds = 0;
    const a = h * HOP;
    for (let i = a; i < a + WL; i++){ const v = x[i] - mean; s += v * v; if (i){ const dd = x[i] - x[i - 1]; ds += dd * dd; } }
    env[h] = Math.sqrt(s / WL); hf[h] = Math.sqrt(ds / WL);
  }
  const envDb = Array.from(env, dB);
  const level = {
    floorDb: r1(pct(envDb, 0.10)), medianDb: r1(pct(envDb, 0.5)), loudDb: r1(pct(envDb, 0.99)),
    peakDb: r1(dB(peak)), clipPct: r1(100 * clip / (N || 1)), dcOffset: Math.round(mean * 1e4) / 1e4,
    // how far the loud bits clear the site's pitch gate after its fixed gain
    gateHeadroomDb: r1(pct(envDb, 0.99) - dB(deps.GATE / deps.GAIN)),
    floorGateDb: r1(pct(envDb, 0.10) - dB(deps.GATE / deps.GAIN))
  };

  /* ── onsets: jumps in the first-difference level (a pick attack is broadband) ── */
  const hfFloor = pct(hf, 0.2) || 1e-6;
  const onsets = [];
  let base = hf[0] || 0, lastOn = -1e9;
  for (let h = 1; h < nH; h++){
    const v = hf[h];
    if (v > base * 2.2 && v > hfFloor * 4 && (h - lastOn) * 5 > 70){
      // the window is 20 ms wide: find the first 1 ms inside it where the jump starts
      const ref = Math.max(base, hfFloor), a = h * HOP, m1 = ms2s(1);
      let at = a + WL - m1;
      for (let s = a; s + m1 <= a + WL; s += m1){
        let ds = 0; for (let i = Math.max(1, s); i < s + m1; i++){ const dd = x[i] - x[i - 1]; ds += dd * dd; }
        if (Math.sqrt(ds / m1) > ref * 3){ at = s; break; }
      }
      onsets.push({ ms: s2ms(at), str: v / ref }); lastOn = h;
    }
    base += (v - base) * 0.12;
  }

  function tone(f, centreS, halfS){
    // sinusoid amplitude at f over [centre-half, centre+half] (Goertzel)
    const a = Math.max(0, centreS - halfS), b = Math.min(N, centreS + halfS);
    if (b - a < 16) return 0;
    const w = 2 * Math.PI * f / R, c = 2 * Math.cos(w);
    let s1 = 0, s2 = 0;
    for (let i = a; i < b; i++){ const s0 = x[i] + c * s1 - s2; s2 = s1; s1 = s0; }
    const re = s1 - s2 * Math.cos(w), im = s2 * Math.sin(w);
    return 2 * Math.sqrt(re * re + im * im) / (b - a);
  }
  return { x, N, env, nH, level, onsets, tone };
}

function micEvalTake(pcm, R, d, deps){
  const { x, N, env, nH, level, onsets, tone } = micEvalSignal(pcm, R, deps);
  const ms2s = ms => Math.round(ms / 1000 * R);
  const s2ms = s => s / R * 1000;
  const dB = v => 20 * Math.log10(Math.max(v, 1e-9));
  const r1 = v => v == null || !isFinite(v) ? null : Math.round(v * 10) / 10;
  const pct = (a, q) => { if (!a.length) return null; const b = Array.from(a).sort((p, q2) => p - q2); return b[Math.min(b.length - 1, Math.floor(q * b.length))]; };
  const med = a => pct(a, 0.5);
  const lat = Number(d.micLatencyMs) || 0;
  const beat = Number(d.beatMs) || (d.bpm ? 60000 / d.bpm : 0);
  // Inline, not micTakeExpected(): tools/mic-sim/eval-takes.mjs lifts this
  // function out on its own. A null entry threw on e.t below.
  const expected = Array.isArray(d.expected) ? d.expected.filter(e => e && typeof e === 'object') : [];
  const events = Array.isArray(d.events) ? d.events : [];

  /* ── count-in clicks ── */
  const clicks = { found: false };
  /* Clicks 2-4 only (2026-10-16). The FIRST click is scheduled ~0.1 s
     after micRecStart, and on the 10-16 Chromebooks it lands in the first
     ~200 ms of the recording, which is still near-silent (the capture is
     warming up) — so requiring all four beeps failed on every take, and
     the best-scoring "candidate" became a played E5/B5 (659/988 Hz, the
     beep pitches) seconds later. Now:
       · the search only runs where the clicks can be: click 1 between
         100 ms early and 600 ms late on the Coach's schedule (Note
         Runner: its four clicks end before its first note);
       · each of clicks 2, 3, 4 must stand > CLICK_EACH x its OWN tone's
         background (median of that tone over the count-in) — a per-beep
         test, no overall ratio, so one loud beep can't carry two missing
         ones;
       · and their onsets must agree to within CLICK_JITTER ms.
     Click 1 is measured and reported (`first`) when it is in the audio,
     never required. A take with no clicks (fake-take.mjs clicks=0) stays
     found: false. */
  const CLICK_EACH = 4, CLICK_JITTER = 40;
  if (beat > 0){
    const e0 = expected[0] && expected[0].t;
    const halfS = ms2s(20), stepS = ms2s(4), B = ms2s(beat);
    const fOf = j => j === 3 ? 990 : 660;
    // each tone's background over the count-in (and a beat past it)
    const bgEnd = Math.min(N, ms2s((e0 != null ? e0 : 4 * beat) + beat));
    const bg = [660, 990].map(f => { const v = []; for (let s = 0; s + 2 * halfS < bgEnd; s += ms2s(20)) v.push(tone(f, s + halfS, halfS)); return med(v) || 1e-9; });
    const bgOf = j => j === 3 ? bg[1] : bg[0];
    // click 1's arrival, on the recording's clock
    let lo, hi;
    if (d.mode !== 'nr' && e0 != null){ lo = ms2s(e0 - 4 * beat - 100); hi = ms2s(e0 - 4 * beat + 600); }
    else { lo = -B; hi = e0 != null ? ms2s(e0 + 600) - 4 * B : ms2s(1500); }
    lo = Math.max(lo, -B + 1); hi = Math.min(hi, N - 3 * B - 2 * halfS);
    let best = null;
    for (let c = lo; c <= hi; c += stepS){
      const k = [1, 2, 3].map(j => tone(fOf(j), c + j * B + halfS, halfS) / bgOf(j));
      const v = Math.min(...k);
      if (!best || v > best.v) best = { c, v, k };
    }
    if (best){
      const e0c = e0;
      const lagC = d.mode !== 'nr' && e0c != null ? s2ms(best.c) - (e0c - 4 * beat) : null;
      const first = best.c >= 0 ? r1(tone(660, best.c + halfS, halfS) / bg[0]) : null;
      clicks.snrDb = r1(dB(best.v));
      // each click's onset: first 2 ms step where its tone passes half its own peak
      const onsetOf = j => {
        const f = fOf(j), c0 = best.c + j * B;
        let pk = 0; const prof = [];
        for (let s = c0 - ms2s(60); s < c0 + ms2s(100); s += ms2s(2)){ const v = tone(f, s, ms2s(5)); prof.push([s, v]); if (v > pk) pk = v; }
        const hit = prof.find(p => p[1] >= pk * 0.5);
        return s2ms(hit ? hit[0] : c0) - j * beat;
      };
      const ons = [1, 2, 3].map(onsetOf);
      const jitter = Math.max(...ons) - Math.min(...ons);
      // why it was or wasn't found — eval-takes prints this per take
      clicks.diag = { bestMs: r1(s2ms(best.c)), each: best.k.map(r1), first, jitterMs: r1(jitter),
        lagC: lagC == null ? null : r1(lagC), firstNoteMs: e0c != null ? r1(e0c) : null };
      if (best.k.every(v => v > CLICK_EACH) && jitter <= CLICK_JITTER){
        const c0ms = med(ons);
        clicks.found = true;
        clicks.audioMs = r1(c0ms);
        clicks.jitterMs = r1(jitter);
        clicks.ampDb = r1(dB(Math.max(...[1, 2, 3].map(j => tone(fOf(j), best.c + j * B + halfS, halfS)))));
        // when the first click was scheduled, on the recording's clock
        if (e0 != null){
          if (d.mode === 'nr'){
            // Note Runner's first note can sit after beat 1: try each half beat
            let bestL = null;
            for (let j = 0; j <= 32; j++){
              const L = c0ms - (e0 - (4 + j / 2) * beat);
              if (bestL == null || Math.abs(L - 120) < Math.abs(bestL - 120)) bestL = L;
            }
            clicks.lagMs = r1(bestL);
          } else clicks.lagMs = r1(c0ms - (e0 - 4 * beat));
        }
      }
    }
  }

  /* ── the site's clock vs the recording's, from the events it heard ── */
  const nearOnset = (ms, win) => {
    let b = null;
    for (const o of onsets){ const dd = Math.abs(o.ms - ms); if (dd <= win && (!b || dd < Math.abs(b.ms - ms))) b = o; }
    return b;
  };
  const maps = [];
  events.forEach(ev => { if (ev.t == null) return; const o = nearOnset(ev.t + lat, 120); if (o) maps.push(ev.t + lat - o.ms); });
  const mapMs = maps.length >= 3 ? med(maps) : null;
  const latency = { settingMs: lat, clickFound: clicks.found, clickSnrDb: clicks.snrDb == null ? null : clicks.snrDb,
    clickAmpDb: clicks.ampDb == null ? null : clicks.ampDb, clickJitterMs: clicks.jitterMs == null ? null : clicks.jitterMs,
    clickLagMs: clicks.lagMs == null ? null : clicks.lagMs, mapMs: r1(mapMs), mapN: maps.length, clickDiag: clicks.diag || null };
  if (clicks.lagMs != null && mapMs != null){
    latency.idealMs = r1(clicks.lagMs + mapMs);
    latency.skewMs = r1(clicks.lagMs + mapMs - lat);
  }

  /* ── replay each expected note through the site's filters + gate + YIN ── */
  // 2x up to 48 kHz (what the live analyser runs at), then gain + 70 Hz HP + 1500 Hz LP
  const R2 = R * 2, y = new Float32Array(N * 2);
  for (let i = 0; i < N; i++){ const a = x[i], b = i + 1 < N ? x[i + 1] : a; y[2 * i] = a; y[2 * i + 1] = (a + b) / 2; }
  function biquad(buf, type, f0, Q){
    const w = 2 * Math.PI * f0 / R2, al = Math.sin(w) / (2 * Q), cw = Math.cos(w);
    let b0, b1, b2;
    if (type === 'hp'){ b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; } else { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; }
    const a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
    let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
    for (let i = 0; i < buf.length; i++){
      const v = buf[i], o = (b0 * v + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
      x2 = x1; x1 = v; y2 = y1; y1 = o; buf[i] = o;
    }
  }
  for (let i = 0; i < y.length; i++) y[i] *= deps.GAIN;
  biquad(y, 'hp', 70, 0.7); biquad(y, 'lp', 1500, 0.7);
  const FW = 2048;
  function readings(fromMs, toMs){
    const out = [];
    for (let t = fromMs; t <= toMs; t += 15){
      const end = Math.round((t + 42.7) / 1000 * R2);
      if (end > y.length || end - FW < 0) continue;
      let s = 0; for (let i = end - 1024; i < end; i++) s += y[i] * y[i];
      if (Math.sqrt(s / 1024) <= deps.GATE) continue;
      const f = deps.detectPitch(y, R2, 0.22, end);
      if (f > 0) out.push(69 + 12 * Math.log2(f / 440));
    }
    return out;
  }
  /* The Coach's own reading schedule: one 2048-sample window ending every
     `step` ms from `fromEnd` to `toEnd` (recording ms), gated at half
     COACH_PITCH_GATE the way coachLoop gates its readings. */
  function siteReadings(fromEnd, toEnd, step, times){
    const out = [];
    for (let t = fromEnd; t <= toEnd; t += step){
      const end = Math.round(t / 1000 * R2);
      if (end > y.length || end - FW < 0) continue;
      let s = 0; for (let i = end - 1024; i < end; i++) s += y[i] * y[i];
      if (Math.sqrt(s / 1024) <= deps.GATE * 0.5) continue;
      const f = deps.detectPitch(y, R2, 0.22, end);
      if (f > 0){ out.push(69 + 12 * Math.log2(f / 440)); if (times) times.push(t); }
    }
    return out;
  }
  const VERD = { ok: 'right', oct: 'right', perfect: 'right', good: 'right', wrong: 'wrong', pitch: 'wrong', dim: 'unclear', miss: 'miss' };
  // where an on-the-click note lands in the recording
  const offs = clicks.lagMs != null ? clicks.lagMs : (mapMs != null ? lat - mapMs : lat);
  const floorDb = level.floorDb;
  const notes = [];
  /* A note whose window runs past the end of the audio (the 30 s cap, or Stop)
     is not judged: `dropped`, the rule micEvalTakePw keeps for a change. Real
     takes (2026-11-04) had 42 of 64 Note Runner notes past the cap, which
     read as "no pluck" and gave a median level of -141.6 dB. */
  const endMs = s2ms(N);
  let dropped = 0;
  expected.forEach((e, i) => {
    if (e.t == null) return;
    const want = e.t + offs;
    const half = Math.min(beat ? beat * 0.5 : 300, 400);
    if (want + half > endMs){ dropped++; return; }
    let o = null;
    for (const on of onsets){ const dd = on.ms - want; if (dd >= -half && dd < half && (!o || Math.abs(dd) < Math.abs(o.ms - want))) o = on; }
    const at = o ? o.ms : want;
    let pk = 0; for (let h = Math.floor(at / 5); h < Math.floor((at + 150) / 5) && h < nH; h++) if (h >= 0 && env[h] > pk) pk = env[h];
    const rd = readings(at + 30, at + Math.min(beat ? beat * 0.9 : 500, 500));
    let site = VERD[e.verdict] || e.verdict || '?';
    if (site === 'wrong' && e.unclear) site = 'unclear';
    const chord = !!(e.chord || (e.midis && e.midis.length > 1 && d.coachMode === 'chords'));
    const rec = { i, site, played: !!o, secondLook: !!e.secondLook, onsetMs: o ? r1(o.ms - want) : null, snrDb: r1(dB(pk) - floorDb), n: rd.length,
      heard: rd.length ? r1(med(rd)) : null };
    // what the site itself had for this note: the event it matched here
    const sev = d.mode === 'nr'
      ? events.filter(ev => ev.t != null && Math.abs(ev.t - e.t) < (beat || 600) / 2).sort((a, b) => Math.abs(a.t - e.t) - Math.abs(b.t - e.t))[0]
      : events.find(ev => ev.slot === i);
    const srd = sev && Array.isArray(sev.readings) ? sev.readings : [];
    rec.siteN = srd.length;
    rec.siteHeard = srd.length ? r1(med(srd)) : null;
    if (chord){
      const cls = (e.midis && e.midis.length ? e.midis : [e.midi, e.midi + 7]).filter(m => m != null).map(m => ((m % 12) + 12) % 12);
      const share = rd.length ? rd.filter(r => cls.indexOf(((Math.round(r) % 12) + 12) % 12) >= 0).length / rd.length : 0;
      rec.chord = true; rec.share = Math.round(share * 100) / 100;
      rec.replay = rd.length < 2 ? 'none' : share >= 0.2 ? 'present' : 'other';
    } else if (e.midi != null){
      const T = e.midi;
      const ex = rd.filter(r => Math.abs(r - T) <= 0.5), oc = rd.filter(r => Math.abs(r - T - 12) <= 0.5);
      rec.midi = T;
      rec.exact = rd.length ? Math.round(ex.length / rd.length * 100) / 100 : 0;
      rec.oct = rd.length ? Math.round(oc.length / rd.length * 100) / 100 : 0;
      const near = ex.map(r => r - T).concat(oc.map(r => r - T - 12));
      rec.cents = near.length ? Math.round(100 * med(near)) : null;
      rec.replay = rd.length < 2 ? 'none' : rec.exact + rec.oct >= 0.5 ? 'present' : rec.exact + rec.oct >= 0.2 ? 'mixed' : 'other';
      /* An ESTIMATE of the 2026-10-14 "second look" proposal, which was
         never built (the one coach.js got on 2026-10-16 is COACH_LOOK_TAIL —
         a different window and rule; tools/mic-sim/whatif-tail.mjs models
         that one): what it would do with a note it called
         unclear: the same window — from
         the matched event's attack + 70 ms to 3/4 of a beat (at most
         600 ms) past the beat, or the event's own 340 ms if later — read
         on the Coach's 40 ms schedule; right when the note or its octave
         is at least half of at least 3 readings. */
      if (d.mode !== 'nr' && site === 'unclear'){
        const m0 = mapMs != null ? mapMs : 0;
        const beatA = e.t + (Number(d.gridOffsetMs) || 0) + lat - m0;
        const hitA = sev && sev.t != null ? sev.t + lat - m0 : beatA;
        const lk = siteReadings(hitA + 70, Math.max(beatA + Math.min((beat || 600) * 0.75, 600), hitA + 340), 40);
        const share = lk.length ? lk.filter(r => Math.abs(r - T) <= 0.6 || Math.abs(r - T - 12) <= 0.6).length / lk.length : 0;
        rec.look = { n: lk.length, share: Math.round(share * 100) / 100, pass: lk.length >= 3 && share >= 0.5 };
      }
      // low strings: fundamental vs 2nd harmonic, straight off the raw mic
      if (T < 52 && o && rd.length >= 2){
        const f0 = 440 * Math.pow(2, (T - 69) / 12), c = ms2s(at + 90);
        const h1 = tone(f0, c, ms2s(42)), h2 = tone(2 * f0, c, ms2s(42));
        rec.h1h2Db = r1(dB(h1) - dB(h2));
      }
    } else return;
    rec.why = micEvalWhy(e, i, site, chord, sev);
    notes.push(rec);
  });

  /* WHY a note the site did not count ended up with too few readings
     (2026-10-16 work order, Phase 1). Both the consensus median and
     coachMelodyVote need >= 2 readings, so the question is where the
     readings went. One category per not-counted note:
       no-onset         no site event (onset) anywhere in the slot's match
                        window — `audio` says whether the recording has a
                        pick attack there that the site's detector missed
       onset-elsewhere  a site event is in the window but went to another
                        slot / stayed unmatched / (Note Runner) sat outside
                        the ±goodMs timing window — or `refract`: the
                        recording's attack fell inside COACH_ONSET_REFRACT
                        of an earlier site onset, which swallowed it
       readings-cut     the matched event had < 2 readings in its own
                        window (ATTACK_SKIP..EVENT_TAIL after arrival)
       vote-failed      >= 2 readings, but consensus and the vote both
                        failed; `share` = fraction on the target (or octave)
     and `counted` / `wrong` for the rest. For every category the replay
     also reads the audio on the site's own schedule (40 ms, half gate,
     YIN 0.22): `winN` inside the event's window, `lateN` / `lateHit` in
     the 400 ms after it (stopping short of the next beat), so "would a
     longer tail have helped" is answered from the audio, not a guess.
     Site clock -> recording: arrival = t + micLatencyMs, minus mapMs. */
  function micEvalWhy(e, i, site, chord, sevAny){
    const m0 = mapMs != null ? mapMs : 0;
    const toRec = siteArrival => siteArrival - m0;
    const nr = d.mode === 'nr';
    const SKIP = deps.ATTACK_SKIP || 70, TAIL = deps.EVENT_TAIL || 340, REFR = deps.REFRACT || 140;
    const TOL = deps.VOTE_TOL || 0.6;
    const winMs = nr ? (Number(d.goodMs) || 160)
      : (beat ? Math.min(beat, Math.max(beat * (deps.MATCH_FRAC || 0.9), deps.MATCH_MIN_MS || 320)) : 320);
    const beatSite = e.t + (nr ? 0 : (Number(d.gridOffsetMs) || 0));   // "played" clock
    const targets = chord ? null : (e.midis && e.midis.length ? e.midis : [e.midi]).filter(m => m != null);
    const onTarget = r => chord
      ? (() => { const cls = (e.midis && e.midis.length ? e.midis : [e.midi, e.midi + 7]).filter(m => m != null).map(m => ((m % 12) + 12) % 12);
          return cls.indexOf(((Math.round(r) % 12) + 12) % 12) >= 0; })()
      : targets.some(m => Math.abs(r - m) <= TOL || Math.abs(r - m - 12) <= TOL);
    // the event this note was graded on
    let sev = null;
    if (nr){
      sev = events.filter(ev => ev.t != null && Math.abs(ev.t - e.t) <= winMs)
        .sort((a, b) => Math.abs(a.t - e.t) - Math.abs(b.t - e.t))[0] || null;
    } else sev = sevAny || null;
    const out = { cat: site === 'right' ? 'counted' : site === 'wrong' ? 'wrong' : null };
    // the window the readings came from (or would have), on the recording's clock
    let hitA;
    if (sev){
      hitA = toRec(sev.t + lat);
      // the recording's own pick attack nearest the site's onset: + = the
      // site fired BEFORE the attack (its window opened on the room)
      let ao = null;
      for (const on of onsets){ const dd = on.ms - hitA; if (Math.abs(dd) <= 250 && (!ao || Math.abs(dd) < Math.abs(ao.ms - hitA))) ao = on; }
      out.attackOffMs = ao ? r1(ao.ms - hitA) : null;
    } else {
      const beatA = toRec(beatSite + lat);
      let ao = null;
      for (const on of onsets){ const dd = on.ms - beatA; if (Math.abs(dd) <= winMs && (!ao || Math.abs(dd) < Math.abs(ao.ms - beatA))) ao = on; }
      out.audio = !!ao;
      hitA = ao ? ao.ms : beatA;
      if (ao) out.audioDevMs = r1(ao.ms - beatA);
    }
    // stop short of the NEXT written note's arrival (Note Runner has rests
    // and half-beat notes, so its own time, not one beat on)
    const e2 = expected[i + 1];
    const nextA = e2 && e2.t != null ? toRec(e2.t + (nr ? 0 : (Number(d.gridOffsetMs) || 0)) + lat) - 60
      : hitA + TAIL + 400;
    const win = siteReadings(hitA + SKIP, hitA + TAIL, 40);
    const lateT = [];
    const late = siteReadings(hitA + TAIL + 40, Math.min(hitA + TAIL + 400, nextA), 40, lateT);
    // [ms after the tail, midi] — for tools/mic-sim/whatif-tail.mjs
    out.lateR = late.map((m, k) => [Math.round(lateT[k] - hitA - TAIL), Math.round(m * 100) / 100]);
    out.siteN = sev && Array.isArray(sev.readings) ? sev.readings.length : 0;
    out.graded = !!sev;
    if (sev && Array.isArray(sev.readings)) out.siteR = sev.readings.slice();
    out.winN = win.length;
    out.lateN = late.length;
    out.lateHit = late.filter(onTarget).length;
    if (sev && Array.isArray(sev.readings) && sev.readings.length){
      out.share = Math.round(sev.readings.filter(onTarget).length / sev.readings.length * 100) / 100;
    }
    if (out.cat) return out;
    if (sev){
      out.cat = out.siteN >= 2 ? 'vote-failed' : 'readings-cut';
      return out;
    }
    // no event graded this note: is there one nearby that went elsewhere?
    const reach = nr ? Math.max(winMs, (beat || 600) / 2) : winMs;
    const near = events.filter(ev => ev.t != null && Math.abs(ev.t - beatSite) <= reach)
      .sort((a, b) => Math.abs(a.t - beatSite) - Math.abs(b.t - beatSite))[0];
    if (near){
      out.cat = 'onset-elsewhere';
      out.detail = nr ? 'outside timing window' : (near.slot >= 0 ? 'slot ' + near.slot : 'unmatched');
      out.devMs = r1(near.t - beatSite);
      out.nearN = Array.isArray(near.readings) ? near.readings.length : 0;
      return out;
    }
    if (out.audio){
      // the recording's attack, back on the site's arrival clock
      const aoSite = hitA + m0;
      const prev = events.filter(ev => ev.t != null && aoSite - (ev.t + lat) > 0 && aoSite - (ev.t + lat) <= REFR);
      if (prev.length){ out.cat = 'onset-elsewhere'; out.detail = 'refract'; return out; }
    }
    out.cat = 'no-onset';
    return out;
  }

  const cnt = f => notes.filter(f).length;
  const strong = n => n.played && n.snrDb != null && n.snrDb >= 15;
  const lowNotes = notes.filter(n => n.h1h2Db != null);
  const extra = onsets.filter(on => !expected.some(e => e.t != null && Math.abs(e.t + offs - on.ms) < Math.max(150, (beat || 600) * 0.35))).length;
  const startMs = expected.length && expected[0].t != null ? expected[0].t + offs : 0;
  const playMs = Math.max(1, s2ms(N) - startMs);
  const summary = {
    n: notes.length, dropped,
    siteRight: cnt(n => n.site === 'right'), siteWrong: cnt(n => n.site === 'wrong'),
    siteUnclear: cnt(n => n.site === 'unclear'), siteMiss: cnt(n => n.site === 'miss'),
    replayPresent: cnt(n => n.replay === 'present'),
    // the site said not-right, but the note is clearly in the audio, loud
    detectorMissed: cnt(n => n.site !== 'right' && n.replay === 'present' && strong(n)),
    // the site said right, the replay can't find it
    siteRightReplayNot: cnt(n => n.site === 'right' && n.replay !== 'present'),
    // a steady pitch, but not the written one: how far off, in semitones
    // (one offset over and over = an out-of-tune guitar or a wrong string;
    // scattered = wrong frets, or a neighbour's guitar)
    offPitch: (() => {
      const h = {};
      notes.forEach(n => { if (n.midi != null && n.replay === 'other' && n.heard != null && n.n >= 3){ const k = Math.round(n.heard - n.midi); h[k] = (h[k] || 0) + 1; } });
      return h;
    })(),
    unclearSiteReadings: med(notes.filter(n => n.site === 'unclear').map(n => n.siteN)),
    presentSiteReadings: med(notes.filter(n => n.site === 'unclear' && n.replay === 'present').map(n => n.siteN)),
    // no new pick attack anywhere near the note: nothing was played there
    silentMiss: cnt(n => (n.site === 'miss' || n.site === 'unclear') && !n.played && n.replay !== 'present'),
    // counted right by the second look (coach.js COACH_LOOK_TAIL, 2026-10-16;
    // takes saved before then never carry it)
    secondLook: cnt(n => n.secondLook),
    // what a second look WOULD do with this take's unclear notes (estimate only):
    // count right (and of those, how many the replay also finds clearly)
    lookWould: cnt(n => n.look && n.look.pass),
    lookWouldPresent: cnt(n => n.look && n.look.pass && n.replay === 'present'),
    // micEvalWhy's category for every note: counted / wrong / no-onset /
    // onset-elsewhere / readings-cut / vote-failed
    why: notes.reduce((h, n) => { const c = n.why && n.why.cat || '?'; h[c] = (h[c] || 0) + 1; return h; }, {}),
    octDominant: cnt(n => n.oct > n.exact && n.oct >= 0.3),
    medianSnrDb: r1(med(notes.filter(n => n.snrDb != null).map(n => n.snrDb))),
    medianCents: (() => { const c = notes.filter(n => n.cents != null).map(n => n.cents); return c.length ? med(c) : null; })(),
    medianAbsOnsetMs: r1(med(notes.filter(n => n.onsetMs != null).map(n => Math.abs(n.onsetMs)))),
    lowH1H2Db: r1(med(lowNotes.map(n => n.h1h2Db))), lowN: lowNotes.length
  };
  return {
    level, latency, notes: summary, perNote: notes,
    room: { extraOnsetsPerMin: Math.round(extra / playMs * 60000), onsets: onsets.length }
  };
}

/* The site's own strum rule, replayed over a recording (a WHAT-IF: nothing
   here changes how the game grades). Lifted from coach.js at run time, never
   copied by hand: deps.strum = { consts, ccLoopSrc, readFrameSrc, smoothSrc }
     consts         CHK_ONSET_FLOOR / _RATIO, CHK_HF_FLOOR / _RATIO,
                    COACH_ONSET_REFRACT, COACH_LVL_WIN, COACH_LVL_HOP,
                    COACH_CATCHUP_MAX_MS, as FLOOR RATIO HF_FLOOR HF_RATIO
                    REFRACT WIN HOP CATCHUP
     ccLoopSrc      the text of ccLoop: its `if ((rms > ... ) && at - ... >
                    COACH_ONSET_REFRACT)` condition is compiled and RUN here,
                    with the two ratios passed in
     readFrameSrc   the text of coachReadFrame: the easing's base and step
                    (coachSmoothA = 1 - Math.pow(b, dt / step)) and the arrival
                    fraction are read from it; the window arithmetic (RMS and
                    first-difference level of 1024 samples every 512, the
                    loudest window of the frame's fresh audio) is written out
                    in micEvalStrumFrames, and the source must still contain
                    every line it mirrors, or this returns null
     smoothSrc      the text of coachSmooth, run as it is
   Returns null when coach.js no longer has the shape this expects (checks.mjs
   1cl turns red then), so a what-if is never run against a rule it did not
   read. What it cannot know: the student's real frame times (it uses a steady
   frame every d.frameMeanMs) and the analyser's own 48 kHz samples (the take is
   24 kHz; the window length is scaled, the first-difference level is not). */
function micEvalStrumRule(sp){
  if (!sp || !sp.consts || !sp.ccLoopSrc || !sp.readFrameSrc || !sp.smoothSrc) return null;
  const c = sp.consts;
  for (const k of ['FLOOR', 'RATIO', 'HF_FLOOR', 'HF_RATIO', 'REFRACT', 'WIN', 'HOP', 'CATCHUP']) if (!(Number(c[k]) > 0)) return null;
  const lp = String(sp.ccLoopSrc), rf = String(sp.readFrameSrc);
  // (\u007b is the opening brace: a bare one in this regex would confuse the tools that lift this function out by counting braces)
  const cond = lp.match(/if \((\(rms > CHK_ONSET_FLOOR[\s\S]*?COACH_ONSET_REFRACT)\)\u007b/);
  if (!cond || /\/\/|\/\*/.test(cond[1])) return null;
  // what ccLoop does after the condition holds, and the order of it
  if (!/cc\.lastOnsetT = at;/.test(lp) || lp.indexOf('coachSmooth(cc, rms, coachHfRms);') < lp.indexOf('cc.lastOnsetT = at;')) return null;
  const alpha = rf.match(/coachSmoothA = 1 - Math\.pow\(([\d.]+), dt \/ ([\d.]+)\)/);
  const arrive = rf.match(/w\.rms >= rms \* ([\d.]+) \|\| w\.hf >= hf \* \1\)/);
  for (const need of ['Math.sqrt(sum / N)', 'Math.sqrt(dsum / N)', 'const d = v - buf[i - 1];', 'sum += v * v;', 'dsum += d * d;',
    'end > L - fresh + COACH_LVL_HOP && end - N >= 1', 'gapMs <= COACH_CATCHUP_MAX_MS', 'fresh = Math.round(gapMs / 1000 * sr)',
    'const dt = Math.max(0, Math.min(gapMs, 1000));']) if (rf.indexOf(need) < 0) return null;
  if (!alpha || !arrive) return null;
  let fires, smoothFn;
  try {
    // ccLoop's condition names onsetRatio / hfRatio since 2026-11-05 (Power Chord Switch has its own); the CHK_* names are supplied too, for an older text of it
    fires = new Function('rms', 'coachHfRms', 'cc', 'at', 'CHK_ONSET_FLOOR', 'CHK_ONSET_RATIO', 'CHK_HF_FLOOR', 'CHK_HF_RATIO', 'COACH_ONSET_REFRACT', 'onsetRatio', 'hfRatio', 'return ' + cond[1] + ';');
    smoothFn = new Function('let coachSmoothA = 0;\n' + sp.smoothSrc + '\nreturn function(st, r, h, a){ coachSmoothA = a; coachSmooth(st, r, h); };')();
  } catch (e){ return null; }
  const base = Number(alpha[1]), step = Number(alpha[2]);
  return {
    FLOOR: Number(c.FLOOR), RATIO: Number(c.RATIO), HF_FLOOR: Number(c.HF_FLOOR), HF_RATIO: Number(c.HF_RATIO), REFRACT: Number(c.REFRACT),
    WIN: Number(c.WIN), HOP: Number(c.HOP), CATCHUP: Number(c.CATCHUP), ARRIVE: Number(arrive[1]),
    // does the frame (rms, hf, at ms) make an onset, with these two ratios, given this loop's levels
    fires: (rms, hf, st, at, ratio, hfRatio) => !!fires(rms, hf, st, at, c.FLOOR, ratio, c.HF_FLOOR, hfRatio, c.REFRACT, ratio, hfRatio),
    smooth: (st, rms, hf, dtMs) => smoothFn(st, rms, hf, 1 - Math.pow(base, dtMs / step))
  };
}

/* The levels the site's loop would have read from this recording: one frame
   every frameMs, each the loudest of the 1024-sample (at the analyser's rate)
   windows, one every 512, that end in the audio since the last frame
   (coachReadFrame), and the moment its jump arrived (the oldest window already
   near the frame's peak). x = the take as floats at R; srcRate = the
   analyser's rate. Independent of the ratios: computed once per take. */
function micEvalStrumFrames(x, R, srcRate, frameMs, rule){
  const k = R / srcRate, N = Math.max(8, Math.round(rule.WIN * k)), HOP = Math.max(1, Math.round(rule.HOP * k));
  const step = Math.max(1, Math.round(frameMs / 1000 * R));
  const fresh = frameMs <= rule.CATCHUP ? Math.round(frameMs / 1000 * R) : 0;
  const dt = Math.min(frameMs, 1000);
  const frames = [];
  for (let L = step; L <= x.length; L += step){
    let rms = 0, hf = 0;
    const wins = [];
    for (let end = L; end === L || (end > L - fresh + HOP && end - N >= 1); end -= HOP){
      if (end - N < 1) break;
      let sum = 0, dsum = 0;
      for (let i = end - N; i < end; i++){ const v = x[i]; sum += v * v; const d = v - x[i - 1]; dsum += d * d; }
      const w = { end, rms: Math.sqrt(sum / N), hf: Math.sqrt(dsum / N) };
      wins.push(w);
      if (w.rms > rms) rms = w.rms;
      if (w.hf > hf) hf = w.hf;
    }
    if (!wins.length) continue;
    let arr = wins[0];
    for (let j = wins.length - 1; j >= 0; j--){ const w = wins[j]; if (w.rms >= rms * rule.ARRIVE || w.hf >= hf * rule.ARRIVE){ arr = w; break; } }
    frames.push({ at: arr.end / R * 1000, rms, hf, dt });
  }
  return frames;
}

/* The strums (recording ms) the site's rule would have heard at these two ratios. */
function micEvalStrumHits(frames, rule, ratio, hfRatio){
  const st = { smoothRms: 0, smoothHf: 0, lastOnsetT: -1e9 }, out = [];
  for (const f of frames){
    if (rule.fires(f.rms, f.hf, st, f.at, ratio, hfRatio)){ st.lastOnsetT = f.at; out.push(f.at); }
    rule.smooth(st, f.rms, f.hf, f.dt);
  }
  return out;
}

/* A Power Chord Switch take (micTakes/<uid>-pw, coach.js ccRecMeta). Takes saved
   from 2026-11-05 hold each change's pitch readings (expected[].readings); only
   the `pitch` column below reads them, older takes have none, and the measurement
   itself is what the audio says on its own:
   was there a strum where the site listened for each change, against the
   site's verdict. Same row shape as micEvalTake (the console table and
   eval-takes read both), plus `kind: 'pw'` and `rounds`.
   A song switch is three rounds (`stage` 0..2), each at its own tempo (`bpm`
   on every change) and with its own count-in; a pair is one round. Round k's
   listen start is its first change's due time minus `bpc` beats (coach.js
   ccBeginStage: change s is due s x bpc beats after it, from s = 1); its N
   beeps were scheduled N..1 beats before that: N = the take's countInBeats
   for the round (2 below 60 BPM since 2026-11-09), 4 for a take without it.
     - Mic delay: beeps 2-4 of a 4-click round, beeps 1-2 of a 2-click one,
       found the way micEvalTake finds them (each > CLICK_EACH x its own
       tone's background, onsets within CLICK_JITTER), give where they landed
       (lag). A 2-click round whose beep 1 is not heard, or whose saved count
       is missing or odd, gives none (the count-in section below says why).
       The site's events against
       the audio's attacks give the site's clock vs the recording's (map, the
       whole take); ideal = lag + map, as in micEvalTake; skew = ideal - the
       saved micLatencyMs. Beeps can be missing: speaker muted, headphones, or
       a student strumming over the count-in.
     - The site's own window, replayed: ccLoop takes a strum for the first open
       change with |its beat - rel| <= win (inclusive), rel = played time -
       listenStart - gridOffset, win = half a beat, at least 220 ms, at most
       half the gap between changes; gridOffset moves a quarter of the way to
       each strum's nearest beat, by at most the take's gridStepCapMs (none saved = uncapped; from 0 each round), AFTER rel is taken. Every
       strum it heard is in `events` (played time), so the match and the
       gridOffset are run again here, and on the recording the window sits at
       due + gridOffset + micLatencyMs - map. With no map (fewer than 3 heard
       strums found in the audio) the window is centred on the beeps' lag, else
       on the setting: `rounds[].centre` says which ('site' / 'beeps' / 'setting').
     - Per change, against the site's verdict:
         agree            site ok/off, a strum in its window
         false-hit        site ok/off, no strum in it (a chord left ringing, noise)
         detector-missed  site miss, but a strum in it
         off-window       site miss, none in it, but a strum (in the audio, or
                          heard by the site) up to a quarter beat outside it (never
                          past half the gap between changes), or that near the
                          beat the student heard (the beeps): played early or
                          late, or the delay setting put the window off the strum
         silent-miss      site miss, nothing near (not played, or further off)
       `replayMismatch` counts changes where the replayed match and the saved
       verdict disagree (0 unless the site's rule and this copy differ).
     - A change whose window runs past the end of the audio (the 30 s cap, or a
       Stop) is not judged: `dropped`.
     - Every number here was written by the student's browser and is not checked
       by the rules: a change with an impossible time, round or tempo (outside
       coach.js CC_POWER_BPM_MIN..CC_BPM_MAX, CC_LADDER_ROUNDS, CC_RATES' bpc; checks.mjs
       1cl pins these copies) is left out and counted in `ignored`; a change of a round the student retimed while
       playing (`retimed: true`, coach.js ccLiveBpm) is left out and counted in `retimed`, which is not bad data. No loop then runs
       on a saved number alone: the grid loop stops at the number of beats the
       changes span, the replay is events x a binary search, and the per-change
       searches grow with changes x (onsets + events) — onsets are capped by the
       30 s of audio, changes and events by the size of a Firestore document
       (1 MB), so a crafted take is slow at worst, never endless.
   Whether a strum was the RIGHT chord is not measured here.
   `whatIf` (only when deps.strum is given; see micEvalStrumRule): the site's own
   strum rule replayed over the audio at the shared ratios older takes were graded with and at stricter ones
   (full-band 1.8 / 2.2 / 2.6, the HF ratio scaled the same), each replayed
   strum put back on the site's clock and matched to the changes the way ccLoop
   does. Per candidate: falseHitsRemoved (a false-hit change that no longer has a
   strum) and realLost (an agree change that no longer has one); `reproduced` =
   changes where the replay at that ratio hears what the site heard (the
   current-ratio row says how far the replay can be trusted). Measurement only.
   `strumRatio` { full, hf, saved }: the ratios the take was graded with (saved: from its own fields; else the
   shared ones, as every older take). `whatIfSkipped`: it was graded with other ratios than the replay starts
   from (Power Chord Switch's own: 2.2 / 2.67 from 2026-11-05, 1.8 / 2.19 from 2026-11-07), so it has no `whatIf`.
   `pitch` (null for a take saved before 2026-11-05, which has no expected[].readings):
   what "no readable pitch, no tick" would do, from the pitch readings each change's chord
   check had (coach.js ccResolvePend). The site grades a strum right on timing alone when it
   got under 3 readings; the rule would not tick those. Of the changes graded right: `withPitch`
   (3+ readings, kept) and `timingOnly` (under 3, would lose the tick); of those timing-only
   ones `realLost` are changes the recording agrees were strummed and `falseHitsRemoved` are
   false hits (noise, a chord left ringing). `falseHits` and `agree` are the same denominators
   as the strum what-if's. `unknown` = graded right with no usable readings list. A wrong
   verdict already needs 3+ readings, so the rule never touches those. Measurement only.
   Proved on synthetic takes with known answers: tools/mic-sim/fake-pw-take.mjs,
   checks.mjs 1cl. */
function micEvalTakePw(pcm, R, d, deps){
  const { x, N, env, nH, level, onsets, tone } = micEvalSignal(pcm, R, deps);
  const ms2s = ms => Math.round(ms / 1000 * R);
  const s2ms = s => s / R * 1000;
  const dB = v => 20 * Math.log10(Math.max(v, 1e-9));
  const r1 = v => v == null || !isFinite(v) ? null : Math.round(v * 10) / 10;
  const pct = (a, q) => { if (!a.length) return null; const b = Array.from(a).sort((p, q2) => p - q2); return b[Math.min(b.length - 1, Math.floor(q * b.length))]; };
  const med = a => pct(a, 0.5);
  const num = v => typeof v === 'number' && isFinite(v);
  const BPM_MIN = 10, BPM_MAX = 140, ROUNDS = 3, BPCS = [1, 2, 4];
  /* The most the site's grid moved for one strum (coach.js CC_GRID_STEP_CAP_MS): saved in the take since 2026-11-07 (ccRecMeta gridStepCapMs). A take without it
     was graded on the uncapped grid, so it is replayed uncapped, or the console would judge it on a grid the site did not use. */
  const gridCap = num(d.gridStepCapMs) && d.gridStepCapMs >= 0 && d.gridStepCapMs <= 10000 ? d.gridStepCapMs : Infinity;
  const endMs = s2ms(N);
  /* A change can fall long after the saved audio ends: the audio is capped at 30 s, and a 3-round song switch at
     BPM_MIN is 3 x (4 + 32 + 1) beats x 6 s = 666 s. Those are `dropped` (came after the recording stopped), not bad data. */
  const LATE_MS = ROUNDS * (4 + 8 * 4 + 1) * 60000 / BPM_MIN;
  const inSpan = t => num(t) && t >= -60000 && t <= endMs + LATE_MS;
  const lat = num(d.micLatencyMs) && Math.abs(d.micLatencyMs) <= 5000 ? d.micLatencyMs : 0;
  const bpc = BPCS.indexOf(d.bpc) >= 0 ? d.bpc : 0;
  const stageBpms = Array.isArray(d.stageBpms) ? d.stageBpms : [];
  const stageOf = o => o.stage == null ? 0 : o.stage;
  let ignored = 0, retimed = 0;
  const expected = [];
  (Array.isArray(d.expected) ? d.expected : []).forEach((e, k) => {
    if (!e || typeof e !== 'object') return;
    const st = stageOf(e);
    // a round whose tempo the student changed while playing (coach.js ccLiveBpm) has no single beat grid to replay: left out and counted as `retimed`, not as bad data
    if (e.retimed === true){ retimed++; return; }
    if (!bpc || !inSpan(e.t) || !Number.isInteger(st) || st < 0 || st >= ROUNDS){ ignored++; return; }
    expected.push({ e, k, stage: st });
  });
  const events = (Array.isArray(d.events) ? d.events : []).filter(ev => ev && typeof ev === 'object' && inSpan(ev.t));

  /* ── the rounds, from the changes' stages ── */
  const byStage = {};
  expected.forEach(c => { (byStage[c.stage] = byStage[c.stage] || []).push(c); });
  const rounds = [];
  Object.keys(byStage).map(Number).sort((a, b) => a - b).forEach(stage => {
    const list = byStage[stage].sort((a, b) => a.e.t - b.e.t);
    const bpm = Number(list[0].e.bpm) || Number(stageBpms[stage]) || Number(d.bpm) || 0;
    if (!(bpm >= BPM_MIN && bpm <= BPM_MAX)){ ignored += list.length; return; }
    const beat = 60000 / bpm;
    rounds.push({ stage, bpm, beat, list, listen: list[0].e.t - bpc * beat, win: Math.min(beat * bpc * 0.5, Math.max(220, beat * 0.5)), clicks: { found: false } });
  });

  /* ── each round's count-in ── */
  /* Its clicks: coach.js ccCountInBeats, saved per round in `countInBeats` since 2026-11-09 (2 below 60 BPM, else 4). A take without the
     field counted 4 in every round, as every take saved before did. A take WITH the field whose entry for a round is missing or is not
     exactly 2 or 4 (the browser wrote it, nothing checks it) has its clicks guessed from the round's tempo, as ccCountInBeats would give them,
     and that round gives no lag (`guessed`): a wrong guess would look for the beeps in the wrong place.
     A 4-click count-in: beeps 2..4 are measured, as micEvalTake does (beep 1 could fall in the capture's first, near-silent buffers). A
     2-click count-in: beeps 1 AND 2, 660 then 990 Hz (COACH_COUNTIN_REC_LEAD, 0.4 s, puts a recording's beep 1 past that silence since
     2026-10-16). Either way each beep measured must stand > CLICK_EACH x its own tone's background and their onsets must agree within
     CLICK_JITTER: that agreement is what rejects a played E5/B5 (659/988 Hz) taken for a beep. Then they give the lag. When a 2-click
     count-in's beep 1 is not heard, beep 2 is looked for alone and reported (`oneBeep`), but gives no lag: one onset has nothing to agree
     with. A round without a lag has its windows on the site's own beat when the strums give the map, else on the lag of the take's other
     rounds, else on the delay setting alone ('setting'). */
  const CLICK_EACH = 4, CLICK_JITTER = 40;
  const halfS = ms2s(20), stepS = ms2s(4);
  const hasCountIns = d.countInBeats != null, countIns = Array.isArray(d.countInBeats) ? d.countInBeats : [];
  rounds.forEach(rd => {
    const saved = countIns[rd.stage], guessed = hasCountIns && saved !== 2 && saved !== 4;
    const nb = !hasCountIns ? 4 : guessed ? (rd.bpm < 60 ? 2 : 4) : saved;
    rd.countIn = nb;
    // the beeps measured (j counts from 0): 1 and 2 of a 2-click count-in, 2..4 of a 4-click one
    const fOf = j => j === nb - 1 ? 990 : 660, used = nb === 2 ? [0, 1] : Array.from({ length: nb - 1 }, (_, k) => k + 1);
    const B = ms2s(rd.beat), c1 = rd.listen - nb * rd.beat;
    rd.clicks = { found: false, beeps: nb, used: used.length, heard: 0, oneBeep: false, guessed };
    // each tone's background over this count-in only (the last round's chord may still ring into it)
    const bgA = Math.max(0, ms2s(c1 - 200)), bgB = Math.min(N, ms2s(rd.listen + 200));
    const bg = [660, 990].map(f => { const v = []; for (let s = bgA; s + 2 * halfS < bgB; s += ms2s(20)) v.push(tone(f, s + halfS, halfS)); return med(v) || 1e-9; });
    const bgOf = j => j === nb - 1 ? bg[1] : bg[0];
    // beep 1's arrival: 100 ms early to 600 ms late on its schedule; the best place for the beeps `js`
    const lo = Math.max(ms2s(c1 - 100), -B + 1), hi = Math.min(ms2s(c1 + 600), N - (nb - 1) * B - 2 * halfS);
    const search = js => {
      let b = null;
      for (let c = lo; c <= hi; c += stepS){
        const k = js.map(j => tone(fOf(j), c + j * B + halfS, halfS) / bgOf(j));
        const v = Math.min(...k);
        if (!b || v > b.v) b = { c, v, k };
      }
      return b;
    };
    const best = search(used);
    if (!best) return;
    // each beep's onset: first 2 ms step where its tone passes half its own peak
    const onsetOf = j => {
      const f = fOf(j), c0 = best.c + j * B;
      let pk = 0; const prof = [];
      for (let s = c0 - ms2s(60); s < c0 + ms2s(100); s += ms2s(2)){ const v = tone(f, s, ms2s(5)); prof.push([s, v]); if (v > pk) pk = v; }
      const hit = prof.find(p => p[1] >= pk * 0.5);
      return s2ms(hit ? hit[0] : c0) - j * rd.beat;
    };
    const ons = used.map(onsetOf);
    const jitter = Math.max(...ons) - Math.min(...ons);
    rd.clicks = { found: false, beeps: nb, used: used.length, heard: best.k.filter(v => v > CLICK_EACH).length, oneBeep: false, guessed,
      snrDb: r1(dB(best.v)), each: best.k.map(r1), jitterMs: r1(jitter) };
    if (!guessed && best.k.every(v => v > CLICK_EACH) && jitter <= CLICK_JITTER){
      rd.clicks.found = true;
      rd.clicks.lagMs = r1(med(ons) - c1);
      rd.clicks.ampDb = r1(dB(Math.max(...used.map(j => tone(fOf(j), best.c + j * B + halfS, halfS)))));
    } else if (nb === 2 && !(best.k[0] > CLICK_EACH)){
      // beep 1 not heard: is beep 2 (990 Hz) there on its own? Reported, never a lag
      const b2 = search([1]);
      if (b2 && b2.k[0] > CLICK_EACH){ rd.clicks.oneBeep = true; rd.clicks.heard = 1; }
    }
  });

  /* ── the site's clock vs the recording's, from the strums it heard ── */
  const nearOnset = (ms, win) => {
    let b = null;
    for (const o of onsets){ const dd = Math.abs(o.ms - ms); if (dd <= win && (!b || dd < Math.abs(b.ms - ms))) b = o; }
    return b;
  };
  const maps = [];
  events.forEach(ev => { const o = nearOnset(ev.t + lat, 120); if (o) maps.push(ev.t + lat - o.ms); });
  const mapMs = maps.length >= 3 ? med(maps) : null;
  const lags = rounds.filter(rd => rd.clicks.found).map(rd => rd.clicks.lagMs);
  const takeLag = lags.length ? med(lags) : null;

  /* ── ccLoop's matching, replayed on the strums it heard ── */
  // evs = [{ t: played ms }] of one round, in time order; returns the strum each change took and the gridOffset after every strum
  const matchRound = (rd, evs) => {
    const at = rd.list.map(c => c.e.t - rd.listen);        // each change's c.beat * beatMs
    const match = rd.list.map(() => null);
    const timeline = [];                                    // [played, gridOffset after it]
    let goff = 0;
    evs.forEach(ev => {
      const rel = ev.t - rd.listen - goff;
      // the first open change within win of rel (the list is in time order; at most a few qualify)
      let lo = 0, hi = at.length;
      while (lo < hi){ const m = (lo + hi) >> 1; if (at[m] < rel - rd.win) lo = m + 1; else hi = m; }
      for (let k = lo, n = 0; k < at.length && at[k] <= rel + rd.win && n < 8; k++, n++){
        if (!match[k]){ match[k] = { t: ev.t, goff }; break; }
      }
      const dev = rel - Math.round(rel / rd.beat) * rd.beat;
      if (Math.abs(dev) < rd.beat * 0.5) goff += Math.max(-gridCap, Math.min(gridCap, dev * 0.25));
      timeline.push([ev.t, goff]);
    });
    return { match, timeline };
  };
  rounds.forEach(rd => {
    const evs = events.filter(ev => stageOf(ev) === rd.stage).sort((a, b) => a.t - b.t);
    const m = matchRound(rd, evs);
    rd.match = m.match; rd.timeline = m.timeline; rd.evs = evs;
  });

  /* ── every change: a strum where the site listened, against its verdict ── */
  const notes = [], judged = [];
  rounds.forEach((rd, rk) => {
    // the student's grid (the beeps): this round's, else the take's, else the setting less the map
    rd.offs = rd.clicks.found ? rd.clicks.lagMs : takeLag != null ? takeLag : (mapMs != null ? lat - mapMs : lat);
    rd.centre = mapMs != null ? 'site' : rd.clicks.found || takeLag != null ? 'beeps' : 'setting';
    rd.shift = rd.centre === 'site' ? lat - mapMs : rd.offs;       // recording ms = the site's played ms + shift
    const half = rd.win, gap = bpc * rd.beat, reach = Math.min(gap / 2, half + rd.beat / 4);
    const out = dd => Math.abs(dd) > half && Math.abs(dd) <= reach;
    rd.dropped = 0;
    rd.list.forEach(({ e, k }, idx) => {
      // the gridOffset the site judged this change with: its strum's, else the one after every strum before the window opened
      let goff = 0;
      if (rd.match[idx]) goff = rd.match[idx].goff;
      else for (const p of rd.timeline){ if (p[0] < e.t - half) goff = p[1]; else break; }
      const siteAt = e.t + goff;                            // the window's centre on the site's "played" clock
      const want = rd.centre === 'site' ? siteAt + lat - mapMs : e.t + rd.offs;
      if (want + half > endMs){ rd.dropped++; return; }
      let o = null;
      for (const on of onsets){ const dd = on.ms - want; if (Math.abs(dd) <= half && (!o || Math.abs(dd) < Math.abs(o.ms - want))) o = on; }
      const at = o ? o.ms : want;
      let pk = 0; for (let h = Math.floor(at / 5); h < Math.floor((at + 150) / 5) && h < nH; h++) if (h >= 0 && env[h] > pk) pk = env[h];
      const site = e.verdict === 'ok' ? 'right' : e.verdict === 'off' ? 'wrong' : 'miss';
      const heard = site !== 'miss';
      let cat = o ? (heard ? 'agree' : 'detector-missed') : heard ? 'false-hit' : 'silent-miss';
      if (cat === 'silent-miss'){
        const heardBeat = rd.clicks.found || takeLag != null ? e.t + rd.offs : null;
        if (onsets.some(on => out(on.ms - want) || (heardBeat != null && Math.abs(on.ms - want) > half && Math.abs(on.ms - heardBeat) <= reach)) ||
            rd.evs.some(ev => out(ev.t - siteAt))) cat = 'off-window';
      }
      judged.push({ rk, idx, cat, site, rn: Array.isArray(e.readings) ? e.readings.length : null, saved: 'readings' in e });
      notes.push({ i: num(e.i) ? e.i : k, stage: rd.stage, site, played: !!o, onsetMs: o ? r1(o.ms - want) : null,
        snrDb: r1(dB(pk) - level.floorDb), replay: o ? 'present' : 'none', siteHeard: !!rd.match[idx], gridOffsetMs: r1(goff), why: { cat } });
    });
  });
  /* ── pitch rule: "no readable pitch, no tick", from the readings the take saved (null for an older take) ── */
  let pitch = null;
  if (judged.some(j => j.saved)){
    const right = judged.filter(j => j.site === 'right'), known = right.filter(j => j.rn != null), low = list => list.filter(j => j.rn < 3);
    pitch = { right: right.length, withPitch: known.length - low(known).length, timingOnly: low(known).length, unknown: right.length - known.length,
      falseHits: judged.filter(j => j.cat === 'false-hit').length, agree: judged.filter(j => j.cat === 'agree').length,
      falseHitsRemoved: low(known.filter(j => j.cat === 'false-hit')).length, realLost: low(known.filter(j => j.cat === 'agree')).length };
  }
  /* ── what-if: the site's strum rule, replayed on the audio, at the shared ratios older takes were graded with and stricter ones ── */
  let whatIf = null;
  const rule = judged.length ? micEvalStrumRule(deps.strum) : null;
  /* The strum ratios this take was graded with: saved in the take from 2026-11-05 (coach.js ccRecMeta; Power Chord Switch uses its own, stricter
     ones), else the shared ones, which is what every older take was graded with. The what-if replays STRICTER ratios than the take's own, from the
     shared ones: a take graded with other ratios is left out of it (`whatIfSkipped`) rather than replayed as if it had been graded with those. */
  const sc = deps.strum && deps.strum.consts;
  const ratioOf = v => num(v) && v >= 1 && v <= 10 ? v : null;
  const ownFull = ratioOf(d.onsetRatio), ownHf = ratioOf(d.hfRatio);
  const strumRatio = ownFull && ownHf ? { full: ownFull, hf: ownHf, saved: true }
    : sc && Number(sc.RATIO) > 0 ? { full: Number(sc.RATIO), hf: Number(sc.HF_RATIO), saved: false } : null;
  const whatIfSkipped = !!(strumRatio && strumRatio.saved && sc && (Math.abs(strumRatio.full - Number(sc.RATIO)) > 1e-9 || Math.abs(strumRatio.hf - Number(sc.HF_RATIO)) > 1e-9));
  if (rule && !whatIfSkipped){
    const srcRate = num(d.srcSampleRate) && d.srcSampleRate >= 8000 && d.srcSampleRate <= 192000 ? d.srcSampleRate : 48000;
    const frameMs = num(d.frameMeanMs) && d.frameMeanMs > 0 ? Math.min(150, Math.max(1000 / 60, d.frameMeanMs)) : 50;
    const frames = micEvalStrumFrames(x, R, srcRate, frameMs, rule);
    // a round's play phase on the site's clock: from its listen start to the next round's count-in
    rounds.forEach((rd, k) => { rd.end = k + 1 < rounds.length ? rounds[k + 1].listen - rounds[k + 1].countIn * rounds[k + 1].beat : Infinity; });
    const ratios = [rule.RATIO].concat([1.8, 2.2, 2.6].filter(v => v > rule.RATIO));
    const candidates = ratios.map(ratio => {
      const hfRatio = Math.round(rule.HF_RATIO * ratio / rule.RATIO * 100) / 100;
      const hits = micEvalStrumHits(frames, rule, ratio, hfRatio);
      const evsBy = rounds.map(() => []);
      hits.forEach(r => {
        for (let k = 0; k < rounds.length; k++){
          const p = r - rounds[k].shift;
          if (p >= rounds[k].listen && p < rounds[k].end){ evsBy[k].push({ t: p }); break; }
        }
      });
      const matches = rounds.map((rd, k) => matchRound(rd, evsBy[k]).match);
      const c = { ratio, hfRatio, strums: evsBy.reduce((a, l) => a + l.length, 0), judged: judged.length, reproduced: 0, falseHits: 0, falseHitsRemoved: 0, agree: 0, realLost: 0 };
      judged.forEach(j => {
        const fires = !!matches[j.rk][j.idx];
        if (fires === (j.site !== 'miss')) c.reproduced++;
        if (j.cat === 'false-hit'){ c.falseHits++; if (!fires) c.falseHitsRemoved++; }
        if (j.cat === 'agree'){ c.agree++; if (!fires) c.realLost++; }
      });
      return c;
    });
    whatIf = { frameMs: Math.round(frameMs * 10) / 10, srcRate, frames: frames.length, candidates };
  }
  const cnt = f => notes.filter(f).length;
  const roundRows = rounds.map(rd => {
    const ns = notes.filter(n => n.stage === rd.stage), c = cat => ns.filter(n => n.why.cat === cat).length;
    const out = { stage: rd.stage, bpm: rd.bpm, n: ns.length, dropped: rd.dropped, centre: rd.centre,
      agree: c('agree'), detectorMissed: c('detector-missed'), falseHit: c('false-hit'), offWindow: c('off-window'), silentMiss: c('silent-miss'),
      clickFound: rd.clicks.found, clickSnrDb: rd.clicks.snrDb == null ? null : rd.clicks.snrDb,
      // the count-in's clicks, and of the beeps measured (1-2, or 2-4) how many were heard; oneBeep: a 2-click count-in's beep 2 alone (no lag); guessed: the take's entry for the round was missing or odd (no lag)
      clickBeeps: rd.clicks.beeps, clickUsed: rd.clicks.used, clickHeard: rd.clicks.heard, clickOneBeep: !!rd.clicks.oneBeep, clickGuessed: !!rd.clicks.guessed,
      clickLagMs: rd.clicks.found ? rd.clicks.lagMs : null, clickDiag: rd.clicks.each ? { each: rd.clicks.each, jitterMs: rd.clicks.jitterMs } : null,
      idealMs: null, skewMs: null };
    if (out.clickLagMs != null && mapMs != null){ out.idealMs = r1(out.clickLagMs + mapMs); out.skewMs = r1(out.clickLagMs + mapMs - lat); }
    return out;
  });
  const withClicks = rounds.filter(rd => rd.clicks.found);
  const snrs = (withClicks.length ? withClicks : rounds).map(rd => rd.clicks.snrDb).filter(v => v != null);
  const latency = { settingMs: lat, clickFound: withClicks.length > 0, clickSnrDb: snrs.length ? r1(med(snrs)) : null,
    clickAmpDb: withClicks.length ? r1(med(withClicks.map(rd => rd.clicks.ampDb))) : null,
    clickJitterMs: withClicks.length ? r1(med(withClicks.map(rd => rd.clicks.jitterMs))) : null,
    clickLagMs: r1(takeLag), mapMs: r1(mapMs), mapN: maps.length, clickDiag: null,
    roundsWithClicks: withClicks.length, rounds: rounds.length };
  if (takeLag != null && mapMs != null){
    latency.idealMs = r1(takeLag + mapMs);
    latency.skewMs = r1(takeLag + mapMs - lat);
  }
  const summary = {
    n: notes.length,
    siteRight: cnt(n => n.site === 'right'), siteWrong: cnt(n => n.site === 'wrong'), siteUnclear: 0, siteMiss: cnt(n => n.site === 'miss'),
    replayPresent: cnt(n => n.played),
    agree: cnt(n => n.why.cat === 'agree'),
    // the site said miss, but there is a strum in its window
    detectorMissed: cnt(n => n.why.cat === 'detector-missed'),
    // the site heard a strum (ok or off), its window in the recording has none
    falseHit: cnt(n => n.why.cat === 'false-hit'),
    // the site said miss: the strum was just outside its window (too early or late)
    offWindow: cnt(n => n.why.cat === 'off-window'),
    // the site said miss and nothing is near: not played
    silentMiss: cnt(n => n.why.cat === 'silent-miss'),
    dropped: rounds.reduce((a, rd) => a + rd.dropped, 0),
    ignored,
    retimed,
    replayMismatch: cnt(n => n.siteHeard !== (n.site !== 'miss')),
    siteRightReplayNot: cnt(n => n.site === 'right' && !n.played),
    offPitch: {}, unclearSiteReadings: null, presentSiteReadings: null, secondLook: 0, lookWould: 0, lookWouldPresent: 0,
    why: notes.reduce((h, n) => { h[n.why.cat] = (h[n.why.cat] || 0) + 1; return h; }, {}),
    octDominant: 0,
    medianSnrDb: r1(med(notes.filter(n => n.played && n.snrDb != null).map(n => n.snrDb))),
    medianCents: null,
    medianAbsOnsetMs: r1(med(notes.filter(n => n.onsetMs != null).map(n => Math.abs(n.onsetMs)))),
    lowH1H2Db: null, lowN: 0
  };
  // strums and beeps on no beat of the student's grid (other guitars, noise), from the round's first count-in click; at most every beat of every change
  const grid = [];
  rounds.forEach(rd => {
    const last = rd.list[rd.list.length - 1].e.t, tol = Math.max(150, rd.beat * 0.35), maxM = rd.list.length * bpc + 4;
    for (let m = -rd.countIn; m <= maxM && rd.listen + m * rd.beat <= last + (bpc - 0.5) * rd.beat; m++) grid.push([rd.listen + m * rd.beat + rd.offs, tol]);
  });
  const extra = onsets.filter(on => !grid.some(g => Math.abs(g[0] - on.ms) < g[1])).length;
  const startMs = rounds.length ? rounds[0].listen - rounds[0].countIn * rounds[0].beat + rounds[0].offs : 0;
  const playMs = Math.max(1, endMs - startMs);
  return {
    kind: 'pw', level, latency, notes: summary, perNote: notes, rounds: roundRows, whatIf, whatIfSkipped, strumRatio, pitch,
    room: { extraOnsetsPerMin: Math.round(extra / playMs * 60000), extra, onsets: onsets.length }
  };
}

// The device, from what the take recorded about itself.
/* The download is "no names", but a Bluetooth mic is often labelled with
   its owner's ("Maria's AirPods", or Spanish-style "AirPods de María") —
   keep the device, drop the owner. The Spanish strip needs a CAPITALISED
   word after "de" (case-sensitive, no i flag): Windows' own Spanish labels
   use a lower-case "de" phrase ("Matriz de micrófonos (Realtek…)") that is
   the device, not a person. A trailing "(…)" device note is kept. EVERY
   such run goes (g flag): macOS in Spanish labels a mic "Micrófono de
   MacBook Pro de José Luis", and stripping only the first run left the
   owner's name behind. The cost is "MacBook Pro" too — a capitalised
   "de X" can't be told from a name. */
function micEvalMicName(label){
  return String(label || '')
    .replace(/^.*?['’]s\s+/i, '')
    .replace(/\s+de\s+\p{Lu}[^\s()]*(?:\s+\p{Lu}[^\s()]*)*/gu, '');
}
function micEvalDevice(d){
  const ua = String(d.userAgent || '');
  const cros = ua.match(/CrOS \S+ ([\d.]+)/), chrome = ua.match(/Chrome\/(\d+)/);
  const os = cros ? 'ChromeOS ' + cros[1] : /Windows/.test(ua) ? 'Windows' : /iPad|iPhone/.test(ua) ? 'iOS' : /Mac OS X/.test(ua) ? 'macOS' : /Android/.test(ua) ? 'Android' : /Linux/.test(ua) ? 'Linux' : '?';
  return { os, chromebook: !!cros, chrome: chrome ? +chrome[1] : null, micLabel: micEvalMicName(d.micLabel), srcRate: d.srcSampleRate || null };
}

/* One take -> one row: device + game + the analysis. No names, no uid —
   this row is what leaves the teacher's machine. */
function micEvalRow(label, d, pcm, deps){
  const a = d.mode === 'pw' ? micEvalTakePw(pcm, d.sampleRate || 24000, d, deps) : micEvalTake(pcm, d.sampleRate || 24000, d, deps);
  return Object.assign({
    take: label, period: d.period || '', savedAt: d.savedAt || null,
    game: d.mode === 'nr' ? 'Note Runner L' + ((d.level | 0) + 1) + (d.chords ? ' chords' : '') : d.mode === 'pw' ? 'Switch ' + (d.progression || '') : 'Coach ' + (d.coachMode || ''),
    bpm: d.bpm || null, durationSec: d.durationSec || null, lang: d.lang || '',
    device: micEvalDevice(d), frame: { meanMs: d.frameMeanMs == null ? null : d.frameMeanMs, maxMs: d.frameMaxMs == null ? null : d.frameMaxMs }
  }, a);
}

/* The strum what-if (micEvalTakePw `whatIf`), summed: one line per Power Chord
   Switch take, one column per candidate ratio, and the totals. Used by the
   console table, the download and the terminal. No names: the take labels only. */
function micEvalWhatIfSummary(rows){
  const pw = rows.filter(r => r.kind === 'pw' && r.whatIf && r.whatIf.candidates && r.whatIf.candidates.length);
  if (!pw.length) return null;
  const skipped = rows.filter(r => r.kind === 'pw' && r.whatIfSkipped).length;
  const cands = pw[0].whatIf.candidates.map(c => ({ ratio: c.ratio, hfRatio: c.hfRatio }));
  const same = pw.filter(r => r.whatIf.candidates.length === cands.length && r.whatIf.candidates.every((c, k) => c.ratio === cands[k].ratio && c.hfRatio === cands[k].hfRatio));
  const sum = (list, k, f) => list.reduce((a, r) => a + (r.whatIf.candidates[k][f] || 0), 0);
  const per = (r, k) => { const c = r.whatIf.candidates[k]; return { falseHitsRemoved: c.falseHitsRemoved, realLost: c.realLost, reproduced: c.reproduced, strums: c.strums }; };
  return {
    skipped,
    candidates: cands,
    takes: same.map(r => ({ take: r.take, game: r.game, frameMs: r.whatIf.frameMs, judged: r.whatIf.candidates[0].judged,
      falseHits: r.whatIf.candidates[0].falseHits, agree: r.whatIf.candidates[0].agree, perCandidate: cands.map((c, k) => per(r, k)) })),
    totals: { takes: same.length, judged: sum(same, 0, 'judged'), falseHits: sum(same, 0, 'falseHits'), agree: sum(same, 0, 'agree'),
      perCandidate: cands.map((c, k) => ({ falseHitsRemoved: sum(same, k, 'falseHitsRemoved'), realLost: sum(same, k, 'realLost'), reproduced: sum(same, k, 'reproduced') })) }
  };
}
function micEvalWhatIfText(rows){
  const w = micEvalWhatIfSummary(rows);
  const sk = rows.filter(r => r.kind === 'pw' && r.whatIfSkipped), skRatios = [...new Set(sk.map(r => r.strumRatio ? r.strumRatio.full + ' / ' + r.strumRatio.hf : '?'))].join(' and ');
  const skNote = !sk.length ? '' : `${sk.length} Power Chord Switch ${sk.length === 1 ? 'take was' : 'takes were'} graded with strum ratios ${skRatios}, not the shared ones the strum what-if starts from, so ${sk.length === 1 ? 'it is' : 'they are'} left out of it.`;
  if (!w) return skNote ? '\n\nStrum what-if: ' + skNote : '';
  const pad = (v, n) => { const t = v == null ? '-' : String(v); return t.length >= n ? t : t + ' '.repeat(n - t.length); };
  const head = [pad('take', 5), pad('false', 6), pad('agree', 6)].concat(w.candidates.map(c => pad('x' + c.ratio + '/' + c.hfRatio, 14))).join(' ');
  const line = (label, f, a, cs) => [pad(label, 5), pad(f, 6), pad(a, 6)].concat(cs.map(c => pad('-' + c.falseHitsRemoved + ' / lost ' + c.realLost, 14))).join(' ');
  return '\n\nStrum what-if (measurement only, the game does not change): the site\'s own strum rule replayed on each Power Chord Switch recording at the shared ratios (first column) and stricter ones, full-band ratio / HF ratio. Takes graded with other ratios are not in it.\n' +
    [head].concat(w.takes.map(t => line(t.take, t.falseHits, t.agree, t.perCandidate)), line('all', w.totals.falseHits, w.totals.agree, w.totals.perCandidate)).join('\n') + `

false       changes the site graded right or wrong where the recording has no strum
agree       changes the site and the recording agree were strummed
-N          of the false hits, N would not fire at that ratio (no strum left in the window)
lost M      of the agree changes, M would no longer fire (a real strum, now too soft for the rule)
The first column is the shared ratios these takes were graded with: ${w.totals.perCandidate[0].reproduced} of ${w.totals.judged} changes get the same yes/no there as the site gave (the replay's own error: its frame times and sample rate are assumed).` + (skNote ? '\n' + skNote : '');
}

/* The pitch rule (micEvalTakePw `pitch`), summed: one line per Power Chord Switch take that saved its readings, and the totals. Takes saved before
   2026-11-05 have none: `without` counts them. Used by the console table, the download and the terminal. No names: the take labels only. */
function micEvalPitchSummary(rows){
  const pw = rows.filter(r => r.kind === 'pw'), has = pw.filter(r => r.pitch);
  if (!has.length) return null;
  const F = ['right', 'withPitch', 'timingOnly', 'unknown', 'falseHits', 'agree', 'falseHitsRemoved', 'realLost'];
  const pick = p => { const o = {}; F.forEach(k => { o[k] = p[k] || 0; }); return o; };
  const totals = { takes: has.length }; F.forEach(k => { totals[k] = has.reduce((a, r) => a + (r.pitch[k] || 0), 0); });
  return { rule: 'a change the site graded right on timing alone (under 3 pitch readings) would not be ticked', without: pw.length - has.length,
    takes: has.map(r => Object.assign({ take: r.take, game: r.game }, pick(r.pitch))), totals };
}
function micEvalPitchText(rows){
  const w = micEvalPitchSummary(rows);
  if (!w) return '';
  const pad = (v, n) => { const t = v == null ? '-' : String(v); return t.length >= n ? t : t + ' '.repeat(n - t.length); };
  const line = (label, t) => [pad(label, 5), pad(t.right, 6), pad(t.withPitch, 6), pad(t.timingOnly, 7), pad(t.falseHits, 6), pad(t.agree, 6), pad('-' + t.falseHitsRemoved + ' / lost ' + t.realLost, 14)].join(' ');
  const head = [pad('take', 5), pad('right', 6), pad('tone', 6), pad('timing', 7), pad('false', 6), pad('agree', 6), pad('no pitch, no tick', 14)].join(' ');
  return '\n\nPitch-rule what-if (measurement only, the game does not change): "no readable pitch, no tick" = a change the site graded right on timing alone (under 3 pitch readings) would not count. From the readings each take saved' +
    (w.without ? `; ${w.without} Power Chord Switch ${w.without === 1 ? 'take has' : 'takes have'} none (saved before 2026-11-05) and ${w.without === 1 ? 'is' : 'are'} left out` : '') + '.\n' +
    [head].concat(w.takes.map(t => line(t.take, t)), line('all', w.totals)).join('\n') + `

right       changes the site graded right
tone        of those, 3 or more pitch readings (the rule keeps them)
timing      of those, under 3 readings: they passed on timing alone (the rule would not tick them)
false       changes the site graded where the recording has no strum (counted as in the strum what-if)
agree       changes the site and the recording agree were strummed (counted as in the strum what-if)
-N          of the false hits, N were graded right on timing alone: the rule would remove those ticks
lost M      of the agree changes, M were graded right on timing alone: real strums that would lose their tick${w.totals.unknown ? `
${w.totals.unknown} changes graded right have no usable readings list and are in none of those counts.` : ''}`;
}

// A plain-text table of the rows, for the console / terminal.
function micEvalText(rows){
  const pad = (v, w) => { const s = v == null ? '-' : String(v); return s.length >= w ? s.slice(0, w) : s + ' '.repeat(w - s.length); };
  const cols = [['take', 5], ['per', 4], ['game', 16], ['os', 18], ['mic', 22], ['fps', 4], ['floor', 6], ['loud', 6], ['clip%', 5],
    ['click', 6], ['lag', 5], ['ideal', 6], ['skew', 5], ['right', 6], ['inAud', 6], ['detMiss', 7], ['silent', 6], ['oct', 4], ['snr', 5], ['cents', 5], ['h1h2', 5], ['xtra/m', 6]];
  const head = cols.map(c => pad(c[0], c[1])).join(' ');
  const lines = rows.map(r => [
    r.take, r.period, r.game, r.device.os, r.device.micLabel, r.frame.meanMs ? Math.round(1000 / r.frame.meanMs) : null,
    r.level.floorDb, r.level.loudDb, r.level.clipPct,
    r.latency.clickFound ? r.latency.clickSnrDb : 'none', r.latency.clickLagMs, r.latency.idealMs, r.latency.skewMs,
    r.notes.siteRight + '/' + r.notes.n, r.notes.replayPresent + '/' + r.notes.n, r.notes.detectorMissed, r.notes.silentMiss, r.notes.octDominant,
    r.notes.medianSnrDb, r.notes.medianCents, r.notes.lowH1H2Db, r.room.extraOnsetsPerMin
  ].map((v, k) => pad(v, cols[k][1])).join(' '));
  // Power Chord Switch rows (micEvalTakePw) get a second table, one line per round
  const pw = rows.filter(r => r.kind === 'pw');
  const pwCols = [['take', 5], ['game', 16], ['round', 5], ['bpm', 4], ['cin', 3], ['chg', 4], ['agree', 5], ['detMiss', 7], ['false', 5], ['offWin', 6], ['silent', 6], ['drop', 4],
    ['centre', 7], ['click', 6], ['lag', 5], ['ideal', 6], ['skew', 6], ['map', 5]];
  const pwOdd = pw.filter(r => r.notes.ignored || r.notes.retimed || r.notes.replayMismatch).map(r => r.take + ': ' +
    [r.notes.ignored ? r.notes.ignored + (r.notes.ignored === 1 ? ' change' : ' changes') + ' ignored (impossible time, round or tempo in the saved data)' : '',
      r.notes.retimed ? r.notes.retimed + (r.notes.retimed === 1 ? ' change' : ' changes') + ' left out (the student changed the tempo while playing)' : '',
      r.notes.replayMismatch ? r.notes.replayMismatch + (r.notes.replayMismatch === 1 ? ' change' : ' changes') + " where the site's rule, run again on its own strums, does not give its saved verdict" : ''].filter(Boolean).join('; '));
  const pwText = !pw.length ? '' : '\n\nPower Chord Switch, one line per round (in the table above, its "notes" are chord changes; inAud = a strum in the site\'s window):\n' +
    [pwCols.map(c => pad(c[0], c[1])).join(' ')].concat(...pw.map(r => (r.rounds || []).map(g => [
      r.take, r.game, g.stage + 1, g.bpm, g.clickBeeps, g.n, g.agree, g.detectorMissed, g.falseHit, g.offWindow, g.silentMiss, g.dropped,
      g.centre, g.clickFound ? g.clickSnrDb : g.clickGuessed ? 'guess' : g.clickOneBeep ? '1beep' : 'none', g.clickLagMs, g.idealMs, g.skewMs, r.latency.mapMs
    ].map((v, k) => pad(v, pwCols[k][1])).join(' ')))).concat(pwOdd).join('\n') + `

cin         the count-in's clicks (2 below 60 BPM since 2026-11-09, beeps 1-2 measured; 4: beeps 2-4; a take saved before then has 4 in every round)
chg         changes judged (the site's verdict against the recording)
agree       the site heard a strum (right or wrong chord) and there is one in its window
detMiss     the site said no strum, but there is one in its window
false       the site heard a strum, but its window in the recording has none (a chord left ringing, noise)
offWin      the site said no strum; one is just outside its window, or near the beat the student heard (early, late, or the delay setting is off)
silent      no strum near the change (not played, or further off)
drop        changes past the end of the recording (the 30 s cap, or Stop): not judged
centre      where the site's window was put on the recording: site = its own beat, replayed from the strums it heard
            (needs 3 strums found in the audio); beeps = the count-in's lag; setting = the delay setting alone
click/lag/ideal/skew  as above, from this round's own count-in ("none": speaker muted, headphones, or strums over the count-in;
            "1beep": a 2-click count-in (beeps 1 and 2 measured) with only beep 2 heard: one beep is too few to give the lag;
            "guess": the take's count-in for the round is missing or not 2 or 4, its clicks guessed from the tempo, no lag);
            map = the site's clock vs the recording's, whole take`;
  return [head].concat(lines).join('\n') + `

floor/loud  raw mic level, dBFS (10th / 99th percentile of 20 ms windows)
click       count-in beeps found in the recording: how far above the background (dB); "none" = speaker muted or headphones
lag         where the beeps landed vs when they were scheduled (ms)
ideal       the mic-delay setting that would score an on-the-click note dead on the beat (ms)
skew        what the site did to an on-the-click note with the student's actual setting (+ = called it late)
right       notes the site counted right / notes expected
inAud       notes the replay (site's own filters + YIN) finds clearly in the audio
detMiss     site said not-right, but the note is loud and clearly in the audio
silent      site said miss/unclear, no pick attack near the note and the note isn't ringing (not played)
oct         notes where the octave above outvoted the real note
snr         median note level above the room floor (dB)
cents       median tuning of the notes heard (cents off the written note)
h1h2        low-string notes: fundamental vs 2nd harmonic (dB; very negative = the mic loses the low end)
xtra/m      onsets per minute that are not near any expected note (other guitars, noise)` + pwText + micEvalWhatIfText(rows) + micEvalPitchText(rows);
}

/* "Evaluate all recordings": every take through micEvalRow with the site's
   own coachDetectPitch / COACH_PITCH_GATE / COACH_MIC_GAIN (coach.js, loaded
   on demand). Names show on this screen only; "Download results" is the
   rows alone — no audio, no names (takes are T01, T02…). */
let teacherMicEvalRows = [], teacherMicEvalNames = [];
async function teacherMicEvaluate(){
  const box = document.getElementById('t-mic-eval');
  if(!box) return;
  try{ await ensureCoachJs(); }
  catch(e){ box.innerHTML = '<div class="t-loading">Could not load the listening code — check your connection and try again.</div>'; return false; }
  const deps = { detectPitch: coachDetectPitch, GATE: COACH_PITCH_GATE, GAIN: COACH_MIC_GAIN,
    ATTACK_SKIP: COACH_ATTACK_SKIP, EVENT_TAIL: COACH_EVENT_TAIL, REFRACT: COACH_ONSET_REFRACT,
    MATCH_FRAC: COACH_MATCH_FRAC, MATCH_MIN_MS: COACH_MATCH_MIN_MS, VOTE_TOL: COACH_VOTE_TOL,
    // the site's own strum rule, for the what-if (micEvalStrumRule): its constants and the text of the three functions, read at run time
    strum: { consts: { FLOOR: CHK_ONSET_FLOOR, RATIO: CHK_ONSET_RATIO, HF_FLOOR: CHK_HF_FLOOR, HF_RATIO: CHK_HF_RATIO, REFRACT: COACH_ONSET_REFRACT,
      WIN: COACH_LVL_WIN, HOP: COACH_LVL_HOP, CATCHUP: COACH_CATCHUP_MAX_MS }, ccLoopSrc: String(ccLoop), readFrameSrc: String(coachReadFrame), smoothSrc: String(coachSmooth) } };
  /* Every take: micEvalRow measures a Power Chord Switch take with micEvalTakePw (strums against the site's verdicts), the rest with micEvalTake. */
  const takes = teacherMicTakes.slice();
  const rows = [], names = [], fails = [];
  for(let k = 0; k < takes.length; k++){
    const d = takes[k], label = 'T' + String(k + 1).padStart(2, '0');
    const live = document.getElementById('t-mic-eval');
    if(teacherView !== 'mic' || !live) return false;      // left the view: stop
    live.innerHTML = `<div class="t-loading">Measuring recording ${k + 1} of ${takes.length}…</div>`;
    try{
      const parts = await teacherMicChunks(d);
      const len = parts.reduce((a, p) => a + p.length, 0);
      const bytes = new Uint8Array(len); let o = 0;
      parts.forEach(p => { bytes.set(p, o); o += p.length; });
      const saved = micTakeDate(d);
      const meta = Object.assign({}, d, { savedAt: saved ? saved.toISOString() : null });
      rows.push(micEvalRow(label, meta, new Int16Array(bytes.buffer, 0, len >> 1), deps));
      names.push(d.name || (d.uid || '').slice(0, 8));
    }catch(e){ fails.push((d.name || label) + ': ' + (e && e.message ? e.message : 'could not read')); }
    await new Promise(r => setTimeout(r, 0));          // let the screen update between takes
  }
  teacherMicEvalRows = rows; teacherMicEvalNames = names;
  const live = document.getElementById('t-mic-eval');
  if(live) live.innerHTML = teacherMicEvalHtml() + (fails.length ? `<div class="tg-note">Could not measure: ${escHtml(fails.join('; '))}</div>` : '');
  return true;      // finished (teacherMicDownloadEverything puts the results in its zip only then)
}
/* "4 clicks (beeps 2-4 heard: 3 of 3)" / "2 clicks (beeps 1-2 heard: 2 of 2)": a Power Chord Switch round's count-in in the console's hover (micEvalTakePw rounds[]).
   "guessed from the tempo": the take's own entry for the round was missing or not 2 or 4. */
function micEvalBeepsText(g){
  const n = g.clickBeeps || 4, used = g.clickUsed == null ? n - 1 : g.clickUsed;
  return n + ' clicks' + (g.clickGuessed ? ' guessed from the tempo' : '') + ' (beeps ' + (n === 2 ? '1-2' : '2-' + n) + ' heard: ' + (g.clickHeard || 0) + ' of ' + used + ')';
}
/* Why a Power Chord Switch round has no "should be" (micEvalTakePw rounds[]): its hover. */
function micEvalNoDelayText(g){
  return g.clickFound ? 'beeps found, delay not measured'
    : g.clickGuessed ? "the take's count-in for this round is missing or not 2 or 4, so its clicks were guessed and the delay is not measured"
    : g.clickOneBeep ? 'beep 1 not heard: one beep is too few to measure the delay'
    : g.clickHeard && g.clickHeard === g.clickUsed ? 'the beeps do not line up in time, delay not measured'
    : g.clickHeard ? 'not all beeps found (speaker muted, headphones, or strums over the count-in)'
    : 'no beeps found (speaker muted, headphones, or strums over the count-in)';
}
function teacherMicEvalHtml(){
  const rows = teacherMicEvalRows;
  if(!rows.length) return '<div class="t-loading">No recordings to measure.</div>';
  const med = a => { const b = a.filter(v => v != null && isFinite(v)).sort((p, q) => p - q), h = b.length >> 1; return !b.length ? null : b.length % 2 ? b[h] : Math.round((b[h - 1] + b[h]) * 5) / 10; };
  // Power Chord Switch rows (micEvalTakePw) count chord changes, not notes: their own lines below
  const noteRows = rows.filter(r => r.kind !== 'pw'), pwRows = rows.filter(r => r.kind === 'pw');
  const sum = f => noteRows.reduce((a, r) => a + (f(r) || 0), 0);
  const n = sum(r => r.notes.n), right = sum(r => r.notes.siteRight), inAud = sum(r => r.notes.replayPresent);
  const detMiss = sum(r => r.notes.detectorMissed), silent = sum(r => r.notes.silentMiss);
  const withClicks = rows.filter(r => r.latency.idealMs != null);
  // Power Chord Switch recordings with no delay where a 2-click count-in (below 60 BPM) had only its second beep heard (micEvalTakePw oneBeep)
  const oneBeep = pwRows.filter(r => r.latency.idealMs == null && (r.rounds || []).some(g => g.clickOneBeep)).length;
  const cbooks = rows.filter(r => r.device.chromebook).length;
  const clipped = rows.filter(r => r.level.clipPct > 0.01).length;
  const v = x => x == null ? '—' : escHtml(String(x));
  const lines = [`${rows.length} recordings, ${cbooks} of them on a Chromebook.`];
  if(noteRows.length) lines.push(
    `The site counted <b>${right}</b> of ${n} notes right. The notes are clearly in the recordings for <b>${inAud}</b> of ${n}.`,
    `<b>${detMiss}</b> ${detMiss === 1 ? 'note was' : 'notes were'} clearly played and loud, but the site did not count ${detMiss === 1 ? 'it' : 'them'} right. <b>${silent}</b> missed ${silent === 1 ? 'note was' : 'notes were'} not played at all.` +
    (sum(r => r.notes.dropped) ? ` ${sum(r => r.notes.dropped)} more ${sum(r => r.notes.dropped) === 1 ? 'note' : 'notes'} came after the recording stopped (30 seconds, or Stop) and ${sum(r => r.notes.dropped) === 1 ? 'was' : 'were'} not checked.` : ''));
  if(pwRows.length){
    const pw = f => pwRows.reduce((a, r) => a + (f(r) || 0), 0);
    const pn = pw(r => r.notes.n), agree = pw(r => r.notes.agree), pMiss = pw(r => r.notes.detectorMissed);
    const pFalse = pw(r => r.notes.falseHit), pSilent = pw(r => r.notes.silentMiss), pDrop = pw(r => r.notes.dropped);
    const pOff = pw(r => r.notes.offWindow), pIgn = pw(r => r.notes.ignored), pRet = pw(r => r.notes.retimed), pOdd = pw(r => r.notes.replayMismatch);
    lines.push(`Power Chord Switch: ${pn} chord ${pn === 1 ? 'change' : 'changes'} in ${pwRows.length} ${pwRows.length === 1 ? 'recording' : 'recordings'}` +
      (pDrop ? ` (${pDrop} more came after the recording stopped, at 30 seconds or at Stop, and ${pDrop === 1 ? 'was' : 'were'} not checked)` : '') +
      (pIgn ? ` (${pIgn} more ${pIgn === 1 ? 'was' : 'were'} left out: the saved time, round or tempo is impossible)` : '') +
      (pRet ? ` (${pRet} more ${pRet === 1 ? 'was' : 'were'} left out: the student changed the tempo while playing)` : '') +
      `. The site and the recording agree on <b>${agree + pSilent}</b> of ${pn} (${agree} strummed where the site listened, ${pSilent} not played). ` +
      `<b>${pOff}</b> ${pOff === 1 ? 'was' : 'were'} strummed just outside the site's window (early, late, or the delay setting is off), so the site said missed. ` +
      `<b>${pMiss}</b> ${pMiss === 1 ? 'strum is' : 'strums are'} where the site listened, but the site heard no strum there. ` +
      `On <b>${pFalse}</b> ${pFalse === 1 ? 'change' : 'changes'} the site heard a strum that is not in the recording (a chord left ringing, or noise).` +
      (pOdd ? ` On ${pOdd} ${pOdd === 1 ? 'change' : 'changes'} the site's own rule, run again on the strums it heard, does not give the verdict it saved.` : ''));
  }
  lines.push(
    withClicks.length
      ? `Mic delay: the count-in beeps were heard in ${withClicks.length} recordings. The delay setting in use was ${v(med(withClicks.map(r => r.latency.settingMs)))} ms; the recordings say it should be about <b>${v(med(withClicks.map(r => r.latency.idealMs)))} ms</b>.`
      : `Mic delay: no recording could measure it: the count-in beeps were not heard (speaker muted or headphones${pwRows.length ? ', or in Power Chord Switch strumming over the count-in' : ''})${oneBeep ? `, or in ${oneBeep === 1 ? 'a Power Chord Switch recording' : oneBeep + ' Power Chord Switch recordings'} below 60 BPM only the second of the 2 count-in beeps was heard, and one beep is too few to measure the delay` : ''}.`,
    `Loudest notes: ${v(med(rows.map(r => r.level.loudDb)))} dB (0 is the maximum). ${clipped ? `<b>${clipped}</b> recordings were too loud and clipped.` : 'None clipped.'}`
  );
  // micEvalWhy's categories, summed — why the notes the site did not count weren't counted
  const why = k => sum(r => (r.notes.why || {})[k]);
  const notCounted = n - right - why('wrong');
  if(notCounted > 0){
    lines.push(`Why ${notCounted} ${notCounted === 1 ? 'note was' : 'notes were'} not counted (unclear or missed): ` +
      `<b>${why('readings-cut')}</b> heard, but fewer than 2 pitch readings in the time the site listens to each note · ` +
      `<b>${why('onset-elsewhere')}</b> heard, but too far off the beat or taken by another note · ` +
      `<b>${why('no-onset')}</b> no pluck heard at all · ` +
      `<b>${why('vote-failed')}</b> enough readings, but they did not agree on the note.`);
  }
  const looked = sum(r => r.notes.secondLook);
  if(looked) lines.push(`<b>${looked}</b> ${looked === 1 ? 'note was' : 'notes were'} counted right by the second look (the site listened a little longer to a note it could not read at first).`);
  const tr = rows.map((r, i) => {
    const nb = r.notes, L = r.latency, isPw = r.kind === 'pw';
    // a Power Chord Switch row: each round's own "should be" and where its windows were put, on hover; the strums the site heard that the
    // recording does not have; the strums just outside the site's window
    const placed = { site: "the site's own beat", beeps: 'the beeps', setting: 'the delay setting alone' };
    // and its count-in: how many clicks, and of the beeps measured (1-2, or 2-4) how many were heard
    const perRound = isPw ? ` title="${escAttr((r.rounds || []).map(g => 'Round ' + (g.stage + 1) + ', ' + micEvalBeepsText(g) + ': ' +
      (g.idealMs != null ? 'should be ' + g.idealMs + ' ms' : micEvalNoDelayText(g)) +
      '; windows placed by ' + (placed[g.centre] || '?')).join(' · '))}"` : '';
    const falseHit = isPw && nb.falseHit ? ` · <b>${nb.falseHit}</b> heard, not there` : '';
    const offWin = isPw && nb.offWindow ? ` · <b>${nb.offWindow}</b> off the beat` : '';
    return `<tr><td class="nc" title="${escAttr(teacherMicEvalNames[i] || '')}">${escHtml(r.take + ' · ' + (teacherMicEvalNames[i] || ''))}</td>`+
      `<td>${escHtml(r.game)}</td><td title="${escAttr(r.device.micLabel)}">${escHtml(r.device.chromebook ? 'Chromebook' : r.device.os)}</td>`+
      `<td>${v(r.level.loudDb)} / ${v(r.level.floorDb)}${r.level.clipPct > 0.01 ? ' <b>clipped</b>' : ''}</td>`+
      `<td${perRound}>${L.clickFound ? v(L.settingMs) + ' → ' + v(L.idealMs) : v(L.settingMs) + ' → ?'}</td>`+
      `<td>${nb.siteRight} / ${nb.n}</td><td>${nb.replayPresent} / ${nb.n}${falseHit}</td><td>${nb.detectorMissed}${offWin}</td><td>${nb.silentMiss}</td>`+
      `<td>${teacherMicOffText(nb.offPitch)}</td><td>${v(nb.lowH1H2Db)}</td></tr>`;
  }).join('');
  return `<div class="tg-note" style="margin-top:8px">${lines.join('<br>')}</div>
    <div class="t-grid-wrap"><table><thead><tr><th class="nc">Take</th><th>Game</th><th>Device</th><th>Loud / room (dB)</th><th>Delay set → should be (ms)</th><th>Site counted right</th><th>In the recording</th><th>Played, not counted</th><th>Not played</th><th>Heard instead</th><th>Low strings (dB)</th></tr></thead><tbody>${tr}</tbody></table></div>${teacherMicWhatIfHtml(rows)}${teacherMicPitchHtml(rows)}
    <div class="tg-note"><button class="tp-btn primary" style="flex:none;padding:8px 16px;margin-right:10px" onclick="teacherMicEvalDownload()">Download results</button>
      The file has the measurements only — no audio and no names. <br>
      <i>In the recording</i>: the site's own pitch detection, run again on the saved audio, finds the note clearly. <i>Played, not counted</i>: a loud, clear note the site did not count right. <i>Not played</i>: the site said missed and there is no note there. <i>Heard instead</i>: notes that rang clearly but at a different pitch — "−1 ×6" means six notes came out one semitone low (the same number again and again usually means the guitar is out of tune). <i>Delay</i>: "?" means the count-in beeps were not in the recording (speaker muted or headphones)${pwRows.length ? ', or in a Power Chord Switch recording below 60 BPM only the second of the 2 count-in beeps was heard: one beep is too few to measure the delay' : ''}. <i>Low strings</i>: the low note's own pitch against the octave above it — very negative means this mic loses the low end.${pwRows.length ? `<br>
      <i>Power Chord Switch</i> rows count chord changes, not notes. <i>In the recording</i>: a strum inside the site's own window for the change (about half a beat around the beat as the site was tracking it; which chord was strummed is not checked); "heard, not there": the site heard a strum its window in the recording does not have. <i>Played, not counted</i>: a strum in the site's window that the site did not hear; "off the beat": a strum just outside the window, or near the beat the student heard, so the site said missed (played early or late, or the delay setting is off). <i>Not played</i>: no strum near the change. <i>Delay</i>: hover it to see each round's, and how its windows were placed; "no beeps found" can also mean the student strummed over the count-in.` : ''}</div>`;
}
/* The strum what-if as a small table (micEvalWhatIfSummary): per Power Chord Switch take and ratio, "-N" false hits that would not fire and "lost M" real strums that would stop firing. */
function teacherMicWhatIfHtml(rows){
  const w = micEvalWhatIfSummary(rows);
  const sk = rows.filter(r => r.kind === 'pw' && r.whatIfSkipped), skRatios = [...new Set(sk.map(r => r.strumRatio ? r.strumRatio.full + ' / ' + r.strumRatio.hf : '?'))].join(' and ');
  const skNote = !sk.length ? '' : `${sk.length} Power Chord Switch ${sk.length === 1 ? 'take was' : 'takes were'} graded with strum ratios ${escHtml(skRatios)}, not the shared ones the strum what-if starts from, so ${sk.length === 1 ? 'it is' : 'they are'} left out of it.`;
  if(!w) return skNote ? `<div class="tg-note" style="margin-top:10px"><b>Strum what-if</b> — ${skNote}</div>` : '';
  const cell = c => `<td>−${c.falseHitsRemoved} · lost ${c.realLost}</td>`;
  const body = w.takes.map(t => `<tr><td class="nc wf">${escHtml(t.take)}</td><td>${t.falseHits}</td><td>${t.agree}</td>${t.perCandidate.map(cell).join('')}</tr>`).join('') +
    `<tr><td class="nc wf"><b>All ${w.totals.takes}</b></td><td><b>${w.totals.falseHits}</b></td><td><b>${w.totals.agree}</b></td>${w.totals.perCandidate.map(c => `<td><b>−${c.falseHitsRemoved} · lost ${c.realLost}</b></td>`).join('')}</tr>`;
  const t0 = w.totals.perCandidate[0];
  return `<div class="tg-note" style="margin-top:10px"><b>Strum what-if</b> (measurement only; the game does not change). The site's own strum rule, run again on each Power Chord Switch recording at the shared ratio it was graded with and at stricter ones. Takes graded with other ratios are left out.
    <i>−N</i>: false hits (the site heard a strum the recording does not have) that would no longer fire. <i>lost M</i>: real strums (the site and the recording agree) that would stop firing.</div>
    <div class="t-grid-wrap"><table><thead><tr><th class="nc">Take</th><th>False hits</th><th>Real strums</th>${w.candidates.map((c, k) => `<th>${k ? 'Ratio' : 'Shared ratio'} ${c.ratio} (HF ${c.hfRatio})</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>
    <div class="tg-note">At the shared ratio these takes were graded with, the replay gives the same yes/no as the site on ${t0.reproduced} of ${w.totals.judged} changes; the rest is the replay's own error (it assumes steady frame times and the 48 kHz rate).${skNote ? ' ' + skNote : ''}</div>`;
}
/* The pitch rule as a small table (micEvalPitchSummary), under the strum what-if: per Power Chord Switch take that saved its readings, how many changes the
   site graded right with 3+ readings and on timing alone, and what "no readable pitch, no tick" would remove or cost. */
function teacherMicPitchHtml(rows){
  const w = micEvalPitchSummary(rows);
  if(!w) return '';
  const cells = t => `<td>${t.right}</td><td>${t.withPitch}</td><td>${t.timingOnly}</td><td>${t.falseHits}</td><td>${t.agree}</td>`;
  const body = w.takes.map(t => `<tr><td class="nc wf">${escHtml(t.take)}</td>${cells(t)}<td>−${t.falseHitsRemoved} · lost ${t.realLost}</td></tr>`).join('') +
    `<tr><td class="nc wf"><b>All ${w.totals.takes}</b></td>${cells(w.totals).replace(/<td>(\d+)<\/td>/g, '<td><b>$1</b></td>')}<td><b>−${w.totals.falseHitsRemoved} · lost ${w.totals.realLost}</b></td></tr>`;
  return `<div class="tg-note" style="margin-top:10px"><b>Pitch-rule what-if</b> (measurement only; the game does not change). "No readable pitch, no tick": a change the site graded right on timing alone, with under 3 pitch readings, would not count.
    <i>−N</i>: false hits that were graded right on timing alone, so their ticks would go. <i>lost M</i>: real strums (the site and the recording agree) that were graded right on timing alone and would lose their tick.${w.without ? ` ${w.without} Power Chord Switch ${w.without === 1 ? 'take has' : 'takes have'} no readings (saved before 2026-11-05) and ${w.without === 1 ? 'is' : 'are'} left out.` : ''}</div>
    <div class="t-grid-wrap"><table><thead><tr><th class="nc">Take</th><th>Graded right</th><th>3+ readings</th><th>Timing alone</th><th>False hits</th><th>Real strums</th><th>No pitch, no tick</th></tr></thead><tbody>${body}</tbody></table></div>`;
}
function teacherMicOffText(h){
  const ks = Object.keys(h || {}).sort((a, b) => h[b] - h[a]);
  if(!ks.length) return '—';
  return ks.slice(0, 2).map(k => (k > 0 ? '+' : k < 0 ? '−' : '') + Math.abs(k) + ' ×' + h[k]).join(', ');
}
// The results file's text: "Download results" and the zip of "Download everything" save the same thing.
function teacherMicEvalJson(){
  return JSON.stringify({ generated: new Date().toISOString(), takes: teacherMicEvalRows.length, strumWhatIf: micEvalWhatIfSummary(teacherMicEvalRows), strumWhatIfSkipped: teacherMicEvalRows.filter(r => r.kind === 'pw' && r.whatIfSkipped).length, pitchRule: micEvalPitchSummary(teacherMicEvalRows), rows: teacherMicEvalRows }, null, 1);
}
function teacherMicEvalDownload(){
  if(!teacherMicEvalRows.length) return;
  teacherMicSaveFile('mic-eval-' + new Date().toISOString().slice(0, 10) + '.json',
    new Blob([teacherMicEvalJson()], { type: 'application/json' }));
}

