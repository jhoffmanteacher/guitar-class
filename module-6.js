// ============================================================
//  MODULE 6 — Strumming Patterns with Chords
//  Edit this file to change Module 6 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm6w1',
    label: 'Set 1',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    title: 'Set 1',
    subtitle: 'The down-up foundation · 8th-note pulse · Counting "1 + 2 + 3 + 4 +"',
    objective: 'I CAN play a steady down-up 8th-note strum pattern over open chords at 70+ BPM without losing the beat.',
    skillFocus: 'Wrist as pendulum · Down on the number, up on the "and" · Counting 8th notes aloud · Keeping the strum moving even through chord changes · Strum-hand independence',
    handoutUrl: 'https://docs.google.com/document/d/1mBqrpsG2rkiVPWrF-zo0fxlgA1YQN33GyxmgsXqCY0g/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/n45PDizCRLw" target="_blank">Your FIRST Strumming Pattern EVER! – JustinGuitar</a> (full video).',
            hint: 'Pay close attention to his wrist — it never stops moving, even when he isn\'t hitting the strings. The pendulum motion is the secret.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'What is the SINGLE most important habit for good strumming?', choices: [
              'Keep the wrist moving like a pendulum, even between strums',
              'Strum as loudly as possible',
              'Use a very thick pick',
              'Look at your strumming hand the whole time'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/NCV9IgeSYuU" target="_blank">Beginner Guitar Strumming Patterns You MUST Know! – Marty Music</a> (full video).',
            hint: 'Count out loud with him: "1 + 2 + 3 + 4 +". Saying the count is the fastest way to internalize the pulse.',
            skills: [3],
            response: { type: 'short', placeholder: 'When you count "1 + 2 + 3 + 4 +", which counts are the downstrokes? Which are the upstrokes?' }
          },
          {
            text: 'Listen to "Brown Eyed Girl" by Van Morrison. Tap along on your leg — down with your hand on the numbers, up on the "ands". Can you feel the 8th-note pulse?',
            hint: 'You don\'t need a guitar yet. Just train your body to feel the steady pulse before you add the strings.',
            skills: [3, 4],
            response: { type: 'mc', prompt: 'In a down-up 8th-note pattern, how many total strums (down + up) happen in one bar of 4 beats?', choices: [
              '4',
              '6',
              '8',
              '16'
            ] }
          }
        ]
      },
      c: {
        title: 'Practice station — strumming hand drill',
        sections: [
          {
            title: 'Warm-up — tune & tone check (Modules 1–2)',
            steps: [
              {
                text: 'Start every class the same way: tune all 6 strings to green (E A D G B e), then play each string open and at the 1st–3rd fret, listening for buzz. Win: in tune, and every note clean before today\'s work.',
                hint: 'Tuning (Module 1) and clean, buzz-free notes (Module 2) are skills you keep forever. 60 seconds here makes everything today sound better.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Build the down-up pendulum motion',
            steps: [
          {
            text: 'Challenge 1 — Pendulum Motion: mute the strings with your fretting hand and, at 60 BPM, strum just the down-up motion — down on each beat, up on each "+", counting aloud. Win: a free, even swing with no forearm tension — pure rhythm, no notes.',
            hint: 'No chord, no notes — just the rhythm. Your wrist should swing freely like a pendulum. If your forearm is tense, slow down.',
            skills: [1, 3]
          }
            ]
          },
          {
            title: 'Hold a steady down-up strum',
            steps: [
          {
            text: 'Challenge 2 — Even Eighths on Em: fret Em and strum down-up at 60 BPM for 8 bars. Win: every strum even — same volume, same timing — with upstrokes brushing only the top 3–4 strings.',
            hint: 'It\'s normal for upstrokes to feel weaker at first. They should brush only the top 3–4 strings, not the whole chord.',
            skills: [2, 4],
            playSeq: { label: 'Hear the 8th-note pulse', bpm: 60, notes: [60, 60, 60, 60, 60, 60, 60, 60] }
          }
            ]
          },
          {
            title: 'Keep time through a chord change',
            steps: [
          {
            text: 'Challenge 3 — Keep It Going: switch Em ↔ Am every 2 bars while the down-up strum never stops. Win: the strum hand keeps swinging right through every chord change — let the chord catch up.',
            hint: 'The #1 beginner mistake is stopping the strum to fix the chord. Keep the wrist moving — let the chord catch up.',
            skills: [4, 5, 6]
          }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"Brown Eyed Girl" — Van Morrison', meta: 'G–C–G–D · classic 8th-note down-up strum', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=UfmkgQRmmeE',
        tutorialUrl: 'https://www.youtube.com/watch?v=v-EGJOz-Mek' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am–G–F · steady down-up over chord changes', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Knockin\' on Heaven\'s Door" — Dylan', meta: 'G–D–Am–C · slow tempo, perfect for first strum patterns', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=rm9coqlk8fY',
        tutorialUrl: 'https://www.youtube.com/watch?v=pWIL4N6QZ-Y' },
      { name: '"Stand By Me" — Ben E. King', meta: 'G–Em–C–D · slow, even strum', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=hwZNL7QVJjE',
        tutorialUrl: 'https://www.youtube.com/watch?v=TXLElO_YYiY' },
      { name: '"Three Little Birds" — Bob Marley', meta: 'A–D–E · light reggae upstrokes', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=HNBCVM4KbUM',
        tutorialUrl: 'https://www.youtube.com/watch?v=61pk1YH9Lu0' },
      { name: '"Bad Moon Rising" — CCR', meta: 'D–A–G · driving down-up rhythm', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=5BmEGm-mraE',
        tutorialUrl: 'https://www.youtube.com/watch?v=liBI2yT_fpw' },
      { name: '"Achy Breaky Heart" — Billy Ray Cyrus', meta: 'A–E · only 2 chords, pure strum focus', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=byQIPdHMpjc',
        tutorialUrl: 'https://www.youtube.com/watch?v=esZhlB61Uis' },
      { name: '"You Are My Sunshine" — folk standard', meta: 'C–F–G · classic, simple, slow', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=ckKeQNCyPBU',
        tutorialUrl: 'https://www.youtube.com/watch?v=APqpmK72lIs' }
    ],

    assessment: {
      goal: 'Keeps a steady down-up 8th-note pulse for 8+ bars · Counts "1 + 2 + 3 + 4 +" aloud while strumming · Switches between Em and Am without stopping the strum hand · Strums evenly (downstrokes and upstrokes same volume)',
      performance: 'Class strums Em for 4 bars, then Am for 4 bars, with a steady down-up pulse at 60 BPM. Everyone counts aloud. Teacher listens for the strum hand never stopping.',
      selfCheck: 'Can you keep your strum hand moving even during a chord change? Can you count the 8th-note pulse out loud without slowing down?',
      standards: ['Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm6w1-s1', text: 'Move my strumming wrist like a pendulum — continuous motion, even between strums',
        gotItWhen: 'someone can watch your strum hand and see that it never fully stops — the wrist is always traveling down or up, even when you skip a strum.',
        practice: { type: 'mc', prompt: 'When the wrist "stops" between strums, what usually goes wrong?',
          choices: ['Nothing — it should stop', 'You lose the pulse and the timing falls apart', 'The pick gets dropped', 'The chord sounds louder'], answer: 1 } },
      { id: 'm6w1-s2', text: 'Play a steady down-up 8th-note pattern at 60 BPM for 8 bars',
        gotItWhen: 'you can strum down-up at 60 BPM for 8 bars and every strum lands evenly with the metronome — no drift, no skipped strums.',
        practice: { type: 'playSeq', label: 'Hear the 8th-note pulse (8 evens)', bpm: 60,
          notes: [60, 60, 60, 60, 60, 60, 60, 60] } },
      { id: 'm6w1-s3', text: 'Count "1 + 2 + 3 + 4 +" out loud while strumming',
        gotItWhen: 'you can count aloud with the strum and the numbers always land on downstrokes, the "and"s always land on upstrokes — no thinking required.',
        practice: { type: 'mc', prompt: 'In "1 + 2 + 3 + 4 +", which counts are the DOWNSTROKES?',
          choices: ['The "+" (and) counts', 'The numbers (1, 2, 3, 4)', 'All of them', 'Only beat 1'], answer: 1 } },
      { id: 'm6w1-s4', text: 'Strum with even volume — downstrokes and upstrokes feel equally controlled',
        gotItWhen: 'your downstrokes and upstrokes sound roughly the same volume — neither overpowers the other, and your pick doesn\'t snag the strings on the way up.' },
      { id: 'm6w1-s5', text: 'Keep the strum hand moving through a chord change',
        gotItWhen: 'when you switch from Em to Am (or any two chords), your strum hand never pauses — the chord change happens BETWEEN strums, not by stopping the rhythm.',
        practice: { type: 'mc', prompt: 'During a chord change, what should your STRUM hand do?',
          choices: ['Stop and wait for the chord', 'Keep moving in the down-up pendulum', 'Strum extra hard to cover the change', 'Lift off the strings'], answer: 1 } },
      { id: 'm6w1-s6', text: 'Play 4 bars of Em then 4 bars of Am with a continuous down-up strum',
        gotItWhen: 'you can loop Em-Em-Em-Em-Am-Am-Am-Am with down-up strumming at 60 BPM and never break the rhythm — even when the chord change is imperfect.',
        practice: { type: 'playSeq', label: 'Em → Am roots (4 bars each)', bpm: 60,
          notes: [40, 40, 40, 40, 45, 45, 45, 45] } }
    ]
  },

  {
    id: 'm6w2',
    label: 'Set 2',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    title: 'Set 2',
    subtitle: 'The "D-DU-UDU" pattern · Rests and accents · Adding groove',
    objective: 'I CAN play the classic D-DU-UDU strum pattern at 70+ BPM and apply it to a real song with chord changes.',
    skillFocus: 'Skipping strums (rests) while keeping wrist motion · Accent on beats 2 and 4 · The "missing" downstroke · D-DU-UDU pattern · Reading strum-pattern notation (D/U arrows)',
    handoutUrl: 'https://docs.google.com/document/d/1mBqrpsG2rkiVPWrF-zo0fxlgA1YQN33GyxmgsXqCY0g/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/6LmQCdt_ZhQ" target="_blank">The Most Common Strumming Pattern of All Time! – JustinGuitar</a> (full video).',
            hint: 'Justin calls this "old faithful" — D-DU-UDU. Listen for which strums he skips: the wrist still moves, but the pick doesn\'t hit the strings on those beats.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In the D-DU-UDU pattern, on which count is the strum SKIPPED (no strings hit, but wrist still moves)?', choices: [
              'The "+" of beat 1',
              'Beat 2 (the third strum)',
              'The "+" of beat 4',
              'Beat 1'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/0JDGO0n6tjw" target="_blank">Step-by-Step Easy Strumming Patterns – Marty Music</a> (full video).',
            hint: 'Marty stacks patterns from easiest to harder, accenting beats 2 and 4 as he goes. The accents give the strum a "backbeat" feel, like a drummer\'s snare.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'Why might emphasizing beats 2 and 4 (instead of 1 and 3) make a strum pattern sound more "groovy"?' }
          },
          {
            text: 'Listen to "I\'m Yours" by Jason Mraz. Tap the D-DU-UDU pattern on your leg along with the song. Where does the pattern repeat?',
            hint: 'The pattern is one bar long and repeats throughout the whole song. Once you have it, you have most of his song.',
            skills: [4, 5],
            response: { type: 'mc', prompt: 'A one-bar strum pattern in 4/4 time covers how many counts?', choices: [
              '2',
              '4',
              '8',
              '16'
            ] }
          }
        ]
      },
      c: {
        title: 'Practice station — D-DU-UDU pattern drill',
        sections: [
          {
            title: 'Learn the D-DU-UDU pattern',
            steps: [
          {
            text: 'Challenge 1 — Learn the Groove: mute the strings and, at 60 BPM, strum the pattern "Down, Down-Up, Up-Down-Up" (D-DU-UDU). Win: the wrist keeps moving on the skipped downstroke — the pick just misses on purpose.',
            hint: 'The trickiest part is keeping the wrist moving on the skipped downstroke. The wrist still goes down — the pick just misses the strings on purpose.',
            skills: [1, 2, 3]
          }
            ]
          },
          {
            title: 'Play the pattern with backbeat accents',
            steps: [
          {
            text: 'Challenge 2 — Pattern on Em: fret Em and play D-DU-UDU at 60 BPM for 8 bars, counting aloud and accenting beats 2 and 4. Win: 8 clean bars with a clear "snare hit" feel on 2 and 4.',
            hint: 'Add accents on beats 2 and 4 — those downstrokes should be a little louder. Feel the "snare hit" on those beats.',
            skills: [2, 4, 5],
            playSeq: { label: 'Hear Em with accent on 2 and 4', bpm: 60, notes: [40, 40, 47, 40, 40, 47] }
          }
            ]
          },
          {
            title: 'Hold the pattern through a chord change',
            steps: [
          {
            text: 'Challenge 3 — Hold the Pattern: loop G → D every 2 bars while playing D-DU-UDU. Win: the pattern stays identical through the change — only the chord moves (drop to 50 BPM if it falls apart).',
            hint: 'If the pattern falls apart during the chord change, slow to 50 BPM. The pattern is the GROOVE — losing it is worse than missing a note in the chord.',
            skills: [4, 5, 6]
          }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"Vampire" — Olivia Rodrigo', meta: 'C–G–Am–F · D-DU-UDU pattern on verse', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"Happy Birthday"', meta: 'Apply D-DU-UDU to C–G–Am–F arrangement', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"I\'m Yours" — Jason Mraz', meta: 'G–D–Em–C · iconic D-DU-UDU strum', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=EkHTsc9PU2A',
        tutorialUrl: 'https://www.youtube.com/watch?v=6ugeJWAMz6w' },
      { name: '"Wonderwall" — Oasis', meta: 'Em7–G–D–C · classic strum pattern with accents', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=6hzrDeceEKc',
        tutorialUrl: 'https://www.youtube.com/watch?v=5V81btmYxgE' },
      { name: '"Free Fallin\'" — Tom Petty', meta: 'D–Dsus4–A · steady down-up with accents', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=1lWJXDG2i0A',
        tutorialUrl: 'https://www.youtube.com/watch?v=HSwaGGa6HAM' },
      { name: '"Hey Soul Sister" — Train', meta: 'C–G–Am–F · upbeat D-DU-UDU', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=kVpv8-5XWOI',
        tutorialUrl: 'https://www.youtube.com/watch?v=iFMEYCSPpDg' },
      { name: '"Riptide" — Vance Joy', meta: 'Am–G–C · perfect groove pattern', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=uJ_1HMAGb4k',
        tutorialUrl: 'https://www.youtube.com/watch?v=4pmK0x6mY0I' },
      { name: '"Let It Be" — The Beatles', meta: 'C–G–Am–F · slow, even pattern', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=gGt0akED_UU' }
    ],

    assessment: {
      goal: 'Plays the D-DU-UDU pattern cleanly at 70 BPM · Accents beats 2 and 4 (backbeat) · Keeps pattern steady through a chord change · Applies pattern to a real song',
      performance: 'Partner play: one student strums D-DU-UDU on Em for 4 bars, then partner takes over on Am for 4 bars. Pattern must not break at the handoff.',
      selfCheck: 'Can you play D-DU-UDU without thinking about which strum is next? Can you keep the pattern going through a G-to-D change?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm6w2-s1', text: 'Play the D-DU-UDU pattern cleanly at 60 BPM',
        gotItWhen: 'you can play D-DU-UDU on a single chord at 60 BPM for 4 bars in a row without breaking the pattern or stopping the wrist.',
        practice: { type: 'mc', prompt: 'How would you read D-DU-UDU out loud as a count? (one of these matches)',
          choices: ['1, 2-+, +-3-+', '1-+, 2, 3, 4', 'Just count "1, 2, 3, 4"', '1-2-3-4-5-6'], answer: 0 } },
      { id: 'm6w2-s2', text: 'Skip a downstroke while keeping the wrist in motion',
        gotItWhen: 'on the "skipped" strum in the pattern, your wrist still travels down — only the pick doesn\'t touch the strings. Someone watching can see the motion.',
        practice: { type: 'mc', prompt: 'When you "skip" a strum in the D-DU-UDU pattern, what does your wrist do?',
          choices: ['Stops completely', 'Keeps moving in the pendulum — the pick just misses the strings', 'Lifts up away from the guitar', 'Locks for a beat'], answer: 1 } },
      { id: 'm6w2-s3', text: 'Accent beats 2 and 4 (the "backbeat")',
        gotItWhen: 'when you strum the pattern, beats 2 and 4 are noticeably louder than 1 and 3 — and the song starts to feel like it has a built-in drumbeat.',
        practice: { type: 'playSeq', label: 'Hear the backbeat — louder hits on 2 and 4', bpm: 70,
          notes: [40, 47, 40, 47] } },
      { id: 'm6w2-s4', text: 'Keep the D-DU-UDU pattern going through a chord change',
        gotItWhen: 'when you switch from G to D (or any two chords) the pattern doesn\'t change at all — only the chord underneath does.' },
      { id: 'm6w2-s5', text: 'Apply the D-DU-UDU pattern to a verse of a real song',
        gotItWhen: 'you can play the verse of "I\'m Yours" or "Vampire" with the D-DU-UDU pattern from start to finish — even if a chord is imperfect, the pattern holds.',
        practice: { type: 'playSeq', label: '"I\'m Yours" verse roots (G · D · Em · C)', bpm: 70,
          notes: [43, 50, 40, 48] } },
      { id: 'm6w2-s6', text: 'Read a strum-pattern chart (D/U arrows or symbols)',
        gotItWhen: 'you can look at a written-out strum pattern (e.g., "↓ ↓↑ ↑↓↑") and play it correctly the first time, without someone demonstrating it.',
        practice: { type: 'mc', prompt: 'In strum notation, what does the symbol "↑" mean?',
          choices: ['Strum up (toward the ceiling, away from the floor)', 'Strum down', 'Mute the strings', 'Hold the chord'], answer: 0 } }
    ]
  },

  {
    id: 'm6w3',
    label: 'Set 3',
    locked: false,
    module: 'Strumming Patterns with Chords',
    moduleNum: 6,
    unit: 'Module 6 · Strumming Patterns with Chords',
    title: 'Set 3',
    subtitle: 'Multiple strum patterns · Folk, rock, reggae styles · Choosing the right groove',
    objective: 'I CAN play 2+ different strum patterns over the same chord progression and choose a pattern that fits a song\'s style.',
    skillFocus: 'Folk strum (gentle, even) · Rock strum (heavier downstrokes) · Reggae strum (upstrokes on the "and") · Matching pattern to song style · Switching patterns mid-song',
    handoutUrl: 'https://docs.google.com/document/d/1mBqrpsG2rkiVPWrF-zo0fxlgA1YQN33GyxmgsXqCY0g/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/CjM5fyXoV8w" target="_blank">Learn ANY Strumming Pattern with this Exercise – JustinGuitar</a> (full video).',
            hint: 'Notice how each pattern Justin demonstrates has a different feel — folk feels gentle, rock feels driving, reggae feels bouncy. The pattern is the GENRE in many cases.',
            skills: [1, 2, 3],
            response: { type: 'mc', prompt: 'Which strum-pattern feature most defines REGGAE rhythm?', choices: [
              'Loud downstrokes on beat 1',
              'Upstrokes on the "+" (and) of each beat, with the downstrokes skipped',
              'Strumming only on beat 4',
              'No strumming at all'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/NCV9IgeSYuU" target="_blank">Beginner Guitar Strumming Patterns You MUST Know! – Marty Music</a> (full video).',
            hint: 'Marty walks through several patterns. There is no single "correct" one — listen to a song and feel which fits. The original recording usually tells you exactly what to do.',
            skills: [4, 5],
            response: { type: 'short', placeholder: 'Pick a song you like. Describe the strum pattern in your own words — is it gentle, driving, choppy? What gives it that feel?' }
          },
          {
            text: 'Compare two recordings: "Three Little Birds" (Bob Marley — reggae) and "Bad Moon Rising" (CCR — rock). Same speed-ish, very different feel. What makes the difference?',
            hint: 'It\'s almost entirely the strum pattern. Reggae emphasizes the offbeats (the "+"); rock emphasizes the downbeats (the numbers).',
            skills: [4, 5],
            response: { type: 'short', placeholder: 'In one sentence: what is the biggest difference between the reggae strum and the rock strum?' }
          }
        ]
      },
      c: {
        title: 'Practice station — try three styles',
        sections: [
          {
            title: 'Play a folk strum',
            steps: [
          {
            text: 'Challenge 1 — Folk Feel: hold G and strum all downstrokes, one per beat, at 70 BPM — quiet and steady, campfire style. Win: even, soft, supportive strumming with no accents sticking out.',
            hint: 'Folk is about supporting the singer, not standing out. Soft attack, even volume, no accents.',
            skills: [1, 4]
          }
            ]
          },
          {
            title: 'Play a rock strum',
            steps: [
          {
            text: 'Challenge 2 — Rock Feel: same G at the same tempo, but dig in — heavy downstrokes, then down-up-down-up accenting every down. Win: a chunky, driving sound using arm weight, not just wrist.',
            hint: 'Rock strumming uses arm weight more than wrist. Let the pick go deeper into the strings. Aim for a "chunky" sound.',
            skills: [2, 4]
          }
            ]
          },
          {
            title: 'Play a reggae strum',
            steps: [
          {
            text: 'Challenge 3 — Reggae Chop (give it a go!): hold G, skip every downbeat, and strum UP only on each "+" — rest-up-rest-up. No score — play along with "Three Little Birds" to lock in the offbeat feel.',
            hint: 'Counter-intuitive at first — your hand goes down on the beats but doesn\'t hit the strings. Listen to "Three Little Birds" while you do this to lock in the feel.',
            skills: [3, 4],
            playSeq: { label: 'Hear the reggae offbeat (up-strums only)', bpm: 70, notes: [55, 55, 55, 55] }
          }
            ]
          },
          {
            title: 'Spiral review — solo over the groove (Module 4 pentatonic)',
            steps: [
          {
            text: 'Challenge — Trade Off (give it a go!): partner up. One of you strums a progression (try Am–G–C or G–D–Em–C) with any pattern from this module; the other solos over it using Pentatonic Pattern 1 from Module 4. Swap after 8 bars. No score — aim for one clear musical idea, not a flurry of notes.',
            hint: 'Am–G–C fits A minor pentatonic; a major-key progression fits major pentatonic. This is the payoff: the scale you learned in Module 4 lives on top of the chords you strum here. Leave space — silence is part of a solo.',
            playSeq: { label: 'Backing roots — Am · G · C', bpm: 70, notes: [45, 43, 48] }
          }
            ]
          }
        ]
      }
    },

    songs: [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Try it folk-style, then rock-style — same chords, different feel', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Three Little Birds" — Bob Marley', meta: 'A–D–E · classic reggae offbeat strum', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=HNBCVM4KbUM',
        tutorialUrl: 'https://www.youtube.com/watch?v=61pk1YH9Lu0' },
      { name: '"Bad Moon Rising" — CCR', meta: 'D–A–G · driving rock-style strum', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=5BmEGm-mraE',
        tutorialUrl: 'https://www.youtube.com/watch?v=liBI2yT_fpw' },
      { name: '"Wagon Wheel" — Old Crow Medicine Show', meta: 'G–D–Em–C · folk strum classic', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=1gX1EP6mG-E',
        tutorialUrl: 'https://www.youtube.com/watch?v=zx3Tv5uBAaE' },
      { name: '"Stir It Up" — Bob Marley', meta: 'A–D–E · slow reggae upstrokes', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=1hwL3S3Gtzs',
        tutorialUrl: 'https://www.youtube.com/watch?v=IYmWSehv5KE' },
      { name: '"Folsom Prison Blues" — Johnny Cash', meta: 'E–A–B · driving country/rock strum', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=AeZRYhLDLeU',
        tutorialUrl: 'https://www.youtube.com/watch?v=szdTIPVLwa4' },
      { name: '"House of the Rising Sun" — The Animals', meta: 'Am–C–D–F · arpeggiated strum challenge', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=mWJ6oRTyjnE' },
      { name: '"Buffalo Soldier" — Bob Marley', meta: 'Bm–G–D–A · reggae offbeat practice', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=uMUQMSXLlHM',
        tutorialUrl: 'https://www.youtube.com/watch?v=rNSq3E3KfMk' }
    ],

    assessment: {
      goal: 'Plays folk, rock, and reggae strum styles on demand · Switches between two patterns mid-song · Chooses a pattern that fits a song\'s style · Applies pattern to a full chord progression',
      performance: 'Solo: pick one song and one strum style (folk, rock, or reggae). Play 8 bars with that pattern. Then switch to a different style for the next 8 bars. Same chords, two feels.',
      selfCheck: 'Can you play the same chord progression three different ways (folk, rock, reggae) and have them actually sound different? Can you pick the right pattern for a new song by ear?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Re.7a']
    },

    skills: [
      { id: 'm6w3-s1', text: 'Play a folk strum (gentle, even all-downstrokes or simple down-up)',
        gotItWhen: 'you can play a chord progression with even, soft downstrokes that supports a singer — no accents, no aggressive attack.' },
      { id: 'm6w3-s2', text: 'Play a rock strum (heavy downstrokes with accent and dig)',
        gotItWhen: 'your rock strum has clear weight and drive — someone can tell from across the room that you mean it.' },
      { id: 'm6w3-s3', text: 'Play a reggae strum (upstrokes on the "+", downstrokes skipped)',
        gotItWhen: 'you can play a reggae chop where ONLY the upstrokes hit the strings — your hand still moves on the beats, but the pick misses on purpose.',
        practice: { type: 'mc', prompt: 'In a reggae offbeat strum, the strings are hit on which counts?',
          choices: ['1, 2, 3, 4 (the numbers)', 'The "+" of each beat (between numbers)', 'Only beat 1', 'Continuously'], answer: 1 } },
      { id: 'm6w3-s4', text: 'Choose a strum pattern that matches a song\'s style',
        gotItWhen: 'someone hands you a new song and you can listen for 15 seconds and pick a strum pattern that fits — without being told what to play.',
        practice: { type: 'mc', prompt: 'You hear a song with a slow, gentle, acoustic feel and a singer-songwriter vibe. Which strum suits it best?',
          choices: ['Heavy rock chops on every downstroke', 'Reggae offbeat upstrokes', 'Gentle folk strum (soft down-up)', 'No strum at all'], answer: 2 } },
      { id: 'm6w3-s5', text: 'Switch strum patterns mid-song (e.g., verse vs. chorus)',
        gotItWhen: 'you can play 8 bars of one pattern, then switch cleanly to a different pattern for the next 8 bars — without losing the beat at the transition.' },
      { id: 'm6w3-s6', text: 'Play 2+ different patterns over the same chord progression',
        gotItWhen: 'you can take G–D–Em–C and play it two different ways (e.g., folk then rock) and the two versions actually sound like different songs.',
        practice: { type: 'playSeq', label: 'G · D · Em · C progression (try with each style)', bpm: 70,
          notes: [43, 50, 40, 48] } }
    ]
  }

); // end module-6.js

MODULE_REVIEWS[6] = {
  moduleNum: 6,
  module: 'Strumming Patterns with Chords',
  skills: [
    { id: 'mr6-s1', text: 'I can hold a steady down-up strum pattern at 70+ BPM' },
    { id: 'mr6-s2', text: 'I can play 2+ different strum patterns over the same chord progression' },
    { id: 'mr6-s3', text: 'I can keep time while changing chords mid-pattern' }
  ],
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
};
