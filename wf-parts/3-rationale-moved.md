## Rationale behind the CLAUDE.md rules

Moved out of `CLAUDE.md` on 2026-07-26 so it stops being re-read on every turn
of every session (it was ~8,800 tokens per turn; the trimmed file is ~3,300).
The *rules* stay in `CLAUDE.md`; the reasoning, worked examples and history live
here. Read this when you need the **why**.

### Why Fast became the default, with a Friday check (Jonathan, 2026-10-31)

Reviews were still taking a long time on ordinary edits (a play-along change
ran a reviewer 30+ minutes), and the 2026-10-27 question defaulted to
Reviewed whenever Jonathan didn't answer. He asked whether same-day review was
needed if agents checked for errors once a week. The split: content and
display changes (play-alongs, wording, layout, new songs) break visibly and
revert cleanly, so a weekly review is a fair trade; changes that can wipe
student progress or strand Chromebooks on an old cache can't wait a week,
because the Friday check would find them after the damage. Those stay
always-Reviewed. The Friday check runs at 11 PM and fixes and pushes on its
own (Jonathan's choice), except fixes that are themselves always-Reviewed,
which go to a branch. Unproven: if a Friday check finds a Fast change that
hurt students during the week, move that kind of change to always-Reviewed.

### Why the review triggers were narrowed, and the "quick change" fast path (Jonathan, 2026-10-26)

After the Watchtower rhythm orders ran full review rounds, Jonathan said the
adversarial review felt like overkill. The real problem was the 3-file
trigger: almost every content push touches the module file, `CHANGELOG.md`
and `sw.js` (whose version lines `checks.mjs` rewrites on every push), so the
"3+ files" and "danger-zone `sw.js`" triggers fired on one-line fixes. Those
mechanical files, and the Spanish twin written in the same edit, no longer
count.

He also asked for a fast path for small multi-file edits: "quick change" /
"quick fix" skips the reviewer and the smoke test, but keeps every other gate.
The danger-zone and progress-key carve-outs keep the two expensive failure
classes — broken saves or config, and lost student ticks — behind the full
review.

The same evening a `site-reviewer` run passed 36 minutes, and the reviewer was
split in two: `site-reviewer` drops to high effort for ordinary reviews, and
`site-reviewer-deep` keeps extra high for danger-zone files and sweeps. Not yet
proved: every 2026-10-25 regression was found at extra high, so nobody knows
what high would have missed. If a high review lets a real bug through, move
that kind of change to the deep reviewer.

### Why the 2026-10-25 rules exist: "Start here", code-hygiene, teacher-console, site-sweep

Jonathan asked for the lessons of the sweep to be written down so they carry
forward, and asked what would help a *medium*-effort run behave like an
extra-high-effort one. The design follows from how the two differ: a
high-effort run cross-checks on its own initiative (greps siblings, re-reads the
line it edited, distrusts a green run); a medium-effort run does the obvious next
step and trusts the tools. So the guidance is built to not depend on initiative:

- **A short "Start here" block at the very top of CLAUDE.md** (the file is 800+
  lines; the top is what actually gets absorbed). It is a checklist of commands to
  run before saying "done", a short *never* list, and five habits — not prose.
- **Mechanical gates in place of judgement.** `node tools/checks.mjs`,
  `rule-zero-proof.mjs`, and the new `tools/smoke.mjs` answer "is this allowed /
  does this still work" by running something. The smoke test exists because
  `checks.mjs` reads source text and cannot click: a label with quote marks ended
  an `onclick` attribute early and 15 ▶ buttons were dead for weeks with every
  check green. Pre-fix tree → 5 error events; fixed tree → none.
- **Explicit triggers for review** (3+ files, a danger-zone file, 50+ strings)
  instead of "review when it seems risky". Every review round of the sweep found
  real regressions in the *fixes* (a mid-line `//` swallowing `bpm`/`chords`; a
  simplified Coach tip that said "Every note was right" under wrong notes; a
  console rewrite that left views on "Loading…"; the Español button stopping the
  song playing for the room). Fixers' own proof scripts had passed each time.
- **Rules as small numbered steps with the command that checks them**
  (`code-hygiene.md`), loaded only when editing the files they govern, so the root
  file stays small. `teacher-console.md` records the shared-config rules a
  two-console stress test established (the harness found three majors that
  reading did not); the harness itself was a scratchpad file and is *not* in the
  repo — whoever next changes that plumbing should rebuild it and commit it to
  `tools/`.
- **The sweep playbook and its three brief templates are a skill** so the next
  sweep starts from what worked: pre-created worktrees, one fixer per file family,
  `git cherry-pick main..branch` onto one linear branch (fast-forward push),
  check labels handed out in advance, reviewers on a pinned commit, `git fetch`
  immediately before pushing (another session moved `origin/main` mid-sweep).
- **A Stop hook and per-role effort pins, added the same day at Jonathan's
  request.** The hook (`.claude/hooks/stop-checks.mjs`, wired in
  `.claude/settings.json`) runs the 10-second offline checks at the end of every
  turn that changed code and blocks the stop on a real failure — the cheapest
  "did I break something?" step, done whether or not the model remembers. The
  design choices that matter: the expected "cache stale" lines are not failures
  (only the full run before a push may recompute them); it blocks at most 3 times
  per turn and never twice for the same file state (an unfixable failure must not
  trap a session); every internal error fails open. It was proved against a clean
  tree, a harmless edit, a planted syntax error, repeated attempts, a new turn,
  the off switch (`GC_STOP_CHECKS=0`) and a non-repo directory. Effort cannot be
  chosen automatically for the session (`/effort` and `--effort` are manual), but
  a subagent definition and a skill can each pin it, so the three sweep roles are
  project agents (`.claude/agents/`: auditor and fixer high, reviewer extra high)
  and the `site-sweep` skill pins extra high. Trap found on the way: `.gitignore`
  ignored everything under `.claude/` except three folders, so a new
  `.claude/hooks/` or `.claude/agents/` would never have been committed; both are
  un-ignored now.

### Multi-step directions get lists (Jonathan, 2026-07-23; refined 2026-07-25)

Jonathan's words, 2026-07-25: *"anything that has multiple steps should have
bullet points."* In practice: a card of roughly 200+ characters containing more
than one thing the student DOES is a list. Do not skip one because the actions
"flow naturally," are "one continuous technique," or "would need re-stitching" —
re-stitch it, and splitting a single long sentence into two `<li>`s is fine.

But the opposite failure is real: a two-item list whose second item is a
technique reminder, or a card that reads like assembly instructions instead of a
coach talking, has gone too far. Preserve the author's words either way —
re-split and lightly re-stitch, never rewrite the voice.

The trailing "You've got it when: …" was a deliberate fork. Jonathan weighed
giving it a bullet against giving it a different visual treatment and chose the
treatment (2026-07-26, option B2: thin green rule, italic, one shade quieter),
precisely so the "promise rather than a step" distinction survived. Bulleting it
would have reversed his own 2026-07-25 call. Flagging that reversal up front is
what produced the better answer.

The 2026-07-25 sweep applied the list rule across all 13 modules (~157 cards). A
card still in prose was left that way on purpose: single action, pure
explanation, a bare "Watch: video" line, or a wrap-up reflection question.

### Challenge cards (Jonathan, 2026-07-26)

195 cards across modules 1–12 — 116 numbered `Challenge N — ` plus 79 unnumbered
`Challenge — ` with identical duplication. Jonathan's complaint, from a Module 2
screenshot: *"the title and the beginning of the instructions are repetitive…
the steps are also repetitive here. 1 and 2 can be consolidated into one step
that starts with a verb, 'play'."*

His calls, via multiple choice: full title into `label` verbatim (never invent or
renumber); body opens straight on the directions; **every** body is a list —
*"make sure to keep bullet points"*; glossary parentheticals move into the text
while identifying ones stay in the title.

**Where the sweep went wrong the first time.** Agents re-stitching prose into
`<li>`s invented verbs the author never wrote (`Set the index finger…` for
`Index (i) on the G string.`), promoted trailing tips into required steps, split
concurrent actions into a sequential `<ol>`, and grew existing lists. An
adversarial audit pass caught 12 such defects. Budget for one on any comparable
sweep.

### Paper drills get a digital deck (Jonathan, 2026-07-26)

Looking at the Module 2 Ear Spark: *"there are things like this that require
paper. can they be made digital?"* The site already had `drill:{type:'shuffle'}`
commented as "the digital twin of the paper shuffle self-quiz," used in only 2
steps and only dealing frets. Generalised into `deck` and `ear`, wired into all 8
paper drills.

| type | deals | replaced |
|---|---|---|
| `shuffle` | frets on one string, timed | the paper shuffle self-quiz |
| `deck` | any small card pile, optional back side | flashcards and chord slips |
| `ear` | a hidden note sequence, played aloud | "shuffle slips, record yourself" |

Decks live in `DECKS` in `app.js` (not module data) so the Spanish comes from
`i18n.js` instead of being duplicated across thirteen module files. Ear pools
live in `EAR_POOLS` and play through the same Karplus-Strong `playNote()` the TAB
players use. Storage: `games.dk['<deckId>']` for best runs plus a `games.dk.at`
day stamp, mirroring `games.sd`.

Design calls, all Jonathan's:

- **Self-report, not auto-grading.** What's checked is whether the student PLAYED
  the chord, which the app cannot see. A 4-choice version would turn recall into
  recognition — Fret Zap already owns multiple choice.
- **Two-sided decks keep the back hidden until tapped**, so "answer out loud
  before you check" — the one thing paper cards really provided — survives.
- **"Put it back" re-deals that card 3 later**, the paper move of tossing the slip
  back in the pile. Only first-try hits score.
- **The ear sequence is never shown before the reveal.** That hiddenness IS the
  drill; replay is unlimited and unscored, because it's an optional 2-minute
  bonus and pressure belongs in the Shuffle Drill.
- **No paper fallback line**, and the "Got someone around?" partner line comes off
  any card that gets a deck.

Still on paper as of 2026-07-26, deliberately or awaiting a decision: 23
slip/flashcard mentions, almost all in `levelUp` extensions (Module 3
power-chord flashcards, Module 9 dot-fret slips) plus genuinely-written tasks
(writing TAB from memory, spacing numbers on a staff). 16 partner "Got someone
around?" lines survive on cards that never had a deck.

### Quiz answers are shuffled at render time (Jonathan, 2026-07-26)

Jonathan: *"the quiz correct answer choices should be randomized. right now the
correct answers are always the first one."* The premise was close but not exact,
and the real numbers were worth reporting back: across all 237 keyed MCs,
position 1 held 34%, position 2 **50%**, position 3 14%, position 4 **2%** —
never picking the last option was right 98% of the time. After the shuffle:
28 / 28 / 23 / 21.

`mcOrder(choices, seed)` returns the ORIGINAL indices in display order and is
used by both MC render paths. Load-bearing details:

- **Deterministic, not `Math.random()`.** Seeded on the question's own ENGLISH
  prompt + choices. The list re-renders on tab switch, language toggle and after
  answering; a fresh order each time would make options jump under a student's
  finger and make a saved answer look like it moved.
- **Seeded on English only**, so order is identical in both languages and the ES
  label rides along on the original index.
- **Same order for everyone**, including the projector — chosen over a
  per-student shuffle so "look at the third one" still works in class.
- **Two storage schemes, both still live.** The step quiz persists the choice
  TEXT; the practice panel persists the INDEX, so its buttons keep `data-idx` on
  the original index and only the render order moves. Do not simplify that away.
- **Catch-alls are pinned** (`MC_PINNED`): `all/none/both/neither of…`, and bare
  `None`. It deliberately does NOT pin ordinary answers merely starting with
  All/Both — "All 6 strings", "Both on E string" are real answers, and freezing
  them would recreate the bug. Jonathan's answer implied the broader rule, which
  would have pinned 13 ordinary answers; the narrow rule shipped instead.

Because this is render-time, new questions can't regress — write `answer: 0`
every time if you like.

### Never invent YouTube IDs from memory

In May 2026, Modules 6–8 were drafted from recall and ~60 of the URLs were 404s.
Training-data recall of 11-character video IDs is unreliable even for famous
songs and well-known channels. Search-and-verify is the only safe pattern.
Verify via oEmbed — returns JSON title/author for valid videos, 404 for
invalid/removed — and batch the checks in parallel; it's cheap and catches
mistakes before they ship. Pre-existing URLs in `module-1.js` through
`module-5.js` are presumed valid.

Note for cloud sessions: `WebFetch` against the oEmbed endpoint works even where
`curl`/`wget` are blocked. `upload.wikimedia.org` and `i.ytimg.com` refuse
connections outright.

### Prefer diverse tutorial creators (audit 2026-07-10)

The tutorial lineup skewed heavily toward a handful of big channels run by white
men — Marty Music, Andy Guitar, JustinGuitar, swiftlessons, GuitarZero2Hero and
Kurt Berg alone covered roughly half the slots. Jonathan wants students to see a
more diverse set of teachers. The rule is *check for a strong diverse option
first*, not *avoid the big channels at all costs* — lesson quality still wins.

### Backing tracks — worked example

`tabs/the-cure.html` + `module-4.js`:

- `olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-rhythm-down.mp3` — the default
  clean track (`backingUrl` + `data-audio`)
- `…-rhythm-down-metronome.mp3` — same mix with a click baked in, wired via
  `data-audio-metronome` and surfaced as a "🎵 Metronome" toggle on the Journey
  page that swaps the `<audio>` src while preserving playback position and state

"the cure"'s original master was at 442 Hz (~8 cents sharp) and had to be
re-exported at 440, which is where the A=440 rule came from. The `CACHE_VERSION`
fingerprint covers every file in `audio/` for exactly this reason — re-exporting
a track under the same filename needs the same cache-bust as a shell edit. Audio
is fingerprinted but deliberately **not** in `sw.js`'s `ASSETS` precache list;
that would make the service worker download every jam track at install time.

### Cloud handoff — full process (refined 2026-07-23)

1. **Cloud side:** run the FULL `node tools/checks.mjs` so the link check happens
   once and `CACHE_VERSION` ships pre-bumped; commit; `git format-patch`.
2. **Every patch ships as a PAIR** with its own `APPLY-<name>.md` — never a patch
   alone, never instructions only in chat. The APPLY file states what the commit
   is, which base commit it expects, the apply order if others are pending, and
   the exact steps: `git status` (clean tree) → `git am <patch>` →
   `node tools/checks.mjs --check --skip-links` (fast verify only — the cloud
   already ran the full battery and the patch carries validated content
   byte-for-byte) → `git push` → `node tools/checks.mjs --live` a minute later.
3. **Local side:** Jonathan hands the pair to his local Claude Code.
4. **Cloud side afterwards:** fetch origin and hard-reset the cloud clone —
   patches applied via `git am` get new hashes, so never re-merge.

### Cloud-session working notes

- Clone read-only: `git clone --depth 1 https://github.com/jhoffmanteacher/guitar-class.git`
  (no `gh` CLI in the sandbox). Shell cwd resets between calls — use absolute
  paths. The stop-hook "unpushed commits" warning is expected in a **Cowork**
  session: those ship patch pairs and never push. A Claude Code on the web
  session pushes normally, so there the same warning means what it says.
- Playwright lives at `/home/claude/.npm-global/lib/node_modules/playwright`
  (CommonJS), browsers at `/opt/pw-browsers`. Serve with `python3 -m http.server`,
  then `devBypass()` → `onModuleChange(N)` → `switchTabById('<setId>','station-c')`.
  Station panels are `display:none` until `switchTabById` runs — element
  screenshots silently time out otherwise.
- Firebase can't load in the sandbox; the dev-bypass user can't write to
  Firestore, so `saveGames`/`saveProgress` are skipped under it.
- Stale assumptions to avoid: `MODULE_MANIFEST` has **13** entries, not 12; there
  is no flat songs hub; screens use `*-screen` ids, not `*-panel`.


## Moved from CLAUDE.md (2026-10-28)
Trimmed out of CLAUDE.md by /doctor; text is verbatim.

### The Daily 5 is retired

### ⚠️ The Daily 5 is retired — switched off, not deleted
**2026-09-19** (Jonathan): tuning and the finger warm-up happen together as a
class, so the site should not ask for them a second time. The "Tune and warm
up first" banner at the top of every ladder was the **only** entry point to
the Daily 5 overlay, so turning the banner off retires the Daily 5 with it —
and it was 97px of a 657px Chromebook screen spent on work the room had
already done.

`const DAILY5_ENABLED = false;` in `app.js`, beside `buildDaily5()`, is the
whole switch; `ladderHtml()` is its one reader. **Nothing was deleted** —
`buildDaily5()`, `openDaily5Here()`, `moduleStepsFlat()`, the `.daily5-*`
CSS (including the `.dp.focus.pd-showing .daily5-inline` rule) and every
`daily5.*` i18n key are all still there, so flipping the constant back to
`true` brings the banner back as it was. Two things that are NOT part of
this: `WARMUP_BANK` in `config-main.js` (kept, though nothing on screen
reads it while the Daily 5 is off — its other reader, the Module Review's
10-Minute Routine `buildModuleRoutine()`, has had no caller since `52ae05f`)
and `kind:'tuning-warmup'` sections, which stay hidden
exactly as before — `storageSections()` depends on that and every `gi` in
Firestore was written under it.

One student-facing mention pointed at nothing afterwards and was reworded in
the same push: `module-13.js`'s final check, "one lap of the Daily 5" / "una
vuelta del Daily 5" → "a few bars of anything you know". A grep of every
module file and `class-activities.js` found no others.

### Quiz answers — giveaway history and ratchets 1at/1au/1av/1w

Modules 3–6's giveaway quiz items were **reworded on 2026-09-19** precisely
because nobody had reached them: `m3w1` "One shape, three chords", `m3w2`
"Watch: using a metronome", `m4w1` "Listen: major vs. minor moods", `m5w1`
"Challenge — Mystery Chart", `m6w3` "Watch: any-pattern exercise", plus three
practice MCs (`w1-s1`, `m5w4-s2`, `m5w4-s4`) whose order and keyed index were
held. (Those are the ids of that date: since the 2026-10-12 swap the moods
card is in `m5w1`, the Mystery Chart in `m4w1`, and the two practice MCs are
`m4w4-s2` / `m4w4-s4`.) Two of those videos turned out not to teach what the
card asked — the JustinGuitar metronome video never says "10 BPM slower
than you think you need" (it teaches one down strum per click at 80 BPM), and the any-pattern
video never mentions reggae in its 0:00–4:00 range — so those two questions
were rewritten to match what the student actually watches. **Check the watch
range before writing a question about a video**, not just the title.

**Three MC-giveaway ratchets — 1at, 1au, 1av** (2026-09-20). A sweep of
Modules 7–13 found **47 of 141 questions** a student could answer without
knowing the material, so the classes are now detectors rather than a rule
nobody can enforce:

- **1at — the keyed choice is the only one shouting a word.** "On the BACK of
  the neck" among three quiet choices is a free answer: scan for the capitals.
  No allowlist, because there is no innocent twin — chord symbols, note names
  and Roman numerals are excluded by name, and what is left is emphasis, which
  belongs at render time. Fix by dropping the caps, or, where the emphasis
  teaches a real contrast, by **mirroring it into the distractor it contrasts
  with** (m10w2's relative/parallel pair now does exactly that).
- **1au — a never-correct catch-all in a distractor** ("It doesn't matter",
  "Either works equally well", "Any string you like", "You can't"). This one
  DOES have an allowlist, because several are genuine beginner beliefs:
  m5w1-s6's "Never repeating anything" is the plausible opposite of its keyed
  answer, and m11w2-s6's "Can't tell from chords alone" is what a cautious
  student really writes. The keyed choice is never scanned — two correct
  answers in the course contain an absolute.
- **1av — the keyed answer is already printed on the card.** The biggest class
  and the one every reviewer under-counts, because the leak is usually in the
  step's `hint` or in the skill's own always-visible `.sk-label`, not in the
  question. Matching is on 3-word content n-grams, and the discriminator is
  that **no distractor shares the phrase** — a phrase the distractors also use
  is vocabulary, not a tell. An allowlist entry excuses the **card**, not the
  phrase, because a leaking answer usually overlaps its card in several places
  and a per-phrase exception would just surface the next one. Since
  2026-10-12 a 1–2-word keyed answer is matched whole (it has no 3-word
  n-gram), excused when the card also names one of the alternatives
  ("Tell major from minor"), and Roman numerals keep their case. Its known
  blind spot: a card that prints a whole lookup table ("Am fret 5 … Dm
  fret 10") names the alternatives too — read those by eye.

Every allowlist entry is in Modules 1–6, which that sweep did not cover. They
are carried deliberately, not tuned away; when a module gets swept, delete its
entries first and let the check say what is left.

**1w was blind to the fields this all lives in.** Its `FIELD_RE` listed
`text|hint|stuck|levelUp|gotItWhen|explain|…` and never `prompt`, and
`choices` is an array a `field: '...'` regex cannot see into at all — so a
banned phrase in an answer choice shipped while the identical phrase in its
`explain` failed the push. Widened 2026-09-20 (it caught a real one in
`module-9.js` the same day). Since 2026-10-12 1w and 1w-t read through one
bracket-walking reader (`readFieldStrings` in checks.mjs) that sees every
quote style, template literals, and every element of a multi-line array
(`choices`, `assessItems`, exit-check `items`) — the single-line regexes
had missed ~50 multi-line `choices` arrays. **A new authoring field needs
adding to `STUDENT_VALUE_NAME_RE`; an array field needs nothing more.** 1w-t
also reads Spanish now (`TEACHER_PHRASES_ES`: "es normal", "no te
preocupes", "está bien si", a sentence-final "tú puedes").

### Sweep findings ratchet — full text

### ⚠️ Sweep findings ratchet into checks.mjs
Any sweep or audit that finds **3+ instances of a mechanically-detectable error
class** must add a permanent detector for that class to `checks.mjs` in the same
session. Never leave a detector script in a session scratchpad — the 2026-07-31
MC-tell audit died that way and the class recurred in the next sweep. The
existing detectors (1h onward) are each documented by a comment in
`tools/checks.mjs` — read it there rather than keeping a list here.

When several agents add checks at once, **hand each one its label before it
starts** (`grep -o "head('1b[a-z0-9]*\." tools/checks.mjs | sort | tail -3`);
three agents once all took `1br`. And a check that merely finds a call in the
source proves nothing about behaviour — make it render or execute the thing
(1bf renders both card builders, 1bs compiles every inline handler).

**A phrase detector must match the UNESCAPED string.** Until 2026-09-25 1w
and 1w-t matched the raw source capture, which keeps `\'`, so every banned
phrase with an apostrophe ("don't worry", "that's the point", "that one's
free") was invisible in a single-quoted field — a live "Don't worry about
pressing any frets yet" sat in Module 1 with both green. Run captures
through `unescapeJs()` before matching.

Not every class can be guarded by a banned-phrase list. 1w2 pins the Journey
lick labels *positively* — every `Lick N — ...` card must use one of four
approved descriptors, in both languages, with the total pinned at 12 —
because the words it retired ("the reach", "the climb", "the fall") are all
legitimate elsewhere on the same pages. Reach for a whitelist over a
blacklist whenever the banned word has an innocent twin.

**A ratchet that can't fail is not a ratchet.** Every detector added or changed
gets proved by *breaking the guarded thing* in a scratch copy and watching the
check go red, then restoring. The 2026-09-07 review found five that were green
because they could not see what they guarded — a selector written twice, an
`@media` prefix, an inline `<script>`, an exact-match opening tag, a count that
was printed but never pinned. Where a total is meaningful, **pin it** (63
Journey tab cards, 27 tuning warm-ups) so it cannot drop silently.

### Modules 4 and 5 swap — full text

### ⚠️ Modules 4 and 5 were swapped (2026-10-12)
Jonathan moved Open Chords ahead of Pentatonic Scales. **Open Chords is
Module 4** (`module-4.js`, `m4w1`–`m4w4`, `mr4-*`); **Pentatonic is Module
5** (`module-5.js`, `m5w1`–`m5w3`, `mr5-*`). Set, skill and Module Review ids
moved with their content, and every Journey page swapped Layers 4 and 5 to
match (Layer 4 Open Chords, Layer 5 Pentatonic Solo). The two-part set is
`m4w2`; the 1ao and 1az pins, the Songs hub's module groups and the Core
rows' backing-track choice follow the content. **Saved progress IS moved**
— the swap shipped believing nobody was past Module 3, but a live scan the
same day found 7 docs with Module 4/5 work or Layer 4/5 "I'm ready" ticks.
Each student's own browser moves its doc once (the console cannot write
`progress/{uid}`): `swap45*` in `app.js`, read the comment above
`swap45MapId`. **The rule: a doc without `migrations.swap45` holds only
OLD-numbered data, a doc with it only NEW-numbered data** — so `flushSave()`
awaits `swap45Commit()` before every write, `tabs/journey.js` writes
`songReady` in the doc's own numbering, and `teacher.js` remaps unmarked
docs for display only. Don't remove one half without the others (Summer
reset list). **One gap no client can close:** a tab or device that loaded
the doc before it was moved (an older build, or one that missed the move)
and saves AFTER the move merges its old-numbered maps into the now-marked
doc, silently swapping the overlapping keys back. Repair is by hand: re-scan
the 3 docs the 2026-10-12 scan found with real Module 4/5 work a day and a
week after the deploy, and fix any old-numbered key that has reappeared in
the Firebase console — a key the scan saw under its old id coming back, or
any `m5w4-*` (Module 5 has three sets) or `chords-m5`. **`moduleOpenThrough`
in `config/class` is per module NUMBER and the move does not touch it:** a
student set to 4 before the swap had Pentatonic opened and now has Open
Chords opened — set them to 5 if Pentatonic should be open. Notes dated
before the swap may still use the old numbers. **Course
order lives in the module NUMBER** — reordering again means a renumber like
this one. Its script (`swapA.mjs`) lived in a session scratchpad and is not
in the repo. **Run `node tools/rule-zero-proof.mjs` against `d0cd004`**
(commit A, the mechanical swap) to prove the hand edits after it; against
the pre-swap commit `1a1f6cc` it fails by design ("the SET list changed"),
because every m4/m5 id now holds the other module's content. The swap
itself was proved structurally equivalent with the 4↔5 id map by a
throwaway script (`skeleton-equiv.mjs`, scratchpad, not in the repo).

### Stop hook and git hooks — full text

**Stop hook (2026-10-25).** `.claude/settings.json` runs
`.claude/hooks/stop-checks.mjs` whenever Claude finishes a turn. If code files
are changed (`.js .mjs .css .html .json`, outside `.claude/` and `audio/`) and
the working-tree state differs from the last one it checked, it runs
`node tools/checks.mjs --check --skip-links` (about 10 s). A real failure
**blocks the stop** and sends the output back, so you fix it in the same turn.
**If it blocks, fix the cause — never loosen a check or add an allowlist entry.**
The expected "shell cache stale" line is ignored (only the full
`node tools/checks.mjs` before a push recomputes it); "audio hash map in sw.js is
stale" is NOT ignored, and blocks until that run writes the block. It gives up
after 3 tries per turn, never re-blocks the same file state, and fails open on
any internal error. Off switch: `GC_STOP_CHECKS=0` in the environment. It does
not replace the git hooks, the full checks run, or `tools/smoke.mjs`. On
Windows, Git Bash may not have `node` on PATH; the hook then silently doesn't
run (a non-blocking error) and the git hooks remain the gate.

A tracked pre-commit hook at `.githooks/pre-commit` runs the fast offline checks
on every commit. Per-machine setup, once: `git config core.hooksPath .githooks`
— **done on both machines**. Bypass with `--no-verify`.

A second tracked hook, `.githooks/pre-push`, runs the same fast offline checks
again at push time. Not redundant: **git doesn't run `pre-commit` on merge
commits at all**, so a merge can carry a stale `sw.js` past every per-commit
check — on 2026-08-20 one reached `main` that way. Pre-push is the last moment
anything is still local. Both hooks skip the network; the full
`node tools/checks.mjs` is still the real gate.

Both hooks resolve `node` themselves rather than trusting PATH: on Windows they
run under Git Bash, which doesn't inherit the PATH entry the Node installer
adds for cmd/PowerShell, so `pre-commit` fell through to its "skipping checks"
warning on every commit while looking installed (fixed 2026-08-20). If you ever
see that warning, the hook is a no-op — run `node tools/checks.mjs` by hand.
Keep the candidate-path list identical in both hooks.

### Cloud sessions and patch handoff — full text

**There are two kinds of cloud session and only one of them can push.** Work
out which one you're in before planning a handoff: the old blanket "cloud
can't push" rule was written for Cowork and would send a web session into a
patch-pair handoff it doesn't need.

- **Claude Code on the web pushes normally.** It runs in its own ephemeral
  container with a writable clone and authenticated HTTPS to `origin`, so the
  ordinary "push to GitHub" workflow applies, `main` included. Three limits:
  there is no `gh` CLI (use the GitHub MCP tools instead); the sandbox proxy
  blocks the live site, so `checks.mjs --live` comes back HTTP 403 — the
  deploy has to be confirmed from a local machine; and **the credentials push
  commits but cannot delete refs**, so branch cleanup is a local job. A
  `git push origin --delete` fails with a bare `RPC failed; HTTP 403` from
  GitHub itself, and the GitHub MCP server has `create_branch` but no
  delete-branch tool — there is no way around it from a web session, so hand
  Jonathan the command (or the repo's Branches page) instead of retrying.
  (Pushing verified 2026-09-04, shipping the Journey tab-card restyle; the
  delete limit 2026-09-09, cleaning up six merged branches.)
- **Cowork sessions can't push** — GitHub access is read-only and git writes
  through the device-bridge folder fail on lock files. Never attempt them.
  Instead: run full `node tools/checks.mjs`, commit, `git format-patch`, and
  ship **every patch as a pair with its own `APPLY-<name>.md`** stating the
  base commit, apply order, and steps (`git status` → `git am` → `checks.mjs
  --check --skip-links` → `git push` → `checks.mjs --live`). Afterwards,
  hard-reset the cloud clone to origin — never re-merge.

  **Deliver the pair as ONE zip** (Jonathan, 2026-10-05: "package multiple
  files as zips in the future"). Any handoff of two or more files — a patch
  and its `APPLY-<name>.md`, several patches, any other set — goes out as a
  single `<name>.zip`, never as separate attachments. A single file is sent
  as it is. The one exception is the phone workflow, which stays one plain
  `CHANGES.md`.

  **Applying a patch: a conflict on `sw.js`'s `CACHE_VERSION` line is
  expected, not a problem.** That line is a fingerprint of every cached
  file, so every patch touches it, and it conflicts whenever `main` moved
  between cutting the patch and applying it (Windows line endings make it
  likelier). Keep either side of that one line, finish the `git am`, then
  run the FULL `node tools/checks.mjs` once (not `--check`) to recompute it
  and commit the one-line change before pushing. Don't stop to ask. Any
  conflict in another file is a real conflict — stop and report it.
  (2026-09-24: the Watchtower/Modules 4–6 pair landed this way, `69ac805`.)

### Stations B/C merge and Parts — full text

**Stations B and C are merged in DISPLAY ONLY** (2026-08-27, Work Order 7).
The room runs two groups now — one with the teacher, one on the site — so a
set renders as ONE continuous step ladder: B's sections, a seam divider
carrying C's own title words, then C's sections, numbered straight through.
`stations.b` / `stations.c` in the module files are unchanged and so is every
progress key (`${w.id}-b-sec{gi}-{i}` / `${w.id}-c-sec{gi}-{i}`) — never
"simplify" the data to match the display. **`gi` is the section's position
after excluding only tuning-warmup sections (`storageSections()`); render-time
hiding never renumbers it** — checks.mjs 1af. `buildLesson()` in `app.js` is the
renderer; the single tab-panel suffix is `LESSON_TAB` (still the literal
`'station-b'`, so old deep links resolve). Sections are addressed by
`data-ns`, never by DOM position. Don't reintroduce "Station B/C" wording in
student-facing text — the mid-set reflection card is **Checkpoint / Punto de
control**, the end-of-set one is **Wrap-Up / Cierre**; checks.mjs 1n fails the
push on a relapse.

**A long set can be shown as TWO PARTS — also display only** (2026-09-19).
`partOne` on a set and `partBreak` on one of its sections split the ladder
into Part 1 / Part 2: a heading at the top, a heavier divider above the
breaking section, a per-part progress pill and "Step n of m", and two jump
links in the rail. **Only `m4w2` uses it** (13 steps + 7), and checks.mjs
**1ao** pins that count at 1. Nothing in the data moves — same set id, same
arrays, same `gi`, so no progress key moves; 1af proves that independently
and must stay green with NO change to its expected `data-ns` lists.
`lessonParts()` in `app.js` is the resolver, `lessonGroups()` the shared
section walk. A set is still complete when the SET is complete: the sets
gate, the checklist, Module Review, search and the Daily 5 never see a part,
and `resumeLessonCounts()` stays whole-set. One consequence worth knowing:
in focus mode the B→C seam now also hides once the open step is in Part 2 —
it heads the sections at the top of station C, which in m4w2 are all inside
Part 1, and it was otherwise stacking directly above the Part 2 divider
saying "Now practice it". Same "don't head a part you're not in" rule the
part marks follow. Field docs live in the schema comment at the top of
`module-2.js`.

### Real-browser smoke test — full text

**Real-browser smoke test (2026-10-25).** `checks.mjs` reads source text; it
cannot click. `node tools/smoke.mjs --baseline origin/main` boots the site in
headless Chrome (dev bypass, no network needed), walks every module and set in
English and Spanish, opens Songs / Class activities / My progress / Games,
visits every game view and the tuner, and fails on any JavaScript error the
baseline did not have, or any inline handler that does not compile. It is for
renderer, escaping or many-file changes, not every commit. Needs Node 22+ and
Chrome (`--chrome <path>` if it can't find one). It caught what no check could:
15 lesson ▶ buttons that were dead for weeks.

### Effort per task — full text

**Effort per task (2026-10-25).** Effort is how much reasoning Claude spends;
higher finds more edge cases and verifies more, at more tokens. The session level
is manual (`/effort low|medium|high|xhigh|max`, `/effort auto` to clear it, or
`claude --effort <level>`); nothing picks it per task by itself, so these pins do:
- **Agents.** The project agents in `.claude/agents/` pin their own level:
  `site-auditor`, `site-fixer` and `site-reviewer` high, `site-reviewer-deep`
  extra high (always use one of the two reviewers for adversarial reviews —
  which one is set under "Triggers"). If you spawn a general-purpose agent
  instead, **pass `effort: "xhigh"` for a review the Triggers send to
  `site-reviewer-deep`, and `"high"` for any other review, an auditor or a
  fixer** — this paragraph is the explicit instruction the Agent
  tool asks for. Never pass `max`.
- **Skills.** `site-sweep` pins `effort: xhigh` while it is active.
- **Your own session, as a guide:** `medium` for routine edits (changelog, a
  small wording or content fix, renames); `high` for any bug fix, shipped JS, or
  module content with keyed MCs; `xhigh` for the danger-zone files listed
  above, sweeps, and anything the Stop hook keeps blocking on. If a task turns
  out to be in a higher tier than the session, say so and ask Jonathan to
  `/effort` up (or run it through `site-reviewer-deep`) rather than pressing on.

### Videos — pairing and diversity

- **Watch-half video pairs** (`stations.b`): aim for video #2 from a *different*
  instructor than #1, same skill. Same-channel pairs are fine when the
  alternative is worse.
- **Prefer diverse creators.** Before settling on Marty Music / JustinGuitar /
  Andy Guitar, spend one extra search on a comparable lesson from a woman, a
  creator of colour, or a Spanish-language channel. Already verified on the
  site: Lauren Bateman, Nikhil D'Souza, guitarraviva, David Casas. Lesson
  quality still wins.


## Moved from CLAUDE.md (trim 2)

Verbatim copies (2026-10-28) of the CLAUDE.md sections that were shortened. CLAUDE.md keeps the operative rule; this is the full text with dates, incidents and reasoning.

### Project: what this is (old CLAUDE.md lines 61,97)

