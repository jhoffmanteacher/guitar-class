/* ══════════════════════════════════════════════════════════════════════
   trainer-site-adapter.js — "Hear It First": the ONE trainer file that touches
   site globals. Everything else (trainer-core / -audio / -ui) is handed what
   it needs and could be lifted out whole.

   Hidden from students. This script is loaded by index.html for every page
   load, and does nothing at all unless the address carries  ?hif=1  (the
   direct link, any signed-in account). No hub card, no rail button.

     .../index.html?hif=1               the trainer, after sign-in
     .../index.html?hif=1&hifdebug=1    also exposes window.__hif for tests

   What it borrows from the site, and how:
     sound         playNote(midi, gain, when, true) from app.js — the site's own
                   pluck, forced to its Karplus-Strong voice (no audio files)
     microphone    coach.js, unchanged: coachAcquireMic, coachReadFrame,
                   coachSettlePitch, coachPitchReadings, coachIdleTick,
                   coachMicOff. Its settle code reports an integer note, so the
                   cents are read from the readings it leaves behind.
     input picker  a getUserMedia wrapper (deviceId) in force only while
                   coachAcquireMic() runs; coach.js is not edited
     storage       progress/{uid}.trainer, written with mergeFields so nothing
                   else in that document is touched (no rules change), and a
                   uid-scoped localStorage copy
     tuner         the rail's tuner popup; the overlay steps aside and a pill
                   brings it back
   ══════════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function param(name) {
    var m = new RegExp('[?&#]' + name + '=([^&#]*)').exec(window.location.href || '');
    return m ? decodeURIComponent(m[1]) : null;
  }
  if (param('hif') !== '1') return;
  if (typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE) return;

  var trainer = null, rootEl = null, pill = null, pitch = null, stopWatch = null;

  /* ── Wait for a signed-in, painted app ── */
  function signedIn() {
    try { return typeof currentUser !== 'undefined' && !!currentUser && typeof appIsOnScreen === 'function' && appIsOnScreen(); }
    catch (e) { return false; }
  }
  var waited = 0, poll = setInterval(function () {
    waited += 300;
    if (signedIn()) { clearInterval(poll); launch(); }
    else if (waited > 15 * 60 * 1000) clearInterval(poll);
  }, 300);

  function uid() { return currentUser && currentUser.uid ? currentUser.uid : 'anon'; }

  /* ── Storage ── */
  function makeStore() {
    var key = 'hif:v1:' + uid();
    function localGet() { try { var s = localStorage.getItem(key); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
    function localSet(p) { try { localStorage.setItem(key, JSON.stringify(p)); } catch (e) { /* storage blocked */ } }
    function cloudOk() { return typeof isDevBypassUser === 'function' && !isDevBypassUser() && typeof ensureDb === 'function'; }
    function newer(a, b) {
      if (!a) return b; if (!b) return a;
      return (b.sessions || 0) > (a.sessions || 0) || ((b.sessions || 0) === (a.sessions || 0) && String(b.lastSession || '') > String(a.lastSession || '')) ? b : a;
    }
    return {
      load: function () {
        var local = localGet();
        if (!cloudOk()) return Promise.resolve(local);
        return ensureDb().then(function (db) {
          return db.collection('progress').doc(uid()).get();
        }).then(function (doc) {
          var cloud = doc && doc.exists ? (doc.data() || {}).trainer || null : null;
          var pick = newer(local, cloud);
          if (pick && pick !== local) localSet(pick);
          return pick;
        }).catch(function () { return local; });
      },
      save: function (profile) {
        localSet(profile);
        if (!cloudOk()) return Promise.resolve();
        return ensureDb().then(function (db) {
          /* mergeFields replaces the one field and leaves the rest of the
             student document alone; set() also creates it if it is missing. */
          return db.collection('progress').doc(uid()).set({ trainer: profile }, { mergeFields: ['trainer'] });
        });
      }
    };
  }

  /* ── The microphone: coach.js, called and never changed ── */
  function makePitch() {
    var levelCbs = [], lostCbs = [], opened = false, raf = 0, listen = null;
    var live = { lastT: 0, lastCall: 0, midi: null, at: 0 };

    function newSt(deafMs) {
      return { readings: [], attackT: 0, lastPitchT: 0, needSilence: true, armAt: performance.now() + (deafMs || 0), gaveUnclear: false };
    }
    function failReason() {
      if (/^(NotAllowedError|SecurityError|PermissionDeniedError)$/.test(coachMicFailName)) return 'denied';
      return coachMicFailName === 'setup' ? 'failed' : 'unavailable';
    }
    /* The input picker: ask for one device while coach.js opens the stream. */
    function patchGum(id) {
      if (!id) return function () {};
      var md = navigator.mediaDevices, orig = md.getUserMedia, own = Object.prototype.hasOwnProperty.call(md, 'getUserMedia');
      md.getUserMedia = function (c) {
        if (c && c.audio) {
          var a = typeof c.audio === 'object' ? Object.assign({}, c.audio) : {};
          a.deviceId = { exact: id };
          c = Object.assign({}, c, { audio: a });
        }
        return orig.call(md, c);
      };
      return function () { if (own) md.getUserMedia = orig; else delete md.getUserMedia; };
    }
    function settled(st) {
      return HIF_CORE.readPitch(tunerMedian(st.readings.slice(-4)));
    }
    function finish(v) {
      var l = listen; if (!l) return;
      listen = null;
      if (l.resolve) l.resolve(v);
    }
    function deliver(note, now) {
      var l = listen; if (!l) return;
      if (l.mode === 'once') { finish(note); return; }
      l.st.readings = []; l.st.attackT = 0; l.st.needSilence = true; l.st.armAt = now + 120; l.st.gaveUnclear = false;
      l.cb(note);
    }
    function step(rms, now) {
      var l = listen, st = l.st;
      if (l.timeoutAt && now > l.timeoutAt) { finish({ timeout: true }); return; }
      if (st.needSilence && (rms < COACH_PITCH_GATE * 0.7 || now > st.armAt + 1800)) st.needSilence = false;
      if (!st.needSilence && now >= st.armAt && rms > COACH_PITCH_GATE) {
        if (!st.attackT) st.attackT = Math.max(coachOnsetAt, st.armAt);
        var m = coachSettlePitch(st, null, rms, st.armAt);
        if (m != null) { deliver(settled(st), now); return; }
        if (st.attackT && now - st.attackT > 1600 && !st.gaveUnclear) { st.gaveUnclear = true; deliver({ unclear: true }, now); if (listen) { listen.st.gaveUnclear = true; } }
      } else {
        if (rms < COACH_PITCH_GATE * 0.5) { st.readings = []; st.attackT = 0; st.gaveUnclear = false; }
        coachIdleTick(st, rms, st.armAt);
      }
    }
    function liveNote(rms, now) {
      if (rms > COACH_PITCH_GATE * 1.5 && now - live.lastCall > 70) {
        live.lastCall = now;
        var rs = coachPitchReadings(live.lastT, now - 400);
        if (rs.length) { var r = rs[rs.length - 1]; live.lastT = r.t; if (r.midi != null) { live.midi = r.midi; live.at = now; } }
      }
      return live.midi != null && now - live.at < 350 && rms > COACH_PITCH_GATE ? { midi: live.midi, rms: rms } : null;
    }
    function lost() {
      if (!opened) return;
      opened = false; finish({ cancelled: true });
      lostCbs.slice().forEach(function (cb) { try { cb(); } catch (e) { /* ui gone */ } });
    }
    function frame() {
      raf = 0;
      if (!opened) return;
      if (typeof coachAnalyser === 'undefined' || !coachAnalyser || !coachCtx) { lost(); return; }
      var rms = coachReadFrame(), now = performance.now();
      if (listen) step(rms, now);
      var ln = liveNote(rms, now);
      levelCbs.slice().forEach(function (cb) { try { cb(rms, ln); } catch (e) { /* ui gone */ } });
      if (opened) raf = requestAnimationFrame(frame);
    }

    return {
      devices: function () {
        if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return Promise.resolve([]);
        return navigator.mediaDevices.enumerateDevices().then(function (all) {
          return all.filter(function (d) { return d.kind === 'audioinput'; }).map(function (d) { return { id: d.deviceId, label: d.label }; });
        }).catch(function () { return []; });
      },
      open: function (o) {
        o = o || {};
        return ensureCoachJs().then(async function () {
          if (typeof gamesStopMic === 'function') gamesStopMic(true);
          if (typeof coachClose === 'function') coachClose();
          if (typeof coachEvictTuner === 'function') coachEvictTuner();
          if (coachStream) coachMicOff();
          opened = false;
          var restore = patchGum(o.deviceId || ''), ok;
          try { ok = await coachAcquireMic(); } finally { restore(); }
          if (!ok && o.deviceId && /Overconstrained|NotFound/.test(coachMicFailName)) ok = await coachAcquireMic();
          if (!ok) return { ok: false, reason: failReason() };
          await coachEnsureRunning();
          if (typeof stopAllDemoAudio === 'function') stopAllDemoAudio();
          window.coachMicLive = true; opened = true;
          if (!raf) raf = requestAnimationFrame(frame);
          var tr = coachStream && coachStream.getAudioTracks()[0];
          return { ok: true, label: tr ? tr.label : '' };
        }).catch(function () { return { ok: false, reason: 'failed' }; });
      },
      close: function () {
        opened = false; finish({ cancelled: true });
        if (raf) { cancelAnimationFrame(raf); raf = 0; }
        if (typeof coachMicOff === 'function' && window.coachMicLive) coachMicOff();
      },
      cancel: function () { finish({ cancelled: true }); },
      deaf: function (ms) { if (listen) listen.st = newSt(ms); },
      onLevel: function (cb) { levelCbs.push(cb); return function () { var i = levelCbs.indexOf(cb); if (i >= 0) levelCbs.splice(i, 1); }; },
      onLost: function (cb) { lostCbs.push(cb); return function () { var i = lostCbs.indexOf(cb); if (i >= 0) lostCbs.splice(i, 1); }; },
      listenForPitch: function (o) {
        o = o || {};
        return new Promise(function (resolve) {
          if (!opened) { resolve({ unclear: true }); return; }
          finish({ cancelled: true });
          var deaf = o.deafMs || 0;
          listen = { mode: 'once', st: newSt(deaf), resolve: resolve, timeoutAt: performance.now() + deaf + (o.timeoutMs || 25000) };
        });
      },
      listenStream: function (cb, o) {
        o = o || {};
        finish({ cancelled: true });
        var l = listen = { mode: 'stream', st: newSt(o.deafMs || 0), cb: cb, resolve: null, timeoutAt: 0 };
        return function () { if (listen === l) listen = null; };
      }
    };
  }

  /* ── Launch ── */
  function launch() {
    if (trainer) return;
    var need = ['trainer-core.js', 'trainer-audio.js', 'trainer-ui.js'];
    Promise.all(need.map(function (s) { return loadScriptOnce(s); }).concat([ensureCoachJs()])).then(function () {
      if (!window.HIF_CORE || !window.HIF_AUDIO || !window.HIF_UI) throw new Error('trainer files missing');
      rootEl = document.createElement('div');
      rootEl.id = 'hif-root';
      document.body.appendChild(rootEl);
      pitch = makePitch();
      var audio = HIF_AUDIO.createAudio({
        playNote: function (m, g, w, so) { return playNote(m, g, w, so); },
        now: function () { return getAudioCtx().currentTime; },
        killRinging: function () { try { killRingingPlucks(); } catch (e) { /* not loaded */ } }
      });
      var debug = {};
      trainer = HIF_UI.createTrainer({
        root: rootEl, core: HIF_CORE, audio: audio, pitch: pitch, store: makeStore(),
        fretboardSvg: trainerFretboardSvg, debug: debug,
        onExit: exit, onOpenTuner: openTuner
      });
      if (param('hifdebug') === '1') window.__hif = { trainer: trainer, pitch: pitch, debug: debug, audio: audio };
      /* A sign-out ends the trainer; so does leaving the page. */
      try {
        /* Not in the dev bypass: there Firebase reports no user from the start. */
        var real = !(typeof isDevBypassUser === 'function' && isDevBypassUser());
        if (real && typeof auth !== 'undefined' && auth && auth.onAuthStateChanged) stopWatch = auth.onAuthStateChanged(function (u) { if (!u) exit(); });
      } catch (e) { /* auth not available (dev bypass) */ }
      window.addEventListener('pagehide', function () { if (pitch) pitch.close(); });
      return trainer.start();
    }).catch(function (e) {
      if (window.console) console.warn('Hear It First could not start:', e && e.message);
    });
  }

  function exit() {
    if (!trainer) return;
    try { trainer.destroy(); } catch (e) { /* already gone */ }
    trainer = null;
    if (stopWatch) { try { stopWatch(); } catch (e) { /* gone */ } stopWatch = null; }
    if (rootEl && rootEl.parentNode) rootEl.parentNode.removeChild(rootEl);
    if (pill && pill.parentNode) pill.parentNode.removeChild(pill);
    rootEl = null; pill = null;
    try { delete window.__hif; } catch (e) { /* gone */ }
  }

  /* The site tuner lives in the rail, under the overlay: step aside, bring it back with a pill. */
  function openTuner() {
    if (!rootEl) return;
    rootEl.style.display = 'none';
    if (!pill) {
      pill = document.createElement('button');
      pill.type = 'button';
      pill.textContent = '← Back to Hear It First';
      pill.setAttribute('style', 'position:fixed;left:16px;bottom:16px;z-index:140;padding:10px 16px;border-radius:999px;border:1px solid var(--border2);background:var(--brand);color:var(--brand-text);font:600 15px system-ui,sans-serif;cursor:pointer;box-shadow:var(--shadow-raised)');
      pill.addEventListener('click', backFromTuner);
      document.body.appendChild(pill);
    }
    pill.style.display = '';
    /* One tick later: the click that got us here is still bubbling, and the site's
       click-away handler would close the tuner in the same breath it opened. */
    setTimeout(function () { if (typeof togglePopup === 'function') togglePopup('tuner'); }, 60);
  }
  function backFromTuner() {
    if (typeof closePopup === 'function') closePopup('tuner');
    if (pill) pill.style.display = 'none';
    if (rootEl) rootEl.style.display = '';
    if (trainer) trainer.resumeInput();
  }
})();
