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
    skillFocus: 'Setting your guitar goals · Sharing and discussing music',
    handoutUrl: 'https://docs.google.com/document/d/1wKmQRDFbKsIci94PNRzoQkXoTVO6A017ELIZYvLtyCE/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Reflect',
        steps: [
          {
            text: 'Headphone routine (every computer-station day): plug in. Keep the volume low — the classmate next to you should not hear it. Slip one earcup off when the teacher is talking. We do this all semester.',
            hint: 'If the person next to you can hear your video, it\'s too loud. Comfortable for you, quiet for everyone else.'
          },
          {
            text: 'Watch: <a href="https://youtu.be/uBZsLmmOz9I" target="_blank">How to Practice Guitar – JustinGuitar</a> (Lesson 1 Practice Routine).',
            hint: 'As you watch, think about: what is one practice habit he says makes the biggest difference? Does it match what you thought?',
            skills: [1],
            response: { type: 'short', placeholder: 'In one sentence: what practice habit did he say matters most, and did it match what you thought?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/PyWZYHy17As" target="_blank">Caring for Your Acoustic Guitar – Marty Music</a>.',
            hint: 'Your guitar is shared gear — notice how he handles and stores it. You\'ll practice the safe set-down at the hands-on station next.'
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
          },
          {
            text: 'Ear training — acoustic vs. electric. Two short clips play the SAME song, "All Along the Watchtower": <a href="https://www.youtube.com/watch?v=bT7Hj-ea0VE" target="_blank" data-ext="1">Clip 1 — Bob Dylan</a> and <a href="https://www.youtube.com/watch?v=TLV4_xaYynY" target="_blank" data-ext="1">Clip 2 — Jimi Hendrix</a>. One uses an acoustic guitar, the other an electric. Listen for the difference in tone.',
            hint: 'Acoustic guitars sound warm and woody. Electric guitars sound brighter and can be distorted or "fuzzy." Same song, very different sound.',
            response: { type: 'mc', prompt: 'Which clip is the electric guitar?',
              answer: 1,
              explain: 'Clip 2 is Jimi Hendrix\'s electric version — brighter, with distortion. Clip 1 is Bob Dylan\'s warmer, woodier acoustic.',
              choices: [
              'Clip 1',
              'Clip 2',
              'They sound identical'
            ] }
          }
        ]
      },
      c: {
        title: 'Practice station — explore the guitar',
        sections: [
          {
            title: 'Get comfortable holding & exploring the guitar',
            steps: [
          {
            text: 'Safe handling (every class): when you\'re not playing, rest the guitar flat on its back across your lap, or lay it in the case or stand. Never lean it against a chair or wall — it can slip and fall. Carry it with one hand on the neck and one on the body. You\'ve got it when: you can set the guitar down and pick it up without it wobbling or tipping.',
            hint: 'A guitar that falls can crack its neck. A little care keeps the class set playable all year.'
          },
          {
            text: 'Pick up the guitar. Hold it in a comfortable position. Strum all 6 strings slowly with your thumb — just listen to the sound. You\'ve got it when: the guitar sits steady on your leg and all 6 strings ring when you strum.',
            hint: 'Don\'t worry about pressing any frets yet. Just get used to holding it.'
          },
          {
            text: 'Try playing with your foot up on a stool, then flat on the ground. Keep whichever one lets you sit up straight without gripping the neck to hold the guitar up.'
          },
          {
            text: 'Try tapping the body, plucking one string at a time, and strumming. What differences do you notice? You\'ve got it when: you can make at least three different sounds and say how they differ.',
            hint: 'Curiosity is your best tool right now.'
          }
            ]
          },
          {
            title: 'Describe why I want to learn guitar',
            steps: [
          {
            text: 'Write or sketch your guitar goal on a sticky note or in your journal. We\'ll revisit this at the end of the semester. You\'ve got it when: you wrote or sketched a goal you can explain in one sentence.',
            hint: 'It can be a song you want to play, a skill you want to build, or just a feeling.'
          }
            ]
          }
        ]
      }
    },

    songs: [
      { name: 'Student choice — any song that means something to them', meta: 'Listening & sharing day · No playing required', type: 'Choice', core: false },
      { name: '"Happy Birthday"', meta: 'Course song thread — you\'ll play this all semester', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: 'Core Song 2 — TBD', meta: 'Listen and identify guitar sounds — find the guitar in the mix', type: 'Core', core: true },
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
    skillFocus: 'Guitar parts, posture, and holding a pick · Naming and tuning the strings · Playing an open-string melody',
    handoutUrl: 'https://docs.google.com/document/d/1wKmQRDFbKsIci94PNRzoQkXoTVO6A017ELIZYvLtyCE/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/X2EmpWr9vUc" target="_blank">How to Tune Your Guitar For Beginners – JustinGuitar</a>.',
            hint: 'Headphones on. Notice the order of the strings and what "in tune" sounds like.'
          },
          {
            text: 'Watch: <a href="https://youtu.be/zpRoq0jcWfQ" target="_blank">Beginner Guide To Guitar Anatomy – JustinGuitar</a>.',
            hint: 'Write down 5 parts you can now name from memory.'
          },
          {
            text: 'Watch: <a href="https://youtu.be/C-mt8td1teU" target="_blank">How to Hold the Guitar – JustinGuitar</a>.',
            hint: 'Notice where the guitar rests and how the back stays straight.'
          },
          {
            text: 'Watch: <a href="https://youtu.be/1JBxNFEg0nU" target="_blank">Picks: How to Choose & Hold One (BC-107) – JustinGuitar</a>.',
            hint: 'Write down: what are the two most common pick-holding mistakes?'
          },
          {
            text: 'In your notes: write out the 6 string names from memory, low to high. Mnemonic: Eddie Ate Dynamite, Good Bye Eddie.'
          },
          {
            text: 'Watch: <a href="https://youtu.be/Z1ETtvhPqdQ" target="_blank">Picking Individual Strings (BC-166) – JustinGuitar</a>.',
            hint: 'Watch his picking hand and how light his fretting touch is. Clean single notes are the whole goal of your first melody.',
            skills: [6]
          },
          {
            text: 'Quick try: play each open string once, low E to high e, saying the name out loud as you pluck. Just a preview — you\'ll drill these for real at the practice station.',
            hint: 'Hearing + saying + playing locks it in faster than just watching.',
            response: { type: 'mc', prompt: 'Say the string names low to high — which comes right after G?',
              answer: 0,
              explain: 'Low to high it\'s E A D G B e — so B follows G. (Try "Eddie Ate Dynamite, Good Bye Eddie.")',
              choices: [
              'B',
              'A',
              'D',
              'e'
            ] }
          },
          {
            text: 'Preview the "Seven Nation Army" riff: click the note names below the TAB to hear how it should sound, then try just the first few notes to get the feel. You\'ll play the whole riff at the practice station.',
            hint: 'Listen first, then match it — one note at a time.',
            response: { type: 'short', placeholder: 'How did the riff sound, and which note was hardest to find?' },
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
        title: 'Practice station — Challenges',
        sections: [
          {
            title: 'Tune all 6 strings with a tuner',
            steps: [
          {
            text: 'Challenge 1 — Tune Challenge: get all 6 strings to green on the tuner. Beat the clock — can you do it in under 2 minutes? You\'ve got it when: all 6 strings green in under 2 minutes. Log your time so you can beat it next session.',
            hint: 'Tune low to high: E A D G B e. Slow and steady beats rushing past the note. Use the play button to hear the target pitches.',
            skills: [5],
            playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
          }
            ]
          },
          {
            title: 'Play a melody on the open strings at 60 BPM',
            steps: [
          {
            text: 'Challenge 2 — One Minute, Perfect Notes: pluck each open string low to high (E A D G B e) and say its name out loud. For one minute, count how many ring perfectly clean — no buzz, no muting. You\'ve got it when: all 6 strings ring clean — no buzz, no muting. Log your score out of 6 so you can beat it next time.',
            hint: 'These are open strings — press nothing. Let each string ring fully before moving to the next.',
            skills: [6]
          },
          {
            text: 'Try "Happy Birthday" on open strings only — your teacher will give you the note sequence. Set your metronome to 60 BPM. You\'ve got it when: play it start to finish at 60 BPM without stopping.',
            hint: 'Go slow. Clean notes matter more than speed right now.',
            skills: [6]
          },
          {
            text: 'Challenge 3 — Riff Time (give it a go!): play the "Seven Nation Army" riff on the low E string — slow and clean. You\'ve got it when: all 7 notes in the right order, each ringing clean — speed comes later. No score on this one, just go for it. Click any note name below the TAB to hear how it should sound.',
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
          }
        ]
      }
    },

    songs: [
      { name: '"Happy Birthday"', meta: 'Play melody on open strings — first real song!', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Sailor Song" — Gigi Perez', meta: 'Listen — fingerpicked vs. strummed guitar', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=1lrFsXkT_rM',
        tutorialUrl: 'https://www.youtube.com/watch?v=rpoyXduMZZw' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Listen and identify guitar sounds', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Ode to Joy"', meta: 'E string only — great first melody', type: 'Choice', core: false, level: 1,
        tutorialUrl: 'https://www.youtube.com/watch?v=PRZh_Wv3IQQ' },
      { name: '"Mary Had a Little Lamb"', meta: 'E & A strings', type: 'Choice', core: false, level: 1,
        tutorialUrl: 'https://www.youtube.com/watch?v=8gK9n9vrt3g' },
      { name: '"Jingle Bells"', meta: 'Open strings only', type: 'Choice', core: false, level: 1,
        tutorialUrl: 'https://www.youtube.com/watch?v=qM_Yar0xqRk' },
      { name: '"Twinkle Twinkle"', meta: 'E & A strings', type: 'Choice', core: false, level: 1,
        tutorialUrl: 'https://www.youtube.com/watch?v=NPS5xuRCA6w' },
      { name: '"The Simpsons Theme"', meta: 'E string only', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=aPzS3QYb868',
        tutorialUrl: 'https://www.youtube.com/watch?v=lGwNWYzYuIk' }
    ],

    assessment: {
      goal: 'Names 5+ parts of the guitar · Holds guitar with correct posture · Holds pick with correct grip · Tunes all 6 strings · Plays a short melody on the E string at 60 BPM',
      performance: 'Whole-class unison open-string exercise. Everyone plays together — no one is on the spot.',
      selfCheck: 'Can you name 5 parts of the guitar? Can you tune all 6 strings with a tuner? Can you play a single note cleanly with no buzzing?',
      standards: ['Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'w2-s1', text: 'Name 5+ parts of the guitar (body, neck, headstock, frets, strings, tuning pegs, nut, saddle, bridge)',
        gotItWhen: 'you can point to and name each part on a real guitar without checking a diagram.',
        practice: { type: 'mc', prompt: 'Which of these is NOT a part of the guitar?',
          choices: ['Nut', 'Saddle', 'Hinge', 'Fret'], answer: 2 } },
      { id: 'w2-s2', text: 'Hold the guitar with correct sitting posture',
        gotItWhen: 'you can play for 5 minutes straight without slouching, lifting your shoulders, or letting the guitar slip off your leg.' },
      { id: 'w2-s3', text: 'Hold the pick correctly — 3–4mm of tip showing',
        gotItWhen: 'your pick stays put when you strum, only a small tip pokes past your thumb, and your wrist stays relaxed.',
        practice: { type: 'mc', prompt: 'How much pick tip should show past your thumb?',
          choices: ['Just 1 mm', '3–4 mm', 'About a centimeter', 'All of the pick'], answer: 1 } },
      { id: 'w2-s4', text: 'Name all 6 strings from memory (E A D G B e)',
        gotItWhen: 'you can say E-A-D-G-B-e low to high — and high to low — without pausing or saying the mnemonic out loud.',
        practice: { type: 'mc', prompt: 'Strings low to high are E A D G B e. Which string sits between A and G?',
          choices: ['B', 'D', 'High e', 'Low E'], answer: 1 } },
      { id: 'w2-s5', text: 'Tune all 6 strings with a tuner',
        gotItWhen: 'you can take an out-of-tune guitar and get all 6 strings to green on the tuner in under 2 minutes without help.',
        practice: { type: 'playSeq', label: 'Hear all 6 strings in tune', bpm: 50,
          notes: [40, 45, 50, 55, 59, 64] } },
      { id: 'w2-s6', text: 'Play a short melody on the E string at 60 BPM',
        gotItWhen: 'you can play the melody all the way through at 60 BPM with the metronome without stopping or losing the beat.',
        practice: { type: 'playSeq', label: 'E string warm-up melody', bpm: 60,
          notes: [40, 41, 43, 45, 43, 41, 40] } }
    ]
  }

); // end module-1.js

MODULE_REVIEWS[1] = {
  moduleNum: 1,
  module: 'Introductions: You and The Guitar',
  skills: [
    { id: 'mr1-s1', text: 'I can describe why I want to learn guitar', set: 'w1' },
    { id: 'mr1-s2', text: 'I can name 5+ parts of the guitar', set: 'w2' },
    { id: 'mr1-s3', text: 'I can tune all 6 strings with a tuner', set: 'w2' },
    { id: 'mr1-s4', text: 'I can play a short melody on the E string at 60 BPM', set: 'w2' }
  ],
  assessItems: [
    'Tune your guitar in 2 minutes',
    'Name all 6 strings'
  ],
  standards: ['Pr.1a', 'Pr.4a', 'Pr.5a', 'Cn.11a']
};
