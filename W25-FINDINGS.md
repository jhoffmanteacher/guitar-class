# W25 findings so far (Windows, 2026-11-19) — not merged; notes for whoever picks it up

Trial branch: `ci-try/w25-diag` (diagnostic in `tools/smoke.mjs`: `w25Diag`, env `W25_REPEAT`, `W25_MODE`,
`W25_PLANT`, `W25_NOBFC`; `browser.yml` narrowed to 4 activities jobs). Never merge that branch.

## What happens
- On the reload, Chrome CANCELS the page's in-flight script requests (`net::ERR_ABORTED`, canceled) in one burst
  ~95-155 ms after the navigation commits; DOMContentLoaded/load fire right after. Only the scripts still in flight
  at that instant are lost (1 to 11, always the later ones), so each failure misses a different run of neighbouring
  parts and reports nothing but "X is not defined" later.
- The service worker, its cache and the server all hold the full files at that moment (status 200, full length).
- No page code causes it: `history.go/back/forward/pushState/replaceState` and `window.stop` were hooked in every
  document; none fired during the reload or in the 8 s before it. No second navigation in the timeline.
- The service worker does NOT stop: it stays `activated/running` through every abort. (A forced
  `ServiceWorker.stopAllWorkers` mid-load gives the same symptom on Windows, but it shows
  `stopping/stopped/starting` in the same status feed, which the GitHub failures never show.)

## Rates (GitHub ubuntu runners unless noted)
| Cycle before the reload | Reloads | Failed |
|---|---|---|
| Reloads in a row after the walk's first | 180 | 0 |
| Fresh first visit, wait 0-20 s | 200 | 0 |
| Worker stopped / 40 s idle before the reload | 130 | 0 |
| Fresh boot + chord-grid walk (warm HTTP cache) | 160 | 0 |
| Cold boot as walk() does it (+ cache cleared, `ensureCoachJs()`, 4 screens) + chord-grid walk | 4 rounds x 160 | 4, 13, 4 (3rd round pending) |
| Windows, any of the above, incl. 6x CPU throttle | ~100 | 0 |
Main: 4 of ~46 activities walks (11ff03f, f9bc655, 9cb56dd, a0f4047).

## Open
- Running at the time of writing: back/forward cache off (`--disable-features=BackForwardCache`) in 2 jobs vs on in
  2 jobs (run for commit 4689c3e on `ci-try/w25-diag`). If "off" drops to 0 and "on" still fails, the old page's
  bfcache handling cancels the new page's loads (a Chrome behaviour students could also meet on a reload).
- Not yet decided: site fix (a boot check that reloads once when a part never ran: load path, Always Reviewed with
  slow-load.mjs and update-reload-loop.mjs) or harness-only (the smoke names "part never ran" plainly and retries).
