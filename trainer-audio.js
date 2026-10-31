/* ══════════════════════════════════════════════════════════════════════
   trainer-audio.js — "Hear It First": what the trainer plays.

   Sequences, harmonic intervals and "Hear the slide", built on ONE injected
   function: playNote(midi, gain, when, synthOnly), which the adapter hands in
   (the site's own pluck, asked for its Karplus-Strong voice, so no audio
   files — work order decision 8). This file touches no site global and has no
   Karplus-Strong of its own: a standalone version would inject another
   playNote.

     createAudio({
       playNote(midi, gain, when, synthOnly)   schedule a pluck at an audio-clock time
       now()                                   the audio clock, in seconds
       killRinging()                           optional: cut notes still ringing
     }) -> { tone, seq, together, slide, stop }

   Every player returns how long it takes, in milliseconds, so the screen
   (and the microphone's deaf window) can wait for it.
   ══════════════════════════════════════════════════════════════════════ */
(function (root, factory) {
  var api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.HIF_AUDIO = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  var GAIN = 0.45;
  var LEAD = 0.04;
  /* A plucked note is still audible long after it starts; the mic waits for
     the room to go quiet on its own, this is only the minimum the screen
     leaves after the last note begins. */
  var TAIL_MS = 700;

  function createAudio(deps) {
    function at(extraMs) { return deps.now() + LEAD + (extraMs || 0) / 1000; }
    function gainFor(n) { return GAIN / Math.sqrt(Math.max(1, n)); }

    function tone(midi, o) {
      o = o || {};
      deps.playNote(midi, o.gain != null ? o.gain : GAIN, at(o.delayMs), true);
      return TAIL_MS;
    }
    /* One note after another. gapMs is the time between starts. */
    function seq(midis, o) {
      o = o || {};
      var gap = o.gapMs || 600;
      midis.forEach(function (m, i) { deps.playNote(m, GAIN, at((o.delayMs || 0) + i * gap), true); });
      return (o.delayMs || 0) + (midis.length - 1) * gap + TAIL_MS;
    }
    /* Both at once (a harmonic interval), a little quieter so the sum stays clean. */
    function together(midis, o) {
      o = o || {};
      midis.forEach(function (m) { deps.playNote(m, gainFor(midis.length), at(o.delayMs), true); });
      return (o.delayMs || 0) + 1100;
    }
    /* "Hear the slide": every fret from the reference to the target, in order. */
    function slide(fromMidi, toMidi, o) {
      o = o || {};
      var step = o.stepMs || 230, dir = toMidi >= fromMidi ? 1 : -1, list = [], m;
      for (m = fromMidi; m !== toMidi + dir; m += dir) list.push(m);
      list.forEach(function (n, i) { deps.playNote(n, GAIN * 0.9, at((o.delayMs || 0) + i * step), true); });
      return (o.delayMs || 0) + (list.length - 1) * step + TAIL_MS;
    }
    function stop() { if (deps.killRinging) deps.killRinging(); }

    return { tone: tone, seq: seq, together: together, slide: slide, stop: stop, TAIL_MS: TAIL_MS };
  }

  return { createAudio: createAudio };
});
