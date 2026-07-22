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

---

## Open work

- [ ] **Custom backing tracks for the six journey-page play-alongs — Jonathan
      is making them himself** (Jonathan, 2026-07-20) — every Song Journey page
      has a "🎵 Play along" button. **"the cure" is DONE:** swapped to Jonathan's
      own **A-minor, no-capo** tracks — a clean rhythm-down mix
      (`audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-rhythm-down.mp3`)
      plus a metronome variant with a click baked in
      (`...-rhythm-down-metronome.mp3`), both local files played through a
      looping `<audio>` element with a "🎵 Metronome" toggle on the Journey page
      to swap between them mid-playback (position + play state preserved).
      At the same time every capo instruction for the song was stripped across
      the modules + its Journey page, and an asterisk note under the
      play-along button explains that capoing the 1st fret matches the
      original recording's pitch. **Naming convention going forward:**
      `<artist-slug>-<song-slug>-backing-<key>-<bpm>bpm-<tuning>hz-<mix>.mp3` —
      see the "Backing-track naming & tuning" section in `CLAUDE.md` for the
      full rule (every track ships at A=440, exported directly from Moises).
      **Jonathan will supply custom backing tracks for the other five later** —
      until then they keep their existing YouTube loops:
      - Seven Nation Army — `sbN1wfDb4sw`
      - Sweet Child O' Mine — `kkZI8Lma8UA`
      - Let It Be — `xHhfKZAH_EU`
      - Watchtower — `Vq8cApzOdy8` (generic Am jam loop, no vocals)
      - Luna — `wBxFnX_V9mQ` (generic Dm jam loop, no vocals)
      Two ways to wire a replacement per song:
      - **Local audio file** (the cure's setup): drop the mp3 in `audio/`, then
        in `tabs/<song>.html` set `data-audio="../audio/<file>.mp3"` on
        `#playalong-frame` and add the `playalong-frame--audio` class; point the
        song's module-card `backingUrl` at `audio/<file>.mp3` (any
        `.mp3/.m4a/.ogg/.wav` auto-routes to the in-app audio player).
      - **YouTube**: `data-video="<id>"` in `tabs/<song>.html` + a youtube
        `backingUrl` on the module card (module-4.js for most, module-5.js for
        Let It Be). Give Claude the file or link and it'll wire + verify.

- [ ] **Real-guitar test of Riff Runner Wait Mode** (Jonathan, 2026-07-12) —
      ⚠️ **SHIPPED LIVE UNTESTED** — Jonathan chose to push it before a guitar
      test (base `6dcf68c` + the play-at-tempo rework). **Still needs a
      real-guitar pass on the live site** (PWA cache applies — hard-refresh to
      get the current code). If it misbehaves, fix + push again. This item
      stays open until that verification is done.
      Riff Runner's ready screen has a "How do you want to play it?" toggle:
      the existing timed **Keys / tap** game, or **🎸 My guitar** *Wait Mode*.
      **Wait Mode is now play-at-tempo with a safety net** (Jonathan's call
      over the original clock-free version): pick a **Play-along speed** (Slow
      36 / Medium 48 / Full 60 BPM, all unlocked), a **metronome** counts you
      in then keeps a steady click (beat pips light + the hit line flashes
      green on each beat), and you play each note in time. The safety net: the
      mic must still *hear* the right pitch before the tab advances, so if you
      fall behind it just holds the note and waits — no penalty. Notes are
      spaced by their beat gaps so the tab reads like the rhythm. **Note
      playback on a correct hit was removed** (you're already playing it).
      Reuses the coach's mic pipeline + range-trimmed YIN (`coachDetectPitch`,
      same as Note Hunt) for listening and the timed game's audio-clock click
      scheduler for the metronome. Practice aid — no score/unlocks. Idea from
      PickHero's Wait Mode. **Verified so far:** UI render — ready screen with
      speed pills, play screen with count-in + beat pips + green hit-line
      pulse + beat-spaced notes, done screen (browser, mock state, no JS
      errors). **Still to test on a real guitar:** does playing along with the
      click feel right at each speed; on-time → smooth advance, lagging →
      clean wait-and-resume; any double-advance on one strum or notes it won't
      catch; are the beat pips / hit-line flash helpful or distracting?
      Remember mic retests run on the LIVE site (PWA cache). Committed +
      pushed with a `CHANGELOG.md` entry (student-facing new feature). Code in
      `coach.js` (`rnw*` functions + the toggle) and `styles.css`.
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
      - **Melody mode (P0 — this is the one that matters most).** Never
        verified on a real guitar. Uses a stricter 0.22 clarity gate and a
        different verdict path than chord mode (`coach.js` ~515 the gate
        constant, ~666–669 the `ok`/`oct`/`wrong` verdict logic) — if the
        single-note consensus is noisy on a laptop/Chromebook mic, students
        could be getting false "wrong" verdicts on melody exercises right
        now. Play a single-note TAB exercise into the mic; correct notes
        should read `ok`, clean octave errors `oct`, anything else `wrong`,
        with no spurious misses. If it needs tuning, the clarity gate is
        where the chord-mode fix lived — start there before touching onset
        logic.
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
