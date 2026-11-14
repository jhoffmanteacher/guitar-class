/* Every set always opens at the top (activateSet enforces this) — but a
   reload or browser back/forward can otherwise have the browser natively
   restore its own remembered scroll position before our JS runs, undoing
   that. Same fix as tabs/journey.js: hand scroll restoration back to us. */
if('scrollRestoration' in history) history.scrollRestoration = 'manual';

/* ── Error log (2026-11-13) ──
   Every error the safety net below shows its banner for (never the
   ResizeObserver note it skips) is also written, ANONYMOUSLY, to Firestore
   siteErrors/{autoId}, so the teacher console's Error log view
   (teacher-errors.js) shows a classroom failure the same day.
   A doc: kind ('error' | 'rejection'), message, file, line, col, stack (the
   top 3 frames), page (the hash route and the set id, no query string),
   version (the service worker's shell cache name), day (YYYY-MM-DD, this
   device's date), lang ('en' | 'es'). No uid, name, email or class period
   FIELD, and no time finer than the day.
   What is scrubbed out of the text (scrub()), before it is cut to the rules'
   cap: the signed-in account's OWN uid and email (any case), the email's
   part before the @ (any case) when it is 5+ characters or holds a digit,
   its whole display name (as written), and each single word of that name
   (split on anything not a letter or digit) as written when it is 5+
   letters and not on NOT_NAMES; any email address (also written %40); URL
   query strings; runs of 20+ letters and digits that hold both (uids,
   Firestore ids, tags); runs of 6+ digits (timestamps, long student
   numbers). A scrub never rewrites an earlier [user] / [email] / [id] / [n]
   / [query], and the name is matched in NFC form with any accent mark
   after it removed too.
   What is NOT: anyone else's name, a class period ("period 7"), a 5-digit
   number, what a student typed if an error message quotes it, and (since
   2026-11-13, review round 2) a SHORT name word quoted alone: "Max", "Will",
   "May", "Page" stay. That is the better trade: a short word scrubbed out of
   ordinary text ("Will not load. [user] crashed", "Fri [user] 14",
   "Math.[user]") is exactly what tells a reader whose error it was, while a
   short first name alone in a site error is rare and names nobody without a
   surname. NOT_NAMES are code and browser words a name can share ("Promise
   King" must leave Promise.all alone), never scrubbed as single words.
   Every string is also made well-formed text (clean(): half an emoji, the C0
   control characters but tab and line breaks, U+FFFE and U+FFFF become
   U+FFFD), and a finished doc the rules would refuse is dropped, never sent
   (fits()): the log shares Firestore's one write queue with the progress
   save.
   It must never make things worse for a student: every step is inside a
   try, nothing waits on it, it shows nothing, it writes only once the app
   itself has loaded Firestore (`db`) and someone is signed in (until then up
   to MAX entries wait in memory, re-checked every 5 s for at most 10
   minutes, then dropped), at most MAX writes and each message once per page
   load (after 100 different raw messages it stops looking at new ones), and
   the first refused or failed write (rules not published yet) turns it off,
   silently, for the rest of the page load. Its own failures are never
   logged. It never calls ensureDb() and never touches progress/{uid} or the
   save code. Rules: firestore.rules "ERROR LOG".
   test() is the console's "Send a test entry" (teacher-errors.js): it sends
   TEST_MESSAGE through this same path (scrub, caps, fits(), the one add())
   and answers what happened to it; it is never called on a student's page.
   Not covered: the Journey pages (tabs/*.html) do not load this file.
   Proof: tools/site-errors-sim.mjs (Node; run by checks.mjs 1de) and
   tools/site-errors-rules-test.mjs (the Firestore emulator). */
const SITE_ERRORS = (function(){
  const MAX = 5, POLL_MS = 5000, POLL_TRIES = 120, PRE = 1000, INT_MAX = 10000000;
  const CAP = { message: 300, file: 200, stack: 600, page: 120, version: 64 };
  const FIELDS = ['kind', 'message', 'file', 'line', 'col', 'stack', 'page', 'version', 'day', 'lang'];
  const TEST_MESSAGE = 'Error log test (sent from the console)';
  /* Single name words never scrubbed, whatever their length (lower case):
     code and browser words a student's name can share. */
  const NOT_NAMES = new Set(['promise', 'object', 'array', 'string', 'number', 'error', 'function', 'symbol', 'window', 'document', 'element', 'event', 'audio', 'image', 'storage', 'cache', 'request', 'response', 'worker', 'chrome', 'google', 'firebase', 'firestore', 'uncaught', 'cannot', 'failed', 'network', 'script', 'loading', 'module', 'chord', 'guitar', 'lesson', 'review', 'coach', 'tuner']);
  /* What a scrub has already written: never scrubbed again (a name word
     "user" must not make [user] into [[user]]). */
  const TOKEN = /(\[(?:user|email|id|n|query)\])/;
  /* Each entry: { d: the doc, late: no account was known when it was made,
     cut: the fields cut at their cap, done: test()'s answer, or null }. */
  const queue = [], seen = new Set(), rawSeen = new Set();
  let used = 0, off = false, offCode = '', sending = false, pollT = null, polls = 0, verP = null;
  /* Every unpaired surrogate (half an emoji, from code that sliced one)
     becomes U+FFFD. Firestore cannot store a string that is not well-formed:
     the SDK retries such a write for ever, and the student's progress save
     queued behind it never lands. The C0 controls (but tab, line feed and
     carriage return) and U+FFFE / U+FFFF go too: Node's transport takes them,
     a browser's was never tested. */
  function clean(s){
    return String(s == null ? '' : s).replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF]/g, m => m.length === 2 ? m : '\uFFFD')
      .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '\uFFFD');
  }
  /* Cut to n characters, never splitting a surrogate pair. */
  function cut(s, n){
    s = String(s == null ? '' : s);
    if(s.length <= n) return s;
    s = s.slice(0, n - 1);
    if(/[\uD800-\uDBFF]$/.test(s)) s = s.slice(0, -1);
    return s + '…';
  }
  function scrub(s, who){
    s = String(s == null ? '' : s);
    /* A huge message is cut first (keeping the regexes cheap), dropping the
       word the cut landed in, so half an email can never survive it. With no
       space at all there is no word to drop: only an email cut at the end goes. */
    if(s.length > PRE){
      s = s.slice(0, PRE);
      s = /\s/.test(s) ? s.replace(/\S*$/, '') : s.replace(/[A-Za-z0-9._%+-]*(?:@|%40)[A-Za-z0-9.-]*$/, '');
    }
    s = clean(s);
    try{ const o = location.origin; if(o && o !== 'null') s = s.split(o).join(''); }catch(_){}
    s = s.replace(/[A-Za-z0-9._%+-]+(?:@|%40)[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g, '[email]');
    /* After the emails, so a whole address still reads [email], not [user]@domain. */
    if(who) s = who(s);
    s = s.replace(/\?(?=[^\s'"()<>]*=)[^\s'"()<>]*/g, m => { const tail = /(?::\d+){1,2}$/.exec(m); return '?[query]' + (tail ? tail[0] : ''); });
    s = s.replace(/[A-Za-z0-9]{20,}/g, m => (/\d/.test(m) && /[A-Za-z]/.test(m)) ? '[id]' : m);
    s = s.replace(/\d{6,}/g, '[n]');
    return s;
  }
  /* The signed-in account's own details, as whole words (3+ characters),
     in NFC form: its uid and email in any case; the email's part before the
     @ in any case when it is 5+ characters or holds a digit (so max@… leaves
     Math.max alone, msmith27@… still goes); its whole display name as
     written; each word of the name (split on anything not a letter or digit:
     "Smith, Max", "Mary-Jane O'Brien") as written, only when it is 5+ letters
     and not on NOT_NAMES, so a student named Will Page never turns "Will not
     load. Page crashed" into a giveaway. An accent mark right after a match
     goes with it. null when nobody is signed in. */
  function whoScrub(){
    try{
      const u = auth && auth.currentUser;
      if(!u) return null;
      const nfc = w => String(w || '').normalize('NFC').trim();
      const anyCase = [], asWritten = [];
      const add = (list, w) => { w = nfc(w); if(w.length >= 3) list.push(w); };
      const local = nfc(String(u.email || '').split('@')[0]);
      add(anyCase, u.uid); add(anyCase, u.email);
      if(local.length >= 5 || /\d/.test(local)) add(anyCase, local);
      const name = nfc(u.displayName);
      add(asWritten, name);
      name.split(/[^\p{L}\p{N}\p{M}]+/u).forEach(w => { if(w.replace(/\p{M}/gu, '').length >= 5 && !NOT_NAMES.has(w.toLowerCase())) add(asWritten, w); });
      const res = [[anyCase, 'giu'], [asWritten, 'gu']].filter(([list]) => list.length).map(([list, flags]) => new RegExp('(^|[^\\p{L}\\p{N}\\p{M}])(' + list.sort((a, b) => b.length - a.length).map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\p{M}*(?![\\p{L}\\p{N}\\p{M}])', flags));
      if(!res.length) return null;
      /* Odd parts of the split are earlier tokens, left as they are. */
      return s => String(s).normalize('NFC').split(TOKEN).map((part, i) => i % 2 ? part : res.reduce((t, re) => t.replace(re, (m, pre) => pre + '[user]'), part)).join('');
    }catch(_){ return null; }
  }
  /* A field cut at its cap while nobody was signed in can end in half a
     name ("… Maxim…"), which the account scrub at send time cannot
     recognise: its last, unfinished word goes, at most 40 letters (a field
     that is one long run of letters keeps the rest). Only for a field that
     was really cut (entry.cut), so "Loading…" stays "Loading…". */
  function dropCutWord(t){
    return t.slice(-1) === '…' ? t.slice(0, -1).replace(/[\p{L}\p{N}\p{M}]{1,40}$/u, '') + '…' : t;
  }
  function int(n){
    const v = Math.floor(Number(n));
    /* `v || 0` turns -0 into 0: the SDK sends -0 as a double, which the rules' `is int` refuses. */
    return (Number.isFinite(v) && v >= 0 && v <= INT_MAX) ? (v || 0) : 0;
  }
  /* The top 3 frames of a stack (Chrome "at …" lines, Firefox/Safari "fn@url:line:col"). */
  function stackTop(st){
    return String(st || '').split('\n').map(l => l.trim()).filter(l => /^at\s/.test(l) || /@\S+:\d+/.test(l)).slice(0, 3).join('\n');
  }
  function pageNow(){
    let p = '', set = '', con = false;
    try{ p = String(location.hash || '').split(/[?&]/)[0].replace(/[^A-Za-z0-9_\-\/#.]/g, ''); }catch(_){}
    try{ if(typeof lastSetId !== 'undefined' && lastSetId) set = String(lastSetId).replace(/[^A-Za-z0-9_\-]/g, ''); }catch(_){}
    try{ con = IS_TEACHER_MODE === true; }catch(_){}
    return (con ? 'console ' : '') + (p || '#') + (set ? ' set ' + set : '');
  }
  function dayNow(){
    const d = new Date();
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  /* The rules' day test: YYYY-MM-DD, a real date, at most one day from the
     UTC date (the rules use the server's clock; here this device's stands in,
     so this only refuses what the rules surely would). */
  function dayOk(day){
    if(typeof day !== 'string' || !/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(day)) return false;
    const y = +day.slice(0, 4), m = +day.slice(5, 7), dd = +day.slice(8, 10);
    const t = Date.UTC(y, m - 1, dd), back = new Date(t);
    if(back.getUTCFullYear() !== y || back.getUTCMonth() !== m - 1 || back.getUTCDate() !== dd) return false;
    const now = new Date();
    return Math.abs(t - Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())) <= 86400000;
  }
  /* The finished doc against the same limits firestore.rules "ERROR LOG"
     enforces (the ten fields, each type, each cap in UTF-16 units, the two
     lists, the day), and well-formed text. */
  function fits(d){
    try{
      const keys = Object.keys(d);
      if(keys.length !== FIELDS.length || FIELDS.some(k => !keys.includes(k))) return false;
      if((d.kind !== 'error' && d.kind !== 'rejection') || (d.lang !== 'en' && d.lang !== 'es')) return false;
      for(const k in CAP) if(typeof d[k] !== 'string' || d[k].length > CAP[k] || clean(d[k]) !== d[k]) return false;
      if(!d.message.length) return false;
      for(const k of ['line', 'col']) if(!Number.isInteger(d[k]) || Object.is(d[k], -0) || d[k] < 0 || d[k] > INT_MAX) return false;
      return dayOk(d.day);
    }catch(_){ return false; }
  }
  function langNow(){
    try{ return (typeof getLang === 'function' && getLang() === 'es') ? 'es' : 'en'; }catch(_){ return 'en'; }
  }
  /* The version this page runs: the newest "guitar-class-YYYY-MM-DD-hash"
     shell cache, without its prefix; " +N" when N older ones are still there
     (an update mid-way), "none" with no shell cache yet (a first visit),
     "unknown" when the Cache API is missing or fails. Read once per load. */
  function version(){
    if(verP) return verP;
    try{
      verP = (typeof caches !== 'undefined' && caches && typeof caches.keys === 'function')
        ? Promise.resolve(caches.keys()).then(keys => {
            try{
              const v = (keys || []).filter(k => /^guitar-class-\d{4}-\d{2}-\d{2}-[0-9a-f]+$/.test(k)).sort();
              return v.length ? v[v.length - 1].slice(13) + (v.length > 1 ? ' +' + (v.length - 1) : '') : 'none';
            }catch(_){ return 'unknown'; }
          }, () => 'unknown')
        : Promise.resolve('unknown');
    }catch(_){ verP = Promise.resolve('unknown'); }
    return verP;
  }
  /* Gives test() its answer; a no-op for a real error's entry. */
  function fin(e, r){
    try{ if(e && e.done) e.done(r); }catch(_){}
  }
  function stop(er){
    off = true;
    try{ offCode = String((er && (er.code || er.message)) || 'error').slice(0, 80); }catch(_){ offCode = 'error'; }
    for(const e of queue.splice(0)) fin(e, { state: 'off', code: offCode });
    if(pollT){ try{ clearTimeout(pollT); }catch(_){} pollT = null; }
  }
  function ready(){
    try{ return !!(db && auth && auth.currentUser); }catch(_){ return false; }
  }
  /* One write at a time: the next is sent only after the last one landed,
     so a page whose write is refused (rules not published) makes exactly
     one refused write, then stop() turns the log off. */
  function flush(){
    try{
      if(off || sending || !queue.length) return;
      if(!ready()){
        if(pollT) return;
        if(polls >= POLL_TRIES){ for(const e of queue.splice(0)) fin(e, { state: 'not-ready' }); return; }
        pollT = setTimeout(() => { pollT = null; polls++; flush(); }, POLL_MS);
        return;
      }
      sending = true;
      /* The Cache API answers at once; 3 s is only so a stuck one can
         never hold the log. */
      Promise.race([version(), new Promise(r => setTimeout(() => r('unknown'), 3000))]).then(v => {
        const next = () => {
          let e = null;
          try{
            if(off) return;
            if(!queue.length || !ready()){ sending = false; flush(); return; }
            e = queue.shift();
            const d = e.d, who = whoScrub();
            /* Re-cut after the scrub: [user] is longer than a 5-letter name. */
            if(who) for(const k of ['message', 'file', 'stack', 'page']) d[k] = cut(who(e.late && e.cut.includes(k) ? dropCutWord(d[k]) : d[k]), CAP[k]);
            if(!d.message) d.message = '(no message)';
            d.version = cut(clean(v), CAP.version);
            /* A doc the rules would refuse, or one that is not well-formed text,
               is dropped here, silently, and never sent: the log shares
               Firestore's one write queue with the progress save. */
            if(!fits(d)){ fin(e, { state: 'dropped' }); next(); return; }
            const p = db.collection('siteErrors').add(d);
            if(p && typeof p.then === 'function') p.then(ref => { fin(e, { state: 'sent', id: ref && ref.id, doc: d }); next(); }, er => { stop(er); fin(e, { state: 'failed', code: offCode }); });
            else { fin(e, { state: 'sent', doc: d }); next(); }
          }catch(er){ stop(er); fin(e, { state: 'failed', code: offCode }); }
        };
        next();
      }).then(null, stop);
    }catch(_){ stop(); }
  }
  /* Builds the doc and queues it. '' when queued; otherwise why not: 'off',
     'cap' (MAX used), 'repeat', 'storm' (100 raw messages seen), 'error'. */
  function enqueue(kind, ev, done){
    try{
      if(off) return 'off';
      if(used >= MAX) return 'cap';
      kind = kind === 'error' ? 'error' : 'rejection';
      let msg = '', file = '', line = 0, col = 0, st = '';
      if(kind === 'error'){
        const er = ev && ev.error;
        msg = (ev && ev.message) || (er && er.message) || '';
        file = (ev && ev.filename) || ''; line = ev && ev.lineno; col = ev && ev.colno;
        st = er && er.stack;
      } else {
        const r = ev && ev.reason;
        if(r && typeof r === 'object' && typeof r.message === 'string'){
          msg = (r.name ? String(r.name) + ': ' : '') + r.message + (r.code ? ' [' + String(r.code) + ']' : '');
          st = r.stack;
        } else if(typeof r === 'string') msg = r;
        else msg = 'Rejected with ' + (r === null ? 'null' : typeof r);
      }
      /* A repeat is turned away on its raw text, before any scrubbing (a
         long message costs the regexes a few ms each time). Kept small: after
         100 different raw messages in one page load (a storm whose text keeps
         changing) every new one is turned away unscrubbed. */
      const rawKey = kind + '|' + String(msg).slice(0, 500);
      if(rawSeen.has(rawKey)) return 'repeat';
      if(rawSeen.size < 100) rawSeen.add(rawKey); else return 'storm';
      st = stackTop(st);
      if(!file && st){
        const m = /\(?([^\s()]+):(\d+):(\d+)\)?\s*$/.exec(st.split('\n')[0]);
        if(m){ file = m[1]; line = m[2]; col = m[3]; }
      }
      /* cut() to the field's cap, noting which fields were really cut. */
      const wasCut = [], cutAt = (k, t) => { t = String(t); if(t.length > CAP[k]) wasCut.push(k); return cut(t, CAP[k]); };
      /* The account's own details go BEFORE the cut too, so the cut can never
         leave half a name behind (send time scrubs again, for a sign-in that
         came later). */
      const who = whoScrub();
      const doc = {
        kind,
        message: cutAt('message', scrub(msg, who)) || '(no message)',
        file: cutAt('file', scrub(String(file).replace(/[?#].*$/, ''), who)),
        line: int(line), col: int(col),
        stack: cutAt('stack', scrub(st, who)),
        page: cutAt('page', scrub(pageNow(), who)),
        version: '',
        day: dayNow(),
        lang: langNow(),
      };
      const key = kind + '|' + doc.message;
      if(seen.has(key)) return 'repeat';
      seen.add(key); used++;
      queue.push({ d: doc, late: !who, cut: wasCut, done: done || null });
      flush();
      return '';
    }catch(_){ return 'error'; }
  }
  function report(kind, ev){
    try{ enqueue(kind, ev, null); }catch(_){}
  }
  /* The console's test: TEST_MESSAGE through the same path as a real error.
     Resolves (never rejects) with { state }: 'sent' (with the Firestore id
     and the doc as sent), 'failed' (refused or failed: the log is now off on
     this page; code), 'dropped' (fits() refused it), 'not-ready', or why it
     was not queued ('off' with the code that turned it off, 'cap', 'repeat',
     'storm', 'error'). */
  function test(){
    return new Promise(resolve => {
      let why = 'error';
      try{ why = enqueue('error', { message: TEST_MESSAGE }, resolve); }catch(_){}
      if(why) resolve({ state: why, code: offCode });
    });
  }
  /* For tools/site-errors-sim.mjs: how much this page load has used. */
  function stats(){
    return { off, used, max: MAX, rawSeen: rawSeen.size, queued: queue.length };
  }
  return { report, test, stats, TEST_MESSAGE };
})();

/* ── Global safety net ──
   If a script throws or a promise rejects unhandled, a student shouldn't be
   left staring at a half-broken page with no idea what happened. Show one
   small, dismissable banner pointing them to a refresh (their saved progress
   lives in Firestore, so a reload is safe), and log details to the console
   for troubleshooting. Guarded so the handler can never spiral on itself.
   Since 2026-11-13 each such error also goes, anonymously, to the error log
   (SITE_ERRORS above), after the banner; the ResizeObserver note does not. */
(function(){
  let shown = false;
  function showBanner(){
    if (shown) return; shown = true;
    try {
      const d = document.createElement('div');
      d.setAttribute('role','alert');
      d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;'
        + 'max-width:520px;margin:0 auto;padding:12px 44px 12px 16px;border-radius:12px;'
        + 'background:#514a7d;color:#fff;font:14px/1.45 system-ui,-apple-system,sans-serif;'
        + 'box-shadow:0 6px 24px rgba(0,0,0,.28)';
      const msg = document.createElement('span');
      // i18n.js loads before app.js and this only fires on an error event, so
      // t() is there — same as the offline banner below, which it mirrors.
      msg.setAttribute('data-i18n', 'err.body');
      msg.textContent = t('err.body');
      const refresh = document.createElement('button');
      refresh.setAttribute('data-i18n', 'err.refresh');
      refresh.textContent = t('err.refresh');
      refresh.style.cssText = 'margin-left:4px;padding:3px 12px;border:0;border-radius:14px;'
        + 'background:#fff;color:#514a7d;font-weight:600;cursor:pointer';
      /* A save still unsent when Refresh is pressed (2026-10-12) used to be
         dropped by the reload without a word. Send it first, bounded like
         Sign out (flushBeforeLeaving); if it still hasn't landed, say so and
         make the button "Refresh anyway". Anything going wrong in here — the
         error that raised this banner may have come before the save code
         even loaded — falls back to the plain reload. */
      let anyway = false;
      refresh.onclick = () => {
        let pending = false;
        try { pending = !anyway && hasUnsavedWrites(); } catch(_) {}
        if (!pending) { location.reload(); return; }
        refresh.disabled = true;
        refresh.setAttribute('data-i18n', 'save.saving');
        refresh.textContent = t('save.saving');
        flushBeforeLeaving(4000).then(saved => {
          if (saved) { location.reload(); return; }
          anyway = true;
          refresh.disabled = false;
          msg.setAttribute('data-i18n', 'save.notSavedYet');
          msg.textContent = t('save.notSavedYet');
          refresh.style.marginLeft = '8px';
          refresh.setAttribute('data-i18n', 'save.refreshAnyway');
          refresh.textContent = t('save.refreshAnyway');
        }).catch(() => location.reload());
      };
      const close = document.createElement('button');
      close.setAttribute('data-i18n-attr', 'aria-label:offline.dismiss');
      close.setAttribute('aria-label', t('offline.dismiss'));
      close.textContent = '×';
      close.style.cssText = 'position:absolute;top:8px;right:12px;background:none;border:0;'
        + 'color:#fff;font-size:1.25rem;line-height:1;cursor:pointer';
      close.onclick = () => d.remove();
      d.append(msg, refresh, close);
      (document.body || document.documentElement).appendChild(d);
    } catch(_) { /* never let the safety net crash */ }
  }
  /* "ResizeObserver loop completed with undelivered notifications" is the
     browser noting that an observer's callback resized something and the
     rest waits a frame — nothing threw and nothing is broken. It fires on
     big window resizes (entering full screen, 2026-10-13) and was putting
     this banner over a working page. Logged as a warning, no banner. */
  window.addEventListener('error', e => {
    if (!e.error && /ResizeObserver loop/.test(e.message || '')) { console.warn('[guitar-class]', e.message); return; }
    console.error('[guitar-class] error:', e.error || e.message); showBanner();
    SITE_ERRORS.report('error', e);
  });
  window.addEventListener('unhandledrejection', e => {
    console.error('[guitar-class] unhandled rejection:', e.reason); showBanner();
    SITE_ERRORS.report('rejection', e);
  });
})();

/* ── Offline banner ──
   sw.js already serves the cached shell while offline — this just tells the
   student why videos/saving are paused, and clears itself on reconnect.
   Mirrors the safety-net banner above (same look, same dismiss pattern). */
(function(){
  let el = null;
  function showOfflineBanner(){
    if (el) return;
    try {
      const d = document.createElement('div');
      d.setAttribute('role','status');
      d.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:99999;'
        + 'max-width:520px;margin:0 auto;padding:12px 44px 12px 16px;border-radius:12px;'
        + 'background:#514a7d;color:#fff;font:14px/1.45 system-ui,-apple-system,sans-serif;'
        + 'box-shadow:0 6px 24px rgba(0,0,0,.28)';
      const msg = document.createElement('span');
      msg.setAttribute('data-i18n', 'offline.body');   // setLang's applyI18n(document) sweep retranslates a banner that's up during a language switch
      msg.textContent = t('offline.body');
      const close = document.createElement('button');
      close.setAttribute('data-i18n-attr', 'aria-label:offline.dismiss');
      close.setAttribute('aria-label', t('offline.dismiss'));
      close.textContent = '×';
      close.style.cssText = 'position:absolute;top:8px;right:12px;background:none;border:0;'
        + 'color:#fff;font-size:1.25rem;line-height:1;cursor:pointer';
      close.onclick = () => hideOfflineBanner();
      d.append(msg, close);
      (document.body || document.documentElement).appendChild(d);
      el = d;
    } catch(_) { /* never let the banner crash the page */ }
  }
  function hideOfflineBanner(){
    if (el) { el.remove(); el = null; }
  }
  window.addEventListener('offline', showOfflineBanner);
  window.addEventListener('online', hideOfflineBanner);
})();

/* ── Firebase init ── */
// The Firebase SDK + config load as separate <script>s. On some school
// networks a content filter blocks gstatic.com, so they may never arrive —
// guard against that instead of crashing the whole page silently.
let auth = null, db = null;
const firebaseReady = typeof firebase !== 'undefined' && typeof firebaseConfig !== 'undefined';
if (firebaseReady) {
  firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  // NOTE: db (Firestore) is intentionally NOT initialized here. The Firestore
  // SDK (~100 KB) is loaded on demand by ensureDb() the first time we read or
  // write progress — i.e. only after sign-in — so the sign-in screen paints
  // without it. See index.html.
} else {
  showFirebaseLoadError();
}

/* ── Firestore SDK: load on demand ──
   Loads firebase-firestore-compat.js (once) and initializes `db`. Called
   before any read/write. signIn() pre-warms this during the Google popup so
   it's usually ready by the time onAuthStateChanged fires. */
let _firestoreLoad = null;
function loadFirestoreSdk(){
  if(_firestoreLoad) return _firestoreLoad;
  _firestoreLoad = new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js';
    s.onload  = ()=>resolve();
    // Remove the failed tag so a later retry (flushSave's bounded backoff)
    // doesn't pile up a fresh orphaned <script> in <head> on every attempt.
    s.onerror = ()=>{ s.remove(); _firestoreLoad=null; reject(new Error('Firestore SDK failed to load')); };
    document.head.appendChild(s);
  });
  return _firestoreLoad;
}
async function ensureDb(){
  if(db) return db;
  if(!firebaseReady) return null;
  await loadFirestoreSdk();
  db = firebase.firestore();
  return db;
}
let currentUser = null;
// Scopes a per-device localStorage key to the signed-in student, so a shared
// Chromebook can't have one student's practice log or last-place bleed into
// the next student's Firestore doc. Falls back to an unscoped device bucket
// when nobody's signed in (e.g. before auth resolves).
function _uidKey(base){ return (currentUser && currentUser.uid) ? base+':'+currentUser.uid : base; }
let progress    = {};
let responses   = {};
let completed   = {};
let classActivities = {};   // In-Class Activities completion: id → true (own top-level Firestore field, not a `completed` key — see the work order this shipped from)
let exitChecks  = {};   // Exit-check results: id -> { score, total, picks, at, attempts } (see caCheckBodyHtml / class-activities.js kind:'check')
let games       = {};   // per-game bests from the games arcade (coach.js) — its own save category
let streak      = { count:0, lastDay:null };   // site-wide practice streak, independent of any one game
/* Day streaks never break over a weekend (Jonathan, 2026-11-13: a streak only
   needs school days, Monday to Friday). Shared by the three day streaks: the
   site-wide practice streak above (bumpPracticeStreak in app/save.js, the
   Daily 5 chip in app/lesson.js), the arcade streak (games.meta.streak,
   coach-hub.js) and Riff Roulette's (games.rr, coach-strum.js); the arcade
   parts reach them through arcadeStreakContinues / arcadeStreakAlive
   (coach-hub.js), which fall back to the old rule on a page loaded before
   these existed. Here, in the first app part, because app/save.js is the
   earliest part that calls them and the arcade parts load later. Pure: both arguments are the local
   calendar-day strings dayStr() makes ('YYYY-MM-DD').
   dayStreakContinues(lastDay, today): playing today adds a day to the streak,
   because every day strictly between the two is a Saturday or Sunday.
   Fri -> Mon continues; Fri -> Tue does not; Thu -> Mon does not (Friday was
   missed). Playing on a weekend still adds a day: Fri, Sat, Mon is 3 days.
   False for the same day (callers check that first), a last day after today
   (a wrong clock) and a missing or malformed day. School holidays are NOT
   skipped, only Saturdays and Sundays. Dates are built at local noon from
   their parts, never by adding 86,400,000 ms to a midnight, so a
   daylight-saving change cannot shift a day.
   dayStreakAlive(lastDay, today): the streak is still winnable today (kept up
   today, or playing today would continue it).
   checks.mjs 1dj runs both over a table of dates and fails on any other
   "yesterday or reset" copy. */
function streakDayDate(s){
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(typeof s === 'string' ? s : '');
  if(!m) return null;
  const d = new Date(+m[1], +m[2] - 1, +m[3], 12);
  return (d.getFullYear() === +m[1] && d.getMonth() === +m[2] - 1 && d.getDate() === +m[3]) ? d : null;
}
function dayStreakContinues(lastDay, today){
  const a = streakDayDate(lastDay), b = streakDayDate(today);
  if(!a || !b || a.getTime() >= b.getTime()) return false;
  for(let d = new Date(a.getFullYear(), a.getMonth(), a.getDate() + 1, 12); d.getTime() < b.getTime(); d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1, 12)){
    const w = d.getDay();
    if(w !== 0 && w !== 6) return false;
  }
  return true;
}
function dayStreakAlive(lastDay, today){
  return (!!streakDayDate(today) && lastDay === today) || dayStreakContinues(lastDay, today);
}
let gamesAccessOn = true; // whether the Games arcade is available to THIS student (teacher-controlled; see loadClassConfig)
/* Consented mic recordings (coach.js micRec*): the teacher's switch and
   how many takes are saved so far. Fail CLOSED — anything short of a
   successful read of both leaves collection off, so nobody is asked. */
let micSampling = { on: false, max: 0 };
let micTakesCount = Infinity;
let accountPaused = false; // teacher put this student on hold (see loadClassConfig / showPausedScreen)
/* Which class period this student is in — 4, 7, or CAS, nothing else. Two
   halves, deliberately: `studentPeriod` is the student's own answer, living
   on their progress doc (which only they can write); `periodOverride` is
   the teacher's correction, read from config/class. They are split because
   firestore.rules gives the teacher READ-only access to progress/{uid} on
   purpose (see the comment block in that file), so the console has no way
   to fix a wrong tap in place. Effective period = override || own answer.
   See maybeShowPeriodPicker(). */
let studentPeriod = '';    // progress/{uid}.period — '4' | '7' | 'CAS' | '' (not answered yet)
let periodOverride = '';   // config/class.periodOverrides[uid] — teacher's correction, read-only here
/* Practice minutes (practice-minutes.js, settings in practice-minutes-config.js).
   The engine is page-agnostic — the Journey pages host it too — so this is the
   whole of what it asks of the main site: who is signed in (never the ?teacher
   console, and only a real Firebase user, so the localhost dev bypass counts
   nothing), the Firestore handle, and "draw the UI". `period` below is read by the Top 5 (2026-11-04): this
   week's minutes are ranked inside the student's class period. Every callback reads app state when called, so nothing here runs before
   sign-in. practice-minutes.js loads after this file and picks the object up. */
window.PM_HOST = {
  ui: true,
  /* accessLocked (the access screen, 2026-11-13): no user, so nothing counts, loads or retries for an account the rules refuse. */
  user: () => ((typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE) || accountPaused || accessLocked) ? null : (auth && auth.currentUser) || null,
  db: () => ensureDb(),
  period: () => periodOverride || studentPeriod || ''
};
/* config/class.moduleOpenThrough[uid] — teacher's "Open through Module N"
   (teacher.js Manage view), 2..12, or 0 for no override. Opens modules
   2..N's cross-module gate (isModuleGateLocked, <= N) and every set of the
   SKIPPED modules 1..N-1 (isSetLocked, < N) — module N itself keeps its
   set-to-set order. Read-only here: nothing about it is ever written to the
   student's progress doc. Cached per uid like periodOverride, so a blocked
   read keeps the last known value instead of snapping modules shut. */
let moduleOpenThrough = 0;
/* The open-through actually in force: the student's own value or the
   class-wide floor CLASS_OPEN_THROUGH (config-main.js), whichever is higher. */
function classOpenThrough(){
  return Math.max(moduleOpenThrough || 0, (typeof CLASS_OPEN_THROUGH === 'number') ? CLASS_OPEN_THROUGH : 0);
}
let hiddenActivityIds = {}; // In-Class Activities the teacher has temporarily hidden (see loadClassConfig) — id -> true
/* Activities the teacher gave to particular students only (console board,
   "Who" picker → config/class.activityStudents, id -> { uid -> true }).
   Kept here already reduced to THIS student: id -> true (one of mine) or
   false (someone else's), so the cache never holds other students' uids.
   An id that isn't here is a whole-class card. Read by caForMe(). */
let activityForMe = {};
let activityDates = {}; // In-Class Activities release dates, teacher-set in the console (see loadClassConfig) — id -> 'YYYY-MM-DD'
let activityTitles = {}; // In-Class Activity renames, teacher-set in the console (see loadClassConfig / caTitle) — id -> { en, base }
let activityNumbers = {}; // LEGACY In-Class Activity renumbering — see caBoardOrder's fallback note; read only while activityBoard is unseeded
/* The activity board — config/class.activityBoard, written by the teacher
   console's two-column Class activities board (teacher.js). id -> { module,
   pos }: `module` is a MODULE_MANIFEST number, or 0 for the board's Unsorted
   holding pen, and `pos` is 1..N within that module. An activity with an
   entry is ASSIGNED — placed in the course, and a candidate for In-Class
   Activities once its release date arrives. One with no entry has only
   been pushed to the site; it is Built, not placed, and no student sees it.

   This is what drives BOTH the order students read the cards in and the
   "#N" number before their titles (caBoardOrder / caNumber), replacing the shipped
   `number` field and the console's old activityNumbers overrides. */
let activityBoard = {};
/* config/class.activityBoardSeeded — has the console ever written a board?
   It has to be its own flag rather than "activityBoard is non-empty",
   because those two states differ in the one case that matters: a board the
   teacher has emptied by un-assigning every card means NOTHING is placed
   (no student sees anything), while a board that was never written means
   the feature hasn't started yet and every card should keep rendering the
   way it did before. Guessing from emptiness would flip the second reading
   into the first the moment the last card came off. */
let activityBoardOn = false;
let activityClears = {}; // Per-student activity-gate clears, teacher-set in the console (see loadClassConfig / caBlockers) — uid -> { activityId -> true }
/* Activities the teacher has retired from the console — config/class's
   archivedActivities (tucked away, restorable with its date/rename/number
   intact) and deletedActivities (gone, and everything the console set for it
   wiped). Students draw no distinction between the two, so the two maps are
   MERGED into one id -> true set here; the console keeps them apart because
   that is where "can I get it back the way it was?" is answered. */
let retiredActivityIds = {};
/* Activities the teacher has marked Optional from the console —
   config/class.optionalActivities, id -> true. An optional card shows on
   In-Class Activities like any other (same date, board and Hidden rules —
   caIsVisible doesn't read this), wears an "Optional" tag, and never blocks
   the site: caBlockers() skips it. Cached like the hidden map, for the same
   "must not fail open" reason — a flaky read that reset this to {} would
   turn every optional card back into a lock. */
let optionalActivityIds = {};
/* Practice cards the teacher switched to "Play Along now" on the console
   board — config/class.playAlongActivities, id -> true (2026-10-02,
   Jonathan: "can we set some visible even if they don't have a release
   date?"). The Songs page's Play Along list shows such a card whether or
   not its date has arrived; nothing else changes — it stays off In-Class
   Activities and it never blocks (caIsVisible and caBlockers don't read
   this). See caIsPlayAlongOnly(). Cached like the other maps so a flaky
   read doesn't empty the list a student was just using. */
let playAlongActivityIds = {};
/* Where each movable song lives, set by the console's "Move to Songs" /
   "Move to Class activities" buttons (config/class.songLibrary, id -> true
   for the Songs page, false for Class activities). Overrides the card's
   `library` field — see caIsLibraryCard. Cached like the board, so a flaky
   read doesn't put a moved song back where it started. */
let songLibraryIds = {};
/* Teacher-only cards the console has moved to Class activities
   (config/class.classSongs, id -> true — the "Move to Class activities"
   button on the console's Teacher view songs tab). A moved one is an
   ordinary class activity: on the board, assigned and dated like any other
   — see caIsTeacherSong. Cached like songLibraryIds. */
let classSongIds = {};
/* The "Keep practicing" row at the top of In-Class Activities —
   config/class.activityPins, an ORDERED array of activity ids, at most
   CA_PINS_MAX (2026-10-10, Jonathan: he reuses some cards on many days —
   the song play-along cards, ca-23 — and wants them one click away without
   re-dating anything). A pin stands in for the release date for THAT ROW
   ONLY: the card still has to be placed on the board, not Hidden, not
   archived/deleted, and not an exit check (caPinReachable). It is not read
   by caIsVisible or by any blocker rule, so a pin never puts a card on the
   dated list, never counts as one of Today's activities and never gates anyone; it
   writes no completion data. Cached like the other maps. */
let activityPins = [];
const CA_PINS_MAX = 4;
let saveTimer   = null;

/* ── Lazy module loading ──
   Module data files (module-N.js) are no longer loaded up front. Each is
   fetched on demand the first time its module is opened, then its panels are
   built into the DOM. This keeps first load light on weak Wi-Fi / slow
   Chromebooks: we parse one module's data and build one module's panels
   instead of all eight. The service worker still caches every module file
   (after the first page load following an update: sw.js precacheRest), so
   opening a not-yet-loaded module while offline keeps working. */
const _moduleLoads = {};           // num -> Promise (dedupes concurrent loads)
const _modulesRendered = new Set();
function loadModuleData(num){
  num = parseInt(num);
  if(_moduleLoads[num]) return _moduleLoads[num];
  _moduleLoads[num] = new Promise((resolve,reject)=>{
    const s = document.createElement('script');
    s.src = `module-${num}.js`;
    s.onload  = ()=>resolve();
    // Drop the promise so a later visit retries — and remove the failed tag
    // with it, or every retry orphans another dead <script> in <head>
    // (loadFirestoreSdk does the same for the same reason).
    s.onerror = ()=>{ s.remove(); delete _moduleLoads[num]; reject(new Error('module '+num+' failed to load')); };
    document.head.appendChild(s);
  });
  return _moduleLoads[num];
}
/* ── Deferred scripts: loaded on first use, not on every page load ──
   index.html used to ship 1.29 MB of first-party JS before the auth wall
   could do anything, and two of the biggest pieces are things most page
   loads never touch: coach.js (375 KB — the games arcade and the Listening
   Coach, first needed on a click) and teacher.js (99 KB — meaningful only
   with ?teacher). On a school Chromebook's first visit that is most of the
   wait, and it is spent on code the student may never run.

   coach.js is still cached by the service worker (sw.js precacheRest fills it
   in after the first page load following an update), so its deferred fetch
   is a cache hit for anyone who has loaded the site before, online or off.
   teacher.js is NOT (2026-10-12 — sw.js ASSETS leaves it out so students
   don't re-download it on every deploy; checks.mjs SHELL_NOT_PRECACHED):
   the console's first load fetches it from the network, and the fetch
   handler caches it from then on.

   Safe because every OTHER reference to these files across app.js is
   `typeof x === 'function'` guarded, and each of those is a teardown call
   (coachClose, gamesStopMic, gamesClosePanel, coachInterrupt,
   gamesResetForUser): with the script unloaded there is nothing running to
   tear down, so skipping is the correct behaviour, not a silent failure.
   The render-time helpers the step ladder calls unguarded — coachBtnHtml,
   coachChordBtnRowHtml, coachSkillsAttr, coachSkillBest — all live in THIS
   file, so the renderer never depends on coach.js at all. What's left is
   the handful of entry points below, which load it and then act. */
const _lazyScripts = {};
function loadScriptOnce(src){
  if(_lazyScripts[src]) return _lazyScripts[src];
  _lazyScripts[src] = new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve();
    // Same retry shape as loadModuleData: drop the promise AND the dead tag,
    // so a later attempt isn't stuck on a failed load.
    s.onerror = () => { s.remove(); delete _lazyScripts[src]; reject(new Error(src + ' failed to load')); };
    document.head.appendChild(s);
  });
  return _lazyScripts[src];
}
/* The files that make up the arcade script and the console script, in load order (each script was cut
   into parts on 2026-11-11, tools/split-site.mjs). tools/site-src.mjs reads these two
   lines, so each stays ONE line that starts the line, and neither name may appear in any other comment. */
const COACH_JS_PARTS = ['coach-core.js', 'coach-hub.js', 'coach-chords.js', 'coach-ear.js', 'coach-strum.js', 'coach-runner.js', 'coach-more.js'];
const TEACHER_JS_PARTS = ['teacher-core.js', 'teacher-activities.js', 'teacher-songs.js', 'teacher-config.js', 'teacher-manage.js', 'teacher-mic.js', 'teacher-students.js', 'teacher-backup.js', 'teacher-errors.js', 'teacher-livegames.js', 'teacher-accounts.js'];
/* One after another, each only when the one before it has run: a later part uses what an earlier part defines.
   Every file keeps its own loadScriptOnce promise, so a part that failed to load is the only one fetched again
   on the next try, and a part that already ran never runs twice (a second run would redeclare its consts). */
const _lazyGroups = {};
function loadScriptsInOrder(list){
  const key = list.join('|');
  /* One promise per list, handed to every caller (callers rely on their .then callbacks running in the order
     they were attached: the Games router before Riff Roulette's own). A failed load forgets it, so the next
     call tries again. */
  if(!_lazyGroups[key]) _lazyGroups[key] = list.reduce((p, src) => p.then(() => loadScriptOnce(src)), Promise.resolve())
    .catch(e => { delete _lazyGroups[key]; throw e; });
  return _lazyGroups[key];
}
function ensureCoachJs(){ return loadScriptsInOrder(COACH_JS_PARTS); }
function ensureTeacherJs(){ return loadScriptsInOrder(TEACHER_JS_PARTS); }
/* Every ▶ Listening Coach button in generated markup calls this instead of
   coachOpen directly — it's the one entry point that exists before coach.js
   does. Keeps the element, not just its data, so coachOpen sees exactly what
   it always saw. */
function coachOpenLazy(btn){
  ensureCoachJs()
    .then(() => coachOpen(btn))
    .catch(() => { if(typeof gateToast === 'function') gateToast(t('coach.loadFailed')); });
}
/* The header's Games button. It lives HERE, not in coach.js, for the same
   reason as coachOpenLazy: the button exists on every page load and coach.js
   does not. When toggleGames was defined in coach.js, the first click on
   Games threw a ReferenceError — the global safety net put up "Something
   went wrong", and every later click threw silently (the banner shows once),
   so Games looked dead until a reload (2026-09-08). Opening goes through the
   hash router, which loads coach.js and then calls openGamesScreen; closing
   only happens with the screen open, by which point coach.js is loaded.
   checks.mjs 1u fails the push on any other inline handler in index.html
   that reaches into a lazily-loaded script. */
function toggleGames(){
  const screen = document.getElementById('games-screen');
  if (!screen) return;
  if (screen.hasAttribute('hidden')) goExploreHash('games');
  else if (typeof closeGamesScreen === 'function') closeGamesScreen();
}

// Once a module is marked i18nComplete, every field checks.mjs requires has a
// real Spanish twin — hide the whole panel from Google Translate so it can't
// re-translate (or mangle) our own hand-written Spanish. Modules still mid-
// translation are left alone: Google Translate keeps covering them, same as
// before phase 2 (see CLAUDE.md's i18n architecture note).
function markModulePanelTranslated(el, num){
  if(!moduleI18nComplete(num)) return;
  el.setAttribute('translate','no');
  el.classList.add('notranslate');
}
// Build (once) the set + review panels for one module and wire chord links.
async function ensureModuleRendered(num){
  num = parseInt(num);
  if(_modulesRendered.has(num)) return;
  await loadModuleData(num);
  if(_modulesRendered.has(num)) return;   // guard against a concurrent caller
  _modulesRendered.add(num);
  const c = document.getElementById('week-panels');
  SETS.filter(w=>w.moduleNum===num).forEach(w=>{
    const div=document.createElement('div');
    div.className='week-panel'; div.dataset.id=w.id; div.dataset.module=w.moduleNum;
    div.innerHTML = w.comingSoon ? buildComingSoon(w) : buildSet(w);
    markModulePanelTranslated(div, num);
    c.appendChild(div);
  });
  if(MODULE_REVIEWS[num]){
    const mr=MODULE_REVIEWS[num];
    const div=document.createElement('div');
    div.className='week-panel'; div.dataset.id=`mr${mr.moduleNum}`; div.dataset.module=mr.moduleNum;
    div.innerHTML=buildModuleReview(mr);
    markModulePanelTranslated(div, num);
    c.appendChild(div);
  }
  // Idempotent: already-wrapped spans are skipped (see CHORD_SKIP_CLASSES).
  wrapAllChordLinks();
  // A module can be rendered for the first time long after page load (lazy,
  // on first visit) — with no setLang() in between, its data-i18n spans
  // (checklist strings, panel-footer buttons, print button, module-review
  // legend) would otherwise sit unmarked and exposed to Google Translate
  // until the next language toggle. Mark them right away instead of waiting.
  if(typeof applyI18n === 'function') applyI18n(c);
}
let _dirtyKeys = new Set();   // which categories need writing: skills · place · responses · completed · classActivities · games · streak · practiceLog · period
const escAttr = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const escHtml = s => String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

/* ── Module-content i18n (phase 2) ──────────────────────────────────────
   Hand-written Spanish for module/lesson CONTENT (as opposed to the app
   shell, which i18n.js's t()/data-i18n already covers). Every translatable
   field on a Set/skill/song/etc. can carry a `<field>_es` twin alongside the
   English `<field>` — tf(obj, 'field') returns the Spanish twin when the
   student is in Spanish mode AND that twin exists, else the English original.
   A module with no _es fields yet behaves exactly as before (falls through
   to English, which Google Translate then covers, same as today) — modules
   translate incrementally, field by field, with no renderer changes needed
   per module. See CLAUDE.md "i18n — module/lesson content" for the full
   rules (what to translate, glossary, checks.mjs enforcement). */
function tf(obj, field){
  if(!obj) return obj;
  if(typeof getLang === 'function' && getLang()==='es'){
    const v = obj[field+'_es'];
    if(v != null && v !== '') return v;
  }
  return obj[field];
}
// True once every required field in this module is hand-translated
// (tools/checks.mjs enforces that claim) — safe to hide it from Google
// Translate entirely so the two layers can't double-translate or clash.
function moduleI18nComplete(num){
  const m = MODULE_MANIFEST.find(x=>x.num===Number(num));
  return !!(m && m.i18nComplete);
}
// Builds the signed-in user header. Escapes name/email/photoURL — Google
// account values are user-controlled and go into innerHTML.
function userHeaderHtml(user){
  const av = user.photoURL
    ? `<img src="${escAttr(user.photoURL)}" class="avatar" alt="">`
    : `<div class="avatar-init">${escHtml((user.displayName||'?')[0].toUpperCase())}</div>`;
  return `${av}<span class="user-name" title="${escAttr(user.displayName||user.email)}">${escHtml(user.displayName||user.email)}</span><button class="btn-out notranslate" onclick="signOut()" data-i18n="header.signOut" translate="no">${t('header.signOut')}</button>`;
}

/* ── Auth ── */
function showAuthError(msg){
  const el = document.getElementById('auth-error');
  if(!el) return;
  el.textContent = msg;
  el.style.display = msg ? '' : 'none';
}
// Shown when the Firebase SDK/config never loaded (e.g. blocked on school Wi-Fi).
function showFirebaseLoadError(){
  const wall = document.getElementById('auth-wall');
  if(!wall) return;
  wall.innerHTML =
    `<h1 data-i18n="auth.fallbackTitle">${t('auth.fallbackTitle')}</h1>` +
    `<p data-i18n="auth.fallbackBody">${t('auth.fallbackBody')}</p>` +
    `<button class="btn-google" onclick="location.reload()" data-i18n="auth.tryAgain">${t('auth.tryAgain')}</button>`;
  if(typeof applyI18n === 'function') applyI18n(wall);
}
function signIn(){
  /* Re-entrancy guard. A second click is never useful and is sometimes
     destructive: a second signInWithPopup while the first is still open makes
     Firebase reject the FIRST one with auth/cancelled-popup-request, so the
     student's completed sign-in is thrown away and they have to start over —
     the "it signed me in and then made me do it again" report. The header
     button and the wall button both land here, and both are reachable while a
     sign-in is already in flight. */
  if(window.__authPopupPending || currentUser) return;
  showAuthError('');
  // Pre-warm the Firestore SDK while the student is in the Google popup, so it's
  // ready to load progress the moment they're back. Errors are ignored — the
  // real load attempt (ensureDb) will surface any problem.
  loadFirestoreSdk().catch(()=>{});
  // Flag read by the service-worker update handler at the bottom of this file:
  // a post-deploy auto-reload while the Google popup is open destroys the
  // pending signInWithPopup promise, so the student finishes the popup and
  // lands back on the sign-in wall having signed in for nothing. The reload
  // waits for this.
  window.__authPopupPending = true;
  try{
    auth.signInWithPopup(new firebase.auth.GoogleAuthProvider())
      .catch(e=>{
        // The student just closed/cancelled the popup — not an error worth nagging about.
        if(e && (e.code==='auth/popup-closed-by-user' || e.code==='auth/cancelled-popup-request')) return;
        showAuthError(t('auth.signInFailed'));
      })
      .finally(()=>{ window.__authPopupPending = false; });
  } catch(e){
    // Nothing attached the .finally() above, so clear the flag here or the
    // guard would lock the button out for the rest of the visit.
    window.__authPopupPending = false;
    showAuthError(t('auth.signInFailed'));
  }
}
/* Sign-out on a shared Chromebook has to be a hard reset, not a state reset.
   Two things went wrong when it wasn't:
     1. A debounced save still inside its 800 ms window was dropped — flushSave
        bails on !currentUser, so a got-it ticked right before signing out never
        reached Firestore. Flush first, while we still have a user to write as.
     2. Plenty of per-student state lives outside the variables the
        onAuthStateChanged(null) branch clears: _modulesRendered plus the built
        #week-panels DOM (so the next student saw the previous one's rendered
        answers and check-offs), drillSkillSession, and every sessionStorage
        best (sdBest / nrBestSession / rrPts / coachStreak — coach.js has no
        auth hook at all). Reloading clears the lot in one move and can't drift
        out of sync the way an ever-growing manual reset list does. */
let _signOutReloading = false;   // signOut() reloads itself — the auth listener's signed-out (null) reload stands aside
let _signOutBusy = false;        // a second click during the bounded wait is not a second sign-out
let _authUserSwapped = false;    // another tab signed a different student in — this page is already reloading as them
async function signOut(anyway){
  if(_signOutBusy) return;
  _signOutBusy = true;
  _signOutReloading = true;
  /* A write already in flight empties the dirty set, so flushSave() alone
     would return at once and the reload below would drop it — wait for that
     one first, then flush whatever is left. Bounded (4 s): on a network that
     accepts the connection and then stalls, set() never settles, and Sign
     out must still sign out. See flushBeforeLeaving. "Sign out anyway"
     skips the wait: the student has just been told, and a second silent
     4 s would read as the button not working. */
  const saved = anyway ? false : await flushBeforeLeaving(4000);
  // Someone else signed in during the wait: the auth listener has already
  // reloaded the page, and auth.signOut() now would sign THEM out.
  if(_authUserSwapped) return;
  /* Still not saved when the wait ran out (offline, or a stalled write):
     reloading now would throw that work away without a word. Say so and
     stay signed in — Firestore keeps the write queued and sends it by
     itself on reconnect. "Sign out anyway" is the way out for a shared
     Chromebook that has to move on to the next student. */
  if(!saved && !anyway && currentUser){
    _signOutReloading = false;
    _signOutBusy = false;
    showUnsavedNotice('save.signOutAnyway', () => signOut(true));
    return;
  }
  try { sessionStorage.clear(); } catch(e){}
  try { if(auth) await auth.signOut(); } catch(e){}
  location.reload();
}
/* Is any of the student's work not yet confirmed by Firestore? A category
   still dirty (inside queueSave's 800 ms debounce, waiting out a retry, or
   put back by a failed write) or a write still on the wire (_flushP). */
function hasUnsavedWrites(){
  return _dirtyKeys.size > 0 || !!_flushP;
}
/* Send what is pending now and wait for it, at most `ms` — the shared step
   before anything that reloads the page (Sign out, the error banner's
   Refresh). Resolves true when nothing is left unsaved. Never rejects.
   flushSave() itself keeps every save rule (the failed-load drop, the
   held-back categories); this only decides how long to wait. */
async function flushBeforeLeaving(ms){
  clearTimeout(saveTimer);
  try {
    await withTimeout((async()=>{ if(_flushP) await _flushP; await flushSave(); })(), ms);
  } catch(e){}
  return !hasUnsavedWrites();
}
/* "Not saved yet" with a way out — shown when a sign-out's bounded wait ends
   with work still unsaved. Same look as the safety-net banner at the top of
   this file, but at the TOP of the screen: offline is the usual reason, and
   the offline banner already holds the bottom. */
function showUnsavedNotice(anywayKey, onAnyway){
  const old = document.getElementById('unsaved-notice');
  if(old) old.remove();
  const d = document.createElement('div');
  d.id = 'unsaved-notice';
  d.setAttribute('role', 'alert');
  d.style.cssText = 'position:fixed;left:12px;right:12px;top:12px;z-index:99999;'
    + 'max-width:520px;margin:0 auto;padding:12px 44px 12px 16px;border-radius:12px;'
    + 'background:#514a7d;color:#fff;font:14px/1.45 system-ui,-apple-system,sans-serif;'
    + 'box-shadow:0 6px 24px rgba(0,0,0,.28)';
  const msg = document.createElement('span');
  msg.setAttribute('data-i18n', 'save.notSavedYet');
  msg.textContent = t('save.notSavedYet');
  const go = document.createElement('button');
  go.type = 'button';
  go.setAttribute('data-i18n', anywayKey);
  go.textContent = t(anywayKey);
  go.style.cssText = 'margin-left:8px;padding:3px 12px;border:0;border-radius:14px;'
    + 'background:#fff;color:#514a7d;font-weight:600;cursor:pointer';
  go.onclick = () => { d.remove(); onAnyway(); };
  const close = document.createElement('button');
  close.type = 'button';
  close.setAttribute('data-i18n-attr', 'aria-label:offline.dismiss');
  close.setAttribute('aria-label', t('offline.dismiss'));
  close.textContent = '×';
  close.style.cssText = 'position:absolute;top:8px;right:12px;background:none;border:0;'
    + 'color:#fff;font-size:1.25rem;line-height:1;cursor:pointer';
  close.onclick = () => d.remove();
  d.append(msg, go, close);
  document.body.appendChild(d);
}

/* Which mode is this page in? Both flags live here, in the first script that
   needs them.

   IS_TEACHER_MODE used to be declared in teacher.js, which loads AFTER app.js
   — and the auth callback below reads it bare. That made every student's
   sign-in depend on teacher.js having arrived: one dropped request on school
   Wi-Fi and the callback threw a ReferenceError for the whole class, leaving
   them on "Signed in — loading…" forever (the stall prompt's reload just
   repeats it). Declaring it here means the student path never depends on the
   teacher script at all. */
const IS_TEACHER_MODE = new URLSearchParams(window.location.search).has('teacher');
// Dev bypass is for local UI testing only. Only show/allow it when the site is
// running on localhost — never on the live (GitHub Pages) site.
const IS_LOCALHOST = ['localhost','127.0.0.1','[::1]'].includes(location.hostname);
/* ?snipcal=1 turns on the backing-track snippet's calibration panel, which is
   how a track's `anchor` (its first downbeat) gets measured — see
   SNIPPET_TRACKS. Deliberately NOT localhost-only, unlike the dev bypass and
   __forceGate: those hand out access, this shows a number. Gating it to
   localhost meant the one measurement the feature still needs could not be
   taken on the deployed site, which is where Jonathan was actually standing
   (2026-09-18). A student cannot reach it without typing the query param. */
/* Read from the hash's query part as well as location.search. This site is
   hash-routed, so the natural thing to type onto a URL that already ends in
   `#class-activities` puts the param in the FRAGMENT, where location.search
   never sees it — which is exactly what happened, and the panel simply never
   appeared (2026-09-18). Both shapes work now:
     …/index.html?snipcal=1#class-activities
     …/index.html#class-activities?snipcal=1
   Captured once at load into window.__snipCal / __snipLat, because the app
   rewrites the hash as the student navigates and a param living there would
   otherwise vanish mid-session. */
function snipUrlParam(name){
  /* Scan the WHOLE href rather than parsing location.search, because every
     way of typing this onto a real URL has now failed once:
       ?snipcal=1                      — the shape that always worked
       #class-activities?snipcal=1     — hash-routed site, search is empty
       ?teacher=true?snipcal=1         — console URL already has a query, so
                                         the second ? makes URLSearchParams
                                         read the value as "true?snipcal=1"
     A delimiter-anchored match accepts all of them, and still won't match a
     longer name that merely ends in this one. */
  const m = new RegExp('[?&#]' + name + '=([^&#]*)').exec(window.location.href || '');
  if(!m) return null;
  // A stray % throws URIError, and this runs at load: keep the raw text.
  try { return decodeURIComponent(m[1]); } catch(e){ return m[1]; }
}
if(snipUrlParam('snipcal') === '1'){
  window.__snipCal = true;
  const raw = snipUrlParam('lat');
  if(raw !== null && raw.trim() !== ''){
    const ms = Number(raw);
    if(isFinite(ms) && ms >= 0) window.__snipLat = ms / 1000;
  }
}
function devBypass(){
  if(!IS_LOCALHOST){ console.warn('Dev bypass is disabled outside localhost.'); return; }
  currentUser = {uid:'dev-user',displayName:'Dev User',email:'dev@test.local',photoURL:null};
  restoreLocalPlace();
  showApp(currentUser);
}
// Dev bypass never signs in to Firebase Auth, so Firestore rules reject any
// write under this uid — features that persist to Firestore (progress,
// skills, etc.) should hide their save affordance rather than let it silently fail.
function isDevBypassUser(){ return !!(currentUser && currentUser.uid==='dev-user'); }
if(IS_LOCALHOST){
  const _devBtn = document.getElementById('dev-bypass-btn');
  if(_devBtn) _devBtn.style.display='';
}

/* The auth wall has two states (index.html): a button-free note
   (#auth-checking) and the Sign in with Google buttons (#auth-signin). The
   note is the default and the buttons appear only once Firebase has actually
   answered "signed out".

   Both directions exist to stop a student signing in twice:
   - Before this split the sign-in wall was the default on every page load, so
     the automatic post-deploy reload (service worker, bottom of this file)
     flashed it at students whose session was about to restore fine.
   - And a "signed in" answer is not the end of it — showApp() only runs after
     loadProgress() + loadClassConfig(), i.e. a ~100 KB Firestore SDK download
     and two reads. On school Wi-Fi that leaves the student looking at a live
     Sign in with Google button for 5-15 seconds AFTER they finished the Google
     popup, which is exactly when they click it again. So the signed-in branch
     of onAuthStateChanged puts the wall back into the note state
     ('auth.loading') before it awaits anything.

   The 6 s timer is a safety net: if onAuthStateChanged somehow never fires (it
   always should once the SDK is up), the student still gets a sign-in button
   rather than an eternal note. showFirebaseLoadError() replaces the whole
   wall, so the blocked-SDK path is unaffected. */
function setAuthWallChecking(key){
  const c = document.getElementById('auth-checking');
  const p = document.getElementById('auth-checking-msg');
  const s = document.getElementById('auth-signin');
  // Retag for i18n as well as retitle, so a language switch mid-load re-renders
  // the line that's actually showing rather than snapping back to 'auth.checking'.
  if(p){ p.setAttribute('data-i18n', key); p.textContent = t(key); }
  if(c) c.hidden = false;
  if(s) s.hidden = true;
  clearAuthStallTimer();   // whichever wait this is, it starts over
}
function revealAuthWallSignIn(){
  const c = document.getElementById('auth-checking');
  const s = document.getElementById('auth-signin');
  clearAuthStallTimer();
  if(c) c.hidden = true;
  if(s) s.hidden = false;
}

/* Escape hatch for a wait that stops being normal. Hiding the sign-in button
   during the post-sign-in load is what fixes the double sign-in, but it leaves
   the student with no button at all — and loadProgress() can wait indefinitely,
   because a Firestore get() on a network that accepts connections and then
   stalls retries forever rather than rejecting. So after 20 s, offer a reload.
   Reloading is safe here and always the right move: the sign-in is already
   persisted (they come back signed in, not to the wall), and progress writes
   go through a debounce that has nothing queued this early. 20 s is well past
   a slow-but-working school-Wi-Fi load, so a student who is merely waiting
   never sees it. */
let _authStallTimer = null;
function startAuthStallTimer(){
  clearTimeout(_authStallTimer);
  _authStallTimer = setTimeout(()=>{
    const el = document.getElementById('auth-stalled');
    // showFirebaseLoadError() rewrites the whole wall, so the node can be gone.
    if(el) el.hidden = false;
  }, 20000);
}
function clearAuthStallTimer(){
  clearTimeout(_authStallTimer); _authStallTimer = null;
  const el = document.getElementById('auth-stalled');
  if(el) el.hidden = true;
}
/* Was this page load OUR OWN post-deploy reload (service worker, bottom of
   this file)? Then say so. Without this the wall replays "Checking your
   sign-in…" → "Signed in — loading your progress…" exactly as it does after a
   real sign-in, so a routine update reads as the site making you sign in a
   second time — which is what it gets reported as. sessionStorage is per-tab
   and signOut() clears it, so the flag can't leak to another tab or to the
   next student on a shared Chromebook. */
const SW_UPDATE_BOOT = (()=>{
  try{
    if(sessionStorage.getItem('gcSwUpdating') !== '1') return false;
    sessionStorage.removeItem('gcSwUpdating');   // consumed — a later manual reload is not an update
    return true;
  }catch(e){ return false; }
})();
if(SW_UPDATE_BOOT) setAuthWallChecking('auth.updating');

/* ── Back where you were after an update (2026-11-09) ─────────────────────
   The site reloads itself when a new version takes over (bottom of this
   file). A reload used to open the home page — In-Class Activities, or the
   console's Class activities list — whatever the tab had been showing
   ("it reloads back to a different view", Jonathan). So the reload leaves a
   note of where the tab was (swResumeSave), and the next load reads it once
   and opens the same place (showApp here, showTeacherApp in teacher.js).

   What comes back: the page (lesson, In class, Songs, My progress: the
   address keeps those), the lesson or checklist panel of the set, the step
   that was open in it with its Hint / Stuck? folds (the same snapshot a
   language switch keeps: snapshotLessonState), where the page was scrolled,
   and on the console the view, the picked activity or student, its tab and
   the board. What does not: anything the reload already waits for (a
   drill, a recording, an exit check: see busyReason below), text typed
   into a box but not yet saved, and the small states inside a card (a
   search, an In class card's open step or TAB page, the board's sort) and
   In class's two folds ("Completed activities" opens closed again; the
   scroll then goes as far down as the shorter page reaches).

   The person wins: the next load is slow (the new version's files are
   still arriving), and anything they click, type or scroll before the
   restore lands cancels the rest of it (swResumeWatch).

   The note is only ever used by the load it was written for:
     - it is read and deleted while this file runs, on every load, and is
       dropped unless that load is the update's own reload (SW_UPDATE_BOOT);
     - it names the account, and the first sign-in of the load takes it, so
       the next student on a shared Chromebook can never open someone
       else's place (signOut() also clears sessionStorage);
     - it is per tab (sessionStorage) and goes stale after 10 minutes.
   It sets nothing a student could not reach by clicking: the set and module
   still come from the saved progress, and the activity gate still runs. */
const SW_RESUME_KEY = 'gcSwResume';
let swResumeNote = (()=>{
  try{
    const raw = sessionStorage.getItem(SW_RESUME_KEY);
    sessionStorage.removeItem(SW_RESUME_KEY);
    if(!SW_UPDATE_BOOT || !raw) return null;
    const v = JSON.parse(raw);
    return (v && typeof v === 'object' && typeof v.uid === 'string' && Date.now() - v.at < 10 * 60 * 1000) ? v : null;
  }catch(e){ return null; }
})();
/* The note for this sign-in, or null. One use: whoever signs in first after
   the reload takes it, and it only fits the same account on the same kind of
   page (the site or the ?teacher console). */
function swResumeTake(user, teacher){
  const v = swResumeNote;
  swResumeNote = null;
  if(!v || !user || v.uid !== user.uid || !!v.teacher !== !!teacher) return null;
  const part = teacher ? v.t : v.s;
  return (part && typeof part === 'object') ? part : null;
}
/* True only while showApp routes the address a note is about to put back
   (2026-11-12): the page that opens leaves the scroll to swResumeApply
   (caFocusActivity skips its scroll to the card). */
let swResumeRouting = false;
function swResumeSave(){
  try{
    // Nobody signed in, or the app is not on screen (the sign-in wall, a paused account): nothing to come back to.
    if(!currentUser || accountPaused) return;
    const note = { at: Date.now(), uid: currentUser.uid, teacher: IS_TEACHER_MODE };
    if(IS_TEACHER_MODE){
      if(typeof teacherResumeSnapshot !== 'function') return;
      note.t = teacherResumeSnapshot();
    } else {
      if(document.getElementById('app').style.display !== 'block') return;
      const panel = activeWeekPanel();
      // A locked set opened to preview is never restored (activateSet: a peek leaves nothing behind).
      const peek = !!(panel && panel.classList.contains('set-peek'));
      // The row being read (null while an in-column page has the lesson swapped out: practiceScrollTop has its place).
      const anchor = (panel && !peek) ? lessonScrollAnchor() : null;
      note.s = {
        hash: location.hash,
        set: (panel && !peek) ? panel.dataset.id : null,
        checklist: !!(panel && !peek && panel.classList.contains('on-checklist')),
        lesson: (panel && !peek) ? snapshotLessonState(panel) : null,
        key: (anchor && anchor.key) || null,
        top: anchor ? Math.round(anchor.top) || 0 : 0,
        y: Math.round(paneScrollTop()) || 0,
        py: Math.round(practiceScrollTop) || 0
      };
    }
    sessionStorage.setItem(SW_RESUME_KEY, JSON.stringify(note));
  }catch(e){ /* storage blocked or full: the reload still happens, onto the home page as before */ }
}
/* Did the person do anything since the reload? One watcher per restore,
   started before any waiting: a click, a key, a wheel or a touch means they
   have moved on, and the restore stops there. off() removes the listeners;
   it runs on the first event and when the restore finishes. */
function swResumeWatch(){
  const evs = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
  const w = { touched: false, off(){ evs.forEach(ev => window.removeEventListener(ev, on, true)); } };
  function on(){ w.touched = true; w.off(); }
  evs.forEach(ev => window.addEventListener(ev, on, { passive: true, capture: true }));
  return w;
}
/* Put a scroll position back. The page is still filling in when this runs
   (module files, Songs and My progress wait for every module, the console
   waits for its roster), and a page that is still short clamps the scroll.
   So: look every 250 ms for up to 8 s, set the position whenever the page is
   tall enough and is not already there (or, once the page has stopped
   growing, as far down as it reaches), and stop for good the moment the
   person touches the page, moves it themselves, or the address changes
   (hash: the address this position belongs to; null on the console). getPane and target are read fresh each time
   (scrollPane() changes with the page height; target() returns the wanted
   scrollTop, or null for "not yet"). */
const SW_RESUME_SCROLL_MS = 8000;
function swResumeScroll(getPane, target, w, hash){
  const t0 = Date.now();
  // What this loop last set, and how tall the page was then; and how long the page has been the same height.
  let setTo = null, setAtHeight = 0, lastHeight = -1, steadySince = t0;
  const tick = () => {
    if(w.touched) return;
    // Another page now (the browser's Back button fires no click or key): this position belongs to the page that was left.
    if(hash != null && location.hash !== hash){ w.off(); return; }
    const late = Date.now() - t0 > SW_RESUME_SCROLL_MS;
    try {
      const pane = getPane();
      const el = pane === window ? document.scrollingElement : pane;
      const y = target();
      if(el && y != null && y > 0){
        const cur = pane === window ? window.scrollY : pane.scrollTop;
        const max = el.scrollHeight - el.clientHeight;
        if(el.scrollHeight !== lastHeight){ lastHeight = el.scrollHeight; steadySince = Date.now(); }
        /* The position moved off what was set here while the page stayed the
           same height: the person moved it some way this watcher cannot see
           (dragging the window's scrollbar fires no pointer event). Theirs. */
        if(setTo != null && el.scrollHeight === setAtHeight && Math.abs(cur - setTo) > 2){ w.off(); return; }
        /* Reachable: go there. Not reachable and the page has stopped growing
           for a second (or time is up): the page came back shorter (a fold
           that is closed again), so go as far as it reaches. */
        const to = max >= y - 1 ? y : ((late || Date.now() - steadySince >= 1000) ? Math.max(0, max) : null);
        if(to != null && Math.abs(cur - to) > 2){ pane.scrollTo({ top: to }); setTo = to; setAtHeight = el.scrollHeight; }
        else if(to != null && setTo == null){ setTo = cur; setAtHeight = el.scrollHeight; }
      }
    } catch(e) { /* pane gone: leave the page where it is */ }
    if(late){ w.off(); return; }
    setTimeout(tick, 250);
  };
  tick();
}
/* The lesson snapshot as it came back from storage: the three lists
   restoreLessonState reads, strings only, or null. */
function swResumeLessonSnap(v){
  if(!v || typeof v !== 'object') return null;
  const strs = a => Array.isArray(a) ? a.filter(x => typeof x === 'string') : [];
  return { open: strs(v.open), folds: strs(v.folds), tabs: strs(v.tabs), pdSeen: v.pdSeen === true, pdShowing: v.pdShowing === true };
}
/* The student half. Runs after showApp has drawn the saved set and routed
   the address, once the module's panels exist (renderAll → onModuleChange is
   async: it may still be fetching the module file). */
function swResumeApply(s){
  const w = swResumeWatch();
  const y = Number(s.y) || 0, py = Number(s.py) || 0, top = Number(s.top) || 0;
  // They clicked or scrolled while something was loading, or went to another page: leave everything as they have it.
  const gone = () => w.touched || location.hash !== s.hash;
  const sameSet = panel => !!panel && typeof s.set === 'string' && panel.dataset.id === s.set;
  (async () => {
    await _bootModuleChange;
    if(gone()){ w.off(); return; }
    let panel = activeWeekPanel();
    /* No set on screen: the module file did not arrive (onModuleChange said
       so in a toast). A bare address would leave an empty lesson pane, so
       open the home page, which needs no module, as a normal visit would. */
    if(!panel && !location.hash){ w.off(); goExploreHash('class-activities'); return; }
    /* Their own set came up as a locked preview. At boot that can be a wrong
       guess: the gate holds while the module BEFORE this one has not loaded
       (isModuleGateLocked), and the catch-up in renderAll corrects it once
       every module is in. Wait for that, once, before giving up on the set. */
    if(sameSet(panel) && panel.classList.contains('set-peek') && _bootCatchUp){
      try { await _bootCatchUp; } catch(e) { /* a module failed to load: the set stays a preview */ }
      if(gone()){ w.off(); return; }
      panel = activeWeekPanel();
    }
    // A different set came back (the saved place moved, or the set really is locked now): the lesson opens at its top.
    const lessonBack = sameSet(panel) && !panel.classList.contains('set-peek');
    if(lessonBack){
      const snap = swResumeLessonSnap(s.lesson);
      // One-at-a-time view shows one step: a note written in list view (the pref was flipped in another tab) keeps its first.
      if(snap && panel.querySelector('.dp.focus')) snap.open = snap.open.slice(0, 1);
      restoreLessonState(panel, snap);
      if(s.checklist === true && document.getElementById(`${s.set}-checklist`)) switchTabById(s.set, 'checklist', true);
    }
    /* An in-column page (In class, Songs, My progress) has swapped the lesson
       out: y is that page's scroll and does not depend on the set behind it;
       py is the lesson's place for the way back (syncExploreNav puts
       practiceScrollTop back when the page closes). */
    if(document.body.classList.contains('explore-open')){
      if(lessonBack) practiceScrollTop = py;
      swResumeScroll(scrollPane, () => y, w, s.hash);
      return;
    }
    if(!lessonBack){ w.off(); return; }
    /* The lesson itself: by the row that was being read, not by scrollTop
       (restoreLessonScroll's rule: the same scrollTop lands somewhere else
       when the rows above are a different height). Falls back to y. */
    const key = typeof s.key === 'string' ? s.key : null;
    swResumeScroll(scrollPane, () => {
      const tp = key && document.querySelector('#week-panels .week-panel.active .tab-panel.active');
      const li = tp ? [...tp.querySelectorAll('li.step')].find(x => x.dataset.key === key) : null;
      if(!li || !li.getClientRects().length) return y;
      return paneScrollTop() + li.getBoundingClientRect().top - top;
    }, w, s.hash);
  })().catch(() => { w.off(); /* never let a restore break the page it is restoring */ });
}

let _authRevealTimer = firebaseReady ? setTimeout(revealAuthWallSignIn, 6000) : null;
if(!firebaseReady) revealAuthWallSignIn();   // wall content is being replaced anyway — don't strand the checking note

/* Sign-in is started at the very END of this script (see the last lines of the file), not here: its callback
   uses functions from the whole file (loadProgress, showApp, ensureTeacherJs…), and once the file is cut into
   parts that load one after another, a session Firebase restores quickly could call back before the later
   parts have run. Moved 2026-11-11; nothing between here and the end of the file depends on it. */

/* Teacher put this student on hold — they authenticated fine, so this is a
   message, not an error. Progress is untouched and comes straight back when
   the hold is lifted, and the copy says so: a student who thinks their work
   is gone will panic (and go make a second account). Sign out stays reachable
   so a shared Chromebook isn't stuck on one student's paused screen. */
function showPausedScreen(user){
  document.getElementById('auth-wall').style.display='none';
  document.getElementById('app').style.display='none';
  document.getElementById('teacher-app').style.display='none';
  document.getElementById('fab-group').style.display='none';
  document.getElementById('search-btn').style.display='none';
  let el=document.getElementById('paused-screen');
  if(!el){
    el=document.createElement('div');
    el.id='paused-screen';
    el.className='paused-screen';
    document.querySelector('.wrap, main, body').appendChild(el);
  }
  el.innerHTML=
    `<div class="paused-card">`+
      `<div class="paused-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="width:1em;height:1em;display:block;margin:0 auto"><circle cx="12" cy="12" r="9"/><path d="M10 9v6M14 9v6"/></svg></div>`+
      `<h2 data-i18n="paused.title">${escHtml(t('paused.title'))}</h2>`+
      `<p data-i18n="paused.body">${escHtml(t('paused.body'))}</p>`+
      `<p class="paused-safe" data-i18n="paused.safe">${escHtml(t('paused.safe'))}</p>`+
      `<button class="btn-sign" onclick="signOut()" data-i18n="header.signOut">${escHtml(t('header.signOut'))}</button>`+
    `</div>`;
  el.style.display='block';
  document.getElementById('user-area').innerHTML=userHeaderHtml(user);
  if(window.PM) PM.syncHeader(false);   // a paused student has no My progress to open
}

/* ── An account the database does not let in (2026-11-13) ──
   firestore.rules isSchool(): a verified @seq.org address, or an account the
   teacher allowed (config/access). Any other signed-in account is refused
   the class-wide reads (and, with the stricter rules, every write). Without
   this screen such an account fell through to the site: its config/class
   read failed into the cached copy (on a shared Chromebook, the last
   student's activities; on its own, none), the live quiz and the boards
   failed silently, and its work did not save.

   No extra read at sign-in: the boot makes the same two reads in the same
   order as before (loadProgress, then loadClassConfig, app/save.js), and
   each records whether its failure was a rules refusal (progressLoadDenied,
   classConfigLoadDenied). accessRefusedAtBoot() then decides, before
   showApp: an account that is not a verified @seq.org address and had
   either read REFUSED (permission-denied) gets the access screen. Under the
   stricter rules the progress read is refused first; under the reads-only
   rules it succeeds and the config/class refusal is the signal. A school
   account never gets this screen (a refusal there is a real fault and
   takes today's path), and no other error (offline, unavailable) counts:
   those take today's path too. Before the rules are pasted every read
   succeeds, so this changes nothing until then. (An extra probe read before
   loadProgress, the first version, shifted the boot's timing:
   tools/shared-chromebook-loop.mjs, 2026-11-13.)

   The screen: ask once (accessRequests/{own uid}, from the sign-in token's
   own name and email, which the rules compare), then "asked" with Check
   again, or "declined" with only Sign out. Check again, and coming back to
   the tab (at most once every 30 s), read config/class (accessCheck; only
   ever once the screen is up, never during the boot); once it passes, the
   page reloads into the site. No timer, no polling. Nothing here writes to
   progress/{uid} or touches the save. */
const ACCESS_SCHOOL_RE = /^[^@]+@seq\.org$/i;   // mirrors firestore.rules isSchool()
let accessLocked = false;                      // the access screen is up: the app is not, nothing may load or save
let accessState = '';                          // '' (reading) | 'none' | 'asked' | 'declined' | 'failed' | 'offline' | 'cantAsk'
let accessNote = '';                           // i18n key of a one-line note under the buttons
let accessCheckedAt = 0;
let accessBusy = false;
function accessIsSchoolUser(user){
  return !!user && user.emailVerified === true && ACCESS_SCHOOL_RE.test(String(user.email || '').trim());
}
/* This device remembers, per account, that the rules refused it
   (localStorage gcAccessRefused:<uid>, review R1-1): set when the access
   screen shows for a refusal, removed the moment a read lets the account in.
   An account remembered as refused that boots OFFLINE (its reads fail, none
   refused) gets the access screen saying it is offline, not the site from
   the cache (on a shared Chromebook, the cached class settings are the last
   student's). Named with the uid, so the next student never reads it; sign-out
   leaves it (it only ever describes that one account on this device). An
   account never refused here takes today's offline path. */
let accessBootOffline = false;
let accessOfflineKey = 'access.offline';
/* Without Firestore's offline cache, a set() made with no network never
   settles (it neither lands nor fails). The Ask waits this long, then says it
   did not send and offers Ask again (review R2-2). */
const ACCESS_ASK_TIMEOUT_MS = 10000;
function accessRefusedKey(uid){ return 'gcAccessRefused:' + uid; }
function accessRemember(uid, refused){
  try { if(refused) localStorage.setItem(accessRefusedKey(uid), '1'); else if(localStorage.getItem(accessRefusedKey(uid))) localStorage.removeItem(accessRefusedKey(uid)); } catch(e){ /* storage blocked: nothing remembered */ }
}
function accessRemembered(uid){
  try { return localStorage.getItem(accessRefusedKey(uid)) === '1'; } catch(e){ return false; }
}
/* Called once per sign-in, after loadProgress() and loadClassConfig(). */
function accessRefusedAtBoot(user){
  accessBootOffline = false;
  if(IS_TEACHER_MODE || isDevBypassUser() || accessIsSchoolUser(user)) return false;
  if(progressLoadDenied === true || classConfigLoadDenied === true) return true;
  if(!progressLoadFailed){ accessRemember(user.uid, false); return false; }   // read fine: let in, and forget an old refusal
  if(accessRemembered(user.uid)){ accessBootOffline = true; return true; }      // offline, and refused here before
  return false;
}
/* The re-check behind Check again and the tab coming back. Three answers:
   'in' only when the read SUCCEEDS; 'refused' when the rules refuse it;
   'unknown' for anything else (offline, a timeout): never a reason to leave
   the access screen (review R1-1). */
async function accessCheck(user){
  if(IS_TEACHER_MODE || isDevBypassUser() || accessIsSchoolUser(user)) return 'in';
  accessCheckedAt = Date.now();
  try {
    await ensureDb();
    if(!db) return 'unknown';
    await db.collection('config').doc('class').get({ source: 'server' });
    return 'in';
  } catch(e){
    return e && e.code === 'permission-denied' ? 'refused' : 'unknown';
  }
}
function showAccessScreen(user){
  accessLocked = true;
  if(!accessBootOffline) accessRemember(user.uid, true);
  document.getElementById('auth-wall').style.display='none';
  document.getElementById('app').style.display='none';
  document.getElementById('teacher-app').style.display='none';
  document.getElementById('fab-group').style.display='none';
  document.getElementById('search-btn').style.display='none';
  let el=document.getElementById('access-screen');
  if(!el){
    el=document.createElement('div');
    el.id='access-screen';
    el.className='paused-screen';
    document.querySelector('.wrap, main, body').appendChild(el);
    el.addEventListener('click', e => {
      const b = e.target && e.target.closest ? e.target.closest('[data-access]') : null;
      if(!b) return;
      if(b.dataset.access === 'out'){ signOut(); return; }   // Sign out works whatever is in flight (review R2-2)
      if(accessBusy) return;
      if(b.dataset.access === 'ask') accessAsk();
      else if(b.dataset.access === 'check') accessRecheck(true);
    });
  }
  el.style.display='block';
  /* No request to read. "You are offline" only when the device says so; any other failed read (a quota error, a
     timeout) says "Could not check right now" (review R2). */
  if(accessBootOffline){ accessState = 'offline'; accessOfflineKey = (typeof navigator !== 'undefined' && navigator.onLine === false) ? 'access.offline' : 'access.cantCheck'; accessPaint(); return; }
  accessPaint();
  accessReadMine();
}
function accessPaint(){
  const el=document.getElementById('access-screen');
  if(!el) return;
  const s = accessState;
  const btn = (key, act, primary) => `<button class="${primary ? 'btn-google' : 'btn-sign'}" data-access="${act}" data-i18n="${key}"${accessBusy && act !== 'out' ? ' disabled' : ''}>${escHtml(t(key))}</button>`;
  let body = `<p data-i18n="access.body">${escHtml(t('access.body'))}</p>`;
  let buttons = '';
  if(s === 'none' || s === 'failed') buttons = btn('access.ask', 'ask', true);
  else if(s === 'asked'){ body += `<p><strong data-i18n="access.asked">${escHtml(t('access.asked'))}</strong></p>`; buttons = btn('access.checkAgain', 'check', true); }
  else if(s === 'declined') body = `<p><strong data-i18n="access.declined">${escHtml(t('access.declined'))}</strong></p>`;
  else if(s === 'offline'){ body += `<p><strong data-i18n="${accessOfflineKey}">${escHtml(t(accessOfflineKey))}</strong></p>`; buttons = btn('access.checkAgain', 'check', true); }
  else if(s === 'cantAsk') body += `<p><strong data-i18n="access.cantAsk">${escHtml(t('access.cantAsk'))}</strong></p>`;
  const note = s === 'failed' ? 'access.failed' : accessNote;
  el.innerHTML =
    `<div class="paused-card" role="region" aria-labelledby="access-title">`+
      `<h2 id="access-title" data-i18n="access.title">${escHtml(t('access.title'))}</h2>`+
      body+
      (note ? `<p class="paused-safe" role="status" data-i18n="${escAttr(note)}">${escHtml(t(note))}</p>` : '')+
      `<div>${buttons}</div>`+
      `<div>${btn('access.signOut', 'out', false)}</div>`+
    `</div>`;
}
/* This account's own request, if it made one: decides which state shows. A
   failed read shows the Ask button; a second ask is refused by the rules
   anyway, and the page then reads the request again. */
async function accessReadMine(){
  accessState = ''; accessPaint();
  let st = 'none';
  try {
    await ensureDb();
    const snap = await db.collection('accessRequests').doc(currentUser.uid).get({ source: 'server' });
    if(snap.exists){ const v = (snap.data() || {}).status; st = v === 'declined' ? 'declined' : 'asked'; }
  } catch(e){ /* not readable (rules not pasted, offline): offer the button */ }
  if(!accessLocked) return;
  accessState = st; accessPaint();
}
async function accessAsk(){
  if(accessBusy || !currentUser) return;
  accessBusy = true; accessNote = ''; accessPaint();
  try {
    await ensureDb();
    /* The rules compare name and email with the sign-in token's own claims,
       so they are taken from the token, not from the profile. */
    let claims = {};
    try { claims = (await currentUser.getIdTokenResult()).claims || {}; } catch(e){ claims = {}; }
    const sent = db.collection('accessRequests').doc(currentUser.uid).set({
      name: typeof claims.name === 'string' ? claims.name : '',
      email: typeof claims.email === 'string' ? claims.email : '',
      at: firebase.firestore.FieldValue.serverTimestamp(),
      status: 'asked',
    });
    /* If it lands after the wait ran out, say so then. */
    sent.then(() => { if(accessLocked && accessState === 'failed'){ accessState = 'asked'; accessPaint(); } }, () => {});
    await Promise.race([sent, new Promise((_, rej) => setTimeout(() => rej(Object.assign(new Error('timeout'), { code: 'deadline-exceeded' })), ACCESS_ASK_TIMEOUT_MS))]);
    accessState = 'asked';
  } catch(e){
    console.warn('[guitar-class] access request not sent', e);
    accessBusy = false;
    /* Refused can also mean it was already sent (a second tab): read it back. */
    /* Refused, and no request of its own to read back: the rules will not take
       a request from this account (an unverified address, a name too long):
       say that, not "check your connection" (review R2). */
    if(e && e.code === 'permission-denied'){ await accessReadMine(); if(accessState === 'none') accessState = 'cantAsk'; }
    else accessState = 'failed';
  }
  accessBusy = false;
  accessPaint();
}
/* Check again (a click), or the tab coming back (at most once every 30 s). */
async function accessRecheck(byClick){
  if(!accessLocked || accessBusy || !currentUser) return;
  if(!byClick && Date.now() - accessCheckedAt < 30000) return;
  accessBusy = true; accessNote = ''; accessPaint();
  const r = await accessCheck(currentUser);
  accessBusy = false;
  if(r === 'in'){ accessRemember(currentUser.uid, false); location.reload(); return; }
  if(r === 'unknown'){ if(byClick) accessNote = 'access.failed'; accessPaint(); return; }   // offline: stay, say so on a click
  accessBootOffline = false;
  accessRemember(currentUser.uid, true);
  if(byClick) accessNote = 'access.stillWaiting';
  await accessReadMine();
}

function showApp(user){
  document.getElementById('auth-wall').style.display='none';
  document.getElementById('app').style.display='block';
  document.getElementById('fab-group').style.display='flex';
  document.getElementById('search-btn').style.display='flex';
  document.getElementById('user-area').innerHTML=userHeaderHtml(user);
  if(window.PM) PM.syncHeader(true);   // practice minutes in the top bar (uiOn, a student, not the console)
  renderAll();
  applyGamesAccess();
  // The activity gate (see caBlockers/applyActivityGate) — computed before
  // the landing-hash decision below, since a gated student's bookmarked hash
  // has to be overridden by it.
  applyActivityGate();
  // In-Class Activities is the home page (Today-first work order, Phase 1): a fresh or
  // bookmarked-bare visit lands there. A hash that's already present — an
  // explore page, or one this router doesn't own — is left for
  // routeExploreHash to resolve, same as always.
  // A student with a pending activity lands there whatever the hash says —
  // the "pops up on login" half of the activity gate, kept when the lock
  // itself was switched off (CA_GATE_LOCKS, 2026-10-07).
  // Except a student coming BACK from a Song Journey page ("Back to class
  // site" when the tab can't just close): that link names the card they came
  // from, and sending them somewhere else is the opposite of "back".
  // Honoured ONCE per page load: document.referrer never changes, so on a
  // shared Chromebook a sign-out and the next student's sign-in in the same
  // tab (showApp runs per sign-in) would otherwise inherit the exemption.
  let fromJourney = false;
  if(!journeyReturnSeen){
    journeyReturnSeen = true;
    try { const r = new URL(document.referrer); fromJourney = r.origin === location.origin && /\/tabs\/[^/]+\.html$/.test(r.pathname); } catch(e) {}
  }
  /* Except the site's own reload for an update (swResumeTake, 2026-11-09):
     that is not a visit or a sign-in, so the student stays on the page they
     were on, the lesson included (a bare address). The address is the same
     one the note recorded, or the note is ignored. With the gate's lock on,
     routeExploreHash below still sends a gated student to In-Class
     Activities. */
  let resume = swResumeTake(user, false);
  if(resume && resume.hash !== location.hash) resume = null;
  if(!resume && (!location.hash ||
     (caBlockers().length > 0 && !fromJourney && !GATE_OPEN_HASHES.includes(exploreHashBase(location.hash))))){
    goExploreHash('class-activities');
  }
  swResumeRouting = !!resume;
  try { routeExploreHash(); } finally { swResumeRouting = false; }
  if(resume) swResumeApply(resume);
  // The period question blocks the whole app, so it still gets first crack
  // at the screen on sign-in.
  maybeShowPeriodPicker();
  // One long-lived listener on the live-quiz session doc, so a game the
  // teacher starts mid-period reaches a student who's had the site open all
  // along. Guarded: live-quiz.js is a separate deferred script.
  if(typeof lqStartListening === 'function') lqStartListening();
}

/* Set by showApp the first time it looks at document.referrer — see fromJourney. */
let journeyReturnSeen = false;

