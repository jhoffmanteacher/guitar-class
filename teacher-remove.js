/* ── One student: Start over · Delete their data (2026-11-14) ──────────────
   Jonathan, 2026-11-14. Two actions behind the "⋯" (More) button at the end of
   a student's row in Manage (teacher-manage.js), never next to the everyday
   buttons:
     Start this student over…   their MODULE progress is emptied (steps,
                                answers, ratings, Journey ticks, the practice
                                log, the last place). They stay on the roster
                                with their class period; practice minutes,
                                in-class activities, exit checks and game
                                scores are kept.
     Delete this student's data…  one tick box per kind of data (all ticked to
                                start); what is ticked is deleted.
   Both: one student at a time; the dialog first lists exactly what will go,
   with counts; the teacher types the student's name to confirm; nothing is
   ever done on a schedule or in bulk. "Download this student's data first"
   sits beside the button (offered, not required): one JSON file of what the
   console can read for that student, saved to this computer only, built with
   the backup's encoder (teacher-backup.js) and file saver (teacher-mic.js).

   THE ONE EXCEPTION to "the console never writes progress/{uid}": the delete
   of one student's whole document, teacherRemoveDeleteProgress(), reached
   only from the confirmed Delete dialog. The console still never CREATES or
   EDITS a progress document (firestore.rules gives the teacher read and
   delete there, nothing else: the rules are the guard; checks.mjs 1ee pins
   only that this one function exists once and is called from one place).
   Start over writes nothing to progress/: it leaves a marker in config/class
   (progressStartOver[uid] = time) and the student's own page empties the
   lesson fields ONCE, at its next sign-in on the main site
   (progressStartOverAtSignIn, app/save.js). Delete also leaves
   progressDeleted[uid] = time; nothing enforces it afterwards (a student who
   signs in again starts as a new student; that Chromebook's copies are
   cleared at that sign-in). Both go through teacherWriteConfig(),
   cell-checked on the one cell. The markers hold a uid and a time, nothing
   else, and stay until the summer reset.

   DELETE ORDER (each kind whole before the next; a failure stops there and
   says "done X of N kinds, failed at …", the rest untouched; running it again
   finishes, since every step re-reads what is left):
     1 practice minutes  minutes/{uid}/meta/board (the tag; teacherRemoveRun), then days/*, weeks/*
     2 mic recordings    micTakes/{uid}-coach|nr|pw: chunks first, then the take
     3 song requests     songRequests/* where uid == the student
     4 joining           accessRequests/{uid}, then the allow-list entry in config/access
     5 live game         liveQuiz/current/answers/{uid}
     6 console settings  the student's cells in config/class (pause, archive,
                         the period you set, open through, games, activity
                         clears, individual cards)
     7 saved work        the progressDeleted marker, then progress/{uid} (LAST)
   NOT removable here, said in the dialog: problem reports (the rules let
   nobody delete them), the anonymous Top 5 / class-rank entries (a private
   tag, no uid: the tag is deleted with the minutes, so nothing links them
   to the student any more), the Google sign-in record (Firebase console
   only), and a copy on a Chromebook until it next opens the site.
   NO UNDO: the console cannot put a student back (the rules deny the teacher
   create and update). A restore is hand work in the Firebase console; a
   started-over student's doc put back by hand is emptied again at their next
   sign-in unless its startOverApplied is at least the marker (or the marker
   cell is removed first).
   THE LIMIT, said in both dialogs and in Manage: a page the student already
   has OPEN keeps its old copy and saves it again on its next save (after a
   Delete it re-creates the record; after a Start over it puts old lesson work
   back). Press the button again; do it when the student is not using the site.
   node tools/remove-one-sim.mjs after any change here (checks.mjs 1ee runs it). */
const TRM_KINDS = [
  {id:'minutes',      label:'Practice minutes'},
  {id:'recordings',   label:'Mic recordings'},
  {id:'songRequests', label:'Song requests'},
  {id:'join',         label:'Request to join and allow-list entry'},
  {id:'live',         label:'Live-game answer'},
  {id:'settings',     label:'Console settings for this student'},
  {id:'progress',     label:'Saved work (their progress document)'},
];
const TRM_MIC_MODES = ['coach', 'nr', 'pw'];
const TRM_BATCH = 400;
// The student's own cells in config/class, by field: a uid key (paused, archived, …) or a uid inside each activity's map.
const TRM_UID_FIELDS = ['paused', 'archived', 'periodOverrides', 'moduleOpenThrough', 'gameOverrides', 'activityClears'];
let trm = null;     // the open dialog: {uid, name, mode:'menu'|'over'|'delete', phase, inv, ticks, typed, result, gen}
let trmGen = 0;
/* The ticks of a Delete that STOPPED, by uid, until a Delete for that student ends ok (review R1-1). A failed re-read,
   Close and opening the dialog again must not tick again what the teacher unticked (saved work included). Kept in this
   tab's memory and in its sessionStorage, written BEFORE a run starts (review R2-2): the console reloads itself for a
   new version (app/start.js holds that reload while a run is out, at most 5 minutes), and a reload must not tick saved
   work again either. The stored value is kind ids only, under a key named with the uid: no name. Sign-out, or another
   account signing in on this tab, clears sessionStorage (signOut, app/start.js); a NEW tab starts from the usual list. */
const trmStoppedTicks = {};
const TRM_STOPPED_KEY = 'gc-trm-stopped:';   // + uid, in sessionStorage
function trmKeptGet(uid){
  if(trmStoppedTicks[uid]) return trmStoppedTicks[uid];
  try{
    const v = JSON.parse(sessionStorage.getItem(TRM_STOPPED_KEY + uid) || 'null');
    if(!v || !Array.isArray(v.k)) return null;
    const ticks = {};
    TRM_KINDS.forEach(k=>{ ticks[k.id] = v.k.includes(k.id); });
    return (trmStoppedTicks[uid] = ticks);
  }catch(e){ return null; }
}
function trmKeptSet(uid, ticks){
  trmStoppedTicks[uid] = ticks;
  try{ sessionStorage.setItem(TRM_STOPPED_KEY + uid, JSON.stringify({k: TRM_KINDS.filter(k=>ticks[k.id]).map(k=>k.id)})); }catch(e){ /* storage blocked: this tab's memory still has them */ }
}
function trmKeptDrop(uid){
  delete trmStoppedTicks[uid];
  try{ sessionStorage.removeItem(TRM_STOPPED_KEY + uid); }catch(e){ /* storage blocked */ }
}

function trmStudent(uid){ return (allStudentsRaw||[]).find(s=>s.uid===uid) || null; }
// The name typed to confirm: the roster's name, else the email, else the uid (a row with neither: review m6).
function trmNameOf(s){ return String((s && (s.name || s.email || s.uid)) || ''); }
function trmNorm(s){ return String(s||'').trim().replace(/\s+/g, ' ').toLowerCase(); }
function trmPlural(n, one, many){ return n + ' ' + (n===1 ? one : (many || one + 's')); }

/* ── Reading what the student has ── */
function trmCountMap(m){ return (m && typeof m==='object' && !Array.isArray(m)) ? Object.keys(m).length : 0; }
async function teacherRemoveRead(uid){
  await ensureDb();
  if(!db) throw new Error('no database connection');
  const inv = {};
  const prog = await db.collection('progress').doc(uid).get();
  inv.progress = prog.exists ? (prog.data() || {}) : null;
  inv.days = (await teacherAbsDaysGet(uid, '0000-00-00', '9999-99-99')).docs || [];
  inv.weeks = (await teacherPmWeeksGet({uid})).docs || [];
  inv.takes = [];
  for(const mode of TRM_MIC_MODES){
    const ref = db.collection('micTakes').doc(uid + '-' + mode);
    const t = await ref.get();
    if(!t.exists) continue;
    const chunks = await ref.collection('chunks').get();
    inv.takes.push({id: t.id, data: t.data() || {}, chunks: chunks.docs || []});
  }
  inv.songRequests = (await db.collection('songRequests').where('uid', '==', uid).get()).docs || [];
  inv.reports = (await db.collection('issueReports').where('uid', '==', uid).get()).docs || [];
  // The two joining documents are readable only once their rules are pasted; a refusal reads as "none".
  const optional = async fn => { try{ return await fn(); }catch(e){ if(e && e.code==='permission-denied') return null; throw e; } };
  const req = await optional(()=>db.collection('accessRequests').doc(uid).get());
  inv.joinRequest = req && req.exists ? (req.data() || {}) : null;
  const acc = await optional(()=>db.collection('config').doc('access').get());
  inv.allowed = !!(acc && acc.exists && ((acc.data() || {}).allow || {})[uid] === true);
  const ans = await db.collection('liveQuiz').doc('current').collection('answers').doc(uid).get();
  inv.liveAnswer = ans.exists ? (ans.data() || {}) : null;
  const cfg = await loadTeacherClassConfig();
  if(!teacherClassConfigReadOk) throw new Error('the class settings could not be read');
  inv.settings = trmSettingsOf(cfg || {}, uid);
  return inv;
}
/* This student's cells in config/class: {path: value}, dotted paths (uids and activity ids hold no dots). */
function trmSettingsOf(cfg, uid){
  const cells = {};
  TRM_UID_FIELDS.forEach(f=>{
    const m = cfg[f];
    if(m && typeof m==='object' && Object.prototype.hasOwnProperty.call(m, uid)) cells[f + '.' + uid] = m[uid];
  });
  const who = cfg.activityStudents || {};
  Object.keys(who).forEach(id=>{
    const m = who[id];
    if(m && typeof m==='object' && Object.prototype.hasOwnProperty.call(m, uid)) cells['activityStudents.' + id + '.' + uid] = m[uid];
  });
  return cells;
}
/* One line per kind: what deleting it removes, from the inventory. n = how many things (0 = nothing to delete). */
function trmKindLines(inv, uid){
  const p = inv.progress, out = {};
  if(p){
    const parts = [trmPlural(trmCountMap(p.completed), 'step done', 'steps done'), trmPlural(trmCountMap(p.responses), 'answer'),
      trmPlural(trmCountMap(p.skills), 'rating or got-it', 'ratings and got-its'), trmPlural(trmCountMap(p.classActivities), 'in-class activity', 'in-class activities'),
      trmPlural(trmCountMap(p.exitChecks), 'exit check')];
    out.progress = {n: 1, text: `their whole saved-work document (${parts.join(', ')}); they leave the roster`};
  } else out.progress = {n: 0, text: 'no saved-work document'};
  out.minutes = {n: inv.days.length + inv.weeks.length,
    text: inv.days.length + inv.weeks.length ? `${trmPlural(inv.days.length, 'day')} and ${trmPlural(inv.weeks.length, 'week')} of practice, and their private Top 5 tag` : 'no practice minutes saved'};
  const pieces = inv.takes.reduce((a, t)=>a + t.chunks.length, 0);
  out.recordings = {n: inv.takes.length, text: inv.takes.length ? `${trmPlural(inv.takes.length, 'recording')} (${trmPlural(pieces, 'audio piece')})` : 'no recordings'};
  out.songRequests = {n: inv.songRequests.length, text: inv.songRequests.length ? trmPlural(inv.songRequests.length, 'song request') : 'no song requests'};
  const j = (inv.joinRequest ? 1 : 0) + (inv.allowed ? 1 : 0);
  out.join = {n: j, text: j ? [inv.joinRequest ? 'their request to join' : '', inv.allowed ? 'their entry on the allow list (an outside account: they could no longer sign in)' : ''].filter(Boolean).join(' and ') : 'no request to join, not on the allow list'};
  out.live = {n: inv.liveAnswer ? 1 : 0, text: inv.liveAnswer ? 'their answer in the current live game' : 'no live-game answer'};
  const s = inv.settings, names = [];
  Object.keys(s).forEach(k=>{
    const f = k.split('.')[0];
    if(f==='paused') names.push('paused'); else if(f==='archived') names.push('archived');
    else if(f==='periodOverrides') names.push('the period you set (' + String(s[k]) + ')');
    else if(f==='moduleOpenThrough') names.push('open through Module ' + String(s[k]));
    else if(f==='gameOverrides') names.push('games ' + (s[k] ? 'on' : 'off') + ' for them');
  });
  const clears = trmCountMap(s['activityClears.' + uid]);
  if(clears) names.push(trmPlural(clears, 'activity clear'));
  const cards = Object.keys(s).filter(k=>k.startsWith('activityStudents.')).length;
  if(cards) names.push('picked for ' + trmPlural(cards, 'individual card'));
  out.settings = {n: Object.keys(s).length, text: names.length ? names.join(', ') : 'no settings of their own'};
  return out;
}
function trmStartOverLine(inv){
  const p = inv.progress;
  if(!p) return 'They have no saved work yet: there is nothing to empty.';
  const ready = trmCountMap(p.songReady);
  return `Emptied: ${trmPlural(trmCountMap(p.completed), 'step done', 'steps done')}, ${trmPlural(trmCountMap(p.responses), 'answer')}, ${trmPlural(trmCountMap(p.skills), 'rating or got-it', 'ratings and got-its')}, ${trmPlural(ready, 'Journey song')} with ticks, and their practice log. Kept: name, class period, practice minutes, ${trmPlural(trmCountMap(p.classActivities), 'in-class activity', 'in-class activities')}, ${trmPlural(trmCountMap(p.exitChecks), 'exit check')}, game scores.`;
}

/* ── Doing it ── */
async function trmDeleteRefs(refs){
  for(let i = 0; i < refs.length; i += TRM_BATCH){
    const batch = db.batch();
    refs.slice(i, i + TRM_BATCH).forEach(r=>batch.delete(r));
    await batch.commit();
  }
}
/* Each step re-reads what is left, so a second run after a failure finishes the job. */
const TRM_STEPS = {
  async minutes(uid){
    const days = (await teacherAbsDaysGet(uid, '0000-00-00', '9999-99-99')).docs || [];
    const weeks = (await teacherPmWeeksGet({uid})).docs || [];
    await trmDeleteRefs(days.concat(weeks).map(d=>d.ref));
    await teacherRemoveDeleteBoardTag(uid);
  },
  async recordings(uid){
    for(const mode of TRM_MIC_MODES){
      const ref = db.collection('micTakes').doc(uid + '-' + mode);
      const chunks = await ref.collection('chunks').get();
      await trmDeleteRefs((chunks.docs || []).map(d=>d.ref));
      await ref.delete();
    }
  },
  async songRequests(uid){
    const snap = await db.collection('songRequests').where('uid', '==', uid).get();
    await trmDeleteRefs((snap.docs || []).map(d=>d.ref));
  },
  async join(uid, inv){
    await db.collection('accessRequests').doc(uid).delete();
    // Merge one key away (as teacher-accounts.js does); only when there is one, so no empty list doc is made.
    if(inv.allowed) await db.collection('config').doc('access').set({allow: {[uid]: firebase.firestore.FieldValue.delete()}}, {merge: true});
  },
  async live(uid){
    await db.collection('liveQuiz').doc('current').collection('answers').doc(uid).delete();
  },
  settings: uid => teacherRemoveSettings(uid),
  async progress(uid){
    // The marker first: Manage's status and the student's next sign-in (progressStartOverAtSignIn, app/save.js) read it.
    await trmWriteMarker('progressDeleted', uid);
    await teacherRemoveDeleteProgress(uid);
  },
};
/* Kind 6: the student's own cells in config/class, through teacherWriteConfig(). */
async function teacherRemoveSettings(uid){
  const cfg = await loadTeacherClassConfig();
  if(!teacherClassConfigReadOk) throw new Error('the class settings could not be read');
  const cells = trmSettingsOf(cfg || {}, uid);
  if(!Object.keys(cells).length) return;
  const fv = firebase.firestore.FieldValue, patch = {};
  Object.keys(cells).forEach(path=>{
    const [f, a, b] = path.split('.');
    if(f==='activityStudents'){ ((patch.activityStudents = patch.activityStudents || {})[a] = patch.activityStudents[a] || {})[b] = fv.delete(); }
    else (patch[f] = patch[f] || {})[a] = fv.delete();
  });
  /* Cell-checked on exactly the cells it removes: another console's
     unrelated edit goes through; a change to one of this student's cells
     in the gap refuses (nothing saved, run it again). */
  /* A stale refusal is said the console's way (teacherConfigSaveFailed: nothing saved, reloading the settings); every
     failure then stops the run, which says which kind it stopped at. */
  try{ await teacherWriteConfig(patch, cells); }
  catch(e){ if(e && e.staleConfig) teacherConfigSaveFailed(e, ''); throw e; }
  Object.keys(cells).forEach(path=>{
    const [f, a, b] = path.split('.');
    const m = f==='activityStudents' ? ((teacherClassConfig.activityStudents || {})[a]) : teacherClassConfig[f];
    if(m && typeof m==='object') delete m[f==='activityStudents' ? b : a];
  });
}
/* THE ONE CONSOLE WRITE TO progress/: delete one student's whole document.
   Reached only from the confirmed Delete dialog (teacherRemoveRun). It never
   creates or edits one. checks.mjs 1ee pins this function and runs it. */
function teacherRemoveDeleteProgress(uid){
  return db.collection('progress').doc(uid).delete();
}
/* The student's private Top 5 tag. The teacher's account may delete it but never read it (firestore.rules). */
function teacherRemoveDeleteBoardTag(uid){
  return db.collection('minutes').doc(uid).collection('meta').doc('board').delete();
}
/* A marker: field[uid] = a time later than any this student had. Cell-checked on that one cell. */
async function trmWriteMarker(field, uid){
  const cfg = await loadTeacherClassConfig();
  if(!teacherClassConfigReadOk) throw new Error('the class settings could not be read');
  const map = (cfg && cfg[field]) || {};
  const had = Object.prototype.hasOwnProperty.call(map, uid), prev = map[uid];
  const other = Number(((cfg && cfg[field==='progressDeleted' ? 'progressStartOver' : 'progressDeleted']) || {})[uid]) || 0;
  const at = Math.max(Date.now(), (Number(prev) || 0) + 1, other + 1);
  // A stale refusal is said the console's way, as in the settings step; the caller reports every failure in the dialog.
  if(field==='progressDeleted'){
    try{ await teacherWriteConfig({progressDeleted: {[uid]: at}}, {['progressDeleted.' + uid]: had ? prev : undefined}); }
    catch(e){ if(e && e.staleConfig) teacherConfigSaveFailed(e, ''); throw e; }
  } else {
    try{ await teacherWriteConfig({progressStartOver: {[uid]: at}}, {['progressStartOver.' + uid]: had ? prev : undefined}); }
    catch(e){ if(e && e.staleConfig) teacherConfigSaveFailed(e, ''); throw e; }
  }
  if(!teacherClassConfig[field]) teacherClassConfig[field] = {};
  teacherClassConfig[field][uid] = at;
  return at;
}
/* The delete, kind by kind in TRM_KINDS order (progress last). Resolves to the result line; never rejects. */
async function teacherRemoveRun(uid, inv, ticks){
  const kinds = TRM_KINDS.filter(k=>ticks[k.id]);
  let done = 0;
  for(const k of kinds){
    /* The private Top 5 tag goes FIRST, before the minutes step (review R1-6). The console cannot read it, so a re-read
       sees only days and weeks: deleted last (the step's own last line), a failure at the tag left no minutes to show,
       the kind was never offered again and the tag stayed. Deleted here first, any failure leaves days or weeks, so
       the kind is offered and the re-run deletes the tag again; the step's own delete then finds nothing (a missing doc
       deletes fine). The step is left as it is: checks 1dm pins its block (UNTRACED_REFS_TODAY, tools/never-blocks.mjs). */
    try{
      if(k.id==='minutes') await teacherRemoveDeleteBoardTag(uid);
      await TRM_STEPS[k.id](uid, inv);
    }
    catch(e){
      console.warn('[guitar-class] delete stopped at ' + k.id, e);
      const why = (e && (e.code || e.message)) || 'unknown error';
      return {ok: false, done, total: kinds.length, at: k.label,
        text: `Stopped: done ${done} of ${kinds.length} kinds, failed at ${k.label} (${why}). Nothing after it was touched. Run Delete again to finish: it starts from what is left.`};
    }
    done++;
  }
  return {ok: true, done, total: kinds.length, text: `Done: ${done} of ${kinds.length} kinds deleted.`};
}

/* ── The download offered first ── */
function trmEnc(coll, id, data){ return teacherBackupEncodeDoc(coll, id, data, coll + '/' + id); }
async function teacherRemoveDownload(uid, inv){
  const out = {format: 'guitar-class-one-student', formatVersion: 1, complete: true, uid, createdAt: new Date().toISOString(),
    encoding: 'As the class backup (teacher-backup.js): Firestore types are tagged objects. Recordings: each take with its audio pieces in order.',
    collections: {}};
  const c = out.collections;
  if(inv.progress) c.progress = {[uid]: trmEnc('progress', uid, inv.progress)};
  c.minutesDays = {}; inv.days.forEach(d=>teacherBackupSetKey(c.minutesDays, d.id, trmEnc('minutesDays', d.id, d.data())));
  c.minutesWeeks = {}; inv.weeks.forEach(d=>teacherBackupSetKey(c.minutesWeeks, d.id, trmEnc('minutesWeeks', d.id, d.data())));
  c.micTakes = {};
  inv.takes.forEach(t=>{
    const chunks = {};
    t.chunks.forEach(ch=>teacherBackupSetKey(chunks, ch.id, trmEnc('micTakes', t.id + '/chunks/' + ch.id, ch.data())));
    teacherBackupSetKey(c.micTakes, t.id, {take: trmEnc('micTakes', t.id, t.data), chunks});
  });
  c.songRequests = {}; inv.songRequests.forEach(d=>teacherBackupSetKey(c.songRequests, d.id, trmEnc('songRequests', d.id, d.data())));
  c.issueReports = {}; inv.reports.forEach(d=>teacherBackupSetKey(c.issueReports, d.id, trmEnc('issueReports', d.id, d.data())));
  if(inv.joinRequest) c.accessRequest = trmEnc('accessRequests', uid, inv.joinRequest);
  c.allowListed = inv.allowed;
  if(inv.liveAnswer) c.liveQuizAnswer = trmEnc('liveQuiz', 'answers/' + uid, inv.liveAnswer);
  c.configClassCells = trmEnc('config', 'class', inv.settings);
  const day = teacherBackupDay(Date.now());
  teacherMicSaveFile(`guitar-class-student-${String(uid).slice(0, 8)}-${day}.json`, new Blob([JSON.stringify(out)], {type: 'application/json'}));
}

/* ── The dialog ── */
function teacherRemoveOpen(uid){
  const stu = trmStudent(uid);
  if(!stu) return;
  trm = {uid, name: trmNameOf(stu), mode: 'menu', phase: 'idle', inv: null, ticks: {}, typed: '', result: null, note: '', gen: ++trmGen};
  trmPaint();
}
function teacherRemoveClose(){
  if(trm && trm.phase==='running') return;   // a delete half done is not walked away from
  trm = null; trmGen++;
  const o = document.getElementById('trm-overlay');
  if(o) o.remove();
}
async function trmChoose(mode){
  // After a Delete that stopped (this dialog's "Read again and finish", or a reopen): only what was ticked then.
  const keep = mode==='delete' ? trmKeptGet(trm.uid) : null;
  trm.mode = mode; trm.phase = 'reading'; trm.typed = ''; trm.result = null; trm.note = '';
  const gen = trm.gen;
  trmPaint();
  let inv;
  try{ inv = await teacherRemoveRead(trm.uid); }
  catch(e){
    if(!trm || trm.gen!==gen) return;
    trm.phase = 'readFailed'; trm.note = 'Could not read what this student has (' + ((e && (e.code || e.message)) || 'unknown error') + '). Nothing was changed. Check the connection and try again.';
    trmPaint(); return;
  }
  if(!trm || trm.gen!==gen) return;
  trm.inv = inv; trm.phase = 'ready';
  const lines = trmKindLines(inv, trm.uid);
  /* A kind with nothing to delete then was unticked then, so with keep it stays unticked even if it has data now
     (the note says so): nothing is ticked that the teacher did not tick. */
  trm.ticks = {}; TRM_KINDS.forEach(k=>{ trm.ticks[k.id] = lines[k.id].n > 0 && (!keep || keep[k.id]===true); });
  if(keep) trm.note = 'Ticked as in the delete that stopped. A kind you unticked, or one with nothing to delete then, stays unticked: tick it to delete it too.';
  trmPaint();
}
function trmConfirmed(){ return !!trm && trmNorm(trm.typed)!=='' && trmNorm(trm.typed)===trmNorm(trm.name); }
function trmAnyTicked(){ return !!trm && TRM_KINDS.some(k=>trm.ticks[k.id]); }
async function trmGo(){
  if(!trm || trm.phase!=='ready' || !trmConfirmed()) return;
  const gen = trm.gen, uid = trm.uid;
  if(trm.mode==='delete'){
    if(!trmAnyTicked()) return;
    trm.phase = 'running'; trmPaint();
    const ticks = Object.assign({}, trm.ticks);
    // Kept before the run (review R2-2): a reload while it runs keeps them; a run that ends ok forgets them.
    trmKeptSet(uid, ticks);
    const r = await teacherRemoveRun(uid, trm.inv, ticks);
    if(r.ok) trmKeptDrop(uid);
    if(!trm || trm.gen!==gen) return;
    trm.phase = 'done'; trm.result = r; trmPaint();
    if(r.done && typeof teacherRefreshStudents==='function') teacherRefreshStudents({manual: true});
    if(teacherView==='manage') renderTeacherManage();
  } else {
    trm.phase = 'running'; trmPaint();
    let r;
    try{ await trmWriteMarker('progressStartOver', uid); r = {ok: true, text: ''}; }
    catch(e){
      r = {ok: false, text: e && e.staleConfig
        ? 'Nothing was saved: the class settings changed in another tab or on another computer while this was open. Close this, then try again.'
        : 'Nothing was saved (' + ((e && (e.code || e.message)) || 'unknown error') + '). Check the connection and try again.'};
    }
    if(!trm || trm.gen!==gen) return;
    trm.phase = 'done'; trm.result = r; trmPaint();
    if(teacherView==='manage') renderTeacherManage();
  }
}
async function trmDownload(){
  if(!trm || !trm.inv) return;
  try{ await teacherRemoveDownload(trm.uid, trm.inv); trm.note = 'Saved to this computer (look in Downloads). It holds the student’s name: keep it off shared drives.'; }
  // A value the backup cannot write is thrown as {backupCollection, cause} (teacherBackupEncodeDoc): its reason is the cause's.
  catch(e){ trm.note = 'The file could not be built or saved (' + ((e && (e.message || (e.cause && e.cause.message))) || 'unknown error') + '). Nothing was changed.'; }
  trmPaint();
}
const TRM_KEPT = [
  'Their problem reports, if any (nobody can delete those).',
  'Their Google sign-in. Only the Firebase console can remove it; if they sign in again they start fresh.',
  'Their anonymous Top 5 and class-rank entries: no name and no uid, and nothing links them to the student once the private tag is gone.',
  'A copy on a Chromebook that is still signed in, until that Chromebook next opens the site. A page they already have OPEN keeps its old copy and saves it again (the record comes back; Manage then says “has a record again”): press Delete again.',
];
/* Said in both dialogs, above the typed name. */
function trmWarnHtml(){
  return `<p class="trm-p trm-warn"><strong>Do this when the student is not using the site.</strong> A page they already have open keeps its old copy and saves it again; if their work comes back, press this again.</p>
    <p class="trm-p trm-small">Download a backup first (Manage → Backup). The database cannot limit how fast the teacher account deletes, so one stolen teacher sign-in could delete every student in seconds; a backup is the only way back, and putting a student back is done by hand in the Firebase console (this page cannot put a student back).</p>`;
}
function trmBodyHtml(){
  const t = trm, n = escHtml(t.name);
  const close = `<button type="button" class="tg-seg-btn" data-trm-act="close">${t.phase==='done' ? 'Close' : 'Cancel'}</button>`;
  if(t.mode==='menu'){
    return `<h2 class="trm-title" id="trm-title">${n}</h2>${trmWhoHtml(t)}
      <p class="trm-p">Actions that remove this student’s work. Each asks you to confirm.</p>
      <div class="trm-menu">
        <button type="button" class="trm-menu-item" data-trm-act="over"><strong>Start this student over…</strong><span>Empty their module progress. They stay on the roster with their period and practice minutes.</span></button>
        <button type="button" class="trm-menu-item t-act-danger" data-trm-act="delete"><strong>Delete this student’s data…</strong><span>Pick what to delete: saved work, minutes, recordings, requests, settings.</span></button>
      </div>
      <div class="trm-actions">${close}</div>`;
  }
  const isDel = t.mode==='delete';
  const title = isDel ? `Delete ${n}’s data` : `Start ${n} over`;
  const who = trmWhoHtml(t);
  if(t.phase==='reading') return `<h2 class="trm-title" id="trm-title">${title}</h2>${who}<p class="trm-p">Reading what this student has…</p><div class="trm-actions">${close}</div>`;
  if(t.phase==='readFailed') return `<h2 class="trm-title" id="trm-title">${title}</h2><p class="trm-p trm-err" role="alert">${escHtml(t.note)}</p><div class="trm-actions"><button type="button" class="tg-seg-btn" data-trm-act="${t.mode}">Read again</button>${close}</div>`;
  let body = '';
  if(isDel){
    const lines = trmKindLines(t.inv, t.uid);
    body += `<p class="trm-p">Ticked kinds are deleted, in this order. Untick what you want to keep.</p><ul class="trm-kinds">`
      + TRM_KINDS.map(k=>{
        const l = lines[k.id], dis = l.n===0 || t.phase!=='ready';
        return `<li><label class="trm-kind${l.n===0 ? ' trm-none' : ''}"><input type="checkbox" data-trm-tick="${k.id}"${t.ticks[k.id] ? ' checked' : ''}${dis ? ' disabled' : ''}> <strong>${escHtml(k.label)}</strong>: ${escHtml(l.text)}</label></li>`;
      }).join('') + `</ul>`;
    const reports = t.inv.reports.length;
    body += `<details class="trm-kept"><summary>What stays${reports ? ` (including ${trmPlural(reports, 'problem report')})` : ''}</summary><ul>${TRM_KEPT.map(x=>`<li>${escHtml(x)}</li>`).join('')}</ul></details>`;
  } else {
    body += `<p class="trm-p">${escHtml(trmStartOverLine(t.inv))}</p>
      <p class="trm-p trm-small">It happens the next time they sign in on the main site, on any Chromebook (a Song Journey page on its own does not do it; the console never edits a student’s saved work). Until then the roster still shows their old progress, marked “not applied yet”. They see one line: “Your teacher started you over: your lesson steps are empty, and your In-Class Activities, game scores, streak and practice minutes are kept.”</p>`;
  }
  if(t.phase==='done'){
    const r = t.result || {};
    const msg = isDel ? r.text
      : (r.ok ? `Done. ${t.name} starts over the next time they sign in on the main site.` : r.text);
    const after = isDel && r.ok ? `<p class="trm-p trm-small">Still there: ${TRM_KEPT.map(x=>escHtml(x.replace(/\.$/, '').replace(/^./, c=>c.toLowerCase()))).join('; ')}.</p>` : '';
    const again = isDel && !r.ok ? `<button type="button" class="tg-seg-btn" data-trm-act="delete">Read again and finish</button>` : '';
    return `<h2 class="trm-title" id="trm-title">${title}</h2>${who}${body}<p class="trm-p ${r.ok ? 'trm-ok' : 'trm-err'}" role="status">${escHtml(msg)}</p>${after}<div class="trm-actions">${again}${close}</div>`;
  }
  const running = t.phase==='running';
  const can = t.phase==='ready' && trmConfirmed() && (!isDel || trmAnyTicked());
  const goLabel = running ? (isDel ? 'Deleting…' : 'Saving…') : (isDel ? 'Delete' : 'Start over');
  return `<h2 class="trm-title" id="trm-title">${title}</h2>${who}${body}${trmWarnHtml()}
    <label class="trm-type">Type the student’s name to confirm: <strong>${n}</strong>
      <input type="text" id="trm-typed" autocomplete="off" spellcheck="false" value="${escAttr(t.typed)}"${running ? ' disabled' : ''}></label>
    ${t.note ? `<p class="trm-p trm-small" role="status">${escHtml(t.note)}</p>` : ''}
    <div class="trm-actions">
      <button type="button" class="tg-seg-btn" data-trm-act="download"${running ? ' disabled' : ''}>Download this student’s data first</button>
      <span class="trm-gap"></span>
      ${running ? '' : close}
      <button type="button" class="tg-seg-btn trm-go${isDel ? ' trm-danger' : ''}" data-trm-act="go"${can ? '' : ' disabled'}>${goLabel}</button>
    </div>`;
}
function trmPaint(){
  if(!trm) return;
  let o = document.getElementById('trm-overlay');
  if(!o){
    o = document.createElement('div');
    o.id = 'trm-overlay';
    o.className = 'daily5-overlay trm-overlay';
    o.setAttribute('role', 'dialog');
    o.setAttribute('aria-modal', 'true');
    o.setAttribute('aria-labelledby', 'trm-title');
    o.innerHTML = '<div class="daily5-modal trm-modal"></div>';
    o.addEventListener('click', trmOnClick);
    o.addEventListener('input', trmOnInput);
    o.addEventListener('change', trmOnChange);
    o.addEventListener('keydown', e=>{ if(e.key==='Escape') teacherRemoveClose(); });
    document.body.appendChild(o);
  }
  const focusTyped = document.activeElement && document.activeElement.id==='trm-typed';
  o.querySelector('.trm-modal').innerHTML = trmBodyHtml();
  const typed = document.getElementById('trm-typed');
  if(focusTyped && typed){ typed.focus(); typed.setSelectionRange(typed.value.length, typed.value.length); }
  else { const first = o.querySelector('.trm-menu-item, #trm-typed, [data-trm-act="close"]'); if(first && !o.contains(document.activeElement)) first.focus(); }
}
function trmOnClick(e){
  if(e.target.id==='trm-overlay'){ teacherRemoveClose(); return; }   // the dimmed backdrop
  const b = e.target.closest('[data-trm-act]');
  if(!b || b.disabled || !trm) return;
  const act = b.dataset.trmAct;
  if(act==='close') teacherRemoveClose();
  else if(act==='over' || act==='delete') trmChoose(act);
  else if(act==='download') trmDownload();
  else if(act==='go') trmGo();
}
function trmOnInput(e){
  if(!trm || e.target.id!=='trm-typed') return;
  trm.typed = e.target.value;
  const go = document.querySelector('#trm-overlay [data-trm-act="go"]');
  if(go) go.disabled = !(trm.phase==='ready' && trmConfirmed() && (trm.mode!=='delete' || trmAnyTicked()));
}
function trmOnChange(e){
  const box = e.target.closest('[data-trm-tick]');
  if(!box || !trm || trm.phase!=='ready') return;
  trm.ticks[box.dataset.trmTick] = box.checked;
  trmOnInput({target: document.getElementById('trm-typed') || {}});
}
/* Under the dialog's title: the email (two students can share a name) and the uid's start (review m6). */
function trmWhoHtml(t){
  const stu = trmStudent(t.uid) || {};
  return `<p class="trm-p trm-small trm-who">${escHtml(stu.email || 'no email saved')} · ${escHtml(String(t.uid).slice(0, 8))}…</p>`;
}
/* Manage's "Right now" cell, from what Manage already loads (the roster's records and config/class); no new read:
   - a progressDeleted marker and this student has a record again (they are in the roster): "Deleted <date> · has a
     record again" (they signed in again as a new student, or a page they had open saved its old copy: Manage cannot
     tell which; press Delete again if it is the old work);
   - a progressStartOver marker NEWER than any Delete: "Started over <date>", and "not applied yet (it happens at their
     next sign-in on the main site)"
     while the record's startOverApplied is older than the marker or absent. */
function teacherRemoveStatusHtml(stu, cfg){
  const num = v => { const x = Number(v); return Number.isFinite(x) && x > 0 ? x : 0; };
  const over = num(((cfg && cfg.progressStartOver) || {})[stu.uid]), del = num(((cfg && cfg.progressDeleted) || {})[stu.uid]);
  const day = t => new Date(t).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  let out = '';
  if(del) out += `<div class="trm-status">Deleted ${escHtml(day(del))} · has a record again</div>`;
  // A Delete pressed after the Start over replaces it (the student's page skips it too: progressStartOverAtSignIn).
  if(over && over > del) out += `<div class="trm-status">Started over ${escHtml(day(over))}${num(stu.startOverApplied) >= over ? '' : ' · not applied yet (it happens at their next sign-in on the main site)'}</div>`;
  return out;
}
