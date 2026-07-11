// ============================================================
//  MODULE 11 — Chords, Keys & Harmony
//  Edit this file to change Module 11 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm11w1',
    label: 'Set 1',
    locked: false,
    module: 'Chords, Keys & Harmony',
    moduleNum: 11,
    unit: 'Module 11 · Chords, Keys & Harmony',
    title: 'Set 1',
    subtitle: 'Stack every other note · I ii iii IV V vi · The chord family of a key',
    objective: 'I CAN build triads from a scale and label a progression with Roman numerals.',
    skillFocus: 'Triad = root + 3rd + 5th · UPPERCASE major (I IV V), lowercase minor (ii iii vi) · The diatonic family',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://youtu.be/lhHSU4AnXSU" target="_blank">How to Find Guitar Chords in a Key? – JustinGuitar</a>. Watch how he builds a chord on every note of the scale — that\'s the "chord family" you\'ll be naming with Roman numerals today.',
                hint: 'Every chord you\'ve ever strummed is built from a scale — today you learn the recipe that turns one scale into a whole family of chords.',
                skills: [1],
                response: { type: 'mc', prompt: 'A triad is built by stacking:',
                  answer: 1,
                  explain: 'Skip-a-note, skip-a-note: C-E-G makes the C chord. Every chord you\'ve strummed is one of these plus doubled notes.',
                  choices: ['Any three notes', 'Every other note of a scale: root, 3rd, 5th', 'Three notes on one string', 'The same note in three octaves'] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/BvD1yoWfis4" target="_blank">Triad Chords #1of3 – JustinGuitar</a>. Every chord you\'ve ever strummed is built from these same three notes — root, 3rd, 5th.',
                hint: 'Notice the pattern: three of the seven chords in a key come out major, and three come out minor — no exceptions, in any key.',
                skills: [2],
                response: { type: 'mc', prompt: 'In any major key, chords I, IV, and V are major. Chords ii, iii, and vi are:',
                  answer: 1,
                  explain: 'The scale\'s spacing makes it automatic — uppercase numerals = major, lowercase = minor.',
                  choices: ['Also major', 'Minor', 'Power chords', 'Silent'] }
              }
            ]
          },
          {
            title: 'Listen for the numerals in a familiar song',
            steps: [
              {
                text: 'Listen for it: play through Let It Be\'s C–G–Am–F loop and, before checking, guess which numeral each chord is in the key of C.',
                hint: 'C is home (I), so everything else numbers off of it — G is a fifth up, Am shares C\'s notes, F is a fourth up.',
                skills: [3],
                response: { type: 'mc', prompt: 'Let It Be\'s C–G–Am–F in the key of C is:',
                  answer: 1,
                  explain: 'C=I, G=V, Am=vi, F=IV — the most-used progression in pop history, and now you can name it.',
                  choices: ['I–IV–V–I', 'I–V–vi–IV', 'ii–V–I–IV', 'vi–IV–I–V'] }
              }
            ]
          },
          {
            title: 'Try building a chord family',
            steps: [
              {
                text: 'Now try it: build a triad on every note of the C major scale (C-D-E-F-G-A-B) and see which come out major and which come out minor.',
                hint: 'You\'ll get major-minor-minor-major-major-minor-diminished — the same pattern in every major key.',
                skills: [4, 5],
                response: { type: 'mc', prompt: 'The chord family of C major is:',
                  answer: 0,
                  explain: 'Build a triad on each scale note: major-minor-minor-major-major-minor, in every major key.',
                  choices: ['C · Dm · Em · F · G · Am', 'C · D · E · F · G · A', 'Cm · Dm · Em · Fm · Gm · Am', 'C · Dm · E · F · Gm · Am'] }
              },
              {
                text: 'Try it on Luna: F and Am aren\'t I–IV or I–V — figure out which scale degree Am is built on in the key of F before checking.',
                hint: 'Count up the F major scale: F(I) G(ii) A(iii) — Am is built on the THIRD note.',
                skills: [6],
                response: { type: 'mc', prompt: 'Luna vamps between F and Am in the key of F. In numerals that\'s:',
                  answer: 2,
                  explain: 'F=I and Am is built on F major\'s THIRD note — I–iii, a dreamier color than the famous four. Not every hit uses I–V–vi–IV.',
                  choices: ['I–vi', 'I–IV', 'I–iii', 'V–I'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — pick any core song: which numeral is its home chord, and is it major or minor?',
                response: { type: 'short', placeholder: 'e.g. Watchtower\'s home is Am — the vi of C, or "i" if you call the key A minor' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — triads and numerals',
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
            title: 'Build and play a chord family',
            steps: [
              {
                text: 'Challenge 1 — Build the Family: write out the chord families of C major and G major (six chords each) — type them below — then play each family as open chords in order.',
                hint: 'C family: C · Dm · Em · F · G · Am. G family: G · Am · Bm · C · D · Em. Notice how much they overlap — that\'s no accident.',
                stuck: 'Just play the C family first and get it solid before adding G.',
                levelUp: 'Play both families back to back without looking at what you wrote.',
                skills: [4, 5],
                response: { type: 'short', placeholder: 'C: C Dm Em F G Am · G: …' },
                chords: [
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'Dm', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'2'],[2,3,'3'],[1,1,'1']], position: 0 },
                  { name: 'Em', chord: [[6,0],[5,2,'2'],[4,2,'3'],[3,0],[2,0],[1,0]], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'D', chord: [[6,'x'],[5,'x'],[4,0],[3,2,'1'],[2,3,'3'],[1,2,'2']], position: 0 },
                  { name: 'Bm', chord: [[6,'x'],[5,'x'],[4,4,'4'],[3,4,'3'],[2,3,'2'],[1,2,'1']], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Numeral flashcards',
            steps: [
              {
                text: 'Challenge 2 — Numeral Flashcards: make seven flashcards, one numeral each (I through vii°), shuffle the deck, flip the top card, and play that chord in the key of C — no hesitating. Run the deck twice. (Got a partner handy? Have them call the numerals instead.)',
                hint: 'If you know the family in order (C Dm Em F G Am), the numeral just tells you which slot to reach for.',
                stuck: 'Write the family out in numeral order on paper and keep it in view while you drill.',
                levelUp: 'Switch to the key of G, or time yourself through the deck and beat your best run.',
                skills: [1, 2]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Let It Be, numbered: write I, V, vi, and IV on four slips, then strum the verse drawing a slip each bar (or call the numerals aloud in a random order you set beforehand) — you have to know which chord each numeral means, not just the C–G–Am–F letters. You\'ve got it when: one full loop with every numeral landing on the right chord. (A partner calling numerals works too.)',
                hint: 'This is the same verse you\'ve strummed since Module 5 — today the only new part is thinking in numerals instead of letters.',
                stuck: 'Say each chord\'s NAME out loud first, then its numeral, until the pairing sticks.',
                levelUp: 'Shuffle the slips into a new order each loop, and always land back on I to finish.',
                skills: [3],
                chords: [
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'What\'s the vi chord of G major, and can you explain in one sentence why Am is lowercase but C is uppercase?',
                response: { type: 'short', placeholder: 'e.g. Em is the vi of G; Am is lowercase because it comes out minor when you stack the scale in thirds' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Builds triads from a scale · Labels a progression with numerals · Lists a key\'s chord family',
      performance: 'Write yourself a 4-chord progression in C (any four family chords), label it in numerals, then play it.',
      selfCheck: 'What\'s the vi chord of G major? Can you explain why Am is lowercase?',
      standards: ['Pr.4a', 'Cn.10a', 'Re.9a']
    },

    skills: [
      { id: 'm11w1-s1', text: 'Build a triad from a scale (root–3rd–5th)',
        practice: { type: 'mc', prompt: 'The notes of the C major triad are:', choices: ['C-D-E', 'C-E-G', 'C-F-G', 'C-E-A'], answer: 1 } },
      { id: 'm11w1-s2', text: 'Say which chords in a major key are major (I, IV, V) and which are minor (ii, iii, vi)',
        practice: { type: 'mc', prompt: 'In the key of G, the vi chord is:', choices: ['E major', 'E minor', 'B minor', 'C major'], answer: 1 } },
      { id: 'm11w1-s3', text: 'Label Let It Be\'s C–G–Am–F as I–V–vi–IV' },
      { id: 'm11w1-s4', text: 'List the chord family of C major (C Dm Em F G Am)',
        practice: { type: 'mc', prompt: 'Which chord is NOT in the key of C?', choices: ['Am', 'F', 'E major', 'Dm'], answer: 2 } },
      { id: 'm11w1-s5', text: 'List the chord family of G major (G Am Bm C D Em)',
        practice: { type: 'mc', prompt: 'In the key of G, the IV and V chords are:', choices: ['C and D', 'A and B', 'F and G', 'D and E'], answer: 0 } },
      { id: 'm11w1-s6', text: 'Label Luna\'s F–Am vamp as I–iii in F major (with the passing Dm as vi)' }
    ]
  },

  {
    id: 'm11w2',
    label: 'Set 2',
    locked: false,
    module: 'Chords, Keys & Harmony',
    moduleNum: 11,
    unit: 'Module 11 · Chords, Keys & Harmony',
    title: 'Set 2',
    subtitle: 'The chord inventory trick · I–IV–V vs the famous four · Slash chords decoded',
    objective: 'I CAN figure out what key a song is in from the chords it uses.',
    skillFocus: 'Match the inventory to a family · The home chord feels like rest · G/B = G chord, B bass',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch (revisit): <a href="https://youtu.be/lhHSU4AnXSU" target="_blank">How to Find Guitar Chords in a Key? – JustinGuitar</a>. Same video as Set 1 — this time run the lookup backwards: given the chords, name the key.',
                hint: 'You already know each key\'s chord family from Set 1 — this is just running that lookup backwards.',
                skills: [1],
                response: { type: 'mc', prompt: 'A song uses G, C, D, and Em. Its key is almost certainly:',
                  answer: 1,
                  explain: 'All four live in G major\'s family, and G/D/C are its I, V, IV. (Em, the relative minor, shares those notes too — your ear decides between G and Em by which chord feels like home.)',
                  choices: ['C major', 'G major', 'D major', 'F major'] }
              },
              {
                text: 'Watch: <a href="https://www.youtube.com/watch?v=bT7Hj-ea0VE" target="_blank">All Along the Watchtower – Bob Dylan (Official Audio)</a>. Listen to the Am–G–F loop and, without looking anything up, decide by ear which chord feels like "home."',
                hint: 'Home is the chord the loop keeps landing back on — the one that makes the progression feel finished, not "in the air."',
                skills: [4],
                response: { type: 'mc', prompt: 'Watchtower loops Am–G–F. Which chord feels like home?',
                  answer: 2,
                  explain: 'The loop keeps landing back on Am — home base. Call the song A minor (C major\'s relative family).',
                  choices: ['G', 'F', 'Am', 'None'] }
              }
            ]
          },
          {
            title: 'Listen for I–IV–V',
            steps: [
              {
                text: 'Listen for it: count up the A major scale to find its I, IV, and V chords before checking your answer.',
                hint: 'I–IV–V is the backbone progression behind blues, rock, and a lot of cumbia — worth having on instant recall in any key.',
                skills: [2],
                response: { type: 'mc', prompt: 'I–IV–V in the key of A is:',
                  answer: 0,
                  explain: 'Count up the A major scale: A(I), D(IV), E(V) — the backbone of blues, rock, and cumbia alike.',
                  choices: ['A–D–E', 'A–C–D', 'A–E–F#m', 'A–B–C'] }
              }
            ]
          },
          {
            title: 'Try numbering a real progression',
            steps: [
              {
                text: 'Now try it: number "the cure"\'s capo-1 shapes — Am–C–Dm–F–G/B — in the key of C before checking.',
                hint: 'Ignore the slash for a moment and number the chord names first — the bass note is a separate question.',
                skills: [3],
                response: { type: 'mc', prompt: '"the cure" (capo 1 shapes) uses Am–C–Dm–F–G/B. In the key of C, Am–C–Dm–F is:',
                  answer: 0,
                  explain: 'Am=vi, C=I, Dm=ii, F=IV — and the G/B is the V chord wearing a B in the bass to walk smoothly back to C.',
                  choices: ['vi–I–ii–IV', 'I–V–vi–IV', 'ii–IV–vi–I', 'vi–IV–I–V'] }
              },
              {
                text: 'Try it fast: given only a chord list (no song name), find the single family that contains every chord before you do anything else.',
                hint: 'Inventory first, family second, home-chord-by-ear last — in that order, every time.',
                skills: [6],
                response: { type: 'mc', prompt: 'The fastest first move to find a song\'s key from a chord chart is:',
                  answer: 1,
                  explain: 'Inventory → family → then let your ear pick the home chord (major key or its relative minor).',
                  choices: ['Count the chords', 'See which single family contains ALL the chords', 'Find the loudest chord', 'Check the tempo'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — describe the "home chord" feeling in your own words.',
                response: { type: 'short', placeholder: 'e.g. like the last word of a sentence — the loop can finally stop there' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — finding the key',
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
            title: 'Chord-inventory detective drill',
            steps: [
              {
                text: 'Challenge 1 — Inventory Drill: four mystery chord sets on cards — G-C-D-Em, C-F-G-Am, D-G-A-Bm, Am-F-G-C — name each key before flipping the card. (Answers: G, C, D, C/Am.)',
                hint: 'Find the single family that contains ALL the chords on the card — that\'s the key, before your ear even weighs in.',
                stuck: 'Cross off keys one at a time — if even one chord doesn\'t belong to a family, that key is out.',
                levelUp: 'Time yourself — how fast can you call all four keys correctly in a row?',
                skills: [1, 6]
              }
            ]
          },
          {
            title: 'Play and feel for home',
            steps: [
              {
                text: 'Challenge 2 — Play and Feel: strum Am–G–F, stopping and holding each chord in turn, then say (or type below) which one feels most like "home."',
                hint: 'Play the loop a few times through first — home only reveals itself once you can hear the whole shape of the progression.',
                stuck: 'Play just Am, then G, then F in isolation and rate each one 1-10 for "does this feel finished."',
                levelUp: 'Try the same drill on a progression you haven\'t analyzed yet.',
                skills: [4],
                response: { type: 'short', placeholder: 'e.g. Am — the loop only feels finished when it lands there' },
                chords: [
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Decode a slash chord',
            steps: [
              {
                text: 'Challenge 3 — Slash Chord Walk: play C → G/B → Am as a smooth bass-line move — notice the bass note walks down one step at a time (C, B, A) while the chords change around it.',
                hint: 'This is exactly what "the cure" does to glide from the G chord back home to C — the slash chord is the connective tissue.',
                stuck: 'Play C and Am first without the G/B in between, then add it back and listen for how much smoother the move feels.',
                levelUp: 'Try the reverse walk, Am → G/B → C, or find another slash chord to decode.',
                skills: [5],
                chords: [
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'G/B', chord: [[6,'x'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Watchtower, fully numbered: play the Am–G–F loop and label every chord\'s numeral in the key of C — vi–V–IV — before landing back on Am as the true minor-key home. You\'ve got it when: one clean loop, numerals called correctly on every chord.',
                hint: 'Watchtower is C major\'s relative-minor family in action — same three chords you\'ve played since Module 2, now fully numbered.',
                stuck: 'Number just Am and G first (vi and V), then add F (IV).',
                levelUp: 'Explain out loud why Watchtower can be called "in C" or "in A minor" and both are correct.',
                skills: [4, 6],
                chords: [
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'G', chord: [[6,3,'2'],[5,2,'1'],[4,0],[3,0],[2,0],[1,3,'3']], position: 0 },
                  { name: 'F', chord: [[6,'x'],[5,'x'],[4,3,'3'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'A song uses D, G, A, and Bm — what key? And what does the B in G/B tell you to do with your bass note?',
                response: { type: 'short', placeholder: 'e.g. key of D; the B means B is the lowest note you play, even though it\'s still a G chord shape' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Finds a key from a chord inventory · Recognizes I–IV–V and I–V–vi–IV · Decodes a slash chord',
      performance: 'Key detective: pull up the chord list of a real song you haven\'t analyzed yet; deduce the key and defend your answer.',
      selfCheck: 'A song uses D, G, A, and Bm — what key? What does the B in G/B do?',
      standards: ['Pr.4a', 'Cn.10a', 'Re.9a']
    },

    skills: [
      { id: 'm11w2-s1', text: 'Identify a song\'s key from its chord inventory',
        practice: { type: 'mc', prompt: 'A song uses C, F, G, and Am. Its key:', choices: ['F major', 'C major', 'A major', 'G major'], answer: 1 } },
      { id: 'm11w2-s2', text: 'Recognize I–IV–V and I–V–vi–IV progressions by their numerals',
        practice: { type: 'mc', prompt: 'I–V–vi–IV in the key of G is:', choices: ['G–D–Em–C', 'G–C–D–Em', 'G–Am–B–C', 'G–Em–C–D'], answer: 0 } },
      { id: 'm11w2-s3', text: 'Number "the cure"\'s capo-1 progression in the key of C' },
      { id: 'm11w2-s4', text: 'Find Watchtower\'s key from Am–G–F and say why Am is home' },
      { id: 'm11w2-s5', text: 'Explain what a slash chord tells you (chord / bass note)',
        practice: { type: 'mc', prompt: 'In Am/E, your lowest sounding note should be:', choices: ['A', 'C', 'E', 'G'], answer: 2 } },
      { id: 'm11w2-s6', text: 'Given any three chords, name their key and each chord\'s numeral' }
    ]
  },

  {
    id: 'm11w3',
    label: 'Set 3',
    locked: false,
    module: 'Chords, Keys & Harmony',
    moduleNum: 11,
    unit: 'Module 11 · Chords, Keys & Harmony',
    title: 'Set 3',
    subtitle: 'One shape, twelve chords · Root names the chord · Play I–IV–V anywhere',
    objective: 'I CAN move the E-shape and A-shape barre chords to named roots and play a I–IV–V in any key.',
    skillFocus: 'E-shape root on the low E · A-shape root on the A string · Your Module 9 fretboard knowledge names every barre',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',
        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
              {
                text: 'Watch: <a href="https://youtu.be/MpMhueVEz2g" target="_blank">Basic Barré Chords #1 — the E shape (CH-006) – JustinGuitar</a>. As you watch, find the low-E-string fret for each root he names.',
                hint: 'The low-E root names an E-shape barre chord — Module 9\'s fretboard knowledge pays off here.',
                skills: [1],
                response: { type: 'mc', prompt: 'The E-shape barre chord takes its NAME from:',
                  answer: 1,
                  explain: 'The low-E root names it — barre fret 3 and the low E says G, so it\'s G major. Module 9 pays off.',
                  choices: ['The fret your pinky is on', 'The note under your barre on the low E string', 'The key of the song', 'The A string'] }
              },
              {
                text: 'Watch: <a href="https://youtu.be/C7k0CWgI-xI" target="_blank">A Shape Major Barre Chords on Guitar (my best tricks and exercises) – JustinGuitar</a>. Notice the root now lives on the A string, not the low E.',
                hint: 'Same idea as the E-shape, different string — the A-shape root is always on the A string.',
                skills: [1],
                response: { type: 'mc', prompt: 'An E-shape barre at fret 5 is:',
                  answer: 1,
                  explain: 'Low E, fret 5 = A.',
                  choices: ['G major', 'A major', 'C major', 'B major'] }
              }
            ]
          },
          {
            title: 'Listen for the A-shape root',
            steps: [
              {
                text: 'Listen for it: play an A-shape barre at fret 5 and name its root before checking — remember the root lives on the A string this time, not the low E.',
                hint: 'Count up the A string from open: A-A#-B-C-C#-D. Fret 5 lands on D.',
                skills: [2],
                response: { type: 'mc', prompt: 'An A-shape barre at fret 5 is:',
                  answer: 2,
                  explain: 'A-shape roots live on the A STRING — fret 5 there is D.',
                  choices: ['A major', 'C major', 'D major', 'E major'] }
              }
            ]
          },
          {
            title: 'Try naming a barre from its root',
            steps: [
              {
                text: 'Now try it: find B major using the A-shape barre — count up the A string until you hit B before you fret anything.',
                hint: 'A string: A(0)-A#(1)-B(2). B is only two frets up.',
                skills: [2],
                response: { type: 'mc', prompt: 'To play B major with the A shape, barre at fret:',
                  answer: 1,
                  explain: 'A string, fret 2 = B.',
                  choices: ['1', '2', '4', '7'] }
              },
              {
                text: 'Try it on paper: list all 12 chromatic notes and, for each, name the fret where an E-shape barre would land on that root.',
                hint: 'One shape, twelve chords — the ONLY thing that changes is which fret you barre.',
                skills: [5],
                response: { type: 'mc', prompt: 'One movable shape gives you twelve different chords because:',
                  answer: 0,
                  explain: 'Slide the shape, and the root fret renames it — one grip, the whole chromatic set.',
                  choices: ['You can barre at each of the 12 frets before the octave repeats', 'Guitars have 12 strings', 'You use 12 fingers', 'It doesn\'t — each shape is one chord'] }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Station Wrap-Up — open shapes or barre shapes: which would you pick for Let It Be, and why?',
                response: { type: 'short', placeholder: 'e.g. open — it rings better; but barre F beats the mini-F once my hand is warm' }
              }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — barre chords as harmony tools',
        sections: [
          {
            title: 'Warm-up — tuning check + Finger Gym',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open — then run a quick Finger Gym stretch (<a href="https://youtu.be/XDt_4ha9Xjs" target="_blank">The Finger Gym – JustinGuitar</a>) before today\'s barre-heavy work. You\'ve got it when: in tune, hand warmed up, before today\'s work.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Root-naming drill',
            steps: [
              {
                text: 'Challenge 1 — Root-Naming Drill: write a handful of chord names on slips, draw one, and find BOTH barre locations for it — the E-shape fret on the low E string AND the A-shape fret on the A string.',
                hint: 'Every chord has (at least) two barre homes — one for each shape. Module 9\'s fretboard naming is the whole trick here.',
                stuck: 'Find the E-shape location first, get comfortable, then add the A-shape hunt.',
                levelUp: 'Time yourself to both locations and beat your own best (race a partner if one\'s around), or add a third barre location further up the neck.',
                skills: [1, 2]
              }
            ]
          },
          {
            title: 'Build I–IV–V in a named key',
            steps: [
              {
                text: 'Challenge 2 — I–IV–V Builder: play I–IV–V in G (G open or fret-3 barre · C · D), then in A, then a key you draw at random from your chord slips. You\'ve got it when: clean changes in time at 60 BPM, using at least one barre shape.',
                hint: 'Once you know I–IV–V\'s shape in one key, moving the whole progression to a new key is just sliding your hands.',
                stuck: 'Stay in G until the changes are automatic, then move the whole progression up together.',
                levelUp: 'Play I–IV–V in a key using barre shapes only — no open chords at all.',
                skills: [3, 4]
              }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Oye Mi Amor, full barre: play the verse\'s Bm–G with a full A-shape barre Bm — the song\'s last training wheel, off for good. You\'ve got it when: four laps where the full Bm rings as clean as the G.',
                hint: 'This is Module 7\'s payoff, finally put to use as a harmony tool instead of just a shape to survive.',
                stuck: 'Warm up the A-shape Bm alone for a minute before adding the G change.',
                levelUp: 'Explain out loud why Bm is the ii chord of A major, using what you learned in Set 1.',
                skills: [6],
                chords: [
                  { name: 'Bm (A-shape barre)', chord: [[6,'x'],[5,2,'1'],[4,4,'3'],[3,4,'4'],[2,3,'2'],[1,2,'1']], position: 2 },
                  { name: 'F (E-shape barre)', chord: [[6,1,'1'],[5,3,'3'],[4,3,'4'],[3,2,'2'],[2,1,'1'],[1,1,'1']], position: 1 }
                ]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Where are the two places to play C major as a barre — and which shape is friendlier to your hand today?',
                response: { type: 'short', placeholder: 'e.g. E-shape fret 8 or A-shape fret 3 — the A-shape one is easier for me right now' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Names any barre chord from its root fret · Moves one shape to three named roots · Plays I–IV–V in a named key',
      performance: 'Draw a key at random; play its I–IV–V using at least one barre shape, changes in time at 60 BPM.',
      selfCheck: 'Where are the two places to play C major as a barre? Which shape is friendlier to your hand today?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm11w3-s1', text: 'Play the E-shape major barre and name its root from the low-E fret',
        practice: { type: 'mc', prompt: 'E-shape barre, fret 8:', choices: ['C major', 'G major', 'A major', 'B major'], answer: 0 } },
      { id: 'm11w3-s2', text: 'Play the A-shape major barre and name its root from the A-string fret',
        practice: { type: 'mc', prompt: 'A-shape barre, fret 7:', choices: ['D major', 'E major', 'F major', 'G major'], answer: 1 } },
      { id: 'm11w3-s3', text: 'Play a I–IV–V in a randomly drawn key using barre and/or open shapes' },
      { id: 'm11w3-s4', text: 'Move one barre shape to three different named roots' },
      { id: 'm11w3-s5', text: 'Explain why one movable shape equals twelve chords',
        practice: { type: 'mc', prompt: 'To turn an E-shape G (fret 3) into an E-shape A, move:', choices: ['Up 2 frets', 'Down 2 frets', 'Up 1 string', 'Nowhere — re-finger it'], answer: 0 } },
      { id: 'm11w3-s6', text: 'Choose open vs barre voicing for a progression and say why' }
    ]
  }

); // end module-11.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[11] = [
      { name: '"Let It Be" — The Beatles', meta: 'C–G–Am–F = I–V–vi–IV, the famous four', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=_Kw4subj5z8' },
      { name: '"Luna" — Peso Pluma, Junior H', meta: 'F–Am = I–iii in F — proof it\'s not always the famous four', type: 'Core', core: true, journeyUrl: 'tabs/luna.html',
        originalUrl: 'https://www.youtube.com/watch?v=LExSwglVFIw',
        tutorialUrl: 'https://www.youtube.com/watch?v=jtbqYAWMfok' },
      { name: '"the cure" — Olivia Rodrigo', meta: 'Number the capo-1 progression in C', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"All Along the Watchtower" — Dylan / Hendrix', meta: 'Find the key from Am–G–F', type: 'Core', core: true, journeyUrl: 'tabs/all-along-the-watchtower.html',
        originalUrl: 'https://www.youtube.com/watch?v=bT7Hj-ea0VE',
        tutorialUrl: 'https://www.youtube.com/watch?v=Tnm1jWVLaC8' },
      { name: '"Oye Mi Amor" — Maná', meta: 'Bm and barre practice with numerals', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=UlkG3DmZJEI',
        tutorialUrl: 'https://www.youtube.com/watch?v=F4BbTdP2v70' },
      { name: '"House of the Rising Sun" — The Animals', meta: 'Number an A-minor-family progression', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=q9dyAQLYybU' }
    ];

MODULE_REVIEWS[11] = {
  moduleNum: 11,
  module: 'Chords, Keys & Harmony',
  skills: [
    { id: 'mr11-s1', text: 'I can build a triad (root–3rd–5th) from any major scale', set: 'm11w1' },
    { id: 'mr11-s2', text: 'I can label a chord progression with Roman numerals, including Luna\'s F–Am vamp as I–iii', set: 'm11w1' },
    { id: 'mr11-s3', text: 'I can figure out a song\'s key from the chords it uses', set: 'm11w2' },
    { id: 'mr11-s4', text: 'I can read a slash chord (like G/B) and know which note goes on the bottom', set: 'm11w2' },
    { id: 'mr11-s5', text: 'I can name a barre chord\'s root from either the E-shape or A-shape fret', set: 'm11w3' },
    { id: 'mr11-s6', text: 'I can play a I–IV–V progression in a randomly drawn key using open or barre shapes', set: 'm11w3' }
  ],
  assessItems: [
    'Analyze a thread song\'s progression in Roman numerals and name its key',
    'Play a I–IV–V progression in a key you draw at random — open or barre shapes'
  ],
  forward: 'You can name what every chord is DOING now, and one barre grip just became twelve chords. <strong>Module 12 is the victory lap:</strong> fingerstyle goes deep — alternating thumb, waltz patterns, and the requinto sound — everything you need to pick your showcase song.',
  standards: ['Pr.4a', 'Pr.6a', 'Cn.10a', 'Re.9a']
};
