/* Shared script for the Song Journey pages (tabs/*.html) — translate toggle,
   layer accordion, and layer readiness checkboxes. Each page sets `var SONG_ID = '...'`
   in its own inline <script> before loading this file.
   Readiness saves into the SAME Firestore doc the main app uses
   (progress/{uid}), under songReady.<song-id>.<layer> — so no new
   collections and no security-rule changes. If the student isn't signed
   in, or a school filter blocks the Firebase SDK, the highlight quietly
   stays session-only (same behavior the page always had). */
var fbUser = null, fbDb = null, saveTimer = null, dirty = false;
/* A rating clicked before Firebase auth resolved — flush it as soon as
   fbUser exists (see queueSave / the onAuthStateChanged handler).

   `authSettled` bounds that to the PAGE-BOOT race only, and it matters on a
   shared Chromebook. Firebase auth persistence is shared across tabs, so a
   journey page left open while signed out will receive an onAuthStateChanged
   for whoever signs in NEXT — in another tab, minutes later. Flushing
   pendingSave on that would write the previous student's ratings straight
   into the new student's doc, unprompted, and {merge:true} would overwrite
   their real values for those layers. So: flush only on the first auth
   resolution after load (the student who was already sitting here), and on
   any later change of user, throw the pending ratings away instead.

   `sdkFailed` is sticky because the failure is: once the Firestore script
   404s, fbUser never arrives, so every subsequent click needs to be told,
   not just the one that raced the onerror. */
var pendingSave = false, authSettled = false, sdkFailed = false;
var userInteracted = false;

/* Always open at the very top — regardless of a #layer-N hash in the URL
   (deep links, "resume where you left off" buttons) or the browser
   restoring a previous scroll position on back/forward navigation. The
   hash still opens the right layer (see openFromHash below); it just
   shouldn't scroll the page there on first load. */
if('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
window.addEventListener('load', function(){ window.scrollTo(0, 0); });

/* Spanish toggle — hand-written translations, no Google Translate.
   Every translatable element in a Journey page carries a data-es attribute
   holding its Spanish innerHTML; switching to Spanish stashes the English
   original in data-en-html and swaps, switching back restores it. The
   shared Tuner/Timer/Metronome popups keep their data-i18n keys (i18n.js
   handles those via setLang → applyI18n), and journey.js's own dynamic
   strings go through t() — i18n.js loads synchronously BEFORE this file
   on every Journey page, so t()/getLang() exist even at parse time. */
function applyJourneyLang(lang){
  document.querySelectorAll('[data-es]').forEach(function(el){
    if(lang === 'es'){
      if(el.dataset.enHtml === undefined) el.dataset.enHtml = el.innerHTML;
      el.innerHTML = el.dataset.es;
    } else if(el.dataset.enHtml !== undefined){
      el.innerHTML = el.dataset.enHtml;
    }
  });
  var btn = document.getElementById('btn-translate');
  var lbl = document.getElementById('translate-label');
  if(btn) btn.classList.toggle('active', lang === 'es');
  if(lbl) lbl.textContent = (lang === 'es') ? 'English' : 'Español';
  updateProgressPill();
}
function toggleTranslate(){
  setLang(getLang() === 'es' ? 'en' : 'es');
  /* the gc-langchange listener below does the page swap */
}
window.addEventListener('gc-langchange', function(e){ applyJourneyLang(e.detail.lang); });

/* ── Layer accordion ──
   One layer open at a time. Collapsed = `.closed` on `section.layer`
   (CSS hides `.layer-body`) — class toggling only, never innerHTML
   re-render, so in-progress state (rating selections) survives a
   collapse/expand cycle. */
function allLayers(){
  return Array.prototype.slice.call(document.querySelectorAll('.layer'));
}

/* Bonus layers (.bonus) carry no rating widget, so the progress pill and the
   first-unrated-layer scan only look at core layers — a bonus layer would
   otherwise always read as "unrated" and skew both. The accordion itself
   still includes bonus layers (allLayers, above). */
function coreLayers(){
  return Array.prototype.slice.call(document.querySelectorAll('.layer:not(.bonus)'));
}

function closeLayer(section){
  section.classList.add('closed');
  var btn = section.querySelector('.layer-head');
  if(btn) btn.setAttribute('aria-expanded', 'false');
}

function openLayer(section, scroll){
  allLayers().forEach(function(s){ if(s !== section) closeLayer(s); });
  section.classList.remove('closed');
  var btn = section.querySelector('.layer-head');
  if(btn) btn.setAttribute('aria-expanded', 'true');
  if(scroll) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function toggleLayer(btn){
  userInteracted = true;
  var section = btn.closest('.layer');
  if(section.classList.contains('closed')) openLayer(section, false);
  else closeLayer(section);
}

function firstUnreadyLayer(){
  return coreLayers().filter(function(s){
    var box = s.querySelector('.ready-box');
    return box && !box.checked;
  })[0];
}

function openFromHash(scroll){
  var id = (location.hash || '').replace('#', '');
  if(!id) return false;
  var section = document.getElementById(id);
  if(!section || !section.classList.contains('layer')) return false;
  userInteracted = true;
  openLayer(section, scroll !== false);
  return true;
}

window.addEventListener('hashchange', openFromHash);

/* Printing: show everything — expand all layers and open every fold, so a
   printed handout is the full journey (matches the main app's print rule). */
window.addEventListener('beforeprint', function(){
  allLayers().forEach(function(s){
    s.classList.remove('closed');
    var btn = s.querySelector('.layer-head');
    if(btn) btn.setAttribute('aria-expanded', 'true');
  });
  document.querySelectorAll('details').forEach(function(d){ d.open = true; });
});

/* ── Play-along backing track ──
   The player is only injected on first open (lazy), so the page never
   downloads the track unless the student asks for it. A page can supply
   either a local audio file (data-audio, an <audio> player that loops) or
   a YouTube id (data-video, an embedded iframe).

   A page may also supply a slower stepping-stone tier (data-audio-slow,
   optionally data-audio-slow-metronome) alongside data-bpm / data-bpm-slow.
   The Slow and Metronome toggles are independent, so the audio source is
   picked from whichever of the four combinations is active. Switching the
   Slow toggle mid-song rescales currentTime by the tempo ratio so playback
   resumes at the same musical position instead of the same second.

   ensurePlayer() builds the <audio> element (and its Slow/Metronome
   toggles) exactly once, however it's first reached — the top play-along
   box (togglePlayalong) and the floating backing-track pill (toggleTrackFab)
   both call it, so there's only ever one player on the page. */
function ensurePlayer(){
  var box = document.getElementById('playalong-frame');
  if(!box || !box.dataset.audio) return null;
  if(box.dataset.loaded) return box.querySelector('audio');

  var a = document.createElement('audio');
  a.controls = true;
  a.loop = true;
  a.preload = 'none';
  a.title = t('journey.playalongTitle');

  var metroOn = false, slowOn = false;

  var currentSrc = function(){
    if(slowOn) return metroOn ? box.dataset.audioSlowMetronome : box.dataset.audioSlow;
    return metroOn ? box.dataset.audioMetronome : box.dataset.audio;
  };

  var switchSrc = function(rescale){
    var wasPlaying = !a.paused;
    var t = a.currentTime;
    if(rescale){
      var bpm = parseFloat(box.dataset.bpm);
      var bpmSlow = parseFloat(box.dataset.bpmSlow);
      if(bpm && bpmSlow) t = slowOn ? t * (bpm / bpmSlow) : t * (bpmSlow / bpm);
    }
    var resume = function(){
      a.currentTime = t;
      if(wasPlaying) a.play().catch(function(){});
      a.removeEventListener('loadedmetadata', resume);
    };
    a.addEventListener('loadedmetadata', resume);
    a.src = currentSrc();
    a.load();
  };

  a.src = currentSrc();

  if(box.dataset.audioSlow){
    var slowBtn = document.createElement('button');
    slowBtn.type = 'button';
    slowBtn.className = 'metronome-toggle';
    slowBtn.setAttribute('aria-pressed', 'false');
    slowBtn.innerHTML = '&#x1F422; <span data-i18n="journey.slow" data-i18n-params=\'{"bpm":"' + box.dataset.bpmSlow + '"}\'></span>';
    slowBtn.onclick = function(){
      slowOn = !slowOn;
      slowBtn.classList.toggle('on', slowOn);
      slowBtn.setAttribute('aria-pressed', slowOn ? 'true' : 'false');
      switchSrc(true);
    };
    box.appendChild(slowBtn);
  }

  if(box.dataset.audioMetronome){
    var metroBtn = document.createElement('button');
    metroBtn.type = 'button';
    metroBtn.className = 'metronome-toggle';
    metroBtn.setAttribute('aria-pressed', 'false');
    metroBtn.innerHTML = '&#x1F3B5; <span data-i18n="tools.metronome"></span>';
    metroBtn.onclick = function(){
      metroOn = !metroOn;
      metroBtn.classList.toggle('on', metroOn);
      metroBtn.setAttribute('aria-pressed', metroOn ? 'true' : 'false');
      switchSrc(false);
    };
    box.appendChild(metroBtn);
  }

  box.appendChild(a);
  applyI18n(box);  /* fill the lazily-created toggle labels in the current language */

  /* Keep the floating Track pill's aria-pressed in sync with actual
     playback, however playback started or stopped (the pill, the top
     box's native controls, or the auto-pause-on-collapse below) —
     assistive tech only, the pill's ▶ glyph and styling never change. */
  var fabBtn = document.getElementById('fab-track');
  if(fabBtn){
    a.addEventListener('play', function(){ fabBtn.setAttribute('aria-pressed', 'true'); });
    a.addEventListener('pause', function(){ fabBtn.setAttribute('aria-pressed', 'false'); });
  }

  box.dataset.loaded = '1';
  return a;
}

function togglePlayalong(btn){
  var box = document.getElementById('playalong-frame');
  if(!box) return;
  var opening = box.hidden;
  if(opening && !box.dataset.loaded){
    if(box.dataset.audio){
      var a = ensurePlayer();
      if(a) a.play().catch(function(){ /* autoplay may be blocked — the controls still work */ });
    } else {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube.com/embed/' + box.dataset.video;
      f.title = t('journey.playalongTitle');
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      box.appendChild(f);
      box.dataset.loaded = '1';
    }
  } else {
    /* Already built. Collapsing only sets `hidden` (display:none), which does
       NOT stop an <audio> element — the loop would keep playing with no
       visible transport to stop it. Pause on collapse, and resume on re-open
       only if collapsing is what paused it, so a student who pressed pause on
       the player doesn't get the track restarted behind their back. */
    var player = box.querySelector('audio');
    if(player){
      if(!opening && !player.paused){
        player.pause();
        box.dataset.autopaused = '1';
      } else if(opening && box.dataset.autopaused){
        delete box.dataset.autopaused;
        player.play().catch(function(){});
      }
    }
  }
  box.hidden = !opening;
  btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
}

/* Floating backing-track pill — play/pause only, doesn't touch the top
   box's `hidden` state (that stays under togglePlayalong). */
function toggleTrackFab(){
  var a = ensurePlayer();
  if(!a) return;
  a.paused ? a.play().catch(function(){}) : a.pause();
}

/* ── Progress pill ── */
function updateProgressPill(){
  var pill = document.querySelector('.prog-pill');
  if(!pill) return;
  var layers = coreLayers();
  var ready = layers.filter(function(s){
    var box = s.querySelector('.ready-box');
    return box && box.checked;
  }).length;
  pill.textContent = t('journey.progPill', { ready: ready, n: layers.length });
}

/* Shared by readyChanged and applyReady so the chip-painting logic (text +
   the .ok class the CSS keys its green background off of) lives in one
   place. */
function paintChip(section, ready){
  if(!section) return;
  var chip = section.querySelector('.layer-rate-chip');
  if(!chip) return;
  chip.textContent = ready ? '✓' : '';
  chip.classList.toggle('ok', ready);
}

/* Run immediately (script loads at end of body, DOM is already parsed):
   a hash link always wins for which layer opens; otherwise Layer 1 stays
   open (its default HTML state) until saved readiness arrives. Don't scroll
   on this initial call — the page always opens at the top (see the
   scrollRestoration/scrollTo block above). */
openFromHash(false);
updateProgressPill();
/* Future-proofing: every page currently ships data-audio, but a page that
   doesn't shouldn't show a Track pill with nothing to play. */
(function(){
  var fabBtn = document.getElementById('fab-track');
  var frame = document.getElementById('playalong-frame');
  if(fabBtn && (!frame || !frame.dataset.audio)) fabBtn.hidden = true;
})();
/* A returning student who chose Spanish shouldn't see a flash of English —
   i18n.js (loaded just above) already restored gc-lang, so swap now. */
applyJourneyLang(getLang());
window.scrollTo(0, 0);

/* ── Layer readiness ──
   locallyClickedLayers tracks which layers the student has checked by hand
   this page load. It guards against a race with the initial Firestore
   `get()` below: if a click lands on a layer before that read resolves,
   `applyReady` must not blow the click away when it paints the saved
   state over the DOM — the pending debounced save reads readiness back out
   of the DOM, so an overwritten checkbox silently loses the click. */
var locallyClickedLayers = {};
function readyChanged(box){
  var row = box.closest('.ready-row');
  var section = box.closest('.layer');
  locallyClickedLayers[row.dataset.layer] = true;
  paintChip(section, box.checked);
  updateProgressPill();
  queueSave();
  /* Checking (not unchecking) advances to the next layer in document order
     — bonus included, so checking the last core layer opens the first
     bonus layer as the reward. Unchecking navigates nowhere. */
  if(box.checked){
    userInteracted = true;
    var layers = allLayers();
    var next = layers[layers.indexOf(section) + 1];
    if(next) openLayer(next, true);
  }
}

function currentReady(){
  var out = {};
  document.querySelectorAll('.ready-row').forEach(function(g){
    var box = g.querySelector('.ready-box');
    out[g.dataset.layer] = !!(box && box.checked);
  });
  return out;
}

function applyReady(saved){
  Object.keys(saved || {}).forEach(function(layer){
    /* A click already landed on this layer before this (one-time, initial)
       load resolved — the local click wins, don't overwrite it with
       whatever was saved before that click happened. */
    if(locallyClickedLayers[layer]) return;
    var g = document.querySelector('.ready-row[data-layer="' + layer + '"]');
    if(!g) return;
    var box = g.querySelector('.ready-box');
    if(!box) return;
    box.checked = !!saved[layer];
    paintChip(g.closest('.layer'), box.checked);
  });
  updateProgressPill();
  if(!userInteracted && !location.hash){
    var target = firstUnreadyLayer();
    if(target) openLayer(target, false);
  }
}

/* Save-status line — takes an I18N key (or '' to clear) and tags the element
   with data-i18n so a language switch re-translates whatever is showing. */
function setSaveMsg(key){
  var el = document.getElementById('save-msg');
  if(!key){ el.textContent = ''; el.removeAttribute('data-i18n'); return; }
  el.setAttribute('data-i18n', key);
  el.textContent = t(key);
}

/* Debounced save, mirroring the app's queueSave/flushSave pattern: a burst
   of clicks becomes one write, and a failed write stays dirty so the next
   click retries it. */
function queueSave(){
  dirty = true;
  /* Checkboxes are clickable from the moment the HTML parses, but `fbUser`
     only lands after load → onAuthStateChanged → the injected Firestore
     SDK — seconds later on school Wi-Fi. Don't drop the click: remember
     that something is unsaved and flush once `fbUser` arrives. One flush
     covers every layer checked in that window, because flushSave rebuilds
     the whole readiness map from the DOM (see currentReady). */
  /* The SDK never arrived (school filter, dead Wi-Fi). fbUser will never be
     set, so every later click would return silently while the chip paints
     "✓ 3" and the pill counts it — the page looks saved and isn't. Say so on
     every click, not just the one that happened to race the script's
     onerror. */
  if(sdkFailed){ setSaveMsg('journey.saveFailed'); return; }
  if(!fbUser){ pendingSave = true; return; }
  setSaveMsg('journey.saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 800);
}

function flushSave(){
  if(!fbUser || !dirty) return;
  dirty = false;
  var payload = { songReady: {} };
  payload.songReady[SONG_ID] = currentReady();
  fbDb.collection('progress').doc(fbUser.uid).set(payload, { merge: true })
    .then(function(){ setSaveMsg('journey.saved'); setTimeout(function(){ setSaveMsg(''); }, 2000); })
    .catch(function(){ dirty = true; setSaveMsg('journey.saveFailed'); });
}

function loadFirestoreSdk(){
  return new Promise(function(resolve, reject){
    if(firebase.firestore){ resolve(); return; }
    var s = document.createElement('script');
    s.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js';
    s.onload = resolve;
    s.onerror = function(){ reject(new Error('Firestore SDK failed to load')); };
    document.head.appendChild(s);
  });
}

window.addEventListener('load', function(){
  if(typeof firebase === 'undefined' || typeof firebaseConfig === 'undefined') return;
  firebase.initializeApp(firebaseConfig);
  firebase.auth().onAuthStateChanged(function(user){
    // A signed-out resolution still settles the boot race: anything rated
    // before this point belongs to nobody we can write for, and must NOT be
    // held for whoever signs in next.
    if(!user){ authSettled = true; pendingSave = false; setSaveMsg('journey.signin'); return; }
    // A DIFFERENT student just signed in (shared Chromebook, another tab).
    // Drop the previous student's unsaved ratings rather than writing them
    // into this one's doc, and clear the local-click guard so the read below
    // can repaint what THIS student actually saved.
    if(authSettled && fbUser && fbUser.uid !== user.uid){
      pendingSave = false; dirty = false; locallyClickedLayers = {};
    }
    var firstResolution = !authSettled;
    authSettled = true;
    loadFirestoreSdk().then(function(){
      fbDb = firebase.firestore();
      fbUser = user;
      setSaveMsg('');
      /* Anything rated while we were still booting has been sitting in the
         DOM unsaved — write it now, before the read below, so a student who
         taps a layer the second the page appears keeps that rating. The set
         merges, so it can't clobber layers saved on another day. Boot race
         only: see authSettled above for why a later sign-in must not flush. */
      if(pendingSave && firstResolution){ pendingSave = false; flushSave(); }
      else pendingSave = false;
      return fbDb.collection('progress').doc(user.uid).get();
    }).then(function(doc){
      var data = doc && doc.exists ? doc.data() : null;
      applyReady(data && data.songReady && data.songReady[SONG_ID]);
    }).catch(function(){
      /* An offline first read is fine — clicks still queue saves. But if the
         Firestore SDK itself never loaded, fbUser never arrives and NOTHING
         can be written, now or later; latch that so every click says so
         rather than only the one that happened to race this rejection. */
      if(!fbUser){ sdkFailed = true; setSaveMsg('journey.saveFailed'); }
    });
  });
  // Best-effort flush if the tab closes inside the debounce window.
  window.addEventListener('pagehide', function(){ if(dirty){ clearTimeout(saveTimer); flushSave(); } });
});
