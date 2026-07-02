# Guitar Class Site — Improvement Plan

> Generated 2026-06-11 from a full review of the live site and repo
> (`index.html`, `app.js`, `styles.css`, `config-main.js`, `module-1.js`–`module-8.js`).
>
> **Already in good shape (no action needed):** CSS/JS split into `styles.css` + `app.js`,
> all scripts load with `defer` in the correct order, content is cleanly separated into
> per-module files, HTML-escaping helpers (`escAttr`/`escHtml`) exist and are used in most
> render paths, dark mode via `prefers-color-scheme`, and every module has `gotItWhen`
> descriptors. Nice work — the foundation is solid.

---

# SECTION 1 — CODE CHANGES (for Claude Code)

Ordered roughly by impact. Each item is scoped so it can be a single Claude Code session
ending in a Live Server test + push.

## 1.1 🔒 Hide the "Dev bypass" button in production — HIGH PRIORITY ✅ DONE (June 2026)
**Files:** `index.html` (~line 67), `app.js` (`devBypass()`, ~line 21)

Right now **anyone visiting the live site can click "Dev bypass" and enter the app
without signing in** — it's visible on the public auth wall. Student data is still
protected by Firestore rules, but the entire course content is exposed and it looks
unprofessional to students/parents.

- Keep the bypass for local testing, but only show/allow it when the site is running
  locally: in `app.js`, check `['localhost','127.0.0.1'].includes(location.hostname)`.
- Hide the button by default in `index.html` (`style="display:none"`, give it an `id`)
  and have `app.js` un-hide it only on localhost.
- Also make `devBypass()` itself refuse to run off-localhost (belt and suspenders).
- Test: Live Server → button appears and works; GitHub Pages → button gone.

## 1.2 ♿ Accessibility pass (Chromebook keyboard + screen reader) — HIGH PRIORITY ✅ DONE (June 2026)
**Files:** `index.html`, `app.js`, `styles.css`
(This absorbs item 2 of the existing `TODO.md` health pass.)

Current state: **zero `aria-label`s in `index.html`**, and the three floating tool
buttons (Tuner / Timer / Metronome) are clickable `<div class="fab">` elements — they
can't be reached with Tab or activated with Enter/Space.

- Convert the three `.fab` divs (`index.html` ~lines 143–155) to `<button type="button">`
  and adjust `.fab` CSS so buttons render identically (reset border/background/font).
- Add `aria-label`s to icon-only controls: the three `✕` popup close buttons, the
  resource-panel close button, the 🔊 note buttons and ▶ play-sequence buttons built in
  `app.js` (~lines 444, 480, 1131, 1574).
- Fix focus visibility: `styles.css:457` sets `.bpm-slider:focus{outline:none}` with no
  replacement, and lines 71/97/196/298 remove outlines (some have a border-color swap,
  which is too subtle). Add a consistent `:focus-visible` style site-wide, e.g.
  `outline:2px solid var(--blue-text); outline-offset:2px`.
- Contrast check: `--text3:#aaaaa3` on white (`--bg:#ffffff`) is ~2.1:1 — fails WCAG AA
  for any text use. Audit where `--text3` is used on text and darken it (≈`#767670`
  reaches 4.5:1) or reserve it for decorative elements only.
- Add a `role="dialog"` + `aria-modal` treatment (or at least Escape-to-close) to the
  tool popups, and make `resize-handle` keyboard-skippable.
- Test with keyboard only: Tab through header → module select → set pills → steps →
  tools; everything operable without a mouse.

## 1.3 🧹 Escape user-provided values in the header (XSS hardening) ✅ DONE (June 2026)
**File:** `app.js` (~lines 47–48, 2120, 2125)

`user.displayName`, `user.email`, and `user.photoURL` are interpolated into
`innerHTML` **without** `escHtml`/`escAttr`, e.g.:
`` `<img src="${user.photoURL}" …>` `` and `` `<span class="user-name">${user.displayName||user.email}</span>` ``.
Google account names can contain arbitrary characters. Low likelihood, but it's a
two-minute fix: wrap all three in the existing escape helpers everywhere the user
header is rendered (three call sites).

## 1.4 ⚡ Make the Google Translate script non-blocking ✅ DONE (June 2026)
**File:** `index.html` (~line 25)

The only remaining render-blocking script is
`<script src="//translate.google.com/translate_a/element.js?...">` in `<head>`.
On a slow school network this delays first paint until Google responds.
- Add `defer` (preferred over `async` here so `googleTranslateElementInit` is defined
  first and paint is never blocked), or move the tag to the end of `<body>`.
- While in there: change the protocol-relative `//translate.google.com` to
  `https://` (protocol-relative URLs are a legacy pattern).
- Test: page header paints immediately; Español toggle still works after load.

## 1.5 🔗 Dead YouTube link audit (~222 unique IDs)
**Files:** `module-1.js` … `module-8.js`
(This is item 3 of the existing `TODO.md` — kept here so this file is the single list.)

- Extract every YouTube ID across the eight module files.
- Verify each via the oEmbed endpoint
  (`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json`),
  batched in parallel WebFetch calls per the CLAUDE.md rule.
- Produce a report: ✅ valid / ❌ dead-or-private, with file + line for each dead one.
- Replace dead links via search-and-verify (never from memory); if no good replacement
  exists, remove the link and flag it in the report for Jonathan to choose a song.
- Suggested cadence: re-run at the start of each semester.

## 1.6 🏷️ Add favicon + meta tags ✅ DONE (June 2026)
**File:** `index.html`, plus a small `favicon.svg` (or `.png`)

The site currently has **no favicon and no meta description**, so browser tabs show a
blank globe and link previews are bare.
- Add a simple guitar-themed `favicon.svg` (an emoji-based SVG favicon is fine:
  `<link rel="icon" href="data:image/svg+xml,...🎸...">` — zero extra requests).
- Add `<meta name="description" content="Sequoia High School Beginning Guitar — independent practice and skills tracker.">`
- Add basic Open Graph tags (`og:title`, `og:description`) so the link looks right when
  shared in Google Classroom.
- Optional: a more descriptive `<title>` — "Guitar Class · Sequoia HS".

## 1.7 🧽 Clean up stale comments and add error states ✅ DONE (June 2026)
**Files:** `index.html`, `app.js`

- The big comment blocks at the top and bottom of `index.html` still say
  "edit config.js only" and "FILES: index.html + config.js + firebase-config.js" —
  that file structure no longer exists. Update them to reference `config-main.js`,
  the `module-N.js` files, and `app.js` (or just point to `CLAUDE.md`).
- `signIn()` reports failure with a raw `alert()`. Replace with a friendly inline
  message under the sign-in button ("Sign-in didn't work — make sure pop-ups are
  allowed and you're using your @seq.org account, then try again.").
- Add a visible failure state if Firebase scripts fail to load (school content
  filters occasionally block `gstatic.com`): if `window.firebase` is undefined when
  `app.js` runs, show "The sign-in service couldn't load on this network" instead of
  a silently broken page.

## 1.8 🛡️ Firebase hygiene (one-time console checks, Claude can guide) ✅ DONE (June 2026)
No code changes required, but worth a guided session:
- ✅ Confirmed Firestore rules in production match the rules in the `index.html` comment
  (per-student read/write on own doc; teacher read via `jhoffman@seq.org`). Already correct.
- ✅ Restricted the Firebase web API key (Application restrictions → Websites) to the
  `jhoffmanteacher.github.io/*` and `guitar-class-2fd21.firebaseapp.com/*` referrers.
  API restrictions left at "Don't restrict key". Sign-in re-tested on the live site — works.
- Firebase App Check — deferred (optional; revisit only if abuse shows up).

## 1.9 📱 Small UX polish (grab-bag, low priority) ✅ DONE (June 2026)
- Persist the last-selected module/set per student — already saved to Firestore
  (`lastModule`/`lastSet`); now also saves when only the module dropdown changes.
- The timer end "beep" now also flashes the timer display green so it's noticeable in
  a loud classroom with no headphones.
- The resource-panel `resize-handle` already supported touch; added `preventDefault`
  during a touch-drag so the page no longer scrolls while resizing on Chromebooks.

---

# SECTION 2 — CONTENT CHANGES (for Jonathan, over time)

No coding needed — these are edits to `module-N.js` text fields, Google Docs, or
decisions to make. Claude Code can do the typing once you decide the content.

## 2.1 Module 6 — upgrade to advanced strumming  *(carried over from TODO.md)*
Module 6 ("Strumming Patterns with Chords") sits late in the semester but covers basic
strumming. Decide the new scope, e.g.:
- [ ] Syncopated/16th-note patterns, dynamics (accents), percussive muting
- [ ] Which songs anchor each set (pick real songs; Claude will search-and-verify links)
- [ ] Whether basic strumming moves earlier (into Module 5 with open chords) or stays
      as a quick refresher set
- [ ] Updated `objective` / `skillFocus` / `gotItWhen` lines once scope is set

## 2.2 Handout audit (22 Google Docs links)
Every set links a `handoutUrl` Google Doc. Worth a periodic pass:
- [ ] Open each in an incognito window — confirm sharing is "Anyone at Sequoia Union
      HSD with the link can view" (or anyone-with-link), so students never hit a
      permission wall
- [ ] Check each handout still matches its set's current content (several sets have
      evolved since the docs were written)
- [ ] Optional: add a "Last updated" line at the top of each doc

## 2.3 Spanish-language experience
The 🌐 Español toggle uses Google Translate, which is machine-quality. For the highest-
value strings, consider hand-translating and noting where Google Translate falls short:
- [ ] Spot-check 2–3 sets in Spanish mode with a fluent speaker (or a student!) —
      music terms like "fret," "strum," "pick" often translate oddly
- [ ] Keep a list of bad translations; if it's short, Claude can add a small manual
      override dictionary later (that part would become a Section 1 task)

## 2.4 Reflection prompts and response variety
Modules 1–2 have rich `response:` prompts (short-answer + multiple choice); later
modules lean lighter. Over time:
- [ ] Add 1–2 listening/reflection responses per set in Modules 6–8 to match the
      Module 1–2 style (you write the prompt, Claude wires it in)
- [ ] Review multiple-choice distractors — a few are easy to guess without listening

## 2.5 End-of-semester and onboarding content
- [ ] Module 1 asks students to write a goal "we'll revisit at the end of the
      semester" — there's currently no end-of-semester set that does the revisit.
      Decide what that looks like (final reflection? performance rubric?)
- [ ] A short "Start here" intro for brand-new students (how to sign in, how the
      I've-got-it tracker works, headphone expectations at the computer station)

## 2.6 Song refresh cadence
- [ ] Once a semester, swap in 2–3 current songs students actually request (the link
      verification workflow in CLAUDE.md makes this safe) — keep a running list of
      student requests during class to pull from

---

# Suggested order of attack

| When | What |
|---|---|
| This week | 1.1 Dev bypass (security), 1.4 Translate script (5-min fix) |
| Next session | 1.2 Accessibility pass (biggest student-facing win) |
| Soon after | 1.5 Dead-link audit, 1.3 escaping, 1.6 favicon/meta |
| Background | 1.7–1.9 polish · Section 2 as classroom time allows |
