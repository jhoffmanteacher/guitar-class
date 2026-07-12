# Visual design suggestions — analysis + execution plan

*Written 2026-07-12 from a live-site review (desktop, light mode) plus a full read of
`styles.css`. Each task below is self-contained: it names the files, selectors, and
exact values to change, plus how to verify. Tasks are ordered by impact — implement
top-down, or cherry-pick. T1–T4 are the core pass; T5–T6 are polish; T7–T8 are
optional flavor.*

## Ground rules for the executor

- **No build step.** Plain CSS in `styles.css`; tokens live in `:root` (line ~7) with a
  dark-mode override block right below (`@media(prefers-color-scheme:dark)`). **Every
  new color needs a dark-mode pair.**
- **Don't touch `module-N.js` content** — this is a styling pass only. `index.html`
  edits only where a task says so.
- **Print styles** (`@media print` in `styles.css`) hide most chrome; after changes,
  check print preview of a set still looks clean.
- Before any push: `node tools/checks.mjs` (auto-bumps the service-worker cache
  version — never bump `sw.js` by hand). If a task adds a font file, add it to the
  shell list in `sw.js` so it works offline; checks.mjs re-fingerprints automatically.
- Verify with Live Server + the **Dev bypass** button on the auth wall. Check dark
  mode via DevTools → Rendering → emulate `prefers-color-scheme: dark`.
- This is a student-facing visual change → add one plain-English `CHANGELOG.md` entry
  in the same push.

## Where the design is today (audit)

**What's working — don't undo it:**
- Cohesive warm token system: cream page (`--bg2 #faf9f5`), ivory rail
  (`--rail-bg #f4f2eb`), plum header (`--brand #514a7d`), soft 10px radii, restrained
  shadows. The recent "calmer claude.ai-style" redesign reads as intended.
- A real functional color system: blue = Station B, green = Station C / success,
  amber = checklist / working-on-it, purple = review + navigation. Students likely
  rely on it — **preserve the meaning of each hue.**
- Good bones: capped line length (70–78ch), tabular numerals, `:focus-visible`
  everywhere, dark mode, reduced-motion support, print stylesheet.
- The hand-drawn posture illustrations and dotted song-name underlines give it a
  friendly workbook charm.

**The gaps (each maps to a task):**
1. **Typographic flatness.** One family (system sans) at one voice; almost every size
   sits between 0.81–1.06rem. The set title (`.obj-card.set-head .obj-main`) is
   1.25rem — barely above body. Nothing on the page says "title." → T1
2. **Pill soup.** Status tags, metadata chips, and clickable buttons all render as the
   same small bordered pill at the same visual volume (song rows stack Original +
   Tutorial + Song Journey + Core tag + dotted underline + colored chord links).
   Nothing recedes. → T2
3. **The plum brand color stops at the header.** Inside the content column the
   "primary action" role is played by blue tints, green fills, and one off-palette
   saturated blue gradient (`.tab-head`). The brand never re-appears. → T3
4. **Left-weighted wide screens.** `.main` is capped at 800px and hugs the rail; on a
   1400px+ display the right third is empty except the floating tool buttons. → T4
5. **Three different-colored floating tool pills** (blue/green/purple) in the corner
   fight the calm redesign. → T5
6. **Filled section bars.** The numbered step-group headers (`.sc-sec-head`, gray
   filled bar; green fill when open) are the heaviest shapes on the page — heavier
   than the card titles above them. → T6
7. The **Games screen** is deliberately its own arcade world (good call — keep it),
   but its 8 card top-bar gradients are arbitrary rainbow hues unrelated to the site
   palette. → T7 (optional)
8. The sketch/hand-drawn charm is isolated to step figures. → T8 (optional)

**Direction in one sentence:** keep the warm, calm foundation; let *typography and
whitespace* carry hierarchy instead of pills and fills; and let the plum brand thread
through the whole app instead of stopping at the header.

---

## T1 — Give headings a voice (display serif)

**Why:** the single biggest personality gain per line of CSS. A warm serif for titles
against the system-sans body matches the claude.ai-adjacent feel the site already aims
for.

**How:**
1. Self-host one variable-weight serif woff2 (recommended: **Fraunces** — warm,
   slightly quirky, free/OFL; alternative: Source Serif 4). Students are on
   Chromebooks, so don't rely on Georgia/Palatino being installed, and don't use a
   CDN (offline PWA). Put the file at `fonts/fraunces.woff2` (subset to
   latin, weights 500–700, ~40–60 KB).
2. In `styles.css` add at the top:
   ```css
   @font-face{font-family:'Fraunces';src:url('fonts/fraunces.woff2') format('woff2');
     font-weight:400 700;font-display:swap}
   :root{--font-display:'Fraunces',ui-serif,Georgia,serif}
   ```
3. Apply to major headings only (body text stays system sans):
   - `.header-title` — keep 1.375rem, add `font-family:var(--font-display)`
   - `.obj-card.set-head .obj-main` — bump `1.25rem → 1.5rem`, `line-height:1.3`,
     `font-family:var(--font-display)`; keep the existing 420px media override
     proportional (1.125 → 1.25rem)
   - `.welcome-card h2`, `.auth-wall h2`, `.t-title` (teacher dashboard)
   - Do **not** apply to `.games-logo` (the letterspaced arcade sans is right for it),
     step text, or any UI控件 labels.
4. Add `fonts/fraunces.woff2` to the cached shell list in `sw.js`.

**Check:** set titles clearly outrank section bars; no FOUT jank on reload; offline
reload still renders the font.

## T2 — Quiet the chrome: a 3-tier badge/pill system

**Why:** today every small element is a bordered pill. Encode one rule, then sweep:

- **Tier 1 — interactive chip** (clickable): border + background tint. Keeps current look.
- **Tier 2 — status tag** (Core/Choice, SET 1, level pills): background tint only,
  **no border**.
- **Tier 3 — metadata** (Layer 3 of 5, "· 2/6" fractions, video source): plain text in
  `--text2`, no pill at all.

**Sweep list in `styles.css`:**
- `.st-layer` (the green "Layer 3 of 5" chips in the set header): drop the border and
  the pill → `background:transparent;border:none;padding:0;color:var(--text2);
  font-weight:600` and render as plain `Layer 3 of 5` text. (Tier 3 — it's pure
  metadata and appears twice per set header.)
- `.stag` / `.stag-core` (Core/Choice on song rows): remove border look — they already
  have none; instead reduce competition by making `.stag` (non-core) text-only:
  `background:transparent;padding:2px 0`. Keep `.stag-core` tinted (Tier 2).
- `.song-vid-btn` (Original / Tutorial buttons): make ghost until hover —
  `background:transparent;border-color:transparent;color:var(--text2)`; on hover
  restore current bordered look. Keep the ▶ glyph so they still read as playable.
  Leave the **Song Journey** button exactly as is — it's the featured action of the
  row and should now stand alone.
- `.skill-badge`, `.vrec`: Tier 2 (drop borders, keep tint).
- `.obj-card.set-head .obj-set-tag` ("SET 1"): already tint-only — no change; it
  becomes the model for Tier 2.

**Check:** the Songs panel — each row should now have *one* obviously-featured button
(Song Journey), quiet ghost video links, and a readable name. Verify dark mode: the
ghost buttons must still be visible (`--text2` on `--bg`).

## T3 — Thread the plum brand through the app

**Why:** `--brand #514a7d` exists only in the header and skip-link. Everything that
means "primary / go forward" should share one color, and it should be the brand.

**How, in `styles.css`:**
1. New tokens (with dark pair):
   ```css
   :root{--brand-text:#fff;--brand-hover:#5d5590}
   @media(prefers-color-scheme:dark){:root{--brand-hover:#544d80}}
   ```
2. Primary buttons → solid plum: `.panel-next-btn` (the "Next: Station C →" button),
   `.welcome-go`, `.mr-rec-btn.primary`:
   `background:var(--brand);color:var(--brand-text);border-color:var(--brand)`;
   hover `background:var(--brand-hover)`. They already have the Duolingo-style press
   shadow (line ~993) — keep it, it works with a solid fill.
   Leave `.coach-start` green — in the coach context green = "mic go" and matches the
   coach card border.
3. `.tab-head` (TAB diagram header): replace the off-palette
   `linear-gradient(90deg,#185fa5,#1f78ce)` with solid `var(--brand)`. The white text
   and kind-chip already work on plum.
4. Optional nudge (do last, eyeball it): `--purple-accent #534ab7` is close to but not
   the brand; try `#5b52a8` so rail active states and plum header feel like one family.
   If it muddies the review-pill states, revert just this.

**Check:** one screen should never show two different "primary" colors; the Next
button, welcome CTA, and header now visibly belong to the same brand.

## T4 — Balance wide screens

**Why:** content hugs the rail, leaving a dead right third on desktop.

**How:** in `styles.css`, after the `.app-layout .main` rule:
```css
@media(min-width:1240px){.app-layout .main{margin:0 auto}}
```
The 800px cap already guarantees the floating tools never overlap (see the comment at
line ~406); centering preserves that. Below 1240px behavior is unchanged.

**Check:** at 1400px+ the column sits centered between rail and tools; at 1000px it
still sits by the rail; no overlap with the Tuner/Timer/Metronome stack at any width.

## T5 — Unify the floating tool buttons

**Why:** three different-colored pills (blue/green/purple) are the loudest thing on an
otherwise calm page, and color there carries no meaning (it's not the station coding).

**How:** one neutral pill, color only in the icon:
```css
.fab{background:var(--bg);border-color:var(--border2);color:var(--text)}
.fab:hover{background:var(--bg3);opacity:1}
.fab-metro svg{color:var(--blue-text)}
.fab-timer svg{color:var(--green-text)}
.fab-tune svg{color:var(--purple-accent)}
```
Remove the per-FAB background/border rules (`.fab-metro`, `.fab-timer`, `.fab-tune`
keep only their svg color line). Keep the `.fab-timer-done` pulse animation — it
intentionally goes green when the timer finishes.

**Check:** corner stack reads as one quiet tool group; timer-done flash still pops.

## T6 — Flatten the step-group section bars

**Why:** the numbered group headers ("1 · See the power chord shape move") are solid
filled bars — visually heavier than the card titles above them, and heavier than the
flat rail aesthetic.

**How:** in `styles.css` on `.sc-sec-head`:
- Closed: `background:transparent;border-bottom:1px solid var(--border);
  border-radius:0;padding:11px 4px` — hover `background:var(--bg2)`.
- Open (`.sc-sec.open .sc-sec-head`): `background:transparent;color:var(--green-text)`
  — the green number circle (`.sc-sec-num`) and chevron already carry the state.
- Give `.sc-sec-body` a touch more top padding (8px) since the bar no longer boxes it.

**Check:** Station B and Station C group lists read as a flat outline, like the rail;
open/closed state is still obvious at a glance; print preview unchanged (print already
force-expands the bodies).

## T7 (optional) — Tie the arcade to the family

Keep the Games screen's separate deep-indigo arcade identity — it's a feature, not a
bug. Two small alignments in `styles.css`:
- The card top-bars (`.games-card.gc-*::before`) use 8 unrelated gradients. Rebuild
  them all from the site's own hues so the hub feels like "the same school, after
  dark": derive each gradient's endpoints from `--blue-text`, `--green-text`,
  `--amber-text`, `--purple-accent`, plus at most one pink extension for variety.
- `.games-screen` gradient: shift the middle stop `#3b2a78` slightly toward the brand
  (`#463b78`) so the shell reads as "plum at night."

**Check:** hub still feels fun and distinct from the practice app, but a screenshot of
both side-by-side looks like one product.

## T8 (optional flavor) — Own the hand-drawn thread

The sketch illustrations are the site's most distinctive asset. One or two touches,
no more:
- A small hand-drawn-style underline squiggle (inline SVG, `--text3` stroke) under the
  rail's "MODULE" label or the "SONG JOURNEY" label — echoes the illustration style.
- If `icon.svg` works in white, place it at 20px before `.header-title` for a mark.
Keep it to those; more would tip into clutter the other tasks just removed.

---

## Suggested execution order & scope

| Pass | Tasks | Feel of the change |
|---|---|---|
| Core (one session) | T1, T2, T3, T4 | "Same site, suddenly grown-up" |
| Polish | T5, T6 | Calmer edges everywhere |
| Flavor (taste call) | T7, T8 | Personality, optional |

After each pass: Live Server + Dev bypass, light **and** dark mode, one print preview,
narrow-window check (~760px where the rail stacks), then `node tools/checks.mjs`
before any push.
