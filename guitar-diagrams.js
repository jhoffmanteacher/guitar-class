/* ══════════════════════════════════════════════════════════════
   guitar-diagrams.js — SINGLE SOURCE for every chord / string /
   fretboard / note diagram in the course.

   Loaded by index.html as a plain script BEFORE app.js and
   coach.js, both of which call these functions as globals.
   Also loadable from Node (see tools/guitar-diagrams-cli.mjs) so
   the teacher slide decks render the exact same shapes students
   see on the site. Extracted from app.js 2026-07-26 — app.js no
   longer carries a copy, so the two can never drift.

   ── Themes ──
   Default is `css`: the site's CSS custom properties, so the board
   picks up dark mode. Pass a theme when rendering OUTSIDE the site,
   where var(--…) resolves to nothing:
     'slide'  cream #FAF6EF ground, for projection
     'web'    the site's light-mode hex
   All three draw at the same weight, GD_SITE_BOOST (WO8, 2026-08-28),
   so a board on a slide and the same board on the site differ only in
   ground colour. A theme also switches on standalone mode: an explicit
   background rect, a font-family on the root <svg>, and width/height
   attrs. Geometry never changes — only colour, weight, and framing.
   ══════════════════════════════════════════════════════════════ */

/* One weight for site and slides. Standing rule 2026-08-28: the site's
   css theme and the CLI's web theme share this so they can't drift. */
var GD_SITE_BOOST = 1.35;

var GUITAR_DIAGRAM_THEMES = {
  /* Site rendering. Colors are CSS variables so dark mode works; weight is
     GD_SITE_BOOST (WO8, 2026-08-28) — the pre-split parity guarantee no
     longer applies. */
  css: {
    bg: 'var(--bg)', text: 'var(--text)', text2: 'var(--text2)',
    text3: 'var(--text3)', green: 'var(--green-text)',
    boost: GD_SITE_BOOST, standalone: false,
  },
  slide: {
    bg: '#FAF6EF', text: '#1a1a18', text2: '#5e5e58',
    text3: '#585852', green: '#3b6d11',
    boost: GD_SITE_BOOST, standalone: true,
  },
  web: {
    bg: '#ffffff', text: '#1a1a18', text2: '#5e5e58',
    text3: '#585852', green: '#3b6d11',
    boost: GD_SITE_BOOST, standalone: true,
  },
};

var GD_SANS = "Calibri,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif";

/* Matches app.js's escHtml exactly — kept private so this file has
   no dependency on app.js load order. */
function gdEsc(s){
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function gdTheme(opts){
  opts = opts || {};
  var base = GUITAR_DIAGRAM_THEMES[opts.theme || 'css'] || GUITAR_DIAGRAM_THEMES.css;
  var t = {
    bg: base.bg, text: base.text, text2: base.text2,
    text3: base.text3, green: base.green,
    boost: opts.boost != null ? opts.boost : base.boost,
    standalone: opts.standalone != null ? opts.standalone : base.standalone,
  };
  if (opts.bg) t.bg = opts.bg;
  /* boost 1 must round-trip to the original literals: +(0.9).toFixed(2) → 0.9 */
  t.b = function(n){ return +(n * t.boost).toFixed(2); };
  return t;
}

/* Root <svg> tag. In css mode this reproduces the original markup
   exactly; standalone mode adds sizing and a font stack. */
function gdOpen(W, H, t, opts, cssFontFamily){
  var px = opts && opts.px != null ? opts.px : (t.standalone ? 4 : 0);
  var size = px ? ' width="' + Math.round(W * px) + '" height="' + Math.round(H * px) + '"' : '';
  var ff = t.standalone ? ' font-family="' + GD_SANS + '"'
                        : (cssFontFamily ? ' font-family="' + cssFontFamily + '"' : '');
  return '<svg xmlns="http://www.w3.org/2000/svg"' + size + ' viewBox="0 0 ' + W + ' ' + H + '"' + ff + '>';
}

function gdGround(W, H, t){
  return t.standalone ? '<rect width="' + W + '" height="' + H + '" fill="' + t.bg + '"/>' : '';
}

/* Per-element font-family overrides. The site's originals name
   -apple-system, which does not exist off macOS and falls back to a
   serif that mangles the finger numerals. In standalone mode we emit
   nothing and let the root GD_SANS stack apply; in css mode we emit
   the original string verbatim so browser output stays byte-identical. */
function gdFF(t, original){
  return t.standalone ? '' : ' font-family="' + original + '"';
}

/* ══════════════════════════════════════════════════════════════
   VERTICAL CHORD BOX
   cfg = { position, chord: [[stringNum, fret, finger], …] }
   string 6 = low E, 1 = high E · fret 'x' = mute, 0 = open
   ══════════════════════════════════════════════════════════════ */
function chordDiagramSVG(cfg, opts){
  var t = gdTheme(opts);
  opts = opts || {};
  var label = t.standalone ? opts.label : null;   // name above the box, standalone only
  var labelH = label ? 16 : 0;

  var W = 96, H = 104 + labelH, padL = 22, padR = 14, padT = 20 + labelH, padB = 4;
  var NUM_FRETS = 4;
  var boxW = W - padL - padR, boxH = (H - labelH) - 20 - padB;
  var strGap = boxW / 5, fretGap = boxH / NUM_FRETS;
  var pos = cfg.position || 0, isOpen = pos === 0;
  /* The finger numeral inside the dot is t.b(9), so the dot has to grow with it
     or the digit spills (WO8). Capped at 0.42 of a string gap so two dots on
     adjacent strings at the same fret keep a visible seam and a three-finger
     shape like A never reads as a barre. */
  var dotR = Math.min(t.b(Math.min(strGap, fretGap) * 0.36), strGap * 0.42);
  var ind = {}, chordArr = cfg.chord || [];
  chordArr.forEach(function(e){ ind[e[0]] = { fret: e[1], finger: e[2] }; });

  /* css mode keeps the original: width/height present, no root font-family */
  var s;
  if (t.standalone) {
    s = gdOpen(W, H, t, opts) + gdGround(W, H, t);
  } else {
    s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" viewBox="0 0 ' + W + ' ' + H + '">';
  }

  if (label) {
    s += '<text x="' + (W / 2) + '" y="' + (labelH - 3) + '" text-anchor="middle" font-size="' + t.b(13)
      +  '" font-weight="700" fill="' + t.text + '">' + gdEsc(label) + '</text>';
  }

  for (var n = 6; n >= 1; n--) {
    var xi = 6 - n, x = padL + xi * strGap, st = ind[n];
    if (st) {
      if (st.fret === 'x') {
        s += '<text x="' + x + '" y="' + (padT - 7) + '" text-anchor="middle" dominant-baseline="middle" font-size="'
          +  t.b(11) + '" fill="' + t.text2 + '"' + gdFF(t, 'sans-serif') + '>×</text>';
      } else if (st.fret === 0) {
        s += '<circle cx="' + x + '" cy="' + (padT - 8) + '" r="' + t.b(3.2) + '" fill="none" stroke="' + t.text2
          +  '" stroke-width="' + t.b(1.1) + '"/>';
      }
    }
    s += '<line x1="' + x + '" y1="' + padT + '" x2="' + x + '" y2="' + (padT + NUM_FRETS * fretGap)
      +  '" stroke="' + t.text3 + '" stroke-width="' + t.b(0.9) + '"/>';
  }

  if (isOpen) {
    s += '<rect x="' + (padL - 1) + '" y="' + (padT - 2.5) + '" width="' + (boxW + 2) + '" height="3" fill="' + t.text + '" rx="1"/>';
  } else {
    s += '<text x="' + (padL - 5) + '" y="' + (padT + fretGap * 0.55) + '" text-anchor="end" dominant-baseline="middle" font-size="'
      +  t.b(9) + '" fill="' + t.text2 + '"' + gdFF(t, 'sans-serif') + '>' + pos + 'fr</text>';
  }

  for (var f = 1; f <= NUM_FRETS; f++) {
    var y = padT + f * fretGap;
    s += '<line x1="' + padL + '" y1="' + y + '" x2="' + (padL + boxW) + '" y2="' + y
      +  '" stroke="' + t.text3 + '" stroke-width="' + t.b(0.8) + '"/>';
  }

  chordArr.forEach(function(e){
    var num = e[0], fr = e[1], fg = e[2];
    if (typeof fr !== 'number' || fr <= 0) return;
    var row = isOpen ? fr : (fr - pos + 1);
    if (row < 1 || row > NUM_FRETS) return;
    var cx = padL + (6 - num) * strGap, cy = padT + (row - 0.5) * fretGap;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + dotR + '" fill="' + t.text + '"/>';
    if (fg != null && fg !== '') {
      s += '<text x="' + cx + '" y="' + cy + '" text-anchor="middle" dominant-baseline="central" font-size="'
        +  t.b(9) + '" font-weight="600" fill="' + t.bg + '"' + gdFF(t, '-apple-system,sans-serif') + '>' + fg + '</text>';
    }
  });

  return s + '</svg>';
}

/* ══════════════════════════════════════════════════════════════
   CHORD SHAPE LIBRARY
   ══════════════════════════════════════════════════════════════ */
var CHORD_DIAGRAMS = {
  'E'  : { position:0, chord:[[6,0,0],[5,2,2],[4,2,3],[3,1,1],[2,0,0],[1,0,0]] },
  'Em' : { position:0, chord:[[6,0,0],[5,2,2],[4,2,3],[3,0,0],[2,0,0],[1,0,0]] },
  'A'  : { position:0, chord:[[6,'x',''],[5,0,0],[4,2,1],[3,2,2],[2,2,3],[1,0,0]] },
  'Am' : { position:0, chord:[[6,'x',''],[5,0,0],[4,2,2],[3,2,3],[2,1,1],[1,0,0]] },
  'D'  : { position:0, chord:[[6,'x',''],[5,'x',''],[4,0,0],[3,2,1],[2,3,3],[1,2,2]] },
  'Dm' : { position:0, chord:[[6,'x',''],[5,'x',''],[4,0,0],[3,2,2],[2,3,3],[1,1,1]] },
  'G'  : { position:0, chord:[[6,3,2],[5,2,1],[4,0,0],[3,0,0],[2,0,0],[1,3,3]] },
  'C'  : { position:0, chord:[[6,'x',''],[5,3,3],[4,2,2],[3,0,0],[2,1,1],[1,0,0]] },
  'F'  : { position:0, chord:[[6,'x',''],[5,'x',''],[4,3,3],[3,2,2],[2,1,1],[1,1,1]] },
  /* Bm / F#m / C#m: partial-barre (beginner) shapes — these are what Modules 5–6
     teach. Module 7 (barre chords) skips these auto-link pop-ups entirely (see
     wrapChordLinksIn) and renders full-barre shapes inline instead. */
  'Bm' : { position:2, chord:[[6,'x',''],[5,'x',''],[4,4,4],[3,4,3],[2,3,2],[1,2,1]] },
  'B7' : { position:0, chord:[[6,'x',''],[5,2,2],[4,1,1],[3,2,3],[2,0,0],[1,2,4]] },
  'F#m': { position:2, chord:[[6,'x',''],[5,'x',''],[4,4,3],[3,2,1],[2,2,1],[1,2,1]] },
  'C#m': { position:4, chord:[[6,'x',''],[5,'x',''],[4,6,4],[3,6,3],[2,5,2],[1,4,1]] },
  'E5' : { position:0, chord:[[6,0,0],[5,2,3],[4,'x',''],[3,'x',''],[2,'x',''],[1,'x','']] },
  'G5' : { position:3, chord:[[6,3,1],[5,5,3],[4,'x',''],[3,'x',''],[2,'x',''],[1,'x','']] },
  'A5' : { position:5, chord:[[6,5,1],[5,7,3],[4,'x',''],[3,'x',''],[2,'x',''],[1,'x','']] },
  'C5' : { position:3, chord:[[6,'x',''],[5,3,1],[4,5,3],[3,'x',''],[2,'x',''],[1,'x','']] },
  'D5' : { position:5, chord:[[6,'x',''],[5,5,1],[4,7,3],[3,'x',''],[2,'x',''],[1,'x','']] }
};

/* Strip the SVG's fixed width/height so it scales to its container via viewBox */
function localChordSvg(chord, opts){
  var cfg = CHORD_DIAGRAMS[chord];
  if (!cfg) return null;
  return chordDiagramSVG(cfg, opts).replace(/width="\d+"\s+height="\d+"/, '');
}

/* ══════════════════════════════════════════════════════════════
   SINGLE-STRING CHORD BOXES — one open string, the others muted.
   Reused via the same chordDiagramSVG renderer for consistency.
   ══════════════════════════════════════════════════════════════ */
var STRING_DIAGRAMS = {
  'lowE' : { position:0, chord:[[6,0,0],[5,'x',''],[4,'x',''],[3,'x',''],[2,'x',''],[1,'x','']] },
  'A'    : { position:0, chord:[[6,'x',''],[5,0,0],[4,'x',''],[3,'x',''],[2,'x',''],[1,'x','']] },
  'D'    : { position:0, chord:[[6,'x',''],[5,'x',''],[4,0,0],[3,'x',''],[2,'x',''],[1,'x','']] },
  'G'    : { position:0, chord:[[6,'x',''],[5,'x',''],[4,'x',''],[3,0,0],[2,'x',''],[1,'x','']] },
  'B'    : { position:0, chord:[[6,'x',''],[5,'x',''],[4,'x',''],[3,'x',''],[2,0,0],[1,'x','']] },
  'highE': { position:0, chord:[[6,'x',''],[5,'x',''],[4,'x',''],[3,'x',''],[2,'x',''],[1,0,0]] }
};
/* ── String names students read (popups, panel titles, the row labels
   baked into every fretboard SVG) go through i18n.js's global t() so
   Spanish shows solfège — cuerda Mi grave / La / Re / Sol / Si / Mi
   agudo — instead of English letters. Looked up lazily, on property
   read, so a language switch is picked up by the next redraw. gdT()
   falls back to the English literal when t() isn't loaded (the Node
   CLI in tools/ requires this file standalone). NOTE: several SVG
   builders below shadow `t` with the theme object, hence window.t. ── */
function gdT(key, fallback, params){
  var fn = (typeof window !== 'undefined') && window.t;
  return (typeof fn === 'function') ? fn(key, params) : fallback;
}
function gdLang(){
  var fn = (typeof window !== 'undefined') && window.getLang;
  return (typeof fn === 'function') ? fn() : 'en';
}
/* {prop: [i18n key, English fallback]} → object whose values are looked
   up at read time, so existing MAP[key] call sites keep working. */
function gdLabelMap(spec){
  var o = {};
  Object.keys(spec).forEach(function(k){
    Object.defineProperty(o, k, {
      enumerable: true,
      get: function(){ return gdT(spec[k][0], spec[k][1]); }
    });
  });
  return o;
}
var STRING_LABELS = gdLabelMap({
  'lowE' : ['diagram.stringLowE',  'Low E (6th string)'],
  'A'    : ['diagram.stringA',     'A (5th string)'],
  'D'    : ['diagram.stringD',     'D (4th string)'],
  'G'    : ['diagram.stringG',     'G (3rd string)'],
  'B'    : ['diagram.stringB',     'B (2nd string)'],
  'highE': ['diagram.stringHighE', 'High E (1st string)']
});
function localStringSvg(kind, opts){
  var cfg = STRING_DIAGRAMS[kind];
  if (!cfg) return null;
  return chordDiagramSVG(cfg, opts).replace(/width="\d+"\s+height="\d+"/, '');
}

var STRING_KIND_TO_NUM  = { lowE:6, A:5, D:4, G:3, B:2, highE:1 };
var STRING_SHORT_LABEL  = gdLabelMap({
  lowE:['fret.stringLowE','low E'], A:['fret.stringA','A'], D:['fret.stringD','D'],
  G:['fret.stringG','G'], B:['fret.stringB','B'], highE:['fret.stringHighE','high E']
});
var STRING_NUM_TO_LABEL = gdLabelMap({
  1:['fret.stringHighE','high E'], 2:['fret.stringB','B'], 3:['fret.stringG','G'],
  4:['fret.stringD','D'], 5:['fret.stringA','A'], 6:['fret.stringLowE','low E']
});
var FRETBOARD_INLAYS = [3, 5, 7, 9, 12];

/* ══════════════════════════════════════════════════════════════
   HORIZONTAL FRETBOARD — one string highlighted, 12 frets.
   Visually distinct from the vertical chord box so students can
   tell at a glance that the reference is a STRING, not a shape.
   ══════════════════════════════════════════════════════════════ */
function localStringFretboardSvg(kind, opts){
  var sNum = STRING_KIND_TO_NUM[kind];
  if (!sNum) return null;
  var t = gdTheme(opts);
  /* WO8: padL and padB carry the 1.35x gutters — a wider one for the string
     labels ('high E', 'Mi aguda') and a taller one so the fret-number row
     clears the boosted open-string ring on the bottom string. The drawn board
     is unchanged: fretW and boxH both subtract the growth back out. */
  var W = 300, H = 92, padL = 56, padR = 10, padT = 7, padB = 28;
  var openW = 16, maxFret = 12;
  var fretW = (W - padL - padR - openW) / maxFret;
  var boxH = H - padT - padB;
  var strGap = boxH / 5;
  var nutX = padL + openW;
  var fretX = function(f){ return nutX + f * fretW; };

  var s = gdOpen(W, H, t, opts, "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif") + gdGround(W, H, t);

  FRETBOARD_INLAYS.forEach(function(f){
    var cx = nutX + (f - 0.5) * fretW, cy = padT + boxH / 2;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + t.b(2) + '" fill="' + t.text3 + '" opacity="0.35"/>';
    if (f === 12) {
      s += '<circle cx="' + cx + '" cy="' + (cy - 8) + '" r="' + t.b(2) + '" fill="' + t.text3 + '" opacity="0.35"/>';
      s += '<circle cx="' + cx + '" cy="' + (cy + 8) + '" r="' + t.b(2) + '" fill="' + t.text3 + '" opacity="0.35"/>';
    }
  });

  for (var f1 = 1; f1 <= maxFret; f1++) {
    var x = fretX(f1);
    s += '<line x1="' + x + '" y1="' + padT + '" x2="' + x + '" y2="' + (padT + boxH)
      +  '" stroke="' + t.text3 + '" stroke-width="' + t.b(0.7) + '"/>';
  }
  s += '<rect x="' + (nutX - 1.5) + '" y="' + (padT - 1.5) + '" width="3" height="' + (boxH + 3) + '" fill="' + t.text + '" rx="0.5"/>';

  for (var n = 1; n <= 6; n++) {
    var y = padT + (n - 1) * strGap;
    var isTarget = n === sNum;
    var stroke = isTarget ? t.green : t.text3;
    var sw = t.b(isTarget ? 2 : 0.7);
    s += '<line x1="' + padL + '" y1="' + y + '" x2="' + fretX(maxFret) + '" y2="' + y
      +  '" stroke="' + stroke + '" stroke-width="' + sw + '"/>';
    var labelColor = isTarget ? t.green : t.text2;
    var labelWeight = isTarget ? '600' : '400';
    s += '<text x="' + (padL - 5) + '" y="' + y + '" text-anchor="end" dominant-baseline="central" font-size="'
      +  t.b(8) + '" font-weight="' + labelWeight + '" fill="' + labelColor + '">' + STRING_NUM_TO_LABEL[n] + '</text>';
  }

  var targetY = padT + (sNum - 1) * strGap, openX = padL + openW / 2;
  s += '<circle cx="' + openX + '" cy="' + targetY + '" r="' + t.b(4.5) + '" fill="none" stroke="' + t.green + '" stroke-width="' + t.b(1.5) + '"/>';

  for (var f2 = 0; f2 <= maxFret; f2++) {
    var cx2 = f2 === 0 ? openX : nutX + (f2 - 0.5) * fretW;
    s += '<text x="' + cx2 + '" y="' + (padT + boxH + 20) + '" text-anchor="middle" font-size="' + t.b(7.5)
      +  '" fill="' + t.text2 + '">' + f2 + '</text>';
  }

  return s + '</svg>';
}

/* ══════════════════════════════════════════════════════════════
   NATURAL NOTES ON ONE STRING — full 6-string board for context,
   the target string highlighted green with every natural note
   (A-G, no sharps/flats) circled and lettered along it. Used for
   the "say every natural note" drill figures (step-figure images),
   replacing 6 hand-duplicated static SVGs with one generator.
   ══════════════════════════════════════════════════════════════ */
var STRING_NATURALS = {
  lowE:  [[0,'E'],[1,'F'],[3,'G'],[5,'A'],[7,'B'],[8,'C'],[10,'D'],[12,'E']],
  A:     [[0,'A'],[2,'B'],[3,'C'],[5,'D'],[7,'E'],[8,'F'],[10,'G'],[12,'A']],
  D:     [[0,'D'],[2,'E'],[3,'F'],[5,'G'],[7,'A'],[9,'B'],[10,'C'],[12,'D']],
  G:     [[0,'G'],[2,'A'],[4,'B'],[5,'C'],[7,'D'],[9,'E'],[10,'F'],[12,'G']],
  B:     [[0,'B'],[1,'C'],[3,'D'],[5,'E'],[6,'F'],[8,'G'],[10,'A'],[12,'B']],
  highE: [[0,'E'],[1,'F'],[3,'G'],[5,'A'],[7,'B'],[8,'C'],[10,'D'],[12,'E']],
};
var NATURALS_LIGHT_GREEN = '#eaf3de';

function localStringNaturalsSvg(kind, opts){
  var allNotes = STRING_NATURALS[kind];
  if (!allNotes) return null;
  var maxFret = (opts && opts.maxFret) || 12;
  var notes = allNotes.filter(function(pair){ return pair[0] <= maxFret; });
  return localStringNotesSvg(kind, notes, opts);
}
/* Same board as localStringNaturalsSvg, but the circled/lettered notes along
   the target string are an explicit [fret, label] list instead of always
   being STRING_NATURALS — lets a figure show only the notes a specific
   melody uses (sharps included), like the In-Class Activities Happy
   Birthday figures. localStringNaturalsSvg is just this with the full
   natural-note table. */
function localStringNotesSvg(kind, notes, opts){
  var sNum = STRING_KIND_TO_NUM[kind];
  if (!sNum || !notes) return null;
  var t = gdTheme(opts);
  var maxFret = (opts && opts.maxFret) || 12;

  var W = 640, H = 244, padL = 62, padR = 20, padT = 22, padB = 56;
  var openW = 26;
  var fretW = (W - padL - padR - openW) / maxFret;
  var boxH = H - padT - padB;
  var strGap = boxH / 5;
  var nutX = padL + openW;
  var fretX = function(f){ return nutX + f * fretW; };
  var midY = padT + 2.5 * strGap;

  var s = gdOpen(W, H, t, opts, "-apple-system,'Segoe UI',Roboto,Arial,sans-serif") + gdGround(W, H, t);

  FRETBOARD_INLAYS.filter(function(f){ return f <= maxFret; }).forEach(function(f){
    var cx = nutX + (f - 0.5) * fretW;
    s += '<circle cx="' + cx + '" cy="' + midY + '" r="' + t.b(3) + '" fill="' + t.text3 + '" opacity="0.35"/>';
    if (f === 12) {
      s += '<circle cx="' + cx + '" cy="' + (midY - strGap) + '" r="' + t.b(3) + '" fill="' + t.text3 + '" opacity="0.35"/>';
      s += '<circle cx="' + cx + '" cy="' + (midY + strGap) + '" r="' + t.b(3) + '" fill="' + t.text3 + '" opacity="0.35"/>';
    }
  });

  for (var f1 = 1; f1 <= maxFret; f1++) {
    var x = fretX(f1);
    s += '<line x1="' + x + '" y1="' + padT + '" x2="' + x + '" y2="' + (padT + boxH)
      +  '" stroke="' + t.text3 + '" stroke-width="' + t.b(1) + '"/>';
  }
  s += '<rect x="' + (nutX - 2.5) + '" y="' + (padT - 2) + '" width="5" height="' + (boxH + 4) + '" fill="' + t.text + '" rx="1"/>';

  for (var n = 1; n <= 6; n++) {
    var y = padT + (n - 1) * strGap;
    var isTarget = n === sNum;
    var stroke = isTarget ? t.green : t.text3;
    var sw = t.b(isTarget ? 2.6 : 1);
    s += '<line x1="' + padL + '" y1="' + y + '" x2="' + fretX(maxFret) + '" y2="' + y
      +  '" stroke="' + stroke + '" stroke-width="' + sw + '" stroke-linecap="round"/>';
    var labelColor = isTarget ? t.green : t.text2;
    var labelWeight = isTarget ? '600' : '400';
    s += '<text x="' + (padL - 8) + '" y="' + y + '" text-anchor="end" dominant-baseline="central" font-size="'
      +  t.b(13) + '" font-weight="' + labelWeight + '" fill="' + labelColor + '">' + STRING_NUM_TO_LABEL[n] + '</text>';
  }

  var targetY = padT + (sNum - 1) * strGap, openX = padL + openW / 2;
  notes.forEach(function(pair){
    var fret = pair[0], note = pair[1];
    var cx = fret === 0 ? openX : nutX + (fret - 0.5) * fretW;
    var isOpen = fret === 0;
    s += '<circle cx="' + cx + '" cy="' + targetY + '" r="' + t.b(12) + '" fill="' + (isOpen ? t.bg : NATURALS_LIGHT_GREEN)
      +  '" stroke="' + t.green + '" stroke-width="' + t.b(1.8) + '"/>';
  });
  s += '<g font-size="' + t.b(13) + '" font-weight="700" fill="' + t.text + '" text-anchor="middle" dominant-baseline="central">';
  notes.forEach(function(pair){
    var fret = pair[0], note = pair[1];
    var cx = fret === 0 ? openX : nutX + (fret - 0.5) * fretW;
    s += '<text x="' + cx + '" y="' + targetY + '">' + gdEsc(note) + '</text>';
  });
  s += '</g>';

  s += '<g font-size="' + t.b(12) + '" fill="' + t.text2 + '" text-anchor="middle">';
  for (var f2 = 0; f2 <= maxFret; f2++) {
    var cx2 = f2 === 0 ? openX : nutX + (f2 - 0.5) * fretW;
    s += '<text x="' + cx2 + '" y="' + (padT + boxH + 30) + '">' + f2 + '</text>';
  }
  s += '</g>';

  return s + '</svg>';
}

/* ══════════════════════════════════════════════════════════════
   SINGLE NOTE ON THE FRETBOARD
   Strings drawn top→bottom: high E (top) to low E (bottom),
   matching TAB convention (highest pitch on top — the reverse
   of the view looking down at your own guitar).
   Open notes sit to the LEFT of the nut.
   ══════════════════════════════════════════════════════════════ */
function ordinal(n){
  // Spanish: frets are masculine ("el traste 6.º"). String numbers are
  // feminine and are spelled out in the diagram.string* keys instead.
  if (gdLang() === 'es') return n + '.º';
  var s = ['th','st','nd','rd'], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}
function noteFullLabel(note, fret, kind){
  var str = STRING_SHORT_LABEL[kind] || kind;
  return fret === 0
    ? gdT('diagram.noteOpen', note + ' · ' + str + ' open',
          { note: note, string: str })
    : gdT('diagram.noteFret', note + ' · ' + str + ' string, ' + ordinal(fret) + ' fret',
          { note: note, string: str, ord: ordinal(fret), fret: fret });
}
function localNoteSvg(kind, fret, note, opts){
  var sNum = STRING_KIND_TO_NUM[kind];
  if (!sNum) return null;
  var fr = Number(fret);
  if (isNaN(fr) || fr < 0) return null;
  var t = gdTheme(opts);

  /* Same 1.35x gutters as localStringFretboardSvg — see the note there. */
  var W = 300, H = 92, padL = 56, padR = 10, padT = 7, padB = 28;
  var openW = 16;
  var maxFret = Math.max(8, fr + 1);
  var fretW = (W - padL - padR - openW) / maxFret;
  var boxH = H - padT - padB;
  var strGap = boxH / 5;
  var nutX = padL + openW;
  var fretX = function(f){ return nutX + f * fretW; };

  var s = gdOpen(W, H, t, opts, "-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif") + gdGround(W, H, t);

  FRETBOARD_INLAYS.filter(function(f){ return f <= maxFret; }).forEach(function(f){
    var cx = nutX + (f - 0.5) * fretW, cy = padT + boxH / 2;
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + t.b(2) + '" fill="' + t.text3 + '" opacity="0.35"/>';
    if (f === 12) {
      s += '<circle cx="' + cx + '" cy="' + (cy - 8) + '" r="' + t.b(2) + '" fill="' + t.text3 + '" opacity="0.35"/>';
      s += '<circle cx="' + cx + '" cy="' + (cy + 8) + '" r="' + t.b(2) + '" fill="' + t.text3 + '" opacity="0.35"/>';
    }
  });

  for (var f1 = 1; f1 <= maxFret; f1++) {
    var x = fretX(f1);
    s += '<line x1="' + x + '" y1="' + padT + '" x2="' + x + '" y2="' + (padT + boxH)
      +  '" stroke="' + t.text3 + '" stroke-width="' + t.b(0.7) + '"/>';
  }
  s += '<rect x="' + (nutX - 1.5) + '" y="' + (padT - 1.5) + '" width="3" height="' + (boxH + 3) + '" fill="' + t.text + '" rx="0.5"/>';

  for (var n = 1; n <= 6; n++) {
    var y = padT + (n - 1) * strGap;
    s += '<line x1="' + padL + '" y1="' + y + '" x2="' + fretX(maxFret) + '" y2="' + y
      +  '" stroke="' + t.text3 + '" stroke-width="' + t.b(0.7) + '"/>';
    s += '<text x="' + (padL - 5) + '" y="' + y + '" text-anchor="end" dominant-baseline="central" font-size="'
      +  t.b(8) + '" fill="' + t.text2 + '">' + STRING_NUM_TO_LABEL[n] + '</text>';
  }

  for (var f2 = 0; f2 <= maxFret; f2++) {
    var cx2 = f2 === 0 ? padL + openW / 2 : nutX + (f2 - 0.5) * fretW;
    s += '<text x="' + cx2 + '" y="' + (padT + boxH + 20) + '" text-anchor="middle" font-size="' + t.b(7.5)
      +  '" fill="' + t.text2 + '">' + f2 + '</text>';
  }

  var targetY = padT + (sNum - 1) * strGap;
  var targetX = fr === 0 ? padL + openW / 2 : nutX + (fr - 0.5) * fretW;
  var isOpenNote = fr === 0;
  if (isOpenNote) {
    s += '<circle cx="' + targetX + '" cy="' + targetY + '" r="' + t.b(6.5) + '" fill="none" stroke="' + t.text + '" stroke-width="' + t.b(1.4) + '"/>';
  } else {
    s += '<circle cx="' + targetX + '" cy="' + targetY + '" r="' + t.b(6.5) + '" fill="' + t.text + '"/>';
  }
  if (note) {
    var textFill = isOpenNote ? t.text : t.bg;
    s += '<text x="' + targetX + '" y="' + targetY + '" text-anchor="middle" dominant-baseline="central" font-size="'
      +  t.b(7.5) + '" font-weight="600" fill="' + textFill + '">' + gdEsc(note) + '</text>';
  }

  return s + '</svg>';
}

/* ══════════════════════════════════════════════════════════════
   CONTACT SHEET — every chord in one image. Slides / wall chart
   only; never used by the site.
   ══════════════════════════════════════════════════════════════ */
function chordSheetSvg(names, opts){
  names = names && names.length ? names : Object.keys(CHORD_DIAGRAMS);
  opts = Object.assign({ theme: 'slide' }, opts || {});
  var t = gdTheme(opts);
  var px = opts.px != null ? opts.px : 3;
  var cols = opts.cols || 5;
  var CW = 96, CH = 120, GAP = 8;
  var rows = Math.ceil(names.length / cols);
  var W = cols * CW + (cols + 1) * GAP;
  var H = rows * CH + (rows + 1) * GAP;

  var s = '<svg xmlns="http://www.w3.org/2000/svg" width="' + Math.round(W * px) + '" height="' + Math.round(H * px)
        + '" viewBox="0 0 ' + W + ' ' + H + '" font-family="' + GD_SANS + '">';
  s += '<rect width="' + W + '" height="' + H + '" fill="' + t.bg + '"/>';
  names.forEach(function(name, i){
    var cx = GAP + (i % cols) * (CW + GAP);
    var cy = GAP + Math.floor(i / cols) * (CH + GAP);
    var inner = chordSvg(name, Object.assign({}, opts, { px: 0, label: name }));
    if (!inner) return;
    var body = inner.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '');
    s += '<g transform="translate(' + cx + ',' + cy + ')">' + body + '</g>';
  });
  return s + '</svg>';
}

/* Convenience alias used by the CLI and slide builds. */
function chordSvg(name, opts){
  var cfg = CHORD_DIAGRAMS[name];
  if (!cfg) return null;
  return chordDiagramSVG(cfg, Object.assign({ theme: 'slide' }, opts || {}));
}

/* Node entry point (tools/guitar-diagrams-cli.mjs). No effect in a browser. */
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    GUITAR_DIAGRAM_THEMES, GD_SITE_BOOST, CHORD_DIAGRAMS, STRING_DIAGRAMS, STRING_LABELS,
    STRING_KIND_TO_NUM, STRING_SHORT_LABEL, STRING_NUM_TO_LABEL, FRETBOARD_INLAYS,
    STRING_NATURALS,
    chordDiagramSVG, localChordSvg, localStringSvg, localStringFretboardSvg,
    localStringNaturalsSvg, localStringNotesSvg, localNoteSvg, noteFullLabel, ordinal, chordSvg, chordSheetSvg,
  };
}
