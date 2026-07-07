// ============================================================
//  MODULE 5 — Open Chords
//  Edit this file to change Module 5 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm5w1',
    label: 'Set 1',
    locked: false,
    module: 'Open Chords',
    moduleNum: 5,
    unit: 'Module 5 · Open Chords',
    title: 'Set 1',
    subtitle: 'Reading chord diagrams · Am and Em · First strumming',
    objective: 'I CAN read a chord diagram and fret Am and Em cleanly with a 4-beat strum pattern.',
    skillFocus: 'Reading chord diagrams · Fretting the Am and Em chords · Playing a simple down-strum',
    handoutUrl: 'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/4-JTCASlh-w" target="_blank">How to Read TAB & Chord Boxes – JustinGuitar</a> (0:00–4:00).',
            hint: 'Pause when he shows a diagram and look at it yourself. What does the X mean? What does the O mean? What do the numbers in the dots tell you?',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'On a chord diagram, an X above a string means:',
              answer: 0,
              explain: 'An X means don\'t play that string at all — skip it or mute it so it stays silent. An O (not X) means play it open.',
              choices: [
              'Do not play that string',
              'Play that string with your thumb',
              'Play it muted (palm-mute)',
              'It is optional'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/HNSaXAe8tyg" target="_blank">Your Very First Chords: Em & Asus2 – Marty Music</a> (0:00–5:00).',
            hint: 'Try placing your fingers as he shows Am, then strum it before watching more. Does every string ring? If not, check which finger is accidentally muting a string. Keep your fretting hand relaxed — tension is the enemy of clean tone.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'When you strummed Am, did every string ring clean? If not, which one was muted and why?' }
          },
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — take a beat to reflect: of everything on a chord diagram (X, O, dots, finger numbers), which part still feels least automatic when you sit down to read one?',
            response: { type: 'short', placeholder: 'e.g. I still pause on which number means which finger' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — chord shapes & first strums',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every class the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Tuning (Module 1) is a skill you keep forever. Clean open strings are exactly what makes a chord ring.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Fret Am cleanly',
            steps: [
          {
            text: 'Challenge 1 — Clean Am: fret Am (index str 2/fret 1, middle str 4/fret 2, ring str 3/fret 2) and strum strings 1–5 (not the low E). You\'ve got it when: every string rings cleanly — check each one by plucking it.',
            hint: 'Press just behind the frets, not on them. Curve your fingers so they don\'t accidentally touch neighboring strings, and keep your hand relaxed — tension is the enemy of clean tone. Check each string individually by plucking it.',
            stuck: 'Get strings 2 and 3 ringing first (index + ring), then add the middle finger. Most buzz comes from a finger lying too flat — sit up on the very tip.',
            levelUp: 'Lift all three fingers, then drop the whole shape at once and strum — aim for a clean chord on the first try.',
            skills: [3, 5],
            chords: [
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Fret Em cleanly',
            steps: [
          {
            text: 'Challenge 2 — Clean Em: fret Em (middle str 5/fret 2, ring str 4/fret 2) and strum all 6 strings. You\'ve got it when: a full, open, buzz-free Em — this is your warm-up chord.',
            hint: 'Em is the easiest chord on guitar. Use it to warm up before harder chords. It should sound full and open.',
            stuck: 'If a string buzzes, check that both fingers are arched up on their tips and not leaning on the open strings next door.',
            levelUp: 'Switch Em→Am→Em without looking at your fingers — feel the shape instead of watching it.',
            skills: [4, 5],
            chords: [
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Switch Am ↔ Em on beat 1',
            steps: [
          {
            text: 'Challenge 3 — Am ↔ Em Switch: at 60 BPM, 4 down-strums per bar, play 2 bars of Am then 2 bars of Em and repeat. You\'ve got it when: change chords right on beat 1 every time — keep strumming through any fumble.',
            hint: 'Even if the chord isn\'t perfect, keep strumming in time. Stopping to fix a note is the #1 habit to avoid. Fix it between bars, not mid-bar. Set the ⏱ Timer for 2 minutes and loop the switch until it beeps.',
            stuck: 'Your index finger barely moves between Am and Em — anchor it and let the others follow. Drop to 50 BPM if 60 feels rushed.',
            levelUp: 'Bump to 70 BPM, or play a down-up strum on each bar instead of straight downs.',
            skills: [5, 6]
          }
            ]
          },
          {
            title: 'One-Minute Changes — beat your record',
            steps: [
              {
                text: 'Challenge 4 — One-Minute Changes (Am ↔ Em): set the ⏱ Timer for 60 seconds and switch Am→Em→Am→Em as many times as you can. Every CLEAN change counts; a buzzy or missed one doesn\'t. You\'ve got it when: count your clean changes and type the number below — beat it next class. (Over 20 is solid for week one.)',
                hint: 'This is the classic chord-change speed test. Quality first: a clean change you can count beats a blurry one you can\'t.',
                stuck: 'Keep your index finger planted (it barely moves between Am and Em) and move only the other fingers. Slow down until every change rings.',
                levelUp: 'Add one strum on each chord before you switch, or swap in Am→C instead.',
                skills: [5, 6],
                response: { type: 'short', prompt: 'Personal record — clean Am↔Em changes in 60 seconds. Your count today?', placeholder: 'e.g. 22 — beat it next class' }
              }
            ]
          },
          {
            title: 'My Practice Routine — weekly check-in (never graded)',
            steps: [
              {
                text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to update your routine: (1) one thing you want to get better at, (2) when and where you\'ll practice this week, (3) how last week\'s plan went. Same check-in you\'ve kept since Module 1 — we keep it going all semester.',
                hint: 'No wrong answers — even five minutes a day beats one long cram. You\'re building a habit you\'ll actually keep.',
                response: { type: 'short', placeholder: '1) One thing to improve   2) When & where I\'ll practice   3) How last week went' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Which was harder today — getting each chord to ring clean, or switching between them in time? Write the one thing you\'ll drill first next class.',
                response: { type: 'short', placeholder: 'e.g. Am keeps buzzing on string 3 — I\'ll start there' }
              }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"Happy Birthday"', meta: 'Read chord diagrams for C–G–Am chord version (optional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Let It Be" — The Beatles', meta: 'Verse chords · read from chord chart · C–G–Am–F', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html#layer-2',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=_Kw4subj5z8' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am–G–F–G · Read from chord chart', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html#layer-5',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Horse with No Name" — America', meta: 'Em–D6add9 — only 2 chords, great starter', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=2OTc4ZOsSSI',
        tutorialUrl: 'https://www.youtube.com/watch?v=Mwh9WILLlM0' },
      { name: '"Knockin\' on Heaven\'s Door" — Dylan', meta: 'G–D–Am — simple and beautiful', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=rm9coqlk8fY',
        tutorialUrl: 'https://www.youtube.com/watch?v=pWIL4N6QZ-Y' },
      { name: '"Stand By Me" — Ben E. King', meta: 'G–Em–C–D — classic 4-chord song', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=hwZNL7QVJjE',
        tutorialUrl: 'https://www.youtube.com/watch?v=TXLElO_YYiY' },
      { name: '"Brown Eyed Girl" — Van Morrison', meta: 'G–C–G–D · strum practice', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=UfmkgQRmmeE',
        tutorialUrl: 'https://www.youtube.com/watch?v=v-EGJOz-Mek' },
      { name: '"What\'s Up" — 4 Non Blondes', meta: 'A–D–Em–D — great for building chord fluency', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=6NXnxTNIWkc',
        tutorialUrl: 'https://www.youtube.com/watch?v=r5NMiCVB85Y' }
    ],

    assessment: {
      goal: 'Reads a chord diagram correctly · Identifies X, O, and finger numbers on chart · Frets Am cleanly · Frets Em cleanly · Strums 4 beats per bar in time · Finds any chord shown on a chart',
      performance: 'Class: everyone strums Am for 4 bars, then Em for 4 bars, in time with teacher counting. Teacher listens for clean tone.',
      selfCheck: 'Can you read a chord diagram and find the right fingers without help? Can you strum Am and Em with no buzzing?',
      standards: ['Re.7a', 'Pr.4a']
    },

    skills: [
      { id: 'm5w1-s1', text: 'Read a chord diagram: identify X (mute), O (open), dots (finger placement), and numbers (which finger)',
        gotItWhen: 'someone hands you a chord diagram you\'ve never seen and you can put your fingers on the right strings, frets, and finger numbers without asking.',
        practice: { type: 'mc', prompt: 'On a chord diagram, what does an "X" above a string mean?',
          choices: ['Play that string open', 'Mute it — don\'t play that string', 'That\'s where finger 1 goes', 'Play that string twice'], answer: 1 } },
      { id: 'm5w1-s2', text: 'Explain the difference between a chord chart, TAB, and standard notation',
        gotItWhen: 'you can look at all three and say which is which — and explain in one sentence what each one tells you.',
        practice: { type: 'mc', prompt: 'Which one shows finger positions for a chord shape, but NOT a sequence of notes to play?',
          choices: ['A chord diagram', 'TAB', 'Standard notation', 'All three show note sequences'], answer: 0 } },
      { id: 'm5w1-s3', text: 'Fret Am cleanly — every string rings with no buzzing',
        gotItWhen: 'you pluck each of the 5 strings in Am individually and every one rings clear — no buzz, no muffled string.',
        practice: { type: 'playSeq', label: 'Hear Am chord (arpeggiated)', bpm: 60,
          notes: [45, 52, 57, 60, 64] } },
      { id: 'm5w1-s4', text: 'Fret Em cleanly — all 6 strings ring open and full',
        gotItWhen: 'you strum all 6 strings and the chord sounds full and open — no string is accidentally muted by a neighboring finger.',
        practice: { type: 'playSeq', label: 'Hear Em chord (arpeggiated)', bpm: 60,
          notes: [40, 47, 52, 55, 59, 64] } },
      { id: 'm5w1-s5', text: 'Strum 4 down-strums per bar in time at 60 BPM',
        gotItWhen: 'your strums land on beats 1, 2, 3, 4 with the metronome at 60 BPM and you can keep it going for at least 8 bars without drifting.' },
      { id: 'm5w1-s6', text: 'Identify and fret any chord shown on a chord chart',
        gotItWhen: 'you can read any chord diagram in the songbook and play it without having to look up the chord name.',
        practice: { type: 'mc', prompt: 'You see a "3" written inside one of the dots on a chord diagram. What does it tell you?',
          choices: ['Play it on the 3rd fret', 'Use your 3rd finger (ring)', 'Hold the chord for 3 beats', 'It\'s a 3-finger chord'], answer: 1 } }
    ]
  },

  {
    id: 'm5w2',
    label: 'Set 2',
    locked: false,
    module: 'Open Chords',
    moduleNum: 5,
    unit: 'Module 5 · Open Chords',
    title: 'Set 2',
    subtitle: 'Chord Group 1: C, F, Am, G · Down-up strumming · Smooth transitions',
    objective: 'I CAN fret C, F, Am, and G cleanly and switch between them at 70 BPM with a down-up strum pattern.',
    skillFocus: 'Fretting the C, F, and G chords · Switching chords smoothly · Playing down-up strum patterns',
    handoutUrl: 'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/RBYqdBqogo4" target="_blank">The C Chord (BC-132) – JustinGuitar</a> (0:00–4:00).',
            hint: 'He shows the "perfect" chord change technique. Watch how he prepares the next chord shape before strumming it. Anticipation is the secret.',
            skills: [1, 2, 3, 4],
            response: { type: 'mc', prompt: 'What is the "secret" to clean chord changes, according to the video?',
              answer: 0,
              explain: 'Anticipate the next shape — start moving your fingers toward it before you finish strumming the current chord. Speed comes from preparation, not from rushing.',
              choices: [
              'Prepare (anticipate) the next chord shape before you strum it',
              'Strum harder so any missed notes are hidden',
              'Use only your index finger',
              'Memorize each chord with your eyes closed'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/yrn3kbBaOMI" target="_blank">F Chord Simplified – Marty Music</a> (0:00–3:00).',
            hint: 'The F chord is the #1 stumbling block for beginners. The simplified version (xx3211) avoids the full barre. Use this until it\'s clean, then worry about the barre version.',
            skills: [2],
            response: { type: 'short', placeholder: 'Which version of the F chord are you starting with (full barre or simplified)? Why?' }
          },
            ]
          },
          {
            title: 'Listen for the chord changes',
            steps: [
          {
            text: 'Listen to "Let It Be" by The Beatles. Can you hear the C–G–Am–F chord pattern in the verse? Count the bars — how many strums per chord? <a href="tabs/let-it-be.html#layer-1" target="_blank">&#x1F9F5; Song Journey: this is Layer 1 of 4</a>.',
            hint: 'You don\'t need to play along yet. Just listen and map out when the chords change. This trains your ear to recognize the I–V–vi–IV progression.',
            skills: [5],
            response: { type: 'short', placeholder: 'About how many strums (or beats) does each chord get before it changes?' }
          },
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — take a beat to reflect: which of these four chords (C, G, Am, F) is fighting you most right now, and is it the shape itself or getting to it in time?',
            response: { type: 'short', placeholder: 'e.g. F — the shape is fine but I\'m slow getting into it' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — chord transitions & strumming',
        sections: [
          {
            title: 'Name the root note of each chord before you strum',
            steps: [
          {
            text: 'Challenge — Name the Root: before you strum each chord, find and say its ROOT — the note the chord is named after, on the lowest string you strum. C = C (A string, 3rd fret) · G = G (low E, 3rd fret) · Am = A (A string, open) · F = F (D string, 3rd fret). You\'ve got it when: name all four roots correctly, then play the chord.',
            hint: 'Knowing where a chord\'s root lives on the neck is the same Module 2 note-name skill — and it is exactly what makes barre chords easy in Module 7. The root tells you the chord\'s name.',
            stuck: 'Use the Module 2 note map — the root is the lowest string you actually strum. Find that one note first, then build the shape around it.',
            levelUp: 'Name the roots of D, A, and Em too — you\'ll meet those chords next set.',
            skills: [1],
            chords: [
              { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
              { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
              { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
              { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Use a common-finger pivot (Am ↔ C)',
            steps: [
          {
            text: 'Challenge 1 — Pivot Finger: switch Am ↔ C keeping your index finger planted on string 2, fret 1, moving only the other fingers. You\'ve got it when: clean changes both ways without ever lifting the pivot finger.',
            hint: 'Common-finger pivots cut your transition time in half. Look for other chords in this group that share a finger position.',
            stuck: 'Rest your index lightly on string 2 / fret 1 and refuse to lift it — move only the middle and ring fingers.',
            levelUp: 'Find the shared finger between C and G and pivot on that too.',
            skills: [4, 6]
          }
            ]
          },
          {
            title: 'Play the C–G–Am–F loop in time',
            steps: [
          {
            text: 'Challenge 2 — C–G–Am–F Loop: at 60 BPM, play 2 bars each of C, G, Am, F and repeat. You\'ve got it when: change on beat 1 every time — then climb the ladder 60 → 65 → 70 and hold 70 BPM clean (that\'s the assessment tempo).',
            hint: 'If you miss a change, keep going. You can slow to 50 BPM if needed. Gradually increase by 5 BPM each time through, aiming for a clean 70. Set the ⏱ Timer for 3 minutes and see how clean the loop gets before it beeps.',
            stuck: 'Loop just the two chords that trip you (often G→Am or Am→F) on their own before running the whole circle.',
            levelUp: 'Push toward 75 BPM, or strum down-up on each bar instead of straight downs.',
            skills: [1, 2, 3, 5]
          }
            ]
          },
          {
            title: 'Play a down-up strum pattern',
            steps: [
          {
            text: 'Challenge 3 — Down-Up Strum: play the loop strumming down on 1 2 3 4 and up on each "+", counting "1 + 2 + 3 + 4 +" aloud, building to 70 BPM. You\'ve got it when: a steady, relaxed pendulum at 70 BPM with lighter upstrokes and no stumbles.',
            hint: 'Start slower than you think you need to, then climb to 70. The upstroke should be lighter than the downstroke. Your wrist should move like a relaxed pendulum.',
            stuck: 'Keep your strumming hand moving down-up-down-up nonstop — just miss the strings on the beats you don\'t want. The motion never stops.',
            levelUp: 'Drop the first upstroke (D · D U · U D U) for a more song-like feel.',
            skills: [5, 6]
          }
            ]
          },
          {
            title: 'One-Minute Changes — beat your record',
            steps: [
              {
                text: 'Challenge 4 — One-Minute Changes (C ↔ G): set the ⏱ Timer for 60 seconds and switch C→G→C→G as many times as you can — only CLEAN changes count. You\'ve got it when: type your count below and aim to beat your Set 1 number.',
                hint: 'C and G share no easy anchor finger, so pre-shape the next chord in the air before you land it. Quality first — slow down until each one rings.',
                stuck: 'Break it down: park your hand over G, then practice just dropping into C and back. Speed comes after the path is clean.',
                levelUp: 'Run Am↔F instead — the boss-level pair for this group.',
                skills: [3, 6],
                response: { type: 'short', prompt: 'Personal record — clean C↔G changes in 60 seconds. Your count today?', placeholder: 'e.g. 18 — beat it next class' }
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Let It Be, verse (in-class assessment rehearsal): play C · G · Am · F with a down-strum, four beats per chord, building from 60 to 70 BPM. This C–G–Am–F verse is the song you play from memory for the in-class assessment. You\'ve got it when: one full verse loop at 70 BPM, every change landing on beat 1. <a href="tabs/let-it-be.html#layer-2" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 4</a>.',
                hint: 'Look ahead — start forming the next chord on beat 4 of the current one. Keep your fingers arched and your thumb behind the neck so every string rings. The strum keeps moving even while fingers travel.',
                stuck: 'Isolate the roughest pair (probably C → F) and loop just those two, four beats each.',
                levelUp: 'Add the chorus turnaround — Am · G · F · C — or drop to two beats per chord at the same 60 BPM.',
                skills: [3, 6],
                chords: [
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ],
                response: { type: 'short', prompt: 'Which chord change still fights you in Let It Be?', placeholder: 'e.g. C to F — fingers arrive late' }
              },
              {
                text: 'Challenge — Watchtower, open-chord version: the same loop you\'ve played as bass notes and power chords, now as full open chords — Am · G · F · G — two beats per chord at 60 BPM. You\'ve got it when: four loops, and you can hear that it\'s the SAME song you played in Units 2 and 3. <a href="tabs/all-along-the-watchtower.html#layer-5" target="_blank">&#x1F9F5; Song Journey: this is Layer 5 of 5</a>.',
                hint: 'This is the third time this song has met you — bass line, power chords, now open chords. Notice the roots are identical every time.',
                stuck: 'Strum only beat 1 of each chord and use beats 2–4 to travel to the next shape.',
                levelUp: 'One beat per chord, or alternate: one loop open chords, one loop power chords, without stopping.',
                skills: [3, 6],
                chords: [
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ],
                response: { type: 'short', prompt: 'Bass line, power chords, or open chords — which Watchtower is your favorite so far?', placeholder: 'e.g. open chords — it finally sounds full' }
              },
              {
                text: 'Challenge — "the cure" capo-1 play-along: put a capo on fret 1, then loop Olivia\'s chords with a down-strum — Am · C · Dm · F, four beats each, then G to turn it around — climbing the tempo ladder 60 → 65 → 70 BPM. Shapes are pre-loaded below. You\'ve got it when: two clean loops at 70 BPM, every change on beat 1, the capo ringing clear.',
                hint: 'The capo just moves everything up one fret — your shapes don\'t change. Dm is new: a small triangle on the top three strings. Keep your fingers arched and your thumb behind the neck.',
                stuck: 'Take the capo off and get Am · C · Dm · F clean in open position first, then add the capo and the G turnaround.',
                levelUp: 'Add the G/B bass turnaround (G shape, but catch the B on the A string), or switch to a down-up strum.',
                skills: [5, 6],
                chords: [
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'C',  chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'Dm', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,3,'3'],[1,1,'1']], position: 0 },
                  { name: 'F',  chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
                  { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
                ],
                response: { type: 'short', prompt: 'Your cleanest tempo on the "the cure" loop today (BPM)?', placeholder: 'e.g. 65 — 70 next class' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Of C, G, Am, and F, which transition cost you the most clean changes in the minute drill? Name the two chords — that\'s your first loop next class.',
                response: { type: 'short', placeholder: 'e.g. Am→F — the F never lands in time' }
              }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"Happy Birthday"', meta: 'Full strum arrangement — C–G–Am–F version (optional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Let It Be" — The Beatles', meta: 'Verse & chorus full chord strum · C–G–Am–F (I–V–vi–IV)', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html#layer-2',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=_Kw4subj5z8' },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Capo 1 play-along · Am–C–Dm–F–G/B', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html#layer-5',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Let Her Go" — Passenger', meta: 'G–D–Em–C — same family of chords', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=RBumgq5yVrA',
        tutorialUrl: 'https://www.youtube.com/watch?v=u8eloQtLxhY' },
      { name: '"No Woman No Cry" — Bob Marley', meta: 'C–G–Am–F — beautiful and rhythmic', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=IT8XvzIfi4U',
        tutorialUrl: 'https://www.youtube.com/watch?v=qK4NutAn3rg' },
      { name: '"With or Without You" — U2', meta: 'D–A–Bm–G — similar progression, different key', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=ujNeHIo7oTE',
        tutorialUrl: 'https://www.youtube.com/watch?v=XSOn0BQ4Rcc' },
      { name: '"Africa" — Toto', meta: 'Simplified C–G–Am–F version', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=FTQbiNvZqaY',
        tutorialUrl: 'https://www.youtube.com/watch?v=JFM7vN8AHLQ' },
      { name: '"Riptide" — Vance Joy', meta: 'Am–G–C — three-chord wonder', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=uJ_1HMAGb4k',
        tutorialUrl: 'https://www.youtube.com/watch?v=4pmK0x6mY0I' },
      { name: '"Someone Like You" — Adele', meta: 'A–E–F#m–D — same structure, different key', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=hLQl3WQQoQ0',
        tutorialUrl: 'https://www.youtube.com/watch?v=csNqCXc_Vng' }
    ],

    assessment: {
      goal: 'Frets C, F, Am, G with clean tone · Switches C to G in time at 70 BPM · Switches Am to F in time at 70 BPM · Uses common-finger pivot (Am–C) · Strums a down-up pattern in time · Plays a full verse of a C–G–Am–F song',
      performance: 'Class or partner: play a full verse of "Let It Be" with open chords and down-up strum. Teacher listens for clean transitions.',
      selfCheck: 'Can you switch from Am to C without lifting your index finger? Can you play the C–G–Am–F loop at 70 BPM without stopping?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm5w2-s1', text: 'Fret C major with clean tone on the B string',
        gotItWhen: 'you strum C and the B string (fret 1) rings clearly — your index finger doesn\'t mute the high E or buzz against the fret.',
        practice: { type: 'playSeq', label: 'Hear C major (arpeggiated)', bpm: 60,
          notes: [48, 52, 55, 60, 64] } },
      { id: 'm5w2-s2', text: 'Fret F major (simplified xx3211) with no buzzing',
        gotItWhen: 'all four notes in the simplified F ring cleanly when you strum strings 4–1 — and your index finger doesn\'t collapse on the barre.',
        practice: { type: 'mc', prompt: 'For the simplified F chord (xx3211), which strings should you actually strum?',
          choices: ['All 6 strings', 'Strings 1–4 only (the top 4)', 'Strings 5–1', 'Strings 6 and 5 only'], answer: 1 } },
      { id: 'm5w2-s3', text: 'Fret G major (3 or 4 finger version) cleanly',
        gotItWhen: 'every string rings in your G chord — including the open D and G in the middle, which beginners tend to accidentally mute.',
        practice: { type: 'playSeq', label: 'Hear G major (arpeggiated)', bpm: 60,
          notes: [43, 47, 50, 55, 59, 67] } },
      { id: 'm5w2-s4', text: 'Use the common-finger pivot between Am and C',
        gotItWhen: 'when you switch Am ↔ C your index finger stays planted on string 2 fret 1 — you don\'t lift it and put it back down.',
        practice: { type: 'mc', prompt: 'When pivoting between Am and C, which finger STAYS planted on string 2 fret 1?',
          choices: ['Index (1)', 'Middle (2)', 'Ring (3)', 'Pinky (4)'], answer: 0 } },
      { id: 'm5w2-s5', text: 'Play a down-up folk strum in time, building to 70 BPM',
        gotItWhen: 'your wrist swings like a pendulum — downstrokes on the numbers, upstrokes on the "and" — and you can hold it steady at 70 BPM without thinking about which way is next.',
        practice: { type: 'mc', prompt: 'In a down-up strum pattern, when do the UPSTROKES happen?',
          choices: ['On the numbers (1, 2, 3, 4)', 'On the "+" (and) between beats', 'Only on beat 4', 'Randomly'], answer: 1 } },
      { id: 'm5w2-s6', text: 'Switch between any two chords in Group 1 on beat 1 at 70 BPM',
        gotItWhen: 'the teacher names any two chords from C, G, Am, F and you can switch between them on beat 1 at 70 BPM without breaking the strum.',
        practice: { type: 'playSeq', label: 'C–G–Am–F progression (root notes)', bpm: 70,
          notes: [48, 43, 45, 53] } }
    ]
  },

  {
    id: 'm5w3',
    label: 'Set 3',
    locked: false,
    module: 'Open Chords',
    moduleNum: 5,
    unit: 'Module 5 · Open Chords',
    title: 'Set 3',
    subtitle: 'Chord Group 2: D, A, Em, Bm · Connecting chord groups',
    objective: 'I CAN fret D, A, Em, and Bm cleanly and connect Group 1 and Group 2 chords in a song.',
    skillFocus: 'Fretting the D, A, and Bm chords · Connecting chord groups in a song',
    handoutUrl: 'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/yh6sPqDEZCY" target="_blank">The D Chord – JustinGuitar</a> (0:00–5:00).',
            hint: 'D major has a triangular finger shape — notice how his three fingers are stacked in a triangle on strings 1, 2, and 3. Try to copy that exact shape.',
            skills: [1, 2, 3, 4],
            response: { type: 'mc', prompt: 'The D major chord uses which finger shape on strings 1, 2, and 3?',
              answer: 0,
              explain: 'The three fretting fingers form a little triangle on the top three strings — that\'s the visual cue for D major.',
              choices: [
              'A triangle shape',
              'A straight line across one fret',
              'A square shape',
              'All open strings'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/IxXG5S8vSd8" target="_blank">Fail-Proof Easy Barre Chords (start here for Bm) – JustinGuitar</a> (0:00–3:00).',
            hint: 'Bm is the trickiest chord in this group. The partial barre version (xx4432) is the most accessible. Don\'t try the full barre version yet — focus on getting a clean sound first.',
            skills: [4],
            chords: [
              { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 2 }
            ],
            response: { type: 'short', placeholder: 'Which Bm version are you starting with (partial barre or full)? What\'s the hardest part for you?' }
          },
            ]
          },
          {
            title: 'Listen for the chord changes',
            steps: [
          {
            text: 'Listen to "Oye Mi Amor" by Maná — the chorus rides on D, A, Bm, and G. Can you hear when each chord arrives? Tap along and try to feel the chord changes.',
            hint: 'D, A, and Bm are the Group 2 chords you\'re learning right now, and G you already know. Your ear already knows the sound — you\'re just learning to play them.',
            skills: [5],
            response: { type: 'short', placeholder: 'Describe one moment where you clearly heard a chord change.' }
          },
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — take a beat to reflect: you now know two whole chord groups. Which Group 2 chord (D, A, Em, Bm) feels furthest from automatic, and what specifically trips it up?',
            response: { type: 'short', placeholder: 'e.g. D — string 1 keeps getting muted by my ring finger' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — Group 2 chords & cross-group connections',
        sections: [
          {
            title: 'Fret D major cleanly',
            steps: [
          {
            text: 'Challenge 1 — Clean D: fret D major (triangle: str 1/fret 2, str 2/fret 3, str 3/fret 2) and strum strings 1–4 only. You\'ve got it when: all four ring — especially string 1 (high E), which loves to get muted.',
            hint: 'The D chord is tricky because string 1 is easy to accidentally mute. Curve your fingers and make sure your fingertips arch away from that string.',
            stuck: 'Get strings 1 and 2 ringing first, then add string 3. Arch the ring finger up high so it clears the high E.',
            levelUp: 'Switch D→A→D without looking — both shapes live around the 2nd fret.',
            skills: [1],
            chords: [
              { name: 'D', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Connect Group 1 & Group 2 chords',
            steps: [
          {
            text: 'Challenge 2 — Cross-Group Changes: at 60 BPM, switch G→D, Am→Em, and C→A, 2 bars each. You\'ve got it when: each change lands on beat 1, using fingers that stay close as you switch.',
            hint: 'Look for fingers that stay close or in the same area as you switch. Planning your hand movement before you lift your fingers saves time. Set the ⏱ Timer for 3 minutes and run the pairs until it beeps.',
            stuck: 'Take one pair at a time. For G→D, notice all your fingers shift toward the high strings together — move them as one unit, not finger by finger.',
            levelUp: 'Run all three pairs back-to-back without stopping, or push to 70 BPM.',
            skills: [2, 3, 5, 6],
            chords: [
              { name: 'A',  chord: [[6,'x'],[5,0],[4,2,'1'],[3,2,'2'],[2,2,'3'],[1,0]], position: 0 },
              { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'One-Minute Changes — beat your record',
            steps: [
              {
                text: 'Challenge 3 — One-Minute Changes (G ↔ D): set the ⏱ Timer for 60 seconds and switch G→D→G→D as many times as you can — only CLEAN changes count. This is a cross-group jump, so it\'s a real test. You\'ve got it when: type your count below and aim to beat your Set 2 number.',
                hint: 'G and D both sit up near the high strings — let your whole hand travel as one shape rather than placing finger by finger.',
                stuck: 'Park your hand over G, then practice just dropping into D and back. Slow until each one rings, then let speed come.',
                levelUp: 'Run Em↔A instead, or add a down-up strum on each chord.',
                skills: [5, 6],
                response: { type: 'short', prompt: 'Personal record — clean G↔D changes in 60 seconds. Your count today?', placeholder: 'e.g. 20 — beat it next class' }
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Oye Mi Amor, chorus: the chorus is D · A · Bm · G — every chord is one you\'ve drilled this set (D, A, Bm from Group 2) plus G from Group 1. Play the loop, four beats per chord at 60 BPM with a down-strum. You\'ve got it when: two loops with every change landing on beat 1, the partial-barre Bm ringing clean. <a href="tabs/oye-mi-amor.html#layer-3" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                hint: 'D, A, and Bm are your brand-new Group 2 chords — this is where they pay off. Bm is the partial-barre shape from the video (xx4432); keep that index barre light and your thumb behind the neck.',
                stuck: 'Loop just D → A until it\'s smooth, then Bm → G, then join the halves. Bm is the hard one — pre-shape it in the air before you land it.',
                levelUp: 'Drop to two beats per chord at the same 60 BPM, or hum the chorus hook over your strumming.',
                skills: [5, 6],
                chords: [
                  { name: 'D',  chord: [[6,'x'],[5,'x'],[4,0],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 },
                  { name: 'A',  chord: [[6,'x'],[5,0],[4,2,'1'],[3,2,'2'],[2,2,'3'],[1,0]], position: 0 },
                  { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 2 },
                  { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
                ],
                response: { type: 'short', prompt: 'Which change was toughest — into Bm, or out of it?', placeholder: 'e.g. into Bm — the barre lags' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Crossing between Group 1 and Group 2, which single change still feels like reaching across the neck? Name it — that\'s your warm-up next class.',
                response: { type: 'short', placeholder: 'e.g. C→A still feels like a big jump' }
              }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am–G–F–G · open-chord version', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html#layer-5',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Seven Nation Army" — The White Stripes', meta: '◐ optional stretch · D–A–Em strummed adaptation', type: 'Supp', core: false, journeyUrl: 'tabs/seven-nation-army.html#layer-5',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Chorus loop D–A–Bm–G · strummed', type: 'Core', core: true, journeyUrl: 'tabs/oye-mi-amor.html#layer-3',
        originalUrl: 'https://www.youtube.com/watch?v=UlkG3DmZJEI',
        tutorialUrl: 'https://www.youtube.com/watch?v=F4BbTdP2v70' },
      { name: '"Stand By Me" — Ben E. King', meta: 'G–Em–C–D · great Group 1↔2 cross-group song', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=hwZNL7QVJjE',
        tutorialUrl: 'https://www.youtube.com/watch?v=TXLElO_YYiY' },
      { name: '"Country Roads" — John Denver', meta: 'G–Em–C–D — perfect cross-group song', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=1vrEljMfXYo',
        tutorialUrl: 'https://www.youtube.com/watch?v=TRP3eHbIZnw' },
      { name: '"Hey Jude" — The Beatles', meta: 'Simplified F–C–Bb (adapted to G–D–Em)', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=A_MjCqQoLLA',
        tutorialUrl: 'https://www.youtube.com/watch?v=VyleoeWxbIQ' },
      { name: '"Sweet Home Alabama" — Lynyrd Skynyrd', meta: 'D–C–G — classic rock chords', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=-35W_FWCT9Q',
        tutorialUrl: 'https://www.youtube.com/watch?v=GafriAIHtZ4' },
      { name: '"Tenerife Sea" — Ed Sheeran', meta: 'D–A–Bm–G — smooth chord flow', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=oJaTEvynJ8M',
        tutorialUrl: 'https://www.youtube.com/watch?v=-AGGbJcUKSk' },
      { name: '"More Than Words" — Extreme', meta: 'G–D–Em–Am–C–D — full chord workout', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=UrIiLvg58SY',
        tutorialUrl: 'https://www.youtube.com/watch?v=REkxm9eRdwA' },
      { name: '"Shallow" — Lady Gaga', meta: 'Em–D–G–C–Am–D — challenge song', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=bo_efYhYU2A',
        tutorialUrl: 'https://www.youtube.com/watch?v=wocQ8UHN5kQ' }
    ],

    assessment: {
      goal: 'Frets D, A, Em, Bm with clean tone · Switches D to A in time · Switches Em to Bm in time · Connects Group 1 and Group 2 chords · Plays a song using Group 2 chords · Identifies chord group from a chord chart',
      performance: 'Individual: play 8 bars using chords from both groups — teacher names three chords and the student plays them in sequence at 70 BPM.',
      selfCheck: 'Can you look at a chord chart and know immediately which "group" each chord belongs to? Can you switch D–A and Em–Bm at 70 BPM?',
      standards: ['Pr.4a', 'Pr.5a', 'Cn.11b']
    },

    skills: [
      { id: 'm5w3-s1', text: 'Fret D major cleanly — triangular shape, strings 1–4',
        gotItWhen: 'all four strings in D ring clearly — especially the high E (string 1), which is the one beginners most often mute accidentally.',
        practice: { type: 'mc', prompt: 'When you strum the D major open chord, which strings should you play?',
          choices: ['All 6 strings', 'Strings 4–1 (the top 4)', 'Strings 6–3', 'Just strings 1 and 2'], answer: 1 } },
      { id: 'm5w3-s2', text: 'Fret A major cleanly — 3 fingers on 2nd fret',
        gotItWhen: 'your three fingers all fit on the 2nd fret without colliding, and strings 1–5 ring cleanly when you strum.',
        practice: { type: 'mc', prompt: 'In the open A major chord, all three fretting fingers go on which fret?',
          choices: ['1st fret', '2nd fret', '3rd fret', 'Different frets each'], answer: 1 } },
      { id: 'm5w3-s3', text: 'Fret Bm with partial barre shape (xx4432)',
        gotItWhen: 'you can play the partial-barre Bm and all four notes ring — no buzz from the index finger barre across strings 1 and 2.',
        practice: { type: 'mc', prompt: 'The Bm chord is written "xx4432". What do the two "x"s at the start mean?',
          choices: ['Strum extra hard', 'Mute strings 6 and 5 — don\'t play them', 'Use 2 fingers on string 1', 'Cross your fingers'], answer: 1 } },
      { id: 'm5w3-s4', text: 'Switch D to A in time at 70 BPM',
        gotItWhen: 'you can switch D ↔ A on beat 1 at 70 BPM without breaking your strum or pausing to position fingers.',
        practice: { type: 'playSeq', label: 'D ↔ A switch (roots, 4 bars)', bpm: 70,
          notes: [50, 45, 50, 45] } },
      { id: 'm5w3-s5', text: 'Connect Group 1 and Group 2 chords in a song (e.g., G to D, Am to Em)',
        gotItWhen: 'you can play through a real song that mixes Group 1 and Group 2 chords without slowing down at the cross-group changes.',
        practice: { type: 'playSeq', label: 'Cross-group progression (G · Em · C · D roots)', bpm: 70,
          notes: [43, 40, 48, 50] } },
      { id: 'm5w3-s6', text: 'Play the "Oye Mi Amor" chorus (D–A–Bm–G) using Group 2 chords with a strum pattern',
        gotItWhen: 'you can loop the "Oye Mi Amor" chorus (D · A · Bm · G) with a steady down-strum at 60 BPM, every change landing on beat 1 and the partial-barre Bm ringing clean.' }
    ]
  },

  {
    id: 'm5w4',
    label: 'Set 4',
    locked: false,
    module: 'Open Chords',
    moduleNum: 5,
    unit: 'Module 5 · Open Chords',
    title: 'Set 4',
    subtitle: 'Chord Group 3: E, B7, F#m, C#m · Semester showcase preparation',
    objective: 'I CAN fret E and B7 open chords, identify F#m and C#m shapes, and perform a chosen song with 4+ chord types.',
    skillFocus: 'Fretting the E and B7 chords · Recognizing the F#m and C#m shapes · Performing a song with several chords',
    handoutUrl: 'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/8H393ryDkuY" target="_blank">The E Chord (BC-113) – JustinGuitar</a> (0:00–4:00).',
            hint: 'E major uses all four fingers — it\'s a full chord. B7 is also four fingers but in a different arrangement. Take them one at a time. The B7 chord has a distinctive jazz/blues sound.',
            skills: [1, 2],
            chords: [
              { name: 'F#m', chord: [[6,'x'],[5,'x'],[4,4,'3'],[3,2,'1'],[2,2,'1'],[1,2,'1']], position: 2 },
              { name: 'C#m', chord: [[6,'x'],[5,'x'],[4,6,'4'],[3,6,'3'],[2,5,'2'],[1,4,'1']], position: 4 }
            ],
            response: { type: 'short', placeholder: 'Describe the sound of the B7 chord. What musical mood does it suggest?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/uBZsLmmOz9I" target="_blank">How to Practice Effectively – JustinGuitar</a> (0:00–4:00).',
            hint: 'Key idea: practice doesn\'t make perfect — practice makes permanent. Are you practicing your mistakes or your solutions? This matters most before a performance.',
            skills: [5],
            response: { type: 'mc', prompt: 'What is the KEY idea from this video about practice?',
              answer: 0,
              explain: 'Practice makes PERMANENT — repeating a mistake just locks it in. Slow down and repeat the correct version so that\'s what becomes automatic.',
              choices: [
              'Practice makes permanent — so practice the solution, not the mistake',
              'Practice makes perfect — repetition is all that matters',
              'You only need to practice the day before a performance',
              'Speed matters more than accuracy'
            ] }
          },
            ]
          },
          {
            title: 'Plan your showcase practice',
            steps: [
          {
            text: 'Look up a chord chart for your showcase song (or one you\'ve been working on). Map out which chord groups you\'ll use. Are there any chords you need to review?',
            hint: 'Being intentional about your practice is a skill. Know exactly which transitions are rough and spend most of your time there — not on the parts you already know.',
            skills: [5, 6],
            response: { type: 'short', placeholder: 'Which song are you working on? Which chord transition feels the roughest right now?' }
          },
          {
            text: 'Re-read what you wrote back in Module 1 — your "My Guitar Adventure" goal. You set it before you could play a single chord. What has changed? Name one thing you can do now that felt impossible then, and the one thing you still want by the showcase.',
            hint: 'This is the same goal you\'ll reflect on in your semester self-check. Be specific — "I can switch C to G without stopping" beats "I got better."',
            skills: [5],
            response: { type: 'short', placeholder: 'One thing you can do now that you couldn\'t in Module 1 — and one goal for the showcase.' }
          },
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — take a beat to reflect: with the showcase ahead, what will eat most of your practice time between now and then — a specific chord, a transition, or keeping the strum steady?',
            response: { type: 'short', placeholder: 'e.g. the B7→E change, and not rushing the strum' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — Group 3 chords & showcase prep',
        sections: [
          {
            title: 'Fret E major cleanly',
            steps: [
          {
            text: 'Challenge 1 — Clean E: fret E major (index str 3/fret 1, middle str 5/fret 2, ring str 4/fret 2) and strum all 6 strings. You\'ve got it when: a full, rich chord with every string ringing — watch your index on string 2.',
            hint: 'E major is one of the most satisfying open chords to play. If any string buzzes, check your index finger — it tends to accidentally mute string 2.',
            stuck: 'E is the Em shape plus one finger — play a clean Em first, then add the index on string 3, fret 1.',
            levelUp: 'Switch E→Am→E (similar finger feel), or loop E→B7→E.',
            skills: [1, 3],
            chords: [
              { name: 'E', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,1,'1'],[2,0],[1,0]], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'Fret B7 cleanly',
            steps: [
          {
            text: 'Challenge 2 — Four-Finger B7: fret B7 (index str 4/fret 1, middle str 5/fret 2, ring str 3/fret 2, pinky str 1/fret 2) and strum strings 1–5. You\'ve got it when: all four fingers down and every played string clean — then play E→B7→E and hear it pull home.',
            hint: 'B7 is a dominant 7th chord — it has a slightly tense sound that wants to resolve to E. Play E then B7 then E again and hear how it pulls back.',
            stuck: 'Place the fingers one at a time in order — index, middle, ring, then pinky — and check that the open string 2 still rings between them.',
            levelUp: 'Loop E→B7→E in time at 60 BPM and feel the pull-home resolve on every cycle.',
            skills: [2, 3],
            chords: [
              { name: 'B7', chord: [[6,'x'],[5,2,'2'],[4,1,'1'],[3,2,'3'],[2,0],[1,2,'4']], position: 0 }
            ]
          }
            ]
          },
          {
            title: 'One-Minute Changes — beat your record',
            steps: [
              {
                text: 'Challenge 3 — One-Minute Changes (E ↔ B7): set the ⏱ Timer for 60 seconds and switch E→B7→E→B7 as many times as you can — only CLEAN changes count (all four B7 fingers down, strings 1–5 ringing). You\'ve got it when: type your count below and aim to beat your Set 3 number.',
                hint: 'These two share no fingers, so this is the hardest pair yet. Pre-shape B7 in the air before you land it, and keep string 2 open.',
                stuck: 'Drill just dropping into B7 from E and back, slowly, until all four fingers land together. Speed comes after the landing is clean.',
                levelUp: 'Add a strum on each chord before switching, or run E→Am→B7.',
                skills: [2, 3],
                response: { type: 'short', prompt: 'Personal record — clean E↔B7 changes in 60 seconds. Your count today?', placeholder: 'e.g. 14 — beat it next class' }
              }
            ]
          },
          {
            title: 'Perform your showcase song',
            steps: [
          {
            text: 'Challenge 4 — Showcase Run (your assessment piece): play your semester showcase song — the one you\'ll perform for the class — start to finish 3 times without stopping, even through mistakes, and time yourself. No score — this trains your recovery, not perfection.',
            hint: 'Don\'t stop when you make a mistake in performance practice. The goal is to keep going. You can fix mistakes in slow practice — performance practice trains your recovery.',
            skills: [5, 6]
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Oye Mi Amor, strummed (showcase version): play the chorus as open chords — D · A · Bm · G — four beats per chord at 60 BPM with a straight down-strum, building toward 70, singing or humming the hook if you dare. You\'ve got it when: four loops with every change on beat 1 and the partial-barre Bm ringing clean. <a href="tabs/oye-mi-amor.html#layer-3" target="_blank">&#x1F9F5; Song Journey: this is Layer 3 of 5</a>.',
                hint: 'You met this loop in Set 3 — now make it showcase-clean. Bm is the partial barre; keep your fingers arched and your thumb behind the neck so the whole chord rings.',
                stuck: 'Bm is the tough one — loop A → Bm on its own until the barre lands, then run the full D–A–Bm–G.',
                levelUp: 'Try the down-down-up split strum on each chord, run it at two beats per chord, or push to 70 BPM.',
                skills: [5, 6],
                chords: [
                  { name: 'D',  chord: [[6,'x'],[5,'x'],[4,0],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 },
                  { name: 'A',  chord: [[6,'x'],[5,0],[4,2,'1'],[3,2,'2'],[2,2,'3'],[1,0]], position: 0 },
                  { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 2 },
                  { name: 'G',  chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 }
                ],
                response: { type: 'short', prompt: 'Which core song do you most want to play start-to-finish at the showcase?', placeholder: 'e.g. Oye Mi Amor, all of it' }
              }
            ]
          },
          {
            title: 'Call & Response over a backing track',
            steps: [
              {
                text: 'Challenge — Call & Response (your semester-wrap check piece): open Module 4 and pick any core-song backing track (the ▶ &#x1F3B5; Backing track button on the song cards) and improvise a call-and-response solo — play a 2-bar "question" phrase, leave a little space, then answer it with a 2-bar "response." Stay in the minor pentatonic box from Module 4. You\'ve got it when: you hold the track\'s pulse start to finish with no restarts, and your response phrase clearly answers your question phrase. This is scored the same way as your Module 4 solo (Accuracy + Consistency).',
                hint: 'Every skill here is a Module 4 skill — this is a victory lap. Open Module 4 and hit any ▶ &#x1F3B5; Backing track button on a core-song card. If the pentatonic box feels rusty, run the Module 4 scale-climb warm-up first, then come back.',
                stuck: 'Play a 2-bar question, then answer with the SAME rhythm on different notes — copying the rhythm is the easiest way to make two phrases talk to each other.',
                levelUp: 'Trade phrases with a partner over the same track — you play the call, they play the response, then swap roles.'
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'After today, what\'s the one part of your showcase song most likely to fall apart in front of the class? Write it down — that\'s exactly where your next practice starts.',
                response: { type: 'short', placeholder: 'e.g. the B7 in the chorus — it never lands in time' }
              }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"Happy Birthday"', meta: 'Full chord arrangement — all groups reviewed (optional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Full-song showcase · D–A–Bm–G', type: 'Core', core: true, journeyUrl: 'tabs/oye-mi-amor.html',
        originalUrl: 'https://www.youtube.com/watch?v=UlkG3DmZJEI',
        tutorialUrl: 'https://www.youtube.com/watch?v=F4BbTdP2v70' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Optional showcase · D–C–G power chords (from Module 3)', type: 'Supp', core: false, journeyUrl: 'tabs/sweet-child-o-mine.html#layer-5',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full performance with open chords', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html#layer-5',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Hallelujah" — Leonard Cohen', meta: 'C–Am–F–G — beautiful showcase song', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=ttEMYvpoR-k',
        tutorialUrl: 'https://www.youtube.com/watch?v=eFLJUspLfnk' },
      { name: '"Creep" — Radiohead', meta: 'G–B–C–Cm — emotional and memorable', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=XFkzRNyygfk',
        tutorialUrl: 'https://www.youtube.com/watch?v=ZD2iYBg6faQ' },
      { name: '"The Sound of Silence" — Simon & Garfunkel', meta: 'Am–G–C — quiet and expressive', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=l0q7MLPo-u8',
        tutorialUrl: 'https://www.youtube.com/watch?v=HItFqkAznHw' },
      { name: '"Iris" — Goo Goo Dolls', meta: 'Bm–D–G — powerful chorus chords', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=NdYWuo9OFAw',
        tutorialUrl: 'https://www.youtube.com/watch?v=XWsBCiF3MTE' },
      { name: '"Blackbird" — The Beatles', meta: 'Fingerpicking challenge — advanced option', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=Man4Xw8Xypo',
        tutorialUrl: 'https://www.youtube.com/watch?v=Qqw15309knU' },
      { name: 'Student original using course skills', meta: 'Your own composition — any chords from the semester', type: 'Choice', core: false }
    ],

    assessment: {
      goal: 'Semester Showcase: Perform one complete song of your choice using at least 4 chords from the semester. Evaluated on chord accuracy, timing, smooth transitions, and musicality. (Separate and ungraded: your written "My Guitar Adventure — Semester 1 Check-in" reflection — just for you, not part of the showcase score.)',
      performance: 'Semester showcase performance. Student performs chosen song for class. Teacher evaluates chord accuracy, timing, transitions, and expression.',
      selfCheck: 'Can you play your showcase song all the way through without stopping? Can you name every chord in your song and which group it belongs to?',
      standards: ['Pr.4a', 'Pr.5b', 'Pr.6a', 'Re.9a']
    },

    skills: [
      { id: 'm5w4-s1', text: 'Fret E major open chord cleanly — all 6 strings ring',
        gotItWhen: 'you strum all 6 strings and the chord rings full and rich — string 2 (the one your index finger sits next to) doesn\'t buzz or mute.',
        practice: { type: 'playSeq', label: 'Hear E major (arpeggiated)', bpm: 60,
          notes: [40, 47, 52, 56, 59, 64] } },
      { id: 'm5w4-s2', text: 'Fret B7 open chord cleanly — 4 fingers, strings 1–5',
        gotItWhen: 'all four fingers land at once and strings 1–5 ring clearly — the low E stays silent (no extra ring underneath).',
        practice: { type: 'mc', prompt: 'B7 is called a "dominant 7th" chord. What does the "7" tell you it adds to the chord?',
          choices: ['Seven fingers', 'A 7th interval — gives it a slightly tense, jazzy/bluesy sound', 'Play on the 7th fret', 'Strum it seven times'], answer: 1 } },
      { id: 'm5w4-s3', text: 'Identify F#m and C#m shapes on a chord diagram',
        gotItWhen: 'you can see an F#m or C#m diagram and explain which version (partial barre or full barre) and which finger goes where, even if you can\'t play it cleanly yet.',
        practice: { type: 'mc', prompt: 'F#m and C#m use a "barre" shape. What is a barre?',
          choices: ['One finger pressing across multiple strings at the same fret', 'A type of pick', 'A string-bending technique', 'Strumming with the thumb'], answer: 0 } },
      { id: 'm5w4-s4', text: 'Demonstrate 3+ chord types from across the semester',
        gotItWhen: 'you can play at least one chord from each of Groups 1, 2, and 3 cleanly on demand — and name the group each belongs to.',
        practice: { type: 'mc', prompt: 'Which of these chords is from Group 2 (D, A, Em, Bm)?',
          choices: ['C major', 'G major', 'D major', 'F major'], answer: 2 } },
      { id: 'm5w4-s5', text: 'Perform a chosen song all the way through without stopping',
        gotItWhen: 'you can play your showcase song start to finish — fingers arched, thumb behind the neck, the shapes held through the whole song — and even with mistakes you keep going and stay in time.' },
      { id: 'm5w4-s6', text: 'Maintain a steady strum pattern throughout a full song',
        gotItWhen: 'your strum pattern stays consistent across the whole song — it doesn\'t fall apart during the hard chord changes.' }
    ]
  }

); // end module-5.js

MODULE_REVIEWS[5] = {
  moduleNum: 5,
  module: 'Open Chords',
  skills: [
    { id: 'mr5-s1', text: 'I can read any chord diagram and place my fingers on the right strings, frets, and finger numbers without asking', set: 'm5w1' },
    { id: 'mr5-s2', text: 'I can fret Am and Em cleanly — every string in each rings with no buzz', set: 'm5w1' },
    { id: 'mr5-s3', text: 'I can fret Group 1 chords (C, G, Am, and the simplified F) with clean tone', set: 'm5w2' },
    { id: 'mr5-s6', text: 'I can keep a steady 4-beat down-strum, and a down-up (1 + 2 + 3 + 4 +) pattern, through a chord change', set: 'm5w2' },
    { id: 'mr5-s4', text: 'I can fret Group 2 chords (D, A, Em, and a partial-barre Bm) with clean tone', set: 'm5w3' },
    { id: 'mr5-s8', text: 'I can perform a chosen song start to finish using 4+ chords from across the semester for the showcase', set: 'm5w4' }
  ],
  assessItems: [
    'Perform one complete song using at least 4 chords from the semester, with clean tone and smooth transitions',
    'Ungraded reflection (not scored): your written "My Guitar Adventure — Semester 1 Check-in" — what changed since the Module 1 goal'
  ],
  forward: 'Every chord you can now fret is a word — <strong>Module 6 is where you learn to speak in rhythm.</strong> The down-up pattern you started here grows into full strumming patterns, accents, and syncopation that turn these shapes into real songs.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a', 'Re.7a', 'Re.9a', 'Cn.11b']
};
