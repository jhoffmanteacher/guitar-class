# LINK_THE_CURE.md — Wire up tabs/the-cure.html and retire the clean-edit guard

> **COMPLETED 2026-07-07.** All items done; page linked from all eight cards
> (plus an in-step M3 link), all nine guard comments removed, checks passed,
> pushed. Archived for the record.

> **Decision (Jonathan, 2026-07-07):** the "the cure" clean edit is NO LONGER
> NEEDED — the original recording is fine for class use. Two consequences:
> (1) the Song Journey page `tabs/the-cure.html` should be linked from its
> song cards like the other five songs (it currently has ZERO inbound links —
> it's orphaned); (2) all "lyric-review / clean edit pending" guard comments
> are obsolete and come out.
>
> **Scope check (verified chat-side, 2026-07-07):** no journey page for ANY
> song contains audio/video links — listening happens from the module cards'
> `originalUrl`, which "the cure" cards already have. So the page itself needs
> **no content changes**: this session is journeyUrl additions + comment
> removals only.
>
> **Rules:** All CLAUDE.md rules apply — plan first, one MC question before
> editing, `node tools/checks.mjs` before push, Live Server test with
> Jonathan, changelog entry, ✅ note in WORKFLOW.md, then move this file to
> `archive/`. No `skills:` changes anywhere → no `skillCount` bumps. No new
> YouTube IDs are needed (do not add any).

**Status legend:** [ ] not started · [x] done

---

## 1 · Add `journeyUrl` to the eight "the cure" cards  [x]

| File | Card activity | journeyUrl |
|---|---|---|
| module-1.js | Listen | `tabs/the-cure.html#layer-1` |
| module-2.js | Bassline single-note roots | `tabs/the-cure.html#layer-2` |
| module-4.js | Chorus solo (Am pent) | `tabs/the-cure.html#layer-4` |
| module-4.js | Verse solo | `tabs/the-cure.html#layer-4` |
| module-4.js | Full solo | `tabs/the-cure.html#layer-4` |
| module-5.js | Capo-1 play-along | `tabs/the-cure.html#layer-5` |
| module-8.js | Fingerpicked verse | `tabs/the-cure.html#layer-5` |
| module-8.js | Fingerpicked verse | `tabs/the-cure.html#layer-5` |

Layer-5 confirmed the closest fit for the fingerpicking cards (Open Chords —
same capo-1 Am/C/Dm/F shapes, fingerpicked instead of strummed).

**Optional (approved by Jonathan):** added an in-step Song Journey link to M3's
◐ "the cure as power chords" stretch step → `#layer-3` (layer-3 = power chords),
matching the Watchtower/Sweet Child pattern already in that module.  [x]

## 2 · Remove the nine obsolete guard comments  [x]

Removed: `tabs/the-cure.html` HTML guard block; card-level comments in
module-1, module-2, module-4 (×3), module-5; the module-5 play-along-step
comment; the module-3 stretch-step comment. `grep -rn "lyric-review\|clean
edit"` over `*.js`/`*.html` (excluding `archive/`) returns zero hits.

## 3 · Changelog (student-facing)  [x]

> ### Added
> - **"the cure" joins the Song Journey** — every "the cure" card now links
>   to its five-layer page, just like the other core songs, so you can see
>   the whole arc from listening to the capo-1 strum.

## 4 · WORKFLOW.md  [x]

Session ✅ note added under Current focus.
