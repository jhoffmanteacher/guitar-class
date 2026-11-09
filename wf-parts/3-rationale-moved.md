## Rationale behind the CLAUDE.md rules

The rules live in `CLAUDE.md`, `.claude/rules/` and the skills. This section
keeps only the reasons a future session needs so it does not "fix" a rule, and
a few rules stated nowhere else.

### Fast by default, with a Friday check (Jonathan, 2026-10-31)

Content and display changes break visibly and revert cleanly, so a weekly
review is a fair trade; changes that can wipe progress or strand Chromebooks on
an old cache stay always-Reviewed, because a Friday check would find them after
the damage. Unproven: if a Friday check finds a Fast change that hurt students
during the week, move that kind of change to always-Reviewed.

### Review triggers and the two reviewers (Jonathan, 2026-10-26)

Mechanical files (`CHANGELOG.md`, the `sw.js` version lines, the Spanish twin)
don't count toward "3+ files" because nearly every content push touches them,
so the trigger fired on one-line fixes. `site-reviewer` runs at high and
`site-reviewer-deep` at extra high because a review passed 36 minutes. Not yet
proved: every 2026-10-25 regression was found at extra high; if a high review
lets a real bug through, move that kind of change to the deep reviewer.

### Why the guidance is commands, not judgement (2026-10-25)

A medium-effort run does the obvious next step and trusts the tools; it does
not grep siblings or distrust a green run on its own. So the guidance is a
"Start here" checklist at the top of CLAUDE.md, gates that run something
(`checks.mjs`, `rule-zero-proof.mjs`, `smoke.mjs`), threshold triggers, and
rules files that load only with the files they govern. `smoke.mjs` exists
because `checks.mjs` reads source text and cannot click: 15 ▶ buttons were dead
for weeks with every check green. **`.gitignore` ignores everything under
`.claude/` except named folders: a new `.claude/<folder>` must be un-ignored
there, or it is never committed.**

### Multi-step directions get lists (Jonathan, 2026-07-25)

*"anything that has multiple steps should have bullet points."* Don't skip a
card because the actions "flow naturally": re-stitch it. The opposite failure
is real too: a two-item list whose second item is a technique reminder, or a
card that reads like assembly instructions, has gone too far. Preserve the
author's words; never rewrite the voice. "You've got it when" is not a bullet
because Jonathan chose a different visual treatment (2026-07-26, option B2:
thin green rule, italic) so it reads as a promise, not a step. Cards left in
prose on purpose: a single action, pure explanation, a bare "Watch: video"
line, a wrap-up reflection question.

### Challenge cards (Jonathan, 2026-07-26)

The first sweep's agents invented verbs the author never wrote, promoted
trailing tips into required steps, split concurrent actions into a sequential
`<ol>`, and grew existing lists; an adversarial pass caught 12. Budget one on
any comparable sweep.

### Paper drills get a digital deck (Jonathan, 2026-07-26)

Decks live in `DECKS` in `app.js` (not module data) so the Spanish comes from
`i18n.js`; ear pools in `EAR_POOLS` play through `playNote()`. Storage:
`games.dk['<deckId>']` plus a `games.dk.at` day stamp. Jonathan's design calls:

- **Self-report, not auto-grading**: the app cannot see whether the chord was
  played, and a 4-choice version turns recall into recognition (Fret Zap owns
  multiple choice).
- **Two-sided decks hide the back until tapped**, so "answer out loud before you
  check" survives.
- **"Put it back" re-deals the card 3 later**; only first-try hits score.
- **The ear sequence is never shown before the reveal**; replay is unlimited and
  unscored (an optional bonus).
- **No paper fallback line** on a card that gets a deck.

Slips in `levelUp` extensions and genuinely written tasks (TAB from memory,
spacing numbers on a staff) stayed on paper on purpose.

### Quiz answers are shuffled at render time (Jonathan, 2026-07-26)

Before the shuffle the keyed answer was never last 98% of the time. Why
`mcOrder()` is built as it is:

- **Deterministic, not `Math.random()`**: the list re-renders on tab switch,
  language toggle and after answering; a fresh order would move options under a
  student's finger.
- **Seeded on the ENGLISH prompt and choices**, so both languages show one order.
- **Same order for everyone**, so "look at the third one" works on the projector.
- **`MC_PINNED` is narrow on purpose**: catch-alls (`all/none/both/neither
  of…`, bare `None`) only. "All 6 strings" and "Both on E string" are real
  answers; pinning them would recreate the bug.

Because the order is render-time, `answer: 0` is fine on every new question.

### YouTube IDs and video choice

Modules 6–8 drafted from recall in May 2026 had ~60 dead URLs. oEmbed returns
JSON for a valid video and 404 otherwise; batch the checks. In cloud sessions
`WebFetch` reaches oEmbed where `curl` is blocked; `upload.wikimedia.org` and
`i.ytimg.com` refuse connections. Pre-existing URLs in Modules 1–5 are presumed
valid.

- **Watch-half pairs** (`stations.b`): video #2 from a *different* instructor
  than #1, same skill, unless the alternative is worse.
- **Prefer diverse creators** (audit 2026-07-10): before settling on Marty
  Music / JustinGuitar / Andy Guitar, spend one extra search on a comparable
  lesson from a woman, a creator of colour, or a Spanish-language channel.
  Already verified: Lauren Bateman, Nikhil D'Souza, guitarraviva, David Casas.
  Lesson quality still wins.

### Audio is fingerprinted but not precached

`CACHE_VERSION` covers every file in `audio/`, so a track re-exported under the
same name is cache-busted. Audio is deliberately **not** in `sw.js`'s `ASSETS`
precache list: that would download every jam track at install. A=440 and the
metronome-twin files: skill `audio-and-snippets`.

### Cloud handoff

Skill `session-handoff` (web pushes; Cowork ships a patch pair as one zip).

### Cloud-session working notes

- Clone read-only: `git clone --depth 1 https://github.com/jhoffmanteacher/guitar-class.git`.
  A stop-hook "unpushed commits" warning is expected in Cowork; on the web it
  means what it says.
- Playwright: `/home/claude/.npm-global/lib/node_modules/playwright`
  (CommonJS), browsers at `/opt/pw-browsers`. Serve with `python3 -m http.server`,
  then `devBypass()` → `onModuleChange(N)` → `switchTabById('<setId>','station-c')`.
  Station panels are `display:none` until `switchTabById` runs; element
  screenshots silently time out otherwise.
- Firebase can't load in the sandbox; the dev-bypass user can't write to
  Firestore, so `saveGames`/`saveProgress` are skipped under it.
- `MODULE_MANIFEST` has **13** entries; there is no flat songs hub; screens use
  `*-screen` ids, not `*-panel`.


## Moved from CLAUDE.md (2026-10-28)

Rules now in CLAUDE.md, a rules file or a skill are not repeated here.

### The Daily 5 is retired

Switch, what stays and why `tuning-warmup` stays hidden: CLAUDE.md and "(trim 2)"
below. Reason (2026-09-19): the class tunes and warms up together, and the
banner was 97px of a 657px screen. `WARMUP_BANK` in `config-main.js` is kept
though nothing on screen reads it (its other reader, `buildModuleRoutine()`, has
had no caller since `52ae05f`).

### Quiz answers — giveaway history and ratchets 1at/1au/1av/1w

The 1at / 1au / 1av / 1w write-ups live in their comments in `tools/checks.mjs`;
the watch-range and `STUDENT_VALUE_NAME_RE` rules are in CLAUDE.md. Two
videos once didn't teach what their card asked, which is where the watch-range
rule came from. **Allowlist entries in Modules 1–6 are carried deliberately:
when a module gets swept, delete its entries first and let the check say what is
left.** 1av's blind spot: a card that prints a whole lookup table ("Am fret 5 …
Dm fret 10") names the alternatives too; read those by eye.

### Sweep findings ratchet into checks.mjs

The rule is in CLAUDE.md ("Sweep ratchet") and `code-hygiene.md` item 7; label
hand-out in skill `site-sweep`. Reach for a whitelist over a blacklist whenever
the banned word has an innocent twin (1w2 pins the Journey lick labels
positively because "the reach", "the climb" are legitimate elsewhere on the same
pages).

### Modules 4 and 5 were swapped (2026-10-12)

The rule and the `d0cd004` proof are in CLAUDE.md; removing `swap45`: skill
`summer-reset`. What is only here:

- **One gap no client can close:** a tab that loaded the doc before the move and
  saves after it merges old-numbered maps into the marked doc. Repair by hand:
  re-scan the 3 docs the 2026-10-12 scan found with Module 4/5 work, and fix any
  old-numbered key that reappeared (an old id coming back, any `m5w4-*`, or
  `chords-m5`).
- **`moduleOpenThrough` is per module NUMBER**; the move didn't touch it. A
  student set to 4 before the swap now has Open Chords open, not Pentatonic.
- **Course order lives in the module number**: reordering again means a
  renumber like this one. Notes dated before 2026-10-12 may use the old numbers.
- `rule-zero-proof.mjs` against the pre-swap `1a1f6cc` fails by design.

### Stop hook and git hooks

Skill `session-handoff`; the "audio hash map" block: skill `audio-and-snippets`.

### Cloud sessions and patch handoff

Skill `session-handoff`.

### Stations B/C merge and Parts

The rules are in CLAUDE.md (Project) and "(trim 2)" below; parts in skill
`summer-reset`. Why the merge (2026-08-27): the room runs two groups, one with
the teacher and one on the site. Sections are addressed by `data-ns`, never
by DOM position. The tab-panel suffix `LESSON_TAB` is still the literal
`'station-b'` so old deep links resolve. A set is complete when the SET is:
the sets gate, checklist, Module Review, search and `resumeLessonCounts()`
never see a part, and 1af must stay green with no change to its expected
`data-ns` lists. In focus mode the B→C seam hides once the open
step is in Part 2: in `m4w2` it heads sections inside Part 1, and "don't head a
part you're not in" is the same rule the part marks follow.

### Real-browser smoke test

CLAUDE.md "Start here" item 3. Needs Node 22+ and Chrome (`--chrome <path>`).

### Effort per task

CLAUDE.md "How to work with Jonathan" → **Effort**.


## Moved from CLAUDE.md (trim 2)

Verbatim copies (2026-10-28) of the CLAUDE.md sections that were shortened. CLAUDE.md keeps the operative rule; this is the full text with dates, incidents and reasoning.

### Project: what this is (old CLAUDE.md lines 61,97)

