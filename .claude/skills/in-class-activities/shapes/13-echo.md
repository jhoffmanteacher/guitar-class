## 13. Echo (call and response)

**For:** playing by ear and in time: the site plays a short power-chord strum, the student plays it back in the gap
(`app/echo.js`; its header is the schema). Nothing listens, grades or is saved: the student taps Got it, Again or Next
phrase. The ladder goes from made-up phrases up to the song's own strum patterns, and the last phrases are the record.

**Skeleton** (from `ca-55`; per-song values marked):
```js
{
  id: 'ca-57', view: 'focus',
  title: 'Echo — …', title_es: 'Eco — …',            // does NOT name the song: the last screen reveals it
  intro: 'Hear a short power-chord strum, then play it back in time.', intro_es: '…',
  steps: [ {
    label: 'Practice — Echo, phrase by phrase', label_es: '…',    // no step text: the drill's own line says it
    drill: {
      type: 'echo',
      card: 'ca-33',                                  // per song: the practice card whose track and sections are used
      chords: { D5: { frets: [['A',5],['D',7],['G',7]], midi: [50,57,62] }, … },   // per song
      phrases: [                                      // per song, easiest first
        { pattern: 'D.D.D.D.', bars: ['D5','D5'], bpm: 80 },                       // made-up: the site strums it
        { pattern: 'D.DU.UDU', bars: ['D5', …], record: { section: 'Verse 1', fromBar: 25 } }   // the record
      ]
    }
  } ]
}
```

**Ask Jonathan:** the song and its card, which two parts end it, the chords, how many made-up phrases.

**Traps:**
- A record phrase's `bars` must be the chords the card plays in those bars (`echoModel` refuses; **1fi** fails).
- **1fi** pins ONE echo drill: `ca-55`, 13 phrases (11 made-up), its two record phrases, and no song name in the
  title or intro. A second Echo card means widening that check in the same commit.
- A made-up pattern is eight slots a bar (D down, U up, . miss, - stop).

**Tools:** the common ones, `node tools/stop-loop.mjs` (start `echo@card`) after a change to the part, and ears on
each record phrase.
