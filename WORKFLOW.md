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

- [x] **2026-07-26 deep site audit — remaining backlog.** Three parallel
  agents (core app JS · modules 8–13 · modules 1–7) plus a live browser pass
  found ~90 issues beyond what `tools/checks.mjs` can catch. All 9 Critical
  and 7 Medium items are fixed and pushed (`bc757ae`) — section-index desync,
  Coach mic race, Smoke on the Water strings, the major/minor rule, the
  pinky/3rd-finger contradiction, the Sweet Child TAB octave error, the
  Module 8/12 Travis-picking contradiction, the self-answering Module 11
  drill, the backwards Spanish TAB explanation, the tuner high-e bug, the
  save-retry loop, teacher-dashboard error mislabeling, the untranslated
  `{bpm}` string, several Module 6 mismatches, `img/` missing from the cache
  fingerprint, and SW audio caching. **A later 2026-07-26 session worked the
  rest of this list** — content errors, skill-tag mismatches, i18n gaps,
  paper-drill remnants, `gotItWhen` coverage, song-list inconsistencies, and
  every item in the app.js/coach.js/tuner.js/teacher.js code group are now
  fixed (unpushed as of this edit — run `node tools/checks.mjs` before
  pushing). **Closed out 2026-07-27** (via a workflow with a built-in
  adversarial review per fix group — see each item below for what it
  actually caught): the four dedicated single-chord cards; the module-4
  pull-off/slide gloss inconsistency; the `module-9.js`/`module-11.js`
  list-vs-prose spots (turned out already fixed by `eeefbda`, just
  undocumented); and the degenerate one-`<li>` list sweep (turned out not to
  be a bug at all — see that item). **Still genuinely open, on purpose:**
  the `m5w4` Full Run card's missing Journey chip (no single static link
  obviously fits a card that references whichever of three songs the
  student picked); the three items below still marked for Jonathan
  specifically (list-sweep over-listing check, Coach gate real-guitar test,
  Note Runner real-guitar test) — all three need his eyes/hands, not more
  code. Grouped by file so a session can take one group at a time:

  **Content — promises content the set doesn't teach (Jonathan flagged this
  one as next priority):** ⚠️ **Important finding while working this section
  (2026-07-26):** `objective` and the whole `assessment` object
  (`goal`/`performance`/`selfCheck`/`standards`) were **dead fields** —
  `buildAssess()`/`buildVideos()` in `app.js` are defined but never called
  anywhere, confirmed by grep. So most of this category's "promise" was
  never actually shown to a student — only the live fields (`subtitle`,
  and the `skills[]` checklist itself) matter. **Resolved 2026-07-26:**
  removed the dead `objective: 'I CAN…'` field entirely — all 36 occurrences
  across module-1.js…module-13.js, plus the now-pointless `checks.mjs`
  validation for it (`skillFocus`/`unit` already cover that ground live, per
  the `buildSet()` comment in app.js). `assessment` (`goal`/`performance`/
  `selfCheck`/`standards`) was left in place — still dead code-wise, but
  Jonathan confirmed its content (which songs/chords are assessed) is
  meaningful to him even unrendered, so don't delete it without asking.
  - [x] `module-5.js` (m5w2) — Dm and G/B now have real teaching content:
        two new challenge cards ("Fret Dm cleanly", "Play the G/B bass
        turnaround") with diagrams, hint/stuck/levelUp prose, and two new
        skills (`m5w2-s7`, `m5w2-s8`), inserted right before the "the cure"
        song card so the shapes are taught before they're used. Confirmed
        real (not dead-field only): Jonathan wants "the cure" performable as
        one of the three Module 5 assessment song options, and Dm/G-B are
        needed to actually play it. `config-main.js` skillCount 5: 24→26.
  - [x] `module-7.js` — m7w2's `objective` trimmed to drop the B-major
        overreach (dead field, but cheap to fix). m7w3's three conflicting
        A-shape chord lists (subtitle "Bb·B·C" / skill+assessment "Bb·C·D" /
        actual drill "C·D·E") unified on **C·D·E** — matches the live
        `subtitle` and the actual "A-Shape Slide" challenge card content.
        Fixed in `subtitle`(_es), skill `m7w3-s4` (text/gotItWhen/practice —
        this one's a live checklist item, not a dead field), the dead
        `assessment.goal`(_es), and `MODULE_REVIEWS[7]` `mr7-s5`. B major
        itself is fine as-is — it's genuinely taught in m7w3 Challenge 1,
        just via the A-shape, not the E-shape m7w2 had overpromised.
  - [x] m5w2's individual chords (C, F, G) and m5w3's A major each now have
        their own single-chord "Fret X cleanly" challenge card, matching Set
        1 (Am, Em) and Set 3 (D, Bm) — same voice/structure as those and the
        Dm/G-B precedent (`<ol>` body, hint/stuck/levelUp, a chord diagram
        reusing the fingering already taught elsewhere in the file), linked
        to the existing `m5w2-s1/s2/s3`/`m5w3-s2` skill ids (no new skills,
        no `config-main.js` change). Fixed 2026-07-27 via a workflow with a
        built-in adversarial review: the reviewer caught a real
        self-contradiction in the new "Clean F (simplified)" card's `hint` —
        it told students to "arch the finger at the very tip" while
        describing a 2-string mini-barre, which needs a flat finger, not an
        arched one — corrected before landing. Browser-verified (dev bypass,
        both languages): all three new Set 2 sections and the new Set 3
        section render in sequence with the existing dedicated-chord cards,
        list + trailing "You've got it when" render correctly, chord
        diagrams display, no console errors.

  **Content — factual/consistency errors (module-1–7 agent):**
  - [x] `module-5.js:41-57` vs `:258-261` — "X above a string" MC keyed two
        contradictory ways ("don't play it" vs "mute it"). Both now say
        "skip it" — no more "mute it" alternative.
  - [x] `module-5.js:434` — sends students to find a shared pivot finger
        between C and G that doesn't exist in this module's shapes (own
        `:484`/`:589` admit it). `levelUp` now points at Am↔F instead.
  - [x] `module-5.js:955` — "all six strings ringing clean" on a D/C chord
        pair that only uses 4–5 strings. Reworded to "every string you
        strum ringing clean."
  - [x] `module-4.js:1010` — composition example mixes major- and
        minor-pentatonic scale degrees; unplayable as written. Rewritten to
        `1 ♭3 5 ♭3 | ♭7 5 ♭3 1` — consistent minor-pentatonic degrees.
  - [x] `module-2.js:770-780` and `:263`/`:247`/`:258` — SNA riff described
        three ways on one card; three different pass thresholds for one
        drill ("9 in a row" vs "10 in a row" vs "9 of 10"). All instances
        (drill text, assessment `performance`) now read "9 of 10."
  - [x] `module-2.js:283` (EN) / ES twin — "one octave up" from low-E fret 7
        is actually a 4th, not an octave. Now says "a fourth higher."
  - [x] **DECISION MADE 2026-07-26:** `module-6.js` — "Knockin' on Heaven's
        Door" was **rewritten to the real bar lengths**
        `|G|D|Am|Am|G|D|C|C|` (Am and C each hold two bars), not just
        re-labeled — `text`/`stuck`/`levelUp` and the `MODULE_SONGS[6]`
        meta line all updated. Chose "teach it right" over "label the
        simplification," the opposite of "the cure"'s power-chord
        treatment (Jonathan's call for this song).
  - [x] `module-1.js:60` — `explain` references a "wiping the strings"
        choice that doesn't exist among the MC options (leftover text).
        Sentence removed.
  - [x] `module-1.js:650` — `w2-s3` choice "All of the pick" accidentally
        matches the `MC_PINNED` "all/none/both/neither of" regex and never
        shuffles position. Reworded to "The whole pick, gripped at the
        edge" — no longer matches the pin regex.

  **Content — mis-tagged/missing skill links (module-1–7 agent, not
  individually verified, spot-check before batch-fixing):**
  - [x] `skills:[n]` pointing at the wrong skill id: `module-4.js:67, 554,
        919, 988`; `module-3.js:504, 687`; `module-5.js:804, 823, 945,
        1104, 1198, 1219, 1240`; `module-6.js:82, 247, 265, 299, 460, 476,
        561, 579, 598, 794`; `module-7.js:166, 464, 872`. Knock-on: 8
        skills across M1–7 are tagged on no step at all, so their "📍 Show
        me where" button silently disappears — `w1-s2, w1-s3, w2-s1, w2-s2,
        w2-s3` (module-1), `m2w1-s4, m2w1-s5` (module-2), `m5w4-s4`
        (module-5). All corrected/added — every referenced line now points
        at a real skill id, and the 8 previously-orphaned skills are each
        tagged on at least one step.

  **Content — i18n drift and Spanish glossary (all three agents):**
  - [x] `module-2.js:265` — EN levelUp says "run the Shuffle deck"; ES says
        "haz el ejercicio de papelitos" (paper slips) — the pre-digitization
        version. ES now matches EN.
  - [x] `module-1.js` — 8 "You've got it when:" standards live inside
        `hint:` instead of `text:`, where `wrapGotItWhen` can't reach them
        (`:37-437`, spot-check each). Modules 2–7 have zero instances of
        this — Module 1 only. All 8 moved into `text`/`text_es`.
  - [x] `module-10.js:737/738` — ES `levelUp` says something different from
        EN (tells the student to "ask someone to call out keys" — a
        pre-digitization partner-drill leftover). ES rewritten to match EN
        ("name the fret before the card finishes turning").
  - [x] `module-12.js:256` — `text_es` keeps an English link label
        ("Station B's Travis pattern lesson video") instead of using
        `nav.stationBTitle`. Translated inline.
  - [x] Solfège-vs-letter convention slips (`cuerda B` should be `cuerda
        Si`, etc.): `module-5.js:571, 588, 703, 705`, `module-3.js:370`;
        conversely `module-3.js:368/370` solfège-izes a chord name (should
        stay a letter). Module-9's known ~30-instance version of this is
        already logged separately — don't re-sweep it. All 5 corrected
        (module-3's "Mi mayor" → "E mayor" for the chord name, plus its
        "cuerda B" → "cuerda Si").
  - [x] Minor ES inconsistencies: "Ear Spark" translated two ways in
        `module-2.js:333` vs. 19 other instances — **fixed**, both now say
        "Chispa auditiva." `module-4.js:~807` (inside `m4w2-s3`'s practice
        MC) glossed "pull-off"/"slide" inconsistently — **fixed 2026-07-27**:
        the ES choice for "snap your finger off the string sideways" had
        been mistranslated as "deslizando" (sliding), the site's word for
        the *slide* technique, not pull-off; corrected to "sacando … de un
        tirón hacia el costado," matching module-7.js's own canonical
        pull-off gloss. A few other small ones the module-1–7 report lists
        under "Minor ES" weren't individually re-checked either.
  - [x] `module-2.js:704, 721` — TAB `phrases[].label` is English-only and
        the renderer (`app.js:694`) uses `escHtml` not `tf()` for it — needs
        a renderer fix, not just a data fix. Module 2 is the only module
        using `phrases:`. Renderer now does `escHtml(tf(p,'label'))`, and
        both Happy Birthday phrase labels got `label_es` twins.

  **Content — paper-drill remnants that should be digital decks (project
  rule: no scissors/index cards/pen anywhere student-facing):**
  - [x] `module-2.js:226` — draw shuffled fret slips, right above the
        digital deck that already does this. `levelUp` now points at the
        Shuffle self-quiz deck instead.
  - [x] `module-3.js:187, 233, 369` — homemade flashcards / paper slips;
        Module 3 has zero `drill:` widgets despite Challenges 3–5 being
        textbook `deck`/`shuffle` cases. Now has 4: a new `deck:
        'power-chord-shapes'`, two `shuffle` drills (low-E and A-string
        roots), and `deck: 'e5-vs-emajor'` for the Ear Spark card.
  - [x] `module-5.js:740, 1017` + `MODULE_REVIEWS[5].assessItems` — shuffle
        homemade chord flashcards (a textbook `deck` case). New `deck:
        'chords-group1'`/`'chords-m5'` cards added; performance/assessItems
        text now says "run the chord deck."
  - [x] `module-8.js:571-578` — the one Ear Spark on the site with no
        `drill:{type:'ear'}` wiring; needs a new `EAR_POOLS` entry (neither
        existing pool covers "A-string vs D-string bass under Am"). New
        `amBassAD` pool added to `EAR_POOLS` in app.js and wired in.
  - [x] `module-9.js`, `module-10.js`, `module-11.js` — several
        assessment/performance fields still say "shuffle flashcards" /
        "draw a slip" even though the matching digital deck already exists
        a few lines away (`module-9.js:503,518,519,731,788`;
        `module-10.js:519,818`; `module-11.js:681,771`). Also leftover
        partner-dependency lines: `module-9.js:439,712,1062,1068`,
        `module-10.js:750,774`, `module-11.js:777`. All reworded to
        reference the existing deck/drill; a re-grep of all three modules
        for "flashcard/papelito/Got someone/partner" now comes back clean.
  - [x] `module-2.js:252` — the one card in M1–7 with a `drill:` that still
        keeps the "Got someone around?" partner line the project rule says
        to drop once a card has a deck. Line removed.

  **Content — coverage gaps (module-8–13 agent):**
  - [x] `gotItWhen` is blank on ~57 skills across Modules 10–12 (module-9 is
        partially thin too) — coverage is ~75% in Modules 1–8 and craters to
        4-10% in 10–12. Full id list is in the agent's report (already
        summarized in this session's chat log — re-run the module-8–13
        review agent if that transcript isn't handy, rather than
        re-deriving by hand). Verified 2026-07-26: every skill in Modules
        8–13 now has a `gotItWhen`/`gotItWhen_es` pair (0 missing, checked
        programmatically).
  - [x] `module-12.js` — `MODULE_REVIEWS[12].forward` never mentions
        Module 13, so a student finishing Module 12 is told the course is
        over. `forward`/`forward_es` now describe Module 13 before the
        capstone-performance paragraph.
  - [x] `practice.label` i18n holes the checker can't see (only validated
        for `type==='playSeq'`, but `fretboard`/`chord` types render it
        too): `module-9.js:514,517,784,787,790`, `module-11.js:902`. Same
        gap exists sitewide (module-2 ×3, module-5 ×1, module-7 ×4) — worth
        fixing `tools/checks.mjs`'s scope, not just the data. Both fixed:
        `checks.mjs` now requires `label_es` for `fretboard`/`chord` too,
        and all the flagged data locations (module-2 ×3, module-5 ×1,
        module-7 ×4, module-9, module-11) got their `label_es`.
  - [x] `module-9.js:970-990` — a "7th-position" cold-read line actually
        spans frets 5–10 (six frets); either it's really 5th position with
        a stretch, or drop the position-number claim. Reworded to "5th
        position with a stretch up to fret 10" throughout (text, hint,
        tab caption, playSeq label).
  - [x] `module-8.js` — Sets 2 and 3 (`m8w2`, `m8w3`) are missing the
        "Warm-up — tuning check" section every other set in Modules 1,
        9–12 opens with. Both sections added.
  - [x] `module-8.js` — `MODULE_REVIEWS[8].skills` ids skip s5/s6
        (`mr8-s1,s2,s3,s4,s7,s8,s9`) — harmless (ids are just storage
        keys) but suggests two review rows were deleted without
        renumbering. Renumbered to `s1`–`s7` with no gap.

  **Content — list-vs-prose rule (cards over ~200 chars with more than one
  action, still written as a paragraph — project rule says these should be
  `<ol>`/`<ul>`):**
  - [x] `module-11.js:856` (386 chars, no list) and `module-9.js:82` vs its
        sibling `:92` (inconsistent — one's a list, one isn't) plus
        `module-9.js:351` — **turned out already fixed** (checked
        2026-07-27): commit `eeefbda` had already converted all three, its
        own commit message and this line just never got updated to say so.
        Verified by diffing `eeefbda` against its parent — all three are
        correctly `<ol>`s in EN+ES, original wording preserved, nothing left
        to do. The line-856 citation itself had also drifted with later
        edits (the real card is now ~line 878). `module-13.js:188, 248, 298, 310, 324` (all multi-action
        prose in a module where every other procedural step is a list) —
        **fixed**, all 5 converted to `<ol>`/`<ul>`. `module-10.js:148, 422,
        718` (warm-up tuning cards, prose here but `<ol>` in every other
        module) — **fixed**, all 3 converted (module-8's two new warm-up
        cards were also written as lists from the start). Lower-confidence/
        optional per the agent: module-8.js:35,361; module-9.js:36,109;
        module-10.js:93,629; module-11.js:36,51,312; module-12.js:428,637;
        module-13.js:207 — mostly "Watch X, then Y" cards, which are prose
        sitewide by convention; left alone as recommended.
  - [x] **Closed 2026-07-27 — turned out not to be a bug.** Degenerate
        one-`<li>` `<ul>` lists (renders as a lone bullet): the backlog's
        ~19 locations (`module-8.js:183`, `module-9.js:433,693,958`,
        `module-12.js:147,166,202,224,482,501,519,537,748,766,822`) are
        every one of them a **Challenge card** (`Challenge N — Title:`),
        and CLAUDE.md's Challenge-card rule is explicit that these are the
        one place the "single actions stay prose" carve-out does NOT
        apply — "the body is always a list" and "a card that already had a
        list keeps it byte-for-byte," full stop, regardless of length. A
        fix agent unwrapped all 11 real locations (module-8.js:182,
        module-12.js: nine spots) to prose on the reasoning that a
        single-action list looked degenerate; an adversarial review agent
        caught it against CLAUDE.md's own wording and every location was
        reverted (`git diff --stat` confirmed both files byte-identical to
        HEAD). Separately checked module-9.js's three citations by hand:
        `:433` and `:693` are also Challenge cards (same rule, left alone);
        `:958` was already a stale citation even before this session — that
        line is now a section boundary with no list at all. **Net: nothing
        on the site needed changing** — the original backlog item
        misapplied the list-vs-prose rule to cards the Challenge-card rule
        exempts.

  **Content — song-list inconsistencies:**
  - [x] `MODULE_SONGS[2]` omits Let It Be though `m2w2.songThread` links its
        Layer 2; `MODULE_SONGS[3]` omits "the cure" though m3w2 has a full
        challenge + thread entry. Both added as Core rows.
  - [x] `MODULE_SONGS[7]`'s Seven Nation Army is `type:'Core'` but has no
        `journeyUrl` — the only Core row site-wide with no 🧵 button.
        `journeyUrl: 'tabs/seven-nation-army.html'` added.
  - [x] `MODULE_SONGS[6]` demotes Let It Be to `type:'Choice', core:false`
        in the one module that builds a challenge on its verse. Promoted to
        `type:'Core', core:true`.
  - [x] Five core-song challenge cards lack the inline Journey chip their
        siblings have: `m2w2` "the cure"/"Let It Be", `m4w2` "the cure",
        `m5w2` "the cure", `m5w4` Full Run. **All 5 now fixed.** `m5w4` Full
        Run (`module-5.js`, Challenge 4) was the holdout — it names whichever
        of three songs the student picked, not one fixed song, so a single
        static chip didn't fit. Resolved 2026-07-27 (Jonathan's call): dropped
        the card's separate "optional: play your performance song" step
        (that concept still lives elsewhere in the Set, e.g. "Map your
        performance song's chords") and reworded the assessment step to "Pick
        one of the three core songs," linking each song name inline to its
        own Journey page (`tabs/let-it-be.html` / `tabs/luna.html` /
        `tabs/the-cure.html`) rather than one trailing chip. EN/ES both
        updated; `checks.mjs --skip-links --check` passes.
  - [x] `module-6.js:1044`-ish gives "Happy Birthday" Let It Be's
        progression (C–G–Am–F — Happy Birthday has no Am); `module-5.js`
        gives SNA "D–A–Em" when the site's own Layer 5 page teaches
        Em–G–D–C. Happy Birthday corrected to C–F–C–G–C; SNA corrected to
        Em–G–D–C (EN and ES both, in the `meta` line).

  **Code — app.js / coach.js / tuner.js / teacher.js (all fixed
  2026-07-26; full original detail was in that session's chat transcript
  from the core-app review agent):**
  - [x] `tuner.js` `startTuner()` is fire-and-forget — closing the tuner
        popup while `getUserMedia` is pending can orphan a live mic stream.
        Fixed with a `tunerStartToken` counter — a stream that resolves
        after `stopTuner()` bumped the token is recognized as stale and
        stopped immediately.
  - [x] `app.js` Shuffle Drill: resetting mid-round leaves a pending
        `setTimeout` that fires against a rebuilt (differently-shaped)
        state and throws; also its countdown `setInterval` is never
        cleared on `activateSet` navigation, leaking one 12.5 Hz interval
        per set left mid-drill. Both fixed: pending timeouts are tracked
        and cleared (`st.pending`), and `activateSet` now calls `sdStop()`
        on every shuffle drill on set-switch.
  - [x] `coach.js` single-chord checks: `isChange` logic marks a slot as a
        "change" even when it's the same chord repeating, making the
        `'coach.crit.changes.onlyOne'` message unreachable and mis-grading
        one-chord drills as "changes came in late." Fixed — `isChange` now
        also checks the previous slot's chord name differs.
  - [x] `coach.js` `nrLoop` (Note Runner) doesn't bail when the analyser
        disappears — every other mic loop in the file does. Can silently
        demote a student's adaptive stage on a lost mic instead of
        triggering the `micSuspect` guard. `!coachAnalyser` added to the
        bail-out guard, matching the other mic loops.
  - [x] `teacher.js` — module-load failures inside `loadAllStudents`'s
        per-module loop are silently swallowed (`catch(e){}`), which
        quietly shrinks the skill universe and inflates every percentage
        with no warning. (The loop actually lives in `showTeacherApp`, not
        `loadAllStudents` — same bug, corrected location.) Failures are now
        logged to the console and surfaced as a warning banner above the
        summary cards (`showTeacherLoadWarning`).
  - [x] `coach.js` `coachScoreCompletion` reports the wrong beat number for
        a gap (off-by-one in the `hitIdx.find` callback). Fixed to report
        the first missed beat, not the resuming hit.
  - [x] `tuner.js` `tunerStableCount` double-duty bug: the same counter
        tracks "same-note frames" and "silence countdown," causing a
        ~0.45s lag re-detecting a re-plucked string after a silent gap
        (Auto mode only). Split into `tunerSameNoteCount` and
        `tunerSilenceCount`.
  - [x] `tabs/journey.js` — a rating click during the initial Firestore
        `get()` can be silently overwritten when `applyRatings` replaces
        the DOM right after; the pending save then reads the overwritten
        state. Fixed with a `locallyClickedLayers` guard — `applyRatings`
        skips any layer the student already clicked this page load.
  - [x] `app.js:2303,2307` — reflection textarea isn't HTML-escaped on
        re-render (self-only scope, not cross-user exploitable, but XSS-shaped).
        Both `escHtml()`-wrapped now.
  - [x] `teacher.js:127` — `abbreviate(s.text)` goes into `innerHTML` raw
        while every other call site escapes it. `escHtml()` added.
  - [x] Dead code: `buildVideos()`/`buildAssess()` in app.js are never
        called — meaning every set's `assessment`/`objective` field is
        written but never rendered anywhere. Worth deciding delete-vs-wire-up;
        several of the "assessment promises content the set doesn't teach"
        items above might be moot if this is intentionally dead.
        **DECISION MADE 2026-07-26:** both functions **deleted** from
        app.js (not wired up) — `objective` was removed from module data
        (see the top item), `assessment` was kept as data-only per
        Jonathan's call. `buildStations()`'s no-stationId branch and
        `openSt()` were also unreachable — both **deleted**.
        `btn.classList.add('incomplete')` referenced a CSS class with no
        stylesheet rule — **removed**.
  - [x] i18n gaps outside `tools/checks.mjs`'s scope: `buildSearchIndex`
        never routes through `tf()`, so Spanish-mode search misses
        Spanish-only content; several hardcoded-English shell strings
        (search panel, save indicator, popup labels, embed fallback) bypass
        `t()` entirely — full list in the JS audit's chat transcript.
        `i18n.js` also doesn't set `document.documentElement.lang` on
        initial page load (only on toggle), and `applyI18n`'s
        `JSON.parse(params)` isn't guarded against one malformed
        `data-i18n-params` aborting the whole pass. All fixed:
        `buildSearchIndex` now indexes via `tf()` (and invalidates the
        cached index on language change); the search panel, save
        indicator, popup labels, and embed fallback all moved into
        `i18n.js` (`search.*`, `save.*`, `popup.*`, `panel.*` keys, EN+ES);
        `documentElement.lang` is set on initial load; `JSON.parse` failures
        in `applyI18n` are now caught per-element.
  - [x] **DECISION MADE 2026-07-26:** `blend-words-game.html` (unrelated
        phonics game living in this repo) isn't in `sw.js` ASSETS or
        `tools/checks.mjs`'s SHELL_FILES, so it's never precached or
        syntax-checked. **Left out of the deploy pipeline on purpose** —
        Jonathan confirmed it isn't meant to ship through this site's
        build; not wired into `sw.js` or `checks.mjs`.

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

- [x] **Check the Coach gate with a real guitar — home pass done 2026-07-27:
      "feels fair" (Jonathan, Mac, quiet room).** Wording, bar, and flow all
      read right. One residual check rides along with the school batch below:
      confirm the 💪 Good bar still feels fair on a Chromebook with a noisy
      classroom around it. Original checklist, for that re-run:
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

- [x] **Listening Coach check-off gate — teacher view of overrides
      (2026-07-25) — done 2026-07-27.** `teacher.js`'s skills-grid and
      Students-detail checkmarks now read `games.coachSkill[skillId]` and
      render three states with the SAME green check (never a worse-looking
      mark, so an override doesn't read as a red flag on the student): a
      solid blue ring for a genuine Listening Coach pass (tooltip shows the
      level and date), a neutral gray DASHED ring for a gate override
      (tooltip explains it's usually a mic/room issue, not a skill issue),
      and the plain check unchanged for a self-declared skill with no Coach
      data. Two new legend rows explain the icons, inserted into `#t-legend`
      at runtime so `index.html` didn't need touching. An adversarial review
      caught a real bug in the first pass — `override` is a one-way flag
      nothing ever clears, so a student who overrode once and later
      genuinely passed at a higher level would show the override marker
      forever — fixed by checking `coachRec.level >= TEACHER_COACH_GATE_MIN_LEVEL`
      (mirrors app.js's `COACH_GATE_MIN_LEVEL`) before ever falling back to
      the override marker. Browser-verified (mocked `allStudents` + a
      simulated stale-override-then-later-pass case): all three states
      render distinctly, tooltips read correctly, the staleness case
      correctly shows "verified" not "override." Deliberately left in
      plain English, not wired to i18n.js — this file has zero i18n
      anywhere else (it's gated to Jonathan's own `TEACHER_EMAIL` account),
      so adding it just for two new strings would be new scope rather than
      an existing pattern; flagged rather than decided silently.

- [ ] **Note Runner — live guitar check (Jonathan, on a school Chromebook if
      possible).** The new adaptive arcade game shipped verified only against
      headless fake-mic runs. **Progress 2026-07-27 (Mac, home):** timing
      offset checked — Jonathan's Mac wants ~35 ms, so the slider works as
      designed and now steps by 5 (the 70 ms default stays: it's tuned for
      Chromebook mics — re-verify at school); **power-chord stages
      guitar-verified good**; teacher account now sees every level unlocked
      (isGatePreviewer in nrUnlocked) so any stage can be tested directly.
      What to check, in rough order:
      1. **Mic timing offset** — ✅ done on the Mac (see above); repeat once
         on a school Chromebook to confirm the 70 ms default is right there.
      2. **Stage movement feel** — ⏸ **WAITING ON STUDENTS (Jonathan's call,
         2026-07-27).** Deliberately NOT judged solo: the 90%-up / 65%-down
         pacing is about how it feels to someone actually climbing the
         ladder, and Jonathan plays too well for his own runs to test it.
         He'll put it in front of a class and report back. **Don't touch
         `NR_UP_PCT` / `NR_DOWN_PCT` until that feedback lands** — no
         speculative retuning in the meantime.
      3. **Power-chord stages** — ✅ guitar-verified good 2026-07-27: the
         chord-tone vote grades real strums correctly.
      4. **Weak-spot re-dealing** — deliberately flub one note for a round
         or two, then confirm it starts showing up more and the results
         screen names it ("Coming back around until they're clean: …").
      5. **Hit animations** — sparks/×2 pops read as fun, not distracting,
         at Chromebook size.
      Report tuning numbers to Claude; the knobs are one-line constants.

- [ ] **Post-review guitar + eyes pass (Jonathan, 2026-07-27 session).**
      A seven-agent review plus a ten-agent adversarial verification workflow
      shipped 13 commits today (see "Recently shipped"). Two items need his
      hands, not more code:
      1. **Mic games on a real guitar.** Note Hunt, Note Runner and Strum
         Radar all had behaviour changed in the same batch, and a *separate*
         concurrent session rewrote the pluck synth (`e385d12`) on top — so a
         single guitar pass now covers both. Specifically:
         **Note Hunt** — finish a round, then confirm the mic actually
         releases (browser recording indicator goes dark) and that "Play
         again" and the level pills still start a live round rather than
         hanging on "Listening…". **Note Runner** — tap ■ Stop during the
         count-in and confirm the stage does NOT drop and the results screen
         doesn't blame notes you never played. **Strum Radar** — with a mic
         offset set (Note Runner's slider, shared key), confirm the moving
         highlight now sits on the beat you HEAR rather than lagging it, and
         that beat 1 of bar 1 lights on the first bar of a round.
         If a demo note sounds wrong rather than a game misbehaving, suspect
         the synth commit, not these fixes.
      2. **Module 1 Set 2 — check the progress ticks.** Set 2 gained a new
         "Your first fretted note" card mid-section and its "Happy Birthday"
         was rescoped to the first phrase. Step-completion keys are
         POSITIONAL (`${set}-${station}-sec${gi}-${idx}`), so a student who
         already finished Set 2 will see one tick land on the new card and
         "Challenge 3 — Riff Time" read as un-done. Skills and grading are
         unaffected and a re-tick fixes it — this is a "confirm it looks
         acceptable in the wild" check, not a bug hunt. If it reads badly,
         the alternative is moving the card to the end of the section, which
         puts the fretting instructions AFTER the two cards that need them.

---

## Recently shipped (post-archive)

- [x] **2026-07-27 — site-wide review: outage fix + 13 commits.** Started as
      "check the site for errors" and immediately found the **whole site was
      down**: `buildSet()`'s song-thread block named its `map` callback
      parameter `t`, shadowing the global i18n `t()`, so every set with a
      `songThread` threw and **no module content rendered at all** (`3ab369d`).
      Introduced hours earlier the same day by an i18n conversion
      (`29c5187`) that added a `t()` call inside that callback. The failure
      was sticky: `_modulesRendered.add(num)` ran before the throw, so
      switching modules never rebuilt for the rest of the session — refreshing
      genuinely could not help. **Every existing check passed**, because the
      file was syntactically valid and the module DATA was fine. Hence
      `dcdb372`: `checks.mjs` now has a **render smoke test** that loads
      i18n + diagrams + module data + app.js in a vm against a minimal DOM
      stub and calls `buildSet()` on all 36 sets. Verified by reintroducing
      the bug (21 sets fail, exit 1). A harness that can't load degrades to a
      WARNING, never a blocked push — a stale stub must not become a reason to
      delete the safety net.

      Also shipped: sign-out now flushes the pending debounced save and hard
      reloads (a got-it ticked seconds before signing out was dropped, and
      `_modulesRendered` + the built DOM + `sessionStorage` bests survived
      into the next student on a shared Chromebook) and two service-worker
      correctness fixes — `waitUntil` the `cache.put`, not the fetch, and
      install with `{cache:'reload'}` so a new `CACHE_VERSION` can't be filled
      from stale HTTP copies (`b70621e`); teacher **pause + archive**
      (`90c486e`, both uid→bool maps in `config/class` so they need no rules
      change and can't destroy work); the sequential gate became a
      **high-water mark** (`6b2c19b` — un-ticking one skill re-locked the
      next set even when it was finished); Module 13's winding rewritten for
      the **classical slotted headstock** it was always taught on
      (`7631362` — the graded criterion demanded "wraps walking down the
      post", which a horizontal roller cannot do; the sketch was already
      correct, only the words were wrong) plus steel-vs-nylon and safety
      additions (`7f22360`); Module 10's "Smoke on the Water" moved from the
      A blues scale to **G**, the riff's actual key (`7f22360`); the
      Firestore rules **versioned** as `firestore.rules` + a teacher-email
      drift check (`44a4adf`, published to the console by Jonathan the same
      day — GitHub Pages does NOT deploy rules); then a seven-agent fix sweep
      with a ten-agent adversarial verification workflow — eight runtime
      defects (`127bb19`), keyboard/screen-reader (`475e3b0`), curriculum
      across M1–M12 (`569fd3d`), and Module 12's forward no longer promising
      a capstone that doesn't exist (`ae6f27f`).

      **Why the verification pass earned its cost:** it confirmed four
      defects *in the fixes themselves* and refuted three others. The worst
      was self-inflicted — the new "flush pending ratings once auth arrives"
      logic in `tabs/journey.js` didn't record WHOSE ratings they were, and
      Firebase auth persistence is shared across tabs, so a journey page left
      open while signed out would flush the previous student's ratings into
      the next student's doc unprompted. That is the exact cross-student
      class `b70621e` had just removed, reintroduced by a fix for something
      else. Three agents also **corrected the briefs they were given** (a
      "C major" MIDI list that was actually B Locrian; rhythm data summing to
      7 beats not 8; an A-shape sub-barre defect claimed in two files that a
      grep proved existed in one). Lesson worth keeping: brief agents to find
      problems rather than confirm work, and verify structured claims against
      the data before relaying them.

- [x] **Module 5 assessment settles on one song; song titles quoted
      site-wide** — pushed `598a580` (2026-07-26, applied via cloud patch
      pair) then `8262116` (2026-07-26, local). The cloud patch closed out
      the last inconsistencies from the two-song assessment work (`mr5-s8`,
      the Full Run practice counter, Set 4's skill list, and Let It Be's Set
      2 card all still said one song) and clarified Module 3's Mystery Chart
      ("the lowest fretted dot" → "lowest-sounding … nearest the thick
      strings," since the app draws frets top-to-bottom so the higher fret
      sits lower on screen; the alphabet-walk stuck-hint now covers the A
      string too, not just low E; the unnumbered challenge got folded into
      its set's numbering). Locally, Jonathan then reversed the two-song
      requirement itself: Module 5's assessment now asks for ONE core song
      from memory (Let It Be, Luna, or "the cure") — the "song of your
      choice" requirement is gone, though its Set 4 practice material
      (chord-mapping, the Full Run's chart-first rep) stays as optional
      ungraded practice, not something the assessment checks. Separately,
      every song title across all 13 modules, `coach.js`, `i18n.js`, and the
      six Song Journey pages is now wrapped in quotation marks for
      consistency — including shorthand nicknames ("Watchtower," "Sweet
      Child") and "SNA" spelled out as "Seven Nation Army" — done via 7
      parallel file-scoped agents plus a manual pass to reconcile the
      nickname-quoting convention across them. Live-site spot-checked in the
      browser: Module 5's self-assessment and assessment-checklist wording,
      the "All Along the Watchtower" Song Journey page's title/heading, and
      Module 4's shorthand-nickname challenges all confirmed correct.
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

---

## Rationale behind the CLAUDE.md rules

Moved out of `CLAUDE.md` on 2026-07-26 so it stops being re-read on every turn
of every session (it was ~8,800 tokens per turn; the trimmed file is ~3,300).
The *rules* stay in `CLAUDE.md`; the reasoning, worked examples and history live
here. Read this when you need the **why**.

### Multi-step directions get lists (Jonathan, 2026-07-23; refined 2026-07-25)

Jonathan's words, 2026-07-25: *"anything that has multiple steps should have
bullet points."* In practice: a card of roughly 200+ characters containing more
than one thing the student DOES is a list. Do not skip one because the actions
"flow naturally," are "one continuous technique," or "would need re-stitching" —
re-stitch it, and splitting a single long sentence into two `<li>`s is fine.

But the opposite failure is real: a two-item list whose second item is a
technique reminder, or a card that reads like assembly instructions instead of a
coach talking, has gone too far. Preserve the author's words either way —
re-split and lightly re-stitch, never rewrite the voice.

The trailing "You've got it when: …" was a deliberate fork. Jonathan weighed
giving it a bullet against giving it a different visual treatment and chose the
treatment (2026-07-26, option B2: thin green rule, italic, one shade quieter),
precisely so the "promise rather than a step" distinction survived. Bulleting it
would have reversed his own 2026-07-25 call. Flagging that reversal up front is
what produced the better answer.

The 2026-07-25 sweep applied the list rule across all 13 modules (~157 cards). A
card still in prose was left that way on purpose: single action, pure
explanation, a bare "Watch: video" line, or a wrap-up reflection question.

### Challenge cards (Jonathan, 2026-07-26)

195 cards across modules 1–12 — 116 numbered `Challenge N — ` plus 79 unnumbered
`Challenge — ` with identical duplication. Jonathan's complaint, from a Module 2
screenshot: *"the title and the beginning of the instructions are repetitive…
the steps are also repetitive here. 1 and 2 can be consolidated into one step
that starts with a verb, 'play'."*

His calls, via multiple choice: full title into `label` verbatim (never invent or
renumber); body opens straight on the directions; **every** body is a list —
*"make sure to keep bullet points"*; glossary parentheticals move into the text
while identifying ones stay in the title.

**Where the sweep went wrong the first time.** Agents re-stitching prose into
`<li>`s invented verbs the author never wrote (`Set the index finger…` for
`Index (i) on the G string.`), promoted trailing tips into required steps, split
concurrent actions into a sequential `<ol>`, and grew existing lists. An
adversarial audit pass caught 12 such defects. Budget for one on any comparable
sweep.

### Paper drills get a digital deck (Jonathan, 2026-07-26)

Looking at the Module 2 Ear Spark: *"there are things like this that require
paper. can they be made digital?"* The site already had `drill:{type:'shuffle'}`
commented as "the digital twin of the paper shuffle self-quiz," used in only 2
steps and only dealing frets. Generalised into `deck` and `ear`, wired into all 8
paper drills.

| type | deals | replaced |
|---|---|---|
| `shuffle` | frets on one string, timed | the paper shuffle self-quiz |
| `deck` | any small card pile, optional back side | flashcards and chord slips |
| `ear` | a hidden note sequence, played aloud | "shuffle slips, record yourself" |

Decks live in `DECKS` in `app.js` (not module data) so the Spanish comes from
`i18n.js` instead of being duplicated across thirteen module files. Ear pools
live in `EAR_POOLS` and play through the same Karplus-Strong `playNote()` the TAB
players use. Storage: `games.dk['<deckId>']` for best runs plus a `games.dk.at`
day stamp, mirroring `games.sd`.

Design calls, all Jonathan's:

- **Self-report, not auto-grading.** What's checked is whether the student PLAYED
  the chord, which the app cannot see. A 4-choice version would turn recall into
  recognition — Fret Zap already owns multiple choice.
- **Two-sided decks keep the back hidden until tapped**, so "answer out loud
  before you check" — the one thing paper cards really provided — survives.
- **"Put it back" re-deals that card 3 later**, the paper move of tossing the slip
  back in the pile. Only first-try hits score.
- **The ear sequence is never shown before the reveal.** That hiddenness IS the
  drill; replay is unlimited and unscored, because it's an optional 2-minute
  bonus and pressure belongs in the Shuffle Drill.
- **No paper fallback line**, and the "Got someone around?" partner line comes off
  any card that gets a deck.

Still on paper as of 2026-07-26, deliberately or awaiting a decision: 23
slip/flashcard mentions, almost all in `levelUp` extensions (Module 3
power-chord flashcards, Module 9 dot-fret slips) plus genuinely-written tasks
(writing TAB from memory, spacing numbers on a staff). 16 partner "Got someone
around?" lines survive on cards that never had a deck.

### Quiz answers are shuffled at render time (Jonathan, 2026-07-26)

Jonathan: *"the quiz correct answer choices should be randomized. right now the
correct answers are always the first one."* The premise was close but not exact,
and the real numbers were worth reporting back: across all 237 graded MCs,
position 1 held 34%, position 2 **50%**, position 3 14%, position 4 **2%** —
never picking the last option was right 98% of the time. After the shuffle:
28 / 28 / 23 / 21.

`mcOrder(choices, seed)` returns the ORIGINAL indices in display order and is
used by both MC render paths. Load-bearing details:

- **Deterministic, not `Math.random()`.** Seeded on the question's own ENGLISH
  prompt + choices. The list re-renders on tab switch, language toggle and after
  answering; a fresh order each time would make options jump under a student's
  finger and make a saved answer look like it moved.
- **Seeded on English only**, so order is identical in both languages and the ES
  label rides along on the original index.
- **Same order for everyone**, including the projector — chosen over a
  per-student shuffle so "look at the third one" still works in class.
- **Two storage schemes, both still live.** The step quiz persists the choice
  TEXT; the practice panel persists the INDEX, so its buttons keep `data-idx` on
  the original index and only the render order moves. Do not simplify that away.
- **Catch-alls are pinned** (`MC_PINNED`): `all/none/both/neither of…`, and bare
  `None`. It deliberately does NOT pin ordinary answers merely starting with
  All/Both — "All 6 strings", "Both on E string" are real answers, and freezing
  them would recreate the bug. Jonathan's answer implied the broader rule, which
  would have pinned 13 ordinary answers; the narrow rule shipped instead.

Because this is render-time, new questions can't regress — write `answer: 0`
every time if you like.

### Never invent YouTube IDs from memory

In May 2026, Modules 6–8 were drafted from recall and ~60 of the URLs were 404s.
Training-data recall of 11-character video IDs is unreliable even for famous
songs and well-known channels. Search-and-verify is the only safe pattern.
Verify via oEmbed — returns JSON title/author for valid videos, 404 for
invalid/removed — and batch the checks in parallel; it's cheap and catches
mistakes before they ship. Pre-existing URLs in `module-1.js` through
`module-5.js` are presumed valid.

Note for cloud sessions: `WebFetch` against the oEmbed endpoint works even where
`curl`/`wget` are blocked. `upload.wikimedia.org` and `i.ytimg.com` refuse
connections outright.

### Prefer diverse tutorial creators (audit 2026-07-10)

The tutorial lineup skewed heavily toward a handful of big channels run by white
men — Marty Music, Andy Guitar, JustinGuitar, swiftlessons, GuitarZero2Hero and
Kurt Berg alone covered roughly half the slots. Jonathan wants students to see a
more diverse set of teachers. The rule is *check for a strong diverse option
first*, not *avoid the big channels at all costs* — lesson quality still wins.

### Backing tracks — worked example

`tabs/the-cure.html` + `module-4.js`:

- `olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-rhythm-down.mp3` — the default
  clean track (`backingUrl` + `data-audio`)
- `…-rhythm-down-metronome.mp3` — same mix with a click baked in, wired via
  `data-audio-metronome` and surfaced as a "🎵 Metronome" toggle on the Journey
  page that swaps the `<audio>` src while preserving playback position and state

"the cure"'s original master was at 442 Hz (~8 cents sharp) and had to be
re-exported at 440, which is where the A=440 rule came from. The `CACHE_VERSION`
fingerprint covers every file in `audio/` for exactly this reason — re-exporting
a track under the same filename needs the same cache-bust as a shell edit. Audio
is fingerprinted but deliberately **not** in `sw.js`'s `ASSETS` precache list;
that would make the service worker download every jam track at install time.

### Cloud handoff — full process (refined 2026-07-23)

1. **Cloud side:** run the FULL `node tools/checks.mjs` so the link check happens
   once and `CACHE_VERSION` ships pre-bumped; commit; `git format-patch`.
2. **Every patch ships as a PAIR** with its own `APPLY-<name>.md` — never a patch
   alone, never instructions only in chat. The APPLY file states what the commit
   is, which base commit it expects, the apply order if others are pending, and
   the exact steps: `git status` (clean tree) → `git am <patch>` →
   `node tools/checks.mjs --check --skip-links` (fast verify only — the cloud
   already ran the full battery and the patch carries validated content
   byte-for-byte) → `git push` → `node tools/checks.mjs --live` a minute later.
3. **Local side:** Jonathan hands the pair to his local Claude Code.
4. **Cloud side afterwards:** fetch origin and hard-reset the cloud clone —
   patches applied via `git am` get new hashes, so never re-merge.

### Cloud-session working notes

- Clone read-only: `git clone --depth 1 https://github.com/jhoffmanteacher/guitar-class.git`
  (no `gh` CLI in the sandbox). Shell cwd resets between calls — use absolute
  paths. The stop-hook "unpushed commits" warning is expected: cloud sessions
  ship patch pairs, they never push.
- Playwright lives at `/home/claude/.npm-global/lib/node_modules/playwright`
  (CommonJS), browsers at `/opt/pw-browsers`. Serve with `python3 -m http.server`,
  then `devBypass()` → `onModuleChange(N)` → `switchTabById('<setId>','station-c')`.
  Station panels are `display:none` until `switchTabById` runs — element
  screenshots silently time out otherwise.
- Firebase can't load in the sandbox; the dev-bypass user can't write to
  Firestore, so `saveGames`/`saveProgress` are skipped under it.
- Stale assumptions to avoid: `MODULE_MANIFEST` has **13** entries, not 12; there
  is no flat songs hub; screens use `*-screen` ids, not `*-panel`.
