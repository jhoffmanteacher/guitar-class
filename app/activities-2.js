/* ── Exit checks (class activity, kind:'check') ─────────────────────────
   Five short auto-graded questions, one try, and the result is the
   student's turn-in for the period: it lands on
   progress/{uid}.exitChecks[id] and also sets classActivities[id] = true,
   so the console's existing Done count and the unfinished-activities
   reminder both keep working without knowing checks exist.

   ONE body renderer, deliberately. caCheckBodyHtml() draws the card for
   the student AND for the teacher console's preview
   (renderTeacherCheckDetail in teacher.js passes { preview:true }). The
   two-renderers rule in CLAUDE.md exists because a step FIELD wired into
   caStepHtml() is invisible in the teacher's copy — a whole new card has
   no such split to fall into, and forking it would just recreate the bug
   the rule is there to prevent. The only preview differences are the ones
   that can't work otherwise: its own bpm key namespace, a "not saved"
   note, and ecSubmit writing to memory instead of Firestore (the same
   IS_TEACHER_MODE bail sdSaveBest/dkSaveBest make — previewing isn't
   turning in).

   Run state is in-memory only (unlike caStepDone, which is saved to
   progress): a reload mid-check starts it over. That is the honest behaviour for a one-try assessment — a
   half-finished run is not a score, and persisting one would mean deciding
   what a resumed attempt counts as. */
let ecRuns = {};          // id -> { i, picks } while a check is being taken
let ecViewOpts = {};      // id -> the render opts that card was started with
let ecPreviewResult = {}; // id -> a teacher-preview result; never persisted
function ecActivity(id){ return (window.CLASS_ACTIVITIES || []).find(x => x.id === id); }
function ecBodyId(opts){ return (opts && opts.preview) ? 'ec-preview-body-' : 'ec-body-'; }
function ecItems(a){ return (a && a.check && a.check.items) || []; }
/* "fret 5 · A", or "open · E" — the label on a choice chip and on both
   halves of a wrong-answer line, so a student reads the same words back. */
function ecChipLabel(fret, note){
  return Number(fret) === 0 ? t('check.choiceOpen', {note}) : t('check.choiceFret', {fret, note});
}
function ecChipI18n(fret, note){
  const key = Number(fret) === 0 ? 'check.choiceOpen' : 'check.choiceFret';
  const params = Number(fret) === 0 ? {note} : {fret, note};
  return ` data-i18n="${key}" data-i18n-params='${escAttr(JSON.stringify(params))}'`;
}
/* Grades a full set of picks. Picks are LANGUAGE-STABLE strings — the fret
   number for nextNote, the note letter for noteName — so a student who
   answers in Spanish and reloads in English still reads the same result. */
function ecGrade(a, picks){
  const type = (a.check || {}).type;
  const items = ecItems(a);
  picks = picks || [];
  let score = 0;
  const rows = items.map((item, i) => {
    const pick = picks[i] === undefined || picks[i] === null ? '' : String(picks[i]);
    const ok = type === 'nextNote'
      ? pick === String(item.answer.fret)
      : pick === item.answer;
    if(ok) score++;
    return { item, i, pick, ok };
  });
  return { score, total: items.length, rows };
}
/* The choice row. nextNote chips are shuffled by mcOrder; noteName's seven
   naturals stay in alphabetical order, the same tap-the-name row the
   shuffle drill uses — an alphabet is a lookup, and shuffling it would
   just cost reading time on every question.

   The shuffle is seeded on the FRET+NOTE pairs, never on the rendered chip
   labels: "fret 5 · A" and "traste 5 · A" would otherwise seed differently
   and deal the same student a different order in each language. */
function ecChoicesHtml(a, item, id){
  const type = (a.check || {}).type;
  const btn = (pick, inner, attrs) =>
    `<button type="button" class="step-mc-opt" data-pick="${escAttr(pick)}" onclick="ecPick('${escAttr(id)}', this)">`
    + `<span class="step-mc-text"${attrs || ''}>${inner}</span></button>`;
  let opts;
  if(type === 'nextNote'){
    const choices = item.choices || [];
    const keys = choices.map(c => `${c.fret}·${c.note}`);
    opts = mcOrder(keys, mcSeed({prompt: item.label || '', choices: keys})).map(ci => {
      const c = choices[ci];
      return btn(String(c.fret), escHtml(ecChipLabel(c.fret, c.note)), ecChipI18n(c.fret, c.note));
    }).join('');
  } else {
    opts = SD_NATURALS.map(n => btn(n, escHtml(n))).join('');
  }
  return `<div class="step-resp-mc step-mc-keyed ec-choices">${opts}</div>`;
}
/* The played notes as a tab (fret numbers, note names, per-column play
   buttons, the ▶ button and the beat cursor) — buildTab already does all of
   that, so a check gets the same player the lesson tabs use. The label
   heads the tab card rather than being printed twice above it: it is the
   only thing distinguishing two items that play the same four notes. */
function ecStimulusHtml(a, item, i, opts){
  const c = a.check || {};
  if(c.type === 'nextNote'){
    return buildTab(
      { caption: tf(item, 'label'), notes: item.notes || [], bpm: c.bpm || 80, noCoach: true },
      { keyPrefix: `bpm:${(opts && opts.keyPrefix) || 'ca'}:${a.id}:${i}:tab`, suppressCoach: true });
  }
  const kind = c.string || 'lowE';
  const midi = SD_OPEN_MIDI[kind] + item.fret;
  /* Drawn at runtime, not shipped as an img/ file: one board per fret would
     be a dozen near-identical assets for sw.js to precache. theme:'web'
     (the site's light-mode hex) + the dark-mode invert in styles.css is the
     same treatment every generated ca-*.svg already gets — the diagram's
     fretted-note circle is a hardcoded light green, so leaving it on CSS
     variables would put light text on a light circle in dark mode. px:1
     stamps width/height, which reserves the box before layout settles. */
  const svg = (typeof localStringNotesSvg === 'function')
    ? (localStringNotesSvg(kind, [[item.fret, '?']], {theme: 'web', px: 1}) || '') : '';
  return `<span class="step-figure ec-figure">${svg}</span>`
    + `<button type="button" class="tab-note-btn ec-play" data-midis="[${Number(midi)}]" onclick="playBeat(this)">`
    + `<span data-i18n="check.playNote">${escHtml(t('check.playNote'))}</span></button>`;
}
/* One of three states: a run in progress, a finished result, or the
   not-started front page. A run outranks a result so a retake shows the
   question rather than the score it is replacing. */
function caCheckBodyHtml(a, opts){
  opts = opts || {};
  const preview = !!opts.preview;
  const items = ecItems(a);
  const introHtml = `<p class="coach-tip">${escHtml(tf(a, 'intro'))}</p>`;
  const run = ecRuns[a.id];
  const res = preview ? ecPreviewResult[a.id] : exitChecks[a.id];

  if(run){
    const i = Math.min(run.i, items.length - 1);
    const item = items[i];
    const promptKey = (a.check || {}).type === 'nextNote' ? 'check.whatNext' : 'check.whatNote';
    const qParams = {n: i + 1, total: items.length};
    return introHtml
      + `<div class="ec-q" tabindex="-1" aria-live="polite" data-i18n="check.q" data-i18n-params='${escAttr(JSON.stringify(qParams))}'>${escHtml(t('check.q', qParams))}</div>`
      + ecStimulusHtml(a, item, i, opts)
      + `<div class="ec-prompt" data-i18n="${promptKey}">${escHtml(t(promptKey))}</div>`
      + ecChoicesHtml(a, item, a.id);
  }

  if(res){
    const g = ecGrade(a, res.picks);
    const sParams = {score: res.score, total: res.total};
    const rowsHtml = g.rows.map(r => {
      const item = r.item;
      let head, answerLabel, pickLabel;
      if((a.check || {}).type === 'nextNote'){
        const frets = (item.notes || []).map(n => n.fret).join(' ');
        head = `${tf(item, 'label')} — ${frets} → ?`;
        answerLabel = ecChipLabel(item.answer.fret, item.answer.note);
        const pc = (item.choices || []).find(c => String(c.fret) === r.pick);
        pickLabel = pc ? ecChipLabel(pc.fret, pc.note) : r.pick;
      } else {
        head = ecChipLabel(item.fret, item.answer);
        answerLabel = item.answer;
        pickLabel = r.pick;
      }
      const verdict = r.ok
        ? `<span class="ec-ok">✓ ${escHtml(t('check.right'))}</span>`
        : `<span class="ec-bad">✗ ${escHtml(t('check.wrong', {pick: pickLabel, answer: answerLabel}))}</span>`;
      return `<div class="ec-result-row"><span class="ec-result-q">${escHtml(head)}</span>${verdict}</div>`;
    }).join('');
    // notSaved is stamped in memory by ecSubmit and never reaches Firestore
    // (LOAD_DEPENDENT_SAVE_KEYS holds the whole map back when the load failed),
    // so it can only ever be true for the session that hit the failure.
    const stamp = res.notSaved
      ? `<p class="ec-notsaved" data-i18n="check.notSaved">${escHtml(t('check.notSaved'))}</p>`
      : `<span class="ca-chip">${escHtml(t('check.turnedIn'))}${res.at ? ` · ${escHtml(caFormatDate(res.at))}` : ''}</span>`;
    const again = (a.check || {}).retake
      ? `<button type="button" class="ca-mark-btn" onclick="ecRetake('${escAttr(a.id)}', ${preview ? 'true' : 'false'})"><span data-i18n="check.retake">${escHtml(t('check.retake'))}</span></button>`
      : '';
    return introHtml
      + `<p class="ec-score" tabindex="-1" data-i18n="check.score" data-i18n-params='${escAttr(JSON.stringify(sParams))}'>${escHtml(t('check.score', sParams))}</p>`
      + stamp + `<div class="ec-results">${rowsHtml}</div>` + again;
  }

  const rule = (a.check || {}).retake ? 'check.retakeOk' : 'check.oneTry';
  return introHtml
    + (preview ? `<p class="ec-preview-note">${escHtml(t('check.previewNote'))}</p>` : '')
    + `<p class="ec-rule" data-i18n="${rule}">${escHtml(t(rule))}</p>`
    + `<button type="button" class="ca-mark-btn" onclick="ecStart('${escAttr(a.id)}', ${preview ? 'true' : 'false'})"><span data-i18n="check.start">${escHtml(t('check.start'))}</span></button>`;
}
/* The check's own card — the ordinary .ca-card shell minus the two things a
   check has no use for: the print button (a quiz on paper can't be graded
   by the site) and Mark complete (submitting IS completing it). */
function caCheckCardHtml(a, chipIso){
  const done = classActivities[a.id] === true;
  const open = caOpenId === a.id;
  // `chipIso`: see caActivityCardHtml.
  const dateLabel = caFormatDate(typeof chipIso === 'string' ? chipIso : caDate(a));
  return `<details class="ca-card ec-card${caQuietOptional(a, done) ? ' ca-card--optional' : ''}" ${open ? 'open' : ''} data-id="${escAttr(a.id)}" ontoggle="caOnToggle(this)">
    <summary class="ca-card-summary" onclick="caCardMarkOpening(this)">
      ${dateLabel ? `<span class="ca-chip">${escHtml(dateLabel)}</span>` : ''}
      <span class="ca-card-titlewrap"><span class="ca-card-title" role="heading" aria-level="3"><span data-i18n="check.prefix">${escHtml(t('check.prefix'))}</span> &middot; ${escHtml(caTitle(a))}</span>${caCheckMetaHtml(a)}</span>
      ${done ? `<span class="ca-done-mark" aria-hidden="true">${TCK_CHECK_SVG_INLINE}</span>` : ''}
    </summary>
    <div class="ca-card-body" id="ec-body-${escAttr(a.id)}">${caCheckBodyHtml(a, {})}</div>
  </details>`;
}
function ecRender(id){
  const a = ecActivity(id);
  if(!a) return;
  const opts = ecViewOpts[id] || {};
  const el = document.getElementById(ecBodyId(opts) + id);
  if(!el) return;
  el.innerHTML = caCheckBodyHtml(a, opts);
  if(typeof applyI18n === 'function') applyI18n(el);
  // When this question's choices appeared — ecPick ignores a tap inside
  // 400 ms of it (the second half of a double tap, see there).
  if(ecRuns[id]) ecRuns[id].shownAt = performance.now();
  ecFocus(id);
}
/* The body was just rewritten under the button that was pressed, so focus
   would drop to <body>. Put it on the question line (tabindex="-1") — or on
   the score once the check is over — without scrolling the page. */
function ecFocus(id){
  const el = document.getElementById(ecBodyId(ecViewOpts[id] || {}) + id);
  const q = el && el.querySelector('.ec-q, .ec-score');
  if(q) q.focus({preventScroll: true});
}
/* Each item sounds once as it appears — the question is "what did you just
   hear", so making them press play first is a step with no teaching in it.
   Safe to click straight away: the Start (or previous choice) click already
   unlocked the AudioContext, and replays stay unlimited. */
function ecAutoPlay(id){
  const el = document.getElementById(ecBodyId(ecViewOpts[id] || {}) + id);
  if(!el) return;
  const btn = el.querySelector('.play-seq-btn') || el.querySelector('.ec-play');
  if(btn) btn.click();
}
function ecStart(id, preview){
  ecViewOpts[id] = preview ? {preview: true, keyPrefix: 'ca-preview'} : {keyPrefix: 'ca'};
  ecRuns[id] = {i: 0, picks: []};
  ecRender(id);
  ecAutoPlay(id);
}
function ecRetake(id, preview){
  const a = ecActivity(id);
  if(!a || !(a.check || {}).retake) return;
  ecStart(id, preview);
}
function ecPick(id, btn){
  const run = ecRuns[id];
  const a = ecActivity(id);
  if(!run || !a) return;
  const items = ecItems(a);
  if(run.picks.length >= items.length) return;   // a double-tap must not consume two questions
  /* …nor answer the NEXT question: the first tap re-renders the row, and on
     a fixed-order row (noteName) the second lands on the same letter there.
     A tap this soon after the row appeared can only be that second tap. */
  if(performance.now() - (run.shownAt || 0) < 400) return;
  run.picks.push(btn.dataset.pick);
  if(typeof stopAllDemoAudio === 'function') stopAllDemoAudio();
  if(run.picks.length < items.length){
    run.i = run.picks.length;
    ecRender(id);
    ecAutoPlay(id);
  } else {
    ecSubmit(id);
    ecFocus(id);   // ecSubmit re-renders the whole page for a student
  }
}
function ecSubmit(id){
  const a = ecActivity(id);
  if(!a) return;
  const run = ecRuns[id];
  const picks = run ? run.picks.slice() : [];
  const g = ecGrade(a, picks);
  delete ecRuns[id];
  const prev = IS_TEACHER_MODE ? ecPreviewResult[id] : exitChecks[id];
  const res = {score: g.score, total: g.total, picks, at: dayStr(new Date()), attempts: ((prev && prev.attempts) || 0) + 1};
  /* Teacher preview: graded and shown, written nowhere. Same exception
     shape (and same reason) as sdSaveBest/dkSaveBest bailing on
     IS_TEACHER_MODE — checking the day's activity before class must not
     file a score on the teacher's own progress doc. */
  if(IS_TEACHER_MODE){ ecPreviewResult[id] = res; ecRender(id); return; }
  exitChecks[id] = res;
  // In memory only: 'exitChecks' is a LOAD_DEPENDENT_SAVE_KEY, so a failed
  // load means the whole map is held back rather than overwriting a score
  // this session never read.
  if(progressLoadFailed) res.notSaved = true;
  saveExitChecks();
  /* The turned-in mark follows the SCORE. 'exitChecks' is a
     LOAD_DEPENDENT_SAVE_KEY so saveExitChecks() above holds the whole map
     back on a failed load, but 'classActivities' is not — and letting that
     one through on its own files a completion with no score behind it:
     the card reads done (caCheckCardHtml reads classActivities) while the
     console's check detail lists the student under "not turned in", and
     because caCheckBodyHtml renders off exitChecks, next session a one-try
     check offers its Start button again to someone who already knows all
     five questions. So hold both or neither — in memory either way, so this
     session still shows the result (stamped check.notSaved above). */
  if(progressLoadFailed){ classActivities[id] = true; classActivitiesDeletes.delete(id); }
  else onClassActivityChange(id, true);
  caOpenId = id;               // keep the card open through the re-render
  renderClassActivities();     // repaints the body AND the summary's done-mark
}
/* Print ONE activity as a handout — the paper version of the circuit, for
   days the Chromebooks or the Wi-Fi fail, or for a sub who wants it on a
   clipboard. Same shape as printRoutine(): a body class scopes the @media
   print rules to the one card, restored on afterprint.

   Three bits of state have to be forced open and put back, because a closed
   <details> and a collapsed step both print nothing: the card itself, the
   step accordion (only one step is ever open on screen — a handout that
   printed just that one would be worse than useless), and — for a finished
   activity — the .ca-finished-group it now lives inside, whose own closed
   state hides everything under it regardless of the card's own `open`.
   afterprint fires on cancel as well as on a real print, so the restore
   runs either way; it's `once` so a second print doesn't stack listeners. */
function printActivity(ev, id){
  // The only 🖨 button is the sticky bar's (caSyncTopbar) since 2026-10-31;
  // it sits outside the card and finds it by id. The preventDefault stays
  // from when a copy lived inside the <summary>, whose default action
  // toggles the card — harmless on a plain button.
  if(ev){ ev.preventDefault(); ev.stopPropagation(); }
  const card = document.querySelector(`.ca-card[data-id="${CSS.escape(id)}"]`);
  if(!card) return;
  const wasOpen = card.open;
  // A card no longer always sits straight in the page (item 2f) — it may be
  // nested one level inside "Still to do" or "Earlier", either of which has
  // to be open too, or a closed <details> renders none of its content for
  // print. The Today hero has neither ancestor, so this is a no-op for it.
  const group = card.closest('.ca-finished-group, .ca-todo-group');
  const groupWasOpen = group ? group.open : null;
  if(group) group.open = true;
  const collapsed = Array.from(card.querySelectorAll('.ca-step.ca-step-collapsed'));
  card.open = true;
  collapsed.forEach(li => li.classList.remove('ca-step-collapsed'));
  card.classList.add('ca-print-target');
  document.body.classList.add('print-activity');
  const done = () => {
    document.body.classList.remove('print-activity');
    card.classList.remove('ca-print-target');
    collapsed.forEach(li => li.classList.add('ca-step-collapsed'));
    card.open = wasOpen;
    if(group) group.open = groupWasOpen;
  };
  window.addEventListener('afterprint', done, { once: true });
  window.print();
}
// The .dp card builder's ✓ glyph, borrowed as a plain inline SVG so this
// renderer doesn't have to pull in station-card CSS classes for one icon.
const TCK_CHECK_SVG_INLINE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:14px;height:14px"><path d="M5 12l5 5L19 7"/></svg>';
function caOnToggle(details){
  /* Closing a Level up's target that sits in its card's slot puts that card
     back, open, where the student left it (caCardLinkHtml). */
  if(!details.open && caSwap && details.dataset.id === caSwap.to && caOpenId === caSwap.to){
    if(pcState && details.contains(pcState.root)) pcStop();
    if(snipState && details.contains(snipState.card)) snipStop();
    songFileCancelWaitIn(details);     // a song still loading in it (SONG FILES)
    const from = caSwap.from;
    caSwap = null;
    caOpenId = from;
    renderClassActivities();
    caScrollToActivity(from);
    return;
  }
  const wasOpenId = caOpenId;
  caOpenId = details.open ? details.dataset.id : (caOpenId === details.dataset.id ? null : caOpenId);
  /* Same gap caCloseOpen closes for "◀ All activities": a Play Along now
     card (caIsPlayAlongOnly) or a pin-only card (caIsPinOnly) is on the page
     only because it is the open card, so closing it by its title has to
     re-render or it sits there, closed, until the next render. The re-render
     detaches the card, so silence it first (stopCardAudio covers the TAB
     player, which the snipStop/pcStop below can't see). */
  if(!details.open && wasOpenId === details.dataset.id){
    const closing = (window.CLASS_ACTIVITIES || []).find(x => x.id === details.dataset.id);
    if(closing && (caIsPlayAlongOnly(closing) || caIsPinOnly(closing))){
      stopCardAudio();
      renderClassActivities();
      return;
    }
  }
  // A closed card's reveal-delay tabs aren't armed at render time (see
  // caArmTabReveals) — start their countdown now that the card is actually open.
  if(details.open) caArmTabReveals(details);
  caSyncTopbar();
  // Closing the card hides a playing snippet's Stop button without stopping
  // the sound — an <audio> element keeps going whether or not anything on
  // screen can reach it. (A step COLLAPSE deliberately doesn't do this: the
  // ladder is a single-open accordion, so opening the next step would cut
  // off the loop the student just started.)
  if(!details.open && snipState && details.contains(snipState.card)) snipStop();
  if(!details.open && pcState && details.contains(pcState.root)) pcStop();
  if(!details.open) pcLoopReset(details);   // Loop this part / Build up speed start off at every opening (app/cards-loop.js)
  if(!details.open) songFileCancelWaitIn(details);     // a song still loading in it (SONG FILES)
  /* A card opened from "Still to do" left its header wherever it already sat
     on the page — under the header, the page title and the Do-now card, as
     low as y≈370 at 1366×657 (2026-09-20). Scroll only on a genuine click:
     `caCardMarkOpening` stamps the flag right before the native toggle, so a
     re-render that merely preserves an already-open card (or printActivity's
     `card.open = true`) never triggers it. */
  if(details.open && details.dataset.caOpening){
    delete details.dataset.caOpening;
    caAutoStartMetro((window.CLASS_ACTIVITIES || []).find(x => x.id === details.dataset.id));
    caScrollToActivity(details.dataset.id);
  }
}
/* The In class page's sticky bar (navigability work order 2026-09-23,
   item 6). The Modules view has had one since 9/19 — module name, "Step n
   of m", the view switch — but an open activity card scrolled its own
   title and progress dots off the top by Step 2. While a card is open the
   bar swaps its "In class" title for that card's name (a button: tap it to
   get back to the card's top) and "n of m done"; closed, the title comes
   back. Net zero height — index.html's #ca-page-title / #ca-bar-open are
   the two halves, styles.css .ca-screen .page-topbar pins the bar. */
function caSyncTopbar(){
  const bar = document.getElementById('ca-bar-open');
  const title = document.getElementById('ca-page-title');
  if(!bar || !title) return;
  const card = caOpenId ? document.querySelector(`.ca-card[open][data-id="${CSS.escape(caOpenId)}"]`) : null;
  const a = card ? (window.CLASS_ACTIVITIES || []).find(x => x.id === caOpenId) : null;
  caSyncHash(a);
  caSyncSolo(a ? card : null);
  if(!a){ bar.hidden = true; bar.innerHTML = ''; title.hidden = false; return; }
  // Same quiet "#16" as the card rows (caNumHtml).
  const nameHtml = (a.kind === 'check' ? escHtml(t('check.prefix') + ' · ') : caNumHtml(caNumber(a))) + escHtml(caTitle(a));
  const keys = caTickKeys(a);   // a practice card's checks, or a ladder's steps
  const doneN = caTickCount(keys);
  const prog = keys.length ? t('ca.barProgress', {done: doneN, total: keys.length}) : '';
  /* A Focus card's step buttons ride in the bar instead of on a row of
     their own above the step (2026-10-10, maximize-the-view): the row cost
     48px of every step, and up here they stay in reach while the student
     scrolls. They already show which steps are done (✓), so they stand in
     for "n of m done". styles.css hides the card's own copy while the card
     is the open one (.ca-solo-card). Every step move re-renders and every
     render ends in this function, so the two copies can't disagree. */
  const steps = caIsFocus(a) && caRoute(a).length > 1 && !caChooserUp(a)
    ? `<div class="ca-bar-steps">${caFocusDotsHtml(a, caFocusIdx(a))}</div>` : '';
  /* The open card's own title row is hidden on screen (styles.css, .ca-solo-
     card), and the Optional tag lives in it — so it rides in the bar too, or
     an open card doesn't say it is optional. The 🖨 button lives ONLY here
     since 2026-10-31 (the collapsed rows dropped theirs). Exit checks carry
     no print button (see caPrintBtnHtml). */
  const optTag = caOptionalTagHtml(a);
  // Tuner / Timer / Metro / Record, Print and Full screen as one unit, so a
  // bar too narrow for one row moves them down TOGETHER, to the right end of
  // the second row (styles.css).
  const tools = caBarFabsHtml() + (a.kind === 'check' ? '' : caPrintBtnHtml(a)) + caFullBtnHtml();
  // The bar is rebuilt on every fullscreenchange (and every render), which
  // would drop keyboard focus from the Full screen or tool button the
  // student just pressed.
  const act = document.activeElement && bar.contains(document.activeElement) ? document.activeElement : null;
  const refocusFull = !!(act && act.classList.contains('ca-bar-full'));
  const refocusTool = act && act.classList.contains('ca-bar-tool') ? act.dataset.tool : '';
  bar.innerHTML = `<button type="button" class="ca-bar-back" onclick="caCloseOpen()">&#x25C0; ${escHtml(t('ca.allActivities'))}</button>`
    + `<button type="button" class="ca-bar-name" onclick="caScrollToActivity('${escAttr(a.id)}')" title="${escAttr(t('ca.barTop'))}" data-i18n-attr="title:ca.barTop">${nameHtml}</button>`
    + optTag
    + (steps || (prog ? `<span class="ca-bar-prog">${escHtml(prog)}</span>` : ''))
    + (caIsCard(a) ? `<button type="button" class="ca-bar-stop" onclick="pcStop()" hidden>&#x25A0; ${escHtml(t('ca.snipStop'))}</button>` : '')
    + (tools ? `<span class="ca-bar-tools">${tools}</span>` : '');
  bar.hidden = false;
  title.hidden = true;
  if(refocusFull){ const b = bar.querySelector('.ca-bar-full'); if(b) b.focus({ preventScroll: true }); }
  if(refocusTool){ const b = bar.querySelector(`.ca-bar-tool[data-tool="${refocusTool}"]`); if(b) b.focus({ preventScroll: true }); }
  pcSyncBarStop();
  caFitBar();
  caPlaceToolPopups();
}
/* One row at 1366×657 (Jonathan, 2026-11-10). The four tool buttons
   (caBarFabsHtml) cost the bar ~150px, and a Focus card with six or seven
   step buttons no longer fit on one row in Spanish, where "Todas las
   actividades" and "Pantalla completa" are the bar's widest words (ca-17,
   ca-21, ca-34, ca-46; ca-34 in English too, with its Optional tag). Only
   when the row would wrap, .ca-bar-tight drops the Full screen WORD — the
   icon stays, and the word stays the button's accessible name, as on a
   phone — and closes the gaps up (styles.css). Measured after every build,
   on resize and when the song's Stop comes and goes, never worked out from
   the data. A phone's bar wraps on purpose (its own rules), so it is left
   alone there. */
function caFitBar(){
  const bar = document.getElementById('ca-bar-open');
  if(!bar) return;
  bar.classList.remove('ca-bar-tight');
  if(bar.hidden || window.matchMedia('(max-width:760px)').matches) return;
  if(caBarRows(bar) > 1) bar.classList.add('ca-bar-tight');
}
// 1 when every item in the bar sits on the first row, 2 when any has
// wrapped below it (0 when the bar is not on screen).
function caBarRows(bar){
  const kids = Array.from(bar.children).filter(k => k.getClientRects().length);
  if(!kids.length) return 0;
  const first = kids[0].getBoundingClientRect();
  return kids.some(k => k.getBoundingClientRect().top >= first.bottom - 1) ? 2 : 1;
}
/* The rail's tools in the open card's bar (Jonathan, 2026-11-10). With a card
   open the left menu folds away (caSyncSolo, body.ca-fold), and the Tuner /
   Timer / Metronome / Recorder dock went with it, so the bar carries four
   round copies of the dock's buttons. Each runs the dock's own
   togglePopup() and opens the dock's own popup: one tuner, one metronome,
   one timer whatever button was pressed. The icons and titles are read off
   the dock buttons in index.html, so the two can't drift. The wrapper's
   .fab-buttons class is what fab-tools.js's click-away listener looks for
   (a click on these must not count as a click outside the popup it just
   opened), and aria-controls is what setFabExpanded() keeps in step. */
const CA_BAR_FABS = [['tuner', 'tools.tuner'], ['timer', 'tools.timer'], ['metro', 'tools.metronome'], ['rec', 'tools.recorder']];
function caBarFabsHtml(){
  return '<span class="fab-buttons ca-bar-fabs">' + CA_BAR_FABS.map(([w, key]) => {
    const dock = document.getElementById('fab-' + w);
    const svg = dock ? dock.querySelector('svg') : null;
    const pop = document.getElementById(w + '-popup');
    const open = !!(pop && pop.classList.contains('open'));
    const live = w === 'rec' && typeof recState !== 'undefined' && recState.fab && recState.fab.recording;
    return `<button type="button" class="ca-bar-tool ca-bar-tool-${w}${live ? ' rec-live' : ''}" data-tool="${w}" onclick="caBarTool(${jsonAttrArg(w)})"`
      + ` aria-controls="${w}-popup" aria-expanded="${open}" title="${escAttr(t(key))}" aria-label="${escAttr(t(key))}"`
      + ` data-i18n-attr="${escAttr(['title', 'aria-label'].map(at => at + ':' + key).join(';'))}">${svg ? svg.outerHTML : ''}</button>`;
  }).join('') + '</span>';
}
function caBarTool(which){
  caPlaceToolPopups();
  togglePopup(which);
}
/* Where an opened tool shows while the rail is folded away: under the bar's
   four tool buttons, its right edge on theirs (styles.css reads the two
   custom properties, under body.ca-fold only). Measured, not worked out:
   full screen zooms the bar (caSyncFullZoom) and a narrow bar wraps. */
function caPlaceToolPopups(){
  const fabs = document.querySelector('#ca-bar-open:not([hidden]) .ca-bar-fabs');
  if(!fabs || !document.body.classList.contains('ca-fold')) return;
  const r = fabs.getBoundingClientRect();
  if(!r.width) return;
  const vw = document.documentElement.clientWidth;
  document.body.style.setProperty('--ca-tool-top', Math.round(r.bottom + 8) + 'px');
  document.body.style.setProperty('--ca-tool-right', Math.max(8, Math.round(vw - r.right)) + 'px');
}
window.addEventListener('resize', () => { caFitBar(); caPlaceToolPopups(); });
/* Full screen for an open activity (Jonathan, 2026-10-10: "maximize the
   view for class activities on chromebook screen"). A Chromebook's browser
   tabs and address bar take 111px of a 768px screen, and the site header
   another 48px, so a student playing from an open card saw 562px of it.
   The button in the sticky bar asks the browser for full screen (the
   Fullscreen API — the same thing the video players do): 721px for the
   activity, and styles.css scales it up to the screen's width (body.ca-full,
   caSyncFullZoom). The site header and the left menu are NOT tied to full
   screen any more: since 2026-11-10 they fold away whenever a card is open
   (body.ca-fold, caSyncSolo — Jonathan: "an open activity should fill the
   page"), because the browser won't enter full screen without a tap.
   "All activities" leaves full screen too (Jonathan, 2026-10-29: it used to
   stay on, so the next card opened full screen); Esc, or the button, leaves
   it. Nothing is saved — a reload starts in the normal window, which is the
   browser's own rule anyway (full screen needs a tap every time); it reopens
   the card folded, at normal size. Hidden where the browser can't do it (an
   iPhone), so the button never does nothing. */
const CA_FULL_ICON_ON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
const CA_FULL_ICON_OFF = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/></svg>';
function caFullscreenNow(){ return !!document.fullscreenElement; }
function caFullBtnHtml(){
  if(!document.fullscreenEnabled || !document.documentElement.requestFullscreen) return '';
  const on = caFullscreenNow();
  const lab = t(on ? 'ca.fullExit' : 'ca.fullEnter');
  // No aria-pressed: the label already flips Enter/Exit, and both together
  // read as "Exit full screen, pressed".
  return `<button type="button" class="ca-bar-full" onclick="caToggleFullscreen()" title="${escAttr(on ? lab : t('ca.fullTitle'))}">`
    + `${on ? CA_FULL_ICON_OFF : CA_FULL_ICON_ON}<span class="ca-bar-full-lab">${escHtml(lab)}</span></button>`;
}
function caToggleFullscreen(){
  try {
    if(caFullscreenNow()){ document.exitFullscreen().catch(() => {}); return; }
    document.documentElement.requestFullscreen({ navigationUI: 'hide' }).catch(() => {});
  } catch(e) { /* an old browser: the button simply does nothing */ }
}
// Esc, the button and the Chromebook's own key all land here. caSyncTopbar
// redraws the button's label; caSyncSolo sets body.ca-full (the zoom).
document.addEventListener('fullscreenchange', () => { caSyncTopbar(); });
/* Full screen also scales the activity up to fill the width (styles.css,
   body.ca-full .main): the 1000px column times page width / 1000, so a
   1366 Chromebook gets ~1.37×. Never below 1×, capped at 2×. Since
   2026-11-13 this zoom sits ON TOP of the big-screen fill (site-fill.js):
   clientWidth reads page pixels there (window width / the fill), so a
   2560×1440 display in full screen is a 1366-wide page, gets the same
   ~1.37× and is then enlarged by the fill (about 1.87): the Chromebook's
   full screen view, bigger. A window wider than 16:9 has a wider page and
   gets a little more, up to the cap. Re-measured on resize because the
   fullscreenchange event can land before the window has finished growing. */
function caSyncFullZoom(){
  const z = document.body.classList.contains('ca-full')
    ? Math.min(2, Math.max(1, document.documentElement.clientWidth / 1000)) : 1;
  document.body.style.setProperty('--ca-zoom', z.toFixed(3));
}
window.addEventListener('resize', caSyncFullZoom);
/* One activity on the page at a time (Jonathan, 2026-09-25). With a card
   open, the Unfinished / Completed groups, module headings, the other cards
   and the resume card used to sit right under it, and students opened them
   by mistake mid-activity. Now an open card is the only thing on the In
   class page: the screen gets .ca-solo, the open card .ca-solo-card and
   every element between it and #class-activities-body .ca-solo-path, and
   styles.css hides everything else (the groups' own summaries included).
   Pure CSS classes on the rendered page — nothing re-renders, no audio is
   touched. "◀ All activities" in the sticky bar (caCloseOpen) or closing
   the card by its title brings the list back. Called from caSyncTopbar,
   which already runs on every card toggle and after every render. */
function caSyncSolo(card){
  const screen = document.getElementById('class-activities-screen');
  const body = document.getElementById('class-activities-body');
  if(!screen || !body) return;
  body.querySelectorAll('.ca-solo-card, .ca-solo-path').forEach(el => el.classList.remove('ca-solo-card', 'ca-solo-path'));
  const on = !!(card && body.contains(card));
  screen.classList.toggle('ca-solo', on);
  /* A card open = the site header and the left menu fold away (Jonathan,
     2026-11-10: "an open activity should fill the page"), full screen or
     not; styles.css body.ca-fold. Full screen on top of that also scales the
     activity up (body.ca-full, caSyncFullZoom), and only then. */
  document.body.classList.toggle('ca-fold', on);
  document.body.classList.toggle('ca-full', on && caFullscreenNow());
  caSyncFullZoom();
  if(!on) return;
  card.classList.add('ca-solo-card');
  for(let el = card.parentElement; el && el !== body; el = el.parentElement) el.classList.add('ca-solo-path');
}
// "◀ All activities": close the open card (caOnToggle clears caOpenId and
// the solo view, and stops a playing snippet) and go back to the top of
// the list. stopCardAudio() for the TAB player, which caOnToggle can't see.
function caCloseOpen(){
  stopCardAudio();
  // Back on the list means back in the normal window (see the Full screen
  // note above caFullscreenNow). fullscreenchange then redraws the bar.
  if(caFullscreenNow()){ try { document.exitFullscreen().catch(() => {}); } catch(e) { /* nothing to leave */ } }
  const card = caOpenId ? document.querySelector(`.ca-card[open][data-id="${CSS.escape(caOpenId)}"]`) : null;
  if(card) card.open = false;
  /* A Level up's card swapped into another card's slot (caSwap) needs the
     list re-rendered to put the `from` card back. caOnToggle would do that,
     but the toggle event fires after this function has already cleared
     caOpenId, so its swap-back test never matches — clear the swap here and
     re-render ourselves (renderClassActivities ends in caSyncTopbar). */
  const hadSwap = !!caSwap;
  /* Same for a "Play Along now" card opened from the Songs page: it is only
     in the list because it is the open card (caIsPlayAlongOnly — it is not
     on In-Class Activities by date), so closing it has to re-render or it
     sits there until the next render. A pinned card that is not on the
     dated list (caIsPinOnly, opened from the Keep practicing row) is the
     same case. */
  const closing = caOpenId ? (window.CLASS_ACTIVITIES || []).find(x => x.id === caOpenId) : null;
  const paOnly = !!(closing && (caIsPlayAlongOnly(closing) || caIsPinOnly(closing)));
  caSwap = null;
  caOpenId = null;
  // caSinceRepaint: a "Since your last visit" group arrived while the card was open (caSinceRepaintNow).
  if(hadSwap || paOnly || caSinceRepaint) renderClassActivities(); else caSyncTopbar();
  scrollPaneTop(false);
}
/* The open card is in the address (navigability round 2, 2026-09-23):
   '#class-activities/ca-20' while a card is open, '#class-activities' when
   none is — the same deep-link shape caFocusActivity already reads, so a
   reload (or Back from another page) reopens the card instead of dropping
   the student on the list. replaceState, keeping history.state (the
   explore depth): opening a card is not a navigation and costs no Back tap.
   lastRoutedHash follows along so the router's repeat guard stays true.
   Only while this page owns the hash — never from a teardown elsewhere. */
function caSyncHash(a){
  if(exploreHashBase(location.hash) !== '#class-activities') return;
  const screen = document.getElementById('class-activities-screen');
  if(!screen || screen.hasAttribute('hidden')) return;
  const want = a ? '#class-activities/' + encodeURIComponent(a.id) : '#class-activities';
  if(location.hash === want) return;
  history.replaceState(history.state, '', location.pathname + location.search + want);
  lastRoutedHash = want;
}
/* `metronome: <bpm>` on an activity (ca-21): opening the card by a tap
   starts the FAB Metro tool at that tempo — only on a genuine click (the
   caOpening flag), never on a re-render or a cold deep link, which has no
   user gesture to start audio with. It is the student's tool from then on:
   their own Start/Stop and slider, and nothing here stops it on close (see
   "Two silencers" in CLAUDE.md). The console preview never calls this. */
function caAutoStartMetro(a){
  const bpm = a && a.metronome;
  const slider = document.getElementById('bpm-slider');
  if(!bpm || !slider || typeof startMetro !== 'function') return;
  slider.value = bpm;
  onBpmSlider(String(bpm));
  // Every metronome card so far (ca-21) is one note per beat in 4/4. The
  // meter is a sticky Metro setting, and 6/8 counts the BIG beats (60 BPM →
  // 180 clicks a minute), so a student who last used 6/8 would get three
  // clicks per note. Put it back to 4/4 first; add a `meter` field if a card
  // ever needs another.
  if(typeof setMetroMeter === 'function' && typeof getMetroMeter === 'function' && getMetroMeter() !== 4) setMetroMeter(4);
  if(!metroRunning) startMetro();
}
// Stamped on the summary's own click, before the native toggle runs, so
// caOnToggle can tell a real click-to-open from a re-render or printActivity
// forcing `.open = true` — see caOnToggle. Closing (details already open) is
// left alone, matching "closing a card does not scroll."
function caCardMarkOpening(summary){
  const details = summary.closest('.ca-card');
  if(details && !details.open) details.dataset.caOpening = '1';
}
// Steps within one activity are a single-open accordion, independent of the
// module-station .dp builder's own step/focus-mode machinery (deliberately —
// see class-activities.js's schema comment). Pure DOM edits, no re-render, so
// a step toggle can't cut off audio playing in a sibling step's TAB player.
function caToggleStepOpen(btn){
  const li = btn.closest('.ca-step');
  const list = li.closest('.ca-steps');
  const willOpen = li.classList.contains('ca-step-collapsed');
  list.querySelectorAll('.ca-step').forEach(other => {
    if(other === li) return;
    other.classList.add('ca-step-collapsed');
    const h = other.querySelector('.ca-step-head');
    if(h) h.setAttribute('aria-expanded', 'false');
  });
  li.classList.toggle('ca-step-collapsed', !willOpen);
  /* Closing the step that is PLAYING hides its own Stop button along with the
     rest of the card, leaving the loop running with nothing on screen to stop
     it. Opening a different step still leaves the loop alone — that is the
     accordion collapsing a sibling, which is the deliberate case the
     caOnToggle comment above describes. */
  if(!willOpen && snipState && li.contains(snipState.card)) snipStop();
  if(!willOpen) songFileCancelWaitIn(li);     // a song still loading in it (SONG FILES)
  btn.setAttribute('aria-expanded', String(willOpen));
  const activityId = list.closest('.ca-card').dataset.id;
  caStepOpen[activityId] = willOpen ? Number(li.dataset.idx) : -1;
}
// Mark this step done, then collapse it and open the next not-done step —
// same "collapse and advance" feel as the module-step checklist, but
// scoped to one flat step list (no sections/focus-mode).
function caMarkStepDone(btn, id, si){
  const key = `${id}:${si}`;
  const nowDone = caStepDone[key] !== true;
  onCaStepChange(key, nowDone);
  const li = btn.closest('.ca-step');
  li.classList.toggle('ca-step-done', nowDone);
  btn.classList.toggle('is-done', nowDone);
  btn.innerHTML = stepDoneHtml(nowDone);
  const status = li.querySelector('.ca-step-status');
  if(status) status.innerHTML = caStepStatusHtml(si + 1, nowDone);
  caSyncTopbar();   // "n of m done" in the sticky bar (item 6)
  if(!nowDone) return;   // unmarking just restores the number/label above
  /* Marking a step done collapses it, so anything still playing would be
     coming out of a step nobody can see — and this path re-renders nothing,
     so neither the snippet nor the tab would stop on its own.
     stopCardAudio(), not stopAllDemoAudio(): this used to take the FAB
     metronome with it, so a student practising to their own click lost it by
     ticking a box (and the ordinary lesson-step done path, onCompleteChange,
     never did that — same gesture, different outcome). */
  stopCardAudio();
  li.classList.add('ca-step-collapsed');
  const head = li.querySelector('.ca-step-head');
  if(head) head.setAttribute('aria-expanded', 'false');
  const list = li.closest('.ca-steps');
  const siblings = [...list.querySelectorAll('.ca-step')];
  const next = siblings.slice(siblings.indexOf(li) + 1).find(s => !s.classList.contains('ca-step-done'));
  caStepOpen[id] = next ? Number(next.dataset.idx) : -1;
  if(next){
    next.classList.remove('ca-step-collapsed');
    const nh = next.querySelector('.ca-step-head');
    if(nh) nh.setAttribute('aria-expanded', 'true');
    next.scrollIntoView({behavior: scrollBehavior(), block: 'nearest'});
  }
}
function caToggleComplete(id){
  // Checks render no Mark-complete button — submitting the quiz is what
  // completes them (ecSubmit). Guarded anyway so a stale handler can't
  // un-mark a turned-in check and desync it from its saved score.
  const a = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(a && a.kind === 'check') return;
  /* Silence whatever the card was playing. renderClassActivities() already
     calls snipStop(), so the backing-track loop was covered — but the TAB
     player is scheduled setTimeouts, not a DOM object, so rebuilding the card
     left its notes sounding out of a card that no longer exists. One call
     covers both, plus chord strums and the ear drill — and deliberately NOT
     the FAB metronome, which the student started and which no card owns. */
  stopCardAudio();
  const isDone = classActivities[id] === true;
  onClassActivityChange(id, !isDone);
  if(isDone){
    caOpenId = id;   // un-marking: keep the card open through the re-render
    renderClassActivities();
    return;
  }
  /* Marking complete (navigability round 2, 2026-09-23): the card used to
     stay open and drop into the Completed fold, with the sticky bar still
     reading "0 of 7 done" and nothing saying what came next. Now it
     closes, the page goes to the top — where Today's activity already
     shows the next thing, or the caught-up card — and a toast says so.
     caOpenId = null also clears the sticky bar and the card's hash. */
  caOpenId = null;
  renderClassActivities();
  scrollPaneTop(true);
  gateToast(t(caStartHereId ? 'ca.doneNextToast' : 'ca.doneAllToast'));
}
// The teacher-console release date for this activity, or null if unset —
// see activityDates in loadClassConfig(). class-activities.js entries carry
// no date field of their own anymore; this is the only place that resolves one.
function caDate(a){ return activityDates[a.id] || null; }
/* Today's date, 'YYYY-MM-DD' on this device's clock — the day the release
   date gate (caIsVisible) and Today's activities (caTodayWindow) both read.
   One function so 1cq can set the day. */
function caTodayStr(){ return dayStr(new Date()); }
/* [today, yesterday] for Today's activities (Jonathan, 2026-11-09, evening:
   cards dated "the current day or the day before"). Yesterday is the
   CALENDAR day before (on a Monday, Sunday), worked out at noon so a
   daylight-saving change can't land it on the wrong day. */
function caTodayWindow(){
  const today = caTodayStr();
  const [y, m, d] = today.split('-').map(Number);
  return [today, dayStr(new Date(y, m - 1, d - 1, 12))];
}
/* The activity's display title, with a teacher rename applied if one is live.
   Renames are typed in the console (teacher.js) and land in
   config/class.activityTitles as { en, base } — see loadClassConfig().

   `base` is the SHIPPED title the rename was typed against, and it's what
   makes a rename a temporary patch instead of a permanent shadow: the
   override only applies while the shipped title still equals `base`. So the
   loop is — Jonathan renames in the console (live immediately, English in
   both languages, which is the honest cost of an instant rename by someone
   who doesn't write Spanish); the next code session folds that name into
   class-activities.js as a proper title/title_es pair; the shipped title now
   differs from `base`, the override silently expires, and Spanish students
   get real Spanish. No cleanup write to Firestore needed, and no way for a
   forgotten override to keep an English name pinned over a translated one.

   `es` is honoured if it's ever set, so a future console field for it (or a
   hand-written doc edit) works without touching this. */
/* A teacher rename (teacher.js Class activities view) wins over the shipped
   title, but only while it still names the SAME shipped card — o.base guards a
   rename left stranded by an edit to class-activities.js.
   The rename is English-only: the console writes {en, base} and has no Spanish
   box, so a Spanish reader sees the English rename rather than the shipped _es
   title. That is the deliberate trade — a teacher renaming a card mid-class
   needs it to say what they typed, in the room's own words — not an oversight.
   There is no o.es to read, so don't add a branch for one without also adding
   the box that would write it.
   Resolved against the RAW activity, whichever one the caller holds: caView()
   swaps in `title_power` in power-chord mode, and the closed card passes the
   view while the sticky bar, pins, search and Songs pass the raw entry — so
   o.base is compared with the shipped title, and the unrenamed title is the
   current view's. Every caller then agrees, in both modes. */
function caTitle(a){
  const raw = (window.CLASS_ACTIVITIES || []).find(x => x.id === a.id) || a;
  const o = activityTitles[raw.id];
  if(o && o.en && o.base === raw.title) return o.en;
  return tf(caView(raw),'title');
}
/* ── The activity board: order, module grouping and the "#N" prefix ──
   config/class.activityBoard (see the global above) is the single source of
   both the order students read their activities in and the number on each
   card. caBoardOrder() takes the whole list rather than one activity because
   the thing being resolved is an ORDER, not a value: it groups the assigned
   activities into sections and hands back positions 1..N across them.

   Returns { sections, number, assigned }:
     sections  [{ module, mod, ids, retiredIds }] — Unsorted (module 0) first
               if it holds anything, then MODULE_MANIFEST order, each section
               only if it holds a card. `mod` is the MODULE_MANIFEST ENTRY
               itself, not a copied name: the caller renders tf(mod,'name')
               (student, EN/ES) or mod.name (console), so the module's display
               title has exactly one home. `ids` are the live cards in board
               order; `retiredIds` the archived/deleted ones in the same
               section, kept separate because they are shown only in the
               console and never numbered.
     number    id -> 1..N over the non-check, non-retired cards in reading
               order. Checks (kind:'check') take no slot — a check dropped
               into the middle of the course must not shove every later
               card's prefix along by one — and neither does a retired one
               (Jonathan, 2026-09-16: the list should read 1,2,3 with no
               gaps, so archiving #4 renumbers the rest down).
     assigned  id -> true for every activity with a board entry, i.e. the
               ones that are actually placed in the course.

   opts.retired is the id -> true set of archived/deleted activities
   (retiredActivityIds here, the two console maps in teacher.js).

   opts.seeded says whether a board has ever been written
   (config/class.activityBoardSeeded). False means the console has not run
   its one-time migration yet, so there is nothing to order by and every
   activity is treated as assigned, in the legacy order below — see
   activityBoardOn for why an empty board is NOT the same question.

   opts.legacyNumbers is the TRANSITIONAL fallback, and the only thing left
   that reads config/class.activityNumbers: until the console writes a board
   for the first time (teacherMigrateActivityBoard), there is nothing to
   order by, so an unseeded board falls back to the shipped `number` with the
   old console overrides applied — which is exactly the order students were
   already reading. Without it, the first load after this shipped would have
   reshuffled every card until the teacher happened to open the console.
   Delete the fallback (and the activityNumbers global with it) once no live
   class is running on an unseeded board.

   Exported plainly (not a closure) because teacher.js calls it too, with the
   config doc it already has in hand instead of this file's student-side
   globals — same split as caTitle/teacherActivityTitle, minus the copy. */
function caBoardOrder(activities, board, opts){
  const o = opts || {};
  const b = board || {};
  const retired = o.retired || {};
  const legacy = o.legacyNumbers || {};
  // Library songs live on the Songs page only (caIsLibraryCard): off the
  // board, unnumbered, and never assigned — even with a leftover board entry.
  const list = (activities || []).filter(a => a && a.id && !caIsLibraryCard(a, o.songLibrary))
    // Teacher-only cards (caIsTeacherSong) are never on the board either, so
    // they can never be assigned, dated, numbered or pinned — until the
    // console moves one to Class activities, which makes it a normal card.
    .filter(a => !caIsTeacherSong(a, o.classSongs));
  const manifest = (typeof MODULE_MANIFEST !== 'undefined') ? MODULE_MANIFEST : [];
  const shipped = a => { const n = Number(a.number); return Number.isFinite(n) ? n : Infinity; };
  // Numeric part of `ca-<n>`, never localeCompare on the id — that orders
  // ca-10 before ca-2.
  const idNum = a => { const m = /^ca-(\d+)$/.exec(String(a.id)); return m ? Number(m[1]) : Infinity; };
  const legacyN = a => {
    const ov = legacy[a.id];
    return (ov && Number.isFinite(Number(ov.n)) && Number(ov.base) === shipped(a)) ? Number(ov.n) : shipped(a);
  };
  const posOf = a => { const e = b[a.id]; const n = e && Number(e.pos); return Number.isFinite(n) ? n : Infinity; };
  const cmp = (x, y) => (posOf(x) - posOf(y)) || (legacyN(x) - legacyN(y)) || (idNum(x) - idNum(y));

  const assigned = {};
  const buckets = new Map();   // module number -> activities
  // Defaulted, not inferred, for callers that genuinely can't know — both
  // real ones (app.js caBoardView, teacher.js's board) pass it explicitly.
  const seeded = (o.seeded === undefined) ? Object.keys(b).length > 0 : !!o.seeded;
  if(seeded){
    list.forEach(a => {
      const e = b[a.id];
      if(!e) return;
      assigned[a.id] = true;
      const mn = Number(e.module) || 0;
      if(!buckets.has(mn)) buckets.set(mn, []);
      buckets.get(mn).push(a);
    });
  } else {
    // Unseeded board — one Unsorted section holding everything, in the order
    // students are reading today. See opts.legacyNumbers above.
    list.forEach(a => { assigned[a.id] = true; });
    buckets.set(0, list.slice());
  }

  const order = [0].concat(manifest.map(m => m.num));
  const sections = [];
  order.forEach(mn => {
    const items = buckets.get(mn);
    if(!items || !items.length) return;
    items.sort(cmp);
    const mod = mn === 0 ? null : manifest.find(m => m.num === mn) || null;
    sections.push({
      module: mn,
      mod,
      ids: items.filter(a => retired[a.id] !== true).map(a => a.id),
      retiredIds: items.filter(a => retired[a.id] === true).map(a => a.id),
    });
  });
  // A module the manifest doesn't know about (a board row left behind by a
  // renumbered manifest) still has to render somewhere rather than vanish —
  // it lands after the known modules, in numeric order.
  [...buckets.keys()].filter(mn => mn !== 0 && !manifest.some(m => m.num === mn)).sort((x, y) => x - y)
    .forEach(mn => {
      const items = buckets.get(mn).sort(cmp);
      sections.push({ module: mn, mod: null,
        ids: items.filter(a => retired[a.id] !== true).map(a => a.id),
        retiredIds: items.filter(a => retired[a.id] === true).map(a => a.id) });
    });

  const byId = {};
  list.forEach(a => { byId[a.id] = a; });
  const number = {};
  let n = 0;
  sections.forEach(sec => sec.ids.forEach(id => {
    if(byId[id] && byId[id].kind === 'check') return;
    number[id] = ++n;
  }));
  return { sections, number, assigned };
}
// Rebuilt only when activityBoard is REPLACED (loadClassConfig assigns a
// fresh object every time, and so does the sign-out reset), not on every
// card — renderClassActivities' comparator alone would otherwise sort the
// whole list once per comparison.
let caBoardCache = null;
function caBoardView(){
  if(!caBoardCache || caBoardCache.src !== activityBoard || caBoardCache.lib !== songLibraryIds || caBoardCache.cs !== classSongIds)
    caBoardCache = { src: activityBoard, lib: songLibraryIds, cs: classSongIds, view: caBoardOrder(window.CLASS_ACTIVITIES || [], activityBoard,
      { retired: retiredActivityIds, legacyNumbers: activityNumbers, seeded: activityBoardOn, songLibrary: songLibraryIds, classSongs: classSongIds }) };
  return caBoardCache.view;
}
function caNumber(a){
  if(a && a.kind === 'check') return 0;   // checks are unnumbered — see caBoardOrder
  return caBoardView().number[a.id] || 0;
}
/* An activity is visible to students once its console-set release date has
   arrived (local calendar day) — "hidden until it happens" by default, so an
   activity with no date set yet (every activity's starting state) or a
   future one doesn't leak to students who click ahead. The teacher-only hide
   toggle (hiddenActivityIds, see loadClassConfig()) is independent and can
   hide/reveal on top of this. Dev-bypass users skip the date gate — the
   whole point of that mode is previewing UI that isn't live yet.

   Archive/Delete (retiredActivityIds) come FIRST and are absolute: unlike
   the date gate they hold for dev bypass too, because a retired activity is
   not "not live yet", it is out of the course — there is nothing left to
   preview. Everything downstream inherits that for free: it drops off
   In-Class Activities (both groups), stops blocking the gate (caBlockers), and a deep
   link to it reads as not-posted (caFocusActivity). */
function caIsVisible(a){
  if(retiredActivityIds[a.id] === true) return false;
  /* Not placed on the console's board = not part of the course yet, so it
     ranks with Archive/Delete rather than with the date gate: an unassigned
     activity has been pushed to the site and nothing more. Held ahead of the
     dev-bypass line for the same reason they are — there is no "not live
     yet" to preview.

     An UNSEEDED board — the console has never written one, activityBoardOn
     is false — is not the same as "nothing is assigned" and must not read
     that way, or the first load after this shipped would empty every
     student's In-Class Activities page. caBoardOrder treats it as everything-assigned and
     this inherits that, same never-lock-on-a-guess rule as the gate itself.
     An emptied board is a different answer and does hide everything. */
  if(!caBoardView().assigned[a.id]) return false;
  if(hiddenActivityIds[a.id] === true) return false;
  if(!caForMe(a)) return false;   // given to other students only
  if(isDevBypassUser()) return true;
  const d = caDate(a);
  return d ? d <= caTodayStr() : false;
}
/* A practice card the Songs page lists although caIsVisible() says no —
   the console's "Play Along now" switch (playAlongActivityIds). The switch
   stands in for the RELEASE DATE and nothing else: the card must still be
   a practice card, placed on the board, not Hidden, not archived or
   deleted. False for a card that is already visible — that one is listed
   anyway and belongs to In-Class Activities as usual — so this answers
   exactly one question: "is this card reachable from Songs ONLY?"
   Deliberately NOT folded into caIsVisible(): that predicate is also the
   gate's (caBlockers) and the In-Class Activities list's, and a Play Along
   card must appear on neither. */
/* Individual activities: config/class.activityStudents (id -> { uid -> true })
   reduced to this student — see activityForMe. A card with no entry is the
   whole class's. Mirrored by teacherActivityForStudent (teacher.js) and
   journeyForStudent (tabs/journey.js); change all three together. */
function caReduceForMe(map, uid){
  const out = {};
  Object.keys(map || {}).forEach(id => {
    const who = map[id];
    if(who && typeof who === 'object' && Object.keys(who).some(k => who[k] === true)) out[id] = who[uid] === true;
  });
  return out;
}
function caForMe(a){ return activityForMe[a.id] !== false; }
/* The song library (Jonathan, 2026-10-20: "a better way to push out songs
   to individual students instead of through class activities page"; he
   picked a library for everyone over a private per-student box). A practice
   card with `library: true` in its data is on the Songs page's "More Play
   Along songs" list for EVERY student, from the day it ships: no board
   slot, no release date, no "Play Along now", and the Who picker does not
   hide it (Jonathan: "i could stop assigning things to individual
   students" — so there is no per-student tag either). Hidden, Archive and Delete still take it off, exactly as everywhere
   else. It never reaches caIsVisible(), so it never blocks, never shows on
   In-Class Activities and takes no #N: caBoardOrder skips library cards,
   so they can't be placed on the board (see caIsLibraryCard). */
/* The data rule alone, no config: is this card a library song at all?
   Never a Core song's card (Jonathan, 2026-10-20: "the core songs are not
   included with the library songs because those have class activities") —
   anything tied to a Song Journey page, a whole-song card or a lyric sheet
   is out, even if `library: true` slips onto it; checks.mjs 1bq fails the
   push if it does. caBoardOrder skips these cards entirely, so a library
   song is never on the Class activities board, never on In-Class
   Activities and never holds a #N. The console's Songs view manages them
   (renderTeacherSongs in teacher.js). */
/* A song that can move between Class activities and the Songs page: a card
   whose data carries `library` (true = starts on the Songs page, false =
   starts in Class activities). Never an exit check, never a Core song. */
function caIsSongCard(a){
  return !!a && (a.library === true || a.library === false) && a.kind !== 'check' && !a.journey
    && !(a.card && (a.card.wholeSong || a.card.sheet));
}
/* Where it is now: the console's move (config/class.songLibrary) wins over
   the data. `over` is that map — teacher.js passes its own config's copy;
   students read songLibraryIds. */
function caIsLibraryCard(a, over){
  if(!caIsSongCard(a)) return false;
  const m = over || songLibraryIds;
  return typeof m[a.id] === 'boolean' ? m[a.id] : a.library === true;
}
/* A teacher-only card (`teacherOnly: true` — see TEACHER ONLY in
   class-activities.js): the console's Teacher view songs tab plays it for the
   room, and students never see it until that tab's "Move to Class
   activities" moves it (classSongIds) — then it is an ordinary class
   activity, placed and dated on the board like any other, and this returns
   false. `over` is that map — teacher.js passes its own config's copy. */
function caIsTeacherSong(a, over){
  const m = over || classSongIds;
  return !!a && a.teacherOnly === true && m[a.id] !== true;
}
function caIsLibrarySong(a){
  if(!caIsLibraryCard(a)) return false;
  return retiredActivityIds[a.id] !== true && hiddenActivityIds[a.id] !== true;
}
function caIsPlayAlongOnly(a){
  // A library song opens from the Songs page for anyone — see caIsLibrarySong.
  if(caIsLibrarySong(a)) return !caIsVisible(a);
  if(!a || a.view !== 'card' || playAlongActivityIds[a.id] !== true) return false;
  if(retiredActivityIds[a.id] === true || hiddenActivityIds[a.id] === true) return false;
  if(!caForMe(a)) return false;
  if(!caBoardView().assigned[a.id]) return false;
  return !caIsVisible(a);
}
/* ── "Keep practicing" pins (config/class.activityPins — see the global) ──
   caCleanPins: whatever came out of Firestore or the cache, as an array of
   distinct id strings, at most CA_PINS_MAX — a hand-edited doc can't make
   the row grow past one line. */
function caCleanPins(v){
  if(!Array.isArray(v)) return [];
  const out = [];
  v.forEach(id => { if(typeof id === 'string' && id && !out.includes(id) && out.length < CA_PINS_MAX) out.push(id); });
  return out;
}
/* A pinned card the row may show and open. The pin stands in for the
   release date and nothing else — Hidden, Archive/Delete and "not placed on
   the board" all still win, exactly as they do for Play Along now. Exit
   checks are one-try work, so they are never pinnable. */
function caPinReachable(a){
  if(!a || a.kind === 'check' || !activityPins.includes(a.id)) return false;
  if(retiredActivityIds[a.id] === true || hiddenActivityIds[a.id] === true) return false;
  if(!caForMe(a)) return false;
  return !!caBoardView().assigned[a.id];
}
/* Reachable from the row ONLY — the pinned card isn't on the dated list.
   Like caIsPlayAlongOnly, deliberately not folded into caIsVisible(): that
   predicate is the gate's and the dated list's, and a pin must reach
   neither. */
function caIsPinOnly(a){ return caPinReachable(a) && !caIsVisible(a); }
/* The row itself: one button per pin, in pin order. A pin that is also one
   of today's cards stays in the row (Jonathan, 2026-10-13: "if I have pinned
   an activity, I'd still like it to show at the top as pinned") — the row is
   the teacher's fixed list, so it shouldn't change shape on the days a
   pinned card is also dated. No pins, no row — not an empty box. */
function caPinRowHtml(byId){
  const pins = activityPins.map(id => byId[id])
    .filter(a => a && caPinReachable(a));
  if(!pins.length) return '';
  const btns = pins.map(a => {
    const done = classActivities[a.id] === true;
    const title = caTitle(a);
    return `<button type="button" class="ca-pin${done ? ' done' : ''}" title="${escAttr(title)}" onclick="caOpenPin('${escAttr(a.id)}')"><span class="ca-pin-t">${escHtml(title)}</span>${done ? `<svg class="ca-pin-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${escAttr(t('ca.pinDone'))}"><path d="M5 12.5l4.5 4.5L19 7"/></svg>` : ''}</button>`;
  }).join('');
  return `<div class="ca-pins" role="group" aria-labelledby="ca-pins-lbl"><span class="ca-pins-lbl" id="ca-pins-lbl" data-i18n="ca.pinsTitle">${escHtml(t('ca.pinsTitle'))}</span><span class="ca-pins-row">${btns}</span></div>`;
}
/* A tap on a pin opens the card the way a tap on the card itself does:
   where it already sits on the page if it is on the dated list, or under
   the row if the pin is the only way to it (caIsPinOnly). Same open path as
   a deep link (caFocusActivity), plus the tap-only metronome start. */
function caOpenPin(id){
  const a = (window.CLASS_ACTIVITIES || []).find(x => x.id === id);
  if(!a || !caPinReachable(a)) return;
  caSwap = null;
  caFocusActivity(id);
  caAutoStartMetro(a);
}
/* ── The activity gate (Today-first work order, Phase 1, approved by
   Jonathan 2026-09-11) ──
   A visible, undone, uncleared activity — any kind, checks included — blocks
   the rest of the site: body.ca-gated is the single on/off switch, and the
   CSS it drives (styles.css) hides everything but In-Class Activities and
   Live quiz. Never
   lock on a guess, same rule as the sequential set gate: a teacher/dev
   preview and a failed progress load both read as "nothing blocking".
   An activity the teacher marked Optional (optionalActivityIds) is visible
   but never a blocker — mirrored in teacherBlockersFor (teacher.js) and
   journeyBlockers (tabs/journey.js).

   CAS students: EVERY activity is optional (Jonathan, 2026-09-22). They
   still see every card, tagged Optional, but nothing on In-Class Activities
   ever locks them out of the modules. Effective period = the teacher's
   correction || the student's own answer, the same rule as everywhere else
   (see studentPeriod). Same three places must agree: caIsOptional here,
   teacherBlockersFor, journeyBlockers. */
function caStudentIsCAS(){ return (periodOverride || studentPeriod) === 'CAS'; }
// Despite the name and its single per-activity argument, this is NOT just
// "did the teacher mark this one Optional" — it also folds in the CURRENT
// student's CAS status (ambient, via caStudentIsCAS()). A caller that wants
// only the teacher's per-activity flag needs optionalActivityIds[a.id] directly.
/* Optional by default (Jonathan, 2026-10-14): an activity whose data says
   `optional: true` (ca-34), or one given to individual students from the
   board's "Who" picker, is Optional until the teacher switches it to
   Required — which the console stores as an explicit false. Absent = the
   default. Mirrored by teacherActivityOptional (teacher.js) and
   journeyOptional (tabs/journey.js). */
function caOptionalByDefault(a){ return a.optional === true || Object.prototype.hasOwnProperty.call(activityForMe, a.id); }
function caIsOptional(a){
  if(caStudentIsCAS()) return true;
  const f = optionalActivityIds[a.id];
  return f === true || (f !== false && caOptionalByDefault(a));
}
function caBlockers(){
  if(isGatePreviewer() || progressLoadFailed) return [];
  const clears = (activityClears || {})[currentUser && currentUser.uid] || {};
  return (window.CLASS_ACTIVITIES || []).filter(a =>
    caIsVisible(a) && !caIsOptional(a) && classActivities[a.id] !== true && clears[a.id] !== true);
}
/* Manual test hook, localhost only: dev bypass IS a gate previewer
   (isGatePreviewer), so it's the one account that can never see its own
   gate — window.__forceGate lets a local session (or a driving script)
   force it on anyway to walk the gated UI. Never honored off localhost. */
/* The lock is switched off, not deleted (Jonathan, 2026-10-07: "stop
   locking the other parts of site if class activities aren't cleared").
   Pending activities no longer hide the rail, Songs, Games or the modules;
   a student with one pending still LANDS on In-Class Activities at sign-in
   (showApp). Flip this back to true to restore the lock exactly as it was —
   caBlockers(), the CSS and the redirects below are all still here. Mirrored
   by JOURNEY_GATE_LOCKS in tabs/journey.js. */
const CA_GATE_LOCKS = false;
function applyActivityGate(){
  const forced = IS_LOCALHOST && window.__forceGate;
  const wasOn = document.body.classList.contains('ca-gated');
  const on = forced || (CA_GATE_LOCKS && caBlockers().length > 0);
  document.body.classList.toggle('ca-gated', on);
  /* Off → on while the student is somewhere else (a new activity went live
     under an open Games/Songs/My progress screen — the visibilitychange
     re-check below is the usual path): the CSS hides the rail, but an
     already-open screen stays open, so walk them to In-Class Activities the same way
     routeExploreHash does for a typed hash. showApp()'s own first call
     lands here too, harmlessly — it's about to route the landing hash
     itself, and goExploreHash is a no-op when the hash already matches. */
  if(on && !wasOn && appIsOnScreen()){
    const h = exploreHashBase(location.hash);
    if(!GATE_OPEN_HASHES.includes(h)){
      if(h) gateToast(t('gate.activityFirst'));   // a bare hash is the practice view — no "wrong page" to name
      goExploreHash('class-activities');
    }
  }
}
// The redirect above must not fire from loadClassConfig()'s boot-time run —
// that lands before showApp() has rendered anything to route within; showApp
// does its own landing-hash pass right after. Only a live app gets walked.
function appIsOnScreen(){
  const app = document.getElementById('app');
  return !!app && app.style.display === 'block';
}
/* A teacher's console clear (or a new activity going live) has to reach a
   student tab that's just sitting open, not only the next reload — same
   visibilitychange re-check live-quiz.js's invite uses, and the same reason:
   nobody is staring at the site when the teacher clears someone, so the
   first chance to notice is the tab coming back to the foreground. */
/* A cheap snapshot of the fields loadClassConfig() can change, so the
   visibilitychange handler below can tell "nothing moved" from "something
   moved" and only pay for a full re-render in the second case. Before this
   (2026-09-26), every tab return rebuilt the whole open In-Class Activities
   screen unconditionally — resetting any revealDelay tab to blank, any paged
   tab to page 1, and any paused tab-player position, even when the config
   read came back byte-identical to what was already showing. */
function classConfigSignature(){
  return JSON.stringify([activityDates, activityBoard, activityBoardOn, hiddenActivityIds, activityForMe,
    retiredActivityIds, activityClears, optionalActivityIds, playAlongActivityIds, activityPins, activityTitles,
    activityNumbers, periodOverride, moduleOpenThrough,
    songLibraryIds, classSongIds,   // a Move to Songs / Move to Class activities changes which cards show
    gamesAccessOn]);   // the free-play hero's Games button follows it
}
document.addEventListener('visibilitychange', () => {
  /* The snippet loop is closed by rAF (snipTick), and rAF stops firing in a
     hidden tab while an <audio> element keeps playing — so a backgrounded tab
     abandons the 4-bar window and plays the whole 4-minute track. On a
     Chromebook that is just switching tabs to look something up. Stop the
     band when the tab goes away; the student presses Play again.
     A Note Call round too: its clock keeps running while the tab is hidden,
     and on return it plays every missed note at once (a play-along steps
     its tempo up 8 notes at a time; a scored level marks each one a miss).
     coach.js's own handler stops it only when coach.js has loaded, and the
     default tap mode never loads it.
     One exception, in the teacher console only: a WHOLE-SONG card playing for
     the room (ca-40) keeps playing when Jonathan switches the projector's tab
     to his slides (code-hygiene rule 4). What a hidden tab does to it, since
     no rAF runs there: it plays on to the end of the FILE, not the card's
     window (1-13 s past it on ca-24..ca-40), and the card stops itself when
     the tab is shown again; the Metronome click stops (pcScheduleClick runs
     in the frame loop); hidden during the count-in, the song can come in
     about a second late (timers are throttled). A looping card or a snippet
     needs rAF to loop, so those still stop, there too; a student tab stops
     all. */
  if(document.hidden){
    snipStop();
    if(!(IS_TEACHER_MODE && pcState && pcState.wholeSong)) pcStop();
    if(typeof ncStopAll === 'function') ncStopAll();
    if(typeof chcStopAll === 'function') chcStopAll();
    /* Name the power chord is not stopped here (Jonathan, 2026-11-09): it has no
       clock, no sound and no mic, so a student who looks something up in another
       tab comes back to the same card and score. A hit's move-on timer just fires. */
    flushOnHide();
    return;
  }
  if(!currentUser || IS_TEACHER_MODE || accessLocked) return;   // accessLocked: the access screen, not the app (app/boot.js)
  const before = classConfigSignature();
  loadClassConfig().then(() => {
    if(classConfigSignature() === before) return;
    refreshOpenClassActivitiesScreen();
    /* The search index holds one entry per VISIBLE activity (buildSearchIndex),
       so an activity released while the tab was away stayed unfindable — and
       an archived one stayed findable — until a language switch or reload.
       Drop it; ensureSearchIndex() rebuilds on the next search, and an open
       search re-runs what is in the box. */
    searchIndex = null;
    const input = document.getElementById('search-input');
    const panel = document.getElementById('search-panel');
    if(input && panel && !panel.hasAttribute('hidden') && input.value.trim().length >= 2) runSearch(input.value);
  });
});
/* Save as the tab goes out of sight, not only on pagehide (2026-10-12).
   Closing a Chromebook lid or switching apps hides the tab but often never
   fires pagehide, so a step ticked inside queueSave's 800 ms debounce was
   left waiting until the student came back — or lost with the tab. This
   sends now what the debounce would have sent anyway: flushSave() takes the
   dirty set with it (a pagehide straight after finds nothing and sends
   nothing), keeps the failed-load drop (LOAD_FAILED_EMPTY_MAPS, 1bo), and
   never sees the held-back categories — queueSave filters those before
   they are ever dirty. Nothing dirty, nothing sent. */
function flushOnHide(){
  if(!currentUser || !_dirtyKeys.size) return;
  clearTimeout(saveTimer);
  flushSave();
}
// Shared "is In-Class Activities open, and if so re-render it" check — every
// place that changes something the screen might already be showing (a period
// pick, a language switch, a gate-clearing config reload) goes through this
// one, rather than three near-identical copies of the same idiom drifting apart.
function refreshOpenClassActivitiesScreen(){
  if(typeof renderClassActivities !== 'function') return;
  const screen = document.getElementById('class-activities-screen');
  if(screen && !screen.hidden) renderClassActivities();
}
/* In-Class Activities — three groups, in this order (Today-first work order, Phase 1):
     1. Do now      — every card released today or yesterday, pending
                       first, then finished (2026-11-09, evening,
                       see pendingPool). Collapsed like every
                       other card (Jonathan, 2026-09-15): the whole point of the
                       page is seeing the day's work at a glance, and a
                       forced-open first card pushed the rest below the fold.
     2. Still to do — the rest of the pending cards, under a divider label
                       (skipped when there's only one pending card — nothing
                       left to divide it from).
     3. Earlier      — finished work, the existing collapsed group.
   Ends with the resume card (moved here from the practice column, see
   index.html) when the activity gate is off — once today's work is done,
   "Your practice" is the next thing on the page. */
function renderClassActivities(){
  const bodyEl = document.getElementById('class-activities-body');
  if(!bodyEl) return;
  // Recomputed below only when the list has cards; an emptied list must not
  // keep the last pass's hero, or renderResumeCard stays hidden for good.
  caStartHereId = null;
  caTodayIds = [];
  caSinceRepaint = false;   // this render reads the "Since your last visit" answer, whatever it is
  caResetRevealsIfNewDay();
  // This rebuilds every card, so a snippet playing in one of them is about to
  // be detached — and a detached <audio> keeps playing with nothing left on
  // screen to stop it. (snipTick's own isConnected guard is the backstop for
  // a card pulled out some other way; this is the one path we know about.)
  snipStop();
  pcStop();   // a practice card's song, same reason (pcFrame has the same backstop)
  // Recomputed up front — the gate intro line and the resume card below both
  // read body.ca-gated, and a completion just made in THIS render pass
  // (caToggleComplete/ecSubmit, both call this) has to be reflected before
  // either of them looks at it.
  applyActivityGate();
  /* The console board (caBoardOrder) still owns the TEACHING order — the
     "#N" on a card is that order, ascending, unchanged (numbering, gating
     and deep links all key off it and must not move). What flips here
     (Jonathan, 2026-09-17) is purely the READING order on this page: newest
     module first, and within a module the most recently assigned card
     (highest board position) first — so a student lands on current work
     without scrolling past everything already behind them. Reversing
     view.sections and each section's ids does that without touching
     caBoardOrder/caNumber, which every other reader (teacher console,
     caIsVisible, deep links) still expects in course order.
     One exception (Jonathan, 2026-11-02): the CURRENT day — the newest
     visible card's date — reads lowest number first (#11 above #12), the
     order the class does them in. Everything older stays highest first.
     Only the current day's cards trade places among themselves; every other
     card keeps its slot, and module grouping is untouched. Done here, on
     `groups`, so the Unfinished fold and the Completed fold read the same
     order. The Today group is picked by release date instead (2026-11-09,
     see pendingPool below). */
  const byId = {};
  (window.CLASS_ACTIVITIES || []).forEach(a => { byId[a.id] = a; });
  const view = caBoardView();
  const groups = view.sections.slice().reverse().map(sec => ({
    sec,
    cards: sec.ids.slice().reverse().map(id => byId[id]).filter(a => a && caIsVisible(a)),
  })).filter(g => g.cards.length);
  const currentDay = groups.length ? caDate(groups[0].cards[0]) : null;
  if(currentDay){
    groups.forEach(g => {
      const today = g.cards.filter(a => caDate(a) === currentDay).reverse();
      if(today.length > 1) g.cards = g.cards.map(a => caDate(a) === currentDay ? today.shift() : a);
    });
  }
  const list = groups.reduce((acc, g) => acc.concat(g.cards), []);
  /* The one card this page shows that is NOT in `list`: a "Play Along now"
     practice card the student opened from the Songs page (caIsPlayAlongOnly).
     It renders only while it is the open card — close it and the next render
     drops it — under the Songs section's own title, so it reads as where it
     came from. It is never the hero, never in a fold, never counted. */
  /* A pinned card that isn't on the dated list (caIsPinOnly) is the same
     kind of guest: open only while it is the open card, rendered straight
     under the Keep practicing row that opened it, no heading of its own. */
  const openCard = caOpenId && byId[caOpenId];
  const playOnly = openCard && (caIsPlayAlongOnly(openCard) || caIsPinOnly(openCard)) ? openCard : null;
  /* Opened from another card's Level up (caOpenLinkedCard): it takes THAT
     card's slot instead of a Songs heading. Only while the `from` card is on
     the page — otherwise it falls back to the heading. */
  const swap = playOnly && caSwap && caSwap.to === playOnly.id && list.some(a => a.id === caSwap.from) ? caSwap : null;
  const swapIn = a => (swap && a.id === swap.from) ? playOnly : a;
  const pinOpen = playOnly && !swap && caIsPinOnly(playOnly) ? playOnly : null;
  // A library song is headed with the Songs list it came from (caIsLibrarySong).
  const playOnlyHead = playOnly && caIsLibrarySong(playOnly) ? 'hub.libraryTitle' : 'hub.playAlongTitle';
  const playOnlyHtml = playOnly && !swap && !pinOpen
    ? `<div class="ca-mod-head" role="heading" aria-level="3" data-i18n="${playOnlyHead}">${escHtml(t(playOnlyHead))}</div>${caActivityCardHtml(playOnly)}`
    : '';
  // The Keep practicing row (caPinRowHtml) plus, under it, a pin-only card
  // the student opened from it.
  const pinsHtml = () => caPinRowHtml(byId) + (pinOpen ? caActivityCardHtml(pinOpen) : '');
  // A deep link whose id isn't published (or is mistyped) says so, above the
  // archive it did open — see caFocusActivity.
  const missing = caLinkMissingId
    ? `<div class="coach-tip" data-i18n="ca.linkMissing">${escHtml(t('ca.linkMissing'))}</div>`
    : '';
  if(!list.length){
    // With a Keep practicing row up there is something to do, so the
    // "nothing here yet" line would read wrong under it.
    const pins = pinsHtml();
    bodyEl.innerHTML = missing + pins + (playOnlyHtml || (pins ? '' : `<div class="coach-tip" data-i18n="ca.empty">${escHtml(t('ca.empty'))}</div>`));
  } else {
    // Done work collapses into its own group (caFinishedGroupHtml) so the
    // list a student actually needs to act on isn't buried under everything
    // already turned in — `list` is already in reading order (newest module
    // and card first, the current day lowest number first — see above), so
    // filtering it straight through keeps that same order here. A finished
    // card that is in Today's activities is left out of the fold below.
    const finished = list.filter(a => classActivities[a.id] === true);
    // Every card starts collapsed, Do-now included — nothing is opened here.
    // caOpenId only ever becomes non-null because the student opened a card
    // (caOnActivityToggle), a deep link focused one (caFocusActivity), or a
    // toggle wants to keep its card open through the re-render; it stays
    // sticky after that, so a re-render never yanks their choice shut.
    const pendingGroups = groups
      .map(g => ({ sec: g.sec, cards: g.cards.filter(a => classActivities[a.id] !== true) }))
      .filter(g => g.cards.length);
    const pendingCount = pendingGroups.reduce((n, g) => n + g.cards.length, 0);
    /* Today's activities (Jonathan, 2026-11-09, evening: "everything with a
       date either for the current day or dated the day before; everything
       else is unfinished work"). The group is EVERY visible card released
       TODAY or YESTERDAY by the calendar (caTodayWindow) — yesterday is the
       calendar day before, not the last class day, so on a Monday only
       Monday's cards are here and Friday's are Unfinished (his pick, same
       day). No cap: it replaces "up to CA_TODAY_MAX pending cards across
       days" (the 2026-11-09 morning rule) and its "finished cards of the
       newest date only".
       1. The PENDING cards of those two days first: today before yesterday;
          within one date required before optional, then the lowest board
          position (#11 above #12, the 2026-11-02 rule).
       2. Then the FINISHED cards of those two days, below them, today
          before yesterday, lowest board position first: re-dating a card
          puts it back in Today for everyone, and a student who already did
          it sees it done and can play it again (2026-11-09). A finished card
          never takes a pending card's place.
       Every other pending card is in the Unfinished fold and every other
       finished one in Completed; both keep their board order. */
    const isDone = a => classActivities[a.id] === true;
    const [todayDay, yesterDay] = caTodayWindow();
    const inToday = a => { const d = caDate(a); return d === todayDay || d === yesterDay; };
    const boardPos = {};
    let posN = 0;
    view.sections.forEach(sec => sec.ids.forEach(id => { boardPos[id] = posN++; }));
    const byDate = (x, y) => {
      const dx = caDate(x) || '', dy = caDate(y) || '';
      return dx !== dy ? (dx < dy ? 1 : -1) : 0;
    };
    const pendingPool = list.filter(a => !isDone(a))
      .sort((x, y) => byDate(x, y) || (Number(caIsOptional(x)) - Number(caIsOptional(y))) || (boardPos[x.id] - boardPos[y.id]));
    const todayPending = pendingPool.filter(inToday);
    /* The hero (caStartHereId) stays COLLAPSED like every other card
       (Jonathan, 2026-09-15). Required and unfinished first (Jonathan,
       2026-11-12): the newest REQUIRED pending card, whatever its date (an
       older one in the Unfinished fold beats an optional card dated today);
       an optional one only when no required card is pending. A card the
       teacher cleared for this student is never the hero. caStartHereId
       answers "is anything left to do?" for the "next up" toast and the
       resume card, so it is null when nothing is pending but cleared cards. */
    const myClears = (activityClears || {})[currentUser && currentUser.uid] || {};
    const pickable = pendingPool.filter(a => myClears[a.id] !== true);
    const heroPick = pickable.find(a => !caIsOptional(a)) || pickable[0] || null;
    caStartHereId = heroPick ? heroPick.id : null;
    const todayDone = list.filter(a => isDone(a) && inToday(a)).sort((x, y) => byDate(x, y) || (boardPos[x.id] - boardPos[y.id]));
    const todayCards = todayPending.concat(todayDone);
    // Every card in the group, the finished ones below included.
    caTodayIds = todayCards.map(a => a.id);
    /* One heading over the group (caTodayHeadHtml), dated TODAY. A card
       released yesterday wears its own date chip (the Unfinished fold's
       .ca-chip); today's wear none. A finished card is drawn exactly as the
       Completed fold draws it (caActivityCardHtml: its ✓, its Completed
       button), minus the chip. No card dated today or yesterday → no
       heading at all; the Unfinished fold (open by default, caTodoOpen) is
       then the top of the page. */
    const chipOf = a => { const d = caDate(a); return d && d !== todayDay ? d : ''; };
    /* Side by side (Jonathan, 2026-11-10, work order Part 3): the Today cards
       sit in ONE grid, two equal columns, same order, so they read left to
       right, then down. One card keeps the full width; two or more are half
       width (--multi) and drop the hero thumbnail (styles.css). An open card
       takes the full width: the grid is on its .ca-solo-path. */
    const todayHtml = todayCards.length
      ? caTodayHeadHtml(todayDay)
        + `<div class="ca-today-grid${todayCards.length > 1 ? ' ca-today-grid--multi' : ''}">`
        + todayCards.map(a => isDone(a) ? caActivityCardHtml(swapIn(a), chipOf(a)) : caHeroCardHtml(swapIn(a), chipOf(a))).join('')
        + `</div>`
      : '';
    let pendingHtml;
    if(!pendingCount){
      // The Today hero's caught-up state (2f) — replaces the old plain
      // ca.allDone line with the same free-play actions 1d already built.
      // Any finished card dated today still shows under it, done.
      pendingHtml = finished.length ? caFreePlayHeroHtml() + todayHtml : '';
    } else {
      // Everything else pending, minus the Today cards, wrapped in ONE "Still to
      // do" fold (2f) — module headings (plain, no progress bar; that's an
      // Earlier-only addition below) when anything has been placed in a
      // module, otherwise the flat Unsorted list it always was.
      // "Since your last visit" (caSinceGroup, at the end of this file) sits
      // between Today and this fold and takes its cards out of the fold: no
      // card shows twice.
      const since = caSinceGroup(list, todayDay, myClears, boardPos);
      const sinceIds = since ? since.ids : [];
      const restGroups = pendingGroups
        .map(g => ({ sec: g.sec, cards: g.cards.filter(a => !caTodayIds.includes(a.id) && !sinceIds.includes(a.id)) }))
        .filter(g => g.cards.length);
      const restFlat = restGroups.reduce((acc, g) => acc.concat(g.cards), []);
      const restCount = restFlat.length;
      let restHtml = '';
      if(restCount > 0){
        /* One fold, newest first — the page's three groups are Today's
           activity / Unfinished activities / Completed activities (Jonathan,
           2026-09-23, round 2). The nested "Older (n)" fold from round 1
           (item 5) is gone with its name; module headings, when any card
           is placed in a module, do the grouping instead. */
        const restNewest = caNewestModNum(restGroups);
        const body = restGroups.some(g => g.sec.mod)
          ? restGroups.map(g => caModFoldHtml('todo', g.sec, headHtml(g.sec), g.cards.map(a => caActivityCardHtml(swapIn(a))).join(''), g.cards, restNewest, swap)).join('')
          : restFlat.map(a => caActivityCardHtml(swapIn(a))).join('');
        const openInside = restFlat.some(a => a.id === caOpenId || (swap && a.id === swap.from));
        restHtml = caTodoGroupHtml(body, restCount, openInside);
      }
      pendingHtml = todayHtml + (since ? caSinceHtml(since, byId, swapIn) : '') + restHtml;
    }
    /* Module headings, EN and ES, from the ONE place the site already keeps
       a module's display name — the MODULE_MANIFEST entry caBoardOrder hands
       back on the section. Unsorted (module 0) and a section whose module
       the manifest doesn't know get no heading: there is no honest name to
       put there, and an invented one would be a second source of truth.
       (Declared after pendingHtml only because that's where it's first
       used above — hoisted, so the order here doesn't matter functionally.) */
    function headHtml(sec){
      return sec.mod
        ? `<div class="ca-mod-head" role="heading" aria-level="3" data-i18n="ca.moduleHead" data-i18n-params="${escAttr(JSON.stringify({n: sec.mod.num, mod: tf(sec.mod, 'name')}))}">${escHtml(t('ca.moduleHead', {n: sec.mod.num, mod: tf(sec.mod, 'name')}))}</div>`
        : '';
    }
    // Names how many things are actually blocking (2f) instead of the flat
    // "finish these" line — caBlockers() is the same predicate the gate
    // itself is built on, so the count can't disagree with body.ca-gated.
    const gateIntro = document.body.classList.contains('ca-gated')
      ? (() => {
          // caBlockers() bails to [] for a gate previewer (dev bypass, the
          // teacher account) — so a REAL student is only ever gated with
          // gn >= 1, but window.__forceGate (localhost only) can force the
          // gate on for exactly that same previewer, producing a real gn===0
          // this count would otherwise report dishonestly. Fall back to the
          // old generic wording for that dev-tool-only case.
          const gn = caBlockers().length;
          if(gn === 0) return `<p class="ca-gate-intro" data-i18n="today.gateIntroForced">${escHtml(t('today.gateIntroForced'))}</p>`;
          const key = gn === 1 ? 'today.gateIntro1' : 'today.gateIntro';
          const params = gn === 1 ? null : {n: gn};
          return `<p class="ca-gate-intro" data-i18n="${key}"${params ? ` data-i18n-params="${escAttr(JSON.stringify(params))}"` : ''}>${escHtml(t(key, params))}</p>`;
        })()
      : '';
    // Earlier now groups by module too, with a progress bar per heading
    // (2f) — a genuinely new capability (it used to be one flat list), so
    // it needs the same grouping pass pendingGroups already gets.
    // A finished card shown in Today's activities is not repeated here.
    const finishedGroups = groups
      .map(g => ({ sec: g.sec, cards: g.cards.filter(a => classActivities[a.id] === true && !caTodayIds.includes(a.id)) }))
      .filter(g => g.cards.length);
    const finishedRest = finished.filter(a => !caTodayIds.includes(a.id));
    bodyEl.innerHTML = missing + pinsHtml() + gateIntro + playOnlyHtml + pendingHtml + (finishedRest.length ? caFinishedGroupHtml(finishedGroups, finishedRest, byId, swap) : '');
  }
  if(typeof applyI18n === 'function') applyI18n(bodyEl);
  caArmTabReveals(bodyEl);
  caSyncTopbar();
  // The resume card only belongs on a finished In-Class Activities page —
  // gated, or a Today hero still pending (item 2f), skip it; both checks now
  // live inside renderResumeCard() itself, since a boot-time caller
  // (restoreLastSet) invokes it independently of this render pass.
  if(document.getElementById('resume-card') && typeof renderResumeCard === 'function') renderResumeCard();
}
// Per-module progress for the Earlier fold's headings (item 2f) — "N of M"
// and a thin bar, counted over every VISIBLE card ever assigned to that
// module (done + still pending), not just the finished ones sitting in THIS
// fold — so Earlier's "4 of 6" and however many are left in Still to do
// always add up to the same total.
function caModuleHeadHtml(sec, byId){
  if(!sec.mod) return '';
  const ids = sec.ids.filter(id => byId[id] && caIsVisible(byId[id]));
  const total = ids.length;
  const doneN = ids.filter(id => classActivities[id] === true).length;
  const pct = total ? Math.round(doneN / total * 100) : 0;
  const labelParams = {n: sec.mod.num, mod: tf(sec.mod, 'name')};
  const countParams = {done: doneN, total};
  return `<div class="ca-mod-head" role="heading" aria-level="3">
    <span role="heading" aria-level="3" data-i18n="ca.moduleHead" data-i18n-params="${escAttr(JSON.stringify(labelParams))}">${escHtml(t('ca.moduleHead', labelParams))}</span>
    <span class="ca-mod-bar" aria-hidden="true"><b style="width:${pct}%"></b></span>
    <span class="ca-mod-count" data-i18n="ca.moduleProgress" data-i18n-params="${escAttr(JSON.stringify(countParams))}">${escHtml(t('ca.moduleProgress', countParams))}</span>
  </div>`;
}
/* Each module's cards fold under its heading (Jonathan, 2026-11-12: "make
   the modules expandable and collapse all but the most recent module").
   Only the highest-numbered module in the fold starts open. A student's own
   open/close sticks across re-renders (caModFoldOpen, keyed by fold and
   module number), and a fold holding the open card (caOpenId) or a Level
   up swap is forced open, so a deep link never lands on a hidden card.
   Cards with no module (Unsorted) are never wrapped. */
const caModFoldOpen = {};
function caNewestModNum(groups){
  return groups.reduce((m, g) => (g.sec.mod && g.sec.mod.num > m) ? g.sec.mod.num : m, -Infinity);
}
function caModFoldHtml(fold, sec, headHtml, cardsHtml, cards, newest, swap){
  if(!sec.mod || !headHtml) return headHtml + cardsHtml;
  const key = fold + ':' + sec.mod.num;
  const holdsOpen = cards.some(a => a.id === caOpenId || (swap && a.id === swap.from));
  const open = holdsOpen || (key in caModFoldOpen ? caModFoldOpen[key] : sec.mod.num === newest);
  // The heading's own <div> becomes the <summary>: same class, same look.
  // Its heading role goes: a <summary> is the fold's button, and a role on it
  // would hide that from a screen reader. In the Completed fold the module
  // name is its own span with the heading role INSIDE the summary
  // (caModuleHeadHtml), so the outline keeps it; check 1da runs both callers.
  const summary = headHtml.replace(/^<div class="ca-mod-head"(?: role="heading" aria-level="\d")?/, '<summary class="ca-mod-head ca-mod-summary"').replace(/<\/div>$/, '</summary>');
  return `<details class="ca-mod-fold" ${open ? 'open' : ''} data-fold-key="${escAttr(key)}" ontoggle="caOnModFoldToggle(this)">${summary}${cardsHtml}</details>`;
}
function caOnModFoldToggle(details){
  caModFoldOpen[details.dataset.foldKey] = details.open;
  if(!details.open && snipState && details.contains(snipState.card)) snipStop();
  if(!details.open && pcState && details.contains(pcState.root)) pcStop();
  if(!details.open) songFileCancelWaitIn(details);     // a song still loading in it (SONG FILES)
}
/* ── "Unfinished activities" — every pending card except the Today hero,
   wrapped in ONE fold (item 2f). OPEN by default (Jonathan, 2026-10-02);
   a student who closes it keeps it closed across re-renders, same sticky
   pattern as "Completed activities" below. ── */
let caTodoOpen = true;
function caOnTodoToggle(details){
  caTodoOpen = details.open;
  if(!details.open && snipState && details.contains(snipState.card)) snipStop();
  if(!details.open && pcState && details.contains(pcState.root)) pcStop();
  if(!details.open) songFileCancelWaitIn(details);     // a song still loading in it (SONG FILES)
}
function caTodoGroupHtml(bodyHtml, count, openInside){
  const open = caTodoOpen || openInside;
  return `<details class="ca-todo-group" ${open ? 'open' : ''} ontoggle="caOnTodoToggle(this)">
    <summary class="ca-todo-summary">${escHtml(t('ca.stillToDoGroup', {n: count}))}</summary>
    <div class="ca-todo-body">${bodyHtml}</div>
  </details>`;
}
// Closed by default each render — caFinishedOpen carries the student's choice
// across re-renders the same way caOpenId does for a single card, so marking
// one more activity complete doesn't yank an already-open group shut. Also
// forced open when the focused/just-toggled card (caOpenId) lives in it, so
// caFocusActivity's deep link and caToggleComplete's "keep it open" both
// still land on a visible card instead of one hidden inside a closed group.
let caFinishedOpen = false;
function caFinishedGroupHtml(finishedGroups, finishedFlat, byId, swap){
  // `swap`: a Level up's target showing in its card's slot — see caCardLinkHtml.
  const swapIn = a => (swap && a.id === swap.from) ? byId[swap.to] : a;
  const open = caFinishedOpen || finishedFlat.some(a => a.id === caOpenId || (swap && a.id === swap.from));
  const newest = caNewestModNum(finishedGroups);
  const body = finishedGroups.some(g => g.sec.mod)
    ? finishedGroups.map(g => caModFoldHtml('done', g.sec, caModuleHeadHtml(g.sec, byId), g.cards.map(a => caActivityCardHtml(swapIn(a))).join(''), g.cards, newest, swap)).join('')
    : finishedFlat.map(a => caActivityCardHtml(swapIn(a))).join('');
  return `<details class="ca-finished-group" ${open ? 'open' : ''} ontoggle="caOnFinishedToggle(this)">
    <summary class="ca-finished-summary">${escHtml(t('ca.finishedGroup', {n: finishedFlat.length}))}</summary>
    <div class="ca-finished-body">${body}</div>
  </details>`;
}
function caOnFinishedToggle(details){
  caFinishedOpen = details.open;
  if(!details.open && snipState && details.contains(snipState.card)) snipStop();
  if(!details.open && pcState && details.contains(pcState.root)) pcStop();
  if(!details.open) songFileCancelWaitIn(details);     // a song still loading in it (SONG FILES)
}

/* ── "Since your last visit" (Jonathan, 2026-11-13: a catch-up aid for a
   student coming back after days with no saved work; version B of the
   mock-ups, "a group inside the list", with his changes) ──────────────────
   WHAT COUNTS, exactly (checks.mjs 1ds runs caSinceGap / caSinceMissed over
   a table of made-up histories):
     · a CLASS DAY is a release date on the board (activityDates) of a card
       THIS student can see (caIsVisible: assigned, not Hidden, not archived,
       given to them, dated and arrived);
     · SAVED WORK on a day = a practice-minutes day record for that day,
       minutes/{uid}/days/{date} (practice-minutes.js): the engine writes one
       for every day the student was signed in and working on the site (any
       click, playback, mic or sound counts a second). The progress document
       keeps no dates for activities (classActivities is id -> true), so
       there is nothing better to read there;
     · the LAST VISIT is the newest day with saved work BEFORE today, looked
       for in the last CA_SINCE_WINDOW_DAYS days. Today never counts, so
       working today (finishing one of these cards) does not end the group;
     · the MISSED class days are every class day after the last visit and
       before today (none of them has saved work, by definition, so they are
       "in a row"). TWO or more → the group shows;
     · it lists the cards released on the missed days that are visible,
       REQUIRED (not Optional, not CAS, not cleared by the teacher for this
       student) and not done, minus any card already in Today's activity
       (today's and yesterday's cards stay there, unchanged), newest date
       first, within one date lowest board position first (#11 above #12,
       the Today rule). Nothing left to list → no group.
   No saved work found in the window, a failed read, a failed progress
   load, the teacher's account → no group: the page is exactly today's.
   The group never says "absent" (the site keeps no attendance: a student in
   the room with a dead Chromebook has no saved work either).
   DISPLAY ONLY: caIsVisible, caBlockers, caBoardOrder, the gate, the hero
   (caStartHereId), Today's activity and where a student lands are
   untouched. The group's cards are taken OUT of the Unfinished fold (it
   then holds the rest: older cards, optional and cleared ones), so no card
   shows twice; a finished card leaves the group for Completed exactly as it
   leaves the fold.
   THE READ: one query per student per day: the day records from
   CA_SINCE_WINDOW_DAYS (14) days ago up to yesterday, oldest first (a
   descending key scan is refused, so no orderBy desc + limit 1): at most 14
   documents, about 10 for a student who works every school day, none for one
   who was away the whole time. Kept in memory only,
   keyed by uid and day: no storage key, so the next student on a shared
   Chromebook can never see it. The first render goes out without the group;
   when the answer brings one it paints once (or, with a card open, when
   "All activities" closes it). */
const CA_SINCE_WINDOW_DAYS = 14;
const CA_SINCE_RETRY_MS = 5 * 60 * 1000;
let caSinceRead = null;      // { key: 'uid|YYYY-MM-DD', state: 'loading'|'ok'|'failed', at, last }
let caSinceRepaint = false;  // the answer came while a card was open: repaint when it closes
/* PURE. The class days with no saved work: every date in `dates` after
   `last` and before `today`, once each, oldest first. Fewer than two → null. */
function caSinceGap(dates, last, today){
  if(typeof last !== 'string' || typeof today !== 'string' || !last || last >= today) return null;
  const days = Array.from(new Set((dates || []).filter(d => typeof d === 'string' && d > last && d < today))).sort();
  return days.length >= 2 ? days : null;
}
/* PURE. o = { today, last, cards: [{ id, date, required, done, inToday, pos }] }
   (cards = every card the student can see). Returns { last, days, ids } —
   ids newest date first, then lowest board position — or null. */
function caSinceMissed(o){
  const cards = (o && o.cards) || [];
  const days = caSinceGap(cards.map(c => c.date), o && o.last, o && o.today);
  if(!days) return null;
  const ids = cards.filter(c => c.required && !c.done && !c.inToday && days.includes(c.date))
    .sort((x, y) => x.date !== y.date ? (x.date < y.date ? 1 : -1) : (x.pos - y.pos))
    .map(c => c.id);
  return ids.length ? { last: o.last, days, ids } : null;
}
// The first day the read looks at: CA_SINCE_WINDOW_DAYS before `today`, at noon (daylight saving).
function caSinceFrom(today){
  const [y, m, d] = today.split('-').map(Number);
  return dayStr(new Date(y, m - 1, d - CA_SINCE_WINDOW_DAYS, 12));
}
/* The last day with saved work before `today`, or null (none, not read yet,
   or nothing to read for this account). Starts the read when needed. */
function caSinceLastVisit(today){
  if(!currentUser || !currentUser.uid || progressLoadFailed) return null;
  const from = caSinceFrom(today);
  /* The localhost dev bypass has no Firestore: window.__caWorkDays (an array
     of 'YYYY-MM-DD', localhost only) stands in for the day records, so a
     preview or a driving script can walk the group. */
  if(isDevBypassUser()){
    const w = IS_LOCALHOST && Array.isArray(window.__caWorkDays) ? window.__caWorkDays : [];
    return w.filter(d => typeof d === 'string' && d >= from && d < today).sort().pop() || null;
  }
  if(IS_TEACHER_MODE || isGatePreviewer()) return null;
  const key = currentUser.uid + '|' + today;
  const r = caSinceRead;
  if(r && r.key === key && r.state === 'ok') return r.last;
  if(!r || r.key !== key || (r.state === 'failed' && Date.now() - r.at > CA_SINCE_RETRY_MS)) caSinceLoad(key, currentUser.uid, from, today);
  return null;
}
// One query: the day records from `from` up to (not including) `today`; the newest is the last visit.
function caSinceQuery(d, uid, from, today){
  const docId = firebase.firestore.FieldPath.documentId();
  return d.collection('minutes').doc(uid).collection('days')
    .where(docId, '>=', from).where(docId, '<', today)
    .get({ source: 'server' })   // offline, a cache read answers EMPTY (see practice-minutes.js load): no answer beats a wrong one
    .then(snap => {
      let last = null;
      snap.forEach(doc => { if(/^\d{4}-\d{2}-\d{2}$/.test(doc.id) && doc.id >= from && doc.id < today && (!last || doc.id > last)) last = doc.id; });
      return last;
    });
}
function caSinceLoad(key, uid, from, today){
  const r = caSinceRead = { key, state: 'loading', at: Date.now(), last: null };
  Promise.resolve(typeof ensureDb === 'function' ? ensureDb() : null).then(d => {
    if(!d) throw new Error('no Firestore');
    return caSinceQuery(d, uid, from, today);
  }).then(last => {
    if(caSinceRead !== r) return;   // another student, or another day, since
    r.state = 'ok'; r.last = last; r.at = Date.now();
    if(last) caSinceRepaintNow();
  }).catch(() => {
    if(caSinceRead === r){ r.state = 'failed'; r.at = Date.now(); }
  });
}
/* Paint the answer: now if the In class list is on screen with no card
   open; with a card open, when "All activities" closes it (caCloseOpen) or
   at the next render, so a playing card is never rebuilt under the student. */
function caSinceRepaintNow(){
  const screen = document.getElementById('class-activities-screen');
  if(!screen || screen.hidden) return;   // the next render of the page reads it
  if(caOpenId){ caSinceRepaint = true; return; }
  renderClassActivities();
}
/* The group for this render, or null. `list` = the visible cards; called
   after caTodayIds is set. */
function caSinceGroup(list, today, clears, boardPos){
  const last = caSinceLastVisit(today);
  if(!last) return null;
  return caSinceMissed({ today, last, cards: list.map(a => ({
    id: a.id, date: caDate(a), required: !caIsOptional(a) && clears[a.id] !== true,
    done: classActivities[a.id] === true, inToday: caTodayIds.includes(a.id), pos: boardPos[a.id] })) });
}
/* The group's markup: "Since your last visit · <the last day with saved
   work>", one line, then the cards, newest first. The top card is a hero
   card (its Start button); the others are list rows, each with its date. */
function caSinceHtml(since, byId, swapIn){
  const cards = since.ids.map(id => byId[id]).filter(Boolean);
  if(!cards.length) return '';
  const n = cards.length;
  const noteKey = n === 1 ? 'ca.sinceNote1' : 'ca.sinceNote';
  const noteParams = n === 1 ? null : { n };
  const date = caFormatDate(since.last);
  return `<section class="ca-since" aria-labelledby="ca-since-lbl"><div class="ca-today-head" role="heading" aria-level="3"><span class="ca-today-label" id="ca-since-lbl" data-i18n="ca.sinceTitle">${escHtml(t('ca.sinceTitle'))}</span>${date ? `<span class="ca-today-date">${escHtml(date)}</span>` : ''}</div>`
    + `<p class="ca-since-note" data-i18n="${noteKey}"${noteParams ? ` data-i18n-params="${escAttr(JSON.stringify(noteParams))}"` : ''}>${escHtml(t(noteKey, noteParams))}</p>`
    + cards.map((a, i) => i === 0 ? caHeroCardHtml(swapIn(a), caDate(a) || '') : caActivityCardHtml(swapIn(a))).join('')
    + `</section>`;
}

/* The unfinished-activities reminder popup (maybeShowCaReminder) was retired
   2026-09-11 (Today-first work order, Phase 1) — landing on In-Class
   Activities replaces it, and the activity gate makes it redundant besides. Deleted rather than
   stubbed, per CLAUDE.md; see git history for the old implementation. */

