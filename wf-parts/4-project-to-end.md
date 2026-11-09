## Project: what this is
Cut to the dated decisions, the reasons and the rules found nowhere else (Jonathan, 2026-11-09: "is everything necessary anymore?"). The operative rule is in CLAUDE.md; "Moved from CLAUDE.md (2026-10-28)" points back here for the Stations B/C and Daily 5 text, kept in full below.

- **Stations B and C are merged in DISPLAY ONLY** (2026-08-27). A set renders as ONE step ladder (B's sections, a seam divider, then C's), but `stations.b` / `stations.c` and every progress key (`${w.id}-b-sec{gi}-{i}` / `-c-sec{gi}-{i}`) are unchanged — never "simplify" the data to match the display. **`gi` is the section's position after excluding only tuning-warmup sections (`storageSections()`); render-time hiding never renumbers it** (checks.mjs 1af; it must stay green with no change to its expected `data-ns` lists). Renderer: `buildLesson()`; tab-panel suffix `LESSON_TAB` (still `'station-b'`, so old deep links resolve); sections are addressed by `data-ns`, never by DOM position. No "Station B/C" wording in student text — the mid-set card is **Checkpoint / Punto de control**, the end one **Wrap-Up / Cierre** (1n). **Only `m4w2` is shown as Part 1 / Part 2** (`partOne`, `partBreak`; 1ao pins the count at 1); display only, no key moves, a set is complete when the SET is (the sets gate, checklist, Module Review, search and `resumeLessonCounts()` never see a part). In focus mode the B→C seam hides once the open step is in Part 2. Resolvers `lessonParts()` / `lessonGroups()`; field docs in the schema comment at the top of `module-2.js`.
- **Module 13** (String Changing) also has custom tab labels, and its checklist is the graded assessment.
- **No student tour:** `tour.html` + `tour-img/` were deleted 2026-08-27 (they taught the retired B/C model; every screenshot was stale). Jonathan is building a new one; don't restore the old file from git.
- **No in-panel tab bar:** `switchTabById()` drives `.tab-panel`; a set is exactly two panels (lesson ladder, checklist). The per-set Songs tab was removed 2026-08-27 (unreachable once the rail took over; the Songs hub lists the same songs, Module 1's included).
- **Chromebook 1366×657** (Jonathan, 2026-10-26: nobody uses the site on a phone): rule in CLAUDE.md. Don't spend time deleting the phone CSS; 1o also guards narrow Chromebook windows.
- **Live preview:** VS Code Live Server (right-click `index.html` → "Open with Live Server"); no commit needed. **Dev bypass:** a button on the auth wall loads a mock user; progress doesn't save to Firestore.
- **Shell:** match command syntax to the platform the session reports.

### Pre-push checks, hooks, parallel sessions
Rule: CLAUDE.md "Pre-push checks" and "Start here"; hooks: skill `session-handoff`. What CLAUDE.md doesn't say: the ~240-link check stays on full pushes even when no link changed (it catches videos taken down since). `CACHE_VERSION` is a content fingerprint of the cached shell and everything in `audio/`; since 2026-10-16 also `sw.js`'s own code (version lines blanked), since 2026-10-25 every file in `sw.js`'s `ASSETS` (font, PNG icons), and 1bt fails a push that leaves a precached file out. `--live`: run it a minute after pushing. Smoke test needs Node 22+ and Chrome (`--chrome <path>`). `pre-push` exists because git skips pre-commit on merge commits.

Parallel sessions live in `.claude/worktrees/*` (gitignored). Worktrees isolate files, not `origin`: on 2026-08-20 a worktree session pushed a merge of `main` straight onto `origin/main`. The lesson is *don't push a merge you didn't intend*, not *don't push to main*; a clean fast-forward (`git push origin HEAD:main`) is how worktree work ships.

### Three regimes, ratchet, board, config writer
Rule: CLAUDE.md "Three regimes" and "Other standing rules". Dated decisions: the regimes date from 2026-09-20; `FROZEN_THROUGH` raised 2 → 3 on 2026-10-01 (Jonathan: "nobody is in Module 3 yet, but students are about to"); no renames in frozen modules because a rename would hide an insertion from the check; raise both numbers a module AHEAD because nobody tells Claude when the first student passes the gate. Since 2026-10-19 a keyed MC may be ADDED to a frozen step (it prints) and reworded via `response.renamedChoices` (the proof checks the map covers every old choice and keeps the keyed one keyed); since 2026-10-16 (Jonathan) a section title may be reworded in frozen modules too. A fix the regimes block is never worked around and never shipped as a rename that "prints rather than failing": it goes on the Summer reset list.

Why the module ABOUT to be entered counts as frozen: until 2026-10-01 a locked set's preview (`set-peek`) refused ticks but still SAVED ANSWERS (`onResponseChange`, `onStepMcSelect`, `onPracticeMcSelect` had no peek guard), so a few `responses` keys may exist in the module above the class. It unlocked nothing (`hasProgressIn()` reads guarded data). `isPeekedResponseKey()` closed it; 1bl pins the guard.

Ratchet extras (CLAUDE.md has the rule; hand-out command in skill `site-sweep`): never leave a detector script in a session scratchpad, it goes into `checks.mjs` the same session; prefer a whitelist over a blacklist when the banned word has an innocent twin; pin meaningful totals. Board: live for students = assigned + dated-and-arrived + not Hidden + not archived/deleted (`caIsVisible`); `number` in `class-activities.js` is legacy (1d, 1l; skill `in-class-activities`). `config/class`: 1ai pins the writer count `CONFIG_WRITERS` (`.claude/rules/teacher-console.md`). `MODULE_MANIFEST` drift fails `checks.mjs`.

## i18n — hand-written Spanish everywhere

Rule: CLAUDE.md "i18n". Google Translate is gone; `setLang()` drives four layers: the shell (`i18n.js` via `t()` / `data-i18n`), module content (`_es` via `tf()`), the games arcade + Listening Coach (`t()` at render time), the Song Journey pages (`data-es`, swapped by `journey.js`).

- Never "translate later": Jonathan doesn't speak Spanish, so nothing catches it afterward.
- The solfège rule is not enforced by any check; a 2026-07-31 sweep fixed the last 2 `module-9.js` violations. Check it whenever you touch module Spanish.
- Proofread sweeps retired: the 2026-07-23 sweep found essentially no meaning errors in ~4,300 strings. Sweep only when Jonathan asks or a string is flagged. No review sheet; don't recreate one.
- Glossary, loanword policy and settled ES terms: `claude/spanish-terminology.md` in the Claude project.

## Content rules

Rule: CLAUDE.md "Content rules". Dates, reasons and the parts stated only here:

- **Wording (1w):** 1w catches only retired phrases, not a new idiom. Site terms like "two homes" (Modules 5/7/11) and the metronome ladder's "top of the ladder" are teaching devices; don't flag them.
- **No teacher speak (1w-t):** from the 2026-09-23 jargon-cut work order (433 findings).
- **Typed answers (1ar):** Modules 3–6 went from 82 typed answers to 8 on 2026-09-20. 1ar pins a per-module budget and fails only UPWARD: removing one is always fine; adding one is a decision made in the same edit. 41 of the 82 were already unreachable, so count what `visibleSteps()` renders, not raw `response:{type:'short'}`.
- **Lists:** applies to step `text:` and practice `prompt`s; short lead-in before the list. Leave alone: single actions, hints, `gotItWhen` strings, placeholders (except Challenge cards, whose body is always a list). The renderer wraps "You've got it when" in `<span class="got-it">`.
- **Challenge cards:** the `label` title is verbatim, escaped plain text. "(assessment preparation)" since 2026-09-23 (was "(your assessment piece)").
- **Presentation at render time:** reach for the renderer first when a change is about how something looks or is ordered.
- **Strings named (Jonathan, 2026-08-06; 1j):** chord shorthand like `xx4432` is notation and stays; the only digits left are Module 7's two root-naming MCs, each anchored "string 6 (the low E)".
- **Paper drills:** no paper-fallback line. `notecall` (2026-09-27, ca-23) is not a paper drill: a note name on the beat, played on the guitar. It opens in "Show answer" (a play-along: the fret lights 2 beats after the name, speeds up every 8 notes, Slower / Faster step it, nothing scored); turned off, five scored levels answered by the mic ("Play it on the guitar", off by default) or by tapping the fret (`drill: { type:'notecall', strings:['lowE','A'], minFret:5, maxFret:8 }`; engine `renderNoteCall` in `app.js`, progress `games.nc`, `gamesStopMic()` stops it). Wiring a deck is content: `drill: { type:'deck', deck:'numerals-C', skill:'m11w1-s3' }`.

### Quiz answers and keyed MCs
Rule: CLAUDE.md "Keyed MCs". Called "graded MC" before 2026-10-26 (old notes and comments may say that); nothing on the site is graded, the graded quizzes are on Canvas. Fewer than 3 choices are not shuffled; write `answer: 0` freely (students never see it that way). History: m11w2-s3's explain was right only by luck after a 2026-09-05 reword; the 2026-09-05 m8w1 reword was safe only because the furthest student was in Module 1. `FROZEN_MC_THROUGH_MODULE` (2026-09-19; 2 then, 3 since 2026-10-01, Jonathan) fingerprints `choices` + `choices_es` + `answer`, and 1ap also fails when a keyed MC goes missing. Don't lower it: a module the class has passed keeps its stored answers forever. To raise it, ask Jonathan which module the class is in. The 1at / 1au / 1av ratchets and the 1w field-reader fix are documented in their comments in `tools/checks.mjs`; the Modules 1–6 allowlist note is under "Moved from CLAUDE.md (2026-10-28)". Frozen mid-year fixes (Module 1 Set 2's three keyed-MC rewords, Module 3 Set 2's Challenge numbers, `ca-14`'s Happy Birthday exit check): skill `summer-reset`.

## Play-along first; Song Journey pages are the back door (2026-10-06)
Rule: CLAUDE.md "Play-along first" (1bn) and skill `in-class-activities` (same heading; door table, layer matching). Journey pages also get no Stuck?/Level up folds, and a page's text is not synced to a card.

**`firestore.rules`:** console paste (CLAUDE.md). Until it is pasted, the live quiz's answer writes are rejected and the game looks broken with no error students see.

**The Daily 5 is retired — switched off, not deleted** (Jonathan, 2026-09-19). The "Tune and warm up first" banner at the top of every ladder was the **only** entry point to the Daily 5 overlay, so turning the banner off retires the Daily 5. `const DAILY5_ENABLED = false;` in `app.js`, beside `buildDaily5()`, is the whole switch; `ladderHtml()` is its one reader. **Nothing was deleted**: `buildDaily5()`, `openDaily5Here()`, `moduleStepsFlat()`, the `.daily5-*` CSS (including `.dp.focus.pd-showing .daily5-inline`) and every `daily5.*` i18n key stay, so flipping the constant to `true` brings the banner back as it was. Not part of the switch: `WARMUP_BANK` (see "Moved from CLAUDE.md (2026-10-28)") and `kind:'tuning-warmup'` sections, which stay hidden exactly as before because `storageSections()` depends on that and every `gi` in Firestore was written under it. The one student-facing mention (`module-13.js`, "one lap of the Daily 5") was reworded in the same push to "a few bars of anything you know".

## How to work with Jonathan

Rule: CLAUDE.md "How to work with Jonathan". Dated decisions and what only this file holds:

- AskUserQuestion: one question per turn unless truly independent.
- Pushing to `main` is not a pause point (Jonathan, 2026-08-28): never offer "push the branch instead" as a coin flip.
- Sweeps: lead every sweep prompt with the calibration line ("convert EVERY card; do NOT skip one because the actions flow naturally — re-stitch it"), or agents go timid. Sonnet for mechanical work, the big model for design and verification. Every review round of the 2026-10-25 sweep found regressions the fixers' own proofs missed. Playbook: skill `site-sweep`.
- Triggers hold at any effort level. Mechanical files don't count toward the 3 (Jonathan, 2026-10-26); the `sw.js` version rewrite doesn't make `sw.js` a danger-zone edit, a change to its code does. Pin-only `checks.mjs` edits too (Jonathan, 2026-10-27, after a play-along edit sat behind a 30-minute deep review); the checks are the gate for them, and none of this makes `checks.mjs` a deep-review file. Which reviewer: 2026-10-26.
- Fast by default (2026-10-31) replaced the 2026-10-27 "Fast or Reviewed" question, which replaced the 2026-10-26 "quick change" keyword. Always-Reviewed changes are the ones that can lose student progress or break the live site, where a week's wait means the damage is done. Friday check: always-Reviewed fixes get `site-reviewer-deep` rounds and merge on their own (2026-11-07, Jonathan: reviews happen on their own); skill `friday-check`.
- Effort tiers: CLAUDE.md "Effort".

## Power Chord Switch: where we stopped (moved here from NEXT-STEPS-power-chord-switch.md, 2026-11-05)

Moved from its own file on 2026-11-05 (original title "Power Chord Switch — where we stopped (2026-11-03)"). The Stopped-game rules (rounds 1–6, the silent Stop of 2026-11-09, R4-2) are in Open work → "Stopped-game headline".

**Status.** The branch `pcs-pending-smoke` was merged into `main` on 2026-11-03 (merge commit ca932f2; smoke clean against the origin/main baseline, full checks passed); Jonathan published `firestore.rules` (take id `(coach|nr|pw)`). The branch can be deleted on GitHub. Same day, e5e0bef: a Stopped game with at least 10 s of audio is saved too, with `complete:false` (2026-11-07: 10 s of PLAY after the first count-in ends); a shorter Stop, or leaving the screen, drops it. The room-noise call is decided (a stricter strum ratio for Power Chord Switch only: "Decision (2026-11-07)", then "Decision (2026-11-05)"). Settled, not to be re-raised: "Later (not chosen yet)".

### What shipped in this push

1. **Song switches** (`CC_POWER_PROGRESSIONS`, group `song`), one per switch in the song's card: Sweet Child O' Mine 10 (ca-33), "the cure" 6 (ca-30). Each is a ladder: 3 rounds of 4 back-and-forths (8 chords), a 4-click count-in before each round. Rounds were 15 BPM apart (60 / 75 / 90); since 2026-11-05 5 BPM (30 / 35 / 40 from the new 30 BPM start; Jonathan: "don't increase it so quickly"). Jonathan: "practice the actual chord switches in the songs by going back and forth between each change 4 times at slower to faster tempos."
2. **BPM buttons on the play screen** (−5 / +5, under the beat dots) move the rounds still to come; off in round 3.
3. **Choices layout:** five columns, the fifth (Songs) one button per song, which opens the songs view (all 16 beside the pairs was 881px tall).
4. **Saved student audio** (`micRecStart('pw')`): the Listening Coach's consent flow and red "Recording this take" label; saved when played to the end or Stopped after 10 s of play (`MICREC_MIN_STOPPED_SEC`, 2026-11-04; audio length until 2026-11-07; a stub never overwrites a full take); never for Change Up. One capture covers all three rounds, cut at the 30-second cap. Jonathan said **no on/off button**. The small "Stop saving my takes" link stays; remove it from these screens only if Jonathan says so.
5. **Clearer feedback** (Jonathan: "I didn't see the power chord switch giving clear feedback about misses and correct notes", "make the in game feedback bigger"): done-screen chips have a symbol (✓ right, ✗ on time but wrong chord, – no strum heard) and a line counts them; on the play screen a big line after every graded change ("✓ C5 — right" green, "✗ C5 — wrong chord" amber, "– C5 — no strum heard" red; `ccShowLast`, `.cc-last`; the row is always drawn).

Check **1ck** was rewritten for all of it; `tools/smoke.mjs` walks all 16 switches.

### Done in the Firebase console

`firestore.rules` with the `-pw` take id: published by Jonathan (2026-11-03). Worth one look: teacher console → Mic recordings lists a Power Chord Switch take once a consenting student finishes a game (or stops after 10 s); mic collection must be on there.

### Tempo controls (Jonathan, 2026-11-05: "bpm more controllable by user ... prior to starting and during it")

Power Chord Switch only; Change Up keeps −5 / +5, no slider, no live tempo. Range 10..140 (floor lowered from 30 on 2026-11-05, Jonathan; it still OPENS on 30; he considered 80 for the top and kept 140); the console's `BPM_MIN` in `micEvalTakePw` uses the same 10..140.
- **Setup:** −5 · tempo · +5 and a slider in steps of 5 (`ccSetBpm`). No ±1 button anywhere (Jonathan dropped them: "just by 5s is fine"; 1ca fails if one returns). The group must stay no wider than the old row (Spanish leaves about 6px; a wrapped row made the setup 732px). "Best today" sits under the speed buttons (`.cc-best-line`, always drawn).
- **Play** (`ccLiveBpm`): −5 · tempo · +5 under the charts. The grid is re-anchored (`cc.listenStart`, gridOffset held) so the current beat does not move; changes still to come get a new `t` and `bpm`, graded ones keep theirs. A song switch's later rounds move by the same amount; the current round stops where round 3 would pass 140 (a base of 130 cannot be sped up); `ccNudgeNext` moves only later rounds; shorter charts (`.cc-ladder-play`).
- **Scoring:** a round counts at its LOWEST tempo (`cc.roundLow`, `ccRoundBpm`) in `stageLog`, `ccScoreBpm` and the done screen's "Again". A pair's "Again" starts there; a song switch's from round 1's counted tempo (`stageLog[0].bpm`). A pair remembers the live tempo for the next setup.
- **Saved takes:** `bpm` / `stageBpms` = each round's START tempo; `tempoChanges` lists live changes; changes of a retimed round carry `retimed: true`. `micEvalTakePw` leaves those rounds out, counted in `notes.retimed` (not `ignored`, which means impossible data). No `firestore.rules` change; the BPM column shows the start tempo.
- **Proofs:** 1ca runs the setup and the live change on a stubbed clock (32 assertions, pinned); 16 mutations run against it (2026-11-05, commit message). 1cl has crafted retimed takes. `smoke.mjs` clicks them all (EN + ES, 1366×657, all 16 song switches). A stale smoke assertion (80 / 95) now expects the 5 BPM step (70 / 75).
- **Open, not decided (reviewer, 2026-11-05):** a pair started at 30, sped to 90 and played well offers "Again at 35" while the setup reopens on 90; `ccRoundBpm` is the one place to change if the student's own tempo should count. If gridOffset is a constant mic lag, a very large one-burst change (30 to 140) can cost a change; one ±5 tap costs under 12 ms.
- **Choice columns (Jonathan, 2026-11-05):** the computer's pick, Songs, then low E / A string / jump (`CC_POWER_GROUPS`, display only; `CC_POWER_PROGRESSIONS` keeps songs at its END so remembered picks hold). 1ca pins it, EN + ES.
- **One way back (Jonathan, 2026-11-05: "consistent and at the top and more obvious"):** `pwBackBtnHtml`, one bold 44px `.cc-back-btn` "◀ Pick different chords" (`games.pw.pickDifferent`), first on the done screen and atop the songs view's left column (replacing `.cc-change-loop` and the "Chord pairs" pill). The pairs view has none, so speed and tempo sit 52px lower on the songs view. 1ca runs it (16 screens, EN + ES).

### Next steps (rewritten 2026-11-05; the list Jonathan chose on 2026-11-04 is done)

This list is the plan (the separate plan file was deleted 2026-11-04 at Jonathan's request).

1. **Saved takes arrive: DONE** (2026-11-04: 25 takes, 12 Power Chord Switch). If a class shows none, check in order: the rules paste (`micTakes` and `chunks` say `(coach|nr|pw)`), mic collection on in the console, the student's consent (once per device).
2. **The evaluator: DONE.** `micEvalTakePw` (teacher.js, check 1cl), built 2026-11-04, proven on `tools/mic-sim/fake-pw-take.mjs`, run on the 12 real takes. Per round: strums the game missed, "right" changes with no strum, mic delay from the count-ins (about -73 ms on Chromebook internal mics).
3. **DECIDED 2026-11-05: room noise scores a right chord.** Stricter strum ratio for Power Chord Switch only (2.2 / 2.67 from 2026-11-05, 1.8 / 2.19 from 2026-11-07). Not chosen: "no readable pitch, no tick". To do: look at the next takes ("Where things stand" → to watch). Any further change to how a strum is heard is `coach.js` detection: xhigh, Always Reviewed, run `tools/mic-sim/power-switch.mjs` first.
4. **Nothing else is waiting** (see "Later (not chosen yet)").

### Practice-minutes heartbeat removal (not Power Chord Switch): DONE 2026-11-05

Full history: "PICK UP HERE" under "Practice minutes" (Open work). "N playing" is gone and no `heartbeats/{sessionId}` record is written.
- **Code (live 2026-11-04):** writer, `pollLive()`, `S.live` / `S.liveAt`, `liveMinCount` gone from `practice-minutes.js`; counting, `flush()`, queue and keepalive unchanged (`5144c6c` + review fixes).
- **Repo (2026-11-05):** the `heartbeats` rules block, its `firestore.indexes.json` index and its `tools/pm-rules-test.mjs` section are gone; 1cg requires them to stay gone, exactly one `match /databases/{database}/documents` wrapper, and no shipped file naming a `heartbeats` collection. Reviewed same day (`site-reviewer-deep`).
- **Console (2026-11-05):** Jonathan published the rules; the emulator test passed (49 passed, 0 failed; 179 cases in the file); the old `heartbeats` and `minutesBoard` collections were deleted.
- **Optional, Jonathan's to delete by hand or leave:** the console's `heartbeats` composite index (Indexes tab, the only index: `period`, `lastSeen`, `__name__`; nothing queries it). A session's delete was blocked on 2026-11-05 as an irreversible deletion nobody had named.

### Open finding (Jonathan, 2026-11-04): room noise scores a right chord

**Decided 2026-11-05, changed 2026-11-07** (the two Decision sections below). History: Jonathan played with no guitar and the game showed "right". Cause (`ccLoop`, `ccResolvePend`): any loudness jump above a very low floor (`CHK_ONSET_FLOOR` 0.003, HF 0.0008) is a strum; at 60 BPM every beat each change's window is ±500 ms; with fewer than 3 pitch readings a change counts on timing alone (`ok`), lenient on purpose because a real low-E strum also gives under 3. The count-in beeps are not the cause. Jonathan chose to MEASURE first. Collection needs a real non-teacher account (teacher and dev bypass never record) and the console's "stop after" number above the count (23 of 40 on 2026-11-04; Coach and Note Runner takes count too).

#### First real-take results (2026-11-04, "Evaluate all recordings": 25 takes, 12 of them Power Chord Switch)

- **9 takes:** site and audio agree; 14 false hits in 141 changes; offset steady at about -73 ms.
- **3 noisy takes (T01, T10, T12) hold 38 of the 52 false hits:** the site heard a strum at almost every change; the recording has 5-8 strum attacks in 21-30 s. A few rooms (or mics), not every take.
- **Strum what-if** (from Jonathan's `mic-eval-2026-11-05.json`; 186 changes, 52 false hits, 132 real strums; the replay at 1.4 / 1.7 matches the site on 183 of 186). False hits removed / real strums lost: **1.8 / 2.19: 14 / 1; 2.2 / 2.67: 30 / 4; 2.6 / 3.16: 38 / 9.** The noisy takes lose 26 false hits and 0 real strums at 2.2, 30 and 1 at 2.6. Lost real strums: at 2.2 in T06 (1), T08 (1), T11 (2); at 2.6 also T03, T04, T09. "Lost" = the game would grade that change a miss. Zip: `mic-recordings-2026-11-05.zip` in Jonathan's Downloads (12 Power Chord Switch, no pitch readings).
- **A higher absolute onset floor is ruled out:** 48 of 52 false hits AND 55 of 132 real strums are under 15 dB above the room floor.
- **"No readable pitch, no tick"** can touch only the 34 false hits graded right; the other 18 were graded wrong (already 3+ readings).
- **Why ratios:** `ccLoop` fires on a ~3 dB jump (full band x1.4 or HF x1.7); the evaluator's `micEvalSignal` (HF > 2.2x base and > 4x the HF floor) found the real strums in the 9 good takes and almost none in the 3 noisy ones: room noise jumps the full band, not the pick-attack channel.
- **Coach / Note Runner fix, same push:** 42 of 64 Note Runner notes sat past the 30 s cap and were measured as silence (median -141.6 dB); a note whose window runs past the audio is now `dropped` (`notes.dropped`), as for Power Chord Switch.

#### The strum what-if (built 2026-11-04; MEASUREMENT ONLY, how the game grades is unchanged)

`micEvalTakePw` → `whatIf`: a table under Evaluate-all, `strumWhatIf` in "Download results" (take labels only, no names, no uids), and `node tools/mic-sim/eval-takes.mjs <folder>`. It replays the site's strum rule at the shared ratios (1.4 / 1.7) and stricter ones (1.8 / 2.2 / 2.6; HF 2.19 / 2.67 / 3.16). Takes graded with Power Chord Switch's own ratios are left out. The constants and the text of `ccLoop`, `coachReadFrame`, `coachSmooth` are read from `coach.js` at run time; if that shape changes the what-if is `null` and 1cl turns red. Columns: **false hits removed**, **real strums lost**, **reproduced** (the shared-ratio column is the replay's error bar). Pick the ratio where "removed" is large and "lost" small.

Assumes: a steady frame every `frameMeanMs` (clamped 16.7-150 ms); 24 kHz takes vs the analyser's 48 kHz (window scaled, absolute HF floor not); smoothing through the whole take (the site resets each round); no `srcSampleRate` read as 48000. Proof: `fake-pw-take.mjs` `pw-room-noise` (no strums; bursts 1.6 / 2.0 / 2.38 / 3.0 x the room; 11 false hits; stricter ratios must remove 3 / 5 / 8) and `pw-soft-strums` (15 real soft strums; must lose 0 / 5 / 10); 1cl compares all of it and was broken 14 ways. It does not say whether the strum was the right chord.

#### Pitch readings in the saved take (added 2026-11-05)

Each `expected` entry of a take has `readings` (meaning in the take's `changeReadings`; `ccResolvePend` keeps them, `ccRecMeta` saves them, midi, 2 places): `null` = no strum heard (`miss`); `[]` = strum, no pitch (`ok` on timing); a list = the readings used (3+ needed for `ok` / `off`). **The "Pitch-rule what-if" table** (built 2026-11-05; console, `eval-takes.mjs`, `pitchRule` in both downloads) counts per take: graded right; 3+ readings vs timing alone; false hits and real strums; "−N · lost M". Takes before 2026-11-05 have no `readings` key and are counted out, never read as `null` or as zero readings. No rules change. Grading untouched: same verdict on 20,000 of 20,000 random changes. 1ck reads the saved take back (21 of 21; six breaks red). 1cl: 5 synthetic takes with planted readings, 13 without; 64 graded right, 39 on timing alone, all four outputs agree (ten breaks red). Planted numbers say nothing about real students.

#### Decision (2026-11-07): Power Chord Switch strum ratio 2.2 / 2.67 -> 1.8 / 2.19

Jonathan, from "Evaluate all recordings" on 34 takes on 2026-11-07 (zip: `~/Documents/mic-recordings-2026-11-07.zip`):

- **At 2.2 / 2.67 (14 takes):** false hits 12 of 97 (27% at 1.4), but **6 of 75 real strums were missed**; 5 of the 6 at 35-40 BPM, normal loudness, 175-300 ms early (probably the previous chord still ringing).
- **What-if on the 7 takes graded at 1.4 / 1.7** (re-run with `eval-takes.mjs`, same numbers): 1.8 / 2.19 removes **11 of 31** false hits and loses **0 of 81** real strums; 2.2 / 2.67 removes 21, loses 3; 2.6 / 3.16 removes 26, loses 6. For students who were playing, both leave the same 4 false hits.
- **"No readable pitch, no tick" (`pitchRule`):** removes 2 of 12 false hits, loses 10 of 46 real rights. **Rejected: do not build it.**
- **Change:** `CC_POWER_ONSET_RATIO` 2.2 -> **1.8**, `CC_POWER_HF_RATIO` 2.67 -> **2.19** in `coach.js` (Change Up and every other loop keep 1.4 / 1.7). 1ck's `R.pw` pin line re-pinned (2.2/2.67, 1.4/1.7 and one-number-wrong each turn it red). Check 2d (inside 1cl) proves the console treats a take graded at 1.8 / 2.19 or 2.2 / 2.67 as graded with other ratios. `power-switch.mjs` output is byte-identical on std, mid and weak (it does not measure the ratio); 1ck and the real-take replay do.
- **Takes:** after this version reaches a browser, 1.8 / 2.19; from 2026-11-05 until then 2.2 / 2.67; older 1.4 / 1.7. The strum what-if skips the first two and says how many.
- **Roll back:** the two constants back to 2.2 / 2.67 and re-pin 1ck's `R.pw` line.
- **Limit (deep review):** no replay measures what 1.8 does to the 6 missed strums (replayed in a scratch copy, all 6 still fire at 2.2; the replay matches the site on only 85 of 97 changes there, 111 of 113 on the 1.4 takes). The case for 1.8 rests on the 7 takes at 1.4; the next takes are the real test. One of the five slow misses clips 14.9% of its samples.
- **Watch next:** "Played, not counted" (`detector-missed`) should fall at 35-40 BPM; false hits rise a little in noisy rooms. Not tested on a thumb or finger strum.

#### Decision (2026-11-05): Power Chord Switch strums need ratio 2.2 / 2.67

Jonathan's pick from the what-if on the 12 real takes (numbers under "First real-take results"): the knee is 2.2 (1.8 → 2.2 buys 5 false hits per real strum lost, 2.2 → 2.6 only 1.6). Of the 30 removed, one the replay already drops at 1.4 (29 net); 22 of the 52 still fire at 2.2 (T12 keeps 6 of 12, T01 3 of 13). `coach.js`'s line "marking a correct change wrong is the worse error in a room" is why the choice was Jonathan's: a few soft strums traded for honest feedback in noisy rooms.

- **Chosen with the risk in front of him.** The reviewer found the 12 takes don't cover thumb or finger strummers, fast every-beat pairs or slow-frame Chromebooks, and offered 1.8 / 2.19 or waiting for a thumb take; he said push 2.2. **His first step:** strum a thumb or finger take on a test student account (60 and 120 BPM, every beat), "Evaluate all recordings", read "Played, not counted" (`detector-missed`); roll back if bad.
- **The game:** `CC_POWER_ONSET_RATIO` / `CC_POWER_HF_RATIO` (HF = 1.7 x ratio / 1.4) sit beside the shared `CHK_ONSET_RATIO` / `CHK_HF_RATIO`; `ccLoop` picks them with `ccIsPower()`. Change Up (same loop), Listening Coach, Note Runner, Note Call and the rest keep `CHK_*`. The condition must stay on those four lines and free of comments: the console reads it as text.
- **A take records** `fields.onsetRatio` / `fields.hfRatio` (`ccRecMeta`); none before 2026-11-05 = shared ratios.
- **The console:** `micEvalStrumRule` compiles ccLoop's condition with `onsetRatio` / `hfRatio` (or `CHK_*` for older text); a take graded at other ratios is left out of the what-if (`row.whatIfSkipped`, `row.strumRatio`) and counted; the rest is unchanged. Ratios outside 1..10 or half missing are never trusted. **Not built:** a what-if from a stricter base (e.g. 2.6 / 3.16); add it if the next takes make it worth deciding.
- **Limit of the proof:** a firm pick strum in a quiet room grades as before (`power-switch.mjs` identical; ratios forced to 60 collapse only the Power Chord Switch gate), but its strum has a pick-scrape about 3x the note level. `tools/mic-sim/onset-probe.mjs` (real `coachReadFrame` / `coachSmooth`, a strum over the previous chord ringing, 12 trials, synthetic, so RELATIVE): at 60 BPM, equal loudness, no scrape, shared ratios hear 12 of 12 and 2.2 / 2.67 hear 0 (90 BPM: 6 to 10 vs 0); at 140 BPM with a weak scrape 12 vs 9 on 16.7 ms frames, 12 vs 3 on 50 ms frames. Share of what the shared ratios hear: 2.2 / 2.67 13%, 2.0 / 2.43 15%, 1.8 / 2.19 37% (2.0 not replayed). So soft strums and ones without a pick attack (thumb, finger) can be missed; the real takes put it at 4 of 132.
- **"Strum a little firmer" (2026-11-05, Jonathan asked):** on the done screen, when at least two changes show "no strum heard", they outnumber "chord sounded wrong", and under 85% right: advice `games.pw.advice.firmer`, headline `games.cc.verdict.ok` ("N of M changes worked") instead of "this speed is too fast for now", big button "Again" at the same speed instead of "-5 BPM". A Stop leaves out of "no strum heard" the unreached changes and the misses after the last heard strum due in the last 4 s before the Stop; also after the last change was swept (a Stop is never a natural end) and across a song switch's rounds, where the count-in before the next round's play screen is not counted (the click can only land there) (`cc.unreached`, `CC_STOP_REACH_MS`; 2026-11-07, review round 2: at 60 BPM a 3 s reach to Stop is 3 changes). One line at 1366x657 in both languages. One miss alone, a tie, mostly wrong chords, 85% and better, and Change Up keep what they had. Decided once (`firmer` in `ccRenderDone`). 1ck renders ten situations in both languages (20 renders); twelve breaks red.
- **Checks:** 1ck runs the real `ccLoop` just below and above every threshold in both games (165 runs) and pins the ratio lines by text; 1cl proves takes at other ratios are left out and counted everywhere (`strumWhatIfSkipped`; 14 cases). 15 breaks, plus 8 after the review found the first check blind, each turned a check red.
- **Roll back to the shared ratios:** both `CC_POWER_*` to 1.4 / 1.7 and the 1ck pin line; nothing else changes.
- **Student-facing:** `CHANGELOG.md` ("noise in the room counts less"); no string changed (the setup tip already says quiet room, guitar close to the mic).

### Later (not chosen yet)

- **Settled by Jonathan, 2026-11-04 (not to be re-raised):**
  - **The 30 s take cap is fine.** At 60 BPM every beat the audio ends about 6 s into round 3; at 40 BPM in round 2; "every 2 beats" in round 2; "every bar" in round 1. `expected` keeps all 21 changes; the evaluator counts those past `durationSec` as `dropped`. Do not raise the cap.
  - **Power Chord Switch passed a real mic check** (Jonathan, his own guitar).
  - **Do not unify the three wordings** for "on time but the chord sounded wrong" (verdict "messy", count line "chord sounded wrong", big line "wrong chord").
  - Watching the big feedback line in a real class was skipped on purpose.
  - **No real mic check for Note Runner** (Jonathan: not needed).
- **Spanish for the new strings** was written in the same edit, no review sheet; if a student reports odd wording, look at `games.pw.ladder.*`, `games.pw.songSub`, `games.cc.breakdown` in `i18n.js`.

### Review status

Reviewed the same day by `site-reviewer-deep` (`firestore.rules` and the mic game loop); no `Review: Fast` trailer. Old-vs-new grading through the real `ccLoop`: pairs 792/792, ladder rounds 2304/2304, 221 random Stops, 200 leave-the-screen moments, 2283 BPM presses, no break. Fixed in the same push: the play screen now fits 657px in Spanish and with the red label (big line and BPM buttons under the charts, fixed chip symbol box; smoke walks it); 1ck now sees the recording behaviour (all 12 mutations red, the reviewer's 10 + 2); a ladder base of 115 BPM or more now starts round 1 at most at 110 (110 / 125 / 140); over-claiming comments and changelog corrected; asking consent from the done screen keeps the replay. Left as is: the three wordings; a missed chip is faded grey while its big line is red; a remembered pick of the old "the cure" walk opens Sweet Child's first switch (session only).
