---
paths:
  - "app.js"
  - "teacher.js"
  - "coach.js"
  - "live-quiz.js"
  - "fab-tools.js"
  - "tuner.js"
  - "tabs/journey.js"
---

## Writing code here

Each rule is a real bug that shipped past every check. Follow them as steps,
not judgement calls.

1. **Inline handler arguments: `jsonAttrArg(x)`, never `'${escAttr(x)}'`.**
   The browser un-escapes an attribute before its JS runs, so `escAttr`'s
   `&#39;` becomes a raw `'` that ends the string literal early.
   - Write `onclick="fn(${jsonAttrArg(id)})"`, no quotes around it.
   - `jsonAttrArg` always passes a *string*; for a number or boolean use
     `escAttr(JSON.stringify(n))`.
   - Better still: `data-*` plus a delegated listener (teacher.js never splices
     an id into a JS string).
   - Check 1bs compiles every handler in every rendered set.
   - 28 older handler lines still use the quoted form (27 in app.js, 1 in
     live-quiz.js; `grep -cE " on[a-z]+=\"[^\"]*'\\$\{escAttr\(" app.js live-quiz.js`).
     The ones that carry text are the risk (openSongLink, sdAnswer, strumChord,
     caStepHtml's video `loadPanel`, a ca-card `window.open`): convert each when
     you touch it.
2. **A `//` comment goes on its own line, or ends a finished line — never
   between two things on one line.** A mid-line `//` swallows the rest of the
   line and the file still parses. After editing a one-line literal or argument
   list, re-read the line. Before committing:
   `git diff -U0 | grep -nE '^\+.*//.*[A-Za-z_]+\s*:'`.
3. **Grep for siblings before and after a fix.** These bugs live in copies.
   - Search every copy (both languages, both step renderers, the other branch of
     the function) and every comment or doc that describes the old behaviour.
   - Fix or diff them in the same change.
   - Before adding a *third* copy of a block, extract a helper.
4. **Anything you start, you stop on every exit path.** Timers, rAF loops,
   listeners, `AudioContext`s, mic streams, `ResizeObserver`s, audio elements.
   List the ways out (leave the screen, hidden tab, language switch, sign-out,
   error, teacher mode); make each one call the stopper. A *global* stopper
   (`stopCardAudio()`, `gamesStopMic`) must be guarded in teacher mode
   (`if(!IS_TEACHER_MODE)`), or the console cuts off the song playing for the
   room.
5. **A string that shows only sometimes: read the condition first.** Tips,
   toasts, verdicts and explains are chosen by code. Read that code, list the
   cases, and make the sentence true in all of them. Test `{n}` as 0, 1 and many
   in both languages.
6. **Student-controlled values are untrusted in the teacher console.** Anything
   read from a `progress/{uid}` doc (period, name, email, responses), reports or
   mic-take metadata goes through `escHtml`/`escAttr` at the point of
   interpolation, even when you "know" it is one of 4/7/CAS.
7. **A check that only finds a call in the source proves nothing about
   behaviour.** New ratchets must:
   - *render or execute* the thing (1bf renders both card builders; 1bs compiles
     the handlers);
   - be proved red by breaking the guarded thing at least two ways;
   - pin totals so they cannot go blind.
8. **Don't count a green run as proof.** Print the denominator ("checked 306
   handlers"), and distrust any script that finds 0 in both the old and new tree.

### Detectors, allowlists and kept-on-purpose code

- **A detector script never stays in a session scratchpad.** It goes into
  `tools/checks.mjs` the same session.
- **Reach for a whitelist over a blacklist whenever the banned word has an
  innocent twin.** 1w2 pins the Journey lick labels positively because "the
  reach" and "the climb" are fine elsewhere on the same pages.
- **1av's `MC_LEAK_ALLOW` is keyed `<card key>|<n-gram>`, but an entry excuses
  the whole card in that language.** Once one listed n-gram leaks, the card's
  other leaked n-grams pass too (the check's own comment: one reviewed decision
  per card).
- **`MC_LEAK_ALLOW`'s entries are all Modules 1–6 and carried on purpose.** When
  a module gets swept, delete its entries first and let the check say what is
  left.
- **`WARMUP_BANK` (`config-main.js`) and `buildModuleRoutine()` (`app.js`) are
  kept on purpose.** Nothing calls `buildModuleRoutine()` since `52ae05f`, and
  `WARMUP_BANK`'s other reader is the switched-off Daily 5. Don't delete either.

### A new renderer or layout

Do these BEFORE the first review, not after it:

9. **A new grid / flex layout: measure it at 1366 AND 390 px, in a real
   browser.** `repeat(N,1fr)` columns do not stay equal on their own: every grid
   child needs `min-width:0`. Source checks (1o) cannot see this.
   - Assert `scrollWidth <= clientWidth` and that the same beat sits at the same
     x in every row.
   - `tools/smoke.mjs` does it for the chord grid — extend it, don't re-invent it.
10. **Every state the data can take must DRAW something.** List them before you
    render:
    - rests (silence);
    - a chord held across a row;
    - a short last row;
    - a one-bar section;
    - the power view vs the full view;
    - a card that is part grid and part single notes.
11. **Changing what a thing DOES means rereading every sentence that describes
    it.** Grep the card's title, intro, captions, check text and directions in EN
    and ES. Colour claims ("beats dark, + light grey") are computed style, not a
    guess — read `getComputedStyle` before writing them down.
12. **A ratchet must render ALL the cases, not the easiest one** (1bv, the
    chord-grid check, once rendered only one card and stayed green over three bugs).
    - Render every opted-in card in every view.
    - Count what the comment promises (rows, bar lines, beats 0..N once each).
    - Prove it red with one mutation per promise; write them down and keep the
      list in the commit message.
    - Behaviour a Node harness cannot see (a cursor stepping, a dot filling) goes
      in `tools/smoke.mjs` against a fake clock, not in checks.mjs.
13. **Report every interpretation of the work order.** If a rule had to be read
    one way, say so in the report with the cards it touches, even when it seems
    obvious.
14. **A checkout with someone else's staged files is not yours to commit.** Work
    in a worktree off the commit you are building on (`git worktree add
    .claude/worktrees/<name> <sha>`), push from there, and leave their files alone.

When unsure whether a change is safe, run the tool instead of reasoning it out
(`checks.mjs`, `rule-zero-proof.mjs`, `smoke.mjs`: see CLAUDE.md "Start here").
