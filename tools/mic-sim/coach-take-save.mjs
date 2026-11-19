/* Which ways out of a recorded Listening Coach take save it (2026-11-16): a take's document has ONE id per student and game,
   micTakes/<uid>-coach, so every save replaces the student's last take.

     node tools/mic-sim/coach-take-save.mjs [--root=<site folder>]

   The fault it was written for: "I'm done" pressed at beat 1 (coachFinish from the listening screen's button) saved a 4.5 s take with
   no note in it over the student's last full take. Since then coachFinish(ended) saves a take that ran to its end (the loop passes
   `true`), and a take ended early only when at least one note was heard; a take not saved is still stopped and let go (micRecStop runs
   first). `ended` must be exactly `true`: an onclick that hands it an event object is an early finish.
   Real (unchanged, in mic-sim's vm site, listen-site.mjs): coachStartCheck, coachCountIn, coachLoop, coachFinish, coachRecMeta,
   coachClose, coachInterrupt, gamesHideStop, coachMicOff, micRecStart / micRecStop / micRecAbort / micRecRevoke / micRecSave /
   micRecSaveNow. Stubbed: the recording nodes (the capture is fed silent 4096-sample buffers), Firestore (each set() kept), consent.
   The student is mic-sim's synthetic 'steady' player (or 'noGuitar') in the 'quiet' room; the user is made up (Test 0).
   Each case starts from a full take saved just before, and says whether the document must be replaced and by what.
   Node only, about 6 s. checks.mjs 1ex runs it (since 2026-11-18: coachClose reaches coachMicOff in coach-score.js through a typeof
   guard, and this is the tool that turns red when that guard breaks). Exit 1 when a case fails. */
import { resolve } from 'node:path';
import { benchSite, worldSource } from './listen-site.mjs';

const args = process.argv.slice(2);
const rootArg = (args.find(a => a.startsWith('--root=')) || '').slice(7);
const site = benchSite(rootArg ? { root: resolve(rootArg) } : {});
const SKILL = JSON.parse(site.run('__lb.gatedSkills()')).find(g => g.midis);
const TAKE = 'micTakes/test-uid-0-coach';
site.run(`globalThis.__T = { docs: {}, writes: 0,
  setup(){
    const keepWorld = __lb.world;
    __lb.world = function(lat){
      keepWorld(lat);
      currentUser = { uid: 'test-uid-0', displayName: 'Test 0' };
      const AC = window.AudioContext;
      window.AudioContext = function(){ const c = AC(); const node = () => ({ connect(){}, disconnect(){}, gain: { value: 1 }, onaudioprocess: null });
        c.createScriptProcessor = node; c.destination = {}; const g = c.createGain; c.createGain = () => Object.assign(g(), { disconnect(){} });
        const s = c.createMediaStreamSource; c.createMediaStreamSource = () => Object.assign(s(), { disconnect(){} }); return c; };
    };
    micRecWanted = () => true;
    isDevBypassUser = () => false;
    const Blob_ = function(){}, Sent_ = function(){};
    const ref = path => ({ set: async v => { if (!/chunks/.test(path)){ if (path === ${JSON.stringify(TAKE)}) __T.writes++; __T.docs[path] = JSON.stringify({
        durationSec: v.durationSec, events: (v.events || []).length, verdicts: (v.expected || []).map(e => e.verdict[0]).join('') }); } },
      collection: c => ({ doc: id => ref(path + '/' + c + '/' + id) }) });
    db = { collection: c => ({ doc: id => ref(c + '/' + id) }), runTransaction: async fn => fn({ get: async () => ({ exists: false }), update(){}, set(){} }) };
    ensureDb = async () => db;
    globalThis.firebase = { firestore: { Blob: { fromUint8Array: () => new Blob_() }, FieldValue: { serverTimestamp: () => new Sent_() } } };
  },
  feed(){ const r = micRec; if (r && r.live && r.proc.onaudioprocess) r.proc.onaudioprocess({ playbackTime: r.ctx.currentTime, inputBuffer: { getChannelData: () => new Float32Array(4096) } }); },
  doc(){ return __T.docs[${JSON.stringify(TAKE)}] || 'none'; } };
__T.setup();`);

const beatMs = 60000 / SKILL.bpm;
const settle = async () => { for (let i = 0; i < 50; i++) await null; };
const phase = () => site.run('coach ? coach.phase : "none"');
async function start(who){
  site.clock.now += 5000;
  const src = worldSource({ student: who || 'steady', room: 'quiet', seed: 1 });
  src.start(site);
  site.run('globalThis.__lbArg = ' + JSON.stringify({ midis: SKILL.midis, skills: [SKILL.sid], bpm: SKILL.bpm, lat: 50 }));
  const err = site.run('__lb.coachStart(__lbArg)'); if (err) throw new Error(err);
  await site.run('__lb.p'); await settle();
  if (phase() !== 'countin') throw new Error('no count-in: ' + phase());
  const slots = Number(site.run('coach.slots.length'));
  const line = JSON.parse(SKILL.midis).slice(0, slots), midis = {};
  line.forEach((m, i) => { midis['n' + i] = (Array.isArray(m) ? m : [m]).map(Number); });
  src.round({ listenStartMs: Number(site.run('coach.listenStart')), beatMs, bpc: 1, slots, seq: line.map((_, i) => 'n' + i), midis });
  let f = 0;
  return { frame(){ site.clock.now += 1000 / 60; src.pump(); site.tick(); if (++f % 5 === 0) site.run('__T.feed()'); } };
}
const settled = async () => { await site.run('micRecSaving'); await settle(); return site.run('__T.doc()'); };
const writes = () => Number(site.run('__T.writes'));

site.reset();
let g = await start(); while (phase() !== 'report') g.frame();
const FULL = await settled();
if (!/"events":[1-9]/.test(FULL)) throw new Error('coach-take-save: the full take saved no notes: ' + FULL);

/* Each case: a full take is saved first, then `play` runs a second take and ends it; want: 'kept' (the full take stays, and the
   second capture is stopped and let go) or a test on the document that replaced it. */
const CASES = [
  ['a take played to its end', 'replaced: a full take', async () => { g = await start(); while (phase() !== 'report'){ site.run('globalThis.__r = micRec || __r'); g.frame(); } },
    d => /"events":[1-9]/.test(d)],
  ['a take run to its end with nothing heard (no guitar)', 'replaced: 0 notes', async () => { g = await start('noGuitar'); while (phase() !== 'report'){ site.run('globalThis.__r = micRec || __r'); g.frame(); } },
    d => /"events":0/.test(d)],
  ['"I\'m done" after 3 notes heard', 'replaced: 3 notes', async () => {
    g = await start(); while (phase() !== 'listening') g.frame(); while (Number(site.run('coach.events.length')) < 3) g.frame();
    site.run('globalThis.__r = micRec; coachFinish()'); }, d => /"events":3,/.test(d)],
  ['"I\'m done" at beat 1, nothing heard (the listening screen\'s button)', 'kept', async () => {
    g = await start(); while (phase() !== 'listening') g.frame(); g.frame();
    if (Number(site.run('coach.events.length'))) throw new Error('a note was heard at beat 1');
    site.run('globalThis.__r = micRec; coachFinish()'); }],
  ['"I\'m done" at beat 1, handed a click event (an onclick that passes one)', 'kept', async () => {
    g = await start(); while (phase() !== 'listening') g.frame(); g.frame();
    site.run('globalThis.__r = micRec; coachFinish({ type: "click" })'); }],
  ['coachFinish() during the count-in', 'kept', async () => {
    g = await start(); for (let i = 0; i < 20; i++) g.frame(); site.run('globalThis.__r = micRec; coachFinish()'); }],
  ['close the card during the count-in', 'kept', async () => {
    g = await start(); for (let i = 0; i < 20; i++) g.frame(); site.run('globalThis.__r = micRec; coachClose()'); }],
  ['a hidden tab mid-song', 'kept', async () => {
    g = await start(); while (phase() !== 'listening') g.frame(); for (let i = 0; i < 90; i++) g.frame();
    site.run('globalThis.__r = micRec; coachInterrupt(t("coach.paused.backgrounded")); gamesHideStop()'); }],
  ['close mid-song', 'kept', async () => {
    g = await start(); while (phase() !== 'listening') g.frame(); for (let i = 0; i < 90; i++) g.frame();
    site.run('globalThis.__r = micRec; coachClose()'); }]
];
let bad = 0;
for (const [name, want, play, test] of CASES){
  site.run('__T.docs = {}');
  g = await start(); while (phase() !== 'report') g.frame();
  const before = await settled(), w0 = writes();
  site.run('globalThis.__r = null');
  await play();
  const after = await settled(), wrote = writes() > w0;
  /* the capture running when the take ended (each case grabs it): stopped (no handler, not live) and let go (micRec cleared) */
  const freed = site.run('!!globalThis.__r && !__r.live && !__r.proc.onaudioprocess && micRec === null');
  let ok;
  if (want === 'kept') ok = !wrote && after === before && freed;
  else ok = wrote && test(after) && freed;
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}: want ${want}; ${wrote ? 'replaced by ' + after : 'kept ' + after}${freed ? '' : ' · no capture seen, or it is still held'}`);
}
console.log(`coach-take-save: ${CASES.length - bad} of ${CASES.length} cases pass (skill ${SKILL.sid}, ${SKILL.bpm} BPM; take id ${TAKE}; a full take is ${FULL})`);
process.exit(bad ? 1 : 0);
