/* ════════════════════════════════════════════════════════════════
   Guitar Class — KILL-SWITCH service worker (break glass; NOT live)

   WHAT IT IS. A complete service worker that switches the site's offline
   cache off. It is kept here, ready and tested, and nothing loads it from
   here. To use it, it is copied over the real worker:

       cp tools/kill-switch/kill-sw.js sw.js

   and pushed. The address must stay `sw.js` at the site root: a browser
   only replaces a worker with one at the same address.

   WHEN TO USE IT. Only when students are stuck on a broken copy of the
   site that the normal update does not clear: a reload still shows the
   broken page, or the update never arrives (for example a file the real
   worker must download at install is missing, so its install fails on
   every Chromebook and the old cached shell stays). A bad push on its own
   does NOT need it: revert the push and the real worker updates every
   Chromebook as usual. Steps: BREAK-GLASS.md (repo root), situation (b).

   WHAT IT DOES on each Chromebook, the next time the site is opened
   (the browser checks sw.js on every visit):
     install   takes over at once (skipWaiting). It downloads nothing, so
               its install cannot fail.
     activate  deletes the site's shell caches (every cache named
               `guitar-class-…` except the two audio caches below), takes
               control of the open pages (clients.claim) and tells them a
               new worker took over (the same "gc-sw-activated" message the
               real worker sends). The page's own update code (app/start.js)
               then reloads each open tab ONCE, after it has waited for a
               drill, recording, exit check or playing card to finish, sent
               any unsaved ticks and left its "back where you were" note,
               exactly as it does for a normal update.
     fetch     NO fetch handler. Every request goes straight to the
               network, as if there were no worker. The browser does not
               even start this worker for a request.
   It KEEPS the backing-track cache and its record cache (names below,
   pinned in tools/sw-audio-map.mjs): a Chromebook that loses them
   re-downloads every track it plays. While the kill switch is live the
   tracks are not served from that cache (no fetch handler), so playing
   a track needs the network; they are still there when the real worker
   comes back.
   It does not unregister itself. An unregistered worker comes back only
   when a page registers one again (app/start.js does that on every load,
   which would install this same file again: a churn on every visit). A
   worker that stays registered and does nothing is replaced in place the
   moment the real sw.js is back.

   HOW TO GO BACK (BREAK-GLASS.md (b), steps 6 to 9). Put the real worker
   back (`git revert <the kill-switch commit>`), run the full
   `node tools/checks.mjs` (it rewrites the version line and the audio
   hash map of the real sw.js), commit, push, then
   `node tools/checks.mjs --live`. The real worker installs over this one,
   keeps the audio caches (same names) and checks each track's record as
   usual.

   CHECKS. While this file is the site's sw.js, `node tools/checks.mjs`
   fails (it reads the real worker's lists, which this file does not
   have), and so do the git hooks. That is expected during the emergency:
   BREAK-GLASS.md says how to commit and push it. The full checks.mjs
   leaves this file as it is (it rewrites only a `const` version line and
   an audio hash block, and this file has neither). `node tools/checks.mjs
   --live` works and must report `guitar-class-kill-switch`.

   PROOF. `node tools/kill-switch/proof.mjs` runs this file and the real
   sw.js in a Node vm with a stand-in cache (as tools/sw-audio-proof.mjs
   does) and breaks this file on purpose to show the proof goes red.
   ════════════════════════════════════════════════════════════════ */

/* What `node tools/checks.mjs --live` compares with the live site. A `let`,
   not a `const`, on purpose: the full checks.mjs rewrites only a
   `const` line of that name, so it cannot turn this into a normal version. */
let CACHE_VERSION = 'guitar-class-kill-switch';

/* The two audio caches the real worker keeps (sw.js AUDIO_CACHE and
   AUDIO_HASH_CACHE; pinned in tools/sw-audio-map.mjs). Never deleted here. */
const KEEP_CACHES = ['guitar-class-audio-2026-10-30-ff9e913a6d', 'guitar-class-audio-hashes'];
/* Only this site's caches are touched: other sites on the same address
   (the github.io account) may keep caches of their own. */
const SITE_CACHE = /^guitar-class-/;

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    /* Each step on its own: one that fails must not stop the next. A cache
       that could not be deleted is tried again by the next worker. */
    try {
      const names = await caches.keys();
      await Promise.all(names
        .filter(n => SITE_CACHE.test(n) && !KEEP_CACHES.includes(n))
        .map(n => caches.delete(n).catch(() => false)));
    } catch { /* Cache Storage unavailable: nothing to delete */ }
    try { await self.clients.claim(); } catch { /* the next page load is controlled anyway */ }
    try {
      const list = await self.clients.matchAll({ type: 'window' });
      for (const c of list) c.postMessage({ type: 'gc-sw-activated', version: CACHE_VERSION });
    } catch { /* the page also hears "controllerchange" from claim() */ }
  })());
});
