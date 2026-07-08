# WORKFLOW.md — Guitar Class

> The original site build-out (2026 spring/summer) is complete. Its full master
> plan and session-by-session history now live at
> **`archive/WORKFLOW-2026-buildout.md`** — consult it for *why* something was
> built the way it was, but it is closed and drives no current work.
>
> This file is intentionally near-empty: Jonathan is starting a **full review of
> the website**, and the new plan will be written here (or in a new doc) once
> that review takes shape. All CLAUDE.md rules apply as always.

**Status legend:** [ ] not started · [~] in progress · [x] done

---

## Current focus

- [~] **Full website review** (Jonathan-led) — scope and plan TBD.
  - [~] **SITE_FIXIT_JULY_2** (`SITE_FIXIT_JULY_2.md`, supersedes the retired
        Round 1 `SITE_FIXIT_JULY.md`) — four-session fix-it. Round 1's `/preview`
        handout swap is now reversed: the handout Docs are retired from the site
        entirely (Docs stay in Drive, untouched), and Song Journey links open at
        the page top instead of a mid-page layer anchor.
    - [x] **Session 1 — Song Journey links open at page top.**
          ✅ 2026-07-07: stripped all 74 `#layer-N` anchors from module-side
          links (`journeyUrl:` + inline `href`) across `module-1..8.js`; `grep`
          confirms 0 `#layer` in `*.js`, per-file `tabs/` counts byte-identical to
          HEAD (no links lost), and `id="layer-N"` attrs in `tabs/*.html` untouched
          (30). Checks passed.
    - [x] **Session 2 — remove 22 dead handoutUrl fields.**
          ✅ 2026-07-07: deleted all 22 `handoutUrl:` lines across `module-1..8.js`
          (22 deletions, 0 insertions, 0 collateral). `grep` confirms 0 `handoutUrl`
          and 0 `docs.google.com` in `*.js`/`tabs/*.html`; skill-ID lists
          byte-identical to pre-edit; `checks.mjs` validates all 22 Sets. The 8
          Google Docs remain in Drive, untouched. Checks passed.
    - [x] **Session 3 — Module 1 template upgrade.**
          ✅ 2026-07-07: brought all Module 1 steps to the frozen Module 2 depth
          (per the 0.5 approved worked example). Added `stuck:` (6→15),
          `levelUp:` (0→17), and `response:` checks (6→13); every Watch step now
          carries a during-watching job and every practice/challenge step a
          "You've got it when." First-day tone kept gentle and social
          ("ask a neighbor," "compare to the freeze-frame"). All 7 lesson videos
          re-verified live via oEmbed. Skill IDs (`w1-s1..3`, `w2-s1..6`)
          byte-identical; `skillCount` unchanged; `checks.mjs` validates all
          Sets. **7 `TODO(fixit): timestamp` markers** left on the Watch steps
          for Session 4 to resolve with verified (M:SS–M:SS) ranges. No
          `FIXIT_FLAGS.md` items.
    - [ ] **Session 4 — video liveness sweep + lesson timestamps** (own sitting).
          Must resolve the 7 Module 1 `TODO(fixit): timestamp` markers.
  - [x] **Assessment alignment, Modules 2–5 → LOCKED S1 wording**
        (`archive/SITE_ALIGNMENT_2.md`).
        ✅ 2026-07-07: re-audited M2–M5 against the locked Unit 2–5 assessment
        wording; wrote `archive/AUDIT_REPORT_2.md`; closed all 13 in-scope findings
        (M4 pentatonic assessment reworded + new cold-read TAB-lick step & skill,
        skillCount 20→21; M5 two→three chords; M2 assessment summary realigned;
        M3 half notes added). Two items logged-only/deferred (M3 I–IV–V naming,
        M5 Watchtower `Am–G–F–G` vs `Am–G–F`). Checks passed; pushed.
  - [x] **Post-lock cleanup** (`archive/SITE_ALIGNMENT_3.md`).
        ✅ 2026-07-07: realigned Module 3's unit-assessment summary blocks to the
        locked three-task structure; added a "Name your progression: I–IV–V" step
        (M3 Set 2) and a "Week 17 — Call & Response over a backing track" step
        (M5 Set 4) — both steps only, skillCounts unchanged (M3 12, M5 24);
        harmonized the open-chord/barre Watchtower loop to `Am–G–F–G` in
        Modules 5, 6 & 7 and recorded it as a settled fact in CLAUDE.md; verified
        the Week 17 Written Check / duet are absent from the site. Checks passed.
  - [x] **Strip week numbers from student-facing copy** (`archive/REMOVE_WEEK_REFS.md`).
        ✅ 2026-07-07: removed the last three week references (all in `module-5.js`):
        the Call & Response step title ("Week 17 —" dropped), its Challenge
        parenthetical ("Week 17 check piece" → "semester-wrap check piece"), and the
        Seven Nation Army tag ("(Week 16)" dropped). `grep -rinE "week [0-9]+"` over
        `*.js`/`*.html` now returns zero. Steps/skillCounts unchanged; checks passed;
        pushed.
  - [x] **Link the-cure Song Journey page** (`archive/LINK_THE_CURE.md`).
        ✅ 2026-07-07: the-cure clean edit requirement dropped (Jonathan,
        2026-07-07) — all nine guard comments removed; `tabs/the-cure.html` (formerly
        orphaned) now linked from all eight "the cure" cards via `journeyUrl`
        (m1→layer-1, m2→layer-2, m4 ×3→layer-4, m5→layer-5, m8 ×2→layer-5, closest
        fit), plus an in-step Song Journey link on M3's ◐ power-chords stretch step
        (→layer-3). No `skills:` changes → skillCounts unchanged; no new YouTube IDs.
        Checks passed.
- [x] **Station B collapsible sections** — make the Station B portions of each
      set collapse/expand the same way the Station C portions do.
      ✅ 2026-07-06: all 22 sets restructured into thematic sections (steps
      unchanged, verified byte-identical); checks passed; pushed.

> **Note (2026-07-07):** the Google Doc's rubric tab was regenerated to the
> locked Unit 1–5 wording — the "rubric tab is STALE" caveat inside
> `archive/SITE_ALIGNMENT_2.md` is obsolete (archive left as-is).

---

## Carried-over loose ends (from the archived plan)

Small recurring / deferred items that were still open when the old plan was
archived (2026-07-05). Fold them into the review or handle them ad hoc:

- [ ] Handout audit: open all 22 Google Doc `handoutUrl`s in incognito — no
      permission walls; content still matches each set. (Re-run each semester.)
- [ ] Spanish spot-check: review 2–3 sets in Español mode with a fluent speaker.
- [ ] End-of-semester set: design the Module 1 goal-revisit / final reflection /
      performance rubric.
      2026-07-07 review: largely covered already — Module 5 Set 4 has Group 3
      chords, showcase prep, and the Module-1 goal-revisit reflection. Remaining
      scope (if any) TBD by Jonathan.
- [ ] Song refresh each semester: swap in 2–3 student-requested songs (verify
      links per CLAUDE.md); pull from the 🎤 request slot.
- [ ] Review Claude's first-pass song difficulty dots (`level: 1|2|3` on ~109
      Choice songs) and the 3 quiz distractor swaps (m6 reggae · m7 stacked-TAB
      pair · m2 H→G#) — details in the archived plan under Phase 5.
- [ ] ⚠️ Watch Module 4 Set 1's video (`m_IiyJu60-c`, "Major Pentatonic Scale –
      Marty Music") through and confirm it fits the beginner Pattern-1 station
      before the course starts.
- [ ] Supplemental/Choice song swap once Jonathan's curriculum map is final
      (don't polish the current placeholder lists).
