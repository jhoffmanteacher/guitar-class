// ============================================================
//  GUITAR CLASS CONTENT CONFIG
//  This is the only file you need to edit for course content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

const WEEKS = [

  // ── MODULE 1: Introduction to Yourself & the Guitar ──────

  {
    id: 'w1',
    label: 'Set 1',
    locked: false,
    module: 'Introduction to Yourself & the Guitar',
    moduleNum: 1,
    unit: 'Module 1 · Introduction to Yourself & the Guitar',
    title: 'Set 1',
    subtitle: 'My Guitar Adventure · Goal-setting · Sharing',
    objective: 'I CAN describe why I want to play guitar and share a song that means something to me.',
    skillFocus: 'Goal-setting · "My Guitar Adventure" presentation · Class listening & discussion',
    handoutUrl: 'https://docs.google.com/document/d/1wKmQRDFbKsIci94PNRzoQkXoTVO6A017ELIZYvLtyCE/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Reflect',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/rrB97F0Qu6g" target="_blank">How to Actually Get Good at Guitar – Simen Otnes</a> (0:00–3:30).',
            hint: 'As you watch, think about: what is one habit he says makes the biggest difference? Does it match what you thought?',
            skills: [1]
          },
          {
            text: 'Find a YouTube clip of the song you shared (or one a classmate shared that you liked). Listen and notice: what is the guitar doing?',
            hint: 'Is it strumming chords? Playing a melody? Both? Just listen — you don\'t need to know the names yet.'
          }
        ]
      },
      c: {
        title: 'Practice station — explore the guitar',
        time: '12 min',
        steps: [
          {
            text: 'Pick up the guitar. Hold it in a comfortable position. Strum all 6 strings slowly with your thumb — just listen to the sound.',
            hint: 'Don\'t worry about pressing any frets yet. Just get used to holding it.'
          },
          {
            text: 'Try tapping the body, plucking one string at a time, and strumming. What differences do you notice?',
            hint: 'Curiosity is your best tool right now.'
          },
          {
            text: 'Write or sketch your guitar goal on a sticky note or in your journal. We\'ll revisit this at the end of the semester.',
            hint: 'It can be a song you want to play, a skill you want to build, or just a feeling.'
          }
        ]
      }
    },

    songs: [
      { name: 'Student choice — any song that means something to them', meta: 'Listening & sharing day · No playing required', type: 'Choice', core: false },
      { name: '"Happy Birthday"', meta: 'Course song thread — you\'ll play this all semester', type: 'Core', core: true },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Listen and identify guitar sounds', type: 'Core', core: true },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Listen and identify guitar sounds', type: 'Core', core: true }
    ],

    assessment: {
      goal: 'Can describe why they want to learn guitar · Can name one song that matters to them · Participates in class sharing',
      performance: 'Whole-class sharing circle — everyone shares, no one is on the spot. Listening and responding respectfully.',
      selfCheck: 'Can you name one reason you want to play? Can you name one song you\'d love to play by the end of the year?',
      standards: ['Pr.1a', 'Cn.11a']
    },

    skills: [
      { id: 'w1-s1', text: 'I can describe why I want to learn guitar' },
      { id: 'w1-s2', text: 'I can name one song that matters to me' },
      { id: 'w1-s3', text: 'I participated in class sharing and listened respectfully' }
    ]
  },


  {
    id: 'w2',
    label: 'Set 2',
    locked: false,
    module: 'Introduction to Yourself & the Guitar',
    moduleNum: 1,
    unit: 'Module 1 · Introduction to Yourself & the Guitar',
    title: 'Set 2',
    subtitle: 'Parts of the guitar · Posture · Tuning · First melody',
    objective: 'I CAN name 5+ parts of the guitar, tune all 6 strings, and play a short open-string melody at 60 BPM.',
    skillFocus: 'Parts of the guitar · Sitting posture · Pick grip & angle · String names (E A D G B e) · Tuning · Open-string melody',
    handoutUrl: 'https://docs.google.com/document/d/1wKmQRDFbKsIci94PNRzoQkXoTVO6A017ELIZYvLtyCE/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/8-grcbKnbps" target="_blank">How to Hold a Guitar Pick – JustinGuitar</a> (full video).',
            hint: 'Pause after each tip and check your own grip. Adjust before continuing.',
            skills: [3]
          },
          {
            text: 'Watch: <a href="https://youtu.be/ely9LaJJJr4" target="_blank">Your First Guitar Lesson – Marty Music</a> (0:00–5:00).',
            hint: 'Focus on posture and right-hand motion. Pause and try each thing he shows.',
            skills: [2, 3]
          },
          {
            text: 'Watch: <a href="https://youtu.be/9SgCKECFEjA" target="_blank">How to Tune a Guitar – JustinGuitar</a> (0:00–3:00).',
            hint: 'Follow along and tune your guitar while you watch.',
            skills: [4, 5]
          }
        ]
      },
      c: {
        title: 'Practice station — open-string melody',
        time: '12 min',
        steps: [
          {
            text: 'Tune your guitar first. Then practice playing single notes on the low E string: open (E), 1st fret (F), 3rd fret (G), 5th fret (A).',
            hint: 'Press just behind the fret, not on it. One clean note at a time.',
            skills: [5, 6]
          },
          {
            text: 'Try "Happy Birthday" on open strings only — your teacher will give you the note sequence. Set your metronome to 60 BPM.',
            hint: 'Go slow. Clean notes matter more than speed right now.',
            skills: [6]
          },
          {
            text: 'Choice: try one of the open-string melodies from the choice menu — Ode to Joy, Mary Had a Little Lamb, or Twinkle Twinkle.',
            hint: 'Use TAB or letter names. Ask a classmate for help if you get stuck.',
            skills: [6]
          }
        ]
      }
    },

    songs: [
      { name: '"Happy Birthday"', meta: 'Play melody on open strings — first real song!', type: 'Core', core: true },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Listen and identify guitar sounds in the recording', type: 'Core', core: true },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Listen and identify guitar sounds', type: 'Core', core: true },
      { name: '"Ode to Joy"', meta: 'E string only — great first melody', type: 'Choice', core: false },
      { name: '"Mary Had a Little Lamb"', meta: 'E & A strings', type: 'Choice', core: false },
      { name: '"Jingle Bells"', meta: 'Open strings only', type: 'Choice', core: false },
      { name: '"Twinkle Twinkle"', meta: 'E & A strings', type: 'Choice', core: false },
      { name: '"The Simpsons Theme"', meta: 'E string only', type: 'Choice', core: false }
    ],

    assessment: {
      goal: 'Names 5+ parts of the guitar · Holds guitar with correct posture · Holds pick with correct grip · Tunes all 6 strings · Plays a short open-string melody on E string at 60 BPM',
      performance: 'Whole-class unison open-string exercise. Everyone plays together — no one is on the spot.',
      selfCheck: 'Can you name 5 parts of the guitar? Can you tune all 6 strings with a tuner? Can you play a single note cleanly with no buzzing?',
      standards: ['Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'w2-s1', text: 'Name 5+ parts of the guitar (body, neck, headstock, frets, strings, tuning pegs, nut, saddle, bridge)' },
      { id: 'w2-s2', text: 'Hold the guitar with correct sitting posture' },
      { id: 'w2-s3', text: 'Hold the pick correctly — 3–4mm of tip showing' },
      { id: 'w2-s4', text: 'Name all 6 strings from memory (E A D G B e)' },
      { id: 'w2-s5', text: 'Tune all 6 strings with a tuner' },
      { id: 'w2-s6', text: 'Play a short open-string melody on the E string at 60 BPM' }
    ]
  },


  // ── MODULE 2: Notes on the E & A Strings ─────────────────

  {
    id: 'm2w1',
    label: 'Set 1',
    locked: false,
    module: 'Notes on the E & A Strings',
    moduleNum: 2,
    unit: 'Module 2 · Notes on the E & A Strings',
    title: 'Set 1',
    subtitle: 'Musical alphabet · Note names on E & A · Fretboard reading',
    objective: 'I CAN name all notes on the E and A strings (frets 0–8) and identify them on a fretboard diagram.',
    skillFocus: 'Musical alphabet (A–G) · Natural notes on E string (frets 0–8) · Natural notes on A string (frets 0–8) · Reading a note-name chart',
    handoutUrl: 'https://docs.google.com/document/d/1KM2rgUYa3NEpDr4E65YmcTE_g6Fxs_rbIjP-U1wjcnA/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/PNik7GWWBGA" target="_blank">Notes on the Low E String – JustinGuitar</a> (full video).',
            hint: 'Play along on your guitar as he goes through each note. Pause and find each note before he names it.',
            skills: [1, 2]
          },
          {
            text: 'Watch: <a href="https://youtu.be/k2jBLNzfEow" target="_blank">Fretboard Notes Made Easy – Marty Music</a> (0:00–4:00).',
            hint: 'Focus on the E and A strings only for now. What patterns does he point out?',
            skills: [1, 3]
          },
          {
            text: 'Listen to "Happy Birthday" — can you identify which notes of the melody live on the E or A string? Hum along and try to find the notes.',
            hint: 'Don\'t worry about playing it yet — just train your ear to connect sounds to strings.',
            skills: [5]
          }
        ]
      },
      c: {
        title: 'Practice station — fretboard drill',
        time: '12 min',
        steps: [
          {
            text: 'Tune your guitar. Using your note-name chart, play every natural note on the E string slowly: E · F · G · A · B · C. Say each name aloud.',
            hint: 'Hearing + saying + playing locks it in faster.',
            skills: [2]
          },
          {
            text: 'Now do the same on the A string: A · B · C · D · E · F. Play up to fret 8, then back down.',
            hint: 'Keep the metronome at 60 BPM. One note per beat.',
            skills: [3]
          },
          {
            text: 'Choice song: listen to "Seven Nation Army" or "Smoke on the Water" and try to pick out the main riff by ear on the E string.',
            hint: 'Use the note-name chart. Don\'t worry about getting it perfect — the attempt trains your ear.',
            skills: [5]
          }
        ]
      }
    },

    songs: [
      { name: '"Happy Birthday"', meta: 'Identify which notes live on E & A strings', type: 'Core', core: true },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Identify bass notes of intro on A string', type: 'Core', core: true },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Identify bass notes of riff on E & A', type: 'Core', core: true },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'E string riff — ear training & note ID', type: 'Choice', core: false },
      { name: '"Smoke on the Water" — Deep Purple', meta: 'E string — classic note recognition', type: 'Choice', core: false },
      { name: '"Another One Bites the Dust" — Queen', meta: 'A string bass notes', type: 'Choice', core: false },
      { name: '"Eye of the Tiger" — Survivor', meta: 'Riff on E & A — note identification', type: 'Choice', core: false },
      { name: '"Beat It" — Michael Jackson', meta: 'Intro riff on E string', type: 'Choice', core: false },
      { name: '"Day Tripper" — The Beatles', meta: 'Partial riff on E string', type: 'Choice', core: false }
    ],

    assessment: {
      goal: 'Names all notes on E string (frets 0–8) · Names all notes on A string (frets 0–8) · Points to a named note on the fretboard · Reads a basic fretboard note chart · Identifies notes in a familiar song',
      performance: 'Partner quiz: one student names a note, partner finds it on the fretboard. Then switch.',
      selfCheck: 'Can you name every natural note on the E string without looking? Can you find any note the teacher calls out on E or A?',
      standards: ['Re.7a', 'Pr.4a']
    },

    skills: [
      { id: 'm2w1-s1', text: 'Recite the musical alphabet (A B C D E F G) from memory' },
      { id: 'm2w1-s2', text: 'Name all natural notes on the E string (frets 0–8)' },
      { id: 'm2w1-s3', text: 'Name all natural notes on the A string (frets 0–8)' },
      { id: 'm2w1-s4', text: 'Point to any named note on E or A string when called out' },
      { id: 'm2w1-s5', text: 'Read a basic fretboard note-name chart' }
    ]
  },


  {
    id: 'm2w2',
    label: 'Set 2',
    locked: false,
    module: 'Notes on the E & A Strings',
    moduleNum: 2,
    unit: 'Module 2 · Notes on the E & A Strings',
    title: 'Set 2',
    subtitle: 'Finger placement · Clean tone · TAB reading · 4-bar melodies',
    objective: 'I CAN press notes cleanly with correct finger placement, read basic TAB, and play a 4-bar melody in time.',
    skillFocus: 'Press just behind the fret · One finger per fret · Avoiding fret buzz · Thumb position · Intro to TAB reading · Single-note melodies on E & A',
    handoutUrl: 'https://docs.google.com/document/d/1KM2rgUYa3NEpDr4E65YmcTE_g6Fxs_rbIjP-U1wjcnA/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/RMdkevqJDDk" target="_blank">Beginner Finger Exercises – Simen Otnes</a> (0:00–4:00).',
            hint: 'Try each exercise slowly on your guitar as he demonstrates. Slow and clean beats fast and buzzy every time.',
            skills: [1, 2, 3]
          },
          {
            text: 'Watch: <a href="https://youtu.be/3x6k7zHkqmA" target="_blank">How to Avoid Fret Buzz – JustinGuitar</a> (full video).',
            hint: 'Play a note on your guitar and see if you can diagnose your own buzz using his checklist.',
            skills: [1, 2]
          },
          {
            text: 'Watch: <a href="https://youtu.be/o56KBAO3OC4" target="_blank">How to Read Guitar TAB – Marty Music</a> (0:00–4:00).',
            hint: 'Pause when he shows a TAB example. Find those notes on your guitar before hitting play.',
            skills: [4]
          }
        ]
      },
      c: {
        title: 'Practice station — melodies & TAB',
        time: '12 min',
        steps: [
          {
            text: 'Finger workout: play each fret on the E string (frets 1–5) using one finger per fret. Then do the same on the A string. Keep your thumb behind the neck.',
            hint: 'Go as slow as you need. Every note should ring cleanly with no buzz.',
            skills: [1, 2, 3, 6]
          },
          {
            text: 'Using TAB, play "Happy Birthday" on E & A strings. Set the metronome to 60 BPM — one note per beat.',
            hint: 'If you buzz on a note, stop, fix your finger position, then continue. Don\'t just play through the buzz.',
            skills: [4, 5]
          },
          {
            text: 'Choice: use TAB to learn the main riff of "Seven Nation Army" (E string) or "Smoke on the Water" (E string). Play it in time.',
            hint: 'Both riffs use notes you already know. The challenge is keeping them clean at tempo.',
            skills: [4, 5]
          }
        ]
      }
    },

    songs: [
      { name: '"Happy Birthday"', meta: 'Play full melody on E & A strings from TAB', type: 'Core', core: true },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Play simplified intro riff on E string', type: 'Core', core: true },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Play bass-note riff on E & A strings', type: 'Core', core: true },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'E string TAB — great first riff', type: 'Choice', core: false },
      { name: '"Smoke on the Water" — Deep Purple', meta: 'E string TAB — iconic beginner riff', type: 'Choice', core: false },
      { name: '"Sunshine of Your Love" — Cream', meta: 'Riff on E string', type: 'Choice', core: false },
      { name: '"Come As You Are" — Nirvana', meta: 'Partial riff on A string', type: 'Choice', core: false },
      { name: '"Crazy Train" — Ozzy Osbourne', meta: 'Intro notes on E string', type: 'Choice', core: false },
      { name: '"Iron Man" — Black Sabbath', meta: 'Opening notes on E string', type: 'Choice', core: false }
    ],

    assessment: {
      goal: 'Unit-end: Play "Happy Birthday" using only E & A strings from memory with clean tone and correct fingering. Name any 5 notes called out by the teacher on the fretboard.',
      performance: 'Individual or partner check: play 4 bars of a melody from TAB with clean tone. Teacher listens and gives one piece of feedback.',
      selfCheck: 'Can you press a note cleanly with no buzzing? Can you read a basic TAB? Can you play a 4-bar melody in time at 60 BPM?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Re.7a']
    },

    skills: [
      { id: 'm2w2-s1', text: 'Press notes cleanly — no buzzing — by pressing just behind the fret' },
      { id: 'm2w2-s2', text: 'Use correct finger per fret (index=1, middle=2, ring=3, pinky=4)' },
      { id: 'm2w2-s3', text: 'Keep unused fingers hovering close to the strings' },
      { id: 'm2w2-s4', text: 'Read a basic TAB (strings, fret numbers, left-to-right order)' },
      { id: 'm2w2-s5', text: 'Play a 4-bar melody in time at 60 BPM' },
      { id: 'm2w2-s6', text: 'Keep thumb behind the neck throughout' }
    ]
  },


  // ── MODULES 3–9 — placeholder sets (locked) ──────────────
  { id:'m3w1', label:'Set 1', locked:true, module:'Two-Finger Power Chords',                moduleNum:3, unit:'Module 3 · Two-Finger Power Chords',                title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1S0gxHXkbgZRJT5VhR9nGz6O2imjEF9uQ_jNAYFaTc6I/edit', comingSoon:true, skills:[] },
  { id:'m3w2', label:'Set 2', locked:true, module:'Two-Finger Power Chords',                moduleNum:3, unit:'Module 3 · Two-Finger Power Chords',                title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1S0gxHXkbgZRJT5VhR9nGz6O2imjEF9uQ_jNAYFaTc6I/edit', comingSoon:true, skills:[] },

  { id:'m4w1', label:'Set 1', locked:true, module:'Major / Minor / Blues Pentatonic Scales', moduleNum:4, unit:'Module 4 · Major / Minor / Blues Pentatonic Scales', title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1Wmf3XYqMAKXoQ8ZxPv_Feb9HiySl_5xtYXWpQTv7a6w/edit', comingSoon:true, skills:[] },
  { id:'m4w2', label:'Set 2', locked:true, module:'Major / Minor / Blues Pentatonic Scales', moduleNum:4, unit:'Module 4 · Major / Minor / Blues Pentatonic Scales', title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1Wmf3XYqMAKXoQ8ZxPv_Feb9HiySl_5xtYXWpQTv7a6w/edit', comingSoon:true, skills:[] },
  { id:'m4w3', label:'Set 3', locked:true, module:'Major / Minor / Blues Pentatonic Scales', moduleNum:4, unit:'Module 4 · Major / Minor / Blues Pentatonic Scales', title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1Wmf3XYqMAKXoQ8ZxPv_Feb9HiySl_5xtYXWpQTv7a6w/edit', comingSoon:true, skills:[] },

  { id:'m5w1', label:'Set 1', locked:true, module:'Open Chords',                            moduleNum:5, unit:'Module 5 · Open Chords',                            title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit', comingSoon:true, skills:[] },
  { id:'m5w2', label:'Set 2', locked:true, module:'Open Chords',                            moduleNum:5, unit:'Module 5 · Open Chords',                            title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit', comingSoon:true, skills:[] },
  { id:'m5w3', label:'Set 3', locked:true, module:'Open Chords',                            moduleNum:5, unit:'Module 5 · Open Chords',                            title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit', comingSoon:true, skills:[] },

  { id:'m6w1', label:'Set 1', locked:true, module:'Barre Chords & Power Chords',  moduleNum:6, unit:'Module 6 · Barre Chords & Power Chords',  title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mBqrpsG2rkiVPWrF-zo0fxlgA1YQN33GyxmgsXqCY0g/edit', comingSoon:true, skills:[] },
  { id:'m6w2', label:'Set 2', locked:true, module:'Barre Chords & Power Chords',  moduleNum:6, unit:'Module 6 · Barre Chords & Power Chords',  title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mBqrpsG2rkiVPWrF-zo0fxlgA1YQN33GyxmgsXqCY0g/edit', comingSoon:true, skills:[] },
  { id:'m6w3', label:'Set 3', locked:true, module:'Barre Chords & Power Chords',  moduleNum:6, unit:'Module 6 · Barre Chords & Power Chords',  title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mBqrpsG2rkiVPWrF-zo0fxlgA1YQN33GyxmgsXqCY0g/edit', comingSoon:true, skills:[] },

  { id:'m7w1', label:'Set 1', locked:true, module:'Improvisation & Expression',   moduleNum:7, unit:'Module 7 · Improvisation & Expression',   title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit', comingSoon:true, skills:[] },
  { id:'m7w2', label:'Set 2', locked:true, module:'Improvisation & Expression',   moduleNum:7, unit:'Module 7 · Improvisation & Expression',   title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit', comingSoon:true, skills:[] },
  { id:'m7w3', label:'Set 3', locked:true, module:'Improvisation & Expression',   moduleNum:7, unit:'Module 7 · Improvisation & Expression',   title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit', comingSoon:true, skills:[] },

  { id:'m8w1', label:'Set 1', locked:true, module:'Ensemble & Performance',       moduleNum:8, unit:'Module 8 · Ensemble & Performance',       title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mxqrOHsRRRG1smLq2pfi0NplUBCOsflrZ6O13PBo06k/edit', comingSoon:true, skills:[] },
  { id:'m8w2', label:'Set 2', locked:true, module:'Ensemble & Performance',       moduleNum:8, unit:'Module 8 · Ensemble & Performance',       title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mxqrOHsRRRG1smLq2pfi0NplUBCOsflrZ6O13PBo06k/edit', comingSoon:true, skills:[] },
  { id:'m8w3', label:'Set 3', locked:true, module:'Ensemble & Performance',       moduleNum:8, unit:'Module 8 · Ensemble & Performance',       title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mxqrOHsRRRG1smLq2pfi0NplUBCOsflrZ6O13PBo06k/edit', comingSoon:true, skills:[] },

  { id:'m9w1', label:'Set 1', locked:true, module:'Composition & Creativity',     moduleNum:9, unit:'Module 9 · Composition & Creativity',     title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1FuhujeyL43MygvyYDTj6znTk8ZZPc0icFZzFtZPRxDs/edit', comingSoon:true, skills:[] },
  { id:'m9w2', label:'Set 2', locked:true, module:'Composition & Creativity',     moduleNum:9, unit:'Module 9 · Composition & Creativity',     title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1FuhujeyL43MygvyYDTj6znTk8ZZPc0icFZzFtZPRxDs/edit', comingSoon:true, skills:[] },
  { id:'m9w3', label:'Set 3', locked:true, module:'Composition & Creativity',     moduleNum:9, unit:'Module 9 · Composition & Creativity',     title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1FuhujeyL43MygvyYDTj6znTk8ZZPc0icFZzFtZPRxDs/edit', comingSoon:true, skills:[] },

]; // end WEEKS — do not remove this line
