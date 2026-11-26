/* ══ MEMORY FADE — a play-along whose chord names leave, time by time (Jonathan, 2026-11-26; ca-56) ══════════════
   A practice card with `card.fade` ({ passes: N }, 2 to 8, default FADE_PASSES) on a chord grid. Play plays the card's
   sections with the record on a loop (the card's own lap: THE SPARE in app/cards.js, ONE time through = every
   section in order, all their reps; the card draws no section buttons); after each time through more chord names are hidden, until the last time through shows
   none, and after the last the song stops by itself. Nothing here plays, times or loops anything: the player does,
   and this part only says which names show.
     WHICH NAMES     the chord CHANGES of the card, in drawing order (a chord still ringing at a row start shares its
                     change's data-seq, so it shows and hides with it): on time p of N (1-based) change i shows when
                     p < N and i is a multiple of 2^(p-1). Four times through the verse (D5 C5 G5 D5): all four, then
                     D5 and G5, then D5, then none.
     A HIDDEN NAME   keeps its box (the same size, no jump): the name button gets .fade-hid (styles.css: blank, a
                     faint box), aria-hidden and no tab stop; the frets of that chord (the .tab-fret in each .tab-cell
                     carrying its data-seq) are blanked too, or the shape would give the name away. The cells, the
                     cursor (.beat-now on the data-beat cells) and the count row are never touched.
     SHOW IT         brings every name back for the rest of this time through (no penalty, nothing saved); the next
                     time through hides again. Off while nothing is hidden (time 1).
     THE COUNTER     "Time 2 of 4" in the bar under the player (.fade-bar); after the last time through it says the
                     student played it from memory. Play then starts again at time 1; Play after a Stop goes on at
                     the time the student was on.
   The state is the bar's data-pass / data-show / data-done: a redraw, or closing the card (pcLoopReset ->
   fadeReset), starts at time 1. Nothing is stored (no progress write, no localStorage). The player calls in through
   four hooks, each guarded with typeof: pcStart -> fadeStarted (the loop on, or the last time through stopping at
   the end), pcLoopLapDone -> fadeLapDone (app/cards-loop.js), pcFrame's end -> fadeSongEnd, pcLoopReset -> fadeReset.
   Nothing is started here, so nothing has to be stopped. checks.mjs 1fm; tools/playalong-loop.mjs walks it (R18). */
const FADE_PASSES = 4;
// The card's number of times through, or 0 (not a fade card).
function fadePassesOf(c){
  const f = c && c.fade;
  if(!f) return 0;
  const n = f.passes === undefined ? FADE_PASSES : f.passes;
  return Number.isInteger(n) && n >= 2 && n <= 8 ? n : 0;
}
// Change i (0-based) shows on time p of n.
function fadeKept(i, p, n){ return p < n && i % Math.pow(2, p - 1) === 0; }
/* The bar under the player: the counter and Show it. '' on any other card. */
function fadeBarHtml(a, preview){
  const n = fadePassesOf(a && a.card);
  if(!n) return '';
  return `<div class="fade-bar" data-pass="1" data-passes="${n}" data-show="" data-done="">`
    + `<span class="fade-pass" aria-live="polite">${escHtml(t('fade.pass', {n: 1, total: n}))}</span>`
    + `<button type="button" class="fade-show" aria-pressed="false" title="${escAttr(t('fade.showTitle'))}" disabled onclick="fadeShowIt(this)">${escHtml(t('fade.show'))}</button>`
    + `</div>`;
}
function fadeBar(root){ return root ? root.querySelector('.fade-bar') : null; }
// The directions line's own key and count (caCardBodyHtml reads it before any other).
function fadeDirections(a){ const n = fadePassesOf(a && a.card); return n ? t('ca.fadeDirections', {n}) : ''; }
/* Draw the bar's state onto the chart: which names and frets are blank, the counter, Show it. */
function fadeApply(root){
  const bar = fadeBar(root);
  if(!bar) return;
  const n = parseInt(bar.dataset.passes, 10) || FADE_PASSES;
  const p = Math.max(1, Math.min(n, parseInt(bar.dataset.pass, 10) || 1));
  const show = bar.dataset.show === '1', done = bar.dataset.done === '1';
  const order = [];
  root.querySelectorAll('.pc-tab .tab-chord-btn').forEach(b => { const s = b.dataset.seq; if(!order.includes(s)) order.push(s); });
  order.forEach((s, i) => {
    const hide = !show && !fadeKept(i, p, n);
    root.querySelectorAll(`.pc-tab .tab-chord-btn[data-seq="${s}"]`).forEach(b => {
      b.classList.toggle('fade-hid', hide);
      if(hide){ b.setAttribute('aria-hidden', 'true'); b.setAttribute('tabindex', '-1'); } else { b.removeAttribute('aria-hidden'); b.removeAttribute('tabindex'); }
    });
    root.querySelectorAll(`.pc-tab .tab-cell[data-seq="${s}"] .tab-fret`).forEach(f => f.classList.toggle('fade-hid', hide));
  });
  const txt = bar.querySelector('.fade-pass');
  if(txt) txt.textContent = done ? t('fade.done') : t('fade.pass', {n: p, total: n});
  bar.classList.toggle('fade-done', done);
  const btn = bar.querySelector('.fade-show');
  if(btn){
    btn.setAttribute('aria-pressed', show ? 'true' : 'false');
    btn.disabled = !order.some((s, i) => !fadeKept(i, p, n));   // nothing hidden on this time through: nothing to show
  }
}
/* pcStart, right after the player's state is made: the loop is on, or, on the last time through, off so the song
   stops at the end of the card (the whole-song stop in pcFrame). After a finished run Play starts at time 1. */
function fadeStarted(st){
  const bar = fadeBar(st && st.root);
  if(!bar) return;
  if(bar.dataset.done === '1'){ bar.dataset.pass = '1'; bar.dataset.done = ''; bar.dataset.show = ''; }
  const n = parseInt(bar.dataset.passes, 10) || FADE_PASSES, p = parseInt(bar.dataset.pass, 10) || 1;
  st.loopTo = st.L.sections.length - 1;   // one time through is every section of the card, in order
  if(p < n){ st.loopSi = st.loopFrom; st.wholeSong = false; }
  else { st.loopSi = -1; st.wholeSong = true; }
  fadeApply(st.root);
}
/* pcLoopLapDone: one time through is over. The next time hides more; the last one stops at its end. */
function fadeLapDone(st){
  const bar = fadeBar(st && st.root);
  if(!bar) return;
  const n = parseInt(bar.dataset.passes, 10) || FADE_PASSES;
  const p = Math.min(n, (parseInt(bar.dataset.pass, 10) || 1) + 1);
  bar.dataset.pass = String(p);
  bar.dataset.show = '';
  if(p >= n){
    st.loopSi = -1; st.wholeSong = true;   // this time through is the last: no spare, the song stops at the end
    pcStatus(st.root, escHtml(t('ca.cardPlayingFrom', {section: tf(st.L.sections[st.loopFrom].s, 'label')})));
  }
  fadeApply(st.root);
}
/* pcFrame, at the end of the last time through (after pcStop): say it is done. true = handled. */
function fadeSongEnd(st){
  const bar = fadeBar(st && st.root);
  if(!bar) return false;
  bar.dataset.done = '1';
  bar.dataset.show = '';
  fadeApply(st.root);
  return true;
}
// Show it: every name back until the next time through; a second press hides them again.
function fadeShowIt(btn){
  const root = btn.closest('.pc'), bar = fadeBar(root);
  if(!bar) return;
  bar.dataset.show = bar.dataset.show === '1' ? '' : '1';
  fadeApply(root);
}
// pcLoopReset (a card closing): back to time 1.
function fadeReset(root){
  const bar = fadeBar(root);
  if(!bar) return;
  bar.dataset.pass = '1'; bar.dataset.show = ''; bar.dataset.done = '';
  fadeApply(root);
}
