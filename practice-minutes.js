/* ══════════════════════════════════════════════════════════════════════
   PRACTICE MINUTES — the engine.   (2026-11-01; all site work counts since 2026-11-03)
   Settings: practice-minutes-config.js

   WHAT IT COUNTS (Jonathan, 2026-11-03: "any work inside the website from
   modules to other class activities should count towards minutes and
   streaks"; it was backing tracks only before). A second of wall-clock time
   counts while ALL of these hold:
     · the student is WORKING on the site — any one of:
         – any <audio>/<video> element is playing: not paused, not ended, not
           muted (the Guitar toggle's twin plays muted beside the audible one),
           data buffered, currentTime moving (audible()). Backing tracks, the
           student's own recording, a note file, a local video — all of it;
         – the student clicked, tapped, typed, scrolled or moved the pointer
           in the last ACTIVE_MS (2 minutes — Jonathan's pick, 2026-11-03:
           reading a step and then playing it for a minute still counts);
         – the site made a sound through Web Audio (metronome, games, strums,
           the ear trainer) in the last ACTIVE_MS;
         – a microphone the site opened is live (tuner, Coach, a game that
           listens for notes): the student is playing into it;
         – focus is inside an embedded video (a YouTube lesson): a click
           there never reaches this page, so the window is FRAME_ACTIVE_MS
           (10 minutes) from the click instead;
     · the tab is visible (Page Visibility API);
     · a student is signed in (never the ?teacher console).
   Two things at once are still one second. Nothing here starts, loops or
   changes playback or the mic: the engine only watches (play(),
   getUserMedia() and Web Audio start() are wrapped and pass through
   untouched). The daily cap bounds a tab left open with a song looping or a
   mic on.

   One thing stays tied to SOUND, as before: the recap pill ("+N min") opens
   when playback stops (a `play` run inside the counting session).

   HOW IT FINDS THE ELEMENTS. Practice and snippet cards play from detached
   `new Audio()` elements, which fire no event a document listener can see, so
   HTMLMediaElement.prototype.play is wrapped (it returns the original's
   result untouched and only notes the element). Elements in the page (the
   Journey player, the resource viewer) are also caught by a capture-phase
   `playing` listener. Both feed one Set; the 1 s tick does the counting.

   WHAT IT STORES (Firestore; firestore.rules has the matching blocks).
     minutes/{uid}/days/{YYYY-MM-DD}  { seconds }                 (capped per day)
     minutes/{uid}/weeks/{YYYY-Www}   { seconds, goalSeconds, hit }
      minutesBoard/{uid}               { seconds }                 (the class rank; see CLASS RANK)
      weekBoard/{tag}                  { week, period, seconds }   (this week's Top 5, keyed by a private random tag, not the uid; see TOP 5)
      minutes/{uid}/meta/board         { id }                      (the tag: create-only, owner-only)
  Nothing else: no heartbeat, no live count (see NO LIVE COUNT below).
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
   `pend` — even with a commit in flight, unless that commit has gone unanswered
   for DEAD_LINK_MS (the link is dead) — and the leaving key keeps any commit still
   in flight (Jonathan, 2026-11-01: "be liberal with minutes since this is for
   motivation" — when unsure, count it; a rare double is bounded by the rules'
   daily cap), with the ID token cached for THIS student (navigator.sendBeacon cannot carry
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

   NO LIVE COUNT (2026-11-04). "N playing" left the strip, then its
   heartbeats/{sessionId} writer and the count query left the engine: nothing
   read them. firestore.rules keeps its heartbeats block until it is deleted in
   the Firebase console (WORKFLOW.md, "Practice minutes"); checks.mjs 1cg and
   pm-sim sections 6 and 8 fail if a heartbeat or a live count comes back.

   CLASS RANK (2026-11-04, Jonathan: "a ranking for students ... N/total"). My progress shows
   "N/total": N = 1 + how many students have more whole minutes all time, total = how many students
   have a board doc. minutesBoard/{uid} holds ONE number, the student's all-time seconds the server
   has confirmed: no name, no period. A uid is opaque here, BUT NOT FULLY ANONYMOUS: the live quiz
   keeps each player's name under the same uid in liveQuiz/current.scores, readable by every signed-in
   student, so a student who looks can match a quiz name to a board number (accepted by Jonathan,
   2026-11-04; the tile itself shows only your own place). The student's own page writes it (see
   publishBoard: created at the server's sum, then increments only), at most once per BOARD_MS; every
   signed-in student may read the collection (that is the whole point), nobody but the owner writes it,
   nobody deletes. The teacher's account is never written or ranked. It is a decoration like the rest
   of this file: a failed write or read changes nothing about counting, and the rank tile stays away.
   HONEST LIMITS: a student at DevTools can write any number up to the rules' cap for themselves; any
   Google account that signs in once adds 1 to the total (no domain rule, Jonathan's call); a page
   that closes within 2 minutes of its last confirmed seconds leaves them off the board (nothing adds
   them later, so the board can run a little behind the minutes); two pages that both create a missing
   doc in the same instant can undercount once. Reads cost one document per student, so the board is
   kept 3 hours (memory and localStorage) per student.

   TOP 5 (2026-11-04, Jonathan: "a top 5 icon for the top 5 minutes users per week, starting from
   each Monday, by class period"). A round "TOP 5" medal in the strip and on My progress, and a toast the
   first time a student enters it in a week. Ranked by THIS week's whole minutes (Monday to Sunday, the
   same ISO week as the goal) among the students of the same class period (PM_HOST.period(): '4', '7' or
   'CAS'; no period answered yet = no Top 5). Ties share a place, so more than five can wear it. A student
   needs config.top5MinMinutes (10) this week to be ranked at all, so Monday morning is not a giveaway.
   Each student sees ONLY their own place (Jonathan, 2026-11-04: "just their own rank"): no names, no one
   else's minutes on screen. weekBoard/{tag} holds { week, period, seconds } — keyed by the student's PRIVATE random
   name tag (minutes/{uid}/meta/board, see boardTag()), never the uid: Jonathan, 2026-11-04, wants no per-period minutes
   tied to a name, readable by anyone, and the live quiz keeps names under uids. This week's total as the
   SERVER holds it (the transaction reads minutes/{uid}/weeks/{week}, which every page of the student adds
   to, so a Journey tab opened in a new tab does not publish a smaller copy), written by a transaction that
   only ever RAISES the number inside one week + period (a page with an older copy never lowers what another
   page wrote); a new week or a changed period overwrites it. At most one write per WB_MS. The class's docs for this week + period are read with one query
   (equality filters only: no composite index) and kept WB_KEEP_MS (15 min) in memory and localStorage,
   so a period of 30 reads about 30 documents per student per 15 minutes on screen. Left open on purpose (2026-11-05): minutesBoard (the class rank) is still keyed by the uid, so a
   reader could join it to this board by value (all-time and this-week seconds are nearly equal while counting is young); no name is next to a uid
   anywhere readable, because the live quiz's public scores carry none any more (checks.mjs 1cm). The teacher's account is never written
   or ranked. A failed write or read changes nothing about counting; the medal and the tile stay away.
   HONEST LIMITS: a student at DevTools can write any number up to the rules' week cap for themselves (and
   choose their period). A device whose clock is a week BEHIND replaces the doc with its own week when it loads, and
   a clock AHEAD writes a week the real clock cannot overwrite until it arrives; both heal at the next confirmed
   write from a correct clock and are accepted (school Chromebooks keep time; the guard that fixes one breaks the
   other). Offline, a plain query get() answers EMPTY from the cache, so every read here asks the server.

  EVERYTHING A STUDENT SEES is behind PRACTICE_MINUTES_CONFIG.uiOn and lives
   in the second half of this file (strip, recap, toast, My progress). The first
   half has no DOM beyond the media listeners.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';

  /* ── Config, with a default for any key that is missing ── */
  var DEFAULTS = {
    uiOn: false, weeklyGoalMinutes: 60, dailyCapMinutes: 20,
    skipWeeks: [], semester2Start: '', streakStartWeek: '',
    recapMinSeconds: 60, recapGapSeconds: 180, recapShowSeconds: 6, toastSeconds: 3,
    top5MinMinutes: 10
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
  var FLUSH_MS = 60000, PERSIST_MS = 5000, DENIED_BACKOFF_MS = 300000, LOAD_RETRY_MS = 30000;
  var STALE_QUEUE_MS = 180000, QUEUE_FRESH_MS = 10000, ADOPT_MS = 30000;
  /* A commit unanswered this long means the link is dead (captive portal, ISP
     down): no keepalive goes out beside it (keepaliveFlush). */
  var DEAD_LINK_MS = 30000;
  var host = null;
  var S = null;                       // per-student state, rebuilt when the uid changes
  var media = new Set();              // audio/video elements seen playing
  var timer = 0, lastTick = 0, idleSec = 0, session = null;
  var play = null, playIdle = 0;      // a run of audible playback inside the session: the recap reports it
  /* WORKING (2026-11-03): counting goes on this long after the last sign of work —
     a click, key, scroll or pointer move, a Web Audio sound, an open mic. */
  var ACTIVE_MS = 120000, FRAME_ACTIVE_MS = 600000;
  var lastActive = -Infinity;         // now() of the last sign of work
  var mics = [];                      // streams getUserMedia() handed the site (watched, never touched)
  var lastFlush = 0, lastPersist = 0, lastAdopt = 0, deniedUntil = 0, queueTimer = 0;
  var pid = '';                       // random id for this page (its own queue key)
  var leavingPage = false;            // pagehide ran; cleared if the page comes back (back/forward cache)
  var leftInflight = {};              // uid -> seconds a signed-out state still has on the wire (see sync)
  var stateGen = 0, newestGen = {};   // uid -> gen of the newest state built for it (settleAfterSwitch)

  function freshState(uid){
    newestGen[uid] = ++stateGen;
    return { uid: uid, gen: stateGen, days: {}, weeks: {}, pend: {}, inflight: null, flushP: null, frac: 0, loaded: false, loading: null, flushing: false,
             loadRetryAt: 0, toastWeek: '', pendingToast: false, lastRecapAt: 0,
             boardReady: false, boardOwed: 0, boardBusy: false, boardAt: 0, boardRetryAt: 0, boardTimer: 0, board: null, boardLoading: null,
             wbSent: '', wbBusy: false, wbAt: 0, wbRetryAt: 0, wbTimer: 0, wb: null, wbLoading: null, wbLoadRetryAt: 0, top5Week: '', tag: '', tagP: null, tagRetryAt: 0 };
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
  function dbP(){ var h = getHost(); return h && h.db ? Promise.resolve(h.db()) : Promise.reject(new Error('no db')); }
  function FV(){ return firebase.firestore.FieldValue; }

  /* ── The pending-write queue: ONE localStorage key PER PAGE ──
     pm:q:<uid>:<pageId> = { days: { date: seconds }, at: ms }. A single shared
     key let two tabs of one student adopt (and send) each other's unconfirmed
     seconds, and overwrite each other's. Now a page writes only its own key and
     refreshes `at` while it holds anything; it takes over another page's key only
     when that stamp is more than STALE_QUEUE_MS from now (a closed tab, a crash;
     a page that left writes a normal stamp too — see persist). What a page holds = pend (not yet
     sent) + inflight (sent, not yet acknowledged). */
  function pageId(){ if(!pid) pid = randHex(6); return pid; }
  function qKey(u){ return 'pm:q:' + u + ':' + pageId(); }
  function queued(d){ return (S.pend[d] || 0) + ((S.inflight && S.inflight.snap[d]) || 0); }
  /* pend + inflight. A commit still in flight when the page closes stays in the
     key even though it may have landed: liberal on purpose (Jonathan, 2026-11-01,
     "be liberal with minutes since this is for motivation"). */
  function heldDays(){
    var m = {};
    Object.keys(S.pend).forEach(function(d){ if(S.pend[d] > 0) m[d] = (m[d] || 0) + S.pend[d]; });
    if(S.inflight) Object.keys(S.inflight.snap).forEach(function(d){ m[d] = (m[d] || 0) + S.inflight.snap[d]; });
    return m;
  }
  /* The stamp is always Date.now(): in Chrome the visibilitychange after pagehide
     rewrote a 0 stamp anyway, and an at-once adoptable key re-sent seconds a
     back/forward-cached page still held (2026-11-01 review). Another page takes
     the key over once it is STALE_QUEUE_MS old. */
  function persist(){
    if(!S) return;
    lastPersist = now();
    var held = heldDays(), any = Object.keys(held).length > 0;
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
    /* `legacy`: the key commit 70ef823 wrote for about an hour on 2026-11-01 (10:33
       to 11:36) before the key got a page id: pm:q:<uid>, no `at`. Nothing else ever
       adopted it. An exact match, so another student's key (pm:q:<uid>X) is never
       taken. Counting is liberal on purpose, so a rare double is fine. */
    var prefix = 'pm:q:' + st.uid + ':', legacy = 'pm:q:' + st.uid, mine = qKey(st.uid), keys = [];
    try { for(var i = 0; i < localStorage.length; i++){ var k = localStorage.key(i); if(k && (k.indexOf(prefix) === 0 || k === legacy) && k !== mine) keys.push(k); } } catch(e) { return; }
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
        delete leftInflight[u];        // subtracted once; this state's first persist rewrites the key without it
        var c = lsJson('pm:c:' + u);
        if(c){ S.days = c.days || {}; S.weeks = c.weeks || {}; }
        S.toastWeek = ls('pm:t:' + u) || '';
        S.top5Week = ls('pm:t5:' + u) || '';
        S.lastRecapAt = 0;
        idToken = ''; idTokenUid = '';
        refreshToken();
        var st = S;
        // Anything a closed page left goes out now (a later tick would do, but a student who only opens a card never plays).
        setTimeout(function(){ if(S === st){ adopt(); if(!st.loaded && Object.keys(heldDays()).length) load(); } }, 0);
      }
      session = null; idleSec = 0; play = null; playIdle = 0;
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
  /* How many more minutes this week's goal needs, and whether the daily cap still
     lets the student get them. Each day left (today included) can add at most
     dailyCapMinutes, and what today has already counted used part of today's. On a
     Sunday at the cap, "10 more reaches your goal" cannot happen (2026-11-01). */
  function weekReach(w){
    var cap = Math.round(cfg().dailyCapMinutes * 60), d = today();
    var daysLeft = 8 - (((calc.parse(d).getDay() + 6) % 7) + 1);   // Monday = 7 … Sunday = 1
    var room = daysLeft * cap - Math.min(dayTotal(d), cap);
    var need = w.goal - w.secs;                                    // seconds: the comparison must not round up to a whole minute first (a student 1 s short with 1 s of room can still reach it)
    return { more: Math.max(1, Math.ceil(need / 60)), out: need > room };
  }
  /* "No streak yet" instead of "0-week streak". */
  function streakWords(base, n){ return n > 0 ? plural(base, n) : tr('pm.streakNone'); }
  function allTimeSeconds(){
    var t = 0, m = weekTotals();
    Object.keys(m).forEach(function(w){ t += m[w]; });
    return t;
  }

  /* ════════════════════════════════════════════════════════════════════
     FINDING THE PLAYING ELEMENTS
     ════════════════════════════════════════════════════════════════════ */
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
  /* Signs of work (2026-11-03). Each only stamps the time and wakes the tick. */
  function markActive(){
    lastActive = now();
    if(!timer && uid()) ensureTimer();
  }
  function activeWindow(){
    var a = typeof document !== 'undefined' && document.activeElement;
    return (a && a.tagName === 'IFRAME') ? FRAME_ACTIVE_MS : ACTIVE_MS;
  }
  /* A mic is live while one of its audio tracks is: the tuner, Coach and the
     games stop their tracks when they close, which ends it. */
  function micLive(){
    var live = false;
    mics = mics.filter(function(s){
      var tr = [];
      try { tr = s.getAudioTracks(); } catch(e) {}
      var on = tr.some(function(t){ return t.readyState === 'live'; });
      if(on && tr.some(function(t){ return t.readyState === 'live' && t.enabled; })) live = true;
      return on;
    });
    return live;
  }
  if(typeof MediaDevices !== 'undefined' && MediaDevices.prototype.getUserMedia && !MediaDevices.prototype.__pmWrapped){
    var origGUM = MediaDevices.prototype.getUserMedia;
    MediaDevices.prototype.getUserMedia = function(){
      var p = origGUM.apply(this, arguments);
      try { p.then(function(s){ if(s && mics.indexOf(s) < 0){ mics.push(s); markActive(); } }, function(){}); } catch(e) {}
      return p;
    };
    MediaDevices.prototype.__pmWrapped = true;
  }
  if(typeof AudioScheduledSourceNode !== 'undefined' && !AudioScheduledSourceNode.prototype.__pmWrapped){
    var origStart = AudioScheduledSourceNode.prototype.start;
    AudioScheduledSourceNode.prototype.start = function(){
      try { markActive(); } catch(e) {}
      return origStart.apply(this, arguments);
    };
    AudioScheduledSourceNode.prototype.__pmWrapped = true;
  }
  if(typeof document !== 'undefined'){
    ['pointerdown', 'pointermove', 'keydown', 'wheel', 'scroll', 'touchstart', 'input'].forEach(function(ev){
      document.addEventListener(ev, markActive, { capture: true, passive: true });
    });
  }
  if(typeof window !== 'undefined' && window.addEventListener){
    /* Focus moving into an embedded video (a click on YouTube) blurs this window. */
    window.addEventListener('blur', function(){
      var a = typeof document !== 'undefined' && document.activeElement;
      if(a && a.tagName === 'IFRAME') markActive();
    });
  }
  if(typeof document !== 'undefined'){
    document.addEventListener('playing', function(e){ if(e.target && (e.target.tagName === 'AUDIO' || e.target.tagName === 'VIDEO')) note(e.target); }, true);
    document.addEventListener('visibilitychange', function(){
      /* Chrome fires this right AFTER pagehide when a page closes: keep the
         leaving key pagehide wrote, and start no commit the dying page cannot finish. */
      if(document.visibilityState === 'hidden'){ persist(); if(!leavingPage) flush(); }
      else tick();
    });
  }
  function audible(el){
    if(el.paused || el.ended || el.error || el.muted || el.volume < 0.001 || el.readyState < 3) return false;
    var moved = el.__pmT === undefined || el.currentTime !== el.__pmT;
    el.__pmT = el.currentTime;
    return moved;
  }

  /* ════════════════════════════════════════════════════════════════════
     THE TICK — once a second while anything may be playing or the student is working
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
    if(micLive()) lastActive = t;
    var visible = typeof document === 'undefined' || document.visibilityState !== 'hidden';
    var working = anyAudible || t - lastActive <= activeWindow();
    var counting = !!(st && working && visible);
    /* A practice card's section button pauses the song for a 3-5 s count-in;
       while its player is still live (pcState, app.js), that is not the end of
       a play run (or of a session) — Stop clears pcState and ends it 2 s later. */
    var cardLive = typeof pcState !== 'undefined' && !!pcState;
    if(counting){
      idleSec = 0;
      ensureTimer();                 // back on a visible tab inside the window: the timer stopped while hidden
      if(!session){ session = { counted: 0, startedAt: Date.now() }; refreshToken(); }   // the unload write needs a token under an hour old
      if(anyAudible){
        playIdle = 0;
        if(!play) play = { counted: 0 };
      }
      if(!st.loaded && !st.loading) load();
      addSeconds(dt);
      if(t - lastFlush >= FLUSH_MS) flush();
    } else {
      idleSec += dt;
      if(session && idleSec >= 2 && !(cardLive && idleSec < 30)) endSession();
    }
    if(play && !(counting && anyAudible)){
      playIdle += dt;
      if(playIdle >= 2 && !(cardLive && playIdle < 30)) endPlay();
    }
    if(t - lastPersist >= PERSIST_MS) persist();
    if(st && t - lastAdopt >= ADOPT_MS){ lastAdopt = t; adopt(); }
    uiTick();
    if(!media.size && !session && !play && idleSec >= 2) stopTimer();
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
    if(play) play.counted += n;
    if(goal > 0 && before < goal && before + n >= goal) goalCrossed(w);
  }

  function endSession(){
    session = null; idleSec = 0;
    if(!S){ play = null; playIdle = 0; return; }
    persist();
    flush();
    if(play) endPlay();
  }
  /* Playback stopped: the recap reports the minutes counted while it played.
     Not a flush — the session (still counting while the student works) sends
     them every FLUSH_MS and when it ends. */
  function endPlay(){
    var p = play;
    play = null; playIdle = 0;
    if(p && S) recapMaybe(p);
  }

  /* ════════════════════════════════════════════════════════════════════
     FIRESTORE — load, flush

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
        /* source 'server': offline, a plain get() RESOLVES with an EMPTY answer from the cache (the real SDK, 10.12.2, measured offline and with
           firestore.googleapis.com blocked), which this would take for "no minutes yet": week 0, streak 0, the saved copy overwritten, and no
           second read once the Wi-Fi is back. A server read rejects instead, and the catch below tries again later. */
        return Promise.all([
          base.collection('weeks').get({ source: 'server' }),
          base.collection('days').where(firebase.firestore.FieldPath.documentId(), '>=', from).get({ source: 'server' })
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
      publishBoard(st);
      publishWeek(st);
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
      var flying = 0;
      if(S.inflight) Object.keys(S.inflight.snap).forEach(function(d){ if(calc.weekIdOf(d) === w) flying += S.inflight.snap[d]; });
      var total = ((S.weeks[w] && S.weeks[w].seconds) || 0) + byWeek[w] + flying;   // a keepalive sent beside an in-flight batch must not send hit:false over it
      var hit = !!((S.weeks[w] && S.weeks[w].hit === true) || (g > 0 && total >= goal));
      ops.push({ kind: 'week', id: w, inc: byWeek[w], goalSeconds: goal, hit: hit, sendHit: hit || !known });
    });
    return ops;
  }
  /* The server confirmed these ops: fold them into the local copy of its numbers. */
  function applyConfirmed(ops){
    ops.forEach(function(o){
      if(o.kind === 'day') S.days[o.id] = (S.days[o.id] || 0) + o.inc;
      else {
        S.weeks[o.id] = { seconds: ((S.weeks[o.id] && S.weeks[o.id].seconds) || 0) + o.inc, goalSeconds: o.goalSeconds, hit: o.hit || !!(S.weeks[o.id] && S.weeks[o.id].hit) };
        S.boardOwed += o.inc;          // the class board is owed these seconds (see publishBoard)
      }
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
        applyConfirmed(ops); persist(); cacheServer(); uiNow(); refreshToken(); publishBoard(st); publishWeek(st);
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
    if(newestGen[st.uid] !== st.gen){
      /* A later state of this student on this page has written the key since (it
         may hold seconds st never saw, or another page may have adopted it):
         never rewrite it from st. Only add back what did not land. */
      if(!landed){
        var k = lsJson(qKey(st.uid)) || { days: {} }; k.days = k.days || {};
        Object.keys(snap).forEach(function(d){ k.days[d] = (k.days[d] || 0) + snap[d]; });
        ls(qKey(st.uid), JSON.stringify({ days: k.days, at: Date.now() }));
      }
      return;
    }
    /* No newer state here: the key is what st left at the switch (pend + this
       commit) — unless another page has adopted it since (then it is gone).
       Edit it, never rebuild it from st: a rebuilt key would bring back
       seconds the adopting page already sent (2026-11-01 re-review, R3-1).
       Landed: take the commit out. Failed: leave it — the key holds it. */
    if(!landed) return;
    var cur = lsJson(qKey(st.uid));
    if(!cur || !cur.days) return;
    var left = {}, any = false;
    Object.keys(cur.days).forEach(function(d){ var n = (cur.days[d] || 0) - (snap[d] || 0); if(n > 0){ left[d] = n; any = true; } });
    ls(qKey(st.uid), any ? JSON.stringify({ days: left, at: cur.at || Date.now() }) : null);
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

  /* ── CLASS RANK (see the header): publish my number, read everyone's ── */
  var BOARD_MS = 120000, BOARD_KEEP_MS = 10800000;
  /* All-time seconds the SERVER has confirmed, as THIS page knows them: the sum of its weeks docs. Right straight after a
     load; after that another page of the same student (a Journey tab) can have added seconds this page never saw. */
  function confirmedSeconds(st){
    var t = 0;
    Object.keys(st.weeks).forEach(function(w){ t += st.weeks[w].seconds || 0; });
    return t;
  }
  /* The teacher's own account is never on the board (a Journey page projected in class would otherwise rank first). */
  function isTeacherUser(){
    var u = hostUser();
    return !!(u && typeof TEACHER_EMAIL !== 'undefined' && u.email === TEACHER_EMAIL);
  }
  /* A page only ever ADDS to the board: increment(seconds the server confirmed since this page's last write), merged
     into the student's one doc. Two pages of one student (the main tab and a Journey tab) therefore add up; with a plain
     "write my total" the last page to write would replace the other's minutes with its own copy of the total.
     The one exception is the very first write of a page, which looks at the doc: if it does not exist yet it is CREATED
     at everything the server has confirmed (the minutes from before the board existed too); if it exists the page just adds.
     At most one write in flight and one per BOARD_MS; a trailing timer (dropped with the state) writes what a throttled
     call could not, so the end of a session is not left out. A refusal (the rules not published yet) backs off like the
     minutes writes do and keeps what is owed; nothing else is affected. */
  function publishBoard(st){
    if(!st || S !== st || !st.loaded || isTeacherUser()) return;
    if(st.boardReady && !(st.boardOwed > 0)) return;
    if(Date.now() < st.boardRetryAt) return;
    var wait = st.boardBusy ? BOARD_MS : BOARD_MS - (Date.now() - st.boardAt);
    if(wait > 0){
      if(!st.boardTimer && typeof setTimeout !== 'undefined') st.boardTimer = setTimeout(function(){ st.boardTimer = 0; publishBoard(st); }, wait + 50);
      return;
    }
    st.boardAt = Date.now();
    st.boardBusy = true;
    var sent = 0;
    dbP().then(function(db){
      var ref = db.collection('minutesBoard').doc(st.uid);
      var add = function(){
        sent = st.boardOwed;
        return sent > 0 ? ref.set({ seconds: FV().increment(sent) }, { merge: true }) : null;
      };
      if(st.boardReady) return add();
      return ref.get().then(function(snap){
        if(snap.exists) return add();
        sent = st.boardOwed;
        return ref.set({ seconds: confirmedSeconds(st) });
      }).then(function(){ st.boardReady = true; });
    }).then(function(){
      st.boardBusy = false;
      st.boardOwed = Math.max(0, st.boardOwed - sent);
      if(st.boardOwed > 0) publishBoard(st);      // more was confirmed while this write was out: the timer takes it
    }, function(err){
      st.boardBusy = false;
      st.boardRetryAt = Date.now() + (err && err.code === 'permission-denied' ? DENIED_BACKOFF_MS : LOAD_RETRY_MS);
    });
  }
  /* Everyone else's seconds (my own doc is left out: my live total is used instead). Kept in
     memory for BOARD_KEEP_MS (3 hours: a read is one document per student) and in localStorage
     under this student's id, so reopening My progress does not read the whole class again.
     Resolves to the cache, or null if unreadable. */
  function loadBoard(){
    var st = S;
    if(!st) return Promise.resolve(null);
    if(!st.board){
      var c = lsJson('pm:b:' + st.uid);
      if(c && c.others && typeof c.at === 'number' && Math.abs(Date.now() - c.at) < BOARD_KEEP_MS) st.board = c;
    }
    if(st.board && Math.abs(Date.now() - st.board.at) < BOARD_KEEP_MS) return Promise.resolve(st.board);
    if(st.boardLoading) return st.boardLoading;
    st.boardLoading = dbP().then(function(db){ return db.collection('minutesBoard').get({ source: 'server' }); }).then(function(snap){   // server: an offline plain get() answers empty and the rank tile would vanish for 3 hours
      var others = [];
      snap.forEach(function(doc){ if(doc.id !== st.uid) others.push(Math.max(0, +(doc.data() || {}).seconds || 0)); });
      st.board = { at: Date.now(), others: others };
      ls('pm:b:' + st.uid, JSON.stringify(st.board));
      return st.board;
    }).catch(function(){ return null; }).then(function(b){ st.boardLoading = null; return b; });
    return st.boardLoading;
  }
  /* N/total for the student on screen, or null while the board is not known. total counts me.
     The same whole minutes the screen shows decide a tie: two students who both read "12 min" share a
     place (1 + the number with MORE whole minutes). Under a minute of practice there is no rank yet: n is
     null, and the tile says so instead of "1/140" for every student on day one. */
  function rankInfo(){
    var b = S && S.loaded && S.board;
    if(!b || isTeacherUser()) return null;
    var all = allTimeSeconds(), mine = Math.floor(all / 60), higher = 0;
    b.others.forEach(function(s){ if(Math.floor(s / 60) > mine) higher++; });
    return { n: all < 60 ? null : higher + 1, total: b.others.length + 1 };
  }

  /* ── TOP 5 (see the header): publish this week's number, read my period's, work out my place ── */
  var WB_MS = 120000, WB_KEEP_MS = 900000, TOP_N = 5;
  var PERIOD_KEYS = { '4': 'pm.period4', '7': 'pm.period7', 'CAS': 'pm.periodCAS' };
  /* The student's class period as the host page knows it, or '' (not answered yet, or a value the rules refuse). */
  function hostPeriod(){
    var h = getHost(), p = '';
    try { p = h && typeof h.period === 'function' ? String(h.period() || '') : ''; } catch(e) { p = ''; }
    return PERIOD_KEYS.hasOwnProperty(p) ? p : '';
  }
  /* The student's private Top 5 NAME TAG: 32 random hex characters, made once by the student's own page and kept in
     minutes/{uid}/meta/board { id } (create-only; only the student reads it). It is kept in MEMORY only, never in
     localStorage: on a shared Chromebook the next student would read the previous student's uid and tag there and
     could follow that board doc. One read per page load. The weekBoard's docs are keyed by it, never by the uid, so
     nothing readable by other accounts joins a name (the live quiz keeps names under uids) to a period and minutes.
     Resolves to the tag, or '' (no crypto; offline and refused reject): then nothing is read or written for the
     Top 5. create = make it when the student has none yet. */
  var TAG_RE = /^[0-9a-f]{32}$/;
  function randomTag(){
    try {
      var c = typeof window !== 'undefined' && window.crypto;
      if(!c || typeof c.getRandomValues !== 'function') return '';
      var a = new Uint8Array(16), out = '';
      c.getRandomValues(a);
      for(var i = 0; i < a.length; i++) out += (a[i] < 16 ? '0' : '') + a[i].toString(16);
      return TAG_RE.test(out) ? out : '';
    } catch(e) { return ''; }
  }
  function boardTag(create){
    var st = S;
    if(!st) return Promise.resolve('');
    if(TAG_RE.test(st.tag)) return Promise.resolve(st.tag);
    if(st.tagP) return st.tagP;
    if(Date.now() < st.tagRetryAt) return Promise.reject({ code: 'permission-denied' });   // refused a moment ago (rules not published): the writer and the reader share ONE wait
    st.tagP = dbP().then(function(db){
      var ref = db.collection('minutes').doc(st.uid).collection('meta').doc('board');
      /* A transaction: two pages of one student opening at once must end up with ONE tag (the second sees the first's). */
      return db.runTransaction(function(t){
        return t.get(ref).then(function(snap){
          var have = snap.exists ? String((snap.data() || {}).id || '') : '';
          if(TAG_RE.test(have)) return have;
          if(!create) return '';
          var id = randomTag();
          if(!id) return '';
          t.set(ref, { id: id });
          return id;
        });
      });
    }).then(function(id){
      st.tagP = null;
      if(S === st && TAG_RE.test(id)){ st.tag = id; return id; }
      return '';
    }, function(err){
      st.tagP = null;
      if(err && err.code === 'permission-denied') st.tagRetryAt = Date.now() + DENIED_BACKOFF_MS;
      throw err;     // the caller's own catch decides its wait
    });
    return st.tagP;
  }
  /* weekBoard/{tag} = { week, period, seconds }: this week's total, as the SERVER holds it (see the header).
     A transaction reads the doc first and writes only when the number goes UP inside the same week and period (two
     pages of one student: the one with the older copy leaves the other's number alone), or the week or period changed.
     Throttled like publishBoard: one write per WB_MS, a trailing timer for the last one; a refusal backs off. */
  function publishWeek(st){
    if(!st || S !== st || !st.loaded || isTeacherUser()) return;
    var p = hostPeriod();
    if(!p) return;
    var w = calc.weekIdOf(today()), secs = (st.weeks[w] && st.weeks[w].seconds) || 0, key = w + '|' + p + '|' + secs;
    if(!(secs > 0) || key === st.wbSent) return;
    if(Date.now() < st.wbRetryAt) return;
    var wait = st.wbBusy ? WB_MS : WB_MS - (Date.now() - st.wbAt);
    if(wait > 0){
      if(!st.wbTimer && typeof setTimeout !== 'undefined') st.wbTimer = setTimeout(function(){ st.wbTimer = 0; publishWeek(st); }, wait + 50);
      return;
    }
    st.wbAt = Date.now();
    st.wbBusy = true;
    boardTag(true).then(function(tag){
      if(!tag) throw { code: 'unavailable' };
      return dbP().then(function(db){ return { db: db, tag: tag }; });
    }).then(function(x){
      var db = x.db, ref = db.collection('weekBoard').doc(x.tag), wref = db.collection('minutes').doc(st.uid).collection('weeks').doc(w);
      return db.runTransaction(function(t){
        return Promise.all([t.get(ref), t.get(wref)]).then(function(r){
          var d = r[0].exists ? (r[0].data() || {}) : null;
          /* What goes out is the week total the SERVER holds (every page of this student adds to it), not this page's own copy: a Journey tab
             opened in a new tab never re-reads its week, so its copy misses what the main tab counted. At least this page's confirmed seconds. */
          var sv = r[1].exists ? Math.max(0, Math.round(+(r[1].data() || {}).seconds || 0)) : 0;
          var n = Math.min(Math.max(secs, sv), 7 * Math.round(+cfg().dailyCapMinutes * 60));
          if(d && d.week === w && d.period === p && (+d.seconds || 0) >= n) return;
          t.set(ref, { week: w, period: p, seconds: n });
        });
      });
    }).then(function(){
      st.wbBusy = false;
      st.wbSent = key;
    }, function(err){
      st.wbBusy = false;
      st.wbRetryAt = Date.now() + (err && err.code === 'permission-denied' ? DENIED_BACKOFF_MS : LOAD_RETRY_MS);
      if(err && err.code === 'permission-denied') st.tag = '';   // the tag in memory may be stale (the student's data was reset): read it again next time
    });
  }
  /* Everyone else's seconds this week in my period (my own doc is left out, by my tag: my live total is used instead).
     Kept WB_KEEP_MS in memory and in localStorage under this student's id. Resolves to the cache, or null. */
  function loadWeek(){
    var st = S;
    if(!st || isTeacherUser()) return Promise.resolve(null);
    var p = hostPeriod(), w = calc.weekIdOf(today());
    if(!p) return Promise.resolve(null);
    var fresh = function(b){ return !!(b && b.week === w && b.period === p && Array.isArray(b.others) && typeof b.at === 'number' && Math.abs(Date.now() - b.at) < WB_KEEP_MS); };
    if(!fresh(st.wb)){ var c = lsJson('pm:w:' + st.uid); if(fresh(c)) st.wb = c; }
    if(fresh(st.wb)) return Promise.resolve(st.wb);
    if(st.wbLoading) return st.wbLoading;
    if(Date.now() < st.wbLoadRetryAt) return Promise.resolve(null);
    st.wbLoading = boardTag(true).then(function(tag){
      if(!tag) throw { code: 'unavailable' };     // no tag yet (offline, refused): my own doc cannot be told from the others', so read nothing
      return dbP().then(function(db){
        /* source 'server': offline, a plain query get() RESOLVES with an empty answer from the cache (the real SDK, 10.12.2), which would read as "nobody else
           has minutes" and show a false Top 5; a server read rejects instead. */
        return db.collection('weekBoard').where('week', '==', w).where('period', '==', p).get({ source: 'server' });
      }).then(function(snap){ return { snap: snap, tag: tag }; });
    }).then(function(x){
      var snap = x.snap, others = [];
      snap.forEach(function(doc){ if(doc.id !== x.tag) others.push(Math.max(0, +(doc.data() || {}).seconds || 0)); });
      st.wb = { at: Date.now(), week: w, period: p, others: others };
      ls('pm:w:' + st.uid, JSON.stringify(st.wb));
      return st.wb;
    }).catch(function(err){
      st.wbLoadRetryAt = Date.now() + (err && err.code === 'permission-denied' ? DENIED_BACKOFF_MS : LOAD_RETRY_MS);   // rules not published yet: ask every 5 minutes, not every 30 s
      return null;
    }).then(function(b){
      st.wbLoading = null;
      /* The 1 s tick stops after 2 idle seconds, so a read that lands later would leave the strip without its medal (and the
         toast unsent) until the student's next click: draw again now. Not a loop: the cache is fresh, so uiTick's loadWeek() reads nothing. */
      if(b && S === st && stripPresent()) uiNow();
      return b;
    });
    return st.wbLoading;
  }
  /* My place this week, from my live seconds (weekSecs, counted seconds not yet sent included) and the cached board,
     or null while it is not known (no period, the board not read yet, the teacher). Whole minutes decide, like the
     class rank: everyone who reads "12 min" shares a place, and n = 1 + how many have MORE. top = ranked (at least
     top5MinMinutes) and fewer than TOP_N ahead. need = minutes to catch the fifth place (only when ranked and out). */
  function top5Info(weekSecs){
    var st = S, b = st && st.loaded && st.wb;
    if(!b || isTeacherUser()) return null;
    var p = hostPeriod(), w = calc.weekIdOf(today());
    if(!p || b.week !== w || b.period !== p) return null;
    var min = Math.max(0, Math.round(+cfg().top5MinMinutes || 0)), mine = Math.floor((weekSecs || 0) / 60);
    var others = b.others.map(function(s){ return Math.floor(s / 60); }).sort(function(a, z){ return z - a; });
    var higher = 0;
    others.forEach(function(m){ if(m > mine) higher++; });
    var top = mine >= min && higher < TOP_N;
    var need = (!top && mine >= min) ? Math.max(1, others[TOP_N - 1] - mine) : 0;
    return { top: top, n: higher + 1, under: mine < min, min: min, toRank: Math.max(0, min - mine), need: need, period: p, week: w };
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
    /* A dead link (a commit unanswered for DEAD_LINK_MS): the keepalive would
       go the same way and its seconds would be deleted as if they had landed.
       Leave everything in the leaving key. */
    if(st.inflight && Date.now() - st.inflight.at >= DEAD_LINK_MS) return;
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
      /* Assume it lands: on a link that is answering (above) it nearly always
         does, and leaving its seconds queued too would count the last minute of
         almost every session twice — past even a liberal count. */
      Object.keys(snap).forEach(function(d){ delete st.pend[d]; });
      applyConfirmed(ops);
    } catch(e) {}
  }
  if(typeof window !== 'undefined'){
    window.addEventListener('pagehide', function(){ leavingPage = true; if(S){ keepaliveFlush(); persist(); } });
    window.addEventListener('pageshow', function(e){ if(e && e.persisted){ leavingPage = false; if(S) persist(); } });
    /* A reconnect is a reason to try now: an offline load is refused (source 'server') and waits LOAD_RETRY_MS, which would hold the queue back after the Wi-Fi returns. */
    window.addEventListener('online', function(){ if(sync()){ S.wbLoadRetryAt = 0; if(!S.loaded){ S.loadRetryAt = 0; load(); } else flush(); } });
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

  /* ── The status strip: the #pm-header button, first in the main top bar, and its twin #pm-games in the
     Games screen's bar (index.html; the Games screen is a full-screen layer that covers the header).
     "N playing" was dropped 2026-11-04 (Jonathan): the strip is the week ring and the streak flame. ── */
  function stripInner(){
    var st = status(), w = st.week;
    var done = mins(w.secs), goal = mins(w.goal);
    /* The strip shows at most the goal ("60/60"): a long week must not widen it and push
       the title, Find, Español and the user area off the one-row top bar. My progress
       shows the true minutes. A week with no class has no goal: minutes only. */
    var weekTxt = w.isBreak ? tr('pm.weekMinBreak', { done: done }) : tr('pm.weekMin', { done: Math.min(done, goal), goal: goal });
    var flameLabel = streakWords('pm.streak', st.streak), t5 = top5Info(w.secs);
    return '<span class="pm-week">' + ringSvg(w.goal && !w.isBreak ? w.secs / w.goal : 0, w.hit) + '<span>' + esc(weekTxt) + '</span></span>'
      + '<span class="pm-streak' + (w.hit ? ' pm-on' : '') + '" role="img" aria-label="' + esc(flameLabel) + '">' + FLAME + '<b>' + st.streak + '</b></span>'
      + (t5 && t5.top ? top5Mark('pm-top5-sm', tr('pm.top5Label')) : '');
  }
  /* The Top 5 medal: "TOP" over a big "5" (the same in both languages, like a logo); the words are in aria-label. */
  function top5Mark(cls, label){
    return '<span class="pm-top5 ' + cls + '" role="img" aria-label="' + esc(label) + '"><span aria-hidden="true">TOP</span><b aria-hidden="true">5</b></span>';
  }
  function stripHtml(){
    if(!uiOn()) return '';
    ensureStripWork();
    return '<span class="pm-strip" role="group">' + stripInner() + '</span>';
  }
  var stripKey = '';
  /* The strips are #pm-header (main top bar) and #pm-games (Games screen bar). They stay in the page
     and are hidden and emptied, never removed. refreshStrip never un-hides one (only syncHeader does,
     so the paused screen and the sign-in wall stay clear) and never fills a hidden one. */
  var HOST_STRIPS = ['pm-header', 'pm-games'];
  function hostStrips(){
    var out = [];
    if(typeof document === 'undefined') return out;
    HOST_STRIPS.forEach(function(id){ var e = document.getElementById(id); if(e) out.push(e); });
    return out;
  }
  function refreshStrip(force){
    var els = typeof document !== 'undefined' ? document.querySelectorAll('.pm-strip') : [];
    if(!els.length) return;
    if(!uiOn()){
      stripKey = '';
      Array.prototype.forEach.call(els, function(e){
        if(HOST_STRIPS.indexOf(e.id) >= 0){ e.hidden = true; e.innerHTML = ''; } else e.remove();
      });
      return;
    }
    var html = stripInner(), key = lang() + '|' + html;
    if(!force && key === stripKey) return;
    stripKey = key;
    Array.prototype.forEach.call(els, function(e){ if(!e.hidden) e.innerHTML = html; });
  }
  function stripPresent(){
    return hostStrips().some(function(e){ return !e.hidden; });
  }
  /* app.js calls this wherever it paints #user-area. show = true (the default)
     on the signed-in app (showApp); false on the sign-in wall, the paused screen,
     signed out and the teacher console's paths, where the strip must stay
     hidden. Shown only when uiOn, the host draws a UI and a student is signed in
     (uiOn() calls sync(), which rebuilds the state for a new student before
     anything is drawn, so a shared Chromebook never shows the last student's
     numbers). */
  function syncHeader(show){
    var els = hostStrips();
    if(!els.length) return;
    if(show === false || !uiOn()){
      els.forEach(function(e){ e.hidden = true; e.innerHTML = ''; });
      stripKey = '';
      return;
    }
    els.forEach(function(e){ e.hidden = false; });
    refreshStrip(true);
    ensureStripWork();
  }
  /* The strip needs the server's numbers: load them when it is first drawn. */
  function ensureStripWork(){
    if(!S) return;
    if(!S.loaded && !S.loading) load();
    loadWeek();
    toastMaybe();
  }
  /* Every second while the strip is up: keep it current, and show a week-goal toast that was held back
     (the strip was covered or the tab hidden when the goal was crossed). */
  function uiTick(){
    if(!stripPresent()) return;
    if(S && S.loaded && !S.wbLoading && document.visibilityState !== 'hidden') loadWeek();   // a resolved cache while fresh; one query when stale
    refreshStrip();
    if(document.visibilityState !== 'hidden'){ toastMaybe(); top5ToastMaybe(); }
  }
  function uiNow(){ uiTick(); }

  /* ── Pills that drop down from the header strip ── */
  /* The strip a pill drops from: the first of #pm-header / #pm-games that is shown AND has nothing over
     it (getClientRects is empty for display:none or an ancestor that is; elementFromPoint at its centre
     must land inside it). The header is covered by the Games screen (a full-screen layer, z 120), whose own
     bar carries #pm-games instead. Null when neither is: the pill then waits, or goes. */
  function anchorStrip(){
    var els = hostStrips();
    for(var i = 0; i < els.length; i++){
      var h = els[i];
      if(h.hidden || !h.getClientRects().length) continue;
      var r = h.getBoundingClientRect(), hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      if(hit && h.contains(hit)) return h;
    }
    return null;
  }
  function anchorRect(){ var h = anchorStrip(); return h ? h.getBoundingClientRect() : null; }
  /* A pill dropped from the Games bar must sit above the Games layer (z 120); from the header, the CSS z 54. */
  function pillZ(el){ var h = anchorStrip(); el.style.zIndex = h && h.id === 'pm-games' ? '130' : ''; }
  function removeEl(id){ var e = document.getElementById(id); if(e) e.remove(); }
  /* The toast and recap belong to the strip they dropped from: gone when it hides (sign-out)
     or is covered, or the language changes. */
  function stripShown(){ return !!anchorRect(); }
  function followStrip(el){
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
    if(!bar) return;          // the header strip is not on screen (paused screen, signed out): show it when it is
    var w = st.pendingToast;
    st.pendingToast = false; st.toastWeek = w; ls('pm:t:' + st.uid, w);
    var s = status();
    dropToast(bar, '', FLAME + '<span>' + esc(s.streak >= 2 ? tr('pm.toastHit', { n: s.streak }) : tr('pm.toastHit1')) + '</span>');
  }
  /* The pill under the strip, shared by the week-goal toast and the Top 5 toast (one id: a new one replaces the old). */
  function dropToast(bar, cls, inner){
    removeEl('pm-toast');
    var el = document.createElement('div');
    el.id = 'pm-toast'; el.className = 'pm-toast' + (cls ? ' ' + cls : ''); el.setAttribute('role', 'status');
    el.innerHTML = inner;
    el.style.top = Math.round(bar.bottom + 8) + 'px';
    el.style.left = Math.round(window.innerWidth / 2) + 'px';   // measured from the middle: a strip near the right edge must not squeeze it into a narrow column
    document.body.appendChild(el);
    pillZ(el);
    /* Centred under the strip, kept inside the window (the CSS centres on left with translateX(-50%)). */
    var half = el.offsetWidth / 2, cx = bar.left + bar.width / 2;
    el.style.left = Math.round(Math.max(8 + half, Math.min(window.innerWidth - 8 - half, cx))) + 'px';
    /* Moving it gives it more room, so its text can wrap less and the pill grows (a 390px phone: the Top 5 pill ran off the left edge): measure again. */
    half = el.offsetWidth / 2;
    el.style.left = Math.round(Math.max(8 + half, Math.min(window.innerWidth - 8 - half, cx))) + 'px';
    followStrip(el);
    setTimeout(function(){ el.remove(); }, cfg().toastSeconds * 1000);
  }
  /* "Top 5 in Period 4 this week!" — once per week, the first time the student is in it with the strip on screen.
     It waits while the week-goal toast is up (both on one tick: the goal first, this one a few seconds later). */
  function top5ToastMaybe(){
    var st = S;
    if(!st || !uiOn() || st.top5Week === calc.weekIdOf(today())) return;     // already shown this week: nothing to work out
    var t = top5Info(status().week.secs);
    if(!t || !t.top || st.top5Week === t.week) return;
    if(st.pendingToast || document.getElementById('pm-toast')) return;
    var bar = anchorRect();
    if(!bar) return;
    st.top5Week = t.week; ls('pm:t5:' + st.uid, t.week);
    dropToast(bar, 'pm-toast-top5', top5Mark('pm-top5-lg', tr('pm.top5Label')) + '<span>' + esc(tr('pm.top5Toast', { period: tr(PERIOD_KEYS[t.period]) })) + '</span>');
  }

  function recapMaybe(s){
    var c = cfg(), st = S;
    if(!uiOn() || !st || s.counted < c.recapMinSeconds) return;
    if(document.visibilityState === 'hidden') return;          // unseen: it would only start the gap and block the real one
    var bar = anchorRect();
    if(!bar) return;
    if(Date.now() - st.lastRecapAt < c.recapGapSeconds * 1000) return;
    st.lastRecapAt = Date.now();
    var u = status(), w = u.week, reach = weekReach(w), need = reach.more;
    var line = (w.isBreak ? tr('pm.recapWeekBreak', { done: mins(w.secs) }) : tr('pm.recapWeek', { done: mins(w.secs), goal: mins(w.goal) })) + ' ';
    if(w.isBreak) line = line.trim();
    else if(w.hit) line += u.streak >= 2 ? tr('pm.recapHit', { n: u.streak }) : tr('pm.recapHit1');
    else if(reach.out) line += tr('pm.weekOut');
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
    document.body.appendChild(el);
    pillZ(el);
    /* Right edge in line with the strip's, kept inside the window. */
    var rw = el.offsetWidth;
    el.style.left = Math.max(8, Math.min(Math.round(bar.right - rw), window.innerWidth - 8 - rw)) + 'px';
    followStrip(el);
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
    var again = function(){ if(!host_el.hidden && host_el.isConnected) host_el.innerHTML = progressHtml(); };
    if(!S.loaded && !S.loading) load().then(again);
    /* The rank tile needs the board AND the student's own numbers; draw again when the board arrives. */
    var st0 = S;
    loadBoard().then(function(b){ if(b && S === st0) again(); });
    loadWeek().then(function(b){ if(b && S === st0) again(); });
    host_el.innerHTML = progressHtml();
  }
  /* "N/total" by all-time minutes; nothing at all until the board has been read (or when it cannot be). */
  function rankTile(){
    var r = rankInfo();
    if(!r || r.total < 2) return '';
    return '<div class="pm-tile"><div class="pm-tile-h">' + esc(tr('pm.tileRank')) + '</div>'
      + '<div class="pm-tile-row"><b class="pm-today pm-rank">' + esc(tr('pm.tileRankVal', { n: r.n === null ? '–' : r.n, total: r.total })) + '</b></div>'
      + '<div class="pm-tile-sub">' + esc(tr(r.n === null ? 'pm.tileRankNone' : 'pm.tileRankSub')) + '</div></div>';
  }
  /* My place in my period's Top 5 this week; nothing until the week board has been read (or when it cannot be). */
  function top5Tile(weekSecs){
    var t = top5Info(weekSecs);
    if(!t) return '';
    var row, sub;
    if(t.top){ row = tr('pm.top5You', { n: t.n, period: tr(PERIOD_KEYS[t.period]) }); sub = tr('pm.top5Reset'); }
    else if(t.under){ row = tr('pm.top5Under', { n: t.min }); sub = t.toRank === 1 ? tr('pm.top5ToGoOne') : tr('pm.top5ToGo', { n: t.toRank }); }
    else { row = tr('pm.top5Need', { n: t.need }); sub = tr('pm.top5Sub', { period: tr(PERIOD_KEYS[t.period]) }); }
    return '<div class="pm-tile"><div class="pm-tile-h">' + esc(tr('pm.top5Label')) + '</div>'
      + '<div class="pm-tile-row">' + top5Mark('pm-top5-md' + (t.top ? '' : ' pm-top5-off'), tr(t.top ? 'pm.top5Label' : 'pm.top5Off')) + '<b>' + esc(row) + '</b></div>'
      + '<div class="pm-tile-sub">' + esc(sub) + '</div></div>';
  }
  function progressHtml(){
    var c = cfg(), st = status(), w = st.week, d = today();
    var reach = weekReach(w);
    var weekSub = w.isBreak ? tr('pm.tileWeekBreak') : w.hit ? tr('pm.tileWeekHit')
      : reach.out ? tr('pm.weekOut')
      : tr(st.streakBefore > 0 ? 'pm.tileWeekMore' : 'pm.tileWeekMore0', { n: reach.more });
    var tiles = '<div class="pm-tiles">'
      + '<div class="pm-tile"><div class="pm-tile-h">' + esc(tr('pm.tileWeek')) + '</div>'
      +   '<div class="pm-tile-row">' + ringSvg(w.goal && !w.isBreak ? w.secs / w.goal : 0, w.hit, 'pm-ring-lg') + '<b>' + esc(w.isBreak ? tr('pm.tileWeekValBreak', { done: mins(w.secs) }) : tr('pm.tileWeekVal', { done: mins(w.secs), goal: mins(w.goal) })) + '</b></div>'
      +   '<div class="pm-tile-sub">' + esc(weekSub) + '</div></div>'
      + '<div class="pm-tile"><div class="pm-tile-h">' + esc(tr('pm.tileStreak')) + '</div>'
      +   '<div class="pm-tile-row"><span class="pm-streak pm-streak-lg' + (w.hit ? ' pm-on' : '') + '">' + FLAME + '</span><b>' + esc(streakWords('pm.tileStreakVal', st.streak)) + '</b></div>'
      +   '<div class="pm-tile-sub">' + (st.longest > 0 ? esc(plural('pm.tileLongest', st.longest)) : '') + '</div></div>'   // "Longest: 0 weeks" under "No streak yet" says nothing; the line keeps its height (.pm-tile-sub min-height)
      + '<div class="pm-tile"><div class="pm-tile-h">' + esc(tr('pm.tileToday')) + '</div>'
      +   '<div class="pm-tile-row"><b class="pm-today">' + mins(dayTotal(d)) + '</b><span class="pm-today-u">' + esc(tr('pm.min')) + '</span></div>'
      +   '<div class="pm-tile-sub">' + esc(tr('pm.tileAll', { n: mins(allTimeSeconds()) })) + '</div></div>'
      + rankTile()
      + top5Tile(w.secs)
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

  /* ── Public surface ── */
  window.PM = {
    calc: calc, cfg: cfg,
    setHost: function(h){ host = h; },
    track: note,
    stripHtml: stripHtml, refreshStrip: refreshStrip, syncHeader: syncHeader,
    renderProgress: renderProgress,
    flush: flush, load: function(){ return sync() ? load() : Promise.resolve(); },
    status: function(){ return sync() ? status() : null; },
    _session: function(){ return session; }, _play: function(){ return play; },
    _rank: function(){ return sync() ? rankInfo() : null; },
    _top5: function(){ return sync() ? top5Info(status().week.secs) : null; }, _publishWeek: function(){ if(sync()) publishWeek(S); }, _loadWeek: function(){ return sync() ? loadWeek() : Promise.resolve(null); }, _loadBoard: function(){ return sync() ? loadBoard() : Promise.resolve(null); },
    _state: function(){ return S; }, _session: function(){ return session; }, _tick: tick, _media: media, _end: endSession, _buildOps: buildOps
  };
})();
