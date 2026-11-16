/* ── Class activities (teacher-only) ── One row per In-Class Activity, dated
   ones newest first then undated ones, with a done count, an expandable
   "who hasn't finished" list, a release-date input, and a Visible/Hidden
   toggle. Reads classActivities off the SAME student docs the Students tab
   already fetched (loadAllStudents) — no second Firestore read path for
   completion data.

   class-activities.js ships every entry undated — the date <input> here IS
   the publish switch: app.js's caIsVisible() hides an activity from students
   until config/class.activityDates has an id -> 'YYYY-MM-DD' entry for it
   whose date has arrived, so "no date set" (the state every new activity
   arrives in) is normal, not an error, and gets its own note rather than
   reading like a blank/broken cell. Clearing the input unsets the date and
   the activity goes dark again.

   The hide toggle lives in config/class.hiddenActivities (id -> true), same
   doc, same teacher-writes/students-read rule, same reason: git push is the
   permanent content-publish path, this toggle only exists to pull back
   something already dated, temporarily. It's independent of the date — a
   dated-but-hidden activity, and an undated one, both read the same to a
   student (invisible), but the two knobs don't affect each other.

   This table lists every activity regardless of date — deliberate, so a
   future or not-yet-dated activity can be pushed and reviewed here ahead of
   its lesson. See loadClassConfig() in app.js for the student-facing read. */
/* ── The link a student can be handed ──
   '#class-activities/ca-15' opens the Class activities page with that one
   card expanded and scrolled to (caFocusActivity in app.js) — the URL to
   paste into Classroom next to "do this exit check". Built off
   pathname, never location.href, so the console's own ?teacher=true doesn't
   ride along into a student's link. */
function activityStudentLink(id){
  return location.origin + location.pathname + '#class-activities/' + encodeURIComponent(id);
}
function teacherCopyActivityLink(id, btn){
  const url = activityStudentLink(id);
  const flash = ok => {
    if(!btn) return;
    const was = btn.textContent;
    btn.textContent = ok ? 'Copied \u2713' : 'Copy failed';
    setTimeout(() => { btn.textContent = was; }, 1400);
  };
  /* navigator.clipboard needs a secure context — https or localhost, which
     covers the live site and Live Server. The prompt() fallback is for
     anything else (a file:// open, an older browser): the teacher still gets
     the URL, just with a manual Ctrl+C. */
  if(navigator.clipboard && navigator.clipboard.writeText){
    navigator.clipboard.writeText(url).then(() => flash(true), () => window.prompt('Copy this link:', url));
    return;
  }
  window.prompt('Copy this link:', url);
}
/* ── Board state (view-only, not persisted) ─────────────────────────────
   Which sections are folded shut, which "Archived (N)" disclosures are
   open, and which card a drag is currently carrying. Same convention as
   activityEditId above: it lives for as long as the tab is open and starts
   fresh on re-entry, because none of it is worth a Firestore round trip. */
let boardSectionClosed={};     // module number -> true; undefined = never touched, default open
let boardArchOpen={};          // module number (or 'built') -> true
// Which "who hasn't finished (N)" lists are open, keyed '<activity id>|<period
// label>' (one list per period on each card). Same reason as boardArchOpen:
// every toggle, date or move repaints the board, and a list that snapped shut
// each time had to be re-opened after every click.
let boardDoneOpen={};
let boardWhoOpen={};   // id -> true while that card's "Who" picker is open, so a tick doesn't snap it shut
// "How this page works" — kept open across repaints too, now that the board
// also repaints on its own (teacherRefreshStudents) while it's being read.
let boardHelpOpen=false;
let boardDragId=null;          // the id a drag is carrying — never in dataTransfer
/* ── How the board is SHOWN (Jonathan, 2026-09-16) ──────────────────────
   Sorting here is the teacher's view and nothing else: it never writes, and
   students always read the course order the board holds. The `#N` on a card
   is its real position either way, so a descending view reads 9, 8, 7 …

   Descending is the DEFAULT, on both axes: the newest module at the top and
   the newest activity at the top of it, because the work being set up is
   almost always the most recent and scrolling past a semester to reach it
   was the whole complaint. Ascending is one click away.

   Unsorted is pinned LAST regardless of direction (Jonathan, 2026-10-20;
   it was pinned first) — it is the tray of cards not yet placed in the
   course, not a module with a number, so it sits below the modules rather
   than at whichever end the sort happens to put module 0. Display only:
   students' order and #numbers come from caBoardOrder, untouched. */
let boardSortKey='order';      // 'order' | 'date' | 'title' | 'done'
let boardSortDir='desc';       // 'desc' = newest/highest first
/* Everything that MOVES a card counts positions in the board's own
   ascending order (teacherBoardModuleIds), but the screen is descending by
   default — so "drop this above that one" and "▲" both mean the OPPOSITE
   position from the one the maths would reach for. These two are the single
   place that mismatch is resolved; every mover goes through them.

   boardCanReorder(): dragging to a position and ▲▼ only make sense while
   the list on screen IS the board order. Sorted by date or name, "above"
   names no position at all, so those affordances are withdrawn rather than
   left to do something arbitrary — a drop then just moves the card into
   the section, and the # box (which names a position outright) still works. */
function boardDescending(){ return boardSortDir==='desc'; }
function boardCanReorder(){ return boardSortKey==='order'; }
// The migration is a one-shot write, but renderTeacherActivities can paint
// several times before it lands (a view switch, a language change). One
// in-flight guard so it is attempted once per session, not once per paint.
let boardMigrating=false;

/* The board's read of config/class, in the shape app.js's caBoardOrder
   hands back. Deliberately the SAME function students read through
   (caBoardView in app.js), fed this file's config object instead of app.js's
   student-side globals — same split as caTitle/teacherActivityTitle, and the
   reason the console's #N can't drift from the one on a student's card. */
function teacherBoardView(cfg){
  const retired=Object.assign({}, (cfg&&cfg.archivedActivities)||{}, (cfg&&cfg.deletedActivities)||{});
  return caBoardOrder(window.CLASS_ACTIVITIES||[], (cfg&&cfg.activityBoard)||{}, {
    retired,
    legacyNumbers:(cfg&&cfg.activityNumbers)||{},
    seeded: !!(cfg&&cfg.activityBoardSeeded),
    songLibrary: (cfg&&cfg.songLibrary)||{},
    classSongs: (cfg&&cfg.classSongs)||{},
  });
}
/* Every id currently placed in one module, in board order, archived rows
   INCLUDED — the ordering primitive every writer below splices against. An
   archived card keeps its slot inside its module precisely so Restore puts
   it back where it was, so it has to be in this list even though it never
   renders in the live run of cards. */
function teacherBoardModuleIds(cfg, module, board){
  /* Ordered by caBoardOrder itself (app.js, loaded before this file — the
     same function teacherBoardView reads), so the tie-break the console
     splices against is the one students' #N comes from: pos, then the
     legacy number, then the id. A copy of its comparator here had already
     drifted (pos -> id). `retired: {}` keeps archived rows IN each module's
     ids, interleaved at their own slot, and `seeded: true` takes only the
     cards that have a board entry — exactly this list's contract.
     `board` overrides cfg.activityBoard (the board writers plan against a
     board that isn't the one on cfg). */
  const b=board||(cfg&&cfg.activityBoard)||{};
  const view=caBoardOrder(window.CLASS_ACTIVITIES||[], b, {
    retired:{},
    legacyNumbers:(cfg&&cfg.activityNumbers)||{},
    seeded:true,
    songLibrary:(cfg&&cfg.songLibrary)||{},
    classSongs:(cfg&&cfg.classSongs)||{},
  });
  const sec=view.sections.find(x=>x.module===Number(module));
  return sec ? sec.ids.slice() : [];
}
function teacherActivityIdNum(a){ const m=/^ca-(\d+)$/.exec(String(a&&a.id)); return m?Number(m[1]):Infinity; }
/* One line saying where a card sits, for the two detail pages. Reads the
   same board view students' #N comes from, so the detail page can't
   disagree with the board that linked to it. */
function teacherActivityPlace(id){
  const cfg=teacherClassConfig;
  const a=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===id);
  /* Songs-page songs and teacher-only cards are off the board whatever row
     they left behind (caBoardOrder), so ask about them first \u2014 the raw
     activityBoard row called every library song "not assigned, no student
     sees it". Neither one can gate, so their Clear buttons do nothing. */
  const noGate=' It is never on the board and never sends anyone to In-Class Activities, so the Clear buttons below change nothing.';
  if(a && caIsLibraryCard(a, cfg.songLibrary||{})){
    const off=teacherActivityDeleted(id,cfg)?'deleted':teacherActivityArchived(id,cfg)?'archived':(cfg.hiddenActivities||{})[id]===true?'Hidden':'';
    return (off
      ? `A Songs-page song, ${off} \u2014 no student sees it.`
      : 'A Songs-page song \u2014 every student can open it from the Songs page, under More Play Along songs.')+noGate;
  }
  if(a && caIsTeacherSong(a, cfg.classSongs||{}))
    return 'A Teacher view songs card \u2014 no student sees it until you use Move to Class activities.'+noGate;
  const view=teacherBoardView(cfg);
  if(!view.assigned[id]) return 'Built \u2014 not assigned to a unit yet, so no student sees it.';
  const sec=view.sections.find(s=>s.ids.includes(id)||s.retiredIds.includes(id));
  const mn=sec?sec.module:0;
  const manifest=(typeof MODULE_MANIFEST!=='undefined')?MODULE_MANIFEST:[];
  const mod=manifest.find(m=>m.num===mn);
  const where=mn===0?'Unsorted':(mod?`Unit ${mn} \u2014 ${mod.name}`:`Unit ${mn}`);
  if(teacherActivityDeleted(id,cfg)) return `${where} \u00b7 deleted \u2014 no number, and students don't see it.`;
  if(teacherActivityArchived(id,cfg)) return `${where} \u00b7 archived \u2014 no number, and students don't see it.`;
  const n=view.number[id];
  return n ? `${where} \u00b7 #${n}` : `${where} \u00b7 no number \u2014 exit checks never take a #N slot.`;
}

/* ── One-time migration: place what's already published ─────────────────
   Runs on the first board render where config/class has never held a board
   (activityBoardSeeded absent — NOT "activityBoard is empty", which is a
   board the teacher emptied on purpose; see activityBoardOn in app.js).

   What lands: every activity that already has a release date, in the order
   students are reading them RIGHT NOW — the shipped `number` with the
   console's old activityNumbers overrides applied. Seeding by date instead
   would have been simpler and wrong: those overrides ARE the teaching order
   Jonathan typed, and a date-ordered board would have shuffled it on the
   first load (Jonathan, 2026-09-16). Everything undated stays in Built.

   All of it goes into module 0, the Unsorted pen, to be dragged into real
   modules from the board — the one thing the old data genuinely cannot
   answer is which module an activity belongs to. */
async function teacherMigrateActivityBoard(cfg){
  if(boardMigrating || !cfg || cfg.activityBoardSeeded) return false;
  // Never seed off a config we didn't actually read — see
  // teacherClassConfigReadOk. This is the one write in the file that is
  // destructive when handed an empty object.
  if(!teacherClassConfigReadOk) return false;
  boardMigrating=true;
  const dates=cfg.activityDates||{};
  const ov=cfg.activityNumbers||{};
  const shipped=a=>{ const n=Number(a.number); return Number.isFinite(n)?n:Infinity; };
  const legacyN=a=>{ const o=ov[a.id]; return (o&&Number.isFinite(Number(o.n))&&Number(o.base)===shipped(a))?Number(o.n):shipped(a); };
  const board={};
  (window.CLASS_ACTIVITIES||[]).filter(a=>dates[a.id])
    .sort((x,y)=>(legacyN(x)-legacyN(y))||(shipped(x)-shipped(y))||(teacherActivityIdNum(x)-teacherActivityIdNum(y)))
    .forEach((a,i)=>{ board[a.id]={module:0, pos:i+1}; });
  // Same queue as Move/Unassign/Delete — this is a fourth board writer, and
  // nothing structurally rules out it racing one of the other three (found
  // in the 2026-09-27 review of that fix: the migration is only PRACTICALLY
  // safe because no board rows exist to click Move/Unassign/Delete on yet,
  // not because anything enforces it).
  const release=await waitBoardWriteTurn();
  try{
    // Strict (no base): this replaces the board wholesale, so any other
    // write since this tab's read is a reason to stop and look.
    await teacherWriteConfig({activityBoard:board, activityBoardSeeded:true});
  }catch(e){
    boardMigrating=false;
    teacherConfigSaveFailed(e, 'Could not set up the activity board — check your connection and Firestore rules.');
    return false;
  }finally{
    release();
  }
  cfg.activityBoard=board;
  cfg.activityBoardSeeded=true;
  console.log('[guitar-class] activity board created — placed '+Object.keys(board).length
    +' published activit'+(Object.keys(board).length===1?'y':'ies')+' in Unsorted: '
    +Object.keys(board).sort((x,y)=>board[x].pos-board[y].pos).join(', '));
  return true;
}

/* The per-card parts of the Class activities board — done counts, title
   line, publish controls and the Visible / Required / Play Along / Pin / Who
   / Move-to / Songs switches — built once per paint from one config. Shared
   by the board (renderTeacherActivities) and an activity's Settings tab
   (teacherActivitySettingsHtml), so the two draw the same controls with the
   same data-* attributes, and the same delegated listeners call the same
   writers. `activities` is the board's list (no Songs-page or teacher-only
   cards). */
function teacherActivityCtlKit(cfg, activities){
  const hidden=cfg.hiddenActivities||{};
  const optional=cfg.optionalActivities||{};
  const playAlong=cfg.playAlongActivities||{};
  const pins=teacherActivityPins(cfg);
  const dates=cfg.activityDates||{};
  const today=dayStr(new Date());
  const view=teacherBoardView(cfg);
  const nums=view.number;
  const byId={}; activities.forEach(a=>{ byId[a.id]=a; });
  const manifest=(typeof MODULE_MANIFEST!=='undefined')?MODULE_MANIFEST:[];

  /* ── Shared card parts ──────────────────────────────────────────── */
  // How many students have finished this one, and who hasn't — broken out
  // by period so the number can't be misread as the whole class when the
  // dashboard's period filter (t-period-filter) is narrowed to P4, P7,
  // CAS, or Unassigned. Deliberately reads the FULL roster (allStudentsRaw, minus
  // archived) rather than `allStudents`, which follows that filter — this
  // card is meant to answer "who's done" for the whole class regardless of
  // whatever the teacher is currently looking at elsewhere on the page.
  // Reads the SAME student docs the Students tab already fetched
  // (loadAllStudents) — no second Firestore read path for completion data.
  const doneSummaryRoster=(teacherShowArchived?allStudentsRaw:allStudentsRaw.filter(s=>!((cfg.archived||{})[s.uid])));
  const doneSummary=a=>{
    const isCheck=a.kind==='check';
    const forIt=doneSummaryRoster.filter(s=>teacherActivityForStudent(a,s.uid,cfg));
    const groups=[['4','P4'],['7','P7'],['CAS','CAS'],['','Unassigned']]
      .map(([val,label])=>({label, students:forIt.filter(s=>teacherStudentPeriod(s)===val)}))
      .filter(g=>g.students.length);
    const rows=groups.map(g=>{
      const notDone=g.students.filter(s=>isCheck
        ? !(s.exitChecks||{})[a.id]
        : (s.classActivities||{})[a.id]!==true);
      const doneCount=g.students.length-notDone.length;
      const listHtml=notDone.length
        ? notDone.map(s=>`<div style="padding:2px 0">${escHtml(s.name||'(no name)')}${s.email?` &middot; ${escHtml(s.email)}`:''}</div>`).join('')
        : `<div style="padding:2px 0">Everyone has ${isCheck?'turned this one in':'finished this one'}.</div>`;
      const results=isCheck?g.students.map(s=>(s.exitChecks||{})[a.id]).filter(Boolean):[];
      const itemTotal=isCheck?(((a.check||{}).items)||[]).length:0;
      const avg=results.length?(results.reduce((n,r)=>n+(Number(r.score)||0),0)/results.length).toFixed(1):null;
      const head=isCheck
        ? `${g.label}: ${doneCount} / ${g.students.length} turned in${avg!==null?` &middot; avg ${avg}/${itemTotal}`:' &middot; avg —'}`
        : `${g.label}: ${doneCount} / ${g.students.length} done`;
      const openKey=a.id+'|'+g.label;
      return `<div class="t-board-done-row"><strong>${head}</strong> &middot; <details data-board-done data-key="${escAttr(openKey)}"${boardDoneOpen[openKey]?' open':''}><summary>who hasn't ${isCheck?'turned it in':'finished'} (${notDone.length})</summary>${listHtml}</details></div>`;
    }).join('');
    return `<div class="t-board-done">${rows||'<div class="t-board-done-row">No student data yet.</div>'}</div>`;
  };
  // Title line: the rename editor when it's open on this card, otherwise
  // the name + pencil + id + Copy link. The whole line is the link into
  // the detail page, so the buttons inside it are matched FIRST by the
  // delegated click listener (see showTeacherApp).
  const titleBlock=a=>{
    const shown=teacherActivityTitle(a,cfg);
    const renamed=teacherActivityRenamed(a,cfg);
    if(activityEditId===a.id){
      return `<div class="t-board-title">`
        +`<span class="t-act-title-lbl">rename (English)</span>`
        +`<input type="text" class="t-act-title-edit" data-id="${escAttr(a.id)}" value="${escAttr(shown)}" maxlength="120" spellcheck="false" aria-label="Rename ${escAttr(shown)} (English)">`
        +`<span class="t-act-title-hint">Students see this right away, in English in both languages, until the Spanish twin ships in the next update.</span>`
        +`<div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap">`
        +`<button class="tg-seg-btn on" data-rename-save data-id="${escAttr(a.id)}">Save</button>`
        +`<button class="tg-seg-btn" data-rename-cancel>Cancel</button>`
        +(renamed?`<button class="tg-seg-btn" data-rename-reset data-id="${escAttr(a.id)}">Undo rename</button>`:'')
        +`</div></div>`;
    }
    const prefix=a.kind==='check'?'Exit check · ':'';
    return `<div class="t-board-title" data-open-activity data-id="${escAttr(a.id)}" title="${escAttr(prefix+shown)}">`
      +`${escHtml(prefix)}<span class="t-board-name">${escHtml(shown)}</span> `
      +`<span class="t-board-id">(${escHtml(a.id)})</span> `
      +`<button class="t-act-pencil" data-rename-activity data-id="${escAttr(a.id)}" title="Rename this activity" aria-label="Rename ${escAttr(shown)}">&#x270E;</button>`
      +`<button class="tg-seg-btn t-act-link" data-copy-activity-link data-id="${escAttr(a.id)}" title="Copy the student link straight to this ${a.kind==='check'?'exit check':'activity'}" aria-label="Copy the student link to ${escAttr(shown)}">Copy link</button>`
      +(renamed?`<span class="t-act-title-hint">Renamed — students see this in both languages until the Spanish twin ships. Was: ${escHtml(a.title)}</span>`:'')
      +`</div>`;
  };
  /* Publish controls, driven entirely by activityDates[id] — there is no
     separate published flag. Three states, and the button that leaves each
     one: undated (Publish now writes today, or schedule a day), scheduled
     (change the day, or Unpublish), live (Unpublish). All three go through
     the existing teacherSetActivityDate writer; '' clears. */
  const publishBlock=a=>{
    const dateVal=dates[a.id]||'';
    const isHidden=hidden[a.id]===true;
    // max: the calendar greys out the years teacherCommitActivityDate refuses.
    const dateInput=`<input type="date" class="t-date-input" data-set-activity-date data-id="${escAttr(a.id)}" value="${escAttr(dateVal)}" max="${new Date().getFullYear()+1}-12-31" aria-label="Release date for ${escAttr(teacherActivityTitle(a,cfg))}">`;
    const pubNow=`<button class="tg-seg-btn" data-publish-activity data-id="${escAttr(a.id)}" data-state="now" title="Publish today — students see it as soon as they reload">Publish now</button>`;
    const unpub=`<button class="tg-seg-btn" data-publish-activity data-id="${escAttr(a.id)}" data-state="off" title="Clear the release date — students stop seeing it">Unpublish</button>`;
    let status, controls;
    if(!dateVal){ status=`<span class="t-board-status">Not published</span>`; controls=pubNow+` <span class="t-board-sched">or schedule ${dateInput}</span>`; }
    else if(dateVal>today){ status=`<span class="t-board-status t-board-sched-on">Scheduled ${escHtml(dateVal)}</span>`; controls=dateInput+' '+unpub; }
    /* A live card's date is editable too (Jonathan, 2026-09-16). It used
       to render read-only, which meant moving something already out to
       students to a different day took Unpublish → re-date — two writes,
       and a window where the card vanished from In-Class Activities in
       between. Typing
       a new day straight into the box is one write either way: a past
       date just re-dates it, a future one pulls it back to Scheduled. */
    else { status=`<span class="t-board-status ${isHidden?'t-board-hidden-on':'t-board-live'}">${isHidden?'Hidden':'Live'}</span>`; controls=dateInput+' '+unpub; }
    return `<div class="t-board-publish">${status}<span class="t-board-pubctl">${controls}</span></div>`;
  };
  const visSeg=a=>{
    const isHidden=hidden[a.id]===true;
    return `<div class="tg-seg">`
      +`<button class="tg-seg-btn ${!isHidden?'on':''}" data-set-activity-hidden data-id="${escAttr(a.id)}" data-state="show">Visible</button>`
      +`<button class="tg-seg-btn ${isHidden?'on':''}" data-set-activity-hidden data-id="${escAttr(a.id)}" data-state="hide">Hidden</button></div>`;
  };
  // Required: until it's done or cleared, In-Class Activities opens first
  // at sign-in (the activity gate's lock is off — CA_GATE_LOCKS in app.js);
  // Optional still shows, tagged "Optional", but never does. Independent
  // of Visible/Hidden — see teacherSetActivityOptional.
  const optSeg=a=>{
    const isOpt=teacherActivityOptional(a.id,cfg);
    return `<div class="tg-seg">`
      +`<button class="tg-seg-btn ${!isOpt?'on':''}" data-set-activity-optional data-id="${escAttr(a.id)}" data-state="required" title="Until students finish this (or you clear it for them), In-Class Activities opens first when they sign in. Nothing else is locked.">Required</button>`
      +`<button class="tg-seg-btn ${isOpt?'on':''}" data-set-activity-optional data-id="${escAttr(a.id)}" data-state="optional" title="Students see it, tagged Optional, but it never opens first when they sign in">Optional</button></div>`;
  };
  // Practice cards only (view:'card'): when the Songs page's Play Along
  // list shows this card. "By date" is the rule every card follows — listed
  // once its release date arrives. "Now" lists it there today, dated or
  // not, and changes nothing else: it stays off In-Class Activities and
  // never blocks. See teacherSetActivityPlayAlong.
  const playSeg=a=>{
    if(a.view!=='card') return '';
    const isOn=playAlong[a.id]===true;
    return `<div class="tg-seg">`
      +`<button class="tg-seg-btn ${!isOn?'on':''}" data-set-activity-playalong data-id="${escAttr(a.id)}" data-state="date" title="Songs page lists this card under Play Along once its release date arrives">Play Along by date</button>`
      +`<button class="tg-seg-btn ${isOn?'on':''}" data-set-activity-playalong data-id="${escAttr(a.id)}" data-state="now" title="Songs page lists this card under Play Along now, with or without a release date. It stays off In-Class Activities and never blocks.">Play Along now</button></div>`;
  };
  // The Keep practicing row (config/class.activityPins): a pinned card is
  // one click away for students at the top of In-Class Activities, with
  // or without a release date. Exit checks are never pinnable. See
  // teacherSetActivityPin.
  const pinBtn=a=>{
    if(a.kind==='check') return '';
    const at=pins.indexOf(a.id);
    return `<div class="tg-seg">`
      +`<button class="tg-seg-btn ${at<0?'on':''}" data-set-activity-pin data-id="${escAttr(a.id)}" data-state="off" title="Not on the Keep practicing row at the top of students' In-Class Activities page">Not pinned</button>`
      +`<button class="tg-seg-btn ${at>=0?'on':''}" data-set-activity-pin data-id="${escAttr(a.id)}" data-state="on" title="On the Keep practicing row at the top of students' In-Class Activities page — no release date needed. It never blocks and never counts as one of today's activities. ${TEACHER_PINS_MAX} at most.">${at>=0?`Pinned ${at+1} of ${TEACHER_PINS_MAX}`:'Pin'}</button></div>`;
  };
  /* Who: the whole class (the default), or only the students ticked here
     — config/class.activityStudents, id -> { uid -> true }. Students
     nobody ticked never see the card, aren't sent to it at sign-in, and
     aren't counted in its done list. See teacherSetActivityStudent. */
  const whoPicker=a=>{
    const n=Object.keys(teacherActivityStudents(a.id,cfg)).length;
    const sum=n?`Only ${n} student${n===1?'':'s'}`:'Whole class';
    return `<details class="t-who${n?' t-who-on':''}" data-board-who data-id="${escAttr(a.id)}"${boardWhoOpen[a.id]?' open':''}>`
      +`<summary title="Who this activity is for">Who: ${sum}</summary>`
      +`<div class="t-who-body"><div class="t-who-note">Tick students to give this activity to them only. Nobody ticked = the whole class.</div>`
      +(n?`<div class="tg-seg"><button class="tg-seg-btn" data-activity-whole-class data-id="${escAttr(a.id)}">Back to whole class</button></div>`:'')
      +`<div data-who-boxes>${boardWhoOpen[a.id]?teacherWhoBoxesHtml(a,cfg):''}</div></div></details>`;
  };
  // A movable song (caIsSongCard) can go to the Songs page instead — see
  // teacherSetSongPlace. Its board slot is kept for the trip back.
  const songBtn=a=>caIsSongCard(a)
    ? `<button class="tg-seg-btn" data-set-song-place data-id="${escAttr(a.id)}" data-state="songs" title="Take this off the board and put it on every student's Songs page, under More Play Along songs">Move to Songs</button>`
    // A teacher-only card moved here goes back the same way — see
    // teacherSetClassSong. Its board slot is kept for the next trip.
    : a.teacherOnly===true
    ? `<button class="tg-seg-btn" data-tvs-share data-id="${escAttr(a.id)}" data-state="teacher" title="Take this off the board and students' In-Class Activities, back to the Teacher view songs tab only">Move to Teacher view songs</button>`
    : '';
  // Where a card can be sent without a drag. Used as "Assign to" in Built
  // and "Move to" in Assigned; both append at the end of the section they
  // name, which is what a drag onto empty space does too.
  const moveSelect=(a,label,curModule)=>{
    const opts=[`<option value="">${escHtml(label)}</option>`,`<option value="0"${curModule===0?' disabled':''}>Unsorted</option>`]
      .concat(manifest.map(m=>`<option value="${m.num}"${curModule===m.num?' disabled':''}>Unit ${m.num} — ${escHtml(m.name)}</option>`));
    return `<select class="t-board-move" data-move-activity data-id="${escAttr(a.id)}" aria-label="${escAttr(label+' '+teacherActivityTitle(a,cfg))}">${opts.join('')}</select>`;
  };

  return {hidden, optional, playAlong, pins, dates, today, view, nums, byId, manifest, doneSummaryRoster, doneSummary,
    titleBlock, publishBlock, visSeg, optSeg, playSeg, pinBtn, whoPicker, songBtn, moveSelect};
}
/* ── Class activities: the board ────────────────────────────────────────
   Two columns. LEFT, "Built": every activity that has been pushed to the
   site but not yet placed in the course — newest first, because the one
   just pushed is the one being placed. RIGHT, "Assigned": the cards that
   ARE placed, grouped by module and ordered inside each module, which is
   exactly the order (and the #N numbering) students read.

   Dragging a Built card into a module assigns it; dragging one back to
   Built un-assigns it. Every keyboard/touch path to the same move exists
   beside the drag — the "Assign to"/"Move to" selects, the ▲▼ buttons, and
   the # box — because a drag is the only affordance here that a Chromebook
   trackpad, a phone and a screen reader all handle differently.

   PUBLISHING is still the release date, unchanged: config/class.activityDates
   and app.js's caIsVisible(). Assigned is a second, independent condition,
   not a replacement — a card goes live for students when it is assigned AND
   its date has arrived AND it isn't hidden AND it isn't archived/deleted.

   opts.cached: repaint from the config already in memory instead of going
   back to Firestore. Only for repaints that changed NOTHING in Firestore —
   folding a section, opening or cancelling the rename box, a rejected #
   entry. Every repaint that FOLLOWS A WRITE stays fresh, deliberately: the
   failure paths below roll their optimistic change back in memory and then
   repaint to show what Firestore actually holds, and painting before the
   read would pull the pre-write copy back over the new state. Fresh is the
   DEFAULT, so a call site misjudged costs one extra read rather than
   showing the teacher stale data. Two more cached callers: the three board
   writers paint their optimistic board BEFORE their write (the fresh repaint
   after it still follows), and the student-progress auto-refresh repaints
   new done counts over the config already in hand (teacherRefreshStudents). */
function renderTeacherActivities(opts){
  // The list + detail split and the detail alone have their own painter;
  // what follows is the board ("Arrange board"), unchanged.
  const screen=teacherActivityScreen();
  if(screen!=='board'){ teacherRenderActivityScreen(screen, opts); return; }
  const cached = !!(opts && opts.cached) && teacherClassConfigLoaded;
  const box=document.getElementById('t-grid-container');
  const allActivities=window.CLASS_ACTIVITIES||[];
  if(!allActivities.length){
    box.innerHTML='<div class="t-loading">No activities yet — they\'ll appear here once one is pushed to the site.</div>';
    return;
  }
  // No early return on an empty roster: only the done counts need students,
  // and each card already says "No student data yet." (doneSummary). The
  // first day of a school year, before anyone signs in, is exactly when the
  // first activity has to be placed, dated and published.
  // A re-render over a board that's already on screen (every toggle on it —
  // Optional, Hidden, a date, Archive — ends in one) keeps the old board up
  // while the config re-reads, and lands back at the same scroll position.
  // Swapping in the one-line "Loading…" box first collapsed the page, so the
  // browser clamped the scroll to the top on every click.
  const keepY = box.querySelector('.t-board') ? window.scrollY : null;
  // The way back is on screen while the board loads (or fails to).
  const backBar=`<div class="ta-board-bar"><button type="button" class="stu-back" data-ta-board-back>&#x2190; Back to list</button></div>`;
  if(!cached && keepY===null) box.innerHTML=backBar+'<div class="t-loading">Loading…</div>';
  (cached ? Promise.resolve(teacherClassConfig) : teacherReadConfigAndRoster()).then(async cfg=>{
    if(teacherView!=='activities') return;   // switched views mid-flight
    if(!cfg) return;                         // superseded by a newer toggle
    // Back to the list (or an activity opened) mid-flight: this read would
    // paint the board over it.
    if(!activityBoardMode) return;
    // First ever board render: place what's already published, then paint.
    if(!cfg.activityBoardSeeded && !boardMigrating){
      if(!teacherClassConfigReadOk){
        box.innerHTML=backBar+'<div class="t-loading">Could not read the class settings, so the activity board hasn\'t been set up yet — check your connection and reload.</div>';
        return;
      }
      const done=await teacherMigrateActivityBoard(cfg);
      if(teacherView!=='activities' || !activityBoardMode) return;
      if(!done && !cfg.activityBoardSeeded){
        box.innerHTML=backBar+'<div class="t-loading">Could not set up the activity board — reload to try again.</div>';
        return;
      }
    }
    // Library songs aren't class activities — the Songs view manages them.
    // Read against this config: a song can be moved either way (songBtn).
    // Teacher-only cards neither — the Teacher view songs tab has them,
    // until its Move to Class activities brings one here.
    const activities=allActivities.filter(a=>!caIsLibraryCard(a, cfg.songLibrary||{}) && !caIsTeacherSong(a, cfg.classSongs||{}));
    const {hidden, optional, pins, dates, view, nums, byId, manifest, doneSummaryRoster, doneSummary,
      titleBlock, publishBlock, visSeg, optSeg, playSeg, pinBtn, whoPicker, songBtn, moveSelect}=teacherActivityCtlKit(cfg, activities);

    /* ── Left column: Built ─────────────────────────────────────────── */
    // Newest id first by default (boardSortDir 'desc'), like everything else
    // on the board — the card just pushed is the one being placed.
    const dirMul = boardSortDir==='desc' ? -1 : 1;
    const builtAll=activities.filter(a=>!view.assigned[a.id])
      .sort((x,y)=>dirMul*(teacherActivityIdNum(x)-teacherActivityIdNum(y)));
    const builtCard=a=>{
      const isRetired=teacherActivityRetired(a.id,cfg);
      const strays=[];
      if(dates[a.id]) strays.push(`release date ${escHtml(dates[a.id])}`);
      if(hidden[a.id]===true) strays.push('Hidden');
      if(optional[a.id]===true) strays.push('Optional');
      if(optional[a.id]===false) strays.push('Required');
      if(pins.includes(a.id)) strays.push('Pinned');
      return `<div class="t-board-card${isRetired?' t-board-retired':''}"${isRetired?'':' draggable="true"'} data-board-card data-id="${escAttr(a.id)}">`
        +`<div class="t-board-row">${isRetired?'':'<span class="t-board-grip" aria-hidden="true">&#x2630;</span>'}${titleBlock(a)}</div>`
        // A leftover date or Hidden flag on an unplaced card decides nothing
        // on its own (unassigned already means invisible), so it's stated,
        // not offered — the controls for it appear once the card is placed.
        +(strays.length?`<div class="t-board-stray">Carries: ${strays.join(' &middot; ')} — no effect until it's assigned.</div>`:'')
        /* A retired card in Built is offered Restore, NOT "Assign to…": it is
           out of the course, and placing it somewhere while it's still
           archived would put it straight into that module's Archived list —
           a move with no visible effect. Restore first, then place it. This
           is also the ONLY route back for something archived while it was
           unassigned, which is where every archived-and-never-placed
           activity lives. */
        +(isRetired
          ? `<div class="t-board-stray">${teacherActivityDeleted(a.id,cfg)?'Deleted':'Archived'} — out of the course. Restore it to place it again.</div>`
            +`<div class="t-board-ctl">`
            +`<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="restore" title="${escAttr(teacherActivityDeleted(a.id,cfg)?'Put this activity back — it returns blank, ready to place and publish':'Put this activity back, with its date and name')}">Restore</button>`
            +(teacherActivityDeleted(a.id,cfg)?'':`<button class="tg-seg-btn t-act-danger" data-delete-activity data-id="${escAttr(a.id)}" title="Clear this activity's date, name and gate clears too">Delete</button>`)
            +`<button class="tg-seg-btn" data-open-activity data-id="${escAttr(a.id)}">Preview</button></div>`
          : `<div class="t-board-ctl">${moveSelect(a,'Assign to…',null)}`
            +`<button class="tg-seg-btn" data-open-activity data-id="${escAttr(a.id)}">Preview</button>`
            +songBtn(a)
            +`<span class="t-board-ctl-sp">`
            +`<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="archive" title="Retire this activity without ever placing it">Archive</button>`
            +`<button class="tg-seg-btn t-act-danger" data-delete-activity data-id="${escAttr(a.id)}" title="Retire it AND clear its date, name and gate clears">Delete</button>`
            +`</span></div>`)
        +`</div>`;
    };
    const builtLive=builtAll.filter(a=>!teacherActivityRetired(a.id,cfg));
    const builtRetired=builtAll.filter(a=>teacherActivityRetired(a.id,cfg));
    const builtHtml=`<section class="t-board-built" data-board-built>`
      +`<div class="t-board-head" role="heading" aria-level="3">Built (${builtLive.length})</div>`
      +`<div class="t-board-hint">Pushed to the site, not placed in the course yet. Students see none of these.</div>`
      +(builtLive.length?builtLive.map(builtCard).join(''):`<div class="t-board-empty">Everything built has been placed.</div>`)
      +(builtRetired.length
        ? `<details class="t-board-arch" ${boardArchOpen.built?'open':''} data-board-arch data-module="built"><summary>Archived / deleted (${builtRetired.length})</summary>${builtRetired.map(builtCard).join('')}</details>`
        : '')
      +`</section>`;

    /* ── Right column: Assigned ─────────────────────────────────────── */
    const assignedCard=a=>{
      const isRetired=teacherActivityRetired(a.id,cfg);
      const isCheck=a.kind==='check';
      const n=nums[a.id];
      // Checks never take a #N slot, and a retired card has dropped out of
      // the run (Jonathan, 2026-09-16) — neither gets a box to type in.
      const numBox=(isCheck||isRetired||!n)
        ? `<span class="t-board-nonum">${isCheck?'Check':'—'}</span>`
        : `<span class="t-board-hash">#<input type="number" class="t-board-num" data-board-number data-id="${escAttr(a.id)}" value="${n}" min="1" step="1" title="Position in the course — type a new one to move this activity" aria-label="Position for ${escAttr(teacherActivityTitle(a,cfg))}"></span>`;
      const curModule=Number(((cfg.activityBoard||{})[a.id]||{}).module)||0;
      const retireBtns=teacherActivityDeleted(a.id,cfg)
        ? `<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="restore" title="Put this activity back — it returns undated, so set a date to publish it again">Restore</button>`
        : (teacherActivityArchived(a.id,cfg)
          ? `<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="restore" title="Put this activity back in this unit, where it was, with its date and name">Restore</button>`
            +`<button class="tg-seg-btn t-act-danger" data-delete-activity data-id="${escAttr(a.id)}" title="Clear this activity's date, name and gate clears, and take it off the board">Delete</button>`
          : `<button class="tg-seg-btn" data-set-activity-archived data-id="${escAttr(a.id)}" data-state="archive" title="Take this off students' In-Class Activities page but keep its place, date and name">Archive</button>`);
      const moveBtns=(isRetired || !boardCanReorder()) ? '' :
        `<button class="tg-seg-btn" data-board-bump data-id="${escAttr(a.id)}" data-dir="up" title="Move up within this unit" aria-label="Move up">&#x25B2;</button>`
        +`<button class="tg-seg-btn" data-board-bump data-id="${escAttr(a.id)}" data-dir="down" title="Move down within this unit" aria-label="Move down">&#x25BC;</button>`;
      // Not draggable once retired: every other move control is hidden on
      // these, and a stray drag would rewrite the very slot Restore uses to
      // put the card back where it was.
      return `<div class="t-board-card${isRetired?' t-board-retired':''}${hidden[a.id]===true?' t-board-dim':''}"${isRetired?'':' draggable="true"'} data-board-card data-id="${escAttr(a.id)}">`
        +`<div class="t-board-row">${isRetired?'':'<span class="t-board-grip" aria-hidden="true">&#x2630;</span>'}${numBox}${titleBlock(a)}</div>`
        +(isRetired
          ? `<div class="t-board-stray">${teacherActivityDeleted(a.id,cfg)?'Deleted':'Archived'} — students don't see it and it holds no number. Restore puts it back here.</div>`
          : publishBlock(a)+`<div class="t-board-ctl">${visSeg(a)}${optSeg(a)}${playSeg(a)}${pinBtn(a)}${whoPicker(a)}${moveSelect(a,'Move to…',curModule)}${moveBtns}${songBtn(a)}</div>`)
        /* Footer: what this card IS (how many have done it) and the actions
           that take it out of the run, behind a hairline — so the row above,
           which is what gets used every day, reads as the card's controls
           and these read as the ones you reach for rarely. */
        +`<div class="t-board-ctl t-board-foot">${doneSummary(a)}`
        +`<span class="t-board-ctl-sp"><button class="tg-seg-btn" data-open-activity data-id="${escAttr(a.id)}">Preview</button>`
        +`<button class="tg-seg-btn" data-copy-activity-link data-id="${escAttr(a.id)}">Copy link</button>`
        +(isRetired?'':`<button class="tg-seg-btn" data-unassign-activity data-id="${escAttr(a.id)}" title="Send this back to Built — it keeps its date and name">Un-assign</button>`)
        +retireBtns+`</span></div>`
        +`</div>`;
    };
    /* Card order INSIDE a section. 'order' is the board's own order, which
       is the one students read; the other keys are a way of looking through
       the list and never leave this screen. Nothing here writes, and `#N` on
       each card stays its real position whichever way the list is pointed. */
    const sortIds=ids=>{
      const arr=ids.slice();
      if(boardSortKey==='order') return dirMul<0 ? arr.reverse() : arr;
      // The students each card's own counts read (doneSummary): the whole
      // roster minus archived, and only those the card is for — not the
      // period-filtered allStudents, or the order disagrees with the numbers.
      const doneMemo={};
      const doneOf=id=>{
        const a=byId[id]; if(!a) return 0;
        if(doneMemo[id]!==undefined) return doneMemo[id];
        const forIt=doneSummaryRoster.filter(s=>teacherActivityForStudent(a,s.uid,cfg));
        return (doneMemo[id]=a.kind==='check'
          ? forIt.filter(s=>(s.exitChecks||{})[id]).length
          : forIt.filter(s=>(s.classActivities||{})[id]===true).length);
      };
      const cmp=(x,y)=>{
        if(boardSortKey==='date'){
          const dx=dates[x]||'', dy=dates[y]||'';
          // An undated card isn't "earlier" or "later" than a dated one, so
          // it sinks to the bottom whichever way the arrow points — same
          // rule the old Class activities table used.
          if(dx && !dy) return -1;
          if(!dx && dy) return 1;
          return dirMul*dx.localeCompare(dy);
        }
        if(boardSortKey==='title')
          return dirMul*String(teacherActivityTitle(byId[x]||{},cfg)).localeCompare(String(teacherActivityTitle(byId[y]||{},cfg)));
        return dirMul*(doneOf(x)-doneOf(y));
      };
      return arr.sort((x,y)=>cmp(x,y) || (teacherActivityIdNum(byId[x]||{})-teacherActivityIdNum(byId[y]||{})));
    };
    /* One block per section that HOLDS something. An empty module used to
       render as a drop target, which meant scrolling past eleven "Drop an
       activity here" boxes to reach the one module in use (Jonathan,
       2026-09-16); "Assign to…" / "Move to…" still list every module, so
       nothing became unreachable. A module appears the moment it has a card. */
    const sectionsById={}; view.sections.forEach(sec=>{ sectionsById[sec.module]=sec; });
    const holds=mn=>{ const s=sectionsById[mn]; return !!(s && (s.ids.length || s.retiredIds.length)); };
    const sectionHtml=mn=>{
      const sec=sectionsById[mn]||{module:mn, ids:[], retiredIds:[]};
      const mod=manifest.find(m=>m.num===mn);
      const label=mn===0?'Unsorted':`Unit ${mn} — ${escHtml(mod?mod.name:'(unknown unit)')}`;
      const closed=boardSectionClosed[mn]===true;
      const cards=sortIds(sec.ids).map(id=>byId[id]).filter(Boolean).map(assignedCard).join('');
      const arch=sortIds(sec.retiredIds).map(id=>byId[id]).filter(Boolean);
      // Hide / Show the whole group in one write (teacherSetModuleHidden).
      // "Show all" only once every live card in it is already Hidden.
      const allHidden=sec.ids.length>0 && sec.ids.every(id=>hidden[id]===true);
      const groupBtn=sec.ids.length
        ? `<button class="tg-seg-btn t-board-grouphide" data-set-module-hidden data-module="${mn}" data-state="${allHidden?'show':'hide'}" title="${allHidden?'Set every card in this group to Visible':'Set every card in this group to Hidden — any one can still be set back to Visible on its own'}">${allHidden?'Show all':'Hide all'}</button>`
        : '';
      return `<div class="t-board-section${closed?' t-board-closed':''}" data-board-section data-module="${mn}">`
        +`<div class="t-board-sechead" data-board-fold data-module="${mn}">`
        +`<span class="t-board-caret" aria-hidden="true"></span><span role="heading" aria-level="4">${label}</span>`
        +`<span class="t-board-count">${sec.ids.length}</span>${groupBtn}</div>`
        +`<div class="t-board-secbody">`
        +(cards||`<div class="t-board-empty">Drop an activity here, or use “Assign to…”.</div>`)
        +(arch.length?`<details class="t-board-arch" ${boardArchOpen[mn]?'open':''} data-board-arch data-module="${mn}"><summary>Archived (${arch.length})</summary>${arch.map(assignedCard).join('')}</details>`:'')
        +`</div></div>`;
    };
    // The modules that hold something, highest number first by default,
    // then Unsorted pinned last (see boardSortKey).
    const moduleNums=manifest.map(m=>m.num)
      .concat(Object.keys(sectionsById).map(Number).filter(mn=>mn!==0 && !manifest.some(m=>m.num===mn)))
      .filter(holds).sort((x,y)=>dirMul*(x-y));
    const sectionOrder=moduleNums.concat(holds(0)?[0]:[]);
    const assignedCount=view.sections.reduce((n,sec)=>n+sec.ids.length,0);
    const hiddenModules=manifest.length-moduleNums.filter(mn=>manifest.some(m=>m.num===mn)).length;
    const SORT_LABELS={order:'Course order', date:'Release date', title:'Name', done:'How many done'};
    const sortBar=`<div class="t-board-sortbar">`
      +`<label class="t-board-sortlbl" for="t-board-sort">Sort</label>`
      +`<select class="t-board-move" id="t-board-sort" data-board-sort aria-label="Sort the board (your view only)">`
      +Object.keys(SORT_LABELS).map(k=>`<option value="${k}"${boardSortKey===k?' selected':''}>${escHtml(SORT_LABELS[k])}</option>`).join('')
      +`</select>`
      +`<button class="tg-seg-btn" data-board-flip title="${escAttr(boardSortDir==='desc'?'Highest first — click for lowest first':'Lowest first — click for highest first')}" aria-label="Reverse the order">${boardSortDir==='desc'?'\u2193 Highest first':'\u2191 Lowest first'}</button>`
      +`<span class="t-board-sortnote">Your view only — students always read the course order.${boardCanReorder()?'':' Switch back to Course order to drag cards into position.'}</span>`
      +`</div>`;
    const assignedHtml=`<section class="t-board-assigned">`
      +`<div class="t-board-head" role="heading" aria-level="3">Assigned to students (${assignedCount})</div>`
      +`<div class="t-board-hint">This is the order students read them in, and where the #numbers come from.`
      +(hiddenModules>0?` ${hiddenModules} empty unit${hiddenModules===1?'' :'s'} not shown — use “Assign to…” on a card to put something in one.`:'')
      +`</div>`
      +sortBar
      +sectionOrder.map(sectionHtml).join('')
      +`</section>`;

    /* What students' Keep practicing row holds right now, in pin order —
       the console's preview of it, and the one place to unpin a card that
       has no controls of its own any more (archived, or sent back to Built).
       A pin that students can't see says why. */
    const pinsHtml=(()=>{
      const why=id=>{
        const a=byId[id];
        if(!a){
          // Not on this board, but still in the code: Move to Songs and Move
          // to Teacher view songs keep the pin.
          const raw=allActivities.find(x=>x.id===id);
          if(raw && caIsLibraryCard(raw, cfg.songLibrary||{})) return 'moved to Songs';
          if(raw && caIsTeacherSong(raw, cfg.classSongs||{})) return 'Teacher view songs only';
          return 'not on the site';
        }
        if(teacherActivityRetired(id,cfg)) return teacherActivityDeleted(id,cfg)?'deleted':'archived';
        if(!view.assigned[id]) return 'not assigned';
        if(hidden[id]===true) return 'Hidden';
        return '';
      };
      const chips=pins.map((id,i)=>{
        const a=byId[id]||allActivities.find(x=>x.id===id), off=why(id);
        return `<span class="t-pin-chip${off?' t-pin-off':''}">${i+1}. ${escHtml(a?teacherActivityTitle(a,cfg):id)}${off?` <em>(${escHtml(off)} — students don't see it)</em>`:''}`
          +` <button class="tg-seg-btn" data-set-activity-pin data-id="${escAttr(id)}" data-state="off" aria-label="Unpin ${escAttr(a?teacherActivityTitle(a,cfg):id)}">Unpin</button></span>`;
      }).join('');
      return `<div class="tg-note t-pins-note"><strong>Keep practicing row (${pins.length} of ${TEACHER_PINS_MAX}):</strong> `
        +(pins.length?chips:`empty — students see no row. Use <strong>Pin</strong> on an assigned card to add one.`)
        +`</div>`;
    })();

    /* The Built column is its own scroller (sticky, max-height, overflow-y in
       styles.css), so keepY alone doesn't hold its place: every repaint —
       the once-a-minute refresh included — would throw it back to the top
       while the teacher is scrolling it for a card. Read it here, at the
       moment of the swap, not before the config read above. Assigned grows
       with the page, so the window's keepY already covers it. */
    const oldBuilt=box.querySelector('[data-board-built]');
    const builtTop=oldBuilt ? oldBuilt.scrollTop : 0;
    // The window's place is read here too: an older repaint handed a newer
    // read's config (loadTeacherClassConfig) paints just after that one, and
    // the keepY it took when it started can be a scroll the teacher has left.
    const paintY=oldBuilt ? window.scrollY : keepY;
    box.innerHTML=`<div class="ta-board-bar"><button type="button" class="stu-back" data-ta-board-back>&#x2190; Back to list</button>`
      +`<span class="ta-board-bar-note">Arrange board: drag cards into units, renumber, assign and archive. The list is where you check and set up one activity.</span></div>`
      +`<div class="tg-note">Drag a built activity into a unit to assign it. It goes live for students on its release date.</div>`
      +pinsHtml
      +`<details class="tg-help" data-board-help${boardHelpOpen?' open':''}><summary>How this page works</summary>`
      +`<div class="tg-note">A card shows to students only when all four are true: it is <strong>assigned</strong> to a unit here, its <strong>release date</strong> has arrived, it is not <strong>Hidden</strong>, and it is not <strong>Archived</strong>. Publish now dates it today; scheduling a later day holds it until then; Unpublish clears the date. A card's date stays editable once it's live, so you can move it to another day without unpublishing first — type a future day and it goes back to Scheduled. Use Hidden to pull back something already live, then un-hide any time — the date and the Hidden switch are independent, either one hides. <strong>Hide all</strong> on a unit's heading sets every card in it to Hidden at once (<strong>Show all</strong> undoes it); after that, any one card can still be set back to Visible on its own.<br><br>`
      +`<strong>Required / Optional</strong> decides whether a live card sends students to In-Class Activities when they sign in. Neither one locks any part of the site. Until a student finishes a Required card (the default) or you clear it for them, In-Class Activities opens first when they sign in, Today's activity shows it ahead of Optional cards, and the console marks them Pending. An Optional card still shows, tagged “Optional”, and students can still do it and mark it done, but it never opens first and never counts as Pending. Switch it either way at any time.<br><br>`
      +`<strong>Archive</strong> takes a card off students' In-Class Activities page for good but keeps its place in its unit, its date and its name, so Restore puts it back exactly where it was (unpinned, if it was pinned). Archived cards hold no #number, so the ones after them count down by one. <strong>Delete</strong> also clears the date, rename and per-student gate clears, and takes the card off the board entirely — it comes back in Built, blank, to be placed and published from scratch. Neither one removes the activity from the site's code (only an update does) and neither touches what students have already finished, so the Done counts survive both.<br><br>`
      +`<strong>Pin</strong> puts an assigned card on the <strong>Keep practicing</strong> row at the top of students' In-Class Activities page, up to ${TEACHER_PINS_MAX} cards, in the order you pinned them — for a card you reuse on many days, so you don't have to re-date it. A pin needs no release date. It never blocks the site and never counts as one of today's activities, and a pinned card stays on the row on the days it is also one of today's activities. Hidden, Archive and Delete still win (Archive and Delete also unpin, and Restore does not pin it again). Students' Done marks are untouched.<br><br>`
      +`<strong>Un-assign</strong> sends a card back to Built without clearing anything. The &#x270E; renames an activity for everyone, in both languages, until the Spanish twin ships. Copy link gives you a URL that opens the site straight to that one activity, card already open — paste it into Classroom. Type over a <strong>#number</strong> to move a card to that position; a number inside a title, like Finger Gym 2, is part of the name and stays put.</div></details>`
      +`<div class="t-board">${builtHtml}${assignedHtml}</div>`;
    // A move, an assign or an archive changes the tree's counts.
    teacherPaintSideTree();
    // Before the rename box's focus() below, so focus can still scroll it into view.
    if(builtTop){ const nb=box.querySelector('[data-board-built]'); if(nb) nb.scrollTop=builtTop; }
    // Opening the editor is a full re-render, so focus has to be re-placed
    // afterwards or the pencil click would leave you looking at a box you
    // still have to click into. select() so typing replaces the old name.
    if(activityEditId){
      const inp=box.querySelector('.t-act-title-edit');
      if(inp){ inp.focus(); inp.select(); }
    }
    // Back from a detail page: land where the card was. Done here, not in
    // backToActivitiesList, because the board paints from this promise —
    // scrolling before it resolves would only hit the one-line "Loading…"
    // box, which has nowhere to scroll to.
    if(restoreActivityScroll){ restoreActivityScroll=false; window.scrollTo({top:activityListScrollY}); }
    else if(paintY!==null) window.scrollTo({top:paintY});
  });
}
function teacherBoardFold(module){
  const mn=Number(module);
  boardSectionClosed[mn]=!boardSectionClosed[mn];
  renderTeacherActivities({cached:true});   // a fold over cards we already have
}
// Both write nothing — see the boardSortKey comment. Repaint from cache.
function teacherBoardSetSort(key){ boardSortKey=key; renderTeacherActivities({cached:true}); }
function teacherBoardFlipDir(){ boardSortDir = boardSortDir==='desc' ? 'asc' : 'desc'; renderTeacherActivities({cached:true}); }
function teacherBoardArchToggle(key, open){ boardArchOpen[key]=!!open; }

/* ── Class activities: the list + tabbed detail (Layout A, 2026-11-08) ────
   The screen the tab opens on. LEFT, the list: a search box, five filters
   (Units — the default — / This week / Keep practicing / Not dated / All)
   and one row per card with its #N, date, title and a done bar. RIGHT, the
   picked activity: a header, then three tabs — Preview (the default; what
   renderTeacherActivityDetail always drew), Students (the roll and the
   per-student table, in the same [data-ta-live] boxes the refresh repaints)
   and Settings (the board's per-card controls, drawn by the same
   teacherActivityCtlKit, so every switch calls the writer it always did).

   Picking a row repaints the right column only: the list keeps its element
   and its scroll. A write repaints the list, the header, Settings and the
   Students boxes and leaves the Preview alone, so a song playing there
   keeps playing. "Unit" is the classroom name for a module (Unit N =
   Module N, always); this part of the console says Unit, everything else
   says Module. Reordering stays on the board ("Arrange board"). */
let activityListFilter='units';      // 'units' | 'week' | 'pins' | 'undated' | 'all'
let activityListQuery='';            // the search box
let activityUnitOpen={};             // unit key -> true/false; unset = only the newest unit is open
let activityListJump=null;           // a group key: the next list paint scrolls to that unit's heading, then clears this
let activityDetailTab='preview';     // the tab the next activity opens on: the last one used
const TA_FILTERS=[['units','Units'],['week','This week'],['pins','Keep practicing'],['undated','Not dated'],['all','All']];
const TA_TABS=['preview','students','settings'];
// The cards this list (and the board) holds: not a Songs-page song, not a teacher-only card.
function teacherActivityListActivities(cfg){
  return (window.CLASS_ACTIVITIES||[]).filter(a=>!caIsLibraryCard(a, (cfg&&cfg.songLibrary)||{}) && !caIsTeacherSong(a, (cfg&&cfg.classSongs)||{}));
}
// "2026-11-05" -> "Nov 5". English, like the rest of the console.
function teacherShortDate(d){
  const m=/^(\d{4})-(\d{2})-(\d{2})$/.exec(String(d||''));
  return m ? new Date(+m[1], +m[2]-1, +m[3]).toLocaleDateString('en-US', {month:'short', day:'numeric'}) : String(d||'');
}
function teacherActivityKindLabel(a){
  if(a.kind==='check') return 'Exit check';
  if(typeof caIsCard==='function' && caIsCard(a)) return 'Practice card';
  if(typeof caHasPaths==='function' && caHasPaths(a)) return 'Focus view, paths';
  return a.view==='focus' ? 'Focus view' : 'Step list';
}
// Unit number of a placed card (0 = Unsorted), or null when it is not on the board.
function teacherActivityUnit(id, view){
  if(!view.assigned[id]) return null;
  const sec=view.sections.find(s=>s.ids.includes(id)||s.retiredIds.includes(id));
  return sec ? sec.module : 0;
}
function teacherUnitName(mn){
  if(mn===0) return 'Unsorted';
  const mod=((typeof MODULE_MANIFEST!=='undefined')?MODULE_MANIFEST:[]).find(m=>m.num===mn);
  return `Unit ${mn}${mod?` — ${mod.name}`:''}`;
}
/* Done / for-whom counts, the way the board's done lines count them: the
   students the card is for (its Who picker), done = classActivities[id], or
   a turned-in result for an exit check. Read off allStudents, so they follow
   the console's period filter — on All they add up the board's P4 / P7 /
   CAS / Unassigned lines (a student whose stored period is anything else is
   on no board line but is counted here); on P4 they are the board's P4
   line. "Started" = a step or check tick (`<id>:<n>` / `<id>:c<n>` in
   caSteps); a path pick (`<id>:path:<key>`) alone is not a start. */
function teacherActivityDoneCounts(a, cfg){
  const forIt=allStudents.filter(s=>teacherActivityForStudent(a, s.uid, cfg));
  const isDone=a.kind==='check' ? (s=>!!(s.exitChecks||{})[a.id]) : (s=>(s.classActivities||{})[a.id]===true);
  const done=forIt.filter(isDone);
  const pre=a.id+':';
  const started=a.kind==='check' ? [] : forIt.filter(s=>!isDone(s) && Object.keys(s.caSteps||{}).some(k=>k.startsWith(pre) && !k.startsWith(pre+'path:') && s.caSteps[k]));
  return {total:forIt.length, done:done.length, started:started.length, results:a.kind==='check'?done.map(s=>s.exitChecks[a.id]):[]};
}
/* Every card the list can show, with what its row and the filters need. */
function teacherActivityListModel(cfg){
  const acts=teacherActivityListActivities(cfg);
  const view=teacherBoardView(cfg);
  const dates=cfg.activityDates||{}, hidden=cfg.hiddenActivities||{};
  const pins=teacherActivityPins(cfg);
  const rows={};
  acts.forEach(a=>{
    const unit=teacherActivityUnit(a.id, view);
    rows[a.id]={a, id:a.id, title:teacherActivityTitle(a,cfg), num:view.number[a.id]||null, unit, assigned:unit!==null,
      date:dates[a.id]||'', hidden:hidden[a.id]===true, optional:teacherActivityOptional(a.id,cfg),
      archived:teacherActivityArchived(a.id,cfg), deleted:teacherActivityDeleted(a.id,cfg), pin:pins.indexOf(a.id),
      isCheck:a.kind==='check', assignedCounts:unit!==null};
  });
  // Units, newest first: each placed unit's live cards newest first (the
  // board's default), its archived ones after them; Unsorted, then Built.
  const units=view.sections.filter(s=>s.module!==0 && (s.ids.length||s.retiredIds.length)).map(s=>s.module).sort((x,y)=>y-x);
  const groups=units.map(mn=>{ const s=view.sections.find(x=>x.module===mn); return {key:String(mn), label:teacherUnitName(mn), ids:s.ids.slice().reverse().concat(s.retiredIds.slice().reverse())}; });
  const uns=view.sections.find(s=>s.module===0);
  if(uns && (uns.ids.length||uns.retiredIds.length)) groups.push({key:'0', label:'Unsorted', ids:uns.ids.slice().reverse().concat(uns.retiredIds.slice().reverse())});
  const built=acts.filter(a=>!rows[a.id].assigned).sort((x,y)=>teacherActivityIdNum(y)-teacherActivityIdNum(x));
  const builtIds=built.filter(a=>!teacherActivityRetired(a.id,cfg)).concat(built.filter(a=>teacherActivityRetired(a.id,cfg))).map(a=>a.id);
  if(builtIds.length) groups.push({key:'built', label:'Built — not assigned yet', ids:builtIds});
  groups.forEach(g=>{ g.ids=g.ids.filter(id=>rows[id]); });
  return {rows, groups, pins, view};
}
/* The ids a flat filter shows, in order. */
function teacherActivityFilterIds(model, filter){
  const all=[].concat(...model.groups.map(g=>g.ids));
  const R=model.rows;
  if(filter==='pins') return model.pins.filter(id=>R[id]);
  if(filter==='undated') return all.filter(id=>R[id].assigned && !R[id].archived && !R[id].deleted && !R[id].date);
  if(filter==='week'){
    // Monday to Sunday of this week.
    const now=new Date(); const mon=new Date(now.getFullYear(), now.getMonth(), now.getDate()-((now.getDay()+6)%7));
    const sun=new Date(mon.getFullYear(), mon.getMonth(), mon.getDate()+6);
    const lo=dayStr(mon), hi=dayStr(sun);
    return all.filter(id=>R[id].date && R[id].date>=lo && R[id].date<=hi && !R[id].archived && !R[id].deleted)
      .sort((x,y)=>R[y].date.localeCompare(R[x].date) || ((R[y].num||0)-(R[x].num||0)));
  }
  return all;
}
function teacherActivityMatches(r, q){
  if(!q) return true;
  const n=/^#?\s*(\d+)$/.exec(q);
  if(n && (r.num===Number(n[1]) || r.id==='ca-'+n[1])) return true;
  const t=q.toLowerCase().replace(/^#/, '');
  return r.title.toLowerCase().includes(t) || r.id.toLowerCase()===t;
}
function teacherActivityRowHtml(r){
  const today=dayStr(new Date());
  const tags=[];
  if(r.deleted) tags.push(['Deleted','off']);
  else if(r.archived) tags.push(['Archived','off']);
  if(!r.assigned && !r.deleted && !r.archived) tags.push(['Not assigned','off']);
  if(r.hidden && !r.archived && !r.deleted) tags.push(['Hidden','warn']);
  if(r.optional && r.assigned) tags.push(['Optional','']);
  if(r.date && r.date>today && r.assigned) tags.push(['Scheduled','sched']);
  if(r.pin>=0 && r.date) tags.push(['Pinned','']);
  const num=r.isCheck ? '<span class="ta-row-num ta-row-check">Check</span>' : `<span class="ta-row-num">${r.num?'#'+r.num:'—'}</span>`;
  const when=r.date ? teacherShortDate(r.date) : (r.pin>=0 ? 'Pinned' : 'No date');
  let bar='';
  // Counted here, for the rows actually drawn — not for every card on every
  // keystroke of a search.
  if(r.assignedCounts){
    const c=teacherActivityDoneCounts(r.a, teacherClassConfig), pct=c.total?Math.round(c.done/c.total*100):0;
    bar=`<span class="ta-row-done"><span class="ta-bar" aria-hidden="true"><i style="width:${pct}%"></i></span>${c.done}/${c.total} ${r.isCheck?'turned in':'done'}</span>`;
  }
  const sel=r.id===activityDetailId;
  return `<button type="button" class="ta-row${sel?' is-sel':''}${(r.archived||r.deleted)?' is-off':''}" data-ta-pick data-id="${escAttr(r.id)}"${sel?' aria-current="true"':''}>`
    +num+`<span class="ta-row-main"><span class="ta-row-top"><span class="ta-row-date">${escHtml(when)}</span>`
    +tags.map(([t,k])=>`<span class="ta-tag${k?' ta-tag-'+k:''}">${t}</span>`).join('')+`</span>`
    +`<span class="ta-row-title">${escHtml(r.title)}</span>${bar}</span></button>`;
}
/* Which groups the Units screen shows open: every one while a search is
   typed, else the teacher's own fold, else only the newest unit that holds
   a live card. The list and the sidebar tree's lit row both read this. */
function teacherUnitOpenMap(model, q){
  const R=model.rows, out={};
  const newest=(model.groups.find(g=>g.key!=='built' && g.ids.some(id=>!R[id].archived && !R[id].deleted))||model.groups[0]||{}).key;
  /* The picked card's unit opens, unless the teacher has folded or opened
     it by hand (a sidebar tree click sets every unit, so it is never
     undone here): a card picked from the board's Preview in a shut unit had
     no row on screen. Stored, so a later pick elsewhere doesn't shut it. */
  const pickGroup=activityDetailId && model.groups.find(g=>g.ids.includes(activityDetailId));
  if(pickGroup && activityUnitOpen[pickGroup.key]===undefined && pickGroup.key!==newest) activityUnitOpen[pickGroup.key]=true;
  model.groups.forEach(g=>{ out[g.key]=q ? true : (activityUnitOpen[g.key]!==undefined ? activityUnitOpen[g.key] : g.key===newest); });
  return out;
}
function teacherActivityListBodyHtml(cfg, model){
  if(!model) model=teacherActivityListModel(cfg);
  const q=activityListQuery.trim();
  const R=model.rows;
  if(activityListFilter==='units'){
    const openMap=teacherUnitOpenMap(model, q);
    const html=model.groups.map(g=>{
      const ids=g.ids.filter(id=>teacherActivityMatches(R[id], q));
      if(q && !ids.length) return '';
      const open=openMap[g.key];
      return `<div class="ta-unit" data-unit="${escAttr(g.key)}"><button type="button" class="ta-unit-head" data-ta-unit="${escAttr(g.key)}" aria-expanded="${open}">`
        +`<span class="ta-caret" aria-hidden="true"></span><span class="ta-unit-name">${escHtml(g.label)}</span><span class="ta-unit-count">${ids.length}</span></button>`
        +(open?`<div class="ta-unit-rows">${ids.map(id=>teacherActivityRowHtml(R[id])).join('')}</div>`:'')+`</div>`;
    }).join('');
    return html || `<div class="ta-list-empty">${q?'Nothing matches that search.':'No activities yet.'}</div>`;
  }
  const ids=teacherActivityFilterIds(model, activityListFilter).filter(id=>teacherActivityMatches(R[id], q));
  const empty={week:'Nothing is dated this week.', pins:'Nothing is pinned. Use Pin to Keep practicing on an activity.', undated:'Every assigned activity has a date.', all:'No activities yet.'}[activityListFilter];
  return ids.length ? ids.map(id=>teacherActivityRowHtml(R[id])).join('') : `<div class="ta-list-empty">${q?'Nothing matches that search.':empty}</div>`;
}
function teacherActivityListHeadHtml(){
  return `<div class="ta-list-head">`
    +`<div class="ta-list-top"><span class="ta-list-title" role="heading" aria-level="3">Class activities</span>`
    +`<button type="button" class="tg-seg-btn ta-board-btn" data-ta-board-open title="The full board: drag cards into units, renumber, assign, archive">Arrange board</button></div>`
    +`<input type="search" class="ta-search" data-ta-search placeholder="Search title or #number" aria-label="Search activities by title or #number" value="${escAttr(activityListQuery)}" autocomplete="off" spellcheck="false">`
    +`<div class="ta-filters" role="group" aria-label="Show">${TA_FILTERS.map(([k,l])=>`<button type="button" class="ta-filter" data-ta-filter="${k}" aria-pressed="${k===activityListFilter}">${l}</button>`).join('')}</div>`
    +`</div>`;
}
/* Repaint the list's rows only (the head with the search box stays, so it
   keeps focus while typing). `top` scrolls the rows back to the start — a
   new filter or search is a new list; a repaint after a write is not. */
function teacherPaintActivityList(top){
  const body=document.querySelector('#t-grid-container [data-ta-list-body]');
  if(!body) return false;
  const y=body.scrollTop;
  // One model for the rows and the sidebar tree: they cannot disagree.
  const model=teacherActivityListModel(teacherClassConfig);
  body.innerHTML=teacherActivityListBodyHtml(teacherClassConfig, model);
  body.scrollTop=top?0:y;
  document.querySelectorAll('#t-grid-container [data-ta-filter]').forEach(b=>b.setAttribute('aria-pressed', String(b.dataset.taFilter===activityListFilter)));
  teacherPaintSideTree(model);
  /* A click on the sidebar tree: bring that unit's heading to the top of
     the list. Returns true when it did, so the caller does not scroll the
     picked row into view over it. */
  if(activityListJump!==null){
    const key=activityListJump; activityListJump=null;
    const head=body.querySelector(`[data-ta-unit="${CSS.escape(key)}"]`);
    if(head){ body.scrollTop+=head.getBoundingClientRect().top-body.getBoundingClientRect().top; return true; }
  }
  return false;
}
/* A click on a row of the sidebar tree: show that one unit. Units screen,
   search cleared, every other unit folded, that unit at the top of the
   list. Nothing is written. On the list already, only the list's rows
   repaint, so the Preview (a song may be playing there) is never rebuilt;
   from any other page or screen it is the same trip as clicking Class
   activities. */
function teacherOpenUnitFromSide(key){
  key=String(key);
  activityListFilter='units'; activityListQuery='';
  activityUnitOpen={};
  if(teacherClassConfigLoaded && teacherClassConfig) teacherActivityListModel(teacherClassConfig).groups.forEach(g=>{ activityUnitOpen[g.key]=(g.key===key); });
  else activityUnitOpen[key]=true;
  activityListJump=key;
  const split=teacherView==='activities' && teacherActivityScreen()==='split' && document.querySelector('#t-grid-container [data-ta-split]');
  if(split){
    const s=split.querySelector('[data-ta-search]'); if(s) s.value='';
    teacherPaintActivityList(true);
    return;
  }
  setTeacherView('activities');
}
function teacherSetActivityFilter(f){
  if(!TA_FILTERS.some(([k])=>k===f)) return;
  activityListFilter=f;
  teacherPaintActivityList(true);
}
function teacherToggleUnit(key){
  // While a search is typed every unit with a match is shown open; a fold
  // then would be stored unseen and spring on the teacher later.
  if(activityListQuery.trim()) return;
  const head=document.querySelector(`#t-grid-container [data-ta-unit="${CSS.escape(key)}"]`);
  activityUnitOpen[key]=!(head && head.getAttribute('aria-expanded')==='true');
  teacherPaintActivityList(false);
}
/* What the list picks when nothing is picked yet: the newest card students
   can see now (released, assigned, not Hidden, not retired), else the first
   row of the list. */
function teacherDefaultActivityPick(cfg){
  const model=teacherActivityListModel(cfg);
  const today=dayStr(new Date());
  const live=Object.values(model.rows).filter(r=>r.assigned && r.date && r.date<=today && !r.hidden && !r.archived && !r.deleted)
    .sort((x,y)=>y.date.localeCompare(x.date) || ((y.num||0)-(x.num||0)));
  if(live.length) return live[0].id;
  const first=model.groups.find(g=>g.ids.length);
  return first ? first.ids[0] : null;
}
function teacherPickActivity(id){
  if(id===activityDetailId && document.querySelector(`#t-grid-container [data-ta-head][data-id="${CSS.escape(id)}"]`)) return;
  // The previewed card's song or snippet belongs to the card being left.
  // Safe here: Teacher view songs (the room's song) is another tab, and
  // leaving it already stopped its card (setTeacherView).
  if(typeof stopCardAudio==='function') stopCardAudio();
  activityDetailId=id; activityEditId=null;
  /* Picked under a flat filter or a search, where every unit's fold is out
     of sight: the card's unit opens for the way back to Units. The newest
     choice wins — a tree click after this pick still decides. */
  if((activityListFilter!=='units' || activityListQuery.trim()) && teacherClassConfigLoaded && teacherClassConfig){
    const g=teacherActivityListModel(teacherClassConfig).groups.find(x=>x.ids.includes(id));
    if(g) activityUnitOpen[g.key]=true;
  }
  document.querySelectorAll('#t-grid-container [data-ta-pick]').forEach(r=>{
    const on=r.dataset.id===id;
    r.classList.toggle('is-sel', on);
    if(on) r.setAttribute('aria-current','true'); else r.removeAttribute('aria-current');
  });
  renderTeacherActivityDetail(id);
  teacherPaintSideTree();
  // A row picked low on a long page: bring the top of the detail into view.
  const det=document.querySelector('#t-grid-container [data-ta-detail]');
  if(det){
    const hdr=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--hdr'))||60;
    const top=det.getBoundingClientRect().top;
    if(top<hdr) window.scrollTo({top:Math.max(0, window.scrollY+top-hdr-12)});
  }
}
function teacherSetDetailTab(tab, focus){
  if(!TA_TABS.includes(tab)) return;
  activityDetailTab=tab;
  const box=document.getElementById('t-grid-container');
  box.querySelectorAll('[data-ta-tab]').forEach(b=>{
    const on=b.dataset.taTab===tab;
    b.classList.toggle('on', on); b.setAttribute('aria-selected', String(on)); b.tabIndex=on?0:-1;
    if(on && focus) b.focus();
  });
  box.querySelectorAll('[data-ta-pane]').forEach(p=>{ p.hidden = p.dataset.taPane!==tab; });
}
/* The Students tab's count: done (or turned in) / the students it is for. */
function teacherStudentsTabLabelHtml(a){
  const c=teacherActivityDoneCounts(a, teacherClassConfig);
  return `Students <span class="ta-tab-count">${c.done}/${c.total}</span>`;
}
/* Three counts above the Students tab's roll, from the roster already in
   hand — no extra read. "Started" = at least one step or check ticked
   (caSteps) but not marked done. Nothing records a card being opened, so
   the third count is "Not started", not "not opened". */
function teacherActivityCountsHtml(a){
  const c=teacherActivityDoneCounts(a, teacherClassConfig);
  const chip=(n,label,cls)=>`<span class="ta-count ${cls}"><b>${n}</b> ${label}</span>`;
  if(a.kind==='check'){
    const items=(((a.check||{}).items)||[]).length;
    const avg=c.results.length?(c.results.reduce((n,r)=>n+(Number(r.score)||0),0)/c.results.length).toFixed(1):null;
    return `<div class="ta-counts">${chip(c.done,'turned in','ta-count-done')}${chip(c.total-c.done,'not turned in','ta-count-not')}`
      +`<span class="ta-count">average <b>${avg===null?'—':avg+'/'+items}</b></span></div>`;
  }
  return `<div class="ta-counts">${chip(c.done,'done','ta-count-done')}${chip(c.started,'started','ta-count-started')}${chip(c.total-c.done-c.started,'not started','ta-count-not')}</div>`;
}
/* The detail header: "Unit 3 · #7 · Released Nov 5 · Practice card", the
   title, then Copy link, Pin and a More menu. Every button carries the same
   data-* attribute as its twin on the board, so it calls the same writer. */
function teacherActivityHeadHtml(a, cfg){
  const raw=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===a.id)||a;
  const view=teacherBoardView(cfg);
  const lib=caIsLibraryCard(raw, cfg.songLibrary||{}), tsong=caIsTeacherSong(raw, cfg.classSongs||{});
  const unit=(lib||tsong) ? null : teacherActivityUnit(a.id, view);
  const retired=teacherActivityRetired(a.id,cfg), del=teacherActivityDeleted(a.id,cfg);
  const date=(cfg.activityDates||{})[a.id]||'';
  const today=dayStr(new Date());
  const meta=[lib?'Songs page':tsong?'Teacher view songs':unit===null?'Built, not assigned':unit===0?'Unsorted':`Unit ${unit}`];
  if(view.number[a.id]) meta.push('#'+view.number[a.id]);
  meta.push(date ? (date<=today?`Released ${teacherShortDate(date)}`:`Scheduled ${teacherShortDate(date)}`) : 'No release date');
  meta.push(teacherActivityKindLabel(a));
  const tags=[];
  if(retired) tags.push(['ta-tag-off', del?'Deleted':'Archived']);
  if((cfg.hiddenActivities||{})[a.id]===true && !retired) tags.push(['ta-tag-warn','Hidden']);
  if(unit!==null && teacherActivityOptional(a.id,cfg)) tags.push(['','Optional']);
  const pins=teacherActivityPins(cfg), at=pins.indexOf(a.id);
  const placed=unit!==null && !retired;
  const pinBtn=(a.kind!=='check' && (placed || at>=0))
    ? `<button type="button" class="tg-seg-btn ta-act-btn${at>=0?' on':''}" data-set-activity-pin data-id="${escAttr(a.id)}" data-state="${at>=0?'off':'on'}" aria-pressed="${at>=0}" title="${at>=0?'On the Keep practicing row at the top of students’ In-Class Activities page — click to unpin':`Put this on the Keep practicing row at the top of students’ In-Class Activities page — no release date needed. ${TEACHER_PINS_MAX} at most.`}">${at>=0?`Pinned ${at+1} of ${TEACHER_PINS_MAX}`:'Pin to Keep practicing'}</button>`
    : '';
  const isHidden=(cfg.hiddenActivities||{})[a.id]===true;
  const item=(attrs,label,cls)=>`<button type="button" class="ta-more-item${cls?' '+cls:''}" role="menuitem" ${attrs}>${label}</button>`;
  const id=escAttr(a.id);
  const more=[];
  if(!lib && !tsong){
    more.push(item(`data-ta-rename data-id="${id}"`,'Rename…'));
    if(placed) more.push(item(`data-set-activity-hidden data-id="${id}" data-state="${isHidden?'show':'hide'}"`, isHidden?'Show to students':'Hide from students'));
    if(placed) more.push(item(`data-unassign-activity data-id="${id}"`,'Un-assign (back to Built)'));
    more.push(item(`data-ta-board-open`,'Open Arrange board'));
    if(del) more.push(item(`data-set-activity-archived data-id="${id}" data-state="restore"`,'Restore'));
    else if(retired) more.push(item(`data-set-activity-archived data-id="${id}" data-state="restore"`,'Restore')+item(`data-delete-activity data-id="${id}"`,'Delete','t-act-danger'));
    else more.push(item(`data-set-activity-archived data-id="${id}" data-state="archive"`,'Archive')+item(`data-delete-activity data-id="${id}"`,'Delete','t-act-danger'));
  } else {
    more.push(item(`data-ta-goto-view="${lib?'songs':'tsongs'}"`, lib?'Open the Songs tab':'Open Teacher view songs'));
  }
  return `<div class="ta-meta">${meta.map(escHtml).join(' · ')}${tags.map(([c,t])=>` <span class="ta-tag ${c}">${t}</span>`).join('')}</div>`
    +`<div class="ta-title-row"><h2 class="ta-title">${escHtml(teacherActivityTitle(a,cfg))} <span class="ta-title-id">(${escHtml(a.id)})</span></h2>`
    +`<div class="ta-actions"><button type="button" class="tg-seg-btn ta-act-btn" data-copy-activity-link data-id="${id}" title="Copy the student link straight to this ${a.kind==='check'?'exit check':'activity'}">Copy link</button>`
    +pinBtn
    +`<details class="ta-more" data-ta-more><summary class="tg-seg-btn ta-act-btn" aria-label="More actions" title="More actions">More &#x25BE;</summary><div class="ta-more-menu" role="menu">${more.join('')}</div></details>`
    +`</div></div>`;
}
/* The Settings tab: the per-card controls from the board, for this one card,
   in the states the board shows them (a card not yet assigned gets Assign to
   and Archive / Delete, an archived one Restore). */
function teacherActivitySettingsHtml(a, cfg){
  const raw=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===a.id)||a;
  const row=(label, html, note)=>html?`<div class="ta-set-row"><div class="ta-set-lbl">${label}</div><div class="ta-set-ctl">${html}${note?`<div class="ta-set-note">${note}</div>`:''}</div></div>`:'';
  if(caIsLibraryCard(raw, cfg.songLibrary||{}) || caIsTeacherSong(raw, cfg.classSongs||{})){
    const lib=caIsLibraryCard(raw, cfg.songLibrary||{});
    return `<div class="tg-note">${escHtml(teacherActivityPlace(a.id))}</div>`
      +row('Managed on', `<button type="button" class="tg-seg-btn ta-act-btn" data-ta-goto-view="${lib?'songs':'tsongs'}">${lib?'Songs tab':'Teacher view songs tab'}</button>`, lib?'Rename it, hide it, or move it back to Class activities there.':'Move it to Class activities there.')
      +row('Student link', linkRow(a));
  }
  const acts=teacherActivityListActivities(cfg);
  const kit=teacherActivityCtlKit(cfg, acts);
  const view=kit.view;
  const unit=teacherActivityUnit(a.id, view);
  const retired=teacherActivityRetired(a.id,cfg), del=teacherActivityDeleted(a.id,cfg);
  const id=escAttr(a.id);
  const renamed=teacherActivityRenamed(raw,cfg);
  const shown=teacherActivityTitle(raw,cfg);
  const nameHtml = activityEditId===a.id
    ? `<input type="text" class="t-act-title-edit ta-rename" data-id="${id}" value="${escAttr(shown)}" maxlength="120" spellcheck="false" aria-label="Rename ${escAttr(shown)} (English)">`
      +`<div class="ta-set-btns"><button type="button" class="tg-seg-btn on" data-rename-save data-id="${id}">Save</button><button type="button" class="tg-seg-btn" data-rename-cancel>Cancel</button>`
      +(renamed?`<button type="button" class="tg-seg-btn" data-rename-reset data-id="${id}">Undo rename</button>`:'')+`</div>`
    : `<span class="ta-set-btns"><span class="ta-set-name">${escHtml(shown)}</span><button type="button" class="t-act-pencil" data-rename-activity data-id="${id}" title="Rename this activity" aria-label="Rename ${escAttr(shown)}">&#x270E;</button></span>`;
  const nameNote = activityEditId===a.id ? 'Students see this right away, in English in both languages, until the Spanish twin ships in the next update.'
    : renamed ? `Renamed — students see this in both languages until the Spanish twin ships. Was: ${escHtml(raw.title)}` : '';
  const retireHtml = del
    ? `<button type="button" class="tg-seg-btn" data-set-activity-archived data-id="${id}" data-state="restore" title="Put this activity back — it returns blank, ready to place and publish">Restore</button>`
    : retired
    ? `<button type="button" class="tg-seg-btn" data-set-activity-archived data-id="${id}" data-state="restore" title="Put this activity back, with its date and name">Restore</button>`
      +`<button type="button" class="tg-seg-btn t-act-danger" data-delete-activity data-id="${id}" title="Clear this activity's date, name and gate clears, and take it off the board">Delete</button>`
    : `<button type="button" class="tg-seg-btn" data-set-activity-archived data-id="${id}" data-state="archive" title="Take this off students' In-Class Activities page but keep its place, date and name">Archive</button>`
      +`<button type="button" class="tg-seg-btn t-act-danger" data-delete-activity data-id="${id}" title="Retire it AND clear its date, name and gate clears">Delete</button>`;
  const retireNote = del ? 'Deleted — Restore brings it back blank, in Built.' : retired ? 'Archived — students don’t see it and it holds no number. Restore puts it back where it was.'
    : 'Archive takes it off students’ page but keeps its place, date and name. Delete also clears the date, rename and gate clears, and takes it off the board. Neither touches what students finished.';
  let html=teacherRetiredBanner(a.id);
  if(unit===null){
    const strays=[];
    if(kit.dates[a.id]) strays.push(`release date ${escHtml(kit.dates[a.id])}`);
    if(kit.hidden[a.id]===true) strays.push('Hidden');
    if(kit.optional[a.id]===true) strays.push('Optional');
    if(kit.optional[a.id]===false) strays.push('Required');
    if(kit.pins.includes(a.id)) strays.push('Pinned');
    html+=row('Unit', retired ? '' : kit.moveSelect(a,'Assign to…',null), 'Not assigned to a unit yet, so no student sees it. Assign it, then set its release date here.'+(strays.length?` It carries: ${strays.join(' · ')} — no effect until it’s assigned.`:''))
      +row('Name', nameHtml, nameNote)
      +row('Songs', kit.songBtn(a))
      +row('Retire', `<div class="ta-set-btns">${retireHtml}</div>`, retireNote)
      +row('Student link', linkRow(a));
    return html;
  }
  if(retired){
    return html+row('Unit', `<span>${escHtml(teacherUnitName(unit))}</span>`)
      +row('Name', nameHtml, nameNote)
      +row('Retire', `<div class="ta-set-btns">${retireHtml}</div>`, retireNote)
      +row('Student link', linkRow(a));
  }
  const curModule=Number(((cfg.activityBoard||{})[a.id]||{}).module)||0;
  return html
    +row('Release', kit.publishBlock(a), 'Students see it once it is assigned, its date has arrived, and it is not Hidden or archived.')
    +row('Students see it', kit.visSeg(a), 'Hidden pulls back a card that is already live. The date and Hidden are independent.')
    +row('Required', kit.optSeg(a), 'A Required card opens first at sign-in until a student finishes it or you clear it. Nothing else is locked.')
    +row('Play Along', kit.playSeg(a))
    +row('Keep practicing', kit.pinBtn(a))
    +row('Who', kit.whoPicker(a))
    +row('Unit', `<div class="ta-set-btns">${kit.moveSelect(a,'Move to…',curModule)}<button type="button" class="tg-seg-btn" data-unassign-activity data-id="${id}" title="Send this back to Built — it keeps its date and name">Un-assign</button></div>`,
      `${escHtml(teacherUnitName(unit))}${kit.nums[a.id]?` · #${kit.nums[a.id]}`:''}. To change its place inside the unit, use Arrange board.`)
    +row('Name', nameHtml, nameNote)
    +row('Songs', kit.songBtn(a))
    +row('Retire', `<div class="ta-set-btns">${retireHtml}</div>`, retireNote)
    +row('Student link', linkRow(a));
}
/* The detail column's frame: header, tab strip, three panes. Only the
   chosen tab's pane is shown; all three are in the page, so switching tabs
   draws nothing and a song playing in the Preview keeps playing. */
function teacherDetailFrameHtml(a, back, panes){
  const cfg=teacherClassConfig;
  const tab=activityDetailTab;
  const tabBtn=(k,label)=>`<button type="button" role="tab" class="ta-tab${k===tab?' on':''}" id="ta-tab-${k}" data-ta-tab="${k}" aria-selected="${k===tab}" aria-controls="ta-pane-${k}" tabindex="${k===tab?0:-1}">${label}</button>`;
  const pane=k=>`<div class="ta-pane" role="tabpanel" id="ta-pane-${k}" aria-labelledby="ta-tab-${k}" data-ta-pane="${k}"${k===tab?'':' hidden'}>${panes[k]}</div>`;
  return back
    +`<div class="ta-dhead" data-ta-head data-id="${escAttr(a.id)}">${teacherActivityHeadHtml(a,cfg)}</div>`
    +`<div class="ta-tabs" role="tablist" aria-label="Activity">${tabBtn('preview','Preview')}${tabBtn('students',`<span data-ta-students-label>${teacherStudentsTabLabelHtml(a)}</span>`)}${tabBtn('settings','Settings')}</div>`
    +pane('preview')+pane('students')+`<div class="ta-pane" role="tabpanel" id="ta-pane-settings" aria-labelledby="ta-tab-settings" data-ta-pane="settings"${tab==='settings'?'':' hidden'}><div data-ta-settings>${panes.settings}</div></div>`;
}
/* Where the detail draws: the right column of the split, or the whole
   content area when it was opened from Songs or a student's page. */
function teacherDetailHost(){
  const box=document.getElementById('t-grid-container');
  if(teacherView==='activities' && teacherActivityScreen()==='split') return box.querySelector('[data-ta-detail]');
  return box;
}
/* After a write or a refresh: repaint the header, Settings and the Students
   boxes of the activity on screen, never its Preview. Draws it whole the
   first time. */
function teacherSoftRepaintDetail(){
  const host=teacherDetailHost();
  if(!host || !activityDetailId) return;
  const head=host.querySelector('[data-ta-head]');
  if(!head || head.dataset.id!==activityDetailId){ renderTeacherActivityDetail(activityDetailId); return; }
  const raw=(window.CLASS_ACTIVITIES||[]).find(x=>x.id===activityDetailId);
  if(!raw) return;
  const a=typeof caView==='function'?caView(raw):raw;
  const cfg=teacherClassConfig;
  // An open More menu is closed by the repaint — it was the click that wrote.
  head.innerHTML=teacherActivityHeadHtml(a,cfg);
  const set=host.querySelector('[data-ta-settings]');
  if(set){
    // An open rename box keeps what was typed (a failed save, then a Refresh,
    // would otherwise put the server's title back in it).
    const old=set.querySelector('.t-act-title-edit');
    const typed=old ? {id:old.dataset.id, value:old.value} : null;
    set.innerHTML=teacherActivitySettingsHtml(a,cfg);
    const box=typed && set.querySelector('.t-act-title-edit');
    if(box && box.dataset.id===typed.id) box.value=typed.value;
  }
  teacherRepaintActivityStudents(a.id);
  if(activityEditId){ const inp=host.querySelector('.t-act-title-edit'); if(inp){ inp.focus(); inp.select(); } }
}
/* A fresh read can carry another console's archive or un-archive of a
   student: re-filter the roster from it, or the rows, the Students tab and
   its roll keep counting the old cfg's roster until the minute refresh. The
   board, the split and the detail all read through this. */
function teacherReadConfigAndRoster(){
  return loadTeacherClassConfig().then(cfg=>{ if(cfg) teacherApplyRosterFilter(); return cfg; });
}
/* The Class activities screens other than the board: the split, and the
   detail alone. Same `cached` contract as the board (see its comment). */
function teacherRenderActivityScreen(screen, opts){
  const cached = !!(opts && opts.cached) && teacherClassConfigLoaded;
  const box=document.getElementById('t-grid-container');
  if(screen==='detail'){
    if(!box.querySelector(`[data-ta-head][data-id="${CSS.escape(activityDetailId)}"]`)) renderTeacherActivityDetail(activityDetailId);
    else teacherSoftRepaintDetail();
    teacherPaintSideTree();
    if(!cached) teacherReadConfigAndRoster().then(cfg=>{ if(cfg && teacherView==='activities' && teacherActivityScreen()==='detail'){ teacherSoftRepaintDetail(); teacherPaintSideTree(); } });
    return;
  }
  if(!(window.CLASS_ACTIVITIES||[]).length){
    box.innerHTML='<div class="t-loading">No activities yet — they\'ll appear here once one is pushed to the site.</div>';
    return;
  }
  if(!cached && !box.querySelector('[data-ta-split]')) box.innerHTML='<div class="t-loading">Loading…</div>';
  (cached ? Promise.resolve(teacherClassConfig) : teacherReadConfigAndRoster()).then(async cfg=>{
    if(teacherView!=='activities' || teacherActivityScreen()!=='split') return;   // switched away mid-flight
    if(!cfg) return;
    // First ever paint on a class with no board yet: the same one-time
    // placement the board runs (teacherMigrateActivityBoard), then paint.
    if(!cfg.activityBoardSeeded && !boardMigrating){
      if(!teacherClassConfigReadOk){
        box.innerHTML='<div class="t-loading">Could not read the class settings, so the activity board hasn\'t been set up yet — check your connection and reload.</div>';
        return;
      }
      const done=await teacherMigrateActivityBoard(cfg);
      if(teacherView!=='activities' || teacherActivityScreen()!=='split') return;
      if(!done && !cfg.activityBoardSeeded){
        box.innerHTML='<div class="t-loading">Could not set up the activity board — reload to try again.</div>';
        return;
      }
    }
    // Against the list's own cards: one just moved to Songs (or Teacher view
    // songs) is still in CLASS_ACTIVITIES but has no row here any more. Its
    // Preview goes, so its sound does too.
    if(!activityDetailId || !teacherActivityListActivities(cfg).some(a=>a.id===activityDetailId)){
      if(activityDetailId && typeof stopCardAudio==='function') stopCardAudio();
      activityDetailId=teacherDefaultActivityPick(cfg);
    }
    activityListPickId=activityDetailId;
    if(box.querySelector('[data-ta-split]')){
      teacherPaintActivityList(false);
      if(activityDetailId) teacherSoftRepaintDetail();
      return;
    }
    box.innerHTML=`<div class="ta-split" data-ta-split>`
      +`<aside class="ta-list" data-ta-list aria-label="Class activities list">${teacherActivityListHeadHtml()}<div class="ta-list-body" data-ta-list-body></div></aside>`
      +`<section class="ta-detail" data-ta-detail aria-label="Picked activity"></section></div>`;
    const jumped=teacherPaintActivityList(true);
    // The picked row in view inside the list's own scroller (never the window). A sidebar-tree jump already placed the list.
    const body=box.querySelector('[data-ta-list-body]'), sel=box.querySelector('[data-ta-pick].is-sel');
    if(body && sel && !jumped){ const off=sel.getBoundingClientRect().top-body.getBoundingClientRect().top; if(off>body.clientHeight-40) body.scrollTop=off-body.clientHeight/3; }
    if(activityDetailId) renderTeacherActivityDetail(activityDetailId);
    else box.querySelector('[data-ta-detail]').innerHTML='<div class="t-loading">Pick an activity on the left.</div>';
  });
}
