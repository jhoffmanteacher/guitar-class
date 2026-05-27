// ============================================================
//  MODULE 1 — Introductions: You and The Guitar
//  Edit this file to change Module 1 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'w1',
    label: 'Set 1',
    locked: false,
    module: 'Introductions: You and The Guitar',
    moduleNum: 1,
    unit: 'Module 1 · Introductions: You and The Guitar',
    title: 'Set 1',
    subtitle: 'My Guitar Adventure · Goal-setting · Sharing',
    objective: 'I CAN describe why I want to play guitar and share a song that means something to me.',
    skillFocus: 'Goal-setting · "My Guitar Adventure" presentation · Class listening & discussion',
    handoutUrl: 'https://docs.google.com/document/d/1wKmQRDFbKsIci94PNRzoQkXoTVO6A017ELIZYvLtyCE/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Reflect',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/rrB97F0Qu6g" target="_blank">How to Actually Get Good at Guitar – Simen Otnes</a> (0:00–3:30).',
            hint: 'As you watch, think about: what is one habit he says makes the biggest difference? Does it match what you thought?',
            skills: [1],
            response: { type: 'short', placeholder: 'In one sentence: what habit did he say matters most, and did it match what you thought?' }
          },
          {
            text: 'Find a YouTube clip of the song you shared (or one a classmate shared that you liked). Listen and notice: what is the guitar doing?',
            hint: 'Is it strumming chords? Playing a melody? Both? Just listen — you don\'t need to know the names yet.',
            response: { type: 'mc', prompt: 'In the clip you watched, what was the guitar doing?', choices: [
              'Strumming chords',
              'Playing a melody (single notes)',
              'Both strumming and single notes',
              'Mostly rhythm or percussive sounds'
            ] }
          }
        ]
      },
      c: {
        title: 'Practice station — explore the guitar',        steps: [
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
      { name: '"Happy Birthday"', meta: 'Course song thread — you\'ll play this all semester', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Listen and identify guitar sounds', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Listen and identify guitar sounds', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' }
    ],

    assessment: {
      goal: 'Can describe why they want to learn guitar · Can name one song that matters to them · Participates in class sharing',
      performance: 'Whole-class sharing circle — everyone shares, no one is on the spot. Listening and responding respectfully.',
      selfCheck: 'Can you name one reason you want to play? Can you name one song you\'d love to play by the end of the year?',
      standards: ['Pr.1a', 'Cn.11a']
    },

    skills: [
      { id: 'w1-s1', text: 'I can describe why I want to learn guitar',
        gotItWhen: 'you can answer "why guitar?" in one or two sentences without hesitating — and the answer is yours, not someone else\'s.' },
      { id: 'w1-s2', text: 'I can name one song that matters to me',
        gotItWhen: 'you can name the song instantly and say one thing about why it matters to you — no thinking required.' },
      { id: 'w1-s3', text: 'I participated in class sharing and listened respectfully',
        gotItWhen: 'you spoke up at least once, and you can recall something a classmate shared without checking your notes.' }
    ]
  },

  {
    id: 'w2',
    label: 'Set 2',
    locked: false,
    module: 'Introductions: You and The Guitar',
    moduleNum: 1,
    unit: 'Module 1 · Introductions: You and The Guitar',
    title: 'Set 2',
    subtitle: 'Parts of the guitar · Posture · Tuning · First melody',
    objective: 'I CAN name 5+ parts of the guitar, tune all 6 strings, and play a short open-string melody at 60 BPM.',
    skillFocus: 'Parts of the guitar · Sitting posture · Pick grip & angle · String names (E A D G B e) · Tuning · Open-string melody',
    handoutUrl: 'https://docs.google.com/document/d/1wKmQRDFbKsIci94PNRzoQkXoTVO6A017ELIZYvLtyCE/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/rrB97F0Qu6g" target="_blank">How to Actually Get Good at Guitar – Simen Otnes</a> (first 5 min).',
            hint: 'Headphones on. What habits will help you get better?'
          },
          {
            text: 'Watch: <a href="https://youtu.be/8-grcbKnbps" target="_blank">How to Hold a Guitar Pick – JustinGuitar</a>.',
            hint: 'Write down: what are the two most common pick-holding mistakes?'
          },
          {
            text: 'In your notes: write out the 6 string names from memory, low to high. Mnemonic: Eddie Ate Dynamite, Good Bye Eddie.'
          },
          {
            text: 'Pick up your guitar. Play each open string one at a time — low E to high e. Say the string name out loud as you pluck it. Do this 3 times through.',
            hint: 'Hearing + saying + playing locks it in faster than just watching.',
            response: { type: 'mc', prompt: 'Say the string names low to high — which comes right after G?', choices: [
              'B',
              'A',
              'D',
              'e'
            ] }
          },
          {
            text: 'Try the "Seven Nation Army" riff on your guitar: low E string, frets 7 · 7 · 10 · 7 · 5 · 3 · 2. Go as slow as you need. How far can you get before the station rotates? Click any note name below the TAB to hear how it should sound.',
            hint: 'Slow and clean beats fast and buzzy. One note at a time.',
            tab: {
              caption: '"Seven Nation Army" — main riff · Low E string · 7 notes',
              notes: [
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 10, note: 'D',  midi: 50 },
                { string: 'E', fret: 7,  note: 'B',  midi: 47 },
                { string: 'E', fret: 5,  note: 'A',  midi: 45 },
                { string: 'E', fret: 3,  note: 'G',  midi: 43 },
                { string: 'E', fret: 2,  note: 'F#', midi: 42 }
              ]
            }
          }
        ]
      },
      c: {
        title: 'Practice station — open-string melody',        steps: [
          {
            text: 'Tune your guitar first. Then practice playing single notes on the low E string: open (E), 1st fret (F), 3rd fret (G), 5th fret (A).',
            hint: 'Press just behind the fret, not on it. One clean note at a time.',
            skills: [5, 6],
            playSeq: { label: 'Play all', bpm: 60, notes: [40, 41, 43, 45] }
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
      { name: '"Happy Birthday"', meta: 'Play melody on open strings — first real song!', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Listen and identify guitar sounds in the recording', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Listen and identify guitar sounds', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Ode to Joy"', meta: 'E string only — great first melody', type: 'Choice', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=PRZh_Wv3IQQ' },
      { name: '"Mary Had a Little Lamb"', meta: 'E & A strings', type: 'Choice', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=8gK9n9vrt3g' },
      { name: '"Jingle Bells"', meta: 'Open strings only', type: 'Choice', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=qM_Yar0xqRk' },
      { name: '"Twinkle Twinkle"', meta: 'E & A strings', type: 'Choice', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=NPS5xuRCA6w' },
      { name: '"The Simpsons Theme"', meta: 'E string only', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=aPzS3QYb868',
        tutorialUrl: 'https://www.youtube.com/watch?v=lGwNWYzYuIk' }
    ],

    assessment: {
      goal: 'Names 5+ parts of the guitar · Holds guitar with correct posture · Holds pick with correct grip · Tunes all 6 strings · Plays a short open-string melody on E string at 60 BPM',
      performance: 'Whole-class unison open-string exercise. Everyone plays together — no one is on the spot.',
      selfCheck: 'Can you name 5 parts of the guitar? Can you tune all 6 strings with a tuner? Can you play a single note cleanly with no buzzing?',
      standards: ['Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'w2-s1', text: 'Name 5+ parts of the guitar (body, neck, headstock, frets, strings, tuning pegs, nut, saddle, bridge)',
        gotItWhen: 'you can point to and name each part on a real guitar without checking a diagram.' },
      { id: 'w2-s2', text: 'Hold the guitar with correct sitting posture',
        gotItWhen: 'you can play for 5 minutes straight without slouching, lifting your shoulders, or letting the guitar slip off your leg.' },
      { id: 'w2-s3', text: 'Hold the pick correctly — 3–4mm of tip showing',
        gotItWhen: 'your pick stays put when you strum, only a small tip pokes past your thumb, and your wrist stays relaxed.' },
      { id: 'w2-s4', text: 'Name all 6 strings from memory (E A D G B e)',
        gotItWhen: 'you can say E-A-D-G-B-e low to high — and high to low — without pausing or saying the mnemonic out loud.' },
      { id: 'w2-s5', text: 'Tune all 6 strings with a tuner',
        gotItWhen: 'you can take an out-of-tune guitar and get all 6 strings to green on the tuner in under 2 minutes without help.' },
      { id: 'w2-s6', text: 'Play a short open-string melody on the E string at 60 BPM',
        gotItWhen: 'you can play the melody all the way through at 60 BPM with the metronome without stopping or losing the beat.' }
    ]
  }

); // end module-1.js

MODULE_REVIEWS[1] = {
  moduleNum: 1,
  module: 'Introductions: You and The Guitar',
  skills: [
    { id: 'mr1-s1', text: 'I can describe why I want to learn guitar' },
    { id: 'mr1-s2', text: 'I can name 5+ parts of the guitar' },
    { id: 'mr1-s3', text: 'I can tune all 6 strings with a tuner' },
    { id: 'mr1-s4', text: 'I can play a short open-string melody on the E string at 60 BPM' }
  ],
  standards: ['Pr.1a', 'Pr.4a', 'Pr.5a', 'Cn.11a']
};
