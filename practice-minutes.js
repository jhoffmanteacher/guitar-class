/* ══════════════════════════════════════════════════════════════════════
   PRACTICE MINUTES — the engine.   (2026-11-01)   Settings: practice-minutes-config.js

   WHAT IT COUNTS. Seconds of real BACKING-TRACK playback, anywhere on the
   site: a class-activity practice or snippet card, a Song Journey play-along
   (tabs/*.html), the Songs-page library (which opens a practice card or a
   Journey page), a local backing track in the resource viewer. NOT the
   metronome, the ear trainer, the games, guitar-note strums, the student's
   own recording played back, or a YouTube video — only an <audio> element
   whose file is audio/…-backing-… counts (isBacking()).

   A second of wall-clock time counts only while ALL of these hold:
     · a backing-track element is playing — not paused, not ended, not muted
       (the Guitar toggle's twin plays muted beside the audible one), has
       data buffered, and its currentTime is moving (a stalled download is
       not practice);
     · the tab is visible (Page Visibility API);
     · a student is signed in (never the ?teacher console).
   Two elements playing at once (a lap's "spare", the Guitar twin) are still
   one second. Nothing here starts, loops or changes playback: the engine only
   watches. When a song ends the element is ended/paused, so counting stops
   until the student presses Play again. (A Journey page's player loops by
   itself, as it always has; it counts while it plays, and the daily cap
   bounds a loop left running.)

   HOW IT FINDS THE ELEMENTS. Practice and snippet cards play from detached
   `new Audio()` elements, which fire no event a document listener can see, so
   HTMLMediaElement.prototype.play is wrapped (it returns the original's
   result untouched and only notes the element). Elements in the page (the
   Journey player, the resource viewer) are also caught by a capture-phase
   `playing` listener. Both feed one Set; the 1 s tick does the counting.

   WHAT IT STORES (Firestore; firestore.rules has the matching blocks).
     minutes/{uid}/days/{YYYY-MM-DD}  { seconds }                 (capped per day)
     minutes/{uid}/weeks/{YYYY-Www}   { seconds, goalSeconds, hit }
     heartbeats/{sessionId}           { period, lastSeen }        (see below)
   Seconds are kept whole; the display floors to whole minutes. They are added
   with increment(), so two tabs or two devices never overwrite each other.

   THE PENDING-WRITE QUEUE. Counted seconds go into pend[date] in memory and into
   this PAGE's own localStorage key (pm:q:<uid>:<pageId>) every few seconds, on
   hide and on unload. flush() sends them every 60 s while counting, when playback
   stops, when the tab hides, on `online`, about once a minute while idle with
   something left, and a page takes over the key of a page that is gone (stamp more
   than 3 minutes away from now, either way) as soon as the student is known; a
   page that signs the same student back in folds its own key in (sync).
   A flush is one batch. Its seconds move from `pend` to `inflight` when it is sent
   and leave only when the SDK answers — there is NO timeout: the SDK keeps a commit
   it cannot deliver and delivers it when the connection returns, so sending the same
   seconds again after "giving up" counts them once per attempt (measured: a 5-minute
   stall stored the daily cap for 5 minutes of play). Offline (navigator.onLine
   false) nothing is sent and nothing is lost. A load never overlaps a flush. On
   pagehide (Chrome then fires visibilitychange; it starts nothing new) a
   fetch({keepalive:true}) to the Firestore REST endpoint sends what is left in
   `pend` — even with a commit in flight — and the leaving key drops a commit sent
   under 30 s before (INFLIGHT_TRUST_MS: it almost certainly landed; losing it is
   the better mistake than counting it twice), with the ID token cached for THIS student (navigator.sendBeacon cannot carry
   the sign-in header, so it cannot write to a rules-protected collection).
   A flush the rules refuse is NOT thrown away: it first re-reads the server's
   day totals (including any older day the queue holds) and trims the queue to the
   cap; if nothing is left to trim, the refusal is something else (the rules not
   published yet, say), so the seconds stay queued and are retried every 5 minutes,
   and reads back off the same way.
   Known limits: the week doc's `hit` and `goalSeconds` are a best-effort snapshot
   for later (the app recomputes from `seconds`); a device that has never seen a
   week's doc sends hit with its first write, which can overwrite a true another
   device just wrote. Two pages of one student on a frozen tab (over 3 minutes
   with no stamp refresh) can be adopted while still alive.

   LIVE COUNT. While counting, a heartbeat { period, lastSeen } is written
   every 30 s to heartbeats/<random per-browser-session id> — never the uid, no
   other field (Firestore cannot make a collection readable "as a count only",
   so the docs carry nothing worth reading). The strip counts the docs of the
   student's period with lastSeen in the last 60 s. Needs a composite index
   (firestore.indexes.json). Switched off with uiOn.

   EVERYTHING A STUDENT SEES is behind PRACTICE_MINUTES_CONFIG.uiOn and lives
   in the second half of this file (strip, recap, toast, My progress). The first
   half has no DOM beyond the media listeners.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── Config, with a default for any key that is missing ── */
  var DEFAULTS = {
    uiOn: false, weeklyGoalMinutes: 30, dailyCapMinutes: 20,
    skipWeeks: [], semester2Start: '', streakStartWeek: '',
    liveMinCount: 3, recapMinSeconds: 60, recapGapSeconds: 180, recapShowSeconds: 6, toastSeconds: 3
  };
  function cfg(){
    var c = (typeof PRACTICE_MINUTES_CONFIG !== 'undefined' && PRACTICE_MINUTES_CONFIG) || {};
    var o = {};
    for(var k in DEFAULTS) o[k] = (c[k] === undefined || c[k] === null) ? DEFAULTS[k] : c[k];
    return o;
  }

  /* ════════════════════════════════════════════════════════════════════
     CALENDAR MATHS — pure functions of (config, data). No DOM, no clock.
     Dates are local 'YYYY-MM-DD'; weeks are ISO ('2026-W47'), Monday first.
     ════════════════════════════════════════════════════════════════════ */
  var calc = {};
  function pad(n){ return (n < 10 ? '0' : '') + n; }
  calc.ymd = function(d){ return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  calc.parse = function(s){ var p = String(s).split('-'); return new Date(+p[0], +p[1] - 1, +p[2], 12, 0, 0); };   // noon: DST never moves the date
  calc.addDays = function(d, n){ var r = new Date(d.getTime()); r.setDate(r.getDate() + n); return r; };
  calc.weekIdOf = function(dateStr){
    var d = calc.parse(dateStr);
    var thu = calc.addDays(d, 3 - ((d.getDay() + 6) % 7));
    var jan1 = new Date(thu.getFullYear(), 0, 1, 12, 0, 0);
    var doy = Math.round((thu.getTime() - jan1.getTime()) / 86400000);
    return thu.getFullYear() + '-W' + pad(Math.floor(doy / 7) + 1);
  };
  calc.weekMonday = function(weekId){
    var m = /^(\d{4})-W(\d{2})$/.exec(weekId);
    var jan4 = new Date(+m[1], 0, 4, 12, 0, 0);
    var mon1 = calc.addDays(jan4, -((jan4.getDay() + 6) % 7));
    return calc.addDays(mon1, (+m[2] - 1) * 7);
  };
  calc.weekAdd = function(weekId, n){ return calc.weekIdOf(calc.ymd(calc.addDays(calc.weekMonday(weekId), 7 * n))); };
  /* skipWeeks: Monday dates ('YYYY-MM-DD'); a date that is not a Monday still skips the week it falls in. */
  calc.skipSet = function(c){
    var set = {};
    (c.skipWeeks || []).forEach(function(d){ if(/^\d{4}-\d{2}-\d{2}$/.test(d)) set[calc.weekIdOf(d)] = true; });
    return set;
  };
  /* The goal is flat: weeklyGoalMinutes, in whole seconds, in every counted week for every
     student, whichever days they practise. 0 = a skipped week (no goal: it neither counts
     nor breaks a streak). */
  calc.goalSeconds = function(c, weekId){
    return calc.skipSet(c)[weekId] ? 0 : Math.max(60, Math.round(c.weeklyGoalMinutes) * 60);
  };
  /* The free miss is per semester: semester 2 starts on semester2Start (a week belongs to
     semester 2 when its Monday is on or after that date). With no date, there is one. */
  calc.semesterOf = function(c, weekId){
    return (c.semester2Start && calc.ymd(calc.weekMonday(weekId)) >= c.semester2Start) ? 1 : 0;
  };
  /* The whole picture for one student. weekSecs = { 'YYYY-Www': seconds }.
     Walks the weeks in order, once. A skipped week is passed over (its minutes still
     count in the totals). A hit adds to the streak. The first miss in each semester
     while a streak is going is forgiven (the streak is kept, not extended); any
     later miss resets it. A miss before any streak uses nothing up. The week in
     progress can add to the streak but never breaks it. */
  calc.status = function(c, weekSecs, today){
    var cur = calc.weekIdOf(today), normalGoal = Math.round(c.weeklyGoalMinutes * 60);
    var first = null;
    Object.keys(weekSecs).forEach(function(w){ if((weekSecs[w] || 0) > 0 && (first === null || w < first)) first = w; });
    if(c.streakStartWeek && (first === null || c.streakStartWeek > first)) first = c.streakStartWeek;
    var streak = 0, longest = 0, used = {};
    if(first !== null && first <= cur){
      var w = first;
      for(var i = 0; i < 160 && w < cur; i++, w = calc.weekAdd(w, 1)){
        var g = calc.goalSeconds(c, w);
        if(g <= 0) continue;
        if((weekSecs[w] || 0) >= g){ streak++; if(streak > longest) longest = streak; }
        else {
          var sem = calc.semesterOf(c, w);
          if(streak > 0 && !used[sem]) used[sem] = true; else streak = 0;   // nothing to forgive before a streak has started
        }
      }
    }
    var streakBefore = streak;
    var curGoal = calc.goalSeconds(c, cur), curSecs = weekSecs[cur] || 0;
    var isBreak = curGoal <= 0, hit = !isBreak && curSecs >= curGoal;
    /* A week before streakStartWeek never counts toward a streak, this one included
       (it can still be a hit: the ring and the "week goal hit" message are about the goal). */
    if(hit && !(c.streakStartWeek && cur < c.streakStartWeek)){ streak++; if(streak > longest) longest = streak; }
    var history = [];
    for(var k = 7; k >= 0; k--){
      var id = calc.weekAdd(cur, -k), secs = weekSecs[id] || 0, goal = calc.goalSeconds(c, id), state;
      if(id === cur) state = 'now';
      else if(goal <= 0) state = 'break';
      else if(secs >= goal) state = 'hit';
      else state = (first !== null && id >= first) ? 'missed' : 'none';
      history.push({ id: id, secs: secs, goal: goal, state: state, hit: id === cur ? hit : state === 'hit' });
    }
    return {
      week: { id: cur, secs: curSecs, goal: isBreak ? normalGoal : curGoal, isBreak: isBreak, hit: hit },
      streak: streak, streakBefore: streakBefore, longest: longest, history: history
    };
  };

  /* ════════════════════════════════════════════════════════════════════
     STATE
     ════════════════════════════════════════════════════════════════════ */
  var HEARTBEAT_MS = 30000, FLUSH_MS = 60000, PERSIST_MS = 5000, DENIED_BACKOFF_MS = 300000, LOAD_RETRY_MS = 30000;
  var STALE_QUEUE_MS = 180000, QUEUE_FRESH_MS = 10000, ADOPT_MS = 30000;
  /* A commit sent less than this long before the page closed has almost
     certainly landed: the page's leaving key drops it rather than risk sending
     it twice (Jonathan, 2026-11-01: losing under a minute is the better mistake).
     An older one that never answered almost certainly did not land, so it stays
     queued — that keeps a stalled offline backlog. */
  var INFLIGHT_TRUST_MS = 30000;
  var host = null;
  var S = null;                       // per-student state, rebuilt when the uid changes
  var media = new Set();              // backing-track elements seen playing
  var timer = 0, lastTick = 0, idleSec = 0, session = null;
  var lastBeat = 0, lastFlush = 0, lastPersist = 0, lastAdopt = 0, deniedUntil = 0, queueTimer = 0;
  var sid = '';                       // random id for this browser session (heartbeats)
  var pid = '';                       // random id for this page (its own queue key)
  var leavingPage = false;            // pagehide ran; cleared if the page comes back (back/forward cache)
  var leftInflight = {};              // uid -> seconds a signed-out state still has on the wire (see sync)

  function freshState(uid){
    return { uid: uid, days: {}, weeks: {}, pend: {}, inflight: null, flushP: null, frac: 0, loaded: false, loading: null, flushing: false,
             loadRetryAt: 0, live: 0, liveAt: 0, toastWeek: '', pendingToast: false, lastRecapAt: 0 };
  }
  function ls(k, v){
    try {
      if(v === undefined) return localStorage.getItem(k);
      if(v === null) localStorage.removeItem(k); else localStorage.setItem(k, v);
    } catch(e) {}
    return null;
  }
  function lsJson(k){ try { return JSON.parse(ls(k) || 'null'); } catch(e) { return null; } }
  function now(){ return (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now(); }
  function today(){ return calc.ymd(new Date()); }
  function randHex(n){
    var a = new Uint8Array(n), c = (typeof window !== 'undefined') && (window.crypto || window.msCrypto);
    if(c && c.getRandomValues) c.getRandomValues(a); else for(var i = 0; i < n; i++) a[i] = Math.floor(Math.random() * 256);
    return Array.prototype.map.call(a, function(b){ return (b < 16 ? '0' : '') + b.toString(16); }).join('');
  }

  function getHost(){ return host || (typeof window !== 'undefined' && window.PM_HOST) || null; }
  function hostUser(){ var h = getHost(); return h && h.user ? h.user() : null; }
  function uid(){ var u = hostUser(); return u ? u.uid : null; }
  function period(){
    var h = getHost(), p = h && h.period ? h.period() : '', u = uid();
    if(p){ if(u) ls('pm:p:' + u, p); return p; }
    return u ? (ls('pm:p:' + u) || '') : '';
  }
  function dbP(){ var h = getHost(); return h && h.db ? Promise.resolve(h.db()) : Promise.reject(new Error('no db')); }
  function FV(){ return firebase.firestore.FieldValue; }

  /* ── The pending-write queue: ONE localStorage key PER PAGE ──
     pm:q:<uid>:<pageId> = { days: { date: seconds }, at: ms }. A single shared
     key let two tabs of one student adopt (and send) each other's unconfirmed
     seconds, and overwrite each other's. Now a page writes only its own key and
     refreshes `at` while it holds anything; it takes over another page's key only
     when that stamp is older than STALE_QUEUE_MS (a closed tab, a crash), or 0
     (written by pagehide: "I am leaving"). What a page holds = pend (not yet
     sent) + inflight (sent, not yet acknowledged). */
  function pageId(){ if(!pid) pid = randHex(6); return pid; }
  function qKey(u){ return 'pm:q:' + u + ':' + pageId(); }
  function queued(d){ return (S.pend[d] || 0) + ((S.inflight && S.inflight.snap[d]) || 0); }
  function heldDays(leaving){
    var m = {};
    Object.keys(S.pend).forEach(function(d){ if(S.pend[d] > 0) m[d] = (m[d] || 0) + S.pend[d]; });
    var inf = S.inflight && !(leaving && Date.now() - S.inflight.at < INFLIGHT_TRUST_MS) ? S.inflight : null;
    if(inf) Object.keys(inf.snap).forEach(function(d){ m[d] = (m[d] || 0) + inf.snap[d]; });
    return m;
  }
  /* `leaving` (pagehide, and the visibilitychange Chrome fires right after it):
     leave out a commit that is probably delivered (INFLIGHT_TRUST_MS). The stamp
     stays Date.now(): in Chrome the visibilitychange after pagehide always
     rewrote a 0 stamp anyway, and an at-once adoptable key re-sent seconds a
     back/forward-cached page still held (2026-11-01 review). Another page takes
     the key over once it is STALE_QUEUE_MS old. */
  function persist(leaving){
    if(!S) return;
    lastPersist = now();
    var held = heldDays(leaving), any = Object.keys(held).length > 0;
    ls(qKey(S.uid), any ? JSON.stringify({ days: held, at: Date.now() }) : null);
    if(any) keepQueueFresh(); else if(queueTimer){ clearInterval(queueTimer); queueTimer = 0; }
  }
  /* A page that is idle but still holds seconds (offline, a stalled commit) has no
     tick running; this keeps its stamp fresh so nobody adopts it while it is alive. */
  function keepQueueFresh(){
    if(queueTimer || typeof setInterval === 'undefined') return;
    var beats = 0;
    queueTimer = setInterval(function(){
      persist();
      /* A page that is idle but still holds seconds (a connection that came back, a
         commit that finally answered) sends them about once a minute. */
      if(S && ++beats % 6 === 0 && !session && !S.flushing && !S.loading && takePending()) flush();
    }, QUEUE_FRESH_MS);
  }
  function adopt(){
    var st = S, took = false;
    if(!st) return;
    var prefix = 'pm:q:' + st.uid + ':', mine = qKey(st.uid), keys = [];
    try { for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if(k && k.indexOf(prefix) === 0 && k !== mine) keys.push(k); } } catch(e) { return; }
    keys.forEach(function(k){
      var v = lsJson(k);
      if(v && v.days && typeof v.at === 'number' && v.at > 0 && Math.abs(Date.now() - v.at) < STALE_QUEUE_MS) return;   // a live page's (a stamp from the future — the clock moved back — is live too)
      if(v && v.days) Object.keys(v.days).forEach(function(d){ if(v.days[d] > 0){ st.pend[d] = (st.pend[d] || 0) + v.days[d]; took = true; } });
      ls(k, null);
    });
    if(took){ trimToCap(); persist(); if(!st.loaded) load(); else flush(); }
  }

  /* Rebuild S when the signed-in student changes (sign-out, shared Chromebook). */
  function sync(){
    var u = uid();
    if(!S || S.uid !== u){
      if(S && S.uid){
        persist();
        /* Its commit may still land after the switch: remember it, so a sign-in
           back to the same student on this page does not queue it again. */
        if(S.inflight) leftInflight[S.uid] = S.inflight.snap;
      }
      S = u ? freshState(u) : null;
      if(S){
        /* This page's own key for this student (signed out and back in on an open
           Journey page): adopt() never takes a page's own key, so fold it in here,
           less anything an earlier state still has on the wire. */
        var own = lsJson(qKey(u)), wire = leftInflight[u] || {};
        if(own && own.days) Object.keys(own.days).forEach(function(d){
          var n = (own.days[d] || 0) - (wire[d] || 0);
          if(n > 0) S.pend[d] = (S.pend[d] || 0) + n;
        });
        var c = lsJson('pm:c:' + u);
        if(c){ S.days = c.days || {}; S.weeks = c.weeks || {}; }
        S.toastWeek = ls('pm:t:' + u) || '';
        S.lastRecapAt = 0;
        idToken = ''; idTokenUid = '';
        refreshToken();
        var st = S;
        // Anything a closed page left goes out now (a later tick would do, but a student who only opens a card never plays).
        setTimeout(function(){ if(S === st){ adopt(); if(!st.loaded && Object.keys(heldDays()).length) load(); } }, 0);
      }
      session = null; idleSec = 0;
    }
    return S;
  }
  function cacheServer(){ if(S) ls('pm:c:' + S.uid, JSON.stringify({ days: S.days, weeks: S.weeks })); }

  /* ── Totals: what the server holds plus what is still queued ── */
  function dayTotal(d){ return (S.days[d] || 0) + queued(d); }
  function weekTotals(){
    var m = {}, held = heldDays();
    Object.keys(S.weeks).forEach(function(w){ m[w] = S.weeks[w].seconds || 0; });
    Object.keys(held).forEach(function(d){ var w = calc.weekIdOf(d); m[w] = (m[w] || 0) + held[d]; });
    return m;
  }
  function status(){ return calc.status(cfg(), weekTotals(), today()); }
  function allTimeSeconds(){
    var t = 0, m = weekTotals();
    Object.keys(m).forEach(function(w){ t += m[w]; });
    return t;
  }

  /* ════════════════════════════════════════════════════════════════════
     FINDING THE PLAYING ELEMENTS
     ════════════════════════════════════════════════════════════════════ */
  function isBacking(el){
    var s = '';
    try { s = el.currentSrc || el.src || ''; } catch(e) {}
    return /\/audio\/[^\/?#]*-backing-[^\/?#]*\.(mp3|m4a|wav|ogg)/i.test(s);
  }
  function note(el){
    if(!el) return;
    if(!el.__pmL && el.addEventListener){
      /* Playback resumed from the OS media controls or a media key runs no
         play() call and, for a detached element, no document-level event; the
         element's own `playing` still fires. */
      el.__pmL = true;
      el.addEventListener('playing', function(){ note(el); });
    }
    if(!media.has(el)) media.add(el);
    ensureTimer();
  }
  if(typeof HTMLMediaElement !== 'undefined' && !HTMLMediaElement.prototype.__pmWrapped){
    var origPlay = HTMLMediaElement.prototype.play;
    HTMLMediaElement.prototype.play = function(){
      try { note(this); } catch(e) {}
      return origPlay.apply(this, arguments);
    };
    HTMLMediaElement.prototype.__pmWrapped = true;
  }
  if(typeof document !== 'undefined'){
    document.addEventListener('playing', function(e){ if(e.target && e.target.tagName === 'AUDIO') note(e.target); }, true);
    document.addEventListener('visibilitychange', function(){
      /* Chrome fires this right AFTER pagehide when a page closes: keep the
         leaving key pagehide wrote, and start no commit the dying page cannot finish. */
      if(document.visibilityState === 'hidden'){ if(leavingPage) persist(true); else { persist(); flush(); } }
      else tick();
    });
  }
  function audible(el){
    if(!isBacking(el)) return false;
    if(el.paused || el.ended || el.error || el.muted || el.volume < 0.001 || el.readyState < 3) return false;
    var moved = el.__pmT === undefined || el.currentTime !== el.__pmT;
    el.__pmT = el.currentTime;
    return moved;
  }

  /* ════════════════════════════════════════════════════════════════════
     THE TICK — once a second while anything backing-track-ish may be playing
     ════════════════════════════════════════════════════════════════════ */
  function ensureTimer(){
    if(timer || typeof setInterval === 'undefined') return;
    lastTick = now();
    timer = setInterval(tick, 1000);
  }
  function stopTimer(){ if(timer){ clearInterval(timer); timer = 0; } }

  function tick(){
    var t = now(), dt = Math.min(Math.max((t - lastTick) / 1000, 0), 2);
    lastTick = t;
    var st = sync();
    var anyAudible = false;
    media.forEach(function(el){
      if(audible(el)) anyAudible = true;
      else if(el.paused || el.ended || el.error){ media.delete(el); el.__pmT = undefined; }
    });
    var visible = typeof document === 'undefined' || document.visibilityState !== 'hidden';
    if(st && anyAudible && visible){
      idleSec = 0;
      if(!session){ session = { counted: 0, startedAt: Date.now() }; refreshToken(); }   // the unload write needs a token under an hour old
      if(!st.loaded && !st.loading) load();
      if(t - lastBeat >= HEARTBEAT_MS) beat(t);
      addSeconds(dt);
      if(t - lastFlush >= FLUSH_MS) flush();
    } else {
      idleSec += dt;
      /* A practice card's section button pauses the song for a 3-5 s count-in;
         while its player is still live (pcState, app.js), that is not the end of
         a session — Stop clears pcState and ends it 2 s later as before. */
      var cardLive = typeof pcState !== 'undefined' && !!pcState;
      if(session && idleSec >= 2 && !(cardLive && idleSec < 30)) endSession();
    }
    if(t - lastPersist >= PERSIST_MS) persist();
    if(st && t - lastAdopt >= ADOPT_MS){ lastAdopt = t; adopt(); }
    uiTick();
    if(!media.size && !session && idleSec >= 2) stopTimer();
  }

  function addSeconds(dt){
    var st = S, c = cfg();
    st.frac += dt;
    var whole = Math.floor(st.frac);
    if(whole < 1) return;
    st.frac -= whole;
    var d = today(), cap = Math.round(c.dailyCapMinutes * 60);
    var n = Math.min(whole, Math.max(0, cap - dayTotal(d)));
    if(n <= 0) return;
    var w = calc.weekIdOf(d);
    var before = weekTotals()[w] || 0, goal = calc.goalSeconds(c, w);
    st.pend[d] = (st.pend[d] || 0) + n;
    session.counted += n;
    if(goal > 0 && before < goal && before + n >= goal) goalCrossed(w);
  }

  function endSession(){
    var s = session;
    session = null; idleSec = 0;
    if(!S) return;
    persist();
    flush();
    if(s) recapMaybe(s);
  }

  /* ════════════════════════════════════════════════════════════════════
     FIRESTORE — load, flush, heartbeat

     One rule keeps the numbers honest: READING and WRITING never overlap. flush()
     does nothing while load() runs; load() first waits for a commit that is
     still in flight. Without that a read could already contain a batch that is
     then added to the local totals a second time.
     ════════════════════════════════════════════════════════════════════ */
  function load(noFlush){
    var st = S;
    if(!st) return Promise.resolve();
    if(st.loading) return st.loading;
    if(Date.now() < st.loadRetryAt) return Promise.resolve();
    st.loading = (st.flushing && st.flushP ? st.flushP.then(function(){}, function(){}) : Promise.resolve()).then(function(){
      /* This week's days, and any OLDER day the queue still holds (a day left from
         an earlier week must be read too, or the cap cannot be checked for it). */
      var from = calc.ymd(calc.weekMonday(calc.weekIdOf(today()))), held = heldDays();
      Object.keys(held).forEach(function(d){ if(d < from) from = d; });
      return dbP().then(function(db){
        var base = db.collection('minutes').doc(st.uid);
        return Promise.all([
          base.collection('weeks').get(),
          base.collection('days').where(firebase.firestore.FieldPath.documentId(), '>=', from).get()
        ]);
      });
    }).then(function(r){
      if(S !== st) return;
      var weeks = {}, days = {};
      r[0].forEach(function(doc){ var v = doc.data() || {}; weeks[doc.id] = { seconds: +v.seconds || 0, goalSeconds: +v.goalSeconds || 0, hit: v.hit === true }; });
      r[1].forEach(function(doc){ days[doc.id] = +(doc.data() || {}).seconds || 0; });
      st.weeks = weeks; st.days = days; st.loaded = true; st.loadRetryAt = 0;
      cacheServer();
      trimToCap();
      st.loading = null;
      if(!noFlush) flush();
      uiNow();
    }).catch(function(err){
      /* Offline, or the rules not published yet: the cache and the queue carry on.
         Try again later, not on every tick. */
      if(S === st) st.loadRetryAt = Date.now() + (err && err.code === 'permission-denied' ? DENIED_BACKOFF_MS : LOAD_RETRY_MS);
    }).then(function(){ if(S === st) st.loading = null; });
    return st.loading;
  }

  /* Cut the queue so server + held never passes the cap on any day. */
  function trimToCap(){
    var cap = Math.round(cfg().dailyCapMinutes * 60), changed = false;
    Object.keys(S.pend).forEach(function(d){
      var room = Math.max(0, cap - (S.days[d] || 0) - ((S.inflight && S.inflight.snap[d]) || 0));
      if(S.pend[d] > room){ S.pend[d] = room; changed = true; }
      if(S.pend[d] <= 0){ delete S.pend[d]; changed = true; }
    });
    if(changed) persist();
    return changed;
  }

  /* The writes for a set of queued seconds — shared by the SDK batch and the
     keepalive REST call so the two cannot drift. `hit` is sent only when it is
     true, or when this device has never seen the week's doc (a create needs it):
     a device with a stale copy must not flip another device's true back to false. */
  function buildOps(snap){
    var c = cfg(), ops = [], byWeek = {};
    Object.keys(snap).forEach(function(d){
      if(!(snap[d] > 0)) return;
      ops.push({ kind: 'day', id: d, inc: snap[d] });
      var w = calc.weekIdOf(d);
      byWeek[w] = (byWeek[w] || 0) + snap[d];
    });
    Object.keys(byWeek).forEach(function(w){
      var g = calc.goalSeconds(c, w), goal = g || Math.round(c.weeklyGoalMinutes * 60), known = !!S.weeks[w];
      var total = ((S.weeks[w] && S.weeks[w].seconds) || 0) + byWeek[w];
      var hit = !!((S.weeks[w] && S.weeks[w].hit === true) || (g > 0 && total >= goal));
      ops.push({ kind: 'week', id: w, inc: byWeek[w], goalSeconds: goal, hit: hit, sendHit: hit || !known });
    });
    return ops;
  }
  /* The server confirmed these ops: fold them into the local copy of its numbers. */
  function applyConfirmed(ops){
    ops.forEach(function(o){
      if(o.kind === 'day') S.days[o.id] = (S.days[o.id] || 0) + o.inc;
      else S.weeks[o.id] = { seconds: ((S.weeks[o.id] && S.weeks[o.id].seconds) || 0) + o.inc, goalSeconds: o.goalSeconds, hit: o.hit || !!(S.weeks[o.id] && S.weeks[o.id].hit) };
    });
  }
  function takePending(){
    var snap = {}, any = false;
    Object.keys(S.pend).forEach(function(d){ if(S.pend[d] > 0){ snap[d] = S.pend[d]; any = true; } });
    return any ? snap : null;
  }
  function putBack(snap){
    Object.keys(snap).forEach(function(d){ S.pend[d] = (S.pend[d] || 0) + snap[d]; });
  }
  function flush(){
    var st = S;
    lastFlush = now();
    if(!st || st.flushing || st.loading) return Promise.resolve(false);
    if(typeof navigator !== 'undefined' && navigator.onLine === false) return Promise.resolve(false);
    if(Date.now() < deniedUntil) return Promise.resolve(false);
    var snap = takePending();
    if(!snap) return Promise.resolve(true);
    var ops = buildOps(snap);
    /* The seconds leave `pend` for `inflight` NOW and stay there until the SDK
       answers. There is no timeout: the SDK keeps a commit it cannot deliver and
       delivers it when the connection returns, so giving up on it and sending the
       same seconds again would count them once per attempt. */
    st.flushing = true;
    st.inflight = { snap: snap, ops: ops, at: Date.now() };
    Object.keys(snap).forEach(function(d){ delete st.pend[d]; });
    persist();
    st.flushP = dbP().then(function(db){
      var batch = db.batch(), base = db.collection('minutes').doc(st.uid);
      ops.forEach(function(o){
        if(o.kind === 'day') batch.set(base.collection('days').doc(o.id), { seconds: FV().increment(o.inc) }, { merge: true });
        else {
          var data = { seconds: FV().increment(o.inc), goalSeconds: o.goalSeconds };
          if(o.sendHit) data.hit = o.hit;
          batch.set(base.collection('weeks').doc(o.id), data, { merge: true });
        }
      });
      return batch.commit();
    }).then(function(){
      st.flushing = false; st.inflight = null;
      if(S !== st) settleAfterSwitch(st, snap, true);
      if(S === st){
        applyConfirmed(ops); persist(); cacheServer(); uiNow(); refreshToken();
        // Seconds counted while this commit was in flight (a stalled connection) go out now, not at the next Play. Not while still counting: that keeps the 60 s rhythm.
        if(!session && takePending()) setTimeout(function(){ if(S === st) flush(); }, 0);
      }
      return true;
    }, function(err){
      st.flushing = false; st.inflight = null;
      if(S !== st){ settleAfterSwitch(st, snap, false); return false; }
      putBack(snap); persist();
      if(err && err.code === 'permission-denied') return afterDenied(st);
      return false;      // not delivered (SDK could not load, say): the queue keeps everything
    });
    return st.flushP;
  }
  /* A commit answered after the page switched student (sign-out on a Journey
     page). Its key no longer belongs to S, so nothing else would correct it.
     Same student signed back in on this page: S owns the key now and folded it
     in WITHOUT these seconds (sync), so a failed commit puts them into S.pend.
     Anyone else (or nobody): rewrite the old student's key — what it still
     holds, plus these seconds if they did not land. */
  function settleAfterSwitch(st, snap, landed){
    if(leftInflight[st.uid] === snap) delete leftInflight[st.uid];
    if(S && S.uid === st.uid){
      if(!landed){ Object.keys(snap).forEach(function(d){ S.pend[d] = (S.pend[d] || 0) + snap[d]; }); persist(); }
      return;
    }
    if(!landed) Object.keys(snap).forEach(function(d){ st.pend[d] = (st.pend[d] || 0) + snap[d]; });
    var held = {}, any = false;
    Object.keys(st.pend).forEach(function(d){ if(st.pend[d] > 0){ held[d] = st.pend[d]; any = true; } });
    ls(qKey(st.uid), any ? JSON.stringify({ days: held, at: Date.now() }) : null);
  }
  /* Refused by the rules. Re-read the server, trim the queue to the cap and
     try again; if the queue did not shrink, something other than the cap is
     wrong (rules not published): keep the seconds, try again in 5 minutes. */
  function afterDenied(st){
    var before = JSON.stringify(st.pend);
    return load(true).then(function(){
      if(S !== st) return false;
      if(JSON.stringify(st.pend) === before){ deniedUntil = Date.now() + DENIED_BACKOFF_MS; return false; }
      return flush();      // the queue was trimmed: one more try (a second refusal lands here again with nothing left to trim, and backs off)
    });
  }

  /* An ID token kept fresh for the unload write (getIdToken is async, and
     pagehide cannot wait for it). It is tied to the student it was issued to:
     a token from the previous student on a shared Chromebook must never be sent
     for this one's queue. */
  var idToken = '', idTokenUid = '';
  function refreshToken(){
    try {
      var u = hostUser();
      if(u && typeof u.getIdToken === 'function'){ var who = u.uid; u.getIdToken().then(function(tk){ if(S && S.uid === who){ idToken = tk; idTokenUid = who; } }, function(){}); }
    } catch(e) {}
  }
  function keepaliveFlush(){
    var st = S;
    if(!st || st.loading || !idToken || idTokenUid !== st.uid || typeof fetch === 'undefined') return;
    if(typeof navigator !== 'undefined' && navigator.onLine === false) return;
    if(Date.now() < deniedUntil) return;
    var snap = takePending();
    if(!snap) return;
    var ops = buildOps(snap);
    var proj = firebaseConfig.projectId, root = 'projects/' + proj + '/databases/(default)/documents/minutes/' + st.uid + '/';
    var writes = ops.map(function(o){
      if(o.kind === 'day') return { update: { name: root + 'days/' + o.id, fields: {} }, updateMask: { fieldPaths: [] },
        updateTransforms: [{ fieldPath: 'seconds', increment: { integerValue: String(o.inc) } }] };
      var fields = { goalSeconds: { integerValue: String(o.goalSeconds) } }, mask = ['goalSeconds'];
      if(o.sendHit){ fields.hit = { booleanValue: o.hit }; mask.push('hit'); }
      return { update: { name: root + 'weeks/' + o.id, fields: fields }, updateMask: { fieldPaths: mask },
        updateTransforms: [{ fieldPath: 'seconds', increment: { integerValue: String(o.inc) } }] };
    });
    try {
      fetch('https://firestore.googleapis.com/v1/projects/' + proj + '/databases/(default)/documents:commit', {
        method: 'POST', keepalive: true,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + idToken },
        body: JSON.stringify({ writes: writes })
      }).catch(function(){});
      /* Assume it lands: leaving the seconds queued would send them twice the
         next time this student opens the site. Losing under a minute is the
         safer mistake than counting it twice. */
      Object.keys(snap).forEach(function(d){ delete st.pend[d]; });
      applyConfirmed(ops);
    } catch(e) {}
  }
  if(typeof window !== 'undefined'){
    window.addEventListener('pagehide', function(){ leavingPage = true; if(S){ keepaliveFlush(); persist(true); } });
    window.addEventListener('pageshow', function(e){ if(e && e.persisted){ leavingPage = false; if(S) persist(); } });
    window.addEventListener('online', function(){ if(sync()){ if(!S.loaded) load(); else flush(); } });
  }

  function beat(t){
    lastBeat = t;
    var p = period();
    if(!p || (typeof navigator !== 'undefined' && navigator.onLine === false)) return;
    if(!sid){
      try { sid = sessionStorage.getItem('pmSid') || ''; } catch(e) {}
      if(!sid){
        sid = randHex(12);
        try { sessionStorage.setItem('pmSid', sid); } catch(e) {}
      }
    }
    dbP().then(function(db){
      return db.collection('heartbeats').doc(sid).set({ period: p, lastSeen: FV().serverTimestamp() });
    }).catch(function(){});
  }

  /* ════════════════════════════════════════════════════════════════════
     EVERYTHING BELOW IS WHAT A STUDENT SEES — all of it behind uiOn
     ════════════════════════════════════════════════════════════════════ */
  function tr(k, p){ return typeof t === 'function' ? t(k, p) : k; }
  function lang(){ return typeof getLang === 'function' ? getLang() : 'en'; }
  function esc(s){ return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function uiOn(){ var h = getHost(); return !!(h && h.ui && cfg().uiOn && sync()); }
  function mins(sec){ return Math.floor(sec / 60); }
  function plural(base, n){ return tr(base + (n === 1 ? '.one' : '.many'), { n: n }); }

  var FLAME = '<svg class="pm-flame-svg" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2c.6 3.1 2.2 4.6 3.9 6.3C17.6 10 19 11.8 19 14.5A7 7 0 0 1 5 14.5c0-1.9.8-3.5 1.9-4.6.2 1.4.9 2.4 2 2.9C8.5 9 9.7 5.1 12 2z"/></svg>';
  var CIRC = 2 * Math.PI * 7;
  function ringSvg(frac, hit, cls){
    var f = Math.max(0, Math.min(1, frac));
    return '<svg class="pm-ring ' + (cls || '') + (hit ? ' pm-hit' : '') + '" viewBox="0 0 20 20" aria-hidden="true">'
      + '<circle class="pm-ring-bg" cx="10" cy="10" r="7"/>'
      + '<circle class="pm-ring-fg" cx="10" cy="10" r="7" transform="rotate(-90 10 10)" stroke-dasharray="' + CIRC.toFixed(2) + '" stroke-dashoffset="' + (CIRC * (1 - f)).toFixed(2) + '"/></svg>';
  }

  /* ── The status strip: right side of the practice card's sticky bar ── */
  function stripInner(){
    var st = status(), w = st.week;
    var live = (S.live >= cfg().liveMinCount)
      ? '<span class="pm-live"><i class="pm-dot" aria-hidden="true"></i>' + esc(tr('pm.playing', { n: S.live })) + '</span>' : '';
    var done = mins(w.secs), goal = mins(w.goal);
    /* The strip shows at most the goal ("30/30"): a long week must not widen it past
       the bar (Spanish, an Optional tag and Stop are all in the same row). My progress
       shows the true minutes. A week with no class has no goal: minutes only. */
    var weekTxt = w.isBreak ? tr('pm.weekMinBreak', { done: done }) : tr('pm.weekMin', { done: Math.min(done, goal), goal: goal });
    var flameLabel = plural('pm.streak', st.streak);
    return live
      + '<span class="pm-week">' + ringSvg(w.goal && !w.isBreak ? w.secs / w.goal : 0, w.hit) + '<span>' + esc(weekTxt) + '</span></span>'
      + '<span class="pm-streak' + (w.hit ? ' pm-on' : '') + '" role="img" aria-label="' + esc(flameLabel) + '">' + FLAME + '<b>' + st.streak + '</b></span>';
  }
  function stripHtml(){
    if(!uiOn()) return '';
    ensureStripWork();
    return '<span class="pm-strip" role="group">' + stripInner() + '</span>';
  }
  var stripKey = '';
  function refreshStrip(force){
    var els = typeof document !== 'undefined' ? document.querySelectorAll('.pm-strip') : [];
    if(!els.length) return;
    if(!uiOn()){ Array.prototype.forEach.call(els, function(e){ e.remove(); }); return; }
    var html = stripInner(), key = lang() + '|' + html;
    if(!force && key === stripKey) return;
    stripKey = key;
    Array.prototype.forEach.call(els, function(e){ e.innerHTML = html; });
  }
  /* The strip needs the server's numbers and the live count; start them when a
     strip is first drawn, and keep the count fresh while one is on screen. */
  var liveTimer = 0;
  function ensureStripWork(){
    if(!S) return;
    if(!S.loaded && !S.loading) load();
    if(!liveTimer && typeof setInterval !== 'undefined'){
      pollLive();
      liveTimer = setInterval(function(){
        if(!document.querySelector('.pm-strip')){ clearInterval(liveTimer); liveTimer = 0; return; }
        if(document.visibilityState !== 'hidden') pollLive();
      }, HEARTBEAT_MS);
    }
    toastMaybe();
  }
  /* The count is ONE aggregation query over REST (runAggregationQuery, count) —
     the compat SDK this site loads has no count(), and reading every matching
     heartbeat doc on every poll would cost a read per player per poll for the
     whole class. The same rule as a list applies (any signed-in user); the
     query needs the composite index in firestore.indexes.json. Any failure
     (no index yet, offline, no token) hides the "N playing" item. */
  function pollLive(){
    var st = S, p = period();
    if(!st || !p || !uiOn() || (typeof navigator !== 'undefined' && navigator.onLine === false) || typeof fetch === 'undefined') return;
    var h = getHost(), u = h && h.user && h.user();
    if(!u || typeof u.getIdToken !== 'function') return;
    var cutoff = new Date(Date.now() - 60000).toISOString();
    var body = { structuredAggregationQuery: {
      structuredQuery: {
        from: [{ collectionId: 'heartbeats' }],
        where: { compositeFilter: { op: 'AND', filters: [
          { fieldFilter: { field: { fieldPath: 'period' }, op: 'EQUAL', value: { stringValue: p } } },
          { fieldFilter: { field: { fieldPath: 'lastSeen' }, op: 'GREATER_THAN', value: { timestampValue: cutoff } } }
        ] } }
      },
      aggregations: [{ alias: 'n', count: {} }]
    } };
    u.getIdToken().then(function(tok){
      return fetch('https://firestore.googleapis.com/v1/projects/' + firebaseConfig.projectId + '/databases/(default)/documents:runAggregationQuery', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + tok }, body: JSON.stringify(body)
      });
    }).then(function(r){ return r.json(); }).then(function(j){
      var n = +(((j[0] || {}).result || {}).aggregateFields || {}).n.integerValue;
      if(S !== st) return;
      st.live = isFinite(n) ? n : 0; st.liveAt = Date.now();
      refreshStrip();
    }).catch(function(){ if(S === st){ st.live = 0; refreshStrip(); } });
  }
  function uiTick(){ if(typeof document !== 'undefined' && document.querySelector('.pm-strip')) refreshStrip(); }
  function uiNow(){ uiTick(); }

  /* ── Pills that float under the sticky bar ── */
  function anchorRect(){
    var bar = document.querySelector('.ca-screen .page-topbar');
    return bar ? bar.getBoundingClientRect() : null;
  }
  function removeEl(id){ var e = document.getElementById(id); if(e) e.remove(); }
  /* The toast and recap belong to the practice card under them: gone when the
     card's bar is (My progress, a module page) or the language changes. */
  function stripShown(){
    var els = document.querySelectorAll('.pm-strip');
    for(var i = 0; i < els.length; i++) if(els[i].getClientRects().length) return true;   // a hidden screen keeps its bar in the page
    return false;
  }
  function followCard(el){
    var iv = setInterval(function(){
      if(!el.isConnected){ clearInterval(iv); return; }
      if(!stripShown()){ el.remove(); clearInterval(iv); }
    }, 250);
  }
  if(typeof window !== 'undefined') window.addEventListener('gc-langchange', function(){ removeEl('pm-toast'); removeEl('pm-recap'); });

  function goalCrossed(weekId){
    var st = S;
    if(st.toastWeek === weekId) return;
    st.pendingToast = weekId;
    if(uiOn()) toastMaybe();
  }
  function toastMaybe(){
    var st = S;
    if(!st || !st.pendingToast || !uiOn()) return;
    var bar = anchorRect();
    if(!bar || !document.querySelector('.pm-strip')) return;          // no practice card on screen: show it at the next one
    var w = st.pendingToast;
    st.pendingToast = false; st.toastWeek = w; ls('pm:t:' + st.uid, w);
    var s = status();
    removeEl('pm-toast');
    var el = document.createElement('div');
    el.id = 'pm-toast'; el.className = 'pm-toast'; el.setAttribute('role', 'status');
    el.innerHTML = FLAME + '<span>' + esc(s.streak >= 2 ? tr('pm.toastHit', { n: s.streak }) : tr('pm.toastHit1')) + '</span>';
    el.style.top = Math.round(bar.bottom + 8) + 'px';
    el.style.left = Math.round(bar.left + bar.width / 2) + 'px';
    document.body.appendChild(el);
    followCard(el);
    setTimeout(function(){ el.remove(); }, cfg().toastSeconds * 1000);
  }

  function recapMaybe(s){
    var c = cfg(), st = S;
    if(!uiOn() || !st || s.counted < c.recapMinSeconds) return;
    if(document.visibilityState === 'hidden') return;          // unseen: it would only start the gap and block the real one
    var bar = anchorRect();
    if(!bar || !document.querySelector('.pm-strip')) return;
    if(Date.now() - st.lastRecapAt < c.recapGapSeconds * 1000) return;
    st.lastRecapAt = Date.now();
    var u = status(), w = u.week, need = Math.max(1, Math.ceil((w.goal - w.secs) / 60));
    var line = (w.isBreak ? tr('pm.recapWeekBreak', { done: mins(w.secs) }) : tr('pm.recapWeek', { done: mins(w.secs), goal: mins(w.goal) })) + ' ';
    if(w.isBreak) line = line.trim();
    else if(w.hit) line += u.streak >= 2 ? tr('pm.recapHit', { n: u.streak }) : tr('pm.recapHit1');
    else line += u.streakBefore >= 1
      ? tr('pm.recapMore' + (u.streakBefore === 1 ? '.one' : '.many'), { need: need, n: u.streakBefore })
      : tr('pm.recapMore0', { need: need });
    removeEl('pm-recap');
    var el = document.createElement('div');
    el.id = 'pm-recap'; el.className = 'pm-recap'; el.setAttribute('role', 'status');
    el.innerHTML = '<button type="button" class="pm-recap-x" aria-label="' + esc(tr('pm.close')) + '">&#x2715;</button>'
      + '<div class="pm-recap-big">' + esc(tr('pm.recapPlus', { n: Math.max(1, mins(s.counted)) })) + '</div>'
      + '<p class="pm-recap-sub">' + esc(line) + '</p>';
    var toast = document.getElementById('pm-toast');
    el.style.top = Math.round((toast ? toast.getBoundingClientRect().bottom : bar.bottom) + 8) + 'px';
    el.style.right = Math.max(8, Math.round(window.innerWidth - bar.right)) + 'px';
    document.body.appendChild(el);
    followCard(el);
    var gone = function(){ el.remove(); };
    el.querySelector('.pm-recap-x').addEventListener('click', gone);
    setTimeout(gone, c.recapShowSeconds * 1000);
  }

  /* ── My progress ── */
  var DOW_KEYS = { 1: 'pm.dow1', 2: 'pm.dow2', 3: 'pm.dow3', 4: 'pm.dow4', 5: 'pm.dow5', 6: 'pm.dow6', 7: 'pm.dow7' };
  function renderProgress(host_el){
    if(!host_el) return;
    if(!uiOn()){ host_el.hidden = true; host_el.innerHTML = ''; return; }
    host_el.hidden = false;
    if(!S.loaded && !S.loading) load().then(function(){ if(!host_el.hidden && host_el.isConnected) host_el.innerHTML = progressHtml(); });
    host_el.innerHTML = progressHtml();
  }
  function progressHtml(){
    var c = cfg(), st = status(), w = st.week, d = today();
    var more = Math.max(1, Math.ceil((w.goal - w.secs) / 60));
    var weekSub = w.isBreak ? tr('pm.tileWeekBreak') : w.hit ? tr('pm.tileWeekHit')
      : tr(st.streakBefore > 0 ? 'pm.tileWeekMore' : 'pm.tileWeekMore0', { n: more });
    var tiles = '<div class="pm-tiles">'
      + '<div class="pm-tile"><div class="pm-tile-h">' + esc(tr('pm.tileWeek')) + '</div>'
      +   '<div class="pm-tile-row">' + ringSvg(w.goal && !w.isBreak ? w.secs / w.goal : 0, w.hit, 'pm-ring-lg') + '<b>' + esc(w.isBreak ? tr('pm.tileWeekValBreak', { done: mins(w.secs) }) : tr('pm.tileWeekVal', { done: mins(w.secs), goal: mins(w.goal) })) + '</b></div>'
      +   '<div class="pm-tile-sub">' + esc(weekSub) + '</div></div>'
      + '<div class="pm-tile"><div class="pm-tile-h">' + esc(tr('pm.tileStreak')) + '</div>'
      +   '<div class="pm-tile-row"><span class="pm-streak pm-streak-lg' + (st.streak > 0 ? ' pm-on' : '') + '">' + FLAME + '</span><b>' + esc(plural('pm.tileStreakVal', st.streak)) + '</b></div>'
      +   '<div class="pm-tile-sub">' + esc(plural('pm.tileLongest', st.longest)) + '</div></div>'
      + '<div class="pm-tile"><div class="pm-tile-h">' + esc(tr('pm.tileToday')) + '</div>'
      +   '<div class="pm-tile-row"><b class="pm-today">' + mins(dayTotal(d)) + '</b><span class="pm-today-u">' + esc(tr('pm.min')) + '</span></div>'
      +   '<div class="pm-tile-sub">' + esc(tr('pm.tileAll', { n: mins(allTimeSeconds()) })) + '</div></div>'
      + '</div>';
    /* This week by day: Monday to Sunday for every student. A day with no practice is an
       empty bar, never a miss marker (the goal is for the whole week). */
    var cap = Math.round(c.dailyCapMinutes * 60), mon = calc.weekMonday(w.id), dates = [];
    for(var di = 0; di < 7; di++) dates.push(calc.ymd(calc.addDays(mon, di)));
    var bars = dates.map(function(ds){
      var secs = dayTotal(ds), wd = ((calc.parse(ds).getDay() + 6) % 7) + 1, h = Math.round(Math.min(1, secs / cap) * 100);
      var label = tr(DOW_KEYS[wd]), tip = tr('pm.dayTip', { day: label, n: mins(secs) });
      return '<div class="pm-bar' + (ds === d ? ' pm-bar-today' : '') + (ds > d ? ' pm-bar-future' : '') + '" title="' + esc(tip) + '" aria-label="' + esc(tip) + '" role="img">'
        + '<span class="pm-bar-n">' + (secs ? mins(secs) : '') + '</span><span class="pm-bar-col"><i style="height:' + (secs ? Math.max(6, h) : 0) + '%"></i></span><span class="pm-bar-l">' + esc(label) + '</span></div>';
    }).join('');
    var days = '<div class="pm-sec-h">' + esc(tr('pm.byDay')) + '</div><div class="pm-bars">' + (bars || '') + '</div>';
    /* Weeks: last 8, oldest first. */
    var fmt = function(id){
      try { return calc.weekMonday(id).toLocaleDateString(lang() === 'es' ? 'es' : 'en-US', { month: 'short', day: 'numeric' }); }
      catch(e) { return id; }
    };
    var squares = st.history.map(function(h){
      var key = h.state === 'hit' || (h.state === 'now' && h.hit) ? 'pm.weekHit' : h.state === 'break' || (h.state === 'now' && !(h.goal > 0)) ? 'pm.weekBreak' : h.state === 'now' ? 'pm.weekNow' : h.state === 'none' ? 'pm.weekNone' : 'pm.weekMissed';
      var tip = tr(key, { date: fmt(h.id), n: mins(h.secs) });
      var cls = 'pm-sq pm-sq-' + h.state + (h.hit && h.state !== 'hit' ? ' pm-sq-hit' : '');
      return '<button type="button" class="' + cls + '" title="' + esc(tip) + '" aria-label="' + esc(tip) + '" data-tip="' + esc(tip) + '">' + (h.hit ? FLAME : '') + '</button>';
    }).join('');
    var weeks = '<div class="pm-sec-h">' + esc(tr('pm.weeks')) + '</div><div class="pm-weeks" role="group">' + squares + '</div>'
      + '<div class="pm-tip" id="pm-week-tip" aria-live="polite"></div>'
      + '<p class="pm-cap">' + esc(tr('pm.caption')) + '</p>';
    return '<div class="pm-panel"><div class="pm-panel-h">' + esc(tr('pm.title')) + '</div>' + tiles + days + weeks + '</div>';
  }
  if(typeof document !== 'undefined'){
    document.addEventListener('click', function(e){
      var b = e.target && e.target.closest ? e.target.closest('.pm-sq') : null;
      if(!b) return;
      var tip = document.getElementById('pm-week-tip');
      if(tip) tip.textContent = b.getAttribute('data-tip') || '';
    });
  }
  function onCardOpen(){ if(sync() && uiOn()){ ensureStripWork(); refreshStrip(true); } }

  /* ── Public surface ── */
  window.PM = {
    calc: calc, cfg: cfg,
    setHost: function(h){ host = h; },
    track: note,
    stripHtml: stripHtml, refreshStrip: refreshStrip, onCardOpen: onCardOpen,
    renderProgress: renderProgress,
    flush: flush, load: function(){ return sync() ? load() : Promise.resolve(); },
    status: function(){ return sync() ? status() : null; },
    _pollLive: pollLive, _session: function(){ return session; },
    _state: function(){ return S; }, _session: function(){ return session; }, _tick: tick, _media: media, _end: endSession, _buildOps: buildOps
  };
})();
