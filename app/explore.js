/* ══════════════════════════════════════════════
   NAVIGATION — panel footers, back-to-top,
   checklist→lesson jumps, Songs hub, site search
   ══════════════════════════════════════════════ */

/* "Keep going" footer for each set tab-panel: the bottom of a long ladder
   used to be a dead end — you had to scroll back up to continue. */
function panelFooter(w, tab){
  const btn = (labelHtml, onclick) =>
    `<button type="button" class="panel-next-btn" onclick="${onclick}">${labelHtml} &rarr;</button>`;
  const span = key => `<span data-i18n="${key}">${escHtml(t(key))}</span>`;
  let inner = '';
  if(tab === LESSON_TAB){
    inner = btn(span('btn.nextChecklist'), `switchTabById('${w.id}','checklist')`);
  } else if(tab === 'checklist'){
    const sets = SETS.filter(x => x.moduleNum === w.moduleNum && !x.comingSoon);
    const i = sets.findIndex(x => x.id === w.id);
    if(i >= 0 && i < sets.length - 1){
      const next = sets[i + 1];
      const labelHtml = next.label
        ? `<span data-i18n-setlabel="${escAttr(next.label)}">${escHtml(tSetLabel(next.label))}</span>`
        : span('btn.theNextSet');
      inner = btn(`${span('btn.next')} ${labelHtml}`, `goToSet('${next.id}')`);
    } else if(MODULE_REVIEWS[w.moduleNum]){
      inner = btn(span('btn.nextModuleReview'), `goToSet('mr${w.moduleNum}')`);
    }
  }
  return inner ? `<div class="panel-next">${inner}</div>` : '';
}

/* Switch a set's panel from anywhere — the rail, the footer buttons, skill
   jumps, search deep links. The single entry point since the hidden tab bar
   was removed; the rail reads the active state back off .tab-panel.active. */
function switchTabById(wid, tab, keepScroll){
  const panel = document.getElementById(`${wid}-${tab}`);
  const wrap = panel && panel.closest('.week-panel');
  if(!wrap) return;
  // Same reasoning as activateSet(): the panel we're leaving might be hiding a
  // still-running inline Coach check — close it so its mic doesn't keep running
  // unseen. Ditto a Shuffle Drill, whose interval survives display:none.
  if(typeof coachClose === 'function') coachClose();
  if(typeof sdAbortAll === 'function') sdAbortAll();
  wrap.querySelectorAll('.tab-panel').forEach(p=>p.classList.remove('active'));
  panel.classList.add('active');
  /* The set band carries the lesson's chrome now (pill, "Step n of m", the
     view toggle), and the band sits above BOTH panels — so it has to know
     which one is open. The checklist has its own progress bar and no
     steps, so the lesson chrome hides while it's showing. */
  wrap.classList.toggle('on-checklist', tab === 'checklist');
  if(typeof syncRailStations === 'function') syncRailStations();   // mirror onto the rail
  /* Scroll the panel we just opened to the top. This used to target the tab
     bar and fall back to the panel — but the bar was display:none, so
     scrollIntoView() silently did nothing and "Next: My skills checklist" at
     the bottom of a long ladder left the student stranded at the bottom. */
  if(!keepScroll) panel.scrollIntoView({ block: 'start', behavior: scrollBehavior() });
}

/* Does any step in this set teach set-skill number n (and if so, in which
   half of the ladder)? Steps tag themselves with skills:[n] in the module
   data. The letter is now only used as a "yes, it's taught here" answer —
   both halves render into the same panel.
   Walks what the ladder RENDERS (lessonGroups → visibleSections, then
   visibleSteps), not the raw arrays: a hidden step, a hidden section or a
   take-to-song section showing its Journey card has no li.step for
   showSkillLesson() to find, and counting it would draw a "Show me where"
   button that does nothing. */
function skillTaughtStation(w, n){
  for(const g of lessonGroups(w)){
    for(const {sec} of g.secs){
      if(visibleSteps(sec, w.moduleNum).some(p => (p.st.skills || []).includes(n))) return g.id;
    }
  }
  return null;
}

/* Checklist "Show me where": switch to the lesson ladder, expand the sections
   holding the skill's steps, scroll there and flash them. */
function showSkillLesson(wid, n){
  const w = SETS.find(x => x.id === wid);
  if(!w) return;
  if(!skillTaughtStation(w, Number(n))) return;
  switchTabById(wid, LESSON_TAB, true);
  const panel = document.getElementById(`${wid}-${LESSON_TAB}`);
  if(!panel) return;
  const matches = [...panel.querySelectorAll('li.step[data-skills]')]
    .filter(li => li.dataset.skills.split(',').includes(String(n)));
  if(!matches.length) return;
  /* Focus mode shows exactly one row, so "show me where" points at the first
     step that teaches the skill; list view still lights up all of them. */
  const dp = matches[0].closest('.dp');
  const targets = (dp && dp.classList.contains('focus')) ? matches.slice(0, 1) : matches;
  targets.forEach((li, i) => {
    expandStepEl(li, i > 0);
    flashClass(li, 'step-flash', 2600);
  });
  matches[0].scrollIntoView({ block: 'center', behavior: scrollBehavior() });
}

/* Deep-link to one step (used by search results): activate module + set,
   open the lesson ladder, scroll + flash the step. Addressed by the section's
   STORAGE namespace (`b-sec3`, `c-sec0`, or a bare `b` for a section-less
   station), never by DOM position: the ladder now runs both stations' sections
   through one panel, so position no longer identifies a section. */
async function jumpToStep(moduleNum, wid, station, secIdx, stepIdx){
  if(await gatedJumpGuard(moduleNum, wid)) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum, wid);
  saveProgress();
  switchTabById(wid, LESSON_TAB, true);
  const panel = document.getElementById(`${wid}-${LESSON_TAB}`);
  if(!panel) return;
  const sec = panel.querySelector(`.stp-sec[data-ns="${station}-sec${secIdx}"]`)
           || panel.querySelector(`.stp-sec[data-ns="${station}"]`);
  const li = sec ? sec.querySelectorAll('li.step')[stepIdx] : null;
  if(li){
    expandStepEl(li);
    flashClass(li, 'step-flash', 2600);
    li.scrollIntoView({ block: 'center', behavior: scrollBehavior() });
  }
}

/* ── Scroll pane ──
   The reading column is its own scroll container (.main / #main-content, see
   "Two panes, two scrollbars" in styles.css), so window.scrollTo no longer
   moves the lesson — the document itself never scrolls while the app shell is
   up. Everything that used to scroll "the page" goes through here instead.
   Falls back to the window for the teacher dashboard and the auth wall, which
   live outside the locked shell and still scroll normally. */
function scrollPane(){
  const m = document.getElementById('main-content');
  return (m && m.scrollHeight > m.clientHeight) ? m : window;
}
function scrollPaneTop(smooth){
  scrollPane().scrollTo({ top:0, behavior: smooth ? scrollBehavior() : 'auto' });
}
/* Where the reading pane is right now — window has scrollY, .main scrollTop. */
function paneScrollTop(){
  const p = scrollPane();
  return (p === window) ? window.scrollY : p.scrollTop;
}

/* ── Back to top ── */
function initBackToTop(){
  const btn = document.getElementById('back-to-top');
  if(!btn) return;
  const main = document.getElementById('main-content');
  const onScroll = () => {
    const y = main ? main.scrollTop : window.scrollY;
    btn.classList.toggle('show', y > 600);
  };
  /* capture:true — the scroll events that matter now fire on .main, and
     scroll doesn't bubble, so a listener bound to window only sees them on
     the way down. */
  window.addEventListener('scroll', onScroll, { passive: true, capture: true });
}
initBackToTop();

/* ── Top-bar panels (Songs hub · Search) — one open at a time, and they
      close Games too so the top of the page stays tidy. (The Daily 5 is a
      popup opened from the lesson ladder now, not a top-bar panel.) ── */
function closeTopPanels(except){
  /* Hash-based full pages close through their own close fns (which clear
     the URL hash); plain drop-over panels just get hidden. */
  const SCREEN_IDS = { games: 'games-screen', 'songs-hub': 'songs-screen', 'my-progress': 'my-progress-screen', 'class-activities': 'class-activities-screen', 'live-quiz': 'live-quiz-screen' };
  ['games', 'songs-hub', 'search', 'my-progress', 'class-activities', 'live-quiz'].forEach(k => {
    if(k === except) return;
    const p = document.getElementById(SCREEN_IDS[k] || k + '-panel');
    if(p && !p.hasAttribute('hidden')){
      if(k === 'games' && typeof closeGamesScreen === 'function'){ closeGamesScreen(); return; }
      if(k === 'songs-hub'){ closeSongsScreen(); return; }
      if(k === 'my-progress'){ closeMyProgressScreen(); return; }
      if(k === 'class-activities'){ closeClassActivitiesScreen(); return; }
      if(k === 'live-quiz' && typeof closeLiveQuizScreen === 'function'){ closeLiveQuizScreen(); return; }
      if(k === 'search'){ closeSearchPanel(); return; }
      p.setAttribute('hidden', '');
      const b = document.getElementById(k + '-btn');
      if(b) b.setAttribute('aria-expanded', 'false');
    }
  });
}

/* Picking a Set or Module review from the rail while Songs/Search/Games is
   open used to silently switch the set underneath the still-open panel — the
   click "did nothing" as far as the student could see. Close whichever panel
   is covering the page and scroll up so the new set is actually visible. */
function leaveTopPanelForSet(){
  const covering = ['games-screen', 'search-panel', 'songs-screen', 'my-progress-screen', 'class-activities-screen', 'live-quiz-screen']
    .some(id => { const el = document.getElementById(id); return el && !el.hasAttribute('hidden'); });
  if(!covering) return;
  practiceScrollTop = 0;   // the async popstate below would otherwise restore the OLD set's scroll offset after activateSet scrolls to top
  closeTopPanels('');
  scrollPaneTop(true);
}

/* Load every module's data (not its panels) — the Songs hub and search
   need the whole catalogue. Modules are small and the SW caches them.
   Resolves true only when EVERY module actually loaded — Daily Review uses
   that to avoid persisting a picks snapshot computed from a partial
   catalogue (a script that 404'd on flaky wifi). Other callers ignore it. */
function ensureAllModuleData(){
  return Promise.all(MODULE_MANIFEST.map(m => loadModuleData(m.num).then(() => true).catch(() => false)))
    .then(flags => flags.every(Boolean));
}

/* ── ♪ Songs hub: every song on the site, deduped, core six first ──
   An explore page in the main column (#songs), like its three rail
   neighbours — see EXPLORE_PAGES. */
/* Tapping the rail row for the page you're already on used to CLOSE it
   (these were close buttons too, back when the pages had a Back button) —
   which sent the student to Modules. Now a second tap keeps the page and
   scrolls it to the top (navigability round 2, 2026-09-23). */
function toggleSongsHub(){
  const screen = document.getElementById('songs-screen');
  if(!screen) return;
  if(screen.hasAttribute('hidden')) goExploreHash('songs');
  else scrollPaneTop(true);
}
function closeSongsScreen(){
  if(location.hash === '#songs'){ exitExploreHash(); return; }  // the router finishes the job
  songsClosePanel();
}
function songsClosePanel(){
  const screen = document.getElementById('songs-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if(screen) screen.setAttribute('hidden', '');
  const btn = document.getElementById('songs-hub-btn');
  if(btn && wasOpen) btn.focus();   // return focus to where the page was opened
  syncExploreNav();
}
function openSongsScreen(){
  const screen = document.getElementById('songs-screen');
  if(!screen || !screen.hasAttribute('hidden')) return;
  closeTopPanels('songs-hub');
  screen.removeAttribute('hidden');
  syncExploreNav();
  const exit = screen.querySelector('.page-exit, .page-title');
  if(exit) exit.focus();
  renderSongsHub();
}
async function renderSongsHub(){
  const p = document.getElementById('songs-screen-body');
  if(!p) return;
  p.innerHTML = `<div class="coach-tip">${t('hub.loading')}</div>`;
  await ensureAllModuleData();
  const byName = new Map();
  /* Which entry's backing track a row shows: `b`'s when `a` has none, or
     when `a`'s is a local mp3 and `b`'s is a YouTube jam track; otherwise
     `a`'s. A Core row's one backing link is "Backing track for solos", and
     solo work uses the YouTube jam tracks — the course mp3s are
     rhythm-stripped play-alongs (song-facts). Until the 2026-10-12 Module
     4/5 swap "first one met" got this right by luck: the pentatonic list
     (then Module 4) came before Open Chords, whose "Let It Be" entry carries
     the rhythm-stripped mp3. Choose by the kind of track, not by which
     module number comes first. */
  const isLocalAudio = u => /\.(mp3|m4a|ogg|wav)(\?|$)/i.test(u || '');
  const backingOf = (a, b) => (b.backingUrl && (!a.backingUrl || (isLocalAudio(a.backingUrl) && !isLocalAudio(b.backingUrl)))) ? b : a;
  const noteSong = (song, moduleNum) => {
    const e = byName.get(song.name) || { song, modules: new Set() };
    e.modules.add(moduleNum);
    if(song.journeyUrl && !e.song.journeyUrl){ const bk = backingOf(song, e.song); e.song = { ...song, backingUrl: bk.backingUrl, backingKey: bk.backingKey }; }
    /* The kept entry is the FIRST one met (Module 1/2), and for the six core
       songs only the pentatonic list (MODULE_SONGS[5]) carries a solo
       backingUrl — so keeping the first entry whole dropped every core
       song's backing track from the hub, the only place Module 5's "pick a
       core song's track" card can send a student. Carry it forward onto a
       copy; never mutate the module data.
       Found 2026-09-25. */
    else { const bk = backingOf(e.song, song); if(bk !== e.song) e.song = { ...e.song, backingUrl: bk.backingUrl, backingKey: bk.backingKey }; }
    byName.set(song.name, e);
  };
  SETS.filter(w => w.moduleNum === 1 && w.songs).forEach(w => w.songs.forEach(sg => noteSong(sg, 1)));
  const MS = globalThis.MODULE_SONGS || {};
  Object.keys(MS).forEach(m => MS[m].forEach(sg => noteSong(sg, Number(m))));
  const entries = [...byName.values()];
  entries.sort((a, b) => (b.song.core === true) - (a.song.core === true) || a.song.name.localeCompare(b.song.name));
  /* Two-tier layout (2026-07-23): the six Core thread songs pinned in their
     own card on top, then the Choice menu split into collapsible difficulty
     groups by the module where each song FIRST appears. Jonathan picked the
     difficulty axis over language grouping after a mockup comparison.
     Module Focus songs (core:true, type:'Focus') live inside the groups and
     keep their tag; the student-request row (request:true) renders last. */
  const isCoreSix = e => e.song.core === true && e.song.type !== 'Focus';
  const firstMod = e => Math.min(...e.modules);
  /* Core order (Jonathan, 2026-10-05): the three songs with a whole-song
     Play Along card lead, in this order; the rest follow alphabetically.
     Seven Nation Army moved to the top 2026-10-07 (Jonathan). */
  const CORE_FIRST = ['seven-nation-army', 'all-along-the-watchtower', 'the-cure'];
  const coreRank = e => { const i = CORE_FIRST.indexOf(songJourneySlug(e.song)); return i < 0 ? CORE_FIRST.length : i; };
  const coreEntries = entries.filter(isCoreSix).sort((a, b) => coreRank(a) - coreRank(b));
  const requestEntries = entries.filter(e => !isCoreSix(e) && e.song.request === true);
  const rest = entries.filter(e => !isCoreSix(e) && e.song.request !== true);
  /* The groups follow CONTENT, not a run of module numbers (2026-10-12):
     Open Chords moved ahead of the pentatonic scales, so the single-note
     group is Modules 1–3 plus the pentatonic Module 5, and the chord group
     is Open Chords (Module 4) plus 6–8. A plain "≤ 4" split would have
     swapped nine Choice songs between the two groups. Each `sub` names the
     same modules its `match` does — change them together. (The riff group
     takes everything below 9 that isn't a chord module, so no song can
     fall through every group.) */
  const CHORD_MODS = [4, 6, 7, 8];
  const groups = [
    { title: t('hub.groupRiffs'),  sub: t('hub.groupStartAnd', {a: '1–3', b: 5}), match: e => firstMod(e) < 9 && !CHORD_MODS.includes(firstMod(e)) },
    { title: t('hub.groupChords'), sub: t('hub.groupStartAnd', {a: 4, b: '6–8'}), match: e => CHORD_MODS.includes(firstMod(e)) },
    { title: t('hub.groupAdv'),    sub: t('hub.groupStart', {a: 9, b: 12}),       match: e => firstMod(e) >= 9 },
  ].map(g => ({ ...g, entries: rest.filter(g.match) })).filter(g => g.entries.length);
  const ordered = [...coreEntries, ...groups.flatMap(g => g.entries), ...requestEntries];
  songsHubList = ordered.map(e => e.song);
  let rowIdx = 0;
  const row = (e) => {
    const idx = rowIdx++;
    const sg = e.song;
    /* Index-based handlers: song names with apostrophes (Sweet Child O'
       Mine…) break when inlined into onclick. */
    const vids = [];
    /* Core rows (Jonathan, 2026-10-05: "too much going on"): exactly three
       links, in this order — Play Along (the song's whole-song practice card,
       only once one is released), Backing track for solos, Song Journey. No
       Tutorial or Original here; Choice rows keep their own set below. */
    if(isCoreSix(e)){
      const slug = songJourneySlug(sg);
      vids.push(`<span class="sh-play-slot" data-slug="${escAttr(slug)}">${songsPlayAlongBtn(slug)}</span>`);
      if(sg.backingUrl) vids.push(`<button class="song-vid-btn" onclick="songsHubVid(${idx},'backing')"><span class="svb-play">&#x25B6;</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> ${t('hub.backingSolos')}${sg.backingKey ? ` (${escHtml(sg.backingKey)})` : ''}</button>`);
      if(sg.journeyUrl) vids.push(`<button class="song-vid-btn journey" onclick="songsHubVid(${idx},'journey')" title="${escAttr(t('songs.oneSongLayers'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M5 8c0 6 14 2 14 8"/></svg> ${t('songs.songJourney')}</button>`);
    } else {
    if(sg.journeyUrl) vids.push(`<button class="song-vid-btn journey" onclick="songsHubVid(${idx},'journey')" title="${escAttr(t('songs.oneSongLayers'))}"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><circle cx="5" cy="6" r="2"/><circle cx="19" cy="18" r="2"/><path d="M5 8c0 6 14 2 14 8"/></svg> ${t('songs.songJourney')}</button>`);
    if(sg.tutorialUrl) vids.push(`<button class="song-vid-btn tut" onclick="songsHubVid(${idx},'tutorial')"><span class="svb-play">&#x25B6;</span>${t('songs.tutorial')}</button>`);
    if(sg.backingUrl) vids.push(`<button class="song-vid-btn" onclick="songsHubVid(${idx},'backing')"><span class="svb-play">&#x25B6;</span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg> ${t('hub.backing')}${sg.backingKey ? ` (${escHtml(sg.backingKey)})` : ''}</button>`);
    if(sg.originalUrl) vids.push(`<button class="song-vid-btn" onclick="songsHubVid(${idx},'original')" title="${escAttr(t('songs.opensYoutube'))}"><span class="svb-play">&#x25B6;</span>${t('songs.original')} <span style="font-size:0.6875rem;opacity:0.6">&#x2197;</span></button>`);
    }
    // The six pinned rows sit directly under the "Core songs" section header,
    // where the tag would just repeat it — suppress there only; Focus songs
    // (core:true, type:'Focus') still show their tag inside the choice groups.
    const tagHtml = isCoreSix(e) ? '' : `<span class="stag ${sg.core ? 'stag-core' : ''}">${escHtml(songTypeLabel(sg.type, sg.core))}</span>`;
    return `<div class="song-row"><div class="dot ${sg.core ? 'dc' : 'dch'}"></div>
      <div class="song-name-col"><div class="sname">${escHtml(tf(sg, 'name'))}</div>${sg.meta ? `<div class="smeta">${escHtml(tf(sg, 'meta'))}</div>` : ''}</div>
      ${vids.length ? `<div class="song-vids">${vids.join('')}</div>` : ''}
      ${tagHtml}</div>`;
  };
  const renderRows = list => list.map(row).join('');
  const coreHtml = `<div class="sh-sec-title">${t('hub.coreTitle')}</div><div class="card">${renderRows(coreEntries)}</div>`;
  const groupsHtml = `<div class="sh-sec-title">${t('hub.choiceTitle')}</div>` + groups.map((g, gi) =>
    `<div class="sh-group${gi === 0 ? ' open' : ''}"><button type="button" class="sh-group-head" aria-expanded="${gi === 0}" onclick="toggleHubGroup(this)"><span>${g.title}</span><span class="sh-group-sub">${g.sub}</span><span class="sh-group-count">${t('hub.groupCount', {n: g.entries.length})}</span></button><div class="sh-group-body">${renderRows(g.entries)}</div></div>`).join('');
  const requestHtml = requestEntries.length ? `<div class="card">${renderRows(requestEntries)}</div>` : '';
  // The Mood Chart row that sat here was removed 2026-10-02 (Jonathan). The
  // page itself, mood-chart.html, still ships — nothing on the site links it.
  p.innerHTML = `<div class="legend"><div class="leg"><div class="dot dc" style="margin-top:0"></div>${t('hub.legendCore')}</div><div class="leg"><div class="dot dch" style="margin-top:0"></div>${t('hub.legendChoice')}</div></div>
    ${coreHtml}<div class="sh-lib-slot">${songsLibraryHtml()}</div>${groupsHtml}${requestHtml}`;
}
/* "More Play Along songs" — the song library (see caIsLibrarySong), between
   the Core songs and the Choice menu. One row per library card: the song's
   name (the card title up to its " — ") and a Play Along link to the card,
   A–Z. No cards, no section.
   This is NOT the "Play Along with the TAB/Chords" list removed 2026-10-05
   (every part card, Core songs included); Core songs still open only from
   their own rows, and only `library: true` cards are listed here. */
function songsLibraryHtml(){
  const cards = (window.CLASS_ACTIVITIES || []).filter(caIsLibrarySong);
  if(!cards.length) return '';
  const short = a => caTitle(a).split(' — ')[0];
  // Two cards for one song (Las Mañanitas has a chord ladder and a Play
  // Along) show their full titles, so the rows can be told apart.
  const name = a => cards.filter(b => short(b) === short(a)).length > 1 ? caTitle(a) : short(a);
  cards.sort((x, y) => name(x).localeCompare(name(y)));
  const rows = cards.map(a => {
    const done = classActivities[a.id] === true;
    const btn = `<button type="button" class="song-vid-btn sh-play-btn${done ? ' done' : ''}" onclick="songsLibraryOpen(${jsonAttrArg(a.id)})"><span class="svb-play">&#x25B6;</span>${t('hub.playAlong')}${done ? ` <svg class="sh-play-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${escAttr(t('hub.playAlongDone'))}"><path d="M5 12.5l4.5 4.5L19 7"/></svg>` : ''}</button>`;
    // The song name opens the same card as its Play Along button (2026-10-27).
    return `<div class="song-row"><div class="dot dch"></div>
      <div class="song-name-col"><button type="button" class="sname sname-link" onclick="songsLibraryOpen(${jsonAttrArg(a.id)})">${escHtml(name(a))}</button></div>
      <div class="song-vids">${btn}</div></div>`;
  }).join('');
  return `<div class="sh-sec-title">${t('hub.libraryTitle')}</div><div class="card">${rows}</div>`;
}

/* Songs-hub difficulty group open/close (header button). */
function toggleHubGroup(btn){
  const g = btn.closest('.sh-group');
  if(!g) return;
  const open = g.classList.toggle('open');
  btn.setAttribute('aria-expanded', String(open));
}
/* ── Play Along (2026-10-01, Jonathan; reshaped 2026-10-05) ──
   Each Core song row's first link opens that song's WHOLE-SONG practice card
   (view:'card' with card.wholeSong) — once it is released: caIsVisible()
   (placed, dated and arrived, not hidden or retired), or switched to "Play
   Along now" on the console board (caIsPlayAlongOnly()). A song with no such
   card shows no Play Along link at all (Jonathan: leave it out). The separate
   "Play Along with the TAB/Chords" section that listed every part card at the
   top of the page is gone (Jonathan, 2026-10-05: the Core list is the only
   place); part cards live on In-Class Activities.

   A tap opens the card WHERE IT LIVES, #class-activities/<id>, through the
   same deep link the console's Copy link hands out. One copy of the card,
   one set of check ticks; Back returns to Songs. */
function songJourneySlug(sg){
  const m = /tabs\/([^/.#?]+)\.html/.exec(sg.journeyUrl || '');
  return m ? m[1] : '';
}
function songsPlayAlongCard(slug, layer){
  if(!slug) return null;
  const cards = (window.CLASS_ACTIVITIES || []).filter(a => a.view === 'card' && a.card && a.card.wholeSong
    && a.journey === slug && (caIsVisible(a) || caIsPlayAlongOnly(a))
    && (!layer || Number(a.journeyLayer) === Number(layer)));
  return cards.sort((x, y) => (caNumber(y) || 0) - (caNumber(x) || 0))[0] || null;
}
/* Play-along first (Jonathan, 2026-10-06): a link to a song opens its
   whole-song practice card when students can open one for that layer, and
   the Song Journey page when they can't. Decided at the CLICK, not at render
   time — the class config (dates, Play Along now) can land after the page
   that holds the link was built. */
function openSongLink(slug, layer){
  // No layer (an "About this set" song past Module 5, e.g. Module 7's
  // "Watchtower — every chord as a barre"): no card is that part, so the
  // Journey page opens — songsPlayAlongCard(slug, 0) would match ANY layer
  // and send it to the newest power-chord card.
  const a = layer ? songsPlayAlongCard(slug, layer) : null;
  if(a){ songsHubOpenCard(a.id); return; }
  const sg = SONG_JOURNEYS.find(s => s.id === slug);
  if(sg) window.open(journeyHref(sg.url, layer ? Number(layer) : 0, journeyFromHere()), '_blank', 'noopener');
}
function songsPlayAlongBtn(slug){
  const a = songsPlayAlongCard(slug);
  if(!a) return '';
  const done = classActivities[a.id] === true;
  return `<button type="button" class="song-vid-btn sh-play-btn${done ? ' done' : ''}" onclick="songsHubOpenCard('${escAttr(a.id)}')"><span class="svb-play">&#x25B6;</span>${t('hub.playAlong')}${done ? ` <svg class="sh-play-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" role="img" aria-label="${escAttr(t('hub.playAlongDone'))}"><path d="M5 12.5l4.5 4.5L19 7"/></svg>` : ''}</button>`;
}
function songsHubOpenCard(id){
  caSwap = null;   // from the Songs page it opens under the Songs heading, not in a card's slot
  goExploreHash('class-activities/' + id);
}
/* Song popularity (Jonathan, 2026-11-01: a counter on the teacher dashboard
   for how many times each of the extra play-along songs is clicked; he chose
   "students + total opens"). A click on a "More Play Along songs" row — the
   name or Play Along — adds 1 to songOpens[id] in the student's OWN progress
   doc with increment(): atomic (two tabs never overwrite each other) and never
   part of flushSave()'s payload, so a failed progress load cannot wipe it
   (1bo). The console's Songs view (renderTeacherSongs, teacher.js) shows how
   many students opened each song and the total. Not counted: the teacher
   account and the dev bypass (isGatePreviewer), a signed-out visitor, a Core
   song's row, a card opened from In-Class Activities or a link. */
function songsLibraryOpen(id){
  try {
    if(currentUser && db && !isGatePreviewer() && typeof firebase !== 'undefined' && firebase.firestore && firebase.firestore.FieldValue)
      db.collection('progress').doc(currentUser.uid)
        /* name/email ride along, as flushSave() sends them on every save: a
           doc that a click creates (a new student whose first progress read
           failed) must not show as a nameless row in the console (review R1-3). */
        .set({ name: currentUser.displayName || '', email: currentUser.email || '', songOpens: { [String(id)]: firebase.firestore.FieldValue.increment(1) } }, { merge: true })
        .catch(() => {});
  } catch(e) {}
  songsHubOpenCard(id);
}
/* The class config (board, dates) can land after the Songs page is already
   open — a cold load straight onto #songs. Swap just the Play Along slots,
   and only the ones that changed: loadClassConfig() runs again on every
   return to the browser tab, and re-rendering the whole page would close the
   student's open song groups each time. */
/* The browser re-serialises innerHTML (`&#x25B6;` reads back as "▶"), so a
   built string never equals what a slot reads back and every refresh rewrote
   every slot (dropping keyboard focus on them). Compare the slot with the
   new markup as the browser itself serialises it. */
function songsSlotDiffers(slot, html){
  const tpl = document.createElement('template');
  tpl.innerHTML = html;
  return slot.innerHTML !== tpl.innerHTML;
}
function refreshSongsPlayAlong(){
  const screen = document.getElementById('songs-screen');
  if(!screen || screen.hidden) return;
  screen.querySelectorAll('.sh-play-slot').forEach(slot => {
    const html = songsPlayAlongBtn(slot.dataset.slug);
    if(songsSlotDiffers(slot, html)) slot.innerHTML = html;
  });
  // The library list reads Hidden / Archive / Delete from the class config.
  // Its rows hold no open state, so swapping the whole slot is safe.
  const lib = screen.querySelector('.sh-lib-slot');
  if(lib){ const html = songsLibraryHtml(); if(songsSlotDiffers(lib, html)) lib.innerHTML = html; }
}
let songsHubList = [];
function songsHubVid(idx, kind){
  openSongVid(songsHubList[idx], kind);
}
async function songHubGoModule(m){
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(m);
  await onModuleChange(m);
  saveProgress();
  closeTopPanels('');
  // onModuleChange → activateSet restored the target set's scroll (top if new).
}

/* ── 🔍 Site search: steps, skills, and set titles across all modules ── */

/* Fold case AND accents, so a student typing "cancion", "pentatonica" or
   "MI GRAVE" finds "canción", "pentatónica" and "Mi grave". Half the site is
   in Spanish and nobody reaches for the accent key on a Chromebook.
   Length-preserving on purpose — the highlighter maps folded match offsets
   straight back onto the raw text, so one character in must be one character
   out. Anything that would change length (İ, emoji) is left alone. */
const _foldCharCache = new Map();
function foldChar(ch){
  let v = _foldCharCache.get(ch);
  if(v === undefined){
    const lo = ch.toLowerCase();
    if(lo.length !== ch.length) v = ch;
    else {
      const n = lo.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
      v = n.length === ch.length ? n : lo;
    }
    _foldCharCache.set(ch, v);
  }
  return v;
}
function searchFold(s){
  let out = '';
  const str = s || '';
  for(let i = 0; i < str.length; i++) out += foldChar(str[i]);
  return out;
}
/* Does `term` start a word in `hay`? A hit at a word boundary is what the
   student meant; one buried mid-word ("am" inside "frame") usually isn't. */
function foldWordStart(hay, term){
  let i = hay.indexOf(term);
  while(i !== -1){
    if(i === 0 || !/[a-z0-9]/.test(hay[i - 1])) return true;
    i = hay.indexOf(term, i + 1);
  }
  return false;
}
/* Every entry carries `hay` (everything worth matching, folded) and `title`
   (the name-ish part, for ranking). `text` stays the display string. */
// A query typed in either language has to match regardless of which
// language the UI is currently showing, so hay always folds in BOTH the
// English and Spanish variant of a field — not just the one tf() would
// display. bothLangs() is the hay-only counterpart to tf()'s display pick.
function bothLangs(obj, field){
  if(!obj) return '';
  return [obj[field], obj[field + '_es']].filter(Boolean).join(' ');
}
function searchEntry(e){
  const mod = (typeof MODULE_MANIFEST !== 'undefined' && MODULE_MANIFEST.find(m => m.num === e.moduleNum)) || null;
  const modName = mod ? bothLangs(mod, 'name') : '';
  e.title = e.title || '';
  e.fTitle = searchFold(e.title);
  // Activities carry no module (moduleNum 0) — don't index a phantom "module 0".
  const modWords = e.moduleNum ? ['module ' + e.moduleNum, 'módulo ' + e.moduleNum] : [];
  e.hay = searchFold([e.text, e.hayExtra, e.title, e.label, e.secTitle, modName, ...modWords].filter(Boolean).join(' '));
  return e;
}

let searchIndex = null;
async function buildSearchIndex(){
  await ensureAllModuleData();
  const ix = [];
  SETS.forEach(w => {
    if(w.comingSoon) return;
    // tf() picks the _es twin when the student is in Spanish mode (falling
    // back to English where no twin exists yet) — without it, Spanish-mode
    // search only ever matched English-only indexed text. hayExtra carries
    // the OTHER language's raw text so a query matches either language
    // regardless of which one tf() is currently displaying.
    if(w.unit) ix.push(searchEntry({ kind: 'set', moduleNum: w.moduleNum, wid: w.id, label: w.label, title: [tSetLabel(w.label), tf(w, 'unit')].filter(Boolean).join(' '), text: tf(w, 'unit'), hayExtra: bothLangs(w, 'unit') }));
    (w.skills || []).forEach(sk => {
      const num = (sk.id.match(/-s(\d+)$/) || [])[1];
      ix.push(searchEntry({ kind: 'skill', moduleNum: w.moduleNum, wid: w.id, label: w.label, title: tf(sk, 'text'), text: tf(sk, 'text'), skillNum: num ? Number(num) : null, hayExtra: bothLangs(sk, 'text') }));
    });
    ['b', 'c'].forEach(st => {
      const stn = w.stations && w.stations[st];
      if(!stn) return;
      // Must mirror buildLesson()'s filtering (visibleSections/visibleSteps)
      // — jumpToStep() indexes into the rendered section's steps by POSITION
      // (querySelectorAll('li.step')[stepIdx]), which only ever holds visible
      // steps, so stepIdx here must be a VISIBLE position, not the raw array
      // index (that is what doneKey uses, a different thing — see
      // visibleSteps' own comment). secIdx is the opposite: see below.
      // (visibleSections returns {sec, gi} pairs and BOTH matter: jumpToStep
      // finds the section by `data-ns="<station>-sec<gi>"`, the STORAGE index,
      // so the pair's position in this array is the wrong number to index by —
      // a render-hidden section earlier in the station makes them differ and
      // the jump lands on another card, or on nothing. `gi` is null for a
      // section-less station, where jumpToStep falls back to a bare `b`/`c`.)
      const sections = stn.sections && stn.sections.length
        ? visibleSections(stn, w.moduleNum)
        : (stn.steps ? [{sec: {title: '', steps: stn.steps}, gi: null}] : []);
      sections.forEach(({sec, gi}) => visibleSteps(sec, w.moduleNum).forEach((p, stepIdx) => {
        const step = p.st;
        const text = stripTags(tf(step, 'text') || '');
        const hayExtra = [stripTags(step.text_es || ''), stripTags(step.label_es || ''), sec.title_es || ''].filter(Boolean).join(' ');
        // secTitle is the always-English title (it feeds `hay`, which must
        // match English queries in either language); secLabel is what the
        // result line SHOWS, so it goes through tf(). The index is thrown away
        // and rebuilt on gc-langchange, so a stale language can't stick.
        if(text) ix.push(searchEntry({ kind: 'step', moduleNum: w.moduleNum, wid: w.id, label: w.label, station: st, secIdx: gi, stepIdx, secTitle: sec.title || '', secLabel: tf(sec, 'title') || '', title: stripTags(tf(step, 'label') || '') || (sec.title || ''), text, hayExtra }));
      }));
    });
  });
  /* Songs — also indexed by the chords named in their meta text, so a query
     like "G C D" can find every song playable with just those shapes.
     Module 1's songs live on SETS; modules 2+ live in MODULE_SONGS. Dedup by
     name (a song taught in multiple modules only needs one entry to search). */
  const songSeen = new Map();
  const indexSong = (song, moduleNum, wid) => {
    if(!song || !song.name) return;
    // Chord names are matched against the always-English `meta` (chord
    // symbols aren't translated), but the indexed/displayed text uses
    // tf() so Spanish-mode search matches the meta_es wording too.
    const metaText = song.meta || '';
    const metaTextShown = tf(song, 'meta') || '';
    const chords = new Set();
    const re = new RegExp(CHORD_RE.source, 'g');
    let m;
    while((m = re.exec(metaText)) !== null) chords.add(m[2]);
    const existing = songSeen.get(song.name);
    if(existing){
      /* Same song taught again in a later module (e.g. Module 1's "Listen"
         intro vs. its full chord chart in Module 6/7) — merge in any chords
         found there instead of letting the earlier, often chordless, entry
         permanently hide the song from chord-based search. */
      chords.forEach(c => { if(!existing.chords.includes(c)) existing.chords.push(c); });
      return;
    }
    const hayExtra = [bothLangs(song, 'meta'), bothLangs(song, 'name')].filter(Boolean).join(' ');
    const entry = searchEntry({ kind: 'song', moduleNum, wid, title: tf(song, 'name'), text: tf(song, 'name') + (metaTextShown ? ' ' + metaTextShown : ''), chords: [...chords], hayExtra });
    songSeen.set(song.name, entry);
    ix.push(entry);
  };
  SETS.forEach(w => { if(w.moduleNum === 1 && w.songs) w.songs.forEach(sg => indexSong(sg, 1, w.id)); });
  const MS2 = globalThis.MODULE_SONGS || {};
  Object.keys(MS2).forEach(m => (MS2[m] || []).forEach(sg => indexSong(sg, Number(m), null)));
  /* In-Class Activities (navigability work order 2026-09-23, item 3) — the
     section students use most was the one Find never looked at: "Happy
     Birthday" found module steps and Songs-hub rows, never #1, #2 or #13.
     One entry per VISIBLE card (same caIsVisible gate the page uses, so a
     search can't leak an unposted activity): the "#N - Title", the intro's
     first sentence and every step label, both languages in the haystack.
     A hit opens the card by its deep link (searchGoActivity). */
  (window.CLASS_ACTIVITIES || []).filter(caIsVisible).forEach(a => {
    const num = caNumber(a);
    const title = (a.kind === 'check' ? t('check.prefix') + ' · ' : num ? `#${num} ` : '') + caTitle(a);
    const stepLabels = (a.steps || []).map(st => stripTags(tf(st, 'label') || '')).filter(Boolean);
    const text = [caFirstSentence(tf(a, 'intro')), ...stepLabels].filter(Boolean).join(' · ');
    const hayExtra = [bothLangs(a, 'title'), bothLangs(a, 'intro') && stripTags(bothLangs(a, 'intro')),
      ...(a.steps || []).map(st => stripTags(st.label_es || ''))].filter(Boolean).join(' ');
    ix.push(searchEntry({ kind: 'activity', moduleNum: 0, activityId: a.id, title, text: title + (text ? ' — ' + text : ''), hayExtra }));
  });
  return ix;
}
function searchGoActivity(id){
  const target = '#class-activities/' + id;
  // Already on that exact hash (a second search for the same card): the
  // router would no-op, so move the page to the card directly.
  if(location.hash === target){ searchClosePanel(); caFocusActivity(id); return; }
  /* Not closeTopPanels('') + goExploreHash: that pair races — the search
     panel's close is an async history.go() back to the practice view, which
     then re-routes on top of the push. Swap the #search entry for the
     card's instead (replaceState, then route by hand — pushState/replaceState
     fire no event), so Back from the card also skips the empty search box. */
  history.replaceState(history.state, '', location.pathname + location.search + target);
  routeExploreHash();
}
/* The search panel is routed like the explore pages (#search), so the phone's
   Back gesture closes it instead of leaving the site. toggleSearch stays the
   name the header button and the panel's ✕ call. */
function toggleSearch(){
  const p = document.getElementById('search-panel');
  if(!p) return;
  if(p.hasAttribute('hidden')) goExploreHash('search');
  else closeSearchPanel();
}
function closeSearchPanel(){
  if(location.hash === '#search'){ exitExploreHash(); return; }  // the router finishes the job
  searchClosePanel();
}
function searchClosePanel(){
  const p = document.getElementById('search-panel');
  if(!p || p.hasAttribute('hidden')) return;
  p.setAttribute('hidden', '');
  const btn = document.getElementById('search-btn');
  if(btn){ btn.setAttribute('aria-expanded', 'false'); btn.focus(); }
}
async function openSearchPanel(){
  const p = document.getElementById('search-panel');
  const btn = document.getElementById('search-btn');
  if(!p || !p.hasAttribute('hidden')) return;
  closeTopPanels('search');
  p.removeAttribute('hidden');
  if(btn) btn.setAttribute('aria-expanded', 'true');
  p.innerHTML = `<div class="daily5-head"><span><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-4.7-4.7"/></svg> <span data-i18n="search.title">${escHtml(t('search.title'))}</span></span><button type="button" class="tp-close" onclick="toggleSearch()" aria-label="${escAttr(t('search.closeAria'))}" data-i18n-attr="aria-label:search.closeAria">&#x2715;</button></div>
    <input type="search" class="search-input" id="search-input" placeholder="${escAttr(t('search.placeholder'))}" oninput="onSearchInput(this.value)" onkeydown="if(event.key==='Escape'){event.preventDefault();closeSearchPanel();}" aria-label="${escAttr(t('search.ariaLabel'))}" data-i18n-attr="placeholder:search.placeholder;aria-label:search.ariaLabel">
    <div id="search-results" class="search-results" aria-live="polite"><div class="coach-tip" data-i18n="search.gettingReady">${escHtml(t('search.gettingReady'))}</div></div>`;
  const input = document.getElementById('search-input');
  if(input) input.focus();
  if(!searchIndex) await ensureSearchIndex();
  const res = document.getElementById('search-results');
  // The student may have already typed a query while the index was still
  // loading (a real wait on slow Wi-Fi/Chromebooks, since this fetches every
  // not-yet-loaded module file) — onSearchInput's runSearch bailed out with
  // no index and never retried, so re-run their query now instead of
  // clobbering it with the generic intro tip.
  const liveQuery = document.getElementById('search-input');
  if(liveQuery && liveQuery.value.trim().length >= 2) runSearch(liveQuery.value);
  else if(res && res.querySelector('.coach-tip')) res.innerHTML = `<div class="coach-tip" data-i18n="search.intro" data-i18n-params="${escAttr(JSON.stringify({n:MODULE_MANIFEST.length}))}">${escHtml(t('search.intro',{n:MODULE_MANIFEST.length}))}</div>`;
}

/* Typing on a Chromebook fires oninput per keystroke; re-scanning the whole
   index on each one made the box feel sticky. One pass per pause instead. */
let _searchTimer = null;
function onSearchInput(v){
  clearTimeout(_searchTimer);
  _searchTimer = setTimeout(() => runSearch(v), 120);
}

/* Wrap every matched term in the snippet. Offsets come from the folded copy,
   which is length-preserving (see foldChar), so they map straight back onto
   the raw text and the accents survive in what the student reads. */
function searchHighlight(raw, terms){
  const f = searchFold(raw);
  const ranges = [];
  terms.forEach(term => {
    if(term.length < 2) return;
    let i = f.indexOf(term);
    while(i !== -1){ ranges.push([i, i + term.length]); i = f.indexOf(term, i + term.length); }
  });
  if(!ranges.length) return escHtml(raw);
  ranges.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  // Merge overlapping/touching runs so "chord" inside "chord chart" doesn't
  // come out as two <mark>s with a seam down the middle.
  const merged = [];
  for(const r of ranges){
    const last = merged[merged.length - 1];
    if(last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  let out = '', at = 0;
  for(const [s, e] of merged){
    out += escHtml(raw.slice(at, s)) + '<mark class="search-mark">' + escHtml(raw.slice(s, e)) + '</mark>';
    at = e;
  }
  return out + escHtml(raw.slice(at));
}

/* One build at a time, shared by openSearchPanel and runSearch. */
let searchIndexPending = null;
function ensureSearchIndex(){
  if(searchIndex) return Promise.resolve(searchIndex);
  if(!searchIndexPending){
    searchIndexPending = buildSearchIndex()
      .then(ix => { searchIndex = ix; return ix; })
      .finally(() => { searchIndexPending = null; });
  }
  return searchIndexPending;
}

function runSearch(q){
  const res = document.getElementById('search-results');
  if(!res) return;
  /* A language switch drops the index (gc-langchange) under an open panel,
     and only openSearchPanel used to rebuild it — typing did nothing until
     the panel was closed and reopened. Rebuild here, then run what is in
     the box by then. */
  if(!searchIndex){
    res.innerHTML = `<div class="coach-tip" data-i18n="search.gettingReady">${escHtml(t('search.gettingReady'))}</div>`;
    ensureSearchIndex().then(() => {
      const input = document.getElementById('search-input');
      if(searchIndex && input) runSearch(input.value);
    }).catch(() => {});
    return;
  }
  const rawQ = (q || '').trim();
  q = searchFold(rawQ);
  if(q.length < 2){ res.innerHTML = `<div class="coach-tip">${escHtml(t('search.typeMore'))}</div>`; return; }
  // Commas are how people actually write a chord list ("g, c, d").
  const terms = q.split(/[\s,]+/).filter(Boolean);
  /* "G C D" — a list of known chord names — asks "what can I play with just
     these shapes?" rather than a text search. Match songs whose whole indexed
     chord set is covered by the chords the student named (knowing G, C, D
     gets you a song that uses G and C, but not one that also needs Em). Needs
     2+ terms so an ordinary word that happens to share a chord's spelling
     (e.g. "am") doesn't get hijacked. */
  const isChordQuery = terms.length >= 2 && terms.every(t => CHORD_NAME_LOOKUP.has(t));
  let scored = [];
  let loose = false;
  if(isChordQuery){
    const known = new Set(terms.map(t => CHORD_NAME_LOOKUP.get(t)));
    for(const e of searchIndex){
      if(e.kind !== 'song' || !e.chords || !e.chords.length) continue;
      if(!e.chords.every(c => known.has(c))) continue;
      scored.push({ e, score: e.chords.length });
    }
  } else {
    /* Rank rather than take-the-first-400: the old loop broke out of the scan
       as soon as it had 400 hits, so a common word like "chord" never reached
       the later modules at all. The index is a few thousand short strings —
       scanning all of it costs under a millisecond. */
    const KIND_BONUS = { activity: 3, song: 3, skill: 2, set: 2, step: 0 };
    const rank = (e, needAll) => {
      const hay = e.hay, ttl = e.fTitle;
      const hits = terms.filter(t => hay.includes(t)).length;
      if(needAll ? hits < terms.length : hits === 0) return -1;
      let s = hits * 2;
      if(ttl === q) s += 14;                                  // the student typed the name
      else if(ttl.startsWith(q)) s += 8;
      else if(ttl.includes(q)) s += 5;
      if(hay.includes(q)) s += 3;                             // all terms together, in order
      if(terms.every(t => foldWordStart(ttl, t))) s += 3;
      else if(terms.every(t => foldWordStart(hay, t))) s += 2; // whole words beat mid-word
      s += KIND_BONUS[e.kind] || 0;
      return s;
    };
    for(const e of searchIndex){
      const s = rank(e, true);
      if(s >= 0) scored.push({ e, score: s });
    }
    /* Nothing matched every word — usually one extra or misspelt word in an
       otherwise fine query. Show the best partial matches instead of a dead
       end, and say that's what they are. */
    if(!scored.length && terms.length > 1){
      loose = true;
      for(const e of searchIndex){
        const s = rank(e, false);
        if(s >= 0) scored.push({ e, score: s });
      }
    }
  }
  scored.sort((a, b) => b.score - a.score || a.e.moduleNum - b.e.moduleNum || a.e.kind.localeCompare(b.e.kind));
  const LIMIT = 25;
  const total = scored.length;
  const top = scored.slice(0, LIMIT);
  if(!top.length){
    res.innerHTML = isChordQuery
      ? `<div class="coach-tip">${escHtml(t('search.noChordSongs',{chords:terms.join(', ').toUpperCase()}))}</div>`
      : `<div class="coach-tip">${escHtml(t('search.noMatches',{q:rawQ}))}</div>`;
    return;
  }
  const snippet = (text) => {
    const f = searchFold(text);
    // Centre on the FIRST term that actually appears, not blindly on terms[0].
    let at = -1;
    for(const term of terms){ const i = f.indexOf(term); if(i !== -1 && (at === -1 || i < at)) at = i; }
    const start = Math.max(0, at - 30);
    let cut = text.slice(start, start + 110);
    let html = searchHighlight(cut, terms);
    if(start > 0) html = '…' + html;
    if(start + 110 < text.length) html += '…';
    return html;
  };
  const head = loose
    ? `<div class="search-count search-loose">${escHtml(t('search.loose',{q:rawQ}))}</div>`
    : `<div class="search-count">${escHtml(total > LIMIT ? t('search.countCapped',{shown:LIMIT, n:total}) : t('search.count',{n:total}))}</div>`;
  res.innerHTML = head + top.map(({e}) => {
    const where = e.kind === 'activity'
      ? t('search.whereActivity')
      : e.kind === 'song'
      ? t('search.whereSong', {n:e.moduleNum})
      : t('search.whereSet', {n:e.moduleNum, label:escHtml(tSetLabel(e.label || ''))}) +
        (e.kind === 'step' && e.secLabel ? t('search.whereSection', {section:escHtml(e.secLabel)}) : e.kind === 'skill' ? t('search.whereSkill') : '');
    const onclick = e.kind === 'activity'
      ? `searchGoActivity('${escAttr(e.activityId)}')`
      : e.kind === 'step'
      ? `searchGo(${e.moduleNum},'${e.wid}','${e.station}',${e.secIdx},${e.stepIdx})`
      : e.kind === 'skill' && e.skillNum != null
        ? `searchGoSkill(${e.moduleNum},'${e.wid}',${e.skillNum})`
        : e.kind === 'song'
          ? (e.wid ? `searchGoSet(${e.moduleNum},'${e.wid}')` : `songHubGoModule(${e.moduleNum})`)
          : `searchGoSet(${e.moduleNum},'${e.wid}')`;
    return `<button type="button" class="search-hit" onclick="${onclick}">
      <span class="search-hit-where">${where}</span>
      <span class="search-hit-text">${snippet(e.text)}</span>
    </button>`;
  }).join('');
}
async function searchGo(moduleNum, wid, station, secIdx, stepIdx){
  closeTopPanels('');
  await jumpToStep(moduleNum, wid, station, secIdx, stepIdx);
}
// Search / deep-link guard: if the jump target is gated, land the student on
// the module (their frontier) and tell them why, rather than trying to reveal a
// hidden locked panel. Returns true when it handled a locked target.
async function gatedJumpGuard(moduleNum, wid){
  const w = SETS.find(x => x.id === wid);
  if(!(w && isSetLocked(w))) return false;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum);
  saveProgress();
  gateToast(isModuleGateCase(w)
    ? t('gate.unlocksAfterModule', { set: tSetLabel(w.label), ...prevModuleGateParams(w) })
    : t('gate.unlocksAfter', { set: tSetLabel(w.label), prev: tSetLabel(prevSetLabel(w)) }));
  return true;
}
async function searchGoSkill(moduleNum, wid, skillNum){
  closeTopPanels('');
  if(await gatedJumpGuard(moduleNum, wid)) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum, wid);
  saveProgress();
  const w = SETS.find(x => x.id === wid);
  if(w && skillTaughtStation(w, skillNum)) showSkillLesson(wid, skillNum);
  else switchTabById(wid, 'checklist');
}
async function searchGoSet(moduleNum, wid){
  closeTopPanels('');
  if(await gatedJumpGuard(moduleNum, wid)) return;
  const sel = document.getElementById('module-select');
  if(sel) sel.value = String(moduleNum);
  await onModuleChange(moduleNum, wid);
  saveProgress();
  // onModuleChange → activateSet restored the target set's scroll (top if new).
}

/* ── 🔁 Keep practicing: every skill marked "still working on it", grouped
   by module, with a jump link back to that skill ── */
/* ── 🔁 Keep practicing: its own full-screen page — #keep-practicing in the
      URL, browser Back exits (the games-screen pattern, in the site's normal
      look). Decision + full-page treatment for My progress: 2026-07-23. ── */
/* Keep practicing is a section inside My progress (openMyProgressScreen),
   not its own page, since 2026-09-12 (Today-first work order, Phase 2) —
   see the retired toggleKeepPracticing/openKeepPracticingScreen/
   closeKeepPracticingScreen/kpClosePanel in git history. renderKeepPracticing
   itself is unchanged; only its caller and its host page moved. */
async function renderKeepPracticing(){
  const bodyEl = document.getElementById('keep-practicing-body');
  if(!bodyEl) return;
  bodyEl.innerHTML = `<div class="coach-tip">${t('kp.loading')}</div>`;
  await ensureAllModuleData();
  const byModule = new Map();
  SETS.forEach(w => {
    (w.skills || []).forEach(sk => {
      if(progress[sk.id] !== 'working') return;
      const num = (sk.id.match(/-s(\d+)$/) || [])[1];
      if(!num) return;
      const g = byModule.get(w.moduleNum) || [];
      g.push({ wid: w.id, setLabel: tSetLabel(w.label), skillNum: Number(num), text: tf(sk,'text') });
      byModule.set(w.moduleNum, g);
    });
  });
  const modNums = [...byModule.keys()].sort((a, b) => a - b);
  if(!modNums.length){
    bodyEl.innerHTML = `<div class="coach-tip">${t('kp.emptyHtml')}</div>`;
    return;
  }
  bodyEl.innerHTML = modNums.map(mn => {
    const m = MODULE_MANIFEST.find(x => x.num === mn);
    const rows = byModule.get(mn).map(it =>
      `<button type="button" class="search-hit" onclick="searchGoSkill(${mn},'${it.wid}',${it.skillNum})">
        <span class="search-hit-where">${escHtml(it.setLabel || '')}</span>
        <span class="search-hit-text">${escHtml(it.text)}</span>
      </button>`).join('');
    return `<div class="rail-sec-label" style="margin:16px 0 6px">${t('nav.module')} ${mn}${m ? ` — ${escHtml(tf(m,'name'))}` : ''}</div>
      <div class="search-results" style="max-height:none">${rows}</div>`;
  }).join('');
}

/* ── 🗓️ Daily Review (spaced review): a section inside My progress (see
   Keep practicing above) — not its own page since 2026-09-12. Four
   already-earned skills (progress==='gotit'), preferring ones outside the module the
   student is currently in (those are already in rotation) and weighted
   toward whichever has gone longest without a rep. This is the retention
   fix for "learned it in Module 3, lost it by Module 9" — deliberately
   named "Daily Review", not "warm-up" (WARMUP_BANK/daily5.* already own
   that word for the Daily 5 finger-gym). */
function srCandidates(){
  const all = [];
  SETS.forEach(w => (w.skills || []).forEach(s => {
    if(!s.practice || progress[s.id] !== 'gotit') return;
    const e = practiceLog[s.id];
    all.push({ sid: s.id, moduleNum: w.moduleNum, last: (e && e.last) || 0 });
  }));
  const outside = all.filter(c => c.moduleNum !== lastModuleNum);
  const pool = outside.length >= 4 ? outside : all;
  return pool.sort((a, b) => a.last - b.last).slice(0, 4).map(c => c.sid);
}
// Reads today's already-stored snapshot without computing a new one — safe
// to call before every module is loaded into SETS (srCandidates() needs the
// full catalogue to know what's "outside the current module"). Returns []
// when nothing's stored yet for today; the snapshot is only ever first
// computed by srLoadTodayIds(), from renderDailyReview(), which awaits
// ensureAllModuleData() first. Stale ids (module IS loaded, skill gone —
// content changed under the snapshot) are dropped; ids from modules not yet
// in SETS are kept — daysSinceLastRep reads practiceLog, which doesn't need
// the module file, and dropping them would let srCheckComplete's no-arg
// path judge "all reviewed" against just the loaded subset and burn the
// once-a-day bonus early.
function srStoredTodayIds(){
  const today = dayStr(new Date());
  let stored = null;
  try{ stored = JSON.parse(localStorage.getItem(_uidKey('gc-srPicks'))); }catch(e){}
  if(!(stored && stored.day === today && Array.isArray(stored.ids))) return [];
  const loaded = new Set(SETS.map(w => w.moduleNum));
  return stored.ids.filter(sid => {
    if(skillById(sid)) return true;
    // Module 1's skill ids carry no module number ('w1-s2'); every other
    // module's start 'm<N>w' ('m3w1-s2').
    const m = /^m(\d+)/.exec(sid);
    const mod = m ? +m[1] : (/^w\d+-s\d+$/.test(sid) ? 1 : null);
    return mod != null && !loaded.has(mod);
  });
}
// Today's picks are stable all day (no reshuffling as they're completed) —
// stashed per-student in localStorage, keyed on the calendar day so a new
// day naturally recomputes. Ids that no longer resolve to a skill (content
// changed under a stale snapshot) are dropped, not replaced mid-day. A short
// snapshot (fewer than 4 — the student hadn't earned enough skills when the
// page was first opened today) does top up from fresh candidates, otherwise
// day 1 would freeze "Nothing to review yet" until midnight no matter how
// many skills were earned that afternoon; already-stored picks stay put, and
// a page already completed today (bonus banked) stops growing. Only call
// this after ensureAllModuleData() — srCandidates() reads SETS directly,
// which otherwise may hold just the student's current module. canPersist:
// false skips the localStorage write — used when a module file failed to
// load, so a picks list computed from a partial catalogue can't get locked
// in for the day (same poisoning class the logPracticeRep path guards).
function srLoadTodayIds(canPersist){
  const today = dayStr(new Date());
  let stored = null;
  try{ stored = JSON.parse(localStorage.getItem(_uidKey('gc-srPicks'))); }catch(e){}
  let ids = (stored && stored.day === today && Array.isArray(stored.ids))
    ? stored.ids.filter(sid => skillById(sid))
    : null;
  if(ids === null || (ids.length < 4 && games.srBonusDay !== today)){
    const have = new Set(ids || []);
    const fresh = srCandidates().filter(sid => !have.has(sid));
    ids = (ids || []).concat(fresh).slice(0, 4);
  }
  if(canPersist !== false){
    try{ localStorage.setItem(_uidKey('gc-srPicks'), JSON.stringify({ day: today, ids })); }catch(e){}
  }
  return ids;
}
function srSkillWith(sid){
  for(const w of (SETS || [])){
    const hit = (w.skills || []).find(x => x.id === sid);
    if(hit) return { s: hit, w };
  }
  return null;
}
function srDaysLabel(sid){
  const d = daysSinceLastRep(sid);
  if(d < 0) return { key:'sr.neverSince', params:null };
  // n === 1 gets its own key — "1 days ago" / "hace 1 días" reads broken in
  // both languages (same singular split as rep.lastYesterday).
  return d === 1 ? { key:'sr.daysAgo1', params:null } : { key:'sr.daysAgo', params:{n:d} };
}
// All 4 picks reviewed today → +10 XP into the arcade meta-layer, once per
// day. Called both after every logged rep and on every Daily Review page
// open/render, so the bonus lands whether or not the student is looking at
// the page when they finish the fourth one. Without an explicit `ids` (the
// logPracticeRep path — any rep, anywhere on the site, not just Daily
// Review), this must NOT be the thing that first computes today's snapshot:
// srCandidates() needs every module loaded into SETS to know what's outside
// the student's current one, and logPracticeRep never awaits that. Reading
// only what's already stored means a rep logged before the student has ever
// opened Daily Review today is simply a no-op here — the snapshot gets
// created correctly, once, from renderDailyReview()'s awaited call instead.
function srCheckComplete(ids){
  // Same guard as bumpPracticeStreak/awardArcadeXp — the dev-bypass uid is
  // rejected by the Firestore rules, so skip the write (and the XP) rather
  // than let queueSave retry a doomed save.
  if(!currentUser || (typeof isDevBypassUser === 'function' && isDevBypassUser())) return;
  ids = ids || srStoredTodayIds();
  if(!ids.length || !ids.every(sid => daysSinceLastRep(sid) === 0)) return;
  const today = dayStr(new Date());
  if(games.srBonusDay === today) return;
  // Don't burn the once-a-day flag unless the XP can actually land — if
  // coach.js failed to load, leave it unclaimed so a later render retries.
  if(typeof awardArcadeXp !== 'function') return;
  games.srBonusDay = today;
  saveGames();
  awardArcadeXp(false);
}
// My progress is the merged page now (openMyProgressScreen) — check ITS
// hidden state, not a standalone Daily Review screen, which no longer exists.
function srRefreshIfOpen(){
  const screen = document.getElementById('my-progress-screen');
  if(screen && !screen.hasAttribute('hidden') && typeof renderDailyReview === 'function') renderDailyReview();
}
// Closes the full-screen page first — reviewJump scrolls/flashes a row
// underneath it, which the student can't see while the page still covers it.
function srPracticeThis(sid, wid){
  // Closing goes through exitExploreHash → an async popstate that restores
  // practiceScrollTop (stashed when this page opened) — which would land on
  // top of reviewJump's scrollIntoView. Same race leaveTopPanelForSet
  // defends against, same fix: the jump owns the scroll now.
  practiceScrollTop = 0;
  closeMyProgressScreen();
  reviewJump(sid, wid);
}
async function renderDailyReview(){
  const bodyEl = document.getElementById('sr-screen-body');
  if(!bodyEl) return;
  bodyEl.innerHTML = `<div class="coach-tip">${t('kp.loading')}</div>`;
  const catalogueComplete = await ensureAllModuleData();
  const ids = srLoadTodayIds(catalogueComplete);
  srCheckComplete(ids);
  if(!ids.length){
    bodyEl.innerHTML = `<div class="coach-tip" data-i18n="sr.empty">${t('sr.empty')}</div>`;
    return;
  }
  const picks = ids.map(srSkillWith).filter(Boolean);
  const doneCount = picks.filter(p => daysSinceLastRep(p.s.id) === 0).length;
  const allDone = doneCount >= picks.length;
  const progressParams = { done: doneCount, total: picks.length };
  const rows = picks.map(p => {
    const doneToday = daysSinceLastRep(p.s.id) === 0;
    const m = MODULE_MANIFEST.find(x => x.num === p.w.moduleNum);
    const modLabel = `${t('nav.module')} ${p.w.moduleNum}${m ? ` — ${escHtml(tf(m,'name'))}` : ''} &middot; ${escHtml(tSetLabel(p.w.label))}`;
    // The recency chip is redundant with the "Reviewed today" badge once a
    // pick is done — omit it there rather than show "0 days ago".
    const last = srDaysLabel(p.s.id);
    const whenHtml = doneToday ? '' : `<span class="sr-card-when" data-i18n="${last.key}"${last.params ? ` data-i18n-params='${escAttr(JSON.stringify(last.params))}'` : ''}>${t(last.key, last.params)}</span>`;
    return `<div class="sr-card${doneToday ? ' sr-done' : ''}">
      <div class="sr-card-main">
        <div class="sr-card-text">${tf(p.s,'text')}</div>
        <div class="sr-card-meta">
          <span class="sr-card-mod">${modLabel}</span>
          ${whenHtml}
        </div>
      </div>
      ${doneToday
        ? `<span class="sr-card-check" data-i18n="sr.doneToday">${t('sr.doneToday')}</span>`
        : `<button type="button" class="sr-go-btn" onclick="srPracticeThis('${p.s.id}','${p.w.id}')" data-i18n="sr.go">${t('sr.go')}</button>`}
    </div>`;
  }).join('');
  bodyEl.innerHTML =
    `<div class="sr-tagline" data-i18n="sr.tagline">${t('sr.tagline')}</div>
    <div class="sr-progress" data-i18n="sr.progress" data-i18n-params='${escAttr(JSON.stringify(progressParams))}'>${t('sr.progress', progressParams)}</div>
    ${allDone ? `<div class="sr-alldone" data-i18n="sr.allDone">${t('sr.allDone')}</div>` : ''}
    <div class="sr-cards">${rows}</div>`;
}
/* ── 📊 My progress: Daily Review, then Keep practicing, then done/total for
   every module + a total mastered count — three sections, one full-screen
   page, #my-progress in the URL, Back exits. Merged 2026-09-12 (Today-first
   work order, Phase 2, nav collapse); see the retired toggleDailyReview/
   openDailyReviewScreen/closeDailyReviewScreen/srClosePanel and
   toggleKeepPracticing/openKeepPracticingScreen/closeKeepPracticingScreen/
   kpClosePanel in git history. ── */
// Second tap scrolls to the top — see toggleSongsHub.
function toggleMyProgress(){
  const screen = document.getElementById('my-progress-screen');
  if(!screen) return;
  if(screen.hasAttribute('hidden')) goExploreHash('my-progress');
  else scrollPaneTop(true);
}
function openMyProgressScreen(){
  const screen = document.getElementById('my-progress-screen');
  if(!screen || !screen.hasAttribute('hidden')) return;
  closeTopPanels('my-progress');
  screen.removeAttribute('hidden');
  syncExploreNav();
  const exit = screen.querySelector('.page-exit, .page-title');
  if(exit) exit.focus();
  // Three sections, three render calls — Daily Review first (it carries the
  // once-a-day bonus, so it shouldn't be buried), then Keep practicing, then
  // the module-by-module tally.
  renderDailyReview();
  renderKeepPracticing();
  renderMyProgress();
}
function closeMyProgressScreen(){
  if(location.hash === '#my-progress'){ exitExploreHash(); return; }  // the router finishes the job
  mpClosePanel();
}
function mpClosePanel(){
  const screen = document.getElementById('my-progress-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if(screen) screen.setAttribute('hidden', '');
  const btn = document.getElementById('my-progress-btn');
  if(btn && wasOpen) btn.focus();   // return focus to where the page was opened
  syncExploreNav();
}
function renderMyProgress(){
  const bodyEl = document.getElementById('my-progress-body');
  if(!bodyEl) return;
  let totalDone = 0, totalAll = 0;
  const rows = MODULE_MANIFEST.map(m => {
    const { done, total } = moduleCompletion(m);
    totalDone += done; totalAll += total;
    const pct = total ? Math.round(done / total * 100) : 0;
    /* The module name opens that module (navigability round 2, 2026-09-23)
       — same path as the Songs hub's module links (songHubGoModule). A
       locked module opens the same way the picker would open it. */
    return `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
      <button type="button" class="mp-mod-link" onclick="songHubGoModule(${m.num})" title="${escAttr(t('progress.openModule', {n: m.num}))}">${t('nav.module')} ${m.num} — ${escHtml(tf(m,'name'))} <span aria-hidden="true">&rarr;</span></button>
      <div class="prog-wrap"><div class="prog-row"><div class="prog-bg"><div class="prog-fill" style="width:${pct}%"></div></div><div class="prog-lbl">${done} / ${total}</div></div></div>
    </div>`;
  }).join('');
  const totalPct = totalAll ? Math.round(totalDone / totalAll * 100) : 0;
  const overallRow = `<div style="padding:10px 0;border-bottom:1px solid var(--border)">
      <div style="font-size:0.875rem;font-weight:600">${t('progress.overall')}</div>
      <div class="prog-wrap"><div class="prog-row"><div class="prog-bg"><div class="prog-fill" style="width:${totalPct}%"></div></div><div class="prog-lbl">${totalDone} / ${totalAll}</div></div></div>
    </div>`;
  bodyEl.innerHTML = `<div class="coach-tip" data-i18n="progress.skillsMastered" data-i18n-params="${escAttr(JSON.stringify({done:totalDone,total:totalAll,modules:MODULE_MANIFEST.length}))}">${t('progress.skillsMastered',{done:totalDone,total:totalAll,modules:MODULE_MANIFEST.length})}</div>
    <div class="card">${overallRow}${rows}</div>`;
  if(typeof applyI18n === 'function') applyI18n(bodyEl);
  // Practice minutes tiles, bars and the 8-week grid (hidden unless uiOn).
  if(window.PM) PM.renderProgress(document.getElementById('pm-progress'));
}

/* ── ✓ In-Class Activities: teacher-curated, day-specific work pushed out
   alongside the self-paced modules ── An explore page in the main column
   (#class-activities), same plumbing as its rail neighbours above (see
   EXPLORE_PAGES). An activity is LIVE the moment its entry is on main —
   there is no toggle — and activities never retire; this page is a
   permanent archive, newest first. Own lightweight renderer (not the .dp
   station-card builder — see the work order this shipped from): activities
   are simple enough that reusing the station machinery would drag in focus
   mode, the footer gate and stepper logic for no benefit. */
// Second tap scrolls to the top — see toggleSongsHub. An open card stays open.
function toggleClassActivities(){
  const screen = document.getElementById('class-activities-screen');
  if(!screen) return;
  if(screen.hasAttribute('hidden')) goExploreHash('class-activities');
  else scrollPaneTop(true);
}
function closeClassActivitiesScreen(){
  // Base compare: a deep link ('#class-activities/ca-15') is the same page.
  if(exploreHashBase(location.hash) === '#class-activities'){ exitExploreHash(); return; }  // the router finishes the job
  caClosePanel();
}
function caClosePanel(keepFocus){
  const screen = document.getElementById('class-activities-screen');
  const wasOpen = screen && !screen.hasAttribute('hidden');
  if(screen) screen.setAttribute('hidden', '');
  const btn = document.getElementById('class-activities-btn');
  // Return focus to where the page was opened — unless the caller is moving
  // it somewhere itself (resumeGoModule focuses the set it opened).
  if(btn && wasOpen && keepFocus !== true) btn.focus();
  /* A Shuffle Drill in an activity step keeps its countdown interval (and any
     pending "next card" timeout) running once this screen is merely hidden —
     nothing rebuilds it on the way out. Same teardown, and same reasoning, as
     the set-switch in switchTabById; a no-op for drills not mid-round. */
  if(typeof sdAbortAll === 'function') sdAbortAll();
  /* Same reasoning for an exit check mid-run: its stimulus auto-plays, so
     closing the screen while a line is sounding would leave the notes
     ringing over whatever the student opened next.
     stopCardAudio(), not stopAllDemoAudio() (2026-09-19): notes ringing out
     of a screen that is gone are this page's mess to clean up, but the FAB
     metronome belongs to the student and rides along to whatever they open
     next — it is on every screen, with its own Stop. fab-tools.js already
     draws exactly this line for dismissing a popup ("the student shouldn't
     silently lose the click they're practicing to"), so navigating away
     should not be stricter than that. */
  if(typeof stopCardAudio === 'function') stopCardAudio();
  syncExploreNav();
}
function openClassActivitiesScreen(focusId){
  const screen = document.getElementById('class-activities-screen');
  if(!screen) return;
  if(screen.hasAttribute('hidden')){
    closeTopPanels('class-activities');
    screen.removeAttribute('hidden');
    syncExploreNav();
    const exit = screen.querySelector('.page-exit, .page-title');
    if(exit) exit.focus();
  }
  /* Already open is not "nothing to do": a second deep link (a student
     tapping the next check's URL while this page is up) still has to move
     the page to that card, so the focus pass runs either way. */
  if(focusId) caFocusActivity(focusId);
  else { caLinkMissingId = null; renderClassActivities(); }
}
