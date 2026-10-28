# Guitar Class Website — Claude Instructions

Operative rules only. History and the *why*: `WORKFLOW.md` ("Moved from CLAUDE.md" sections).

## Start here — the short list (read this even if you read nothing else)

**Before you say "done" on a code change:**
1. While working: `node tools/checks.mjs --check --skip-links` (a Stop hook now
   runs it for you at the end of every turn that changed code; if it blocks
   your stop, fix the cause — see "Stop hook" below). Before a push: the full
   `node tools/checks.mjs`. Never hand-edit the version lines in `sw.js`.
2. Touched a `module-N.js`? `node tools/rule-zero-proof.mjs origin/main`, and
   paste its summary into your report.
3. Touched a renderer, escaping, or 3+ files (counted as in "Triggers" below)?
   `node tools/smoke.mjs --baseline origin/main` — a real browser walks every set
   in English and Spanish (about a minute).
4. Changed what a student SEES (a renderer, a colour, a new control, or
   directions that describe the music)? Before reporting:
   - Screenshot every state at 1366×657 — before, during and after any
     highlight or toggle — and look at each one.
   - A sentence that states a pattern across the data ("root in one bar, 5th
     in the next") → prove it with a script over all of it and report the
     count ("76 of 76").
   - A new control or default → pin the default in `checks.mjs` and make
     `tools/smoke.mjs` click it and reload.
5. New student-facing text → its Spanish twin, same edit. A new step field →
   both step renderers.
6. A student can see the change → a `CHANGELOG.md` entry, same push.
7. Hit a review trigger? Ask Jonathan **Fast or Reviewed** after the build —
   see "Fast or Reviewed" under the Triggers.
8. Right before pushing: `git fetch`, then `git log HEAD..origin/main`. After
   pushing: `node tools/checks.mjs --live`.

**Never, whatever the task says:** move or renumber a section or step (progress
keys); reword a keyed MC's choices — or its English prompt — in a frozen module
or the one the class is about to enter ("Three regimes"); write `progress/{uid}`
from console code; write `config/class` except through `teacherWriteConfig()`;
change `firestore.rules` without telling Jonathan it needs a console paste;
re-level "the cure"; delete what is switched off (Daily 5, Take It to a Song
sections); resurrect the deleted student tour.

**Habits that catch the expensive bugs:**
- Grep before you edit — the same bug lives in sibling copies and in comments
  that describe the old behaviour. Fix them together.
- Unsure whether a change is allowed? Run the proof tool; don't reason it out.
- A check fails → fix the cause. Never loosen the check, or add an allowlist
  entry, to get green.
- Report what you verified with the denominator ("306 handlers compiled"), not
  "looks fine". A script that finds 0 in both the old and new tree proves nothing.
- Product calls, and rules that contradict each other, go to Jonathan through
  AskUserQuestion — don't pick silently.

Which file to read before touching an area: the table under "Lazy-loaded guidance".

## Project
Jonathan: plain English; Claude handles git.
Static HTML/JS/CSS, no build; Firebase + Firestore; GitHub deploy. Module 13 is single-flow (`stations.b` only).
- **Stations B and C are merged in DISPLAY ONLY.** `stations.b`/`.c` and every progress key
  (`${w.id}-b-sec{gi}-{i}` / `-c-sec{gi}-{i}`) are unchanged — never "simplify" the data.
  `gi` = position after excluding only tuning-warmup sections (`storageSections()`);
  render-time hiding never renumbers it (1af). No "Station B/C" in student text: use
  **Checkpoint / Punto de control**, **Wrap-Up / Cierre** (1n). Only `m4w2` shows Part 1/2
  (1ao).
- **No student tour** — don't resurrect. **No in-panel tab bar**: the rail is the only switcher.
- **Target screen: Chromebook 1366×657.** Phone width out of scope (no phone work or breakpoints unless asked; keep existing phone CSS and 1o).
- Shell: Windows *and* macOS.

## Workflow
"Push to GitHub" / "Save progress with a note: [msg]" → checks, fix flags, commit, push, confirm. **Cowork can't push** (patch + `APPLY-<name>.md` as ONE zip; skill `session-handoff`).

### ⚠️ Pre-push checks before EVERY code push
Touching `index.html`, `styles.css`, `app.js`, `tuner.js`, `teacher.js`, `config-main.js` or a
`module-N.js`: `node tools/checks.mjs` must exit 0 (syntax, data, ~240 links (keep)  auto `CACHE_VERSION` bump; 1bt). Flags `--skip-links`, `--check`, `--live`. **Stop hook** (`GC_STOP_CHECKS=0` = off) and
`.githooks/*` (`git config core.hooksPath .githooks`); "skipping checks" = no-op, run checks by hand. **Parallel sessions share one `origin`:** never push a merge you
didn't intend; fetch first.

### ⚠️ Three regimes decide what may change in a module
Key `${setId}-${station}-sec${gi}-${i}`: a step that changes INDEX loses its tick. Run
`node tools/rule-zero-proof.mjs <base-ref>` and paste output before any content push.
- **Modules 1–`FROZEN_THROUGH` (3)**: labels match BY INDEX; new steps only appended to a
  section's tail; no renames. Keyed-MC choices frozen (1ap); a keyed MC may be ADDED to an
  existing step; reword only via `response.renamedChoices` (old text → new choice). Re-pin 1ap.
- **Modules 4–`OPEN_THROUGH` (6)**: steps insertable anywhere inside a section; `response`
  removable/changeable; old labels keep relative order.
- **Above**: step count and order fixed; a rename prints.
- Every regime: SECTIONS fixed (count, order, kind); a TITLE may be reworded (prints) unless
  it has a `kind` or is the tuning warm-up title.
- **Raise `FROZEN_THROUGH` (= `FROZEN_MC_THROUGH_MODULE`) a module AHEAD of the class.** Locked
  sets are read-only previews; every answer writer needs `isPeekedResponseKey()` (1bl); treat the module the class is
  ABOUT to enter as frozen. A blocked fix → **Summer reset list** (skill `summer-reset`) same day.

### ⚠️ Modules 4 and 5 swapped
Open Chords = 4, Pentatonic = 5. Progress moves once per browser (`swap45*`, `app.js`): no `migrations.swap45` = OLD only, with it NEW only; keep all halves (`flushSave()`, `journey.js`, `teacher.js` remap). Prove with `rule-zero-proof.mjs d0cd004`.

### ⚠️ Other standing rules
- **Sweep ratchet**: 3+ instances of a mechanically-detectable error class → permanent `checks.mjs` detector, same session; it must render/execute, match UNESCAPED strings (`unescapeJs()`); break it in a scratch copy and watch it fail.
- **Activity order/placement** live on the console board (`config/class.activityBoard`,
  `caBoardOrder()`, `teacherMoveActivity()`); a digit in a title is a SERIES number (1d, 1l). **`config/class`** writes only via `teacherWriteConfig()` (1ai; omit `base` unless a single-cell toggle).
- **`firestore.rules` change** → tell Jonathan: Firebase console → Firestore → Rules → paste →
  Publish (GitHub Pages doesn't deploy it).
- **Skills edit** → bump `skillCount` in `MODULE_MANIFEST` .
- **Play-along first**: a song link opens its play-along card if one is openable
  (`songsPlayAlongCard()`, at the click), else the Journey page; no per-song retire list (1bn).
  `TAKE_TO_SONG_ENABLED`/`DAILY5_ENABLED` false: switched off, never deleted.
- **Changelog**: student-facing change → dated top `CHANGELOG.md` entry, same push, student's view.

## i18n
Every new student-facing shell string goes in `i18n.js` (read its header for wiring: `data-i18n` / `t()` + `data-i18n-params`) in BOTH `en` and `es`, same edit; never English-only. Module text gets `_es`; Journey pages `data-es`. Reuse its glossary. String names are solfège (`cuerda Mi grave`); chord symbols/keys are not (`tonalidad de G`, `G/B`). The code is the authoritative Spanish: no review sheet; no proofread sweeps unless asked. `i18n.js` loads before `app.js`, `fab-tools.js`, `tuner.js`, `journey.js`.

## Content rules
- **Simplest direct wording**: short sentences, plain verbs, no idioms, define each music term at first use (1w); defined site terms ("two homes") aren't idioms. Define "root" once, in the first visible Module 2 step using it: the note a chord is named after.
- **No teacher speak**: no lesson-plan words (self-assessment, reflect, benchmark, objective,
  demonstrate/apply/identify), poster lines, praise padding, or "why this matters" sentences;
  "assessment" only as "(assessment preparation)" in Challenge titles (1w-t).
- **Typed answers only when writing IS the task**; else play something with a countable
  "got it" line (1ar).
- **Multi-step directions are lists** (`<ol>`/`<ul>`, `_es` mirrors; >~200 chars, 2+ actions). "You've got it when: …" is plain text AFTER `</ol>`, never an `<li>` or a
  hand-written span; "No score —" notes, partner bonuses, Journey links, then `step-figure`, all last.
- **Challenge cards** (`Challenge N — Title:`): full title in `label` (<~70 chars), `text`
  opens into directions, body always a list; defining parentheticals go in text, identifying ones stay in the title; existing lists byte-for-byte.
- **Presentation is render-time.** **Strings named, never
  numbered** (low E · A · D · G · B · high e; 1j). **No paper drills** (scissors/cards/pen): `step.drill` (`shuffle`/`deck`/`ear`/`notecall`; `DECKS`, `EAR_POOLS`); drop "Got someone around?" from deck cards.
- **TWO step renderers**: `caStepHtml()` (app.js) and `renderTeacherActivityDetail()`
  (teacher.js) — a step-field change edits both (1v); practice cards/exit checks: `caCardBodyHtml` (1bf).
- **Keyed MCs** (`response:{type:'mc'}`, ungraded): shuffled at
  render (`mcOrder`, `MC_PINNED`); keyed step stores choice **text**, practice panel the
  **index** (not pinned by 1ap: wording free, ORDER held) — don't unify. Seed = prompt + choices (a reword re-rolls order); never name an option by position; rewording after students arrive orphans picks. **1ap** pins Modules
  1..`FROZEN_MC_THROUGH_MODULE` (**3**) by fingerprint — raise with the class (re-run, paste
  fingerprints, same commit); don't lower. Check a video's watch range
  before writing a question about it; new authoring fields go in `STUDENT_VALUE_NAME_RE`.
- **Videos**: never invent YouTube IDs; `WebSearch` + oEmbed verify, else drop.

## Lazy-loaded guidance — read before touching these areas
**Read the matching file first** — its ⚠️ rules bind.

| Area | File | Critical rule kept here |
|---|---|---|
| Backing tracks, snippets, card audio, Journey clicks, `playNote`, `audio/` | skill `audio-and-snippets` | Snippet windows are bars, never seconds; never measure a second anchor; never pitch-correct one mix alone; new "silence it" call → `stopCardAudio()`; **every backing track is levelled to "the cure" (−12.5 LUFS) with `python3 tools/loudness.py <slug>`, one gain per song — never re-level the cure** |
| In-Class Activities, gate, exit checks, practice cards, Songs Core rows, render-time hiding, **two step renderers, activity board and numbering, play-along-first links** | skill `in-class-activities` | Exit-check `items` are positional — frozen once taken; don't fold "Play Along now" into `caIsVisible()`; take-to-song is switched off in every module (`TAKE_TO_SONG_ENABLED`) — don't delete the sections, they hold `gi` |
| Core/Choice song chords, keys, timing, bar numbers | skill `song-facts` | Don't re-flag settled facts; don't verify BPM in audits |
| Cloud pushes, Cowork handoff, hook details | skill `session-handoff` | Cowork can't push; the web can |
| Fixes blocked by frozen modules | skill `summer-reset` | Add any blocked fix there the same day; raising FROZEN_* never unlocks anything |
| Live quiz | `.claude/rules/live-quiz.md` (loads with `live-quiz.js`) | Nothing on the stage may reveal the answer before the reveal |
| Set band, left rail, nav grid | `.claude/rules/rail-layout.md` (loads with `styles.css`/`index.html`) | The nav two-column grid is permanent — don't re-simplify; measure, don't do arithmetic |
| Journey tab cards and Journey-page decisions | `.claude/rules/journey-pages.md` (loads with `tabs/**`) | Restyle `.tab` in both stylesheets or neither |
| Writing any JS (`app.js`, `teacher.js`, `coach.js`, `live-quiz.js`, `fab-tools.js`, `tuner.js`, `tabs/journey.js`) | `.claude/rules/code-hygiene.md` (loads with those files) | Inline handler args use `jsonAttrArg(x)`, never `'${escAttr(x)}'`; never a mid-line `//`; grep sibling copies and old-behaviour comments before and after a fix; stop everything you start; escape student-written values |
| Teacher console shared config, **`config/class` write rule** | `.claude/rules/teacher-console.md` (loads with `teacher.js`) | A superseded read returns the newest read, never `null`; a diverged write never marks the copy current; visibility via `teacherBoardView(cfg).assigned` |
| Whole-site audits, many-file refactors, 50+ string passes with sub-agents | skill `site-sweep` (playbook + auditor/fixer/reviewer briefs) | Pre-create the worktrees; cherry-pick to one linear branch; an adversarial review of the *fixes* is required; fetch before pushing |

## How to work with Jonathan
**AskUserQuestion, not free text** (2–4 options). **Don't ask "should I proceed?"**: do the obvious, reversible work; "can you…/how do I…/should this be…" about code = do it. In doubt: pick a default, proceed, say why. Pause only for a real fork, irreversible / outward-facing actions, Fast-or-Reviewed. **Pushing to `main` is not one of those:** checks pass and a
fast-forward is what you'd recommend → push, say what landed, `checks.mjs --live`. Ask for a merge, others' commits in the way, failing checks, or unready work.

**Sweeps (50+ items)**: a second agent told to *find problems*, auditing the FIXES (`site-sweep`).

**Triggers.** Review trigger = 3+ files, a danger-zone file (`teacher.js` config plumbing,
`sw.js` code, `coach.js` detection, `app.js` save path, `firestore.rules`), or 50+ strings.
Not counted: `CHANGELOG.md`, `sw.js` version lines, a string's Spanish twin, pin-only
`checks.mjs` edits. A guard on a new default, or extending what a check reads: break-it proof only (paste output). A new KIND of check, or changed logic/matching, is a trigger (`site-reviewer`, high) plus break-it. Reviewer: `site-reviewer-deep`
(xhigh) for danger-zone / 50+ strings (failing scenario first), else `site-reviewer`. Agent claim → read its quoted lines yourself; agent fix → make it re-derive it on the real code.

**Fast or Reviewed** — after the build and every "Start here" step, AskUserQuestion (what was touched and passed); **Fast** ships, **Reviewed** runs the reviewer; mark one "(Recommended)". Always Reviewed, not offered: danger-zone, new kind of check, sub-agent
sweep, moving/adding/removing a section or step. No trigger → don't ask; no answer →
Reviewed; "quick change/fix" = Fast unless always-Reviewed; Fast reports start "Fast — reviewer skipped."

**Effort**: agent `xhigh` for deep review, else `high`; never `max`. Session: `medium` routine, `high` bug fixes / JS / keyed-MC, `xhigh` danger-zone and sweeps; a tier above the session → ask for `/effort`. Report real numbers, not the premise; name the prior decision a request reverses.

New unrelated topic → AskUserQuestion once: fresh chat or continue?

Full text of trimmed rules: `WORKFLOW.md` → "(trim 2)".
