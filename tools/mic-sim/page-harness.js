navigator.mediaDevices.getUserMedia = async () => { throw new Error('test: real mic not used'); };
window.__errs=[]; window.addEventListener('error',e=>__errs.push(String(e.message)));
const V = window.__V = { t: performance.now(), raf: [], to: [], seq: 0 };
performance.now = () => V.t;
window.requestAnimationFrame = fn => { V.raf.push(fn); return ++V.seq; };
window.cancelAnimationFrame = () => {};
window.setTimeout = (fn, ms) => { const id = ++V.seq; V.to.push({ id, at: V.t + (ms || 0), fn }); return id; };
window.clearTimeout = id => { V.to = V.to.filter(x => x.id !== id); };
window.__step = (frameMs, totalMs) => { const end = V.t + totalMs;
  while (V.t < end) { V.t += frameMs * (0.7 + Math.random() * 0.6);
    const due = V.to.filter(x => x.at <= V.t).sort((a, b) => a.at - b.at); V.to = V.to.filter(x => x.at > V.t);
    due.forEach(x => { try { x.fn(); } catch (e) { __errs.push('to:' + e.message); } });
    const fr = V.raf; V.raf = []; fr.forEach(fn => { try { fn(V.t); } catch (e) { __errs.push('raf:' + e.message + ' ' + (e.stack||'').split('\n')[1]); } }); } };
window.__plucks = []; window.__mic = { lat: 50, noise: 0.002 };
window.__installFakes = () => { const SR = 48000;
  coachStream = { getTracks: () => [{ stop(){} }], getAudioTracks: () => [{ label: 'Fake mic', stop(){}, getSettings: () => ({}) }] };
  coachCtx = { state: 'running', sampleRate: SR, get currentTime(){ return V.t / 1000; }, resume: async () => {}, close: async () => {} };
  coachAnalyser = { getFloatTimeDomainData(b) {
    const endMs = V.t - __mic.lat, startMs = endMs - b.length * 1000 / SR;
    const act = __plucks.filter(p => p.t < endMs && p.t > startMs - 2000).map(p => ({ p, w: 2*Math.PI*440*Math.pow(2,(p.midi-69)/12) }));
    for (let i = 0; i < b.length; i++) { const tMs = endMs - (b.length - 1 - i) * 1000 / SR;
      let v = (Math.random() - 0.5) * __mic.noise;
      for (const a of act) { const dt = (tMs - a.p.t) / 1000; if (dt < 0) continue;
        const env = Math.exp(-dt / 0.6) * a.p.amp, x = a.w * dt;
        v += env * (Math.sin(x) + 0.5*Math.sin(2*x) + 0.25*Math.sin(3*x));
        if (dt < 0.006) v += (Math.random() - 0.5) * 3 * a.p.amp * (a.p.scrape == null ? 1 : a.p.scrape) * (1 - dt/0.006); }
      b[i] = v; } } };
  coachFrameBuf = new Float32Array(4096); window.coachMicLive = true; };
Object.defineProperty(document, 'hidden', { get: () => false, configurable: true });
gamesStopMic = function(){};
coachEvictTuner = () => __installFakes();
window.__room = (from, to, room) => { if (room) for (let t = from; t < to; t += 150 + Math.random() * 400)
    __plucks.push({ t, midi: 40 + Math.floor(Math.random() * 30), amp: 0.15 * room * (0.4 + Math.random() * 0.6) }); };
window.__runCoach = async (btn, { frameMs = 40, wrongBy = 0, room = 0, timingMs = 0, jitter = 0, amp = 0.15, scrape = 1 } = {}) => {
  __plucks.length = 0; __errs.length = 0;
  coachOpen(btn); __installFakes(); await coachStartCheck(); __step(frameMs, 50);
  if (!coach || !coach.listenStart) return { err: 'no countin', phase: coach && coach.phase };
  coach.slots.forEach((s, i) => (s.midis || [s.midi]).forEach(m => __plucks.push({ t: coach.listenStart + i * coach.beatMs + timingMs + (Math.random()-0.5)*2*jitter, midi: m + wrongBy, amp, scrape })));
  __room(coach.listenStart - 2000, coach.listenStart + coach.slots.length * coach.beatMs + 3000, room);
  let g = 0; while (coach && coach.phase !== 'report' && g++ < 160) __step(frameMs, 250);
  return { phase: coach && coach.phase, states: coach && coach.slots.map(s => s.state + (s.loose ? '~' : '')).join(' '), errs: __errs.slice() };
};
window.__tally = async (btn, n, opts) => { const c = { ok: 0, wrong: 0, other: 0, errs: [], notReport: 0 };
  for (let k = 0; k < n; k++) { const r = await __runCoach(btn, opts); if (r.phase !== 'report') c.notReport++;
    (r.states || '').split(' ').forEach(s => { if (/^(ok|oct)/.test(s)) c.ok++; else if (/^wrong/.test(s)) c.wrong++; else c.other++; });
    if (r.errs && r.errs.length) c.errs = r.errs; }
  return c; };
window.__fretRun = async (room, gapMs, wrongBy = 0) => { fretStop(); __plucks.length = 0; __errs.length = 0;
  gamesShow('fret'); await fretStart(0); __step(50, 100);
  const res = { right1st: 0, wrongHint: 0, none: 0 };
  for (let k = 0; k < 8 && fretGame && fretGame.prompt; k++){
    const g = fretGame, target = g.prompt.m, before = g.results.length, tries = g.tries;
    __room(__V.t, __V.t + 3000, room);
    __step(50, 600);
    __plucks.push({ t: __V.t + 100, midi: target + wrongBy, amp: 0.15 });
    let w = 0; while (fretGame === g && g.results.length === before && g.tries === tries && w++ < 40) __step(50, 100);
    if (g.results.length > before) res.right1st++; else if (g.tries > tries) res.wrongHint++; else res.none++;
    if (g.results.length === before) { fretSkip && fretSkip(); }
    __step(50, gapMs);
  }
  return { res, errs: __errs.slice() }; };
window.__runNr = async (level, { frameMs = 50, wrongBy = 0, room = 0, jitter = 0 } = {}) => {
  __plucks.length = 0; __errs.length = 0;
  nr.level = level; nr.phase = 'ready'; nrRenderReady();
  await nrStart(); __step(frameMs, 50);
  if (!nr.listenStart) return { err: 'no countin', phase: nr.phase };
  nr.playable.forEach(n => __plucks.push({ t: n.t + (Math.random()-0.5)*2*jitter, midi: n.midi + wrongBy, amp: 0.15 }));
  __room(nr.listenStart - 2000, nr.playable[nr.playable.length-1].t + 3000, room);
  let g = 0; while (nr && nr.phase !== 'done' && g++ < 400) __step(frameMs, 250);
  const c = {}; nr.playable.forEach(n => c[n.result] = (c[n.result]||0)+1);
  return { phase: nr.phase, c, errs: __errs.slice() };
};
window.__tallyNr = async (level, n, opts) => { const tot = {}; let errs = [];
  for (let k=0;k<n;k++){ const r = await __runNr(level, opts); Object.entries(r.c||{}).forEach(([k2,v])=>tot[k2]=(tot[k2]||0)+v); if (r.errs.length) errs = r.errs; }
  return { tot, errs }; };
window.__harness = true;
