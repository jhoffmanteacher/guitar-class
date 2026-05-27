// ============================================================
//  MODULE 4 — Major / Minor / Blues Pentatonic Scales
//  Edit this file to change Module 4 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm4w1',
    label: 'Set 1',
    locked: false,
    module: 'Major / Minor / Blues Pentatonic Scales',
    moduleNum: 4,
    unit: 'Module 4 · Major / Minor / Blues Pentatonic Scales',
    title: 'Set 1',
    subtitle: 'Pentatonic Pattern 1 · Major & minor positioning · Improvising on E & A strings',
    objective: 'I CAN play Pentatonic Pattern 1 ascending and descending, and position it for major and minor keys.',
    skillFocus: 'What is a scale? · Pentatonic Pattern 1 fingering · Major vs minor positioning (4th finger vs 1st finger on root) · Alternate picking · Improvise a 2-bar phrase over a backing track',
    handoutUrl: 'https://docs.google.com/document/d/1Wmf3XYqMAKXoQ8ZxPv_Feb9HiySl_5xtYXWpQTv7a6w/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/XxICTF-NIZ8" target="_blank">Minor Pentatonic Scale – JustinGuitar</a> (0:00–5:00).',
            hint: 'Follow along on your guitar as he shows the pattern. Pause and find each note before he names it.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'For A minor pentatonic Pattern 1, where does your 1st finger sit on the low E string?', choices: [
              '5th fret',
              '3rd fret',
              'The open string',
              '7th fret'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/dJfV7DsTThc" target="_blank">Blues Scale Explained – Marty Music</a> (0:00–4:00).',
            hint: 'Focus on the Pattern 1 shape — how does it sit on the neck? Notice where the root note is.',
            skills: [1, 3],
            response: { type: 'short', placeholder: 'Describe the Pattern 1 shape. Where is the root note?' }
          },
          {
            text: 'Try positioning Pattern 1 as C major pentatonic: place your 4th finger on the 8th fret of string 6 (the note C). Play the pattern up and down slowly.',
            hint: 'Major pentatonic: 4th finger on root. Minor pentatonic: 1st finger on root. Same pattern — different finger on the starting note.',
            skills: [3, 4],
            response: { type: 'mc', prompt: 'For MAJOR pentatonic in Pattern 1, which finger plays the root note?', choices: [
              '4th finger (pinky)',
              '1st finger (index)',
              '2nd finger (middle)',
              'It does not matter which finger'
            ] }
          }
        ]
      },
      c: {
        title: 'Practice station — pattern drill & first improvisation',        steps: [
          {
            text: 'Set metronome to 60 BPM. Play Pentatonic Pattern 1 ascending (low to high), one note per beat. Use alternate picking (down-up-down-up). Click "Play all" to hear it.',
            hint: 'Go as slow as you need. Every note should ring cleanly. Say each note aloud as you play it to connect your ear to your fingers.',
            skills: [1, 2, 5],
            playSeq: { label: 'Play all', bpm: 60, notes: [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72] }
          },
          {
            text: 'Position Pattern 1 for A minor pentatonic (1st finger on 5th fret, string 6). Use the TAB below as a map. Play up and down. Then shift to E minor pentatonic (open string root). Notice the pattern is the same!',
            hint: 'A minor: your hand sits around frets 5–8. E minor: your hand starts at the open string and you\'ll use frets 3 and 5 instead of 1st finger.',
            skills: [3, 4],
            tab: {
              caption: 'A minor pentatonic Pattern 1 · ascending across all 6 strings',
              notes: [
                { string: 'E', fret: 5, note: 'A', midi: 45 },
                { string: 'E', fret: 8, note: 'C', midi: 48 },
                { string: 'A', fret: 5, note: 'D', midi: 50 },
                { string: 'A', fret: 7, note: 'E', midi: 52 },
                { string: 'D', fret: 5, note: 'G', midi: 55 },
                { string: 'D', fret: 7, note: 'A', midi: 57 },
                { string: 'G', fret: 5, note: 'C', midi: 60 },
                { string: 'G', fret: 7, note: 'D', midi: 62 },
                { string: 'B', fret: 5, note: 'E', midi: 64 },
                { string: 'B', fret: 8, note: 'G', midi: 67 },
                { string: 'e', fret: 5, note: 'A', midi: 69 },
                { string: 'e', fret: 8, note: 'C', midi: 72 }
              ]
            }
          },
          {
            text: 'Pick two notes from the pattern on the same string. Play them in any order, varying the rhythm. This is your first improvisation! Aim for 4–5 note ideas, then pause.',
            hint: 'You don\'t need to play a lot of notes. A short, clear idea is better than a stream of notes. Leave space — silence is part of music.',
            skills: [6]
          }
        ]
      }
    },

    songs: [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Solo using Am pentatonic Pattern 1 over E & A strings', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Solo over chorus using C major pentatonic (E & A)', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Solo using E minor pentatonic (E & A strings)', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"12-bar blues in E"', meta: 'E minor pentatonic — classic improv context', type: 'Choice', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=pJL2j2v6XZM' },
      { name: '"Pride and Joy" — Stevie Ray Vaughan', meta: 'E blues scale, E & A strings', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=I3MTGhRC82s',
        tutorialUrl: 'https://www.youtube.com/watch?v=en7JMIO6yxI' },
      { name: '"Boom Boom" — John Lee Hooker', meta: 'E blues pentatonic — call and response phrasing', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=jZv04xAejrc',
        tutorialUrl: 'https://www.youtube.com/watch?v=dutLP1SoSLs' },
      { name: '"La Grange" — ZZ Top', meta: 'E blues scale riff', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=rG6b8gjMEkw',
        tutorialUrl: 'https://www.youtube.com/watch?v=qkwjcsCVl_4' },
      { name: '"Mannish Boy" — Muddy Waters', meta: 'E string riff — feel the blues', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=bSfqNEvykv0',
        tutorialUrl: 'https://www.youtube.com/watch?v=SoZjsptxc04' }
    ],

    assessment: {
      goal: 'Plays minor pentatonic ascending and descending · Plays major pentatonic on E & A strings · Uses alternate picking · Improvises a 2-bar phrase over a backing track · Identifies minor vs major pentatonic by ear',
      performance: 'Partner or class: each student improvises 4 bars over a teacher-played Am chord. Goal is one clear phrase, not speed.',
      selfCheck: 'Can you play Pattern 1 up and down without stopping? Can you position it for both Am and Em pentatonic?',
      standards: ['Cr.1a', 'Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm4w1-s1', text: 'Play Pentatonic Pattern 1 ascending and descending from memory',
        gotItWhen: 'you can play the full pattern up and back down without looking at a diagram, with no missed notes or hesitations.' },
      { id: 'm4w1-s2', text: 'Use alternate picking (down-up) consistently through the pattern',
        gotItWhen: 'your pick alternates down-up-down-up automatically — you don\'t have to think about which direction comes next.' },
      { id: 'm4w1-s3', text: 'Position Pattern 1 as a minor pentatonic scale (1st finger on root)',
        gotItWhen: 'someone names a minor key (Am, Em, Gm…) and you can place your 1st finger on the right fret of the low E and play the pattern from there.' },
      { id: 'm4w1-s4', text: 'Position Pattern 1 as a major pentatonic scale (4th finger on root)',
        gotItWhen: 'someone names a major key (C, G, D…) and you can place your 4th finger on the right fret of the low E and play the pattern from there.' },
      { id: 'm4w1-s5', text: 'Play the pattern in time at 60 BPM with a metronome',
        gotItWhen: 'every note lands on a beat at 60 BPM and you can play the whole pattern without stopping or losing the click.' },
      { id: 'm4w1-s6', text: 'Improvise a short 2-bar musical idea using 2–3 notes from the pattern',
        gotItWhen: 'you can play a 2-bar phrase that feels intentional — not random — using just 2 or 3 notes from the pattern.' }
    ]
  },

  {
    id: 'm4w2',
    label: 'Set 2',
    locked: false,
    module: 'Major / Minor / Blues Pentatonic Scales',
    moduleNum: 4,
    unit: 'Module 4 · Major / Minor / Blues Pentatonic Scales',
    title: 'Set 2',
    subtitle: 'Tone parameters · Phrasing strategies · Notes on D & G strings',
    objective: 'I CAN use dynamics, timbre, and note shape to play expressively, and phrase a solo using call-and-response.',
    skillFocus: 'Dynamics (p, mf, f) · Timbre (bridge vs neck) · Envelope (attack, sustain, release) · Phrasing: one/two/three-note solos · Call-and-response · Notes on strings 4 (D) and 3 (G)',
    handoutUrl: 'https://docs.google.com/document/d/1Wmf3XYqMAKXoQ8ZxPv_Feb9HiySl_5xtYXWpQTv7a6w/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/RMdkevqJDDk" target="_blank">Pentatonic Scale Across Strings – Simen Otnes</a> (0:00–4:00).',
            hint: 'Notice how he varies his attack — some notes are loud, some soft. That\'s dynamics. Try to copy his feel, not just his notes.',
            skills: [1, 2],
            response: { type: 'short', placeholder: 'In your own words: what are dynamics, and how did he use them?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/3x6k7zHkqmA" target="_blank">Hammer-Ons and Pull-Offs – JustinGuitar</a> (full video).',
            hint: 'These are your first "expressive" techniques. A hammer-on connects two notes with one pick stroke — it changes the shape (envelope) of the notes.',
            skills: [3],
            response: { type: 'mc', prompt: 'A hammer-on connects two notes using how many pick strokes?', choices: [
              'One pick stroke',
              'Two pick strokes',
              'Zero pick strokes',
              'Depends on the speed'
            ] }
          },
          {
            text: 'Experiment with timbre: play a note close to the bridge, then the same note near the neck. Hear the difference? Bright vs warm. Try to match the mood of a song you know.',
            hint: 'There\'s no wrong answer here. Your picking hand position is a real-time tone control. Move it consciously.',
            skills: [2, 4],
            response: { type: 'mc', prompt: 'Which picking position sounds BRIGHTER?', choices: [
              'Close to the bridge',
              'Close to the neck',
              'Right over the soundhole',
              'They sound exactly the same'
            ] }
          }
        ]
      },
      c: {
        title: 'Practice station — phrasing & D/G strings',        steps: [
          {
            text: '"The One-Note Solo": choose one note in the Am pentatonic pattern. Play only that note over 8 bars, varying the rhythm, dynamics, and tone. Record it if you can and listen back.',
            hint: 'This sounds easy but isn\'t. Can you make one note interesting for 8 whole bars? The way you play it matters more than how many notes you play.',
            skills: [1, 2, 5]
          },
          {
            text: 'Call-and-response phrasing: play a 2-bar musical idea (call), pause 1 bar, then answer it with a 2-bar idea (response). The call should end on a non-root note; the response should land on the root.',
            hint: 'Think of it like a musical question and answer. The call feels unresolved; the response feels like it arrives somewhere.',
            skills: [5, 6]
          },
          {
            text: 'Learn the natural notes on the D string: D · E · F · G · A · B · C (frets 0–10). Play each slowly and say the name aloud. Click "Play all" to hear the sequence at 60 BPM.',
            hint: 'Same musical alphabet pattern you know from E and A strings. Find the pattern — it repeats!',
            skills: [7],
            playSeq: { label: 'Play all', bpm: 60, notes: [50, 52, 53, 55, 57, 59, 60] }
          },
          {
            text: 'Now do the same on the G string: G · A · B · C · D · E · F (frets 0–10). Play each slowly and say the name aloud.',
            hint: 'Notice the same pattern of whole and half steps — the musical alphabet behaves the same way on every string.',
            skills: [7],
            playSeq: { label: 'Play all', bpm: 60, notes: [55, 57, 59, 60, 62, 64, 65] }
          }
        ]
      }
    },

    songs: [
      { name: '"Happy Birthday"', meta: 'One-note solo exercise over G major pentatonic pattern', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full solo using Am pentatonic across 4 strings', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Melodic solo over verse — C major pentatonic', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"Comfortably Numb" — Pink Floyd', meta: 'Simplified solo — great for call-and-response phrasing', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=7kWl-ZGMwkQ',
        tutorialUrl: 'https://www.youtube.com/watch?v=tSgd3lAdM9o' },
      { name: '"Still Got the Blues" — Gary Moore', meta: 'Slow blues — focus on tone and note shape', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=0h0fLUweizI',
        tutorialUrl: 'https://www.youtube.com/watch?v=aQQKb_KMxts' },
      { name: '"The Thrill Is Gone" — BB King', meta: 'B minor blues — dynamics and phrasing focus', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=kpC69qIe02E',
        tutorialUrl: 'https://www.youtube.com/watch?v=NrEu8tO0mnQ' },
      { name: '"Sweet Home Chicago" — Robert Johnson', meta: 'Blues pentatonic — 4-string range', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=Ug0ZRSbmCRM',
        tutorialUrl: 'https://www.youtube.com/watch?v=Ld2QKvErNxY' },
      { name: '"Wish You Were Here" — Pink Floyd', meta: 'Arpeggios and melodic phrasing', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=K6qj09OHvjw',
        tutorialUrl: 'https://www.youtube.com/watch?v=r--wKmJmMhM' }
    ],

    assessment: {
      goal: 'Plays pentatonic across E, A, D, G strings · Crosses strings smoothly without pausing · Performs a hammer-on and pull-off · Plays a call-and-response phrase · Creates a 4-bar melodic solo · Applies to at least 2 course songs',
      performance: 'Partner check: play a 4-bar call-and-response solo over Am or C major. Partner identifies: does it resolve at the end?',
      selfCheck: 'Can you vary your dynamics on purpose (loud vs soft)? Can you play a clear call-and-response phrase where the "answer" lands on the root?',
      standards: ['Cr.1a', 'Pr.4a', 'Pr.5b']
    },

    skills: [
      { id: 'm4w2-s1', text: 'Vary dynamics consciously: play the same note at p, mf, and f',
        gotItWhen: 'you play the same note three times in a row and a listener can clearly hear that you got louder each time.' },
      { id: 'm4w2-s2', text: 'Change timbre by moving picking hand between bridge and neck',
        gotItWhen: 'a listener can hear the difference between your "bright" (near the bridge) and "warm" (near the neck) tones without you saying anything.' },
      { id: 'm4w2-s3', text: 'Perform a hammer-on and a pull-off',
        gotItWhen: 'you can produce the second note with no pick stroke — and it rings as clearly as a picked note.' },
      { id: 'm4w2-s4', text: 'Use "envelope": vary attack and note length intentionally',
        gotItWhen: 'you can play a short, sharp note and a long, sustained note on demand, and the difference is obvious to a listener.' },
      { id: 'm4w2-s5', text: 'Play a one-note solo that uses dynamics and rhythm for expression',
        gotItWhen: 'you can play one note for 8 bars and still hold someone\'s attention — because you change something each time.' },
      { id: 'm4w2-s6', text: 'Improvise a call-and-response phrase (call ends off root; response lands on root)',
        gotItWhen: 'a listener can hear the question (call) and the answer (response) — the call feels unresolved, the response feels like it arrives.' },
      { id: 'm4w2-s7', text: 'Name all natural notes on the D string (frets 0–8) and G string (frets 0–8)',
        gotItWhen: 'someone calls out any fret 0–10 on D or G and you can name the note instantly without counting up from the open string.' }
    ]
  },

  {
    id: 'm4w3',
    label: 'Set 3',
    locked: false,
    module: 'Major / Minor / Blues Pentatonic Scales',
    moduleNum: 4,
    unit: 'Module 4 · Major / Minor / Blues Pentatonic Scales',
    title: 'Set 3',
    subtitle: 'Scale theory · Blues scale · Compose an original solo',
    objective: 'I CAN explain how the pentatonic scale is built, add the blues note, and compose an original 4-bar solo.',
    skillFocus: 'Major scale construction (whole/half steps) · Major pentatonic = scale degrees 1 2 3 5 6 · Minor pentatonic = 1 ♭3 4 5 ♭7 · Blues scale: add ♭5 · Transposition · Compose and perform a 4-bar original solo',
    handoutUrl: 'https://docs.google.com/document/d/1Wmf3XYqMAKXoQ8ZxPv_Feb9HiySl_5xtYXWpQTv7a6w/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/XxICTF-NIZ8" target="_blank">Full Pentatonic Box 1 – JustinGuitar</a> (5:00–end).',
            hint: 'This time focus on the theory section. How does he explain the relationship between major and minor pentatonic? Can you see the relative major/minor connection?',
            skills: [1, 2],
            response: { type: 'short', placeholder: 'Explain the relative major/minor connection in your own words.' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/GI7s3ZwXOJg" target="_blank">Vibrato Technique – Simen Otnes</a> (full video).',
            hint: 'Vibrato is a small, controlled pitch wobble on a sustained note. Try it on the 5th fret, string 1. Rock your finger back and forth gently. It takes weeks to develop — just start!',
            skills: [3],
            response: { type: 'mc', prompt: 'Vibrato is best described as:', choices: [
              'A small, controlled pitch wobble on a sustained note',
              'Playing two notes at the same time',
              'Bending the string up a whole step',
              'Sliding between two frets quickly'
            ] }
          },
          {
            text: 'Theory check: the blues scale adds one note to the minor pentatonic — the ♭5 (flat 5). In A minor, that\'s the note Eb. Find it on the fretboard between the 4th and 5th scale degrees.',
            hint: 'In Pattern 1 for A minor, the ♭5 sits between the 4 and 5 on the D string. It\'s a "passing tone" — it creates tension that wants to resolve.',
            skills: [4, 5],
            response: { type: 'mc', prompt: 'What is the "blue note" added to the minor pentatonic to make a blues scale?', choices: [
              'The ♭5 (flat 5)',
              'The major 3rd',
              'The ♭7 (flat 7)',
              'The 2nd'
            ] }
          }
        ]
      },
      c: {
        title: 'Practice station — theory in action & original solo',        steps: [
          {
            text: 'Write out the C major pentatonic scale degrees: 1 (C), 2 (D), 3 (E), 5 (G), 6 (A). Then write A minor pentatonic: 1 (A), ♭3 (C), 4 (D), 5 (E), ♭7 (G). Notice: same notes, different starting point — these are relative scales!',
            hint: 'C major pentatonic and A minor pentatonic share exactly the same five notes. Your hand position is the same — only which note you treat as "home" (the root) changes.',
            skills: [1, 2]
          },
          {
            text: 'Compose a 4-bar original solo. Write out 4 sets of scale degree numbers (e.g., 1 3 5 3 | 6 5 3 1 | ...). Then play what you wrote. Vary the rhythms.',
            hint: 'Write first, then play! It\'s okay if it sounds simple. The goal is to make a deliberate musical decision, not to improvise randomly.',
            skills: [6, 7]
          },
          {
            text: 'Perform your original 4-bar solo over the "All Along the Watchtower" or "Vampire" backing track. Include at least one hammer-on, pull-off, or attempt at vibrato.',
            hint: 'Include at least one technique (hammer-on, pull-off, or vibrato) in your solo. Don\'t just run scales — tell a story!',
            skills: [3, 6, 7]
          }
        ]
      }
    },

    songs: [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full solo over Am pentatonic — unit-end performance', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Full solo — C major / A minor pentatonic', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"Happy Birthday"', meta: 'Full melodic reharmonization using pentatonic', type: 'Core', core: true,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'E minor pentatonic solo', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"Purple Haze" — Jimi Hendrix', meta: 'E pentatonic box — full pattern', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=WGoDaYjdfSg',
        tutorialUrl: 'https://www.youtube.com/watch?v=gKhmARXdWGE' },
      { name: '"Back in Black" — AC/DC', meta: 'Simplified solo intro — A minor pentatonic', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=pAgnJDJN4VA',
        tutorialUrl: 'https://www.youtube.com/watch?v=aeYDJciDuao' },
      { name: '"Johnny B. Goode" — Chuck Berry', meta: 'B pentatonic — classic rock phrasing', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=_SYl2wTNM-w',
        tutorialUrl: 'https://www.youtube.com/watch?v=H8prc_T7zhU' },
      { name: '"Folsom Prison Blues" — Johnny Cash', meta: 'E pentatonic — melodic and rhythmic', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=U9uk6NHK-AE',
        tutorialUrl: 'https://www.youtube.com/watch?v=szdTIPVLwa4' },
      { name: '"La Bamba" — Ritchie Valens', meta: 'C major pentatonic — bright and fun', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=BycLmWI97Nc',
        tutorialUrl: 'https://www.youtube.com/watch?v=o-SdTXIAvTE' }
    ],

    assessment: {
      goal: 'Unit-end: Perform an original 4-bar solo over a teacher-chosen course song backing track using the full minor pentatonic box. Include at least one hammer-on, pull-off, or vibrato. Name the scale you used.',
      performance: 'Individual: perform original 4-bar solo for the class or teacher. State which scale and root you used before playing.',
      selfCheck: 'Can you explain the difference between major and minor pentatonic? Can you add the blues note? Can you perform your original solo without looking at your notes?',
      standards: ['Cr.1a', 'Cr.2a', 'Pr.6a']
    },

    skills: [
      { id: 'm4w3-s1', text: 'Explain what a major pentatonic scale is (degrees 1 2 3 5 6)',
        gotItWhen: 'you can list the scale degrees from memory and name the 5 notes in any major key when asked.' },
      { id: 'm4w3-s2', text: 'Explain what a minor pentatonic scale is (degrees 1 ♭3 4 5 ♭7)',
        gotItWhen: 'you can list the minor pentatonic degrees from memory and explain why two of them are flatted compared to the major scale.' },
      { id: 'm4w3-s3', text: 'Add vibrato on at least one sustained note',
        gotItWhen: 'your finger rocks back and forth on a sustained note and the pitch wobbles intentionally — not from shaking nerves.' },
      { id: 'm4w3-s4', text: 'Identify and play the ♭5 blues note within Pattern 1',
        gotItWhen: 'you can find the ♭5 anywhere in Pattern 1 and use it as a passing tone — not a landing point.' },
      { id: 'm4w3-s5', text: 'Explain how C major pentatonic and A minor pentatonic are relative scales',
        gotItWhen: 'you can explain that they share the same 5 notes — only the root changes — and prove it on the fretboard.' },
      { id: 'm4w3-s6', text: 'Compose and write out a 4-bar original solo using scale degrees',
        gotItWhen: 'you have 4 bars written down in scale-degree numbers and you can play exactly what you wrote — not improvise something different.' },
      { id: 'm4w3-s7', text: 'Perform the original solo over a course song backing track from memory',
        gotItWhen: 'you can play your 4-bar solo all the way through with the backing track without checking your written notes.' }
    ]
  }

); // end module-4.js

MODULE_REVIEWS[4] = {
  moduleNum: 4,
  module: 'Major / Minor / Blues Pentatonic Scales',
  skills: [
    { id: 'mr4-s1', text: 'I can play Pentatonic Pattern 1 ascending and descending from memory' },
    { id: 'mr4-s2', text: 'I can use alternate picking (down-up) consistently through the pattern' },
    { id: 'mr4-s3', text: 'I can position Pattern 1 for both major and minor pentatonic' },
    { id: 'mr4-s4', text: 'I can improvise a call-and-response phrase that resolves on the root' },
    { id: 'mr4-s5', text: 'I can compose and perform an original 4-bar solo over a course song' }
  ],
  standards: ['Cr.1a', 'Cr.2a', 'Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a']
};
