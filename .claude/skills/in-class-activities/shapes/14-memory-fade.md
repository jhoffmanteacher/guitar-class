## 14. Memory fade

**For:** playing a part from memory (`app/fade.js`; its header is the rules). A chord-grid practice card plays its
sections with the record on a loop; each time through more chord names go blank (frets too), until the last shows none.
"Show it" brings them back for that time through. Nothing is saved.

**Skeleton** (from `ca-56`):
```js
{
  id: 'ca-57', view: 'card',
  title: '… — Memory Fade', title_es: '… — De memoria',
  intro: 'Play the verse and chorus four times as the chord names fade, until you know them by heart.', intro_es: '…',
  card: {
    track: 'sweet-child-o-mine',         // per song
    chordGrid: true, slowest: true,      // required: the fade works on a chord grid
    fade: { passes: 4 },                 // 2 to 8 times through
    caption: '…', caption_es: '…',       // names no chord
    sections: null,                      // another card's sections, joined by label after the array, own captions
    checks: [ { label: 'From memory', … }, { levelUp: true, card: 'ca-33', … } ]
  },
  steps: [],
}
```

**One time through** is every section in order, all their laps, so the card draws no section buttons and no Loop
switches (Jonathan, 2026-11-26: "verse into chorus"). Sections must follow each other on the record.

**Ask Jonathan:** the song, which sections in order, how many times through.

**Traps:**
- No caption, intro or title may name a chord (the card is hiding them).
- **1fm** pins `card.fade` to `ca-56` (`FM_CARDS`), which chord changes are blank each time (`FM_PLAN`) and the
  assertion count; `tools/playalong-loop.mjs` R18 walks it. A second fade card widens that pin in the same commit.

**Tools:** `node tools/playalong-loop.mjs --only <id>` and the common ones.
