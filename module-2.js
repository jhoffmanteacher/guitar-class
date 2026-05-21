// ============================================================
//  MODULE 2 — Notes on the E & A Strings
//  Edit this file to change Module 2 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

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
      { name: '"Happy Birthday"', meta: 'Identify which notes live on E & A strings', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Identify bass notes of intro on A string', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Identify bass notes of riff on E & A', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'E string riff — ear training & note ID', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Smoke on the Water" — Deep Purple', meta: 'E string — classic note recognition', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=Q2FzZSBD5LE',
        tutorialUrl: 'https://www.youtube.com/watch?v=QkT5yLP5VQA' },
      { name: '"Another One Bites the Dust" — Queen', meta: 'A string bass notes', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=rY0WxgSXdEE',
        tutorialUrl: 'https://www.youtube.com/watch?v=vhLJOOF-id4' },
      { name: '"Eye of the Tiger" — Survivor', meta: 'Riff on E & A — note identification', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=btPJPFnesV4',
        tutorialUrl: 'https://www.youtube.com/watch?v=LAXq-nbsGfs' },
      { name: '"Beat It" — Michael Jackson', meta: 'Intro riff on E string', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=oRdxUFDoQe0',
        tutorialUrl: 'https://www.youtube.com/watch?v=B5M5tVc7XZA' },
      { name: '"Day Tripper" — The Beatles', meta: 'Partial riff on E string', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=AYZlME0mQB8',
        tutorialUrl: 'https://www.youtube.com/watch?v=UkBVfOlPBrI' }
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
      { name: '"Happy Birthday"', meta: 'Play full melody on E & A strings from TAB', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Play simplified intro riff on E string', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Play bass-note riff on E & A strings', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'E string TAB — great first riff', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Smoke on the Water" — Deep Purple', meta: 'E string TAB — iconic beginner riff', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=Q2FzZSBD5LE',
        tutorialUrl: 'https://www.youtube.com/watch?v=QkT5yLP5VQA' },
      { name: '"Sunshine of Your Love" — Cream', meta: 'Riff on E string', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=HbqQL0J_Vr0',
        tutorialUrl: 'https://www.youtube.com/watch?v=rK14ZU4V6tA' },
      { name: '"Come As You Are" — Nirvana', meta: 'Partial riff on A string', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=vabnZ9-ex7o',
        tutorialUrl: 'https://www.youtube.com/watch?v=G14kHAijVHM' },
      { name: '"Crazy Train" — Ozzy Osbourne', meta: 'Intro notes on E string', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=FVovq9TGBw0',
        tutorialUrl: 'https://www.youtube.com/watch?v=JoL3YrtcwuQ' },
      { name: '"Iron Man" — Black Sabbath', meta: 'Opening notes on E string', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=qRcYjJQ0JHg',
        tutorialUrl: 'https://www.youtube.com/watch?v=id9iJ_c3JHM' }
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
  }

); // end module-2.js
