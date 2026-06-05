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
    skillFocus: 'TAB stacked-number reading (chords vs. melody) · Rhythm notation above TAB (whole, half, quarter, eighth) · Slides, hammer-ons, pull-offs in TAB · Reading riffs that mix notes and chords',
    handoutUrl: 'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/4-JTCASlh-w" target="_blank">How To Read TAB and Chord Boxes (BC-108) – JustinGuitar</a> (full video).',
            hint: 'You\'ve been reading single-note TAB since Module 1. This time, pay attention to when numbers are STACKED vertically — that means play them at the same time (a chord).',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'When two or more numbers in a TAB line up VERTICALLY on top of each other, you should:', choices: [
              'Play them at the same time (as a chord)',
              'Play them one after another, lowest first',
              'Skip them',
              'Pick whichever one you prefer'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/yDRMxDkSQ34" target="_blank">How to Read Guitar TAB: A Complete Beginner\'s Guide</a> (full video).',
            hint: 'TAB often has rhythm symbols above each note: stems mean quarter notes, flagged/beamed stems mean 8ths and 16ths, hollow notes mean half/whole notes. Pause and copy the examples shown.',
            skills: [2, 3],
            response: { type: 'short', placeholder: 'In your own words, how do you tell a quarter note from an eighth note in TAB?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/tCQ0r7vqkFQ" target="_blank">Smoke On The Water Guitar Lesson – Marty Music</a> (full video). This is the riff you\'ll learn in the Practice station.',
            hint: 'Notice that the riff uses 2-note "power chord" intervals played together — perfect example of stacked TAB numbers.',
            skills: [4, 5],
            response: { type: 'mc', prompt: 'The "Smoke on the Water" main riff uses which two strings most?', choices: [
              'Strings 1 and 2 (high e and B)',
              'Strings 6 and 5 (low E and A)',
              'Strings 5 and 4 (A and D)',
              'Strings 3 and 2 (G and B)'
            ] }
          }
        ]
      },
      c: {
        title: 'Practice station — riffs from TAB',
        sections: [
          {
            title: 'Warm-up — tune & tone check (Modules 1–2)',
            steps: [
              {
                text: 'Start every class the same way: tune all 6 strings to green (E A D G B e), then play each string open and at the 1st–3rd fret, listening for buzz. Win: in tune, and every note clean before today\'s work.',
                hint: 'Tuning (Module 1) and clean notes (Module 2) are skills you keep forever. Reading TAB today is faster when you also name the notes you land on — that\'s your Module 2 fretboard map.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Read a riff with stacked TAB (double-stops)',
            steps: [
          {
            text: 'Challenge 1 — Smoke on the Water: play the main riff with index + ring locked as a unit on the A + D strings — 0/0 — 3/3 — 5/5 — 0/0 — 3/3 — 6/6 — 5/5. Win: both notes ring at the same volume, clean through the whole riff. Use the TAB below.',
            hint: 'Use your index and ring finger together — keep them locked in shape and slide as a unit. Both notes should ring at the same volume.',
            skills: [1, 4, 5],
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
            text: 'Challenge 2 — Crazy Train: play the intro riff on the E and A strings with alternate picking, watching the 8th vs. quarter notes in the TAB. Win: clean and even at 60 BPM before you speed it up.',
            hint: 'Use alternate picking (down-up-down-up). The riff is fast — start at 60 BPM and only speed up when it\'s clean.',
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
      { name: '"Iron Man" — Black Sabbath', meta: 'Slow, heavy riff · perfect for rhythm reading', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=iFgqckcGpDA',
        tutorialUrl: 'https://www.youtube.com/watch?v=TSxIMjP5lkM' },
      { name: '"Sunshine of Your Love" — Cream', meta: 'Classic rock riff in E', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=HbqQL0J_Vr0',
        tutorialUrl: 'https://www.youtube.com/watch?v=Ouo2Ek2S_Lo' },
      { name: '"Day Tripper" — The Beatles', meta: 'Iconic 8th-note riff', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=AYZlME0mQB8',
        tutorialUrl: 'https://www.youtube.com/watch?v=aEop5yAw1wU' },
      { name: '"Beat It" — Michael Jackson', meta: 'Intro riff in E minor', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=oRdxUFDoQe0',
        tutorialUrl: 'https://www.youtube.com/watch?v=jJfwgrDcH3A' },
      { name: '"Come As You Are" — Nirvana', meta: 'Low-string riff · clear rhythm', type: 'Choice', core: false,
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
    skillFocus: 'Index finger barre across all 6 strings · The "E shape" moved up · Thumb position behind the neck · Naming barre chords by the root on string 6 · F major barre · Moving to F#, G, A, B',
    handoutUrl: 'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/4cR1sa1_d_8" target="_blank">The Easiest F Chord Guitar Lesson You\'ll Find – JustinGuitar</a> (full video).',
            hint: 'The F barre chord is famously hard. Pay attention to his THUMB — it should be on the BACK of the neck, not poking over the top. That\'s where the squeezing power comes from.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'For the cleanest E-shape barre, where should your THUMB go?', choices: [
              'Wrapped over the top of the neck',
              'On the BACK of the neck, roughly behind your index finger',
              'Pointing toward the ceiling',
              'It doesn\'t matter where the thumb goes'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/74pHRVA39Q4" target="_blank">Marty Schwartz Teaches Barre Chord Tricks For Beginners</a> (full video).',
            hint: 'The "E shape" is literally the E major open chord, but you slide your fingers up the neck and use your INDEX finger to "be the nut" (the bar).',
            skills: [2, 3],
            response: { type: 'short', placeholder: 'Why is it called an "E-shape" barre chord? What does the shape have in common with the open E major chord?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/rrB97F0Qu6g" target="_blank">How to Actually Get Good at Guitar – Simen Otnes</a> (0:00–5:00).',
            hint: 'F is hard because it\'s the LOWEST barre chord — the strings are tightest there. Higher up the neck (G, A, B) is actually easier. Apply Simen\'s "deliberate practice" idea: focus on the hardest 4 bars, not the whole song.',
            skills: [3, 4],
            response: { type: 'mc', prompt: 'Where on the neck is the E-shape barre chord USUALLY the hardest to play cleanly?', choices: [
              'High up the neck (e.g., 12th fret)',
              'In the middle (5th–7th fret)',
              'The 1st fret (F) — strings are tightest there',
              'It is equally hard everywhere'
            ] }
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
            text: 'Challenge 1 — Just the Bar: lay your index finger flat across all 6 strings at the 5th fret — bar only, no other fingers — and strum. Win: all 6 strings ring, rolling the index slightly onto its bonier edge.',
            hint: 'Roll your index finger slightly toward its outer edge — that side is bonier and gives a cleaner bar. If some strings buzz, press harder with your thumb on the back.',
            skills: [1, 2],
            chords: [
              { name: 'A barre (index bar only)', chord: [[6,5,'1'],[5,5,'1'],[4,5,'1'],[3,5,'1'],[2,5,'1'],[1,5,'1']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Form the E-shape barre',
            steps: [
          {
            text: 'Challenge 2 — E-Shape Barre: add the E-shape on top of the bar at the 5th fret for A major (ring str 5/fret 7, pinky str 4/fret 7, middle str 3/fret 6) and strum all 6. Win: a full, clean A major barre — master it here before tackling F.',
            hint: 'It\'s the open E major shape moved up — index finger replaces the "nut". Practice this at the 5th fret BEFORE attempting F at fret 1.',
            skills: [2, 3, 4],
            chords: [
              { name: 'A major (E-shape barre, 5th fret)', chord: [[6,5,'1'],[5,7,'3'],[4,7,'4'],[3,6,'2'],[2,5,'1'],[1,5,'1']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Find the power chord hiding inside your F barre',
            steps: [
          {
            text: 'Challenge — Spot the Power Chord: form your F major barre, then look at just strings 6 and 5 — low E (fret 1) + A (fret 3). That is exactly the F5 power chord you learned in Module 3. The barre just stacks the rest of the chord on top. Win: play F5 alone, then add the barre fingers to make full F — and hear the power chord living inside it.',
            hint: 'Barre chords feel less scary once you see them as a power chord you already know, plus a few extra notes. And just like a power chord, you name the barre by its root on string 6 — that\'s your Module 2 + Module 3 skills combining.',
            skills: [3, 4],
            chords: [
              { name: 'F5 power chord (Module 3)', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'F major (full E-shape barre)', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Slide the E-shape: F, G, A',
            steps: [
          {
            text: 'Challenge 3 — F, G, A Slide: slide the same shape to fret 1 (F), fret 3 (G), and fret 5 (A) — same shape, three chords. Win: G and A ringing clean, then F — the hardest — without buzzing.',
            hint: 'F is the hardest position — don\'t panic if it buzzes. Get G and A clean first, then come back to F. The shape is the same.',
            skills: [4, 5, 6],
            chords: [
              { name: 'F major (E-shape barre, 1st fret)', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
              { name: 'G major (E-shape barre, 3rd fret)', chord: [[6,3,'1'],[5,5,'3'],[4,5,'4'],[3,4,'2'],[2,3,'1'],[1,3,'1']], position: 3 },
              { name: 'A major (E-shape barre, 5th fret)', chord: [[6,5,'1'],[5,7,'3'],[4,7,'4'],[3,6,'2'],[2,5,'1'],[1,5,'1']], position: 5 }
            ]
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
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Use F barre in the chorus (instead of simplified F)', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"Wonderwall" — Oasis', meta: 'Easier with barre chords once you have them down', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=6hzrDeceEKc',
        tutorialUrl: 'https://www.youtube.com/watch?v=5V81btmYxgE' },
      { name: '"Hotel California" — Eagles', meta: 'Bm–F#–A–E·G–D–Em–F# · lots of barre practice', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=09839DpTctU',
        tutorialUrl: 'https://www.youtube.com/watch?v=JIDdI-AtK-Q' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'D–C–G chorus uses barre forms', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=t3yol_zrt7g' },
      { name: '"21 Guns" — Green Day', meta: 'Dm–Bb–F–C · F barre in chorus', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=r00ikilDxW4',
        tutorialUrl: 'https://www.youtube.com/watch?v=YUw1eQUArTc' },
      { name: '"Mad World" — Gary Jules / Tears for Fears', meta: 'Em–G–D–A · barre chord workout', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=etSbOs3aUqI',
        tutorialUrl: 'https://www.youtube.com/watch?v=r-rvJsxhkQM' },
      { name: '"Roxanne" — The Police', meta: 'G–Em–F#m–D7 · classic E-shape barre song', type: 'Choice', core: false,
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
    skillFocus: 'A-shape barre (root on string 5) · Naming barre chords by the root on string 5 · The "ring finger sub-barre" · Bb, B, C major as A-shape · Combining E-shape and A-shape for any chord progression',
    handoutUrl: 'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/C7k0CWgI-xI" target="_blank">A Shape Major Barre Chords on Guitar – JustinGuitar</a> (full video).',
            hint: 'The A-shape uses the open A major chord, moved up the neck. Some players bar strings 2, 3, 4 with their RING finger only — it\'s a different technique from the E-shape.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'The A-shape barre chord places its ROOT note on which string?', choices: [
              'String 6 (low E)',
              'String 5 (A)',
              'String 4 (D)',
              'String 1 (high e)'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/74pHRVA39Q4" target="_blank">Marty Schwartz Teaches Barre Chord Tricks For Beginners</a> (full video — rewatch with A-shape focus).',
            hint: 'B major is a great A-shape practice chord — it lives at the 2nd fret with the root on string 5. Listen for the muted high E (string 1) — that\'s normal for an A-shape barre.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'When you play an A-shape barre, what should happen to string 1 (the high e)? Is it played or muted? Why?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/4cR1sa1_d_8" target="_blank">The Easiest F Chord Guitar Lesson – JustinGuitar</a> (rewatch with new ears).',
            hint: 'The big payoff: knowing both shapes means you can play ANY major chord in TWO places on the neck. F as E-shape (1st fret) or F as A-shape (8th fret). Same chord, different sound.',
            skills: [5, 6],
            response: { type: 'mc', prompt: 'If you know the E-shape barre AND the A-shape barre, how many ways can you play F major somewhere on the neck?', choices: [
              'Only one',
              'At least two (string 6 root and string 5 root)',
              'Only the open shape',
              'It depends on the song'
            ] }
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
            text: 'Challenge 1 — A-Shape B Major: index bars all 6 strings at fret 2, fingers on strings 4/3/2 at fret 4, strum strings 5–1 (let the index mute string 6). Win: a clean B major with the string-5 bass ringing and no low E.',
            hint: 'Avoid the low E string (string 6) — your index finger mutes it for you. Aim your strum from string 5 downward.',
            skills: [1, 2, 3],
            chords: [
              { name: 'B major (A-shape barre, 2nd fret)', chord: [[6,'x'],[5,2,'1'],[4,4,'3'],[3,4,'3'],[2,4,'3'],[1,2,'1']], position: 2 }
            ]
          }
            ]
          },
          {
            title: 'Slide the A-shape: C, D, E',
            steps: [
          {
            text: 'Challenge 2 — A-Shape Slide: slide the A-shape to C (3rd fret), D (5th fret), and E (7th fret), strumming strings 5–1 only. Win: name each by its string-5 root and play all three clean.',
            hint: 'The A-shape is named by the root note on string 5. Apply your Module 2 A-string note knowledge: fret 3 of A = C, fret 5 of A = D, fret 7 of A = E.',
            skills: [3, 4],
            chords: [
              { name: 'C (A-shape barre, 3rd fret)', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,5,'3'],[2,5,'3'],[1,3,'1']], position: 3 },
              { name: 'D (A-shape barre, 5th fret)', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,7,'3'],[2,7,'3'],[1,5,'1']], position: 5 },
              { name: 'E (A-shape barre, 7th fret)', chord: [[6,'x'],[5,7,'1'],[4,9,'3'],[3,9,'3'],[2,9,'3'],[1,7,'1']], position: 7 }
            ]
          }
            ]
          },
          {
            title: 'Combine E-shape & A-shape barres',
            steps: [
          {
            text: 'Challenge 3 — Shape Combo: alternate E-shape and A-shape — F (E, 1st), C (A, 3rd), G (E, 3rd), D (A, 5th), 2 bars each at 60 BPM. Win: smooth switches between the two shapes, landing each change on beat 1.',
            hint: 'You\'re alternating between E-shape and A-shape with each chord change. This is what real songs ask for. Notice that some chord changes are tiny hand moves — barely shift positions.',
            skills: [5, 6],
            chords: [
              { name: 'F (E-shape, 1st)', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
              { name: 'C (A-shape, 3rd)', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,5,'3'],[2,5,'3'],[1,3,'1']], position: 3 },
              { name: 'G (E-shape, 3rd)', chord: [[6,3,'1'],[5,5,'3'],[4,5,'4'],[3,4,'2'],[2,3,'1'],[1,3,'1']], position: 3 },
              { name: 'D (A-shape, 5th)', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,7,'3'],[2,7,'3'],[1,5,'1']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Strum the barre chords with a D-DU-UDU pattern',
            steps: [
          {
            text: 'Challenge — Groove the Barres: take a barre progression (F–C–G–D, or Am–G–F as barres) and play it with the D-DU-UDU pattern from Module 6 instead of one strum per bar. Win: the strum pattern stays steady and even while you switch barre shapes — the groove doesn\'t break at the chord change.',
            hint: 'You spent Module 6 making that strum automatic — now layer it onto the harder barre chords. If the pattern falls apart at a change, slow the metronome until barre + strum hold together.',
            skills: [5, 6]
          }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am–G–F · use barre shapes for all three', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'C (A-shape) · G (E-shape) · Am (A-shape) · F (E-shape)', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"Happy Birthday"', meta: 'Play it entirely with barre chords this time', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Songbird" — Oasis', meta: 'G–Em–C–D · easy barre practice', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=0KJgBkreAuw' },
      { name: '"Boulevard of Broken Dreams" — Green Day', meta: 'Em–G–D–A · power chord + barre combo', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=Soa3gO7tL-c',
        tutorialUrl: 'https://www.youtube.com/watch?v=dxMFex_yAjQ' },
      { name: '"Every Breath You Take" — The Police', meta: 'A–F#m–D–E · barre workout', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=OMOGaugKpzs',
        tutorialUrl: 'https://www.youtube.com/watch?v=kiw_wzMx8UU' },
      { name: '"Zombie" — The Cranberries', meta: 'Em–C–G–D · mix open and barre', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=6Ejga4kJUts',
        tutorialUrl: 'https://www.youtube.com/watch?v=uGMybMuDKAU' },
      { name: '"Photograph" — Ed Sheeran', meta: 'E–B–C#m–A · A-shape barre everywhere', type: 'Choice', core: false,
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
    { id: 'mr7-s1', text: 'I can read multi-line TAB with rhythm notation' },
    { id: 'mr7-s2', text: 'I can form a clean E-shape barre chord' },
    { id: 'mr7-s3', text: 'I can form a clean A-shape barre chord' }
  ],
  standards: ['Pr.4a', 'Pr.5a', 'Re.7a']
};
