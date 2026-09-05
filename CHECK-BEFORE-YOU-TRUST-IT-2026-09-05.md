# Check list — the 2026-09-05 audit work

Everything in `OPUSPLAN-site-audit-2026-09-05.md` is implemented and pushed to
`claude/website-errors-improvements-ikrjah` (4 commits). All offline checks
pass and a headless browser walked every set in both languages, all 16 games,
and both colour themes with no page errors.

This is what a machine in a sandbox **could not** verify. Roughly in the order
worth doing.

---

## 1. Two things that must happen outside the repo

**A. Paste `firestore.rules` into Firebase.** Console → Firestore Database →
Rules → paste the file → Publish. Until you do, the live-quiz answer rules are
unchanged (nothing breaks — the new lines only *tighten* what a student may
write). Then run one live-quiz round with a student account and confirm answers
still register. If they don't, the new type checks are the first suspect:
`ms is number`, `name.size() <= 60`, `qIndex is int`, `choice` a string or null.

**B. Run the two checks the sandbox can't.** From your Mac or Windows machine,
on this branch:

```
node tools/checks.mjs          # the real YouTube link check — all 180 links
                               # returned HTTP 403 through the cloud proxy,
                               # so they were never actually verified today
git push origin HEAD:main      # when you're happy with it
node tools/checks.mjs --live   # a minute later: confirms the deploy landed
```

---

## 2. Look at these on a real phone

The play/Coach buttons and the About panel were measured at 375 px in a
headless browser, which is not the same as a thumb on a Chromebook or an
iPhone.

- **A step with a long ▶ button** (Module 12 Set 1, the fingerpicking
  challenges; also Module 5 Set 2). The ▶ label now wraps onto two lines. Is
  the tempo slider reachable? Is the Listening Coach button fully on screen?
- **The Module 1 Review routine card** — same controls, tighter space.
- **The menu drawer** on an iPhone with Safari's bottom bar showing: are
  Tuner / Timer / Metronome tappable at the bottom, not under the browser bar?
- **A TAB with note names** — on touch they are now underlined with dots to
  show they're tappable. Does that read as "tap me" or as clutter?
- **Rotate an installed shortcut to landscape.** The portrait lock is gone,
  which is what the wide TAB grids wanted. Confirm nothing looks broken
  sideways.

## 3. Look at these in dark mode

Eleven buttons had white text on a light fill in dark mode. They now take the
page background colour instead — which is the same white in light mode, so
light mode should look **identical**. Worth confirming both.

- An **In-Class Activity's "Mark done"** button.
- **A TAB while ▶ is playing** — the note under the beat cursor was the worst
  offender at 1.84:1, invisible exactly when you needed it.
- **The current step's number** (the purple circle) and a **Shuffle/Deck
  start** button.
- **A Song Journey page** — its grey sub-text and its coloured layer-number
  badges were both too faint; the badge numerals now flip dark-on-light.
- **The Mood chart** (sidebar → Mood Chart) — it was a white page in dark mode
  and now has a full dark palette. Check the pop-up definition card.
- **A step figure** (any diagram) — dimmed slightly instead of glaring white.
  This is a stopgap; see item 6.

## 4. Try the keyboard, once

Tab to a skill's "I've got it!" and trigger a check-off gate, then press Tab a
few times and Escape.

- Focus should land **inside** the dialog, cycle within it, and return to the
  button you came from when it closes.
- Same for Daily 5, "Report a problem", and the module-assessment pop-up.

## 5. The teacher dashboard

- **Open `?teacher=true` and load the skills grid.** `teacher.js` is now
  fetched on demand rather than on every student's page load; the dashboard
  should look and behave exactly as before.
- **Check a deck-verified checkmark's tooltip.** It used to be hardcoded "9 of
  10"; it now reads the real threshold from `app.js`. Today's numbers are
  unchanged (9 of 10), so anything else is a bug.
- **Class activities preview** should still render every activity.

## 6. Decisions I left to you

- **The Mood chart is still English-only.** Translating it means 280 strings
  including a definition for every mood word — a module-sized job. Want it as
  its own session?
- **The figure art isn't themed.** The ~40 SVGs in `img/` are drawn
  dark-on-light with the background baked in; dark mode dims them rather than
  redrawing them. Properly theming means regenerating each from
  `img/RECIPES.md` with CSS colours. Worth doing, but it's an art job.
- **The projector's Spanish twin.** I deleted three CSS rules
  (`.lq-st-title-es` and friends) that styled a Spanish line under each
  live-quiz question on the projected stage. Nothing ever rendered them — but
  if that was a feature you wanted, say so and I'll build it rather than having
  quietly removed its styling.
- **Note Hunt's round dots** (`.fret-dot.hit` / `.miss`) mark right and wrong
  by colour. They do differ in fill weight and the score is written beside
  them, so I left them alone rather than redesigning a game's score row blind.
  Your eye on the running game would settle it.
- **Two open tabs, one student.** If a student has the site open twice, the
  next save from either tab still overwrites the other's keys. Fixable, but it
  changes the save path and I didn't want it riding along in a cleanup commit.

## 7. Things I changed that you might disagree with

Flag any of these and I'll revert them:

- **Five quiz questions were reworded** because the right answer was the
  conspicuously shortest option. Module 2's alphabet question now offers four
  plain letters (`G#` / `A` / `A#` / `C`) instead of the old "It starts over at
  C" catch-all. Nothing about what's taught changed, but the wording is yours.
- **One Module 13 photo was re-exported** (1.9 MB → 194 KB, 1200 px → 720 px to
  match its seven siblings). Compare it against the others; the original is in
  git if the detail loss matters.
- **Journey layer accent colours were darkened slightly** in light mode and
  lightened in dark, so white numerals on those badges are legible. It is a
  visible palette change on six pages.
- **The activity-chip background and the red "Preview" banner** were nudged for
  contrast.

## 8. Nothing to do — just so you know it happened

- **The site now loads ~36% less JavaScript up front.** `coach.js` (375 KB) and
  `teacher.js` (100 KB) load on first use instead of on every visit. Verified:
  games, the Listening Coach, and the teacher dashboard all still work, offline
  included.
- **An update can no longer be blocked by one dropped file.** The offline save
  was all-or-nothing across 93 files; the essentials are saved first now.
- **Four new push-blocking checks**: contrast in both palettes (1s), Journey
  theme drift (1t), the tuning warm-up tag (1r), and regex lookbehind (in 0).
  Check 1h now catches shortest-answer tells as well as longest, and check 0b
  now fails rather than warns if it can't smoke-test the renderer.
