// ============================================================
//  MODULE 8 — Finger Picking
//  Edit this file to change Module 8 content.
//  Upload to GitHub alongside index.html + firebase-config.js
// ============================================================

SETS.push(

  {
    id: 'm8w1',
    label: 'Set 1',
    locked: false,
    module: 'Finger Picking',
    moduleNum: 8,
    unit: 'Module 8 · Finger Picking',
    title: 'Set 1',
    subtitle: 'Hand position · p-i-m-a · Thumb on bass · Fingers on treble',
    objective: 'I CAN hold a relaxed fingerpicking hand position and pluck the bass strings with my thumb and the treble strings with i-m-a fingers.',
    skillFocus: 'p (thumb) = bass strings (6, 5, 4) · i (index) = G string · m (middle) = B string · a (ring) = high e string · Rest stroke vs. free stroke · Fingernail vs. fingertip · Wrist arched, fingers curved · Anchor or no anchor',
    handoutUrl: 'https://docs.google.com/document/d/1mxqrOHsRRRG1smLq2pfi0NplUBCOsflrZ6O13PBo06k/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/YZkkUjDDamA" target="_blank">Beginner Fingerpicking Made Easy: Pinch, Pluck, & Play! – Marty Music</a> (full video).',
            hint: 'Pay close attention to his RIGHT HAND shape — wrist arched, fingers curved like he\'s holding a small ball. The thumb sits FORWARD of the fingers, not under them.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In classical fingerpicking notation, which finger is "p"?', choices: [
              'Index finger',
              'Middle finger',
              'Thumb',
              'Ring finger'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/K2Z3RZc5t-A" target="_blank">Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar</a> (full video).',
            hint: 'Justin shows the "p-i-m-a" assignment: thumb handles strings 6, 5, 4 (the bass) and i-m-a handle strings 3, 2, 1 (treble). One finger per string is the goal.',
            skills: [2, 3],
            response: { type: 'mc', prompt: 'Which finger normally plucks the B string (string 2)?', choices: [
              'p (thumb)',
              'i (index)',
              'm (middle)',
              'a (ring)'
            ] }
          },
          {
            text: 'Listen to "Dust in the Wind" by Kansas. Pay attention to the picking pattern — you can clearly hear the alternating bass (thumb) underneath the melody (fingers).',
            hint: 'This song is the textbook example of fingerpicking. The bass moves on every beat, the fingers play between the beats.',
            skills: [4, 5],
            response: { type: 'short', placeholder: 'In "Dust in the Wind", describe what you hear the THUMB doing vs. what the FINGERS are doing.' }
          }
        ]
      },
      c: {
        title: 'Practice station — finger assignments',        steps: [
          {
            text: 'Sit with the guitar in playing position. Put down your pick. Rest your THUMB on the low E string and your i-m-a fingers on the G, B, and high e strings respectively. Hold there for 30 seconds. Notice the shape of your hand.',
            hint: 'Your wrist should be arched (curved) — not flat against the guitar body. Fingers curved as if you\'re holding an apple. Relax.',
            skills: [1, 2]
          },
          {
            text: 'Pluck once with each finger in order: p (low E) — i (G) — m (B) — a (high e). Say each finger letter aloud as you pluck. Repeat 8 times slowly at 60 BPM.',
            hint: 'No strumming, no pick. Each finger gets ONE string. Aim for the same volume from each finger — the ring finger (a) is usually the weakest at first.',
            skills: [3, 4, 5],
            playSeq: { label: 'Hear p-i-m-a on open strings', bpm: 60, notes: [40, 55, 59, 64] }
          },
          {
            text: 'Switch the thumb to a different bass string: pluck A string with p, then G–B–e with i–m–a. Then D string with p, same fingers on top. The fingers stay put — only the thumb moves.',
            hint: 'This is how you change chords later — the thumb finds the bass note of the chord (root) while the fingers stay anchored on the treble strings.',
            skills: [2, 3, 6],
            playSeq: { label: 'Thumb shifts: E · A · D bass with i-m-a above', bpm: 60, notes: [40, 55, 59, 64, 45, 55, 59, 64, 50, 55, 59, 64] }
          }
        ]
      }
    },

    songs: [
      { name: '"House of the Rising Sun" — The Animals', meta: 'Am–C–D–F · classic fingerpicked arpeggios', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=mWJ6oRTyjnE' },
      { name: '"Dust in the Wind" — Kansas', meta: 'Travis picking · gold standard for fingerpicking', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=tH2w6Oxx0kQ',
        tutorialUrl: 'https://www.youtube.com/watch?v=u_D7GsckLYA' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Fingerpick the C–G–Am–F verse for a soft feel', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"Hallelujah" — Leonard Cohen / Jeff Buckley', meta: 'C–Am–F–G · gentle fingerpicked arpeggios', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=ttEMYvpoR-k',
        tutorialUrl: 'https://www.youtube.com/watch?v=eFLJUspLfnk' },
      { name: '"Nothing Else Matters" — Metallica', meta: 'Em–D–C · open string fingerpicking intro', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=tAGnKpE4NCI',
        tutorialUrl: 'https://www.youtube.com/watch?v=7silbMA9UME' },
      { name: '"Stairway to Heaven" — Led Zeppelin', meta: 'Am–C–D–Fmaj7 · iconic fingerpicked intro', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=QkF3oxziUI4',
        tutorialUrl: 'https://www.youtube.com/watch?v=0RybdmubxzY' },
      { name: '"Tears in Heaven" — Eric Clapton', meta: 'A–E–F#m–D · classic fingerstyle ballad', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=JxPj3GAYYZ0',
        tutorialUrl: 'https://www.youtube.com/watch?v=iS9kWyI1dxw' },
      { name: '"The Sound of Silence" — Simon & Garfunkel', meta: 'Am–G–C · gentle picking', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=l0q7MLPo-u8',
        tutorialUrl: 'https://www.youtube.com/watch?v=HItFqkAznHw' }
    ],

    assessment: {
      goal: 'Holds correct fingerpicking hand position · Assigns p to bass, i-m-a to G-B-e · Plucks each open string with the correct finger · Plays through p-i-m-a in order without looking',
      performance: 'Class plays p-i-m-a on open strings in unison at 60 BPM for 8 reps. Teacher walks the room and checks each student\'s hand position.',
      selfCheck: 'Can you pluck a string with your "a" finger without looking? Can you keep your wrist arched for 30 seconds without it collapsing?',
      standards: ['Pr.4a', 'Pr.5a']
    },

    skills: [
      { id: 'm8w1-s1', text: 'Hold a relaxed fingerpicking hand position — wrist arched, fingers curved',
        gotItWhen: 'you can hold the position for 30 seconds without your wrist collapsing flat, and your fingers stay curved (not flat) over the treble strings.',
        practice: { type: 'mc', prompt: 'In a correct fingerpicking hand position, your wrist should be:',
          choices: ['Flat against the guitar body', 'Arched (curved away from the guitar)', 'Locked stiff', 'Pointing toward the floor'], answer: 1 } },
      { id: 'm8w1-s2', text: 'Identify p, i, m, a finger letters and their string assignments',
        gotItWhen: 'you can say "p = thumb / bass strings, i = index / G, m = middle / B, a = ring / high e" without hesitating — and assign a finger to any string on demand.',
        practice: { type: 'mc', prompt: 'In p-i-m-a notation, which finger handles the G string (string 3)?',
          choices: ['p (thumb)', 'i (index)', 'm (middle)', 'a (ring)'], answer: 1 } },
      { id: 'm8w1-s3', text: 'Pluck the low E string cleanly with my thumb (p)',
        gotItWhen: 'your thumb pulls down and slightly inward (toward the body) and the low E rings clearly with a warm, full tone — no clicking.',
        practice: { type: 'playSeq', label: 'Thumb only — low E · A · D bass strings', bpm: 60,
          notes: [40, 45, 50] } },
      { id: 'm8w1-s4', text: 'Pluck the G, B, and high e strings with i, m, a fingers respectively',
        gotItWhen: 'each finger goes to its assigned string without you having to look — and all three sound roughly equal in volume.',
        practice: { type: 'playSeq', label: 'i · m · a on G · B · e', bpm: 60,
          notes: [55, 59, 64] } },
      { id: 'm8w1-s5', text: 'Pluck p-i-m-a in order on open strings at 60 BPM',
        gotItWhen: 'you can pluck low E (p), G (i), B (m), high e (a) in order, four times in a row at 60 BPM, all four notes equal in volume.',
        practice: { type: 'playSeq', label: 'p-i-m-a (low E · G · B · e) at 60 BPM', bpm: 60,
          notes: [40, 55, 59, 64] } },
      { id: 'm8w1-s6', text: 'Move the thumb to a different bass string while i-m-a stay on G, B, e',
        gotItWhen: 'when the chord changes from Am to C, your thumb shifts from A string to A string (or wherever the new root is) while your i-m-a fingers stay anchored on G-B-e the whole time.' }
    ]
  },

  {
    id: 'm8w2',
    label: 'Set 2',
    locked: false,
    module: 'Finger Picking',
    moduleNum: 8,
    unit: 'Module 8 · Finger Picking',
    title: 'Set 2',
    subtitle: 'Basic PIMA pattern · The classic arpeggio · Over a single chord',
    objective: 'I CAN play a basic p-i-m-a-m-i fingerpicking arpeggio pattern cleanly over a single open chord at 70 BPM.',
    skillFocus: 'The classic 6-note PIMA arpeggio (p-i-m-a-m-i) · 8th-note timing · Even volume across fingers · Free stroke technique · Holding a chord while picking through it',
    handoutUrl: 'https://docs.google.com/document/d/1mxqrOHsRRRG1smLq2pfi0NplUBCOsflrZ6O13PBo06k/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/K2Z3RZc5t-A" target="_blank">Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar</a> (rewatch with the 6-note pattern in mind).',
            hint: 'The "p-i-m-a-m-i" cycle (6 notes per bar) is one of the most-used patterns in folk and pop. It creates a flowing, arpeggiated feel under a chord.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In the 6-note pattern "p-i-m-a-m-i", how many times does each finger play in one cycle?', choices: [
              'p once, i twice, m twice, a once',
              'Each finger plays exactly once',
              'p three times, others once each',
              'p twice, i once, m once, a twice'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/YZkkUjDDamA" target="_blank">Beginner Fingerpicking Made Easy – Marty Music</a> (rewatch the pattern walkthrough).',
            hint: 'Marty\'s "pinch and pluck" demonstration breaks the pattern into chunks. Focus on the FINGER ORDER — once it\'s automatic, your speed will follow.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'When the chord changes, does the picking pattern change too, or stay the same?' }
          },
          {
            text: 'Listen to "Nothing Else Matters" by Metallica. The intro is entirely fingerpicked open chords. Tap along — can you feel the 6-note pulse?',
            hint: 'James Hetfield famously taught himself this with no plan. He uses thumb-finger-thumb-finger patterns. Notice the constant thumb motion.',
            skills: [4, 5],
            response: { type: 'mc', prompt: 'In a typical fingerpicked arpeggio, what role does the THUMB usually play?', choices: [
              'It moves least — it stays on a bass string and provides the foundation',
              'It moves fastest, switching strings every beat',
              'It doesn\'t play at all in arpeggios',
              'It plays the highest notes'
            ] }
          }
        ]
      },
      c: {
        title: 'Practice station — the 6-note pattern',        steps: [
          {
            text: 'Fret Em (the easiest chord). Set metronome to 60 BPM. Play the 6-note pattern: p (low E) — i (G) — m (B) — a (high e) — m (B) — i (G). One note per click. Repeat for 8 bars.',
            hint: 'Count "1 + 2 + 3 + 4 +" and play 6 notes per bar — meaning some notes fall on numbers, some on "+"s. Don\'t worry about exact counting yet; just keep the pulse steady.',
            skills: [1, 2, 3],
            playSeq: { label: 'Em p-i-m-a-m-i pattern at 60 BPM', bpm: 60,
              notes: [40, 55, 59, 64, 59, 55] }
          },
          {
            text: 'Now play the same pattern over Am: thumb on A string (the root of Am), i-m-a stay on G-B-e. Repeat 8 times.',
            hint: 'The only thing that changes between Em and Am is which bass string the thumb plays. Fingers stay anchored on G, B, high e.',
            skills: [3, 4, 6],
            playSeq: { label: 'Am p-i-m-a-m-i pattern', bpm: 60,
              notes: [45, 57, 60, 64, 60, 57] }
          },
          {
            text: 'Speed it up: 70 BPM with Em. Then try at 80. If the pattern falls apart, drop back to 60 — better slow and clean than fast and messy.',
            hint: 'The most common mistake: the "a" finger lags. Pay extra attention to your ring finger — it needs to land exactly on its beat, no later.',
            skills: [2, 5]
          }
        ]
      }
    },

    songs: [
      { name: '"House of the Rising Sun" — The Animals', meta: 'Am–C–D–F · pure 6-note arpeggios per chord', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=mWJ6oRTyjnE' },
      { name: '"Hallelujah" — Leonard Cohen / Jeff Buckley', meta: 'C–Am–F–G · gentle p-i-m-a arpeggios', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=ttEMYvpoR-k',
        tutorialUrl: 'https://www.youtube.com/watch?v=eFLJUspLfnk' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Soft verse fingerpicked over C–G–Am–F', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"Wish You Were Here" — Pink Floyd', meta: 'Em–G–Am–C · fingerpicked arpeggios + strum', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=IXdNnw99-Ic',
        tutorialUrl: 'https://www.youtube.com/watch?v=IzxMeQgtyYE' },
      { name: '"Time of Your Life" — Green Day', meta: 'G–C–D · simple fingerpicked verse', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=CnQ8N1KacJc',
        tutorialUrl: 'https://www.youtube.com/watch?v=uD_iA34SmgM' },
      { name: '"Mad World" — Gary Jules / Tears for Fears', meta: 'Em–G–D–A · slow fingerpicked feel', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=etSbOs3aUqI',
        tutorialUrl: 'https://www.youtube.com/watch?v=r-rvJsxhkQM' },
      { name: '"Hotel California" — Eagles', meta: 'Bm–F#–A–E · classic 12-string fingerpicked intro', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=09839DpTctU',
        tutorialUrl: 'https://www.youtube.com/watch?v=JIDdI-AtK-Q' },
      { name: '"Blackbird" — The Beatles', meta: 'Advanced · alternating thumb + melody (CHALLENGE)', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=Man4Xw8Xypo',
        tutorialUrl: 'https://www.youtube.com/watch?v=Qqw15309knU' }
    ],

    assessment: {
      goal: 'Plays p-i-m-a-m-i pattern cleanly over one chord · Even volume across all fingers · Pattern stays steady at 70 BPM · Adapts to a different chord by moving only the thumb',
      performance: 'Class plays the 6-note pattern over Em for 4 bars, then Am for 4 bars, in unison at 70 BPM. Teacher listens for even volume on every finger.',
      selfCheck: 'Can you play 8 bars of the pattern without losing your place? Can you switch from Em to Am bass without breaking the picking?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm8w2-s1', text: 'Play the 6-note p-i-m-a-m-i pattern in order from memory',
        gotItWhen: 'you can play the sequence p-i-m-a-m-i on open strings (or one chord) at 60 BPM without having to think about which finger comes next.',
        practice: { type: 'mc', prompt: 'In the "p-i-m-a-m-i" pattern, which two fingers each play TWICE per bar?',
          choices: ['p and a', 'i and m', 'p and i', 'm and a'], answer: 1 } },
      { id: 'm8w2-s2', text: 'Pluck with even volume across all four fingers',
        gotItWhen: 'when you listen back to your picking, no single finger is noticeably louder or quieter than the others — including the ring finger (a), which is hardest.',
        practice: { type: 'mc', prompt: 'Which finger is usually the WEAKEST at first and needs extra practice?',
          choices: ['p (thumb)', 'i (index)', 'm (middle)', 'a (ring)'], answer: 3 } },
      { id: 'm8w2-s3', text: 'Hold an Em chord while picking through it cleanly',
        gotItWhen: 'your fretting hand stays planted on Em the entire bar while your picking hand cycles through the pattern — and every note rings clearly.',
        practice: { type: 'playSeq', label: 'Em arpeggio p-i-m-a-m-i', bpm: 60,
          notes: [40, 55, 59, 64, 59, 55] } },
      { id: 'm8w2-s4', text: 'Play the pattern over Am (thumb on A string)',
        gotItWhen: 'you can switch your THUMB from low E to A string when the chord changes Em → Am, while i-m-a stay on G-B-e the whole time.',
        practice: { type: 'playSeq', label: 'Am arpeggio p-i-m-a-m-i', bpm: 60,
          notes: [45, 57, 60, 64, 60, 57] } },
      { id: 'm8w2-s5', text: 'Keep the pattern steady at 70 BPM for 4+ bars',
        gotItWhen: 'you can play the pattern for at least 4 bars at 70 BPM without your tempo slowing down or speeding up — the metronome and you agree the whole time.' },
      { id: 'm8w2-s6', text: 'Switch the thumb to a new bass string at a chord change',
        gotItWhen: 'at a chord change, only your thumb moves to find the new root note — i-m-a stay parked on G, B, high e. The pattern continues uninterrupted.' }
    ]
  },

  {
    id: 'm8w3',
    label: 'Set 3',
    locked: false,
    module: 'Finger Picking',
    moduleNum: 8,
    unit: 'Module 8 · Finger Picking',
    title: 'Set 3',
    subtitle: 'Fingerpick a full progression · Travis picking intro · Performance song',
    objective: 'I CAN fingerpick through a full chord progression in time and perform one fingerpicked song from start to finish.',
    skillFocus: 'Picking through 4-chord progressions · Travis picking intro (alternating bass thumb) · Smooth chord transitions without breaking the pattern · Choosing a fingerpicked song for performance',
    handoutUrl: 'https://docs.google.com/document/d/1mxqrOHsRRRG1smLq2pfi0NplUBCOsflrZ6O13PBo06k/edit',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        steps: [
          {
            text: 'Watch: <a href="https://youtu.be/XQiaCSabQaE" target="_blank">A Total Beginners Guide To Travis Picking – Andy Guitar</a> (full video).',
            hint: 'Travis picking uses an ALTERNATING thumb: bass note on beat 1, different bass note on beat 3. The fingers fill in between. It\'s the foundation of country, folk, and a lot of pop.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In Travis picking, what does the THUMB do?', choices: [
              'Plays the same bass note over and over',
              'Alternates between two bass notes — usually the root and the 5th',
              'Doesn\'t play at all',
              'Plays the melody'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/7silbMA9UME" target="_blank">Nothing Else Matters Guitar Lesson Part 1 – Marty Music</a> (full video).',
            hint: 'The hardest part: keeping the picking pattern PERFECTLY STEADY through a chord change. Anticipate the next chord — start moving your fretting hand on the LAST note of the current bar.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'When you fingerpick from Am to C, when (which note in the bar) does your fretting hand start preparing for the next chord?' }
          },
          {
            text: 'Listen to one of: "House of the Rising Sun", "Dust in the Wind", or "Hallelujah". Listen to a full verse. Can you hear when the chord changes? Does the pattern ever break?',
            hint: 'In professional recordings the pattern almost never breaks at a chord change — that\'s your standard. It\'s a high bar but worth aiming for.',
            skills: [4, 5],
            response: { type: 'short', placeholder: 'Which song did you listen to? Did the picking pattern stay completely steady through every chord change?' }
          }
        ]
      },
      c: {
        title: 'Practice station — full progressions & performance',        steps: [
          {
            text: 'Pick a 4-chord progression: Am–C–D–F (House of the Rising Sun) or C–Am–F–G (Hallelujah-style). Play the 6-note arpeggio over each chord, 1 bar each, at 60 BPM.',
            hint: 'For each chord, the thumb plays the ROOT bass note (Am = A string, C = A string, D = D string, F = D string). Fingers always on G-B-e.',
            skills: [1, 3, 4],
            playSeq: { label: 'Am · C · D · F bass roots', bpm: 60,
              notes: [45, 48, 50, 53] }
          },
          {
            text: 'Travis picking warm-up on C major: thumb alternates between A string (root, beats 1 & 3) and G string (beats 2 & 4). Try thumb-only first, no fingers, at 60 BPM.',
            hint: 'Just the thumb! Once that\'s steady, add an i-pluck on the B string on the "+" of each beat. Travis picking adds fingers ON TOP of an already-grooving thumb.',
            skills: [2, 5]
          },
          {
            text: 'Performance choice: pick ONE song to perform: "House of the Rising Sun" or "Hallelujah" or "Vampire" (verse) or one from the choice list. Play it through 3 times without stopping — even with mistakes.',
            hint: 'For your performance, keep going no matter what. Mistakes in performance are normal. Stopping is what makes them sound bad. Practice the recovery.',
            skills: [4, 5, 6]
          }
        ]
      }
    },

    songs: [
      { name: '"House of the Rising Sun" — The Animals', meta: 'Am–C–D–F–Am–C–E–E · the classic fingerpicked song', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=mWJ6oRTyjnE' },
      { name: '"Hallelujah" — Leonard Cohen / Jeff Buckley', meta: 'C–Am–F–G · slow tempo, perfect performance choice', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=ttEMYvpoR-k',
        tutorialUrl: 'https://www.youtube.com/watch?v=eFLJUspLfnk' },
      { name: '"Vampire" — Olivia Rodrigo', meta: 'Fingerpick the verse · C–G–Am–F', type: 'Core', core: true,
        originalUrl: 'https://www.youtube.com/watch?v=RlPNh_PBZb4',
        tutorialUrl: 'https://www.youtube.com/watch?v=AmfDC2xL7xg' },
      { name: '"Dust in the Wind" — Kansas', meta: 'Pure Travis picking · advanced but iconic', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=tH2w6Oxx0kQ',
        tutorialUrl: 'https://www.youtube.com/watch?v=u_D7GsckLYA' },
      { name: '"Tears in Heaven" — Eric Clapton', meta: 'A–E–F#m–D · gentle fingerpicked ballad', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=JxPj3GAYYZ0',
        tutorialUrl: 'https://www.youtube.com/watch?v=iS9kWyI1dxw' },
      { name: '"Time of Your Life" — Green Day', meta: 'G–C–D · simple progression, easy to perform', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=CnQ8N1KacJc',
        tutorialUrl: 'https://www.youtube.com/watch?v=uD_iA34SmgM' },
      { name: '"Landslide" — Fleetwood Mac', meta: 'C–G/B–Am–G · classic fingerpicked song', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=WM7-PYtXtJM',
        tutorialUrl: 'https://www.youtube.com/watch?v=mLHQUDjQ23g' },
      { name: '"Blackbird" — The Beatles', meta: 'Advanced fingerpicking · semester capstone challenge', type: 'Choice', core: false,
        originalUrl: 'https://www.youtube.com/watch?v=Man4Xw8Xypo',
        tutorialUrl: 'https://www.youtube.com/watch?v=Qqw15309knU' }
    ],

    assessment: {
      goal: 'Fingerpicks through a full 4-chord progression · Pattern stays steady through chord changes · Demonstrates Travis picking (alternating bass thumb) · Performs one full fingerpicked song from start to finish',
      performance: 'Solo or paired: perform one full song from the song list using fingerpicking from start to finish. Teacher evaluates pattern consistency, chord changes, and timing.',
      selfCheck: 'Can you play a 4-chord song with fingerpicking and not break the pattern at any chord change? Can your thumb alternate between two bass strings for 4 bars without confusion?',
      standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
    },

    skills: [
      { id: 'm8w3-s1', text: 'Fingerpick a 4-chord progression with the pattern unbroken',
        gotItWhen: 'you can play Am–C–D–F (or another 4-chord progression) with the 6-note arpeggio over each chord, and the pattern never breaks at a chord change.',
        practice: { type: 'playSeq', label: 'Am · C · D · F bass roots', bpm: 60,
          notes: [45, 48, 50, 53] } },
      { id: 'm8w3-s2', text: 'Demonstrate Travis picking — thumb alternates between two bass strings',
        gotItWhen: 'your thumb plays the root of the chord on beats 1 and 3, and a different bass string on beats 2 and 4 — steadily, for at least 4 bars.',
        practice: { type: 'mc', prompt: 'In Travis picking on a C major chord, your thumb might alternate between which two strings?',
          choices: ['B string and high e', 'A string (root C) and G string', 'High e and G string', 'Low E and high e'], answer: 1 } },
      { id: 'm8w3-s3', text: 'Keep the picking pattern steady through a chord change',
        gotItWhen: 'when the chord changes mid-song, you don\'t miss a single note in the picking pattern — the fretting hand catches up, but the picking pattern stays exact.' },
      { id: 'm8w3-s4', text: 'Anticipate the next chord by moving the fretting hand on the last note of the bar',
        gotItWhen: 'your fretting hand starts repositioning for the next chord BEFORE the current bar ends — by the time the new bar starts, you\'re ready.',
        practice: { type: 'mc', prompt: 'When should your FRETTING hand start moving toward the next chord?',
          choices: ['On the first beat of the new bar', 'On the LAST note of the current bar — anticipate', 'Halfway through the current bar', 'Never — wait for the change'], answer: 1 } },
      { id: 'm8w3-s5', text: 'Play a full verse of a fingerpicked song from start to finish',
        gotItWhen: 'you can fingerpick through a complete verse of "House of the Rising Sun" or "Hallelujah" without stopping — mistakes ok, but you keep going.' },
      { id: 'm8w3-s6', text: 'Perform a fingerpicked song for an audience (class, partner, family)',
        gotItWhen: 'you can perform your chosen song in front of someone else, all the way through, with fingerpicking — and recover from any mistakes without breaking down.' }
    ]
  }

); // end module-8.js

MODULE_REVIEWS[8] = {
  moduleNum: 8,
  module: 'Finger Picking',
  skills: [
    { id: 'mr8-s1', text: 'I can use my thumb (p) for bass strings and i-m-a fingers for treble strings' },
    { id: 'mr8-s2', text: 'I can play a basic fingerpicking pattern (e.g. Travis or PIMA) cleanly' },
    { id: 'mr8-s3', text: 'I can fingerpick through a full chord progression in time' }
  ],
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
};
