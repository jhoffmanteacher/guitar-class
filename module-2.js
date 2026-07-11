// ============================================================
//  MODULE 2 — Notes on the E & A Strings
//  Edit this file to change Module 2 content.
//  Upload to GitHub alongside index.html + firebase-config.js
//
//  ★ TEMPLATE MODULE — pattern source for all other modules.
//    When building or upgrading another module, copy the patterns
//    here (named challenges w/ "You've got it when:", Stuck?/Level up,
//    exit tickets, PR ladders, self-contained gotItWhens,
//    forward link in the module review). See WORKFLOW.md Appendix A
//    for the full checklist. Frozen 2026-06-11 after Session 1.4.
//    Known open item: Set 2 computer station keeps 3 short timestamped
//    videos (vs the ≤2 guideline) — each anchors a distinct skill and
//    carries an active during-watching job; revisit if it runs long.
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
    skillFocus: 'Natural notes on the E and A strings · Reading notes on a fretboard chart',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://youtu.be/Abrd0c92xRE" target="_blank">Open Notes On The Guitar – JustinGuitar</a>.',
                hint: 'Play along on your guitar as he goes through each note on both strings. Pause and find each note before he names it.',
                skills: [1, 2, 3],
                response: { type: 'mc', prompt: 'On the low E string, which note is at fret 5?',
                  answer: 0,
                  explain: 'Fret 5 of the low E is A — the same pitch as the open A string right next to it.',
                  choices: [
                  'A',
                  'D',
                  'G',
                  'F'
                ] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/WQ8DSYD2kvw" target="_blank">Learn Every Note on the Fretboard – Marty Music</a> (0:00–4:00).',
                hint: 'Focus on the E and A strings only for now. What patterns does he point out?',
                skills: [1, 3],
                response: { type: 'short', placeholder: 'Describe one pattern he points out for finding notes on the E or A string.' }
              }
            ]
          },
          {
            title: 'Listen and find notes by ear',
            steps: [
              {
                text: 'Listen to "Happy Birthday" — can you identify which notes of the melody live on the E or A string? Hum along and try to find the notes.',
                hint: 'Don\'t worry about playing it yet — just train your ear to connect sounds to strings.',
                skills: [5],
                response: { type: 'short', placeholder: 'Which note(s) did you find first? Where on the fretboard?' }
              }
            ]
          },
          {
            title: 'Play along with your note chart',
            steps: [
              {
                text: 'Play-along preview: keep your note-name chart open and play up the low E string slowly with the audio, frets 0–12 — E · F · G · A · B · C · D · E — saying each name aloud. Lean on the chart here; you\'ll do it from memory at the practice station.',
                hint: 'Slow is fine. Right now the goal is connecting each name to its spot — use the chart freely.',
                skills: [2],
                playSeq: { label: 'Play all', bpm: 60, notes: [40, 41, 43, 45, 47, 48, 50, 52] },
                response: { type: 'mc', prompt: 'On the low E string, what note is at fret 10?',
                  answer: 1,
                  explain: 'Counting the naturals up the low E (E F G A B C D), fret 10 lands on D — fret 12 is E again, the octave.',
                  choices: [
                  'C',
                  'D',
                  'E',
                  'B'
                ] }
              },
              {
                text: 'Same idea on the A string, still with your chart: A · B · C · D · E · F · G · A (frets 0–12), up then back down, names aloud.',
                hint: 'Notice fret 5 of the A string is the same note as the open D string — that connection helps later.',
                skills: [3],
                playSeq: { label: 'Play all', bpm: 60, notes: [45, 47, 48, 50, 52, 53, 55, 57] },
                response: { type: 'short', placeholder: 'What did you notice about any of the notes? Did any two notes feel or sound similar?' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — take a beat to reflect: which note or fret felt fuzziest today, and what (if anything) started to make it click?',
                response: { type: 'short', placeholder: 'e.g. fret 8 on the low E — kept mixing up B and C' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — fretboard drill',
        sections: [
          {
            title: 'Warm-up — tune up first (Module 1 review)',
            steps: [
              {
                text: 'Before today\'s notes: tune all 6 strings to green, low to high — E A D G B e — and say each string name as you go. Beat your time from last session. Click "Hear all 6 strings" for the target pitches.',
                hint: 'Tuning and the string names are Module 1 skills you keep forever — do this every practice session before you play. Slow and steady beats rushing past the note.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Name every note on the low E string (frets 0–12)',
            steps: [
              {
                text: 'Challenge 1 — Low E Run: play every natural note up the low E string and back down — E · F · G · A · B · C · D · E — saying each name aloud. You\'ve got it when: one lap, chart-free, with no mistakes.',
                hint: 'Hearing + saying + playing locks it in. Peek at the chart only if you\'re truly stuck. Set the ⏱ Timer (bottom of the screen) to 2 min and count how many clean laps you fit before it beeps — beat that number next session.',
                stuck: 'Master frets 0–5 only (E–A) chart-free first, then add 7–12 once those are automatic.',
                levelUp: 'One clean lap at 80 BPM, or start at fret 12 and name your way down.',
                skills: [2],
                playSeq: { label: 'Play all', bpm: 60, notes: [40, 41, 43, 45, 47, 48, 50, 52] },
                response: { type: 'short', prompt: 'Personal record: win at 60, then raise the metronome +10 at a time. What\'s your fastest CLEAN lap today (BPM)?', placeholder: 'e.g. 90 — that\'s the number to beat next session' }
              },
              {
                text: 'Quick check — name the note before you play it:',
                skills: [2],
                response: { type: 'mc', prompt: 'Low E string — what note is at fret 8?',
                  answer: 1,
                  explain: 'Fret 7 is B, and C is just one fret up at 8 — there\'s no sharp between B and C.',
                  choices: ['A', 'C', 'D', 'B'] }
              },
              {
                text: 'Name That Riff (give it a go!): pick out the "Seven Nation Army" or "Smoke on the Water" main riff by ear on the low E string. No score — just go for it.',
                hint: 'Use the note-name chart. Don\'t worry about getting it perfect — the attempt trains your ear.',
                skills: [5]
              }
            ]
          },
          {
            title: 'Name every note on the A string (frets 0–12)',
            steps: [
              {
                text: 'Challenge 2 — A String Run (your Set 1 check-off): same on the A string, chart-free — A · B · C · D · E · F · G · A, up to fret 12 and back, one note per beat. You\'ve got it when: a clean lap with the metronome and no stalls. The Set 1 check-off tests exactly this: draw any fret at random — shuffled paper slips 0–12 work great — and name the note within 3 seconds.',
                hint: 'Keep the metronome at 60 BPM. If you stall on a note, that\'s the one to drill.',
                stuck: 'Drop to 50 BPM and win there first, or cover frets 0–5 (A–D) before adding the rest.',
                levelUp: 'Lap it at 80 BPM, or draw shuffled fret slips and name each on the spot. Got someone around? Have them call out random frets instead.',
                skills: [3],
                playSeq: { label: 'Play all', bpm: 60, notes: [45, 47, 48, 50, 52, 53, 55, 57] },
                response: { type: 'short', prompt: 'Personal record: win at 60, then raise the metronome +10 at a time. Your fastest CLEAN A-string lap today (BPM)?', placeholder: 'e.g. 80 — beat it next session' }
              },
              {
                text: 'Quick check — name the note before you play it:',
                skills: [3],
                response: { type: 'mc', prompt: 'A string — what note is at fret 2?',
                  answer: 1,
                  explain: 'From open A, one fret up is A#, and two frets up is B. So fret 2 on the A string is B.',
                  choices: ['A', 'B', 'C', 'D'] }
              },
              {
                text: 'Shuffle self-quiz: write frets 0–12 on small scraps of paper and shuffle them. Flip one at a time and say the A-string note within 3 seconds. Go 10 rounds. Got someone around? Have them call out random frets instead — same 3-second limit.',
                hint: 'No chart. If you stall on a note, loop just that part of the string until it\'s automatic.'
              },
              {
                text: 'Challenge 3 — Shuffle Run: write frets 0–12 on scraps of paper (or reuse your slips from the self-quiz above), shuffle them, then draw one at a time and — on the low E string — name it AND play it within 3 seconds. You\'ve got it when: 10 in a row with no counting up from E.',
                hint: 'The 3-second limit is the real test. You\'re jumping to random frets, not running a memorized lap — that\'s what "name any fret instantly" really means.',
                stuck: 'Put only frets 0–7 in the pile first; add 8–12 once you hit 10 in a row.',
                levelUp: 'Run the Shuffle on the A string too, or name a full lap going down the string (12 → 0) without counting.',
                skills: [2, 3]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Seven Nation Army, chart-free: play the riff on the low E string and say each note name out loud as you play it — B · B · D · B · A · G · F#. You\'ve got it when: one clean lap, no chart, every note named correctly. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
                hint: 'You played this riff in Module 1 with the TAB in front of you. Today the win is knowing WHERE you are — name it, then play it.',
                stuck: 'Do it in two halves: name-and-play B B D B, then A G F#. Join them once each half is automatic.',
                levelUp: 'Close your eyes for a lap, or play it one octave-position up starting at fret 7 of the A string.',
                skills: [2, 3],
                tab: {
                  caption: '"Seven Nation Army" — riff · Low E string · say each note name',
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
                response: { type: 'short', prompt: 'Chart-free lap — clean or not yet? What note still needs a look at the chart?', placeholder: 'e.g. clean! / still peeking at the G' }
              }
            ]
          },
          {
            title: 'My Practice Routine — weekly check-in (never graded)',
            steps: [
              {
                text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to update your routine: (1) one thing you want to get better at, (2) when and where you\'ll practice this week, (3) how last week\'s plan went. Same check-in as Module 1 — we keep it going for the whole course.',
                hint: 'No wrong answers — even five minutes a day beats one long cram. You\'re building a habit you\'ll actually keep.',
                response: { type: 'short', placeholder: '1) One thing to improve   2) When & where I\'ll practice   3) How last week went' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Which fret made you stop and count today? Write it below — that\'s your first thing to drill next time you practice.',
                response: { type: 'short', placeholder: 'e.g. A string fret 7 — I keep guessing D vs E' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Names all notes on E string (frets 0–12) · Names all notes on A string (frets 0–12) · Points to a named note on the fretboard · Reads a basic fretboard note chart · Identifies notes in a familiar song',
      performance: 'Self-quiz with shuffled note-name slips: draw a note, find it on the E or A string within 3 seconds. Then reverse it: draw a fret, name the note. 10 in a row each way.',
      selfCheck: 'Can you name every natural note on the E string without looking? Can you find any note on E or A within 3 seconds when a shuffled slip (or a friend) names it?',
      standards: ['Re.7a', 'Pr.4a']
    },

    skills: [
      { id: 'm2w1-s1', text: 'Recite the musical alphabet (A B C D E F G) from memory',
        gotItWhen: 'you can say A B C D E F G — and what comes after G — without pausing or looking at anything.',
        practice: { type: 'mc', prompt: 'What note comes after G?',
          choices: ['G#', 'A', 'A#', 'It starts over at C'], answer: 1 } },
      { id: 'm2w1-s2', text: 'Name all natural notes on the E string (frets 0–12)',
        gotItWhen: 'you can draw any fret 0–12 at random — shuffled slip, or someone calling it out — and say the low-E note name instantly, without counting up from E.',
        practice: { type: 'playSeq', label: 'Play E string 0–12', bpm: 60,
          notes: [40, 41, 43, 45, 47, 48, 50, 52] } },
      { id: 'm2w1-s3', text: 'Name all natural notes on the A string (frets 0–12)',
        gotItWhen: 'you can draw any fret 0–12 at random — shuffled slip, or someone calling it out — and say the A-string note name instantly, without counting up from A.',
        practice: { type: 'playSeq', label: 'Play A string 0–12', bpm: 60,
          notes: [45, 47, 48, 50, 52, 53, 55, 57] } },
      { id: 'm2w1-s4', text: 'Point to any named note on E or A string when called out',
        gotItWhen: 'you draw a note name from your shuffled slips (or someone calls one out) and you can put your finger on it within 3 seconds without looking at a chart.' },
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
    skillFocus: 'Fretting notes cleanly · Reading basic TAB · Playing a melody in time',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://youtu.be/XDt_4ha9Xjs" target="_blank">The Finger Gym: Strength & Dexterity (TE-001) – JustinGuitar</a> (0:00–4:00).',
                hint: 'Try each exercise slowly on your guitar as he demonstrates. Slow and clean beats fast and buzzy every time.',
                skills: [1, 2, 3],
                response: { type: 'short', placeholder: 'Which exercise felt hardest, and what do you think makes it hard?' }
              },
              {
                text: 'Watch: <a href="https://youtu.be/IscDj_-Nr0s" target="_blank">Finger Placement to Avoid Fret Buzz (BC-106) – JustinGuitar</a> (0:00–4:00).',
                hint: 'As he lists each cause, pause and test it on your own guitar — find your buzz before he names the fix.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'Which is the MOST common cause of fret buzz for beginners?',
                  answer: 0,
                  explain: 'Light or too-far-from-the-fret pressure can\'t fully close the string — the #1 beginner cause. A wrong pick, bad tuning, or low volume won\'t make a note buzz.',
                  choices: [
                  'Pressing the string too lightly, or too far from the fret',
                  'Using the wrong pick',
                  'The guitar being out of tune',
                  'Strumming too quietly'
                ] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/FofCWizp43Y" target="_blank">How to Read Guitar TAB – JustinGuitar</a> (0:00–4:00).',
                hint: 'Pause when he shows a TAB example. Find those notes on your guitar before hitting play.',
                skills: [4],
                response: { type: 'mc', prompt: 'On a TAB diagram, the TOP line represents which string?',
                  answer: 0,
                  explain: 'TAB lines mirror the strings by pitch: the TOP line is the thinnest, highest string (high e); the BOTTOM line is the low E.',
                  choices: [
                  'The high E (thinnest) string',
                  'The low E (thickest) string',
                  'The A string',
                  'It depends on the song'
                ] }
              }
            ]
          },
          {
            title: 'Practice TAB reading and clean notes',
            steps: [
              {
                text: 'Read this TAB: the opening of "Happy Birthday" written out on the low E string. Look at the fret numbers on the bottom line and try to play it. Click any note name below the TAB to hear how it should sound.',
                hint: 'Read left-to-right, one note per beat. The numbers tell you which fret to press on the low E string. See a # (sharp)? It just means one fret higher than the plain note — F# is one fret above F. We\'ll cover sharps and flats later. For now, just trust the fret numbers.',
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
                response: { type: 'mc', prompt: 'Where should your fingertip press to get the cleanest tone?',
                  answer: 0,
                  explain: 'Press just behind the fret (toward the nut) with your fingertip — close to the wire without sitting on it gives the cleanest, buzz-free note.',
                  choices: [
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
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — take a beat to reflect: what tripped you up most today — reading the TAB, or getting a clean note with no buzz? What felt easier than you expected?',
                response: { type: 'short', placeholder: 'e.g. reading TAB was fine, but fret 1 kept buzzing' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — melodies & TAB',
        sections: [
          {
            title: 'Press notes cleanly with no fret buzz',
            steps: [
          {
            text: 'Challenge 1 — Finger Workout: play frets 1–5 on the low E string, one finger per fret, then do the same on the A string. Keep your thumb behind the neck. You\'ve got it when: every note rings clean with no buzz.',
            hint: 'Go as slow as you need. Every note should ring cleanly with no buzz.',
            stuck: 'Use just frets 1–3 with three fingers first, then add the pinky on frets 4–5.',
            levelUp: 'Run the same 1-2-3-4 pattern starting at fret 5, where the stretches are smaller — notice the difference.',
            skills: [1, 2, 3, 6]
          },
          {
            text: 'Minimum-pressure drill: play frets 1–4 on the low E string one at a time. Press lightly until it buzzes, then add just enough to make it ring clean. That is your target pressure.',
            hint: 'Press just behind the fret, on your fingertip, thumb behind the neck. Most beginners press far too hard.',
            skills: [1, 2]
          },
          {
            text: 'One-finger-per-fret check: index=1, middle=2, ring=3, pinky=4 up the low E string. Every note rings — nothing buzzes or mutes. Click to hear the clean target tone.',
            hint: 'Keep unused fingers hovering close, ready to drop down.',
            skills: [2, 3],
            playSeq: { label: 'Target tone (frets 1–4)', bpm: 60, notes: [41, 42, 43, 44] }
          },
          {
            text: 'Quick check:',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'The note still buzzes even though you\'re pressing just behind the fret. What\'s the most likely cause?',
              answer: 0,
              explain: 'With good placement, buzz usually means too little pressure or a fingertip leaning over and deadening the string. Pressing harder isn\'t the fix — a vertical fingertip is.',
              choices: [
              'Too little pressure, or a fingertip leaning over and muting the string',
              'Pressing too hard on the string',
              'The string is too new',
              'Holding the pick too tightly'
            ] }
          }
            ]
          },
          {
            title: 'Read TAB & play a 4-bar melody in time at 60 BPM',
            steps: [
          {
            text: 'Warm-up read — play this melody straight from the TAB at 60 BPM, one note per beat. Click any note name to hear how it should sound.',
            hint: 'Read left-to-right. The numbers are fret numbers on the A string. If you buzz, fix the finger before moving on.',
            skills: [4, 5],
            tab: {
              caption: '"Mary Had a Little Lamb" — A string · frets 3–7 · 60 BPM',
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
          },
          {
            text: 'Challenge 2 — Play the Tune: using the TAB, play "Happy Birthday" on the E & A strings at 60 BPM, one note per beat. You\'ve got it when: the whole melody start to finish, in time, no buzz. Click any note name to hear how it should sound.',
            hint: 'If you buzz on a note, stop, fix your finger position, then continue. Don\'t just play through the buzz.',
            stuck: 'Play just the first phrase ("Hap-py birth-day to you") until it\'s smooth, then add the second.',
            levelUp: 'Play it through with no note names showing, or bump the metronome to 80 BPM.',
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
            text: 'Challenge 3 — Watchtower Bass Riff (your module assessment piece): using the TAB, play the "All Along the Watchtower" bass line on the low E string only — A · G · F · G, looping — one note per beat at 60 BPM. You\'ve got it when: the riff start to finish from memory, in time, with clean tone and correct fingering. Click any note name to hear how it should sound. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
            hint: 'Fingering: index on fret 1 (F), ring on fret 3 (G), pinky on fret 5 (A). Keep your thumb behind the neck. Let each note ring fully before the next. Drill it until you can run it with your eyes closed — then record yourself playing it: that\'s your module-end assessment piece.',
            stuck: 'Loop just F–G (frets 1–3) until the finger change is clean, then add the A on fret 5.',
            levelUp: 'Run the whole riff with your eyes closed — that\'s the real "from memory" test.',
            skills: [1, 2, 4, 5, 6],
            tab: {
              caption: '"All Along the Watchtower" — bass-note riff · Low E string · loops · 60 BPM',
              notes: [
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'E', fret: 1, note: 'F', midi: 41 },
                { string: 'E', fret: 3, note: 'G', midi: 43 }
              ]
            },
            response: { type: 'short', prompt: 'Personal record: once it loops clean at 60, raise the metronome +10 at a time. Your fastest CLEAN loop today (BPM)?', placeholder: 'e.g. 100 — beat it next session' }
          },
          {
            text: 'Bonus riff — "Sweet Child O\' Mine" (Guns N\' Roses) bass roots on the E & A strings: play the root note under each verse chord — D · C · G · D — one per bar at 60 BPM. Click any note name to hear how it should sound. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
            hint: 'These are the roots of the D–C–G verse loop. Heads up: the original recording is tuned a half-step lower, so your notes will sound slightly higher than the record — that\'s normal, not a mistake. The famous intro riff comes later in the course (Module 7 stretch goal!).',
            skills: [4, 5],
            tab: {
              caption: '"Sweet Child O\' Mine" — verse bass roots · E & A strings · 60 BPM',
              notes: [
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'E', fret: 3, note: 'G', midi: 43 },
                { string: 'A', fret: 5, note: 'D', midi: 50 }
              ]
            }
          },
          {
            text: 'Quick check on reading TAB:',
            skills: [4],
            response: { type: 'mc', prompt: 'In TAB the bottom line is the low E string and the line above it is the A string. A "3" on the A-string line is which note?',
              answer: 1,
              explain: 'From open A: A(0)–A#(1)–B(2)–C(3). A "3" on the A-string line is C.',
              choices: ['B', 'C', 'D', 'G'] }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Watchtower bass line: play the "All Along the Watchtower" bass loop on the low E string — A · G · F · G — one note per beat at 60 BPM, four laps without stopping. You\'ve got it when: four laps, every note landing on the click. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
                hint: 'Three notes carry this whole song. Keep your eyes one note ahead of your pick.',
                stuck: 'Loop just A → G until the shift is smooth, then add the F.',
                levelUp: 'Say each note name out loud while playing, or double the loop to eight laps without a stumble.',
                skills: [1, 2, 4, 5, 6],
                tab: {
                  caption: '"All Along the Watchtower" — bass loop · Low E string · 60 BPM',
                  notes: [
                    { string: 'E', fret: 5, note: 'A', midi: 45 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 },
                    { string: 'E', fret: 1, note: 'F', midi: 41 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 }
                  ]
                },
                response: { type: 'short', prompt: 'How many clean laps in a row did you get at 60 BPM?', placeholder: 'e.g. 4 — beat it next session' }
              },
              {
                text: 'Challenge — Seven Nation Army, true pitch: play the riff where the record actually lives — on the A string — E · E · G · E · D · C · B at 60 BPM. You\'ve got it when: two clean laps, and you can say which string version sounds like the recording. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
                hint: 'Same riff, new string, new note names. Notice how the shape of the moves feels the same even though every name changed.',
                stuck: 'Go back to your low-E version for one lap to remind your hand of the moves, then bring it up to the A string.',
                levelUp: 'Alternate laps: one on low E, one on the A string, without stopping between.',
                skills: [1, 2, 4, 5, 6],
                tab: {
                  caption: '"Seven Nation Army" — riff at true pitch · A string · 60 BPM',
                  notes: [
                    { string: 'A', fret: 7,  note: 'E', midi: 52 },
                    { string: 'A', fret: 7,  note: 'E', midi: 52 },
                    { string: 'A', fret: 10, note: 'G', midi: 55 },
                    { string: 'A', fret: 7,  note: 'E', midi: 52 },
                    { string: 'A', fret: 5,  note: 'D', midi: 50 },
                    { string: 'A', fret: 3,  note: 'C', midi: 48 },
                    { string: 'A', fret: 2,  note: 'B', midi: 47 }
                  ]
                },
                response: { type: 'short', prompt: 'Which version do you like playing more — low E or A string — and why?', placeholder: 'e.g. A string, it sounds like the song' }
              },
              {
                text: 'Challenge — "the cure," root line: play the roots of Olivia Rodrigo\'s "the cure" across both strings — A · C · D · F · G — two beats per note at 60 BPM. You\'ve got it when: two clean laps crossing between the A and E strings without looking down.',
                hint: 'This is the skeleton of the song — next unit these exact roots become power chords. Learn where they live now and Unit 3 is half done.',
                stuck: 'Split it by string: A · C · D on the A string first, then F · G on the low E, then join them.',
                levelUp: 'Play the lap with the play button keeping the beat, or say each note name as you land it. Got someone around? Have them clap the beat instead.',
                skills: [1, 2, 4, 5, 6],
                tab: {
                  caption: '"the cure" — root line (teaching arrangement, no capo) · 60 BPM',
                  notes: [
                    { string: 'A', fret: 0, note: 'A', midi: 45 },
                    { string: 'A', fret: 3, note: 'C', midi: 48 },
                    { string: 'A', fret: 5, note: 'D', midi: 50 },
                    { string: 'E', fret: 1, note: 'F', midi: 41 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 }
                  ]
                },
                response: { type: 'short', prompt: 'Which string crossing tripped you up — D down to F, or F up to G?', placeholder: 'e.g. D to F — big jump' }
              },
              {
                text: 'Challenge — Luna, bass roots: Luna rides two chords — F and Am — so its bassline is two notes. Play F (low E string, fret 1) and A (open A string) as single notes, two big beats each: the song is in 6/8, so feel the pulse in 2 and land each note on a downbeat. You\'ve got it when: four laps of F → A, both notes clean with no buzz, locked to the downbeats at 60 BPM. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
                hint: 'Fret 1 is the tightest squeeze on the neck — press right behind the fret wire with the tip of your index and the F will ring clean.',
                stuck: 'Park on just the F: pluck, listen, adjust, until five ring in a row. Then add the open A — that one\'s free.',
                levelUp: 'Trade the open A for fret 5 on the low E — same note, new position. The simplified requinto intro line is coming to this page soon.'
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Which part of your Watchtower assessment riff still needs work? Write it below — that\'s your warm-up target next time you practice.',
                response: { type: 'short', placeholder: 'e.g. the F-to-G change on frets 1 and 3 is shaky' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Module-end (two tasks): (1) Play the "All Along the Watchtower" bass-note line on the low E string from memory, to the metronome at 60 BPM, with clean tone and correct fingering — or the alternate single-note root line from "the cure." (2) Name notes on the E and A strings through fret 12, and sight-read a short 2-bar bass line from TAB.',
      performance: 'Self-check: record yourself playing the Watchtower low-E line from memory at 60 BPM, then sight-read and play a short 2-bar bass line from TAB. Listen back and name one thing to improve.',
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
      { id: 'm2w2-s4', text: 'Sight-read a basic 2-bar TAB line (strings, fret numbers, left-to-right order)',
        gotItWhen: 'you can look at a short TAB line you haven\'t drilled, identify which string and fret each number refers to, and play it — that\'s sight-reading.',
        practice: { type: 'mc',
          prompt: 'In TAB, the bottom line is the low E string and the line above it is the A string. If you see a "3" on the A-string line, which note do you play?',
          choices: ['B', 'C', 'D', 'G'], answer: 1 } },
      { id: 'm2w2-s5', text: 'Play a 4-bar melody in time at 60 BPM',
        gotItWhen: 'you can play the Happy Birthday phrase all the way through at 60 BPM without stopping to find a note.' },
      { id: 'm2w2-s6', text: 'Keep thumb behind the neck throughout',
        gotItWhen: 'your thumb stays roughly behind your middle finger on the back of the neck — not hooked over the top.' }
    ]
  }

); // end module-2.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[2] = [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Play bass-note riff on low E string from memory', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'E string TAB — great first riff', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'Listen ahead — our Latin core song; you play its bass roots this module', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Play verse bass roots on E & A strings · intro riff = Module 7 stretch goal', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Play the bassline as single-note roots (capo 1 · Am–C–Dm–F–G/B)', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Happy Birthday"', meta: 'Play full melody on E & A strings from TAB', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Smoke on the Water" — Deep Purple', meta: 'E string TAB — iconic beginner riff', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=Q2FzZSBD5LE',
        tutorialUrl: 'https://www.youtube.com/watch?v=QkT5yLP5VQA' },
      { name: '"La Bamba" — Ritchie Valens', meta: 'Iconic single-note intro riff · C–F–G roots', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=BycLmWI97Nc',
        tutorialUrl: 'https://www.youtube.com/watch?v=o-SdTXIAvTE' },
      { name: '"Come As You Are" — Nirvana', meta: 'Partial riff on A string', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=vabnZ9-ex7o',
        tutorialUrl: 'https://www.youtube.com/watch?v=G14kHAijVHM' },
      { name: '"Crazy Train" — Ozzy Osbourne', meta: 'Intro notes on E string', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=FVovq9TGBw0',
        tutorialUrl: 'https://www.youtube.com/watch?v=JoL3YrtcwuQ' },
      { name: '"Beat It" — Michael Jackson', meta: 'Intro riff on E string', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=oRdxUFDoQe0',
        tutorialUrl: 'https://www.youtube.com/watch?v=B5M5tVc7XZA' }
    ];

MODULE_REVIEWS[2] = {
  moduleNum: 2,
  module: 'Notes on the E & A Strings',
  skills: [
    { id: 'mr2-s1', text: 'I can recite the musical alphabet (A–G) from memory, including what comes after G', set: 'm2w1' },
    { id: 'mr2-s2', text: 'I can name all natural notes on the E string (frets 0–12)', set: 'm2w1' },
    { id: 'mr2-s3', text: 'I can name all natural notes on the A string (frets 0–12)', set: 'm2w1' },
    { id: 'mr2-s4', text: 'I can press notes cleanly with no fret buzz', set: 'm2w2' },
    { id: 'mr2-s6', text: 'I can use one finger per fret (index=1, middle=2, ring=3, pinky=4)', set: 'm2w2' },
    { id: 'mr2-s5', text: 'I can read a basic TAB and play a 4-bar melody in time at 60 BPM', set: 'm2w2' }
  ],
  assessItems: [
    'Name the notes on the E and A strings from memory through fret 12',
    'Play “All Along the Watchtower” bass-note line using only the E string — or the single-note root line from “the cure” — from memory, to the metronome at 60 BPM without stopping, with clean tone and correct fingering (one finger per fret, thumb behind the neck)',
    'Sight-read a short 2-bar bass line from TAB and play it'
  ],
  forward: 'The E &amp; A notes you just learned become the <strong>roots of every power chord in Module 3</strong> — when you play an A5 or G5, you\'re landing on the exact frets you just memorized. Knowing the fretboard is what lets you move chords around freely.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a', 'Re.7a']
};
