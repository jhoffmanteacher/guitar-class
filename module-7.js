// ============================================================
//  MODULE 7 — TAB Notation and Barre Chords
//  Edit this file to change Module 7 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm7w1',
    label: 'Set 1',
    locked: false,
    module: 'TAB Notation and Barre Chords',
    moduleNum: 7,
    unit: 'Module 7 · TAB Notation and Barre Chords',
    title: 'Set 1',
    subtitle: 'Multi-line TAB · Rhythm in TAB · Riffs that mix notes and chords',
    objective: 'I CAN read multi-line TAB with rhythm symbols and play a real riff that combines single notes and chord stabs.',
    skillFocus: 'Reading multi-line TAB and rhythm symbols · Playing slides, hammer-ons, and pull-offs · Playing a riff of notes and chords',
    handoutUrl: 'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/4-JTCASlh-w" target="_blank">How To Read TAB and Chord Boxes (BC-108) – JustinGuitar</a> (0:00–4:00).',
            hint: 'You\'ve read single-note TAB since Module 1. Watch for two new things now. First: numbers STACKED vertically mean play them together (a chord). Second: the symbols above the numbers tell you how long each note lasts — plain stems are quarter notes, flags and beams are 8th notes.',
            skills: [1, 2, 3],
            response: { type: 'mc', prompt: 'When two or more numbers in a TAB line up VERTICALLY on top of each other, you should:',
              answer: 0,
              explain: 'Stacked numbers are a chord — strike those strings together in one motion. Numbers spread left-to-right are played one after another.',
              choices: [
              'Play them at the same time (as a chord)',
              'Play them one after another, lowest first',
              'Play only the lowest-numbered string',
              'Roll across them slowly, one note at a time'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/tCQ0r7vqkFQ" target="_blank">Smoke On The Water Guitar Lesson – Marty Music</a> (0:00–4:00). This is the riff you\'ll learn in the Practice station.',
            hint: 'Notice that the riff uses 2-note "power chord" intervals played together — perfect example of stacked TAB numbers.',
            skills: [4, 5],
            response: { type: 'mc', prompt: 'The "Smoke on the Water" main riff uses which two strings most?',
              answer: 2,
              explain: 'You\'ll play it as a two-note double-stop on the A and D strings (strings 5 and 4) — index and ring locked together as one unit.',
              choices: [
              'Strings 1 and 2 (high e and B)',
              'Strings 6 and 5 (low E and A)',
              'Strings 5 and 4 (A and D)',
              'Strings 3 and 2 (G and B)'
            ] }
          },
          {
            text: 'Station Wrap-Up — take a beat to reflect: TAB packs a lot into one line (which string, which fret, chord-or-melody, how long the note lasts). Which part still slows you down most when you sight-read a new riff?',
            response: { type: 'short', placeholder: 'e.g. the rhythm symbols — I can find the notes but not the timing' }
          }
        ]
      },
      c: {
        title: 'Practice station — riffs from TAB',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every class the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Tuning (Module 1) is a skill you keep forever. Reading TAB today is faster when you also name the notes you land on — that\'s your Module 2 fretboard map.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Read a riff with stacked TAB (double-stops)',
            steps: [
          {
            text: 'Challenge 1 — Smoke on the Water: play the main riff with index + ring locked as a unit on the A + D strings — 0/0 — 3/3 — 5/5 — 0/0 — 3/3 — 6/6 — 5/5. You\'ve got it when: both notes ring at the same volume, clean through the whole riff. Use the TAB below.',
            hint: 'Use your index and ring finger together — keep them locked in shape and slide as a unit. Both notes should ring at the same volume.',
            stuck: 'Lock the two fingers into one shape and move them as a block — don\'t re-place them each time. Get the 0/0 → 3/3 slide clean before adding the rest.',
            levelUp: 'Play it at 90 BPM, or tack on the high-octave answer phrase that closes the full riff.',
            skills: [1, 4, 5],
            response: { type: 'short', prompt: 'Personal record — win at 70 BPM, then +10 at a time. Your fastest CLEAN "Smoke" lap today (BPM)?', placeholder: 'e.g. 100 — beat it next class' },
            tab: {
              caption: '"Smoke on the Water" — main riff · A + D strings together',
              notes: [
                { string: 'D', fret: 0, note: 'D',  midi: 50 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 },
                { string: 'D', fret: 3, note: 'F',  midi: 53 },
                { string: 'A', fret: 3, note: 'C',  midi: 48 },
                { string: 'D', fret: 5, note: 'G',  midi: 55 },
                { string: 'A', fret: 5, note: 'D',  midi: 50 },
                { string: 'D', fret: 0, note: 'D',  midi: 50 },
                { string: 'A', fret: 0, note: 'A',  midi: 45 },
                { string: 'D', fret: 3, note: 'F',  midi: 53 },
                { string: 'A', fret: 3, note: 'C',  midi: 48 },
                { string: 'D', fret: 6, note: 'F#', midi: 56 },
                { string: 'A', fret: 6, note: 'D#', midi: 51 },
                { string: 'D', fret: 5, note: 'G',  midi: 55 },
                { string: 'A', fret: 5, note: 'D',  midi: 50 }
              ]
            }
          }
            ]
          },
          {
            title: 'Read rhythm in TAB',
            steps: [
          {
            text: 'Challenge 2 — Crazy Train: play the intro riff on the E and A strings with alternate picking, watching the 8th vs. quarter notes in the TAB. You\'ve got it when: clean and even at 60 BPM before you speed it up.',
            hint: 'Use alternate picking (down-up-down-up). The riff is fast — start at 60 BPM and only speed up when it\'s clean. Set the ⏱ Timer for 2 minutes and loop it.',
            stuck: 'Drop to 50 BPM and keep strict down-up-down-up picking — even and slow beats fast and sloppy. Loop just the first 4 notes until they\'re automatic.',
            levelUp: 'Push to 80 BPM, or play it twice through with no stumble.',
            skills: [2, 3, 5],
            tab: {
              caption: '"Crazy Train" — intro riff · low E and A strings',
              notes: [
                { string: 'A', fret: 7, note: 'E',  midi: 52 },
                { string: 'E', fret: 7, note: 'B',  midi: 47 },
                { string: 'A', fret: 5, note: 'D',  midi: 50 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'A', fret: 3, note: 'C',  midi: 48 },
                { string: 'E', fret: 3, note: 'G',  midi: 43 },
                { string: 'A', fret: 2, note: 'B',  midi: 47 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 }
              ]
            }
          }
            ]
          },
          {
            title: 'Find & read a TAB on your own',
            steps: [
          {
            text: 'Challenge 3 — Find a Riff (give it a go!): pick "Iron Man" or "Sunshine of Your Love", find a TAB online, and play through it once. No score — see which rhythm symbols you can spot above the numbers.',
            hint: 'Most beginner TAB sites (Songsterr, Ultimate Guitar) show the rhythm. Look for the stem marks above each number.',
            skills: [3, 6]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Which riff move tripped your fingers most today — a stretch, a string change, or the picking hand? Name it; that\'s your first loop next class.',
                response: { type: 'short', placeholder: 'e.g. the string jump from A to E in Crazy Train' }
              }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"Smoke on the Water" — Deep Purple', meta: 'Iconic 2-note TAB riff · A + D strings', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=Q2FzZSBD5LE',
        tutorialUrl: 'https://www.youtube.com/watch?v=tCQ0r7vqkFQ' },
      { name: '"Crazy Train" — Ozzy Osbourne', meta: 'Fast intro riff · alternate picking practice', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=FVovq9TGBw0',
        tutorialUrl: 'https://www.youtube.com/watch?v=61YCfNHZuHE' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Single-note riff with rhythm variations', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Iron Man" — Black Sabbath', meta: 'Slow, heavy riff · perfect for rhythm reading', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=iFgqckcGpDA',
        tutorialUrl: 'https://www.youtube.com/watch?v=TSxIMjP5lkM' },
      { name: '"Sunshine of Your Love" — Cream', meta: 'Classic rock riff in E', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=HbqQL0J_Vr0',
        tutorialUrl: 'https://www.youtube.com/watch?v=Ouo2Ek2S_Lo' },
      { name: '"Day Tripper" — The Beatles', meta: 'Iconic 8th-note riff', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=AYZlME0mQB8',
        tutorialUrl: 'https://www.youtube.com/watch?v=aEop5yAw1wU' },
      { name: '"Beat It" — Michael Jackson', meta: 'Intro riff in E minor', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=oRdxUFDoQe0',
        tutorialUrl: 'https://www.youtube.com/watch?v=jJfwgrDcH3A' },
      { name: '"Come As You Are" — Nirvana', meta: 'Low-string riff · clear rhythm', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=vabnZ9-ex7o',
        tutorialUrl: 'https://www.youtube.com/watch?v=3UV1CtIUOmU' }
    ],

    assessment: {
      goal: 'Reads stacked-number TAB (chords) · Reads rhythm symbols above TAB · Plays a real riff that mixes notes and double-stops · Identifies hammer-on / pull-off / slide markings',
      performance: 'Class plays "Smoke on the Water" riff in unison at 70 BPM. Teacher listens for both notes ringing together evenly on every double-stop.',
      selfCheck: 'Can you look at a new TAB and play it without someone telling you the rhythm? Can you tell a chord from a melody just by looking at the TAB?',
      standards: ['Re.7a', 'Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm7w1-s1', text: 'Read stacked TAB numbers as a chord (play simultaneously)',
        gotItWhen: 'when you see two or more TAB numbers stacked vertically, you instantly play them together — no thinking about "which one first".',
        practice: { type: 'mc', prompt: 'TAB shows "3" on the A string and "3" on the D string, stacked vertically. How should you play it?',
          choices: ['A string first, then D string', 'D string first, then A string', 'Both at the same time', 'Just pick one'], answer: 2 } },
      { id: 'm7w1-s2', text: 'Identify quarter notes, 8th notes, and half notes in TAB rhythm symbols',
        gotItWhen: 'you can look at the stems and flags above a TAB and call out the rhythm before you play — without having to listen to the original recording.',
        practice: { type: 'mc', prompt: 'Two TAB notes with their stems JOINED by a single beam (like ♫) are what kind of notes?',
          choices: ['Whole notes', 'Half notes', 'Quarter notes', '8th notes'], answer: 3 } },
      { id: 'm7w1-s3', text: 'Recognize hammer-on (h), pull-off (p), and slide (/ or \\) markings',
        gotItWhen: 'you can see "5h7" or "7p5" or "5/7" in TAB and know exactly what your fretting hand should do — without looking it up.',
        practice: { type: 'mc', prompt: 'In TAB, "5h7" tells you to:',
          choices: ['Pick the 5th fret note, then HAMMER your finger onto the 7th fret without re-picking', 'Pick both notes hard', 'Hold the 5th fret for 7 beats', 'Skip to the 7th fret'], answer: 0 } },
      { id: 'm7w1-s4', text: 'Play the "Smoke on the Water" main riff in time',
        gotItWhen: 'you can play the full riff at 70 BPM with both notes ringing together cleanly — no buzzing, no missed double-stops.',
        practice: { type: 'playSeq', label: '"Smoke on the Water" — D string melody only', bpm: 70,
          notes: [50, 53, 55, 50, 53, 56, 55] } },
      { id: 'm7w1-s5', text: 'Play a riff that mixes single notes and double-stops from TAB',
        gotItWhen: 'you can sight-read a beginner riff that combines single notes and 2-note chord stabs and play it cleanly the first time through at half speed.' },
      { id: 'm7w1-s6', text: 'Find a TAB online for a new song and play through it',
        gotItWhen: 'you can pick a song you like, find a beginner TAB (Ultimate Guitar, Songsterr), and get through at least one section without asking for help.' }
    ]
  },

  {
    id: 'm7w2',
    label: 'Set 2',
    locked: false,
    module: 'TAB Notation and Barre Chords',
    moduleNum: 7,
    unit: 'Module 7 · TAB Notation and Barre Chords',
    title: 'Set 2',
    subtitle: 'E-shape barre chords · F, F#, G barre · Moving the shape up the neck',
    objective: 'I CAN form a clean E-shape barre chord and move it up the neck to play F, F#, G, A, and B major.',
    skillFocus: 'Forming a clean E-shape barre chord · Moving the barre up the neck · Naming barre chords by their root',
    handoutUrl: 'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/4cR1sa1_d_8" target="_blank">The Easiest F Chord Guitar Lesson You\'ll Find – JustinGuitar</a> (0:00–4:00).',
            hint: 'The F barre is famously hard. It\'s the lowest barre, where the strings are tightest, so it\'s the toughest spot — G and A higher up are easier. Watch his THUMB: keep it on the BACK of the neck, behind your index. That\'s where the squeezing power comes from.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'For the cleanest E-shape barre, where should your THUMB go?',
              answer: 1,
              explain: 'Plant the thumb on the BACK of the neck, roughly behind your index finger. That gives the squeezing leverage a barre needs — wrapping it over the top kills your strength.',
              choices: [
              'Wrapped over the top of the neck',
              'On the BACK of the neck, roughly behind your index finger',
              'Pointing toward the ceiling',
              'It doesn\'t matter where the thumb goes'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/MpMhueVEz2g" target="_blank">Basic Barre Chords #1 — the E shape (CH-006) – JustinGuitar</a> (0:00–4:00).',
            hint: 'The "E shape" is literally the E major open chord, but you slide your fingers up the neck and use your INDEX finger to "be the nut" (the bar).',
            skills: [2, 3],
            response: { type: 'short', placeholder: 'Why is it called an "E-shape" barre chord? What does the shape have in common with the open E major chord?' }
          },
          {
            text: 'Station Wrap-Up — barre chords are a strength skill that takes weeks, not minutes. What is one small thing that improved today, even if the whole chord isn\'t ringing yet?',
            response: { type: 'short', placeholder: 'e.g. the low strings ring now — just the B string left to fix' }
          }
        ]
      },
      c: {
        title: 'Practice station — building the barre',
        sections: [
          {
            title: 'Bar all 6 strings with your index finger',
            steps: [
          {
            text: 'Challenge 1 — Just the Bar: lay your index finger flat across all 6 strings at the 5th fret — bar only, no other fingers — and strum. You\'ve got it when: all 6 strings ring, rolling the index slightly onto its bonier edge.',
            hint: 'Roll your index finger slightly toward its outer edge — that side is bonier and gives a cleaner bar. The power comes from the thumb on the back of the neck, not from squeezing the whole hand.',
            stuck: 'Line the bar up right behind the fret. If the B string buzzes, it\'s usually sitting in a knuckle crease — shift the finger a hair up or down. Get just the top 3 strings ringing first, then chase the rest.',
            levelUp: 'Bar at the 1st fret (the hardest spot) and get all 6 ringing, or bar and slide cleanly up to the 7th fret and back.',
            skills: [1, 2],
            chords: [
              { name: '', chord: [[6,5,'1'],[5,5,'1'],[4,5,'1'],[3,5,'1'],[2,5,'1'],[1,5,'1']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Form the E-shape barre',
            steps: [
          {
            text: 'Challenge 2 — E-Shape Barre: add the E-shape on top of the bar at the 5th fret for A major (ring str 5/fret 7, pinky str 4/fret 7, middle str 3/fret 6) and strum all 6. You\'ve got it when: a full, clean A major barre — master it here before tackling F.',
            hint: 'It\'s the open E major shape moved up — index finger replaces the "nut". Practice this at the 5th fret BEFORE attempting F at fret 1. If your hand cramps, that\'s normal — shake it out and come back.',
            stuck: 'Stage it: (1) get the bar across fret 5 clean, (2) add ring + pinky on strings 5–4, (3) add the middle on string 3 last — pluck each string to find the muffled one before moving on. Short tries beat one long grind.',
            levelUp: 'Slide the whole shape up to the 7th fret (B major) and keep every string ringing.',
            skills: [2, 3, 4],
            chords: [
              { name: 'A major', chord: [[6,5,'1'],[5,7,'3'],[4,7,'4'],[3,6,'2'],[2,5,'1'],[1,5,'1']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Find the power chord hiding inside your F barre',
            steps: [
          {
            text: 'Challenge — Spot the Power Chord: form your F major barre, then look at just strings 6 and 5 — low E (fret 1) + A (fret 3). That is exactly the F5 power chord you learned in Module 3. The barre just stacks the rest of the chord on top. You\'ve got it when: play F5 alone, then add the barre fingers to make full F — and hear the power chord living inside it.',
            hint: 'Barre chords feel less scary once you see them as a power chord you already know, plus a few extra notes. And just like a power chord, you name the barre by its root on string 6 — that\'s your Module 2 + Module 3 skills combining.',
            stuck: 'If full F won\'t ring yet, fall back to just the F5 power chord (strings 6–5) and add one string at a time upward — the full bar comes last.',
            levelUp: 'Do the same reveal at G (fret 3): play G5, then stack the full G barre on top and hear the power chord inside it.',
            skills: [3, 4],
            chords: [
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'F major', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Slide the E-shape: F, G, A',
            steps: [
          {
            text: 'Challenge 3 — F, G, A Slide (your assessment piece): slide the same shape to fret 1 (F), fret 3 (G), and fret 5 (A) — same shape, three chords. You\'ve got it when: G and A ringing clean, then F — the hardest — without buzzing.',
            hint: 'F is the hardest position — don\'t panic if it buzzes. Barre chords are a hand-strength skill. If your hand cramps, shake it out and rest. Short, frequent tries beat one long painful grind, and the strength comes within a couple of weeks.',
            stuck: 'Build the barre in stages: (1) bar + just the low-E root, (2) add strings 5–4, (3) add the B and high E last — win each stage before stacking the next. Start at G or A (frets 3–5) where the strings are looser, then bring the shape down to F.',
            levelUp: 'Add B at the 7th fret as a 4th chord, or switch F→G→A in time at 70 BPM.',
            skills: [4, 5, 6],
            chords: [
              { name: 'F major', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
              { name: 'G major', chord: [[6,3,'1'],[5,5,'3'],[4,5,'4'],[3,4,'2'],[2,3,'1'],[1,3,'1']], position: 3 },
              { name: 'A major', chord: [[6,5,'1'],[5,7,'3'],[4,7,'4'],[3,6,'2'],[2,5,'1'],[1,5,'1']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'One-Minute Barre Changes — beat your record',
            steps: [
              {
                text: 'Challenge 4 — One-Minute Barre Changes (F ↔ G): set the ⏱ Timer for 60 seconds and slide your E-shape barre between F (fret 1) and G (fret 3) as many times as you can — only changes where all 6 strings ring count. You\'ve got it when: type your count below and beat it next class. (Even 6–8 clean ones is a real win for barres.)',
                hint: 'It\'s the same shape sliding two frets — keep the bar pressed and glide, don\'t lift and re-place. Quality over speed.',
                stuck: 'Keep the bar lightly down the whole time so you never fully reset the shape — just shift two frets. Slow down until both chords ring.',
                levelUp: 'Add A (fret 5) and cycle F→G→A, or run it with a down-up strum.',
                skills: [4, 6],
                response: { type: 'short', prompt: 'Personal record — clean F↔G barre changes in 60 seconds. Your count today?', placeholder: 'e.g. 8 — beat it next class' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Which string in your barre is most likely to buzz right now — the B string, the high E, or the G? Name it; isolating that one string is your first job next class.',
                response: { type: 'short', placeholder: 'e.g. the B string — it sits in my finger crease' }
              }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"Hey Jude" — The Beatles', meta: 'F major in the chorus · perfect E-shape barre application', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=A_MjCqQoLLA',
        tutorialUrl: 'https://www.youtube.com/watch?v=VyleoeWxbIQ' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Full barre Bm in the chorus (instead of the simplified shape)', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=UlkG3DmZJEI',
        tutorialUrl: 'https://www.youtube.com/watch?v=F4BbTdP2v70' },
      { name: '"Wonderwall" — Oasis', meta: 'Easier with barre chords once you have them down', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=6hzrDeceEKc',
        tutorialUrl: 'https://www.youtube.com/watch?v=5V81btmYxgE' },
      { name: '"Hotel California" — Eagles', meta: 'Bm–F#–A–E·G–D–Em–F# · lots of barre practice', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=09839DpTctU',
        tutorialUrl: 'https://www.youtube.com/watch?v=JIDdI-AtK-Q' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Barre the D–C–G verse · intro riff = late-semester stretch goal', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"21 Guns" — Green Day', meta: 'Dm–Bb–F–C · F barre in chorus', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=r00ikilDxW4',
        tutorialUrl: 'https://www.youtube.com/watch?v=YUw1eQUArTc' },
      { name: '"Mad World" — Gary Jules / Tears for Fears', meta: 'Em–G–D–A · barre chord workout', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=etSbOs3aUqI',
        tutorialUrl: 'https://www.youtube.com/watch?v=r-rvJsxhkQM' },
      { name: '"Roxanne" — The Police', meta: 'G–Em–F#m–D7 · classic E-shape barre song', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=3T1c7GkzRQQ',
        tutorialUrl: 'https://www.youtube.com/watch?v=3wUzjMcdYmk' }
    ],

    assessment: {
      goal: 'Bars all 6 strings cleanly with index finger · Forms E-shape barre with no buzzing · Plays F, G, A barre chords cleanly · Names a barre chord by its root note on string 6 · Switches between two barre chords in time',
      performance: 'Solo: play F barre, slide to G barre, slide to A barre — one strum each, all clean. Teacher checks for buzz on the B and high E strings.',
      selfCheck: 'Can your F barre ring without buzzing? Can you name the chord when you see an E-shape barre at the 7th fret? (Answer: B major.)',
      standards: ['Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm7w2-s1', text: 'Bar all 6 strings cleanly with my index finger',
        gotItWhen: 'with only your index finger flat across the 5th fret, you can strum and every one of the 6 strings rings — no muffled strings, no buzz.',
        practice: { type: 'mc', prompt: 'Which side of your index finger is best for a clean barre?',
          choices: ['The fleshy front pad', 'The bony outer edge (rolled slightly)', 'Either works equally well', 'The fingernail side'], answer: 1 } },
      { id: 'm7w2-s2', text: 'Position my thumb correctly behind the neck for barre chords',
        gotItWhen: 'your thumb sits on the BACK of the neck — roughly behind your index finger — and you can feel a pinching motion between thumb and index when you squeeze.',
        practice: { type: 'mc', prompt: 'For maximum squeezing power on a barre chord, your thumb should be:',
          choices: ['Wrapped over the top of the neck (folk style)', 'On the BACK of the neck, behind the index finger', 'Floating in the air, not touching the neck', 'Pressing the strings'], answer: 1 } },
      { id: 'm7w2-s3', text: 'Form an E-shape barre chord at the 5th fret (A major) cleanly',
        gotItWhen: 'you can pluck each of the 6 strings individually in your A barre and every one rings — no muffled string from a cramped finger.' },
      { id: 'm7w2-s4', text: 'Play F major barre at the 1st fret',
        gotItWhen: 'your F barre at the 1st fret rings cleanly on at least 5 of 6 strings — including the B string, which is the trickiest for the bar.',
        practice: { type: 'playSeq', label: 'Hear F major (E-shape barre, arpeggiated)', bpm: 60,
          notes: [41, 48, 53, 57, 60, 65] } },
      { id: 'm7w2-s5', text: 'Name an E-shape barre chord by its root note on string 6',
        gotItWhen: 'someone places your E-shape barre at any fret and you can name the chord instantly — because you know the notes on the low E string from Module 2.',
        practice: { type: 'mc', prompt: 'If you play an E-shape barre chord with your index finger on the 7th fret of string 6, what chord is it?',
          choices: ['G major', 'A major', 'B major', 'C major'], answer: 2 } },
      { id: 'm7w2-s6', text: 'Switch between F, G, and A barre chords in time at 60 BPM',
        gotItWhen: 'you can play 2 bars of F, 2 bars of G, 2 bars of A, looping, at 60 BPM — same shape, just sliding up and down the neck.',
        practice: { type: 'playSeq', label: 'F · G · A roots (low E string)', bpm: 60,
          notes: [41, 43, 45] } }
    ]
  },

  {
    id: 'm7w3',
    label: 'Set 3',
    locked: false,
    module: 'TAB Notation and Barre Chords',
    moduleNum: 7,
    unit: 'Module 7 · TAB Notation and Barre Chords',
    title: 'Set 3',
    subtitle: 'A-shape barre chords · Bb, B, C barre · Combining E-shape and A-shape',
    objective: 'I CAN form a clean A-shape barre chord and combine E-shape and A-shape barre chords in a real song.',
    skillFocus: 'Forming a clean A-shape barre chord · Naming A-shape chords by their root · Combining E-shape and A-shape chords in a song',
    handoutUrl: 'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/C7k0CWgI-xI" target="_blank">A Shape Major Barre Chords on Guitar – JustinGuitar</a> (0:00–4:00).',
            hint: 'The A-shape uses the open A major chord, moved up the neck. Some players bar strings 2, 3, 4 with their RING finger only — it\'s a different technique from the E-shape.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'The A-shape barre chord places its ROOT note on which string?',
              answer: 1,
              explain: 'The A-shape is rooted on string 5 (the A string) — so the fret your barre sits on, on the A string, names the chord. (The E-shape is rooted on string 6.)',
              choices: [
              'String 6 (low E)',
              'String 5 (A)',
              'String 4 (D)',
              'String 1 (high e)'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/MpMhueVEz2g" target="_blank">Basic Barre Chords (CH-006) – JustinGuitar</a> (0:00–4:00 — rewatch with A-shape focus).',
            hint: 'B major is a great A-shape practice chord — it lives at the 2nd fret with the root on string 5. Listen for the muted high E (string 1) — that\'s normal for an A-shape barre.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'When you play an A-shape barre, what should happen to string 1 (the high e)? Is it played or muted? Why?' }
          },
          {
            text: 'Station Wrap-Up — you now know both barre shapes. Which feels harder right now — the E-shape (root on string 6) or the A-shape (root on string 5) — and what makes it tougher for your hand?',
            response: { type: 'short', placeholder: 'e.g. the A-shape — barring 4-3-2 with my ring finger is awkward' }
          }
        ]
      },
      c: {
        title: 'Practice station — A-shape and combining',
        sections: [
          {
            title: 'Form the A-shape barre',
            steps: [
          {
            text: 'Challenge 1 — A-Shape B Major: index bars all 6 strings at fret 2, fingers on strings 4/3/2 at fret 4, strum strings 5–1 (let the index mute string 6). You\'ve got it when: a clean B major with the string-5 bass ringing and no low E.',
            hint: 'Avoid the low E string (string 6) — your index finger mutes it for you. Aim your strum from string 5 downward.',
            stuck: 'Stage it: (1) bar fret 2 and get strings 5 and 1 ringing, (2) add the ring-finger sub-barre on strings 4-3-2 at fret 4 last. The ring finger is the tricky part — arch it so the high E still rings. Cramping is normal; shake it out.',
            levelUp: 'Slide the whole A-shape up to C (3rd fret) and keep it clean.',
            skills: [1, 2, 3],
            chords: [
              { name: 'B major', chord: [[6,'x'],[5,2,'1'],[4,4,'3'],[3,4,'3'],[2,4,'3'],[1,2,'1']], position: 2 }
            ]
          }
            ]
          },
          {
            title: 'Slide the A-shape: C, D, E',
            steps: [
          {
            text: 'Challenge 2 — A-Shape Slide: slide the A-shape to C (3rd fret), D (5th fret), and E (7th fret), strumming strings 5–1 only. You\'ve got it when: name each by its string-5 root and play all three clean.',
            hint: 'The A-shape is named by the root note on string 5. Apply your Module 2 A-string note knowledge: fret 3 of A = C, fret 5 of A = D, fret 7 of A = E.',
            stuck: 'Higher frets (D, E) are easier — the strings are looser, so win those first, then bring the shape down to C. Keep the bar pressed and slide rather than lifting between chords.',
            levelUp: 'Run C→D→E in time at 70 BPM, or add F at the 8th fret.',
            skills: [3, 4],
            chords: [
              { name: 'C', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,5,'3'],[2,5,'3'],[1,3,'1']], position: 3 },
              { name: 'D', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,7,'3'],[2,7,'3'],[1,5,'1']], position: 5 },
              { name: 'E', chord: [[6,'x'],[5,7,'1'],[4,9,'3'],[3,9,'3'],[2,9,'3'],[1,7,'1']], position: 7 }
            ]
          }
            ]
          },
          {
            title: 'Every chord has two homes (E-shape ↔ A-shape)',
            steps: [
          {
            text: 'Challenge 3 — Two Homes for F: play F as an E-shape barre (index on string 6, fret 1), then play the SAME chord as an A-shape barre (index on string 5, fret 8). Same note name, two places on the neck. Pluck both and listen — same chord, slightly different colour. You\'ve got it when: find and play both Fs, and say WHY they are both F (read the root: low E + 1 fret = F; A string + 8 frets = F).',
            hint: 'This is your Module 2 fretboard map paying off: the root note names the chord, so wherever an F lives on string 6 or string 5, an F barre lives there too. Knowing both homes means you are never far from any chord.',
            stuck: 'Find the root note first, then build the shape around it. Low E + 1 fret = F (E-shape home); A string + 8 frets = F (A-shape home). The shape follows the root.',
            levelUp: 'Find both homes for G (E-shape fret 3, A-shape fret 10) and for C (A-shape fret 3, E-shape fret 8).',
            skills: [5, 6],
            chords: [
              { name: 'F (E-shape)', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
              { name: 'F (A-shape)', chord: [[6,'x'],[5,8,'1'],[4,10,'3'],[3,10,'3'],[2,10,'3'],[1,8,'1']], position: 8 }
            ]
          }
            ]
          },
          {
            title: 'Combine E-shape & A-shape barres',
            steps: [
          {
            text: 'Challenge 4 — Shape Combo (your assessment piece): alternate E-shape and A-shape — F (E, 1st), C (A, 3rd), G (E, 3rd), D (A, 5th), 2 bars each at 60 BPM. You\'ve got it when: smooth switches between the two shapes, landing each change on beat 1.',
            hint: 'You\'re alternating between E-shape and A-shape with each chord change. This is what real songs ask for. Notice that some chord changes are tiny hand moves — barely shift positions.',
            stuck: 'Drill one pair at a time — F→C, then G→D — before running all four. Some moves are tiny (G E-shape fret 3 → D A-shape fret 5 is a short hop). Drop to 50 BPM if the changes fall apart.',
            levelUp: 'Run it with the D-DU-UDU strum, or push to 75 BPM.',
            skills: [5, 6],
            response: { type: 'short', prompt: 'Personal record — win the F–C–G–D switch at 60 BPM, then +5 at a time. Your fastest CLEAN loop today (BPM)?', placeholder: 'e.g. 70 — beat it next class' },
            chords: [
              { name: 'F', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
              { name: 'C', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,5,'3'],[2,5,'3'],[1,3,'1']], position: 3 },
              { name: 'G', chord: [[6,3,'1'],[5,5,'3'],[4,5,'4'],[3,4,'2'],[2,3,'1'],[1,3,'1']], position: 3 },
              { name: 'D', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,7,'3'],[2,7,'3'],[1,5,'1']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Strum the barre chords with a D-DU-UDU pattern',
            steps: [
          {
            text: 'Challenge — Groove the Barres: take a barre progression (F–C–G–D, or Am–G–F as barres) and play it with the D-DU-UDU pattern from Module 6 instead of one strum per bar. You\'ve got it when: the strum pattern stays steady and even while you switch barre shapes — the groove doesn\'t break at the chord change.',
            hint: 'You spent Module 6 making that strum automatic — now layer it onto the harder barre chords. If the pattern falls apart at a change, slow the metronome until barre + strum hold together.',
            stuck: 'Strip it back: play the progression as one strum per bar until the changes are clean, THEN layer the D-DU-UDU pattern on top. Add the rhythm only once the chords land.',
            levelUp: 'Push the tempo, or accent beats 2 and 4 for a backbeat feel.',
            skills: [5, 6]
          }
            ]
          },
          {
            title: '🌶️ Level-up — the Sweet Child O\' Mine intro riff (stretch goal)',
            steps: [
          {
            text: '🌶️ Give it a go: learn the most famous riff in the course. The "Sweet Child O\' Mine" intro lives up high on the D, G, and B strings around the 12th–15th frets, picked one note at a time. Watch <a href="https://youtu.be/t3yol_zrt7g" target="_blank">How to Play the Intro for Sweet Child O\' Mine – JustinGuitar</a>, learn just the first bar, and play it slowly. No score, no rush — this is a late-semester stretch goal you can keep chipping at.',
            hint: 'Heads up: the lesson teaches it in E♭ tuning (a half-step down), so on your standard-tuned guitar it will sound a half-step higher than the video — that\'s part of the challenge, not a mistake. The frets and finger shapes are exactly the same. Loop just the first bar until it\'s clean before adding more.',
            skills: [3, 6]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'You\'ve reached the hardest hands-on skill in the course — give yourself credit for that. Which barre (E-shape or A-shape, and at which chord) most needs another week of short daily tries? Write it; that\'s your standing warm-up from here.',
                response: { type: 'short', placeholder: 'e.g. the F barre at fret 1 — a few clean tries every day' }
              }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am–G–F · use barre shapes for all three', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Full barre-chord progression · Bm–G', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=UlkG3DmZJEI',
        tutorialUrl: 'https://www.youtube.com/watch?v=F4BbTdP2v70' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Barre the D–C–G verse', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"Tu Boda" — Oscar Maydon × Fuerza Regida', meta: 'Barre-chord sierreño progression', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=_ymicn0_GYc',
        tutorialUrl: 'https://www.youtube.com/watch?v=AlElh28IumI' },
      { name: '"Happy Birthday"', meta: 'Play it entirely with barre chords this time', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Songbird" — Oasis', meta: 'G–Em–C–D · easy barre practice', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=0KJgBkreAuw' },
      { name: '"Boulevard of Broken Dreams" — Green Day', meta: 'Em–G–D–A · power chord + barre combo', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=Soa3gO7tL-c',
        tutorialUrl: 'https://www.youtube.com/watch?v=dxMFex_yAjQ' },
      { name: '"Every Breath You Take" — The Police', meta: 'A–F#m–D–E · barre workout', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=OMOGaugKpzs',
        tutorialUrl: 'https://www.youtube.com/watch?v=kiw_wzMx8UU' },
      { name: '"Zombie" — The Cranberries', meta: 'Em–C–G–D · mix open and barre', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=6Ejga4kJUts',
        tutorialUrl: 'https://www.youtube.com/watch?v=uGMybMuDKAU' },
      { name: '"Photograph" — Ed Sheeran', meta: 'E–B–C#m–A · A-shape barre everywhere', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=nSDgHBxUbVQ',
        tutorialUrl: 'https://www.youtube.com/watch?v=4FYojqHn4EI' }
    ],

    assessment: {
      goal: 'Forms A-shape barre cleanly · Plays Bb, B, C as A-shape barre · Names an A-shape barre by its root on string 5 · Switches between E-shape and A-shape barre in a progression · Plays a full song using only barre chords',
      performance: 'Solo: play a 4-chord progression (e.g., F-C-G-D or Am-G-F-C) entirely with barre chords, 2 bars each, at 60 BPM. Teacher listens for clean tone on every chord.',
      selfCheck: 'Can you play the same chord (say F major) two different ways — as E-shape and as A-shape? Can you switch between the two shapes mid-song without thinking?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm7w3-s1', text: 'Form an A-shape barre chord cleanly at the 2nd fret (B major)',
        gotItWhen: 'your B barre rings cleanly on strings 5 to 1 — and string 6 (low E) is muted by your index finger so it doesn\'t accidentally sound.',
        practice: { type: 'playSeq', label: 'Hear B major (A-shape barre, arpeggiated)', bpm: 60,
          notes: [47, 54, 59, 63, 66] } },
      { id: 'm7w3-s2', text: 'Mute string 6 (low E) when playing an A-shape barre',
        gotItWhen: 'your index finger lightly mutes string 6 so you don\'t have to think about avoiding it when strumming — even a slightly wide strum sounds fine.',
        practice: { type: 'mc', prompt: 'In an A-shape barre chord, what happens to the low E string (string 6)?',
          choices: ['It rings as part of the chord', 'It is muted by the side of your index finger', 'You skip your strum carefully', 'You tune it to a different note'], answer: 1 } },
      { id: 'm7w3-s3', text: 'Name an A-shape barre chord by its root note on string 5',
        gotItWhen: 'someone places your A-shape barre at any fret and you can name the chord by reading the note on string 5 (using your Module 2 knowledge).',
        practice: { type: 'mc', prompt: 'If you play an A-shape barre chord with your index finger on the 5th fret of string 5, what chord is it?',
          choices: ['C major', 'D major', 'E major', 'A major'], answer: 1 } },
      { id: 'm7w3-s4', text: 'Play Bb, C, and D as A-shape barre chords',
        gotItWhen: 'you can slide the A-shape between Bb (1st fret), C (3rd fret), and D (5th fret) and each chord rings cleanly with no muffled strings.',
        practice: { type: 'playSeq', label: 'Bb · C · D roots (A string)', bpm: 60,
          notes: [46, 48, 50] } },
      { id: 'm7w3-s5', text: 'Switch between an E-shape barre and an A-shape barre in time',
        gotItWhen: 'you can go from F (E-shape, 1st fret) to C (A-shape, 3rd fret) on beat 1 of a new bar at 60 BPM without buzzing or pausing.' },
      { id: 'm7w3-s6', text: 'Play a full song using only barre chords (no open chords)',
        gotItWhen: 'you can play "All Along the Watchtower" or another 3-chord song from start to finish using ONLY barre chords — proving you no longer need the open shapes.',
        practice: { type: 'playSeq', label: 'F · C · G · D barre progression (roots)', bpm: 60,
          notes: [41, 48, 43, 50] } }
    ]
  }

); // end module-7.js

MODULE_REVIEWS[7] = {
  moduleNum: 7,
  module: 'TAB Notation and Barre Chords',
  skills: [
    { id: 'mr7-s1', text: 'I can read multi-line TAB — stacked numbers as chords, plus the rhythm symbols (quarter, 8th, half) above the notes', set: 'm7w1' },
    { id: 'mr7-s2', text: 'I can recognise hammer-on (h), pull-off (p), and slide (/ \\) markings in TAB and play them', set: 'm7w1' },
    { id: 'mr7-s3', text: 'I can bar all 6 strings with my index finger so every string rings', set: 'm7w2' },
    { id: 'mr7-s4', text: 'I can form an E-shape barre and play F, G, and A cleanly, naming each by its root on string 6', set: 'm7w2' },
    { id: 'mr7-s5', text: 'I can form an A-shape barre and play B, C, and D cleanly, naming each by its root on string 5', set: 'm7w3' },
    { id: 'mr7-s6', text: 'I can find both "homes" for a chord — its E-shape (string-6 root) and A-shape (string-5 root) — and switch between the two shapes in a progression', set: 'm7w3' }
  ],
  assessItems: [
    'Play F barre → slide to G → slide to A, one clean strum each (E-shape, root on string 6)',
    'Play a 4-chord progression mixing E-shape and A-shape barres (e.g. F–C–G–D), 2 bars each, at 60 BPM'
  ],
  forward: 'Module 8 hands the spotlight to your <strong>picking hand</strong>. Every barre and open shape you can now hold becomes a chord frame that fingerpicking decorates one string at a time — the fretting work you just did is exactly what makes those patterns sound full.',
  standards: ['Pr.4a', 'Pr.5a', 'Re.7a']
};
