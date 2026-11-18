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
                 lyric sheet draws when its PDF is read (pcSheetScan), then marks where the song is.
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
function caHasCardViews(a){ return !!(a && a.view === 'card' && a.card && a.card.otherViews && typeof a.card.otherViews === 'object' && Object.keys(a.card.otherViews).length); }
// The views the switch offers, in its order: the card's own and every other view it lists.
function caCardViewList(a){
  if(!caHasCardViews(a)) return [];
  const own = caCardViewOwn(a.card);
  return CA_CARD_VIEW_NAMES.filter(n => n === own || Object.prototype.hasOwnProperty.call(a.card.otherViews, n));
}
// The view to draw: the stored choice when this card has it, else the card's own.
function caCardViewMode(a){
  const list = caCardViewList(a);
  if(!list.length) return null;
  const v = caCardViewModes[a.id];
  return list.includes(v) ? v : caCardViewOwn(a.card);
}
// The view caView() lays over the card, or null for the card's own (nothing to do).
function caCardViewPick(a){
  const v = caCardViewMode(a);
  return v && v !== caCardViewOwn(a.card) ? v : null;
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
    + list.map(n => `<button type="button" class="snip-toggle${n === cur ? ' on' : ''}" aria-pressed="${n === cur ? 'true' : 'false'}" data-view="${n}" onclick="caSetCardView(${jsonAttrArg(raw.id)},${jsonAttrArg(n)},this)">${escHtml(t(CA_CARD_VIEW_LABELS[n]))}</button>`).join('')
    + `</div>`;
}
/* A press: remember it, then swap the view in place on every copy of the card on the page (`btn`'s first). */
function caSetCardView(id, name, btn){
  const raw = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(!raw || !caCardViewList(raw).includes(name)) return;
  const had = caCardViewMode(raw);
  caCardViewModes[id] = name;          // stored either way, like the chord switch
  try { localStorage.setItem(CA_CARD_VIEWS_KEY, JSON.stringify(caCardViewModes)); } catch(e) {}
  if(had === name) return;
  const mine = btn && btn.closest ? btn.closest('.pc') : null;
  const roots = Array.from(document.querySelectorAll('.pc')).filter(r => r.dataset.id === id);
  if(mine && !roots.includes(mine)) roots.unshift(mine);
  roots.forEach(root => caCardViewSwap(root, raw, name, root === mine && document.activeElement === btn));
  if(typeof pcSheetScan === 'function') pcSheetScan();   // a sheet left the page: let its observer go; a sheet came: draw it
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
  } else pcShowSection(root, L, Math.min(curSec, L.sections.length - 1));
  if(refocus){ const b = root.querySelector(`.ca-view-switch [data-view="${name}"]`); if(b) b.focus({ preventScroll: true }); }
}
