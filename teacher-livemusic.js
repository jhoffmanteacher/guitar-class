/* ══ LIVE GAMES MUSIC — "Don't Stop Me Now" under the live games (2026-11-20) ══════════════════════════════════
   Jonathan, 2026-11-20: "can you also have it play the song 'don't stop me now' by queen as the game plays?", with
   the record attached. It plays on the CONSOLE (the room's speakers), never on a student's Chromebook.

   WHEN. While a game is on the console's Live In-Class Games view: the lobby, the questions, the results and the
   final scores. It fades out while a LISTENING question is open (a bank entry with `quiet: true`, live-quiz.js:
   "Which string am I playing?" and every Hear the chord change round), so it never covers the sound the students
   answer to, and fades back in at the results. Nothing running, or another console view: silent.
   A Play music / Stop music button in the control strip (Jonathan, same day: "with a play/stop button included")
   starts and stops it; Stop is kept on this device (`gc-lq-music`, like the strip's other settings). With no game
   running it plays only after Play was pressed in this console session, never just because the view opened. It
   loops, at LQM_VOL, so the teacher can talk over it. The games with no listening (Fretboard tap, the two power
   chord games) keep it playing through their questions (Jonathan: "it should play over the games that don't have
   listening though like power chord one").

   THE FILE. A full commercial recording, so it is not in the public audio/ folder: it is a private song file
   (app/songfiles.js, SONG_FILES "queen-dont-stop-me-now-full"), behind the sign-in, uploaded once by Jonathan in
   Manage → Song files and kept in the console's device copy after the first play. Until it is uploaded the strip
   says so in one line and the games run silent, as before.

   HOOKS. lqPaintStage (live-quiz.js) calls lqMusicSync() after every paint, which is after every change to the
   session (a snapshot, a preview write, Exit preview) and every answer; setTeacherView (teacher-core.js) calls
   lqMusicStop() on the way out of the view. Both behind typeof guards: the students' page and the Journey pages
   never load this part. */
const LQM_SRC = 'private:queen-dont-stop-me-now-full';   // a private song file, named like a track's path (checks.mjs 1dz reads this line)
const LQM_ID = LQM_SRC.slice('private:'.length);
const LQM_VOL = 0.45;            // of full volume: under the teacher's voice
const LQM_FADE_MS = 700;
let lqmOn = true;                // the Play / Stop button (kept on this device)
try { lqmOn = localStorage.getItem('gc-lq-music') !== '0'; } catch(e){ lqmOn = true; }
let lqmPressed = false;          // Play pressed in this console session: then it plays with no game running too
let lqmAudio = null;             // the one audio element, made on first play
let lqmLoading = null;           // the load in flight
let lqmErr = '';                 // why it cannot play ('' = fine), shown in the strip
let lqmFade = null;              // the fade timer
let lqmWant = false;             // the last decision, so a repaint does not restart a fade

// A listening question is open: the music waits (and the strip says so).
function lqMusicHeld(){
  const s = typeof lqTSession !== 'undefined' ? lqTSession : null;
  return !!(s && s.state === 'question' && lqQuiz(s.quizId).quiet);
}
function lqMusicWanted(){
  if(!lqmOn || lqmErr) return false;
  if(typeof teacherView === 'undefined' || teacherView !== 'livequiz') return false;
  const s = typeof lqTSession !== 'undefined' ? lqTSession : null;
  const game = !!(s && ['lobby', 'question', 'reveal', 'ended'].includes(s.state));
  if(!game) return lqmPressed;   // nothing running: only after Play was pressed here, never on just opening the view
  return !lqMusicHeld();
}
function lqMusicSync(){
  const want = lqMusicWanted();
  if(want === lqmWant && !(want && !lqmAudio && !lqmLoading)) return;
  lqmWant = want;
  if(want) lqMusicIn(); else lqMusicOut();
}
function lqMusicFadeTo(vol, done){
  if(lqmFade){ clearInterval(lqmFade); lqmFade = null; }
  const a = lqmAudio;
  if(!a){ if(done) done(); return; }
  const from = a.volume, t0 = performance.now();
  lqmFade = setInterval(() => {
    const k = Math.min(1, (performance.now() - t0) / LQM_FADE_MS);
    a.volume = Math.max(0, Math.min(1, from + (vol - from) * k));
    if(k >= 1){ clearInterval(lqmFade); lqmFade = null; if(done) done(); }
  }, 40);
}
function lqMusicIn(){
  if(lqmLoading) return;
  if(!lqmAudio){
    if(typeof songFileLoad !== 'function'){ lqmErr = 'the song player is not on this page'; lqMusicRepaint(); return; }
    lqmLoading = songFileLoad(LQM_ID).then(url => {
      lqmLoading = null;
      const a = new Audio(url);
      a.loop = true; a.volume = 0; a.preload = 'auto';
      lqmAudio = a;
      lqmWant = false;          // decide again now the song is here
      lqMusicSync();
    }, e => {
      lqmLoading = null;
      const code = e && e.code;
      lqmErr = code === 'notready' || code === 'missing' ? 'not uploaded yet: Manage → Song files, upload the Queen mp3'
        : code === 'limit' ? 'this month\'s song downloads are used up'
        : code === 'signin' ? 'sign in to play it'
        : 'it did not load (' + (code || 'error') + ')';
      console.warn('[live-games music] ' + lqmErr, e);
      lqmWant = false;
      lqMusicRepaint();
    });
    return;
  }
  const p = lqmAudio.play();
  /* The browser may hold sound back until the page has been clicked. Then the button reads Play music (not saved:
     the teacher did not stop it), and pressing it is the click the browser waits for. */
  if(p && p.catch) p.catch(e => {
    if(e && e.name === 'AbortError') return;    // a pause came first: nothing is wrong
    console.warn('[live-games music] play refused', e);
    lqmOn = false; lqmWant = false; lqMusicRepaint();
  });
  lqMusicFadeTo(LQM_VOL);
}
function lqMusicOut(){
  if(!lqmAudio) return;
  lqMusicFadeTo(0, () => { if(!lqmWant && lqmAudio) lqmAudio.pause(); });
}
// Leaving the view (setTeacherView): silence at once, the place in the song kept.
function lqMusicStop(){
  lqmWant = false;
  if(lqmFade){ clearInterval(lqmFade); lqmFade = null; }
  if(lqmAudio){ lqmAudio.pause(); lqmAudio.volume = 0; }
}
// The strip's Play music / Stop music button.
// What the button shows: on, nothing wrong, and a game running or Play already pressed here.
function lqMusicAudible(){
  const s = typeof lqTSession !== 'undefined' ? lqTSession : null;
  return lqmOn && !lqmErr && (lqmPressed || !!(s && ['lobby', 'question', 'reveal', 'ended'].includes(s.state)));
}
function lqMusicToggle(){
  lqmOn = !lqMusicAudible();   // the button does what its label says
  // Play tries the store again after any failure but the month's limit and a page with no song player.
  if(lqmOn){ lqmPressed = true; lqmErr = /used up|not on this page/.test(lqmErr) ? lqmErr : ''; }
  try { localStorage.setItem('gc-lq-music', lqmOn ? '1' : '0'); } catch(e){}
  if(!lqmOn) lqMusicStop();
  lqMusicSync();
  lqMusicRepaint();
}
function lqMusicRepaint(){ if(typeof lqPaintControls === 'function') lqPaintControls(); }
// The strip's button, in every state (lqPaintControls), with one line when it is silent for a reason.
function lqMusicInputHtml(){
  const why = lqmErr ? lqmErr : (lqmOn && lqMusicHeld() ? 'paused during this listening question' : '');
  // "Stop music" only while it is (or is about to be) heard: with no game and no Play pressed yet it is silent, so Play.
  return `<button type="button" class="lq-ctl ghost" id="lq-music" onclick="lqMusicToggle()">${lqMusicAudible() ? '■ Stop music' : '▶ Play music'}</button>`
    + (why ? `<span class="lq-ctl-hint" style="flex-basis:auto">(${escHtml(why)})</span>` : '');
}
