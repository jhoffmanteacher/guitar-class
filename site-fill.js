/* site-fill.js — the page fills a big screen the way it fills a Chromebook
   (Jonathan, 2026-11-13: "the view should be maximized for whatever monitor
   is being used"; on a bigger screen, "grow everything").

   The Chromebook (1366×657 inside Chrome) is the size every layout is
   designed and measured at, and it does not change: there the factor is 1
   and this file sets nothing. A bigger window shows the same layout, enlarged:

     s = min(window width / 1366, window height / 657), never below 1, at
         most 3, and exactly 1 at 760 px wide or less (phones keep their CSS).

   One copy of the formula: siteFillScale() below (checks.mjs 1df runs it).

   How the page is enlarged, while s is above 1:
   - CSS zoom on the root (<html>): the page lays out in a window of
     (width / s) × (height / s) and is drawn s times larger. --site-fill
     holds s for the stylesheets.
   - Media queries do not see CSS zoom: they compare against the real window.
     So each width / height threshold in this site's own stylesheets is
     multiplied by s (fillMedia): with s = 1.874 on a 2560×1300 window,
     `(max-height:800px)` reads `(max-height:1499.2px)`, true exactly when
     1300 / 1.874 is 800 or less. The page gets the rules a Chromebook-sized
     window gets (the packed rail, the 48px header).
   - Viewport units (vh, vw, dvh) are zoomed like any length, so the
     stylesheets divide each one by var(--site-fill,1) (checks.mjs 1df: none
     is left bare).
   - The page's own script reads PAGE pixels (pagePixels below): a pointer's
     clientX, getBoundingClientRect, innerWidth, elementFromPoint and the
     page's scroll position are turned into the numbers a (width / s) ×
     (height / s) window reports, the same thing browser zoom does. The site's script was written for a
     Chromebook, where window and page pixels are the same, and mixes them in
     dozens of places (a drag, a popup placed under a link, the lyric sheet
     following the song, the practice-minutes toast).
   - Printing: everything goes back to 1 before the page is printed, and
     comes back after (a printed handout is never scaled).

   Browser zoom (Ctrl + plus / minus) keeps working ON TOP of the fill: the
   factor is worked out from the window's size at 100% zoom (outerWidth /
   innerWidth is the browser zoom, snapped to one of Chrome's zoom steps), so
   zooming in still makes the page bigger.

   A plain (blocking) script right after the stylesheets in the <head> of
   index.html and the six Song Journey pages: the factor is in place before
   the first paint, so nothing jumps from small to large. If it fails to load,
   the page is exactly what it was before this file existed (factor 1). */
(function(){
  'use strict';
  var BASE_W = 1366, BASE_H = 657, MAX = 3, PHONE = 760;
  function siteFillScale(w, h){
    if(!(w > PHONE) || !(h > 0)) return 1;
    var s = Math.min(w / BASE_W, h / BASE_H);
    return s > MAX ? MAX : (s > 1 ? s : 1);
  }
  window.siteFillScale = siteFillScale;

  var cur = 1;
  window.siteFill = function(){ return cur; };
  var root = document.documentElement;
  if(!root || !root.style || typeof root.style.setProperty !== 'function') return;

  /* The window's own numbers, read before pagePixels replaces them. */
  var nativeGet = function(obj, name){
    var d = Object.getOwnPropertyDescriptor(obj, name);
    return d && d.get ? function(){ return d.get.call(window); } : function(){ return window[name]; };
  };
  var winW = nativeGet(window, 'innerWidth'), winH = nativeGet(window, 'innerHeight');

  /* Chrome's zoom steps. outerWidth / innerWidth is the browser zoom when
     nothing sits beside the page. A panel beside the page (DevTools, a side
     panel) also makes outerWidth bigger than the page: a step above 100% is
     believed only if the page's height at that step still fits in the window
     (innerHeight x step <= outerHeight), which a real zoom always does and a
     side panel does not. Anything else reads as 100%. */
  var ZOOMS = [0.25, 0.333, 0.5, 0.667, 0.75, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4, 5];
  function browserZoom(){
    var o = window.outerWidth, i = winW();
    if(!(o > 0) || !(i > 0)) return 1;
    var r = o / i;
    for(var k = 0; k < ZOOMS.length; k++) if(Math.abs(r - ZOOMS[k]) / ZOOMS[k] < 0.02){
      if(ZOOMS[k] > 1 && !(winH() * ZOOMS[k] <= window.outerHeight + 2)) return 1;
      return ZOOMS[k];
    }
    return 1;
  }

  /* Every @media rule in this site's own stylesheets that tests a width or a
     height, with its original text. A stylesheet from another origin cannot
     be read (and is not ours). */
  var MQ = /\(\s*(min|max)-(width|height)\s*:\s*([\d.]+)px\s*\)/g;
  var media = null;
  function collect(){
    media = [];
    var walk = function(rules){
      for(var i = 0; i < rules.length; i++){
        var r = rules[i];
        if(r.media && typeof r.media.mediaText === 'string' && /(min|max)-(width|height)/.test(r.media.mediaText)) media.push({ rule: r, text: r.media.mediaText });
        if(r.cssRules) walk(r.cssRules);
      }
    };
    for(var i = 0; i < document.styleSheets.length; i++){
      var rules = null;
      try { rules = document.styleSheets[i].cssRules; } catch(e) { /* another origin */ }
      if(rules) walk(rules);
    }
  }
  function fillMedia(s){
    if(!media){ if(s === 1) return; collect(); }
    for(var i = 0; i < media.length; i++){
      var m = media[i];
      var t = s === 1 ? m.text : m.text.replace(MQ, function(_, mm, wh, n){ return '(' + mm + '-' + wh + ': ' + Math.round(n * s * 100) / 100 + 'px)'; });
      if(m.rule.media.mediaText !== t) m.rule.media.mediaText = t;
    }
  }

  var printing = false;
  function paint(){
    var s = printing ? 1 : cur;
    if(s === 1){ root.style.removeProperty('zoom'); root.style.removeProperty('--site-fill'); }
    else { root.style.setProperty('--site-fill', String(s)); root.style.setProperty('zoom', String(s)); }
    fillMedia(s);
  }
  function apply(){
    var z = browserZoom();
    var s = Math.round(siteFillScale(winW() * z, winH() * z) * 10000) / 10000;
    /* A Chromebook at 125% zoom works out at 1.0002 (the page's size is
       rounded to whole pixels): within 1% of 1 is 1, so it sets nothing. */
    if(s < 1.01) s = 1;
    if(s === cur) return;
    cur = s;
    paint();
  }

  /* Page pixels for the page's script, measured in Chrome 157 with zoom on
     the root: getBoundingClientRect, a pointer's clientX / pageX / offsetX,
     innerWidth, elementFromPoint, the root element's clientWidth and
     scrollHeight, and the window's scroll position all stay in WINDOW
     pixels; a style, an offsetWidth or an element's own scrollTop is in PAGE
     pixels. While s is above 1, each of the first group is divided by s (and
     what goes into elementFromPoint or a window scroll is multiplied by s).
     At s = 1 every one of them returns exactly what the browser gave. */
  (function pagePixels(){
    var EP = window.Element && Element.prototype, nGbcr = EP && EP.getBoundingClientRect;
    if(!nGbcr || typeof DOMRect !== 'function') return;
    EP.getBoundingClientRect = function(){
      var r = nGbcr.apply(this, arguments), s = cur;
      return s === 1 ? r : new DOMRect(r.x / s, r.y / s, r.width / s, r.height / s);
    };
    var down = function(v){ return cur === 1 ? v : v / cur; };
    var wrap = function(obj, name, get, set){
      var d = obj && Object.getOwnPropertyDescriptor(obj, name);
      if(!d || !d.get || !d.configurable) return;
      Object.defineProperty(obj, name, { configurable: true, enumerable: d.enumerable,
        get: function(){ return get.call(this, d.get.call(this)); },
        set: d.set ? (set ? function(v){ d.set.call(this, set.call(this, v)); } : d.set) : undefined });
    };
    if(window.MouseEvent) ['clientX', 'clientY', 'pageX', 'pageY', 'x', 'y', 'offsetX', 'offsetY'].forEach(function(n){ wrap(MouseEvent.prototype, n, down); });
    if(window.Touch) ['clientX', 'clientY', 'pageX', 'pageY'].forEach(function(n){ wrap(Touch.prototype, n, down); });
    ['innerWidth', 'innerHeight', 'scrollX', 'scrollY', 'pageXOffset', 'pageYOffset'].forEach(function(n){ wrap(window, n, down); });
    /* The root element's own box and scroll position (the page's scroll). */
    ['clientWidth', 'clientHeight', 'scrollWidth', 'scrollHeight', 'scrollTop', 'scrollLeft'].forEach(function(n){
      wrap(EP, n, function(v){ return this === root ? down(v) : v; }, function(v){ return this === root && cur !== 1 ? v * cur : v; });
    });
    var up = function(args){
      var s = cur;
      if(s === 1) return args;
      var a = Array.prototype.slice.call(args);
      if(a[0] && typeof a[0] === 'object'){
        var o = {}; for(var k in a[0]) o[k] = a[0][k];
        if(typeof o.top === 'number') o.top *= s;
        if(typeof o.left === 'number') o.left *= s;
        a[0] = o;
      } else a = a.map(function(v){ return typeof v === 'number' ? v * s : v; });
      return a;
    };
    ['scrollTo', 'scroll', 'scrollBy'].forEach(function(n){
      var w = window[n];
      if(typeof w === 'function') window[n] = function(){ return w.apply(window, up(arguments)); };
      var e = EP[n];
      if(typeof e === 'function') EP[n] = function(){ return e.apply(this, this === root ? up(arguments) : arguments); };
    });
    var D = window.Document && Document.prototype;
    ['elementFromPoint', 'elementsFromPoint'].forEach(function(n){
      var f = D && D[n];
      if(typeof f === 'function') D[n] = function(x, y){ var s = cur; return f.call(this, x * s, y * s); };
    });
  })();

  try { apply(); } catch(e) { cur = 1; try { paint(); } catch(e2) { /* leave the page at 1 */ } }
  window.addEventListener('resize', apply);
  /* A move to a screen with another scaling can change the pixel ratio with no resize. */
  (function watchDpr(){
    if(!window.matchMedia) return;
    var mq;
    try { mq = window.matchMedia('(resolution: ' + window.devicePixelRatio + 'dppx)'); } catch(e) { return; }
    if(!mq || !mq.addEventListener) return;
    var on = function(){ mq.removeEventListener('change', on); apply(); watchDpr(); };
    mq.addEventListener('change', on);
  })();
  window.addEventListener('beforeprint', function(){ printing = true; paint(); });
  window.addEventListener('afterprint', function(){ printing = false; paint(); });
})();
