// ============================================================
//  MODULE 4 — Major / Minor / Blues Pentatonic Scales
//  Edit this file to change Module 4 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm4w1',
    songThread: [{ name: 'Seven Nation Army', journey: 'tabs/seven-nation-army.html', layer: 4, note: 'solo over the riff' }, { name: 'All Along the Watchtower', journey: 'tabs/all-along-the-watchtower.html', layer: 4, note: 'improvise over its backing track' }, { name: 'Luna', journey: 'tabs/luna.html', layer: 4, note: 'Dm pentatonic in its highest box' }],
    label: 'Set 1',
    locked: false,
    module: 'Major / Minor / Blues Pentatonic Scales',
    moduleNum: 4,
    unit: 'Module 4 · Major / Minor / Blues Pentatonic Scales',
    title: 'Set 1',
    subtitle: 'Pentatonic Pattern 1 · Major & minor positioning · Improvising on E & A strings',
    objective: 'I CAN play Pentatonic Pattern 1 ascending and descending, and position it for major and minor keys.',
    skillFocus: 'Playing Pentatonic Pattern 1 · Positioning it for major and minor keys · Improvising with the scale',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://www.youtube.com/watch?v=l6ayje1ug_0" target="_blank">The Minor Pentatonic Scale on Guitar Explained – Lauren Bateman (0:00–5:00)</a>. As you watch, follow along on your guitar — pause and find each note BEFORE she names it.',
            hint: 'Follow along on your guitar as she shows the pattern. Pause and find each note before she names it.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'For A minor pentatonic Pattern 1, where does your 1st finger sit on the low E string?',
              answer: 0,
              explain: 'The root A is at fret 5 on the low E, and in minor pentatonic Pattern 1 your 1st finger plays the root — so 5th fret.',
              choices: [
              '5th fret',
              '3rd fret',
              'The open string',
              '7th fret'
            ] }
          },
          {
            // Reviewed by Jonathan 2026-07-11: fits Set 1; start at 1:45 (the link jumps there — the intro before is skippable).
            text: 'Watch: <a href="https://youtu.be/m_IiyJu60-c?t=105" target="_blank">Major Pentatonic Scale – Marty Music</a> (the link jumps to 1:45, where the lesson starts — watch to about 4:00). As you watch, find the root note on your own neck and play the shape up once before answering below.',
            hint: 'Focus on the Pattern 1 shape — how does it sit on the neck? Notice where the root note is.',
            skills: [1, 3],
            response: { type: 'short', placeholder: 'Describe the Pattern 1 shape. Where is the root note?' }
          }
            ]
          },
          {
            title: 'Position the pattern yourself',
            steps: [
          {
            text: 'Try positioning Pattern 1 as C major pentatonic: place your 4th finger on the 8th fret of string 6 (the note C). Play the pattern up and down slowly. Click "Hear C major pentatonic" below to check your ear against it.',
            hint: 'Major pentatonic: 4th finger on root. Minor pentatonic: 1st finger on root. Same pattern — different finger on the starting note.',
            skills: [3, 4],
            playSeq: { label: 'Hear C major pentatonic', bpm: 60, notes: [48, 50, 52, 55, 57, 60] },
            response: { type: 'mc', prompt: 'For MAJOR pentatonic in Pattern 1, which finger plays the root note?',
              answer: 0,
              explain: 'Same shape, different root: in MAJOR pentatonic your 4th finger (pinky) sits on the root; in minor it\'s the 1st finger.',
              choices: [
              '4th finger (pinky)',
              '1st finger (index)',
              '2nd finger (middle)',
              'It does not matter which finger'
            ] }
          }
            ]
          },
          {
            title: 'Listen — major vs minor moods',
            steps: [
          {
            text: 'Match the mood — scale choice changes the feel. Listen to two short solos: <a href="https://www.youtube.com/watch?v=BycLmWI97Nc" target="_blank" data-ext="1">Clip 1 — "La Bamba"</a> (major pentatonic) then <a href="https://www.youtube.com/watch?v=kpC69qIe02E" target="_blank" data-ext="1">Clip 2 — "The Thrill Is Gone"</a> (minor / blues). Notice how the major-pentatonic solo sounds brighter and happier, while the minor / blues solo sounds darker and moodier.',
            hint: 'Major pentatonic = brighter, sunnier. Minor / blues = darker, sadder, more "bluesy." Same instrument — the scale choice sets the mood.',
            response: { type: 'mc', prompt: 'Which solo sounds darker / more "blues"?',
              answer: 1,
              explain: 'Clip 2 ("The Thrill Is Gone") uses the minor / blues scale — darker and moodier. Clip 1 ("La Bamba") is major pentatonic — brighter and sunnier.',
              choices: [
              'Clip 1 (major pentatonic)',
              'Clip 2 (minor / blues)',
              'No difference'
            ] }
          },
          {
            text: 'In one word each, name the mood you heard in the two clips above.',
            hint: 'There\'s no wrong answer — trust your ear. Words like "bright," "happy," "dark," "sad," or "moody" all work.',
            response: { type: 'short', prompt: 'In one word, describe the mood of each clip.', placeholder: 'Clip 1: ____   ·   Clip 2: ____' }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — pause and think: when you positioned Pattern 1 today, what told you whether you were set up for MAJOR or MINOR — the finger on the root, or the sound? Which felt more reliable?',
            response: { type: 'short', placeholder: 'e.g. I trusted the finger (4th = major, 1st = minor) more than my ear so far' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — pattern drill & first improvisation',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Tuning (Module 1) is a skill you keep forever. As you climb the pentatonic pattern today, keep naming the notes too — that\'s your Module 2 fretboard map in action.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Play Pattern 1 with alternate picking',
            steps: [
          {
            text: 'Challenge 1 — Pattern 1 Climb (skills-check warm-up): play Pentatonic Pattern 1 ascending at 60 BPM, one note per beat, alternate picking (down-up-down-up). You\'ve got it when: every note rings clean with no missed picks. This is a warm-up drill — the module assessment is your own 4-bar solo (you\'ll compose it in Set 3), held to the backing track\'s pulse — but this is the benchmark lap (a lap = one full time through) for your Set 1 check-off. Click "Play all" to hear it.',
            hint: 'Go as slow as you need. Every note should ring cleanly. Say each note aloud as you play it to connect your ear to your fingers. Set the ⏱ Timer for 2 minutes and loop it.',
            stuck: 'Drop to the lowest two strings only (E and A) and climb just those until they\'re clean, then add the rest one string at a time.',
            levelUp: 'Play it descending too (top to bottom), or raise the metronome to 80 BPM and keep the picking strictly down-up.',
            skills: [1, 2, 5],
            playSeq: { label: 'Play all', bpm: 60, notes: [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72] },
            response: { type: 'short', prompt: 'Personal record: play it cleanly at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN climb today (BPM)?', placeholder: 'e.g. 80 — try for a higher number next session' }
          }
            ]
          },
          {
            title: 'Position Pattern 1 for major & minor',
            steps: [
          {
            text: 'Challenge 2 — Move the Box (a box = the block of frets where a scale pattern sits): play Pattern 1 as A minor pentatonic (1st finger, 5th fret, string 6) up and down using the TAB map, then shift it to E minor pentatonic (open-string root). You\'ve got it when: both positions clean — same shape, two spots on the neck.',
            hint: 'A minor: your hand sits around frets 5–8. E minor: the open strings do your 1st finger\'s job, and your other fingers play frets 2 and 3.',
            stuck: 'Stay on A minor only until the shape is automatic, then slide the whole hand down to find E minor — it\'s the exact same finger pattern, just moved.',
            levelUp: 'Position it a third place — G minor (3rd fret root) — or call out the root note name before you start each box.',
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
          }
            ]
          },
          {
            title: 'Improvise your first solo',
            steps: [
          {
            text: 'Challenge 3 — Rule of 3 (try it!): improvise using ONLY 3 notes of Pattern 1 for 4 bars over the Am backing track — <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; Am jam track</a>. Once those 3 feel comfortable, add a 4th note and play 4 more bars. No score — aim for short, intentional ideas with space between them.',
            hint: 'Limiting yourself to 3 notes forces you to make music with phrasing and rhythm, not note-count. A short, clear idea with silence around it is better than a stream of notes.',
            stuck: 'Pick just 2 notes on one string and trade them back and forth, changing only the rhythm — that\'s already improvising.',
            levelUp: 'Add a 4th and 5th note, or end every phrase on the root (A) so each idea "arrives home" (home = the note the music rests on and sounds finished).',
            skills: [6]
          },
          {
            text: 'Challenge 4 — The Four-Phrase Plan: use the SAME 3 notes from Rule of 3, but now shape a whole solo with four short phrases — about one bar each, silence between them (the space IS part of the plan). Give each phrase a job: <strong>Phrase 1 — say it</strong> (a tiny idea, 2–4 notes). <strong>Phrase 2 — repeat it</strong> (play that same idea again, maybe with one note changed). <strong>Phrase 3 — stretch it</strong> (take the idea higher, or keep the notes and change the rhythm). <strong>Phrase 4 — come home</strong> (end on the root, A, so the solo lands). Play it over the Am backing track — <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; Am jam track</a>. You\'ve got it when: four distinct phrases with space between them, and the last one lands on the root (A).',
            hint: 'This is Rule of 3 with a road map. Say-it / repeat-it / stretch-it / come-home turns three notes into a story with a beginning, middle, and ending — instead of a random string of notes.',
            stuck: 'Make Phrases 1 and 2 EXACTLY the same — note for note. Repeating an idea isn\'t cheating, it\'s how nearly every melody you know works. Your ear is waiting to hear it come back.',
            levelUp: 'Name the four jobs out loud — "say it… repeat it… stretch it… come home" — before you play each phrase, or run the whole plan over the Am backing track and hold the track\'s pulse start to finish.',
            skills: [6],
            response: { type: 'short', prompt: 'Describe your Phrase 1 "say it" idea in words — which notes, and its rhythm?', placeholder: 'e.g. A then C, two quick notes' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Solo over Seven Nation Army: loop the SNA riff (a riff = a short musical phrase that repeats) in your head (or record yourself playing the riff and jam over the playback) and improvise using ONLY these three notes — low E, G, and open A — for four bars. Rule of 3: short ideas, space between them. You\'ve got it when: four bars of intentional phrases — not a stream of notes — that land back on E. <a href="tabs/seven-nation-army.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                hint: 'E is the note this song centers on. End every phrase on it and you\'ll always sound like you meant it.',
                stuck: 'Play just E and G, trading two-beat phrases with silence: play two beats, rest two beats.',
                levelUp: 'Add the open D string as a fourth note, or record the riff on a loop and trade fours with your recording (trade fours = play 4 bars, then let the recording play 4) — or with anyone at home who\'ll play it.',
                skills: [6],
                tab: {
                  caption: 'Your three allowed notes — E minor pentatonic, open position',
                  notes: [
                    { string: 'E', fret: 0, note: 'E', midi: 40 },
                    { string: 'E', fret: 3, note: 'G', midi: 43 },
                    { string: 'A', fret: 0, note: 'A', midi: 45 }
                  ]
                },
                response: { type: 'short', prompt: 'Describe your best phrase in words — what made it feel finished?', placeholder: 'e.g. two quick notes then a long E' }
              },
              {
                text: 'Challenge — Solo over Watchtower: the song\'s loop is Am · G · F · G — and A minor pentatonic Pattern 1 (the box you just learned) fits every bar of it. Improvise four bars using only the three notes marked below, then four more adding a fourth note of your choice from Pattern 1. You\'ve got it when: eight bars where every phrase starts or ends on A. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                hint: 'This is the same box from your Pattern 1 drill — you\'re not learning anything new, you\'re USING it. That\'s the whole point of today.',
                stuck: 'Freeze the rhythm: only quarter notes, only the three marked notes, until an idea shows up on its own.',
                levelUp: 'Start a phrase during the F bar and resolve it on the Am bar — that\'s real tension and release.',
                skills: [6],
                tab: {
                  caption: 'Your three starting notes — Am pentatonic Pattern 1 · 5th position',
                  notes: [
                    { string: 'A', fret: 7, note: 'E', midi: 52 },
                    { string: 'D', fret: 5, note: 'G', midi: 55 },
                    { string: 'D', fret: 7, note: 'A', midi: 57 }
                  ]
                },
                response: { type: 'short', prompt: 'Which chord in the loop was easiest to solo over, and which fought you?', placeholder: 'e.g. Am easy, F felt weird' }
              },
              {
                text: 'Challenge — Watchtower, the real rhythm: you\'ve played this bass line since Module 2 — but always one even note per beat. Listen to the recording, find the riff\'s TAB with rhythm stems (Songsterr shows them clearly), and play it the way the record actually goes — each root held a full two beats, not one. You\'ve got it when: you can loop A · G · F · G along with the record and stay locked with it. <a href="tabs/all-along-the-watchtower.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 2 of 5</a>.',
                hint: 'The frets haven\'t changed since Module 2 — only the rhythm reading is new. That\'s the whole point of this step: same notes, real music.',
                stuck: 'Clap the record\'s rhythm first, no guitar — one clap per root, holding through the silence — then add the frets back once your hands know the shape of the timing.',
                levelUp: 'Play it as power chords instead of single notes — same two-beat holds, fuller sound.',
                response: { type: 'short', prompt: 'What did you notice, holding each root for two beats instead of one?', placeholder: 'e.g. it finally sounds like the song, not an exercise' }
              },
              {
                text: 'Challenge — Solo over Luna: Luna lives in F major, and F\'s relative minor is D — so D minor pentatonic Pattern 1 (root D, low E fret 10) is your box: the exact shape you\'ve been drilling, parked at the course\'s highest position. Improvise four bars using only the three notes marked below, then four more adding a fourth note from the box. Jam over <a href="https://www.youtube.com/watch?v=wBxFnX_V9mQ" target="_blank">▶ &#x1F3B5; Luna\'s Dm backing track</a>. You\'ve got it when: eight bars where every phrase starts or ends on D. <a href="tabs/luna.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                hint: 'Same Pattern 1 shape — just at fret 10. This high up, the frets sit closer together, so the stretch is easier than it looks.',
                stuck: 'Trade just D and F (frets 10 and 13 on the low E) back and forth, changing only the rhythm, until an idea appears.',
                levelUp: 'End every phrase on D so each idea arrives home — or hold the F (fret 13) a little longer for a sadder, longing feel.',
                skills: [6],
                tab: {
                  caption: 'Your three starting notes — D minor pentatonic Pattern 1 · 10th position',
                  notes: [
                    { string: 'E', fret: 10, note: 'D', midi: 50 },
                    { string: 'E', fret: 13, note: 'F', midi: 53 },
                    { string: 'A', fret: 10, note: 'G', midi: 55 }
                  ]
                },
                response: { type: 'short', prompt: 'Which note felt like "home" over the Dm track, and did your phrases land there?', placeholder: 'e.g. D at fret 10 — landed there most times' }
              }
            ]
          },
          {
            title: 'My Practice Routine — weekly check-in (never graded)',
            steps: [
              {
                text: 'Plan your practice — this one\'s just for you, never graded. Take two minutes to update your routine: (1) one thing you want to get better at, (2) when and where you\'ll practice this week, (3) how last week\'s plan went. Same check-in you\'ve kept since Module 1 — we keep it going through the whole course.',
                hint: 'No wrong answers — even five minutes a day is better than one long rushed session. You\'re building a habit you\'ll actually keep.',
                response: { type: 'short', placeholder: '1) One thing to improve   2) When & where I\'ll practice   3) How last week went' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Which felt harder today — playing the pattern cleanly, or making music with only 3 notes? Write it below — that\'s your warm-up target next time.',
                response: { type: 'short', placeholder: 'e.g. the pattern is clean; making 3 notes sound intentional is the hard part' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Plays minor pentatonic ascending and descending · Plays major pentatonic on E & A strings · Uses alternate picking · Improvises a 2-bar phrase over a backing track · Identifies minor vs major pentatonic by ear',
      performance: 'Solo: record yourself improvising 4 bars over an Am backing track — either "All Along the Watchtower" or "the cure" ▶ &#x1F3B5; Backing track button in the &#x1F3B5; Songs list at the bottom of Module 4 (both are in Am) — then listen back. Goal is one clear phrase, not speed.',
      selfCheck: 'Can you play Pattern 1 up and down without stopping? Can you position it for both Am and Em pentatonic?',
      standards: ['Cr.1a', 'Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm4w1-s1', text: 'Play Pentatonic Pattern 1 ascending and descending from memory',
        gotItWhen: 'you can play the full pattern up and back down without looking at a diagram, with no missed notes or hesitations.',
        practice: { type: 'playSeq', label: 'Am pentatonic Pattern 1 (ascending)', bpm: 70,
          notes: [45, 48, 50, 52, 55, 57, 60, 62, 64, 67, 69, 72] } },
      { id: 'm4w1-s2', text: 'Use alternate picking (down-up) consistently through the pattern',
        gotItWhen: 'your pick alternates down-up-down-up automatically — you don\'t have to think about which direction comes next.' },
      { id: 'm4w1-s3', text: 'Position Pattern 1 as a minor pentatonic scale (1st finger on root)',
        gotItWhen: 'you can pick any minor key (Am, Em, Gm…), place your 1st finger on the right fret of the low E, and play the pattern from there.',
        practice: { type: 'mc', prompt: 'Your 1st finger is on the low E string at fret 8. Which minor pentatonic scale are you set up to play?',
          choices: ['A minor', 'C minor', 'E minor', 'G minor'], answer: 1 } },
      { id: 'm4w1-s4', text: 'Position Pattern 1 as a major pentatonic scale (4th finger on root)',
        gotItWhen: 'you can pick any major key (C, G, D…), place your 4th finger on the right fret of the low E, and play the pattern from there.',
        practice: { type: 'mc', prompt: 'When you treat Pattern 1 as a MAJOR pentatonic, which finger sits on the root?',
          choices: ['1st (index)', '2nd (middle)', '3rd (ring)', '4th (pinky)'], answer: 3 } },
      { id: 'm4w1-s5', text: 'Play the pattern in time at 60 BPM with a metronome',
        gotItWhen: 'every note lands on a beat at 60 BPM and you can play the whole pattern without stopping or losing the click.' },
      { id: 'm4w1-s6', text: 'Improvise a short 2-bar musical idea using 2–3 notes from the pattern',
        gotItWhen: 'you can play a 2-bar phrase that feels intentional — not random — using just 2 or 3 notes from the pattern.' }
    ]
  },

  {
    id: 'm4w2',
    songThread: [{ name: 'Sweet Child O\' Mine', journey: 'tabs/sweet-child-o-mine.html', layer: 4, note: 'solo territory' }],
    label: 'Set 2',
    locked: false,
    module: 'Major / Minor / Blues Pentatonic Scales',
    moduleNum: 4,
    unit: 'Module 4 · Major / Minor / Blues Pentatonic Scales',
    title: 'Set 2',
    subtitle: 'Tone parameters · Phrasing strategies · Notes on D & G strings',
    objective: 'I CAN use dynamics, timbre, and note shape to play expressively, and phrase a solo using call-and-response.',
    skillFocus: 'Playing expressively with dynamics and tone · Phrasing a solo with call-and-response · Notes on the D and G strings',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://www.youtube.com/watch?v=1mT5nUE0o7M" target="_blank">How to USE the Minor Pentatonic Scale – Lauren Bateman (0:00–4:00)</a> to refresh the shape. Then YOU add the expression the video doesn\'t: pick one note from the pattern and play it loud, then soft — that difference in volume is dynamics.',
            hint: 'The video shows the notes; the dynamics are on you. Play one note loud, then whisper-soft, and listen for how much the FEEL changes even though the note doesn\'t.',
            skills: [1, 2],
            response: { type: 'short', placeholder: 'Describe your own loud-then-soft experiment: which note, and what changed in the sound?' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/7hDdZAjKBjY" target="_blank">Hammer-Ons & Pull-Offs Explained – JustinGuitar</a> (0:00–3:00). As you watch, try one hammer-on on your own guitar — pick the open D string, then hammer your finger onto the 2nd fret without picking again.',
            hint: 'These are your first "expressive" techniques. A hammer-on connects two notes with one pick stroke — it changes the shape (envelope) of the notes.',
            skills: [3],
            response: { type: 'mc', prompt: 'A hammer-on connects two notes using how many pick strokes?',
              answer: 0,
              explain: 'You pick the first note once, then "hammer" a finger onto the higher fret to sound the second note — one pick stroke for both.',
              choices: [
              'One pick stroke',
              'Two pick strokes',
              'Zero pick strokes',
              'Depends on the speed'
            ] }
          }
            ]
          },
          {
            title: 'Experiment with timbre',
            steps: [
          {
            text: 'Experiment with timbre: play a note close to the bridge, then the same note near the neck. Hear the difference? Bright vs warm. Try to match the mood of a song you know.',
            hint: 'There\'s no wrong answer here. Your picking hand position is a real-time tone control. Move it consciously.',
            skills: [2, 4],
            response: { type: 'mc', prompt: 'Which picking position sounds BRIGHTER?',
              answer: 0,
              explain: 'Picking close to the bridge gives a brighter, sharper tone; picking near the neck sounds warmer and rounder. Your picking hand is a live tone control.',
              choices: [
              'Close to the bridge',
              'Close to the neck',
              'Right over the soundhole',
              'They sound exactly the same'
            ] }
          }
            ]
          },
          {
            title: 'Name the D-string notes',
            steps: [
          {
            text: 'Now try it: the natural notes on the D string. Click any note below the TAB to hear it, then play and NAME each one up the string — D · E · F · G · A · B · C. You\'ll drill this without looking at the chart at the practice station.',
            hint: 'It\'s the same musical alphabet you know from the E and A strings. The gap between E–F and B–C is one fret (a half step). Every other gap is two frets (a whole step).',
            skills: [7],
            tab: {
              caption: 'D string natural notes · D E F G A B C (frets 0–10)',
              notes: [
                { string: 'D', fret: 0, note: 'D', midi: 50 },
                { string: 'D', fret: 2, note: 'E', midi: 52 },
                { string: 'D', fret: 3, note: 'F', midi: 53 },
                { string: 'D', fret: 5, note: 'G', midi: 55 },
                { string: 'D', fret: 7, note: 'A', midi: 57 },
                { string: 'D', fret: 9, note: 'B', midi: 59 },
                { string: 'D', fret: 10, note: 'C', midi: 60 }
              ]
            }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — pause and think: which expressive tool felt most natural today — dynamics (loud/soft), timbre (bright/warm), or the hammer-on? Which one will you lean on in your solos?',
            response: { type: 'short', placeholder: 'e.g. dynamics came easily; hammer-ons still feel unreliable' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — phrasing & D/G strings',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Tuning (Module 1) is a skill you keep forever. Today you\'re adding expression on top of clean notes — so the notes have to be clean first.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Play an expressive one-note solo',
            steps: [
          {
            text: 'Challenge 1 — The One-Note Solo: choose one note in the Am pentatonic pattern and play only that note for 8 bars, varying rhythm, dynamics, and tone. You\'ve got it when: make one note stay interesting for all 8 bars — record it and listen back.',
            hint: 'This sounds easy but isn\'t. Can you make one note interesting for 8 whole bars? The way you play it matters more than how many notes you play.',
            stuck: 'Just change ONE thing per bar — louder, then softer, then short, then long. That\'s already a one-note solo.',
            levelUp: 'Add a hammer-on or a slide into the note, or move your picking hand bridge-to-neck mid-phrase to change the tone live.',
            skills: [1, 2, 5]
          }
            ]
          },
          {
            title: 'Improvise a call-and-response phrase',
            steps: [
          {
            text: 'Challenge 2 — Call & Response (your assessment piece): over the Am backing track (<a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; Am jam track</a>), play a 2-bar idea (call), pause 1 bar, then answer with a 2-bar idea (response). You\'ve got it when: the call ends on a non-root note (unresolved) and the response lands on the root (arrives home). This — call-and-response — is one of the two phrasing strategies you\'ll name at your Set 3 assessment.',
            hint: 'Think of it like a musical question and answer. The call feels unresolved; the response feels like it arrives somewhere.',
            stuck: 'Use just 2–3 notes for both call and response — end the response on A (the root) every time so the "answer" always lands home.',
            levelUp: 'Record a 2-bar call and answer it live over the playback, or make the call longer than the response so the answer feels like a punchline. (Someone around? Trade: you call, they answer.)',
            skills: [5, 6]
          }
            ]
          },
          {
            title: 'Name the notes on the D & G strings',
            steps: [
          {
            text: 'Challenge 3 — D String Map: play the natural notes on the D string — D · E · F · G · A · B · C (frets 0–10) — slowly, saying each name aloud. You\'ve got it when: a clean lap up and back, without looking at the chart. Click "Play all" to hear it at 60 BPM.',
            hint: 'Same musical alphabet pattern you know from E and A strings. Find the pattern — it repeats! Set the ⏱ Timer for 2 minutes and see how many laps you get without looking at the chart.',
            stuck: 'Cover the chart and name just the first five notes (frets 0, 2, 3, 5, 7 — D, E, F, G, A) — find E–F and B–C, the two one-fret jumps, and the rest falls into place.',
            levelUp: 'Point to a random fret 0–10 without counting up and name the note in under 3 seconds, or run the string top-to-bottom (C back down to D).',
            skills: [7],
            playSeq: { label: 'Play all', bpm: 60, notes: [50, 52, 53, 55, 57, 59, 60] },
            response: { type: 'short', prompt: 'Personal record: play it cleanly at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN lap naming + playing the D string, without looking at the chart (BPM)?', placeholder: 'e.g. 80 — try for a higher number next session' }
          },
          {
            text: 'Challenge 4 — G String Map: same on the G string — G · A · B · C · D · E · F (frets 0–10), slowly, names aloud. You\'ve got it when: a clean lap up and back, without looking at the chart.',
            hint: 'Notice the same pattern of whole and half steps — the musical alphabet behaves the same way on every string.',
            stuck: 'Find the two half steps first — B–C (frets 4–5) and E–F (frets 9–10) — then fill in the whole-step gaps between them.',
            levelUp: 'Jump between strings: play D on the D string, then D on the G string, and name both — or quiz yourself on random frets against the clock.',
            skills: [7],
            playSeq: { label: 'Play all', bpm: 60, notes: [55, 57, 59, 60, 62, 64, 65] }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Sweet Child O\' Mine, solo-section feel: the famous outro solo lives in E minor pentatonic. Improvise four bars in the open position, then move the same shape up to the 12th fret and play four more — same pattern, one octave up, instant "solo voice." You\'ve got it when: both registers (register = how high or low the notes are), phrases with space, landing on E in each. <a href="tabs/sweet-child-o-mine.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 5</a>.',
                hint: 'High on the neck IS the solo sound. Nothing about your ideas has to change — the register does the drama for you.',
                stuck: 'Stay open-position and just VISIT the 12th fret for your last note of each phrase.',
                levelUp: 'Slide between the two positions mid-phrase, or hold your longest note an extra bar and let it ring out.',
                skills: [5, 6],
                tab: {
                  caption: 'Same shape, two homes — E at fret 0 and fret 12',
                  notes: [
                    { string: 'E', fret: 0,  note: 'E', midi: 40 },
                    { string: 'E', fret: 3,  note: 'G', midi: 43 },
                    { string: 'A', fret: 0,  note: 'A', midi: 45 },
                    { string: 'e', fret: 12, note: 'E', midi: 76 },
                    { string: 'e', fret: 15, note: 'G', midi: 79 }
                  ]
                },
                response: { type: 'short', prompt: 'Open position vs. 12th fret — which felt more like "your" sound?', placeholder: 'e.g. 12th fret — felt like a real solo' }
              },
              {
                text: 'Challenge — Solo over "the cure": Olivia\'s song is soft — so your solo has to be too. Improvise eight bars in Am pentatonic Pattern 1 at a whisper: light pick, slow phrases, lots of space. You\'ve got it when: eight bars where the quietest note is as clean as your loudest.',
                hint: 'Playing quietly is a skill, not a limitation. Every buzz and mistake hides at loud volume and shows at soft — this is an honesty check.',
                stuck: 'Rule of 3 at half speed: three notes, whisper volume, one phrase per two bars.',
                levelUp: 'Build one long crescendo across all eight bars — start at a whisper, end singing, never harsh.',
                skills: [5, 6],
                response: { type: 'short', prompt: 'Rate your quiet control 1–3, and name one note that buzzed when soft.', placeholder: 'e.g. 2 — the G on the D string buzzes' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Which is more solid right now — your expressive phrasing (call-and-response, dynamics) or your note names on D and G? Write the weaker one below — that\'s your warm-up target next time.',
                response: { type: 'short', placeholder: 'e.g. phrasing is coming along; G string note names still need counting' }
              }
            ]
          },
          {
            title: '⚡ Ear Spark — optional ear bonus',
            steps: [
              {
                text: '⚡ Ear Spark (optional, 2 min): draw three fret slips (0–5), record those notes on the low E, and turn the slips face-down. On playback, sing each note back, hold it, then find it on the string — singing first is the whole trick. Check the slips last. Got someone around? Have them play the notes instead.'
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Plays pentatonic across E, A, D, G strings · Crosses strings smoothly without pausing · Performs a hammer-on and pull-off · Plays a call-and-response phrase · Creates a 4-bar melodic solo · Applies to at least 2 course songs',
      performance: 'Solo check: record a 4-bar call-and-response solo over the Am jam track, then listen back and judge: does it resolve at the end?',
      selfCheck: 'Can you vary your dynamics on purpose (loud vs soft)? Can you play a clear call-and-response phrase where the "answer" lands on the root?',
      standards: ['Cr.1a', 'Pr.4a', 'Pr.5b']
    },

    skills: [
      { id: 'm4w2-s1', text: 'Vary dynamics consciously: play the same note at p, mf, and f (the letters musicians use for volume: p = piano, quiet · mf = mezzo-forte, medium · f = forte, loud)',
        gotItWhen: 'you play the same note three times in a row and can clearly hear on a recording that you got louder each time.',
        practice: { type: 'mc', prompt: 'Which order goes from QUIETEST to LOUDEST?',
          choices: ['p, mf, f', 'f, mf, p', 'mf, p, f', 'mf, f, p'], answer: 0 } },
      { id: 'm4w2-s2', text: 'Change timbre by moving picking hand between bridge and neck',
        gotItWhen: 'the difference between your "bright" (near the bridge) and "warm" (near the neck) tones is obvious on a recording without you announcing which is which.' },
      { id: 'm4w2-s3', text: 'Perform a hammer-on and a pull-off',
        gotItWhen: 'you can produce the second note with no pick stroke — and it rings as clearly as a picked note.',
        practice: { type: 'mc', prompt: 'On a pull-off, your finger starts on the higher fret. How do you make the SECOND note sound?',
          choices: ['Pluck it with your picking hand', 'Snap your finger off the string sideways', 'Hammer down on a lower fret', 'Bend the string up'], answer: 1 } },
      { id: 'm4w2-s4', text: 'Use "envelope": vary attack (attack = how hard and suddenly a note starts) and note length intentionally',
        gotItWhen: 'you can play a short, sharp note and a long, sustained note on demand, and the difference is obvious on playback.' },
      { id: 'm4w2-s5', text: 'Play a one-note solo that uses dynamics and rhythm for expression',
        gotItWhen: 'you can play one note for 8 bars and a recording still holds your attention on listen-back — because you change something each time.' },
      { id: 'm4w2-s6', text: 'Improvise a call-and-response phrase (call ends off root; response lands on root)',
        gotItWhen: 'on playback you can hear the question (call) and the answer (response) — the call feels unresolved, the response feels like it arrives.',
        practice: { type: 'mc', prompt: 'In a call-and-response phrase, where should the RESPONSE end?',
          choices: ['On any random note', 'On the root', 'On a non-root note', 'On the highest note in the scale'], answer: 1 } },
      { id: 'm4w2-s7', text: 'Name all natural notes on the D string (frets 0–10) and G string (frets 0–10)',
        gotItWhen: 'you can point to any fret 0–10 on D or G and name the note instantly without counting up from the open string.',
        practice: { type: 'mc', prompt: 'On the G string, what note is at fret 5?',
          choices: ['B', 'C', 'D', 'A'], answer: 1 } }
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
    skillFocus: 'How pentatonic and blues scales are built · Transposing to new keys · Composing and performing your own solo',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Re-watch the same video from Set 1 — <a href="https://youtu.be/m_IiyJu60-c?t=105" target="_blank">Major Pentatonic Scale – Marty Music</a> (the link skips the intro) — this time listening for the major/minor connection. Then prove it on your own neck: play Pattern 1 and call the low E root "home" for major, then treat a different note as "home" and hear the same shape turn minor. Your hand stays parked in one place — only which note you call "home" changes.',
            hint: 'Same five notes, two names: whichever note you treat as "home" (the root) decides whether it sounds major or minor. Watch for that connection, then prove it on your own neck.',
            skills: [1, 2],
            response: { type: 'short', placeholder: 'Explain the relative major/minor connection in your own words.' }
          },
          {
            text: 'Watch: <a href="https://youtu.be/WNWqobkgdBA" target="_blank">Vibrato Technique (Hand Movement, TE-103) – JustinGuitar</a> (0:00–3:00). As you watch, try it yourself on the 5th fret of string 1 — rock the finger back and forth gently and listen for the pitch to wobble.',
            hint: 'Vibrato is a small, controlled pitch wobble on a sustained note. Try it on the 5th fret, string 1. Rock your finger back and forth gently. It takes weeks to develop — just start!',
            skills: [3],
            response: { type: 'mc', prompt: 'Vibrato is best described as:',
              answer: 0,
              explain: 'Vibrato is a small, controlled, repeating pitch wobble on a held note — it adds life and sustain. A one-time push up to a new pitch is a bend, not vibrato.',
              choices: [
              'A small, controlled pitch wobble on a sustained note',
              'Playing two notes at the same time',
              'Bending the string up a whole step',
              'Sliding between two frets quickly'
            ] }
          }
            ]
          },
          {
            title: 'Hear the blues note',
            steps: [
          {
            text: 'Theory check: the blues scale adds one note to the minor pentatonic — the ♭5 (flat 5). In A minor, that\'s the note Eb. Click "Hear the A blues scale" below and listen for the extra note that wasn\'t in the plain minor pentatonic — that\'s the blue note.',
            hint: 'In Pattern 1 for A minor, the ♭5 sits between the 4 and 5 on the A string — fret 6, right between the 4 at fret 5 and the 5 at fret 7. It\'s a "passing tone" — it creates tension that wants to resolve.',
            skills: [4, 5],
            playSeq: { label: 'Hear the A blues scale (listen for the blue note)', bpm: 70, notes: [45, 48, 50, 51, 52, 55, 57] },
            response: { type: 'mc', prompt: 'What is the "blue note" added to the minor pentatonic to make a blues scale?',
              answer: 0,
              explain: 'The blues scale = minor pentatonic + the ♭5 (flat 5) passing tone. In A minor that\'s Eb — the note that gives blues its tension.',
              choices: [
              'The ♭5 (flat 5)',
              'The major 3rd',
              'The ♭7 (flat 7)',
              'The 2nd'
            ] }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — pause and think: you can now explain how the pentatonic is built, add the blues note, and use vibrato. Which piece of theory finally made sense today, and which still feels fuzzy?',
            response: { type: 'short', placeholder: 'e.g. relative major/minor made sense; the ♭5 blue note still feels random to me' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — theory in action & original solo',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Tuning (Module 1) is a skill you keep forever. Today you compose and perform — a clean, in-tune guitar is what makes a simple solo sound finished.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Understand relative major & minor scales',
            steps: [
          {
            text: 'Challenge 1 — Relative Scales: type out C major pentatonic (1 C, 2 D, 3 E, 5 G, 6 A), then A minor pentatonic (1 A, ♭3 C, 4 D, 5 E, ♭7 G) into the box below. You\'ve got it when: you spot that they share the same five notes — only which note is "home" changes.',
            hint: 'C major pentatonic and A minor pentatonic share exactly the same five notes. Your hand position is the same — only which note you treat as "home" (the root) changes.',
            stuck: 'List the five notes once (A C D E G). Now circle A in your head and call it minor; circle C and call it major. Same notes, different home.',
            levelUp: 'Find another relative pair from memory — G major and its relative minor (E minor) — and prove they share five notes.',
            skills: [1, 2],
            response: { type: 'short', placeholder: 'C major pent: C D E G A · A minor pent: A C D E G — what do you notice?' }
          }
            ]
          },
          {
            title: 'Compose a 4-bar solo',
            steps: [
          {
            text: 'Challenge 2 — Compose It: write a 4-bar solo as scale-degree numbers (e.g. 1 3 5 3 | 6 5 3 1 | …), then play exactly what you wrote, varying the rhythms. You\'ve got it when: a deliberate 4-bar line you can play back the same way twice. Type your 4 bars into the box below so you have them next session.',
            hint: 'Write first, then play! It\'s okay if it sounds simple. The goal is to make a deliberate musical decision, not to improvise randomly.',
            stuck: 'Start with just bar 1 — pick 4 scale degrees you like, play them, and only move on once that bar sounds good. Repeat it for bar 3 if you\'re stuck for ideas.',
            levelUp: 'Make bar 4 answer bar 2 (end on the root, 1), or add a hammer-on or the ♭5 blue note as a passing tone somewhere.',
            skills: [6, 7],
            response: { type: 'short', prompt: 'Write your 4-bar solo as scale-degree numbers (use | between bars):', placeholder: 'e.g. 1 3 5 3 | 6 5 3 1 | 5 4 ♭3 1 | 1 — — —' }
          }
            ]
          },
          {
            title: 'Read a lick cold',
            steps: [
          {
            text: 'Challenge — Cold Read (Knowledge &amp; Reading): here\'s a 1-bar lick (a lick = a short solo phrase) in the A minor pentatonic box you haven\'t drilled. DECODE it from the TAB first — name each string and fret, left to right — then play it. You\'ve got it when: you can read a short 1-bar pentatonic lick straight from TAB and play it accurately, without anyone demonstrating it first. At the module self-assessment you\'ll read a NEW 1-bar lick cold — this is Task 2.',
            hint: 'Read before you press Play. Bottom TAB line = low E, top line = high e; the number is the fret. Say it out loud — "G string, fret 5, that\'s C" — as you go, then hit Play all to check yourself.',
            stuck: 'Take it two notes at a time. Find the first note on the neck and play it, then the next — speed comes after the map is clear.',
            levelUp: 'Read it backwards (right to left), or move the same shape to the E minor box (open-string root) and read it there.',
            skills: [8],
            tab: {
              caption: 'Cold-read lick · A minor pentatonic box · one bar',
              notes: [
                { string: 'D', fret: 5, note: 'G', midi: 55 },
                { string: 'D', fret: 7, note: 'A', midi: 57 },
                { string: 'G', fret: 5, note: 'C', midi: 60 },
                { string: 'G', fret: 7, note: 'D', midi: 62 },
                { string: 'B', fret: 5, note: 'E', midi: 64 },
                { string: 'G', fret: 7, note: 'D', midi: 62 },
                { string: 'G', fret: 5, note: 'C', midi: 60 },
                { string: 'D', fret: 7, note: 'A', midi: 57 }
              ]
            }
          }
            ]
          },
          {
            title: 'Perform your original solo',
            steps: [
          {
            text: 'Challenge 3 — Perform It (your assessment piece — try it!): play your 4-bar solo over a core-song backing track — start with <a href="https://www.youtube.com/watch?v=Vq8cApzOdy8" target="_blank">▶ &#x1F3B5; the Am jam track</a>, or pick any core song\'s ▶ &#x1F3B5; Backing track in the &#x1F3B5; Songs list at the bottom of this module — working in at least one hammer-on, pull-off, or vibrato. Record your take, say your phrasing strategy (call-and-response or four-phrase) out loud on the recording, and listen back. You\'ve got it when: you hold the backing track\'s pulse start to finish with no restarts, and you can name your phrasing strategy. Play musical ideas — don\'t just run up and down the scale.',
            hint: 'Include at least one technique (hammer-on, pull-off, or vibrato) in your solo. Don\'t just run up and down the scale — play musical ideas! Playing for the camera counts as performing, and the playback shows you exactly where to tighten up.',
            stuck: 'Drop the backing track and play your written 4 bars alone, slowly, until they\'re solid — then add the track back and just one technique.',
            levelUp: 'Perform it standing, record a performance take, or play it for someone at home — or transpose your solo to E minor and play it from the open-string box.',
            skills: [3, 6, 7]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'You composed and performed an original solo — what are you proudest of, and what would make the next one better? Write it below; this is the kind of reflection your end-of-module recorded performance builds on.',
                response: { type: 'short', placeholder: 'e.g. proud it resolved on the root; next time I\'ll leave more space between phrases' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Module-end (two tasks): (1) Perform an original 4-bar solo over a course-song backing track, holding the track\'s pulse start to finish — use the full minor pentatonic box, include at least one hammer-on, pull-off, or vibrato, and follow a named phrasing strategy (call-and-response or four-phrase). (2) Read a short 1-bar pentatonic lick from TAB and play it.',
      performance: 'Solo: record your original 4-bar solo over a core-song backing track, saying your phrasing strategy (call-and-response or four-phrase) out loud on the recording, then listen back; then sight-read and play a short 1-bar pentatonic lick from TAB.',
      selfCheck: 'Can you explain the difference between major and minor pentatonic? Can you add the blues note? Can you perform your original solo without looking at your notes?',
      standards: ['Cr.1a', 'Cr.2a', 'Pr.6a']
    },

    skills: [
      { id: 'm4w3-s1', text: 'Explain what a major pentatonic scale is (degrees 1 2 3 5 6)',
        gotItWhen: 'you can list the scale degrees from memory and name the 5 notes in any major key you pick.',
        practice: { type: 'mc', prompt: 'Which scale degrees make up a MAJOR pentatonic scale?',
          choices: ['1 2 3 4 5', '1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 3 5 7 9'], answer: 1 } },
      { id: 'm4w3-s2', text: 'Explain what a minor pentatonic scale is (degrees 1 ♭3 4 5 ♭7)',
        gotItWhen: 'you can list the minor pentatonic degrees from memory and explain why two of them are flatted compared to the major scale.',
        practice: { type: 'mc', prompt: 'Which scale degrees make up a MINOR pentatonic scale?',
          choices: ['1 2 3 5 6', '1 ♭3 4 5 ♭7', '1 ♭3 4 ♭5 ♭7', '1 ♭2 ♭3 5 ♭7'], answer: 1 } },
      { id: 'm4w3-s3', text: 'Add vibrato on at least one sustained note',
        gotItWhen: 'your finger rocks back and forth on a sustained note and the pitch wobbles intentionally — not from shaking nerves.' },
      { id: 'm4w3-s4', text: 'Identify and play the ♭5 blues note within Pattern 1',
        gotItWhen: 'you can find the ♭5 anywhere in Pattern 1 and use it as a passing tone — not a landing point.',
        practice: { type: 'mc', prompt: 'In A minor pentatonic, what is the ♭5 "blues note"?',
          choices: ['D♭', 'D', 'E♭', 'E'], answer: 2 } },
      { id: 'm4w3-s5', text: 'Explain how C major pentatonic and A minor pentatonic are relative scales',
        gotItWhen: 'you can explain that they share the same 5 notes — only the root changes — and prove it on the fretboard.',
        practice: { type: 'mc', prompt: 'C major pentatonic and A minor pentatonic contain the exact same 5 notes. What\'s different between them?',
          choices: ['Which note feels like "home" (the root)', 'They use different hand shapes', 'A minor has 6 notes, C major has 5', 'They\'re played on different strings'], answer: 0 } },
      { id: 'm4w3-s6', text: 'Compose and write out a 4-bar original solo using scale degrees',
        gotItWhen: 'you have 4 bars written down in scale-degree numbers and you can play exactly what you wrote — not improvise something different.' },
      { id: 'm4w3-s7', text: 'Perform the original solo over a course song backing track from memory, holding the track\'s pulse',
        gotItWhen: 'you can play your 4-bar solo all the way through with the backing track — holding its pulse with no restarts — and name your phrasing strategy (call-and-response or four-phrase).' },
      { id: 'm4w3-s8', text: 'Sight-read a short 1-bar pentatonic lick from TAB and play it',
        gotItWhen: 'you can decode a 1-bar pentatonic lick straight from the TAB — one you haven\'t drilled — and play it accurately without anyone demonstrating it first.' }
    ]
  }

); // end module-4.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[4] = [
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Full solo using Am pentatonic across 4 strings', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8',
        backingUrl: 'https://www.youtube.com/watch?v=Vq8cApzOdy8',
        backingKey: 'Am' },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Full solo · A minor pentatonic', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY',
        backingUrl: 'audio/olivia-rodrigo-the-cure-backing-Am-144bpm-440hz-rhythm-down.mp3',
        backingKey: 'Am' },
      { name: '"Sweet Child O\' Mine" — Guns N\' Roses', meta: 'Full solo over D–C–G · G major / E minor pentatonic', type: 'Core', core: true, journeyUrl: 'tabs/sweet-child-o-mine.html',
        originalUrl: 'https://www.youtube.com/watch?v=1w7OgIMMRc4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0ASVeXINKYM',
        backingUrl: 'https://www.youtube.com/watch?v=AFbg4SgEwBg',
        backingKey: 'Em/G' },
      { name: '"Seven Nation Army" — The White Stripes', meta: 'E minor pentatonic solo', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw',
        backingUrl: 'https://www.youtube.com/watch?v=6WBzxOEH7hI',
        backingKey: 'Em' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'Full solo using Dm pentatonic (root D, low E fret 10)', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok',
        backingUrl: 'https://www.youtube.com/watch?v=wBxFnX_V9mQ',
        backingKey: 'Dm' },
      { name: '"Happy Birthday"', meta: 'Full melodic reharmonization using pentatonic (optional)', type: 'Supp', core: false,
        tutorialUrl: 'https://www.youtube.com/watch?v=wwiLAOjj16w' },
      { name: '"12-bar blues in E"', meta: 'E minor pentatonic — classic improv context', type: 'Choice', core: false, level: 1,
        tutorialUrl: 'https://www.youtube.com/watch?v=pJL2j2v6XZM' },
      { name: '"La Bamba" — Ritchie Valens', meta: 'C major pentatonic — bright and fun', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=BycLmWI97Nc',
        tutorialUrl: 'https://www.youtube.com/watch?v=o-SdTXIAvTE' },
      { name: '"Back in Black" — AC/DC', meta: 'Simplified solo intro — A minor pentatonic', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=pAgnJDJN4VA',
        tutorialUrl: 'https://www.youtube.com/watch?v=aeYDJciDuao' },
      { name: '"Boom Boom" — John Lee Hooker', meta: 'E blues pentatonic — call and response phrasing', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=jZv04xAejrc',
        tutorialUrl: 'https://www.youtube.com/watch?v=dutLP1SoSLs' },
      { name: '"Purple Haze" — Jimi Hendrix', meta: 'E pentatonic box — full pattern', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=WGoDaYjdfSg',
        tutorialUrl: 'https://www.youtube.com/watch?v=gKhmARXdWGE' }
    ];

MODULE_REVIEWS[4] = {
  moduleNum: 4,
  module: 'Major / Minor / Blues Pentatonic Scales',
  skills: [
    { id: 'mr4-s1', text: 'I can play Pentatonic Pattern 1 ascending AND descending from memory — no diagram, no missed notes or hesitations', set: 'm4w1' },
    { id: 'mr4-s2', text: 'I can use alternate picking (down-up) automatically at 60 BPM, every note on a beat, without losing the click', set: 'm4w1' },
    { id: 'mr4-s3', text: 'I can position Pattern 1 as a MINOR scale (1st finger on root) or a MAJOR scale (4th finger on root) on demand from any named key', set: 'm4w1' },
    { id: 'mr4-s6', text: 'I can perform a hammer-on and a pull-off, and add an intentional vibrato on a sustained note', set: 'm4w2' },
    { id: 'mr4-s8', text: 'I can explain how major (1 2 3 5 6) and minor (1 ♭3 4 5 ♭7) pentatonic are built, that they\'re relative (same 5 notes), and where the ♭5 blue note goes', set: 'm4w3' },
    { id: 'mr4-s10', text: 'I can perform my original 4-bar solo over a backing track from memory — holding its pulse with no restarts, working in at least one hammer-on, pull-off, or vibrato, and naming my phrasing strategy', set: 'm4w3' },
    { id: 'mr4-s11', text: 'I can read a short 1-bar pentatonic lick from TAB that I haven\'t practiced and play it accurately', set: 'm4w3' }
  ],
  assessItems: [
    'Position Pattern 1 for any named major or minor key and play it ascending and descending in time, with alternate picking',
    'Perform an original 4-bar solo over a course-song backing track, holding its pulse with no restarts, using the minor pentatonic box and at least one hammer-on, pull-off, or vibrato, with clean notes throughout (no buzz or dead notes — high strings included), following a named phrasing strategy (call-and-response or four-phrase)',
    'Read a short 1-bar pentatonic lick from TAB and play it accurately'
  ],
  forward: 'Those single pentatonic notes you\'ve been soloing with don\'t disappear in <strong>Module 5</strong> — you stack them. The open chords you\'ll build there (Am, C, G, D…) are made of these same notes. And the clean fretting and finger independence you sharpened here are exactly what makes a chord ring without buzzing. You\'ll go from playing one note at a time to playing five at once.',
  standards: ['Cr.1a', 'Cr.2a', 'Pr.4a', 'Pr.5a', 'Pr.5b', 'Pr.6a']
};
