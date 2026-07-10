// ============================================================
//  MODULE 9 — The Full Fretboard & Writing TAB
//  Edit this file to change Module 9 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm9w1',
    label: 'Set 1',
    locked: false,
    module: 'The Full Fretboard & Writing TAB',
    moduleNum: 9,
    unit: 'Module 9 · The Full Fretboard & Writing TAB',
    title: 'Set 1',
    subtitle: 'Notes on D & G · The octave shortcut · Sharps & flats',
    objective: 'I CAN name the natural notes on the D and G strings through fret 12 and find any named note on them.',
    skillFocus: 'Natural notes on D (0–12) · Natural notes on G (0–12) · The two-string octave shape',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://youtu.be/WQ8DSYD2kvw" target="_blank">Learn Every Note on the Fretboard (Start With This Simple System) – Marty Music</a> (0:00–6:00). Follow along on your own guitar as he walks the D and G strings.',
                hint: 'Marty builds the fretboard the same way you already know the E and A strings from Module 2 — natural notes, then the sharps and flats that sit between them.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'The D string at fret 2 is which note?',
                  answer: 1,
                  explain: 'D to E is a whole step — two frets — with D# sitting at fret 1 between them.',
                  choices: ['D#', 'E', 'F', 'C'] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/Abrd0c92xRE" target="_blank">Open Notes On The Guitar | Practical Beginner Lesson – JustinGuitar</a> as a refresher on the open strings, then apply the same idea moving up the D and G strings fret by fret.',
                hint: 'Refresh how each open string got its name in Module 1 — the exact same logic just keeps climbing the neck one fret at a time.',
                skills: [2, 3],
                response: { type: 'mc', prompt: 'On the G string, C sits at which fret?',
                  answer: 2,
                  explain: 'G(0) → A(2) → B(4) → C(5). B to C is a half step, so C is only one fret above B.',
                  choices: ['3', '4', '5', '7'] }
              }
            ]
          },
          {
            title: 'Listen for the note names',
            steps: [
              {
                text: 'Listen for it: play up the D string one fret at a time, saying each note name OUT LOUD before you check a chart. Then do the same up the G string. Notice where you hesitate — that\'s tonight\'s target.',
                hint: 'Naming a note before you check it (not after) is what actually builds the recall — reading a chart at the same time you say the name just trains you to read the chart.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'You know A is at fret 5 on the low E string. Using the octave shape — two strings down, two frets up — where\'s the next A?',
                  answer: 0,
                  explain: 'From the low E or A string, the octave lives two strings toward the floor and two frets toward the body.',
                  choices: ['D string, fret 7', 'G string, fret 5', 'D string, fret 5', 'A string, fret 7'] }
              }
            ]
          },
          {
            title: 'Try naming from anywhere on the neck',
            steps: [
              {
                text: 'Now try it: starting from any note you already know on the low E or A string, use the octave shape (two strings down, two frets up) to find its twin on the D or G string. Try it from three different starting notes.',
                hint: 'This is the whole point of the octave shape — it turns one memorized note into a second one for free, anywhere on the neck.',
                skills: [4],
                response: { type: 'mc', prompt: 'Which two natural notes have NO sharp or flat between them?',
                  answer: 1,
                  explain: 'B–C and E–F are the two natural half steps — one fret apart, nothing in between.',
                  choices: ['A and B', 'B and C', 'C and D', 'F and G'] }
              },
              {
                text: 'Try the top of the neck: play fret 12 on the D string, then fret 12 on the G string. Say what you notice about fret 12 compared to the open string.',
                hint: 'Fret 12 is the octave marker on every string — look for the double-dot inlay as your landmark.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'The D string at fret 12 is which note?',
                  answer: 1,
                  explain: 'Fret 12 is always the octave — the same note as the open string, one octave higher.',
                  choices: ['C', 'D', 'E', 'D#'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — which string\'s notes stuck faster today, D or G, and what trick helped?',
                response: { type: 'short', placeholder: 'e.g. G was easier — only 3 naturals to fret 5; the octave shape helped me check myself' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — the D and G strings',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every class the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Every note-naming drill today depends on your strings actually being in tune — check first.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Say-then-play the D and G strings',
            steps: [
              {
                text: 'Challenge 1 — D-String Naturals: say-then-play every natural note on the D string, low to high, 0 through 12. You\'ve got it when: naming them takes under 15 seconds with no chart.',
                hint: 'Say the note name first, THEN play it — that order is what builds the recall.',
                stuck: 'Cover frets 0–5 (D–A) first, get those solid, then add 7–12.',
                levelUp: 'Say-then-play backwards, high to low.',
                skills: [1],
                playSeq: { label: 'D-string naturals, low to high', bpm: 60, notes: [50, 52, 53, 55, 57, 59, 60, 62] }
              },
              {
                text: 'Challenge 2 — G-String Naturals: same drill on the G string, low to high, 0 through 12.',
                hint: 'G has fewer natural notes below fret 5 than D does — notice the pattern shift.',
                stuck: 'Cover frets 0–5 (G–C) first, then add 5–12.',
                levelUp: 'Race a partner — first to name a random fret correctly three times in a row wins.',
                skills: [2],
                playSeq: { label: 'G-string naturals, low to high', bpm: 60, notes: [55, 57, 59, 60, 62, 64, 65, 67] }
              }
            ]
          },
          {
            title: 'Partner flash-drill',
            steps: [
              {
                text: 'Challenge 3 — Flash Drill (your assessment piece): partner up. One of you names a note, the other finds it on the D or G string within 5 seconds. Switch roles every 5 rounds. You\'ve got it when: 8 out of 10 correct within 5 seconds each, on both strings.',
                hint: 'If you\'re stuck, use the octave shape from a string you already know instead of counting up one fret at a time.',
                stuck: 'Allow 10 seconds instead of 5 until it\'s automatic, then tighten the clock back up.',
                levelUp: 'Call out sharps and flats too (F#, Bb), or drop to a 3-second limit.',
                skills: [3, 4]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Sweet Child O\' Mine, name it as you play it: watch the intro-riff clip you first saw in Module 7 (<a href="https://youtu.be/t3yol_zrt7g" target="_blank">How to Play the Intro for Sweet Child O\' Mine – JustinGuitar</a>) and learn just its first two notes, up on the D and G strings around fret 12–15. Say each note\'s NAME as you play it, using today\'s D/G-string knowledge to figure it out instead of just copying frets. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Song Journey: this song\'s Journey page</a>.',
                hint: 'This riff lives up the neck on strings you\'ve never named notes on before today — that\'s exactly why it\'s the payoff for this set.',
                stuck: 'Pause the video on the very first note and just name that one string/fret before moving on.',
                levelUp: 'Name all four notes of the opening phrase before you play them, then check yourself against the video.',
                skills: [5]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Which fret on D or G still makes you pause and count? Write it below — that\'s your warm-up target next time.',
                response: { type: 'short', placeholder: 'e.g. fret 9 on the G string — I still count up from the fret-7 dot' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Names naturals on D & G through fret 12 · Finds a named note within 5 seconds · Uses the octave shape as a shortcut',
      performance: 'Teacher calls out four notes; students find each on the D or G string within 5 seconds while a partner checks.',
      selfCheck: 'Can you find C on the G string without counting up from open? Can you name the note two strings down and two frets up from any E-string note you know?',
      standards: ['Pr.4a', 'Pr.6a']
    },

    skills: [
      { id: 'm9w1-s1', text: 'Name the natural notes on the D string, frets 0–12, in order',
        gotItWhen: 'naming them takes under 15 seconds with no chart',
        practice: { type: 'playSeq', label: 'D-string naturals, low to high', bpm: 60, notes: [50, 52, 53, 55, 57, 59, 60, 62] } },
      { id: 'm9w1-s2', text: 'Name the natural notes on the G string, frets 0–12, in order',
        practice: { type: 'playSeq', label: 'G-string naturals, low to high', bpm: 60, notes: [55, 57, 59, 60, 62, 64, 65, 67] } },
      { id: 'm9w1-s3', text: 'Find a teacher-named note on the D or G string within 5 seconds',
        practice: { type: 'mc', prompt: 'On the D string, G is at which fret?', choices: ['3', '5', '7', '9'], answer: 1 } },
      { id: 'm9w1-s4', text: 'Use the octave shape to find a D- or G-string note from an E- or A-string note I already know',
        practice: { type: 'mc', prompt: 'The octave shape from the low E and A strings moves you:',
          choices: ['Two strings down, two frets up', 'Two strings down, same fret', 'One string down, two frets up', 'Two strings down, three frets up'], answer: 0 } },
      { id: 'm9w1-s5', text: 'Play the Sweet Child O\' Mine intro fragment on the D and G strings from TAB' },
      { id: 'm9w1-s6', text: 'Say which two natural notes any sharp or flat on D or G sits between',
        practice: { type: 'mc', prompt: 'F# on the D string sits at which fret?', choices: ['3', '4', '5', '2'], answer: 1 } }
    ]
  },

  {
    id: 'm9w2',
    label: 'Set 2',
    locked: false,
    module: 'The Full Fretboard & Writing TAB',
    moduleNum: 9,
    unit: 'Module 9 · The Full Fretboard & Writing TAB',
    title: 'Set 2',
    subtitle: 'Notes on B & e · The B-string bump · The whole neck',
    objective: 'I CAN name the natural notes on all six strings and locate any named note anywhere on the neck.',
    skillFocus: 'Naturals on B (0–12) · Naturals on high e (they mirror low E) · The 3-fret octave shift onto B & e',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://youtu.be/WQ8DSYD2kvw" target="_blank">Learn Every Note on the Fretboard (Start With This Simple System) – Marty Music</a> (6:00–end), finishing the fretboard on the B and high-e strings.',
                hint: 'Notice the B string breaks the pattern you learned last set — it\'s tuned a half-step "early," which shifts every shape crossing onto it.',
                skills: [1, 2],
                response: { type: 'mc', prompt: 'The high e string\'s notes are the same as which other string?',
                  answer: 1,
                  explain: 'Both E strings are tuned to E — same note names at every fret, two octaves apart.',
                  choices: ['The B string', 'The low E string', 'The G string', 'No other string'] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/wElX3v3POWU" target="_blank">Finding Notes On The Guitar Neck Using Octaves – JustinGuitar</a>. Pay close attention to what changes when the shape crosses onto the B string — that\'s today\'s 3-fret bump.',
                hint: 'Every octave shape you\'ve used so far has been "two strings down, two frets up." Crossing onto B (or e) adds one extra fret — watch for it in the video.',
                skills: [4],
                response: { type: 'mc', prompt: 'The octave shape coming FROM the D or G string onto the B or e string moves:',
                  answer: 1,
                  explain: 'The B string is tuned a step "early," so every shape crossing onto B (or e) stretches one extra fret — the B-string bump.',
                  choices: ['Two strings down, two frets up', 'Two strings down, three frets up', 'Two strings down, same fret', 'One string down, three frets up'] }
              }
            ]
          },
          {
            title: 'Listen for the six-string landmarks',
            steps: [
              {
                text: 'Listen for it: play the dot-fret landmarks (3, 5, 7, 9, 12) across all six strings and say each note out loud before checking a chart. These five frets are your fastest shortcuts anywhere on the neck.',
                hint: 'You already know these dots as fretting landmarks — today you\'re also learning what they\'re called on every string.',
                skills: [6],
                response: { type: 'mc', prompt: 'On the B string, C sits at which fret?',
                  answer: 0,
                  explain: 'B to C is a natural half step — one fret.',
                  choices: ['1', '2', '3', '5'] }
              }
            ]
          },
          {
            title: 'Try the whole fretboard',
            steps: [
              {
                text: 'Now try it: pick any note name and find it on all six strings, one string at a time, using the octave shape (remembering the B-string bump) rather than counting from open every time.',
                hint: 'This is the moment the whole fretboard "clicks" — one note, six places to find it.',
                skills: [3, 4],
                response: { type: 'mc', prompt: 'The B string at fret 5 is the same pitch as which open string?',
                  answer: 2,
                  explain: 'B(0)→C(1)→D(3)→E(5). B at fret 5 = E, the open high-e — that\'s exactly how you tune by ear.',
                  choices: ['G', 'D', 'High e', 'A'] }
              },
              {
                text: 'Try the dot at fret 7 on every string — name each note before checking. Dot frets are the fastest landmarks on the whole neck.',
                hint: 'You already used fret 7 to tune by ear (5th-fret/7th-fret method) — now you\'re naming what\'s there.',
                skills: [6],
                response: { type: 'mc', prompt: 'At the dot on fret 7, the low E string plays:',
                  answer: 1,
                  explain: 'E→F(1)→G(3)→A(5)→B(7). Dot frets (3-5-7-9-12) are your landmarks.',
                  choices: ['A', 'B', 'C', 'G'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — where on the neck are you still slowest? Name the string and fret zone.',
                response: { type: 'short', placeholder: 'e.g. B string frets 6–10 — I still count up from fret 5' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — the whole fretboard',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every class the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Say-then-play the B and high-e strings',
            steps: [
              {
                text: 'Challenge 1 — B-String Naturals: say-then-play every natural note on the B string, low to high, 0 through 12.',
                hint: 'Remember: B to C is only ONE fret, not two — the exception to the pattern you learned on D and G.',
                stuck: 'Cover frets 0–5 (B–E) first, then add 5–12.',
                levelUp: 'Say-then-play backwards, high to low, without slowing down.',
                skills: [1],
                playSeq: { label: 'B-string naturals', bpm: 60, notes: [59, 60, 62, 64, 65, 67, 69, 71] }
              },
              {
                text: 'Challenge 2 — High-e Naturals: same drill on the high e string, low to high, 0 through 12 — and notice these are the exact same note names as the low E string.',
                hint: 'If you know the low E string from Module 2, you already know this string — just two octaves higher.',
                stuck: 'Say the low-E note names first, then transfer them to the high e string fret by fret.',
                levelUp: 'Race a partner naming random frets on the high e string.',
                skills: [2],
                playSeq: { label: 'High-e naturals', bpm: 60, notes: [64, 65, 67, 69, 71, 72, 74, 76] }
              }
            ]
          },
          {
            title: 'Six-string landmark drill',
            steps: [
              {
                text: 'Challenge 3 — Landmark Drill (your assessment piece): name every string at the fret-5 dot, then every string at the fret-7 dot. You\'ve got it when: all six strings named correctly at both dots, no chart, within 5 seconds each.',
                hint: 'Dots are the fastest way to orient yourself anywhere on the neck — this drill is worth over-practicing.',
                stuck: 'Do the fret-5 dot on all six strings first until it\'s solid, then add fret 7.',
                levelUp: 'Add the fret-9 and fret-12 dots, or have a partner call random dot frets for you to name across all six strings.',
                skills: [3, 6]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Luna, the punteo line: play the fingerpicked intro fragment crossing three strings, reading Layer 6 TAB from <a href="tabs/luna.html#layer-6" target="_blank">Luna\'s Song Journey page</a> (the bonus requinto-intro layer). You\'ve got it when: all four notes ring cleanly in order, and you can name each one as you play it.',
                hint: 'This roll uses the little-F shape you already know from Module 5 — today\'s new skill is being able to name every note in it.',
                stuck: 'Fret the little F shape first, strum it once to hear the target chord, then break it apart one string at a time.',
                levelUp: 'Name each note out loud as you roll through it, or drop it in front of the Layer 5 vamp as a real intro.',
                skills: [5]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Six strings, fully named — what\'s your fastest way to find a note now: counting up, or the octave shape? Write it below.',
                response: { type: 'short', placeholder: 'e.g. octave shape, every time — counting up from open is too slow now' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Names naturals on all six strings · Locates any named note on the neck · Plays a melody crossing 3+ strings cleanly',
      performance: 'Teacher names one note (e.g., "find every C below fret 12") — students mark them across all six strings, partner-checked.',
      selfCheck: 'Can you name all six strings at the 5th-fret dot? Can you find B on three different strings?',
      standards: ['Pr.4a', 'Pr.6a']
    },

    skills: [
      { id: 'm9w2-s1', text: 'Name the natural notes on the B string, frets 0–12, in order',
        practice: { type: 'playSeq', label: 'B-string naturals', bpm: 60, notes: [59, 60, 62, 64, 65, 67, 69, 71] } },
      { id: 'm9w2-s2', text: 'Name the natural notes on the high e string and explain why they match the low E',
        practice: { type: 'mc', prompt: 'Why do the two E strings share the same note names?',
          choices: ['They\'re the two thickest strings', 'They\'re both tuned to E, two octaves apart', 'It\'s a coincidence', 'They don\'t — they\'re different'], answer: 1 } },
      { id: 'm9w2-s3', text: 'Locate any teacher-named natural note on any of the six strings' },
      { id: 'm9w2-s4', text: 'Use the 3-fret octave shift when crossing onto the B or high-e string',
        practice: { type: 'mc', prompt: 'You know G at D-string fret 5. Its octave on the B string is at fret:',
          choices: ['5', '7', '8', '10'], answer: 2 } },
      { id: 'm9w2-s5', text: 'Play a melody that crosses three or more strings cleanly (Luna intro fragment)' },
      { id: 'm9w2-s6', text: 'Name the note at any dot fret (3, 5, 7, 9, 12) on all six strings',
        practice: { type: 'mc', prompt: 'At fret 3, the A string plays:', choices: ['B', 'C', 'C#', 'D'], answer: 1 } }
    ]
  },

  {
    id: 'm9w3',
    label: 'Set 3',
    locked: false,
    module: 'The Full Fretboard & Writing TAB',
    moduleNum: 9,
    unit: 'Module 9 · The Full Fretboard & Writing TAB',
    title: 'Set 3',
    subtitle: 'Higher-position TAB · Write your own 4 bars · Slash chords & partial shapes',
    objective: 'I CAN read TAB in higher positions and write an accurate 4-bar TAB of a riff I already play.',
    skillFocus: 'Reading TAB above fret 5 · Writing TAB others can play · Slash chords (G/B) & partial-shape charts',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://youtu.be/FofCWizp43Y" target="_blank">How to read guitar TAB for beginners – JustinGuitar</a> (0:00–4:00) as a refresher, paying attention to how string order and chord stacks are shown.',
                hint: 'You met TAB reading back in Module 2 — today\'s new ground is reading it confidently ABOVE fret 5, and writing your own.',
                skills: [1],
                response: { type: 'mc', prompt: 'In TAB, the TOP line represents:',
                  answer: 1,
                  explain: 'TAB mirrors the guitar as you look down at it — thinnest string on top. It\'s the #1 rookie reading mistake.',
                  choices: ['The low E string (thickest)', 'The high e string (thinnest)', 'Whichever string you like', 'The B string'] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/AjwEjsh3QQw" target="_blank">Writing TABs – JustinGuitar</a>. This is the reverse skill of reading TAB — watch how he turns a riff he can already play into TAB someone else could read.',
                hint: 'Writing TAB is the reverse skill of reading it — the video models the process before you try it yourself at Station C.',
                skills: [2, 3],
                response: { type: 'mc', prompt: 'Two numbers stacked in the same column of TAB mean:',
                  answer: 1,
                  explain: 'A vertical stack is a chord — everything in the column sounds together.',
                  choices: ['Play them one after another', 'Play them at the same time', 'Choose one to play', 'Play the top one twice'] }
              }
            ]
          },
          {
            title: 'Listen for chords hiding in the TAB',
            steps: [
              {
                text: 'Listen for it: as you read through a TAB\'d riff, notice where single notes stack into a chord (a vertical column) versus where they stay a single melodic line.',
                hint: 'Spotting the difference between a melody line and a stacked chord in TAB is what lets you read faster.',
                skills: [1],
                response: { type: 'mc', prompt: 'A "12" written on the thinnest TAB line tells you to play:',
                  answer: 1,
                  explain: 'Numbers are FRETS, lines are STRINGS — fret 12, high-e string.',
                  choices: ['Fret 12 on the low E', 'Fret 12 on the high e', 'String 12', 'The 12th chord'] }
              }
            ]
          },
          {
            title: 'Try reading a slash chord',
            steps: [
              {
                text: 'Now try it: look up a chord chart for G/B and figure out, before checking, which note has to be the LOWEST one you strum.',
                hint: 'Read the slash like a fraction: chord name first, bass note second.',
                skills: [4],
                response: { type: 'mc', prompt: 'The chord G/B (say "G over B") means:',
                  answer: 1,
                  explain: 'Slash chords name the chord, then the bass note — you met G/B inside "the cure"\'s progression.',
                  choices: ['Play G, then B', 'A G chord with B as its lowest note', 'A B chord with G on top', 'Either G or B'] }
              },
              {
                text: 'Try spacing a few numbers on paper the way you would in written TAB, then check: could someone else tell the rhythm from your spacing alone?',
                hint: 'Cramped numbers are the single most common reason a hand-written TAB is unplayable for anyone but the person who wrote it.',
                skills: [3],
                response: { type: 'mc', prompt: 'When you write your own TAB, the most important thing to keep readable is:',
                  answer: 1,
                  explain: 'Spacing IS the rhythm in TAB — cramped numbers make your riff unplayable for anyone else.',
                  choices: ['Fancy handwriting', 'Even spacing that shows the rhythm', 'Using pen, not pencil', 'Writing the song title'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — what was hardest about writing TAB: finding the frets, or spacing the rhythm?',
                response: { type: 'short', placeholder: 'e.g. I knew the frets but my spacing squished bar 3' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — reading, writing, and swapping TAB',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every class the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Read a higher-position TAB',
            steps: [
              {
                text: 'Challenge 1 — Read It Up High: read and play the little-F Layer 6 intro TAB from <a href="tabs/luna.html#layer-6" target="_blank">Luna\'s Song Journey page</a> — it lives around the little-F shape (D3, G2, B1, open e). You\'ve got it when: you can read it cold, no one walking you through it first.',
                hint: 'Reading TAB up the neck feels harder mostly because the numbers are less familiar, not because it\'s actually different from reading it low.',
                stuck: 'Fret the little F shape and strum it once to hear the target chord before reading the roll note by note.',
                levelUp: 'Read a second higher-position TAB you haven\'t seen before today, cold.',
                skills: [1]
              }
            ]
          },
          {
            title: 'Write your own TAB from memory',
            steps: [
              {
                text: 'Challenge 2 — Write It (your assessment piece): without looking anything up, write the "Seven Nation Army" riff to blank TAB on paper from memory — you played it chart-free back in Module 2. Then check yourself. You\'ve got it when: a partner can play your TAB back correctly without ever hearing you play it first.',
                hint: 'Say each note name in your head as you write its fret — that\'s the same habit that made you fast at naming notes all module.',
                stuck: 'Play the riff on your guitar first, one note at a time, writing down each fret as you go — then copy it clean.',
                levelUp: 'Write a second 4-bar riff of your choice from memory, or write the riff transposed to a different starting fret.',
                skills: [2, 3]
              }
            ]
          },
          {
            title: 'Read a slash chord and a partial shape',
            steps: [
              {
                text: 'Challenge 3 — Slash Chord: fret and play G/B, then compare it against a standard open G. Notice what changes and what stays the same.',
                hint: 'The chord shape barely changes — it\'s the LOWEST note you strum that makes it a slash chord.',
                stuck: 'Play the open G first, then just move your lowest-string finger to find the B.',
                levelUp: 'Walk C → G/B → Am as a smooth bass-line move, the way "the cure" does it.',
                skills: [4],
                chords: [
                  { name: 'G/B', chord: [[6,'x'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'G', chord: [[6,3,'3'],[5,2,'2'],[4,0],[3,0],[2,0],[1,3,'4']], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Partner TAB swap',
            steps: [
              {
                text: 'Challenge 4 — Swap It: trade your written TAB from Challenge 2 with a partner and play each other\'s TAB exactly as written, no explanation allowed. You\'ve got it when: you can play your partner\'s TAB on the first try.',
                hint: 'This is the real test of whether your spacing and fret numbers were actually readable — not just correct to you.',
                stuck: 'If a partner\'s TAB is unreadable, ask them to just say the fret numbers out loud while you follow along on the page.',
                levelUp: 'Swap with a second partner and try a fresh TAB cold.',
                skills: [6]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Could a stranger play your TAB without hearing the song first? Write below what you\'d change about your spacing next time.',
                response: { type: 'short', placeholder: 'e.g. yes — but I\'d leave more room around the chord stack in bar 2' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Reads TAB above fret 5 · Writes a playable 4-bar TAB · Reads a slash chord from a chart',
      performance: 'TAB swap: each student plays a partner\'s hand-written TAB cold. If the partner can play it, the TAB passes.',
      selfCheck: 'Could a stranger play your TAB without hearing the song first? Can you explain what G/B means in one sentence?',
      standards: ['Pr.4a', 'Pr.6a', 'Cn.10a']
    },

    skills: [
      { id: 'm9w3-s1', text: 'Read and play a TAB phrase written above fret 5' },
      { id: 'm9w3-s2', text: 'Write an accurate 4-bar TAB of a riff I can already play',
        gotItWhen: 'a partner plays your TAB back correctly without ever hearing you play it first.' },
      { id: 'm9w3-s3', text: 'Space my TAB so the rhythm is readable',
        practice: { type: 'mc', prompt: 'In hand-written TAB, rhythm is shown mainly by:',
          choices: ['Note-head shapes', 'The spacing between numbers', 'Color coding', 'It can\'t be shown'], answer: 1 } },
      { id: 'm9w3-s4', text: 'Read a slash chord (like G/B) from a chart and play it',
        practice: { type: 'mc', prompt: 'In C/G, the lowest note you play is:', choices: ['C', 'E', 'G', 'B'], answer: 2 } },
      { id: 'm9w3-s5', text: 'Read a partial chord shape (X marks and small grids) from a chart',
        practice: { type: 'mc', prompt: 'An X above a string on a chord chart means:',
          choices: ['Play it open', 'Don\'t play that string', 'Bend that string', 'Play it twice'], answer: 1 } },
      { id: 'm9w3-s6', text: 'Play a partner\'s hand-written TAB back correctly' }
    ]
  }

); // end module-9.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[9] = [
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Map the intro up the neck — D & G strings', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'Punteo line crossing three strings', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Write the riff out as TAB yourself', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Beat It" — Michael Jackson', meta: 'Riff notes across E, A & D — map them', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=oRdxUFDoQe0',
        tutorialUrl: 'https://www.youtube.com/watch?v=B5M5tVc7XZA' },
      { name: '"Just Like Heaven" — The Cure', meta: 'Arpeggiated riff — read it up the neck', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=n3nPiBai66M',
        tutorialUrl: 'https://www.youtube.com/watch?v=fEgsKS_IcQA' },
      { name: '"Smoke on the Water" — Deep Purple', meta: 'Write its riff as TAB — level 2', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=Q2FzZSBD5LE',
        tutorialUrl: 'https://www.youtube.com/watch?v=QkT5yLP5VQA' }
    ];

MODULE_REVIEWS[9] = {
  moduleNum: 9,
  module: 'The Full Fretboard & Writing TAB',
  skills: [
    { id: 'mr9-s1', text: 'I can name every natural note on the D and G strings through fret 12', set: 'm9w1' },
    { id: 'mr9-s2', text: 'I can use the octave shape to find a note on a new string from one I already know', set: 'm9w1' },
    { id: 'mr9-s3', text: 'I can locate any named note anywhere on the neck, on any of the six strings', set: 'm9w2' },
    { id: 'mr9-s4', text: 'I can name the note at any dot-fret landmark (3, 5, 7, 9, 12) on all six strings', set: 'm9w2' },
    { id: 'mr9-s5', text: 'I can read a TAB phrase written above fret 5 without help', set: 'm9w3' },
    { id: 'mr9-s6', text: 'I can write an accurate 4-bar TAB of a riff I already play, that a partner can play back', set: 'm9w3' }
  ],
  assessItems: [
    'Name natural notes on all six strings through fret 12 — teacher picks the spots',
    'Play a thread-song melody from TAB in a higher position',
    'Hand in a 4-bar TAB you wrote yourself that a partner can play back'
  ],
  forward: 'The whole neck is yours now — and you can write down anything you figure out. <strong>Module 10 turns notes into keys:</strong> you\'ll learn the recipe that builds every scale, find the key of any song, and start trusting your ear.',
  standards: ['Pr.4a', 'Pr.6a', 'Cn.10a']
};
