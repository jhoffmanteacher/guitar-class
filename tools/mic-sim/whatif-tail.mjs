/* What a longer reading tail would have done on REAL recordings.
     node tools/mic-sim/eval-takes.mjs <anon-folder> --json out.json
     node tools/mic-sim/whatif-tail.mjs out.json

   eval-takes (teacher.js micEvalWhy) stores, for every note the site graded
   on an event, the readings the site actually had (`siteR`) and the
   readings the replay finds after COACH_EVENT_TAIL on the site's own 40 ms
   schedule, up to 60 ms before the next written note (`lateR`, ms after the
   tail). Here those late readings are added back up to a longer tail and
   the site's own verdict rules are re-applied:
     consensus  >= 2 readings, median, >= 2 and >= half within 0.6 st
     Coach      consensus pitch class in the slot's -> ok (octave -> oct);
                else coachMelodyVote (>= 2, share on note/octave >= 0.5) -> ok;
                no consensus -> dim (unclear); else wrong
     NR         consensus == note or octave, or the vote -> right;
                else 'pitch' (unclear when no consensus)
   Three modes:
     all      every graded event reads to the new tail
     starved  only an event with < 2 readings at the old tail does
     look     a starved event that came out unclear reads to the new tail,
              and turns RIGHT when the note (or octave) is at least half of
              at least `min` readings — otherwise it stays unclear. The
              extra readings can never make a wrong verdict.
   --flips lists every note whose verdict changes, with what the replay
   heard there (replay class; heard = semitones off the written note), so a
   new "wrong" can be checked against the audio: a wrong NOTE heard wrong
   is honest, a right note heard wrong is not.
   Notes the site never graded on an event (no onset, or an onset outside
   the window) are unchanged. The tail=340 row recomputes the site's own
   verdicts from siteR — it must match the site, or the rules here are
   wrong (printed as "replay check"). */
import fs from 'fs';

const args = process.argv.slice(2);
const showFlips = args.includes('--flips');
const file = args.find(a => !a.startsWith('--'));
if (!file){ console.error('usage: node whatif-tail.mjs <eval-takes --json output>'); process.exit(2); }
const rows = JSON.parse(fs.readFileSync(file, 'utf8')).rows;

const VOTE_SHARE = 0.5, VOTE_TOL = 0.6, BASE_TAIL = 340;
const median = a => { const b = a.slice().sort((p, q) => p - q), h = b.length >> 1; return b.length % 2 ? b[h] : (b[h - 1] + b[h]) / 2; };
function consensus(rd){
  if (rd.length < 2) return null;
  const med = median(rd), tight = rd.filter(r => Math.abs(r - med) <= 0.6);
  return tight.length >= 2 && tight.length * 2 >= rd.length ? Math.round(median(tight)) : null;
}
const pc = m => ((m % 12) + 12) % 12;
function share(rd, targets){
  if (!rd.length) return 0;
  return rd.filter(r => targets.some(m => Math.abs(r - m) <= VOTE_TOL)).length / rd.length;
}
// one note's verdict from a reading list, in the eval's right/wrong/unclear words
function verdict(game, n, rd){
  const midi = consensus(rd);
  const want = n.midi;
  if (game === 'coach'){
    if (midi != null && pc(midi) === pc(want)) return 'right';
    if (rd.length >= 2 && share(rd, [want, want + 12]) >= VOTE_SHARE) return 'right';
    return midi == null ? 'unclear' : 'wrong';
  }
  const ok = (midi != null && (midi === want || midi === want + 12)) ||
    (rd.length >= 2 && share(rd, [want, want + 12]) >= VOTE_SHARE);
  return ok ? 'right' : midi == null ? 'unclear' : 'wrong';
}

function run(tail, mode, minN){
  const tot = { right: 0, unclear: 0, wrong: 0, miss: 0 };
  const flips = {};
  let mism = 0;
  rows.forEach(r => {
    const game = r.game.indexOf('Coach') === 0 ? 'coach' : 'nr';
    (r.perNote || []).forEach(n => {
      const w = n.why || {};
      let v = n.site;
      if (w.graded && n.midi != null){
        const site = w.siteR || [];
        const late = (w.lateR || []).filter(p => p[0] <= tail - BASE_TAIL).map(p => p[1]);
        if (mode === 'look'){
          v = n.site;
          if (tail > BASE_TAIL && n.site === 'unclear' && site.length < 2){
            const rd = site.concat(late);
            if (rd.length >= minN && share(rd, [n.midi, n.midi + 12]) >= VOTE_SHARE) v = 'right';
          }
        } else {
          const extend = tail > BASE_TAIL && (mode === 'all' || site.length < 2);
          v = verdict(game, n, site.concat(extend ? late : []));
        }
        if (tail === BASE_TAIL && v !== n.site) mism++;
      }
      tot[v] = (tot[v] || 0) + 1;
      if (v !== n.site){
        const k = n.site + '→' + v; flips[k] = (flips[k] || 0) + 1;
        (flips.list = flips.list || []).push(`${r.take}#${n.i} ${k} [replay ${n.replay}${n.heard != null ? ', heard ' + Math.round(n.heard - n.midi) + 'st' : ''}]`);
      }
    });
  });
  return { tot, flips, mism };
}

const base = run(BASE_TAIL, 'all');
console.log(`replay check (tail ${BASE_TAIL}, site readings only): ${base.mism} graded notes differ from the site's own verdict`);
const fmt = t => ['right', 'unclear', 'wrong', 'miss'].map(k => (k + ' ' + (t[k] || 0)).padEnd(12)).join('');
console.log('\nsite as it ran          ' + fmt(rows.reduce((h, r) => { (r.perNote || []).forEach(n => h[n.site] = (h[n.site] || 0) + 1); return h; }, {})));
const cells = [];
for (const mode of ['starved', 'all']) for (const tail of [420, 500, 600, 700]) cells.push([mode, tail]);
for (const minN of [2, 3]) for (const tail of [500, 600, 700]) cells.push(['look', tail, minN]);
for (const [mode, tail, minN] of cells){
  const o = run(tail, mode, minN);
  const list = o.flips.list || []; delete o.flips.list;
  const fl = Object.entries(o.flips).map(([k, v]) => k + ' ' + v).join(', ');
  console.log(`${(mode + (minN ? ' min' + minN : '')).padEnd(10)} tail ${String(tail).padEnd(4)}    ${fmt(o.tot)}  ${fl}`);
  if (showFlips) list.forEach(s => console.log('      ' + s));
}
