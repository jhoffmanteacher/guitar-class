/* ── Song builder: Preview, Publish, the published song (2026-11-16, Song builder Part d) ───────────────────
   Steps 6 and 7 of the Song builder (teacher-sb-core.js has the view and the draft; work order "Claude outputs/
   WORK-ORDER-song-builder.md", Part d), the page of a published song (Edit, Unpublish, Delete…), Export and the
   health line.

   PREVIEW (step 6). The real card: builtSongExpand (app/builtsongs.js), the expansion every student page makes,
   drawn by caCardBodyHtml (app/cards.js) and played by the card's own player, at the four one-file stops (0.65, 0.85,
   0.9, 1; it opens on 0.85). Two things differ from a student's card, both so the console never touches what the
   page's merge put there: the card's id and track key are SB_PV_ID (the draft's id may already be a published song
   on this page), and the track's src is the levelled copy already in this tab (sbMem.level, read from songFiles and
   checked against its SHA-256 by sbLoadLevel, or just made by Volume), so a preview counts no second download. The
   card is in CLASS_ACTIVITIES / SNIPPET_TRACKS only while the Preview step is on screen (sbPreviewStop(true) takes
   it out on every way off it). The builder adds no language switch (the console is English); the card's own words
   follow the page's language like every card the console draws (its header's Español button), and a line says the
   Spanish card's words come from the fixed templates. The Full / Power switch is answered here (sbPvCapture): caSetChordMode would save the choice and
   redraw a console view that is not this one.
   THE LISTENS (Publish needs three: the card's first section, a middle one, its last; one or two for a card that
   short). A section counts as heard when ONE unbroken run of the play began within its first half bar and reached
   its last 0.3 bar (sbPvStep; a lap back to the start, a stop or another section ends a run). The card is looked at
   every SB_PV_TICK_MS while it plays (started by a press in the card, ended when it stops). They are saved in the
   draft (listens: { sig, heard }), and count only while sig is the song's own: a changed chart, beat, level, title
   aside, or copy starts them over. While the card plays, a repaint (a save, a list read) moves the same card element
   into the new page, so the song keeps playing.

   PUBLISH (step 7) is on only when sbPublishWhy says nothing: builtSongCheck passes on the EXACT doc it will write
   (the same function every student page runs before it shows a song), the record is within 10 cents of A = 440
   (Jonathan, 2026-11-14: blocked, send it to Claude), every drift window over 30 ms is pinned (beat.driftOff 0), the
   three listens are done, the audio id is not on SONG_FILES and no other built song uses it with other bytes, and the
   list has room. A record that needs more than SB_PINS_MAX pins shows the Beat step's red box here too ("This song
   does not fit the builder"), and does NOT block (Jonathan, 2026-11-15 and 2026-11-16). The only place it goes:
   Songs → "More Play Along songs" (the board is Part e, later). Writes, in this order:
     1. (reads) songFiles/{audio.id} must be 'ready' and match the audio entry; builtSongsMeta/list must have room;
     2. builtSongs/{id} = { v, title, artist, audio, song, savedAt: the server's time } (the rules' shape);
     3. builtSongsMeta/list, in a transaction: songs[id] + 1 (every other entry kept), updatedAt the server's time;
     4. the song's previous audio, when the edit replaced it: deleted once nothing on the list plays it (sbDeleteAudio).
   So the list never names a song that is not saved. Students get it at their next sign-in, or a tab return (read at
   most every 15 minutes, app/builtsongs.js BS_RETURN_MS); this console's Songs view at once (builtSongsSync).
   EDIT opens the steps of a published song (sbEditing, this tab only) on the step he picks (Jonathan, 2026-11-16:
   "edit gives a choice of step": Upload, Volume, Beat, Chart, Level, Preview, one click each; the header's Edit and the
   highlighted choice are Chart); every change is saved in the draft, and students keep the published song until
   Publish runs again. The draft's old levelled copy is kept while the published song plays it (sbDeleteAudio).
   UNPUBLISH: the draft keeps the song's edit number (pubVer: a later Publish counts on from it, since a Chromebook
   keeps a song by that number), then builtSongsMeta/list loses the song (a transaction), then builtSongs/{id} is
   deleted; the draft and its copy stay (a published copy the draft no longer uses is deleted, as at 4. above).
   DELETE… (a published song): the typed title (the standing rule for deletes in the console; Jonathan, 2026-11-15),
   then the list entry, builtSongs/{id}, the draft, and every copy the song or its draft named that nothing else on the
   list plays. Students' songOpens counts are in their own progress and are not touched.
   An IMPORTED song (Manage → Built songs, teacher-builtsongs.js) has no draft. Edit and Unpublish (Jonathan,
   2026-11-16: "they should get edit/unpublish") first REBUILD one from its builtSongs doc (sbDraftFromDoc) and save
   it: title, artist, the audio entry, the sections, bars, lyric lines, level and range, the chord shapes AS THEY CAME
   (chart.shapes), and the beat as it came (beat.fromImport: its bpm unrounded, bar 1, and its bar times when it has
   them, kept exactly: the Beat step shows them read-only and sbBarTime follows them). Unchanged, it publishes the same
   song (tools/song-builder-sim.mjs proves it). NOT recoverable: the chart's original text (the Chart step says so and
   shows the grid), the taps and drift windows (the Beat step says the bars came with the song), the loudness
   measurements and the original mp3 (the Volume and Upload steps say so; levelling again needs the original picked,
   as for any reopened draft). The listens start empty.
   EXPORT (Jonathan, 2026-11-16: "export should save mp3 too"): two downloads that pair up by name, <title>-<id>.json
   (the Import file, { id, v, title, artist, audio, song }) and <title>-<id>.mp3 (the levelled copy: from this tab
   when it is loaded, else read from songFiles, which counts as one song download, as the button's hint says).
   Manage → Built songs imports the pair as it is; tools/built-song-check.mjs checks it.
   THE HEALTH LINE (the list's head): "N published; all pass today's checks", or each song that fails builtSongCheck
   today (a code change to the validator can make an old song fail; a student's page then leaves it out).

   WRITES: builtSongs/{id}, builtSongsMeta/list, songDrafts/{id} (through sbWriteDraft), songFiles/{id} and its pieces
   (deletes only, sbDeleteAudio): never progress/{uid}, never config/class. tools/song-builder-sim.mjs runs this part
   against a stub Firestore that checks every write against the rules' shape. Every value from the store or a file
   is escaped where it is drawn; buttons carry data-* only (sbClick, teacher-sb-core.js, routes them here). */
const SB_PV_ID = 'sbpreview';          // the preview card's id and track key while the Preview step is on screen
const SB_PV_TICK_MS = 100;             // how often a playing preview card is looked at for the listens
const SB_PV_START = 0.5, SB_PV_END = 0.3;   // a heard section: began within its first half bar, reached its last 0.3 bar
let sbPv = null;                       // { id, key, sig, node, act, run, L } the preview card on screen
let sbPvTimer = 0, sbPvSaveTimer = 0;
const sbEditing = new Set();           // published songs whose steps are open in this tab (Edit)

/* ── The song a draft makes, and comparing it with what is published ── */
/* JSON with sorted keys: a doc read back from the store compares equal to the one the draft makes. */
function sbCanon(v){
  if(Array.isArray(v)) return '[' + v.map(sbCanon).join(',') + ']';
  if(v && typeof v === 'object') return '{' + Object.keys(v).filter(k => v[k] !== undefined).sort().map(k => JSON.stringify(k) + ':' + sbCanon(v[k])).join(',') + '}';
  return JSON.stringify(v === undefined ? null : v);
}
function sbHash(s){ let h = 0x811c9dc5; for(let i = 0; i < s.length; i++){ h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; } return h.toString(16).padStart(8, '0'); }
const SB_AUDIO_KEYS = ['id', 'bytes', 'sha256', 'durationSec', 'centsOff', 'gainDb', 'sourceSha256'];
/* The builtSongs doc this draft publishes (savedAt aside), or null while it has no song or no copy yet. */
function sbDocOf(d){
  const song = d ? sbSongOf(d) : null;
  if(!song || !d.audio) return null;
  const audio = {};
  SB_AUDIO_KEYS.forEach(k => { if(d.audio[k] !== undefined && d.audio[k] !== null) audio[k] = d.audio[k]; });
  return { v: 1, title: String(d.title || '').trim(), artist: String(d.artist || '').trim(), audio, song };
}
/* The draft differs from the published song (the change students do not have yet). */
function sbPubChanged(d, p){
  if(!d || !p || !p.doc) return !!d;
  const doc = sbDocOf(d);
  return !doc || sbCanon(doc) !== sbCanon(p.doc);
}
/* Today's verdict on a published song: the checks a student's page runs before it shows one (bsKeep). */
function sbPubVerdict(id, p){
  if(!p || !p.doc) return { ok: false, text: 'the list names it, but its song is not in the database' };
  const why = builtSongCheck(id, p.doc);
  const a = p.doc.audio || {};
  if(!why.length && typeof SONG_FILES !== 'undefined' && Object.prototype.hasOwnProperty.call(SONG_FILES, a.id)) why.push(`its audio id ${a.id} is on the site's list of song files (the list wins)`);
  if(!why.length && sbPublished) for(const [oid, o] of sbPublished){
    if(oid < id && o.doc && o.doc.audio && o.doc.audio.id === a.id && o.doc.audio.sha256 !== a.sha256){ why.push(`its audio id ${a.id} is ${oid}'s, with other bytes`); break; }
  }
  return why.length ? { ok: false, text: why[0] + (why.length > 1 ? ` (and ${why.length - 1} more)` : '') } : { ok: true, text: 'passes today\'s checks' };
}
function sbHealthHtml(){
  if(!sbPublished || !sbPublished.size) return '';
  const n = sbPublished.size, bad = [...sbPublished].filter(([id, p]) => !sbPubVerdict(id, p).ok);
  if(!bad.length) return `<div class="sb-health" role="status" data-sb-health>${n} published; all pass today's checks</div>`;
  return `<div class="sb-health bad" role="status" data-sb-health>${n} published; ${bad.length === 1 ? 'this one fails' : `${bad.length} fail`} today's checks, so students' pages leave ${bad.length === 1 ? 'it' : 'them'} out: `
    + bad.map(([id, p]) => `<b>${escHtml(p.title)}</b> (${escHtml(sbPubVerdict(id, p).text)})`).join('; ') + '</div>';
}

/* ── The listens ── */
function sbListenSig(doc){ return sbHash(sbCanon([doc.song, doc.audio.sha256])); }
function sbCardSections(doc){
  const s = doc.song, r = s.range || { from: 0, to: s.sections.length - 1 };
  return s.sections.slice(r.from, r.to + 1);
}
/* What Publish needs heard, and what is: { items: [{ key, label, done }], all, sig, n }. */
function sbListensOf(d, doc){
  doc = doc || sbDocOf(d);
  if(!doc) return { items: [], all: false, sig: '', n: 0 };
  const secs = sbCardSections(doc), n = secs.length, sig = sbListenSig(doc);
  const heard = d && d.listens && d.listens.sig === sig && Array.isArray(d.listens.heard) ? d.listens.heard : [];
  const lab = k => bsSectionLabel(secs[k], 'en');
  const items = [{ key: 'first', label: n === 1 ? `The song (${lab(0)})` : `The first section (${lab(0)})`, done: heard.includes(0) }];
  if(n >= 3){
    const mid = heard.find(k => k > 0 && k < n - 1);
    items.push({ key: 'mid', label: mid != null ? `A middle section (${lab(mid)})` : 'A middle section (any one)', done: mid != null });
  }
  if(n >= 2) items.push({ key: 'last', label: `The last section (${lab(n - 1)})`, done: heard.includes(n - 1) });
  return { items, all: items.every(x => x.done), sig, n };
}
function sbListensHtml(d, doc){
  const L = sbListensOf(d, doc);
  return `<div class="sb-listens" data-sb-listens><span class="sb-h">Listen before you publish:</span>`
    + L.items.map(x => `<span class="sb-listen${x.done ? ' on' : ''}"><span class="sb-check${x.done ? ' on' : ''}"></span>${escHtml(x.label)}</span>`).join('')
    + `<span class="sb-hint">Each is ticked when its play reaches the end of that section. A section's button on the card starts it there.</span></div>`;
}
/* One look at a playing card: `pos` is where the song is, in bars from the card's first bar (pcFrame's clock). */
function sbPvStep(pv, L, pos){
  pv.L = L;
  const k = L.sections.findIndex(S => pos >= S.fromBar - L.firstBar && pos < S.fromBar - L.firstBar + S.bars * S.reps);
  if(pv.run && (k !== pv.run.k || pos < pv.run.max - 0.05)) sbPvRunEnd(pv);
  if(k < 0) return;
  if(!pv.run) pv.run = { k, start: pos, max: pos };
  else pv.run.max = Math.max(pv.run.max, pos);
}
function sbPvRunEnd(pv){
  const r = pv.run, L = pv.L;
  pv.run = null;
  if(!r || !L || !L.sections[r.k]) return;
  const S = L.sections[r.k], s0 = S.fromBar - L.firstBar, s1 = s0 + S.bars * S.reps;
  if(r.start <= s0 + SB_PV_START && r.max >= s1 - SB_PV_END) sbPvHeard(pv, r.k);
}
function sbPvHeard(pv, k){
  const d = sbDrafts && sbDrafts.get(pv.id);
  if(!d) return;
  const heard = d.listens && d.listens.sig === pv.sig && Array.isArray(d.listens.heard) ? d.listens.heard.slice() : [];
  if(heard.includes(k)) return;
  heard.push(k); heard.sort((x, y) => x - y);
  d.listens = { sig: pv.sig, heard };
  const box = document.querySelector('[data-sb-root] [data-sb-listens]');
  if(box && sbSel === pv.id) box.outerHTML = sbListensHtml(d);
  sbPvSaveSoon(pv.id);
}
/* Saved once the console is free (a repaint keeps the playing card: sbPreviewMounted). */
function sbPvSaveSoon(id){
  clearTimeout(sbPvSaveTimer);
  const save = () => {
    sbPvSaveTimer = 0;
    const d = sbDrafts && sbDrafts.get(id);
    if(!d || teacherView !== 'songbuilder') return;
    if(sbBusy){ sbPvSaveTimer = setTimeout(save, 600); return; }
    sbWriteDraft(id, d);
  };
  sbPvSaveTimer = setTimeout(save, 400);
}
function sbPvLook(){
  const pv = sbPv, st = typeof pcState !== 'undefined' ? pcState : null;
  if(!pv || !pv.node || !st || !st.root || !pv.node.contains(st.root) || !pv.node.isConnected){ if(pv) sbPvRunEnd(pv); sbPvWatch(false); return; }
  if(st.counting || !st.audio || st.audio.paused || st.audio.seeking) return;
  sbPvStep(pv, st.L, snipBarsAt(st.win, st.audio.currentTime));
}
function sbPvWatch(on){
  if(on && !sbPvTimer) sbPvTimer = setInterval(sbPvLook, SB_PV_TICK_MS);
  if(!on && sbPvTimer){ clearInterval(sbPvTimer); sbPvTimer = 0; }
}

/* ── Step 6: Preview ── */
function sbPreviewPaneHtml(d){
  const why = !d ? ['No draft.'] : d.audio && !sbCopyCurrent(d) ? ['A new mp3 was picked: level it at step 2 first.'] : sbSongWhy(d, sbSel);
  if(why.length) return `<div class="sb-box"><p class="sb-note" style="margin:0">Not ready for a preview: ${escHtml(why[0])}</p></div>`;
  const doc = sbDocOf(d);
  const lv = sbMem.id === sbSel && sbMem.level && sbMem.level.sha256 === d.audio.sha256;
  const pins = d.beat && d.beat.pinsNeeded;
  return `<p class="sb-note">The real card, as students see it on the Songs page. ▶ plays the levelled copy on the beat grid you set, at the four speeds students get. It is drawn in this page's language; each student sees it in theirs, with the section names and directions from the site's fixed English and Spanish templates. The title and the lyric lines are the same in both.</p>`
    + (sbBeatTooMuch(pins) ? sbNoFitHtml(pins) : '')
    + (sbPitchBlocked(d) ? `<div class="sb-flag red"><span class="fi">!</span><div class="sb-flag-body"><b>This record is ${escHtml(sbCentsLine(d.pitch.cents))}.</b> A song more than 10 cents off cannot be published. Send the mp3 to Claude.</div></div>` : '')
    + sbListensHtml(d, doc)
    + `<div class="sb-pv-title">${escHtml(sbStudentsSee(doc.title, doc.artist))}</div>`
    + (lv ? '<div data-sb-pvslot></div>'
      : `<div class="sb-box"><p class="sb-note" style="margin:0">${d.audio && sbMem.failed === d.audio.sha256 ? 'The levelled copy did not load (the line above says why).' : 'Loading the levelled copy…'}</p></div>`);
}
/* After a paint with the Preview step showing: the card goes into its slot. The same song's card, already made, is
   moved in as it is (a song playing keeps playing); another song's is made fresh. */
function sbPreviewMounted(root){
  const d = sbDraft(), slot = root.querySelector('[data-sb-pvslot]');
  if(!d || !d.audio || sbSongWhy(d, sbSel).length){ sbPreviewStop(true); return; }
  if(!slot){
    sbPreviewStop(true);
    if(!sbBusy && sbMem.failed !== d.audio.sha256 && !(sbMem.id === sbSel && sbMem.level && sbMem.level.sha256 === d.audio.sha256)) sbLoadLevel();
    return;
  }
  const doc = sbDocOf(d), lv = sbMem.level;
  const key = sbPvKey(sbSel, doc);
  if(sbPv && sbPv.key === key && sbPv.node){ slot.replaceWith(sbPv.node); return; }
  sbPreviewStop(true);
  if(typeof caCardBodyHtml !== 'function' || !Array.isArray(window.CLASS_ACTIVITIES) || typeof SNIPPET_TRACKS === 'undefined') return;   // no card renderer (a Node tool)
  const ex = builtSongExpand(sbSel, doc);
  const act = JSON.parse(JSON.stringify(ex.activity));
  act.id = SB_PV_ID; act.card.track = SB_PV_ID;
  if(!lv.url) lv.url = URL.createObjectURL(new Blob([lv.bytes], { type: 'audio/mpeg' }));
  window.CLASS_ACTIVITIES.push(act);
  SNIPPET_TRACKS[SB_PV_ID] = Object.assign({}, ex.track, { src: lv.url });
  if(typeof caChordModes !== 'undefined') delete caChordModes[SB_PV_ID];
  const host = document.createElement('div');
  host.className = 'sb-pv-host';
  host.innerHTML = caCardBodyHtml(act, { preview: true });
  host.addEventListener('click', sbPvCapture, true);
  slot.replaceWith(host);
  sbPv = { id: sbSel, key, sig: sbListenSig(doc), node: host, act, run: null, L: null };
}
/* The card on screen is made again when the song or the page's language changes (review R1-8: Español). */
function sbPvKey(id, doc){ return id + '|' + (typeof getLang === 'function' ? getLang() : '') + '|' + sbHash(sbCanon(doc)); }
/* A press in the card: watch it for the listens; the Full / Power switch is redrawn here, in this card only. */
function sbPvCapture(e){
  const pv = sbPv;
  if(!pv) return;
  sbPvWatch(true);
  const b = e.target && e.target.closest ? e.target.closest('.ca-chord-switch button') : null;
  if(!b || !pv.node.contains(b)) return;
  e.stopPropagation(); e.preventDefault();
  const want = [...b.parentNode.querySelectorAll('button')].indexOf(b) === 1 ? 'power' : 'full';
  if(caChordMode(pv.act) === want) return;
  sbPreviewStop(false);
  caChordModes[SB_PV_ID] = want;       // this tab only: never saved (caSetChordMode would save it under the preview's id)
  pv.node.innerHTML = caCardBodyHtml(pv.act, { preview: true });
}
/* Stops the preview card's song (only when it is THIS card that plays: never a global stopper in the console) and
   the watch; drop = the card leaves the page's lists too (off the Preview step, another song, leaving the view). */
function sbPreviewStop(drop){
  sbPvWatch(false);
  const pv = sbPv;
  if(pv && pv.node){
    if(typeof pcState !== 'undefined' && pcState && pcState.root && pv.node.contains(pcState.root) && typeof pcStop === 'function') pcStop();
    if(typeof songFileCancelWaitIn === 'function') songFileCancelWaitIn(pv.node);
    pv.run = null;
  }
  if(!drop) return;
  sbPv = null;
  const list = window.CLASS_ACTIVITIES;
  if(Array.isArray(list)) for(let i = list.length - 1; i >= 0; i--) if(list[i] && list[i].id === SB_PV_ID) list.splice(i, 1);
  if(typeof SNIPPET_TRACKS !== 'undefined') delete SNIPPET_TRACKS[SB_PV_ID];
  if(typeof caChordModes !== 'undefined') delete caChordModes[SB_PV_ID];
}

/* ── Step 7: Publish ── */
/* Every reason Publish is off ([] = it can publish). */
function sbPublishWhy(d, id){
  if(!d) return ['There is no draft.'];
  const why = [], pitch = sbPitchBlocked(d) || !!(d.audio && !(Math.abs(Number(d.audio.centsOff)) <= BS_MAX_CENTS));
  /* Review R1-2: a new mp3 picked after levelling: the stored copy is the OLD record's until Volume runs again. */
  if(d.audio && !sbCopyCurrent(d)) why.push('A new mp3 was picked: level it at step 2 first.');
  if(pitch) why.push(`The record is ${sbCentsLine(d.pitch ? d.pitch.cents : d.audio.centsOff)}: a song more than 10 cents off A = 440 cannot be published. Send the mp3 to Claude.`);
  const songWhy = sbSongWhy(d, id);
  songWhy.forEach(w => why.push(w));
  const doc = sbDocOf(d);
  if(doc && !songWhy.length){
    /* The exact doc Publish writes, through the function every student page runs (the pitch said once, above). */
    builtSongCheck(id, doc).filter(w => !(pitch && /^audio\.centsOff/.test(w))).forEach(w => why.push(w));
    const a = doc.audio;
    if(typeof SONG_FILES !== 'undefined' && Object.prototype.hasOwnProperty.call(SONG_FILES, a.id)) why.push(`Its audio id ${a.id} is on the site's list of song files.`);
    if(sbPublished) for(const [oid, o] of sbPublished) if(oid !== id && o.doc && o.doc.audio && o.doc.audio.id === a.id && o.doc.audio.sha256 !== a.sha256){ why.push(`Its audio id ${a.id} is already ${oid}'s, with other bytes.`); break; }
    if(Array.isArray(window.CLASS_ACTIVITIES) && window.CLASS_ACTIVITIES.some(x => x && x.id === id && !(typeof bsApplied !== 'undefined' && bsApplied.has(id)))) why.push(`The id ${id} is already a song in the site's code.`);
    if(sbPublished && !sbPublished.has(id) && sbPublished.size >= BS_MAX_SONGS) why.push(`The Songs page list already holds ${BS_MAX_SONGS} built songs, the most it can.`);
  }
  if(!d.beat || !Number.isFinite(d.beat.driftOff)) { if(d.beat) why.push('Open the Beat step once, so the drift check runs.'); }
  else if(d.beat.driftFor && d.audio && d.beat.driftFor !== d.audio.sha256) why.push('The drift check was made on another levelled copy: open the Beat step once, so it runs on this one.');
  else if(d.beat.driftOff > 0) why.push(`${d.beat.driftOff} place${d.beat.driftOff === 1 ? '' : 's'} in the song drift${d.beat.driftOff === 1 ? 's' : ''} more than 30 ms from the grid: pin ${d.beat.driftOff === 1 ? 'it' : 'each one'} at the Beat step.`);
  if(doc && !songWhy.length && !sbListensOf(d, doc).all) why.push('Listen at the Preview step: the first section, a middle one and the last, each to its end.');
  if(d.dirty) why.push('The title or artist has a change that is not saved: go to step 1 and press Next.');
  return why;
}
function sbPublishBtnHtml(d){
  const p = sbPublished && sbPublished.get(sbSel), why = sbPublishWhy(d, sbSel);
  const same = p && !sbPubChanged(d, p);
  const label = same ? 'Published (no changes)' : p ? 'Publish the changes…' : 'Publish…';
  return `<button type="button" class="sb-btn primary" data-sb-act="publish"${sbBusy || why.length || same ? ' disabled' : ''}${why.length ? ` title="${escAttr(why[0])}"` : ''}>${label}</button>`;
}
function sbLevelLine(song){
  const lv = song.level, v = lv.versions === 'both' ? `Full and power chords, opens on ${lv.start === 'power' ? 'Power' : 'Full'} chords` : lv.versions === 'power' ? 'Power chords only' : 'Full chords only';
  const r = song.range, secs = song.sections;
  return v + '; ' + (r ? `sections ${bsSectionLabel(secs[r.from], 'en')} to ${bsSectionLabel(secs[r.to], 'en')}` : 'the whole song') + ', looping at its end';
}
function sbPublishPaneHtml(d){
  if(!d || !sbStepReady(d, 7)) return `<div class="sb-box"><p class="sb-note" style="margin:0">Not ready yet: ${escHtml((d && d.audio && !sbCopyCurrent(d) ? 'A new mp3 was picked: level it at step 2 first.' : d && sbSongWhy(d, sbSel)[0]) || 'finish the steps before it.')}</p></div>`;
  const doc = sbDocOf(d), why = sbPublishWhy(d, sbSel), p = sbPublished && sbPublished.get(sbSel);
  const ok = s => `<span class="sb-ok">✓</span>${s ? ' ' + s : ''}`, bad = s => `<span class="sb-bad">✗</span> ${s}`;
  const v = d.volume || {}, a = doc.audio, b = d.beat, s = doc.song, L = sbListensOf(d, doc);
  const nPins = sbPins(b).length, open = sbChartOpen(d, sbChartReadOf(d));
  const pitchBad = sbPitchBlocked(d) || !(Math.abs(Number(a.centsOff)) <= BS_MAX_CENTS);
  const songWhy = sbSongWhy(d, sbSel), checkWhy = songWhy.length ? songWhy : builtSongCheck(sbSel, doc).filter(w => !/^audio\.centsOff/.test(w));
  const rows = [
    ['Recording', `${escHtml(sbLen(a.durationSec))}, levelled to the cure (${a.gainDb >= 0 ? '+' : '−'}${escHtml(Math.abs(Number(a.gainDb) || 0).toFixed(1))} dB), ${escHtml(sbMb(a.bytes))} behind the school sign-in ` + ok('')],
    ['Pitch', pitchBad ? bad(`${escHtml(sbCentsLine(d.pitch ? d.pitch.cents : a.centsOff))}: send the mp3 to Claude`) : `${escHtml(sbCentsLine(d.pitch ? d.pitch.cents : a.centsOff))} ` + ok('')],
    ['Beat', `${escHtml(sbPinBpm(b).toFixed(1))} BPM, bar 1 at ${escHtml(sbFmtT(b.anchor))}, ${b.fromImport ? `the bars as they came with the imported song${Array.isArray(b.barTimes) ? ` (${b.barTimes.length} bar times)` : ''}` : `${nPins} pin${nPins === 1 ? '' : 's'}`} `
      + (b.driftOff > 0 ? bad(`${b.driftOff} place${b.driftOff === 1 ? '' : 's'} drift over 30 ms`) : Number.isFinite(Number(b.driftOff)) ? ok('') : bad('drift not checked yet'))
      + (sbBeatTooMuch(b.pinsNeeded) ? ' <span class="sb-warn">does not fit the builder (see below)</span>' : '')],
    ['Chart', `${s.sections.length} section${s.sections.length === 1 ? '' : 's'}, ${s.bars.length} bars, ${escHtml(Object.keys(s.chords).join(' '))} `
      + (open.n ? `<span class="sb-warn">${open.n} thing${open.n === 1 ? '' : 's'} at the Chart step still want${open.n === 1 ? 's' : ''} a look (this does not stop Publish)</span>` : ok(''))],
    ['Level', escHtml(sbLevelLine(s))],
    ['Checks', checkWhy.length ? bad(escHtml(checkWhy[0]) + (checkWhy.length > 1 ? ` (and ${checkWhy.length - 1} more)` : '')) : 'passes every check a student\'s page runs ' + ok('')],
    ['Listens', L.items.map(x => (x.done ? '<span class="sb-ok">✓</span> ' : '<span class="sb-bad">✗</span> ') + escHtml(x.label)).join(' · ')],
  ];
  const same = p && !sbPubChanged(d, p);
  return `<div class="sb-cols c3"><div>
      <div class="sb-h">${same ? 'Published, and nothing has changed since' : why.length ? 'Not ready to publish' : 'Ready to publish'}</div>
      <dl class="sb-kv sb-pubkv">${rows.map(([k, h]) => `<dt>${k}</dt><dd>${h}</dd>`).join('')}</dl>
      ${sbBeatTooMuch(b.pinsNeeded) ? sbNoFitHtml(b.pinsNeeded) + '<p class="sb-hint">This does not stop Publish.</p>' : ''}
      ${why.length && !same ? `<div class="sb-flag red"><span class="fi">!</span><div class="sb-flag-body"><b>Publish is off until:</b><ul class="sb-list">${why.slice(0, 6).map(w => `<li>${escHtml(w)}</li>`).join('')}</ul>${why.length > 6 ? `and ${why.length - 6} more.` : ''}</div></div>` : ''}
    </div><div>
      <div class="sb-h">Where does it go?</div>
      <div class="sb-opt on sb-where" role="note"><span class="sb-radio"></span><span><span class="sb-opt-t">Songs page · More Play Along songs</span><span class="sb-opt-d">Every student can open it: no date, no Mark complete, never required.</span></span></div>
      <p class="sb-hint">${p ? `Students have the ${escHtml(teacherBsVerText(p.ver))} now. Publishing the changes replaces it` : 'Students see it'} at their next sign-in, or when they come back to the site's tab (it checks at most every 15 minutes).</p>
      <div class="sb-row"><button type="button" class="sb-btn small" data-sb-act="export" data-sb-v="draft"${sbBusy ? ' disabled' : ''}>Export the song file and its mp3</button></div>
      <p class="sb-hint">${escHtml(SB_EXPORT_HINT)}</p>
    </div></div>`;
}
async function sbPublish(){
  const d = sbDraft(), id = sbSel;
  if(sbBusy || !d || !sbIsDraftId(id)) return;
  if(typeof teacherBsBusy !== 'undefined' && teacherBsBusy){ sbNote = 'Not published: an Import in Manage → Built songs is still running. Try again when it ends.'; teacherSbPaint(); return; }
  const why = sbPublishWhy(d, id);
  if(why.length){ sbNote = 'Not published: ' + why[0]; teacherSbPaint(); return; }
  const doc = sbDocOf(d), was = sbPublished && sbPublished.get(id);
  if(!confirm(was ? `Publish your changes to "${doc.title}"? Students get the new version at their next sign-in or tab return. Students who have the song open now keep the old version, or lose its sound, until they reload.`
    : `Publish "${doc.title}"? It goes on the Songs page under More Play Along songs for every student, at their next sign-in or tab return.`)) return;
  const gen = sbViewGen;
  sbStopSounds();
  sbBusy = 'publish'; sbOpGen++; sbNote = ''; sbProgress = 'Checking the levelled copy in the database…'; teacherSbPaint();
  let step = 'check';
  try{
    await ensureDb();
    const hs = await db.collection('songFiles').doc(doc.audio.id).get();
    if(!teacherSfHeadMatches(hs.exists ? hs.data() || {} : null, { bytes: doc.audio.bytes, sha256: doc.audio.sha256 })) throw { why: 'the levelled copy in the database is missing, unfinished or not the one this draft names. Level it again at step 2' };
    const ref = db.collection('builtSongsMeta').doc('list');
    if(sbStopped(gen)) throw 'stop';
    step = 'song';
    sbProgress = 'Saving the song…'; teacherSbPaint();
    /* The song and the list in ONE transaction (review R1-1, 2026-11-16): both land or neither does, so an edit is
       never half published (a new song doc under the old edit number, which a Chromebook holding that number would
       never fetch). Firestore checks each write against its own rule, as two separate writes would be. */
    let ver = 0;
    await db.runTransaction(async tx => {
      const snap = await tx.get(ref);
      const songs = bsListOf(snap.exists ? snap.data() : null);
      if(!songs[id] && Object.keys(songs).length >= BS_MAX_SONGS) throw { why: `the Songs page list already holds ${BS_MAX_SONGS} built songs, the most it can` };
      /* Never a number used before (teacherBsNextVer: from the clock, and past the list's and the draft's last one): a
         Chromebook keeps a song by its edit number (app/builtsongs.js), so a number used again would show it the old song. */
      ver = teacherBsNextVer(Math.max(songs[id] || 0, Number(d.pubVer) || 0));
      songs[id] = ver;
      tx.set(db.collection('builtSongs').doc(id), Object.assign({}, doc, { savedAt: firebase.firestore.FieldValue.serverTimestamp() }));
      tx.set(ref, { songs, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
    });
    step = 'done';
    if(!sbPublished) sbPublished = new Map();
    sbPublished.set(id, { title: doc.title, artist: doc.artist, ver, audioId: doc.audio.id, doc: JSON.parse(JSON.stringify(doc)), at: Date.now() });
    sbEditing.delete(id);
    if(was && was.doc && was.doc.audio && was.doc.audio.id !== doc.audio.id) await sbDeleteAudio(was.doc.audio.id, null);
    sbNote = `Published "${doc.title}" (${teacherBsVerText(ver)}). It is on the Songs page under More Play Along songs; students see it at their next sign-in or tab return.`;
    if(typeof builtSongsSync === 'function') builtSongsSync();
  }catch(e){
    const where = step === 'song' ? ' Nothing was written: students have what they had before. Press Publish again.' : ' Nothing was written.';
    if(e === 'stop') sbNote = 'Stopped: you left the Song builder.' + where;
    else if(e && e.why) sbNote = 'Not published: ' + e.why + '.' + (step === 'check' ? '' : where);
    else sbNote = 'Not published: ' + (typeof teacherSfWhy === 'function' ? teacherSfWhy(e) : String((e && (e.code || e.message)) || e)) + '.' + where;
  }finally{
    sbBusy = ''; sbProgress = ''; sbOpGen++;
    if(!sbStopped(gen)) teacherSbPaint();
  }
}
/* The list without `id` (a transaction: every other entry kept). Resolves true when it named the song. */
async function sbListDrop(id){
  const ref = db.collection('builtSongsMeta').doc('list');
  let had = false;
  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const songs = bsListOf(snap.exists ? snap.data() : null);
    had = Object.prototype.hasOwnProperty.call(songs, id);
    if(!had) return;
    delete songs[id];
    tx.set(ref, { songs, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
  });
  return had;
}
async function sbUnpublish(){
  const id = sbSel, p = sbPublished && sbPublished.get(id);
  /* An imported song has no draft: one is rebuilt from the published doc and saved first, so nothing is thrown away. */
  const d = sbDraft() || (p && p.doc && !builtSongCheck(id, p.doc).length ? sbDraftFromDoc(id, p) : null);
  if(sbBusy || !p) return;
  if(!d){ sbNote = 'Not unpublished: this song fails today\'s checks, so no draft can be made of it. Delete takes it off, or send its file to Claude.'; teacherSbPaint(); return; }
  if(!confirm(`Unpublish "${p.title}"? It comes off the Songs page for every student (at their next sign-in or tab return). Students who have the song open now keep it, or lose its sound, until they reload. ${sbDraft() ? 'The draft and its recording stay here' : 'It stays here as a draft, made from the published song, with its recording'}, so you can publish it again.`)) return;
  const gen = sbViewGen;
  sbStopSounds();
  sbBusy = 'unpublish'; sbOpGen++; sbNote = ''; sbProgress = 'Taking it off the Songs page…'; teacherSbPaint();
  let step = 'draft';
  try{
    await ensureDb();
    /* First the draft keeps the song's edit number, so publishing it again counts on from it (see sbPublish). */
    sbBusy = '';
    const kept = await sbWriteDraft(id, Object.assign({}, d, { pubVer: Math.max(Number(d.pubVer) || 0, Number(p.ver) || 0) }));
    sbBusy = 'unpublish'; sbOpGen++;
    if(!kept) throw { draftNotSaved: true };
    if(sbStopped(gen)) throw 'stop';
    step = 'list';
    await sbListDrop(id);
    step = 'song';
    await db.collection('builtSongs').doc(id).delete();
    step = 'done';
    sbPublished.delete(id); sbEditing.delete(id);
    if(p.doc && p.doc.audio && !(d.audio && d.audio.id === p.doc.audio.id)) await sbDeleteAudio(p.doc.audio.id, null);
    sbStepOn = sbStepReady(sbDraft(), 7) ? 7 : 1;
    sbNote = `Unpublished "${p.title}": it is off the Songs page. The draft and its recording are kept; Publish puts it back.`;
    if(typeof builtSongsSync === 'function') builtSongsSync();
  }catch(e){
    const where = step === 'song' ? ' It is off the Songs page list (students no longer get it), but its song is still in the database: press Unpublish again.' : ' Nothing was changed.';
    if(e === 'stop') sbNote = 'Stopped: you left the Song builder. Nothing was unpublished.';
    else if(e && e.draftNotSaved) sbNote = 'Not unpublished: ' + sbNote;
    else sbNote = 'Not unpublished: ' + (typeof teacherSfWhy === 'function' ? teacherSfWhy(e) : String((e && (e.code || e.message)) || e)) + '.' + where;
  }finally{
    sbBusy = ''; sbProgress = ''; sbOpGen++;
    if(!sbStopped(gen)) teacherSbPaint();
  }
}
/* Delete a published song (with or without its draft): the typed title first. */
async function sbDeleteSong(){
  const id = sbSel, d = sbDraft(), p = sbPublished && sbPublished.get(id);
  if(sbBusy || !p) return;
  const title = String(p.title || '').trim();
  const typed = prompt(`Delete "${title}"? It comes off the Songs page for every student, and ${d ? 'the draft (chart, beat) and ' : ''}its recording are deleted from the class database. Students' counts of opening it stay. This cannot be undone; ${d ? 'Unpublish keeps everything. ' : ''}Type the title to delete it:`, '');
  if(typed === null) return;
  if(String(typed).trim() !== title){ sbNote = `Nothing was deleted: what you typed is not "${title}".`; teacherSbPaint(); return; }
  const gen = sbViewGen;
  sbStopSounds();
  sbBusy = 'delete'; sbOpGen++; sbNote = ''; sbProgress = 'Deleting…'; teacherSbPaint();
  let step = 'list';
  try{
    await ensureDb();
    await sbListDrop(id);
    step = 'song';
    await db.collection('builtSongs').doc(id).delete();
    sbPublished.delete(id); sbEditing.delete(id);
    step = 'draft';
    if(d){ await db.collection('songDrafts').doc(id).delete(); sbDrafts.delete(id); }
    step = 'audio';
    const ids = [...new Set([p.doc && p.doc.audio && p.doc.audio.id, d && d.audio && d.audio.id].filter(Boolean))];
    for(const a of ids) await sbDeleteAudio(a, null);
    sbMemFor(null); sbSel = null;
    sbNote = `Deleted "${title}".`;
    if(typeof builtSongsSync === 'function') builtSongsSync();
  }catch(e){
    const where = step === 'song' ? ' It is off the Songs page list (students no longer get it); its song, draft and recording are still in the database. Press Delete again.'
      : step === 'draft' ? ' It is off the Songs page; the draft and the recording are still here. Press Delete draft to finish.' : ' Nothing was deleted.';
    sbNote = 'Not deleted: ' + (typeof teacherSfWhy === 'function' ? teacherSfWhy(e) : String((e && (e.code || e.message)) || e)) + '.' + where;
  }finally{
    sbBusy = ''; sbProgress = ''; sbOpGen++;
    if(!sbStopped(gen)) teacherSbPaint();
  }
}

/* ── An imported song's draft, rebuilt from its builtSongs doc (see the header) ── */
function sbDraftFromDoc(id, p){
  const doc = p.doc, s = doc.song, lv = s.level;
  const sections = s.sections.map(x => ({ name: x.name, label: bsSectionLabel(x, 'en'), n: x.n || null, bars: s.bars.slice(x.from - 1, x.from - 1 + x.bars),
    lyrics: Array.isArray(x.lyrics) ? x.lyrics.map(l => ({ text: l.text, bars: l.bars })) : null, copied: false }));
  /* Chords the class has not been taught were published that way: kept, so the Chart step does not flag them. */
  const kept = sbChartChords(sections).filter(n => { const sh = sbShapeOf(n); return sh && !sh.taught; });
  const beat = { meter: s.meter, bpm: s.bpm, anchor: s.anchor, pins: [], fromImport: true, driftOff: 0, pinsNeeded: null, trackBpm: null, trackSub: null, tapBpm: null, taps: 0, tapSpreadMs: null };
  if(Array.isArray(s.barTimes)) beat.barTimes = s.barTimes.slice();
  return { v: 1, title: doc.title, artist: doc.artist, step: 5, imported: true, source: null, audio: JSON.parse(JSON.stringify(doc.audio)), volume: null,
    pitch: { cents: Number(doc.audio.centsOff), peaks: null }, beat,
    chart: { text: '', meter: s.meter, fmt: 'the imported song', fromImport: true, sections, left: [], kept, edited: true, shapes: JSON.parse(JSON.stringify(s.chords)) },
    level: { versions: lv.versions, start: lv.versions === 'both' ? lv.start : null, range: s.range ? { from: s.range.from, to: s.range.to } : null },
    listens: null, pubVer: Number(p.ver) || null };
}
/* The draft of the selected published song: its own, or one rebuilt from the published doc and saved. */
async function sbEnsureDraft(id){
  const have = sbDrafts && sbDrafts.get(id);
  if(have) return have;
  const p = sbPublished && sbPublished.get(id);
  if(!p || !p.doc){ sbNote = 'There is no song in the database to make a draft from.'; teacherSbPaint(); return null; }
  const why = builtSongCheck(id, p.doc);
  if(why.length){ sbNote = `This song cannot be opened in the builder: it fails today's checks (${why[0]}). Send its file to Claude.`; teacherSbPaint(); return null; }
  return await sbWriteDraft(id, sbDraftFromDoc(id, p)) ? sbDrafts.get(id) : null;
}
/* Edit on the step he picked (4, Chart, by default). */
async function sbEditAt(k){
  const id = sbSel;
  if(sbBusy || !sbPublished || !sbPublished.has(id)) return;
  sbStopSounds();
  const d = await sbEnsureDraft(id);
  if(!d || sbSel !== id) return;
  sbEditing.add(id); sbNote = '';
  sbStepOn = Math.max(1, Math.min(7, Number(k) || 4));
  while(sbStepOn > 1 && !sbStepReady(sbDraft(), sbStepOn)) sbStepOn--;
  teacherSbPaint();
}
const SB_EDIT_STEPS = [[1, 'Upload'], [2, 'Volume'], [3, 'Beat'], [4, 'Chart'], [5, 'Level'], [6, 'Preview']];
function sbEditChoiceHtml(off){
  return `<div class="sb-row sb-editpick" role="group" aria-label="Edit: open which step"><span class="sb-hint" style="margin:0">Edit, opening on:</span>`
    + SB_EDIT_STEPS.map(([k, l]) => `<button type="button" class="sb-btn small${k === 4 ? ' primary' : ''}" data-sb-act="edit-step" data-sb-v="${k}"${off}>${l}</button>`).join('') + `</div>`;
}

/* ── Export: the Import file of one song, and its mp3 ── */
function sbFileName(title, id){
  const slug = String(title || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40);
  return (slug ? slug + '-' : '') + id + '.json';
}
/* The levelled copy's bytes: from this tab when they are here, else read from songFiles (counted as one song download,
   like a Chromebook's read; checked against its size and SHA-256 by songFileReadPieces). */
async function sbCopyBytes(a, gen){
  if(sbMem.level && sbMem.level.bytes && sbMem.level.sha256 === a.sha256) return sbMem.level.bytes;
  await ensureDb();
  await songFileCount(db, songFileCost(a.bytes));
  return songFileReadPieces(db, a.id, { bytes: a.bytes, sha256: a.sha256 }, f => { sbProgress = `Reading the mp3… ${Math.floor(f * 100)}%`; const el = document.querySelector('[data-sb-status]'); if(el){ el.hidden = false; el.textContent = sbProgress; } }, () => sbStopped(gen));
}
async function sbExport(which){
  if(sbBusy) return;
  const id = sbSel, d = sbDraft(), p = sbPublished && sbPublished.get(id);
  const doc = which === 'pub' ? p && p.doc : sbDocOf(d);
  if(!doc){ sbNote = 'Nothing to export yet: the song needs its levelled copy, a beat and a chart.'; teacherSbPaint(); return; }
  const file = { id, v: doc.v, title: doc.title, artist: doc.artist, audio: doc.audio, song: doc.song };
  const base = sbFileName(doc.title, id).replace(/\.json$/, '');
  const gen = sbViewGen;
  sbStopSounds();
  sbBusy = 'export'; sbOpGen++; sbNote = ''; sbProgress = 'Reading the mp3…'; teacherSbPaint();
  try{
    const bytes = await sbCopyBytes(doc.audio, gen);
    if(sbStopped(gen)) throw 'stop';
    teacherMicSaveFile(base + '.json', new Blob([JSON.stringify(file, null, 1)], { type: 'application/json' }));
    teacherMicSaveFile(base + '.mp3', new Blob([bytes], { type: 'audio/mpeg' }));
    sbNote = `Saved ${base}.json and ${base}.mp3 (${which === 'pub' ? `the published ${teacherBsVerText(p.ver)}` : 'this draft'}): the pair Manage → Built songs imports as they are, and Claude's tools/built-song-check.mjs checks.`;
  }catch(e){
    const c = e && e.code;
    sbNote = e === 'stop' ? 'Stopped: you left the Song builder. Nothing was saved.'
      : 'Nothing was saved: ' + (c === 'limit' ? 'this month\'s song downloads are at the limit (Manage → Song files)' : c === 'missing' || c === 'bad' ? 'the levelled copy is missing or damaged in the database' : (typeof teacherSfWhy === 'function' ? teacherSfWhy(e) : String((e && (e.code || e.message)) || e))) + '.';
  }finally{
    sbBusy = ''; sbProgress = ''; sbOpGen++;
    if(!sbStopped(gen)) teacherSbPaint();
  }
}
const SB_EXPORT_HINT = 'Two downloads: the song file (.json) and its levelled .mp3, a pair Manage → Built songs imports as they are. Reading the mp3 counts as one song download this month, unless it is loaded in this tab already. Your browser may ask once to allow two downloads.';

/* ── A published song's page ── */
function sbPublishedHtml(id){
  const p = sbPublished.get(id), d = sbDrafts ? sbDrafts.get(id) || null : null, doc = p.doc;
  const off = sbBusy ? ' disabled' : '', verdict = sbPubVerdict(id, p), changed = d && sbPubChanged(d, p);
  const when = p.at ? new Date(p.at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const canDraft = !!(d || (doc && verdict.ok));   // an imported song: Edit and Unpublish rebuild its draft first
  const acts = (canDraft ? `<button type="button" class="tg-seg-btn ta-act-btn" data-sb-act="edit"${off} title="Opens the Chart step; pick another step below">Edit</button><button type="button" class="tg-seg-btn ta-act-btn" data-sb-act="unpublish"${off}>Unpublish</button>` : '')
    + `<button type="button" class="tg-seg-btn ta-act-btn t-act-danger" data-sb-act="delete-song"${off}>Delete…</button>`;
  let body = '';
  if(doc){
    const s = doc.song || {}, a = doc.audio || {}, secs = Array.isArray(s.sections) ? s.sections : [], bars = Array.isArray(s.bars) ? s.bars.length : 0;
    const level = s.level && s.level.versions === 'both' ? 'full and power chords' : s.level && s.level.versions === 'power' ? 'power chords' : 'full chords';
    body = `<dl class="sb-kv sb-pubkv">
        <dt>Where</dt><dd>Songs page · More Play Along songs, for every student <span class="sb-hint">(Hidden in the Songs view takes it off for now)</span></dd>
        <dt>Recording</dt><dd>${escHtml(sbLen(a.durationSec))} · ${a.gainDb != null ? escHtml((a.gainDb >= 0 ? '+' : '−') + Math.abs(Number(a.gainDb)).toFixed(1)) + ' dB · ' : ''}${escHtml(String(Math.round(Number(s.bpm) * 10) / 10))} BPM · ${bars} bars · ${escHtml(sbMb(a.bytes))} behind the school sign-in</dd>
        <dt>Card</dt><dd>${secs.length} section${secs.length === 1 ? '' : 's'} · ${escHtml(Object.keys(s.chords || {}).join(' '))} · ${escHtml(level)}</dd>
        <dt>Today's checks</dt><dd>${verdict.ok ? '<span class="sb-ok">✓</span> ' : '<span class="sb-bad">✗</span> '}${escHtml(verdict.text)}${verdict.ok ? '' : ' <span class="sb-hint">(students\' pages leave it out)</span>'}</dd>
      </dl>`;
  } else body = `<div class="sb-flag red"><span class="fi">!</span><div class="sb-flag-body"><b>The Songs page list names this song, but its song is not in the database.</b> Students' pages skip it. Delete takes it off the list.</div></div>`;
  const change = d
    ? `<p class="sb-note">Edit opens the steps again, on the step you pick; students keep this song until you publish the change. Unpublish takes it off students' pages and keeps your work. Delete removes the song, the draft and the recording.</p>`
    : canDraft ? `<p class="sb-note">This song came in through Manage → Built songs (Import), so it has no draft yet. Edit or Unpublish first makes one from the published song: its sections, bars, lyrics, chord shapes, level and beat come back as they are. What cannot come back: the chart's original text, the taps, the loudness numbers and the original mp3 (pick that at step 1 only to level the song again). Students keep this song until you publish a change.</p>`
    : `<p class="sb-note">This song came in through Manage → Built songs (Import) and fails today's checks, so the builder cannot open it: send its file to Claude, or Delete it. Hidden in the Songs view takes it off students' pages for now.</p>`;
  return `<div class="ta-dhead"><div class="ta-meta">Song builder · Published · ${escHtml(teacherBsVerText(p.ver))} · on the Songs page</div><div class="ta-title-row"><h2 class="ta-title">${escHtml(p.title)} <span class="ta-title-id">${escHtml(p.artist)}</span></h2><div class="ta-actions">${acts}</div></div></div>`
    + sbStatusHtml()
    + (changed ? `<div class="sb-flag"><span class="fi">!</span><div class="sb-flag-body"><b>The draft has changes that are not published.</b> Students still get the ${escHtml(teacherBsVerText(p.ver))}. <button type="button" class="sb-linkbtn" data-sb-act="edit"${off}>Carry on editing</button></div></div>` : '')
    + body
    + `<div class="sb-h sb-change-h">Change it</div>${canDraft ? sbEditChoiceHtml(off) : ''}<div class="sb-row">${acts}<button type="button" class="tg-seg-btn ta-act-btn" data-sb-act="export" data-sb-v="pub"${off} title="${escAttr(SB_EXPORT_HINT)}">Export the song file and its mp3</button></div>${change}<p class="sb-hint">Export: ${escHtml(SB_EXPORT_HINT)}</p>`;
}

/* ── The buttons (sbClick routes here) ── */
function sbPubAct(act, b){
  if(act === 'publish'){ sbPublish(); return true; }
  if(act === 'unpublish'){ sbUnpublish(); return true; }
  if(act === 'delete-song'){ sbDeleteSong(); return true; }
  if(act === 'export'){ sbExport(b && b.dataset && b.dataset.sbV === 'pub' ? 'pub' : 'draft'); return true; }
  if(act === 'edit' || act === 'edit-step'){ sbEditAt(act === 'edit' ? 4 : Number(b && b.dataset && b.dataset.sbV)); return true; }
  if(act === 'edit-done'){
    if(sbBusy) return true;
    sbStopSounds(); sbEditing.delete(sbSel); sbNote = '';
    teacherSbPaint();
    return true;
  }
  return false;
}
