/* ════════════════════════════════════════════════════════════════════
   Guitar Class — LIVE GAME "Hear the Chord Change"  (2026-11-20)

   Jonathan, 2026-11-20: "a live in-class game where students push the
   spacebar every time they hear a chord change within 0.5 seconds of the
   change", for Sweet Child O' Mine, "the cure" and All Along the Watchtower.
   His two calls (same day): the song plays on the ROOM SPEAKERS (the teacher
   console), and a press counts from 0 to 0.5 s AFTER the change.

   It is one more game of the Live In-Class Games bank (LIVE_QUIZZES['changes'],
   type 'changes', live-quiz.js), which keeps everything a live game already
   has: the invite, the lobby, the rounds ("Question 3 of 10"), the Top 3, the
   final board, Preview, Hide names. This file holds only what is new, and
   live-quiz.js calls into it from its lqType() branches. It loads right
   after live-quiz.js on index.html, and NOT on the Journey pages (they show
   the "a game is running" banner only), so every call into it from
   live-quiz.js sits behind a typeof guard.

   ── One round ──
   The teacher picks a song and one section of it (the sections of the
   song's power-chord play-along card: ca-33, ca-30, ca-29; the same data the
   Lyrics and Chords cards play, so the chord changes are the ones those
   cards and their sheets already agree on, checks.mjs 1bf2). The console
   plays that section of the FULL mix (the band with the guitar in) at
   normal speed, starting one bar early, and stops half a second after it.

   ── Why every Chromebook scores itself ──
   The answer rule (firestore.rules, liveQuiz/current/answers/{uid}) lets a
   student write one short `choice` (64 characters) while the round is open,
   and nothing else. A list of press times does not fit, and changing the
   rule would mean a console paste. So each Chromebook matches its own
   presses against the changes and writes "cc:<caught>/<changes>/<extra>"
   once, when the section is over; the console turns that into points at
   Reveal (the same honesty level as `ms` in every other game: a student who
   edits the page could lie, see the rules' HONEST LIMIT).

   ── The clock (the hard part) ──
   The song is in the room; each press is timed on a Chromebook. Both are put
   on the database's clock:
   - The console times its own clock against the database: it writes
     `cc.clk` (a server timestamp) a few times and reads it back. The true
     server time sits between the send and the reply, so each sample is good
     to half its round trip; the shortest round trip wins (lqCcPing).
   - Once the song is playing, the console works out when the file's 0:00
     was, in database time (lqCcMeasureT0: the audio element's position,
     minus the output latency), and writes it as `cc.t0`.
   - Each Chromebook sees every `cc.clk` arrive. Arrival minus the stamp is
     its clock difference plus the delivery delay; the SMALLEST such gap is
     the best guess (lqCcOnSession). What is left over is that smallest
     delivery delay (tens of ms on school wifi), which makes a press read a
     little EARLY, never late.
   - A press's place in the song = (press time on the Chromebook's own
     clock, from the key event's own timestamp, + its clock difference) - t0.
   LQ_CC_EARLY lets a press read up to 0.1 s before the change still count:
   that covers the timing error above and the sound's trip across the room
   (about 3 ms a metre). It is not a "before the change" rule: a student
   cannot hear a change before it happens, so a real early press is a guess.

   ── Scoring ──
   A change is caught by the first press from LQ_CC_EARLY before it to
   LQ_CC_LATE (0.5 s) after it. Every press that catches nothing is an
   extra press. Points for the round: 1000 x (caught - extra) / changes,
   never below 0. So pressing all the time scores nothing, and a student who
   catches every change and never presses in between scores 1000. One press
   catches at most one change. Two windows CAN overlap: Sweet Child's Solo 2,
   Outro and Ending have a C D G bar, one beat (about 0.47 s) per chord, so a
   press there goes to the EARLIEST change it can still catch, which is the
   pairing that catches the most (tools/live-changes-sim.mjs tests that spot).
   Everywhere else in the three songs the changes are 0.78 s or more apart.

   ── The session doc (liveQuiz/current) while a round is open ──
     target  { song, si }  the song id and the section's index in its card
     cc      { start, end, changes, t0, cut, clk, ping }
             start/end: the section's first and last moment, in seconds of
             the file; changes: every chord change from start to end, in
             seconds of the file; t0: the database time (ms) of the file's
             0:00, null until the song is playing; cut: where the teacher
             stopped it early (seconds of the file), else null; clk: a
             server timestamp, rewritten by every console write of the round;
             ping: which write it was.
     limitSec is 0: the song is the clock.
   Nothing in it names a student. The tally at Reveal is
   { caught, changes, extra, players }: class totals only.
   ════════════════════════════════════════════════════════════════════ */

/* The three songs, in the order of the strip. `card`: the play-along card
   whose sections (and chord timing) a round plays. `title`: the song's name,
   the same in both languages. */
const LQ_CC_SONGS = [
  { id: 'sweet-child-o-mine',       card: 'ca-33', title: 'Sweet Child O’ Mine' },
  { id: 'the-cure',                 card: 'ca-30', title: '“the cure”' },
  { id: 'all-along-the-watchtower', card: 'ca-29', title: 'All Along the Watchtower' }
];
const LQ_CC_EARLY = 0.1;          // s before a change a press may read and still count (timing error, see above)
const LQ_CC_LATE  = 0.5;          // s after a change a press counts (Jonathan, 2026-11-20)
const LQ_CC_SEND_MS  = 700;       // a Chromebook sends its result this long after the section ends
const LQ_CC_GRACE_MS = 2500;      // the console reveals this long after the song stops
const LQ_CC_TAIL = 0.6;           // s the song plays on past the section (a press for the last change has room)

function lqCcSong(id){ return LQ_CC_SONGS.find(x => x.id === id) || null; }
function lqCcCard(id){
  const song = lqCcSong(id);
  const list = typeof window !== 'undefined' && Array.isArray(window.CLASS_ACTIVITIES) ? window.CLASS_ACTIVITIES : [];
  const a = song ? list.find(x => x && x.id === song.card) : null;
  return a && a.card && Array.isArray(a.card.sections) ? a.card : null;
}
function lqCcTrack(id){ return typeof SNIPPET_TRACKS !== 'undefined' ? SNIPPET_TRACKS[id] || null : null; }
// A section's name in the given language: the card's own label.
function lqCcSectionLabel(songId, si, lang){
  const c = lqCcCard(songId), S = c ? c.sections[Number(si)] : null;
  if(!S) return '';
  return (lang === 'es' && S.label_es) ? S.label_es : (S.label || '');
}
// "Sweet Child O' Mine — Verse 1": the round's name on the stage and on a student's screen.
function lqCcRoundName(target, lang){
  const song = target ? lqCcSong(target.song) : null;
  if(!song) return '';
  const sec = lqCcSectionLabel(target.song, target.si, lang);
  return song.title + (sec ? ' — ' + sec : '');
}

/* Every chord change in a song: { t, chord, si } with t in seconds of the
   FAST FULL MIX (the file the console plays), in order. A change is a note
   whose chord differs from the last chord that sounded (a rest changes
   nothing), the same rule pcSheetMap counts the sheets' chord names by
   (app/cards-sheet.js), without its "named again" exception, which names a
   chord twice on paper but changes nothing in the music. The first chord of
   the song is not a change (nothing sounded before it). */
function lqCcChanges(songId){
  const c = lqCcCard(songId), tr = lqCcTrack(songId);
  if(!c || !tr || typeof snippetWindow !== 'function' || typeof snipTimeAtBars !== 'function') return null;
  const bpb = tr.beatsPerBar > 0 ? tr.beatsPerBar : 4;
  const last = c.sections[c.sections.length - 1];
  const totalBars = last.fromBar + last.bars * Math.max(1, last.reps || 1) - 1;
  const win = snippetWindow(tr, { fromBar: 1, bars: totalBars }, false, true);
  const out = [];
  let prev = null;
  c.sections.forEach((S, si) => {
    const reps = Math.max(1, S.reps || 1);
    for(let r = 0; r < reps; r++){
      let beat = r * S.bars * bpb;
      (S.notes || []).forEach(nt => {
        if(!nt.rest && nt.note !== prev){
          if(prev !== null) out.push({ t: snipTimeAtBars(win, (S.fromBar - 1) + beat / bpb), chord: nt.note, si });
          prev = nt.note;
        }
        beat += nt.beats > 0 ? nt.beats : 1;
      });
    }
  });
  return out;
}

/* What one round plays: the file, where the section starts and ends (seconds
   of the file), where the song starts (one bar early), and the section's
   changes. A change right on the section's first beat counts (the chord
   before it was the previous section's). null for a song or section that is
   not there. */
function lqCcPlan(songId, si){
  const c = lqCcCard(songId), tr = lqCcTrack(songId);
  const S = c ? c.sections[Number(si)] : null;
  if(!S || !tr || typeof snippetWindow !== 'function' || typeof snippetSrc !== 'function') return null;
  const win = snippetWindow(tr, { fromBar: S.fromBar, bars: S.bars * Math.max(1, S.reps || 1) }, false, true);
  const all = lqCcChanges(songId);
  if(!all) return null;
  const changes = all.filter(x => x.t >= win.start - 0.01 && x.t < win.end - 0.01).map(x => Math.round(x.t * 1000) / 1000);
  return {
    src: snippetSrc(tr, false, true),
    start: Math.round(win.start * 1000) / 1000,
    end: Math.round(win.end * 1000) / 1000,
    from: Math.max(0, win.start - win.bar),
    changes
  };
}
// The changes a round counts: those before the end, or before the teacher's
// Stop when he stopped it early.
function lqCcCounted(cc){
  if(!cc || !Array.isArray(cc.changes)) return [];
  const end = lqCcEnd(cc);
  return cc.changes.filter(t => Number.isFinite(Number(t)) && Number(t) < end);
}
function lqCcEnd(cc){
  const end = Number(cc && cc.end) || 0, cut = cc && cc.cut != null ? Number(cc.cut) : NaN;
  return Number.isFinite(cut) ? Math.min(end, cut) : end;
}

/* Matches presses to changes. `presses`: seconds of the file. Presses before
   the section starts (the bar played before it) are not counted at all; a
   press after the end counts as extra unless it catches the last change. */
function lqCcMatch(changes, presses, start, end){
  const ch = changes.slice().sort((a, b) => a - b);
  const used = ch.map(() => false);
  let caught = 0, extra = 0;
  presses.slice().sort((a, b) => a - b).forEach(p => {
    if(p < start - LQ_CC_EARLY || p > end + LQ_CC_LATE) return;
    const i = ch.findIndex((c, k) => !used[k] && p >= c - LQ_CC_EARLY && p <= c + LQ_CC_LATE);
    if(i >= 0){ used[i] = true; caught++; } else extra++;
  });
  return { caught, changes: ch.length, extra };
}
// The answer doc's `choice`: "cc:12/16/3". Under the rule's 64 characters by far.
function lqCcChoice(r){ return 'cc:' + r.caught + '/' + r.changes + '/' + r.extra; }
function lqCcParse(choice){
  const m = /^cc:(\d{1,4})\/(\d{1,4})\/(\d{1,5})$/.exec(String(choice || ''));
  return m ? { caught: Number(m[1]), changes: Number(m[2]), extra: Number(m[3]) } : null;
}
// Points for one round, against the number of changes the CONSOLE counted
// (a student's own count is not trusted for the total; caught is capped by it).
function lqCcPoints(r, total){
  if(!r || !(total > 0)) return 0;
  const caught = Math.min(r.caught, total);
  return Math.round(LQ_MAX_POINTS * Math.max(0, caught - r.extra) / total);
}

/* ══════════════════════════════════════════════════════════════
   STUDENT SIDE
   ══════════════════════════════════════════════════════════════ */
function lqCcNow(){ return performance.timeOrigin + performance.now(); }
// The smallest (arrival - stamp) seen this game, in ms: database time = local time - lqCcSkew.min.
let lqCcSkew = { sessionId: null, min: Infinity, seen: new Set() };
// This round on this Chromebook: its presses (local ms), whether its result went out.
let lqCcRound = { key: null, presses: [], sent: false, sending: false, result: null };
let lqCcTimer = null;
/* Who counts (2026-11-23). Every signed-in page sees the round, joined or not, and used to send "cc:0/N/0" when it
   ended, so a student who dismissed the invite counted as a 0-point player and lowered the stage's "% caught". A
   page now sends only when this student JOINED this game: the game screen was open on this page at some moment of
   the game (Join, the banner, #live-quiz), or they pressed in this round. A student who joined and pressed nothing
   still sends 0 caught; one who never opened the game sends nothing and adds nothing to `players`. The sessionId of
   the game this page joined (memory only: a reload back onto the game screen joins again at once). */
let lqCcJoinedId = null;
/* The clock across a reload (2026-11-23). The console writes no cc.clk after t0, so a page that reloads mid-song
   sees only the t0 write's stamp, as old as the song is long so far, and read its clock off by that much (30 s
   into a song: every press read 30 s early, nothing caught). The best (smallest) gap is therefore kept in
   sessionStorage for this game, converted to the wall clock (Date.now), which a reload keeps (the page clock,
   timeOrigin + now, starts again with the new page and can lag the wall clock after a sleep). A stale stamp still
   goes through Math.min, where it can only lose to the kept one. A NEW tab or another device has nothing kept: there
   the stale stamp is still the only reading (as before). */
const LQ_CC_CLOCK_KEY = 'lq-cc-clock';
function lqCcSaveClock(){
  if(!Number.isFinite(lqCcSkew.min) || !lqCcSkew.sessionId) return;
  const d = lqCcSkew.min - (lqCcNow() - Date.now());
  try { sessionStorage.setItem(LQ_CC_CLOCK_KEY, JSON.stringify({ sessionId: lqCcSkew.sessionId, d })); } catch(e){}
}
function lqCcLoadClock(sessionId){
  let v = null;
  try { v = JSON.parse(sessionStorage.getItem(LQ_CC_CLOCK_KEY) || 'null'); } catch(e){ v = null; }
  if(!v || v.sessionId !== sessionId || !Number.isFinite(Number(v.d))) return Infinity;
  return Number(v.d) + (lqCcNow() - Date.now());
}
function lqCcScreenOpen(){
  const scr = typeof document !== 'undefined' ? document.getElementById('live-quiz-screen') : null;
  return !!(scr && !scr.hidden);
}
// Marks this game joined when the game screen is open now. Called on every snapshot, tick and press.
function lqCcNoteJoined(sessionId){
  if(sessionId && lqCcJoinedId !== sessionId && lqCcScreenOpen()) lqCcJoinedId = sessionId;
}

function lqCcIsRound(s){ return !!(s && s.state === 'question' && lqType(lqQuiz(s.quizId)) === 'changes'); }
// This round's result has gone out: sent from this page, or read back after a reload (lqRestoreMyAnswer).
function lqCcDone(s){
  if(lqCcRound.sent) return true;
  return !!(s && lqMyAnswer && lqMyAnswer.qIndex === s.qIndex && lqCcParse(lqMyAnswer.choice));
}
// Called by lqOnSession (live-quiz.js) for every snapshot of liveQuiz/current.
function lqCcOnSession(data, live){
  const arrived = lqCcNow();
  if(data && data.sessionId !== lqCcSkew.sessionId) lqCcSkew = { sessionId: data.sessionId, min: lqCcLoadClock(data.sessionId), seen: new Set() };
  const clk = data && data.cc ? lqTsMs(data.cc.clk) : 0;
  if(clk && !lqCcSkew.seen.has(clk)){            // each stamp once: a cached copy arriving again later says nothing new
    lqCcSkew.seen.add(clk);
    if(arrived - clk < lqCcSkew.min){ lqCcSkew.min = arrived - clk; lqCcSaveClock(); }
  }
  if(live) lqCcNoteJoined(live.sessionId);
  if(live && lqCcIsRound(live)){
    const key = live.sessionId + ':' + live.qIndex + ':' + lqUid();
    if(lqCcRound.key !== key){
      lqCcRound = { key, presses: [], sent: false, sending: false, result: null };
    }
    // A reload after the result went out: the read-back pick (lqRestoreMyAnswer) is the result.
    if(lqMyAnswer && lqMyAnswer.qIndex === live.qIndex && lqCcParse(lqMyAnswer.choice)){
      lqCcRound.sent = true; lqCcRound.result = lqCcParse(lqMyAnswer.choice);
    }
  }
  lqCcSync();
}
// The send timer runs only while a round is open on this page and its result has not gone out.
function lqCcSync(){
  const s = lqSessionIsLive(lqSession) ? lqSession : null;
  const need = !!(s && lqCcIsRound(s) && lqCanPlayHere() && !lqCcDone(s));
  if(need && !lqCcTimer) lqCcTimer = setInterval(lqCcTick, 200);
  if(!need) lqCcStop();
}
function lqCcStop(){ if(lqCcTimer){ clearInterval(lqCcTimer); lqCcTimer = null; } }
// Sign-out (lqStopListening): nothing of this student's round may stay for the next one.
function lqCcReset(){
  lqCcStop();
  lqCcRound = { key: null, presses: [], sent: false, sending: false, result: null };
  lqCcSkew = { sessionId: null, min: Infinity, seen: new Set() };
  lqCcJoinedId = null;
  try { sessionStorage.removeItem(LQ_CC_CLOCK_KEY); } catch(e){}
}
function lqCcTick(){
  const s = lqSessionIsLive(lqSession) ? lqSession : null;
  if(!s || !lqCcIsRound(s)){ lqCcStop(); return; }
  lqCcNoteJoined(s.sessionId);
  // Not joined and no press: send nothing (the timer keeps looking until the round closes, so joining late still counts).
  if(lqCcJoinedId !== s.sessionId && !lqCcRound.presses.length) return;
  const cc = s.cc || {};
  const t0 = Number(cc.t0);
  if(!(t0 > 0) || !Number.isFinite(lqCcSkew.min)) return;     // the song has not started yet
  const serverNow = lqCcNow() - lqCcSkew.min;
  if(serverNow < t0 + lqCcEnd(cc) * 1000 + LQ_CC_SEND_MS) return;
  lqCcSend(s);
}
// The result, worked out from this Chromebook's presses and sent once.
function lqCcResultFor(s){
  const cc = s.cc || {};
  const t0 = Number(cc.t0);
  const presses = lqCcRound.presses.map(ms => (ms - lqCcSkew.min - t0) / 1000);
  return lqCcMatch(lqCcCounted(cc), presses, Number(cc.start) || 0, lqCcEnd(cc));
}
function lqCcSend(s){
  if(lqCcDone(s) || lqCcRound.sending || !lqUid()) return;
  const result = lqCcResultFor(s);
  const choice = lqCcChoice(result);
  const qIndex = s.qIndex, key = lqCcRound.key;
  if(typeof isDevBypassUser === 'function' && isDevBypassUser()){
    lqCcRound.sent = true; lqCcRound.result = result;
    lqMyAnswer = { qIndex, choice }; lqCcStop(); lqRenderStudent(); return;
  }
  lqCcRound.sending = true;
  lqWriteAnswer(s, qIndex, choice, 0).then(() => {
    if(lqCcRound.key !== key) return;
    lqCcRound.sending = false; lqCcRound.sent = true; lqCcRound.result = result; lqSendError = false;
    lqMyAnswer = { qIndex, choice };
    lqCcStop(); lqRenderStudent();
  }).catch(e => {
    console.warn('[live-quiz] chord-change result did not send', e);
    if(lqCcRound.key !== key) return;
    lqCcRound.sending = false; lqSendError = true;   // the timer tries again while the round is open
    lqRenderStudent();
  });
}

// One press: from the key or the button's own event time, on this Chromebook's clock.
function lqCcPress(e){
  const s = lqSessionIsLive(lqSession) ? lqSession : null;
  if(!s || !lqCcIsRound(s) || lqCcDone(s) || lqCcRound.sending) return;
  const at = (e && e.timeStamp > 0) ? performance.timeOrigin + e.timeStamp : lqCcNow();
  lqCcRound.presses.push(at);
  lqCcJoinedId = s.sessionId;
  const n = document.getElementById('lq-cc-n');
  if(n) n.textContent = t('lq.cc.presses', { n: lqCcRound.presses.length });
  const btn = document.getElementById('lq-cc-tap');
  if(btn){ btn.classList.remove('hit'); void btn.offsetWidth; btn.classList.add('hit'); }
}
// The space bar counts only while a round is on the screen: the live game
// screen is open, on the site, not on the console.
function lqCcKeyLive(){
  if(typeof IS_TEACHER_MODE !== 'undefined' && IS_TEACHER_MODE) return false;
  const scr = document.getElementById('live-quiz-screen');
  if(!scr || scr.hidden || !document.getElementById('lq-cc-tap')) return false;
  const s = lqSessionIsLive(lqSession) ? lqSession : null;
  return !!(s && lqCcIsRound(s));
}
function lqCcIsSpace(e){ return e.code === 'Space' || e.key === ' ' || e.key === 'Spacebar'; }
document.addEventListener('keydown', e => {
  if(!lqCcIsSpace(e) || !lqCcKeyLive()) return;
  e.preventDefault();                       // no page scroll, and no click on a focused button
  if(!e.repeat) lqCcPress(e);               // a held key is one press
}, true);
document.addEventListener('keyup', e => { if(lqCcIsSpace(e) && lqCcKeyLive()) e.preventDefault(); }, true);

function lqCcStudentQuestionHtml(s){
  const lang = typeof getLang === 'function' ? getLang() : 'en';
  const name = lqCcRoundName(s.target, lang);
  const cc = s.cc || {};
  const head = lqQNumHtml(s)
    + (name ? `<div class="lq-cc-song">${escHtml(name)}</div>` : '')
    + `<div class="lq-prompt" data-i18n="lq.prompt.changes">${escHtml(t('lq.prompt.changes'))}</div>`;
  if(lqCcDone(s)){
    const r = lqCcRound.result || lqCcParse(lqMyAnswer && lqMyAnswer.choice);
    const line = r ? `<div class="lq-cc-note">${escHtml(t('lq.cc.caught', { caught: r.caught, total: r.changes }))}</div>` : '';
    return head + `<div class="lq-locked">${line}<div class="lq-locked-wait" data-i18n="lq.lockedWait">${escHtml(t('lq.lockedWait'))}</div></div>`;
  }
  // The line keeps its height once the song is playing, so the button does not jump under a student's finger.
  const status = Number(cc.t0) > 0 ? '<div class="lq-cc-note" aria-hidden="true">\u00a0</div>'
    : `<div class="lq-cc-note" data-i18n="lq.cc.ready">${escHtml(t('lq.cc.ready'))}</div>`;
  const err = lqSendError ? `<p class="lq-note lq-note-bad" data-i18n="lq.cc.notSent">${escHtml(t('lq.cc.notSent'))}</p>` : '';
  return head + status
    + `<button type="button" class="lq-cc-tap" id="lq-cc-tap" onpointerdown="lqCcPress(event)"><span data-i18n="lq.cc.tap">${escHtml(t('lq.cc.tap'))}</span></button>`
    + `<div class="lq-cc-n" id="lq-cc-n">${escHtml(t('lq.cc.presses', { n: lqCcRound.presses.length }))}</div>`
    + `<div class="lq-cc-rule" data-i18n="lq.cc.rule">${escHtml(t('lq.cc.rule'))}</div>` + err;
}

function lqCcStudentRevealHtml(s){
  const mine = (lqMyAnswer && lqMyAnswer.qIndex === s.qIndex) ? lqCcParse(lqMyAnswer.choice) : null;
  const me = (s.scores || {})[lqUid()] || null;
  const total = lqCcCounted(s.cc).length;
  if(!mine) return `<div class="lq-verdict lq-v-none" data-i18n="lq.noAnswer">${escHtml(t('lq.noAnswer'))}</div>` + lqScoreLineHtml(s);
  const caught = Math.min(mine.caught, total);
  const pts = me && me.lastRight !== null ? Number(me.last) || 0 : null;
  const cls = caught > 0 && pts ? 'lq-v-yes' : 'lq-v-no';
  const plus = pts != null ? ` <span class="lq-plus">+${escHtml(String(pts))}</span>` : '';
  return `<div class="lq-verdict ${cls}"><span>${escHtml(t('lq.cc.caught', { caught, total }))}</span>${plus}</div>`
    + `<div class="lq-answer">${escHtml(t('lq.cc.extra', { n: mine.extra }))}</div>`
    + lqScoreLineHtml(s);
}

/* ══════════════════════════════════════════════════════════════
   TEACHER SIDE — the strip's song and section buttons, the song itself
   ══════════════════════════════════════════════════════════════ */
let lqTCcSong = LQ_CC_SONGS[0].id;      // the song picked in the strip
// The round the console is playing: its key, the audio element, its plan, timers.
let lqTCc = null;

function lqCcPickerHtml(busy){
  const songs = LQ_CC_SONGS.map(x =>
    `<button type="button" class="lq-ctl${x.id === lqTCcSong ? ' go' : ' ghost'}" data-cc-song="${escAttr(x.id)}" onclick="lqTCcSong=this.dataset.ccSong;lqPaintControls()">${escHtml(x.title)}</button>`).join('');
  const c = lqCcCard(lqTCcSong);
  const secs = c ? c.sections.map((S, si) =>
    `<button type="button" class="lq-ctl mark" style="--lq-c:#185fa5" onclick="lqTeacherOpenChanges(${si})"${busy}>${escHtml(S.label || ('Part ' + (si + 1)))}</button>`).join('') : '';
  return `<div class="lq-ctl-marks">${songs}</div><div class="lq-ctl-marks">${secs}</div>`;
}
function lqCcStatusHtml(){
  const st = lqTCc;
  if(!st || !lqTSession || st.key !== lqTSession.sessionId + '#' + lqTSession.qIndex) return '';
  return st.error ? `<div class="lq-ctl-hint"><b>The song did not play</b> (${escHtml(st.error)}). Press Stop the song to close the round.</div>` : '';
}

// Opens a round: the section's plan goes into the doc, then the clock pings, then the song.
async function lqTeacherOpenChanges(si){
  const s = lqTSession;
  if(!s || lqType(lqQuiz(s.quizId)) !== 'changes' || lqTBusy) return;
  const plan = lqCcPlan(lqTCcSong, si);
  if(!plan || !plan.changes.length){ alert('That section has no chord changes to play.'); return; }
  lqCcStopAudio();
  // Load the song now, at the click, so it is ready when the pings are done.
  const audio = new Audio();
  audio.preload = 'auto';
  audio.src = plan.src;
  try { audio.load(); } catch(e){}
  const cc = { start: plan.start, end: plan.end, changes: plan.changes, t0: null, cut: null, clk: firebase.firestore.FieldValue.serverTimestamp(), ping: 0 };
  const ok = await lqTeacherNext({ song: lqTCcSong, si: Number(si) }, { limitSec: 0, cc });
  const now = lqTSession;
  if(ok !== true || !now || now.state !== 'question'){ try { audio.removeAttribute('src'); audio.load(); } catch(e){} return; }
  lqTCc = { key: now.sessionId + '#' + now.qIndex, audio, plan, cc: Object.assign({}, cc, { clk: null }), offset: 0, rtt: Infinity, timer: null, revealTimer: null, error: '', stopped: false };
  lqCcRun(lqTCc);
}
function lqCcCurrent(st){ return !!(st && lqTCc === st && lqTSession && lqTSession.state === 'question' && st.key === lqTSession.sessionId + '#' + lqTSession.qIndex); }
// The console's writes inside a round: the whole `cc` map each time (a preview applies it to its own copy).
function lqCcWrite(st, patch){
  st.cc = Object.assign({}, st.cc, patch);
  if(lqTPreview){
    if(lqTSession) lqTSession = Object.assign({}, lqTSession, { cc: Object.assign({}, st.cc, { clk: null }) });
    lqPaintStage();
    return Promise.resolve(true);
  }
  st.ping = (st.ping || 0) + 1;
  const ping = st.ping;
  const cc = Object.assign({}, st.cc, { clk: firebase.firestore.FieldValue.serverTimestamp(), ping });
  return lqEnsureDb().then(() => lqDoc().set({ cc }, { merge: true })).then(() => ping);
}
const lqCcSleep = ms => new Promise(r => setTimeout(r, ms));
// One clock sample: write a server stamp, wait for the database's own copy of it to come back.
async function lqCcPing(st){
  const sent = lqCcNow();
  const ping = await lqCcWrite(st, {});
  const acked = lqCcNow();
  for(let i = 0; i < 30; i++){
    const cc = lqTReal && lqTReal.cc;
    if(cc && cc.ping === ping && lqTsMs(cc.clk)){
      const rtt = acked - sent;
      if(rtt < st.rtt){ st.rtt = rtt; st.offset = lqTsMs(cc.clk) - (sent + acked) / 2; }
      return;
    }
    await lqCcSleep(50);
  }
}
// The database time of the file's 0:00: five readings of the audio's position, the middle one.
async function lqCcMeasureT0(st){
  const lat = typeof snipLatency === 'function' ? snipLatency() : 0.08;
  const vals = [];
  for(let i = 0; i < 5; i++){
    if(!lqCcCurrent(st) || st.audio.paused) return null;
    vals.push(lqCcNow() - st.audio.currentTime * 1000 + lat * 1000);
    await lqCcSleep(60);
  }
  vals.sort((a, b) => a - b);
  return Math.round(vals[2] + st.offset);
}
async function lqCcRun(st){
  try {
    if(!lqTPreview){
      for(let i = 0; i < 4 && lqCcCurrent(st); i++){ await lqCcPing(st); await lqCcSleep(150); }
      if(!Number.isFinite(st.rtt)) st.offset = 0;   // no reading came back: the console's clock stands in
    }
    if(!lqCcCurrent(st)) return;
    await new Promise((res, rej) => {
      const a = st.audio;
      if(a.readyState >= 1) return res();
      const done = () => { a.removeEventListener('loadedmetadata', done); a.removeEventListener('error', bad); res(); };
      const bad = () => { a.removeEventListener('loadedmetadata', done); a.removeEventListener('error', bad); rej(new Error('the file did not load')); };
      a.addEventListener('loadedmetadata', done); a.addEventListener('error', bad);
      setTimeout(() => rej(new Error('the file took too long to load')), 15000);
    });
    if(!lqCcCurrent(st)) return;
    // Jump to one bar before the section, and make sure the jump happened: a server that cannot send part of a file
    // plays from 0:00, and the room would hear the wrong part of the song.
    await new Promise((res, rej) => {
      const a = st.audio;
      const done = () => { a.removeEventListener('seeked', done); res(); };
      a.addEventListener('seeked', done);
      a.currentTime = st.plan.from;
      setTimeout(() => { a.removeEventListener('seeked', done); res(); }, 8000);
    });
    if(Math.abs(st.audio.currentTime - st.plan.from) > 0.5) throw new Error('could not jump to the section');
    if(!lqCcCurrent(st) || st.stopped) return;   // a Stop pressed before the song started: it never starts
    await st.audio.play();
    await new Promise(res => { if(!st.audio.paused && st.audio.readyState >= 3) res(); else { st.audio.addEventListener('playing', res, { once: true }); setTimeout(res, 3000); } });
    await lqCcSleep(300);
    const t0 = await lqCcMeasureT0(st);
    if(t0 == null || !lqCcCurrent(st)){ lqCcLeftBehind(st); return; }
    await lqCcWrite(st, { t0 });
    if(!lqCcCurrent(st) || st.stopped){ lqCcLeftBehind(st); return; }   // the round ended during the write: no watch for it
    st.timer = setInterval(() => lqCcWatch(st), 100);
  } catch(e){
    console.warn('[live-quiz] chord-change round: the song did not play', e);
    // A Stop pressed while play() was pending rejects it (AbortError): that is the teacher's stop, not a failure.
    if(lqTCc === st && !st.stopped){ st.error = (e && e.message) || 'no sound'; lqPaintControls(); }
  }
}
// The song is playing but its round stopped being current before the watch began (another console ended or cleared
// the game, or a real game replaced a Preview): no watch will ever silence it, so silence it here. Same test as lqCcWatch.
function lqCcLeftBehind(st){
  if(lqTCc === st && !lqCcCurrent(st)) lqCcStopAudio();
}
// The stage's progress bar, 0 to 100: full once the song is over or stopped.
function lqCcProgressPct(st){
  if(st.stopped) return 100;
  const p = (st.audio.currentTime - st.plan.start) / Math.max(0.1, lqCcEnd(st.cc) - st.plan.start);
  return Math.max(0, Math.min(100, p * 100)) || 0;
}
// While the song plays: the stage's progress bar, and the end.
function lqCcWatch(st){
  // A watch whose round is over stops itself only: it must never silence a later round (lqTCc is then another st).
  if(!lqCcCurrent(st)){ clearInterval(st.timer); st.timer = null; if(lqTCc === st) lqCcStopAudio(); return; }
  const a = st.audio, end = lqCcEnd(st.cc);
  const bar = document.getElementById('lq-cc-prog');
  if(bar) bar.style.width = lqCcProgressPct(st).toFixed(1) + '%';
  if(a.ended || a.currentTime >= end + LQ_CC_TAIL) lqCcFinish(st);
}
// The song is over (or stopped): silence, then Reveal once every Chromebook has had time to send.
function lqCcFinish(st){
  if(st.stopped) return;
  st.stopped = true;
  if(st.timer){ clearInterval(st.timer); st.timer = null; }
  try { st.audio.pause(); } catch(e){}
  const bar = document.getElementById('lq-cc-prog');
  if(bar) bar.style.width = '100%';
  st.revealTimer = setTimeout(() => {
    st.revealTimer = null;
    if(lqCcCurrent(st)) lqCcRevealWhenFree(st);
  }, LQ_CC_GRACE_MS);
}
function lqCcRevealWhenFree(st){
  if(!lqCcCurrent(st)) return;
  if(lqTBusy){ st.revealTimer = setTimeout(() => lqCcRevealWhenFree(st), 250); return; }
  lqTeacherRevealChanges();
}
// "Stop the song": the round ends where the song is now; changes after it do not count.
async function lqTeacherCcStop(){
  const st = lqTCc;
  const s = lqTSession;
  if(!s || s.state !== 'question' || lqType(lqQuiz(s.quizId)) !== 'changes') return;
  if(!lqCcCurrent(st)){ if(!lqTBusy) lqTeacherRevealChanges(); return; }   // nothing playing here (a reload): reveal what arrived
  if(st.stopped) return;
  const at = st.audio && !st.audio.paused ? st.audio.currentTime : st.plan.start;
  try { await lqCcWrite(st, { cut: Math.round(Math.max(st.plan.start, at) * 1000) / 1000 }); } catch(e){ console.warn('[live-quiz] could not save the stop', e); }
  lqCcFinish(st);
}
// Silences the console's song and drops its timers. Every way out of a round calls it.
function lqCcStopAudio(){
  const st = lqTCc;
  lqTCc = null;
  if(!st) return;
  if(st.timer) clearInterval(st.timer);
  if(st.revealTimer) clearTimeout(st.revealTimer);
  try { st.audio.pause(); st.audio.removeAttribute('src'); st.audio.load(); } catch(e){}
}

// Reveal: points from each Chromebook's result, against the changes the console counted.
async function lqTeacherRevealChanges(){
  const s = lqTSession;
  if(!s || s.state !== 'question' || lqType(lqQuiz(s.quizId)) !== 'changes') return;
  const total = lqCcCounted(s.cc).length;
  const rows = lqRoundAnswers(s, s.qIndex);
  const tally = { caught: 0, changes: 0, extra: 0, players: 0 };
  const pointsOf = a => {
    const r = lqCcParse(a.choice);
    if(!r) return 0;
    tally.caught += Math.min(r.caught, total); tally.changes += total; tally.extra += r.extra; tally.players++;
    return lqCcPoints(r, total);
  };
  const { scores } = lqScoreRound(s, rows, null, null, null, pointsOf);
  lqCcStopAudio();
  await lqWrite({ state: 'reveal', correct: null, correctIds: null, tally, scores }, 'fields');
}

/* ── The stage ── */
function lqCcStageQuestionHtml(s){
  const inCount = lqRoundAnswers(s, s.qIndex).length;
  const roster = lqRoster(s).length;
  const name = lqCcRoundName(s.target, 'en');
  // The stage is rebuilt on every answers snapshot: carry the bar's width over, or it drops back to empty.
  const st = lqTCc;
  const pct = lqCcCurrent(st) && st.key === s.sessionId + '#' + s.qIndex ? lqCcProgressPct(st) : 0;
  return lqStageQNumHtml(s)
    + (name ? `<div class="lq-st-title">${escHtml(name)}</div>` : '')
    + lqBilingual('lq.prompt.changes', 'lq-st-prompt')
    + `<div class="lq-cc-progress"><span id="lq-cc-prog" style="width:${pct.toFixed(1)}%"></span></div>`
    + `<div class="lq-st-count"><span class="lq-st-big">${inCount}${roster ? ' / ' + roster : ''}</span>`
    + `${lqBilingual('lq.stageAnswered', 'lq-st-cap')}</div>`;
}
function lqCcStageRevealHtml(s){
  const tl = s.tally || {};
  const pct = Number(tl.changes) > 0 ? Math.round(100 * Number(tl.caught) / Number(tl.changes)) : 0;
  const lb = lqStageTopHtml(lqRankedNamed(s));
  const name = lqCcRoundName(s.target, 'en');
  return lqBilingualParams('lq.cc.stageRound', 'lq-st-qnum', { n: Number(s.qIndex) + 1 }, { n: Number(s.qIndex) + 1 })
    + (name ? `<div class="lq-st-title">${escHtml(name)}</div>` : '')
    + `<div class="lq-st-split"><div class="lq-st-count"><span class="lq-st-big">${pct}%</span>${lqBilingualParams('lq.cc.stageCaught', 'lq-st-cap', { n: lqCcCounted(s.cc).length }, { n: lqCcCounted(s.cc).length })}</div>`
    + `<ol class="lq-lb lq-lb-stage">${lb}</ol></div>`;
}
