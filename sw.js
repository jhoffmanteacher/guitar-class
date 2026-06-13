/* ════════════════════════════════════════════════════════════════
   Guitar Class — Service Worker (light PWA, offline resilience)

   ⚠️  BUMP CACHE_VERSION ON EVERY PUSH that changes any cached file
       (index.html, styles.css, app.js, config-main.js, module-*.js,
        manifest.json, icon.svg). If you forget, returning students may
        keep getting the OLD site from their cache. See CLAUDE.md.

   Strategy: stale-while-revalidate for same-origin GET requests —
   serve the cached copy instantly (fast on weak school Wi-Fi), then
   refresh the cache in the background for next time. Cross-origin
   requests (Firebase, YouTube, Google Translate, gstatic) are NEVER
   intercepted — they always go straight to the network, so auth and
   progress-saving behave exactly as before.
   ════════════════════════════════════════════════════════════════ */

const CACHE_VERSION = 'guitar-class-v4-2026-06-13';

// Static shell — everything needed to render the practice content offline.
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './config-main.js',
  './firebase-config.js',
  './manifest.json',
  './icon.svg',
  './module-1.js',
  './module-2.js',
  './module-3.js',
  './module-4.js',
  './module-5.js',
  './module-6.js',
  './module-7.js',
  './module-8.js'
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

  // Only handle our own same-origin GETs. Everything else (Firebase,
  // YouTube embeds, Google Translate, gstatic SDKs) falls through to
  // the browser's normal network handling.
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) {
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
