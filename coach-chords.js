/* ════════════════════════════════════════════════════════════════════
   CHANGE UP — chord-change game. Pick a chord loop and a tempo; after a
   count-in (4 clicks; 2 below 60 BPM, ccCountInBeats) you strum ON EVERY BEAT (silent visual pulse, same as
   the Coach — a speaker click would bleed into the mic). Chords switch
   every bar; the game grades each CHANGE: did a strum land on beat 1 of
   the new bar, and does it ring like the new chord's notes (hedged, never
   a claimed chord name). Levels are the loop length: 2 chords back and
   forth → 3 → 4. Pass a round (≥85%) and it offers +10 BPM (Power Chord
   Switch: +5, on its done screen's −5 / +5 row, not past the top tempo); best clean
   tempo per loop is remembered for the session.
   ════════════════════════════════════════════════════════════════════ */

const CC_PROGRESSIONS = [
  // 2 chords — back & forth
  { chords: ['Am','Em'] }, { chords: ['G','C'] }, { chords: ['A','D'] }, { chords: ['E','Am'] },
  { chords: ['C','F'] }, { chords: ['G','D'] }, { chords: ['Em','C'] }, { chords: ['Am','F'] },
  // 3 chords
  { chords: ['A','D','E'] }, { chords: ['G','C','D'] }, { chords: ['Am','C','G'] },
  { chords: ['G','D','C'] }, { chords: ['C','F','G'] }, { chords: ['Em','C','G'] }, { chords: ['D','A','G'] },
  // 4 chords
  { chords: ['C','G','Am','F'] }, { chords: ['G','D','Em','C'] }, { chords: ['Am','F','C','G'] },
  { chords: ['C','Am','F','G'] }, { chords: ['G','Em','C','D'] }, { chords: ['Em','C','G','D'] },
  // Random 4 — a fresh set of four chords is drawn each round (see ccRandomFour)
  { random: true, chords: ['C','G','D','A'] }
];
/* Pool the Random-4 mode draws four distinct chords from each round. Kept to the
   open chords students know, so any draw is playable. */
const CC_RANDOM_POOL = ['C','G','D','A','E','Am','Em','Dm','F'];
/* How often the chord switches. bpc = beats per chord; slots = chord positions
   in a round (so slots − 1 graded changes). Faster rates run fewer slots so the
   round stays a sensible length — every-bar ≈ 32 beats, every-beat ≈ 16. */
// shortKey/subKey resolved at render time in ccRenderSetup() — never here
// (this table is built once at load, so t() here would freeze one language in).
const CC_RATES = [
  { id: 'bar',  bpc: 4, slots: 8,  shortKey: 'games.cc.rate.bar',  subKey: 'games.cc.rate.barSub' },
  { id: 'half', bpc: 2, slots: 12, shortKey: 'games.cc.rate.half', subKey: 'games.cc.rate.halfSub' },
  { id: 'beat', bpc: 1, slots: 16, shortKey: 'games.cc.rate.beat', subKey: 'games.cc.rate.beatSub' }
];
/* Power Chord Switch opens on this speed (a change on every beat); the speed
   row is still there to slow it down. */
const CC_BEAT_IDX = CC_RATES.findIndex(r => r.id === 'beat');
const CC_BPM_MIN = 40, CC_BPM_MAX = 140;
/* Power Chord Switch goes down to 10 BPM (2026-11-05, Jonathan: "10-140"; it opens on CC_POWER_START_BPM, 30); Change Up keeps 40. */
const CC_POWER_BPM_MIN = 10;
function ccBpmMin(){ return ccIsPower() ? CC_POWER_BPM_MIN : CC_BPM_MIN; }
/* The tempo Power Chord Switch opens on (2026-11-05, Jonathan: 30 BPM; it was 55 from 2026-11-04, 60 before). A song switch's three
   rounds start from it (30 / 35 / 40); Change Up still opens on 60. A tempo the student already picked this session
   (sessionStorage pwBpm) wins. */
const CC_POWER_START_BPM = 30;
/* The clicks of the count-in before each round of Power Chord Switch and Change Up (Jonathan, 2026-11-09): 2 below 60 BPM, 4 at 60 and
   above. Four clicks were 24 s of waiting at 10 BPM and 8 s at 30; two are 12 s and 4 s, still on the beat so the tempo is heard. The
   Listening Coach, Strum Radar and Note Runner keep 4. ccBeginStage passes it the round's own tempo; a saved take lists it per round
   (ccRecMeta countInBeats), and the console's evaluator reads that (teacher.js micEvalTakePw). checks.mjs 1ck runs the real count-in. */
function ccCountInBeats(bpm){ return bpm < 60 ? 2 : 4; }
/* A song switch (CC_POWER_PROGRESSIONS, `ladder`) is 3 rounds, each CC_LADDER_STEP
   BPM faster than the last, of CC_LADDER_SLOTS chords each: 4 back-and-forths.
   The step was 15 until 2026-11-05 (Jonathan: "don't increase it so quickly"). */
const CC_LADDER_ROUNDS = 3, CC_LADDER_STEP = 5, CC_LADDER_SLOTS = 8;
/* How far the tempo moves per tap on Power Chord Switch's done screen (Change Up's buttons move 10). */
const CC_POWER_AGAIN_STEP = 5;
/* The most the beat grid may move for ONE strum (ms), in both games (2026-11-07). Each strum pulls the grid a quarter of the way to its
   nearest beat (ccLoop), so a stray sound (a cough, a chair) half a beat off the grid moved it by 0.125 of a beat: 749 ms at 10 BPM,
   125 ms at 60. Capped, it moves 60 ms at most. Chosen with tools/grid-sim.mjs (SEEDS=12): the real ccLoop on 21,888 scripted games per
   version (Power Chord Switch 10-140 BPM, Change Up 40-140, every beat and every bar, 19 kinds of player; 240,768 graded changes).
   No cap leaves all grading alone. At 60 ms and 30 BPM and above, 72 changes that were graded wrong turned right and 4 that were right
   turned wrong. 67 of the 72 and all 4 come from one very loose player (strums spread 0.2 beat, up to 0.49 beat off, no stray sounds:
   each far-off strum acts like a stray sound); the other 5 come from a slightly less loose player (spread 0.15 beat) with stray sounds. In grading a stray sound rarely
   matters at any cap, because a change's window is half a beat; for a stray sound the cap mostly keeps the beat dots still. Other caps,
   same games (wrong to right / right to wrong): 40 ms 164 / 4, 50 ms 104 / 4, 80 ms 47 / 4, 100 ms 22 / 0, 150 ms 3 / 2. By those counts
   40 or 50 would fix more at the same four wrong ones; 60 was kept (the suggested value; the grid catches up faster; two of 40's four involve
   stray sounds, an on-time player and a late one, where all of 50's come from the very loose player). A judgment call, listed in WORKFLOW.md. The console's replay follows the cap each take saves (gridStepCapMs; a take
   without it is replayed uncapped), and 1ck pins the number. */
const CC_GRID_STEP_CAP_MS = 60;
/* The three round tempos. The first round's tempo is the base, but never above CC_BPM_MAX minus two steps (130): with the old 15 step, a
   base of 125 gave rounds 125 / 140 / 140, and "each round faster" was not true. */
function ccLadderBpms(base){
  const first = Math.min(base, CC_BPM_MAX - (CC_LADDER_ROUNDS - 1) * CC_LADDER_STEP);
  return Array.from({ length: CC_LADDER_ROUNDS }, (_, k) => first + k * CC_LADDER_STEP);
}

/* POWER CHORD SWITCH (hub key 'power') — this same engine on the
   three-finger power chords: F5 G5 A5 (root on the low E string) and B5 C5 D5
   (root on the A string). Open E5 is the two-finger shape, so it stays out.
   Every loop is a PAIR, and the first choice is the computer picking one:
   `random` draws one of the listed pairs below, in a random order, each time
   Start is pressed on the setup screen (ccRandomPair; ccRoundChords). It never
   draws a pair that is not in the list (2026-10-30: the old pool of six chords
   could make four jumps the list does not teach, F5-D5, G5-B5, A5-B5, A5-C5).
   `group` is what the hand does between the chords: 'low' slides along the
   low E string, 'a' along the A string, 'jump' changes strings (checks.mjs
   1ca proves every pair does what its group says).

   SONGS (2026-11-03, replacing the 2026-11-02 whole-song walks that were too
   hard): `group: 'song'` is a pair taken from a song's power-chord card
   (`card`): ONE activity per distinct switch the card plays. A song activity is
   a LADDER (`ladder: true`): three rounds of 4 back-and-forths (8 chords: X Y X
   Y X Y X Y), each round faster than the last (ccLadderBpms), with a count-in
   before each round (ccBeginStage); the speed row still sets the beats each
   chord lasts. checks.mjs "1ck" proves the list against the card.
   Songs sit at the END of the array, so a remembered pick (`pwProg`, an index)
   still names the same pair. ccRandomPair never draws one, and 1ca skips them.
   `shapes` holds a key that is not a CHORD_DIAGRAMS name; `base` is the
   CHORD_DIAGRAMS chord with the same three pitches (grading and the pitch
   lookups use it).
   A5 comes in two shapes in Sweet Child O' Mine: 'A5o' (open A string, frets 2
   on D and G) next to C5, B5 and E5, as ca-33 plays it, and 'A5' (low E, fret 5)
   next to G5. The fret-5 A5 next to G5 is a deliberate departure from ca-33,
   which plays the open shape there too: Jonathan's call, 2026-11-02. "the cure"
   uses only the game's normal shapes. */
const PW_A5_OPEN = { A5o: { position: 0, base: 'A5', chord: [[6,'x',''],[5,0,0],[4,2,1],[3,2,2],[2,'x',''],[1,'x','']] } };
const CC_POWER_PROGRESSIONS = [
  { group: 'random', random: true, randomKey: 'RANDOM2P', chords: ['F5','G5'] },
  { group: 'low',  chords: ['F5','G5'] }, { group: 'low',  chords: ['G5','A5'] }, { group: 'low',  chords: ['F5','A5'] },
  { group: 'a',    chords: ['B5','C5'] }, { group: 'a',    chords: ['C5','D5'] }, { group: 'a',    chords: ['B5','D5'] },
  { group: 'jump', chords: ['G5','C5'] }, { group: 'jump', chords: ['A5','D5'] }, { group: 'jump', chords: ['G5','D5'] },
  { group: 'jump', chords: ['F5','C5'] }, { group: 'jump', chords: ['F5','B5'] },
  /* The song switches (2026-11-03): one activity per DISTINCT switch the song's
     card plays, as an unordered pair (the round goes both ways). Sweet Child 10,
     "the cure" 6; checks.mjs 1ck proves the list against the card. `ladder` =
     three rounds of 4 back-and-forths, each round faster (ccLadderBpms). */
  { group: 'song', ladder: true, song: 'sweet-child-o-mine', card: 'ca-33', titleKey: 'games.pw.song.sweetChild', chords: ['D5','C5'] },
  { group: 'song', ladder: true, song: 'sweet-child-o-mine', card: 'ca-33', titleKey: 'games.pw.song.sweetChild', chords: ['C5','G5'] },
  { group: 'song', ladder: true, song: 'sweet-child-o-mine', card: 'ca-33', titleKey: 'games.pw.song.sweetChild', chords: ['G5','D5'] },
  { group: 'song', ladder: true, song: 'sweet-child-o-mine', card: 'ca-33', titleKey: 'games.pw.song.sweetChild', chords: ['C5','B5'] },
  { group: 'song', ladder: true, song: 'sweet-child-o-mine', card: 'ca-33', titleKey: 'games.pw.song.sweetChild', chords: ['B5','A5o'], shapes: PW_A5_OPEN },
  { group: 'song', ladder: true, song: 'sweet-child-o-mine', card: 'ca-33', titleKey: 'games.pw.song.sweetChild', chords: ['A5o','C5'], shapes: PW_A5_OPEN },
  { group: 'song', ladder: true, song: 'sweet-child-o-mine', card: 'ca-33', titleKey: 'games.pw.song.sweetChild', chords: ['A5o','E5'], shapes: PW_A5_OPEN },
  { group: 'song', ladder: true, song: 'sweet-child-o-mine', card: 'ca-33', titleKey: 'games.pw.song.sweetChild', chords: ['E5','C5'] },
  { group: 'song', ladder: true, song: 'sweet-child-o-mine', card: 'ca-33', titleKey: 'games.pw.song.sweetChild', chords: ['E5','G5'] },
  { group: 'song', ladder: true, song: 'sweet-child-o-mine', card: 'ca-33', titleKey: 'games.pw.song.sweetChild', chords: ['G5','A5'] },
  { group: 'song', ladder: true, song: 'the-cure', card: 'ca-30', titleKey: 'games.pw.song.theCure', chords: ['A5','C5'] },
  { group: 'song', ladder: true, song: 'the-cure', card: 'ca-30', titleKey: 'games.pw.song.theCure', chords: ['C5','F5'] },
  { group: 'song', ladder: true, song: 'the-cure', card: 'ca-30', titleKey: 'games.pw.song.theCure', chords: ['C5','G5'] },
  { group: 'song', ladder: true, song: 'the-cure', card: 'ca-30', titleKey: 'games.pw.song.theCure', chords: ['G5','F5'] },
  { group: 'song', ladder: true, song: 'the-cure', card: 'ca-30', titleKey: 'games.pw.song.theCure', chords: ['G5','D5'] },
  { group: 'song', ladder: true, song: 'the-cure', card: 'ca-30', titleKey: 'games.pw.song.theCure', chords: ['D5','F5'] }
];
/* The order of the columns on the setup screen (Jonathan, 2026-11-05): the computer's pick, then the songs, then the specific chord pairs. This is
   display order only: the order of CC_POWER_PROGRESSIONS (songs at its END, so a remembered pick keeps naming the same pair) does not change. */
const CC_POWER_GROUPS = [
  { id: 'random', titleKey: 'games.pw.group.random' },
  { id: 'song', titleKey: 'games.pw.group.songs' },
  { id: 'low',  titleKey: 'games.pw.group.low' },
  { id: 'a',    titleKey: 'games.pw.group.a' },
  { id: 'jump', titleKey: 'games.pw.group.jump' }
];

let cc = null, ccRaf = null;

/* Which of the two games on this engine is running: Change Up (no mode, as
   the 1ca check's hand-built state has none) or Power Chord Switch. */
function ccIsPower(){ return !!(cc && cc.mode === 'power'); }
function ccProgs(){ return ccIsPower() ? CC_POWER_PROGRESSIONS : CC_PROGRESSIONS; }
/* Per-game session keys and saved-best key: each game remembers its own loop,
   tempo and speed, and keeps its own best in games.cc / games.pw. */
function ccSk(name){ return (ccIsPower() ? 'pw' : 'cc') + name; }
function ccGameKey(){ return ccIsPower() ? 'pw' : 'cc'; }

/* Where a power chord's root sits, read off the chord's own diagram so the
   hint can't drift from the picture: the first string that isn't muted is the
   root (the 3-finger shapes mute everything below it). */
/* A song round's own shapes (CC_POWER_PROGRESSIONS[i].shapes) win over the
   library: `shapes` is that map, or null for a pair. */
function pwShape(name, shapes){
  if (shapes && Object.prototype.hasOwnProperty.call(shapes, name) && shapes[name] && Array.isArray(shapes[name].chord)) return shapes[name];
  return (typeof CHORD_DIAGRAMS !== 'undefined') ? CHORD_DIAGRAMS[name] : null;
}
/* The chord a shape key stands for in the library ('A5o' is the open A5: the
   same three pitches as A5 at the low E string's fret 5). Pitch lookups and the
   grading's pitch classes read this name. */
function pwBaseName(name, shapes){
  const own = shapes && Object.prototype.hasOwnProperty.call(shapes, name) && shapes[name];
  return own && own.base ? own.base : name;
}
/* What a student reads for a chord key: every key shows as itself except the
   open A5, which says so ("A5 (open)" / "A5 (al aire)"). The ONE place a key
   becomes text: the big chord, "next:", chips and their tooltips, chart labels
   and the done screen's "which switch hurt most" all go through it. Element
   ids are built from the KEY, never from this. */
const PW_NAMED_KEYS = { A5o: 'games.pw.chord.a5open' };
function pwChordName(key){
  return Object.prototype.hasOwnProperty.call(PW_NAMED_KEYS, key) ? t(PW_NAMED_KEYS[key]) : String(key);
}
/* The big chord name: "A5 (open)" with the bracket on its own smaller line
   (a span, so textContent still reads "A5 (open)"). */
function pwChordHtml(key){
  const m = pwChordName(key).match(/^(.*?) (\(.*\))$/);
  return m ? `${escHtml(m[1])} <span class="cc-chord-sub">${escHtml(m[2])}</span>` : escHtml(pwChordName(key));
}
function pwRoot(name, shapes){
  const cfg = pwShape(name, shapes);
  const r = cfg && cfg.chord.find(c => c[1] !== 'x');
  return r ? { string: r[0], fret: r[1] } : null;
}
/* The fret the fingers sit on in an open shape (the root string rings open):
   the first fretted string's fret. 2 for E5 and for the open A5. */
function pwFingerFret(name, shapes){
  const cfg = pwShape(name, shapes);
  const f = cfg && cfg.chord.find(c => c[1] !== 'x' && c[1] > 0);
  return f ? f[1] : 0;
}
const PW_STRING_KEYS = { 6: 'games.wait.string.lowE', 5: 'games.wait.string.a' };
/* "slide up 2 frets" along one string, "move to the A string, fret 3" when the
   shape changes strings. '' when either chord has no diagram or nothing moves.
   Two rules for the open shapes (E5 and the open A5, root on fret 0): going TO
   one says which string rings open and where the fingers go; going FROM one to
   a fretted shape always uses the string form, even on the same string ("slide
   up 3 frets" is wrong when the hand is not in a shape yet). `shapes` is the
   round's own shapes (a song), if any. */
function pwMoveHint(from, to, shapes){
  const a = pwRoot(from, shapes), b = pwRoot(to, shapes);
  if (!a || !b) return '';
  if (b.fret === 0){
    return PW_STRING_KEYS[b.string] ? t('games.pw.move.open', { string: t(PW_STRING_KEYS[b.string]), fret: pwFingerFret(to, shapes) }) : '';
  }
  if (a.string !== b.string || a.fret === 0){
    return PW_STRING_KEYS[b.string] ? t('games.pw.move.string', { string: t(PW_STRING_KEYS[b.string]), fret: b.fret }) : '';
  }
  const d = b.fret - a.fret;
  if (!d) return '';
  const n = Math.abs(d);
  return t(d > 0 ? (n === 1 ? 'games.pw.move.upOne' : 'games.pw.move.up') : (n === 1 ? 'games.pw.move.downOne' : 'games.pw.move.down'), { n });
}

function ccStop(){
  if (ccRaf){ cancelAnimationFrame(ccRaf); ccRaf = null; }
  if (cc){
    (cc.timeouts || []).forEach(clearTimeout);
    if (cc.micOn) coachMicOff();
    cc = null;
  }
}

function ccBody(){ return document.getElementById('cc-body'); }
/* Draw four distinct chords from the pool, in random order — the Random-4 mode. */
function ccRandomFour(){
  const pool = CC_RANDOM_POOL.slice(), pick = [];
  for (let i = 0; i < 4 && pool.length; i++){
    pick.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
  }
  return pick;
}
/* Power Chord Switch's "computer picks": one of the listed pairs (never one
   the list does not teach), its two chords in a random order. */
function ccRandomPair(){
  const listed = CC_POWER_PROGRESSIONS.filter(p => !p.random && p.group !== 'song');
  const pair = listed[Math.floor(Math.random() * listed.length)].chords.slice();
  return Math.random() < 0.5 ? pair : pair.reverse();
}
/* The chords of one round: the loop's own, or a fresh draw for a random one. */
function ccPickChords(progDef){
  if (!progDef.random) return progDef.chords;
  return ccIsPower() ? ccRandomPair() : ccRandomFour();
}
/* The chords of the round about to start. Start on the setup screen draws
   (ccPickChords); Again / -10 / +10 on the done screen (`again`) replay the
   pair just played in Power Chord Switch, because the done screen's advice
   names that pair's worst switch and a new draw would make it about chords the
   student is no longer playing. Change Up's Random 4 keeps drawing four new
   chords each start, as before. */
function ccRoundChords(progDef, again){
  return again && ccIsPower() && cc && Array.isArray(cc.chords) && progDef.random ? cc.chords : ccPickChords(progDef);
}
/* A random loop has its own best per game (Random 4 and Power Chord Switch's
   random pair would otherwise share one session key). */
/* A song switch has its own key ('SONG:' + slug + its chords), so it keeps its own
   best apart from the same pair in the pair list; a pair's key is its chords, as
   it always was. */
function ccBestKey(prog, rateIdx){ const rid = CC_RATES[rateIdx] ? CC_RATES[rateIdx].id : 'bar'; return 'ccBest:' + (prog.random ? (prog.randomKey || 'RANDOM4') : prog.song ? 'SONG:' + prog.song + ':' + prog.chords.join('-') : prog.chords.join('-')) + ':' + rid; }

/* mode: 'power' = Power Chord Switch; anything else (the hub passes nothing)
   = Change Up. */
function ccSetup(mode){
  const power = mode === 'power';
  const sk = power ? 'pw' : 'cc';
  let progIdx = 0, bpm = power ? CC_POWER_START_BPM : 60, rateIdx = 0;
  try {
    progIdx = parseInt(sessionStorage.getItem(sk + 'Prog'), 10);
    bpm = parseInt(sessionStorage.getItem(sk + 'Bpm'), 10);
    rateIdx = parseInt(sessionStorage.getItem(sk + 'Rate'), 10);
  } catch(e){}
  if (!(progIdx >= 0 && progIdx < (power ? CC_POWER_PROGRESSIONS : CC_PROGRESSIONS).length)) progIdx = 0;
  if (!(bpm >= (power ? CC_POWER_BPM_MIN : CC_BPM_MIN) && bpm <= CC_BPM_MAX)) bpm = power ? CC_POWER_START_BPM : 60;
  if (!(rateIdx >= 0 && rateIdx < CC_RATES.length)) rateIdx = power ? CC_BEAT_IDX : 0;   // Power Chord Switch opens on every beat
  cc = { phase: 'setup', mode: power ? 'power' : 'open', progIdx, rateIdx, bpm, micOn: false, timeouts: [] };
  ccRenderSetup();
}

function ccPickProg(i){
  if (!cc) return;
  cc.progIdx = i;
  if (ccIsPower() && !ccProgs()[i].song) cc.lastPair = i;   // the pair the songs view's back button comes back to
  try { sessionStorage.setItem(ccSk('Prog'), String(i)); } catch(e){}
  ccRenderSetup();
}

/* A song's button on the pairs view: opens the songs view on that song's first switch. */
function ccPickSong(slug){
  if (!cc || !ccIsPower()) return;
  const i = ccProgs().findIndex(pr => pr.song === slug);
  if (i >= 0) ccPickProg(i);
}
/* The songs view's back button: the last pair picked (the computer's pick if none). */
function ccPickView(v){
  if (!cc || !ccIsPower() || v !== 'pairs') return;
  ccPickProg(cc.lastPair != null ? cc.lastPair : 0);
}
/* Power Chord Switch's way back to the chords (Jonathan, 2026-11-05: "consistent and at the top and more obvious"). One button, the same
   words and the same class (.cc-back-btn), first on its screen: the setup's songs view (top of the left column, back to the last pair,
   ccPickView) and the done screen (above the verdict, back to the setup, ccSetup). The pairs view has none. `onclick` is a fixed handler
   written here, never data. Change Up keeps its own "Pick a different loop" at the bottom of its done screen. */
function pwBackBtnHtml(onclick){
  return `<button type="button" class="cc-back-btn" onclick="${onclick}"><span aria-hidden="true">&#x25C0;</span> ${escHtml(t('games.pw.pickDifferent'))}</button>`;
}

function ccPickRate(i){
  if (!cc) return;
  cc.rateIdx = i;
  try { sessionStorage.setItem(ccSk('Rate'), String(i)); } catch(e){}
  ccRenderSetup();
}

function ccNudgeBpm(d){
  if (!cc) return;
  ccSetBpm(cc.bpm + d);
}
/* The setup tempo, from a button or (Power Chord Switch) the slider: in steps of 5, clamped to the game's range, remembered for the session, and shown on
   the readout, the slider and a song switch's round line without redrawing the screen (a redraw would drop the slider mid-drag). */
function ccSetBpm(v){
  if (!cc) return;
  v = Number(v);
  if (!isFinite(v)) return;
  cc.heldPairBpm = null;   // a tempo the student set themselves replaces the one held across a song switch
  cc.bpm = Math.min(ccSetupMaxBpm(), Math.max(ccBpmMin(), Math.round(v / 5) * 5));   // steps of 5, like the buttons and the slider; 130 at most on a song switch
  try { sessionStorage.setItem(ccSk('Bpm'), String(cc.bpm)); } catch(e){}
  const el = document.getElementById('cc-bpm-readout');
  if (el) el.textContent = cc.bpm + ' BPM';
  else ccRenderSetup();
  const sl = document.getElementById('cc-bpm-slider');
  if (sl){ sl.value = String(cc.bpm); sl.setAttribute('aria-valuetext', cc.bpm + ' BPM'); }
  const ln = document.getElementById('cc-ladder-note');
  if (ln) ln.innerHTML = ccLadderNoteText(cc.bpm);
  // the tip names the count-in's clicks, which change at 60 BPM
  const tip = document.getElementById('cc-tip');
  if (tip) tip.innerHTML = ccTipHtml();
}
/* The setup's tip: the speed the chord switches at, and the count-in's clicks (ccCountInBeats) of every round the setup tempo gives. A song switch
   whose rounds cross 60 BPM (from 50: 50 / 55 / 60, 2 / 2 / 4 clicks) says so (games.cc.clicksMixed); else the one count (games.cc.clicksN). */
function ccTipHtml(){
  const rate = CC_RATES[cc.rateIdx] || CC_RATES[0];
  const tipRate = t(rate.bpc === 4 ? 'games.cc.tipRate.bar'
    : rate.bpc === 2 ? 'games.cc.tipRate.half'
    : 'games.cc.tipRate.beat');
  const counts = ((ccProgs()[cc.progIdx] || {}).ladder ? ccLadderBpms(cc.bpm) : [cc.bpm]).map(ccCountInBeats);
  const clicks = counts.every(n => n === counts[0]) ? t('games.cc.clicksN', { n: counts[0] }) : t('games.cc.clicksMixed');
  return `&#x1F92B; ${t(ccIsPower() ? 'games.pw.tip' : 'games.cc.tip', { rate: tipRate, clicks })}`;
}
/* "Round 1: 60 BPM · Round 2: 75 BPM · Round 3: 90 BPM" — the setup's line for a song switch. */
function ccLadderNoteText(base){
  return ccLadderBpms(base).map((b, k) => escHtml(t('games.pw.ladder.roundBpm', { n: k + 1, bpm: b }))).join(' · ');
}

/* `shapes` (optional) maps a name to the step's own { position, chord }; a
   name it holds is drawn from that, any other from the library. */
function ccDiagramsHtml(chords, curName, idPrefix, shapes){
  if (typeof localChordSvg !== 'function') return '';
  const pre = idPrefix || 'cc-dia';
  /* One box per chord: a loop that returns to a chord (A5 – G5 – F5 – G5)
     would otherwise draw it twice under the same id. */
  chords = chords.filter((n, i) => chords.indexOf(n) === i);
  const boxes = chords.map(n => {
    const own = shapes && Object.prototype.hasOwnProperty.call(shapes, n) && shapes[n] && Array.isArray(shapes[n].chord) ? shapes[n] : null;
    /* Width/height stripped so it scales, as localChordSvg does. */
    const svg = own && typeof chordDiagramSVG === 'function'
      ? chordDiagramSVG(own).replace(/width="\d+"\s+height="\d+"/, '')
      : localChordSvg(n);
    if (!svg) return '';
    return `<div class="chord-box cc-dia${n === curName ? ' cur' : ''}" id="${pre}-${escAttr(n)}">${svg}<div class="chord-box-label">${escHtml(pwChordName(n))}</div></div>`;
  }).join('');
  return boxes ? `<div class="chord-diagrams cc-diagrams">${boxes}</div>` : '';
}

/* The highest tempo the setup may show: a song switch's first round tops out two steps below CC_BPM_MAX (ccLadderBpms), so a readout of
   135 or 140 would play as 130 (Jonathan, 2026-11-07). A pair goes to CC_BPM_MAX. */
function ccSetupMaxBpm(){
  const pr = cc && ccProgs()[cc.progIdx];
  return pr && pr.ladder ? CC_BPM_MAX - (CC_LADDER_ROUNDS - 1) * CC_LADDER_STEP : CC_BPM_MAX;
}
function ccRenderSetup(msg){
  const body = ccBody();
  if (!body || !cc) return;
  const power = ccIsPower();
  /* A tempo picked for a pair (135, 140) comes down to 130 on a song switch, on the readout, the slider and in the session. */
  if (power && cc.bpm > ccSetupMaxBpm()){
    cc.heldPairBpm = cc.bpm;   // the pair's tempo comes back when the student goes back to a pair, unless they set another tempo in between (ccSetBpm clears it)
    cc.bpm = ccSetupMaxBpm();
    try { sessionStorage.setItem(ccSk('Bpm'), String(cc.bpm)); } catch(e){}
  } else if (power && cc.heldPairBpm != null && ccSetupMaxBpm() === CC_BPM_MAX){
    cc.bpm = cc.heldPairBpm; cc.heldPairBpm = null;
    try { sessionStorage.setItem(ccSk('Bpm'), String(cc.bpm)); } catch(e){}
  }
  /* Change Up groups its loops by how many chords; Power Chord Switch by what
     the hand does between them (CC_POWER_GROUPS). */
  const groups = power
    ? CC_POWER_GROUPS.map(g => [pr => pr.group === g.id, t(g.titleKey)])
    : [[2, t('games.cc.group.two')], [3, t('games.cc.group.three')], [4, t('games.cc.group.four')]]
        .map(([len, title]) => [pr => pr.chords.length === len, title]);
  const pillOf = (pr, i) =>
    `<button type="button" class="ts-btn${i === cc.progIdx ? ' active' : ''}" onclick="ccPickProg(${i})">${pr.random ? '&#x1F3B2; ' + t(power ? 'games.pw.randomPair' : 'games.cc.randomFour') : escHtml((pr.song ? pr.chords.map(pwChordName) : pr.chords).join(pr.chords.length === 2 ? ' ↔ ' : ' – '))}</button>`;
  /* Songs: one row of switch buttons per song, under the song's name (a song
     title is not a .cc-group-title: the games' title count stays one per group). */
  const songRows = () => {
    const slugs = [];
    ccProgs().forEach(pr => { if (pr.song && slugs.indexOf(pr.song) < 0) slugs.push(pr.song); });
    return slugs.map(slug => {
      const first = ccProgs().find(pr => pr.song === slug);
      return `<div class="cc-song-name">${escHtml(t(first.titleKey))}</div><div class="fret-levels">` +
        ccProgs().map((pr, i) => pr.song === slug ? pillOf(pr, i) : '').join('') + `</div>`;
    }).join('');
  };
  /* Power Chord Switch has two views of its choices. The pairs view is five columns:
     four pair groups and Songs, whose column has one button per song (it opens the
     song's switches). The songs view lists every switch of both songs; its way back to
     the pairs is pwBackBtnHtml at the top of the left column. All 16 switches
     next to the pairs were 881px tall on a 657px screen. The view follows the pick
     (a song switch is the songs view). */
  const songsView = power && !!ccProgs()[cc.progIdx].song;
  const songSlugs = [];
  ccProgs().forEach(pr => { if (pr.song && songSlugs.indexOf(pr.song) < 0) songSlugs.push(pr.song); });
  const songButtons = () => songSlugs.map(slug => {
    const first = ccProgs().find(pr => pr.song === slug);
    return `<button type="button" class="ts-btn" onclick="ccPickSong(${jsonAttrArg(slug)})">${escHtml(t(first.titleKey))}<span class="cc-rate-sub">${escHtml(t('games.pw.songSub', { n: ccProgs().filter(pr => pr.song === slug).length }))}</span></button>`;
  }).join('');
  const pills = songsView
    ? `<div class="cc-songs">${songRows()}</div>`
    : groups.map(([inGroup, title], gi) =>
      `<div class="cc-group"><div class="cc-group-title">${title}</div><div class="fret-levels">` + (power && CC_POWER_GROUPS[gi].id === 'song' ? songButtons() : ccProgs().map((pr, i) => inGroup(pr) ? pillOf(pr, i) : '').join('')) + `</div></div>`).join('');
  const viewTabs = '';
  const prog = ccProgs()[cc.progIdx];
  const rate = CC_RATES[cc.rateIdx] || CC_RATES[0];
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(ccBestKey(prog, cc.rateIdx)), 10) || 0; } catch(e){}
  /* Power Chord Switch lists the speeds fastest first (Every beat on the far
     left, the game's own default); Change Up keeps Every bar first. Display
     order only: onclick still carries the index into CC_RATES, which the
     remembered pick and the best-score keys use. */
  const rateBtns = CC_RATES.map((r, i) =>
    `<button type="button" class="ts-btn${i === cc.rateIdx ? ' active' : ''}" onclick="ccPickRate(${i})">${escHtml(t(r.shortKey))}<span class="cc-rate-sub">${escHtml(t(r.subKey))}</span></button>`
  );
  if (ccIsPower()) rateBtns.reverse();
  const rateBtnsHtml = rateBtns.join('');
  /* The chord charts of Power Chord Switch are drawn larger (styles.css,
     .cc-power, two columns); Change Up and the Coach card share
     ccDiagramsHtml. */
  body.classList.toggle('cc-power', power);
  const bestChip = best ? `<span class="cc-best">${t('games.common.bestTodayLabel')}: ${best} BPM</span>` : '';
  /* Power Chord Switch shows "Best today" (it is kept per speed) under the speed buttons, on its own line that is always drawn; it used to sit
     under the tempo row, which the slider's row now fills (2026-11-05). Change Up keeps it on its -5/+5 row. */
  const speedRow = `<div class="cc-group"><div class="cc-group-title">${t('games.cc.group.speedTitle')}</div><div class="fret-levels">${rateBtnsHtml}</div>${power ? `<div class="cc-best-line">${bestChip}</div>` : ''}</div>`;
  /* Change Up keeps the score on the -5/+5 row. Power Chord Switch puts it on
     its own line (.cc-best-line), under the speed buttons since 2026-11-05: beside the tempo buttons it
     made the tempo group too wide to sit next to the speed group, the tempo
     dropped to a line of its own, and the setup grew to 698px on a 657px
     screen (2026-11-01); under the tempo row, the slider's row (2026-11-05) pushed the setup past 657px. */
  /* Power Chord Switch (2026-11-05, Jonathan: more control over the BPM, in steps of 5): the same −5 · tempo · +5 row as ever, and under it a
     10..140 slider in steps of 5. The slider takes the width of the group (as wide as the row above it: in Spanish the speed buttons leave
     no more room beside it). Change Up keeps its −5 / +5 alone. */
  const bpmRow = power
    ? `<div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="ccNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="cc-bpm-readout">${cc.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="ccNudgeBpm(5)">+5</button>
     </div>
     <input type="range" class="cc-bpm-slider" id="cc-bpm-slider" min="${CC_POWER_BPM_MIN}" max="${ccSetupMaxBpm()}" step="5" value="${cc.bpm}" aria-label="${escAttr(t('games.pw.tempoSliderAria'))}" aria-valuetext="${cc.bpm} BPM" oninput="ccSetBpm(this.value)">`
    : `<div class="coach-bpm-row">
       <button type="button" class="tp-btn" onclick="ccNudgeBpm(-5)">&#x2212;5</button>
       <span class="coach-bpm-readout" id="cc-bpm-readout">${cc.bpm} BPM</span>
       <button type="button" class="tp-btn" onclick="ccNudgeBpm(5)">+5</button>
       ${bestChip}
     </div>`;
  /* Power Chord Switch asks "how fast" and the tempo first — they are the whole
     game — then which two chords, all in the left column (the charts have the
     right one); Change Up keeps the loops first and the tempo below. */
  /* The line is always drawn, empty when there is no score yet, so the pair
     buttons below do not jump when a pick with a score is clicked. */
  const tempoRow = `<div class="cc-group"><div class="cc-group-title">${t('games.pw.group.tempo')}</div>${bpmRow}</div>`;
  /* Start sits in .cc-startbar in both games. Change Up's bar sticks to the
     bottom of the scrolling games screen (styles.css .cc-startbar): its 80px
     charts push Start below a 657px screen once a loop is picked (Friday check
     R1-3, Jonathan 2026-10-31). Power Chord Switch's two columns fit 657px, so
     its bar is static (#cc-body.cc-power .cc-startbar). */
  /* A song switch is three rounds whatever the speed: the label says so. */
  const startBtn = `<button type="button" class="coach-start" onclick="ccStart()">&#x25B6; ${prog.ladder ? t('games.pw.ladder.start', { n: CC_LADDER_ROUNDS }) : t('games.cc.startButton', { slots: rate.slots })}</button>`;
  /* A pair and a song switch both draw their two large charts; a song switch adds the three tempos. */
  const pic = prog.random
    ? `<div class="coach-note">&#x1F3B2; ${t(power ? 'games.pw.randomNote' : 'games.cc.randomNote')}</div>`
    : ccDiagramsHtml(prog.chords, null, undefined, prog.shapes);
  const ladderNote = prog.ladder ? `<div class="coach-note"><strong>${t('games.pw.ladder.intro', { rounds: CC_LADDER_ROUNDS })}</strong><br><span id="cc-ladder-note">${ccLadderNoteText(cc.bpm)}</span></div>` : '';
  const tip = `<div class="coach-tip" id="cc-tip">${ccTipHtml()}</div>`;
  /* The set-up line (coachSetupLineHtml) goes in whichever column has room on a
     1366x657 screen: Power Chord Switch's right column, under the tip; Change
     Up's left column, above Start (under its charts and tip it made the setup
     682px tall, 2026-11-13; tools/smoke.mjs changeup-layout). */
  const setupLine = coachSetupLineHtml();
  const note = msg ? `<div class="coach-note">${escHtml(msg)}</div>` : '';
  /* Power Chord Switch uses the width of the games screen: the settings (speed,
     tempo, the pairs, Start) in the left column, the two charts and the tip in
     the right (styles.css .cc-cols). Start is still wrapped in .cc-startbar, but
     in this game that bar does not stick: everything fits on a 657px screen. */
  body.innerHTML = power
    ? `${note}<div class="cc-cols">
         <div class="cc-col-set">${songsView ? pwBackBtnHtml("ccPickView('pairs')") : ''}<div class="cc-speedtempo">${speedRow}${tempoRow}</div>${viewTabs}<div class="cc-groups${songsView ? ' cc-groups-songs' : ''}">${pills}</div>${ladderNote}<div class="cc-startbar">${startBtn}</div></div>
         <div class="cc-col-pic">${pic}${tip}${setupLine}</div>
       </div>
       ${coachFootHtml(true)}`
    : `${note}<div class="cc-up-groups">${pills}</div>
       <div class="cc-cols">
         <div class="cc-col-set">${speedRow}${bpmRow}${setupLine}<div class="cc-startbar">${startBtn}</div></div>
         <div class="cc-col-pic">${pic}${tip}</div>
       </div>
       ${coachFootHtml()}`;
  /* Change Up's setup is wide (the three loop lists side by side, settings left,
     the chosen loop's charts right: styles.css .cc-open-setup); its count-in,
     play and done screens keep the 560px column, so ccStart takes the class off. */
  body.classList.toggle('cc-open-setup', !power);
}

/* The round a Start builds from the chosen loop, its chords and the speed.
   A pair or random loop has the speed's own slot count and cycles its chords.
   A song switch (`ladder`) is CC_LADDER_SLOTS chords per round (4 back-and-forths:
   X Y X Y X Y X Y) whatever the speed, and CC_LADDER_ROUNDS rounds of it (ccStart
   runs them one after the other, see ccBeginStage). `classes` (the pitch classes
   the grading reads) come from each chord's BASE name: 'A5o' is graded as A5,
   which has the same three pitches (checks.mjs 1ck proves the equality). Split
   out of ccStart so the check can run it without a microphone. */
function ccRoundPlan(progDef, prog, rate){
  const song = !!progDef.song, ladder = !!progDef.ladder, shapes = progDef.shapes || null;
  const slots = ladder ? CC_LADDER_SLOTS : rate.slots;
  const seq = Array.from({ length: slots }, (_, i) => prog[i % prog.length]);
  const classes = {};
  prog.forEach(n => {
    const midis = (typeof chordMidis === 'function') ? chordMidis(pwBaseName(n, shapes)) : [];
    classes[n] = midis.map(m => ((m % 12) + 12) % 12);
  });
  return { song, ladder, shapes, slots, seq, classes, rounds: ladder ? CC_LADDER_ROUNDS : 1 };
}

async function ccStart(again){
  /* 'starting' covers the mic await below: the Start and Again buttons stay
     on screen during it, and a second tap used to run a second start (and
     a double-tapped "+10 BPM" landed at +20). */
  if (!cc || cc.phase === 'starting' || cc.phase === 'countin' || cc.phase === 'play') return;
  /* Power Chord Switch records consented takes like the Listening Coach and Note
     Runner (micRec*; Change Up never does): the one-time question comes first,
     and its answer starts the game (micRecConsent). */
  if (ccIsPower() && micRecShouldAsk() && ccBody()){ cc.pendingAgain = again === true; ccBody().innerHTML = micRecAskHtml('pw'); return; }
  coachClose();
  fretStop();
  coachEvictTuner();
  const session = cc;
  cc.phase = 'starting';
  cc.nextBpm = null;   // the done screen's tempo row opens fresh after each game (ccRenderDone)
  cc.firstPlayAt = null;
  cc.unreached = 0;
  if (!coachStream && !(await coachAcquireMic({ el: ccBody(), records: ccIsPower() }))){
    if (cc === session){ cc.phase = 'setup'; ccRenderSetup(coachMicFailMsg()); }
    return;
  }
  await coachEnsureRunning();
  if (cc !== session){ coachReleaseMicIfIdle(); return; }   // panel closed during the prompt
  if (document.hidden){
    coachMicOff();
    cc.phase = 'setup';
    ccRenderSetup(t('games.common.pausedBackgrounded'));
    return;
  }
  cc.micOn = true;
  stopAllDemoAudio();

  ccPrepare(again === true);
  ccBeginStage();
}

/* What a Start sets up before the first count-in (no microphone, so the check can
   run it): the chords, the plan, and for a song switch the tempo of each round.
   stageBpms[k] is round k's tempo (the BPM buttons on the play screen change the
   rounds still to come); stageLog keeps each finished round's changes for the
   done screen. */
function ccPrepare(again){
  const progDef = ccProgs()[cc.progIdx];
  const prog = ccRoundChords(progDef, again);
  cc.chords = prog;   // the actual chords this round (a random loop differs each Start; Again replays them in Power Chord Switch)
  const rate = CC_RATES[cc.rateIdx] || CC_RATES[0];
  const plan = ccRoundPlan(progDef, prog, rate);
  cc.shapes = plan.shapes;
  cc.bpc = rate.bpc; cc.slots = plan.slots; cc.seq = plan.seq; cc.classes = plan.classes;
  cc.ladder = plan.ladder; cc.stage = 0; cc.stageLog = [];
  cc.stageBpms = plan.ladder ? ccLadderBpms(cc.bpm) : [cc.bpm];
  cc.evLog = [];   // every strum heard, for a recorded take (ccRecMeta)
  cc.onsetCount = 0;   // every sound ccLoop took for a strum, in all rounds of this game (ccFinish: was anything heard at all?)
  cc.tempoLog = []; cc.startBpms = []; cc.retimedStages = [];   // the live tempo changes of this game (ccLiveBpm)
  cc.countIns = [];   // the count-in clicks each round was given (ccBeginStage), for a recorded take
}

/* Starts the round cc.stage: its changes, its tempo, a count-in at that tempo,
   then the play screen. The microphone stays on between rounds. */
function ccBeginStage(){
  const prog = cc.chords;
  /* A consented take runs from the first count-in to the end of the game, through
     every round (micRecStart is a no-op unless this student said yes and the teacher
     has collection on). It starts BEFORE coachCountIn, which gives a recorded take a
     longer lead. Change Up never records. */
  if (ccIsPower() && cc.stage === 0) micRecStart('pw');
  cc.changes = [];
  for (let s = 1; s < cc.slots; s++){
    cc.changes.push({ beat: s * cc.bpc, from: cc.seq[s - 1], to: cc.seq[s], result: null, pend: null });
  }
  cc.beatMs = 60000 / cc.stageBpms[cc.stage];
  /* The tempo this round starts at, and the lowest tempo it runs at once the student changes it while playing (ccLiveBpm). The round is
     scored and saved at the lowest (ccRoundBpm); a round never changed has the two equal. */
  cc.roundLow = cc.stageBpms[cc.stage];
  cc.startBpms = (cc.startBpms || []).slice();
  cc.startBpms[cc.stage] = cc.stageBpms[cc.stage];
  cc.smoothRms = 0; cc.smoothHf = 0; cc.lastOnsetT = -1e9; cc.prevOnsetT = -1e9; cc.lastPitchT = 0; cc.gridOffset = 0; cc.lastBeat = -1;
  cc.phase = 'countin';
  ccBody().classList.remove('cc-open-setup');
  const stageLabel = cc.ladder ? `<div class="cc-stage" id="cc-stage">${escHtml(ccStageText())}</div>` : '';
  ccBody().innerHTML = ccIsPower()
    ? `<div class="cc-cols cc-cols-play${cc.ladder ? ' cc-ladder-play' : ''}"><div class="cc-col-set">${ccRecBadge()}${stageLabel}<div class="coach-count" id="cc-count">&nbsp;</div></div>` +
      `<div class="cc-col-pic">${ccDiagramsHtml(prog, prog[0], undefined, cc.shapes)}</div></div>`
    : `<div class="coach-count" id="cc-count">&nbsp;</div>` + ccDiagramsHtml(prog, prog[0]);
  /* The round's own tempo sets its count-in (a song switch's later rounds can be at 60 or more, and the play screen's buttons move them). */
  const countIn = ccCountInBeats(cc.stageBpms[cc.stage]);
  cc.countIns = (cc.countIns || []).slice();
  cc.countIns[cc.stage] = countIn;
  coachCountIn(cc, 'cc-count', () => {
    if (cc && cc.phase === 'countin'){
      cc.phase = 'play';
      if (cc.firstPlayAt == null) cc.firstPlayAt = performance.now();   // the first round's count-in is over: ccFinish measures play time from here
      ccRenderPlay();
    }
  }, countIn);
  /* When each change is due on the performance.now() clock (listenStart is set by
     coachCountIn), for a recorded take. */
  cc.changes.forEach(c => { c.t = cc.listenStart + c.beat * cc.beatMs; c.stage = cc.stage; c.bpm = cc.stageBpms[cc.stage]; });
  if (ccRaf) cancelAnimationFrame(ccRaf);
  ccLoop();
}

/* The red "Recording this take for your teacher" label, drawn on every screen of a
   take (each screen replaces #cc-body), and only while a Power Chord Switch capture
   is really running. A capture ends at micRec's 30 s cap, and the label goes with it: a three-round game at the default speed (30 BPM) is
   recorded until about 4 s into round 2's play (2-click count-ins since 2026-11-09; with 4 clicks the cap fell inside round 2's count-in),
   a slower game for less. */
function ccRecBadge(){
  return micRec && micRec.live && micRec.mode === 'pw' ? micRecBadgeHtml() : '';
}
/* What a saved Power Chord Switch take needs beside the audio: every change's
   due time and verdict (all rounds) and every strum heard. Event times are when
   the strum was PLAYED (arrival - micLatencyMs). */
function ccRecMeta(complete){
  const progDef = ccProgs()[cc.progIdx] || {};
  const r2 = x => Math.round(x * 100) / 100;
  return {
    fields: { game: 'pw', complete: complete === true, progression: cc.chords.join('-'), song: progDef.song || null, ladder: !!cc.ladder,
              bpm: ccStartBpms()[0], stageBpms: ccStartBpms(), bpc: cc.bpc, eventTimes: 'played (arrival - micLatencyMs)',
              onsetRatio: CC_POWER_ONSET_RATIO, hfRatio: CC_POWER_HF_RATIO,
              gridStepCapMs: CC_GRID_STEP_CAP_MS,   // the console replays the grid with this cap; a take without it was graded on the uncapped grid
              countInBeats: ccCountInList(),   // each round's count-in clicks, one per stageBpms entry; a take without it counted 4 in every round (before 2026-11-09)
              changeReadings: 'per change: null = no strum in its window; [] = a strum but no pitch could be read; else the midi readings its chord check used (under 3 passes on timing alone)',
              changePick: 'nearest' },   // which strum decided a change: the one nearest it (from 2026-11-13); a take without it, the first in its window (teacher-mic.js micEvalTakePw)
    expected: cc.changes.map((c, i) => Object.assign({ i, t: c.t, from: c.from, to: c.to, stage: c.stage == null ? 0 : c.stage, bpm: c.bpm, verdict: c.result,
      readings: c.readings ? c.readings.map(r2) : null }, (cc.retimedStages || []).indexOf(c.stage == null ? 0 : c.stage) >= 0 ? { retimed: true } : {})),
    tempoChanges: (cc.tempoLog || []).slice(),
    events: (cc.evLog || []).slice()
  };
}

/* The count-in clicks of each round, for a saved take: what ccBeginStage gave a round it started, else what its planned tempo would give. */
function ccCountInList(){
  return ccStartBpms().map((b, k) => cc.countIns && cc.countIns[k] != null ? cc.countIns[k] : ccCountInBeats(b));
}
/* The tempo each round STARTED at, for a saved take: the live changes (ccLiveBpm) move cc.stageBpms. A round not reached yet has its planned tempo. */
function ccStartBpms(){
  return cc.stageBpms.map((b, k) => cc.startBpms && cc.startBpms[k] != null ? cc.startBpms[k] : b);
}
/* "Round 2 of 3 · 75 BPM" */
function ccStageText(){
  return t('games.pw.ladder.stage', { n: cc.stage + 1, total: CC_LADDER_ROUNDS, bpm: cc.stageBpms[cc.stage] });
}
/* The "Next round" buttons on a song switch's play screen: they move only the rounds still to come. The round being played has its own
   buttons (ccLiveBpm), which move it and the rounds after it together. */
function ccNudgeNext(d){
  if (!cc || !cc.ladder || cc.phase !== 'play' || cc.stage >= CC_LADDER_ROUNDS - 1) return;
  for (let k = cc.stage + 1; k < CC_LADDER_ROUNDS; k++){
    cc.stageBpms[k] = Math.min(CC_BPM_MAX, Math.max(ccBpmMin(), cc.stageBpms[k] + d));
  }
  const el = document.getElementById('cc-next-bpm');
  if (el) el.textContent = ccNextBpmText();
}
/* The tempo a round counts at: its lowest tempo when the student changed it while playing, else the tempo it started at (so a game
   slowed down mid-way is never credited with the fast start). */
function ccRoundBpm(){
  return cc.roundLow != null ? cc.roundLow : cc.ladder && cc.stageBpms ? cc.stageBpms[cc.stage] : cc.bpm;
}
/* Power Chord Switch's live tempo (2026-11-05, Jonathan: more control over the BPM, also while playing). Changes the tempo of the round being
   played, at once, by d BPM. The beat the student is on does not move: the grid's start is re-anchored so the same beat is at the same
   moment, and the changes still to come are due at the new tempo. Changes already graded keep their time. A tempo outside the game's range
   is held at it. */
function ccLiveBpm(d){
  if (!cc || !ccIsPower() || cc.phase !== 'play') return;
  const cur = cc.stageBpms[cc.stage];
  /* In a song switch the last round moves with this one, so this round stops where the last round would pass 140: the steps between the rounds
     are never squashed, and a speed-up undone by a slow-down leaves every round where it was. */
  const span = cc.ladder ? Math.max(0, cc.stageBpms[CC_LADDER_ROUNDS - 1] - cur) : 0;
  let next = Math.min(CC_BPM_MAX - span, Math.max(CC_POWER_BPM_MIN, cur + d));
  if (d > 0 && next < cur) next = cur;   // never a slow-down from a speed-up button
  if (next === cur) return;
  const now = performance.now();
  const oldBeat = cc.beatMs, newBeat = 60000 / next;
  cc.listenStart = now - cc.gridOffset - (now - cc.listenStart - cc.gridOffset) * newBeat / oldBeat;
  cc.beatMs = newBeat;
  cc.stageBpms[cc.stage] = next;
  cc.roundLow = Math.min(cc.roundLow == null ? next : cc.roundLow, next);
  cc.changes.forEach(c => { if (c.result === null){ c.t = cc.listenStart + c.beat * cc.beatMs; c.bpm = next; } });
  if (cc.tempoLog) cc.tempoLog.push({ t: now, stage: cc.stage, from: cur, to: next });
  if (cc.retimedStages && cc.retimedStages.indexOf(cc.stage) < 0) cc.retimedStages.push(cc.stage);
  /* A pair's tempo is the one it is played at; the next visit to the setup opens on it. A song switch's rounds are its own. */
  if (!cc.ladder){ cc.bpm = next; try { sessionStorage.setItem(ccSk('Bpm'), String(next)); } catch(e){} }
  /* A song switch's rounds each go faster than the one before: the rounds after this one move by the same amount, so the steps between them hold
     and a +5 undone by a −5 leaves every round where it was (the cap above keeps the last round at 140 or less). */
  if (cc.ladder){
    for (let k = cc.stage + 1; k < CC_LADDER_ROUNDS; k++) cc.stageBpms[k] = Math.min(CC_BPM_MAX, Math.max(CC_POWER_BPM_MIN, cc.stageBpms[k] + (next - cur)));
    const nb = document.getElementById('cc-next-bpm');
    if (nb) nb.textContent = ccNextBpmText();
  }
  const st = document.getElementById('cc-stage');
  if (st) st.textContent = cc.ladder ? ccStageText() : next + ' BPM';
}
function ccNextBpmText(){
  return cc.stage >= CC_LADDER_ROUNDS - 1 ? t('games.pw.ladder.lastRound')
    : t('games.pw.ladder.nextBpm', { bpm: cc.stageBpms[cc.stage + 1] });
}

function ccRenderPlay(){
  const body = ccBody();
  if (!body || !cc) return;
  const chips = cc.changes.map((c, i) =>
    `<span class="coach-chip pending" id="cc-chip-${i}" title="${escAttr(t('games.cc.changeTooltip', { from: pwChordName(c.from), to: pwChordName(c.to) }))}">${ccChipInner(c)}</span>`
  ).join('');
  const now = `<div class="cc-now">
       <div class="cc-chord" id="cc-chord" data-key="${escAttr(cc.seq[0])}">${pwChordHtml(cc.seq[0])}</div>
       <div class="cc-next" id="cc-next">${escHtml(ccNextText(0))}</div>
     </div>
     <div class="cc-beats" id="cc-beats"><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span><span class="cc-pip"></span></div>`;
  const charts = ccDiagramsHtml(cc.chords, cc.seq[0], undefined, cc.shapes);
  /* The tempo buttons of the round being played (ccLiveBpm): −5 · the tempo · +5. In a pair it is the whole control (the line
     is the BPM, as before); a song switch puts its round line (#cc-stage) between the buttons, and its next-round buttons under it. */
  const liveRow = (mid) => `<div class="coach-bpm-row">
         <button type="button" class="tp-btn" onclick="ccLiveBpm(-5)">&#x2212;5</button>
         ${mid}
         <button type="button" class="tp-btn" onclick="ccLiveBpm(5)">+5</button>
       </div>`;
  /* A song switch: which round, and the BPM buttons for the rounds still to come. */
  const lastRound = !cc.ladder || cc.stage >= CC_LADDER_ROUNDS - 1;
  const bpmCtl = cc.ladder ? `<div class="cc-play-bpm cc-live-bpm">${liveRow(`<span class="cc-stage" id="cc-stage">${escHtml(ccStageText())}</span>`)}
       <div class="coach-bpm-row">
         <button type="button" class="tp-btn" onclick="ccNudgeNext(-5)"${lastRound ? ' disabled' : ''}>&#x2212;5</button>
         <span class="coach-bpm-readout" id="cc-next-bpm">${escHtml(ccNextBpmText())}</span>
         <button type="button" class="tp-btn" onclick="ccNudgeNext(5)"${lastRound ? ' disabled' : ''}>+5</button>
       </div></div>` : '';
  /* The last change, large: ✓ right, ✗ on time but the chord sounded wrong, – no strum heard. The row is always drawn (empty until the first change is
     graded). Power Chord Switch only. It and the BPM buttons sit under the charts: the left column is already the taller one. */
  const lastLine = ccIsPower() ? '<div class="cc-last" id="cc-last" aria-live="polite">&nbsp;</div>' : '';
  /* A pair's play screen says its tempo, between its live buttons (ccLiveBpm); a song switch's line above already does, per round. */
  const pairBpm = ccIsPower() && !cc.ladder ? `<div class="cc-play-bpm cc-live-bpm">${liveRow(`<span class="cc-stage" id="cc-stage">${cc.stageBpms ? cc.stageBpms[0] : cc.bpm} BPM</span>`)}</div>` : '';
  const rest = `<div class="coach-strip">${chips}</div>
     <div class="coach-live"><span class="coach-live-dot"></span>${t('games.cc.strumEveryBeat')}</div>
     <button type="button" class="tp-btn coach-stop" onclick="ccFinish()">&#x25A0; ${t('games.common.stop')}</button>`;
  /* Power Chord Switch: the chord, "next" and the beat pips on the left, the
     two charts large on the right (styles.css .cc-cols-play). */
  body.innerHTML = ccIsPower()
    ? `<div class="cc-cols cc-cols-play${cc.ladder ? ' cc-ladder-play' : ''}"><div class="cc-col-set">${ccRecBadge()}${now}${rest}</div><div class="cc-col-pic">${charts}${lastLine}${bpmCtl}${pairBpm}</div></div>`
    : now + charts + rest;
}

/* The "next:" line under the big chord name. Power Chord Switch adds how the
   hand gets there (pwMoveHint) — that move is the whole game. */
function ccNextText(slotIdx){
  if (slotIdx + 1 >= cc.slots) return t('games.cc.lastOne');
  const to = cc.seq[slotIdx + 1];
  const hint = ccIsPower() ? pwMoveHint(cc.seq[slotIdx], to, cc.shapes) : '';
  return t('games.common.next') + ' ' + pwChordName(to) + (hint ? ' — ' + hint : '');
}

function ccBeatTick(cur){
  const slotIdx = Math.floor(cur / cc.bpc), beatInBar = cur % 4;
  if (slotIdx >= cc.slots) return;
  const chordEl = document.getElementById('cc-chord');
  const nextEl = document.getElementById('cc-next');
  /* Compared by KEY (data-key), not by the text: 'A5o' reads "A5 (open)". */
  if (chordEl && chordEl.dataset.key !== cc.seq[slotIdx]){
    chordEl.dataset.key = cc.seq[slotIdx];
    chordEl.innerHTML = pwChordHtml(cc.seq[slotIdx]);
    document.querySelectorAll('.cc-dia').forEach(el => el.classList.remove('cur'));
    const dia = document.getElementById('cc-dia-' + cc.seq[slotIdx]);
    if (dia) dia.classList.add('cur');
  }
  if (nextEl) nextEl.textContent = ccNextText(slotIdx);
  document.querySelectorAll('#cc-beats .cc-pip').forEach((el, i) => el.classList.toggle('on', i === beatInBar));
}

/* A play-screen chip in Power Chord Switch: the symbol sits in a box of fixed width, hidden while the change is not graded yet, so a chip does not
   get wider (and the strip wrap, and Stop move) when its result arrives. Change Up's chips stay the chord's name. */
function ccChipInner(c){
  if (!ccIsPower()) return escHtml(pwChordName(c.to));
  const sym = c.result === 'off' ? '\u2717' : c.result === 'miss' ? '\u2013' : '\u2713';
  return `<span class="cc-sym${c.result ? '' : ' hid'}">${sym}</span>${escHtml(pwChordName(c.to))}`;
}
/* The done screen's chip: ✓ right, ✗ on time but the chord sounded wrong, – no strum heard (also a colour). */
function ccChipText(c){
  return (c.result === 'ok' ? '\u2713 ' : c.result === 'off' ? '\u2717 ' : c.result === 'miss' ? '\u2013 ' : '') + pwChordName(c.to);
}
function ccChipRefresh(i){
  const el = document.getElementById('cc-chip-' + i);
  if (el){
    el.className = 'coach-chip ' + (cc.changes[i].result === 'ok' ? 'ok' : cc.changes[i].result === 'off' ? 'wrong' : cc.changes[i].result === 'miss' ? 'miss' : 'pending');
    el.innerHTML = ccChipInner(cc.changes[i]);
  }
  ccShowLast(cc.changes[i]);
}
/* The big line under the beat dots, in the words of the done screen's legend. */
function ccShowLast(c){
  const big = document.getElementById('cc-last');
  if (!big || !c || !c.result) return;
  const kind = c.result === 'ok' ? 'ok' : c.result === 'off' ? 'wrong' : 'miss';
  big.className = 'cc-last ' + kind;
  big.textContent = t('games.pw.last.' + kind, { chord: pwChordName(c.to) });
}

function ccResolvePend(ch){
  const p = ch.pend;
  ch.pend = null;
  /* Kept for the saved take (ccRecMeta), not used for grading: the pitch readings this change's
     chord check had. [] = a strum was heard but no pitch could be read. A change that never got
     a pend (no strum in its window) keeps no readings at all. */
  ch.readings = p.readings.slice();
  let toneOk = null;
  /* Chord-tone vote (same rule as the Coach's chord checks): a strum is
     polyphonic, so readings hop between chord tones — any single-pitch
     consensus fails real strums. 'off' only on strong contrary evidence.

     Two rules, both needed (2026-09-28, re-simulated against the real
     voicings in CHORD_DIAGRAMS, bass-weighted readings plus noise):
     1. Some tone of the NEW chord has to be heard at all (>15%) — a strum
        of something else entirely is 'off'.
     2. The OLD chord's exclusive tones must not outnumber the new chord's
        exclusive tones. A held chord keeps sounding what only it has (Am
        held into C keeps its A, the bass note the detector locks onto),
        while a real change loses it — so "old-only hits beat new-only
        hits, and are more than noise" is the held-chord signature.
     The one-day rule before this — "the new chord's EXCLUSIVE tones must
     be >15% of readings" — read well on pitch classes (1 of 3) but not on
     strings: Am→C's only new tone is G, one open string of five, which
     five readings of a strummed C miss most of the time. Simulated, it
     failed a genuine Am→C 60% of the time and one random-4 pair 90%.
     This rule passes real changes 99.6% (worst pair 98%) and still fails
     a held chord far more than "any new tone" did (22% vs 51%). The
     pairs it stays lenient on are the parallel/relative ones whose bass
     note is shared and whose only difference is one string (E/Em, A/Am,
     C/Am, G/Em) — five readings cannot tell those apart either way, and
     marking a correct change wrong is the worse error in a room. */
  if (p.readings.length >= 3){
    const want = cc.classes[ch.to];
    const from = cc.classes[ch.from] || [];
    const pcOf = r => ((Math.round(r) % 12) + 12) % 12;
    const n = p.readings.length;
    const newOnly = want.filter(c => from.indexOf(c) < 0);
    const oldOnly = from.filter(c => want.indexOf(c) < 0);
    const anyNew = p.readings.filter(r => want.indexOf(pcOf(r)) >= 0).length / n;
    const newHits = p.readings.filter(r => newOnly.indexOf(pcOf(r)) >= 0).length;
    const oldHits = p.readings.filter(r => oldOnly.indexOf(pcOf(r)) >= 0).length;
    toneOk = anyNew > 0.15 && !(oldHits > newHits && oldHits / n > 0.15);
  }
  /* Percussive/unclear counts on timing alone. The verdict is HELD, not shown: a closer strum may still come (ccLoop), and ccHoldFinal
     shows it once none can. Of two checks, the one closer to the change is kept. */
  const h = { v: toneOk === false ? 'off' : 'ok', readings: ch.readings, dev: p.dev };
  if (!ch.hold || Math.abs(h.dev) < Math.abs(ch.hold.dev)) ch.hold = h;
}
/* A held verdict becomes the change's result (and its chip and big line turn). ccLoop calls it once no closer strum can come: the change
   time plus the held strum's distance from it (no later sound can be closer after that), at most the window; on time or late, that is
   as soon as its check ends (340 ms), early by d, d after the change. ccStageEnd and ccFinish call it for what is still held. */
function ccHoldFinal(c){
  const h = c.hold;
  c.hold = null;
  c.result = h.v;
  c.readings = h.readings;
  ccChipRefresh(cc.changes.indexOf(c));
}

function ccLoop(){
  if (!cc) return;
  if (!coachAnalyser || !ccBody()){ ccStop(); return; }  // mic taken or panel closed under us
  const now = performance.now();
  if (cc.phase === 'countin'){
    /* Warm the level trackers on room noise during the count-in — same
       cold-start guard as the Coach loop. */
    const r = coachReadFrame();
    coachSmooth(cc, r, coachHfRms);
  }
  if (cc.phase === 'play'){
    const rms = coachReadFrame();
    const at = coachOnsetAt;
    const lat = coachMicLatencyMs();

    /* Onset = strum (same dual-channel detector as the Coach: full-band
       jump for clean separated strums, HF pick-attack channel for a strum
       over the still-ringing previous chord — which is exactly what the
       graded beat-1-of-a-new-bar strum sounds like). Scored at `at - lat`,
       when it was played — see coachLoop and coachMicLatencyMs.
       The two jump ratios are Power Chord Switch's own (CC_POWER_*) in that game and the shared
       CHK_* ones in Change Up. The console's strum what-if (teacher.js micEvalStrumRule) reads
       the condition below as text, so keep it on these four lines and free of comments. */
    const onsetRatio = ccIsPower() ? CC_POWER_ONSET_RATIO : CHK_ONSET_RATIO;
    const hfRatio = ccIsPower() ? CC_POWER_HF_RATIO : CHK_HF_RATIO;
    if ((rms > CHK_ONSET_FLOOR &&
         rms > cc.smoothRms * onsetRatio ||
         coachHfRms > CHK_HF_FLOOR &&
         coachHfRms > cc.smoothHf * hfRatio) &&
        at - cc.lastOnsetT > COACH_ONSET_REFRACT){
      cc.prevOnsetT = cc.lastOnsetT;   // ccFinish ignores an onset in the last 300 ms before a Stop (the Stop click itself) and uses this one
      cc.lastOnsetT = at;
      cc.onsetCount++;
      if (micRec && micRec.live) cc.evLog.push({ t: at - lat, stage: cc.stage });
      const rel = at - lat - cc.listenStart - cc.gridOffset;
      const beatIdx = Math.round(rel / cc.beatMs);
      const dev = rel - beatIdx * cc.beatMs;
      if (Math.abs(dev) < cc.beatMs * 0.5) cc.gridOffset += Math.max(-CC_GRID_STEP_CAP_MS, Math.min(CC_GRID_STEP_CAP_MS, dev * 0.25));
      // Cap the match window at half the spacing between changes (bpc beats) so a
      // single strum can't land inside two adjacent change windows at fast rates.
      const win = Math.min(cc.beatMs * cc.bpc * 0.5, Math.max(220, cc.beatMs * 0.5));
      /* NEAREST WINS (2026-11-13, Jonathan: "the tempo should not matter as long as the student hits the chord within an allowable window"),
         as the Listening Coach's coachMatchEvent has since 2026-10-07. Until then the FIRST sound in the window opened the change's check and
         decided it: at 15 BPM the window opens 2 s before the change, while the old chord still rings, so a neighbour's strum or a bump
         judged the change and the student's own strum was never used (real takes: at 30 BPM and under, 98 of 120 heard changes were decided
         by a sound more than 0.25 s off the change). Now a sound closer to the change than the one being checked, or already checked (hold),
         takes its place. The check it replaces is finished early with the readings it has (ccResolvePend keeps the closer of the two), so a
         Stop click that replaces a real strum and is then dropped (ccFinish) leaves that strum's verdict. tools/mic-sim/change-window.mjs:
         the 33 real takes, 315 changes: right / wrong / no strum 156 / 124 / 35 -> 166 / 114 / 35, no real strum lost, nothing-played
         marked right 29 -> 30 of 65. */
      const ch = cc.changes.find(c => {
        const d = Math.abs(rel - c.beat * cc.beatMs);
        return c.result === null && d <= win && (!c.pend || d < Math.abs(c.pend.dev)) && (!c.hold || d < Math.abs(c.hold.dev));
      });
      if (ch){
        if (ch.pend) ccResolvePend(ch);
        ch.win = win;
        ch.pend = { t: at, readings: [], dev: rel - ch.beat * cc.beatMs };
      }
    }
    coachSmooth(cc, rms, coachHfRms);

    /* Feed pitch readings to an open change-check, then resolve it. Same
       attack skip as the Coach: the first ~70ms of a strum is scrape plus
       the old chord still ringing, not the new chord's tones. */
    const open = cc.changes.find(c => c.pend);
    if (open){
      if (rms > COACH_PITCH_GATE * 0.5){
        // Both games on this engine always grade chords. Change Up uses the same
        // looser YIN gate (0.55) as the Listening Coach's chord mode so full
        // strums actually register; Power Chord Switch's gate is below.
        // Spaced 40 ms like the Coach's (it was every 3rd frame — ~50 ms at
        // 60 fps, but 150 ms on a Chromebook drawing at 20).
        const p = open.pend;
        /* Power Chord Switch reads with Riff Runner's two-tier power-chord gate
           (RNW_POWER_CLARITY), not the 0.55 chord gate. tools/mic-sim/
           power-switch.mjs, synthetic, 22 pairs x 8 trials, a mic that loses
           the low fundamental ("mid" / "weak"): a chord one fret wrong passed
           35% / 19% of the time at 0.55 and 9% / 1% here; a right change was
           marked messy 3% / 2% at 0.55 and 0% / 1% here.
           NOT fixed by either gate: with a strong low fundamental a low-E
           strum gives under 3 readings, so it passes on timing alone, and a
           chord that never changed passes with it (45% of held strums); pairs
           that share a note (G5 to C5, A5 to D5) pass held on every mic.
           That is why the tip promises a strum on every beat, and the chord
           only "when I can hear the notes clearly, but two chords that share
           a note can fool me". Check on the console's Mic recordings before
           tuning. */
        coachPitchReadings(cc.lastPitchT, p.t + COACH_ATTACK_SKIP, ccIsPower() ? RNW_POWER_CLARITY : 0.55).forEach(r => {
          cc.lastPitchT = r.t;
          if (r.midi != null && r.t - p.t <= COACH_EVENT_TAIL) p.readings.push(r.midi);
        });
      }
      if (now - open.pend.t > COACH_EVENT_TAIL) ccResolvePend(open);
    }

    /* Overdue changes are misses — on the played-time clock, so a strum
       still on its way through the mic isn't swept before it arrives. */
    const relNow = now - lat - cc.listenStart - cc.gridOffset;
    cc.changes.forEach(c => {
      if (c.result === null && !c.pend && c.hold && relNow > c.beat * cc.beatMs + Math.min(c.win, Math.abs(c.hold.dev))) ccHoldFinal(c);
    });
    cc.changes.forEach((c, i) => {
      if (c.result === null && !c.pend && !c.hold && relNow > (c.beat + 0.85) * cc.beatMs){
        c.result = 'miss';
        ccChipRefresh(i);
      }
    });

    /* Same adapted-grid rule as the Coach's pulse: the chord/beat display
       must follow the grid the scoring uses, or it drifts off the player. */
    const cur = Math.floor((now - cc.listenStart - cc.gridOffset) / cc.beatMs);
    if (cur !== cc.lastBeat && cur >= 0){ cc.lastBeat = cur; ccBeatTick(cur); }

    if (now > cc.listenStart + (cc.slots * cc.bpc + 1) * cc.beatMs){ ccStageEnd(); return; }
  }
  ccRaf = requestAnimationFrame(ccLoop);
}

/* The end of a round's time. A song switch with rounds still to come grades this
   round's last changes, keeps them, and starts the next round (its count-in is
   at the next tempo); anything else is the end of the game. */
function ccStageEnd(){
  if (!cc.ladder || cc.stage >= CC_LADDER_ROUNDS - 1){ ccFinish(true); return; }
  cc.changes.forEach(c => {
    if (c.pend) ccResolvePend(c);
    if (c.result === null && c.hold) ccHoldFinal(c);
    if (c.result === null) c.result = 'miss';
  });
  cc.stageLog.push({ bpm: ccRoundBpm(), changes: cc.changes });
  cc.stage++;
  cc.prevLastOnsetT = cc.lastOnsetT;   // ccBeginStage resets it; ccFinish needs the round's last strum if the Stop comes early in the next one
  cc.roundEndT = performance.now();
  ccBeginStage();
}
/* The tempo a finished game is scored at: a pair's is the lowest tempo it ran at (ccRoundBpm); a song
   switch's is its fastest round with 85% of the changes right (0 if none). */
function ccScoreBpm(){
  if (!cc.ladder) return ccRoundBpm();
  let top = 0;
  (cc.stageLog || []).forEach(sg => {
    const n = sg.changes.length;
    if (n && sg.changes.filter(c => c.result === 'ok').length / n >= 0.85 && sg.bpm > top) top = sg.bpm;
  });
  return top;
}

const CC_STOP_REACH_MS = 4000;   // a Stop within this long of a change falling due is read as "reaching for Stop", not "the mic missed it" (ccFinish)
function ccFinish(complete){
  if (!cc || (cc.phase !== 'play' && cc.phase !== 'countin')) return;
  const ended = complete === true;   // ccStageEnd: the last round ran out (a Stop is never this)
  cc.timeouts.forEach(clearTimeout);
  cc.timeouts = [];
  if (ccRaf){ cancelAnimationFrame(ccRaf); ccRaf = null; }
  /* The Stop click is a sound too, and ccLoop may already have matched it to a change as an open check (a click inside a change's window: always at "Every beat", about
     half the time at "Every 2 beats", a quarter at "Every bar"). A sound that arrived in the last 300 ms before a Stop, the latest one heard, is that click, as in lastOnsetEff
     below: its open check is dropped, so the change counts as never played and not as a strum, and its event leaves the saved take (the console replays the take's events).
     Only THAT onset's check: a real strum a little before the click keeps its own (review rounds 3 and 4). pend.t is the onset's arrival time, the clock of cc.lastOnsetT. */
  const clickOnsetT = !ended && cc.lastOnsetT > performance.now() - 300 ? cc.lastOnsetT : null;
  if (clickOnsetT !== null){
    cc.changes.forEach(c => { if (c.pend && c.pend.t === clickOnsetT) c.pend = null; });
    const clickLat = coachMicLatencyMs();
    cc.evLog = (cc.evLog || []).filter(e => Math.abs(e.t + clickLat - clickOnsetT) > 0.5);
  }
  /* Stop once every change has been played or graded is the natural "I'm
     done" — after the last change the round only runs on to the end of the
     last chord plus one beat (ccLoop) — so that counts as a finished round.
     Stop with a change still ahead of the player stays an early Stop. */
  if (!complete && cc.phase === 'play' && (!cc.ladder || cc.stage >= CC_LADDER_ROUNDS - 1) &&
      cc.changes.every(c => c.result !== null || c.pend || c.hold)) complete = true;
  /* Changes the player never got to are 'miss' only in the data, not strums the mic missed: ccRenderDone leaves them out of the "strum firmer" count.
     That is every change still waiting and not yet due before the last strum the mic heard, and the misses after that strum that fell due in the CC_STOP_REACH_MS before the Stop
     (ccLoop has already swept those while the hand was going for the Stop button: at 60 BPM a 3 s reach is 3 changes). A game whose time ran out (ccStageEnd; never a Stop, even one counted as finished above), and a song switch
     stopped in a later round's count-in (that round is left out below), have none. */
  const stopT = performance.now() - coachMicLatencyMs();
  let lastHeard = -1;
  cc.changes.forEach((c, i) => { if (c.pend || c.hold || c.result === 'ok' || c.result === 'off') lastHeard = i; });
  /* A strum the mic heard AFTER a change fell due means the student reached it, even if the strum landed outside every window (a late one): that change
     is not "never reached" (a student who strums late and gives up must still get the old screen). lastStrumT is that strum's played time (cc.lastOnsetT is
     when it arrived, minus the mic latency, as stopT is), in the clock of c.t; -1e9 when no strum was heard this round. A sound in the last 300 ms before the
     Stop is the Stop click (a hand cannot strum and then reach the button that fast), so it does not count: the one before it does (review round 2). */
  const stopLat = coachMicLatencyMs();
  const lastOnsetEff = cc.lastOnsetT - stopLat > stopT - 300 ? cc.prevOnsetT : cc.lastOnsetT;
  const lastStrumT = lastOnsetEff - stopLat;
  const neverReached = ended || (cc.ladder && cc.phase === 'countin' && cc.stage > 0) ? []
    : cc.changes.filter((c, i) => i > lastHeard && c.t > lastStrumT && ((c.result === null && !c.pend && !c.hold) || (c.result === 'miss' && stopT - c.t < CC_STOP_REACH_MS)));
  neverReached.forEach(c => { c.neverReached = true; });   // ccRenderDone draws these as "not reached", not as "no strum heard", when everything the student did reach was right
  cc.unreached = neverReached.length;
  /* Nothing had fallen due yet at the Stop (no earlier round either): "before the first change" is true. Otherwise changes went by in silence (ccRenderDone). */
  cc.noneDue = (cc.stageLog || []).length === 0 && (cc.phase === 'countin' || cc.changes.every(c => c.t > stopT));
  cc.noStrum = (cc.onsetCount || 0) - (clickOnsetT !== null ? 1 : 0) <= 0;   // no strum at all in the whole game, the Stop click not counted
  cc.silentStop = !ended && cc.noStrum;   // a Stop in a game where the mic heard nothing at all (ccRenderDone: no tempo advice)
  /* A Stop early in a later round, before any strum of it was heard: the hand may have left in the round before (the count-in has no Stop button, so the
     click waits for this round's play screen). The count-in is not reach time. */
  if (!ended && cc.ladder && cc.phase === 'play' && cc.stage > 0 && lastHeard < 0 && cc.stageLog.length && cc.roundEndT != null){
    const prev = cc.stageLog[cc.stageLog.length - 1].changes, gap = cc.listenStart - cc.roundEndT;
    let prevHeard = -1;
    prev.forEach((c, i) => { if (c.result === 'ok' || c.result === 'off') prevHeard = i; });
    /* The previous round's own last strum (saved when that round ended) and any strum already heard in this round both mean the hand did not go for Stop. */
    const prevStrumT = (cc.prevLastOnsetT == null ? -1e9 : cc.prevLastOnsetT) - coachMicLatencyMs();
    const prevUn = lastOnsetEff > 0 ? [] : prev.filter((c, i) => i > prevHeard && c.t > prevStrumT && c.result === 'miss' && stopT - gap - c.t < CC_STOP_REACH_MS);
    prevUn.forEach(c => { c.neverReached = true; });
    cc.unreached += prevUn.length;
  }
  cc.changes.forEach(c => {
    if (c.pend) ccResolvePend(c);
    if (c.result === null && c.hold) ccHoldFinal(c);
    if (c.result === null) c.result = 'miss';
  });
  /* A song switch reports all its rounds together. A round whose count-in had not
     finished was never played, so it is left out rather than counted as misses. */
  if (cc.ladder){
    if (!(cc.phase === 'countin' && cc.stage > 0)) cc.stageLog.push({ bpm: ccRoundBpm(), changes: cc.changes });
    cc.changes = cc.stageLog.reduce((a, sg) => a.concat(sg.changes), []);
  }
  const rec = ccIsPower() ? micRecStop() : null;   // before coachMicOff, which drops a running capture
  if (cc.micOn){ coachMicOff(); cc.micOn = false; }
  cc.phase = 'done';
  const oldBest = (games[ccGameKey()] && games[ccGameKey()].bestBpm) || 0;
  // New-best only counts on a run clean enough to save — ccRenderDone's
  // r >= 0.85 branch is what writes games.cc.bestBpm (games.pw for Power
  // Chord Switch), so a bombed run at a
  // high BPM would otherwise re-collect the +5 bonus on every attempt.
  const ccOk = cc.changes.filter(c => c.result === 'ok').length;
  cc.isNewBest = cc.changes.length > 0 && ccOk / cc.changes.length >= 0.85 && ccScoreBpm() > oldBest;
  // XP is participation credit for an actual round — an immediate Start →
  // Stop is not one, and nor is a full round with no change landed (the
  // timer runs out on its own with the guitar silent).
  if (complete && ccOk > 0) awardArcadeXp(cc.isNewBest);
  ccRenderDone();
  /* A game played to the end is saved, and so is a Stopped one (Jonathan, 2026-11-04: "save it on stop too")
     — marked complete:false in the take. A Stopped one needs MICREC_MIN_STOPPED_SEC of play after the first count-in: each student
     has ONE take per game and a new take overwrites it, so an accidental Stop must not replace a full take
     (or use up the collection counter) with two seconds of count-in. Leaving the screen still drops it. */
  const playedSec = cc.firstPlayAt == null ? 0 : (performance.now() - cc.firstPlayAt) / 1000;   // time played, not audio length: the audio starts at the count-in, which lasts 12 s at 10 BPM
  if (rec && (complete || playedSec >= MICREC_MIN_STOPPED_SEC)) micRecSave(rec, ccRecMeta(complete));
}

function ccRenderDone(){
  const body = ccBody();
  if (!body || !cc) return;
  const prog = ccProgs()[cc.progIdx];
  const total = cc.changes.length;
  const ok = cc.changes.filter(c => c.result === 'ok').length;
  const off = cc.changes.filter(c => c.result === 'off').length;
  const r = ok / total;

  /* Which switch hurt most? */
  const tally = {};
  cc.changes.forEach(c => {
    if (c.result !== 'ok'){
      const k = pwChordName(c.from) + ' → ' + pwChordName(c.to);
      tally[k] = (tally[k] || 0) + 1;
    }
  });
  const worst = Object.keys(tally).sort((a, b) => tally[b] - tally[a])[0] || null;

  /* Power Chord Switch hears a strum only when it jumps the level by CC_POWER_* (2026-11-05), so a soft strum, or one without a clear pick sound,
     shows "no strum heard". When at least two changes went that way and they outnumber the "chord sounded wrong" ones, below 85% right, the
     headline, the advice and the big button all stop pointing at the tempo: "this speed is too fast" and "Drop 5 BPM" do nothing for a strum
     that was not heard. The advice says to strum a little firmer; the headline is the plain "N of M changes worked"; the big button is "Again"
     at the same speed. One miss alone is not enough (it may be a slip), and a game at 85% or better keeps its "Level up". Change Up keeps all
     of it. */
  const unheard = total - ok - off - (cc.unreached || 0);   // not the changes a Stop left unplayed
  const firmer = ccIsPower() && r < 0.85 && unheard >= 2 && unheard > off;
  /* A Stop with changes still ahead, where every change the student DID reach was right (Jonathan, 2026-11-07): the changes never reached say
     nothing about the speed, so there is no "this speed is too fast" and no "Drop 5 BPM" (4 right, then Stop, used to read "4 of 15 ... too
     fast"). The headline counts the changes reached, the advice says to play it through, the breakdown and chips do not call the rest "no strum
     heard", and the row stays at the same tempo. At 85% or better of ALL the changes the "great" screen is still right, so it keeps that. */
  const reachedN = total - (cc.unreached || 0);
  const allReachedRight = (cc.unreached || 0) > 0 && ok === reachedN;   // the chips, the breakdown and the rounds line follow this at any score (also true when nothing was reached)
  const noneReached = (cc.unreached || 0) > 0 && reachedN === 0;        // a Stop before the first change (Jonathan, 2026-11-07: a neutral screen, no tempo advice); if changes fell due in silence first, "No strum was heard before you stopped." (Jonathan, 2026-11-08), same advice
  /* A Stop in a game where the mic heard nothing at all, once a change is more than CC_STOP_REACH_MS past due (so noneReached is false): the speed was never
     tried, so "this speed is too fast" and "Drop 5 BPM" are false (Jonathan, 2026-11-09: a neutral screen, as for noneReached). Power Chord Switch with two or
     more unheard changes keeps its "strum a little firmer" screen (firmer): that is the useful advice for a strum the mic cannot hear. */
  const silentStop = !!cc.silentStop && ok === 0 && off === 0 && !noneReached && !firmer;   // ok / off > 0 means a strum WAS graded (never in a real silent game)
  const stoppedClean = allReachedRight && !noneReached && r < 0.85;     // the headline and advice only below 85%: from there on the "great" screen is right
  let verdict, advice;
  if (noneReached){
    verdict = '&#x1F3B8; ' + (cc.noneDue ? t('games.cc.verdict.stoppedEarly') : cc.noStrum ? t('games.cc.verdict.stoppedSilent') : t('games.cc.verdict.stoppedNoChange'));
    advice = t('games.cc.advice.stoppedEarly');
  } else if (silentStop){
    verdict = '&#x1F3B8; ' + t('games.cc.verdict.stoppedSilent');
    advice = t('games.cc.advice.stoppedEarly');
  } else if (stoppedClean){
    verdict = '&#x1F44D; ' + t(reachedN === 1 ? 'games.cc.verdict.stoppedOne' : 'games.cc.verdict.stopped', { ok, reached: reachedN });
    advice = t('games.cc.advice.stopped');
  } else if (r >= 0.85){
    verdict = '&#x1F31F; ' + t('games.cc.verdict.great', { ok, total });
    /* At the top tempo the "N BPM faster" line is false (the tempo cannot go up), so it says that instead: Power Chord Switch since
       2026-11-07 (the test is the done row's own: the step up lands on the tempo just played), Change Up at 140 since 2026-11-09. */
    advice = t(ccDoneAtTop() ? 'games.pw.advice.top' : ccIsPower() ? 'games.pw.advice.great' : 'games.cc.advice.great');
    try {
      const k = ccBestKey(prog, cc.rateIdx);
      const best = parseInt(sessionStorage.getItem(k), 10) || 0;
      if (ccScoreBpm() > best) sessionStorage.setItem(k, String(ccScoreBpm()));
    } catch(e){}
    /* Cross-session best → the student's progress doc. Skipped in dev bypass
       (Firestore rejects that uid; the session best above still counts). */
    if (typeof saveGames === 'function' && currentUser && !isDevBypassUser() && cc.isNewBest){
      games[ccGameKey()] = { bestBpm: ccScoreBpm(), progression: cc.chords, at: new Date().toISOString().slice(0, 10) };
      /* Saved on its own — see shFinish. awardArcadeXp is the only other
         saveGames() on this path, and it is gated on a finished round. */
      saveGames();
    }
  } else if (r >= 0.5){
    const early = t(cc.bpc >= 4 ? 'games.cc.early.bar' : cc.bpc === 2 ? 'games.cc.early.half' : 'games.cc.early.beat');
    verdict = '&#x1F4AA; ' + (off ? t(off === 1 ? 'games.cc.verdict.okMessyOne' : 'games.cc.verdict.okMessy', { ok, total, off }) : t('games.cc.verdict.ok', { ok, total }));
    advice = firmer ? t('games.pw.advice.firmer') : worst ? t('games.cc.advice.practiceWorst', { worst, early }) : t('games.cc.advice.tryAgainSteady');
  } else {
    /* At the lowest tempo (Power Chord Switch 10, Change Up 40) "Drop N BPM" cannot be done and "too fast" is no help, so the
       headline is the plain count and the advice is to play it again at this speed (Jonathan, 2026-11-09). */
    const floor = !firmer && ccDoneAtFloor();
    verdict = '&#x1F3B8; ' + t(firmer || floor ? 'games.cc.verdict.ok' : 'games.cc.verdict.low', { ok, total });
    advice = firmer ? t('games.pw.advice.firmer') : floor ? t('games.cc.advice.tryAgainSteady') : t(ccIsPower() ? 'games.pw.advice.low' : 'games.cc.advice.low');
  }
  /* The silent screen (silentStop) draws EVERY change like the nothing-reached one does: grey 'not reached', never a red 'no strum heard' under a headline that says nothing was heard (review 2026-11-09). */
  const greyRest = allReachedRight || silentStop;
  const chips = cc.changes.map(c => (greyRest && c.neverReached) || silentStop
    ? `<span class="coach-chip notreached">${escHtml(pwChordName(c.to))}</span>`
    : `<span class="coach-chip ${c.result === 'ok' ? 'ok' : c.result === 'off' ? 'wrong' : 'miss'}">${escHtml(ccChipText(c))}</span>`
  ).join('');
  /* What the chips mean, in numbers: right, on time but the chord sounded wrong, no strum heard. */
  const nLeft = silentStop ? total : (cc.unreached || 0);
  const nMiss = total - ok - off - (greyRest ? nLeft : 0);
  const breakdown = noneReached && !cc.noneDue ? '' : `<div class="cc-breakdown">${escHtml(t('games.cc.breakdown', { ok, off, miss: nMiss }) + (greyRest ? t('games.cc.breakdown.left', { left: nLeft }) : ''))}</div>`;
  const rec0 = firmer || stoppedClean || noneReached || silentStop ? 'same' : r >= 0.85 ? 'up' : r >= 0.5 ? 'same' : 'down';
  /* Never recommend a step the tempo cannot take (Change Up's lit button; Power Chord Switch's row clamps on its own). */
  const rec = (rec0 === 'up' && ccDoneAtTop()) || (rec0 === 'down' && ccDoneAtFloor()) ? 'same' : rec0;
  /* A song switch: how each round went, at its own tempo. */
  /* Power Chord Switch (2026-11-05, Jonathan: the button should take more than one click and show the tempo): a −5 / +5 row
     with the tempo between, as on the setup screen, and one big "Again at N BPM" that plays it. The row opens on the tempo the
     advice names (5 up after 85% but not past the top, 5 down after under half, else the same); cc.nextBpm is set once per finished game (ccStart
     clears it), so drawing the screen again does not move it a second time. Change Up keeps its three buttons. */
  if (ccIsPower() && cc.nextBpm == null)
    cc.nextBpm = Math.min(ccDoneMaxBpm(), Math.max(CC_POWER_BPM_MIN, ccDonePlayedBpm() + (rec === 'up' ? CC_POWER_AGAIN_STEP : rec === 'down' ? -CC_POWER_AGAIN_STEP : 0)));
  const actions = ccIsPower()
    ? `<div class="coach-bpm-row">
         <button type="button" class="tp-btn" onclick="ccDoneNudge(${-CC_POWER_AGAIN_STEP})">&#x2212;${CC_POWER_AGAIN_STEP}</button>
         <span class="coach-bpm-readout" id="cc-done-bpm">${cc.nextBpm} BPM</span>
         <button type="button" class="tp-btn" onclick="ccDoneNudge(${CC_POWER_AGAIN_STEP})">+${CC_POWER_AGAIN_STEP}</button>
       </div>
       <div class="coach-actions">
         <button type="button" class="coach-start" id="cc-done-again" onclick="ccAgain(0)">&#x21BB; ${ccDoneAgainText()}</button>
       </div>`
    /* Change Up: no −10 at its lowest tempo and no +10 at its top (Jonathan, 2026-11-09): they did nothing there. */
    : `<div class="coach-actions">
       ${ccDoneAtFloor() ? '' : `<button type="button" class="${rec === 'down' ? 'coach-start' : 'tp-btn'}" onclick="ccAgain(-10)">&#x2B07; ${t('games.common.bpmDown10')}</button>`}
       <button type="button" class="${rec === 'same' ? 'coach-start' : 'tp-btn'}" onclick="ccAgain(0)">&#x21BB; ${t('games.common.again', { bpm: cc.bpm })}</button>
       ${ccDoneAtTop() ? '' : `<button type="button" class="${rec === 'up' ? 'coach-start' : 'tp-btn'}" onclick="ccAgain(10)">&#x2B06; ${t('games.common.bpmUp10')}</button>`}
     </div>`;
  /* When everything reached was right, a round counts only the changes reached in it, and a round with none left is not listed ("4 of 4" next to "Round 1: 4 of 7" read as a contradiction). */
  const roundRows = cc.ladder ? cc.stageLog.map((sg, k) => ({ k, sg, shown: silentStop ? [] : greyRest ? sg.changes.filter(c => !c.neverReached) : sg.changes })).filter(x => x.shown.length) : [];
  const rounds = cc.ladder && roundRows.length ? '<div class="cc-rounds">' + roundRows.map(({ k, sg, shown }) =>
    `<span>${escHtml(t('games.pw.ladder.roundResult', { n: k + 1, bpm: sg.bpm, ok: shown.filter(c => c.result === 'ok').length, total: shown.length }))}</span>`).join('') + '</div>' : '';
  /* The way back to the setup: Power Chord Switch's is the first thing on the screen (pwBackBtnHtml); Change Up keeps its button at the bottom. */
  const backTop = ccIsPower() ? pwBackBtnHtml(`ccSetup(${jsonAttrArg('power')})`) : '';
  const backBottom = ccIsPower() ? '' : `<button type="button" class="tp-btn cc-change-loop" onclick="ccSetup(${jsonAttrArg(cc.mode || '')})">${t('games.cc.pickDifferentLoop')}</button>`;
  body.innerHTML =
    `<div class="coach-report">${backTop}<div class="coach-overall">${verdict}</div>
     ${rounds}
     ${breakdown}
     <div class="coach-strip">${chips}</div>
     <div class="coach-crit-note">${escHtml(advice)}</div>
     ${actions}
     ${backBottom}
     ${coachFootHtml(ccIsPower())}</div>`;
}

/* "Again at 35 BPM" (a pair) / "Again from 35 BPM" (a song switch: its first round). */
function ccDoneAgainText(){
  return cc.ladder ? t('games.pw.ladder.again', { bpm: cc.nextBpm }) : t('games.common.again', { bpm: cc.nextBpm });
}
/* Power Chord Switch's done-screen −5 / +5: only moves the tempo shown; "Again" plays it. */
/* The highest tempo the done row may show: a song switch's first round tops out two steps below CC_BPM_MAX (ccLadderBpms), so 135 would play as 130. */
function ccDoneMaxBpm(){ return cc.ladder ? CC_BPM_MAX - (CC_LADDER_ROUNDS - 1) * CC_LADDER_STEP : CC_BPM_MAX; }
/* The tempo the finished game was played at, which the done row starts from: a song switch's first round, a pair's lowest tempo. */
function ccDonePlayedBpm(){ return cc.ladder ? (cc.stageLog.length ? cc.stageLog[0].bpm : cc.bpm) : ccScoreBpm(); }
/* Where "Level up" would go: one step above the tempo played, but never above the top the row allows. When that is the tempo just
   played, there is no step up to recommend. */
function ccDoneUpBpm(){ return Math.min(ccDoneMaxBpm(), ccDonePlayedBpm() + CC_POWER_AGAIN_STEP); }
/* The tempo just played is the highest / lowest the done screen can offer: no "faster" or "slower" advice there. */
function ccDoneAtTop(){ return ccIsPower() ? ccDoneUpBpm() <= ccDonePlayedBpm() : cc.bpm >= CC_BPM_MAX; }
function ccDoneAtFloor(){ return ccIsPower() ? ccDonePlayedBpm() <= CC_POWER_BPM_MIN : cc.bpm <= CC_BPM_MIN; }
function ccDoneNudge(d){
  if (!cc || cc.phase !== 'done' || !ccIsPower() || cc.nextBpm == null) return;
  cc.nextBpm = Math.min(ccDoneMaxBpm(), Math.max(CC_POWER_BPM_MIN, cc.nextBpm + d));
  const el = document.getElementById('cc-done-bpm');
  if (el) el.textContent = cc.nextBpm + ' BPM';
  const again = document.getElementById('cc-done-again');
  if (again) again.innerHTML = '&#x21BB; ' + escHtml(ccDoneAgainText());
}
function ccAgain(d){
  if (!cc || cc.phase !== 'done') return;   // a second tap while the first is starting
  cc.heldPairBpm = null;                    // the tempo held across a song-switch look is over once a game is played
  if (ccIsPower() && cc.nextBpm != null) cc.bpm = cc.nextBpm;
  cc.bpm = Math.min(CC_BPM_MAX, Math.max(ccBpmMin(), cc.bpm + d));
  try { sessionStorage.setItem(ccSk('Bpm'), String(cc.bpm)); } catch(e){}
  cc.phase = 'setup';
  ccStart(true);
}

/* ════════════════════════════════════════════════════════════════════
   CHORD DIFFICULTY RANKS — shared by the two climbing card games, Chord
   Blitz (shapes, by eye) and Chord Detective (the same chords, by ear).
   One rank per chord, in the order the COURSE teaches them: Module 4's
   Group 1 (C F Am G), then Group 2 (D A Em) alongside the open power
   shapes, then Dm and the movable power shapes, then Group 3 (E, B7) —
   with Bm, a Group 2 chord, ranked alongside them.

   F#m and C#m were dropped from both games' decks 2026-09-28 (Jonathan)
   — no module teaches either shape; only Bm (Group 2) is taught. (The
   names do appear: a Module 6 reggae progression, a Module 7 Choice-song
   line that says to barre C#m, Module 10's relative-minor list — mentions,
   not lessons.) The former "barre" deck existed only to
   drill Bm/F#m/C#m against each other by ear/eye, which stops making
   sense with two of the three not yet part of the course, so the deck
   itself is gone too — Bm still practices via the "all" deck. Re-add a
   barre deck once F#m/C#m have an actual lesson to build on, and give the
   three DIFFERENT ranks then (not all the same one) so the deck gets a
   real build-up instead of a flat 3-way cold open — see the games
   open-items memory for why a flat single-level "hardest case immediately"
   deck was the wrong call even for a chord that IS taught.

   Every deck in both games DERIVES its levels from this one table
   (cbDeckLevels / cdDeckLevels), so no deck carries its own tier list that
   could drift from it. Adding a chord to any deck means adding it here too
   — checks.mjs 1ag fails the push both ways, because a chord with no rank
   doesn't look broken: chordRankOf() falls back to 1 and it quietly turns
   up on card one.
   ════════════════════════════════════════════════════════════════════ */
const CHORD_RANK = {
  C: 1, F: 1, Am: 1, G: 1,
  D: 2, A: 2, Em: 2, E5: 2, A5: 2, D5: 2,
  Dm: 3, G5: 3, C5: 3,
  E: 4, B7: 4, Bm: 4
};
function chordRankOf(n){ return CHORD_RANK[n] || 1; }

/* Levels for one deck: the distinct ranks its chords actually cover, lowest
   first, renumbered 1..N. A deck whose chords all share a rank (Partial
   barres) is one level — the climb just has nowhere to go, which is fine. */
function chordDeckLevels(chords){
  const ranks = Array.from(new Set(chords.map(chordRankOf))).sort((a, b) => a - b);
  return ranks.map(r => chords.filter(n => chordRankOf(n) === r));
}

/* ════════════════════════════════════════════════════════════════════
   CHORD BLITZ — a ten-card chord-shape sprint with FIVE SECONDS a card.
   No mic and no guitar: pick a deck, then either name the shape you see
   ("Name it") or pick the shape for the name you see ("Spot it").

   The round CLIMBS. Only the easiest chords in the deck are in play at
   the start; every CB_PROMOTE_EVERY right answers adds the next level's
   chords to the pool and the level chip ticks up. A miss never demotes —
   the ladder only goes one way, so a bad card can't spiral. Running the
   card clock out is a miss too, minus the point penalty (nothing was
   guessed wrong). Right answers build a streak that multiplies points,
   and points scale with the level, so climbing is what a big score is
   made of. Best per deck+direction is session-scoped (hub chip says
   "today"); the cross-session best goes to the progress doc via the
   'games' category.

   Was a flat 90-second block with the whole deck in play from card one
   (Jonathan, 2026-09-16: "1:30 is way too long").
   ════════════════════════════════════════════════════════════════════ */

const CB_CARDS = 10;          // cards in a round
const CB_CARD_MS = 5000;      // 5 seconds a card, then it counts as missed
const CB_PROMOTE_EVERY = 2;   // right answers per level

// labelKey resolved at render time in cbRenderSetup() — never here (this
// table is built once at load, so t() here would freeze one language in).
const CB_DECKS = [
  { id: 'open',  labelKey: 'games.cb.deck.open',  chords: ['E','Em','A','Am','D','Dm','G','C','F','B7'] },
  { id: 'power', labelKey: 'games.cb.deck.power', chords: ['E5','G5','A5','C5','D5'] },
  { id: 'all',   labelKey: 'games.cb.deck.all',   chords: ['E','Em','A','Am','D','Dm','G','C','F','E5','G5','A5','C5','D5','Bm','B7'] }
];

let cb = null, cbTick = null;

function cbStop(){
  if (cbTick){ clearInterval(cbTick); cbTick = null; }
  document.removeEventListener('keydown', cbKeydown);
  if (cb){
    (cb.timeouts || []).forEach(clearTimeout);
    cb = null;
  }
}

function cbBody(){ return document.getElementById('cb-body'); }
/* Bumped from 'cbBest:' when the round became 10 cards — a score from the
   old 90-second block is 30-odd cards' worth and would never be beaten. */
function cbBestKey(deck, dir){ return 'cbBest2:' + deck + ':' + dir; }
function cbDeckChords(){
  const d = CB_DECKS.find(x => x.id === cb.deck);
  return (d || CB_DECKS[0]).chords;
}
function cbDeckLevels(){ return chordDeckLevels(cbDeckChords()); }

/* Everything unlocked so far — levels are cumulative, so an early chord
   keeps coming back instead of being retired the moment you climb. */
function cbPool(){
  return cb.levels.slice(0, cb.level).reduce((a, lvl) => a.concat(lvl), []);
}

function cbSetup(){
  let deck = 'open', dir = 'name';
  try {
    deck = sessionStorage.getItem('cbDeck') || deck;
    dir = sessionStorage.getItem('cbDir') || dir;
  } catch(e){}
  if (!CB_DECKS.some(d => d.id === deck)) deck = 'open';
  if (dir !== 'name' && dir !== 'spot') dir = 'name';
  cb = { phase: 'setup', deck, dir, timeouts: [] };
  cbRenderSetup();
}

function cbPickDeck(id){
  if (!cb) return;
  cb.deck = id;
  try { sessionStorage.setItem('cbDeck', id); } catch(e){}
  cbRenderSetup();
}

function cbPickDir(d){
  if (!cb) return;
  cb.dir = d;
  try { sessionStorage.setItem('cbDir', d); } catch(e){}
  cbRenderSetup();
}

function cbRenderSetup(){
  const body = cbBody();
  if (!body || !cb) return;
  const deckPills = CB_DECKS.map(d =>
    `<button type="button" class="ts-btn${d.id === cb.deck ? ' active' : ''}" onclick="cbPickDeck('${d.id}')">${escHtml(t(d.labelKey))}</button>`
  ).join('');
  const dirPills = [['name', t('games.cb.nameIt')], ['spot', t('games.cb.spotIt')]].map(([d, label]) =>
    `<button type="button" class="ts-btn${d === cb.dir ? ' active' : ''}" onclick="cbPickDir('${d}')">${label}</button>`
  ).join('');
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(cbBestKey(cb.deck, cb.dir)), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="cc-group"><div class="cc-group-title">${t('games.common.deck')}</div><div class="fret-levels">${deckPills}</div></div>
     <div class="cc-group"><div class="cc-group-title">${t('games.cb.direction')}</div><div class="fret-levels">${dirPills}</div></div>
     <div class="coach-tip">${t('games.cb.tip')}</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="cbStart()">&#x25B6; ${t('games.cb.startButton')}</button>`;
}

function cbStart(){
  if (!cb || cb.phase === 'play') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  const s = cb;
  s.phase = 'play';
  s.score = 0; s.streak = 0; s.answered = 0; s.correct = 0;
  s.cur = null; s.prev = null; s.opts = [];
  s.requeue = []; s.locked = false;
  s.levels = cbDeckLevels();
  s.level = 1; s.topLevel = 1; s.promoted = false;
  s.cardEndAt = 0;
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  document.addEventListener('keydown', cbKeydown);   // laptop: 1–4 answer
  if (cbTick) clearInterval(cbTick);
  /* 50ms: the fuse bar is only five seconds wide, so a coarser tick would
     move it in visible jumps. Cheap — nothing else runs during a card. */
  cbTick = setInterval(cbTimerTick, 50);
  cbNext();
}

function cbTimerTick(){
  if (!cb || cb.phase !== 'play'){
    if (cbTick){ clearInterval(cbTick); cbTick = null; }
    return;
  }
  if (!cbBody()){ cbStop(); return; }   // panel swapped under us
  if (cb.locked) return;                // reveal pause — the card clock waits
  const left = cb.cardEndAt - performance.now();
  const fill = document.getElementById('cb-fuse-fill');
  if (fill) fill.style.width = Math.max(0, Math.min(100, (left / CB_CARD_MS) * 100)) + '%';
  const el = document.getElementById('cb-timer');
  if (el){
    el.textContent = String(Math.max(0, Math.ceil(left / 1000)));
    el.classList.toggle('low', left <= 2000);
  }
  if (left <= 0) cbTimeUp();
}

/* Keys 1–4 answer a four-choice card round on a laptop — the same rule for
   Chord Blitz, Chord Detective, Name That Riff and Fret Zap. Each game keeps
   its own named handler (add/removeEventListener need one). */
function cardAnswerKey(e, s, answer){
  if (e.repeat) return;
  if (!s || s.phase !== 'play' || s.locked) return;
  const tag = (e.target && e.target.tagName) || '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
  const i = ['1', '2', '3', '4'].indexOf(e.key);
  if (i >= 0) answer(i);
}
function cbKeydown(e){ cardAnswerKey(e, cb, cbAnswer); }

/* A missed chord is due again 3–5 cards later; otherwise random from the
   chords unlocked so far. Never the same card twice in a row. */
function cbPickCard(){
  const i = cb.requeue.findIndex(q => q.due <= cb.answered && q.name !== cb.prev);
  if (i >= 0) return cb.requeue.splice(i, 1)[0].name;
  const unlocked = cbPool();
  const pool = unlocked.filter(n => n !== cb.prev);
  return (pool.length ? pool : unlocked)[Math.floor(Math.random() * (pool.length || unlocked.length))];
}

function cbShuffle(arr){
  for (let i = arr.length - 1; i > 0; i--){
    const j = Math.floor(Math.random() * (i + 1));
    const t = arr[i]; arr[i] = arr[j]; arr[j] = t;
  }
  return arr;
}

/* Distractors come from the chords unlocked so far, topped up in rank order
   from the rest of the deck when that pool is small — four buttons drawn
   from a four-chord level 1 would be the same four names every card. An
   unfamiliar distractor only makes a card easier, never harder. */
function cbOptionPool(){
  const unlocked = cbPool();
  if (unlocked.length >= 6) return unlocked;
  const rest = cbDeckChords().filter(n => unlocked.indexOf(n) < 0)
    .sort((a, b) => chordRankOf(a) - chordRankOf(b));
  return unlocked.concat(rest.slice(0, 6 - unlocked.length));
}

function cbOptions(correct){
  /* Deck-native chords always fill the distractor slots first — see the
     identical fix in cdOptions() (Chord Detective) for the simulated
     numbers: a random shuffle-then-slice over (native + borrowed) let the
     former barre deck's two other barre shapes lose out to easy open-
     chord decoys the large majority of rounds, so "spot the Bm/F#m/C#m
     shape" rarely actually tested that 3-way discrimination (that deck is
     gone now — see CHORD_RANK's note — but no current deck is small
     enough to hit the borrow branch below, so this is dormant, not dead:
     the next small deck gets it right from the start). Borrowing only
     tops up whatever's still missing after every native option is in. */
  let opts = cbOptionPool().filter(n => n !== correct);
  if (opts.length < 3){   // tiny deck: borrow distractors from the full library
    const all = CB_DECKS[CB_DECKS.length - 1].chords;
    const borrowed = cbShuffle(all.filter(n => n !== correct && opts.indexOf(n) < 0));
    opts = opts.concat(borrowed).slice(0, 3);
  } else {
    opts = cbShuffle(opts).slice(0, 3);
  }
  opts.push(correct);
  return cbShuffle(opts);
}

/* 10 a card at level 1, rising 5 a level, times the streak multiplier. */
function cbCardPoints(s){
  return (10 + 5 * (s.level - 1)) * Math.min(4, 1 + Math.floor(s.streak / 5));
}

function cbNext(){
  if (!cb || cb.phase !== 'play') return;
  const body = cbBody();
  if (!body){ cbStop(); return; }
  const s = cb;
  if (s.answered >= CB_CARDS){ cbFinish(); return; }
  const was = s.level;
  s.level = Math.min(s.levels.length, 1 + Math.floor(s.correct / CB_PROMOTE_EVERY));
  s.promoted = s.level > was;
  if (s.level > s.topLevel) s.topLevel = s.level;
  s.cur = cbPickCard();
  s.prev = s.cur;
  s.opts = cbOptions(s.cur);
  s.locked = false;
  s.cardEndAt = performance.now() + CB_CARD_MS;
  const svg = n => (typeof localChordSvg === 'function' && localChordSvg(n)) || '';
  const prompt = s.dir === 'name'
    ? `<div class="cb-prompt"><div class="cb-prompt-dia">${svg(s.cur)}</div></div>`
    : `<div class="cb-prompt"><div class="cb-prompt-name">${escHtml(s.cur)}</div></div>`;
  const answers = s.opts.map((n, i) =>
    `<button type="button" class="cb-answer" id="cb-opt-${i}" onclick="cbAnswer(${i})"><span class="cb-key">${i + 1}</span>` +
    (s.dir === 'name' ? escHtml(n) : `<span class="cb-answer-dia">${svg(n)}</span>`) +
    `</button>`
  ).join('');
  const mult = Math.min(4, 1 + Math.floor(s.streak / 5));
  /* A one-level deck has nothing to climb, so it shows no level chip. */
  const levelChip = s.levels.length > 1
    ? `<span class="cb-level${s.promoted ? ' up' : ''}">${t('games.common.level', { n: s.level })}${s.promoted ? ' &#x2191;' : ''}</span>`
    : '';
  body.innerHTML =
    `<div class="cb-hud">
       <span class="cb-timer" id="cb-timer">${Math.ceil(CB_CARD_MS / 1000)}</span>
       <span class="cb-score" id="cb-score">${t('games.common.score', { n: s.score })}</span>
       <span class="cb-streak" id="cb-streak">${s.streak >= 2 ? '&#x1F525; ' + t('games.common.inARow', { n: s.streak }) + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;'}</span>
     </div>
     <div class="cb-meta">
       <span class="cb-count">${t('games.common.cardOf', { n: s.answered + 1, total: CB_CARDS })}</span>
       ${levelChip}
     </div>
     <div class="cb-fuse"><div class="cb-fuse-fill" id="cb-fuse-fill"></div></div>
     <div class="cb-cols">${prompt}<div class="cb-answers">${answers}</div></div>`;
}

/* Wrong, or out of time: show the right button for a beat (inputs locked)
   and requeue the card. Pass the tapped index to flag it, or null when the
   clock ran out and nothing was tapped. */
function cbRevealThenNext(wrongIdx){
  const s = cb;
  s.locked = true;
  if (wrongIdx !== null){
    const hit = document.getElementById('cb-opt-' + wrongIdx);
    if (hit) hit.classList.add('wrong');
  }
  const right = document.getElementById('cb-opt-' + s.opts.indexOf(s.cur));
  if (right) right.classList.add('reveal');
  const fill = document.getElementById('cb-fuse-fill');
  if (fill) fill.style.width = '0%';
  const scoreEl = document.getElementById('cb-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', { n: s.score });
  const streakEl = document.getElementById('cb-streak');
  if (streakEl) streakEl.innerHTML = '&nbsp;';
  s.timeouts.push(setTimeout(() => {
    if (cb !== s || s.phase !== 'play') return;
    cbNext();
  }, 800));
}

function cbAnswer(i){
  if (!cb || cb.phase !== 'play' || cb.locked) return;
  const s = cb;
  const pick = s.opts[i];
  if (!pick) return;
  s.answered++;
  if (pick === s.cur){
    s.correct++;
    s.streak++;
    s.score += cbCardPoints(s);
    if (typeof strumChord === 'function') strumChord(s.cur);   // reward: hear the chord you just named
    cbNext();
    return;
  }
  s.score = Math.max(0, s.score - 5);
  s.streak = 0;
  s.requeue.push({ name: s.cur, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  cbRevealThenNext(i);
}

/* Out of time. Costs the card and the streak, but no points — nothing was
   guessed wrong, and docking a frozen student twice isn't the lesson. */
function cbTimeUp(){
  if (!cb || cb.phase !== 'play' || cb.locked) return;
  const s = cb;
  s.answered++;
  s.streak = 0;
  s.requeue.push({ name: s.cur, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  cbRevealThenNext(null);
}

function cbFinish(){
  if (!cb || cb.phase !== 'play') return;
  if (cbTick){ clearInterval(cbTick); cbTick = null; }
  cb.timeouts.forEach(clearTimeout);
  cb.timeouts = [];
  cb.phase = 'done';
  cb.prevBest = 0;
  try {
    const k = cbBestKey(cb.deck, cb.dir);
    cb.prevBest = parseInt(sessionStorage.getItem(k), 10) || 0;
    if (cb.score > cb.prevBest) sessionStorage.setItem(k, String(cb.score));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts).
     v:2 marks a score from the 10-card round — a v:1 record is from the old
     90-second block and is read as no best at all rather than as a wall. */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = cbSavedBest(games);
    const isNewBest = cb.score > old;
    if (isNewBest) games.cb = { v: 2, best: cb.score, deck: cb.deck, dir: cb.dir, level: cb.topLevel, at: new Date().toISOString().slice(0, 10) };
    // XP only for a round with at least one right answer — letting the
    // timer run out on an untouched round is not a round played.
    if (cb.correct > 0) awardArcadeXp(isNewBest);
  }
  cbRenderDone();
}

/* The saved cross-session best, or 0 if the only record is a pre-10-card one. */
function cbSavedBest(saved){
  const rec = saved && saved.cb;
  return (rec && rec.v === 2 && rec.best) || 0;
}

function cbRenderDone(){
  const body = cbBody();
  if (!body || !cb) return;
  const acc = cb.answered ? Math.round(100 * cb.correct / cb.answered) : 0;
  const bestLine = cardBestLine(cb.prevBest, cb.score);
  const levelLine = cb.levels.length > 1
    ? `<div class="coach-overall">${t('games.common.reachedLevel', { n: cb.topLevel, total: cb.levels.length })}</div>`
    : '';
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${cb.score}</div>
       <div class="coach-overall">${GAME_ICO.blitz} ${t(cb.answered === 1 ? 'games.common.cardsAnsweredOne' : 'games.common.cardsAnsweredMany', { answered: cb.answered, correct: cb.correct, acc })}</div>
       ${levelLine}
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="cbStart()">&#x21BB; ${t('games.common.playAgain')}</button>
         <button type="button" class="tp-btn" onclick="cbSetup()">${t('games.cb.changeDeck')}</button>
       </div>
     </div>`;
}

/* ════════════════════════════════════════════════════════════════════
   CHORD DETECTIVE — Chord Blitz's ear twin, with the diagram replaced by
   a Play button: strumChord() plays a taught chord with NOTHING shown,
   and you name it from four choices purely by ear. No name/spot toggle
   (Chord Blitz already owns diagram literacy — this game is ear-only,
   that's the whole point). Same requeue / streak / scoring / climb
   mechanics as Chord Blitz, deliberately, so a student who's learned one
   already knows how to play the other.

   ⚠ THE CARD CLOCK IS HELD WHILE THE CHORD IS SOUNDING. Five seconds a
   card here means five seconds of THINKING, not five seconds counting
   from a chord the student hasn't finished hearing. Every play — the
   auto-play on a new card and every replay — parks the clock for
   CD_SOUND_MS, so replaying to listen properly is never what runs it out.
   This is the same call as `speedBonus` staying off in a live quiz where
   the teacher makes the sound after the question opens (CLAUDE.md): in an
   ear game, charging for listening time scores patience instead of ears.

   Was a flat 60-second block with the whole deck in play from card one —
   matched to Chord Blitz 2026-09-16, same session, same reason.
   ════════════════════════════════════════════════════════════════════ */

const CD_CARDS = 10;          // cards in a round
const CD_CARD_MS = 5000;      // 5 seconds a card, then it counts as missed
const CD_PROMOTE_EVERY = 2;   // right answers per level
/* How long a play parks the clock. strumChord() strums 6 notes 35ms apart
   and each note rings up to 3s (app.js GUITAR_NOTE_FILES; 2.0s for the
   synth fallback, ksPluckBuffer), so this
   covers the strum-out plus the part of the decay you can actually name a
   chord from, without parking so long that the card stalls. */
const CD_SOUND_MS = 1600;

const CD_DECKS = [
  { id: 'open',  labelKey: 'games.cd.deck.open',  chords: ['E','Em','A','Am','D','Dm','G','C','F'] },
  { id: 'all',   labelKey: 'games.cd.deck.all',   chords: ['E','Em','A','Am','D','Dm','G','C','F','Bm','B7'] }
];

let cd = null, cdTick = null;

function cdStop(){
  if (cdTick){ clearInterval(cdTick); cdTick = null; }
  document.removeEventListener('keydown', cdKeydown);
  if (cd){
    (cd.timeouts || []).forEach(clearTimeout);
    cd = null;
  }
}

function cdBody(){ return document.getElementById('cd-body'); }
/* Bumped from 'cdBest:' when the round became 10 cards — a score from the
   old 60-second block is far more cards and would never be beaten. */
function cdBestKey(deck){ return 'cdBest2:' + deck; }
function cdDeckChords(){
  const d = CD_DECKS.find(x => x.id === cd.deck);
  return (d || CD_DECKS[0]).chords;
}
function cdDeckLevels(){ return chordDeckLevels(cdDeckChords()); }

/* Everything unlocked so far — levels are cumulative, so an early chord
   keeps coming back instead of being retired the moment you climb. */
function cdPool(){
  return cd.levels.slice(0, cd.level).reduce((a, lvl) => a.concat(lvl), []);
}

function cdSetup(){
  let deck = 'open';
  try { deck = sessionStorage.getItem('cdDeck') || deck; } catch(e){}
  if (!CD_DECKS.some(d => d.id === deck)) deck = 'open';
  cd = { phase: 'setup', deck, timeouts: [] };
  cdRenderSetup();
}

function cdPickDeck(id){
  if (!cd) return;
  cd.deck = id;
  try { sessionStorage.setItem('cdDeck', id); } catch(e){}
  cdRenderSetup();
}

function cdRenderSetup(){
  const body = cdBody();
  if (!body || !cd) return;
  const deckPills = CD_DECKS.map(d =>
    `<button type="button" class="ts-btn${d.id === cd.deck ? ' active' : ''}" onclick="cdPickDeck('${d.id}')">${escHtml(t(d.labelKey))}</button>`
  ).join('');
  let best = 0;
  try { best = parseInt(sessionStorage.getItem(cdBestKey(cd.deck)), 10) || 0; } catch(e){}
  body.innerHTML =
    `<div class="cc-group"><div class="cc-group-title">${t('games.common.deck')}</div><div class="fret-levels">${deckPills}</div></div>
     <div class="coach-tip">${t('games.cd.tip')}</div>
     ${best ? `<div class="cb-setup-best">&#x1F3C6; ${t('games.common.bestTodayLabel')}: ${best}</div>` : ''}
     <button type="button" class="coach-start" onclick="cdStart()">&#x25B6; ${t('games.cd.startButton')}</button>`;
}

function cdStart(){
  if (!cd || cd.phase === 'play') return;
  coachClose(); coachEvictTuner();   // one mic/audio owner at a time
  /* The round is judged by ear, so it has to be heard clean: a metronome or
     backing track the student left running would play under every card
     (Name That Riff's ntrPlay does the same). */
  if (typeof stopAllDemoAudio === 'function') stopAllDemoAudio();
  const s = cd;
  s.phase = 'play';
  s.score = 0; s.streak = 0; s.answered = 0; s.correct = 0;
  s.cur = null; s.prev = null; s.opts = [];
  s.requeue = []; s.locked = false;
  s.levels = cdDeckLevels();
  s.level = 1; s.topLevel = 1; s.promoted = false;
  s.cardEndAt = 0; s.holdUntil = 0;
  (s.timeouts || []).forEach(clearTimeout);
  s.timeouts = [];
  document.addEventListener('keydown', cdKeydown);   // laptop: 1–4 answer
  if (cdTick) clearInterval(cdTick);
  /* 50ms: the fuse bar is only five seconds wide, so a coarser tick would
     move it in visible jumps. Cheap — nothing else runs during a card. */
  cdTick = setInterval(cdTimerTick, 50);
  cdNext();
}

function cdTimerTick(){
  if (!cd || cd.phase !== 'play'){
    if (cdTick){ clearInterval(cdTick); cdTick = null; }
    return;
  }
  if (!cdBody()){ cdStop(); return; }   // panel swapped under us
  if (cd.locked) return;                // reveal pause — the card clock waits
  const now = performance.now();
  /* Still sounding: hold the clock AND push the deadline out with it, so
     the student gets the full five seconds of quiet however long they
     listened for. */
  if (now < cd.holdUntil){
    cd.cardEndAt = cd.holdUntil + CD_CARD_MS;
    cdPaintClock(CD_CARD_MS, true);
    return;
  }
  const left = cd.cardEndAt - now;
  cdPaintClock(left, false);
  if (left <= 0) cdTimeUp();
}

function cdPaintClock(left, listening){
  const fill = document.getElementById('cd-fuse-fill');
  if (fill){
    fill.style.width = Math.max(0, Math.min(100, (left / CD_CARD_MS) * 100)) + '%';
    fill.classList.toggle('listening', !!listening);
  }
  const el = document.getElementById('cd-timer');
  if (el){
    el.textContent = String(Math.max(0, Math.ceil(left / 1000)));
    el.classList.toggle('low', !listening && left <= 2000);
  }
}

/* Every play parks the clock, the auto-play on a new card included. */
function cdPlay(){
  if (!cd || !cd.cur) return;
  if (typeof strumChord === 'function') strumChord(cd.cur);
  if (cd.phase === 'play' && !cd.locked){
    cd.holdUntil = performance.now() + CD_SOUND_MS;
    cd.cardEndAt = cd.holdUntil + CD_CARD_MS;
  }
}

function cdKeydown(e){ cardAnswerKey(e, cd, cdAnswer); }

/* A missed chord is due again 3–5 cards later; otherwise random from the
   chords unlocked so far. Never the same card twice in a row. */
function cdPickCard(){
  const i = cd.requeue.findIndex(q => q.due <= cd.answered && q.name !== cd.prev);
  if (i >= 0) return cd.requeue.splice(i, 1)[0].name;
  const unlocked = cdPool();
  const pool = unlocked.filter(n => n !== cd.prev);
  return (pool.length ? pool : unlocked)[Math.floor(Math.random() * (pool.length || unlocked.length))];
}

/* Distractors come from the chords unlocked so far, topped up in rank order
   from the rest of the deck when that pool is small — four buttons drawn
   from a four-chord level 1 would be the same four names every card. */
function cdOptionPool(){
  const unlocked = cdPool();
  if (unlocked.length >= 6) return unlocked;
  const rest = cdDeckChords().filter(n => unlocked.indexOf(n) < 0)
    .sort((a, b) => chordRankOf(a) - chordRankOf(b));
  return unlocked.concat(rest.slice(0, 6 - unlocked.length));
}

function cdOptions(correct){
  /* Deck-native chords always fill the distractor slots first — a random
     shuffle-then-slice over (native + borrowed) let the former barre
     deck's two other barre chords lose out to easy open-chord decoys 95%
     of the time (simulated: only 4.5% of rounds tested the actual 3-way
     Bm/F#m/C#m discrimination that deck existed to teach — see CHORD_RANK
     for why it's gone now). No current deck is small enough to hit the
     borrow branch below, so this stays dormant, not dead: the next small
     deck gets it right from the start. Borrowing only tops up whatever's
     still missing after every native option is already in. */
  let opts = cdOptionPool().filter(n => n !== correct);
  if (opts.length < 3){   // tiny deck: borrow distractors from the full library
    const all = CD_DECKS[CD_DECKS.length - 1].chords;
    const borrowed = cbShuffle(all.filter(n => n !== correct && opts.indexOf(n) < 0));
    opts = opts.concat(borrowed).slice(0, 3);
  } else {
    opts = cbShuffle(opts).slice(0, 3);
  }
  opts.push(correct);
  return cbShuffle(opts);
}

/* 10 a card at level 1, rising 5 a level, times the streak multiplier. */
function cdCardPoints(s){
  return (10 + 5 * (s.level - 1)) * Math.min(4, 1 + Math.floor(s.streak / 5));
}

function cdNext(){
  if (!cd || cd.phase !== 'play') return;
  const body = cdBody();
  if (!body){ cdStop(); return; }
  const s = cd;
  if (s.answered >= CD_CARDS){ cdFinish(); return; }
  const was = s.level;
  s.level = Math.min(s.levels.length, 1 + Math.floor(s.correct / CD_PROMOTE_EVERY));
  s.promoted = s.level > was;
  if (s.level > s.topLevel) s.topLevel = s.level;
  s.cur = cdPickCard();
  s.prev = s.cur;
  s.opts = cdOptions(s.cur);
  s.locked = false;
  const answers = s.opts.map((n, i) =>
    `<button type="button" class="cb-answer" id="cd-opt-${i}" onclick="cdAnswer(${i})"><span class="cb-key">${i + 1}</span>${escHtml(n)}</button>`
  ).join('');
  const mult = Math.min(4, 1 + Math.floor(s.streak / 5));
  /* A one-level deck has nothing to climb, so it shows no level chip. */
  const levelChip = s.levels.length > 1
    ? `<span class="cb-level${s.promoted ? ' up' : ''}">${t('games.common.level', { n: s.level })}${s.promoted ? ' &#x2191;' : ''}</span>`
    : '';
  body.innerHTML =
    `<div class="cb-hud">
       <span class="cb-timer" id="cd-timer">${Math.ceil(CD_CARD_MS / 1000)}</span>
       <span class="cb-score" id="cd-score">${t('games.common.score', { n: s.score })}</span>
       <span class="cb-streak" id="cd-streak">${s.streak >= 2 ? '&#x1F525; ' + t('games.common.inARow', { n: s.streak }) + (mult > 1 ? ' &mdash; &times;' + mult : '') : '&nbsp;'}</span>
     </div>
     <div class="cb-meta">
       <span class="cb-count">${t('games.common.cardOf', { n: s.answered + 1, total: CD_CARDS })}</span>
       ${levelChip}
     </div>
     <div class="cb-fuse"><div class="cb-fuse-fill" id="cd-fuse-fill"></div></div>
     <div class="cb-prompt"><button type="button" class="cd-play-btn" onclick="cdPlay()">&#x25B6; ${t('games.cd.playButton')}</button></div>
     <div class="cb-answers">${answers}</div>`;
  cdPlay();   // sets holdUntil / cardEndAt for this card
}

/* Wrong, or out of time: show the right button for a beat (inputs locked)
   and requeue the card. Pass the tapped index to flag it, or null when the
   clock ran out and nothing was tapped. */
function cdRevealThenNext(wrongIdx){
  const s = cd;
  s.locked = true;
  if (wrongIdx !== null){
    const hit = document.getElementById('cd-opt-' + wrongIdx);
    if (hit) hit.classList.add('wrong');
  }
  const right = document.getElementById('cd-opt-' + s.opts.indexOf(s.cur));
  if (right) right.classList.add('reveal');
  const fill = document.getElementById('cd-fuse-fill');
  if (fill){ fill.style.width = '0%'; fill.classList.remove('listening'); }
  const scoreEl = document.getElementById('cd-score');
  if (scoreEl) scoreEl.textContent = t('games.common.score', { n: s.score });
  const streakEl = document.getElementById('cd-streak');
  if (streakEl) streakEl.innerHTML = '&nbsp;';
  s.timeouts.push(setTimeout(() => {
    if (cd !== s || s.phase !== 'play') return;
    cdNext();
  }, 800));
}

function cdAnswer(i){
  if (!cd || cd.phase !== 'play' || cd.locked) return;
  const s = cd;
  const pick = s.opts[i];
  if (!pick) return;
  s.answered++;
  if (pick === s.cur){
    s.correct++;
    s.streak++;
    s.score += cdCardPoints(s);
    cdNext();
    return;
  }
  s.score = Math.max(0, s.score - 5);
  s.streak = 0;
  s.requeue.push({ name: s.cur, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  cdRevealThenNext(i);
}

/* Out of time — five seconds of quiet after the chord stopped sounding.
   Costs the card and the streak, but no points: nothing was guessed wrong. */
function cdTimeUp(){
  if (!cd || cd.phase !== 'play' || cd.locked) return;
  const s = cd;
  s.answered++;
  s.streak = 0;
  s.requeue.push({ name: s.cur, due: s.answered + 2 + Math.floor(Math.random() * 3) });
  cdRevealThenNext(null);
}

function cdFinish(){
  if (!cd || cd.phase !== 'play') return;
  if (cdTick){ clearInterval(cdTick); cdTick = null; }
  cd.timeouts.forEach(clearTimeout);
  cd.timeouts = [];
  cd.phase = 'done';
  cd.prevBest = 0;
  try {
    const k = cdBestKey(cd.deck);
    cd.prevBest = parseInt(sessionStorage.getItem(k), 10) || 0;
    if (cd.score > cd.prevBest) sessionStorage.setItem(k, String(cd.score));
  } catch(e){}
  /* Cross-session best → the student's progress doc. Skipped in dev bypass
     (Firestore rejects that uid; the session best above still counts).
     v:2 marks a score from the 10-card round — a v:1 record is from the old
     60-second block and is read as no best at all rather than as a wall. */
  if (typeof saveGames === 'function' && currentUser && !isDevBypassUser()){
    const old = cdSavedBest(games);
    const isNewBest = cd.score > old;
    if (isNewBest) games.cd = { v: 2, best: cd.score, deck: cd.deck, level: cd.topLevel, at: new Date().toISOString().slice(0, 10) };
    // XP only for a round with at least one right answer — letting the
    // timer run out on an untouched round is not a round played.
    if (cd.correct > 0) awardArcadeXp(isNewBest);
  }
  cdRenderDone();
}

/* The saved cross-session best, or 0 if the only record is a pre-10-card one. */
function cdSavedBest(saved){
  const rec = saved && saved.cd;
  return (rec && rec.v === 2 && rec.best) || 0;
}

function cdRenderDone(){
  const body = cdBody();
  if (!body || !cd) return;
  const acc = cd.answered ? Math.round(100 * cd.correct / cd.answered) : 0;
  const bestLine = cardBestLine(cd.prevBest, cd.score);
  const levelLine = cd.levels.length > 1
    ? `<div class="coach-overall">${t('games.common.reachedLevel', { n: cd.topLevel, total: cd.levels.length })}</div>`
    : '';
  body.innerHTML =
    `<div class="coach-report">
       <div class="cb-done-score">${cd.score}</div>
       <div class="coach-overall">${GAME_ICO.detective} ${t(cd.answered === 1 ? 'games.common.cardsAnsweredOne' : 'games.common.cardsAnsweredMany', { answered: cd.answered, correct: cd.correct, acc })}</div>
       ${levelLine}
       ${bestLine}
       <div class="coach-actions">
         <button type="button" class="coach-start" onclick="cdStart()">&#x21BB; ${t('games.common.playAgain')}</button>
         <button type="button" class="tp-btn" onclick="cdSetup()">${t('games.cd.changeDeck')}</button>
       </div>
     </div>`;
}

