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
    skillFocus: 'A relaxed fingerpicking hand position · Thumb on the bass strings, fingers on the treble · Rest stroke vs. free stroke',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/YZkkUjDDamA" target="_blank">Beginner Fingerpicking Made Easy: Pinch, Pluck, & Play! – Marty Music</a> (0:00–5:00). As you watch, copy his RIGHT-HAND shape on your own guitar — thumb resting on the low E, fingers curved over the treble strings.',
            hint: 'Watch the right hand: wrist arched, fingers curved like he\'s holding a small ball. The thumb sits FORWARD of the fingers, not tucked under them.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In classical fingerpicking notation, which finger is "p"?',
              answer: 2,
              explain: '"p" is the thumb (from Spanish "pulgar"). The rest: i = index, m = middle, a = ring.',
              choices: [
              'Index finger',
              'Middle finger',
              'Thumb',
              'Ring finger'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/K2Z3RZc5t-A" target="_blank">Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar</a> (0:00–4:00). Pause when he assigns the fingers and place yours the same way: p on the bass, i-m-a on G-B-e.',
            hint: 'Justin\'s assignment: thumb handles strings 6, 5, 4 (the bass) and i-m-a handle strings 3, 2, 1 (treble). One finger per string is the goal.',
            skills: [2, 3],
            response: { type: 'mc', prompt: 'Which finger normally plucks the B string (string 2)?',
              answer: 2,
              explain: 'Each finger gets a "home" string: i on G (3), m on B (2), a on high e (1). So the B string is m (middle).',
              choices: [
              'p (thumb)',
              'i (index)',
              'm (middle)',
              'a (ring)'
            ] }
          }
            ]
          },
          {
            title: 'Listen for the thumb and fingers',
            steps: [
          {
            text: 'Listen to "Dust in the Wind" by Kansas. Pay attention to the picking pattern — you can clearly hear the alternating bass (thumb) underneath the melody (fingers).',
            hint: 'This song is the textbook example of fingerpicking. The bass moves on every beat, the fingers play between the beats.',
            skills: [4, 5],
            response: { type: 'short', placeholder: 'In "Dust in the Wind", describe what you hear the THUMB doing vs. what the FINGERS are doing.' }
          }
            ]
          },
          {
            title: 'Try p-i-m-a on open strings',
            steps: [
          {
            text: 'Now try it: pluck p-i-m-a on open strings — low E (p), G (i), B (m), high e (a). Click any note below the TAB to hear it, then play the staircase on your own guitar, one finger per string.',
            hint: 'No pick, no chord yet — just the right hand. Each pluck lands on its own string, reading left to right. Aim for the same volume from every finger.',
            skills: [3, 4, 5],
            tab: {
              caption: 'p-i-m-a on open strings · low E · G · B · high e',
              notes: [
                { string: 'E', fret: 0, note: 'E', midi: 40 },
                { string: 'G', fret: 0, note: 'G', midi: 55 },
                { string: 'B', fret: 0, note: 'B', midi: 59 },
                { string: 'e', fret: 0, note: 'e', midi: 64 }
              ]
            }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — take a beat to reflect: which finger felt the most awkward today, and what helped it land more evenly?',
            response: { type: 'short', placeholder: 'e.g. the ring (a) finger was weakest — slowing down and watching it helped' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — finger assignments',
        sections: [
          {
            title: 'Warm-up — tuning check (Module 1)',
            steps: [
              {
                text: 'Start every practice session the same way: tune all 6 strings to green (E A D G B e), then play each string open. You\'ve got it when: in tune before today\'s work.',
                hint: 'Tuning (Module 1) matters even more in fingerpicking — every note is exposed, so an out-of-tune string is easy to hear.',
                playSeq: { label: 'Hear all 6 strings in tune', bpm: 50, notes: [40, 45, 50, 55, 59, 64] }
              }
            ]
          },
          {
            title: 'Set up a relaxed fingerpicking hand',
            steps: [
          {
            text: 'Challenge 1 — Hand Shape: put the pick down, rest your thumb on the low E and i-m-a on the G, B, and high e strings, and hold for 30 seconds. You\'ve got it when: a relaxed, arched wrist with curved fingers — like holding an apple.',
            hint: 'Your wrist should be arched (curved) — not flat against the guitar body. Fingers curved as if you\'re holding an apple. Relax.',
            stuck: 'Drop your hand to your side and shake it loose, then place it back on the strings without tensing up — relaxed first, accurate second.',
            levelUp: 'Hold the shape, look away, then pluck each string in turn by feel alone — no peeking.',
            skills: [1, 2]
          }
            ]
          },
          {
            title: 'Pluck p-i-m-a — thumb bass, i-m-a treble',
            steps: [
          {
            text: 'Challenge 2 — p-i-m-a Plucks (your assessment piece): pluck once with each finger in order — p (low E), i (G), m (B), a (high e) — saying each letter aloud, 8 times at 60 BPM. You\'ve got it when: the same volume from every finger, even the weaker ring (a). This open-string check is the Set 1 check-off.',
            hint: 'No strumming, no pick. Each finger gets ONE string. Aim for the same volume from each finger — the ring finger (a) is usually the weakest at first. Set the ⏱ Timer for 2 minutes and loop it.',
            stuck: 'Pluck just p then i, over and over, until those two are even — then add m, then a.',
            levelUp: 'Run it backwards (a-m-i-p), or close your eyes and keep every finger on its string.',
            skills: [3, 4, 5],
            playSeq: { label: 'Hear p-i-m-a on open strings', bpm: 60, notes: [40, 55, 59, 64] },
            response: { type: 'short', prompt: 'Personal record: win at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN, even p-i-m-a lap today (BPM)?', placeholder: 'e.g. 80 — beat it next session' }
          }
            ]
          },
          {
            title: 'Move the thumb between bass strings',
            steps: [
          {
            text: 'Challenge 3 — Moving Bass: pluck the A string with p then G-B-e with i-m-a, then the D string with p, fingers staying put. You\'ve got it when: only the thumb moves to find each bass note — the i-m-a fingers stay anchored.',
            hint: 'This is how you change chords later — the thumb finds the bass note of the chord (root) while the fingers stay anchored on the treble strings.',
            stuck: 'Move just the thumb E → A → D with the fingers resting (not plucking) on G-B-e, until the thumb finds each bass without looking.',
            levelUp: 'Call out the bass string a beat before you play it, or shift E → A → D → A → E in a continuous loop without stopping.',
            skills: [2, 3, 6],
            playSeq: { label: 'Thumb shifts: E · A · D bass with i-m-a above', bpm: 60, notes: [40, 55, 59, 64, 45, 55, 59, 64, 50, 55, 59, 64] }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — "the cure", first touch: fret Am and pluck p (A string) · i · m · a, one note per beat at 60 BPM — that soft broken-chord sound IS the verse feel of "the cure". Then change to C: your thumb\'s bass note doesn\'t even move — C\'s root lives on the A string too. You\'ve got it when: four clean p-i-m-a laps on Am and four on C, every note even.',
                hint: 'Olivia\'s verse is fingerpicked for exactly this reason — soft and close. Wrist stays arched; only the fingers move.',
                stuck: 'Run p-i-m-a on open strings first (no chord at all), then add the Am under it.',
                levelUp: 'Add the F: the thumb travels to the D string — and now you have the song\'s whole verse loop (Am · C · F).',
                skills: [5, 6],
                playSeq: { label: '"the cure" feel — p-i-m-a on Am', bpm: 60, notes: [45, 57, 60, 64] },
                chords: [
                  { name: 'Am', chord: [[6,'x'],[5,0],[4,2,'2'],[3,2,'3'],[2,1,'1'],[1,0]], position: 0 },
                  { name: 'C', chord: [[6,'x'],[5,3,'3'],[4,2,'2'],[3,0],[2,1,'1'],[1,0]], position: 0 }
                ]
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'Which still needs work — keeping the wrist arched, or getting even volume from all four fingers? Write it below — that\'s your warm-up target next time you practice.',
                response: { type: 'short', placeholder: 'e.g. the ring finger is still quieter than the others; wrist flattens when I speed up' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Holds correct fingerpicking hand position · Assigns p to bass, i-m-a to G-B-e · Plucks each open string with the correct finger · Plays through p-i-m-a in order without looking',
      performance: 'Play p-i-m-a on open strings at 60 BPM for 8 reps. Check your own hand position in a mirror or on your device\'s camera — wrist arched, fingers curved.',
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
    skillFocus: 'Playing a PIMA arpeggio pattern · Keeping even timing and volume · Picking through a held chord',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/K2Z3RZc5t-A" target="_blank">Basic Fingerstyle – Travis Finger Picking (FO-108) – JustinGuitar</a> (revisit 0:00–4:00). This time, watch one full pattern cycle and count the notes out loud with him.',
            hint: 'The "p-i-m-a-m-i" cycle (6 notes per bar) is one of the most-used patterns in folk and pop. It creates a flowing, arpeggiated feel under a chord.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In the 6-note pattern "p-i-m-a-m-i", how many times does each finger play in one cycle?',
              answer: 0,
              explain: 'Count the letters: p(1) i(2) m(2) a(1) — i and m each play twice as the pattern climbs up and back down, while p and a play once.',
              choices: [
              'p once, i twice, m twice, a once',
              'Each finger plays exactly once',
              'p three times, others once each',
              'p twice, i once, m once, a twice'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/YZkkUjDDamA" target="_blank">Beginner Fingerpicking Made Easy – Marty Music</a> (revisit 0:00–3:00 for the pattern walkthrough). Mute the strings with your fretting hand and tap the FINGER ORDER on the guitar top as he plays.',
            hint: 'Marty\'s "pinch and pluck" demonstration breaks the pattern into chunks. Focus on the FINGER ORDER — once it\'s automatic, your speed will follow.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'When the chord changes, does the picking pattern change too, or stay the same?' }
          }
            ]
          },
          {
            title: 'Listen for the 6-note pulse',
            steps: [
          {
            text: 'Listen to "Nothing Else Matters" by Metallica. The intro is entirely fingerpicked open chords. Tap along — can you feel the 6-note pulse?',
            hint: 'James Hetfield famously taught himself this with no plan. He uses thumb-finger-thumb-finger patterns. Notice the constant thumb motion.',
            skills: [4, 5],
            response: { type: 'mc', prompt: 'In a typical fingerpicked arpeggio, what role does the THUMB usually play?',
              answer: 0,
              explain: 'The thumb is the anchor — it stays on a bass string and lays down the foundation while i, m, and a handle the higher, faster notes.',
              choices: [
              'It moves least — it stays on a bass string and provides the foundation',
              'It moves fastest, switching strings every beat',
              'It doesn\'t play at all in arpeggios',
              'It plays the highest notes'
            ] }
          }
            ]
          },
          {
            title: 'Try the pattern on Em',
            steps: [
          {
            text: 'Now try it: fret Em and play the 6-note p-i-m-a-m-i arpeggio. Click any note below the TAB to hear it, then play the staircase yourself — thumb on the low E (Em\'s root), i-m-a on G-B-e, then back down m-i.',
            hint: 'Em is all open strings on the treble side, so you can focus entirely on the picking hand. Read the TAB left to right — the bass note starts it, then the fingers climb and come back.',
            skills: [1, 2, 3],
            tab: {
              caption: 'Em arpeggio · p-i-m-a-m-i · thumb on the low E',
              notes: [
                { string: 'E', fret: 0, note: 'E', midi: 40 },
                { string: 'G', fret: 0, note: 'G', midi: 55 },
                { string: 'B', fret: 0, note: 'B', midi: 59 },
                { string: 'e', fret: 0, note: 'e', midi: 64 },
                { string: 'B', fret: 0, note: 'B', midi: 59 },
                { string: 'G', fret: 0, note: 'G', midi: 55 }
              ]
            }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — take a beat to reflect: did the pattern start to feel automatic, or were you still thinking through each finger? What would make it smoother?',
            response: { type: 'short', placeholder: 'e.g. still counting each finger — slowing the metronome down helped it flow' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — the 6-note pattern',
        sections: [
          {
            title: 'Play the p-i-m-a-m-i pattern on Em',
            steps: [
          {
            text: 'Challenge 1 — Em Pattern: fret Em and play the 6-note pattern p-i-m-a-m-i at 60 BPM, one note per click, for 8 bars. You\'ve got it when: a steady, even pulse with every note ringing clean.',
            hint: 'Count "1 + 2 + 3 + 4 +" and play 6 notes per bar — meaning some notes fall on numbers, some on "+"s. Don\'t worry about exact counting yet; just keep the pulse steady.',
            stuck: 'Drop the metronome and play the pattern as slowly as you need to — get the finger order automatic first, speed comes after.',
            levelUp: 'Play 8 bars without a single uneven note, or close your eyes and keep the pulse rock-steady.',
            skills: [1, 2, 3],
            playSeq: { label: 'Em p-i-m-a-m-i pattern at 60 BPM', bpm: 60,
              notes: [40, 55, 59, 64, 59, 55] }
          }
            ]
          },
          {
            title: 'Play the pattern on Am (move the thumb)',
            steps: [
          {
            text: 'Challenge 2 — Am Pattern: fret Am and play the 6-note pattern over it — thumb on the A string (Am\'s root), i-m-a still on G-B-e — 8 times. You\'ve got it when: only the thumb moves to the new bass; the fingers stay anchored. Click any note below the TAB to hear it.',
            hint: 'The only change from Em is which bass string the thumb plays. Fingers stay parked on G, B, high e.',
            stuck: 'Drop the pattern — just pluck the Am bass (p) and let it ring, then add i-m-a one finger at a time.',
            levelUp: 'Switch Em → Am every 2 bars without breaking the pulse — only the thumb relocates.',
            skills: [3, 4, 6],
            tab: {
              caption: 'Am arpeggio · p-i-m-a-m-i · thumb on the A string',
              notes: [
                { string: 'A', fret: 0, note: 'A', midi: 45 },
                { string: 'G', fret: 2, note: 'A', midi: 57 },
                { string: 'B', fret: 1, note: 'C', midi: 60 },
                { string: 'e', fret: 0, note: 'E', midi: 64 },
                { string: 'B', fret: 1, note: 'C', midi: 60 },
                { string: 'G', fret: 2, note: 'A', midi: 57 }
              ]
            }
          }
            ]
          },
          {
            title: 'Build up your tempo (70+ BPM)',
            steps: [
          {
            text: 'Challenge 3 — Beat Your Tempo (your assessment piece): play the Em pattern at 70 BPM, then try 80. You\'ve got it when: clean at 70+ with the "a" finger landing right on its beat — drop back to 60 if it falls apart. This steady-pattern check is the Set 2 check-off.',
            hint: 'The most common mistake: the "a" finger lags. Pay extra attention to your ring finger — it needs to land exactly on its beat, no later. Set the ⏱ Timer for 2 minutes and loop it.',
            stuck: 'Go back to 60 BPM and stay there until it\'s effortless — a clean 60 beats a sloppy 80 every time.',
            levelUp: 'Push past 80 BPM, or play the pattern over Am at the same tempo with the thumb relocating.',
            skills: [2, 5],
            response: { type: 'short', prompt: 'Personal record: win at 70 BPM, then raise the metronome +10 at a time. Your fastest CLEAN, even pattern today (BPM)?', placeholder: 'e.g. 90 — beat it next session' }
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — "the cure", verse: play the 6-note p-i-m-a-m-i pattern over the verse loop — Am · C · F, one bar each at 60 BPM. Thumb: A string for Am and C, D string for F; i-m-a never leave G-B-e. You\'ve got it when: one full lap with the pattern unbroken at both changes.',
                hint: 'Two of the three bass notes live on the SAME string — only the F asks the thumb to travel. The fingers never move at all.',
                stuck: 'Loop Am → C until the thumb finds fret 3 without looking, then add the F.',
                levelUp: 'Hum the melody over your own picking — this is the actual sound of the record.',
                skills: [4, 6],
                playSeq: { label: '"the cure" verse bass roots — Am · C · F', bpm: 60, notes: [45, 48, 53] },
                response: { type: 'short', prompt: 'Which change broke the pattern more — Am→C or C→F?', placeholder: 'e.g. C→F — the thumb overshoots the D string' }
              }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'What\'s your honest top clean tempo right now, and which finger gives out first when you push it? Write it below — that\'s your warm-up target next time.',
                response: { type: 'short', placeholder: 'e.g. clean to 80, then the ring finger starts dragging behind the beat' }
              }
            ]
          },
          {
            title: '⚡ Ear Spark — optional ear bonus',
            steps: [
              {
                text: '⚡ Ear Spark (optional, 2 min): fingerpick Am leading with the thumb on either the A string or the D string — a few reps in a shuffled slip order, recorded. On playback, name which string the bass note was each time — low vs high bass is a fingerpicker\'s first ear skill. Got someone around? Have them pick while you listen.'
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Plays p-i-m-a-m-i pattern cleanly over one chord · Even volume across all fingers · Pattern stays steady at 70 BPM · Adapts to a different chord by moving only the thumb',
      performance: 'Play the 6-note pattern over Em for 4 bars, then Am for 4 bars, at 70 BPM. Record yourself and listen back for even volume on every finger.',
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
    skillFocus: 'Fingerpicking through a chord progression · An intro to Travis picking · Performing a fingerpicked song',
    comingSoon: false,

    stations: {
      b: {
        title: 'Computer station — Watch · Listen · Practice',        sections: [
          {
            title: 'Watch the lesson videos',
            steps: [
          {
            text: 'Watch: <a href="https://youtu.be/rGt-lMXYzZc" target="_blank">Folk Fingerstyle Patterns #1 — Travis Picking (FO-101) – JustinGuitar</a> (0:00–4:00). As you watch, tap the alternating thumb on your knee — bass on 1, the other bass on 3 — before you ever add the fingers.',
            hint: 'Travis picking uses an ALTERNATING thumb: bass note on beat 1, a different bass note on beat 3. The fingers fill in between. It\'s the foundation of country, folk, and a lot of pop.',
            skills: [1, 2],
            response: { type: 'mc', prompt: 'In Travis picking, what does the THUMB do?',
              answer: 1,
              explain: 'The Travis "engine" is the thumb alternating between two bass strings (usually the root and the 5th) in steady time, while the fingers add melody on top.',
              choices: [
              'Plays the same bass note over and over',
              'Alternates between two bass notes — usually the root and the 5th',
              'Doesn\'t play at all',
              'Plays the melody'
            ] }
          },
          {
            text: 'Watch: <a href="https://youtu.be/7silbMA9UME" target="_blank">Nothing Else Matters Guitar Lesson Part 1 – Marty Music</a> (0:00–4:00). Watch one chord change closely — notice when his fretting hand starts moving toward the next shape.',
            hint: 'The hardest part: keeping the picking pattern PERFECTLY STEADY through a chord change. Anticipate the next chord — start moving your fretting hand on the LAST note of the current bar.',
            skills: [3, 4],
            response: { type: 'short', placeholder: 'When you fingerpick from Am to C, when (which note in the bar) does your fretting hand start preparing for the next chord?' }
          }
            ]
          },
          {
            title: 'Listen through a full verse',
            steps: [
          {
            text: 'Listen to one of: "House of the Rising Sun", "Dust in the Wind", or "Hallelujah". Listen to a full verse. Can you hear when the chord changes? Does the pattern ever break?',
            hint: 'In professional recordings the pattern almost never breaks at a chord change — that\'s your standard. It\'s a high bar but worth aiming for.',
            skills: [4, 5],
            response: { type: 'short', placeholder: 'Which song did you listen to? Did the picking pattern stay completely steady through every chord change?' }
          }
            ]
          },
          {
            title: 'Try the arpeggio on C',
            steps: [
          {
            text: 'Now try it: fret C and play the 6-note arpeggio over it. Click any note below the TAB to hear it, then play the staircase — thumb on the A string\'s 3rd fret (C\'s root), i-m-a on G-B-e, then back down m-i.',
            hint: 'C uses the same picking pattern as Em and Am — only the thumb\'s bass note changes. Read the TAB left to right and match each pluck.',
            skills: [1, 3, 4],
            tab: {
              caption: 'C arpeggio · p-i-m-a-m-i · thumb on the A string (3rd fret)',
              notes: [
                { string: 'A', fret: 3, note: 'C', midi: 48 },
                { string: 'G', fret: 0, note: 'G', midi: 55 },
                { string: 'B', fret: 1, note: 'C', midi: 60 },
                { string: 'e', fret: 0, note: 'E', midi: 64 },
                { string: 'B', fret: 1, note: 'C', midi: 60 },
                { string: 'G', fret: 0, note: 'G', midi: 55 }
              ]
            }
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
          {
            text: 'Station Wrap-Up — take a beat to reflect: across the whole module, which is harder for you — keeping the picking pattern steady, or changing chords cleanly underneath it? What\'s your plan for the harder one?',
            response: { type: 'short', placeholder: 'e.g. chord changes break my pattern — I\'ll practice moving the fretting hand a beat early' }
          }
            ]
          }
        ]
      },
      c: {
        title: 'Practice station — full progressions & performance',
        sections: [
          {
            title: 'Fret each chord clean before you fingerpick it',
            steps: [
          {
            text: 'Challenge 1 — Clean Shapes First: before you fingerpick the progression, strum each chord once (Am, C, D, F) and check every string rings — these are the exact open chords you learned in Module 5. You\'ve got it when: all four shapes clean on a strum before you pick a single note through them.',
            hint: 'Fingerpicking exposes every note, so a chord that was "good enough" for strumming in Module 5 needs to be truly clean here. Fix the fretting hand first; then the picking hand has something solid to work over.',
            stuck: 'Whichever shape buzzes, fix just that one — adjust your finger angle so the fingertip (not the pad) presses just behind the fret.',
            levelUp: 'Fret each shape, lift off, and re-fret it cleanly 5 times in a row before moving to the next chord.',
            skills: [1]
          }
            ]
          },
          {
            title: 'Fingerpick a full chord progression',
            steps: [
          {
            text: 'Challenge 2 — Full Progression: play the 6-note arpeggio over a 4-chord progression — Am–C–D–F or C–Am–F–G — 1 bar each at 60 BPM. You\'ve got it when: the thumb finds each chord\'s root bass while the fingers stay on G-B-e.',
            hint: 'For each chord, the thumb plays the ROOT bass note (Am = A string, C = A string, D = D string, F = D string). Fingers always on G-B-e.',
            stuck: 'Drop to two chords (Am–C) and loop just that change until the pattern doesn\'t break, then add D and F.',
            levelUp: 'Run the full four-chord loop without a single broken pattern, or nudge the metronome to 70 BPM.',
            skills: [1, 3, 4],
            playSeq: { label: 'Am · C · D · F bass roots', bpm: 60,
              notes: [45, 48, 50, 53] },
            response: { type: 'short', prompt: 'Personal record: win at 60 BPM, then raise the metronome +10 at a time. Your fastest CLEAN lap of the progression today (BPM)?', placeholder: 'e.g. 75 — beat it next session' }
          }
            ]
          },
          {
            title: 'Pinch the thumb and a finger together',
            steps: [
          {
            text: 'Challenge 3 — The Pinch: fret C and "pinch" two strings at once — thumb on the A string (root) and your "a" finger on the high e, plucked at the SAME instant, on each beat for 8 beats. You\'ve got it when: both notes sound together as one, perfectly in sync — not one slightly before the other.',
            hint: 'A pinch is the bridge between arpeggios and Travis picking — thumb and finger move toward each other and meet. Listen for ONE sound, not a flam (two close hits).',
            stuck: 'Pluck the bass and the treble separately first, slowly, then bring them closer until they land together.',
            levelUp: 'Pinch on beats 1 & 3 and fill beats 2 & 4 with a single i-pluck on the B string — that\'s the Travis groove starting to form.',
            skills: [2, 4]
          }
            ]
          },
          {
            title: 'Try Travis picking',
            steps: [
          {
            text: 'Challenge 4 — Travis Thumb: warm up Travis picking on C — thumb alternating the A string (beats 1 & 3) and G string (beats 2 & 4), thumb-only at 60 BPM. You\'ve got it when: a steady, even alternating thumb — then add an i-pluck on the B string on each "+".',
            hint: 'Just the thumb! Once that\'s steady, add an i-pluck on the B string on the "+" of each beat. Travis picking adds fingers ON TOP of an already-grooving thumb.',
            stuck: 'Thumb only, no fingers, as slow as you need — get the alternating bass rock-steady before adding anything on top.',
            levelUp: 'Add the i-pluck on every "+", or carry the alternating thumb through a C → Am change without it stumbling.',
            skills: [2, 5]
          }
            ]
          },
          {
            title: 'Take It to a Song',
            steps: [
              {
                text: 'Challenge — Let It Be, fingerpicked: play the four-chord verse — C · G · Am · F — with the 6-note pattern over each chord, one bar each at 60 BPM. Thumb roots: C and Am on the A string, G on the low E, F on the D string. You\'ve got it when: a full verse with the pattern unbroken — the same song you strummed in Units 5 and 6, now a lullaby. <a href="tabs/let-it-be.html" target="_blank">&#x1F9F5; Song Journey: this is Layer 4 of 4</a>.',
                hint: 'Anticipate like Challenge 2 taught you: the fretting hand starts moving on the pattern\'s 6th note, so beat 1 always lands ready.',
                stuck: 'Strum each chord once to check it rings, then loop just C → G — the only change where the thumb crosses to the low E.',
                levelUp: 'Add a pinch (p + a together) on beat 1 of each chord and hear the verse bloom, or sing it over your own picking.',
                skills: [1, 3],
                playSeq: { label: '"Let It Be" verse bass roots — C · G · Am · F', bpm: 60, notes: [48, 43, 45, 53] }
              }
            ]
          },
          {
            title: 'Perform a fingerpicked song',
            steps: [
          {
            text: 'Challenge 5 — Perform It (your assessment piece — give it a go!): pick one song — "the cure", "Hallelujah", "Let It Be" (verse), or a choice-list song — and play it through 3 times without stopping, even with mistakes. No score — practice the recovery; keep going no matter what.',
            hint: 'Mistakes are normal — stopping is what makes them sound bad, so keep going and practice the recovery. No one to play for? Record yourself on your phone or device and watch it back — the playback shows you exactly where the pattern broke.',
            stuck: 'Pick the shortest, slowest song you know (Hallelujah is forgiving) and play just the verse — finishing matters more than difficulty.',
            levelUp: 'Perform standing up, or play it for family or a friend and keep going through any mistake.',
            skills: [4, 5, 6]
          }
            ]
          },
          {
            title: 'Station Wrap-Up',
            steps: [
              {
                text: 'You\'ve reached the end of the first half of the course — what fingerpicking skill are you proudest of, and what\'s the one song you want to keep working on after this module? Write it below.',
                response: { type: 'short', placeholder: 'e.g. proud of clean arpeggios; want to keep working on Blackbird' }
              }
            ]
          }
        ]
      }
    },

    assessment: {
      goal: 'Fingerpicks through a full 4-chord progression · Pattern stays steady through chord changes · Demonstrates Travis picking (alternating bass thumb) · Performs one full fingerpicked song from start to finish',
      performance: 'Perform one full song from the song list using fingerpicking from start to finish — for family, a friend, or a recording you share. Listen back for pattern consistency, chord changes, and timing.',
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
      { id: 'm8w3-s6', text: 'Perform a fingerpicked song for an audience (family, a friend, or a recording you share)',
        gotItWhen: 'you can perform your chosen song for someone — in person or on a recording you share — all the way through, with fingerpicking, and recover from any mistakes without breaking down.' }
    ]
  }

); // end module-8.js

globalThis.MODULE_SONGS = globalThis.MODULE_SONGS || {};
MODULE_SONGS[8] = [
      { name: '"the cure" — Olivia Rodrigo', meta: 'Fingerpick the verse for a soft feel · Am–C–F', type: 'Core', core: true, journeyUrl: 'tabs/the-cure.html',
        originalUrl: 'https://www.youtube.com/watch?v=B402rKl4bUg',
        tutorialUrl: 'https://www.youtube.com/watch?v=adW_zSkClaY' },
      { name: '"Let It Be" — The Beatles', meta: 'Fingerpick the verse · C–G–Am–F', type: 'Core', core: true, journeyUrl: 'tabs/let-it-be.html',
        originalUrl: 'https://www.youtube.com/watch?v=CGj85pVzRJs',
        tutorialUrl: 'https://www.youtube.com/watch?v=_Kw4subj5z8' },
      { name: '"House of the Rising Sun" — The Animals', meta: 'Am–C–D–F–Am–C–E–E · the classic fingerpicked song', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=N4bFqW_eu2I',
        tutorialUrl: 'https://www.youtube.com/watch?v=q9dyAQLYybU' },
      { name: '"Sailor Song" — Gigi Perez', meta: 'Fingerpicked verse · capo IV (G-shapes)', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=1lrFsXkT_rM',
        tutorialUrl: 'https://www.youtube.com/watch?v=rpoyXduMZZw' },
      { name: '"Blackbird" — The Beatles', meta: 'Advanced fingerpicking · course capstone challenge', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=Man4Xw8Xypo',
        tutorialUrl: 'https://www.youtube.com/watch?v=Qqw15309knU' },
      { name: '"Tu Boda" — Oscar Maydon × Fuerza Regida', meta: 'Sierreño-style fingerpicking', type: 'Choice', core: false, level: 3,
        originalUrl: 'https://www.youtube.com/watch?v=_ymicn0_GYc',
        tutorialUrl: 'https://www.youtube.com/watch?v=AlElh28IumI' },
      { name: '"Just Like Heaven" — The Cure', meta: 'Iconic arpeggiated intro riff — dreamy chord-picking', type: 'Choice', core: false, level: 2,
        originalUrl: 'https://www.youtube.com/watch?v=n3nPiBai66M',
        tutorialUrl: 'https://www.youtube.com/watch?v=fEgsKS_IcQA' }
    ];

MODULE_REVIEWS[8] = {
  moduleNum: 8,
  module: 'Finger Picking',
  skills: [
    { id: 'mr8-s1', text: 'I can hold a relaxed fingerpicking hand — wrist arched, fingers curved — for 30 seconds without it collapsing flat', set: 'm8w1' },
    { id: 'mr8-s2', text: 'I can assign p to the bass strings and i-m-a to G-B-e, and put any finger on its string without looking', set: 'm8w1' },
    { id: 'mr8-s3', text: 'I can pluck p-i-m-a in order on open strings at 60 BPM with even volume on every finger, including the ring (a)', set: 'm8w2' },
    { id: 'mr8-s4', text: 'I can play the 6-note p-i-m-a-m-i arpeggio from memory while holding a chord, every note ringing clean', set: 'm8w2' },
    { id: 'mr8-s7', text: 'I can fingerpick a full 4-chord progression without the pattern breaking at any chord change', set: 'm8w3' },
    { id: 'mr8-s9', text: 'I can perform a full fingerpicked song start to finish, recovering from any mistake without stopping', set: 'm8w3' }
  ],
  assessItems: [
    'Fingerpick a 4-chord progression with the 6-note arpeggio, keeping the pattern unbroken through every chord change',
    'Perform one full fingerpicked song from the song list start to finish, recovering from any mistakes without stopping'
  ],
  forward: 'You\'ve got the full first-half toolkit — notes, chords, power chords, lead, barre, strumming, and fingerpicking. <strong>The second half of the course goes deeper:</strong> Module 9 finishes the fretboard (all six strings) and teaches you to write your own TAB — the first step toward learning any song on your own.',
  standards: ['Pr.4a', 'Pr.5a', 'Pr.6a']
};
