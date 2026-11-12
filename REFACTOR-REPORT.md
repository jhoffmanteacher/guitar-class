# The 2026-11-11 refactor, in plain terms

Written for Jonathan. What was done, what it is worth, and what it is not.

## The short version

- The site's three biggest code files were cut into 29 smaller ones, grouped by feature. **Students see no
  difference**: the same code runs, in the same order.
- A new test tool now records what the site shows and saves, and compares two versions of the site. It is the
  reason the cut could be made safely, and it stays useful for every risky change from now on.
- Expect later changes to be somewhat quicker and cheaper for Claude to make, and two sessions working at once
  to get in each other's way less often. The honest size of that gain is below. It is real but not dramatic.
- Students pay a very small price: the first visit downloads about 4% more and makes 14 more requests. After
  the first visit the browser's saved copy is used, as before.

## What was actually done

**1. The cut.** Three files held most of the site's code:

| Old file | What it was | Lines | Now |
|---|---|---|---|
| `app.js` | the student site | 17,900 | 15 files in `app/` |
| `coach.js` | the games and the listening | 10,700 | 7 files, `coach-*.js` |
| `teacher.js` | the teacher console | 7,200 | 7 files, `teacher-*.js` |

Each new file holds one area: saving, lessons, In-Class Activities, practice cards, the chord games, the mic
recordings view, and so on. A typical new file is about 1,200 lines. The largest is 2,400.

Nothing was rewritten. Whole lines were moved by a script, and the script checks that the pieces put back
together are the old files exactly. The listening code (how the games hear a guitar) was moved as one block
with every line unchanged.

**2. A handful of small hand-made changes** so that many small files behave like one big one: the page and the
service worker (the part that saves the site for offline use) list the new files; the games and the console
load their files one after another; and three things that "start" the site (sign-in, the Back-button handler)
now start last, after all the code has arrived. Tests found each of these; none was a guess.

**3. New test tools**, all in `tools/`:

| Tool | What it does |
|---|---|
| `golden.mjs` | Opens the site in a hidden browser, visits every set, screen, game, activity and console view in both languages, clicks every control that saves something, and records what it sees and what gets saved. Run it on two versions and it lists every difference. |
| `slow-load.mjs` | Loads the site with every file deliberately delayed, to catch code that runs before the code it needs has arrived. |
| `sw-upgrade-proof.mjs` | Simulates a returning student's browser moving from the old saved copy to the new one. |
| `split-site.mjs`, `site-src.mjs` | The script that made the cut, and a helper so the other test tools still see "the whole script" when they need it. |

## How we know it still works

RESULTS-PLACEHOLDER

The reviews mattered. The first version of the snapshot tool looked thorough and was not: a reviewer broke
the site eight different ways (saves going to the wrong place, sets locking for everyone, ticks vanishing on
reload) and the tool noticed none of them. It was rebuilt until it caught all eight. Without that review the
cut would have been "proven" by a test that proved little.

## What you gain

All numbers below were measured from this repo's own history unless marked as an estimate.

**A smaller working area for each change.** For the last 60 code changes to those three files, the file or
files each change touched totalled a median of **10,700 lines**. The same changes, after the cut, would have
touched files totalling a median of **2,100 lines**: about **4.6 times smaller (78% less)**.

Read that carefully. It is the size of the place Claude has to search and keep straight, not the cost of a
session. Claude already avoids reading a whole 17,900-line file; it searches and reads sections. So the saving
in reading is **smaller than 78%**, and I cannot measure by how much. My estimate: sessions that change this
code read perhaps **20% to 40% less** of it. That is an estimate, not a measurement.

- 25 of the 29 new files fit in a single "read" by Claude. None of the three old files did.
- A session looking for a function now searches among about 50 per file, where it was 250 to 850.
- It varies by area. Changes to the games almost always stay in one file (21 of 22). Changes to the student
  site spread more (8 of 22 stayed in one file), so the gain there is smaller.

**Fewer overlaps between two sessions.** Over the last 14 days, 64, 55 and 51 changes touched the three files.
Counting pairs of changes made within an hour of each other: 166 pairs shared one of the big files; 127 would
have shared one of the new files. That is **about a quarter fewer**. Over a whole working day it is about half
fewer. Two cautions: most of those close pairs are one session saving twice, not two sessions colliding; and
the busiest areas (the chord games, the console's main and mic views) stay busy inside one file each.

**A test that sees what students see.** This is the gain I would rank first. Before today, the checks read the
code as text and looked for errors. Nothing could say "the site behaves the same as yesterday". Now something
can, and it can be run before and after any wide or risky change.

**What does not change.** The checks take the same time (about 100 seconds). The instructions Claude reads at
the start of every session, the reviews and the smoke test cost what they did. So a session's total cost falls
by less than its code-reading falls. A fair overall expectation: **a modest saving, perhaps 10% to 25% on
sessions that change this code, and little or none on sessions that do not.** That range is my estimate.

## What it costs

- **Students' first visit: about 4% more to download** (measured: 13,500 bytes more for the student site,
  8,000 more for the games) **and 14 more requests.** No speed-up for students was intended or achieved.
- **One accepted risk during an update.** If a Chromebook's update to a new version is interrupted and its
  very next visit has no internet at all, the page is blank until it is online again; then it repairs itself.
  Before today the same bad luck would have shown the old site. You chose to accept this on 2026-11-11.
- **A tab left open across tonight's update** that opens Games before it reloads itself gets a "couldn't
  load" message until the reload, which is automatic.
- **More files to keep track of.** `CLAUDE.md` now has a table of what lives where.

## What was not done

- **No clean-up of the code itself.** Two parts of the site still draw an activity step in two separate
  places; three functions are 300 to 450 lines long; switched-off features are scattered. Each can be tidied
  later, one at a time, and the snapshot tool can check each one. None is urgent.
- **About 40% of those files is comments**, much of it dated history. Moving the history out would cut
  Claude's reading further. Many comments hold rules that prevent bugs, so this needs care and your say-so.
- **The snapshot tool has known gaps**: what a game does after Start, exit checks being taken, the search
  panel, the tuner. They are listed in `todo.md`.
- **Comments inside the code still say "app.js"** in many places. They are not wrong enough to mislead a
  session that has read `CLAUDE.md`, and fixing them is busywork for a quiet day.

## If something goes wrong

Undo the commit titled "The cut" and push. The three big files come back, and every tool keeps working,
because the helper falls back to the single file. The record of the whole job is in `todo.md` ("Refactor the
whole site") and in `WORKFLOW.md` under 2026-11-11.

## One thing only you can check

Open the site on a real Chromebook on school Wi-Fi: sign in as a student, open a set, an In-Class Activity
and a game, and the console as yourself. The tests are thorough, but none of them is a school device.
