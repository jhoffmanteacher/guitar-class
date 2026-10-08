/* Renders the teacher console's Mic recordings view against a stub
   Firestore and exercises its buttons. Same setup as smoke.mjs:
     NODE_PATH=$(npm root -g) node tools/mic-sim/smoke-console.mjs http://localhost:8123/ */
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)('playwright');
const base = process.argv[2] || 'http://localhost:8123/';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1366, height: 800 } });
const errs = []; page.on('pageerror', e => errs.push(e.message));
await page.goto(base + 'index.html?teacher=true');
await page.waitForFunction(() => typeof ensureTeacherJs === 'function');
await page.evaluate(() => ensureTeacherJs());
const r = await page.evaluate(async () => {
  // A minimal in-memory Firestore: enough for the console's reads and writes.
  const store = new Map();
  const Blob_ = { fromUint8Array: u => ({ toUint8Array: () => u, _b: u }) };
  const pcm = new Int16Array(24000); for (let i = 0; i < pcm.length; i++) pcm[i] = Math.round(Math.sin(i / 8) * 8000);
  const bytes = new Uint8Array(pcm.buffer);
  store.set('config/class', { configVersion: 3, micSampling: { on: true, max: 40 } });
  store.set('micTakesMeta/count', { n: 1 });
  store.set('micTakes/u1-coach', { uid: 'u1', name: 'Test Student', period: '3', mode: 'coach', coachMode: 'melody', bpm: 60,
    durationSec: 1, sampleRate: 24000, chunks: 2, expected: [{ t: 10, midi: 45, verdict: 'ok' }, { t: 1010, midi: 47, verdict: 'wrong' }],
    savedAt: { toDate: () => new Date('2026-10-08T10:00:00Z'), toMillis: () => 1 } });
  store.set('micTakes/u1-coach/chunks/0', { i: 0, pcm: Blob_.fromUint8Array(bytes.subarray(0, 30000)) });
  store.set('micTakes/u1-coach/chunks/1', { i: 1, pcm: Blob_.fromUint8Array(bytes.subarray(30000)) });
  const snapOf = p => ({ exists: store.has(p), data: () => store.get(p), id: p.split('/').pop(), ref: docRef(p) });
  function docRef(p){ return { path: p, get: async () => snapOf(p), set: async (d, o) => { store.set(p, o && o.merge ? Object.assign({}, store.get(p) || {}, d) : d); },
    update: async d => store.set(p, Object.assign({}, store.get(p), d)), delete: async () => store.delete(p), collection: n => colRef(p + '/' + n) }; }
  function colRef(p){ const q = { doc: id => docRef(p + '/' + id), orderBy: () => q, limit: () => q, where: () => q,
    get: async () => { const docs = [...store.keys()].filter(k => k.startsWith(p + '/') && k.slice(p.length + 1).indexOf('/') < 0).map(snapOf); return { docs, empty: !docs.length, size: docs.length, forEach: f => docs.forEach(f) }; } }; return q; }
  const fdb = { collection: n => colRef(n),
    runTransaction: async fn => fn({ get: r => r.get(), set: (r, d, o) => r.set(d, o), update: (r, d) => r.update(d) }) };
  window.db = fdb; db = fdb; window.ensureDb = async () => fdb; ensureDb = window.ensureDb;
  window.firebase = window.firebase || {}; firebase.firestore = Object.assign(firebase.firestore || {}, { Blob: Blob_, FieldValue: { serverTimestamp: () => 'ts', delete: () => 'del' } });
  window.confirm = () => true; window.alert = m => { window.__alert = m; };
  const blobs = []; URL.createObjectURL = b => { blobs.push(b); return 'blob:x'; };
  HTMLAnchorElement.prototype.click = function(){ window.__dl = (window.__dl || []).concat(this.download); };
  try { await showTeacherApp({ uid: 't', email: TEACHER_EMAIL, displayName: 'Teacher' }); } catch (e) { window.__showErr = e.message; }
  setTeacherView('mic');
  for (let k = 0; k < 50 && !document.querySelector('#t-grid-container table'); k++) await new Promise(r => setTimeout(r, 50));
  const html = document.getElementById('t-grid-container').innerText;
  await teacherMicDownloadWav(0);
  await teacherMicDownloadJson(0);
  const wav = blobs[0], wavHead = wav ? new Uint8Array(await wav.arrayBuffer()).slice(0, 12) : null;
  const json = blobs[1] ? JSON.parse(await blobs[1].text()) : null;
  document.getElementById('t-mic-max').value = '25';
  await teacherSetMicSampling(false);
  const cfgAfter = store.get('config/class');
  await teacherMicDelete(0);
  const left = [...store.keys()].filter(k => k.startsWith('micTakes/'));
  await teacherResetMicCount();
  return { showErr: window.__showErr || null, html: html.slice(0, 700), wavBytes: wav ? wav.size : 0, wavHead: wavHead && String.fromCharCode(...wavHead),
    jsonKeys: json && Object.keys(json), downloads: window.__dl, cfgAfter, left, count: store.get('micTakesMeta/count'), alert: window.__alert || null };
});
console.log(JSON.stringify(r, null, 1));
await page.screenshot({ path: process.env.SHOT || '/tmp/console.png', fullPage: false });
console.log('pageErrors', JSON.stringify(errs));
await browser.close();
