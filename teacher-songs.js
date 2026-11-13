/* ── Songs view (Jonathan, 2026-10-20: "manage these songs from a different
   area of the teacher console instead of the class activities part") ──
   The Songs page's "More Play Along songs" library — every card
   caIsLibraryCard (app.js) accepts, Core songs never among them. Those
   cards are not on the Class activities board at all (caBoardOrder skips
   them), so this is the only place they are managed. One row per song:
   Visible / Hidden (the same hiddenActivities flag the board writes), how
   many students have checked off the whole card, Preview and Copy link.
   No dates, no module, no #N, no Who: every student gets every song. An
   archived or deleted one (from before this view existed) shows Restore. */
function renderTeacherSongs(){
  const box=document.getElementById('t-grid-container');
  const intro=`<div class="t-songs-intro">Every song here is on every student&rsquo;s Songs page, under <strong>More Play Along songs</strong>. Hidden takes a song off that list, and the pencil renames one. <strong>Opened</strong> counts clicks on a song&rsquo;s row on the Songs page since Nov 1, 2026: how many students, and how many times in all. Core songs are not here &mdash; they open from their own rows on the Songs page and are managed in Class activities.</div>`;
  if(!box.querySelector('.t-songs')) box.innerHTML='<div class="t-loading">Loading…</div>';
  loadTeacherClassConfig().then(cfg=>{
    if(teacherView!=='songs') return;   // switched views mid-flight
    if(!cfg) return;                    // superseded by a newer read
    // Moving a song here or back changes the tree's counts.
    teacherPaintSideTree();
    const songs=(window.CLASS_ACTIVITIES||[]).filter(a=>caIsLibraryCard(a, cfg.songLibrary||{}));
    if(!songs.length){ box.innerHTML=intro+'<div class="t-loading">No songs here yet. Use <strong>Move to Songs</strong> on a song in Class activities, or push a card with <code>library: true</code>.</div>'; return; }
    const hidden=cfg.hiddenActivities||{};
    const roster=allStudentsRaw.filter(s=>!((cfg.archived||{})[s.uid]));
    const short=a=>teacherActivityTitle(a,cfg).split(' — ')[0];
    // Two cards for one song show their full titles (same rule as the Songs page).
    const name=a=>songs.filter(b=>short(b)===short(a)).length>1 ? teacherActivityTitle(a,cfg) : short(a);
    songs.sort((x,y)=>name(x).localeCompare(name(y)));
    const rows=songs.map(a=>{
      const retired=teacherActivityRetired(a.id,cfg);
      const isHidden=hidden[a.id]===true;
      const done=roster.filter(s=>(s.classActivities||{})[a.id]===true).length;
      // Popularity (songsLibraryOpen, app.js): students who opened it from the
      // Songs page, and the total opens. Only clicks since 2026-11-01 count.
      const openers=roster.filter(s=>((s.songOpens||{})[a.id]||0)>0);
      const opens=openers.reduce((n,s)=>n+s.songOpens[a.id],0);
      const popTxt=`${openers.length} ${openers.length===1?'student':'students'} \u00b7 ${opens} ${opens===1?'open':'opens'}`;
      const status=retired
        ? `<span class="t-songs-off">${teacherActivityDeleted(a.id,cfg)?'Deleted':'Archived'} &mdash; not on the Songs page</span>`
          +`<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="restore">Restore</button>`
        : `<div class="tg-seg">`
          +`<button class="tg-seg-btn ${!isHidden?'on':''}" data-set-activity-hidden data-id="${escAttr(a.id)}" data-state="show" title="On every student's Songs page">Visible</button>`
          +`<button class="tg-seg-btn ${isHidden?'on':''}" data-set-activity-hidden data-id="${escAttr(a.id)}" data-state="hide" title="Off the Songs page for everyone">Hidden</button></div>`;
      // Rename: the box holds the name the Songs page shows; the rest of the
      // card title (" — Play Along") rides along on data-suffix so the card
      // keeps it. Same activityTitles rename as the Class activities board.
      const full=teacherActivityTitle(a,cfg);
      const suffix=name(a)===full ? '' : full.slice(name(a).length);
      const renamed=teacherActivityRenamed(a,cfg);
      if(activityEditId===a.id){
        return `<div class="t-board-card t-songs-row">`
          +`<span class="t-act-title-lbl">rename</span>`
          +`<input type="text" class="t-act-title-edit" data-id="${escAttr(a.id)}" data-suffix="${escAttr(suffix)}" value="${escAttr(name(a))}" maxlength="100" spellcheck="false" aria-label="Rename ${escAttr(name(a))}">`
          +`<span class="t-act-title-hint">Students see this name right away, on the Songs page and on the card, in both languages.${renamed?` Was: ${escHtml(a.title.split(' — ')[0])}`:''}</span>`
          +`<div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap">`
          +`<button class="tg-seg-btn on" data-rename-save data-id="${escAttr(a.id)}">Save</button>`
          +`<button class="tg-seg-btn" data-rename-cancel>Cancel</button>`
          +(renamed?`<button class="tg-seg-btn" data-rename-reset data-id="${escAttr(a.id)}">Undo rename</button>`:'')
          +`</div></div>`;
      }
      return `<div class="t-board-card t-songs-row${(isHidden||retired)?' t-board-dim':''}">`
        +`<div class="t-board-row"><span class="t-songs-name">${escHtml(name(a))}</span> <button class="t-act-pencil" data-rename-activity data-id="${escAttr(a.id)}" title="Rename this song" aria-label="Rename ${escAttr(name(a))}">&#x270E;</button><span class="t-songs-id">${escHtml(a.id)}</span>`
        +`<span class="t-songs-done">${roster.length?`${done} of ${roster.length} students done`:'No student data yet'}</span>`
        +(roster.length?`<span class="t-songs-pop" title="Students who opened this song from the Songs page, and how many times in all (since Nov 1, 2026)">Opened: ${popTxt}</span>`:'')+`</div>`
        +`<div class="t-board-ctl">${status}<span class="t-board-ctl-sp">`
        +`<button class="tg-seg-btn" data-open-activity data-id="${escAttr(a.id)}">Preview</button>`
        +`<button class="tg-seg-btn" data-copy-activity-link data-id="${escAttr(a.id)}">Copy link</button>`
        +`<button class="tg-seg-btn" data-set-song-place data-id="${escAttr(a.id)}" data-state="activities" title="Take this off the Songs page and put it back on the Class activities board — in its old slot if it had one, otherwise in Built">Move to Class activities</button></span></div>`
        +`</div>`;
    }).join('');
    box.innerHTML=intro+`<div class="t-songs">${rows}</div>`;
    // Opening the editor is a full re-render — put the cursor in the box.
    if(activityEditId){
      const inp=box.querySelector('.t-act-title-edit');
      if(inp){ inp.focus(); inp.select(); }
    }
  });
}
/* ── Teacher view songs (Jonathan, 2026-10-22: "make it only visible to
   me … add a teacher console page 'teacher view songs' and put it on there
   so I can pull it up for the whole class. add a button to assign it to the
   whole class from there as an option"; later the same day: "i'd like to be
   able to move a song to class activities instead of to the songs page") ──
   Every `teacherOnly: true` card (caIsTeacherSong in app.js), played right
   here for the projector: the real practice card from caCardBodyHtml (the
   one body renderer the student card and the Class activities preview
   share), so the room sees exactly what a student would. Ticks here save
   nothing. One song on screen at a time; a row of buttons above it picks
   which when there is more than one.

   "Move to Class activities" writes config/class.classSongs[id] = true,
   which puts the card on the Class activities board (in Built, or its old
   slot) as an ordinary activity — Jonathan assigns and dates it there;
   "Teacher only" deletes the row. A moved card stays listed here, so it can
   still be played for the room and moved back. The share row repaints on
   its own, so the song keeps playing while you click it. */
let teacherViewSongId=null;
function teacherViewSongs(){ return (window.CLASS_ACTIVITIES||[]).filter(a=>a.teacherOnly===true); }
function teacherViewSongShareHtml(a, cfg){
  const shared=((cfg&&cfg.classSongs)||{})[a.id]===true;
  return `<div class="tg-seg">`
    +`<button class="tg-seg-btn ${!shared?'on':''}" data-tvs-share data-id="${escAttr(a.id)}" data-state="teacher" title="Only on this tab. Students do not see it.">Teacher only</button>`
    +`<button class="tg-seg-btn ${shared?'on':''}" data-tvs-share data-id="${escAttr(a.id)}" data-state="class" title="Put it on the Class activities board, where you assign it to a module and date it like any activity">Move to Class activities</button></div>`
    +`<span class="t-songs-off" style="margin-left:10px">${shared?'On the Class activities board. Students see it once you assign it to a module and its date arrives.':'Students do not see this song.'}</span>`;
}
function renderTeacherViewSongs(){
  const box=document.getElementById('t-grid-container');
  const songs=teacherViewSongs();
  if(!songs.length){ box.innerHTML='<div class="t-loading">No teacher-only songs yet. A card with <code>teacherOnly: true</code> shows up here.</div>'; return; }
  if(!songs.some(a=>a.id===teacherViewSongId)) teacherViewSongId=songs[0].id;
  if(!box.querySelector('[data-tvs]')) box.innerHTML='<div class="t-loading">Loading…</div>';
  loadTeacherClassConfig().then(cfg=>{
    if(teacherView!=='tsongs') return;   // switched views mid-flight
    if(!cfg) return;                     // superseded by a newer read
    // Sharing a teacher-only song moves it on or off the board: the tree's counts follow.
    teacherPaintSideTree();
    const raw=songs.find(a=>a.id===teacherViewSongId);
    const a=typeof caView==='function'?caView(raw):raw;
    const picker=songs.length>1
      ? `<div class="tg-seg" style="margin-bottom:12px">${songs.map(x=>`<button class="tg-seg-btn ${x.id===raw.id?'on':''}" data-tvs-pick data-id="${escAttr(x.id)}">${escHtml(teacherActivityTitle(x,cfg))}</button>`).join('')}</div>`
      : '';
    // Same card already up (a config re-read): leave it, so the song keeps
    // playing; only the share row is repainted.
    const cur=box.querySelector('[data-tvs]');
    if(cur && cur.dataset.tvs===raw.id){
      const ctl=box.querySelector('[data-tvs-ctl]');
      if(ctl) ctl.innerHTML=teacherViewSongShareHtml(raw, cfg);
      return;
    }
    if(typeof stopCardAudio==='function') stopCardAudio();
    box.innerHTML=`<div data-tvs="${escAttr(raw.id)}">`
      +`<div class="t-songs-intro">Songs only you can see, to play for the whole class. Students see one only after you move it to Class activities and assign it there.</div>`
      +picker
      +`<div class="stu-section-head" role="heading" aria-level="3" style="margin-top:0">${escHtml(teacherActivityTitle(raw,cfg))} <span style="opacity:.55;font-size:.72em">(${escHtml(raw.id)})</span></div>`
      +`<div data-tvs-ctl style="display:flex;align-items:center;flex-wrap:wrap;gap:6px;margin:0 2px 14px">${teacherViewSongShareHtml(raw, cfg)}</div>`
      +(a.intro?`<div class="coach-tip" style="margin:0 2px 16px">${escHtml(a.intro)}</div>`:'')
      +caCardBodyHtml(a,{preview:true})
      +`</div>`;
  });
}
function teacherViewSongPick(id){
  if(id===teacherViewSongId) return;
  teacherViewSongId=id;
  renderTeacherViewSongs();
}
/* Move a teacher-only card to Class activities, or take it back —
   config/class.classSongs, id -> true; "Teacher only" deletes the row.
   Nothing else is touched: a board slot, date, Hidden and Who all stay, so
   a card moved back and forth lands where it was.
   Cell-checked on that one row, like teacherSetSongPlace. Students'
   progress is never written. */
async function teacherSetClassSong(id, on){
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a || a.teacherOnly!==true) return;
  if(!teacherClassConfig.classSongs) teacherClassConfig.classSongs={};
  const map=teacherClassConfig.classSongs;
  const had=Object.prototype.hasOwnProperty.call(map, id);
  const prev=map[id];
  if((prev===true)===on) return;
  if(on) map[id]=true; else delete map[id];
  const ctl=document.querySelector('[data-tvs-ctl]');
  if(ctl) ctl.innerHTML=teacherViewSongShareHtml(a, teacherClassConfig);   // shown now
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    await teacherWriteConfig({classSongs:{[id]: on ? true : fv.delete()}}, {['classSongs.'+id]: had?prev:undefined});
  }catch(e){
    if(had) map[id]=prev; else delete map[id];
    teacherConfigSaveFailed(e, 'Could not move that song — check your connection and Firestore rules.');
  }
  if(teacherView==='tsongs') renderTeacherViewSongs();
  else if(teacherView==='activities') renderTeacherActivities();
}
/* Move a song (caIsSongCard in app.js) between Class activities and the
   Songs page — config/class.songLibrary, id -> true (Songs) / false (Class
   activities). Matching the card's own `library` field clears the row, so
   the doc only holds real moves. Cell-checked on that one row. Nothing else
   is touched: the board slot, date, Hidden and Who all stay, so a song
   moved back lands where it was. Students' progress is never written. */
async function teacherSetSongPlace(id, where){
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a || !caIsSongCard(a)) return;
  const toSongs = where==='songs';
  if(!teacherClassConfig.songLibrary) teacherClassConfig.songLibrary={};
  const map=teacherClassConfig.songLibrary;
  const had=Object.prototype.hasOwnProperty.call(map, id);
  const prev=map[id];
  const clear = toSongs===(a.library===true);
  if(clear) delete map[id]; else map[id]=toSongs;
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    await teacherWriteConfig({songLibrary:{[id]: clear ? fv.delete() : toSongs}}, {['songLibrary.'+id]: had?prev:undefined});
  }catch(e){
    if(had) map[id]=prev; else delete map[id];
    teacherConfigSaveFailed(e, 'Could not move that song — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
  else if(teacherView==='songs') renderTeacherSongs();
}
/* Delete = archive, plus wipe every console setting this activity has. The
   wipe is the whole point of having a second button: it is what makes a
   restored activity start over (undated, so invisible until it is published
   again) rather than snap back onto In-Class Activities the moment the flag comes off.

   Confirmed first, because unlike Archive it throws away work — a release
   date, a rename, a place on the board, a set of per-student gate clears.
   Deliberately NOT touching students' progress docs: the teacher has no
   write there (firestore.rules), and a completion record is grade data. */
async function teacherDeleteActivity(id){
  const cfg = teacherClassConfig;
  const a = (window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  const shown = a ? teacherActivityTitle(a,cfg) : id;
  if(!window.confirm(
    'Delete \u201c'+shown+'\u201d?\n\n'
    +'Students stop seeing it, and its release date, rename, place on the board and per-student gate clears are all cleared.\n\n'
    +'You can bring it back from the Built column\u2019s \u201cArchived / deleted\u201d list, but it comes back blank \u2014 unplaced and undated, so you would assign and publish it again from scratch.\n\n'
    +'What stays either way: the activity itself (it ships in the site\u2019s code, so only a code update really removes it) and every student\u2019s record of having finished it.\n\n'
    +'To tuck it away and keep its settings, cancel and use Archive instead.')) return;
  // activityBoard is in the list because Delete un-places the card as well:
  // a restored one comes back in Built, blank, to be placed and published
  // from scratch. Archive deliberately does NOT touch it — that's the whole
  // difference between the two, and why Restore-from-archive puts the card
  // back in its own module at its own position.
  const MAPS=['archivedActivities','deletedActivities','hiddenActivities','optionalActivities','playAlongActivities','activityStudents','activityDates','activityTitles','activityNumbers','activityBoard'];
  MAPS.forEach(m=>{ if(!cfg[m]) cfg[m]={}; });
  if(!cfg.activityClears) cfg.activityClears={};
  const clears=cfg.activityClears;
  // Only the uids that actually hold a clear for THIS activity — activityClears
  // is uid -> { activityId -> true }, so the patch has to name each uid's row.
  const clearUids=Object.keys(clears).filter(uid=>clears[uid] && Object.prototype.hasOwnProperty.call(clears[uid],id));
  const before={}, beforeClears={};
  MAPS.forEach(m=>{ before[m]=Object.prototype.hasOwnProperty.call(cfg[m],id) ? cfg[m][id] : undefined; });
  clearUids.forEach(uid=>{ beforeClears[uid]=clears[uid][id]; });
  /* Taking the card off the board leaves a hole in its module's 1..N run,
     so the survivors are re-packed in the same write — same contract every
     other board writer keeps (teacherMoveActivity), including its two
     passes: the board shown now is optimistic, and the re-pack SENT is
     worked out again at the gate from the confirmed board (see
     teacherBoardTurnBase). The board is replaced, never edited in place, so
     the `prev` a queued writer holds can't change under it. */
  const plan=board=>{
    const next={}, repack={};
    Object.keys(board).forEach(k=>{ if(k!==id) next[k]=board[k]; });
    const entry=board[id];
    if(entry){
      const from=Number(entry.module)||0;
      teacherBoardModuleIds(cfg,from,board).filter(x=>x!==id).forEach((x,i)=>{
        const p=board[x];
        if(!p || Number(p.pos)!==i+1) repack[x]=next[x]={module:from, pos:i+1};
      });
    }
    return {next, repack};
  };
  const prev=cfg.activityBoard;
  cfg.deletedActivities[id]=true;
  MAPS.filter(m=>m!=='deletedActivities' && m!=='activityBoard').forEach(m=>{ delete cfg[m][id]; });
  cfg.activityBoard=plan(prev).next;   // optimistic
  clearUids.forEach(uid=>{ delete clears[uid][id]; });
  const seq0=boardSettled;
  const pinsHad=Object.prototype.hasOwnProperty.call(cfg,'activityPins'), pinsPrev=cfg.activityPins;
  const pinsBefore=teacherActivityPins(cfg);
  if(pinsBefore.includes(id)) cfg.activityPins=pinsBefore.filter(x=>x!==id);
  // A deleted row leaves the table, so an open rename box on it would be
  // editing something that is no longer there. Cleared before the optimistic
  // repaint below so that paint doesn't draw the editor on the deleted card.
  if(activityEditId===id) activityEditId=null;
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherMoveActivity
  const release=await waitBoardWriteTurn();
  const {live, base}=teacherBoardTurnBase(cfg, prev, seq0);
  const {next, repack}=plan(base);
  live.activityBoard=next;
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch={deletedActivities:{[id]:true}};
    MAPS.filter(m=>m!=='deletedActivities').forEach(m=>{ patch[m]={[id]:fv.delete()}; });
    Object.keys(repack).forEach(k=>{ patch.activityBoard[k]=repack[k]; });
    if(clearUids.length){
      patch.activityClears={};
      clearUids.forEach(uid=>{ patch.activityClears[uid]={[id]:fv.delete()}; });
    }
    // Delete wipes everything the console set for the card, its pin too.
    if(pinsBefore.includes(id)) patch.activityPins=pinsBefore.filter(x=>x!==id);
    // Strict (no base): like a move, this re-packs the module the card
    // leaves, so it depends on more of the board than the patch names.
    await teacherWriteConfig(patch);
    teacherBoardSettle(live, next);
  }catch(e){
    MAPS.filter(m=>m!=='activityBoard').forEach(m=>{ if(before[m]===undefined) delete cfg[m][id]; else cfg[m][id]=before[m]; });
    teacherBoardSettle(live, base);
    clearUids.forEach(uid=>{ clears[uid][id]=beforeClears[uid]; });
    if(pinsHad) cfg.activityPins=pinsPrev; else delete cfg.activityPins;
    teacherConfigSaveFailed(e, 'Could not delete that activity — check your connection and Firestore rules.');
  }finally{
    release();
  }
  if(teacherView==='activities') renderTeacherActivities();
}

