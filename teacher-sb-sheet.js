/* ── Song builder: a published song's lyrics sheet (2026-11-18, private chord sheets P4) ─────────────────────────────
   Jonathan, 2026-11-18: a chords-over-lyrics view for the private songs, like Watchtower; the sheet is attached on the
   published song's Song builder page, fewest clicks; a sheet that does not line up is REFUSED and says where, and
   nothing is written (he then hands the pdf to Claude). Plan: "Claude outputs/lyrics-sheets/PLAN.md", section Console.
   The format is app/builtsongs.js's song.sheet = { id, bytes, sha256, cols? } (P3): a pdf in the private song-file
   store, never in the repo; every page then gives the card a Chords / Lyrics switch (card.otherViews.lyrics, read
   loose: pcSheetAlign in app/cards-sheet.js).

   WHERE: the "Lyrics sheet" row on a published song's page (sbPublishedHtml, teacher-sb-publish.js), under "Change it".
   ONE FILE: drop a pdf on the row, or pick it. It is read in this tab, never stored until "Add to the song":
     - over 5 MB (BS_MAX_SHEET_BYTES) or not a pdf: refused before it is read;
     - read with pdf.js (pcSheetRead, the reader every Lyrics view uses); no text at all (a scan or a photo): refused
       with SB_SHEET_NOTEXT;
     - the loose read (pcSheetAlign) against the PUBLISHED song's own card (builtSongExpand, the expansion every student
       page makes), once for each chord set the card offers (Full, Power, or both: a power card names E5 where the full
       one names E and Em). Read one column first (web sheets are one column, the format's default); when that does not
       follow, two columns (cols: 2) are tried, and the one that follows is the one added. Neither: the one-column
       reason is shown;
     - ✓ "The sheet follows the song: N chord names over M changes", and Add to the song; ✗ the reason (one line, the
       loose read's own) and the table, one row per section lap (the card's chords, the sheet's names, ✓ ✗ or — after
       the first mismatch). Nothing is written, and the line says to send the pdf to Claude.
   ADD TO THE SONG (one click, no confirm: it changes nothing students had until it lands, and Remove undoes it):
     1. the pdf goes into songFiles/sheet-<song id>-<8 hex of its SHA-256> through the Song files writer
        (teacherSfPutFile, durationSec 1: the rules need a length), skipped when the store already holds it, ready and
        matching;
     2. ONE transaction: the sheet's head read again (ready, matching), builtSongs/{id} read (it must still be the song
        this page drew: another tab's Publish or Import in the gap refuses, nothing written), builtSongsMeta/list read
        (the song must still be on it); builtSongs/{id} = the same song with song.sheet (it must pass builtSongCheck
        first), the list with a new edit number (teacherBsNextVer, as Publish), and the song's own draft, when it has
        one that is not stale, with the same sheet (so Edit and Publish keep it, and sbDraftStale still sees one song);
     3. the sheet it replaced, if any, deleted once no listed song names it (sbDeleteAudio, as a replaced recording).
   REMOVE SHEET (one OK / Cancel): the same transaction without song.sheet, then the pdf deleted as at 3.
   CHECK IT AGAIN (a song that has a sheet): reads the stored pdf (one song download this month, like a Chromebook's
   read) and runs the same check, so a chart changed by Edit can be checked against its sheet.

   WRITES: songFiles/{id} and its pieces (teacherSfPutFile; deletes through sbDeleteAudio), builtSongs/{id},
   builtSongsMeta/list, songDrafts/{id}: never progress/{uid}, never config/class. firestore.rules needs no change: a
   sheet head is a song-file head (.pdf, durationSec 1), and builtSongs' `song` is any map. tools/song-builder-sim.mjs
   runs this part against its stub Firestore, which checks every write against the rules' shape.
   The pdf's file name is drawn escaped; buttons carry data-* only (sbClick, sbChange in teacher-sb-core.js route here).
   English only, like the rest of the console. */
const SB_SHEET_TMP = 'sbsheetcheck';      // the card's id and track key while the check runs (synchronous: never left behind)
const SB_SHEET_NOTEXT = 'That pdf has no text (a scan or a photo). Save it as a pdf with text.';
/* The pdf on this song's row: file = { name, bytes, sha256, stored } (stored: read back from the store by Check);
   res = the verdict (sbSheetJudge) with key = the song and the file it was worked out for; epoch: a pick or a song
   switch while a read runs makes that read land nowhere. */
const sbSh = { id: null, file: null, reading: false, res: null, epoch: 0, over: false };

function sbSheetIdFor(songId, sha){ return 'sheet-' + songId + '-' + String(sha).slice(0, 8); }
/* The song a check is worked out for: the published doc without its sheet (adding one does not change what it is
   checked against), and the pdf's SHA-256. */
function sbSheetKey(doc, sha){
  const o = JSON.parse(JSON.stringify(doc || {}));
  if(o.song && typeof o.song === 'object') delete o.song.sheet;
  return sbHash(sbCanon(sbPubNorm(o))) + ':' + sha;
}
/* The doc with song.sheet set (sheet) or taken out (null). */
function sbSheetDocWith(doc, sheet){
  const o = JSON.parse(JSON.stringify(doc));
  if(sheet) o.song.sheet = JSON.parse(JSON.stringify(sheet)); else delete o.song.sheet;
  return o;
}
/* The draft of `id` that Add and Remove keep in step: its own, not stale (a stale one is rebuilt by Edit anyway). */
function sbSheetOwnDraft(id){ const d = sbDrafts && sbDrafts.get(id); return d && !d.stale ? d : null; }

/* ── The check ── */
/* The card's layouts as a student's Lyrics view draws them: one per chord set the card offers. The card is the one
   every page makes (builtSongExpand); its id and track key are SB_SHEET_TMP only for this synchronous call. */
function sbSheetLayouts(id, doc){
  const ex = builtSongExpand(id, doc);
  const act = JSON.parse(JSON.stringify(ex.activity));
  act.id = SB_SHEET_TMP; act.card.track = SB_SHEET_TMP;
  const modes = act.chordVersions ? ['full', 'power'] : ['full'];
  SNIPPET_TRACKS[SB_SHEET_TMP] = ex.track;
  try{
    return modes.map(m => {
      if(act.chordVersions) caChordModes[SB_SHEET_TMP] = m;
      return { mode: m, L: pcLayout(caView(act)) };
    });
  }finally{
    delete SNIPPET_TRACKS[SB_SHEET_TMP];
    delete caChordModes[SB_SHEET_TMP];
  }
}
/* One pdf against one song. Resolves { ok, cols, why, table, names, changes, modes } or { refuse: one line }. */
async function sbSheetJudge(id, doc, bytes){
  let first = null;
  for(const cols of [1, 2]){
    let model;
    try{ model = await pcSheetRead(async () => ({ data: bytes.slice() }), cols === 1); }
    catch(e){ return { refuse: e && e.code === 'notext' ? SB_SHEET_NOTEXT : 'That pdf could not be read (' + String((e && e.message) || e).slice(0, 100) + ').' }; }
    try{
      const lays = sbSheetLayouts(id, doc);
      let res = null;
      for(const { mode, L } of lays){
        const r = pcSheetAlign(L, model);
        const one = { ok: r.ok, cols, mode, modes: lays.length, why: r.why, table: r.table, names: model.toks.length - r.skipped, changes: r.count };
        if(!res || !r.ok) res = one;
        if(!r.ok) break;
      }
      if(res.ok) return res;
      if(!first) first = res;
    }finally{
      try{ if(model && model.doc) model.doc.destroy(); }catch(e){}
    }
  }
  return first;
}
/* Runs the check on the row's pdf against the selected published song. */
async function sbSheetRun(){
  const id = sbSel, p = sbPublished && sbPublished.get(id), f = sbSh.id === id ? sbSh.file : null;
  if(!p || !p.doc || !f || sbSh.reading) return;
  const ep = sbSh.epoch, key = sbSheetKey(p.doc, f.sha256);
  sbSh.reading = true; sbSh.res = null;
  teacherSbPaint();
  let res;
  try{ res = await sbSheetJudge(id, p.doc, f.bytes); }
  catch(e){ res = { refuse: 'That pdf could not be checked (' + String((e && e.message) || e).slice(0, 100) + ').' }; }
  if(ep !== sbSh.epoch) return;
  sbSh.reading = false;
  sbSh.res = Object.assign(res, { key });
  teacherSbPaint();
}
/* A pdf dropped or picked on the row: refused on its size or its first bytes before it is read. */
async function sbSheetPick(file){
  const id = sbSel;
  if(!file || !sbPublished || !sbPublished.has(id)) return;
  sbSheetSync(id);
  const ep = ++sbSh.epoch;
  sbSh.reading = false; sbSh.res = null; sbSh.file = null; sbNote = '';
  const name = String(file.name || 'the pdf');
  const refuse = line => { sbSh.file = { name, bytes: null, sha256: '' }; sbSh.res = { refuse: line, key: '' }; teacherSbPaint(); };
  if(!(file.size > 0)){ refuse('That file is empty.'); return; }
  if(file.size > BS_MAX_SHEET_BYTES){ refuse(`That pdf is ${(file.size / 1e6).toFixed(1)} MB; a lyrics sheet can be at most 5 MB.`); return; }
  let bytes;
  try{ bytes = new Uint8Array(await file.arrayBuffer()); }
  catch(e){ if(ep === sbSh.epoch) refuse('That file could not be read.'); return; }
  if(ep !== sbSh.epoch) return;
  const head = String.fromCharCode(...bytes.subarray(0, 1024));
  if(head.indexOf('%PDF-') < 0){ refuse('That file is not a pdf.'); return; }
  const sha = sfHex(await crypto.subtle.digest('SHA-256', bytes));
  if(ep !== sbSh.epoch) return;
  sbSh.file = { name, bytes, sha256: sha, stored: false };
  sbSheetRun();
}
/* Check it again: the stored sheet read back (one song download this month), then the same check. */
async function sbSheetCheckStored(){
  const id = sbSel, p = sbPublished && sbPublished.get(id), sh = p && p.doc && p.doc.song && p.doc.song.sheet;
  if(sbBusy || !sh) return;
  sbSheetSync(id);
  const ep = ++sbSh.epoch, gen = sbViewGen;
  sbSh.file = null; sbSh.res = null; sbSh.reading = true; sbNote = '';
  teacherSbPaint();
  try{
    await ensureDb();
    await songFileCount(db, songFileCost(sh.bytes));
    const bytes = await songFileReadPieces(db, sh.id, { bytes: sh.bytes, sha256: sh.sha256 }, null, () => sbStopped(gen));
    if(ep !== sbSh.epoch) return;
    sbSh.reading = false;
    sbSh.file = { name: 'The sheet the song has', bytes, sha256: sh.sha256, stored: true };
    sbSheetRun();
  }catch(e){
    if(ep !== sbSh.epoch) return;
    const c = e && e.code;
    sbSh.reading = false;
    sbSh.file = { name: 'The sheet the song has', bytes: null, sha256: '' };
    sbSh.res = { key: '', refuse: c === 'limit' ? 'The stored sheet cannot be read: this month\'s song downloads are at the limit (Manage → Song files).'
      : c === 'missing' || c === 'bad' ? 'The stored sheet is missing or damaged in the database: add the pdf again.'
      : 'The stored sheet could not be read: ' + (typeof teacherSfWhy === 'function' ? teacherSfWhy(e) : String((e && (e.code || e.message)) || e)) + '.' };
    if(!sbStopped(gen)) teacherSbPaint();
  }
}
/* Another song selected (sbMemFor): the row's pdf is let go, and a read still running lands nowhere. */
function sbSheetSync(id){
  if(sbSh.id === id) return;
  sbSh.id = id; sbSh.file = null; sbSh.res = null; sbSh.reading = false; sbSh.over = false; sbSh.epoch++;
}

/* ── The row ── */
function sbSheetTableHtml(table){
  const rows = (table || []).map(r => {
    const mark = r.ok === true ? '<span class="sb-ok">✓</span>' : r.ok === false ? '<span class="sb-bad">✗</span>' : '<span class="sb-hint">—</span>';
    return `<tr${r.ok === false ? ' class="bad"' : ''}><td>${escHtml(r.where)}</td><td>${escHtml((r.card || []).join(' '))}</td><td>${escHtml((r.sheet || []).join(' · ') || '—')}</td><td>${mark}</td></tr>`;
  }).join('');
  return `<div class="sb-sheet-tbl"><table><thead><tr><th>Section</th><th>The card plays</th><th>The sheet says</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
function sbSheetRowHtml(id, p){
  if(!p || !p.doc || !p.doc.song) return '';
  const off = sbBusy ? ' disabled' : '';
  const cur = p.doc.song.sheet && typeof p.doc.song.sheet === 'object' ? p.doc.song.sheet : null;
  const f = sbSh.id === id ? sbSh.file : null, res = f ? sbSh.res : null;
  const key = f && f.sha256 ? sbSheetKey(p.doc, f.sha256) : '';
  let state = '';
  if(!f && sbSh.id === id && sbSh.reading) state = '<p class="sb-note" style="margin:4px 0 0">Reading the stored sheet (one song download this month)…</p>';
  if(f){
    const name = `<div class="sb-file-name">${escHtml(f.name)}${f.bytes ? ` <span class="sb-hint">${escHtml(sbKbMb(f.bytes.length))}</span>` : ''}</div>`;
    if(sbSh.reading || (res && !res.refuse && res.key !== key)) state = name + '<p class="sb-note" style="margin:4px 0 0">Reading the pdf and checking it against the song…</p>';
    else if(res && res.refuse) state = name + `<div class="sb-flag red"><span class="fi">!</span><div class="sb-flag-body"><b>${escHtml(res.refuse)}</b> Nothing was added.</div></div>`;
    else if(res && res.ok){
      const same = cur && cur.sha256 === f.sha256;
      state = name + `<p class="sb-note sb-sheet-ok" style="margin:4px 0 6px"><span class="sb-ok">✓</span> <b>The sheet follows the song: ${res.names} chord name${res.names === 1 ? '' : 's'} over ${res.changes} change${res.changes === 1 ? '' : 's'}${res.modes > 1 ? ', with full and with power chords' : ''}.</b>${res.cols === 2 ? ' Read as two columns.' : ''}</p>`
        + (same ? `<p class="sb-hint" style="margin:0">This is the sheet the song has.</p>`
          : `<div class="sb-row"><button type="button" class="sb-btn primary" data-sb-act="sheet-add"${off}>${cur ? 'Replace the sheet with this one' : 'Add to the song'}</button><span class="sb-hint" style="margin:0">Students get a Lyrics view on the card at their next sign-in or tab return.</span></div>`);
    }
    else if(res) state = name + `<div class="sb-flag red"><span class="fi">!</span><div class="sb-flag-body"><b>The sheet does not follow the song.</b> ${escHtml(res.why)} Nothing was added: send the pdf to Claude to fix.</div></div>`
      + sbSheetTableHtml(res.table);
  }
  const have = cur ? `<p class="sb-note" style="margin:0 0 6px"><span class="sb-ok">✓</span> <b>This song has a lyrics sheet</b> (${escHtml(sbKbMb(cur.bytes))}${cur.cols === 2 ? ', two columns' : ''}): its card has a Chords / Lyrics switch.</p>`
    + `<div class="sb-row" style="margin-bottom:6px"><button type="button" class="sb-btn small" data-sb-act="sheet-check"${off || sbSh.reading ? ' disabled' : ''} title="Reads the stored pdf (one song download this month) and checks it against the song again">Check it again</button><button type="button" class="sb-btn small" data-sb-act="sheet-remove"${off}>Remove sheet</button></div>`
    : `<p class="sb-note" style="margin:0 0 6px">No lyrics sheet. A chords-over-lyrics pdf with text gives the card a Chords / Lyrics switch; it is checked against the song before anything is added.</p>`;
  return `<div class="sb-h sb-change-h">Lyrics sheet</div><div class="sb-sheet" data-sb-sheet>${have}`
    + `<label class="sb-drop${sbSh.over && sbSh.id === id ? ' over' : ''}" data-sb-sheet-drop><input type="file" accept=".pdf,application/pdf" data-sb-sheet-file${off}><span><b>${cur ? 'Drop or pick another pdf' : 'Drop the pdf here, or pick it'}</b> (a pdf with text, up to 5 MB)</span></label>`
    + (state ? `<div class="sb-sheet-state" data-sb-sheet-state>${state}</div>` : '') + `</div>`;
}
/* After a paint: the drop zone takes a dropped pdf; a check worked out for another version of the song runs again. */
function sbSheetMounted(root){
  const z = root.querySelector ? root.querySelector('[data-sb-sheet-drop]') : null;
  if(z && z.addEventListener){
    const on = v => { if(sbSh.over !== v){ sbSh.over = v; if(z.classList) z.classList.toggle('over', v); } };
    z.addEventListener('dragover', e => { e.preventDefault(); on(true); });
    z.addEventListener('dragleave', () => on(false));
    z.addEventListener('drop', e => { e.preventDefault(); on(false); const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]; if(f && !sbBusy) sbSheetPick(f); });
  }
  const p = sbPublished && sbPublished.get(sbSel), f = sbSh.id === sbSel ? sbSh.file : null;
  if(p && p.doc && f && f.bytes && !sbSh.reading && sbSh.res && !sbSh.res.refuse && sbSh.res.key !== sbSheetKey(p.doc, f.sha256)) sbSheetRun();
}
function sbSheetChange(e){
  const t = e.target;
  if(!t || !t.matches || !t.matches('[data-sb-sheet-file]')) return false;
  const f = t.files && t.files[0];
  if(f && !sbBusy) sbSheetPick(f);
  return true;
}
function sbSheetAct(act){
  if(act === 'sheet-add'){ sbSheetWrite('add'); return true; }
  if(act === 'sheet-remove'){ sbSheetWrite('remove'); return true; }
  if(act === 'sheet-check'){ sbSheetCheckStored(); return true; }
  return false;
}

/* ── Add to the song / Remove sheet ── */
async function sbSheetWrite(kind){
  const id = sbSel, p = sbPublished && sbPublished.get(id);
  if(sbBusy || !p || !p.doc || !p.doc.song) return;
  if(typeof teacherBsBusy !== 'undefined' && teacherBsBusy){ sbNote = 'Nothing was changed: an Import in Manage → Built songs is still running. Try again when it ends.'; teacherSbPaint(); return; }
  const cur = p.doc.song.sheet && typeof p.doc.song.sheet === 'object' ? p.doc.song.sheet : null;
  const f = sbSh.id === id ? sbSh.file : null, res = f ? sbSh.res : null;
  let sheet = null;
  if(kind === 'add'){
    /* Only a pdf checked against THIS version of the song, and passed. */
    if(!f || !f.bytes || sbSh.reading || !res || !res.ok || res.key !== sbSheetKey(p.doc, f.sha256)) return;
    if(cur && cur.sha256 === f.sha256) return;
    sheet = { id: sbSheetIdFor(id, f.sha256), bytes: f.bytes.length, sha256: f.sha256 };
    if(res.cols === 2) sheet.cols = 2;
  } else {
    if(!cur) return;
    if(!confirm(`Remove the lyrics sheet from "${p.title}"? The card loses its Lyrics view at students' next sign-in or tab return, and the pdf is deleted from the class database.`)) return;
  }
  const doc = sbSheetDocWith(p.doc, sheet);
  const why = builtSongCheck(id, doc);
  if(!why.length && sheet && typeof SONG_FILES !== 'undefined' && Object.prototype.hasOwnProperty.call(SONG_FILES, sheet.id)) why.push(`its id ${sheet.id} is on the site's list of song files`);
  if(why.length){ sbNote = 'Nothing was changed: ' + why[0] + '.'; teacherSbPaint(); return; }
  const gen = sbViewGen, d = sbSheetOwnDraft(id), was = JSON.stringify(p.doc);
  sbBusy = 'sheet'; sbOpGen++; sbNote = ''; sbProgress = kind === 'add' ? 'Adding the lyrics sheet…' : 'Removing the lyrics sheet…'; teacherSbPaint();
  let step = 'file';
  const w = { stopped: () => sbStopped(gen), wrote: false, k: -1, n: 0, progress: line => { sbProgress = line; const el = document.querySelector('[data-sb-status]'); if(el){ el.hidden = false; el.textContent = line; } } };
  try{
    await ensureDb();
    if(sbStopped(gen)) throw 'stop';
    const entry = sheet ? { file: sheet.id + '.pdf', bytes: sheet.bytes, sha256: sheet.sha256 } : null;
    if(sheet){
      const hs = await db.collection('songFiles').doc(sheet.id).get();
      if(!teacherSfHeadMatches(hs.exists ? hs.data() || {} : null, entry)) await teacherSfPutFile(sheet.id, entry, f.bytes, 1, w);
    }
    step = 'song';
    if(sbStopped(gen)) throw 'stop';
    let ver = 0;
    const ref = db.collection('builtSongsMeta').doc('list'), sref = db.collection('builtSongs').doc(id);
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref), ss = await tx.get(sref);
      if(sheet){
        const hs2 = await tx.get(db.collection('songFiles').doc(sheet.id));
        if(!teacherSfHeadMatches(hs2.exists ? hs2.data() || {} : null, entry)) throw { why: 'the sheet in the database is missing or not this pdf (another tab deleted it?). Try again' };
      }
      /* The song this page drew, still: a Publish or an Import in another tab in the gap refuses (nothing written). */
      const now = ss.exists ? Object.assign({}, ss.data() || {}) : null;
      if(now) delete now.savedAt;
      if(!now || sbCanon(sbPubNorm(now)) !== sbCanon(sbPubNorm(JSON.parse(was)))) throw { why: 'the song was changed in another tab since this page read it. Press Refresh (open another song and come back), then try again' };
      const songs = bsListOf(snap.exists ? snap.data() : null);
      if(!songs[id]) throw { why: 'the song is no longer on the Songs page list (unpublished in another tab?)' };
      ver = teacherBsNextVer(Math.max(songs[id] || 0, Number(p.ver) || 0, Number(d && d.pubVer) || 0));
      songs[id] = ver;
      tx.set(sref, Object.assign({}, doc, { savedAt: firebase.firestore.FieldValue.serverTimestamp() }));
      tx.set(ref, { songs, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      /* The draft in the same commit, as Publish: Edit and a later Publish keep the sheet, and its server time is the
         song's (sbDraftStale). */
      if(d) tx.set(db.collection('songDrafts').doc(id), Object.assign({}, sbDraftDoc(Object.assign({}, d, { sheet })), { savedAt: firebase.firestore.FieldValue.serverTimestamp() }));
    });
    step = 'done';
    const t = Date.now();
    sbPublished.set(id, Object.assign({}, p, { ver, doc: JSON.parse(JSON.stringify(doc)), at: t }));
    if(d){ d.sheet = sheet ? JSON.parse(JSON.stringify(sheet)) : null; d.savedAt = t; }
    if(cur && !(sheet && sheet.id === cur.id)) await sbDeleteAudio(cur.id, null);
    sbSh.file = null; sbSh.res = null; sbSh.epoch++;
    sbNote = kind === 'add' ? `Added the lyrics sheet to "${p.title}" (${teacherBsVerText(ver)}). Students get a Chords / Lyrics switch on its card at their next sign-in or tab return.`
      : `Removed the lyrics sheet from "${p.title}" (${teacherBsVerText(ver)}).`;
    if(typeof builtSongsSync === 'function') builtSongsSync();
  }catch(e){
    const where = step === 'song' && sheet ? ' The pdf is stored; the song was not changed, so students have what they had before.' : ' Nothing was changed.';
    const head = kind === 'add' ? 'Not added: ' : 'Not removed: ';
    if(e === 'stop') sbNote = 'Stopped: you left the Song builder.' + (step === 'file' && w.wrote ? ' The pdf\'s upload did not finish; the song was not changed.' : where);
    else if(e && e.shape) sbNote = head + e.shape + '.' + where;
    else if(e && e.why) sbNote = head + e.why + '.' + where;
    else sbNote = head + (typeof teacherSfWhy === 'function' ? teacherSfWhy(e) : String((e && (e.code || e.message)) || e)) + '.' + where;
  }finally{
    sbBusy = ''; sbProgress = ''; sbOpGen++;
    if(!sbStopped(gen)) teacherSbPaint();
  }
}
