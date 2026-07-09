# SONG_CHOICE_TOGGLE.md — "Take It to a Song" alternate-song toggle

**Repo:** `jhoffmanteacher/guitar-class` · **Model:** Sonnet
**Queue position:** run AFTER `SITE_FIXIT_JULY_2.md`, `SITE_FIXIT_JULY_3.md`, and
`LOOPER_REMOVAL.md` are complete, and ideally after the song-list review session
(pairings depend on the final song list). Do not run in parallel with anything —
this touches `app.js`, `styles.css`, multiple `module-*.js`, `sw.js`, `CHANGELOG.md`.

---

## Goal

Some "Take It to a Song" challenges should let a student choose between two core
songs at the same skill layer. A step may carry an optional `alt:` object; the
renderer shows two pill buttons (e.g. `🎵 Watchtower | 🎵 Let It Be`) and swaps the
challenge content. One step, one checkbox, one skills array, one Firestore key —
regardless of which song the student picks.

## Documented assumptions (Jonathan can veto)

1. **Purely additive.** No existing step is removed, merged, split, or reordered.
   `alt:` is only added to a step whose alternate song does NOT already have its
   own step in that same set's Take It to a Song section.
2. Alternate songs come from the **core six only**: Seven Nation Army, All Along
   the Watchtower, Sweet Child O' Mine, Luna, Let It Be, "the cure."
3. The alt variant sits at the **same layer** as the parent step (Unit 2 alt =
   single-note roots, Unit 3 alt = power chords, etc.).

## Hard rules (non-negotiable)

- **Never modify `id:` or `skills:` fields** anywhere. `skillCount` in
  `MODULE_MANIFEST` must not change (no skills are added).
- `alt:` never carries its own `skills:`, `id:`, or checkbox — those live on the
  parent step only.
- **Settled song facts** (do not "fix" these):
  - Watchtower loop = Am–G–F–G everywhere (bass roots A·G·F·G).
  - Sweet Child O' Mine = standard tuning on the site.
  - Luna: F–Am vamp plus Dm–C; 6/8 felt in 2 (teach two downbeat strums per
    bar, nothing syncopated); no capo — simplified F (xx3211) until Module 7's
    full barre; solos use D minor pentatonic Pattern 1 at fret 10; ◐ in Module
    3 (sierreño as power chords).
  - "the cure": capo 1, shapes Am–C–Dm–F–G/B; Unit 2 = single-note roots.
- **No new YouTube content.** Alt variants are text/tab/playSeq only. If a step's
  alt would genuinely need a video, skip that pairing and note it in the report.
- No `#layer-N` anchors on Song Journey links (they were stripped in
  SITE_FIXIT_JULY_2) — alt links point at the page top, e.g.
  `tabs/let-it-be.html`.
- Verify every `tab:`/`playSeq` MIDI number against pitch (E2=40, F2=41, G2=43,
  A2=45, C3=48, D3=50, etc.). No guessed frets.
- No time limits / time caps in alt text (self-paced class).
- `node tools/checks.mjs` before every push.

## Data contract

```js
{
  text: '…existing challenge, untouched…',
  hint: '…', stuck: '…', levelUp: '…',
  skills: [1, 2, 4, 5, 6],            // parent only — untouched
  tab: { /* existing */ },
  response: { /* existing — see response rule below */ },
  alt: {
    label: 'Let It Be',               // pill button text
    text: 'Challenge — …same voice: verb-first, "You\'ve got it when:" win line, 🧵 Song Journey link…',
    hint: '…≤2 sentences…',
    stuck: '…',
    levelUp: '…',
    tab: { caption: '…', notes: [ { string, fret, note, midi } ] },   // optional
    playSeq: { … },                                                    // optional
    responsePrompt: '…',              // optional — overrides prompt text only
    responsePlaceholder: '…'          // optional
  }
}
```

**Response rule:** the Firestore key and response `type` never change. If the
parent's `short` prompt is song-specific, the alt may override only
`prompt`/`placeholder` text via `responsePrompt`/`responsePlaceholder`. Never add
`alt:` to a step whose response is a keyed MC (`answer:`/`explain:`) unless the
question is song-neutral; if it isn't, skip the pairing.

**Content voice:** alt challenges follow the frozen template — named challenge,
verb-first, one sentence of *what*, "You've got it when:" win condition, *why*
in the hint, Stuck?/Level up present, 🧵 Song Journey link.

## Renderer spec (`app.js` + `styles.css`)

- When a step has `alt:`, render a pill pair above the challenge:
  parent song (derive label from a new optional `label:` on the parent, or
  default `'Original'` — prefer adding `label:` to the parent when adding `alt:`,
  e.g. `label: 'Watchtower'`).
- Clicking a pill swaps `text`, `hint`, `stuck`, `levelUp`, `tab`, `playSeq`, and
  response prompt/placeholder in place. Default view = parent song.
- The pill choice is UI state only — do NOT write it to Firestore, and do not
  reset the done-checkbox on toggle.
- Interactive tab/playSeq in the alt must be fully functional (clickable notes,
  audio) — reuse the existing render path, no forked code.
- Style: match existing pill/button language in `styles.css`; both variants
  readable on Chromebooks; no layout shift taller than the swapped content.
- `sw.js`: bump cache version.

## Sessions (run sequentially, checkpoint between each)

### Session 1 — Renderer + one pilot pairing — DONE (2026-07-09)
1. Implement the renderer per spec.
2. Pilot: **Module 2 → Take It to a Song → "Watchtower bass line"** step.
   Add `label: 'Watchtower'` and an `alt:` for **Let It Be** — bass roots of
   C–G–Am–F on the E & A strings at 60 BPM
   (C = A-str fret 3 midi 48 · G = E-str fret 3 midi 43 · A = E-str fret 5
   midi 45 · F = E-str fret 1 midi 41), with caption, win line, Stuck?/Level up,
   and 🧵 link to `tabs/let-it-be.html`.
   *(First verify Let It Be does not already have its own step in that set — if
   it does, use the nearest core song that doesn't.)*
3. Verify in headless Chrome: toggle works, checkbox persists across toggles,
   tab notes clickable in both variants, 0 console errors. Screenshot both
   states.
4. Push. **STOP — Jonathan reviews the pilot before Session 2.**

Shipped as `5336eed`. Actual Let It Be tab used the site's own canonical Layer 2
bass roots (C on A-str fret 3, G on E-str fret 3, A on open A-str fret 0, F on
E-str fret 1 — matching `tabs/let-it-be.html`'s Layer 2 diagram exactly) rather
than the fret-5-A placement sketched above. Also found and fixed a real bug:
the two variants render independent response inputs sharing one Firestore key,
so a `data-resp-key` sync was added to `onResponseChange`/`onStepMcSelect` in
`app.js` to keep an answer typed in either variant in sync across the toggle —
carry this forward, it's now part of the renderer, not optional.

### Session 2 — Pairing survey — DONE (2026-07-09), awaiting approval
Full sweep of every "Take It to a Song" section, modules 2–8 (Module 1 has
none). 28 core-six parent steps found; 22 ✅ recommended, 6 ❌ blocked or
not viable. **STOP — Jonathan approves/edits the rows below before Session 3.**

#### Module 2
| Set | Parent Song | Layer | Candidate Alt | Response Overridable? | Rec | Rationale |
|---|---|---|---|---|---|---|
| Set 1 | Seven Nation Army (chart-free) | 2 — single notes | Luna | Yes, no override needed | ✅ | Luna's own Layer 2 is also single-note bass roots (F·Am); Watchtower/Sweet Child O' Mine also viable if you'd rather spread songs differently |
| Set 2 | Watchtower bass line | 2 | Let It Be | — | ✅ **shipped** | Session 1 pilot, live in `5336eed` |
| Set 2 | Seven Nation Army, true pitch (A string) | 2 | — | — | ❌ | Challenge's premise (same riff, alternate string) has no documented equivalent for another core song — needs new content design, not a text swap |
| Set 2 | "the cure," root line | 2 | Sweet Child O' Mine | Needs `responsePrompt` override (names specific notes) | ✅ | SCoM's verse bass roots (D·C·G·D) cross E & A strings, same shape as "the cure"'s roots |
| Set 2 | Luna, bass roots | 2 | — | — | ❌ | Only Sweet Child O' Mine is unused in this set, and it's the stronger fit for "the cure" above — reusing it here duplicates content in the same set |

#### Module 3
| Set | Parent Song | Layer | Candidate Alt | Response Overridable? | Rec | Rationale |
|---|---|---|---|---|---|---|
| Set 1 | Seven Nation Army | 3 — power chords | Watchtower | Yes, song-neutral | ✅ | Watchtower's Am–G–F–G loop is already this module's whole-class assessment riff |
| Set 2 | Watchtower | 3 | Sweet Child O' Mine | Yes, song-neutral | ✅ | SCoM's D5–C5–G5 verse power-chord loop already documented in song list |
| Set 2 | "the cure" (◐ optional stretch) | 3 ◐ | Let It Be | Yes, song-neutral | ✅ | Let It Be's own Layer 3 is also marked ◐ optional/stretch — same spirit |
| Set 2 | Luna | 3 | Seven Nation Army | Yes, song-neutral | ✅ | SNA's Layer-3 riff/tab already exists verbatim in this module's Set 1 step |

*Cross-module note: Set 1's SNA→Watchtower and Set 2's Watchtower→SCoM are a reversible pair — not a hard conflict (different Sets) but worth a variety check at build time.*

#### Module 4
| Set | Parent Song | Layer | Candidate Alt | Response Overridable? | Rec | Rationale |
|---|---|---|---|---|---|---|
| Set 1 | Seven Nation Army | 4 — pentatonic solo | Let It Be | Yes, song-neutral | ✅ | Let It Be's Layer 4 (Pattern 1 @ 5th pos., home C) unused elsewhere in this set |
| Set 1 | Watchtower | 4 | "the cure" | Yes, free-text reflection | ✅ | "the cure" Layer 4 is Am pentatonic — same pattern shape, different root |
| Set 1 | Luna | 4 | Sweet Child O' Mine | Yes, song-neutral enough | ✅ | SCoM Layer 4 confirmed (E minor pentatonic), unused elsewhere in this set |
| Set 2 | Sweet Child O' Mine | 4 — dynamics/register solo | Watchtower | Yes, song-neutral | ✅ | Watchtower has a matching Layer 4, not used in this set's section |
| Set 2 | "the cure" | 4 (implied — no Journey link on this step) | Seven Nation Army | Yes, song-neutral | ❌ | Pre-existing content gap: this step is missing its own `tabs/the-cure.html` Song Journey link — fix that first, independent of this feature |

#### Module 5
| Set | Parent Song | Layer | Candidate Alt | Response Overridable? | Rec | Rationale |
|---|---|---|---|---|---|---|
| Set 2 | Let It Be | 5 — open chords, verse | — | — | ❌ | **In-class assessment piece** — must stay fixed, no alt |
| Set 2 | Watchtower | 5 — campfire loop | Seven Nation Army | Needs `responsePrompt` override | ✅ | Both have a matching Layer 5 "Open Chords" page, near-identical campfire loop |
| Set 2 | "the cure" | 5 — capo-1 play-along | Sweet Child O' Mine | Needs `responsePrompt` override | ✅ | SCoM's Layer 5 is D–C–G, no capo — same campfire pattern |
| Set 3 | Luna (vamp) | 5 | Watchtower | Already song-neutral | ✅ | Set 3's own song list already tags Watchtower "open-chord version" at this layer |
| Set 4 | Luna (showcase) | 5 — full-song showcase | Watchtower | Prompt neutral, only placeholder needs a tweak | ✅ | Not the locked assessment piece (that's Set 2's Let It Be) — Watchtower already listed in this Set |

*Note: Watchtower proposed as alt in both Set 3 and Set 4 — different Sets, likely fine, flagging for awareness.*

#### Module 6
| Set | Parent Song | Layer | Candidate Alt | Response Overridable? | Rec | Rationale |
|---|---|---|---|---|---|---|
| Set 1 | Watchtower ("strummed for real") | 5 — open chords + strum | Let It Be | No response field | ✅ | Let It Be's Layer 5 page already cites the exact down-up 8th-note strum as a level-up; C·G·Am·F roots reused from Session 1 pilot |
| Set 3 | Watchtower ("two ways: folk vs. rock") | 5 — strum contrast | — | — | ❌ | Challenge is historically specific to Watchtower's Dylan-folk-vs-Hendrix-rock story — no equivalent dual-interpretation exists for another core song |

*Set 2 has no core-six rows — its two songs (I'm Yours, Oye Mi Amor) aren't part of the six-song thread despite local `Core`/`Choice` tags.*

#### Module 7
| Set | Parent Song | Layer | Candidate Alt | Response Overridable? | Rec | Rationale |
|---|---|---|---|---|---|---|
| Set 1 | Seven Nation Army ("the real rhythm") | Barre chords / rhythm notation | Watchtower | Yes, song-neutral | ❌ | Needs a newly authored, verified real-record rhythm TAB — real research effort, not a mechanical pairing |
| Set 2 | Sweet Child O' Mine ("one-shape verse," Module 7 finale) | Barre chords (E-shape slide) | Luna | No response field | ✅ | Luna's full-barre-F graduation already documented in this Set's `songs:` list and CLAUDE.md settled facts. Caveat: `tabs/luna.html` has no barre-chord layer yet — link still works (page-top only) but won't land on a matching section |
| Set 3 | Watchtower ("no open chords") | Barre chords, full-song | Let It Be | Needs `responsePrompt` override (names Watchtower) | ✅ | Let It Be's C–G–Am–F converts to barre shapes exactly like Watchtower's Am–G–F |
| Set 3 | Luna ("full barre F") | Barre chords, single chord | Let It Be | No response field | ✅ | Let It Be's F is also commonly taught as "little F → full barre F," same graduation story as Luna |

*Conflict: Let It Be is proposed as alt for both Set 3 rows above — same song, same section, two different parent steps. Not a rule violation (the additive rule only blocks an alt song that already has its OWN step in that section), but pick one or keep both — your call. Oye Mi Amor's "full barre Bm" step was skipped (Choice song, not core six).*

#### Module 8
| Set | Parent Song | Layer | Candidate Alt | Response Overridable? | Rec | Rationale |
|---|---|---|---|---|---|---|
| Set 1 | "the cure" (p-i-m-a "first touch," Am→C) | Fingerpicking, single-chord intro | Let It Be | No response field | ✅ | Let It Be's chord set (C-G-Am-F) already includes Am and C — same drill drops in with settled chords |
| Set 2 | "the cure" (p-i-m-a-m-i pattern, Am→C→F) | Fingerpicking, 6-note pattern | Watchtower | Needs `responsePrompt` override | ✅ | Watchtower's settled Am-G-F-G progression gives a comparable 3-of-4-chord subset to fingerpick |
| Set 3 | Let It Be (full 4-chord fingerpicked verse) | Fingerpicking, full progression | "the cure" | No response field | ✅ | "the cure" progression already proven fingerpickable elsewhere in this module (Sets 1–2) |

*Set 3's "Perform It" assessment step was excluded — student already freely picks their own song there. Cross-cutting note: none of the six core songs' Song Journey pages actually have a dedicated Fingerpicking layer — Module 8's "Layer N of N" link text is a module-internal label only (links land at page-top, no anchor, per the existing no-anchor rule), so "same layer" is read loosely for this module.*

#### Open questions — resolved by Jonathan (2026-07-09)
1. **Module 7 Set 3** (Let It Be proposed as alt for both the Watchtower step and the Luna step): **keep both.** Not a rule violation — different parent steps, same alt song, is fine.
2. **Module 2 Set 2** (only Sweet Child O' Mine was open to pair, better fit for "the cure" than for Luna): **leave Luna unpaired** in this set. Sweet Child O' Mine stays paired with "the cure" as surveyed.
3. **Pre-existing gaps surfaced, not caused by this feature** — fix separately or fold in during Session 3: Module 4 Set 2's "the cure" step is missing its own Song Journey link; `tabs/luna.html` has no barre-chord layer section yet (Module 7 alt link still works, just lands at page-top).

**Session 2 is fully approved.** Session 3 builds all 22 ✅ rows above (skip the 6 ❌ rows and the two ❌-flagged pre-existing gaps, which are separate cleanup).

### Session 3 — Build approved pairings
1. Add `alt:` (+ parent `label:`) for each approved row only.
2. Verify each in headless Chrome (toggle, audio, 0 console errors).
3. `node tools/checks.mjs` → push.
4. `CHANGELOG.md` student-facing entry ("Some song challenges now let you pick
   between two songs").
5. `CLAUDE.md` settled-facts entry: the `alt:` contract (additive-only, no
   skills/id changes, UI-state-only toggle, core-six pool).

## Out of scope
- Module 4 backing-track cards / `backingKey` (looper-removal territory) — no
  alt toggles there in this pass.
- Choice/supplemental songs (Tu Boda, Oye Mi Amor) as alt variants.
- Persisting the student's song pick to Firestore.
