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
    skillFocus: 'Fretting a clean power chord · Moving the shape along the E and A strings · Reading power-chord TAB',
    handoutUrl: 'https://docs.google.com/document/d/1S0gxHXkbgZRJT5VhR9nGz6O2imjEF9uQ_jNAYFaTc6I/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'See the power chord shape move',
            steps: [
          {
            text: 'Power chord shape — see it move: here are E5, G5, and A5. It\'s the SAME two-finger shape (index on the root, ring two frets up) just slid to a new fret. Press ▶ to hear the root climb E → G → A, then build each shape on your guitar.',
            hint: 'Your index finger names the chord — it sits on the root. The ring finger always lands two frets higher, on the next string. Pause and match each diagram before moving on.',
            skills: [1, 2],
            chords: [
              { name: 'E5', chord: [[6,0],[5,2,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear the roots climb (E · G · A)', bpm: 60, notes: [40, 43, 45] },
            response: { type: 'mc', prompt: 'E5, G5, and A5 are played with…',
              answer: 1,
              explain: 'A power chord is one movable shape — slide the same two-finger grip to a new fret and the root note (and the chord name) changes.',
              choices: [
              'Three completely different shapes',
              'The same shape moved to different frets',
              'All your fingers on different strings',
              'Only open strings'
            ] }
          }
            ]
          },
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/ZBYoI7e3v5Y" target="_blank">Your Ultimate Power Chords Guide for Beginners – JustinGuitar</a> (0:00–4:00).',
            hint: 'Focus on his right-hand muting technique — how does he stop the strings he isn\'t playing from ringing? Try it on your guitar as he shows it.',
            skills: [1, 3],
            response: { type: 'short', placeholder: 'Describe his right-hand muting technique in your own words.' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/DVveuwoVmmY" target="_blank">Power Chords for Beginners – Marty Music</a> (0:00–3:00).',
            hint: 'Notice how he moves the same shape to different positions. As he does, slide your own shape along to A5 and G5 with him.',
            skills: [2, 4],
            response: { type: 'mc', prompt: 'If you play the same power chord shape with your index finger on the 5th fret of the low E string, what chord is it?',
              answer: 0,
              explain: 'The root sets the name. Fret 5 of the low E is A, so the power chord rooted there is A5.',
              choices: [
              'A5',
              'G5',
              'C5',
              'E5'
            ] }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — take a beat to reflect: which felt harder today — getting both notes to ring clean, or stopping the other strings from sounding? What started to help?',
            response: { type: 'short', placeholder: 'e.g. muting — my strumming hand kept letting the high strings ring' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — power chord drill',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every class the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Tuning (Module 1) is a skill you keep forever. 60 seconds here makes everything today sound better.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Fret a clean power chord & mute unused strings',
            steps: [
          {
            text: 'Challenge 1 — Clean E5: fret an E5 power chord (low E open root + 2nd fret A string) and strum just those two strings — no others. You\'ve got it when: a clean, buzz-free E5 with nothing else ringing.',
            hint: 'Use your index finger on the root and your ring finger on the 5th. Keep your pinky close. Palm-mute the strings below with the edge of your picking hand.',
            stuck: 'Pluck the two notes one at a time first — make sure each rings alone — then strum them together.',
            levelUp: 'Lift right off and re-fret the chord 5 times in a row, clean every single time.',
            skills: [1, 3],
            chords: [
              { name: 'E5', chord: [[6,0],[5,2,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 }
            ]
          },
          {
            text: 'Challenge 2 — Mute Check: fret your E5 and strum hard across ALL six strings. You\'ve got it when: strum all six strings but only the two power-chord notes ring — the other four stay silent.',
            hint: 'Let your fretting ring finger lean to deaden the strings above, and rest the side of your strumming hand lightly on the strings below the chord. A hard strum should still sound like just two notes.',
            stuck: 'Mute with the fretting hand first — let a finger lightly touch the strings you\'re not playing — then add the side of your strumming hand.',
            levelUp: 'Do the same on G5 and A5, where your hand has to shift up the neck and re-find the mute.',
            skills: [3]
          }
            ]
          },
          {
            title: 'Move the power chord shape along the E & A strings',
            steps: [
          {
            text: 'Challenge 3 — Shape Shifter: slide the same shape to A5 (5th fret E), G5 (3rd fret E), D5 (5th fret A), and C5 (3rd fret A), saying each name aloud. You\'ve got it when: hit all four cleanly without losing the shape.',
            hint: 'Keep the same finger shape and just move it along the neck. The gap between your two fingers never changes.',
            stuck: 'Park on just G5 and A5 (both E-string) and switch between them until it\'s smooth, then add the A-string chords.',
            levelUp: 'Have a partner call out a random chord (E5, A5, C5, D5…) and find it within 3 seconds, no counting frets.',
            skills: [2, 4],
            chords: [
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ]
          }
            ]
          },
          {
            title: 'Name the root as you climb the neck (E & A strings)',
            steps: [
          {
            text: 'Challenge 4 — Name & Climb (E string): walk the power chord UP the low E string and say each root aloud as you land it — E5 (open), F5 (1), G5 (3), A5 (5), B5 (7), C5 (8), D5 (10), E5 (12). You\'ve got it when: name every root correctly, chart-free, all the way to the 12th fret.',
            hint: 'You learned every note on the low E string in Module 2 — this is that same map. The root is wherever your index finger sits. Hit the natural notes; skip the sharps for now.',
            stuck: 'Do frets 0–7 only first (E5–B5), then add 8–12 once those are automatic.',
            levelUp: 'Name your way back DOWN the string (12 → 0) without counting, or do the lap at 80 BPM.',
            skills: [2],
            chords: [
              { name: 'E5', chord: [[6,0],[5,2,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'B5', chord: [[6,7,'1'],[5,9,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 7 },
              { name: 'C5', chord: [[6,8,'1'],[5,10,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 8 },
              { name: 'D5', chord: [[6,10,'1'],[5,12,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 10 },
              { name: 'E5', chord: [[6,12,'1'],[5,14,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 12 }
            ]
          },
          {
            text: 'Challenge 5 — Name & Climb (A string): now do the same up the A string — A5 (open), B5 (2), C5 (3), D5 (5), E5 (7), F5 (8), G5 (10), A5 (12). You\'ve got it when: name every root correctly, and notice the same note names land in different spots than they did on the E string.',
            hint: 'These are the A-string notes from Module 2. Keep the low E muted so only the power chord rings. Same note, new home — that\'s how the fretboard works.',
            stuck: 'Cover frets 0–5 (A5–D5) chart-free first, then add the rest.',
            levelUp: 'Have a partner call out random frets on either string for you to find and name on the spot.',
            skills: [4],
            chords: [
              { name: 'A5', chord: [[6,'x'],[5,0],[4,2,'3'],[3,'x'],[2,'x'],[1,'x']], position: 0 },
              { name: 'B5', chord: [[6,'x'],[5,2,'1'],[4,4,'3'],[3,'x'],[2,'x'],[1,'x']], position: 2 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'E5', chord: [[6,'x'],[5,7,'1'],[4,9,'3'],[3,'x'],[2,'x'],[1,'x']], position: 7 },
              { name: 'F5', chord: [[6,'x'],[5,8,'1'],[4,10,'3'],[3,'x'],[2,'x'],[1,'x']], position: 8 },
              { name: 'G5', chord: [[6,'x'],[5,10,'1'],[4,12,'3'],[3,'x'],[2,'x'],[1,'x']], position: 10 },
              { name: 'A5', chord: [[6,'x'],[5,12,'1'],[4,14,'3'],[3,'x'],[2,'x'],[1,'x']], position: 12 }
            ]
          }
            ]
          },
          {
            title: 'Play a power chord progression in time',
            steps: [
          {
            text: 'Challenge 6 — Watchtower Loop (your assessment piece): play A5–G5–F5–G5, one strum per beat at 60 BPM. You\'ve got it when: four times through, changing on beat 1 every time, with no stops. <a href="tabs/all-along-the-watchtower.html#layer-3" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
            hint: 'A5 = 5th fret E string, G5 = 3rd fret E string, F5 = 1st fret E string. Shift smoothly — aim to land exactly on beat 1. (The original song uses an Am chord, but as a power chord it\'s just A5 — no major or minor.) This is the loop the whole class plays for the Set 1 check-off.',
            stuck: 'Loop just A5–G5 (frets 5 and 3) until that change is clean, then add F5.',
            levelUp: 'Play it with an eighth-note strum (down-down-up-down-up), or push past 70 BPM.',
            skills: [2, 5, 6],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'G5',  chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'F5',  chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 }
            ],
            response: { type: 'short', prompt: 'Personal record: win at 60, then raise the metronome +10 at a time. Your fastest CLEAN loop today (BPM)?', placeholder: 'e.g. 80 — beat it next class' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Seven Nation Army, verse riff: play the riff as two-string power chords sliding along the A string, one chord per riff note at 60 BPM. You\'ve got it when: two clean laps in a row, both strings of every chord ringing. <a href="tabs/seven-nation-army.html#layer-3" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                hint: 'It\'s one shape sliding — keep your grip and let your arm do the moving.',
                stuck: 'Play roots-only (your Module 2 line), then add the second string back one chord at a time.',
                levelUp: 'Palm-mute the whole lap for the verse sound, then open up for a chorus lap.',
                skills: [2, 5, 6],
                tab: {
                  caption: '"Seven Nation Army" — verse riff as power chords · 60 BPM',
                  notes: [
                    { frets: [['D', 9],  ['A', 7]],  note: 'E5', midi: [59, 52] },
                    { frets: [['D', 9],  ['A', 7]],  note: 'E5', midi: [59, 52] },
                    { frets: [['D', 12], ['A', 10]], note: 'G5', midi: [62, 55] },
                    { frets: [['D', 9],  ['A', 7]],  note: 'E5', midi: [59, 52] },
                    { frets: [['D', 7],  ['A', 5]],  note: 'D5', midi: [57, 50] },
                    { frets: [['D', 5],  ['A', 3]],  note: 'C5', midi: [55, 48] },
                    { frets: [['D', 4],  ['A', 2]],  note: 'B5', midi: [54, 47] }
                  ]
                },
                response: { type: 'short', prompt: 'Which slide was hardest to land clean, and what fixed it?', placeholder: 'e.g. E5 up to G5 — smaller jumps helped' }
              }
            ]
          },
          {
            title: 'My Practice Routine — weekly check-in (never graded)',
            steps: [
              {
                text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to update your routine: (1) one thing you want to get better at, (2) when and where you\'ll practice this week, (3) how last week\'s plan went. Same check-in as Modules 1 and 2 — we keep it going all semester.',
                hint: 'No wrong answers — even five minutes a day beats one long cram. You\'re building a habit you\'ll actually keep.',
                response: { type: 'short', placeholder: '1) One thing to improve   2) When & where I\'ll practice   3) How last week went' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Which power chord change or muting move still feels shaky? Write it below — that\'s your warm-up target next time you practice.',
                response: { type: 'short', placeholder: 'e.g. the G5-to-F5 change drops a beat; high strings still ring sometimes' }
              }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Power chord loop: A5–G5–F5–G5 · Play as a class', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html#layer-3',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Happy Birthday"', meta: 'Power chord version — chords only (optional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Iconic single power-chord riff on E string', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html#layer-3',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Smells Like Teen Spirit" — Nirvana', meta: 'F Bb Ab Db power chord progression', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
        tutorialUrl: 'https://www.youtube.com/watch?v=HfhZbd5w-iY' },
      { name: '"Basket Case" — Green Day', meta: 'Eb Bb C G power chord sequence', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=NUTGr5t3MoY',
        tutorialUrl: 'https://www.youtube.com/watch?v=bUjBfpaVILI' },
      { name: '"My Generation" — The Who', meta: 'E5 simple — straightforward power chord song', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=qN5zw04WxCc',
        tutorialUrl: 'https://www.youtube.com/watch?v=TuGRhu4mRYc' },
      { name: '"Zombie" — The Cranberries', meta: 'Em C G D power chord version', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=6Ejga4kJUts',
        tutorialUrl: 'https://www.youtube.com/watch?v=uGMybMuDKAU' },
      { name: '"Should I Stay or Should I Go" — The Clash', meta: 'Power chord classic', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=xMaE6toi4mk',
        tutorialUrl: 'https://www.youtube.com/watch?v=ZEU-42bzWyA' }
    ],

    assessment: {
      goal: 'Frets a clean 2-finger power chord · Moves shape along E string without buzzing · Moves shape along A string · Mutes unused strings cleanly · Plays a chord on the beat · Reads a power chord TAB',
      performance: 'Whole-class unison: everyone plays A5–G5–F5–G5 loop together at 60 BPM. Teacher listens for muting and timing.',
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
    objective: 'I CAN change power chords on beat 1 at 60 BPM and hold a steady 8-bar progression up to 80 BPM.',
    skillFocus: 'Changing power chords in time · Building speed with a metronome · Playing a song progression',
    handoutUrl: 'https://docs.google.com/document/d/1S0gxHXkbgZRJT5VhR9nGz6O2imjEF9uQ_jNAYFaTc6I/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/sNa44EmrsDc" target="_blank">How & Why to Use a Metronome – JustinGuitar</a> (0:00–4:00).',
            hint: 'His tip about setting the metronome 10 BPM slower than you think you need is key. As he explains it, set your own metronome and tap along. Slow is smooth, smooth is fast.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'According to the video, where should you set the metronome when learning something new?',
              answer: 0,
              explain: 'Start a touch slower than feels comfortable — clean and in time first, then speed up. Practicing fast and sloppy just locks in the mistakes.',
              choices: [
              'About 10 BPM slower than you think you need',
              'As fast as you can possibly play',
              'It doesn\'t matter — pick any tempo',
              'Always 120 BPM'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/m3dYOsXbWII" target="_blank">Easy Power-Chord Songs Everyone Should Know – Marty Music</a> (0:00–3:00).',
            hint: 'Pick one song you recognize and try to play along as it plays. Match the strum timing to what you hear.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'Which song did you try to play along with? What was hardest about it?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/q8SHmo1-dac" target="_blank">3 Tips to NAIL Alternate Picking (build speed) – JustinGuitar</a> (0:00–3:00).',
            hint: 'Notice his method for building tempo gradually. As he describes it, try it: play your "Watchtower" loop at 60 BPM, then bump to 65, then 70.',
            skills: [1, 2],
            response: { type: 'short', placeholder: 'In one sentence, describe his method for building up tempo gradually.' }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — take a beat to reflect: at what tempo does your loop start to fall apart, and which part breaks down first — the change, the strum, or the muting?',
            response: { type: 'short', placeholder: 'e.g. around 75 BPM the F5 change gets late' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — metronome & chord changes',
        sections: [
          {
            title: 'Change power chords on beat 1 at 60 BPM',
            steps: [
          {
            text: 'Challenge 1 — Loop in Time: play the "Watchtower" loop (A5–G5–F5–G5) at 60 BPM, each chord one bar (4 beats), four times through. You\'ve got it when: every chord change lands on beat 1, with no stops.',
            hint: 'If you miss beat 1, keep going — don\'t stop. Staying in time matters more than the perfect change right now.',
            stuck: 'Drop to 50 BPM and nail it there first; play through a missed change instead of stopping to fix it.',
            levelUp: 'Bump to 70 BPM, or change chords every two beats instead of every bar so the moves come twice as fast.',
            skills: [1, 2]
          }
            ]
          },
          {
            title: 'Read and clap the rhythm',
            steps: [
          {
            text: 'Challenge — Clap & Count: before you play, read the rhythm. Clap and count a 4-bar line out loud — whole notes (hold 4 beats), half notes (hold 2 beats), quarter notes (one clap each), and straight eighths ("1 + 2 + 3 + 4 +"). You\'ve got it when: you can clap all 4 bars in time with the metronome at 70 BPM and name which notes are whole, half, quarter, and eighth.',
            hint: 'Whole note = one clap held for a full bar. Half note = one clap held for two beats. Eighth notes = two even claps per beat. The straight-eighths strum you play (down-down-up-down-up) is just eighth notes — same rhythm, on the guitar.',
            stuck: 'Clap quarter notes on every beat first (1 2 3 4), then split one beat into eighths ("1 +") and feel the difference.',
            levelUp: 'Clap one bar of eighths, one bar of quarters, alternating, without losing the count.',
            skills: [6]
          }
            ]
          },
          {
            title: 'Play an 8-bar progression with a steady strum',
            steps: [
          {
            text: 'Challenge — Name Your Progression: I–IV–V ("one–four–five"): musicians number chords by counting up the musical alphabet from the key\'s home note. In the key of A: A is I, count up to D for IV, and E for V — so A5–D5–E5 is a I–IV–V. Play A5–D5–E5, two bars each, one strum per beat at 60 BPM. You\'ve got it when: you can play the loop reading only the chord symbols AND say which chord is the I, the IV, and the V. At the unit check you\'ll read a three-chord (I–IV–V) progression from chord symbols with your named strum — this is that skill.',
            hint: 'All three use the same two-finger shape: A5 root on the E string (fret 5), D5 root on the A string (fret 5) — same fret, string hop! — and E5 root on the A string (fret 7).',
            stuck: 'Loop just A5→D5 (the same-fret hop) until it\'s clean, then add E5.',
            levelUp: 'Transpose it — build a I–IV–V starting from G5 (G–C–D) and name each chord\'s number.',
            skills: [2, 4],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'E5', chord: [[6,'x'],[5,7,'1'],[4,9,'3'],[3,'x'],[2,'x'],[1,'x']], position: 7 }
            ]
          },
          {
            text: 'Challenge 2 — Eighth-Note Strum (your assessment piece): play the loop with straight eighths (down-down-up-down-up), counting "1 + 2 + 3 + 4 +". You\'ve got it when: eight bars clean and steady at 60, then climb the ladder and hold 80 BPM for at least 15 seconds — that\'s the unit bar.',
            hint: 'Start at 60 BPM. If it feels easy, bump up 5 BPM. The unit-end check is an 8-bar progression changing on beat 1 at 60, then holding 80 BPM for 15 seconds with clean muting — this is that piece.',
            stuck: 'Strum down-only on each beat first ("1 2 3 4"), then add the up-strums one at a time.',
            levelUp: 'Hold it clean at 80 BPM, or play it straight through a full song excerpt from the songs list.',
            skills: [3, 4],
            response: { type: 'short', prompt: 'Personal record: once it\'s clean at 60, raise the metronome +5 at a time. Your fastest CLEAN tempo today (BPM)?', placeholder: 'e.g. 75 — beat it next class' }
          }
            ]
          },
          {
            title: 'Optional: add octave doubling',
            steps: [
          {
            text: 'Challenge 3 — Octave Add-On (give it a go!): add your pinky two frets above your ring finger to make a 3-note power chord. No score — just try it and notice how the sound changes.',
            hint: 'This is optional. If your power chord sounds clean as is, keep it. Only add the 3rd finger if you can do it without buzzing.',
            skills: [5]
          }
            ]
          },
          {
            title: 'Oye Mi Amor: Bm5–A5 two-shape metronome drill',
            steps: [
          {
            text: 'Challenge — Bm5 ↔ A5 Two-Shape Drill: meet Bm5, a new power chord — root B on the low E string, 7th fret (the same shape you climbed to in Set 1). Rock between the Oye Mi Amor verse chords, Bm5 (fret 7) and A5 (fret 5), one strum per beat — it\'s the same shape sliding two frets. You\'ve got it when: you can switch Bm5↔A5 landing on beat 1, both notes clean, all the way up the tempo ladder: 60 → 70 → 80 BPM. <a href="tabs/oye-mi-amor.html#layer-2" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
            hint: 'A power chord has no major or minor — Bm5 is just B5 (B + F#). Keep the two-finger shape locked and let your whole arm slide the two frets between fret 7 and fret 5.',
            stuck: 'Park on the slide: fret 5, fret 7, fret 5, fret 7 with no rhythm — make the 2-fret move automatic, then add the metronome at 60.',
            levelUp: 'Hold it clean at 80 BPM, or add the chorus chords D5 and G5 for the full D5–A5–Bm5–G5 progression.',
            skills: [1, 2],
            chords: [
              { name: 'Bm5', chord: [[6,7,'1'],[5,9,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 7 },
              { name: 'A5',  chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear Bm5 → A5 (roots B · A)', bpm: 60, notes: [47, 45] },
            response: { type: 'short', prompt: 'Your fastest CLEAN Bm5↔A5 today (BPM)?', placeholder: 'e.g. 70 — 80 next class' }
          }
            ]
          },
          {
            title: 'Sweet Child O\' Mine — in-class assessment rehearsal',
            steps: [
          {
            text: 'Challenge — Sweet Child Verse (in-class assessment rehearsal): play the Guns N\' Roses verse as power chords — D5 · C5 · G5, two beats per chord at 60 BPM. This is one of the songs you can bring to the in-class assessment. You\'ve got it when: four clean laps, every change on beat 1, muting tight. <a href="tabs/sweet-child-o-mine.html#layer-3" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
            hint: 'We play Sweet Child in standard tuning in class. (The famous recording is tuned a half-step down, so your D5–C5–G5 sound one fret higher than the record — that\'s expected; don\'t retune.) D5 and C5 are A-string roots; G5 drops to the low E string.',
            stuck: 'Loop D5 → C5 (both A-string, 2 frets apart) until smooth, then add the jump to G5 on the low E string.',
            levelUp: 'Push the tempo ladder to 70 then 80 BPM, or add a straight-eighths strum.',
            skills: [3, 4],
            chords: [
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 }
            ],
            response: { type: 'short', prompt: 'Clean laps of D5–C5–G5 at 60 BPM?', placeholder: 'e.g. 3 — the G5 jump lags' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Watchtower, verse: play the "All Along the Watchtower" loop as power chords rooted on the low E string — A5 · G5 · F5 · G5 — two beats per chord at 60 BPM. You\'ve got it when: four clean laps, every change landing on the beat. <a href="tabs/all-along-the-watchtower.html#layer-3" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                hint: 'Same three roots you played in Module 2 — now each one carries its fifth along for the ride.',
                stuck: 'Drop to roots-only for a lap, then add the second string back on just the A5.',
                levelUp: 'One beat per chord instead of two — same 60 BPM, twice the changes.',
                skills: [3, 4],
                tab: {
                  caption: '"All Along the Watchtower" — verse loop as power chords · 60 BPM',
                  notes: [
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5', midi: [50, 43] }
                  ]
                },
                response: { type: 'short', prompt: 'Clean laps in a row at 60 BPM — your count?', placeholder: 'e.g. 3 — F5 keeps buzzing' }
              },
              {
                // lyric-review: "the cure" clean edit pending (SITE_ALIGNMENT 0.3) — this step has no video link, but flag if audio is ever added
                text: 'Challenge — "the cure" as power chords (◐ optional stretch — give it a go, no score!): this gentle acoustic song isn\'t usually played this way — that\'s the point. Play its progression as power chords — A5 · C5 · D5 · F5 — two beats per chord at 60 BPM, quietly. You\'ve got it when: two laps clean AND soft — power chords don\'t have to be loud.',
                hint: 'You already know these roots from Module 2. The challenge here is touch: light pick, both strings ringing, no bark.',
                stuck: 'Roots-only at a whisper first — get the dynamics, then add the fifths.',
                levelUp: 'Add G5 before looping back to A5, or play one lap loud and one lap soft and hear the difference.',
                tab: {
                  caption: '"the cure" — progression as power chords (teaching arrangement) · 60 BPM',
                  notes: [
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] },
                    { frets: [['D', 5], ['A', 3]], note: 'C5', midi: [55, 48] },
                    { frets: [['D', 7], ['A', 5]], note: 'D5', midi: [57, 50] },
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] }
                  ]
                },
                response: { type: 'short', prompt: 'Loud vs. soft power chords — which was harder to keep clean?', placeholder: 'e.g. soft — I kept muting the D string' }
              },
              {
                text: 'Challenge — Oye Mi Amor, chorus: play Maná\'s chorus as power chords — D5 · A5 · Bm5 · G5 — two beats per chord at 60 BPM. You\'ve got it when: four laps with every change on beat 1, and Bm5 (fret 7) ringing as clean as the rest. <a href="tabs/oye-mi-amor.html#layer-2" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
                hint: 'You drilled Bm5↔A5 already — this adds D5 and G5 around them. D5 is an A-string root; A5, Bm5, and G5 are low-E-string roots.',
                stuck: 'Split it: loop D5 → A5 until smooth, then Bm5 → G5, then join the two halves.',
                levelUp: 'One beat per chord instead of two — same 60 BPM, twice the changes — or push the ladder to 70.',
                skills: [3, 4],
                tab: {
                  caption: '"Oye Mi Amor" — chorus as power chords (teaching arrangement) · 60 BPM',
                  notes: [
                    { frets: [['D', 7], ['A', 5]], note: 'D5',  midi: [57, 50] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5',  midi: [52, 45] },
                    { frets: [['A', 9], ['E', 7]], note: 'Bm5', midi: [54, 47] },
                    { frets: [['A', 5], ['E', 3]], note: 'G5',  midi: [50, 43] }
                  ]
                },
                response: { type: 'short', prompt: 'Which song did you land power chords in today, and at what BPM?', placeholder: 'e.g. Oye Mi Amor at 60 — clean' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'What\'s your current top clean tempo on the loop, and what\'s the one thing holding you back from going faster — a specific change, the strum, or muting? Name it below.',
                response: { type: 'short', placeholder: 'e.g. 75 BPM — the eighth-note up-strums get sloppy' }
              }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full power chord loop · change on beat 1 at 60, hold 80 BPM', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html#layer-3',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Electric riff → power-chord version', type: 'Core', core: true, journeyUrl: 'tabs/oye-mi-amor.html#layer-2',
        originalUrl: 'https://www.youtube.com/watch?v=UlkG3DmZJEI',
        tutorialUrl: 'https://www.youtube.com/watch?v=F4BbTdP2v70' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Verse: D5–C5–G5 power chord loop', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html#layer-3',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"Happy Birthday"', meta: 'Full power chord arrangement (optional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Full riff with power chords', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html#layer-3',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Blitzkrieg Bop" — Ramones', meta: 'A5 D5 E5 — fast and fun', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=268C3N2dDYk',
        tutorialUrl: 'https://www.youtube.com/watch?v=9lFufklJ-nU' },
      { name: '"Holiday" — Green Day', meta: 'F# B A E power chord sequence', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=A1OqtIqzScI',
        tutorialUrl: 'https://www.youtube.com/watch?v=583Sr2GwyTQ' },
      { name: '"Come as You Are" — Nirvana', meta: 'E string riff into power chords', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=vabnZ9-ex7o',
        tutorialUrl: 'https://www.youtube.com/watch?v=G14kHAijVHM' },
      { name: '"Master of Puppets" — Metallica', meta: 'Simplified intro power chord riff', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=hx27NL_iqEM',
        tutorialUrl: 'https://www.youtube.com/watch?v=FvVrCKgEu4s' },
      { name: '"21 Guns" — Green Day', meta: 'Dm Bb F C power chord version', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=r00ikilDxW4',
        tutorialUrl: 'https://www.youtube.com/watch?v=X5xRw9YjXLw' }
    ],

    assessment: {
      goal: 'Unit-end (three tasks): (1) Play a core-song excerpt to the metronome — e.g., the Seven Nation Army riff, Oye Mi Amor\'s Bm5–A5, or Sweet Child\'s D5–C5–G5 — switching cleanly between two power chords with roots on the same fret of the E and A strings at 60 BPM, then holding 80 BPM for at least 15 seconds. (2) Read a three-chord (I–IV–V) progression from chord symbols / TAB using a named strumming pattern (straight-eighths or split strum), and name power chords from a chord chart. (3) Clap and count a 4-bar rhythm using whole, half, quarter, and eighth notes.',
      performance: 'Individual: play a core-song excerpt with the metronome — changes on beat 1 at 60 BPM, then hold 80 BPM for 15 seconds; read a three-chord (I–IV–V) progression from chord symbols with your named strum; then clap and count a 4-bar rhythm. Teacher gives one piece of feedback.',
      selfCheck: 'Can you change chords on beat 1 at 60 BPM and hold 80 BPM for 15 seconds? Can you read a I–IV–V progression from chord symbols and name power chords from a chart?',
      standards: ['Pr.4a', 'Pr.5b', 'Pr.6a']
    },

    skills: [
      { id: 'm3w2-s1', text: 'Change power chords on beat 1 at 60 BPM',
        gotItWhen: 'your chord changes land exactly on beat 1 with the metronome at 60 BPM and you don\'t need to pause or restart (70+ BPM is a stretch goal on the ladder).' },
      { id: 'm3w2-s2', text: 'Play a full 8-bar power chord progression in time',
        gotItWhen: 'you can play through 8 bars without stopping, even if a chord change is rough — you keep going to the next downbeat.',
        practice: { type: 'playSeq', label: 'Watchtower roots (A · G · F · G)', bpm: 70,
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
      { id: 'm3w2-s6', text: 'Clap and count a 4-bar rhythm, and name whole, half, quarter, and eighth notes',
        gotItWhen: 'you can clap a 4-bar line in time with the metronome and say which notes are whole, half, quarter, or eighth — and name your strum as "straight eighths".',
        practice: { type: 'mc', prompt: 'A straight-eighths strum (down-down-up-down-up, counted "1 + 2 +") is made of which note value?',
          choices: ['Whole notes', 'Quarter notes', 'Eighth notes', 'Half notes'], answer: 2 } }
    ]
  }

); // end module-3.js

MODULE_REVIEWS[3] = {
  moduleNum: 3,
  module: 'Two-Finger Power Chords',
  skills: [
    { id: 'mr3-s1', text: 'I can fret a clean 2-finger power chord (root + 5th) with both notes ringing and no buzz', set: 'm3w1' },
    { id: 'mr3-s2', text: 'I can move the same shape along the low E string and name each chord without counting frets', set: 'm3w1' },
    { id: 'mr3-s3', text: 'I can move the shape along the A string and keep the low E string silent', set: 'm3w1' },
    { id: 'mr3-s5', text: 'I can read a power chord symbol like "A5" and instantly know which fret and string my index finger goes to', set: 'm3w1' },
    { id: 'mr3-s7', text: 'I can change power chords on beat 1 at 60 BPM without stopping', set: 'm3w2' },
    { id: 'mr3-s8', text: 'I can play an 8-bar progression with a straight-eighths strum, counting "1 + 2 + 3 + 4 +"', set: 'm3w2' }
  ],
  assessItems: [
    'Play a core-song excerpt (Seven Nation Army, Oye Mi Amor\'s Bm5–A5, or Sweet Child\'s D5–C5–G5) with changes on beat 1 at 60 BPM — including a clean switch between two power chords with roots on the same fret of the E and A strings — then hold 80 BPM for 15 seconds',
    'Read a three-chord (I–IV–V) progression from chord symbols / TAB with a named strumming pattern, and name power chords from a chord chart',
    'Clap and count a 4-bar rhythm using whole, half, quarter, and eighth notes'
  ],
  forward: 'The two-finger shape and the muting you just locked in are the backbone of rhythm guitar. The E &amp; A string roots you slide between also become your <strong>home base for the pentatonic patterns in Module 4</strong> — that\'s where you\'ll play lead lines and solos over these very same power chords.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a', 'Re.7a']
};
