/* sim-app-page.mjs — the whole student app in a Node vm, for tools that need the REAL card renderer
   (caCardBodyHtml) on a song they made (2026-11-16, Song builder Part c: tools/song-builder-sim.mjs renders each
   chart fixture's card with it). No network, no Firestore, no audio: DOM stubs only. The stubs are the ones
   tools/built-songs-sim.mjs's makePage() uses (that tool keeps its own copy, with its fake Firestore and IndexedDB);
   a THIRD tool that needs a page should import this one instead of copying again.

     import { appPage } from './sim-app-page.mjs';
     const page = appPage(ROOT);                       // loads i18n.js, guitar-diagrams.js, class-activities.js,
     page.run('caCardBodyHtml(...)');                  // config-main.js, every module-N.js and every app/*.js part */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import vm from 'node:vm';
import { siteParts } from './site-src.mjs';

export function appPage(root){
  const stubStyle = () => ({ setProperty(){}, removeProperty(){}, getPropertyValue(){ return ''; } });
  const el = () => ({
    style: stubStyle(), dataset: {}, children: [], hidden: false,
    classList: { add(){}, remove(){}, toggle(){}, contains(){ return false; } },
    innerHTML: '', textContent: '', value: '', checked: false,
    addEventListener(){}, removeEventListener(){}, appendChild(){}, removeChild(){}, remove(){},
    setAttribute(){}, getAttribute(){ return null; }, removeAttribute(){}, hasAttribute(){ return false; },
    querySelector(){ return null; }, querySelectorAll(){ return []; }, closest(){ return null; },
    focus(){}, blur(){}, click(){}, scrollIntoView(){}, insertAdjacentHTML(){}, cloneNode(){ return el(); },
    getBoundingClientRect(){ return { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 }; },
  });
  const storage = () => ({ _d: {}, getItem(k){ return this._d[k] ?? null; }, setItem(k, v){ this._d[k] = String(v); }, removeItem(k){ delete this._d[k]; }, clear(){ this._d = {}; } });
  const ctx = {
    console: { log(){}, warn(){}, error(){}, info(){} },
    document: { documentElement: el(), head: el(), body: el(), getElementById(){ return null; }, querySelector(){ return null; }, querySelectorAll(){ return []; },
      createElement(){ return el(); }, createDocumentFragment(){ return el(); }, addEventListener(){}, removeEventListener(){}, fonts: { ready: Promise.resolve() }, hidden: false, visibilityState: 'visible' },
    localStorage: storage(), sessionStorage: storage(),
    location: { hostname: 'localhost', href: 'http://localhost/', pathname: '/', search: '', hash: '', reload(){} },
    history: { scrollRestoration: 'auto', replaceState(){}, pushState(){} },
    navigator: { userAgent: 'node', language: 'en', onLine: true },
    setTimeout, clearTimeout, setInterval: () => 0, clearInterval(){},
    requestAnimationFrame: () => 0, cancelAnimationFrame(){},
    matchMedia: () => ({ matches: false, addEventListener(){}, addListener(){} }),
    getComputedStyle: () => ({ getPropertyValue: () => '' }),
    fetch: () => Promise.reject(new Error('no network')),
    CustomEvent: class { constructor(t, o){ this.type = t; Object.assign(this, o || {}); } },
    Image: class {}, Audio: class { play(){ return Promise.resolve(); } pause(){} },
    AudioContext: class { createOscillator(){ return { connect(){}, start(){}, stop(){}, frequency: { value: 0 } }; } createGain(){ return { connect(){}, gain: { value: 0, setValueAtTime(){} } }; } close(){} },
    performance: { now: () => 0 }, structuredClone,
    URLSearchParams, URL: Object.assign(function(){ return new URL(...arguments); }, { createObjectURL: () => 'blob:sim', revokeObjectURL(){} }), TextEncoder, TextDecoder, Blob,
    addEventListener(){}, removeEventListener(){}, dispatchEvent(){}, scrollTo(){},
    innerWidth: 1366, innerHeight: 657, devicePixelRatio: 1,
  };
  ctx.URL.prototype = URL.prototype;
  ctx.window = ctx; ctx.globalThis = ctx; ctx.self = ctx;
  vm.createContext(ctx);
  const mods = readdirSync(root).filter(f => /^module-\d+\.js$/.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  for(const f of ['i18n.js', 'guitar-diagrams.js', 'class-activities.js', 'config-main.js', ...mods, ...siteParts('app.js', root)])
    vm.runInContext(readFileSync(join(root, f), 'utf8'), ctx, { filename: f });
  return { ctx, run: code => vm.runInContext(code, ctx) };
}
