# WORKFLOW.md — Guitar Class

> Build history lives in `archive/`:
> **`WORKFLOW-2026-buildout.md`** (original site build-out) and
> **`WORKFLOW-2026-july-fixits.md`** (July 2026 fix-it era: SITE_FIXIT_JULY
> 2–4, LOOPER_REMOVAL, SITE_LUNA_SWAP, SONG_CHOICE_TOGGLE revert, alignment
> and cleanup passes). Consult them for *why*; they drive no current work.
> All CLAUDE.md rules apply as always.

**Status legend:** [ ] not started · [~] in progress · [x] done

---

## Open work

- [x] **Song-list review session** (doc retired after completion) —
      consolidated every module's per-set Choice-song lists into one
      module-level list per module (2–8; Module 1 untouched, out of scope),
      rendered as a collapsible "🎵 Songs" section. ✅ 2026-07-09 (`d77732e`).
    - **Session 1 — survey.** Inventoried all 8 modules' song lists (126
      Choice entries across 21 per-set lists), proposed a 4–5-keeper cull per
      module against appeal/skill-fit/diversity/no-duplicate-job criteria,
      confirmed Oye Mi Amor's retagged levels (M6: 2, M7: 3), found Just Like
      Heaven didn't exist anywhere in the codebase yet, and wrote the render
      spec. Output: `SONG_CULL_SURVEY.md` (now retired — full per-module
      keep/cut reasoning lives in this commit's diff and history).
    - **Spanish-slots addendum.** Jonathan set a new rule — at least one
      Spanish-language Choice song per module 2–8. Modules 4/6/7/8 already
      had one (La Bamba · Oye Mi Amor + Tu Boda ×2 · Tu Boda); Modules 2, 3,
      5 had none. Added La Bamba (swap for Eye of the Tiger, M2), De Música
      Ligera (swap for Should I Stay or Should I Go, M3 — corrected from a
      2-chord guess to the real Bm–G–D–A riff), and Ella Baila Sola (swap for
      Hey Jude, M5), all oEmbed-verified.
    - **Session 2 — build.** Jonathan approved the survey as-written (no
      markup). Data layer: added a `MODULE_SONGS[N]` global per module
      (mirroring the existing `MODULE_REVIEWS[N]` pattern), migrated every
      Core/Supp song + the approved 5 Choice keepers into it, deleted the
      old per-set `songs:` arrays. Just Like Heaven was added to Module 8 —
      since it had to land as a straight swap (5 songs, not 6) and "Nothing
      Else Matters" (the instructed swap target) turned out not to be one of
      Module 8's 5 keepers, Hallelujah was dropped instead (same "moody
      arpeggiated ballad" job as JLH; Hallelujah remains a keeper in Module
      5). UI layer: new `buildModuleSongs()` renders each module's list as a
      collapsible section (closed by default) reusing the existing Station
      B/C collapse mechanism and song-card markup; also fixed a latent crash
      (`buildSongs` was still called unconditionally on the now-removed
      per-set `songs:`, which would have broken every module 2–8 on open).
      Teacher view never rendered songs before or after — no change needed
      there. Verified live in-browser (all 8 modules, zero console errors);
      `checks.mjs` passed with 145 reachable links (down from ~240 — expected,
      fewer redundant per-set duplicates). 3 quiz distractor swaps (m6
      reggae · m7 stacked-TAB pair · m2 H→G#) reviewed, none marked for
      revert — left as-is.
    - **🎤 Class-request slot — added, then removed same day.** The build
      originally included a data-driven "🎤 Class request" entry per module
      (2–8), mirroring Module 1's older static request prompt. Jonathan asked
      for it removed shortly after. ✅ 2026-07-09: pulled the entry from all
      7 module files plus the now-dead render branch in `buildModuleSongs()`;
      left Module 1's original, separate `buildSongs()` request row (June
      2026, `72eeeca`) untouched — Jonathan scoped the removal to Modules
      2–8 only. `checks.mjs` passed.
- [ ] **Luna requinto intro TAB** — transcribe from Jonathan's uploaded
      official tab (Layer 2 stretch + M2 levelUp). Blocked on: tab file
      provided in-session.

## Jonathan — manual, before course start

- [ ] ⚠️ Watch Module 4 Set 1's video (`m_IiyJu60-c`, "Major Pentatonic
      Scale – Marty Music") through; confirm it fits the beginner Pattern-1
      station.
- [ ] Spanish spot-check: review 2–3 sets in Español mode with a fluent
      speaker.

## Recurring each semester

- Song refresh: swap in 2–3 student-requested songs (verify links per
  CLAUDE.md).
