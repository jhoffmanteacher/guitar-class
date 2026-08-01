# PLAN — Three practice features (tempo ladder · recorder tool · Daily Review)

Jonathan approved three features on 2026-07-31 (picked via AskUserQuestion):

1. **Metronome tempo ladder** — a ramp mode that raises the BPM after clean
   passes and drops it back on a miss, enforcing slow-to-fast practice.
2. **Record & listen back** — a fourth rail tool: record 90s, play it back,
   self-assess against a short listen-back checklist. Local only, nothing saved.
3. **Daily Review (spaced review)** — a daily set of 4 already-completed skills
   from earlier modules, weighted toward least-recently-practiced, with an XP
   reward. This is the retention fix for "learned it in Module 3, lost it by
   Module 9."

**Work in the existing worktree** `.claude/worktrees/practice-features`
(branch `worktree-practice-features`) — another Claude session is active in the
main checkout. Commit there; do **not** push (Jonathan triggers pushes).

All line numbers below were verified 2026-07-31 — **grep, don't trust line
numbers.** Implement the features in the order listed (A is smallest, C builds
on nothing from A/B but is the largest).

---

## Shared rules (apply to all three features)

- **No new files.** All code goes into existing shipped files (`fab-tools.js`,
  `app.js`, `index.html`, `styles.css`, `i18n.js`, small touch in `coach.js`).
  That way `sw.js` ASSETS and `checks.mjs` file lists need no edits;
  CACHE_VERSION auto-bumps.
- **Every new student-facing string lands in `i18n.js` in BOTH `en` and `es`,
  same edit.** Suggested ES strings are given per feature below — they follow
  the glossary (`i18n.js:48-144`); adjust wording only against that glossary.
  Settled terms used: lap → *vuelta*, skill → *destreza*, warm-up →
  *calentamiento*, streak → *racha*, goal → *meta*, review → *repaso*
  (existing `review.*` keys), record → *grabar*, and **BPM / tempo / Daily 5
  stay untranslated**. `checks.mjs` checks 1e/1f hard-fail on en/es or key
  drift.
- **None of this ships to the Journey pages** (`tabs/*.html` keep their older,
  simpler tool markup). Consequence: **every new `getElementById` in
  `fab-tools.js` must stay null-guarded**, because that file also runs on
  Journey pages. Do not edit `tabs/fab-tools.css` or any `tabs/*.html`.
- Dynamic text that can change while on screen carries `data-i18n` +
  `data-i18n-params` (JSON via `escAttr`) so `setLang()`'s sweep retranslates
  it — see `app.js:3380` for the pattern.
- No Firestore schema changes anywhere in this plan. New persistent bits ride
  existing plumbing: the `games` save category (already in
  `LOAD_DEPENDENT_SAVE_KEYS`, `app.js:546`) and uid-scoped localStorage via
  `_uidKey()` (`app.js:127`).
- `MODULE_MANIFEST` / `skillCount` untouched — no module skills are added.

---

## Feature A — Metronome tempo ladder

### Goal (what the student sees)

Inside the existing Metronome popup, a "Tempo ladder" toggle. Switched on, it
shows a hint ("Play your part once through, then tap how it went"), a status
line, and two big buttons: **Clean lap ✓** and **Had mistakes**. Two clean
laps in a row → BPM jumps +5 (slider and readout move, click retimes without
losing the accent's place in the bar). A miss → BPM drops 5 and the clean
count resets. Range stays clamped to the slider's 40–220.

Self-report (not mic detection) is deliberate: it matches the site's
self-check philosophy and works with hands on the guitar between passes.

### Where the code lives (verified)

- `fab-tools.js:39` metronome state; `tick()` at 124-132; `getBpm()` at 143
  **reads the DOM slider — the slider IS the state store**; `retimeMetro()`
  at 148-152 swaps the interval *without* an immediate tick (keeps the accent
  in place — use it, don't stop/start); `onBpmSlider(val)` at 153 updates
  `#bpm-display` + retimes; `nudgeBpm` at 154 shows the 40–220 clamp.
- Popup markup: `index.html:157-189` (`#metro-popup`), nudge row at 175-180.
- Chip-row CSS to reuse: `.timer-presets` (the meter buttons already reuse it).
- `toolLabelHtml(icon, key)` at `fab-tools.js:36` — the label-swap-plus-
  `data-i18n` pattern for runtime-swapped button text.

### Implementation spec

1. **State** in `fab-tools.js`: `let ladderOn=false, ladderCleans=0;`. No
   persistence (matches the metronome — nothing there persists).
2. **Markup** in `index.html` inside `#metro-popup`, after the nudge row: a
   toggle chip `<button id="ladder-toggle" aria-pressed="false">` (style like
   the meter chips), and a `#ladder-box` block, hidden until on, containing:
   - hint line (`data-i18n="tools.ladderHint"`),
   - status line `#ladder-status` with `aria-live="polite"`, rendered via
     `t('tools.ladderStatus', {n, bpm})` + `data-i18n-params`,
   - two buttons: `#ladder-clean` (primary) and `#ladder-miss`.
3. **Logic** in `fab-tools.js` (all lookups null-guarded):
   - `toggleLadder()` — flips `ladderOn`, resets `ladderCleans`, toggles
     `#ladder-box` visibility + `aria-pressed`, refreshes the status line.
   - `ladderClean()` — `ladderCleans++`; at 2 → reset to 0 and
     `ladderSetBpm(getBpm()+5)`. Update status.
   - `ladderMiss()` — `ladderCleans=0`; `ladderSetBpm(getBpm()-5)`. Update
     status.
   - `ladderSetBpm(v)` — clamp 40–220, write `#bpm-slider.value`, call
     `onBpmSlider(v)` (one path: readout + retime both happen). Flash the
     status line with a short-lived CSS class for feedback.
   - The ladder works whether or not the click is running (a student may
     ladder against a backing track); don't couple it to `metroRunning`.
4. **CSS** in `styles.css` near the rail-tools block (~754-826): `#ladder-box`
   layout, the two buttons ≥44px tall, status flash animation (respect the
   reduced-motion block), existing tokens only so dark mode is free.
5. **i18n keys** (in the `tools.*` block, `i18n.js:278-309`):

   | key | en | es |
   |---|---|---|
   | `tools.ladder` | `Tempo ladder` | `Escalera de tempo` |
   | `tools.ladderHint` | `Play your part once through, then tap how it went. Two clean laps in a row raise the tempo; a slip brings it back down.` | `Toca tu parte una vez completa y marca cómo salió. Dos vueltas limpias seguidas suben el tempo; un fallo lo baja de nuevo.` |
   | `tools.ladderStatus` | `{n} of 2 clean laps at {bpm} BPM` | `{n} de 2 vueltas limpias a {bpm} BPM` |
   | `tools.ladderClean` | `Clean lap` | `Vuelta limpia` |
   | `tools.ladderMiss` | `Had mistakes` | `Con errores` |
   | `tools.ladderUp` | `Tempo up! Now {bpm} BPM` | `¡Sube el tempo! Ahora {bpm} BPM` |
   | `tools.ladderDown` | `Back to {bpm} BPM — nail it here first` | `Bajamos a {bpm} BPM — domínalo aquí primero` |

   `ladderUp`/`ladderDown` replace the status line for ~2.5s after a bump,
   then it reverts to `ladderStatus` (keep the timeout id so rapid taps don't
   stack).

---

## Feature B — Record & listen back (fourth rail tool)

### Goal (what the student sees)

A **Recorder** tile in the rail tools next to Tuner/Timer/Metronome. Open it,
press **● Record**, play (up to 90s), press Stop → a native audio player plus
a short "Listen back and ask yourself" checklist (chord changes on the beat?
buzzing strings? steady tempo?). Download or re-record. Nothing uploads;
closing the popup does *not* kill an active recording (matches the
metronome's survive-close rule) — the rail tile pulses red while recording.

### Where the code lives (verified)

- **`app.js:2911-3031` is a complete MediaRecorder feature — reuse it, do not
  rewrite it.** `recState` keyed by slot string, `REC_MAX_SECS = 90`,
  `renderRecBody(slot)` (idle → recording → preview states),
  `startRec/stopRec/stopAnyRec/discardRec/downloadRec`, and
  `refreshRecUI(slot)` which looks up `` `mr${slot}-rec-body` ``. Giving the
  popup body id `mrfab-rec-body` and using slot `'fab'` makes the whole
  engine work verbatim — including the crucial fact that **`stopAnyRec()` is
  already called by the tuner (`tuner.js:357`), the Coach (`coach.js:96`) and
  `activateSet` (`app.js:1675`)**, so mic-eviction integration is free.
- FAB wiring: `togglePopup` `fab-tools.js:199-247` (sibling-close list at
  209), click-away at 272-288 (list at 282), Escape at 293-296 (list at 295).
- Markup contract: `index.html:157-189` (popup) and 244-257 (`.fab-buttons`).
- CSS: recorder styles `styles.css:199-216` (`.mr-rec-*`); rail dock block at
  754-826 — **the comment at 752 says "three tools in 252px"; a 4th tile
  squeezes the row** (labels already ellipsize; verify at mobile width).
- Existing i18n: all nine `rec.*` keys (`i18n.js:1819-1830`) reusable
  verbatim.
- CSP already allows `media-src blob:` (`index.html:24`) — no CSP edit.

### Implementation spec

1. **Markup** in `index.html`: new `.tool-popup` `id="rec-popup"` beside the
   others, body = `<div class="mr-rec-body" id="mrfab-rec-body"></div>`
   followed by the checklist block (see 4); new `.fab` `id="fab-rec"` in
   `.fab-buttons` with `onclick="togglePopup('rec')"`, mic icon,
   `data-i18n="tools.recorder"` label, `aria-controls`/`aria-expanded` like
   its siblings.
2. **Wiring** in `fab-tools.js`: add `'rec'` to the arrays at 209, 282, 295.
   In `togglePopup`, on opening `rec`, call `refreshRecUI('fab')` (populates
   the idle body; null-guard `typeof refreshRecUI === 'function'` — app.js
   loads first in the main app, but Journey pages don't load app.js). Closing
   must NOT stop a recording — Escape's `closePopup(w, w==='tuner')` already
   gives `stopAudio=false` for `rec`; add no teardown.
3. **Recording indicator**: in `refreshRecUI` (`app.js:2950-2954`), when
   `slot==='fab'`, toggle class `rec-live` on `#fab-rec` (null-guarded) based
   on `recState.fab && recState.fab.active`. CSS: pulsing red dot on the tile
   (reuse `@keyframes mr-rec-pulse`; respect reduced-motion).
4. **Listen-back checklist**: static `<ul>` under the rec body inside the
   popup, shown always (it's short); title + three items, each with
   `data-i18n`. This is self-assessment prose, not inputs — no state.
5. **Mic constraints**: keep the existing `{audio:true}` from `startRec` —
   browser echo-cancellation partially ducks the metronome click out of the
   recording, which is fine for listen-back (recording *with* the click
   audible in the room still works).
6. **CSS**: 4-tile fit check in `.rail-tools` (grep styles.css:752-770); keep
   ≥44px tap targets; dark theme free via tokens; add `#rec-popup` to the
   print-hide rule only if not already covered by `.tool-popup` (it is —
   verify).
7. **i18n keys** (new; reuse the nine existing `rec.*` keys as-is):

   | key | en | es |
   |---|---|---|
   | `tools.recorder` | `Recorder` | `Grabadora` |
   | `tools.closeRecAria` | `Close recorder` | `Cerrar la grabadora` |
   | `rec.checkTitle` | `Listen back and ask yourself:` | `Escucha la grabación y pregúntate:` |
   | `rec.checkBeat` | `Did every chord change land on the beat?` | `¿Cada cambio de acorde cayó en el tiempo?` |
   | `rec.checkBuzz` | `Any buzzing or muted strings?` | `¿Se oye algún zumbido o alguna cuerda apagada?` |
   | `rec.checkTempo` | `Did the tempo stay steady from start to finish?` | `¿El tempo se mantuvo estable de principio a fin?` |

---

## Feature C — Daily Review (spaced review)

### Goal (what the student sees)

A **Daily Review** button in the left rail. It opens a full-screen page (same
pattern as "Keep practicing") showing **today's 4 review picks**: skills the
student already earned (`gotit`), preferring ones from *earlier* modules that
haven't been practiced in the longest time. Each pick is a card: skill name,
module/set, a "last practiced N days ago" chip, and a **Practice this**
button that jumps straight to that skill's practice panel in its module
(existing `reviewJump` recipe). A rep logged there marks the pick ✓ for
today. All 4 done → a congrats line and **+10 XP** into the arcade XP /
daily-goal / streak system — once per day. The picks are stable all day
(no reshuffling when one is completed).

Name is **"Daily Review"** — deliberately NOT "warm-up": `WARMUP_BANK` /
`daily5.*` already mean the Daily 5 finger-gym. New i18n namespace: `sr.*`.

### Where the code lives (verified)

- **Picker precedent:** `reviewCandidates()` `app.js:4293-4303` — already
  filters to `progress[s.id]==='gotit'` + has `practice` + not practiced
  today, sorts by `practiceLog[sid].last` oldest-first (never-practiced = 0
  sorts first, which is correct). `daysSinceLastRep(sid)` at 3303-3309
  (returns −1 for never). **No completion timestamps exist and none are
  needed** — `practiceLog[sid].last` is the recency source.
- **Page pattern (clone exactly):** "Keep practicing" — screen div
  `index.html:295-303`, rail button `index.html:143`, `EXPLORE_PAGES` row
  `app.js:1763-1769`, `routeExploreHash` pairs `app.js:1867-1878`, and the
  five functions `toggleKeepPracticing`/`openKeepPracticingScreen`/
  `renderKeepPracticing`/`closeKeepPracticingScreen`/`kpClosePanel`
  (`app.js:5969-6029`). `renderKeepPracticing` shows the loading-then-
  `await ensureAllModuleData()` shape to copy.
- **Jump recipe:** `reviewJump(sid, wid)` `app.js:4335-4353` — activate
  module → checklist tab → open practice panel → scroll + flash. Reuse it
  verbatim; do NOT render practice panels on the review page itself
  (`renderPracticePanel` hardcodes `id="pp-${skillId}"` — duplicate IDs
  against the hidden checklist copies would break interactions).
- **Rep hook:** `logPracticeRep` (`app.js:3317-3328`) already calls
  `refreshReviewCards()` — add the Daily Review refresh there.
- **XP:** `awardArcadeXp(gotNewBest)` `coach.js:1745` — +10 base, feeds
  `games.meta` xpToday/streak, saved via existing `saveGames()`. coach.js
  loads AFTER app.js (`index.html:400-410`) → call defensively:
  `typeof awardArcadeXp === 'function'`. Note it no-ops for dev-bypass users.
- **Lookups:** `skillById` `app.js:4557`, `tf()` `app.js:220-227`,
  `tSetLabel`, `MODULE_MANIFEST` for module names.
- Language toggle: the `gc-langchange` listener `app.js:4712-4738` re-renders
  open explore screens — add a Daily Review branch there.

### Implementation spec

1. **Picker `srCandidates()`** (new, next to `reviewCandidates`): walk
   `SETS`, keep skills with `s.practice` && `progress[s.id]==='gotit'`;
   exclude skills in the student's *current* module (`w.moduleNum !==
   currentModuleNum`, derived the same way the app tracks `lastModule`) —
   current-module skills are already in rotation; **fall back to including
   them if fewer than 4 picks remain**. Sort by `practiceLog` `last`
   oldest-first; take 4. (Unlike `reviewCandidates`, do NOT exclude
   practiced-today here — exclusion happens only when *choosing* a fresh
   day's picks, not when re-rendering them.)
2. **Daily snapshot:** localStorage `_uidKey('gc-srPicks')` =
   `{day: dayStr(new Date()), ids: [...]}`. On page open: if stored day is
   today, use stored ids (drop any id that no longer resolves via
   `skillById`); else compute via `srCandidates()` and store. This keeps
   "today's 4" stable as they get completed.
3. **Page render `renderDailyReview()`**: clone `renderKeepPracticing`'s
   shape (loading tip → `await ensureAllModuleData()` → build). Each pick
   card: skill text via `tf(s,'text')`, module name + `tSetLabel(w.label)`,
   recency chip (`sr.daysAgo` with `{n}` / `sr.neverSince` for never),
   done-today state (`daysSinceLastRep(sid)===0` → ✓ styling), and a
   **Practice this** button → `reviewJump(sid, w.id)`. Header: progress line
   `sr.progress` `{done} {total}` with `data-i18n-params`. Empty state
   (`sr.empty`) when a student has no eligible skills yet. All-done state
   shows `sr.allDone`.
4. **Completion + XP:** helper `srCheckComplete()` — if all snapshot ids have
   `daysSinceLastRep===0` && `games.srBonusDay !== dayStr(new Date())`: set
   `games.srBonusDay`, `saveGames()`, call `awardArcadeXp(false)`
   (defensively). Call `srCheckComplete()` + a re-render of the screen (if
   open) from the same spot `refreshReviewCards()` is called after a rep, and
   on every page open. `games.srBonusDay` is a new top-level key inside the
   existing `games` object — no save plumbing changes.
5. **Routing/nav:** `EXPLORE_PAGES` row `{hash:'#daily-review',
   screen:'sr-screen', btn:'sr-btn'}`; close/open pairs in
   `routeExploreHash`; rail button after Keep practicing (`index.html:143`
   area); screen div cloned from `index.html:295-303`. Add the
   `gc-langchange` re-render branch mirroring Keep practicing's.
6. **Small tie-in:** on the existing "Keep it sharp" card
   (`reviewCardHtml`, `app.js:4304-4322`), add one link/button "Daily
   Review →" that routes to `#daily-review` — it's the discovery path from
   inside a module. Keep the card otherwise untouched.
7. **CSS:** pick cards restyled from `.search-hit` / Keep-practicing list
   styles; ✓ done state muted + struck like done steps; tokens only; ≥44px
   targets; check mobile width.
8. **i18n keys** (new `sr.*` namespace; nav label also needed wherever the
   rail button text lives):

   | key | en | es |
   |---|---|---|
   | `sr.title` | `Daily Review` | `Repaso del día` |
   | `sr.tagline` | `Four quick visits to skills you've already earned — so they stay earned.` | `Cuatro visitas rápidas a destrezas que ya dominaste — para que sigan dominadas.` |
   | `sr.progress` | `{done} of {total} reviewed today` | `{done} de {total} repasadas hoy` |
   | `sr.daysAgo` | `Last practiced {n} days ago` | `Última práctica hace {n} días` |
   | `sr.neverSince` | `Not practiced since you learned it` | `Sin practicar desde que la aprendiste` |
   | `sr.go` | `Practice this` | `Practicar esta` |
   | `sr.doneToday` | `Reviewed today` | `Repasada hoy` |
   | `sr.allDone` | `All four reviewed — old skills, still sharp. +10 XP` | `Las cuatro repasadas — destrezas antiguas, siempre a punto. +10 XP` |
   | `sr.empty` | `Nothing to review yet — earn a few skills first, then check back.` | `Aún no hay nada para repasar — domina algunas destrezas primero y vuelve después.` |
   | `sr.closeAria` | `Close Daily Review` | `Cerrar el Repaso del día` |

---

## Verification checklist (all before calling it done)

- `node --check` passes on every edited `.js`; `node tools/checks.mjs
  --skip-links` passes (i18n parity checks 1e/1f are the likely tripwires).
- Live Server + **Dev bypass**, then:
  - **Ladder:** toggle on → two Clean taps → slider, readout and click tempo
    all move to +5 together; a Miss drops 5 and resets the count; clamps at
    40/220; status line correct in EN and after switching to Español.
  - **Recorder:** record → stop → playback works; re-record and download
    work; close the popup mid-recording → recording continues, rail tile
    pulses; opening the Tuner mid-recording stops the recording
    (`stopAnyRec` path); 4 tiles fit the rail at ~400px width.
  - **Daily Review:** page lists 4 picks oldest-first (dev-bypass has mock
    progress — if too little, mark a few skills got-it first); Practice this
    jumps to the right panel; logging a rep marks the pick ✓ on return; picks
    don't reshuffle after one is done; empty state renders for a fresh user;
    language toggle re-renders the open page. XP award can't fire under dev
    bypass (`awardArcadeXp` returns early) — verify by code-reading the call
    path, and note it for Jonathan to see on his real account.
- Escape / click-away behavior unchanged for the three old tools.
- Journey pages (`tabs/luna.html` via Live Server): no console errors from
  the new fab-tools code (null-guard proof).
- Print preview: no new popups visible.
- Mobile ~400px: rail tools row, ladder buttons, review cards all usable.

## Wrap-up

- `CHANGELOG.md`: one dated entry at the top, `### Added`, three bullets
  (ladder / recorder / Daily Review), student's point of view, bolded first
  sentence per bullet — match existing style. Date it the day it ships.
- Commit on `worktree-practice-features` with a plain-English message.
  **Do not push** — Jonathan says "push to GitHub" when he's ready (full
  `node tools/checks.mjs` runs then, links included).
