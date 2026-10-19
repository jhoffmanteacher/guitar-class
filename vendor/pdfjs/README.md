# pdf.js 3.11.174 (vendored)

Mozilla's PDF renderer, copied unchanged from the `pdfjs-dist@3.11.174`
npm package (`build/pdf.min.js`, `build/pdf.worker.min.js`, `LICENSE`).
Apache-2.0 — see LICENSE.

Why it is here and not on a CDN: the site's Content-Security-Policy
(`index.html`) only runs scripts from its own origin, Google and Firebase.

Who loads it: `pcSheetLoadPdfjs()` in `app.js`, only when a practice card
with `card.sheet` (a chord sheet PDF in `sheets/`) is on screen. Nothing
else on the site loads it.
