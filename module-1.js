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
    subtitle: 'My Guitar Adventure · Goal-setting · Your music',
    objective: 'I CAN describe why I want to play guitar and explain what a song that means something to me is doing musically.',
    skillFocus: 'Setting your guitar goals · Listening closely to music you love',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Reflect',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Sound setup (every lesson-video day): grab headphones if people are around you, or set a comfortable speaker volume if you\'re on your own. You\'ll bounce between videos and playing all course long, so make it easy to hear both.',
            hint: 'Loud enough that you catch every detail, quiet enough that you can still hear your own guitar.'
          },
          {
            text: 'Watch: <a href="https://youtu.be/uBZsLmmOz9I" target="_blank">How to Practice Guitar – JustinGuitar</a> (Lesson 1 Practice Routine). While you watch, write down the ONE practice habit he says matters most — you\'ll try it out this week.',
            hint: 'As you watch, think about: what is one practice habit he says makes the biggest difference? Does it match what you thought? You\'ve got it when: you can name that one habit without looking back at your notes.',
            skills: [1],
            response: { type: 'short', placeholder: 'In one sentence: what practice habit did he say matters most, and did it match what you thought?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/PyWZYHy17As" target="_blank">Caring for Your Acoustic Guitar – Marty Music</a> (you only need the first ~3 minutes — cleaning, humidity, and basic care; after that it\'s a string-changing demo you won\'t need yet). While you watch, note two things that can damage a guitar and how to avoid each — good habits now keep your guitar playable for years.',
            hint: 'Notice how he handles and stores the guitar. You\'ll practice the safe set-down at the practice station next. You\'ve got it when: you can name two ways to keep a guitar safe.',
            response: { type: 'mc', prompt: 'Which of these does the video call out as a real danger to an acoustic guitar?',
              answer: 0,
              explain: 'Wood shrinks and can crack when the air gets too dry — that\'s why guitars are stored in cases and kept away from heaters. Wiping the strings after playing keeps sweat from corroding them. Lots of practice, picks, and standing up are all totally safe.',
              choices: [
              'Dry air — low humidity can crack the wood',
              'Playing it too many hours a day',
              'Strumming with a pick instead of fingers',
              'Practicing while standing up'
            ] }
          }
            ]
          },
          {
            title: 'Listening — find the guitar',
            steps: [
          {
            text: 'Find a YouTube clip of your song — the one that means something to you (any song you love with guitar in it works). As you listen, follow the guitar only — tune out the singing and drums for 30 seconds and track what the guitar is doing. You\'ve got it when: you can describe the guitar\'s job in the song in one sentence.',
            hint: 'Is it strumming chords? Playing a melody? Both? Just listen — you don\'t need to know the names yet.',
            levelUp: 'Listen a second time and try to tap along with just the guitar\'s rhythm, ignoring everything else.',
            response: { type: 'mc', prompt: 'In the clip you watched, what was the guitar doing?', choices: [
              'Strumming chords',
              'Playing a melody (single notes)',
              'Both strumming and single notes',
              'Mostly rhythm or percussive sounds'
            ] }
          }
            ]
          },
          {
            title: 'Ear training — acoustic vs. electric',
            steps: [
          {
            text: 'Ear training — acoustic vs. electric. Two short clips play the SAME song, "All Along the Watchtower": <a href="https://www.youtube.com/watch?v=bT7Hj-ea0VE" target="_blank" data-ext="1">Clip 1 — Bob Dylan</a> and <a href="https://www.youtube.com/watch?v=TLV4_xaYynY" target="_blank" data-ext="1">Clip 2 — Jimi Hendrix</a>. As you listen, decide which clip sounds warm and woody and which sounds bright and fuzzy — that\'s the acoustic-vs-electric difference. This song grows with you through the whole course — <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 1 of 5</a>.',
            hint: 'Acoustic guitars sound warm and woody. Electric guitars sound brighter and can be distorted or "fuzzy." Same song, very different sound. You\'ve got it when: you can point to the electric clip and say one word for why it sounds different.',
            levelUp: 'Find another song you like that has both an acoustic and an electric version, and name which recording is which.',
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
            text: 'Safe handling (every session): when you\'re not playing, rest the guitar flat on its back across your lap, or lay it in the case or stand. Never lean it against a chair or wall — it can slip and fall. Carry it with one hand on the neck and one on the body. You\'ve got it when: you can set the guitar down and pick it up without it wobbling or tipping.',
            hint: 'A guitar that falls can crack its neck. A little care keeps your guitar playable for years.',
            stuck: 'Practice just the set-down first: two hands, lower it slowly onto its back, let go. Then just the pick-up. Watch the guitar as you release it — if it wobbles, slow the set-down way down.',
            levelUp: 'Set it down and pick it up three times in a row, smooth and quiet each time — no clunks against the chair.'
          },
          {
            text: 'Pick up the guitar. Hold it in a comfortable position. Strum all 6 strings slowly with your thumb — just listen to the sound. You\'ve got it when: the guitar sits steady on your leg and all 6 strings ring when you strum.',
            hint: 'Don\'t worry about pressing any frets yet. Just get used to holding it.',
            stuck: 'If a string sounds dead, your hand or sleeve might be resting on it. Lift your fretting hand right off and strum with only your thumb — all six should ring.',
            levelUp: 'Strum slowly from the low E to the high e and back, keeping every string ringing evenly — no string louder or quieter than the others.'
          },
          {
            text: 'Try playing with your foot up on a stool, then flat on the ground. Keep whichever one lets you sit up straight without gripping the neck to hold the guitar up. You\'ve got it when: you can let go with your fretting hand and the guitar stays put on your leg.<span class="step-figure"><img src="img/posture-check.svg" alt="Diagram of two good sitting positions — foot on a stool and feet flat on the floor, both with a straight back and the guitar resting on the leg — plus the test: take your fretting hand off the neck and the guitar stays put."></span>',
            hint: 'The guitar should balance on your leg, not hang from your hand. Your fretting hand needs to be free to move.',
            stuck: 'Rest the narrow waist of the guitar in the dip of your leg so it settles in. If it slides, scoot it toward your body until it stops.',
            levelUp: 'Hold the position with both hands off the neck for 10 seconds while you sit up tall.'
          },
          {
            text: 'Try tapping the body, plucking one string at a time, and strumming. What differences do you notice? You\'ve got it when: you can make at least three different sounds and say how they differ.',
            hint: 'Curiosity is your best tool right now.',
            stuck: 'Start with just two sounds: tap the body once, then pluck one string. Say out loud how they\'re different before you add a third.',
            levelUp: 'Find a fourth sound nobody near you has tried yet — tap near the bridge, mute a string, slide a finger up a string — and describe it.'
          }
            ]
          },
          {
            title: 'Describe why I want to learn guitar',
            steps: [
          {
            text: 'Type your guitar goal in the box below — we\'ll revisit it at the end of the course. You\'ve got it when: you wrote a goal you can explain in one sentence.',
            hint: 'It can be a song you want to play, a skill you want to build, or just a feeling.',
            response: { type: 'short', placeholder: 'My guitar goal (one sentence): I want to…' }
          }
            ]
          },
          {
            title: 'My Practice Routine — weekly check-in (never graded)',
            steps: [
          {
            text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to write your routine: (1) one thing you want to get better at, (2) when and where you\'ll practice this week, (3) how last week went (skip that part this first time). We\'ll revisit it every module to see how your plan is working.',
            hint: 'No wrong answers — even five minutes a day beats one long cram. You\'re building a habit you\'ll actually keep.',
            response: { type: 'short', placeholder: '1) One thing to improve   2) When & where I\'ll practice   3) How last week went' }
          }
            ]
          }
        ]
      }
    },

    songs: [
      { name: 'Student choice — any song that means something to them', meta: 'Listening & sharing day · No playing required', type: 'Choice', core: false },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Listen — find the guitar in a current song (capo 1 · Am–C–Dm–F–G/B)', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Listen and identify guitar sounds', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Listen — the low-E riff you\'ll build all course long', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Listen — a riff-driven song we return to later', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'Listen — our Latin core song, back all course long', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Happy Birthday"', meta: 'First real song — open-string melody', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' }
    ],

    assessment: {
      goal: 'Can describe why they want to learn guitar · Can name one song that matters to them · Can describe what the guitar is doing in a song they love',
      performance: 'Type your guitar goal and your song reflection into the response boxes, then say your "why guitar?" answer out loud in one or two sentences — if you can say it without hesitating, it\'s yours.',
      selfCheck: 'Can you name one reason you want to play? Can you name one song you\'d love to play by the end of the year?',
      standards: ['Pr.1a', 'Cn.11a']
    },

    skills: [
      { id: 'w1-s1', text: 'I can describe why I want to learn guitar',
        gotItWhen: 'you can answer "why guitar?" in one or two sentences without hesitating — and the answer is yours, not someone else\'s.' },
      { id: 'w1-s2', text: 'I can name one song that matters to me',
        gotItWhen: 'you can name the song instantly and say one thing about why it matters to you — no thinking required.' },
      { id: 'w1-s3', text: 'I can describe what the guitar is doing in a song I love',
        gotItWhen: 'you can name the song and describe the guitar\'s job in it in one sentence — strumming chords, playing a melody, or both.' }
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
    objective: 'I CAN name 5+ parts of the guitar, tune all 6 strings, and play a short open-string melody with clean, even notes.',
    skillFocus: 'Guitar parts, posture, and holding a pick · Naming and tuning the strings · Playing an open-string melody',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/X2EmpWr9vUc?t=105" target="_blank">How to Tune Your Guitar For Beginners – JustinGuitar</a> (the link jumps to 1:45, where he shows how to use the tuner — the part before is about which tuner to buy, and this site has a built-in tuner in the corner toolbar; you can stop around 4:28). Have your tuner ready and follow along on your own guitar — match one string at a time as he goes.',
            hint: 'Headphones on. Notice the order of the strings and what "in tune" sounds like. You\'ve got it when: you can tell whether a note is too high or too low before the tuner shows you.',
            stuck: 'Pause after each string and tune just that one before moving on. If the tuner jumps around, pluck a little softer and let the note ring.',
            levelUp: 'Detune one string on purpose, then bring it back to green by ear first — check the tuner only to confirm.',
            response: { type: 'mc', prompt: 'If a string\'s pitch is too LOW, which way do you turn the tuning peg?',
              answer: 0,
              explain: 'Too low means you need more tension, so tighten the string — the pitch rises up to the target. Loosening would make it even flatter.',
              choices: [
              'Tighten it so the pitch rises',
              'Loosen it so the pitch drops',
              'It doesn\'t matter which way',
              'Take the string off and put it back on'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/zpRoq0jcWfQ?t=16" target="_blank">Beginner Guide To Guitar Anatomy – JustinGuitar</a> (the parts walkthrough runs about 0:16–3:18; the later sections cover electric guitars, which aren\'t the ones we use — you can stop at 3:18). As he names each part, point to it on your own guitar and say the name out loud.',
            hint: 'Write down 5 parts you can now name from memory. You\'ve got it when: you can point to and name at least 5 parts without the video.',
            response: { type: 'mc', prompt: 'Which of these is NOT a part of the guitar?',
              answer: 0,
              explain: 'There\'s no "hinge" on a guitar. The body, neck, headstock, frets, strings, tuning pegs, nut, saddle, and bridge are all real parts.',
              choices: [
              'Hinge',
              'Headstock',
              'Saddle',
              'Nut'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/MlV6WhM9YhE" target="_blank">How To Hold Your Guitar – JustinGuitar</a>. While you watch, set up in your chair and copy his position piece by piece — feet, guitar on leg, back, strumming arm.',
            hint: 'Notice where the guitar rests and how the back stays straight. You\'ve got it when: you can look away from the screen and your guitar stays put without your fretting hand holding it up.',
            stuck: 'Pause at each position checkpoint and match one thing at a time: feet flat first, then guitar on the right leg, then straighten the back. Prop up your phone and film a few seconds, then compare yourself to the freeze-frame.',
            levelUp: 'Close your eyes for 10 seconds and keep the position. Or film 10 seconds of yourself playing and name one posture fix.',
            response: { type: 'mc', prompt: 'Where should the guitar\'s weight rest when you\'re sitting?',
              answer: 0,
              explain: 'The body of the guitar rests on your leg — your fretting hand should be free to move, not holding the neck up.',
              choices: [
              'On your leg — the fretting hand stays free',
              'Held up by your fretting hand',
              'Leaning back against your chest',
              'On the chair\'s armrest'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/1JBxNFEg0nU" target="_blank">Picks: How to Choose & Hold One (BC-107) – JustinGuitar</a>. Grab a pick and copy his grip as you watch — rest it on your bent index finger, then press your thumb on top.',
            hint: 'Write down: what are the two most common pick-holding mistakes? You\'ve got it when: only a small tip of the pick pokes past your thumb and it doesn\'t slip when you strum.',
            stuck: 'Hold the pick still and just brush it down across the strings with your whole forearm. If it flips or drops, let a little less tip show and relax your grip.',
            levelUp: 'Strum down-up-down-up slowly for 30 seconds without the pick sliding or twisting in your fingers.',
            response: { type: 'mc', prompt: 'How much of the pick\'s tip should show past your thumb?',
              answer: 0,
              explain: 'About 3–4 mm — just a small tip. Too much pick makes it flap and catch; too little makes it hard to hit the strings.',
              choices: [
              'A small tip, about 3–4 mm',
              'Just 1 mm, almost none',
              'About a centimeter',
              'The whole pick, gripped at the edge'
            ] }
          }
            ]
          },
          {
            title: 'String names & clean picking',
            steps: [
          {
            text: 'Type the 6 string names from memory, low to high, in the box below. Mnemonic: Eddie Ate Dynamite, Good Bye Eddie. You\'ve got it when: you can type all six in order without peeking at the mnemonic.',
            stuck: 'Type just the first letters — E A D G B E — using "Eddie Ate Dynamite, Good Bye Eddie." Clear it, then type them again from memory.',
            levelUp: 'Say the six string names high to low (e B G D A E) without pausing.',
            response: { type: 'short', placeholder: 'The 6 strings, low to high: …' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/Z1ETtvhPqdQ" target="_blank">Picking Individual Strings (BC-166) – JustinGuitar</a>. Copy him on your own guitar — pick one open string over and over, aiming for the same clean sound every time.',
            hint: 'Watch his picking hand and how light his fretting touch is. Clean single notes are the whole goal of your first melody. You\'ve got it when: you can pick a single string five times and it rings clean every time — no buzz, no catching a neighbor string.',
            stuck: 'Rest your picking hand lightly on the guitar and pick just the low E string slowly. If you hit two strings, aim a little more and use a smaller motion.',
            levelUp: 'Pick each open string once, low to high, without accidentally brushing the string next door.',
            skills: [6],
            response: { type: 'short', placeholder: 'Which string was easiest to pick cleanly, and which took the most tries?' }
          },
          {
            text: 'Quick try: play each open string once, low E to high e, saying the name out loud as you pluck. Just a preview — you\'ll drill these for real at the practice station. You\'ve got it when: you can name each string out loud the instant you pluck it.',
            hint: 'Hearing + saying + playing locks it in faster than just watching.',
            stuck: 'Go low to high slowly, checking the mnemonic after each one: E, A, D, G, B, e. Do it twice before you speed up.',
            levelUp: 'Look away, pluck a string at random, and name it from pitch and thickness alone before you peek. Got someone around? Have them pluck one out of your sight instead.',
            response: { type: 'mc', prompt: 'Say the string names low to high — which comes right after G?',
              answer: 0,
              explain: 'Low to high it\'s E A D G B e — so B follows G. (Try "Eddie Ate Dynamite, Good Bye Eddie.")',
              choices: [
              'B',
              'A',
              'D',
              'e'
            ] }
          }
            ]
          },
          {
            title: 'Preview the "Seven Nation Army" riff',
            steps: [
          {
            text: 'Preview the "Seven Nation Army" riff: click the note names below the TAB to hear how it should sound, then try just the first few notes to get the feel. You\'ll play the whole riff at the practice station. You\'ve got it when: you can match the first three notes to what you heard. This song grows with you through the whole course — <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 1 of 5</a>.',
            hint: 'Listen first, then match it — one note at a time.',
            stuck: 'Just the first two notes: click a note name to hear it, then find it on the low E string. Nail those before adding the next.',
            levelUp: 'Play the first four notes in a row, in time, humming the riff as you go.',
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
            stuck: 'Tune just one string to green and leave it, then the next. Hit the play button to hear each target pitch first so your ear knows where it\'s headed.',
            levelUp: 'Beat your own record: log this session\'s time and try to shave 15 seconds off it next session.',
            skills: [5],
            playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
          }
            ]
          },
          {
            title: 'Play a melody on the open strings with clean, steady notes',
            steps: [
          {
            text: 'Challenge 2 — One Minute, Perfect Notes: pluck each open string low to high (E A D G B e) and say its name out loud. For one minute, count how many ring perfectly clean — no buzz, no muting. You\'ve got it when: all 6 strings ring clean — no buzz, no muting. Log your score out of 6 so you can beat it next time.',
            hint: 'These are open strings — press nothing. Let each string ring fully before moving to the next.',
            stuck: 'Slow way down — one string every few seconds. Lift any finger that\'s touching a string and let each one ring fully before the next.',
            levelUp: 'Score 6 clean out of 6 twice in a row, then try it once more with your eyes closed.',
            skills: [6]
          },
          {
            text: 'Try "Happy Birthday" on open strings only — the tutorial video in the Songs tab walks you through the note sequence. Practice with a metronome at 60 BPM to keep steady. You\'ve got it when: you can play it start to finish with clean notes and a steady pulse.',
            hint: 'Go slow. Clean notes matter more than speed right now.',
            stuck: 'Learn it in two halves — get the first phrase clean before you add the second. Drop the metronome to 50 BPM until the notes are smooth.',
            levelUp: 'Nudge the metronome up to 70 BPM, keeping every note clean and in time.',
            skills: [6]
          },
          {
            text: 'Challenge 3 — Riff Time (give it a go!): play the "Seven Nation Army" riff on the low E string — slow and clean. You\'ve got it when: all 7 notes in the right order, each ringing clean — speed comes later. No score on this one, just go for it. Click any note name below the TAB to hear how it should sound.',
            hint: 'Slow and clean beats fast and buzzy. One note at a time.',
            stuck: 'Break the 7 notes into two chunks and learn the first chunk cold. Click each note name to hear its pitch, then find it before you play on.',
            levelUp: 'Play all 7 notes in time with a slow metronome at 60 BPM, keeping each one clean.',
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
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Play the low-E riff — your first core-thread riff', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Happy Birthday"', meta: 'Play melody on open strings — first real song!', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Sailor Song" — Gigi Perez', meta: 'Listen — fingerpicked vs. strummed guitar', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=1lrFsXkT_rM',
        tutorialUrl: 'https://www.youtube.com/watch?v=rpoyXduMZZw' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Listen and identify guitar sounds', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
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
      goal: 'Names 5+ parts of the guitar · Holds guitar with correct posture · Holds pick with correct grip · Tunes all 6 strings · Plays a short melody on the E string with clean, steady notes',
      performance: 'Record yourself doing the full tune-up, then playing each open string cleanly low to high while naming it. Listen back and self-check: every string green, every note clean, every name right.',
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
      { id: 'w2-s6', text: 'Play a short melody on the E string with clean, steady notes',
        gotItWhen: 'you can play the melody all the way through with clean notes and a steady pulse — practice it at 60 BPM with the metronome to lock in the timing.',
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
    { id: 'mr1-s4', text: 'I can play a short melody on the E string with clean, steady notes', set: 'w2' },
    { id: 'mr1-s5', text: 'I can hold the guitar and pick correctly and make every open string ring clean', set: 'w2' }
  ],
  assessItems: [
    'Tune all 6 strings to green in under 2 minutes, without restarting',
    'Name all 6 strings from memory — in order and at random',
    'Play each open string with correct posture and pick grip — down-strokes from the wrist, every string ringing full and clean with no accidental muting from either hand'
  ],
  forward: 'You\'ve got a guitar that\'s in tune, a goal, and your first clean notes — <strong>Module 2 puts names on the frets</strong> so riffs and TAB start making sense. (Already played before, or coming back after a long break? <strong>Module 9, Set 0</strong> is a six-skill re-test that shows you exactly where to start.)',
  standards: ['Pr.1a', 'Pr.4a', 'Pr.5a', 'Cn.11a']
};
