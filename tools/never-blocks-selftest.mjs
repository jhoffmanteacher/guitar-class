#!/usr/bin/env node
/* never-blocks-selftest.mjs — `node tools/never-blocks.mjs --self-test` (or this
   file): every forbidden edit planted in a scratch worktree must turn its check
   red; every allowed near-miss must leave it green. It covers the first build's
   cases and every miss and false red of the 2026-11-13 review (R1-1 … R1-14).
   No Chrome, no network. One `git worktree add` and one shallow local clone,
   both removed at the end. Zero dependencies. */

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync, readdirSync, mkdirSync, statSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import { checkKeysAgainstBase, checkFirestoreWrites, checkRulesPaste, checkKeptThings, clearBaseCache, rulesHash, PASTE_FILE, RULES_FILE, LET_THROUGH } from './never-blocks.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const git = (cwd, args, env) => { const r = spawnSync('git', args, { cwd, encoding: 'utf8', maxBuffer: 1 << 28, env: env ? { ...process.env, ...env } : process.env }); return { ok: r.status === 0, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() }; };
const today = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
const ack = h => `- ${today} firestore.rules ${h}: Jonathan was told on ${today} to paste it in the Firebase console (Firestore → Rules → Publish)`;

export function selfTest() {
  const dir = mkdtempSync(join(tmpdir(), 'gc-never-'));
  const wt = join(dir, 'tree');
  const add = git(ROOT, ['worktree', 'add', '--detach', wt, 'HEAD']);
  if (!add.ok) { console.log(`self-test: could not make a scratch worktree: ${add.err}`); process.exit(2); }
  /* The base is HEAD itself: the scratch tree starts equal to it. The tools under test are the CURRENT
     ones (copied in after every reset: this tree may have uncommitted edits to them). */
  const TOOLS = ['tools/never-blocks.mjs', 'tools/never-blocks-selftest.mjs', 'tools/js-scan.mjs', 'tools/firestore-paths.mjs', 'tools/rule-zero-proof.mjs', 'tools/checks.mjs', 'tools/never-pins.json', '.githooks/pre-push', '.githooks/pre-commit', PASTE_FILE].filter(f => existsSync(join(ROOT, f)));
  const head = git(wt, ['rev-parse', 'HEAD']).out;
  let pass = 0, fail = 0;
  const ENV0 = { ...process.env };
  const reset = () => {
    for (const k of Object.keys(process.env)) if (!(k in ENV0)) delete process.env[k];
    Object.assign(process.env, ENV0);
    git(wt, ['reset', '-q', '--hard', head]); git(wt, ['clean', '-fdq']);
    for (const f of TOOLS) writeFileSync(join(wt, f), readFileSync(join(ROOT, f)));
    process.env.GC_CHECKS_BASE = head; process.env.GC_CHECKS_STAGE = 'push'; delete process.env.GITHUB_ACTIONS;
    // git runs this scratch tree's own hooks (the real core.hooksPath points at the main checkout)
    Object.assign(process.env, { GIT_CONFIG_COUNT: '1', GIT_CONFIG_KEY_0: 'core.hooksPath', GIT_CONFIG_VALUE_0: join(wt, '.githooks') });
    clearBaseCache();
  };
  const commit = (msg, env) => { git(wt, ['add', '-A']); git(wt, ['-c', 'user.name=self-test', '-c', 'user.email=self-test@example.invalid', 'commit', '-qm', msg, '--no-verify'], env); return git(wt, ['rev-parse', 'HEAD']).out; };
  const hoursAgo = h => { const d = new Date(Date.now() - h * 3600e3).toISOString(); return { GIT_COMMITTER_DATE: d, GIT_AUTHOR_DATE: d }; };
  const nb = (args, env) => spawnSync(process.execPath, [join(wt, 'tools', 'never-blocks.mjs'), ...args], { cwd: wt, encoding: 'utf8', env: { ...process.env, ...(env || {}) } });
  const read = f => readFileSync(join(wt, f), 'utf8');
  const write = (f, s) => { mkdirSync(dirname(join(wt, f)), { recursive: true }); writeFileSync(join(wt, f), s); };
  const edit = (f, from, to) => { const s = read(f); if (typeof from === 'string' ? !s.includes(from) : !from.test(s)) throw new Error(`"${String(from).slice(0, 60)}" not in ${f}`); write(f, s.replace(from, to)); };
  const append = (f, code) => write(f, (existsSync(join(wt, f)) ? read(f) : '') + '\n' + code + '\n');
  const run = (check, root = wt) => ({ '1dl': () => checkKeysAgainstBase(root), '1dm': () => checkFirestoreWrites(root), '1dn': () => checkRulesPaste(root), '1do': () => checkKeptThings(root) })[check]();
  const report = (name, check, wantRed, lines, extra) => {
    const red = lines.filter(l => l.kind === 'err');
    let okk = red.length > 0 === wantRed;
    if (okk && extra) okk = extra(lines);
    if (okk) pass++; else fail++;
    console.log(`${okk ? '✓' : '✗'} ${wantRed ? 'BLOCKED' : 'allowed'} ${check} ${name}${wantRed ? '' : ' (stays green)'}`);
    (red.length ? red : lines.filter(l => l.kind !== 'info')).slice(0, 2).forEach(l => console.log(`     ${l.kind}: ${l.text.slice(0, 330)}`));
  };
  const expect = (name, check, wantRed, plant, extra) => {
    reset();
    try { plant(); } catch (e) { console.log(`✗ ${name}: could not plant — ${e.message}`); fail++; return; }
    clearBaseCache();
    report(name, check, wantRed, run(check), extra);
  };
  const loadSets = () => {
    const cfg = read('config-main.js'), sets = [];
    for (const f of readdirSync(wt).filter(f => /^module-\d+\.js$/.test(f))) { const sb = { console: { log() {}, warn() {}, error() {} } }; vm.createContext(sb); vm.runInContext(cfg, sb); vm.runInContext(read(f), sb); sets.push(...vm.runInContext('SETS', sb)); }
    return sets;
  };
  const quoteIn = (f, text) => { const s = read(f); return [`'${text.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`, `"${text}"`, `'${text}'`].find(x => s.includes(x)); };
  const keyedMc = (mod) => { for (const w of loadSets()) { if (w.moduleNum !== mod) continue; for (const st of Object.values(w.stations || {})) for (const sec of st.sections || []) for (const step of sec.steps || []) if (step.response && step.response.type === 'mc' && step.response.prompt) return { w, step }; } throw new Error(`no keyed MC in Module ${mod}`); };
  const T = (f, code) => () => append(f, code);
  const isWarnOnly = lines => lines.some(l => l.kind === 'warn');
  try {
    // ── the unmodified tree ──
    for (const c of ['1dl', '1dm', '1dn', '1do']) expect('the unmodified tree', c, false, () => {});

    // ── rule 1: move or renumber ──
    expect('rule 1: two steps of a Module 2 section swap labels', '1dl', true, () => {
      const w = loadSets().find(x => x.moduleNum === 2), sec = w.stations.b.sections.find(x => (x.steps || []).length >= 2 && x.steps[0].label !== x.steps[1].label);
      const a = quoteIn('module-2.js', sec.steps[0].label), b = quoteIn('module-2.js', sec.steps[1].label);
      if (!a || !b) throw new Error('labels not found as written');
      write('module-2.js', read('module-2.js').replace(a, '\u0001').replace(b, a).replace('\u0001', b));
    });
    expect('rule 1: a section removed from Module 7', '1dl', true, T('module-7.js', "SETS.forEach(w => Object.values(w.stations || {}).forEach(st => { if (st.sections && w.moduleNum === 7) st.sections = st.sections.filter(x => x.kind !== 'take-to-song'); }));"));
    expect('rule 1: a set removed (R1-8 shape)', '1dl', true, T('module-9.js', "SETS.splice(SETS.findIndex(w => w.moduleNum === 9), 1);"));
    expect('near-miss: a step appended at the tail of a frozen Module 2 section', '1dl', false, T('module-2.js', "(function(){ const w = SETS.find(x => x.id === 'm2w1'); const sec = w.stations.b.sections[w.stations.b.sections.length - 1]; sec.steps.push({ label: 'Self-test appended step', text: 'Play it.' }); })();"));
    expect('near-miss: a step inserted mid-section in open Module 5', '1dl', false, T('module-5.js', "(function(){ const w = SETS.find(x => x.moduleNum === 5); const sec = w.stations.b.sections.find(s => !s.kind && (s.steps||[]).length > 1); sec.steps.splice(1, 0, { label: 'Self-test inserted step', text: 'Play it.' }); })();"));
    expect('near-miss (R1-8): a new module-14.js with a new set', '1dl', false, () => write('module-14.js', "SETS.push({ id: 'm14w1', label: 'Self-test set', moduleNum: 14, stations: { b: { sections: [{ title: 'One', steps: [{ label: 'Play it', text: 'Play it.' }] }] } }, skills: [{ id: 'm14w1-s1', text: 'x', practice: { type: 'mc', prompt: 'p', choices: ['a', 'b', 'c'], answer: 0 } }] });\n"));
    expect('R1-8: a module that does not load prints the proof\'s Error: line', '1dl', true, T('module-6.js', 'SETS.push({ id: ;'), ls => ls.some(l => /Error:/.test(l.text)));
    expect('near-miss (R1-14): an untracked module-2.backup.js', '1dl', false, () => write('module-2.backup.js', 'SETS.length = 0;\n'));
    { // R1-2 (A): a pure revert of an allowed change is let through, loudly
      reset();
      append('module-2.js', "(function(){ const w = SETS.find(x => x.id === 'm2w1'); const sec = w.stations.b.sections[w.stations.b.sections.length - 1]; sec.steps.push({ label: 'Self-test appended step', text: 'Play it.' }); })();");
      const bad = commit('an allowed append');
      git(wt, ['revert', '--no-edit', '--no-commit', bad]);
      process.env.GC_CHECKS_BASE = bad; clearBaseCache();
      report('near-miss (R1-2A): git revert of an allowed tail append, measured against the reverted push', '1dl', false, run('1dl'), ls => ls.some(l => l.kind === 'warn' && /LET THROUGH/.test(l.text)));
      git(wt, ['reset', '-q', '--hard', bad]);
      { const w = loadSets().find(x => x.moduleNum === 3); const st = w.stations.b.sections.flatMap(x => x.steps || [])[0]; const hit = quoteIn('module-3.js', st.label); edit('module-3.js', hit, hit[0] + 'X' + hit.slice(1)); }
      process.env.GC_CHECKS_BASE = bad; clearBaseCache();
      report('R1-2A: a change that is NOT a revert (a frozen label edited) stays refused', '1dl', true, run('1dl'));
    }

    // ── rule 2: keyed MCs, frozen and about to be entered ──
    const reword = (mod, field, prefix) => () => { const { w, step } = keyedMc(mod); const f = `module-${w.moduleNum}.js`; const v = field === 'prompt' ? step.response.prompt : field === 'prompt_es' ? step.response.prompt_es : step.response.choices[0]; if (!v) throw new Error(`no ${field}`); const hit = quoteIn(f, v); if (!hit) throw new Error(`${field} not found as written`); edit(f, hit, hit[0] + prefix + hit.slice(1)); };
    expect("rule 2: a frozen keyed quiz's English prompt reworded (Module 1)", '1dl', true, reword(1, 'prompt', 'Quick check: '));
    expect("rule 2: a frozen keyed quiz's choice reworded (Module 1)", '1dl', true, reword(1, 'choice', 'Maybe '));
    expect("rule 2 (R1-3): a keyed quiz's choice reworded in Module 4, the module the class is about to enter", '1dl', true, reword(4, 'choice', 'Maybe '), ls => ls.some(l => /about to enter/.test(l.text)));
    expect("rule 2 (R1-3): a keyed quiz's English prompt reworded in Module 4", '1dl', true, reword(4, 'prompt', 'Look: '));
    expect("near-miss: a keyed quiz's Spanish prompt reworded (Module 1)", '1dl', false, reword(1, 'prompt_es', 'Revisa: '));
    expect('near-miss: a keyed quiz ADDED to an existing step of frozen Module 2', '1dl', false, T('module-2.js', "(function(){ const w = SETS.find(x => x.id === 'm2w1'); const step = w.stations.b.sections.flatMap(s => s.steps || []).find(st => !st.response); step.response = { type: 'mc', prompt: 'Which string is lowest?', choices: ['Low E', 'A', 'High e'], answer: 0 }; })();"));
    expect("near-miss (R1-3): a keyed quiz reworded in Module 8 is printed under the summary", '1dl', false, reword(8, 'choice', 'Maybe '), ls => ls.some(l => l.kind === 'info' && /choices/.test(l.text)));
    expect('near-miss (R1-3): a step relabelled in Module 9 is listed, not just announced', '1dl', false, () => { const w = loadSets().find(x => x.moduleNum === 9); const st = w.stations.b.sections.flatMap(s => s.steps || [])[0]; const hit = quoteIn('module-9.js', st.label); if (!hit) throw new Error('label not found'); edit('module-9.js', hit, hit[0] + 'New: ' + hit.slice(1)); }, ls => ls.some(l => l.kind === 'info' && /relabelled/.test(l.text)));

    // ── rule 3: progress/… — the console, and every script a page loads (R1-4) ──
    const CONSOLE = 'teacher-students.js';
    expect('rule 3: console writes progress, the name built from pieces', '1dm', true, T(CONSOLE, "function teacherSelfTestReset(uid){ const C = 'prog' + 'ress'; return db.collection(C).doc(uid).set({}, {merge:true}); }"));
    expect('rule 3: console writes progress through a template path', '1dm', true, T(CONSOLE, "async function teacherSelfTestA(uid){ await db.doc(`progress/${uid}`).update({ x: 1 }); }"));
    expect('rule 3: console batch-writes progress through a variable', '1dm', true, T(CONSOLE, "async function teacherSelfTestB(uid){ const r = db.collection('progress').doc(uid); const b = db.batch(); b.update(r, {x:1}); await b.commit(); }"));
    expect("rule 3: console writes through a progress snapshot's .ref", '1dm', true, T(CONSOLE, "async function teacherSelfTestC(){ const s = await db.collection('progress').get(); s.docs.forEach(d => d.ref.update({x:1})); }"));
    expect("rule 3: console calls the app's progress writer", '1dm', true, T(CONSOLE, 'function teacherSelfTestD(){ flushSave(); }'));
    expect('rule 3: console writes through a reference from an unknown collection', '1dm', true, T(CONSOLE, 'function teacherSelfTestE(name, uid){ return db.collection(name).doc(uid).set({}); }'));
    expect('rule 3: console writes progress through a bracketed receiver', '1dm', true, T(CONSOLE, "async function teacherSelfTestF(uid){ await (db).collection('progress').doc(uid).set({}); }"));
    expect('rule 3: console takes ref by destructuring', '1dm', true, T(CONSOLE, "async function teacherSelfTestG(){ const s = await db.collection('progress').get(); s.docs.forEach(({ ref }) => ref.update({ x: 1 })); }"));
    expect("rule 3: console calls the app's progress writer as window.saveProgress", '1dm', true, T(CONSOLE, 'function teacherSelfTestH(){ window.saveProgress(); }'));
    expect('rule 3 (R1-4): console calls this.flushSave()', '1dm', true, T(CONSOLE, 'function teacherSelfTestH2(){ this.flushSave(); }'));
    expect('rule 3: console writes progress inside an inline handler string', '1dm', true, T(CONSOLE, "function teacherSelfTestI(uid){ return `<button onclick=\"db.collection('progress').doc('${uid}').delete()\">x</button>`; }"));
    expect("rule 3: console renders an inline handler that calls the app's saver", '1dm', true, T(CONSOLE, "function teacherSelfTestI2(){ return '<button onclick=\"saveProgress()\">x</button>'; }"));
    expect('rule 3: console hands a progress reference to a helper', '1dm', true, T(CONSOLE, "function teacherSelfTestJ(uid){ return teacherSelfTestWrite(db.collection('progress').doc(uid)); }\nfunction teacherSelfTestWrite(r){ return r.set({}); }"));
    expect("rule 3 (R1-4): live-quiz.js's host code writes progress", '1dm', true, T('live-quiz.js', "function lqSelfTestReset(uid){ return lqDb.collection('progress').doc(uid).set({}); }"));
    expect('rule 3 (R1-4): a new root script a page loads writes progress', '1dm', true, () => { write('admin-tools.js', "function adminReset(uid){ db.collection('progress').doc(uid).delete(); }\n"); edit('index.html', '<script defer src="app/boot.js"></script>', '<script defer src="admin-tools.js"></script>\n<script defer src="app/boot.js"></script>'); });
    expect('rule 3 (R1-4): a script in a new folder a Journey page loads writes progress', '1dm', true, () => { write('lib/extra.js', "function extraReset(uid){ fbDb.collection('progress').doc(uid).update({ a: 1 }); }\n"); edit('tabs/the-cure.html', '</body>', '<script src="../lib/extra.js"></script>\n</body>'); });
    expect("rule 3 (R1-4): an inline <script> in index.html writes progress", '1dm', true, () => edit('index.html', '</body>', "<script>function selfTestInline(u){ db.collection('progress').doc(u).update({ a: 1 }); }</script>\n</body>"));
    expect('rule 3 (R1-4): an onclick="" attribute in index.html writes progress', '1dm', true, () => edit('index.html', '</body>', "<button onclick=\"db.collection('progress').doc(currentUser.uid).delete()\">x</button>\n</body>"));
    expect('rule 3 (R1-4): an app helper put on window writes progress', '1dm', true, T('app/shell.js', "window.selfTestResetMe = function(uid){ return db.collection('progress').doc(uid).set({}); };"));
    expect('rule 3 (R1-4): an IIFE in an app part writes progress', '1dm', true, T('app/review.js', "(function(){ db.collection('progress').doc('x').set({}); })();"));
    expect('rule 3 (R1-4): an arcade part writes progress through a template path', '1dm', true, T('coach-hub.js', 'function selfTestCoach(u){ return db.doc(`progress/${u}`).update({ a: 1 }); }'));
    expect('rule 3 (R1-4): a second write inside a pinned writer (flushSave)', '1dm', true, () => edit('app/save.js', 'async function flushSave(', "function selfTestNoop(){}\nasync function flushSave(){ await db.collection('progress').doc(currentUser.uid).update({ extra: 1 }); }\nasync function flushSaveOld("));
    expect("near-miss: a new console READ of one student's progress", '1dm', false, T(CONSOLE, "async function teacherSelfTestRead(uid){ const s = await db.collection('progress').doc(uid).get(); return s.exists ? s.data() : null; }"));
    expect('near-miss: a console write to another collection, deleted through .ref', '1dm', false, T(CONSOLE, "async function teacherSelfTestOther(){ const s = await db.collection('issueReports').where('x','==',1).get(); const b = db.batch(); s.docs.forEach(d => b.delete(d.ref)); await b.commit(); }"));
    // ── R1-7: shapes that once read as false reds, all green ──
    const fr = [
      ['a local variable that shares an app saver\'s name', 'function teacherFr1(){ const saveProgress = () => 1; return saveProgress(); }'],
      ['an object key that shares one', 'function teacherFr2(){ return { flushSave: 1, goToSet: 2 }; }'],
      ['an object literal with a ref key ({ ref: el })', "function teacherFr3(el){ return { ref: el, id: 'x' }; }"],
      ['help text that shows Firestore code', "function teacherFr4(){ return 'Use db.collection(\"x\").doc(y).set() only in a script'; }"],
      ['a parameter that shares an app saver\'s name', 'function teacherFr5(goToSet){ return goToSet(); }'],
      ['a method shorthand that shares one', 'function teacherFr6(){ const o = { renderPills(){ return 1; } }; return o.renderPills(); }'],
      ["someone else's method of that name", 'function teacherFr7(obj){ return obj.flushSave(); }'],
      ['an inline handler that calls a console function', "function teacherFr8(){ return '<button onclick=\"teacherRefreshStudents()\">x</button>'; }"],
      ['a template that shows .doc( in text', 'function teacherFr9(id){ return `<code>.doc(${id})</code> is how a path is named`; }'],
    ];
    fr.forEach(([what, code], i) => expect(`near-miss (R1-7 #${i + 1}): ${what}`, '1dm', false, T(CONSOLE, code)));

    // ── rule 4: config/class ──
    expect('rule 4: a console write to config/class, the path built from pieces', '1dm', true, T(CONSOLE, "async function teacherSelfTestCfg(){ await db.collection('con' + 'fig').doc('cl' + 'ass').set({ x: 1 }, { merge: true }); }"));
    expect('rule 4: an app write to config/class through a constant', '1dm', true, T('app/explore.js', "const SELF_TEST_CFG = 'config/class';\nfunction selfTestAppCfg(){ return db.doc(SELF_TEST_CFG).update({ x: 1 }); }"));
    expect('rule 4 (R1-13): a second teacherWriteConfig declared in another part', '1dm', true, T('teacher-songs.js', "async function teacherWriteConfig(patch){ const ref = db.collection('config').doc('class'); await ref.set(patch, { merge: true }); }"));
    expect('near-miss: a new config field written through teacherWriteConfig()', '1dm', false, T(CONSOLE, "async function teacherSelfTestField(on){ try{ await teacherWriteConfig({ selfTestField: on }); }catch(e){ teacherConfigSaveFailed(e, 'x'); } }"));
    expect('near-miss: a new read of config/class', '1dm', false, T('app/explore.js', "async function selfTestReadCfg(){ const d = await db.collection('config').doc('class').get(); return d.data(); }"));

    // ── rule 5: firestore.rules ──
    const rulesEdit = () => { const t = read(RULES_FILE) + '\n// self-test edit\n'; write(RULES_FILE, t); return t; };
    expect('rule 5: firestore.rules changed with no acknowledgement (at the push)', '1dn', true, rulesEdit);
    expect('near-miss (R1-12): the same change at a commit only warns', '1dn', false, () => { rulesEdit(); process.env.GC_CHECKS_STAGE = 'commit'; }, isWarnOnly);
    expect('rule 5: changed, acknowledged with the wrong hash', '1dn', true, () => { rulesEdit(); append(PASTE_FILE, ack('000000000000')); });
    expect('rule 5: changed, acknowledged without saying Jonathan was told', '1dn', true, () => { const t = rulesEdit(); append(PASTE_FILE, `- ${today} firestore.rules ${rulesHash(t)}: paste it in the Firebase console`); });
    expect('near-miss: firestore.rules changed WITH its acknowledgement', '1dn', false, () => { const t = rulesEdit(); append(PASTE_FILE, ack(rulesHash(t))); });
    expect('near-miss: a push that does not touch the rules', '1dn', false, () => edit('teacher-songs.js', 'function ', 'function selfTestNoop(){}\nfunction '));
    expect('rule 5 (R1-11): a line the base had is removed from RULES-PASTE.md', '1dn', true, () => write(PASTE_FILE, read(PASTE_FILE).split('\n').filter(l => !/^- 2026-11-13 firestore\.rules 789574577823/.test(l)).join('\n')));
    { // R1-2 (B, C): a rules revert whose printed line is already in the file
      reset();
      const v1 = read(RULES_FILE), v2 = v1 + '\n// self-test v2\n';
      append(PASTE_FILE, ack(rulesHash(v1)));          // the same words as the line the revert will print (same day)
      write(RULES_FILE, v2); append(PASTE_FILE, ack(rulesHash(v2)));
      const b = commit('rules v2, acknowledged');
      process.env.GC_CHECKS_BASE = b; clearBaseCache();
      write(RULES_FILE, v1);
      report('R1-2B: a rules revert with no new line', '1dn', true, run('1dn'));
      append(PASTE_FILE, ack(rulesHash(v1)));
      clearBaseCache();
      report('near-miss (R1-2C): the same revert after adding the printed line, already in the file once', '1dn', false, run('1dn'));
    }

    // ── rule 6: the cure ──
    expect('rule 6: "the cure" re-levelled (new bytes)', '1do', true, () => { const f = join(wt, 'audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-full.mp3'); const b = readFileSync(f); b[b.length - 1] ^= 1; writeFileSync(f, b); });
    expect('rule 6: loudness.py pointed at another song as the reference', '1do', true, () => edit('tools/loudness.py', "REFERENCE_SLUG = 'olivia-rodrigo-the-cure'", "REFERENCE_SLUG = 'the-beatles-let-it-be'"));
    expect("near-miss: a new song's audio added", '1do', false, () => write('audio/self-test-song-backing-E-100bpm-440hz-full.mp3', 'ID3 self-test'));

    // ── rule 7: switched off, never deleted, not hollowed out (R1-5) ──
    expect('rule 7: the Daily 5 functions deleted (banner line kept)', '1do', true, () => edit('app/lesson.js', 'function buildDaily5(){', 'function buildDaily5_gone(){'));
    expect('rule 7: TAKE_TO_SONG_ENABLED deleted', '1do', true, () => edit('app/shell.js', 'const TAKE_TO_SONG_ENABLED = false;', ''));
    expect('rule 7: a Take It to a Song section emptied of its steps', '1do', true, T('module-8.js', "SETS.filter(w => w.moduleNum === 8).forEach(w => Object.values(w.stations||{}).forEach(st => (st.sections||[]).forEach(s => { if (s.kind === 'take-to-song') s.steps = []; })));"));
    expect('rule 7 (R1-5): buildDaily5\'s body emptied', '1do', true, () => edit('app/lesson.js', /function buildDaily5\(\)\{[\s\S]*?\n\}\n/, "function buildDaily5(){ return ''; }\n"));
    expect('rule 7 (R1-5): the .daily5-inline rules deleted from styles.css', '1do', true, () => write('styles.css', read('styles.css').replace(/^\.daily5-inline[^\n]*\n/gm, '')));
    expect('rule 7 (R1-5): the daily5 markup removed from index.html', '1do', true, () => edit('index.html', 'class="daily5-panel"', 'class="search-panel"'));
    expect('rule 7 (R1-5): a daily5 string blanked (English)', '1do', true, () => edit('i18n.js', /('daily5\.title':\s*\{ en: )'[^']*'/, "$1''"));
    expect('rule 7 (R1-5): a daily5 string blanked (Spanish)', '1do', true, () => edit('i18n.js', /('daily5\.openToday':[^\n]*es: )'[^']*'/, "$1''"));
    expect('rule 7 (R1-5): WARMUP_BANK emptied', '1do', true, () => edit('config-main.js', 'const WARMUP_BANK = [', 'const WARMUP_BANK = [];\nconst WARMUP_BANK_OLD = ['));
    expect('rule 7 (R1-5): the TAKE_TO_SONG_ENABLED read in visibleSteps() deleted', '1do', true, () => edit('app/lesson.js', /^\s*if\(isTakeToSongSection\(sec\) && \(!TAKE_TO_SONG_ENABLED[^\n]*\n/m, ''));
    expect('rule 7 (R1-5): the DAILY5_ENABLED read deleted', '1do', true, () => edit('app/lesson.js', 'const reminder = DAILY5_ENABLED &&', 'const reminder = false &&'));
    expect("rule 7 (R1-5): a section's steps replaced by blank stubs", '1do', true, T('module-8.js', "SETS.filter(w => w.moduleNum === 8).forEach(w => Object.values(w.stations||{}).forEach(st => (st.sections||[]).forEach(s => { if (s.kind === 'take-to-song') s.steps = s.steps.map(() => ({ label: 'x', text: '' })); })));"));
    expect('near-miss: the Daily 5 switched ON (Jonathan\'s call)', '1do', false, () => edit('app/lesson.js', 'const DAILY5_ENABLED = false;', 'const DAILY5_ENABLED = true;'));
    expect('near-miss: a step ADDED to a Take It to a Song section', '1do', false, T('module-8.js', "SETS.filter(w => w.moduleNum === 8).forEach(w => Object.values(w.stations||{}).forEach(st => (st.sections||[]).forEach(s => { if (s.kind === 'take-to-song') s.steps.push({ label: 'Self-test extra', text: 'Play it.' }); })));"));

    // ── rule 8: the tour ──
    expect('rule 8: the deleted tour restored from git', '1do', true, () => { const r = git(wt, ['checkout', '5dc1ab8^', '--', 'tour.html', 'tour-img']); if (!r.ok) throw new Error(r.err); });
    expect('rule 8: one old tour screenshot restored under a new name', '1do', true, () => { const r = spawnSync('git', ['show', '5dc1ab8^:tour-img/songs.webp'], { cwd: wt, maxBuffer: 1 << 24 }); writeFileSync(join(wt, 'img', 'songs-shot.webp'), r.stdout); });
    expect('rule 8 (R1-10): the old tour page restored with its title changed', '1do', true, () => { const r = spawnSync('git', ['show', '5dc1ab8^:tour.html'], { cwd: wt, encoding: 'utf8', maxBuffer: 1 << 24 }); write('welcome.html', r.stdout.replace('Website Tour — Beginning Guitar', 'Welcome')); });
    expect('rule 8 (R1-1): the old tour page restored with CRLF line endings', '1do', true, () => { const r = spawnSync('git', ['show', '5dc1ab8^:tour.html'], { cwd: wt, encoding: 'utf8', maxBuffer: 1 << 24 }); write('tour.html', r.stdout.replace(/\n/g, '\r\n')); });
    expect('near-miss: a NEW tour.html of Jonathan\'s own', '1do', false, () => write('tour.html', '<!doctype html><title>Guitar class — welcome</title><p>New tour.</p>'));
    expect('near-miss (R1-9): a new tour in tour-img/ with the old title', '1do', false, () => { write('tour.html', '<!doctype html><title>Website Tour — Beginning Guitar</title><img src="tour-img/new.webp">'); write('tour-img/new.webp', 'RIFF-self-test'); });

    // ── review round 2 ──
    // R2-1: the frozen numbers and 1ap's fingerprints only go up; the base's numbers judge the change
    const lowerAll = () => {
      edit('tools/rule-zero-proof.mjs', /const FROZEN_THROUGH_PINNED = 3;/, 'const FROZEN_THROUGH_PINNED = 0;');
      edit('tools/checks.mjs', /const FROZEN_MC_THROUGH_MODULE = 3;/, 'const FROZEN_MC_THROUGH_MODULE = 0;');
      edit('tools/checks.mjs', /const FROZEN_MC_FINGERPRINTS = \{[\s\S]*?\n\};/, 'const FROZEN_MC_FINGERPRINTS = {\n};');
    };
    expect('R2-1: FROZEN_THROUGH, FROZEN_MC_THROUGH_MODULE and the fingerprints lowered to 0 (the "summer reset" recipe)', '1dl', true, lowerAll, ls => ls.some(l => /only ever go up/.test(l.text)));
    expect('R2-1: …then a Module 2 step moved and its quiz reworded, all in one push', '1dl', true, () => { lowerAll(); reword(2, 'choice', 'Maybe ')(); append('module-2.js', "SETS.forEach(w => { if (w.id === 'm2w1') w.stations.b.sections[0].steps.reverse(); });"); }, ls => ls.some(l => /step at this index changed|keyed MC changed/.test(l.text)));
    expect('R2-1: one 1ap fingerprint removed', '1dl', true, () => edit('tools/checks.mjs', /\n  'w1·b·sec0·step2': '[0-9a-f]+',/, ''));
    expect('R2-1: OPEN_THROUGH lowered', '1dl', true, () => edit('tools/rule-zero-proof.mjs', 'Math.max(6, flagNum', 'Math.max(3, flagNum'));
    expect('R2-1: rule-zero-proof weakened to always pass, and a Module 7 step moved in the same push', '1dl', true, () => { edit('tools/rule-zero-proof.mjs', "if (problems) { err(", "if (false) { err("); append('module-7.js', "SETS.forEach(w => { if (w.moduleNum === 7) w.stations.b.sections[0].steps.reverse(); });"); });
    expect('near-miss (R2-1): FROZEN_THROUGH raised to 4 (with 1ap raised too)', '1dl', false, () => { edit('tools/rule-zero-proof.mjs', /const FROZEN_THROUGH_PINNED = 3;/, 'const FROZEN_THROUGH_PINNED = 4;'); edit('tools/checks.mjs', /const FROZEN_MC_THROUGH_MODULE = 3;/, 'const FROZEN_MC_THROUGH_MODULE = 4;'); });
    // R2-2: an insert above a keyed quiz in the next module is allowed; a real removal is not
    const mod4KeyedSection = () => { for (const w of loadSets()) { if (w.moduleNum !== 4) continue; for (const [st, stn] of Object.entries(w.stations || {})) (stn.sections || []).forEach((sec, si) => { const i = (sec.steps || []).findIndex(x => x.response && x.response.type === 'mc'); if (i >= 0 && !globalThis.__m4) globalThis.__m4 = { id: w.id, st, si, i }; }); } const r = globalThis.__m4; delete globalThis.__m4; return r; };
    expect('near-miss (R2-2): a plain step inserted in Module 4 ABOVE a keyed quiz', '1dl', false, () => { const m = mod4KeyedSection(); append('module-4.js', `SETS.forEach(w => { if (w.id === '${m.id}') w.stations['${m.st}'].sections[${m.si}].steps.splice(${m.i}, 0, { label: 'Self-test inserted above', text: 'Play it.' }); });`); });
    expect('R2-2: a keyed quiz really removed from Module 4 (its step kept)', '1dl', true, () => { const m = mod4KeyedSection(); append('module-4.js', `SETS.forEach(w => { if (w.id === '${m.id}') delete w.stations['${m.st}'].sections[${m.si}].steps[${m.i}].response; });`); }, ls => ls.some(l => /GONE in Module 4/.test(l.text)));
    { // R2-5: a revert is judged by AGE (24 hours) and per file
      reset();
      append('module-2.js', "(function(){ const w = SETS.find(x => x.id === 'm2w1'); const sec = w.stations.b.sections[w.stations.b.sections.length - 1]; sec.steps.push({ label: 'Self-test appended step', text: 'Play it.' }); })();");
      const old = commit('an allowed append, 30 hours ago', hoursAgo(30));
      git(wt, ['revert', '--no-edit', '--no-commit', old]);
      process.env.GC_CHECKS_BASE = old; clearBaseCache();
      report('R2-5: reverting a module change that has been live 30 hours', '1dl', true, run('1dl'), ls => ls.some(l => /live for 30 hours/.test(l.text)));
      git(wt, ['reset', '-q', '--hard', head]);
      append('module-2.js', "(function(){ const w = SETS.find(x => x.id === 'm2w1'); const sec = w.stations.b.sections[w.stations.b.sections.length - 1]; sec.steps.push({ label: 'Self-test A', text: 'Play it.' }); })();");
      const a = commit('change A (module-2), 3 hours ago', hoursAgo(3));
      append('module-5.js', "(function(){ const w = SETS.find(x => x.moduleNum === 5); const sec = w.stations.b.sections.find(s => !s.kind && (s.steps||[]).length > 1); sec.steps.splice(1, 0, { label: 'Self-test B', text: 'Play it.' }); })();");
      const b = commit('change B (module-5), 1 hour ago', hoursAgo(1));
      git(wt, ['revert', '--no-edit', '--no-commit', a]);
      process.env.GC_CHECKS_BASE = b; clearBaseCache();
      const before = LET_THROUGH.length;
      report('near-miss (R2-5): git revert of the OLDER of two recent module commits', '1dl', false, run('1dl'), ls => ls.some(l => /LET THROUGH/.test(l.text)) && LET_THROUGH.length === before + 1);
    }
    // R2-7: a console saver handed on by name, any shape
    [['setTimeout(flushSave, 0)', 'function teacherSt1(){ setTimeout(flushSave, 0); }'], ['.then(flushSave)', 'function teacherSt2(p){ return p.then(flushSave); }'], ['an alias', 'function teacherSt3(){ const f = flushSave; return f(); }'],
     ["window['flushSave']()", "function teacherSt4(){ return window['flushSave'](); }"], ['flushSave.call()', 'function teacherSt5(){ return flushSave.call(null); }'], ['(0, flushSave)()', 'function teacherSt6(){ return (0, flushSave)(); }']]
      .forEach(([what, code]) => expect(`R2-7: console hands on a saver: ${what}`, '1dm', true, T(CONSOLE, code)));
    // R2-8: scripts no page names, and Firestore methods named in brackets from pieces
    expect('R2-8: a tracked script no page loads by name (built in createElement) writes progress', '1dm', true, () => { write('extra-loader.js', "function extraLoaded(u){ db.collection('progress').doc(u).set({}); }\n"); git(wt, ['add', 'extra-loader.js']); });
    expect("R2-8: an app part writes progress through db['coll' + 'ection'](…)", '1dm', true, T('app/tab.js', "function selfTestBr(u){ return db['coll' + 'ection']('progress').doc(u)['se' + 't']({}); }"));
    // R2-9: the write statements themselves are pinned
    expect('R2-9: flushSave drops { merge: true }', '1dm', true, () => edit('app/save.js', '.set(payload,{merge:true})', '.set(payload)'));
    expect('R2-9: songsLibraryOpen writes another doc', '1dm', true, () => edit('app/explore.js', "db.collection('progress').doc(currentUser.uid)", "db.collection('progress').doc('class-shared')"));
    // R2-10: hollowing around the kept functions
    expect('R2-10: DAILY5_ENABLED && false && …', '1do', true, () => edit('app/lesson.js', 'const reminder = DAILY5_ENABLED &&', 'const reminder = DAILY5_ENABLED && false &&'));
    expect('R2-10: (!TAKE_TO_SONG_ENABLED || true)', '1do', true, () => edit('app/lesson.js', '(!TAKE_TO_SONG_ENABLED ||', '(!TAKE_TO_SONG_ENABLED || true ||'));
    expect('R2-10: an emptied .daily5 rule', '1do', true, () => edit('styles.css', /\.daily5-modal\{[^}]*\}/, '.daily5-modal{}'));
    expect('R2-10: a second buildDaily5 declared in another part (shadowing)', '1do', true, T('app/tab.js', 'function buildDaily5(){ return ""; }'));
    { reset(); edit('app/lesson.js', 'function daily5EscClose(e){', 'function daily5EscClose(e){ /* a11y */ void 0;');
      const no = nb(['--pins']);
      report('R2-10: --pins refuses to write a changed pin without --why', '1do', true, [{ kind: no.status !== 0 && /Not written/.test(no.stdout) ? 'err' : 'ok', text: no.stdout.split('\n').slice(-2).join(' ') }]);
      const yes = nb(['--pins', '--why', 'self-test: an accessibility tweak Jonathan asked for']);
      const pinned = JSON.parse(readFileSync(join(wt, 'tools', 'never-pins.json'), 'utf8')).DAILY5_FUNCTIONS.daily5EscClose;
      clearBaseCache();
      report('near-miss (R2-10): …and with --why it writes the value and the reason, and 1do is green', '1do', false, run('1do'), () => /accessibility tweak/.test(pinned.why) && yes.status === 0);
    }
    // R2-11: the record line must be the printed form, dated no earlier than the change
    expect('R2-11: a record line that says the opposite', '1dn', true, () => { const t = rulesEdit(); append(PASTE_FILE, `- ${today} firestore.rules ${rulesHash(t)}: Jonathan was NOT told to paste it in the Firebase console`); });
    expect('R2-11: a record line dated before the rules change', '1dn', true, () => { const t = rulesEdit(); append(PASTE_FILE, ack(rulesHash(t)).replace(new RegExp(today, 'g'), '2026-01-02')); });
    // R2-3: the state, the hooks, the push stage
    { reset();
      const t = rulesEdit(); const b = commit('rules changed, no record line (pushed with --no-verify)');
      process.env.GC_CHECKS_BASE = b; clearBaseCache();
      report('R2-3: after such a push landed, the next push (rules unchanged since) stays red', '1dn', true, run('1dn'), ls => ls.some(l => /the rules on main are not acknowledged/.test(l.text)));
      append(PASTE_FILE, ack(rulesHash(t))); clearBaseCache();
      report('near-miss (R2-3): …until the record line is added', '1dn', false, run('1dn'));
    }
    expect('R2-3: the hooks git runs are an older copy (at the push)', '1dn', true, () => { write('old-hooks/pre-push', '#!/bin/sh\nexit 0\n'); write('old-hooks/pre-commit', read('.githooks/pre-commit')); process.env.GIT_CONFIG_VALUE_0 = join(wt, 'old-hooks'); }, ls => ls.some(l => /older copy/.test(l.text)));
    expect('near-miss (R2-3): the same at a commit only warns', '1dn', false, () => { write('old-hooks/pre-push', '#!/bin/sh\nexit 0\n'); write('old-hooks/pre-commit', read('.githooks/pre-commit')); process.env.GIT_CONFIG_VALUE_0 = join(wt, 'old-hooks'); process.env.GC_CHECKS_STAGE = 'commit'; }, ls => ls.some(l => l.kind === 'warn' && /older copy/.test(l.text)));
    { reset(); rulesEdit(); delete process.env.GC_CHECKS_STAGE;
      write('stage/pre-push', `#!/bin/sh\n"${process.execPath}" "${join(wt, 'tools', 'never-blocks.mjs')}"\n`);
      spawnSync('chmod', ['+x', join(wt, 'stage', 'pre-push')]);
      const r = spawnSync(join(wt, 'stage', 'pre-push'), [], { cwd: wt, encoding: 'utf8', env: { ...process.env } });
      report('R2-3: GC_CHECKS_STAGE unset, run by a pre-push hook (seen with ps): a rules change is refused', '1dn', true, [{ kind: /✗ 1dn 1dn: refused — firestore\.rules differs/.test(r.stdout) ? 'err' : 'ok', text: r.stdout.split('\n').filter(l => / 1dn /.test(l)).slice(-1)[0] || r.stdout.slice(-200) }]);
    }
    // R2-14: the pre-push hook refuses a push of a commit that is not the checked-out one
    { reset();
      const r = spawnSync('sh', [join(wt, '.githooks', 'pre-push'), 'origin', 'x'], { cwd: wt, encoding: 'utf8', input: `refs/heads/x ${git(wt, ['rev-parse', 'HEAD~1']).out} refs/heads/x 0000000000000000000000000000000000000000\n` });
      report('R2-14: pre-push, pushing a commit that is not HEAD', 'hook', true, [{ kind: r.status === 1 && /vouch for the wrong commit/.test(r.stdout) ? 'err' : 'ok', text: r.stdout.trim().slice(0, 200) }]);
    }

    // ── R1-1: CRLF copies of every text file the checks read ──
    expect('near-miss (R1-1): every text file in CRLF (a Windows checkout, core.autocrlf=true) — 1dl', '1dl', false, () => crlfAll(wt));
    for (const c of ['1dm', '1dn', '1do']) {
      reset(); crlfAll(wt); Object.assign(process.env, CRLF_ENV); clearBaseCache();
      report(`near-miss (R1-1): every text file in CRLF — ${c}`, c, false, run(c));
    }

    // ── R1-6 / R1-14: no base ──
    expect('near-miss (R1-14): on GitHub with no base, a warning', '1dl', false, () => { process.env.GITHUB_ACTIONS = 'true'; process.env.GC_CHECKS_BASE = ''; }, ls => ls.some(l => l.kind === 'warn' && /GitHub gave no commit/.test(l.text)));
    {
      const cl = join(dir, 'clone');
      const common = git(ROOT, ['rev-parse', '--git-common-dir']).out;
      const gd = common.startsWith('/') ? common : join(ROOT, common);
      git(dir, ['clone', '-q', '--no-checkout', '--depth', '1', `file://${gd}`, cl]);
      git(cl, ['fetch', '-q', '--depth', '1', 'origin', head]);
      git(cl, ['sparse-checkout', 'set', '--no-cone', '/*', '!/audio/']);
      const co = git(cl, ['checkout', '-q', '--detach', 'FETCH_HEAD']);
      if (!co.ok || !existsSync(join(cl, 'module-3.js'))) throw new Error(`the shallow clone did not check out: ${co.err}`);
      git(cl, ['remote', 'remove', 'origin']);
      for (const b of git(cl, ['branch', '--format=%(refname:short)']).out.split('\n').filter(Boolean)) git(cl, ['branch', '-q', '-D', b]);
      for (const f of TOOLS) { mkdirSync(dirname(join(cl, f)), { recursive: true }); writeFileSync(join(cl, f), readFileSync(join(ROOT, f))); }
      for (const k of ['GC_CHECKS_BASE', 'GITHUB_ACTIONS']) delete process.env[k];
      clearBaseCache();
      report('near-miss (R1-6): no origin/main, origin/HEAD or main, nothing touched: a warning', '1dl', false, run('1dl', cl), isWarnOnly);
      writeFileSync(join(cl, 'module-3.js'), readFileSync(join(cl, 'module-3.js'), 'utf8') + "\nSETS.forEach(w => { if (w.moduleNum === 3) w.stations.b.sections[0].steps.reverse(); });\n");
      clearBaseCache();
      report('R1-6: no base and a module file changed: refused', '1dl', true, run('1dl', cl));
      writeFileSync(join(cl, RULES_FILE), readFileSync(join(cl, RULES_FILE), 'utf8') + '\n// x\n');
      process.env.GC_CHECKS_STAGE = 'push'; clearBaseCache();
      report('R1-6: no base and firestore.rules changed: refused at the push', '1dn', true, run('1dn', cl));
    }
  } finally {
    Object.assign(process.env, ENV0);
    git(ROOT, ['worktree', 'remove', '--force', wt]);
    try { rmSync(dir, { recursive: true, force: true }); } catch { /* best effort */ }
  }
  console.log(`\nself-test: ${pass} of ${pass + fail} cases behaved (${fail ? 'FAIL' : 'all blocked edits red, all near-misses green'})`);
  process.exit(fail ? 1 : 0);
}

/* Every text file the checks read, rewritten with CRLF line endings; git is told core.autocrlf=true
   (as a Windows checkout is), so it still compares content, not line endings. */
const CRLF_ENV = { GIT_CONFIG_COUNT: '2', GIT_CONFIG_KEY_1: 'core.autocrlf', GIT_CONFIG_VALUE_1: 'true' };
function crlfAll(root) {
  Object.assign(process.env, CRLF_ENV);
  const out = spawnSync('git', ['ls-files', '-z'], { cwd: root, encoding: 'utf8', maxBuffer: 1 << 26 }).stdout.split('\0').filter(Boolean);
  for (const f of out) {
    if (!/\.(m?js|html|css|md|py|rules|json|txt)$/.test(f) || f.startsWith('audio/')) continue;
    const p = join(root, f);
    let s; try { if (statSync(p).size > 8e6) continue; s = readFileSync(p, 'utf8'); } catch { continue; }
    writeFileSync(p, s.replace(/\r?\n/g, '\r\n'));
  }
  spawnSync('git', ['update-index', '-q', '--refresh'], { cwd: root, env: { ...process.env } });
}

if (process.argv[1] && /never-blocks-selftest\.mjs$/.test(process.argv[1])) selfTest();
