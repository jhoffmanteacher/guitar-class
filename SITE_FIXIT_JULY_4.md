# SITE_FIXIT_JULY_4 — Audit-driven improvements

**Source:** Fresh external audit of `jhoffmanteacher/guitar-class` @ main, 2026-07-09
(cache fingerprint at audit time: `guitar-class-2026-07-09-b71b6ca57a`).
**Run sessions in order, one at a time** — Sessions 1 and 3 both touch `sw.js`-adjacent
files and every session ends with a push, so parallel runs will conflict.
**Model:** Sonnet is fine for all five sessions.

## Global guardrails (every session)
- Never modify `id:` or `skills:` fields in any `module-N.js` (Firebase progress is keyed to them).
- If a `skills:` array ever changes, `skillCount` in `MODULE_MANIFEST` (config-main.js) must change with it.
- Never hand-edit `CACHE_VERSION` in `sw.js` — run `node tools/checks.mjs` before every push and let it re-fingerprint.
- Never write a YouTube ID from memory; verify via oEmbed (`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<ID>&format=json` → expect HTTP 200).
- Notable student-facing changes get a dated entry at the top of `CHANGELOG.md`, plain English, student's point of view.
- After each session: `node tools/checks.mjs` → commit → push → confirm.

## What the audit found clean (do NOT "fix" these)
- Zero `#layer-N` anchors in Song Journey links; zero `handoutUrl` fields.
- No looper code remains; `backingKey` fields present in `module-4.js` — working as intended.
- All six `tabs/*.html` pages have all five layer sections.
- All `<img>` tags have `alt` text; no `console.log`/`TODO` in shipped JS.

---

## Session 1 — Pre-cache Song Journey pages (sw.js)

*Why:* `sw.js` ASSETS pre-caches the shell and all eight module files, but not the six
`tabs/*.html` Song Journey pages. A student who installed the PWA and drops offline
before ever opening a Journey page hits a dead link — exactly the weak-Wi-Fi case the
PWA exists for. (The runtime stale-while-revalidate does cache them *after* first
visit; this fix covers the first-visit-offline case.)

*Do:* In `sw.js`, append to the `ASSETS` array:
```
  './tabs/all-along-the-watchtower.html',
  './tabs/let-it-be.html',
  './tabs/luna.html',
  './tabs/seven-nation-army.html',
  './tabs/sweet-child-o-mine.html',
  './tabs/the-cure.html'
```
Also update the comment block at the top of `sw.js` that lists "every cached file" so
it mentions `tabs/*.html`. If the Journey pages reference `styles.css` or any shared
asset by a *relative* path like `../styles.css`, add that exact URL form to ASSETS too
(cache matching is URL-exact) — check one page's `<head>` first.

*Verify:* Serve locally, hard-reload, DevTools → Application → Cache Storage: the six
tabs pages appear under the new cache version. Toggle "Offline" and load
`tabs/luna.html` directly — it renders.

*Guardrails:* Touch nothing else in `sw.js`. `checks.mjs` handles the version bump.
Changelog entry: yes — "Song Journey pages now work offline, even on flaky Wi-Fi."

---

## Session 2 — Friendly 404 page

*Why:* GitHub Pages currently serves its generic 404. Two tab URLs
(`tabs/just-like-heaven.html`, `tabs/tu-boda.html`) 404 by design, and students with
stale bookmarks or typos get dumped on a GitHub-branded dead end.

*Do:* Create `404.html` at repo root (GitHub Pages picks this filename up
automatically). Match the site's look: link `styles.css`, reuse the header style from
`index.html`, `lang="en"`, viewport meta. Content: guitar emoji, "That page isn't here
— but your guitar class is," one big button back to `./index.html`, and a small line
"Looking for a song? All six Song Journeys are on the home page." Keep it dependency-
free: no Firebase, no app.js, no service-worker registration on this page.

*Verify:* Locally open `404.html` directly — renders styled, button works. After push,
hit `https://jhoffmanteacher.github.io/guitar-class/tabs/tu-boda.html` and confirm the
custom page appears (may take a minute for Pages to rebuild).

*Guardrails:* Do not add `404.html` to `sw.js` ASSETS (it should always come from the
network so Pages' status handling stays intact). Changelog: skip — students shouldn't
notice unless something's already wrong.

---

## Session 3 — Home-screen icons (iOS + manifest spec fix)

*Why:* `manifest.json` has a single SVG icon with `purpose: "any maskable"`. iOS
ignores the web manifest for home-screen icons entirely — students who "Add to Home
Screen" on an iPhone/iPad get a page-screenshot blob. And combining `any` and
`maskable` in one entry is against spec; maskable rendering can crop the art.

*Do:*
1. Generate PNG renders of `icon.svg` at 180×180 (`apple-touch-icon.png`), 192×192,
   and 512×512 (e.g. `npx svgexport` or `rsvg-convert`; any tool already available).
   For the maskable variants, re-render with the artwork scaled to ~80% inside a solid
   `#322b78` background square so nothing important sits in the crop zone.
2. Add to `index.html` `<head>`: `<link rel="apple-touch-icon" href="apple-touch-icon.png">`.
3. Rewrite `manifest.json` `icons` as separate entries: the SVG with `"purpose": "any"`,
   plus the 192 and 512 PNGs each listed twice — once `"purpose": "any"`, once
   `"purpose": "maskable"` (pointing at the padded variants).
4. Add the new PNG filenames to `sw.js` ASSETS.

*Verify:* `npx pwa-asset-checker` or manual: Lighthouse PWA audit shows no icon
warnings; on an iPhone, Add to Home Screen shows the guitar icon. Confirm PNGs are
reasonably small (<30 KB each).

*Guardrails:* Don't change `theme_color`/`background_color`. `checks.mjs` before push.
Changelog: yes — "Adding the site to your phone's home screen now gives you a proper
guitar icon (including on iPhones)."

---

## Session 4 — Accessibility pass (targeted, not a rewrite)

*Why:* Audit found aria usage is thin (16 attributes in all of `index.html`) while the
app is heavily interactive. The inline `onclick` handlers are almost all on real
`<button>` elements (keyboard-fine), so do NOT blanket-refactor them — focus on the
genuine gaps below.

*Do — a checklist, fix only what's actually missing:*
1. **Interactive non-buttons:** grep `index.html` and the render code in `app.js` for
   `onclick` on `<div>`, `<span>`, `<a href="#">`, or list items. For each, either
   convert to `<button>` or add `role="button"`, `tabindex="0"`, and a keydown handler
   for Enter/Space. (The `welcome-overlay` div's backdrop-click dismiss is fine as-is —
   it already has a real close button.)
2. **Skill checkboxes / progress toggles:** confirm each toggle is a native
   `<input type="checkbox">` or `<button aria-pressed>`; if state is conveyed only by a
   CSS class, add `aria-pressed` or `aria-checked` sync in the toggle function.
3. **Popups (metronome, tuner, etc.):** each popup container gets `role="dialog"` and
   `aria-label`; Escape should close whichever popup is open (one shared keydown
   listener is enough). The welcome overlay already models this pattern — copy it.
4. **Focus visibility:** in `styles.css`, ensure `:focus-visible` has a clearly visible
   outline on buttons and links (don't rely on `outline: none` anywhere).
5. **Live regions:** if the tuner or progress-save shows status text ("Saved ✓"), wrap
   it in `aria-live="polite"`.
6. **Landmark sanity:** one `<main>`, header nav in `<nav>`, exactly one `<h1>` per
   page (check the six tabs pages too — audit shows they each have an `<h1>`, good).

*Verify:* Keyboard-only walkthrough: Tab through the whole home page, open/close each
popup, toggle one skill, open a Song Journey — no mouse. Then run Lighthouse
accessibility on `index.html` and one tabs page; record before/after scores in the
commit message.

*Guardrails:* No visual redesign; no renaming of functions other code calls; zero
changes to module data files. Changelog: yes if anything student-visible changed
(focus rings count) — "Easier to use with a keyboard and screen reader."

---

## Session 5 — Module 1 Challenge drills (CONTENT — needs Jonathan's sign-off first)

*Why:* Modules 2–8 all carry "Challenge —" drills in the practice-station sets;
Module 1 has zero, even though it has a set literally titled "Practice station —
Challenges." First-module students never see the house drill format they'll live in
for the rest of the semester.

*⚠️ Gate:* The three drill texts below are **drafts**. Jonathan approves or edits the
exact wording in chat **before** this session runs. Paste the approved text verbatim.

*Draft texts (module-2 house style):*
1. `Challenge — Tuner Race: tune all six strings from slightly detuned to green using the site tuner, saying each string name out loud as you land it (E–A–D–G–B–E). You've got it when: all six strings read in tune in under three minutes, twice in a row.`
2. `Challenge — Open-String Melody, eyes up: play the open-string warm-up melody watching the wall, not your hands, one clean note per click at 60 BPM. You've got it when: the whole melody with no buzzed or skipped notes, eyes off the guitar the entire time.`
3. `Challenge — Seven Nation Army, first look: the riff you previewed lives on one string. Find its first two notes by ear on the low E string and play them back four times, steady. You've got it when: a partner can name the song from just your two notes.`

*Do (after sign-off):* Insert the three drills into the appropriate Set 2 practice-
station steps in `module-1.js` as `text:` content in existing step structures —
**adding steps is fine; do not add, remove, or rename any `skills:` entries or `id:`
values.** Match surrounding formatting exactly (HTML entities, link style). If a drill
naturally pairs with an existing `gotItWhen`, leave the existing skill untouched and
put the drill in the step text only.

*Verify:* `node tools/checks.mjs` passes with **no** `skillCount` complaints (proof no
skills changed). Load Module 1 locally; drills render with the same styling as
Module 2's challenges.

*Guardrails:* This is the only session that touches a module file. Changelog: yes —
"Module 1 now has practice challenges just like the later modules."

---

## Footnote — cross-artifact check (no site change)
The site's Latin core song is **"Luna" (Peso Pluma, Junior H)** across all layers, with
**Oye Mi Amor (Maná)** as a Choice song in Modules 6–7. Confirm the semester map and
rubric examples name the same songs in the same roles; if any artifact still lists Oye
Mi Amor as the Latin *core*, reconcile there — not here.
