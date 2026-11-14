#!/usr/bin/env node
/* song-requests-sim.mjs — song requests (2026-11-13), proved in Node. checks.mjs 1dr runs it and pins its count.

     node tools/song-requests-sim.mjs              every case; exit 0 = all held, 1 = a ✗ line
     node tools/song-requests-sim.mjs --walk       also prints the form's states, English and Spanish
     node tools/song-requests-sim.mjs --root DIR   another site folder (a break-it copy)

   Runs the REAL code, no copy: app/songrequests.js (the student side) and teacher-songrequests.js (the
   console view), with the site's own escHtml / escAttr lines from app/boot.js, the real i18n.js, and the week
   maths of practice-minutes.js (its `calc` functions, cut out by their own lines), in a vm with a stub page.

   What it proves (each case prints ✓ or ✗):
     links    srParseYouTube on a table of pasted links: every form a student copies from YouTube is
              accepted and gives the right 11-character id and the one stored link; javascript:, data:, ftp:,
              look-alike hosts (youtube.com.evil.example, notyoutube.com, youtube.co, an @ trick, a backslash,
              a port), a channel, a playlist, a search, an id of the wrong length or with other characters,
              spaces or a newline inside the link, and an over-long paste are refused.
     form     srCheckForm: empty link, bad link, a question unanswered, a No without a reason (also only
              spaces), a No with one, two Yes (a typed reason dropped), the caps (title 80, reason 200) and
              text cut without leaving half an emoji.
     rules    the caps and the video-id shape in the code equal firestore.rules' songRequests block.
     escape   every student-written value (name, email, period, title, reason, note, video id, doc id, url)
              drawn by the console's view (both filters, a group of three) and by the student's own list is
              escaped; no link is built from a doc's url field or from a video id of the wrong shape; the
              console has no inline handler that carries a value.
     group    three requests for one video show as one block, "3 students asked", newest first.
     walk     the form's states through srSend with a stub page and a stub Firestore: empty, a bad link,
              both Yes (sent: the doc written), one No without a reason, one No with one, this week's request
              already in (the box says when the student can ask again), the send refused (already asked,
              rules not published, the device's date) and a connection failure. English and Spanish. */
import { readFileSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const args = process.argv.slice(2);
const argOf = n => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : null; };
const ROOT = resolve(argOf('--root') || join(dirname(fileURLToPath(import.meta.url)), '..'));
const WALK = args.includes('--walk');
let cases = 0, fails = 0;
const ok = (cond, line) => { cases++; if(!cond) fails++; if(!cond || WALK) console.log((cond ? '  ✓ ' : '  ✗ ') + line); return cond; };
const read = f => readFileSync(join(ROOT, f), 'utf8');

/* ── The real code in a vm ── */
const BOOT = read('app/boot.js');
const escSrc = ['escAttr', 'escHtml'].map(n => (BOOT.match(new RegExp(`^const ${n} = .*$`, 'm')) || [''])[0]).join('\n');
const PMSRC = read('practice-minutes.js');
const calcFrom = PMSRC.indexOf('  var calc = {};'), calcTo = PMSRC.indexOf('\n', PMSRC.indexOf('  calc.weekAdd = function'));
if(!/escHtml/.test(escSrc) || calcFrom < 0 || calcTo < calcFrom) { console.log('song-requests-sim: could not find escHtml/escAttr in app/boot.js or calc in practice-minutes.js'); process.exit(1); }
const calcSrc = `var PM = (function(){ ${PMSRC.slice(calcFrom, calcTo)}\n return { calc: calc }; })();`;
const els = {};
const box = {
  console: { log() {}, warn() {}, error() {} }, URL, Object, setTimeout: () => 0, clearTimeout() {},
  localStorage: { getItem: () => null, setItem() {} }, CustomEvent: function(){}, dispatchEvent() {},
  document: { documentElement: {}, querySelectorAll: () => [], querySelector: () => null, getElementById: id => els[id] || null,
    addEventListener() {}, removeEventListener() {}, contains: () => true, body: { appendChild() {} }, createElement: () => ({ addEventListener() {} }) },
  firebaseReady: true, currentUser: null, IS_TEACHER_MODE: false, teacherView: 'songrequests', studentPeriod: '4', periodOverride: '',
  isDevBypassUser: () => !!(box.currentUser && box.currentUser.uid === 'dev-user'),
  openOverlay() {}, closeOverlay() {},
  firebase: { firestore: { FieldValue: { serverTimestamp: () => '<server time>' } } },
};
box.window = box;
vm.createContext(box);
const run = (code, file) => vm.runInContext(code, box, file ? { filename: file } : undefined);
try {
  run(read('i18n.js'), 'i18n.js');
  run(escSrc + '\nvar currentUser = null, db = null; async function ensureDb(){ return db; }');
  run(calcSrc, 'practice-minutes.js (calc)');
  run(read('app/songrequests.js'), 'app/songrequests.js');
  run(read('teacher-songrequests.js'), 'teacher-songrequests.js');
} catch(e) { console.log('song-requests-sim: the code would not load: ' + e.message); process.exit(1); }
run('function __setUser(u){ currentUser = u; }');

/* ══ links ══ */
const ID = 'dQw4w9WgXcQ', URL1 = 'https://www.youtube.com/watch?v=' + ID;
const YES = [
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtube.com/watch?v=dQw4w9WgXcQ',
  'http://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'www.youtube.com/watch?v=dQw4w9WgXcQ',
  'youtube.com/watch?v=dQw4w9WgXcQ',
  'https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=share',
  'https://music.youtube.com/watch?v=dQw4w9WgXcQ&si=AbCdEfGh123',
  'https://www.youtube.com/watch?feature=shared&v=dQw4w9WgXcQ&t=42s',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PL0123456789abcdef&index=3',
  'https://youtu.be/dQw4w9WgXcQ',
  'https://youtu.be/dQw4w9WgXcQ?si=Xy-_z1234567&t=10',
  'youtu.be/dQw4w9WgXcQ',
  'https://www.youtube.com/shorts/dQw4w9WgXcQ',
  'https://youtube.com/shorts/dQw4w9WgXcQ?feature=share',
  'https://www.youtube.com/embed/dQw4w9WgXcQ',
  'https://www.youtube.com/live/dQw4w9WgXcQ?si=abc',
  'HTTPS://WWW.YOUTUBE.COM/watch?v=dQw4w9WgXcQ',
  '  https://youtu.be/dQw4w9WgXcQ  ',
  '\nhttps://www.youtube.com/watch?v=dQw4w9WgXcQ\n',
  'https://www.youtube.com/watch/?v=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ#comments',
];
const NO = [
  '', '   ', 'hello', 'dQw4w9WgXcQ',
  'javascript:alert(1)', 'javascript://www.youtube.com/watch?v=dQw4w9WgXcQ', 'JaVaScRiPt:alert(document.cookie)//youtube.com/watch?v=dQw4w9WgXcQ',
  'data:text/html,<script>alert(1)</script>', 'ftp://www.youtube.com/watch?v=dQw4w9WgXcQ', 'file:///etc/passwd',
  'https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ', 'https://notyoutube.com/watch?v=dQw4w9WgXcQ', 'https://youtube.co/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com.@evil.example/watch?v=dQw4w9WgXcQ', 'https://www.youtube.com@evil.example/watch?v=dQw4w9WgXcQ',
  'https://evil.example\\@www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://evil.example/?u=https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com:8080/watch?v=dQw4w9WgXcQ', 'https://user:pw@www.youtube.com/watch?v=dQw4w9WgXcQ',
  'https://youtu.be.evil.example/dQw4w9WgXcQ', 'https://www.youtube.com./watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/channel/UC0123456789abcdefghij', 'https://www.youtube.com/@SomeChannel', 'https://www.youtube.com/playlist?list=PL0123456789',
  'https://www.youtube.com/results?search_query=dQw4w9WgXcQ', 'https://www.youtube.com/watch?list=PL0123456789', 'https://www.youtube.com/watch?v=',
  'https://www.youtube.com/watch?v=dQw4w9WgXc', 'https://www.youtube.com/watch?v=dQw4w9WgXcQQ', 'https://www.youtube.com/watch?v=dQw4w9WgX$Q',
  'https://www.youtube.com/watch?v=dQw4w9WgX%22Q', 'https://youtu.be/dQw4w9WgXcQ/extra', 'https://youtu.be/',
  'https://www.youtube.com/shorts/dQw4w9WgXcQ/x', 'https://www.youtube.com/watchv=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=dQw4w9 WgXcQ', 'https://youtu.be/dQw4w9WgXcQ\nhttps://evil.example', 'https://www.you tube.com/watch?v=dQw4w9WgXcQ',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ&x=' + 'a'.repeat(480),
];
let yesOk = 0, noOk = 0;
for(const s of YES){
  const r = run(`srParseYouTube(${JSON.stringify(s)})`);
  const good = r && r.id === ID && r.url === URL1;
  if(good) yesOk++;
  ok(good, `accepted ${JSON.stringify(s)} → ${JSON.stringify(r)}`);
}
for(const s of NO){
  const r = run(`srParseYouTube(${JSON.stringify(s)})`);
  if(r === null) noOk++;
  ok(r === null, `refused ${JSON.stringify(s.length > 90 ? s.slice(0, 90) + '…' : s)} → ${JSON.stringify(r)}`);
}
{
  const r = run('srParseYouTube("https://youtu.be/a-b_c-d_e-F")');
  ok(r && r.id === 'a-b_c-d_e-F', `an id with - and _ is kept as it is: ${JSON.stringify(r)}`);
}

/* ══ form ══ */
const L = 'https://youtu.be/' + ID;
const form = f => run(`srCheckForm(${JSON.stringify(f)})`);
const FORM = [
  ['empty link', { link: '', lyricsOk: true, topicOk: true }, r => r.err === 'sr.errNoLink'],
  ['only spaces', { link: '   ', lyricsOk: true, topicOk: true }, r => r.err === 'sr.errNoLink'],
  ['a link that is not YouTube', { link: 'https://notyoutube.com/watch?v=' + ID, lyricsOk: true, topicOk: true }, r => r.err === 'sr.errBadLink'],
  ['no answers', { link: L, lyricsOk: null, topicOk: null }, r => r.err === 'sr.errAnswer'],
  ['one answer missing', { link: L, lyricsOk: true, topicOk: null }, r => r.err === 'sr.errAnswer'],
  ['an answer as the string "yes"', { link: L, lyricsOk: 'yes', topicOk: true }, r => r.err === 'sr.errAnswer'],
  ['lyrics No, no reason', { link: L, lyricsOk: false, topicOk: true, why: '' }, r => r.err === 'sr.errWhy'],
  ['subject No, no reason', { link: L, lyricsOk: true, topicOk: false }, r => r.err === 'sr.errWhy'],
  ['both No, a reason of spaces and a newline', { link: L, lyricsOk: false, topicOk: false, why: '  \n ' }, r => r.err === 'sr.errWhy'],
  ['lyrics No, with a reason', { link: L, lyricsOk: false, topicOk: true, why: ' There is a radio edit. ' }, r => r.ok && r.why === 'There is a radio edit.' && r.lyricsOk === false && r.topicOk === true],
  ['both Yes: a typed reason is dropped', { link: L, lyricsOk: true, topicOk: true, why: 'left over' }, r => r.ok && r.why === ''],
  ['both Yes, a title', { link: L, lyricsOk: true, topicOk: true, title: '  Made-up Song — Test Band ' }, r => r.ok && r.title === 'Made-up Song — Test Band' && r.video.id === ID && r.video.url === URL1],
  ['a title of 300 characters is cut to 80', { link: L, lyricsOk: true, topicOk: true, title: 't'.repeat(300) }, r => r.ok && r.title.length === 80],
  ['a reason of 300 characters is cut to 200', { link: L, lyricsOk: false, topicOk: true, why: 'w'.repeat(300) }, r => r.ok && r.why.length === 200],
  ['a cut that lands inside an emoji leaves no half of it', { link: L, lyricsOk: true, topicOk: true, title: 'x'.repeat(79) + '😀😀' }, r => r.ok && r.title === 'x'.repeat(79)],
  ['a lone half emoji and a control character become U+FFFD', { link: L, lyricsOk: false, topicOk: true, why: 'a\uD800b\u0007c' }, r => r.ok && r.why === 'a�b�c'],
];
for(const [label, f, want] of FORM){ const r = form(f); ok(!!(r && want(r)), `form: ${label} → ${JSON.stringify(r)}`); }

/* ══ rules = code ══ */
{
  const rules = read('firestore.rules');
  const blk = (rules.match(/match \/songRequests\/\{requestId\} \{[\s\S]*?\n    \}/) || [''])[0];
  const why = run('SR_WHY_MAX'), title = run('SR_TITLE_MAX');
  const capIn = (field, n) => [...blk.matchAll(new RegExp(`request\\.resource\\.data\\.${field}\\.size\\(\\) <= (\\d+)`, 'g'))].map(m => +m[1]);
  ok(JSON.stringify(capIn('why', why)) === JSON.stringify([why]), `the reason cap is ${why} in the code and in firestore.rules (${capIn('why').join(', ')})`);
  ok(JSON.stringify(capIn('title', title)) === JSON.stringify([title]), `the title cap is ${title} in the code and in firestore.rules (${capIn('title').join(', ')})`);
  ok(blk.includes("request.resource.data.videoId.matches('^[A-Za-z0-9_-]{11}$')") && run('SR_ID_RE.source') === '^[A-Za-z0-9_-]{11}$' && run('TEACHER_SR_ID_RE.source') === '^[A-Za-z0-9_-]{11}$',
    'the video id shape is ^[A-Za-z0-9_-]{11}$ in the page, the console and the rules');
  ok(blk.includes("request.resource.data.url == 'https://www.youtube.com/watch?v=' + request.resource.data.videoId") && run(`srParseYouTube("youtu.be/${ID}").url`) === URL1,
    'the stored link is https://www.youtube.com/watch?v=<id> in the page and in the rules');
  ok(/'title', 'createdAt', 'state'\]\)/.test(blk) && blk.includes("request.resource.data.state == 'asked'") && blk.includes("allow update: if isTeacher()"),
    'the rules block pins the field list, state asked, and update for the teacher only');
}

/* ══ escape ══ */
const EVIL = '<img src=x onerror=alert(1)>"\'&';
const RAW = /<img|<script|onerror=alert\(1\)>|javascript:/i;
const docs = [
  { id: 'fake-uid-1_2026-W46', uid: 'fake-uid-1', name: EVIL + ' Test Student', email: EVIL + '@x.test', period: EVIL, week: '2026-W46', videoId: ID, url: 'javascript:alert(1)', lyricsOk: false, topicOk: true, why: EVIL + ' clean version', title: EVIL + ' title', createdAt: { seconds: 1763000300, nanoseconds: 0 }, state: 'asked', note: EVIL + ' note' },
  { id: 'fake-uid-2_2026-W46', uid: 'fake-uid-2', name: 'Test Student 2', email: 's2@x.test', period: '7', week: '2026-W46', videoId: ID, url: URL1, lyricsOk: true, topicOk: true, why: '', title: '', createdAt: { seconds: 1763000200, nanoseconds: 0 }, state: 'adding' },
  { id: 'fake-uid-3_2026-W46', uid: 'fake-uid-3', name: 'Test Student 3', email: 's3@x.test', period: '4', week: '2026-W46', videoId: ID, url: URL1, lyricsOk: true, topicOk: false, why: 'radio edit', title: 'Made-up Song', createdAt: { seconds: 1763000100, nanoseconds: 0 }, state: 'asked' },
  { id: '"><img src=x onerror=alert(1)>', uid: 'fake-uid-4', name: 'Test Student 4', email: '', period: '', week: '2026-W45', videoId: 'x" onmouseover="alert(1)', url: 'javascript:alert(1)', lyricsOk: true, topicOk: true, why: '', title: '', createdAt: { seconds: 1762000000, nanoseconds: 0 }, state: '<b>constructor</b>' },
  { id: 'fake-uid-5_2026-W44', uid: 'fake-uid-5', name: 'Test Student 5', email: '', period: '', week: '2026-W44', videoId: 'aaaaaaaaaaa', url: 'https://www.youtube.com/watch?v=aaaaaaaaaaa', lyricsOk: true, topicOk: true, why: '', title: 'toString', createdAt: { seconds: 1761000000, nanoseconds: 0 }, state: 'declined' },
];
for(const f of ['waiting', 'all']){
  run(`teacherSrFilter = ${JSON.stringify(f)};`);
  const h = run(`teacherSrHtml(${JSON.stringify(docs)})`);
  ok(!RAW.test(h), `console (${f}): no student-written value reaches the HTML unescaped`);
  ok(!/ on[a-z]+="/i.test(h.replace(/ data-[a-z-]+="[^"]*"/g, '')), `console (${f}): no inline handler`);
  const links = [...h.matchAll(/href="([^"]*)"/g)].map(m => m[1]);
  ok(links.length && links.every(u => u === URL1 || u === 'https://www.youtube.com/watch?v=aaaaaaaaaaa') && h.includes('rel="noopener noreferrer"'),
    `console (${f}): every link is rebuilt from a valid video id (${links.length}: ${[...new Set(links)].join(', ')}), new tab, noopener noreferrer`);
  ok(h.includes(run(`escHtml(${JSON.stringify(EVIL + ' clean version')})`)) && h.includes(run(`escHtml(${JSON.stringify(EVIL + ' note')})`)) && h.includes(run(`escAttr(${JSON.stringify(docs[3].id)})`)),
    `console (${f}): the reason, the note and a hostile doc id are shown, escaped`);
}
{
  run('teacherSrFilter = "all";');
  const groups = run(`teacherSrGroups(${JSON.stringify(docs)})`);
  const g = groups[0];
  ok(groups.length === 3 && g.videoId === ID && g.rows.length === 3 && g.waiting === 2 && g.rows.map(r => r.uid).join() === 'fake-uid-1,fake-uid-2,fake-uid-3' && g.title === EVIL + ' title',
    `group: 3 requests for one video are one block, newest first, 2 waiting (${groups.length} blocks: ${groups.map(x => x.rows.length).join(', ')})`);
  const h = run(`teacherSrHtml(${JSON.stringify(docs)})`);
  ok(h.includes('3 students asked') && h.includes('1 student asked') && (h.match(/class="tsr-no"/g) || []).length === 2,
    'group: "3 students asked", "1 student asked", and the two No answers stand out (tsr-no)');
  ok(h.includes('Mixed: Waiting, Adding it') && h.includes('Not this one'), 'group: a block with mixed states says so; a declined one reads "Not this one"');
  run('teacherSrFilter = "waiting";');
  const w = run(`teacherSrHtml(${JSON.stringify(docs)})`);
  ok(!w.includes('toString') && w.includes('Waiting (3)') && w.includes('All (5)'), 'filter: Waiting hides the declined-only block; the counts read Waiting (3), All (5)');
}
{
  run(`__setUser({ uid: 'fake-uid-1', displayName: 'Test Student', email: 's1@x.test' });`);
  const list = [docs[0], docs[3]].map(d => Object.assign({}, d));
  const h = run(`srListHtml(${JSON.stringify(list)})`);
  ok(!RAW.test(h) && h.includes(run(`escHtml(${JSON.stringify(EVIL + ' title')})`)) && h.includes(run(`escHtml(t('sr.note', { note: ${JSON.stringify(EVIL + ' note')} }))`)),
    "student's list: the title and the teacher's note are escaped");
  const links = [...h.matchAll(/href="([^"]*)"/g)].map(m => m[1]);
  ok(links.length === 1 && links[0] === URL1 && !/ on[a-z]+="/i.test(h), `student's list: one link, rebuilt from the valid video id (${links.join(', ')}); the bad id gets none; no inline handler`);
  const many = Array.from({ length: 8 }, (_, i) => ({ week: '2026-W' + String(46 - i).padStart(2, '0'), videoId: ID, title: 'Song ' + i, state: 'asked' }));
  const hm = run(`srListHtml(${JSON.stringify(many)})`);
  ok((hm.match(/class="sr-item"/g) || []).length === 5 && hm.includes('Song 0') && !hm.includes('Song 5'), "student's list: 8 requests show the newest 5");
}

/* ══ identity: the console names a request from the roster by uid, never from the doc's name (review R1-1) ══ */
{
  run(`var allStudentsRaw = [{ uid: 'fake-uid-1', name: 'Roster Name One', email: 's1@seq.test' }];`);
  run('teacherSrFilter = "all";');
  const forged = [{ id: 'fake-uid-1_2026-W46', uid: 'fake-uid-1', name: 'Test Student 2 (a classmate)', email: 's1@seq.test', period: '4', week: '2026-W46', videoId: ID, lyricsOk: false, topicOk: true, why: '   ', title: '', createdAt: { seconds: 1763000300, nanoseconds: 0 }, state: 'asked' },
    { id: 'fake-uid-8_2026-W46', uid: 'fake-uid-8', name: 'Test Student 2 (a classmate)', email: 's8@seq.test', period: '7', week: '2026-W46', videoId: 'aaaaaaaaaaa', lyricsOk: true, topicOk: true, why: '', title: '', createdAt: { seconds: 1763000200, nanoseconds: 0 }, state: 'asked' }];
  const h = run(`teacherSrHtml(${JSON.stringify(forged)})`);
  ok(h.includes('Roster Name One') && h.includes('s8@seq.test') && !h.includes('a classmate'), "identity: the roster's name for a known uid, the email for an unknown one, never the doc's own name");
  ok(run(`teacherSrWho(${JSON.stringify(forged[0])}, 'this student')`) === 'Roster Name One' && run(`teacherSrWho(${JSON.stringify(forged[1])}, 'this student')`) === 's8@seq.test',
    "identity: Delete's confirm names the same person (teacherSrWho)");
  ok(h.includes('<i>no reason given</i>'), 'a No whose reason is only spaces shows "no reason given" (the trimmed value)');
  /* R2-1: the roster name is student-writable too, so the token-tied email is always drawn, visibly. */
  run(`allStudentsRaw = [{ uid: 'fake-uid-1', name: 'Test Student 2 (a classmate)', email: 's1@seq.test' }];`);
  const cell = (run(`teacherSrRowHtml(${JSON.stringify(Object.assign({}, forged[0], { email: 's1@seq.test' }))})`).match(/<td class="nc"[^>]*>([\s\S]*?)<\/td>/) || ['', ''])[1];
  ok(/<div class="tsr-email">s1@seq\.test<\/div>/.test(cell) && cell.includes('Test Student 2 (a classmate)'), `identity: a forged ROSTER name still shows the true email visibly in the cell: ${JSON.stringify(cell)}`);
  const conf = run(`teacherSrDeleteText(${JSON.stringify(forged[0])}, true)`);
  ok(conf.includes('Test Student 2 (a classmate) (s1@seq.test)'), `identity: Delete's confirm names the name and the email: ${JSON.stringify(conf)}`);
  /* R2-2: a reason made only of invisible characters is no reason. */
  const inv = Object.assign({}, forged[0], { why: '\u200B\u200C\u200D \u2060\u3164\uFEFF\t' });
  ok(run(`teacherSrRowHtml(${JSON.stringify(inv)})`).includes('<i>no reason given</i>'), 'a No whose reason is only invisible characters (zero-width, word joiner, Hangul filler, BOM) shows "no reason given"');
  run('var allStudentsRaw = [];');
}

/* ══ walk: the form through srSend, with a stub page and Firestore ══ */
function page(f){
  for(const k of Object.keys(els)) delete els[k];
  const el = (id, extra) => (els[id] = Object.assign({ id, value: '', disabled: false, hidden: false, textContent: '', className: '', innerHTML: '', remove() { delete els[id]; } }, extra || {}));
  el('sr-link', { value: f.link || '' }); el('sr-song', { value: f.title || '' }); el('sr-why', { value: f.why || '' });
  el('sr-why-box', { hidden: true }); el('sr-status'); el('sr-send-btn', { textContent: run("t('sr.send')") }); el('sr-slot');
  box.document.querySelector = sel => {
    const m = /name="(sr-lyrics|sr-topic)"\]:checked/.exec(sel);
    if(!m) return null;
    const v = m[1] === 'sr-lyrics' ? f.lyricsOk : f.topicOk;
    return v === true ? { value: 'yes' } : v === false ? { value: 'no' } : null;
  };
  box.document.querySelectorAll = () => [];
}
function fakeDb(store, mode){
  const writes = [];
  const denied = () => Promise.reject(Object.assign(new Error('denied'), { code: 'permission-denied' }));
  return { writes, collection: () => ({
    where: (f, op, v) => ({ get: () => mode === 'closed' ? denied() : Promise.resolve({ forEach: fn => Object.values(store).filter(d => d[f] === v).forEach(d => fn({ id: d.id, data: () => d })) }) }),
    doc: id => ({ set: d => {
      writes.push([id, d]);
      if(mode === 'closed' || mode === 'date') return denied();
      if(mode === 'offline') return Promise.reject(Object.assign(new Error('unavailable'), { code: 'unavailable' }));
      if(store[id]) return denied();
      store[id] = Object.assign({ id }, d); return Promise.resolve();
    } }),
  }) };
}
const WEEK = run('srWeekNow()');
const walkOut = [];
async function walk(lang, label, f, opts){
  run(`setLang(${JSON.stringify(lang)})`);
  run(`__setUser({ uid: 'fake-uid-9', displayName: 'Test Student 9', email: 's9@x.test' }); srState = { uid: '', status: 'idle', list: [] };`);
  const store = {};
  if(opts.had) store['fake-uid-9_' + WEEK] = { id: 'fake-uid-9_' + WEEK, uid: 'fake-uid-9', week: WEEK, videoId: ID, title: 'Made-up Song', state: opts.had };
  const fdb = fakeDb(store, opts.mode);
  box.__db = fdb; run('db = __db;');
  page(f);
  await run('srLoad()');
  const slotBefore = els['sr-slot'].innerHTML;
  run('srFormSync()');
  await run('srSend()');
  await new Promise(r => setImmediate(r));
  const status = els['sr-status'].textContent, cls = els['sr-status'].className;
  const slot = els['sr-slot'].innerHTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const out = { status, cls, slot, slotBefore: slotBefore.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(), whyShown: !els['sr-why-box'].hidden, writes: fdb.writes, sendBtn: !!els['sr-send-btn'], disabled: els['sr-send-btn'] && els['sr-send-btn'].disabled };
  walkOut.push([lang, label, out]);
  return out;
}
const T = (k, p) => run(`t(${JSON.stringify(k)}${p ? ', ' + JSON.stringify(p) : ''})`);
for(const lang of ['en', 'es']){
  let o = await walk(lang, 'empty form', {}, {});
  ok(o.status === T('sr.errNoLink') && /err/.test(o.cls) && !o.writes.length && !o.whyShown, `walk ${lang}: empty → "${o.status}", nothing written`);
  o = await walk(lang, 'bad link', { link: 'https://notyoutube.com/watch?v=' + ID, lyricsOk: true, topicOk: true }, {});
  ok(o.status === T('sr.errBadLink') && !o.writes.length, `walk ${lang}: bad link → "${o.status}"`);
  o = await walk(lang, 'one No without a reason', { link: L, lyricsOk: false, topicOk: true }, {});
  ok(o.status === T('sr.errWhy') && o.whyShown && !o.writes.length, `walk ${lang}: one No, no reason → the box shows, "${o.status}"`);
  o = await walk(lang, 'both Yes', { link: L, lyricsOk: true, topicOk: true, title: 'Made-up Song — Test Band' }, {});
  const w = o.writes[0] && o.writes[0][1];
  ok(o.status === T('sr.sent') && /ok/.test(o.cls) && o.writes.length === 1 && o.writes[0][0] === 'fake-uid-9_' + WEEK && w.state === 'asked' && w.why === '' && w.url === URL1 && w.week === WEEK && w.period === '4' && !o.sendBtn,
    `walk ${lang}: both Yes → "${o.status}", one doc fake-uid-9_${WEEK}, state asked, no reason`);
  ok(o.slot.includes(T('sr.weekUsed', { day: run(`srNextWeekDay(${JSON.stringify(WEEK)})`) })) && o.slot.includes(T('sr.stateAsked')), `walk ${lang}: after sending, the box says "${o.slot.slice(0, 140)}"`);
  o = await walk(lang, 'one No with a reason', { link: L, lyricsOk: true, topicOk: false, why: 'There is a radio edit.' }, {});
  ok(o.status === T('sr.sent') && o.writes[0] && o.writes[0][1].why === 'There is a radio edit.' && o.writes[0][1].topicOk === false, `walk ${lang}: one No with a reason → sent with it`);
  o = await walk(lang, "this week's request already in", { link: L, lyricsOk: true, topicOk: true }, { had: 'adding' });
  ok(o.slotBefore.includes(T('sr.weekUsed', { day: run(`srNextWeekDay(${JSON.stringify(WEEK)})`) })) && o.slotBefore.includes(T('sr.stateAdding')) && !o.slotBefore.includes(T('sr.btn')),
    `walk ${lang}: this week used → no button, "${o.slotBefore.slice(0, 160)}"`);
  ok(o.status === T('sr.errAlready') && !o.sendBtn, `walk ${lang}: a second send the same week (refused by the rules) → "${o.status}"`);
  o = await walk(lang, 'rules not published', { link: L, lyricsOk: true, topicOk: true }, { mode: 'closed' });
  ok(o.slotBefore === T('sr.closed') && o.status === T('sr.closed') && !/sent/i.test(o.status), `walk ${lang}: rules not published → the box says "${o.slotBefore}", a send says "${o.status}"`);
  o = await walk(lang, "the device's date is off", { link: L, lyricsOk: true, topicOk: true }, { mode: 'date' });
  ok(o.status === T('sr.errDate') && o.sendBtn && !o.disabled, `walk ${lang}: refused with no request this week → "${o.status}", the button is back`);
  o = await walk(lang, 'connection fails', { link: L, lyricsOk: true, topicOk: true }, { mode: 'offline' });
  ok(o.status === T('sr.errFailed') && o.sendBtn && !o.disabled, `walk ${lang}: connection fails → "${o.status}", the button is back`);
}
run('setLang("en")');
{
  run(`__setUser({ uid: 'dev-user', displayName: 'Dev', email: '' }); srState = { uid: '', status: 'idle', list: [] };`);
  const h = run('srSlotHtml()');
  ok(h.includes(run("escHtml(t('sr.devBypass'))")) && !h.includes('srOpen') && run('srCanSend()') === false, 'the dev bypass: no button, "cannot send"');
  run(`__setUser({ uid: 'fake-uid-7', displayName: 'Seven', email: '' }); srState = { uid: 'fake-uid-6', status: 'ready', list: [{ week: ${JSON.stringify(WEEK)}, videoId: ${JSON.stringify(ID)}, title: 'SECRET of student 6', state: 'asked' }] };`);
  const h2 = run('srSlotHtml()');
  ok(!h2.includes('SECRET') && h2.includes(run("escHtml(t('sr.loading'))")), "a shared Chromebook: the last student's list is not drawn for the next uid");
}
if(WALK){
  console.log('\n── The form, state by state ──');
  for(const [lang, label, o] of walkOut) console.log(`[${lang}] ${label}\n      box before: ${o.slotBefore || '(empty)'}\n      status: ${o.status || '(none)'}${o.whyShown ? '   [the reason box is showing]' : ''}\n      box after: ${o.slot}`);
}
console.log(`\nsong-requests-sim: ${cases} cases, ${fails} failed (links: ${yesOk} of ${YES.length} accepted, ${noOk} of ${NO.length} refused)`);
process.exit(fails ? 1 : 0);
