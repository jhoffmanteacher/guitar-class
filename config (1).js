// ============================================================
//  GUITAR CLASS CONTENT CONFIG
//  This is the only file you need to edit for course content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================
//
//  HOW TO ADD A NEW SET:
//  1. Copy the set block template at the bottom of this file
//  2. Fill in your content
//  3. Save and upload to GitHub — done!
//
//  HOW TO UNLOCK A SET:
//  Change  locked: true  →  locked: false
//
//  HOW TO MARK A SET AS "COMING SOON":
//  Set  comingSoon: true  and leave  skills: []
//
//  HANDOUT LINKS:
//  Add  handoutUrl: 'https://docs.google.com/...'  to link the
//  module handout from the objective card. One per module —
//  copy the same URL to all sets within that module.
//
//  STATION SKILL TAGS:
//  Add  skills: [1, 2]  to any step to show skill number badges.
//  Numbers correspond to the position in the skills array (1-based).
//
//  SONG LINKS:
//  Add  url: 'https://youtube.com/watch?v=...'  to any song to
//  make the song title a clickable link that opens in the resource panel.
//
// ============================================================

const WEEKS = [

  // ── MODULE 1, SET 1 — placeholder (coming soon) ──────────
  {
    id: 'w1',
    label: 'Set 1',
    locked: false,
    module: 'First Sounds',
    moduleNum: 1,
    unit: 'Module 1 · First Sounds',
    title: 'Set 1',
    subtitle: 'Introduction & goal-setting',
    objective: 'I CAN describe my guitar goals and share a song that means something to me.',
    skillFocus: 'Introduction · Goal-setting · "What Is Your Guitar Adventure?" pre-assessment',
    handoutUrl: 'https://docs.google.com/document/d/1wKmQRDFbKsIci94PNRzoQkXoTVO6A017ELIZYvLtyCE/edit',
    comingSoon: true,
    skills: []
  },


  // ── MODULE 1, SET 2 — full content ───────────────────────
  {
    id: 'w2',
    label: 'Set 2',
    locked: false,
    module: 'First Sounds',
    moduleNum: 1,
    unit: 'Module 1 · First Sounds',
    title: 'Set 2',
    subtitle: 'Posture · Hand position · Single notes · Down-up strumming',
    objective: 'I CAN tune my guitar, play single notes cleanly, and strum down-up in time.',
    skillFocus: 'Parts of the guitar · Posture & hand position · Holding a pick · Standard tuning · Single notes · Down-up strumming',
    handoutUrl: 'https://docs.google.com/document/d/1wKmQRDFbKsIci94PNRzoQkXoTVO6A017ELIZYvLtyCE/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://www.youtube.com/watch?v=rrB97F0Qu6g" target="_blank">How to Actually Get Good at Guitar – Simen Otnes</a> (0:00–3:30).',
            hint: 'As you watch, think about: what is one habit he says makes the biggest difference?',
            skills: [1, 2]
          },
          {
            text: 'Watch: <a href="https://www.youtube.com/watch?v=8-grcbKnbps" target="_blank">How to Hold a Guitar Pick – JustinGuitar</a> (0:00–2:30).',
            hint: 'Watch through 1:00, then pause. Try to match his grip — pick between thumb and side of index finger, 3–4mm of tip showing. Hit play and watch the rest. Does your grip match?',
            skills: [3]
          },
          {
            text: 'Watch: <a href="https://www.youtube.com/watch?v=wvgJ0lt4spY" target="_blank">Beginner Open Strings – JustinGuitar</a> (0:00–2:00).',
            hint: 'Watch through 0:45, then pause. Air-strum the down-up pattern he just showed — count "1 and 2 and 3 and 4 and" out loud. Hit play and strum along with him.',
            skills: [5, 6]
          }
        ]
      },
      c: {
        title: 'Practice station — independent drill',
        time: '12 min',
        steps: [
          {
            text: 'Tune your guitar using a clip tuner or <a href="https://chromewebstore.google.com/detail/guitarapp-guitar-tuner/niafepdbinnnbgigcnhefoconkcljifd" target="_blank" rel="noopener">install the guitar tuning app</a>. Goal: all 6 strings in tune in under 2 minutes.',
            hint: 'Low to high: E A D G B e. Green light = in tune.',
            skills: [4]
          },
          {
            text: 'Play single notes across all 6 strings, open and frets 1–4. Say the string name aloud as you play. Zero buzzing.',
            hint: 'Buzzing? Press closer to the fret, arch your finger, check your hand position.',
            skills: [5]
          },
          {
            text: 'Down-up strumming on one open string: count aloud "1 and 2 and 3 and 4 and…" Match each word to a strum. Metronome at 60 BPM.',
            skills: [6]
          },
          {
            text: 'Try the "Seven Nation Army" riff: E string, frets 7–7–10–7–5–3–2. Slow and clean.',
            hint: 'Slow and clean beats fast and buzzy every time.',
            skills: [6]
          }
        ]
      }
    },

    songs: [
      { name: '"Seven Nation Army" — The White Stripes', meta: 'E string riff, frets 7-7-10-7-5-3-2', type: 'Core',         core: true,  url: 'https://www.youtube.com/watch?v=0J2QdDbelmY' },
      { name: '"Smoke on the Water" — Deep Purple',       meta: 'Simple 3-note riff on D string',      type: 'Classic Rock', core: false, url: 'https://www.youtube.com/watch?v=Q2FzZSBD5LE' },
      { name: '"Come As You Are" — Nirvana',              meta: 'Single-note intro riff',              type: 'Grunge',       core: false, url: 'https://www.youtube.com/watch?v=vabnZ9-ex7o' },
      { name: '"Day Tripper" — The Beatles',              meta: 'E string riff, beginner version',     type: 'Classic',      core: false, url: 'https://www.youtube.com/watch?v=AYZlME0mQB8' }
    ],

    videos: [
      { name: 'How to Actually Get Good at Guitar', url: 'https://www.youtube.com/watch?v=rrB97F0Qu6g', source: 'Simen Otnes / Play With a Plan', rec: true  },
      { name: 'How to Hold a Guitar Pick',          url: 'https://www.youtube.com/watch?v=8-grcbKnbps', source: 'JustinGuitar',                   rec: false },
      { name: 'Beginner Open Strings Lesson',       url: 'https://www.youtube.com/watch?v=wvgJ0lt4spY', source: 'JustinGuitar',                   rec: false }
    ],

    assessment: {
      goal:        'Tune guitar to standard tuning independently in under 2 minutes.',
      performance: 'Whole-class unison open string rhythm exercise. Everyone plays together — no one is on the spot.',
      selfCheck:   'Can you tune all 6 strings without help? Can you play a single note with no buzzing? Can you strum down-up while counting aloud?',
      standards:   ['Pr.4', 'Pr.5']
    },

    skills: [
      { id: 'w2-s1', text: 'Name all 6 strings from memory (E A D G B e)' },
      { id: 'w2-s2', text: 'Tune all 6 strings with a tuner in under 2 minutes' },
      { id: 'w2-s3', text: 'Hold the pick correctly — 3–4mm of tip showing' },
      { id: 'w2-s4', text: 'Tune all 6 strings with a tuner in under 2 minutes' },
      { id: 'w2-s5', text: 'Play single notes on all 6 strings with no buzzing' },
      { id: 'w2-s6', text: 'Strum down-up in time while counting aloud at 60 BPM' }
    ]
  },


  // ── MODULE 1, SET 3 — full content ───────────────────────
  {
    id: 'w4',
    label: 'Set 3',
    locked: false,
    module: 'First Sounds',
    moduleNum: 1,
    unit: 'Module 1 · First Sounds',
    title: 'Set 3',
    subtitle: 'Reading chord diagrams · Em & Am · Downstroke strumming',
    objective: 'I CAN read a chord diagram, play Em and Am cleanly, and switch between them in time.',
    skillFocus: 'Reading chord diagrams · First chords: Em & Am · Basic downstroke strumming · Partner feedback',
    handoutUrl: 'https://docs.google.com/document/d/1wKmQRDFbKsIci94PNRzoQkXoTVO6A017ELIZYvLtyCE/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        time: '12 min',
        steps: [
          {
            text: 'Watch: <a href="https://www.youtube.com/watch?v=47FXbQFd5ng" target="_blank">6 Levels of Chords on Guitar – Simen Otnes</a> (0:00–4:00).',
            hint: 'As you watch, think about: what does he say causes buzzing? Pause at any point where he demos a chord — form it on your guitar and check your own tone before hitting play again.',
            skills: [1, 2]
          },
          {
            text: 'Watch: <a href="https://www.youtube.com/watch?v=hzC0orOGARw" target="_blank">5 Essential Strumming Patterns – JustinGuitar</a> (0:00–3:00).',
            hint: 'As you watch, think about: what does it mean to keep your arm moving? Watch through 1:00, then pause. Air-strum Pattern 1. Hit play and strum along for the rest.',
            skills: [5]
          },
          {
            text: 'Watch: <a href="https://www.youtube.com/watch?v=JBKIamtI_Qc" target="_blank">First Chords + Strumming – Marty Music</a> (2:00–5:00).',
            hint: 'Watch through 3:00, then pause. Form Em or Am and strum — listen for clean tone. Hit play and play along quietly for the rest.',
            skills: [3, 4, 5]
          }
        ]
      },
      c: {
        title: 'Practice station — independent drill',
        time: '12 min',
        steps: [
          {
            text: 'Tune your guitar. Then place your fingers on Em. Play each string one at a time — every note should ring clean.',
            hint: 'Any buzzing? Arch your fingers more and press closer to the fret.',
            skills: [2]
          },
          {
            text: 'Now form Am. Check each string individually. Fix any buzzes before strumming.',
            hint: 'Make sure your index finger is not muting string 1.',
            skills: [3]
          },
          {
            text: 'Downstroke strum: Em for 4 beats, Am for 4 beats. Count aloud. Metronome at 60 BPM.',
            hint: 'Keep your strumming arm moving — a smooth motion sounds better than stopping between chords.',
            skills: [4, 5]
          },
          {
            text: 'Try "Horse with No Name": the whole song is just Em and Am alternating every 2 beats. Play along at a slow tempo.',
            hint: 'The chord switch is the challenge — the strumming is simple. Focus on the switch.',
            skills: [4]
          },
          {
            text: 'Goal: switch Em–Am cleanly 8 times in a row in tempo. Mark it done on your checklist when you can do it!',
            skills: [6]
          }
        ]
      }
    },

    songs: [
      { name: '"Horse with No Name" — America',   meta: 'Em–Am, basic downstroke strumming',  type: 'Core',    core: true,  url: 'https://www.youtube.com/watch?v=na47wMFfQCo' },
      { name: '"Lose Yourself" — Eminem',          meta: 'Em intro riff adapted for chords',   type: 'Hip-Hop', core: false, url: 'https://www.youtube.com/watch?v=eRhEcKHU5LY' },
      { name: '"About a Girl" — Nirvana',          meta: 'Em–G simplified',                    type: 'Grunge',  core: false, url: 'https://www.youtube.com/watch?v=_24pJQUj7zg' },
      { name: '"Three Little Birds" — Bob Marley', meta: 'Simplified Am strum',                type: 'Reggae',  core: false, url: 'https://www.youtube.com/watch?v=HNBCVM4KbUM' }
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


  // ── MODULES 2–9 — placeholder sets (locked) ──────────────
  { id:'m2w1', label:'Set 1', locked:true, module:'Building a Chord Vocabulary',  moduleNum:2, unit:'Module 2 · Building a Chord Vocabulary',  title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1KM2rgUYa3NEpDr4E65YmcTE_g6Fxs_rbIjP-U1wjcnA/edit', comingSoon:true, skills:[] },
  { id:'m2w2', label:'Set 2', locked:true, module:'Building a Chord Vocabulary',  moduleNum:2, unit:'Module 2 · Building a Chord Vocabulary',  title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1KM2rgUYa3NEpDr4E65YmcTE_g6Fxs_rbIjP-U1wjcnA/edit', comingSoon:true, skills:[] },
  { id:'m2w3', label:'Set 3', locked:true, module:'Building a Chord Vocabulary',  moduleNum:2, unit:'Module 2 · Building a Chord Vocabulary',  title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1KM2rgUYa3NEpDr4E65YmcTE_g6Fxs_rbIjP-U1wjcnA/edit', comingSoon:true, skills:[] },

  { id:'m3w1', label:'Set 1', locked:true, module:'Rhythm & Strumming Patterns',  moduleNum:3, unit:'Module 3 · Rhythm & Strumming Patterns',  title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1S0gxHXkbgZRJT5VhR9nGz6O2imjEF9uQ_jNAYFaTc6I/edit', comingSoon:true, skills:[] },
  { id:'m3w2', label:'Set 2', locked:true, module:'Rhythm & Strumming Patterns',  moduleNum:3, unit:'Module 3 · Rhythm & Strumming Patterns',  title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1S0gxHXkbgZRJT5VhR9nGz6O2imjEF9uQ_jNAYFaTc6I/edit', comingSoon:true, skills:[] },
  { id:'m3w3', label:'Set 3', locked:true, module:'Rhythm & Strumming Patterns',  moduleNum:3, unit:'Module 3 · Rhythm & Strumming Patterns',  title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1S0gxHXkbgZRJT5VhR9nGz6O2imjEF9uQ_jNAYFaTc6I/edit', comingSoon:true, skills:[] },

  { id:'m4w1', label:'Set 1', locked:true, module:'Melody & Single-Note Playing', moduleNum:4, unit:'Module 4 · Melody & Single-Note Playing', title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1Wmf3XYqMAKXoQ8ZxPv_Feb9HiySl_5xtYXWpQTv7a6w/edit', comingSoon:true, skills:[] },
  { id:'m4w2', label:'Set 2', locked:true, module:'Melody & Single-Note Playing', moduleNum:4, unit:'Module 4 · Melody & Single-Note Playing', title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1Wmf3XYqMAKXoQ8ZxPv_Feb9HiySl_5xtYXWpQTv7a6w/edit', comingSoon:true, skills:[] },
  { id:'m4w3', label:'Set 3', locked:true, module:'Melody & Single-Note Playing', moduleNum:4, unit:'Module 4 · Melody & Single-Note Playing', title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1Wmf3XYqMAKXoQ8ZxPv_Feb9HiySl_5xtYXWpQTv7a6w/edit', comingSoon:true, skills:[] },

  { id:'m5w1', label:'Set 1', locked:true, module:'Song Structure & Form',        moduleNum:5, unit:'Module 5 · Song Structure & Form',        title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit', comingSoon:true, skills:[] },
  { id:'m5w2', label:'Set 2', locked:true, module:'Song Structure & Form',        moduleNum:5, unit:'Module 5 · Song Structure & Form',        title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit', comingSoon:true, skills:[] },
  { id:'m5w3', label:'Set 3', locked:true, module:'Song Structure & Form',        moduleNum:5, unit:'Module 5 · Song Structure & Form',        title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/13XrZWodpEcCe_l5Rgi7nvbUL0Wv8A6SUOTysUazgHzc/edit', comingSoon:true, skills:[] },

  { id:'m6w1', label:'Set 1', locked:true, module:'Barre Chords & Power Chords',  moduleNum:6, unit:'Module 6 · Barre Chords & Power Chords',  title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mBqrpsG2rkiVPWrF-zo0fxlgA1YQN33GyxmgsXqCY0g/edit', comingSoon:true, skills:[] },
  { id:'m6w2', label:'Set 2', locked:true, module:'Barre Chords & Power Chords',  moduleNum:6, unit:'Module 6 · Barre Chords & Power Chords',  title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mBqrpsG2rkiVPWrF-zo0fxlgA1YQN33GyxmgsXqCY0g/edit', comingSoon:true, skills:[] },
  { id:'m6w3', label:'Set 3', locked:true, module:'Barre Chords & Power Chords',  moduleNum:6, unit:'Module 6 · Barre Chords & Power Chords',  title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mBqrpsG2rkiVPWrF-zo0fxlgA1YQN33GyxmgsXqCY0g/edit', comingSoon:true, skills:[] },

  { id:'m7w1', label:'Set 1', locked:true, module:'Improvisation & Expression',   moduleNum:7, unit:'Module 7 · Improvisation & Expression',   title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit', comingSoon:true, skills:[] },
  { id:'m7w2', label:'Set 2', locked:true, module:'Improvisation & Expression',   moduleNum:7, unit:'Module 7 · Improvisation & Expression',   title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit', comingSoon:true, skills:[] },
  { id:'m7w3', label:'Set 3', locked:true, module:'Improvisation & Expression',   moduleNum:7, unit:'Module 7 · Improvisation & Expression',   title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1w1GM5ZkoFNn0QBGOkstSXGyRZIU8ml2-W9_FtgTkMYg/edit', comingSoon:true, skills:[] },

  { id:'m8w1', label:'Set 1', locked:true, module:'Ensemble & Performance',       moduleNum:8, unit:'Module 8 · Ensemble & Performance',       title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mxqrOHsRRRG1smLq2pfi0NplUBCOsflrZ6O13PBo06k/edit', comingSoon:true, skills:[] },
  { id:'m8w2', label:'Set 2', locked:true, module:'Ensemble & Performance',       moduleNum:8, unit:'Module 8 · Ensemble & Performance',       title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mxqrOHsRRRG1smLq2pfi0NplUBCOsflrZ6O13PBo06k/edit', comingSoon:true, skills:[] },
  { id:'m8w3', label:'Set 3', locked:true, module:'Ensemble & Performance',       moduleNum:8, unit:'Module 8 · Ensemble & Performance',       title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1mxqrOHsRRRG1smLq2pfi0NplUBCOsflrZ6O13PBo06k/edit', comingSoon:true, skills:[] },

  { id:'m9w1', label:'Set 1', locked:true, module:'Composition & Creativity',     moduleNum:9, unit:'Module 9 · Composition & Creativity',     title:'Set 1', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1FuhujeyL43MygvyYDTj6znTk8ZZPc0icFZzFtZPRxDs/edit', comingSoon:true, skills:[] },
  { id:'m9w2', label:'Set 2', locked:true, module:'Composition & Creativity',     moduleNum:9, unit:'Module 9 · Composition & Creativity',     title:'Set 2', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1FuhujeyL43MygvyYDTj6znTk8ZZPc0icFZzFtZPRxDs/edit', comingSoon:true, skills:[] },
  { id:'m9w3', label:'Set 3', locked:true, module:'Composition & Creativity',     moduleNum:9, unit:'Module 9 · Composition & Creativity',     title:'Set 3', subtitle:'Coming soon', handoutUrl:'https://docs.google.com/document/d/1FuhujeyL43MygvyYDTj6znTk8ZZPc0icFZzFtZPRxDs/edit', comingSoon:true, skills:[] },

]; // end WEEKS — do not remove this line


// ── TEMPLATE — copy this block to add a new set ─────────────
//
// {
//   id: 'm2w1',
//   label: 'Set 1',
//   locked: false,
//   module: 'Building a Chord Vocabulary',
//   moduleNum: 2,
//   unit: 'Module 2 · Building a Chord Vocabulary',
//   title: 'Set 1',
//   subtitle: 'One-line summary of the set',
//   objective: 'I CAN ...',
//   skillFocus: 'Topic · Topic · Topic',
//   handoutUrl: 'https://docs.google.com/document/d/YOUR_DOC_ID/edit',
//   comingSoon: false,
//
//   stations: {
//     b: {
//       title: 'Computer station — Watch · Listen · Practice',
//       time: '12 min',
//       steps: [
//         {
//           text: 'Watch: <a href="https://youtube.com/..." target="_blank">Video Title – Channel</a> (0:00–3:00).',
//           hint: 'As you watch: [what to think about or physically try].',
//           skills: [1, 2]   // which checklist skill numbers this step covers
//         }
//       ]
//     },
//     c: {
//       title: 'Practice station — independent drill',
//       time: '12 min',
//       steps: [
//         { text: 'Practice task here.', hint: 'Optional tip.', skills: [3] }
//       ]
//     }
//   },
//
//   songs: [
//     { name: '"Song Title" — Artist', meta: 'What skill it practices', type: 'Core', core: true,  url: 'https://youtube.com/watch?v=...' },
//     { name: '"Song Title" — Artist', meta: 'What skill it practices', type: 'Rock', core: false, url: 'https://youtube.com/watch?v=...' }
//   ],
//
//   videos: [ ... ],
//   assessment: { goal: '...', performance: '...', selfCheck: '...', standards: ['Pr.4'] },
//   skills: [
//     { id: 'm2w1-s1', text: 'Skill description shown on the checklist' }
//   ]
// },
