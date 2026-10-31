/* ══════════════════════════════════════════════════════════════════════
   trainer-ui.js — "Hear It First": the screens, the English text and the
   controller that runs a session.

   English only (work order decision 6): the text below is this file's own
   table, not i18n.js, so the site's parity checks do not apply. It touches no
   site global — everything arrives through createTrainer's deps:

     createTrainer({
       root,           the element to draw into
       core,           HIF_CORE (the engine)         audio,   createAudio(...)
       pitch,          the microphone interface (below)
       store,          { load() -> profile|null, save(profile) }
       fretboardSvg,   trainerFretboardSvg from guitar-diagrams.js
       rng, now,       injectable
       onExit(), onOpenTuner(), debug
     }) -> { start, destroy, resumeInput }

   pitch interface (the adapter builds it from coach.js; nothing here knows):
     devices() -> Promise<[{ id, label }]>        open({ deviceId }) -> Promise<{ ok, reason? }>
     close()      cancel()
     onLevel(cb) -> off       cb(rms, live) live = { midi (fractional), rms } | null
     listenForPitch({ timeoutMs, deafMs }) -> Promise<{ midi, cents } | { unclear } | { timeout }>
     listenStream(onNote, { deafMs }) -> stop()   onNote({ midi, cents } | { unclear })
     deaf(ms)                 ignore the microphone for ms (the trainer is playing)
     onLost(cb) -> off        the input stopped under us (tab hidden, tuner opened)
   ══════════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HIF_UI = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /* ── The text (section 4.10: direction + distance + interval, no praise) ── */
  var STR = {
    title: 'Hear It First',
    task: { match: 'Match it', call: 'Call it', hear: 'Hear the interval', play: 'Play the interval', phrase: 'Phrase', note: 'Find the note' },
    strings: ['low E', 'A', 'D', 'G', 'B', 'high e'],
    move: {
      'same-s': 'same string, 1–2 frets', 'same-m': 'same string, 3–5 frets', 'same-l': 'same string, 6–12 frets',
      'cross-adj': 'next string over', 'cross-B': 'G–B crossing', skip: 'skipping a string', unison: 'same note, other string',
      octave: 'octaves', shift: 'jumps across the neck', free: 'finding a tone cold'
    },
    zone: { Z1: 'low E and A · frets 0–12', Z2: 'low E to G · frets 0–12', Z3: 'all strings · frets 0–12', Z4: 'all strings · frets 12–20', Z5: 'whole neck · frets 0–20' },
    tier: { T1: 'M2 m3 M3 P4 P5 P8, going up', T2: 'adds m2 M6 m7; T1 going down', T3: 'all 12, both ways', T4: 'adds both notes together and 8ves+' },
    btn: { anchor: 'Song anchor', start: 'Start', practice: 'Practice one task', map: 'Skill map', retake: 'Retake placement', input: 'Input settings', exit: 'Exit',
           stop: 'Stop', next: 'Next', skip: 'Skip', giveUp: 'Give up', lock: 'Lock it in', replay: 'Replay', hear: 'Hear it', go: 'Continue',
           use: 'Use this input', begin: 'Begin', home: 'Home', again: 'Again', done: 'Done', tuner: 'Open the tuner', resume: 'Resume', check: 'Check tuning' },
    home: { session: '25 items or 8 minutes. Stop any time; progress saves.', zone: 'Zone', tier: 'Tier', sessions: 'Sessions', last: 'Last session', never: 'none yet', noInput: 'No input yet' },
    setup: { title: 'Input', line: 'Clean tone, neck pickup, no effects.', pluck: 'Pluck your open low E.', device: 'Audio input', defaultDev: 'Default input',
             opening: 'Opening the input…', open: 'Input is on.', denied: 'The browser blocked the input. Allow it in the address bar, then try again.',
             unavailable: 'No input found, or another app is using it.', failed: 'The input would not start.', tuningTitle: 'Tuning check',
             tuningLine: 'Play each open string once, low E first.', playOpen: function (s) { return 'Play your open ' + s + '.'; },
             tuneOk: 'In tune.', allOk: 'All six strings are within 20 cents.',
             off: function (s, c) { return s + ' is ' + Math.abs(Math.round(c)) + ' cents ' + (c > 0 ? 'sharp' : 'flat') + '.'; },
             heard: function (h, w) { return 'Heard ' + h + ', expected ' + w + '.'; }, needTuner: 'Tune that string with the site tuner, then come back.' },
    drill: { listening: 'Listening…', nothing: '—', unclear: 'Didn’t catch that — pluck once, let it ring.', inputLost: 'The input stopped.', count: function (n, m) { return n + '/' + m; },
             placementCount: function (n) { return 'Placement ' + n; } },
    prompt: {
      match: 'Match the tone you hear', call: 'Which sound is the ringed fret?', hear: 'Name the interval', phrase: 'Play the phrase back',
      play: function (name, dir) { return 'Play a ' + name + ' ' + dir + ' from the shown note'; }, note: function (n) { return 'Play ' + n; },
      onString: function (s) { return 'on the ' + s + ' string'; }, inRegion: function (r) { return r === 'up' ? 'in frets 12–20' : 'in frets 0–12'; },
      nowPlay: 'Now play it', pick: 'Pick a sound, then lock it in.'
    },
    fb: {
      right: function (n, extra) { return '✓ ' + n + (extra ? ' — ' + extra : ''); },
      found: function (n, tries) { return '✓ Found it — ' + tries + (tries === 1 ? ' try' : ' tries') + '. ' + n; },
      tryMiss: function (line) { return line; },
      noMatch: function (n, where) { return 'No match. It was ' + n + ' (' + where + ').'; },
      octave: function (low) { return 'Right note, one octave ' + (low ? 'low' : 'high') + '.'; },
      wrongWay: function (dir) { return 'Wrong way — it goes ' + dir + '.'; },
      off: function (d, high, a, b) { return d + (d === 1 ? ' fret' : ' frets') + ' too ' + (high ? 'high' : 'low') + (a ? ' — you played a ' + a + ', target was ' + b + '.' : '.'); },
      picked: function (p, t) { return 'You picked ' + p + '. It is ' + t + '.'; },
      posError: 'Right sound, wrong fret.',
      hearRight: function (n) { return '✓ ' + n; }, hearWrong: function (a, p) { return 'It was ' + a + ', not ' + p + '.'; },
      phrase: function (r, n, names) { return r + ' of ' + n + ' — ' + names; },
      unlocked: function (what) { return 'Unlocked: ' + what; },
      anchor: function (song, i, name, dir) { return song + ': notes ' + i + ' and ' + (i + 1) + ' are a ' + name + ' ' + dir + '.'; }
    },
    lessonTitle: 'Lesson',
    contrast: { title: function (a, b) { return a + ' vs ' + b; }, line: 'Same root, back to back. Listen for the gap.', hear: 'Hear them' },
    sum: { title: 'Session', nailed: 'Nailed', next: 'Next', none: '—', items: function (n) { return n + ' items'; } },
    place: { title: 'Placement', intro: 'About 20 items, about 5 minutes. Play on the neck pickup, clean tone.', result: 'Placed', strong: 'Strong', work: 'Work on next',
             zone: 'Zone', tier: 'Tier', phrase: 'Phrases' },
    practice: { title: 'Practice one task', line: 'Pick a task. It still adapts inside the task.' },
    map: { title: 'Skill map', moves: 'Moves', ivls: 'Intervals', notes: 'Note locations', zoneBar: 'Neck reached', low: 'low', mid: 'mid', high: 'high', lo: 'frets 0–12', up: 'frets 12–20',
           up_: 'up', down: 'down', harm: 'together', status: { none: 'not seen', 'new': 'new', learning: 'learning', solid: 'solid', mastered: 'mastered' }, locked: 'locked' },
    lessons: {
      sameString: 'Each fret = one half step.',
      crossAdj: 'Next thinner string = 5 frets back. Fret 5 = the next string open.',
      crossB: 'G to B is the odd one: 4 frets, not 5. Every shape crossing it shifts up 1 fret.',
      m3M3: 'm3 = 3 frets. M3 = 4. Next string: m3 is 2 frets back, M3 is 1 back.',
      p4p5: 'P4 = next string, same fret. P5 = next string, 2 frets up. (Across G–B: add 1.)',
      octave: '2 strings thinner, 2 frets up. Landing on or crossing B: 3 up.',
      octaveErr: 'Right letter, wrong octave. Check which string you’re on.',
      wrongDir: 'Higher fret or thinner string = higher sound.',
      posError: 'Right sound, wrong fret.',
      z4: 'Fret 12 = open string, an octave up. Frets 12–20 repeat 0–8.'
    }
  };

  /* One small figure and one sound per lesson card. s = string index, 0 = low E. */
  var LESSON_FIG = {
    sameString: { dots: [{ s: 0, f: 5, label: 'A', style: 'ref' }, { s: 0, f: 6, label: 'A#', style: 'target' }, { s: 0, f: 7, label: 'B', style: 'plain' }], link: { from: { s: 0, f: 5 }, to: { s: 0, f: 6 }, text: '1 fret = m2' }, play: [45, 46, 47], hl: 0 },
    crossAdj: { dots: [{ s: 0, f: 5, label: 'A', style: 'ref' }, { s: 1, f: 0, label: 'A', style: 'target' }], link: { from: { s: 0, f: 5 }, to: { s: 1, f: 0 }, text: 'same note' }, play: [45, 45], hl: null },
    crossB: { dots: [{ s: 3, f: 5, label: 'C', style: 'ref' }, { s: 4, f: 1, label: 'C', style: 'target' }], link: { from: { s: 3, f: 5 }, to: { s: 4, f: 1 }, text: '4 frets' }, play: [60, 60], hl: null },
    m3M3: { dots: [{ s: 1, f: 5, label: 'D', style: 'ref' }, { s: 2, f: 3, label: 'F', style: 'target' }, { s: 2, f: 4, label: 'F#', style: 'plain' }], link: { from: { s: 1, f: 5 }, to: { s: 2, f: 3 }, text: 'm3' }, play: [50, 53, 50, 54], hl: null },
    p4p5: { dots: [{ s: 1, f: 5, label: 'D', style: 'ref' }, { s: 2, f: 5, label: 'G', style: 'target' }, { s: 2, f: 7, label: 'A', style: 'plain' }], link: { from: { s: 1, f: 5 }, to: { s: 2, f: 5 }, text: 'P4' }, play: [50, 55, 50, 57], hl: null },
    octave: { dots: [{ s: 0, f: 3, label: 'G', style: 'ref' }, { s: 2, f: 5, label: 'G', style: 'target' }], link: { from: { s: 0, f: 3 }, to: { s: 2, f: 5 }, text: 'octave' }, play: [43, 55], hl: null },
    octaveErr: { dots: [{ s: 1, f: 0, label: 'A', style: 'ref' }, { s: 2, f: 7, label: 'A', style: 'target' }], link: { from: { s: 1, f: 0 }, to: { s: 2, f: 7 }, text: 'octave' }, play: [45, 57], hl: null },
    wrongDir: { dots: [{ s: 1, f: 2, label: 'B', style: 'ref' }, { s: 1, f: 7, label: 'E', style: 'target' }], link: { from: { s: 1, f: 2 }, to: { s: 1, f: 7 }, text: 'higher' }, play: [47, 52], hl: 1 },
    posError: { dots: [{ s: 2, f: 5, label: 'G', style: 'plain' }, { s: 3, f: 0, label: 'G', style: 'plain' }], link: { from: { s: 2, f: 5 }, to: { s: 3, f: 0 }, text: 'same sound' }, play: [55, 55], hl: null },
    z4: { dots: [{ s: 0, f: 0, label: 'E', style: 'ref' }, { s: 0, f: 12, label: 'E', style: 'target' }], link: { from: { s: 0, f: 0 }, to: { s: 0, f: 12 }, text: 'octave' }, play: [40, 52], hl: 0 }
  };

  /* Song anchors: a riff the learner already knows, to hang an interval on. Only
     riffs already on the site (Module 2 Set 1); these MIDI lists are copied from
     module-2.js and tools/trainer-sim.mjs (U18) fails if they stop matching it.
       sna   the Seven Nation Army riff, A string, frets 7 7 10 7 5 3 2
       sotw  the Smoke on the Water head ("Hear the riff"), low E */
  var ANCHORS = {
    sna: { name: 'Seven Nation Army', midis: [52, 52, 55, 52, 50, 48, 47] },
    sotw: { name: 'Smoke on the Water', midis: [40, 43, 45, 40, 43, 46, 45, 40, 43, 45, 43, 40] }
  };
  function anchorFor(core, name, dir) {
    var semis = core.semisOfName(name);
    if (!(semis > 0) || semis > 12) return null;
    var keys = Object.keys(ANCHORS), k, i;
    for (k = 0; k < keys.length; k++) {
      var m = ANCHORS[keys[k]].midis;
      for (i = 1; i < m.length; i++) {
        var d = m[i] - m[i - 1];
        if (Math.abs(d) === semis && (dir === 'down' ? d < 0 : d > 0)) return { song: ANCHORS[keys[k]].name, midis: m, i: i };
      }
    }
    return null;
  }

  var CSS = '' +
    '.hif-root{position:fixed;inset:0;z-index:130;overflow:auto;background:var(--bg);color:var(--text);font:16px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
    '.hif-root *{box-sizing:border-box}' +
    '.hif-wrap{max-width:1100px;margin:0 auto;padding:18px 24px 40px}' +
    '.hif-head,.hif-top{display:flex;align-items:center;gap:14px;justify-content:space-between;margin-bottom:12px}' +
    '.hif-head h1{font:600 1.6rem var(--font-display,Georgia,serif);margin:0}' +
    '.hif-top .hif-task{font-weight:600}.hif-top .hif-count{color:var(--text2);margin-right:auto;margin-left:8px;font-variant-numeric:tabular-nums}' +
    '.hif-status{color:var(--text2);margin:2px 0 18px}' +
    '.hif-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:12px;margin:14px 0}' +
    '.hif-btn{font:inherit;font-weight:600;border:1px solid var(--border2);background:var(--bg2);color:var(--text);border-radius:var(--radius,10px);padding:11px 18px;cursor:pointer}' +
    '.hif-btn:hover{background:var(--bg3)}.hif-btn:disabled{opacity:.45;cursor:default}' +
    '.hif-btn.primary{background:var(--brand,#514a7d);color:var(--brand-text,#fff);border-color:var(--brand,#514a7d)}' +
    '.hif-btn.ghost{background:transparent}.hif-btn.big{padding:16px 20px;font-size:1.05rem}' +
    '.hif-prompt{font-size:1.45rem;font-weight:600;margin:6px 0 2px}.hif-sub{color:var(--text2);min-height:1.4em;margin-bottom:8px}' +
    '.hif-board{margin:6px 0 14px;border:1px solid var(--border);border-radius:var(--radius,10px);background:var(--bg);padding:6px 6px 2px}' +
    '.hif-board svg{width:100%;height:auto;display:block}' +
    '.hif-answer{min-height:96px;margin:6px 0}' +
    '.hif-choices{display:flex;flex-wrap:wrap;gap:10px}.hif-choice{min-width:96px;font-size:1.1rem}' +
    '.hif-choice.sel{background:var(--brand,#514a7d);color:var(--brand-text,#fff);border-color:var(--brand,#514a7d)}' +
    '.hif-choice.okc{background:var(--green-bg);color:var(--green-text);border-color:var(--green-text)}' +
    '.hif-choice.badc{background:var(--red-bg);color:var(--red-text);border-color:var(--red-text)}' +
    '.hif-listen{display:flex;align-items:center;gap:16px;flex-wrap:wrap}.hif-live{font:600 1.7rem ui-monospace,Menlo,Consolas,monospace;min-width:6.5ch}' +
    '.hif-meter{width:260px;height:12px;border-radius:6px;background:var(--bg3);border:1px solid var(--border);overflow:hidden}' +
    '.hif-meter i{display:block;height:100%;width:0;background:var(--green-text);transition:width .06s linear}' +
    '.hif-fb{min-height:2.6em;font-size:1.15rem;font-weight:500;margin:8px 0}.hif-fb.ok{color:var(--green-text)}.hif-fb.bad{color:var(--red-text)}.hif-fb.warn{color:var(--amber-text)}' +
    '.hif-tries{color:var(--text2);margin:4px 0}.hif-tries div{margin:2px 0}' +
    '.hif-card{border:1px solid var(--border);background:var(--bg2);border-radius:var(--radius,10px);padding:18px 22px;max-width:760px}' +
    '.hif-line{font-size:1.4rem;font-weight:600;margin:0 0 14px}' +
    '.hif-row{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:10px 0}.hif-small{color:var(--text2);font-size:.92rem}' +
    '.hif-sel{font:inherit;padding:9px 10px;border:1px solid var(--border2);border-radius:var(--radius-sm,6px);background:var(--bg);color:var(--text);min-width:260px;max-width:100%}' +
    '.hif-tune{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:8px;margin:10px 0}' +
    '.hif-tune div{border:1px solid var(--border);border-radius:var(--radius-sm,6px);padding:8px 6px;text-align:center;background:var(--bg)}' +
    '.hif-tune .cur{border-color:var(--brand,#514a7d);box-shadow:0 0 0 2px var(--brand,#514a7d) inset}.hif-tune .good{background:var(--green-bg);color:var(--green-text)}.hif-tune .offc{background:var(--red-bg);color:var(--red-text)}' +
    '.hif-dots{display:flex;gap:6px;margin:8px 0}.hif-dots i{width:16px;height:16px;border-radius:50%;border:2px solid var(--border2);background:var(--bg)}' +
    '.hif-dots i.ok{background:var(--green-text);border-color:var(--green-text)}.hif-dots i.bad{background:var(--red-text);border-color:var(--red-text)}.hif-dots i.cur{border-color:var(--brand,#514a7d)}' +
    '.hif-map{display:grid;gap:18px;grid-template-columns:repeat(auto-fit,minmax(320px,1fr))}.hif-panel{border:1px solid var(--border);border-radius:var(--radius,10px);padding:12px 14px;background:var(--bg)}' +
    '.hif-panel h3{margin:0 0 8px;font-size:1rem}.hif-grid2{display:grid;gap:4px;align-items:center;font-size:.86rem}' +
    '.hif-grid2 b{font-weight:600;color:var(--text2)}.hif-cell{height:22px;border-radius:4px;border:1px solid var(--border);background:var(--bg3)}' +
    '.st-new{background:var(--blue-bg);border-color:var(--blue-text)}.st-learning{background:var(--red-bg);border-color:var(--red-text)}.st-solid{background:var(--amber-bg);border-color:var(--amber-text)}' +
    '.st-mastered{background:var(--green-bg);border-color:var(--green-text);box-shadow:0 0 0 1px var(--green-text) inset}.st-locked{opacity:.4;background:repeating-linear-gradient(135deg,var(--bg3),var(--bg3) 4px,var(--bg) 4px,var(--bg) 8px)}' +
    '.hif-legend{display:flex;gap:12px;flex-wrap:wrap;font-size:.85rem;color:var(--text2);margin:8px 0}.hif-legend span{display:inline-flex;align-items:center;gap:5px}.hif-legend i{width:14px;height:14px;border-radius:3px;border:1px solid var(--border)}' +
    '.hif-bar{height:14px;border-radius:7px;background:var(--bg3);border:1px solid var(--border);overflow:hidden;margin:6px 0}.hif-bar i{display:block;height:100%;background:var(--brand,#514a7d)}' +
    '.hif-lost{border:1px solid var(--amber-text);background:var(--amber-bg);color:var(--amber-text);border-radius:var(--radius-sm,6px);padding:10px 14px;margin:8px 0}' +
    '.hif-toast{color:var(--brand,#514a7d);font-weight:600;margin:6px 0}';

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  function createTrainer(deps) {
    var core = deps.core || root.HIF_CORE, S = STR;
    var rng = deps.rng || Math.random, nowFn = deps.now || Date.now;
    var el = deps.root, pitch = deps.pitch, audio = deps.audio, store = deps.store, fboard = deps.fretboardSvg;
    var eng = null, tok = 0, destroyed = false, timers = [], offs = [];
    var st = { inputOk: false, deviceId: '', cur: null, sess: null, pending: null, mapMode: null, tune: null, lost: false, taskOnly: null };

    /* ── small helpers ── */
    function alive(t) { return !destroyed && t === tok; }
    function later(fn, ms) { var id = setTimeout(fn, ms); timers.push(id); return id; }
    function clearTimers() { timers.forEach(clearTimeout); timers = []; }
    function $(id) { return el.querySelector('#' + id); }
    function setHtml(id, h) { var n = $(id); if (n) n.innerHTML = h; }
    function setText(id, t) { var n = $(id); if (n) n.textContent = t; }
    function nowMs() { return typeof performance !== 'undefined' ? performance.now() : nowFn(); }
    function nm(midi) { return core.noteLabel(midi); }
    function sname(si) { return S.strings[si]; }
    function posText(p) { return p.f === 0 ? 'open ' + sname(p.s) : sname(p.s) + ' string, fret ' + p.f; }
    function dirWord(semis) { return semis >= 0 ? 'up' : 'down'; }
    function persist() {
      if (!eng) return Promise.resolve();
      try { return Promise.resolve(store.save(eng.snapshot())).catch(function () {}); } catch (e) { return Promise.resolve(); }
    }
    function subLevel(cb) { unsubLevel(); st.lvlOff = pitch.onLevel(cb); }
    function unsubLevel() { if (st.lvlOff) { try { st.lvlOff(); } catch (e) { /* gone */ } st.lvlOff = null; } }
    function render(html) { clearTimers(); unsubLevel(); el.innerHTML = html; el.scrollTop = 0; }
    function injectCss() {
      if (el.ownerDocument.getElementById('hif-css')) return;
      var s = el.ownerDocument.createElement('style'); s.id = 'hif-css'; s.textContent = CSS; el.ownerDocument.head.appendChild(s);
    }
    function board(spec) { return fboard ? fboard(Object.assign({ stringLabels: S.strings }, spec)) : ''; }
    function cancelAsk() { if (st.pending) { var p = st.pending; st.pending = null; p('stop'); } try { pitch.cancel(); } catch (e) { /* closed */ } }

    /* ══════════ Screens ══════════ */
    function showHome() {
      tok++; cancelAsk(); audio.stop();
      var p = eng.getProfile(), zone = p.zone, tier = p.tier;
      render('<div class="hif-wrap">' +
        '<div class="hif-head"><h1>' + S.title + '</h1><button class="hif-btn ghost" data-act="exit">' + S.btn.exit + '</button></div>' +
        '<p class="hif-status">' + S.home.zone + ' ' + zone + ' — ' + S.zone[zone] + ' &nbsp;·&nbsp; ' + S.home.tier + ' ' + tier + ' — ' + S.tier[tier] + '</p>' +
        '<div class="hif-grid">' +
        '<button class="hif-btn primary big" data-act="start">' + S.btn.start + '<br><small>' + S.home.session + '</small></button>' +
        '<button class="hif-btn big" data-act="practice">' + S.btn.practice + '</button>' +
        '<button class="hif-btn big" data-act="map">' + S.btn.map + '</button>' +
        '<button class="hif-btn big" data-act="retake">' + S.btn.retake + '</button>' +
        '<button class="hif-btn big" data-act="input">' + S.btn.input + '</button></div>' +
        '<p class="hif-small">' + S.home.sessions + ': ' + p.sessions + ' &nbsp;·&nbsp; ' + S.home.last + ': ' + esc(p.lastSession || S.home.never) +
        ' &nbsp;·&nbsp; ' + esc(p.inputDeviceLabel || S.home.noInput) + '</p></div>');
    }

    /* ── Setup: input picker, level meter, tuning check (4.6) ── */
    function showSetup(after) {
      tok++; cancelAsk(); st.tune = null; st.afterSetup = after || 'home';
      render('<div class="hif-wrap"><div class="hif-head"><h1>' + S.setup.title + '</h1><button class="hif-btn ghost" data-act="home">' + S.btn.home + '</button></div>' +
        '<div class="hif-card"><p class="hif-line">' + S.setup.line + '</p>' +
        '<div class="hif-row"><label>' + S.setup.device + ' <select id="hif-dev" class="hif-sel"><option value="">' + S.setup.defaultDev + '</option></select></label>' +
        '<button class="hif-btn primary" data-act="setup-use">' + S.btn.use + '</button></div>' +
        '<p id="hif-msg" class="hif-small"></p>' +
        '<div class="hif-listen"><div class="hif-meter"><i id="hif-lvl"></i></div><div class="hif-live" id="hif-live">' + S.drill.nothing + '</div><span class="hif-small">' + S.setup.pluck + '</span></div></div>' +
        '<div class="hif-card" style="margin-top:14px"><h3 style="margin:0 0 6px">' + S.setup.tuningTitle + '</h3><p class="hif-small" style="margin:0 0 8px">' + S.setup.tuningLine + '</p>' +
        '<div class="hif-tune" id="hif-tune">' + S.strings.map(function (n, i) { return '<div id="hif-t' + i + '">' + esc(n) + '<br><span class="hif-small">—</span></div>'; }).join('') + '</div>' +
        '<p id="hif-tmsg" class="hif-fb"></p>' +
        '<div class="hif-row"><button class="hif-btn" data-act="tune-start" id="hif-tbtn" disabled>' + S.btn.check + '</button>' +
        '<button class="hif-btn" data-act="open-tuner" id="hif-tuner" hidden>' + S.btn.tuner + '</button>' +
        '<button class="hif-btn primary" data-act="setup-done" id="hif-sdone" disabled>' + S.btn.done + '</button></div></div></div>');
      Promise.resolve(pitch.devices()).then(function (list) { fillDevices(list); });
      if (st.inputOk) { watchLevel(); enableTune(); }
    }
    function fillDevices(list) {
      var sel = $('hif-dev'); if (!sel) return;
      var cur = st.deviceId;
      sel.innerHTML = '<option value="">' + S.setup.defaultDev + '</option>' + (list || []).map(function (d) {
        return '<option value="' + esc(d.id) + '"' + (d.id === cur ? ' selected' : '') + '>' + esc(d.label || S.setup.defaultDev) + '</option>';
      }).join('');
    }
    function enableTune() { var b = $('hif-tbtn'); if (b) b.disabled = false; var d = $('hif-sdone'); if (d) d.disabled = false; }
    function watchLevel() {
      subLevel(function (rms, live) {
        var lvl = $('hif-lvl'); if (lvl) lvl.style.width = Math.min(100, Math.round(Math.sqrt(rms) * 220)) + '%';
        var lv = $('hif-live'); if (!lv) return;
        if (live && live.midi != null) { var rp = core.readPitch(live.midi); lv.textContent = rp.midi != null ? nm(rp.midi) + ' ' + (rp.cents > 0 ? '+' : '') + Math.round(rp.cents) : S.drill.nothing; }
        else lv.textContent = S.drill.nothing;
      });
    }
    function setupUse() {
      var sel = $('hif-dev'), id = sel ? sel.value : '';
      setText('hif-msg', S.setup.opening);
      Promise.resolve(pitch.open({ deviceId: id })).then(function (r) {
        if (!$('hif-msg')) return;
        if (!r || !r.ok) {
          setText('hif-msg', r && r.reason === 'denied' ? S.setup.denied : r && r.reason === 'unavailable' ? S.setup.unavailable : S.setup.failed);
          return;
        }
        st.inputOk = true; st.deviceId = id; setText('hif-msg', S.setup.open);
        var p = eng.getProfile(); p.inputDeviceLabel = (sel && sel.selectedOptions[0] ? sel.selectedOptions[0].textContent : '') || r.label || S.setup.defaultDev;
        Promise.resolve(pitch.devices()).then(fillDevices); watchLevel(); enableTune(); persist();
      });
    }
    /* The tuning check: six open strings, one reading each. */
    async function tuneStart() {
      var t = ++tok, open = core.OPEN, bad = [];
      $('hif-tbtn').disabled = true; setText('hif-tmsg', ''); $('hif-tuner').hidden = true;
      for (var i = 0; i < 6; i++) {
        if (!alive(t)) return;
        var cell = $('hif-t' + i); if (cell) cell.classList.add('cur');
        setText('hif-tmsg', S.setup.playOpen(S.strings[i]));
        var r = await listenOnce(t, 0, 40000);
        if (!alive(t) || r === 'stop') return;
        if (cell) cell.classList.remove('cur');
        if (r.timeout || r.unclear) { setCell(i, 'offc', 'skipped'); bad.push(S.strings[i] + ': skipped'); continue; }
        if (r.midi !== open[i]) { setCell(i, 'offc', nm(r.midi)); bad.push(S.setup.heard(nm(r.midi), nm(open[i]))); continue; }
        if (Math.abs(r.cents) > 20) { setCell(i, 'offc', (r.cents > 0 ? '+' : '') + Math.round(r.cents)); bad.push(S.setup.off(S.strings[i], r.cents)); }
        else setCell(i, 'good', (r.cents > 0 ? '+' : '') + Math.round(r.cents));
      }
      var m = $('hif-tmsg'); if (!m) return;
      m.className = 'hif-fb ' + (bad.length ? 'bad' : 'ok');
      m.innerHTML = bad.length ? bad.map(esc).join('<br>') + '<br>' + S.setup.needTuner : S.setup.allOk;
      $('hif-tbtn').disabled = false; $('hif-tuner').hidden = !bad.length;
    }
    function setCell(i, cls, txt) { var c = $('hif-t' + i); if (c) { c.classList.add(cls); c.innerHTML = esc(S.strings[i]) + '<br><span class="hif-small">' + esc(txt) + '</span>'; } }

    /* ── Listening helpers: one reading at a time, or "stopped" ── */
    function askWait() { return new Promise(function (res) { st.pending = res; }); }
    function listenOnce(t, deafMs, timeoutMs) {
      return new Promise(function (resolve) {
        var done = false;
        function fin(v) { if (done) return; done = true; if (st.pending === fin) st.pending = null; resolve(v); }
        st.pending = function (v) { try { pitch.cancel(); } catch (e) { /* closed */ } fin(v === 'stop' ? 'stop' : v); };
        Promise.resolve(pitch.listenForPitch({ deafMs: deafMs || 0, timeoutMs: timeoutMs || 25000 })).then(function (r) { if (alive(t)) fin(r || { unclear: true }); else fin('stop'); });
      });
    }
    function setListening(on) {
      var n = $('hif-ls'); if (n) n.style.visibility = on ? 'visible' : 'hidden';
    }
    function liveAnswerHtml(extra) {
      return '<div class="hif-listen" id="hif-ls"><div class="hif-meter"><i id="hif-lvl"></i></div><div class="hif-live" id="hif-live">' + S.drill.nothing + '</div>' +
        '<span class="hif-small">' + S.drill.listening + '</span>' + (extra || '') + '</div>';
    }

    /* ── The drill frame ── */
    function countText() {
      if (st.sess && st.sess.placement) return S.drill.placementCount(st.sess.n + 1);
      return st.sess ? S.drill.count(st.sess.n + 1, st.sess.max) : '';
    }
    function promptFor(item) {
      var main = '', sub = '';
      if (item.task === 'match') { main = S.prompt.match; if (item.showString) sub = S.prompt.onString(sname(item.target.s)); }
      else if (item.task === 'call') main = S.prompt.call;
      else if (item.task === 'hear') main = S.prompt.hear;
      else if (item.task === 'play') { main = S.prompt.play(item.interval.name, item.dir); if (item.showString) sub = S.prompt.onString(sname(item.target.s)); }
      else if (item.task === 'note') { main = S.prompt.note(item.name); sub = item.showString ? S.prompt.onString(sname(item.s)) : item.region ? S.prompt.inRegion(item.region) : ''; }
      else main = S.prompt.phrase;
      return { main: main, sub: sub };
    }
    function boardFor(item, reveal) {
      var dots = [], spec = { dots: dots, highlight: null };
      if (item.task === 'match') {
        if (item.showRef && item.ref) dots.push({ s: item.ref.s, f: item.ref.f, label: core.noteName(item.ref.midi), style: 'ref' });
        if (item.showString) spec.highlight = item.target.s;
        if (reveal) dots.push({ s: item.target.s, f: item.target.f, label: core.noteName(item.target.midi), style: 'ok' });
      } else if (item.task === 'call') {
        dots.push({ s: item.ref.s, f: item.ref.f, label: core.noteName(item.ref.midi), style: 'ref' });
        dots.push({ s: item.target.s, f: item.target.f, label: reveal ? core.noteName(item.target.midi) : '?', style: reveal ? 'ok' : 'target' });
        spec.fretNumbers = item.showFrets;
      } else if (item.task === 'play') {
        dots.push({ s: item.ref.s, f: item.ref.f, label: core.noteName(item.ref.midi), style: 'ref' });
        if (item.showString) spec.highlight = item.target.s;
        if (reveal) dots.push({ s: item.target.s, f: item.target.f, label: core.noteName(item.target.midi), style: 'ok' });
        spec.link = { from: { s: item.ref.s, f: item.ref.f }, to: { s: item.target.s, f: item.target.f }, text: item.interval.name };
        if (!reveal) delete spec.link;
      } else if (item.task === 'note') {
        if (item.showString) spec.highlight = item.s;
        if (reveal) dots.push({ s: item.target.s, f: item.target.f, label: item.name, style: 'ok' });
      } else if (item.task === 'phrase') {
        if (item.showFirst) dots.push({ s: item.notes[0].s, f: item.notes[0].f, label: item.notes[0].name, style: 'ref' });
        if (reveal) item.notes.forEach(function (n, i) { if (i > 0 || !item.showFirst) dots.push({ s: n.s, f: n.f, label: String(i + 1), style: 'ok' }); });
      }
      return item.task === 'hear' ? '' : board(spec);
    }
    function drawFrame(item, answerHtml) {
      var pr = promptFor(item);
      render('<div class="hif-wrap hif-drill"><div class="hif-top"><span class="hif-task">' + S.task[item.task] + '</span><span class="hif-count" id="hif-count">' + esc(countText()) + '</span>' +
        '<button class="hif-btn ghost" data-act="stop">' + S.btn.stop + '</button></div>' +
        '<div class="hif-prompt" id="hif-prompt">' + esc(pr.main) + '</div><div class="hif-sub" id="hif-sub">' + esc(pr.sub) + '</div>' +
        (item.task === 'hear' ? '' : '<div class="hif-board" id="hif-board">' + boardFor(item, false) + '</div>') +
        '<div class="hif-answer" id="hif-answer">' + (answerHtml || '') + '</div><div class="hif-tries" id="hif-tries"></div>' +
        '<div class="hif-fb" id="hif-fb" aria-live="polite"></div><div class="hif-row" id="hif-nav"></div></div>');
      if (item.task !== 'hear') subLevel(function (rms, live) {
        var lvl = $('hif-lvl'); if (lvl) lvl.style.width = Math.min(100, Math.round(Math.sqrt(rms) * 220)) + '%';
        var lv = $('hif-live'); if (!lv) return;
        if (live && live.midi != null) { var rp = core.readPitch(live.midi); lv.textContent = rp.midi != null ? nm(rp.midi) : S.drill.nothing; } else lv.textContent = S.drill.nothing;
      });
      st.cur = item;
    }
    function reveal(item) { var b = $('hif-board'); if (b) b.innerHTML = boardFor(item, true); }
    function say(cls, text) { var f = $('hif-fb'); if (f) { f.className = 'hif-fb ' + cls; f.textContent = text; } }

    /* ── What the learner hears first ── */
    function playPrompt(item) {
      var sc = item.scaffold || {}, ms = 0;
      if (item.task === 'match') {
        if (item.ref && sc.hearSlide) ms = audio.slide(item.ref.midi, item.target.midi);
        else if (item.ref) ms = audio.seq([item.ref.midi, item.target.midi], { gapMs: 800 });
        else ms = audio.tone(item.target.midi);
      } else if (item.task === 'call') ms = audio.tone(item.ref.midi);
      else if (item.task === 'hear') {
        ms = item.harmonic ? audio.together(item.notes) : audio.seq(item.notes, { gapMs: 750 });
        if (sc.hearFirst) ms += item.harmonic ? audio.together(item.notes, { delayMs: ms }) : audio.seq(item.notes, { gapMs: 750, delayMs: ms });
      }
      else if (item.task === 'play') ms = sc.hearSlide ? audio.slide(item.ref.midi, item.target.midi) : audio.tone(item.ref.midi);
      else if (item.task === 'note') ms = sc.hearFirst ? audio.tone(item.target.midi) : 0;
      else if (item.task === 'phrase') ms = audio.seq(item.notes.map(function (n) { return n.midi; }), { gapMs: 560 });
      return ms;
    }

    /* ══════════ The six asks. Each resolves to an answer for the engine, 'stop', or { unclear:true } for a skip. ══════════ */
    async function askMatch(item, t) {
      drawFrame(item, liveAnswerHtml(item.mode === 'hunt' ? '<button class="hif-btn" data-act="giveup">' + S.btn.giveUp + '</button>' : '<button class="hif-btn" data-act="skip">' + S.btn.skip + '</button>'));
      var dur = playPrompt(item), t0 = nowMs() + dur;
      if (item.mode !== 'hunt') {
        for (var n = 0; n < 4; n++) {
          var r = await listenOnce(t, n === 0 ? dur : 200, 25000);
          if (!alive(t) || r === 'stop') return 'stop';
          if (r.skip) return { unclear: true };
          if (r.timeout) return { unclear: true };
          if (r.unclear) { say('warn', S.drill.unclear); continue; }
          return { tries: [r.midi], ms: Math.max(0, nowMs() - t0) };
        }
        return { unclear: true };
      }
      return new Promise(function (resolve) {
        var tries = [], done = false, stopStream = null, tm = null;
        function fin(extra) {
          if (done) return; done = true; clearTimeout(tm); if (stopStream) stopStream(); st.pending = null;
          resolve(Object.assign({ tries: tries, ms: Math.max(0, nowMs() - t0) }, extra));
        }
        st.pending = function (v) { fin(v === 'stop' ? { stopped: true } : { gaveUp: true }); };
        tm = setTimeout(function () { fin({ gaveUp: true }); }, dur + 30000);
        stopStream = pitch.listenStream(function (note) {
          if (!alive(t) || done) return;
          if (note.unclear) { say('warn', S.drill.unclear); return; }
          tries.push(note.midi);
          if (note.midi === item.target.midi) { fin({ matched: true }); return; }
          var line = missLine(item, note.midi);
          var tr = $('hif-tries'); if (tr) tr.insertAdjacentHTML('beforeend', '<div>' + esc(nm(note.midi) + ' — ' + line) + '</div>');
        }, { deafMs: dur });
      });
    }
    async function askCall(item, t) {
      var picked = -1, t0 = nowMs();
      var btns = item.choices.map(function (c, i) { return '<button class="hif-btn hif-choice" data-act="pick" data-i="' + i + '" aria-label="Sound ' + String.fromCharCode(65 + i) + '">Sound ' + String.fromCharCode(65 + i) + '</button>'; }).join('');
      drawFrame(item, '<div class="hif-choices">' + btns + '</div><div class="hif-row"><button class="hif-btn primary" data-act="lock" id="hif-lock" disabled>' + S.btn.lock + '</button>' +
        (item.replayRef ? '<button class="hif-btn" data-act="replay-ref">' + S.btn.replay + '</button>' : '') + '</div>');
      var sc = item.scaffold || {};
      if (sc.hearSlide) audio.slide(item.ref.midi, item.target.midi); else audio.tone(item.ref.midi);
      st.callState = { picked: -1 };
      var lock = await new Promise(function (res) { st.pending = res; });
      if (!alive(t) || lock === 'stop') return 'stop';
      var pickMs = nowMs() - t0, pick = item.choices[lock.i].midi;
      setHtml('hif-answer', '<div class="hif-choices">' + item.choices.map(function (c, i) { return '<button class="hif-btn hif-choice' + (i === lock.i ? ' sel' : '') + '" disabled>Sound ' + String.fromCharCode(65 + i) + '</button>'; }).join('') + '</div>' +
        '<p class="hif-line" style="margin-top:12px">' + S.prompt.nowPlay + '</p>' + liveAnswerHtml('<button class="hif-btn" data-act="skip">' + S.btn.skip + '</button>'));
      var played;
      for (var n = 0; n < 3; n++) {
        var r = await listenOnce(t, 100, 20000);
        if (!alive(t) || r === 'stop') return 'stop';
        if (r.unclear && !r.skip && !r.timeout) { say('warn', S.drill.unclear); continue; }
        if (!r.skip && !r.timeout && !r.unclear) played = r.midi;
        break;
      }
      return { pick: pick, pickMs: pickMs, played: played, ms: pickMs };
    }
    async function askHear(item, t) {
      var t0 = nowMs();
      drawFrame(item, '<div class="hif-choices">' + item.choices.map(function (c) { return '<button class="hif-btn hif-choice big" data-act="choose" data-v="' + esc(c.name) + '">' + esc(c.name) + '</button>'; }).join('') +
        '</div><div class="hif-row"><button class="hif-btn" data-act="replay-hear">' + S.btn.replay + '</button></div>');
      playPrompt(item);
      var r = await new Promise(function (res) { st.pending = res; });
      if (!alive(t) || r === 'stop') return 'stop';
      return { choice: r.v, ms: nowMs() - t0 };
    }
    async function askOneShot(item, t, kind) {
      drawFrame(item, liveAnswerHtml('<button class="hif-btn" data-act="skip">' + S.btn.skip + '</button>'));
      var dur = playPrompt(item), t0 = nowMs() + dur;
      for (var n = 0; n < 4; n++) {
        var r = await listenOnce(t, n === 0 ? dur : 200, 25000);
        if (!alive(t) || r === 'stop') return 'stop';
        if (r.skip || r.timeout) return { unclear: true };
        if (r.unclear) { say('warn', S.drill.unclear); continue; }
        return { played: r.midi, ms: Math.max(0, nowMs() - t0) };
      }
      return { unclear: true };
    }
    async function askPhrase(item, t) {
      var played = [], marks = [];
      function dots(cur) { return '<div class="hif-dots">' + item.notes.map(function (x, i) { return '<i class="' + (marks[i] || (i === cur ? 'cur' : '')) + '"></i>'; }).join('') + '</div>'; }
      drawFrame(item, dots(0) + liveAnswerHtml('<button class="hif-btn" data-act="replay-phrase">' + S.btn.replay + '</button><button class="hif-btn" data-act="skip">' + S.btn.skip + '</button>'));
      var dur = playPrompt(item);
      for (var i = 0; i < item.notes.length; i++) {
        var got = null;
        for (var n = 0; n < 3 && got === null; n++) {
          var r = await listenOnce(t, i === 0 && n === 0 ? dur : 150, 40000);
          if (!alive(t) || r === 'stop') return 'stop';
          if (r.skip) { return { unclear: true }; }
          if (r.timeout) { got = undefined; break; }
          if (r.unclear) { say('warn', S.drill.unclear); continue; }
          got = r.midi;
        }
        played.push(got === null ? null : got);
        marks[i] = got === item.notes[i].midi ? 'ok' : 'bad';
        var d = el.querySelector('.hif-dots'); if (d) d.outerHTML = dots(i + 1);
      }
      return { played: played };
    }
    function ask(item, t) {
      if (item.task === 'match') return askMatch(item, t);
      if (item.task === 'call') return askCall(item, t);
      if (item.task === 'hear') return askHear(item, t);
      if (item.task === 'phrase') return askPhrase(item, t);
      return askOneShot(item, t);
    }

    /* ── Feedback lines (4.10) ── */
    function missLine(item, played) {
      var t = item.target.midi, d = played - t, ref = item.ref;
      if (Math.abs(d) === 12) return S.fb.octave(d < 0);
      if (ref && Math.sign(played - ref.midi) * Math.sign(t - ref.midi) < 0) return S.fb.wrongWay(dirWord(t - ref.midi));
      if (ref) return S.fb.off(Math.abs(d), d > 0, core.ivlOf(ref.midi, played).name, core.ivlOf(ref.midi, t).name);
      return S.fb.off(Math.abs(d), d > 0);
    }
    function describe(item, res, ans) {
      var cls = res.right ? 'ok' : (res.correct ? 'warn' : 'bad'), text = '';
      if (item.task === 'match') {
        if (item.mode === 'hunt') {
          text = res.correct ? S.fb.found(nm(item.target.midi), ans.tries.length) : S.fb.noMatch(nm(item.target.midi), posText(item.target));
        } else if (res.correct) text = S.fb.right(nm(item.target.midi), item.interval ? item.interval.name + ' ' + item.interval.dir : '');
        else text = missLine(item, ans.tries[0]);
      } else if (item.task === 'call') {
        var ch = item.choices.filter(function (c) { return c.midi === ans.pick; })[0];
        if (res.correct) text = res.posError ? S.fb.posError : S.fb.right(nm(item.target.midi), item.interval.name + ' ' + item.interval.dir);
        else text = S.fb.picked(nm(ans.pick), nm(item.target.midi));
        if (res.posError) cls = 'warn';
      } else if (item.task === 'hear') {
        text = res.correct ? S.fb.hearRight(item.answerName) : S.fb.hearWrong(item.answerName, ans.choice);
      } else if (item.task === 'play' || item.task === 'note') {
        if (res.correct) text = S.fb.right(nm(item.target.midi), item.task === 'play' ? item.interval.name + ' ' + item.dir : '');
        else text = missLine(item, ans.played);
      } else if (item.task === 'phrase') {
        var n = 0; (res.rights || []).forEach(function (x) { if (x) n++; });
        text = S.fb.phrase(n, item.notes.length, item.notes.map(function (x) { return x.name + core.noteOctave(x.midi); }).join(' '));
      }
      return { cls: cls, text: text };
    }
    /* Show the result, play the real answer, and wait for Next (a right answer moves on by itself). */
    async function showResult(item, res, ans, events, t) {
      var d = describe(item, res, ans);
      setListening(false);
      say(d.cls, d.text);
      if (!res.right || item.task === 'phrase') reveal(item);
      if (item.task === 'call') { audio.seq(res.correct ? [item.target.midi] : [ans.pick, item.target.midi], { gapMs: 800 }); }
      else if (item.task === 'hear') { audio.seq(item.notes, { gapMs: 600 }); }
      else if (!res.correct && item.target) audio.tone(item.target.midi);
      else if (item.task === 'phrase') audio.seq(item.notes.map(function (n) { return n.midi; }), { gapMs: 420 });
      (events || []).forEach(function (e) {
        if (e.type === 'unlock') { var nv = $('hif-nav'); if (nv) nv.insertAdjacentHTML('beforebegin', '<div class="hif-toast">' + esc(S.fb.unlocked(e.kind === 'zone' ? 'Zone ' + e.id + ' — ' + S.zone[e.id] : 'Tier ' + e.id + ' — ' + S.tier[e.id])) + '</div>'); }
      });
      if (item.task === 'hear') {
        el.querySelectorAll('.hif-choice').forEach(function (b) { if (b.getAttribute('data-v') === item.answerName) b.classList.add('okc'); else if (b.getAttribute('data-v') === ans.choice) b.classList.add('badc'); });
      }
      var an = null;
      if (item.task === 'hear') an = anchorFor(core, item.answerName, item.dir === 'down' ? 'down' : 'up');
      else if (item.task === 'play') an = anchorFor(core, item.interval.name, item.dir === 'down' ? 'down' : 'up');
      st.anchor = an ? { an: an, name: item.task === 'hear' ? item.answerName : item.interval.name, dir: item.dir === 'down' ? 'down' : 'up' } : null;
      setHtml('hif-nav', '<button class="hif-btn primary" data-act="next" id="hif-next">' + S.btn.next + '</button>' +
        (an ? '<button class="hif-btn" data-act="anchor" id="hif-anchor">' + S.btn.anchor + '</button>' : ''));
      var go = await new Promise(function (resolve) {
        st.pending = resolve;
        if (res.right && item.task !== 'phrase') later(function () { if (st.pending === resolve) { st.pending = null; resolve('next'); } }, 1700);
      });
      return go;
    }

    /* ── Lessons and the contrast drill (4.7, 4.8) ── */
    async function showLesson(card, t) {
      var fig = LESSON_FIG[card] || null;
      var svg = fig ? board({ dots: fig.dots, link: fig.link, highlight: fig.hl, fretNumbers: true, maxFret: 14, label: S.lessons[card] }) : '';
      render('<div class="hif-wrap"><div class="hif-top"><span class="hif-task">' + S.lessonTitle + '</span></div><div class="hif-card"><p class="hif-line">' + esc(S.lessons[card] || '') + '</p>' +
        (svg ? '<div class="hif-board">' + svg + '</div>' : '') +
        '<div class="hif-row"><button class="hif-btn" data-act="hear-lesson">' + S.btn.hear + '</button><button class="hif-btn primary" data-act="go" id="hif-go">' + S.btn.go + '</button></div></div></div>');
      st.lessonFig = fig;
      if (fig) audio.seq(fig.play, { gapMs: 650 });
      var r = await askWait();
      return r;
    }
    async function showContrast(c, t) {
      var sa = core.semisOfName(c.a), sb = core.semisOfName(c.b);
      render('<div class="hif-wrap"><div class="hif-top"><span class="hif-task">' + S.lessonTitle + '</span></div><div class="hif-card"><p class="hif-line">' + esc(S.contrast.title(c.a, c.b)) + '</p>' +
        '<p class="hif-small">' + S.contrast.line + '</p><div class="hif-choices"><button class="hif-btn hif-choice big" id="hif-ca" disabled>' + esc(c.a) + '</button><button class="hif-btn hif-choice big" id="hif-cb" disabled>' + esc(c.b) + '</button></div>' +
        '<div class="hif-row"><button class="hif-btn" data-act="hear-contrast">' + S.contrast.hear + '</button><button class="hif-btn primary" data-act="go">' + S.btn.go + '</button></div></div></div>');
      st.contrastNow = c; playContrast(c);
      return askWait();
    }
    function playContrast(c) {
      var sa = core.semisOfName(c.a), sb = core.semisOfName(c.b), root = c.root || 55, gap = 1500, reps = c.reps || 3, i;
      for (i = 0; i < reps; i++) {
        (function (k) {
          later(function () { audio.seq([root, root + sa], { gapMs: 520 }); mark('hif-ca'); }, k * 2 * gap);
          later(function () { audio.seq([root, root + sb], { gapMs: 520 }); mark('hif-cb'); }, k * 2 * gap + gap);
        })(i);
      }
    }
    function mark(id) { ['hif-ca', 'hif-cb'].forEach(function (x) { var n = $(x); if (n) n.classList.toggle('sel', x === id); }); }

    /* ══════════ Sessions ══════════ */
    async function runSession(opts) {
      opts = opts || {};
      var t = ++tok, max = core.CONFIG_DEFAULT.sessionItems, started = nowMs(), maxMs = 8 * 60 * 1000;
      st.sess = { n: 0, max: max, placement: false, results: [], task: opts.task || null };
      eng.startSession();
      while (alive(t) && st.sess.n < max && nowMs() - started < maxMs) {
        var item = eng.nextItem(opts.task ? { task: opts.task } : null);
        if (!item) break;
        if (item.kind === 'lesson') { var lr = await showLesson(item.card, t); if (!alive(t) || lr === 'stop') break; continue; }
        if (item.kind === 'contrast') { var cr = await showContrast(item, t); if (!alive(t) || cr === 'stop') break; continue; }
        var out = await playItem(item, t, false);
        if (out === 'stop') break;
        if (st.sess.n % 5 === 0) persist();
      }
      if (!destroyed && t === tok) { eng.endSession(); await persist(); showSummary(); }
      else if (!destroyed) { eng.endSession(); persist(); }
    }
    /* One item: ask, grade, show. Returns 'stop' or the result. */
    async function playItem(item, t, placement, pl) {
      for (;;) {
        var ans = await ask(item, t);
        if (!alive(t) || ans === 'stop' || (ans && ans.stopped)) return 'stop';
        var out = placement ? pl.submit(item, ans) : eng.submit(item, ans);
        if (out.result.unclear) {
          st.sess.n++;
          return 'skipped';
        }
        st.sess.n++;
        st.sess.results.push({ item: item, res: out.result });
        var go = await showResult(item, out.result, ans, out.events, t);
        if (!alive(t) || go === 'stop') return 'stop';
        return out.result;
      }
    }

    async function runPlacement() {
      var t = ++tok, pl = eng.startPlacement();
      st.sess = { n: 0, max: 20, placement: true, results: [] };
      render('<div class="hif-wrap"><div class="hif-head"><h1>' + S.place.title + '</h1></div><div class="hif-card"><p class="hif-line">' + S.place.intro + '</p>' +
        '<div class="hif-row"><button class="hif-btn primary big" data-act="go">' + S.btn.begin + '</button><button class="hif-btn ghost" data-act="home">' + S.btn.home + '</button></div></div></div>');
      var first = await askWait();
      if (!alive(t) || first === 'stop') return;
      while (alive(t) && !pl.isDone()) {
        var item = pl.next();
        if (!item) break;
        var out = await playItem(item, t, true, pl);
        if (out === 'stop') break;
      }
      if (!alive(t)) return;
      if (pl.isDone()) { await persist(); showPlacementResult(pl.result()); } else showHome();
    }
    function showPlacementResult(r) {
      var names = function (arr) { return arr.map(function (x) { return x.k === 'move' ? S.move[x.id] : x.id; }).join(', ') || S.sum.none; };
      render('<div class="hif-wrap"><div class="hif-head"><h1>' + S.place.title + '</h1></div><div class="hif-card">' +
        '<p class="hif-line">' + S.place.result + ': ' + S.place.zone + ' ' + r.zone + ' (' + S.zone[r.zone] + '), ' + S.place.tier + ' ' + r.tier + '</p>' +
        '<p>' + S.place.strong + ': ' + esc(names(r.strengths)) + '</p><p>' + S.place.work + ': ' + esc(names(r.workOn)) + '</p>' +
        '<div class="hif-row"><button class="hif-btn primary" data-act="start">' + S.btn.start + '</button><button class="hif-btn" data-act="map">' + S.btn.map + '</button><button class="hif-btn ghost" data-act="home">' + S.btn.home + '</button></div></div></div>');
    }

    /* ── Summary (4.9): Nailed / Next + a mini skill map + Again ── */
    function showSummary() {
      var res = st.sess ? st.sess.results : [], by = {};
      res.forEach(function (r) {
        var it = r.item, key = (it.move && it.move !== 'free') ? 'm:' + it.move : it.task === 'hear' || it.task === 'play' ? 'i:' + (it.interval ? it.interval.simple || it.interval.name : '') : 't:' + it.task;
        var b = by[key] = by[key] || { n: 0, ok: 0 };
        b.n++; if (r.res.right) b.ok++;
      });
      function label(k) { var kind = k[0], id = k.slice(2); return kind === 'm' ? S.move[id] : kind === 'i' ? id : S.task[id]; }
      var rows = Object.keys(by).map(function (k) { return { k: k, n: by[k].n, rate: by[k].ok / by[k].n }; });
      var nailed = rows.filter(function (x) { return x.n >= 2 && x.rate === 1; }).sort(function (a, b) { return b.n - a.n; }).slice(0, 3).map(function (x) { return label(x.k); });
      var next = rows.filter(function (x) { return x.rate < 1; }).sort(function (a, b) { return a.rate - b.rate || b.n - a.n; }).slice(0, 3).map(function (x) { return label(x.k); });
      render('<div class="hif-wrap"><div class="hif-head"><h1>' + S.sum.title + '</h1></div><div class="hif-card">' +
        '<p class="hif-small">' + S.sum.items(res.length) + '</p>' +
        '<p class="hif-line">' + S.sum.nailed + ': ' + esc(nailed.join(', ') || S.sum.none) + '</p><p class="hif-line">' + S.sum.next + ': ' + esc(next.join(', ') || S.sum.none) + '</p>' +
        '<div class="hif-row"><button class="hif-btn primary" data-act="again">' + S.btn.again + '</button><button class="hif-btn" data-act="map">' + S.btn.map + '</button><button class="hif-btn ghost" data-act="home">' + S.btn.home + '</button></div></div>' +
        '<div style="margin-top:14px">' + mapHtml(true) + '</div></div>');
    }

    /* ── Skill map (4.9): moves, intervals, note locations, and the neck reached ── */
    function cellState(keys) {
      var p = eng.getProfile(), n = 0, ms = 0;
      keys.forEach(function (k) { var c = p.cells[k]; if (c) { n += c.n; ms += c.m * c.n; } });
      if (!n) return 'none';
      var m = ms / n;
      if (n < 3) return 'new';
      if (m < 0.6) return 'learning';
      if (m >= 0.85 && n >= 8) return 'mastered';
      return 'solid';
    }
    function mapHtml(compact) {
      var p = eng.getProfile(), zi = p.unlockedZones.length, ti = p.unlockedTiers.length, cat = core.catalog(), ic = core.intervalCatalog();
      function box(state, title, locked) { return '<div class="hif-cell st-' + (locked ? 'locked' : state) + '" title="' + esc(title + ': ' + (locked ? S.map.locked : S.map.status[state])) + '"></div>'; }
      var moves = ['same-s', 'same-m', 'same-l', 'cross-adj', 'unison', 'octave', 'skip', 'cross-B', 'shift', 'free'];
      var cols = [['low', 'lo'], ['mid', 'lo'], ['high', 'lo'], ['low', 'up'], ['mid', 'up'], ['high', 'up']];
      var h1 = '<div class="hif-grid2" style="grid-template-columns:150px repeat(6,1fr)"><b></b>' + cols.map(function (c) { return '<b>' + S.map[c[0]] + '<br>' + (c[1] === 'lo' ? '0–12' : '12–20') + '</b>'; }).join('');
      moves.forEach(function (mv) {
        h1 += '<b>' + esc(S.move[mv]) + '</b>';
        cols.forEach(function (c) {
          var keys = ['match', 'call'].map(function (t) { return t + '|' + mv + '|' + c[0] + '|' + c[1]; }).filter(function (k) { return cat.match[k] || cat.call[k]; });
          var intro = 9; keys.forEach(function (k) { var m = cat.match[k] || cat.call[k]; if (m && m.intro < intro) intro = m.intro; });
          h1 += keys.length ? box(cellState(keys), S.move[mv] + ', ' + c[0] + ' ' + c[1], intro > zi) : '<div></div>';
        });
      });
      h1 += '</div>';
      var names = core.SIMPLE_NAMES.slice(), dirs = ['up', 'down', 'harm'];
      var h2 = '<div class="hif-grid2" style="grid-template-columns:70px repeat(3,1fr)"><b></b>' + dirs.map(function (d) { return '<b>' + (d === 'up' ? S.map.up_ : d === 'down' ? S.map.down : S.map.harm) + '</b>'; }).join('');
      names.concat(['cmp']).forEach(function (n) {
        h2 += '<b>' + (n === 'cmp' ? '8ve+' : n) + '</b>';
        dirs.forEach(function (d) {
          var keys = ['hear', 'play'].map(function (t) { return t + '|' + n + '|' + d; }).filter(function (k) { return ic.hear.concat(ic.play).some(function (m) { return m.key === k; }); });
          var intro = 9; ic.hear.concat(ic.play).forEach(function (m) { if (keys.indexOf(m.key) >= 0 && m.intro < intro) intro = m.intro; });
          h2 += keys.length ? box(cellState(keys), n + ' ' + d, intro > ti) : '<div></div>';
        });
      });
      h2 += '</div>';
      var bands = [['0-4', 0, 4], ['5-8', 5, 8], ['9-12', 9, 12], ['13-16', 13, 16], ['17-20', 17, 20]];
      var h3 = '<div class="hif-grid2" style="grid-template-columns:60px repeat(21,1fr)"><b></b>';
      for (var f = 0; f <= 20; f++) h3 += '<b style="text-align:center;font-size:.7rem">' + f + '</b>';
      for (var s = 5; s >= 0; s--) {
        h3 += '<b>' + esc(S.strings[s]) + '</b>';
        for (var ff = 0; ff <= 20; ff++) {
          var bd = bands.filter(function (b) { return ff >= b[1] && ff <= b[2]; })[0][0], k = 'note|' + core.STRING_KEYS[s] + '|' + bd, m = cat.note[k];
          h3 += m ? box(cellState([k]), S.strings[s] + ' ' + ff, m.intro > zi) : '<div></div>';
        }
      }
      h3 += '</div>';
      var reach = [12, 12, 12, 20, 20][Math.min(4, zi - 1)];
      var bar = '<div class="hif-bar" title="' + S.map.zoneBar + '"><i style="width:' + Math.round(reach / 20 * 100) + '%"></i></div><div class="hif-small">' + S.map.zoneBar + ': fret ' + reach + ' of 20 (' + S.zone['Z' + zi] + ')</div>';
      var legend = '<div class="hif-legend">' + ['none', 'new', 'learning', 'solid', 'mastered'].map(function (k) { return '<span><i class="hif-cell st-' + k + '"></i>' + S.map.status[k] + '</span>'; }).join('') + '<span><i class="hif-cell st-locked"></i>' + S.map.locked + '</span></div>';
      return '<div class="hif-card" style="max-width:none"><p class="hif-line" style="margin-bottom:6px">' + S.map.title + '</p>' + bar + legend +
        '<div class="hif-map"><div class="hif-panel"><h3>' + S.map.moves + '</h3>' + h1 + '</div><div class="hif-panel"><h3>' + S.map.ivls + '</h3>' + h2 + '</div>' +
        (compact ? '' : '') + '</div><div class="hif-panel" style="margin-top:14px"><h3>' + S.map.notes + '</h3>' + h3 + '</div></div>';
    }
    function showMap() {
      tok++; cancelAsk();
      render('<div class="hif-wrap"><div class="hif-head"><h1>' + S.map.title + '</h1><button class="hif-btn ghost" data-act="home">' + S.btn.home + '</button></div>' + mapHtml(false) + '</div>');
    }
    function showPractice() {
      tok++; cancelAsk();
      render('<div class="hif-wrap"><div class="hif-head"><h1>' + S.practice.title + '</h1><button class="hif-btn ghost" data-act="home">' + S.btn.home + '</button></div><p class="hif-status">' + S.practice.line + '</p><div class="hif-grid">' +
        ['match', 'call', 'hear', 'play', 'phrase', 'note'].map(function (k) { return '<button class="hif-btn big" data-act="task" data-v="' + k + '">' + S.task[k] + '</button>'; }).join('') + '</div></div>');
    }

    /* ══════════ Wiring ══════════ */
    function ensureInput(thenAct) {
      if (st.inputOk) return thenAct();
      return Promise.resolve(pitch.open({ deviceId: st.deviceId })).then(function (r) {
        if (r && r.ok) { st.inputOk = true; return thenAct(); }
        showSetup('home');
      });
    }
    function onClick(e) {
      var b = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!b || !el.contains(b) || b.disabled) return;
      var act = b.getAttribute('data-act'), v = b.getAttribute('data-v'), i = b.getAttribute('data-i');
      if (act === 'exit') { if (deps.onExit) deps.onExit(); return; }
      if (act === 'home') { st.sess = null; showHome(); return; }
      if (act === 'start') { ensureInput(function () { runSession(); }); return; }
      if (act === 'again') { ensureInput(function () { runSession({ task: st.sess && st.sess.task }); }); return; }
      if (act === 'practice') { showPractice(); return; }
      if (act === 'task') { ensureInput(function () { runSession({ task: v }); }); return; }
      if (act === 'map') { showMap(); return; }
      if (act === 'retake') { ensureInput(function () { runPlacement(); }); return; }
      if (act === 'input') { showSetup('home'); return; }
      if (act === 'setup-use') { setupUse(); return; }
      if (act === 'tune-start') { tuneStart(); return; }
      if (act === 'open-tuner') { if (deps.onOpenTuner) deps.onOpenTuner(); return; }
      if (act === 'setup-done') { var to = st.afterSetup; if (to === 'placement') runPlacement(); else showHome(); return; }
      if (act === 'stop') { cancelAsk(); tok++; if (eng) { eng.endSession(); persist(); } showHome(); return; }
      if (act === 'giveup' || act === 'skip') { if (st.pending) { var p = st.pending; st.pending = null; try { pitch.cancel(); } catch (x) { /* closed */ } p(act === 'skip' ? { skip: true, unclear: true } : 'giveup'); } return; }
      if (act === 'next' || act === 'go') { if (st.pending) { var q = st.pending; st.pending = null; q('next'); } return; }
      if (act === 'pick') {
        var item = st.cur; if (!item || item.task !== 'call') return;
        st.callState.picked = +i; audio.tone(item.choices[+i].midi);
        el.querySelectorAll('.hif-choice').forEach(function (c) { c.classList.toggle('sel', c === b); });
        var lk = $('hif-lock'); if (lk) lk.disabled = false; return;
      }
      if (act === 'lock') { if (st.pending && st.callState.picked >= 0) { var lp = st.pending; st.pending = null; lp({ i: st.callState.picked }); } return; }
      if (act === 'replay-ref') { if (st.cur) audio.tone(st.cur.ref.midi); return; }
      if (act === 'replay-hear') { if (st.cur) { if (st.cur.harmonic) audio.together(st.cur.notes); else audio.seq(st.cur.notes, { gapMs: 750 }); } return; }
      if (act === 'replay-phrase') { if (st.cur) { var pm = audio.seq(st.cur.notes.map(function (n) { return n.midi; }), { gapMs: 560 }); pitch.deaf(pm + 200); } return; }
      if (act === 'choose') { if (st.pending) { var cp = st.pending; st.pending = null; cp({ v: v }); } return; }
      if (act === 'anchor') {
        var a = st.anchor; if (!a) return;
        var from = Math.max(0, a.an.i - 2), seg = a.an.midis.slice(from, a.an.i + 2);
        audio.seq(seg, { gapMs: 460 });
        var tr2 = $('hif-tries'); if (tr2) tr2.innerHTML = '<div>' + esc(S.fb.anchor(a.an.song, a.an.i, a.name, a.dir)) + '</div>';
        return;
      }
      if (act === 'hear-lesson') { if (st.lessonFig) audio.seq(st.lessonFig.play, { gapMs: 650 }); return; }
      if (act === 'hear-contrast') { if (st.contrastNow) { clearTimers(); playContrast(st.contrastNow); } return; }
    }
    var api = {
      start: function () {
        injectCss(); el.classList.add('hif-root'); el.addEventListener('click', onClick);
        offs.push(pitch.onLost(function () { st.inputOk = false; cancelAsk(); tok++; showSetup('home'); setTimeout(function () { setText('hif-msg', S.drill.inputLost); }, 0); }));
        return Promise.resolve(store.load()).catch(function () { return null; }).then(function (raw) {
          if (destroyed) return;
          eng = core.createEngine({ rng: rng, now: nowFn, profile: raw || null });
          if (deps.debug) deps.debug.engine = eng;
          if (!eng.getProfile().placementDone) { showSetup('placement'); } else showHome();
        });
      },
      resumeInput: function () { st.inputOk = false; return Promise.resolve(pitch.open({ deviceId: st.deviceId })).then(function (r) { if (r && r.ok) st.inputOk = true; showHome(); }); },
      destroy: function () {
        destroyed = true; tok++; clearTimers(); cancelAsk();
        offs.forEach(function (f) { try { f(); } catch (e) { /* gone */ } }); offs = [];
        try { el.removeEventListener('click', onClick); } catch (e) { /* gone */ }
        try { pitch.close(); } catch (e) { /* closed */ }
        audio.stop(); el.innerHTML = '';
      },
      debug: { state: function () { return st; }, engine: function () { return eng; } }
    };
    return api;
  }

  return { createTrainer: createTrainer, STR: STR, LESSON_FIG: LESSON_FIG, ANCHORS: ANCHORS, anchorFor: anchorFor };
});
