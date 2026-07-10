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

- [~] **Semester 2 build — Modules 9–12** (`MODULES_9_12.md`, decision-complete
      spec, four sessions A–D). Session A ✅ 2026-07-10: built **Module 9 —
      The Full Fretboard & Writing TAB** (3 sets, 18 skills — naturals on D/G,
      naturals on B/high-e + the B-string bump, higher-position TAB reading +
      writing your own TAB, slash chords). Added all four Module 9–12 rows to
      `MODULE_MANIFEST` in this session (confirmed `checks.mjs` only *warns*,
      doesn't fail, on a manifest row with no matching Sets yet — so no stub
      files needed; later sessions just add their module file). Rewrote
      `MODULE_REVIEWS[8].forward` (was "everything from here is just
      songs," no longer true). oEmbed-verified all 3 reused videos; 2
      VIDEO-TODO placeholders left for Jonathan (B-string octave-shape demo in
      m9w2, writing-TAB demo in m9w3). Two Choice-song slots from the spec
      doc couldn't be filled — "La Diabla" and "American Girl" don't exist
      anywhere in the repo (grepped all module files) — dropped per the doc's
      own never-invent-a-URL rule; Module 9 ships with 3 Choice songs instead
      of 5, and the doc's assumed Spanish Choice slot (La Diabla) is empty.
      Also corrected a stale filename in the doc (`tabs/sweet-child.html` →
      the real `tabs/sweet-child-o-mine.html`), and substituted a real
      existing video-tutorial reference for m9w1's "Take It to a Song" step
      since no up-the-neck intro-riff TAB actually exists yet on that Journey
      page to reuse (out of scope to add one — Journey pages are frozen).
      `checks.mjs` passed (145 links, 3 expected warnings for Modules 10–12
      not yet having Sets). Live-Server browser verification was **not**
      performed (no running dev server in this environment) — Jonathan may
      want to spot-check visually. Session B ✅ 2026-07-10: built **Module 10 —
      Scales, Keys & Ear Training** (3 sets, 18 skills — the W-W-H major-scale
      recipe, relative/parallel minor, the blues scale, transposing box 1,
      major-vs-minor ear training). Manifest row for Module 10 already existed
      from Session A. oEmbed-verified 3 video IDs; the JustinGuitar EXTRACT-tier
      lesson page (major-scale-why-and-how-sc-202) is behind a Cloudflare bot
      challenge that blocks `curl` outright (`cf-mitigated: challenge`, no
      header combination got past it) — fell back to a VIDEO-TODO placeholder
      per the doc's tier-3 protocol. Also dropped the doc's [VERIFY-THEN-USE]
      Marty blues-scale candidate (`qwI_-x-QE1c`, "Ultimate E Blues Scale
      Run") to a VIDEO-TODO — it oEmbed-verified fine but reads as a fast lick
      showcase, not a beginner concept intro, so it failed the doc's own
      too-advanced judgment call. One Choice-song slot from the spec doc
      couldn't be filled — "good 4 u" doesn't exist anywhere in the repo
      (grepped all module files) — dropped per the never-invent-a-URL rule;
      Module 10 ships with 4 Choice songs instead of 5, but the Spanish slot
      (Ella Baila Sola) *was* found in module-5.js and is intact.
      `checks.mjs` passed (145 links, 2 expected warnings for Modules 11–12
      not yet having Sets). Live-Server browser verification **not**
      performed (no running dev server in this environment). Session C ✅
      2026-07-10: built **Module 11 — Chords, Keys & Harmony** (3 sets, 18
      skills — triads & Roman numerals incl. Luna's F–Am as I–iii, finding a
      song's key from its chord inventory, slash chords, movable E-shape/
      A-shape barre chords as harmony tools, I–IV–V in any key). Manifest row
      for Module 11 already existed from Session A. The doc's EXTRACT-tier
      "How to Find Guitar Chords in a Key?" lesson page hit the same
      Cloudflare bot-challenge wall Session B found (`curl` 403,
      `cf-mitigated: challenge`) — both m11w1 video slots fell back to
      VIDEO-TODO placeholders per the tier-3 protocol; m11w2's video slot did
      the same, with its optional second slot filled by reusing the
      already-verified Watchtower listen clip (`bT7Hj-ea0VE`) as a
      "listen and decide by ear" step instead of leaving it empty. Three
      Choice-song slots from the spec doc couldn't be filled — "No Se Va,"
      "American Girl," and "good 4 u" don't exist anywhere in the repo
      (grepped all module files; the latter two were already confirmed
      absent in Sessions A/B) — dropped per the never-invent-a-URL rule;
      Module 11 ships with 2 Choice songs instead of 5. Also substituted
      Watchtower's Am–G–F loop (vi–V–IV in C) for the doc's "Take It to a
      Song" step in m11w2, since it originally pointed at the now-dropped
      "No Se Va." All chord-diagram specs (C/Dm/Em/F/G/Am/D/Bm, the G/B slash
      chord, and the F/Bm barre shapes) were copied byte-identical from
      module-5.js, module-8.js, and module-9.js rather than retyped.
      `checks.mjs` passed (145 links, 1 expected warning for Module 12 not
      yet having Sets). Live-Server browser verification **not** performed
      (no running dev server in this environment). Session D (Module 12)
      still open.
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
- [x] **Luna requinto intro TAB** — transcribed from Jonathan's uploaded
      official tab/chord chart. ✅ 2026-07-10 (`840424f`). Also caught and
      fixed a chord error the docs surfaced: the site taught "Dm–C in the
      chorus," but the official chart has no C chord at all — Luna is F–Am
      throughout with Dm only a brief passing chord near the end of the verse
      and in the closing bridge. Corrected across Module 5's Luna challenges
      and the Song Journey page; added the intro riff as a new bonus Layer 6
      (rolled arpeggio through the Layer 5 little-F shape) rather than
      folding it into Layer 5, so each layer still teaches one new tool.

## Jonathan — manual, before course start

- [ ] ⚠️ Watch Module 4 Set 1's video (`m_IiyJu60-c`, "Major Pentatonic
      Scale – Marty Music") through; confirm it fits the beginner Pattern-1
      station.
- [ ] Spanish spot-check: review 2–3 sets in Español mode with a fluent
      speaker.
