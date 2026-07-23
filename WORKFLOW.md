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

---

## Open work

- [~] **i18n phase 2 — hand-written Spanish for module/lesson content, tabs/
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
- [ ] **Custom backing tracks for the six journey-page play-alongs — Jonathan
      is making them himself** (Jonathan, 2026-07-20; plan to do all six
      confirmed 2026-07-22) — every Song Journey page has a "🎵 Play along"
      button. **"the cure" is DONE and live-verified** (2026-07-22): swapped to
      Jonathan's own **A-minor, no-capo** tracks — a clean rhythm-down mix
      (`audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-rhythm-down.mp3`)
      plus a metronome variant with a click baked in
      (`...-rhythm-down-metronome.mp3`, re-balanced once already for a too-loud
      click), both local files played through a looping `<audio>` element with
      a "🎵 Metronome" toggle on the Journey page to swap between them
      mid-playback (position + play state preserved). At the same time every
      capo instruction for the song was stripped across the modules + its
      Journey page, and an asterisk note under the play-along button explains
      that capoing the 1st fret matches the original recording's pitch.
      **"Luna" is DONE (2026-07-22):** swapped to Jonathan's own **A-minor,
      128 BPM** rhythm-down mix
      (`audio/peso-pluma-junior-h-luna-backing-Am-128bpm-440hz-rhythm-down.mp3`)
      plus a metronome variant (`...-rhythm-down-metronome.mp3`), replacing the
      generic Dm YouTube loop on the Journey page — same local-`<audio>` +
      Metronome-toggle pattern as "the cure." Song is already capo-free, so no
      capo cleanup was needed. **Watchtower is DONE (2026-07-22):** swapped to
      Jonathan's own **Neil Young cover, A-minor, 115 BPM** rhythm-down mix
      (`audio/neil-young-all-along-the-watchtower-backing-Am-115bpm-440hz-rhythm-down.mp3`)
      plus a metronome variant (`...-rhythm-down-metronome.mp3`), replacing the
      generic Am YouTube jam loop (`Vq8cApzOdy8`) on the Journey page — same
      local-`<audio>` + Metronome-toggle pattern, wired in both
      `tabs/all-along-the-watchtower.html` and `module-4.js`'s `MODULE_SONGS`
      entry (the display name stays "Dylan / Hendrix" per the artist-stays-out-
      of-display-metadata rule — only the filename carries the Neil Young
      slug). Song is already capo-free and already in the site's teaching key
      (Am), so no key/capo cleanup was needed. Browser-verified: play-along
      button builds the `<audio>` element with a resolvable source, Metronome
      toggle correctly swaps to the `-metronome` variant. **Naming convention
      going forward:**
      `<artist-slug>-<song-slug>-backing-<key>-<bpm>bpm-<tuning>hz-<mix>.mp3` —
      see the "Backing-track naming & tuning" section in `CLAUDE.md` for the
      full rule (every track ships at A=440, exported directly from Moises).
      **Plan for the other four: same treatment, one song at a time, as
      Jonathan supplies the mp3s** — each gets the same recipe "the cure" and
      "Luna" got:
      - Two files per song at minimum: a clean rhythm-down mix and a
        rhythm-down-metronome variant, **both exported at A=440** (never trust
        the source master's tuning — see "Backing-track naming & tuning" in
        `CLAUDE.md`), named
        `<artist-slug>-<song-slug>-backing-<key>-<bpm>bpm-<tuning>hz-<mix>.mp3`.
      - Wire exactly like `tabs/the-cure.html` / `module-4.js`: `data-audio` +
        `data-audio-metronome` on `#playalong-frame`, `backingUrl` pointing at
        the clean mix. The metronome-toggle code in `tabs/journey.js` is
        already generic — it activates automatically whenever a page's frame
        has `data-audio-metronome`, no per-song JS changes needed.
      - `tools/checks.mjs` fingerprints everything in `audio/` (fixed
        2026-07-22), so `CACHE_VERSION` bumps automatically for these too —
        no manual cache-busting step per song.
      - Until Jonathan supplies a song's files, it keeps its existing YouTube
        loop:
        - Seven Nation Army — `sbN1wfDb4sw`
        - Sweet Child O' Mine — `kkZI8Lma8UA`
        - Let It Be — `xHhfKZAH_EU`
      Give Claude the file(s) — it'll copy into `audio/`, rename to convention,
      wire, run `tools/checks.mjs`, and verify before pushing.

- [~] **Real-guitar test of Riff Runner Wait Mode** (Jonathan, 2026-07-12;
      metronome stripped out 2026-07-22) —
      **Note detection confirmed on real guitar (2026-07-22): correctly
      catches the notes played along.** That same real-guitar pass also
      surfaced a design problem: the metronome/count-in implied a fixed
      rhythm to match, but the tab was already waiting on pitch, not time —
      the two signals fought each other and read as confusing rather than
      helpful. **Fix: dropped the metronome/count-in entirely.** Wait Mode
      is now pure untimed note-by-note play-along — play each note whenever
      you're ready, the mic listens, the tab advances on a correct hit, no
      clock at all. This also removed the **Play-along speed** picker from
      the ready screen (nothing left to set a tempo for) and the beat pips /
      hit-line pulse from the play screen. Rhythm/tempo practice is still
      the timed **Keys / tap** game's job — Wait Mode is now purely about
      landing the right notes. Code: `coach.js` (`rnw*` functions, ready
      screen's `guitarUi`) and `styles.css`. **Not yet pushed or re-tested
      on a real guitar** — do a fresh real-guitar pass on the live site
      (PWA cache — hard-refresh) once pushed, to confirm the no-clock flow
      feels natural end to end (not just note detection in isolation).
- [~] **Real-guitar retest of the mic features** (Jonathan, 2026-07-12; melody
      detail added from REVIEW-PLAN K-1, 2026-07-20) —
      **Listening Coach chord check ("Check my changes"): DONE & verified**
      on real guitar (pushed through `2e3feee`). Root cause was NOT the
      onset/verdict knobs but the pitch detector: YIN's strict 0.22 clarity
      gate rejected polyphonic chord frames outright (most strums logged 0
      pitch reads). Fixes now live: forgiving *check-flow* onset thresholds
      (`CHK_*` at the top of coach.js, shared by the Coach + Change Up, split
      from the stricter `COACH_*` the rhythm games keep); chord-mode YIN
      clarity of 0.55 (melody stays 0.22); 20%-ok chord-tone bar; wider
      ±0.18-beat "on the beat" window; same 0.55 clarity applied to Change
      Up. Final real-guitar run: ~4.7 reads/strum, ~65–80% on chord, 87% →
      "Great". Debug meter (`?ccdebug=1`) was used to find this and has been
      stripped.
      **Still to retest, all on a real guitar:**
      - **Melody mode (P0 — this is the one that matters most).** Pitch
        detection confirmed correct on real guitar (2026-07-22) — it hears
        the right notes. But that same test surfaced a **timing UX bug**:
        melody mode only had the small reactive chip strip as a "what to
        play now" cue (`.now` class, flips exactly at the beat), unlike
        chords mode, which already solved this with a big current/next
        readout shown ahead of time (`coachNowHtml` — the code comment even
        documents why: "the chip strip alone only reveals a change the
        instant it's due, which makes every switch late by reaction time").
        Melody never got that same treatment, so students were watching the
        reactive highlight and always landing a beat late. **Fix: extended
        `coachNowHtml` to melody mode** — it now shows the current note big
        + "next: X" ahead of time, same as chords (`coach.js`, `coachNowHtml`
        + the beat-pulse update block ~line 533). **Not yet pushed or
        retested** — confirm on a real guitar that the current/next preview
        actually makes it easier to land notes on the beat.
      - One Note Hunt round, one full Change Up round.
      - **Must run on the LIVE site**, not localhost — the PWA service
        worker caches the shell, so confirm the deployed `CACHE_VERSION` is
        current and hard-refresh first.
- [ ] **Live-site device checks, no mic needed** (bundled from REVIEW-PLAN
      K-2/K-5/D-7 and today's compact-checklist work, 2026-07-20) — code for
      all of these already shipped; each just needs an on-device look, ideally
      in the same live-site sitting as the mic retest above:
      - **Tuner still locks all six strings** after the 5×-cheaper YIN scan
        (`tuner.js` — tau loop now bounded by `sampleRate/60` instead of
        scanning the full buffer, and the per-frame `Float32Array` allocation
        was removed in favor of a reused buffer).
      - **Tuner string-selector touch targets** on an actual phone (~360px
        wide) — buttons were raised toward ~40–44px; confirm they're
        comfortable to tap with a guitar on your lap.
      - **Compact checklist at phone width (~400px)** — rows shouldn't
        overflow and tap targets should hold ≥44px (`.step-head` is set to
        `min-height:48px` in styles.css, but wasn't confirmed on a real
        device — my browser-automation window resize didn't actually
        reflow the viewport during testing).
      - **Compact checklist print preview (⌘P)** — every step should render
        fully expanded with the chevron hidden, same as before the redesign;
        also not yet visually confirmed.
      - **Song Journey pages at phone width + print preview** — same two
        checks for the new journey-page accordion (`tabs/*.html`): rows
        shouldn't overflow at ~400px, and ⌘P should show every layer fully
        expanded with chevrons/translate button hidden. Shipped in `dbd2f8f`
        with print styles written, but neither has been eyeballed on a real
        device.
- [ ] **Module 12: confirm the requinto video fits, then delete the leftover
      note** (REVIEW-PLAN C-7, 2026-07-20) — `module-12.js:430` has an HTML
      comment flagging that the La Derrota (Vicente Fernández) requinto
      lesson still needs a fit check for the sierreño/corridos-tumbados
      requinto skill it's teaching. Not student-visible, but it's an
      unresolved flag in shipped content. Watch it (or have an agent watch
      and summarize) and either confirm it's a good fit or swap it — if
      swapping, WebSearch → oEmbed-verify, never write a video ID from
      memory. Delete the HTML comment once resolved.
- [ ] **Research backlog (medium/low)** — stored One-Minute-Changes
      scores, tempo-ladder playSeq, Song Journey anatomy sections, bends,
      7th/sus chord color, songwriting capstone, Choice-song style lanes,
      motivation layer. Details in `archive/RESEARCH_UPGRADES.md`; do not
      start without Jonathan's go-ahead.

---

## Recently shipped (post-archive)

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
