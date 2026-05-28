// ============================================================
//  MODULE 3 — Two-Finger Power Chords
//  Edit this file to change Module 3 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm3w1',
    label: 'Set 1',
    locked: false,
    module: 'Two-Finger Power Chords',
    moduleNum: 3,
    unit: 'Module 3 · Two-Finger Power Chords',
    title: 'Set 1',
    subtitle: 'Power chord shape · Moving on E & A strings · Muting',
    objective: 'I CAN fret a clean 2-finger power chord and move the shape along the E and A strings.',
    skillFocus: 'Root + 5th shape (index + ring finger) · Muting unused strings · Down-strum: one per beat · Moving the shape: A5, E5, G5, D5, C5 · Reading power chord TAB & chord symbols',
    handoutUrl: 'https://docs.google.com/document/d/1S0gxHXkbgZRJT5VhR9nGz6O2imjEF9uQ_jNAYFaTc6I/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/RQcEJMYSGfI" target="_blank">Power Chords – Simen Otnes</a> (full video).',
            hint: 'Pause after the shape explanation and try the power chord on your guitar before he plays along. Make sure both notes ring clean.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'A power chord is made up of which two notes?', choices: [
              'The root and the 5th',
              'The root, the 3rd, and the 5th',
              'The root and the octave (same note, higher)',
              'All six open strings'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/3CIbdUaHMhw" target="_blank">Power Chords 101 – JustinGuitar</a> (0:00–4:00).',
            hint: 'Focus on his right-hand muting technique. How does he stop the strings he isn\'t playing from ringing?',
            skills: [1, 3],
            response: { type: 'short', placeholder: 'Describe his right-hand muting technique in your own words.' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/dJfV7DsTThc" target="_blank">Power Chords for Beginners – Marty Music</a> (0:00–3:00).',
            hint: 'Notice how he moves the same shape to different positions on the neck. Try sliding your shape to A5 and G5.',
            skills: [2, 4],
            response: { type: 'mc', prompt: 'If you play the same power chord shape with your index finger on the 5th fret of the low E string, what chord is it?', choices: [
              'A5',
              'G5',
              'C5',
              'E5'
            ] }
          }
        ]
      },
      c: {
        title: 'Practice station — power chord drill',        steps: [
          {
            text: 'Tune your guitar. Fret an E5 power chord (low E string, open root + 2nd fret A string). Strum just those two strings — no others. Get a clean, buzz-free sound.',
            hint: 'Use your index finger on the root and your ring finger on the 5th. Keep your pinky close. Palm-mute the strings below with the edge of your picking hand.',
            skills: [1, 3],
            chords: [
              { name: 'E5', chord: [[6,0],[5,2,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 }
            ]
          },
          {
            text: 'Slide the same shape to: A5 (5th fret E string), G5 (3rd fret E string), D5 (5th fret A string), C5 (3rd fret A string). Say the chord name aloud each time.',
            hint: 'Keep the same finger shape and just move it up and down the neck. The relationship between the two fingers never changes.',
            skills: [2, 4],
            chords: [
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ]
          },
          {
            text: 'Play the "All Along the Watchtower" power chord loop: Am5–G5–F5–G5, one strum per beat at 60 BPM.',
            hint: 'Am5 = 5th fret E string, G5 = 3rd fret E string, F5 = 1st fret E string. Shift smoothly — aim to land exactly on beat 1.',
            skills: [2, 5, 6],
            chords: [
              { name: 'Am5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'G5',  chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'F5',  chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Power chord loop: Am5–G5–F5–G5 · Play as a class', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Happy Birthday"', meta: 'Power chord version — chords only, no melody yet', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Iconic single power-chord riff on E string', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Smells Like Teen Spirit" — Nirvana', meta: 'E A D C# power chord progression', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
        tutorialUrl: 'https://www.youtube.com/watch?v=HfhZbd5w-iY' },
      { name: '"Basket Case" — Green Day', meta: 'Eb Bb C G power chord sequence', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=NUTGr5t3MoY',
        tutorialUrl: 'https://www.youtube.com/watch?v=bUjBfpaVILI' },
      { name: '"My Generation" — The Who', meta: 'E5 simple — straightforward power chord song', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=qN5zw04WxCc',
        tutorialUrl: 'https://www.youtube.com/watch?v=TuGRhu4mRYc' },
      { name: '"Zombie" — The Cranberries', meta: 'Em C G D power chord version', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=6Ejga4kJUts',
        tutorialUrl: 'https://www.youtube.com/watch?v=uGMybMuDKAU' },
      { name: '"Should I Stay or Should I Go" — The Clash', meta: 'Power chord classic', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=xMaE6toi4mk',
        tutorialUrl: 'https://www.youtube.com/watch?v=ZEU-42bzWyA' }
    ],

    assessment: {
      goal: 'Frets a clean 2-finger power chord · Moves shape along E string without buzzing · Moves shape along A string · Mutes unused strings cleanly · Plays a chord on the beat · Reads a power chord TAB',
      performance: 'Whole-class unison: everyone plays Am5–G5–F5–G5 loop together at 60 BPM. Teacher listens for muting and timing.',
      selfCheck: 'Can you fret a power chord with no buzzing from unused strings? Can you move the shape to 3 different positions without pausing?',
      standards: ['Pr.4a', 'Pr.5a', 'Re.7a']
    },

    skills: [
      { id: 'm3w1-s1', text: 'Fret a clean 2-finger power chord (root + 5th) with no buzzing',
        gotItWhen: 'both notes ring clearly when you strum, with no buzz and no muffled strings — and it sounds the same every time you play it.',
        practice: { type: 'mc', prompt: 'A power chord is built from which two scale degrees?',
          choices: ['Root + 3rd', 'Root + 5th', 'Root + 7th', 'Root + octave'], answer: 1 } },
      { id: 'm3w1-s2', text: 'Move the power chord shape along the E string (E5, G5, A5, B5)',
        gotItWhen: 'you can move the same shape to any of those positions on call and name the chord without counting frets.',
        practice: { type: 'mc', prompt: 'Your index finger is on the low E string at fret 5. Which power chord are you playing?',
          choices: ['G5', 'A5', 'B5', 'D5'], answer: 1 } },
      { id: 'm3w1-s3', text: 'Mute unused strings with palm and fretting hand',
        gotItWhen: 'you can strum hard across all 6 strings and only the two intentional notes ring — the other 4 stay silent.' },
      { id: 'm3w1-s4', text: 'Move the power chord shape along the A string (A5, C5, D5)',
        gotItWhen: 'you can shift the shape to the A-string root without your palm mute breaking — and the low E string stays silent.',
        practice: { type: 'mc', prompt: 'Your index finger is on the A string at fret 3. Which power chord are you playing?',
          choices: ['B5', 'C5', 'D5', 'A5'], answer: 1 } },
      { id: 'm3w1-s5', text: 'Play a power chord on the beat with a single down-strum',
        gotItWhen: 'your strum lands on beat 1 with the metronome and the chord rings cleanly — no early or late attacks.' },
      { id: 'm3w1-s6', text: 'Read a basic power chord TAB or chord symbol (e.g. A5, G5)',
        gotItWhen: 'you can see "A5" or "G5" on a chart and instantly know which fret your index finger goes on, on which string.',
        practice: { type: 'mc', prompt: 'You see "A5" written above a bar. What does it mean?',
          choices: ['Play just the A note', 'A power chord rooted on A', 'A major chord', 'Play the 5th fret on A string'], answer: 1 } }
    ]
  },

  {
    id: 'm3w2',
    label: 'Set 2',
    locked: false,
    module: 'Two-Finger Power Chords',
    moduleNum: 3,
    unit: 'Module 3 · Two-Finger Power Chords',
    title: 'Set 2',
    subtitle: 'Power chords with metronome · Chord changes · Strumming patterns',
    objective: 'I CAN change power chords on beat 1 at 70+ BPM and play a full song excerpt in time.',
    skillFocus: 'Chord changes on beat 1 · Start at 60 BPM, increase 5 BPM each class · 2-bar and 4-bar chord progressions · Straight-eighths strumming pattern · Optional: 3rd finger octave doubling',
    handoutUrl: 'https://docs.google.com/document/d/1S0gxHXkbgZRJT5VhR9nGz6O2imjEF9uQ_jNAYFaTc6I/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/hzC0orOGARw" target="_blank">How to Practice with a Metronome – JustinGuitar</a> (0:00–4:00).',
            hint: 'His tip about setting the metronome 10 BPM slower than you think you need is key. Slow is smooth, smooth is fast.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'According to the video, where should you set the metronome when learning something new?', choices: [
              'About 10 BPM slower than you think you need',
              'As fast as you can possibly play',
              'It doesn\'t matter — pick any tempo',
              'Always 120 BPM'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/JBKIamtI_Qc" target="_blank">Power Chord Song Examples – Marty Music</a> (full video).',
            hint: 'Pick one song you recognize and try to play along. Match the strum timing to what you hear.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'Which song did you try to play along with? What was hardest about it?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/Oqn1pflxC_Q" target="_blank">Increasing Speed on Guitar – Simen Otnes</a> (0:00–3:00).',
            hint: 'Notice his method for building tempo gradually. Try it: play your "Watchtower" loop at 60 BPM, then bump to 65, then 70.',
            skills: [1, 2],
            response: { type: 'short', placeholder: 'In one sentence, describe his method for building up tempo gradually.' }
          }
        ]
      },
      c: {
        title: 'Practice station — metronome & chord changes',        steps: [
          {
            text: 'Set metronome to 60 BPM. Play the "Watchtower" loop (Am5–G5–F5–G5) four times through. Each chord lasts one bar (4 beats). Change on beat 1 every time.',
            hint: 'If you miss beat 1, keep going — don\'t stop. Staying in time matters more than the perfect change right now.',
            skills: [1, 2]
          },
          {
            text: 'Try the straight-eighths strumming pattern: down-down-up-down-up on each bar. Count "1 + 2 + 3 + 4 +" as you strum.',
            hint: 'Start at 60 BPM. If it feels easy, bump up 5 BPM. Your goal this week: play the loop cleanly at 70+ BPM.',
            skills: [3, 4]
          },
          {
            text: 'Choice: Try a 3rd finger octave doubling — add your pinky two frets above your ring finger to make a 3-note power chord. Does it change the sound?',
            hint: 'This is optional. If your power chord sounds clean as is, keep it. Only add the 3rd finger if you can do it without buzzing.',
            skills: [5]
          }
        ]
      }
    },

    songs: [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full power chord loop at 70+ BPM with metronome', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Chorus power chords: C–G–Am–F as power chord versions', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"Happy Birthday"', meta: 'Full power chord arrangement', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Full riff with power chords', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Blitzkrieg Bop" — Ramones', meta: 'A5 D5 E5 — fast and fun', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=268C3N2dDYk',
        tutorialUrl: 'https://www.youtube.com/watch?v=9lFufklJ-nU' },
      { name: '"Holiday" — Green Day', meta: 'F# B A E power chord sequence', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=A1OqtIqzScI',
        tutorialUrl: 'https://www.youtube.com/watch?v=583Sr2GwyTQ' },
      { name: '"Come as You Are" — Nirvana', meta: 'E string riff into power chords', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=vabnZ9-ex7o',
        tutorialUrl: 'https://www.youtube.com/watch?v=G14kHAijVHM' },
      { name: '"Master of Puppets" — Metallica', meta: 'Simplified intro power chord riff', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=hx27NL_iqEM',
        tutorialUrl: 'https://www.youtube.com/watch?v=FvVrCKgEu4s' },
      { name: '"21 Guns" — Green Day', meta: 'Dm Bb F C power chord version', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=r00ikilDxW4',
        tutorialUrl: 'https://www.youtube.com/watch?v=X5xRw9YjXLw' }
    ],

    assessment: {
      goal: 'Unit-end: Perform an 8-bar power chord song or progression of your choice at 80 BPM with the metronome. Must include at least 3 different power chords and clean string muting.',
      performance: 'Individual or partner check: play 8 bars of a power chord progression with the metronome. Teacher gives one piece of feedback.',
      selfCheck: 'Can you change chords on beat 1 at 70 BPM without stopping? Can you play a full song excerpt from memory?',
      standards: ['Pr.4a', 'Pr.5b', 'Pr.6a']
    },

    skills: [
      { id: 'm3w2-s1', text: 'Change power chords on beat 1 at 70+ BPM',
        gotItWhen: 'your chord changes land exactly on beat 1 with the metronome at 70 BPM and you don\'t need to pause or restart.' },
      { id: 'm3w2-s2', text: 'Play a full 8-bar power chord progression in time',
        gotItWhen: 'you can play through 8 bars without stopping, even if a chord change is rough — you keep going to the next downbeat.',
        practice: { type: 'playSeq', label: 'Watchtower roots (Am · G · F · G)', bpm: 70,
          notes: [45, 43, 41, 43] } },
      { id: 'm3w2-s3', text: 'Play a straight-eighths strumming pattern with power chords',
        gotItWhen: 'you can play down-down-up-down-up across a bar and count "1 + 2 + 3 + 4 +" aloud without losing the strum.' },
      { id: 'm3w2-s4', text: 'Apply power chords on both E and A string roots in the same song',
        gotItWhen: 'you can switch between an E-root and an A-root power chord mid-song without your palm mute breaking or the wrong strings ringing.',
        practice: { type: 'mc', prompt: 'A song calls for G5 then C5. Where does your index finger go for each?',
          choices: ['Both on E string', 'Both on A string', 'G5 on E (fret 3), C5 on A (fret 3)', 'G5 on A, C5 on E'], answer: 2 } },
      { id: 'm3w2-s5', text: 'Optional: add 3rd finger octave doubling to the power chord shape',
        gotItWhen: 'your pinky lands two frets above your ring finger and all three notes ring cleanly — no buzz, no muffled string.',
        practice: { type: 'mc', prompt: 'You add your pinky two frets above your ring finger. What interval did you just add to the chord?',
          choices: ['A 3rd', 'A 5th', 'An octave (same note, higher)', 'A 7th'], answer: 2 } },
      { id: 'm3w2-s6', text: 'Self-evaluate timing with the metronome and adjust tempo intentionally',
        gotItWhen: 'you can tell whether you\'re ahead, behind, or with the click — and you can pick a tempo where you sound clean instead of pushing too fast.' }
    ]
  }

); // end module-3.js

MODULE_REVIEWS[3] = {
  moduleNum: 3,
  module: 'Two-Finger Power Chords',
  skills: [
    { id: 'mr3-s1', text: 'I can fret a clean 2-finger power chord (root + 5th) with no buzz' },
    { id: 'mr3-s2', text: 'I can move the power chord shape along the E and A strings' },
    { id: 'mr3-s3', text: 'I can mute unused strings cleanly' },
    { id: 'mr3-s4', text: 'I can change power chords on beat 1 at 70+ BPM' },
    { id: 'mr3-s5', text: 'I can play an 8-bar power chord progression in time' }
  ],
  standards: ['Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a', 'Re.7a']
};
