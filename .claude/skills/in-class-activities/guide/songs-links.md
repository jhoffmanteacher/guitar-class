# Songs page rows, Play Along now, Play-along first

**Each Core song row links its whole-song practice card** (Jonathan,
2026-10-05). The Core list is the only place: no section listing part cards
atop the Songs page ("too much going on").
- A Core song is a **tile** since Look 1, Part 3 (Jonathan, 2026-11-17;
  `songsCoreActsHtml`, three to a row, `.sh-core-grid`): a colour block
  (decoration), the title and the artist (its name split at " — "), ONE main
  button, **Play Along** when `songsPlayAlongCard()` finds a card at that
  moment, otherwise **Song Journey**; under it, small, **Backing track for
  solos** and (only beside Play Along) **Song Journey**. Never two main
  buttons, never a Play Along that opens nothing (checks.mjs **1es**,
  `tools/smoke.mjs` `songTilesWalk`). The rows' old lesson notes ("Listen —
  the riff…") are not on the tiles. No Tutorial or Original on Core tiles
  (Choice rows keep theirs). "More Play Along songs" is one wrapping row of
  buttons, ▶ and the song's name, each through `songsLibraryOpen` (the
  song-open count, 1ch). "Request a song" sits in the page's top bar.
- `CORE_FIRST` (Seven Nation Army, Watchtower, "the cure") leads; the rest
  are alphabetical.
- Play Along opens the song's `view: 'card'` activity with `card.wholeSong`
  whose `journey:` matches the row's Journey slug, once it passes
  `caIsVisible()` or `caIsPlayAlongOnly()`. When two pass (roots and
  power-chord), the newest (highest board `#N`) wins.
- A song with no such card shows **no** Play Along link (Jonathan's call — no
  greyed placeholder). Part cards are not on the Songs page at all.
- **A tap opens the card where it lives** (`songsHubOpenCard()` →
  `goExploreHash('class-activities/<id>')`); Back returns to Songs. Don't
  render the card a second time on the Songs page: the `pc*` engine and the
  open-card state (`caOpenId`, `caSyncHash`, the sticky bar) belong to
  In-Class Activities.
- `songsPlayAlongBtn(slug)` builds the Play Along button; a tile's buttons
  sit in a `.sh-play-slot` with `data-idx`, and `refreshSongsPlayAlong()` (end
  of `loadClassConfig()`) refills only the changed slots through
  `songsCoreActsHtml` when the board or dates land late.
- Songs stays a gated page.

**One way round the date: "Play Along now"** (Jonathan, 2026-10-02). Every
assigned practice card on the board has a **Play Along by date / Play Along
now** switch (`teacherSetActivityPlayAlong`, cell-checked write to
`config/class.playAlongActivities`, `{ id: true }`).
- "Now" lets the card be opened from the Songs page without a release date.
  Only a whole-song card has a Songs link, so on a part card it does nothing a
  student can reach.
- It changes **nothing else**: `caIsVisible()` and the three blocker rules do
  not read the map, so the card stays off In-Class Activities and never blocks.
- `caIsPlayAlongOnly()` in `app/activities-2.js` is the one predicate: practice card, flag
  on, assigned, not Hidden, not retired, and NOT already visible. Readers:
  `songsPlayAlongCard()` (the Core row link), `caFocusActivity()` (so the tap
  opens it instead of "not posted"), and `renderClassActivities()`, which
  renders that ONE card under the Songs section's title **only while it is the
  open card**.
- Don't fold the flag into `caIsVisible()`: that would put the card on
  In-Class Activities and behind the gate. Jonathan chose this over "date it
  and mark it Optional" and "list every assigned card".
- Cached as `caPlayAlong`. Delete clears the flag, Archive keeps it.

### Play-along first; Song Journey pages are the back door (2026-10-06)
**One rule for every link to a song: if students can open a play-along
(whole-song) card for it, the link opens that card; if not, it opens the Song
Journey page.** `songsPlayAlongCard()` works it out from what Jonathan has
released or set to "Play Along now" — no list to maintain. The play-along
cards cover Layer 2 (single notes) and Layer 3 (power chords) only; the
Journey pages also hold Layers 4–5 and the bonus layers.

| Door | Behaviour |
|---|---|
| "Take it to a song" box, Modules 1–5 | **switched off 2026-10-18** (`TAKE_TO_SONG_ENABLED = false`, see below); when on, one button per song via `openSongLink(slug, layer)` |
| "About this set" song names | links; same `openSongLink` |
| A skill about one core song (checklist row) | `journey: [{ song, layer }]` on the skill → "Open the \"Luna\" Song Journey page" under it (`skillJourneyHtml()` in buildChecklist); same `openSongLink`. 14 skills in Modules 4 and 9–12 (1ab3 pins 14 / 16) |
| Songs page Core tile | ONE main button: Play Along (only with an openable card) or else Song Journey; Backing (and Song Journey beside Play Along) small under it |
| Songs page "More Play Along songs" | every `library: true` practice card, for the WHOLE class, from the day it ships — no board slot, date, #N or "Play Along now"; Who does not hide it (`caIsLibrarySong()`). A song one student asked for reaches students this way; don't build a per-student path back. Off the board (`caBoardOrder` skips `caIsLibraryCard()`); managed in the console's **Songs** tab (`renderTeacherSongs()`). **Songs move both ways**: any non-check card with a `library` field (true = starts on Songs, false = in Class activities) is a song (`caIsSongCard()`); the console's Move to Songs / Move to Class activities buttons write `config/class.songLibrary` (id -> bool), which wins over the field, and the board slot is kept (not a BUILT song, below). **Never a Core song** — checks.mjs 1bq. **Built songs** (2026-11-14, `app/builtsongs.js`): a song Jonathan imports in the console (Manage → Built songs) is merged from the database after sign-in as an ordinary `library: true`, `optional: true` practice card with an `sb-` id; it shows its lyric lines whenever the chart has them (Jonathan: "lyrics always show if they are available": the "No lyrics" rule stays for every CODED card and every song added through `new-playalong`'s card mode); no Move to Class activities for an `sb-` id and `songLibrary` never moves one (`caIsLibraryCard`) until the board part is built (Part e); Hidden is its off switch |
| Teacher view songs (console tab) | `teacherOnly: true` cards (ca-40), played for the room; students never see one (`caBoardOrder` skips it) until **Move to Class activities** writes `config/class.classSongs[id]` and it joins the board as an ordinary activity (**Move to Teacher view songs** sends it back). No `journey`/`journeyLayer`/`library` on it — checks.mjs 1bn |
| Journey button on a card | never on a whole-song card; on another activity only while its song has no openable whole-song card (`caJourneyUrl()`) |
| Resume card song row | all six songs |
| The Journey page itself | open for every student (`JOURNEY_GATE_LOCKS = false`) |

**⚠️ "Take It to a Song" is gone from the module ladders (2026-10-18)**
(Jonathan: "remove take it to a song from the steps of the modules").
`const TAKE_TO_SONG_ENABLED = false;` in `app/shell.js`, beside
`isTakeToSongSection()`, is the whole switch: `visibleSteps()` and
`isRenderableSection()` hide every `kind:'take-to-song'` section in Modules
2–12 (the Journey card in 2–5, the Challenge steps in 6–12).
- **Switched off, not deleted**, the Daily 5 pattern: the section list is
  fixed in every rule-zero regime and each section counts toward its
  neighbours' `gi` (1af proves no key moved). They stay for good: module
  progress is never wiped (Jonathan, 2026-11-13: "modules do not reset for
  students unless i do it. everything else will reset"), and checks.mjs 1do
  pins every step.
- It knowingly reverses Jonathan's 2026-09-12 call to keep the 6–12 steps. Seven
  skills (m9w1-s5, m9w2-s5, m10w1-s4, m10w3-s6, m11w3-s6, m12w1-s6, m12w3-s6)
  lost their only teaching step and sit on the checklist with no "Show me
  where"; the console tags those steps "(retired)".
- 1af / 1ao / 1w-t read the switch via `readTakeToSongSwitch()`.
- **When the switch is on** (`true` restores all of this): the section's steps
  are replaced by one Journey card (`journeyLinkCardHtml()`, one button per
  song via `openSongLink(slug, layer)`: the whole-song card for this module's
  layer if students can open it, else `tabs/<slug>.html#layer-<n>`) **only
  when `journeySongsFor(moduleNum)` is non-empty** (Modules 1–5). With no
  layer (Module 6+) the section renders its OWN steps and heading. **⚠️ Don't
  re-simplify this to an unconditional swap**: those sections hold real
  Challenge cards. The rule lives in `visibleSteps()`, `isRenderableSection()`,
  `buildLesson()`'s `hasJourneyCard` branch (which also suppresses the
  heading) and 1af's own copy — update all together. A Module 6+ layer added to `JOURNEY_LAYERS` flips that
  module to the card automatically.
- **Songs now reach students from the skills, not the ladder** (`skill.journey`,
  table above; 1ab3). Modules 2, 3, 5 and 6 have no such skill; there the
  reach is the Songs page and "About this set". Attaching one is a content
  call: one `journey` field (module-2.js's schema comment).

**Layer matching:** a whole-song card carries `journey` + `journeyLayer` (2 on
ca-24–ca-28, 3 on ca-29–ca-33), so a Module 2 link finds the Layer 2 card and a
Module 3 link the Layer 3 card. Modules 1, 4 and 5 have no card for their
layer, so their links open the Journey page at `#layer-N`.
**The decision is made at the click**, not at render time: the class config
(dates, Play Along now) can land after the page holding the link was built.
Don't fold "Play Along now" into `caIsVisible()`.

The Journey-page decisions that go with this (whole-song tabs, no Stuck?/Level up folds, no per-song retire list) are in `.claude/rules/journey-pages.md`.
