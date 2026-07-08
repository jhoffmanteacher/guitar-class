/* ════════════════════════════════════════════════════════════════════
   Guitar Class — Backing-Track Looper (resource panel)

   Phase 1 (see LOOPER_SPEC.md): YouTube IFrame Player API, A/B loop with
   ±1s nudge, loop toggle, jump-to-A, 0.5x/0.75x/1x speed.
   Phase 2: student-saved loops, persisted to the same Firestore progress
   doc as skills/responses (loopsData / saveLoops() in app.js).
   Phase 3: teacher-authored preset pills (song card's `loops:` field, passed
   in as `presets`) plus a teacher-only "Copy preset line" helper — reuses
   the TEACHER_EMAIL identity check (not IS_TEACHER_MODE, which routes to
   the separate dashboard and never shows this panel).

   Split out of app.js for maintainability. Loads AFTER app.js (which owns
   loadPanel/clearPanel/loopsData/saveLoops/currentUser and calls into
   initLooper/teardownLooper here).
   ════════════════════════════════════════════════════════════════════ */

const LOOPER_MAX_SAVED = 5;

function getSavedLoops(videoId){
  return (typeof loopsData!=='undefined' && loopsData[videoId]) || [];
}
function setSavedLoops(videoId, list){
  if(typeof loopsData==='undefined') return;
  if(list.length) loopsData[videoId] = list;
  else delete loopsData[videoId];
  if(typeof saveLoops==='function') saveLoops();
}

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

function initLooper(wrapEl, videoId, presets){
  teardownLooper();
  presets = Array.isArray(presets) ? presets : [];
  wrapEl.className = 'rp-iframe-wrap rp-looper';
  const presetsRowHtml = presets.length ? `
      <div class="rp-looper-row rp-looper-presets" data-el="presets-row">
        <button type="button" class="rp-looper-preset-btn" data-preset="full">Full track</button>
        ${presets.map((p,i)=>`<button type="button" class="rp-looper-preset-btn" data-preset="${i}">${escHtml(p.label)}</button>`).join('')}
      </div>` : '';
  wrapEl.innerHTML = `
    <div class="rp-looper-player-wrap"><div class="rp-looper-yt-target"></div></div>
    <div class="rp-looper-controls">
      ${presetsRowHtml}
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
      <div class="rp-looper-row rp-looper-saved" data-el="saved-row"></div>
      <div class="rp-looper-row rp-looper-teacher" data-el="teacher-row"></div>
    </div>`;

  const state = { player:null, ready:false, pollId:null, wrapEl, videoId, a:0, b:0, loop:false, savedUi:'idle', pendingEntry:null, teacherUi:'idle' };
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
  wrapEl.querySelectorAll('.rp-looper-preset-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      if(!state.ready) return;
      if(btn.dataset.preset==='full'){ setLoopEnabled(false); return; }
      const preset = presets[Number(btn.dataset.preset)];
      if(!preset) return;
      state.a = preset.a; state.b = preset.b;
      refreshTimes();
      setLoopEnabled(true);
      state.player.seekTo(state.a, true);
    });
  });

  function currentSpeedRate(){
    const on = wrapEl.querySelector('.rp-looper-speed-btn.on');
    return on ? Number(on.dataset.rate) : 1;
  }
  function applySpeed(rate){
    if(!state.ready) return;
    state.player.setPlaybackRate(rate);
    wrapEl.querySelectorAll('.rp-looper-speed-btn').forEach(b=>b.classList.toggle('on', Number(b.dataset.rate)===rate));
  }

  function renderSavedRow(){
    const row = wrapEl.querySelector('[data-el="saved-row"]');
    if(!row) return;
    const loops = getSavedLoops(videoId);
    const pillsHtml = loops.map((loop, i)=>`
      <span class="rp-looper-saved-pill">
        <button type="button" class="rp-looper-saved-load" data-idx="${i}" title="Load: ${escHtml(loop.n)} (${fmtTime(loop.a)}–${fmtTime(loop.b)})">${escHtml(loop.n)}</button>
        <button type="button" class="rp-looper-saved-del" data-idx="${i}" aria-label="Delete saved loop ${escHtml(loop.n)}">&times;</button>
      </span>`).join('');

    let trailingHtml = '';
    if(typeof isDevBypassUser==='function' && isDevBypassUser()){
      /* No Firestore write is possible for the dev-user — hide the save
         affordance rather than let it fail silently (see CLAUDE.md). */
    } else if(state.savedUi==='naming'){
      trailingHtml = `
        <input type="text" class="rp-looper-save-name" maxlength="24" placeholder="Name this loop">
        <button type="button" class="rp-looper-btn" data-act="confirm-save">Save</button>
        <button type="button" class="rp-looper-btn" data-act="cancel-save">Cancel</button>`;
    } else if(state.savedUi==='confirmReplace'){
      const oldest = loops[0];
      trailingHtml = `
        <span class="rp-looper-saved-note">${LOOPER_MAX_SAVED} saved already — replace oldest ("${escHtml(oldest ? oldest.n : '')}")?</span>
        <button type="button" class="rp-looper-btn" data-act="confirm-replace">Replace</button>
        <button type="button" class="rp-looper-btn" data-act="cancel-save">Cancel</button>`;
    } else {
      trailingHtml = `<button type="button" class="rp-looper-btn rp-looper-save" data-act="save-loop">&#x1F4BE; Save this loop</button>`;
    }

    row.innerHTML = pillsHtml + trailingHtml;
    wireSavedRow();
  }

  function commitSavedLoop(rawName){
    const name = (rawName||'').trim().slice(0,24) || 'Loop';
    const entry = { n:name, a:state.a, b:state.b, r:currentSpeedRate() };
    const list = getSavedLoops(videoId);
    if(list.length >= LOOPER_MAX_SAVED){
      state.pendingEntry = entry;
      state.savedUi = 'confirmReplace';
      renderSavedRow();
      return;
    }
    setSavedLoops(videoId, [...list, entry]);
    state.savedUi = 'idle';
    renderSavedRow();
  }

  function wireSavedRow(){
    const row = wrapEl.querySelector('[data-el="saved-row"]');
    if(!row) return;
    row.querySelectorAll('.rp-looper-saved-load').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const loop = getSavedLoops(videoId)[Number(btn.dataset.idx)];
        if(!loop || !state.ready) return;
        state.a = loop.a; state.b = loop.b;
        refreshTimes();
        setLoopEnabled(true);
        state.player.seekTo(state.a, true);
        if(loop.r) applySpeed(loop.r);
      });
    });
    row.querySelectorAll('.rp-looper-saved-del').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const list = getSavedLoops(videoId).slice();
        list.splice(Number(btn.dataset.idx), 1);
        setSavedLoops(videoId, list);
        renderSavedRow();
      });
    });
    const saveBtn = row.querySelector('[data-act="save-loop"]');
    if(saveBtn) saveBtn.addEventListener('click', ()=>{
      if(!state.ready) return;
      state.savedUi = 'naming';
      renderSavedRow();
      const input = row.querySelector('.rp-looper-save-name');
      if(input) input.focus();
    });
    const cancelBtn = row.querySelector('[data-act="cancel-save"]');
    if(cancelBtn) cancelBtn.addEventListener('click', ()=>{
      state.pendingEntry = null;
      state.savedUi = 'idle';
      renderSavedRow();
    });
    const confirmSaveBtn = row.querySelector('[data-act="confirm-save"]');
    if(confirmSaveBtn) confirmSaveBtn.addEventListener('click', ()=>{
      const input = row.querySelector('.rp-looper-save-name');
      commitSavedLoop(input ? input.value : '');
    });
    const nameInput = row.querySelector('.rp-looper-save-name');
    if(nameInput) nameInput.addEventListener('keydown', e=>{
      if(e.key==='Enter') commitSavedLoop(nameInput.value);
      else if(e.key==='Escape'){ state.savedUi='idle'; renderSavedRow(); }
    });
    const confirmReplaceBtn = row.querySelector('[data-act="confirm-replace"]');
    if(confirmReplaceBtn) confirmReplaceBtn.addEventListener('click', ()=>{
      const list = getSavedLoops(videoId).slice();
      list.shift();
      if(state.pendingEntry) list.push(state.pendingEntry);
      setSavedLoops(videoId, list);
      state.pendingEntry = null;
      state.savedUi = 'idle';
      renderSavedRow();
    });
  }
  renderSavedRow();

  function isTeacherAccount(){
    return !!(typeof currentUser!=='undefined' && currentUser
      && typeof TEACHER_EMAIL!=='undefined' && currentUser.email===TEACHER_EMAIL);
  }
  function buildPresetSnippet(label){
    const safe = String(label||'Loop').replace(/\\/g,'\\\\').replace(/'/g,"\\'");
    return `{ label: '${safe}', a: ${Math.round(state.a)}, b: ${Math.round(state.b)} }`;
  }
  function renderTeacherRow(){
    const row = wrapEl.querySelector('[data-el="teacher-row"]');
    if(!row) return;
    if(!isTeacherAccount()){ row.innerHTML=''; return; }
    if(state.teacherUi==='naming'){
      row.innerHTML = `
        <input type="text" class="rp-looper-save-name" maxlength="40" placeholder="Preset label (e.g. Solo section)">
        <button type="button" class="rp-looper-btn" data-act="confirm-copy">Copy</button>
        <button type="button" class="rp-looper-btn" data-act="cancel-copy">Cancel</button>`;
    } else if(state.teacherUi==='copied'){
      row.innerHTML = `<span class="rp-looper-saved-note">Copied — paste into the song's loops: array.</span>`;
    } else {
      row.innerHTML = `<button type="button" class="rp-looper-btn" data-act="copy-preset">&#x1F4CB; Copy preset line</button>`;
    }
    wireTeacherRow();
  }
  function wireTeacherRow(){
    const row = wrapEl.querySelector('[data-el="teacher-row"]');
    if(!row) return;
    const copyBtn = row.querySelector('[data-act="copy-preset"]');
    if(copyBtn) copyBtn.addEventListener('click', ()=>{
      if(!state.ready) return;
      state.teacherUi = 'naming';
      renderTeacherRow();
      const input = row.querySelector('.rp-looper-save-name');
      if(input) input.focus();
    });
    const cancelBtn = row.querySelector('[data-act="cancel-copy"]');
    if(cancelBtn) cancelBtn.addEventListener('click', ()=>{
      state.teacherUi = 'idle';
      renderTeacherRow();
    });
    const confirmBtn = row.querySelector('[data-act="confirm-copy"]');
    if(confirmBtn) confirmBtn.addEventListener('click', ()=>{
      const input = row.querySelector('.rp-looper-save-name');
      const snippet = buildPresetSnippet(input ? input.value : '');
      const done = ()=>{
        if(_looperState!==state) return;
        state.teacherUi='copied'; renderTeacherRow();
        setTimeout(()=>{ if(_looperState===state){ state.teacherUi='idle'; renderTeacherRow(); } }, 2000);
      };
      if(navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(snippet).then(done).catch(done);
      else done();
    });
    const nameInput = row.querySelector('.rp-looper-save-name');
    if(nameInput) nameInput.addEventListener('keydown', e=>{
      if(e.key==='Enter'){ if(confirmBtn) confirmBtn.click(); }
      else if(e.key==='Escape'){ state.teacherUi='idle'; renderTeacherRow(); }
    });
  }
  renderTeacherRow();

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
