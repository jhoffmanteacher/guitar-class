/* ── Class activities, second part (split from teacher-activities.js, 2026-11-16) ──
   Everything that CHANGES a card, and the two detail pages: the one move writer, Unassign, a typed
   position, drag and drop, the rename, an activity's and an exit check's detail page
   (renderTeacherActivityDetail), the per-card settings (hide, required, who, Play Along, pins), a typed
   release date, archive and delete. Loaded right after teacher-activities.js (TEACHER_JS_PARTS,
   app/boot.js), which holds the board, the list and what they share. The code below was moved whole
   and unchanged; nothing here runs at load except plain declarations. */

/* ── The one writer every move goes through ─────────────────────────────
   A drag, an "Assign to"/"Move to" pick, a ▲▼ bump and a typed #number all
   end here, so there is exactly one place that knows how to keep `pos`
   contiguous — the same reason the old teacherSetActivityNumber rewrote the
   whole run instead of storing "ca-10 is now #4" and leaving the rest to a
   tiebreak.

   pos is 1-based within the TARGET module, counted after the card has been
   taken out of wherever it was; null appends. Both the section it leaves
   and the one it joins are re-packed 1..N, and only rows whose entry
   actually changed are sent — a move inside Module 3 never rewrites
   Module 7. */
/* Serializes the three board writers that re-pack a module (Move, Unassign,
   Delete) — found 2026-09-27. Each computes its patch from teacherClassConfig
   synchronously, then awaits a STRICT teacherWriteConfig() write, so two
   rapid clicks (a fast drag, a double-tap on ▲, or a Move overlapping a
   Delete's confirm landing) can both finish their synchronous half before
   either write resolves and bumps teacherConfigVersion. The second write
   then reads the still-stale version, and the transaction refuses it as a
   conflict — the tab's OWN prior move, not another session, tripping the
   stale-write guard on itself. Chaining every board write through one queue
   (whether it succeeds or fails) makes write B wait for write A to actually
   land first, so B computes and sends against the version A left behind
   instead of the one that was already true when both started. This does not
   touch teacherWriteConfig()'s own strict-vs-cell-checked contract — it only
   stops the caller from creating the race in the first place. */
/* Synchronous on purpose, up to its first await: reading the current gate
   and installing this call's own replacement have to happen before any
   other queued caller's turn can run, or two calls issued back to back
   would both capture the same "previous" gate and still race. Resolves
   (never rejects) once it's this call's turn, handing back the function
   that releases the NEXT caller once this write has fully settled —
   success or failure, so one failed write can't wedge the queue shut. */
let _boardWriteGate = Promise.resolve();
function waitBoardWriteTurn(){
  const mine = _boardWriteGate;
  let release;
  _boardWriteGate = new Promise(r => { release = r; });
  return mine.catch(() => {}).then(() => release);
}
/* The queue alone was not enough (2026-10-10): each writer still worked out
   its patch BEFORE waiting its turn, from a board that already carried the
   optimistic result of the write queued ahead of it. If that write failed,
   the queued one sent a patch built on a move that never happened. So the
   three re-packing writers now apply their optimistic board straight away
   (the UI follows the click at once, as before) but work out the patch they
   SEND only once it is their turn, from the board as it stands then.

   "As it stands then" has to exclude this writer's own optimism. Every
   writer settles the board when its write ends — the computed board on
   success, the base it started from on failure — and bumps boardSettled
   while still holding the gate. So at a writer's turn: if nothing settled
   since its click (it was first in line), the board before its own
   optimism (`prev`) is the confirmed one; otherwise the writer ahead of it
   just settled the board, wiping every queued optimism including its own,
   and the live board IS the confirmed one. A config reload in between
   (renderTeacherActivities re-reads after each write) hands back a fresh
   object straight from Firestore, which is confirmed by definition. */
let boardSettled = 0;
function teacherBoardTurnBase(cfg, prev, seq0){
  const live = teacherClassConfig || cfg;
  const base = (live === cfg && boardSettled === seq0) ? prev : (live.activityBoard || {});
  return { live, base };
}
// Ends a board writer's turn. Called inside the gate, before release().
function teacherBoardSettle(live, board){
  live.activityBoard = board;
  boardSettled++;
}
async function teacherMoveActivity(id, module, pos){
  const cfg=teacherClassConfig;
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a) return;
  const mn=Number(module)||0;
  /* The board this move leads to, worked out from `board`, and the rows of
     it that differ. Run twice: once now for the optimistic repaint, and
     again at the gate from the confirmed board — that second one is sent. */
  const plan=board=>{
    const from=board[id] ? (Number(board[id].module)||0) : null;
    const target=teacherBoardModuleIds(cfg,mn,board).filter(x=>x!==id);
    const at=(pos===null||pos===undefined) ? target.length : Math.max(0, Math.min(target.length, Math.round(pos)-1));
    target.splice(at,0,id);
    const next={};
    Object.keys(board).forEach(k=>{ next[k]=board[k]; });
    target.forEach((x,i)=>{ next[x]={module:mn, pos:i+1}; });
    if(from!==null && from!==mn) teacherBoardModuleIds(cfg,from,board).filter(x=>x!==id).forEach((x,i)=>{ next[x]={module:from, pos:i+1}; });
    // Only what actually moved. An unchanged row re-sent would cost nothing
    // but noise, and the patch is easier to read in the console when it names
    // exactly the cards that moved.
    const patch={};
    Object.keys(next).forEach(k=>{
      const p=board[k];
      if(!p || Number(p.module)!==next[k].module || Number(p.pos)!==next[k].pos) patch[k]=next[k];
    });
    return {next, patch};
  };
  const prev=cfg.activityBoard||{};
  const opt=plan(prev);
  if(!Object.keys(opt.patch).length){ renderTeacherActivities({cached:true}); return; }
  cfg.activityBoard=opt.next;   // optimistic — the click shows at once
  /* ...which it only does if something paints it. The repaint after the
     write (finally, below) is a whole Firestore round trip away, and until
     2026-10-12 nothing painted before it: a dropped card sat where it was for
     a second or two, which read as a failed drop and invited a second drag.
     Cached, because this paints the in-memory board — the optimistic one. */
  if(teacherView==='activities') renderTeacherActivities({cached:true});
  const seq0=boardSettled;
  const release=await waitBoardWriteTurn();
  const {live, base}=teacherBoardTurnBase(cfg, prev, seq0);
  const {next, patch}=plan(base);
  try{
    // The write ahead of this one already put the card here: nothing to send.
    if(!Object.keys(patch).length){ teacherBoardSettle(live, base); return; }
    live.activityBoard=next;
    /* Strict (no base): `pos` is re-packed 1..N from the copy of the board
       this tab holds, so a base one move out of date writes a run with a
       duplicate or a hole in it — and nothing downstream would notice. */
    await teacherWriteConfig({activityBoard:patch});
    teacherBoardSettle(live, next);
  }catch(e){
    teacherBoardSettle(live, base);
    teacherConfigSaveFailed(e, 'Could not save that move — check your connection and Firestore rules.');
  }finally{
    release();
    if(teacherView==='activities') renderTeacherActivities();
  }
}
/* Back to Built. The entry goes away and the module it left is re-packed;
   the release date, the rename and the Hidden flag are deliberately left
   alone — they are independent knobs, and a card un-assigned by accident
   should come back with its settings when it's dropped in again. */
async function teacherUnassignActivity(id){
  const cfg=teacherClassConfig;
  // Same two-pass shape as teacherMoveActivity: optimistic now, sent from
  // the confirmed board at the gate.
  const plan=board=>{
    const from=Number(board[id].module)||0;
    const next={};
    Object.keys(board).forEach(k=>{ if(k!==id) next[k]=board[k]; });
    const patch={};
    teacherBoardModuleIds(cfg,from,board).filter(x=>x!==id).forEach((x,i)=>{
      next[x]={module:from, pos:i+1};
      const p=board[x];
      if(!p || Number(p.module)!==from || Number(p.pos)!==i+1) patch[x]=next[x];
    });
    return {next, patch};
  };
  const prev=cfg.activityBoard||{};
  if(!prev[id]) return;
  cfg.activityBoard=plan(prev).next;   // optimistic
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // and shown now — see teacherMoveActivity
  const seq0=boardSettled;
  const release=await waitBoardWriteTurn();
  const {live, base}=teacherBoardTurnBase(cfg, prev, seq0);
  try{
    // A write queued ahead of this one already took it off the board.
    if(!base[id]){ teacherBoardSettle(live, base); return; }
    const {next, patch}=plan(base);
    live.activityBoard=next;
    await ensureDb();   // for FieldValue — teacherWriteConfig calls it again, cached
    const fv=firebase.firestore.FieldValue;
    patch[id]=fv.delete();
    // Strict, same re-packing reason as teacherMoveActivity.
    await teacherWriteConfig({activityBoard:patch});
    teacherBoardSettle(live, next);
  }catch(e){
    teacherBoardSettle(live, base);
    teacherConfigSaveFailed(e, 'Could not un-assign that activity — check your connection and Firestore rules.');
  }finally{
    release();
    if(teacherView==='activities') renderTeacherActivities();
  }
}
// ▲ / ▼ — one place within the card's own module. The keyboard and touch
// equivalent of a short drag; anything further is the "Move to" select.
function teacherBoardBump(id, dir){
  const cfg=teacherClassConfig;
  const e=(cfg.activityBoard||{})[id];
  if(!e) return;
  const mn=Number(e.module)||0;
  const all=teacherBoardModuleIds(cfg,mn);
  /* Step over the cards the teacher can SEE in the run, not over the raw
     board list: that list deliberately includes archived rows (they hold
     their slot for Restore), and they render in a separate collapsed list.
     Counting them would make the first press of ▲ next to an archived card
     a dead click that still wrote to Firestore. */
  const live=all.filter(x=>!teacherActivityRetired(x,cfg));
  const li=live.indexOf(id);
  // ▲ means "up the screen". The list runs the other way when the view is
  // descending, so the step has to flip with it — see boardDescending().
  const up = boardDescending() ? dir!=='up' : dir==='up';
  const lj=up?li-1:li+1;
  if(li<0 || lj<0 || lj>=live.length){ renderTeacherActivities({cached:true}); return; }  // already at the end
  // Translate back to a position in the full list: land immediately before
  // the live neighbour when moving up, immediately after it when moving down.
  const nb=live[lj];
  const rest=all.filter(x=>x!==id);
  const ni=rest.indexOf(nb);
  if(ni<0){ renderTeacherActivities({cached:true}); return; }
  teacherMoveActivity(id, mn, up ? ni+1 : ni+2);
}
/* Typing a position into a card's # box. "#n" means the slot the card that
   currently shows #n is sitting in: the typed card lands in THAT card's
   module, just before it when moving up the list and just after it when
   moving down — the same result as dragging it there, which is the point of
   having both. Out of range, unparseable or unchanged repaints from cache
   (putting the old number back in the box) and writes nothing. */
function teacherMoveActivityToNumber(id, value){
  const cfg=teacherClassConfig;
  const view=teacherBoardView(cfg);
  const ordered=[];
  view.sections.forEach(sec=>sec.ids.forEach(x=>{ if(view.number[x]) ordered.push(x); }));
  const cur=view.number[id];
  const n=Math.round(Number(value));
  if(!Number.isFinite(n) || n<1 || n>ordered.length || !cur || n===cur){
    renderTeacherActivities({cached:true});   // nothing was written
    return;
  }
  const targetId=ordered[n-1];
  const tmod=Number(((cfg.activityBoard||{})[targetId]||{}).module)||0;
  const tlist=teacherBoardModuleIds(cfg,tmod).filter(x=>x!==id);
  const ti=tlist.indexOf(targetId);
  if(ti<0){ renderTeacherActivities({cached:true}); return; }
  teacherMoveActivity(id, tmod, n>cur ? ti+2 : ti+1);
}

/* ── Drag and drop ──────────────────────────────────────────────────────
   HTML5 DnD, delegated on the same stable shell the click listener uses
   (showTeacherApp), because the board's innerHTML is replaced on every
   render and per-card listeners would have to be re-bound each time. The
   dragged id lives in a module-level variable rather than dataTransfer:
   dataTransfer's contents are unreadable during dragover in most browsers,
   and the drop indicator has to know what it's carrying to draw itself.

   No touch drag — a touchstart-based reimplementation of DnD is a lot of
   code to maintain for a board that already has "Assign to…", "Move to…"
   and ▲▼ doing the same three jobs. */
function teacherBoardClearDropMarks(){
  document.querySelectorAll('.t-board-drop-before,.t-board-drop-after,.t-board-drop-in')
    .forEach(el=>el.classList.remove('t-board-drop-before','t-board-drop-after','t-board-drop-in'));
}
// e.target on a stray drag elsewhere in the console (a text selection, a
// dragged link) can be a node without .closest — every board handler checks
// for it before reaching for an ancestor.
function boardEl(e){ return (e && e.target && typeof e.target.closest==='function') ? e.target : null; }
function teacherBoardDragStart(e){
  const t=boardEl(e); if(!t) return;
  const card=t.closest('[data-board-card]');
  if(!card) return;
  boardDragId=card.dataset.id;
  card.classList.add('t-board-dragging');
  // Chrome refuses to start a drag at all unless something is set here.
  try{ e.dataTransfer.setData('text/plain', card.dataset.id); e.dataTransfer.effectAllowed='move'; }catch(err){}
}
function teacherBoardDragEnd(){
  boardDragId=null;
  document.querySelectorAll('.t-board-dragging').forEach(el=>el.classList.remove('t-board-dragging'));
  teacherBoardClearDropMarks();
}
/* A repaint that lands mid-drag (a typed date's write, a Refresh) replaces
   the card being dragged. Its dragend then fires on a node that is no longer
   in the page, so it reaches neither the shell nor the document, and a drop
   outside a target fires no drop either — boardDragId stayed set, and with
   it teacherRefreshBlocker skipped every auto-refresh (and a stray text drag
   over the board would carry that card) until the next successful drop.
   The browser sends no mouse events while a drag runs, so a mouse event
   that arrives with no .t-board-dragging card left in the page means the
   drag is over. A live drag's card still has the class, so it's untouched —
   a refresh during a real drag is still skipped. Bound once, beside the
   shell's drag listeners. */
function teacherBoardStaleDragCheck(){
  if(boardDragId && !document.querySelector('.t-board-dragging')) teacherBoardDragEnd();
}
function teacherBoardDragOver(e){
  if(!boardDragId) return;
  const t=boardEl(e); if(!t) return;
  const section=t.closest('[data-board-section]');
  const built=t.closest('[data-board-built]');
  if(!section && !built) return;
  e.preventDefault();                       // without this the drop never fires
  try{ e.dataTransfer.dropEffect='move'; }catch(err){}
  teacherBoardClearDropMarks();
  if(built){
    // Un-assign has no position to choose, so the whole column lights up.
    built.classList.add('t-board-drop-in');
    return;
  }
  const over=t.closest('[data-board-card]');
  // Over a card: the line goes above or below it depending on which half
  // the cursor is in, the ordinary list-reorder idiom. Over the header or
  // the empty space under the cards: append, so the section itself lights up.
  // Under a non-course-order sort the drop can only add the card to the
  // module, so the whole section lights up instead of drawing a line at a
  // position that would be thrown away (boardCanReorder).
  if(over && over.dataset.id!==boardDragId && section.contains(over) && boardCanReorder()){
    const r=over.getBoundingClientRect();
    over.classList.add(e.clientY < r.top + r.height/2 ? 't-board-drop-before' : 't-board-drop-after');
  } else {
    section.classList.add('t-board-drop-in');
  }
}
function teacherBoardDrop(e){
  const id=boardDragId;
  if(!id) return;
  const t=boardEl(e); if(!t) return;
  const section=t.closest('[data-board-section]');
  const built=t.closest('[data-board-built]');
  if(!section && !built) return;
  e.preventDefault();
  teacherBoardClearDropMarks();
  boardDragId=null;
  if(built){ teacherUnassignActivity(id); return; }
  const mn=Number(section.dataset.module)||0;
  const over=t.closest('[data-board-card]');
  /* A drop that names no position — on the section's header or its empty
     space — means "put this in this module", and that appends to the end of
     the module's course order whichever way the view happens to be pointed.
     An earlier cut flipped this to position 1 under a descending view, which
     silently renumbered every card in the module on a drop the teacher
     thought was a plain "add it here". Only a drop ON a card names a
     position, and that one does follow the view (below). */
  const append=()=>teacherMoveActivity(id, mn, null);
  /* Sorted by date/name/done, the list on screen is not the course order, so
     no drop inside it names a position. Dropping a card back into the module
     it already sits in is then a no-op rather than a silent re-pack — an
     aborted drag must not be a write. */
  if(!boardCanReorder()){
    const cur=(teacherClassConfig.activityBoard||{})[id];
    if(cur && (Number(cur.module)||0)===mn){ renderTeacherActivities({cached:true}); return; }
    append(); return;
  }
  // Let go on its own card: nothing moved, so nothing is written — same as
  // the aborted drag above. append() here would send it to the end of the
  // module and renumber every card after it.
  if(over && over.dataset.id===id){ renderTeacherActivities({cached:true}); return; }
  if(!over || !section.contains(over)){ append(); return; }
  // pos is counted in the target module AFTER the dragged card is removed,
  // which is exactly what teacherMoveActivity does with it.
  const list=teacherBoardModuleIds(teacherClassConfig, mn).filter(x=>x!==id);
  const idx=list.indexOf(over.dataset.id);
  if(idx<0){ append(); return; }
  const r=over.getBoundingClientRect();
  // Above the midpoint means "before this card" on screen. In a descending
  // view that is AFTER it in course order — see boardDescending().
  const above=e.clientY < r.top + r.height/2;
  const before=boardDescending() ? !above : above;
  teacherMoveActivity(id, mn, before ? idx+1 : idx+2);
}
/* The name to SHOW for an activity in the console: the teacher's rename if
   one is live, otherwise the title class-activities.js ships. Deliberately
   mirrors caTitle() in app.js rather than sharing it — app.js's copy reads
   the student-side `activityTitles` global, this one reads the config object
   the activities table already has in hand, and both apply the same `base`
   staleness rule (see caTitle's comment for what `base` buys us). If that
   rule changes, change it in both. */
/* The rename's `base` is the shipped title it was typed over, so compare it
   with the RAW activity's title. The detail page passes the caView() copy,
   whose title is the Power chords one (title_power) in Power mode, and that
   never matched: the list showed the rename and the page head the shipped
   title. Without a rename, return the title of the view on screen
   (caView: the Power chords title in Power mode — ca-34 opens there), so the
   board, pins and sort read what the detail page and students read. Mirrors
   caTitle() in app.js, in English like the rest of the console. */
function teacherActivityTitle(a, cfg){
  const raw=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===a.id)||a;
  if(teacherActivityRenamed(raw, cfg)) return cfg.activityTitles[raw.id].en;
  return (typeof caView==='function' ? caView(raw) : raw).title;
}
/* A live rename: one stored against the shipped title it was typed over.
   Not "the shown title differs from a.title" — in Power mode the view title
   differs with no rename at all, and that offered an Undo rename for nothing. */
function teacherActivityRenamed(a, cfg){
  const raw=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===a.id)||a;
  const o=((cfg&&cfg.activityTitles)||{})[raw.id];
  return !!(o && o.en && o.base===raw.title);
}
// Read the open editor's box and hand it to the writer. Split out from
// teacherSetActivityTitle so Enter, the Save button and a future affordance
// all reach the same value without each re-finding the input.
function teacherSaveActivityTitle(id){
  const inp=document.querySelector(`.t-act-title-edit[data-id="${CSS.escape(id)}"]`);
  // The Songs view edits only the song's NAME and hands the rest of the
  // title (" — Play Along") back on data-suffix, so the card keeps it.
  const name=inp ? inp.value.trim() : '';
  teacherSetActivityTitle(id, name ? name+((inp && inp.dataset.suffix)||'') : '');
}
// The rename editor lives in two views — the Class activities board and the
// Songs list — and the same handlers open, close and save it in both.
function teacherRenderRenameView(){
  if(teacherView==='songs') renderTeacherSongs();
  else renderTeacherActivities({cached:true});
}
/* Write (or clear) a rename. Same optimistic-then-roll-back write shape as
   teacherSetActivityHidden/Date above, against a third map on the same doc.

   Two cases clear the override outright rather than storing it: an empty box,
   and a value equal to the shipped title (either chord version's) — both mean "no rename", and storing
   either would leave a row in config/class that does nothing but has to be
   reasoned about later.

   `base` freezes the shipped title this rename was typed against, which is
   what lets the override expire by itself once the name is folded into
   class-activities.js properly. caTitle() in app.js enforces it. */
async function teacherSetActivityTitle(id, value){
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!a) return;
  const name=String(value||'').trim().slice(0,120);
  // The editor opens holding the title on screen, which in Power mode is the
  // Power chords one: saving it unchanged is "no rename" too, or Full-mode
  // students would get the Power chords title as a rename.
  const viewTitle=typeof caView==='function' ? caView(a).title : a.title;
  const clear=!name || name===a.title || name===viewTitle || (!!a.title_power && name===a.title_power);
  if(!teacherClassConfig.activityTitles) teacherClassConfig.activityTitles={};
  const had=Object.prototype.hasOwnProperty.call(teacherClassConfig.activityTitles, id);
  const prev=teacherClassConfig.activityTitles[id];
  if(clear) delete teacherClassConfig.activityTitles[id];
  else teacherClassConfig.activityTitles[id]={en:name, base:a.title};
  activityEditId=null;
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch = clear ? {activityTitles:{[id]:fv.delete()}} : {activityTitles:{[id]:{en:name, base:a.title}}};
    await teacherWriteConfig(patch, {['activityTitles.'+id]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.activityTitles[id]=prev; else delete teacherClassConfig.activityTitles[id];
    // Leave the editor exactly as it is — re-rendering here would repaint the
    // box from the server's (unchanged) copy and silently discard what was
    // typed, which on a flaky connection is the worst possible outcome.
    activityEditId=id;
    teacherConfigSaveFailed(e, 'Could not save that rename — check your connection and Firestore rules. What you typed is still in the box.', {keepEditor:true});
    return;
  }
  if(teacherView==='activities') renderTeacherActivities();
  else if(teacherView==='songs') renderTeacherSongs();
}
// One activity's full content, read-only — the actual "click to go to the
// activity" destination. Built straight from window.CLASS_ACTIVITIES (the
// same source the student-facing card in app.js reads), not from
// caActivityCardHtml() in app.js: that renderer is wired to the signed-in
// student's OWN classActivities/caStepDone/caOpenId state and to #app being
// visible (its video button opens the in-page YouTube panel, which lives
// inside #app — hidden the whole time the teacher dashboard is up). A
// teacher previewing a student's activity shouldn't touch either, so this is
// its own small renderer: plain step list, a real YouTube link instead of
// the in-page panel, no "mark complete" affordance. Reuses existing
// classes(.stu-back/.stu-section-head/.tr-card/.coach-tip/.step-figure) so
// it needs no CSS of its own. English-only, like the rest of teacher.js —
// activity titles/text aren't run through tf() here either.
/* The same shareable link as the table's Copy link button, spelled out on
   the detail page so it can be read (and pasted by hand) as well as copied. */
const linkRow=a=>`<div class="tg-note">Student link: <code>${escHtml(activityStudentLink(a.id))}</code> `
  +`<button class="tg-seg-btn t-act-link" data-copy-activity-link data-id="${escAttr(a.id)}">Copy link</button></div>`;
/* Done | Not done, side by side, for one activity or exit check (Jonathan,
   2026-10-02: "a list of who is done and who is not done for each
   activity … two columns"). Same done test as the table under it —
   classActivities[id], or for an exit check a turned-in result — and it
   follows the console's period filter like every other view. A cleared
   student is still not done; the tag says why they aren't blocked. The
   period tag shows only on All, where the classes are mixed. */
function teacherDoneRollHtml(a, students, isDone){
  if(!students.length) return '';
  isDone=isDone||(s=>(s.classActivities||{})[a.id]===true);
  const clears=teacherClassConfig.activityClears||{};
  const showPer=teacherPeriodFilter==='all';
  const name=(s,cleared)=>{
    const p=teacherStudentPeriod(s);
    const per=showPer&&p?` <span class="ta-roll-tag">${p==='CAS'?'CAS':'P'+escHtml(p)}</span>`:'';
    const cl=cleared?' <span class="ta-roll-tag">cleared</span>':'';
    return `<li>${escHtml(s.name||s.email||'(no name)')}${per}${cl}</li>`;
  };
  const done=students.filter(isDone);
  const not=students.filter(s=>!isDone(s));
  const col=(cls,head,list,empty,cleared)=>`<div class="ta-roll-col ${cls}"><div class="ta-roll-head" role="heading" aria-level="3">${head} (${list.length})</div>`
    +(list.length?`<ul>${list.map(s=>name(s,cleared&&!!((clears[s.uid]||{})[a.id]))).join('')}</ul>`:`<div class="ta-roll-empty">${empty}</div>`)+'</div>';
  return `<div class="ta-roll">${col('ta-roll-done','Done',done,'Nobody yet.',false)}${col('ta-roll-not','Not done',not,'Everyone is done.',true)}</div>`;
}
/* The Students block of a regular activity's detail page: the Done / Not
   done roll, the gate note and the per-student table. Its own function, and
   its own [data-ta-live] box on the page, so the student-progress refresh
   (teacherRefreshStudents) can repaint just this part — re-rendering the
   whole page would stop a song or drill playing in the Preview below it.

   Per-student status + gate clear (Today-first work order, Phase 1) — same
   uid -> { activityId -> true } map, and the same Clear toggle, as the
   exit-check grid (renderTeacherCheckDetail). Sorted by name, not by
   done/not-done, so a teacher looking for one student doesn't have to scan
   two groups. */
function teacherActivityGridHtml(a){
  const clearsMap=teacherClassConfig.activityClears||{};
  // An individual activity (the board's "Who" picker) lists only its students.
  const sortedStudents=allStudents.filter(s=>teacherActivityForStudent(a,s.uid,teacherClassConfig))
    .sort((x,y)=>String(x.name||x.email||'').localeCompare(String(y.name||y.email||'')));
  const studentRows=sortedStudents.map(s=>{
    const done=(s.classActivities||{})[a.id]===true;
    const cleared=!!((clearsMap[s.uid]||{})[a.id]);
    return `<tr><td class="nc">${escHtml(s.name||s.email||'(no name)')}</td>
      <td>${done?'Done ✓':'Not yet'}</td>
      ${teacherStudentPeriod(s)==='CAS'?TEACHER_CAS_GATE_CELL:`<td><button class="tg-seg-btn ${cleared?'on':''}" data-set-activity-clear data-uid="${escAttr(s.uid)}" data-id="${escAttr(a.id)}" data-state="${cleared?'unclear':'clear'}" title="Lets this student past the gate without finishing.">${cleared?'Cleared':'Clear'}</button></td>`}</tr>`;
  }).join('');
  const studentTable=sortedStudents.length
    ? `<div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th><th>Status</th><th>Gate</th></tr></thead><tbody>${studentRows}</tbody></table></div>`
    : '<div class="t-loading">No student data yet — students need to sign in first.</div>';
  return teacherDoneRollHtml(a, sortedStudents)
    +`<div class="tg-note">Gate: until a student finishes a Required activity, In-Class Activities opens first when they sign in. Nothing else on the site is locked. Clear lets one student skip this one at sign-in without finishing it — a sub day, a connectivity problem, work done on paper.</div>`
    +studentTable;
}
/* One activity, in its tabs (Layout A): Preview, Students, Settings. Drawn
   into the split's right column, or alone with a Back button when it was
   opened from Songs or a student's page (teacherDetailHost). The board has
   no detail column, so a call while it is up just repaints it. */
function renderTeacherActivityDetail(id){
  const box=document.getElementById('t-grid-container');
  if(teacherView==='activities' && teacherActivityScreen()==='board'){ renderTeacherActivities({cached:true}); return; }
  if(teacherView==='activities' && teacherActivityScreen()==='split'){
    activityDetailId=id; activityListPickId=id;
    if(!box.querySelector('[data-ta-detail]')){ renderTeacherActivities({cached:true}); return; }
  }
  const host=teacherDetailHost();
  const fromStu=activityDetailFrom==='student' ? allStudentsRaw.find(s=>s.uid===activityDetailFromUid) : null;
  const back = (teacherView==='activities' && teacherActivityScreen()==='split') ? ''
    : `<button type="button" class="stu-back" data-back-to-activities>&#x2190; ${activityDetailFrom==='songs'?'All songs':fromStu?`Back to ${escHtml(fromStu.name||fromStu.email||'the student')}`:'All activities'}</button>`;
  const raw=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  if(!raw){ host.innerHTML=`${back}<div class="t-loading">Could not find that activity — it may have been renamed or removed.</div>`; return; }
  /* The Full chords / Power chords switch (chordVersions — caView in app.js):
     the preview draws the version the switch shows, through the same
     transform the student card uses, so the two can't disagree. */
  const a=typeof caView==='function'?caView(raw):raw;
  // A check has no steps — its detail page is a results grid, see below.
  if(a.kind==='check') return renderTeacherCheckDetail(a, back, host);
  // Where this card sits in the course, straight off the board — "Module 3
  // · #7", or the reason it has no number. Same view students' #N comes
  // from (caBoardOrder), so the two can't disagree.
  const place=teacherActivityPlace(a.id);
  /* One step's inner content — shared by the full-list preview and the
     "Preview as student" single-step view below, so the two can't drift. */
  const stepInnerHtml=(s,si,pos)=>{
    const media=[];
    /* width/height: see caStepHtml() in app.js — same 640x244 board, and
       checks.mjs (1v) fails the push if the two renderers disagree. */
    if(s.figure) media.push(`<span class="step-figure"><img src="${escAttr(s.figure)}" alt="${escAttr(s.figureAlt||'')}" width="640" height="244"></span>`);
    if(s.video && s.video.id){
      const url=`https://www.youtube.com/watch?v=${encodeURIComponent(s.video.id)}${s.video.start?`&start=${Number(s.video.start)}`:''}`;
      const vLabel=s.video.label?escHtml(s.video.label):'Watch video';
      // A real link, not the loadPanel()/rp-trigger in-app YouTube panel —
      // that panel's markup lives inside #app, which teacher mode never shows.
      media.push(`<a class="rp-trigger" href="${escAttr(url)}" target="_blank" rel="noopener">&#x25B6; ${vLabel}</a>`);
    }
    // suppressCoach: the Listening Coach mic-check button opens a panel
    // that's also inside #app — pointless (and confusing) to show here.
    // noRevealDelay: the preview has no arming pass (caArmTabReveals runs
    // off renderClassActivities, which this screen never calls) and
    // Jonathan wants to see the board immediately when checking an
    // activity, not wait out the same delay a student would.
    // defaultLinesPerPage: same two-rows-a-page default the student card uses.
    if(s.tab) media.push(buildTab(s.tab,{keyPrefix:`bpm:ca-preview:${a.id}:${si}:tab`,suppressCoach:true,noRevealDelay:true,defaultLinesPerPage:CA_TAB_LINES_PER_PAGE}));
    // The drawn strum pattern (step.strum) — same builder as caStepHtml().
    if(s.strum && typeof buildStrum==='function') media.push(buildStrum(s.strum,{keyPrefix:`bpm:ca-preview:${a.id}:${si}:strum`}));
    /* LISTEN ROUNDS (caStepHtml's caListenRoundsRowHtml): the student's step has no Mark done; it ticks itself after n full rounds with the check. */
    if(s.listenRounds) media.push(`<div class="tg-note">Ticks itself after ${escHtml(String(Number(s.listenRounds) || 0))} full rounds with the Listening Coach check (no Mark done button for students).</div>`);
    /* The backing-track snippet, from the SAME builder the student card uses
       (buildSnippet in app.js, loaded before this file) — a step field with
       one renderer can't go invisible on one side of it, which is the whole
       point of the two-renderers rule. Nothing here needs #app: it is an
       <audio> element, unlike the YouTube panel above. It plays for real, so
       Jonathan can hear the day's loop before class. */
    if(s.snippet && typeof buildSnippet==='function') media.push(buildSnippet(s.snippet, { hasTab: !!s.tab }));
    // Drills are playable in the preview — this is where the day's activity
    // gets checked before class, and a quiz you can't try isn't previewed.
    // Own key namespace (`ca-preview-…`) so a drill open here and the same
    // one in the student panel don't share state; sdSaveBest/dkSaveBest skip
    // the write in teacher mode, so a teacher trying it doesn't file a best
    // score on their own doc. No teardown needed on the way out: sdTick
    // stops itself once its box leaves the DOM.
    if(s.drill && typeof renderShuffleDrill==='function') media.push(renderShuffleDrill(s.drill,`ca-preview-${a.id}-s${si}`,null));
    // Step head mirrors caStepHtml()/caStepHeadText() in app.js — "Step 4",
    // or "Step 4: Tune it back" when the step carries an optional label.
    // English only, like the rest of this preview.
    // `pos` is the step's place on its route (paths); the flat `si` keys everything else.
    const head=`Step ${(pos===undefined?si:pos)+1}${s.label?`: ${escHtml(s.label)}`:''}`;
    return `<div class="tr-name">${head}</div>${wrapGotItWhen(s.text||'')}${media.join('')}`;
  };
  /* Paths (`paths` — caRoute / caPathChooserHtml in app.js, 2026-11-04): the
     full list shows the chooser students see first (its Start buttons do
     nothing here), then every step grouped under its path, the shared tail
     last, each numbered the way its path's route reads it ("Step 3" is the
     third step a student on that path meets). Without paths it is the plain
     flat list, as before. */
  const hasPaths=typeof caHasPaths==='function'&&caHasPaths(a);
  const stepCard=(s,si,pos)=>`<div class="tr-card ca-prev-step" style="margin-bottom:12px">${stepInnerHtml(s,si,pos)}</div>`;
  const stepsHtml=!hasPaths?(a.steps||[]).map((s,si)=>stepCard(s,si,si)).join('')
    :(()=>{
      const steps=a.steps||[];
      const shared=caSharedSteps(a);
      const chooser=`<div class="tg-note">Students pick a path first. This is the chooser they see (its buttons do nothing here):</div><div class="ca-prev-paths">${caPathChooserHtml(a,{preview:true})}</div>`;
      const groups=a.paths.map(p=>{
        const own=caPathSteps(a,p.key);
        return `<div class="stu-section-head" role="heading" aria-level="3">Path: ${escHtml(p.label||p.key)} <span style="opacity:.55;font-size:.72em">(${own.length} step${own.length===1?'':'s'}, then the shared ones)</span></div>`
          +own.map((si,pos)=>stepCard(steps[si],si,pos)).join('');
      }).join('');
      const longest=Math.max(0,...a.paths.map(p=>caPathSteps(a,p.key).length));
      const tail=shared.length?`<div class="stu-section-head" role="heading" aria-level="3">Then, on every path</div>`
        +shared.map((si,k)=>`<div class="tg-note" style="margin:0 0 4px">Step ${longest+k+1} on the longest path; ${a.paths.map(p=>`${escHtml(p.label||p.key)}: step ${caPathSteps(a,p.key).length+k+1}`).join(', ')}.</div>`+stepCard(steps[si],si,longest+k)).join(''):'';
      return chooser+groups+tail;
    })();
  /* "Preview as student" (2026-09-29): the same steps, shown the real way a
     focus-view activity shows them — one on screen, numbered step buttons
     above it, Previous/Next below. Local-only index (taFocusPreviewIdx), no
     locking on earlier steps being "done" — there's no real progress here to
     gate on, and a teacher checking step 3 shouldn't have to fake-complete
     1 and 2 first. */
  const focusPreviewHtml=()=>{
    const steps=a.steps||[];
    /* Paths: a local-only path pick (taFocusPreviewPath, the first path by
       default) and the route it gives — the same caPathSteps / caSharedSteps
       split the student card walks. `cur` is a ROUTE position here. */
    const pathKey=hasPaths?(a.paths.find(p=>p.key===taFocusPreviewPath[a.id])||a.paths[0]).key:'';
    const route=hasPaths?caPathSteps(a,pathKey).concat(caSharedSteps(a)):steps.map((s,si)=>si);
    const n=route.length;
    const cur=Math.min(Math.max(taFocusPreviewIdx[a.id]||0,0),Math.max(n-1,0));
    const pathPick=hasPaths?`<div class="tg-seg" style="margin-bottom:10px">${a.paths.map(p=>`<button type="button" class="tg-seg-btn${p.key===pathKey?' on':''}" data-ta-focus-path data-id="${escAttr(a.id)}" data-key="${escAttr(p.key)}" aria-pressed="${p.key===pathKey}">Path: ${escHtml(p.label||p.key)}</button>`).join('')}</div>`:'';
    const pips=route.map((si,pos)=>`<button type="button" class="ca-focus-dot${pos===cur?' is-now':''}" data-ta-focus-go data-id="${escAttr(a.id)}" data-idx="${pos}" title="Step ${pos+1}${steps[si].label?`: ${escAttr(steps[si].label)}`:''}">${pos+1}</button>`).join('');
    const last=cur>=n-1;
    const back=cur>0?`<button type="button" class="ca-focus-back" data-ta-focus-go data-id="${escAttr(a.id)}" data-idx="${cur-1}">&#x25C0; Previous</button>`:'';
    const next=`<button type="button" class="ca-focus-next" data-ta-focus-go data-id="${escAttr(a.id)}" data-idx="${last?cur:cur+1}">${last?'Last step':'Next step &#x25B6;'}</button>`;
    return pathPick+`<div class="ca-focus-dots" role="group" aria-label="Steps" style="margin-bottom:10px">${pips}</div>`
      + `<div class="tr-card ca-prev-step">${n?stepInnerHtml(steps[route[cur]],route[cur],cur):'No steps on this activity yet.'}</div>`
      + `<div class="ca-focus-nav">${back}${next}</div>`;
  };
  /* Short info lines above the preview — how students meet this card that
     the preview itself can't show. Focus view is activity-level
     presentation, not a step field: the preview DEFAULTS to every step (a
     fast pre-class read), and "Preview as student" switches it to the real
     one-step-at-a-time shape (focusPreviewHtml) — local, nothing saved. See
     caIsFocus in app.js. `metronome: <bpm>` (ca-21): tapping the card open
     starts the student's own Metro tool — caAutoStartMetro() in app.js, on
     a real tap only. */
  const isCard=typeof caIsCard==='function'&&caIsCard(a);
  const info=[];
  if(a.view==='focus') info.push(`<div class="ta-info">Focus view: students see one step at a time and open each after marking the one before done. <button type="button" class="tg-seg-btn ta-act-btn" data-ta-focus-toggle data-id="${escAttr(a.id)}">${taFocusPreviewOn[a.id]?'Show full list':'Preview as student'}</button></div>`);
  if(a.metronome) info.push(`<div class="ta-info">Metronome: opening this starts each student's Metro tool at ${escHtml(String(Number(a.metronome)))} BPM in 4/4 (not from a Copy link URL, and not in this preview).</div>`);
  if(isCard) info.push(`<div class="ta-info">Practice card: students see this one screen. It counts as done once every numbered check is ticked; Level up is extra. Ticks here are not saved.</div>`);
  /* Practice card (view:'card'): the preview IS the student card —
     caCardBodyHtml() in app.js, the one body renderer both sides call (same
     shape as an exit check's caCheckBodyHtml), so it can't drift. The song
     plays for real; ticks here save nothing. A practice card draws its own
     key / chord switch inside caCardBodyHtml. */
  const levelUp=(()=>{ /* A Level up that opens another card (caCardLinkHtml in app.js) — name it here, since the preview card renders no link. */
    const lu=isCard?((a.card.checks||[]).slice(-1)[0]||{}):{};
    const to=lu.levelUp&&lu.card?(window.CLASS_ACTIVITIES||[]).find(x=>x.id===lu.card):null;
    return to?`<div class="tg-note">Level up button opens ${escHtml(to.id)} · ${escHtml(to.title||'')} — shown to students once that card is released or set to Play Along now. Before its date it opens in place of this card, and closing it brings this card back.</div>`:'';
  })();
  const preview=info.join('')
    +(a.intro?`<div class="coach-tip" style="margin:0 2px 16px">${escHtml(a.intro)}</div>`:'')
    +(isCard?'':(typeof caKeySwitchHtml==='function'?caKeySwitchHtml(a):'')+(typeof caChordSwitchHtml==='function'?caChordSwitchHtml(a):''))
    +(isCard ? caCardBodyHtml(a,{preview:true})
      : (a.view==='focus' && taFocusPreviewOn[a.id]) ? focusPreviewHtml()
      : (stepsHtml || '<div class="stu-empty">No steps on this activity yet.</div>'))
    +levelUp
    +(caJourneyUrl(a)?`<div class="ca-journey-row"><a class="jl-song-btn" href="${escAttr(caJourneyUrl(a))}" target="_blank" rel="noopener">${escHtml(t('ca.openJourney',{song:(SONG_JOURNEYS.find(s=>s.id===a.journey)||{}).name||''}))} &#x2197;</a></div>`:'');
  const students=`<div class="tg-note">${escHtml(place)}</div>`
    +`<div data-ta-live="counts">${teacherActivityCountsHtml(a)}</div>`
    +teacherOptionalBanner(a.id)
    +`<div data-ta-live="grid">${teacherActivityGridHtml(a)}</div>`;
  host.innerHTML=teacherDetailFrameHtml(a, back, {preview, students, settings:teacherActivitySettingsHtml(a, teacherClassConfig)});
  if(activityEditId){ const inp=host.querySelector('.t-act-title-edit'); if(inp){ inp.focus(); inp.select(); } }
}
/* An exit check's detail page: who turned it in, what they picked, and
   which question the room missed. Deliberately NOT the plain step list
   above — a check has no steps, and the thing worth reading before the
   next lesson is the "Missed by" row.

   The preview at the bottom calls caCheckBodyHtml() in app.js, the same
   renderer the student card uses. Picks made there are graded and shown
   but written nowhere (ecSubmit bails on IS_TEACHER_MODE), so previewing
   is not turning in.

   The parts that read student progress — the "N of M turned in" line, the
   roll and the results grid — are built by teacherCheckLiveParts() and sit
   in their own [data-ta-live] boxes, so the student-progress refresh can
   repaint them without rebuilding the preview (and wiping its picks). */
function renderTeacherCheckDetail(a, back, host){
  host=host||document.getElementById('t-grid-container');
  const live=teacherCheckLiveParts(a);
  const preview=`<div class="ta-info">Try the check yourself — nothing you pick here is saved.</div>`
    +(a.intro?`<div class="coach-tip" style="margin:0 2px 16px">${escHtml(a.intro)}</div>`:'')
    +`<div id="ec-preview-body-${escAttr(a.id)}">${caCheckBodyHtml(a,{preview:true,keyPrefix:'ca-preview'})}</div>`;
  const students=`<div class="tg-note" data-ta-live="note">${live.note}</div>`
    +`<div data-ta-live="counts">${teacherActivityCountsHtml(a)}</div>`
    +teacherOptionalBanner(a.id)
    +`<div data-ta-live="grid">${live.grid}</div>`;
  host.innerHTML=teacherDetailFrameHtml(a, back, {preview, students, settings:teacherActivitySettingsHtml(a, teacherClassConfig)});
}
function teacherCheckLiveParts(a){
  const c=a.check||{};
  const items=c.items||[];
  const dates=(teacherClassConfig&&teacherClassConfig.activityDates)||{};
  const dateVal=dates[a.id]||'';
  const dateNote=teacherActivityRetired(a.id,teacherClassConfig)
    ? (teacherActivityDeleted(a.id,teacherClassConfig)?'Deleted — hidden from students':'Archived — hidden from students')
    : (dateVal?`Dated ${escHtml(dateVal)}`:'No date set — hidden from students');
  // Item headings: the fret run for nextNote, the fret itself for noteName.
  const heads=items.map((it,i)=>c.type==='nextNote'
    ? `Q${i+1}: ${escHtml((it.notes||[]).map(n=>n.fret).join(' '))} &rarr; ${escHtml(String(it.answer.fret))}`
    : `Q${i+1}: fret ${escHtml(String(it.fret))} = ${escHtml(it.answer)}`);
  const withRes=[], without=[];
  // Only the students the check is for (the board's Who picker), like
  // teacherActivityGridHtml and the board's done lines.
  const forIt=allStudents.filter(s=>teacherActivityForStudent(a,s.uid,teacherClassConfig));
  forIt.forEach(s=>{
    const r=(s.exitChecks||{})[a.id];
    if(r) withRes.push({s,r}); else without.push(s);
  });
  const byName=(x,y)=>String(x.s?x.s.name:x.name||'').localeCompare(String(y.s?y.s.name:y.name||''));
  withRes.sort(byName); without.sort((x,y)=>String(x.name||'').localeCompare(String(y.name||'')));
  // Per-item miss counts across submitted students only — a student who
  // hasn't turned it in hasn't missed anything.
  const missed=items.map(()=>0);
  withRes.forEach(({r})=>{
    ecGrade(a,r.picks).rows.forEach((row,i)=>{ if(!row.ok) missed[i]++; });
  });
  const cell=ok=>`<span class="tck yes" style="display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border:2px solid var(--${ok?'green':'amber'}-text);color:var(--${ok?'green':'amber'}-text)">${ok?TCK_CHECK_SVG:TCK_MINUS_SVG}</span>`;
  // Gate clear (Today-first work order, Phase 1) — same uid -> { activityId
  // -> true } map, and the same toggle, as the regular-activity grid above
  // (renderTeacherActivityDetail). A student who hasn't turned the check in
  // yet can still be cleared — a sub day, a connectivity problem — so it's
  // its own column rather than folded into the score cells.
  const clearsMap=teacherClassConfig.activityClears||{};
  const clearCell=s=>{
    if(teacherStudentPeriod(s)==='CAS') return TEACHER_CAS_GATE_CELL;
    const cleared=!!((clearsMap[s.uid]||{})[a.id]);
    return `<td><button class="tg-seg-btn ${cleared?'on':''}" data-set-activity-clear data-uid="${escAttr(s.uid)}" data-id="${escAttr(a.id)}" data-state="${cleared?'unclear':'clear'}" title="Lets this student past the gate without finishing.">${cleared?'Cleared':'Clear'}</button></td>`;
  };
  const bodyRows=withRes.map(({s,r})=>{
    const g=ecGrade(a,r.picks);
    const cells=g.rows.map(row=>`<td style="text-align:center">${cell(row.ok)}<div style="font-size:.72em;opacity:.7">${escHtml(row.pick||'—')}</div></td>`).join('');
    return `<tr><td class="nc">${escHtml(s.name||s.email||'(no name)')}</td><td>${Number(r.score)||0}/${Number(r.total)||0}</td><td>${escHtml(r.at||'')}</td>${cells}${clearCell(s)}</tr>`;
  }).join('');
  const missRow=withRes.length
    ? `<tr><td class="nc" style="font-style:italic">Missed by</td><td colspan="2"></td>`
      +missed.map(m=>`<td style="text-align:center">${m}</td>`).join('')+`<td></td></tr>`
    : '';
  const noneRows=without.map(s=>`<tr style="opacity:.55"><td class="nc">${escHtml(s.name||s.email||'(no name)')}</td><td colspan="${2+items.length}">not turned in</td>${clearCell(s)}</tr>`).join('');
  const table=forIt.length
    ? `<div class="t-grid-wrap"><table><thead><tr><th class="nc">Student</th><th>Score</th><th>Date</th>${heads.map(h=>`<th>${h}</th>`).join('')}<th>Gate</th></tr></thead>`
      +`<tbody>${bodyRows}${missRow}${noneRows}</tbody></table></div>`
    : '<div class="t-loading">No student data yet — students need to sign in first.</div>';
  return {
    note: `${escHtml(teacherActivityPlace(a.id))} ${dateNote}. ${withRes.length} of ${forIt.length} turned in. Checks take no #number — they never enter the course's numbered run.`,
    grid: teacherDoneRollHtml(a, [...forIt].sort((x,y)=>String(x.name||x.email||'').localeCompare(String(y.name||y.email||''))), s=>!!(s.exitChecks||{})[a.id])
      +table,
  };
}
async function teacherSetActivityHidden(id, state){
  const on = state==='hide';
  if(!teacherClassConfig.hiddenActivities) teacherClassConfig.hiddenActivities={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.hiddenActivities, id);
  const prev = teacherClassConfig.hiddenActivities[id];
  if(on) teacherClassConfig.hiddenActivities[id]=true; else delete teacherClassConfig.hiddenActivities[id];
  /* Painted now from the copy just changed, like teacherMoveActivity: the
     read after the write waits while any of this tab's writes are out
     (loadTeacherClassConfig), so a run of quick toggles showed nothing
     until the last one landed. */
  if(teacherView==='activities') renderTeacherActivities({cached:true});
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    // Clear the flag rather than writing false, so config/class doesn't
    // accumulate a row per activity that was ever hidden.
    const patch = on ? {hiddenActivities:{[id]:true}} : {hiddenActivities:{[id]:fv.delete()}};
    await teacherWriteConfig(patch, {['hiddenActivities.'+id]: had?prev:undefined});
  }catch(e){
    // Save failed — undo the optimistic local mutation so the re-render
    // below reflects what Firestore actually holds, not what we hoped for.
    if(had) teacherClassConfig.hiddenActivities[id]=prev; else delete teacherClassConfig.hiddenActivities[id];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
  else if(teacherView==='songs') renderTeacherSongs();
}
/* The Hide all / Show all button on a board section's heading: the same
   hiddenActivities flag teacherSetActivityHidden writes, for every live card
   in that module group at once, in ONE write. It writes the cards' own flags
   and nothing about the group, so any one card can be set back with its own
   Visible / Hidden switch afterwards. Archived / deleted cards in the group
   are left alone. Cell-checked on each card's row it touches — a card someone
   else re-hid or un-hid in the meantime refuses the whole write. */
async function teacherSetModuleHidden(module, state){
  const mn=Number(module);
  const on = state==='hide';
  const sec=teacherBoardView(teacherClassConfig).sections.find(s=>s.module===mn);
  const ids=sec ? sec.ids.slice() : [];
  if(!ids.length) return;
  if(!teacherClassConfig.hiddenActivities) teacherClassConfig.hiddenActivities={};
  const map=teacherClassConfig.hiddenActivities;
  const before={};
  ids.forEach(id=>{ before[id]={had:Object.prototype.hasOwnProperty.call(map,id), prev:map[id]}; });
  ids.forEach(id=>{ if(on) map[id]=true; else delete map[id]; });
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const rows={}, base={};
    ids.forEach(id=>{
      rows[id] = on ? true : fv.delete();
      base['hiddenActivities.'+id] = before[id].had ? before[id].prev : undefined;
    });
    await teacherWriteConfig({hiddenActivities:rows}, base);
  }catch(e){
    // Save failed — put every card's flag back as it was before the click.
    ids.forEach(id=>{ if(before[id].had) map[id]=before[id].prev; else delete map[id]; });
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* Required / Optional — config/class.optionalActivities (id -> true). An
   optional activity is still visible to students (caIsVisible ignores this
   map) but never blocks the site (caBlockers, teacherBlockersFor,
   journeyBlockers). Same write shape as teacherSetActivityHidden:
   cell-checked, flag cleared rather than written false. */
async function teacherSetActivityOptional(id, state){
  const on = state==='optional';
  if(!teacherClassConfig.optionalActivities) teacherClassConfig.optionalActivities={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.optionalActivities, id);
  const prev = teacherClassConfig.optionalActivities[id];
  /* The flag is stored only when it differs from the default
     (teacherActivityOptionalByDefault): true for Optional on a card that is
     Required by default, false for Required on one that is Optional by
     default. Matching the default clears it. */
  const keep = on!==teacherActivityOptionalByDefault(id, teacherClassConfig);
  if(keep) teacherClassConfig.optionalActivities[id]=on; else delete teacherClassConfig.optionalActivities[id];
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch = {optionalActivities:{[id]: keep ? on : fv.delete()}};
    // activityStudents too: `keep` came from it (a card given to individual
    // students is Optional by default), so a Who change from another console
    // since this tab's read has to refuse, not store the wrong flag.
    await teacherWriteConfig(patch, {['optionalActivities.'+id]: had?prev:undefined, ['activityStudents.'+id]: (teacherClassConfig.activityStudents||{})[id]});
  }catch(e){
    if(had) teacherClassConfig.optionalActivities[id]=prev; else delete teacherClassConfig.optionalActivities[id];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* Who — config/class.activityStudents (id -> { uid -> true }). One tick is
   one cell, so the write is cell-checked on that cell, same shape as
   teacherSetActivityOptional; an unticked student's key is deleted rather
   than written false, and the last untick leaves an empty map, which every
   reader takes as "whole class". Students read it in caForMe (app.js) and
   journeyForStudent (tabs/journey.js); teacherBlockersFor here. Nothing in
   progress/{uid} is touched. */
async function teacherSetActivityStudent(id, uid, on){
  if(!id || !uid) return;
  if(!teacherClassConfig.activityStudents) teacherClassConfig.activityStudents={};
  const map=teacherClassConfig.activityStudents;
  const who=(map[id] && typeof map[id]==='object') ? map[id] : (map[id]={});
  const had=Object.prototype.hasOwnProperty.call(who, uid);
  const prev=who[uid];
  if(on) who[uid]=true; else delete who[uid];
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch={activityStudents:{[id]:{[uid]: on ? true : fv.delete()}}};
    await teacherWriteConfig(patch, {['activityStudents.'+id+'.'+uid]: had?prev:undefined});
  }catch(e){
    if(had) who[uid]=prev; else delete who[uid];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* "Back to whole class" — drops the activity's whole entry. Strict write
   (no base): it clears ticks this tab may not have seen. */
async function teacherSetActivityWholeClass(id){
  const map=teacherClassConfig.activityStudents||{};
  if(!map[id]) return;
  const prev=map[id];
  delete map[id];
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    await teacherWriteConfig({activityStudents:{[id]:fv.delete()}});
  }catch(e){
    map[id]=prev;
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* Play Along by date / now — config/class.playAlongActivities (id -> true),
   practice cards only. "Now" puts the card in the Songs page's Play Along
   list without a release date (app.js caIsPlayAlongOnly); it does not make
   the card visible on In-Class Activities and it is not read by any of the
   three blocker rules, so it can never gate anyone. Hidden, Archive and
   Delete still win. Same write shape as teacherSetActivityOptional:
   cell-checked, flag cleared rather than written false. */
async function teacherSetActivityPlayAlong(id, state){
  const on = state==='now';
  if(!teacherClassConfig.playAlongActivities) teacherClassConfig.playAlongActivities={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.playAlongActivities, id);
  const prev = teacherClassConfig.playAlongActivities[id];
  if(on) teacherClassConfig.playAlongActivities[id]=true; else delete teacherClassConfig.playAlongActivities[id];
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch = on ? {playAlongActivities:{[id]:true}} : {playAlongActivities:{[id]:fv.delete()}};
    await teacherWriteConfig(patch, {['playAlongActivities.'+id]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.playAlongActivities[id]=prev; else delete teacherClassConfig.playAlongActivities[id];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* Keep practicing pins — config/class.activityPins, an ORDERED array of at
   most TEACHER_PINS_MAX activity ids (app.js CA_PINS_MAX, caPinRowHtml).
   Students get one button per pin at the top of In-Class Activities, in
   this order, with or without a release date; a pin is never read by
   caIsVisible or by any of the three blocker rules, so it can't gate
   anyone or count as one of today's cards. Hidden, Archive, Delete and
   "not assigned" still win on the student side.

   An array, not an id -> true map like its neighbours, because the ORDER is
   the point and four is a hard limit — so the write replaces the whole
   array, and it is cell-checked on the whole array: a concurrent pin or
   unpin from another console refuses rather than being overwritten, while
   an unrelated edit (a date, Hidden) goes through. */
const TEACHER_PINS_MAX = 4;
function teacherActivityPins(cfg){
  const v = cfg && cfg.activityPins;
  return Array.isArray(v) ? v.filter(x=>typeof x==='string' && x) : [];
}
async function teacherSetActivityPin(id, state){
  const cfg = teacherClassConfig;
  const had = Object.prototype.hasOwnProperty.call(cfg,'activityPins');
  const prev = cfg.activityPins;
  const cur = teacherActivityPins(cfg);
  let next;
  if(state==='on'){
    if(cur.includes(id)) return;
    if(cur.length>=TEACHER_PINS_MAX){
      alert('Keep practicing holds '+TEACHER_PINS_MAX+' cards at most. Unpin one first.');
      return;
    }
    next = cur.concat(id);
  } else {
    if(!cur.includes(id)) return;
    next = cur.filter(x=>x!==id);
  }
  cfg.activityPins = next;
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    await teacherWriteConfig({activityPins: next}, {activityPins: had?prev:undefined});
  }catch(e){
    if(had) cfg.activityPins=prev; else delete cfg.activityPins;
    teacherConfigSaveFailed(e, 'Could not save that pin — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}
/* ── Typing a release date (2026-10-12) ──────────────────────────────────
   Chrome fires 'change' on a date box after EVERY keystroke that leaves a
   complete date, not once at the end. Checked in headless Chrome over CDP
   the same day, with the box holding 2026-10-12:
     retype the day as 25    -> change 2026-10-02, then 2026-10-25
     retype the year as 2027 -> change 0002-10-12, 0020-10-12, 0202-10-12,
                                then 2027-10-12
   Each of those was a write. 2026-10-02 and 0002-10-12 are in the past, so a
   scheduled card went LIVE for students mid-keystroke, and the repaint after
   that write threw away the box being typed in.

   So a typed date is saved once — on Enter or on leaving the box — and a
   year more than one away from this one is refused (the box goes back to the
   saved date and says why), since no real release date is in 0202. A pick
   from the calendar has no keystroke behind it (no data-typing flag), so it
   still saves the moment it's made. */
function teacherSavedActivityDate(id){
  return ((teacherClassConfig&&teacherClassConfig.activityDates)||{})[id]||'';
}
function teacherCommitActivityDate(box){
  if(!box) return;
  delete box.dataset.typing;
  const id=box.dataset.id;
  const saved=teacherSavedActivityDate(id);
  const value=box.value;
  if(value===saved) return;   // nothing changed (or Enter then leaving the box — saved once)
  if(!value){
    // '' is either a cleared box (unpublish, as before) or a half-filled one
    // (a field blanked with Backspace) — the box reports the second as badInput.
    if(box.validity && box.validity.badInput){ teacherRejectActivityDate(box, saved, 'That date is not complete — nothing was saved.'); return; }
  } else {
    // The whole year, not its first four characters: the box takes up to six
    // year digits, and '20277-10-12' read as 2027 passed here and was then
    // dropped without a word by teacherSetActivityDate's format check.
    const y=Number(value.split('-')[0]), now=new Date().getFullYear();
    if(!(y>=now-1 && y<=now+1)){ teacherRejectActivityDate(box, saved, `Year ${y} is not right — use ${now-1} to ${now+1}. Nothing was saved.`); return; }
    if(!/^\d{4}-\d{2}-\d{2}$/.test(value)){ teacherRejectActivityDate(box, saved, 'That date is not complete — nothing was saved.'); return; }
  }
  teacherSetActivityDate(id, value);
}
/* Put the saved date back and say why, beside the box. Red is the site's
   error colour (--red-text, as on the issue-report form's error line). It
   clears on the next edit, or after a few seconds. */
function teacherRejectActivityDate(box, saved, msg){
  box.value=saved;
  box.setAttribute('aria-invalid','true');
  box.style.outline='2px solid var(--red-text)';
  const old=box.parentNode && box.parentNode.querySelector('.t-date-err');
  if(old) old.remove();
  const note=document.createElement('span');
  note.className='t-date-err';
  note.setAttribute('role','alert');
  note.style.cssText='color:var(--red-text);font-size:0.8125rem;margin-left:6px';
  note.textContent=msg;
  box.insertAdjacentElement('afterend', note);
  const clear=()=>{ box.removeAttribute('aria-invalid'); box.style.outline=''; note.remove(); };
  box.addEventListener('input', clear, {once:true});
  setTimeout(clear, 6000);
}
// The actual publish switch for an activity — see the schema note at the top
// of renderTeacherActivities. Mirrors teacherSetActivityHidden's write shape
// exactly, just against a different map on the same doc.
async function teacherSetActivityDate(id, value){
  const dateRe=/^\d{4}-\d{2}-\d{2}$/;
  if(value && !dateRe.test(value)) return;   // malformed <input> value — ignore rather than write garbage
  if(!teacherClassConfig.activityDates) teacherClassConfig.activityDates={};
  const had = Object.prototype.hasOwnProperty.call(teacherClassConfig.activityDates, id);
  const prev = teacherClassConfig.activityDates[id];
  if(value) teacherClassConfig.activityDates[id]=value; else delete teacherClassConfig.activityDates[id];
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    // Clear the field rather than writing '', so config/class doesn't
    // accumulate a row per activity that was ever dated then un-dated.
    const patch = value ? {activityDates:{[id]:value}} : {activityDates:{[id]:fv.delete()}};
    await teacherWriteConfig(patch, {['activityDates.'+id]: had?prev:undefined});
  }catch(e){
    if(had) teacherClassConfig.activityDates[id]=prev; else delete teacherClassConfig.activityDates[id];
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
}

/* ── Archive / Delete an activity ───────────────────────────────────────
   Schema, the difference between the two, and what neither can reach: the
   Archive / Delete block above renderTeacherActivities.

   Both mirror teacherSetActivityHidden's write shape — optimistic local
   mutation, one merge patch, roll the mutation back and say so if the write
   fails — just across several maps instead of one. */
async function teacherSetActivityArchived(id, state){
  const on = state==='archive';
  const cfg = teacherClassConfig;
  if(!cfg.archivedActivities) cfg.archivedActivities={};
  if(!cfg.deletedActivities) cfg.deletedActivities={};
  const hadA=Object.prototype.hasOwnProperty.call(cfg.archivedActivities,id), prevA=cfg.archivedActivities[id];
  const hadD=Object.prototype.hasOwnProperty.call(cfg.deletedActivities,id),  prevD=cfg.deletedActivities[id];
  if(on) cfg.archivedActivities[id]=true; else delete cfg.archivedActivities[id];
  // Restoring reaches BOTH maps on purpose: one Restore button serves an
  // archived row and a deleted one, so it has to clear whichever flag is set.
  delete cfg.deletedActivities[id];
  // Archiving also unpins, the way Delete does: students never see an
  // archived card, so a pin on one only held one of the TEACHER_PINS_MAX
  // slots for nothing. Restore does not put the pin back.
  const pinsHad=Object.prototype.hasOwnProperty.call(cfg,'activityPins'), pinsPrev=cfg.activityPins;
  const pinsBefore=teacherActivityPins(cfg);
  const unpin=on && pinsBefore.includes(id);
  if(unpin) cfg.activityPins=pinsBefore.filter(x=>x!==id);
  if(teacherView==='activities') renderTeacherActivities({cached:true});   // shown now — see teacherSetActivityHidden
  try{
    await ensureDb();
    const fv=firebase.firestore.FieldValue;
    const patch={
      archivedActivities:{[id]: on ? true : fv.delete()},
      deletedActivities:{[id]: fv.delete()}
    };
    const base={
      ['archivedActivities.'+id]: hadA?prevA:undefined,
      ['deletedActivities.'+id]:  hadD?prevD:undefined
    };
    // Still cell-checked, not strict: the new pin array is worked out from
    // the pin array alone, so naming that whole array in `base` (exactly
    // what teacherSetActivityPin does) is enough — a pin or unpin from
    // another console refuses, an unrelated edit still goes through.
    if(unpin){
      patch.activityPins=pinsBefore.filter(x=>x!==id);
      base.activityPins=pinsHad?pinsPrev:undefined;
    }
    await teacherWriteConfig(patch, base);
  }catch(e){
    if(hadA) cfg.archivedActivities[id]=prevA; else delete cfg.archivedActivities[id];
    if(hadD) cfg.deletedActivities[id]=prevD; else delete cfg.deletedActivities[id];
    if(unpin){ if(pinsHad) cfg.activityPins=pinsPrev; else delete cfg.activityPins; }
    teacherConfigSaveFailed(e, 'Could not save that change — check your connection and Firestore rules.');
  }
  if(teacherView==='activities') renderTeacherActivities();
  else if(teacherView==='songs') renderTeacherSongs();
}
