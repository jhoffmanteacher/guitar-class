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

const CACHE_VERSION = 'guitar-class-2026-07-26-48bad99753';

// Static shell — everything needed to render the practice content offline.
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './fonts/fraunces.woff2',
  './i18n.js',
  './guitar-diagrams.js',
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
      .then(cache => cache.addAll(ASSETS))
      // New SW takes over without waiting for all tabs to close.
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
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
  if (req.headers.has('range') && /\.(mp3|m4a|wav|ogg)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_VERSION);
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

  event.respondWith(
    caches.open(CACHE_VERSION).then(cache =>
      cache.match(req).then(cached => {
        const network = fetch(req)
          .then(res => {
            // Only cache good, basic (same-origin) responses.
            if (res && res.status === 200 && res.type === 'basic') {
              cache.put(req, res.clone());
            }
            return res;
          })
          .catch(() => null);

        // Serve cache first if we have it; otherwise wait on the network.
        // For navigations that miss both, fall back to the cached shell.
        return cached || network.then(res =>
          res || (req.mode === 'navigate' ? cache.match('./index.html') : undefined)
        );
      })
    )
  );
});
