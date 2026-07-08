# LOOPER_SPEC — Backing-Track Looper (resource panel)

**Status:** Design spec, approved by Jonathan 2026-07-08. Becomes the source for
2–3 Claude Code build sessions. **Must-have live date: ~Sep 14, 2026** (nominal
Week 6 of the Aug 11 semester — two weeks before Unit 4's first backing-track
lesson, ~six weeks before the Unit 4 assessment). If the class calendar slips,
the real deadline is "before the first Unit 4 assessment is given."

**Why:** The locked Unit 4 assessment (original 4-bar solo) and the Module 5
semester-wrap Call & Response are both performed **over a backing track**, and
students currently get a bare YouTube embed — no looping a section, no speed
control, seek-bar fiddling during a graded performance. The looper fixes that.

**Approved design decisions (2026-07-08):**
- Lives in the existing right-side **resource panel** (new `loadPanel` type) —
  launched from the ▶ 🎵 Backing track buttons in place of the plain embed
- **Teacher presets + student A/B** loop points
- v1 extras: **slow-down (0.5× / 0.75× / 1×)** and **save my loops (Firestore)**
- Explicitly declined: count-in click (out of scope, v1 and beyond unless re-raised)

---

## 1 · Placement & launch points

The site already routes videos into `#resource-panel` via
`loadPanel(type, url, title, subtitle)` (app.js ~L2256), with types `youtube`,
`pdf`, `gdoc`, `chord`, `string`, `note`. Add a new type: **`looper`**.

- **Backing-track buttons** on song cards (the ▶ 🎵 button wired to each card's
  `backingUrl`) switch from `loadPanel('youtube', …)` to `loadPanel('looper', …)`.
  `originalUrl` and `tutorialUrl` buttons keep the plain `youtube` type in
  Phase 1 (see Phase 3 option).
- **No step-copy changes needed:** Module 4's assessment step and Module 5's
  Call & Response step already instruct "hit ▶ 🎵 Backing track on a core-song
  card" — those same buttons now open the looper.
- The panel header's existing **"Open in new tab"** link keeps pointing at the
  plain YouTube watch URL (the escape hatch if the looper ever misbehaves on a
  school Chromebook).
- Panel-width/resize behavior, empty state, and close button: unchanged — the
  looper is just new `rp-content` like the chord diagrams.

## 2 · UI (inside the resource panel)

Top-to-bottom in the panel:

1. **Player** — YouTube IFrame API player (same 16:9 wrap style as `rp-youtube`).
   Loads **paused** (headphone norms; no autoplay surprise).
2. **Preset row** (only if the song card has `loops:` entries) — pill buttons:
   `Full track` (always present, implicit) plus each teacher preset by label.
   Tapping a preset sets A/B, enables loop, seeks to A, keeps current speed.
3. **Loop controls** —
   `[Set A]  A 0:00  −1s +1s   |   [Set B]  B 0:00  −1s +1s   |   Loop ⟳ on/off   |   ⏮ Jump to A`
   - Set A / Set B capture the current playhead.
   - Guard: if B ≤ A when loop is toggled on, flash the B chip and don't enable.
   - Loop off = normal playback of the full video.
4. **Speed row** — `0.5× · 0.75× · 1×` via `player.setPlaybackRate()` (YouTube
   preserves pitch). Default 1×. Speed persists across preset taps.
5. **My loops row** (signed-in students) — `💾 Save this loop` prompts for a short
   name and stores {A, B, speed}; saved loops render as pills next to presets,
   with a small ✕ to delete. Cap: **5 saved loops per video**; oldest-first
   prompt to replace when full. In **Dev bypass** mode the save button is hidden
   (consistent with existing no-Firestore behavior).

Teacher extra (only when `IS_TEACHER_MODE` / teacher email — reuse the existing
teacher gate): a small `Copy preset line` link that copies the current A/B as a
ready-to-paste module snippet, e.g. `{ label: 'Solo section', a: 63, b: 94 }`.
This is how presets get authored — by ear, in the looper, pasted into the file.

## 3 · Data

### 3.1 Teacher presets — new optional song-card field

```
loops: [ { label: 'Solo section', a: 63, b: 94 } ]   // seconds, ints ok
```

- **Optional** on any song card that has a `backingUrl`. Absent = looper still
  works, just no preset pills.
- **Preset times are authored by Jonathan only.** Claude Code must never invent,
  estimate, or transcribe loop times — same spirit as the no-YouTube-IDs-from-
  memory rule. Phases 1–2 ship `loops:` on **zero** cards. Phase 3 may
  *pre-stage* candidates from verified video chapter data (see Phase 3), but a
  `loops:` line only lands in a module file after Jonathan confirms the times by
  ear — the copy-helper is the confirm-and-adjust tool.
- checks.mjs: confirm the module validator tolerates the new optional field
  (it validates required fields; verify unknown/extra keys don't fail). If it
  validates strictly, extend the validator to allow `loops` with shape checks
  (array of {label: string, a: number, b: number, b > a ≥ 0).

### 3.2 Student saved loops — Firestore

Stored on the student's existing progress doc (same doc the check-ins and skill
state live on), under a new map keyed by video ID:

```
loops: {
  "<11-char videoId>": [ { n: 'chorus slow', a: 63, b: 94, r: 0.75 } ]
}
```

- Writes go through the existing save path/debounce conventions in app.js.
- Security: students already write only their own doc — no rule changes
  expected, but **verify against the current rules** (see
  `archive/FIREBASE_HARDENING.md` for the conventions) before assuming.
- Teacher dashboard: no changes — saved loops are private practice state, not
  progress data.

## 4 · Technical notes

- **YouTube IFrame Player API** (`https://www.youtube.com/iframe_api`), loaded
  lazily the first time a looper opens; single global ready-promise; reuse one
  `YT.Player` instance per panel load, destroy on `clearPanel()`.
- **Loop engine:** `setInterval` ~200–250 ms while playing; when
  `getCurrentTime() ≥ B` → `seekTo(A, true)`. Clear the interval on pause/close.
  (The API has no native A/B loop; polling is the standard pattern. A ±0.25 s
  loop seam is acceptable for practice use.)
- **New shell file `looper.js`** (+ small CSS additions in styles.css):
  - Add `<script defer>` to index.html alongside tuner.js/teacher.js.
  - Add to the `sw.js` cached-shell list → checks.mjs fingerprint auto-bumps.
- **No `skills:` changes anywhere** → `MODULE_MANIFEST` skillCounts untouched.
  If any session appears to need one, stop and flag.
- **Failure fallback:** if the IFrame API script fails to load (network filter,
  offline), render the plain `youtube` embed instead with a one-line notice —
  never a broken panel. If a `backingUrl` video is dead, that's a link-check
  (checks.mjs) problem, not a looper problem — flag, don't substitute.
- **No new YouTube IDs** are introduced by this feature — it only wraps existing
  verified `backingUrl` values.

## 5 · Build phases (one Claude Code session each; Sonnet ok for 1–2, opusplan for design-heavy bits)

- **Phase 1 — core looper (the Sep 14 must-have):** `looper` panel type, player,
  A/B + nudge + loop toggle + jump-to-A, speed row, fallback, sw.js/checks
  plumbing, backing buttons rerouted. No presets, no saves.
- **Phase 2 — saved loops:** Firestore schema, save/rename-cap/delete UI,
  dev-bypass hiding, rules verification.
- **Phase 3 — presets + teacher helper:** `loops:` field support, preset pills,
  validator tolerance, teacher `Copy preset line`, plus **chapter pre-staging**:
  for each of the six core-song `backingUrl` videos, pull any published
  chapter / description timestamps from the video's own page data (the verified
  Session-4 pattern — **never estimated, never from recall**) and deliver a
  per-song candidate list (e.g. "video marks *Solo* at 1:03") for Jonathan to
  ear-check in the looper. Videos with no chapters simply get no candidates.
  Candidates are proposals only — **no `loops:` line ships until Jonathan
  confirms or adjusts the times by ear** (bar-aligned loop points are a musical
  call the metadata can't make).
  *Optional (Jonathan to decide):* route `tutorialUrl` videos through the looper
  too — slow-down + section looping on lesson videos is nearly free once Phase 1
  exists.

Each phase ends with: greps (no skills diffs, no new YouTube IDs),
`node tools/checks.mjs`, Live Server check with Jonathan, CHANGELOG entry
(Phases 1 and 3 are student-facing), then "push to GitHub."

## 6 · Out of scope (v1)

Count-in click, metronome sync with the track, audio download/offline tracks,
waveform display, any recording (excluded course-wide by design).

## 7 · Acceptance (Phase 1)

- From Module 4, tapping ▶ 🎵 on a core-song card opens the looper in the right
  panel, paused, with the correct video.
- A student can set A and B mid-video, enable loop, and the track cycles the
  section indefinitely at 0.75× without touching the YouTube seek bar.
- "Open in new tab" still opens the plain YouTube page.
- Panel close fully tears down the player (no audio ghosting).
- Works on a Chromebook in the classroom network.
- `node tools/checks.mjs` passes; SW fingerprint bumped; no skillCount drift.
