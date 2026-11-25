/* ══ SONG HELP — the pop-up when a song does not load (2026-11-25) ═════════
   Jonathan, 2026-11-25: when a student cannot load a song, show a pop-up that
   helps them clear space and says what to do next. Before this a failure only
   showed a short toast (ca.snipLoadFailed). A song can fail for several
   reasons, so what shows MATCHES THE CAUSE (songHelpRoute, below; checks.mjs
   1fe runs it on every case):

     the browser says offline     today's toast only (clearing space does not fix Wi-Fi)
     a private song's own line    the card's line only: sf.clock (wrong date), sf.limit
                                  (the month's downloads), sf.offline, sf.signIn,
                                  sf.notAllowed, sf.notReady (app/songfiles.js knows
                                  the cause and says it); only its 'failed' comes here
     the teacher console          today's toast only (the console is not a student's
                                  Chromebook, and the pop-up empties saved songs)
     anything else                the pop-up. "This Chromebook is full." when the page
                                  knows it (songHelpIsFull: this page has seen a
                                  QuotaExceededError saving or loading a song, sfQuotaHit
                                  in app/songfiles.js); otherwise the steps in order of
                                  effort: press play
                                  again, the main button, empty Downloads, restart the
                                  Chromebook, tell the teacher.

   NOT TWICE (the quiet rule): once the pop-up has been closed, a later failure
   in the same page load shows the old toast with a small "Help" button that
   reopens it. The same toast-with-Help is used when another dialog is already
   open (openOverlay keeps ONE return-focus slot, so this never opens on top of
   another overlay).

   THE MAIN BUTTON, "Clear saved songs and reload" (songHelpClearAndReload):
   stops the card's audio, deletes the service worker's two audio caches (by
   name: SONG_HELP_AUDIO_CACHES, the names sw.js and tools/sw-audio-map.mjs pin;
   1fe holds them equal) and empties the private songs' device copies
   (songFilesClearDevice, app/songfiles.js), sends any unsaved progress and
   waits for it (flushBeforeLeaving, app/boot.js, at most SONG_HELP_WAIT_MS),
   then reloads the way the site's own update does (gcSwUpdating +
   swResumeSave), so the student comes back to the same page and card. Work
   still not saved after that wait (offline, a write that failed or never
   answered) is never reloaded over, the same rule as the update reload in
   app/start.js: no reload, the button comes back, and the line under it says
   save.notSavedYet. It never touches progress, sign-in, localStorage, or the
   shell cache.

   A web page cannot read free disk space or the Downloads folder, and
   navigator.storage.estimate() cannot tell a full disk either: Chrome reports
   the quota as what the site uses plus a fixed allowance, so used / quota never
   nears 1. So the pop-up shows no number, says "full" only after a real
   QuotaExceededError, and gives the Files-app steps. */

/* The service worker's audio caches: AUDIO_CACHE and AUDIO_HASH_CACHE in sw.js
   (AUDIO_CACHE_NAME, AUDIO_HASH_CACHE_NAME in tools/sw-audio-map.mjs). 1fe fails
   the push if either drifts, or if one is ever the shell cache. */
const SONG_HELP_AUDIO_CACHES = ['guitar-class-audio-2026-10-30-ff9e913a6d', 'guitar-class-audio-hashes'];
const SONG_HELP_WAIT_MS = 4000;        // a cache delete or an IndexedDB clear that never answers: go on; the longest wait for unsaved work
let songHelpClosedOnce = false;        // the pop-up was closed in this page load: later failures get the toast + Help
let songHelpBusy = false;              // the main button was pressed and its work is not finished

/* What a failure shows: 'none' (the card's own line says it), 'toast', 'toast-help' or 'popup'.
   o = { code, offline, teacher, closedOnce, otherOverlay }. code: '' for an <audio> element's error, else the
   private-song code (app/songfiles.js SONG_FILE_LINE_KEYS). */
function songHelpRoute(o){
  const code = (o && o.code) || '';
  if(code && code !== 'failed') return 'none';
  if(o.offline || o.teacher) return code ? 'none' : 'toast';
  if(o.closedOnce || o.otherOverlay) return 'toast-help';
  return 'popup';
}
/* Another dialog is up: a SHOWN element with aria-modal="true" (every overlay carries it). Hidden ones do not count:
   the Games and Live In-Class Games screens sit in index.html with aria-modal="true" all the time, hidden. */
function songHelpOtherOverlay(){
  return Array.from(document.querySelectorAll('[aria-modal="true"]')).some(el =>
    !el.closest('#song-help-overlay') && !el.closest('[hidden]') && el.getClientRects().length > 0);
}
function songHelpWithin(p, fallback){
  return Promise.race([Promise.resolve(p).catch(() => fallback), new Promise(r => setTimeout(() => r(fallback), SONG_HELP_WAIT_MS))]);
}
/* Does the page know this Chromebook is full? Only from a QuotaExceededError it has seen (sfQuotaHit). */
function songHelpIsFull(){
  return typeof sfQuotaHit !== 'undefined' && !!sfQuotaHit;
}

/* The players call this when a song does not load: snipAudioError (app/snippets.js), pcAudioError (app/cards.js),
   the Call the chord round (app/drills-call.js) with no code, and songFileWaitThen (app/songfiles.js) with its code.
   Returns the route it took. */
function songLoadFailed(code){
  const route = songHelpRoute({
    code: code || '',
    offline: typeof navigator !== 'undefined' && navigator.onLine === false,
    teacher: typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE,
    closedOnce: songHelpClosedOnce,
    otherOverlay: songHelpOtherOverlay()
  });
  const msg = t(code ? 'sf.failed' : 'ca.snipLoadFailed');
  if(route === 'toast') gateToast(msg);
  else if(route === 'toast-help') gateToast(msg, { label: t('songHelp.help'), onClick: songHelpReopen });
  else if(route === 'popup') songHelpOpen(songHelpIsFull() ? 'full' : 'unknown');
  return route;
}
/* The toast's Help button. */
function songHelpReopen(){
  if(!songHelpOtherOverlay()) songHelpOpen(songHelpIsFull() ? 'full' : 'unknown');
}

/* ── The pop-up ── */
function songHelpText(key, cls){
  return `<span${cls ? ` class="${cls}"` : ''} data-i18n="${key}">${escHtml(t(key))}</span>`;
}
function songHelpLi(key){ return `<li>${songHelpText(key)}</li>`; }
function songHelpDownloadsHtml(type){
  return `<ol class="song-help-dl"${type ? ` type="${type}"` : ''}>${['songHelp.dl1', 'songHelp.dl2', 'songHelp.dl3', 'songHelp.dl4', 'songHelp.dl5'].map(songHelpLi).join('')}</ol>`;
}
function songHelpClearHtml(){
  return `<div class="song-help-clear"><button type="button" class="panel-next-btn" id="song-help-clear" onclick="songHelpClearAndReload()" data-i18n="songHelp.clearBtn">${escHtml(t('songHelp.clearBtn'))}</button>${songHelpText('songHelp.keeps', 'song-help-note')}</div>`;
}
/* state: 'full' or 'unknown'. */
function songHelpHtml(state){
  const full = state === 'full';
  const head = `<div class="daily5-head"><h3 id="song-help-title" class="song-help-title">${songHelpText(full ? 'songHelp.full' : 'songHelp.title')}</h3>`
    + `<button type="button" class="tp-close" onclick="songHelpClose()" aria-label="${escAttr(t('gate.closeAria'))}" data-i18n-attr="aria-label:gate.closeAria">&#x2715;</button></div>`;
  const body = full
    ? `<p class="song-help-lead">${songHelpText('songHelp.downloads')}</p>${songHelpDownloadsHtml('')}`
      + songHelpClearHtml()
      + `<p class="song-help-lead">${songHelpText('songHelp.then')}</p>`
      + `<ol class="song-help-steps">${['songHelp.play', 'songHelp.restart', 'songHelp.teacher'].map(songHelpLi).join('')}</ol>`
    : `<p class="song-help-lead">${songHelpText('songHelp.tryOrder')}</p><ol class="song-help-steps">`
      + songHelpLi('songHelp.play')
      + `<li>${songHelpClearHtml()}</li>`
      + `<li>${songHelpText('songHelp.downloads')}${songHelpDownloadsHtml('a')}</li>`
      + songHelpLi('songHelp.restart')
      + songHelpLi('songHelp.teacher')
      + '</ol>';
  return head + body + `<div class="issue-actions"><button type="button" class="song-help-close" onclick="songHelpClose()" data-i18n="songHelp.close">${escHtml(t('songHelp.close'))}</button></div>`;
}
function songHelpOpen(state){
  if(document.getElementById('song-help-overlay')) return;
  const ov = document.createElement('div');
  ov.className = 'daily5-overlay song-help-overlay';
  ov.id = 'song-help-overlay';
  ov.innerHTML = `<div class="daily5-modal song-help" role="dialog" aria-modal="true" aria-labelledby="song-help-title" data-state="${state === 'full' ? 'full' : 'unknown'}">${songHelpHtml(state)}</div>`;
  ov.addEventListener('click', e => { if(e.target === ov) songHelpClose(); });
  document.body.appendChild(ov);
  document.addEventListener('keydown', songHelpEsc);
  /* Focus starts on the Close button, never on the main button: an Enter or Space meant for the card must not
     empty the saved songs and reload. */
  openOverlay(ov, ov.querySelector('.tp-close'));
}
function songHelpEsc(e){ if(e.key === 'Escape') songHelpClose(); }
function songHelpClose(){
  const ov = document.getElementById('song-help-overlay');
  if(!ov) return;
  ov.remove();
  document.removeEventListener('keydown', songHelpEsc);
  closeOverlay();
  songHelpClosedOnce = true;
}

/* ── The main button ── */
/* Delete the audio caches and the private songs' device copies. Returns what it did:
   { caches: [names deleted], songFiles: true|false }. Never rejects; a call that throws at once counts as not done. */
async function songHelpClearSaved(){
  const deleted = [];
  if(typeof caches !== 'undefined' && caches && typeof caches.delete === 'function'){
    for(const name of SONG_HELP_AUDIO_CACHES){
      if(await songHelpWithin(new Promise(r => r(caches.delete(name))), false)) deleted.push(name);
    }
  }
  const songFiles = typeof songFilesClearDevice === 'function' ? await songHelpWithin(new Promise(r => r(songFilesClearDevice())), false) : false;
  return { caches: deleted, songFiles: songFiles === true };
}
async function songHelpClearAndReload(){
  if(songHelpBusy) return;
  songHelpBusy = true;
  const btn = document.getElementById('song-help-clear');
  if(btn){ btn.disabled = true; btn.setAttribute('data-i18n', 'songHelp.clearing'); btn.textContent = t('songHelp.clearing'); }
  try { stopCardAudio(); } catch(e) {}
  try { await songHelpClearSaved(); } catch(e) {}
  /* A step marked done a moment ago is still inside queueSave's debounce, a save may be on the wire, or a failed one
     waits for its retry: send it now and wait for it, at most SONG_HELP_WAIT_MS (flushBeforeLeaving, app/boot.js,
     the step Sign out uses). Still not saved: no reload over it (the update reload's rule, app/start.js). The button
     comes back and says so; a second press clears again (nothing is left to clear) and sends again. */
  let saved = false;
  try { saved = !hasUnsavedWrites() || await flushBeforeLeaving(SONG_HELP_WAIT_MS); } catch(e) {}
  if(!saved){
    songHelpBusy = false;
    const b = document.getElementById('song-help-clear');
    if(b){ b.disabled = false; b.setAttribute('data-i18n', 'songHelp.clearBtn'); b.textContent = t('songHelp.clearBtn'); }
    const note = document.querySelector('#song-help-overlay .song-help-note');
    if(note){ note.setAttribute('data-i18n', 'save.notSavedYet'); note.setAttribute('role', 'alert'); note.textContent = t('save.notSavedYet'); }
    return;
  }
  /* Come back where the student was, as after an update (SW_UPDATE_BOOT, swResumeTake in app/boot.js). The wall
     says "Updating to the newest version…" for that moment. */
  try { sessionStorage.setItem('gcSwUpdating', '1'); } catch(e) {}
  swResumeSave();
  location.reload();
}
