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

/* Spanish translate toggle — mirrors the main app's toggleTranslate() */
var isSpanish = false;
function toggleTranslate(){
  var btn = document.getElementById('btn-translate');
  var lbl = document.getElementById('translate-label');
  var select = document.querySelector('.goog-te-combo');
  if(!isSpanish){
    if(select){ select.value='es'; select.dispatchEvent(new Event('change')); }
    else { document.cookie='googtrans=/en/es; path=/'; location.reload(); return; }
    btn.classList.add('active'); lbl.textContent='English'; isSpanish=true;
  } else {
    if(select){ select.value='en'; select.dispatchEvent(new Event('change')); }
    else { document.cookie='googtrans=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'; location.reload(); return; }
    btn.classList.remove('active'); lbl.textContent='Español'; isSpanish=false;
  }
}

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

function openFromHash(){
  var id = (location.hash || '').replace('#', '');
  if(!id) return false;
  var section = document.getElementById(id);
  if(!section || !section.classList.contains('layer')) return false;
  userInteracted = true;
  openLayer(section, true);
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
   a YouTube id (data-video, an embedded iframe). */
function togglePlayalong(btn){
  var box = document.getElementById('playalong-frame');
  if(!box) return;
  var opening = box.hidden;
  if(opening && !box.dataset.loaded){
    if(box.dataset.audio){
      var a = document.createElement('audio');
      a.src = box.dataset.audio;
      a.controls = true;
      a.loop = true;
      a.preload = 'none';
      a.title = 'Play-along backing track';
      if(box.dataset.audioMetronome){
        var metroBtn = document.createElement('button');
        metroBtn.type = 'button';
        metroBtn.className = 'metronome-toggle';
        metroBtn.setAttribute('aria-pressed', 'false');
        metroBtn.innerHTML = '&#x1F3B5; Metronome';
        metroBtn.onclick = function(){
          var wasPlaying = !a.paused;
          var t = a.currentTime;
          var on = metroBtn.classList.toggle('on');
          metroBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
          var resume = function(){
            a.currentTime = t;
            if(wasPlaying) a.play().catch(function(){});
            a.removeEventListener('loadedmetadata', resume);
          };
          a.addEventListener('loadedmetadata', resume);
          a.src = on ? box.dataset.audioMetronome : box.dataset.audio;
          a.load();
        };
        box.appendChild(metroBtn);
      }
      box.appendChild(a);
      a.play().catch(function(){ /* autoplay may be blocked — the controls still work */ });
    } else {
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube.com/embed/' + box.dataset.video;
      f.title = 'Play-along backing track';
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
  pill.textContent = rated + ' of ' + layers.length + ' layers rated';
}

function paintChip(section){
  if(!section) return;
  var chip = section.querySelector('.layer-rate-chip');
  if(!chip) return;
  var on = section.querySelector('.rate button.on');
  chip.textContent = on ? ('✓ ' + on.textContent) : '';
}

/* Run immediately (script loads at end of body, DOM is already parsed):
   a hash link always wins; otherwise Layer 1 stays open (its default
   HTML state) until saved ratings arrive. */
openFromHash();
updateProgressPill();

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

function setSaveMsg(t){ document.getElementById('save-msg').textContent = t; }

/* Debounced save, mirroring the app's queueSave/flushSave pattern: a burst
   of clicks becomes one write, and a failed write stays dirty so the next
   click retries it. */
function queueSave(){
  if(!fbUser) return;
  dirty = true;
  setSaveMsg('Saving…');
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 800);
}

function flushSave(){
  if(!fbUser || !dirty) return;
  dirty = false;
  var payload = { songRatings: {} };
  payload.songRatings[SONG_ID] = currentRatings();
  fbDb.collection('progress').doc(fbUser.uid).set(payload, { merge: true })
    .then(function(){ setSaveMsg('Saved ✓'); setTimeout(function(){ setSaveMsg(''); }, 2000); })
    .catch(function(){ dirty = true; setSaveMsg('Save failed — check connection'); });
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
    if(!user){ setSaveMsg('Sign in on the class site to save your ratings'); return; }
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
