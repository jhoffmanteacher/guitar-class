/* ══ CARD VIEWS — one practice card, the song as chords, tab or lyrics (Jonathan, 2026-11-17: "chords/tab switch") ══
   He asked "is there a way to offer both tab and lyrics/chord charts for songs?"; until now a song did that only as
   separate cards (Sweet Child: ca-28 tab, ca-33 chords, ca-45 lyrics). A card with `card.otherViews`
   (class-activities.js, CARD note; checks.mjs 1er) gets a Chords / Tab / Lyrics switch in the row of the card's other
   switches. Everything else on the card stays as it is when the view changes: the track, the speed, Guitar, the
   Metronome, the section buttons, Loop this part, Build up speed, full screen, and the place in the song.
     THE VIEWS   A view's name says what it draws: `tab` note by note, `chords` the chord grid (CHORD GRID,
                 app/cards.js), `lyrics` the PDF sheet (LYRIC SHEET, app/cards-sheet.js). The card's own view is its kind today
                 (caCardViewOwn) and is the default; `otherViews` lists the others with what each needs. A view is a
                 VIRTUAL CARD (caCardViewCard): the card with its display fields (VIEW_FIELDS) swapped for the
                 view's. Its sections are the card's own, section for section (label, fromBar, bars, reps; 1er), so
                 pcLayout gives the same window and pcLocate the same section, lap and beat at every moment.
     THE CHOICE  Remembered per card on this device (`localStorage.caCardViews`, { id: view }), like the Full /
                 Power switch (caChordModes): a per-viewer convenience, never written to progress/{uid}. Storage that
                 throws or comes back empty opens the card on its own view.
     THE SWITCH  caView() (app/activities.js) lays the chosen view over the card, so every reader (the player, the
                 sheet, the console) sees it. A press does NOT redraw the page or stop the song (the other switches
                 do: they change the track or the notes). caSetCardView swaps three things in place from a fresh
                 caCardBodyHtml(): the switch, the directions line and the view (.pc-tab or .pc-sheet). The .pc
                 element stays, and with it the speed control, Guitar, the Metronome and the Loop / Build flags. A
                 playing card (pcState) gets the new layout and forgets what it last painted, so the next frame
                 lights the same beat in the new view; its audio elements are not touched (no reload, no seek). A
                 lyric sheet draws when its PDF is read (pcSheetScan), then marks where the song is. After a
                 press into Chords or Tab the card's top comes back on screen (caCardViewReveal).
     RECORDINGS  (Jonathan, 2026-11-18, W23 question 1: both switches on Watchtower.) A card with the Jimi Hendrix /
                 Neil Young switch (recordingVersions, caView) has views too: each RECORDING has its own, because
                 each has its own sections. The card's otherViews are its own recording's (Jimi: Tab, Lyrics); a
                 version's card.otherViews are that recording's (Neil: Tab, his own power chords; no lyric sheet
                 follows his form), never inherited from the card. caCardViewHost is the card of the recording
                 shown, with its views; everything below reads it, so the switch offers only what that recording
                 has. A recording press keeps the stored view where the new recording has it, else the card's own
                 (caCardViewsFollowRecording). The two rows of buttons sit on one line, each with its visible name
                 (CSS .ca-switch-label). Never with the key / chord / bass versions (1er).
   Built songs (app/builtsongs.js) hold no tab and never get the field. */
const CA_CARD_VIEWS_KEY = 'caCardViews';
const CA_CARD_VIEW_NAMES = ['chords', 'tab', 'lyrics'];   // the switch's order
const CA_CARD_VIEW_LABELS = { chords: 'ca.viewChords', tab: 'ca.viewTab', lyrics: 'ca.viewLyrics' };
// The fields that say what a card DRAWS (not how it plays): a view replaces exactly these.
const CA_CARD_VIEW_FIELDS = ['caption', 'caption_es', 'sections', 'chordGrid', 'everyStrum', 'restWord', 'counts', 'sheet', 'sheetChords', 'sheetColumns', 'sheetNamedAgain'];
let caCardViewModes = (() => {
  try { const v = JSON.parse(localStorage.getItem(CA_CARD_VIEWS_KEY) || '{}'); return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
  catch(e) { return {}; }
})();
function caCardViewOwn(card){ return card && card.sheet ? 'lyrics' : card && card.chordGrid ? 'chords' : 'tab'; }
// The card the views belong to: the recording shown, with that recording's own views (RECORDINGS), else the card.
function caCardViewHost(a){
  if(!a || !a.card) return null;
  const rec = typeof caRecordingMode === 'function' ? caRecordingMode(a) : null;
  const rv = rec && rec !== a.recording && a.recordingVersions ? a.recordingVersions[rec] : null;
  return rv ? { ...a.card, ...(rv.card || {}), otherViews: rv.card ? rv.card.otherViews : undefined } : a.card;
}
function caHasCardViews(a){
  const c = a && a.view === 'card' ? caCardViewHost(a) : null;
  return !!(c && c.otherViews && typeof c.otherViews === 'object' && Object.keys(c.otherViews).length);
}
// The views the switch offers, in its order: the card's own and every other view it lists.
function caCardViewList(a){
  if(!caHasCardViews(a)) return [];
  const host = caCardViewHost(a), own = caCardViewOwn(host);
  return CA_CARD_VIEW_NAMES.filter(n => n === own || Object.prototype.hasOwnProperty.call(host.otherViews, n));
}
// The view to draw: the stored choice when this card has it, else the card's own.
function caCardViewMode(a){
  const list = caCardViewList(a);
  if(!list.length) return null;
  const v = caCardViewModes[a.id];
  return list.includes(v) ? v : caCardViewOwn(caCardViewHost(a));
}
// The view caView() lays over the card, or null for the card's own (nothing to do).
function caCardViewPick(a){
  const v = caCardViewMode(a);
  return v && v !== caCardViewOwn(caCardViewHost(a)) ? v : null;
}
// The card as `name` draws it: its display fields dropped, the view's put in (chordGrid on for chords).
function caCardViewCard(card, name){
  const v = card.otherViews[name] || {};
  const out = {};
  Object.keys(card).forEach(k => { if(!CA_CARD_VIEW_FIELDS.includes(k)) out[k] = card[k]; });
  CA_CARD_VIEW_FIELDS.forEach(k => { if(k in v) out[k] = v[k]; });
  if(!out.sections) out.sections = card.sections;
  if(name === 'chords') out.chordGrid = true;
  return out;
}
/* The switch: one button per view, the shown one pressed, the same look and keys as the Full / Power switch. The
   raw activity is read by id (`a` may be the caView copy). */
function caViewSwitchHtml(a){
  const raw = a && (window.CLASS_ACTIVITIES || []).find(x => x.id === a.id);
  const list = caCardViewList(raw);
  if(list.length < 2) return '';
  const cur = caCardViewMode(raw);
  return `<div class="ca-chord-switch ca-view-switch" role="group" aria-label="${escAttr(t('ca.viewSwitch'))}">`
    + caSwitchLabelHtml(raw, 'ca.viewSwitch')
    + list.map(n => `<button type="button" class="snip-toggle${n === cur ? ' on' : ''}" aria-pressed="${n === cur ? 'true' : 'false'}" data-view="${n}" onclick="caSetCardView(${jsonAttrArg(raw.id)},${jsonAttrArg(n)},this)">${escHtml(t(CA_CARD_VIEW_LABELS[n]))}</button>`).join('')
    + `</div>`;
}
/* The visible name before a row of buttons, on a card with both switches (RECORDINGS): "Recording" and "Show the
   song as" tell the two rows apart. aria-hidden: the group's own aria-label says the same. Nothing on any other card.
   Read from the raw activity by id: `a` may be the caView copy, whose card is the view's (no chordGrid in Tab). */
function caSwitchLabelHtml(a, key){
  const raw = a && ((window.CLASS_ACTIVITIES || []).find(x => x.id === a.id) || a);
  const both = typeof caHasRecordingVersions === 'function' && caHasRecordingVersions(raw) && caCardViewList(raw).length > 1;
  return both ? `<span class="ca-switch-label" aria-hidden="true">${escHtml(t(key))}</span>` : '';
}
function caCardViewSave(){ try { localStorage.setItem(CA_CARD_VIEWS_KEY, JSON.stringify(caCardViewModes)); } catch(e) {} }
/* A recording press (caSetRecordingMode, after the new recording is stored): every card of the song keeps its stored
   view where that recording has it, else goes back to its own (Chords on ca-29: Neil has no Lyrics). */
function caCardViewsFollowRecording(group){
  let changed = false;
  (window.CLASS_ACTIVITIES || []).forEach(a => {
    if(!a || a.recordingGroup !== group || !Object.prototype.hasOwnProperty.call(caCardViewModes, a.id)) return;
    if(!caCardViewList(a).includes(caCardViewModes[a.id])){ delete caCardViewModes[a.id]; changed = true; }
  });
  if(changed) caCardViewSave();
}
/* A press: remember it, then swap the view in place on every copy of the card on the page (`btn`'s first). */
function caSetCardView(id, name, btn){
  const raw = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(!raw || !caCardViewList(raw).includes(name)) return;
  const had = caCardViewMode(raw);
  caCardViewModes[id] = name;          // stored either way, like the chord switch
  caCardViewSave();
  if(had === name) return;
  const mine = btn && btn.closest ? btn.closest('.pc') : null;
  const roots = Array.from(document.querySelectorAll('.pc')).filter(r => r.dataset.id === id);
  if(mine && !roots.includes(mine)) roots.unshift(mine);
  roots.forEach(root => caCardViewSwap(root, raw, name, root === mine && document.activeElement === btn));
  if(typeof pcSheetScan === 'function') pcSheetScan();   // a sheet left the page: let its observer go; a sheet came: draw it
  if(mine && name !== 'lyrics') caCardViewReveal(mine);
}
/* After a press into Chords or Tab, the card's top back on screen (Jonathan, 2026-11-18, W23 question 4: "scroll back
   to the card's top"). A lyric sheet is a long column that the song scrolls down the page; swapped for a short tab,
   the page kept its place, so the switch row and the section playing were above the screen. The card's top goes
   under the In class page's sticky bar, as caScrollToActivity puts an opening card (the bar measured, not guessed),
   and only when it is above it. A jump, not a smooth scroll: the playing card's next frame keeps its row on screen
   (pcFollow, st.row was forgotten) and a smooth scroll still moving would fight it. A press into Lyrics is left to
   the sheet: it brings the line being played on screen itself (pcSheetStarted / pcSheetFollow). */
function caCardViewReveal(root){
  if(!root || !root.isConnected || typeof root.scrollIntoView !== 'function') return;
  const screen = root.closest('.ca-screen');
  const bar = screen ? screen.querySelector('.page-topbar') : null;
  const sticky = bar && bar.offsetHeight && getComputedStyle(bar).position === 'sticky';
  const under = sticky ? bar.getBoundingClientRect().bottom : 0;
  if(root.getBoundingClientRect().top >= under - 1) return;   // on screen already: leave the page where it is
  const card = root.closest('.ca-card') || root;   // the open card's own top, where caScrollToActivity puts it
  card.style.scrollMarginTop = sticky ? bar.offsetHeight + 'px' : '';
  card.scrollIntoView({ behavior: 'auto', block: 'start' });
}
function caCardViewSwap(root, raw, name, refocus){
  const view = caView(raw);
  const L = pcLayout(view);
  if(!L) return;
  const tmp = document.createElement('div');
  tmp.innerHTML = caCardBodyHtml(view, { preview: root.dataset.preview === '1' });
  const fresh = tmp.querySelector('.pc');
  if(!fresh) return;
  const body = el => el.querySelector(':scope > .pc-tab, :scope > .pc-sheet');
  const oldBody = body(root), newBody = body(fresh);
  if(!oldBody || !newBody) return;
  // The page the student was looking at (stopped), and what the status line says ("Playing from …", a count-in).
  const pages = Array.from(oldBody.querySelectorAll('.pc-sec'));
  const curSec = Math.max(0, pages.findIndex(b => b.classList.contains('cur')));
  const oldStatus = oldBody.querySelector('.pc-status');
  const status = oldStatus ? oldStatus.innerHTML : '';
  [':scope > .ca-view-switch', ':scope > .pc-dir'].forEach(sel => {
    const o = root.querySelector(sel), n = fresh.querySelector(sel);
    if(o && n) o.replaceWith(n);
  });
  oldBody.replaceWith(newBody);
  const ns = newBody.querySelector('.pc-status');
  if(ns) ns.innerHTML = status;
  // Loop this part / Build up speed / Stay: the flags live on the card, the switches were just drawn off.
  ['loop', 'build', 'hold'].forEach(f => { if(pcLoopFlag(root, f)) pcLoopSet(root, f, true); });
  const st = pcState && pcState.root === root ? pcState : null;
  if(st){
    st.L = L;
    st.sheet = !!view.card.sheet && typeof pcSheetHtml === 'function';   /* app/cards-sheet.js (W24 R1-1) */
    // Forget what was painted in the old view: the next frame lights the same beat in this one.
    st.si = -1; st.seq = -1; st.rep = -1; st.beat = -1; st.key = ''; st.row = null; st.stripKey = null;
    st.sheetLine = null; st.sheetLit = null; st.sheetAim = null; st.sheetTop = null;   // as pcRefollow: the next frame follows again
    if(st.counting){
      // The count-in: show the section it counts in to, as pcStart did.
      pcShowSection(root, L, st.loopFrom);
      if(st.sheet) pcSheetStarted(st);
      else pcFollow(root.querySelector('.pc-tab .pc-page:not([hidden]) .tab-grid'), true);
    } else if(st.sheet) pcSheetStickyTop(root);
  } else {
    const si = Math.min(curSec, L.sections.length - 1);
    pcShowSection(root, L, si);
    // Stopped, into Lyrics: the sheet's sticky line names the section the card was on (W23 R2-3; it read the first).
    const where = root.querySelector('.pc-sheet-where');
    if(where && typeof pcSheetWhere === 'function') where.textContent = pcSheetWhere(L, si, 0);
  }
  if(refocus){ const b = root.querySelector(`.ca-view-switch [data-view="${name}"]`); if(b) b.focus({ preventScroll: true }); }
}
