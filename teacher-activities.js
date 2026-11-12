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
      +`<div class="t-board-head">Built (${builtLive.length})</div>`
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
        +`<span class="t-board-caret" aria-hidden="true"></span><span>${label}</span>`
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
      +`<div class="t-board-head">Assigned to students (${assignedCount})</div>`
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
    +`<div class="ta-list-top"><span class="ta-list-title">Class activities</span>`
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
  const col=(cls,head,list,empty,cleared)=>`<div class="ta-roll-col ${cls}"><div class="ta-roll-head">${head} (${list.length})</div>`
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
        return `<div class="stu-section-head">Path: ${escHtml(p.label||p.key)} <span style="opacity:.55;font-size:.72em">(${own.length} step${own.length===1?'':'s'}, then the shared ones)</span></div>`
          +own.map((si,pos)=>stepCard(steps[si],si,pos)).join('');
      }).join('');
      const longest=Math.max(0,...a.paths.map(p=>caPathSteps(a,p.key).length));
      const tail=shared.length?`<div class="stu-section-head">Then, on every path</div>`
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
