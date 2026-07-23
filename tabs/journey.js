/* Shared script for the Song Journey pages (tabs/*.html) — translate toggle,
   layer accordion, and layer self-rating. Each page sets `var SONG_ID = '...'`
   in its own inline <script> before loading this file.
   Ratings save into the SAME Firestore doc the main app uses
   (progress/{uid}), under songRatings.<song-id>.<layer> — so no new
   collections and no security-rule changes. If the student isn't signed
   in, or a school filter blocks the Firebase SDK, the highlight quietly
   stays session-only (same behavior the page always had). */
var fbUser = null, fbDb = null, saveTimer = null, dirty = false;
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

function firstUnratedLayer(){
  return allLayers().filter(function(s){
    var chip = s.querySelector('.layer-rate-chip');
    return chip && !chip.textContent;
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
   resumes at the same musical position instead of the same second. */
function togglePlayalong(btn){
  var box = document.getElementById('playalong-frame');
  if(!box) return;
  var opening = box.hidden;
  if(opening && !box.dataset.loaded){
    if(box.dataset.audio){
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
      a.play().catch(function(){ /* autoplay may be blocked — the controls still work */ });
    } else {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube.com/embed/' + box.dataset.video;
      f.title = t('journey.playalongTitle');
      f.allow = 'autoplay; encrypted-media; picture-in-picture';
      f.allowFullscreen = true;
      box.appendChild(f);
    }
    box.dataset.loaded = '1';
  }
  box.hidden = !opening;
  btn.setAttribute('aria-expanded', opening ? 'true' : 'false');
}

/* ── Progress pill ── */
function updateProgressPill(){
  var pill = document.querySelector('.prog-pill');
  if(!pill) return;
  var layers = allLayers();
  var rated = layers.filter(function(s){
    var chip = s.querySelector('.layer-rate-chip');
    return chip && chip.textContent;
  }).length;
  pill.textContent = t('journey.progPill', { rated: rated, n: layers.length });
}

function paintChip(section){
  if(!section) return;
  var chip = section.querySelector('.layer-rate-chip');
  if(!chip) return;
  var on = section.querySelector('.rate button.on');
  chip.textContent = on ? ('✓ ' + on.textContent) : '';
}

/* Run immediately (script loads at end of body, DOM is already parsed):
   a hash link always wins for which layer opens; otherwise Layer 1 stays
   open (its default HTML state) until saved ratings arrive. Don't scroll
   on this initial call — the page always opens at the top (see the
   scrollRestoration/scrollTo block above). */
openFromHash(false);
updateProgressPill();
/* A returning student who chose Spanish shouldn't see a flash of English —
   i18n.js (loaded just above) already restored gc-lang, so swap now. */
applyJourneyLang(getLang());
window.scrollTo(0, 0);

/* ── Layer self-rating ── */
function rate(btn){
  var group = btn.closest('.rate');
  group.querySelectorAll('button').forEach(function(b){ b.classList.remove('on'); b.setAttribute('aria-checked', 'false'); });
  btn.classList.add('on');
  btn.setAttribute('aria-checked', 'true');
  paintChip(btn.closest('.layer'));
  updateProgressPill();
  queueSave();
}

function currentRatings(){
  var out = {};
  document.querySelectorAll('.rate').forEach(function(g){
    var on = g.querySelector('button.on');
    if(on) out[g.dataset.layer] = parseInt(on.textContent, 10);
  });
  return out;
}

function applyRatings(saved){
  Object.keys(saved || {}).forEach(function(layer){
    var g = document.querySelector('.rate[data-layer="' + layer + '"]');
    if(!g) return;
    g.querySelectorAll('button').forEach(function(b){
      var on = parseInt(b.textContent, 10) === saved[layer];
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', on ? 'true' : 'false');
    });
    paintChip(g.closest('.layer'));
  });
  updateProgressPill();
  if(!userInteracted){
    var target = firstUnratedLayer();
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
  if(!fbUser) return;
  dirty = true;
  setSaveMsg('journey.saving');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 800);
}

function flushSave(){
  if(!fbUser || !dirty) return;
  dirty = false;
  var payload = { songRatings: {} };
  payload.songRatings[SONG_ID] = currentRatings();
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
    if(!user){ setSaveMsg('journey.signin'); return; }
    loadFirestoreSdk().then(function(){
      fbDb = firebase.firestore();
      fbUser = user;
      setSaveMsg('');
      return fbDb.collection('progress').doc(user.uid).get();
    }).then(function(doc){
      var data = doc && doc.exists ? doc.data() : null;
      applyRatings(data && data.songRatings && data.songRatings[SONG_ID]);
    }).catch(function(){ /* offline first read is fine — clicks still queue saves */ });
  });
  // Best-effort flush if the tab closes inside the debounce window.
  window.addEventListener('pagehide', function(){ if(dirty){ clearTimeout(saveTimer); flushSave(); } });
});
