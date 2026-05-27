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
    objective: 'I CAN name all notes on the E and A strings (frets 0–12) and identify them on a fretboard diagram.',
    skillFocus: 'Musical alphabet (A–G) · Natural notes on E string (frets 0–12) · Natural notes on A string (frets 0–12) · Reading a note-name chart',
    handoutUrl: 'https://docs.google.com/document/d/1KM2rgUYa3NEpDr4E65YmcTE_g6Fxs_rbIjP-U1wjcnA/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/PNik7GWWBGA" target="_blank">Notes on the Low E String – JustinGuitar</a> (full video).',
            hint: 'Play along on your guitar as he goes through each note. Pause and find each note before he names it.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'On the low E string, which note is at fret 5?', choices: [
              'A',
              'D',
              'G',
              'F'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/k2jBLNzfEow" target="_blank">Fretboard Notes Made Easy – Marty Music</a> (0:00–4:00).',
            hint: 'Focus on the E and A strings only for now. What patterns does he point out?',
            skills: [1, 3],
            response: { type: 'short', placeholder: 'Describe one pattern he points out for finding notes on the E or A string.' }
          },
          {
            text: 'Listen to "Happy Birthday" — can you identify which notes of the melody live on the E or A string? Hum along and try to find the notes.',
            hint: 'Don\'t worry about playing it yet — just train your ear to connect sounds to strings.',
            skills: [5],
            response: { type: 'short', placeholder: 'Which note(s) did you find first? Where on the fretboard?' }
          },
          {
            text: 'Play along drill: open your note-name chart. Play every natural note on the low E string slowly, frets 0–12: E · F · G · A · B · C · D · E. Say each name out loud as you play it. Do it twice.',
            hint: 'Slow is fine. Accuracy and saying the name out loud matter more than speed.',
            skills: [2],
            playSeq: { label: 'Play all', bpm: 60, notes: [40, 41, 43, 45, 47, 48, 50, 52] },
            response: { type: 'mc', prompt: 'On the low E string, what note is at fret 3?', choices: [
              'G',
              'F',
              'A',
              'D'
            ] }
          },
          {
            text: 'Now do the same on the A string: A · B · C · D · E · F · G · A (frets 0–12). Play up, then back down. Say each name aloud.',
            hint: 'Notice that fret 5 of the A string is the same note as the open D string. That connection will help you later.',
            skills: [3],
            playSeq: { label: 'Play all', bpm: 60, notes: [45, 47, 48, 50, 52, 53, 55, 57] },
            response: { type: 'short', placeholder: 'What did you notice about any of the notes? Did any two notes feel or sound similar?' }
          }
        ]
      },
      c: {
        title: 'Practice station — fretboard drill',        steps: [
          {
            text: 'Tune your guitar. Using your note-name chart, play every natural note on the low E string slowly: E · F · G · A · B · C · D · E. Say each name aloud.',
            hint: 'Hearing + saying + playing locks it in faster.',
            skills: [2],
            playSeq: { label: 'Play all', bpm: 60, notes: [40, 41, 43, 45, 47, 48, 50, 52] }
          },
          {
            text: 'Now do the same on the A string: A · B · C · D · E · F · G · A. Play up to fret 12, then back down.',
            hint: 'Keep the metronome at 60 BPM. One note per beat.',
            skills: [3],
            playSeq: { label: 'Play all', bpm: 60, notes: [45, 47, 48, 50, 52, 53, 55, 57] }
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
      goal: 'Names all notes on E string (frets 0–12) · Names all notes on A string (frets 0–12) · Points to a named note on the fretboard · Reads a basic fretboard note chart · Identifies notes in a familiar song',
      performance: 'Partner quiz: one student names a note, partner finds it on the fretboard. Then switch.',
      selfCheck: 'Can you name every natural note on the E string without looking? Can you find any note the teacher calls out on E or A?',
      standards: ['Re.7a', 'Pr.4a']
    },

    skills: [
      { id: 'm2w1-s1', text: 'Recite the musical alphabet (A B C D E F G) from memory',
        gotItWhen: 'you can say A B C D E F G — and what comes after G — without pausing or looking at anything.' },
      { id: 'm2w1-s2', text: 'Name all natural notes on the E string (frets 0–12)',
        gotItWhen: 'someone calls out any fret 0–12 on the low E and you can say the note name instantly, without counting up from E.' },
      { id: 'm2w1-s3', text: 'Name all natural notes on the A string (frets 0–12)',
        gotItWhen: 'same as above, but for the A string — frets 0–12, any fret called out, instant answer.' },
      { id: 'm2w1-s4', text: 'Point to any named note on E or A string when called out',
        gotItWhen: 'the teacher says a note name and you can put your finger on it within 3 seconds without looking at a chart.' },
      { id: 'm2w1-s5', text: 'Read a basic fretboard note-name chart',
        gotItWhen: 'you can use the chart to look up a note you don\'t know yet — you understand what the rows and columns mean.' }
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
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/RMdkevqJDDk" target="_blank">Beginner Finger Exercises – Simen Otnes</a> (0:00–4:00).',
            hint: 'Try each exercise slowly on your guitar as he demonstrates. Slow and clean beats fast and buzzy every time.',
            skills: [1, 2, 3],
            response: { type: 'short', placeholder: 'Which exercise felt hardest, and what do you think makes it hard?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/3x6k7zHkqmA" target="_blank">How to Avoid Fret Buzz – JustinGuitar</a> (full video).',
            hint: 'Play a note on your guitar and see if you can diagnose your own buzz using his checklist.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'Which is the MOST common cause of fret buzz for beginners?', choices: [
              'Pressing the string too lightly, or too far from the fret',
              'Using the wrong pick',
              'The guitar being out of tune',
              'Strumming too quietly'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/o56KBAO3OC4" target="_blank">How to Read Guitar TAB – Marty Music</a> (0:00–4:00).',
            hint: 'Pause when he shows a TAB example. Find those notes on your guitar before hitting play.',
            skills: [4],
            response: { type: 'mc', prompt: 'On a TAB diagram, the TOP line represents which string?', choices: [
              'The high E (thinnest) string',
              'The low E (thickest) string',
              'The A string',
              'It depends on the song'
            ] }
          },
          {
            text: 'Read this TAB: the opening of "Happy Birthday" written out on the low E string. Look at the fret numbers on the bottom line and try to play it. Click any note name below the TAB to hear how it should sound.',
            hint: 'Read left-to-right, one note per beat. The numbers tell you which fret to press on the low E string.',
            skills: [4, 5],
            tab: {
              caption: '"Happy Birthday" — first two phrases · Low E string',
              notes: [
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 },
                { string: 'E', fret: 4, note: 'G#', midi: 44 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 2, note: 'F#', midi: 42 },
                { string: 'E', fret: 0, note: 'E',  midi: 40 },
                { string: 'E', fret: 7, note: 'B',  midi: 47 },
                { string: 'E', fret: 5, note: 'A',  midi: 45 }
              ]
            }
          },
          {
            text: 'Fret buzz self-check: play frets 1–4 on the low E string, one at a time. Press lightly until you hear buzz, then press just enough to stop it. That is the minimum pressure needed.',
            hint: 'Most beginners press too hard. Finding the minimum pressure is a real technique.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'Where should your fingertip press to get the cleanest tone?', choices: [
              'Just behind the fret (toward the nut)',
              'On top of the fret wire',
              'In the middle of the fret space',
              'As close to the nut as possible'
            ] }
          },
          {
            text: 'Try reading the TAB for "Ode to Joy" or "Mary Had a Little Lamb" from the songs section. Play it through at least once — slow and clean. Click a song below to open its TAB.',
            hint: 'If you get stuck on a note, use your note-name chart to find it. TAB numbers = fret numbers.',
            skills: [4, 5],
            tabs: [
              {
                title: '"Ode to Joy" — opening phrase',
                caption: 'A string · frets 3–10 · go slow',
                notes: [
                  { string: 'A', fret: 7,  note: 'E',  midi: 52 },
                  { string: 'A', fret: 7,  note: 'E',  midi: 52 },
                  { string: 'A', fret: 8,  note: 'F',  midi: 53 },
                  { string: 'A', fret: 10, note: 'G',  midi: 55 },
                  { string: 'A', fret: 10, note: 'G',  midi: 55 },
                  { string: 'A', fret: 8,  note: 'F',  midi: 53 },
                  { string: 'A', fret: 7,  note: 'E',  midi: 52 },
                  { string: 'A', fret: 5,  note: 'D',  midi: 50 },
                  { string: 'A', fret: 3,  note: 'C',  midi: 48 },
                  { string: 'A', fret: 3,  note: 'C',  midi: 48 },
                  { string: 'A', fret: 5,  note: 'D',  midi: 50 },
                  { string: 'A', fret: 7,  note: 'E',  midi: 52 },
                  { string: 'A', fret: 7,  note: 'E',  midi: 52 },
                  { string: 'A', fret: 5,  note: 'D',  midi: 50 }
                ]
              },
              {
                title: '"Mary Had a Little Lamb" — opening phrase',
                caption: 'A string · frets 3–7 · 7 notes',
                notes: [
                  { string: 'A', fret: 7, note: 'E', midi: 52 },
                  { string: 'A', fret: 5, note: 'D', midi: 50 },
                  { string: 'A', fret: 3, note: 'C', midi: 48 },
                  { string: 'A', fret: 5, note: 'D', midi: 50 },
                  { string: 'A', fret: 7, note: 'E', midi: 52 },
                  { string: 'A', fret: 7, note: 'E', midi: 52 },
                  { string: 'A', fret: 7, note: 'E', midi: 52 }
                ]
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — melodies & TAB',        steps: [
          {
            text: 'Finger workout: play each fret on the E string (frets 1–5) using one finger per fret. Then do the same on the A string. Keep your thumb behind the neck.',
            hint: 'Go as slow as you need. Every note should ring cleanly with no buzz.',
            skills: [1, 2, 3, 6]
          },
          {
            text: 'Using TAB, play "Happy Birthday" on E & A strings. Set the metronome to 60 BPM — one note per beat. Click any note name to hear how it should sound.',
            hint: 'If you buzz on a note, stop, fix your finger position, then continue. Don\'t just play through the buzz.',
            skills: [4, 5],
            tab: {
              caption: '"Happy Birthday" — full melody · E & A strings · 60 BPM',
              phrases: [
                {
                  label: '"Hap-py birth-day to you · Hap-py birth-day to you"',
                  notes: [
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 2, note: 'F#', midi: 42 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 5, note: 'A',  midi: 45 },
                    { string: 'E', fret: 4, note: 'G#', midi: 44 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 2, note: 'F#', midi: 42 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'A', fret: 2, note: 'B',  midi: 47 },
                    { string: 'A', fret: 0, note: 'A',  midi: 45 }
                  ]
                },
                {
                  label: '"Hap-py birth-day dear ___ · Hap-py birth-day to you"',
                  notes: [
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'E', fret: 0, note: 'E',  midi: 40 },
                    { string: 'A', fret: 7, note: 'E',  midi: 52 },
                    { string: 'A', fret: 4, note: 'C#', midi: 49 },
                    { string: 'A', fret: 0, note: 'A',  midi: 45 },
                    { string: 'E', fret: 4, note: 'G#', midi: 44 },
                    { string: 'E', fret: 2, note: 'F#', midi: 42 },
                    { string: 'A', fret: 5, note: 'D',  midi: 50 },
                    { string: 'A', fret: 5, note: 'D',  midi: 50 },
                    { string: 'A', fret: 4, note: 'C#', midi: 49 },
                    { string: 'A', fret: 0, note: 'A',  midi: 45 },
                    { string: 'A', fret: 2, note: 'B',  midi: 47 },
                    { string: 'A', fret: 0, note: 'A',  midi: 45 }
                  ]
                }
              ]
            }
          },
          {
            text: 'Choice: use TAB to learn the main riff of "Seven Nation Army" (E string) or "Smoke on the Water" (E string). Play it in time. Click a song below to open its TAB.',
            hint: 'Both riffs use notes you already know. The challenge is keeping them clean at tempo.',
            skills: [4, 5],
            tabs: [
              {
                title: '"Seven Nation Army" — main riff',
                caption: 'Low E string · frets 2–10 · 7 notes',
                notes: [
                  { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                  { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                  { string: 'E', fret: 10, note: 'D',  midi: 50 },
                  { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                  { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                  { string: 'E', fret: 3,  note: 'G',  midi: 43 },
                  { string: 'E', fret: 2,  note: 'F#', midi: 42 }
                ]
              },
              {
                title: '"Smoke on the Water" — main riff',
                caption: 'Low E string · single-note version · 12 notes',
                notes: [
                  { string: 'E', fret: 0, note: 'E',  midi: 40 },
                  { string: 'E', fret: 3, note: 'G',  midi: 43 },
                  { string: 'E', fret: 5, note: 'A',  midi: 45 },
                  { string: 'E', fret: 0, note: 'E',  midi: 40 },
                  { string: 'E', fret: 3, note: 'G',  midi: 43 },
                  { string: 'E', fret: 6, note: 'A#', midi: 46 },
                  { string: 'E', fret: 5, note: 'A',  midi: 45 },
                  { string: 'E', fret: 0, note: 'E',  midi: 40 },
                  { string: 'E', fret: 3, note: 'G',  midi: 43 },
                  { string: 'E', fret: 5, note: 'A',  midi: 45 },
                  { string: 'E', fret: 3, note: 'G',  midi: 43 },
                  { string: 'E', fret: 0, note: 'E',  midi: 40 }
                ]
              }
            ]
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
      { id: 'm2w2-s1', text: 'Press notes cleanly — no buzzing — by pressing just behind the fret',
        gotItWhen: 'you play frets 1–5 on the E string and every note sustains cleanly — no buzzing, no muffling.' },
      { id: 'm2w2-s2', text: 'Use correct finger per fret (index=1, middle=2, ring=3, pinky=4)',
        gotItWhen: 'your index finger always plays fret 1, middle plays fret 2, ring plays fret 3, pinky plays fret 4 — without having to think about it.' },
      { id: 'm2w2-s3', text: 'Keep unused fingers hovering close to the strings',
        gotItWhen: 'your fingers that aren\'t pressing a note stay within about a centimeter of the strings, ready to drop down.' },
      { id: 'm2w2-s4', text: 'Read a basic TAB (strings, fret numbers, left-to-right order)',
        gotItWhen: 'you can look at a TAB, identify which string and fret each number refers to, and find those notes on your guitar.' },
      { id: 'm2w2-s5', text: 'Play a 4-bar melody in time at 60 BPM',
        gotItWhen: 'you can play the Happy Birthday phrase all the way through at 60 BPM without stopping to find a note.' },
      { id: 'm2w2-s6', text: 'Keep thumb behind the neck throughout',
        gotItWhen: 'your thumb stays roughly behind your middle finger on the back of the neck — not hooked over the top.' }
    ]
  }

); // end module-2.js

MODULE_REVIEWS[2] = {
  moduleNum: 2,
  module: 'Notes on the E & A Strings',
  skills: [
    { id: 'mr2-s1', text: 'I can recite the musical alphabet (A B C D E F G) from memory' },
    { id: 'mr2-s2', text: 'I can name all natural notes on the E string (frets 0–12)' },
    { id: 'mr2-s3', text: 'I can name all natural notes on the A string (frets 0–12)' },
    { id: 'mr2-s4', text: 'I can press notes cleanly with no fret buzz' },
    { id: 'mr2-s5', text: 'I can read a basic TAB and play a 4-bar melody in time at 60 BPM' }
  ],
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Re.7a']
};
