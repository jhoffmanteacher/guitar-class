# SONG_SWAP.md — Course Song Thread Replacement Plan

> **Decided 2026-06-11 (chat session with Jose).** "Vampire" (Olivia Rodrigo) is removed
> from the course song thread — it lives in F major with B♭/B♭m, is piano-driven, and
> shifts feel mid-song, so it never threaded cleanly across the 8 modules.
>
> **The new thread (6 songs total):**
> 1. Happy Birthday *(unchanged)*
> 2. All Along the Watchtower — Dylan / Hendrix *(unchanged)*
> 3. **"Stand By Me" — Ben E. King** *(play in G: G–Em–C–D)*
> 4. **Core Song 2 — TBD** *(Jose is picking a new current/Spanish song; DtMF was dropped 2026-06-12. Fills the genre-listening / minor-pentatonic / strum-loop slots — see notes)*
> 5. **"Tu Boda" — Oscar Maydon × Fuerza Regida** *(current · Spanish · sierreño)*
> 6. **"Sweet Child O' Mine" — Guns N' Roses** *(classic rock · verse D–C–G)*
>
> Plus **"Sailor Song" — Gigi Perez** *(current · indie · fingerpicked)* joining as a
> Core song in Modules 1 and 8, and **"House of the Rising Sun"** staying Core in
> Module 8 exactly as it is today.
>
> **How to use:** one session = one lettered item below. Start a session with
> "do Session A in SONG_SWAP.md." All CLAUDE.md rules apply — especially:
> **never write a YouTube ID from memory; search-and-verify via oEmbed first.**
> The Module 2 example edit in Session B was voice-approved by Jose on 2026-06-11 —
> match its voice everywhere. For any other session that changes step text, show ONE
> complete example for approval before writing the rest. End every session: Live Server
> test with Jose → push → check the box.

**Status legend:** [ ] not started · [~] in progress · [x] done

---

## Global rules for every session

- **Links:** every `originalUrl` / `tutorialUrl` must be verified via the oEmbed
  endpoint before it's written to a file (CLAUDE.md workflow). Note: oEmbed was
  unreachable from the claude.ai chat where this plan was drafted — it works from
  Claude Code's WebFetch. Build the verified-link table in Session A and reuse those
  exact IDs in Sessions B–E.
- **Keys & chords:** before writing any `tab:` or `chords:` for Core Song 2, Tu Boda, or
  Sailor Song, confirm the actual key and progression from the verified tutorial
  video (watch/skim it — don't trust chord sites alone). Sweet Child verse = D–C–G
  (confirmed) and Stand By Me is taught in G (G–Em–C–D, transposed from the
  original A) — both safe to draft from.
- **Sweet Child tuning note:** the recording is tuned a half-step down (E♭ standard).
  Class plays in STANDARD tuning with the D–C–G shapes — never retune school guitars.
  Every Sweet Child step that suggests playing along with the original gets one hint
  line: *"the record is tuned a half-step lower, so your notes will sound slightly
  higher than the recording — that's normal."* Verified 2026-06-11: the existing
  tutorial ID `t3yol_zrt7g` is JustinGuitar's INTRO-RIFF lesson (ST-376), taught in
  E♭ — wrong lesson for the chord/strum thread. Session A must find a beginner
  **chords/strumming tutorial taught in standard tuning** (skim the video to confirm
  tuning — don't trust the title). Keep `t3yol_zrt7g` and repurpose it as the link
  for the Module 7 🌶️ intro-riff stretch-goal step, where tuning down is part of
  the challenge.
- **Tu Boda lyric check:** ✅ **CONFIRMED by Jose 2026-06-12** — classroom-appropriate, cleared to ship.
- **Core Song 2 (TBD):** DtMF was dropped 2026-06-12; Jose is choosing a replacement
  current/Spanish song. **Before Sessions B/D/E can write its slots, the picked song
  needs a mini Session-A pass:** find + oEmbed-verify its `originalUrl` / `tutorialUrl`
  and confirm its key/progression from the tutorial video. It must fit these roles:
  M1 genre-listening (find the guitar in the mix), M4 S2 minor-pentatonic improv,
  M5 S1–S2 full-chord strum loop, M6 S2 syncopated strum (feeds the WORKFLOW.md 3.5
  redesign). Until it's picked, all "Core Song 2" slots stay as placeholders.
- **Vampire removal:** `grep -i vampire` (and `Olivia Rodrigo`) across `module-1.js`
  … `module-8.js`. Every hit is either a songs-array entry (swap it per the slot
  table) or step text / assessment text mentioning a Vampire backing track or riff
  (rewrite to the new song for that module). Default = remove Vampire entirely.
  (Alternative if Jose changes his mind: demote to a ●●● Choice song in Module 5
  only.)
- **Difficulty dots & 🎤 slot:** when touching a songs array, this is a free moment
  to apply WORKFLOW.md Session 3.9's ●/●●/●●● dots to Choice songs in that file.
  Optional, not required.
- Backward-compatible, vanilla JS, CSS variables only, test narrow widths.

---

## Slot assignment table (the map)

| Module | Vampire's old role | Replacement |
|---|---|---|
| M1 | Listen & identify guitar sounds (Sets 1–2) | **Core Song 2 (TBD)** in Set 1 (genre-listening — find the guitar in the mix); **Sailor Song** in Set 2 (fingerpicked vs. strummed listening) |
| M2 | Identify intro bass notes (S1) · bonus riff `tab:` (S2) | **Stand By Me** in Set 1 (identify the famous bass line on E & A); **Sweet Child** verse bass roots as the Set 2 bonus riff (approved example below) |
| M3 | Chorus power chords (S2) | **Sweet Child** — D5–C5–G5 verse loop |
| M4 | Pentatonic solo slots (S1–S3) + backing-track step text | **Sweet Child** (G major / E minor pentatonic over D–C–G) in Sets 1 & 3; **Core Song 2 (TBD)** (minor pentatonic) in Set 2. Rewrite the S3 "perform over the Watchtower or Vampire backing track" step → "Watchtower or Sweet Child" |
| M5 | Full chord strum (S1, S2, S4) | **Core Song 2 (TBD)** loop in Sets 1–2; **Stand By Me** promoted to Core in Set 3 (it IS the Group 1↔2 cross-group lesson — currently a Choice song there); **Sweet Child** as a Set 4 showcase Core option |
| M6 | D-DU-UDU on verse (S2) | **Core Song 2 (TBD)** (syncopated strum — also feeds the Module 6 advanced-strumming redesign, WORKFLOW.md 3.5); **Tu Boda** added to Set 3's style lineup as the corrido strum alongside folk/rock/reggae |
| M7 | Barre-chord song (S2, S3) | **Sweet Child** promoted from Choice to Core (D–C–G as barres); add a 🌶️ Level-up: the famous intro riff as the late-semester stretch goal. **Tu Boda** barres in Set 3 |
| M8 | Fingerpick the verse (S1–S3) | **Sailor Song** as the new fingerpicked Core (its verse is genuinely picked); **Tu Boda** (sierreño picking) in Set 2 or 3. House of the Rising Sun stays Core unchanged |

---

## [x] Session A — Find + verify every link (no file edits)

Build the verified-link table below. For each song: search for the official
original video and one good beginner tutorial (JustinGuitar / Marty Music / Andy
Guitar–tier), then verify each ID via oEmbed (batch in parallel). For Sweet Child,
the tutorial must be a **chords/strumming lesson in standard tuning** (see global
rule — the existing `t3yol_zrt7g` is the E♭ intro-riff lesson; reuse it only for
the Module 7 stretch goal). Also re-verify the existing IDs this plan reuses:
Sweet Child original in `module-7.js` (`1w7OgIMMRc4`) plus the riff lesson
(`t3yol_zrt7g`), Stand By Me in `module-5.js`/`module-6.js`
(`hwZNL7QVJjE` / `TXLElO_YYiY`), House of the Rising Sun in `module-6.js`/
`module-8.js` (`N4bFqW_eu2I` / `mWJ6oRTyjnE`).

*All IDs verified via oEmbed on 2026-06-12.*

| Song | originalUrl (verified) | tutorialUrl (verified) |
|---|---|---|
| Stand By Me | `https://www.youtube.com/watch?v=hwZNL7QVJjE` — *Ben E. King – Stand By Me (Audio)* (existing ID, still live; reupload channel "Soulful Sounds" — fine but swap for an official if it ever 404s) | `https://www.youtube.com/watch?v=TXLElO_YYiY` — *Good Guitarist, "Easy 4-Chord Song, No Capo"* (existing ID, standard tuning) |
| ~~DtMF~~ → **Core Song 2 (TBD)** | _Pending — DtMF dropped 2026-06-12; Jose picking a new current/Spanish song. Re-run the verify-and-record step for the chosen song before its slots ship._ | _Pending (same)._ |
| Tu Boda | `https://www.youtube.com/watch?v=_ymicn0_GYc` — *Oscar Maydon x Fuerza Regida – Tu Boda [Official Video]* — **official Rancho Humilde channel** | `https://www.youtube.com/watch?v=AlElh28IumI` — *"Tu Boda · Tutorial GUITARRA Acústica · Letra y Acordes"* by **GuitarEP** (acoustic, chords + lyrics) |
| Sailor Song | `https://www.youtube.com/watch?v=1lrFsXkT_rM` — *Gigi Perez – Sailor Song (Official Music Video)* — **official geeguscrustVEVO channel** | `https://www.youtube.com/watch?v=rpoyXduMZZw` — *"Sailor Song · Beginner Guitar Lesson · Chords, Strumming & Printable Guide"* by for3v3rfaithful |
| Sweet Child O' Mine | `https://www.youtube.com/watch?v=1w7OgIMMRc4` — *Guns N' Roses – Sweet Child O' Mine (Official Music Video)* — **GunsNRosesVEVO** (existing ID, re-verified) | `https://www.youtube.com/watch?v=0ASVeXINKYM` — *"Sweet Child O' Mine · [Beginner Strumming & Easy Chords]"* by The Stellar Guitarist (open-chord acoustic = **standard tuning**, not the E♭ riff lesson) |

**Sweet Child intro-riff lesson (Module 7 stretch goal only):** `https://www.youtube.com/watch?v=t3yol_zrt7g` — *JustinGuitar Songs, "How to play the intro for Sweet Child O Mine"* (re-verified; this is the **E♭-tuning** intro lesson — keep it for the M7 🌶️ step exactly as the plan says, NOT for the chord/strum thread).

Also note here the confirmed key/progression for Tu Boda and Sailor Song (Core Song 2 TBD):

- **Core Song 2 (TBD):** key/progression pending until Jose picks the song.
- **Tu Boda:** ✅ **lyric check CONFIRMED 2026-06-12 — cleared to ship.** Chord sites report key of **E♭ minor**; a common guitar chart uses **F♯ – A♯7 – B – Bm** (sierreño / corrido feel, requinto-led). *(Confirm the actual key from the tutorial video before Session B/D/E writes any `chords:`.)*
- **Sailor Song:** **capo IV, played with G-shapes** (sounds in **B major**); core chords are **Emaj7 – G♯m – B** (concert), with an **Emaj7 → B** bridge. The verse is genuinely fingerpicked — good fit for the Module 8 picked-verse slot.

**Files:** none (research only — results recorded in this table; push the updated plan).

## [ ] Session B — Modules 1 & 2

- M1 S1: swap Vampire Core entry → **Core Song 2 (TBD)** ("Listen — find the guitar
  in the mix"). ⚠️ Blocked until Jose picks the song + its links are verified — if
  it's not picked yet, do the Sailor Song swap and leave M1 S1 for a follow-up.
  M1 S2: swap → Sailor Song ("Listen — fingerpicked vs. strummed guitar"). Adjust
  the S1 listening step's MC question if it references Vampire.
- M2 S1: swap Vampire Core entry → Stand By Me ("Identify the bass line notes on
  E & A strings"). Optionally add the bass line as a `tab:` once verified from the
  tutorial (it's in G when taught open-chord style).
- M2 S2: apply the **approved example** verbatim (below), filling in Session A's
  verified links.

```js
// Replaces the "Vampire" bonus riff step in module-2.js, Set 2 practice station:
{
  text: 'Bonus riff — "Sweet Child O\' Mine" (Guns N\' Roses) bass roots on the E & A strings: play the root note under each verse chord — D · C · G · D — one per bar at 60 BPM. Click any note name to hear how it should sound.',
  time: '3 min',
  hint: 'These are the roots of the D–C–G verse loop. Heads up: the original recording is tuned a half-step lower, so your notes will sound slightly higher than the record — that\'s normal, not a mistake. The famous intro riff comes later in the course (Module 7 stretch goal!).',
  skills: [4, 5],
  tab: {
    caption: '"Sweet Child O\' Mine" — verse bass roots · E & A strings · 60 BPM',
    notes: [
      { string: 'A', fret: 5, note: 'D', midi: 50 },
      { string: 'A', fret: 3, note: 'C', midi: 48 },
      { string: 'E', fret: 3, note: 'G', midi: 43 },
      { string: 'A', fret: 5, note: 'D', midi: 50 }
    ]
  }
}

// Replaces the "Vampire" entry in that set's songs array:
{ name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Play verse bass roots on E & A strings · intro riff = Module 7 stretch goal', type: 'Core', core: true,
  originalUrl: '<from Session A>', tutorialUrl: '<from Session A>' },
```

**Files:** `module-1.js`, `module-2.js`.

## [ ] Session C — Modules 3 & 4

- M3 S2: swap Vampire ("Chorus power chords: C–G–Am–F") → Sweet Child
  ("Verse: D5–C5–G5 power chord loop"). Consider a `chords:` block reusing the
  existing D5/C5/G5 shapes from `CHORD_DIAGRAMS`.
- M4: swap the Vampire Core entries in S1/S2/S3 per the slot table (Sweet Child
  S1 & S3, Core Song 2 (TBD) S2 — meta lines name the scale: "G major / E minor
  pentatonic over D–C–G" etc.). Rewrite the S3 perform step text: backing track options become
  "Watchtower or Sweet Child O' Mine."
- Show one rewritten example per file for voice approval before doing the rest
  (WORKFLOW.md rule).

**Files:** `module-3.js`, `module-4.js`.

## [ ] Session D — Modules 5 & 6

- M5 S1/S2: swap Vampire entries → **Core Song 2 (TBD)** (verse/chorus loop, chords
  per its confirmed key — ⚠️ blocked until the song is picked + verified). M5 S3:
  promote Stand By Me from Choice to Core ("THE Group 1↔2 cross-group song"). M5 S4:
  swap Vampire showcase entry → Sweet Child (full song performance option).
- M6 S2: swap Vampire ("D-DU-UDU on verse") → **Core Song 2 (TBD)**; the meta should
  tease its syncopated groove (this slot is also an anchor for the Module 6 redesign,
  WORKFLOW.md 3.5 — leave a code comment pointing there). M6 S3: add Tu Boda to the
  Core list as the corrido-style strum, parallel to Three Little Birds (reggae) and
  Bad Moon Rising (rock).

**Files:** `module-5.js`, `module-6.js`.

## [ ] Session E — Modules 7 & 8 + curriculum map + final sweep

- M7 S2/S3: swap Vampire entries → Sweet Child as Core (move it up from the S2
  Choice list; barre the D–C–G verse). Add a 🌶️ Level-up line to a Set 2 or 3
  challenge: the famous intro riff (D/G/B strings, 12th–15th fret) as the
  late-semester stretch goal — link it to the JustinGuitar intro-riff lesson
  (`t3yol_zrt7g`, verified in Session A); its hint should mention the riff is
  taught in E♭ tuning, part of the challenge.
  Add Tu Boda to S3 (barre the sierreño progression).
- M8 S1–S3: swap Vampire entries → Sailor Song (Core; fingerpicked verse — write
  the picking pattern as a `tab:` once confirmed from the verified tutorial).
  Add Tu Boda (sierreño picking) where it fits in S2/S3. House of the Rising Sun:
  no changes.
- **Curriculum map (Google Doc, see Relevant reference docs/README.md):** update
  the Course Song Thread list — strike the placeholders in slots 4–6 and enter
  Stand By Me / Core Song 2 (TBD) / Tu Boda / Sweet Child O' Mine / Sailor Song (note: thread
  grows from 6 to 7 named songs counting Sailor Song, or fold Sailor Song into the
  Module 8 row — Jose's call in-session).
- **Final sweep:** `grep -i "vampire\|olivia rodrigo"` across all module files +
  `index.html` — zero hits should remain. Full Live Server click-through of every
  module's songs tab and new TAB steps, desktop + narrow width. Push with message
  like `content: replace Vampire with new course song thread (5 songs)`.

**Files:** `module-7.js`, `module-8.js`, curriculum map Google Doc.

---

## Out of scope (parked ideas from the same chat — separate sessions)

Website improvements suggested alongside this plan, not part of the swap:

- **"Song Journey" view** — per-core-song page showing its evolution M1→M8 with the
  student's done-checkmarks (makes the thread visible to students).
- **Teacher dashboard: surface exit tickets + PR-ladder scores** — the data already
  lands in Firestore `responses`; the dashboard only shows skill checkmarks today.
- **Backing-track looper** — let a `playSeq` loop continuously at a chosen BPM
  (Module 4/6 improv) using the existing Karplus-Strong engine.
- **Per-set print/handout export** — print stylesheet for wifi-dead days.
- **Light PWA / service-worker caching** — instant loads on weak school wifi.
