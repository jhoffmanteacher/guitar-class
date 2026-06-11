/* ── Firebase init ── */
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db   = firebase.firestore();
let currentUser = null;
let progress    = {};
let responses   = {};
let completed   = {};
let saveTimer   = null;
let respSaveTimer = null;
let compSaveTimer = null;
const escAttr = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escHtml = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ── Auth ── */
function signIn(){
  auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
    .catch(e=>alert('Sign-in error: '+e.message));
}
function signOut(){ auth.signOut(); }
function devBypass(){
  currentUser = {uid:'dev-user',displayName:'Dev User',email:'dev@test.local',photoURL:null};
  showApp(currentUser);
}

auth.onAuthStateChanged(async user=>{
  if(user){
    currentUser = user;
    if(IS_TEACHER_MODE){ showTeacherApp(user); }
    else { await loadProgress(); showApp(user); }
  } else {
    currentUser = null; progress = {}; responses = {}; completed = {};
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
  setTimeout(()=>{ const h=document.getElementById('resize-handle'),p=document.getElementById('resource-panel'),f=document.getElementById('fab-group'); if(h&&p&&f) f.style.right=(p.offsetWidth+h.offsetWidth+16)+'px'; },0);
  const av = user.photoURL ? `<img src="${user.photoURL}" class="avatar" alt="">` : `<div class="avatar-init">${(user.displayName||'?')[0].toUpperCase()}</div>`;
  document.getElementById('user-area').innerHTML=`${av}<span class="user-name">${user.displayName||user.email}</span><button class="btn-out" onclick="signOut()">Sign out</button>`;
  renderAll();
}

/* ── Firestore ── */
async function loadProgress(){
  try{
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
    } else { progress={}; lastModuleNum=1; lastSetId=null; responses={}; completed={}; }
  } catch(e){ progress={}; lastModuleNum=1; lastSetId=null; responses={}; completed={}; }
}

function onResponseChange(key, value){
  responses[key] = value;
  saveResponses();
}
function saveResponses(){
  if(!currentUser) return;
  clearTimeout(respSaveTimer);
  setSaveMsg('Saving…');
  respSaveTimer = setTimeout(async()=>{
    try{
      await db.collection('progress').doc(currentUser.uid).set({
        responses:responses,
        name:currentUser.displayName||'', email:currentUser.email||''
      },{merge:true});
      setSaveMsg('Saved ✓');
      setTimeout(()=>setSaveMsg(''),2000);
    } catch(e){ setSaveMsg('Save failed — check connection'); }
  },800);
}

function onCompleteChange(key, isDone){
  if(isDone) completed[key] = true; else delete completed[key];
  saveCompleted();
}
function saveCompleted(){
  if(!currentUser) return;
  clearTimeout(compSaveTimer);
  setSaveMsg('Saving…');
  compSaveTimer = setTimeout(async()=>{
    try{
      await db.collection('progress').doc(currentUser.uid).set({
        completed:completed,
        name:currentUser.displayName||'', email:currentUser.email||''
      },{merge:true});
      setSaveMsg('Saved ✓');
      setTimeout(()=>setSaveMsg(''),2000);
    } catch(e){ setSaveMsg('Save failed — check connection'); }
  },800);
}

function saveProgress(){
  if(!currentUser) return;
  clearTimeout(saveTimer);
  setSaveMsg('Saving…');
  saveTimer = setTimeout(async()=>{
    try{
      await db.collection('progress').doc(currentUser.uid).set({
        skills:progress, lastModule:lastModuleNum, lastSet:lastSetId||null,
        name:currentUser.displayName||'', email:currentUser.email||''
      },{merge:true});
      setSaveMsg('Saved ✓');
      setTimeout(()=>setSaveMsg(''),2000);
    } catch(e){ setSaveMsg('Save failed — check connection'); }
  },800);
}
function setSaveMsg(msg){ document.querySelectorAll('.save-ind').forEach(el=>el.textContent=msg); }

/* ── Render ── */
let lastModuleNum = 1;
let lastSetId = null;

function renderAll(){ renderPanels(); populateModuleDropdown(); onModuleChange(lastModuleNum||1, lastSetId); renderChordBoxes(); }

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
  'Bm' : { position:2, chord:[[6,'x',''],[5,2,1],[4,4,3],[3,4,4],[2,3,2],[1,2,1]] },
  'B7' : { position:0, chord:[[6,'x',''],[5,2,2],[4,1,1],[3,2,3],[2,0,0],[1,2,4]] },
  'F#m': { position:2, chord:[[6,2,1],[5,4,3],[4,4,4],[3,2,1],[2,2,1],[1,2,1]] },
  'C#m': { position:4, chord:[[6,'x',''],[5,4,1],[4,6,3],[3,6,4],[2,5,2],[1,4,1]] },
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
function chordMidis(chordName){
  const cfg = CHORD_DIAGRAMS[chordName];
  if (!cfg) return [];
  return cfg.chord
    .slice()
    .sort((a, b) => b[0] - a[0])
    .filter(([, fret]) => fret !== 'x')
    .map(([str, fret]) => STRING_OPEN_MIDI[str] + Number(fret));
}

/* Strum a chord one string at a time. ~35ms between strings approximates
   a moderate downstrum. btnEl, when supplied, gets a brief 'playing' class. */
let chordStrumTimeouts = [];
function strumChord(chordName, btnEl){
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
function renderTabBlock(notes){
  if (!notes || !notes.length) return '';
  const cols = notes.length;
  const rows = TAB_STRINGS.map(strLabel => {
    const cells = [`<div class="tab-str-label">${strLabel}</div>`];
    notes.forEach(n => {
      if (n.string === strLabel) {
        cells.push(`<div class="tab-cell"><span class="tab-fret">${escHtml(String(n.fret))}</span></div>`);
      } else {
        cells.push('<div class="tab-cell"></div>');
      }
    });
    return cells.join('');
  }).join('');
  const noteBtns = ['<div></div>'];
  notes.forEach(n => {
    noteBtns.push(`<button type="button" class="tab-note-btn" onclick="playNote(${Number(n.midi)})" title="Play ${escAttr(n.note)}">${escHtml(n.note)}<span class="tab-spkr">&#x1F50A;</span></button>`);
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
      if (p.notes && p.notes.length) allMidis = allMidis.concat(p.notes.map(n => Number(n.midi)));
    });
  } else if (spec.notes && spec.notes.length) {
    allMidis = spec.notes.map(n => Number(n.midi));
  }
  let controlsHtml = '';
  if (allMidis.length && keyPrefix) {
    const defBpm = spec.bpm || 60;
    const minBpm = spec.minBpm || 40;
    const maxBpm = spec.maxBpm || 120;
    const bpm = readStoredBpm(keyPrefix, defBpm);
    const midisAttr = JSON.stringify(allMidis);
    controlsHtml = `<div class="tab-controls"><span class="bpm-control-group">` +
      `<button type="button" class="play-seq-btn" data-midis="${escAttr(midisAttr)}" onclick="playSequenceFromGroup(this)" title="Play this tab">&#x25B6; Play tab</button>` +
      renderBpmControl(keyPrefix, bpm, minBpm, maxBpm) +
      `</span></div>`;
  }
  if (spec.phrases && spec.phrases.length) {
    const blocks = spec.phrases.map(p => `
      <div class="tab-phrase">
        ${p.label ? `<div class="tab-phrase-label">${escHtml(p.label)}</div>` : ''}
        ${renderTabBlock(p.notes)}
      </div>`).join('');
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
const CHORD_SKIP_CLASSES = ['skill-badge','chord-link','string-link','note-link','rp-trigger','chord-box-label','chord-diagrams','read-aloud-btn','step-resp-mc-opt','tab','nolink'];

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

/* ══════════════════════════════════════════════
   READ ALOUD — ELD support via speechSynthesis
   ══════════════════════════════════════════════ */
let cachedVoices = [];
function loadVoices(){
  if (!window.speechSynthesis) return;
  cachedVoices = window.speechSynthesis.getVoices() || [];
}
if (window.speechSynthesis){
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
}

function pickEnglishVoice(){
  if (!cachedVoices.length) loadVoices();
  const en = cachedVoices.filter(v => /^en[-_]/i.test(v.lang));

  // Ranked preference list — first match wins
  const ranked = [
    // Chrome / Edge neural voices (highest quality in browser)
    v => v.name === 'Google US English',
    v => v.name === 'Google UK English Female',
    v => v.name === 'Microsoft Aria Online (Natural) - English (United States)',
    v => v.name === 'Microsoft Jenny Online (Natural) - English (United States)',
    v => /Microsoft.*Online.*Natural.*English/i.test(v.name),
    // macOS / iOS enhanced system voices
    v => v.name === 'Samantha' && v.localService,
    v => /\(Enhanced\)|\(Premium\)/i.test(v.name),
    v => /^(Samantha|Karen|Moira|Tessa|Fiona|Serena)$/i.test(v.name),
    // Generic neural/premium keywords
    v => /neural|natural|enhanced|premium/i.test(v.name),
    // Any remaining English voice
    v => true,
  ];

  for (const test of ranked) {
    const match = en.find(test);
    if (match) return match;
  }
  return cachedVoices[0] || null;
}

function resetAllReadAloudBtns(){
  document.querySelectorAll('.read-aloud-btn').forEach(b => {
    b.innerHTML = '&#x1F50A;';
    b.classList.remove('speaking');
    delete b.dataset.speaking;
  });
}

function readAloudStep(btn){
  const synth = window.speechSynthesis;
  if (!synth){ alert('Read-aloud is not supported in this browser.'); return; }

  const wasSpeakingThis = btn.dataset.speaking === 'true';
  if (synth.speaking || synth.pending){
    synth.cancel();
    resetAllReadAloudBtns();
    if (wasSpeakingThis) return;
  }

  const stEl = btn.closest('.st');
  if (!stEl) return;
  const clone = stEl.cloneNode(true);
  clone.querySelectorAll('.read-aloud-btn, .chord-diagrams, .skill-badge, .step-resp-saved').forEach(el => el.remove());
  const text = (clone.textContent || '').replace(/\s+/g, ' ').trim();
  if (!text) return;

  const utter = new SpeechSynthesisUtterance(text);
  const voice = pickEnglishVoice();
  if (voice) utter.voice = voice;
  utter.lang = (voice && voice.lang) || 'en-US';
  utter.rate = 0.90;
  utter.pitch = 1.0;
  utter.onend = () => { btn.innerHTML = '&#x1F50A;'; btn.classList.remove('speaking'); delete btn.dataset.speaking; };
  utter.onerror = utter.onend;

  resetAllReadAloudBtns();
  btn.innerHTML = '&#x23F9; Stop';
  btn.classList.add('speaking');
  btn.dataset.speaking = 'true';
  synth.speak(utter);
}

function populateModuleDropdown(){
  const sel = document.getElementById('module-select');
  sel.innerHTML='';
  const modules = [...new Set(SETS.map(w=>w.moduleNum))].sort((a,b)=>a-b);
  modules.forEach(num=>{
    const w = SETS.find(x=>x.moduleNum===num);
    const opt = document.createElement('option');
    opt.value = num;
    opt.textContent = `Module ${num} — ${w.module}`;
    sel.appendChild(opt);
  });
}

function isModuleReviewLocked(moduleNum){
  const sets = SETS.filter(w=>w.moduleNum===moduleNum);
  if(!sets.length) return true;
  if(sets.some(w=>w.locked||w.comingSoon)) return true;
  const allSkills = sets.flatMap(w=>w.skills||[]);
  if(!allSkills.length) return true;
  return !allSkills.every(s=>progress[s.id]==='gotit');
}

function onModuleChange(moduleNum, restoreSetId){
  moduleNum = parseInt(moduleNum);
  lastModuleNum = moduleNum;
  document.getElementById('module-select').value = moduleNum;
  renderPills(moduleNum);
  const moduleSets = SETS.filter(w=>w.moduleNum===moduleNum);
  const isReviewId = restoreSetId === `mr${moduleNum}` && MODULE_REVIEWS[moduleNum];
  const target = restoreSetId && (moduleSets.find(w=>w.id===restoreSetId) || isReviewId)
    ? restoreSetId : (moduleSets.find(w=>!w.locked)||moduleSets[0]).id;
  activateSet(target);
}

function renderPills(moduleNum){
  const c = document.getElementById('week-pills');
  c.innerHTML='';
  SETS.filter(w=>w.moduleNum===moduleNum).forEach(w=>{
    const btn = document.createElement('button');
    btn.className='wpill'+(w.locked?' locked':'');
    btn.dataset.id=w.id;
    btn.textContent=w.label;
    if(!w.locked && w.skills && w.skills.length>0){
      const done=w.skills.filter(s=>progress[s.id]==='gotit').length;
      if(done<w.skills.length) btn.classList.add('incomplete');
    }
    if(!w.locked) btn.onclick=()=>{ lastSetId=w.id; activateSet(w.id); saveProgress(); };
    c.appendChild(btn);
  });

  // Divider + Module Review pill
  if(MODULE_REVIEWS[moduleNum]){
    const div = document.createElement('div');
    div.style.cssText='width:1px;height:18px;background:var(--border2);margin:0 4px;align-self:center;flex-shrink:0';
    c.appendChild(div);
    const locked = isModuleReviewLocked(moduleNum);
    const rbtn = document.createElement('button');
    rbtn.className='wpill review-pill'+(locked?' locked':'');
    rbtn.dataset.id=`mr${moduleNum}`;
    rbtn.textContent='Module review';
    rbtn.title = locked
      ? 'Preview only — finish marking every skill on both sets as "got it" to unlock this self-assessment.'
      : '';
    rbtn.onclick=()=>{ lastSetId=`mr${moduleNum}`; activateSet(`mr${moduleNum}`); saveProgress(); };
    c.appendChild(rbtn);
    // Sync preview/locked state onto the review's panel so its inputs disable themselves
    const panel = document.querySelector(`.week-panel[data-id="mr${moduleNum}"]`);
    if(panel) panel.classList.toggle('mr-locked', locked);
  }
}

function activateSet(id){
  lastSetId = id;
  document.querySelectorAll('.wpill').forEach(b=>b.classList.toggle('active',b.dataset.id===id));
  document.querySelectorAll('.week-panel').forEach(p=>p.classList.toggle('active',p.dataset.id===id));
  renderChordBoxes();
}

function renderPanels(){
  const c=document.getElementById('week-panels');
  c.innerHTML='';
  SETS.forEach(w=>{
    const div=document.createElement('div');
    div.className='week-panel'; div.dataset.id=w.id; div.dataset.module=w.moduleNum;
    div.innerHTML = w.comingSoon ? buildComingSoon(w) : buildSet(w);
    c.appendChild(div);
  });
  // Module review panels
  Object.values(MODULE_REVIEWS).forEach(mr=>{
    const div=document.createElement('div');
    div.className='week-panel'; div.dataset.id=`mr${mr.moduleNum}`; div.dataset.module=mr.moduleNum;
    div.innerHTML=buildModuleReview(mr);
    c.appendChild(div);
  });
  /* Scan all station step text for chord names and wrap matches in clickable spans */
  wrapAllChordLinks();
}

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
  const header = buildSetHeader(w);
  const objHtml = (w.objective||'').replace(/^(I\s+CAN)(:?)\s+/i, '<span class="obj-i-can">$1$2</span> ');
  const items = (w.skillFocus||'').split(' · ')
    .map(s => s.trim())
    .filter(Boolean)
    .map(s => `<li class="obj-skill-item">${s}</li>`)
    .join('');
  const skills = items
    ? `<div class="obj-skill-label">Skill focus</div><ul class="obj-skill-list">${items}</ul>`
    : '';
  return `<div class="obj-card set-head">${header}<div class="obj-main">${objHtml}</div>${skills}</div>
  <div class="tabs">
    <div class="tabs-songbar">
      <button type="button" class="tabs-songs tab-songs" onclick="switchTab(this,'${w.id}','songs')">&#9835; Songs</button>
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
  <div id="${w.id}-station-b" class="tab-panel active">${buildStations(w,'b')}</div>
  <div id="${w.id}-station-c" class="tab-panel">${buildStations(w,'c')}</div>
  <div id="${w.id}-songs"    class="tab-panel">${buildSongs(w)}</div>
  <div id="${w.id}-checklist" class="tab-panel">${buildChecklist(w)}</div>`;
}

function switchTab(el,wid,tab){
  const panel=document.querySelector(`.week-panel[data-id="${wid}"]`);
  panel.querySelectorAll('.tabs > .tabs-main .tabs-card, .tabs > .tabs-songbar > .tabs-songs').forEach(t=>t.classList.remove('active'));
  panel.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  document.getElementById(`${wid}-${tab}`).classList.add('active');
}

/* ── Stations ── */
function buildStations(w, stationId){
  const stepsHtml=(steps,ns)=>steps.map((s,i)=>{
    const text=s.text.replace(/<a href="(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^"]*)"([^>]*)>([^<]*)<\/a>/g,(match,url,attrs,label)=>{
      const safe=label.replace(/'/g,"\\'");
      // data-ext links can't be embedded (official recordings block it) — open on YouTube in a new tab.
      if(/data-ext/.test(attrs)){
        return `<button class="rp-trigger" onclick="window.open('${url}','_blank','noopener')" title="Opens on YouTube in a new tab">&#x25B6; ${label} <span style="font-size:11px;opacity:0.6">&#x2197;</span></button>`;
      }
      return `<button class="rp-trigger" onclick="loadPanel('youtube','${url}','${safe}','YouTube')">&#x25B6; ${label}</button>`;
    });
    const hintHtml = s.hint ? (()=>{
      const bullets = s.hint.split(/(?<=\.(?=\s))(?=\s*[A-Z])|\n/).map(b=>b.trim()).filter(Boolean);
      if(bullets.length <= 1) return `<div class="sh">${s.hint}</div>`;
      return `<ul class="sh-list">${bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`;
    })() : '';
    const chordsHtml = (s.chords&&s.chords.length)
      ? `<div class="chord-diagrams">${s.chords.map(c=>`<div class="chord-box">${chordDiagramSVG(c)}${c.name?`<div class="chord-box-label">${c.name}</div>`:''}</div>`).join('')}</div>`
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
        const opts = s.response.choices.map(c=>{
          const checked = stored===c ? 'checked' : '';
          return `<label class="step-resp-mc-opt"><input type="radio" name="resp-${key}" ${checked} onchange="onResponseChange('${key}', '${escAttr(c)}')"><span>${escHtml(c)}</span></label>`;
        }).join('');
        return `<div class="step-resp">${labelHtml}${promptHtml}<div class="step-resp-mc">${opts}</div></div>`;
      }
      return '';
    })() : '';
    const readBtn = `<button class="read-aloud-btn" type="button" onclick="event.stopPropagation();readAloudStep(this)" title="Read this step aloud" aria-label="Read aloud">&#x1F50A;</button>`;
    const doneKey = `${w.id}-${ns}-${i}`;
    const isDone = completed[doneKey] === true;
    const doneBtn = `<div class="step-done-row"><button class="step-done-btn" type="button" aria-pressed="${isDone}" onclick="toggleStepDone(this,'${doneKey}')">${isDone ? '&#x2713; Done' : 'Mark done'}</button></div>`;
    return `<li class="step${isDone ? ' step-done' : ''}"><div class="sn">${i+1}</div><div class="st"><span class="st-text">${text}</span><div class="step-body">${playSeqHtml}${hintHtml}${chordsHtml}${tabHtml}${tabsHtml}${respHtml} ${readBtn}</div>${doneBtn}</div></li>`;
  }).join('');
  const sectionsHtml=(sections,baseNs)=>sections.map((sec,gi)=>{
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
  const dp=(id,cls,badge,badgeClass,s)=>{
    const body = (s.sections && s.sections.length)
      ? `<div class="sc-sections">${sectionsHtml(s.sections, id)}</div>`
      : `<ul class="steps">${stepsHtml(s.steps, id)}</ul>`;
    return `
    <div class="dp${cls}" id="${w.id}-dp-${id}">
      <div class="dp-head"><span class="st-badge ${badgeClass}">${badge}</span><div class="dp-title">${s.title}</div></div>
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
      <div class="stc" id="${w.id}-sc-b" onclick="openSt('${w.id}','b')">
        <div class="st-ico">&#x1F4BB;</div><span class="st-badge bb">Station B</span>
        <div class="st-name">Computer station</div><div class="st-desc">Watch · Listen · Practice</div>
      </div>
      <div class="stc" id="${w.id}-sc-c" onclick="openSt('${w.id}','c')">
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
function buildSongs(w){
  const rows=w.songs.map((s,i)=>{
    const nameEl = s.url ? `<button class="rp-trigger" onclick="loadSong('${w.id}',${i})">${s.name}</button>` : s.name;
    const vids = [];
    if(s.originalUrl) vids.push(`<button class="song-vid-btn" onclick="loadSongVid('${w.id}',${i},'original')" title="Opens in YouTube"><span class="svb-play">&#x25B6;</span>Original <span style="font-size:11px;opacity:0.6">&#x2197;</span></button>`);
    if(s.tutorialUrl) vids.push(`<button class="song-vid-btn tut" onclick="loadSongVid('${w.id}',${i},'tutorial')"><span class="svb-play">&#x25B6;</span>Tutorial</button>`);
    const vidsEl = vids.length ? `<div class="song-vids">${vids.join('')}</div>` : '';
    return `<div class="song-row"><div class="dot ${s.core?'dc':'dch'}"></div><div><div class="sname">${nameEl}</div><div class="smeta">${s.meta}</div></div>${vidsEl}<span class="stag ${s.core?'stag-core':''}"${vids.length?'':' style="margin-left:auto"'}>${s.type}</span></div>`;
  }).join('');
  return `<div class="legend"><div class="leg"><div class="dot dc" style="margin-top:0"></div>Core — everyone</div><div class="leg"><div class="dot dch" style="margin-top:0"></div>Choice menu — pick 1</div></div><div class="card">${rows}</div>`;
}

function loadSong(wid, idx){
  const w=SETS.find(x=>x.id===wid); if(!w) return;
  const s=w.songs[idx]; if(!s||!s.url) return;
  loadPanel('youtube', s.url, s.name, s.type);
}

function loadSongVid(wid, idx, kind){
  const w=SETS.find(x=>x.id===wid); if(!w) return;
  const s=w.songs[idx]; if(!s) return;
  const url = kind==='tutorial' ? s.tutorialUrl : s.originalUrl;
  if(!url) return;
  if(kind==='original'){
    window.open(url, '_blank', 'noopener');
    return;
  }
  loadPanel('youtube', url, s.name, 'Solo tutorial');
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
    return `<div class="mr-row">
      <div class="mr-skill-text"><span class="mr-q-num">${qNum}.</span> ${s.text}</div>
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
      <div class="mr-play-prompt">Perform the class song from this module &mdash; or a song of your choice that shows off these skills. Then listen back to your recording and reflect on what could be improved.</div>
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
    ? `Sign up when you are ready for the module assessment. It is on these skills:<ul class="mr-assess-list">${mr.assessItems.map(i=>`<li>${i}</li>`).join('')}</ul>`
    : 'Sign up when you are ready for the teacher to assess you on the skills above.';
  const performanceHtml=`<div class="ablock" style="margin-top:18px"><div class="albl">Module ${mr.moduleNum} Assessment</div><div class="atxt">${assessBody}</div></div>`;
  return `
    <div class="mr-locked-banner">
      <span class="mr-locked-banner-icon">&#x1F512;</span>
      <div><strong>Preview only.</strong> Mark every skill on both sets as &ldquo;I&rsquo;ve got it!&rdquo; to unlock this self-assessment.</div>
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
      <div class="albl"><span class="mr-q-num">${clickedNum}.</span> What clicked this module?</div>
      <textarea id="${mrId}-clicked" class="reflection-ta" placeholder="e.g. TAB finally made sense when I slowed it down…" oninput="saveReflection(${mr.moduleNum})">${saved.clicked||''}</textarea>
    </div>
    <div class="ablock" style="margin-top:12px">
      <div class="albl"><span class="mr-q-num">${hardNum}.</span> What's still hard?</div>
      <textarea id="${mrId}-hard" class="reflection-ta" placeholder="e.g. My ring finger keeps slipping off the fret…" oninput="saveReflection(${mr.moduleNum})">${saved.hard||''}</textarea>
    </div>
    ${playHtml}
    ${performanceHtml}
    <div class="ablock" style="margin-top:12px">
      <div class="albl">NAfME standards</div>
      <div>${mr.standards.map(s=>`<span class="spill">${s}</span>`).join('')}</div>
    </div>
    <div class="save-ind" id="${mrId}-save-ind" style="margin-top:10px"></div>`;
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
  if(!w.skills||w.skills.length===0) return '<p style="font-size:15px;color:var(--text2);padding:12px 0">No skills listed for this set yet.</p>';
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
    const practicePanel = s.practice ? renderPracticePanel(s.practice, s.id, w.id) : '';
    return `<div class="skill-row">
      <div class="sktxt"><div class="sn" style="flex-shrink:0;margin-top:0;margin-right:8px">${i+1}</div><div class="sk-body"><div class="sk-label">${s.text}</div>${helper}${practiceBtn}</div></div>
      <div class="skchk-cell working-col${st==='working'?' active':''}" onclick="toggleSkill('${s.id}','${w.id}','working')" title="Still working on it"><div class="skbox">${st==='working'?wkSvg:''}</div></div>
      <div class="skchk-cell gotit-col${st==='gotit'?' active':''}" onclick="toggleSkill('${s.id}','${w.id}','gotit')" title="I've got it!"><div class="skbox">${st==='gotit'?giSvg:''}</div></div>
      ${practicePanel}
    </div>`;
  }).join('');
  return `<div class="cl-intro">Check each skill as you practice. Use "Still working on it" while you're learning, then mark "I've got it!" once you can do it consistently.</div>
  <div class="cl-grid-wrap">
    <div class="cl-header"><div class="cl-header-skill">Skill</div><div class="cl-header-working">Still<br>working on it</div><div class="cl-header-gotit">I've<br>got it!</div></div>
    ${rows}
  </div>
  <div class="prog-wrap"><div class="prog-row"><div class="prog-bg"><div class="prog-fill" id="pf-${w.id}" style="width:${pct}%"></div></div><div class="prog-lbl" id="pl-${w.id}">${done} / ${w.skills.length}</div></div></div>
  <div class="save-ind" id="si-${w.id}"></div>`;
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
    wkCell.querySelector('.skbox').innerHTML = st==='working' ? wkSvg : '';
    giCell.querySelector('.skbox').innerHTML = st==='gotit'   ? giSvg : '';
  });
  if(w){
    const done=w.skills.filter(s=>progress[s.id]==='gotit').length;
    const pct=Math.round(done/w.skills.length*100);
    document.querySelectorAll(`#pf-${wid}`).forEach(el=>el.style.width=pct+'%');
    document.querySelectorAll(`#pl-${wid}`).forEach(el=>el.textContent=done+' / '+w.skills.length);
  }
  renderPills(lastModuleNum);
  document.querySelectorAll('.wpill').forEach(b=>{if(b.dataset.id===wid)b.classList.add('active');});
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
let playSeqState = null;
function playSequence(midis, bpm, btnEl){
  const stop = () => {
    if(!playSeqState) return;
    playSeqState.timeouts.forEach(clearTimeout);
    if(playSeqState.btn){
      playSeqState.btn.innerHTML = playSeqState.idleHtml || '&#x25B6; Play all';
      playSeqState.btn.classList.remove('playing');
    }
    playSeqState = null;
  };
  if(playSeqState){
    const wasSame = playSeqState.btn === btnEl;
    stop();
    if(wasSame) return;
  }
  const interval = 60000 / (bpm || 60);
  const timeouts = midis.map((m, i) => setTimeout(() => playNote(m), i * interval));
  timeouts.push(setTimeout(stop, midis.length * interval));
  const idleHtml = btnEl ? btnEl.innerHTML : null;
  playSeqState = { timeouts, btn: btnEl, idleHtml };
  if(btnEl){
    btnEl.innerHTML = '&#x23F8; Stop';
    btnEl.classList.add('playing');
  }
}
/* ── BPM slider helpers ── */
function readStoredBpm(key, defBpm){
  if(!key) return defBpm;
  try{
    const v = sessionStorage.getItem(key);
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
    try{ sessionStorage.setItem(key, slider.value); }catch(e){}
  }
}
function playSequenceFromGroup(btn){
  let midis;
  try{ midis = JSON.parse(btn.dataset.midis); }catch(e){ return; }
  if(!Array.isArray(midis) || !midis.length) return;
  const group = btn.closest('.bpm-control-group');
  const slider = group ? group.querySelector('.bpm-slider') : null;
  const bpm = slider ? parseInt(slider.value, 10) : 60;
  playSequence(midis, bpm, btn);
}
function tick(){ beep(880,0.06); const dot=document.getElementById('metro-dot'); if(dot){ dot.classList.add('flash'); setTimeout(()=>dot.classList.remove('flash'),80); } }
function getBpm(){ return parseInt(document.getElementById('bpm-slider').value); }
function onBpmSlider(val){ document.getElementById('bpm-display').textContent=val; if(metroRunning){ stopMetro(); startMetro(); } }
function nudgeBpm(d){ const s=document.getElementById('bpm-slider'); s.value=Math.min(220,Math.max(40,getBpm()+d)); document.getElementById('bpm-display').textContent=s.value; if(metroRunning){ stopMetro(); startMetro(); } }
function startMetro(){ tick(); metroInterval=setInterval(tick,Math.round(60000/getBpm())); metroRunning=true; document.getElementById('metro-btn').innerHTML='&#x23F8; Stop'; }
function stopMetro(){ clearInterval(metroInterval); metroRunning=false; document.getElementById('metro-btn').innerHTML='&#x25B6; Start'; }
function toggleMetro(){ if(metroRunning) stopMetro(); else startMetro(); }

/* ── Timer ── */
let timerRunning=false, timerInterval=null, timerSecs=30, timerSelected=30;
function setTimerSecs(secs){ timerSelected=secs; timerSecs=secs; if(timerRunning){ clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML='&#x25B6; Start'; } updateTimerDisplay(); [30,60,120,180,240,300].forEach(s=>{ const el=document.getElementById('tp-'+s); if(el) el.classList.toggle('sel',s===secs); }); }
function updateTimerDisplay(){ const m=Math.floor(timerSecs/60),s=timerSecs%60; document.getElementById('timer-display').textContent=m+':'+(s<10?'0':'')+s; }
function resetTimer(){ if(timerRunning){ clearInterval(timerInterval); timerRunning=false; } timerSecs=timerSelected; updateTimerDisplay(); document.getElementById('timer-btn').innerHTML='&#x25B6; Start'; }
function toggleTimer(){ if(timerRunning){ clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML='&#x25B6; Start'; } else { timerRunning=true; document.getElementById('timer-btn').innerHTML='&#x23F8; Pause'; timerInterval=setInterval(()=>{ if(timerSecs>0){ timerSecs--; updateTimerDisplay(); } else { clearInterval(timerInterval); timerRunning=false; document.getElementById('timer-btn').innerHTML='&#x25B6; Start'; [0,0.35,0.7].forEach(d=>setTimeout(()=>beep(660,0.3),d*1000)); } },1000); } }

/* ── Popup logic ── */
function togglePopup(which){ document.getElementById(which+'-popup').classList.toggle('open'); }
function closePopup(which){ document.getElementById(which+'-popup').classList.remove('open'); if(which==='metro') stopMetro(); if(which==='tuner') stopTuner(); }
document.addEventListener('click',e=>{
  if(!e.target.closest('.tool-popup')&&!e.target.closest('.fab')&&!e.target.closest('.fab-buttons')){
    ['metro','timer','tuner'].forEach(w=>{ const el=document.getElementById(w+'-popup'); if(el) el.classList.remove('open'); });
    stopMetro(); stopTuner();
  }
});

/* ══════════════════════════════════════════════
   TUNER — HPS via Web Audio FFT + YIN smoothing
   ══════════════════════════════════════════════ */
const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const STRING_TARGETS = { 'E2': 82.41, 'A2': 110.00, 'D3': 146.83, 'G3': 196.00, 'B3': 246.94, 'E4': 329.63 };
let tunerRunning = false, tunerStream = null, tunerCtx = null,
    tunerAnalyser = null, tunerFreqAnalyser = null, tunerRaf = null,
    tunerHP = null, tunerLP = null,
    tunerLastNote = null, tunerStableCount = 0, tunerSmoothedFreq = 0,
    tunerTargetString = 'auto';

function selectTunerString(s) {
  tunerTargetString = s;
  document.querySelectorAll('#tuner-strings .ts-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.string === s);
  });
  tunerSmoothedFreq = 0; tunerStableCount = 0; tunerLastNote = null;
}

function freqToNoteInfo(freq) {
  const n    = Math.round(12 * Math.log2(freq / 440)) + 69;
  const name = NOTES[((n % 12) + 12) % 12];
  const exact = 440 * Math.pow(2, (n - 69) / 12);
  const cents = Math.round(1200 * Math.log2(freq / exact));
  return { name, cents, hz: Math.round(freq * 10) / 10 };
}

// YIN pitch detection — accurate and fast on time-domain data.
// Works well on low strings because it finds the true period directly.
function detectPitchYIN(buf, sampleRate) {
  const W = buf.length;
  const half = Math.floor(W / 2);

  // Silence check (lowered so sustained/decaying notes still register)
  let rms = 0;
  for (let i = 0; i < W; i++) rms += buf[i] * buf[i];
  if (Math.sqrt(rms / W) < 0.004) return -1;

  // YIN difference function
  const d = new Float32Array(half);
  d[0] = 1;
  let runSum = 0;
  for (let tau = 1; tau < half; tau++) {
    let s = 0;
    for (let i = 0; i < half; i++) {
      const diff = buf[i] - buf[i + tau];
      s += diff * diff;
    }
    d[tau] = s;
    runSum += s;
    d[tau] *= tau / runSum;
  }

  // Find first dip below threshold (raised slightly to catch quieter pitches)
  const threshold = 0.15;
  for (let tau = 2; tau < half; tau++) {
    if (d[tau] < threshold) {
      while (tau + 1 < half && d[tau + 1] < d[tau]) tau++;
      // Parabolic interpolation for sub-sample accuracy
      const x0 = tau > 1 ? d[tau - 1] : d[tau];
      const x2 = tau < half - 1 ? d[tau + 1] : d[tau];
      const refined = tau + (x2 - x0) / (2 * (2 * d[tau] - x0 - x2));
      const freq = sampleRate / refined;
      return (freq >= 60 && freq <= 1400) ? freq : -1;
    }
  }
  return -1;
}

// HPS via the Web Audio AnalyserNode FFT — fast because the browser does
// the FFT in native code. Multiplies downsampled magnitude spectra to pull
// out the true fundamental even when harmonics dominate (common on low strings).
function detectPitchHPS(freqData, sampleRate, fftSize) {
  const binHz = sampleRate / fftSize;
  const binMin = Math.max(1, Math.floor(60 / binHz));
  const binMax = Math.ceil(1400 / binHz);
  const numHarmonics = 5;

  let bestVal = -Infinity, bestBin = -1;
  for (let k = binMin; k <= Math.floor(binMax / numHarmonics); k++) {
    let product = 1;
    for (let h = 1; h <= numHarmonics; h++) {
      const hk = Math.round(k * h);
      if (hk < freqData.length) {
        // freqData is dB; convert to linear magnitude
        product *= Math.pow(10, freqData[hk] / 20);
      }
    }
    if (product > bestVal) { bestVal = product; bestBin = k; }
  }
  if (bestBin < binMin) return -1;

  // Parabolic interpolation
  const prev = bestBin > 0 ? Math.pow(10, freqData[bestBin - 1] / 20) : 0;
  const curr = Math.pow(10, freqData[bestBin] / 20);
  const next = bestBin < freqData.length - 1 ? Math.pow(10, freqData[bestBin + 1] / 20) : 0;
  const denom = prev - 2 * curr + next;
  const refined = denom !== 0 ? bestBin - 0.5 * (next - prev) / denom : bestBin;
  const freq = refined * binHz;
  return (freq >= 60 && freq <= 1400) ? freq : -1;
}

function tunerLoop() {
  if (!tunerRunning) return;

  // Get time-domain data for YIN
  const timeBuf = new Float32Array(tunerAnalyser.fftSize);
  tunerAnalyser.getFloatTimeDomainData(timeBuf);

  // Get frequency-domain data for HPS
  const freqBuf = new Float32Array(tunerFreqAnalyser.frequencyBinCount);
  tunerFreqAnalyser.getFloatFrequencyData(freqBuf);

  // Run both detectors; prefer HPS for low strings, YIN as fallback
  const freqHPS = detectPitchHPS(freqBuf, tunerCtx.sampleRate, tunerFreqAnalyser.fftSize);
  const freqYIN = detectPitchYIN(timeBuf, tunerCtx.sampleRate);

  // Pick the best candidate — if both fire, prefer HPS; if HPS misses, use YIN
  let freq = -1;
  if (freqHPS > 0 && freqYIN > 0) {
    // They agree within a semitone — use HPS (more precise via interpolation)
    freq = Math.abs(Math.log2(freqHPS / freqYIN)) < (1/12) ? freqHPS : freqYIN;
  } else if (freqHPS > 0) {
    freq = freqHPS;
  } else if (freqYIN > 0) {
    freq = freqYIN;
  }

  // Per-string lock: reject pitches outside ±2 semitones of the target string,
  // and snap octave errors (common on low E/A) toward the target.
  if (freq > 0 && tunerTargetString !== 'auto') {
    const target = STRING_TARGETS[tunerTargetString];
    // Try the detected freq and its ±1 octave neighbours; keep whichever is closest to target.
    const candidates = [freq, freq * 2, freq / 2];
    let best = freq, bestDist = Math.abs(Math.log2(freq / target));
    for (const c of candidates) {
      const d = Math.abs(Math.log2(c / target));
      if (d < bestDist) { best = c; bestDist = d; }
    }
    // Reject if still further than 2 semitones from target.
    freq = bestDist < (2 / 12) ? best : -1;
  }

  const noteEl   = document.getElementById('tuner-note');
  const freqEl   = document.getElementById('tuner-freq');
  const needle   = document.getElementById('tuner-needle');
  const statusEl = document.getElementById('tuner-status');

  if (freq > 0) {
    // Adaptive smoothing: heavy when the new reading is near the smoothed value
    // (locked), fast when it jumps (new note played).
    if (tunerSmoothedFreq > 0) {
      const drift = Math.abs(Math.log2(freq / tunerSmoothedFreq));
      const a = drift < (1/12) ? 0.15 : 0.5;
      tunerSmoothedFreq = tunerSmoothedFreq * (1 - a) + freq * a;
    } else {
      tunerSmoothedFreq = freq;
    }

    // In string-locked mode, compute cents directly from the target so the
    // displayed note never flickers between neighbours.
    let displayName, displayCents, displayHz;
    if (tunerTargetString !== 'auto') {
      const target = STRING_TARGETS[tunerTargetString];
      displayName = tunerTargetString.replace(/\d/, '');
      displayCents = Math.round(1200 * Math.log2(tunerSmoothedFreq / target));
      displayHz = Math.round(tunerSmoothedFreq * 10) / 10;
    } else {
      const info = freqToNoteInfo(tunerSmoothedFreq);
      displayName = info.name; displayCents = info.cents; displayHz = info.hz;
    }

    // Only require 1 consecutive frame on the same note before displaying.
    if (displayName === tunerLastNote) { tunerStableCount++; }
    else { tunerLastNote = displayName; tunerStableCount = 0; }

    if (tunerStableCount >= 1 || tunerTargetString !== 'auto') {
      noteEl.textContent = displayName;
      freqEl.textContent = displayHz + ' Hz';
      const clamped = Math.max(-50, Math.min(50, displayCents));
      needle.style.left = (50 + clamped) + '%';
      if (Math.abs(clamped) < 8) {
        needle.style.background = 'var(--green-text)';
        statusEl.textContent = 'In tune ✓'; statusEl.className = 'tuner-status in-tune';
      } else if (clamped > 0) {
        needle.style.background = 'var(--amber-text)';
        statusEl.textContent = 'Sharp — tune down'; statusEl.className = 'tuner-status sharp';
      } else {
        needle.style.background = 'var(--blue-text)';
        statusEl.textContent = 'Flat — tune up'; statusEl.className = 'tuner-status flat';
      }
    }
  } else {
    // No pitch this frame — keep the last reading briefly; only clear on sustained silence.
    tunerStableCount--;
    if (tunerStableCount < -8) {
      tunerStableCount = 0; tunerLastNote = null; tunerSmoothedFreq = 0;
      noteEl.textContent = '—'; freqEl.textContent = 'Play a string…';
      needle.style.left = '50%'; needle.style.background = 'var(--border2)';
      statusEl.textContent = ''; statusEl.className = 'tuner-status';
    }
  }
  setTimeout(() => { tunerRaf = requestAnimationFrame(tunerLoop); }, 60);
}

async function startTuner() {
  try {
    // Disable browser audio processing that distorts low-frequency guitar signals
    tunerStream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      video: false
    });
    tunerCtx = new (window.AudioContext || window.webkitAudioContext)();
    const src = tunerCtx.createMediaStreamSource(tunerStream);

    // Bandpass via highpass (kills sub-bass rumble / AC hum) into lowpass
    // (kills cymbal-like hiss and high inharmonic content). Restricts the
    // signal to the guitar's useful range before pitch detection.
    tunerHP = tunerCtx.createBiquadFilter();
    tunerHP.type = 'highpass'; tunerHP.frequency.value = 70;  tunerHP.Q.value = 0.7;
    tunerLP = tunerCtx.createBiquadFilter();
    tunerLP.type = 'lowpass';  tunerLP.frequency.value = 1500; tunerLP.Q.value = 0.7;

    // Time-domain analyser for YIN (large buffer = better low-freq resolution)
    tunerAnalyser = tunerCtx.createAnalyser();
    tunerAnalyser.fftSize = 8192;
    tunerAnalyser.smoothingTimeConstant = 0;

    // Frequency-domain analyser for HPS (separate node, same source)
    tunerFreqAnalyser = tunerCtx.createAnalyser();
    tunerFreqAnalyser.fftSize = 8192;
    tunerFreqAnalyser.smoothingTimeConstant = 0.5;

    src.connect(tunerHP);
    tunerHP.connect(tunerLP);
    tunerLP.connect(tunerAnalyser);
    tunerLP.connect(tunerFreqAnalyser);

    tunerRunning = true; tunerLastNote = null; tunerStableCount = 0; tunerSmoothedFreq = 0;
    document.getElementById('tuner-btn').innerHTML = '&#x23F9; Stop';
    document.getElementById('tuner-freq').textContent = 'Listening…';
    tunerLoop();
  } catch(e) {
    document.getElementById('tuner-freq').textContent = 'Mic access denied — check browser permissions';
  }
}

function stopTuner() {
  tunerRunning = false;
  if (tunerRaf)    cancelAnimationFrame(tunerRaf);
  if (tunerStream) tunerStream.getTracks().forEach(t => t.stop());
  if (tunerCtx)    tunerCtx.close();
  tunerStream = null; tunerCtx = null; tunerAnalyser = null; tunerFreqAnalyser = null;
  tunerHP = null; tunerLP = null;
  tunerLastNote = null; tunerStableCount = 0; tunerSmoothedFreq = 0;
  const noteEl = document.getElementById('tuner-note');
  const freqEl = document.getElementById('tuner-freq');
  const needle = document.getElementById('tuner-needle');
  const statusEl = document.getElementById('tuner-status');
  const btn = document.getElementById('tuner-btn');
  if (noteEl)   noteEl.textContent = '—';
  if (freqEl)   freqEl.textContent = 'Tap Start to listen';
  if (needle)   { needle.style.left = '50%'; needle.style.background = 'var(--border2)'; }
  if (statusEl) { statusEl.textContent = ''; statusEl.className = 'tuner-status'; }
  if (btn)      btn.innerHTML = '&#x25B6; Start';
}

function toggleTuner() { if (tunerRunning) stopTuner(); else startTuner(); }

/* ══════════════════════════════════════════════
   TEACHER DASHBOARD
   ══════════════════════════════════════════════ */
const IS_TEACHER_MODE=new URLSearchParams(window.location.search).has('teacher');
let teacherSetId=null, allStudents=[];

function showTeacherApp(user){
  document.getElementById('auth-wall').style.display='none';
  document.getElementById('app').style.display='none';
  if(user.email!==TEACHER_EMAIL){
    document.getElementById('teacher-denied').style.display='block';
    const av=user.photoURL?`<img src="${user.photoURL}" class="avatar" alt="">`:`<div class="avatar-init">${(user.displayName||'?')[0].toUpperCase()}</div>`;
    document.getElementById('user-area').innerHTML=`${av}<span class="user-name">${user.displayName||user.email}</span><button class="btn-out" onclick="signOut()">Sign out</button>`;
    return;
  }
  document.getElementById('teacher-app').style.display='block';
  const av=user.photoURL?`<img src="${user.photoURL}" class="avatar" alt="">`:`<div class="avatar-init">${(user.displayName||'?')[0].toUpperCase()}</div>`;
  document.getElementById('user-area').innerHTML=`${av}<span class="user-name">${user.displayName||user.email}</span><button class="btn-out" onclick="signOut()">Sign out</button>`;
  renderTeacherSetTabs();
  const firstSet=SETS.find(w=>!w.locked&&w.skills&&w.skills.length>0);
  if(firstSet){ teacherSetId=firstSet.id; activateTeacherSetTab(firstSet.id); }
  loadAllStudents();
}

function renderTeacherSetTabs(){
  const c=document.getElementById('t-week-tabs'); c.innerHTML='';
  SETS.forEach(w=>{
    if(!w.skills||w.skills.length===0) return;
    const btn=document.createElement('button');
    btn.className='t-wtab'+(w.locked?' locked':'')+(w.id===teacherSetId?' on':'');
    btn.textContent=w.label; btn.dataset.id=w.id;
    if(!w.locked) btn.onclick=()=>{ teacherSetId=w.id; activateTeacherSetTab(w.id); renderTeacherGrid(); };
    c.appendChild(btn);
  });
}
function activateTeacherSetTab(id){ document.querySelectorAll('.t-wtab').forEach(b=>b.classList.toggle('on',b.dataset.id===id)); }

async function loadAllStudents(){
  try{
    const snap=await db.collection('progress').get();
    allStudents=[];
    snap.forEach(doc=>{
      const raw=doc.data().skills||{};
      const skills={};
      Object.keys(raw).forEach(k=>{
        if(raw[k]===true) skills[k]='gotit';
        else if(raw[k]==='working'||raw[k]==='gotit') skills[k]=raw[k];
        else skills[k]='none';
      });
      allStudents.push({uid:doc.id,skills,name:doc.data().name||'',email:doc.data().email||''});
    });
    renderTeacherGrid(); renderTeacherSummary();
  } catch(e){
    document.getElementById('t-grid-container').innerHTML='<div class="t-loading">Could not load student data. Check your Firebase security rules.</div>';
  }
}

function renderTeacherSummary(){
  const w=SETS.find(x=>x.id===teacherSetId); if(!w||!w.skills) return;
  const total=allStudents.length;
  const complete=allStudents.filter(s=>w.skills.every(sk=>s.skills[sk.id]==='gotit')).length;
  const none=allStudents.filter(s=>w.skills.every(sk=>!s.skills[sk.id]||s.skills[sk.id]==='none')).length;
  const inprog=total-complete-none;
  document.getElementById('t-summary').innerHTML=`
    <div class="t-scard"><div class="t-scard-lbl">Students</div><div class="t-scard-val">${total}</div></div>
    <div class="t-scard"><div class="t-scard-lbl">All done</div><div class="t-scard-val">${complete}</div></div>
    <div class="t-scard"><div class="t-scard-lbl">In progress</div><div class="t-scard-val">${inprog}</div></div>
    <div class="t-scard"><div class="t-scard-lbl">Not started</div><div class="t-scard-val">${none}</div></div>`;
}

function renderTeacherGrid(){
  renderTeacherSummary();
  const w=SETS.find(x=>x.id===teacherSetId);
  if(!w||!w.skills||w.skills.length===0){ document.getElementById('t-grid-container').innerHTML='<div class="t-loading">No skills for this set yet.</div>'; return; }
  if(allStudents.length===0){ document.getElementById('t-grid-container').innerHTML='<div class="t-loading">No student data yet — students need to sign in and check off skills first.</div>'; return; }
  const sorted=[...allStudents].sort((a,b)=>w.skills.filter(s=>b.skills[s.id]==='gotit').length-w.skills.filter(s=>a.skills[s.id]==='gotit').length);
  const checkSvg=`<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const workSvg=`<svg width="9" height="9" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.8"/></svg>`;
  const minusSvg=`<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M3 6h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>`;
  const headerCells=w.skills.map(s=>`<th title="${s.text}">${abbreviate(s.text)}</th>`).join('');
  const rows=sorted.map(stu=>{
    const done=w.skills.filter(s=>stu.skills[s.id]==='gotit').length;
    const total=w.skills.length;
    const pct=Math.round(done/total*100);
    const pillClass=pct===100?'pp-hi':pct>=50?'pp-mid':'pp-lo';
    const displayName=stu.name||stu.email||stu.uid.slice(0,8)+'…';
    const cells=w.skills.map(s=>{
      const st=stu.skills[s.id]||'none';
      if(st==='gotit')   return `<td><span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px">${checkSvg}</span></td>`;
      if(st==='working') return `<td><span class="tck" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;background:var(--amber-bg);color:var(--amber-text)">${workSvg}</span></td>`;
      return `<td><span class="tck no" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px">${minusSvg}</span></td>`;
    }).join('');
    return `<tr><td class="nc" title="${displayName}">${displayName}</td>${cells}<td><span class="ppill ${pillClass}">${done} / ${total}</span></td></tr>`;
  }).join('');
  document.getElementById('t-grid-container').innerHTML=`<div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th>${headerCells}<th>Progress</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function abbreviate(text){ const words=text.split(' '); if(words.length<=4) return text; return words.slice(0,3).join(' ')+'…'; }

/* ── Resource Panel ── */
function loadPanel(type,url,title,subtitle){
  const empty=document.getElementById('rp-empty');
  const content=document.getElementById('rp-content');
  const wrap=document.getElementById('rp-iframe-wrap');
  const meta=document.getElementById('rp-meta');
  const newtab=document.getElementById('rp-newtab');
  const close=document.getElementById('rp-close');
  empty.style.display='none';
  content.classList.add('visible'); newtab.classList.add('visible'); close.classList.add('visible');
  newtab.href=url;
  meta.innerHTML=`<div class="rp-meta-title">${title}</div><div class="rp-meta-sub">${subtitle}</div>`;
  if(type==='youtube'){
    let embedUrl=url;
    const ytMatch=url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([A-Za-z0-9_-]{11})/);
    if(ytMatch) embedUrl=`https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    wrap.className='rp-iframe-wrap rp-youtube';
    wrap.innerHTML=`<iframe src="${embedUrl}" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
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
  const content=document.getElementById('rp-content');
  const wrap=document.getElementById('rp-iframe-wrap');
  const newtab=document.getElementById('rp-newtab');
  const close=document.getElementById('rp-close');
  content.classList.remove('visible'); newtab.classList.remove('visible'); close.classList.remove('visible');
  wrap.className='rp-iframe-wrap'; wrap.innerHTML='';
  document.getElementById('rp-empty').style.display='';
}

/* ══════════════════════════════════════════════
   RESIZABLE PANELS — smooth drag + iframe shield
   ══════════════════════════════════════════════ */
(function(){
  const handle = document.getElementById('resize-handle');
  const panel  = document.getElementById('resource-panel');
  if (!handle || !panel) return;

  // Invisible overlay that sits on top of iframes during drag,
  // preventing them from swallowing mouse events.
  // NOTE: do NOT override panel.style.position — the panel uses
  // position:sticky (CSS) so it stays visible while the main column
  // scrolls. Sticky already establishes a containing block for the
  // absolutely-positioned shield, so no override is needed.
  const shield = document.createElement('div');
  shield.className = 'iframe-drag-shield';
  panel.appendChild(shield);

  let dragging = false, startX = 0, startW = 0;
  let rafPending = false;

  function positionFabs() {
    const fabs = document.getElementById('fab-group');
    if (fabs) fabs.style.right = (panel.offsetWidth + handle.offsetWidth + 16) + 'px';
  }

  function onMove(clientX) {
    if (!dragging) return;
    const newW = Math.min(Math.max(startW + (startX - clientX), 180), window.innerWidth * 0.6);
    panel.style.width = newW + 'px';
    // Throttle FAB repositioning to one layout reflow per animation frame
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => { positionFabs(); rafPending = false; });
    }
  }

  function onEnd() {
    if (!dragging) return;
    dragging = false;
    shield.classList.remove('active');
    handle.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  handle.addEventListener('mousedown', e => {
    dragging = true;
    startX = e.clientX;
    startW = panel.offsetWidth;
    shield.classList.add('active');
    handle.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  });

  document.addEventListener('mousemove', e => onMove(e.clientX));
  document.addEventListener('mouseup', onEnd);

  handle.addEventListener('touchstart', e => {
    dragging = true;
    startX = e.touches[0].clientX;
    startW = panel.offsetWidth;
    shield.classList.add('active');
    handle.classList.add('dragging');
    e.preventDefault();
  }, { passive: false });

  document.addEventListener('touchmove', e => { if (dragging) onMove(e.touches[0].clientX); });
  document.addEventListener('touchend', onEnd);

  positionFabs();
  window.addEventListener('resize', positionFabs);
})();
