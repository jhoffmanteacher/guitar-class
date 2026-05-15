// ============================================================
//  GUITAR CLASS CONTENT CONFIG
//  This is the only file you need to edit for course content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================
//
//  HOW TO ADD A NEW WEEK:
//  1. Copy the week block template at the bottom of this file
//  2. Fill in your content
//  3. Save and upload to GitHub — done!
//
//  HOW TO UNLOCK A WEEK:
//  Change  locked: true  →  locked: false
//
//  HOW TO MARK A WEEK AS "COMING SOON" (shows placeholder, no content):
//  Set  comingSoon: true  and leave  skills: []
//
// ============================================================

const WEEKS = [

  // ── WEEK 1 — placeholder (coming soon) ──────────────────
  {
    id: 'w1',
    label: 'Wk 1',
    locked: false,
    unit: 'Unit 1 · First Sounds',
    title: 'Week 1',
    subtitle: 'Introduction & goal-setting',
    objective: 'I CAN describe my guitar goals and share a song that means something to me.',
    skillFocus: 'Introduction · Goal-setting · "What Is Your Guitar Adventure?" pre-assessment',
    comingSoon: true,
    skills: []
  },


  // ── WEEKS 2–3 — full content ─────────────────────────────
  {
    id: 'w2',
    label: 'Wk 2–3',
    locked: false,
    unit: 'Unit 1 · First Sounds',
    title: 'Weeks 2–3',
    subtitle: 'Posture · Hand position · Single notes · Down-up strumming',
    objective: 'I CAN tune my guitar, play single notes cleanly, and strum down-up in time.',
    skillFocus: 'Parts of the guitar · Posture & hand position · Holding a pick · Standard tuning · Single notes · Down-up strumming',
    comingSoon: false,

    stations: {
      a: {
        title: 'Teacher station — posture, notes & pick technique',
        time: '12 min',
        steps: [
          { text: 'Name the parts of the guitar together. Teacher points to headstock, nut, frets, body, sound hole, bridge — students call out each name.', hint: 'Goal: know the names so you can find them by feel.' },
          { text: 'Check posture: sit toward the front of the chair, back straight, guitar body on right leg, neck tilted slightly up.', hint: 'Shoulders relaxed — tension is the enemy of playing.' },
          { text: 'Hold a pick: pinch between thumb and side of index finger, about 3–4mm of tip showing. Teacher checks each student\'s grip.' },
          { text: 'Play single notes on strings 1–6, one at a time. Downstroke. Listen for a clean tone — no buzzing.', hint: 'Finger just behind the fret, not on top of it.' },
          { text: 'Try the "Seven Nation Army" riff together slowly. Teacher models, students copy. Tone first, speed later.' }
        ]
      },
      b: {
        title: 'Computer station — watch & respond',
        time: '12 min',
        steps: [
          { text: 'Watch: <a href="https://www.youtube.com/watch?v=rrB97F0Qu6g" target="_blank">How to Actually Get Good at Guitar – Simen Otnes</a> (first 5 min).', hint: 'Headphones on. What habits will help you get better?' },
          { text: 'Watch: <a href="https://www.youtube.com/watch?v=8-grcbKnbps" target="_blank">How to Hold a Guitar Pick – JustinGuitar</a>.', hint: 'Write down: what are the two most common pick-holding mistakes?' },
          { text: 'In your notes: write out the 6 string names from memory, low to high. Mnemonic: Eddie Ate Dynamite, Good Bye Eddie.' },
          { text: 'Bonus: Watch <a href="https://www.youtube.com/watch?v=wvgJ0lt4spY" target="_blank">Beginner Open Strings Lesson</a>. Air-strum the down-up pattern shown.' }
        ]
      },
      c: {
        title: 'Practice station — independent drill',
        time: '12 min',
        steps: [
          { text: 'Tune your guitar using a clip tuner or <a href="https://chromewebstore.google.com/detail/guitarapp-guitar-tuner/niafepdbinnnbgigcnhefoconkcljifd" target="_blank" rel="noopener">install the guitar tuning app</a>. Goal: all 6 strings in tune in under 2 minutes.', hint: 'Low to high: E A D G B e. Green light = in tune.' },
          { text: 'Play single notes across all 6 strings, open and frets 1–4. Say the string name aloud as you play. Zero buzzing.', hint: 'Buzzing? Press closer to the fret, arch your finger, check your hand position.' },
          { text: 'Down-up strumming on one open string: count aloud "1 and 2 and 3 and 4 and…" Match each word to a strum. Metronome at 60 BPM.' },
          { text: 'Try the "Seven Nation Army" riff: E string, frets 7–7–10–7–5–3–2. Slow and clean.', hint: 'Slow and clean beats fast and buzzy every time.' },
          { text: 'Reference the <button class="rp-trigger" onclick="loadPanel(\'gdoc\',\'https://docs.google.com/document/d/18eZNbdQrIctws5BLYlKOgypDFy2cfo1M/preview\',\'Weeks 2–3 Skills Handout\',\'Reference handout\')">Weeks 2–3 Skills Handout</button> if you need a reminder on any technique.' }
        ]
      }
    },

    songs: [
      { name: '"Seven Nation Army" — White Stripes', meta: 'Single notes + down-up strumming', type: 'Core',     core: true  },
      { name: '"Jaws" theme',                        meta: 'Two-note riff, great for single note practice', type: 'Core', core: true },
      { name: '"Smoke on the Water" — Deep Purple',  meta: 'Simplified open strings',          type: 'Rock',     core: false },
      { name: '"Love Me Do" — Beatles',              meta: 'Simplified melody on 2 strings',   type: 'Pop',      core: false },
      { name: '"Está Dañada" — Ivan Cornejo',        meta: 'Melody on 2 strings',              type: 'Sierreño', core: false },
      { name: '"Sakura" — Japanese folk',            meta: 'Melody on 2 strings',              type: 'World',    core: false }
    ],

    videos: [
      { name: 'How to Actually Get Good at Guitar', url: 'https://www.youtube.com/watch?v=rrB97F0Qu6g', source: 'Simen Otnes / Play With a Plan', rec: true  },
      { name: 'How to Hold a Guitar Pick',          url: 'https://www.youtube.com/watch?v=8-grcbKnbps', source: 'JustinGuitar',                   rec: false },
      { name: 'Beginner Open Strings Lesson',       url: 'https://www.youtube.com/watch?v=wvgJ0lt4spY', source: 'YouTube',                        rec: false },
      { name: 'Your First Guitar Lesson',           url: 'https://www.youtube.com/watch?v=ely9LaJJJr4', source: 'Marty Music',                    rec: false }
    ],

    assessment: {
      goal:        'Tune guitar to standard tuning independently in under 2 minutes.',
      performance: 'Whole-class unison open string rhythm exercise. Everyone plays together — no one is on the spot.',
      selfCheck:   'Can you tune all 6 strings without help? Can you play a single note with no buzzing? Can you strum down-up while counting aloud?',
      standards:   ['Pr.4', 'Pr.5']
    },

    skills: [
      { id: 'w2-s1', text: 'Name the main parts of the guitar' },
      { id: 'w2-s2', text: 'Demonstrate correct sitting posture & hand position' },
      { id: 'w2-s3', text: 'Hold a pick with correct angle, grip & motion' },
      { id: 'w2-s4', text: 'Tune to standard tuning independently in under 2 minutes' },
      { id: 'w2-s5', text: 'Play single notes cleanly across strings' },
      { id: 'w2-s6', text: 'Perform basic down-up strumming in time' }
    ]
  },


  // ── WEEK 4 — full content ────────────────────────────────
  {
    id: 'w4',
    label: 'Wk 4',
    locked: false,
    unit: 'Unit 1 · First Sounds',
    title: 'Week 4',
    subtitle: 'Chord diagrams · Em & Am · Basic downstroke strumming',
    objective: 'I CAN read a chord diagram, switch between Em and Am, and strum a downstroke pattern in time.',
    skillFocus: 'Reading chord diagrams · First chords: Em & Am · Basic downstroke strumming · Partner feedback',
    comingSoon: false,

    stations: {
      a: {
        title: 'Teacher station — chord diagrams & hand position',
        time: '12 min',
        steps: [
          { text: 'Explain chord diagrams: vertical lines = strings, horizontal lines = frets, dots = where fingers go, numbers = which finger to use, X = don\'t play, O = open string.', hint: 'Draw a blank diagram on the board and build Em together dot by dot.' },
          { text: 'Teach Em: fingers 2 & 3 on strings 5 & 4 at fret 2. Strum all 6 strings. Listen for a full, clean sound.', hint: 'Arch the fingers — make sure open strings ring out.' },
          { text: 'Teach Am: fingers 1, 2, & 3 on strings 2, 4, & 3 at fret 1 & 2. Strum strings 5–1 only (mute string 6).', hint: 'Check that the first finger isn\'t accidentally touching string 1.' },
          { text: 'Practice the switch: Em → Am → Em → Am. Count "1, 2, 3, 4" for each chord. Teacher counts aloud.', hint: 'Look ahead — think about the next chord before you need it.' },
          { text: 'Partner check: one student plays, one watches hand position and gives one piece of feedback.' }
        ]
      },
      b: {
        title: 'Computer station — watch & respond',
        time: '12 min',
        steps: [
          { text: 'Watch: <a href="https://www.youtube.com/watch?v=47FXbQFd5ng" target="_blank">6 Levels of Chords on Guitar – Simen Otnes</a> (first 5 min).', hint: 'Headphones on. What makes a chord sound clean vs. buzzy?' },
          { text: 'Watch: <a href="https://www.youtube.com/watch?v=hzC0orOGARw" target="_blank">5 Essential Strumming Patterns – JustinGuitar</a>.', hint: 'Write down: what does it mean to "strum from the wrist"?' },
          { text: 'In your notes: draw a chord diagram for Em and Am from memory. Label the finger numbers.', hint: 'Don\'t look! Then check yourself against the lesson materials.' },
          { text: 'Bonus: Watch <a href="https://www.youtube.com/watch?v=JBKIamtI_Qc" target="_blank">First Chords + Strumming – Marty Music</a> and try to strum along.' }
        ]
      },
      c: {
        title: 'Practice station — independent drill',
        time: '12 min',
        steps: [
          { text: 'Tune your guitar. Then place your fingers on Em. Play each string one at a time — every note should ring clean.', hint: 'Any buzzing? Arch your fingers more and press closer to the fret.' },
          { text: 'Now form Am. Check each string individually. Fix any buzzes before strumming.', hint: 'Make sure your index finger is not muting string 1.' },
          { text: 'Downstroke strum: Em for 4 beats, Am for 4 beats. Count aloud. Metronome at 60 BPM.', hint: 'Keep your strumming arm moving — a smooth motion sounds better than stopping between chords.' },
          { text: 'Try "Horse with No Name": the whole song is just Em and Am alternating every 2 beats. Play along at a slow tempo.', hint: 'The chord switch is the challenge — the strumming is simple. Focus on the switch.' },
          { text: 'Goal: switch Em–Am cleanly 8 times in a row in tempo. Mark it done on your checklist when you can do it!' }
        ]
      }
    },

    songs: [
      { name: '"Horse with No Name" — America', meta: 'Em–Am, basic downstroke strumming',    type: 'Core',    core: true  },
      { name: '"Lose Yourself" — Eminem',        meta: 'Em intro riff adapted for chords',    type: 'Hip-Hop', core: false },
      { name: '"About a Girl" — Nirvana',         meta: 'Em–G simplified',                    type: 'Grunge',  core: false },
      { name: '"Three Little Birds" — Bob Marley',meta: 'Simplified Am strum',                type: 'Reggae',  core: false }
    ],

    videos: [
      { name: '6 Levels of Chords on Guitar',  url: 'https://www.youtube.com/watch?v=47FXbQFd5ng', source: 'Simen Otnes / Play With a Plan', rec: true  },
      { name: '5 Essential Strumming Patterns', url: 'https://www.youtube.com/watch?v=hzC0orOGARw', source: 'JustinGuitar',                  rec: false },
      { name: 'First Chords + Strumming',       url: 'https://www.youtube.com/watch?v=JBKIamtI_Qc', source: 'Marty Music',                  rec: false }
    ],

    assessment: {
      goal:        'Switch between Em and Am cleanly 8 times in a row at 60 BPM.',
      performance: 'Partner check: one student plays Em–Am, partner watches and gives one piece of feedback on hand position.',
      selfCheck:   'Can you read a chord diagram? Can you form Em and Am with no buzzing? Can you switch between them in tempo?',
      standards:   ['Pr.4', 'Pr.5', 'Pr.6']
    },

    skills: [
      { id: 'w4-s1', text: 'Read a chord diagram (strings, frets, fingers, X and O)' },
      { id: 'w4-s2', text: 'Form Em with clean tone — no buzzing' },
      { id: 'w4-s3', text: 'Form Am with clean tone — no buzzing' },
      { id: 'w4-s4', text: 'Switch Em → Am → Em smoothly in tempo' },
      { id: 'w4-s5', text: 'Strum a basic downstroke pattern while counting aloud' },
      { id: 'w4-s6', text: 'Play Em–Am switch cleanly x8 at 60 BPM (assessment goal)' }
    ]
  },


  // ── WEEKS 5–6 — placeholder (locked) ────────────────────
  {
    id: 'w5',
    label: 'Wk 5–6',
    locked: true,
    unit: 'Unit 2 · Building a Chord Vocabulary',
    title: 'Weeks 5–6',
    subtitle: 'Coming soon',
    comingSoon: true,
    skills: []
  },


  // ── TEMPLATE — copy this block to add a new week ─────────
  //
  // {
  //   id: 'w6',           // unique id, no spaces
  //   label: 'Wk 6',      // short label shown on the pill button
  //   locked: false,       // true = greyed out, students can't open it
  //   unit: 'Unit 2 · Building a Chord Vocabulary',
  //   title: 'Week 6',
  //   subtitle: 'One-line summary of the week',
  //   objective: 'I CAN ...',
  //   skillFocus: 'Topic · Topic · Topic',
  //   comingSoon: false,   // set to true to show "coming soon" placeholder
  //
  //   stations: {
  //     a: {
  //       title: 'Teacher station — description',
  //       time: '12 min',
  //       steps: [
  //         { text: 'Step instructions here.', hint: 'Optional tip shown in smaller text.' },
  //         { text: 'Another step.' }
  //       ]
  //     },
  //     b: {
  //       title: 'Computer station — watch & respond',
  //       time: '12 min',
  //       steps: [
  //         { text: 'Watch: <a href="https://youtube.com/..." target="_blank">Video Title</a>.', hint: 'What to notice.' }
  //       ]
  //     },
  //     c: {
  //       title: 'Practice station — independent drill',
  //       time: '12 min',
  //       steps: [
  //         { text: 'Practice task here.' }
  //       ]
  //     }
  //   },
  //
  //   songs: [
  //     { name: '"Song Title" — Artist', meta: 'What skill it practices', type: 'Core', core: true },
  //     { name: '"Song Title" — Artist', meta: 'What skill it practices', type: 'Rock', core: false }
  //   ],
  //
  //   videos: [
  //     { name: 'Video Title', url: 'https://youtube.com/...', source: 'Channel Name', rec: true },
  //     { name: 'Video Title', url: 'https://youtube.com/...', source: 'Channel Name', rec: false }
  //   ],
  //
  //   assessment: {
  //     goal:        'What students need to demonstrate.',
  //     performance: 'How the in-class assessment works.',
  //     selfCheck:   'Can you...? Can you...? Can you...?',
  //     standards:   ['Pr.4', 'Pr.5']
  //   },
  //
  //   skills: [
  //     { id: 'w6-s1', text: 'Skill description shown on the checklist' },
  //     { id: 'w6-s2', text: 'Another skill' }
  //   ]
  // },

]; // end WEEKS — do not remove this line
