// One-off helper (session tool, not shipped): extract every step's text
// (EN + ES snippets) so short labels can be hand-written, then verify and
// inject them. Usage:
//   node tools/extract-steps.mjs extract  > /tmp/steps.json
//   node tools/extract-steps.mjs inject /tmp/labels-module-N.json
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const MODULE_FILES = readdirSync(ROOT).filter(f => /^module-\d+\.js$/.test(f))
  .sort((a, b) => Number(a.match(/\d+/)[0]) - Number(b.match(/\d+/)[0]));

function loadSets(file) {
  const configSrc = readFileSync(join(ROOT, 'config-main.js'), 'utf8');
  const sandbox = { console };
  vm.createContext(sandbox);
  vm.runInContext(configSrc, sandbox, { filename: 'config-main.js' });
  vm.runInContext(readFileSync(join(ROOT, file), 'utf8'), sandbox, { filename: file });
  return vm.runInContext('SETS', sandbox);
}

const strip = h => String(h || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function stepsOf(file) {
  const num = Number(file.match(/\d+/)[0]);
  const out = [];
  for (const w of loadSets(file).filter(s => Number(s.moduleNum) === num)) {
    for (const stId of Object.keys(w.stations || {})) {
      const st = w.stations[stId];
      const sections = st.sections || (st.steps ? [{ title: '', steps: st.steps }] : []);
      sections.forEach((sec, si) => (sec.steps || []).forEach((step, ti) => {
        out.push({
          key: `${file}|${w.id}|${stId}|${si}|${ti}`,
          section: strip(sec.title),
          text: strip(step.text).slice(0, 200),
          text_es: strip(step.text_es).slice(0, 200),
          rawTextStart: String(step.text || '').slice(0, 60),
          hasLabel: step.label !== undefined,
        });
      }));
    }
  }
  return out;
}

const mode = process.argv[2];

if (mode === 'extract') {
  const all = {};
  for (const f of MODULE_FILES) all[f] = stepsOf(f);
  console.log(JSON.stringify(all, null, 1));
} else if (mode === 'inject') {
  // labels file: { "<key>": {"label": "...", "label_es": "..."}, ... }
  const labels = JSON.parse(readFileSync(process.argv[3], 'utf8'));
  // Group by module file; inject in source order by matching each step's
  // raw text prefix (source-escaped) — assert exactly one match each.
  const byFile = {};
  for (const [key, v] of Object.entries(labels)) {
    const file = key.split('|')[0];
    (byFile[file] ||= []).push({ key, ...v });
  }
  for (const [file, items] of Object.entries(byFile)) {
    let src = readFileSync(join(ROOT, file), 'utf8');
    const steps = stepsOf(file);
    const byKey = Object.fromEntries(steps.map(s => [s.key, s]));
    for (const it of items) {
      const step = byKey[it.key];
      if (!step) { console.error(`NO SUCH STEP: ${it.key}`); process.exitCode = 1; continue; }
      if (step.hasLabel) { console.log(`skip (has label): ${it.key}`); continue; }
      // Re-escape the runtime string the way it appears in single-quoted source.
      const esc = step.rawTextStart.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
      const needle = `text: '${esc}`;
      const first = src.indexOf(needle);
      if (first === -1 || src.indexOf(needle, first + 1) !== -1) {
        console.error(`MATCH FAIL (${first === -1 ? 'none' : 'multiple'}): ${it.key} :: ${needle.slice(0, 60)}`);
        process.exitCode = 1; continue;
      }
      // Indentation of the text: line.
      const lineStart = src.lastIndexOf('\n', first) + 1;
      const indent = src.slice(lineStart, first);
      if (!/^\s*$/.test(indent)) { console.error(`INDENT FAIL: ${it.key}`); process.exitCode = 1; continue; }
      const q = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
      const insert = `${indent}label: ${q(it.label)}, label_es: ${q(it.label_es)},\n`;
      src = src.slice(0, lineStart) + insert + src.slice(lineStart);
    }
    writeFileSync(join(ROOT, file), src);
    console.log(`${file}: injected ${items.length} labels`);
  }
} else {
  console.error('mode: extract | inject <labels.json>');
  process.exit(1);
}
