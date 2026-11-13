/* ── Render-time hiding: which sections/steps a station actually shows ──
   (Today-first work order, Phase 3.) A hidden step or section still exists
   in the data and keeps its real index/gi for progress-key purposes — only
   what's RENDERED and COUNTED changes, never what a doneKey/response-key is
   built from. Use these two everywhere a station's sections/steps are
   walked for a count, a "next step", or a DOM position; checks.mjs 1ac
   requires the functions it knows about to call one of these rather than
   iterating `.sections`/`.steps` directly. */
function visibleSteps(sec, moduleNum){
  // A take-to-song section renders its Journey link card in place of a step
  // list (journeyLinkCardHtml) ONLY when this module has a Journey layer to
  // link to (modules 1–5) — its own steps are what's hidden then, regardless
  // of any step-level `hidden` flag. A module with no layer (6+) has no card
  // to show, so the section falls back to its normal step list instead of
  // vanishing outright (2026-09-12 fix: the first cut hid these
  // unconditionally and silently deleted real content across Modules 6–12,
  // Module 12's only graded assessment-piece card among it — Jonathan's call
  // was to restore the steps rather than leave the card-or-nothing rule).
  // TAKE_TO_SONG_ENABLED = false (2026-10-18) hides the section's steps in
  // every module, with or without a card — see the constant above.
  if(isTakeToSongSection(sec) && (!TAKE_TO_SONG_ENABLED || journeySongsFor(moduleNum).length > 0)) return [];
  return (sec.steps || []).map((st, idx) => ({ st, idx })).filter(p => !p.st.hidden);
}
/* ── The storage namespace rule (2026-09-12 hotfix) ──
   Every section-level progress key is `${set}-${station}-sec${gi}-${idx}`,
   and `gi` is the section's position in `station.sections` AFTER EXCLUDING
   ONLY tuning-warmup sections — the convention every key in Firestore was
   written under from July 2026 on. That filter predates the semester, so it
   is the one hide that is baked into the keys. Nothing else ever renumbers
   gi: the Phase 3 kinds (routine / ear-spark / reflection / empty
   take-to-song) and all-steps-hidden sections are RENDER-ONLY hides. The
   first cut of visibleSections() numbered gi over the survivors of those
   hides too, which moved Module 2 Set 1 station B's "Play along with the
   note map" from b-sec2 to b-sec1 on the live site for a day — checks.mjs
   1af now pins every rendered section to its July-convention gi.

   storageSections() is the single source of gi: `{ sec, gi }` pairs for
   every non-tuning-warmup section. visibleSections() filters those pairs
   down to what renders — a pair's `gi` is what ns is built from, its
   POSITION in the returned array is its visible/DOM position, exactly the
   idx/pos split visibleSteps() already makes at step level. */
function storageSections(station, moduleNum){
  return ((station && station.sections) || [])
    .filter(sec => !isTuningWarmupSection(sec, moduleNum))        // superseded by the Daily 5 — the one key-shifting hide
    .map((sec, gi) => ({ sec, gi }));
}
function isRenderableSection(sec, moduleNum){
  if(isRoutineSection(sec) || isEarSparkSection(sec) || isReflectionSection(sec)) return false;
  if(isTakeToSongSection(sec) && !TAKE_TO_SONG_ENABLED) return false;   // switched off, every module (2026-10-18)
  // With TAKE_TO_SONG_ENABLED on, a take-to-song section swaps in the Journey link card in place of its
  // steps when this module has a layer to link to (modules 1–5) — always
  // renderable then, card or not. With no layer (6+) there's no card, so it
  // falls through to a normal section's own "does it have any steps" check
  // below (visibleSteps() already stops hiding its steps in that case too).
  if(isTakeToSongSection(sec) && journeySongsFor(moduleNum).length > 0) return true;
  // A section whose every step got hidden (its one purpose now taught by a
  // class activity) is empty — don't render a heading over nothing.
  if(visibleSteps(sec, moduleNum).length === 0) return false;
  return true;
}
function visibleSections(station, moduleNum){
  return storageSections(station, moduleNum).filter(p => isRenderableSection(p.sec, moduleNum));
}

/* ── "Take It to a Song" → a Journey link card (Today-first work order,
   Phase 3b) ── One core song per module-that-has-a-layer-for-it: button
   text is the song name, the link opens tabs/<slug>.html#layer-<n> — <n>
   is the Journey layer whose .layer-unit reads "Module N" for THIS set's
   module (journey.js's existing openFromHash already opens #layer-N on
   load and on hashchange; nothing there needed to change for this).
   A song with no layer for this module is left out; a card with zero
   songs (module 6+, no core-song layer past 5) is hidden entirely — the
   section then contributes nothing, same as any other empty section.

   JOURNEY_LAYERS is authored here, at build time, from the six pages'
   real .layer-unit spans (every song currently reads Module 1→Layer 1,
   2→2, 3→3, 4→4, 5→5, with anything past Layer 5 an unnumbered "Extra"
   layer) — checks.mjs 1ab rebuilds the same map from those spans and
   fails the push on drift, so a relabeled layer can't go stale here. */
const JOURNEY_LAYERS = {
  'seven-nation-army':        { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  'all-along-the-watchtower': { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  'sweet-child-o-mine':       { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  'luna':                     { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  'let-it-be':                { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
  'the-cure':                 { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 },
};
// Shared by journeyLinkCardHtml (below) and visibleSections (which needs to
// know whether a take-to-song section's card would be empty, so it can drop
// the whole section rather than render a heading-less, button-less wrapper).
function journeySongsFor(moduleNum){
  return SONG_JOURNEYS.filter(sg => (JOURNEY_LAYERS[sg.id] || {})[moduleNum]);
}
function journeyLinkCardHtml(w){
  const songs = journeySongsFor(w.moduleNum);
  const buttons = songs.map(sg => {
    const layer = JOURNEY_LAYERS[sg.id][w.moduleNum];
    return `<button type="button" class="jl-song-btn" onclick="openSongLink('${escAttr(sg.id)}', ${layer})">${escHtml(sg.name)}</button>`;
  }).join('');
  if(!buttons) return '';
  return `<div class="jl-card">
    <div class="jl-title" role="heading" aria-level="3">${escHtml(t('journey.takeItTitle'))}</div>
    <p class="jl-sub">${escHtml(t('journey.takeItSub'))}</p>
    <div class="jl-songs">${buttons}</div>
  </div>`;
}

/* ── The ladder's sections, in render order ──
   Shared by buildLesson() (which renders them) and lessonParts() (which
   only needs the order). `{sec, ns}` per renderable section, ns being the
   storage namespace its steps are keyed under — visibleSections() returns
   `{sec, gi}` pairs whose gi is the STORAGE index (see storageSections),
   so a render-time hide never renumbers the sections after it. A station
   with flat `steps:` and no sections becomes one untitled pseudo-section
   whose ns is the bare station letter, exactly the key shape it has
   always been written under. */
function lessonGroups(w){
  return ['b','c'].map(id => ({ id, s: w.stations && w.stations[id] })).filter(g => !!g.s)
    .map(g => ({
      ...g,
      secs: (g.s.sections && g.s.sections.length)
        ? visibleSections(g.s, w.moduleNum).map(({sec,gi}) => ({ sec, ns: `${g.id}-sec${gi}` }))
        : (g.s.steps ? [{ sec: { title:'', steps: g.s.steps }, ns: g.id }] : [])
    }));
}

/* ── A long set shown as two parts (Module 4 Set 2, 2026-09-19) ───────
   DISPLAY ONLY, exactly the way stations B and C are merged in display
   only. `partOne` on the SET names the first part; `partBreak` on a
   SECTION opens the second one immediately above that section. Nothing is
   added, removed, moved or reordered in the data — the set keeps its one
   id, `stations.b`/`stations.c` keep their arrays, and every
   `${set}-${station}-sec{gi}-{i}` key is the key it always was. Splitting
   m4w2 into two real sets would have moved all of them.

   A part is chrome: the ladder's heading, the progress pill and the
   "Step n of m" counter. Set completion, the sequential set gate, the
   checklist, Module Review, search and the Daily 5 never see one — a set
   is complete when the SET is complete.

   Returns null for every ordinary set, and for a break that would leave
   Part 1 empty (checks.mjs 1ao refuses that in the data; this refuses to
   render it either way). */
function lessonParts(w, flat){
  if(!w || !w.partOne) return null;
  const secs = flat || lessonGroups(w).flatMap(g => g.secs);
  const at = secs.findIndex(({sec}) => sec && sec.partBreak);
  if(at <= 0) return null;
  return {
    at,
    firstNs: secs[0].ns,
    breakNs: secs[at].ns,
    title1: tf(w.partOne, 'title'),
    title2: tf(secs[at].sec.partBreak, 'title'),
  };
}

/* A step's YouTube <a> becomes a ▶ button that opens the in-app viewer.
   Each argument is a JSON string literal, attribute-escaped (jsonAttrArg):
   nothing in a label can end the onclick attribute or the JS string. A
   label like "Let It Be" by The Beatles once did both, and the button threw
   on click (15 links, 2026-10-25). The browser undoes escAttr, so the JS
   gets the text exactly as written in the module file: the label as HTML,
   which loadPanel puts in with innerHTML, so the player's title shows what
   the link showed; the url as written in the href (checks.mjs 1bs keeps
   entities out of those). checks.mjs 1bs parses every handler and checks
   what it passes. */
const jsonAttrArg = s => escAttr(JSON.stringify(String(s)));
function ytLinksToButtons(html){
  return html.replace(/<a href="(https?:\/\/(?:www\.)?(?:youtube\.com|youtu\.be)[^"]*)"([^>]*)>([^<]*)<\/a>/g,(match,url,attrs,label)=>{
    // data-ext links can't be embedded (official recordings block it) — open on YouTube in a new tab.
    if(/data-ext/.test(attrs)){
      return `<button class="rp-trigger" onclick="window.open(${jsonAttrArg(url)},'_blank','noopener')" title="${escAttr(t('panel.opensOnYouTube'))}">&#x25B6; ${label} <span style="font-size:0.6875rem;opacity:0.6">&#x2197;</span></button>`;
    }
    return `<button class="rp-trigger" onclick="loadPanel('youtube',${jsonAttrArg(url)},${jsonAttrArg(label)},'YouTube')">&#x25B6; ${label}</button>`;
  });
}

/* ── The lesson ladder ──
   The classroom no longer runs a three-group B/C rotation — one group is with
   the teacher, one is on the site — so a set's job here is a single, linear
   work block. Stations B and C are therefore MERGED IN DISPLAY ONLY: B's
   sections then C's (document order), one continuous run of step numbers, one
   `.dp` card. The data layer is untouched — every step key still carries its
   own station's namespace (`${w.id}-b-sec{gi}-{i}` / `${w.id}-c-sec{gi}-{i}`),
   so no student loses a checkmark. `stations.b` / `stations.c` in the module
   files are unchanged. */
function buildLesson(w){
  /* Focus mode is a site-wide view pref, read once per build: it only changes
     which rows the card SHOWS, never which one is `.cur` (that stays "first
     not-done step"), so the same markup serves both views and the toggle can
     flip live without a rebuild. `openNum` is set by stepsHtml() below as it
     emits the one open row, so the stepper bar can label it "Step n of m". */
  const focusMode = stationViewIsFocus();
  let openNum = 0;
  /* `pairs` is visibleSteps(sec) — {st,idx} for every step this ladder
     actually shows. `idx` is the step's real position in the section's own
     `steps` array (what every storage key below is built from — doneKey,
     response keys, bpm keys, drill keys — so a hidden step earlier in the
     array can never shift a later one's saved progress onto the wrong key).
     `pos`, the pair's own position in `pairs`, is the VISIBLE step number and
     the only thing curIdx/openIdx (now curPos/openPos) compare against — a
     hidden step is invisible to "which one is current", too, or a step that
     can never be marked done here again would permanently block every real
     step after it. */
  /* `numOffset` is the running count across the WHOLE ladder and is what
     openNum (and therefore Back/Next, .at-end and "which part am I in")
     are measured in — those all have to keep counting 1..20 whatever the
     circles say. `dispOffset` is the only thing the printed step number
     comes from, so a set with parts can restart its circles at 1 in Part 2
     to match the per-part pill and the "Challenge 1…" labels. They are the
     same number for every set without parts. */
  const stepsHtml=(pairs,ns,numOffset=0,allowCur=true,openIfNoCur=false,dispOffset=numOffset)=>{
   const curPos = allowCur ? pairs.findIndex(p=>completed[`${w.id}-${ns}-${p.idx}`]!==true) : -1;
   // Every step done → no `.cur` anywhere. Focus mode hides collapsed rows, so
   // a card with nothing open would render empty: step 1 stays open instead.
   const openPos = curPos >= 0 ? curPos : (openIfNoCur ? 0 : -1);
   return pairs.map((p,pos)=>{
    const s = p.st, i = p.idx;
    const text=ytLinksToButtons((isEarSparkStep(s) ? ICO_BOLT + ' ' : isSpicyLevelUpStep(s) ? ICO_CHILI + ' ' : '') + tf(s,'text'));
    const text2 = wrapGotItWhen(text, {
      key: `lesson:${w.id}-${ns}-${i}`, isDone: completed[`${w.id}-${ns}-${i}`] === true,
      closestSel: '.step', btnSel: '.step-done-btn', id: `${w.id}-${ns}-${i}`,
    });
    /* One-thing-per-screen: the challenge text and the DOER (play buttons,
       diagrams, TAB, responses) stay visible; supporting prose (hint, stuck,
       level-up) collapses behind a tap — never competing with the thing the
       student is supposed to do. The three pills sit in a FIXED row and the
       tapped pill's panel opens full-width BELOW the row (one at a time), so
       opening a panel never reflows the pills (fix approved 2026-07-23). */
    const folds = [];
    if(s.hint){
      const hint = tf(s,'hint');
      /* Split a multi-sentence hint into bullets: after a full stop that is
         followed by whitespace and then a capital (or ¿/¡), and at newlines.
         Done by marking the split points and splitting on the marker, rather
         than with a lookbehind — Safari before 16.4 can't parse a lookbehind
         literal, and this file failing to parse takes the whole app down on
         an older iPhone. U+0000 can't occur in authored content. */
      const SPLIT_MARK = '\u0000';
      const bullets = hint
        .replace(/\.(?=\s+[A-ZÁÉÍÓÚÜÑ¿¡])/g, '.' + SPLIT_MARK)
        .split(/\u0000|\n/)
        .map(b=>b.trim()).filter(Boolean);
      const inner = bullets.length <= 1 ? `<div class="sh">${hint}</div>`
        : `<ul class="sh-list">${bullets.map(b=>`<li>${b}</li>`).join('')}</ul>`;
      folds.push({key:'hint', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18h6"/><path d="M10 21h4"/><path d="M12 3a6 6 0 0 0-4 10.5c.7.6 1 1.4 1 2.5h6c0-1.1.3-1.9 1-2.5A6 6 0 0 0 12 3z"/></svg>', label:t('step.hint'), body:inner});
    }
    if(s.stuck) folds.push({key:'stuck', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2 1.8-2 3.5"/><circle cx="12" cy="17" r="0.6" fill="currentColor" stroke="none"/></svg>', label:t('step.stuck'), body:`<div class="step-branch step-stuck">${tf(s,'stuck')}</div>`});
    if(s.levelUp) folds.push({key:'levelup', icon:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M3 17l6-6 4 4 8-8"/><path d="M15 7h6v6"/></svg>', label:t('step.levelUp'), body:`<div class="step-branch step-levelup">${tf(s,'levelUp')}</div>`});
    const foldsHtml = folds.length ? (()=>{
      const idBase = `${w.id}-${ns}-${i}-fold`;
      const pills = folds.map(f=>`<button type="button" class="step-fold-pill step-${f.key}-fold" aria-expanded="false" aria-controls="${idBase}-${f.key}" onclick="toggleStepFold(this)">${f.icon} ${f.label}</button>`).join('');
      const panels = folds.map(f=>`<div class="step-fold-panel" id="${idBase}-${f.key}" hidden>${f.body}</div>`).join('');
      return `<div class="step-folds"><div class="step-folds-row">${pills}</div>${panels}</div>`;
    })() : '';
    const chordsHtml = (s.chords&&s.chords.length)
      ? `<div class="chord-diagrams">${s.chords.map(c=>`<div class="chord-box">${chordDiagramSVG(c)}${c.name?`<div class="chord-box-label">${escHtml(tf(c,'name'))}</div>`:''}</div>`).join('')}</div>` + coachChordBtnRowHtml(s.chords, stepSkillIds(w, s))
      : '';
    // One step, one Listening Coach button: a step's chord-check button
    // (above) already covers this step, so the melody/tab Coach buttons
    // below stay suppressed rather than showing a second one.
    const hasChordsCoach = chordsHtml.includes('coach-chord-row');
    const playSeqHtml = s.playSeq ? (()=>{
      const ps = s.playSeq;
      const label = (ps.label && tf(ps,'label')) || t('step.playAll');
      const defBpm = ps.bpm || 60;
      const minBpm = ps.minBpm || 40;
      const maxBpm = ps.maxBpm || 120;
      const key = `bpm:${w.id}:${ns}:${i}`;
      const bpm = readStoredBpm(key, defBpm);
      const midis = JSON.stringify(ps.notes);
      // Held notes ({midi,beats}) aren't one-pick-per-beat — a mic check
      // expecting evenly picked onsets would fail correct technique.
      const hasHolds = (ps.notes || []).some(n => n && typeof n === 'object' && !Array.isArray(n));
      return ` <span class="bpm-control-group">` +
        `<button type="button" class="play-seq-btn" data-midis="${escAttr(midis)}" onclick="playSequenceFromGroup(this)" title="${escAttr(t('step.playAll'))}">&#x25B6; ${escHtml(label)}</button>` +
        renderBpmControl(key, bpm, minBpm, maxBpm) +
        (hasHolds || hasChordsCoach ? '' : coachBtnHtml(midis, null, stepSkillIds(w, s))) +
        `</span>`;
    })() : '';
    const tabHtml = s.tab ? buildTab(s.tab, { keyPrefix: `bpm:${w.id}:${ns}:${i}:tab`, suppressCoach: hasChordsCoach }) : '';
    const tabsHtml = (s.tabs && s.tabs.length)
      ? `<div class="tab-choice-group">${s.tabs.map((spec, tIdx) => {
          const title = (spec.title && tf(spec,'title')) || (spec.caption && tf(spec,'caption')) || t('tab.defaultTitle');
          return `<div class="tab-choice"><button type="button" class="tab-choice-btn" onclick="toggleTabChoice(this)"><span class="tab-choice-icon">&#x25B6;</span><span>${t('tab.showTabLabel')} ${escHtml(title)}</span></button><div class="tab-choice-content">${buildTab(spec, { keyPrefix: `bpm:${w.id}:${ns}:${i}:tab:${tIdx}`, suppressCoach: hasChordsCoach })}</div></div>`;
        }).join('')}</div>`
      : '';
    const respHtml = s.response ? (()=>{
      const key = `${w.id}-${ns}-${i}`;
      const isPR = s.response.type === 'short' && (/personal record/i.test(s.response.prompt||'') || /\bBPM\b/i.test(s.response.prompt||''));
      let stored = isPR ? prLatestValue(responses[key]) : (responses[key] || '');
      // A graded MC whose choice was reworded after students reached it maps the
      // old saved text to the new one (response.renamedChoices).
      const ren = s.response.renamedChoices;
      if(ren && Object.prototype.hasOwnProperty.call(ren, stored)) stored = ren[stored];
      const promptHtml = s.response.prompt ? `<div class="step-resp-prompt">${escHtml(tf(s.response,'prompt'))}</div>` : '';
      const labelHtml = `<div class="step-resp-label"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5z"/></svg> ${t('step.yourResponse')}</div>`;
      if(s.response.type === 'short'){
        const ph = s.response.placeholder ? tf(s.response,'placeholder') : t('step.answerPlaceholder');
        const prAttrs = isPR ? ` onblur="onResponsePRBlur('${key}')"` : '';
        return `<div class="step-resp">${labelHtml}${promptHtml}<textarea class="step-resp-input" rows="2" placeholder="${escAttr(ph)}" oninput="onResponseChange('${key}', this.value${isPR?', true':''})"${prAttrs}>${escHtml(stored)}</textarea></div>`;
      }
      if(s.response.type === 'mc' && Array.isArray(s.response.choices)){
        const r = s.response;
        const choicesEs = tf(r,'choices');
        // Factual MCs carry answer: (index) + explain: — render as graded buttons.
        // NOTE: `stored`/data-choice are always keyed on the ENGLISH choice text
        // (r.choices), even when the Spanish label is shown — that's the value
        // persisted in Firestore, so it must stay language-stable.
        if(typeof r.answer === 'number'){
          const ansChoice = r.choices[r.answer];
          const answered = stored !== '';
          const opts = mcOrder(r.choices, mcSeed(r)).map(ci=>{
            const c = r.choices[ci];
            let cls = 'step-mc-opt';
            if(c === ansChoice) cls += ' is-answer';
            if(answered && c === stored) cls += (c === ansChoice) ? ' correct' : ' incorrect';
            return `<button type="button" class="${cls}" aria-pressed="${answered && c === stored}" data-choice="${escAttr(c)}" data-correct="${c===ansChoice?'1':'0'}" onclick="onStepMcSelect('${key}', this)"><span class="step-mc-text">${escHtml(choicesEs[ci])}</span><span class="step-mc-check">&#x2713;</span></button>`;
          }).join('');
          const explainHtml = r.explain ? `<div class="step-mc-explain">${escHtml(tf(r,'explain'))}</div>` : '';
          // The result is colour and a ✓ on screen; .step-mc-sr says it aloud
          // (onStepMcSelect fills it). After the explain, so the
          // `.answered + .step-mc-explain` reveal rule still matches.
          return `<div class="step-resp">${labelHtml}${promptHtml}<div class="step-resp-mc step-mc-keyed${answered?' answered':''}">${opts}</div>${explainHtml}<span class="sr-only step-mc-sr" aria-live="polite"></span></div>`;
        }
        // Reflection / observation MCs stay unkeyed — record the pick only.
        const opts = r.choices.map((c,ci)=>{
          const checked = stored===c ? 'checked' : '';
          return `<label class="step-resp-mc-opt"><input type="radio" name="resp-${key}" ${checked} data-choice="${escAttr(c)}" onchange="onResponseChange('${key}', this.dataset.choice)"><span>${escHtml(choicesEs[ci])}</span></label>`;
        }).join('');
        return `<div class="step-resp">${labelHtml}${promptHtml}<div class="step-resp-mc">${opts}</div></div>`;
      }
      return '';
    })() : '';
    /* Interactive drill (shuffle self-quiz) — sits under the doer row and
       above the written response, since it IS the doing. */
    const drillHtml = s.drill ? renderShuffleDrill(s.drill, `${w.id}-${ns}-${i}`, w.id) : '';
    const doneKey = `${w.id}-${ns}-${i}`;
    const isDone = completed[doneKey] === true;
    const isCur = pos === curPos;
    const isOpen = pos === openPos;
    // Mark-done is the last row of the step.
    const doneBtn = `<div class="step-done-row"><button class="step-done-btn${isDone ? ' is-done' : ''}" type="button" aria-pressed="${isDone}" onclick="toggleStepDone(this,'${doneKey}')">${stepDoneHtml(isDone)}</button></div>`;
    const skillsAttr = (s.skills && s.skills.length) ? ` data-skills="${s.skills.join(',')}"` : '';
    const label = stepLabel(s);
    const gnum = numOffset + pos + 1;          // position in the whole ladder
    const num = dispOffset + pos + 1;          // the number the student sees
    const ariaLabel = t(isDone ? 'step.ariaLabelDone' : 'step.ariaLabel', { n: num, label });
    const statusIcon = isDone ? '&#x2713;' : String(num);
    if(isOpen) openNum = gnum;
    const curAttr = isCur ? ' aria-current="step"' : '';
    // data-key is the step's progress key, the same in both languages — the
    // handle rebuildModuleContentPanels() uses to put the student back on
    // this row after a language switch. Never a storage key of its own.
    return `<li class="step${isDone ? ' step-done' : ''}${isCur ? ' cur' : ''}${isOpen ? '' : ' collapsed'}"${skillsAttr} data-num="${num}" data-key="${escAttr(doneKey)}">`
      + `<button type="button" class="step-head" aria-expanded="${isOpen}" onclick="toggleStepOpen(this)" aria-label="${escAttr(ariaLabel)}"${curAttr}>`
      + `<span class="step-status" aria-hidden="true">${statusIcon}</span>`
      + `<span class="step-label">${escHtml(label)}</span>`
      + `<span class="step-chev" aria-hidden="true">&#x25B6;</span>`
      + `</button>`
      + `<div class="step-detail"><span class="st-text">${text2}</span><div class="step-body">${playSeqHtml}${chordsHtml}${tabHtml}${tabsHtml}${drillHtml}${respHtml}${foldsHtml}</div>${doneBtn}</div>`
      + `</li>`;
   }).join('');
  };
  /* Generic tuning warm-up sections are superseded by the Daily 5 (which
     starts with the tune-up): render a pointer card above the numbered
     sections instead of taking a numbered slot itself. */
  const isTuningWarmup = sec => isTuningWarmupSection(sec, w.moduleNum);
  /* Every renderable section of the whole ladder, in order, each carrying
     the storage namespace its steps are keyed under — see lessonGroups()
     for the gi-is-the-storage-index rule that makes that safe. */
  const groups = lessonGroups(w);
  const flat = groups.flatMap(g => g.secs);
  /* A set shown as two parts (display only — see lessonParts). `parts.at`
     is the index in `flat` where Part 2 begins; everything before it is
     Part 1. Null for every ordinary set, which is every set but m4w2. */
  const parts = lessonParts(w, flat);
  const partOfIdx = k => (parts && k >= parts.at) ? 2 : 1;
  // Steps done / total for the ladder's progress pill — mirrors stepsHtml's
  // ns-per-section scheme, now summed across BOTH stations (one card, one pill).
  // visibleSteps() is what keeps a hidden step (or a whole take-to-song
  // section) out of "N of M" — a step nobody can ever mark done again would
  // otherwise make the pill impossible to complete.
  const lessonStepCounts = () => {
    let total=0, done=0;
    flat.forEach(({sec,ns}) => visibleSteps(sec, w.moduleNum).forEach(p=>{
      total++;
      if(completed[`${w.id}-${ns}-${p.idx}`]===true) done++;
    }));
    return {total,done};
  };
  /* The same sum, split at the part break — the in-ladder pill and the
     "Step n of m" counter go per-part for a set with parts, while
     resumeLessonCounts() (the resume card, My progress) stays whole-set:
     parts are chunks to work through, not a smaller set. */
  const partStepCounts = () => {
    const c = {1:{total:0,done:0}, 2:{total:0,done:0}};
    flat.forEach(({sec,ns}, k) => visibleSteps(sec, w.moduleNum).forEach(pr=>{
      const bucket = c[partOfIdx(k)];
      bucket.total++;
      if(completed[`${w.id}-${ns}-${pr.idx}`]===true) bucket.done++;
    }));
    return c;
  };
  /* The B→C seam. Station-level titles ("Computer station — …" / "Practice
     station — …") are no longer rendered — the room has no stations to name —
     but the practice half's title carries real content ("melodies & TAB",
     "requinto texture & your performance pattern"), so the seam keeps it:
     whatever follows the em-dash, same shape in both languages (so no
     per-language parsing), read through tf() so a language switch re-derives
     it. Same trick as lessonSubLabel() on the rail. */
  const stationTail = s => {
    const raw = (s && s.title) ? (tf(s,'title') || '') : '';
    const k = raw.indexOf('—');
    return k >= 0 ? raw.slice(k + 1).trim() : '';
  };
  const dividerHtml = s => {
    const tail = stationTail(s);
    return `<div class="stp-divider"><span class="stp-divider-label">${escHtml(t('lesson.nowPractice'))}${tail ? ' — ' + escHtml(tail) : ''}</span></div>`;
  };
  /* The PART marks — a heavier rule than the seam above, because this one
     is a stopping point and the seam is not. Two of them: a heading over
     the top of the ladder naming Part 1, and the divider that opens Part 2
     immediately above its first section. The Part 2 one carries the
     stop-here line and a "Keep going" button, which only shows while the
     divider is standing in as its own screen (stationStepNav →
     .pd-showing). Both hide in focus mode unless the open step is inside
     the part they name — same rule the seam follows one level down, kept
     live by syncStationFocus() and baked in here so a student resuming
     inside Part 2 never gets a Part 1 heading over nothing. */
  const partMarkHtml = (n, title, cur) =>
    `<div class="stp-partmark stp-part${n === 2 ? 'break' : 'one'}${cur ? ' part-cur' : ''}" data-part="${n}">`
    + `<div class="stp-part-band"><span class="stp-part-title" role="heading" aria-level="3">${escHtml(title)}</span></div>`
    + (n === 2
        ? `<p class="stp-part-stop">${escHtml(t('lesson.partStopHere'))}</p>`
          + `<button type="button" class="stp-part-go" onclick="dismissPartBreak(this)" data-i18n="lesson.partKeepGoing">${escHtml(t('lesson.partKeepGoing'))}</button>`
        : '')
    + `</div>`;
  const ladderHtml=()=>{
    /* The "Tune and warm up first" banner is switched off (2026-09-19,
       Jonathan): tuning and the finger warm-up happen as a class now, so
       the site asking for them again at the top of every ladder was 97px
       of the screen spent on work the room has already done. It was also
       the ONLY way into the Daily 5 overlay, so turning it off retires
       the Daily 5 too — deliberately, and by switch rather than deletion:
       buildDaily5() / openDaily5Here() / moduleStepsFlat() all stay, so
       flipping this back to true brings the whole thing back with it.
       (moduleStepsFlat() is also what checks.mjs 1ac watches for its
       visibleSteps() call — another reason it stays put.) */
    const reminder = DAILY5_ENABLED && groups.some(g => (g.s.sections||[]).some(isTuningWarmup))
      ? `<div class="daily5-inline">${t('daily5.tuneWarmupHtml',{btn:`<button type="button" class="daily5-inline-btn" onclick="openDaily5Here()">${ICO_BOLT} ${t('daily5.openToday')}</button>`})}</div>`
      : '';
    // Sections are plain group labels now, not their own accordion — every
    // step in the whole ladder is a row from the start (Concept B: one level
    // of chunking, not two). `.stp-sec` still wraps each group so deep links
    // can address "station S, section N, step K" — hence data-ns, which is the
    // section's storage namespace and the only stable handle now that DOM
    // position spans two stations.
    // Numbering runs continuously across sections AND across the old B→C
    // boundary (offset carries the running total) even though storage keys
    // stay section-local (`ns` + local `i`).
    // Only ONE step should be open at a time across the whole LADDER, not one
    // per section and not one per station — once an earlier section's current
    // step has claimed it, every later section (even ones with their own
    // incomplete steps) stays fully collapsed until the student works down.
    // Focus mode hides every section label except the one holding the open
    // step (`.sec-cur`, kept in sync by syncStationFocus() as the student
    // moves) — the heading of the group you're actually in, nothing else.
    const noneLeft = focusMode && !flat.some(({sec,ns}) => visibleSteps(sec, w.moduleNum).some(p=>completed[`${w.id}-${ns}-${p.idx}`]!==true));
    let numOffset = 0, dispOffset = 0, foundCur = false, curNs = null, curPart = 1;
    /* "Take it to a song" (2026-09-20): the card used to render under every
       step in focus mode, pushing Next down and inviting the student off to a
       Journey page mid-step. It should show only once the last visible step
       of its part (the whole ladder, for a set with no parts) is the open
       step or is done — computed once here, from the data, since openNum
       below isn't final until this same loop finishes; syncStationFocus()
       mirrors this from the DOM for live updates as the student navigates. */
    const jlSteps = [];
    flat.forEach((f, k) => visibleSteps(f.sec, w.moduleNum).forEach(p => jlSteps.push({ ns: f.ns, idx: p.idx, part: partOfIdx(k) })));
    const jlOpenPos = (() => {
      const i = jlSteps.findIndex(p => completed[`${w.id}-${p.ns}-${p.idx}`] !== true);
      return i >= 0 ? i : (noneLeft && jlSteps.length ? 0 : -1);
    })();
    const jlLastIdxByPart = {};
    jlSteps.forEach((p, i) => { jlLastIdxByPart[p.part] = i; });
    const jlReadyByPart = {};
    Object.keys(jlLastIdxByPart).forEach(part => {
      const i = jlLastIdxByPart[part], p = jlSteps[i];
      jlReadyByPart[part] = completed[`${w.id}-${p.ns}-${p.idx}`] === true || i === jlOpenPos;
    });
    const rendered = new Map();
    flat.forEach(({sec,ns}, k)=>{
      // Part 2's circles start at 1 again — display only: numOffset (and
      // so every storage key, Back/Next and openNum) keeps counting.
      if(parts && k === parts.at) dispOffset = 0;
      const pairs = visibleSteps(sec, w.moduleNum);
      const allowCur = !foundCur;
      const hasCur = allowCur && pairs.some(p=>completed[`${w.id}-${ns}-${p.idx}`]!==true);
      const openIfNoCur = noneLeft && k === 0;   // whole ladder done → section 1, step 1 stays open
      if(hasCur || openIfNoCur){ curNs = ns; curPart = partOfIdx(k); }
      const title = tf(sec,'title');
      // A take-to-song section renders the Journey link card in its slot
      // instead of a step list, but only when this module has a layer to
      // link to (modules 1–5) — its own steps never render or count then
      // (3b). With no layer (6+) there's no card, so it falls back to its
      // normal step list, same as any other section (2026-09-12 fix).
      // The card carries its own title (journey.takeItTitle), so the
      // section's own heading is suppressed only when the card is what's
      // actually shown, rather than stacking two.
      const hasJourneyCard = isTakeToSongSection(sec) && journeySongsFor(w.moduleNum).length > 0;
      const jlReady = hasJourneyCard && !!jlReadyByPart[partOfIdx(k)];
      const bodyHtml = hasJourneyCard
        ? journeyLinkCardHtml(w)
        : `<ul class="steps">${stepsHtml(pairs, ns, numOffset, allowCur, openIfNoCur, dispOffset)}</ul>`;
      // data-part goes AFTER data-ns on purpose: checks.mjs 1af reads the
      // rendered namespaces with a regex anchored on `class="stp-sec…"
      // data-ns="…"`, so anything new has to follow, never come between.
      const html = `<div class="stp-sec${(hasCur || openIfNoCur) ? ' sec-cur' : ''}${jlReady ? ' jl-ready' : ''}" data-ns="${escAttr(ns)}"${parts ? ` data-part="${partOfIdx(k)}"` : ''}>
      ${title && !hasJourneyCard ? `<div class="stp-sec-label" role="heading" aria-level="3">${isEarSparkSection(sec) ? ICO_BOLT + ' ' : isSpicyLevelUpSection(sec) ? ICO_CHILI + ' ' : ''}${title}</div>` : ''}
      ${bodyHtml}
    </div>`;
      if(hasCur) foundCur = true;
      numOffset += pairs.length;
      dispOffset += pairs.length;
      rendered.set(ns, html);
    });
    // Part 2's divider rides immediately above the section that opens it,
    // inside that section's own station wrapper — the B→C seam still
    // renders exactly where it does today (in m4w2 it falls inside Part 1).
    if(parts) rendered.set(parts.breakNs, partMarkHtml(2, parts.title2, curPart === 2) + rendered.get(parts.breakNs));
    /* One wrapper per station so the seam divider can hide itself in focus
       mode until the student is actually in the practice half (syncStationFocus
       toggles .div-cur) — a lone divider floating above a hidden step reads as
       a heading for nothing. */
    /* .div-cur has to be baked in, not left to syncStationFocus(): a fresh
       render is the common case (every set open, every language switch) and a
       student resuming inside the practice half would otherwise get a seam
       that only appears once they touch something. */
    const partOneHtml = parts ? partMarkHtml(1, parts.title1, curPart === 1) : '';
    /* .div-cur, baked in (see above). For a set with parts there's a
       second condition: the seam introduces the sections at the TOP of
       its station, which in m4w2 are all in Part 1 — so once the open
       step is in Part 2, "Now practice it" is a heading for a half that
       started nine steps ago, stacked right above the Part 2 divider.
       Same "don't head a part you're not in" rule the part marks follow. */
    // `!parts ||` first: a set without a partBreak never reaches the second
    // test, so its seam behaves exactly as it did before parts existed.
    const groupCur = g => g.secs.some(({ns}) => ns === curNs)
      && (!parts || partOfIdx(flat.findIndex(f => f.ns === g.secs[0].ns)) === curPart);
    return reminder + partOneHtml + groups.map(g =>
      `<div class="stp-group${groupCur(g) ? ' div-cur' : ''}" data-group="${g.id}">`
      + (g.id === 'c' ? dividerHtml(g.s) : '')
      + g.secs.map(({ns}) => rendered.get(ns)).join('')
      + `</div>`).join('');
  };
  /* Single-flow sets (e.g. Module 13 · String Changing) have no practice half
     to merge, so they keep their own process title on the card; merged sets
     show no station title at all (the seam divider carries C's words). */
  const single = !(w.stations && w.stations.c);
  const body = ladderHtml();
  const {total: stepTotal, done: stepDone} = lessonStepCounts();
  /* Which part the chrome reports on: the one holding the open row. With
     no row open at all (list view can leave every step collapsed) it's the
     first part that still has unfinished work — so a student who has
     finished Part 1 sees Part 2's numbers, which is the work order's "once
     Part 1 is complete OR the student is past the divider". */
  const pc = parts ? partStepCounts() : null;
  const curPartNum = !parts ? 0
    : openNum > 0 ? (openNum > pc[1].total ? 2 : 1)
    : (pc[1].done >= pc[1].total ? 2 : 1);
  const pillKey = parts ? 'progress.partStepsDone' : 'progress.stepsDone';
  const pillParams = parts
    ? {n: curPartNum, done: pc[curPartNum].done, total: pc[curPartNum].total}
    : {done: stepDone, total: stepTotal};
  const pillPct = parts
    ? (pc[curPartNum].total ? pc[curPartNum].done / pc[curPartNum].total : 0)
    : (stepTotal ? stepDone / stepTotal : 0);
  const pillHtml = stepTotal > 0 ? `<span class="prog-pill-wrap">`
    + `<span class="prog-pill" data-i18n="${pillKey}" data-i18n-params="${escAttr(JSON.stringify(pillParams))}">${t(pillKey, pillParams)}</span>`
    + `<span class="prog-mini"><i style="width:${Math.round(pillPct*100)}%"></i></span>`
    + `</span>` : '';
  const titleHtml = (single && w.stations.b && w.stations.b.title) ? `<h3 class="dp-title">${tf(w.stations.b,'title')}</h3>` : '';
  /* .dp-head is a TITLE row now and nothing else — the progress pill moved
     up into the sticky set band (see _lessonChrome below), so the only set
     that still renders one is a single-flow set carrying its own process
     title (Module 13). Everywhere else it isn't emitted at all. */
  const headHtml = titleHtml ? `<div class="dp-head">${titleHtml}</div>` : '';
  /* Stepper bar: where-am-I counter (focus mode only) + the view toggle,
     which stays visible in BOTH views — it's the only way back to focus. */
  // "Step n of m" counts within the current part for a set with parts;
  // Back/Next below stay whole-ladder, so Next still crosses the divider.
  const countParams = parts
    ? {n: Math.max(1, (openNum || 1) - (curPartNum === 2 ? pc[1].total : 0)), m: pc[curPartNum].total}
    : {n: openNum || 1, m: stepTotal};
  /* ── The lesson chrome rides in the sticky set band, not the card ──
     (Chromebook viewing-area work order, 2026-09-19.) The progress pill,
     "Step n of m" and the All steps / One at a time toggle used to be two
     more full-width rows at the top of the card; on a 657px-tall
     Chromebook screen they were 65px of the 365px of chrome standing
     between the student and the first line of the step they were meant to
     be reading. They are the same elements with the same ids, keys and
     params — only their DOM home moved, into .set-eyebrow, which is built
     one function up in buildSet(). Handed over through _lessonChrome
     because buildLesson() returns a string: buildSet() calls it FIRST and
     reads this afterwards (see the comment there).
     Everything that keeps them live — applyStationView, syncStationFocus,
     refreshLessonPill — looks them up through lessonChromeQ(dp, …) rather
     than dp.querySelector, for exactly this reason. */
  const chromeInner = stepTotal > 0
    ? `<span class="fm-count" aria-live="polite" data-i18n="fm.stepOf" data-i18n-params="${escAttr(JSON.stringify(countParams))}">${t('fm.stepOf', countParams)}</span>`
      + pillHtml
      + stationViewSegHtml(focusMode)
    : '';
  /* .cf-focus mirrors the card's own .focus class onto the chrome, because
     the chrome is no longer inside .dp for `.dp:not(.focus) .fm-count` to
     reach. applyStationView() keeps it in sync when the view flips. */
  _lessonChrome = chromeInner
    ? `<span class="se-chrome${focusMode ? ' cf-focus' : ''}">${chromeInner}</span>`
    : '';
  /* Back/Next lives once per card at the very end: in focus mode every other
     row is display:none, so it lands directly under the open step's detail
     (no per-step copies to keep in sync). Hidden entirely in list mode. */
  const navHtml = stepTotal > 1 ? `<div class="dp-stepnav">`
    + `<button type="button" class="fm-nav fm-back" onclick="stationStepNav(this,-1)" data-i18n="fm.back"${(openNum || 1) <= 1 ? ' hidden' : ''}>${t('fm.back')}</button>`
    + `<button type="button" class="fm-nav fm-next" onclick="stationStepNav(this,1)" data-i18n="fm.next"${(openNum || 1) >= stepTotal ? ' hidden' : ''}>${t('fm.next')}</button>`
    + `</div>` : '';
  // .at-end drives whether the panel's "Next: My skills checklist" footer
  // shows in focus mode (CSS, styles.css) — only once there's no further
  // step to advance to, kept live by syncStationFocus() as the student moves.
  const atEnd = (openNum || 1) >= stepTotal;
  return `
    <div class="dp${focusMode ? ' focus' : ''}${atEnd ? ' at-end' : ''}${parts ? ' has-parts' : ''}" id="${w.id}-dp-b">
      ${headHtml}
      ${body}
      ${navHtml}
    </div>`;
}
/* buildLesson()'s side channel for the sticky-band chrome (see the comment
   at its assignment). Written on every buildLesson() call and read once,
   immediately, by buildSet() — never stored, never read anywhere else. */
let _lessonChrome = '';
/* The pill / counter / view toggle live in the set band, which is a SIBLING
   of the .dp card, so `dp.querySelector` can't see them any more. One
   lookup for all four call sites: search the card first (harmless, and it
   keeps working if a panel ever renders its own copy inline), then the
   band belonging to the same set. */
function lessonChromeQ(dp, sel){
  if(!dp) return null;
  const inCard = dp.querySelector(sel);
  if(inCard) return inCard;
  const wrap = dp.closest('.week-panel');
  return wrap ? wrap.querySelector(`.set-eyebrow ${sel}`) : null;
}

// "Mark done" ⇄ "✓ Done" — a state-and-language-dependent label, so the
// data-i18n key travels with the current state and a later pure language
// switch (no state change) still resolves to the right word.
function stepDoneHtml(isDone){
  return isDone
    ? `&#x2713; <span data-i18n="btn.doneWord" translate="no" class="notranslate">${t('btn.doneWord')}</span>`
    : `<span data-i18n="btn.markDone" translate="no" class="notranslate">${t('btn.markDone')}</span>`;
}
function toggleStepDone(btn, key){
  if(btn.closest('.week-panel.set-peek')) return;   // read-only preview — no writes
  const li = btn.closest('.step');
  const nowDone = !li.classList.contains('step-done');
  li.classList.toggle('step-done', nowDone);
  btn.classList.toggle('is-done', nowDone);
  btn.setAttribute('aria-pressed', nowDone);
  btn.innerHTML = stepDoneHtml(nowDone);
  const status = li.querySelector('.step-status');
  if(status) status.textContent = nowDone ? '✓' : (li.dataset.num || status.textContent);
  const head = li.querySelector('.step-head');
  const labelEl = li.querySelector('.step-label');
  if(head) head.setAttribute('aria-label', t(nowDone ? 'step.ariaLabelDone' : 'step.ariaLabel', { n: li.dataset.num, label: labelEl ? labelEl.textContent : '' }));
  // Un-marking done just updates the icon above — no forced expand/collapse.
  if(nowDone) collapseAndAdvance(li);
  onCompleteChange(key, nowDone);
  updateProgressPill(li);
  /* The tick's little pop, on the step's ✓ circle — or, when marking it done
     hid the row (One-step view moved on to the next step), on the set band's
     progress pill and bar, the one place the tick still shows. */
  if(nowDone){
    const status = li.querySelector('.step-status');
    tickPop(status && status.getClientRects().length ? status : lessonChromeQ(li.closest('.dp'), '.prog-pill-wrap'));
  }
}
/* ── TICK POP — the check-off feels done (2026-11-13) ─────────────────
   A short scale-and-settle with a soft green ring on the one tick a student
   just turned ON: a lesson step's "Mark done" (toggleStepDone, above) and a
   checklist "I've got it!" (toggleSkill, app/audio-ui.js), both called only
   after their own code has accepted the tick (a peeked set and a refused
   Coach / deck gate return before it). No sound, nothing saved, nothing
   waited on: it only adds the class .tick-pop, and takes it off again on the
   animation's end, or after TICK_POP_MS if that never comes (reduced
   motion turns the animation off, a hidden element never runs it). So a
   later re-render, a language switch or the save's own repaint draws the
   tick without it, and a tick painted on page load never has it. The CSS
   is the TICK POP block at the end of styles.css; under
   prefers-reduced-motion it is never added at all. */
const TICK_POP_MS = 700;
function tickPop(el){
  if(!el || !el.classList) return;
  try { if(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; } catch(e){}
  // A second tick inside the 400 ms (on, off, on) restarts it: reading the width makes the browser drop the old run first.
  if(el._tickPopEnd){ el._tickPopEnd(); void el.offsetWidth; }
  const end = () => {
    clearTimeout(el._tickPopT);
    el.removeEventListener('animationend', onEnd);
    el.classList.remove('tick-pop');
    el._tickPopEnd = null;
  };
  // The element's own run, not the ring's (::after reports on the same target) or a child's.
  const onEnd = ev => { if(ev.target === el && !ev.pseudoElement) end(); };
  el._tickPopEnd = end;
  el.addEventListener('animationend', onEnd);
  el._tickPopT = setTimeout(end, TICK_POP_MS);
  el.classList.add('tick-pop');
}

/* ── Focus mode ("one at a time") ──────────────────────────────────────
   A site-wide view pref, not per-station: a student who wants one step on
   screen wants it everywhere. Unset = focus, so the default install opens
   on the calmer view; only an explicit 'list' opts out. */
function stationViewMode(){
  try{ return localStorage.getItem('stationView') === 'list' ? 'list' : 'focus'; }
  catch(e){ return 'focus'; }
}
function stationViewIsFocus(){ return stationViewMode() === 'focus'; }
/* The view switch is a two-segment control (navigability work order
   2026-09-23, item 9) — "One step | All steps" with the CURRENT view lit —
   instead of one button whose label named the OTHER view, which read as a
   status line ("All steps" while showing one at a time). Same two keys,
   same toggleStationView() underneath; setStationView() is the click
   target so pressing the segment already lit is a no-op. */
function stationViewSegHtml(focus){
  return `<span class="fm-seg" role="group" aria-label="${escAttr(t('fm.viewAria'))}" data-i18n-attr="aria-label:fm.viewAria">`
    + `<button type="button" class="fm-seg-btn${focus ? ' on' : ''}" aria-pressed="${focus}" onclick="setStationView(true)" data-i18n="fm.focusView">${t('fm.focusView')}</button>`
    + `<button type="button" class="fm-seg-btn${focus ? '' : ' on'}" aria-pressed="${!focus}" onclick="setStationView(false)" data-i18n="fm.listView">${t('fm.listView')}</button>`
    + `</span>`;
}
function setStationView(focus){
  if(stationViewIsFocus() === !!focus) return;
  toggleStationView();
}

/* Flip the pref and re-skin every card already on the page — the open step,
   the responses typed into it and any running drill all survive, so this
   never rebuilds. */
function toggleStationView(){
  const focus = !stationViewIsFocus();
  try{ localStorage.setItem('stationView', focus ? 'focus' : 'list'); }catch(e){}
  document.querySelectorAll('.dp').forEach(dp=>applyStationView(dp, focus));
}
function applyStationView(dp, focus){
  dp.classList.toggle('focus', focus);
  // The part-divider screen belongs to focus mode's Back/Next; flipping the
  // view is the other way out of it, so it never survives the switch.
  dp.classList.remove('pd-showing');
  /* Entering focus mode: land on exactly one row. List view can leave none
     open (everything collapsed → an empty card) or several ("Show me where"
     lights up every step that teaches a skill), so pick the first open one,
     or the first not-done step, and close the rest. */
  if(focus){
    const steps = [...dp.querySelectorAll('li.step')];
    const target = dp.querySelector('li.step:not(.collapsed)')
      || steps.find(li=>!li.classList.contains('step-done')) || steps[0];
    if(target){
      closeOtherStepsInDp(dp, target);
      target.classList.remove('collapsed');
      const h = target.querySelector('.step-head');
      if(h) h.setAttribute('aria-expanded','true');
    }
  }
  // The chrome sits in the set band now, not the card — mirror the view
  // state onto it so `.se-chrome:not(.cf-focus) .fm-count` still hides the
  // counter in list view (it used to ride on .dp's own .focus class).
  const chrome = lessonChromeQ(dp, '.se-chrome');
  if(chrome) chrome.classList.toggle('cf-focus', focus);
  const seg = lessonChromeQ(dp, '.fm-seg');
  if(seg){
    seg.querySelectorAll('.fm-seg-btn').forEach((b, i) => {
      const on = (i === 0) === !!focus;   // first segment = One step
      b.classList.toggle('on', on);
      b.setAttribute('aria-pressed', String(on));
    });
  }
  syncStationFocus(dp);
}

/* Keep the focus-mode chrome pointed at whichever row is open: the one
   section label that shows, the "Step n of m" counter, and whether Back /
   Next are reachable. Safe (and cheap) to call in list mode too. */
function syncStationFocus(dp){
  if(!dp) return;
  const steps = [...dp.querySelectorAll('li.step')];
  const open = dp.querySelector('li.step:not(.collapsed)');
  const idx = open ? steps.indexOf(open) : -1;
  dp.querySelectorAll('.stp-sec').forEach(sec=>sec.classList.toggle('sec-cur', !!open && sec.contains(open)));
  // Same rule one level up: in focus mode the B→C seam divider only shows
  // while the open step is in the practice half it introduces.
  /* And once more for a set shown in two parts: the Part 1 heading and the
     Part 2 divider each show only while the open row is inside the part
     they name — otherwise a student resuming inside Part 2 gets a Part 1
     heading with nothing under it. */
  const parted = dp.classList.contains('has-parts');
  const part = parted ? lessonCurrentPart(dp) : null;
  if(parted) dp.querySelectorAll('.stp-partmark').forEach(m=>m.classList.toggle('part-cur', m.dataset.part === part));
  dp.querySelectorAll('.stp-group').forEach(g=>{
    // The seam is subject to the same rule: it heads the sections at the
    // top of its station, and in a parted set those are all in Part 1, so
    // it stops showing once the open row is in Part 2 rather than sitting
    // directly above the Part 2 divider saying "now practice it".
    // `!parted ||` first: data-part is only emitted for a set with a
    // partBreak, so a set without one never reaches the second test and
    // keeps the plain "open step is in this group" rule it always had.
    const first = g.querySelector('.stp-sec[data-part]');
    const on = !!open && g.contains(open) && (!parted || !first || first.dataset.part === part);
    g.classList.toggle('div-cur', on);
  });
  // "Take it to a song": shows only once the last visible step of its part
  // (the whole ladder, for a set with no parts) is the open step or is done
  // — same "don't show it early" rule as the seam and part marks above.
  dp.querySelectorAll('.jl-card').forEach(card=>{
    const jlSec = card.closest('.stp-sec');
    if(!jlSec) return;
    const jlScope = parted ? lessonPartSteps(dp, jlSec.dataset.part) : steps;
    const last = jlScope[jlScope.length - 1];
    jlSec.classList.toggle('jl-ready', !!last && (last.classList.contains('step-done') || last === open));
  });
  // The counter is per-part too; Back/Next below stay whole-ladder so Next
  // can still carry the student across the divider.
  const scope = parted ? lessonPartSteps(dp, part) : steps;
  const count = lessonChromeQ(dp, '.fm-count');
  if(count){
    const sIdx = open ? scope.indexOf(open) : -1;
    const params = parted
      ? {n: sIdx >= 0 ? sIdx + 1 : 1, m: scope.length}
      : {n: open ? (Number(open.dataset.num) || idx + 1) : 1, m: steps.length};
    count.setAttribute('data-i18n-params', JSON.stringify(params));
    count.textContent = t('fm.stepOf', params);
  }
  if(parted) refreshLessonPill(dp);
  dp.classList.toggle('at-end', idx < 0 || idx >= steps.length - 1);
  const nav = dp.querySelector('.dp-stepnav');
  if(nav){
    const back = nav.querySelector('.fm-back'), next = nav.querySelector('.fm-next');
    if(back) back.hidden = idx <= 0;
    if(next) next.hidden = idx < 0 || idx >= steps.length - 1;
    /* Hiding the focused button drops keyboard focus to <body> (Next on
       the last step, Back on the first): hand it to the other button, or
       to the open row's heading. */
    if([back, next].some(b => b && b.hidden && b === document.activeElement)){
      const to = [back, next].find(b => b && !b.hidden) || (open && open.querySelector('.step-head'));
      if(to) to.focus({preventScroll: true});
    }
  }
}

/* Back / Next: move the open row across the WHOLE card (sections included)
   without touching done state — reading ahead isn't the same as finishing. */
function stationStepNav(btn, dir){
  const dp = btn.closest('.dp');
  if(!dp) return;
  const steps = [...dp.querySelectorAll('li.step')];
  const open = dp.querySelector('li.step:not(.collapsed)');
  const idx = open ? steps.indexOf(open) : -1;
  const target = idx < 0 ? steps[0] : steps[idx + dir];
  if(!target) return;
  expandStepEl(target);
  /* Crossing the part divider going FORWARD: show the divider as its own
     screen, once. Part 2's first step is already the open row underneath,
     so "Keep going" only lifts the screen — and because nothing about
     this is stored (a fresh render never sets the class), a student
     resuming later lands straight on Part 2 without replaying it. */
  if(dir > 0 && dp.classList.contains('focus') && crossedPartBreak(dp, open, target)){
    dp.classList.add('pd-showing');
    const mark = dp.querySelector('.stp-partbreak');
    if(mark) requestAnimationFrame(()=>mark.scrollIntoView({block:'start'}));
    // .pd-showing hides the Back/Next row this button sits in; "Keep going"
    // (above it, in the divider) is the way on, so focus goes there.
    const go = mark && mark.querySelector('.stp-part-go');
    if(go && btn === document.activeElement) go.focus({preventScroll: true});
    return;
  }
  nudgeStepIntoView(target, true);
}
function crossedPartBreak(dp, from, to){
  if(!from || dp.dataset.pdSeen === '1') return false;
  const mark = dp.querySelector('.stp-partbreak');
  if(!mark) return false;
  const AFTER = Node.DOCUMENT_POSITION_FOLLOWING;
  return !!(from.compareDocumentPosition(mark) & AFTER) && !!(mark.compareDocumentPosition(to) & AFTER);
}
function dismissPartBreak(btn){
  const dp = btn.closest('.dp');
  if(!dp) return;
  dp.dataset.pdSeen = '1';
  dp.classList.remove('pd-showing');
  const open = dp.querySelector('li.step:not(.collapsed)');
  if(open) nudgeStepIntoView(open, true);
  syncStationFocus(dp);
  // "Keep going" hides itself with the divider screen: focus moves to the
  // Part 2 step it opened onto.
  const head = open && open.querySelector('.step-head');
  if(head && btn === document.activeElement) head.focus({preventScroll: true});
}

/* Collapsing a taller open step ABOVE this one shortens the page, which
   can yank the just-opened step up under the sticky header. After layout
   settles, nudge it back into view — scroll-margin-top (styles.css) makes
   scrollIntoView land below the header, not at viewport top. `force` also
   pulls a step that landed BELOW the fold up (Back/Next navigation). */
function nudgeStepIntoView(li, force){
  if(!li) return;
  requestAnimationFrame(()=>{
    const hdr = document.querySelector('.header');
    const hdrH = hdr ? hdr.offsetHeight : 0;
    /* The lesson scrolls inside .main now, so "hidden at the top" means
       behind the sticky set band at the top of THAT scrollport, not behind
       the header — the header sits above the scrollport entirely. */
    const eyebrow = document.querySelector('.week-panel.active .set-eyebrow');
    const coverTo = eyebrow ? eyebrow.getBoundingClientRect().bottom : hdrH;
    const top = li.getBoundingClientRect().top;
    if(top < coverTo || (force && top > window.innerHeight - 80)) li.scrollIntoView({block:'start'});
  });
}

// Close every other step in the whole card, leaving `keep` untouched. Card-wide,
// not per-section: two sections could each hold an open step otherwise, which is
// exactly one step too many in either view.
function closeOtherStepsInDp(root, keep){
  if(!root) return;
  root.querySelectorAll('li.step').forEach(other=>{
    if(other===keep) return;
    other.classList.add('collapsed');
    const h = other.querySelector('.step-head');
    if(h) h.setAttribute('aria-expanded','false');
  });
}
// A step always lives inside a .dp; the ul fallback just keeps this honest.
function stepScope(li){ return li.closest('.dp') || li.closest('ul.steps'); }

function toggleStepOpen(btn){
  const li = btn.closest('.step');
  const dp = li.closest('.dp');
  const willOpen = li.classList.contains('collapsed');
  /* In focus mode the head is the open step's HEADING, not a collapse
     control — closing it would leave the card blank, so taps no-op. */
  if(!willOpen && dp && dp.classList.contains('focus')) return;
  closeOtherStepsInDp(stepScope(li), li);
  li.classList.toggle('collapsed', !willOpen);
  btn.setAttribute('aria-expanded', String(willOpen));
  syncStationFocus(dp);
  if(willOpen) nudgeStepIntoView(li);
}

/* Deep links (search, "Show me where") land on a collapsed row — open it in
   place. `keepOthers` lets one caller (showSkillLesson in list view) light up
   several rows at once; everything else keeps the single-open rule. */
function expandStepEl(li, keepOthers){
  if(!li) return;
  if(!keepOthers) closeOtherStepsInDp(stepScope(li), li);
  li.classList.remove('collapsed');
  const head = li.querySelector('.step-head');
  if(head) head.setAttribute('aria-expanded','true');
  syncStationFocus(li.closest('.dp'));
}

// Mark done: collapse this row, drop its .cur badge, and open the next not-done step.
function collapseAndAdvance(li){
  const dp = li.closest('.dp');
  const scope = stepScope(li);
  const steps = scope ? [...scope.querySelectorAll('li.step')] : [li];
  // `.cur` is "the resume point", so exactly one row wears it card-wide —
  // marking a step done out of order used to leave a second one behind.
  steps.forEach(st=>{
    st.classList.remove('cur');
    const h = st.querySelector('.step-head');
    if(h) h.removeAttribute('aria-current');
  });
  // Card-wide, so finishing a section's last step advances into the next one
  // instead of dead-ending at the section boundary.
  const next = steps.slice(steps.indexOf(li)+1).find(sib=>!sib.classList.contains('step-done'));
  const focus = !!dp && dp.classList.contains('focus');
  // Nothing left to advance to: focus mode would go blank, so the finished
  // step stays open with its ✓. List mode collapses it as it always has.
  if(next || !focus){
    li.classList.add('collapsed');
    const head = li.querySelector('.step-head');
    if(head) head.setAttribute('aria-expanded','false');
  }
  if(next){
    next.classList.remove('collapsed');
    next.classList.add('cur');
    const nh = next.querySelector('.step-head');
    if(nh){ nh.setAttribute('aria-expanded','true'); nh.setAttribute('aria-current','step'); }
    if(focus) nudgeStepIntoView(next);
  }
  syncStationFocus(dp);
  /* The Done button just pressed is inside a row that is now collapsed
     (hidden), so keyboard focus would fall back to <body>. Move it to the
     row that opened — or this row's own head when nothing did. */
  if(li.classList.contains('collapsed') && li.contains(document.activeElement)){
    const to = (next || li).querySelector('.step-head');
    if(to) to.focus({preventScroll: true});
  }
}

function updateProgressPill(li){ refreshLessonPill(li.closest('.dp')); }
/* ── Per-part chrome helpers (a set with `partOne`/`partBreak`) ───────
   All three read the DOM rather than the module data, so they work the
   same whether the card was just built or a student has been ticking
   steps in it for ten minutes. A set with no parts carries no
   `data-part`, so `parted` is false everywhere and nothing changes. */
function lessonPartSteps(dp, part){
  return [...dp.querySelectorAll(`.stp-sec[data-part="${part}"] li.step`)];
}
/* Which part the chrome reports on: the one holding the open row, or —
   with nothing open (list view can leave every step collapsed) — the
   first part that still has unfinished work, falling back to the last. */
function lessonCurrentPart(dp){
  const open = dp.querySelector('li.step:not(.collapsed)');
  const sec = open && open.closest('.stp-sec');
  if(sec && sec.dataset.part) return sec.dataset.part;
  const nums = [...new Set([...dp.querySelectorAll('.stp-sec[data-part]')].map(x=>x.dataset.part))];
  return nums.find(n => lessonPartSteps(dp, n).some(li=>!li.classList.contains('step-done')))
    || nums[nums.length-1] || '1';
}
function refreshLessonPill(dp){
  const pill = lessonChromeQ(dp, '.prog-pill');
  if(!pill) return;
  const parted = dp.classList.contains('has-parts');
  const part = parted ? lessonCurrentPart(dp) : null;
  const scope = parted ? lessonPartSteps(dp, part) : [...dp.querySelectorAll('li.step')];
  const total = scope.length;
  const done = scope.filter(li=>li.classList.contains('step-done')).length;
  const key = parted ? 'progress.partStepsDone' : 'progress.stepsDone';
  const params = parted ? {n: Number(part), done, total} : {done, total};
  pill.setAttribute('data-i18n', key);
  pill.setAttribute('data-i18n-params', JSON.stringify(params));
  pill.textContent = t(key, params);
  const mini = lessonChromeQ(dp, '.prog-mini i');
  if(mini) mini.style.width = `${Math.round(total ? done/total*100 : 0)}%`;
}

/* ── Songs ── */
/* Song-list badge ("Core" / "Choice" / "Focus" / "Supp"). The type lives in the
   module data as an English keyword, so it has to go through i18n here or the
   badge stays English in Español mode — which it did site-wide until 2026-08-08.
   Unknown types fall back to the raw keyword rather than rendering blank. */
function songTypeLabel(type, core){
  const key = { Core: 'hub.tagCore', Choice: 'hub.tagChoice',
                Focus: 'hub.tagFocus', Supp: 'hub.tagSupp' }[type];
  if(key) return t(key);
  return type || t(core ? 'hub.tagCore' : 'hub.tagChoice');
}


/* THE song-video launcher — every song list (per-set, Songs hub)
   routes through this so the kind dispatch and subtitles can't drift. */
function openSongVid(s, kind){
  if(!s) return;
  if(kind==='journey'){ if(s.journeyUrl) window.open(journeyHref(s.journeyUrl, 0, journeyFromHere()), '_blank', 'noopener'); return; }
  if(kind==='original'){ if(s.originalUrl) window.open(s.originalUrl, '_blank', 'noopener'); return; }
  if(kind==='backing'){ if(s.backingUrl) loadPanel(/\.(mp3|m4a|ogg|wav)(\?|$)/i.test(s.backingUrl)?'audio':'youtube', s.backingUrl, tf(s, 'name'), t('songs.backingTrackHint')); return; }
  if(s.tutorialUrl) loadPanel('youtube', s.tutorialUrl, tf(s, 'name'), t('songs.tutorial'));
}
/* ── 10-Minute Routine card (module review) + Daily 5 panel ──
   Both assemble themselves from the module's already-loaded SETS data, so
   future content edits propagate automatically. Read-only: no Firebase writes. */
function stripTags(html){
  const d=document.createElement('div');
  // Insert a space at block/line-break boundaries before flattening, so a
  // lead-in ending in ":" doesn't abut the first <li> in one-line previews
  // ("…(every session): When you're not…" — not "…(every session):When…").
  d.innerHTML=(html||'').replace(/<\/?(?:p|div|li|ol|ul|h[1-6]|tr|table|blockquote|br|hr)\b[^>]*>/gi, '$& ');
  return (d.textContent||'').replace(/\s+/g,' ').trim();
}
function truncateText(s, n){ if(s.length<=n) return s; const cut=s.slice(0,n); return cut.slice(0, Math.max(cut.lastIndexOf(' '), n-20))+'…'; }
// Short one-line label for a step's collapsed checklist row.
// Every step now carries a hand-written label/label_es (enforced by
// checks.mjs for i18nComplete modules) — the derivation below is only a
// fallback so a future unlabeled step still gets a usable header instead
// of a blank row.
function stepLabel(s){
  const lbl = (tf(s,'label') || '').trim();
  if(lbl) return lbl;
  const plain = stripTags(tf(s,'text') || '').trim();
  if(!plain && s.response && s.response.prompt) return truncateText(stripTags(tf(s.response,'prompt')), 60);
  // English "Challenge N — X:" / Spanish "Reto N — X:" both strip down to just X.
  const challengeMatch = plain.match(/^(?:Challenge|Reto)\s*\d*\s*[—-]\s*([^:]+):/);
  if(challengeMatch) return truncateText(challengeMatch[1].trim(), 60);
  // "Lead-in (aside): directions…" → just the lead-in, aside dropped.
  const leadIn = plain.match(/^([^:.!?]{3,60}?)(?:\s*\([^)]*\))?\s*:\s/);
  if(leadIn) return truncateText(leadIn[1].trim(), 60);
  return truncateText(plain, 60);
}
// Every step in a module, in document order, with its set + section context.
function moduleStepsFlat(moduleNum){
  const out=[];
  SETS.filter(w=>w.moduleNum===moduleNum && !w.comingSoon).forEach(w=>{
    ['b','c'].forEach(st=>{
      const stn=w.stations && w.stations[st]; if(!stn) return;
      // Only what the ladder still shows is candidate material for the
      // Daily 5 routine card: a hidden step (its skill now taught by a class
      // activity) is out, and so is every step of a retired section
      // (Checkpoint / Wrap-Up / Practice Routine / Ear Spark, or a
      // take-to-song card) — the same visibleSections/visibleSteps gateway
      // buildLesson reads through, so the two can't disagree.
      const sections = stn.sections
        ? visibleSections(stn, w.moduleNum).map(p => p.sec)
        : (stn.steps ? [{title:'', steps:stn.steps}] : []);
      sections.forEach(sec=>visibleSteps(sec, w.moduleNum).forEach(p=>out.push({set:w, station:st, secTitle:sec.title||'', step:p.st})));
    });
  });
  return out;
}
function routinePlaySeq(ps, key){
  const bpm=readStoredBpm(key, ps.bpm||60);
  const hasHolds = (ps.notes || []).some(n => n && typeof n === 'object' && !Array.isArray(n));
  return `<span class="bpm-control-group">`+
    `<button type="button" class="play-seq-btn" data-midis="${escAttr(JSON.stringify(ps.notes))}" onclick="playSequenceFromGroup(this)" title="${escAttr(t('routine.playIt'))}">&#x25B6; ${escHtml((ps.label && tf(ps,'label')) || t('routine.playIt'))}</button>`+
    renderBpmControl(key, bpm, ps.minBpm||40, ps.maxBpm||120)+(hasHolds ? '' : coachBtnHtml(JSON.stringify(ps.notes)))+`</span>`;
}
function buildModuleRoutine(moduleNum){
  const steps=moduleStepsFlat(moduleNum);
  if(!steps.length) return '';
  const sets=SETS.filter(w=>w.moduleNum===moduleNum && !w.comingSoon);
  // Skill drill: the LAST set's first playSeq step (latest material = the
  // "hardest drill" heuristic), walking back set by set if needed.
  let drill=null;
  for(let i=sets.length-1; i>=0 && !drill; i--){
    drill=steps.find(x=>x.set===sets[i] && x.step.playSeq)||null;
  }
  // Chord / scale work: first step with a chords: spec; else the module's
  // first playSeq that isn't already the drill.
  let chordWork=steps.find(x=>x.step.chords && x.step.chords.length)||null;
  if(!chordWork){ chordWork=steps.find(x=>x.step.playSeq && x!==drill)||null; }
  // Song: the most recent "Take It to a Song" step.
  const songSteps=steps.filter(x=>/take it to a song/i.test(x.secTitle) || /take it to a song/i.test(x.step.text||''));
  const song=songSteps.length ? songSteps[songSteps.length-1] : null;
  const wu=WARMUP_BANK[moduleNum % WARMUP_BANK.length];
  const li=(mins, title, body)=>`<li class="routine-item"><span class="routine-min">${mins} min</span><div class="routine-body"><strong>${title}</strong> ${body}</div></li>`;
  const setLink=(x)=>`<button type="button" class="mr-review-link" onclick="goToSet('${x.set.id}')" title="${escAttr(t('routine.openThisSet'))}">&#8617; ${escHtml(tSetLabel(x.set.label))}</button>`;
  let items='';
  items+=li(1,t('routine.tuneUp'),t('routine.tuneUpBody'));
  items+=li(1,t('routine.fingerGym'),`&mdash; ${escHtml(tf(wu,'text'))}<br>${routinePlaySeq(wu, `bpm:routine:${moduleNum}:wu`)}`);
  if(drill) items+=li(3,t('routine.skillDrill'),`&mdash; ${escHtml(truncateText(stripTags(tf(drill.step,'text')),180))} ${setLink(drill)}<br>${routinePlaySeq(drill.step.playSeq, `bpm:routine:${moduleNum}:drill`)}`);
  if(chordWork && chordWork!==drill){
    const c=chordWork.step;
    const inner=c.chords && c.chords.length
      ? `&mdash; ${escHtml(truncateText(stripTags(tf(c,'text')),180))} ${setLink(chordWork)}<div class="chord-diagrams">${c.chords.map(ch=>`<div class="chord-box">${chordDiagramSVG(ch)}${ch.name?`<div class="chord-box-label">${escHtml(tf(ch,'name'))}</div>`:''}</div>`).join('')}</div>`
      : `&mdash; ${escHtml(truncateText(stripTags(tf(c,'text')),180))} ${setLink(chordWork)}<br>${routinePlaySeq(c.playSeq, `bpm:routine:${moduleNum}:chords`)}`;
    items+=li(3,t('routine.chordScaleWork'),inner);
  }
  if(song) items+=li(2,t('routine.song'),`&mdash; ${escHtml(truncateText(stripTags(tf(song.step,'text')),220))} ${setLink(song)}`);
  return `<div class="routine-card">
    <div class="routine-head">
      <span class="routine-title"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l3 3"/><path d="M9 3h6M12 3v2"/></svg> ${t('routine.title')}</span>
      <button type="button" class="routine-print-btn" onclick="printRoutine()" title="${escAttr(t('routine.printTitle'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9V3h12v6"/><path d="M6 18H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="7" rx="1"/></svg> ${t('routine.print')}</button>
    </div>
    <ol class="routine-list">${items}</ol>
    <div class="routine-foot">${t('routine.foot')}</div>
  </div>`;
}
function printRoutine(){
  document.body.classList.add('print-routine');
  const done=()=>{ document.body.classList.remove('print-routine'); window.removeEventListener('afterprint', done); };
  window.addEventListener('afterprint', done);
  window.print();
}
/* ── Daily 5 — RETIRED 2026-09-19, switched off rather than deleted ──
   Jonathan: tuning and the finger warm-up happen together as a class, so
   the site shouldn't ask for them a second time. The ladder's "Tune and
   warm up first" banner was the only entry point to this overlay, so
   turning the banner off retires the Daily 5 with it.
   Everything below still works — flip this to true and the banner comes
   back exactly as it was (ladderHtml() in buildLesson() is the one reader,
   and the daily5.* i18n keys are all still in place for it). WARMUP_BANK
   is NOT part of this switch, but nothing on screen reads it while this is
   off: its only other reader, buildModuleRoutine() (the Module Review's
   10-Minute Routine), lost its one caller in 52ae05f and is also kept,
   unreached, so either can come back. */
const DAILY5_ENABLED = false;
/* Daily 5 — today's 5-minute warm-up for the current module. Same drill for
   everyone on the same date (rotated by day of year). Read-only. */
function dayOfYear(){ const now=new Date(); return Math.floor((now-new Date(now.getFullYear(),0,0))/86400000); }
function buildDaily5(){
  const num=parseInt(document.getElementById('module-select').value)||1;
  const doy=dayOfYear();
  const wu=WARMUP_BANK[doy % WARMUP_BANK.length];
  const seqSteps=moduleStepsFlat(num).filter(x=>x.step.playSeq);
  const pick=seqSteps.length ? seqSteps[doy % seqSteps.length] : null;
  const li=(mins,title,body)=>`<li class="routine-item"><span class="routine-min">${mins} min</span><div class="routine-body"><strong>${title}</strong> ${body}</div></li>`;
  let items='';
  items+=li(1,t('routine.tuneUp'),t('daily5.tuneUpBody'));
  items+=li(2,t('daily5.warmUp'),`&mdash; ${escHtml(tf(wu,'text'))}<br>${routinePlaySeq(wu,'bpm:daily5:wu')}`);
  if(pick) items+=li(2,t('daily5.todaysDrill'),`&mdash; ${t('daily5.fromModule',{num, set: tSetLabel(pick.set.label)})} ${escHtml(truncateText(stripTags(tf(pick.step,'text')),160))}<br>${routinePlaySeq(pick.step.playSeq,'bpm:daily5:drill')}`);
  const streakAlive = dayStreakAlive(streak.lastDay, dayStr(new Date()));   // weekends never break it (app/boot.js)
  const streakChip = (streak.count > 1 && streakAlive)
    ? `<span class="games-card-best">&#x1F525; ${t('daily5.streak',{n:streak.count})}</span>` : '';
  return `<div class="daily5-head"><div style="display:flex;align-items:center;gap:8px"><h3 style="font:inherit;margin:0">${ICO_BOLT} ${t('daily5.title')}</h3>${streakChip}</div><button type="button" class="tp-close" onclick="closeDaily5()" aria-label="${escAttr(t('daily5.closeAria'))}">&#x2715;</button></div>
    <ol class="routine-list">${items}</ol>`;
}
/* The ladder's warm-up card opens the Daily 5 as a popup over the activities —
   close it and you're exactly where you left off, no scrolling to the top. */
function openDaily5Here(){
  closeDaily5();
  const ov=document.createElement('div');
  ov.className='daily5-overlay';
  ov.id='daily5-overlay';
  ov.innerHTML=`<div class="daily5-modal" role="dialog" aria-modal="true" aria-label="${escAttr(t('daily5.title'))}">${buildDaily5()}</div>`;
  ov.addEventListener('click', e=>{ if(e.target===ov) closeDaily5(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', daily5EscClose);
  openOverlay(ov);
}
function daily5EscClose(e){ if(e.key==='Escape') closeDaily5(); }
function closeDaily5(){
  const ov=document.getElementById('daily5-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', daily5EscClose);
  closeOverlay();
}

