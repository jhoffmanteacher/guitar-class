# How the generated figures in `img/` were made

Every SVG listed here is **pure `tools/guitar-diagrams-cli.mjs` output** — no
hand-editing after the fact. Each was proved reproducible byte-for-byte against
its committed file before WO8 changed the renderer's weight, then regenerated
from the recipe below.

Run from the repo root. Rerun the whole list any time `guitar-diagrams.js`
changes how a board is drawn, so the static figures never drift from the live
ones sitting next to them on the same card:

```
node tools/guitar-diagrams-cli.mjs <recipe> --theme web -o img/<file>.svg
```

Always write with `-o`. Piping stdout to a file appends a trailing newline the
committed files don't have.

## Recipes

| File | Command |
|---|---|
| `m2-low-e-naturals.svg` | `naturals lowE 12` |
| `m2-a-naturals.svg` | `naturals A 12` |
| `m4-d-naturals.svg` | `naturals D 10` |
| `m4-g-naturals.svg` | `naturals G 10` |
| `m9-b-naturals.svg` | `naturals B 12` |
| `m9-d-naturals.svg` | `naturals D 12` |
| `m9-g-naturals.svg` | `naturals G 12` |
| `m9-high-e-naturals.svg` | `naturals highE 12` |
| `ca-hb-low-e.svg` | `notes lowE "0:E,2:F#,4:G#,5:A"` |
| `ca-hb-low-e-all.svg` | `notes lowE "0:E,2:F#,4:G#,5:A,7:B,9:C#,10:D,12:E"` |
| `ca-hb-low-e-full.svg` | `notes lowE "0:E,2:F#,4:G#,5:A,7:B"` |
| `ca-hb-a.svg` | `notes A "0:A,2:B,4:C#,5:D,7:E"` |
| `ca-hb-fingers.svg` | `notes lowE "2:1,4:3,5:4"` |
| `ca-hb-fingers-a.svg` | `notes A "2:1,4:3,5:4"` |
| `ca-fg-dots.svg` | `notes lowE "5:A,7:B,9:C#,12:E"` |
| `ca-fg-gym-zone.svg` | `notes lowE "1:F,2:F#,3:G,4:G#,5:A"` |
| `ca-sna-riff-map.svg` | `notes A "2:B,3:C,5:D,7:E,10:G"` |

The `ca-hb-fingers*` boards pass **finger numbers** where the other boards pass
note names — the renderer draws whatever label the list gives it, so `2:1` means
"circle fret 2, print `1` in it."

## Hand-composed — no recipe, do not regenerate

These share the 640 × 244 canvas but the CLI cannot produce them. Edit by hand,
and if `guitar-diagrams.js` changes weight again, check them by eye against a
regenerated neighbour.

- `m1-string-names-en.svg`, `m1-string-names-es.svg` — not a fretboard at all: six
  vertical strings with the "Eddie Ate Dynamite Good Bye Eddie" mnemonic and a
  thickest→thinnest caption. Only the canvas size is shared.
- `ca-fg-gym-zone-skip.svg` — a note board with **three** strings highlighted at
  once and no circled notes, plus extra shading rects. The renderer highlights
  exactly one string.
