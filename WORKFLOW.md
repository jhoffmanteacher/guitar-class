# WORKFLOW.md — Guitar Class

> Build history lives in `archive/`:
> **`WORKFLOW-2026-buildout.md`** (original site build-out),
> **`WORKFLOW-2026-july-fixits.md`** (July 2026 fix-it era), and
> **`WORKFLOW-2026-research-upgrades-era.md`** (the entire 2026-07-11
> mega-day: research-upgrade Sessions A–G, Semester 2 build, Listening
> Coach + games, mini-player, navigation pass, both review rounds, the
> full design plan, the 93-fix module clarity fleet, and the evening's
> Daily-5-popup + chord-check fix batches — its specs
> `RESEARCH_UPGRADES.md`, `MODULES_9_12.md`, and the fully-executed
> `DESIGN_UPGRADES.md` are archived alongside). Consult them for *why*;
> they drive no current work. All CLAUDE.md rules apply as always.
>
> Also individually archived: **`REVIEW-PLAN.md`** (the 2026-07-13 full-site
> review across CODE/CONTENT/DESIGN/IMPROVEMENTS — every item executed
> 2026-07-20 in `b76dd67` except the handful that need Jonathan live on the
> real site, tracked below), **`PLAN-COMPACT-CHECKLIST.md`** (the
> compact-checklist step redesign spec, executed 2026-07-20 in `e6925ec`),
> and **`PLAN-COMPACT-JOURNEY.md`** (the same compact redesign applied to the
> six Song Journey pages, executed 2026-07-20 in `dbd2f8f` + `c0b14fc`).

**Status legend:** [ ] not started · [~] in progress · [x] done

---

## Working conventions

- **Two Claude sessions at once → each in its own git worktree.** Both machines
  run parallel terminals sometimes. Two sessions in the SAME working tree share
  one git index, so one session's commit can sweep up the other's *uncommitted*
  work — this happened 2026-07-12 (the Change Up combos + Random-4 changes got
  bundled into the unrelated Wait Mode commit `6dcf68c`). If you start a second
  session while one is active, give it its own worktree before editing shared
  files: `git worktree add ../guitar-class-<tag> -b work-<tag>`, work there, then
  merge/push from there. On the **Mac** this is now auto-reminded — a SessionStart
  hook (`~/.claude/hooks/cc-session-lock.sh`, wired in `~/.claude/settings.json`)
  detects a live second session via per-session heartbeat locks and tells Claude
  to switch to a worktree. It's a *reminder, not a relocation*, and it's
  **Mac-only**; the **Windows** machine needs the rule followed by hand (or a
  PowerShell twin of the hook). Activate after editing the hook with `/hooks` or a
  restart.
- **Cloud Cowork sessions can't push (and must not git-write through the
  device bridge).** Established 2026-07-23: the cloud session's GitHub access
  is read-only for this repo, and running `git am`/`merge` against the Mac
  clone through the connected-folder bridge fails (the bridge can't unlink
  git's lock files — stale locks had to be swept to `_to_delete/`). The
  working pattern instead: build + verify in the cloud (full `checks.mjs`
  run pre-handoff so `CACHE_VERSION` ships pre-bumped) → commit → deliver
  `git format-patch` output **always paired with its own `APPLY-*.md`**
  (canonical step list lives in CLAUDE.md's cloud-sessions section: fast
  `--check --skip-links` verify on apply, push, then `--live` deploy
  confirmation) → Jonathan's local Claude Code applies (`git am`) and
  pushes → the cloud session then fetches origin and hard-resets its
  clone. Local sessions keep the normal "push to GitHub" workflow from
  CLAUDE.md unchanged.

- **Single-flow modules (new pattern, 2026-07-23).** A set whose `stations`
  has only `b` (no `c`) renders as a SINGLE-FLOW set: one custom-labeled
  learn tab straight into the checklist — no Station B/C framing. The tab
  card and rail mirror the set's own labels: `tabTitle`/`tabSub` (+`_es`)
  on `stations.b`, `checklistSub` (+`_es`) on the set; `panelFooter` routes
  station-b → checklist; `syncRailStations` hides the Station C rail button
  and swaps the labels. **Module 13 · String Changing** (`module-13.js`) is
  the first single-flow module — its 4 checklist skills ARE the graded
  in-class assessment rubric. Everything else (skills checklist, practice
  panels, search, Keep practicing, My progress, print) works unchanged.

---

## Open work

- [ ] **Check the list sweep for OVER-listing (Jonathan, eyes only —
      Modules 5 and 7 first).** The 2026-07-25 sweep converted ~157 cards;
      Module 5 changed most (26 cards, several in a row in Station C) and
      Module 7 next (18, mostly barre-chord finger placements). The failure
      mode to look for is the opposite of the one that started this: a card
      that reads like assembly instructions instead of a coach talking, or a
      two-item list whose second item is a technique reminder ("keep the
      thumb behind the neck") rather than a step. Those should go back to
      prose — name the card and it's a quick revert. Deliberately left as
      prose already: single-action cards, "Watch: <a>video</a>" lines, and
      wrap-up reflection questions.

- [ ] **Check the Coach gate with a real guitar on a school Chromebook
      (Jonathan).** It is verified only against headless runs. Three things,
      in priority order:
      1. **Does "Mark it anyway" read as a legitimate choice or as
         cheating?** This matters more than the threshold. The gate is the
         first thing on the site that tells a student no — everything else
         is self-directed. If the override reads as cheating, the student
         with a dead mic stops marking skills at all and the progress data
         gets WORSE, not better. Wording lives in `gate.*` in i18n.js.
      2. **Is 💪 Good the right bar?** `COACH_GATE_MIN_LEVEL = 2` in app.js
         (1 Needs work · 2 Good · 3 Great) — a one-constant change, no other
         edit needed. If you bump into the gate yourself while playing it
         cleanly, it is set too high. Try it with 29 other guitars audible,
         not in a quiet room.
      3. **Does "Practice it now" land where you'd expect?** It should open
         that skill's practice panel and pulse its 🎤 button. Gated skills to
         try: `m2w2-s1`, or most of Module 5 Set 2. A quiz or fretboard-game
         skill should still mark instantly, with no card at all.

- [ ] **Listening Coach check-off gate — teacher view of overrides
      (2026-07-25).** The gate records `games.coachSkill[skillId] =
      {level, last, at, override?, overrideAt?}`; `teacher.js` does not
      surface it yet. Worth adding a marker in the skills grid so a
      Coach-backed "I've got it!" reads differently from a self-declared
      one — an override is a signal about the mic or the room, not just
      about the student.

- [ ] **Note Runner — live guitar check (Jonathan, on a school Chromebook if
      possible).** The new adaptive arcade game shipped verified only against
      headless fake-mic runs; nobody has played it with a real guitar yet.
      What to check, in rough order:
      1. **Mic timing offset** — play a few melody rounds dead on the beat;
         if the results keep saying "late," raise the home-screen slider
         until it stops and report the number (we'll bake it in as the
         default instead of 70 ms).
      2. **Stage movement feel** — do the 90%-up / 65%-down thresholds move
         you at a sensible pace? (`NR_UP_PCT` / `NR_DOWN_PCT` in coach.js.)
      3. **Power-chord stages** — strums are louder and messier than single
         notes; if grading feels wrong there specifically, that's the
         chord-tone vote, not the offset.
      4. **Weak-spot re-dealing** — deliberately flub one note for a round
         or two, then confirm it starts showing up more and the results
         screen names it ("Coming back around until they're clean: …").
      5. **Hit animations** — sparks/×2 pops read as fun, not distracting,
         at Chromebook size.
      Report tuning numbers to Claude; the knobs are one-line constants.

---

## Recently shipped (post-archive)

- [x] **Report-an-issue in-site form + always-top-scroll fix** — pushed
      `a86ec71` (2026-07-24). Footer's "Report a problem" now opens an
      in-site form (`openIssueModal`/`submitIssueReport`, `app.js`) instead
      of a mailto link — writes to a new Firestore `issueReports` collection
      with the student's email/name, current module+set, browser info, and
      message auto-attached; falls back to the old mailto if Firebase/
      Firestore isn't reachable or the student is the dev-bypass user (same
      convention as progress saves). New security rule documented in
      `index.html`'s setup comment (also backfilled the previously-
      undocumented `config` collection rule there); Jonathan confirmed +
      published the matching rule in the Firebase console the same day.
      Browser-verified (dev bypass + manual console calls): modal renders,
      empty-message validation, and the graceful failure path (dev-bypass
      writes are rejected by Firestore rules) all work as expected — the
      live end-to-end save (real signed-in student) hasn't been checked yet.
      Separately: opening or returning to a Set now **always scrolls to the
      very top**, replacing the scroll-memory feature from 2026-07-12 (which
      Jonathan decided he didn't want after all) — `activateSet` no longer
      restores `window.scrollY`, and `history.scrollRestoration='manual'`
      (matching `tabs/journey.js`) stops the browser's own back/forward
      scroll memory from undoing it.
- [x] **Real-guitar mic tests all passed clean (2026-07-24)** — closes out
      the last two open items:
      - **Riff Runner Wait Mode** (untimed, mic-graded note-by-note
        play-along, metronome/count-in removed) — tested live on Seven
        Nation Army; no-clock flow feels natural end to end.
      - **Mic features retest**: melody mode's new `coachNowHtml`
        current/next preview (Module 2 · Set 1 · Station B, low E notes)
        fixed the beat-late timing bug and lands notes on time now; one
        Note Hunt round and one full Change Up round also passed clean.
      Nothing further to fix — this was the last item tracked under Open
      work, so that section is now empty.
- [x] **Module 13 · String Changing — new single-flow module + graded
      assessment** — built in the cloud session, applied+pushed locally via
      patch (`539a939`, 2026-07-23). New `module-13.js`: 7-section process
      (tools/safety → 4 verified videos → remove → seat at bridge → wind →
      tune/stretch → assessment briefing), covering BOTH nylon **ball-end**
      (no tie knot — the string type being purchased) and steel-string; 3
      hand-drawn inline-SVG diagrams with EN/ES label variants; 4 checklist
      skills = the in-class assessment rubric (safe removal · bridge
      seating · post winding · tune-stretch-hold), each with `gotItWhen` +
      an mc practice drill; hand-written Spanish throughout. Videos
      oEmbed-verified: Lauren Bateman (steel), Takamine (nylon), LEARNING-
      CHORDS (ball-end nylon), guitarraviva (Spanish, luthier). App support:
      buildSet single-flow path, panelFooter reroute, rail sync (see
      "Working conventions" above); `MODULE_MANIFEST` num 13 (skillCount 4);
      `module-13.js` added to `sw.js` ASSETS. This is the last
      FUTURE-CHANGES item — closed in the same patch.
- [x] **Keep practicing + My progress → full-screen pages** — pushed
      `dc2d6ef` (2026-07-23; built in the cloud session, applied+pushed
      locally via patch). Games-screen pattern in the site's normal look:
      `#keep-practicing` / `#my-progress` URL hashes, browser Back exits,
      "Back to practice" button, proper dialog focus handling. Picking a
      skill from Keep practicing still jumps to its lesson (closing the page
      via the hash); bookmarked hashes reopen the right page after sign-in;
      language switches re-render open pages in place with no history churn.
- [x] **Songs hub: two-tier layout — Core card + Choice menu grouped by
      difficulty** — pushed `5043121` (2026-07-23; built in the cloud
      session, applied+pushed locally via patch, excluding a stale
      `translations-review.md` hunk since that file had just been retired).
      Core six pinned in their own card on top; Choice menu splits into
      collapsible difficulty groups keyed to first-appearance module (First
      riffs & single notes M1–4, 21 songs · Chord & strumming songs M5–8,
      21 songs · Advanced M9–12, auto-hidden while empty); first group open
      by default; headers show counts; module Focus songs keep their tag
      inside the groups; student-request row renders last, reworded to "any
      song that means something to **you**." 7 new `hub.*` strings EN+ES.
- [x] **Practice-step polish trio: disclosure pills, scroll-under-header,
      safe-handling fold removal** — pushed `5cbb316` + `ee1a5f0` +
      `b95f1f5` (2026-07-23; built in the cloud session, applied+pushed
      locally via patch pairs). Hint/Stuck?/Level up pills now sit in a
      fixed row with the open panel full-width below (tab-style, one at a
      time — the old `<details class="step-fold">` markup is gone);
      programmatic scrolls land below the sticky header
      (`scroll-margin-top` + a `toggleStepOpen` rAF nudge); Module 1's Safe
      handling step dropped its redundant folds down to just the
      instruction.

- [x] **Live-site device checks, no mic needed — closed without on-device
      confirmation** (bundled from REVIEW-PLAN K-2/K-5/D-7 and the
      compact-checklist work, 2026-07-20; closed 2026-07-23) — covered the
      tuner's post-YIN-optimization string lock, tuner string-selector touch
      targets, compact checklist + Song Journey pages at phone width
      (~360–400px) and in print preview (⌘P). All the underlying code
      shipped; **Jonathan decided phone-specific polish isn't a priority for
      him**, so this is marked done as a deliberate scope call, not because
      it was verified working on a real device. If phone usability becomes a
      concern later, these are the specific checks to revisit.

- [x] **Custom backing tracks for all six journey-page play-alongs — Jonathan
      made them himself** (Jonathan, 2026-07-20 → all six DONE 2026-07-22;
      this entry was stale until corrected 2026-07-23, see below) — every
      Song Journey page has a "🎵 Play along" button; all six now play
      Jonathan's own local mixes (`audio/`) instead of generic YouTube jam
      loops, each a clean rhythm-down mix + a metronome variant (`<audio>`
      element, "🎵 Metronome" toggle preserving playback position), every
      track exported at A=440. **"the cure"** (Am, 144 BPM) and **Luna** (Am,
      128 BPM) done first (2026-07-22), followed same day by **Watchtower**
      (Neil Young cover, Am, 115 BPM — display name stays "Dylan/Hendrix" per
      the artist-stays-out-of-display-metadata rule), **Sweet Child O' Mine**
      (G, 125 BPM — standard tuning on this site, so it sounds a half-step
      above the famous down-tuned recording, expected/documented), **Let It
      Be** (C, 71 BPM), and **Seven Nation Army** (Em, 123 BPM). Bonus 🐢
      **Slow tier** added same day for four of the six ("the cure" 120 BPM,
      Watchtower 90 BPM, Sweet Child 100 BPM, Seven Nation Army 100 BPM) — an
      independent tempo toggle alongside the Metronome toggle
      (`data-audio-slow`/`data-bpm-slow` in `tabs/*.html`, generic handling in
      `tabs/journey.js`, which rescales `currentTime` by the tempo ratio on
      toggle so playback position holds through a tempo change). Naming
      convention: `<artist-slug>-<song-slug>-backing-<key>-<bpm>bpm-<tuning>
      hz-<mix>.mp3` (see CLAUDE.md's "Backing-track naming & tuning"
      section). **Correction 2026-07-23:** this item had sat marked "Open"
      listing Seven Nation Army/Sweet Child/Let It Be as still pending
      Jonathan's files, months after all three actually shipped
      (`c2b9e94`/`2958547`/`73c7afd`, 2026-07-22) — caught when Jonathan
      pointed out the files were already in `audio/`. Lesson: an Open-work
      item needs its ground truth (git log / working tree) spot-checked
      before assuming a stale-looking status is still accurate.

- [x] **Module 12: confirmed the requinto video fits, deleted the leftover
      note** (REVIEW-PLAN C-7, 2026-07-20; resolved 2026-07-23) —
      `module-12.js`'s La Derrota (Vicente Fernández) requinto lesson had an
      HTML comment flagging it for a fit check against the sierreño/corridos-
      tumbados requinto skill it teaches. Re-verified the video
      (`cRJb_f4-M5g`) is still live via oEmbed, and confirmed via WebSearch
      that it's specifically a "part 1: requinto line" lesson (the same
      instructor, Jorge Aguilera, splits his tutorials into a requinto part 1
      / chords part 2 for other Vicente Fernández songs too, e.g. "Para
      Siempre") — a good, purpose-built fit for the lesson's stated goal
      (watch the picking hand carry the melody). Deleted the review-flag
      comment; no video swap needed.

- [x] **i18n phase 2 — hand-written Spanish for module/lesson content, tabs/
      pages, and games** (started 2026-07-22) — phase 1 (already done, see
      CLAUDE.md's "i18n — hand-written Spanish for the app shell") only
      covered the shell (header, nav, tools, checklist). This phase extends
      real Spanish to the twelve module files, the Song Journey pages, and
      `coach.js`'s games, then removes Google Translate entirely once
      everything's covered.
      **Session 1 (2026-07-22): architecture + Module 1, done & browser-verified.**
      Schema: parallel `<field>_es` suffix fields on every translatable field
      (`text_es`, `hint_es`, `meta_es`, …) — renderer falls back to English
      when absent, so modules translate incrementally with no code changes
      needed per module. `app.js` gained a `tf(obj, field)` helper used at
      ~25 render call sites (steps, hints, skills, songs, assessment, module
      review, the 10-minute routine card, TAB captions, playSeq labels) plus
      ~40 new shell strings in `i18n.js` for the chrome *around* that content
      (fold labels, response labels, module-review copy) that had never been
      wired to `t()` before. Module-content panels are built once and cached
      (`ensureModuleRendered`), so a new `rebuildModuleContentPanels()` runs
      on `gc-langchange` to re-render already-open panels in the new
      language (preserving the active station/songs/checklist tab).
      `tools/checks.mjs` gained an i18n-completeness pass (`1b.`): any module
      flagged `i18nComplete` in `MODULE_MANIFEST` must have a real `_es` twin
      on every required field, enforced on every push. Once a module is
      flagged complete, its Set + Module Review panels get `translate="no"`
      so Google Translate can't touch (or re-translate) the hand-written
      Spanish — modules still in progress keep Google Translate as their
      fallback, same as before this phase. **Module 1 (both sets + its
      Module Review) is fully translated and flagged `i18nComplete`** —
      glossary extended with guitar-anatomy terms (clavijero, cejuela,
      selleta, puente, mano de trastear/de pulsar) and Song-Journey terms
      (Recorrido de la canción, capa). Browser-verified end to end via a
      local static server + dev bypass: every step/hint/response/choice,
      the riff TAB block, the songs list, the skills checklist, and the full
      Module Review (routine card, reflection, assessment, "why this
      matters") all render in Spanish with no English leaking through.
      Known gaps intentionally deferred (documented in
      `translations-review.md`'s "Known gaps" section): locked-set gate
      toasts, the Games/Songs Hub/Keep-practicing/My-progress panel
      *contents*, the Daily 5 modal, and the recording widget's two labels —
      none of these are module-N.js content, so they're unaffected by the
      `i18nComplete` gate and stay Google-Translate-covered.
      **Session 2 (2026-07-22): Modules 2 & 3, done & browser-verified —
      built with a multi-agent workflow (ultracode).** Two independent
      translator agents hand-translated `module-2.js` and `module-3.js` in
      parallel (each read Module 1 first as the reference pattern), each
      immediately followed by its own independent adversarial Spanish-quality
      reviewer (6 issues found+fixed in Module 2, 1 in Module 3 — English
      leakage, register, glossary drift). Both modules fully verified via
      `node --check`, a scripted structural completeness sweep, and
      `tools/checks.mjs`, then flagged `i18nComplete`. Glossary extended
      (post-hoc reconciled against ACTUAL usage in the files, not the
      agents' self-reported terms, which were sometimes wrong — e.g. Module
      3's agent claimed it used "fundamental" for "root" throughout but the
      file actually uses "raíz" consistently; the memory now records what's
      really in the files): sight-read → leer a primera vista, root → raíz,
      home note → nota base, vamp/chug/boom-chick kept as loanwords, beat →
      tiempo, bar/measure → compás. One schema gap found and fixed: neither
      translator's brief mentioned `MODULE_SONGS[N]` (a module-level song
      list separate from a Set's own `songs:` array, used by modules 2–12) —
      added `meta_es` for both modules' entries by hand and added a
      `tools/checks.mjs` requirement so future modules can't skip it.
      `translations-review.md` backfilled with full EN→ES tables for
      Modules 1–3 (Module 1's had been skipped in session 1).

      **Mid-session incident:** a second, concurrent Claude Code session was
      running directly in this same working tree (not its own worktree) and
      a `git checkout`/`restore` it ran silently discarded ALL of this
      session's then-uncommitted work in `config-main.js`, `module-2.js`,
      `tools/checks.mjs`, and `i18n.js` — Module 2's translation, fully
      verified, was gone with no recovery path. Module 3's translation
      (still intact) was immediately committed alone to protect it before
      continuing. The concurrent session then moved to its own worktree;
      Module 2 turned out to still be recoverable once the working tree
      settled, so nothing had to be redone — but treat this as a live
      example of why the worktree rule above exists, not just a hypothetical.
      **Session 3 (2026-07-22): Modules 4, 5 & 6, done & browser-verified —
      3-module multi-agent workflow (ultracode), translate→verify→backfill
      pipelined per module.** Same pattern as session 2, scaled to three
      modules and with both session-2 lessons baked into the brief up front
      this time: translators were told explicitly about `MODULE_SONGS[N]`
      (missed for modules 2/3 originally) and told to grep their own file
      before self-reporting glossary terms (a session-2 agent had
      misreported "fundamental" when the file actually used "raíz"). Result:
      all three modules included their `MODULE_SONGS[N]` translation
      unprompted-a-second-time, and verify agents cross-checked reported
      terms against actual file content directly (one still had a minor
      count mismatch — reported "cejilla" 18 times, actually 17 — but the
      *term itself* was consistent, just a counting slip, not a translation
      bug). New glossary terms, this time reconciled against real usage
      before being recorded: root → raíz (module 4 confirmed this again),
      barre → cejilla, resolve/resolution → resolver/resolución, backbeat/
      offbeat → contratiempo, chop (reggae upstroke) → picoteo/picar,
      groove kept as a loanword (matching riff/vamp/chug). Module 6's own
      translator agent set its `config-main.js` flag itself (mirroring
      module 2's agent in session 2); Modules 4 and 5's flags were set by
      the coordinator after their independent verify passes.
      **Also found and fixed a real production bug while browser-testing
      Module 4** (already live for Modules 2–3 too, since it's shared
      `app.js` code, not per-module data): the "⚡ Tune and warm up first…"
      reminder shown on Station C for every module except Module 1 was
      hardcoded English, missed in session 1 because Module 1 never
      triggers that code path. Fixed by wiring it through `t()` like
      everything else — the fix applies retroactively to every module, no
      module-file changes needed.
      `translations-review.md`'s shell-glossary table had also drifted out
      of sync with `i18n.js` (sessions 2's new terms were added to the code
      comment but never mirrored to the doc table) — caught and backfilled
      both sessions' worth of terms in the same pass.
      **Session 4 (2026-07-22): Modules 7 & 8, done & browser-verified —
      same 2-module translate→verify→backfill pipeline as session 3.**
      Module 7 (TAB Notation and Barre Chords) uses "barre" 120+ times —
      100% landed as "cejilla" per a scripted grep-only-the-_es-fields
      check the translator ran itself. New terms: double-stop → doble
      nota/dobles notas, sub-barre (ring-finger mini-barre inside a full
      barre shape) → sub-cejilla. Module 8 (Finger Picking) introduced a
      full new vocabulary cluster: fingerpicking/fingerstyle kept as
      loanwords (matching riff/vamp/chug/groove), Travis picking kept as a
      named technique, pinch → pellizco/pellizcar, alternating bass → bajo
      alternante, rest stroke/free stroke → apoyando (toque de apoyo) /
      tirando (toque libre) — the real classical-guitar Spanish terms for
      those techniques, not a coinage. Both verify passes were solid (3
      issues found+fixed in Module 7, 0 in Module 8) but the coordinator's
      own independent sweep still caught one real miss the module-8 verify
      pass didn't: `forward_es` had "power chords" left untranslated
      instead of the established "acordes de potencia" — module 7's verify
      agent happened to notice it in passing (reading module-8.js for
      context) and flagged it for the coordinator, since fixing another
      module's file was outside its own scope. Lesson: even a same-module
      verify pass can miss something a cross-module read catches — worth
      an explicit coordinator-level English-leak sweep across all touched
      files at the end of every session, not just trusting each module's
      own verify pass in isolation.
      **Session 5 (2026-07-22): Modules 9–12, done & browser-verified —
      ALL TWELVE MODULES NOW COMPLETE.** First 4-module batch (previous
      sessions did 2–3 at a time) via the same translate→verify→backfill
      pipeline; concurrency handled it fine (12 agents total, no
      collisions). These four modules lean much more into music theory
      than 1–8, so most of the session's new vocabulary is theory terms:
      whole/half step → tono/semitono, transpose → transponer (a
      translator initially coined "transportar," caught its own drift via
      the "grep modules 1-8 first" instruction, and self-corrected to the
      pre-existing module-4 term before finalizing — the instruction
      worked as intended), relative/parallel minor, key → tonalidad,
      triad → tríada, slash chord → acorde con bajo alterno, home chord →
      acorde base (paired with the existing "home note" → "nota base"),
      E-shape/A-shape barre → forma de E / forma de A, comp/comping →
      acompañar, chorus (blues) → ronda, chord family → familia de
      acordes, diatonic → diatónico/a, waltz → vals, downbeat → tiempo
      fuerte, fill → relleno, roll → floreo, plus Module 9's own
      fretboard-mapping terms (octave shape → forma de octava, the
      B-string tuning offset → el desfase de la cuerda B). Also explicitly
      added "capo (the physical device) → capo, kept — distinct from
      cejilla" to the glossary, since Module 11 uses both concepts close
      together and a translator could plausibly conflate them (one did,
      briefly, in session 4's Module 8 — see that session's notes — this
      makes the distinction explicit going forward).
      Coordinator's own cross-file sweep (the session-4 lesson, now a
      standing step) specifically re-checked for "power chords"/"barre"
      slipping through untranslated in modules 9-12's forward/summary
      text — found zero leaks this time, confirming the tightened
      translator+verifier briefs (explicit instruction to grep for
      established terms, not just new ones) closed that gap.
      **Session 6 (2026-07-23, cloud Cowork session): shell "Known gaps"
      CLEARED + practice-drill Spanish for 83 new drills.** The deferred
      shell list from session 1 is done — locked-set gate toasts + locked
      pill tooltips, Songs Hub / Keep practicing / My progress panel
      contents, the Daily 5 modal, the report-a-problem subject, the
      recording widget (incl. both alerts), and the checklist cells'
      aria-labels: 46 new `I18N` keys, en+es, wired with language-switch
      rebuild handling; Daily 5 and Keep practicing now also read module
      content through `tf()` (they had been bypassing existing `_es`
      twins). Separately, the Practice System rounds (see Recently
      shipped) added hand-written `_es` for all 83 new practice drills
      across modules 1–12 plus the new practice-panel UI strings —
      review tables backfilled in `translations-review.md`.
      **DONE 2026-07-23 (same-day session): coach.js games arcade +
      Listening Coach converted to t() (407 new keys), the six tabs/
      Song Journey pages hand-translated via data-es, and Google
      Translate REMOVED site-wide** (the `WINTER_CHALLENGE` Challenge
      Day feature was removed entirely instead of translating it).
      **CLOSED 2026-07-23:** the AI-sweep proofread review (session 6's
      review policy) is finished with all findings fixed, closing out phase
      2 end to end. `translations-review.md` — the working EN→ES review
      sheet used throughout this phase — was deleted (`956743e`) now that
      the review it supported is done; the review policy itself moved into
      CLAUDE.md's i18n section as the standing rule for future Spanish
      batches.

- [x] **Practice everywhere (round 2): Modules 6–12 drills + six-string
      Find-the-Note + shell i18n finished + list-formatted directions** —
      pushed `9d742ac` (2026-07-23; built in the cloud Cowork session as
      `202f4dd`, applied+pushed locally via patch, hash changed with
      `git am`). 54 new drills
      (all 230 course skills now practiceable; M6–12 mix 77 mc / 31
      playSeq / 17 pr / 5 chord / 5 fretboard) + 9 conversions (M7/M11
      barres → 'chord', M9 note-naming → per-string 'fretboard');
      Find-the-Note extended to D/G/B/high-E + a six-row 'all' mode;
      i18n session 6 (see Open work); practice prompt/explain/chord-label
      now render trusted HTML; 17 step texts + 20 pr prompts reformatted
      as `<ol>/<ul>` per Jonathan's new list rule (documented in
      CLAUDE.md); step-preview tag stripping made word-safe;
      `.step ul` solid discs. One content removal to know about:
      m9w2-s2's old "why do the two E strings share note names?" mc was
      replaced by its fretboard game (flagged to Jonathan).
- [x] **Practice System 2.0 (round 1): every Module 1–5 skill practiceable,
      with rep tracking and spaced review** — pushed `1deed88`
      (2026-07-23; built in the cloud Cowork session, applied+pushed
      locally via patch). Engine: `practiceLog` persistence (Firestore
      save category + localStorage write-through), rep strip with a
      3-reps/day goal on every practice panel, "Keep it sharp"
      spaced-review card at the top of each set's checklist, and three
      new practice types — `fretboard` (Find-the-Note game, lowE/A/both),
      `chord` (diagram + Listening Coach + log-rep), `pr` (structured
      BPM/count ladder on the responses PR-history path, no regex
      heuristic). Content: 29 drills added + 2 conversions so all 77
      M1–5 skills have `practice:`, hand-written `_es` throughout.
      Verified via checks.mjs + Playwright integration on real module
      data. `practiceLog` is teacher-dashboard-ready but not surfaced in
      teacher.js yet (future idea).

- [x] **Tuner / Timer / Metronome on the Song Journey pages** — pushed
      `8eb26f6` + `8f33ae1` + `2acd13f` (2026-07-20). The same floating
      tool buttons students have in the main app now sit on all six journey
      pages, so they can tune up, set a countdown, or click along without
      leaving the song. Implementation: metronome/timer/popup logic extracted
      from `app.js` into a shared, dependency-free `fab-tools.js`; its styles
      ported to `tabs/fab-tools.css` (+ needed color tokens in
      `tabs/journey-theme.css`); FAB markup + `tuner.js` + `fab-tools.js`
      wired into each `tabs/*.html`. Verified in-browser on both `index.html`
      (unchanged behavior post-extraction) and `tabs/luna.html` (tuner mic,
      metronome tick, timer countdown all working).
- [x] **Song Journey pages: compact one-layer-at-a-time accordion + tip
      folds + play-along tracks** — pushed `dbd2f8f` + `c0b14fc`
      (2026-07-20), executing `archive/PLAN-COMPACT-JOURNEY.md`. Each page's
      5–6 fully-expanded layers now collapse to scannable header rows
      (badge + title + module chip + rating chip + chevron), one open at a
      time, with an "N of M layers rated" pill; `#layer-N` deep links still
      open + scroll to their layer. Inside an open layer the Stuck?/Level up
      branches sit behind `<details>` folds, and every page gained a
      lazy-loading "Play along" button (SNA / Sweet Child / Let It Be got
      newly-found oEmbed-verified vocals-kept/guitar-removed tracks; the
      other three keep jam loops pending moises.ai — see Open work). The
      previously-verbatim-duplicated inline script is extracted to
      `tabs/journey.js`; print styles added; `checks.mjs`/`sw.js` now
      fingerprint `tabs/*.css`/`*.js` too. Musical facts untouched (settled
      list in CLAUDE.md).
- [x] **Sidebar redesign + header search box** — pushed `f4d952d` →
      `92e5da6` (2026-07-20). The left rail got a cool neutral-gray
      background with distinct, color-matched Station B / Station C /
      checklist row backgrounds (not just badges), and Find moved out of the
      Explore nav list into a compact search-box-styled button in the top
      purple bar (visible once signed in).
- [x] **Station checklists: compact, one-tap-at-a-time steps** ("Concept B") —
      pushed `e6925ec`, plus same-day follow-ups `66cbc7d` (flattened the
      sections to match the approved mockup — the first push missed that) and
      `40a03ba` (row/section dividers, compact song blurb, dropped the
      Keep-going card) (2026-07-20). Station B/C steps now collapse to a
      single scannable row (status circle + short label + chevron); tapping
      opens the full step (video, chords, TAB, response), one open per
      section, with the first not-done step open by default. Mark done
      collapses the row, shows ✓, and auto-opens the next not-done step; a
      live "N of M steps done" pill sits next to each station's title.
      Collapse/expand is CSS-class-only (never a re-render), so in-progress
      responses survive. Short labels are derived from step text, with
      special handling for `Challenge — X:` / `Challenge N — X:` and a kept
      `Watch:` prefix. Deep links (search, "Show me where") auto-expand their
      target step. Browser-verified via Dev bypass: typed-text survives
      collapse/expand, one-open-per-section both directions, mark-done
      auto-advance + pill update, chord diagrams render, bare (Station C) and
      sectioned (Station B) layouts both correct. **Not yet verified:** phone
      width (~400px) and print preview — tracked above under Open work. Spec
      archived at `archive/PLAN-COMPACT-CHECKLIST.md`.
- [x] **REVIEW-PLAN full-site review, P1/P2 batch** — pushed `b76dd67`
      (2026-07-20). Implemented essentially every item across the review's
      four dimensions via a multi-agent workflow: auto-retry progress saves,
      real `<h2>/<h3>` headings in generated content, welcome-dialog focus
      trap, `data-sid` skill-row selection (replacing regex-parsed `onclick`
      matching), the `#games` deep link, a site-wide practice streak, "keep
      practicing" + "my progress" panels, persisted Listening Coach results,
      a teacher trouble-spots view + BPM personal-record history, metronome
      accent/count-in, an offline banner, chord-set song search, tuner
      YIN-scan cost cut ~5× + per-frame allocation removed, tuner/pill touch
      targets, a Bm clean-fret drill, an oEmbed-verified video swap, journey
      pages brought onto the app's plum/dark theme with fixed contrast, and a
      `checks.mjs` Firestore-SDK-version assertion across all 8 copies — then
      reviewed the diff across three dimensions and fixed the 4 confirmed
      bugs found (a song-search dedup bug hiding 3 core songs from chord
      search, a metronome keyboard-nav gap, invalid heading markup, missing
      focus movement on the two new panels). Full item-by-item detail
      archived at `archive/REVIEW-PLAN.md`; the handful of items needing
      Jonathan live on a real device are tracked above under Open work.
- [x] **Gate the Sets in each module — do them in order** (Jonathan, 2026-07-12) —
      DONE & browser-verified. Every Set now locks until the Set before it is
      finished (all its skills marked "I've got it!" — same bar as Module
      Review). Implementation in `app.js`: `isSetComplete(w)` / `isSetLocked(w)`
      (sequential, first set always open); `renderPills` uses them and gives a
      locked pill a 🔒 + a tap-hint `gateToast(...)` naming the set to finish
      first; `activateSet` has a backstop that refuses a locked set; `goToSet`
      /search deep-links (`gatedJumpGuard`) land on the module's *frontier* set
      with a toast instead of revealing a hidden locked panel; `onModuleChange`
      picks the frontier (first unlocked+unfinished) as its default target and
      never lands on a locked set. CSS: `.wpill.locked:not(.review-pill)::before`
      lock icon + `#gate-toast`. Unlocks live because `toggleSkill` re-renders
      pills. Verified: M4 Set 2/3 locked, tap-toast, live-unlock of Set 2 on
      completing Set 1, Set 3 staying locked.
- [x] **Fix where each page opens (scroll position)** (Jonathan, 2026-07-12) —
      DONE & browser-verified. `activateSet` is now the single authority on set
      scroll: it saves `window.scrollY` for the set you're leaving into an
      in-memory `setScrollPos` map and restores it when you return, or scrolls to
      top for a set never opened this session. Removed the competing
      `window.scrollTo({top:0})` calls in `goToSet`, `songHubGoModule`, and
      `searchGoSet` that were forcing top and causing the "sometimes scrolled,
      sometimes not" inconsistency. Verified: first open → top(0); leave at 500 →
      return restores 500; second set restores its own 300.
- [x] **Harden the gate + scroll** (Jonathan, 2026-07-12, worktree `worktree-jh-session`) —
      Two follow-ups to the two items above, browser-verified. (1) **Previewer
      bypass:** new `isGatePreviewer()` (dev-bypass user via `isDevBypassUser()`,
      or a login as `TEACHER_EMAIL`) makes `isSetLocked` and `isModuleReviewLocked`
      return unlocked, so a teacher/dev previewing the *student* app sees every
      Set + Module Review without grinding skills; the static `locked/comingSoon`
      flag still hides unbuilt content for everyone. Normal students are
      unaffected (verified: student ctx still gates m4 Set 2/3 + review).
      (2) **Scroll survives reload:** `setScrollPos` now hydrates from / persists
      to `localStorage['gc-scroll']` (same `gc-` convention as gc-lastSet), saved
      on set-leave and on `pagehide`/`visibilitychange:hidden`; `window.scrollTo`
      clamps so a stale offset can't overscroll. Verified: reload → m4w2 restored
      to 250, a never-opened set still opens at top. Pushed `41efa61`.
- [x] **Fret Zap** — games arcade, `fz*` in `coach.js` — pushed `c64ef08`
      (2026-07-11), browser-verified against the live code 2026-07-12. A
      no-mic, no-guitar fretboard note-naming sprint: a blank dot lights on
      a fretboard diagram (reuses app.js `localNoteSvg`) and the student
      taps the note's name from four choices before a 60-second clock runs
      out. Mirrors the Chord Blitz scaffolding — streak multiplier,
      wrong-answer reveal + requeue, session best (`fzBest:<deck>`) and
      cross-session best via `games.fz`. Four difficulty decks (low-string
      naturals → all strings 0–5 → naturals to 12 → everything with sharps);
      keys 1–4 answer on a laptop; reward tone via `playNote`. Built with a
      build → adversarial-review (4 dimensions) → verify → fix workflow (4
      findings fixed: a missing `#fz-body` width rule, two changelog idioms,
      an unglossed "naturals"). Browser test confirmed note-math, scoring,
      wrong-answer requeue, keyboard, timer, done screen, and exit cleanup
      (no leaked timer/listener) with zero console errors. **No real-guitar
      retest needed** (it never touches the mic).
