// ============================================================
//  MODULE 3 — Two-Finger Power Chords
//  Edit this file to change Module 3 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm3w1',
    songThread: [{ name: 'Seven Nation Army', journey: 'tabs/seven-nation-army.html', layer: 3, note: 'the riff as power chords' }, { name: 'All Along the Watchtower', journey: 'tabs/all-along-the-watchtower.html', layer: 3, note: 'the loop as power chords' }],
    label: 'Set 1',
    locked: false,
    module: 'Two-Finger Power Chords',
    moduleNum: 3,
    unit: 'Module 3 · Two-Finger Power Chords',
    title: 'Set 1',
    subtitle: 'Power chord shape · Moving on E & A strings · Muting',
    objective: 'I CAN fret a clean 2-finger power chord and move the shape along the E and A strings.',
    skillFocus: 'Fretting a clean power chord · Moving the shape along the E and A strings · Reading power-chord TAB',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'See the power chord shape move',
            steps: [
          {
            text: 'Power chord shape — see it move: here are E5, G5, and A5. It\'s the SAME two-finger shape (index on the root, ring finger two frets up on the next string — for E5 the root is the open low E, so no index finger is needed, just the ring) just slid to a new fret. Press ▶ to hear the root climb E → G → A, then build each shape on your guitar.',
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
            text: 'Watch: <a href="https://www.youtube.com/watch?v=vtcdDira8eE" target="_blank">What Is A Power Chord? Easy Rock Guitar Chords – Lauren Bateman (0:00–4:00)</a>.',
            hint: 'Focus on the two-finger shape — which fingers go where, and how the note under your index finger names the chord. Try the shape on your guitar as she shows it.',
            skills: [1, 3],
            response: { type: 'short', placeholder: 'Describe the power chord shape in your own words — which fingers go where, and what names the chord?' }
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
            text: 'Station Wrap-Up — pause and think: which felt harder today — getting both notes to ring clean, or stopping the other strings from sounding? What started to help?',
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
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
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
            hint: 'For E5 the root is the OPEN low E — no index finger needed. Just place your ring finger on the A string, 2nd fret (that note is the chord\'s fifth). Keep your pinky close. Palm-mute the strings below with the edge of your picking hand.',
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
            levelUp: 'Make quick flashcards (E5, A5, C5, D5…), shuffle them, and find each chord within 3 seconds of flipping a card — no counting frets. Got someone around? Have them call out chords instead.',
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
            text: 'Challenge 4 — Name & Climb (E string): walk the power chord UP the low E string and say each root aloud as you land it — E5 (open), F5 (1), G5 (3), A5 (5), B5 (7), C5 (8), D5 (10), E5 (12). You\'ve got it when: name every root correctly, without looking at the chart, all the way to the 12th fret.',
            hint: 'You learned every note on the low E string in Module 2 — this is that same map. The root is wherever your index finger sits. Hit the natural notes; skip the sharps for now.',
            stuck: 'Do frets 0–7 only first (E5–B5), then add 8–12 once those are automatic.',
            levelUp: 'Name your way back DOWN the string (12 → 0) without counting, or do the lap (a lap = one full time through) at 80 BPM.',
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
            stuck: 'Cover frets 0–5 (A5–D5) without looking at the chart first, then add the rest.',
            levelUp: 'Write random frets (0–12) for either string on flashcards, shuffle, and name each root on the spot as you flip. Got someone around? Have them call out frets instead.',
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
            text: 'Challenge 6 — Watchtower Loop (your assessment piece): play A5–G5–F5–G5, one bar (4 beats) per chord, one strum per beat at 60 BPM. You\'ve got it when: four times through, changing on beat 1 every time, with no stops. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
            hint: 'A5 = 5th fret E string, G5 = 3rd fret E string, F5 = 1st fret E string. Shift smoothly — aim to land exactly on beat 1. (The original song uses an Am chord, but as a power chord it\'s just A5 — no major or minor.) This is your Set 1 check-off loop — record a lap and listen back.',
            stuck: 'Loop just A5–G5 (frets 5 and 3) until that change is clean, then add F5.',
            levelUp: 'Play it with an eighth-note strum (down on each number, up on each "+": "1 + 2 + 3 + 4 +"), or push past 70 BPM.',
            skills: [2, 5, 6],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'G5',  chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'F5',  chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 }
            ],
            response: { type: 'short', prompt: 'Personal record: play it cleanly at 60, then raise the metronome +10 at a time. Your fastest CLEAN loop today (BPM)?', placeholder: 'e.g. 80 — try for a higher number next session' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Seven Nation Army, verse riff: play the riff (a short musical phrase that repeats) as two-string power chords sliding along the A string, one chord per riff note at 60 BPM. You\'ve got it when: two clean laps in a row, both strings of every chord ringing. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
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
                text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to update your routine: (1) one thing you want to get better at, (2) when and where you\'ll practice this week, (3) how last week\'s plan went. Same check-in as Modules 1 and 2 — you\'ll keep it going through the whole course.',
                hint: 'No wrong answers — even five minutes a day is better than one long rushed session. You\'re building a habit you\'ll actually keep.',
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
          },
          {
            title: '⚡ Ear Spark — optional ear bonus',
            steps: [
              {
                text: '⚡ Ear Spark (optional, 2 min): first, build a full open E major — it\'s your E5 (open low E + A string, 2nd fret) with two notes added: G string, 1st fret and D string, 2nd fret, letting the open B and high e ring too. Now write "power" on a few paper slips and "full" on a few others, shuffle them face-down, and draw one at a time: play E5 for a "power" slip or the full E major for a "full" slip, a few reps. On playback, call each one "power" or "full" before flipping the slip to check — power chords are hollow, with no major/minor color. Got someone around? Have them play while you look away.'
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Frets a clean 2-finger power chord · Moves shape along E string without buzzing · Moves shape along A string · Mutes unused strings cleanly · Plays a chord on the beat · Reads a power chord TAB',
      performance: 'Record yourself playing the A5–G5–F5–G5 loop at 60 BPM, then listen back for muting and timing.',
      selfCheck: 'Can you fret a power chord with no buzzing from unused strings? Can you move the shape to 3 different positions without pausing?',
      standards: ['Pr.4a', 'Pr.5a', 'Re.7a']
    },

    skills: [
      { id: 'm3w1-s1', text: 'Fret a clean 2-finger power chord (root + 5th) with no buzzing',
        gotItWhen: 'both notes ring clearly when you strum, with no buzz and no muffled strings — and it sounds the same every time you play it.',
        practice: { type: 'mc', prompt: 'A power chord is built from which two scale degrees (a scale degree = a note\'s number in the scale, counting up from the root)?',
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
    songThread: [{ name: 'Luna', journey: 'tabs/luna.html', layer: 3, note: 'the F5–A5 vamp' }, { name: 'Sweet Child O\' Mine', journey: 'tabs/sweet-child-o-mine.html', layer: 3, note: 'D5–C5–G5 — your assessment piece' }, { name: 'All Along the Watchtower', journey: 'tabs/all-along-the-watchtower.html', layer: 3, note: 'the A5–G5–F5 loop' }, { name: '"the cure"', journey: 'tabs/the-cure.html', layer: 3, note: 'the changes as power chords' }],
    label: 'Set 2',
    locked: false,
    module: 'Two-Finger Power Chords',
    moduleNum: 3,
    unit: 'Module 3 · Two-Finger Power Chords',
    title: 'Set 2',
    subtitle: 'Power chords with metronome · Chord changes · Strumming patterns',
    objective: 'I CAN change power chords on beat 1 at 60 BPM and hold a steady 8-bar progression up to 80 BPM.',
    skillFocus: 'Changing power chords in time · Building speed with a metronome · Playing a song progression',
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
            hint: 'His tip about setting the metronome 10 BPM slower than you think you need is key. As he explains it, set your own metronome and tap along. Slow is smooth, smooth is fast — practice slowly and cleanly, and speed comes on its own.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'According to the video, where should you set the metronome when learning something new?',
              answer: 0,
              explain: 'Start a touch slower than feels comfortable — clean and in time first, then speed up. Practicing fast and sloppy just makes the mistakes permanent.',
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
            text: 'Watch: <a href="https://youtu.be/q8SHmo1-dac" target="_blank">3 Tips to NAIL Alternate Picking (build speed) – JustinGuitar</a> (0:00–3:00). Alternate picking means strict down-up-down-up — every downstroke is followed by an upstroke, so the pick never travels the same way twice in a row. Watch his tempo-step method for building speed.',
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
            text: 'Station Wrap-Up — pause and think: at what tempo does your loop start to fall apart, and which part breaks down first — the change, the strum, or the muting?',
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
            stuck: 'Drop to 50 BPM and get it clean there first; play through a missed change instead of stopping to fix it.',
            levelUp: 'Bump to 70 BPM, or change chords every two beats instead of every bar so the moves come twice as fast.',
            skills: [1, 2]
          }
            ]
          },
          {
            title: 'Speed changes — every two beats, then every beat',
            steps: [
          {
            text: 'Challenge — Half-Bar Power Switches (2 chords): real riffs change faster than once a bar. Keep A5 and D5, but switch every TWO beats — two down-strums on A5, two on D5, and repeat, at 60 BPM. That\'s a change every half-bar, twice as often as the loops so far. You\'ve got it when: four laps where every switch lands right on the beat, no stops. Press &#x25B6; to hear the target.',
            hint: 'A5 and D5 are the same shape one string apart — A5 roots on the low E (fret 5), D5 on the A string (fret 5). Shift the whole shape across and keep your two fingers glued together.',
            stuck: 'Drop to 50 BPM. Start moving your fingers to the next chord on the "and" after beat 2, so the shape is ready before the switch.',
            levelUp: 'Climb to 70, then 80 BPM, or jump ahead to the every-beat drill below.',
            skills: [1, 2],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear it — A5·A5 · D5·D5 (change every 2 beats)', bpm: 60, notes: [[45,52],[45,52],[50,57],[50,57],[45,52],[45,52],[50,57],[50,57]] }
          },
          {
            text: 'Challenge — Three-Chord Half-Bar (3 chords): now three shapes, still two beats each — G5 · C5 · D5, then back to G5, looping at 60 BPM. That\'s a I–IV–V in the key of G, the backbone of thousands of songs, moving at chorus speed. You\'ve got it when: two clean laps, every change on the beat.',
            hint: 'C5 and D5 are both A-string roots two frets apart (frets 3 and 5); G5 drops to the low E string (fret 3). Group the two A-string shapes in your mind, then the hop down to G5.',
            stuck: 'Loop just C5 → D5 (the same-string, two-fret slide) until it\'s automatic, then add the G5 hop.',
            levelUp: 'Speed up to 75 BPM, or reorder as G5 · D5 · C5 and keep every change on the beat.',
            skills: [1, 2],
            chords: [
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'C5', chord: [[6,'x'],[5,3,'1'],[4,5,'3'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'D5', chord: [[6,'x'],[5,5,'1'],[4,7,'3'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear it — G5·G5 · C5·C5 · D5·D5 (I–IV–V, every 2 beats)', bpm: 60, notes: [[43,50],[43,50],[48,55],[48,55],[50,57],[50,57]] }
          },
          {
            text: 'Challenge — Four-Chord Half-Bar (Watchtower): the full "All Along the Watchtower" loop as low-E power chords — A5 · G5 · F5 · G5 — two beats each at 60 BPM, looping. Four chord slots inside every bar-and-a-half — this is exactly how the record cycles. You\'ve got it when: four clean laps, every change landing on the beat.',
            hint: 'All three roots sit on the low E string — A5 (fret 5), G5 (fret 3), F5 (fret 1). It\'s one shape walking down the neck and back up.',
            stuck: 'Play just the roots (skip the second string) for one lap to lock the walk, then add the fifth back in.',
            levelUp: 'Palm-mute for a tighter chug, or move on to the every-beat version below.',
            skills: [1, 2],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 }
            ],
            playSeq: { label: 'Hear it — A5·G5·F5·G5 (every 2 beats)', bpm: 60, notes: [[45,52],[45,52],[43,50],[43,50],[41,48],[41,48],[43,50],[43,50]] }
          },
          {
            text: 'Challenge — One Chord Per Beat (Watchtower, fast): the top of the ladder — a new chord on every single beat. Same A5 · G5 · F5 · G5 loop, but one down-strum per beat at 60 BPM, no repeats. This is what a driving riff feels like: no time to think, the next shape has to be ready before you arrive. You\'ve got it when: four laps clean at 60, then climb 65 → 70.',
            hint: 'Because the walk is A5→G5→F5→G5, your hand moves two frets, two frets, then back two — a steady rocking slide. Feel the pattern in your arm, not your eyes.',
            stuck: 'Cut it in half: loop just A5 · G5, one per beat, until it\'s smooth, then add F5.',
            levelUp: 'Hold it clean at 80 BPM, or make all four different — E5 · G5 · A5 · C5, one per beat.',
            skills: [1, 2],
            chords: [
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 },
              { name: 'G5', chord: [[6,3,'1'],[5,5,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 3 },
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 }
            ],
            playSeq: { label: 'Hear it — A5·G5·F5·G5 (one chord per beat)', bpm: 60, notes: [[45,52],[43,50],[41,48],[43,50],[45,52],[43,50],[41,48],[43,50]] },
            response: { type: 'short', prompt: 'Your fastest CLEAN one-chord-per-beat Watchtower today (BPM)?', placeholder: 'e.g. 70 — 80 next session' }
          }
            ]
          },
          {
            title: 'Read and clap the rhythm',
            steps: [
          {
            text: 'Challenge — Clap & Count: before you play, read this 4-bar rhythm line. Bar 1 = one whole note (clap once, hold all 4 beats). Bar 2 = two half notes (clap on beats 1 and 3, each held 2 beats). Bar 3 = four quarter notes (one clap per beat: 1, 2, 3, 4). Bar 4 = eight straight eighths (two claps per beat: "1 + 2 + 3 + 4 +"). Clap and count all 4 bars out loud. You\'ve got it when: you can clap all 4 bars in time with the metronome at 70 BPM and name which notes are whole, half, quarter, and eighth.',
            hint: 'Whole note = one clap held for a full bar. Half note = one clap held for two beats. Eighth notes = two even claps per beat. The straight-eighths strum you play (down on each number, up on each "+") is just eighth notes — same rhythm, on the guitar.',
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
            text: 'Challenge — Name Your Progression: I–IV–V ("one–four–five"): musicians number chords by counting up the musical alphabet from the key\'s home note (the note the music rests on and sounds finished). In the key of A: A is I, count up to D for IV, and E for V — so A5–D5–E5 is a I–IV–V. Play A5–D5–E5, two bars each, one strum per beat at 60 BPM. You\'ve got it when: you can play the loop reading only the chord symbols AND say which chord is the I, the IV, and the V. At the module self-check you\'ll read a three-chord (I–IV–V) progression from chord symbols with your named strum — this is that skill.',
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
            text: 'Challenge 2 — Eighth-Note Strum (one of your assessment pieces): play the A5–D5–E5 loop (two bars each) with straight eighths (down on each number, up on each "+"), counting "1 + 2 + 3 + 4 +". You\'ve got it when: eight bars clean and steady at 60, then speed up in steps (65 → 70 → 75) and hold 80 BPM for at least 15 seconds — that\'s the module bar.',
            hint: 'Start at 60 BPM. If it feels easy, bump up 5 BPM. The module-end self-check is an 8-bar progression changing on beat 1 at 60, then holding 80 BPM for 15 seconds with clean muting — this is that piece.',
            stuck: 'Strum down-only on each beat first ("1 2 3 4"), then add the up-strums one at a time.',
            levelUp: 'Hold it clean at 80 BPM, or play it straight through a full song excerpt from the songs list.',
            skills: [3, 4],
            response: { type: 'short', prompt: 'Personal record: once it\'s clean at 60, raise the metronome +5 at a time. Your fastest CLEAN tempo today (BPM)?', placeholder: 'e.g. 75 — try for a higher number next session' }
          },
          {
            text: 'Challenge 3 — Split Strum ("boom-chick"): the other named strum for this progression. Split each pair of beats in two jobs — beat 1: pick ONLY the root (your 1st-finger bass note), beat 2: strum the whole shape. Count "boom-chick, boom-chick": 1 = boom (root alone), 2 = chick (full chord), 3 = boom, 4 = chick. Play the A5–D5–E5 loop this way, two bars each at 60 BPM. Click "Hear the split strum" to hear one bar of A5 then one of D5. You\'ve got it when: eight bars where every boom is JUST the root string and every chick is the full shape — no accidental extra strings on the boom.',
            hint: 'The pick does two different jobs an inch apart: a small, aimed pick stroke on just the root string, then a relaxed strum through the shape. Keep your eyes on the root string for the boom — that\'s the precision half.',
            stuck: 'Mute the strings with your fretting hand and drill just the motion: pick-strum, pick-strum, until the aim is automatic. Then fret A5 and add one chord at a time.',
            levelUp: 'Split strum the whole I–IV–V from chord symbols only, or mix it: two bars split strum, two bars straight eighths — feel how the same chords groove two different ways (a groove = the steady rhythmic feel).',
            skills: [3, 4],
            playSeq: { label: 'Hear the split strum', bpm: 70, notes: [45, [45,52], 45, [45,52], 50, [50,57], 50, [50,57]] }
          }
            ]
          },
          {
            title: 'Optional: add octave doubling',
            steps: [
          {
            text: 'Challenge 4 — Octave Add-On (try it!): add your pinky on the next string, at the same fret as your ring finger, to make a 3-note power chord. No score — just try it and notice how the sound changes.',
            hint: 'This is optional. If your power chord sounds clean as is, keep it. Only add the 3rd finger if you can do it without buzzing.',
            skills: [5]
          }
            ]
          },
          {
            title: 'Luna: F5–A5 two-shape metronome drill',
            steps: [
          {
            text: 'Challenge — F5 ↔ A5 Two-Shape Drill: Luna\'s whole vamp (a vamp = a short chord pattern repeated over and over) is two power chords — F5 (root F, low E string, fret 1) and A5 (root A, fret 5) — the same two-finger shape sliding four frets. One strum per big beat: Luna is in 6/8, so strum just the downbeats, two per bar, nothing syncopated (syncopated = accents landing off the main beat). You\'ve got it when: you can switch F5 ↔ A5 landing every downbeat clean, speeding up in steps: 60 → 70 → 80 BPM. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
            hint: 'A power chord has no major or minor — just root + 5th. Keep the two-finger shape locked and let your whole arm make the four-fret slide.',
            stuck: 'Park on the slide: fret 1, fret 5, fret 1, fret 5 with no rhythm until the jump is automatic — then add the metronome at 60.',
            levelUp: 'Palm-mute for a tight sierreño chug (sierreño = a Mexican acoustic-guitar style; a chug = a short, muted, punchy strum) — then let it ring and hear why distortion isn\'t this song\'s home. That\'s what the ◐ means.',
            skills: [1, 2],
            chords: [
              { name: 'F5', chord: [[6,1,'1'],[5,3,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 1 },
              { name: 'A5', chord: [[6,5,'1'],[5,7,'3'],[4,'x'],[3,'x'],[2,'x'],[1,'x']], position: 5 }
            ],
            playSeq: { label: 'Hear F5 → A5 (roots F · A)', bpm: 60, notes: [41, 45] },
            response: { type: 'short', prompt: 'Your fastest CLEAN F5↔A5 today (BPM)?', placeholder: 'e.g. 70 — 80 next session' }
          }
            ]
          },
          {
            title: 'Sweet Child O\' Mine — assessment rehearsal',
            steps: [
          {
            text: 'Challenge — Sweet Child Verse (assessment rehearsal): play the Guns N\' Roses verse as power chords — D5 · C5 · G5, two beats per chord at 60 BPM. This is one of the songs you can use for the module self-assessment. You\'ve got it when: four clean laps, every change on beat 1, muting tight. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
            hint: 'On this site we play Sweet Child in standard tuning. (The famous recording is tuned a half-step down, so your D5–C5–G5 sound one fret higher than the recording — that\'s expected; don\'t retune.) D5 and C5 are A-string roots; G5 drops to the low E string.',
            stuck: 'Loop D5 → C5 (both A-string, 2 frets apart) until smooth, then add the jump to G5 on the low E string.',
            levelUp: 'Speed up in steps to 70, then 80 BPM, or add a straight-eighths strum.',
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
                text: 'Challenge — Watchtower, verse: play the "All Along the Watchtower" loop as power chords rooted on the low E string — A5 · G5 · F5 · G5 — two beats per chord at 60 BPM. You\'ve got it when: four clean laps, every change landing on the beat. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                hint: 'Same three roots you played in Module 2 — now each root note also sounds its fifth.',
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
                text: 'Challenge — "the cure" as power chords (◐ optional harder challenge — try it, no score!): this gentle acoustic song isn\'t usually played this way — that\'s the point. Play its progression as power chords — A5 · C5 · D5 · F5 — two beats per chord at 60 BPM, quietly. You\'ve got it when: two laps clean AND soft — power chords don\'t have to be loud. <a href="tabs/the-cure.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                hint: 'You already know these roots from Module 2. The challenge here is touch: light pick, both strings ringing, no harsh sound.',
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
                text: 'Challenge — Luna, full vamp: the whole song rides F5 ↔ A5. Play along with the teaching arrangement — two downbeat strums per bar, changing where the record changes. You\'ve got it when: a full verse and chorus without losing a downbeat, F5 ringing as clean as A5. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                hint: 'This is the same F5↔A5 slide from the drill above — the only change is following where the record changes instead of a fixed count.',
                stuck: 'Loop the F5↔A5 slide with no song for a few rounds first, then drop in following the record.',
                levelUp: 'Add a light palm mute for the verse, then let it ring open for the chorus — instant dynamics.',
                skills: [3, 4],
                tab: {
                  caption: '"Luna" — the vamp as power chords (teaching arrangement) · 60 BPM',
                  notes: [
                    { frets: [['A', 3], ['E', 1]], note: 'F5', midi: [48, 41] },
                    { frets: [['A', 7], ['E', 5]], note: 'A5', midi: [52, 45] }
                  ]
                },
                response: { type: 'short', prompt: 'Which song did you land power chords in today, and at what BPM?', placeholder: 'e.g. Luna at 60 — clean' }
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

    assessment: {
      goal: 'Module-end (three tasks): (1) Play a core-song excerpt to the metronome — e.g., the Seven Nation Army riff, All Along the Watchtower\'s A5–G5–F5, or Sweet Child\'s D5–C5–G5 — switching cleanly between two power chords with roots on the same fret of the E and A strings at 60 BPM, then holding 80 BPM for at least 15 seconds. (2) Read a three-chord (I–IV–V) progression from chord symbols / TAB using a named strumming pattern (straight-eighths or split strum), and name power chords from a chord chart. (3) Clap and count a 4-bar rhythm using whole, half, quarter, and eighth notes.',
      performance: 'Record yourself: play a core-song excerpt with the metronome — changes on beat 1 at 60 BPM, then hold 80 BPM for 15 seconds; read a three-chord (I–IV–V) progression from chord symbols with your named strum; then clap and count a 4-bar rhythm. Listen back and note one thing to improve.',
      selfCheck: 'Can you change chords on beat 1 at 60 BPM and hold 80 BPM for 15 seconds? Can you read a I–IV–V progression from chord symbols and name power chords from a chart?',
      standards: ['Pr.4a', 'Pr.5b', 'Pr.6a']
    },

    skills: [
      { id: 'm3w2-s1', text: 'Change power chords on beat 1 at 60 BPM',
        gotItWhen: 'your chord changes land exactly on beat 1 with the metronome at 60 BPM and you don\'t need to pause or restart (70+ BPM is an optional harder challenge).' },
      { id: 'm3w2-s2', text: 'Play a full 8-bar power chord progression in time',
        gotItWhen: 'you can play through 8 bars without stopping, even if a chord change is rough — you keep going to the next downbeat.',
        practice: { type: 'playSeq', label: 'Watchtower roots (A · G · F · G) — two beats each', bpm: 60,
          notes: [45, 45, 43, 43, 41, 41, 43, 43] } },
      { id: 'm3w2-s3', text: 'Play a straight-eighths strumming pattern with power chords',
        gotItWhen: 'you can strum down on each number and up on each "+" across a bar and count "1 + 2 + 3 + 4 +" aloud without losing the strum.' },
      { id: 'm3w2-s4', text: 'Apply power chords on both E and A string roots in the same song',
        gotItWhen: 'you can switch between an E-root and an A-root power chord mid-song without your palm mute breaking or the wrong strings ringing.',
        practice: { type: 'mc', prompt: 'A song calls for G5 then C5. Where does your index finger go for each?',
          choices: ['Both on E string', 'Both on A string', 'G5 on E (fret 3), C5 on A (fret 3)', 'G5 on A, C5 on E'], answer: 2 } },
      { id: 'm3w2-s5', text: 'Optional: add 3rd finger octave doubling to the power chord shape',
        gotItWhen: 'your pinky lands on the next string at the same fret as your ring finger and all three notes ring cleanly — no buzz, no muffled string.',
        practice: { type: 'mc', prompt: 'You add your pinky on the next string, at the same fret as your ring finger. What interval (an interval = the distance between two notes) did you just add to the chord?',
          choices: ['A 3rd', 'A 5th', 'An octave (same note, higher)', 'A 7th'], answer: 2 } },
      { id: 'm3w2-s6', text: 'Clap and count a 4-bar rhythm, and name whole, half, quarter, and eighth notes',
        gotItWhen: 'you can clap a 4-bar line in time with the metronome and say which notes are whole, half, quarter, or eighth — and name your strum as "straight eighths".',
        practice: { type: 'mc', prompt: 'A straight-eighths strum — down on each number, up on each "+", counted "1 + 2 + 3 + 4 +" — is made of which note value?',
          choices: ['Whole notes', 'Quarter notes', 'Eighth notes', 'Half notes'], answer: 2 } }
    ]
  }

); // end module-3.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[3] = [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full power chord loop · change on beat 1 at 60, hold 80 BPM', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Full riff with power chords', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: '◐ Sierreño vamp → power-chord version (on purpose, in a different style than the original)', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Verse: D5–C5–G5 power chord loop', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"Happy Birthday"', meta: 'Full power chord arrangement (optional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Smells Like Teen Spirit" — Nirvana', meta: 'F Bb Ab Db power chord progression', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=hTWKbfoikeg',
        tutorialUrl: 'https://www.youtube.com/watch?v=HfhZbd5w-iY' },
      { name: '"Zombie" — The Cranberries', meta: 'Em C G D power chord version', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=6Ejga4kJUts',
        tutorialUrl: 'https://www.youtube.com/watch?v=uGMybMuDKAU' },
      { name: '"Master of Puppets" — Metallica', meta: 'Simplified intro power chord riff', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=hx27NL_iqEM',
        tutorialUrl: 'https://www.youtube.com/watch?v=FvVrCKgEu4s' },
      { name: '"Blitzkrieg Bop" — Ramones', meta: 'A5 D5 E5 — fast and fun', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=268C3N2dDYk',
        tutorialUrl: 'https://www.youtube.com/watch?v=9lFufklJ-nU' },
      { name: '"De Música Ligera" — Soda Stereo', meta: 'Bm–G–D–A riff, played as B5–G5–D5–A5 power chords', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=T_FkEw27XJ0',
        tutorialUrl: 'https://www.youtube.com/watch?v=TRciSsMYuZ0' }
    ];

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
    'Play a core-song excerpt (Seven Nation Army, All Along the Watchtower\'s A5–G5–F5, or Sweet Child\'s D5–C5–G5) with changes on beat 1 at 60 BPM — including a clean switch between two power chords with roots on the same fret of the E and A strings, with unused strings muted the whole way — then hold 80 BPM for 15 seconds',
    'Read a three-chord (I–IV–V) progression from chord symbols / TAB with a named strumming pattern (straight eighths or the split strum), and name power chords from a chord chart',
    'Clap and count a 4-bar rhythm using whole, half, quarter, and eighth notes'
  ],
  forward: 'The two-finger shape and the muting you just locked in are the backbone of rhythm guitar. The E &amp; A string roots you slide between also become your <strong>starting point for the pentatonic patterns in Module 4</strong> — that\'s where you\'ll play lead lines and solos over these very same power chords.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a', 'Re.7a']
};
