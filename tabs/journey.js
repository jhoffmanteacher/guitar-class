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
  // An open whole-song tab is re-measured: a resize while its layer was
  // closed could not size it (a hidden layer measures 0).
  section.querySelectorAll('.ws-fold').forEach(wsReflow);
  // Same rule as app.js's scrollBehavior(): an OS "reduce motion" setting
  // means jump, not slide. Inlined because these pages don't load app.js.
  const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(scroll) section.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
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

/* The hash carries up to two things, '&'-separated (journeyHref in app.js):
   'layer-N' (which layer to open) and 'from=<hash without #>' (where on
   the class site the student came from — e.g. class-activities/ca-20).
   hashLayerId() is the first; journeyFrom() the second. Only ever read,
   never rewritten, so the site's own links keep working unchanged. */
function hashParts(){
  return (location.hash || '').replace('#', '').split('&');
}
function hashLayerId(){
  var first = hashParts()[0] || '';
  return first.indexOf('=') === -1 ? first : '';
}
function journeyFrom(){
  var hit = hashParts().filter(function(p){ return p.indexOf('from=') === 0; })[0];
  if(!hit) return '';
  try { return decodeURIComponent(hit.slice(5)); } catch(e){ return ''; }
}
/* Where "Back to class site" goes — the sending card when the site said
   which, otherwise the home page. */
function journeyReturnHref(){
  var from = journeyFrom();
  return '../index.html' + (from ? '#' + from : '');
}
/* Navigability work order 2026-09-23, item 1. The class site opens every
   Journey page in a NEW tab (so the student's place on the site, and the
   5-15 s school-Wi-Fi sign-in, are never thrown away). Before this, the
   crumb link then loaded a second copy of the site into THAT tab — two
   site tabs, the first one still parked on the activity. Now: when this
   tab holds nothing but this page (history.length 1 — the way the site's
   window.open lands here), going back IS closing the tab, which drops the
   student straight onto the tab they came from. If the browser refuses
   (the student typed the URL, or has navigated within the tab), the link
   falls through to a normal load of the return address 300 ms later. */
function wireReturnLink(){
  var a = document.querySelector('.crumb-left a');
  if(!a) return;
  var href = journeyReturnHref();
  a.href = href;
  a.addEventListener('click', function(e){
    if(history.length > 1) return;   // a real page history — let the link navigate
    e.preventDefault();
    window.close();
    setTimeout(function(){ location.href = href; }, 300);
  });
}
if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wireReturnLink);
else wireReturnLink();

function openFromHash(scroll){
  var id = hashLayerId();
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

   A page whose song has a full mix exported may ALSO supply the full twin
   of every file it declares — data-audio-full, plus data-audio-full-metronome
   / data-audio-slow-full / data-audio-slow-full-metronome for each of the
   other three it has. The player then grows a third toggle, the same Guitar
   toggle a class-activity snippet card has (app.js buildSnippet) and with
   the same i18n keys: ON by default ("Record plays it"), press it and the
   rhythm-down mix plays ("You play it") — the part turned down, not muted,
   which is why the label names who plays it rather than saying "Guitar".
   The two mixes are one take at one tempo, so switching keeps currentTime
   as-is (no rescale). A half-declared set renders no toggle at all rather
   than a toggle that dies on Slow or Metronome; checks.mjs 1be fails the
   push on one, and on a full twin whose length differs from its
   rhythm-down file.

   A page may ALSO ask for the Metronome to be a click the PAGE makes, on the
   beat the room counts, instead of switching to the track's metronome file
   (2026-09-27, "the cure"): data-click-anchor — the fast file's first
   downbeat in seconds, the same number as SNIPPET_TRACKS[...].anchor in
   app.js — with data-bpm / data-bpm-slow holding the COUNTED tempos (72 /
   60 there, where the files are 144 / 120; the ratio is the same, so the
   Slow rescale doesn't move) and optional data-click-beats (default 4) for
   the loud click on beat 1. "the cure"'s metronome files click at the
   file's 144 BPM, twice the pulse the room counts, so the page declares no
   metronome files at all. The click is scheduled on an AudioContext a few
   ms ahead of each beat, offset by the same 80 ms output latency app.js
   uses (SNIP_OUTPUT_LATENCY), and follows Slow, Guitar and the loop.

   A song played by a band with no click cannot use one anchor and a steady
   tempo — the grid drifts off the record by mid-song — so its page lists
   every bar's downbeat instead (2026-10-01): data-click-bars, seconds on the
   FAST file, comma-separated, the same numbers as SNIPPET_TRACKS[...].barTimes
   in app.js (checks.mjs 1bk compares them), with data-click-beats clicks
   spread evenly inside each bar and the loud one on the downbeat. The slow
   tier is the same list scaled by data-bpm / data-bpm-slow. Nothing clicks
   before the first listed downbeat or after the last. Seven Nation Army,
   Sweet Child, Watchtower and Luna work this way, so no page but Let It Be
   declares a metronome file any more, and those files are gone from audio/.

   ensurePlayer() builds the <audio> element (and its Slow/Metronome/Guitar
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

  var d = box.dataset;
  var fullReady = !!d.audioFull
    && (!d.audioMetronome     || !!d.audioFullMetronome)
    && (!d.audioSlow          || !!d.audioSlowFull)
    && (!d.audioSlowMetronome || !!d.audioSlowFullMetronome);
  var metroOn = false, slowOn = false, guitarOn = fullReady;
  var clickAnchor = parseFloat(d.clickAnchor);
  var gridClick = isFinite(clickAnchor) && parseFloat(d.bpm) > 0 && parseFloat(d.bpmSlow) > 0;
  var clickBars = (d.clickBars || '').split(',').map(parseFloat).filter(isFinite);
  var barClick = clickBars.length > 1;
  var synthClick = barClick || gridClick;

  var currentSrc = function(){
    if(synthClick) return guitarOn ? (slowOn ? d.audioSlowFull : d.audioFull) : (slowOn ? d.audioSlow : d.audio);
    if(guitarOn){
      if(slowOn) return metroOn ? d.audioSlowFullMetronome : d.audioSlowFull;
      return metroOn ? d.audioFullMetronome : d.audioFull;
    }
    if(slowOn) return metroOn ? d.audioSlowMetronome : d.audioSlow;
    return metroOn ? d.audioMetronome : d.audio;
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

  /* The page-made click (data-click-anchor or data-click-bars, above). One
     click per counted beat, the next one scheduled once it is under 100 ms
     away; a jump back (the loop, a seek, a Slow switch) resets lastBeat so no
     beat is lost. */
  var clickCtx = null, clickRaf = 0, lastBeat = -1;
  var clickBeats = parseInt(d.clickBeats, 10) || 4;
  /* The beat map (data-click-bars). Beat n is click n counted from the first
     listed downbeat; both helpers work in FAST-file seconds.
     barBeatTime: when beat n sounds, or null off either end of the list.
     barNextBeat: the first beat at or after time t, or -1 past the last. */
  var barBeatTime = function(n){
    var i = Math.floor(n / clickBeats), k = n - i * clickBeats, last = clickBars.length - 1;
    if(n < 0 || i > last) return null;
    if(i === last) return k === 0 ? clickBars[last] : null;
    return clickBars[i] + k * (clickBars[i + 1] - clickBars[i]) / clickBeats;
  };
  var barNextBeat = function(t){
    var lo = 0, hi = clickBars.length - 1;
    if(t <= clickBars[0]) return 0;
    if(t > clickBars[hi]) return -1;
    while(hi - lo > 1){
      var mid = (lo + hi) >> 1;
      if(clickBars[mid] <= t) lo = mid; else hi = mid;
    }
    var step = (clickBars[lo + 1] - clickBars[lo]) / clickBeats;
    return lo * clickBeats + Math.ceil((t - clickBars[lo]) / step - 1e-6);
  };
  var clickAt = function(at, accent){
    var o = clickCtx.createOscillator(), g = clickCtx.createGain();
    o.frequency.value = accent ? 1500 : 1000;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(accent ? 0.2 : 0.13, at + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, at + 0.08);
    o.connect(g); g.connect(clickCtx.destination);
    o.start(at); o.stop(at + 0.1);
  };
  var clickTick = function(){
    clickRaf = 0;
    if(!metroOn || a.paused) return;
    var ratio = parseFloat(d.bpm) / parseFloat(d.bpmSlow);
    var now = a.currentTime;
    var nb, due;                       // the next beat, and its time on the file now playing
    if(barClick){
      var scale = slowOn ? ratio : 1;  // slow-file seconds per fast-file second
      nb = barNextBeat(now / scale);
      due = nb < 0 ? null : barBeatTime(nb);
      if(due === null){ clickRaf = requestAnimationFrame(clickTick); return; }   // past the last downbeat
      due *= scale;
    } else {
      var beat = 60 / parseFloat(slowOn ? d.bpmSlow : d.bpm);
      var anchor = slowOn ? clickAnchor * ratio : clickAnchor;
      nb = Math.ceil((now - anchor) / beat - 1e-6);
      due = anchor + nb * beat;
    }
    if(nb < lastBeat) lastBeat = nb - 1;
    if(nb > lastBeat && nb >= 0){
      var ahead = due - now;
      if(ahead <= 0.1){
        var lat = 0.08 - (clickCtx.outputLatency || clickCtx.baseLatency || 0);
        clickAt(clickCtx.currentTime + Math.max(0, ahead + lat), nb % clickBeats === 0);
        lastBeat = nb;
      }
    }
    clickRaf = requestAnimationFrame(clickTick);
  };
  var startClicks = function(){
    if(!synthClick || !metroOn || a.paused || clickRaf) return;
    if(!clickCtx) clickCtx = new (window.AudioContext || window.webkitAudioContext)();
    if(clickCtx.resume) clickCtx.resume();
    lastBeat = -1;
    clickRaf = requestAnimationFrame(clickTick);
  };
  if(synthClick){
    a.addEventListener('play', startClicks);
    a.addEventListener('seeked', function(){ lastBeat = -1; });
  }

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

  if(box.dataset.audioMetronome || synthClick){
    var metroBtn = document.createElement('button');
    metroBtn.type = 'button';
    metroBtn.className = 'metronome-toggle';
    metroBtn.setAttribute('aria-pressed', 'false');
    metroBtn.innerHTML = '&#x1F3B5; <span data-i18n="tools.metronome"></span>';
    metroBtn.onclick = function(){
      metroOn = !metroOn;
      metroBtn.classList.toggle('on', metroOn);
      metroBtn.setAttribute('aria-pressed', metroOn ? 'true' : 'false');
      if(synthClick){ if(metroOn) startClicks(); return; }   // our click — no file to swap
      switchSrc(false);
    };
    box.appendChild(metroBtn);
  }

  if(fullReady){
    var gtrBtn = document.createElement('button');
    gtrBtn.type = 'button';
    gtrBtn.className = 'metronome-toggle on';
    gtrBtn.setAttribute('aria-pressed', 'true');
    gtrBtn.setAttribute('data-i18n-attr', 'title:ca.snipGuitarTitle');
    gtrBtn.innerHTML = '&#x1F3B8; <span data-i18n="ca.snipGuitarOn"></span>';
    gtrBtn.onclick = function(){
      guitarOn = !guitarOn;
      gtrBtn.classList.toggle('on', guitarOn);
      gtrBtn.setAttribute('aria-pressed', guitarOn ? 'true' : 'false');
      /* The label names who is playing, so it flips with the button. Swap
         the KEY, not just the text, so a later language switch re-renders
         the current state instead of the one the button was built with. */
      var lab = gtrBtn.querySelector('span');
      lab.setAttribute('data-i18n', guitarOn ? 'ca.snipGuitarOn' : 'ca.snipGuitarOff');
      lab.textContent = t(guitarOn ? 'ca.snipGuitarOn' : 'ca.snipGuitarOff');
      switchSrc(false);
    };
    box.appendChild(gtrBtn);
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
    } else if(box.dataset.video){
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
/* ── Whole-song tab, drawn from the Play Along card (2026-10-07) ──
   Jonathan: "add whole song tabs from the play along activity to the song
   journey pages for students who prefer that type of visual." Each
   whole-song practice card in class-activities.js (card.wholeSong, with
   `journey` + `journeyLayer`) gets an ASCII copy of its tab at the foot of
   that layer, folded under "The whole song tab", just above the ready row.

   Drawn at load from the card's own notes, never hand-typed: the card is
   the source and this is a different picture of it, so there is nothing to
   keep in step by hand (the hand-typed tabs on the page are a separate
   thing and may still differ from the card — CLAUDE.md, play-along first).
   Shown whatever the card's release date — like every other tab on the
   page, it is something to read, not the activity. Built before the
   language swap below, so its data-es attributes are swapped with the rest.

   Layout: one block per section, its caption on top (which already says
   "4 laps"), the notes once. A note's slot is 3 characters plus 3 per extra
   beat it rings, so a held note looks held; a bar line falls every
   beatsPerBar beats (bars x beatsPerBar = the section's beats, checks.mjs
   1bf); a row holds about 70 characters of bars, split evenly, unless the
   section names its own `rows`. The chord or note name sits over the fret
   at the start of every bar and wherever it changes. In a power chord the upper note is highlighted, like the
   page's own Layer 3 tabs. */
var WS_STRINGS = ['e', 'B', 'G', 'D', 'A', 'E'];
var WS_ROW_CHARS = 70;
function wsEsc(s){
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
/* One note → { label, frets: { string: fret }, hl: { string: true } } */
function wsNoteCells(n){
  var frets = {}, hl = {};
  if(n.frets && n.frets.length){
    var lowest = null;
    n.frets.forEach(function(f, i){
      frets[f[0]] = String(f[1]);
      var m = n.midi && n.midi[i];
      if(lowest === null || (m != null && m < lowest.m)) lowest = { s: f[0], m: m == null ? Infinity : m };
    });
    Object.keys(frets).forEach(function(s){ if(!lowest || s !== lowest.s) hl[s] = true; });
  } else if(n.string){
    frets[n.string] = String(n.fret);
  }
  return { label: n.note || '', frets: frets, hl: hl };
}
/* A section's notes → rows of { notes: [...] }, each row ending on a bar line. */
function wsSectionRows(sec){
  var notes = sec.notes || [];
  if(sec.rows && sec.rows.length){
    var out = [], at = 0;
    sec.rows.forEach(function(k){ out.push(notes.slice(at, at + k)); at += k; });
    if(at < notes.length) out.push(notes.slice(at));
    return out;
  }
  var total = notes.reduce(function(t, n){ return t + (n.beats > 0 ? n.beats : 1); }, 0);
  var bpb = total / Math.max(1, sec.bars || 1);
  var bars = [], cur = [], acc = 0;
  notes.forEach(function(n){
    cur.push(n); acc += n.beats > 0 ? n.beats : 1;
    if(acc >= bpb - 1e-6){ bars.push(cur); cur = []; acc = 0; }
  });
  if(cur.length) bars.push(cur);
  /* As many bars as fit in WS_ROW_CHARS, then spread evenly over the rows
     that takes, so a section never ends on one stray bar. */
  var widths = bars.map(function(b){
    return b.reduce(function(t, n){ return t + wsSlotWidth(n); }, 0) + 4;
  });
  var widest = Math.max.apply(null, widths.concat([1]));
  var fit = Math.max(1, Math.floor(WS_ROW_CHARS / widest));
  var per = Math.ceil(bars.length / Math.ceil(bars.length / fit));
  var rows = [];
  for(var i = 0; i < bars.length; i += per){
    rows.push([].concat.apply([], bars.slice(i, i + per)));
  }
  return rows;
}
function wsSlotWidth(n){
  var beats = n.beats > 0 ? n.beats : 1;
  return 3 + Math.max(0, Math.round((beats - 1) * 3));
}
/* One row of notes → the label line + six string lines, with a bar line
   every beatsPerBar beats (counted from the row's own first note, which
   always starts a bar). */
function wsRowText(notes, bpb){
  var label = '', lines = {};
  WS_STRINGS.forEach(function(s){ lines[s] = s + ' |'; });
  var col = 3, labelEnd = 0, prevLabel = null, acc = 0;
  notes.forEach(function(n){
    var c = wsNoteCells(n);
    var digits = 0;
    Object.keys(c.frets).forEach(function(s){ digits = Math.max(digits, c.frets[s].length); });
    var showLabel = c.label && (c.label !== prevLabel || acc === 0);
    var lead = 2;
    if(showLabel && col + lead < labelEnd + 1) lead = labelEnd + 1 - col;
    var slot = lead + digits + (wsSlotWidth(n) - 3);
    WS_STRINGS.forEach(function(s){
      var f = c.frets[s];
      var cell;
      if(f == null){ cell = new Array(slot + 1).join('-'); lines[s] += cell; }
      else {
        var pre = new Array(lead + digits - f.length + 1).join('-');
        var post = new Array(slot - lead - digits + 1).join('-');
        lines[s] += pre + (c.hl[s] ? '<span class="hl">' + f + '</span>' : f) + post;
      }
    });
    if(showLabel){
      var at = col + lead;
      label += new Array(Math.max(0, at - label.length) + 1).join(' ') + c.label;
      labelEnd = label.length;
      prevLabel = c.label;
    }
    col += slot;
    acc += n.beats > 0 ? n.beats : 1;
    if(acc >= bpb - 1e-6){
      WS_STRINGS.forEach(function(s){ lines[s] += '---|'; });
      col += 4; acc = 0;
    }
  });
  if(acc > 0) WS_STRINGS.forEach(function(s){ lines[s] += '---|'; });
  return [wsEsc(label).replace(/\s+$/, '')].concat(WS_STRINGS.map(function(s){ return lines[s]; })).join('\n');
}
function wsPreHtml(a){
  var c = a.card;
  var blocks = (c.sections || []).map(function(sec){
    var notes = sec.notes || [];
    var total = notes.reduce(function(t, n){ return t + (n.beats > 0 ? n.beats : 1); }, 0);
    var bpb = total / Math.max(1, sec.bars || 1);
    /* Both languages padded to the same length, so a heading that sits
       beside another one keeps its column when Español swaps the text in
       (the side-by-side padding is counted once, from the English). */
    var capEn = sec.caption || '', capEs = sec.caption_es || capEn;
    var capW = Math.max(capEn.length, capEs.length);
    function capPad(t){ return t + new Array(capW - t.length + 1).join(' '); }
    var head = '<span class="ws-sec" data-es="' + wsEsc(wsEsc(capPad(capEs))) + '">' + wsEsc(capPad(capEn)) + '</span>';
    /* A section's own rows pack side by side first (the two chorus laps of
       a song, each a few bars long, share a line when the width holds). */
    var rowObjs = wsSectionRows(sec).map(function(r){
      var lines = wsRowText(r, bpb).split('\n'), w = 0;
      lines.forEach(function(l){ w = Math.max(w, wsPlainLen(l)); });
      return { lines: lines, w: w };
    });
    var packed = [], cur = [], used = 0;
    rowObjs.forEach(function(r){
      if(cur.length && used + WS_GAP + r.w > WS_ROW_CHARS){ packed.push(cur); cur = []; used = 0; }
      used += (cur.length ? WS_GAP : 0) + r.w; cur.push(r);
    });
    if(cur.length) packed.push(cur);
    var rows = packed.map(function(g){ return wsJoinSideBySide(g); });
    return { head: head, rows: rows, one: rows.length === 1, end: !!sec.lineEnd };
  });
  /* Sections that each fit on one row sit side by side while the pair (or
     trio) still fits the row width — the intro and verse 1 of a riff song
     share a line, the way two bars of a chart would. A section that needs
     several rows keeps the full width to itself. A section marked lineEnd
     (the G – A parts of Seven Nation Army) closes its line, so the song
     reads Intro, Verse 1, G – A / Chorus 1, G – A / Verse 2, G – A … */
  var out = [], i = 0;
  while(i < blocks.length){
    var b = blocks[i];
    if(!b.one){ out.push(b.head + '\n' + b.rows.join('\n\n')); i++; continue; }
    var group = [wsBlockLines(b)], used = group[0].w;
    var j = i + 1;
    while(j < blocks.length && blocks[j].one && !blocks[j - 1].end){
      var nx = wsBlockLines(blocks[j]);
      if(used + WS_GAP + nx.w > WS_ROW_CHARS) break;
      group.push(nx); used += WS_GAP + nx.w; j++;
    }
    out.push(wsJoinSideBySide(group));
    i = j;
  }
  return out.join('\n\n\n');
}
var WS_GAP = 4;
function wsPlainLen(s){
  return s.replace(/<[^>]*>/g, '').replace(/&[a-z]+;/g, '.').length;
}
function wsBlockLines(b){
  var lines = [b.head].concat(b.rows[0].split('\n'));
  var w = 0;
  lines.forEach(function(l){ w = Math.max(w, wsPlainLen(l)); });
  return { lines: lines, w: w };
}
function wsJoinSideBySide(group){
  if(group.length === 1) return group[0].lines.join('\n');
  var n = 0;
  group.forEach(function(g){ n = Math.max(n, g.lines.length); });
  var res = [];
  for(var r = 0; r < n; r++){
    var line = '';
    group.forEach(function(g, k){
      var cell = g.lines[r] || '';
      if(k < group.length - 1){
        cell += new Array(g.w - wsPlainLen(cell) + WS_GAP + 1).join(' ');
      }
      line += cell;
    });
    res.push(line.replace(/\s+$/, ''));
  }
  return res.join('\n');
}
function wsTabHtml(a){
  var c = a.card;
  var icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;vertical-align:-0.15em"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>';
  return '<details class="fold ws-fold">' +
      '<summary data-es="El tab de la canción completa">The whole song tab</summary>' +
      '<div class="branch" data-es="Cada sección de la canción, en orden. Es el mismo tab de la tarjeta «Toca con la canción». «4 vueltas» quiere decir: toca esa línea 4 veces y luego pasa a la siguiente sección.">Every section of the song, in order. This is the same tab as the Play Along card. &ldquo;4 laps&rdquo; means: play that line 4 times, then go to the next section.</div>' +
      '<div class="tab">' +
        '<div class="tab-head"><span class="tab-icon">' + icon + '</span>' +
          '<span class="tab-title" data-es="' + wsEsc(wsEsc(c.caption_es || c.caption)) + '">' + wsEsc(c.caption) + '</span>' +
          '<span class="tab-kind">Tab</span></div>' +
        '<div class="tab-body"><pre class="tab-ascii">' + wsPreHtml(a) + '</pre></div>' +
      '</div>' +
    '</details>';
}
function addWholeSongTabs(){
  if(typeof SONG_ID === 'undefined') return;
  (window.CLASS_ACTIVITIES || []).forEach(function(a){
    if(a.journey !== SONG_ID || !a.journeyLayer || !a.card || !a.card.wholeSong) return;
    var body = document.getElementById('layer-' + a.journeyLayer + '-body');
    if(!body || body.querySelector('.ws-fold')) return;
    var ready = body.querySelector('.ready-row');
    var holder = document.createElement('div');
    holder.innerHTML = wsTabHtml(a);
    var fold = holder.firstChild;
    fold._wsActivity = a;
    fold.addEventListener('toggle', function(){ wsReflow(fold); });
    body.insertBefore(fold, ready || null);
  });
}
addWholeSongTabs();

/* Full width (Jonathan, 2026-10-07: "use the entire width of a chromebook
   screen"). An open whole-song tab leaves the page's 760px reading column
   and spans the window less a 24px margin each side, and its rows are
   re-drawn to as many bars as that width holds — about ten bars of "the
   cure" a row at 1366px, against four in the column. Measured, not set in
   CSS: the column's own left edge decides how far out the card has to
   move, and a monospace character's real width decides the bar count.
   Redone when the fold opens and when the window is resized; a closed
   fold is left alone. Printing puts it back in the column at the default
   row length (the beforeprint handler above opens every fold). */
var WS_ROW_DEFAULT = WS_ROW_CHARS;
var WS_SIDE_GAP = 24;
function wsSetPre(fold, rowChars){
  var pre = fold.querySelector('.tab-ascii');
  if(!pre || fold._wsRowChars === rowChars) return;
  fold._wsRowChars = rowChars;
  WS_ROW_CHARS = rowChars;
  pre.innerHTML = wsPreHtml(fold._wsActivity);
  WS_ROW_CHARS = WS_ROW_DEFAULT;
  if(getLang() === 'es'){
    pre.querySelectorAll('[data-es]').forEach(function(el){
      el.dataset.enHtml = el.innerHTML;
      el.innerHTML = el.dataset.es;
    });
  }
}
function wsReflow(fold){
  /* .layer clips its children to its rounded corners; an open wide tab
     needs out of that, so its layer drops the clip while it is open. */
  var layer = fold.closest('.layer');
  if(layer) layer.classList.toggle('ws-wide', !!fold.open);
  if(!fold.open || !fold._wsActivity) return;
  var tab = fold.querySelector('.tab');
  var pre = fold.querySelector('.tab-ascii');
  if(!tab || !pre) return;
  var col = fold.getBoundingClientRect();
  if(!(col.width > 0)) return;   // inside a closed layer: openLayer re-measures
  var vw = document.documentElement.clientWidth;
  var width = Math.max(col.width, vw - 2 * WS_SIDE_GAP);
  tab.style.width = width + 'px';
  tab.style.maxWidth = 'none';
  tab.style.marginLeft = Math.min(0, WS_SIDE_GAP - col.left) + 'px';
  var probe = document.createElement('span');
  probe.textContent = '----------';
  pre.appendChild(probe);
  var charW = probe.getBoundingClientRect().width / 10;
  pre.removeChild(probe);
  var cs = getComputedStyle(pre);
  var inner = pre.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  if(!(charW > 0) || !(inner > 0)) return;
  /* 3 characters of string name and first bar line, 1 to spare */
  wsSetPre(fold, Math.max(WS_ROW_DEFAULT, Math.floor(inner / charW) - 4));
}
function wsReflowAll(){
  document.querySelectorAll('.ws-fold').forEach(wsReflow);
}
var wsResizeTimer = null;
window.addEventListener('resize', function(){
  clearTimeout(wsResizeTimer);
  wsResizeTimer = setTimeout(wsReflowAll, 150);
});
window.addEventListener('beforeprint', function(){
  document.querySelectorAll('.ws-fold').forEach(function(fold){
    var tab = fold.querySelector('.tab');
    if(tab){ tab.style.width = ''; tab.style.maxWidth = ''; tab.style.marginLeft = ''; }
    wsSetPre(fold, WS_ROW_DEFAULT);
  });
});
window.addEventListener('afterprint', wsReflowAll);

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
  if(!userInteracted && !hashLayerId()){
    var target = firstUnreadyLayer();
    if(target) openLayer(target, false);
  }
}

/* Save-status line — takes an I18N key (or '' to clear) and tags the element
   with data-i18n so a language switch re-translates whatever is showing. */
function setSaveMsg(key){
  var el = document.getElementById('save-msg');
  if(!el) return;   // the gate card can replace the page body while a save is in flight
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
  var payload = { songReady: {}, songReadyAt: {} };
  payload.songReady[SONG_ID] = currentReady();
  /* Per-song "last touched" stamp (ms). The main app's resume card sorts on
     it to say which song the student was working on most recently; legacy
     docs without it fall back to first-unfinished order over there. */
  payload.songReadyAt[SONG_ID] = Date.now();
  fbDb.collection('progress').doc(fbUser.uid).set(payload, { merge: true })
    .then(function(){ setSaveMsg('journey.saved'); setTimeout(function(){ setSaveMsg(''); }, 2000); })
    .catch(function(){ dirty = true; setSaveMsg('journey.saveFailed'); });
}

/* ── Activity gate (Today-first work order, Phase 1) ──
   A bookmarked Journey page sits behind the same gate as the main site — see
   caIsVisible/caBlockers in app.js, which this deliberately does NOT share:
   app.js's own `activityDates`/`hiddenActivityIds`/`activityClears` globals
   are populated only by loadClassConfig(), the main app's boot path, which
   this page never runs. class-activities.js (a plain data array, no
   dependencies of its own) is loaded on these six pages just for this check.
   If the visibility/blocker rule ever changes, change it in both places. */
function journeyDayStr(d){
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}
function journeyIsVisible(a, cfg){
  // Archived or deleted from the console — out of the course entirely, so it
  // can never gate a Journey page. Mirrors retiredActivityIds in app.js.
  if(((cfg && cfg.archivedActivities) || {})[a.id] === true) return false;
  if(((cfg && cfg.deletedActivities) || {})[a.id] === true) return false;
  /* Not placed on the console's activity board = not in the course, so it
     cannot gate anything either. Mirrors the assigned check in caIsVisible()
     (app.js), and it MATTERS here more than anywhere: un-assigning a card
     deliberately keeps its release date, so without this a dated card pulled
     back to Built would stop blocking the main site while still blanking all
     six Journey pages — a lock with nothing left on In-Class Activities to clear it.
     Keyed off activityBoardSeeded, never off the board being empty, for the
     reason activityBoardOn in app.js spells out. */
  if(cfg && cfg.activityBoardSeeded === true && !((cfg.activityBoard || {})[a.id])) return false;
  if(((cfg && cfg.hiddenActivities) || {})[a.id] === true) return false;
  var d = ((cfg && cfg.activityDates) || {})[a.id];
  return d ? d <= journeyDayStr(new Date()) : false;
}
/* True when activity b sits LATER on the console board than activity a
   (a higher module, or the same module and a higher pos) — the same order
   caBoardOrder() in app.js reads. An unseeded board, or either card
   unplaced, reads as "not later": never lock on a guess. */
function journeyBoardAfter(b, a, cfg){
  if(!cfg || cfg.activityBoardSeeded !== true) return false;
  var board = cfg.activityBoard || {};
  var pb = board[b.id], pa = board[a.id];
  if(!pb || !pa) return false;
  var mb = Number(pb.module) || 0, ma = Number(pa.module) || 0;
  if(mb !== ma) return mb > ma;
  return (Number(pb.pos) || 0) > (Number(pa.pos) || 0);
}
/* The activity gate no longer locks Journey pages (Jonathan, 2026-10-07).
   Kept as a switch, like CA_GATE_LOCKS in app.js — true restores it. */
var JOURNEY_GATE_LOCKS = false;
function journeyBlockers(cfg, classActivities, uid, ownPeriod){
  var clears = ((cfg && cfg.activityClears) || {})[uid] || {};
  // CAS students: every activity is optional, so nothing blocks — mirrors
  // caStudentIsCAS() in app.js. Effective period = override || own answer.
  if((((cfg && cfg.periodOverrides) || {})[uid] || ownPeriod || '') === 'CAS') return [];
  // Optional activities (console switch) never block — mirrors caBlockers.
  var optional = (cfg && cfg.optionalActivities) || {};
  return (window.CLASS_ACTIVITIES || []).filter(function(a){
    return journeyIsVisible(a, cfg) && optional[a.id] !== true && (classActivities || {})[a.id] !== true && clears[a.id] !== true;
  });
}
/* Replaces the whole page — header, layers, tools dock, everything — with
   one card pointing back to In-Class Activities. A gated Journey page has nothing else to
   offer, so this is deliberately total rather than an overlay: nothing
   underneath should still be interactive (or precious CPU/battery running)
   while the student is supposed to be on the main site instead. */
function showJourneyGate(){
  document.body.innerHTML = '';
  var card = document.createElement('div');
  card.className = 'ca-gate-card';
  var h = document.createElement('h1');
  h.className = 'ca-gate-title';
  h.setAttribute('data-i18n', 'journey.gatedTitle');
  h.textContent = t('journey.gatedTitle');
  var p = document.createElement('p');
  p.className = 'ca-gate-body';
  p.setAttribute('data-i18n', 'journey.gatedBody');
  p.textContent = t('journey.gatedBody');
  var btn = document.createElement('a');
  btn.className = 'ca-gate-btn';
  btn.href = journeyFrom() ? journeyReturnHref() : '../index.html#class-activities';
  btn.setAttribute('data-i18n', 'journey.gatedBtn');
  btn.textContent = t('journey.gatedBtn');
  card.appendChild(h); card.appendChild(p); card.appendChild(btn);
  document.body.appendChild(card);
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
    if(!user){
      authSettled = true; pendingSave = false; setSaveMsg('journey.signin');
      if(typeof lqStopListening === 'function') lqStopListening();
      return;
    }
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
      /* Live quiz (../live-quiz.js): a student parked on a Journey page while
         the class starts a game would otherwise miss the whole thing in
         silence. This page can't show a question, so all it gets is the
         "a game is running" banner, which takes them to the page that can —
         see lqCanPlayHere() over there. Started from here rather than from
         live-quiz.js's own auth hook because this page's Firebase boot (and
         its Firestore SDK load) is journey.js's, and by this line both have
         actually landed. */
      if(typeof lqStartListening === 'function') lqStartListening();
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
      // Activity gate — skipped for the teacher's own account, same as
      // everywhere else it applies. class-activities.js is a second script
      // tag on this page (see index.html gate work order); CLASS_ACTIVITIES
      // is undefined only if that tag is ever removed, which journeyBlockers
      // treats as "nothing to block on" ([] default).
      if(typeof TEACHER_EMAIL !== 'undefined' && user.email === TEACHER_EMAIL) return;
      // Switched off 2026-10-07 — mirrors CA_GATE_LOCKS in app.js.
      if(!JOURNEY_GATE_LOCKS) return;
      var classActivities = (data && data.classActivities) || {};
      return fbDb.collection('config').doc('class').get().then(function(cfgDoc){
        var cfg = cfgDoc && cfgDoc.exists ? cfgDoc.data() : {};
        var blockers = journeyBlockers(cfg, classActivities, user.uid, data && data.period);
        // The one exemption: a pending activity that NAMES this page
        // (`journey: '<slug>'` in class-activities.js) is sending the
        // student here as part of the work — gating it would block the
        // very step they're on. Any other page stays gated.
        var sentHere = blockers.some(function(a){ return a.journey === SONG_ID; }) ||
          // A practice card's Level up (view:'card') points at this page only
          // AFTER the card is marked complete — pcCheck() in app.js completes
          // it as soon as the required checks are ticked, before the student
          // has clicked Level up. So a completed card naming this song stays
          // exempt too, or an unrelated pending activity elsewhere locks the
          // very page the student was just sent to for their extra practice.
          // Only while that card is still the newest thing on the board,
          // though: once a LATER activity is what blocks, the student is past
          // the card and this page gates like the other five (2026-09-28 —
          // the first cut had no end, so finishing ca-18 once opened "the
          // cure" for good).
          (window.CLASS_ACTIVITIES || []).some(function(a){
            return a.view === 'card' && a.journey === SONG_ID &&
              journeyIsVisible(a, cfg) && classActivities[a.id] === true &&
              !blockers.some(function(b){ return journeyBoardAfter(b, a, cfg); });
          });
        if(blockers.length && !sentHere) showJourneyGate();
      }).catch(function(){
        /* Never lock on a guess: a failed config read leaves the page open,
           same fail-open rule as everywhere else the gate applies to an
           unreadable doc. */
      });
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
