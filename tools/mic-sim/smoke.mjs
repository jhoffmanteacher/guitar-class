/* Browser smoke test for the mic work (Playwright + the pre-installed
   Chromium). Serves nothing itself — start a static server on the repo
   first (e.g. `npx http-server -p 8123 -s`), then:
     node tools/mic-sim/smoke.mjs http://localhost:8123/
   Uses the Dev bypass, loads coach.js, evals page-harness.js (virtual clock
   + fake mic), and runs the Coach, Note Runner, Note Hunt, Note Call,
   Change Up and PSG Hero, plus the consent prompt, the recording path and
   the teacher console's Mic recordings view. Prints one JSON line per check. */
import fs from 'fs';
import { createRequire } from 'module';
// require() honours NODE_PATH, so a globally installed playwright works:
//   NODE_PATH=$(npm root -g) node tools/mic-sim/smoke.mjs
const { chromium } = createRequire(import.meta.url)('playwright');

const base = process.argv[2] || 'http://localhost:8123/';
const harness = fs.readFileSync(new URL('./page-harness.js', import.meta.url), 'utf8');
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' }).catch(() => chromium.launch());
const page = await browser.newPage({ viewport: { width: 1366, height: 657 } });
const pageErrs = [];
page.on('pageerror', e => pageErrs.push(String(e.message)));
await page.goto(base + 'index.html', { waitUntil: 'load' });
await page.waitForFunction(() => typeof devBypass === 'function');
await page.evaluate(() => devBypass());
await page.waitForTimeout(1500);
await page.evaluate(() => ensureCoachJs());
await page.evaluate(harness);
const out = (name, v) => console.log(JSON.stringify({ check: name, ...v }));

// A melody Coach button, appended where coachOpen can put its card.
await page.evaluate(() => {
  const host = document.createElement('div'); host.className = 'st-text';
  const b = document.createElement('button'); b.id = '__coachBtn';
  b.dataset.midis = JSON.stringify([45, 47, 48, 50, 52, 53, 55, 57]);
  host.appendChild(b); document.querySelector('#app, main, body').appendChild(host);
});
for (const fps of [60, 20]) {
  const frameMs = 1000 / fps;
  for (const [room, label] of [[0, 'quiet'], [0.5, 'loud']]) {
    for (const wrongBy of [0, 2]) {
      const r = await page.evaluate(([f, rm, w]) => __tally(document.getElementById('__coachBtn'), 6, { frameMs: f, room: rm, wrongBy: w }), [frameMs, room, wrongBy]);
      out('coach', { fps, room: label, notes: wrongBy ? 'wrong' : 'right', ...r });
    }
  }
}
// Note Runner
await page.evaluate(() => { gamesShow('noterunner'); nrSetup && nrSetup(); });
for (const fps of [60, 20]) for (const [room, label] of [[0, 'quiet'], [0.5, 'loud']]) for (const wrongBy of [0, 2]) {
  const r = await page.evaluate(([f, rm, w]) => __tallyNr(0, 3, { frameMs: f, room: rm, wrongBy: w }), [1000 / fps, room, wrongBy]);
  out('noterunner', { fps, room: label, notes: wrongBy ? 'wrong' : 'right', ...r });
}
// Note Hunt (one-note game)
for (const [room, label] of [[0, 'quiet'], [0.5, 'loud']]) for (const wrongBy of [0, 2]) {
  const r = await page.evaluate(([rm, w]) => __fretRun(rm, 2500, w), [room, wrongBy]);
  out('notehunt', { room: label, notes: wrongBy ? 'wrong' : 'right', ...r });
}
await page.evaluate(() => fretStop());
// Change Up, PSG Hero: open and run a little, no errors
for (const [view, start] of [['cc', 'ccStart'], ['simonguitar', 'psgStart']]) {
  const r = await page.evaluate(async ([v, s]) => {
    __errs.length = 0; gamesShow(v); __installFakes();
    try { await window[s](); } catch (e) { __errs.push(s + ': ' + e.message); }
    __step(40, 4000);
    try { gamesStopMic(); } catch (e) {}
    return { errs: __errs.slice() };
  }, [view, start]);
  out(view, r);
}
// Note Call, mic on, both the scored levels and quiet/loud
for (const [room, label] of [[0, 'quiet'], [0.5, 'loud']]) {
  const r = await page.evaluate(async rm => {
    __errs.length = 0; __plucks.length = 0;
    try { gamesShow('hub'); } catch (e) {}
    __V.to.length = 0; __V.raf.length = 0;   // nothing left over from the games above
    let host = document.getElementById('__nc'); if (!host){ host = document.createElement('div'); host.id = '__nc'; document.body.appendChild(host); }
    host.innerHTML = renderNoteCall({ type: 'notecall', strings: ['lowE', 'A'], minFret: 0, maxFret: 5 }, 'smk', null);
    const st = noteCalls.smk; st.coach = true; st.answer = false;
    __installFakes();
    await ncStart('smk');
    const phase0 = st.phase;
    __room(__V.t, __V.t + 60000, rm);
    let hits = 0, k = 0, lastIdx = -2;
    while (st.phase === 'play' && k++ < 1500){
      if (st.idx >= 0 && st.idx !== lastIdx && st.seq[st.idx]){
        lastIdx = st.idx; __plucks.push({ t: __V.t + 300, midi: st.seq[st.idx].midis[0], amp: 0.15 });
      }
      __step(50, 50);
    }
    (st.seq || []).forEach(p => { if (p.res === 'hit') hits++; });
    const n = (st.seq || []).filter(p => p.res != null).length;
    try { ncStop('smk'); } catch (e) {}
    return { hits, judged: n, phase0, phase: st.phase, errs: __errs.slice() };
  }, room);
  out('notecall', { room: label, ...r });
}
// Consent prompt + recording path (dev bypass: records, never uploads)
const consent = await page.evaluate(async () => {
  __errs.length = 0;
  try { localStorage.removeItem(micRecAskKey()); } catch (e) {}
  micSampling = { on: true, max: 40 }; micTakesCount = 0;
  const previewerAsks = micRecShouldAsk();   // must be false: the teacher's own account / dev bypass
  const igp = window.isGatePreviewer; window.isGatePreviewer = () => false;   // the dev bypass counts as a previewer; pretend it's a student
  // fake audio nodes so micRecStart can run on the fake context (the harness
  // rebuilds the context on every start, so add them each time)
  let proc = null;
  const inst = window.__installFakes;
  window.__installFakes = () => { inst();
    coachCtx.createMediaStreamSource = () => ({ connect(){}, disconnect(){} });
    coachCtx.createScriptProcessor = () => (proc = { connect(){}, disconnect(){}, onaudioprocess: null });
    coachCtx.createGain = () => ({ gain: { value: 1 }, connect(){}, disconnect(){} });
    coachCtx.destination = {}; };
  coachEvictTuner = () => __installFakes();
  const b = document.getElementById('__coachBtn');
  coachOpen(b); __installFakes();
  await coachStartCheck();
  const ask = document.querySelector('.micrec-ask');
  const askText = ask ? ask.innerText : null;
  const logs = []; const ci = console.info; console.info = (...a) => { logs.push(a); };
  ask.querySelector('.coach-start').click();
  for (let k = 0; k < 200; k++) await Promise.resolve();
  const procMade = !!proc;
  const badge = !!document.getElementById('micrec-on');
  const badgeText = badge ? document.getElementById('micrec-on').innerText : '';
  // feed 2 s of fake audio
  for (let k = 0; k < 24 && proc && proc.onaudioprocess; k++){
    const data = new Float32Array(4096).map((_, i) => Math.sin(i / 10) * 0.1);
    proc.onaudioprocess({ playbackTime: __V.t / 1000, inputBuffer: { getChannelData: () => data } });
  }
  coach.slots.forEach((s, i) => __plucks.push({ t: coach.listenStart + i * coach.beatMs, midi: s.midi, amp: 0.15 }));
  let g = 0; while (coach && coach.phase !== 'report' && g++ < 160) __step(40, 250);
  for (let k = 0; k < 400; k++) await Promise.resolve();
  console.info = ci;
  window.__installFakes = inst;
  const saved = logs.find(a => String(a[0]).indexOf('[micRec]') === 0);
  // "No thanks" path: a fresh device answering no is never asked again and never records
  localStorage.setItem(micRecAskKey(), 'no');
  const asksAfterNo = micRecShouldAsk(), recordsAfterNo = micRecWanted();
  localStorage.removeItem(micRecAskKey());
  micSampling = { on: false, max: 0 }; window.isGatePreviewer = igp;
  return { previewerAsks, askText, procMade, badge, badgeText, phase: coach && coach.phase, savedMeta: saved ? Object.keys(saved[1]) : null,
    samples: saved ? saved[2] : null, expected: saved ? saved[1].expected.length : 0, micRecLeft: micRec, asksAfterNo, recordsAfterNo, errs: __errs.slice() };
});
out('consent+record', consent);
// Spanish wording of the prompt
const es = await page.evaluate(() => { const r = {}; setLang('es'); ['micrec.ask', 'micrec.yes', 'micrec.no', 'micrec.recording'].forEach(k => r[k] = t(k)); setLang('en'); return r; });
out('i18n-es', es);
await page.screenshot({ path: process.env.SHOT || '/tmp/micrec-smoke.png' });
out('pageErrors', { errs: pageErrs });
await browser.close();
