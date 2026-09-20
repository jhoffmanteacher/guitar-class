#!/usr/bin/env node
/* ════════════════════════════════════════════════════════════════════
   RULE ZERO PROOF — quiz-giveaways work order, 2026-09-19

   Loads every module-N.js twice — once from a git ref (the base commit)
   and once from the working tree — and proves that this edit was
   TEXT-ONLY:

     A. STRUCTURE is identical. Same sets, same stations, same sections
        in the same order with the same titles, same step count, same
        step labels in the same order, same skills in the same order.
        Nothing added, removed or moved, so no positional progress key
        (`${setId}-${station}-sec${gi}-${i}`) can have shifted.

     B. GRADED MCs in Modules 1..FROZEN_THROUGH are BYTE-IDENTICAL —
        `choices`, `choices_es` and `answer`. The graded path persists the
        chosen choice's TEXT, so a reworded choice orphans every stored
        pick. Students are in Module 2 (Jonathan, 2026-09-19).

     C. GRADED MCs in Modules above that MAY differ — every difference is
        printed in full, before and after, so it can be read rather than
        trusted.

     D. PRACTICE MCs (on a skill) keep their choice COUNT and their
        `answer` INDEX everywhere. The practice panel persists the index,
        so wording may change but the order may not.

     E. Every other student-facing text field that changed is printed.

   Usage:  node tools/rule-zero-proof.mjs [base-ref]      (default: origin/main)
   Exit code is non-zero if A, B or D fails.
   ════════════════════════════════════════════════════════════════════ */

import { readFileSync, readdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { tmpdir } from 'node:os';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BASE = process.argv[2] || 'origin/main';
const FROZEN_THROUGH = 2;   // graded MCs in Modules 1..2 are frozen this school year

const C = { red:'\x1b[31m', green:'\x1b[32m', yellow:'\x1b[33m', dim:'\x1b[2m', bold:'\x1b[1m', reset:'\x1b[0m' };
const ok   = m => console.log(`${C.green}✓${C.reset} ${m}`);
const err  = m => console.log(`${C.red}✗${C.reset} ${m}`);
const head = m => console.log(`\n${C.bold}${m}${C.reset}`);
let problems = 0;
const fail = m => { err(m); problems++; };

const MODULE_FILES = readdirSync(ROOT)
  .filter(f => /^module-\d+\.js$/.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

function gitShow(ref, path) {
  const r = spawnSync('git', ['show', `${ref}:${path}`], { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`git show ${ref}:${path} failed: ${r.stderr.trim()}`);
  return r.stdout;
}

/* Load one module file's Sets exactly the way checks.mjs (and the browser) does. */
function loadSets(configSrc, moduleSrc, filename) {
  const sandbox = { console: { log(){}, warn(){}, error(){} } };
  vm.createContext(sandbox);
  vm.runInContext(configSrc, sandbox, { filename: 'config-main.js' });
  vm.runInContext(moduleSrc, sandbox, { filename });
  return vm.runInContext('SETS', sandbox) || [];
}

function loadAll(read) {
  const configSrc = read('config-main.js');
  const sets = [];
  for (const f of MODULE_FILES) sets.push(...loadSets(configSrc, read(f), f));
  return sets;
}

const baseSets = loadAll(p => gitShow(BASE, p));
const headSets = loadAll(p => readFileSync(join(ROOT, p), 'utf8'));

/* ── shared walkers ───────────────────────────────────────────────── */
const sectionsOf = st => st.sections || (st.steps ? [{ title: '', steps: st.steps }] : []);

/* Every MC in a set, with a STABLE identity that does not depend on the
   wording we are about to change: where it lives, not what it says. */
function mcsOf(set) {
  const out = new Map();
  for (const stId of Object.keys(set.stations || {})) {
    sectionsOf(set.stations[stId]).forEach((sec, si) => {
      (sec.steps || []).forEach((step, i) => {
        const r = step.response;
        if (r && r.type === 'mc')
          out.set(`${set.id}·${stId}·sec${si}·step${i}`, { kind: 'graded', mc: r, label: step.label, moduleNum: Number(set.moduleNum) });
      });
    });
  }
  (Array.isArray(set.skills) ? set.skills : []).forEach(sk => {
    if (sk && sk.practice && sk.practice.type === 'mc')
      out.set(`skill ${sk.id}`, { kind: 'practice', mc: sk.practice, label: sk.text, moduleNum: Number(set.moduleNum) });
  });
  return out;
}

/* A structural skeleton that ignores every text field a reword touches. */
function skeleton(sets) {
  return sets.map(s => ({
    id: s.id, moduleNum: s.moduleNum, label: s.label,
    stations: Object.keys(s.stations || {}).sort().map(stId => ({
      stId,
      sections: sectionsOf(s.stations[stId]).map(sec => ({
        title: sec.title, kind: sec.kind || null,
        steps: (sec.steps || []).map(st => ({
          label: st.label,
          hidden: st.hidden === true,
          responseType: st.response ? st.response.type : null,
          choiceCount: st.response && Array.isArray(st.response.choices) ? st.response.choices.length : null,
        })),
      })),
    })),
    skills: (Array.isArray(s.skills) ? s.skills : []).map(sk => ({
      id: sk.id, practiceType: sk.practice ? sk.practice.type : null,
      choiceCount: sk.practice && Array.isArray(sk.practice.choices) ? sk.practice.choices.length : null,
    })),
  }));
}

/* ── A. structure ─────────────────────────────────────────────────── */
head(`A. Structure unchanged vs ${BASE}`);
{
  const a = JSON.stringify(skeleton(baseSets), null, 1);
  const b = JSON.stringify(skeleton(headSets), null, 1);
  if (a === b) {
    const sets = headSets.length;
    let steps = 0, secs = 0;
    for (const s of headSets) for (const k of Object.keys(s.stations || {}))
      sectionsOf(s.stations[k]).forEach(sec => { secs++; steps += (sec.steps || []).length; });
    ok(`${sets} sets · ${secs} sections · ${steps} steps · same ids, order, titles, labels and choice counts — no progress key can have moved`);
  } else {
    const al = a.split('\n'), bl = b.split('\n');
    fail('structure DIFFERS — a step or section was added, removed or moved');
    for (let i = 0, shown = 0; i < Math.max(al.length, bl.length) && shown < 30; i++)
      if (al[i] !== bl[i]) { console.log(`   ${C.dim}line ${i + 1}${C.reset}\n   - ${al[i]}\n   + ${bl[i]}`); shown++; }
  }
}

/* ── B/C/D. the MCs ───────────────────────────────────────────────── */
const baseMc = new Map(), headMc = new Map();
for (const s of baseSets) for (const [k, v] of mcsOf(s)) baseMc.set(k, v);
for (const s of headSets) for (const [k, v] of mcsOf(s)) headMc.set(k, v);

const fp = mc => JSON.stringify({ choices: mc.choices, choices_es: mc.choices_es, answer: mc.answer });
const q = s => JSON.stringify(s);
const changedGraded = [], changedPractice = [];

head(`B. Graded MC choices frozen in Modules 1–${FROZEN_THROUGH}`);
{
  let frozen = 0, broken = 0;
  for (const [k, h] of headMc) {
    if (h.kind !== 'graded' || h.moduleNum > FROZEN_THROUGH) continue;
    const b = baseMc.get(k);
    if (!b) { fail(`${k}: graded MC is NEW in a frozen module`); broken++; continue; }
    frozen++;
    if (fp(b.mc) !== fp(h.mc)) {
      fail(`${k} — "${h.label}": FROZEN graded MC changed. Students have stored their pick as TEXT, so this orphans every answer already given. Reword only with an old→new map in the renderer.`);
      broken++;
      console.log(`   - ${q(b.mc.choices)}\n   + ${q(h.mc.choices)}`);
      console.log(`   - ${q(b.mc.choices_es)}\n   + ${q(h.mc.choices_es)}`);
      console.log(`   - answer ${b.mc.answer}  + answer ${h.mc.answer}`);
    }
  }
  if (!broken) ok(`${frozen} graded MCs in Modules 1–${FROZEN_THROUGH} are byte-identical (choices, choices_es, answer)`);
}

head(`C. Graded MC changes above Module ${FROZEN_THROUGH} (expected — nobody has reached them)`);
for (const [k, h] of headMc) {
  if (h.kind !== 'graded' || h.moduleNum <= FROZEN_THROUGH) continue;
  const b = baseMc.get(k);
  if (!b) { console.log(`   ${k}: NEW graded MC`); continue; }
  const fields = ['prompt', 'prompt_es', 'answer', 'explain', 'explain_es'];
  const diffs = [];
  if (fp(b.mc) !== fp(h.mc)) diffs.push('choices');
  for (const f of fields) if (q(b.mc[f]) !== q(h.mc[f])) diffs.push(f);
  if (!diffs.length) continue;
  changedGraded.push(k);
  console.log(`\n${C.bold}   ${k} — ${h.label}${C.reset}   ${C.dim}(${[...new Set(diffs)].join(', ')})${C.reset}`);
  for (const f of ['prompt', 'prompt_es', 'choices', 'choices_es', 'answer', 'explain', 'explain_es']) {
    if (q(b.mc[f]) === q(h.mc[f])) continue;
    console.log(`     ${f}\n       ${C.red}-${C.reset} ${q(b.mc[f])}\n       ${C.green}+${C.reset} ${q(h.mc[f])}`);
  }
}
if (!changedGraded.length) console.log('   (none)');
else console.log(`\n   ${changedGraded.length} graded MC${changedGraded.length === 1 ? '' : 's'} changed: ${changedGraded.join(', ')}`);

head('D. Practice MCs keep their choice order (answer index + count unchanged)');
{
  let checked = 0, broken = 0;
  for (const [k, h] of headMc) {
    if (h.kind !== 'practice') continue;
    const b = baseMc.get(k);
    if (!b) { fail(`${k}: practice MC is NEW — a stored index would now mean a different choice`); broken++; continue; }
    checked++;
    if (b.mc.answer !== h.mc.answer) { fail(`${k}: practice MC answer index moved ${b.mc.answer} → ${h.mc.answer} — stored picks are INDEXES`); broken++; }
    if ((b.mc.choices || []).length !== (h.mc.choices || []).length) { fail(`${k}: practice MC choice count changed ${(b.mc.choices||[]).length} → ${(h.mc.choices||[]).length}`); broken++; }
    const fields = ['prompt', 'prompt_es', 'explain', 'explain_es'];
    const diffs = [];
    if (fp(b.mc) !== fp(h.mc)) diffs.push('choices');
    for (const f of fields) if (q(b.mc[f]) !== q(h.mc[f])) diffs.push(f);
    if (diffs.length) changedPractice.push([k, h, b, [...new Set(diffs)]]);
  }
  if (!broken) ok(`${checked} practice MCs all keep their choice count and keyed index`);
}
if (changedPractice.length) {
  head('D2. Practice MC wording changes (order held, index held)');
  for (const [k, h, b, diffs] of changedPractice) {
    console.log(`\n${C.bold}   ${k} — ${h.label}${C.reset}   ${C.dim}(${diffs.join(', ')}; answer stays index ${h.mc.answer})${C.reset}`);
    for (const f of ['prompt', 'prompt_es', 'choices', 'choices_es', 'explain', 'explain_es']) {
      if (q(b.mc[f]) === q(h.mc[f])) continue;
      console.log(`     ${f}\n       ${C.red}-${C.reset} ${q(b.mc[f])}\n       ${C.green}+${C.reset} ${q(h.mc[f])}`);
    }
  }
}

/* ── E. any other student-facing step text that changed ───────────── */
head('E. Other student-facing step text changed');
{
  const textOf = sets => {
    const m = new Map();
    for (const s of sets) for (const stId of Object.keys(s.stations || {}))
      sectionsOf(s.stations[stId]).forEach((sec, si) => (sec.steps || []).forEach((st, i) => {
        for (const f of ['label', 'label_es', 'text', 'text_es', 'hint', 'hint_es', 'stuck', 'stuck_es', 'levelUp', 'levelUp_es'])
          if (st[f] !== undefined) m.set(`${s.id}·${stId}·sec${si}·step${i}|${f}`, st[f]);
      }));
    return m;
  };
  const a = textOf(baseSets), b = textOf(headSets);
  let n = 0;
  for (const [k, v] of b) if (a.has(k) && a.get(k) !== v) {
    n++;
    console.log(`\n   ${C.bold}${k}${C.reset}\n     ${C.red}-${C.reset} ${q(a.get(k))}\n     ${C.green}+${C.reset} ${q(v)}`);
  }
  if (!n) console.log('   (none)');
  else console.log(`\n   ${n} step text field${n === 1 ? '' : 's'} changed`);
}

console.log('');
if (problems) { err(`${problems} Rule Zero violation${problems === 1 ? '' : 's'}`); process.exit(1); }
ok('Rule Zero holds: text-only, structure untouched, frozen modules byte-identical');
