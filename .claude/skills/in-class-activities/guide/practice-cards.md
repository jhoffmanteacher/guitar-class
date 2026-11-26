# Practice cards

**Practice cards — `view: 'card'` (Jonathan, 2026-09-27; ca-18 is the model).
The default for every song activity with a backing track (Jonathan,
2026-10-01: it "works much better for students"). Activities with no backing
track stay Focus-view step ladders.**
The activity is ONE screen:
- The song's tab, and one "Play song" button that plays the real backing track
  and moves the tab note by note (`.beat-now`, honouring each note's `beats`).
- One page per section, tap-a-section-to-start: a four-click count-in, then
  the loop returns to that section. A `card.wholeSong` card (ca-24 to ca-33)
  stops at the end of the song instead (Jonathan 2026-10-02).
- A speed control over the slow / fast files, starting on Slower (see
  Slowest), and the Guitar toggle where a full mix exists.
- A Metronome: a click the SITE makes on every counted beat (no metronome
  files; Moises clicked "the cure" at 144, twice the 72 the room counts).
- Then a Mark complete button. **No checklist** since 2026-11-10 (below).

A looping card repeats with no seek: a second `<audio>` on the same file
waits at the loop start and takes over at the window's end ("THE SPARE" in
`app/cards.js`, Jonathan 2026-10-07 — a seek left an audible hole every lap).
Anything new that touches a card's audio must handle `st.spare` and
`st.leaving` as well as `st.audio`.

Level up and links:
- **A whole-song card's Level up names no other page and renders no Journey
  button (it IS the play-along); a part card's Level up hands off to the
  whole-song card (`card: 'ca-N'`)** (2026-10-06, 1bn).
- A Level up may carry `card: '<id>'` to open another practice card instead
  of the Journey page. Every part card opens its song's whole-song card
  (ca-10 → ca-25; ca-13, ca-18, ca-19 → ca-24; ca-20 → ca-27) — never a
  power-chord version (ca-25 keeps its Journey Level up).
- `caCardLinkHtml()` shows the link once the target is released or Play Along
  now; 1bf checks the id. Before its date the target SWAPS INTO the linking
  card's slot (`caSwap`, `caOpenLinkedCard()`) — no Songs heading, no list
  entry; closing it puts the linking card back, open.
- What the Level up carries — the link to the next card, or the Song Journey
  button — renders as a plain button above Mark complete (`pcChecksHtml`,
  `.pc-next`), with no checkbox and no text (1ba pins both call sites).

Checks:
- **No checklist on a card, no Mark complete on an extra song** (Jonathan,
  2026-11-10: "get rid of the checklists on the activities. only have mark
  complete or next step" / "remove mark complete from the extra songs since
  they're extra"). A practice card ends in Mark complete (`caMarkRowHtml` →
  `caToggleComplete`), a Focus ladder in "Got it — next step" and Mark
  complete. `caTickKeys(card)` is `[]`, so a card shows no "n of m", no hero
  dots, no check count on its row, and no nudge. An extra song
  (`caIsLibraryCard`: the Songs page's More Play Along songs) shows no Mark
  complete at all. The `checks` stay in the data (one-line text, 1cs) and
  saved `<id>:c<n>` ticks stay in progress; nothing reads them. Guard:
  checks.mjs **1ct** renders every card; `tools/smoke.mjs` `noChecklistWalk`.
- **No practice card has a help ladder** (Jonathan, 2026-10-07: "it's not
  needed"; 0 of the 25 `view: 'card'` activities has a step): `steps: []`,
  which 1d allows only on a `view: 'card'` activity, so "More practice help"
  never renders (`pcHelpHtml` returns nothing for an empty list). 1bf's
  help-step rule still runs, for a help step that comes back.
- **A whole-song card has exactly two checks**: the whole song slower without
  stopping, then the Level up. Each check's text is one line ("Play the whole
  song with the band, intro to the end, without stopping."); a part card's
  Level up names the Whole Song card without "once it is posted" (2026-11-10).
- A check may carry `slot: n` to keep its old tick key after earlier checks
  were removed (ca-25).
- Until 2026-11-10 a card was complete when every numbered check was ticked
  (`pcCheck()`, removed); Level up was extra. `caTickKeys`/
  `caRequiredTickKeys` are still what every "n of m" reader counts (meta line,
  hero dots, sticky bar, the Mark-complete nudge) — for a ladder only.

Code and guards:
- Data shape: CARD note atop class-activities.js. Engine: `pc*` in `app/cards.js` (`pcBassMarks` alone is in `app/activities.js`)
  (`pcLayout` sections → tab offsets and beat totals; `pcLocate` position →
  note; the snippet window arithmetic, one `anchor` per song).
- One sound at a time: `pcStop()` sits beside every `snipStop()` in
  `stopCardAudio`, `playSequence` and `renderClassActivities` (1bf pins them),
  and starting a card calls `stopAllDemoAudio()`.
- **1bf** checks the data: track exists, sections back to back, each section's
  beats = bars × beatsPerBar, notes' midi/name from string + fret, window
  inside the file, exactly one Level up and it's last (a card with `rounds` —
  ca-54, the speed ladder, 2026-11-24 — has none: its last round's check is
  plain, record speed being the target; 1fc pins `rounds`, `slowestRate`,
  `startStop` and `buildLaps` to that card alone), help steps carry no
  snippet/drill/video.
- A section with a `repLabel` counts in that word in its caption — "3 laps"
  under a Lap badge, "2 times" under a Time badge. 1bm fails a mix.

**Chord cards are drawn as a CHORD GRID (`card.chordGrid`, 2026-10-26)**,
because the record's strumming is not consistent (Jonathan). A chord card's TAB
shows each chord once (same-name notes fold) at the beat or "+" where it
starts, four bars to a row with bar lines, always a count row (beats in ink,
"+" faint), and the cursor on the BEATS only (`data-beat`, never on a "+").

Scope:
- Opt-in per card; `chordGrid: false` per section (ca-41's single-note verses,
  ca-35's solo). ca-31 and every single-note card stay out.
- `card.everyStrum` (ca-29 and the Neil Young power-chord cards) keeps every
  strum as its own named event, with `ca.cardStrumDirections` as its
  directions. A mixed grid + single-note card cannot be every-strum (1cc).
- Display only — no `notes` array moved, so audio, `pcLayout`, 1bf / 1bf2 /
  1az and the Journey whole-song tabs are unaffected.
- `rows` without `rowLabels` are ignored. A lyric line keeps its row only
  where it starts on a bar line.
- ca-38 (lyric sheet) stays the PDF.
- A row that starts while a chord is still ringing names it at column 0 in
  parentheses, "(E7)".

Engine: `pcChordGrid` / `pcGridRows` / `renderChordGridRow` (rows), `pcLocate`
(`beat`, `bar`), `pcLocKey` (the repaint key is the BEAT on a grid — never the
note, or the cursor steps onto a "+"). Every row is lit with the same lead (THE LEAD,
`PC_LEAD`; the row look-ahead `PC_ROW_LEAD` / `pcLocRow` went on 2026-11-16).
Ratchet **1bv** renders every opted-in card in both views and executes
`pcLocate`/`pcLocKey`; `tools/smoke.mjs` walks the same cards in a real
browser. Turning a card on or off means editing its pinned list.

**Recording versions — `recordingVersions` (ca-26 / ca-29 / ca-40).**
A Jimi Hendrix / Neil Young switch at the top of the card, Jimi the default.
- A recording has its own track, bars, form and chord rhythm (unlike a key
  version), so a version carries a `card` (sections, caption…) and a `track`
  that `caView` lays over the card's own; also optional `title` / `intro`
  (+`_es`) (ca-40), so `caTitle()`, the card, the board and the console rows
  follow the recording.
- Data: `recording`, `recordingLabel(_es)`, `recordingGroup` (one stored choice,
  `localStorage.caRecordingModes`, for every card of the song),
  `recordingStart`, `recordingVersions: { neil: { label, label_es, track, card } }`.
  The IIFE at the end of class-activities.js builds the Neil cards.
- Not combinable with key / chord / bass versions. It DOES combine with the
  Chords / Tab / Lyrics switch (Jonathan, 2026-11-18, W23 question 1; ca-29):
  each recording has its own views over its own sections (the card's
  `otherViews` are Jimi's, `recordingVersions.neil.card.otherViews` Neil's,
  never inherited; RECORDINGS in `app/cards-views.js`). Jimi: Chords, Tab,
  Lyrics (ca-38); Neil: Chords, Tab. A recording press keeps a view the new
  recording has, else the card's own (`caCardViewsFollowRecording`). Both rows
  sit on one line, each named ("Recording", "Show the song as"). checks.mjs
  1er / 1cc. A version's track decides
  whether the Guitar switch shows (`snippetHasFull`). ca-38 has none (its PDF
  holds Jimi's 224 chord names). The Song Journey page has no switch yet.
- Guards: checks.mjs **1cc** (shape, render of every recording, pinned 3 cards /
  1 group) and **1bf** (every version runs through the card rules as a virtual
  card). `tools/smoke.mjs` clicks the switch, reloads and flips back.

**Card views — `card.otherViews`** (Chords / Tab / Lyrics switch, 2026-11-17;
ca-29, ca-30, ca-32, ca-33; `app/cards-views.js`, checks.mjs 1er, playalong-loop
R17). The views of one card, swapped in place while the song plays. On these
power-chord cards Tab is the card's OWN power chords written as tab (no
sections of its own, so it cannot drift; Jonathan, 2026-11-18), Lyrics a sheet
card's PDF over the card's sections. After a press into Chords or Tab the
card's top comes back on screen.

**A card note may be a chord** (the power-chord whole songs ca-29–ca-33):
`{ frets: [[string, fret], ...], note: 'A5', midi: [...] }`, the shape Module
3's tabs use (`renderTabSystem()` draws it), in a card section or a help
step's tab.
- `caChordProblems()` in checks.mjs recomputes every pitch from the fretboard
  and requires a root-plus-5th pair to be named for its root.
- Each power-chord card is its roots card (ca-24–ca-28) with the same sections
  and bars, every root turned into the Journey Layer 3 shape. Luna's is two
  strums per bar where its roots card is one.

**A card can show a chord sheet PDF instead of its tab — `card.sheet`**
(Jonathan, 2026-10-19; ca-38, Watchtower lyrics and chords).
- The PDF in `sheets/` is his own Word doc; the lyrics come from his file,
  never typed into code. pdf.js draws it (`vendor/pdfjs/`, loaded only for a
  sheet card — the CSP allows no CDN scripts).
- Chord positions come from the PDF's text: every word on a line made only of
  chord names, in reading order. **Every page is read**, cropped to its words
  and stacked into one tall sheet; a two-column page is read left column
  first. **`card.sheetColumns: 1`** reads a one-column chord-over-lyric sheet
  line by line with no gutter split (ca-44; without it a chord line's wide gaps
  split it into two columns).
- Three sheet cards: ca-38 (ca-29's sections, 224 names), ca-44 (ca-30's, 94),
  ca-45 (ca-33's, 143). Each shares its play-along card's sections by
  reference (one IIFE after the array), so a ca-29 rhythm edit moves ca-38's
  dot too.
- A chord still ringing at a line start gets NO name (it is not a change) —
  unless its section is in **`card.sheetNamedAgain`**, which names the first
  chord of every lap of that section (ca-45: 152 names for 143 changes).
- Sweet Child's web copy follows ca-33's chords from Solo 2 on, so it differs
  from his Drive handout on purpose (Jonathan, 2026-11-03).
- **Sheet chord n = the card's n-th chord CHANGE**, so the sheet needs exactly
  one name per change. `sheetChords` pins the count and **1bf2** holds the
  notes to it. The console preview says so if the PDF doesn't match (the dot
  is then left off).
- The dot and "This bar" light `PC_LEAD` before the HEARD beat, the same as
  the tab (THE LEAD in `app/cards.js`, 2026-11-16; until then the dot ran
  `PC_SHEET_LEAD` 0.175 s ahead of the decoder, about 255 ms before the heard
  beat). The dot stays filled until at least 0.1 s after the beat is heard.
- "This bar" is sticky, so a sheet card is `overflow:clip`, not hidden. A tap
  on a chord starts from that lap (`pcStart(root, si, rep)`).
- ca-38 has NO `journey` (1bn): it is another view of ca-29, not Layer 3's
  play-along.
- Engine: `pcSheet*` in `app/cards-sheet.js` (split off 2026-11-18, W24); caCardBodyHtml in `app/cards.js` calls it.

**Slowest.** A practice card with `card.slowest: true` (all 25 practice cards
on 2026-11-08) gets a four-stop speed control: Slowest / Slower / **Slow** /
Normal (Jonathan, 2026-10-09: "just below the normal speed of each song").
- Slowest is the SLOW file at `SLOWEST_RATE` (0.8) with `preservesPitch` — no
  third export, and the tuner still agrees.
- Slow is the FAST file at `pcSlowRate(tr)`, halfway between the slow tier and
  normal (the cure 66, Seven Nation Army ~112, Watchtower 110), so it always
  sits above Slower.
- A stepped slider (`pcSpeed3Html`): the two ends read "Slower" and "Normal"
  as directions, not stop names (Jonathan, 2026-10-09). Every stop shows its
  speed against the record (`0.65×`, `pcSpeedFactor`); each stop's name is its
  accessible label. Each option carries its rate in `data-rate`; `pcRate()`
  reads the card's `data-rate`.
- Every step snippet keeps its own Slowest button beside the turtle (the two
  release each other).
- Anything reading the file's own clock is unchanged; only real-time amounts
  (count-in spacing, click lookahead, output latency) scale by the rate.
- A `load()` resets `playbackRate` to `defaultPlaybackRate`, which is why
  `slowestApplyRate()` sets both.
