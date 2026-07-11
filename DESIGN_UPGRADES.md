# Design Improvement Plan — Guitar Class Site

*Drafted 2026-07-11 from a multi-agent study of three well-designed sites — Ableton's Learning Music (interactive music education), Duolingo (self-paced learning UX), and Stripe (typography/polish) — cross-checked against this site's actual CSS and markup. Proposal only; nothing has been changed.*

**First, what's already great — leave it alone.** The blue/green/amber color system (blue = learn, green = done, amber = still working) is genuinely good and used consistently everywhere. The "Next: Station C →" buttons at the bottom of every panel already do exactly what Ableton does. The site already remembers where a student left off and reopens there. The print handout mode, the floating video player, and the fast no-download loading are all strengths. Nothing below touches those.

---

## 1. Quick wins — CSS only, roughly an afternoon each

### 1a. ✅ DONE 2026-07-11 — Fix the purple that breaks in dark mode
**What:** The site has a family of purple colors (used on Module Review pills, the assessment box, the Tuner button, the welcome "Let's go" button, and active tuner string buttons) that are hard-coded and never adapt to dark mode — so students with dark phones see glaring bright-lavender chips floating in a dark page. Turn those purples into named color variables at the top of the stylesheet (the same way blue/green/amber already work) and give them proper dark versions.
**Where:** `styles.css` — the `:root` block at line 4, then swap the raw hex values at lines 60, 74–76, 86, 93, 106, 109–110, 119–120, 124, 133, 428, 447, 461 (`.welcome-go`, `.wpill.review-pill`, `.mr-assess-box`, `.mr-tag`, `.fab-tune`, `.ts-btn.active`, `.tp-btn.primary-t`, etc.).
**Inspired by:** Stripe — their whole look comes from a *very* short list of color variables, which is why everything matches automatically, including dark mode.
**Why students notice:** Every student on a dark-mode phone currently sees the ugliest part of the site every time they open the tuner or a Module Review. This makes dark mode look finished.

### 1b. ✅ DONE 2026-07-11 — Respect "reduce motion" phone settings
**What:** Several animations pulse forever (the red recording dot, the coach's pulse, the timer-done flash). Phones have an accessibility setting called "reduce motion," and the site ignores it. Add one small CSS block that turns those animations off for students who've set it.
**Where:** `styles.css` — one new `@media (prefers-reduced-motion: reduce)` block near the bottom covering `mr-rec-pulse` (line 137), `coachPulse`, `timerDoneFlash`, `fabTimerDone`, and `stepFlash`. (Confirmed the site currently has zero reduced-motion rules.)
**Inspired by:** Both Duolingo and Stripe keep motion brief and purposeful, and gate it behind this setting.
**Why students notice:** Students who get motion-sick or distracted by movement (and there's always a few in a class) get a calmer page. It also saves a little battery.

### 1c. ✅ DONE 2026-07-11 — Make small buttons finger-sized
**What:** Several tap targets are much smaller than the ~44px minimum a fingertip needs: the 8-segment module strip is 24×9 px, the tuner's string buttons (~26px tall), the week/set pills (~30px), and the metronome/timer buttons (~32px). Enlarge the padding — or, where the visual should stay small (like the slim progress strip), give the button an invisible larger "hit area" so the look doesn't change but taps land.
**Where:** `styles.css` — `.mstrip-seg` (line 385), `.ts-btn` (line 445), `.wpill` (line 66), `.tp-btn`, `.tab-note-btn`, `.song-vid-btn`.
**Inspired by:** Ableton — everything on their site is a big tappable cell; no precision required. Duolingo pads every button generously for the same reason.
**Why students notice:** Most of the class is on phones. Fewer missed taps on the progress strip and tuner = less frustration during the most-used moments of the site.

### 1d. ✅ DONE 2026-07-11 — Darken the faintest gray text
**What:** The lightest gray (`--text3: #767670`), used for small labels, is borderline hard-to-read on the off-white page background. Darken it one notch (something like `#63635d`).
**Where:** `styles.css` line 6 — one value.
**Inspired by:** Stripe uses "off-black, never faint" for anything meant to be read.
**Why students notice:** Small labels become readable on cheap Chromebook screens and in bright classrooms. One-line change.

### 1e. ✅ DONE 2026-07-11 — One shared "card shadow" recipe
**What:** Cards, popups, and modals each have their own slightly different gray shadow (~8 variants counted). Define two shadow variables — a soft one for cards, a stronger one for popups — with a subtle blue-indigo tint that matches the header, and use them everywhere. In dark mode, swap shadows for a faint light border on top (shadows are invisible on dark backgrounds).
**Where:** `styles.css` — add `--shadow-card` / `--shadow-raised` to `:root`, then apply to `.tool-popup` (431), `.coach-card` (734), `.welcome-card` (53), `.tab` (538), `.chord-popup` (615), `.video-modal` (833).
**Inspired by:** Stripe's signature two-layer, brand-tinted shadows — it's what makes their cards feel like one designed system.
**Why students notice:** Subconsciously — the site feels more "designed" and cohesive. Pure copy-paste CSS.

### 1f. ✅ DONE 2026-07-11 — Make the main action buttons feel pressable
**What:** Give the handful of true "go" buttons a slight 3D treatment: a darker bottom edge that disappears when pressed, so the button visibly pushes down under your thumb.
**Where:** `styles.css` — `.welcome-go` (60), `.coach-btn` ("Check me"), `.panel-next-btn` (847), `.mr-rec-btn.primary` (133).
**Inspired by:** Duolingo's signature pressable buttons — the one skeuomorphic touch that makes taps feel confirmed on touchscreens, where there's no hover.
**Why students notice:** Taps feel acknowledged instantly, even before anything loads. Makes the site read as "game" more than "homework." ~10 lines of CSS.

### 1g. ✅ DONE 2026-07-11 — Give the header a phone rule
**What:** The indigo header has no small-screen styles, so on a 360px phone the title, subtitle, Español button, and sign-in crowd and wrap awkwardly. Add one breakpoint: shrink the title, hide or shrink the subtitle, tighten padding.
**Where:** `styles.css` — new `@media (max-width: 480px)` rules for `.header` (line 24), `.header-title`, `.header-sub`.
**Inspired by:** Stripe — "mobile is a first-class layout, not a squished desktop."
**Why students notice:** The first thing every phone user sees stops looking cramped.

### 1h. ✅ DONE 2026-07-11 — (Housekeeping) Merge the duplicate slider styles
`styles.css` defines `.bpm-slider` twice (line 455 and lines 565–577) with conflicting approaches. Keep the newer custom one, delete line 455. Students won't notice — but it prevents a future bug.

---

## 2. Medium — small HTML + CSS + JS changes

### 2a. ✅ DONE 2026-07-11 — A designed "in tune!" moment on the tuner
**What:** When a string locks in tune, don't just settle the needle at zero — snap the big note readout to green with a quick, satisfying pulse and the string name, like a small "success stamp."
**Where:** `tuner.js` (status/readout update, ~line 292 area) + a `.in-tune` class in `styles.css`.
**Inspired by:** Stripe — "give every step a designed success state" — and Duolingo's instant per-action feedback.
**Why students notice:** Tuning is the single most repeated action in class. A clear, slightly celebratory "you got it" per string turns a chore into six small wins, and beginners stop second-guessing whether they're done.

### 2b. ✅ DONE 2026-07-11 — Coach results slide up like a report card
**What:** When the Listening Coach finishes, animate the rubric panel sliding up into view (a 200ms transition) instead of text just appearing, and lead with the level pill before the details.
**Where:** `coach.js` (the report render) + one transition rule on the report container in `styles.css`. Respect the reduced-motion rule from 1b.
**Inspired by:** Duolingo's green/red feedback panel that slides up after every answer.
**Why students notice:** The moment of "how did I do?" gets a clear, consistent shape. This is the newest feature on the site — worth making its payoff feel polished.

### 2c. ✅ DONE 2026-07-11 — Show the countdown: "3 skills left in Module 4"
**What:** Next to the 8-segment progress strip, add a short live line of text quantifying what's left in the current module — and consider showing the module's skill tally in big friendly numbers at the top of each module ("12 / 15 skills").
**Where:** `app.js` — `renderProgressStrip()` already computes per-module completion; add one text element + a style in `styles.css`.
**Inspired by:** Stripe typesets its key numbers huge because numbers persuade; Duolingo always shows exactly how close you are.
**Why students notice:** "3 left" is motivating in a way a partially-filled 24px segment isn't. Costs one sentence of screen space.

### 2d. ✅ DONE 2026-07-11 — Pause the mic and animation loops when the tab is hidden (mic shuts off + tuner closes on hidden tab; rAF loops die with the mic)
**What:** The tuner and coach run continuous listening loops. Confirmed neither `tuner.js` nor `coach.js` stops when the student switches tabs or locks the phone — add a listener that pauses them when the page is hidden and resumes on return.
**Where:** `tuner.js` (loop at line 292), `coach.js` (loops at lines 366/409/880/1289) — one `visibilitychange` handler each.
**Inspired by:** Stripe famously disables its expensive hero animation the instant it leaves the screen.
**Why students notice:** Longer Chromebook battery life, and the mic isn't secretly running while they're off in another tab — good privacy hygiene for a school tool.

### 2e. ✅ DONE 2026-07-11 — A small celebration when a module completes
**What:** When the last skill of a module is checked off, fire a brief one-time celebration: the module's segment on the strip pulses and a few music-note particles pop for about a second. Reserved for module completion only, and disabled under reduced-motion.
**Where:** `app.js` (the checklist-complete path that updates the strip) + ~30 lines of CSS keyframes.
**Inspired by:** Duolingo — celebrate real milestones with short, cheap motion; never decorate idle screens.
**Why students notice:** Finishing a module currently looks identical to checking any other box. A moment of fanfare makes the 8-segment strip something students *want* to fill.

### 2f. ✅ DONE 2026-07-11 — Badge skills with the song they unlock
**What:** Where a drill maps to one of the six core songs, show a small badge on the set header: "🎸 This is the *Seven Nation Army* riff." When the skill is checked off, echo it: "You can now play more of *Seven Nation Army*."
**Where:** A small optional field per set in the `module-N.js` files + rendering in `buildSet()` in `app.js` + one pill style.
**Inspired by:** Ableton anchors every abstract lesson to a real song ("We Will Rock You") — and reviewers say the *thread* across lessons is what they wish Ableton had. Our six core songs already are that thread; this just makes it visible.
**Why students notice:** Progress reads as "I can play more of a real song," which is why they signed up. This is the highest motivation-per-effort idea on the list.

---

## 3. Bigger ideas — worth a dedicated session each

### 3a. A real text-size and spacing system
**What:** The stylesheet currently has **234 font-size declarations, all in pixels, zero in rem** — including oddballs like 12.5px and 15.5px. Pixel sizes ignore the "make text bigger" setting on phones and Chromebooks, which some students genuinely need. The fix: define ~6 named text sizes and ~6 named spacing steps as variables (in rem, headings scaling fluidly between phone and laptop), then sweep the whole stylesheet onto them. Tedious but mechanical; no visual redesign required — most sizes just snap to the nearest step.
**Where:** `styles.css`, top-to-bottom sweep; the token block goes in `:root` (line 4).
**Inspired by:** Stripe — hierarchy from a small disciplined scale, not dozens of one-off sizes.
**Why students notice:** Students who bump up their device's text size finally get bigger text here too (an accessibility win), and the whole site gets subtly more consistent. Also makes every future change easier.

### 3b. A practice streak with a weekly safety net
**What:** Track "days practiced" (a set completed, or a tuner/coach session, counts) in the existing Firestore progress record, and show a small flame + day count in the header. Crucially, include one automatic free pass per week so one busy school night doesn't erase a month — that forgiveness is what keeps it motivating instead of punishing.
**Where:** `app.js` (progress save already writes to Firestore — add a field), header markup in `index.html`, styles in `styles.css`; localStorage fallback for dev-bypass mode.
**Inspired by:** Duolingo — streaks are their strongest retention tool, and the "streak freeze" measurably kept discouraged users from quitting.
**Why students notice:** Between-class practice is the whole ballgame for a guitar class, and this is the single best-proven nudge for it. Needs a real design conversation first (what counts as "practiced"? does the teacher dashboard show streaks?).

### 3c. "One thing per screen" pass on the set pages
**What:** Set pages are long scrolls where instructions, videos, and drills compete. Restructure so each skill leads with the *thing you do* — the tab player, the "Check me" coach button, the chord diagram — with explanation text trimmed to 1–3 sentences and any background prose collapsed behind a tap-to-expand. No new tech; it's markup discipline in the builders plus edits to wordy steps in the module files.
**Where:** `app.js` (`buildSet` / `buildStations`), content trims across `module-1.js`–`module-8.js`.
**Inspired by:** Ableton — one instructional sentence, then a big interactive widget; you're making sound within seconds of arriving. Their minimalism is the whole reason total beginners don't bounce.
**Why students notice:** A student with 4 minutes and a guitar on their lap gets to the *doing* immediately, on a phone screen, without reading past a wall of text. Biggest payoff of anything here, and the biggest job — it touches every module.

### 3d. A beat cursor for strum patterns and play-alongs
**What:** During any "play along" moment, animate a small cursor stepping across the strum-pattern or TAB in time with the audio, and flash each beat as it sounds — the moving thing is always the thing making noise, and nothing else on the page moves.
**Where:** `app.js` (`renderTabBlock` already plays notes — extend Play-All to highlight the current column), the strum-line rendering, CSS transforms only.
**Inspired by:** Ableton — their only animation is the playhead sweeping the grid, perfectly synced to sound. It teaches rhythm without a word of text.
**Why students notice:** "Where am I in the pattern?" is *the* beginner strumming problem. A cursor answers it visually every rep, and it trains students that movement on this site means "listen now."

---

## Suggested order

1. **1a (dark-mode purple)** — most visible bug, one afternoon.
2. **1b–1d** together — motion, tap targets, contrast: one accessibility afternoon.
3. **2a + 2b** — success moments for tuner and coach, since the coach just shipped.
4. **2f (song badges)** — best motivation return for the effort.
5. Then pick one bigger session: **3c** if the priority is learning flow, **3b** if it's practice habits, **3a** if it's long-term maintainability.

Everything above is plain CSS/HTML/JS — no build step, no libraries, nothing that breaks offline mode. The service-worker version bump is automatic via `node tools/checks.mjs`, so shipping any of these follows the normal push routine.
