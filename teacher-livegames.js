/* ════════════════════════════════════════════════════════════════════
   Teacher console — the Live In-Class Games list (2026-11-13, Jonathan:
   "delete and re-order and rename games. make it look like the class
   activities screen")

   One card per game of the bank (LIVE_QUIZZES, live-quiz.js), under the
   stage's control strip. Order (drag, ▲ ▼, the # box), Rename (English, and
   an optional Spanish name) and Remove / Restore. The games are built into
   the code, so "delete" is Remove: the game leaves the picker and waits in
   the folded "Removed games" section, as an archived activity does.

   Stored in config/class (teacher writes, every student may read):
     liveGames.order    [ids]  the teacher's order. An id the bank no longer
                               has is ignored; a game new to the bank shows
                               at the end (lqgOrder). Removed games keep their
                               slot here, so Restore puts one back in place.
     liveGames.names    {id: {en, es}}  his names; '' = the built-in title.
     liveGames.removed  {id: true}
   Every write goes through teacherWriteConfig() and is CELL-CHECKED on the
   one cell it was worked out from (the order array, one name, one removed
   flag): a rename in one console and a move in another both go through; two
   moves at once refuse the later one ("Nothing was saved"). One write at a
   time from this list (lqgBusy greys the controls), so this tab's own quick
   clicks cannot land out of order.

   How a student sees a name: lqTeacherStart copies it into the session
   (liveQuiz/current.title, {en, es}), frozen for that game. No student page
   reads liveGames. See lqCustomTitle in live-quiz.js.

   Reuses the Class activities board's look (its t-board-* classes) and two
   of its helpers as they are (teacherBoardClearDropMarks, boardEl). The move
   rule is the board's (teacherBoardBump / teacherMoveActivityToNumber: step
   over the games on screen, land just before or after the neighbour), copied
   small here because the board's writer is built around units and `pos`.
   ════════════════════════════════════════════════════════════════════ */

let lqgBusy = false;          // one write at a time; the list's controls gate on it
let lqgEditId = null;         // the game whose rename editor is open
let lqgDraft = null;          // {id, en, es}: what was typed in a rename that did not save, put back in the boxes
let lqgRemovedOpen = false;   // the "Removed games" fold
let lqgDragId = null;         // the game a drag is carrying

/* ── The model (pure: config in, lists out) ── */
function lqgCfg(cfg){
  const g = cfg && cfg.liveGames;
  return (g && typeof g === 'object' && !Array.isArray(g)) ? g : {};
}
function lqgHas(id){ return typeof id === 'string' && Object.prototype.hasOwnProperty.call(LIVE_QUIZZES, id); }
// Every game of the bank once: the saved order first (unknown ids and repeats dropped), then any game new to the bank in bank order.
function lqgOrder(g){
  const seen = new Set(), out = [];
  (Array.isArray(g.order) ? g.order : []).forEach(id => { if(lqgHas(id) && !seen.has(id)){ seen.add(id); out.push(id); } });
  Object.keys(LIVE_QUIZZES).forEach(id => { if(!seen.has(id)){ seen.add(id); out.push(id); } });
  return out;
}
function lqgIsRemoved(g, id){ return !!(g.removed && typeof g.removed === 'object' && g.removed[id] === true); }
function lqgView(cfg){
  const g = lqgCfg(cfg), all = lqgOrder(g);
  return { all, active: all.filter(id => !lqgIsRemoved(g, id)), removed: all.filter(id => lqgIsRemoved(g, id)) };
}
// The picker's list (lqPickerIds in live-quiz.js).
function lqgActiveIds(){ return lqgView(typeof teacherClassConfig !== 'undefined' ? teacherClassConfig : null).active; }
function lqgCleanName(v){ return typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, LQ_TITLE_MAX) : ''; }
// The saved name, cleaned: {en, es}, '' where none.
function lqgName(cfg, id){
  const names = lqgCfg(cfg).names;
  const n = (names && typeof names === 'object' && lqgHas(id) && Object.prototype.hasOwnProperty.call(names, id)) ? names[id] : null;
  return { en: lqgCleanName(n && n.en), es: lqgCleanName(n && n.es) };
}
function lqgBuiltIn(id, lang){ return tIn(LIVE_QUIZZES[id].titleKey, lang); }
// The English name the console shows for a game.
function lqgShownName(cfg, id){ return lqgName(cfg, id).en || lqgBuiltIn(id, 'en'); }
/* The order after moving `id` to position n (1-based) among the games on
   screen; null when nothing moves. The board's rule: land just before the
   game now at n when moving up, just after it when moving down. Removed
   games keep their slots in the full order. */
function lqgMovedOrder(cfg, id, n){
  const v = lqgView(cfg);
  const cur = v.active.indexOf(id) + 1;
  n = Math.round(Number(n));
  if(!cur || !Number.isFinite(n) || n < 1 || n > v.active.length || n === cur) return null;
  const target = v.active[n - 1];
  const rest = v.all.filter(x => x !== id);
  const ti = rest.indexOf(target);
  rest.splice(n > cur ? ti + 1 : ti, 0, id);
  return rest;
}
// The game a live session (or the console's preview) is running now, if any.
function lqgRunningIds(){
  const live = s => s && (s.state === 'lobby' || s.state === 'question' || s.state === 'reveal') ? s.quizId : null;
  const out = [];
  if(typeof lqTSession !== 'undefined' && live(lqTSession)) out.push(live(lqTSession));
  if(typeof lqTReal !== 'undefined' && live(lqTReal)) out.push(live(lqTReal));
  return out;
}

/* ── The list ── */
function lqgCardHtml(cfg, id, n, removed, running){
  const name = lqgShownName(cfg, id);
  const saved = lqgName(cfg, id);
  const renamed = !!(saved.en || saved.es);
  const dis = lqgBusy ? ' disabled' : '';
  let title;
  if(lqgEditId === id && !removed){
    const draft = lqgDraft && lqgDraft.id === id ? lqgDraft : null;
    title = `<div class="t-board-title">`
      + `<span class="t-act-title-lbl">Name (English)</span>`
      + `<input type="text" class="t-act-title-edit" data-lqg-name="en" data-id="${escAttr(id)}" value="${escAttr(draft ? draft.en : (saved.en || lqgBuiltIn(id, 'en')))}" maxlength="${LQ_TITLE_MAX}" spellcheck="false" aria-label="English name for ${escAttr(name)}">`
      + `<span class="t-act-title-lbl">Name (Spanish, optional)</span>`
      + `<input type="text" class="t-act-title-edit" data-lqg-name="es" data-id="${escAttr(id)}" value="${escAttr(draft ? draft.es : saved.es)}" maxlength="${LQ_TITLE_MAX}" spellcheck="false" placeholder="${escAttr(lqgBuiltIn(id, 'es'))}" aria-label="Spanish name for ${escAttr(name)}">`
      + `<span class="t-act-title-hint">Up to ${LQ_TITLE_MAX} characters. Empty English = the built-in name. Empty Spanish = students who use Spanish see the English name you typed (or the built-in Spanish one if you kept the English). The projector shows the English name. A game that is already running keeps the name it started with.</span>`
      + `<div style="margin-top:7px;display:flex;gap:6px;flex-wrap:wrap">`
      + `<button class="tg-seg-btn on" data-lqg-save data-id="${escAttr(id)}"${dis}>Save</button>`
      + `<button class="tg-seg-btn" data-lqg-cancel>Cancel</button>`
      + (renamed ? `<button class="tg-seg-btn" data-lqg-reset data-id="${escAttr(id)}"${dis}>Use the built-in name</button>` : '')
      + `</div></div>`;
  } else {
    title = `<div class="t-board-title" title="${escAttr(name)}">`
      + `<span class="t-board-name">${escHtml(name)}</span> `
      + `<span class="t-board-id">(${escHtml(id)})</span> `
      + (removed ? '' : `<button class="t-act-pencil" data-lqg-rename data-id="${escAttr(id)}" title="Rename this game" aria-label="Rename ${escAttr(name)}">&#x270E;</button>`)
      + (renamed ? `<span class="t-act-title-hint">Renamed${saved.es ? ` · Spanish: ${escHtml(saved.es)}` : ''} · Built-in name: ${escHtml(lqgBuiltIn(id, 'en'))}</span>` : '')
      + `</div>`;
  }
  const numBox = removed ? `<span class="t-board-nonum">—</span>`
    : `<span class="t-board-hash">#<input type="number" class="t-board-num" data-lqg-number data-id="${escAttr(id)}" value="${n}" min="1" step="1" title="Position in the list: type a new one to move this game"${dis} aria-label="Position for ${escAttr(name)}"></span>`;
  const isRunning = running.includes(id);
  const ctl = removed
    ? `<button class="tg-seg-btn" data-lqg-restore data-id="${escAttr(id)}"${dis} title="Put this game back in the Game list, where it was">Restore</button>`
    : `<button class="tg-seg-btn" data-lqg-bump data-id="${escAttr(id)}" data-dir="up"${dis} title="Move up" aria-label="Move up">&#x25B2;</button>`
      + `<button class="tg-seg-btn" data-lqg-bump data-id="${escAttr(id)}" data-dir="down"${dis} title="Move down" aria-label="Move down">&#x25BC;</button>`
      + `<span class="t-board-ctl-sp"><button class="tg-seg-btn" data-lqg-remove data-id="${escAttr(id)}"${(dis || isRunning) ? ' disabled' : ''} title="${isRunning ? 'This game is running. End it first, then remove it.' : 'Take this game out of the Game list. Restore brings it back.'}">Remove</button></span>`
      + (isRunning ? `<span class="t-board-stray">Running now: end the game to remove it.</span>` : '');
  return `<div class="t-board-card${removed ? ' t-board-retired' : ''}"${removed || lqgBusy ? '' : ' draggable="true"'} data-lqg-card data-id="${escAttr(id)}">`
    + `<div class="t-board-row">${removed ? '' : '<span class="t-board-grip" aria-hidden="true">&#x2630;</span>'}${numBox}${title}</div>`
    + (removed ? `<div class="t-board-stray">Removed: not in the Game list. Restore puts it back where it was.</div>` : '')
    + `<div class="t-board-ctl">${ctl}</div>`
    + `</div>`;
}
function lqgListHtml(cfg){
  const v = lqgView(cfg), running = lqgRunningIds();
  const cards = v.active.map((id, i) => lqgCardHtml(cfg, id, i + 1, false, running)).join('');
  const empty = `<div class="t-board-empty">Every game is removed. Open "Removed games" below and press Restore to start a game again.</div>`;
  const arch = v.removed.length
    ? `<details class="t-board-arch" data-lqg-arch${lqgRemovedOpen ? ' open' : ''}><summary>Removed games (${v.removed.length})</summary>`
      + v.removed.map(id => lqgCardHtml(cfg, id, 0, true, running)).join('') + `</details>`
    : '';
  return `<div class="t-board-section lq-games-sec" data-lqg-section>`
    + `<div class="t-board-sechead"><span>Games</span>`
    + `<span class="t-board-count">${v.active.length}</span></div>`
    + `<div class="t-board-secbody">`
    + `<div class="t-board-hint">Drag a game, use ▲ ▼ or type its number to change the order of the Game list above. ✎ renames it for you and your students. Remove takes it out of the list; Restore brings it back.</div>`
    + (cards || empty) + arch
    + `</div></div>`;
}
function lqgPaintList(){
  const host = document.getElementById('lq-games');
  if(!host) return;
  // Keep a half-typed rename: a repaint would put the saved name back over it.
  const ae = document.activeElement;
  const typing = ae && host.contains(ae) && ae.matches('[data-lqg-name]') && !lqgBusy;
  if(typing) return;
  host.innerHTML = lqgListHtml(teacherClassConfig);
  if(lqgEditId){ const inp = host.querySelector('[data-lqg-name="en"]'); if(inp){ inp.focus(); inp.select(); } }
}
// Called by renderTeacherLiveQuiz: makes the list's box under the strip, reads config/class, paints.
function lqgRender(){
  const shell = document.getElementById('lq-shell');
  if(!shell) return;
  let host = document.getElementById('lq-games');
  if(!host){
    host = document.createElement('div');
    host.id = 'lq-games';
    host.className = 'lq-games';
    host.innerHTML = `<div class="t-loading">Loading your games list…</div>`;
    shell.appendChild(host);
    lqgBind(host);
  }
  if(lqgBusy) return;
  loadTeacherClassConfig().then(cfg => {
    if(!cfg || teacherView !== 'livequiz') return;
    lqgPaintList();
    lqPaintControls();   // the picker follows the saved order, names and removed games
  });
}

/* ── Writes: one at a time, cell-checked on the one cell they change ── */
async function lqgWrite(apply, rollback, patch, base, msg, keepEditor){
  if(lqgBusy) return false;
  lqgBusy = true;
  apply();                       // optimistic: the list and the picker show it at once
  lqgPaintList(); lqPaintControls();
  try{
    await teacherWriteConfig(patch, base);
    return true;
  }catch(e){
    rollback();
    teacherConfigSaveFailed(e, msg, { keepEditor: !!keepEditor });
    return false;
  }finally{
    lqgBusy = false;
    if(teacherView === 'livequiz'){ lqgPaintList(); lqPaintControls(); }
  }
}
// teacherClassConfig.liveGames as a fresh copy (made if missing), for a writer to change one cell of.
function lqgSub(){
  const cfg = teacherClassConfig;
  const g = Object.assign({}, lqgCfg(cfg));
  cfg.liveGames = g;
  return g;
}
function lqgMoveTo(id, n){
  const cfg = teacherClassConfig;
  const next = lqgMovedOrder(cfg, id, n);
  if(!next){ lqgPaintList(); return; }   // out of range or unchanged: put the old number back, write nothing
  const g = lqgCfg(cfg);
  const had = Object.prototype.hasOwnProperty.call(g, 'order');
  const prev = g.order;
  lqgWrite(
    () => { lqgSub().order = next; },
    () => { const s = lqgSub(); if(had) s.order = prev; else delete s.order; },
    { liveGames: { order: next } },
    { 'liveGames.order': had ? prev : undefined },
    'Could not save that move. Check your connection and try again.');
}
function lqgBump(id, dir){
  const v = lqgView(teacherClassConfig);
  const cur = v.active.indexOf(id) + 1;
  if(cur) lqgMoveTo(id, dir === 'up' ? cur - 1 : cur + 1);
}
async function lqgSetName(id, en, es){
  if(!lqgHas(id) || lqgBusy) return;
  const typed = { id, en: String(en == null ? '' : en), es: String(es == null ? '' : es) };
  en = lqgCleanName(en); es = lqgCleanName(es);
  // The built-in name typed back (or nothing at all) is "no rename": nothing is stored.
  if(en === lqgBuiltIn(id, 'en')) en = '';
  if(es === lqgBuiltIn(id, 'es')) es = '';
  const clear = !en && !es;
  const g = lqgCfg(teacherClassConfig);
  const names = (g.names && typeof g.names === 'object') ? g.names : {};
  const had = Object.prototype.hasOwnProperty.call(names, id);
  const prev = names[id];
  await ensureDb();
  const fv = firebase.firestore.FieldValue;
  const put = n => { const s = lqgSub(); s.names = Object.assign({}, s.names || {}); if(n === undefined) delete s.names[id]; else s.names[id] = n; };
  lqgEditId = null; lqgDraft = null;
  const ok = await lqgWrite(
    () => put(clear ? undefined : { en, es }),
    () => put(had ? prev : undefined),
    { liveGames: { names: { [id]: clear ? fv.delete() : { en, es } } } },
    { ['liveGames.names.' + id]: had ? prev : undefined },
    'Could not save that name. Check your connection and try again. What you typed is still in the box.', true);
  // Not saved: the editor opens again holding what was typed (teacher-console.md, "Rename keeps its editor open").
  if(!ok){ lqgEditId = id; lqgDraft = typed; lqgPaintList(); }
}
function lqgSaveEditor(id){
  const host = document.getElementById('lq-games');
  const box = lang => host && host.querySelector(`[data-lqg-name="${lang}"][data-id="${CSS.escape(id)}"]`);
  const en = box('en'), es = box('es');
  lqgSetName(id, en ? en.value : '', es ? es.value : '');
}
async function lqgSetRemoved(id, removed){
  if(!lqgHas(id)) return;
  if(removed && lqgRunningIds().includes(id)){
    alert('This game is running now. End the game first, then remove it.');
    lqgPaintList();
    return;
  }
  const g = lqgCfg(teacherClassConfig);
  const map = (g.removed && typeof g.removed === 'object') ? g.removed : {};
  const had = Object.prototype.hasOwnProperty.call(map, id);
  const prev = map[id];
  if(removed === (prev === true)){ lqgPaintList(); return; }
  await ensureDb();
  const fv = firebase.firestore.FieldValue;
  const put = val => { const s = lqgSub(); s.removed = Object.assign({}, s.removed || {}); if(val === undefined) delete s.removed[id]; else s.removed[id] = val; };
  if(lqgEditId === id) lqgEditId = null;
  await lqgWrite(
    () => put(removed ? true : undefined),
    () => put(had ? prev : undefined),
    { liveGames: { removed: { [id]: removed ? true : fv.delete() } } },
    { ['liveGames.removed.' + id]: had ? prev : undefined },
    removed ? 'Could not remove that game. Check your connection and try again.' : 'Could not restore that game. Check your connection and try again.');
}

/* ── Events: delegated on the list's own box, bound once when it is made ── */
function lqgBind(host){
  host.addEventListener('click', e => {
    const b = e.target.closest('button');
    if(!b || b.disabled) return;
    const id = b.dataset.id;
    if(b.hasAttribute('data-lqg-bump')) lqgBump(id, b.dataset.dir);
    else if(b.hasAttribute('data-lqg-rename')){ lqgEditId = id; lqgDraft = null; lqgPaintList(); }
    else if(b.hasAttribute('data-lqg-save')) lqgSaveEditor(id);
    else if(b.hasAttribute('data-lqg-cancel')){ lqgEditId = null; lqgDraft = null; lqgPaintList(); }
    else if(b.hasAttribute('data-lqg-reset')) lqgSetName(id, '', '');
    else if(b.hasAttribute('data-lqg-remove')) lqgSetRemoved(id, true);
    else if(b.hasAttribute('data-lqg-restore')) lqgSetRemoved(id, false);
  });
  host.addEventListener('change', e => {
    const box = e.target.closest('[data-lqg-number]');
    if(box) lqgMoveTo(box.dataset.id, box.value);
  });
  // Ahead of the console's own keydown listener (teacher-core.js), which would
  // otherwise take Enter / Escape in a .t-act-title-edit box for an activity rename.
  host.addEventListener('keydown', e => {
    const name = e.target.closest('[data-lqg-name]');
    if(name){
      e.stopPropagation();
      if(e.key === 'Enter'){ e.preventDefault(); lqgSaveEditor(name.dataset.id); }
      else if(e.key === 'Escape'){ e.preventDefault(); lqgEditId = null; lqgDraft = null; name.blur(); lqgPaintList(); }
    }
  });
  host.addEventListener('toggle', e => {
    if(e.target && e.target.matches && e.target.matches('[data-lqg-arch]')) lqgRemovedOpen = e.target.open;
  }, true);
  host.addEventListener('dragstart', lqgDragStart);
  host.addEventListener('dragend', lqgDragEnd);
  host.addEventListener('dragover', lqgDragOver);
  host.addEventListener('drop', lqgDrop);
}
function lqgDragStart(e){
  const t = boardEl(e); if(!t || lqgBusy) return;
  const card = t.closest('[data-lqg-card][draggable="true"]');
  if(!card) return;
  lqgDragId = card.dataset.id;
  card.classList.add('t-board-dragging');
  try{ e.dataTransfer.setData('text/plain', card.dataset.id); e.dataTransfer.effectAllowed = 'move'; }catch(err){}
}
function lqgDragEnd(){
  lqgDragId = null;
  document.querySelectorAll('#lq-games .t-board-dragging').forEach(el => el.classList.remove('t-board-dragging'));
  teacherBoardClearDropMarks();
}
// The card a drop would land on, and whether above its middle; null off the list's live cards.
function lqgDropSpot(e){
  const t = boardEl(e); if(!t) return null;
  const over = t.closest('[data-lqg-card][draggable="true"]');
  if(!over) return null;
  const r = over.getBoundingClientRect();
  return { over, above: e.clientY < r.top + r.height / 2 };
}
function lqgDragOver(e){
  if(!lqgDragId) return;
  const spot = lqgDropSpot(e);
  if(!spot) return;
  e.preventDefault();
  try{ e.dataTransfer.dropEffect = 'move'; }catch(err){}
  teacherBoardClearDropMarks();
  if(spot.over.dataset.id !== lqgDragId) spot.over.classList.add(spot.above ? 't-board-drop-before' : 't-board-drop-after');
}
function lqgDrop(e){
  const id = lqgDragId;
  if(!id) return;
  const spot = lqgDropSpot(e);
  if(!spot) return;
  e.preventDefault();
  lqgDragEnd();
  // The board's rule (teacherBoardDrop): above a card's middle = before it, below = after it.
  const v = lqgView(teacherClassConfig);
  const cur = v.active.indexOf(id) + 1, p = v.active.indexOf(spot.over.dataset.id) + 1;
  if(!cur || !p || p === cur){ lqgPaintList(); return; }
  const n = spot.above ? (cur < p ? p - 1 : p) : (cur < p ? p : p + 1);
  lqgMoveTo(id, n);
}
