/* ══ LYRIC SHEET — a practice card drawn as a chord sheet PDF ═══════════
   (Jonathan, 2026-10-19; ca-38.) `card.sheet` names a PDF in sheets/ — his
   own chord sheet, saved from Word — and the card shows it AS IS, lyrics and
   all, in place of the tab. Everything else is the practice card unchanged:
   Play song, the four speeds, the Guitar switch, the Metronome, the checks,
   pcFrame's clock and pcLocate. Only the marks differ:
     - the DOT sits just left of the chord being played. It fills in on
       every BEAT (2026-10-26 — not on every strum: the record's strumming
       is not consistent) and goes hollow between beats; a faint ring marks
       the next chord;
     - "This bar" counts 1 + 2 + 3 + 4 + and marks where each chord starts
       (a "+" cell too, never lit), lighting the beat cell only, sticky at
       the top of the sheet so it stays on screen; a 6/8 track (countSix)
       counts 1-6 and lights all six, as its chord grid does (COUNT IN SIX);
     - the page follows the line being played, keeping it as high as it can
       go (THE SHEET'S TOP, pcSheetFollow).
   Where the chords are is read from the PDF's TEXT, never typed into code:
   every word on a line made only of chord names is a chord, in reading
   order, a two-column page column by column. Chord n on the sheet is the
   card's n-th chord CHANGE (a repeated strum of the same chord is the same
   chord name), so the sheet must have exactly one name per change —
   checks.mjs 1bf2 holds that, and the console preview says so if it breaks.
   pdf.js (vendor/pdfjs, Mozilla, Apache-2.0) draws the page; it loads only
   when a sheet card is on screen. Vendored, not a CDN: the CSP in
   index.html runs scripts from this origin only (plus Google/Firebase). */
/* The sheet's dot fills on each beat and stays filled for this share of a
   beat, and never less than the lead plus PC_SHEET_SOLID_AFTER: it lights
   PC_LEAD before the beat, so it must still be filled when the beat is heard
   (at 0.175 s ahead it went hollow before the beat on Sweet Child). Never a
   whole beat, or it would never go hollow. With PC_LEAD 0 the floor never
   acts below 250 BPM; it acts under `?snipcal=1&lead=<ms>` (up to 300 ms),
   and checks.mjs 1bf tests it there (W17, 2026-11-17). */
const PC_SHEET_SOLID = 0.42;      // beats the dot stays filled after a beat
const PC_SHEET_SOLID_AFTER = 0.1; // real seconds it stays filled after the beat is heard, at least
function pcSheetSolidSec(beatSec){
  const b = beatSec || 0.5;
  return Math.min(0.9 * b, Math.max(0.08, b * PC_SHEET_SOLID, pcLead() + PC_SHEET_SOLID_AFTER));
}
const PC_SHEET_MAX_SCALE = 1.9;   // CSS px per PDF point at most (chord names ~19px)
const PC_SHEET_CHORD_RE = /^[A-G](#|b)?(maj|min|m|dim|aug|sus|add|\+|°|ø|[0-9])*(\/[A-G](#|b)?)?$/;
function pcSheetLoadPdfjs(){
  return loadScriptOnce('vendor/pdfjs/pdf.min.js').then(() => {
    if(!window.pdfjsLib) throw new Error('pdf.js did not load');
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'vendor/pdfjs/pdf.worker.min.js';
    return window.pdfjsLib;
  });
}
/* One parse per PDF: EVERY page (2026-11-03 — "the cure" runs to three
   pages, Sweet Child to two; ca-38 is one), and every chord name on them in
   reading order. The pages are stacked into one tall sheet: each is cropped
   to its words (pages share one left/right edge so they line up) and placed
   under the one before, so a token's x0/y0 are in that sheet's PDF points
   and `crop` is the whole stack ({ x: 0, y: 0, w, h }). Reading order is
   page by page, and on a page column by column — or, with `cols` 1
   (card.sheetColumns: 1, a one-column chord-over-lyric sheet), line by line
   with no column split: a chord line's wide gaps are not a gutter there.
   ONE LONG COLUMN (Jonathan, 2026-11-17: "you could cut the pdf in half and
   just keep scrolling so it doesn't have columns"). On screen a two-column
   page is drawn in BANDS, stacked: the page's header (title, chord boxes,
   rule: everything above the columns), then its left column, then its right
   column under it (pcSheetSplit); page 2 follows the same way. Display only:
   the PDF, card.sheetColumns, the reading order of `toks` and every
   beat-to-chord mapping are unchanged. A band is { sx, sy, sw, sh } (PDF
   points of its page) drawn at { dx, dy } of the sheet, and pcSheetPlace is
   the one map from a page's points to the sheet's: `toks` are built through
   it, so the dot, the pill, the hit boxes and the lines the follow aims at
   all use the stacked sheet. The text keeps today's size (`crop.w` stays the
   page width). The Print button prints today's two columns (`printPages`,
   a second canvas, pcSheetDraw). A page with no right-column chord line, or
   no clean cut between its columns, is drawn whole as before
   (`fellBack`: its page numbers). */
/* A PRIVATE SHEET (2026-11-18, the Lyrics view of a private song): card.sheet 'private:<id>' names a pdf in the
   song-file store (app/songfiles.js, A CHORD SHEET), read only while someone is signed in, as its song is. pdf.js is
   handed its bytes (songFileLoadBytes): the CSP has no blob: in connect-src. A load that fails says why in the card
   (PC_SHEET_FILE_LINES: the song-file loader's codes; anything else is ca.sheetFailed). */
const PC_SHEET_FILE_LINES = { signin: 'ca.sheetSignIn', denied: 'ca.sheetNotAllowed', limit: 'ca.sheetLimit', offline: 'ca.sheetOffline', notready: 'ca.sheetNotReady', clock: 'ca.sheetClock' };
function pcSheetFailLine(e){
  const c = e && e.code;
  return t(typeof c === 'string' && Object.prototype.hasOwnProperty.call(PC_SHEET_FILE_LINES, c) ? PC_SHEET_FILE_LINES[c] : 'ca.sheetFailed');
}
function pcSheetPrivateId(url){ return typeof songFileId === 'function' ? songFileId(url) : null; }
const pcSheetModels = {};
function pcSheetPlace(b, X, Y){ return { x: b.dx + (X - b.sx), y: b.dy + (Y - b.sy) }; }
function pcSheetModel(url, cols){
  const one = cols === 1, key = url + (one ? '#1' : '');
  // Signed out: a private sheet read earlier in this tab is not drawn again (songFileSrc's rule for its song).
  const priv = pcSheetPrivateId(url);
  if(priv && !songFileHost().user) return Promise.reject(songFileErr('signin'));
  if(pcSheetModels[key]) return pcSheetModels[key];
  pcSheetModels[key] = pcSheetRead(async () => priv ? { data: await songFileLoadBytes(priv) } : url, one);
  pcSheetModels[key].catch(() => { delete pcSheetModels[key]; });   // a failed load can be tried again
  return pcSheetModels[key];
}
/* One PDF read into the model above. src() gives what pdf.js's getDocument takes (a URL, or { data: bytes }). Shared by
   pcSheetModel and the console's Lyrics sheet row (teacher-sb-sheet.js: a pdf picked on the Mac, read before it is
   added to a built song). A PDF with no text at all (a scan, a photo) throws code 'notext'. */
async function pcSheetRead(src, one){
  const lib = await pcSheetLoadPdfjs();
  const doc = await lib.getDocument(await src()).promise;
  const pages = [];
  for(let pn = 1; pn <= doc.numPages; pn++) pages.push(await pcSheetPage(await doc.getPage(pn), one));
  const all = pages.flatMap(P => P.words);
  if(!all.length){ const e = new Error('the PDF has no text — save it from Word, not as a scan'); e.code = 'notext'; throw e; }
  const pad = 14, W = Math.max(...pages.map(P => P.width));
  const x = Math.max(0, Math.min(...all.map(w => w.x0)) - pad);
  const w = Math.min(W, Math.max(...all.map(w2 => w2.x1)) + pad) - x;
  let top = 0, dy = 0, lineOff = 0;
  const toks = [], fellBack = [], marks = [];
  const used = pages.filter(P => P.words.length);
  used.forEach((P, pi) => {
    P.y = Math.max(0, Math.min(...P.words.map(w2 => w2.y0)) - pad);
    P.h = Math.min(P.height, Math.max(...P.words.map(w2 => w2.y1)) + pad) - P.y;
    P.top = top; top += P.h;
    const split = one ? null : pcSheetSplit(P, x, w, pi === 0, pi === used.length - 1);
    if(!one && !split && P.toks.some(T => T.col === 1)) fellBack.push(pages.indexOf(P) + 1);
    let sy = P.y, sh = P.h;
    if(!one && !split){
      // A one-column page of a two-column sheet: joined to the page before with a normal line gap, as the columns are.
      const half = pcSheetHalfGap(P.words), ys = P.words.map(w2 => w2.y0), ye = P.words.map(w2 => w2.y1);
      if(pi > 0) sy = Math.max(P.y, Math.min(...ys) - half);
      sh = (pi < used.length - 1 ? Math.min(P.y + P.h, Math.max(...ye) + half) : P.y + P.h) - sy;
    }
    P.bands = split || [{ sx: x, sy, sw: w, sh, dx: 0 }];
    P.bands.forEach(b => { b.dy = dy; dy += b.sh; });
    P.marks.forEach(m => marks.push({ kind: m.kind, at: toks.length + m.at }));
    P.toks.forEach(T => {
      const b = P.bands.length === 1 ? P.bands[0] : P.bands.find(b2 => b2.col === T.col);
      const a = pcSheetPlace(b, T.x0, T.y0), z = pcSheetPlace(b, T.x1, T.y1);
      toks.push({ name: T.name, x0: a.x, x1: z.x, y0: a.y, y1: z.y, col: split ? T.col : null, page: pages.indexOf(P) + 1, line: lineOff + T.line });
    });
    lineOff += P.lineCount;
  });
  return { pages: used.map(P => ({ page: P.page, x, y: P.y, h: P.h, top: P.top, bands: P.bands })), toks, marks,
    crop: { x: 0, y: 0, w, h: dy }, printH: top, split: !one && used.some(P => P.bands.length > 1), fellBack, doc };
}
/* A two-column page cut into bands for ONE LONG COLUMN (pcSheetModel), or
   null: draw the page whole. The columns are the ones pcSheetPage reads in
   (its chord lines' `col`). The cut is the middle of the widest strip,
   between the left column's chord names and the right column's, that no
   word of the columns crosses. The columns start at each side's first chord
   line, taken up over lines no more than 2.5 line pitches apart (a heading,
   a lyric line with no chords); everything above is the header, drawn whole
   once. Each column band is cut half a line gap above its first word and
   below its last, so column 1's last line and column 2's first sit one
   normal line gap apart. `first` / `last`: the sheet's first / last page,
   which keep the usual 14 pt margin at the top / bottom. */
// Line pitch: the usual distance between baselines; half of the usual gap between one line's words and the next's.
function pcSheetPitch(ws){
  const ys = [...new Set(ws.map(wd => Math.round(wd.y1 * 2) / 2))].sort((p, q) => p - q), d = [];
  for(let i = 1; i < ys.length; i++) d.push(ys[i] - ys[i - 1]);
  d.sort((p, q) => p - q);
  return d.length ? d[Math.floor(d.length / 2)] : 0;
}
function pcSheetHalfGap(ws){
  const pitch = pcSheetPitch(ws), h = ws.map(wd => wd.y1 - wd.y0).sort((p, q) => p - q)[Math.floor(ws.length / 2)] || 0;
  return Math.max(1, (pitch - h) / 2);
}
const PC_SHEET_ONE_ALIGN = 'left';   // where column 2 goes under column 1: 'left' (its text at column 1's left edge) or 'center'
function pcSheetSplit(P, x, w, first, last){
  const L = P.toks.filter(T => T.col === 0), R = P.toks.filter(T => T.col === 1);
  if(!L.length || !R.length) return null;
  const a = Math.max(...L.map(T => T.x1)), b = Math.min(...R.map(T => T.x0));
  if(!(b > a)) return null;
  const g0 = (a + b) / 2;
  const cross = P.words.filter(wd => wd.x0 < g0 && wd.x1 > g0);
  const sideOf = wd => (wd.x1 <= g0 ? 0 : 1);
  const plain = P.words.filter(wd => !cross.includes(wd));
  const pitch = pcSheetPitch(plain.filter(wd => sideOf(wd) === 0));
  if(!(pitch > 0)) return null;
  // Each side's start: its first chord line, walked up over lines no more than 2.5 pitches apart.
  const startOf = (side, toks1) => {
    const lines = [...new Set(plain.filter(wd => sideOf(wd) === side).map(wd => wd.y0))].sort((p, q) => p - q);
    let i = lines.findIndex(y => y >= Math.min(...toks1.map(T => T.y0)) - 0.5);
    if(i < 0) return null;
    while(i > 0 && lines[i] - lines[i - 1] <= 2.5 * pitch && !cross.some(wd => wd.y1 > lines[i - 1] && wd.y0 < lines[i])) i--;
    return lines[i];
  };
  const s0 = startOf(0, L), s1 = startOf(1, R);
  if(s0 == null || s1 == null) return null;
  const colTop = Math.min(s0, s1);
  if(cross.some(wd => wd.y1 > colTop)) return null;   // a word across the gutter inside the columns
  const inCols = plain.filter(wd => wd.y0 >= colTop - 0.5);
  // The cut: the middle of the widest strip of [a, b] no column word crosses.
  const spans = inCols.filter(wd => wd.x1 > a && wd.x0 < b).map(wd => [Math.max(a, wd.x0), Math.min(b, wd.x1)]).sort((p, q) => p[0] - q[0]);
  let best = null, at = a;
  spans.forEach(([p, q]) => { if(p - at > (best ? best[1] - best[0] : 0)) best = [at, p]; at = Math.max(at, q); });
  if(b - at > (best ? best[1] - best[0] : 0)) best = [at, b];
  if(!best || best[1] - best[0] < 1) return null;
  const g = (best[0] + best[1]) / 2;
  const left = inCols.filter(wd => wd.x1 <= g), right = inCols.filter(wd => wd.x0 >= g);
  if(left.length + right.length !== inCols.length) return null;
  if(L.some(T => T.x1 > g) || R.some(T => T.x0 < g)) return null;
  const half = pcSheetHalfGap(inCols), pad = 14;
  const ext = ws => ({ y0: Math.min(...ws.map(wd => wd.y0)), y1: Math.max(...ws.map(wd => wd.y1)), x0: Math.min(...ws.map(wd => wd.x0)), x1: Math.max(...ws.map(wd => wd.x1)) });
  const eL = ext(left), eR = ext(right);
  const header = P.words.some(wd => wd.y1 <= colTop);
  const pageBot = P.y + P.h;
  const clampY = y => Math.max(P.y, Math.min(pageBot, y));
  const bands = [];
  let lTop = first ? P.y : clampY(eL.y0 - half);
  if(header){ const hb = clampY(colTop - half); bands.push({ sx: x, sy: P.y, sw: w, sh: hb - P.y, dx: 0, col: null }); lTop = hb; }
  const lBot = clampY(eL.y1 + half), rTop = clampY(Math.max(header ? colTop - half : eR.y0 - half, eR.y0 - half)), rBot = clampY(eR.y1 + (last ? pad : half));
  const cw = Math.max(eL.x1 - eL.x0, eR.x1 - eR.x0);
  const t0 = PC_SHEET_ONE_ALIGN === 'center' ? (w - cw) / 2 : eL.x0 - x;   // where each column's text starts, in sheet points
  bands.push({ sx: x, sy: lTop, sw: g - x, sh: lBot - lTop, dx: t0 - (eL.x0 - x), col: 0 });
  bands.push({ sx: g, sy: rTop, sw: x + w - g, sh: rBot - rTop, dx: t0 - (eR.x0 - g), col: 1 });
  return bands.every(bd => bd.sh > 0 && bd.sw > 0) ? bands : null;
}
/* One page of a sheet: its words and its chord names in reading order, in
   that page's PDF points with y running down the page. */
async function pcSheetPage(page, one){
  const vp = page.getViewport({ scale: 1 });
  const tc = await page.getTextContent();
  const words = [];
  tc.items.forEach(it => {
    if(!it.str || !it.str.trim()) return;
    const [a, b, , d, e, f] = it.transform;
    const size = Math.hypot(a, b) || Math.abs(d) || it.height || 10;
    const cw = it.width / it.str.length;   // the sheets are Courier: every character is one width
    const re = /\S+/g; let m;
    while((m = re.exec(it.str))){
      const x0 = e + m.index * cw, x1 = x0 + m[0].length * cw;
      const r = vp.convertToViewportRectangle([x0, f - size * 0.22, x1, f + size * 0.78]);
      words.push({ s: m[0], x0: Math.min(r[0], r[2]), x1: Math.max(r[0], r[2]), y0: Math.min(r[1], r[3]), y1: Math.max(r[1], r[3]) });
    }
  });
  // Lines by baseline; on a two-column sheet a wide gap past the middle of the page starts the second column.
  const byY = new Map();
  words.forEach(w => { const k = Math.round(w.y1); (byY.get(k) || byY.set(k, []).get(k)).push(w); });
  const segs = [];
  byY.forEach(ws => {
    ws.sort((p, q) => p.x0 - q.x0);
    let cur = [ws[0]];
    for(let i = 1; i < ws.length; i++){
      if(!one && ws[i].x0 - ws[i - 1].x1 > vp.width * 0.08 && ws[i].x0 > vp.width * 0.4){ segs.push(cur); cur = []; }
      cur.push(ws[i]);
    }
    segs.push(cur);
  });
  const isChords = ws => ws.every(w => PC_SHEET_CHORD_RE.test(w.s));
  const colOf = ws => (!one && ws[0].x0 > vp.width * 0.45 ? 1 : 0);
  const lines = segs.filter(isChords);
  lines.forEach(ws => { ws.col = colOf(ws); });
  lines.sort((p, q) => p.col - q.col || p[0].y0 - q[0].y0);
  const toks = lines.flatMap((ws, li) => ws.map(w => ({ name: w.s, x0: w.x0, x1: w.x1, y0: w.y0, y1: w.y1, col: ws.col, line: li })));
  /* THE LOOSE READ's marks (pcSheetAlign): a section header line ("[Verse]") and a "(Repeat to end)" line, each with
     `at`, how many chord names come before it in reading order. Kinds and places only: no words are kept. */
  const marks = [];
  segs.forEach(ws => {
    if(isChords(ws)) return;
    const text = ws.map(w => w.s).join(' ');
    const kind = PC_SHEET_HEAD_RE.test(text) ? 'head' : PC_SHEET_REPEAT_RE.test(text) ? 'repeat' : '';
    if(!kind) return;
    const col = colOf(ws), y = ws[0].y0;
    marks.push({ kind, col, y, at: toks.filter(T => T.col < col || (T.col === col && T.y0 < y)).length });
  });
  marks.sort((p, q) => p.at - q.at || p.col - q.col || p.y - q.y);
  return { page, width: vp.width, height: vp.height, words, toks, marks, lineCount: lines.length };
}
/* Which sheet chord each note of the card is: tok[si][rep][ni]. A rest is not a
   chord on the sheet: the dot stays on the chord before it. The count
   goes up at every chord CHANGE across the whole song, laps included —
   and at the first chord of every lap of a section named in
   card.sheetNamedAgain (Jonathan, 2026-11-03: Sweet Child's sheet writes
   D5 at the start of each intro line, verse half and riff lap, where the
   D5 is still ringing from before). */
function pcSheetMap(L){
  const tok = [], start = [];
  let n = -1, prev = null;
  L.sections.forEach((S, si) => {
    tok[si] = [];
    for(let r = 0; r < S.reps; r++){
      tok[si][r] = S.notes.map((nt, ni) => {
        if(!nt.rest && (nt.note !== prev || (S.nameAgain && ni === 0))){ n++; prev = nt.note; start[n] = { si, rep: r, name: nt.note }; }
        return n;
      });
    }
  });
  return { tok, start, count: n + 1 };
}
/* ── THE LOOSE READ (2026-11-18, Jonathan: a Lyrics view for private songs, built songs first) ──
   A card with card.sheetRead 'loose' (a built song's Lyrics view, app/builtsongs.js) reads a sheet written the way
   chord sheets are written on the web, not one name per chord change. pcSheetAlign matches the sheet's chord names,
   in reading order, to the card's chord CHANGES (as pcSheetMap counts them) under four rules, and nothing looser:
     R1  a name is folded to what a card can name before it is compared: a 7, maj7, 6, 9, add or sus chord is its
         triad (E7 = E, Dsus4 = D), a slash chord its chord (G/B = G), m7 / m6 / m9 / min the minor (Am7 = Am),
         dim / aug / b5 / ° / ø stay apart, and a 5 chord matches the major or the minor on its root (A5 = A = Am).
         The root is a pitch: D#m = Ebm.
     R2  the chord names above the sheet's first section header ("[Intro]", a line that is only [ ... ]) are not the
         song: the chord boxes' labels at the top of the page. With no header, nothing is skipped.
     R3  a name written again (E7 E7 G G) is the same chord named again, bar by bar: a run of k names that fold to
         one chord is ONE change, the dot stepping from name to name across that change's bars (name j of k from
         bar j x bars / k). A run longer than the change's bars is a mismatch. A card that changes to a chord that
         folds to the same one (A, then A7) takes one name each.
     R4  a "(Repeat to end)" line after the sheet's last chord line plays that line round again for every change
         the card still has.
   Anything else is a mismatch: the dot stays off, as for any sheet that does not follow its card (pcSheetDraw), and
   `why` says where in one line, with `table` the card's sections lap by lap (what the card plays, what the sheet
   names there; ok true, false, or null after the first mismatch). For the console (P4, English).
   On a sheet written one name per change it gives pcSheetMap's map exactly (tools/sheet-align-test.mjs, the three
   coded sheet cards). The coded sheet cards (ca-38, ca-44, ca-45) keep pcSheetMap: no 'loose' on them. */
const PC_SHEET_HEAD_RE = /^\[[^\[\]]{1,40}\]$/;
const PC_SHEET_REPEAT_RE = /^\(?\s*(repeat\s+(to|till|until)\s+(the\s+)?(end|fade)|repetir\s+hasta\s+el\s+final)\s*\)?$/i;
const PC_SHEET_PC = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
// R1: { pc, q: '' | 'm' | '5' | 'dim' | 'aug' }, or null for a word that is not a chord name.
function pcSheetFold(name){
  const m = /^([A-G])(#|b)?([^/]*)(\/[A-G](#|b)?)?$/.exec(String(name || ''));
  if(!m) return null;
  const r = m[3];
  const q = r === '5' ? '5' : /^(dim|°|ø)|b5/.test(r) ? 'dim' : /^(aug|\+)/.test(r) ? 'aug' : /^(m(?!aj)|min)/.test(r) ? 'm' : '';
  return { pc: (PC_SHEET_PC[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? 11 : 0)) % 12, q };
}
function pcSheetSame(a, b){
  const x = pcSheetFold(a), y = pcSheetFold(b);
  return !!(x && y && x.pc === y.pc && (x.q === y.q || x.q === '5' || y.q === '5'));
}
/* The card's chord changes in play order (pcSheetMap's count), each with the beat it starts on and the bars it
   lasts (to the next change, or the end of the card), and every note's change and beat. */
function pcSheetChanges(L){
  const bpb = L.tr.beatsPerBar > 0 ? L.tr.beatsPerBar : 4;
  const ch = [], notes = [], laps = [];
  let prev = null, pos = 0;
  L.sections.forEach((S, si) => {
    notes[si] = [];
    for(let r = 0; r < S.reps; r++){
      laps.push({ si, rep: r, beat: pos, ch: ch.length });
      notes[si][r] = S.notes.map((nt, ni) => {
        const beat = pos + (ni ? S.beatEnds[ni - 1] : 0);
        if(!nt.rest && (nt.note !== prev || (S.nameAgain && ni === 0))){ ch.push({ si, rep: r, name: nt.note, beat }); prev = nt.note; }
        return { n: ch.length - 1, beat };
      });
      pos += S.bars * bpb;
    }
  });
  ch.forEach((c, i) => { c.bars = Math.max(1, Math.ceil(((i + 1 < ch.length ? ch[i + 1].beat : pos) - c.beat) / bpb - 1e-6)); });
  return { ch, notes, laps, bpb };
}
function pcSheetAlign(L, model){
  const toks = model.toks, marks = model.marks || [];
  const { ch, notes, laps, bpb } = pcSheetChanges(L);
  const head = marks.find(m => m.kind === 'head');
  const skip = head ? head.at : 0;                                             // R2
  const seq = [];
  for(let i = skip; i < toks.length; i++) seq.push(i);
  const real = seq.length;
  const last = toks.length ? toks[toks.length - 1].line : -1;
  const again = real && marks.some(m => m.kind === 'repeat' && m.at === toks.length) ? seq.filter(i => toks[i].line === last) : [];   // R4
  for(let n = 0; n < ch.length && again.length; n++) seq.push(...again);
  const lapOf = beat => { let k = 0; while(k + 1 < laps.length && laps[k + 1].beat <= beat + 1e-6) k++; return laps[k]; };
  const where = c => pcSheetWhere(L, c.si, c.rep);
  const own = [];
  let p = 0, why = '', bad = -1;
  for(let n = 0; n < ch.length; n++){
    const c = ch[n];
    if(p >= seq.length){ why = `The sheet runs out of chord names at chord change ${n + 1} (${c.name}, ${where(c)}): the card plays ${ch.length - n} more.`; bad = n; break; }
    const T = toks[seq[p]];
    if(!pcSheetSame(T.name, c.name)){ why = `Chord change ${n + 1} (${where(c)}): the card plays ${c.name}, the sheet's chord ${seq[p] + 1} is ${T.name}.`; bad = n; break; }
    let run = 1, same = 0;
    // R3, against the card's chord: on a power-chord card E and Em written in turn are one E5.
    while(p + run < seq.length && pcSheetSame(toks[seq[p + run]].name, c.name)) run++;
    while(n + 1 + same < ch.length && pcSheetSame(ch[n + 1 + same].name, c.name)) same++;
    const k = Math.max(1, run - same);
    if(k > c.bars){ why = `Chord change ${n + 1} (${where(c)}): the sheet names ${T.name} ${k} times in a row, but the card plays it for ${c.bars} bar${c.bars === 1 ? '' : 's'}.`; bad = n; break; }
    own[n] = { from: p, k };
    p += k;
  }
  if(!why && !ch.length) why = 'The card plays no chords.';
  if(!why && p < real){ why = `The sheet names ${real - p} more chord${real - p === 1 ? '' : 's'} after the card's last change (from chord ${seq[p] + 1}, ${toks[seq[p]].name}).`; bad = ch.length; }
  const ok = !why;
  const tok = notes.map(reps => reps.map(row => row.map(x => {
    const o = own[x.n];
    if(!o) return -1;
    const c = ch[x.n], off = Math.floor((x.beat - c.beat) / bpb + 1e-6);
    return seq[o.from + Math.min(o.k - 1, Math.floor(off * o.k / c.bars + 1e-6))];
  })));
  // A tap on a name starts the lap of the bar it names (the first time the song reaches it).
  const start = [];
  own.forEach((o, n) => {
    const c = ch[n];
    for(let j = 0; j < o.k; j++){
      const ti = seq[o.from + j];
      if(start[ti]) continue;
      const lp = lapOf(c.beat + Math.ceil(j * c.bars / o.k - 1e-6) * bpb);
      start[ti] = { si: lp.si, rep: lp.rep, name: toks[ti].name };
    }
  });
  const table = laps.map((lp, li) => {
    const to = li + 1 < laps.length ? laps[li + 1].ch : ch.length, mine = [];
    for(let n = lp.ch; n < to; n++) mine.push(n);
    return { where: pcSheetWhere(L, lp.si, lp.rep), card: mine.map(n => ch[n].name),
      sheet: mine.filter(n => own[n]).map(n => seq.slice(own[n].from, own[n].from + own[n].k).map(i => toks[i].name).join(' ')),
      ok: bad < 0 || mine.every(n => n < bad) ? true : mine.length && mine[0] > bad ? null : false };
  });
  return { ok, why, table, tok, start, count: ch.length, skipped: skip,
    cycled: own.filter(o => o.from >= real).length, folded: own.filter((o, n) => toks[seq[o.from]].name !== ch[n].name).length };
}
function pcSheetHtml(a, L, preview){
  const c = a.card;
  const many = L.sections.length > 1;
  const oneRound = typeof pcOneRound === 'function' && pcOneRound(L);   // a one-round card (ca-54) has no chips and no hint: Play starts the ladder
  const chips = many && !oneRound
    ? `<div class="pc-secs">` + pcSecButtonsHtml(L, preview) + pcLoopHtml(L, preview) + `</div>`
    : '';
  // A 6/8 track counts its bar 1-6, as the chord grid and the click do (COUNT IN SIX, app/cards.js).
  const cells = (L.tr.countSix ? ['1', '2', '3', '4', '5', '6'] : ['1', '+', '2', '+', '3', '+', '4', '+'].slice(0, L.tr.beatsPerBar * 2))
    .map(n => `<span class="pc-strip-cell"><span class="pc-strip-ch"></span><span class="pc-strip-n">${n}</span></span>`).join('');
  const title = (c.caption && tf(c, 'caption')) || '';
  return `<div class="pc-sheet" data-sheet="${escAttr(c.sheet)}">`
    + (title ? `<p class="pc-sheet-title">${escHtml(title)}</p>` : '')
    + `<p class="pc-status" aria-live="polite"></p>`
    + (oneRound ? '' : `<p class="pc-hint">${escHtml(t(L.rounds ? 'ca.roundHint' : 'ca.sheetTapHint'))}</p>`) + chips
    + `<div class="pc-sheet-bar"><span class="pc-sheet-where">${escHtml(pcSheetWhere(L, 0, 0))}</span>`
    +   `<span class="pc-strip" aria-hidden="true"><span class="pc-strip-label">${escHtml(t('ca.sheetThisBar'))}</span>${cells}</span></div>`
    + `<div class="pc-sheet-paper"><p class="pc-sheet-msg">${escHtml(t('ca.sheetLoading'))}</p></div>`
    + `</div>`;
}
function pcSheetWhere(L, si, rep){
  const S = L.sections[si];
  if(!S) return '';
  return tf(S.s, 'label') + (S.reps > 1 ? ' · ' + t('ca.cardRepOf', {what: tf(S.s, 'repLabel'), n: rep + 1, total: S.reps}) : '');
}
/* Draw every sheet on the page that has a width. A ResizeObserver redraws
   on a width change — the card opening (a closed card is 0 wide), the
   window, the rail collapsing. */
let pcSheetRO = null, pcSheetCols = [];
/* The fill changing (a window resized onto or off a big screen) leaves the
   column's CSS width alone, so the observer does not fire: redraw any sheet
   drawn at another fill. */
window.addEventListener('resize', () => {
  const fill = typeof siteFill === 'function' ? siteFill() : 1;
  pcSheetCols.forEach(col => { const p = col._sheetPaper; if(p && p.isConnected && p._sheetFill !== undefined && p._sheetFill !== fill) pcSheetDraw(p); });
});
function pcSheetScan(){
  /* Every renderClassActivities() builds a new sheet, and an observed column
     is never let go by itself: drop the ones that have left the page, and
     the paper (with its canvas) each one points at. */
  if(pcSheetRO) pcSheetCols = pcSheetCols.filter(col => {
    if(col.isConnected) return true;
    pcSheetRO.unobserve(col);
    col._sheetPaper = null;
    return false;
  });
  document.querySelectorAll('.pc-sheet-paper:not([data-watched])').forEach(paper => {
    paper.dataset.watched = '1';
    if(typeof ResizeObserver === 'function'){
      if(!pcSheetRO) pcSheetRO = new ResizeObserver(entries => entries.forEach(en => {
        const p = en.target, w = Math.round(en.contentRect.width);
        if(w > 0 && w !== p._sheetW){ p._sheetW = w; pcSheetDraw(p); }
      }));
      pcSheetRO.observe(paper.parentElement);   // the sheet column, not the paper (the paper takes its width from the drawing)
      paper.parentElement._sheetPaper = paper;
      pcSheetCols.push(paper.parentElement);
    } else pcSheetDraw(paper);
  });
}
async function pcSheetDraw(paperOrCol){
  const paper = paperOrCol._sheetPaper || paperOrCol;
  const root = paper.closest('.pc');
  const col = paper.parentElement;
  if(!root || !col || !paper.isConnected) return;
  const a = pcActivity(root), L = a && pcLayout(a);
  if(!L || !a.card.sheet) return;
  const job = paper._sheetJob = (paper._sheetJob || 0) + 1;
  const msg = text => { let m = paper.querySelector('.pc-sheet-msg'); if(!m){ m = document.createElement('p'); m.className = 'pc-sheet-msg'; paper.appendChild(m); } m.textContent = text; m.hidden = !text; };
  let model;
  try { model = await pcSheetModel(a.card.sheet, a.card.sheetColumns); }
  catch(e){ if(paper._sheetJob === job) msg(pcSheetFailLine(e)); return; }
  if(paper._sheetJob !== job || !paper.isConnected) return;
  const avail = col.clientWidth;
  if(!(avail > 0)) return;
  const { crop } = model;
  const scale = Math.min(avail / crop.w, PC_SHEET_MAX_SCALE);
  /* Screen pixels per CSS pixel: the display's own ratio times the big-screen
     fill (site-fill.js), which CSS zoom adds without changing
     devicePixelRatio; without it the sheet is blurred on a big screen. */
  const fill = typeof siteFill === 'function' ? siteFill() : 1;
  const dpr = Math.min((window.devicePixelRatio || 1) * fill, 3);
  let canvas = paper.querySelector('canvas:not(.pc-sheet-print)');
  if(!canvas){
    canvas = document.createElement('canvas');
    canvas.setAttribute('role', 'img');
    canvas.setAttribute('aria-label', t('ca.sheetAlt'));
    paper.insertBefore(canvas, paper.firstChild);
  }
  const k = scale * dpr;
  const off = document.createElement('canvas');   // draw off screen, then swap — no blank flash on a redraw
  off.width = Math.floor(crop.w * k); off.height = Math.floor(crop.h * k);
  // ONE LONG COLUMN: the two-column drawing, for the Print button only (pcSheetModel).
  const prn = model.split ? document.createElement('canvas') : null;
  if(prn){ prn.width = off.width; prn.height = Math.floor(model.printH * k); }
  /* Each page on a canvas of its own, then its bands placed on the sheet
     (pdf.js paints a page's whole canvas white, so pages can't share one). */
  try {
    const ctx = off.getContext('2d');
    for(const P of model.pages){
      const pc = document.createElement('canvas');
      pc.width = off.width; pc.height = Math.max(1, Math.floor(P.h * k));
      const vp = P.page.getViewport({ scale: k, offsetX: -P.x * k, offsetY: -P.y * k });
      await P.page.render({ canvasContext: pc.getContext('2d'), viewport: vp }).promise;
      if(paper._sheetJob !== job) return;
      P.bands.forEach(b => {
        const sx = Math.round((b.sx - P.x) * k), sy = Math.round((b.sy - P.y) * k), sw = Math.round(b.sw * k), sh = Math.round(b.sh * k);
        if(sw > 0 && sh > 0) ctx.drawImage(pc, sx, sy, sw, sh, Math.round(b.dx * k), Math.round(b.dy * k), sw, sh);
      });
      if(prn) prn.getContext('2d').drawImage(pc, 0, Math.floor(P.top * k));
    }
  }
  catch(e){ if(paper._sheetJob === job) msg(t('ca.sheetFailed')); return; }
  if(paper._sheetJob !== job || !paper.isConnected) return;
  canvas.width = off.width; canvas.height = off.height;
  canvas.getContext('2d').drawImage(off, 0, 0);
  let printCanvas = paper.querySelector('canvas.pc-sheet-print');
  if(prn && !printCanvas){ printCanvas = document.createElement('canvas'); printCanvas.className = 'pc-sheet-print'; printCanvas.setAttribute('aria-hidden', 'true'); canvas.after(printCanvas); }
  if(prn){ printCanvas.width = prn.width; printCanvas.height = prn.height; printCanvas.getContext('2d').drawImage(prn, 0, 0); }
  else if(printCanvas) printCanvas.remove();
  paper.style.width = crop.w * scale + 'px';
  paper._sheetFill = fill;
  msg('');
  // THE LOOSE READ on a card that asks for it (a built song's Lyrics view); every other sheet: one name per change.
  const loose = a.card.sheetRead === 'loose';
  const map = loose ? pcSheetAlign(L, model) : pcSheetMap(L);
  const ok = loose ? map.ok : map.count === model.toks.length && model.toks.every((T, i) => T.name === map.start[i].name);
  paper._sheet = { model, scale, map, ok };
  paper.querySelectorAll('.pc-sheet-hit, .pc-sheet-line').forEach(el => el.remove());
  if(!ok){
    /* The dot would land on the wrong chords — no dot at all. Say why in
       the console preview, where Jonathan checks a card before class. */
    if(root.dataset.preview === '1'){
      const bad = model.toks.findIndex((T, i) => !map.start[i] || T.name !== map.start[i].name);
      msg(loose ? map.why : t('ca.sheetMismatch', {sheet: model.toks.length, card: map.count, at: bad + 1}));
    }
    return;
  }
  const box = (T, padX, padY) => `left:${(T.x0 - crop.x - padX) * scale}px;top:${(T.y0 - crop.y - padY) * scale}px;width:${(T.x1 - T.x0 + 2 * padX) * scale}px;height:${(T.y1 - T.y0 + 2 * padY) * scale}px`;
  const html = model.toks.map((T, i) => {
    const at = map.start[i];
    if(!at) return '';   // a name the loose read skipped (R2: the chord boxes' labels) starts nothing
    return `<button type="button" class="pc-sheet-hit" style="${box(T, 2, 1.5)}" onclick="pcSheetStartAt(this,${i})" aria-label="${escAttr(t('ca.sheetStartAt', {chord: T.name, section: pcSheetWhere(L, at.si, at.rep)}))}"></button>`;
  }).join('');
  // The line being played, then the line the follow looks ahead to (THE SHEET'S LOOK-AHEAD); both invisible.
  paper.insertAdjacentHTML('beforeend', html + '<span class="pc-sheet-line" aria-hidden="true"></span><span class="pc-sheet-line pc-sheet-ahead" aria-hidden="true"></span>');
  ['pc-sheet-pill', 'pc-sheet-ghost', 'pc-sheet-dot'].forEach(cls => {
    if(!paper.querySelector('.' + cls)){ const el = document.createElement('span'); el.className = cls; el.setAttribute('aria-hidden', 'true'); paper.appendChild(el); }
  });
  const st = pcState && pcState.root === root ? pcState : null;
  /* Where the mark goes once the sheet is drawn. Playing: the chord being played. In a count-in (a section tap, then
     Lyrics pressed before the song came in; W23 R1-4): the first chord of the lap it counts in to, as pcStart's own
     pcSheetStarted marks it, line on screen and all (until 2026-11-18 chord 0 for up to 2.5 s). Stopped: the first
     chord of the section the card shows (a stop on Chorus 2 in Tab, then Lyrics; W23 R2-3), so chord 0 on a card
     just opened. */
  if(st && st.si < 0 && st.counting){ pcSheetStarted(st); return; }
  const shown = root.querySelector('.pc-sec.cur');
  const si = shown ? Math.max(0, Math.min(L.sections.length - 1, Number(shown.dataset.sec) || 0)) : 0;
  const cur = st && st.si >= 0 ? map.tok[st.si][st.rep][st.seq - st.L.sections[st.si].seqOff] : Math.max(0, map.tok[si][0][0]);
  pcSheetMark(paper, cur, false);
}
function pcSheetMark(paper, idx, hit, beatSec){
  const sh = paper._sheet;
  if(!sh || !sh.ok) return null;
  const T = sh.model.toks[idx];
  if(!T) return null;
  const { crop } = sh.model, s = sh.scale;
  const pill = paper.querySelector('.pc-sheet-pill'), dot = paper.querySelector('.pc-sheet-dot'), ghost = paper.querySelector('.pc-sheet-ghost');
  if(pill) pill.style.cssText = `left:${(T.x0 - crop.x - 2) * s}px;top:${(T.y0 - crop.y - 1.5) * s}px;width:${(T.x1 - T.x0 + 4) * s}px;height:${(T.y1 - T.y0 + 3) * s}px`;
  const mid = T2 => ((T2.y0 + T2.y1) / 2 - crop.y) * s;
  if(dot){
    dot.style.left = (T.x0 - crop.x) * s + 'px'; dot.style.top = mid(T) + 'px';
    if(hit){
      dot.style.setProperty('--pc-hit', pcSheetSolidSec(beatSec) + 's');
      dot.classList.remove('hit'); void dot.offsetWidth; dot.classList.add('hit');
    }
  }
  const N = sh.model.toks[idx + 1];
  if(ghost){ ghost.hidden = !N; if(N){ ghost.style.left = (N.x0 - crop.x) * s + 'px'; ghost.style.top = mid(N) + 'px'; } }
  // The line being played, with room for the lyric under it — what pcFollow keeps in view.
  const line = paper.querySelector('.pc-sheet-line:not(.pc-sheet-ahead)');
  pcSheetLineBox(sh, line, T);
  return line;
}
// Puts a .pc-sheet-line box over chord name T's line, with room for the lyric under it.
function pcSheetLineBox(sh, el, T){
  if(!el) return;
  const { crop } = sh.model, s = sh.scale;
  el.style.top = (T.y0 - crop.y - 3) * s + 'px'; el.style.height = (T.y1 - T.y0) * 2.6 * s + 'px';
}
function pcSheetPaint(st, loc, flash){
  const paper = st.root.querySelector('.pc-sheet-paper');
  const where = st.root.querySelector('.pc-sheet-where');
  if(where && (loc.si !== st.si || loc.rep !== st.rep)) where.textContent = pcSheetWhere(st.L, loc.si, loc.rep);
  if(loc.si !== st.si) pcShowSection(st.root, st.L, loc.si);
  const sh = paper && paper._sheet;
  if(!sh || !sh.ok) return;
  const idx = sh.map.tok[loc.si][loc.rep][loc.ni];
  const beatSec = st.win.bar / st.L.tr.beatsPerBar / pcRate(st.root);
  pcSheetMark(paper, idx, !!flash, beatSec);
  // The scroll is pcSheetFollow's, every frame (THE SHEET'S LOOK-AHEAD).
}
/* "This bar": the strums of the bar being played, and the count it is on. */
function pcSheetStrip(st, loc, barsIn){
  const cells = st.root.querySelectorAll('.pc-strip-cell');
  if(!cells.length) return;
  if(!loc){ cells.forEach(c => c.classList.remove('now')); return; }
  const S = st.L.sections[loc.si], bpb = st.L.tr.beatsPerBar;
  const local = (st.L.firstBar + barsIn - S.fromBar) * bpb - loc.rep * S.bars * bpb;   // beats into this lap
  /* The beat, then its bar, rounded exactly as pcLocate rounds them (whole
     beats, 1e-6 of a beat, inside the lap). Until 2026-11-17 the bar was
     rounded on its own, 1e-6 of a BAR: a read point a few millionths of a
     beat before a bar line took the next bar's names and lit no cell, for
     one frame (ca-45 at Slowest, with PC_LEAD 0; at a lap's or a section's
     start, and past the song's end, too). */
  const beat = Math.max(0, Math.min(Math.round(S.bars * bpb) - 1, Math.floor(local + 1e-6)));
  /* Cells per beat: two ("1 +"), or on a 6/8 track three, every one counted and lit (COUNT IN SIX, app/cards.js):
     the eighth and its bar then rounded as pcLocate rounds its e8. */
  const sub = st.L.tr.countSix ? 3 : 2;
  const e8 = sub === 3 ? Math.max(0, Math.min(Math.round(S.bars * bpb * 3) - 1, Math.floor(local * 3 + 1e-6))) : -1;
  const bar = sub === 3 ? Math.floor(e8 / (bpb * 3)) : Math.floor(beat / bpb);
  const key = loc.si + ':' + bar;
  if(st.stripKey !== key){
    st.stripKey = key;
    // One name per chord CHANGE, on the cell it lands in (a "+" cell too): the strumming is not shown.
    const marks = [];
    pcChordGrid(S.notes, bpb).forEach(ev => {
      if(!ev.rest && ev.bar === bar) marks[Math.round((ev.start - bar * bpb) * sub)] = ev.name;
    });
    cells.forEach((c, i) => { c.classList.toggle('strum', !!marks[i]); c.querySelector('.pc-strip-ch').textContent = marks[i] || ''; });
  }
  /* Lit on the BEAT only: no "+" cell is ever lit. The cell stays .now through its "+", but it SHOWS lit only as
     long as the sheet's dot stays filled (Jonathan, 2026-11-19: the box lit for the whole beat while the dot went
     hollow halfway, so the two never looked like one flash). The same length, pcSheetSolidSec, restarted on every
     new beat, in the same frame as the dot's (pcFrame paints the dot, then this). On a 6/8 track each of the six is a
     "beat" here, restarted on every eighth with that same length. */
  const now = sub === 3 ? e8 - bar * bpb * 3 : (beat - bar * bpb) * 2;
  const beatKey = loc.si + ':' + loc.rep + ':' + (sub === 3 ? e8 : beat);
  const fresh = st.stripBeat !== beatKey;
  st.stripBeat = beatKey;
  if(fresh){
    const strip = cells[0].parentElement;
    strip.style.setProperty('--pc-hit', pcSheetSolidSec(st.win.bar / bpb / pcRate(st.root)) + 's');
  }
  cells.forEach((c, i) => {
    const on = i === now;
    if(on && fresh && c.classList.contains('now')){ c.classList.remove('now'); void c.offsetWidth; }
    c.classList.toggle('now', on);
  });
}
/* The bar sticks under whatever already sticks to the top of the scroll box
   (.main on a laptop, the page on a phone): the In class page's sticky bar,
   and on a phone the fixed site header. A sticky `top` counts from the top
   of that box, so this measures the chrome's own sticky offset + height, not
   where it happens to sit right now. The card itself is overflow:clip, not
   hidden (styles.css), or nothing inside it could stick. */
function pcSheetStickyTop(root){
  let box = root.parentElement;
  while(box && box !== document.body){
    const oy = getComputedStyle(box).overflowY;
    if(oy === 'auto' || oy === 'scroll') break;
    box = box.parentElement;
  }
  const isDoc = !box || box === document.body;
  let top = 0;
  const hdr = document.querySelector('.header');
  if(isDoc && hdr && hdr.offsetHeight && /fixed|sticky/.test(getComputedStyle(hdr).position)) top = hdr.offsetHeight;
  const bar = document.querySelector('.ca-screen .page-topbar');
  if(bar && bar.offsetHeight && getComputedStyle(bar).position === 'sticky' && (isDoc || box.contains(bar)))
    top = Math.max(top, (parseFloat(getComputedStyle(bar).top) || 0) + bar.offsetHeight);
  root.style.setProperty('--pc-sheet-top', Math.round(top) + 'px');
}
function pcSheetStarted(st){
  pcSheetStickyTop(st.root);
  st.sheetLine = null; st.stripKey = null; st.stripBeat = null; st.sheetLit = null; st.sheetAim = null; st.sheetTop = null;
  const paper = st.root.querySelector('.pc-sheet-paper');
  const sh = paper && paper._sheet;
  const where = st.root.querySelector('.pc-sheet-where');
  if(where) where.textContent = pcSheetWhere(st.L, st.loopFrom, st.fromRep);
  if(!sh || !sh.ok) return;
  // -1 = no chord has sounded yet (a song that starts on a rest): mark the first chord, as the draw path does.
  const first = Math.max(0, sh.map.tok[st.loopFrom][st.fromRep][0]);
  const line = pcSheetMark(paper, first, false);
  const T = sh.model.toks[first];
  st.sheetLit = T ? T.y0 : null;
  // A start brings its line on screen and no further: the card's own controls stay in view for the count-in.
  pcSheetScroll(st, paper, pcFollowPlan(line, true), false);
}
/* THE SHEET'S TOP (Jonathan, 2026-11-17: "it should scroll down as much as
   possible to show what's coming next though and not just two lines at a
   time"). The line being played sits as high as it can: 12 px under the
   sticky bars (the In class page's bar, "This bar"), with everything below
   it on screen the music still to come. Near the end of the sheet the
   scroll box's end stops it: the line just sits lower. A start (Play, a
   section button, a chord tap) only brings its line on screen, so the
   card's own controls stay in view for the count-in; from the next line on,
   each line goes to the top.
   WHEN (2026-11-17, Jonathan: "the highlights are a few ms late. they are
   just behind the gizmo at the top"). The scroll to a line is made BEFORE
   its first beat: when the look-ahead T (PC_SHEET_FOLLOW_AHEAD real seconds
   before the beat is heard) reaches it, and not before the dot is on the
   last chord of the line being played (so every chord name is on screen
   when it is heard). One smooth scroll, one line's height, finished before
   the beat: the new line stands still when its first beat lights the dot,
   the marked chord name and "This bar" in the same frame. Until then the
   scroll started ON that beat, so the dot and the marked name rode up the
   screen for 7 to 10 frames after the strip's cell had lit (b1fb3a5, Chrome
   157, ca-38 / ca-44 / ca-45). The line ending leaves the screen in its
   last moment instead.
   - A scroll longer than PC_SHEET_SMOOTH_LINES of the line's own height (the
     first after a start, the top of the next column of a two-column sheet,
     a page above) is an instant jump at that moment: a smooth one that long
     takes about 0.35 s and would still be moving on the beat.
   - A line NOT on screen when the dot reaches it (Loop this part's lap
     back up: its look-ahead stops at the end of the part, pcLoopClamp; full
     screen or a resize mid-song via pcRefollow; a student's own scroll
     away) jumps there at once, within the frame of its beat.
   - A STUDENT'S OWN SCROLL: if the student scrolled (a wheel or touchpad,
     a touch drag, a scroll key, a press on the scroll bar: pcHandAt) since
     the follow's last scroll and the paper is no longer where that scroll
     left it (st.sheetAim), the sheet stays where the student put it while
     the line being played is on screen; only the line coming is brought on
     screen (pcFollow's `keep`), as the old follow did. The first line the
     student's view does not show takes the follow back. A scroll the page
     makes itself (a card opening, the follow) is never the student's.
   - T reads where the dot reads, only further on: never behind the dot (so
     never back past where a pass began, st.passFrom), and never past the
     end of the part Loop this part repeats (pcLoopClamp); past the end of
     the song pcLocate stays on the last chord.
   - With "reduce motion" every scroll is a jump (scrollBehavior()), T is
     read PC_SHEET_JUMP_AHEAD ahead.
   - st.sheetLine is "chord being played|T's chord" last followed,
     st.sheetLit the line the dot was on, st.sheetTop the line last put at
     the top; null (pcRefollow, a start) makes the next frame follow again. */
const PC_SHEET_FOLLOW_AHEAD = 0.3;    // real seconds before the beat is heard; see WHEN
const PC_SHEET_JUMP_AHEAD = 0.1;      // the same with reduce motion (every scroll a jump: a few slow frames)
const PC_SHEET_SMOOTH_LINES = 3;      // a longer scroll is a jump; see WHEN
/* A STUDENT'S OWN SCROLL: when the student last scrolled by hand (performance.now()). One listener for the
   page's life, passive, like pcRefollow's: it only notes the time. */
let pcHandAt = -Infinity;
function pcHandInput(e){
  if(e.type === 'keydown' && !/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| )$/.test(e.key)) return;
  // A press on the scroll bar lands on the scroll box itself (.main, or the page on a phone); any other press is not a scroll.
  if(e.type === 'pointerdown' && !(e.target === document.documentElement || (e.target && e.target.classList && e.target.classList.contains('main')))) return;
  pcHandAt = performance.now();
}
['wheel', 'touchmove', 'keydown', 'pointerdown'].forEach(type => document.addEventListener(type, pcHandInput, { capture: true, passive: true }));
function pcSheetFollowAhead(){ return scrollBehavior() === 'smooth' ? PC_SHEET_FOLLOW_AHEAD : PC_SHEET_JUMP_AHEAD; }
// The index of the chord name the cursor will be on `ahead` real seconds before the beat is heard (-1: none).
function pcSheetTokAt(st, sh, ct, ahead){
  const read = snipBarsAt(st.win, ct + (ahead - snipLatency()) * pcRate(st.root));
  const loc = pcLocate(st.L, pcLoopClamp(st, Math.max(read, pcLeadBars(st, ct))));
  return loc ? sh.map.tok[loc.si][loc.rep][loc.ni] : -1;
}
function pcSheetFollow(st, ct){
  const paper = st.root.querySelector('.pc-sheet-paper');
  const sh = paper && paper._sheet;
  if(!sh || !sh.ok || !(st.si >= 0)) return;
  const toks = sh.model.toks;
  const li = sh.map.tok[st.si][st.rep][st.seq - st.L.sections[st.si].seqOff], lit = toks[li];
  if(!lit) return;
  const ti = pcSheetTokAt(st, sh, ct, pcSheetFollowAhead()), T = toks[ti] || lit;
  const key = li + '|' + ti;
  if(st.sheetLine === key) return;
  st.sheetLine = key;
  pcSheetStickyTop(st.root);
  const line = paper.querySelector('.pc-sheet-line:not(.pc-sheet-ahead)');
  const next = paper.querySelector('.pc-sheet-ahead');
  // The dot is on a new line. It is at the top already (below); one not on screen jumps there now.
  if(st.sheetLit !== lit.y0){
    st.sheetLit = lit.y0;
    const p = st.sheetTop !== lit.y0 && pcFollowPlan(line, false, null, true);
    if(p && !p.on){ st.sheetTop = lit.y0; pcSheetScroll(st, paper, p, true); }
  }
  // WHEN: the line coming, to the top before its first beat, once the dot is on the last chord of this line.
  if(T.y0 !== lit.y0 && st.sheetTop !== T.y0 && ti > li && (li >= ti - 1 || toks[ti - 1].y0 !== lit.y0)){
    pcSheetLineBox(sh, next, T);
    if(pcSheetHandMoved(st, paper)){
      const pn = pcFollowPlan(next, false, line);
      if(pn && !pn.on) pcSheetScroll(st, paper, pn, false);
      return;
    }
    const p = pcFollowPlan(next, false, null, true);
    if(!p) return;
    st.sheetTop = T.y0;
    const h = next.getBoundingClientRect().height;
    pcSheetScroll(st, paper, p, Math.abs(p.delta) > PC_SHEET_SMOOTH_LINES * h);
  }
}
/* Makes a follow's scroll (if it moves at least 2 px) and remembers where it
   leaves the paper (st.sheetAim), for A STUDENT'S OWN SCROLL. */
function pcSheetScroll(st, paper, p, jump){
  if(!p) return;
  // Measured BEFORE the scroll: an instant one has moved the paper by the time scrollBy returns.
  const off = pcSheetPaperOff(paper, p.box);
  const moved = Math.abs(p.delta) >= 2 ? pcFollowScroll(p, jump) : 0;
  st.sheetAim = { box: p.box, off: off - moved, at: performance.now() };
}
// The paper's top, measured from the top of the scroll box (getBoundingClientRect pixels).
function pcSheetPaperOff(paper, box){
  const isDoc = box === document.scrollingElement || box === document.documentElement;
  return paper.getBoundingClientRect().top - (isDoc ? 0 : box.getBoundingClientRect().top);
}
// The student scrolled since the follow's last scroll, and the sheet is not where that scroll left it.
function pcSheetHandMoved(st, paper){
  const a = st.sheetAim;
  if(!a || !(pcHandAt > a.at) || !a.box.isConnected) return false;
  return Math.abs(pcSheetPaperOff(paper, a.box) - a.off) > 3;
}
function pcSheetStopped(root){
  root.querySelectorAll('.pc-strip-cell.now').forEach(c => c.classList.remove('now'));
  root.querySelectorAll('.pc-sheet-dot.hit').forEach(d => d.classList.remove('hit'));
}
// A tap on a chord: the song from the start of that line's lap, after the count-in.
function pcSheetStartAt(btn, idx){
  const root = btn.closest('.pc');
  const paper = btn.closest('.pc-sheet-paper');
  const at = paper && paper._sheet && paper._sheet.map.start[idx];
  if(root && at) pcStart(root, at.si, at.rep);
}
