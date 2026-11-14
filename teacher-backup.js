/* ── Backup: "Download a backup" in Manage (2026-11-13) ─────────────────
   Jonathan, 2026-11-13: there was no copy of the students' saved work anywhere
   (no export, no firebase/gcloud tool on the Mac). This saves one dated file,
   guitar-class-backup-YYYY-MM-DD.json, to the teacher's own computer, built
   from everything the teacher's account may read today that cannot be made
   again.

   READ-ONLY. Nothing here writes to Firestore: no "last backup" doc, nothing in
   config/class, nothing under progress/{uid}. The date of the last download is
   kept in this browser only (localStorage TEACHER_BACKUP_LAST_KEY).
   tools/backup-proof.mjs runs this file against a stub database and counts
   every write it attempts (it must be 0).

   WHAT IS IN THE FILE (firestore.rules, 2026-11-13):
     progress/{uid}            every student's saved work, RAW: exactly as stored,
                               not remapped. The console's roster reads the
                               Module 4/5 swap's old-numbered docs through
                               swap45Remap (teacherFetchStudents); the backup
                               does not, so a restore puts back what was there and
                               the student's own browser still moves it.
                               Module Review ratings live here (skills).
     config/class              the class settings: board, dates, clears, pause,
                               archive, periods, games access, configVersion.
     minutes/{uid}/weeks/*     practice-minutes weeks, read once per progress
                               uid (the teacher cannot list minutes/ itself),
                               through teacherPmWeeksGet (teacher-students.js),
                               the console's one read under minutes/ (1cg).
     issueReports/*            students' problem reports.
     config/access             (2026-11-13) the outside accounts the teacher
                               allowed in, { allow: { uid: true } }; in the file
                               beside config/class.
     accessRequests/*          (2026-11-13) "ask your teacher to let me in":
                               name, email, when, status.
     Before the paste-1 rules for those two are published the teacher cannot
     read them: that one refusal (permission-denied) leaves them out and the
     header says so (notReadable), instead of failing the whole backup. Any
     other failure on them fails it, like every other read.
   LEFT OUT, and why: TEACHER_BACKUP_LEFT_OUT below (also written into the file).

   THE FILE. One JSON object. Its header comes first: format, formatVersion,
   complete (always true: a backup with a failed read is never saved), the date,
   the site's shell cache name, the Firebase project, counts (docs per
   collection), the encoding rules and the left-out list. Then `collections`:
     { "progress": { uid: fields }, "config": { "class": fields, "access": fields },
       "minutesWeeks": { "<uid>/<weekId>": fields },
       "issueReports": { id: fields }, "accessRequests": { uid: fields } }
   A Firestore doc id never contains "/", so "<uid>/<weekId>" splits back
   unambiguously into minutes/<uid>/weeks/<weekId>.
   Firestore types are written as tagged objects so they read back exactly
   (teacherBackupEncode / teacherBackupDecode):
     {"__type":"timestamp","seconds":S,"nanoseconds":N,"iso":"…"}  (iso is for
                                                    people; the decoder ignores it)
     {"__type":"bytes","base64":"…"}   {"__type":"geopoint","latitude":…,"longitude":…}
     {"__type":"reference","path":"…"}
     {"__type":"number","value":"NaN"|"Infinity"|"-Infinity"|"-0"}  (JSON has none)
     {"__type":"map","value":{…}}      a stored map that itself has a "__type" key
   Everything else (strings, booleans, null, finite numbers, arrays, maps) is
   plain JSON. The SDK hands integers and doubles back as one JS number, so the
   file cannot tell 3 from 3.0 either; nothing in the site depends on it.

   HONEST FAILURE. Every read is one try plus one retry (not after
   permission-denied), each with a TEACHER_BACKUP_READ_MS ceiling. If any read
   still fails, NO file is saved and the status line names the collection: a
   file that exists gets trusted later, in a bad moment, and one missing part of
   the class would be worse than a clear "try again". Leaving Manage stops the
   run at its next read and saves nothing; a second click while one runs does
   nothing.

   RESTORE (there is no button, on purpose: the console never writes
   progress/{uid}, and firestore.rules gives the teacher read only there).
   What a restore takes:
     1. Open the file and check complete:true and the counts.
     2. For one student or a few: Firebase console → Firestore → progress →
        that uid → replace the fields by hand from the file. For many: a short
        one-off Node script run on the Mac with the Firebase Admin SDK and a
        service-account key from the Firebase console (Admin writes are not
        bound by firestore.rules). It reads the file, turns every value back
        with the rules of teacherBackupDecode (a timestamp → Timestamp, bytes →
        Bytes, a reference → a doc ref …) and set()s each doc at its path:
        progress/<uid>, config/class, config/access,
        minutes/<uid>/weeks/<week>, issueReports/<id>, accessRequests/<uid>.
     3. A restored doc REPLACES what is there: anything the student saved after
        the backup is lost. Have the student sign out first. Restore
        config/class only with every console closed (a console holding the
        newer configVersion then refuses its next strict write and reloads,
        which is the safe outcome).
     4. A doc restored in the old Module 4/5 numbering (no migrations.swap45)
        is moved by the student's own browser on their next visit, as today.

   WHERE: one row at the end of Manage's settings (renderTeacherManage calls
   teacherBackupPanelHtml). Manage repaints its whole screen on every toggle,
   so the run's state lives here and the row is drawn from it each time;
   progress updates only the row's own elements. */
const TEACHER_BACKUP_FORMAT_VERSION = 1;
const TEACHER_BACKUP_PAGE = 200;            // docs per page of a collection read
const TEACHER_BACKUP_CONCURRENCY = 6;       // per-student minutes reads in flight at once
const TEACHER_BACKUP_READ_MS = 30000;       // one read's ceiling
const TEACHER_BACKUP_MAX_PAGES = 1000;      // a pager that never ends is a fault, not a big class
const TEACHER_BACKUP_LAST_KEY = 'gc-teacher-backup-last';
const TEACHER_BACKUP_DUE_DAYS = 7;          // more than this many days (or never) → the reminder line
const TEACHER_BACKUP_WEEKS = 'minutesWeeks';
const TEACHER_BACKUP_LABEL = {
  'config/class': 'the class settings (config/class)',
  'progress': 'students’ saved work (progress)',
  [TEACHER_BACKUP_WEEKS]: 'practice minutes (each student’s weeks)',
  'issueReports': 'problem reports (issueReports)',
  'config/access': 'the allow list of outside accounts (config/access)',
  'accessRequests': 'requests to join (accessRequests)',
};
const TEACHER_BACKUP_LEFT_OUT = [
  {path:'micTakes/* and micTakes/*/chunks/*', why:'mic recordings: large audio, saved by Mic recordings → Download all (with each take’s data)'},
  {path:'micTakesMeta/count', why:'a counter Mic recordings can reset; not student work'},
  {path:'liveQuiz/current and liveQuiz/current/answers/*', why:'one live game’s state, written from scratch each game'},
  {path:'weekBoard/*, rankBoard/*', why:'the practice boards: the Top 5 board is rebuilt by each student’s own page from their minutes; the class rank board is no longer used (since 2026-11-13)'},
  {path:'each student’s practice days and private board tag (under minutes, beside the weeks)', why:'the teacher’s account may not read them (firestore.rules); the weeks hold the totals'},
  {path:'minutesBoard/*', why:'no rules block: nobody can read it'},
];

let teacherBackupGen = 0;
// kind: idle · running · saved · failed · stopped. text is plain text (painted with textContent).
let teacherBackupState = {kind:'idle', text:''};

/* ── Encoding (Firestore values ↔ JSON) ── */
function teacherBackupFs(){ return (typeof firebase!=='undefined' && firebase && firebase.firestore) || {}; }
function teacherBackupIs(v, name){ const F=teacherBackupFs(); return typeof F[name]==='function' && v instanceof F[name]; }
function teacherBackupSetKey(o, k, v){ Object.defineProperty(o, k, {value:v, enumerable:true, writable:true, configurable:true}); }
function teacherBackupEncode(v, where){
  if(v===null || typeof v==='string' || typeof v==='boolean') return v;
  if(typeof v==='number'){
    if(Number.isNaN(v)) return {__type:'number', value:'NaN'};
    if(v===Infinity) return {__type:'number', value:'Infinity'};
    if(v===-Infinity) return {__type:'number', value:'-Infinity'};
    if(Object.is(v, -0)) return {__type:'number', value:'-0'};
    return v;
  }
  if(Array.isArray(v)) return v.map((x, i)=>teacherBackupEncode(x, where+'['+i+']'));
  if(v && typeof v==='object'){
    if(teacherBackupIs(v, 'Timestamp') || (typeof v.toMillis==='function' && typeof v.seconds==='number' && typeof v.nanoseconds==='number')){
      let iso=''; try{ iso=new Date(v.toMillis()).toISOString(); }catch(e){}
      return {__type:'timestamp', seconds:v.seconds, nanoseconds:v.nanoseconds, iso};
    }
    if(teacherBackupIs(v, 'Blob') || (typeof v.toBase64==='function' && typeof v.toUint8Array==='function')) return {__type:'bytes', base64:v.toBase64()};
    if(teacherBackupIs(v, 'GeoPoint') || (typeof v.latitude==='number' && typeof v.longitude==='number' && typeof v.isEqual==='function')) return {__type:'geopoint', latitude:v.latitude, longitude:v.longitude};
    if(teacherBackupIs(v, 'DocumentReference') || (typeof v.path==='string' && typeof v.collection==='function')) return {__type:'reference', path:v.path};
    // A plain map: its prototype is null or an Object.prototype (whose own prototype is null). Any class instance fails this.
    const proto=Object.getPrototypeOf(v);
    if(proto===null || Object.getPrototypeOf(proto)===null){
      const o={};
      Object.keys(v).forEach(k=>teacherBackupSetKey(o, k, teacherBackupEncode(v[k], where+'.'+k)));
      return Object.prototype.hasOwnProperty.call(v, '__type') ? {__type:'map', value:o} : o;
    }
  }
  // undefined, a function, an unknown class: it could not be read back as it was, so the backup fails instead.
  throw new Error('a value the backup cannot write at '+where);
}
/* The reverse, for a restore script and tools/backup-proof.mjs. F supplies the constructors:
   {Timestamp, Blob (fromBase64String), GeoPoint, doc(path)}; it defaults to the page's SDK. */
function teacherBackupDecode(v, F){
  F=F||teacherBackupFs();
  if(v===null || typeof v!=='object') return v;
  if(Array.isArray(v)) return v.map(x=>teacherBackupDecode(x, F));
  if(Object.prototype.hasOwnProperty.call(v, '__type')){
    const t=v.__type;
    if(t==='timestamp') return new F.Timestamp(v.seconds, v.nanoseconds);
    if(t==='bytes') return F.Blob.fromBase64String(v.base64);
    if(t==='geopoint') return new F.GeoPoint(v.latitude, v.longitude);
    if(t==='reference') return F.doc(v.path);
    if(t==='number') return v.value==='NaN'?NaN : v.value==='Infinity'?Infinity : v.value==='-Infinity'?-Infinity : v.value==='-0'?-0 : (()=>{ throw new Error('bad number '+v.value); })();
    if(t==='map'){ const o={}; Object.keys(v.value).forEach(k=>teacherBackupSetKey(o, k, teacherBackupDecode(v.value[k], F))); return o; }
    throw new Error('unknown __type '+t);
  }
  const o={};
  Object.keys(v).forEach(k=>teacherBackupSetKey(o, k, teacherBackupDecode(v[k], F)));
  return o;
}

/* ── The "Last backup" line ── */
function teacherBackupLastAt(){
  try{ const n=Number(localStorage.getItem(TEACHER_BACKUP_LAST_KEY)); return Number.isFinite(n) && n>0 ? n : 0; }catch(e){ return 0; }
}
// Whole calendar days between two times, in local time (a backup at 11 PM is "1 day ago" the next morning).
function teacherBackupDaysSince(then, now){
  const a=new Date(then), b=new Date(now);
  const d=Math.round((new Date(b.getFullYear(), b.getMonth(), b.getDate()) - new Date(a.getFullYear(), a.getMonth(), a.getDate()))/86400000);
  return Math.max(0, d);
}
function teacherBackupLastLine(now){
  const at=teacherBackupLastAt();
  if(!at) return {due:true, text:'No backup has been downloaded on this computer yet.'};
  const n=teacherBackupDaysSince(at, now==null?Date.now():now);
  const when = n===0 ? 'today' : n===1 ? '1 day ago' : n+' days ago';
  return n>TEACHER_BACKUP_DUE_DAYS
    ? {due:true, text:`Last backup: ${when}. Time to download a new one.`}
    : {due:false, text:`Last backup: ${when}.`};
}

/* ── The row in Manage ── */
function teacherBackupPanelHtml(){
  const last=teacherBackupLastLine();
  const running=teacherBackupState.kind==='running';
  return `<div class="tg-class" id="t-backup">
        <div class="tg-class-lbl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M4 19h16"/></svg> Backup</div>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <span id="t-backup-last" style="font-size:0.8125rem;${last.due?'color:var(--amber-text);font-weight:600':'color:var(--text2)'}">${escHtml(last.text)}</span>
          <button type="button" class="tg-seg-btn" id="t-backup-btn" onclick="teacherBackupStart()"${running?' disabled':''}>${running?'Reading…':'Download a backup'}</button>
        </div>
      </div>
      <div class="tg-note">One file of every student’s saved work and the class settings. It holds students’ names: it is saved to this computer only, never uploaded. Keep it off shared drives.<br><span id="t-backup-status" role="status">${escHtml(teacherBackupState.text)}</span></div>`;
}
function teacherBackupPaint(){
  if(typeof document==='undefined') return;
  const running=teacherBackupState.kind==='running';
  const btn=document.getElementById('t-backup-btn');
  if(btn){ btn.disabled=running; btn.textContent=running?'Reading…':'Download a backup'; }
  const st=document.getElementById('t-backup-status');
  if(st) st.textContent=teacherBackupState.text;
  const lastEl=document.getElementById('t-backup-last');
  if(lastEl){
    const last=teacherBackupLastLine();
    lastEl.textContent=last.text;
    lastEl.style.color=last.due?'var(--amber-text)':'var(--text2)';
    lastEl.style.fontWeight=last.due?'600':'';
  }
}
function teacherBackupSay(gen, kind, text){
  if(gen!==teacherBackupGen) return;
  teacherBackupState={kind, text};
  teacherBackupPaint();
}

/* ── Reading ── */
const TEACHER_BACKUP_STOP = {backupStopped:true};
// The run goes on only while it is the newest one and Manage is still the screen.
function teacherBackupCheck(gen){
  if(gen!==teacherBackupGen || teacherView!=='manage') throw TEACHER_BACKUP_STOP;
}
async function teacherBackupGet(gen, coll, fn){
  let err=null;
  for(let attempt=0; attempt<2; attempt++){
    teacherBackupCheck(gen);
    try{
      const r=await withTimeout(fn(), TEACHER_BACKUP_READ_MS);
      teacherBackupCheck(gen);
      return r;
    }catch(e){
      if(e===TEACHER_BACKUP_STOP) throw e;
      err=e;
      if(e && e.code==='permission-denied') break;
    }
  }
  teacherBackupCheck(gen);
  throw {backupCollection:coll, cause:err};
}
/* A read whose ONLY allowed failure is the rules refusing it (the two 2026-11-13 documents before their rules are
   pasted): returns null and notes the collection; every other failure throws as teacherBackupGet does. */
async function teacherBackupOptional(gen, coll, fn, notReadable){
  try{ return await (coll==='accessRequests' ? fn() : teacherBackupGet(gen, coll, fn)); }
  catch(e){
    const cause=e && e.backupCollection ? e.cause : null;
    if(cause && cause.code==='permission-denied'){ notReadable.push(coll); return null; }
    throw e;
  }
}
function teacherBackupEncodeDoc(coll, id, data, where){
  try{ return teacherBackupEncode(data, where); }
  catch(e){ throw {backupCollection:coll, cause:e, unwritable:true}; }
}
// Every doc of a top-level collection, in pages ordered by doc id (a doc written mid-read is never read twice or skipped over).
async function teacherBackupReadPaged(gen, coll, onPage){
  const byId=firebase.firestore.FieldPath.documentId();
  const docs=[];
  let last=null, lastId=null;
  for(let page=0; ; page++){
    if(page>=TEACHER_BACKUP_MAX_PAGES) throw {backupCollection:coll, cause:new Error('too many pages')};
    let q=db.collection(coll).orderBy(byId).limit(TEACHER_BACKUP_PAGE);
    if(last) q=q.startAfter(last);
    const snap=await teacherBackupGet(gen, coll, ()=>q.get({source:'server'}));
    const got=snap.docs||[];
    // A page that does not move past the last one would loop for ever and double docs: a fault, said as one.
    if(got.length && lastId!==null && !(got[0].id>lastId)) throw {backupCollection:coll, cause:new Error('paging did not advance')};
    got.forEach(d=>docs.push(d));
    if(onPage) onPage(docs.length);
    if(got.length<TEACHER_BACKUP_PAGE) break;
    last=got[got.length-1]; lastId=last.id;
  }
  return docs;
}
async function teacherBackupReadAll(gen){
  await ensureDb();
  if(!db) throw {backupCollection:'config/class', cause:new Error('no database connection')};
  const collections={}, counts={};

  teacherBackupSay(gen, 'running', 'Reading the class settings…');
  /* A plain .get() (checks.mjs 1ai allows only that on this doc in the console). Offline it could answer from this
     tab's memory cache, but every read after it asks the server ({source:'server'}) and would fail, so no file. */
  const cfgSnap=await teacherBackupGet(gen, 'config/class', ()=>db.collection('config').doc('class').get());
  collections.config={};
  if(cfgSnap.exists) teacherBackupSetKey(collections.config, 'class', teacherBackupEncodeDoc('config/class', 'class', cfgSnap.data(), 'config/class'));
  counts.config=cfgSnap.exists?1:0;
  const notReadable=[];
  /* The allow list: refused only before its rules are pasted (see the header). */
  teacherBackupSay(gen, 'running', 'Reading the allow list…');
  const accSnap=await teacherBackupOptional(gen, 'config/access', ()=>db.collection('config').doc('access').get({source:'server'}), notReadable);
  if(accSnap && accSnap.exists){ teacherBackupSetKey(collections.config, 'access', teacherBackupEncodeDoc('config/access', 'access', accSnap.data(), 'config/access')); counts.config++; }

  teacherBackupSay(gen, 'running', 'Reading students’ saved work…');
  const progressDocs=await teacherBackupReadPaged(gen, 'progress', n=>teacherBackupSay(gen, 'running', `Reading students’ saved work: ${n} read so far…`));
  collections.progress={};
  progressDocs.forEach(d=>teacherBackupSetKey(collections.progress, d.id, teacherBackupEncodeDoc('progress', d.id, d.data(), 'progress/'+d.id)));
  counts.progress=progressDocs.length;

  // Practice-minutes weeks: one read per student, a few at a time (as the Practice minutes view reads them).
  const uids=progressDocs.map(d=>d.id), total=uids.length;
  const weeks={};
  let next=0, done=0, weekCount=0, failed=null;
  teacherBackupSay(gen, 'running', `Reading practice minutes: 0 of ${total} students…`);
  const worker=async()=>{
    while(!failed && next<total){
      const uid=uids[next++];
      const snap=await teacherBackupGet(gen, TEACHER_BACKUP_WEEKS, ()=>teacherPmWeeksGet({uid}));
      (snap.docs||[]).forEach(d=>{ teacherBackupSetKey(weeks, uid+'/'+d.id, teacherBackupEncodeDoc(TEACHER_BACKUP_WEEKS, d.id, d.data(), 'practice week '+uid+'/'+d.id)); weekCount++; });
      done++;
      teacherBackupSay(gen, 'running', `Reading practice minutes: ${done} of ${total} students…`);
    }
  };
  await Promise.all(Array.from({length:Math.min(TEACHER_BACKUP_CONCURRENCY, total)}, ()=>worker().catch(e=>{ if(!failed) failed=e; })));
  if(failed) throw failed;
  // Sorted keys, so two backups of the same data are the same file whatever order the reads came back in.
  collections[TEACHER_BACKUP_WEEKS]={};
  Object.keys(weeks).sort().forEach(k=>teacherBackupSetKey(collections[TEACHER_BACKUP_WEEKS], k, weeks[k]));
  counts[TEACHER_BACKUP_WEEKS]=weekCount;

  teacherBackupSay(gen, 'running', 'Reading problem reports…');
  const reportDocs=await teacherBackupReadPaged(gen, 'issueReports');
  collections.issueReports={};
  reportDocs.forEach(d=>teacherBackupSetKey(collections.issueReports, d.id, teacherBackupEncodeDoc('issueReports', d.id, d.data(), 'issueReports/'+d.id)));
  counts.issueReports=reportDocs.length;

  teacherBackupSay(gen, 'running', 'Reading requests to join…');
  const reqDocs=await teacherBackupOptional(gen, 'accessRequests', ()=>teacherBackupReadPaged(gen, 'accessRequests'), notReadable);
  if(reqDocs){
    collections.accessRequests={};
    reqDocs.forEach(d=>teacherBackupSetKey(collections.accessRequests, d.id, teacherBackupEncodeDoc('accessRequests', d.id, d.data(), 'accessRequests/'+d.id)));
    counts.accessRequests=reqDocs.length;
  }

  return {collections, counts, notReadable};
}
// The shell cache's name (sw.js CACHE_VERSION), so the file says which site wrote it.
async function teacherBackupSiteVersion(){
  try{
    if(typeof caches==='undefined' || !caches.keys) return 'unknown';
    const names=(await caches.keys()).filter(n=>/^guitar-class-\d{4}-\d{2}-\d{2}-[0-9a-f]+$/.test(n)).sort();
    return names.length ? names[names.length-1] : 'unknown';
  }catch(e){ return 'unknown'; }
}
function teacherBackupDay(now){
  const d=new Date(now), p=n=>String(n).padStart(2,'0');
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`;
}
function teacherBackupFileText(read, now, site){
  let project='unknown';
  try{ project=(firebase.app().options||{}).projectId||'unknown'; }catch(e){}
  const file={
    format:'guitar-class-backup',
    formatVersion:TEACHER_BACKUP_FORMAT_VERSION,
    complete:true,
    date:teacherBackupDay(now),
    createdAt:new Date(now).toISOString(),
    site,
    project,
    counts:read.counts,
    notReadable:read.notReadable||[],
    encoding:'Firestore types are tagged objects: {"__type":"timestamp",seconds,nanoseconds,iso}, {"__type":"bytes",base64}, {"__type":"geopoint",latitude,longitude}, {"__type":"reference",path}, {"__type":"number",value:"NaN"|"Infinity"|"-Infinity"|"-0"}, and {"__type":"map",value} for a stored map that has its own "__type" key. Docs are RAW, as stored (no Module 4/5 remap). "minutesWeeks" holds each student’s practice weeks, keyed "<uid>/<weekId>" (that doc’s path is minutes, uid, weeks, weekId). See teacher-backup.js for how to restore.',
    leftOut:TEACHER_BACKUP_LEFT_OUT,
    collections:read.collections,
  };
  return JSON.stringify(file);
}
function teacherBackupSummary(counts, notReadable){
  const n=(k, one, many)=>`${counts[k]} ${counts[k]===1?one:many}`;
  const extra=('accessRequests' in counts ? `, ${n('accessRequests','request to join','requests to join')}` : '')
    + ((notReadable||[]).length ? ` (not readable yet, their rules are not pasted: ${notReadable.map(c=>TEACHER_BACKUP_LABEL[c]||c).join(', ')})` : '');
  return `${n('progress','student','students')}, ${n(TEACHER_BACKUP_WEEKS,'practice week','practice weeks')}, ${n('issueReports','problem report','problem reports')}, ${counts.config?'the class settings':'no class settings doc (there is none yet)'}${extra}`;
}

/* The button. A second click while a run is out does nothing. */
async function teacherBackupStart(){
  if(teacherBackupState.kind==='running') return;
  const gen=++teacherBackupGen;
  teacherBackupSay(gen, 'running', 'Starting…');
  let read;
  try{
    read=await teacherBackupReadAll(gen);
    teacherBackupCheck(gen);
  }catch(e){
    if(gen!==teacherBackupGen) return;           // a newer run owns the row
    if(e===TEACHER_BACKUP_STOP){
      teacherBackupSay(gen, 'stopped', 'Stopped: you left Manage before the backup finished. Nothing was saved. Click again to start over.');
      return;
    }
    const coll=e && e.backupCollection;
    const cause=coll ? e.cause : e;
    const why=(cause && (cause.code || cause.message)) || 'unknown error';
    if(!coll) console.error('[guitar-class] backup failed', e);
    teacherBackupSay(gen, 'failed', `Backup failed: could not ${e && e.unwritable ? 'copy' : 'read'} ${coll ? (TEACHER_BACKUP_LABEL[coll]||coll) : 'the database'} (${why}). Nothing was saved, so no file can be mistaken for a whole backup. Check the connection and try again.`);
    return;
  }
  const now=Date.now();
  const site=await teacherBackupSiteVersion();
  if(gen!==teacherBackupGen) return;
  if(teacherView!=='manage'){
    teacherBackupSay(gen, 'stopped', 'Stopped: you left Manage before the backup finished. Nothing was saved. Click again to start over.');
    return;
  }
  const name=`guitar-class-backup-${teacherBackupDay(now)}.json`;
  try{
    teacherMicSaveFile(name, new Blob([teacherBackupFileText(read, now, site)], {type:'application/json'}));
  }catch(e){
    console.error('[guitar-class] backup save failed', e);
    teacherBackupSay(gen, 'failed', 'Backup failed: the file could not be built or saved ('+((e&&e.message)||'unknown error')+'). Nothing was saved.');
    return;
  }
  try{ localStorage.setItem(TEACHER_BACKUP_LAST_KEY, String(now)); }catch(e){}
  teacherBackupSay(gen, 'saved', `Saved ${name}: ${teacherBackupSummary(read.counts, read.notReadable)}. Look in your Downloads folder.`);
}
