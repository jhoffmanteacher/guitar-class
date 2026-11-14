// ============================================================
//  FIREBASE CONFIG  —  set once, then leave it alone
//  Upload this file to GitHub alongside index.html + config.js
// ============================================================
//
//  Which Firebase project a page talks to is decided HERE, and only here,
//  by the address the page was opened from (2026-11-14, "the practice copy").
//
//  - The practice copy: the SAME files, served by Firebase Hosting of the
//    practice project at https://guitar-class-practice.web.app (and
//    .firebaseapp.com, and its preview channels
//    guitar-class-practice--<channel>-<hash>.web.app). Those exact hosts, and
//    nothing else, get the practice project's settings, a strip along the
//    bottom of the page ("PRACTICE COPY …") and "[practice]" in the tab title.
//  - EVERY other address (the live site on github.io, localhost, 127.0.0.1,
//    a file, anything unknown) gets the class project's settings, exactly as
//    before, and nothing else on the page changes.
//
//  checks.mjs 1ed pins both settings, the host list and the default. Never
//  loosen the host test (no includes('practice'), no endsWith): a look-alike
//  address must fall to the class settings, which a look-alike cannot sign
//  in to (it is not an authorized domain of the class project).

// True only on the practice copy's own addresses (see above).
const IS_PRACTICE_COPY = (function () {
  var h = '';
  try { h = (typeof location !== 'undefined' && location && typeof location.hostname === 'string') ? location.hostname : ''; } catch (_) { h = ''; }
  if (h === 'guitar-class-practice.web.app' || h === 'guitar-class-practice.firebaseapp.com') return true;
  return /^guitar-class-practice--[a-z0-9-]+-[a-z0-9]{8}\.web\.app$/.test(h);
})();

const firebaseConfig = IS_PRACTICE_COPY ? {
  // The practice project: test data only, never class data.
  apiKey:            "AIzaSyDTqXYfN6PUnAeN1y-_KeGJ767VAv4fRy4",
  authDomain:        "guitar-class-practice.firebaseapp.com",
  projectId:         "guitar-class-practice",
  storageBucket:     "guitar-class-practice.firebasestorage.app",
  messagingSenderId: "279579135228",
  appId:             "1:279579135228:web:7e82eb05d68f65b97a1b79"
} : {
  // The class project (the live site, and every address not listed above).
  apiKey:            "AIzaSyB2QKByMeNpV_CaCgvf-oS9HuBDF29dfzU",
  authDomain:        "guitar-class-2fd21.firebaseapp.com",
  projectId:         "guitar-class-2fd21",
  storageBucket:     "guitar-class-2fd21.firebasestorage.app",
  messagingSenderId: "182670968497",
  appId:             "1:182670968497:web:6e2596b9a0262e70e4c490",
  measurementId:     "G-M0QVQKTH3C"
};

// The Google account that can access the teacher dashboard (?teacher=true in URL)
const TEACHER_EMAIL = 'jhoffman@seq.org';

/* The practice copy's strip and tab title. Runs ONLY when IS_PRACTICE_COPY:
   on every other address this block does nothing at all.

   The strip is a full-width bar along the bottom (above the offline bar when
   both show). <html> gets .practice-on and --practice-h (the strip's height);
   the rules below make room for it the way styles.css's "OFFLINE BANNER"
   rules do for the offline bar (the sum of both heights), so it covers no
   control: #app, the Games screen and the console sidebar end above it, the
   body gets that much bottom padding, and the bottom-fixed controls ride up.
   Keep PC_RIDE_UP in step with the translate rule in styles.css ("OFFLINE
   BANNER"); checks.mjs 1ed checks it. The title keeps "[practice] " in front,
   also after a language switch rewrites it. English only (Jonathan's tool). */
(function () {
  if (!IS_PRACTICE_COPY || typeof document === 'undefined') return;
  try {
    var root = document.documentElement;
    var ROOM = '(var(--offline-h,0px) + var(--practice-h,0px))';
    var PC_RIDE_UP = ['.back-to-top', '#gate-toast', '.lq-banner', '.video-overlay'];
    // A Journey page's floating tools sit fixed at the bottom; on the main site
    // .fab-group lives in the rail and must not move.
    if (!document.getElementById('app')) PC_RIDE_UP.push('.fab-group');
    var css = ''
      + 'html.practice-on #app{height:calc(100dvh / var(--site-fill,1) - var(--hdr) - ' + ROOM + ')}'
      + 'html.practice-on body{padding-bottom:calc' + ROOM + '}'
      + 'html.practice-on .games-screen{bottom:calc' + ROOM + '}'
      + 'html.practice-on .t-side{height:calc(100dvh / var(--site-fill,1) - var(--hdr) - ' + ROOM + ')}'
      + 'html.practice-on .t-board-built{max-height:calc(100vh / var(--site-fill,1) - var(--hdr) - 24px - ' + ROOM + ')}'
      + PC_RIDE_UP.map(function (s) { return 'html.practice-on ' + s; }).join(',')
      + '{translate:0 calc(' + ROOM + ' * -1)}'
      + '#practice-copy-bar{position:fixed;left:0;right:0;bottom:var(--offline-h,0px);z-index:55;box-sizing:border-box;'
      + 'margin:0;padding:6px 12px;text-align:center;color:#fff;font:700 14px/20px system-ui,-apple-system,sans-serif;'
      + 'letter-spacing:.03em;background:repeating-linear-gradient(-45deg,#9a3412 0 16px,#7c2d12 16px 32px);'
      + 'box-shadow:0 -2px 10px rgba(0,0,0,.25)}';
    var style = document.createElement('style');
    style.id = 'practice-copy-style';
    style.textContent = css;
    (document.head || root).appendChild(style);

    var bar = document.createElement('div');
    bar.id = 'practice-copy-bar';
    bar.setAttribute('role', 'note');
    // Any school account can sign in here and save (same rules as the class): the strip says plainly it does not count.
    bar.textContent = 'PRACTICE COPY: not the real class site. Work saved here does not count.';
    var place = function () {
      if (!document.body || bar.parentNode) return;
      document.body.appendChild(bar);
      root.classList.add('practice-on');
      var size = function () { try { root.style.setProperty('--practice-h', bar.offsetHeight + 'px'); } catch (_) {} };
      size();
      if (typeof ResizeObserver === 'function') new ResizeObserver(size).observe(bar);
    };
    if (document.body) place(); else document.addEventListener('DOMContentLoaded', place);

    var PREFIX = '[practice] ';
    var fixTitle = function () {
      var t = document.title || '';
      if (t.indexOf(PREFIX) !== 0) document.title = PREFIX + t;
    };
    fixTitle();
    if (typeof MutationObserver === 'function' && document.head) {
      new MutationObserver(fixTitle).observe(document.head, { childList: true, subtree: true, characterData: true });
    }
  } catch (_) { /* never let the strip stop the page */ }
})();
