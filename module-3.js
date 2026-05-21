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
        title: 'Computer station — Watch · Listen · Practice',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/RQcEJMYSGfI" target="_blank">Power Chords – Simen Otnes</a> (full video).',
            hint: 'Pause after the shape explanation and try the power chord on your guitar before he plays along. Make sure both notes ring clean.',
            skills: [1, 2]
          },
          {
            text: 'Watch: <a href="https://youtu.be/3CIbdUaHMhw" target="_blank">Power Chords 101 – JustinGuitar</a> (0:00–4:00).',
            hint: 'Focus on his right-hand muting technique. How does he stop the strings he isn\'t playing from ringing?',
            skills: [1, 3]
          },
          {
            text: 'Watch: <a href="https://youtu.be/dJfV7DsTThc" target="_blank">Power Chords for Beginners – Marty Music</a> (0:00–3:00).',
            hint: 'Notice how he moves the same shape to different positions on the neck. Try sliding your shape to A5 and G5.',
            skills: [2, 4]
          }
        ]
      },
      c: {
        title: 'Practice station — power chord drill',
        time: '12 min',
        steps: [
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
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Power chord loop: Am5–G5–F5–G5 · Play as a class', type: 'Core', core: true },
      { name: '"Happy Birthday"', meta: 'Power chord version — chords only, no melody yet', type: 'Core', core: true },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Iconic single power-chord riff on E string', type: 'Core', core: true },
      { name: '"Smells Like Teen Spirit" — Nirvana', meta: 'E A D C# power chord progression', type: 'Choice', core: false },
      { name: '"Basket Case" — Green Day', meta: 'Eb Bb C G power chord sequence', type: 'Choice', core: false },
      { name: '"My Generation" — The Who', meta: 'E5 simple — straightforward power chord song', type: 'Choice', core: false },
      { name: '"Zombie" — The Cranberries', meta: 'Em C G D power chord version', type: 'Choice', core: false },
      { name: '"Should I Stay or Should I Go" — The Clash', meta: 'Power chord classic', type: 'Choice', core: false }
    ],

    assessment: {
      goal: 'Frets a clean 2-finger power chord · Moves shape along E string without buzzing · Moves shape along A string · Mutes unused strings cleanly · Plays a chord on the beat · Reads a power chord TAB',
      performance: 'Whole-class unison: everyone plays Am5–G5–F5–G5 loop together at 60 BPM. Teacher listens for muting and timing.',
      selfCheck: 'Can you fret a power chord with no buzzing from unused strings? Can you move the shape to 3 different positions without pausing?',
      standards: ['Pr.4a', 'Pr.5a', 'Re.7a']
    },

    skills: [
      { id: 'm3w1-s1', text: 'Fret a clean 2-finger power chord (root + 5th) with no buzzing' },
      { id: 'm3w1-s2', text: 'Move the power chord shape along the E string (E5, G5, A5, B5)' },
      { id: 'm3w1-s3', text: 'Mute unused strings with palm and fretting hand' },
      { id: 'm3w1-s4', text: 'Move the power chord shape along the A string (A5, C5, D5)' },
      { id: 'm3w1-s5', text: 'Play a power chord on the beat with a single down-strum' },
      { id: 'm3w1-s6', text: 'Read a basic power chord TAB or chord symbol (e.g. A5, G5)' }
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
        title: 'Computer station — Watch · Listen · Practice',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/hzC0orOGARw" target="_blank">How to Practice with a Metronome – JustinGuitar</a> (0:00–4:00).',
            hint: 'His tip about setting the metronome 10 BPM slower than you think you need is key. Slow is smooth, smooth is fast.',
            skills: [1, 2]
          },
          {
            text: 'Watch: <a href="https://youtu.be/JBKIamtI_Qc" target="_blank">Power Chord Song Examples – Marty Music</a> (full video).',
            hint: 'Pick one song you recognize and try to play along. Match the strum timing to what you hear.',
            skills: [3, 4]
          },
          {
            text: 'Watch: <a href="https://youtu.be/Oqn1pflxC_Q" target="_blank">Increasing Speed on Guitar – Simen Otnes</a> (0:00–3:00).',
            hint: 'Notice his method for building tempo gradually. Try it: play your "Watchtower" loop at 60 BPM, then bump to 65, then 70.',
            skills: [1, 2]
          }
        ]
      },
      c: {
        title: 'Practice station — metronome & chord changes',
        time: '12 min',
        steps: [
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
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full power chord loop at 70+ BPM with metronome', type: 'Core', core: true },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Chorus power chords: C–G–Am–F as power chord versions', type: 'Core', core: true },
      { name: '"Happy Birthday"', meta: 'Full power chord arrangement', type: 'Core', core: true },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Full riff with power chords', type: 'Core', core: true },
      { name: '"Blitzkrieg Bop" — Ramones', meta: 'A5 D5 E5 — fast and fun', type: 'Choice', core: false },
      { name: '"Holiday" — Green Day', meta: 'F# B A E power chord sequence', type: 'Choice', core: false },
      { name: '"Come as You Are" — Nirvana', meta: 'E string riff into power chords', type: 'Choice', core: false },
      { name: '"Master of Puppets" — Metallica', meta: 'Simplified intro power chord riff', type: 'Choice', core: false },
      { name: '"21 Guns" — Green Day', meta: 'Dm Bb F C power chord version', type: 'Choice', core: false }
    ],

    assessment: {
      goal: 'Unit-end: Perform an 8-bar power chord song or progression of your choice at 80 BPM with the metronome. Must include at least 3 different power chords and clean string muting.',
      performance: 'Individual or partner check: play 8 bars of a power chord progression with the metronome. Teacher gives one piece of feedback.',
      selfCheck: 'Can you change chords on beat 1 at 70 BPM without stopping? Can you play a full song excerpt from memory?',
      standards: ['Pr.4a', 'Pr.5b', 'Pr.6a']
    },

    skills: [
      { id: 'm3w2-s1', text: 'Change power chords on beat 1 at 70+ BPM' },
      { id: 'm3w2-s2', text: 'Play a full 8-bar power chord progression in time' },
      { id: 'm3w2-s3', text: 'Play a straight-eighths strumming pattern with power chords' },
      { id: 'm3w2-s4', text: 'Apply power chords on both E and A string roots in the same song' },
      { id: 'm3w2-s5', text: 'Optional: add 3rd finger octave doubling to the power chord shape' },
      { id: 'm3w2-s6', text: 'Self-evaluate timing with the metronome and adjust tempo intentionally' }
    ]
  }

); // end module-3.js
