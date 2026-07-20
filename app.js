/* ── Global safety net ──
   If a script throws or a promise rejects unhandled, a student shouldn't be
   left staring at a half-broken page with no idea what happened. Show one
   small, dismissable banner pointing them to a refresh (their saved progress
   lives in Firestore, so a reload is safe), and log details to the console
   for troubleshooting. Guarded so the handler can never spiral on itself. */
(function(){
  let shown = false;
  function showBanner(){
    if (shown) return; shown = true;
    try {
      const d = document.createElement('div');
      d.setAttribute('role','alert');
      d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;'
        + 'max-width:520px;margin:0 auto;padding:12px 44px 12px 16px;border-radius:12px;'
        + 'background:#514a7d;color:#fff;font:14px/1.45 system-ui,-apple-system,sans-serif;'
        + 'box-shadow:0 6px 24px rgba(0,0,0,.28)';
      const msg = document.createElement('span');
      msg.textContent = 'Something went wrong. Your saved progress is safe — please refresh the page to keep going. ';
      const refresh = document.createElement('button');
      refresh.textContent = 'Refresh';
      refresh.style.cssText = 'margin-left:4px;padding:3px 12px;border:0;border-radius:14px;'
        + 'background:#fff;color:#514a7d;font-weight:600;cursor:pointer';
      refresh.onclick = () => location.reload();
      const close = document.createElement('button');
      close.setAttribute('aria-label','Dismiss');
      close.textContent = '×';
      close.style.cssText = 'position:absolute;top:8px;right:12px;background:none;border:0;'
        + 'color:#fff;font-size:1.25rem;line-height:1;cursor:pointer';
      close.onclick = () => d.remove();
      d.append(msg, refresh, close);
      (document.body || document.documentElement).appendChild(d);
    } catch(_) { /* never let the safety net crash */ }
  }
  window.addEventListener('error', e => { console.error('[guitar-class] error:', e.error || e.message); showBanner(); });
  window.addEventListener('unhandledrejection', e => { console.error('[guitar-class] unhandled rejection:', e.reason); showBanner(); });
})();

/* ── Firebase init ── */
// The Firebase SDK + config load as separate <script>s. On some school
// networks a content filter blocks gstatic.com, so they may never arrive —
// guard against that instead of crashing the whole page silently.
let auth = null, db = null;
const firebaseReady = typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined';
if (firebaseReady) {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  // NOTE: db (Firestore) is intentionally NOT initialized here. The Firestore
  // SDK (~100 KB) is loaded on demand by ensureDb() the first time we read or
  // write progress — i.e. only after sign-in — so the sign-in screen paints
  // without it. See index.html.
} else {
  showFirebaseLoadError();
}

/* ── Firestore SDK: load on demand ──
   Loads firebase-firestore-compat.js (once) and initializes `db`. Called
   before any read/write. signIn() pre-warms this during the Google popup so
   it's usually ready by the time onAuthStateChanged fires. */
let _firestoreLoad = null;
function loadFirestoreSdk(){
  if(_firestoreLoad) return _firestoreLoad;
  _firestoreLoad = new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js';
    s.onload  = ()=>resolve();
    s.onerror = ()=>{ _firestoreLoad=null; reject(new Error('Firestore SDK failed to load')); };
    document.head.appendChild(s);
  });
  return _firestoreLoad;
}
async function ensureDb(){
  if(db) return db;
  if(!firebaseReady) return null;
  await loadFirestoreSdk();
  db = firebase.firestore();
  return db;
}
let currentUser = null;
let progress    = {};
let responses   = {};
let completed   = {};
let games       = {};   // per-game bests from the games arcade (coach.js) — its own save category
let gamesAccessOn = true; // whether the Games arcade is available to THIS student (teacher-controlled; see loadClassConfig)
let saveTimer   = null;

/* ── Lazy module loading ──
   Module data files (module-N.js) are no longer loaded up front. Each is
   fetched on demand the first time its module is opened, then its panels are
   built into the DOM. This keeps first load light on weak Wi-Fi / slow
   Chromebooks: we parse one module's data and build one module's panels
   instead of all eight. The service worker still precaches every module file,
   so opening a not-yet-loaded module while offline keeps working. */
const _moduleLoads = {};           // num -> Promise (dedupes concurrent loads)
const _modulesRendered = new Set();
function loadModuleData(num){
  num = parseInt(num);
  if(_moduleLoads[num]) return _moduleLoads[num];
  _moduleLoads[num] = new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = `module-${num}.js`;
    s.onload  = ()=>resolve();
    s.onerror = ()=>{ delete _moduleLoads[num]; reject(new Error('module '+num+' failed to load')); };
    document.head.appendChild(s);
  });
  return _moduleLoads[num];
}
// Build (once) the set + review panels for one module and wire chord links.
async function ensureModuleRendered(num){
  num = parseInt(num);
  if(_modulesRendered.has(num)) return;
  await loadModuleData(num);
  if(_modulesRendered.has(num)) return;   // guard against a concurrent caller
  _modulesRendered.add(num);
  const c = document.getElementById('week-panels');
  SETS.filter(w=>w.moduleNum===num).forEach(w=>{
    const div=document.createElement('div');
    div.className='week-panel'; div.dataset.id=w.id; div.dataset.module=w.moduleNum;
    div.innerHTML = w.comingSoon ? buildComingSoon(w) : buildSet(w);
    c.appendChild(div);
  });
  if(MODULE_REVIEWS[num]){
    const mr=MODULE_REVIEWS[num];
    const div=document.createElement('div');
    div.className='week-panel'; div.dataset.id=`mr${mr.moduleNum}`; div.dataset.module=mr.moduleNum;
    div.innerHTML=buildModuleReview(mr);
    c.appendChild(div);
  }
  // Module-level "🎵 Songs" collapsible, appended after this module's panels
  // (modules 2–12; module 1 keeps its per-set song tabs via buildSet).
  if(num!==1){
    const songsHtml = buildModuleSongs(num);
    if(songsHtml){
      const div=document.createElement('div');
      div.className='module-songs'; div.dataset.module=num;
      div.innerHTML=songsHtml;
      c.appendChild(div);
    }
  }
  // Idempotent: already-wrapped spans are skipped (see CHORD_SKIP_CLASSES).
  wrapAllChordLinks();
}
let _dirtyKeys = new Set();   // which categories need writing: skills · place · responses · completed · games
const escAttr = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escHtml = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
// Builds the signed-in user header. Escapes name/email/photoURL — Google
// account values are user-controlled and go into innerHTML.
function userHeaderHtml(user){
  const av = user.photoURL
    ? `<img src="${escAttr(user.photoURL)}" class="avatar" alt="">`
    : `<div class="avatar-init">${escHtml((user.displayName||'?')[0].toUpperCase())}</div>`;
  return `${av}<span class="user-name">${escHtml(user.displayName||user.email)}</span><button class="btn-out" onclick="signOut()">Sign out</button>`;
}

/* ── Auth ── */
function showAuthError(msg){
  const el = document.getElementById('auth-error');
  if(!el) return;
  el.textContent = msg;
  el.style.display = msg ? '' : 'none';
}
// Shown when the Firebase SDK/config never loaded (e.g. blocked on school Wi-Fi).
function showFirebaseLoadError(){
  const wall = document.getElementById('auth-wall');
  if(!wall) return;
  wall.innerHTML =
    '<h1>Can’t reach the sign-in service</h1>' +
    '<p>The sign-in service couldn’t load on this network — a Wi-Fi or content filter may be blocking it. Try again or switch to a different network.</p>' +
    '<button class="btn-google" onclick="location.reload()">Try again</button>';
}
function signIn(){
  showAuthError('');
  // Pre-warm the Firestore SDK while the student is in the Google popup, so it's
  // ready to load progress the moment they're back. Errors are ignored — the
  // real load attempt (ensureDb) will surface any problem.
  loadFirestoreSdk().catch(()=>{});
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .catch(e=>{
      // The student just closed/cancelled the popup — not an error worth nagging about.
      if(e && (e.code==='auth/popup-closed-by-user' || e.code==='auth/cancelled-popup-request')) return;
      showAuthError('Sign-in didn’t work — make sure pop-ups are allowed and you’re using your school Google account, then try again.');
    });
}
function signOut(){ auth.signOut(); }

// Dev bypass is for local UI testing only. Only show/allow it when the site is
// running on localhost — never on the live (GitHub Pages) site.
const IS_LOCALHOST = ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
function devBypass(){
  if(!IS_LOCALHOST){ console.warn('Dev bypass is disabled outside localhost.'); return; }
  currentUser = {uid:'dev-user',displayName:'Dev User',email:'dev@test.local',photoURL:null};
  restoreLocalPlace();
  showApp(currentUser);
}
// Dev bypass never signs in to Firebase Auth, so Firestore rules reject any
// write under this uid — features that persist to Firestore (progress,
// skills, etc.) should hide their save affordance rather than let it silently fail.
function isDevBypassUser(){ return !!(currentUser && currentUser.uid==='dev-user'); }
if(IS_LOCALHOST){
  const _devBtn = document.getElementById('dev-bypass-btn');
  if(_devBtn) _devBtn.style.display='';
}

if(auth) auth.onAuthStateChanged(async user=>{
  if(user){
    currentUser = user;
    if(IS_TEACHER_MODE){ showTeacherApp(user); }
    else { await loadProgress(); await loadClassConfig(); showApp(user); }
  } else {
    currentUser = null; progress = {}; responses = {}; completed = {}; games = {}; gamesAccessOn = true;
    _moduleStripStates = {};   // next user's first strip render is a first paint, not a celebration
    document.getElementById('auth-wall').style.display='block';
    document.getElementById('app').style.display='none';
    document.getElementById('teacher-app').style.display='none';
    document.getElementById('teacher-denied').style.display='none';
    document.getElementById('fab-group').style.display='none';
    document.getElementById('user-area').innerHTML='<button class="btn-sign" onclick="signIn()">Sign in with Google</button>';
  }
});

function showApp(user){
  document.getElementById('auth-wall').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('fab-group').style.display='flex';
  document.getElementById('user-area').innerHTML=userHeaderHtml(user);
  renderAll();
  applyGamesAccess();
  maybeShowWelcome();
}

/* "Start here" onboarding card (Phase 5): shown once on first load only.
   localStorage may be unavailable in private mode — fall back to showing it. */
function maybeShowApp_gamesHash(){
  if(location.hash==='#games' && typeof openGamesScreen==='function') openGamesScreen();
}
function maybeShowWelcome(){
  let seen=false;
  try{ seen = localStorage.getItem('gc-welcomed')==='1'; }catch(e){}
  if(!seen) openWelcome();
}
function openWelcome(){
  const o=document.getElementById('welcome-overlay'); if(o) o.style.display='flex';
}
function dismissWelcome(){
  const o=document.getElementById('welcome-overlay'); if(o) o.style.display='none';
  try{ localStorage.setItem('gc-welcomed','1'); }catch(e){}
}

/* ── Firestore ── */
async function loadProgress(){
  try{
    await ensureDb();
    const doc = await db.collection('progress').doc(currentUser.uid).get();
    if(doc.exists){
      const raw = doc.data().skills||{};
      progress = {};
      Object.keys(raw).forEach(k=>{
        if(raw[k]===true) progress[k]='gotit';
        else if(raw[k]==='working'||raw[k]==='gotit') progress[k]=raw[k];
        else if(raw[k]==='1'||raw[k]==='2'||raw[k]==='3') progress[k]=raw[k];
        else if((k.endsWith('-reflection')||k.endsWith('-performance')) && raw[k] && typeof raw[k]==='object') progress[k]=raw[k];
        else progress[k]='none';
      });
      lastModuleNum = doc.data().lastModule||1;
      lastSetId     = doc.data().lastSet||null;
      responses     = doc.data().responses || {};
      completed     = doc.data().completed || {};
      games         = doc.data().games || {};
    } else { progress={}; lastModuleNum=1; lastSetId=null; responses={}; completed={}; games={}; restoreLocalPlace(); }
  } catch(e){ progress={}; lastModuleNum=1; lastSetId=null; responses={}; completed={}; games={}; restoreLocalPlace(); }
}

/* ── Games access (teacher-controlled) ──
   One class-config doc (config/class) holds the whole-class master switch
   (gamesEnabled) plus a per-student override map (gameOverrides: uid → bool).
   The effective answer for THIS student: an override wins if present, else the
   class master, else ON. Only the teacher writes this doc (teacher.js); every
   student reads it. Reads that fail (offline / rules) leave games ON so a
   connection hiccup never locks a student out of the arcade. */
async function loadClassConfig(){
  gamesAccessOn = true;
  try{
    await ensureDb();
    if(!db) return;
    const doc = await db.collection('config').doc('class').get();
    if(!doc.exists) return;
    const d = doc.data()||{};
    const ov = (d.gameOverrides||{})[currentUser.uid];
    if(ov===true)       gamesAccessOn = true;
    else if(ov===false) gamesAccessOn = false;
    else                gamesAccessOn = (d.gamesEnabled!==false);   // field absent ⇒ on
  }catch(e){ /* leave games on */ }
}
/* Show/hide the 🎮 Games button to match this student's access, and if games
   get turned off while the arcade is open, close it. */
function applyGamesAccess(){
  const btn = document.getElementById('games-btn');
  if(btn) btn.style.display = gamesAccessOn ? '' : 'none';
  if(!gamesAccessOn){
    const screen = document.getElementById('games-screen');
    if(screen && !screen.hasAttribute('hidden')){
      if(location.hash==='#games') location.hash='';
      if(typeof gamesClosePanel==='function') gamesClosePanel();
    }
  }
}

/* Last-place persistence (Session 4.4): Firestore is the source of truth, but
   we also stash the last module/set in localStorage so a returning student
   lands where they left off instantly — even before Firestore loads, on a
   flaky connection, or in dev-bypass mode. */
function restoreLocalPlace(){
  try{
    const m = parseInt(localStorage.getItem('gc-lastModule'));
    const s = localStorage.getItem('gc-lastSet');
    if(m) lastModuleNum = m;
    if(s) lastSetId = s;
  }catch(e){/* localStorage may be unavailable (private mode) — ignore */}
}
function saveLocalPlace(){
  try{
    localStorage.setItem('gc-lastModule', String(lastModuleNum||1));
    if(lastSetId) localStorage.setItem('gc-lastSet', lastSetId);
  }catch(e){/* ignore */}
}

function onResponseChange(key, value){
  responses[key] = value;
  saveResponses();
}
/* Graded in-step MC (factual, has answer:). Stores the choice TEXT (so the
   teacher dashboard reads it unchanged); recolors and reveals the explanation. */
function onStepMcSelect(key, btn){
  const choice = btn.dataset.choice;
  responses[key] = choice;
  saveResponses();
  const group = btn.closest('.step-mc-keyed');
  if(!group) return;
  group.classList.add('answered');
  group.querySelectorAll('.step-mc-opt').forEach(b=>b.classList.remove('correct','incorrect'));
  btn.classList.add(btn.dataset.correct === '1' ? 'correct' : 'incorrect');
}
/* ── Unified progress writer ──
   skills, last-place, responses, and completed all live in the SAME Firestore
   doc, so instead of three independent debounced writers (which could fire
   several near-simultaneous .set() calls), we mark which categories are dirty
   and flush them together in ONE write. The payload is built from live state at
   flush time, so it always sends the current values. saveProgress /
   saveResponses / saveCompleted are kept as named entry points (called from
   inline handlers and all over app.js). */
function queueSave(...keys){
  if(!currentUser) return;
  keys.forEach(k=>_dirtyKeys.add(k));
  if(_dirtyKeys.has('place')) saveLocalPlace();   // local mirror, immediate
  clearTimeout(saveTimer);
  setSaveMsg('Saving…');
  saveTimer = setTimeout(flushSave, 800);
}
async function flushSave(){
  if(!currentUser) return;
  const keys = _dirtyKeys; _dirtyKeys = new Set();
  if(!keys.size) return;
  const payload = { name:currentUser.displayName||'', email:currentUser.email||'' };
  if(keys.has('skills'))    payload.skills    = progress;
  if(keys.has('place')){    payload.lastModule = lastModuleNum; payload.lastSet = lastSetId||null; }
  if(keys.has('responses')) payload.responses = responses;
  if(keys.has('completed')) payload.completed = completed;
  if(keys.has('games'))     payload.games     = games;
  try{
    await ensureDb();
    await db.collection('progress').doc(currentUser.uid).set(payload,{merge:true});
    setSaveMsg('Saved ✓', 2000);
  } catch(e){
    keys.forEach(k=>_dirtyKeys.add(k));   // keep dirty so the next save retries
    setSaveMsg('Save failed — check connection');
  }
}
function saveResponses(){ queueSave('responses'); }

function onCompleteChange(key, isDone){
  if(isDone) completed[key] = true; else delete completed[key];
  saveCompleted();
}
function saveCompleted(){ queueSave('completed'); }
function saveGames(){ queueSave('games'); }   // per-game bests (games arcade, coach.js)

function saveProgress(){ queueSave('skills','place'); }
let _saveMsgT = null;
function setSaveMsg(msg, clearAfterMs){
  clearTimeout(_saveMsgT);
  document.querySelectorAll('.save-ind').forEach(el=>el.textContent=msg);
  if(clearAfterMs) _saveMsgT = setTimeout(()=>setSaveMsg(''), clearAfterMs);
}

/* ── Render ── */
let lastModuleNum = 1;
let lastSetId = null;

function renderAll(){ populateModuleDropdown(); onModuleChange(lastModuleNum||1, lastSetId); renderChordBoxes(); }

function chordDiagramSVG(cfg){
  const W=96,H=104,padL=22,padR=14,padT=20,padB=4;
  const NUM_FRETS=4;
  const boxW=W-padL-padR,boxH=H-padT-padB;
  const strGap=boxW/5,fretGap=boxH/NUM_FRETS;
  const pos=cfg.position||0,isOpen=pos===0;
  const dotR=Math.min(strGap,fretGap)*0.36;
  const ind={},chordArr=cfg.chord||[];
  chordArr.forEach(([s,fr,fg])=>{ind[s]={fret:fr,finger:fg};});
  let s=`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`;
  for(let n=6;n>=1;n--){
    const xi=6-n,x=padL+xi*strGap,st=ind[n];
    if(st){
      if(st.fret==='x') s+=`<text x="${x}" y="${padT-7}" text-anchor="middle" dominant-baseline="middle" font-size="11" fill="var(--text2)" font-family="sans-serif">×</text>`;
      else if(st.fret===0) s+=`<circle cx="${x}" cy="${padT-8}" r="3.2" fill="none" stroke="var(--text2)" stroke-width="1.1"/>`;
    }
    s+=`<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT+NUM_FRETS*fretGap}" stroke="var(--text3)" stroke-width="0.9"/>`;
  }
  if(isOpen) s+=`<rect x="${padL-1}" y="${padT-2.5}" width="${boxW+2}" height="3" fill="var(--text)" rx="1"/>`;
  else s+=`<text x="${padL-5}" y="${padT+fretGap*0.55}" text-anchor="end" dominant-baseline="middle" font-size="9" fill="var(--text2)" font-family="sans-serif">${pos}fr</text>`;
  for(let f=1;f<=NUM_FRETS;f++){
    const y=padT+f*fretGap;
    s+=`<line x1="${padL}" y1="${y}" x2="${padL+boxW}" y2="${y}" stroke="var(--text3)" stroke-width="0.8"/>`;
  }
  chordArr.forEach(([n,fr,fg])=>{
    if(typeof fr!=='number'||fr<=0) return;
    const row=isOpen?fr:(fr-pos+1);
    if(row<1||row>NUM_FRETS) return;
    const xi=6-n,cx=padL+xi*strGap,cy=padT+(row-0.5)*fretGap;
    s+=`<circle cx="${cx}" cy="${cy}" r="${dotR}" fill="var(--text)"/>`;
    if(fg!=null&&fg!=='') s+=`<text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="central" font-size="9" font-weight="600" fill="var(--bg)" font-family="-apple-system,sans-serif">${fg}</text>`;
  });
  return s+'</svg>';
}
function renderChordBoxes(){} /* legacy no-op — diagrams now render inline */

/* ══════════════════════════════════════════════
   AUTO CHORD LINKS — scan step text for chord
   names, wrap them in clickable spans that load
   a chord diagram in the resource panel.
   ══════════════════════════════════════════════ */
/* Local chord-shape library — fed into chordDiagramSVG() so diagrams
   render from the project itself, no external image service required.
   Format per entry: { position, chord:[[stringNum, fret, finger], …] }
   string 6 = low E, 1 = high E   ·   fret 'x' = mute, 0 = open */
const CHORD_DIAGRAMS = {
  'E'  : { position:0, chord:[[6,0,0],[5,2,2],[4,2,3],[3,1,1],[2,0,0],[1,0,0]] },
  'Em' : { position:0, chord:[[6,0,0],[5,2,2],[4,2,3],[3,0,0],[2,0,0],[1,0,0]] },
  'A'  : { position:0, chord:[[6,'x',''],[5,0,0],[4,2,1],[3,2,2],[2,2,3],[1,0,0]] },
  'Am' : { position:0, chord:[[6,'x',''],[5,0,0],[4,2,2],[3,2,3],[2,1,1],[1,0,0]] },
  'D'  : { position:0, chord:[[6,'x',''],[5,'x',''],[4,0,0],[3,2,1],[2,3,3],[1,2,2]] },
  'Dm' : { position:0, chord:[[6,'x',''],[5,'x',''],[4,0,0],[3,2,2],[2,3,3],[1,1,1]] },
  'G'  : { position:0, chord:[[6,3,2],[5,2,1],[4,0,0],[3,0,0],[2,0,0],[1,3,3]] },
  'C'  : { position:0, chord:[[6,'x',''],[5,3,3],[4,2,2],[3,0,0],[2,1,1],[1,0,0]] },
  'F'  : { position:0, chord:[[6,'x',''],[5,'x',''],[4,3,3],[3,2,2],[2,1,1],[1,1,1]] },
  /* Bm / F#m / C#m: partial-barre (beginner) shapes — these are what Modules 5–6
     teach. Module 7 (barre chords) skips these auto-link pop-ups entirely (see
     wrapChordLinksIn) and renders full-barre shapes inline instead. */
  'Bm' : { position:2, chord:[[6,'x',''],[5,'x',''],[4,4,4],[3,4,3],[2,3,2],[1,2,1]] },
  'B7' : { position:0, chord:[[6,'x',''],[5,2,2],[4,1,1],[3,2,3],[2,0,0],[1,2,4]] },
  'F#m': { position:2, chord:[[6,'x',''],[5,'x',''],[4,4,3],[3,2,1],[2,2,1],[1,2,1]] },
  'C#m': { position:4, chord:[[6,'x',''],[5,'x',''],[4,6,4],[3,6,3],[2,5,2],[1,4,1]] },
  'E5' : { position:0, chord:[[6,0,0],[5,2,3],[4,'x',''],[3,'x',''],[2,'x',''],[1,'x','']] },
  'G5' : { position:3, chord:[[6,3,1],[5,5,3],[4,'x',''],[3,'x',''],[2,'x',''],[1,'x','']] },
  'A5' : { position:5, chord:[[6,5,1],[5,7,3],[4,'x',''],[3,'x',''],[2,'x',''],[1,'x','']] },
  'C5' : { position:3, chord:[[6,'x',''],[5,3,1],[4,5,3],[3,'x',''],[2,'x',''],[1,'x','']] },
  'D5' : { position:5, chord:[[6,'x',''],[5,5,1],[4,7,3],[3,'x',''],[2,'x',''],[1,'x','']] }
};
/* Strip the SVG's fixed width/height so it scales to its container via viewBox */
function localChordSvg(chord){
  const cfg = CHORD_DIAGRAMS[chord];
  if (!cfg) return null;
  return chordDiagramSVG(cfg).replace(/width="\d+"\s+height="\d+"/, '');
}

/* MIDI base for each open string (1 = high E … 6 = low E). Adding the
   fret number gives the MIDI pitch for that fretted note. */
const STRING_OPEN_MIDI = { 6:40, 5:45, 4:50, 3:55, 2:59, 1:64 };

/* Given a chord name from CHORD_DIAGRAMS, return the MIDI pitch list
   in low→high order (string 6 to string 1), skipping muted ('x') strings. */
function chordSpecMidis(chordArr){
  return (chordArr || [])
    .slice()
    .sort((a, b) => b[0] - a[0])
    .filter(([, fret]) => fret !== 'x' && fret != null)
    .map(([str, fret]) => STRING_OPEN_MIDI[str] + Number(fret));
}
function chordMidis(chordName){
  const cfg = CHORD_DIAGRAMS[chordName];
  return cfg ? chordSpecMidis(cfg.chord) : [];
}

/* Strum a chord one string at a time. ~35ms between strings approximates
   a moderate downstrum. btnEl, when supplied, gets a brief 'playing' class. */
let chordStrumTimeouts = [];
function strumChord(chordName, btnEl){
  if(window.coachMicLive) return;  // demo audio would score itself while the Coach listens
  chordStrumTimeouts.forEach(clearTimeout);
  chordStrumTimeouts = [];
  const midis = chordMidis(chordName);
  if (!midis.length) return;
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const stepMs = 35;
  midis.forEach((m, i) => {
    chordStrumTimeouts.push(setTimeout(() => playNote(m), i * stepMs));
  });
  if (btnEl){
    btnEl.classList.add('playing');
    chordStrumTimeouts.push(setTimeout(() => btnEl.classList.remove('playing'), midis.length * stepMs + 200));
  }
}

/* Single-string diagrams — one open string, the others muted. Reused via
   the same chordDiagramSVG renderer for consistency. */
const STRING_DIAGRAMS = {
  'lowE' : { position:0, chord:[[6,0,0],[5,'x',''],[4,'x',''],[3,'x',''],[2,'x',''],[1,'x','']] },
  'A'    : { position:0, chord:[[6,'x',''],[5,0,0],[4,'x',''],[3,'x',''],[2,'x',''],[1,'x','']] },
  'D'    : { position:0, chord:[[6,'x',''],[5,'x',''],[4,0,0],[3,'x',''],[2,'x',''],[1,'x','']] },
  'G'    : { position:0, chord:[[6,'x',''],[5,'x',''],[4,'x',''],[3,0,0],[2,'x',''],[1,'x','']] },
  'B'    : { position:0, chord:[[6,'x',''],[5,'x',''],[4,'x',''],[3,'x',''],[2,0,0],[1,'x','']] },
  'highE': { position:0, chord:[[6,'x',''],[5,'x',''],[4,'x',''],[3,'x',''],[2,'x',''],[1,0,0]] }
};
const STRING_LABELS = {
  'lowE' : 'Low E (6th string)',
  'A'    : 'A (5th string)',
  'D'    : 'D (4th string)',
  'G'    : 'G (3rd string)',
  'B'    : 'B (2nd string)',
  'highE': 'High E (1st string)'
};
function localStringSvg(kind){
  const cfg = STRING_DIAGRAMS[kind];
  if (!cfg) return null;
  return chordDiagramSVG(cfg).replace(/width="\d+"\s+height="\d+"/, '');
}

/* Horizontal fretboard view of a single string. Used for string-link
   popups + the resource panel — visually distinct from the vertical
   chord-box, so students can tell at a glance that the reference is
   a STRING, not a chord shape. The target string is drawn thicker
   and colored; the other 5 strings are faint context. */
function localStringFretboardSvg(kind){
  const sNum = STRING_KIND_TO_NUM[kind];
  if (!sNum) return null;
  const W = 280, H = 80;
  const padL = 36, padR = 10, padT = 7, padB = 16;
  const openW = 16;
  const maxFret = 12;
  const fretAreaW = W - padL - padR - openW;
  const fretW = fretAreaW / maxFret;
  const boxH = H - padT - padB;
  const strGap = boxH / 5;
  const nutX = padL + openW;
  const fretX = f => nutX + f * fretW;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">`;

  /* Inlay dots */
  FRETBOARD_INLAYS.forEach(f => {
    const cx = nutX + (f - 0.5) * fretW;
    const cy = padT + boxH / 2;
    s += `<circle cx="${cx}" cy="${cy}" r="2" fill="var(--text3)" opacity="0.35"/>`;
    if (f === 12) {
      s += `<circle cx="${cx}" cy="${cy - 8}" r="2" fill="var(--text3)" opacity="0.35"/>`;
      s += `<circle cx="${cx}" cy="${cy + 8}" r="2" fill="var(--text3)" opacity="0.35"/>`;
    }
  });

  /* Fret wires */
  for (let f = 1; f <= maxFret; f++) {
    const x = fretX(f);
    s += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + boxH}" stroke="var(--text3)" stroke-width="0.7"/>`;
  }
  /* Nut */
  s += `<rect x="${nutX - 1.5}" y="${padT - 1.5}" width="3" height="${boxH + 3}" fill="var(--text)" rx="0.5"/>`;

  /* Strings + labels. Target string drawn thicker + green to match
     the .string-link accent colour. */
  for (let n = 1; n <= 6; n++) {
    const y = padT + (n - 1) * strGap;
    const isTarget = n === sNum;
    const stroke = isTarget ? 'var(--green-text)' : 'var(--text3)';
    const sw = isTarget ? 2 : 0.7;
    s += `<line x1="${padL}" y1="${y}" x2="${fretX(maxFret)}" y2="${y}" stroke="${stroke}" stroke-width="${sw}"/>`;
    const labelColor = isTarget ? 'var(--green-text)' : 'var(--text2)';
    const labelWeight = isTarget ? '600' : '400';
    s += `<text x="${padL - 5}" y="${y}" text-anchor="end" dominant-baseline="central" font-size="8" font-weight="${labelWeight}" fill="${labelColor}">${STRING_NUM_TO_LABEL[n]}</text>`;
  }

  /* Open-string indicator: a small circle to the left of the nut on the target string */
  const targetY = padT + (sNum - 1) * strGap;
  const openX = padL + openW / 2;
  s += `<circle cx="${openX}" cy="${targetY}" r="4.5" fill="none" stroke="var(--green-text)" stroke-width="1.5"/>`;

  /* Fret numbers below */
  for (let f = 0; f <= maxFret; f++) {
    const cx = f === 0 ? openX : nutX + (f - 0.5) * fretW;
    s += `<text x="${cx}" y="${padT + boxH + 10}" text-anchor="middle" font-size="7.5" fill="var(--text2)">${f}</text>`;
  }

  return s + '</svg>';
}

/* Single-note diagrams — one fretted (or open) note shown on a
   horizontal fretboard view. Strings drawn top→bottom: high E (top)
   to low E (bottom), matching the standard view when looking at your
   guitar. Open notes sit to the LEFT of the nut. */
const STRING_KIND_TO_NUM = { lowE:6, A:5, D:4, G:3, B:2, highE:1 };
const STRING_SHORT_LABEL = { lowE:'low E', A:'A', D:'D', G:'G', B:'B', highE:'high E' };
const STRING_NUM_TO_LABEL = { 1:'high E', 2:'B', 3:'G', 4:'D', 5:'A', 6:'low E' };
const FRETBOARD_INLAYS = [3, 5, 7, 9, 12];
function ordinal(n){
  const s = ['th','st','nd','rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function noteFullLabel(note, fret, kind){
  const str = STRING_SHORT_LABEL[kind] || kind;
  return fret === 0 ? `${note} · ${str} open` : `${note} · ${str} string, ${ordinal(fret)} fret`;
}
function localNoteSvg(kind, fret, note){
  const sNum = STRING_KIND_TO_NUM[kind];
  if (!sNum) return null;
  const fr = Number(fret);
  if (isNaN(fr) || fr < 0) return null;

  const W = 280, H = 80;
  const padL = 36, padR = 10, padT = 7, padB = 16;
  const openW = 16;
  const maxFret = Math.max(8, fr + 1);
  const fretAreaW = W - padL - padR - openW;
  const fretW = fretAreaW / maxFret;
  const boxH = H - padT - padB;
  const strGap = boxH / 5;
  const nutX = padL + openW;
  const fretX = f => nutX + f * fretW;

  let s = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">`;

  /* Inlay dots between fret wires (standard guitar inlay positions) */
  FRETBOARD_INLAYS.filter(f => f <= maxFret).forEach(f => {
    const cx = nutX + (f - 0.5) * fretW;
    const cy = padT + boxH / 2;
    s += `<circle cx="${cx}" cy="${cy}" r="2" fill="var(--text3)" opacity="0.35"/>`;
    if (f === 12) {
      s += `<circle cx="${cx}" cy="${cy - 8}" r="2" fill="var(--text3)" opacity="0.35"/>`;
      s += `<circle cx="${cx}" cy="${cy + 8}" r="2" fill="var(--text3)" opacity="0.35"/>`;
    }
  });

  /* Fret wires */
  for (let f = 1; f <= maxFret; f++) {
    const x = fretX(f);
    s += `<line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + boxH}" stroke="var(--text3)" stroke-width="0.7"/>`;
  }
  /* Nut */
  s += `<rect x="${nutX - 1.5}" y="${padT - 1.5}" width="3" height="${boxH + 3}" fill="var(--text)" rx="0.5"/>`;

  /* Strings + labels */
  for (let n = 1; n <= 6; n++) {
    const y = padT + (n - 1) * strGap;
    s += `<line x1="${padL}" y1="${y}" x2="${fretX(maxFret)}" y2="${y}" stroke="var(--text3)" stroke-width="0.7"/>`;
    s += `<text x="${padL - 5}" y="${y}" text-anchor="end" dominant-baseline="central" font-size="8" fill="var(--text2)">${STRING_NUM_TO_LABEL[n]}</text>`;
  }

  /* Fret numbers below */
  for (let f = 0; f <= maxFret; f++) {
    const cx = f === 0 ? padL + openW / 2 : nutX + (f - 0.5) * fretW;
    s += `<text x="${cx}" y="${padT + boxH + 10}" text-anchor="middle" font-size="7.5" fill="var(--text2)">${f}</text>`;
  }

  /* Target note dot — filled for fretted notes, hollow (outline) for open strings */
  const targetY = padT + (sNum - 1) * strGap;
  const targetX = fr === 0 ? padL + openW / 2 : nutX + (fr - 0.5) * fretW;
  const isOpenNote = fr === 0;
  if (isOpenNote) {
    s += `<circle cx="${targetX}" cy="${targetY}" r="6.5" fill="none" stroke="var(--text)" stroke-width="1.4"/>`;
  } else {
    s += `<circle cx="${targetX}" cy="${targetY}" r="6.5" fill="var(--text)"/>`;
  }
  if (note) {
    const textFill = isOpenNote ? 'var(--text)' : 'var(--bg)';
    s += `<text x="${targetX}" y="${targetY}" text-anchor="middle" dominant-baseline="central" font-size="7.5" font-weight="600" fill="${textFill}">${escHtml(note)}</text>`;
  }

  return s + '</svg>';
}

/* ── Inline TAB renderer ──
   spec = { caption, notes: [{ string, fret, note, midi }, ...] }
     OR  { caption, phrases: [{ label, notes: [...] }, ...] }
   string is the TAB label: 'e' (high), 'B', 'G', 'D', 'A', 'E' (low).
   Renders all 6 string lines so students see real TAB layout, with
   fret numbers placed on the relevant string and a row of clickable
   note-name buttons below that play the corresponding pitch. */
const TAB_STRINGS = ['e','B','G','D','A','E'];
function renderTabBlock(notes, seqOffset){
  if (!notes || !notes.length) return '';
  const off = seqOffset || 0;   // sequential index across phrases — the beat cursor's address
  const cols = notes.length;
  const rows = TAB_STRINGS.map(strLabel => {
    const cells = [`<div class="tab-str-label">${strLabel}</div>`];
    notes.forEach((n, ci) => {
      let fret;
      if (Array.isArray(n.frets)) {
        const hit = n.frets.find(([s]) => s === strLabel);
        if (hit) fret = hit[1];
      } else if (n.string === strLabel) {
        fret = n.fret;
      }
      if (fret !== undefined) {
        cells.push(`<div class="tab-cell" data-seq="${off + ci}"><span class="tab-fret">${escHtml(String(fret))}</span></div>`);
      } else {
        cells.push(`<div class="tab-cell" data-seq="${off + ci}"></div>`);
      }
    });
    return cells.join('');
  }).join('');
  const noteBtns = ['<div></div>'];
  notes.forEach((n, ci) => {
    const midis = (Array.isArray(n.midi) ? n.midi : [n.midi]).map(Number);
    const midisAttr = escAttr(JSON.stringify(midis));
    noteBtns.push(`<button type="button" class="tab-note-btn" data-seq="${off + ci}" data-midis="${midisAttr}" onclick="playBeat(this)" title="Play ${escAttr(n.note)}">${escHtml(n.note)}<span class="tab-spkr">&#x1F50A;</span></button>`);
  });
  return `
    <div class="tab-board">
      <div class="tab-grid" style="grid-template-columns:22px repeat(${cols},30px)">
        ${rows}
        ${noteBtns.join('')}
      </div>
    </div>`;
}
function buildTab(spec, opts){
  if (!spec) return '';
  const keyPrefix = (opts && opts.keyPrefix) || '';
  /* Header title: prefer explicit title; otherwise use caption as the header.
     If both are present and distinct, caption stays in the body. */
  const headTitle = spec.title || spec.caption || 'Tab';
  const showCaptionInBody = !!spec.title && !!spec.caption && spec.title !== spec.caption;
  const headHtml = `<div class="tab-head"><span class="tab-icon">&#x1F3B8;</span><span class="tab-title">${escHtml(headTitle)}</span><span class="tab-kind">Tab</span></div>`;
  const captionHtml = showCaptionInBody ? `<div class="tab-caption">${escHtml(spec.caption)}</div>` : '';
  /* Collect all midis (across phrases if any) so the tab play-all walks the whole melody. */
  let allMidis = [];
  if (spec.phrases && spec.phrases.length) {
    spec.phrases.forEach(p => {
      if (p.notes && p.notes.length) allMidis = allMidis.concat(
        p.notes.map(n => Array.isArray(n.midi) ? n.midi.map(Number) : Number(n.midi))
      );
    });
  } else if (spec.notes && spec.notes.length) {
    allMidis = spec.notes.map(n => Array.isArray(n.midi) ? n.midi.map(Number) : Number(n.midi));
  }
  let controlsHtml = '';
  if (allMidis.length && keyPrefix) {
    const defBpm = spec.bpm || 60;
    const minBpm = spec.minBpm || 40;
    const maxBpm = spec.maxBpm || 120;
    const bpm = readStoredBpm(keyPrefix, defBpm);
    const midisAttr = JSON.stringify(allMidis);
    /* The coach card shows this tab's exact fingering: collect the notes
       (across phrases if any) in the same order as allMidis. */
    let allTabNotes = [];
    if (spec.phrases && spec.phrases.length) spec.phrases.forEach(p => { if (p.notes) allTabNotes = allTabNotes.concat(p.notes); });
    else if (spec.notes) allTabNotes = spec.notes.slice();
    const tabNotesJson = JSON.stringify(allTabNotes.map(n =>
      n.frets ? { frets: n.frets, note: n.note, midi: n.midi }
              : { string: n.string, fret: n.fret, note: n.note, midi: n.midi }));
    controlsHtml = `<div class="tab-controls"><span class="bpm-control-group">` +
      `<button type="button" class="play-seq-btn" data-midis="${escAttr(midisAttr)}" onclick="playSequenceFromGroup(this)" title="Play this tab">&#x25B6; Play tab</button>` +
      renderBpmControl(keyPrefix, bpm, minBpm, maxBpm) +
      // noCoach: tabs with slurred notes (hammer-ons/pull-offs) aren't
      // one-pick-per-note, so a mic check would fail correct technique.
      (spec.noCoach ? '' : coachBtnHtml(midisAttr, tabNotesJson)) +
      `</span></div>`;
  }
  if (spec.phrases && spec.phrases.length) {
    let seqOff = 0;
    const blocks = spec.phrases.map(p => {
      const block = `
      <div class="tab-phrase">
        ${p.label ? `<div class="tab-phrase-label">${escHtml(p.label)}</div>` : ''}
        ${renderTabBlock(p.notes, seqOff)}
      </div>`;
      seqOff += (p.notes || []).length;
      return block;
    }).join('');
    return `<div class="tab">${headHtml}<div class="tab-body">${captionHtml}${controlsHtml}${blocks}</div></div>`;
  }
  const body = renderTabBlock(spec.notes);
  if (!body) return '';
  return `<div class="tab">${headHtml}<div class="tab-body">${captionHtml}${controlsHtml}${body}</div></div>`;
}

function toggleTabChoice(btn){
  const expanded = btn.classList.toggle('expanded');
  const content = btn.nextElementSibling;
  if (content && content.classList.contains('tab-choice-content')){
    content.classList.toggle('expanded', expanded);
  }
}

/* String reference patterns:
   - "low E" / "high E" (case-insensitive on low/high, captures both as one unit)
   - A letter or list of letters followed by "string"/"strings", e.g.
     "E string", "E and A strings", "E, A, and D strings"
   Letters E/A/D/G/B are case-sensitive (uppercase) to match how
   teachers write them in the modules. */
const STR_SEP = '(?:\\s*(?:,|&|\\band\\b|\\bor\\b)\\s*)+';
const STRING_PHRASE_RE_SRC = '\\b[EADGB](?:' + STR_SEP + '[EADGB])*(?:\\s+|-)strings?\\b';
const LOWHIGH_E_RE_SRC = '\\b(low|high)\\s+E\\b';
/* Standard tuning notation "E A D G B e" — six string names in order with
   lowercase e for the high E. Separators can be spaces, commas, or "·". */
const TUNING_SEP = '[\\s·,]+';
const TUNING_RE_SRC = '\\bE' + TUNING_SEP + 'A' + TUNING_SEP + 'D' + TUNING_SEP + 'G' + TUNING_SEP + 'B' + TUNING_SEP + 'e\\b';
const TUNING_LETTER_KIND = { E:'lowE', A:'A', D:'D', G:'G', B:'B', e:'highE' };

function findStringMatches(text){
  const matches = [];
  let m;

  const re1 = new RegExp(LOWHIGH_E_RE_SRC, 'gi');
  while ((m = re1.exec(text)) !== null) {
    const kind = m[1].toLowerCase() === 'low' ? 'lowE' : 'highE';
    matches.push({ start: m.index, end: m.index + m[0].length, kind });
  }

  const re2 = new RegExp(STRING_PHRASE_RE_SRC, 'gi');
  while ((m = re2.exec(text)) !== null) {
    const phraseStart = m.index;
    const phrase = m[0];
    const letterRe = /[EADGB]/g; // case-sensitive — only uppercase
    let lm;
    while ((lm = letterRe.exec(phrase)) !== null) {
      const letter = lm[0];
      const absStart = phraseStart + lm.index;
      /* Skip if already covered by a "low E" / "high E" phrase */
      if (matches.some(x => x.start <= absStart && absStart < x.end)) continue;
      const kind = letter === 'E' ? 'lowE' : letter; // ambiguous "E string" defaults to low E
      matches.push({ start: absStart, end: absStart + 1, kind });
    }
  }

  const re3 = new RegExp(TUNING_RE_SRC, 'g');
  while ((m = re3.exec(text)) !== null) {
    const phraseStart = m.index;
    const phrase = m[0];
    const letterRe = /[EADGBe]/g;
    let lm;
    while ((lm = letterRe.exec(phrase)) !== null) {
      const absStart = phraseStart + lm.index;
      if (matches.some(x => x.start <= absStart && absStart < x.end)) continue;
      matches.push({ start: absStart, end: absStart + 1, kind: TUNING_LETTER_KIND[lm[0]] });
    }
  }

  matches.sort((a,b) => a.start - b.start);
  const dedup = [];
  let lastEnd = -1;
  matches.forEach(x => {
    if (x.start >= lastEnd) { dedup.push(x); lastEnd = x.end; }
  });
  return dedup;
}

/* Longest names first so the alternation matches them before the 1-char names */
const CHORD_NAMES = ['F#m','C#m','Em','Am','Dm','Bm','B7','A5','E5','G5','D5','C5','C','G','D','A','E','F'];
const CHORD_RE = new RegExp('(^|[^A-Za-z0-9#])(' + CHORD_NAMES.join('|') + ')(?![A-Za-z0-9#])(?![ -][Ss]hape)(?![ -][Mm]inor)(?![ -][Pp]entatonic)(?![ -][Ss]cale)(?![ -][Mm]ajor[ -](?:pentatonic|scale))', 'g');
const CHORD_SKIP_TAGS = new Set(['A','BUTTON','SCRIPT','STYLE','TEXTAREA','INPUT','LABEL','SELECT']);
const CHORD_SKIP_CLASSES = ['skill-badge','chord-link','string-link','note-link','rp-trigger','chord-box-label','chord-diagrams','step-resp-mc-opt','tab','nolink'];

/* Natural-note fret positions on each string (frets 0–12). Used to
   auto-map sequences like "E · F · G · A · B · C · D · E" to single-note
   popups, with each letter landing on its actual fret on the contextual
   string. Positions are listed low→high so a walking sequence picks the
   next available fret above the previous one. */
const STRING_NOTE_FRETS = {
  lowE:  { E:[0,12], F:[1], G:[3], A:[5], B:[7], C:[8], D:[10] },
  A:     { A:[0,12], B:[2], C:[3], D:[5], E:[7], F:[8], G:[10] },
  D:     { D:[0,12], E:[2], F:[3], G:[5], A:[7], B:[9], C:[10] },
  G:     { G:[0,12], A:[2], B:[4], C:[5], D:[7], E:[9], F:[10] },
  B:     { B:[0,12], C:[1], D:[3], E:[5], F:[6], G:[8], A:[10] },
  highE: { E:[0,12], F:[1], G:[3], A:[5], B:[7], C:[8], D:[10] }
};

/* Sequence of 3+ standalone natural-note letters joined by " · " (middle dot).
   The lookarounds keep "G · Down-up" or chord names like "Am" from matching. */
const NOTE_SEQ_RE = /(?<![A-Za-z0-9])[A-G](?:\s*[·•]\s*[A-G](?![A-Za-z0-9])){2,}/g;
function findNoteSequenceMatches(text, stringMatches){
  const out = [];
  const re = new RegExp(NOTE_SEQ_RE.source, 'g');
  let m;
  while ((m = re.exec(text)) !== null) {
    const seqStart = m.index;
    const ctx = stringMatches
      .filter(s => s.end <= seqStart)
      .sort((a, b) => b.end - a.end)[0];
    if (!ctx) continue;
    const fretMap = STRING_NOTE_FRETS[ctx.kind];
    if (!fretMap) continue;
    let lastFret = -1;
    const letterRe = /[A-G]/g;
    let lm;
    while ((lm = letterRe.exec(m[0])) !== null) {
      const letter = lm[0];
      const positions = fretMap[letter];
      if (!positions) continue;
      const fret = positions.find(p => p > lastFret);
      if (fret === undefined) continue;
      out.push({
        start: seqStart + lm.index,
        end:   seqStart + lm.index + 1,
        kind:  ctx.kind,
        fret,
        note:  letter
      });
      lastFret = fret;
    }
  }
  return out;
}

/* Single-note references: "1st fret (F)", "5th fret (A)", "open (E)" etc.
   The letter inside parens is the NOTE — not a chord. We use the most
   recent string reference earlier in the same text as the string context. */
const NOTE_CTX_RE = /\b(?:(\d+)(?:st|nd|rd|th)?\s+fret|(open))\s*\(\s*([A-G][#b]?)\s*\)/gi;
function findNoteMatches(text, stringMatches){
  const out = [];
  const re = new RegExp(NOTE_CTX_RE.source, 'gi');
  let m;
  while ((m = re.exec(text)) !== null) {
    const fret = m[2] ? 0 : parseInt(m[1], 10);
    const note = m[3];
    /* Wrap just the note letter inside the parens, not the whole "Nth fret" phrase */
    const innerStart = m.index + m[0].indexOf(note, m[0].lastIndexOf('('));
    const innerEnd = innerStart + note.length;
    /* Find most recent string reference ending before this match */
    const ctx = stringMatches
      .filter(s => s.end <= m.index)
      .sort((a, b) => b.end - a.end)[0];
    if (!ctx) {
      /* No string context — still record so chord-detection skips this letter,
         but mark kind=null so we render plain text rather than the wrong chord. */
      out.push({ start: innerStart, end: innerEnd, kind: null, fret, note });
    } else {
      out.push({ start: innerStart, end: innerEnd, kind: ctx.kind, fret, note });
    }
  }
  return out;
}

/* Distinguish the grammatical article "A" ("A guitar…", "A hard strum…")
   from the chord/note A. The indefinite article only capitalises at the
   START of a sentence and is always followed by a lowercase word, whereas
   musical "A" refs sit mid-sentence ("switch to A in time", "F · G · A
   roots", "the A blues scale", "→A"). We keep "A major" linked since that's
   a real chord. */
function isIndefiniteArticleA(text, start, end){
  const after = text.slice(end).match(/^\s+([a-z]+)/);
  if (!after) return false;                 // followed by punctuation/capital/arrow → chord
  if (/^maj(or)?$/.test(after[1])) return false;  // "A major" is a chord, keep it
  const before = text.slice(0, start).replace(/\s+$/, '');
  return before === '' || /[.!?:;]$/.test(before);  // only at a sentence boundary
}

function wrapChordLinksIn(rootEl){
  if (!rootEl) return;
  /* Module 7 (barre chords): each step already shows accurate inline chord
     diagrams, and the shared chord library renders OPEN shapes that don't match
     the barre lesson — so skip all auto-link pop-ups inside Module 7 panels. */
  if (rootEl.closest && rootEl.closest('.week-panel[data-module="7"]')) return;
  const walker = document.createTreeWalker(rootEl, NodeFilter.SHOW_TEXT, {
    acceptNode(node){
      if (!node.nodeValue || !/[A-G]/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      let p = node.parentNode;
      while (p && p !== rootEl) {
        if (CHORD_SKIP_TAGS.has(p.tagName)) return NodeFilter.FILTER_REJECT;
        if (p.classList && CHORD_SKIP_CLASSES.some(c => p.classList.contains(c))) return NodeFilter.FILTER_REJECT;
        p = p.parentNode;
      }
      return NodeFilter.FILTER_ACCEPT;
    }
  });
  const textNodes = [];
  let n;
  while ((n = walker.nextNode())) textNodes.push(n);

  textNodes.forEach(node => {
    const text = node.nodeValue;

    /* String references first — they take priority over chord matches */
    const stringMatches = findStringMatches(text);

    /* Note references — "1st fret (F)", "open (E)" with string context */
    const noteMatches = findNoteMatches(text, stringMatches);

    /* Bare note sequences — "E · F · G · A · B · C · D · E" with string context */
    const noteSeqMatches = findNoteSequenceMatches(text, stringMatches);
    noteSeqMatches.forEach(x => noteMatches.push(x));

    /* Chord matches — skip any that overlap a string or note match */
    const chordMatches = [];
    const re = new RegExp(CHORD_RE.source, 'g');
    let m;
    while ((m = re.exec(text)) !== null) {
      const prefix = m[1], chord = m[2];
      const start = m.index + prefix.length;
      const end = start + chord.length;
      if (stringMatches.some(s => s.start < end && start < s.end)) continue;
      if (noteMatches.some(s => s.start < end && start < s.end)) continue;
      if (chord === 'A' && isIndefiniteArticleA(text, start, end)) continue;
      chordMatches.push({ start, end, chord });
    }

    if (!stringMatches.length && !chordMatches.length && !noteMatches.length) return;

    const all = [
      ...stringMatches.map(x => ({ start:x.start, end:x.end, type:'string', kind:x.kind })),
      ...noteMatches.filter(x => x.kind).map(x => ({ start:x.start, end:x.end, type:'note', kind:x.kind, fret:x.fret, note:x.note })),
      ...chordMatches.map(x => ({ start:x.start, end:x.end, type:'chord',  chord:x.chord }))
    ].sort((a,b) => a.start - b.start);

    const frag = document.createDocumentFragment();
    let cursor = 0;
    all.forEach(item => {
      if (item.start > cursor) frag.appendChild(document.createTextNode(text.slice(cursor, item.start)));
      const span = document.createElement('span');
      if (item.type === 'string') {
        span.className = 'string-link';
        span.dataset.string = item.kind;
        span.textContent = text.slice(item.start, item.end);
        span.addEventListener('click', onStringLinkClick);
        span.addEventListener('mouseenter', onStringLinkHover);
        span.addEventListener('mouseleave', hideChordPopup);
      } else if (item.type === 'note') {
        span.className = 'note-link';
        span.dataset.string = item.kind;
        span.dataset.fret = String(item.fret);
        span.dataset.note = item.note;
        span.textContent = text.slice(item.start, item.end);
        span.addEventListener('click', onNoteLinkClick);
        span.addEventListener('mouseenter', onNoteLinkHover);
        span.addEventListener('mouseleave', hideChordPopup);
      } else {
        span.className = 'chord-link';
        span.dataset.chord = item.chord;
        span.textContent = item.chord;
        span.addEventListener('click', onChordLinkClick);
        span.addEventListener('mouseenter', onChordLinkHover);
        span.addEventListener('mouseleave', hideChordPopup);
      }
      frag.appendChild(span);
      cursor = item.end;
    });
    if (cursor < text.length) frag.appendChild(document.createTextNode(text.slice(cursor)));
    node.parentNode.replaceChild(frag, node);
  });
}

function onChordLinkClick(e){
  e.preventDefault(); e.stopPropagation();
  const chord = this.dataset.chord;
  if (!chord) return;
  hideChordPopup();
  /* For chord type, the 2nd arg carries the chord NAME (loadPanel renders it locally) */
  loadPanel('chord', chord, chord, 'Guitar chord diagram');
}

/* Floating hover preview — one shared popup element reused for every link */
let chordPopupEl = null;
function ensureChordPopup(){
  if (chordPopupEl) return chordPopupEl;
  chordPopupEl = document.createElement('div');
  chordPopupEl.className = 'chord-popup';
  document.body.appendChild(chordPopupEl);
  return chordPopupEl;
}
function positionChordPopup(popup, linkEl){
  const rect = linkEl.getBoundingClientRect();
  const popW = popup.offsetWidth || 220;
  const popH = popup.offsetHeight || 220;
  let left = rect.left + window.scrollX + (rect.width / 2) - (popW / 2);
  let top  = rect.bottom + window.scrollY + 6;
  left = Math.max(8, Math.min(left, window.scrollX + window.innerWidth - popW - 8));
  /* Flip above the link if there isn't room below */
  if (rect.bottom + popH + 12 > window.innerHeight) {
    top = rect.top + window.scrollY - popH - 6;
  }
  popup.style.left = left + 'px';
  popup.style.top  = top  + 'px';
}
function onChordLinkHover(){
  const chord = this.dataset.chord;
  if (!chord) return;
  const popup = ensureChordPopup();
  const svg = localChordSvg(chord);
  if (!svg) return;
  popup.classList.remove('wide');
  popup.innerHTML = `<div class="chord-popup-name">${chord}</div><div class="chord-popup-svg">${svg}</div><div class="chord-popup-hint">Click to open</div>`;
  popup.classList.add('visible');
  positionChordPopup(popup, this);
}
function onStringLinkClick(e){
  e.preventDefault(); e.stopPropagation();
  const kind = this.dataset.string;
  if (!kind) return;
  hideChordPopup();
  const label = STRING_LABELS[kind] || kind;
  loadPanel('string', kind, label, 'Open string');
}
function onStringLinkHover(){
  const kind = this.dataset.string;
  if (!kind) return;
  const popup = ensureChordPopup();
  const svg = localStringFretboardSvg(kind);
  if (!svg) return;
  const label = STRING_LABELS[kind] || kind;
  popup.classList.add('wide');
  popup.innerHTML = `<div class="chord-popup-name">${label}</div><div class="chord-popup-svg">${svg}</div><div class="chord-popup-hint">Click to open</div>`;
  popup.classList.add('visible');
  positionChordPopup(popup, this);
}
function onNoteLinkClick(e){
  e.preventDefault(); e.stopPropagation();
  const kind = this.dataset.string;
  const fret = Number(this.dataset.fret);
  const note = this.dataset.note;
  if (!kind || isNaN(fret) || !note) return;
  hideChordPopup();
  const label = noteFullLabel(note, fret, kind);
  /* Encode payload in the URL slot as "kind|fret|note" */
  loadPanel('note', `${kind}|${fret}|${note}`, label, 'Single note');
}
function onNoteLinkHover(){
  const kind = this.dataset.string;
  const fret = Number(this.dataset.fret);
  const note = this.dataset.note;
  if (!kind || isNaN(fret) || !note) return;
  const popup = ensureChordPopup();
  const svg = localNoteSvg(kind, fret, note);
  if (!svg) return;
  const hint = noteFullLabel(note, fret, kind);
  popup.classList.add('wide');
  popup.innerHTML = `<div class="chord-popup-name">${note}</div><div class="chord-popup-svg">${svg}</div><div class="chord-popup-hint">${escHtml(hint)} · Click to open</div>`;
  popup.classList.add('visible');
  positionChordPopup(popup, this);
}
function hideChordPopup(){
  if (chordPopupEl) chordPopupEl.classList.remove('visible');
}
/* Hide popup if user scrolls or resizes */
window.addEventListener('scroll', hideChordPopup, true);
window.addEventListener('resize', hideChordPopup);

function wrapAllChordLinks(){
  /* Step text + per-step hints (single line and bulleted) */
  document.querySelectorAll('.dp .step .st').forEach(wrapChordLinksIn);
  document.querySelectorAll('.dp .step .sh').forEach(wrapChordLinksIn);
  document.querySelectorAll('.dp .step .sh-list li').forEach(wrapChordLinksIn);
  /* Step-response prompts (the question text above MC/short-answer inputs) */
  document.querySelectorAll('.dp .step .step-resp-prompt').forEach(wrapChordLinksIn);
  /* Objectives at the top of each set */
  document.querySelectorAll('.obj-card .obj-main, .obj-card .obj-sub, .obj-card .obj-set-sub, .obj-card .obj-skill-item').forEach(wrapChordLinksIn);
  /* Song list — names and meta lines often mention chords ("uses G and C") */
  document.querySelectorAll('.song-row .sname, .song-row .smeta').forEach(wrapChordLinksIn);
  /* Skills checklist — skill labels and helper text */
  document.querySelectorAll('.skill-row .sk-label, .skill-row .sk-helper').forEach(wrapChordLinksIn);
  /* Mid-module review — self-rated skill text and "play it" prompt */
  document.querySelectorAll('.mr-skill-text, .mr-play-prompt').forEach(wrapChordLinksIn);
}

// Per-module completion from the student's own progress, derived from the
// manifest (skillCount + skillIdRe) so it needs NO module data file loaded.
// state: 'none' (untouched) · 'partial' (some got-it) · 'complete' (all got-it).
function moduleCompletion(m){
  const total = m.skillCount || 0;
  if(!total) return { done:0, total:0, state:'none' };
  const re = m._skillRe || (m._skillRe = new RegExp(m.skillIdRe));
  let done = 0;
  for(const k in progress){ if(progress[k]==='gotit' && re.test(k)) done++; }
  if(done > total) done = total;
  const state = done===0 ? 'none' : (done>=total ? 'complete' : 'partial');
  return { done, total, state };
}

function populateModuleDropdown(){
  // Built from the lightweight manifest so we don't need every module's data
  // file loaded just to list the modules. Each option carries the student's
  // done count; a ✓ appears only once every skill in the module is got-it.
  // Untouched modules show just their name (no 0/N) — matches the "clean until
  // started" treatment on the set pills and progress strip.
  const sel = document.getElementById('module-select');
  const keep = sel.value;
  sel.innerHTML='';
  MODULE_MANIFEST.forEach(m=>{
    const opt = document.createElement('option');
    opt.value = m.num;
    const { done, total, state } = moduleCompletion(m);
    let tail = '';
    if(state==='complete') tail = ` · ${total}/${total} ✓`;
    else if(state==='partial') tail = ` · ${done}/${total}`;
    opt.textContent = `Module ${m.num} — ${m.name}${tail}`;
    sel.appendChild(opt);
  });
  if(keep) sel.value = keep;
}

let _moduleStripStates = {};   // num -> last seen state, to catch the just-completed moment
function celebrateModuleComplete(seg){
  flashClass(seg, 'celebrate', 1300);
  if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const r = seg.getBoundingClientRect();
  ['\u{1F3B8}','\u{1F3B5}','\u2B50','\u{1F3B6}','\u{1F3B5}','\u2728'].forEach((ch, i)=>{
    const el = document.createElement('span');
    el.className = 'celebrate-particle';
    el.textContent = ch;
    el.style.left = (r.left + r.width/2 - 9 + (i - 2.5) * 14) + 'px';
    el.style.top = (r.top - 4) + 'px';
    el.style.animationDelay = (i * 60) + 'ms';
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 1900);
  });
}
/* The 8-segment module strip is gone (the Set pills live in its rail slot
   now), but this still drives the 🏆 module-complete badge — and throws the
   confetti from it the moment the current module flips to complete. */
function renderProgressStrip(){
  let currentInfo = null;
  const firstRender = Object.keys(_moduleStripStates).length === 0;
  MODULE_MANIFEST.forEach(m=>{
    const { done, total, state } = moduleCompletion(m);
    if(m.num===lastModuleNum) currentInfo = { done, total, state, num: m.num };
    // Celebrate the moment the CURRENT module flips to complete (never on first
    // paint — returning students shouldn't get confetti for last month's work).
    if(!firstRender && state==='complete' && _moduleStripStates[m.num] && _moduleStripStates[m.num] !== 'complete'
       && m.num===lastModuleNum){
      const goal = document.getElementById('rail-module-goal');
      if(goal) celebrateModuleComplete(goal);
    }
    _moduleStripStates[m.num] = state;
  });
  const goalEl = document.getElementById('rail-module-goal');
  if(goalEl){
    const earned = !!(currentInfo && currentInfo.state === 'complete');
    goalEl.classList.toggle('earned', earned);
    goalEl.title = earned
      ? `Module ${currentInfo.num} complete!`
      : 'Finish all skills to complete this module';
  }
}

// Footer "Report a problem" — build the mailto at click time so the body carries
// wherever the student currently is (module + set). Returns true so the <a>'s
// default action opens the student's mail client with it prefilled.
function currentReportContext(){
  const m = MODULE_MANIFEST.find(x=>x.num===lastModuleNum);
  let loc = m ? `Module ${m.num} — ${m.name}` : `Module ${lastModuleNum||1}`;
  if(lastSetId && String(lastSetId).startsWith('mr')){
    loc += ', Module review';
  } else {
    const w = SETS.find(s=>s.id===lastSetId);
    if(w) loc += `, ${w.label}`;   // module name already carries the topic
  }
  return loc;
}
function buildReportHref(a){
  const subject = 'Guitar site — problem report';
  const body = currentReportContext() + ':\n\n';
  a.href = 'mailto:jhoffman@seq.org?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body);
  return true;
}

// Teacher (signed into the student app as the class teacher) and the localhost
// dev-bypass user can preview every set/review without working through the
// sequential gate — they're checking content, not taking the class.
function isGatePreviewer(){
  if(typeof isDevBypassUser==='function' && isDevBypassUser()) return true;
  return !!(currentUser && typeof TEACHER_EMAIL!=='undefined' && currentUser.email===TEACHER_EMAIL);
}

function isModuleReviewLocked(moduleNum){
  const sets = SETS.filter(w=>w.moduleNum===moduleNum);
  if(!sets.length) return true;
  if(isGatePreviewer()) return false;                 // teacher/dev: always open
  if(sets.some(w=>w.locked||w.comingSoon)) return true;
  const allSkills = sets.flatMap(w=>w.skills||[]);
  if(!allSkills.length) return true;
  return !allSkills.every(s=>progress[s.id]==='gotit');
}

// A set counts as "finished" once every one of its trackable skills is marked
// "I've got it!" — the same bar Module Review uses. A set that isn't built yet
// (static locked/comingSoon) never counts as finished, so it holds the gate.
function isSetComplete(w){
  if(!w || w.locked || w.comingSoon) return false;
  const skills = w.skills || [];
  if(!skills.length) return true;
  return skills.every(s=>progress[s.id]==='gotit');
}

// Sequential gate: a set stays locked until the set before it (in module order)
// is finished, so students work a module in order — the same lock-until-complete
// idea as Module Review, applied to every set. The first set is always open.
function isSetLocked(w){
  if(!w) return true;
  if(w.locked || w.comingSoon) return true;          // static/unbuilt stays locked for everyone
  if(isGatePreviewer()) return false;                // teacher/dev: skip the sequential gate
  const moduleSets = SETS.filter(x=>x.moduleNum===w.moduleNum);
  const idx = moduleSets.indexOf(w);
  if(idx<=0) return false;
  return !isSetComplete(moduleSets[idx-1]);
}

// The set immediately before w in its module (for "finish X first" hints).
function prevSetLabel(w){
  const arr = SETS.filter(x=>x.moduleNum===w.moduleNum);
  return (arr[arr.indexOf(w)-1] || {}).label || 'the previous set';
}

// Tiny transient toast for gate hints — makes its own element and self-dismisses.
let _gateToastTimer = null;
function gateToast(msg){
  let el = document.getElementById('gate-toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'gate-toast';
    el.setAttribute('role','status');
    el.setAttribute('aria-live','polite');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.classList.add('show');
  if(_gateToastTimer) clearTimeout(_gateToastTimer);
  _gateToastTimer = setTimeout(()=>el.classList.remove('show'), 2800);
}

async function onModuleChange(moduleNum, restoreSetId){
  moduleNum = parseInt(moduleNum);
  lastModuleNum = moduleNum;
  document.getElementById('module-select').value = moduleNum;
  // Fetch + build this module's panels on first visit before showing them.
  await ensureModuleRendered(moduleNum);
  const moduleSets = SETS.filter(w=>w.moduleNum===moduleNum);
  if(!moduleSets.length) return;   // load failed (e.g. offline + not precached)
  renderPills(moduleNum);
  renderProgressStrip();   // refresh the "you are here" indicator
  const isReviewId = restoreSetId === `mr${moduleNum}` && MODULE_REVIEWS[moduleNum];
  // The student's "frontier": the first unlocked set they haven't finished yet
  // (or the last unlocked one if they're all done). Used when there's nothing
  // valid to restore, and as the fallback if a restore target is now locked.
  const frontier = ( moduleSets.find(w=>!isSetLocked(w) && !isSetComplete(w))
                  || [...moduleSets].reverse().find(w=>!isSetLocked(w))
                  || moduleSets[0] ).id;
  let target = (restoreSetId && (moduleSets.find(w=>w.id===restoreSetId) || isReviewId))
    ? restoreSetId : frontier;
  // Never open onto a set the sequential gate has locked.
  if(!/^mr\d+$/.test(target) && isSetLocked(moduleSets.find(w=>w.id===target))) target = frontier;
  activateSet(target);
}

// Per-set completion tally from the student's own progress.
// Returns {done, total}; total is 0 for sets with no trackable skills.
function setCompletion(w){
  const skills = (w.skills && w.skills.length) ? w.skills : [];
  const done = skills.filter(s=>progress[s.id]==='gotit').length;
  return { done, total: skills.length };
}

function renderPills(moduleNum){
  const c = document.getElementById('week-pills');
  c.innerHTML='';
  const sets = SETS.filter(w=>w.moduleNum===moduleNum);
  // 4+ sets: compact the buttons so they still fit on one rail row
  c.classList.toggle('wp-many', sets.length>3);
  sets.forEach(w=>{
    const btn = document.createElement('button');
    const locked = isSetLocked(w);
    btn.className='wpill'+(locked?' locked':'');
    btn.dataset.id=w.id;
    const { done, total } = locked ? { done:0, total:0 } : setCompletion(w);
    if(!locked && total>0 && done===total){
      // All skills got-it: green treatment + leading ✓.
      btn.classList.add('complete');
      btn.innerHTML = `<span class="wpill-check" aria-hidden="true">✓</span>${w.label}`;
      btn.setAttribute('aria-label', `${w.label} — all ${total} skills complete`);
    } else if(!locked && done>0){
      // Started but not finished: full name + a small fraction. Untouched sets
      // stay clean (just the name) until the first skill is marked got-it.
      btn.classList.add('incomplete');
      const frac = document.createElement('span');
      frac.className = 'wpill-frac';
      frac.textContent = ` · ${done}/${total}`;
      btn.textContent = w.label;
      btn.appendChild(frac);
      btn.setAttribute('aria-label', `${w.label} — ${done} of ${total} skills done`);
    } else {
      btn.textContent = w.label;
    }
    if(locked){
      // Sequential gate: opens once the set before it is finished. Keep the
      // pill tappable so it explains why instead of doing nothing.
      const prev = prevSetLabel(w);
      btn.setAttribute('aria-disabled','true');
      btn.setAttribute('aria-label', `${w.label} — locked until ${prev} is finished`);
      btn.title = `Locked — mark every skill in ${prev} as "I've got it!" to unlock ${w.label}.`;
      btn.onclick = ()=> gateToast(`Finish ${prev} first — mark all its skills "I've got it!" to unlock ${w.label}.`);
    } else {
      btn.onclick=()=>{ leaveTopPanelForSet(); lastSetId=w.id; activateSet(w.id); saveProgress(); };
    }
    c.appendChild(btn);
  });

  // Module Review pill — wraps to its own full-width row below the set buttons
  if(MODULE_REVIEWS[moduleNum]){
    const locked = isModuleReviewLocked(moduleNum);
    const rbtn = document.createElement('button');
    rbtn.className='wpill review-pill'+(locked?' locked':'');
    rbtn.dataset.id=`mr${moduleNum}`;
    rbtn.textContent='Module review';
    rbtn.title = locked
      ? 'Preview only — finish marking every skill on every set as "I\'ve got it!" to unlock this self-assessment.'
      : '';
    rbtn.onclick=()=>{ leaveTopPanelForSet(); lastSetId=`mr${moduleNum}`; activateSet(`mr${moduleNum}`); saveProgress(); };
    c.appendChild(rbtn);
    // Sync preview/locked state onto the review's panel so its inputs disable themselves
    const panel = document.querySelector(`.week-panel[data-id="mr${moduleNum}"]`);
    if(panel) panel.classList.toggle('mr-locked', locked);
  }
}

// Per-set window scroll positions, so returning to a set lands where the
// student left off. A set that's never been opened has no entry → opens at top.
// Hydrated from localStorage so the position also survives a reload / PWA
// relaunch (same `gc-` key convention as gc-lastSet). window.scrollTo clamps to
// the page height, so a stale offset can never scroll past the content.
const setScrollPos = (function(){
  try{ return JSON.parse(localStorage.getItem('gc-scroll')) || {}; }catch(e){ return {}; }
})();
function saveScrollPos(){
  try{ localStorage.setItem('gc-scroll', JSON.stringify(setScrollPos)); }catch(e){}
}
// Capture the current set's scroll when the tab is hidden or closed, so a reload
// that doesn't go through activateSet first still remembers the spot.
function rememberActiveScroll(){
  const p = document.querySelector('.week-panel.active');
  if(p && p.dataset.id){ setScrollPos[p.dataset.id] = window.scrollY; saveScrollPos(); }
}
window.addEventListener('pagehide', rememberActiveScroll);
document.addEventListener('visibilitychange', ()=>{ if(document.visibilityState==='hidden') rememberActiveScroll(); });

function activateSet(id){
  // Sequential-gate backstop: never open a set that's still locked (e.g. from a
  // stale search deep-link). Explain why and stay put. Module Review (mrN) is
  // intentionally preview-openable while locked, so it's exempt.
  if(!/^mr\d+$/.test(id)){
    const w = SETS.find(x=>x.id===id);
    if(w && isSetLocked(w)){
      gateToast(`Finish ${prevSetLabel(w)} first to unlock ${w.label}.`);
      return;
    }
  }
  // Remember how far the student had scrolled the set they're leaving.
  const leaving = document.querySelector('.week-panel.active');
  if(leaving && leaving.dataset.id && leaving.dataset.id!==id){
    setScrollPos[leaving.dataset.id] = window.scrollY;
    saveScrollPos();
  }
  lastSetId = id;
  if (typeof stopAnyRec === 'function') stopAnyRec();
  document.querySelectorAll('.wpill').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
  document.querySelectorAll('.week-panel').forEach(p=>p.classList.toggle('active',p.dataset.id===id));
  // Show the module-level Songs section only for the active set's module.
  const activeMod = /^mr\d+$/.test(id) ? parseInt(id.slice(2)) : (SETS.find(x=>x.id===id)||{}).moduleNum;
  document.querySelectorAll('.module-songs').forEach(el=>el.classList.toggle('active', parseInt(el.dataset.module)===activeMod));
  renderChordBoxes();
  syncRailStations();   // refresh the rail's "This set" station switcher for the new set
  // Restore where the student last was in this set — or top on a first open.
  window.scrollTo(0, Object.prototype.hasOwnProperty.call(setScrollPos, id) ? setScrollPos[id] : 0);
}

/* ── Rail station switcher ─────────────────────────────────────────────
   The per-set station tabs (Station B/C · checklist · Songs) now live in the
   left rail instead of inside each set panel. The in-panel .tabs block still
   exists in the DOM (hidden via CSS) so switchTab/switchTabById/panelFooter/
   print all keep working unchanged — these helpers just drive it and mirror
   the active state back into the rail. */
function activeWeekPanel(){ return document.querySelector('.week-panel.active'); }
function railStation(tab){
  const panel = activeWeekPanel();
  if(!panel) return;
  leaveTopPanelForSet();
  switchTabById(panel.dataset.id, tab);   // switchTab() calls syncRailStations() to reflect it
}
function syncRailStations(){
  const group = document.getElementById('rail-set-group');
  const list  = document.getElementById('rail-stations');
  if(!group || !list) return;   // teacher view / pre-init: nothing to do
  const panel = activeWeekPanel();
  const hasTabs = panel && panel.querySelector('.tabs .tabs-card');
  if(!hasTabs){ group.hidden = true; return; }   // module-review / coming-soon: no stations
  group.hidden = false;
  const wid = panel.dataset.id;
  const w = (typeof SETS !== 'undefined') ? SETS.find(s=>s.id===wid) : null;
  const label = document.getElementById('rail-set-label');
  if(label) label.textContent = 'This set' + (w && w.label ? ' · ' + w.label : '');
  // Reflect whichever tab-panel is currently active back onto the rail buttons.
  const activePanel = panel.querySelector('.tab-panel.active');
  const activeTab = activePanel ? activePanel.id.slice(wid.length + 1) : 'station-b';
  list.querySelectorAll('.rail-station').forEach(b=>{
    const on = b.dataset.station === activeTab;
    b.classList.toggle('active', on);
    if(on) b.setAttribute('aria-current','true'); else b.removeAttribute('aria-current');
  });
}

/* "Practice" nav item: leave whatever overlay is open (Games/Songs hub/Search)
   and return to the practice view. Reuses the existing close-all helper. */
function returnToPractice(){
  if(typeof closeTopPanels === 'function') closeTopPanels();
  window.scrollTo({ top:0, behavior:'smooth' });
}

/* Set/review panels are now built per-module, on demand, by
   ensureModuleRendered() (defined near the top of this file). */

function buildSetHeader(w){
  const pill = w.title ? `<span class="obj-set-tag">${w.title}</span>` : '';
  const crumb = w.unit ? `<span class="obj-unit">${w.unit}</span>` : '';
  return (pill || crumb) ? `<div class="obj-set">${pill}${crumb}</div>` : '';
}

function buildComingSoon(w){
  const header = buildSetHeader(w);
  const sub = w.subtitle ? `<div class="obj-main">${w.subtitle}</div>` : '';
  return `<div class="obj-card set-head">${header}${sub}</div>
  <div class="coming"><div class="big">&#x1F3B8;</div><p>This set's content will appear here when it's ready.<br>Check back soon!</p></div>`;
}

function buildSet(w){
  // Small "Set N" pill, then the topic as the large title, then generalized
  // skill bullets (the old "I CAN…" objective line is no longer shown).
  const printBtn = `<button type="button" class="print-set-btn" onclick="printSet('${w.id}')" title="Print this set as a one-page handout"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></svg>Print this set</button>`;
  const pill = `<div class="obj-set">${w.title ? `<span class="obj-set-tag">${w.title}</span>` : ''}${printBtn}</div>`;
  const titleHtml = w.unit ? `<div class="obj-main obj-topic">${w.unit}</div>` : '';
  const items = (w.skillFocus||'').split(' · ')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => `<li class="obj-skill-item">${s}</li>`)
    .join('');
  const skills = items ? `<ul class="obj-skill-list">${items}</ul>` : '';
  /* Song-thread badge: each core song is built LAYER BY LAYER across the
     course (the Journey pages' shared ladder: 1 Listen · 2 Single Notes ·
     3 Power Chords · 4 Pentatonic Solo · 5 Open Chords · Luna bonus 6).
     Show WHICH layer this set builds, one row per song, deep-linked to
     that layer on the Journey page. */
  const thread = (w.songThread && w.songThread.length)
    ? `<div class="song-thread"><div class="song-thread-head">&#x1F3B8; Song Journey — what this set builds</div>${w.songThread.map(t => {
        const chip = t.layer
          ? `<span class="st-layer${t.bonus ? ' bonus' : ''}">${t.bonus ? 'Bonus Layer ' + t.layer : 'Layer ' + t.layer + ' of 5'}</span>`
          : '';
        const url = t.journey ? (t.layer ? `${t.journey}#layer-${t.layer}` : t.journey) : null;
        const nameEl = url
          ? `<a class="song-thread-link" href="${escAttr(url)}" target="_blank" rel="noopener" title="Open this layer on the Song Journey page">${escHtml(t.name)}</a>`
          : `<span class="song-thread-name">${escHtml(t.name)}</span>`;
        return `<div class="song-thread-row">${nameEl}${chip}<span class="st-note">${escHtml(t.note || '')}</span></div>`;
      }).join('')}</div>`
    : '';
  return `<div class="obj-card set-head">${titleHtml}${pill}${skills}${thread}</div>
  <div class="tabs">
    <div class="tabs-songbar">
      ${w.songs ? `<button type="button" class="tabs-songs tab-songs" onclick="switchTab(this,'${w.id}','songs')">&#9835; Songs</button>` : ''}
    </div>
    <div class="tabs-main">
      <div class="tabs-stations-col">
        <button type="button" class="tabs-card tab-station-b active" onclick="switchTab(this,'${w.id}','station-b')">
          <span class="tabs-card-title"><span class="tabs-card-num">1</span>Station B</span>
          <span class="tabs-card-sub">Watch &middot; Listen &middot; Practice</span>
        </button>
        <button type="button" class="tabs-card tab-station-c" onclick="switchTab(this,'${w.id}','station-c')">
          <span class="tabs-card-title"><span class="tabs-card-num">2</span>Station C</span>
          <span class="tabs-card-sub">Independent drill</span>
        </button>
      </div>
      <div class="tabs-arrow" aria-hidden="true">&rarr;</div>
      <button type="button" class="tabs-card tab-checklist" onclick="switchTab(this,'${w.id}','checklist')">
        <span class="tabs-card-title"><span class="tabs-card-num">3</span>My skills checklist</span>
        <span class="tabs-card-sub">Track what you can do</span>
      </button>
    </div>
  </div>
  <div id="${w.id}-station-b" class="tab-panel tp-station-b active">${buildStations(w,'b')}${panelFooter(w,'station-b')}</div>
  <div id="${w.id}-station-c" class="tab-panel tp-station-c">${buildStations(w,'c')}${panelFooter(w,'station-c')}</div>
  <div id="${w.id}-songs"    class="tab-panel tp-songs">${w.songs ? buildSongs(w) + panelFooter(w,'songs') : ''}</div>
  <div id="${w.id}-checklist" class="tab-panel tp-checklist">${buildChecklist(w)}${panelFooter(w,'checklist')}</div>`;
}

function switchTab(el,wid,tab){
  const panel=document.querySelector(`.week-panel[data-id="${wid}"]`);
  panel.querySelectorAll('.tabs > .tabs-main .tabs-card, .tabs > .tabs-songbar > .tabs-songs').forEach(t=>t.classList.remove('active'));
  panel.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(`${wid}-${tab}`).classList.add('active');
  if(typeof syncRailStations === 'function') syncRailStations();   // mirror onto the rail switcher
}

/* Print one set as a clean one-pager (for days the Chromebooks/Wi-Fi fail).
   The @media print stylesheet does the heavy lifting — it force-shows BOTH
   station panels (regardless of which tab is open) and hides the songs/
   checklist tabs and all on-screen chrome — so this just fires the dialog. */
function printSet(wid){ window.print(); }
/* Printed handouts must show the collapsed hint/stuck/level-up prose —
   closed <details> hide their content from print, so open them for the
   print pass and restore afterwards. */
let _printOpened = [];
window.addEventListener('beforeprint', ()=>{
  _printOpened = [...document.querySelectorAll('details.step-fold:not([open])')];
  _printOpened.forEach(d=>d.setAttribute('open',''));
});
window.addEventListener('afterprint', ()=>{
  _printOpened.forEach(d=>d.removeAttribute('open'));
  _printOpened = [];
});

/* ── Stations ── */
function buildStations(w, stationId){
  const stepsHtml=(steps,ns)=>steps.map((s,i)=>{
    const text=s.text.replace(/<a href="(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^"]*)"([^>]*)>([^<]*)<\/a>/g,(match,url,attrs,label)=>{
      const safe=label.replace(/'/g,"\\'");
      // data-ext links can't be embedded (official recordings block it) — open on YouTube in a new tab.
      if(/data-ext/.test(attrs)){
        return `<button class="rp-trigger" onclick="window.open('${url}','_blank','noopener')" title="Opens on YouTube in a new tab">&#x25B6; ${label} <span style="font-size:0.6875rem;opacity:0.6">&#x2197;</span></button>`;
      }
      return `<button class="rp-trigger" onclick="loadPanel('youtube','${url}','${safe}','YouTube')">&#x25B6; ${label}</button>`;
    });
    /* One-thing-per-screen: the challenge text and the DOER (play buttons,
       diagrams, TAB, responses) stay visible; supporting prose (hint, stuck,
       level-up) collapses behind native <details> — one tap away, never
       competing with the thing the student is supposed to do. */
    const hintFold = s.hint ? (()=>{
      const bullets = s.hint.split(/(?<=\.(?=\s))(?=\s*[A-Z])|\n/).map(b=>b.trim()).filter(Boolean);
      const inner = bullets.length <= 1 ? `<div class="sh">${s.hint}</div>`
        : `<ul class="sh-list">${bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`;
      return `<details class="step-fold step-hint-fold"><summary>&#x1F4A1; Hint</summary>${inner}</details>`;
    })() : '';
    const stuckFold = s.stuck ? `<details class="step-fold step-stuck-fold"><summary>&#x1FA9C; Stuck?</summary><div class="step-branch step-stuck">${s.stuck}</div></details>` : '';
    const levelUpFold = s.levelUp ? `<details class="step-fold step-levelup-fold"><summary>&#x1F336;&#xFE0F; Level up</summary><div class="step-branch step-levelup">${s.levelUp}</div></details>` : '';
    // Hint / Stuck? / Level up sit in one horizontal row so a student can scan all three at once.
    const foldsHtml = (hintFold || stuckFold || levelUpFold) ? `<div class="step-folds">${hintFold}${stuckFold}${levelUpFold}</div>` : '';
    const chordsHtml = (s.chords&&s.chords.length)
      ? `<div class="chord-diagrams">${s.chords.map(c=>`<div class="chord-box">${chordDiagramSVG(c)}${c.name?`<div class="chord-box-label">${c.name}</div>`:''}</div>`).join('')}</div>` + coachChordBtnRowHtml(s.chords)
      : '';
    const playSeqHtml = s.playSeq ? (()=>{
      const ps = s.playSeq;
      const label = ps.label || 'Play all';
      const defBpm = ps.bpm || 60;
      const minBpm = ps.minBpm || 40;
      const maxBpm = ps.maxBpm || 120;
      const key = `bpm:${w.id}:${ns}:${i}`;
      const bpm = readStoredBpm(key, defBpm);
      const midis = JSON.stringify(ps.notes);
      return ` <span class="bpm-control-group">` +
        `<button type="button" class="play-seq-btn" data-midis="${escAttr(midis)}" onclick="playSequenceFromGroup(this)" title="Play all notes">&#x25B6; ${escHtml(label)}</button>` +
        renderBpmControl(key, bpm, minBpm, maxBpm) +
        coachBtnHtml(midis) +
        `</span>`;
    })() : '';
    const tabHtml = s.tab ? buildTab(s.tab, { keyPrefix: `bpm:${w.id}:${ns}:${i}:tab` }) : '';
    const tabsHtml = (s.tabs && s.tabs.length)
      ? `<div class="tab-choice-group">${s.tabs.map((t, tIdx) => {
          const title = t.title || t.caption || 'TAB';
          return `<div class="tab-choice"><button type="button" class="tab-choice-btn" onclick="toggleTabChoice(this)"><span class="tab-choice-icon">&#x25B6;</span><span>Show TAB: ${escHtml(title)}</span></button><div class="tab-choice-content">${buildTab(t, { keyPrefix: `bpm:${w.id}:${ns}:${i}:tab:${tIdx}` })}</div></div>`;
        }).join('')}</div>`
      : '';
    const respHtml = s.response ? (()=>{
      const key = `${w.id}-${ns}-${i}`;
      const stored = responses[key] || '';
      const promptHtml = s.response.prompt ? `<div class="step-resp-prompt">${escHtml(s.response.prompt)}</div>` : '';
      const labelHtml = `<div class="step-resp-label">&#x270F;&#xFE0F; Your response</div>`;
      if(s.response.type === 'short'){
        const ph = s.response.placeholder || 'Type your answer here…';
        return `<div class="step-resp">${labelHtml}${promptHtml}<textarea class="step-resp-input" rows="2" placeholder="${escAttr(ph)}" oninput="onResponseChange('${key}', this.value)">${escHtml(stored)}</textarea></div>`;
      }
      if(s.response.type === 'mc' && Array.isArray(s.response.choices)){
        const r = s.response;
        // Factual MCs carry answer: (index) + explain: — render as graded buttons.
        if(typeof r.answer === 'number'){
          const ansChoice = r.choices[r.answer];
          const answered = stored !== '';
          const opts = r.choices.map(c=>{
            let cls = 'step-mc-opt';
            if(c === ansChoice) cls += ' is-answer';
            if(answered && c === stored) cls += (c === ansChoice) ? ' correct' : ' incorrect';
            return `<button type="button" class="${cls}" data-choice="${escAttr(c)}" data-correct="${c===ansChoice?'1':'0'}" onclick="onStepMcSelect('${key}', this)"><span class="step-mc-text">${escHtml(c)}</span><span class="step-mc-check">&#x2713;</span></button>`;
          }).join('');
          const explainHtml = r.explain ? `<div class="step-mc-explain">${escHtml(r.explain)}</div>` : '';
          return `<div class="step-resp">${labelHtml}${promptHtml}<div class="step-resp-mc step-mc-keyed${answered?' answered':''}">${opts}</div>${explainHtml}</div>`;
        }
        // Reflection / observation MCs stay unkeyed — record the pick only.
        const opts = r.choices.map(c=>{
          const checked = stored===c ? 'checked' : '';
          return `<label class="step-resp-mc-opt"><input type="radio" name="resp-${key}" ${checked} onchange="onResponseChange('${key}', '${escAttr(c)}')"><span>${escHtml(c)}</span></label>`;
        }).join('');
        return `<div class="step-resp">${labelHtml}${promptHtml}<div class="step-resp-mc">${opts}</div></div>`;
      }
      return '';
    })() : '';
    const doneKey = `${w.id}-${ns}-${i}`;
    const isDone = completed[doneKey] === true;
    // Mark-done is the last row of the step.
    const doneBtn = `<div class="step-done-row"><button class="step-done-btn" type="button" aria-pressed="${isDone}" onclick="toggleStepDone(this,'${doneKey}')">${isDone ? '&#x2713; Done' : 'Mark done'}</button></div>`;
    const skillsAttr = (s.skills && s.skills.length) ? ` data-skills="${s.skills.join(',')}"` : '';
    return `<li class="step${isDone ? ' step-done' : ''}"${skillsAttr}><div class="sn">${i+1}</div><div class="st"><span class="st-text">${text}</span><div class="step-body">${playSeqHtml}${chordsHtml}${tabHtml}${tabsHtml}${respHtml}${foldsHtml}</div>${doneBtn}</div></li>`;
  }).join('');
  /* Generic tuning warm-up sections are superseded by the Daily 5 (which
     starts with the tune-up): render a pointer card above the numbered
     sections instead of taking a numbered slot itself. */
  const isTuningWarmup = sec => sec.title === 'Warm-up — tuning check (Module 1)' && w.moduleNum !== 1;
  const sectionsHtml=(sections,baseNs)=>{
    const reminder = sections.some(isTuningWarmup)
      ? `<div class="daily5-inline">&#x26A1; <strong>Tune and warm up first:</strong> today\u2019s Daily 5 has tuning, a finger warm-up, and one drill (a short exercise you repeat to build a skill) from this module \u2014 five minutes and your hands are ready. <button type="button" class="daily5-inline-btn" onclick="openDaily5Here()">&#x26A1; Open today\u2019s Daily 5</button></div>`
      : '';
    const real = sections.filter(sec => !isTuningWarmup(sec));
    return reminder + real.map((sec,gi)=>{
    const ns = `${baseNs}-sec${gi}`;
    const open = gi===0 ? ' open' : '';
    return `<div class="sc-sec${open}">
      <button type="button" class="sc-sec-head" aria-expanded="${gi===0}" onclick="toggleStationSection(this)">
        <span class="sc-sec-chev">&#x25B6;</span>
        <span class="sc-sec-title"><span class="sc-sec-num">${gi+1}</span>${sec.title}</span>
      </button>
      <div class="sc-sec-body"><ul class="steps">${stepsHtml(sec.steps, ns)}</ul></div>
    </div>`;
  }).join('');
  };
  const dp=(id,cls,badge,badgeClass,s)=>{
    const body = (s.sections && s.sections.length)
      ? `<div class="sc-sections">${sectionsHtml(s.sections, id)}</div>`
      : `<ul class="steps">${stepsHtml(s.steps, id)}</ul>`;
    /* Stations don't have to happen in one sitting: first pass should be
       B→C (B teaches what C drills), but returning straight to C on a
       later day is spaced practice — say so, so nobody feels off-track. */
    const flexNote = (id==='c' && w.stations && w.stations.b)
      ? `<div class="st-flex-note">&#x1F9ED; <strong>First time on this set?</strong> Do <button type="button" class="st-note-link" onclick="switchTabById('${w.id}','station-b')">Station B</button> first — watch the lessons, then come back here and drill. Back on another day just to practice? Perfect — practicing on different days helps you remember.</div>`
      : '';
    return `
    <div class="dp${cls}" id="${w.id}-dp-${id}">
      <div class="dp-head"><span class="st-badge ${badgeClass}">${badge}</span><div class="dp-title">${s.title}</div></div>
      ${flexNote}
      ${body}
    </div>`;
  };
  if(stationId){
    const s = stationId === 'b' ? w.stations.b : w.stations.c;
    const badge = stationId === 'b' ? 'Station B' : 'Station C';
    const badgeClass = stationId === 'b' ? 'bb' : 'bc';
    return dp(stationId, '', badge, badgeClass, s);
  }
  return `
    <div class="st-grid">
      <div class="stc" id="${w.id}-sc-b" role="button" tabindex="0" aria-label="Open Station B — Computer station" onclick="openSt('${w.id}','b')">
        <div class="st-ico">&#x1F4BB;</div><span class="st-badge bb">Station B</span>
        <div class="st-name">Computer station</div><div class="st-desc">Watch · Listen · Practice</div>
      </div>
      <div class="stc" id="${w.id}-sc-c" role="button" tabindex="0" aria-label="Open Station C — Practice station" onclick="openSt('${w.id}','c')">
        <div class="st-ico">&#x1F3B8;</div><span class="st-badge bc">Station C</span>
        <div class="st-name">Practice station</div><div class="st-desc">Independent drill</div>
      </div>
    </div>
    ${dp('b',' hidden','Station B','bb',w.stations.b)}
    ${dp('c',' hidden','Station C','bc',w.stations.c)}`;
}

function toggleStepDone(btn, key){
  const li = btn.closest('.step');
  const nowDone = !li.classList.contains('step-done');
  li.classList.toggle('step-done', nowDone);
  btn.setAttribute('aria-pressed', nowDone);
  btn.innerHTML = nowDone ? '&#x2713; Done' : 'Mark done';
  onCompleteChange(key, nowDone);
}

function toggleStationSection(btn){
  const item = btn.closest('.sc-sec');
  const open = item.classList.toggle('open');
  btn.setAttribute('aria-expanded', open);
  renderChordBoxes();
}

function openSt(wid,s){
  ['b','c'].forEach(x=>{
    document.getElementById(`${wid}-sc-${x}`).classList.toggle('active',x===s);
    document.getElementById(`${wid}-dp-${x}`).classList.toggle('hidden',x!==s);
  });
  renderChordBoxes();
}

/* ── Songs ── */
const DIFF_LABELS = {1:'Beginner',2:'Intermediate',3:'Advanced'};
function diffDotsHtml(level){
  if(!level) return '';
  const lbl = DIFF_LABELS[level] || '';
  const filled = '●'.repeat(level);            // ●
  const empty  = '○'.repeat(Math.max(0,3-level)); // ○
  return `<span class="song-diff diff-${level}" title="Difficulty: ${lbl}" aria-label="Difficulty: ${lbl}">${filled}<span class="song-diff-empty">${empty}</span></span> `;
}
function buildSongs(w){
  const rows=w.songs.map((s,i)=>{
    const nameEl = s.url ? `<button class="rp-trigger" onclick="loadSong('${w.id}',${i})">${s.name}</button>` : s.name;
    const vids = [];
    if(s.originalUrl) vids.push(`<button class="song-vid-btn" onclick="loadSongVid('${w.id}',${i},'original')" title="Opens in YouTube"><span class="svb-play">&#x25B6;</span>Original <span style="font-size:0.6875rem;opacity:0.6">&#x2197;</span></button>`);
    if(s.tutorialUrl) vids.push(`<button class="song-vid-btn tut" onclick="loadSongVid('${w.id}',${i},'tutorial')"><span class="svb-play">&#x25B6;</span>Tutorial</button>`);
    if(s.backingUrl) vids.push(`<button class="song-vid-btn" onclick="loadSongVid('${w.id}',${i},'backing')" title="Jam track — backing music to play along with; make up your own melody (solo) over it"><span class="svb-play">&#x25B6;</span>&#x1F3B5; Backing track${s.backingKey?` (${s.backingKey})`:''}</button>`);
    // Song Journey pages are same-origin (tabs/*.html), opened in a new tab so app state stays put.
    if(s.journeyUrl) vids.push(`<button class="song-vid-btn" onclick="window.open('${s.journeyUrl}','_blank','noopener')" title="One song, five layers">&#x1F9F5; Song Journey</button>`);
    const vidsEl = vids.length ? `<div class="song-vids">${vids.join('')}</div>` : '';
    return `<div class="song-row"><div class="dot ${s.core?'dc':'dch'}"></div><div><div class="sname">${nameEl}</div><div class="smeta">${diffDotsHtml(s.level)}${s.meta}</div></div>${vidsEl}<span class="stag ${s.core?'stag-core':''}"${vids.length?'':' style="margin-left:auto"'}>${s.type}</span></div>`;
  }).join('');
  const requestSlot = `<div class="song-row song-request"><div class="song-request-ico">&#x1F3A4;</div><div><div class="sname">Your pick — bring your own song!</div><div class="smeta">Got a song you want to learn? Search YouTube for a beginner tutorial and use this module's skills on it.</div></div></div>`;
  const diffLegend = `<div class="leg"><span class="song-diff diff-1">&#x25CF;<span class="song-diff-empty">&#x25CB;&#x25CB;</span></span>&#x2192;<span class="song-diff diff-3">&#x25CF;&#x25CF;&#x25CF;</span> easier &#x2192; harder</div>`;
  return `<div class="legend"><div class="leg"><div class="dot dc" style="margin-top:0"></div>Core — everyone</div><div class="leg"><div class="dot dch" style="margin-top:0"></div>Choice menu — pick 1</div>${diffLegend}</div><div class="card">${rows}${requestSlot}</div>`;
}

/* Module-level songs (modules 2–12): one consolidated "🎵 Songs" list per module,
   read from MODULE_SONGS[num] and rendered as a collapsible .sc-sec section after
   the module's set panels (see ensureModuleRendered). Module 1 keeps its per-set
   lists via buildSongs above. Returns '' if the module has no song list. */
function buildModuleSongs(moduleNum){
  const list = (globalThis.MODULE_SONGS && MODULE_SONGS[moduleNum]) || [];
  if(!list.length) return '';
  const rows = list.map((s,i)=>{
    const vids = [];
    if(s.originalUrl) vids.push(`<button class="song-vid-btn" onclick="loadModuleSongVid(${moduleNum},${i},'original')" title="Opens in YouTube"><span class="svb-play">&#x25B6;</span>Original <span style="font-size:0.6875rem;opacity:0.6">&#x2197;</span></button>`);
    if(s.tutorialUrl) vids.push(`<button class="song-vid-btn tut" onclick="loadModuleSongVid(${moduleNum},${i},'tutorial')"><span class="svb-play">&#x25B6;</span>Tutorial</button>`);
    if(s.backingUrl) vids.push(`<button class="song-vid-btn" onclick="loadModuleSongVid(${moduleNum},${i},'backing')" title="Jam track — backing music to play along with; make up your own melody (solo) over it"><span class="svb-play">&#x25B6;</span>&#x1F3B5; Backing track${s.backingKey?` (${s.backingKey})`:''}</button>`);
    if(s.journeyUrl) vids.push(`<button class="song-vid-btn" onclick="window.open('${s.journeyUrl}','_blank','noopener')" title="One song, five layers">&#x1F9F5; Song Journey</button>`);
    const vidsEl = vids.length ? `<div class="song-vids">${vids.join('')}</div>` : '';
    return `<div class="song-row"><div class="dot ${s.core?'dc':'dch'}"></div><div><div class="sname">${s.name}</div><div class="smeta">${diffDotsHtml(s.level)}${s.meta}</div></div>${vidsEl}<span class="stag ${s.core?'stag-core':''}"${vids.length?'':' style="margin-left:auto"'}>${s.type}</span></div>`;
  }).join('');
  const diffLegend = `<div class="leg"><span class="song-diff diff-1">&#x25CF;<span class="song-diff-empty">&#x25CB;&#x25CB;</span></span>&#x2192;<span class="song-diff diff-3">&#x25CF;&#x25CF;&#x25CF;</span> easier &#x2192; harder</div>`;
  const legend = `<div class="legend"><div class="leg"><div class="dot dc" style="margin-top:0"></div>Core — everyone</div><div class="leg"><div class="dot dch" style="margin-top:0"></div>Choice menu — pick 1</div>${diffLegend}</div>`;
  // Collapsible section — reuses the Station B/C collapse (toggleStationSection);
  // starts closed so it sits quietly below the set content.
  return `<div class="sc-sec">
      <button type="button" class="sc-sec-head" aria-expanded="false" onclick="toggleStationSection(this)">
        <span class="sc-sec-chev">&#x25B6;</span>
        <span class="sc-sec-title">&#x1F3B5; Songs</span>
      </button>
      <div class="sc-sec-body">${legend}<div class="card">${rows}</div></div>
    </div>`;
}

// Video links for a module-level song (indexes MODULE_SONGS, same launcher).
function loadModuleSongVid(moduleNum, idx, kind){
  const list = (globalThis.MODULE_SONGS && MODULE_SONGS[moduleNum]) || [];
  openSongVid(list[idx], kind);
}

function loadSong(wid, idx){
  const w=SETS.find(x=>x.id===wid); if(!w) return;
  const s=w.songs[idx]; if(!s||!s.url) return;
  loadPanel('youtube', s.url, s.name, s.type);
}

/* THE song-video launcher — every song list (per-set, per-module, Songs hub)
   routes through this so the kind dispatch and subtitles can't drift. */
function openSongVid(s, kind){
  if(!s) return;
  if(kind==='journey'){ if(s.journeyUrl) window.open(s.journeyUrl, '_blank', 'noopener'); return; }
  if(kind==='original'){ if(s.originalUrl) window.open(s.originalUrl, '_blank', 'noopener'); return; }
  if(kind==='backing'){ if(s.backingUrl) loadPanel('youtube', s.backingUrl, s.name, 'Backing track — it repeats on its own; press play and solo over it'); return; }
  if(s.tutorialUrl) loadPanel('youtube', s.tutorialUrl, s.name, 'Tutorial');
}
function loadSongVid(wid, idx, kind){
  const w=SETS.find(x=>x.id===wid); if(!w) return;
  openSongVid(w.songs[idx], kind);
}
/* ── Videos ── */
function buildVideos(w){
  const rows=w.videos.map(v=>`<div class="vid-row"><div><div class="vname"><button class="rp-trigger" onclick="loadPanel('youtube','${v.url}','${v.name.replace(/'/g,"\\'")}','${v.source.replace(/'/g,"\\'")}')">&#x25B6; ${v.name}</button></div><div class="vsrc">${v.source}</div>${v.rec?'<span class="vrec">&#x2605; Recommended</span>':''}</div></div>`).join('');
  return `<div class="card">${rows}</div>`;
}

/* ── Assessment ── */
function buildAssess(w){
  const a=w.assessment;
  return `<div class="ablock"><div class="albl">Assessment goal</div><div class="atxt">${a.goal}</div></div>
    <div class="ablock"><div class="albl">Self-check</div><div class="atxt">${a.selfCheck}</div></div>
    <div class="ablock"><div class="albl">NAfME standards</div><div>${a.standards.map(s=>`<span class="spill">${s}</span>`).join('')}</div></div>`;
}

/* ── 10-Minute Routine card (module review) + Daily 5 panel ──
   Both assemble themselves from the module's already-loaded SETS data, so
   future content edits propagate automatically. Read-only: no Firebase writes. */
function stripTags(html){ const d=document.createElement('div'); d.innerHTML=html||''; return (d.textContent||'').trim(); }
function truncateText(s, n){ if(s.length<=n) return s; const cut=s.slice(0,n); return cut.slice(0, Math.max(cut.lastIndexOf(' '), n-20))+'…'; }
// Every step in a module, in document order, with its set + section context.
function moduleStepsFlat(moduleNum){
  const out=[];
  SETS.filter(w=>w.moduleNum===moduleNum && !w.comingSoon).forEach(w=>{
    ['b','c'].forEach(st=>{
      const stn=w.stations && w.stations[st]; if(!stn) return;
      const sections=stn.sections || (stn.steps ? [{title:'', steps:stn.steps}] : []);
      sections.forEach(sec=>(sec.steps||[]).forEach(step=>out.push({set:w, station:st, secTitle:sec.title||'', step})));
    });
  });
  return out;
}
function routinePlaySeq(ps, key){
  const bpm=readStoredBpm(key, ps.bpm||60);
  return `<span class="bpm-control-group">`+
    `<button type="button" class="play-seq-btn" data-midis="${escAttr(JSON.stringify(ps.notes))}" onclick="playSequenceFromGroup(this)" title="Play it">&#x25B6; ${escHtml(ps.label||'Play it')}</button>`+
    renderBpmControl(key, bpm, ps.minBpm||40, ps.maxBpm||120)+coachBtnHtml(JSON.stringify(ps.notes))+`</span>`;
}
function buildModuleRoutine(moduleNum){
  const steps=moduleStepsFlat(moduleNum);
  if(!steps.length) return '';
  const sets=SETS.filter(w=>w.moduleNum===moduleNum && !w.comingSoon);
  // Skill drill: the LAST set's first playSeq step (latest material = the
  // "hardest drill" heuristic), walking back set by set if needed.
  let drill=null;
  for(let i=sets.length-1; i>=0 && !drill; i--){
    drill=steps.find(x=>x.set===sets[i] && x.step.playSeq)||null;
  }
  // Chord / scale work: first step with a chords: spec; else the module's
  // first playSeq that isn't already the drill.
  let chordWork=steps.find(x=>x.step.chords && x.step.chords.length)||null;
  if(!chordWork){ chordWork=steps.find(x=>x.step.playSeq && x!==drill)||null; }
  // Song: the most recent "Take It to a Song" step.
  const songSteps=steps.filter(x=>/take it to a song/i.test(x.secTitle) || /take it to a song/i.test(x.step.text||''));
  const song=songSteps.length ? songSteps[songSteps.length-1] : null;
  const wu=WARMUP_BANK[moduleNum % WARMUP_BANK.length];
  const li=(mins, title, body)=>`<li class="routine-item"><span class="routine-min">${mins} min</span><div class="routine-body"><strong>${title}</strong> ${body}</div></li>`;
  const setLink=(x)=>`<button type="button" class="mr-review-link" onclick="goToSet('${x.set.id}')" title="Open this set">&#8617; ${escHtml(x.set.label)}</button>`;
  let items='';
  items+=li(1,'Tune up','&mdash; open the Tuner (corner button) and tune all six strings until the tuner turns green.');
  items+=li(1,'Finger Gym',`&mdash; ${escHtml(wu.text)}<br>${routinePlaySeq(wu, `bpm:routine:${moduleNum}:wu`)}`);
  if(drill) items+=li(3,'Skill drill',`&mdash; ${escHtml(truncateText(stripTags(drill.step.text),180))} ${setLink(drill)}<br>${routinePlaySeq(drill.step.playSeq, `bpm:routine:${moduleNum}:drill`)}`);
  if(chordWork && chordWork!==drill){
    const c=chordWork.step;
    const inner=c.chords && c.chords.length
      ? `&mdash; ${escHtml(truncateText(stripTags(c.text),180))} ${setLink(chordWork)}<div class="chord-diagrams">${c.chords.map(ch=>`<div class="chord-box">${chordDiagramSVG(ch)}${ch.name?`<div class="chord-box-label">${ch.name}</div>`:''}</div>`).join('')}</div>`
      : `&mdash; ${escHtml(truncateText(stripTags(c.text),180))} ${setLink(chordWork)}<br>${routinePlaySeq(c.playSeq, `bpm:routine:${moduleNum}:chords`)}`;
    items+=li(3,'Chord / scale work',inner);
  }
  if(song) items+=li(2,'Song',`&mdash; ${escHtml(truncateText(stripTags(song.step.text),220))} ${setLink(song)}`);
  return `<div class="routine-card">
    <div class="routine-head">
      <span class="routine-title">&#x1F552; Your 10-minute practice routine</span>
      <button type="button" class="routine-print-btn" onclick="printRoutine()" title="Print this routine">&#x1F5A8; Print</button>
    </div>
    <ol class="routine-list">${items}</ol>
    <div class="routine-foot">Built from this module&rsquo;s sets &mdash; short on time? Do steps 1&ndash;3 &mdash; that's still good.</div>
  </div>`;
}
function printRoutine(){
  document.body.classList.add('print-routine');
  const done=()=>{ document.body.classList.remove('print-routine'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}
/* Daily 5 — today's 5-minute warm-up for the current module. Same drill for
   everyone on the same date (rotated by day of year). Read-only. */
function dayOfYear(){ const now=new Date(); return Math.floor((now-new Date(now.getFullYear(),0,0))/86400000); }
function buildDaily5(){
  const num=parseInt(document.getElementById('module-select').value)||1;
  const doy=dayOfYear();
  const wu=WARMUP_BANK[doy % WARMUP_BANK.length];
  const seqSteps=moduleStepsFlat(num).filter(x=>x.step.playSeq);
  const pick=seqSteps.length ? seqSteps[doy % seqSteps.length] : null;
  const li=(mins,title,body)=>`<li class="routine-item"><span class="routine-min">${mins} min</span><div class="routine-body"><strong>${title}</strong> ${body}</div></li>`;
  let items='';
  items+=li(1,'Tune up','&mdash; tune all six strings until the tuner turns green (use the corner Tuner).');
  items+=li(2,'Warm-up',`&mdash; ${escHtml(wu.text)}<br>${routinePlaySeq(wu,'bpm:daily5:wu')}`);
  if(pick) items+=li(2,'Today’s drill',`&mdash; from Module ${num}, ${escHtml(pick.set.label)}: ${escHtml(truncateText(stripTags(pick.step.text),160))}<br>${routinePlaySeq(pick.step.playSeq,'bpm:daily5:drill')}`);
  /* Challenge Day: every third day the Daily 5 offers ONE extra challenge to
     pick from a pair — drawn ONLY from modules the student has reached, so an
     early-module student never sees barre chords or fingerpicking. */
  let challenge='';
  if(doy % 3 === 0){
    const elig=WINTER_CHALLENGE.filter(c=>c.minModule<=num);
    if(elig.length){
      const a=elig[doy % elig.length];
      const b=elig.length>1 ? elig[(doy + (doy % (elig.length-1)) + 1) % elig.length] : null;
      const opts=(b && b!==a) ? [a,b] : [a];
      challenge=`<div class="daily5-challengeday">
        <div class="daily5-challengeday-head">&#x1F3D4; Challenge Day! Pick ONE (all skills you already know):</div>
        <ul class="daily5-challenge">${opts.map(c=>`<li>${escHtml(c.text)}</li>`).join('')}</ul>
      </div>`;
    }
  }
  return `<div class="daily5-head"><span>&#x26A1; Daily 5 &mdash; today’s warm-up</span><button type="button" class="tp-close" onclick="closeDaily5()" aria-label="Close Daily 5">&#x2715;</button></div>
    <ol class="routine-list">${items}</ol>${challenge}`;
}
/* Station C's warm-up card opens the Daily 5 as a popup over the activities —
   close it and you're exactly where you left off, no scrolling to the top. */
function openDaily5Here(){
  closeDaily5();
  const ov=document.createElement('div');
  ov.className='daily5-overlay';
  ov.id='daily5-overlay';
  ov.innerHTML=`<div class="daily5-modal" role="dialog" aria-modal="true" aria-label="Daily 5 — today's warm-up">${buildDaily5()}</div>`;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeDaily5(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', daily5EscClose);
}
function daily5EscClose(e){ if(e.key==='Escape') closeDaily5(); }
function closeDaily5(){
  const ov=document.getElementById('daily5-overlay');
  if(ov) ov.remove();
  document.removeEventListener('keydown', daily5EscClose);
}

/* ── Module Review (self-assessment) ── */
function buildModuleReview(mr){
  const savedKey=`mr${mr.moduleNum}-reflection`;
  const saved=progress[savedKey]||{};
  const perfKey=`mr${mr.moduleNum}-performance`;
  const perf=progress[perfKey]||{};
  const mrId=`mr${mr.moduleNum}`;
  let qNum = 0;
  const rows=mr.skills.map(s=>{
    qNum++;
    const lvl=progress[s.id];
    const btn=(n)=>`<button class="mr-rb lvl${n}${lvl===String(n)?' active':''}" onclick="setSkillLevel('${s.id}','${mrId}','${n}')">${n}</button>`;
    const reviewLink = s.set
      ? `<button type="button" class="mr-review-link" onclick="goToSet('${s.set}')" title="Go back to the lesson for this skill">&#8617; Review this</button>`
      : '';
    return `<div class="mr-row">
      <div class="mr-skill-text"><span class="mr-q-num">${qNum}.</span> ${s.text}${reviewLink}</div>
      <div class="mr-rating">${btn(1)}${btn(2)}${btn(3)}</div>
    </div>`;
  }).join('');
  const clickedNum = ++qNum;
  const hardNum = ++qNum;
  const playNum = ++qNum;
  const pLvl=perf.level;
  const pBtn=(n)=>`<button class="mr-rb lvl${n}${pLvl===String(n)?' active':''}" onclick="setPerformanceLevel(${mr.moduleNum},'${n}')">${n}</button>`;
  const playHtml=`<div class="mr-play">
      <span class="mr-play-tag">&#x1F3B8; <span class="mr-q-num">${playNum}.</span> Play it &amp; Record it!</span>
      <div class="mr-play-prompt">Perform a core song from this module &mdash; or a song of your choice that uses these skills. Then listen back to your recording and reflect on what could be improved.</div>
      <label class="mr-play-label" for="${mrId}-song">Song I played</label>
      <input type="text" id="${mrId}-song" class="mr-play-song" oninput="savePerformance(${mr.moduleNum})" value="${escAttr(perf.song||'')}">
      <div class="mr-rec" data-module="${mr.moduleNum}">
        <div class="mr-rec-body" id="${mrId}-rec-body">${renderRecBody(mr.moduleNum)}</div>
      </div>
      <div class="mr-play-rate">
        <span class="mr-play-rate-label">How did it go?</span>
        <div class="mr-rating">${pBtn(1)}${pBtn(2)}${pBtn(3)}</div>
      </div>
    </div>`;
  const assessBody = (mr.assessItems && mr.assessItems.length)
    ? `When you're ready, record yourself doing the module assessment, then check the recording against these skills:<ul class="mr-assess-list">${mr.assessItems.map(i=>`<li>${i}</li>`).join('')}</ul>`
    : 'When you\'re ready, record yourself performing the skills above and self-check the recording.';
  const performanceHtml=`<div class="mr-assess-box">
      <div class="mr-assess-head"><span class="mr-assess-icon">&#x1F4DD;</span> Module ${mr.moduleNum} Assessment</div>
      <div class="mr-assess-body">${assessBody}</div>
    </div>`;
  const forwardHtml = mr.forward
    ? `<div class="ablock mr-forward" style="margin-top:12px"><div class="albl">&#x1F517; Why this matters</div><div class="atxt">${mr.forward}</div></div>`
    : '';
  return `
    ${buildModuleRoutine(mr.moduleNum)}
    <div class="mr-locked-banner">
      <span class="mr-locked-banner-icon">&#x1F512;</span>
      <div><strong>Preview only.</strong> Mark every skill on every set as &ldquo;I&rsquo;ve got it!&rdquo; to unlock this self-assessment.</div>
    </div>
    <div class="obj-card">
      <span class="mr-tag">Module ${mr.moduleNum} self-assessment</span>
      <div class="obj-main">${mr.module}</div>
      <div class="obj-sub">Rate yourself on the module's key skills, then reflect.</div>
    </div>
    <div class="mr-skills">${rows}</div>
    <div class="mr-legend">
      <span class="mr-legend-item"><span class="mr-legend-dot lvl1"></span>1 = Still learning</span>
      <span class="mr-legend-item"><span class="mr-legend-dot lvl2"></span>2 = Getting it</span>
      <span class="mr-legend-item"><span class="mr-legend-dot lvl3"></span>3 = Got it</span>
    </div>
    <div class="ablock" style="margin-top:18px">
      <div class="albl"><span class="mr-q-num">${clickedNum}.</span> What suddenly made sense this module?</div>
      <textarea id="${mrId}-clicked" class="reflection-ta" placeholder="e.g. TAB finally made sense when I slowed it down…" oninput="saveReflection(${mr.moduleNum})">${saved.clicked||''}</textarea>
    </div>
    <div class="ablock" style="margin-top:12px">
      <div class="albl"><span class="mr-q-num">${hardNum}.</span> What's still hard?</div>
      <textarea id="${mrId}-hard" class="reflection-ta" placeholder="e.g. My ring finger keeps slipping off the fret…" oninput="saveReflection(${mr.moduleNum})">${saved.hard||''}</textarea>
    </div>
    ${playHtml}
    ${performanceHtml}
    ${forwardHtml}
    <div class="ablock" style="margin-top:12px">
      <div class="albl">NAfME standards</div>
      <div>${mr.standards.map(s=>`<span class="spill">${s}</span>`).join('')}</div>
    </div>
    <div class="save-ind" id="${mrId}-save-ind" style="margin-top:10px" aria-live="polite"></div>`;
}

/* Jump from a module-review skill back to the lesson set that teaches it. */
function goToSet(setId){
  lastSetId = setId;
  activateSet(setId);
  saveProgress();
  const pill = document.querySelector(`.wpill[data-id="${setId}"]`);
  if(pill) pill.scrollIntoView({block:'nearest', inline:'nearest'});
  // activateSet() already restored this set's scroll (or top on first open).
}

function isReviewPanelLocked(mrId){
  const panel = document.querySelector(`.week-panel[data-id="${mrId}"]`);
  return !!(panel && panel.classList.contains('mr-locked'));
}

function saveReflection(moduleNum){
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;
  const clicked=document.getElementById(`mr${moduleNum}-clicked`).value;
  const hard=document.getElementById(`mr${moduleNum}-hard`).value;
  const key=`mr${moduleNum}-reflection`;
  progress[key]={clicked,hard};
  saveProgress();
}

function setSkillLevel(sid, mrId, level){
  if(isReviewPanelLocked(mrId)) return;
  progress[sid] = (progress[sid] === level) ? 'none' : level;
  const lvl = progress[sid];
  document.querySelectorAll(`.week-panel[data-id="${mrId}"] .mr-row`).forEach(row=>{
    const btns = row.querySelectorAll('.mr-rb');
    if(!btns.length) return;
    const onclick = btns[0].getAttribute('onclick') || '';
    if(!onclick.includes(`'${sid}'`)) return;
    btns.forEach(b=>{
      const n = b.classList.contains('lvl1') ? '1' : b.classList.contains('lvl2') ? '2' : '3';
      b.classList.toggle('active', lvl === n);
    });
  });
  saveProgress();
}

function savePerformance(moduleNum){
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;
  const key=`mr${moduleNum}-performance`;
  const songEl=document.getElementById(`mr${moduleNum}-song`);
  const cur=progress[key]||{};
  progress[key]={song:songEl?songEl.value:'', level:cur.level||null};
  saveProgress();
}

function setPerformanceLevel(moduleNum, level){
  if(isReviewPanelLocked(`mr${moduleNum}`)) return;
  const key=`mr${moduleNum}-performance`;
  const cur=progress[key]||{};
  const newLvl=(cur.level===level)?null:level;
  progress[key]={song:cur.song||'', level:newLvl};
  const rate=document.querySelector(`.week-panel[data-id="mr${moduleNum}"] .mr-play-rate .mr-rating`);
  if(rate){
    rate.querySelectorAll('.mr-rb').forEach(b=>{
      const n=b.classList.contains('lvl1')?'1':b.classList.contains('lvl2')?'2':'3';
      b.classList.toggle('active', newLvl===n);
    });
  }
  saveProgress();
}

/* ══════════════════════════════════════════════
   RECORD YOURSELF — MediaRecorder + Firebase Storage
   One in-memory state object per module-review panel.
   ══════════════════════════════════════════════ */
const recState = {};
const REC_MAX_SECS = 90;

/* Renders the current state of one module-review's recording widget.
   Recordings are kept only in-memory for the current browser tab —
   nothing is uploaded. Students can play back and Download. */
function renderRecBody(moduleNum){
  const s = recState[moduleNum] || {};
  if (s.recording){
    return `<div class="mr-rec-active">
      <span class="mr-rec-dot"></span>
      <span class="mr-rec-time" id="mr${moduleNum}-rec-time">0:00</span>
      <button type="button" class="mr-rec-stop" onclick="stopRec(${moduleNum})">&#x25A0; Stop</button>
      <span class="mr-rec-max">max ${REC_MAX_SECS}s</span>
    </div>`;
  }
  if (s.pendingBlobUrl){
    return `<div class="mr-rec-preview">
      <audio controls src="${s.pendingBlobUrl}" class="mr-rec-audio"></audio>
      <div class="mr-rec-actions">
        <button type="button" class="mr-rec-btn" onclick="downloadRec(${moduleNum})">&#x2B07; Download</button>
        <button type="button" class="mr-rec-btn" onclick="discardRec(${moduleNum})">&#x21BB; Re-record</button>
      </div>
      <div class="mr-rec-status">Listen back as often as you like. Download to keep a copy.</div>
    </div>`;
  }
  return `<div class="mr-rec-idle">
    <button type="button" class="mr-rec-btn primary" onclick="startRec(${moduleNum})">&#x1F399; Record</button>
    <span class="mr-rec-help">Up to ${REC_MAX_SECS} seconds. Browser will ask for microphone permission.</span>
  </div>`;
}

function refreshRecUI(moduleNum){
  const host = document.getElementById(`mr${moduleNum}-rec-body`);
  if (!host) return;
  host.innerHTML = renderRecBody(moduleNum);
}

async function startRec(moduleNum){
  if (!navigator.mediaDevices || !window.MediaRecorder){
    alert('This browser does not support audio recording. Try Chrome, Edge, or Firefox on a desktop.');
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio:true });
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = e => { if (e.data && e.data.size) chunks.push(e.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach(t => t.stop());
      const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
      const s = recState[moduleNum] || {};
      s.recording = false;
      s.pendingBlob = blob;
      s.pendingBlobUrl = URL.createObjectURL(blob);
      s.statusMsg = '';
      if (s.timerInterval){ clearInterval(s.timerInterval); s.timerInterval = null; }
      if (s.autoStopTimeout){ clearTimeout(s.autoStopTimeout); s.autoStopTimeout = null; }
      recState[moduleNum] = s;
      refreshRecUI(moduleNum);
    };
    const start = Date.now();
    recState[moduleNum] = {
      recording: true,
      recorder,
      stream,
      startedAt: start,
      timerInterval: setInterval(() => {
        const el = document.getElementById(`mr${moduleNum}-rec-time`);
        if (!el) return;
        const sec = Math.floor((Date.now() - start) / 1000);
        el.textContent = `${Math.floor(sec/60)}:${String(sec%60).padStart(2,'0')}`;
      }, 250),
      autoStopTimeout: setTimeout(() => stopRec(moduleNum), REC_MAX_SECS * 1000)
    };
    recorder.start();
    refreshRecUI(moduleNum);
  } catch (err) {
    alert('Could not start microphone: ' + (err.message || err.name || 'permission denied'));
  }
}

function stopRec(moduleNum){
  const s = recState[moduleNum];
  if (!s || !s.recorder) return;
  if (s.recorder.state !== 'inactive') s.recorder.stop();
}

/* Navigating away mid-recording would otherwise leave the mic live for up
   to REC_MAX_SECS — every other mic feature on the site stops on navigation,
   so the recorder does too. Called from activateSet. */
function stopAnyRec(){
  Object.keys(recState).forEach(m => {
    if (recState[m] && recState[m].recording) stopRec(m);
  });
}

function discardRec(moduleNum){
  const s = recState[moduleNum];
  if (s && s.pendingBlobUrl) URL.revokeObjectURL(s.pendingBlobUrl);
  delete recState[moduleNum];
  refreshRecUI(moduleNum);
}

function downloadRec(moduleNum){
  const s = recState[moduleNum];
  if (!s || !s.pendingBlobUrl) return;
  const a = document.createElement('a');
  a.href = s.pendingBlobUrl;
  a.download = `guitar-class-mr${moduleNum}-${new Date().toISOString().slice(0,10)}.webm`;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

/* ── Checklist ── */
function buildChecklist(w){
  if(!w.skills||w.skills.length===0) return '<p style="font-size:0.9375rem;color:var(--text2);padding:12px 0">No skills listed for this set yet.</p>';
  const done=w.skills.filter(s=>progress[s.id]==='gotit').length;
  const pct=Math.round(done/w.skills.length*100);
  const wkSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="var(--amber-text)" stroke-width="1.5"/><path d="M6 4v2.2l1.4 1.4" stroke="var(--amber-text)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const giSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--green-text)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const rows=w.skills.map((s,i)=>{
    const st=progress[s.id]||'none';
    const helper = s.gotItWhen ? `
        <button type="button" class="sk-toggle" onclick="toggleGotIt('${s.id}', this)" aria-expanded="false" aria-controls="gi-${s.id}"><span class="sk-toggle-arrow">▾</span> What does this look like?</button>
        <div class="sk-helper" id="gi-${s.id}" hidden><strong>You've got it when:</strong> ${s.gotItWhen}</div>` : '';
    const practiceBtn = s.practice ? `
        <button type="button" class="sk-practice-btn" onclick="togglePracticePanel('${s.id}', this)" aria-expanded="false" aria-controls="pp-${s.id}"><span class="sk-practice-btn-arrow">▸</span> Practice this</button>` : '';
    const skillNum = (s.id.match(/-s(\d+)$/) || [])[1];
    const whereBtn = (skillNum && skillTaughtStation(w, Number(skillNum)))
      ? `<button type="button" class="sk-where-btn" onclick="showSkillLesson('${w.id}', ${skillNum})" title="Jump to the steps that teach this">&#x1F4CD; Show me where</button>` : '';
    const practicePanel = s.practice ? renderPracticePanel(s.practice, s.id, w.id) : '';
    return `<div class="skill-row">
      <div class="sktxt"><div class="sn" style="flex-shrink:0;margin-top:0;margin-right:8px">${i+1}</div><div class="sk-body"><div class="sk-label">${s.text}</div>${helper}${practiceBtn}${whereBtn}</div></div>
      <div class="skchk-cell working-col${st==='working'?' active':''}" role="button" tabindex="0" aria-pressed="${st==='working'}" aria-label="Still working on it: ${escAttr(s.text)}" onclick="toggleSkill('${s.id}','${w.id}','working')" title="Still working on it"><div class="skbox">${st==='working'?wkSvg:''}</div></div>
      <div class="skchk-cell gotit-col${st==='gotit'?' active':''}" role="button" tabindex="0" aria-pressed="${st==='gotit'}" aria-label="I've got it: ${escAttr(s.text)}" onclick="toggleSkill('${s.id}','${w.id}','gotit')" title="I've got it!"><div class="skbox">${st==='gotit'?giSvg:''}</div></div>
      ${practicePanel}
    </div>`;
  }).join('');
  return `<div class="cl-intro">Check each skill as you practice. Use "Still working on it" while you're learning, then mark "I've got it!" once you can do it consistently.</div>
  <div class="cl-grid-wrap">
    <div class="cl-header"><div class="cl-header-skill">Skill</div><div class="cl-header-working">Still<br>working on it</div><div class="cl-header-gotit">I've<br>got it!</div></div>
    ${rows}
  </div>
  <div class="prog-wrap"><div class="prog-row"><div class="prog-bg"><div class="prog-fill" id="pf-${w.id}" style="width:${pct}%"></div></div><div class="prog-lbl" id="pl-${w.id}">${done} / ${w.skills.length}</div></div></div>
  <div class="song-echo" id="se-${w.id}" aria-live="polite"></div>
  <div class="save-ind" id="si-${w.id}" aria-live="polite"></div>`;
}

/* ── Toggle "What does this look like?" helper ── */
function toggleGotIt(sid, btn){
  const panel = document.getElementById('gi-'+sid);
  if(!panel) return;
  const isOpen = !panel.hasAttribute('hidden');
  if(isOpen){
    panel.setAttribute('hidden','');
    btn.setAttribute('aria-expanded','false');
  } else {
    panel.removeAttribute('hidden');
    btn.setAttribute('aria-expanded','true');
  }
}

/* ── Per-skill practice panel ── */
function renderPracticePanel(practice, skillId, wid){
  if(!practice || !practice.type) return '';
  if(practice.type === 'playSeq'){
    const label = practice.label || 'Play all';
    const defBpm = practice.bpm || 60;
    const minBpm = practice.minBpm || 40;
    const maxBpm = practice.maxBpm || 120;
    const key = `bpm:practice:${skillId}`;
    const bpm = readStoredBpm(key, defBpm);
    const midis = JSON.stringify(practice.notes || []);
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">Practice this</div>` +
      `<div class="bpm-control-group">` +
        `<button type="button" class="play-seq-btn" data-midis="${escAttr(midis)}" onclick="playSequenceFromGroup(this)" title="Play all notes">&#x25B6; ${escHtml(label)}</button>` +
        renderBpmControl(key, bpm, minBpm, maxBpm) +
        coachBtnHtml(midis) +
      `</div>` +
    `</div>`;
  }
  if(practice.type === 'mc' && Array.isArray(practice.choices)){
    const key = `practice-${skillId}`;
    const storedRaw = responses[key];
    const storedIdx = (storedRaw === '' || storedRaw == null) ? -1 : parseInt(storedRaw, 10);
    const ansIdx = (typeof practice.answer === 'number') ? practice.answer : -1;
    const opts = practice.choices.map((c, idx)=>{
      let cls = 'sk-practice-mc-opt';
      if(storedIdx === idx){
        cls += (idx === ansIdx) ? ' correct' : ' incorrect';
      }
      return `<button type="button" class="${cls}" data-idx="${idx}" onclick="onPracticeMcSelect('${skillId}', ${idx}, ${ansIdx}, this)"><span>${escHtml(c)}</span></button>`;
    }).join('');
    let feedbackHtml = '';
    if(storedIdx >= 0){
      if(storedIdx === ansIdx){
        feedbackHtml = `<div class="sk-practice-feedback correct">Correct!</div>`;
      } else {
        feedbackHtml = `<div class="sk-practice-feedback incorrect">Not quite — try again.</div>`;
      }
    } else {
      feedbackHtml = `<div class="sk-practice-feedback"></div>`;
    }
    const promptHtml = practice.prompt ? `<div class="sk-practice-prompt">${escHtml(practice.prompt)}</div>` : '';
    return `<div class="sk-practice-panel" id="pp-${skillId}" hidden>` +
      `<div class="sk-practice-title">Practice this</div>` +
      promptHtml +
      `<div class="sk-practice-mc" id="pp-mc-${skillId}">${opts}</div>` +
      feedbackHtml +
    `</div>`;
  }
  return '';
}
function togglePracticePanel(sid, btn){
  const panel = document.getElementById('pp-'+sid);
  if(!panel) return;
  const isOpen = !panel.hasAttribute('hidden');
  if(isOpen){
    panel.setAttribute('hidden','');
    btn.setAttribute('aria-expanded','false');
  } else {
    panel.removeAttribute('hidden');
    btn.setAttribute('aria-expanded','true');
  }
}
function onPracticeMcSelect(skillId, idx, ansIdx, btnEl){
  const key = `practice-${skillId}`;
  responses[key] = String(idx);
  saveResponses();
  const group = document.getElementById('pp-mc-'+skillId);
  if(group){
    group.querySelectorAll('.sk-practice-mc-opt').forEach(b=>{
      b.classList.remove('correct','incorrect');
    });
  }
  btnEl.classList.add(idx === ansIdx ? 'correct' : 'incorrect');
  const panel = document.getElementById('pp-'+skillId);
  if(panel){
    const fb = panel.querySelector('.sk-practice-feedback');
    if(fb){
      fb.classList.remove('correct','incorrect');
      if(idx === ansIdx){
        fb.classList.add('correct');
        fb.textContent = 'Correct!';
      } else {
        fb.classList.add('incorrect');
        fb.textContent = 'Not quite — try again.';
      }
    }
  }
}

/* ── Toggle skill ── */
function toggleSkill(sid, wid, which){
  const cur = progress[sid]||'none';
  if(which==='working'){
    if(cur==='gotit') progress[sid]='working';
    else if(cur==='working') progress[sid]='none';
    else progress[sid]='working';
  } else {
    if(cur==='gotit') progress[sid]='working';
    else progress[sid]='gotit';
  }
  const wkSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="var(--amber-text)" stroke-width="1.5"/><path d="M6 4v2.2l1.4 1.4" stroke="var(--amber-text)" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const giSvg=`<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="var(--green-text)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const w=SETS.find(x=>x.id===wid);
  document.querySelectorAll(`.week-panel[data-id="${wid}"] .skill-row`).forEach(row=>{
    const wkCell = row.querySelector('.working-col');
    const giCell = row.querySelector('.gotit-col');
    if(!wkCell||!giCell) return;
    const onclick = wkCell.getAttribute('onclick')||'';
    const m = onclick.match(/'([^']+)'/);
    if(!m || m[1]!==sid) return;
    const st = progress[sid]||'none';
    wkCell.classList.toggle('active', st==='working');
    giCell.classList.toggle('active', st==='gotit');
    wkCell.setAttribute('aria-pressed', st==='working');
    giCell.setAttribute('aria-pressed', st==='gotit');
    wkCell.querySelector('.skbox').innerHTML = st==='working' ? wkSvg : '';
    giCell.querySelector('.skbox').innerHTML = st==='gotit'   ? giSvg : '';
  });
  if(w){
    const done=w.skills.filter(s=>progress[s.id]==='gotit').length;
    const pct=Math.round(done/w.skills.length*100);
    document.querySelectorAll(`#pf-${wid}`).forEach(el=>el.style.width=pct+'%');
    document.querySelectorAll(`#pl-${wid}`).forEach(el=>el.textContent=done+' / '+w.skills.length);
    // Song-thread echo: a fresh "I've got it!" in a badged set names the song
    // that just grew (rotates through the set's songs).
    if(progress[sid]==='gotit' && w.songThread && w.songThread.length){
      const echoEl = document.getElementById('se-'+wid);
      if(echoEl){
        const t = w.songThread[(done - 1) % w.songThread.length];
        echoEl.textContent = t.layer
          ? `\u{1F3B8} You just built more of ${t.name} — that\u2019s ${t.bonus ? 'Bonus ' : ''}Layer ${t.layer} work.`
          : `\u{1F3B8} You can now play more of ${t.name}.`;
        echoEl.classList.add('show');
        clearTimeout(echoEl._echoT);
        echoEl._echoT = setTimeout(()=>{ echoEl.classList.remove('show'); }, 5000);
      }
    }
  }
  renderPills(lastModuleNum);
  document.querySelectorAll('.wpill').forEach(b=>{if(b.dataset.id===wid)b.classList.add('active');});
  // Live-update the module dropdown counts + progress strip so marking a skill
  // reflects immediately without leaving the set.
  populateModuleDropdown();
  renderProgressStrip();
  saveProgress();
}

/* ── Translate toggle ── */
let isSpanish = false;
function toggleTranslate(){
  const btn = document.getElementById('btn-translate');
  const lbl = document.getElementById('translate-label');
  if(!isSpanish){
    const select = document.querySelector('.goog-te-combo');
    if(select){ select.value='es'; select.dispatchEvent(new Event('change')); }
    else { document.cookie='googtrans=/en/es; path=/'; location.reload(); return; }
    btn.classList.add('active'); lbl.textContent='English'; isSpanish=true;
  } else {
    const select = document.querySelector('.goog-te-combo');
    if(select){ select.value='en'; select.dispatchEvent(new Event('change')); }
    else { document.cookie='googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; location.reload(); return; }
    btn.classList.remove('active'); lbl.textContent='Español'; isSpanish=false;
  }
}

/* ══════════════════════════════════════════════
   FLOATING TOOLS — Metronome & Timer
   ══════════════════════════════════════════════ */
let metroRunning=false, metroInterval=null, audioCtx=null;
function getAudioCtx(){ if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)(); return audioCtx; }
function beep(freq,dur){ const ctx=getAudioCtx(); const o=ctx.createOscillator(),g=ctx.createGain(); o.connect(g); g.connect(ctx.destination); o.frequency.value=freq; g.gain.setValueAtTime(0.4,ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+dur); o.start(); o.stop(ctx.currentTime+dur); }
/* Reusable single-note player. Karplus-Strong plucked-string
   synthesis: a short noise burst is fed into a feedback delay
   line whose length equals one period of the target pitch. A
   one-pole lowpass in the loop causes harmonics to decay over
   time — high notes fade faster than low notes, like a real
   guitar string. midi=69 → A4 (440Hz). */
function playNote(midi){
  const ctx = getAudioCtx();
  if (ctx.state === 'suspended') ctx.resume();
  const freq = 440 * Math.pow(2, (midi - 69) / 12);
  const sr = ctx.sampleRate;
  const period = Math.max(2, Math.floor(sr / freq));
  const total = Math.floor(sr * 1.5);
  const ring = new Float32Array(period);
  let prev = 0;
  for (let i = 0; i < period; i++){
    const noise = Math.random() * 2 - 1;
    prev = 0.5 * (noise + prev);
    ring[i] = prev;
  }
  const buffer = ctx.createBuffer(1, total, sr);
  const data = buffer.getChannelData(0);
  const decay = 0.984;
  let idx = 0;
  for (let i = 0; i < total; i++){
    data[i] = ring[idx];
    const next = (idx + 1) % period;
    ring[idx] = decay * 0.5 * (ring[idx] + ring[next]);
    idx = next;
  }
  const src = ctx.createBufferSource();
  src.buffer = buffer;
  const g = ctx.createGain();
  g.gain.value = 0.6;
  src.connect(g);
  g.connect(ctx.destination);
  src.start();
}
/* Play one TAB beat: 1 midi = single note, N midis = chord, all at once. */
function playBeat(btnEl){
  if(window.coachMicLive) return;  // demo audio would score itself while the Coach listens
  let midis = [];
  try { midis = JSON.parse(btnEl.dataset.midis || '[]'); } catch (e) { return; }
  midis.forEach(m => playNote(Number(m)));
}
let playSeqState = null;
function stopPlaySeq(){
  if(!playSeqState) return;
  playSeqState.timeouts.forEach(clearTimeout);
  if(playSeqState.btn){
    playSeqState.btn.innerHTML = playSeqState.idleHtml || '&#x25B6; Play all';
    playSeqState.btn.classList.remove('playing');
  }
  if(playSeqState.tabRoot){
    playSeqState.tabRoot.querySelectorAll('.beat-now').forEach(el=>el.classList.remove('beat-now'));
  }
  playSeqState = null;
}
/* Kill every site-generated sound (demo sequences, chord strums, metronome
   click). The Coach/games call this when the mic goes live so the analyser
   never scores the speakers. */
function stopAllDemoAudio(){
  stopPlaySeq();
  chordStrumTimeouts.forEach(clearTimeout);
  chordStrumTimeouts = [];
  // clearing the strum timeouts also cancels their '.playing' cleanup — sweep it
  document.querySelectorAll('.playing').forEach(el => el.classList.remove('playing'));
  if(metroRunning) stopMetro();
}
function playSequence(midis, bpm, btnEl){
  if(playSeqState){
    const wasSame = playSeqState.btn === btnEl;
    stopPlaySeq();                 // the STOP half of the toggle must work even mid-check
    if(wasSame) return;
  }
  if(window.coachMicLive) return;  // but no NEW demo audio while the Coach listens
  const interval = 60000 / (bpm || 60);
  /* Beat cursor: when the button lives inside a TAB, highlight the sounding
     column — the moving thing is the thing making noise (Ableton's rule). */
  const tabRoot = btnEl ? btnEl.closest('.tab') : null;
  const timeouts = midis.map((m, i) => setTimeout(() => {
    (Array.isArray(m) ? m : [m]).forEach(x => playNote(Number(x)));
    if(tabRoot){
      tabRoot.querySelectorAll('.beat-now').forEach(el=>el.classList.remove('beat-now'));
      tabRoot.querySelectorAll(`[data-seq="${i}"]`).forEach(el=>el.classList.add('beat-now'));
    }
  }, i * interval));
  timeouts.push(setTimeout(stopPlaySeq, midis.length * interval));
  const idleHtml = btnEl ? btnEl.innerHTML : null;
  playSeqState = { timeouts, btn: btnEl, idleHtml, tabRoot };
  if(btnEl){
    btnEl.innerHTML = '&#x23F8; Stop';
    btnEl.classList.add('playing');
  }
}
/* ── BPM slider helpers ── */
function readStoredBpm(key, defBpm){
  if(!key) return defBpm;
  try{
    const v = localStorage.getItem(key);
    if(v != null){
      const n = parseInt(v, 10);
      if(!isNaN(n)) return n;
    }
  }catch(e){}
  return defBpm;
}
function renderBpmControl(key, value, minBpm, maxBpm){
  const min = minBpm || 40;
  const max = maxBpm || 120;
  const v = Math.max(min, Math.min(max, value || 60));
  return `<span class="bpm-control">` +
    `<input type="range" class="bpm-slider" min="${min}" max="${max}" step="1" value="${v}" data-key="${escAttr(key)}" aria-label="Tempo in BPM" oninput="onBpmSliderChange(this)">` +
    `<span class="bpm-readout">${v} BPM</span>` +
  `</span>`;
}
function onBpmSliderChange(slider){
  const readout = slider.parentNode && slider.parentNode.querySelector('.bpm-readout');
  if(readout) readout.textContent = slider.value + ' BPM';
  const key = slider.dataset.key;
  if(key){
    try{ localStorage.setItem(key, slider.value); }catch(e){}
  }
}
/* Read the BPM slider that shares a .bpm-control-group with this button.
   Single reader for the group markup contract — playSequenceFromGroup and
   the Listening Coach's coachOpen both use it. */
function readGroupBpm(btn, def){
  const group = btn.closest('.bpm-control-group');
  const slider = group ? group.querySelector('.bpm-slider') : null;
  const bpm = slider ? parseInt(slider.value, 10) : NaN;
  return isNaN(bpm) ? (def || 60) : bpm;
}
function playSequenceFromGroup(btn){
  let midis;
  try{ midis = JSON.parse(btn.dataset.midis); }catch(e){ return; }
  if(!Array.isArray(midis) || !midis.length) return;
  playSequence(midis, readGroupBpm(btn), btn);
}
/* ── Listening Coach hooks — coach.js owns the card/scoring; these just
      emit the buttons next to playable content. midisJson is the same
      JSON string the sibling ▶ Play button carries. tabNotesJson, when the
      caller has a real TAB spec, carries [{string,fret,note,midi},…] so the
      coach card can show WHERE to play each note; without it coach.js
      derives a fingering itself. ── */
function coachBtnHtml(midisJson, tabNotesJson){
  const tabAttr = tabNotesJson ? ` data-tabnotes="${escAttr(tabNotesJson)}"` : '';
  return `<button type="button" class="coach-btn" data-midis="${escAttr(midisJson)}"${tabAttr} onclick="coachOpen(this)" title="Play it into the mic and get feedback">&#x1F3A4; Listening Coach</button>`;
}
/* Chord steps: build [{n:name, m:[midis]}] from the step's own diagram
   specs (same fret math as chordMidis — frets are absolute). */
function coachChordBtnRowHtml(chords){
  const spec = (chords||[]).filter(c=>c && c.name && Array.isArray(c.chord)).map(c=>({
    n: c.name,
    m: chordSpecMidis(c.chord)
  })).filter(c=>c.m.length);
  if(!spec.length) return '';
  return `<div class="coach-chord-row"><button type="button" class="coach-btn" data-chords="${escAttr(JSON.stringify(spec))}" onclick="coachOpen(this)" title="4 count-in clicks, then strum on every beat — the mic listens and gives feedback">&#x1F3A4; Listening Coach</button></div>`;
}
function tick(){ if(!window.coachMicLive) beep(880,0.06); const dot=document.getElementById('metro-dot'); if(dot){ dot.classList.add('flash'); setTimeout(()=>dot.classList.remove('flash'),80); } }
function getBpm(){ return parseInt(document.getElementById('bpm-slider').value); }
function onBpmSlider(val){ document.getElementById('bpm-display').textContent=val; if(metroRunning){ stopMetro(); startMetro(); } }
function nudgeBpm(d){ const s=document.getElementById('bpm-slider'); s.value=Math.min(220,Math.max(40,getBpm()+d)); document.getElementById('bpm-display').textContent=s.value; if(metroRunning){ stopMetro(); startMetro(); } }
function startMetro(){ if(window.coachMicLive) return; tick(); metroInterval=setInterval(tick,Math.round(60000/getBpm())); metroRunning=true; document.getElementById('metro-btn').innerHTML='&#x23F8; Stop'; }
function stopMetro(){ clearInterval(metroInterval); metroRunning=false; document.getElementById('metro-btn').innerHTML='&#x25B6; Start'; }
function toggleMetro(){ if(metroRunning) stopMetro(); else startMetro(); }

/* ── Timer ── */
let timerRunning=false, timerInterval=null, timerSecs=30, timerSelected=30;
function setTimerSecs(secs){ timerSelected=secs; timerSecs=secs; if(timerRunning){ clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML='&#x25B6; Start'; } updateTimerDisplay(); [30,60,120,180,240,300].forEach(s=>{ const el=document.getElementById('tp-'+s); if(el) el.classList.toggle('sel',s===secs); }); }
function updateTimerDisplay(){ const m=Math.floor(timerSecs/60),s=timerSecs%60; document.getElementById('timer-display').textContent=m+':'+(s<10?'0':'')+s; }
/* One-shot animation helper: restart a CSS animation class even if it's
   already applied (remove → force reflow → add), then clear it after ms. */
function flashClass(el, cls, ms){
  if(!el) return;
  el.classList.remove(cls); void el.offsetWidth;
  el.classList.add(cls);
  setTimeout(()=>el.classList.remove(cls), ms);
}
// Flash the display when time's up — visible across a loud room without headphones.
function flashTimerDisplay(){ flashClass(document.getElementById('timer-display'),'timer-done-flash',2400); }
// Pulse the floating timer button too — it's visible even when the popup is closed.
function flashTimerFab(){ flashClass(document.getElementById('fab-timer'),'fab-timer-done',3600); }
function resetTimer(){ if(timerRunning){ clearInterval(timerInterval); timerRunning=false; } timerSecs=timerSelected; updateTimerDisplay(); document.getElementById('timer-btn').innerHTML='&#x25B6; Start'; }
function toggleTimer(){ if(timerRunning){ clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML='&#x25B6; Start'; } else { timerRunning=true; document.getElementById('timer-btn').innerHTML='&#x23F8; Pause'; timerInterval=setInterval(()=>{ if(timerSecs>0){ timerSecs--; updateTimerDisplay(); } else { clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML='&#x25B6; Start'; [0,0.35,0.7].forEach(d=>setTimeout(()=>beep(660,0.3),d*1000)); flashTimerDisplay(); flashTimerFab(); } },1000); } }

/* ── Popup logic ── */
function setFabExpanded(which, isOpen){ const f=document.getElementById('fab-'+which); if(f) f.setAttribute('aria-expanded', isOpen?'true':'false'); }
function togglePopup(which){
  const open=document.getElementById(which+'-popup').classList.toggle('open');
  setFabExpanded(which, open);
  // The tuner has no Start/Stop button — opening it starts listening, closing stops.
  // One mic owner at a time: the tuner interrupts a live Listening Coach check
  // and stops any running game mic; the games do the reverse themselves.
  if(which==='tuner'){ if(open){ if(typeof coachInterrupt==='function') coachInterrupt(); if(typeof gamesStopMic==='function') gamesStopMic(); stopAllDemoAudio(); startTuner(); } else { stopTuner(); } }
}
function closePopup(which){ document.getElementById(which+'-popup').classList.remove('open'); setFabExpanded(which, false); if(which==='metro') stopMetro(); if(which==='tuner') stopTuner(); }
document.addEventListener('click',e=>{
  if(!e.target.closest('.tool-popup')&&!e.target.closest('.fab')&&!e.target.closest('.fab-buttons')){
    ['metro','timer','tuner'].forEach(closePopup);
  }
});
// Escape closes any open tool popup (a11y)
document.addEventListener('keydown',e=>{
  if(e.key!=='Escape') return;
  ['metro','timer','tuner'].forEach(w=>{ const el=document.getElementById(w+'-popup'); if(el&&el.classList.contains('open')) closePopup(w); });
  const wo=document.getElementById('welcome-overlay'); if(wo&&wo.style.display!=='none') dismissWelcome();
  const vo=document.getElementById('video-overlay'); if(vo&&!vo.hidden) clearPanel();
  const gs=document.getElementById('games-screen'); if(gs&&!gs.hasAttribute('hidden')&&typeof closeGamesScreen==='function') closeGamesScreen();
  if(document.body.classList.contains('rail-open')) closeRail();
});

/* Keep --hdr in sync with the header's real rendered height — on narrow
   screens the title can wrap to two lines, and the drawer/backdrop below
   position themselves off this variable, so a stale 70px would leave a gap
   or an overlap. */
function syncHeaderHeight(){
  const h = document.querySelector('.header');
  if(h) document.documentElement.style.setProperty('--hdr', h.offsetHeight + 'px');
}
window.addEventListener('resize', syncHeaderHeight);
syncHeaderHeight();
if(document.fonts && document.fonts.ready) document.fonts.ready.then(syncHeaderHeight);

/* ── Mobile nav drawer: below 760px the rail slides in as an overlay instead
   of stacking in the page flow (see styles.css @media(max-width:760px)). ── */
function isNarrowLayout(){ return window.matchMedia('(max-width:760px)').matches; }
function setRailOpen(open){
  document.body.classList.toggle('rail-open', open);
  const btn = document.getElementById('rail-toggle-btn');
  if(btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}
function toggleRail(){ setRailOpen(!document.body.classList.contains('rail-open')); }
function closeRail(){ setRailOpen(false); }
window.addEventListener('resize', () => { if(!isNarrowLayout()) closeRail(); });
// Picking a station or an Explore item shows the main content — close the
// drawer so students actually see it instead of the nav still covering it.
document.getElementById('nav-rail')?.addEventListener('click', e => {
  if(!isNarrowLayout()) return;
  if(e.target.closest('.rail-station, .nav-btn')) closeRail();
});
// Keyboard activation for non-<button> controls that carry role="button"
// (the skill checkboxes and station cards are <div>s for layout reasons).
// Enter or Space fires their click, so keyboard-only students can mark skills
// and open stations. Space is prevented from scrolling the page.
document.addEventListener('keydown',e=>{
  if(e.key!=='Enter'&&e.key!==' '&&e.key!=='Spacebar') return;
  const el=e.target.closest('[role="button"]');
  if(!el||el.tagName==='BUTTON'||el.tagName==='A') return;
  e.preventDefault();
  el.click();
});

/* ── Resource viewer (floating mini-player) ──
   Same loadPanel(type,url,title,subtitle) contract as the old side panel,
   so every rp-trigger / song / chord-link call site works unchanged — the
   content opens in a draggable floating card and the page stays usable,
   so a step's questions are visible while its video plays. */
function loadPanel(type,url,title,subtitle){
  const overlay=document.getElementById('video-overlay');
  const content=document.getElementById('rp-content');
  const wrap=document.getElementById('rp-iframe-wrap');
  const meta=document.getElementById('rp-meta');
  const newtab=document.getElementById('rp-newtab');
  const close=document.getElementById('rp-close');
  overlay.hidden=false;
  document.body.classList.add('viewer-open');   // hides the FAB pills (they covered the player's controls)
  clampViewer(overlay);   // a drag on a bigger window could strand it off-screen
  content.classList.add('visible'); newtab.classList.add('visible'); close.classList.add('visible');
  newtab.href=url;
  meta.innerHTML=`<div class="rp-meta-title">${title}</div><div class="rp-meta-sub">${subtitle}</div>`;
  if(type==='youtube'){
    let embedUrl=url;
    const ytMatch=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if(ytMatch){
      // carry a ?t=/&start= timestamp into the embed so timed links land right
      const tMatch=url.match(/[?&](?:t|start)=(\d+)/);
      embedUrl=`https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1${tMatch?`&start=${tMatch[1]}`:''}`;
    }
    wrap.className='rp-iframe-wrap rp-youtube';
    // Some videos (age-restricted / label-limited) only play on YouTube itself,
    // and embed failures can't be detected cross-origin — always offer the out.
    wrap.innerHTML=`<div class="rp-video-box"><iframe src="${embedUrl}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe></div>
      <div class="rp-embed-fallback">Not playing? Some videos only allow playback on YouTube — <a href="${escAttr(url)}" target="_blank" rel="noopener">watch it there &#x2197;</a></div>`;
  } else if(type==='pdf'){
    wrap.className='rp-iframe-wrap rp-doc';
    wrap.innerHTML=`<iframe src="${url}"></iframe>`;
  } else if(type==='gdoc'){
    const embedUrl=url.includes('/preview')?url:url.replace(/\/edit.*$/,'/preview');
    wrap.className='rp-iframe-wrap rp-doc';
    wrap.innerHTML=`<iframe src="${embedUrl}"></iframe>`;
  } else if(type==='chord'){
    /* For chord type, `url` carries the chord NAME — render the diagram locally */
    const chordName = url;
    wrap.className='rp-iframe-wrap rp-chord';
    const svg = localChordSvg(chordName);
    if (svg){
      const hasAudio = chordMidis(chordName).length > 0;
      const playBtn = hasAudio
        ? `<button type="button" class="rp-chord-play" onclick="strumChord('${escAttr(chordName)}', this)" title="Strum this chord">&#x25B6; Play chord</button>`
        : '';
      wrap.innerHTML = `<div class="rp-chord-svg">${svg}</div>${playBtn}`;
      newtab.classList.remove('visible'); // local render — no external URL to open
    } else {
      wrap.innerHTML = `<div class="rp-chord-err">No diagram available for "${escHtml(chordName)}".</div>`;
      newtab.classList.remove('visible');
    }
  } else if(type==='string'){
    /* For string type, `url` carries the string KIND (lowE/A/D/G/B/highE) */
    const kind = url;
    wrap.className='rp-iframe-wrap rp-chord wide';
    const svg = localStringFretboardSvg(kind);
    if (svg){
      wrap.innerHTML = `<div class="rp-chord-svg">${svg}</div>`;
      newtab.classList.remove('visible');
    } else {
      wrap.innerHTML = `<div class="rp-chord-err">Unknown string: ${escHtml(kind)}</div>`;
      newtab.classList.remove('visible');
    }
  } else if(type==='note'){
    /* For note type, `url` carries "kind|fret|note" */
    const [kind, fretStr, note] = String(url).split('|');
    const fret = Number(fretStr);
    wrap.className='rp-iframe-wrap rp-chord wide';
    const svg = localNoteSvg(kind, fret, note);
    if (svg){
      wrap.innerHTML = `<div class="rp-chord-svg">${svg}</div>`;
      newtab.classList.remove('visible');
    } else {
      wrap.innerHTML = `<div class="rp-chord-err">No diagram for ${escHtml(note||'')}</div>`;
      newtab.classList.remove('visible');
    }
  }
}
function clearPanel(){
  const overlay=document.getElementById('video-overlay');
  const content=document.getElementById('rp-content');
  const wrap=document.getElementById('rp-iframe-wrap');
  const newtab=document.getElementById('rp-newtab');
  const close=document.getElementById('rp-close');
  content.classList.remove('visible'); newtab.classList.remove('visible'); close.classList.remove('visible');
  wrap.className='rp-iframe-wrap'; wrap.innerHTML='';   // removing the iframe stops playback
  if(overlay) overlay.hidden=true;
  document.body.classList.remove('viewer-open');
}

/* Keep the mini-player inside the viewport (after drags / window resizes). */
function clampViewer(box){
  if(!box || !box.style.left) return;   // never dragged — still CSS-docked bottom-right
  const w=box.offsetWidth||480, headroom=60;
  box.style.left=Math.min(Math.max(parseFloat(box.style.left),8),Math.max(8,window.innerWidth-w-8))+'px';
  box.style.top=Math.min(Math.max(parseFloat(box.style.top),8),Math.max(8,window.innerHeight-headroom))+'px';
}

/* Drag the mini-player by its header so it can sit wherever it doesn't
   block the step being read. First drag converts the CSS right/bottom
   docking into explicit left/top. While dragging, the iframe stops
   swallowing pointer events (.dragging CSS). */
(function(){
  const box=document.getElementById('video-overlay');
  if(!box) return;
  const head=box.querySelector('.vm-head');
  if(!head) return;
  let dragging=false,dx=0,dy=0;
  function start(x,y,target){
    if(target.closest('button,a')) return false;
    const r=box.getBoundingClientRect();
    box.style.left=r.left+'px'; box.style.top=r.top+'px';
    box.style.right='auto'; box.style.bottom='auto';
    dx=x-r.left; dy=y-r.top;
    dragging=true;
    box.classList.add('dragging');
    document.body.style.userSelect='none';
    return true;
  }
  function move(x,y){
    if(!dragging) return;
    box.style.left=Math.min(Math.max(x-dx,8),Math.max(8,window.innerWidth-box.offsetWidth-8))+'px';
    box.style.top=Math.min(Math.max(y-dy,8),Math.max(8,window.innerHeight-60))+'px';
  }
  function end(){
    if(!dragging) return;
    dragging=false;
    box.classList.remove('dragging');
    document.body.style.userSelect='';
  }
  const onMouseMove=e=>move(e.clientX,e.clientY);
  const onTouchMove=e=>{ e.preventDefault(); move(e.touches[0].clientX,e.touches[0].clientY); };
  function attach(){
    document.addEventListener('mousemove',onMouseMove);
    document.addEventListener('mouseup',endDrag);
    document.addEventListener('touchmove',onTouchMove,{passive:false});
    document.addEventListener('touchend',endDrag);
  }
  function endDrag(){
    end();
    document.removeEventListener('mousemove',onMouseMove);
    document.removeEventListener('mouseup',endDrag);
    document.removeEventListener('touchmove',onTouchMove);
    document.removeEventListener('touchend',endDrag);
  }
  head.addEventListener('mousedown',e=>{ if(start(e.clientX,e.clientY,e.target)){ e.preventDefault(); attach(); } });
  head.addEventListener('touchstart',e=>{ if(start(e.touches[0].clientX,e.touches[0].clientY,e.target)){ e.preventDefault(); attach(); } },{passive:false});
  window.addEventListener('resize',()=>clampViewer(box));
})();

/* ══════════════════════════════════════════════
   NAVIGATION — panel footers, back-to-top,
   checklist→lesson jumps, Songs hub, site search
   ══════════════════════════════════════════════ */

/* "Keep going" footer for each set tab-panel: the bottom of a long station
   used to be a dead end — you had to scroll back up to continue. */
function panelFooter(w, tab){
  const btn = (label, onclick) =>
    `<button type="button" class="panel-next-btn" onclick="${onclick}">${label} &rarr;</button>`;
  let inner = '';
  if(tab === 'station-b'){
    inner = btn('Next: Station C — practice it', `switchTabById('${w.id}','station-c')`);
  } else if(tab === 'station-c' || tab === 'songs'){
    inner = btn('Next: My skills checklist', `switchTabById('${w.id}','checklist')`);
  } else if(tab === 'checklist'){
    const sets = SETS.filter(x => x.moduleNum === w.moduleNum && !x.comingSoon);
    const i = sets.findIndex(x => x.id === w.id);
    if(i >= 0 && i < sets.length - 1){
      const next = sets[i + 1];
      inner = btn(`Next: ${escHtml(next.label || 'the next set')}`, `goToSet('${next.id}')`);
    } else if(MODULE_REVIEWS[w.moduleNum]){
      inner = btn('Next: Module Review', `goToSet('mr${w.moduleNum}')`);
    }
  }
  return inner ? `<div class="panel-next">${inner}</div>` : '';
}

/* Switch a set's tab from anywhere (footer buttons, skill jumps) by finding
   the real tabs-card button so active-state styling stays consistent. */
function switchTabById(wid, tab, keepScroll){
  const panel = document.getElementById(`${wid}-${tab}`);
  if(!panel) return;
  const wrap = panel.closest('.week-panel');
  const cardBtn = wrap && wrap.querySelector(tab === 'songs' ? '.tabs-songs' : `.tabs-card.tab-${tab}`);
  if(cardBtn) switchTab(cardBtn, wid, tab);
  if(!keepScroll){
    const tabs = wrap && wrap.querySelector('.tabs');
    (tabs || panel).scrollIntoView({ block: 'start', behavior: 'smooth' });
  }
}

/* Which station (if any) teaches set-skill number n? Steps tag themselves
   with skills:[n] in the module data. */
function skillTaughtStation(w, n){
  for(const st of ['b','c']){
    const stn = w.stations && w.stations[st];
    if(!stn) continue;
    const sections = stn.sections || (stn.steps ? [{steps: stn.steps}] : []);
    for(const sec of sections){
      if((sec.steps || []).some(step => (step.skills || []).includes(n))) return st;
    }
  }
  return null;
}

/* Checklist "Show me where": switch to the station that teaches the skill,
   expand the sections holding its steps, scroll there and flash them. */
function showSkillLesson(wid, n){
  const w = SETS.find(x => x.id === wid);
  if(!w) return;
  const st = skillTaughtStation(w, Number(n));
  if(!st) return;
  switchTabById(wid, `station-${st}`, true);
  const panel = document.getElementById(`${wid}-station-${st}`);
  if(!panel) return;
  const matches = [...panel.querySelectorAll('li.step[data-skills]')]
    .filter(li => li.dataset.skills.split(',').includes(String(n)));
  if(!matches.length) return;
  matches.forEach(li => {
    const sec = li.closest('.sc-sec');
    if(sec && !sec.classList.contains('open')){
      sec.classList.add('open');
      const head = sec.querySelector('.sc-sec-head');
      if(head) head.setAttribute('aria-expanded', 'true');
    }
    flashClass(li, 'step-flash', 2600);
  });
  matches[0].scrollIntoView({ block: 'center', behavior: 'smooth' });
}

/* Deep-link to one step (used by search results): activate module + set,
   switch to its station tab, open the section, scroll + flash the step. */
async function jumpToStep(moduleNum, wid, station, secIdx, stepIdx){
  if(await gatedJumpGuard(moduleNum, wid)) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum, wid);
  saveProgress();
  switchTabById(wid, `station-${station}`, true);
  const panel = document.getElementById(`${wid}-station-${station}`);
  if(!panel) return;
  const sections = panel.querySelectorAll('.sc-sec');
  let li = null;
  if(sections.length && sections[secIdx]){
    const sec = sections[secIdx];
    if(!sec.classList.contains('open')){
      sec.classList.add('open');
      const head = sec.querySelector('.sc-sec-head');
      if(head) head.setAttribute('aria-expanded', 'true');
    }
    li = sec.querySelectorAll(':scope .sc-sec-body > ul.steps > li.step')[stepIdx] ||
         sec.querySelectorAll('li.step')[stepIdx];
  } else {
    li = panel.querySelectorAll('li.step')[stepIdx];
  }
  if(li){
    flashClass(li, 'step-flash', 2600);
    li.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }
}

/* ── Back to top ── */
function initBackToTop(){
  const btn = document.getElementById('back-to-top');
  if(!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('show', window.scrollY > 600);
  }, { passive: true });
}
initBackToTop();

/* ── Top-bar panels (Songs hub · Search) — one open at a time, and they
      close Games too so the top of the page stays tidy. (The Daily 5 is a
      popup opened from Station C now, not a top-bar panel.) ── */
function closeTopPanels(except){
  ['games', 'songs-hub', 'search'].forEach(k => {
    if(k === except) return;
    const p = document.getElementById(k === 'games' ? 'games-screen' : k + '-panel');
    if(p && !p.hasAttribute('hidden')){
      if(k === 'games' && typeof closeGamesScreen === 'function'){ closeGamesScreen(); return; }
      p.setAttribute('hidden', '');
      const b = document.getElementById(k + '-btn');
      if(b) b.setAttribute('aria-expanded', 'false');
    }
  });
}

/* Picking a Set or Module review from the rail while Songs/Search/Games is
   open used to silently switch the set underneath the still-open panel — the
   click "did nothing" as far as the student could see. Close whichever panel
   is covering the page and scroll up so the new set is actually visible. */
function leaveTopPanelForSet(){
  const covering = ['games-screen', 'songs-hub-panel', 'search-panel']
    .some(id => { const el = document.getElementById(id); return el && !el.hasAttribute('hidden'); });
  if(!covering) return;
  closeTopPanels('');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* Load every module's data (not its panels) — the Songs hub and search
   need the whole catalogue. Modules are small and the SW precaches them. */
function ensureAllModuleData(){
  return Promise.all(MODULE_MANIFEST.map(m => loadModuleData(m.num).catch(() => {})));
}

/* ── ♪ Songs hub: every song on the site, deduped, core six first ── */
async function toggleSongsHub(){
  const p = document.getElementById('songs-hub-panel');
  const btn = document.getElementById('songs-hub-btn');
  if(!p) return;
  const open = p.hasAttribute('hidden');
  if(!open){ p.setAttribute('hidden', ''); if(btn) btn.setAttribute('aria-expanded', 'false'); return; }
  closeTopPanels('songs-hub');
  p.removeAttribute('hidden');
  if(btn) btn.setAttribute('aria-expanded', 'true');
  p.innerHTML = `<div class="daily5-head"><span>&#x266A; All the songs</span><button type="button" class="tp-close" onclick="toggleSongsHub()" aria-label="Close songs">&#x2715;</button></div><div class="coach-tip">Loading the song list…</div>`;
  await ensureAllModuleData();
  const byName = new Map();
  const noteSong = (song, moduleNum) => {
    const e = byName.get(song.name) || { song, modules: new Set() };
    e.modules.add(moduleNum);
    if(song.journeyUrl && !e.song.journeyUrl) e.song = song;
    byName.set(song.name, e);
  };
  SETS.filter(w => w.moduleNum === 1 && w.songs).forEach(w => w.songs.forEach(sg => noteSong(sg, 1)));
  const MS = globalThis.MODULE_SONGS || {};
  Object.keys(MS).forEach(m => MS[m].forEach(sg => noteSong(sg, Number(m))));
  const entries = [...byName.values()];
  entries.sort((a, b) => (b.song.core === true) - (a.song.core === true) || a.song.name.localeCompare(b.song.name));
  songsHubList = entries.map(e => e.song);
  const rows = entries.map((e, idx) => {
    const sg = e.song;
    const mods = [...e.modules].sort((a, b) => a - b);
    const modBtns = mods.map(m =>
      `<button type="button" class="sh-mod-btn" onclick="songHubGoModule(${m})" title="Open Module ${m}">M${m}</button>`).join('');
    /* Index-based handlers (like loadModuleSongVid): song names with
       apostrophes (Sweet Child O' Mine…) break when inlined into onclick. */
    const vids = [];
    if(sg.journeyUrl) vids.push(`<button class="song-vid-btn" onclick="songsHubVid(${idx},'journey')" title="One song, five layers">&#x1F9F5; Song Journey</button>`);
    if(sg.tutorialUrl) vids.push(`<button class="song-vid-btn tut" onclick="songsHubVid(${idx},'tutorial')"><span class="svb-play">&#x25B6;</span>Tutorial</button>`);
    if(sg.backingUrl) vids.push(`<button class="song-vid-btn" onclick="songsHubVid(${idx},'backing')"><span class="svb-play">&#x25B6;</span>&#x1F3B5; Backing${sg.backingKey ? ` (${escHtml(sg.backingKey)})` : ''}</button>`);
    if(sg.originalUrl) vids.push(`<button class="song-vid-btn" onclick="songsHubVid(${idx},'original')" title="Opens on YouTube"><span class="svb-play">&#x25B6;</span>Original <span style="font-size:0.6875rem;opacity:0.6">&#x2197;</span></button>`);
    return `<div class="song-row"><div class="dot ${sg.core ? 'dc' : 'dch'}"></div>
      <div><div class="sname">${escHtml(sg.name)}</div><div class="smeta">${sg.meta ? escHtml(sg.meta) + ' · ' : ''}Taught in: ${modBtns}</div></div>
      ${vids.length ? `<div class="song-vids">${vids.join('')}</div>` : ''}
      <span class="stag ${sg.core ? 'stag-core' : ''}">${escHtml(sg.type || (sg.core ? 'Core' : 'Choice'))}</span></div>`;
  }).join('');
  p.innerHTML = `<div class="daily5-head"><span>&#x266A; All the songs</span><button type="button" class="tp-close" onclick="toggleSongsHub()" aria-label="Close songs">&#x2715;</button></div>
    <div class="legend"><div class="leg"><div class="dot dc" style="margin-top:0"></div>Core — everyone learns these</div><div class="leg"><div class="dot dch" style="margin-top:0"></div>Choice menu</div></div>
    <div class="card">${rows}</div>`;
}
let songsHubList = [];
function songsHubVid(idx, kind){
  openSongVid(songsHubList[idx], kind);
}
async function songHubGoModule(m){
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(m);
  await onModuleChange(m);
  saveProgress();
  closeTopPanels('');
  // onModuleChange → activateSet restored the target set's scroll (top if new).
}

/* ── 🔍 Site search: steps, skills, and set titles across all modules ── */
let searchIndex = null;
async function buildSearchIndex(){
  await ensureAllModuleData();
  const ix = [];
  SETS.forEach(w => {
    if(w.comingSoon) return;
    if(w.unit) ix.push({ kind: 'set', moduleNum: w.moduleNum, wid: w.id, label: w.label, text: w.unit });
    (w.skills || []).forEach(sk => {
      const num = (sk.id.match(/-s(\d+)$/) || [])[1];
      ix.push({ kind: 'skill', moduleNum: w.moduleNum, wid: w.id, label: w.label, text: sk.text, skillNum: num ? Number(num) : null });
    });
    ['b', 'c'].forEach(st => {
      const stn = w.stations && w.stations[st];
      if(!stn) return;
      const sections = stn.sections || (stn.steps ? [{title: '', steps: stn.steps}] : []);
      sections.forEach((sec, secIdx) => (sec.steps || []).forEach((step, stepIdx) => {
        const text = stripTags(step.text || '');
        if(text) ix.push({ kind: 'step', moduleNum: w.moduleNum, wid: w.id, label: w.label, station: st, secIdx, stepIdx, secTitle: sec.title || '', text });
      }));
    });
  });
  return ix;
}
async function toggleSearch(){
  const p = document.getElementById('search-panel');
  const btn = document.getElementById('search-btn');
  if(!p) return;
  const open = p.hasAttribute('hidden');
  if(!open){ p.setAttribute('hidden', ''); if(btn) btn.setAttribute('aria-expanded', 'false'); return; }
  closeTopPanels('search');
  p.removeAttribute('hidden');
  if(btn) btn.setAttribute('aria-expanded', 'true');
  p.innerHTML = `<div class="daily5-head"><span>&#x1F50D; Find it</span><button type="button" class="tp-close" onclick="toggleSearch()" aria-label="Close search">&#x2715;</button></div>
    <input type="search" class="search-input" id="search-input" placeholder="Try &quot;F chord&quot;, &quot;folk strum&quot;, &quot;pentatonic&quot;…" oninput="runSearch(this.value)" aria-label="Search the whole site">
    <div id="search-results" class="search-results"><div class="coach-tip">Getting search ready…</div></div>`;
  const input = document.getElementById('search-input');
  if(input) input.focus();
  if(!searchIndex) searchIndex = await buildSearchIndex();
  const res = document.getElementById('search-results');
  if(res && res.querySelector('.coach-tip')) res.innerHTML = `<div class="coach-tip">Search every step, skill, and set across all ${MODULE_MANIFEST.length} modules.</div>`;
}
function runSearch(q){
  const res = document.getElementById('search-results');
  if(!res || !searchIndex) return;
  q = (q || '').trim().toLowerCase();
  if(q.length < 2){ res.innerHTML = `<div class="coach-tip">Type at least two letters…</div>`; return; }
  const terms = q.split(/\s+/).filter(Boolean);
  const scored = [];
  for(const e of searchIndex){
    const hay = e.text.toLowerCase();
    if(!terms.every(t => hay.includes(t))) continue;
    scored.push({ e, score: (e.kind === 'skill' ? 2 : e.kind === 'set' ? 1 : 0) + (hay.indexOf(terms[0]) < 40 ? 1 : 0) });
    if(scored.length > 400) break;
  }
  scored.sort((a, b) => b.score - a.score || a.e.moduleNum - b.e.moduleNum);
  const top = scored.slice(0, 25);
  if(!top.length){ res.innerHTML = `<div class="coach-tip">No matches for &ldquo;${escHtml(q)}&rdquo; — try a shorter word.</div>`; return; }
  const snippet = (text) => {
    const at = text.toLowerCase().indexOf(terms[0]);
    const start = Math.max(0, at - 30);
    let cut = text.slice(start, start + 110);
    if(start > 0) cut = '…' + cut;
    if(start + 110 < text.length) cut += '…';
    return escHtml(cut);
  };
  res.innerHTML = top.map(({e}) => {
    const where = `Module ${e.moduleNum} · ${escHtml(e.label || '')}` +
      (e.kind === 'step' ? ` · Station ${e.station.toUpperCase()}` : e.kind === 'skill' ? ' · Skill' : '');
    const onclick = e.kind === 'step'
      ? `searchGo(${e.moduleNum},'${e.wid}','${e.station}',${e.secIdx},${e.stepIdx})`
      : e.kind === 'skill' && e.skillNum != null
        ? `searchGoSkill(${e.moduleNum},'${e.wid}',${e.skillNum})`
        : `searchGoSet(${e.moduleNum},'${e.wid}')`;
    return `<button type="button" class="search-hit" onclick="${onclick}">
      <span class="search-hit-where">${where}</span>
      <span class="search-hit-text">${snippet(e.text)}</span>
    </button>`;
  }).join('');
}
async function searchGo(moduleNum, wid, station, secIdx, stepIdx){
  closeTopPanels('');
  await jumpToStep(moduleNum, wid, station, secIdx, stepIdx);
}
// Search / deep-link guard: if the jump target is gated, land the student on
// the module (their frontier) and tell them why, rather than trying to reveal a
// hidden locked panel. Returns true when it handled a locked target.
async function gatedJumpGuard(moduleNum, wid){
  const w = SETS.find(x => x.id === wid);
  if(!(w && isSetLocked(w))) return false;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum);
  saveProgress();
  gateToast(`${w.label} unlocks after you finish ${prevSetLabel(w)}.`);
  return true;
}
async function searchGoSkill(moduleNum, wid, skillNum){
  closeTopPanels('');
  if(await gatedJumpGuard(moduleNum, wid)) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum, wid);
  saveProgress();
  const w = SETS.find(x => x.id === wid);
  if(w && skillTaughtStation(w, skillNum)) showSkillLesson(wid, skillNum);
  else switchTabById(wid, 'checklist');
}
async function searchGoSet(moduleNum, wid){
  closeTopPanels('');
  if(await gatedJumpGuard(moduleNum, wid)) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum, wid);
  saveProgress();
  // onModuleChange → activateSet restored the target set's scroll (top if new).
}

/* ════════════════════════════════════════════════
   Service worker — light PWA / offline resilience.
   Registers on any http(s) origin (incl. Live Server's
   http://localhost and the live GitHub Pages site); skipped
   when the file is opened directly via file://. See sw.js + CLAUDE.md.
   ════════════════════════════════════════════════ */
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    /* Was this page already controlled by a service worker when it loaded?
       If so, a later "controllerchange" means a NEW version just took over
       (see sw.js: install→skipWaiting→activate→clients.claim on every push).
       The cached shell that already loaded is now stale, so reload ONCE to
       pick up the fresh code automatically — no more reloading two or three
       times after a deploy, and returning students stop sitting on old code.
       A first-ever visit has no controller yet, so it must NOT reload (that
       would bounce the very first load). */
    const hadController = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.register('sw.js').catch(() => {/* offline support is best-effort */});
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController || window.__swReloading) return;
      window.__swReloading = true;
      const reload = () => {
        // Don't yank the page out from under a live mic check / count-in.
        if (window.coachMicLive) { setTimeout(reload, 1500); return; }
        location.reload();
      };
      reload();
    });
  });
}
