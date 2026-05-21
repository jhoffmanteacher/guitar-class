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
    skillFocus: 'Chord diagram anatomy (dots, finger numbers, X and O) · Chord chart vs TAB · Am and Em shapes · Simple down-strum: 4 strums per bar',
    handoutUrl: 'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/hzC0orOGARw" target="_blank">How to Read Chord Diagrams – JustinGuitar</a> (full video).',
            hint: 'Pause when he shows a diagram and look at it yourself. What does the X mean? What does the O mean? What do the numbers in the dots tell you?',
            skills: [1, 2]
          },
          {
            text: 'Watch: <a href="https://youtu.be/JBKIamtI_Qc" target="_blank">Your First Chords Am and Em – Marty Music</a> (0:00–5:00).',
            hint: 'Try placing your fingers as he shows Am, then strum it before watching more. Does every string ring? If not, check which finger is accidentally muting a string.',
            skills: [3, 4]
          },
          {
            text: 'Watch: <a href="https://youtu.be/47FXbQFd5ng" target="_blank">Open Chord Shapes – Simen Otnes</a> (0:00–3:00).',
            hint: 'Focus on how relaxed his fretting hand looks. Tension is the enemy of clean chord tone. Breathe and let your arm weight do the work.',
            skills: [3, 4]
          }
        ]
      },
      c: {
        title: 'Practice station — chord shapes & first strums',
        time: '12 min',
        steps: [
          {
            text: 'Fret Am: index finger on string 2 fret 1, middle on string 4 fret 2, ring on string 3 fret 2. Strum strings 1–5 (not the low E). Every string should ring cleanly.',
            hint: 'Press just behind the frets, not on them. Curve your fingers so they don\'t accidentally touch neighboring strings. Check each string individually by plucking it.',
            skills: [3, 5]
          },
          {
            text: 'Fret Em: middle finger on string 5 fret 2, ring finger on string 4 fret 2. Strum all 6 strings. Notice how much easier this one is — that\'s intentional!',
            hint: 'Em is the easiest chord on guitar. Use it to warm up before harder chords. It should sound full and open.',
            skills: [4, 5]
          },
          {
            text: 'Strum Am: 4 down-strums per bar, counting "1 2 3 4." Set metronome to 60 BPM. Do 2 bars of Am, then 2 bars of Em. Repeat. Focus on landing strums on the beat.',
            hint: 'Even if the chord isn\'t perfect, keep strumming in time. Stopping to fix a note is the #1 habit to avoid. Fix it between bars, not mid-bar.',
            skills: [5, 6]
          }
        ]
      }
    },

    songs: [
      { name: '"Happy Birthday"', meta: 'Read chord diagrams for C–G–Am chord version', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Verse: C–G–Am–F · Read from chord chart', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am–G–F–G · Read from chord chart', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Horse with No Name" — America', meta: 'Em–D6add9 — only 2 chords, great starter', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=2OTc4ZOsSSI',
        tutorialUrl: 'https://www.youtube.com/watch?v=Mwh9WILLlM0' },
      { name: '"Knockin\' on Heaven\'s Door" — Dylan', meta: 'G–D–Am — simple and beautiful', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=rm9coqlk8fY',
        tutorialUrl: 'https://www.youtube.com/watch?v=pWIL4N6QZ-Y' },
      { name: '"Stand By Me" — Ben E. King', meta: 'G–Em–C–D — classic 4-chord song', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=hwZNL7QVJjE',
        tutorialUrl: 'https://www.youtube.com/watch?v=TXLElO_YYiY' },
      { name: '"Brown Eyed Girl" — Van Morrison', meta: 'G–C–G–D · strum practice', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=UfmkgQRmmeE',
        tutorialUrl: 'https://www.youtube.com/watch?v=v-EGJOz-Mek' },
      { name: '"What\'s Up" — 4 Non Blondes', meta: 'A–D–Em–D — great for building chord fluency', type: 'Choice', core: false,
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
      { id: 'm5w1-s1', text: 'Read a chord diagram: identify X (mute), O (open), dots (finger placement), and numbers (which finger)' },
      { id: 'm5w1-s2', text: 'Explain the difference between a chord chart, TAB, and standard notation' },
      { id: 'm5w1-s3', text: 'Fret Am cleanly — every string rings with no buzzing' },
      { id: 'm5w1-s4', text: 'Fret Em cleanly — all 6 strings ring open and full' },
      { id: 'm5w1-s5', text: 'Strum 4 down-strums per bar in time at 60 BPM' },
      { id: 'm5w1-s6', text: 'Identify and fret any chord shown on a chord chart' }
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
    skillFocus: 'C major shape · F major simplified (xx3211) · G major (3 or 4 finger) · Common-finger pivot (Am to C) · Down-up strum patterns · 8 chord changes per minute goal',
    handoutUrl: 'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/hzC0orOGARw" target="_blank">C G Am F Chord Transitions – JustinGuitar</a> (full video).',
            hint: 'He shows the "perfect" chord change technique. Watch how he prepares the next chord shape before strumming it. Anticipation is the secret.',
            skills: [1, 2, 3, 4]
          },
          {
            text: 'Watch: <a href="https://youtu.be/dJfV7DsTThc" target="_blank">F Chord Simplified – Marty Music</a> (full video).',
            hint: 'The F chord is the #1 stumbling block for beginners. The simplified version (xx3211) avoids the full barre. Use this until it\'s clean, then worry about the barre version.',
            skills: [2]
          },
          {
            text: 'Listen to "Let It Be" by The Beatles. Can you hear the C–G–Am–F chord pattern in the verse? Count the bars — how many strums per chord?',
            hint: 'You don\'t need to play along yet. Just listen and map out when the chords change. This trains your ear to recognize the I–V–vi–IV progression.',
            skills: [5]
          }
        ]
      },
      c: {
        title: 'Practice station — chord transitions & strumming',
        time: '12 min',
        steps: [
          {
            text: 'Practice the Am-to-C pivot: in Am, your index finger stays on string 2, fret 1. In C, it also stays on string 2, fret 1. That\'s your pivot finger! Keep it down and move the other fingers.',
            hint: 'Common-finger pivots cut your transition time in half. Look for other chords in this group that share a finger position.',
            skills: [4, 6]
          },
          {
            text: 'Set metronome to 60 BPM. Play 2 bars of C, then 2 bars of G, then 2 bars of Am, then 2 bars of F. Repeat. Goal: change on beat 1 every time.',
            hint: 'If you miss a change, keep going. You can slow to 50 BPM if needed. Gradually increase by 5 BPM each time through.',
            skills: [1, 2, 3, 5]
          },
          {
            text: 'Add a down-up strum: strum down on beats 1, 2, 3, 4 and up on the "+" (and) of each beat. Count "1 + 2 + 3 + 4 +" aloud as you strum.',
            hint: 'Start slower than you think you need to. The upstroke should be lighter than the downstroke. Your wrist should move like a relaxed pendulum.',
            skills: [5, 6]
          }
        ]
      }
    },

    songs: [
      { name: '"Happy Birthday"', meta: 'Full strum arrangement — C–G–Am–F version', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Verse and chorus: C–G–Am–F full chord strum', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"Let It Be" — The Beatles', meta: 'C–G–Am–F — iconic I–V–vi–IV song', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=gGt0akED_UU' },
      { name: '"Let Her Go" — Passenger', meta: 'G–D–Em–C — same family of chords', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=RBumgq5yVrA',
        tutorialUrl: 'https://www.youtube.com/watch?v=u8eloQtLxhY' },
      { name: '"No Woman No Cry" — Bob Marley', meta: 'C–G–Am–F — beautiful and rhythmic', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=IT8XvzIfi4U',
        tutorialUrl: 'https://www.youtube.com/watch?v=qK4NutAn3rg' },
      { name: '"With or Without You" — U2', meta: 'D–A–Bm–G — similar progression, different key', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=ujNeHIo7oTE',
        tutorialUrl: 'https://www.youtube.com/watch?v=XSOn0BQ4Rcc' },
      { name: '"Africa" — Toto', meta: 'Simplified C–G–Am–F version', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=FTQbiNvZqaY',
        tutorialUrl: 'https://www.youtube.com/watch?v=JFM7vN8AHLQ' },
      { name: '"Riptide" — Vance Joy', meta: 'Am–G–C — three-chord wonder', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=uJ_1HMAGb4k',
        tutorialUrl: 'https://www.youtube.com/watch?v=4pmK0x6mY0I' },
      { name: '"Someone Like You" — Adele', meta: 'A–E–F#m–D — same structure, different key', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=hLQl3WQQoQ0',
        tutorialUrl: 'https://www.youtube.com/watch?v=csNqCXc_Vng' }
    ],

    assessment: {
      goal: 'Frets C, F, Am, G with clean tone · Switches C to G in time at 70 BPM · Switches Am to F in time at 70 BPM · Uses common-finger pivot (Am–C) · Strums a down-up pattern in time · Plays a full verse of a C–G–Am–F song',
      performance: 'Class or partner: play a full verse of "Vampire" or "Let It Be" with open chords and down-up strum. Teacher listens for clean transitions.',
      selfCheck: 'Can you switch from Am to C without lifting your index finger? Can you play the C–G–Am–F loop at 70 BPM without stopping?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm5w2-s1', text: 'Fret C major with clean tone on the B string' },
      { id: 'm5w2-s2', text: 'Fret F major (simplified xx3211) with no buzzing' },
      { id: 'm5w2-s3', text: 'Fret G major (3 or 4 finger version) cleanly' },
      { id: 'm5w2-s4', text: 'Use the common-finger pivot between Am and C' },
      { id: 'm5w2-s5', text: 'Play a down-up strum pattern in time at 60+ BPM' },
      { id: 'm5w2-s6', text: 'Switch between any two chords in Group 1 on beat 1 at 70 BPM' }
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
    skillFocus: 'D major triangular shape · A major (3 fingers on 2nd fret) · Bm partial barre (xx4432) · Moving between chord groups · Am–Em, G–D, C–A transitions',
    handoutUrl: 'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/hzC0orOGARw" target="_blank">D A Em Bm Open Chords – JustinGuitar</a> (full video).',
            hint: 'D major has a triangular finger shape — notice how his three fingers are stacked in a triangle on strings 1, 2, and 3. Try to copy that exact shape.',
            skills: [1, 2, 3, 4]
          },
          {
            text: 'Watch: <a href="https://youtu.be/JBKIamtI_Qc" target="_blank">Bm Chord for Beginners – Marty Music</a> (full video).',
            hint: 'Bm is the trickiest chord in this group. The partial barre version (xx4432) is the most accessible. Don\'t try the full barre version yet — focus on getting a clean sound first.',
            skills: [4]
          },
          {
            text: 'Listen to "Country Roads" by John Denver or "Sweet Home Alabama." Can you hear when the D and A chords arrive? Tap along and try to feel the chord changes.',
            hint: 'These songs use chords from Group 2. Your ear already knows what these chords sound like — you\'re just learning to play them now.',
            skills: [5]
          }
        ]
      },
      c: {
        title: 'Practice station — Group 2 chords & cross-group connections',
        time: '12 min',
        steps: [
          {
            text: 'Work on D major: fingers in a triangle on strings 1 (fret 2), 2 (fret 3), and 3 (fret 2). Strum strings 1–4 only. Check that string 1 (high E) rings clearly.',
            hint: 'The D chord is tricky because string 1 is easy to accidentally mute. Curve your fingers and make sure your fingertips arch away from that string.',
            skills: [1]
          },
          {
            text: 'Set metronome to 60 BPM. Practice these cross-group transitions: G (Group 1) → D (Group 2), Am (Group 1) → Em (Group 2), C (Group 1) → A (Group 2). 2 bars each.',
            hint: 'Look for fingers that stay close or in the same area as you switch. Planning your hand movement before you lift your fingers saves time.',
            skills: [2, 3, 5, 6]
          },
          {
            text: 'Play through "Country Roads" (G–Em–C–D) or "Stand By Me" (G–Em–C–D) using Group 1 and Group 2 chords together. Use a simple down-strum pattern.',
            hint: 'You now have enough chords to play hundreds of songs! If a chord change is rough, slow down and isolate just those two chords — don\'t practice the whole song broken.',
            skills: [5, 6]
          }
        ]
      }
    },

    songs: [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am–Em–D–A chord group 2 adaptation', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Adapted to D–A–Em strummed version', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Country Roads" — John Denver', meta: 'G–Em–C–D — perfect cross-group song', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=1vrEljMfXYo',
        tutorialUrl: 'https://www.youtube.com/watch?v=TRP3eHbIZnw' },
      { name: '"Hey Jude" — The Beatles', meta: 'Simplified F–C–Bb (adapted to G–D–Em)', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=A_MjCqQoLLA',
        tutorialUrl: 'https://www.youtube.com/watch?v=VyleoeWxbIQ' },
      { name: '"Sweet Home Alabama" — Lynyrd Skynyrd', meta: 'D–C–G — classic rock chords', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=-35W_FWCT9Q',
        tutorialUrl: 'https://www.youtube.com/watch?v=GafriAIHtZ4' },
      { name: '"Tenerife Sea" — Ed Sheeran', meta: 'D–A–Bm–G — smooth chord flow', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=oJaTEvynJ8M',
        tutorialUrl: 'https://www.youtube.com/watch?v=-AGGbJcUKSk' },
      { name: '"More Than Words" — Extreme', meta: 'G–D–Em–Am–C–D — full chord workout', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=UrIiLvg58SY',
        tutorialUrl: 'https://www.youtube.com/watch?v=REkxm9eRdwA' },
      { name: '"Shallow" — Lady Gaga', meta: 'Em–D–G–C–Am–D — challenge song', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=bo_efYhYU2A',
        tutorialUrl: 'https://www.youtube.com/watch?v=wocQ8UHN5kQ' }
    ],

    assessment: {
      goal: 'Frets D, A, Em, Bm with clean tone · Switches D to A in time · Switches Em to Bm in time · Connects Group 1 and Group 2 chords · Plays a song using Group 2 chords · Identifies chord group from a chord chart',
      performance: 'Individual: play 8 bars using chords from both groups — teacher picks two chords and student plays them in sequence at 70 BPM.',
      selfCheck: 'Can you look at a chord chart and know immediately which "group" each chord belongs to? Can you switch D–A and Em–Bm at 70 BPM?',
      standards: ['Pr.4a', 'Pr.5a', 'Cn.11b']
    },

    skills: [
      { id: 'm5w3-s1', text: 'Fret D major cleanly — triangular shape, strings 1–4' },
      { id: 'm5w3-s2', text: 'Fret A major cleanly — 3 fingers on 2nd fret' },
      { id: 'm5w3-s3', text: 'Fret Bm with partial barre shape (xx4432)' },
      { id: 'm5w3-s4', text: 'Switch D to A in time at 70 BPM' },
      { id: 'm5w3-s5', text: 'Connect Group 1 and Group 2 chords in a song (e.g., G to D, Am to Em)' },
      { id: 'm5w3-s6', text: 'Play a full song using Group 2 chords with a strum pattern' }
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
    skillFocus: 'E major full open chord · B7 four-finger open chord · F#m partial barre intro · C#m barre chord intro · Review all chord groups 1–3 · Semester performance preparation',
    handoutUrl: 'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/hzC0orOGARw" target="_blank">E Major and B7 Chords – JustinGuitar</a> (full video).',
            hint: 'E major uses all four fingers — it\'s a full chord. B7 is also four fingers but in a different arrangement. Take them one at a time. The B7 chord has a distinctive jazz/blues sound.',
            skills: [1, 2]
          },
          {
            text: 'Watch: <a href="https://youtu.be/rrB97F0Qu6g" target="_blank">How to Practice for Performance – Simen Otnes</a> (full video).',
            hint: 'Key idea: practice doesn\'t make perfect — practice makes permanent. Are you practicing your mistakes or your solutions? This matters most before a performance.',
            skills: [5]
          },
          {
            text: 'Look up a chord chart for your showcase song (or one you\'ve been working on). Map out which chord groups you\'ll use. Are there any chords you need to review?',
            hint: 'Being intentional about your practice is a skill. Know exactly which transitions are rough and spend most of your time there — not on the parts you already know.',
            skills: [5, 6]
          }
        ]
      },
      c: {
        title: 'Practice station — Group 3 chords & showcase prep',
        time: '12 min',
        steps: [
          {
            text: 'Fret E major: index on string 3 fret 1, middle on string 5 fret 2, ring on string 4 fret 2. Strum all 6 strings. This is a full, open, rich chord — let every string ring!',
            hint: 'E major is one of the most satisfying open chords to play. If any string buzzes, check your index finger — it tends to accidentally mute string 2.',
            skills: [1, 3]
          },
          {
            text: 'Fret B7: index on string 4 fret 1, middle on string 5 fret 2, ring on string 3 fret 2, pinky on string 1 fret 2. Strum strings 1–5. This 4-finger chord is a workout!',
            hint: 'B7 is a dominant 7th chord — it has a slightly tense sound that wants to resolve to E. Play E then B7 then E again and hear how it pulls back.',
            skills: [2, 3]
          },
          {
            text: 'Showcase prep: choose your performance song. Play it all the way through 3 times without stopping, even when you make mistakes. Time yourself — know how long it takes.',
            hint: 'Don\'t stop when you make a mistake in performance practice. The goal is to keep going. You can fix mistakes in slow practice — performance practice trains your recovery.',
            skills: [5, 6]
          }
        ]
      }
    },

    songs: [
      { name: '"Happy Birthday"', meta: 'Full chord arrangement — all groups reviewed', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Full song performance', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full performance with open chords', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Hallelujah" — Leonard Cohen', meta: 'C–Am–F–G — beautiful showcase song', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=ttEMYvpoR-k',
        tutorialUrl: 'https://www.youtube.com/watch?v=eFLJUspLfnk' },
      { name: '"Creep" — Radiohead', meta: 'G–B–C–Cm — emotional and memorable', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=XFkzRNyygfk',
        tutorialUrl: 'https://www.youtube.com/watch?v=ZD2iYBg6faQ' },
      { name: '"The Sound of Silence" — Simon & Garfunkel', meta: 'Am–G–C — quiet and expressive', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=l0q7MLPo-u8',
        tutorialUrl: 'https://www.youtube.com/watch?v=HItFqkAznHw' },
      { name: '"Iris" — Goo Goo Dolls', meta: 'Bm–D–G — powerful chorus chords', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=NdYWuo9OFAw',
        tutorialUrl: 'https://www.youtube.com/watch?v=XWsBCiF3MTE' },
      { name: '"Blackbird" — The Beatles', meta: 'Fingerpicking challenge — advanced option', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=Man4Xw8Xypo',
        tutorialUrl: 'https://www.youtube.com/watch?v=Qqw15309knU' },
      { name: 'Student original using course skills', meta: 'Your own composition — any chords from the semester', type: 'Choice', core: false }
    ],

    assessment: {
      goal: 'Semester Showcase: Perform one complete song of your choice using at least 4 chords from the semester. Evaluated on chord accuracy, timing, smooth transitions, and musicality. Written self-reflection: My Guitar Adventure — Semester 1 Check-in.',
      performance: 'Semester showcase performance. Student performs chosen song for class. Teacher evaluates chord accuracy, timing, transitions, and expression.',
      selfCheck: 'Can you play your showcase song all the way through without stopping? Can you name every chord in your song and which group it belongs to?',
      standards: ['Pr.4a', 'Pr.5b', 'Pr.6a', 'Re.9a']
    },

    skills: [
      { id: 'm5w4-s1', text: 'Fret E major open chord cleanly — all 6 strings ring' },
      { id: 'm5w4-s2', text: 'Fret B7 open chord cleanly — 4 fingers, strings 1–5' },
      { id: 'm5w4-s3', text: 'Identify F#m and C#m shapes on a chord diagram' },
      { id: 'm5w4-s4', text: 'Demonstrate 3+ chord types from across the semester' },
      { id: 'm5w4-s5', text: 'Perform a chosen song all the way through without stopping' },
      { id: 'm5w4-s6', text: 'Maintain a steady strum pattern throughout a full song' }
    ]
  }

); // end module-5.js
