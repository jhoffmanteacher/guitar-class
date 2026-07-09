# SITE_LUNA_SWAP.md — Luna (Peso Pluma & Junior H) replaces Oye Mi Amor as the Latin core song

> **Purpose:** Execute the core-song swap on the website. Luna takes Oye Mi Amor's
> thread slot in Modules 1–5 and the Song Journey pages; Oye Mi Amor becomes a
> Choice song whose Modules 6–7 content is retained and retagged. Matches
> curriculum map **V16** (the Gemini swap in the Google Doc).
>
> **Execution mode:** minimal judgment. Every decision is pre-made. If anything on
> the ground contradicts this doc, STOP and report — do not improvise.
>
> **All CLAUDE.md rules apply:** present a plan before editing · ask at least one
> multiple-choice question (AskUserQuestion) before generating/overwriting any
> file · for bulk step-text changes, show ONE complete rewritten example first and
> ask "on the right track?" before doing the rest · never write a YouTube ID from
> memory · run `node tools/checks.mjs` before every push · end every session with
> a Live Server test with Jonathan, then push, then a one-line ✅ note.
>
> **Run sessions IN ORDER (A → H), one session per Claude Code run.**

---

## Decisions already made (Jonathan approved 2026-07-09; do not re-ask)

1. **In-place replacement everywhere.** Every existing `id:` (skills and steps),
   every skill array slot, and every card position is PRESERVED. Oye content is
   rewritten to Luna content in the same place. `MODULE_MANIFEST` /
   `skillCount` values do NOT change. The only additions are: one new step in
   Module 2, one new step + one new card in Module 7 — none of which touch a
   `skills:` array.
2. **Skill `m5w3-s6` keeps its id**; only its `text` and `gotItWhen` change.
3. **Journey layers renumber.** Luna's Song Journey uses the map's five-layer
   scheme: L1 Listening (U1) · L2 Single Notes (U2) · L3 Power Chords ◐ (U3) ·
   L4 Pentatonic Solo (U4) · L5 Open Chords (U5). Step links in modules use
   these numbers (Oye's old numbering was different — do not copy it).
4. **M5 positions stay put.** Luna's open-chord steps occupy the exact slots
   Oye's did (the Group-2 set), even though the map places Luna in the Group-1
   weeks. The site is self-paced with no week numbers; the step text notes that
   Luna's shapes come from Group 1. Do not move steps between sets.
5. **M3 assessment menu:** Oye's excerpt is replaced by **All Along the
   Watchtower's Am5–G5–F5** (Luna is ◐ in this unit and is not an assessment
   option). Luna still gets the drill and vamp steps.
6. **Oye Mi Amor in M6–M7:** cards retagged `type: 'Choice', core: false`,
   `journeyUrl` removed, Song Journey links stripped from step text; teaching
   content otherwise kept verbatim. Add `level: 2` (M6 card) and `level: 3`
   (M7 cards) — flagged for Jonathan's difficulty-dot review pass.
7. **Luna chord facts (from Jonathan's uploaded official charts):** F major,
   6/8 felt in 2 (teach two downbeat strums per bar — nothing syncopated),
   verse/chorus vamp **F–Am** with **Dm–C** appearances, **no capo**; simplified
   F (xx3211) until Module 7's full barre; solos use **D minor pentatonic
   Pattern 1, root D at low-E fret 10**; record tempo ≈ 128 BPM (in 6/8 —
   ladder targets in steps stay at the usual 60/70/80 downbeat BPM).
8. **Requinto stretch line = pending.** The M2 step ships with bass roots only.
   The simplified requinto TAB will be transcribed from Jonathan's uploaded
   official tab in a later session — note it in WORKFLOW.md, do not invent one.

## Section 0 — Video reference table

| Purpose | Candidate ID | Expected title contains |
|---|---|---|
| Luna original (all Luna cards) | `LExSwglVFIw` | "LUNA (Lyric Video) - Peso Pluma, Junior H" |
| Luna tutorial (all Luna cards) | `jtbqYAWMfok` | "LUNA … Requinto + Acordes … Tutorial Guitarra" |
| Luna backing track, M4 cards | `wBxFnX_V9mQ` | "Slow Burn Groove … Backing Track … D Minor" |
| Backing FALLBACK (only if above fails) | `N631Bn07HEc` | "Letting Go … Backing Track Jam in D Minor" |

**Session A verifies every ID via oEmbed before any edit.** Any ID that fails or
whose title mismatches: FLAG and stop for that card — never substitute a
different ID on your own. Existing Oye video IDs are deleted with their cards;
do not reuse them anywhere.

Power-chord / note reference used throughout (low E = MIDI 40 + fret; A string =
45 + fret; D string = 50 + fret):
- **F5** = low E fret 1 + A fret 3 · **A5** = low E fret 5 + A fret 7
- **Dm pentatonic Pattern 1 @ 10:** E 10(D)/13(F) · A 10(G)/12(A) · D 10(C)/12(D)

---

## SESSION A — Verify + inventory (read-only)

1. oEmbed each ID in Section 0:
   `curl -s "https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json"`
   Report each HTTP status + returned title. All three primaries must pass
   before Session B runs.
2. Inventory: `grep -rn -i "oye" --include="*.js" --include="*.html" --include="*.md" .`
   Expected hits: module-1 (1), module-2 (1), module-3 (8), module-4 (5),
   module-5 (8), module-6 (3), module-7 (3), CLAUDE.md (3), tabs/oye-mi-amor.html
   (many). **Any hit outside these files (index.html, app.js, sw.js, module-8,
   other tabs pages): STOP and list them.**
3. Confirm `tabs/luna.html` does not exist yet.

## SESSION B — Modules 1 & 2

**module-1.js** — replace the Oye card (≈ line 160) in place:
```js
{ name: '"Luna" — Peso Pluma, Junior H', meta: 'Listen — our Latin core song, back all semester', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
  originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
  tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
```

**module-2.js** — two changes:
1. Replace the Oye listen-ahead card (≈ line 243) in place; same object as above
   but `meta: 'Listen ahead — our Latin core song; you play its bass roots this module'`.
2. **Append one new step** as the LAST step of the station that contains the
   '"the cure"' single-note bassline challenge (the Weeks 3–4 single-note
   station). No `skills:` reference on this step. Content:
```js
{
  text: 'Challenge — Luna, bass roots: Luna rides two chords — F and Am — so its bassline is two notes. Play F (low E string, fret 1) and A (open A string) as single notes, two big beats each: the song is in 6/8, so feel the pulse in 2 and land each note on a downbeat. You\'ve got it when: four laps of F → A, both notes clean with no buzz, locked to the downbeats at 60 BPM. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
  hint: 'Fret 1 is the tightest squeeze on the neck — press right behind the fret wire with the tip of your index and the F will ring clean.',
  stuck: 'Park on just the F: pluck, listen, adjust, until five ring in a row. Then add the open A — that one\'s free.',
  levelUp: 'Trade the open A for fret 5 on the low E — same note, new position. The simplified requinto intro line is coming to this page soon.'
}
```

## SESSION C — Module 3

Show the rewritten drill step (item 2 below) to Jonathan as the worked example
and ask "on the right track?" before applying the rest of this session.

1. Station title (≈424): `'Oye Mi Amor: Bm5–A5 two-shape metronome drill'` →
   `'Luna: F5–A5 two-shape metronome drill'`
2. Drill step text (≈427), full replacement:
```
Challenge — F5 ↔ A5 Two-Shape Drill: Luna\'s whole vamp is two power chords — F5 (root F, low E string, fret 1) and A5 (root A, fret 5) — the same two-finger shape sliding four frets. One strum per big beat: Luna is in 6/8, so strum just the downbeats, two per bar, nothing syncopated. You\'ve got it when: you can switch F5 ↔ A5 landing every downbeat clean, all the way up the tempo ladder: 60 → 70 → 80 BPM. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.
```
   hint: `'A power chord has no major or minor — just root + 5th. Keep the two-finger shape locked and let your whole arm make the four-fret slide.'`
   stuck: `'Park on the slide: fret 1, fret 5, fret 1, fret 5 with no rhythm until the jump is automatic — then add the metronome at 60.'`
   levelUp: `'Palm-mute for a tight sierreño chug — then let it ring and hear why distortion isn\'t this song\'s home. That\'s what the ◐ means.'`
3. Chorus challenge step (≈496), full replacement:
```
Challenge — Luna, full vamp: the whole song rides F5 ↔ A5. Play along with the teaching arrangement — two downbeat strums per bar, changing where the record changes. You\'ve got it when: a full verse and chorus without losing a downbeat, F5 ringing as clean as A5. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.
```
4. Tab caption (≈502): `'"Luna" — the vamp as power chords (teaching arrangement) · 60 BPM'`.
   If this step carries a `tab.notes` array, replace with the F5/A5 shapes:
```js
notes: [
  { string: 'E', fret: 1, note: 'F', midi: 41 },
  { string: 'A', fret: 3, note: 'C', midi: 48 },
  { string: 'E', fret: 5, note: 'A', midi: 45 },
  { string: 'A', fret: 7, note: 'E', midi: 52 }
]
```
   (Keep the array shape identical to the existing schema; if the existing array
   has per-chord grouping, mirror it: F5 = first pair, A5 = second pair.)
5. Response placeholder (≈510): `'e.g. Luna at 60 — clean'`
6. Song card (≈531), in place:
```js
{ name: '"Luna" — Peso Pluma, Junior H', meta: '◐ Sierreño vamp → power-chord version (against the grain here)', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
  originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
  tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
```
7. `goal:` (≈560) and `assessItems` (≈604): replace
   `Oye Mi Amor's Bm5–A5` with `All Along the Watchtower's Am5–G5–F5`
   (both occurrences; keep every other word identical).

## SESSION D — Module 4

1. Solo challenge step (≈208), full replacement:
```
Challenge — Solo over Luna: Luna lives in F major, and F\'s relative minor is D — so D minor pentatonic Pattern 1 (root D, low E fret 10) is your box: the exact shape you\'ve been drilling, parked at the semester\'s highest position. Improvise four bars using only the three notes marked below, then four more adding a fourth note from the box. Hit ▶ &#x1F3B5; Backing track on the Luna card below to jam over. You\'ve got it when: eight bars where every phrase starts or ends on D. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.
```
   hint: `'Same Pattern 1 shape — just at fret 10. This high up, the frets sit closer together, so the stretch is easier than it looks.'`
   stuck: `'Trade just D and F (frets 10 and 13 on the low E) back and forth, changing only the rhythm, until an idea appears.'`
   levelUp: `'End every phrase on D so each idea arrives home — or lean on the F (fret 13) for extra sierreño ache.'`
2. That step's `tab`: caption
   `'Your three starting notes — D minor pentatonic Pattern 1 · 10th position'`;
   replace `notes` with the Dm entries from Section 0, keeping the SAME number
   of notes as the existing array, taken in this order:
   E10 D 50 · E13 F 53 · A10 G 55 · A12 A 57 · D10 C 60 · D12 D 62.
3. Assessment challenge text (≈722): in the parenthetical core-song list,
   `Oye Mi Amor` → `Luna` (nothing else changes).
4. All THREE Oye song cards (≈269, ≈523, ≈749 — Sets 1 and 4 both have one),
   each replaced in place with:
```js
{ name: '"Luna" — Peso Pluma, Junior H', meta: '<meta per slot below>', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
  originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
  tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok',
  backingUrl: 'https://www.youtube.com/watch?v=wBxFnX_V9mQ',
  backingKey: 'Dm' },
```
   meta per slot: ≈269 `'Solo using Dm pentatonic Pattern 1 (root D, low E fret 10)'` ·
   ≈523 `'Full solo using Dm pentatonic (root D, low E fret 10)'` ·
   ≈749 `'Full solo over Dm pentatonic — unit-end performance'`

## SESSION E — Module 5

1. Listen step (≈513), full replacement:
```
Listen to "Luna" by Peso Pluma & Junior H — the whole song rides two chords, F and Am, with Dm and C passing through the chorus. The pulse is in 2: tap just the big downbeats and feel the chord changes land right on them.
```
2. Set-3 challenge (≈582), full replacement:
```
Challenge — Luna, the vamp: F · Am — two shapes, both from Group 1 and by now old friends, with the simplified F (xx3211). The song is in 6/8, so play two downbeat strums per bar — nothing syncopated — changing every bar at 60 BPM. You\'ve got it when: four laps with every change landing on the downbeat and the little F ringing clean. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.
```
3. Song card (≈617): Luna card (original + tutorial URLs, journeyUrl
   `tabs/luna.html`), `meta: 'Verse vamp F–Am (+ Dm–C) · strummed'`.
4. Skill (≈671–672) — **keep `id: 'm5w3-s6'`**:
   text: `'Play the "Luna" vamp (F–Am, plus Dm–C) using Group 1 chords with a strum pattern'`
   gotItWhen: `'you can loop the "Luna" vamp (F · Am) with steady downbeat strums at 60 BPM, every change landing on the downbeat and the simplified F (xx3211) ringing clean.'`
5. Showcase challenge (≈809), full replacement:
```
Challenge — Luna, strummed (showcase version): the full song is F · Am, with Dm · C arriving in the chorus — two downbeat strums per bar at 60 BPM, building toward 70, singing or humming "Luna, dile tú" if you dare. You\'ve got it when: a full verse and chorus with every change on the downbeat and the F ringing clean. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.
```
6. Response placeholder (≈820): `'e.g. Luna, all of it'`
7. Showcase card (≈851): Luna card, `meta: 'Full-song showcase · F–Am–Dm–C'`.

## SESSION F — Modules 6 & 7 (Oye → Choice; Luna barre step)

**module-6.js**
1. Card (≈399): `type: 'Choice', core: false`, DELETE the `journeyUrl` field,
   add `level: 2`. Name/meta/URLs unchanged.
2. Step (≈382): delete the trailing Song Journey sentence
   (`<a href="tabs/oye-mi-amor.html" …>…</a>.`) so the text ends at
   `…pushes like the record.` Everything else verbatim.
3. `gotItWhen` (≈447) mentioning Oye: unchanged (valid Choice-song content).

**module-7.js**
1. Both cards (≈400, ≈644): `type: 'Choice', core: false`, delete `journeyUrl`,
   add `level: 3`. Otherwise unchanged.
2. Step (≈595): strip the Song Journey sentence, same treatment as M6.
3. **Append a Luna step** as the LAST step of the same station that holds the
   (former Oye) full-barre step. No `skills:` reference:
```js
{
  text: 'Challenge — Luna, full barre F: the little F (xx3211) graduates today. Index bars fret 1 across all six strings — the toughest fret on the neck to barre — and you ride F ↔ Am with two downbeat strums per bar at 60 BPM. You\'ve got it when: four laps where all six strings of the F ring as clean as the Am — Luna\'s last training wheel is off. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: beyond Layer 5 — the barre upgrade</a>.',
  hint: 'Roll the index onto its bony edge and pull back with the whole arm rather than squeezing with the thumb — fret 1 needs leverage, not force.',
  stuck: 'Barre just the top two strings at fret 1 and add one string per day. The six-string F is a marathon, not a sprint.',
  levelUp: 'Slide the same barre shape to fret 5 — that\'s A major, and suddenly every major chord on the neck is yours.'
}
```
4. **Append a Luna Core card** to the same set's `songs[]` (after the retagged
   Oye card):
```js
{ name: '"Luna" — Peso Pluma, Junior H', meta: 'Full barre F in the vamp (instead of the little F)', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
  originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
  tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
```

## SESSION G — Song Journey pages

1. **Create `tabs/luna.html`** using `tabs/oye-mi-amor.html` as the structural
   template (same CSS, crumb, header pattern, per-layer `rate()` widget with
   `data-layer` 1–5, footer). Content spec:
   - Header: kicker `Song Journey` · title `Luna` · artist
     `Peso Pluma & Junior H` · thread badge `🧵 Thread song — it grows through Units 1–5`
   - Song map box: `The whole song rides F · Am; the chorus adds Dm · C. It\'s in 6/8 — feel the pulse in 2 and strum the downbeats.`
   - **Layer 1 · Listening (Unit 1):** listen prompts — is the big pulse in 2s or
     3s? (both are true: two big beats, each dividing in three); tap only the
     downbeats; Respond: what does the requinto add that strumming can\'t?
     Connect: name another song where an acoustic guitar carries the hook.
   - **Layer 2 · Single Notes (Unit 2):** bass-roots TAB:
```
        F         A
e|--------------------|
B|--------------------|
G|--------------------|
D|--------------------|
A|------------0--0----|
E|--1--1--------------|
```
     Play it: two big beats per note at 60 BPM, four laps, no buzz on the F.
     Level up note: `The simplified requinto intro line lands here soon — for now, hunt it by ear against the record.`
   - **Layer 3 · Power Chords ◐ (Unit 3):** F5/A5 TAB (frets 1+3 → 5+7 on
     E/A), downbeat strums, the ◐ explanation (sierreño rendered with
     distortion = against the grain — that\'s the point of the exercise).
   - **Layer 4 · Pentatonic Solo (Unit 4):** Dm Pattern 1 @ fret 10 TAB (the
     six notes from Section 0), phrase-ends-on-D coaching, backing-track
     pointer to the Module 4 card.
   - **Layer 5 · Open Chords (Unit 5):** F (xx3211) · Am · Dm · C shapes;
     downbeat strums in 2; full-verse goal; note that Module 7 upgrades the
     little F to the full barre.
2. **Delete `tabs/oye-mi-amor.html`** (404 by design, matching
   `tabs/tu-boda.html`). Confirm nothing outside modules 6–7 (already stripped
   in Session F) links to it: `grep -rn "oye-mi-amor" .` must return zero hits
   after this session.

## SESSION H — Repo docs + final sweep

1. **CLAUDE.md settled facts:**
   - DELETE the Oye Mi Amor turnaround bullet (obsolete).
   - UPDATE the core-six bullet: `…Sweet Child O' Mine (standard tuning), Luna (Peso Pluma & Junior H), Let It Be, and "the cure"…` and extend the note:
     `Oye Mi Amor is a Choice song (Modules 6–7 content retained, retagged 2026-07); tabs/oye-mi-amor.html removed by design. tabs/luna.html is the sixth Journey page.`
   - ADD a Luna bullet:
     `**Luna** — F–Am vamp plus Dm–C; 6/8 felt in 2 (teach two downbeat strums per bar, nothing syncopated); no capo — simplified F (xx3211) until Module 7's full barre; solos use D minor pentatonic Pattern 1 at fret 10; ◐ in Module 3 (sierreño as power chords). Settled 2026-07-09.`
2. **CHANGELOG.md** — one student-facing entry in the established voice
   ("Luna joins the core six", what it means per module, Oye moves to Choice).
3. **WORKFLOW.md** — ✅ note for this doc; ADD two open items:
   `Luna requinto intro TAB — transcribe from Jonathan's uploaded official tab (Layer 2 stretch + M2 levelUp)` and
   `Difficulty-dot review: new level values on retagged Oye cards (M6: 2, M7: 3)`.
4. **Final sweep:** `grep -rn -i "oye" --include="*.js" --include="*.html" .`
   Expected remaining: module-6 and module-7 retagged content only. Zero hits in
   modules 1–5, index.html, app.js, tabs/. Report the list.
5. `node tools/checks.mjs` · confirm `MODULE_MANIFEST` byte-identical to before
   Session B · Live Server click-through with Jonathan: M1/M2 Luna cards, M2
   bass-roots step, M3 drill, M4 solo + `🎵 Backing track (Dm)` button plays,
   M5 vamp steps, M7 barre step, `tabs/luna.html` all five layers +
   rating widget saves, `tabs/oye-mi-amor.html` 404s. Push.

---

## Out of scope (do not touch)

- Module 8 · `skills:` arrays beyond the `m5w3-s6` text edit · `MODULE_MANIFEST`
- The Choice-song wholesale replacement (separate song-list review session —
  Oye's pool placement there is already handled by the M6–7 retag)
- The curriculum map Google Doc (handled by GEMINI_LUNA_SWAP)
