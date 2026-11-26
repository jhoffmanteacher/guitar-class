---
paths:
  - "sw.js"
  - "app/start.js"
  - "app/boot.js"
  - "index.html"
  - "teacher-core.js"
  - "tools/sw-audio-map.mjs"
  - "tools/kill-switch/**"
---

## The service worker, load order and the kill switch

Moved from CLAUDE.md (2026-11-26). `sw.js` code is a danger zone (CLAUDE.md "Triggers"); its version lines and
`AUDIO_HASHES` block are written by `checks.mjs`, never by hand.

- **A change to load order, a loader, the `index.html` script tags or the `sw.js` lists:** also `node
  tools/slow-load.mjs` (a headless-browser run: it counts toward the two at a time).
- **A change to `sw.js`, the service-worker block in `app/start.js`, `swResume*` in `app/boot.js` or `teacherResume*`
  in `teacher-core.js`:** also `node tools/update-reload-loop.mjs` (headless Chrome, about 16 minutes, at most two
  browser runs at a time; every case passes, 29 of 29).
- **A change to `sw.js`, the service-worker block in `app/start.js`, `swResume*`, or the audio cache names in
  `tools/sw-audio-map.mjs`:** also `node tools/kill-switch/proof.mjs` (Node, about 1 s; it must end "14 of 14 mutations
  caught"). `tools/kill-switch/kill-sw.js` is never loaded by the site and goes in no list.
- `tools/sw-upgrade-proof.mjs` proved the one-time move from `app.js` to the parts; it needs a pre-cut checkout as
  `--old` and is kept as the record.
- A new app or arcade part goes in the `sw.js` lists; a console part stays out (CLAUDE.md "Where the code lives").
