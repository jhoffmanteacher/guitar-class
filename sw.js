/* ════════════════════════════════════════════════════════════════
   Guitar Class — Service Worker (light PWA, offline resilience)

   ⚠️  BUMP CACHE_VERSION ON EVERY PUSH that changes any cached file
       (index.html, styles.css, app.js, config-main.js, module-*.js,
        manifest.json, icon.svg, tabs/*.html). If you forget, returning
        students may keep getting the OLD site from their cache. See CLAUDE.md.

   Strategy: stale-while-revalidate for same-origin GET requests —
   serve the cached copy instantly (fast on weak school Wi-Fi), then
   refresh the cache in the background for next time. Cross-origin
   requests (Firebase, YouTube, Google Translate, gstatic) are NEVER
   intercepted — they always go straight to the network, so auth and
   progress-saving behave exactly as before.
   ════════════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'guitar-class-2026-08-01-f69efe7cb7';

// Backing-track audio lives in its OWN cache, versioned independently of the
// shell (see tools/checks.mjs, which fingerprints audio/ separately and
// bumps this only when a track's bytes actually change). CACHE_VERSION is a
// fingerprint of the shell + img/, which changes on nearly every push — if
// audio shared that cache, every deploy would purge every student's already-
// downloaded backing tracks (~200MB) for no reason, forcing a full
// re-download over school Wi-Fi. Splitting the version keeps a routine JS/
// content push from touching cached audio, while a real re-exported track
// still invalidates it (both versions are swept the same way at activate).
const AUDIO_CACHE_VERSION = 'guitar-class-audio-2026-07-27-d6169a1b0b';
const AUDIO_RE = /\.(mp3|m4a|wav|ogg)$/i;

// Static shell — everything needed to render the practice content offline.
const ASSETS = [
  './',
  './index.html',
  './404.html',
  './styles.css',
  './fonts/fraunces.woff2',
  './i18n.js',
  './guitar-diagrams.js',
  './class-activities.js',
  './app.js',
  './fab-tools.js',
  './tuner.js',
  './coach.js',
  './teacher.js',
  './config-main.js',
  './firebase-config.js',
  './manifest.json',
  './icon.svg',
  './apple-touch-icon.png',
  './icon-192.png',
  './icon-512.png',
  './icon-192-maskable.png',
  './icon-512-maskable.png',
  './img/posture-check.jpg',
  './img/ca-hb-low-e.svg',
  './img/ca-hb-a.svg',
  './img/m1-string-names-en.svg',
  './img/m1-string-names-es.svg',
  './img/m2-a-naturals.svg',
  './img/m2-alphabet-loop-en.svg',
  './img/m2-alphabet-loop-es.svg',
  './img/m2-arched-fingers-front.jpg',
  './img/m2-behind-the-fret-en.svg',
  './img/m2-behind-the-fret-es.svg',
  './img/m2-low-e-naturals.svg',
  './img/m2-one-finger-per-fret-en.svg',
  './img/m2-one-finger-per-fret-es.svg',
  './img/m2-tab-orientation-en.svg',
  './img/m2-tab-orientation-es.svg',
  './img/m2-thumb-hand-position.jpg',
  './img/m4-d-naturals.svg',
  './img/m4-g-naturals.svg',
  './img/m4-pentatonic-box1-en.svg',
  './img/m4-pentatonic-box1-es.svg',
  './img/m7-barre-hand-front.jpg',
  './img/m8-pima-map-en.svg',
  './img/m8-pima-map-es.svg',
  './img/m9-b-naturals.svg',
  './img/m9-d-naturals.svg',
  './img/m9-g-naturals.svg',
  './img/m9-high-e-naturals.svg',
  './img/m13-step-1-loosen.png',
  './img/m13-step-2-unwind-and-pull.png',
  './img/m13-step-3-remove-at-bridge.png',
  './img/m13-step-4-seat-ball-end.png',
  './img/m13-step-5-thread-the-post.png',
  './img/m13-step-6-lock-and-wind.png',
  './img/m13-step-7-tune-and-stretch.png',
  './module-1.js',
  './module-2.js',
  './module-3.js',
  './module-4.js',
  './module-5.js',
  './module-6.js',
  './module-7.js',
  './module-8.js',
  './module-9.js',
  './module-10.js',
  './module-11.js',
  './module-12.js',
  './module-13.js',
  './tabs/all-along-the-watchtower.html',
  './tabs/let-it-be.html',
  './tabs/luna.html',
  './tabs/seven-nation-army.html',
  './tabs/sweet-child-o-mine.html',
  './tabs/the-cure.html',
  './tabs/journey-theme.css',
  './tabs/journey.js',
  './tabs/fab-tools.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      // {cache:'reload'} forces each asset to come from the network. A plain
      // addAll() reads through the browser's HTTP cache, so a brand-new
      // CACHE_VERSION could be filled with the *old* files GitHub Pages was
      // still serving from max-age — the student auto-reloads onto a cache
      // that looks current and is stale. That is exactly how a pushed fix
      // fails to reach the class.
      .then(cache => cache.addAll(ASSETS.map(u => new Request(u, { cache: 'reload' }))))
      // New SW takes over without waiting for all tabs to close.
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION && k !== AUDIO_CACHE_VERSION).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // Only handle our own same-origin GETs. Everything else (Firebase,
  // YouTube embeds, Google Translate, gstatic SDKs) falls through to
  // the browser's normal network handling.
  if (req.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // <audio> elements issue byte-Range requests (even on the very first
  // load, to support seeking), which GitHub Pages answers with 206 Partial
  // Content — the plain handler below only caches status-200 responses, so
  // backing tracks would otherwise never get cached at all (verified: this
  // Cache Storage implementation does NOT auto-slice a Range request against
  // a cached full response the way some do — cache.match() just returns the
  // whole 200 body). So: serve a CACHED full copy straight away when we have
  // one (instant, and <audio> is fine playing a plain 200 for a range
  // request); otherwise let the very first play hit the network exactly as
  // before (no added latency to first sound) and cache the full file in the
  // background via a Range-less fetch, so every later play — including
  // offline — is served from cache.
  const isAudio = AUDIO_RE.test(url.pathname);

  if (req.headers.has('range') && isAudio) {
    event.respondWith((async () => {
      const cache = await caches.open(AUDIO_CACHE_VERSION);
      const cached = await cache.match(url.href);
      if (cached) return cached;
      event.waitUntil((async () => {
        try {
          const res = await fetch(url.href);   // no Range header — full file
          if (res && res.status === 200 && res.type === 'basic') await cache.put(url.href, res);
        } catch { /* offline or blocked — try again next play */ }
      })());
      return fetch(req);
    })());
    return;
  }

  event.respondWith((async () => {
    const cache = await caches.open(isAudio ? AUDIO_CACHE_VERSION : CACHE_VERSION);
    const cached = await cache.match(req);
    const network = fetch(req)
      .then(res => {
        // Only cache good, basic (same-origin) responses.
        if (res && res.status === 200 && res.type === 'basic') {
          // waitUntil the PUT itself, not just the fetch. `network` settles as
          // soon as the response headers land, so passing it to waitUntil (as
          // this used to) left the body still streaming into the cache with
          // nothing keeping the worker alive — on a slow connection the entry
          // silently never landed, and the file was missing offline.
          event.waitUntil(cache.put(req, res.clone()));
        }
        return res;
      })
      .catch(() => null);
    event.waitUntil(network);

    // Serve cache first if we have it; otherwise wait on the network.
    // For navigations that miss both, fall back to the cached shell.
    if (cached) return cached;
    const res = await network;
    // isAudio is never true for a navigation, so `cache` here is always CACHE_VERSION.
    return res || (req.mode === 'navigate' ? cache.match('./index.html') : undefined);
  })());
});
