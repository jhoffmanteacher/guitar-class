/* ════════════════════════════════════════════════════════════════════
   Guitar Class — Backing-Track Looper (resource panel)

   Phase 1 (see LOOPER_SPEC.md): YouTube IFrame Player API, A/B loop with
   ±1s nudge, loop toggle, jump-to-A, 0.5x/0.75x/1x speed. No presets, no
   saved loops — those are Phase 2/3.

   Split out of app.js for maintainability. Loads AFTER app.js (which owns
   loadPanel/clearPanel and calls into initLooper/teardownLooper here).
   ════════════════════════════════════════════════════════════════════ */

let _ytApiPromise = null;
let _looperState = null; // { player, ready, pollId, wrapEl, videoId, a, b, loop }

function loadYouTubeIframeApi(){
  if(_ytApiPromise) return _ytApiPromise;
  const promise = new Promise((resolve, reject)=>{
    if(window.YT && window.YT.Player){ resolve(window.YT); return; }
    const timeoutId = setTimeout(()=>reject(new Error('YouTube IFrame API timed out')), 8000);
    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function(){
      clearTimeout(timeoutId);
      if(typeof prevReady==='function') prevReady();
      resolve(window.YT);
    };
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.onerror = ()=>{ clearTimeout(timeoutId); reject(new Error('YouTube IFrame API failed to load')); };
    document.head.appendChild(script);
  });
  // Only cache a successful load. A rejection (offline blip, transient block)
  // must not be remembered forever — the next looper open should retry.
  promise.catch(()=>{ if(_ytApiPromise === promise) _ytApiPromise = null; });
  _ytApiPromise = promise;
  return promise;
}

function teardownLooper(){
  if(!_looperState) return;
  if(_looperState.pollId) clearInterval(_looperState.pollId);
  if(_looperState.player && typeof _looperState.player.destroy==='function'){
    try{ _looperState.player.destroy(); } catch(e){ /* player already torn down */ }
  }
  _looperState = null;
}

function fmtTime(sec){
  sec = Math.max(0, Math.floor(sec||0));
  const m = Math.floor(sec/60), s = sec%60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

function renderLooperFallback(wrapEl, videoId, note){
  wrapEl.className = 'rp-iframe-wrap rp-youtube';
  wrapEl.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1" allowfullscreen allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>` +
    (note ? `<div class="rp-looper-note">${note}</div>` : '');
}

function initLooper(wrapEl, videoId){
  teardownLooper();
  wrapEl.className = 'rp-iframe-wrap rp-looper';
  wrapEl.innerHTML = `
    <div class="rp-looper-player-wrap"><div class="rp-looper-yt-target"></div></div>
    <div class="rp-looper-controls">
      <div class="rp-looper-row rp-looper-ab">
        <button type="button" class="rp-looper-btn" data-act="set-a">Set A</button>
        <span class="rp-looper-time" data-el="a-time">A 0:00</span>
        <button type="button" class="rp-looper-nudge" data-act="a-minus" aria-label="A minus one second">&minus;1s</button>
        <button type="button" class="rp-looper-nudge" data-act="a-plus" aria-label="A plus one second">+1s</button>
        <span class="rp-looper-sep"></span>
        <button type="button" class="rp-looper-btn" data-act="set-b">Set B</button>
        <span class="rp-looper-time" data-el="b-time">B 0:00</span>
        <button type="button" class="rp-looper-nudge" data-act="b-minus" aria-label="B minus one second">&minus;1s</button>
        <button type="button" class="rp-looper-nudge" data-act="b-plus" aria-label="B plus one second">+1s</button>
      </div>
      <div class="rp-looper-row rp-looper-transport">
        <button type="button" class="rp-looper-btn rp-looper-loop" data-act="loop-toggle" aria-pressed="false">Loop &#x27F3; off</button>
        <button type="button" class="rp-looper-btn" data-act="jump-a">&#x23EE; Jump to A</button>
      </div>
      <div class="rp-looper-row rp-looper-speed">
        <span class="rp-looper-speed-label">Speed:</span>
        <button type="button" class="rp-looper-speed-btn" data-rate="0.5">0.5&times;</button>
        <button type="button" class="rp-looper-speed-btn" data-rate="0.75">0.75&times;</button>
        <button type="button" class="rp-looper-speed-btn on" data-rate="1">1&times;</button>
      </div>
    </div>`;

  const state = { player:null, ready:false, pollId:null, wrapEl, videoId, a:0, b:0, loop:false };
  _looperState = state;

  const aTimeEl = wrapEl.querySelector('[data-el="a-time"]');
  const bTimeEl = wrapEl.querySelector('[data-el="b-time"]');
  const loopBtn = wrapEl.querySelector('[data-act="loop-toggle"]');

  function refreshTimes(){
    aTimeEl.textContent = `A ${fmtTime(state.a)}`;
    bTimeEl.textContent = `B ${fmtTime(state.b)}`;
  }
  function flashBadB(){
    bTimeEl.classList.add('rp-looper-flash');
    setTimeout(()=>{ if(bTimeEl.isConnected) bTimeEl.classList.remove('rp-looper-flash'); }, 500);
  }
  function setLoopEnabled(on){
    if(on && state.b <= state.a){ flashBadB(); return; }
    state.loop = on;
    loopBtn.classList.toggle('on', on);
    loopBtn.setAttribute('aria-pressed', String(on));
    loopBtn.innerHTML = on ? 'Loop &#x27F3; on' : 'Loop &#x27F3; off';
  }

  wrapEl.querySelector('[data-act="set-a"]').addEventListener('click', ()=>{
    if(!state.ready) return;
    state.a = state.player.getCurrentTime(); refreshTimes();
  });
  wrapEl.querySelector('[data-act="set-b"]').addEventListener('click', ()=>{
    if(!state.ready) return;
    state.b = state.player.getCurrentTime(); refreshTimes();
  });
  wrapEl.querySelector('[data-act="a-minus"]').addEventListener('click', ()=>{ state.a = Math.max(0, state.a-1); refreshTimes(); });
  wrapEl.querySelector('[data-act="a-plus"]').addEventListener('click', ()=>{ state.a = state.a+1; refreshTimes(); });
  wrapEl.querySelector('[data-act="b-minus"]').addEventListener('click', ()=>{ state.b = Math.max(0, state.b-1); refreshTimes(); });
  wrapEl.querySelector('[data-act="b-plus"]').addEventListener('click', ()=>{ state.b = state.b+1; refreshTimes(); });
  loopBtn.addEventListener('click', ()=> setLoopEnabled(!state.loop));
  wrapEl.querySelector('[data-act="jump-a"]').addEventListener('click', ()=>{
    if(!state.ready) return;
    state.player.seekTo(state.a, true);
  });
  wrapEl.querySelectorAll('.rp-looper-speed-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(!state.ready) return;
      state.player.setPlaybackRate(Number(btn.dataset.rate));
      wrapEl.querySelectorAll('.rp-looper-speed-btn').forEach(b=>b.classList.toggle('on', b===btn));
    });
  });

  loadYouTubeIframeApi().then(YT=>{
    if(_looperState !== state) return; // panel moved on while the API was loading
    const target = wrapEl.querySelector('.rp-looper-yt-target');
    if(!target) return;
    state.player = new YT.Player(target, {
      videoId,
      playerVars: { rel: 0, modestbranding: 1, playsinline: 1 },
      events: {
        onReady(){
          if(_looperState !== state) return;
          state.ready = true;
          state.pollId = setInterval(()=>{
            if(!state.loop || !state.player) return;
            if(state.player.getCurrentTime() >= state.b) state.player.seekTo(state.a, true);
          }, 200);
        },
        onError(){
          if(_looperState === state) teardownLooper();
          renderLooperFallback(wrapEl, videoId, "This video can't be played in the looper — showing the plain video instead.");
        }
      }
    });
  }).catch(()=>{
    if(_looperState === state) _looperState = null;
    renderLooperFallback(wrapEl, videoId, 'Looper unavailable right now — showing the plain video instead.');
  });
}
