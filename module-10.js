// ============================================================
//  MODULE 10 — Scales, Keys & Ear Training
//  Edit this file to change Module 10 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm10w1',
    label: 'Set 1',
    locked: false,
    module: 'Scales, Keys & Ear Training',
    moduleNum: 10,
    unit: 'Module 10 · Scales, Keys & Ear Training',
    title: 'Set 1',
    subtitle: 'The W-W-H recipe · Build a scale on one string · Where pentatonics come from',
    objective: 'I CAN build a major scale on one string using the whole/half-step recipe and spell C and G major out loud.',
    skillFocus: 'W-W-H-W-W-W-H · Whole step = 2 frets, half step = 1 · Major pentatonic = major scale minus 2 notes',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://www.youtube.com/watch?v=fnVlMjza32c" target="_blank">What is a Major Scale Guitar Lesson - Music Theory For Guitar – Lauren Bateman (0:00–5:12)</a>. Follow along as she lays out the whole/half-step recipe — the exact formula you\'ll use to build C and G major yourself.',
                hint: 'The recipe is a formula — the exact same seven-step pattern of whole and half steps, starting from any note, builds that note\'s major scale.',
                skills: [1],
                response: { type: 'mc', prompt: 'The step recipe that builds EVERY major scale is:',
                  answer: 1,
                  explain: 'Whole-whole-half, whole-whole-whole-half. Same recipe from any starting note — that\'s what makes it a formula.',
                  choices: ['W-H-W-W-H-W-W', 'W-W-H-W-W-W-H', 'H-W-W-H-W-W-W', 'W-W-W-H-W-W-H'] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/m_IiyJu60-c" target="_blank">How to Play the Major Pentatonic Scale: Your Guide to Beautiful Solos – Marty Music</a>. This is where the pentatonic sound you\'ve been soloing with since Module 4 actually comes from.',
                hint: 'Major pentatonic isn\'t a separate scale to memorize — it\'s the major scale with two notes lifted out.',
                skills: [5],
                response: { type: 'mc', prompt: 'Major pentatonic is the major scale with which two notes removed?',
                  answer: 2,
                  explain: 'Drop the 4th and 7th — the two "tension" notes, the ones that sound unsettled and want to move — and the friendly five-note pentatonic you already solo with is what\'s left.',
                  choices: ['1st and 5th', '2nd and 6th', '4th and 7th', '3rd and 5th'] }
              }
            ]
          },
          {
            title: 'Listen for the recipe as you play it',
            steps: [
              {
                text: 'Listen for it: play up the C major scale on one string, saying "whole, whole, half, whole, whole, whole, half" out loud on every step. The distances should match the frets you\'re moving.',
                hint: 'On guitar, a whole step and a half step are just fret distances — say the word, then check it\'s 2 frets (whole) or 1 fret (half).',
                skills: [2],
                response: { type: 'mc', prompt: 'On guitar, a whole step equals how many frets?',
                  answer: 1,
                  explain: 'One fret = half step, two frets = whole step. The recipe becomes fret distances: 2-2-1-2-2-2-1.',
                  choices: ['1', '2', '3', '4'] }
              }
            ]
          },
          {
            title: 'Try building a scale from a new starting note',
            steps: [
              {
                text: 'Now try it: run the same W-W-H-W-W-W-H recipe starting from C first — your baseline — and notice you never need a sharp or flat. That clean run is what makes the odd note stand out when you try G next.',
                hint: 'C major is the recipe\'s starting-point example — every other major key is the same shape, just starting somewhere else.',
                skills: [6],
                response: { type: 'mc', prompt: 'C major is special among scales because:',
                  answer: 1,
                  explain: 'C is the recipe\'s "clean" starting point — all seven natural notes, C D E F G A B.',
                  choices: ['It has one sharp', 'It has no sharps or flats', 'It\'s the hardest scale', 'It only works on piano'] }
              },
              {
                text: 'Try it again starting from G, on one string — follow the recipe exactly and see what note comes out different from the rest.',
                hint: 'Follow W-W-H-W-W-W-H from G one step at a time; the recipe itself will tell you which note needs raising.',
                skills: [3],
                response: { type: 'mc', prompt: 'Follow the recipe from G and one note comes out sharp. Which?',
                  answer: 2,
                  explain: 'G A B C D E F#. The last whole step forces F up to F# — G major\'s single sharp.',
                  choices: ['C#', 'G#', 'F#', 'A#'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — in your own words: what does it mean when someone says a song is "in the key of G"?',
                response: { type: 'short', placeholder: 'e.g. its notes and chords come from the G major scale — G feels like home' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — building the major scale',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Build C major and G major on one string',
            steps: [
              {
                text: 'Challenge 1 — C Major Walk: play the C major scale on the A string using the recipe, saying "whole, whole, half…" out loud as you go.',
                hint: 'Start on C (A string, fret 3) and let the recipe — not a chart — tell you where each next note lands.',
                stuck: 'Play just the first three notes (C-D-E) until the whole-whole-half feel is automatic, then keep climbing.',
                levelUp: 'Play it descending too, saying the recipe backwards (half, whole, whole, whole, half, whole, whole).',
                skills: [1, 2],
                playSeq: { label: 'C major on the A string (recipe walk)', bpm: 60, notes: [48, 50, 52, 53, 55, 57, 59, 60] }
              },
              {
                text: 'Challenge 2 — G Major Walk: play the G major scale on the low E string using the same recipe, and catch the one note that needs to be sharp.',
                hint: 'Everything is identical to the C major walk except one note — the recipe itself will tell you which.',
                stuck: 'Play up to the 6th note first (G-A-B-C-D-E), stop, and only then figure out what the 7th note needs to be.',
                levelUp: 'Play both C major and G major back to back without stopping, on their two different strings.',
                skills: [1, 3],
                playSeq: { label: 'G major on the low E string', bpm: 60, notes: [43, 45, 47, 48, 50, 52, 54, 55] }
              }
            ]
          },
          {
            title: 'Say the recipe while you play',
            steps: [
              {
                text: 'Challenge 3 — Recipe by Heart (your assessment piece): play the C major scale while saying "whole, whole, half, whole, whole, whole, half" out loud, no chart, no hesitating. You\'ve got it when: you can say the whole recipe from memory before you even touch the guitar.',
                hint: 'If you can say the recipe from memory, you can build ANY major scale on the spot — that\'s the whole point of memorizing it as words, not just frets.',
                stuck: 'Say the recipe alone, away from the guitar, until it\'s automatic — then add the fretting hand back in.',
                levelUp: 'Say the recipe starting from a key you haven\'t tried yet (D, or A) and build it on the spot.',
                skills: [1, 6]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Let It Be, in the scale: hum the Let It Be melody while playing the C major walk underneath it, and notice every note of the tune lives inside the scale you just built.',
                hint: 'This is the payoff of today\'s whole set — a song\'s melody isn\'t random, it\'s built from the same key\'s scale.',
                stuck: 'Just hum the first line of the melody on its own first, then play the C major walk separately, then try them together.',
                levelUp: 'Find where in the walk the melody\'s highest note lives, and name it.',
                skills: [2, 4]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Can you say the major-scale recipe from memory right now, no guitar in hand? Write below how confident you feel.',
                response: { type: 'short', placeholder: 'e.g. solid on W-W-H-W-W-W-H now — just need more tries building from a new note' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Says the recipe from memory · Builds C and G major on one string · Explains where the pentatonic comes from',
      performance: 'Build D major on one string using only the recipe — no chart — saying each whole/half step out loud as you go.',
      selfCheck: 'Can you spell G major out loud, including its sharp? Can you say which two scale notes pentatonic drops?',
      standards: ['Pr.4a', 'Cn.10a']
    },

    skills: [
      { id: 'm10w1-s1', text: 'Say the major-scale recipe (W-W-H-W-W-W-H) from memory',
        practice: { type: 'mc', prompt: 'In fret distances, the recipe is:',
          choices: ['2-2-1-2-2-2-1', '1-2-2-1-2-2-2', '2-1-2-2-1-2-2', '3-3-1-3-3-3-1'], answer: 0 } },
      { id: 'm10w1-s2', text: 'Build a C major scale on one string using the recipe',
        practice: { type: 'playSeq', label: 'C major on the A string', bpm: 60, notes: [48, 50, 52, 53, 55, 57, 59, 60] } },
      { id: 'm10w1-s3', text: 'Build a G major scale on one string and find the F#',
        practice: { type: 'playSeq', label: 'G major on the low E string', bpm: 60, notes: [43, 45, 47, 48, 50, 52, 54, 55] } },
      { id: 'm10w1-s4', text: 'Explain what a key is — the scale a song\'s notes and chords come from',
        practice: { type: 'mc', prompt: '"This song is in A" most nearly means:',
          choices: ['It starts loud', 'Its notes & chords come from the A major scale and A feels like home', 'It uses only the A string', 'It\'s at 100 BPM'], answer: 1 } },
      { id: 'm10w1-s5', text: 'Explain how major pentatonic relates to the major scale',
        practice: { type: 'mc', prompt: 'The pentatonic has how many different notes?',
          choices: ['4', '5', '6', '7'], answer: 1 } },
      { id: 'm10w1-s6', text: 'Spell C major and G major note-by-note out loud' }
    ]
  },

  {
    id: 'm10w2',
    label: 'Set 2',
    locked: false,
    module: 'Scales, Keys & Ear Training',
    moduleNum: 10,
    unit: 'Module 10 · Scales, Keys & Ear Training',
    title: 'Set 2',
    subtitle: 'Every major key\'s minor twin · Relative vs parallel · Add the b5 = blues',
    objective: 'I CAN find the relative minor of any major key and build the blues scale from minor pentatonic box 1.',
    skillFocus: 'Relative minor = 3 frets down (the 6th degree) · Relative shares NOTES, parallel shares ROOT · Blues scale = minor pentatonic + b5',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://www.youtube.com/watch?v=l6ayje1ug_0" target="_blank">The MINOR PENTATONIC scale on Guitar Explained – Lauren Bateman (0:00–5:30)</a> as a refresher on the box-1 shape you\'ll build the blues scale from today.',
                hint: 'Everything today builds on top of the minor pentatonic box you already know from Module 4 — nothing new to fret, just one note added.',
                skills: [1],
                response: { type: 'mc', prompt: 'Minor pentatonic box 1 with its root at low-E fret 5 is which key?',
                  answer: 1,
                  explain: 'The root fret names the key — fret 5 on the low E is A, so box 1 there is A minor: the shape you\'ll add the blues note to today.',
                  choices: ['C minor', 'A minor', 'E minor', 'G minor'] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/EILFkSGNkdA" target="_blank">The First Scale Beginners Should Learn for BLUES GUITAR – JustinGuitar</a>. Listen for the one extra note added to the minor pentatonic box you already know — that\'s the b5.',
                hint: 'The blues scale is just minor pentatonic plus one extra note — listen for where it gets added in the video.',
                skills: [4],
                response: { type: 'mc', prompt: 'The blues scale is the minor pentatonic plus which extra note?',
                  answer: 1,
                  explain: 'One sour-sweet note — the flat five — turns the pentatonic blue.',
                  choices: ['The 2nd', 'The b5', 'The major 7th', 'The 4th'] }
              }
            ]
          },
          {
            title: 'Listen for relative vs parallel',
            steps: [
              {
                text: 'Listen for it: play a C major chord, then an A minor chord, then a C minor chord (Cm = your full Bm barre shape from Module 7, slid up one fret to fret 3). C-to-Am shares every note (relative); C-to-Cm shares only the root (parallel). Notice how different Am and Cm sound from each other, even though both are "C\'s minor."',
                hint: 'These two ideas get mixed up constantly — the exercise is hearing that "C\'s relative minor" and "C\'s parallel minor" are two completely different chords.',
                skills: [2],
                response: { type: 'mc', prompt: 'Relative minor vs parallel minor — the difference is:',
                  answer: 0,
                  explain: 'A minor is C major\'s relative (same notes). C minor is C major\'s parallel (same root, different notes).',
                  choices: ['Relative shares the same NOTES; parallel shares the same ROOT', 'They\'re two names for one thing', 'Parallel shares the notes; relative shares the root', 'Neither involves minor'] }
              }
            ]
          },
          {
            title: 'Try finding a core song\'s relative key',
            steps: [
              {
                text: 'Now try it: All Along the Watchtower loops in A minor. Find its relative major by sliding 3 frets up from A — check your answer before moving on.',
                hint: 'Relative major is always 3 frets UP from a minor root — the mirror image of sliding 3 frets down to find a relative minor.',
                skills: [3],
                response: { type: 'mc', prompt: 'All Along the Watchtower lives in A minor. Its relative major is:',
                  answer: 2,
                  explain: '3 frets UP from A lands on C — Am and C major share every note.',
                  choices: ['A major', 'F major', 'C major', 'G major'] }
              },
              {
                text: 'Try it on Luna: its solo lives in D minor pentatonic even though the song is in F major. Work out why using what you just learned about relative keys.',
                hint: 'D minor is exactly 3 frets down from F — the same relative relationship you just used on Watchtower.',
                skills: [5],
                response: { type: 'mc', prompt: 'Luna is in F major, which is exactly why its solo uses:',
                  answer: 1,
                  explain: 'D minor is F major\'s relative minor — same notes. That\'s why the Module 4 solo box sits at fret 10: its root is D.',
                  choices: ['F minor pentatonic', 'D minor pentatonic', 'A major pentatonic', 'C blues'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — explain relative minor in one sentence, as if to a friend.',
                response: { type: 'short', placeholder: 'e.g. it\'s the minor key hiding inside every major key — same notes, sadder home' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — relative keys and the blues scale',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Find relative and parallel minors',
            steps: [
              {
                text: 'Challenge 1 — Relative Pairs Drill (a drill is a short exercise you repeat to build a skill): make five quick flashcards — major key on the front, relative minor on the back — C→Am, G→Em, F→Dm, D→Bm, A→F#m. Shuffle, flip one at a time, and answer out loud before checking the back. Then explain out loud how a PARALLEL minor would be different for the same key. (Got someone nearby? Have them quiz you with the cards.)',
                hint: 'The shortcut: relative minor is always 3 frets down from the major root, or the major scale\'s 6th note.',
                stuck: 'Drill just C→Am and G→Em until those two are automatic, then add the rest.',
                levelUp: 'Add two more keys of your own (E, Bb) and find their relative minors on the spot.',
                skills: [1, 2, 3]
              }
            ]
          },
          {
            title: 'Build and play the blues scale',
            steps: [
              {
                text: 'Challenge 2 — Blues Scale (your assessment piece): add the b5 to A minor pentatonic box 1 and play it ascending and descending at 60 BPM. The play button checks the ascending run — match it, then play the descent on your own after. You\'ve got it when: the added note matches what you hear from the play button, every time.',
                hint: 'The b5 sits between two notes you already know in the box — it\'s one extra finger placement, not a new shape to learn from scratch.',
                stuck: 'Play the plain minor pentatonic box first, then just add the one extra note once the rest is solid.',
                levelUp: 'Play the blues scale over a 12-bar blues feel, or build it starting from a different root.',
                skills: [4, 5],
                playSeq: { label: 'A blues scale, box 1', bpm: 60, notes: [45, 48, 50, 51, 52, 55, 57] }
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Smoke on the Water, bluesy: play the A blues scale over the feel of the riff (a riff is a short musical phrase that repeats) — this is where this scale is normally used, the sound it was built for.',
                hint: 'Deep Purple\'s whole riff lives in exactly this bluesy, gritty pentatonic-plus-b5 sound world.',
                stuck: 'Play the riff itself first to get the feel steady, then freely play the blues scale over the same groove (a groove is the steady rhythmic feel).',
                levelUp: 'Try soloing over the riff using only the blues scale, no other notes.',
                skills: [5, 6]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'What\'s the relative minor of F (Luna\'s key)? Which single note makes a pentatonic a blues scale? Write both below. (One more below: Jam it — the blues scale over a real form.)',
                response: { type: 'short', placeholder: 'e.g. Dm is F\'s relative minor; the b5 is what makes it blues' }
              }
            ]
          },
          {
            title: 'Jam it — the blues scale over a real form',
            steps: [
              {
                text: 'Jam it (to jam = play along freely and make up your own part): record yourself strumming the 12-bar blues form in A — the bars run A A A A | D D A A | E D A E (plain A, D, E or power chords work fine for now) — then loop the recording and solo over it with your blues scale, box 1 at fret 5. One chorus of comping, one chorus of soloing — one chorus = one full trip through the 12 bars, and comping = playing the backing chords while someone else solos. (The full story behind that bar map is in Module 11, Set 3.) Playing with someone? One comps while the other solos, then swap.',
                hint: 'Follow the form, not just the scale — when the loop returns to A, land on an A and let it ring. That arrival is what "playing the changes" means.',
                skills: [7],
                playSeq: { label: 'A blues scale, box 1 (loop-ready)', bpm: 60, notes: [45, 48, 50, 51, 52, 55, 57] }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Finds any key\'s relative minor · Explains relative vs parallel · Builds and plays the blues scale at 60 BPM',
      performance: 'Fast round: shuffle your five key flashcards and answer each relative minor in rhythm — no pauses, then flip to check.',
      selfCheck: 'What\'s the relative minor of F (Luna\'s key)? Which single note makes a pentatonic a blues scale?',
      standards: ['Pr.4a', 'Pr.6a', 'Cn.10a']
    },

    skills: [
      { id: 'm10w2-s1', text: 'Find the relative minor of any major key (6th degree / 3 frets down)',
        practice: { type: 'mc', prompt: 'The relative minor of G major is:',
          choices: ['G minor', 'B minor', 'E minor', 'D minor'], answer: 2 } },
      { id: 'm10w2-s2', text: 'Explain the difference between relative and parallel minor',
        practice: { type: 'mc', prompt: 'C major\'s PARALLEL minor is:',
          choices: ['A minor', 'C minor', 'E minor', 'F minor'], answer: 1 } },
      { id: 'm10w2-s3', text: 'Name Watchtower\'s key (Am) and its relative major (C)' },
      { id: 'm10w2-s4', text: 'Build the blues scale by adding the b5 to minor pentatonic box 1',
        practice: { type: 'mc', prompt: 'In A minor pentatonic at fret 5, the added blues note (b5, an Eb) sits on the A string at fret:',
          choices: ['5', '6', '7', '8'], answer: 1 } },
      { id: 'm10w2-s5', text: 'Play the blues scale ascending and descending at 60 BPM',
        practice: { type: 'playSeq', label: 'A blues scale, box 1', bpm: 60, notes: [45, 48, 50, 51, 52, 55, 57] } },
      { id: 'm10w2-s6', text: 'Name relative pairs for our core songs\' keys (SNA Em↔G · Watchtower Am↔C · Sweet Child D↔Bm · Luna F↔Dm · Let It Be C↔Am)' },
      { id: 'm10w2-s7', text: 'Solo with the blues scale over a 12-bar blues loop, following the form',
        gotItWhen: 'you can hear the chord changes coming and land on a strong note when the loop returns to the I chord.',
        practice: { type: 'playSeq', label: 'A blues scale, box 1 (loop-ready)', bpm: 60,
          notes: [45, 48, 50, 51, 52, 55, 57] } }
    ]
  },

  {
    id: 'm10w3',
    label: 'Set 3',
    locked: false,
    module: 'Scales, Keys & Ear Training',
    moduleNum: 10,
    unit: 'Module 10 · Scales, Keys & Ear Training',
    title: 'Set 3',
    subtitle: 'Move any pattern to any key · Sing it, then play it · Major vs minor by ear',
    objective: 'I CAN transpose a pentatonic pattern to any named key and echo short patterns back by ear.',
    skillFocus: 'Transposing = moving the root · Sing-then-play · Hearing major (bright) vs minor (dark)',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://www.youtube.com/watch?v=1mT5nUE0o7M" target="_blank">HOW TO USE The Minor Pentatonic Scale on the Guitar – Lauren Bateman (0:00–5:00)</a>, watching the shape as a MOVABLE pattern rather than a fixed one.',
                hint: 'Nothing about the shape changes when you slide it — only the fret you start on, which renames the key.',
                skills: [1],
                response: { type: 'mc', prompt: 'Minor pentatonic box 1 with its root at fret 5 is A minor. Slide it to fret 7 and it becomes:',
                  answer: 0,
                  explain: 'The root fret names the key: fret 7 on the low E is B.',
                  choices: ['B minor', 'C minor', 'G minor', 'A major'] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/bd8M2fhK6Z8" target="_blank">5\' Guitar Exercise: Find Melodies You Know – JustinGuitar</a>. This is the exact sing-it-then-find-it habit today\'s Station C drill is built around.',
                hint: 'This is the single most useful guitar habit you can build: sing what you hear first, then let your hands catch up.',
                skills: [3],
                response: { type: 'mc', prompt: 'The best FIRST step to playing a melody by ear is:',
                  answer: 1,
                  explain: 'If you can sing it, you know it — your hands just have to find what your voice already solved.',
                  choices: ['Guess randomly', 'Sing it, then hunt for your sung notes on one string', 'Look up the TAB', 'Play every fret until something works'] }
              },
              {
                text: 'Optional bonus watch: <a href="https://youtu.be/rPSRH3tf5B8" target="_blank">How To Develop The World\'s Greatest Ear – Rick Beato</a> — a producer\'s view of the exact skill this set trains. You don\'t need the advanced parts: the opening idea (ears are built by a little practice every day, not talent) is the main point — then go do the Station C echo drills.',
                hint: 'Every ear-training path starts the same place your Station C drills do: two notes — which one is higher?',
                response: { type: 'short', placeholder: 'One idea from this video worth borrowing for your own practice: …' }
              }
            ]
          },
          {
            title: 'Listen for bright vs dark',
            steps: [
              {
                text: 'Listen for it: play a major chord, then its parallel minor, back and forth. Notice which one sounds "bright" and which sounds "dark" — this is the ear-training foundation for everything else today.',
                hint: 'You\'ve been hearing this distinction since Module 4 — today you\'re naming it and using it deliberately.',
                skills: [4],
                response: { type: 'mc', prompt: 'To most ears, major sounds ___ and minor sounds ___:',
                  answer: 1,
                  explain: 'Bright-happy vs dark-moody is the first ear-training distinction — you\'ve been hearing it since Module 4.',
                  choices: ['dark, then bright', 'bright, then dark', 'loud, then quiet', 'fast, then slow'] }
              }
            ]
          },
          {
            title: 'Try transposing a pattern',
            steps: [
              {
                text: 'Now try it: take minor pentatonic box 1 and move it up two frets from wherever you\'re starting. Say out loud what key it\'s in now before you check.',
                hint: 'The pattern itself never changes shape — only the fret you start it on, which is what "transposing" means.',
                skills: [2],
                response: { type: 'mc', prompt: 'Transposing a riff means:',
                  answer: 1,
                  explain: 'The pattern is a movable shape — slide the whole thing so its ROOT lands on the new key\'s note.',
                  choices: ['Playing it faster', 'Moving it to a different key, keeping its shape', 'Playing it backwards', 'Adding more notes'] }
              },
              {
                text: 'Try moving a pattern UP two half steps and predict the new fret before you slide there.',
                hint: 'Half steps are just frets — count two frets toward the body from wherever you started.',
                skills: [2],
                response: { type: 'mc', prompt: 'To move a pattern UP two half steps, you move it:',
                  answer: 1,
                  explain: 'Half steps are frets — two half steps = two frets up the neck.',
                  choices: ['2 strings up', '2 frets toward the body', '2 frets toward the headstock', 'You can\'t'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — which was harder today, moving the pattern to a new key, or echoing by ear? Why?',
                response: { type: 'short', placeholder: 'e.g. echoing — I could sing it but took a while to find the starting fret' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — transposing and ear training',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Transpose box 1 to a named key',
            steps: [
              {
                text: 'Challenge 1 — Transpose Drill: write Am, Gm, Bm, and Dm on four slips, shuffle, and draw one at a time — play minor pentatonic box 1 at that key\'s fret: fret 5 (Am), fret 3 (Gm), fret 7 (Bm), fret 10 (Dm — Luna\'s solo box!). You\'ve got it when: you can find any of these four positions within 5 seconds of drawing the key name.',
                hint: 'Fret 10 should feel familiar — it\'s the exact box you\'ve been using for Luna\'s solo since Module 4, now with a name attached.',
                stuck: 'Drill just Am (fret 5) and Dm (fret 10) — the two you already know from real songs — before adding Gm and Bm.',
                levelUp: 'Move through all four positions without stopping, or have someone call out keys for you to find blind.',
                skills: [1, 2]
              }
            ]
          },
          {
            title: 'Sing it, then play it',
            steps: [
              {
                text: 'Challenge 2 — Sing-Then-Play: record yourself playing 3 random notes on the low E string (frets 0–5) without watching your hand — or use the Echo Drill play button below as your note source. Wait a moment, play the recording back, sing the notes, then find and play them. (Got someone nearby? They can play the 3 notes for you instead.)',
                hint: 'Sing FIRST, before you touch the guitar — that order is the whole skill.',
                stuck: 'Start with just one note instead of three, and build up once that\'s reliable.',
                levelUp: 'Extend to 5 notes, or record notes spread across two strings.',
                skills: [3]
              }
            ]
          },
          {
            title: 'Echo a pattern by ear',
            steps: [
              {
                text: 'Challenge 3 — Echo Drill (your assessment piece): for round 1, listen to the 3-note pattern once using the play button below, sing it back, then play it on the E or A string. For rounds 2–4, record yourself playing 3 random notes (eyes off your hand) and echo those back the same way. You\'ve got it when: 3 out of 4 patterns matched correctly, by ear alone.',
                hint: 'Resist the urge to search fret by fret at random before you\'ve sung the pattern — singing first fixes the pitch in your ear, and that\'s what your hands need to find.',
                stuck: 'Slow the pattern down and repeat just the first two notes until they\'re solid, then add the third.',
                levelUp: 'Extend the echo to 4 or 5 notes, or echo a short lick (a lick is a short solo phrase) from a tutorial video you haven\'t learned yet — a pattern you\'ve truly never heard. (A partner playing surprise patterns works too.)',
                skills: [3, 5],
                playSeq: { label: 'Echo pattern — E · G · A', bpm: 60, notes: [40, 43, 45] }
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — "the cure", by ear: strum through the progression and, without looking anything up, decide by ear which chords feel bright and which feel dark.',
                hint: 'You already know the chord names from Module 9 — today\'s challenge is trusting your ear to sort them into bright vs dark before you check.',
                stuck: 'Isolate just two chords at a time and compare them directly, back and forth.',
                levelUp: 'Guess which chord is the "home" chord using only your ear, then confirm it.',
                skills: [4, 6]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Where does box 1 sit for D minor? Can you sing a phrase from a core song and find its first note? Write both below.',
                response: { type: 'short', placeholder: 'e.g. D minor box 1 is fret 10; I found "the cure"\'s first note on the A string' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Transposes box 1 to a named key · Sings then plays a 3-note pattern · Tells major from minor by ear',
      performance: 'Draw a key slip at random, slide box 1 to it, and play it. Then three echo rounds by ear — the play button for round 1, your own self-recorded random patterns for the rest — singing each pattern back before you play it.',
      selfCheck: 'Where does box 1 sit for D minor? Can you sing a phrase from a core song and find its first note?',
      standards: ['Pr.4a', 'Pr.6a', 'Re.7b']
    },

    skills: [
      { id: 'm10w3-s1', text: 'Transpose minor pentatonic box 1 to any named key',
        practice: { type: 'mc', prompt: 'For D minor, box 1\'s root sits at low-E fret:',
          choices: ['5', '7', '10', '12'], answer: 2 } },
      { id: 'm10w3-s2', text: 'Move a riff up or down the neck to a new key and play it' },
      { id: 'm10w3-s3', text: 'Sing a short pattern, then find and play it on one string' },
      { id: 'm10w3-s4', text: 'Tell major from minor by ear',
        practice: { type: 'mc', prompt: 'A progression feels moody and dark. Its home chord is most likely:',
          choices: ['Major', 'Minor', 'A power chord', 'A slash chord'], answer: 1 } },
      { id: 'm10w3-s5', text: 'Echo back a 3-note pattern by ear on the E or A string',
        practice: { type: 'playSeq', label: 'Echo pattern — E · G · A', bpm: 60, notes: [40, 43, 45] } },
      { id: 'm10w3-s6', text: 'Identify whether a core-song chord sounds major or minor (Luna\'s F = bright, Am = dark)' }
    ]
  }

); // end module-10.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[10] = [
      { name: '"Seven Nation Army" — The White Stripes', meta: 'Name its key and scale (E minor)', type: 'Core', core: true, journeyUrl: 'tabs/seven-nation-army.html',
        originalUrl: 'https://www.youtube.com/watch?v=0J2QdDbelmY',
        tutorialUrl: 'https://www.youtube.com/watch?v=YaR6mzdNjOw' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Am — find the relative major', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'F major — why the solo uses D minor pentatonic', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Transpose the progression\'s shapes to a new key', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Smoke on the Water" — Deep Purple', meta: 'Blues scale where it\'s normally used', type: 'Choice', core: false, level: 1,
        originalUrl: 'https://www.youtube.com/watch?v=Q2FzZSBD5LE',
        tutorialUrl: 'https://www.youtube.com/watch?v=QkT5yLP5VQA' },
      { name: '"Beat It" — Michael Jackson', meta: 'The Em pentatonic solo — name the key by ear', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=oRdxUFDoQe0',
        tutorialUrl: 'https://www.youtube.com/watch?v=B5M5tVc7XZA' },
      { name: '"Ella Baila Sola" — Eslabon Armado × Peso Pluma', meta: 'Hear major vs minor in the progression', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=lZiaYpD9ZrI',
        tutorialUrl: 'https://www.youtube.com/watch?v=fciArjRISjc' },
      { name: '"House of the Rising Sun" — The Animals', meta: 'A minor — the classic minor-key sound', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=q9dyAQLYybU' }
    ];

MODULE_REVIEWS[10] = {
  moduleNum: 10,
  module: 'Scales, Keys & Ear Training',
  skills: [
    { id: 'mr10-s1', text: 'I can say the major-scale recipe (W-W-H-W-W-W-H) from memory', set: 'm10w1' },
    { id: 'mr10-s2', text: 'I can spell C major and G major note-by-note out loud', set: 'm10w1' },
    { id: 'mr10-s3', text: 'I can find the relative minor of any major key', set: 'm10w2' },
    { id: 'mr10-s4', text: 'I can build and play the blues scale from minor pentatonic box 1', set: 'm10w2' },
    { id: 'mr10-s5', text: 'I can transpose minor pentatonic box 1 to any named key', set: 'm10w3' },
    { id: 'mr10-s6', text: 'I can tell major from minor by ear', set: 'm10w3' }
  ],
  assessItems: [
    'Transpose a pentatonic pattern to a randomly drawn key and play it',
    'Name the relative minor of a given major key',
    'Identify major vs minor — and echo a short pattern — by ear'
  ],
  forward: 'You can build scales, name keys, and trust your ear. <strong>Module 11 does the same for chords:</strong> you\'ll see why Let It Be\'s four chords work, number any progression like a pro, and unlock twelve chords from one barre shape.',
  standards: ['Pr.4a', 'Pr.6a', 'Cn.10a']
};
