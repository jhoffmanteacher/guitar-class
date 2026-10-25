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

## Writing code here — rules from the 2026-10-25 whole-site sweep

Each rule below is a real bug that shipped past every check. They are
deliberately mechanical: follow them as steps, not as judgement calls. History
and numbers: `WORKFLOW.md` ("2026-10-25 whole-site sweep").

1. **Inline handler arguments: `jsonAttrArg(x)`, never `'${escAttr(x)}'`.**
   The browser un-escapes an attribute before the JS inside it runs, so
   `escAttr`'s `&#39;` becomes a raw `'` in your string literal and a label
   with a quote ended the `onclick` early (15 dead ▶ video buttons). Write
   `onclick="fn(${jsonAttrArg(id)})"` with no quotes around it. `jsonAttrArg`
   always passes a *string*; for a number or boolean use
   `escAttr(JSON.stringify(n))`. Better still: `data-*` plus a delegated
   listener (teacher.js never splices an id into a JS string). Check 1bs
   compiles every handler in every rendered set. Nine older sites still use the
   quoted form (resumeGoModule, resumeGoSong, openSongLink, sdAnswer,
   strumChord, caStepHtml's video, a ca-card `window.open`, caOpenLinkedCard,
   caSetKeyMode) — convert each when you touch it.
2. **A `//` comment goes on its own line, or ends a finished line — never
   between two things on one line.** A mid-line `//` swallowed `bpm` and
   `chords` out of an object literal; the file still parsed and every check
   stayed green. After editing a one-line literal or argument list, re-read the
   line. Before committing: `git diff -U0 | grep -nE '^\+.*//.*[A-Za-z_]+\s*:'`.
3. **Grep for siblings before and after a fix.** These bugs live in copies:
   one of five requeue helpers had `splice` inside `find`; the same escape hole
   sat in both branches of one function; "day-scoped" comments lied in six
   places. Search every copy (both languages, both step renderers, the other
   branch of the function) and every comment or doc that describes the old
   behaviour; fix or diff them in the same change. Before adding a *third*
   copy of a block, extract a helper.
4. **Anything you start, you stop on every exit path.** Timers, rAF loops,
   listeners, `AudioContext`s, mic streams, `ResizeObserver`s, audio elements:
   list the ways out (leave the screen, hidden tab, language switch, sign-out,
   error, teacher mode) and make each one call the stopper. A *global* stopper
   (`stopCardAudio()`, `gamesStopMic`) must be guarded in teacher mode
   (`if(!IS_TEACHER_MODE)`): pressing Español on the console once cut off the
   song playing for the room.
5. **A string that shows only sometimes: read the condition first.** Tips,
   toasts, verdicts and explains are chosen by code. Read that code, list the
   cases, and make the sentence true in all of them; test `{n}` as 0, 1 and many
   in both languages. (The simplified Coach tip said "Every note was right" under
   wrong notes.)
6. **Student-controlled values are untrusted in the teacher console.** Anything
   read from a `progress/{uid}` doc (period, name, email, responses), reports or
   mic-take metadata goes through `escHtml`/`escAttr` at the point of
   interpolation, even when you "know" it is one of 4/7/CAS.
7. **A check that only finds a call in the source proves nothing about
   behaviour.** Make new ratchets *render or execute* the thing (1bf renders both
   card builders; 1bs compiles the handlers), prove them red by breaking the
   guarded thing at least two ways, and pin totals so they cannot go blind.
8. **Don't count a green run as proof.** Print the denominator ("checked 306
   handlers"), and distrust any script that finds 0 in both the old and new tree.

When unsure whether a change is safe, run the tool instead of reasoning it out:
`node tools/checks.mjs --check --skip-links`, `node tools/rule-zero-proof.mjs
origin/main` (any `module-N.js` change), `node tools/smoke.mjs --baseline
origin/main` (a real-browser walk of every set, both languages, every game
view — about a minute; use it for renderer, escaping or many-file changes).
