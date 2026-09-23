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

## Hand-composed — no recipe, do not regenerate

These share the 640 × 244 canvas but the CLI cannot produce them. Edit by hand,
and if `guitar-diagrams.js` changes weight again, check them by eye against a
regenerated neighbour.

- `m1-string-names-en.svg`, `m1-string-names-es.svg` — not a fretboard at all: six
  vertical strings with the "Eddie Ate Dynamite Good Bye Eddie" mnemonic and a
  thickest→thinnest caption. Only the canvas size is shared.
