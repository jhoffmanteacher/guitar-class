/* ── Song builder: pdfs of the chords and of the tab (2026-11-16) ───────────────────────────────────────
   Jonathan, 2026-11-16: "i'd like to upload pdfs to the builder and multiple ones at that for tab and chords
   separately". His answers the same day: a TAB pdf is shown to him while he builds (students see nothing new);
   a CHORDS pdf is read into the chart box; his pdfs are both downloads (real text) and scans (pictures).

   WHERE: a "Pdfs" bar at step 1 (Upload) and at step 4 (Chart), with two pickers, Chords pdfs and Tab pdfs,
   each taking several files (SB_PDF_MAX_FILES in all). At step 4 the picked pdf is drawn BESIDE the chart
   (the song list gives up its column while the pdf is open): one page at a time, the files as tabs, zoom, and
   "Own window" (the browser's own pdf viewer, for a second screen).

   A CHORDS pdf with real text: its words are laid out line by line (sbPdfTextOf: a line is the words on one
   baseline; two columns of lyrics are read left column first; wide gaps keep their spaces, so chords stay
   over their words) and ADDED to the chart box, after what is there. The reader (teacher-sb-chart.js) then
   reads it like any pasted chart, and he corrects it in the grid. A page with no text is a picture (a scan
   or a photo): nothing can be read from it, the bar says so, and the pdf is shown beside the chart for him to
   type from. A TAB pdf is never read (the builder reads chord names only): it is only shown.

   NOTHING IS STORED and nothing reaches a student: the pdfs live in this tab's memory (sbPdf), like the
   original mp3 (sbMem.src). A draft opened again asks for them again; the chart text read from them IS in the
   draft (chart.text), as before. Another draft, a deleted draft or the start screen drops them (sbPdfSync).
   pdf.js (vendor/pdfjs, the practice card's loader pcSheetLoadPdfjs, app/cards.js) draws and reads them; a
   drawing in flight is cancelled when another starts and when the view is left (sbPdfLeave). File names are
   escaped where they are drawn; buttons carry data-* only (the delegated sbClick / sbChange). */
const SB_PDF_MAX_FILES = 8;
const SB_PDF_MAX_BYTES = 40000000;
const SB_PDF_MAX_PAGES = 40;            // pages read for text (every page can still be shown)
const SB_PDF_MIN_CHARS = 12;            // fewer letters than this on a page: a picture, not text
const SB_PDF_ZOOMS = [0.75, 1, 1.25, 1.5, 2, 2.5, 3];
/* files: [{ kind: 'chords'|'tab', name, size, bytes, doc, pages, textPages, lines, url }] */
const sbPdf = { id: null, files: [], cur: 0, page: 1, zoom: 1, open: false, reading: 0, seq: 0, task: null, drawn: '', el: null, scroll: 0, err: '' };

/* ── The words of a page → text ── */
/* items: [{ s, x, y, w, h }] in page points, y DOWN, y = the baseline, x = the left edge, w = the width of s.
   Pure: tools/song-builder-sim.mjs runs it on made-up pages. */
function sbPdfTextOf(items){
  const its = [];
  (items || []).forEach(i => {
    if(!i || typeof i.s !== 'string' || !i.s.trim() || !Number.isFinite(i.x) || !Number.isFinite(i.y)) return;
    const raw = i.s.replace(/\t/g, '    '), w = Math.max(0, Number(i.w) || 0), per = raw.length ? w / raw.length : 0;
    const lead = raw.length - raw.replace(/^\s+/, '').length, s = raw.trim();
    its.push({ s, x: i.x + lead * per, y: i.y, w: per ? s.length * per : w, h: Math.max(1, Number(i.h) || 10) });
  });
  if(!its.length) return '';
  const med = a => { const b = a.slice().sort((p, q) => p - q); return b[Math.floor(b.length / 2)]; };
  const H = med(its.map(i => i.h)), tol = Math.max(2, H * 0.35);
  const wide = its.filter(i => i.s.length >= 2 && i.w > 0);
  const cw = wide.length ? med(wide.map(i => i.w / i.s.length)) : H * 0.5;
  its.sort((p, q) => p.y - q.y || p.x - q.x);
  const lines = [];
  its.forEach(i => { const L = lines[lines.length - 1]; if(L && Math.abs(i.y - L.y) <= tol) L.items.push(i); else lines.push({ y: i.y, items: [i] }); });
  /* Two columns: a cut down the middle third that no word crosses, with words on both sides of it on many
     lines, and lyric words (not only chord names) on both sides: a grid of chord names in columns is ONE column. */
  const left = Math.min(...its.map(i => i.x)), right = Math.max(...its.map(i => i.x + i.w)), span = right - left;
  let cut = null;
  if(lines.length >= 6 && span > 200){
    let best = 0;
    for(let c = left + span * 0.3; c <= left + span * 0.7; c += 2){
      let cross = 0, both = 0;
      for(const L of lines){
        let endL = -Infinity, startR = Infinity, x = false;
        L.items.forEach(i => { if(i.x + i.w <= c) endL = Math.max(endL, i.x + i.w); else if(i.x >= c) startR = Math.min(startR, i.x); else x = true; });
        if(x){ cross++; break; }
        if(endL > -Infinity && startR < Infinity && startR - endL >= span * 0.05) both++;
      }
      if(!cross && both > best){ best = both; cut = c; }
    }
    if(best < Math.max(4, lines.length * 0.3)) cut = null;
    if(cut != null){
      const wordy = side => lines.filter(L => L.items.filter(i => side(i)).map(i => i.s).join(' ').split(/\s+/)
        .filter(t => /^[A-Za-zÀ-ÿ'’,.!?¡¿]{3,}$/.test(t) && !(typeof sbChordish === 'function' && sbChordish(t))).length >= 2).length;
      if(wordy(i => i.x + i.w <= cut) < 3 || wordy(i => i.x >= cut) < 3) cut = null;
    }
  }
  const textOf = (arr, x0) => {
    let t = '', end = null;
    arr.slice().sort((p, q) => p.x - q.x).forEach(i => {
      if(end == null || i.x - end > cw * 0.25){
        const col = Math.round((i.x - x0) / cw);
        if(t.length < col) t += ' '.repeat(Math.min(col - t.length, 120));
        else if(t && !/\s$/.test(t)) t += ' ';
      }
      t += i.s; end = i.x + i.w;
    });
    return t.replace(/\s+$/, '');
  };
  const junk = t => /^(?:page|p[áa]gina)?\s*\d+\s*(?:(?:\/|of|de)\s*\d+)?$/i.test(t.trim()) || /^(?:https?:\/\/|www\.)\S+$/i.test(t.trim());
  const block = pick => {
    const rows = lines.map(L => ({ y: L.y, items: L.items.filter(pick) })).filter(r => r.items.length);
    if(!rows.length) return [];
    const x0 = Math.min(...rows.map(r => Math.min(...r.items.map(i => i.x))));
    const gaps = []; for(let k = 1; k < rows.length; k++) gaps.push(rows[k].y - rows[k - 1].y);
    const typ = gaps.length ? med(gaps) : 0, out = [];
    rows.forEach((r, k) => {
      const t = textOf(r.items, x0);
      if(junk(t)) return;
      if(k && typ > 0 && r.y - rows[k - 1].y > typ * 1.7 && out.length && out[out.length - 1] !== '') out.push('');
      out.push(t);
    });
    while(out.length && out[out.length - 1] === '') out.pop();
    return out;
  };
  const out = cut == null ? block(() => true) : block(i => i.x + i.w <= cut).concat([''], block(i => i.x >= cut));
  return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}
/* One pdf.js page → the items sbPdfTextOf takes. */
async function sbPdfPageItems(page){
  const vp = page.getViewport({ scale: 1 }), tc = await page.getTextContent();
  return (tc.items || []).filter(it => it && typeof it.str === 'string' && it.str.trim() && Array.isArray(it.transform)).map(it => {
    const [a, b, , d, e, f] = it.transform, p = vp.convertToViewportPoint(e, f);
    return { s: it.str, x: p[0], y: p[1], w: Number(it.width) || 0, h: Math.hypot(a, b) || Math.abs(d) || Number(it.height) || 10 };
  });
}

/* ── Which song the pdfs belong to ── */
function sbPdfWant(){ return sbSel === 'new' || sbDraft() ? sbSel : null; }
function sbPdfDropFile(f){
  if(f.url){ try{ URL.revokeObjectURL(f.url); }catch(e){} f.url = null; }
  if(f.doc){ try{ f.doc.destroy(); }catch(e){} f.doc = null; }
}
function sbPdfSync(){
  const want = sbPdfWant();
  if(sbPdf.id === want) return;
  sbPdfStopDraw();
  sbPdf.files.forEach(sbPdfDropFile);
  sbPdf.files = []; sbPdf.cur = 0; sbPdf.page = 1; sbPdf.zoom = 1; sbPdf.open = false; sbPdf.drawn = ''; sbPdf.scroll = 0; sbPdf.err = ''; sbPdf.el = null;
  sbPdf.id = want;
}
/* The new song was saved: its pdfs go with the draft's id (sbSaveUpload). */
function sbPdfRename(from, to){ if(sbPdf.id === from) sbPdf.id = to; }
function sbPdfMine(){ return sbPdf.id === sbSel ? sbPdf.files : []; }
function sbPdfPaneOn(){ return sbStepOn === 4 && sbPdf.open && sbPdfMine().length > 0; }

/* ── Picking ── */
function sbPdfIsPdf(bytes){
  const head = String.fromCharCode.apply(null, bytes.subarray(0, 1024));
  return head.indexOf('%PDF-') >= 0;
}
async function sbPdfAdd(kind, list){
  const files = Array.from(list || []);
  if(!files.length || sbBusy || sbPdf.reading || sbPdfWant() == null) return;
  const gen = sbViewGen, forId = sbSel;
  const stale = () => sbStopped(gen) || sbSel !== forId;
  sbPdfSync();
  const notes = [];
  let added = 0, first = -1, textLines = 0, cutShort = false;
  sbPdf.reading++;
  sbNote = `Reading ${files.length === 1 ? 'the pdf' : files.length + ' pdfs'}…`;
  teacherSbPaint();
  try{
    const lib = await pcSheetLoadPdfjs();
    for(const f of files){
      if(stale()) return;
      const name = String(f.name || 'file.pdf').slice(0, 120);
      if(sbPdf.files.length >= SB_PDF_MAX_FILES){ notes.push(`${name} was not added: ${SB_PDF_MAX_FILES} pdfs at most.`); continue; }
      if(sbPdf.files.some(x => x.name === name && x.size === f.size && x.kind === kind)){ notes.push(`${name} is here already.`); continue; }
      if(!(f.size > 0) || f.size > SB_PDF_MAX_BYTES){ notes.push(`${name} was not added: it is ${f.size > 0 ? sbMb(f.size) : 'empty'} (a pdf up to ${sbMb(SB_PDF_MAX_BYTES)}).`); continue; }
      let doc = null;
      try{
        const bytes = new Uint8Array(await f.arrayBuffer());
        if(!sbPdfIsPdf(bytes)) throw { why: 'it is not a pdf' };
        doc = await lib.getDocument({ data: bytes.slice() }).promise;
        const pages = doc.numPages;
        let text = '', textPages = 0;
        if(kind === 'chords'){
          for(let n = 1; n <= Math.min(pages, SB_PDF_MAX_PAGES); n++){
            const t = sbPdfTextOf(await sbPdfPageItems(await doc.getPage(n)));
            if(stale()){ try{ doc.destroy(); }catch(e){} return; }
            if(t.replace(/\s/g, '').length >= SB_PDF_MIN_CHARS){ textPages++; text += (text ? '\n\n' : '') + t; }
          }
        }
        if(stale()){ try{ doc.destroy(); }catch(e){} return; }
        const lines = text ? text.split('\n').length : 0;
        sbPdf.files.push({ kind, name, size: f.size, bytes, doc, pages, textPages, lines, url: null });
        doc = null;
        if(first < 0) first = sbPdf.files.length - 1;
        added++;
        if(kind === 'chords'){
          if(text){ if(sbPdfPutText(text)) cutShort = true; textLines += lines; if(textPages < Math.min(pages, SB_PDF_MAX_PAGES)) notes.push(`${name}: ${Math.min(pages, SB_PDF_MAX_PAGES) - textPages} of its ${pages} pages ${Math.min(pages, SB_PDF_MAX_PAGES) - textPages === 1 ? 'is a picture' : 'are pictures'} and could not be read.`); }
          else notes.push(`${name} is a picture (a scan or a photo): it has no text to read. It is shown beside the chart at step 4; type its chords there, or ask Claude to turn it into text.`);
        }
      }catch(e){
        if(doc){ try{ doc.destroy(); }catch(err){} }
        const why = e && e.why ? e.why : e && e.name === 'PasswordException' ? 'it is locked with a password' : 'it could not be opened (' + String((e && e.message) || e).slice(0, 80) + ')';
        notes.push(`${name} was not added: ${why}.`);
      }
    }
    if(added){ sbPdf.open = true; sbPdf.cur = first; sbPdf.page = 1; sbPdf.scroll = 0; sbPdf.drawn = ''; }
    const head = !added ? '' : textLines ? `${textLines} line${textLines === 1 ? '' : 's'} read into the chart box${sbStepOn === 4 ? '' : ' (it is read at step 4)'}${cutShort ? `, cut at ${SB_CHART_MAX} characters` : ''}.`
      : kind === 'tab' ? `${added} tab pdf${added === 1 ? '' : 's'} added: ${sbStepOn === 4 ? 'shown beside the chart' : 'shown beside the chart at step 4'}.` : '';
    sbNote = [head].concat(notes).filter(Boolean).join(' ');
  }catch(e){
    sbNote = 'The pdf reader did not load: ' + String((e && e.message) || e).slice(0, 80) + '. Check your connection and pick the file again.';
  }finally{
    sbPdf.reading--;
    if(!sbStopped(gen)) teacherSbPaint();
  }
}
/* A chords pdf's text goes after what is in the chart box (step 1: the draft's chart text; step 4, or a chart
   read already: the paste box, shown). → true when the box's limit cut it short. */
function sbPdfPutText(text){
  const d = sbDraft(), join = (a, b) => { const t = String(a || '').replace(/\s+$/, ''); return (t ? t + '\n\n' : '') + b; };
  if(d && (sbStepOn === 4 || sbHasChart(d))){
    /* st.text is the paste box as typed (sbChartInput keeps it); the box on screen is NOT read: it is not painted
       again between two files of one pick, so it would lose the first file's text. */
    const st = sbChFor(sbSel);
    const all = join(st.text != null ? st.text : (d.chart && d.chart.text) || '', text);
    st.text = all.slice(0, SB_CHART_MAX); st.view = 'paste';
    return all.length > SB_CHART_MAX;
  }
  const obj = d || sbNew;
  if(!obj) return false;
  const all = join(obj.chartText != null ? obj.chartText : (d && d.chart && d.chart.text) || '', text);
  obj.chartText = all.slice(0, SB_CHART_MAX);
  if(d) d.dirty = true;
  return all.length > SB_CHART_MAX;
}

/* ── The bar (steps 1 and 4) ── */
function sbPdfBarHtml(){
  const mine = sbPdfMine(), off = sbBusy || sbPdf.reading ? ' disabled' : '';
  const chips = mine.map((f, i) => {
    const state = f.kind === 'tab' ? 'shown only' : f.textPages === 0 ? 'a picture: not read' : f.textPages < f.pages ? `text on ${f.textPages} of ${f.pages} pages` : `${f.lines} lines read`;
    return `<span class="sb-chip sb-pdfchip${f.kind === 'chords' && f.textPages === 0 ? ' new' : ''}"><b>${f.kind === 'tab' ? 'Tab' : 'Chords'}</b><span class="sb-pdfname">${escHtml(f.name)}</span><span>${f.pages} page${f.pages === 1 ? '' : 's'} · ${state}</span>`
      + `<button type="button" class="sb-pdfx" data-sb-act="pdf-remove" data-sb-i="${i}" aria-label="Remove ${escAttr(f.name)}"${off}>×</button></span>`;
  }).join('');
  const show = mine.length && sbStepOn === 4 ? `<button type="button" class="sb-btn small${sbPdf.open ? '' : ' primary'}" data-sb-act="pdf-toggle">${sbPdf.open ? 'Hide the pdf' : 'Show the pdf beside the chart'}</button>` : '';
  return `<div class="sb-box sb-box-tight sb-pdfbar"><div class="sb-row"><span class="sb-h small sb-pdfbar-h">Pdfs</span>`
    + `<label class="sb-btn small sb-filebtn">Chords pdfs<input type="file" accept=".pdf,application/pdf" multiple data-sb-pdf="chords" aria-label="Pick chords pdfs"${off}></label>`
    + `<label class="sb-btn small sb-filebtn">Tab pdfs<input type="file" accept=".pdf,application/pdf" multiple data-sb-pdf="tab" aria-label="Pick tab pdfs"${off}></label>${show}</div>`
    + (chips ? `<div class="sb-row sb-pdfchips">${chips}</div>` : '')
    + `<div class="sb-hint">A chords pdf with real text is read into the chart box. A tab pdf, or a scan, is only shown to you beside the chart (step 4). You can pick several. Pdfs stay in this tab: nothing is stored, and students never see them.</div></div>`;
}

/* ── The pane beside the chart (step 4) ── */
function sbPdfHeadHtml(){
  const mine = sbPdfMine(), f = mine[sbPdf.cur];
  if(!f) return '';
  const tabs = mine.map((x, i) => `<button type="button" class="${i === sbPdf.cur ? 'on' : ''}" data-sb-act="pdf-file" data-sb-i="${i}" aria-pressed="${i === sbPdf.cur}" title="${escAttr(x.name)}"><b>${x.kind === 'tab' ? 'Tab' : 'Chords'}</b> ${escHtml(x.name)}</button>`).join('');
  const zi = SB_PDF_ZOOMS.indexOf(sbPdf.zoom);
  return `<div class="sb-pdftabs">${tabs}</div><div class="sb-row sb-pdfctl">`
    + `<button type="button" class="sb-btn small" data-sb-act="pdf-prev"${sbPdf.page <= 1 ? ' disabled' : ''} aria-label="The page before">‹</button><span class="sb-pdfpage">Page ${sbPdf.page} of ${f.pages}</span><button type="button" class="sb-btn small" data-sb-act="pdf-next"${sbPdf.page >= f.pages ? ' disabled' : ''} aria-label="The next page">›</button>`
    + `<button type="button" class="sb-btn small" data-sb-act="pdf-zoom" data-sb-v="-1"${zi <= 0 ? ' disabled' : ''} aria-label="Smaller">−</button><span class="sb-pdfpage">${Math.round(sbPdf.zoom * 100)}%</span><button type="button" class="sb-btn small" data-sb-act="pdf-zoom" data-sb-v="1"${zi >= SB_PDF_ZOOMS.length - 1 ? ' disabled' : ''} aria-label="Bigger">+</button>`
    + `<span class="sb-toolbtns"><button type="button" class="sb-btn small" data-sb-act="pdf-window" title="Open this pdf in its own window">Own window</button><button type="button" class="sb-btn small" data-sb-act="pdf-toggle">Hide</button></span></div>`
    + (sbPdf.err ? `<div class="sb-hint sb-pdferr">${escHtml(sbPdf.err)}</div>` : '');
}
function sbPdfHead(){
  const el = sbPdf.el, head = el && el.querySelector('[data-sb-pdfhead]');
  if(head) head.innerHTML = sbPdfHeadHtml();
}
/* Called after every paint of the view (renderTeacherSongBuilder). The pane is ONE element kept between paints
   (a paint rewrites the view; a canvas drawn again on every click would flicker and lose its scroll): it is put
   back into the new view's slot. */
function sbPdfMounted(root){
  sbPdfSync();
  if(!sbPdfPaneOn()){ sbPdfStopDraw(); return; }
  const slot = root && root.querySelector('[data-sb-pdfslot]');
  if(!slot) return;
  if(sbPdf.cur >= sbPdf.files.length) sbPdf.cur = 0;
  if(!sbPdf.el){
    const el = document.createElement('div');
    el.className = 'sb-pdfpane';
    el.innerHTML = '<div class="sb-pdfhead" data-sb-pdfhead></div><div class="sb-pdfbody" data-sb-pdfbody tabindex="0" aria-label="The pdf page"><canvas></canvas></div>';
    el.querySelector('[data-sb-pdfbody]').addEventListener('scroll', e => { if(sbPdf.el === el) sbPdf.scroll = e.target.scrollTop; });
    sbPdf.el = el; sbPdf.drawn = '';
  }
  const keep = sbPdf.scroll;
  slot.appendChild(sbPdf.el);
  sbPdfHead();
  sbPdf.el.querySelector('[data-sb-pdfbody]').scrollTop = keep; sbPdf.scroll = keep;
  sbPdfDraw();
}
function sbPdfStopDraw(){
  sbPdf.seq++;
  const t = sbPdf.task; sbPdf.task = null;
  if(t){ try{ t.cancel(); }catch(e){} }
  return t;
}
async function sbPdfDraw(){
  const f = sbPdfMine()[sbPdf.cur], el = sbPdf.el;
  if(!f || !f.doc || !el || !el.isConnected) return;
  const body = el.querySelector('[data-sb-pdfbody]'), canvas = body.querySelector('canvas');
  const wCss = Math.max(200, body.clientWidth - 18);
  const key = [sbPdf.id, sbPdf.cur, f.name, f.size, sbPdf.page, sbPdf.zoom, wCss].join('|');
  if(key === sbPdf.drawn) return;
  const old = sbPdfStopDraw(), seq = sbPdf.seq;
  if(old){ try{ await old.promise; }catch(e){} }
  try{
    const page = await f.doc.getPage(Math.max(1, Math.min(f.pages, sbPdf.page)));
    if(seq !== sbPdf.seq) return;
    const base = page.getViewport({ scale: 1 }), css = wCss / base.width * sbPdf.zoom;
    let dpr = Math.min(2, window.devicePixelRatio || 1);
    while(dpr > 1 && base.width * css * dpr * base.height * css * dpr > 16e6) dpr -= 0.25;
    const vp = page.getViewport({ scale: css * dpr });
    canvas.width = Math.round(vp.width); canvas.height = Math.round(vp.height);
    canvas.style.width = Math.round(vp.width / dpr) + 'px'; canvas.style.height = Math.round(vp.height / dpr) + 'px';
    const task = page.render({ canvasContext: canvas.getContext('2d'), viewport: vp });
    sbPdf.task = task;
    await task.promise;
    if(sbPdf.task === task) sbPdf.task = null;
    if(seq !== sbPdf.seq) return;
    sbPdf.drawn = key;
    if(sbPdf.err){ sbPdf.err = ''; sbPdfHead(); }
  }catch(e){
    if(seq !== sbPdf.seq || (e && e.name === 'RenderingCancelledException')) return;
    sbPdf.err = 'This page could not be drawn: ' + String((e && e.message) || e).slice(0, 80);
    sbPdfHead();
  }
}
/* Leaving the view (teacherSbLeave): a drawing in flight stops. The pdfs stay for when he comes back. */
function sbPdfLeave(){ sbPdfStopDraw(); }

/* ── Acting ── */
function sbPdfAct(act, b){
  if(!/^pdf-/.test(act)) return false;
  const mine = sbPdfMine(), f = mine[sbPdf.cur];
  if(act === 'pdf-toggle'){ sbPdf.open = !sbPdf.open; if(sbPdf.open) sbPdf.drawn = ''; teacherSbPaint(); return true; }
  if(act === 'pdf-remove'){
    const i = Number(b.dataset.sbI), x = mine[i];
    if(!x || sbBusy || sbPdf.reading) return true;
    sbPdfStopDraw(); sbPdfDropFile(x);
    sbPdf.files.splice(i, 1);
    if(sbPdf.cur >= sbPdf.files.length) sbPdf.cur = Math.max(0, sbPdf.files.length - 1);
    sbPdf.page = 1; sbPdf.scroll = 0; sbPdf.drawn = ''; sbPdf.err = '';
    if(!sbPdf.files.length) sbPdf.open = false;
    sbNote = x.kind === 'chords' && x.lines ? `${x.name} is removed. The text read from it is still in the chart box.` : `${x.name} is removed.`;
    teacherSbPaint();
    return true;
  }
  if(!f) return true;
  const again = () => { const body = sbPdf.el && sbPdf.el.querySelector('[data-sb-pdfbody]'); sbPdf.scroll = 0; if(body) body.scrollTop = 0; sbPdf.err = ''; sbPdfHead(); sbPdfDraw(); };
  if(act === 'pdf-file'){ const i = Number(b.dataset.sbI); if(mine[i] && i !== sbPdf.cur){ sbPdf.cur = i; sbPdf.page = 1; again(); } return true; }
  if(act === 'pdf-prev' || act === 'pdf-next'){ const p = sbPdf.page + (act === 'pdf-next' ? 1 : -1); if(p >= 1 && p <= f.pages){ sbPdf.page = p; again(); } return true; }
  if(act === 'pdf-zoom'){
    const zi = SB_PDF_ZOOMS.indexOf(sbPdf.zoom) + Number(b.dataset.sbV);
    if(zi >= 0 && zi < SB_PDF_ZOOMS.length){ sbPdf.zoom = SB_PDF_ZOOMS[zi]; sbPdfHead(); sbPdfDraw(); }
    return true;
  }
  if(act === 'pdf-window'){
    if(!f.url) f.url = URL.createObjectURL(new Blob([f.bytes], { type: 'application/pdf' }));
    window.open(f.url, '_blank', 'noopener,popup,width=760,height=940');
    return true;
  }
  return true;
}
function sbPdfChange(e){
  const t = e.target;
  if(!t.matches('[data-sb-pdf]')) return false;
  sbPdfAdd(t.dataset.sbPdf === 'tab' ? 'tab' : 'chords', t.files);
  return true;
}
