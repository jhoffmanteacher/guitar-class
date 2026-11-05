# WORKFLOW.md — Guitar Class

> Build history lived in `archive/` (deleted 2026-10-09; recover any file with
> `git show c751db8:archive/<file>` — the `archive/...` paths below resolve there):
> **`WORKFLOW-2026-buildout.md`** (original site build-out),
> **`WORKFLOW-2026-july-fixits.md`** (July 2026 fix-it era), and
> **`WORKFLOW-2026-research-upgrades-era.md`** (the entire 2026-07-11
> mega-day: research-upgrade Sessions A–G, Semester 2 build, Listening
> Coach + games, mini-player, navigation pass, both review rounds, the
> full design plan, the 93-fix module clarity fleet, and the evening's
> Daily-5-popup + chord-check fix batches — its specs
> `RESEARCH_UPGRADES.md`, `MODULES_9_12.md`, and the fully-executed
> `DESIGN_UPGRADES.md` are archived alongside). Consult them for *why*;
> they drive no current work. All CLAUDE.md rules apply as always.
>
> Also individually archived: **`REVIEW-PLAN.md`** (the 2026-07-13 full-site
> review across CODE/CONTENT/DESIGN/IMPROVEMENTS — every item executed
> 2026-07-20 in `b76dd67` except the handful that need Jonathan live on the
> real site, tracked below), **`PLAN-COMPACT-CHECKLIST.md`** (the
> compact-checklist step redesign spec, executed 2026-07-20 in `e6925ec`),
> and **`PLAN-COMPACT-JOURNEY.md`** (the same compact redesign applied to the
> six Song Journey pages, executed 2026-07-20 in `dbd2f8f` + `c0b14fc`).

**Status legend:** [ ] not started · [~] in progress · [x] done

---

## Where things stand (updated 2026-11-05)

Start here. Each line says where the detail is. Update this block whenever an item opens or closes; the
sections below hold the history and the reasons.

**Decided 2026-11-05: Power Chord Switch room noise**
- Jonathan chose a stricter strum ratio for Power Chord Switch ONLY: `CC_POWER_ONSET_RATIO` 2.2 and
  `CC_POWER_HF_RATIO` 2.67 in `coach.js` (Change Up and every other loop keep 1.4 / 1.7). On the 12 real takes the
  replay says 30 of 52 false hits go and 4 of 132 real strums are lost. Detail, numbers and how to roll it back:
  "Power Chord Switch: where we stopped" → "Decision (2026-11-05)". "No readable pitch, no tick" was not chosen.
- **First, after it is live (Jonathan):** a thumb or finger strum take on a test student account at 60 and 120 BPM,
  then "Evaluate all recordings" and read "Played, not counted" (see "Decision (2026-11-05)").
- **To watch in the next takes:** noisy rooms should show fewer "heard, not there" changes (22 of the 52 false hits
  still fire at 2.2, so not none), and clean takes should not start missing real strums: read the console's "Played,
  not counted" column (`detector-missed`). Not covered by the 12 real takes, so look at these first: **thumb or
  finger strummers** (no sharp pick attack), **fast every-beat pairs** (up to 140 BPM; the 12 takes ran at 40-90 BPM,
  one at 90/105/120), and **Chromebooks that draw slowly** (11 of the 12 takes had 16.7 ms frames, 1 had 33, none 50).

**Waiting on students' recordings**
- **The Pitch-rule table** (teacher console → Mic recordings → Evaluate all recordings) needs takes saved after
  2026-11-05, which carry `expected[].readings`. It needs mic collection switched on in the console and its "stop
  after" number above the count (23 of 40 on 2026-11-04), a real student account, the consent answer, and a game
  played to the end or stopped after 10 s. Older takes are left out of that table and counted. Jonathan keeps the 25
  takes saved so far (12 Power Chord Switch) outside the repo: the files carry student names.

**Optional leftovers (Jonathan's)**
- The console's `heartbeats` composite index (Firestore → Indexes, the only index). Nothing uses it; see
  "Practice-minutes heartbeat removal (not Power Chord Switch): DONE".

**Automatic**
- The Friday check (Fridays 11 PM Pacific; next 2026-11-06) reviews the two Fast commits from 2026-11-05:
  `b958165` (pitch readings saved in takes) and `ce5096e` (the Pitch-rule table). The ratio change was reviewed
  the same day (always-reviewed: a detection change), so it is not in that list.

**Finished recently (don't redo)**
- Practice-minutes heartbeat removal: code, rules, emulator test and the old collections (2026-11-05); the old
  `minutesBoard` collection deleted too. The class rank and the Top 5 are keyed by a private tag, so no uid sits next
  to minutes.
- `tools/pm-rules-test.mjs`: 179 emulator cases (minutes, the boards, recorded takes, their audio chunks, the take
  counter). It needs Java 21: on Jonathan's Mac it is at `~/tools/java` (not on PATH; the recipe is in the file's
  header). One known leniency is pinned, not fixed: a chunk with no `i` field is accepted.

**Not re-reviewed on 2026-11-05**
- The 7 unchecked top-level items and 6 nested ones under "Open work" below (the smoke flake after reload, the song
  popularity counter, three Friday-check items, the cloud review, "pushed in a hurry"). Read them there; this block
  does not summarize them.

**Settled, don't re-raise:** the 30 s take cap, the real-guitar mic check, the three "chord sounded wrong"
wordings, no Note Runner mic check (see "Later (not chosen yet)").

---

## Working conventions

- **Two Claude sessions at once → each in its own git worktree.** Both machines
  run parallel terminals sometimes. Two sessions in the SAME working tree share
  one git index, so one session's commit can sweep up the other's *uncommitted*
  work — this happened 2026-07-12 (the Change Up combos + Random-4 changes got
  bundled into the unrelated Wait Mode commit `6dcf68c`). If you start a second
  session while one is active, give it its own worktree before editing shared
  files: `git worktree add ../guitar-class-<tag> -b work-<tag>`, work there, then
  merge/push from there. On the **Mac** this is now auto-reminded — a SessionStart
  hook (`~/.claude/hooks/cc-session-lock.sh`, wired in `~/.claude/settings.json`)
  detects a live second session via per-session heartbeat locks and tells Claude
  to switch to a worktree. It's a *reminder, not a relocation*, and it's
  **Mac-only**; the **Windows** machine needs the rule followed by hand (or a
  PowerShell twin of the hook). Activate after editing the hook with `/hooks` or a
  restart.
- **Cloud Cowork sessions can't push (and must not git-write through the
  device bridge).** Established 2026-07-23. Scope narrowed 2026-09-04: this
  is about **Cowork specifically**, not "the cloud" — a Claude Code on the
  web session has its own writable clone and authenticated HTTPS to origin,
  and pushed `d0e3dfa` (the Journey tab-card restyle) straight to `main`
  with no patch pair. What it still can't do is reach the live site — the
  agent proxy returned HTTP 403 for `jhoffmanteacher.github.io/…/sw.js`, so
  `checks.mjs --live` can't confirm a deploy from there, and the link
  check's ~240 YouTube fetches all 403 as non-blocking warnings (they prove
  nothing about the links either way; a real dead-link sweep needs a local
  run). Cowork's constraint is a different one and is unchanged: its GitHub
  access is read-only for this repo, and running `git am`/`merge` against
  the Mac clone through the connected-folder bridge fails (the bridge can't
  unlink git's lock files — stale locks had to be swept to `_to_delete/`).
  The working pattern instead: build + verify in the cloud (full `checks.mjs`
  run pre-handoff so `CACHE_VERSION` ships pre-bumped) → commit → deliver
  `git format-patch` output **always paired with its own `APPLY-*.md`**
  (canonical step list lives in CLAUDE.md's cloud-sessions section: fast
  `--check --skip-links` verify on apply, push, then `--live` deploy
  confirmation) → Jonathan's local Claude Code applies (`git am`) and
  pushes → the cloud session then fetches origin and hard-resets its
  clone. Local sessions keep the normal "push to GitHub" workflow from
  CLAUDE.md unchanged.

- **Single-flow modules (new pattern, 2026-07-23).** A set whose `stations`
  has only `b` (no `c`) renders as a SINGLE-FLOW set: one custom-labeled
  learn tab straight into the checklist — no Station B/C framing. The tab
  card and rail mirror the set's own labels: `tabTitle`/`tabSub` (+`_es`)
  on `stations.b`, `checklistSub` (+`_es`) on the set; `panelFooter` routes
  station-b → checklist; `syncRailStations` hides the Station C rail button
  and swaps the labels. **Module 13 · String Changing** (`module-13.js`) is
  the first single-flow module — its 4 checklist skills ARE the graded
  in-class assessment rubric. Everything else (skills checklist, practice
  panels, search, Keep practicing, My progress, print) works unchanged.

---

## Open work

- [ ] **2026-11-02 — `tools/smoke.mjs` flakes after its page reload (cause not
  found).** On this Mac, about 4 of 9 runs on 2026-11-02 reported errors that the
  baseline did not, all right after the Power Chord walk's `Page.navigate` reload:
  `module 3 failed to load ReferenceError: chordDiagramSVG is not defined`
  (`app.js:5745`, a set render; `guitar-diagrams.js` is a `defer` script that runs
  before `app.js`), `NOTES is not defined` (`tuner.js`), `Cannot access 'shRaf'
  before initialization`, and once a Fret Zap walk finding no buttons. A debug copy
  that printed every failed local request (the NOISE filter hides `net::ERR`) showed
  none, so it is not a failed fetch. Other runs of the same tree were clean (0
  errors). Nothing in the diff touches those globals. If it shows up in a push
  check, rerun once on a quiet machine (`pkill -f headless=new` first); if it
  persists, look at the service worker's first-load cache and the fixed sleeps
  around `devBypass()` in `powerSwitchWalk`.


- [x] **2026-11-02 — Power Chord Switch setup overflowed with a "Best today"
  score (DONE).** "Best today: 60 BPM" joined the tempo row, the speed and tempo
  groups no longer fit side by side, and the setup grew to 698px on a 657px
  screen (the privacy line cut off). Now (Power Chord Switch only; Change Up's
  render is byte-identical) the score is its own line under the −5/+5 row
  (`.cc-best-line`, always drawn, empty without a score, so the pair buttons do
  not jump); `#cc-body.cc-power .cc-change-loop` has side padding; the
  "Slide along the low E string" / "Desliza por la cuerda Mi grave" titles join
  the two words with U+00A0 (1ca pins it). `tools/smoke.mjs` powerSwitchWalk:
  a best score of `CC_BPM_MAX` in 3 views × EN/ES (no scrolling, speed and tempo
  on one row, privacy line on screen, the pair columns at the same height with and
  without a score — 6 views, red on the old code at exactly 698px in all 6; the
  same-height check was red at a 15px `.cc-best-line`, green at 18px), the title at every window width 1366→920 in steps of 6 (the
  Spanish title broke between "Mi" and "grave" at 20 of them without the fix; the
  English one did not break at any width tried, so it is covered by the no-break
  space pin), and the done-screen button's padding. Change Up's done-screen
  "Pick different loop" button (the same `.cc-change-loop` class) got the same
  padding 2026-11-02 at Jonathan's word: the rule is now unscoped, and smoke checks
  both games' buttons in EN + ES.


- [ ] **2026-11-01 — Song popularity counter (Jonathan: "a counter on the
  teacher dashboard ... how many times each of those songs has been clicked on
  by a student"; chose "students + total opens").** A click on a "More Play
  Along songs" row (name or Play Along) runs `songsLibraryOpen(id)` (app.js):
  `{ name, email, songOpens: { <id>: increment(1) } }` merged into the student's OWN
  `progress/{uid}` — atomic, outside `flushSave()`'s payload (so 1bo's
  failed-load wipe cannot reach it), and allowed by the existing rules (no
  console paste). Not counted: teacher account, dev bypass, signed out, Core
  rows, opens from In-Class Activities or a link. The console's **Songs** view
  shows "Opened: N students · M opens" per song (`teacherFetchStudents` keeps
  whole counts 1..1000 only — student-written). Check **1ch** renders the rows
  and clicks every button, renders the console's Songs view with fake rows (3
  exact count lines, an archived student left out) and opens the card in 4
  failure modes (db null, Firestore not loaded, a write that throws, a refused
  write — it must carry a .catch); 10 mutants red. Reviewed same day
  (site-reviewer-deep: ship; emulator 14/14 on the real rules). Counts start 2026-11-01. The extra
  songs already counted toward practice minutes (all six use `-backing-`
  tracks; measured 8 s / 8 s on ca-36 and ca-42 from the Songs page) — no
  change needed there.

- [ ] **2026-11-01 — Early Friday check (Jonathan asked; range
  `friday-check-2026-11-01`..`dfcb8a7`, the 2 Fast commits plus the 4
  practice-minutes commits, the last 3 of which were never reviewed).** Three
  reviewers (Fast commits at high; practice-minutes data path and display at
  xhigh). Fixed and pushed: Live quiz Back button stretched (8a4376f); grey edge
  missing on Today cards and exit checks (050017a); practice minutes R2-1 (a commit on the wire at
  close is kept — Jonathan: count liberally, a rare double is fine; the keepalive no
  longer goes out on a dead link), R2-2 (sign-out/in on a
  Journey page lost the queue), R2-4 (clock moved back → double), R2-5 (token
  refreshed at session start), PD-1 (Jonathan: a miss before any streak spends no
  free miss), PD-2 (section tap popped the recap), PD-3 (recap stayed over My
  progress / a language switch), PD-4 (a recap made in a hidden tab blocked the
  real one), PD-5 ("Break week: no goal"). Left, all LOW:
  - [ ] Liberal counting can over-count (accepted, Jonathan 2026-11-01; the daily
    cap bounds it): Stop then closing the tab 2–3 s later re-sends the
    end-of-session batch (up to ~60 s) once; a chain of pages each opened and
    closed within ~2 s can re-send the same batch several times (sim: 84 played →
    144). To cap it at one extra send: keep the in-flight part of a leaving key
    in its own bucket (`{days, at, once}`) that an adopting page never puts back
    into its own leaving key while it is in flight.
  - [ ] The keepalive's dead-link guard only sees a commit in flight: a link that
    died after the last answer, with no commit sent yet, loses the keepalive's
    seconds (up to ~60 s).
  - [x] Test gaps — DONE 2026-11-02 (pm-sim section 11, 133 → 142 assertions,
    `PM_SIM_PIN` 142): the `newestGen` branch adding back failed seconds (two
    outcomes: a stuck commit that lands / fails after a newer sign-in AND another
    student's sign-in); buildOps' `flying` term (a keepalive beside an in-flight
    commit must mark the week hit); refreshToken() at session start (a page open
    two hours, no commit landed); pageshow clearing `leavingPage` (and, the other
    half, a really-leaving page whose keepalive could not go starts no commit when
    hidden). Each proved red with its own mutant, green without; the old 133 stayed
    green on 6 of the 7 mutants run.
  - [x] R2-6 — DONE 2026-11-02: `adopt()` also takes the exact key `pm:q:<uid>`
    (written by 70ef823, about 10:33–11:36 on 2026-11-01) and removes it; another
    student's key, even one whose uid starts with this one's, is left alone. A rare
    double is fine (counting is liberal). Red on the old engine in pm-sim.
  - [x] PD-6 (closed 2026-11-05: "N playing" and the heartbeats index are gone, so
    the squeeze cannot appear).
  - [ ] The bar's flame is orange only when this week is hit; My progress's flame
    whenever the streak is above 0 — pick one.
  - [x] Impossible tips — DONE 2026-11-02: `weekReach()` (practice-minutes.js):
    days left in the week (today included) × the daily cap, less what today
    already counted, against the minutes still needed. When it falls short the My
    progress tile AND the Stop recap say `pm.weekOut` ("You can't reach the goal
    this week. A new week starts Monday." / "Esta semana ya no puedes llegar a la
    meta. El lunes empieza una semana nueva."). A streak of 0 says `pm.streakNone`
    ("No streak yet" / "Aún no tienes racha") on the tile and the bar flame's
    label. pm-e2e pins a Sunday/Saturday boundary table (exactly enough, one
    minute short), EN + ES, the recap, and the flame label, under a moved clock so
    it holds on any run date.
    `site-reviewer` (high) on 611503a: R1-1 FIXED — `weekReach` rounded the minutes
    needed up before comparing against the seconds of room, so 1 s short with 1 s
    left said "can't" (1.64% of reachable Saturday/Sunday states); now compared in
    seconds, pm-e2e pins 1 s / 59 s cases (red on the old comparison). R1-2 FIXED —
    checks 1cg: `weeklyGoalMinutes` must be ≤ 7 × `dailyCapMinutes` (else every
    week says "can't"). Jonathan chose (a) "hide Longest at 0" — DONE 2026-11-02 (the empty line keeps
    its height; "No streak yet" over "Longest: 5 weeks" after a lost streak stays).
    (b) an old tab still running 70ef823 could keep rewriting `pm:q:<uid>`, which a
    new page adopts and deletes (those seconds could count 2–3 times) — CLOSED
    2026-11-02, Jonathan: nobody opened the site on Sunday 11/1, so no tab ran that
    build. Left, LOW: (c) `weekReach` is covered by pm-e2e only (not in checks.mjs): 8 mutants of it
    and `streakWords` all went red in pm-e2e, 8 stayed green in pm-sim.
  - [ ] The "goal reached" toast shows only on a practice card. A goal reached
    in a lesson snippet or on My progress waits for the next practice card on
    that page; one reached on a Journey page never shows (`pendingToast` lives
    in that page's memory only).
  - [ ] `tools/pm-e2e.mjs` seeds history counting back from the real date: with
    the live skip weeks its expectations fail in 24 of 32 school weeks from the
    week of 2026-11-23. Not a site bug — make its dates fixed.
  - [ ] `tools/smoke.mjs` draws no practice-minutes UI (dev bypass has no host
    user), and `tools/pm-rules-test.mjs` needs the emulator (not run from the
    cloud). (The old note about the heartbeats composite index is void: "N
    playing" and the index were removed 2026-11-05.)

- [ ] **2026-11-01 — Friday check (Fast commits `a615925`..`65898ce`): one
  small tidy-up left.** `site-reviewer` found no student-visible bug at 1366×657.
  Fixed in the same commit as this note: Find results still showed "#30 - "
  (R1-5); the under-900px 560px cap for Chord Blitz / Fret Zap / Power Chord
  Switch lost to later same-specificity rules (R1-3); 1ca now also pins Every
  bar as Change Up's first speed button (R1-2, proved red by reversing both
  games); one stale coach.js comment and a 1ca flag still saying "sticky" (R1-4).
  - [x] **R1-1 — DONE 2026-11-01 (Jonathan: "fix the optional look to what you
    think is best").** The grey edge now follows the "Optional" tag: teacher flag,
    optional-in-its-data (ca-34, 35, 36, 37, 39, 42) and the board's "Who" picker
    all get it; a CAS student gets none (every card is optional for them);
    a finished card gets none. `const quiet = !done && !caStudentIsCAS() &&
    caIsOptional(a)` in `caActivityCardHtml`. `tools/smoke.mjs` step
    `optional-edge` renders 8 cases for real (red on the old code in 2 of them:
    data, who).
  - [x] Leftover old-behaviour comments — DONE 2026-11-02: styles.css's Change
    Up sticky-bar comment, tools/smoke.mjs's Change Up walk comment and its "in
    its sticky bar" summary label, and the ungrouped branch of
    `caStartHereTagHtml` (grep: its one production caller passed `grouped = true`;
    the function is now just the exit-check tag, and `grouped` is gone from
    `caHeroCardHtml`/`caHeroCheckHtml`). Went with it: the CSS rules
    `.ca-hero-tagrow` / `.ca-hero-from` and the i18n key `ca.checkNotFinished`
    (used nowhere else). Power Chord Switch's results screen is full width,
    left-aligned (Change Up's is a centred 560px column) — still so, on purpose.

- [ ] **2026-10-31 — Friday check (first run, a practice run): what it found
  and did not fix.** `site-reviewer-deep` (student-facing) and `site-reviewer`
  (Hear It First) read every commit on `main` from `1c1e6c6` to `59e7915`.
  No BLOCKER. Fixed in the same commit as this note: Note Call's power-chord
  done screen said "notes" / "Practica estas" over a list of chords (R1-2, two
  `ncp.*` keys, 1cd pin 16 → 18); a Hear It First phrase counted a note that
  timed out as "not graded", so playing 1 of 5 notes scored 100% (R2-2); Stop
  during placement counted as a session (R2-5); the e2e check "loads no
  trainer-core/audio/ui" had a `\\.` regex that could never match (R2-3); the
  CHANGELOG said the trainer opens "for one signed-in account" (R2-7).
  Waiting for Jonathan:
  - [x] **R2-1 (MAJOR, teacher console)** — DONE 2026-10-31, Jonathan chose to keep the profile in the cloud and skip his own uid: a Hear It First save creates
    `progress/{uid}` holding only `trainer` (`trainer-site-adapter.js:82`). If
    that is the teacher's own account, the console roster
    (`teacherFetchStudents`, `teacher.js:532`) shows a nameless row under
    Unassigned. Two fixes: skip the signed-in teacher's uid in
    `teacherFetchStudents` (a `teacher.js` change, always Reviewed), or keep the
    teacher's trainer profile local only (then it doesn't follow him between
    machines). Your call.
    **Shipped:** `teacherFetchStudents` skips the signed-in account's own
    document when the row it would draw is empty (no name, email or period, and
    nothing in skills, responses, games, classActivities or exitChecks). A
    test-student document under the same account is still listed (reported as an
    interpretation). The first version tested "only `trainer`" and the review
    found it stops working at the second page load: Hear It First runs in student
    mode, and every student-mode load runs `swap45Commit`, which adds
    `migrations.swap45`, so the real stub is `{trainer, migrations}` (R3-1).
    Check 1cf runs the real function: 8 documents x 6 sign-ins; broken six ways.
  - [x] **R2-4** — DONE 2026-10-31: `trainer-site-adapter.js` loads on every page but is listed in
    `SHELL_NOT_PRECACHED` (`tools/checks.mjs:98`), so offline page loads get a
    failed script request (console only). Fix = add it to `sw.js` `ASSETS`
    (sw.js code: always Reviewed). `checkPrecacheCoverage` reads only `img/`
    and `.html` references, not `<script src>`.
    **Shipped:** the adapter is in `sw.js` `ASSETS` (88 assets) and off
    `SHELL_NOT_PRECACHED`. `checkSwAssets` also fails when a script that
    `index.html` loads on every page (comments stripped; 10 today) is not in
    `ASSETS`: the two lists alone let the original bug come back in one edit
    (review R3-4; shown with the adapter and with `live-quiz.js`).
  - [x] **R2-6** — DONE 2026-10-31: Hear It First's "Last session" date and decay days are UTC
    (`dayStr`, `trainer-core.js:87`), so an evening session shows tomorrow's
    date. A local-date `dayStr` makes `trainer-sim` U12 fail under
    `TZ=America/Los_Angeles` (its `BASE` is UTC midnight), so the sim needs a
    noon `BASE` in the same change.
    **Shipped:** `dayStr` is the local date; `trainer-sim` `BASE` is noon UTC and a
    new unit U12b pins the local date. The sim passes under
    `TZ=America/Los_Angeles`, `TZ=UTC` and `TZ=America/New_York`; it fails under
    `TZ=Pacific/Auckland` (UTC+13), which the `BASE` comment says.
  - [x] **R1-1** — DONE 2026-10-31: on ca-43's two-fret cards (E5 low E, A5 on A: frets 0 and 12) the
    mic usually credits fret 0 when the student plays at fret 12 (the octave
    below is fret 0's root). Score is right; the fret named is wrong. Fix idea:
    name and mark both frets ("fret 0 / 12") on a mic hit; check 1cd's
    ncListen expectations change with it (changed check logic: Reviewed).
    **Shipped:** a mic hit on a two-fret power card names and marks both frets
    ("fret 0 / 12"); a tap, a one-fret card and single notes are unchanged. 1cd
    now checks every mic hit carries the flag, and runs the real `ncResolve` and
    the real `ncTap` (scored and play-along) on a two-fret power card, a one-fret
    card and a two-fret single note, EN + ES, reading back the text and every
    `flashClass` call (which marker, which string, which colour). Broken ten
    ways, four of them found by the review (R3-3) that an earlier version missed.
  - [x] **R1-3** — DONE 2026-10-31: Change Up's setup at 1366×657: the −5/+5 row is now fully below
    the screen and Start is lower (80px charts from `639248b`). Power Chord
    Switch's sticky Start bar would fix it, but check 1ca pins "Change Up must
    stay as it was". Your call.
    **Shipped:** Change Up's Start is in the same sticky bar; the 1ca pin now says
    so on purpose; a new smoke walk measures it at 1366×657 in five views. The
    −5/+5 row is still below the first screen (only Start is pinned).
  - **Check 1cd blind spot:** it only sees strings asked for through `ncK()`,
    which is how R1-2 got past it; a direct `t('nc.*')` on a power screen is
    invisible.
  - **Should not have shipped Fast:** `639248b`, `6871747`, `b3a351c`,
    `cb3dc5e` (mic detection) and `5e2061e` (new check 1cc). Reviewed now.
  - The 2026-10-30 item below: the reviewer pass is done (findings above);
    the look at the LIVE site in a real browser is still not done, so it
    stays open.

- [ ] **2026-10-31 — For the cloud review: pushed without a reviewer.**
  Jonathan asked for everything to be pushed and reviewed in the cloud. The four
  code commits below carry `Review: Fast` so the Friday check also finds them.
  - **On `main`, after `66266c9`:** `ca-43 Note Call: the mic hears a strummed
    power chord`, `...review fixes — Start works without coach.js...`,
    `Power Chord Switch: Start stays on screen...` and `ca-43 Note Call: the mic
    no longer accepts the 5th`. `coach.js` is a danger-zone file and was edited
    (`coachPowerTargets` moved to `app.js`; Riff Runner's `rnwTargets` calls it).
    Look for: any page or worker that loads `coach.js` without `app.js` (only
    `index.html` loads it, and it loads `app.js` too); Note Call's Start with no
    `coach.js` (tap mode); `ncClash`/`ncDeal` with a pool of 1-3 cards; whether
    check 1cd and the fresh-page walk in `tools/smoke.mjs` go red when the
    original bug comes back (1cd was broken three ways by hand; the smoke walk
    was not mutated).
  - **What was run:** full `node tools/checks.mjs` passes at the tip. The browser
    smoke test passed at the tip, 0 errors against 9 on `origin/main` (the first
    run hung for 29 minutes at 0% CPU and was killed; the second passed). The mic
    sims on the real files, 20 trials, show no STOP row at any of the three
    guitar sounds. **Not run:** a reviewer (one was started and stopped before it
    reported), a look at the live site, a real guitar through a Chromebook mic.
  - **Jonathan's call, 2026-10-31:** Note Call no longer accepts the 5th. Kept,
    a wrong chord a 5th above the card counted right 7.7% / 28.9% / 100% at the
    std / mid / weak sound. Dropped, 0 of 1040, and all 15 right-strum rows are
    unchanged. An earlier question to Jonathan said dropping it "would miss more
    right strums"; that was not measured and the sims showed it was wrong.
  - **Weak spots left alone:** at the std sound a strum with the root string much
    quieter is heard 67.1% of the time, and a two-string root + 5th 65.4%.
    Riff Runner's Wait Mode still takes the 5th, so a chord a 5th above passes
    there too (not measured).
  - **Branch `phase5-sw-audio` was merged to `main` on 2026-10-31** (Jonathan:
    "push it", after the review below and its fixes; fast-forward, so the
    branch's commits are on `main`, including the early one whose subject says
    "NOT REVIEWED, NOT ON main"). It changes `sw.js` (always
    Reviewed): one stable audio cache, a per-file hash map written into `sw.js`
    by `tools/checks.mjs`, an eviction pass at activate, and a one-time migration
    so the first deploy re-downloads nothing. New: `tools/sw-audio-map.mjs`,
    `tools/sw-audio-proof.mjs` (runs the real `sw.js` against a stand-in cache:
    39 assertions, 13 deliberate breakages all caught) and check 1ce. The proof
    found one bug, fixed: a cached track was refetched on every play and stored
    over under the current hash. Review before merging: `AUDIO_MIGRATION_FP` must
    equal the live audio fingerprint (check 1ce and the sync check enforce it),
    `AUDIO_CACHE` must keep its name, and what a half-failed install, a quota
    error or two tabs on two worker versions do to the records. The brief for
    phase 5 was lost in the crash; this was built from the code comments, so check
    it against what Jonathan wanted.
    **Reviewed 2026-10-31 (`site-reviewer-deep`, real headless Chrome with a
    GitHub-Pages-like server; 61 live deployments checked).** The merge deploy
    itself is correct: 0 audio re-downloads, the right bytes, 77 of 77 hashes
    match the live files, and a brand-new student stores each track with its
    record. Fixed on the branch: a CRLF `sw.js` (a Windows checkout) failed the
    checks (R1-1); a rollback round trip lost the "already adopted" marker and
    then vouched for the wrong bytes for good (R1-2: the marker now lives in
    `AUDIO_CACHE`, which the old worker keeps); `AUDIO_MIGRATION_FP` set to the
    NEW fingerprint passed every check (R1-3: it may only be `''` or the
    fingerprint in `AUDIO_CACHE`'s name); the proof missed a stored 404 or
    foreign answer, a commented-out pin and a renamed records cache (R1-4); stale
    comments and docs (R1-6). Proof now 50 assertions in 11 scenarios, 21 of 21
    breakages caught. **Left on purpose (R1-5):** a student who does not open the
    site while the merge deploys loses every track at the next audio deploy (as
    before this branch); the migration is a one-time adoption.
    **Done at the merge (2026-10-31):** no `audio/` change on `main` since
    `ff9e913a6d`; the live `AUDIO_CACHE_VERSION` equals the branch's `AUDIO_CACHE`;
    full checks, the audio proof and smoke passed on the tip. **Still to do after
    it deploys:** `node tools/checks.mjs --live`; and **the next push that changes
    `audio/` must set `AUDIO_MIGRATION_FP` to `''` first** (never to the new
    fingerprint; check 1ce fails otherwise).
    **Merge checklist (kept for the record):** (1) `git fetch`; if `audio/` changed on `main` since
    `ff9e913a6d`, the live cache name is no longer `AUDIO_CACHE_NAME`: set
    `AUDIO_MIGRATION_FP` to `''`, expect one full re-download, and re-pin the
    name in `tools/sw-audio-map.mjs` deliberately; (2) `node tools/checks.mjs`,
    `node tools/smoke.mjs --baseline origin/main`; (3) after the push,
    `node tools/checks.mjs --live`; (4) never roll `sw.js` back past this merge
    without the rollback step in `.claude/skills/audio-and-snippets/SKILL.md`.

- [ ] **2026-10-30 — Everything pushed in a hurry today needs to be checked.**
  Jonathan had to reboot the machine, so the last pushes went out with the
  checks and the browser smoke test but no reviewer pass, and no one looked at
  them on the live site. Check each item in a real browser on the live site, in
  English and Spanish, at 1366×657. Then run `site-reviewer` on the commits.
  - **Power Chord Switch** (`d4544a3`, `1c3062b`, both sent as "Fast"). It now
    opens on "Every beat"; the speed row and the tempo buttons sit above the
    chord choices; "Two random chords" is the first choice and is selected; the
    3- and 4-chord loops are gone (11 pairs left); the chord charts are 180px.
    Try: a random round, "Every bar" and "Every 2 beats", the −5 / +5 tempo
    buttons, a fixed pair, the done screen and its "pick a different loop"
    button, and that Change Up still looks the same.
  - **Watchtower play-alongs, Jimi Hendrix / Neil Young switch** (four large
    mp3s). It was committed in an earlier session and pushed today after a
    rebase onto 12 newer commits. The rebase had conflicts in `CHANGELOG.md`
    and `sw.js`, fixed by hand (`sw.js` took GitHub's version line and the
    full checks re-bumped it). We could not tell whether the original commit
    had a reviewer pass. Try: the switch on `ca-26`, `ca-29` and `ca-40`; the
    choice survives a reload; both recordings play; the Guitar on / off switch
    works on both; the lyric sheet card stays on Jimi Hendrix.
  - **Branch `wip/main-folder-2026-10-30` is NOT on `main` and is not live.**
    It holds the uncommitted edits that were sitting in the main folder
    (`C:\Users\jhoffman\Documents\GitHub\guitar-class`), pushed so Jonathan can
    work on them from another machine. They look like review fixes to the
    Watchtower switch: `caTeacherRedraw` (a switch on `ca-40` in the teacher
    console swapped the room's projector card for the Class activities page;
    review R1-1), the recording-switch inline handler now uses `jsonAttrArg`,
    corrected lap counts (lap 82 holds the A, Part 8 is 11 laps, 86 laps in the
    file, laps 70-74 not confirmed), `songVersions` renamed to
    `recordingVersions` in comments, a clearer Neil Young caption, matching
    pins in `tools/checks.mjs` and `tools/smoke.mjs`, and a `song-facts` note.
    **Update (Friday check, 2026-10-31): `main` already has these fixes** — they
    shipped as `158015d` (`git diff origin/wip/main-folder-2026-10-30 158015d` on
    the code files is empty). Don't ship the branch; it can be deleted.
    Status of the branch: based on `main` at `6b120f8`; the full checks pass
    (cache version bumped); the browser smoke test and a reviewer pass were NOT
    run. To ship it: check it out, run
    `node tools/smoke.mjs --baseline origin/main`, ask `site-reviewer`, then
    fast-forward `main`. The untracked `tools/__pycache__/` was left out (a
    Python cache, not in `.gitignore`).
  - **The main folder itself** still holds those same edits, uncommitted, on an
    old base (12+ commits behind). Its one local commit (`5634815`) is on
    GitHub as `5e2061e`. Once the branch is safe on GitHub, the folder can be
    moved to `origin/main` (`git stash`, `git fetch`, `git reset --hard
    origin/main`); the stash keeps the edits as a second copy.
  - **Two leftover worktrees** to remove: `guitar-class-pcs` (branch
    `power-chord-switch-beat`) and `guitar-class-wt` (branch
    `wip/main-folder-2026-10-30`). Leave them first (PowerShell's folder), or
    the empty folder stays locked.

- [x] **2026-09-15 "the cure" both-strings root line — plan at
  `archive/PLAN-unit-2-assessment-site-v2-2026-09-15.md`.** Verse+chorus root
  line now crosses the low E and A strings — A(low E 5) C(A 3), F(low E 1)
  C(A 3); D(A 5) F(low E 1), C(A 3) G(low E 3), one hand position (index 1,
  ring 3, pinky 5), matching Layer 3's existing power-chord roots. Updated
  in Journey Layer 2, `ca-13` (retitled "Verse and Chorus Roots," all six
  rungs rewritten), and Module 2's "the cure" challenge card; the old
  low-E-only verse survives as the Level up everywhere. Unit 2 assessment
  text (Assessments page, `mr2-s7`, `assessItems`) now reads Watchtower
  (low E) + SNA (A string) OR "the cure" both-strings, at song tempo with
  the backing track; practice cards ladder 60 → 100 BPM → track. Watchtower
  and SNA challenge titles now name their string. Pushed `6e73cd9`, checks
  green, deploy-verified live. **Hit the plan's own stop condition**
  (figure needs two strings marked, the CLI only did one) — Jonathan chose
  extending the diagram library over the other options offered; `guitar-
  diagrams.js`/the CLI gained `localStringMultiNotesSvg`, a real two-string
  notes renderer, used for the new `img/ca-cure-roots-both.svg`. The
  retired `ca-cure-roots-verse.svg` had no actual "archive" exception in
  checks.mjs (the plan assumed one that didn't exist) — kept in use by
  wiring it into `ca-13`'s Level up rung instead of deleting it or leaving
  it orphaned.

- [x] **2026-09-12 Fretboard Tap — work order at
  `OPUSPLAN-fretboard-tap-2026-09-12.md`.** `type:'fret'` live-quiz
  questions; `fret-lowE` (Phase 1), `fret-lowE-A` + `fret-all` (Phase 2).
  Both phases pushed to `main`, checks green. Deferred, not rejected: a
  chord-builder (multi-dot) type; a per-student tap breakdown on the
  console; sharp/flat targets.

- [x] **2026-09-09 exit checks — work order at
  `exit-checks-work-order-2026-09-09.md`.** Engine + `ca-14` (Phase 1),
  `ca-15` + docs (Phase 2). Both pushed to `main` and deploy-verified.
  The ratchet shipped as **1y**, not the 1x the order named — `1x` was
  claimed the same morning by db377ce (orphaned assets), which is the
  argument for reading `checks.mjs` before reserving a letter. Deferred,
  not rejected: a console toggle for `retake` (today it's a data field);
  a `chordName` item type; a per-class average on the Students view;
  adding the `kind:'check'` schema to the `guitar-class-activity` skill.

- [x] **2026-09-05 site audit — work order at `OPUSPLAN-site-audit-2026-09-05.md`.**
  **All six phases are done and pushed** (four commits, one per phase group).
  The plan's closing section lists the handful of items deliberately left
  undone and why. **Merged to `main` 2026-09-05**, and two of the three
  deferred items landed after the merge: the Mood chart is now fully
  bilingual (230 phrases; English stays the lookup key so `DATA.defs` /
  `DATA.hear` still resolve), and dark-mode figures flip the SVG line art
  (invert + hue-rotate, so the green note dots stay green) while photos
  keep the gentler dim. Still open on purpose: caching `config/class` in
  the teacher console (needs the live console to prove a post-write
  repaint from a plain one), per-key save dirtiness, and Note Hunt's
  colour-only round dots. `CHECK-BEFORE-YOU-TRUST-IT-2026-09-05.md` is
  the running list of what still needs Jonathan's eyes — the Mood chart's
  Spanish above all, since nothing on his side reads it.
  A Claude Code on the web session ran `checks.mjs` (all offline checks
  green), a headless-Chromium walk of all 36 sets in EN + ES plus the 16
  games (no renderer exceptions), an adversarial read of the app JS, an
  HTML/CSS/contrast/PWA pass, and scripted EN↔ES and music-theory checks.
  Six phases, bugs first: the dev-bypass `flushSave` crash (confirmed
  live), the bare `IS_TEACHER_MODE` read in the auth callback, the
  warm-up-section title that every progress key silently depends on, the
  SW auto-reload that can discard in-flight saves/recordings, two regex
  lookbehinds that break Safari < 16.4, the phone-width play-sequence
  overflow (confirmed at 375 px), then rules hardening (one item needs
  Jonathan's call on restricting sign-in to `seq.org`), modal focus
  management, four dark-mode contrast failures, precache size (a 1.9 MB
  PNG + all-or-nothing `addAll`), and lazy-loading `teacher.js`/`coach.js`.
  Three new checks.mjs ratchets are specified. The YouTube link check and
  `--live` could not run from the cloud (proxy 403) — do them locally.
  **Phase 1 landed 2026-09-05**: the dev-bypass/offline `flushSave` crash, the
  bare `IS_TEACHER_MODE` read, the warm-up-title-dependent progress keys (all
  27 sections now carry `kind:'tuning-warmup'`, ratchet 1r), the SW reload now
  waiting on live drills/recordings and flushing queued saves first, both
  Safari-breaking regex lookbehinds (ratchet in check 0), the teacher
  drill-gate drift, and the phone-width overflow of the play/Coach buttons,
  the About panel and the rail drawer. Verified in headless Chromium — see the
  plan's Phase 1 section for what each test showed. **Caught in passing:**
  moving `IS_TEACHER_MODE` into app.js broke the render smoke test's stub, and
  0b only *warns* when its harness fails to load, so the check went silently
  untested while everything else stayed green — stub fixed, and promoting that
  warning to a hard failure is now a Phase 6 item.

- [x] **2026-07-26 deep site audit — remaining backlog.** Three parallel
  agents (core app JS · modules 8–13 · modules 1–7) plus a live browser pass
  found ~90 issues beyond what `tools/checks.mjs` can catch. All 9 Critical
  and 7 Medium items are fixed and pushed (`bc757ae`) — section-index desync,
  Coach mic race, Smoke on the Water strings, the major/minor rule, the
  pinky/3rd-finger contradiction, the Sweet Child TAB octave error, the
  Module 8/12 Travis-picking contradiction, the self-answering Module 11
  drill, the backwards Spanish TAB explanation, the tuner high-e bug, the
  save-retry loop, teacher-dashboard error mislabeling, the untranslated
  `{bpm}` string, several Module 6 mismatches, `img/` missing from the cache
  fingerprint, and SW audio caching. **A later 2026-07-26 session worked the
  rest of this list** — content errors, skill-tag mismatches, i18n gaps,
  paper-drill remnants, `gotItWhen` coverage, song-list inconsistencies, and
  every item in the app.js/coach.js/tuner.js/teacher.js code group are now
  fixed (unpushed as of this edit — run `node tools/checks.mjs` before
  pushing). **Closed out 2026-07-27** (via a workflow with a built-in
  adversarial review per fix group — see each item below for what it
  actually caught): the four dedicated single-chord cards; the module-4
  pull-off/slide gloss inconsistency; the `module-9.js`/`module-11.js`
  list-vs-prose spots (turned out already fixed by `eeefbda`, just
  undocumented); and the degenerate one-`<li>` list sweep (turned out not to
  be a bug at all — see that item). **Still genuinely open, on purpose:**
  the `m5w4` Full Run card's missing Journey chip (no single static link
  obviously fits a card that references whichever of three songs the
  student picked); the three items below still marked for Jonathan
  specifically (list-sweep over-listing check, Coach gate real-guitar test,
  Note Runner real-guitar test) — all three need his eyes/hands, not more
  code. Grouped by file so a session can take one group at a time:

  **Content — promises content the set doesn't teach (Jonathan flagged this
  one as next priority):** ⚠️ **Important finding while working this section
  (2026-07-26):** `objective` and the whole `assessment` object
  (`goal`/`performance`/`selfCheck`/`standards`) were **dead fields** —
  `buildAssess()`/`buildVideos()` in `app.js` are defined but never called
  anywhere, confirmed by grep. So most of this category's "promise" was
  never actually shown to a student — only the live fields (`subtitle`,
  and the `skills[]` checklist itself) matter. **Resolved 2026-07-26:**
  removed the dead `objective: 'I CAN…'` field entirely — all 36 occurrences
  across module-1.js…module-13.js, plus the now-pointless `checks.mjs`
  validation for it (`skillFocus`/`unit` already cover that ground live, per
  the `buildSet()` comment in app.js). `assessment` (`goal`/`performance`/
  `selfCheck`/`standards`) was left in place at the time — still dead
  code-wise, but Jonathan confirmed its content (which songs/chords are
  assessed) was meaningful to him even unrendered. **Reversed 2026-09-02:**
  asked again, and Jonathan chose deletion — all 35 blocks removed across
  `module-1.js`…`module-12.js` (m13w1 never had one). Nothing student- or
  teacher-facing changed, because nothing ever read the field; the text is
  recoverable from git if it is ever wanted. The assessment content that
  DOES render is `MODULE_REVIEWS[n].assessItems` / `.standards` in the
  Module Review — a different, per-module object, untouched.
  - [x] `module-5.js` (m5w2) — Dm and G/B now have real teaching content:
        two new challenge cards ("Fret Dm cleanly", "Play the G/B bass
        turnaround") with diagrams, hint/stuck/levelUp prose, and two new
        skills (`m5w2-s7`, `m5w2-s8`), inserted right before the "the cure"
        song card so the shapes are taught before they're used. Confirmed
        real (not dead-field only): Jonathan wants "the cure" performable as
        one of the three Module 5 assessment song options, and Dm/G-B are
        needed to actually play it. `config-main.js` skillCount 5: 24→26.
  - [x] `module-7.js` — m7w2's `objective` trimmed to drop the B-major
        overreach (dead field, but cheap to fix). m7w3's three conflicting
        A-shape chord lists (subtitle "Bb·B·C" / skill+assessment "Bb·C·D" /
        actual drill "C·D·E") unified on **C·D·E** — matches the live
        `subtitle` and the actual "A-Shape Slide" challenge card content.
        Fixed in `subtitle`(_es), skill `m7w3-s4` (text/gotItWhen/practice —
        this one's a live checklist item, not a dead field), the dead
        `assessment.goal`(_es), and `MODULE_REVIEWS[7]` `mr7-s5`. B major
        itself is fine as-is — it's genuinely taught in m7w3 Challenge 1,
        just via the A-shape, not the E-shape m7w2 had overpromised.
  - [x] m5w2's individual chords (C, F, G) and m5w3's A major each now have
        their own single-chord "Fret X cleanly" challenge card, matching Set
        1 (Am, Em) and Set 3 (D, Bm) — same voice/structure as those and the
        Dm/G-B precedent (`<ol>` body, hint/stuck/levelUp, a chord diagram
        reusing the fingering already taught elsewhere in the file), linked
        to the existing `m5w2-s1/s2/s3`/`m5w3-s2` skill ids (no new skills,
        no `config-main.js` change). Fixed 2026-07-27 via a workflow with a
        built-in adversarial review: the reviewer caught a real
        self-contradiction in the new "Clean F (simplified)" card's `hint` —
        it told students to "arch the finger at the very tip" while
        describing a 2-string mini-barre, which needs a flat finger, not an
        arched one — corrected before landing. Browser-verified (dev bypass,
        both languages): all three new Set 2 sections and the new Set 3
        section render in sequence with the existing dedicated-chord cards,
        list + trailing "You've got it when" render correctly, chord
        diagrams display, no console errors.

  **Content — factual/consistency errors (module-1–7 agent):**
  - [x] `module-5.js:41-57` vs `:258-261` — "X above a string" MC keyed two
        contradictory ways ("don't play it" vs "mute it"). Both now say
        "skip it" — no more "mute it" alternative.
  - [x] `module-5.js:434` — sends students to find a shared pivot finger
        between C and G that doesn't exist in this module's shapes (own
        `:484`/`:589` admit it). `levelUp` now points at Am↔F instead.
  - [x] `module-5.js:955` — "all six strings ringing clean" on a D/C chord
        pair that only uses 4–5 strings. Reworded to "every string you
        strum ringing clean."
  - [x] `module-4.js:1010` — composition example mixes major- and
        minor-pentatonic scale degrees; unplayable as written. Rewritten to
        `1 ♭3 5 ♭3 | ♭7 5 ♭3 1` — consistent minor-pentatonic degrees.
  - [x] `module-2.js:770-780` and `:263`/`:247`/`:258` — SNA riff described
        three ways on one card; three different pass thresholds for one
        drill ("9 in a row" vs "10 in a row" vs "9 of 10"). All instances
        (drill text, assessment `performance`) now read "9 of 10."
  - [x] `module-2.js:283` (EN) / ES twin — "one octave up" from low-E fret 7
        is actually a 4th, not an octave. Now says "a fourth higher."
  - [x] **DECISION MADE 2026-07-26:** `module-6.js` — "Knockin' on Heaven's
        Door" was **rewritten to the real bar lengths**
        `|G|D|Am|Am|G|D|C|C|` (Am and C each hold two bars), not just
        re-labeled — `text`/`stuck`/`levelUp` and the `MODULE_SONGS[6]`
        meta line all updated. Chose "teach it right" over "label the
        simplification," the opposite of "the cure"'s power-chord
        treatment (Jonathan's call for this song).
  - [x] `module-1.js:60` — `explain` references a "wiping the strings"
        choice that doesn't exist among the MC options (leftover text).
        Sentence removed.
  - [x] `module-1.js:650` — `w2-s3` choice "All of the pick" accidentally
        matches the `MC_PINNED` "all/none/both/neither of" regex and never
        shuffles position. Reworded to "The whole pick, gripped at the
        edge" — no longer matches the pin regex.

  **Content — mis-tagged/missing skill links (module-1–7 agent, not
  individually verified, spot-check before batch-fixing):**
  - [x] `skills:[n]` pointing at the wrong skill id: `module-4.js:67, 554,
        919, 988`; `module-3.js:504, 687`; `module-5.js:804, 823, 945,
        1104, 1198, 1219, 1240`; `module-6.js:82, 247, 265, 299, 460, 476,
        561, 579, 598, 794`; `module-7.js:166, 464, 872`. Knock-on: 8
        skills across M1–7 are tagged on no step at all, so their "📍 Show
        me where" button silently disappears — `w1-s2, w1-s3, w2-s1, w2-s2,
        w2-s3` (module-1), `m2w1-s4, m2w1-s5` (module-2), `m5w4-s4`
        (module-5). All corrected/added — every referenced line now points
        at a real skill id, and the 8 previously-orphaned skills are each
        tagged on at least one step.

  **Content — i18n drift and Spanish glossary (all three agents):**
  - [x] `module-2.js:265` — EN levelUp says "run the Shuffle deck"; ES says
        "haz el ejercicio de papelitos" (paper slips) — the pre-digitization
        version. ES now matches EN.
  - [x] `module-1.js` — 8 "You've got it when:" standards live inside
        `hint:` instead of `text:`, where `wrapGotItWhen` can't reach them
        (`:37-437`, spot-check each). Modules 2–7 have zero instances of
        this — Module 1 only. All 8 moved into `text`/`text_es`.
  - [x] `module-10.js:737/738` — ES `levelUp` says something different from
        EN (tells the student to "ask someone to call out keys" — a
        pre-digitization partner-drill leftover). ES rewritten to match EN
        ("name the fret before the card finishes turning").
  - [x] `module-12.js:256` — `text_es` keeps an English link label
        ("Station B's Travis pattern lesson video") instead of using
        `nav.stationBTitle`. Translated inline.
  - [x] Solfège-vs-letter convention slips (`cuerda B` should be `cuerda
        Si`, etc.): `module-5.js:571, 588, 703, 705`, `module-3.js:370`;
        conversely `module-3.js:368/370` solfège-izes a chord name (should
        stay a letter). Module-9's known ~30-instance version of this is
        already logged separately — don't re-sweep it. All 5 corrected
        (module-3's "Mi mayor" → "E mayor" for the chord name, plus its
        "cuerda B" → "cuerda Si").
  - [x] Minor ES inconsistencies: "Ear Spark" translated two ways in
        `module-2.js:333` vs. 19 other instances — **fixed**, both now say
        "Chispa auditiva." `module-4.js:~807` (inside `m4w2-s3`'s practice
        MC) glossed "pull-off"/"slide" inconsistently — **fixed 2026-07-27**:
        the ES choice for "snap your finger off the string sideways" had
        been mistranslated as "deslizando" (sliding), the site's word for
        the *slide* technique, not pull-off; corrected to "sacando … de un
        tirón hacia el costado," matching module-7.js's own canonical
        pull-off gloss. A few other small ones the module-1–7 report lists
        under "Minor ES" weren't individually re-checked either.
  - [x] `module-2.js:704, 721` — TAB `phrases[].label` is English-only and
        the renderer (`app.js:694`) uses `escHtml` not `tf()` for it — needs
        a renderer fix, not just a data fix. Module 2 is the only module
        using `phrases:`. Renderer now does `escHtml(tf(p,'label'))`, and
        both Happy Birthday phrase labels got `label_es` twins.

  **Content — paper-drill remnants that should be digital decks (project
  rule: no scissors/index cards/pen anywhere student-facing):**
  - [x] `module-2.js:226` — draw shuffled fret slips, right above the
        digital deck that already does this. `levelUp` now points at the
        Shuffle self-quiz deck instead.
  - [x] `module-3.js:187, 233, 369` — homemade flashcards / paper slips;
        Module 3 has zero `drill:` widgets despite Challenges 3–5 being
        textbook `deck`/`shuffle` cases. Now has 4: a new `deck:
        'power-chord-shapes'`, two `shuffle` drills (low-E and A-string
        roots), and `deck: 'e5-vs-emajor'` for the Ear Spark card.
  - [x] `module-5.js:740, 1017` + `MODULE_REVIEWS[5].assessItems` — shuffle
        homemade chord flashcards (a textbook `deck` case). New `deck:
        'chords-group1'`/`'chords-m5'` cards added; performance/assessItems
        text now says "run the chord deck."
  - [x] `module-8.js:571-578` — the one Ear Spark on the site with no
        `drill:{type:'ear'}` wiring; needs a new `EAR_POOLS` entry (neither
        existing pool covers "A-string vs D-string bass under Am"). New
        `amBassAD` pool added to `EAR_POOLS` in app.js and wired in.
  - [x] `module-9.js`, `module-10.js`, `module-11.js` — several
        assessment/performance fields still say "shuffle flashcards" /
        "draw a slip" even though the matching digital deck already exists
        a few lines away (`module-9.js:503,518,519,731,788`;
        `module-10.js:519,818`; `module-11.js:681,771`). Also leftover
        partner-dependency lines: `module-9.js:439,712,1062,1068`,
        `module-10.js:750,774`, `module-11.js:777`. All reworded to
        reference the existing deck/drill; a re-grep of all three modules
        for "flashcard/papelito/Got someone/partner" now comes back clean.
  - [x] `module-2.js:252` — the one card in M1–7 with a `drill:` that still
        keeps the "Got someone around?" partner line the project rule says
        to drop once a card has a deck. Line removed.

  **Content — coverage gaps (module-8–13 agent):**
  - [x] `gotItWhen` is blank on ~57 skills across Modules 10–12 (module-9 is
        partially thin too) — coverage is ~75% in Modules 1–8 and craters to
        4-10% in 10–12. Full id list is in the agent's report (already
        summarized in this session's chat log — re-run the module-8–13
        review agent if that transcript isn't handy, rather than
        re-deriving by hand). Verified 2026-07-26: every skill in Modules
        8–13 now has a `gotItWhen`/`gotItWhen_es` pair (0 missing, checked
        programmatically).
  - [x] `module-12.js` — `MODULE_REVIEWS[12].forward` never mentions
        Module 13, so a student finishing Module 12 is told the course is
        over. `forward`/`forward_es` now describe Module 13 before the
        capstone-performance paragraph.
  - [x] `practice.label` i18n holes the checker can't see (only validated
        for `type==='playSeq'`, but `fretboard`/`chord` types render it
        too): `module-9.js:514,517,784,787,790`, `module-11.js:902`. Same
        gap exists sitewide (module-2 ×3, module-5 ×1, module-7 ×4) — worth
        fixing `tools/checks.mjs`'s scope, not just the data. Both fixed:
        `checks.mjs` now requires `label_es` for `fretboard`/`chord` too,
        and all the flagged data locations (module-2 ×3, module-5 ×1,
        module-7 ×4, module-9, module-11) got their `label_es`.
  - [x] `module-9.js:970-990` — a "7th-position" cold-read line actually
        spans frets 5–10 (six frets); either it's really 5th position with
        a stretch, or drop the position-number claim. Reworded to "5th
        position with a stretch up to fret 10" throughout (text, hint,
        tab caption, playSeq label).
  - [x] `module-8.js` — Sets 2 and 3 (`m8w2`, `m8w3`) are missing the
        "Warm-up — tuning check" section every other set in Modules 1,
        9–12 opens with. Both sections added.
  - [x] `module-8.js` — `MODULE_REVIEWS[8].skills` ids skip s5/s6
        (`mr8-s1,s2,s3,s4,s7,s8,s9`) — harmless (ids are just storage
        keys) but suggests two review rows were deleted without
        renumbering. Renumbered to `s1`–`s7` with no gap.

  **Content — list-vs-prose rule (cards over ~200 chars with more than one
  action, still written as a paragraph — project rule says these should be
  `<ol>`/`<ul>`):**
  - [x] `module-11.js:856` (386 chars, no list) and `module-9.js:82` vs its
        sibling `:92` (inconsistent — one's a list, one isn't) plus
        `module-9.js:351` — **turned out already fixed** (checked
        2026-07-27): commit `eeefbda` had already converted all three, its
        own commit message and this line just never got updated to say so.
        Verified by diffing `eeefbda` against its parent — all three are
        correctly `<ol>`s in EN+ES, original wording preserved, nothing left
        to do. The line-856 citation itself had also drifted with later
        edits (the real card is now ~line 878). `module-13.js:188, 248, 298, 310, 324` (all multi-action
        prose in a module where every other procedural step is a list) —
        **fixed**, all 5 converted to `<ol>`/`<ul>`. `module-10.js:148, 422,
        718` (warm-up tuning cards, prose here but `<ol>` in every other
        module) — **fixed**, all 3 converted (module-8's two new warm-up
        cards were also written as lists from the start). Lower-confidence/
        optional per the agent: module-8.js:35,361; module-9.js:36,109;
        module-10.js:93,629; module-11.js:36,51,312; module-12.js:428,637;
        module-13.js:207 — mostly "Watch X, then Y" cards, which are prose
        sitewide by convention; left alone as recommended.
  - [x] **Closed 2026-07-27 — turned out not to be a bug.** Degenerate
        one-`<li>` `<ul>` lists (renders as a lone bullet): the backlog's
        ~19 locations (`module-8.js:183`, `module-9.js:433,693,958`,
        `module-12.js:147,166,202,224,482,501,519,537,748,766,822`) are
        every one of them a **Challenge card** (`Challenge N — Title:`),
        and CLAUDE.md's Challenge-card rule is explicit that these are the
        one place the "single actions stay prose" carve-out does NOT
        apply — "the body is always a list" and "a card that already had a
        list keeps it byte-for-byte," full stop, regardless of length. A
        fix agent unwrapped all 11 real locations (module-8.js:182,
        module-12.js: nine spots) to prose on the reasoning that a
        single-action list looked degenerate; an adversarial review agent
        caught it against CLAUDE.md's own wording and every location was
        reverted (`git diff --stat` confirmed both files byte-identical to
        HEAD). Separately checked module-9.js's three citations by hand:
        `:433` and `:693` are also Challenge cards (same rule, left alone);
        `:958` was already a stale citation even before this session — that
        line is now a section boundary with no list at all. **Net: nothing
        on the site needed changing** — the original backlog item
        misapplied the list-vs-prose rule to cards the Challenge-card rule
        exempts.

  **Content — song-list inconsistencies:**
  - [x] `MODULE_SONGS[2]` omits Let It Be though `m2w2.songThread` links its
        Layer 2; `MODULE_SONGS[3]` omits "the cure" though m3w2 has a full
        challenge + thread entry. Both added as Core rows.
  - [x] `MODULE_SONGS[7]`'s Seven Nation Army is `type:'Core'` but has no
        `journeyUrl` — the only Core row site-wide with no 🧵 button.
        `journeyUrl: 'tabs/seven-nation-army.html'` added.
  - [x] `MODULE_SONGS[6]` demotes Let It Be to `type:'Choice', core:false`
        in the one module that builds a challenge on its verse. Promoted to
        `type:'Core', core:true`.
  - [x] Five core-song challenge cards lack the inline Journey chip their
        siblings have: `m2w2` "the cure"/"Let It Be", `m4w2` "the cure",
        `m5w2` "the cure", `m5w4` Full Run. **All 5 now fixed.** `m5w4` Full
        Run (`module-5.js`, Challenge 4) was the holdout — it names whichever
        of three songs the student picked, not one fixed song, so a single
        static chip didn't fit. Resolved 2026-07-27 (Jonathan's call): dropped
        the card's separate "optional: play your performance song" step
        (that concept still lives elsewhere in the Set, e.g. "Map your
        performance song's chords") and reworded the assessment step to "Pick
        one of the three core songs," linking each song name inline to its
        own Journey page (`tabs/let-it-be.html` / `tabs/luna.html` /
        `tabs/the-cure.html`) rather than one trailing chip. EN/ES both
        updated; `checks.mjs --skip-links --check` passes.
  - [x] `module-6.js:1044`-ish gives "Happy Birthday" Let It Be's
        progression (C–G–Am–F — Happy Birthday has no Am); `module-5.js`
        gives SNA "D–A–Em" when the site's own Layer 5 page teaches
        Em–G–D–C. Happy Birthday corrected to C–F–C–G–C; SNA corrected to
        Em–G–D–C (EN and ES both, in the `meta` line).

  **Code — app.js / coach.js / tuner.js / teacher.js (all fixed
  2026-07-26; full original detail was in that session's chat transcript
  from the core-app review agent):**
  - [x] `tuner.js` `startTuner()` is fire-and-forget — closing the tuner
        popup while `getUserMedia` is pending can orphan a live mic stream.
        Fixed with a `tunerStartToken` counter — a stream that resolves
        after `stopTuner()` bumped the token is recognized as stale and
        stopped immediately.
  - [x] `app.js` Shuffle Drill: resetting mid-round leaves a pending
        `setTimeout` that fires against a rebuilt (differently-shaped)
        state and throws; also its countdown `setInterval` is never
        cleared on `activateSet` navigation, leaking one 12.5 Hz interval
        per set left mid-drill. Both fixed: pending timeouts are tracked
        and cleared (`st.pending`), and `activateSet` now calls `sdStop()`
        on every shuffle drill on set-switch.
  - [x] `coach.js` single-chord checks: `isChange` logic marks a slot as a
        "change" even when it's the same chord repeating, making the
        `'coach.crit.changes.onlyOne'` message unreachable and mis-grading
        one-chord drills as "changes came in late." Fixed — `isChange` now
        also checks the previous slot's chord name differs.
  - [x] `coach.js` `nrLoop` (Note Runner) doesn't bail when the analyser
        disappears — every other mic loop in the file does. Can silently
        demote a student's adaptive stage on a lost mic instead of
        triggering the `micSuspect` guard. `!coachAnalyser` added to the
        bail-out guard, matching the other mic loops.
  - [x] `teacher.js` — module-load failures inside `loadAllStudents`'s
        per-module loop are silently swallowed (`catch(e){}`), which
        quietly shrinks the skill universe and inflates every percentage
        with no warning. (The loop actually lives in `showTeacherApp`, not
        `loadAllStudents` — same bug, corrected location.) Failures are now
        logged to the console and surfaced as a warning banner above the
        summary cards (`showTeacherLoadWarning`).
  - [x] `coach.js` `coachScoreCompletion` reports the wrong beat number for
        a gap (off-by-one in the `hitIdx.find` callback). Fixed to report
        the first missed beat, not the resuming hit.
  - [x] `tuner.js` `tunerStableCount` double-duty bug: the same counter
        tracks "same-note frames" and "silence countdown," causing a
        ~0.45s lag re-detecting a re-plucked string after a silent gap
        (Auto mode only). Split into `tunerSameNoteCount` and
        `tunerSilenceCount`.
  - [x] `tabs/journey.js` — a rating click during the initial Firestore
        `get()` can be silently overwritten when `applyRatings` replaces
        the DOM right after; the pending save then reads the overwritten
        state. Fixed with a `locallyClickedLayers` guard — `applyRatings`
        skips any layer the student already clicked this page load.
  - [x] `app.js:2303,2307` — reflection textarea isn't HTML-escaped on
        re-render (self-only scope, not cross-user exploitable, but XSS-shaped).
        Both `escHtml()`-wrapped now.
  - [x] `teacher.js:127` — `abbreviate(s.text)` goes into `innerHTML` raw
        while every other call site escapes it. `escHtml()` added.
  - [x] Dead code: `buildVideos()`/`buildAssess()` in app.js are never
        called — meaning every set's `assessment`/`objective` field is
        written but never rendered anywhere. Worth deciding delete-vs-wire-up;
        several of the "assessment promises content the set doesn't teach"
        items above might be moot if this is intentionally dead.
        **DECISION MADE 2026-07-26:** both functions **deleted** from
        app.js (not wired up) — `objective` was removed from module data
        (see the top item), `assessment` was kept as data-only per
        Jonathan's call. `buildStations()`'s no-stationId branch and
        `openSt()` were also unreachable — both **deleted**.
        `btn.classList.add('incomplete')` referenced a CSS class with no
        stylesheet rule — **removed**.
  - [x] i18n gaps outside `tools/checks.mjs`'s scope: `buildSearchIndex`
        never routes through `tf()`, so Spanish-mode search misses
        Spanish-only content; several hardcoded-English shell strings
        (search panel, save indicator, popup labels, embed fallback) bypass
        `t()` entirely — full list in the JS audit's chat transcript.
        `i18n.js` also doesn't set `document.documentElement.lang` on
        initial page load (only on toggle), and `applyI18n`'s
        `JSON.parse(params)` isn't guarded against one malformed
        `data-i18n-params` aborting the whole pass. All fixed:
        `buildSearchIndex` now indexes via `tf()` (and invalidates the
        cached index on language change); the search panel, save
        indicator, popup labels, and embed fallback all moved into
        `i18n.js` (`search.*`, `save.*`, `popup.*`, `panel.*` keys, EN+ES);
        `documentElement.lang` is set on initial load; `JSON.parse` failures
        in `applyI18n` are now caught per-element.
  - [x] **DECISION MADE 2026-07-26:** `blend-words-game.html` (unrelated
        phonics game living in this repo) isn't in `sw.js` ASSETS or
        `tools/checks.mjs`'s SHELL_FILES, so it's never precached or
        syntax-checked. **Left out of the deploy pipeline on purpose** —
        Jonathan confirmed it isn't meant to ship through this site's
        build; not wired into `sw.js` or `checks.mjs`.

- [x] **Check the list sweep for OVER-listing** — closed 2026-07-28 (Claude
      ran the audit, per Jonathan). Module 5 came back clean — all its
      fret/strum cards use the established one-sentence-then-strum pattern
      consistently. Module 7's Set 2 barre-chord sequence had genuinely
      broken from that pattern (over-decomposed into per-finger `<li>`s,
      plus technique reminders wedged in as steps); all four confirmed
      findings fixed and pushed:
      - `module-5.js` Call & Response — "stay in the pentatonic box" folded
        back into the improvisation sentence (was a standing constraint,
        not a sequential step), list dropped.
      - `module-7.js` E-Shape Barre (Challenge 2) and A-Shape B Major
        (Challenge 1) — per-finger placement `<li>`s consolidated back into
        the site's one-sentence, `·`-separated pattern (matches every
        Module 5 fret card); the A-shape's "arch those three" reminder
        folded into the placement sentence instead of its own step.
      - `module-7.js` Slur It Together — the "pick only where the TAB shows
        a plain fret number" notation rule folded into the single play
        action instead of standing as its own list item.
      One lower-confidence item (`module-7.js:157`, the alternate-picking
      workout's "read the rhythm first" item) was left alone — the audit
      judged it a legitimate first action, not a reminder in step's
      clothing.

- [x] **Check the Coach gate with a real guitar — home pass done 2026-07-27:
      "feels fair" (Jonathan, Mac, quiet room).** Wording, bar, and flow all
      read right. One residual check rides along with the school batch below:
      confirm the 💪 Good bar still feels fair on a Chromebook with a noisy
      classroom around it. Original checklist, for that re-run:
      1. **Does "Mark it anyway" read as a legitimate choice or as
         cheating?** This matters more than the threshold. The gate is the
         first thing on the site that tells a student no — everything else
         is self-directed. If the override reads as cheating, the student
         with a dead mic stops marking skills at all and the progress data
         gets WORSE, not better. Wording lives in `gate.*` in i18n.js.
      2. **Is 💪 Good the right bar?** `COACH_GATE_MIN_LEVEL = 2` in app.js
         (1 Needs work · 2 Good · 3 Great) — a one-constant change, no other
         edit needed. If you bump into the gate yourself while playing it
         cleanly, it is set too high. Try it with 29 other guitars audible,
         not in a quiet room.
      3. **Does "Practice it now" land where you'd expect?** It should open
         that skill's practice panel and pulse its 🎤 button. Gated skills to
         try: `m2w2-s1`, or most of Module 5 Set 2. A quiz or fretboard-game
         skill should still mark instantly, with no card at all.

- [x] **Listening Coach check-off gate — teacher view of overrides
      (2026-07-25) — done 2026-07-27.** `teacher.js`'s skills-grid and
      Students-detail checkmarks now read `games.coachSkill[skillId]` and
      render three states with the SAME green check (never a worse-looking
      mark, so an override doesn't read as a red flag on the student): a
      solid blue ring for a genuine Listening Coach pass (tooltip shows the
      level and date), a neutral gray DASHED ring for a gate override
      (tooltip explains it's usually a mic/room issue, not a skill issue),
      and the plain check unchanged for a self-declared skill with no Coach
      data. Two new legend rows explain the icons, inserted into `#t-legend`
      at runtime so `index.html` didn't need touching. An adversarial review
      caught a real bug in the first pass — `override` is a one-way flag
      nothing ever clears, so a student who overrode once and later
      genuinely passed at a higher level would show the override marker
      forever — fixed by checking `coachRec.level >= TEACHER_COACH_GATE_MIN_LEVEL`
      (mirrors app.js's `COACH_GATE_MIN_LEVEL`) before ever falling back to
      the override marker. Browser-verified (mocked `allStudents` + a
      simulated stale-override-then-later-pass case): all three states
      render distinctly, tooltips read correctly, the staleness case
      correctly shows "verified" not "override." Deliberately left in
      plain English, not wired to i18n.js — this file has zero i18n
      anywhere else (it's gated to Jonathan's own `TEACHER_EMAIL` account),
      so adding it just for two new strings would be new scope rather than
      an existing pattern; flagged rather than decided silently.

- [x] **Note Runner — live guitar check** — closed 2026-07-28. All five
      checks confirmed good, including **stage movement feel**: the 90%-up /
      65%-down pacing was put in front of a class and reported back as
      working; `NR_UP_PCT`/`NR_DOWN_PCT` stay as-is. Mic timing offset,
      power-chord stages, weak-spot re-dealing, and hit animations were all
      previously confirmed (see 2026-07-27 progress notes, preserved below
      for the record):
      1. **Mic timing offset** — ✅ Mac: ~35 ms, slider steps by 5, 70 ms
         Chromebook default confirmed right at school too.
      2. **Stage movement feel** — ✅ confirmed good with students, 2026-07-28.
      3. **Power-chord stages** — ✅ guitar-verified good 2026-07-27: the
         chord-tone vote grades real strums correctly.
      4. **Weak-spot re-dealing** — ✅ confirmed.
      5. **Hit animations** — ✅ confirmed, read as fun not distracting.

- [x] **Post-review guitar + eyes pass (Jonathan, 2026-07-27 session)** —
      closed 2026-07-28. A seven-agent review plus a ten-agent adversarial
      verification workflow shipped 13 commits that day (see "Recently
      shipped"); both hands-on items confirmed:
      1. **Mic games on a real guitar** — ✅ confirmed good. Note Hunt, Note
         Runner and Strum Radar all had behaviour changed in the same batch,
         plus a *separate* concurrent session rewrote the pluck synth
         (`e385d12`) on top; a single guitar pass covered all three (mic
         release/restart on Note Hunt, stop-during-count-in on Note Runner,
         on-beat highlight sync on Strum Radar) with nothing flagged.
      2. **Module 1 Set 2 — progress ticks** — ✅ confirmed fine (Set 2's new
         "Your first fretted note" card and the rescoped "Happy Birthday" —
         the positional-key tick shift reads acceptably in the wild; no code
         change needed).

---

## Recently shipped (post-archive)

- [x] **2026-11-04 — Practice minutes: Top 5 of the week, by class period (needs a `firestore.rules` paste).**
      A "TOP 5" medal in the strip, a once-a-week toast and a fifth My progress tile for the students with the most minutes THIS ISO week inside
      their own class period; ties share a place; 10 minutes needed (`top5MinMinutes`); each student sees only their own place.
      **Standing rule from Jonathan (2026-11-04): no per-period minutes tied to a name, readable by anyone.** The live quiz kept names under uids
      (`liveQuiz/current.scores`, read by every signed-in account), so the board is NOT keyed by uid: `weekBoard/{tag}` holds `{week, period, seconds}`
      under a private random 32-hex tag that lives only in the student's own owner-only, create-only doc `minutes/{uid}/meta/board` (page memory
      only, never localStorage: a shared Chromebook would leak uid -> tag).
      A board write is allowed only under the writer's own tag (the rule reads that doc). Both blocks are pinned whole in checks.mjs 1cg
      (`TAG_SHIPPED`, `WB_SHIPPED`, plus the tree block, exactly 4 `match /minutes/` blocks and no wildcard-first match). Read from the SERVER only
      (`get({source:'server'})`): offline, a plain get() answers empty from the cache (measured on the real SDK), which also bit `load()` and
      `loadBoard()` and is fixed there.
      **Closed 2026-11-05 (Jonathan's picks: take the names out of the live quiz, then also key the class rank by the tag).** (1) `liveQuiz/current.scores`
      (read by every signed-in account) carries NO name: only `{pts, right, answered, last, lastRight}` per uid (a whitelist copy, `lqPublicScore`);
      names live in the teacher-only `answers/{uid}` docs and the wall builds its leaderboard from them (`lqNames()`, `lqRankedNamed()`); a student's end
      screen shows other players as "Student". The writers REPLACE the field (`set(..., {mergeFields})`): a plain merge is deep and kept old names in
      the doc. checks.mjs **1cm** runs the real writers against a doc that merges like Firestore, starting from an older game full of names, plus the
      views and the `answers` rules. (2) The class rank moved from `minutesBoard/{uid}` to `rankBoard/{tag}` (same private tag as the Top 5);
      `minutesBoard` has NO rules block any more and 1cg fails the push if one comes back. A person in the room can still line the wall's names and points
      up with the public uid -> points (a uid, a name and points), but no uid reaches minutes. Never publish a name next to a uid, or
      minutes next to a uid, again. **ONE-TIME after deploying: delete the `scores` field of `liveQuiz/current` in the Firebase console (the last game's
      names stay in it until a Reveal/End/Close/Start writes it); the old `minutesBoard` docs were unreachable and DELETED in the console on 2026-11-05 (the whole collection; Jonathan asked).**
      Visible side effect: the class rank (N/total) restarts as students open the site (each page creates its `rankBoard` doc at the server's confirmed
      all-time sum on its first publish), so `total` is small at first. Also still true: `config/class.periodOverrides[uid]` is readable by every student
      and gives a period (never a name).
      Known limit: a tag cannot be proven unique, so any account can claim another's public tag and lower/remove that one entry (fix would be a
      create-only reverse index `boardTags/{tag}` with `existsAfter`; not built; the emulator now runs here, and two cases in `tools/pm-rules-test.mjs` pin this limit so they flip when it is fixed).
      `tools/pm-rules-test.mjs` has cases for `minutesBoard` (no rules), `weekBoard`, `rankBoard` and `meta/board` since 2026-11-05 (since then also the recorded takes, their audio chunks and the take counter: 179 passed, 0 failed on 2026-11-05; 12 + 16 deliberate breaks of the rules each turned a case red; one known leniency pinned: a chunk with no `i` is accepted, which the console never reads). Other tests: pm-sim sections 14-16, pm-e2e "top 5".
- [x] **2026-11-01 — Practice minutes (student view only; display switched ON the same day: `uiOn: true`, `streakStartWeek: '2026-W45'`, goal 30; 60 since 2026-11-04).**
      Counts seconds of real backing-track playback and shows a weekly goal, a
      week streak and "N playing". Counting and writing ship LIVE; nothing is
      drawn until `uiOn` is set to `true` in `practice-minutes-config.js`.
      **Files:** `practice-minutes-config.js` (every setting, nothing else),
      `practice-minutes.js` (engine + all UI; no build), `tools/pm-sim.mjs`
      (runs the engine against fakes; part of checks.mjs **1cg**),
      `tools/pm-e2e.mjs` (real Chrome at 1366×657, screenshots; by hand),
      `tools/pm-rules-test.mjs` (the rules against the Firestore emulator; by
      hand), `firestore.indexes.json` (one composite index). Hooks: `window.PM_HOST`
      in `app.js` (ui:true) and `tabs/journey.js` (ui:false), `PM.syncHeader()`
      on every `#user-area` paint path (the strip is the `#pm-header` button in the main top
      bar; it was in a practice card's bar until 2026-11-04), `PM.renderProgress()` in
      `renderMyProgress()`, a `<div id="pm-progress">` in index.html, two script
      tags in index.html and in all six `tabs/*.html`.
      **What counts:** an `<audio>` whose file is `audio/…-backing-…`, playing
      (not paused/ended/muted, buffered, currentTime moving), tab visible,
      student signed in, not the `?teacher` console. Detached `new Audio()`
      elements are seen by wrapping `HTMLMediaElement.prototype.play` (it only
      observes). NOT counted: metronome, ear trainer, games, note strums,
      the student's own recording, YouTube. Cap `dailyCapMinutes` (20) per day.
      **2026-11-03 — ALL SITE WORK COUNTS (Jonathan: "any work inside the
      website from modules to other class activities should count towards
      minutes and streaks"; reverses the backing-tracks-only rule above).**
      Rule he picked from three: a second counts while ANY audible
      `<audio>`/`<video>` plays, OR the student showed a sign of work in the last
      2 minutes (`ACTIVE_MS`): pointerdown/pointermove/keydown/wheel/scroll/
      touchstart/input on the document, a Web Audio `start()` (metronome, games,
      strums, trainer — `AudioScheduledSourceNode.prototype.start` wrapped, observe
      only), a live mic track from `getUserMedia` (`MediaDevices.prototype` wrapped,
      observe only); 10 minutes (`FRAME_ACTIVE_MS`) while focus sits in an
      embedded video iframe. Tab visible + signed in as before. Goal 30/week and
      cap 20/day kept (his call, same day) — classwork alone will often meet the
      goal. The recap pill and the "N playing" heartbeat stay tied to SOUND: a
      `play` run inside the counting session opens while something is audible and
      ends 2 s after it stops (the old card count-in grace); the session itself ends
      2 s after counting stops and flushes. `isBacking()` is gone. pm-sim
      section 12 (17 assertions; PM_SIM_PIN 142 → 159). The strip still shows only
      on practice cards; My progress shows the totals.
      **Storage:** `minutes/{uid}/days/{date}` `{seconds}`, `minutes/{uid}/weeks/{ISO week}`
      `{seconds, goalSeconds, hit}`, added with `increment()`; queued in
      localStorage, ONE KEY PER PAGE (`pm:q:<uid>:<pageId>`; a page adopts only a
      dead page's key), flushed every 60 s / on stop / on hide / on `online`, and
      by a `fetch({keepalive})` to the REST `:commit` on `pagehide` (sendBeacon
      cannot carry the auth header; the cached token must be this student's).
      **Leaving a page (2026-11-01 Friday check):** Chrome fires `pagehide` THEN
      `visibilitychange:hidden` (measured, Chrome 153); the second starts no
      commit and keeps the leaving key. The keepalive sends `pend` even with a
      commit in flight — but not when that commit has been unanswered for 30 s
      (a dead link: the keepalive would die too and its seconds be deleted as
      landed; `DEAD_LINK_MS`). A commit still in flight at the close STAYS in the
      leaving key — **Jonathan, 2026-11-01: "be liberal with minutes since this
      is for motivation"** (this reversed his "lose under a minute" call from
      earlier the same day): when unsure, count it; a batch that had landed is
      counted twice once, bounded by the rules' daily cap. The keepalive's own
      seconds are still taken as landed on a live link (keeping them too would
      double the last minute of almost every session). A leaving key is adopted only once it is 3
      minutes old (the old "pagehide stamp 0 = adopt at once" never survived
      Chrome's order). Signing out and back in on an open Journey page folds the
      page's own key back in (`sync`, `leftInflight`, used once); a commit that
      answers after a switch never rewrites a key a newer state of that student
      has written (`newestGen`), it only adds back what did not land; with no
      newer state it EDITS the key (takes out a commit that landed) and never
      rebuilds it — another page may have adopted it (re-review R3-1). Streak: a miss before any
      streak spends no free miss (Jonathan, 2026-11-01). pm-sim section 10.
      A commit has NO timeout (the SDK keeps and later delivers it; re-sending
      multiplied the seconds in the review, a 5-minute stall stored the daily
      cap) and a read never overlaps a write. The first adversarial review
      (2026-11-01) found 14 issues, R1-1…R1-14; `tools/pm-sim.mjs` section 9 has
      a regression scenario for each fixed one. `heartbeats/{random
      session id}` `{period, lastSeen}` every 30 s while counting; the count is
      one REST `runAggregationQuery` (the compat SDK has no `count()`).
      **`firestore.rules` changed (new blocks only) → needs the console paste
      BEFORE the code is live, or every write is refused** (the client keeps
      refused seconds and retries every 5 min, so a late paste loses nothing).
      `dailyCapSeconds()` in the rules must equal `dailyCapMinutes × 60` (1cg).
      **Rules (all in the config; simplified 2026-11-01 by work order):** the goal
      is FLAT, `weeklyGoalMinutes` in every counted week for every student, whatever
      days they practise. There are NO meeting days, no no-school dates, no short
      weeks and no proration (checks.mjs 1cg fails if those keys return).
      `skipWeeks` is a list of Mondays (checked to be Mondays); a skipped week
      neither counts nor breaks a streak, and minutes played in it still add to the
      totals and My progress. `semester2Start` (Mon 2027-01-04) is where the one
      free missed week per semester resets. "This week by day" is Mon-Sun for
      everyone, and a day with no practice is an empty bar. `streakStartWeek` (set it
      to the week `uiOn` goes live) makes the streak start fresh; the streak and "hit"
      are recomputed from seconds against the CURRENT goal, so changing
      `weeklyGoalMinutes` re-scores old weeks (the stored `hit`/`goalSeconds`
      are a snapshot for later use). The prefilled skip weeks (Thanksgiving, two
      winter-break weeks, mid-winter break, spring break) and the semester date
      came from the work order, not from a calendar: check them against the district's.
      **Layout:** (until 2026-11-04 the strip sat in a practice card's bar and Full
      screen folded to its icon; it no longer does, see below). **Limits:**
      a Journey page's player loops by itself and counts while it plays (the
      daily cap bounds it); the heartbeat count can be inflated by anyone
      signed in, and anyone signed in can list the heartbeats collection
      (random ids, but createTime/updateTime make a session-start log per
      period: a TTL policy on `lastSeen` is a console step, NOT set by the code;
      see APPLY-practice-minutes.md); the
      stored week `hit` is a best-effort snapshot; "weeks in a row" is the work
      order's copy and stays true after a forgiven miss only because the miss
      is forgiven; the games card already shows a 🔥 day streak, so a
      second flame (weeks) may confuse; `--streak-dim` is 2.5:1 on its
      background (the one graphic under 3:1, on purpose — "dim").
      **2026-11-04 — the strip moved to the main top bar, every page.** Work order
      `WO-practice-minutes-header.md`. All work counts, so the number has to be
      where the work is. **Where:** `<button id="pm-header" class="pm-strip
      pm-strip-header" hidden>` first in the header's right-hand group
      (`index.html`); `PM.syncHeader(show)` fills and shows it when `uiOn()` + host
      `ui:true` + a student (`uiOn()` runs `sync()`, so a new student's state is built
      before anything is drawn: a shared Chromebook never shows the last student's
      numbers) and hides and empties it otherwise. `app.js` calls it after each of its
      four `#user-area` paints (`showApp` = `true`; the sign-in wall, signed out and the
      paused screen = `false`) and `teacher.js` after its two (`false`; `PM_HOST.user()`
      is null on the console anyway). `refreshStrip()` hides and empties
      `#pm-header` rather than removing it, never un-hides it and never fills a hidden
      one. A click calls `toggleMyProgress()` (opens, or scrolls to the top; never
      closes). **Gone from the practice card's bar:** `caSyncTopbar()` no longer draws
      it, `PM.onCardOpen` is removed, the card-bar CSS that made room for it is removed
      (Full screen has its word back; the bar measured identical to `uiOn:false`, EN +
      ES). Journey pages are untouched (`ui:false`). **Pills:** the toast (centred under
      the strip) and the recap (right edge in line with the strip's) drop down on any
      page, kept inside the window; `anchorRect()` is the strip's rect, or `null` if the
      strip is hidden OR covered (`elementFromPoint`), `followStrip()` removes a pill
      when that goes null, and `uiTick()` (1 s) shows a toast that was held back. The
      recap still opens only when a play run ends (engine rule, unchanged).
      **STOP A (a scrolled practice card): passed.** The header is outside the scrolled
      `#main-content`, and the card's sticky bar sits at top 49px under it (z 50 vs 20),
      so nothing covers the strip (measured with `elementFromPoint` at the strip's centre
      after scrolling a 2,900px card to the bottom). No stacking was changed.
      **STOP B (Spanish, long name, "N playing" showing): failed as first built**, and
      Jonathan chose to shorten the week text. `pm.weekMin` is now "{done}/{goal} min"
      (was "… min this week"), `pm.weekMinBreak` "{done} min". Measured at 1366×657
      with "N playing" showing: Spanish holds one row for names up to 21 characters
      (10 as first built; 55 with no strip), English up to 45 (35 as built; 61 with no
      strip). Longer names wrap the title and the bar grows 49 → 70px; not fixed (a
      different choice would have been to drop "N playing", 23/48, or both, 35/56).
      **Games** is a full-screen layer (`.games-screen`, z 120) over the whole page, so
      the strip is covered there with Find, Español and Sign out; a pill is not drawn
      under it and a toast waits. Left as is: raising it would change stacking.
      **Cost:** `ensureStripWork()` now runs for every signed-in student on every page:
      one aggregation query per 30 s per visible tab for "N playing", all class. Accepted;
      the interval is unchanged. **Tests:** checks.mjs 1cg pins the new wiring (16
      mutations, 16 red); `tools/pm-e2e.mjs` is re-pointed at the header and gained module-page pills,
      signed-out, student-switch and `?teacher` cases (it was already red at two points
      on origin/main after the 2026-11-03 engine change: a recap now needs a PLAY run,
      `PM._play().counted`, and a session starts at the first click); `tools/smoke.mjs`
      walks the strip on 6 views x EN/ES x 1366/390 px, the click and a reload.
      **2026-11-04, later the same day (Jonathan: "drop it and add this to games screen";
      he chose "the minutes strip"):** (1) **"N playing" is dropped** from the strip: no
      `.pm-live`, no `pm.playing` string, `ensureStripWork()` no longer starts the 30 s
      poll (so the poll-cost note above is now void). `pollLive()`, the heartbeat writer,
      `S.live`, `liveMinCount` and the heartbeats rules block are LEFT IN PLACE (the
      counting half, pinned by pm-sim 159/159): a follow-up could remove them with their
      rules and sim tests, but that is a `firestore.rules` change (console paste) and the
      writer still does one write per student per 30 s of audible playback for nobody to
      read. (2) **The Games screen has its own twin**, `<button id="pm-games" class="pm-strip
      pm-strip-games">` in `.games-topbar` (right cell), because `.games-screen` (z 120)
      covers the whole header. `HOST_STRIPS = ['pm-header','pm-games']`; `syncHeader()`
      shows/hides both, `refreshStrip()` fills both, `anchorStrip()` picks the first one
      that is shown and on top (`elementFromPoint`), and a pill dropped from the Games strip
      gets z-index 130 (above the Games layer). A click calls `toggleMyProgress()`, whose
      hash route closes Games. The Live quiz overlay (`#live-quiz-screen`) is NOT given a
      strip. (3) STOP B capacity, remeasured: with the short week text and no "N playing"
      Spanish holds one row to 35-character names, English to 56 (was 21 and 45). (4) The
      toast is measured from the middle of the window so a strip at the right edge (Games)
      does not squeeze it into a narrow column.

      **PICK UP HERE (written 2026-11-04 for a move to a new machine).**
      *State:* everything above is live on `main` (last commit `fe196aa`; the strip is
      in the top bar and on the Games screen, "N playing" is gone). Nothing is half done
      and nothing is waiting on a console paste. `pm-e2e` 84/84, `pm-sim` 159/159, smoke
      clean, full `checks.mjs` green.
      *Update 2026-11-05:* step 1 below is LIVE on `main` (the branch is gone) and step 2 is
      done, console paste included, and the emulator run too (summary: "Practice-minutes heartbeat
      removal (not Power Chord Switch): DONE" further down). *Earlier 2026-11-04 note:* **step 1 below was DONE on
      branch `work-heartbeat`** (two commits: "Practice minutes: remove the heartbeat writer…" and
      its review fixes). `pm-sim` is now 152/152 (the heartbeat tests became "no
      heartbeat" / "no live count" runs; section 8 draws a stub strip), `pm-e2e` 84/84.
      `period()` and its `pm:p:<uid>` cache left the engine too; `PM_HOST.period` in
      `app.js` and `tabs/journey.js` is now dead but left in place. 1cg pins the
      heartbeats rules block as "gone, or exactly as shipped". Step 2 waits for step 1
      to be live.
      *2026-11-04 — weekly goal 30 → 60 minutes (Jonathan), at once.* `weeklyGoalMinutes`
      60; the daily cap stays 20 (`dailyCapSeconds()` 1200, rules and indexes unchanged),
      so a week needs at least 3 days at the cap (60 ≤ 7 × 20, the 1cg range check). Not
      retroactive: `calc.status` re-scores from the current goal, but `streakStartWeek`
      is 2026-W45 (this week) so no finished week counts yet, and W44 held only Sun
      11-01 (≤ 1200 s, never a hit at 30 either). A student already past 30 this week
      drops back to "N/60" (ring blue, flame dim, streak 0 until 60); their stored week
      doc keeps `hit: true` (sticky by design) beside `goalSeconds: 3600` on the next
      flush — a snapshot nothing reads. Their `pm:t:<uid>` already says W45, so the
      "Week goal hit" pill does not show again when they reach 60 this week (the tile
      and the recap still say it). pm-sim 154/154 (every 1800 s became 3600 s; section 5
      is now 4 × 16 min, plus a new 3-days-at-the-cap run: 2400 s not hit, 3600 s hit);
      pm-e2e re-derived for each reach branch (Sunday 50/60, Saturday 40|39/60, Friday
      and Saturday from 0, 53/60 strip and recap, "60/60 min" widest strip).
      *2026-11-04 — class rank on My progress ("N/total", Jonathan).* New collection
      `minutesBoard/{uid}` `{ seconds }` (all-time confirmed seconds = the sum of the
      weeks docs); every signed-in student reads it, only the owner writes it, no delete,
      cap `400 * dailyCapSeconds()`. **Its rules block must be published BEFORE the code
      goes live** (until then the write and read are refused quietly and the tile is just
      absent). Engine: `publishBoard()` (a page only ever ADDS: `increment(owed)` merged,
      where `owed` = seconds the server confirmed since its last write; the first write of
      a page looks at the doc and CREATES it at the whole confirmed sum, history included,
      if it is missing; at most once per 2 min, one trailing timer so the end of a session
      is not left out; never for the teacher's account) and `loadBoard()` / `rankInfo()`
      (reads the whole collection, kept 3 hours in memory and in `pm:b:<uid>`; rank = 1 +
      others with more WHOLE minutes; under 60 s = no number). A plain "write my total"
      was tried first and the review showed it loses minutes when a Journey tab and the
      main tab both work. Costs one read per student per refresh (about 150 reads, at
      most one per 3 hours); the Spark limit is 50,000 reads a day, shared with the rest
      of the site: if the class grows or the project is on Spark, replace the full read
      with a count query. pm-sim section 13. Honest limits (also in the engine header and
      the rules): a student at DevTools can claim any number up to the cap; any Google
      account that signs in once adds 1 to the total (Jonathan chose no domain rule); the
      live quiz keeps player NAMES under the same uid in `liveQuiz/current.scores`, so a
      student who looks can match a name to a board number (Jonathan accepted this,
      2026-11-04); a page that closes within 2 minutes of its last confirmed seconds
      leaves them off the board; pm-e2e's fake `minutes` collection has a duplicate `doc`
      key (since 70ef823) so the e2e never runs the board WRITE, only the read and the tile.
      *[DONE: step 1 on 2026-11-04 (5144c6c, edb60e6, 3d87f7d); step 2's repo edits on
      2026-11-05; only Jonathan's console paste is left. Do not redo the steps below; the
      text is kept as history.]* *Open item, Jonathan's call: remove the heartbeat.* "N playing" was
      dropped from the screen, but the engine still writes a `heartbeats/{sessionId}`
      record (`{ period, lastSeen }`) about every 30 s while audio plays, and nothing reads
      it. Why remove it: writes for nothing, dead code in the counting half, and the
      records are listable by any signed-in user with a creation time (a session-start log
      per period; the TTL policy on `lastSeen` was never set, so they pile up). Do it in
      this order:
      1. **Code, no console paste.** In `practice-minutes.js` delete the heartbeat writer
         (`beat()` and its `lastBeat` check in the tick, `HEARTBEAT_MS`, `randHex` if only it uses
         it, the `pmSid` session id), `pollLive()` and its `_pollLive` export, `S.live` /
         `S.liveAt`, and `liveMinCount` (DEFAULTS and `practice-minutes-config.js`). Remove
         the heartbeat and aggregation-query tests from `tools/pm-sim.mjs` (about lines
         600-640, and the heartbeat write tests) and lower `PM_SIM_PIN` in
         `tools/checks.mjs` to the new count; drop the heartbeat-rules pin and the
         `liveMinCount` range check in 1cg; drop the `runAggregationQuery` fake in
         `tools/pm-e2e.mjs`. Counting, `flush()`, the queue and the keepalive do not change.
      2. **Rules, needs Jonathan's Firebase console paste** (GitHub Pages does not deploy
         `firestore.rules`): delete the `heartbeats/{sessionId}` block and its comment from
         `firestore.rules`, the `heartbeats` composite index from
         `firestore.indexes.json`, and the `== heartbeats` section of
         `tools/pm-rules-test.mjs` (about lines 85-110, plus its header line). Only
         after step 1 is live, so no write is ever refused.
         Old `heartbeats` documents can be deleted in the console; they are harmless once
         nobody can read them.
      *Review:* this edits the counting half, `pm-sim` and `firestore.rules`, so it is
      **Always Reviewed the same day** (`site-reviewer-deep`, failing scenario first), not
      Fast. Proof to bring: `pm-sim` and `pm-e2e` pass, 1cg pins broken in a scratch copy
      and red, a play session still counts and flushes the same seconds as before.
      *Other loose ends from this work:* the Live quiz overlay has no minutes strip
      (left on purpose); a held-back toast needs the 1 s tick, which runs only while the
      student is working (fine in practice); a Spanish name over 35 characters, or an
      English one over 56, still wraps the top bar from 49 to 70px. Not fixed
      (pre-existing): `tools/pm-e2e.mjs` (about line 110) defines `doc` twice in its
      in-page fake Firestore, so the second (a leftover heartbeat recorder) wins and
      the fake never loads or flushes minutes; removing it alone makes the batch fake
      compute NaN with the real `FieldValue.increment`.
      *On a new machine:* clone the repo, `git config core.hooksPath .githooks`, Node 22+
      (global `WebSocket`) and Google Chrome for `tools/pm-e2e.mjs` and `tools/smoke.mjs`
      (pass `--chrome <path>` if it is not in the usual place); use a git worktree
      (`git worktree add ../guitar-class-<name> -b work-<name> origin/main`) if another
      session is open. Claude's memory notes live in `~/.claude/projects/…/memory/`, NOT in
      the repo, so they do not travel: this entry and `CLAUDE.md` are the record.

- [x] **2026-10-31 — "Hear It First": a hidden adaptive ear + fretboard trainer.**
      Work order `WO-hear-it-first.md` (kept out of the repo). For Jonathan's
      own ear on an electric guitar: hear a tone and find it, see a fret and
      know its sound, name and play intervals, play back phrases, find named
      notes. It finds weak spots (moves on a string, across strings, across the
      neck, intervals, phrases, note locations), spends practice there, and
      teaches (a one-line lesson card, two easier items with "Hear the slide",
      a contrast drill for a confused pair) until each one is gone.
      **Where:** `index.html?hif=1` (add `&hifdebug=1` for `window.__hif`), any
      signed-in account; no hub card, never visible to students.
      **Files (flat, at the root):** `trainer-core.js` (pure engine, no DOM /
      audio / Firebase / strings), `trainer-audio.js`, `trainer-ui.js` (the
      English text, the screens, `createTrainer`), `trainer-site-adapter.js`
      (the ONLY one that touches site globals; the one small script index.html
      loads). `guitar-diagrams.js` gained one NEW function,
      `trainerFretboardSvg`; every old diagram is byte-identical
      (`node tools/diagram-regression.mjs <ref>`). All four are in
      `SHELL_FILES` and `SHELL_NOT_PRECACHED` (loaded on demand, like
      `teacher.js`).
      **How it listens:** `coach.js`, unchanged — its mic, onset detector and
      pitch reader, called from the adapter. The input picker is a
      `getUserMedia` wrapper that is in force only while `coachAcquireMic()`
      runs. Cents come from the readings `coachSettlePitch` leaves behind (it
      returns a whole note). A reading within 45 cents counts; 45–50 is "didn't
      catch that".
      **Where it saves:** `progress/{uid}.trainer`, written with
      `set({trainer}, {mergeFields:['trainer']})`, plus a uid-keyed localStorage
      copy. `firestore.rules` is unchanged (that document has no field
      whitelist). Under 30 KB: 25 KB with every one of 208 cells used.
      **Sound:** the site's own `playNote(..., synthOnly=true)` (Karplus-Strong,
      no audio files; the recorded notes stop at MIDI 74 and the trainer goes
      to 84).
      **How to test:** `node tools/trainer-sim.mjs` (19 unit checks, learners
      A–H on 20 seeds; its own command, NOT in checks.mjs; run it after any
      `trainer-core.js` change), `node tools/trainer-e2e.mjs` (real Chrome over
      the DevTools protocol; a fake guitar plays synthesized plucks into
      `getUserMedia`, so the site's real detection runs; `--quick` skips the
      placement walk), `node tools/diagram-regression.mjs <ref>`.
      **The finding to know before a student release:** the work order's unlock
      rule (every new cell at m ≥ 0.75 and n ≥ 6) is slow. A steady 95%
      learner starting at Zone 1 / Tier 1 opens Z2 at about session 7, Z3 at
      28, Z4 at 60–78, and does not reach Z5 or T4 in 90 sessions; coverage
      weighting, 4 answers per cell, or pooling by row help only a little
      (`unlock.granularity`, `unlock.minN`, `weights.coverage` in the config
      are the switches). Placement is how an expert gets up the ladder.
      **Interpretations the work order left open** are numbered I1–I11 in the
      header of `trainer-core.js`.
      **Not yet checked on a real guitar:** the work order's electric-guitar
      checklist (section 8), and frets 13–20 on the B and high e strings (up to
      1046 Hz), which the existing games never reach.

- [x] **2026-10-26 — Watchtower: the record's rhythm replaces the book rhythm.**
      Jonathan and Claude measured the Hendrix rhythm guitar on the beat map
      (26 A-bars, 26 F-bars) and Jonathan confirmed it by ear. Bar 1 is
      `A A A A G G G G` (G on beat 3, no rest); bar 2 is `F F F · · G G G`.
      Changed everywhere the book rhythm lived: Modules 2–7 (text, captions,
      `tab.notes`, playSeq data — frozen modules in place, rule-zero holds),
      ca-29 (every section one rhythm, verse exception retired), ca-38's
      caption (closes the 2026-10-25 open item), Riff Runner (14 targets a
      lap, same minimum gap as before), the Journey page Layers 2–5, the
      song-facts skill. Left on purpose: ca-26 (two plucks per note) and ca-40
      (one 2-beat strum per chord). The F bar's rest is a HELD third F, never
      `{ rest: true }`, so ca-29 stays at 224 chord changes.

- [x] **2026-10-25 — Whole-site sweep + audio levelling.** Jonathan: "spawn
      agents and check the site for errors, make changes and look for
      inefficiencies such as instances to refactor", then a plain-wording pass,
      a cache-fingerprint fix, a Teen Spirit zip and a loudness rule. 11
      read-only auditors, 7 fixers (one per file family, each in a pre-created
      worktree), 4 adversarial reviewers plus a review-fix round per family.
      Pushed as 111 commits (`5d1ff51..6ea5898`, live `…-6f4dcd3b92`) and 18 more
      for Teen Spirit (ca-41) and the loudness pass (`..ba655c7`, 32 mp3s
      re-encoded, +267 MB in git history, every cached track re-downloaded
      once). Headline fixes: ~15 dead lesson ▶ buttons (an `onclick` escape
      hole); a stored XSS through a student's `period`; Name That Riff freeze;
      Finger Gym no longer overwrites a Note Runner mic take; console counted
      moved songs as Pending; two-console board corruption and views stuck on
      "Loading…"; deploys no longer reload mid practice-card song; the A chord
      diagram now matches Module 4; seven steps pointed at removed UI; fonts and
      icons now bump the cache. New checks: **1br** (steps pointing at removed
      UI), **1bs** (every inline handler in every rendered set compiles and
      passes the right title), **1bt** (every precached file is fingerprinted),
      **1bu** (soft: each song within 1 LU of "the cure"); 1bf now *renders* the
      card builders; 1ah follows the guard, not the token. New tools:
      `tools/smoke.mjs` (real-browser walk, `--baseline <ref>` to diff against a
      clean ref), `tools/loudness.py`. New guidance: `.claude/rules/code-hygiene.md`,
      `.claude/rules/teacher-console.md`, skill `site-sweep`, and a "Start here"
      block at the top of CLAUDE.md. Left for Jonathan (praise voice, hidden-tab
      games, the ca-38 Watchtower caption (done 2026-10-26, see above), sw.js re-download cost, language and
      refactor backlogs) is in the project memory `site-sweep-2026-10-25`.
      Six backing-track files stay more than 1 LU off "the cure" on purpose
      (slow-tier and guitar-off exports are quieter at the source; Jonathan chose
      one gain per song).

- [x] **2026-10-10 — "Keep practicing" row (pinned activities).** Work order
      "Keep practicing row on In-Class Activities". New
      `config/class.activityPins` — an ORDERED array of up to 4 activity ids
      (an array, not an id → true map like its neighbours, because the order
      is what students see and 4 is a hard cap). **Console:** every assigned,
      non-check card on the Class activities board has a **Not pinned /
      Pinned n of 4** switch beside Play Along (`teacherSetActivityPin`); a
      5th pin is refused with an alert. A strip above the board lists the
      row in pin order with an Unpin per pin and says why a pin students
      can't see is dark (Hidden, archived, not assigned) — it is the
      console's preview of the row and the only way to unpin an archived
      card. Built cards list a stray pin under "Carries:". Delete unpins in
      its own strict write; Archive keeps the pin (students don't see it).
      The writer is cell-checked on the whole array (`base:
      {activityPins: prev}`), so a pin from another console refuses rather
      than being overwritten; checks.mjs 1ai `CONFIG_WRITERS` 20 → 21.
      **Students:** `caPinRowHtml()` draws the row above Today's activity,
      one button per pin in pin order, nothing at all with no pins. (Until
      2026-10-13 it also dropped any pin that was one of today's cards;
      Jonathan wanted pins to stay put, so that filter is gone.) A tap (`caOpenPin`) goes through `caFocusActivity`,
      so a card on the dated list opens where it sits and a pin-only card
      (`caIsPinOnly` — undated, or Play Along now) renders straight under the
      row while it is the open card, no Songs heading, no date chip. The pin
      stands in for the release date for that row only: `caIsVisible`, the
      three blocker rules and `CA_TODAY_MAX` never read it, and it writes no
      completion data. Hidden / Archive / Delete / unassigned all still win
      (`caPinReachable`). Cached in `localStorage` (`caPins`) like the other
      maps. Strings `ca.pinsTitle` («Sigue practicando») and `ca.pinDone`.
      No `firestore.rules` change (header comment only — nothing to paste).
      Verified at 1366×657, dev bypass with the cache seeded: 0, 1 and 4
      pins (row 40px + 10px margin, one line), a practice card and ca-23
      opened from the row, hidden + pinned not shown, ES; 390px phone wraps.

- [x] **2026-10-06 — Play-along first: Song Journey pages stay open as the
      back door.** Reverses part 1's per-song retire switch and "moved" card
      (shipped as `fc7e878`, reversed the same day). One rule for every link
      to a song: if students can open a whole-song card for it (and for that
      layer), the link opens the card; otherwise the Song Journey page.
      `openSongLink(slug, layer)` in app.js decides at the click; the "Take it
      to a song" box is one button per song again, the set-header names are
      links again, the Songs row has its Song Journey link on every Core row,
      and the resume card sees all six songs. `caJourneyUrl()` returns '' on
      a whole-song card and on any activity whose song has an openable card.
      `tabs/journey.js` / `journey-theme.css` match `dbf1dc2` again. checks.mjs
      1bn rewritten: every whole-song card names its song + layer, no two
      share a pair, none names the page, and the retire switch cannot come
      back. Nothing deleted; no `tabs/*.html` or module file touched.

- [x] **2026-10-06 — Song Journey phase-out, part 1: a per-song retire switch.**
      `JOURNEY_RETIRED` in `class-activities.js` (starting with `the-cure`
      and `seven-nation-army`) closes every door into a song's Journey page:
      the card's Journey button and the console preview (`caJourneyUrl`), the
      Songs-page Song Journey link, the set header's song-thread link, the
      resume card's song row, and the page itself (students see a "moved"
      card; the teacher still gets the page). "Take it to a song" in Modules
      1–5 is one button to the Songs page for every song. ca-25's Level up
      lost its last Journey mention. checks.mjs 1bn pins it. Nothing deleted;
      `journey:` stays on every card (it places a whole-song card on its
      Songs row). ~~Open: Journey phase-out part 2~~ — cancelled, superseded
      by the play-along-first order below (the same day).

- [x] **2026-10-06 — "the cure" Journey page: the record plays each chorus
      three times.** The page (and ca-18) teach the chorus as eight bars,
      twice through the loop; the record plays Dm · F · C · G three times
      (12 bars). Per Jonathan, the eight-bar teaching stays and the page now
      carries one more play-along note, under the Metronome note, saying so
      (EN + `data-es`). No "twice — eight bars" line was changed.

- [x] **2026-10-06 — "the cure" whole-song captions: "3 times" → "3 laps,"
      plus ratchet 1bm.** Eight sections on ca-24 and ca-30 (Chorus 1–3 and
      the Outro on each) counted in "times"/"veces" in the caption while
      their badge reads "Lap 1 of 3" (`repLabel: 'Lap'`). Reworded all
      sixteen strings to "laps"/"vueltas". Second occurrence of the class
      (four sections 2026-10-05), so checks.mjs 1bm now fails the push on a
      caption whose counting word differs from its badge's, against a
      `repLabel` whitelist (Lap/Vuelta, Time/Vez, Verse/Estrofa), in both
      languages; 67 sections checked today. Proved by breaking it three ways.
      Chorus length untouched (12 bars: 4 × 3 laps).

- [x] **2026-10-05 — Seven Nation Army chorus captions: "second lap" →
      "second time."** Both whole-song power-chord practice cards (ca-25
      and ca-31) had a Chorus 1 and Chorus 2 section whose caption mixed
      two counting words — "2 times · the second lap ends …" — while the
      section's own badge reads "Time 1 of 2" (`repLabel: 'Time'`). Reworded
      all four captions, EN and ES, to use "time"/"vez" throughout. "Lap"
      stays the site's word everywhere else; this was not a rename.

- [x] **2026-10-02 — "Open through Module N" (per-student module skip).**
      Work order "Open through Module N". New `config/class.moduleOpenThrough`
      (`uid → 2..12`), set from a new "Open through" select in the console's
      Manage table (`teacherSetStudentOpenThrough`, a copy of the period
      writer; Auto deletes the key). Student side: `moduleOpenThrough` in
      app.js, read in `loadClassConfig()`, cached per uid as `caOpenThrough`
      and restored by `restoreClassConfigFromCache()`.
      `isModuleGateLocked` opens modules `<= N`; `isSetLocked` opens every
      set of modules `< N` (module N keeps its set order). A change under an
      open app repaints the pills, dropdown and strip (`repaintModuleGate`,
      from a `finally` so the cache paths are covered too); `renderPills`
      strips a now-open set's `.set-peek`. Console: "Open → M4" pill in the
      Students list, a line on the detail page, and `teacherReviewIsBlocking`
      stays quiet when the next module is opened. No progress writes, no
      student-facing text, no rules change (no key allowlist on
      `config/class`; header comment only). checks.mjs 1ai writer count
      17 → 18. Deferred: a whole-class setting, a bulk control, a student
      notice; the skipped modules' Module Review stays preview-only (it is
      locked on the module's skills, not on the gate).

- [x] **2026-09-25 — One activity on the In class page at a time (Cowork
      patch 0002, on top of Focus view).** Jonathan: with a card open, the
      Unfinished / Completed groups and other cards sat right under it and
      students opened them by mistake. Picked "hide them, every activity"
      over dim-and-lock. `caSyncSolo()` (called from `caSyncTopbar`, so it
      runs on every card toggle and render) puts `.ca-solo` on
      #class-activities-screen, `.ca-solo-card` on the open card and
      `.ca-solo-path` on its ancestors up to #class-activities-body; one CSS
      rule hides every other child (group summaries, module heads, gate
      intro, other cards) plus #resume-card. No re-render, no audio touched.
      New "◀ All activities" button in the sticky bar (`caCloseOpen`, i18n
      `ca.allActivities`) closes the card, stops card audio and scrolls to
      the top; closing the card by its title works too. Browser-verified:
      opening from inside Unfinished, the Today hero, a deep link, Got it in
      Focus view, and back to the list.

- [x] **2026-09-25 — Focus view for class activities (Cowork patch).**
      Jonathan picked "Focus view" from three design options (one step at a
      time) and turned it on for ca-10, ca-18, ca-20 and ca-21 via a new
      activity-level `view: 'focus'` flag (VIEW note atop
      class-activities.js). `caIsFocus()` in app.js switches both card
      builders (plain + Today hero) to: numbered step buttons above the
      ladder (`caFocusDotsHtml` — done = green ✓, current = filled, later
      steps disabled until the step before is ticked), only the current
      step shown (`.ca-card--focus .ca-step-collapsed{display:none}`), a
      non-toggling "Step n of m" head, and `caFocusNavHtml` — "◀ Step n-1"
      + "Got it — next step ▶" in place of Mark done. Moves go through
      `caFocusGo` → `caFocusActivity` (re-render, keep open, scroll to the
      card top) after `stopCardAudio()`. Ticks are the same day-scoped
      `caStepDone`; rep dots drive `caFocusGotIt` via `repDotFinish`. Print
      is unchanged (dots/nav print:none; printActivity uncollapses steps).
      Teacher preview keeps every step plus a one-line Focus-view note.
      checks.mjs 1d rejects any `view` value other than 'focus'. Seven new
      `ca.focus*` i18n keys. Browser-verified at 1366×657 (dev bypass): EN
      and ES, back/next, lock state, rep-dot auto-advance on all four,
      accordion activities unchanged, print emulation shows all steps.

- [x] **2026-09-20 — Left rail navigation cleanup (work order, pasted in
      chat — no saved file).** Pushed `4f497cd`. Renamed "Practice"→"Modules"
      and, rail-only, "In-Class Activities"→"In class" (new
      `nav.classActivitiesNav` key; the fuller phrase stays everywhere else
      it was already used). Added a divider + `.rail-panel` wrapper marking
      the five nav rows off from the active item's own section panel below.
      Moved Module review off its dashed `.wpill` under the set buttons onto
      a plain `.rail-station.st-review` row at the end of "This set",
      carrying the 🏆 module-complete trophy down with it (same id, same
      `renderProgressStrip()` earned/celebrate handling — see CLAUDE.md's
      new section for the full mechanics). Dropped the header's
      "Independent Practice and Skills Tracker" subtitle everywhere
      (Jonathan, mid-session: "this text isn't necessary… save space") and
      resynced `--hdr` (70px→60px default; the short-screen 48px override
      needed no change, since the subtitle was already hidden there).
      **The work order's literal ask was single-column, full-width nav
      rows** — shipped that first, then measured it against the exact
      1366×657 Chromebook viewport the *previous day's* short-screen rail
      work order was built around: 106-132px of rail overflow, for
      essentially every module, not just the worst case (m5w2), because
      losing the old two-column nav grid cost back the two 44px-floor rows
      of height that work had bought. Reported the real numbers and named
      the prior decision the change would reverse; Jonathan's call was to
      keep the two-column grid, permanently and at every screen size (not
      conditional on short height), with the short labels so nothing wraps,
      uniform row sizing, an active state that changes background/color
      only, and `#my-progress-btn` spanning both columns so five items
      never strand one alone in column 1. Confirmed by direct child-rect
      measurement (not `scrollHeight`/`clientHeight`, which read identical
      whether content fits with room to spare or exactly at the wire) —
      ~19px of rail slack at 1366×657 with Modules active on m5w2 for the
      teacher/dev-bypass view (Preview-mode banner showing), ~66px for a
      real student. `node tools/checks.mjs` (full, 180-link check
      included) clean.

- [x] **2026-08-04 — Cross-module gate: Set 1 locked until prior module +
      review done (work order, pasted in chat — no saved file).** Pushed
      `937ff9a`. Executed end to end, single session/commit. New
      `isModuleGateLocked(moduleNum)` chains modules
      1→12 — a module's Set 1 stays locked until every built set AND every
      Module Review self-rating row of the PREVIOUS module is done; Module
      13 (String Changing) sits outside the chain, always open; existing
      progress anywhere in a module keeps it open for good (same
      never-re-lock principle as `hasProgressIn`). `isSetLocked`'s
      first-set case now defers to it instead of always returning
      unlocked. Locked Set 1 gets the existing read-only peek treatment for
      free, plus module-flavored gate strings at the four sites that
      already had set-flavored ones (`isModuleGateCase(w)` picks between
      them). `onModuleChange` opens a fully-locked module's target in peek
      instead of bouncing off `activateSet`'s backstop. Dropdown gets a 🔒
      tail. **One correctness fix beyond the work order's literal spec:**
      module data is lazy-loaded per module, so a fresh page load may not
      have the PREVIOUS module's data yet when the dropdown first paints —
      `isModuleGateLocked` would then read "nothing built" and hold the
      gate, flashing 🔒 on modules that are actually done. Fixed by queuing
      a one-time background `ensureAllModuleData()` in `renderAll()` and
      redrawing the dropdown when it lands — every `module-N.js` is already
      service-worker precached, so this costs no extra network round trip.
      Confirmed the bug and the fix in-browser by forcing a module's data
      out of `SETS`/`MODULE_REVIEWS` mid-session and reloading state:
      without the fix the dropdown shows a stale 🔒 on the first paint (and
      never corrects itself since nothing else re-triggers a load); with it,
      it self-corrects within ~1s with no reload. `setSkillLevel` now also
      calls `renderPills`/`populateModuleDropdown` after a rating, mirroring
      `toggleSkill`, so finishing the last `mrN` row unlocks the next module
      live. Browser-verified (dev bypass + `isGatePreviewer` forced off to
      simulate a real student): M1 Set 1 open; dropdown shows 🔒 on 2–12,
      none on 1 or 13; Module 3 lands on Set 1 in EN+ES peek with the
      module-flavored banner and inert checklist; Module 13 open+writable
      with zero progress; a peeked checkbox write is silently blocked
      (progress byte-identical before/after); completing Module 1 + rating
      every `mr1` row live-unlocks Module 2's dropdown entry without
      navigating away. `node tools/checks.mjs` (full, 180-link check
      included) clean. New i18n keys (`gate.peekPillTitleModule`,
      `gate.peekBannerModule`, `gate.finishFirstShortModule`,
      `gate.unlocksAfterModule`) are EN-final, ES-draft — pending Jonathan's
      independent Spanish sweep.

- [x] **2026-08-04 — Paper retirement, part 2 (work order).** Pushed
      `8f7287b`. Executed `3-workorder-2026-08-04-paper-retirement.md`,
      Phases 1+2, with a STOP for Jonathan's approval in between. Module 9's
      last two genuine paper drills went digital: Challenge 2 ("Seven
      Nation Army" from memory) and Challenge 4 (day-later cold-read) now
      use a persisted free-text box, same mechanism as module-4.js's "type
      your 4 bars" step. The "Try spacing TAB rhythm" step kept its keyed
      MC quiz per Jonathan's direction — no second response slot exists on
      a step, so the Phase-1 worked example (swap MC for free-text) got
      sent back; the shipped version just drops the paper/hand-written
      wording from label/text/hint. Two module-5.js chord-deck hints lost
      their "paper flashcards"/"shuffle by hand" clauses. New optional
      `naturals-plus` level-up deck (naturals + F#/Bb) added to `app.js`
      `DECKS`, wired as an untracked bonus step in module-9.js — Option A
      of the work order's two choices. Sweep of every `module-*.js` +
      `tabs/*.html`, both languages, for paper/slip/flashcard/index
      card/cut out/papel/tarjeta/baraja/recorta found zero remaining
      genuine paper references after the fix (all other hits are guitar
      mechanics, the guitar's musical "role" in Spanish, or already-digital
      deck content). `node tools/checks.mjs` (full, 180-link check
      included) clean.
      **Landed on top of a concurrent session's push** (`8a5e369`, a
      styles.css banner-color change) — rebased cleanly, only conflict was
      the `sw.js` `CACHE_VERSION` line, resolved by re-running `checks.mjs`
      against the merged file state rather than picking either side.

- [x] **2026-08-04 — Small-patches bundle (work order, 8 decided items).**
      Pushed `e89fd6d`. Executed `workorder-2026-08-04-small-patches.md`
      end to end in a worktree: two calibration numbers (module-5's Am↔Em
      target 20→16; `m3w2-s1`'s beat-1 tempo 60→70 BPM, dropping the now-moot
      "70+ is optional" clause and bumping the practice placeholder 70→75);
      renamed the "PR ladder" code-comment vocabulary to "tempo ladder" in
      4 spots (i18n.js, 2× app.js, module-2.js header) — comments only, the
      `pr` practice type and `pr.*` i18n keys are untouched; retitled Sweet
      Child O' Mine's power-chord challenge from "Verse" to "Intro/Verse/
      Chorus" (label, body text, and the song-list meta chip in module-3.js)
      per Jonathan's ruling that the D5–C5–G5 loop isn't verse-exclusive;
      reworded `i18n.js` `review.playPrompt`'s first sentence; cut the last
      3 EN/ES "grab a friend" partner-line survivors (module-6.js and
      module-7.js Ear Sparks, a module-4.js Level-up) that the 07-27 pass
      missed; appended the narrow-pin ratification line to the `MC_PINNED`
      comment in app.js (no behavior change); gave the skills-checklist's
      "You've got it when" `<strong>` the `.got-it-lab` class so it matches
      the step-card version.
      **Heading-specificity audit ran as a sweep + adversarial-audit pair**
      (per the sub-agent-sweep rule) — 203 `Challenge` labels across all 12
      module files, each checked against its own step body for an unnamed
      song: found exactly **one** real gap (`module-3.js` "F5 ↔ A5 Two-Shape
      Drill" → `("Luna")`, since the step is Luna's vamp but didn't say so),
      the rest genuinely generic drills or already-named. The audit agent
      independently re-derived the same 203-item list, spot-checked 56+
      step bodies including all 6 boundary cases the sweep agent flagged as
      deliberately-left-alone, and confirmed the 1-fix result holds — no
      false positives, no false negatives.
      **Item 17 (teacher.js uid-in-onclick) verified already fixed:** every
      `data-uid`-bearing control routes through the delegated listener on
      `#teacher-app`; the remaining inline `onclick="..."` calls only ever
      pass static literals (view names, `true`/`false`), never a Firestore
      uid. No code change needed, closed by verification alone.

- [x] **2026-08-04 — Set peek: read-only preview of a locked set.** Pushed
      `a648364`. Extended
      the existing Module Review preview idiom (`mr-locked` class + disabled
      controls + a banner, all synced by `renderPills`) to ordinary sets.
      Tapping a sequentially-gated locked pill now opens the set read-only
      (`activateSet(id, {peek:true})` sets a `set-peek` class on its panel)
      instead of just toasting. Two-phase work order: Phase 1 was a design
      memo + worked example (Module 2 Set 2) that stopped for approval before
      touching every set; Phase 2 was the full rollout.
      **Write-surface audit went wider than the brief:** the brief named
      checklist toggles, step-done buttons and drill check-off buttons, but
      grepping every `queueSave`-reachable path from inside a set panel also
      turned up Shuffle Drill's and Deck Drill's best-score saves
      (`sdSaveBest`/`sdRecordSkillBest` in `sdFinish`, `dkSaveBest` in
      `dkNext`) — both fire on drill completion independent of any
      check-off, so a peek that only guarded `toggleSkill`/`toggleStepDone`
      would still have let a peeking student silently write a `games` best.
      Guarded those too; drills stay playable during a peek, only the save
      is suppressed. All progress-writing paths funnel through guarded
      choke points (`toggleSkill`'s own top, plus the two drill-save sites)
      rather than needing a check at every call site — the coach/drill gate
      "mark it anyway" paths and the three `.sdr-checkoff` buttons all
      route through `toggleSkill`, so guarding it once covers all of them.
      **Caught before rollout, not after:** Phase 1's worked example only
      exercised the sequential gate, and the peek wiring didn't yet
      distinguish that from a *static* `locked`/`comingSoon` set (no build
      content, nothing to preview) — the assumption that only sequentially-
      gated sets get a peek was in the brief but not yet in the code.
      Caught by re-reading the brief before Phase 2's rollout, not by a
      user report; no live set currently sets `comingSoon: true` so this
      was never visibly broken, but the schema field is real and future
      content would have hit it. Fixed by threading a `staticClosed` check
      through both `renderPills`' pill wiring and `activateSet`'s own
      backstop, so even a direct/stale call can't force a peek onto a set
      with nothing built. Peek state is DOM-derived, not a tracked
      variable (`.week-panel.active.set-peek`), matching the project's
      existing preference (see `syncExploreNav`'s reasoning) — this also
      keeps the pill rail's "you are here" highlight correct across
      unrelated re-renders (language switch, a skill toggled in another
      tab) without a second source of truth to keep in sync.

- [x] **2026-07-27 — site-wide review: outage fix + 13 commits.** Started as
      "check the site for errors" and immediately found the **whole site was
      down**: `buildSet()`'s song-thread block named its `map` callback
      parameter `t`, shadowing the global i18n `t()`, so every set with a
      `songThread` threw and **no module content rendered at all** (`3ab369d`).
      Introduced hours earlier the same day by an i18n conversion
      (`29c5187`) that added a `t()` call inside that callback. The failure
      was sticky: `_modulesRendered.add(num)` ran before the throw, so
      switching modules never rebuilt for the rest of the session — refreshing
      genuinely could not help. **Every existing check passed**, because the
      file was syntactically valid and the module DATA was fine. Hence
      `dcdb372`: `checks.mjs` now has a **render smoke test** that loads
      i18n + diagrams + module data + app.js in a vm against a minimal DOM
      stub and calls `buildSet()` on all 36 sets. Verified by reintroducing
      the bug (21 sets fail, exit 1). A harness that can't load degrades to a
      WARNING, never a blocked push — a stale stub must not become a reason to
      delete the safety net.

      Also shipped: sign-out now flushes the pending debounced save and hard
      reloads (a got-it ticked seconds before signing out was dropped, and
      `_modulesRendered` + the built DOM + `sessionStorage` bests survived
      into the next student on a shared Chromebook) and two service-worker
      correctness fixes — `waitUntil` the `cache.put`, not the fetch, and
      install with `{cache:'reload'}` so a new `CACHE_VERSION` can't be filled
      from stale HTTP copies (`b70621e`); teacher **pause + archive**
      (`90c486e`, both uid→bool maps in `config/class` so they need no rules
      change and can't destroy work); the sequential gate became a
      **high-water mark** (`6b2c19b` — un-ticking one skill re-locked the
      next set even when it was finished); Module 13's winding rewritten for
      the **classical slotted headstock** it was always taught on
      (`7631362` — the graded criterion demanded "wraps walking down the
      post", which a horizontal roller cannot do; the sketch was already
      correct, only the words were wrong) plus steel-vs-nylon and safety
      additions (`7f22360`); Module 10's "Smoke on the Water" moved from the
      A blues scale to **G**, the riff's actual key (`7f22360`); the
      Firestore rules **versioned** as `firestore.rules` + a teacher-email
      drift check (`44a4adf`, published to the console by Jonathan the same
      day — GitHub Pages does NOT deploy rules); then a seven-agent fix sweep
      with a ten-agent adversarial verification workflow — eight runtime
      defects (`127bb19`), keyboard/screen-reader (`475e3b0`), curriculum
      across M1–M12 (`569fd3d`), and Module 12's forward no longer promising
      a capstone that doesn't exist (`ae6f27f`).

      **Why the verification pass earned its cost:** it confirmed four
      defects *in the fixes themselves* and refuted three others. The worst
      was self-inflicted — the new "flush pending ratings once auth arrives"
      logic in `tabs/journey.js` didn't record WHOSE ratings they were, and
      Firebase auth persistence is shared across tabs, so a journey page left
      open while signed out would flush the previous student's ratings into
      the next student's doc unprompted. That is the exact cross-student
      class `b70621e` had just removed, reintroduced by a fix for something
      else. Three agents also **corrected the briefs they were given** (a
      "C major" MIDI list that was actually B Locrian; rhythm data summing to
      7 beats not 8; an A-shape sub-barre defect claimed in two files that a
      grep proved existed in one). Lesson worth keeping: brief agents to find
      problems rather than confirm work, and verify structured claims against
      the data before relaying them.

- [x] **Module 5 assessment settles on one song; song titles quoted
      site-wide** — pushed `598a580` (2026-07-26, applied via cloud patch
      pair) then `8262116` (2026-07-26, local). The cloud patch closed out
      the last inconsistencies from the two-song assessment work (`mr5-s8`,
      the Full Run practice counter, Set 4's skill list, and Let It Be's Set
      2 card all still said one song) and clarified Module 3's Mystery Chart
      ("the lowest fretted dot" → "lowest-sounding … nearest the thick
      strings," since the app draws frets top-to-bottom so the higher fret
      sits lower on screen; the alphabet-walk stuck-hint now covers the A
      string too, not just low E; the unnumbered challenge got folded into
      its set's numbering). Locally, Jonathan then reversed the two-song
      requirement itself: Module 5's assessment now asks for ONE core song
      from memory (Let It Be, Luna, or "the cure") — the "song of your
      choice" requirement is gone, though its Set 4 practice material
      (chord-mapping, the Full Run's chart-first rep) stays as optional
      ungraded practice, not something the assessment checks. Separately,
      every song title across all 13 modules, `coach.js`, `i18n.js`, and the
      six Song Journey pages is now wrapped in quotation marks for
      consistency — including shorthand nicknames ("Watchtower," "Sweet
      Child") and "SNA" spelled out as "Seven Nation Army" — done via 7
      parallel file-scoped agents plus a manual pass to reconcile the
      nickname-quoting convention across them. Live-site spot-checked in the
      browser: Module 5's self-assessment and assessment-checklist wording,
      the "All Along the Watchtower" Song Journey page's title/heading, and
      Module 4's shorthand-nickname challenges all confirmed correct.
- [x] **Report-an-issue in-site form + always-top-scroll fix** — pushed
      `a86ec71` (2026-07-24). Footer's "Report a problem" now opens an
      in-site form (`openIssueModal`/`submitIssueReport`, `app.js`) instead
      of a mailto link — writes to a new Firestore `issueReports` collection
      with the student's email/name, current module+set, browser info, and
      message auto-attached; falls back to the old mailto if Firebase/
      Firestore isn't reachable or the student is the dev-bypass user (same
      convention as progress saves). New security rule documented in
      `index.html`'s setup comment (also backfilled the previously-
      undocumented `config` collection rule there); Jonathan confirmed +
      published the matching rule in the Firebase console the same day.
      Browser-verified (dev bypass + manual console calls): modal renders,
      empty-message validation, and the graceful failure path (dev-bypass
      writes are rejected by Firestore rules) all work as expected — the
      live end-to-end save (real signed-in student) hasn't been checked yet.
      Separately: opening or returning to a Set now **always scrolls to the
      very top**, replacing the scroll-memory feature from 2026-07-12 (which
      Jonathan decided he didn't want after all) — `activateSet` no longer
      restores `window.scrollY`, and `history.scrollRestoration='manual'`
      (matching `tabs/journey.js`) stops the browser's own back/forward
      scroll memory from undoing it.
- [x] **Real-guitar mic tests all passed clean (2026-07-24)** — closes out
      the last two open items:
      - **Riff Runner Wait Mode** (untimed, mic-graded note-by-note
        play-along, metronome/count-in removed) — tested live on Seven
        Nation Army; no-clock flow feels natural end to end.
      - **Mic features retest**: melody mode's new `coachNowHtml`
        current/next preview (Module 2 · Set 1 · Station B, low E notes)
        fixed the beat-late timing bug and lands notes on time now; one
        Note Hunt round and one full Change Up round also passed clean.
      Nothing further to fix — this was the last item tracked under Open
      work, so that section is now empty.
- [x] **Module 13 · String Changing — new single-flow module + graded
      assessment** — built in the cloud session, applied+pushed locally via
      patch (`539a939`, 2026-07-23). New `module-13.js`: 7-section process
      (tools/safety → 4 verified videos → remove → seat at bridge → wind →
      tune/stretch → assessment briefing), covering BOTH nylon **ball-end**
      (no tie knot — the string type being purchased) and steel-string; 3
      hand-drawn inline-SVG diagrams with EN/ES label variants; 4 checklist
      skills = the in-class assessment rubric (safe removal · bridge
      seating · post winding · tune-stretch-hold), each with `gotItWhen` +
      an mc practice drill; hand-written Spanish throughout. Videos
      oEmbed-verified: Lauren Bateman (steel), Takamine (nylon), LEARNING-
      CHORDS (ball-end nylon), guitarraviva (Spanish, luthier). App support:
      buildSet single-flow path, panelFooter reroute, rail sync (see
      "Working conventions" above); `MODULE_MANIFEST` num 13 (skillCount 4);
      `module-13.js` added to `sw.js` ASSETS. This is the last
      FUTURE-CHANGES item — closed in the same patch.
- [x] **Keep practicing + My progress → full-screen pages** — pushed
      `dc2d6ef` (2026-07-23; built in the cloud session, applied+pushed
      locally via patch). Games-screen pattern in the site's normal look:
      `#keep-practicing` / `#my-progress` URL hashes, browser Back exits,
      "Back to practice" button, proper dialog focus handling. Picking a
      skill from Keep practicing still jumps to its lesson (closing the page
      via the hash); bookmarked hashes reopen the right page after sign-in;
      language switches re-render open pages in place with no history churn.
- [x] **Songs hub: two-tier layout — Core card + Choice menu grouped by
      difficulty** — pushed `5043121` (2026-07-23; built in the cloud
      session, applied+pushed locally via patch, excluding a stale
      `translations-review.md` hunk since that file had just been retired).
      Core six pinned in their own card on top; Choice menu splits into
      collapsible difficulty groups keyed to first-appearance module (First
      riffs & single notes M1–4, 21 songs · Chord & strumming songs M5–8,
      21 songs · Advanced M9–12, auto-hidden while empty); first group open
      by default; headers show counts; module Focus songs keep their tag
      inside the groups; student-request row renders last, reworded to "any
      song that means something to **you**." 7 new `hub.*` strings EN+ES.
- [x] **Practice-step polish trio: disclosure pills, scroll-under-header,
      safe-handling fold removal** — pushed `5cbb316` + `ee1a5f0` +
      `b95f1f5` (2026-07-23; built in the cloud session, applied+pushed
      locally via patch pairs). Hint/Stuck?/Level up pills now sit in a
      fixed row with the open panel full-width below (tab-style, one at a
      time — the old `<details class="step-fold">` markup is gone);
      programmatic scrolls land below the sticky header
      (`scroll-margin-top` + a `toggleStepOpen` rAF nudge); Module 1's Safe
      handling step dropped its redundant folds down to just the
      instruction.

- [x] **Live-site device checks, no mic needed — closed without on-device
      confirmation** (bundled from REVIEW-PLAN K-2/K-5/D-7 and the
      compact-checklist work, 2026-07-20; closed 2026-07-23) — covered the
      tuner's post-YIN-optimization string lock, tuner string-selector touch
      targets, compact checklist + Song Journey pages at phone width
      (~360–400px) and in print preview (⌘P). All the underlying code
      shipped; **Jonathan decided phone-specific polish isn't a priority for
      him**, so this is marked done as a deliberate scope call, not because
      it was verified working on a real device. If phone usability becomes a
      concern later, these are the specific checks to revisit.

- [x] **Custom backing tracks for all six journey-page play-alongs — Jonathan
      made them himself** (Jonathan, 2026-07-20 → all six DONE 2026-07-22;
      this entry was stale until corrected 2026-07-23, see below) — every
      Song Journey page has a "🎵 Play along" button; all six now play
      Jonathan's own local mixes (`audio/`) instead of generic YouTube jam
      loops, each a clean rhythm-down mix + a metronome variant (`<audio>`
      element, "🎵 Metronome" toggle preserving playback position), every
      track exported at A=440. **"the cure"** (Am, 144 BPM) and **Luna** (Am,
      128 BPM) done first (2026-07-22), followed same day by **Watchtower**
      (Neil Young cover, Am, 115 BPM — display name stays "Dylan/Hendrix" per
      the artist-stays-out-of-display-metadata rule), **Sweet Child O' Mine**
      (G, 125 BPM — standard tuning on this site, so it sounds a half-step
      above the famous down-tuned recording, expected/documented), **Let It
      Be** (C, 71 BPM), and **Seven Nation Army** (Em, 123 BPM). Bonus 🐢
      **Slow tier** added same day for four of the six ("the cure" 120 BPM,
      Watchtower 90 BPM, Sweet Child 100 BPM, Seven Nation Army 100 BPM) — an
      independent tempo toggle alongside the Metronome toggle
      (`data-audio-slow`/`data-bpm-slow` in `tabs/*.html`, generic handling in
      `tabs/journey.js`, which rescales `currentTime` by the tempo ratio on
      toggle so playback position holds through a tempo change). Naming
      convention: `<artist-slug>-<song-slug>-backing-<key>-<bpm>bpm-<tuning>
      hz-<mix>.mp3` (see CLAUDE.md's "Backing-track naming & tuning"
      section). **Correction 2026-07-23:** this item had sat marked "Open"
      listing Seven Nation Army/Sweet Child/Let It Be as still pending
      Jonathan's files, months after all three actually shipped
      (`c2b9e94`/`2958547`/`73c7afd`, 2026-07-22) — caught when Jonathan
      pointed out the files were already in `audio/`. Lesson: an Open-work
      item needs its ground truth (git log / working tree) spot-checked
      before assuming a stale-looking status is still accurate.

- [x] **Module 12: confirmed the requinto video fits, deleted the leftover
      note** (REVIEW-PLAN C-7, 2026-07-20; resolved 2026-07-23) —
      `module-12.js`'s La Derrota (Vicente Fernández) requinto lesson had an
      HTML comment flagging it for a fit check against the sierreño/corridos-
      tumbados requinto skill it teaches. Re-verified the video
      (`cRJb_f4-M5g`) is still live via oEmbed, and confirmed via WebSearch
      that it's specifically a "part 1: requinto line" lesson (the same
      instructor, Jorge Aguilera, splits his tutorials into a requinto part 1
      / chords part 2 for other Vicente Fernández songs too, e.g. "Para
      Siempre") — a good, purpose-built fit for the lesson's stated goal
      (watch the picking hand carry the melody). Deleted the review-flag
      comment; no video swap needed.

- [x] **i18n phase 2 — hand-written Spanish for module/lesson content, tabs/
      pages, and games** (started 2026-07-22) — phase 1 (already done, see
      CLAUDE.md's "i18n — hand-written Spanish for the app shell") only
      covered the shell (header, nav, tools, checklist). This phase extends
      real Spanish to the twelve module files, the Song Journey pages, and
      `coach.js`'s games, then removes Google Translate entirely once
      everything's covered.
      **Session 1 (2026-07-22): architecture + Module 1, done & browser-verified.**
      Schema: parallel `<field>_es` suffix fields on every translatable field
      (`text_es`, `hint_es`, `meta_es`, …) — renderer falls back to English
      when absent, so modules translate incrementally with no code changes
      needed per module. `app.js` gained a `tf(obj, field)` helper used at
      ~25 render call sites (steps, hints, skills, songs, assessment, module
      review, the 10-minute routine card, TAB captions, playSeq labels) plus
      ~40 new shell strings in `i18n.js` for the chrome *around* that content
      (fold labels, response labels, module-review copy) that had never been
      wired to `t()` before. Module-content panels are built once and cached
      (`ensureModuleRendered`), so a new `rebuildModuleContentPanels()` runs
      on `gc-langchange` to re-render already-open panels in the new
      language (preserving the active station/songs/checklist tab).
      `tools/checks.mjs` gained an i18n-completeness pass (`1b.`): any module
      flagged `i18nComplete` in `MODULE_MANIFEST` must have a real `_es` twin
      on every required field, enforced on every push. Once a module is
      flagged complete, its Set + Module Review panels get `translate="no"`
      so Google Translate can't touch (or re-translate) the hand-written
      Spanish — modules still in progress keep Google Translate as their
      fallback, same as before this phase. **Module 1 (both sets + its
      Module Review) is fully translated and flagged `i18nComplete`** —
      glossary extended with guitar-anatomy terms (clavijero, cejuela,
      selleta, puente, mano de trastear/de pulsar) and Song-Journey terms
      (Recorrido de la canción, capa). Browser-verified end to end via a
      local static server + dev bypass: every step/hint/response/choice,
      the riff TAB block, the songs list, the skills checklist, and the full
      Module Review (routine card, reflection, assessment, "why this
      matters") all render in Spanish with no English leaking through.
      Known gaps intentionally deferred (documented in
      `translations-review.md`'s "Known gaps" section): locked-set gate
      toasts, the Games/Songs Hub/Keep-practicing/My-progress panel
      *contents*, the Daily 5 modal, and the recording widget's two labels —
      none of these are module-N.js content, so they're unaffected by the
      `i18nComplete` gate and stay Google-Translate-covered.
      **Session 2 (2026-07-22): Modules 2 & 3, done & browser-verified —
      built with a multi-agent workflow (ultracode).** Two independent
      translator agents hand-translated `module-2.js` and `module-3.js` in
      parallel (each read Module 1 first as the reference pattern), each
      immediately followed by its own independent adversarial Spanish-quality
      reviewer (6 issues found+fixed in Module 2, 1 in Module 3 — English
      leakage, register, glossary drift). Both modules fully verified via
      `node --check`, a scripted structural completeness sweep, and
      `tools/checks.mjs`, then flagged `i18nComplete`. Glossary extended
      (post-hoc reconciled against ACTUAL usage in the files, not the
      agents' self-reported terms, which were sometimes wrong — e.g. Module
      3's agent claimed it used "fundamental" for "root" throughout but the
      file actually uses "raíz" consistently; the memory now records what's
      really in the files): sight-read → leer a primera vista, root → raíz,
      home note → nota base, vamp/chug/boom-chick kept as loanwords, beat →
      tiempo, bar/measure → compás. One schema gap found and fixed: neither
      translator's brief mentioned `MODULE_SONGS[N]` (a module-level song
      list separate from a Set's own `songs:` array, used by modules 2–12) —
      added `meta_es` for both modules' entries by hand and added a
      `tools/checks.mjs` requirement so future modules can't skip it.
      `translations-review.md` backfilled with full EN→ES tables for
      Modules 1–3 (Module 1's had been skipped in session 1).

      **Mid-session incident:** a second, concurrent Claude Code session was
      running directly in this same working tree (not its own worktree) and
      a `git checkout`/`restore` it ran silently discarded ALL of this
      session's then-uncommitted work in `config-main.js`, `module-2.js`,
      `tools/checks.mjs`, and `i18n.js` — Module 2's translation, fully
      verified, was gone with no recovery path. Module 3's translation
      (still intact) was immediately committed alone to protect it before
      continuing. The concurrent session then moved to its own worktree;
      Module 2 turned out to still be recoverable once the working tree
      settled, so nothing had to be redone — but treat this as a live
      example of why the worktree rule above exists, not just a hypothetical.
      **Session 3 (2026-07-22): Modules 4, 5 & 6, done & browser-verified —
      3-module multi-agent workflow (ultracode), translate→verify→backfill
      pipelined per module.** Same pattern as session 2, scaled to three
      modules and with both session-2 lessons baked into the brief up front
      this time: translators were told explicitly about `MODULE_SONGS[N]`
      (missed for modules 2/3 originally) and told to grep their own file
      before self-reporting glossary terms (a session-2 agent had
      misreported "fundamental" when the file actually used "raíz"). Result:
      all three modules included their `MODULE_SONGS[N]` translation
      unprompted-a-second-time, and verify agents cross-checked reported
      terms against actual file content directly (one still had a minor
      count mismatch — reported "cejilla" 18 times, actually 17 — but the
      *term itself* was consistent, just a counting slip, not a translation
      bug). New glossary terms, this time reconciled against real usage
      before being recorded: root → raíz (module 4 confirmed this again),
      barre → cejilla, resolve/resolution → resolver/resolución, backbeat/
      offbeat → contratiempo, chop (reggae upstroke) → picoteo/picar,
      groove kept as a loanword (matching riff/vamp/chug). Module 6's own
      translator agent set its `config-main.js` flag itself (mirroring
      module 2's agent in session 2); Modules 4 and 5's flags were set by
      the coordinator after their independent verify passes.
      **Also found and fixed a real production bug while browser-testing
      Module 4** (already live for Modules 2–3 too, since it's shared
      `app.js` code, not per-module data): the "⚡ Tune and warm up first…"
      reminder shown on Station C for every module except Module 1 was
      hardcoded English, missed in session 1 because Module 1 never
      triggers that code path. Fixed by wiring it through `t()` like
      everything else — the fix applies retroactively to every module, no
      module-file changes needed.
      `translations-review.md`'s shell-glossary table had also drifted out
      of sync with `i18n.js` (sessions 2's new terms were added to the code
      comment but never mirrored to the doc table) — caught and backfilled
      both sessions' worth of terms in the same pass.
      **Session 4 (2026-07-22): Modules 7 & 8, done & browser-verified —
      same 2-module translate→verify→backfill pipeline as session 3.**
      Module 7 (TAB Notation and Barre Chords) uses "barre" 120+ times —
      100% landed as "cejilla" per a scripted grep-only-the-_es-fields
      check the translator ran itself. New terms: double-stop → doble
      nota/dobles notas, sub-barre (ring-finger mini-barre inside a full
      barre shape) → sub-cejilla. Module 8 (Finger Picking) introduced a
      full new vocabulary cluster: fingerpicking/fingerstyle kept as
      loanwords (matching riff/vamp/chug/groove), Travis picking kept as a
      named technique, pinch → pellizco/pellizcar, alternating bass → bajo
      alternante, rest stroke/free stroke → apoyando (toque de apoyo) /
      tirando (toque libre) — the real classical-guitar Spanish terms for
      those techniques, not a coinage. Both verify passes were solid (3
      issues found+fixed in Module 7, 0 in Module 8) but the coordinator's
      own independent sweep still caught one real miss the module-8 verify
      pass didn't: `forward_es` had "power chords" left untranslated
      instead of the established "acordes de potencia" — module 7's verify
      agent happened to notice it in passing (reading module-8.js for
      context) and flagged it for the coordinator, since fixing another
      module's file was outside its own scope. Lesson: even a same-module
      verify pass can miss something a cross-module read catches — worth
      an explicit coordinator-level English-leak sweep across all touched
      files at the end of every session, not just trusting each module's
      own verify pass in isolation.
      **Session 5 (2026-07-22): Modules 9–12, done & browser-verified —
      ALL TWELVE MODULES NOW COMPLETE.** First 4-module batch (previous
      sessions did 2–3 at a time) via the same translate→verify→backfill
      pipeline; concurrency handled it fine (12 agents total, no
      collisions). These four modules lean much more into music theory
      than 1–8, so most of the session's new vocabulary is theory terms:
      whole/half step → tono/semitono, transpose → transponer (a
      translator initially coined "transportar," caught its own drift via
      the "grep modules 1-8 first" instruction, and self-corrected to the
      pre-existing module-4 term before finalizing — the instruction
      worked as intended), relative/parallel minor, key → tonalidad,
      triad → tríada, slash chord → acorde con bajo alterno, home chord →
      acorde base (paired with the existing "home note" → "nota base"),
      E-shape/A-shape barre → forma de E / forma de A, comp/comping →
      acompañar, chorus (blues) → ronda, chord family → familia de
      acordes, diatonic → diatónico/a, waltz → vals, downbeat → tiempo
      fuerte, fill → relleno, roll → floreo, plus Module 9's own
      fretboard-mapping terms (octave shape → forma de octava, the
      B-string tuning offset → el desfase de la cuerda B). Also explicitly
      added "capo (the physical device) → capo, kept — distinct from
      cejilla" to the glossary, since Module 11 uses both concepts close
      together and a translator could plausibly conflate them (one did,
      briefly, in session 4's Module 8 — see that session's notes — this
      makes the distinction explicit going forward).
      Coordinator's own cross-file sweep (the session-4 lesson, now a
      standing step) specifically re-checked for "power chords"/"barre"
      slipping through untranslated in modules 9-12's forward/summary
      text — found zero leaks this time, confirming the tightened
      translator+verifier briefs (explicit instruction to grep for
      established terms, not just new ones) closed that gap.
      **Session 6 (2026-07-23, cloud Cowork session): shell "Known gaps"
      CLEARED + practice-drill Spanish for 83 new drills.** The deferred
      shell list from session 1 is done — locked-set gate toasts + locked
      pill tooltips, Songs Hub / Keep practicing / My progress panel
      contents, the Daily 5 modal, the report-a-problem subject, the
      recording widget (incl. both alerts), and the checklist cells'
      aria-labels: 46 new `I18N` keys, en+es, wired with language-switch
      rebuild handling; Daily 5 and Keep practicing now also read module
      content through `tf()` (they had been bypassing existing `_es`
      twins). Separately, the Practice System rounds (see Recently
      shipped) added hand-written `_es` for all 83 new practice drills
      across modules 1–12 plus the new practice-panel UI strings —
      review tables backfilled in `translations-review.md`.
      **DONE 2026-07-23 (same-day session): coach.js games arcade +
      Listening Coach converted to t() (407 new keys), the six tabs/
      Song Journey pages hand-translated via data-es, and Google
      Translate REMOVED site-wide** (the `WINTER_CHALLENGE` Challenge
      Day feature was removed entirely instead of translating it).
      **CLOSED 2026-07-23:** the AI-sweep proofread review (session 6's
      review policy) is finished with all findings fixed, closing out phase
      2 end to end. `translations-review.md` — the working EN→ES review
      sheet used throughout this phase — was deleted (`956743e`) now that
      the review it supported is done; the review policy itself moved into
      CLAUDE.md's i18n section as the standing rule for future Spanish
      batches.

- [x] **Practice everywhere (round 2): Modules 6–12 drills + six-string
      Find-the-Note + shell i18n finished + list-formatted directions** —
      pushed `9d742ac` (2026-07-23; built in the cloud Cowork session as
      `202f4dd`, applied+pushed locally via patch, hash changed with
      `git am`). 54 new drills
      (all 230 course skills now practiceable; M6–12 mix 77 mc / 31
      playSeq / 17 pr / 5 chord / 5 fretboard) + 9 conversions (M7/M11
      barres → 'chord', M9 note-naming → per-string 'fretboard');
      Find-the-Note extended to D/G/B/high-E + a six-row 'all' mode;
      i18n session 6 (see Open work); practice prompt/explain/chord-label
      now render trusted HTML; 17 step texts + 20 pr prompts reformatted
      as `<ol>/<ul>` per Jonathan's new list rule (documented in
      CLAUDE.md); step-preview tag stripping made word-safe;
      `.step ul` solid discs. One content removal to know about:
      m9w2-s2's old "why do the two E strings share note names?" mc was
      replaced by its fretboard game (flagged to Jonathan).
- [x] **Practice System 2.0 (round 1): every Module 1–5 skill practiceable,
      with rep tracking and spaced review** — pushed `1deed88`
      (2026-07-23; built in the cloud Cowork session, applied+pushed
      locally via patch). Engine: `practiceLog` persistence (Firestore
      save category + localStorage write-through), rep strip with a
      3-reps/day goal on every practice panel, "Keep it sharp"
      spaced-review card at the top of each set's checklist, and three
      new practice types — `fretboard` (Find-the-Note game, lowE/A/both),
      `chord` (diagram + Listening Coach + log-rep), `pr` (structured
      BPM/count ladder on the responses PR-history path, no regex
      heuristic). Content: 29 drills added + 2 conversions so all 77
      M1–5 skills have `practice:`, hand-written `_es` throughout.
      Verified via checks.mjs + Playwright integration on real module
      data. `practiceLog` is teacher-dashboard-ready but not surfaced in
      teacher.js yet (future idea).

- [x] **Tuner / Timer / Metronome on the Song Journey pages** — pushed
      `8eb26f6` + `8f33ae1` + `2acd13f` (2026-07-20). The same floating
      tool buttons students have in the main app now sit on all six journey
      pages, so they can tune up, set a countdown, or click along without
      leaving the song. Implementation: metronome/timer/popup logic extracted
      from `app.js` into a shared, dependency-free `fab-tools.js`; its styles
      ported to `tabs/fab-tools.css` (+ needed color tokens in
      `tabs/journey-theme.css`); FAB markup + `tuner.js` + `fab-tools.js`
      wired into each `tabs/*.html`. Verified in-browser on both `index.html`
      (unchanged behavior post-extraction) and `tabs/luna.html` (tuner mic,
      metronome tick, timer countdown all working).
- [x] **Song Journey pages: compact one-layer-at-a-time accordion + tip
      folds + play-along tracks** — pushed `dbd2f8f` + `c0b14fc`
      (2026-07-20), executing `archive/PLAN-COMPACT-JOURNEY.md`. Each page's
      5–6 fully-expanded layers now collapse to scannable header rows
      (badge + title + module chip + rating chip + chevron), one open at a
      time, with an "N of M layers rated" pill; `#layer-N` deep links still
      open + scroll to their layer. Inside an open layer the Stuck?/Level up
      branches sit behind `<details>` folds, and every page gained a
      lazy-loading "Play along" button (SNA / Sweet Child / Let It Be got
      newly-found oEmbed-verified vocals-kept/guitar-removed tracks; the
      other three keep jam loops pending moises.ai — see Open work). The
      previously-verbatim-duplicated inline script is extracted to
      `tabs/journey.js`; print styles added; `checks.mjs`/`sw.js` now
      fingerprint `tabs/*.css`/`*.js` too. Musical facts untouched (settled
      list in CLAUDE.md).
- [x] **Sidebar redesign + header search box** — pushed `f4d952d` →
      `92e5da6` (2026-07-20). The left rail got a cool neutral-gray
      background with distinct, color-matched Station B / Station C /
      checklist row backgrounds (not just badges), and Find moved out of the
      Explore nav list into a compact search-box-styled button in the top
      purple bar (visible once signed in).
- [x] **Station checklists: compact, one-tap-at-a-time steps** ("Concept B") —
      pushed `e6925ec`, plus same-day follow-ups `66cbc7d` (flattened the
      sections to match the approved mockup — the first push missed that) and
      `40a03ba` (row/section dividers, compact song blurb, dropped the
      Keep-going card) (2026-07-20). Station B/C steps now collapse to a
      single scannable row (status circle + short label + chevron); tapping
      opens the full step (video, chords, TAB, response), one open per
      section, with the first not-done step open by default. Mark done
      collapses the row, shows ✓, and auto-opens the next not-done step; a
      live "N of M steps done" pill sits next to each station's title.
      Collapse/expand is CSS-class-only (never a re-render), so in-progress
      responses survive. Short labels are derived from step text, with
      special handling for `Challenge — X:` / `Challenge N — X:` and a kept
      `Watch:` prefix. Deep links (search, "Show me where") auto-expand their
      target step. Browser-verified via Dev bypass: typed-text survives
      collapse/expand, one-open-per-section both directions, mark-done
      auto-advance + pill update, chord diagrams render, bare (Station C) and
      sectioned (Station B) layouts both correct. **Not yet verified:** phone
      width (~400px) and print preview — tracked above under Open work. Spec
      archived at `archive/PLAN-COMPACT-CHECKLIST.md`.
- [x] **REVIEW-PLAN full-site review, P1/P2 batch** — pushed `b76dd67`
      (2026-07-20). Implemented essentially every item across the review's
      four dimensions via a multi-agent workflow: auto-retry progress saves,
      real `<h2>/<h3>` headings in generated content, welcome-dialog focus
      trap, `data-sid` skill-row selection (replacing regex-parsed `onclick`
      matching), the `#games` deep link, a site-wide practice streak, "keep
      practicing" + "my progress" panels, persisted Listening Coach results,
      a teacher trouble-spots view + BPM personal-record history, metronome
      accent/count-in, an offline banner, chord-set song search, tuner
      YIN-scan cost cut ~5× + per-frame allocation removed, tuner/pill touch
      targets, a Bm clean-fret drill, an oEmbed-verified video swap, journey
      pages brought onto the app's plum/dark theme with fixed contrast, and a
      `checks.mjs` Firestore-SDK-version assertion across all 8 copies — then
      reviewed the diff across three dimensions and fixed the 4 confirmed
      bugs found (a song-search dedup bug hiding 3 core songs from chord
      search, a metronome keyboard-nav gap, invalid heading markup, missing
      focus movement on the two new panels). Full item-by-item detail
      archived at `archive/REVIEW-PLAN.md`; the handful of items needing
      Jonathan live on a real device are tracked above under Open work.
- [x] **Gate the Sets in each module — do them in order** (Jonathan, 2026-07-12) —
      DONE & browser-verified. Every Set now locks until the Set before it is
      finished (all its skills marked "I've got it!" — same bar as Module
      Review). Implementation in `app.js`: `isSetComplete(w)` / `isSetLocked(w)`
      (sequential, first set always open); `renderPills` uses them and gives a
      locked pill a 🔒 + a tap-hint `gateToast(...)` naming the set to finish
      first; `activateSet` has a backstop that refuses a locked set; `goToSet`
      /search deep-links (`gatedJumpGuard`) land on the module's *frontier* set
      with a toast instead of revealing a hidden locked panel; `onModuleChange`
      picks the frontier (first unlocked+unfinished) as its default target and
      never lands on a locked set. CSS: `.wpill.locked:not(.review-pill)::before`
      lock icon + `#gate-toast`. Unlocks live because `toggleSkill` re-renders
      pills. Verified: M4 Set 2/3 locked, tap-toast, live-unlock of Set 2 on
      completing Set 1, Set 3 staying locked.
- [x] **Fix where each page opens (scroll position)** (Jonathan, 2026-07-12) —
      DONE & browser-verified. `activateSet` is now the single authority on set
      scroll: it saves `window.scrollY` for the set you're leaving into an
      in-memory `setScrollPos` map and restores it when you return, or scrolls to
      top for a set never opened this session. Removed the competing
      `window.scrollTo({top:0})` calls in `goToSet`, `songHubGoModule`, and
      `searchGoSet` that were forcing top and causing the "sometimes scrolled,
      sometimes not" inconsistency. Verified: first open → top(0); leave at 500 →
      return restores 500; second set restores its own 300.
- [x] **Harden the gate + scroll** (Jonathan, 2026-07-12, worktree `worktree-jh-session`) —
      Two follow-ups to the two items above, browser-verified. (1) **Previewer
      bypass:** new `isGatePreviewer()` (dev-bypass user via `isDevBypassUser()`,
      or a login as `TEACHER_EMAIL`) makes `isSetLocked` and `isModuleReviewLocked`
      return unlocked, so a teacher/dev previewing the *student* app sees every
      Set + Module Review without grinding skills; the static `locked/comingSoon`
      flag still hides unbuilt content for everyone. Normal students are
      unaffected (verified: student ctx still gates m4 Set 2/3 + review).
      (2) **Scroll survives reload:** `setScrollPos` now hydrates from / persists
      to `localStorage['gc-scroll']` (same `gc-` convention as gc-lastSet), saved
      on set-leave and on `pagehide`/`visibilitychange:hidden`; `window.scrollTo`
      clamps so a stale offset can't overscroll. Verified: reload → m4w2 restored
      to 250, a never-opened set still opens at top. Pushed `41efa61`.
- [x] **Fret Zap** — games arcade, `fz*` in `coach.js` — pushed `c64ef08`
      (2026-07-11), browser-verified against the live code 2026-07-12. A
      no-mic, no-guitar fretboard note-naming sprint: a blank dot lights on
      a fretboard diagram (reuses app.js `localNoteSvg`) and the student
      taps the note's name from four choices before a 60-second clock runs
      out. Mirrors the Chord Blitz scaffolding — streak multiplier,
      wrong-answer reveal + requeue, session best (`fzBest:<deck>`) and
      cross-session best via `games.fz`. Four difficulty decks (low-string
      naturals → all strings 0–5 → naturals to 12 → everything with sharps);
      keys 1–4 answer on a laptop; reward tone via `playNote`. Built with a
      build → adversarial-review (4 dimensions) → verify → fix workflow (4
      findings fixed: a missing `#fz-body` width rule, two changelog idioms,
      an unglossed "naturals"). Browser test confirmed note-math, scoring,
      wrong-answer requeue, keyboard, timer, done screen, and exit cleanup
      (no leaked timer/listener) with zero console errors. **No real-guitar
      retest needed** (it never touches the mic).

---

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

## Project: what this is
Plain static HTML/JS/CSS — no build step, no framework. Content lives in
`index.html` and per-module JS (`module-1.js`…`module-13.js`, `config-main.js`).
Firebase auth + Firestore progress. Deployed by pushing to GitHub.
`live-quiz.js` holds the whole live-quiz feature (student + teacher) — see
`.claude/rules/live-quiz.md`.
Module 13 (String Changing) is a *single-flow* module — `stations.b` only,
custom tab labels, checklist = graded assessment.

**Stations B and C are merged in DISPLAY ONLY** (2026-08-27). A set renders as ONE step ladder (B's sections, a seam divider, then C's), but `stations.b` / `stations.c` and every progress key (`${w.id}-b-sec{gi}-{i}` / `-c-sec{gi}-{i}`) are unchanged — never "simplify" the data to match the display. **`gi` is the section's position after excluding only tuning-warmup sections (`storageSections()`); render-time hiding never renumbers it** (checks.mjs 1af). Renderer: `buildLesson()`; tab-panel suffix `LESSON_TAB` (still `'station-b'`); sections are addressed by `data-ns`. No "Station B/C" wording in student text — the mid-set card is **Checkpoint / Punto de control**, the end one **Wrap-Up / Cierre** (1n). **Only `m4w2` is shown as Part 1 / Part 2** (`partOne`, `partBreak`; 1ao pins the count at 1); display only, no key moves, a set is complete when the SET is. Resolvers `lessonParts()` / `lessonGroups()`; field docs in the schema comment at the top of `module-2.js`. Full text: `WORKFLOW.md` → "Moved from CLAUDE.md (2026-10-28)".

**There is no student tour.** `tour.html` + `tour-img/` were deleted 2026-08-27
(they taught the retired B/C model and every screenshot was stale). Jonathan is
building a new one — don't resurrect the old file from git.

**The set has no in-panel tab bar.** The rail is the only switcher;
`switchTabById()` drives `.tab-panel` directly. A set is exactly two panels,
the lesson ladder and the checklist — the per-set Songs tab was removed
2026-08-27 (unreachable since the rail took over, and the Songs hub already
lists the same songs, Module 1's included).

**Target screen: a school Chromebook, 1366×657** (Jonathan, 2026-10-26: nobody
uses the site on a phone). Design, test and measure at that size. Phone width is
out of scope: don't audit, test or fix phone-only layout, and don't add phone
breakpoints, unless Jonathan asks. Leave the phone CSS that's already there
alone (don't spend time deleting it), and keep checks.mjs 1o — it costs nothing
and also guards narrow Chromebook windows.

**Live preview:** VS Code Live Server — right-click `index.html` → "Open with
Live Server". No commit needed.

**Dev bypass:** a button on the auth wall loads a mock user for UI testing.
Progress won't save to Firestore in that mode.

**Shell:** Jonathan works on Windows *and* macOS. Match command syntax to
whatever platform the current session reports — don't assume.


### Pre-push checks (old CLAUDE.md lines 110,141)

### ⚠️ Run the pre-push checks before EVERY code push

Before any push touching `index.html`, `styles.css`, `app.js`, `tuner.js`,
`teacher.js`, `config-main.js`, or a `module-N.js`:

```
node tools/checks.mjs
```

Exits non-zero if anything's wrong — don't push until it passes. It:

1. **Syntax-checks every shipped `.js`** (no build step, so a typo would ship).
2. **Validates module data** — every Set has the fields the app needs.
3. **Link-checks** ~240 external YouTube / Google-Docs URLs. Keep this on full
   pushes even when no links changed — it catches videos taken down since.
4. **Bumps `CACHE_VERSION`** in `sw.js` automatically. It's a content
   fingerprint of the cached shell *and* everything in `audio/`, so it can't be
   forgotten and re-exported audio gets cache-busted too. Since 2026-10-16 it
   also covers `sw.js`'s own code (version lines blanked), so a change to how
   the worker caches rebuilds every visitor's cache. Since 2026-10-25 it also
   covers every file listed in `sw.js`'s `ASSETS` (the font and the PNG icons
   included), and check 1bt fails the push if a precached file is ever left
   out of the fingerprint.

**Flags:** `--skip-links` (fast), `--check` (verify without changing files),
`--live` (fetch the live `sw.js` and confirm the deploy landed — run it a minute
after pushing; local sessions only, cloud can't reach the live site).

**Real-browser smoke test.** `node tools/smoke.mjs --baseline origin/main` boots the site in headless Chrome, walks every module and set in English and Spanish, and fails on any new JS error or inline handler that does not compile (Node 22+, Chrome; `--chrome <path>`). For renderer, escaping or many-file changes. Full text: `WORKFLOW.md`.

**Stop hook, git hooks.** `.claude/settings.json` runs `.claude/hooks/stop-checks.mjs` at the end of every turn that changed code; a real failure blocks the stop — **fix the cause, never loosen a check or add an allowlist entry**. Off switch `GC_STOP_CHECKS=0`. `.githooks/pre-commit` and `.githooks/pre-push` run the fast offline checks (`git config core.hooksPath .githooks`, done on both machines; pre-push exists because git skips pre-commit on merge commits). If a hook prints "skipping checks" it is a no-op — run `node tools/checks.mjs` by hand. Details: skill `session-handoff`.


### Parallel sessions (old CLAUDE.md lines 142,154)

### ⚠️ Parallel sessions: worktrees share one `origin`
Jonathan runs several sessions at once in `.claude/worktrees/*` (gitignored, so
they never leak into a commit). Worktrees isolate *files* — they still share one
repository and one `origin`, so isolation ends at the push. On 2026-08-20 a
worktree session merged `main` into its branch and pushed that merge straight
onto `origin/main`, which is how a feature-branch commit became `main`'s tip.
The lesson there is *don't push a merge you didn't intend* — not *don't push to
main*. A clean fast-forward (`git push origin HEAD:main`) is the normal way work
ships from a worktree; see the push rule under "How to work with Jonathan".
Before pushing, always `git fetch` and check
`git log --oneline HEAD..origin/main` — another session may have moved things
since the turn began.


### Three regimes (old CLAUDE.md lines 155,210)

### ⚠️ Three regimes decide what may change in a module
**2026-09-20.** A step's progress key is
`${setId}-${station}-sec${gi}-${i}`, so a step that changes INDEX takes a
student's tick with it and a section that moves takes every step after it.
What that permits depends on how far the class has got, and
`tools/rule-zero-proof.mjs` enforces exactly three regimes:

- **Modules 1–`FROZEN_THROUGH` (3 today — raised from 2 on 2026-10-01,
  Jonathan: "nobody is in Module 3 yet, but students are about to")** —
  students are in here. Step
  labels must match BY INDEX; a new step may only be **appended** to the
  tail of a section. No renames: a rename here would hide an insertion
  from the check. Keyed-MC choices are frozen too (checks.mjs 1ap) —
  but since 2026-10-19 a keyed MC may be ADDED to an existing step
  (nothing to orphan; it prints) and an existing one reworded through
  `response.renamedChoices`, which maps each old saved text to its new
  choice (the renderer applies it; the proof checks the map covers every
  old choice and keeps the keyed one keyed). Re-pin 1ap either way.
- **Modules `FROZEN_THROUGH`+1–`OPEN_THROUGH` (4–6 today)** — **nobody has
  reached Module 4.** A step may be
  **inserted anywhere inside** an existing section, and a step's
  `response` may be removed or changed. Old labels must still appear in
  the same relative order; every added step prints. **Raise
  `FROZEN_THROUGH` as the class advances** — it is the same number
  checks.mjs pins as `FROZEN_MC_THROUGH_MODULE`. **Raise both a module
  AHEAD of the class, when students are about to reach it, not after**:
  the first student through the gate is the moment a structural edit
  starts costing someone their ticks, and nobody tells Claude when that
  happens.
- **Above that** — step count and order are fixed; a rename prints.

In every regime the SECTIONS are fixed: same count, same order, same
kind. A section TITLE may be reworded (it moves no key) and the rename
prints rather than failing — **in frozen modules too since 2026-10-16**
(Jonathan), except a section with a `kind` or the tuning warm-up title,
which code reads and which still fail. Run it as
`node tools/rule-zero-proof.mjs <base-ref>` and paste the output into the
report before any content push.

A fix that these regimes block goes on the **Summer reset list** (the `summer-reset` skill) —
never worked around, never shipped as a rename that "prints rather than
failing."

**"Nobody has reached Module N" was not strictly true before 2026-10-01.**
A locked set opens as a read-only preview (`set-peek`), and until that day
the preview refused skill ticks and Done buttons but still SAVED ANSWERS:
`onResponseChange`, `onStepMcSelect` and `onPracticeMcSelect` had no peek
guard, so a student locked out of Module 3 could tap a keyed quiz choice
there and it was written to their progress under a Module 3 key. It
unlocked nothing (`hasProgressIn()` reads skills and completed steps, both
guarded) but it means a few `responses` keys may already exist in the
module above the class. `isPeekedResponseKey()` closes it and checks.mjs
**1bl** pins the guard on every writer. Practical consequence: treat the
module the class is ABOUT to enter as frozen — which is why the numbers
above were raised a day early.


### Ratchet, activity board, config writer, manifest (old CLAUDE.md lines 214,236)

### ⚠️ Sweep findings ratchet into checks.mjs
Any sweep or audit that finds **3+ instances of a mechanically-detectable error class** must add a permanent detector to `checks.mjs` in the same session — never leave one in a session scratchpad. Hand each parallel agent its check label before it starts (`grep -o "head('1b[a-z0-9]*\." tools/checks.mjs | sort | tail -3`). A check that only finds a call in the source proves nothing: make it render or execute the thing. A phrase detector must match the UNESCAPED string (`unescapeJs()`). Prefer a whitelist over a blacklist when the banned word has an innocent twin. **A ratchet that can't fail is not a ratchet:** break the guarded thing in a scratch copy and watch the check go red, then restore; pin meaningful totals. Worked examples: `WORKFLOW.md` → "Moved from CLAUDE.md (2026-10-28)".

### ⚠️ Activity order and module placement live on the console board
**Not in `class-activities.js`:** order, module headings and the `#N` prefix live in
`config/class.activityBoard`, written only by the console's Class activities board.
`caBoardOrder()` (app.js) is the one resolver and every move goes through
`teacherMoveActivity()`. Live for students = assigned + dated-and-arrived + not
Hidden + not archived/deleted (`caIsVisible`). **Never write `progress/{uid}` from any
of it.** `number` in `class-activities.js` is legacy; a digit in a title is a SERIES
number (checks 1d, 1l). Full rules: skill `in-class-activities`.

### ⚠️ Every write to `config/class` goes through `teacherWriteConfig()`
Strict by default (omit `base`); pass `base` only for a single-cell toggle
(cell-checked). A bare `.set()` on the doc fails check 1ai, which pins the writer
count (`CONFIG_WRITERS`) — add a writer and bump it on purpose. The full rule, why
there are two modes, and the read-side rules: `.claude/rules/teacher-console.md`
(loads with `teacher.js`).

### ⚠️ Editing a module's skills? Update `MODULE_MANIFEST` in `config-main.js`
Add or remove a `skills:` entry and you must bump that module's `skillCount`.
`checks.mjs` fails the push if they drift — fix `config-main.js` when flagged.


### i18n (old CLAUDE.md lines 243,280)

## i18n — hand-written Spanish everywhere

Google Translate is gone. The Español button is `setLang()`; four layers hang off
it: the app shell (`i18n.js` `I18N` keys via `t()` / `data-i18n`), module content
(`_es` twins read through `tf()`), the games arcade + Listening Coach (rendered
through `t()` at render time), and the Song Journey pages (`data-es` attributes
swapped by `journey.js`).

- **Every new student-facing shell string goes into `i18n.js` in BOTH `en` and
  `es`, in the same edit.** Never ship English-only "to translate later" —
  Jonathan doesn't speak Spanish, so nothing catches it afterward.
- **Reuse the glossary** at the top of `i18n.js` rather than inventing a fresh
  Spanish word each time.
- **String names are solfège; chord symbols and key names are not.**
  `cuerda Mi grave`, `cuerda La`, `cuerda Sol` — but `tonalidad de G`, `G/B`,
  `Am`. Most-repeated ES convention on the site, nothing enforces it. A 2026-07-31
  sweep found and fixed the last 2 remaining `module-9.js` violations (a much
  older ~30-instance count had already been mostly cleaned up before then) —
  still worth a check whenever you touch module Spanish, since nothing enforces
  it.
- **How to wire a string** — mechanics are documented at the top of `i18n.js`;
  read that before adding one. Short version: static HTML gets
  `data-i18n="key"` (or `-attr` / `-html`); dynamic strings call
  `t('key', {param})` and carry `data-i18n-params`, because most shell HTML is
  built once and would otherwise stay stuck in its first language.
- **Authoritative Spanish is the code** — `i18n.js`, the `_es` twins, and the
  `data-es` attributes on the six `tabs/*.html` pages. No review sheet is
  maintained; don't recreate one.
- **Review policy:** routine proofread sweeps are **retired**. The 2026-07-23
  full-site sweep found essentially no meaning errors across ~4,300 strings.
  Write new Spanish carefully against the glossary and ship it. Sweep only when
  Jonathan asks or a specific string is flagged.
- `i18n.js` must load **before** `app.js`, `fab-tools.js`, `tuner.js`, and
  (synchronously, on Journey pages) `journey.js`.

Standing glossary, loanword policy and settled ES terms: `claude/spanish-terminology.md`
in the Claude project.


### Content rules (old CLAUDE.md lines 281,364)

## Content rules

**Student-facing text uses the simplest direct wording that is still
accurate** — short sentences, plain verbs, one idea per sentence, no idioms
or figures of speech, and every music term defined the first time it
appears. checks.mjs 1w catches a relapse of specific retired phrases; it
can't catch a new idiom on its own, so this rule is the standing instruction
new content has to be written against. Not every figurative-sounding phrase
is a violation — an established, deliberately-defined site term (Module
5/7/11's "two homes" for a chord's two fretboard positions; the metronome
ladder's "top of the ladder") is a real teaching device, not confusing
prose; don't flag or "fix" those. Define "root" once, in the first visible
Module 2 step that uses it: the note a chord is named after.

**No teacher speak.** No lesson-plan words (self-assessment, reflect,
benchmark, objective, demonstrate/apply/identify), no poster lines ("slow and
clean is better than…", "don't worry", "trust the…"), no reassurance or
praise padding in feedback, and no sentence about why a step matters. Say the
action and the standard. The word "assessment" names the test and appears as
"(assessment preparation)" in Challenge titles. checks.mjs 1w-t guards the
retired phrases (2026-09-23 jargon-cut work order, 433 findings across the
site).

**A typed answer is for when writing IS the task.** Goal-setting,
composing, and describing what you heard in a listening step keep their
box; everything else asks the student to play something and tells them
exactly when they have got it — a countable line ("two laps up and back
with every note ringing clean"), not a feeling ("feels intentional").
Modules 3–6 went from 82 typed answers to 8 on 2026-09-20; checks.mjs
**1ar** pins the per-module budget and only fails UPWARD, so removing one
more is always fine and adding one back is a decision you make in the
same edit. Note that **41 of those 82 were already unreachable** — sitting
in reflection / routine / ear-spark sections and in take-to-song sections
that render a Journey card — so a raw count of `response:{type:'short'}`
overstates the typing by about double. Count what `visibleSteps()` would
render.

**Multi-step directions get lists, not paragraphs.** `<ol>` for sequential steps,
`<ul>` for parallel points, short lead-in before the list. Applies to step
`text:` and practice `prompt`s. Mirror the structure in the `_es` twin. Roughly:
a card over ~200 characters with more than one thing the student *does* is a
list. Leave alone: single actions, hints, `gotItWhen` strings, placeholders.

**A trailing "You've got it when: …" stays plain text AFTER `</ol>`** — never a
final `<li>`. The renderer wraps it in `<span class="got-it">`; **do not put the
span in module data.** Same for other trailing matter: "No score —" notes,
partner bonuses, Journey links, and `<span class="step-figure">` images (always
dead last).

**Challenge cards** (any step that opened `Challenge N — Title:`): the full title
lives in `label`, verbatim, escaped plain text, under ~70 chars; the `text` opens
straight into directions; **the body is always a list** — the one place the
"single actions stay prose" carve-out does not apply. A defining parenthetical
(*a fill is…*) moves into the text; an identifying one (*(assessment
preparation)*, 2026-09-23 — was *(your assessment piece)*) stays in the title.
**A card that already had a list keeps it byte-for-byte.**

**Presentation belongs at render time, not in content.** MC answer order and
got-it-when styling are both render-time, so new cards inherit them and neither
can regress. Reach for the renderer first whenever a change is about how
something looks or is ordered rather than what it says.

**Strings are named, never numbered, in student-facing text** (Jonathan,
2026-08-06): low E · A · D · G · B · high e; ES uses solfège (cuerda Mi grave …
cuerda mi aguda). Chord-chart shorthand like `xx4432` is notation and stays.
The only surviving digits are Module 7's two root-naming MCs, each anchored
"string 6 (the low E)". Enforced by checks.mjs (1j) — new numbered-string prose
fails the push.

**Paper drills get a digital deck.** Nothing student-facing should ask for
scissors, index cards or a pen. Three `step.drill` types share one dispatcher:
`shuffle` (frets on one string, timed), `deck` (any card pile, optional back),
`ear` (hidden note sequence, played aloud) — plus `notecall` (2026-09-27, ca-23),
which isn't a paper drill: a note name on the beat, played on the guitar. It opens
in "Show answer" (a play-along: the fret lights up 2 beats after the name, speeds up
every 8 notes, Slower backs it off and Faster steps it up, nothing scored); turned off, it runs five scored
levels answered by the mic (the "Play it on the guitar" button, off by default) or by tapping the fret
(`drill: { type:'notecall',
strings:['lowE','A'], minFret:5, maxFret:8 }`; engine `renderNoteCall` in
`app.js`, progress in `games.nc`, and `gamesStopMic()` stops it). Wiring one is content, not code:
`drill: { type:'deck', deck:'numerals-C', skill:'m11w1-s3' }`. Decks live in
`DECKS` in `app.js`; ear pools in `EAR_POOLS`. Drop the "Got someone around?"
partner line from any card that gets a deck; no paper-fallback line.


### Quiz answers and keyed MCs (old CLAUDE.md lines 373,412)

### ⚠️ Quiz answers and keyed MCs
A **keyed MC** is an on-site multiple-choice with an answer key — a
`response:{type:'mc'}` on a lesson step. Nothing on the site is graded; the
graded quizzes are the Canvas ones. (Called "graded MC" before 2026-10-26;
older notes and code comments may still say that.)
**Quiz answers are shuffled at render time** by `mcOrder(choices, seed)` —
deterministic, catch-alls pinned via `MC_PINNED`, fewer than 3 choices left
alone. The two MC paths store differently: the keyed step persists the choice
**text**, the practice panel persists the **index**. Don't "simplify" that
away. Write `answer: 0` freely — students never see it that way.

- **The seed is the prompt PLUS the joined choices** (`mcSeed`), so order is
  stable across re-renders, languages and students, but **rewording any choice
  re-rolls the display order**. Never name an option by its position in an
  `explain` ("the last option") — name it by content. m11w2-s3 was right only
  by luck after a 2026-09-05 reword.
- **Rewording a KEYED MC's choices after students reach it orphans their
  stored picks** — the keyed path persists the choice text, so an old string
  renders as "answered, nothing selected". Reword before they get there, or
  map old→new in the renderer. The 2026-09-05 m8w1 reword was safe only
  because the live roster's furthest student was in Module 1.

**That rule is now a ratchet — `FROZEN_MC_THROUGH_MODULE` in checks.mjs**
(2026-09-19). Every keyed MC in Modules 1..N is pinned by a fingerprint of
its `choices` + `choices_es` + `answer`, and **1ap** fails the push when one
of them changes by a single character — including a keyed MC that goes
missing. N is *the furthest module a student has reached or is about to*; it
is **3** today (Jonathan, 2026-10-01; 2 from 2026-09-19). **Raise it as the class advances** — ask which module
they're in, bump the constant, re-run and paste the printed fingerprints back
in, same commit. Lowering it is almost never right: a module the class has
passed keeps its stored answers forever. The practice-panel MC on a skill is
deliberately NOT pinned — it stores the index, so its wording is free and its
ORDER is the thing to hold.

Modules 3–6 giveaway rewording history (2026-09-19) and the full write-ups of the MC-giveaway ratchets **1at / 1au / 1av** and the 1w field-reader fix: `WORKFLOW.md` → "Moved from CLAUDE.md (2026-10-28)". Short version: the detectors live in `tools/checks.mjs` (each documented by its comment), **check a video's watch range before writing a question about it**, and a new authoring field needs adding to `STUDENT_VALUE_NAME_RE`.

The three Module 1 Set 2 keyed-MC rewords, Module 3 Set 2's Challenge
numbers, and `ca-14`'s Happy Birthday exit check are all frozen mid-year fixes —
see the **Summer reset list** (the `summer-reset` skill).


### Play-along first, firestore.rules, Daily 5 (old CLAUDE.md lines 413,432)

## Play-along first; Song Journey pages are the back door (2026-10-06)
**One rule for every link to a song: if students can open a play-along (whole-song)
card for it, the link opens that card; if not, it opens the Song Journey page**
(`songsPlayAlongCard()` decides — no list to maintain — and it decides at the click:
don't fold "Play Along now" into `caIsVisible()`). "Take It to a Song" is **switched
off, not deleted** (`TAKE_TO_SONG_ENABLED = false`): never delete those
`kind:'take-to-song'` sections, they hold `gi`. Journey pages: no per-song retire
list or "moved" card (check 1bn), no Stuck?/Level up folds, and don't sync a page's
text to a card. The door table, layer matching and the rest: skill
`in-class-activities` and `.claude/rules/journey-pages.md` (loads with `tabs/**`).

### ⚠️ Editing `firestore.rules` changes nothing until it's pasted into Firebase
GitHub Pages doesn't deploy Firestore rules. After any push that touches
`firestore.rules`, open Firebase console → Firestore Database → Rules, paste
the file, Publish. Until that happens the live quiz's answer writes are
rejected and the game looks broken with no error students can see.

### ⚠️ The Daily 5 is retired — switched off, not deleted
`const DAILY5_ENABLED = false;` in `app.js` (read only by `ladderHtml()`) is the whole switch (Jonathan, 2026-09-19). Nothing was deleted — `buildDaily5()`, the `.daily5-*` CSS and the `daily5.*` i18n keys stay; `kind:'tuning-warmup'` sections stay hidden because `storageSections()` and every saved `gi` depend on it. History: `WORKFLOW.md` → "Moved from CLAUDE.md (2026-10-28)".


### How to work with Jonathan (triggers, Fast or Reviewed, effort) (old CLAUDE.md lines 459,556)

## How to work with Jonathan

**Use AskUserQuestion, not free-text questions** — he'd rather click than type.
2–4 mutually exclusive options, one question per turn unless truly independent.

**Don't ask "should I proceed?" — just proceed.** Do the work and report back.
Never pause for "want me to do this?", "ready for the next step?", "shall I
implement it?".

- **Just do it:** the obvious next step, multi-step work, refactors, fixes,
  edits, local tests, anything reversible. **All code and HTML edits** — git
  tracks everything. Treat "can you…", "how do I…", "should this be…" about code
  as *do it*, not *ask first*.
- **Still pause for:** a genuine fork where the choice changes the outcome (use
  AskUserQuestion), irreversible / outward-facing actions — deleting files,
  touching the live site. A review trigger no longer asks — see "Fast by
  default" under Triggers.
- **Pushing to `main` is NOT one of those** (Jonathan, 2026-08-28). When the
  checks pass and a fast-forward onto `main` is what you'd recommend anyway,
  just push it — don't ask first, and never offer "push the branch instead" as
  a coin flip. Push, say what landed, then confirm with `checks.mjs --live`.
  Still ask when main is *not* what you'd recommend: a merge rather than a
  fast-forward, another session's commits in the way, checks failing, or work
  you don't think is ready for students.
- When in doubt: pick the sensible default, proceed, say what you did and why.

**Sub-agent sweeps need an adversarial audit budgeted in — and it audits the
FIXES, not just the findings.** On any content sweep over ~50 items, run a
second agent told to *find problems, not confirm the work* — the structural pass
and the audit catch disjoint failure classes. Lead every sweep prompt with the
calibration line ("convert EVERY card; do NOT skip one because the actions flow
naturally — re-stitch it"), or agents go timid. Sonnet for mechanical work, the
big model for design and verification. Every review round of the 2026-10-25
sweep found real regressions that the fixers' own proofs missed. Playbook and
the auditor / fixer / reviewer brief templates: skill `site-sweep`.

**Triggers, so this doesn't depend on how hard you are thinking** (they hold at
any effort level): a change hits a **review trigger** — an adversarial
reviewer on a pinned commit, subject to "Fast by default" below — whenever it
touches 3+ files, a danger-zone file (`teacher.js` config plumbing,
`sw.js`, `coach.js` detection, the `app.js` save path, `firestore.rules`),
or 50+ strings. **Mechanical files don't count toward the 3**
(Jonathan, 2026-10-26): `CHANGELOG.md`, the `sw.js` version lines that
`checks.mjs` rewrites (that rewrite doesn't make `sw.js` a danger-zone edit —
a change to its code does), and the Spanish twin (`_es` field or `i18n.js`
key) of a string changed in the same edit.

**A pin-only `checks.mjs` edit is mechanical too** (Jonathan, 2026-10-27,
after a play-along edit sat behind a 30-minute deep review). An edit that
only updates pinned values a content change forces — a count, a fingerprint,
an expected list, a `FROZEN_*` number — doesn't make the change danger-zone
and doesn't count toward the 3. The checks themselves are the gate for it.
A guard that pins a new default or extends what an existing check reads (a
new field, a new colour, a new click in `tools/smoke.mjs`) needs only the
break-it proof — break the guarded thing in a scratch copy, watch the check go
red, restore — with the output pasted into the report; it doesn't count toward
the 3 either. A new KIND of check (a detector for a new error class, or a
change to an existing check's logic or matching) is a review trigger, for
`site-reviewer` (high), plus the break-it proof. None of this makes
`checks.mjs` a deep-review file. **Which reviewer** (2026-10-26):
`site-reviewer-deep` (extra high) for a danger-zone file or a 50+-string
sweep, `site-reviewer` (high) for everything else. For a danger-zone file
write the failing scenario before the fix. When a rule says "run the tool", run it — don't
substitute your own reading of the code. When an agent hands you a claim, read
the quoted lines yourself before acting; when it hands you a fix, make it
re-derive it on the real code.

**Fast by default; a Friday check reviews it** (2026-10-31; replaces the
2026-10-27 "Fast or Reviewed" question, which replaced the 2026-10-26 "quick
change" keyword). When a change hits a review trigger, finish the build and
every "Start here" step — checks, rule-zero proof, smoke test, the item-4
screenshot checklist — then:
- **Always Reviewed, same day, never Fast:** a danger-zone file, a new kind of
  check, a sub-agent sweep, or moving / adding / removing a section or step.
  Run the reviewer named above. These are the changes that can lose student
  progress or break the live site, where a week's wait means the damage is
  already done.
- **Everything else ships Fast — don't ask.** No reviewer. Every Fast commit
  ends with the trailer line `Review: Fast` (above any Co-Authored-By), and
  the report starts "Fast — reviewer skipped; Friday check will review it."
- Jonathan says "review this" / "Reviewed" in the request → review same day.
- **No trigger → no trailer.** Ship as usual.
- **Friday check:** a scheduled cloud task, Fridays 11:00 PM Pacific, runs
  skill `friday-check` — `site-reviewer` on every `Review: Fast` commit since
  the last `friday-check-*` tag, fixes pushed to `main`, always-Reviewed fixes
  on a branch, content calls to Open work, then a new dated tag.

**Effort per task.** Agents in `.claude/agents/` pin their own effort (auditor, fixer, `site-reviewer` high; `site-reviewer-deep` extra high). For a general-purpose agent pass `effort: "xhigh"` for a review the Triggers send to `site-reviewer-deep`, `"high"` for any other review, auditor or fixer; never `max`. Your own session: `medium` routine edits, `high` bug fixes / shipped JS / keyed-MC content, `xhigh` danger-zone files and sweeps — if the task is a tier higher than the session, say so and ask for `/effort`. Full text: `WORKFLOW.md`.

**Report the real numbers instead of accepting the premise**, and name the prior
decision a request would reverse — both have produced better calls than fixing
the literal complaint would have.




## Power Chord Switch: where we stopped (moved here from NEXT-STEPS-power-chord-switch.md, 2026-11-05)

Jonathan moved this file into WORKFLOW.md and deleted it. The room-noise decision was made on 2026-11-05
(a stricter strum ratio for Power Chord Switch only, see "Decision (2026-11-05)" below). The practice-minutes heartbeat removal is
finished: his console paste and the emulator run (49 passed, 0 failed) are both DONE; only the
the old `heartbeats` and `minutesBoard` collections were deleted in the console on 2026-11-05; only the console's
`heartbeats` composite index is left (optional, see "Practice-minutes heartbeat removal" below).
Settled and not to be re-raised: the 30 s cap, the real-guitar mic check, the three wordings,
no Note Runner mic check. The original title read "Power Chord Switch — where we stopped (2026-11-03)".

> **STATUS (2026-11-04): shipped.** The branch `pcs-pending-smoke` was merged into
> `main` on 2026-11-03 (merge commit ca932f2): smoke on the merged tree was clean
> against the origin/main baseline, the full checks passed, and Jonathan
> published `firestore.rules` (take id `(coach|nr|pw)`). The same day a second
> change landed (e5e0bef): a Stopped game with at least 10 s of audio is saved
> too, with `complete:false` in the take (a shorter Stop, or leaving the screen,
> still drops it). Nothing is open except watching the next takes (Next steps, item 3).
> The branch `pcs-pending-smoke` can be deleted on GitHub.

Read this when Jonathan asks "what are the next steps for the Power Chord
Switch activity". It is the hand-off from the session that built the changes
below. Delete or rewrite it when the list is done.

### What shipped in this push

1. **Song switches replace the whole-song buttons** (`coach.js`
   `CC_POWER_PROGRESSIONS`, group `song`). One activity per distinct switch in
   the song's card: Sweet Child O' Mine 10 (ca-33), "the cure" 6 (ca-30).
   Each is a **ladder**: 3 rounds of 4 back-and-forths (8 chords), 15 BPM faster
   each round (60 / 75 / 90 from the base tempo; since 2026-11-05 5 BPM faster, 30 / 35 / 40 from the new 30 BPM
   start, Jonathan: "don't increase it so quickly"), a 4-click count-in before each
   round. Jonathan's words: "practice the actual chord switches in the songs by
   going back and forth between each change 4 times at slower to faster tempos."
2. **BPM buttons on the play screen** (−5 / +5, under the beat dots): they move
   the rounds still to come, not the round being played; off in round 3.
3. **Choices layout:** the pairs view keeps five columns (the fifth, Songs, has
   one button per song). A song button opens the **songs view** (all that
   song's switches, a "Chord pairs" back button). All 16 next to the pairs was
   881px tall on a 657px screen.
4. **Saved student audio** (`micRecStart('pw')`): same consent flow as the
   Listening Coach and Note Runner (one question per device, the red "Recording
   this take" label on every screen of a take, saved when a game is played to
   the end, and also when it is Stopped after at least 10 s of audio
   (`MICREC_MIN_STOPPED_SEC`, 2026-11-04; the take says `complete: false`;
   a shorter Stop is dropped so a stub never overwrites a full take; leaving
   the screen still drops it); never for Change Up). One capture covers all three rounds and is
   cut at the existing 30-second cap. Jonathan said **no on/off button**: none
   was added. The label still carries the existing small "Stop saving my takes"
   link (the consent opt-out the other two games have). Remove it from the
   Power Chord Switch screens only if Jonathan says so.
5. **Clearer feedback, on the done screen and while playing.** Done screen:
   every chip has a symbol (✓ right, ✗ on time but the chord sounded wrong, –
   no strum heard) and a line counts them. Play screen: a big line under the
   beat dots after every graded change ("✓ C5 — right" green, "✗ C5 — wrong
   chord" amber, "– C5 — no strum heard" red; `ccShowLast`, `.cc-last`; the row
   is always drawn so nothing jumps). Jonathan: "I didn't see the power chord
   switch giving clear feedback about misses and correct notes" and "make the
   in game feedback bigger".

Checks: `tools/checks.mjs` section **1ck** was rewritten (every switch against
its card, the three rounds run, the BPM buttons, recorded takes, the feedback
line); `tools/smoke.mjs` walks all 16 switches in a real browser.

### Done in the Firebase console

- `firestore.rules` with the `-pw` take id was published by Jonathan (per the
  merge commit message, 2026-11-03). Still worth one look: teacher console →
  Mic recordings should list a Power Chord Switch take once a student who said
  yes has played a game to the end (or stopped one after 10 s). Mic collection
  has to be switched on there for any take to be asked for or saved.

### Next steps (rewritten 2026-11-05; the list Jonathan chose on 2026-11-04 is done)

(The separate step-by-step plan file for a fresh chat was deleted on 2026-11-04 at
Jonathan's request; this list is the plan.)

1. **Saved takes arrive: DONE.** On 2026-11-04 "Evaluate all recordings" in the teacher
   console read 25 saved takes, 12 of them Power Chord Switch (results below, "First
   real-take results"). If a class ever shows none: the rules paste first (`micTakes` and
   `chunks` must say `(coach|nr|pw)`), then mic collection on in the console, then the
   student's consent answer (asked once per device).
2. **The evaluator for Power Chord Switch takes: DONE.** `micEvalTakePw` (teacher.js,
   check 1cl) was built 2026-11-04, proven on synthetic takes (`tools/mic-sim/fake-pw-take.mjs`)
   and then run on those 12 real takes. For each saved take it compares what the site graded
   (`expected`, `events`) with what is in the audio, per round: strums the game missed,
   "right" changes with no strum, and the mic delay from the three count-ins (about -73 ms on
   Chromebook internal mics).
3. **DECIDED 2026-11-05: room noise scores a right chord.** Jonathan chose the stricter strum ratio for Power
   Chord Switch only (2.2 / 2.67; "Decision (2026-11-05)" below). Not chosen: "no readable pitch, no tick" (the
   console's "Pitch-rule what-if" table prices it from takes saved after 2026-11-05, if it is ever wanted). To do:
   look at the next takes (see "Where things stand" → to watch). Any further change to how a strum is heard is a
   `coach.js` detection change: xhigh, Always Reviewed, run `tools/mic-sim/power-switch.mjs` first.
4. **Nothing else is waiting.** Settled and not to be raised again: see "Later (not chosen
   yet)" below (the 30 s cap, the real mic check, the three wordings, no Note Runner check).

### Practice-minutes heartbeat removal (not Power Chord Switch): DONE 2026-11-05

Jonathan asked for this note here so it is not lost; it is finished. The full history is the "PICK UP HERE"
entry under "Practice minutes" (Open work). In short: "N playing" is gone from the screen and the engine no
longer writes a `heartbeats/{sessionId}` record.

- **Code (live since 2026-11-04):** the writer, `pollLive()`, `S.live` / `S.liveAt` and `liveMinCount` are gone from
  `practice-minutes.js`; counting, `flush()`, the queue and the keepalive did not change (`5144c6c` and its review fixes).
- **Repo (2026-11-05):** the `heartbeats` rules block, its index in `firestore.indexes.json` and its section in
  `tools/pm-rules-test.mjs` are gone; check 1cg requires them to stay gone, exactly one `match /databases/{database}/documents`
  wrapper, and no shipped page or script naming a `heartbeats` collection. Reviewed the same day (`site-reviewer-deep`).
- **Console (2026-11-05):** Jonathan published the new rules; the emulator test passed against them (the two "heartbeats is
  gone" cases; the whole file is 179 cases now); the old `heartbeats` collection and the old `minutesBoard` collection were
  deleted (the console's "Delete collection", typing the name to confirm).
- **Still there, optional:** the console's `heartbeats` composite index (Firestore, Indexes tab: the only index, fields
  `period`, `lastSeen`, `__name__`, Enabled). Nothing queries it. A session tried to delete it on 2026-11-05 and the click was
  blocked as an irreversible deletion nobody had named, so it is Jonathan's to delete by hand (⋮ on its row, Delete) or to leave.

### Open finding (Jonathan, 2026-11-04): room noise scores a right chord

**Status 2026-11-05: DECIDED** (a stricter strum ratio for Power Chord Switch only; see "Decision (2026-11-05)" below). The text under this heading is the history.

Jonathan played with no guitar and the game showed "right". Cause, read in the code
(`ccLoop`, `ccResolvePend`, `coach.js`): any loudness jump above a very low floor
(`CHK_ONSET_FLOOR` 0.003, HF 0.0008) is a "strum"; at the default every-beat 60 BPM each
change's window is +-500 ms, so a noise anywhere lands in one; with fewer than 3 pitch
readings the change "counts on timing alone" and is graded `ok`. A real low-E strum also
gives under 3 readings, which is why it is lenient on purpose. The game's own count-in
beeps are not the cause (grading starts after them). **Jonathan chose to MEASURE before
changing anything:** the false-hit number in the console's Evaluate-all (a change the site
graded right where the audio has no strum) on real student takes. Then choose between
"no readable pitch, no tick" (real low-E strums turn red) and a higher onset floor (soft
strums missed). Both touch `coach.js` detection: Always Reviewed, run
`tools/mic-sim/power-switch.mjs` first. Collection needs a real non-teacher account (the
teacher and the dev bypass never record), and the "stop after" number raised above the
count (23 of 40 on 2026-11-04; Coach and Note Runner takes count too).

#### First real-take results (2026-11-04, "Evaluate all recordings": 25 takes, 12 of them Power Chord Switch)

- **9 PCS takes: the site and the audio agree.** 14 false hits out of 141 changes. The
  site-vs-recording offset is steady at about -73 ms on Chromebook internal mics.
- **3 PCS takes hold 38 of the 52 false hits.** The site heard a strum at almost every
  change, but the recording has only 5-8 strum attacks in 21-30 s. This is the room-noise
  finding above, measured: it is a few rooms (or mics), not every take.
- **The strum what-if on those 12 takes (read from Jonathan's `mic-eval-2026-11-05.json`, 2026-11-05;
  186 changes judged, 52 false hits, 132 real strums).** At the site's own ratios (1.4 / 1.7) the replay
  gives the site's yes/no on 183 of 186 changes, so it can be trusted. Stricter ratios, false hits removed /
  real strums lost: **1.8 / 2.19: 14 / 1; 2.2 / 2.67: 30 / 4; 2.6 / 3.16: 38 / 9.** The 3 noisy takes (T01,
  T10, T12) hold 38 of the 52 false hits; at 2.2 they lose 26 false hits and **0** real strums, at 2.6 they
  lose 30 and 1. The real strums lost are in the other takes: at 2.2 in T06 (1), T08 (1) and T11 (2); at 2.6
  also in T03, T04 and T09. So a stricter ratio mostly helps the noisy rooms and costs the soft strummers
  in the clean ones. "Lost" means the replay no longer hears the strum, so the game would grade that change a
  miss. 12 takes, 3 of them noisy: a small sample. Not decided (Jonathan's call). The zip of all 25 takes is
  in Jonathan's Downloads (`mic-recordings-2026-11-05.zip`, 12 of them Power Chord Switch, none with pitch readings).
- **A higher absolute onset floor is ruled out:** 48 of 52 false hits AND 55 of 132 real
  strums are under 15 dB above the room floor, so any floor that removes the noise removes
  the soft real strums too.
- **"No readable pitch, no tick" reaches only part of it.** It can touch only the 34 false
  hits graded right. The other 18 were graded wrong, which already needs 3+ readings. What
  it costs real low-E strums could not be measured from these 12 takes (they carry no pitch
  readings). Takes saved from 2026-11-05 on do: see "Pitch readings in the saved take" below.
- **Lead (tested by the what-if below):** the site's rule (`ccLoop`: full-band
  `rms > CHK_ONSET_FLOOR && rms > smoothRms * CHK_ONSET_RATIO` 1.4, or the HF channel
  `* CHK_HF_RATIO` 1.7) fires on a ~3 dB jump. The evaluator's onset finder
  (`micEvalSignal`: HF jump > 2.2x its base and > 4x the take's HF floor) found the real
  strums in the 9 good takes and almost none in the 3 bad ones. Two different channels:
  room rumble, voices and thumps jump the full-band level but not the pick-attack channel.
- **Coach / Note Runner takes had a second problem** (fixed in the same push): 42 of 64
  Note Runner notes sat past the 30 s cap, and `micEvalTake` measured them as silence
  (median level -141.6 dB). A note whose window runs past the end of the audio is now
  `dropped`, not judged (`notes.dropped`; the console says how many), the same rule as
  for a Power Chord Switch change.

#### The strum what-if (built 2026-11-04; MEASUREMENT ONLY, how the game grades is unchanged)

Where: `teacher.js` `micEvalTakePw` -> `whatIf`; the small table under the Evaluate-all
results ("Strum what-if"); `strumWhatIf` in "Download results" (take labels only, no
names, no uids); the same table in the terminal from
`node tools/mic-sim/eval-takes.mjs <folder>`.

What it does: replays the site's own strum rule over each Power Chord Switch recording,
at the shared ratios older takes were graded with (full-band 1.4, HF 1.7) and at stricter
ones (full-band 1.8 / 2.2 / 2.6, the HF ratio scaled the same: 2.19 / 2.67 / 3.16). A take graded with Power Chord
Switch's own ratios (2.2 / 2.67, from 2026-11-05) is left out of it: see "Decision (2026-11-05)" below. Nothing is copied by hand:
the `CHK_*`, `COACH_ONSET_REFRACT`, `COACH_LVL_WIN/HOP`, `COACH_CATCHUP_MAX_MS` numbers
and the TEXT of `ccLoop`, `coachReadFrame` and `coachSmooth` are read from `coach.js` at
run time (`ccLoop`'s own condition is compiled and run with the candidate ratio passed in;
`coachSmooth` is run as it is; the easing base, its step and the arrival fraction are read
out of `coachReadFrame`). If `coach.js` no longer has that shape the what-if is `null` and
check 1cl turns red. Each replayed strum is put back on the site's clock and matched to the
changes the way `ccLoop` does (window, gridOffset). Per candidate and take:

- **false hits removed**: a change the site graded right or wrong where the audio has no
  strum (`false-hit`) that no longer has a strum at that ratio;
- **real strums lost**: a change where the site and the audio agree (`agree`) that no
  longer has a strum at that ratio;
- **reproduced**: changes where the replay at that ratio gives the same yes / no as the
  site did. The first column (the shared ratios older takes were graded with) is the replay's error bar: if it
  reproduces few of the site's verdicts, trust the other columns less.

How to read it: pick the ratio where "removed" is large and "lost" small. The cost of a
stricter ratio is soft real strums, and a student whose strums were graded right on timing
alone would turn red. Choosing and changing the ratios is `coach.js` detection:
**xhigh, Always Reviewed**, run `tools/mic-sim/power-switch.mjs` first; this task did not
touch `coach.js`.

What the replay assumes (and cannot know): the student's real frame times (it uses a
steady frame every `frameMeanMs` of the take, clamped to 16.7-150 ms) and the analyser's
48 kHz samples (the take is 24 kHz: the window length is scaled, the absolute HF floor is
not). The smoothing runs through the whole take, where the site resets it each round and
warms it during the count-in. A take with no `srcSampleRate` is read as 48000.

Proof: `tools/mic-sim/fake-pw-take.mjs` has two takes whose truth is MEASURED on the
audio: `pw-room-noise` (no strums at all; low-frequency bursts 1.6 / 2.0 / 2.38 / 3.0 x
the room, each graded by the site: 11 false hits; the stricter ratios must remove
3 / 5 / 8) and `pw-soft-strums` (15 real soft strums over a loud room, found by the
evaluator on the attack channel: the stricter ratios must lose 0 / 5 / 10). Check 1cl
compares every candidate count with that truth, re-sums the summary, parses the table
and the terminal text, and was broken 14 ways in a scratch copy (see the commit message).

What it does NOT answer: the what-if says what the site's rule would hear, not whether
the strum was the right chord, and not what "no readable pitch, no tick" would do to
real low-E strums. The second is answered from new takes by the pitch-rule table (next section).

#### Pitch readings in the saved take (added 2026-11-05)

Each entry of a Power Chord Switch take's `expected` list now has a `readings` field, and the
take's top-level `changeReadings` says what it means (`coach.js` `ccResolvePend` keeps the
readings, `ccRecMeta` saves them, rounded to 2 places, midi numbers):

- `null`: no strum was heard in that change's window (graded `miss`);
- `[]`: a strum was heard but no pitch could be read (graded `ok` on timing alone, as always
  with fewer than 3 readings);
- `[45.12, 45.02, ...]`: the readings the chord check used. 3 or more are needed for a chord
  verdict (`ok` or `off`); fewer pass on timing alone.

So "no readable pitch, no tick" can be priced from a take: count the changes with fewer than 3
readings that the site graded `ok`, split by the evaluator's own label (`agree` = a real strum
that would be lost, `false-hit` = noise that would be removed). **Built 2026-11-05: the
"Pitch-rule what-if" table** under the strum what-if (Evaluate all recordings), the same table in
the terminal (`node tools/mic-sim/eval-takes.mjs`), and `pitchRule` in both downloads
(`micEvalTakePw` `pitch`, `micEvalPitchSummary` / `micEvalPitchText` / `teacherMicPitchHtml` in
teacher.js). Per take and in total: *graded right*; of those *3+ readings* (the rule keeps the
tick) and *timing alone* (under 3: the rule would remove the tick); *false hits* and *real strums*
(the same counts as the strum what-if, so the two tables compare); and the last column
"−N · lost M": N false hits that lose their tick, M real strums that lose theirs. A wrong verdict
already needs 3+ readings, so the rule never touches those. Takes saved before 2026-11-05 have no
`readings` key: they are left out of the table and counted ("N takes have no readings"), never
read as `null` or as zero readings. No rules change was needed (`micTakes` has no field list). Grading is untouched: the old and new `ccResolvePend` gave the same verdict on 20,000 of
20,000 random changes. Check 1ck runs the real `ccResolvePend` and `ccRecMeta` and reads the
saved take back (21 of 21 changes; six deliberate breaks each turned it red). Check 1cl proves
the table: 5 synthetic takes plant known reading counts (`readings: true` in `fake-pw-take.mjs`,
the truth worked out there from the planted counts, not from teacher.js) and the 13 others have
none; 64 graded right, 39 on timing alone, and the console table, the terminal text, the download
and `eval-takes.mjs` all say the same numbers (ten deliberate breaks each turned it red). The
numbers in those synthetic takes are planted, so they say nothing about real students.

#### Decision (2026-11-05): Power Chord Switch strums need ratio 2.2 / 2.67

Jonathan's pick, after the console's strum what-if on the 12 real takes (186 changes, 52 false hits, 132 real
strums; replay matches the site on 183 of 186 at the old ratios): 1.8 / 2.19 removes 14 false hits for 1 real strum
lost; **2.2 / 2.67 removes 30 for 4**; 2.6 / 3.16 removes 38 for 9 (the knee is 2.2: 1.8 → 2.2 buys 5 false hits per
real strum lost, 2.2 → 2.6 only 1.6). Of the 30, one is a false hit the replay already drops at the shipped 1.4
(replay error), so 29 net; 22 of the 52 still fire at 2.2 (T12 keeps 6 of its 12, T01 3 of 13). The 3 noisy takes lose 26 false hits and no real strum at 2.2; the 4 lost real
strums are soft strums in clean takes (T06, T08, T11). The old line in `coach.js` ("marking a correct change wrong is
the worse error in a room") is why the choice was Jonathan's: this trades a few soft strums for honest feedback in
noisy rooms.

- **Jonathan chose 2.2 with the risk in front of him (2026-11-05).** The reviewer found that the 12 real takes do not
  cover thumb or finger strummers, fast every-beat pairs or slow-frame Chromebooks; offered 1.8 / 2.19 (milder: 14 of
  52 false hits for 1 lost, keeps about 3 times as many soft strums in the probe) or holding until a thumb take had
  been recorded, he said to push 2.2. **First thing to do after it is live:** strum a take with a thumb or a finger on
  a test student account (60 and 120 BPM, every beat), run "Evaluate all recordings" and read "Played, not counted"
  (`detector-missed`); the new takes are graded at 2.2, so that column is the real loss. If it is bad, roll back.
- **The game (`coach.js`):** `CC_POWER_ONSET_RATIO = 2.2` and `CC_POWER_HF_RATIO = 2.67` (1.7 x 2.2 / 1.4, the
  what-if's own scaling) sit beside the shared `CHK_ONSET_RATIO` / `CHK_HF_RATIO`. `ccLoop` picks them with
  `ccIsPower()`: Power Chord Switch uses its own, Change Up (same loop) keeps the shared ones. Listening Coach, Note
  Runner, Note Call and the other loops read `CHK_*` and are untouched. The condition must stay on those four lines and
  free of comments: the console reads it as text (below).
- **What a take records:** `fields.onsetRatio` / `fields.hfRatio` (`ccRecMeta`). A take saved before 2026-11-05
  has neither and was graded with the shared ratios.
- **The console (`teacher.js`):** `micEvalStrumRule` compiles ccLoop's own condition with the names `onsetRatio` /
  `hfRatio` (and the `CHK_*` names, for an older text). The strum what-if replays STRICTER ratios than the take was
  graded with, starting from the shared ones, so a take graded at 2.2 / 2.67 is left out of it (`row.whatIfSkipped`,
  `row.strumRatio`) and the table says how many it left out; the rest of the evaluation (categories, rounds, the
  Pitch-rule table) is unchanged. Ratios outside 1..10 or half missing are never trusted. **Not built:** a strum
  what-if for takes graded at 2.2 (candidates above 2.2, e.g. 2.6 / 3.16, replayed from the new base); add it if the
  next takes make it worth deciding on a stricter ratio.
- **What to expect, and the limit of the proof:** a firm pick strum in a quiet room grades exactly as before
  (`tools/mic-sim/power-switch.mjs`, which now uses the Power Chord Switch ratios for its Power Chord Switch gate and
  the shared ones for Change Up, prints identical output on the old and new `coach.js`; with the ratios forced to 60
  only the Power Chord Switch gate collapses). BUT that simulator's strum carries a pick-scrape burst about 3x the note
  level, so it cannot show the cost for soft strums. A separate probe, `tools/mic-sim/onset-probe.mjs` (the real
  `coachReadFrame` / `coachSmooth`, a strum landing over the previous chord still ringing, 12 trials per setting,
  synthetic strums, so RELATIVE numbers) shows what the ratios do to a strum WITHOUT a sharp pick attack: at 60 BPM
  and equal loudness with no scrape the shared ratios hear 12 of 12 and 2.2 / 2.67 hear 0 of 12 (at 90 BPM the shared
  ratios hear 6 to 10 of 12, 2.2 / 2.67 hear 0); at 140 BPM with a weak scrape, 12 vs 9 on 16.7 ms frames and 12 vs 3 on
  50 ms frames; a firm pick strum is heard by both. Over the settings the shared ratios do not always hear, what each
  Power Chord Switch ratio still hears, as a share of what the shared ratios hear: 2.2 / 2.67 13%, 2.0 / 2.43 15%,
  1.8 / 2.19 37% (the replay on the 12 real takes: 1.8 removes 14 of 52 false hits and loses 1 real strum, 2.2 removes
  30 and loses 4; 2.0 was not replayed). So the strums that can now be missed are soft ones and ones without a clear
  pick attack (a thumb or a finger). The 12 real takes put that at 4 of 132; they do not cover the cases under "To
  watch" in "Where things stand". The game says so in its own words (2026-11-05, Jonathan asked for it): on the Power Chord Switch done
  screen, when at least two changes show "no strum heard" and they outnumber the "chord sounded wrong" ones, below 85% right,
  the advice is `games.pw.advice.firmer` ("Some strums were not heard. Strum a little firmer, and keep the guitar close to the
  mic." / "No se oyeron algunos rasgueos. Rasguea un poco más fuerte y mantén la guitarra cerca del micrófono."), the headline
  is the plain `games.cc.verdict.ok` ("N of M changes worked") instead of "this speed is too fast for now", and the big
  button is "Again" at the same speed instead of "-10 BPM". It replaces the line in place (same height, one line at 1366x657,
  both languages, pairs and the 21-change song switch). One miss alone, a tie, mostly wrong chords, 85% and better, and
  Change Up keep what they had. The condition is decided once, before the headline (`firmer` in `ccRenderDone`). Check 1ck
  renders the real done screen in both languages for ten situations (20 renders: headline, advice and highlighted button);
  twelve deliberate breaks each turned it red.
- **Checks:** 1ck runs the real `ccLoop` on scripted frames just below and above every threshold, in Change Up (a
  pair and the computer's pick, three speeds) and in Power Chord Switch (a song switch in all three rounds, a pair and
  the computer's pick, three speeds, with a recording live and without; 165 runs), pins the two lines that choose the
  ratios by their text, reads the ratios back from the saved take, and pins 2.2 / 2.67 and 1.4 / 1.7; 1cl proves a take graded at other ratios (on either
  channel) is told from the older ones, measured the same, left out of the what-if and counted in the console, the terminal
  and both downloads (`strumWhatIfSkipped`), that crafted values are refused, and that the console's own Evaluate-all
  replays older takes from the shared ratios (14 cases). Deliberate breaks each turned a check red: 15 in the first
  round (the ratio back to 1.4, Change Up using the new ratios, the loop ignoring them, the attack channel left shared,
  the take dropping them, a retune without re-pinning, the game test inverted, a comment inside the condition, an
  unsupplied name, six evaluator breaks) and 8 more after the review found the first check blind (Change Up's
  attack channel on the wrong ratio, the ratios keyed on the song-switch ladder or on a recording being live, the
  console replaying from the new ratios, either channel dropped from the skip test, either download dropping the count).
- **Roll back:** set both `CC_POWER_*` constants to the `CHK_*` values (1.4 / 1.7) and change the pin line in 1ck
  ("the strum ratios are ... pinned 2.2 / 2.67"; the case table works its expectations out from the constants, so
  nothing else changes). New takes then record 1.4 / 1.7 and the console treats them as the older ones.
- **Student-facing:** a `CHANGELOG.md` entry ("noise in the room counts less"). No string changed: the setup tip
  already says quiet room, guitar close to the mic.

### Later (not chosen yet)

- **Settled by Jonathan, 2026-11-04 (not to be re-raised):**
  - **The 30 s take cap is fine.** Takes are cut at 30 s: at the default (every beat,
    60 BPM) the audio ends about 6 s into round 3; at 40 BPM in round 2; "every 2 beats"
    in round 2; "every bar" in round 1. The saved `expected` list still has all 21
    changes (times past `durationSec` are not in the audio); the evaluator counts those
    as `dropped`. Do not raise the cap.
  - **Power Chord Switch passed a real mic check** (Jonathan, with his own guitar).
  - **Do not unify the three wordings** for "on time but the chord sounded wrong"
    (verdict "messy", count line "chord sounded wrong", big line "wrong chord").
  - Watching the big feedback line in a real class was skipped on purpose.
  - **No real mic check for Note Runner** (Jonathan: not needed).
- **Spanish for the new strings** was written in the same edit; no review sheet
  (house rule). Look at `games.pw.ladder.*`, `games.pw.songSub`,
  `games.pw.view.pairs`, `games.cc.breakdown` in `i18n.js` if a student reports
  odd wording.

### Review status

Reviewed the same day by `site-reviewer-deep` (always-reviewed: `firestore.rules`
and the mic game loop). No `Review: Fast` trailer on the commits. The reviewer
re-ran grading old-vs-new through the real `ccLoop` on a fake clock (pairs
792/792 identical, ladder rounds 2304/2304), 221 random Stop moments, 200 random
leave-the-screen moments, 2283 BPM-button presses: no break. What it found, and
what was done in the same push:

- Play screen did not fit 657px in Spanish or with the red label showing (Stop
  fell off the screen; chips widened mid-round). **Fixed:** the big line and the
  BPM buttons moved under the charts, chips keep a fixed symbol box, charts a
  little smaller; measured on all 16 switches in EN + ES, with and without the
  label, every chip graded (max 657px, Stop on screen); `tools/smoke.mjs` now
  walks Spanish, the label and the widest chips.
- The 1ck check could not see the recording behaviour (10 mutations stayed
  green). **Fixed:** stand-ins that track the capture, the label on every
  screen, a clean grid each round, ladder tempos, the consent footer, the
  anchored rules pattern, the strum log; all 12 mutations (the reviewer's 10
  + 2) now turn it red.
- Ladder from a base of 115 BPM or more was not "each round faster". **Fixed:**
  round 1 starts at most at 110 (110 / 125 / 140).
- `tools/mic-sim/eval-takes.mjs` then skipped Power Chord Switch takes (it measures them since 2026-11-04, item 2); comments
  and the changelog that over-claimed were corrected; asking for consent from
  the done screen no longer forgets a replay.
- Left as is: the three wordings for "on time but the chord sounded wrong"
  (verdict says "messy", the count line "chord sounded wrong", the big line
  "wrong chord"); a missed chip is faded grey while its big line is red;
  a remembered pick of the old "the cure" walk now opens Sweet Child's first
  switch (session only).
