#!/usr/bin/env node
/* Stay proof — a switch to the panel that is ALREADY open stops nothing (2026-11-25, review rounds R1-6 and R2-4).
   Node only, about 1 s, run from the repo root: `node tools/stay-proof.mjs` (or `--root <site folder>` to run it
   against another checkout). Exit 0 = every case held.

   activateSet(id) (app/shell.js) and switchTabById(wid, tab) (app/explore.js) stop what is about to go out of sight:
   a Shuffle Drill (sdAbortAll), a Card Deck or Ear Spark round in the set panels (dkErAbortAll('.week-panel')) and a
   Play tab line (stopSetPanelSeq). When the set or the tab asked for is the one already showing (its pill, the rail's
   open tab, a Part link, "Show me where"), nothing goes out of sight and the student is still using the round, so none
   of the three may run (`stayingHere` in both functions). The cases, in the real app script (tools/sim-app-page.mjs):
     1 activateSet on the set already open: no stopper runs, a dealt Card Deck round in the panel keeps going
     2 activateSet to another set: all three run, and the Deck round in the set panel goes back to Start while one on
       In-Class Activities (outside .week-panel) and one in an open card keep going
     3 switchTabById to the tab already showing: no stopper runs, the round keeps going
     4 switchTabById to the panel's other tab: all three run
   Each stopper is counted by a spy that still calls the real one. Made-up data only. */
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ai = process.argv.indexOf('--root');
const ROOT = ai > 0 ? resolve(process.argv[ai + 1]) : join(HERE, '..');
const { appPage } = await import(join(HERE, 'sim-app-page.mjs'));

let bad = 0, n = 0;
const ok = (c, m) => { n++; if (!c) bad++; console.log(`  ${c ? '✓' : '✗'} ${m}`); };

function setup() {
  const p = appPage(ROOT), c = p.ctx;
  const [A, B] = p.run('SETS.filter(w => !w.locked && !w.comingSoon).slice(0, 2).map(w => w.id)');
  const mkEl = (o = {}) => Object.assign({
    dataset: {}, innerHTML: '',
    classList: { _s: new Set(o.cls || []), add(x) { this._s.add(x); }, remove(x) { this._s.delete(x); }, toggle(x, on) { (on === undefined ? !this._s.has(x) : on) ? this._s.add(x) : this._s.delete(x); }, contains(x) { return this._s.has(x); } },
    closest: sel => (o.closest || {})[sel] || null, contains: el => (o.kids || []).includes(el), querySelectorAll: () => [],
    setAttribute() {}, removeAttribute() {}, hasAttribute() { return false; }, focus() {}, scrollIntoView() {},
  }, o.props || {});
  /* Set A's panel is open on its lesson tab; a Deck box in it, one on In-Class Activities, one in a card. */
  const panelA = mkEl({ cls: ['week-panel', 'active'], props: { dataset: { id: A } } });
  const tabA = mkEl({ cls: ['tab-panel', 'active'], closest: { '.week-panel': panelA } });
  const tabA2 = mkEl({ cls: ['tab-panel'], closest: { '.week-panel': panelA } });
  panelA.querySelectorAll = sel => sel === '.tab-panel' ? [tabA, tabA2] : [];
  c.__els = { 'dkr-set': mkEl({ closest: { '.week-panel': panelA } }), 'dkr-class': mkEl({}), 'dkr-card': mkEl({}), [A + '-station-b']: tabA, [A + '-checklist']: tabA2 };
  c.__panelA = panelA; c.CSS = { escape: x => x };
  p.run(`document.getElementById = id => __els[id] || null;
    document.querySelector = sel => sel === '.week-panel.active' ? __panelA : null;
    document.querySelectorAll = sel => sel === '.week-panel' ? [__panelA] : [];
    window.__spy = { sdAbortAll: 0, dkErAbortAll: 0, stopSetPanelSeq: 0 };
    for (const k of Object.keys(__spy)) { const f = globalThis[k]; globalThis[k] = function(){ __spy[k]++; return f.apply(this, arguments); }; }
    for (const k of ['set', 'class', 'card']) deckDrills[k] = { phase: 'run', cfg: { id: 'x', def: { cards: [] } } };`);
  const spies = () => JSON.parse(p.run('JSON.stringify(__spy)'));
  const phases = () => p.run(`['set', 'class', 'card'].map(k => k + ':' + deckDrills[k].phase).join(' ')`);
  const call = expr => { try { p.run(expr); return ''; } catch (e) { return ' (threw ' + String(e.message).slice(0, 80) + ')'; } };
  return { A, B, spies, phases, call };
}
const none = s => !s.sdAbortAll && !s.dkErAbortAll && !s.stopSetPanelSeq;
const all = s => s.sdAbortAll >= 1 && s.dkErAbortAll >= 1 && s.stopSetPanelSeq >= 1;

console.log(`stay-proof: root ${ROOT}`);
{ const S = setup(); const e = S.call(`activateSet(${JSON.stringify(S.A)})`); const s = S.spies();
  ok(none(s) && S.phases() === 'set:run class:run card:run', `activateSet on the set already open: nothing stops (${JSON.stringify(s)}; ${S.phases()})${e}`); }
{ const S = setup(); const e = S.call(`activateSet(${JSON.stringify(S.B)})`); const s = S.spies();
  ok(all(s) && S.phases() === 'set:setup class:run card:run', `activateSet to another set: the three stoppers run, the set panel's round only (${JSON.stringify(s)}; ${S.phases()})${e}`); }
{ const S = setup(); const e = S.call(`switchTabById(${JSON.stringify(S.A)}, 'station-b')`); const s = S.spies();
  ok(none(s) && S.phases() === 'set:run class:run card:run', `switchTabById to the tab already showing: nothing stops (${JSON.stringify(s)}; ${S.phases()})${e}`); }
{ const S = setup(); const e = S.call(`switchTabById(${JSON.stringify(S.A)}, 'checklist')`); const s = S.spies();
  ok(all(s), `switchTabById to the panel's other tab: the three stoppers run (${JSON.stringify(s)}; ${S.phases()})${e}`); }
console.log(`stay-proof: ${n} cases, ${bad} failed`);
process.exit(bad ? 1 : 0);
